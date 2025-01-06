function shouldUpdate() {
	return !usingRealTimeOffline || loops % 600 === 0;
}

function liquifiedZone() {
	return game.global.gridArray && game.global.gridArray[0] && game.global.gridArray[0].name === 'Liquimp';
}

/* cleaner way to code multipliers in the actual functions */
function applyMultipliers(multipliers, stat, challenge, postChallengeCheck) {
	Object.keys(multipliers).forEach((key) => {
		if (challenge && postChallengeCheck && key === 'Nurture' && game.challenges.Nurture.boostsActive()) stat *= multipliers[key]();
		else if (challenge) stat *= challengeActive(key) ? multipliers[key]() : 1;
		else stat *= multipliers[key]();
	});

	return stat;
}

/* cleaner way to code daily multipliers in the actual functions */
function applyDailyMultipliers(modifier, value = 1) {
	const dailyChallenge = game.global.dailyChallenge;
	if (typeof dailyChallenge[modifier] === 'undefined') return value;
	return dailyModifiers[modifier].getMult(dailyChallenge[modifier].strength, dailyChallenge[modifier].stacks);
}

/* 	no longer draws during TW.
	solves the innerHTML being redrawn every time this is called instead of only when there's changes 
	the force parameter is just used for AT to dispalay UI inside of TW */
function drawAllBuildings(force) {
	if (usingRealTimeOffline && !force) return;

	const buildings = game.buildings;
	const elem = document.getElementById('buildingsHere');
	let innerHTML = '';
	let alert = false;

	for (const item in buildings) {
		const building = buildings[item];
		if (building.locked) continue;
		if (building.alert) alert = true;
		innerHTML += drawBuilding(item);
	}

	if (elem.innerHTML !== innerHTML) elem.innerHTML = innerHTML;
	if (alert && elem.innerHTML !== '' && game.options.menu.showAlerts.enabled) {
		const alertElem = document.getElementById('buildingsAlert');
		if (alertElem.innerHTML !== '!') alertElem.innerHTML = '!';
	}

	updateGeneratorInfo();
}

/* 	stops this being called in TW. Runs up to displaying the UI then doesn't allow the timer code to run
	removes innerHTML updates happening every tick outside of TW */
function updateGeneratorInfo() {
	if (!mutations.Magma.active()) return;

	const elem = document.getElementById('generatorWindow');
	if (!elem) {
		document.getElementById('buildingsHere').innerHTML += getGeneratorHtml(true);
	}

	changeGeneratorState(null, true);
	const hybridBtn = document.getElementById('generatorHybridBtn');
	const stateConfigBtn = document.getElementById('generatorStateConfigBtn');

	if (game.permanentGeneratorUpgrades.Hybridization.owned && hybridBtn.style.display !== 'inline-block') {
		hybridBtn.style.display = 'inline-block';
	}

	if (game.permanentGeneratorUpgrades.Supervision.owned && stateConfigBtn.style.display !== 'inline-block') {
		stateConfigBtn.style.display = 'inline-block';
	}

	if (!shouldUpdate()) return;

	updateGeneratorFuel();

	const generatorTrimps = document.getElementById('generatorTrimpsPs');
	const nextTickAmount = getGeneratorTickAmount();
	const generatorTrimpsText = prettify(scaleNumberForBonusHousing(nextTickAmount));
	if (generatorTrimps.innerHTML != generatorTrimpsText) generatorTrimps.innerHTML = generatorTrimpsText;

	const totalMi = document.getElementById('upgradeMagmiteTotal');
	const totalMiText = `${prettify(game.global.magmite)} Mi`;
	if (totalMi.innerHTML !== totalMiText) totalMi.innerHTML = totalMiText;
}

/* inserts alter icon into this function instead of the drawAllBuildings one so that an innerHTML update is removed from every building */
function drawBuilding(what) {
	const alertMessage = what.alert && game.options.menu.showAlerts.enabled ? '!' : '';
	if (usingScreenReader) {
		return `
			<button class="thing noSelect pointer buildingThing" onclick="tooltip('${what}','buildings','screenRead')">${what} Info</button>
			<button title="" onmouseout="tooltip('hide')" class="thingColorCanNotAfford thing noselect pointer buildingThing" id="${what}" onclick="buyBuilding('${what}')">
				<span class="thingName"><span id="${what}Alert" class="alert badge">${alertMessage}</span>${what}</span>, 
				<span class="thingOwned" id="${what}Owned">${game.buildings[what].owned}</span>
				<span class="cantAffordSR">, Not Affordable</span>
				<span class="affordSR">, Can Buy</span>
			</button>`;
	}

	return `<div onmouseover="tooltip('${what}','buildings',event)" onmouseout="tooltip('hide')" class="thingColorCanNotAfford thing noselect pointer buildingThing" id="${what}" onclick="buyBuilding('${what}')">
			<span class="thingName">
			<span id="${what}Alert" class="alert badge">${alertMessage}</span>${what}</span><br/>
			<span class="thingOwned" id="${what}Owned">${game.buildings[what].owned}</span>
		</div>`;
}

/* 	reduce innerHTML updates
	removes the game from randomly displaying 30 of each golden upgrade
	displayGoldenUpgrades function also needs to be used. */
function drawAllUpgrades(force) {
	if (usingRealTimeOffline && !force) {
		goldenUpgradesShown = true;
		displayGoldenUpgrades();
		return;
	}

	const upgrades = game.upgrades;
	const elem = document.getElementById('upgradesHere');
	let innerHTML = '';
	let alert = false;

	for (const item in upgrades) {
		if (upgrades[item].locked) continue;
		if (upgrades[item].alert) alert = true;
		innerHTML += drawUpgrade(item);
	}

	if (elem.innerHTML !== innerHTML) elem.innerHTML = innerHTML;
	if (alert && elem.innerHTML !== '' && game.options.menu.showAlerts.enabled) {
		const alertElem = document.getElementById('upgradesAlert');
		if (alertElem.innerHTML !== '!') alertElem.innerHTML = '!';
	}

	goldenUpgradesShown = false;
	displayGoldenUpgrades();
}

/* same as drawBuilding, reduce innerHTML updates and integreate alert icon into a buildings html check */
function drawUpgrade(what) {
	const alertMessage = what.alert && game.options.menu.showAlerts.enabled ? '!' : '';
	const upgrade = game.upgrades[what];

	if (upgrade.prestiges && (!upgrade.cost.resources[metal] || !upgrade.cost.resources[wood])) {
		const resName = what === 'Supershield' ? 'wood' : 'metal';
		upgrade.cost.resources[resName] = getNextPrestigeCost(what);
	}

	let done = upgrade.done;
	let dif = upgrade.allowed - done - 1;
	let name = typeof upgrade.name !== 'undefined' ? upgrade.name : what;
	let html;

	if (upgrade.isRelic) done = game.challenges.Archaeology.getPoints(upgrade.relic);
	else if (dif >= 1) done += `(+${dif})`;

	if (usingScreenReader) {
		html = `<button id="srTooltip${what}" class="thing noSelect pointer upgradeThing" onclick="tooltip('${what}','upgrades','screenRead')">${what} Info</button>
			<button onmouseover="tooltip('${what}','upgrades',event)" onmouseout="tooltip('hide')" class="thingColorCanNotAfford thing noselect pointer upgradeThing" id="${what}" onclick="buyUpgrade('${what}')">
				<span id="${what}Alert" class="alert badge">${alertMessage}</span>
				<span class="thingName">${name}</span>, 
				<span class="thingOwned" id="${what}Owned">${done}</span>
				<span class="cantAffordSR">, Not Affordable</span>
				<span class="affordSR">, Can Buy</span>
			</button>`;
	} else {
		html = `<div onmouseover="tooltip('${what}','upgrades',event)" onmouseout="tooltip('hide')" class="thingColorCanNotAfford thing noselect pointer upgradeThing" id="${what}" onclick="buyUpgrade('${what}')">
			<span id="${what}Alert" class="alert badge">${alertMessage}</span>
			<span class="thingName">${name}</span><br/>
			<span class="thingOwned" id="${what}Owned">${done}</span>
		</div>`;
	}

	return html;
}

/* 	stops lockOnUnlock from running during TW as a 1s delay is harmful
	cant remember if I done anything else */
function buyUpgrade(what, confirmed, noTip, heldCtrl) {
	if (game.options.menu.pauseGame.enabled) return;
	if (!confirmed && !noTip && !usingRealTimeOffline && game.options.menu.lockOnUnlock.enabled === 1 && new Date().getTime() - 1000 <= game.global.lastUnlock) return;

	if (what === 'Coordination') {
		if (!canAffordCoordinationTrimps()) {
			return false;
		}
	}

	const upgrade = game.upgrades[what];
	if (upgrade.locked == 1) {
		return;
	}

	const usingCtrl = typeof heldCtrl !== 'undefined' ? heldCtrl : game.options.menu.ctrlGigas.enabled && what === 'Gigastation' ? true : ctrlPressed;
	if (upgrade.isRelic && usingCtrl && !noTip) {
		tooltip('Archaeology Automator', null, 'update');
		return;
	}

	if (upgrade.isRelic && game.challenges.Archaeology.getPoints(game.upgrades[what].relic) >= 50) {
		return;
	}

	let canAfford = canAffordTwoLevel(upgrade);
	if (!canAfford) {
		return false;
	}

	if (what === 'Gigastation' && !confirmed && !noTip && game.options.menu.confirmhole.enabled) {
		tooltip('Confirm Purchase', null, 'update', 'You are about to purchase a Gigastation, <b>which is not a renewable upgrade</b>. Make sure you have purchased all of the Warpstations you can afford first!', "buyUpgrade('Gigastation', true, false, " + usingCtrl + ')');
		return;
	}

	if (what === 'Shieldblock' && !confirmed && game.options.menu.confirmhole.enabled && getHighestLevelCleared() >= 30) {
		tooltip('Confirm Purchase', null, 'update', 'You are about to modify your Shield, causing it to block instead of grant health until your next portal. Are you sure?', "buyUpgrade('Shieldblock', true)");
		return;
	}

	canAfford = canAffordTwoLevel(upgrade, true);
	if (upgrade.isRelic) {
		game.challenges.Archaeology.buyRelic(what, noTip);
		return;
	}

	upgrade.fire(usingCtrl, noTip);
	upgrade.done++;

	if (upgrade.prestiges) {
		const resName = what === 'Supershield' ? 'wood' : 'metal';
		upgrade.cost.resources[resName] = getNextPrestigeCost(what);
	}

	if (upgrade.allowed - upgrade.done <= 0) {
		upgrade.locked = 1;
	}

	let dif = upgrade.allowed - upgrade.done;
	const ownedElem = document.getElementById(what + 'Owned');

	if (dif > 1) {
		dif -= 1;
		if (ownedElem) {
			ownedElem.innerHTML = upgrade.done + '(+' + dif + ')';
		}
		if (!noTip) {
			tooltip(what, 'upgrades', 'update');
		}
		return true;
	} else if (dif === 1) {
		if (!noTip) {
			tooltip(what, 'upgrades', 'update');
		}
		if (ownedElem) {
			ownedElem.innerHTML = upgrade.done;
		}
		return true;
	}

	const upgradesHereElem = document.getElementById('upgradesHere');
	const removeElem = document.getElementById(what);

	if (removeElem) {
		upgradesHereElem.removeChild(removeElem);
	}

	if (usingScreenReader) {
		const tooltipElem = document.getElementById('srTooltip' + what);
		if (tooltipElem) upgradesHereElem.removeChild(tooltipElem);
	}

	if (!noTip) {
		tooltip('hide');
	}

	return true;
}

/* 	stops this from running during TW
	improves innerHTML calls outside of TW by only updating if anything has changed */
function drawAllEquipment(force) {
	if (usingRealTimeOffline && !force) return;

	const equipment = game.equipment;
	const elem = document.getElementById('equipmentHere');
	let innerHTML = '';

	for (const item in equipment) {
		if (equipment[item].locked) continue;
		innerHTML += drawEquipment(item);
	}

	if (elem.innerHTML !== innerHTML) elem.innerHTML = innerHTML;

	displayEfficientEquipment();
}

/* returns new innerHTML to drawAllEquipment so it can all be updated at once */
function drawEquipment(what) {
	let numeral = '';
	let equipment = game.equipment[what];
	if (equipment.prestige > 1) numeral = usingScreenReader ? prettify(equipment.prestige) : romanNumeral(equipment.prestige);

	if (usingScreenReader) {
		return `
			<button class="thing noSelect pointer" onclick="tooltip('${what}','equipment','screenRead')">${what} Info</button>
			<button onmouseover="tooltip('${what}','equipment',event)" onmouseout="tooltip('hide')" class="noselect pointer thingColorCanNotAfford thing" id="${what}" onclick="buyEquipment('${what}')">
				<span class="thingName">${what} <span id="${what}Numeral">${numeral}</span></span>, 
				<span class="thingOwned">Level: <span id="${what}Owned">${equipment.level}</span></span>
				<span class="cantAffordSR">, Not Affordable</span>
				<span class="affordSR">, Can Buy</span>
			</button>`;
	}
	return `<div 
				onmouseover="tooltip('${what}','equipment',event)" onmouseout="tooltip('hide')" class="efficientNo noselect pointer thingColorCanNotAfford thing" id="${what}" onclick="buyEquipment('${what}')">
				<span class="thingName">${what} <span id="${what}Numeral">${numeral}</span></span><br/>
				<span class="thingOwned">Level: <span id="${what}Owned">${equipment.level}</span></span>
			</div>`;
}

/* 	only updated jobAlert icon once, at the end
	update all job innerHTMLs once instead 1 update per job */
function drawAllJobs(force) {
	if (usingRealTimeOffline && !force) return;

	const jobs = game.jobs;
	const elem = document.getElementById('jobsHere');
	let innerHTML = '';
	let alert = false;
	let geneticist = false;

	for (const item in jobs) {
		if (jobs[item].locked) continue;
		if (item === 'Geneticist' && game.global.Geneticistassist) {
			innerHTML += drawGeneticistassist(item);
			geneticist = true;
		} else {
			innerHTML += drawJob(item);
		}
		if (jobs[item].alert) alert = true;
	}

	if (elem.innerHTML !== innerHTML) elem.innerHTML = innerHTML;
	if (alert && elem.innerHTML !== '' && game.options.menu.showAlerts.enabled) {
		const alertElem = document.getElementById('jobsAlert');
		if (alertElem.innerHTML !== '!') alertElem.innerHTML = '!';
	}
	if (geneticist) toggleGeneticistassist(true);
}

/* returns new innerHTML to drawAllJobs so it can all be updated at once */
function drawJob(what) {
	const alertMessage = what.alert && game.options.menu.showAlerts.enabled ? '!' : '';

	if (usingScreenReader) {
		return `
			<button class="thing noSelect pointer jobThing" onclick="tooltip('${what}','jobs','screenRead')">${what} Info</button>
			<button onmouseover="tooltip('${what}','jobs',event)" onmouseout="tooltip('hide')" class="thingColorCanNotAfford thing noselect pointer jobThing" id="${what}" onclick="buyJob('${what}')">
				<span class="thingName"><span id="${what}Alert" class="alert badge">${alertMessage}</span>${what}</span>, 
				<span class="thingOwned" id="${what}Owned">0</span>
				<span class="cantAffordSR">, Not Affordable</span>
				<span class="affordSR">, Can Buy</span>
			</button>`;
	}
	return `<div onmouseover="tooltip('${what}','jobs',event)" onmouseout="tooltip('hide')" class="thingColorCanNotAfford thing noselect pointer jobThing" id="${what}" onclick="buyJob('${what}')">
				<span class="thingName"><span id="${what}Alert" class="alert badge">${alertMessage}</span>${what}</span><br/>
				<span class="thingOwned" id="${what}Owned">0</span>
			</div>`;
}

/* returns new innerHTML to drawAllJobs so it can all be updated at once */
function drawGeneticistassist(what) {
	const alertMessage = what.alert && game.options.menu.showAlerts.enabled ? '!' : '';
	if (usingScreenReader) {
		return `<button class="thing noSelect pointer jobThing" onclick="tooltip('Geneticist','jobs','screenRead')">Geneticist Info</button><button onmouseover="tooltip('Geneticist','jobs',event)" onmouseout="tooltip('hide')" class="thingColorCanNotAfford thing noselect pointer jobThing" id="Geneticist" onclick="buyJob('Geneticist')"><span class="thingName"><span id="GeneticistAlert" class="alert badge">${alertMessage}</span>Geneticist</span><br/><span class="thingOwned" id="GeneticistOwned">0</span></button><button class="thing noSelect pointer jobThing"  onclick="tooltip('Geneticistassist',null,'screenRead')">Geneticistassist Info</button><button onmouseover="tooltip('Geneticistassist',null,event)" onmouseout="tooltip('hide')" class="thing thingColorNone noselect stateHappy pointer jobThing" id="Geneticistassist" onclick="toggleGeneticistassist()">Geneticistassist<span id="GAIndicator"></span><br/><span id="GeneticistassistSetting">&nbsp;</span></button>`;
	}

	return `<div id="GeneticistassistContainer" class="thing"><div onmouseover="tooltip('Geneticist','jobs',event)" onmouseout="tooltip('hide')" class="thingColorCanNotAfford thing noselect pointer jobThing" id="Geneticist" onclick="buyJob('Geneticist')"><span class="thingName"><span id="GeneticistAlert" class="alert badge">${alertMessage}</span>Geneticist</span><br/>
	<span class="thingOwned" id="GeneticistOwned">0</span></div><div onmouseover="tooltip('Geneticistassist',null,event)" onmouseout="tooltip('hide')" class="thing thingColorNone noselect stateHappy pointer jobThing" id="Geneticistassist" onclick="toggleGeneticistassist()">Geneticistassist<span id="GAIndicator"></span><br/><span id="GeneticistassistSetting">&nbsp;</span></div></div>`;
}

function dropPrestiges() {
	const toDrop = addSpecials(true, true, null, true);
	const sci4 = getSLevel() >= 4 && !challengeActive('Mapology');

	for (let x = 0; x < toDrop.length; x++) {
		unlockUpgrade(toDrop[x]);
		let prestigeUnlock = game.mapUnlocks[toDrop[x]];
		if (sci4 && Math.ceil(prestigeUnlock.last / 5) % 2 === 0) {
			unlockUpgrade(toDrop[x]);
			prestigeUnlock.last += 10;
		} else {
			prestigeUnlock.last += 5;
		}
	}

	if (liquifiedZone()) drawAllUpgrades();
}

function updateLabels(force) {
	//Tried just updating as something changes, but seems to be better to do all at once all the time
	if (usingRealTimeOffline && !force) return;
	//Resources (food, wood, metal, trimps, science). Per second will be handled in separate function, and called from job loop.
	checkAndDisplayResources();
	updateSideTrimps();
	//Buildings, trap is the only unique building, needs to be displayed in trimp area as well
	checkAndDisplayBuildings();
	//Jobs, check PS here and stuff. Trimps per second is handled by breed function
	checkAndDisplayJobs();
	//Upgrades, owned will only exist if 'allowed' exists on object
	checkAndDisplayUpgrades();
	//Equipment
	checkAndDisplayEquipment();
}

function updateAllInnerHtmlFrames() {
	if (mutations.Magma.active()) updateGeneratorInfo();
	updateTurkimpTime(true);

	if (challengeActive('Balance') || challengeActive('Unbalance')) updateBalanceStacks();
	if (challengeActive('Electricity') || challengeActive('Mapocalypse')) updateElectricityStacks();
	if (challengeActive('Life')) updateLivingStacks();
	if (challengeActive('Nom')) updateNomStacks();
	if (challengeActive('Toxicity')) updateToxicityStacks();
	if (challengeActive('Lead')) manageLeadStacks();

	if (game.global.antiStacks > 0) updateAntiStacks();
	updateTitimp();
	if (getHeirloomBonus('Shield', 'gammaBurst') > 0) updateGammaStacks();
	setEmpowerTab();
	handlePoisonDebuff();
	handleIceDebuff();
	handleWindDebuff();

	if (!usingRealTimeOffline) {
		updateSideTrimps();
		gather();
		breed();
		updateAllBattleNumbers();
		setVoidCorruptionIcon();

		if (!game.global.preMapsActive && game.global.mapBonus > 0) {
			let innerText = game.global.mapBonus;
			if (game.talents.mapBattery.purchased && game.global.mapBonus === 10) innerText = "<span class='mapBonus10'>" + innerText + '</span>';
			const mapBtnElem = document.getElementById('mapsBtnText');
			const mapBtnText = `Maps (${innerText})`;
			if (mapBtnElem.innerHTML !== mapBtnText) mapBtnElem.innerHTML = mapBtnText;
		}
	}

	let cell, cellNum;
	if (game.global.mapsActive) {
		cellNum = game.global.lastClearedMapCell + 1;
		cell = game.global.mapGridArray[cellNum];
	} else {
		cellNum = game.global.lastClearedCell + 1;
		cell = game.global.gridArray[cellNum];
	}

	const badAttackElem = document.getElementById('badGuyAttack');
	const badAttackText = calculateDamage(cell.attack, true, false, false, cell);
	if (badAttackElem.innerHTML != badAttackText) badAttackElem.innerHTML = badAttackText;

	const goodAttackElem = document.getElementById('goodGuyAttack');
	const goodAttackText = calculateDamage(game.global.soldierCurrentAttack, true, true);
	if (goodAttackElem.innerHTML != goodAttackText) goodAttackElem.innerHTML = goodAttackText;
}

function updateSideTrimps() {
	const trimps = game.resources.trimps;
	const realMax = trimps.realMax();

	let elem = document.getElementById('trimpsEmployed');
	let elemText = prettify(trimps.employed);
	if (elem.innerHTML != elemText && shouldUpdate()) elem.innerHTML = elemText;

	const multitaskingMult = game.permaBoneBonuses.multitasking.owned ? game.permaBoneBonuses.multitasking.mult() : 0;
	const breedEmployed = trimps.employed * (1 - multitaskingMult);
	const breedCount = trimps.owned - breedEmployed > 2 ? prettify(Math.floor(trimps.owned - breedEmployed)) : 0;

	elem = document.getElementById('trimpsUnemployed');
	elemText = breedCount;
	if (elem.innerHTML != elemText && shouldUpdate()) elem.innerHTML = elemText;

	elem = document.getElementById('maxEmployed');
	elemText = prettify(Math.ceil(realMax / 2));
	if (elem.innerHTML != elemText && shouldUpdate()) elem.innerHTML = elemText;

	let free = Math.ceil(realMax / 2) - trimps.employed;
	if (free < 0) free = 0;
	const s = free > 1 ? 's' : '';

	elem = document.getElementById('jobsTitleUnemployed');
	elemText = `${prettify(free)} workspace${s}`;
	if (elem.innerHTML !== elemText && shouldUpdate()) elem.innerHTML = elemText;
}

function checkAndDisplayResources() {
	for (const item in game.resources) {
		let toUpdate = game.resources[item];
		if (!(toUpdate.owned > 0)) {
			toUpdate.owned = parseFloat(toUpdate.owned);
			if (!(toUpdate.owned > 0)) toUpdate.owned = 0;
		}
		if (item === 'radon') continue;
		if (item === 'helium' && game.global.universe === 2) toUpdate = game.resources.radon;

		let elem = document.getElementById(`${item}Owned`);
		let elemText = prettify(Math.floor(toUpdate.owned));
		if (elem.innerHTML != elemText) elem.innerHTML = elemText;

		if (toUpdate.max === -1 || !document.getElementById(`${item}Max`)) continue;
		let newMax = toUpdate.max;
		if (item !== 'trimps') newMax = calcHeirloomBonus('Shield', 'storageSize', newMax * (game.portal.Packrat.modifier * getPerkLevel('Packrat') + 1));
		else newMax = toUpdate.realMax();

		elem = document.getElementById(`${item}Max`);
		elemText = prettify(newMax);
		if (elem.innerHTML != elemText) elem.innerHTML = elemText;

		const bar = document.getElementById(`${item}Bar`);
		if (game.options.menu.progressBars.enabled) {
			const percentToMax = (toUpdate.owned / newMax) * 100;
			swapClass('percentColor', getBarColorClass(100 - percentToMax), bar);
			bar.style.width = `${percentToMax}%`;
		}
	}
}

function checkAndDisplayBuildings() {
	for (const item in game.buildings) {
		let toUpdate = game.buildings[item];
		if (toUpdate.locked === 1) continue;
		let elem = document.getElementById(`${item}Owned`);
		if (!elem) {
			unlockBuilding(item);
			elem = document.getElementById(`${item}Owned`);
		}
		if (!elem) continue;
		let elemText = game.options.menu.menuFormatting.enabled ? prettify(toUpdate.owned) : toUpdate.owned;
		if (elem.innerHTML != elemText) elem.innerHTML = elemText;
		if (item === 'Trap') {
			const trap1 = document.getElementById('trimpTrapText');
			if (trap1 && trap1.innerHTML != elemText) trap1.innerHTML = elemText;
			const trap2 = document.getElementById('trimpTrapText2');
			if (trap2 && trap2.innerHTML != elemText) trap2.innerHTML = elemText;
		}
	}
}

function checkAndDisplayJobs() {
	const jobs = game.jobs;
	for (const item in jobs) {
		let toUpdate = jobs[item];
		if (toUpdate.locked === 1) {
			if (toUpdate.increase === 'custom') continue;
			if (game.resources[toUpdate.increase].owned > 0) updatePs(toUpdate, false, item);
			continue;
		}

		if (document.getElementById(item) === null) {
			unlockJob(item);
			drawAllJobs(true);
		}

		let elem = document.getElementById(`${item}Owned`);
		let elemText = game.options.menu.menuFormatting.enabled ? prettify(toUpdate.owned) : toUpdate.owned;
		if (elem.innerHTML != elemText) elem.innerHTML = elemText;
		updatePs(toUpdate, false, item);
	}
}

function checkAndDisplayUpgrades() {
	const upgrades = game.upgrades;
	for (const item in upgrades) {
		let toUpdate = upgrades[item];
		if (toUpdate.allowed - toUpdate.done >= 1) toUpdate.locked = 0;
		if (toUpdate.locked === 1) continue;
		if (!document.getElementById(item)) unlockUpgrade(item, true);
	}
}

function checkAndDisplayEquipment() {
	const equipment = game.equipment;
	for (const item in equipment) {
		let toUpdate = equipment[item];
		if (toUpdate.locked === 1) continue;
		if (!document.getElementById(item)) drawAllEquipment();
		const elem = document.getElementById(`${item}Owned`);
		const elemText = toUpdate.level;
		if (elem.innerHTML != elemText) elem.innerHTML = elemText;
	}
}

function updateButtonColor(what, canAfford, isJob) {
	if (!shouldUpdate() || what === 'Amalgamator') return;

	const elem = document.getElementById(what);
	if (!elem) return;

	if (game.options.menu.lockOnUnlock.enabled === 1 && new Date().getTime() - 1000 <= game.global.lastUnlock) canAfford = false;
	if (challengeActive('Archaeology') && game.upgrades[what] && game.upgrades[what].isRelic) {
		const nextAuto = game.challenges.Archaeology.checkAutomator();
		let className = 'thingColor' + (canAfford ? 'CanAfford' : 'CanNotAfford');
		if (nextAuto === 'off') className += 'RelicOff';
		else if (nextAuto === 'satisfied') className += 'RelicSatisfied';
		else if (nextAuto === what + 'Cost') className += 'RelicNextWaiting';
		else if (nextAuto + 'Relic' === what) className += 'RelicBuying';
		swapClass('thingColor', className, elem);
		return;
	}

	if (isJob && game.global.firing) {
		if (game.jobs[what].owned >= 1) {
			//note for future self:
			//if you need to add more states here, change these to use the swapClass func -grabz
			//with 'thingColor' as first param
			swapClass('thingColor', 'thingColorFiringJob', elem);
		} else {
			swapClass('thingColor', 'thingColorCanNotAfford', elem);
		}
		return;
	}

	if (what === 'Warpstation') {
		if (canAfford) elem.style.backgroundColor = getWarpstationColor();
		else elem.style.backgroundColor = '';
	}

	if (canAfford) {
		if (what === 'Gigastation' && (ctrlPressed || game.options.menu.ctrlGigas.enabled)) swapClass('thingColor', 'thingColorCtrl', elem);
		else swapClass('thingColor', 'thingColorCanAfford', elem);
	} else {
		swapClass('thingColor', 'thingColorCanNotAfford', elem);
	}
}

function updateTurkimpTime(drawIcon = false) {
	const elem = document.getElementById('turkimpTime');

	if (game.talents.turkimp2.purchased) {
		const icon = `<span class="icomoon icon-infinity"></span>`;
		if (elem && elem.innerHTML !== icon) elem.innerHTML = icon;
		return;
	}

	if (game.global.turkimpTimer <= 0) return;

	if (!drawIcon) game.global.turkimpTimer -= 100;
	let timeRemaining = game.global.turkimpTimer;

	if (timeRemaining <= 0) {
		game.global.turkimpTimer = 0;
		document.getElementById('turkimpBuff').style.display = 'none';
		if (game.global.playerGathering) setGather(game.global.playerGathering);
		elem.innerHTML = '00:00';
		return;
	}

	timeRemaining /= 1000;
	let mins = Math.floor(timeRemaining / 60);
	let seconds = Math.ceil(timeRemaining % 60);

	if (seconds === 60) {
		seconds = 0;
		mins++;
	}

	const formattedMins = mins < 10 ? `0${mins}` : mins;
	const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
	const formattedTime = `${formattedMins}:${formattedSeconds}`;
	if (elem && elem.innerHTML !== formattedTime) elem.innerHTML = formattedTime;
}

function gather() {
	const what = game.global.playerGathering;

	if (game.talents.turkimp2.purchased || game.global.turkimpTimer > 0) {
		updateTurkimpTime();
	}

	let baseValue = 1;
	if (getPerkLevel('Motivation') > 0) baseValue += baseValue * getPerkLevel('Motivation') * game.portal.Motivation.modifier;
	if (challengeActive('Daily') && typeof game.global.dailyChallenge.dedication !== 'undefined') baseValue *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
	if (game.global.universe === 1) {
		if (getPerkLevel('Meditation') > 0) baseValue *= 1 + game.portal.Meditation.getBonusPercent() * 0.01;
		if (challengeActive('Balance')) baseValue *= game.challenges.Balance.getGatherMult();
		if (challengeActive('Meditate')) baseValue *= 1.25;
		if (challengeActive('Toxicity')) baseValue *= 1 + (game.challenges.Toxicity.lootMult * game.challenges.Toxicity.stacks) / 100;
		if (challengeActive('Watch')) baseValue /= 2;
		if (challengeActive('Lead') && game.global.world % 2 === 1) baseValue *= 2;
		if (getPerkLevel('Motivation_II') > 0) baseValue *= 1 + getPerkLevel('Motivation_II') * game.portal.Motivation_II.modifier;
		if (challengeActive('Frigid')) baseValue *= game.challenges.Frigid.getShatteredMult();
	}

	if (game.global.universe === 2) {
		if (game.portal.Observation.trinkets > 0) baseValue *= game.portal.Observation.getMult();
		if (Fluffy.isRewardActive('gatherer')) baseValue *= 2;
		if (challengeActive('Downsize')) baseValue *= 5;
		if (challengeActive('Unbalance')) baseValue *= game.challenges.Unbalance.getGatherMult();
		if (game.challenges.Nurture.boostsActive()) baseValue *= game.challenges.Nurture.getResourceBoost();
		if (challengeActive('Desolation')) baseValue *= game.challenges.Desolation.trimpResourceMult();
	}

	if (challengeActive('Decay') || challengeActive('Melt')) {
		const challenge = game.challenges[game.global.challengeActive];
		baseValue *= 10;
		baseValue *= Math.pow(challenge.decayValue, challenge.stacks);
	}

	let noFragments = baseValue;
	if (game.global.pandCompletions) noFragments *= game.challenges.Pandemonium.getTrimpMult();
	if (game.global.desoCompletions) noFragments *= game.challenges.Desolation.getTrimpMult();

	if (game.global.universe === 1) {
		if (getEmpowerment() === 'Wind') noFragments *= 1 + game.empowerments.Wind.getCombatModifier();
	}

	if (game.global.universe === 2) {
		if (challengeActive('Archaeology')) noFragments *= game.challenges.Archaeology.getStatMult('science');
		if (challengeActive('Insanity')) noFragments *= game.challenges.Insanity.getLootMult();
		if (challengeActive('Desolation')) noFragments *= game.challenges.Desolation.trimpResourceMult();
	}

	const multiTaskingMult = game.permaBoneBonuses.multitasking.owned > 0 && game.resources.trimps.owned >= game.resources.trimps.realMax() ? game.permaBoneBonuses.multitasking.mult() : 0;

	for (let job in game.jobs) {
		let perSec = 0;
		let increase = game.jobs[job].increase;
		if (increase === 'custom') continue;
		if (game.jobs[job].owned > 0) {
			perSec = increase !== 'fragments' ? noFragments : baseValue;
			perSec *= game.jobs[job].owned * game.jobs[job].modifier;
			if (increase !== 'gems') perSec *= 1 + multiTaskingMult;
			if (increase === 'food' || increase === 'metal' || increase === 'wood') perSec *= getParityBonus();

			if (game.global.universe === 1) {
				if (game.jobs.Magmamancer.owned > 0 && increase === 'metal') perSec *= game.jobs.Magmamancer.getBonusPercent();
			}

			if (game.global.universe === 2) {
				if (increase !== 'fragments' && increase !== 'science') {
					if (challengeActive('Alchemy')) perSec *= alchObj.getPotionEffect('Potion of Finding');
					perSec *= alchObj.getPotionEffect('Elixir of Finding');
				}
				if (((increase === 'food' || increase === 'wood') && game.buildings.Antenna.owned >= 5) || (increase === 'metal' && game.buildings.Antenna.owned >= 15)) perSec *= game.jobs.Meteorologist.getExtraMult();
				if (challengeActive('Hypothermia') && increase === 'wood') perSec *= game.challenges.Hypothermia.getWoodMult(true);
				if (autoBattle.oneTimers.Gathermate.owned && (increase === 'food' || increase === 'metal' || increase === 'wood')) perSec *= autoBattle.oneTimers.Gathermate.getMult();
			}

			if (challengeActive('Daily')) {
				if (typeof game.global.dailyChallenge.dedication !== 'undefined') perSec *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
				if (typeof game.global.dailyChallenge.famine !== 'undefined' && increase !== 'fragments' && increase !== 'science') perSec *= dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
			}

			perSec = calcHeirloomBonus('Staff', job + 'Speed', perSec);
		}

		if (what && increase === what) {
			if ((game.talents.turkimp2.purchased || game.global.turkimpTimer > 0) && (what === 'food' || what === 'wood' || what === 'metal')) {
				const tBonus = game.talents.turkimp2.purchased ? 2 : 1.5;
				perSec *= tBonus;
			}
			perSec += getPlayerModifier();
		}

		let amount = perSec / game.settings.speed;
		if (game.options.menu.useAverages.enabled) perSec += getAvgLootSecond(increase);
		addResCheckMax(increase, amount, null, true);
		if (!shouldUpdate()) continue;
		if (game.resources[increase].max > 0) {
			const timeToFillElem = document.getElementById(increase + 'TimeToFill');
			const timeToMax = calculateTimeToMax(game.resources[increase], perSec, null, true);
			if (timeToFillElem && timeToFillElem.innerHTML !== timeToMax) timeToFillElem.textContent = timeToMax;
		}
	}

	if (challengeActive('Quest') && game.challenges.Quest.questId < 2) game.challenges.Quest.checkQuest();
	if (what === 'trimps') trapThings();
}

function getHeirloomBonus(type, mod) {
	if (!game.heirlooms[type] || !game.heirlooms[type][mod]) {
		console.log('oh noes', type, mod);
	}

	if (game.global.StaffEquipped.rarity >= 12) {
		if (mod == 'metalDrop' || mod == 'MinerSpeed') mod = 'allMetal';
		if (mod == 'woodDrop' || mod == 'LumberjackSpeed') mod = 'allWood';
		if (mod == 'foodDrop' || mod == 'FarmerSpeed') mod = 'allFood';
	}

	let bonus = game.heirlooms[type][mod].currentBonus;
	if (mod === 'gammaBurst' && game.global.ShieldEquipped && game.global.ShieldEquipped.rarity >= 10) {
		bonus = game.global.gammaMult;
	}

	if (challengeActive('Daily') && typeof game.global.dailyChallenge.heirlost !== 'undefined' && type !== 'FluffyExp' && type !== 'VoidMaps') {
		bonus *= dailyModifiers.heirlost.getMult(game.global.dailyChallenge.heirlost.strength);
	}

	return scaleHeirloomModUniverse(type, mod, bonus);
}

function scaleHeirloomModUniverse(type, modName, value) {
	if (game.global.universe === 1 || type === 'Core') return value;
	const mod = game.heirlooms[type][modName];
	if (mod.noScaleU2) return value;
	if (!(Fluffy.isRewardActive('heirloopy') && mod.heirloopy)) return value * 0.1;
	return value;
}

var breedCache = {
	inputs: {
		trimps: 0,
		book: 0,
		nursery: 0,
		venimp: 0,
		brokenPlanet: 0,
		pheromones: 0,
		quickTrimps: 0,
		dailyDysfunctional: 0,
		dailyToxic: 0,
		chalToxic: 0,
		chalArchaeology: 0,
		chalQuagmire: 0,
		voidBreed: 0,
		heirloom: 0,
		genes: 0,
		mutGeneAttack: 0,
		mutGeneHealth: 0
	},
	potencyMod: 0,
	potencyModInitial: 0,
	logPotencyMod: 0,
	minPotencyMod: new DecimalBreed(1e-15)
};

function breed() {
	const breedElem = document.getElementById('trimpsTimeToFill');
	const trimps = game.resources.trimps;
	checkAchieve('trimps', trimps.owned);

	const trimpsMax = trimps.realMax();
	let employedTrimps = trimps.employed;
	if (game.permaBoneBonuses.multitasking.owned) employedTrimps *= 1 - game.permaBoneBonuses.multitasking.mult();

	const maxBreedable = new DecimalBreed(trimpsMax).minus(employedTrimps);
	if (missingTrimps.cmp(0) < 0) missingTrimps = new DecimalBreed(0);
	let decimalOwned = missingTrimps.add(trimps.owned);
	let breeding = decimalOwned.minus(employedTrimps);
	if (breeding.cmp(2) === -1 || challengeActive('Trapper') || challengeActive('Trappapalooza')) {
		updatePs(0, true);
		if (breedElem.innerHTML !== '') breedElem.innerHTML = '';
		srLastBreedTime = '';
		return;
	}

	const challenges = {
		Daily: challengeActive('Daily'),
		Toxicity: challengeActive('Toxicity'),
		Archaeology: challengeActive('Archaeology'),
		Quagmire: challengeActive('Quagmire')
	};

	// store the inputs to potency
	let potencyModifiers = {
		trimps: trimps.potency,
		book: game.upgrades.Potency.done,
		nursery: game.buildings.Nursery.owned,
		venimp: game.unlocks.impCount.Venimp,
		brokenPlanet: game.global.brokenPlanet,
		pheromones: getPerkLevel('Pheromones'),
		quickTrimps: game.singleRunBonuses.quickTrimps.owned,
		dailyDysfunctional: challenges.Daily && typeof game.global.dailyChallenge.dysfunctional !== 'undefined' ? dailyModifiers.dysfunctional.getMult(game.global.dailyChallenge.dysfunctional.strength) : 0,
		dailyToxic: challenges.Daily && typeof game.global.dailyChallenge.toxic !== 'undefined' ? dailyModifiers.toxic.getMult(game.global.dailyChallenge.toxic.strength, game.global.dailyChallenge.toxic.stacks) : 0,
		chalToxic: challenges.Toxicity ? game.challenges.Toxicity.stacks : 0,
		chalArchaeology: challenges.Archaeology ? game.challenges.Archaeology.getStatMult('breed') : 1,
		chalQuagmire: challenges.Quagmire ? game.challenges.Quagmire.getExhaustMult() : 1,
		voidBreed: game.global.voidBuff === 'slowBreed',
		heirloom: getHeirloomBonus('Shield', 'breedSpeed'),
		genes: game.jobs.Geneticist.owned,
		mutGeneAttack: game.global.universe === 2 && u2Mutations.tree.GeneAttack.purchased,
		mutGeneHealth: game.global.universe === 2 && u2Mutations.tree.GeneHealth.purchased
	};

	let potencyMod;
	// if inputs identical to cache
	if (
		Object.keys(potencyModifiers)
			.map((k) => potencyModifiers[k] === breedCache.inputs[k])
			.every(Boolean)
	) {
		breeding = breedCache.potencyModInitial.mul(breeding);
		potencyMod = breedCache.potencyMod;
	} else {
		potencyMod = trimps.potency;
		if (potencyModifiers.book > 0) potencyMod *= Math.pow(1.1, potencyModifiers.book);
		if (potencyModifiers.nursery > 0) potencyMod *= Math.pow(1.01, potencyModifiers.nursery);
		if (potencyModifiers.venimp) potencyMod *= Math.pow(1.003, potencyModifiers.venimp);
		if (potencyModifiers.brokenPlanet) potencyMod /= 10;
		if (potencyModifiers.pheromones > 0) potencyMod *= 1 + potencyModifiers.pheromones * game.portal.Pheromones.modifier;
		if (potencyModifiers.quickTrimps) potencyMod *= 2;
		if (challenges.Daily && potencyModifiers.dailyDysfunctional > 0) potencyMod *= potencyModifiers.dailyDysfunctional;
		if (challenges.Daily && potencyModifiers.dailyToxic > 0) potencyMod *= potencyModifiers.dailyToxic;
		if (challenges.Toxicity && potencyModifiers.chalToxic > 0) potencyMod *= Math.pow(game.challenges.Toxicity.stackMult, potencyModifiers.chalToxic);
		if (challenges.Archaeology) potencyMod *= potencyModifiers.chalArchaeology;
		if (challenges.Quagmire) potencyMod *= potencyModifiers.chalQuagmire;
		if (potencyModifiers.voidBreed) potencyMod *= 0.2;
		potencyMod = calcHeirloomBonus('Shield', 'breedSpeed', potencyMod); // potencymod * ((breed/100) + 1)
		if (potencyModifiers.mutGeneAttack) potencyMod /= 50;
		if (potencyModifiers.mutGeneHealth) potencyMod /= 50;
		// Noo says all modifiers except genes are safe to do at normal precision. The log is unsafe even without genes though.
		if (potencyModifiers.genes > 0) potencyMod = DecimalBreed(potencyMod).mul(Math.pow(0.98, potencyModifiers.genes));
		potencyMod = DecimalBreed(potencyMod);

		breedCache.potencyModInitial = potencyMod; // save this weird intermediary value
		breeding = potencyMod.mul(breeding);
		potencyMod = potencyMod.div(10).add(1);
		//save input and output values to cache
		breedCache.inputs = potencyModifiers;
		breedCache.potencyMod = potencyMod;
		breedCache.logPotencyMod = DecimalBreed.log10(potencyMod).mul(10);

		if (breedCache.logPotencyMod.cmp(0) === 0) {
			breedCache.logPotencyMod = breedCache.minPotencyMod;
		}
	}

	updatePs(breeding.toNumber(), true);
	const logPotencyMod = breedCache.logPotencyMod;

	// Attempt to get these two vars at low precision. if it's zero, recalc using Decimal
	let timeRemaining = DecimalBreed(Math.log10(maxBreedable / (decimalOwned - employedTrimps)) / logPotencyMod);

	if (missingTrimps.cmp(0) > 0 && timeRemaining == 0) {
		// this value is allowed to be zero when we're not missing any trimps, otherwise, get higher precision
		timeRemaining = DecimalBreed.log10(maxBreedable.div(decimalOwned.minus(employedTrimps))).div(logPotencyMod);
	}
	// Calculate full breed time
	let fullBreed = '';
	const currentSend = trimps.getCurrentSend();
	let totalTime = DecimalBreed(Math.log10(maxBreedable / (maxBreedable - currentSend)) / logPotencyMod);

	if (totalTime == 0) {
		totalTime = DecimalBreed.log10(maxBreedable.div(maxBreedable.minus(currentSend))).div(logPotencyMod);
	}

	// breeding, potencyMod, timeRemaining, and totalTime are DecimalBreed
	game.global.breedTime = currentSend / breeding;

	if (!game.jobs.Geneticist.locked && game.global.Geneticistassist && game.global.GeneticistassistSetting > 0) {
		const target = new Decimal(game.global.GeneticistassistSetting);
		// tired of typing Geneticistassist
		let GAElem = document.getElementById('Geneticistassist');
		let GAIndicator = document.getElementById('GAIndicator');
		let canRun = false;
		const now = new Date().getTime();

		if (lastGAToggle === -1) {
			canRun = true;
		} else if (now > lastGAToggle + 2000) {
			lastGAToggle = -1;
			canRun = true;
		}

		if (!GAElem && usingRealTimeOffline) {
			drawAllJobs(true);
			GAElem = document.getElementById('Geneticistassist');
			GAIndicator = document.getElementById('GAIndicator');
		}

		if (GAElem && canRun) {
			let thresh = new DecimalBreed(totalTime.mul(0.02));
			if (!thresh.isFinite()) thresh = new Decimal(0);
			let compareTime;
			let htmlMessage = '';

			if (timeRemaining.cmp(1) > 0 && timeRemaining.cmp(target.add(1)) > 0) {
				compareTime = new DecimalBreed(timeRemaining.add(-1));
			} else {
				compareTime = new DecimalBreed(totalTime);
			}

			if (!compareTime.isFinite()) compareTime = new Decimal(999);

			if (compareTime.cmp(target) < 0) {
				let genDif = Decimal.log10(target.div(compareTime)).div(0.00860017176191756).ceil(); // Math.log10(1.02) = 0.00860017176191756
				swapClass('state', 'stateHiring', GAElem);
				if (game.resources.food.owned * 0.01 < getNextGeneticistCost()) {
					htmlMessage = " (<span style='font-size: 0.8em' class='glyphicon glyphicon-apple'></span>)";
				} else if (timeRemaining.cmp(1) < 0 || target.minus((now - game.global.lastSoldierSentAt) / 1000).cmp(timeRemaining) > 0) {
					if (genDif.cmp(0) > 0) {
						if (genDif.cmp(10) > 0) genDif = new Decimal(10);
						addGeneticist(genDif.toNumber());
					}
					htmlMessage = ' (+)';
				} else {
					htmlMessage = " (<span style='font-size: 0.8em' class='icmoon icon-clock3'></span>)";
				}
			} else if (compareTime.add(thresh.mul(-1)).cmp(target) > 0 || potencyMod.cmp(1) === 0) {
				let genDif = Decimal.log10(target.div(compareTime)).div(0.00860017176191756).ceil(); // Math.log10(1.02) = 0.00860017176191756
				if (!genDif.isFinite()) genDif = new Decimal(-1);
				swapClass('state', 'stateFiring', GAElem);
				htmlMessage = ' (-)';
				if (genDif.cmp(0) < 0 && game.options.menu.gaFire.enabled !== 2) {
					if (genDif.cmp(-10) < 0) genDif = new Decimal(-10);
					removeGeneticist(genDif.abs().toNumber());
				}
			} else {
				swapClass('state', 'stateHappy', GAElem);
				htmlMessage = '';
			}

			if (GAIndicator && GAIndicator.innerHTML !== htmlMessage) GAIndicator.innerHTML = htmlMessage;
		}
	}

	timeRemaining = timeRemaining.toNumber();
	totalTime = totalTime.toNumber();
	decimalOwned = decimalOwned.add(breeding.div(10));
	timeRemaining = game.options.menu.showFullBreed.enabled > 0 ? timeRemaining.toFixed(1) : Math.ceil(timeRemaining);
	const remainingTime = timeRemaining;
	// Display full breed time if desired
	const totalTimeText = Math.ceil(totalTime * 10) / 10;

	if (game.options.menu.showFullBreed.enabled) {
		fullBreed = `${totalTimeText} Secs`;
		timeRemaining = `${timeRemaining} / ${fullBreed}`;
	}

	if (decimalOwned.cmp(trimpsMax) >= 0 && trimps.owned >= trimpsMax) {
		trimps.owned = trimpsMax;
		missingTrimps = new DecimalBreed(0);
		let updateGenes = false;
		if (game.options.menu.geneSend.enabled === 3 && game.global.lastBreedTime / 1000 < game.global.GeneticistassistSetting) {
			game.global.lastBreedTime += 100;
			if (remainingTime == 0.0) updateGenes = true;
		}
		srLastBreedTime = fullBreed ? fullBreed : '';
		if (breedElem.innerHTML != srLastBreedTime) breedElem.innerHTML = srLastBreedTime;
		if (updateGenes || (!game.global.fighting && totalTimeText == '0.0')) {
			updateStoredGenInfo(breeding.toNumber());
		}
		return;
	}

	srLastBreedTime = timeRemaining;
	if (breedElem.innerHTML != timeRemaining && shouldUpdate()) breedElem.innerHTML = timeRemaining;
	trimps.owned = decimalOwned.toNumber();

	if (decimalOwned.cmp(trimps.owned) !== 0 && breeding.cmp(0) > 0) {
		missingTrimps = decimalOwned.minus(trimps.owned);
	} else {
		missingTrimps = new DecimalBreed(0);
	}

	if (trimps.owned >= trimpsMax) {
		trimps.owned = trimpsMax;
	} else {
		game.global.realBreedTime += 100;
	}

	game.global.lastBreedTime += 100;
	updateStoredGenInfo(breeding);
}

Fluffy.updateExp = function () {
	const expElem = document.getElementById('fluffyExp');
	const lvlElem = document.getElementById('fluffyLevel');
	const fluffyInfo = this.cruffysTipActive() ? game.challenges.Nurture.getExp() : this.getExp();
	let width = Math.ceil((fluffyInfo[1] / fluffyInfo[2]) * 100);

	if (width > 100) width = 100;
	expElem.style.width = width + '%';

	if (lvlElem.innerHTML != fluffyInfo[0]) {
		lvlElem.innerHTML = fluffyInfo[0];
	}
};

u2Mutations.setAlert = function () {
	const alertMutation = document.getElementById('mutatorsAlert');
	const alertMastery = document.getElementById('mutatorsAlert2');
	const alertText = game.options.menu.masteryTab.enabled !== 0 && game.global.mutatedSeeds >= this.nextCost() && this.purchaseCount < Object.keys(this.tree).length ? '!' : '';

	if (alertMutation.innerHTML !== alertText) alertMutation.innerHTML = alertText;
	if (alertMastery.innerHTML !== alertText) alertMastery.innerHTML = alertText;

	if (game.global.tabForMastery) {
		updateTalentNumbers();
	} else {
		const seedCount = document.getElementById('talentsEssenceTotal');
		const seedText = game.options.menu.masteryTab.enabled === 2 ? ` (${prettify(game.global.mutatedSeeds)})` : '';
		if (seedCount.innerHTML !== seedText) seedCount.innerHTML = seedText;
	}
};

function drawGrid(maps) {
	const grid = maps ? document.getElementById('mapGrid') : document.getElementById('grid');
	let map = maps ? getCurrentMapObject() : null;
	let cols = 10;
	let rows = 10;

	if (maps) {
		if (map.size === 150) {
			rows = 10;
			cols = 15;
		} else {
			cols = Math.floor(Math.sqrt(map.size));
			if (map.size % cols === 0) {
				rows = map.size / cols;
			} else {
				const sizeGreaterThanCols = map.size - cols * cols > cols;
				rows = sizeGreaterThanCols ? cols + 2 : cols + 1;
			}
		}
	}

	const width = `${100 / cols}%`;
	const paddingTop = `${100 / cols / 19}vh`;
	const paddingBottom = `${100 / cols / 19}vh`;
	const fontSize = `${cols / 14 + 1}vh`;

	let className = '';
	if (game.global.universe === 1 && !maps && game.global.world >= 60 && game.global.world <= 80) {
		if (game.global.world === 60) className = 'gridOverlayGreenGradient1';
		else if (game.global.world <= 65) className = 'gridOverlayGreenGradient2';
		else if (game.global.world <= 70) className = 'gridOverlayGreenGradient3';
		else if (game.global.world <= 75) className = 'gridOverlayGreenGradient4';
		else className = 'gridOverlayGreenGradient5';
	}

	if (!maps && game.global.gridArray[0].name === 'Liquimp') className += 'liquid';
	else if (!maps && game.global.spireActive) className = 'spire';
	else if (maps && map.location === 'Darkness') className = 'blackMap';

	const idText = maps ? 'mapCell' : 'cell';
	let size = maps ? game.global.mapGridArray.length : 0;
	let counter = 0;
	let rowHTML = '';

	for (let i = 0; i < rows; i++) {
		if (maps && counter >= size) break;
		let html = '';
		for (let x = 0; x < cols; x++) {
			if (maps && counter >= size) break;

			const cell = game.global[maps ? 'mapGridArray' : 'gridArray'][counter];
			const id = `${idText}${counter}`;

			let className = ['battleCell', 'cellColorNotBeaten'];
			let background = '';
			let backgroundColor = '';
			let title = '';
			let role = '';
			const innerHTML = cell.text === '' ? '&nbsp;' : cell.text;

			if (maps) {
				if (cell.name === 'Pumpkimp') className.push('mapPumpkimp');
				if (map.location === 'Void') className.push('voidCell');
				if (cell.vm) className.push(cell.vm);
			} else {
				if (cell.u2Mutation && cell.u2Mutation.length) {
					className.push('mutatedCell');
					background = 'initial';
					backgroundColor = u2Mutations.getColor(cell.u2Mutation);
				} else if (cell.mutation) className.push(cell.mutation);
				if (cell.vm) className.push(cell.vm);
				if (cell.empowerment) {
					className.push(`empoweredCell${cell.empowerment}`);
					title = `Token of ${cell.empowerment}`;
				} else if (checkIfSpireWorld() && game.global.spireActive) className.push('spireCell');
				if (cell.special === 'easterEgg') {
					game.global.eggLoc = counter;
					className.push('eggCell');
					title = 'Colored Egg';
					role = 'button';
				}
			}

			html += `<li id="${id}" 
						style="width:${width};padding-top:${paddingTop};padding-bottom:${paddingBottom};font-size:${fontSize};background:${background};background-color:${backgroundColor};" 
						class="${className.join(' ')}" 
						title="${title}" 
						role="${role}">
						${innerHTML}
					</li>`;
			counter++;
		}

		rowHTML = `<ul id="row${i}" class="battleRow">${html}</ul>` + rowHTML;
	}

	grid.className = className;
	grid.innerHTML = rowHTML;

	const eggCell = document.querySelector('.eggCell');
	if (eggCell) eggCell.addEventListener('click', easterEggClicked);
}

function clearQueue(specific = false) {
	if (!specific) game.global.clearingBuildingQueue = true;
	let existing = 0;

	for (let x = 0; x < game.global.nextQueueId; x++) {
		const queueItem = document.getElementById(`queueItem${x}`);
		if (!queueItem) continue;

		existing++;

		if (specific && game.global.buildingsQueue[existing - 1].split('.')[0] !== specific) continue;
		else existing--;

		removeQueueItem(`queueItem${x}`, true);
	}

	game.global.clearingBuildingQueue = false;
}

function updateAllBattleNumbers(skipNum) {
	if (!shouldUpdate(true)) return;

	const prefix = game.global.mapsActive ? 'Map' : '';
	const cellNum = game.global[`lastCleared${prefix}Cell`] + 1;
	const cell = game.global[`${prefix ? 'mapGridArray' : 'gridArray'}`][cellNum];
	const cellElem = document.getElementById(`${prefix ? 'mapCell' : 'cell'}${cellNum}`);
	if (!cellElem) return;

	swapClass('cellColor', 'cellColorCurrent', cellElem);
	let elem = document.getElementById('goodGuyHealthMax');
	let elemText = prettify(game.global.soldierHealthMax);
	if (elem.innerHTML != elemText) elem.innerHTML = elemText;
	updateGoodBar();
	updateBadBar(cell);

	elem = document.getElementById('badGuyHealthMax');
	elemText = prettify(cell.maxHealth);
	if (elem.innerHTML != elemText) elem.innerHTML = elemText;

	if (!skipNum) {
		elem = document.getElementById('trimpsFighting');
		elemText = prettify(game.resources.trimps.getCurrentSend());
		if (challengeActive('Trimp') && game.jobs.Amalgamator.owned > 0) elemText = toZalgo(elemText, game.global.world);
		if (elem && elem.innerHTML != elemText) elem.innerHTML = elemText;
	}

	let blockDisplay = '';

	if (game.global.universe === 2) {
		const layers = Fluffy.isRewardActive('shieldlayer');
		let shieldMax = game.global.soldierEnergyShieldMax;
		let shieldMult = getEnergyShieldMult();
		if (layers > 0) {
			shieldMax *= layers + 1;
			shieldMult *= layers + 1;
		}
		blockDisplay = `${prettify(shieldMax)} (${Math.round(shieldMult * 100)}%)`;
	} else {
		blockDisplay = prettify(game.global.soldierCurrentBlock);
	}

	elem = document.getElementById('goodGuyBlock');
	if (elem.innerHTML !== blockDisplay.toString()) elem.innerHTML = blockDisplay;

	elem = document.getElementById('goodGuyAttack');
	elemText = calculateDamage(game.global.soldierCurrentAttack, true, true);
	if (elem.innerHTML != elemText) elem.innerHTML = elemText;

	elem = document.getElementById('badGuyAttack');
	const badGuyAttack = calculateDamage(cell.attack, true, false, false, cell);
	elemText = `${badGuyAttack}${game.global.usingShriek ? ' <span class="icomoon icon-chain"></span>' : ''}`;
	if (elem.innerHTML !== elemText) elem.innerHTML = elemText;

	if (game.global.usingShriek) swapClass('dmgColor', 'dmgColorRed', elem);
}

function setVoidCorruptionIcon(regularMap) {
	if (usingRealTimeOffline) return;

	const scaleDivider = regularMap || !mutations.Magma.active() ? 2 : 1;
	let attackScale = mutations.Corruption.statScale(3) / scaleDivider;
	let healthScale = mutations.Corruption.statScale(10) / scaleDivider;

	let title = regularMap ? 'Map Corruption' : 'Void Corruption';
	let text = `This ${regularMap ? 'map' : 'Void Map'} has become unstable due to Corruption. Enemy attack increased by ${prettify(attackScale)}X, and health increased by ${prettify(healthScale)}X.`;

	if (!regularMap) {
		text += ' Helium at the end of the map is now double what you would earn from a World Zone, including Corrupted cells!';
	}

	const corruptionElem = document.getElementById('corruptionBuff');
	const elemText = `<span class="badge badBadge voidBadge" onmouseover="tooltip('${title}', 'customText', event, '${text}')" onmouseout="tooltip('hide')"><span class="glyphicon glyphicon-plus"></span></span>&nbsp;`;
	if (corruptionElem.innerHTML !== elemText) corruptionElem.innerHTML = elemText;
}

function manageLeadStacks(remove) {
	const challenge = game.challenges.Lead;
	const elem = document.getElementById('leadBuff');
	let determinedBuff = document.getElementById('determinedBuff');

	if (game.global.world % 2 === 1) {
		if (determinedBuff === null) {
			const goodGuyElem = document.getElementById('goodGuyName');
			const htmlMessage = '&nbsp<span class="badge antiBadge" id="determinedBuff" onmouseover="tooltip(\'Determined\', \'customText\', event, \'Your Trimps are determined to succeed. They gain 50% attack and earn double resources from all sources.\')" onmouseout="tooltip(\'hide\')"><span class="icomoon icon-sun2"></span></span>';
			if (!goodGuyElem.innerHTML.includes(htmlMessage)) goodGuyElem.innerHTML += htmlMessage;
			determinedBuff = document.getElementById('determinedBuff');
		}
		determinedBuff.style.display = 'inline';
	} else if (determinedBuff !== null) {
		determinedBuff.style.display = 'none';
	}

	if (challenge.stacks <= 0) return;
	if (remove && challenge.stacks) challenge.stacks--;

	if (!elem) {
		const badGuyElem = document.getElementById('badGuyName');
		const htmlMessage = `&nbsp;<span class="badge badBadge" id="leadBuff" onmouseover="tooltip('Momentum', null, event)" onmouseout="tooltip('hide')"><span id="leadStacks">${challenge.stacks}</span><span id="momentumIcon" class="icomoon icon-hourglass"></span></span>`;
		if (badGuyElem.innerHTML !== htmlMessage) {
			badGuyElem.innerHTML += htmlMessage;
		}
	} else {
		const stacksElem = document.getElementById('leadStacks');
		if (stacksElem.innerHTML !== challenge.stacks) {
			stacksElem.innerHTML = challenge.stacks;
		}
	}

	swapClass('icon-hourglass', 'icon-hourglass-' + (3 - Math.floor(challenge.stacks / 67)), document.getElementById('momentumIcon'));
}

function updateToxicityStacks() {
	if (!shouldUpdate() && challengeActive('Toxicity')) return;

	const elem = document.getElementById('toxicityBuff');
	const stackCount = game.challenges.Toxicity.stacks;

	if (!elem) {
		const badGuyElem = document.getElementById('badGuyName');
		const htmlMessage = `&nbsp<span class="badge badBadge" id="toxicityBuff" onmouseover="tooltip('Toxic', null, event)" onmouseout="tooltip('hide')"><span id="toxicityStacks">${stackCount}</span><span class="icomoon icon-radioactive"></span></span>`;
		if (badGuyElem.innerHTML !== htmlMessage) badGuyElem.innerHTML += htmlMessage;
		return;
	}

	const stacksElem = document.getElementById('toxicityStacks');
	if (stacksElem.innerHTML !== stackCount) stacksElem.innerHTML = stackCount;
}

function updateLivingStacks() {
	if (!shouldUpdate()) return;
	const elem = document.getElementById('livingBuff');
	const stackCount = game.challenges.Life.stacks;
	if (stackCount < game.challenges.Life.lowestStacks) game.challenges.Life.lowestStacks = stackCount;

	if (!elem) {
		const goodGuyElem = document.getElementById('goodGuyName');
		const htmlMessage = `&nbsp<span class="badge antiBadge" id="livingBuff" onmouseover="tooltip('Unliving', null, event)" onmouseout="tooltip('hide')"><span id="livingStacks">${stackCount}</span>&nbsp;<span style="margin-top: 2%" class="icomoon icon-shareable"></span></span>`;
		if (!goodGuyElem.innerHTML.includes(htmlMessage)) goodGuyElem.innerHTML += htmlMessage;

		return;
	}

	const stacksElem = document.getElementById('livingStacks');
	if (stacksElem.innerHTML !== stackCount) stacksElem.innerHTML = stackCount;
}

function checkCrushedCrit() {
	let badCrit = false;
	let elemDisplay = 'none';
	const canCritElem = document.getElementById('badCanCrit');

	if (game.global.soldierHealth > game.global.soldierCurrentBlock) {
		elemDisplay = 'inline-block';
		if (Math.floor(Math.random() * 2) === 0) badCrit = true;
	}

	if (canCritElem.style.display !== elemDisplay && shouldUpdate()) canCritElem.style.display = elemDisplay;
	return badCrit;
}

function updateElectricityStacks(tipOnly) {
	if (!shouldUpdate() && (challengeActive('Electricity') || challengeActive('Mapocalypse'))) return;
	const elem = document.getElementById('debuffSpan');

	if (game.challenges.Electricity.stacks > 0) {
		const number = game.challenges.Electricity.stacks * 10;
		const addText = 'Your Trimps are dealing ' + number + '% less damage and taking ' + number + '% of their total health as damage per attack.';
		const htmlMessage = `<span class="badge trimpBadge" onmouseover="tooltip('Electrified', 'customText', event, '${addText}'); updateElectricityTip()" onmouseout="tooltip('hide')">${game.challenges.Electricity.stacks}<span class="icomoon icon-power"></span></span>`;
		if (elem && elem.innerHTML !== htmlMessage) elem.innerHTML = htmlMessage;

		if (tipOnly) {
			const tooltip = document.getElementById('tipText');
			if (tooltip.innerHTML !== addText) tooltip.innerHTML = addText;
			return;
		}

		const goodGuyAttack = calculateDamage(game.global.soldierCurrentAttack, true, true);
		const goodGuyElem = document.getElementById('goodGuyAttack');
		if (goodGuyElem.innerHTML !== goodGuyAttack) goodGuyElem.innerHTML = goodGuyAttack;
	} else {
		if (elem && elem.innerHTML !== '') elem.innerHTML = '';
	}
}

function updateAntiStacks() {
	if (!shouldUpdate()) return;

	const elem = document.getElementById('anticipationSpan');
	let elemText = '';

	if (game.global.antiStacks > 0) {
		let number = game.global.antiStacks * getPerkLevel('Anticipation') * game.portal.Anticipation.modifier;
		number = Math.floor(number * 100);
		const verb = game.jobs.Amalgamator.owned > 0 ? 'prepare' : 'populate';
		const s = game.global.antiStacks === 1 ? '' : 's';
		elemText = `<span class="badge antiBadge" onmouseover="tooltip('Anticipation', 'customText', event, 'Your Trimps are dealing ${number}% extra damage for taking ${game.global.antiStacks} second${s} to ${verb}.')" onmouseout="tooltip('hide')">${game.global.antiStacks}<span class="icomoon icon-target2"></span></span>`;
	}

	if (elem && elem.innerHTML !== elemText) elem.innerHTML = elemText;
}

function updateTitimp() {
	if (!shouldUpdate()) return;
	const elem = document.getElementById('titimpBuff');

	if (game.global.titimpLeft < 1) {
		if (elem && elem.innerHTML !== '') elem.innerHTML = '';
		return;
	}

	const timer = Math.floor(game.global.titimpLeft);
	const message = `<span class="badge antiBadge" onmouseover="tooltip('Titimp', 'customText', event, 'Your Trimps are dealing double damage, thanks to the Titimp!');" onmouseout="tooltip('hide')">${timer}<span class="icomoon icon-hammer"></span></span>`;
	if (elem && elem.innerHTML !== message) elem.innerHTML = message;
}

function updateNomStacks(number) {
	if (!shouldUpdate() && challengeActive('Nom')) return;

	const elem = document.getElementById('nomStack');
	if (!elem) {
		document.getElementById('badGuyName').innerHTML += `<span class="badge badBadge" onmouseover="tooltip('Nom', 'customText', event, 'This Bad Guy is nice and plump from eating Trimps. Increases attack damage by 25% per stack');" onmouseout="tooltip('hide')"><span id="nomStack">${number}</span><span class="glyphicon glyphicon-scale"></span></span>`;
	} else {
		if (elem.innerHTML !== number) elem.innerHTML = number;
	}
}

function updateBalanceStacks() {
	if (!shouldUpdate() && (challengeActive('Balance') || challengeActive('Unbalance'))) return;

	let elem = document.getElementById('balanceSpan');
	if (!elem) {
		document.getElementById('goodGuyName').innerHTML += `<span id='balanceSpan'></span>`;
		elem = document.getElementById('balanceSpan');
	}

	const isUnbalanceActive = challengeActive('Unbalance');
	const challenge = isUnbalanceActive ? game.challenges.Unbalance : game.challenges.Balance;
	const statFunction = isUnbalanceActive ? challenge.getAttackMult.bind(challenge) : challenge.getHealthMult.bind(challenge);
	const statMessage = isUnbalanceActive ? 'less attack' : 'less health';

	if (challenge.balanceStacks > 0) {
		const htmlMessage = `<span class="badge antiBadge" onmouseover="tooltip('Unbalance', 'customText', event, 'Your Trimps have ${statFunction(true)} ${statMessage}, but all Trimps can gather ${challenge.getGatherMult(true)} faster. You will gain one stack from killing Bad Guys in the world, and lose one stack for killing Bad Guys in maps.');" onmouseout="tooltip('hide')"><span id="balanceStack">${challenge.balanceStacks}</span><span class="icomoon icon-balance-scale"></span></span>`;

		if (elem.innerHTML !== htmlMessage) {
			elem.style.display = 'inline-block';
			elem.innerHTML = htmlMessage;
		}
	} else {
		elem.style.display = 'none';
	}
}

function updateGammaStacks(reset) {
	const bonus = getHeirloomBonus('Shield', 'gammaBurst');
	let hide = false;

	if (bonus <= 0 || reset) {
		game.heirlooms.Shield.gammaBurst.stacks = 0;
		hide = true;
	}

	if (usingRealTimeOffline) return;

	let triggerStacks = autoBattle.oneTimers.Burstier.owned ? 4 : 5;
	if (Fluffy.isRewardActive('scruffBurst')) triggerStacks--;

	const tipText = `Your Trimps are charging up for a Gamma Burst! When Charging reaches ${triggerStacks} stacks, your Trimps will release a burst of energy, dealing ${prettify(bonus)}% of their attack damage.`;
	manageStacks('Charging', game.heirlooms.Shield.gammaBurst.stacks, true, 'gammaSpan', 'glyphicon glyphicon-flash', tipText, hide);
}

function manageStacks(stackName, stackCount, isTrimps, elemName, icon, tooltipText, forceHide, addSpace, addClass) {
	const parentName = isTrimps ? 'goodGuyName' : 'badDebuffSpan';
	const parent = document.getElementById(parentName);
	let elem = document.getElementById(elemName);

	if (forceHide) {
		if (elem) parent.removeChild(elem);
		return;
	}

	if (!elem) {
		let className = addClass ? " class='" + addClass + "'" : '';
		if (parent) parent.innerHTML += `<span id="${elemName}"${className}></span>`;
		elem = document.getElementById(elemName);
	}

	if (stackCount === -1) stackCount = '';
	const space = addSpace ? '&nbsp;' : '';
	const elemText = ` <span class="badge antiBadge" onmouseover="tooltip('${stackName}', 'customText', event, '${tooltipText}')" onmouseout="tooltip('hide')"><span>${stackCount}</span>${space}<span class="${icon}"></span></span>`;
	if (elem.innerHTML !== elemText) elem.innerHTML = elemText;
}

function setMutationTooltip(which, mutation) {
	if (!shouldUpdate(true)) return;

	const effect = mutationEffects[which];
	if (typeof effect === 'undefined') return;
	const elem = document.getElementById('corruptionBuff');
	if (typeof mutations[mutation].tooltip === 'undefined') return;

	const elemText = `<span class="badge badBadge ${mutation}" onmouseover="tooltip('${effect.title}', 'customText', event, '${mutations[mutation].tooltip(which)}')" onmouseout="tooltip('hide')"><span class="${effect.icon}"></span></span>&nbsp;`;
	if (elem && elem.innerHTML !== elemText) elem.innerHTML = elemText;
}

function setFormation(what) {
	if (what) {
		if (game.options.menu.pauseGame.enabled) return;
		what = parseInt(what, 10);
		swapClass('formationState', 'formationStateDisabled', document.getElementById('formation' + game.global.formation));

		if ([4, 5].includes(what) && ![4, 5].includes(game.global.formation)) {
			if (game.global.mapsActive) game.global.waitToScryMaps = true;
			else game.global.waitToScry = true;
		}

		if (game.global.mapsActive) {
			if (![4, 5].includes(what)) game.global.canScryCache = false;
			else if (game.global.lastClearedMapCell === -1) game.global.canScryCache = true;
		}

		if (game.global.soldierHealth > 0) {
			const formations = {
				1: { health: 0.25, attack: 2, block: 2 },
				2: { health: 2, attack: 0.25, block: 2 },
				3: { health: 2, attack: 2, block: 0.25 },
				4: { health: 2, attack: 2, block: 2 }
			};

			const whatFormations = {
				1: { health: 4, attack: 0.5, block: 0.5 },
				2: { health: 0.5, attack: 4, block: 0.5 },
				3: { health: 0.5, attack: 0.5, block: 4 },
				4: { health: 0.5, attack: 0.5, block: 0.5 }
			};

			let { health, attack, block } = formations[game.global.formation] || { health: 1, attack: 1, block: 1 };
			let whatFormation = whatFormations[what] || { health: 1, attack: 1, block: 1 };

			health *= whatFormation.health;
			attack *= whatFormation.attack;
			block *= whatFormation.block;

			const oldHealth = game.global.soldierHealthMax;
			game.global.soldierHealthMax *= health;
			game.global.soldierHealth -= oldHealth - game.global.soldierHealthMax;
			if (game.global.soldierHealth <= 0) game.global.soldierHealth = 0;
			game.global.soldierCurrentBlock *= block;
			game.global.soldierCurrentAttack *= attack;
			game.global.formation = what;
			updateAllBattleNumbers(true);
		}

		game.global.formation = what;
	} else {
		swapClass('formationState', 'formationStateDisabled', document.getElementById('formation0'));
	}

	const toSet = what ? what : game.global.formation;
	swapClass('formationState', 'formationStateEnabled', document.getElementById('formation' + toSet));
	if (usingRealTimeOffline) offlineProgress.updateFormations();
}

function rewardLiquidZone() {
	game.stats.battlesWon.value += 99;

	const messages = game.global.messages.Loot;
	const initialResources = {
		food: game.resources.food.owned,
		wood: game.resources.wood.owned,
		metal: game.resources.metal.owned,
		helium: game.resources.helium.owned,
		fragments: game.resources.fragments.owned,
		trimpsCount: game.resources.trimps.realMax()
	};
	const trackedImps = {
		Feyimp: 0,
		Magnimp: 0,
		Tauntimp: 0,
		Venimp: 0,
		Whipimp: 0,
		Skeletimp: 0,
		Megaskeletimp: 0
	};

	let voidMaps = 0;
	let unlocks = ['', ''];
	let text = '';
	let tokText;

	messageLock = true;
	const scryBonus = isScryerBonusActive();
	const hiddenUpgrades = new Set(['fiveTrimpMax', 'Map', 'fruit', 'groundLumber', 'freeMetals', 'Foreman', 'FirstMap']);

	for (let x = 1; x < 100; x++) {
		game.global.voidSeed++;
		game.global.scrySeed++;
		if (scryBonus) tryScry();
		if (checkVoidMap() === 1) voidMaps++;
		const cell = game.global.gridArray[x];

		if (cell.special !== '') {
			let unlock = game.worldUnlocks[cell.special];
			if (typeof unlock !== 'undefined' && typeof unlock.fire !== 'undefined') {
				unlock.fire(x);
				if (!hiddenUpgrades.has(cell.special)) {
					let index = unlock.world < 0 ? 1 : 0;
					if (unlocks[index] !== '') unlocks[index] += ', ';
					if (typeof unlock.displayAs !== 'undefined') unlocks[index] += unlock.displayAs;
					else unlocks[index] += cell.special;
				}
			} else {
				unlockEquipment(cell.special);
			}
		}

		if (cell.mutation && typeof mutations[cell.mutation].reward !== 'undefined') mutations[cell.mutation].reward(cell.corrupted);
		if (cell.empowerment) {
			const tokReward = rewardToken(cell.empowerment);
			if (messages.token && messages.enabled && tokReward) {
				tokText = `<span class='message empoweredCell${cell.empowerment}'>Found ${prettify(tokReward)} Token${tokReward === 1 ? '' : 's'} of ${cell.empowerment}!</span>`;
			}
		}
		if (typeof game.badGuys[cell.name].loot !== 'undefined') game.badGuys[cell.name].loot(cell.level);
		if (typeof trackedImps[cell.name] !== 'undefined') trackedImps[cell.name]++;
	}

	messageLock = false;

	const addUniques = unlocks[0] !== '' && game.global.messages.Unlocks.unique;
	const addRepeateds = unlocks[1] !== '' && game.global.messages.Unlocks.repeated;

	if ((addUniques || addRepeateds) && game.global.messages.Unlocks.enabled) {
		let unlockText = [];
		if (addUniques) {
			unlockText.push(unlocks[0]);
		}
		if (addRepeateds) {
			unlockText.push(unlocks[1]);
		}
		text += `Unlocks Found: ${unlockText.join(', ')}<br/>`;
	}

	if (messages.enabled && (messages.primary || messages.secondary)) {
		let resourceText = [];
		const heCount = game.resources.helium.owned - initialResources.helium;

		if (messages.helium && heCount > 0) {
			resourceText.push(` Helium - ${prettify(heCount)}`);
		}
		if (messages.secondary) {
			resourceText.push(` Max Trimps - ${prettify(game.resources.trimps.realMax() - initialResources.trimpsCount)}`);
			resourceText.push(` Fragments - ${prettify(game.resources.fragments.owned - initialResources.fragments)}`);
		}
		if (messages.primary) {
			resourceText.push(` Food - ${prettify(game.resources.food.owned - initialResources.food)}`);
			resourceText.push(` Wood - ${prettify(game.resources.wood.owned - initialResources.wood)}`);
			resourceText.push(` Metal - ${prettify(game.resources.metal.owned - initialResources.metal)}`);
		}

		text += `Resources Found:${resourceText.join(',')}<br/>`;
	}

	const trackedList = [];
	let bones;
	for (let item in trackedImps) {
		if (trackedImps[item] > 0) {
			if (item === 'Skeletimp' || item === 'Megaskeletimp') {
				bones = true;
				continue;
			}
			trackedList.push(` ${item} - ${trackedImps[item]}`);
		}
	}

	if (trackedList && messages.exotic && messages.enabled) {
		text += `Rare Imps: ${trackedList}<br/>`;
	}

	if (bones && messages.bone && messages.enabled) {
		text += `Found a ${bones}!<br/>`;
	}

	if (tokText) {
		text += `${tokText}<br/>`;
	}

	if (text) {
		text = `You liquified a Liquimp!<br/>${text}`;
		text = text.slice(0, -5);
		message(text, 'Notices', 'star', 'LiquimpMessage');
	}

	if (challengeActive('Lead')) {
		game.challenges.Lead.stacks -= 100;
		manageLeadStacks();
	}

	game.stats.zonesLiquified.value++;
	nextWorld();
	drawAllUpgrades();
}

function showGeneratorUpgradeInfo(item, permanent) {
	const elem = document.getElementById('generatorUpgradeDescription');
	if (!elem) return;

	let description;
	let cost;

	if (permanent) {
		description = game.permanentGeneratorUpgrades[item].description;
		cost = game.permanentGeneratorUpgrades[item].cost;
	} else {
		description = game.generatorUpgrades[item].description();
		cost = game.generatorUpgrades[item].cost();
	}

	let color = game.global.magmite >= cost ? 'Success' : 'Danger';
	if (item === 'Overclocker' && (!game.permanentGeneratorUpgrades.Hybridization.owned || !game.permanentGeneratorUpgrades.Storage.owned)) color = 'Danger';

	let text;
	if (permanent && game.permanentGeneratorUpgrades[item].owned) {
		color = 'Grey';
		text = 'Done';
	} else {
		text = 'Buy: ' + prettify(cost) + ' Magmite';
	}

	const elemText = `<div id='generatorUpgradeName'>${item}</div><div onclick='buyGeneratorUpgrade("${item}")' id='magmiteCost' class='pointer noSelect hoverColor color${color}'>${text}</div>${description}<br/>`;
	if (elem.innerHTML !== elemText) elem.innerHTML = elemText;
	lastViewedDGUpgrade = [item, permanent];
	verticalCenterTooltip();
}

function updateNextGeneratorTickTime() {
	//update tick time
	const nextTickElem = document.getElementById('generatorNextTick');
	if (game.global.genPaused) {
		const message = mousedOverClock ? "<span class='icomoon icon-controller-play'></span>" : '<span class="icomoon icon-pause3"></span>';
		if (nextTickElem !== message) nextTickElem.innerHTML = message;
		return;
	}

	const tickTime = getGeneratorTickTime();
	let framesPerVisual = 10;
	let nextTickIn = (tickTime * 1000 - game.global.timeSinceLastGeneratorTick) / 1000;
	nextTickIn = isNumberBad(nextTickIn) ? 0 : Math.round(nextTickIn * 10) / 10;
	nextTickIn = Math.round(nextTickIn * 10) / 10;

	if (Math.round((nextTickIn + 0.1) * 10) / 10 === tickTime) {
		thisTime = framesPerVisual - 1;
	}

	const message = mousedOverClock && game.permanentGeneratorUpgrades.Supervision.owned ? "<span class='icomoon icon-pause3'></span>" : usingRealTimeOffline ? 0 : prettify(Math.floor(nextTickIn + 1));
	if (nextTickElem != message && shouldUpdate()) nextTickElem.innerHTML = message;

	let countingTick = Math.round((tickTime - nextTickIn) * 10) / 10;
	countingTick = Math.round(countingTick * 10) / 10;

	if (game.options.menu.generatorAnimation.enabled === 1 && thisTime >= framesPerVisual - 1) {
		thisTime = 0;
		let timeRemaining = tickTime - countingTick;
		if (timeRemaining !== 0 && timeRemaining <= framesPerVisual / 10) {
			timeRemaining = Math.round((timeRemaining - 0.1) * 10) / 10;
			thisTime = framesPerVisual;
			framesPerVisual = timeRemaining * 10;
			thisTime -= framesPerVisual;
		}
		goRadial(document.getElementById('generatorRadial'), countingTick, tickTime, 100 * framesPerVisual);
	} else {
		thisTime++;
	}
}

function updateGeneratorFuel() {
	const currentFuel = game.global.magmaFuel;
	const maxFuel = getGeneratorFuelCap();
	const elem = document.getElementById('generatorFuelOwned');
	if (elem && elem.innerHTML != prettify(currentFuel)) elem.innerHTML = prettify(currentFuel);
	const elem2 = document.getElementById('generatorFuelMax');
	if (elem2 && elem2.innerHTML != prettify(maxFuel)) elem2.innerHTML = prettify(maxFuel);

	const fuelStorageBar = document.getElementById('fuelStorageBar');
	let percent;

	if (currentFuel > maxFuel) {
		const storageCap = getGeneratorFuelCap(true);
		percent = Math.ceil(((currentFuel - maxFuel) / (storageCap - maxFuel)) * 100);
		if (percent > 100) percent = 100;
		if (percent < 0) percent = 0;
		//fuelStorageBar.style.top = (100 - percent) + "%";
		fuelStorageBar.style.height = percent + '%';
	} else {
		//fuelStorageBar.style.top = "100%";
		fuelStorageBar.style.height = '0%';
	}

	const fuelBar = document.getElementById('fuelBar');
	percent = Math.ceil((currentFuel / maxFuel) * 100);
	if (percent > 100) percent = 100;
	//fuelBar.style.top = (100 - percent) + "%";
	fuelBar.style.height = percent + '%';
}

function changeGeneratorState(to, updateOnly) {
	if (game.global.universe === 2) return;
	//0 passive, 1 active, 2 hybrid
	const originalMode = game.global.generatorMode;
	const runningEradicated = challengeActive('Eradicated');
	if (runningEradicated) to = 1;
	if (!updateOnly) game.global.generatorMode = to;
	to = game.global.generatorMode;
	if (game.global.genPaused) to = runningEradicated ? 1 : 0;
	if (to === 2 && game.global.magmaFuel < getGeneratorFuelCap(false, true)) to = 3;

	if (to === originalMode && !updateOnly) return;

	const state = ['Passive', 'Active', 'HybridPassive', 'HybridActive'][to];
	swapClass('generatorState', 'generatorState' + state, document.getElementById('generatorWindow'));
	swapClass('generatorState', 'generatorState' + state, document.getElementById('clockKnob'));
}

function generatorTick(fromOverclock) {
	if (!mutations.Magma.active()) return;
	if (game.global.genPaused) {
		updateNextGeneratorTickTime();
		return;
	}

	const fuelRate = getFuelBurnRate();
	if (!fromOverclock) {
		if (game.global.magmaFuel < fuelRate) return;
		game.global.timeSinceLastGeneratorTick += 100;
		updateNextGeneratorTickTime();
		if (!canGeneratorTick()) {
			return;
		}
	}

	checkAchieve('housing', 'Generator');
	let tickAmt = getGeneratorTickAmount();
	if (fromOverclock) tickAmt *= 1 - game.generatorUpgrades.Overclocker.modifier;
	const scaledTick = addMaxHousing(tickAmt, game.permanentGeneratorUpgrades.Simulacrum.owned);
	game.stats.trimpsGenerated.value += scaledTick;
	game.global.trimpsGenerated += tickAmt;
	game.global.magmaFuel = Math.round((game.global.magmaFuel - fuelRate) * 100) / 100;

	if (!fromOverclock) {
		if (game.global.magmaFuel >= fuelRate) game.global.timeSinceLastGeneratorTick = 0;
		else {
			game.global.timeSinceLastGeneratorTick = 0;
			goRadial(document.getElementById('generatorRadial'), 0, 10, 0);
			const nextTickElem = document.getElementById('generatorNextTick');
			if (nextTickElem !== '0') nextTickElem.innerHTML = 0;
		}
	}

	updateGeneratorInfo();
	changeGeneratorState(null, true);
}

function goRadial(elem, currentSeconds, totalSeconds, frameTime) {
	if (!elem || usingRealTimeOffline) return;
	if (currentSeconds <= 0) currentSeconds = 0;

	elem.style.transition = '';
	elem.style.transform = 'rotate(' + timeToDegrees(currentSeconds, totalSeconds) + 'deg)';
	setTimeout(
		(function (ft, cs, ts) {
			return function () {
				elem.style.transform = 'rotate(' + timeToDegrees(cs + ft / 1000, ts) + 'deg)';
				elem.style.transition = cs < 0.1 ? '' : 'transform ' + ft + 'ms linear';
			};
		})(frameTime, currentSeconds, totalSeconds).bind(this),
		0
	);
}

function setEmpowerTab() {
	if (!shouldUpdate()) return;

	const empowerMod = getEmpowerment();
	const empowerTab = document.getElementById('natureTab');
	const natureButton = document.getElementById('natureA');
	const empowerTabDisplay = getHighestLevelCleared() < 235 || game.global.universe === 2 ? 'none' : 'table-cell';
	let newNatureHTML = 'Nature';
	let newEmpowerTabClass = 'empowerTabNone';

	if (empowerTabDisplay === 'table-cell' && empowerMod) {
		const icons = {
			Poison: 'icomoon icon-flask',
			Ice: 'glyphicon glyphicon-certificate',
			Wind: 'icomoon icon-air'
		};

		newEmpowerTabClass = 'empowerTab' + empowerMod;
		newNatureHTML = `<span class='${icons[empowerMod]}'></span> Nature`;
	}

	if (empowerTab.style.display !== empowerTabDisplay) {
		empowerTab.style.display = empowerTabDisplay;
	}

	if (empowerTab.className.indexOf(newEmpowerTabClass) === -1) {
		swapClass('empowerTab', newEmpowerTabClass, empowerTab);
	}

	if (natureButton.innerHTML !== newNatureHTML) {
		natureButton.innerHTML = newNatureHTML;
	}
}

function handlePoisonDebuff() {
	let elem = document.getElementById('poisonEmpowermentIcon');

	if (getEmpowerment() !== 'Poison') {
		game.empowerments.Poison.currentDebuffPower = 0;
		if (elem && elem.style.display !== 'none') {
			elem.style.display = 'none';
		}
		return;
	}

	if (!shouldUpdate()) return;

	if (!elem) {
		document.getElementById('badDebuffSpan').innerHTML += `<span class="badge badBadge" id="poisonEmpowermentIcon" onmouseover="tooltip('Poisoned', null, event)" onmouseout="tooltip('hide')"><span id="poisonEmpowermentText"></span><span class="icomoon icon-flask"></span></span>`;
		elem = document.getElementById('poisonEmpowermentIcon');
	}

	if (elem.style.display !== 'inline-block') {
		elem.style.display = 'inline-block';
	}

	const poisonEmpowermentText = document.getElementById('poisonEmpowermentText');
	const poisonDamage = prettify(game.empowerments.Poison.getDamage());
	if (poisonEmpowermentText && poisonEmpowermentText.innerHTML != poisonDamage) {
		poisonEmpowermentText.innerHTML = poisonDamage;
	}
}

function handleIceDebuff() {
	let elem = document.getElementById('iceEmpowermentIcon');

	if (getEmpowerment() !== 'Ice') {
		game.empowerments.Ice.currentDebuffPower = 0;
		if (elem && elem.style.display !== 'none') {
			elem.style.display = 'none';
		}
		return;
	}

	if (!shouldUpdate()) return;

	if (!elem) {
		document.getElementById('badDebuffSpan').innerHTML += `<span class="badge badBadge" id="iceEmpowermentIcon" onmouseover="tooltip('Chilled', null, event)" onmouseout="tooltip('hide')"><span id="iceEmpowermentText"></span><span class="glyphicon glyphicon-certificate"></span></span>`;
		elem = document.getElementById('iceEmpowermentIcon');
	}

	if (elem.style.display !== 'inline-block') {
		elem.style.display = 'inline-block';
	}

	const iceEmpowermentText = document.getElementById('iceEmpowermentText');
	const newIceEmpowermentText = prettify(game.empowerments.Ice.currentDebuffPower);
	if (iceEmpowermentText && iceEmpowermentText.innerHTML != newIceEmpowermentText) {
		iceEmpowermentText.innerHTML = newIceEmpowermentText;
	}
}

function handleWindDebuff() {
	let elem = document.getElementById('windEmpowermentIcon');
	if (getEmpowerment() !== 'Wind') {
		game.empowerments.Wind.currentDebuffPower = 0;
		if (elem && elem.style.display !== 'none') {
			elem.style.display = 'none';
		}
		return;
	}

	if (!shouldUpdate()) return;

	if (!elem) {
		document.getElementById('badDebuffSpan').innerHTML += `<span class="badge badBadge" id="windEmpowermentIcon" onmouseover="tooltip('Breezy', null, event)" onmouseout="tooltip('hide')"><span id="windEmpowermentText"></span><span class="icomoon icon-air"></span></span>`;
		elem = document.getElementById('windEmpowermentIcon');
	}

	if (elem.style.display !== 'inline-block') {
		elem.style.display = 'inline-block';
	}

	const windMaxStacks = game.empowerments.Wind.stackMax();
	if (game.empowerments.Wind.currentDebuffPower > windMaxStacks) {
		game.empowerments.Wind.currentDebuffPower = windMaxStacks;
	}

	const windEmpowermentText = document.getElementById('windEmpowermentText');
	const newWindEmpowermentText = prettify(game.empowerments.Wind.currentDebuffPower);
	if (windEmpowermentText && windEmpowermentText.innerHTML != newWindEmpowermentText) {
		windEmpowermentText.innerHTML = newWindEmpowermentText;
	}
}

function calculateDamage(number = 1, buildString, isTrimp, noCheckAchieve, cell, noFluctuation) {
	//number = base attack
	let fluctuation = 0.2; // % fluctuation
	let maxFluct = -1;
	let minFluct = -1;
	if (getPerkLevel('Equality')) number *= game.portal.Equality.getMult(isTrimp);

	if (isTrimp) {
		//Situational Trimp damage increases
		const fluctChallenge = challengeActive('Discipline') || challengeActive('Unlucky');
		if (fluctChallenge) fluctuation = 0.995;
		if (!fluctChallenge && getPerkLevel('Range') > 0) minFluct = fluctuation - 0.02 * getPerkLevel('Range');
		const heirloomAttack = calcHeirloomBonus('Shield', 'trimpAttack', 1, false);

		const multipliers = {
			achievementBonus: () => 1 + game.global.achievementBonus / 100,
			goldenBattle: () => 1 + game.goldenUpgrades.Battle.currentBonus,
			heirloom: () => heirloomAttack,
			challengeSquared: () => 1 + game.global.totalSquaredReward / 100,
			titimp: () => (game.global.mapsActive && game.global.titimpLeft > 0 ? 2 : 1),
			roboTrimp: () => 1 + 0.2 * game.global.roboTrimpLevel,
			mapBonus: () => (game.global.mapsActive ? 1 : game.talents.mapBattery.purchased && game.global.mapBonus === 10 ? 5 : 1 + game.global.mapBonus * 0.2),
			herbalist: () => (game.talents.herbalist.purchased ? game.talents.herbalist.getBonus() : 1),
			bionic2: () => (game.global.mapsActive && game.talents.bionic2.purchased && getCurrentMapObject().level > game.global.world ? 1.5 : 1),
			voidPower: () => (game.talents.voidPower.purchased && game.global.voidBuff ? 1 + game.talents.voidPower.getTotalVP() / 100 : 1),
			voidMastery: () => (game.talents.voidMastery.purchased && game.global.voidBuff ? 5 : 1),
			fluffy: () => (Fluffy.isActive() ? Fluffy.getDamageModifier() : 1),
			mayhem: () => game.challenges.Mayhem.getTrimpMult(),
			pandemonium: () => game.challenges.Pandemonium.getTrimpMult(),
			desolation: () => game.challenges.Desolation.getTrimpMult(),
			sugarRush: () => (game.global.sugarRush ? sugarRush.getAttackStrength() : 1),
			strengthTowers: () => 1 + playerSpireTraps.Strength.getWorldBonus() / 100,
			sharpTrimps: () => (game.singleRunBonuses.sharpTrimps.owned ? 1.5 : 1)
		};

		number = applyMultipliers(multipliers, number);

		if (game.global.universe === 1) {
			const worldCell = getCurrentWorldCell();
			const scryerBonusActive = ['Corruption', 'Healthy'].includes(worldCell.mutation) && game.talents.scry.purchased && !game.global.mapsActive && isScryerBonusActive();

			const multipliers = {
				anticipation: () => (game.global.antiStacks > 0 ? game.global.antiStacks * getPerkLevel('Anticipation') * game.portal.Anticipation.modifier + 1 : 1),
				magmamancer: () => (game.talents.magmamancer.purchased ? game.jobs.Magmamancer.getBonusPercent() : 1),
				stillRowing: () => (game.talents.stillRowing2.purchased ? game.global.spireRows * 0.06 + 1 : 1),
				kerfluffle: () => (Fluffy.isActive() && game.talents.kerfluffle.purchased ? game.talents.kerfluffle.mult() : 1),
				strengthInHealth: () => (game.talents.healthStrength.purchased && mutations.Healthy.active() ? 0.15 * mutations.Healthy.cellCount() + 1 : 1),
				voidSipon: () => (game.stats.totalVoidMaps.value && Fluffy.isRewardActive('voidSiphon') ? 1 + game.stats.totalVoidMaps.value * 0.05 : 1),
				amalgamator: () => game.jobs.Amalgamator.getDamageMult(),
				poisionEmpowerment: () => (getUberEmpowerment() === 'Poison' ? 3 : 1),
				frigid: () => game.challenges.Frigid.getTrimpMult(),
				scryerBonus: () => (scryerBonusActive ? 2 : 1),
				iceEmpowerment: () => (getEmpowerment() === 'Ice' ? 1 + game.empowerments.Ice.getDamageModifier() : 1)
			};

			number = applyMultipliers(multipliers, number);

			const challengeMultipliers = {
				Decay: () => 5 * Math.pow(0.995, game.challenges.Decay.stacks),
				Electricity: () => 1 - game.challenges.Electricity.stacks * 0.1,
				Life: () => game.challenges.Life.getHealthMult(),
				Lead: () => (game.global.world % 2 === 1 ? 1.5 : 1)
			};

			number = applyMultipliers(challengeMultipliers, number, true);

			if (game.global.antiStacks > 0) updateAntiStacks();
		}

		if (game.global.universe === 2) {
			const multipliers = {
				smithy: () => game.buildings.Smithy.getMult(),
				hunger: () => game.portal.Hunger.getMult(),
				tenacity: () => game.portal.Tenacity.getMult(),
				spireStats: () => autoBattle.bonuses.Stats.getMult(),
				championism: () => game.portal.Championism.getMult(),
				frenzy: () => (game.portal.Frenzy.frenzyActive() ? 1 + 0.5 * getPerkLevel('Frenzy') : 1),
				observation: () => game.portal.Observation.getMult(),
				mutatorAttack: () => (u2Mutations.tree.Attack.purchased ? 1.5 : 1),
				geneAttack: () => (u2Mutations.tree.GeneAttack.purchased ? 10 : 1),
				brainsToBrawn: () => (u2Mutations.tree.Brains.purchased ? u2Mutations.tree.Brains.getBonus() : 1),
				novaStacks: () => (!game.global.mapsActive && game.global.novaMutStacks > 0 ? u2Mutations.types.Nova.trimpAttackMult() : 1),
				spireDaily: () => (challengeActive('Daily') && Fluffy.isRewardActive('SADailies') ? Fluffy.rewardConfig.SADailies.attackMod() : 1),
				spireStats: () => (game.global.u2SpireCellsBest > 0 ? u2SpireBonuses.basics() : 1),
				spireAttack: () => (!game.global.mapsActive && game.global.spireActive && game.global.spireMutStacks > 0 ? u2Mutations.types.Spire1.trimpAttackMult() : 1)
			};

			number = applyMultipliers(multipliers, number);

			const challengeMultipliers = {
				Unbalance: () => game.challenges.Unbalance.getAttackMult(),
				Duel: () => (game.challenges.Duel.trimpStacks > 50 ? 3 : 1),
				Melt: () => 5 * Math.pow(0.99, game.challenges.Melt.stacks),
				Quagmire: () => game.challenges.Quagmire.getExhaustMult(),
				Revenge: () => game.challenges.Revenge.getMult(),
				Quest: () => game.challenges.Quest.getAttackMult(),
				Archaeology: () => game.challenges.Archaeology.getStatMult('attack'),
				Storm: () => (game.global.mapsActive ? game.challenges.Storm.getMapMult() : 1),
				Berserk: () => game.challenges.Berserk.getAttackMult(),
				Nurture: () => game.challenges.Nurture.getStatBoost(),
				Alchemy: () => alchObj.getPotionEffect('Potion of Strength'),
				Desolation: () => game.challenges.Desolation.trimpAttackMult(),
				Smithless: () => game.challenges.Smithless.getTrimpMult()
			};
			number = applyMultipliers(challengeMultipliers, number, true);
		}

		if (challengeActive('Daily')) {
			if (game.talents.daily.purchased) number *= 1.5;

			if (typeof game.global.dailyChallenge.minDamage !== 'undefined') {
				if (minFluct === -1) minFluct = fluctuation;
				minFluct += dailyModifiers.minDamage.getMult(game.global.dailyChallenge.minDamage.strength);
			}

			if (typeof game.global.dailyChallenge.maxDamage !== 'undefined') {
				if (maxFluct === -1) maxFluct = fluctuation;
				maxFluct += dailyModifiers.maxDamage.getMult(game.global.dailyChallenge.maxDamage.strength);
			}

			number *= applyDailyMultipliers('weakness', 1);
			number *= applyDailyMultipliers('rampage', 1);
			if (game.global.world % 2 === 1) number *= applyDailyMultipliers('oddTrimpNerf', 1);
			if (game.global.world % 2 === 0) number *= applyDailyMultipliers('evenTrimpBuff', 1);
		}
	} else {
		//Situational Bad Guy damage increases
		if (game.global.universe === 1) {
			const challengeMultipliers = {
				Meditate: () => 1.5,
				Coordinate: () => getBadCoordLevel(),
				Nom: () => (typeof cell.nomStacks !== 'undefined' ? Math.pow(1.25, cell.nomStacks) : 1),
				Watch: () => 1.25,
				Lead: () => 1 + Math.min(game.challenges.Lead.stacks, 200) * 0.04,
				Corrupted: () => 3,
				Scientist: () => (getScientistLevel() === 5 ? 10 : 1)
			};
			number = applyMultipliers(challengeMultipliers, number, true, false);
			if (game.global.usingShriek) number *= game.mapUnlocks.roboTrimp.getShriekValue();
		}

		if (game.global.universe === 2) {
			fluctuation = 0.5;
			const challengeMultipliers = {
				Duel: () => (game.challenges.Duel.enemyStacks > 50 ? 3 : 1),
				Wither: () => game.challenges.Wither.getEnemyAttackMult(),
				Archaeology: () => game.challenges.Archaeology.getStatMult('enemyAttack'),
				Mayhem: () => (!game.global.mapsActive && cell && cell.level === 100 ? game.challenges.Mayhem.getBossMult() : 1),
				Nurture: () => 2 * game.buildings.Laboratory.getEnemyMult(),
				Pandemonium: () => (!game.global.mapsActive && cell && cell.level === 100 ? game.challenges.Pandemonium.getBossMult() : game.challenges.Pandemonium.getPandMult()),
				Glass: () => game.challenges.Glass.attackMult()
			};
			number = applyMultipliers(challengeMultipliers, number, true, false);

			if (!game.global.mapsActive && game.global.novaMutStacks > 0) number *= u2Mutations.types.Nova.enemyAttackMult();
			if (!game.global.mapsActive && game.global.spireActive && game.global.spireMutStacks > 0) number *= u2Mutations.types.Spire1.enemyAttackMult();
			if (cell.u2Mutation && cell.u2Mutation.length && u2Mutations.types.Rage.hasRage(cell)) number *= u2Mutations.types.Rage.enemyAttackMult();
		}

		if (challengeActive('Daily')) {
			number *= applyDailyMultipliers('bloodthirst', 1);
			number *= applyDailyMultipliers('badStrength', 1);
			if (game.global.mapsActive) number *= applyDailyMultipliers('badMapStrength', 1);
			if (!game.global.mapsActive) number *= applyDailyMultipliers('empower', 1);
		}

		//Keep ice last for achievements
		if (getEmpowerment() === 'Ice') {
			number *= game.empowerments.Ice.getCombatModifier();
			if (number >= 0 && number < 1 && !game.global.mapsActive) giveSingleAchieve('Brr');
		}

		if (game.global.world >= getObsidianStart() && !game.global.mapsActive) number = Infinity;
	}

	if (minFluct > 1) minFluct = 1;
	if (maxFluct < 0) maxFluct = fluctuation;
	if (minFluct < 0) minFluct = fluctuation;

	const min = Math.floor(number * (1 - minFluct));
	if (noFluctuation) return min;

	const max = Math.ceil(number + number * maxFluct);
	const runningUnlucky = challengeActive('Unlucky');
	let actuallyLucky = false;

	if (buildString || runningUnlucky) {
		let critMin = min;
		let critMax = max;
		if (isTrimp) {
			if (noCheckAchieve) return max;
			const critChance = getPlayerCritChance();

			if (critChance >= 1) {
				const critDamage = getPlayerCritDamageMult();
				number *= critDamage;
				if (Math.floor(critChance) >= 2) number *= getMegaCritDamageMult(Math.floor(critChance));
				critMin = Math.floor(number * (1 - minFluct));
				critMax = Math.ceil(number + number * maxFluct);
			}

			if (!buildString && isTrimp) {
				//Aka running unlucky but not building a string
				if (Number(critMin.toString()[0]) % 2 === 0) actuallyLucky = true;
				game.challenges.Unlucky.lastHitLucky = actuallyLucky;
			} else {
				checkAchieve('damage', critMax);
			}
		}

		if (buildString) {
			//Aka maybe running Unlucky but probably not but just building a string anyways
			return prettify(critMin) + '-' + prettify(critMax);
		}
	}

	function rollMax() {
		return Math.floor(Math.random() * (max + 1 - min)) + min;
	}

	if (runningUnlucky && isTrimp) {
		let worst = rollMax();
		let best = worst;
		for (let x = 0; x < 4; x++) {
			const roll = rollMax();
			if (roll < worst) worst = roll;
			if (roll > best) best = roll;
		}
		if (actuallyLucky) return best;
		return worst;
	}

	return rollMax();
}

function buyBuilding(what, confirmed, fromAuto, forceAmt) {
	if (game.options.menu.pauseGame.enabled || what === 'Hub' || game.global.clearingBuildingQueue) return false;
	if (!forceAmt && !confirmed && game.options.menu.lockOnUnlock.enabled === 1 && new Date().getTime() - 1000 <= game.global.lastUnlock) return false;

	const toBuy = game.buildings[what];
	if (typeof toBuy === 'undefined') return false;

	let purchaseAmt = 1;
	if (what === 'Antenna') purchaseAmt = 1;
	else if (forceAmt) purchaseAmt = Math.min(forceAmt, calculateMaxAfford(toBuy, true, false, false, true));
	else if (!toBuy.percent) purchaseAmt = game.global.buyAmt === 'Max' ? calculateMaxAfford(toBuy, true, false) : game.global.buyAmt;
	purchaseAmt = Math.min(purchaseAmt, 1e10);

	const canAfford = forceAmt ? canAffordBuilding(what, false, false, false, false, purchaseAmt) : canAffordBuilding(what);
	if (purchaseAmt === 0 || !canAfford) return false;

	if (what === 'Wormhole' && !confirmed && game.options.menu.confirmhole.enabled && !fromAuto) {
		tooltip('Confirm Purchase', null, 'update', `You are about to purchase ${purchaseAmt} Wormholes, <b>which cost helium</b>. Make sure you can earn back what you spend!`, `buyBuilding('Wormhole', true, false, ${purchaseAmt})`);
		return false;
	}

	if (forceAmt) canAffordBuilding(what, true, false, false, false, purchaseAmt);
	else canAffordBuilding(what, true);
	game.buildings[what].purchased += purchaseAmt;

	if (getCraftTime(game.buildings[what]) === 0) buildBuilding(what, purchaseAmt);
	else startQueue(what, purchaseAmt);

	if (!fromAuto) tooltip(what, 'buildings', 'update');
	return true;
}

function craftBuildings(makeUp) {
	const buildingsBar = document.getElementById('animationDiv');
	//if (!buildingsBar && !usingRealTimeOffline) return;
	if (!buildingsBar) return;

	const buildingsQueue = game.global.buildingsQueue;
	const timeRemaining = document.getElementById('queueTimeRemaining');
	const speedElem = document.getElementById('buildSpeed');

	if (game.global.crafting === '' && buildingsQueue.length > 0) {
		setNewCraftItem();
	}

	if ((game.global.autoCraftModifier <= 0 && game.global.playerGathering !== 'buildings') || game.global.crafting === '') {
		//if (!usingRealTimeOffline && speedElem.innerHTML !== '') speedElem.innerHTML = '';
		if (speedElem.innerHTML !== '') speedElem.innerHTML = '';
		return;
	}

	let modifier = game.global.autoCraftModifier > 0 ? game.global.autoCraftModifier : 0;
	if (game.global.playerGathering === 'buildings') modifier += getPlayerModifier();

	if (!makeUp) {
		let elemText = `${prettify(Math.floor(modifier * 100))}%`;
		if (speedElem.innerHTML !== elemText) speedElem.innerHTML = elemText;
		game.global.timeLeftOnCraft -= (1 / game.settings.speed) * modifier;
		const percent = 1 - game.global.timeLeftOnCraft / getCraftTime(game.buildings[game.global.crafting]);

		let timeLeft = (game.global.timeLeftOnCraft / modifier).toFixed(1);
		if (timeLeft < 0.1 || isNumberBad(timeLeft)) timeLeft = 0.1;
		elemText = ` - ${timeLeft} Seconds`;
		if (timeRemaining && timeRemaining.textContent !== elemText) timeRemaining.textContent = elemText;
		//if (timeRemaining && timeRemaining.textContent !== elemText && !usingRealTimeOffline) timeRemaining.textContent = elemText;

		if (buildingsBar) buildingsBar.style.opacity = game.options.menu.queueAnimation.enabled ? percent : '0';
		if (game.global.timeLeftOnCraft > 0) return;
	}

	if (game.global.trapBuildToggled && game.global.trapBuildAllowed && buildingsQueue.length === 1 && buildingsQueue[0] === 'Trap.1') {
		buildBuilding(game.global.crafting);
		autoTrap();
		return;
	}

	removeQueueItem('first');

	if (game.global.buildingsQueue.length === 0) {
		checkEndOfQueue();
	} else {
		setNewCraftItem();
	}
}

function setNewCraftItem() {
	const queueItem = game.global.buildingsQueue[0].split('.')[0];
	game.global.crafting = queueItem;
	game.global.timeLeftOnCraft = getCraftTime(game.buildings[queueItem]);
	//if (usingRealTimeOffline) return;

	const elem = document.getElementById('queueItemsHere').firstChild;
	let timeLeft = (game.global.timeLeftOnCraft / (game.global.autoCraftModifier + getPlayerModifier())).toFixed(1);

	if (elem) {
		const timeElem = document.getElementById('queueTimeRemaining');
		if (timeLeft < 0.1 || isNumberBad(timeLeft)) timeLeft = 0.1;
		if (!timeElem) elem.innerHTML += "<span id='queueTimeRemaining'> - " + timeLeft + " Seconds</span><div id='animationDiv'></div>";
		else timeElem.textContent = ' - ' + timeLeft + ' Seconds';
	}

	if (elem && timeLeft <= 0.1) {
		timeLeft = 0.1;
		if (game.options.menu.queueAnimation.enabled) document.getElementById('animationDiv').style.opacity = '1';
	}
}

//Buildings Specific
function removeQueueItem(what, force) {
	if (game.options.menu.pauseGame.enabled && !force) return;
	const queue = document.getElementById('queueItemsHere');
	if (what === 'first') {
		let multiCraftMax = bwRewardUnlocked('DecaBuild') ? 10 : bwRewardUnlocked('DoubleBuild') ? 2 : 1;
		let [item, amount] = game.global.buildingsQueue[0].split('.');
		amount = parseInt(amount, 10);
		multiCraftMax = Math.min(multiCraftMax, amount);

		amount -= multiCraftMax;
		buildBuilding(item, multiCraftMax);

		const elem = queue.firstChild;
		if (amount > 0) {
			const newQueue = `${item}.${amount}`;
			const name = `${item} X${amount}`;
			game.global.buildingsQueue[0] = newQueue;
			//if (!usingRealTimeOffline && elem)
			if (elem) elem.firstChild.innerHTML = name;
		} else {
			//if (!usingRealTimeOffline)
			queue.removeChild(elem);
			game.global.buildingsQueue.splice(0, 1);
		}

		checkEndOfQueue();
		return;
	}

	let index = getQueueElemIndex(what, queue);
	let queueItem = game.global.buildingsQueue[index];

	if (!queueItem) {
		queueItem = game.global.buildingsQueue[0];
		index = 0;
	}

	const elem = document.getElementById(what);
	queue.removeChild(elem);
	refundQueueItem(queueItem);
	game.global.buildingsQueue.splice(index, 1);

	if (index === 0) {
		game.global.crafting = '';
		game.global.timeLeftOnCraft = 0;
	}

	checkEndOfQueue();
}

function buildBuilding(what, amt = 1) {
	const building = game.buildings[what];
	if (building.owned === 0 && typeof building.first !== 'undefined') building.first();
	building.owned += amt;
	let toIncrease;
	checkAchieve('housing', what);

	const ownedElem = document.getElementById(what + 'Owned');
	if (ownedElem && shouldUpdate()) ownedElem.innerHTML = building.owned;

	if (typeof building.increase !== 'undefined') {
		if (building.increase.what === 'trimps.max') {
			addMaxHousing(building.increase.by * amt, bwRewardUnlocked('AutoStructure'));
		} else {
			const buildingSplit = building.increase.what.split('.');
			if (buildingSplit[0] === 'global') toIncrease = game.global;
			else if (buildingSplit[0] === 'Dragimp') toIncrease = game.jobs.Dragimp;
			else toIncrease = game.resources[buildingSplit[0]];
			if (buildingSplit[2] === 'mult') toIncrease[buildingSplit[1]] = parseFloat(toIncrease[buildingSplit[1]]) * parseFloat(Math.pow(building.increase.by, amt)).toFixed(5);
			else toIncrease[buildingSplit[1]] += parseFloat(building.increase.by) * amt;
		}
	}

	if (typeof building.fire !== 'undefined') {
		for (let x = 0; x < amt; x++) {
			building.fire();
		}
	}

	if (what === 'Wormhole') {
		const [baseCost, costRatio] = building.cost.helium;
		let spent = Math.floor(baseCost * Math.pow(costRatio, building.owned - 1));
		if (getPerkLevel('Resourceful')) spent = Math.ceil(spent * Math.pow(1 - game.portal.Resourceful.modifier, getPerkLevel('Resourceful')));

		game.global.totalHeliumEarned -= parseFloat(spent);
		game.stats.spentOnWorms.value += parseFloat(spent);
		if (game.stats.spentOnWorms.value + game.stats.spentOnWorms.valueTotal > 250000) giveSingleAchieve('Holey');
	}

	numTab();

	if (!game.buildings.Hub.locked) {
		const hubbable = ['Hut', 'House', 'Mansion', 'Hotel', 'Resort', 'Gateway', 'Collector'];
		if (!hubbable.includes(what)) return;

		let hubAmt = 1;
		if (what === 'Collector' && autoBattle.oneTimers.Collectology.owned) {
			hubAmt = autoBattle.oneTimers.Collectology.getHubs();
		}
		buildBuilding('Hub', hubAmt * amt);
	}
}

function addQueueItem(what) {
	const elem = document.getElementById('queueItemsHere');
	document.getElementById('noQueue').style.display = 'none';
	const [baseName, multiplier] = what.split('.');
	const name = multiplier > 1 ? `${baseName} X${prettify(multiplier)}` : baseName;
	//if (!usingRealTimeOffline)
	elem.innerHTML += '<div class="queueItem" id="queueItem' + game.global.nextQueueId + '" onmouseover="tooltip(\'Queue\',null,event)" onmouseout="tooltip(\'hide\')" onClick="removeQueueItem(\'queueItem' + game.global.nextQueueId + '\'); cancelTooltip();"><span class="queueItemName">' + name + '</span><div id="animationDiv"></div></div>';
	if (game.global.nextQueueId === 0) setNewCraftItem();
	game.global.nextQueueId++;
}

function numTab(what, p) {
	let num = 0;
	if (what === 6 && game.global.buyAmt === 'Max') tooltip('Max', null, 'update', p);
	if (what === 5) {
		unlockTooltip();
		tooltip('hide');

		const numBox = document.getElementById('customNumberBox');
		if (numBox) {
			num = numBox.value;
			game.global.lastCustomExact = num;
			if (game.global.firstCustomExact === -1) game.global.firstCustomExact = num;
			if (num.split('%')[1] === '') {
				num = num.split('%');
				num[0] = parseFloat(num[0]);
				if (num[0] <= 100 && num[0] >= 0) {
					const workspaces = game.workspaces;
					num = Math.floor(workspaces * (num[0] / 100));
				} else num = 1;
			} else if (num.split('/')[1]) {
				num = num.split('/');
				num[0] = parseFloat(num[0]);
				num[1] = parseFloat(num[1]);
				const workspaces = game.workspaces;
				num = Math.floor(workspaces * (num[0] / num[1]));
				if (num < 0 || num > workspaces) num = 1;
			} else {
				num = convertNotationsToNumber(num);
			}
		} else {
			num = game.global.lastCustomAmt;
		}

		if (num === 0) num = 1;
		if (!isNumberBad(num)) {
			const elemText = `+${prettify(num)}`;
			let elem = document.getElementById('tab5Text');
			if (elem && elem.innerHTML !== elemText) elem.innerHTML = elemText;

			elem = document.getElementById('ptab5Text');
			if (elem && elem.innerHTML !== elemText) elem.innerHTML = elemText;

			game.global.buyAmt = num;
			game.global.lastCustomAmt = num;
			if (game.global.firstCustomAmt === -1) game.global.firstCustomAmt = num;
		} else {
			if (numBox && numBox.value === 'pants' && game.global.sLevel >= 4) {
				//Dedicated to Sleeves, who would be upset if I never added a pants easter egg.
				pantsMode = true;
				message('Get a leg up with PANTS! Until your next trou... browser refresh, you can enable the useless but stylish PANTS ONLY AutoPrestige setting! Denim-ite!', 'Notices');
				return;
			}
			message('Please use a number greater than 0!', 'Notices');
			return;
		}
	}

	if (typeof what === 'undefined') what = game.global.numTab;
	else game.global.numTab = what;

	const tabType = p ? 'ptab' : 'tab';
	const count = 6;
	for (let x = 1; x <= count; x++) {
		const thisTab = document.getElementById(tabType + x);
		if (what === x) thisTab.className = thisTab.className.replace('tabNotSelected', 'tabSelected');
		else thisTab.className = thisTab.className.replace('tabSelected', 'tabNotSelected');
		if (x === 5) continue;
		switch (x) {
			case 1:
				num = 1;
				break;
			case 2:
				num = 10;
				break;
			case 3:
				num = 25;
				break;
			case 4:
				num = 100;
				break;
			case 6:
				num = 'Max';
		}

		if (x === what) game.global.buyAmt = num;
	}
	const elem = document.getElementById(tabType + '6Text');
	const elemText = what === 6 && game.global.maxSplit !== 1 ? game.global.maxSplit : 'Max';
	if (elem && elem.innerHTML != elemText) elem.innerHTML = elemText;

	if (p) {
		displayPortalUpgrades(true);
	}
}

function prestigeEquipment(what, fromLoad = false, noInc = false) {
	const equipment = game.equipment[what];
	if (!fromLoad && !noInc) equipment.prestige++;

	const prestigeMod = equipment.prestige >= 4 ? (equipment.prestige - 3) * 0.85 + 2 : equipment.prestige - 1;
	const resource = what === 'Shield' ? 'wood' : 'metal';
	const cost = equipment.cost[resource];
	cost[0] = Math.round(equipment.oc * Math.pow(1.069, prestigeMod * game.global.prestige.cost + 1));

	const stat = equipment.blockNow ? 'block' : typeof equipment.health !== 'undefined' ? 'health' : 'attack';
	if (!fromLoad) game.global[stat] -= equipment[stat + 'Calculated'] * equipment.level;
	if (!fromLoad) game.global.difs[stat] -= equipment[stat + 'Calculated'] * equipment.level;
	equipment[stat + 'Calculated'] = Math.round(equipment[stat] * Math.pow(1.19, (equipment.prestige - 1) * game.global.prestige[stat] + 1));

	// No need to touch level if it's newNum
	if (fromLoad) return;
	equipment.level = 0;
	if (!noInc) levelEquipment(what, 1);
	if (game.global[stat] <= 0) game.global[stat] = calcBaseStats(stat);

	const numeral = usingScreenReader ? prettify(equipment.prestige) : romanNumeral(equipment.prestige);
	const equipElem = document.getElementById(`${what}Numeral`);
	if (equipElem !== null) equipElem.innerHTML = numeral;

	displayEfficientEquipment();
}

function calcBaseStats(equipType = 'attack') {
	const equipmentTypes = {
		attack: ['Dagger', 'Mace', 'Polearm', 'Battleaxe', 'Greatsword', 'Arbalest'],
		health: ['Shield', 'Boots', 'Helmet', 'Pants', 'Shoulderguards', 'Breastplate', 'Gambeson'],
		block: game.equipment.Shield.blockNow ? ['Shield'] : []
	};

	const bonusValues = {
		attack: 6,
		health: 50,
		block: 0
	};

	let bonus = bonusValues[equipType] || 0;
	let equipmentList = equipmentTypes[equipType] || [];

	for (let i = 0; i < equipmentList.length; i++) {
		const equip = game.equipment[equipmentList[i]];
		if (equip.locked || (equip.blockNow && equipType === 'health')) continue;
		bonus += equip[equipType + 'Calculated'] * equip.level;
	}

	return bonus;
}

function abandonChallengeResetEnemy() {
	const worldCell = game.global.gridArray[game.global.lastClearedCell + 1];
	if (!worldCell) return;

	let statChallenge = false;
	let statMaps = false;

	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.badHealth !== 'undefined') {
			statChallenge = true;
		}

		if (typeof game.global.dailyChallenge.empower !== 'undefined') {
			statChallenge = true;
		}

		if (typeof game.global.dailyChallenge.badMapHealth !== 'undefined' && game.global.currentMapId !== '') {
			statMaps = true;
		}

		if (typeof game.global.dailyChallenge.empoweredVoid !== 'undefined' && game.global.voidBuff === 'Void') {
			statMaps = true;
		}
	}

	if (game.global.universe === 1) {
		const challenges = ['Meditate', 'Scientist', 'Balance', 'Life', 'Toxicity', 'Coordinate', 'Corrupted', 'Domination', 'Obliterated', 'Eradicated', 'Frigid', 'Experience'];
		statChallenge = challenges.some((challenge) => challengeActive(challenge));

		if (challengeActive('Lead') && game.challenges.Lead.stacks > 0) {
			statChallenge = true;
		}

		statMaps = statChallenge;
	}

	if (game.global.universe === 2) {
		const challenges = ['Unbalance', 'Duel', 'Wither', 'Quest', 'Archaeology', 'Mayhem', 'Exterminate', 'Nurture', 'Pandemonium', 'Alchemy', 'Glass', 'Hypothermia', 'Desolation'];
		statChallenge = challenges.some((challenge) => challengeActive(challenge));

		if (challengeActive('Revenge') && game.global.world % 2 === 0) {
			statChallenge = true;
		}

		statMaps = statChallenge;

		if (challengeActive('Storm')) {
			statChallenge = true;
		} else if (challengeActive('Exterminate')) {
			statChallenge = true;
		} else if (challengeActive('Smithless') && game.global.world % 25 === 0 && worldCell.ubersmith && !worldCell.failedUber) {
			statChallenge = true;
		}
	}

	return [statChallenge, statMaps];
}

function abandonChallenge(restart) {
	/* Temp inclusion for graphs to still track this the way Quia intends if this file is loaded after graphs is. */
	if (typeof Graphs !== 'undefined' && typeof Graphs.Push !== 'undefined' && typeof Graphs.Push.zoneData === 'function') Graphs.Push.zoneData();

	let challengeName = game.global.challengeActive;
	let challenge = game.challenges[challengeName];
	const [resetWorld, resetMap] = abandonChallengeResetEnemy();
	if (game.global.universe === 2 && (game.global.runningChallengeSquared || challengeName === 'Daily')) game.global.u2MutationSeed = game.global.ogU2MutationSeed;

	if (game.global.runningChallengeSquared) {
		let challengeList;
		if (challenge.multiChallenge) challengeList = challenge.multiChallenge;
		else challengeList = [challengeName];

		game.global.challengeActive = '';
		game.global.multiChallenge = {};

		for (let x = 0; x < challengeList.length; x++) {
			if (game.global.world > game.c2[challengeList[x]]) game.c2[challengeList[x]] = game.global.world;
			if (typeof game.challenges[challengeList[x]].abandon !== 'undefined' && game.challenges[challengeList[x]].fireAbandon) game.challenges[challengeList[x]].abandon();
		}

		if (game.global.capTrimp && game.c2.Trimp > 230) game.c2.Trimp = 230;
		countChallengeSquaredReward();

		if (!restart) {
			fadeIn('helium', 10);
			game.global.runningChallengeSquared = false;
			if (game.global.universe === 2 && (game.global.world > 30 || (game.global.world === 30 && game.global.lastClearedCell >= 29))) unlockJob('Meteorologist');
		}
	} else if (challenge.fireAbandon && typeof challenge.abandon !== 'undefined') {
		game.global.challengeActive = '';
		challenge.abandon();
	}

	game.global.challengeActive = '';
	cancelPortal();

	if (challengeName === 'Scientist') {
		document.getElementById('scienceCollectBtn').style.display = 'block';
	}

	if (game.challenges[challengeName].mustRestart) {
		if (restart) game.global.selectedChallenge = challengeName;
		resetGame(true);
	}

	if (resetWorld || resetMap) {
		if (resetWorld) {
			const worldCell = game.global.gridArray[game.global.lastClearedCell + 1];
			if (worldCell) worldCell.maxHealth = -1;
		}

		if (resetMap && game.global.currentMapId !== '') {
			const mapCell = game.global.mapGridArray[game.global.lastClearedMapCell + 1];
			mapCell.maxHealth = -1;
		}

		if (game.global.fighting) game.global.fighting = false;
	}

	if (challengeName !== 'Daily') message('Your challenge has been abandoned.', 'Notices');
	refreshMaps();
}

function runMapAtZone(index) {
	const setting = game.options.menu.mapAtZone.getSetZone()[index];
	const quagCheck = setting.preset === 5 && !challengeActive('Quagmire');
	const voidCheck = setting.preset === 4 && !getNextVoidId();
	const runUniqueMap = setting.preset === 3 || setting.preset === 5 || setting.preset >= 8;
	let uniqueMap = false;

	if (setting.check && (quagCheck || voidCheck)) {
		checkMapAtZoneWorld(true);
		return;
	}

	if (runUniqueMap) {
		const mapLocations = ['Melting', 'Frozen', 'Atlantis'];
		const location = setting.preset === 3 ? 'Bionic' : setting.preset === 5 ? 'Darkness' : mapLocations[setting.preset - 8];

		for (let x = 0; x < game.global.mapsOwnedArray.length; x++) {
			if (game.global.mapsOwnedArray[x].location === location) {
				uniqueMap = game.global.mapsOwnedArray[x];
				break;
			}
		}
	}

	if (runUniqueMap && !uniqueMap) {
		checkMapAtZoneWorld(true);
		return;
	}

	if (setting.cell === 100 && (challengeActive('Mayhem') || challengeActive('Pandemonium'))) {
		startFight();
	}

	mapsClicked(true);
	if (game.global.spireActive && game.global.lastClearedCell !== -1) deadInSpire();
	toggleSetting('mapAtZone', null, false, true);

	if (!setting || !setting.check) {
		checkMapAtZoneWorld(true);
		return;
	}

	if (challengeActive('Quest') && game.challenges.Quest.questId === 5 && !game.challenges.Quest.questComplete) {
		if (game.global.lastClearedCell === 98) game.challenges.Quest.checkQuest();
		else {
			game.challenges.Quest.questProgress++;
			if (game.challenges.Quest.questProgress === 1) game.challenges.Quest.failQuest();
		}
	}

	//Don't change repeat if the setting is to run void maps, instead change void repeat
	if (setting.repeat && setting.preset !== 4) {
		game.global.repeatMap = setting.repeat === 1;
		if (usingRealTimeOffline) offlineProgress.repeatSetting = game.global.repeatMap;
		repeatClicked(true);
	}

	if (setting.exit) {
		game.options.menu.exitTo.enabled = setting.exit - 1;
		if (usingRealTimeOffline) offlineProgress.exitTo = game.options.menu.exitTo.enabled;
		toggleSetting('exitTo', null, false, true);
	}

	if (setting.until && setting.until !== 5) {
		if (setting.until >= 6) {
			game.options.menu.repeatUntil.enabled = 0;
		} else game.options.menu.repeatUntil.enabled = setting.until - 1;
		if (usingRealTimeOffline) offlineProgress.repeatUntil = game.options.menu.repeatUntil.enabled;
		toggleSetting('repeatUntil', null, false, true);
	}

	if (setting.preset === 3) {
		const nextBw = getNextBwId();

		if (nextBw) {
			game.options.menu.climbBw.enabled = setting.until === 5 ? 1 : 0;
			toggleSetting('climbBw', null, false, true);
			if (setting.until === 5) {
				//climbing
				game.global.mazBw = setting.bwWorld;
				//if repeating on zones
				if ((setting.times > 0 || setting.times === -2) && game.global.world > setting.world) {
					//see how many times this has repeated by zone, increase target climb level by appropriate amount for zones skipped
					const times = setting.times === -2 ? setting.tx : setting.times;
					const repeats = Math.round((game.global.world - setting.world) / times);
					if (repeats > 0) game.global.mazBw += times * repeats;
				}
				game.options.menu.repeatUntil.enabled = 2;
				if (usingRealTimeOffline) offlineProgress.repeatUntil = game.options.menu.repeatUntil.enabled;
				toggleSetting('repeatUntil', null, false, true);
			} else if (setting.until === 6) game.global.mapCounterGoal = 25;
			else if (setting.until === 7) game.global.mapCounterGoal = 50;
			else if (setting.until === 8) game.global.mapCounterGoal = 100;
			else if (setting.until === 9) game.global.mapCounterGoal = setting.rx;
			toggleSetting('repeatUntil', null, false, true);
			if (game.global.currentMapId) recycleMap();
			selectMap(nextBw);
			runMap();
		}

		return;
	} else if (setting.preset === 4) {
		const nextVoid = getNextVoidId();

		if (nextVoid) {
			if (setting.repeat) {
				game.options.menu.repeatVoids.enabled = setting.repeat === 1 ? 1 : 0;
			}
			if (game.global.currentMapId) recycleMap();
			selectMap(nextVoid);
			runMap();
		}

		return;
	} else if (runUniqueMap) {
		if (uniqueMap) {
			if (game.global.currentMapId) recycleMap();
			selectMap(uniqueMap.id);
			runMap();
		}

		if (setting.until === 6) game.global.mapCounterGoal = 25;
		else if (setting.until === 7) game.global.mapCounterGoal = 50;
		else if (setting.until === 8) game.global.mapCounterGoal = 100;
		else if (setting.until === 9) game.global.mapCounterGoal = setting.rx;

		return;
	}

	if (game.global.mapsOwnedArray.length >= 50) {
		recycleBelow(true, game.global.world - 3);
	}

	let preset = setting.preset;
	if (preset > 5) preset -= 3;

	selectAdvMapsPreset(preset + 1);
	const mapStatus = buyMap();

	if (mapStatus === 1) {
		if (game.global.currentMapId) recycleMap();
		selectMap(game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id);
		runMap();
	} else {
		checkMapAtZoneWorld(true);
		return;
	}

	if (setting.until === 6) game.global.mapCounterGoal = 25;
	if (setting.until === 7) game.global.mapCounterGoal = 50;
	if (setting.until === 8) game.global.mapCounterGoal = 100;
	if (setting.until === 9) game.global.mapCounterGoal = setting.rx;
	toggleSetting('repeatUntil', null, false, true);
}

function getOverkillerCount(getNumber) {
	let overkillerCount = 0;

	if (game.global.universe === 1) {
		overkillerCount = Fluffy.isRewardActive('overkiller');
		if (game.talents.overkill.purchased) overkillerCount++;
		if (getEmpowerment() === 'Ice') {
			const iceLevel = game.empowerments.Ice.getLevel();
			if (iceLevel >= 50) overkillerCount++;
			if (iceLevel >= 100) overkillerCount++;
		}
		if (getUberEmpowerment() === 'Ice') overkillerCount += 2;
	} else {
		if (!canU2Overkill() && !getNumber) return 0;
		if (u2Mutations.tree.MaxOverkill.purchased) overkillerCount++;
	}

	return overkillerCount;
}

function startFight() {
	if (game.global.challengeActive && typeof game.challenges[game.global.challengeActive].onStartFight === 'function') {
		game.challenges[game.global.challengeActive].onStartFight();
	}

	game.global.battleCounter = 0;
	document.getElementById('badGuyCol').style.visibility = 'visible';
	let cellNum;
	let cell;
	let cellElem;
	let badCoord;
	let instaFight = false;
	let ubersmithActive = false;
	let map = false;

	if (game.global.mapsActive) {
		cellNum = game.global.lastClearedMapCell + 1;
		cell = game.global.mapGridArray[cellNum];
		if (!cell) {
			mapsSwitch();
			console.log('Crash from missing map cell averted!');
			return;
		}
		cellElem = document.getElementById('mapCell' + cellNum);
		map = game.global.mapsOwnedArray[getMapIndex(game.global.currentMapId)];
	} else {
		cellNum = game.global.lastClearedCell + 1;
		cell = game.global.gridArray[cellNum];
		cellElem = document.getElementById('cell' + cellNum);
		if (!cellElem) {
			//Not sure what causes this to be needed, but on very rare occasions, this can prevent some save files from freezing on load
			if (game.global.lastClearedCell !== 99) {
				if (game.global.lastClearedCell === -1) {
					buildGrid();
					drawGrid();
					document.getElementById('battleContainer').style.visibility = 'visible';
					document.getElementById('metal').style.visibility = 'visible';
					console.log('Attempted to fight in World when no grid was initialized. Find an adult');
				}
				return;
			}

			nextWorld();
			game.stats.zonesCleared.value++;
			checkAchieve('totalZones');
			console.log('crisis averted');
			return;
		}
	}

	swapClass('cellColor', 'cellColorCurrent', cellElem);
	let badName = "<span id='actualBadName'>" + cell.name + '</span>';
	let displayedName;
	if (challengeActive('Coordinate')) badCoord = getBadCoordLevel();

	if (cell.name === 'Improbability' && game.global.spireActive) {
		displayedName = 'Druopitee';
		if (game.global.universe === 2) displayedName = game.global.spireLevel === 10 ? 'Stuffy' : 'Echo of Stuffy';
		if (badCoord) displayedName = 'Druopitee and Pals';
	} else if (cell.name === 'Omnipotrimp' && game.global.spireActive) {
		displayedName = 'Echo of Druopitee';
		if (badCoord) displayedName = "<span class='smallEnemyName'>Echoes of Druopitee and Pals</span>";
	} else if (cell.name === 'Improbability' && badCoord) {
		displayedName = 'Improbabilities';
	} else if (typeof game.badGuys[cell.name].displayName !== 'undefined') {
		badName = game.badGuys[cell.name].displayName;
		if (badCoord) badName += `s (${prettify(badCoord)})`;
		displayedName = `<span id='actualBadName'>${badName}</span>`;
	} else if (badCoord && !displayedName) {
		const newName = cell.name.replace('_', ' ') + `s (${prettify(badCoord)})`;
		badName = badName.replace(cell.name, newName);
		displayedName = badName;
	} else {
		displayedName = badName.replace('_', ' ');
	}

	if (challengeActive('Smithless') && !game.global.mapsActive && game.global.world % 25 === 0 && game.global.lastClearedCell === -1 && !cell.failedUber) {
		ubersmithActive = true;
		game.challenges.Smithless.saveName = displayedName;
		displayedName = 'Ubersmith';
	}

	if (displayedName === 'Mutimp' || displayedName === 'Hulking Mutimp') {
		displayedName = "<span class='Mutimp'>" + displayedName + '</span>';
	}

	if (mutations.Living.active()) {
		badName = "<span id='livingMutationContainer'" + (cell.mutation === 'Living' ? " class='badNameMutation Living'" : '') + "><span id='livingMutationName'>" + (cell.mutation === 'Living' ? 'Living ' : '') + '</span>' + displayedName + '</span>';
	} else if (cell.vm && visualMutations[cell.vm].highlightMob && displayedName === visualMutations[cell.vm].highlightMob) {
		const tempName = cell.mutation ? mutations[cell.mutation].namePrefix + ' ' + displayedName : displayedName;
		badName = "<span class='badNameMutation " + cell.vm + "'>" + tempName + '</span>';
	} else if (cell.mutation) {
		badName = "<span class='badNameMutation " + cell.mutation + "'>" + mutations[cell.mutation].namePrefix + ' ' + displayedName + '</span>';
	} else if (cell.u2Mutation && cell.u2Mutation.length) {
		badName = "<span class='badNameMutation u2Mutation' style='color: " + u2Mutations.getColor(cell.u2Mutation) + "'>" + u2Mutations.getName(cell.u2Mutation) + ' ' + displayedName + '</span>';
	} else if (cell.vm && visualMutations[cell.vm].namePrefix) {
		badName = "<span class='badNameMutation " + cell.vm + "'>" + visualMutations[cell.vm].namePrefix + ' ' + displayedName + '</span>';
	} else {
		badName = displayedName;
	}

	if (cell.empowerment) {
		badName = getEmpowerment(-1, true) + ' ' + badName;
		badName = "<span class='badNameMutation badName" + getEmpowerment(-1) + "'>" + badName + '</span>';
	}

	if (cell.name === 'Omnipotrimp' && game.global.world % 5 === 0 && !game.global.spireActive) {
		badName += ' <span class="badge badBadge Magma" onmouseover="tooltip(\'Superheated\', \'customText\', event, \'This Omnipotrimp is Superheated, and will explode on death.\')" onmouseout="tooltip(\'hide\')"><span class="icomoon icon-fire2"></span></span>';
	}

	if (game.global.brokenPlanet && !game.global.mapsActive) {
		badName += " <span class=\"badge badBadge\" onmouseover=\"tooltip('Pierce', 'customText', event, '" + prettify(getPierceAmt() * 100) + '% of the damage from this Bad Guy pierces through block\')" onmouseout="tooltip(\'hide\')"><span class="glyphicon glyphicon-tint"></span></span>';
	}

	if (challengeActive('Glass') || challengeActive('Slow') || (cell.u2Mutation && cell.u2Mutation.length) || ((game.badGuys[cell.name].fast || cell.mutation === 'Corruption') && !challengeActive('Coordinate') && !challengeActive('Nom'))) badName += ' <span class="badge badBadge" onmouseover="tooltip(\'Fast\', \'customText\', event, \'This Bad Guy is fast and attacks first\')" onmouseout="tooltip(\'hide\')"><span class="glyphicon glyphicon-forward"></span></span>';

	if (challengeActive('Electricity') || challengeActive('Mapocalypse')) {
		badName += ' <span class="badge badBadge" onmouseover="tooltip(\'Electric\', \'customText\', event, \'This Bad Guy is electric and stacks a debuff on your Trimps\')" onmouseout="tooltip(\'hide\')"><span class="icomoon icon-power-cord"></span></span>';
	}

	const badGuyName = document.getElementById('badGuyName');
	if (badGuyName.innerHTML !== badName && shouldUpdate(500)) badGuyName.innerHTML = badName;

	if (challengeActive('Domination')) handleDominationDebuff();
	const corruptionStart = mutations.Corruption.start(true);
	const magmaActive = mutations.Magma.active();

	if (cell.maxHealth === -1 && checkIfSpireWorld() && game.global.spireActive && !game.global.mapsActive && cell.corrupted) {
		if (Fluffy.isRewardActive('eliminator')) {
			cell.corrupted = 'none';
		} else if (Fluffy.isRewardActive('purifier')) {
			if (getRandomIntSeeded(game.global.mutationSeed++, 0, 100) < 50) cell.corrupted = 'none';
		}
	}

	if (shouldUpdate()) {
		if (cell.mutation) {
			setMutationTooltip(cell.corrupted, cell.mutation);
		} else if (map && map.location === 'Void' && game.global.world >= corruptionStart) {
			setVoidCorruptionIcon();
		} else if (map && magmaActive) {
			setVoidCorruptionIcon(true);
		} else {
			const corruptionBuffElem = document.getElementById('corruptionBuff');
			if (corruptionBuffElem.innerHTML !== '') corruptionBuffElem.innerHTML = '';
		}
	}

	if (challengeActive('Balance') || challengeActive('Unbalance')) updateBalanceStacks();
	if (challengeActive('Toxicity')) updateToxicityStacks();

	if (cell.maxHealth === -1) {
		refillEnergyShield();
		let overkill = 0;

		if (cell.health !== -1) overkill = cell.health;

		if (cell.u2Mutation && cell.u2Mutation.length) cell.attack = u2Mutations.getAttack(cell);
		else if (cell.mutation && typeof mutations[cell.mutation].attack !== 'undefined') cell.attack = mutations[cell.mutation].attack(cell.level, cell.name);
		else cell.attack = game.global.getEnemyAttack(cell.level, cell.name);

		if (cell.u2Mutation && cell.u2Mutation.length) cell.health = u2Mutations.getHealth(cell);
		else if (cell.mutation && typeof mutations[cell.mutation].health !== 'undefined') cell.health = mutations[cell.mutation].health(cell.level, cell.name);
		else cell.health = game.global.getEnemyHealth(cell.level, cell.name);

		let attackMult = 1;
		let healthMult = 1;

		if (game.global.mapsActive) {
			const difficulty = map.difficulty;
			attackMult *= difficulty;
			healthMult *= difficulty;
		}

		if (challengeActive('Daily')) {
			if (typeof game.global.dailyChallenge.badHealth !== 'undefined') {
				healthMult *= dailyModifiers.badHealth.getMult(game.global.dailyChallenge.badHealth.strength);
			}
			if (typeof game.global.dailyChallenge.badMapHealth !== 'undefined' && game.global.mapsActive) {
				healthMult *= dailyModifiers.badMapHealth.getMult(game.global.dailyChallenge.badMapHealth.strength);
			}
			if (typeof game.global.dailyChallenge.empoweredVoid !== 'undefined' && game.global.mapsActive && map.location === 'Void') {
				const empVoidStr = dailyModifiers.empoweredVoid.getMult(game.global.dailyChallenge.empoweredVoid.strength);
				healthMult *= empVoidStr;
				attackMult *= empVoidStr;
			}
			if (typeof game.global.dailyChallenge.empower !== 'undefined') {
				if (!game.global.mapsActive) healthMult *= dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks);
				updateDailyStacks('empower');
			}
		}

		if (game.global.spireActive && checkIfSpireWorld() && !game.global.mapsActive) {
			cell.origAttack = cell.attack;
			cell.origHealth = cell.health;
			cell.attack = getSpireStats(cell.level, cell.name, 'attack', cell.origAttack);
			cell.health = getSpireStats(cell.level, cell.name, 'health', cell.origHealth);
		}

		if (game.global.universe === 1) {
			if (cell.empowerment) {
				if (cell.mutation !== 'Corruption') {
					cell.health = mutations.Corruption.health(cell.level, cell.name);
					cell.attack = mutations.Corruption.attack(cell.level, cell.name);
				}
				healthMult *= 4;
				attackMult *= 1.2;
			}

			if (cell.corrupted === 'corruptStrong') attackMult *= 2;
			if (cell.corrupted === 'healthyStrong') attackMult *= 2.5;
			if (cell.corrupted === 'corruptTough') healthMult *= 5;
			if (cell.corrupted === 'healthyTough') healthMult *= 7.5;

			if (challengeActive('Meditate')) {
				healthMult *= 2;
			}
			if (challengeActive('Balance')) {
				attackMult *= game.global.mapsActive ? 2.35 : 1.17;
				healthMult *= 2;
			}
			if (challengeActive('Life')) {
				healthMult *= 11;
				attackMult *= 6;
			}
			if (challengeActive('Toxicity')) {
				attackMult *= 5;
				healthMult *= 2;
			}
			if (challengeActive('Lead') && game.challenges.Lead.stacks > 0) {
				healthMult *= 1 + Math.min(game.challenges.Lead.stacks, 200) * 0.04;
			}

			if (challengeActive('Coordinate')) {
				healthMult *= badCoord;
			} else if (challengeActive('Domination')) {
				let dominating = false;
				if (map && map.size === cellNum + 1) dominating = true;
				else if (!map && cellNum === 99) dominating = true;

				if (dominating) {
					attackMult *= 2.5;
					healthMult *= 7.5;
				} else {
					attackMult *= 0.1;
					healthMult *= 0.1;
				}
			} else if (challengeActive('Obliterated') || challengeActive('Eradicated')) {
				let oblitMult = challengeActive('Eradicated') ? game.challenges.Eradicated.scaleModifier : 1e12;
				const zoneModifier = Math.floor(game.global.world / game.challenges[game.global.challengeActive].zoneScaleFreq);
				oblitMult *= Math.pow(game.challenges[game.global.challengeActive].zoneScaling, zoneModifier);
				healthMult *= oblitMult;
				attackMult *= oblitMult;
			} else if (challengeActive('Frigid')) {
				const frigidMult = game.challenges.Frigid.getEnemyMult();
				healthMult *= frigidMult;
				attackMult *= frigidMult;
			} else if (challengeActive('Experience')) {
				const xpMult = game.challenges.Experience.getEnemyMult();
				healthMult *= xpMult;
				attackMult *= xpMult;
			}

			if (game.global.mapsActive && game.global.world >= corruptionStart) {
				if (magmaActive && map.location === 'Void') {
					attackMult *= mutations.Corruption.statScale(3).toFixed(1);
					healthMult *= mutations.Corruption.statScale(10).toFixed(1);
				} else if (map.location === 'Void' || magmaActive) {
					attackMult *= (mutations.Corruption.statScale(3) / 2).toFixed(1);
					healthMult *= (mutations.Corruption.statScale(10) / 2).toFixed(1);
				}
			}

			if (cell.name === 'Improbability' || cell.name === 'Omnipotrimp') {
				if (game.global.roboTrimpLevel && game.global.useShriek) activateShriek();

				if (game.global.world >= corruptionStart) {
					if (game.global.spireActive) {
						cell.origHealth *= mutations.Corruption.statScale(10) * healthMult;
						cell.origAttack *= mutations.Corruption.statScale(3) * attackMult;
					} else {
						cell.health *= mutations.Corruption.statScale(10);
						cell.attack *= mutations.Corruption.statScale(3);
					}
				}
			}
		}

		if (game.global.universe === 2) {
			if (challengeActive('Unbalance')) {
				healthMult *= game.global.mapsActive ? 2 : 3;
				attackMult *= 1.5;
			} else if (challengeActive('Duel')) {
				if (game.challenges.Duel.enemyStacks < 20) healthMult *= game.challenges.Duel.healthMult;
			} else if (challengeActive('Quest')) {
				healthMult *= game.challenges.Quest.getHealthMult();
			} else if (challengeActive('Revenge') && game.global.world % 2 === 0) {
				healthMult *= 10;
			} else if (challengeActive('Mayhem')) {
				const mayhemMult = game.challenges.Mayhem.getEnemyMult();
				healthMult *= mayhemMult;
				attackMult *= mayhemMult;
			} else if (challengeActive('Exterminate')) {
				const extMult = game.challenges.Exterminate.getSwarmMult();
				healthMult *= extMult;
				attackMult *= extMult;
			} else if (challengeActive('Nurture')) {
				healthMult *= map ? 10 : 2;
				healthMult *= game.buildings.Laboratory.getEnemyMult();
			} else if (challengeActive('Alchemy')) {
				const alchMap = Boolean(map);
				const alchVoid = alchMap && map.location === 'Void';
				const statMult = alchObj.getEnemyStats(alchMap, alchVoid) + 1;
				attackMult *= statMult;
				healthMult *= statMult;
			} else if (challengeActive('Glass')) {
				game.challenges.Glass.cellStartHealth = cell.health * healthMult;
				healthMult *= game.challenges.Glass.healthMult();
			} else if (challengeActive('Hypothermia')) {
				const hypMult = game.challenges.Hypothermia.getEnemyMult();
				healthMult *= hypMult;
				attackMult *= hypMult;
			} else if (challengeActive('Desolation')) {
				const desoMult = game.challenges.Desolation.getEnemyMult();
				healthMult *= desoMult;
				attackMult *= desoMult;
			} else if (ubersmithActive) {
				healthMult *= game.challenges.Smithless.uberMult;
				cell.ubersmith = true;
				game.challenges.Smithless.uberAttacks = 0;
				overkill = 0;
			}

			//Mayhem and Storm last so attack and health restore properly
			if ((challengeActive('Mayhem') && cellNum === 99 && !game.global.mapsActive) || challengeActive('Pandemonium')) {
				cell.preMayhemHealth = cell.health * healthMult;
				if (cellNum === 99 && !game.global.mapsActive) healthMult *= game.challenges[game.global.challengeActive].getBossMult();
				else healthMult *= game.challenges.Pandemonium.getPandMult();
			} else if (challengeActive('Storm') && !map) {
				game.challenges.Storm.cellStartAttack = cell.attack * attackMult;
				game.challenges.Storm.cellStartHealth = cell.health * healthMult;
				healthMult *= game.challenges.Storm.getHealthMult();
				cell.attack *= game.challenges.Storm.getAttackMult();
			}
		}

		//End bonuses that alter starting attack/health
		cell.attack *= attackMult;
		cell.health *= healthMult;
		cell.maxHealth = cell.health;

		if (overkill === 'shatter' || overkill === 'compressed') cell.health = 0;
		else if (game.global.universe === 1 && getPerkLevel('Overkill') && !(!map && game.global.gridArray[0].name === 'Liquimp')) cell.health -= overkill * getPerkLevel('Overkill') * 0.005;
		else if (game.global.universe === 2 && (!challengeActive('Wither') || !game.global.runningChallengeSquared) && (u2Mutations.tree.Overkill1.purchased || (game.global.mapsActive && u2Mutations.tree.MadMap.purchased))) {
			if (game.global.mapsActive && u2Mutations.tree.MadMap.purchased) {
				cell.health -= overkill;
			} else {
				if (canU2Overkill()) cell.health -= overkill * 0.005;
			}
		}

		const empowerment = getEmpowerment();
		const empowermentUber = getUberEmpowerment();
		if (cell.health < 1) {
			const overkillerCount = getOverkillerCount();
			if (cell.OKcount <= overkillerCount) {
				const nextCell = game.global.mapsActive ? game.global.mapGridArray[cellNum + 1] : game.global.gridArray[cellNum + 1];
				if (nextCell) {
					nextCell.health = overkill === 'shatter' && (cellNum !== 98 || !game.global.spireActive) ? 'shatter' : Math.abs(cell.health);
					nextCell.OKcount = cell.OKcount + 1;
				}
			}
			cell.health = 0;
			cell.overkilled = true;
			instaFight = true;
			if (cell.name === 'Improbability') giveSingleAchieve('One-Hit Wonder');
			if (cell.name === 'Omnipotrimp') giveSingleAchieve('Mighty');
			if (!game.global.mapsActive) game.stats.cellsOverkilled.value++;
		} else {
			if (cell.plaguebringer) {
				if (cell.health > cell.maxHealth * 0.05) {
					cell.health -= cell.plaguebringer;
					if (cell.health < cell.maxHealth * 0.05) cell.health = cell.maxHealth * 0.05;
				}

				if (empowerment) {
					if (empowerment === 'Poison') {
						/* stackPoison handles the poison debuff and plaguebrought scaling */
						stackPoison(cell.plaguebringer);
					}

					if (empowerment === 'Wind') {
						let hits = cell.plagueHits;
						if (empowermentUber === 'Wind') hits *= 2;
						if (Fluffy.isRewardActive('plaguebrought')) hits *= 2;
						game.empowerments[empowerment].currentDebuffPower += Math.ceil(hits);
						handleWindDebuff();
					}

					if (empowerment === 'Ice') {
						let hits = cell.plagueHits;
						if (empowermentUber === 'Ice') hits *= 2;
						if (Fluffy.isRewardActive('plaguebrought')) hits *= 2;
						game.empowerments[empowerment].currentDebuffPower += Math.ceil(hits);
						handleIceDebuff();
					}
				}
			}

			if (game.global.formation === 4 || game.global.formation === 5) {
				if (game.global.mapsActive) game.global.waitToScryMaps = false;
				else game.global.waitToScry = false;
			}
		}
	} else if (challengeActive('Nom') && cell.nomStacks) {
		updateNomStacks(cell.nomStacks);
	}

	const trimpsFighting = game.resources.trimps.maxSoldiers;
	const currentSend = game.resources.trimps.getCurrentSend();

	if (game.global.soldierHealth <= 0) {
		if (getHeirloomBonus('Shield', 'gammaBurst') > 0) {
			game.heirlooms.Shield.gammaBurst.stacks = 0;
			updateGammaStacks();
		}

		game.global.armyAttackCount = 0;
		game.global.fightAttackCount = 0;
		game.global.battleCounter = 0;
		const gameTime = getGameTime();

		if (cell.name === 'Voidsnimp' && !game.achievements.oneOffs.finished[game.achievements.oneOffs.names.indexOf('Needs Block')]) {
			if (!cell.killCount) cell.killCount = 1;
			else cell.killCount++;

			if (cell.killCount >= 50) giveSingleAchieve('Needs Block');
		}

		if (game.global.realBreedTime >= 600000 && game.jobs.Geneticist.owned >= 1) giveSingleAchieve('Extra Crispy');

		if (getPerkLevel('Anticipation')) {
			game.global.antiStacks = game.jobs.Amalgamator.owned > 0 ? Math.floor((gameTime - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000);
			const maxStacks = game.talents.patience.purchased ? 45 : 30;
			if (game.global.antiStacks > maxStacks) game.global.antiStacks = maxStacks;
			updateAntiStacks();
		}

		game.global.lastSoldierSentAt = gameTime;
		game.global.lastBreedTime = 0;
		game.global.realBreedTime = 0;

		if (challengeActive('Electricity') || challengeActive('Mapocalypse')) {
			game.challenges.Electricity.stacks = 0;
			game.challenges.Electricity.attacksInARow = 0;
			updateElectricityStacks();
		}

		if (challengeActive('Daily')) {
			if (typeof game.global.dailyChallenge.plague !== 'undefined') {
				game.global.dailyChallenge.plague.stacks = 0;
				updateDailyStacks('plague');
			}

			if (typeof game.global.dailyChallenge.weakness !== 'undefined') {
				game.global.dailyChallenge.weakness.stacks = 0;
				updateDailyStacks('weakness');
			}

			if (typeof game.global.dailyChallenge.rampage !== 'undefined') {
				game.global.dailyChallenge.rampage.stacks = 0;
				updateDailyStacks('rampage');
			}
		}

		game.global.difs.attack = 0;
		game.global.difs.health = 0;
		game.global.difs.block = 0;
		game.global.difs.trainers = game.jobs.Trainer.owned;
		game.global.soldierHealthMax = game.global.health;
		game.global.maxSoldiersAtStart = game.resources.trimps.maxSoldiers;
		game.global.soldierCurrentAttack = game.global.attack;

		if (game.jobs.Amalgamator.owned > 0) {
			game.global.soldierHealthMax *= game.jobs.Amalgamator.getHealthMult();
		}

		if (magmaActive) {
			const magMult = mutations.Magma.getTrimpDecay();
			game.global.soldierHealthMax *= magMult;
			game.global.soldierCurrentAttack *= magMult;
		}

		game.global.soldierHealthMax *= trimpsFighting;
		game.global.soldierCurrentAttack *= trimpsFighting;

		if (game.talents.mapHealth.purchased && game.global.mapsActive) {
			game.global.soldierHealthMax *= 2;
			game.global.mapHealthActive = true;
		} else {
			game.global.mapHealthActive = false;
		}

		if (game.global.lowestGen >= 0) {
			if (game.global.breedBack <= 0) {
				game.global.soldierHealthMax *= Math.pow(1.01, game.global.lowestGen);
				game.global.lastLowGen = game.global.lowestGen;
				game.global.lowestGen = -1;
			} else {
				game.global.lastLowGen = 0;
			}
			game.global.breedBack = currentSend / 2;
		}

		if (getPerkLevel('Power') > 0) game.global.soldierCurrentAttack += game.global.soldierCurrentAttack * getPerkLevel('Power') * game.portal.Power.modifier;
		if (getPerkLevel('Toughness') > 0) game.global.soldierHealthMax += game.global.soldierHealthMax * getPerkLevel('Toughness') * game.portal.Toughness.modifier;
		if (getPerkLevel('Resilience') > 0) game.global.soldierHealthMax *= Math.pow(game.portal.Resilience.modifier + 1, getPerkLevel('Resilience'));
		game.global.soldierCurrentBlock = getBaseBlock() * trimpsFighting;
		if (game.goldenUpgrades.Battle.currentBonus > 0) game.global.soldierHealthMax *= game.goldenUpgrades.Battle.currentBonus + 1;
		if (game.global.totalSquaredReward > 0) game.global.soldierHealthMax *= game.global.totalSquaredReward / 100 + 1;

		if (game.talents.voidPower.purchased && game.global.voidBuff) {
			game.global.soldierHealthMax *= game.talents.voidPower.getTotalVP() / 100 + 1;
			game.global.voidPowerActive = true;
		} else {
			game.global.voidPowerActive = false;
		}

		if (game.global.mayhemCompletions) game.global.soldierHealthMax *= game.challenges.Mayhem.getTrimpMult();
		if (game.global.pandCompletions) game.global.soldierHealthMax *= game.challenges.Pandemonium.getTrimpMult();
		if (game.global.desoCompletions) game.global.soldierHealthMax *= game.challenges.Desolation.getTrimpMult();

		if (game.global.universe === 1) {
			if (game.global.formation !== 0 && game.global.formation !== 5) {
				game.global.soldierHealthMax *= game.global.formation === 1 ? 4 : 0.5;
				let formAttackMod = 0.5;
				if (game.global.formation === 2) formAttackMod = 4;
				game.global.soldierCurrentAttack *= formAttackMod;
			}
			if (getPerkLevel('Power_II') > 0) game.global.soldierCurrentAttack *= 1 + game.portal.Power_II.modifier * getPerkLevel('Power_II');
			if (getPerkLevel('Toughness_II') > 0) game.global.soldierHealthMax *= 1 + game.portal.Toughness_II.modifier * getPerkLevel('Toughness_II');
			if (game.global.frigidCompletions > 0) game.global.soldierHealthMax *= game.challenges.Frigid.getTrimpMult();

			if (challengeActive('Balance')) {
				game.global.soldierHealthMax *= game.challenges.Balance.getHealthMult();
			}

			if (challengeActive('Life')) {
				game.global.soldierHealthMax *= game.challenges.Life.getHealthMult();
			}

			if (challengeActive('Revenge')) {
				game.global.soldierHealthMax *= game.challenges.Revenge.getMult();
			}
		}

		if (game.global.universe === 2) {
			if (game.buildings.Smithy.owned > 0) game.global.soldierHealthMax *= game.buildings.Smithy.getMult();
			if (Fluffy.isRewardActive('healthy')) game.global.soldierHealthMax *= 1.5;
			if (Fluffy.isRewardActive('scaledHealth')) game.global.soldierHealthMax *= Fluffy.rewardConfig.scaledHealth.mult();
			if (game.buildings.Antenna.owned >= 10) game.global.soldierHealthMax *= game.jobs.Meteorologist.getExtraMult();
			if (autoBattle.bonuses.Stats.level > 0) game.global.soldierHealthMax *= autoBattle.bonuses.Stats.getMult();
			if (game.portal.Observation.trinkets > 0) game.global.soldierHealthMax *= game.portal.Observation.getMult();
			if (getPerkLevel('Championism') > 0) game.global.soldierHealthMax *= game.portal.Championism.getMult();
			if (u2Mutations.tree.Health.purchased) game.global.soldierHealthMax *= 1.5;
			if (u2Mutations.tree.GeneHealth.purchased) game.global.soldierHealthMax *= 10;
			if (game.global.u2SpireCellsBest > 0) game.global.soldierHealthMax *= u2SpireBonuses.basics();

			if (challengeActive('Duel') && game.challenges.Duel.trimpStacks < 20) {
				game.global.soldierHealthMax *= game.challenges.Duel.healthMult;
			}

			if (challengeActive('Wither')) {
				game.global.soldierHealthMax *= game.challenges.Wither.getTrimpHealthMult();
			}

			if (challengeActive('Insanity') && game.challenges.Insanity.insanity > 0) {
				game.global.soldierHealthMax *= game.challenges.Insanity.getHealthMult();
			}

			if (challengeActive('Berserk')) {
				game.global.soldierHealthMax *= game.challenges.Berserk.getHealthMult();
			}

			if (game.challenges.Nurture.boostsActive()) {
				game.global.soldierHealthMax *= game.challenges.Nurture.getStatBoost();
			}

			if (challengeActive('Alchemy')) {
				game.global.soldierHealthMax *= alchObj.getPotionEffect('Potion of Strength');
			}

			if (challengeActive('Desolation')) {
				game.global.soldierHealthMax *= game.challenges.Desolation.trimpHealthMult();
			}

			if (challengeActive('Smithless') && game.challenges.Smithless.fakeSmithies > 0) {
				game.global.soldierHealthMax *= game.challenges.Smithless.getTrimpMult();
			}
		}

		if (challengeActive('Daily') && typeof game.global.dailyChallenge.pressure !== 'undefined') game.global.soldierHealthMax *= dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks);
		game.global.soldierHealthMax = calcHeirloomBonus('Shield', 'trimpHealth', game.global.soldierHealthMax);

		//Soldier starting health is determined
		game.global.soldierHealth = game.global.soldierHealthMax;
		//Finished setting up new army
		refillEnergyShield();
		if (challengeActive('Devastation') || challengeActive('Revenge')) {
			const lastOverkill = game.challenges[game.global.challengeActive].lastOverkill;
			if (lastOverkill !== -1) reduceSoldierHealth(lastOverkill * 7.5);
			game.challenges[game.global.challengeActive].lastOverkill = -1;
			if (game.global.soldierHealth < 1) {
				game.global.soldierHealth = 0;
				if (challengeActive('Revenge')) {
					game.challenges.Revenge.addStack();
				}
			}
		}
		if (challengeActive('Lead')) manageLeadStacks();
	} else {
		if (challengeActive('Lead')) manageLeadStacks();

		if (game.resources.trimps.soldiers !== currentSend && game.global.maxSoldiersAtStart > 0) {
			const freeTrimps = game.resources.trimps.owned - game.resources.trimps.employed;
			const newTrimps = (game.resources.trimps.maxSoldiers - game.global.maxSoldiersAtStart) / game.global.maxSoldiersAtStart + 1;
			const requiredTrimps = currentSend - game.resources.trimps.soldiers;
			if (freeTrimps >= requiredTrimps) {
				const oldHealth = game.global.soldierHealthMax;
				game.resources.trimps.owned -= requiredTrimps;
				game.global.soldierHealthMax *= newTrimps;
				game.global.soldierHealth += game.global.soldierHealthMax - oldHealth;
				game.global.soldierCurrentAttack *= newTrimps;
				game.global.soldierCurrentBlock *= newTrimps;
				game.resources.trimps.soldiers = currentSend;
				game.global.maxSoldiersAtStart = game.resources.trimps.maxSoldiers;
			}
		}

		//Check map health differences
		if (game.talents.mapHealth.purchased) {
			if (game.global.mapHealthActive && !map) {
				game.global.soldierHealthMax /= 2;
				if (game.global.soldierHealth > game.global.soldierHealthmax) game.global.soldierHealth = game.global.soldierHealthMax;
				game.global.mapHealthActive = false;
				if (game.global.universe === 2) {
					game.global.soldierEnergyShieldMax /= 2;
					if (game.global.soldierEnergyShield > game.global.soldierEnergyShieldMax) game.global.soldierEnergyShield = game.global.soldierEnergyShieldMax;
				}
			} else if (!game.global.mapHealthActive && map) {
				game.global.soldierHealthMax *= 2;
				game.global.mapHealthActive = true;
				if (game.global.universe === 2) game.global.soldierEnergyShieldMax *= 2;
			}
		}
		if (game.talents.voidPower.purchased) {
			const mod = 1 + game.talents.voidPower.getTotalVP() / 100;
			if (game.global.voidPowerActive && (!map || map.location !== 'Void')) {
				game.global.soldierHealthMax /= mod;
				if (game.global.soldierHealth > game.global.soldierHealthmax) game.global.soldierHealth = game.global.soldierHealthMax;
				game.global.voidPowerActive = false;
			} else if (!game.global.voidPowerActive && map && map.location === 'Void') {
				game.global.soldierHealthMax *= mod;
				game.global.voidPowerActive = true;
			}
		}
		//Check differences in equipment, apply perks, bonuses, and formation
		if (game.global.difs.health !== 0) {
			let healthTemp = trimpsFighting * game.global.difs.health * (game.portal.Toughness.modifier * getPerkLevel('Toughness') + 1);

			if (game.jobs.Amalgamator.owned > 0) healthTemp *= game.jobs.Amalgamator.getHealthMult();
			if (magmaActive) healthTemp *= mutations.Magma.getTrimpDecay();
			if (game.talents.mapHealth.purchased && game.global.mapsActive) healthTemp *= 2;
			if (game.jobs.Geneticist.owned > 0) healthTemp *= Math.pow(1.01, game.global.lastLowGen);

			if (getPerkLevel('Resilience') > 0) healthTemp *= Math.pow(game.portal.Resilience.modifier + 1, getPerkLevel('Resilience'));
			if (game.goldenUpgrades.Battle.currentBonus > 0) healthTemp *= game.goldenUpgrades.Battle.currentBonus + 1;
			if (game.global.totalSquaredReward > 0) healthTemp *= game.global.totalSquaredReward / 100 + 1;

			if (game.global.mayhemCompletions) healthTemp *= game.challenges.Mayhem.getTrimpMult();
			if (game.global.pandCompletions) healthTemp *= game.challenges.Pandemonium.getTrimpMult();
			if (game.global.desoCompletions) healthTemp *= game.challenges.Desolation.getTrimpMult();

			if (game.global.universe === 1) {
				if (game.global.formation !== 0 && game.global.formation !== 5) {
					healthTemp *= game.global.formation === 1 ? 4 : 0.5;
				}
				if (getPerkLevel('Toughness_II')) healthTemp *= 1 + game.portal.Toughness_II.modifier * getPerkLevel('Toughness_II');
				if (game.global.frigidCompletions > 0) healthTemp *= game.challenges.Frigid.getTrimpMult();

				if (challengeActive('Balance')) {
					healthTemp *= game.challenges.Balance.getHealthMult();
				}

				if (challengeActive('Life')) {
					healthTemp *= game.challenges.Life.getHealthMult();
				}

				if (challengeActive('Revenge')) {
					healthTemp *= game.challenges.Revenge.getMult();
				}
			}

			if (game.global.universe === 2) {
				if (game.buildings.Smithy.owned > 0) healthTemp *= game.buildings.Smithy.getMult();
				if (Fluffy.isRewardActive('healthy')) healthTemp *= 1.5;
				if (Fluffy.isRewardActive('scaledHealth')) healthTemp *= Fluffy.rewardConfig.scaledHealth.mult();
				if (game.buildings.Antenna.owned >= 10) healthTemp *= game.jobs.Meteorologist.getExtraMult();
				if (autoBattle.bonuses.Stats.level > 0) healthTemp *= autoBattle.bonuses.Stats.getMult();
				if (game.portal.Observation.trinkets > 0) healthTemp *= game.portal.Observation.getMult();
				if (getPerkLevel('Championism')) healthTemp *= game.portal.Championism.getMult();
				if (u2Mutations.tree.Health.purchased) healthTemp *= 1.5;
				if (u2Mutations.tree.GeneHealth.purchased) healthTemp *= 10;
				if (game.global.u2SpireCellsBest > 0) healthTemp *= u2SpireBonuses.basics();

				if (challengeActive('Duel') && game.challenges.Duel.trimpStacks < 20) {
					healthTemp *= game.challenges.Duel.healthMult;
				}

				if (challengeActive('Wither')) {
					healthTemp *= game.challenges.Wither.getTrimpHealthMult();
				}

				if (challengeActive('Insanity')) {
					healthTemp *= game.challenges.Insanity.getHealthMult();
				}

				if (challengeActive('Berserk')) {
					healthTemp *= game.challenges.Berserk.getHealthMult();
				}

				if (game.challenges.Nurture.boostsActive()) {
					healthTemp *= game.challenges.Nurture.getStatBoost();
				}

				if (challengeActive('Alchemy')) {
					healthTemp *= alchObj.getPotionEffect('Potion of Strength');
				}

				if (challengeActive('Desolation')) {
					healthTemp *= game.challenges.Desolation.trimpHealthMult();
				}

				if (challengeActive('Smithless') && game.challenges.Smithless.fakeSmithies > 0) {
					healthTemp *= game.challenges.Smithless.getTrimpMult();
				}
			}

			if (challengeActive('Daily') && typeof game.global.dailyChallenge.pressure !== 'undefined') healthTemp *= dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks);

			healthTemp = calcHeirloomBonus('Shield', 'trimpHealth', healthTemp);
			game.global.soldierHealthMax += healthTemp;
			game.global.soldierHealth += healthTemp;
			game.global.difs.health = 0;
			if (game.global.soldierHealth <= 0) game.global.soldierHealth = 0;
		}

		if (game.global.difs.attack !== 0) {
			let attackTemp = trimpsFighting * game.global.difs.attack * (game.portal.Power.modifier * getPerkLevel('Power') + 1);
			if (magmaActive) attackTemp *= mutations.Magma.getTrimpDecay();
			if (getPerkLevel('Power_II')) attackTemp *= 1 + game.portal.Power_II.modifier * getPerkLevel('Power_II');
			if (game.global.formation !== 0 && game.global.formation !== 5) {
				attackTemp *= game.global.formation === 2 ? 4 : 0.5;
			}
			game.global.soldierCurrentAttack += attackTemp;
			game.global.difs.attack = 0;
		}

		if (game.global.difs.block !== 0) {
			let blockTemp = trimpsFighting * game.global.difs.block * (game.global.difs.trainers * (calcHeirloomBonus('Shield', 'trainerEfficiency', game.jobs.Trainer.modifier) / 100) + 1);
			if (game.global.formation !== 0 && game.global.formation !== 5) {
				blockTemp *= game.global.formation === 3 ? 4 : 0.5;
			}
			blockTemp = calcHeirloomBonus('Shield', 'trimpBlock', blockTemp);
			game.global.soldierCurrentBlock += blockTemp;
			game.global.difs.block = 0;
		}
	}

	if (game.global.soldierHealth > game.global.soldierHealthMax) game.global.soldierHealth = game.global.soldierHealthMax;
	if (!instaFight) updateAllBattleNumbers(game.resources.trimps.soldiers < currentSend);
	game.global.fighting = true;
	game.global.lastFightUpdate = new Date();
	if (instaFight) fight();
}

function fight(makeUp) {
	fightLoops++;
	const currentMapObj = game.global.mapsActive ? getCurrentMapObject() : undefined;
	let cellNum;
	let cell;
	let cellElem;
	let isVoid = false;
	game.global.passive = false;

	if (game.global.mapsActive) {
		cellNum = game.global.lastClearedMapCell + 1;
		cell = game.global.mapGridArray[cellNum];
		cellElem = document.getElementById('mapCell' + cellNum);
		if (currentMapObj.location === 'Void') isVoid = true;
	} else {
		cellNum = game.global.lastClearedCell + 1;
		cell = game.global.gridArray[cellNum];
		cellElem = document.getElementById('cell' + cellNum);
	}

	if (game.global.soldierHealth <= 0) {
		if (isVoid) game.global.voidDeaths++;
		game.stats.trimpsKilled.value += game.resources.trimps.soldiers;
		game.stats.battlesLost.value++;
		if (challengeActive('Daily')) {
			if (typeof game.global.dailyChallenge.bloodthirst !== 'undefined') {
				game.global.dailyChallenge.bloodthirst.stacks++;
				const maxStacks = dailyModifiers.bloodthirst.getMaxStacks(game.global.dailyChallenge.bloodthirst.strength);
				if (game.global.dailyChallenge.bloodthirst.stacks > maxStacks) {
					game.global.dailyChallenge.bloodthirst.stacks = maxStacks;
				} else if (game.global.dailyChallenge.bloodthirst.stacks % dailyModifiers.bloodthirst.getFreq(game.global.dailyChallenge.bloodthirst.strength) === 0) {
					cell.health = cell.maxHealth;
				}
				updateDailyStacks('bloodthirst');
			}

			if (!game.global.passive && typeof game.global.dailyChallenge.empower !== 'undefined') {
				if (!game.global.mapsActive) {
					game.global.dailyChallenge.empower.stacks += dailyModifiers.empower.stacksToAdd(game.global.dailyChallenge.empower.strength);
					const maxStack = dailyModifiers.empower.getMaxStacks(game.global.dailyChallenge.empower.strength);
					if (game.global.dailyChallenge.empower.stacks >= maxStack) game.global.dailyChallenge.empower.stacks = maxStack;
				}
				updateDailyStacks('empower');
			}
		}

		let s = game.resources.trimps.soldiers > 1 ? 's ' : ' ';
		const randomText = game.trimpDeathTexts[Math.floor(Math.random() * game.trimpDeathTexts.length)];
		let msgText = `${prettify(game.resources.trimps.soldiers)} Trimp${s} just ${randomText}.`;
		if (usingScreenReader) msgText = `Cell ${cellNum}: ${msgText}`;
		message(msgText, 'Combat', null, null, 'trimp');
		if (game.global.spireActive && !game.global.mapsActive) deadInSpire();
		game.global.fighting = false;
		game.resources.trimps.soldiers = 0;

		if (challengeActive('Nom')) {
			cell.nomStacks = cell.nomStacks ? cell.nomStacks + 1 : 1;
			if (cell.nomStacks > 100) cell.nomStacks = 100;
			updateNomStacks(cell.nomStacks);
			if (cell.health > 0) cell.health += cell.maxHealth * 0.05;
			else cell.health = 0;
			if (cell.health > cell.maxHealth) cell.health = cell.maxHealth;
			updateBadBar(cell);
		}

		return;
	}

	if (cell.health <= 0 || !isFinite(cell.health)) {
		game.stats.battlesWon.value++;

		if (!game.global.mapsActive) {
			game.global.voidSeed++;
			game.global.scrySeed++;
		}

		if ((game.global.formation === 4 || game.global.formation === 5) && !game.global.mapsActive && !game.global.waitToScry) tryScry();
		if (game.jobs.Worshipper.owned > 0 && !game.global.mapsActive) tryWorship();
		if (challengeActive('Nom') && cell.nomStacks === 100) giveSingleAchieve('Great Host');
		if (challengeActive('Obliterated')) giveSingleAchieve('Obliterate');
		if (challengeActive('Eradicated')) giveSingleAchieve('Eradicate');
		if (game.global.usingShriek) disableShriek();
		if (game.global.universe === 2) u2Mutations.types.Rage.clearStacks();
		//Death message
		const randomText = game.badGuyDeathTexts[Math.floor(Math.random() * game.badGuyDeathTexts.length)];
		let displayName = cell.name;
		if (typeof game.badGuys[cell.name].displayName !== 'undefined') displayName = game.badGuys[cell.name].displayName;
		let firstChar = displayName.charAt(0);
		const vowels = new Set(['A', 'E', 'I', 'O', 'U']);
		let aAn = vowels.has(firstChar) ? ' an ' : ' a ';
		let killedText = `You ${randomText}${aAn}${displayName}${challengeActive('Coordinate') ? ' group' : ''}!`;
		if (usingScreenReader) killedText = `Cell ${cellNum}: ${killedText}`;
		if (!game.global.spireActive || cellNum !== 99 || game.global.mapsActive) message(killedText, 'Combat', null, null, 'enemy');
		try {
			if (typeof kongregate !== 'undefined' && !game.global.mapsActive) kongregate.stats.submit('HighestLevel', game.global.world * 100 + cell.level);
		} catch (err) {
			console.debug(err);
		}
		if (usingRealTimeOffline) offlineProgress.lastEnemyKilled = offlineProgress.ticksProcessed;
		//Challenge Shenanigans
		if (challengeActive('Lead') && cell.name !== 'Liquimp') manageLeadStacks(!game.global.mapsActive);
		if ((challengeActive('Balance') || challengeActive('Unbalance')) && game.global.world >= 6) {
			const chal = challengeActive('Balance') ? game.challenges.Balance : game.challenges.Unbalance;
			if (game.global.mapsActive) chal.removeStack();
			else chal.addStack();
			updateBalanceStacks();
		}
		if (challengeActive('Smithless') && cell.ubersmith && !cell.failedUber) {
			game.challenges.Smithless.addStacks(3);
		}
		if (challengeActive('Daily')) {
			if (typeof game.global.dailyChallenge.karma !== 'undefined') {
				game.global.dailyChallenge.karma.stacks++;
				const maxStack = dailyModifiers.karma.getMaxStacks(game.global.dailyChallenge.karma.strength);
				if (game.global.dailyChallenge.karma.stacks >= maxStack) game.global.dailyChallenge.karma.stacks = maxStack;
				updateDailyStacks('karma');
			}
			if (typeof game.global.dailyChallenge.toxic !== 'undefined') {
				game.global.dailyChallenge.toxic.stacks++;
				const maxStack = dailyModifiers.toxic.getMaxStacks(game.global.dailyChallenge.toxic.strength);
				if (game.global.dailyChallenge.toxic.stacks >= maxStack) game.global.dailyChallenge.toxic.stacks = maxStack;
				updateDailyStacks('toxic');
			}
			if (typeof game.global.dailyChallenge.rampage !== 'undefined') {
				game.global.dailyChallenge.rampage.stacks++;
				const maxStack = dailyModifiers.rampage.getMaxStacks(game.global.dailyChallenge.rampage.strength);
				if (game.global.dailyChallenge.rampage.stacks >= maxStack) game.global.dailyChallenge.rampage.stacks = maxStack;
				updateDailyStacks('rampage');
			}
			if (typeof game.global.dailyChallenge.bloodthirst !== 'undefined') {
				game.global.dailyChallenge.bloodthirst.stacks = 0;
				updateDailyStacks('bloodthirst');
			}
		}
		if (challengeActive('Wither')) {
			game.challenges.Wither.addStacks();
		}
		//All inclusive Challenge Shenanigans
		if (game.global.challengeActive && game.challenges[game.global.challengeActive].onEnemyKilled) game.challenges[game.global.challengeActive].onEnemyKilled();
		if (game.global.mapsActive && game.global.challengeActive && game.challenges[game.global.challengeActive].onMapEnemyKilled) game.challenges[game.global.challengeActive].onMapEnemyKilled(currentMapObj.level);
		//Html stuff
		if (cell.overkilled && game.options.menu.overkillColor.enabled) {
			if (game.options.menu.overkillColor.enabled === 2) {
				const prevCellElem = document.getElementById((game.global.mapsActive ? 'mapCell' : 'cell') + (cellNum - 1));
				if (prevCellElem) swapClass('cellColor', 'cellColorOverkill', prevCellElem);
			}
			swapClass('cellColor', 'cellColorOverkill', cellElem);
		} else {
			swapClass('cellColor', 'cellColorBeaten', cellElem);
		}

		if (game.global.mapsActive) game.global.lastClearedMapCell = cellNum;
		else game.global.lastClearedCell = cellNum;

		game.global.fighting = false;
		document.getElementById('badGuyCol').style.visibility = 'hidden';
		//Loot!
		if (cell.empowerment) {
			rewardToken(cell.empowerment);
		}
		let unlock;
		if (game.global.mapsActive) {
			unlock = game.mapUnlocks[cell.special];
		} else {
			checkVoidMap();
			unlock = game.worldUnlocks[cell.special];
		}
		let noMessage = false;
		if (typeof unlock !== 'undefined' && typeof unlock.fire !== 'undefined') {
			unlock.fire(cell.level);
			if (game.global.mapsActive) {
				if (typeof game.mapUnlocks[cell.special].last !== 'undefined') {
					game.mapUnlocks[cell.special].last += 5;
					if (typeof game.upgrades[cell.special].prestige && getSLevel() >= 4 && !challengeActive('Mapology') && Math.ceil(game.mapUnlocks[cell.special].last / 5) % 2 === 1) {
						unlock.fire(cell.level);
						game.mapUnlocks[cell.special].last += 5;
						message(unlock.message.replace('a book', 'two books'), 'Unlocks', null, null, 'repeated', cell.text);
						noMessage = true;
					}
				}
				if (typeof game.mapUnlocks[cell.special].canRunOnce !== 'undefined') game.mapUnlocks[cell.special].canRunOnce = false;
				if (unlock.filterUpgrade) refreshMaps();
			}
		} else if (cell.special !== '') {
			unlockEquipment(cell.special);
		}
		if (cell.mutation && typeof mutations[cell.mutation].reward !== 'undefined') mutations[cell.mutation].reward(cell.corrupted);
		let doNextVoid = false;
		if (typeof unlock !== 'undefined' && typeof unlock.message !== 'undefined' && !noMessage) message(unlock.message, 'Unlocks', null, null, unlock.world > 0 ? 'unique' : 'repeated', cell.text);
		if (typeof game.badGuys[cell.name].loot !== 'undefined') game.badGuys[cell.name].loot(cell.level);
		if (!game.global.mapsActive && game.global.spireActive && checkIfSpireWorld()) {
			giveSpireReward(cell.level);
		}
		if (cell.u2Mutation && cell.u2Mutation.length) u2Mutations.rewardMutation(cell);
		//Post Loot
		resetEmpowerStacks();

		//Map and World split here for non-loot stuff, anything for both goes above
		//Map Only
		if (game.global.mapsActive && cellNum === game.global.mapGridArray.length - 1) {
			//ayy you beat a map
			if (usingRealTimeOffline && offlineProgress.countThisMap) {
				offlineProgress.mapsAllowed--;
				offlineProgress.countThisMap = false;
			}
			game.stats.mapsCleared.value++;
			checkAchieve('totalMaps');
			alchObj.mapCleared(currentMapObj);
			let shouldRepeat = game.global.repeatMap;
			let nextBw = false;
			let mazBw = -1;
			game.global.mapRunCounter++;
			if (game.options.menu.repeatUntil.enabled === 0 && game.global.mapCounterGoal > 0) toggleSetting('repeatUntil', null, false, true);
			if (game.global.challengeActive && game.challenges[game.global.challengeActive].clearedMap) game.challenges[game.global.challengeActive].clearedMap(currentMapObj.level);
			let mapBonusEarned = 0;
			if (currentMapObj.level >= game.global.world - getPerkLevel('Siphonology') && game.global.mapBonus < 10) mapBonusEarned = 1;
			game.global.mapBonus += mapBonusEarned;
			if (challengeActive('Quest') && game.challenges.Quest.questId === 2) {
				game.challenges.Quest.questProgress += mapBonusEarned;
				game.challenges.Quest.checkQuest();
			}
			const mapBonusReached = game.global.mapBonus === 10;
			const allItemsEarned = addSpecials(true, true, currentMapObj) === 0;

			if (currentMapObj.name.search('Bionic Wonderland') > -1 && allItemsEarned && game.options.menu.climbBw.enabled === 1 && game.global.repeatMap) {
				if (game.global.mazBw > 0 && game.global.mazBw <= currentMapObj.level) {
					nextBw = false;
				} else {
					nextBw = getNextBwId();
					mazBw = game.global.mazBw;
				}
			}

			if (game.options.menu.repeatUntil.enabled === 0 && game.global.mapCounterGoal > 0 && game.global.mapRunCounter >= game.global.mapCounterGoal) shouldRepeat = false;
			else if (game.options.menu.repeatUntil.enabled === 1 && mapBonusReached) shouldRepeat = false;
			else if (game.options.menu.repeatUntil.enabled === 2 && allItemsEarned) shouldRepeat = false;
			else if (game.options.menu.repeatUntil.enabled === 3 && allItemsEarned && (mapBonusReached || mapBonusEarned === 0)) shouldRepeat = false;

			if (currentMapObj.bonus && mapSpecialModifierConfig[currentMapObj.bonus].onCompletion) {
				mapSpecialModifierConfig[currentMapObj.bonus].onCompletion();
			}

			let skip = false;
			if (isVoid) {
				if (currentMapObj.stacked > 0) {
					let timeout = 750;
					if (currentMapObj.stacked > 3) timeout = 300;
					if (currentMapObj.stacked > 6) timeout = 100;
					if (usingRealTimeOffline || !game.options.menu.voidPopups.enabled) timeout = 10;
					rewardingTimeoutHeirlooms = true;

					for (let x = 0; x < currentMapObj.stacked; x++) {
						setTimeout(
							(function (z) {
								return function () {
									if (rewardingTimeoutHeirlooms) createHeirloom(z);
								};
							})(game.global.world),
							timeout * (x + 1)
						);
					}

					game.badGuys.Cthulimp.loot(99, true, currentMapObj.stacked);
				}
				currentMapObj.noRecycle = false;
				recycleMap(-1, true, true);
				if (game.options.menu.repeatVoids.enabled === 1) {
					if (game.global.totalVoidMaps > 0) doNextVoid = getNextVoidId();
				}
				skip = true;
			}
			if (!game.global.runningChallengeSquared && game.global.challengeActive && game.challenges[game.global.challengeActive].completeAfterMap) {
				const challenge = game.challenges[game.global.challengeActive];
				if (currentMapObj.name === challenge.completeAfterMap && typeof challenge.onComplete !== 'undefined') {
					challenge.onComplete();
				}
			}
			if (challengeActive('Insanity')) {
				game.challenges.Insanity.completeMap(currentMapObj.level);
			}
			if (currentMapObj.location !== 'Frozen' && !nextBw && shouldRepeat && !game.global.switchToMaps && !skip && (!challengeActive('Mapology') || game.challenges.Mapology.credits >= 1)) {
				if (game.global.mapBonus > 0) {
					let innerText = game.global.mapBonus;
					if (game.talents.mapBattery.purchased && game.global.mapBonus === 10) innerText = "<span class='mapBonus10'>" + innerText + '</span>';
					const mapBtnElem = document.getElementById('mapsBtnText');
					const mapBtnText = `Maps (${innerText})`;
					if (mapBtnElem.innerHTML !== mapBtnText && shouldUpdate(500)) mapBtnElem.innerHTML = mapBtnText;
				}
				game.global.lastClearedMapCell = -1;
				buildMapGrid(game.global.currentMapId);
				drawGrid(true);
				if (challengeActive('Mapology')) {
					game.challenges.Mapology.credits--;
					if (game.challenges.Mapology.credits <= 0) game.challenges.Mapology.credits = 0;
					updateMapCredits();
					messageMapCredits();
				}
				battle(true);
				return;
			} else {
				if (game.global.switchToMaps) {
					game.global.soldierHealth = 0;
					game.resources.trimps.soldiers = 0;
					updateGoodBar();
				}

				game.global.preMapsActive = game.options.menu.exitTo.enabled && !nextBw ? false : true;
				game.global.mapsActive = false;
				game.global.lastClearedMapCell = -1;
				game.global.currentMapId = '';
				game.global.mapGridArray = [];
				game.global.fighting = false;
				game.global.switchToMaps = false;
				game.global.mapExtraBonus = '';
				mapsSwitch(true);

				if (nextBw) {
					game.global.lookingAtMap = nextBw;
					runMap();
					game.global.mazBw = mazBw;
				} else if (doNextVoid) {
					game.global.lookingAtMap = doNextVoid;
					runMap();
				} else if (isVoid && game.global.preMapsActive && game.global.totalVoidMaps > 0) {
					toggleVoidMaps();
				} else if (currentMapObj.location === 'Frozen') {
					document.getElementById('mapsHere').removeChild(document.getElementById(currentMapObj.id));
					game.global.mapsOwnedArray.splice(getMapIndex(currentMapObj.id), 1);
					game.global.lookingAtMap = '';
					mapsSwitch(true);
				} else {
					checkMapAtZoneWorld(true);
				}

				return;
			}
		}
		//World Only
		if (!game.global.mapsActive && cellNum === 99) {
			nextWorld();
		}
		let startMaZ = false;
		if (!game.global.mapsActive) startMaZ = checkMapAtZoneWorld(true);
		if (!startMaZ && game.global.soldierHealth > 0) battle(true);
		return;
	}

	const empowerment = getEmpowerment();
	const empowermentUber = getUberEmpowerment();

	let cellAttack = calculateDamage(cell.attack, false, false, false, cell);
	const badAttackElem = document.getElementById('badGuyAttack');
	const badAttackText = calculateDamage(cell.attack, true, false, false, cell);
	if (badAttackElem.innerHTML != badAttackText && shouldUpdate(500)) badAttackElem.innerHTML = badAttackText;
	let badCrit = false;

	if (challengeActive('Crushed')) {
		if (checkCrushedCrit()) {
			cellAttack *= 5;
			badCrit = true;
			if (game.global.world > 5) game.challenges.Crushed.critsTaken++;
		}
	}

	if (challengeActive('Duel')) {
		const critChance = game.challenges.Duel.trimpStacks;
		const roll = Math.floor(Math.random() * 100);
		if (roll < critChance) {
			cellAttack *= 10;
			badCrit = true;
		}
	}

	if (game.global.voidBuff === 'getCrit' || cell.corrupted === 'corruptCrit' || cell.corrupted === 'healthyCrit') {
		if (Math.floor(Math.random() * 4) === 0) {
			cellAttack *= cell.corrupted === 'healthyCrit' ? 7 : 5;
			badCrit = true;
		}
	}

	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.crits !== 'undefined') {
			if (Math.floor(Math.random() * 4) === 0) {
				cellAttack *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
				badCrit = true;
			}
		}
	}

	let attackAndBlock = cellAttack - game.global.soldierCurrentBlock;
	let pierce = 0;

	if (game.global.brokenPlanet && !game.global.mapsActive) {
		pierce = getPierceAmt();
		const atkPierce = pierce * cellAttack;
		if (attackAndBlock < atkPierce) attackAndBlock = atkPierce;
	}

	if (attackAndBlock < 0) attackAndBlock = 0;
	if (getPerkLevel('Frenzy') > 0) game.portal.Frenzy.beforeAttack();

	let trimpAttack = calculateDamage(game.global.soldierCurrentAttack, false, true);
	const goodAttackElem = document.getElementById('goodGuyAttack');
	const goodAttackText = calculateDamage(game.global.soldierCurrentAttack, true, true);
	if (goodAttackElem.innerHTML != goodAttackText && shouldUpdate(500)) goodAttackElem.innerHTML = goodAttackText;

	updateTitimp();
	let critTier = 0;
	let critChance = getPlayerCritChance();
	let doubleCritChance = getPlayerDoubleCritChance();

	if (critChance > 0) {
		critTier = Math.floor(critChance);
		critChance = critChance % 1;
		if (Math.random() < critChance) {
			critTier++;
		}

		if (doubleCritChance > 0 && Math.random() < doubleCritChance) {
			critTier++;
		}

		if (critTier > 0) {
			trimpAttack *= getPlayerCritDamageMult();
			if (critTier > 1) trimpAttack *= getMegaCritDamageMult(critTier);
		}
	}

	if (critChance < 0) {
		if (Math.random() < Math.abs(critChance)) {
			critTier = -1;
			trimpAttack *= 0.2;
		}
	}

	let attacked = false;
	let wasAttacked = false;
	let badDodge = false;

	if (cell.corrupted === 'corruptDodge') {
		if (Math.random() < 0.3) badDodge = true;
	}

	if (challengeActive('Daily') && typeof game.global.dailyChallenge.slippery !== 'undefined') {
		const slipStr = game.global.dailyChallenge.slippery.strength;
		if ((slipStr > 15 && game.global.world % 2 === 0) || (slipStr <= 15 && game.global.world % 2 === 1)) {
			if (Math.random() < dailyModifiers.slippery.getMult(slipStr)) badDodge = true;
		}
	}

	let overkill = 0;
	let plaguebringer = 0;
	let impOverkill = 0;
	const trimpsWereFull = game.global.soldierHealth === game.global.soldierHealthMax;
	const enemyWasFull = cell.health === cell.maxHealth;
	const getPlayerModifier = getPlaguebringerModifier();

	const thisKillsTheTrimp = function () {
		impOverkill -= game.global.soldierHealth;
		game.global.soldierHealth = 0;
		if (challengeActive('Mayhem')) {
			game.challenges.Mayhem.poison = 0;
			game.challenges.Mayhem.drawStacks();
		}
		if (challengeActive('Storm') && !game.global.mapsActive) {
			game.challenges.Storm.alpha = 0;
		}
	};

	const thisKillsTheBadGuy = function () {
		cell.health = 0;
	};

	//Angelic Heal
	if (game.talents.angelic.purchased && !challengeActive('Berserk') && (!game.global.spireActive || game.global.mapsActive || Math.floor((game.global.world - 100) / 100) <= game.global.spiresCompleted)) {
		game.global.soldierHealth += game.global.soldierHealth / 2;
		if (game.global.soldierHealth > game.global.soldierHealthMax) game.global.soldierHealth = game.global.soldierHealthMax;
	}

	if (challengeActive('Wither')) {
		if (game.challenges.Wither.healImmunity <= 0 && !enemyWasFull) {
			const heal = Math.floor(cell.maxHealth / 4);
			cell.health += heal;
			if (cell.health >= cell.maxHealth) {
				game.global.soldierHealth = 0;
				game.challenges.Wither.witherTrimps();
				cell.health = cell.maxHealth;
			}
		}
	}

	if (game.global.world >= getObsidianStart() && !game.global.mapsActive) {
		game.global.soldierHealth = 0;
	}

	let forceSlow = false;
	let checkFast = challengeActive('Glass') || challengeActive('Slow') || ((((game.badGuys[cell.name].fast || cell.mutation === 'Corruption') && !challengeActive('Nom')) || game.global.voidBuff === 'doubleAttack') && !challengeActive('Coordinate'));
	if (game.global.soldierHealth <= 0) checkFast = false;
	if (checkFast && challengeActive('Exterminate') && game.challenges.Exterminate.experienced) checkFast = false;

	if (challengeActive('Duel')) {
		if (game.challenges.Duel.enemyStacks < 10) checkFast = true;
		else if (game.challenges.Duel.trimpStacks < 10 && !game.global.runningChallengeSquared) forceSlow = true;
	}
	if (challengeActive('Smithless') && cell.ubersmith && !cell.failedUber) checkFast = true;
	if (cell.u2Mutation && cell.u2Mutation.length) checkFast = true;

	//Fighting a fast enemy, Trimps attack last
	if (trimpAttack > 0 && checkFast && !forceSlow) {
		reduceSoldierHealth(attackAndBlock, true);
		wasAttacked = true;
		if (game.global.soldierHealth > 0) {
			if (!badDodge) {
				if (empowerment === 'Poison') {
					cell.health -= game.empowerments.Poison.getDamage();
					stackPoison(trimpAttack);
				}

				if (trimpAttack >= cell.health) {
					overkill = trimpAttack - cell.health;
					if (cell.name === 'Improbability' && enemyWasFull) giveSingleAchieve('One-Hit Wonder');
					if (enemyWasFull && challengeActive('Unlucky') && game.global.mapsActive && currentMapObj.name === 'Dimension of Rage') {
						if (!game.challenges.Unlucky.lastHitLucky) giveSingleAchieve("Don't Need Luck");
					}
					if (!game.global.mapsActive && enemyWasFull && challengeActive('Quest') && game.challenges.Quest.questId === 3) game.challenges.Quest.questProgress++;
				} else if (getPlayerModifier > 0) {
					plaguebringer = trimpAttack * getPlayerModifier;
				}

				if (challengeActive('Glass') && trimpAttack < cell.health) game.challenges.Glass.notOneShot();
				cell.health -= trimpAttack;
				attacked = true;

				if ((game.global.voidBuff === 'doubleAttack' || cell.corrupted === 'corruptDbl' || cell.corrupted === 'healthyDbl') && cell.health > 0) {
					reduceSoldierHealth(cell.corrupted === 'healthyDbl' ? attackAndBlock * 1.5 : attackAndBlock, true);
					if (game.global.soldierHealth < 0) thisKillsTheTrimp();
				}
			}
		} else {
			thisKillsTheTrimp();
		}

		if (cell.health < 1 && game.global.formation === 5 && empowerment === 'Wind' && empowermentUber === 'Wind' && game.empowerments.Wind.currentDebuffPower < game.empowerments.Wind.stackMax()) {
			cell.health = 1;
		}

		if (cell.health <= 0) {
			thisKillsTheBadGuy();
		}
	} else {
		//Fighting a slow enemy, Trimps attack first
		if (game.global.soldierHealth > 0) {
			if (!badDodge) {
				if (empowerment === 'Poison') {
					cell.health -= game.empowerments.Poison.getDamage();
					stackPoison(trimpAttack);
				}
				if (trimpAttack >= cell.health) {
					overkill = trimpAttack - cell.health;
					if (cell.name === 'Improbability' && enemyWasFull) giveSingleAchieve('One-Hit Wonder');
					if (enemyWasFull && challengeActive('Unlucky') && game.global.mapsActive && currentMapObj.name === 'Dimension of Rage') {
						if (!game.challenges.Unlucky.lastHitLucky) giveSingleAchieve("Don't Need Luck");
					}
					if (!game.global.mapsActive && enemyWasFull && challengeActive('Quest') && game.challenges.Quest.questId === 3) game.challenges.Quest.questProgress++;
				} else if (getPlayerModifier > 0) {
					plaguebringer = trimpAttack * getPlayerModifier;
				}
				cell.health -= trimpAttack;
				attacked = true;
			}

			if (cell.health < 1 && game.global.formation === 5 && empowerment === 'Wind' && empowermentUber === 'Wind' && game.empowerments.Wind.currentDebuffPower < game.empowerments.Wind.stackMax()) {
				cell.health = 1;
			}

			if (cell.health > 0) {
				reduceSoldierHealth(attackAndBlock, true);
				wasAttacked = true;
			} else {
				thisKillsTheBadGuy();
			}

			if (game.global.soldierHealth < 0) thisKillsTheTrimp();
		}
	}
	//After attack stuff
	if (wasAttacked && !game.global.mapsActive && cellNum === 99 && game.global.challengeActive && game.challenges[game.global.challengeActive].onBossAttack) game.challenges[game.global.challengeActive].onBossAttack();

	if (challengeActive('Mayhem') && attacked) {
		game.global.soldierHealth -= game.challenges.Mayhem.poison;
		if (game.global.soldierHealth < 0) thisKillsTheTrimp();
	}

	if (game.global.soldierHealth > 0 && getHeirloomBonus('Shield', 'gammaBurst') > 0) {
		let burst = game.heirlooms.Shield.gammaBurst;
		burst.stacks++;
		let triggerStacks = autoBattle.oneTimers.Burstier.owned ? 4 : 5;
		if (Fluffy.isRewardActive('scruffBurst')) triggerStacks--;
		if (burst.stacks >= triggerStacks) {
			burst.stacks = triggerStacks;
			if (cell.health > 0) {
				let burstDamage = calcHeirloomBonus('Shield', 'gammaBurst', trimpAttack);
				if (challengeActive('Storm') && game.challenges.Storm.mutations > 0) burstDamage *= game.challenges.Storm.getGammaMult();
				cell.health -= burstDamage;
				burst.stacks = 0;
				if (cell.health > 0 && getPlayerModifier > 0) {
					plaguebringer += burstDamage * getPlayerModifier;
				}

				if (game.global.formation === 5 && empowerment === 'Wind' && empowermentUber === 'Wind' && cell.health < 1) {
					cell.health = 1;
				} else if (cell.health <= 0) {
					overkill = Math.abs(cell.health);
					thisKillsTheBadGuy();
				}

				if (empowerment === 'Poison') stackPoison(burstDamage);
			}
		}
		updateGammaStacks();
	}
	//if (challengeActive("Quagmire") overkill = 0;
	//if (challengeActive("Archaeology" && !game.global.mapsActive) overkill = 0;
	//if (game.challenges.Quest.disableOverkill()) overkill = 0;

	if (game.global.formation === 5 && empowerment === 'Wind' && empowermentUber === 'Wind') {
		overkill = 0;
		if (plaguebringer === 0) plaguebringer = 1;
	}

	if (cell.health / cell.maxHealth < 0.5 && empowerment === 'Ice' && empowermentUber === 'Ice' && game.empowerments.Ice.currentDebuffPower > 20) {
		cell.health = 0;
		thisKillsTheBadGuy();
		overkill = 'shatter';
	}

	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.mirrored !== 'undefined' && attacked && game.global.soldierHealth > 0) {
			reduceSoldierHealth(dailyModifiers.mirrored.reflectDamage(game.global.dailyChallenge.mirrored.strength, Math.min(cell.maxHealth, trimpAttack)));
			if (game.global.soldierHealth <= 0) thisKillsTheTrimp();
		}
		if (typeof game.global.dailyChallenge.plague !== 'undefined') {
			if (attacked) {
				game.global.soldierHealth -= game.global.soldierHealthMax * dailyModifiers.plague.getMult(game.global.dailyChallenge.plague.strength, game.global.dailyChallenge.plague.stacks);
				if (game.global.soldierHealth < 0) thisKillsTheTrimp();
			}
			if (wasAttacked) {
				game.global.dailyChallenge.plague.stacks++;
				updateDailyStacks('plague');
			}
		}
		if (typeof game.global.dailyChallenge.bogged !== 'undefined') {
			if (attacked) {
				game.global.soldierHealth -= game.global.soldierHealthMax * dailyModifiers.bogged.getMult(game.global.dailyChallenge.bogged.strength);
				if (game.global.soldierHealth < 0) thisKillsTheTrimp();
			}
		}
		if (typeof game.global.dailyChallenge.weakness !== 'undefined') {
			if (wasAttacked) {
				game.global.dailyChallenge.weakness.stacks++;
				if (game.global.dailyChallenge.weakness.stacks >= 9) game.global.dailyChallenge.weakness.stacks = 9;
				updateDailyStacks('weakness');
			}
		}
	}

	if (game.global.universe === 1) {
		if ((challengeActive('Electricity') || challengeActive('Mapocalypse')) && attacked) {
			game.global.soldierHealth -= game.global.soldierHealthMax * (game.challenges.Electricity.stacks * 0.1);
			if (game.global.soldierHealth < 0) thisKillsTheTrimp();
			if (challengeActive('Electricity')) {
				game.challenges.Electricity.attacksInARow++;
				if (game.challenges.Electricity.attacksInARow >= 20) giveSingleAchieve('Grounded');
			}
		}

		if ((challengeActive('Electricity') || challengeActive('Mapocalypse')) && wasAttacked) {
			game.challenges.Electricity.stacks++;
			updateElectricityStacks();
		}

		if (challengeActive('Domination')) {
			let dominating = false;
			if (game.global.mapsActive && currentMapObj.size === cellNum + 1) dominating = true;
			else if (!game.global.mapsActive && cellNum === 99) dominating = true;

			if (cell.health > 0 && dominating) {
				if (cell.health / cell.maxHealth < 0.95) cell.health += cell.maxHealth * 0.05;
				if (cell.health > cell.maxHealth) cell.health = cell.maxHealth;
			}
		}

		if (challengeActive('Toxicity') && attacked) {
			let tox = game.challenges.Toxicity;
			tox.stacks++;
			if (tox.stacks > tox.maxStacks) tox.stacks = tox.maxStacks;
			if (tox.stacks > tox.highestStacks) tox.highestStacks = tox.stacks;
			updateToxicityStacks();
		}

		if (!game.global.mapsActive && challengeActive('Life') && attacked) {
			let life = game.challenges.Life;
			const oldStacks = life.stacks;
			if (cell.mutation === 'Living') life.stacks -= 5;
			else life.stacks++;
			if (life.stacks > life.maxStacks) life.stacks = life.maxStacks;
			if (life.stacks < 0) life.stacks = 0;
			if (life.stacks !== oldStacks) {
				game.global.soldierHealthMax = (game.global.soldierHealthMax / (1 + oldStacks / 10)) * (1 + life.stacks / 10);
				game.global.soldierHealth = (game.global.soldierHealth / (1 + oldStacks / 10)) * (1 + life.stacks / 10);
				if (game.global.soldierHealthMax < game.global.soldierHealth) {
					game.global.soldierHealth = game.global.soldierHealthMax;
				}
				if (game.global.soldierHealth < 0) thisKillsTheTrimp();
				updateAllBattleNumbers();
			}
			updateLivingStacks();
		}

		if ((challengeActive('Nom') || challengeActive('Toxicity')) && attacked) {
			game.global.soldierHealth -= game.global.soldierHealthMax * 0.05;
			if (game.global.soldierHealth < 0) thisKillsTheTrimp();
		}

		if (challengeActive('Lead') && attacked && cell.health > 0) {
			game.global.soldierHealth -= game.global.soldierHealthMax * Math.min(game.challenges.Lead.stacks, 200) * 0.0003;
			if (game.global.soldierHealth < 0) thisKillsTheTrimp();
		}

		if (empowerment === 'Ice' && attacked) {
			let addStacks = 1;
			if (empowermentUber === 'Ice') addStacks *= 2;
			if (Fluffy.isRewardActive('plaguebrought')) addStacks *= 2;
			game.empowerments.Ice.currentDebuffPower += addStacks;
			handleIceDebuff();
		}

		if (empowerment === 'Wind' && attacked) {
			let addStacks = 1;
			if (empowermentUber === 'Wind') addStacks *= 2;
			if (Fluffy.isRewardActive('plaguebrought')) addStacks *= 2;
			game.empowerments.Wind.currentDebuffPower += addStacks;
			if (game.empowerments.Wind.currentDebuffPower > game.empowerments.Wind.stackMax()) game.empowerments.Wind.currentDebuffPower = game.empowerments.Wind.stackMax();
			handleWindDebuff();
		}
	}

	if (game.global.universe === 2) {
		if (getPerkLevel('Frenzy') > 0 && attacked && game.global.soldierHealth > 0) {
			game.portal.Frenzy.trimpAttacked();
		}

		if (challengeActive('Duel')) {
			const challenge = game.challenges.Duel;
			let trimpPoints = 0;
			let enemyPoints = 0;
			if (badCrit) enemyPoints++;
			if (critTier > 0) trimpPoints++;
			if (game.global.soldierHealth <= 0) {
				if (trimpsWereFull) enemyPoints += 5;
				else enemyPoints += 2;
			}
			if (cell.health <= 0) {
				if (enemyWasFull) trimpPoints += 5;
				else trimpPoints += 2;
			}
			challenge.enemyStacks += enemyPoints - trimpPoints;
			challenge.trimpStacks += trimpPoints - enemyPoints;
			if (challenge.enemyStacks > 100) {
				challenge.enemyStacks = 100;
				challenge.trimpStacks = 0;
			}
			if (challenge.trimpStacks > 100) {
				challenge.trimpStacks = 100;
				challenge.enemyStacks = 0;
			}
			challenge.drawStacks();
		}

		if (challengeActive('Storm') && !game.global.mapsActive) {
			if (game.global.soldierHealth > 0) {
				game.challenges.Storm.alpha++;
				game.global.soldierHealth -= game.global.soldierHealthMax * (game.challenges.Storm.alpha * game.challenges.Storm.alphaLoss);
				if (game.global.soldierHealth < 0) thisKillsTheTrimp();
			}
			if (cell.health > 0) {
				game.challenges.Storm.enemyAttacked(cell);
			}
			game.challenges.Storm.drawStacks();
		}

		if (challengeActive('Berserk') && attacked) {
			game.challenges.Berserk.attacked();
		}

		if (challengeActive('Glass') && attacked && game.global.soldierHealth > 0) {
			game.challenges.Glass.checkReflect(cell, trimpAttack);
			if (game.global.soldierHealth <= 0) thisKillsTheTrimp();
		}

		if (challengeActive('Smithless') && cell.ubersmith) {
			game.challenges.Smithless.attackedUber();
		}

		if (challengeActive('Desolation')) {
			if (wasAttacked && !game.global.mapsActive) {
				game.challenges.Desolation.addChilledStacks(1);
				game.challenges.Desolation.drawStacks();
			}
			if (attacked && game.global.mapsActive) {
				game.challenges.Desolation.mapAttacked(currentMapObj.level);
			}
		}

		if (game.global.universe === 2 && attacked && cell.u2Mutation && cell.u2Mutation.length) {
			if (u2Mutations.types.Nova.hasNova(cell)) u2Mutations.types.Nova.attacked();
			if (u2Mutations.types.Rage.hasRage(cell)) u2Mutations.types.Rage.attacked();
			if (game.global.spireActive && u2Mutations.types.Spire1.hasMut(cell)) u2Mutations.types.Spire1.attacked(cell);
		}
	}

	if ((game.global.voidBuff === 'bleed' || cell.corrupted === 'corruptBleed' || cell.corrupted === 'healthyBleed') && wasAttacked) {
		const bleedMod = cell.corrupted === 'healthyBleed' ? 0.3 : 0.2;
		game.global.soldierHealth -= game.global.soldierHealth * bleedMod;
		if (game.global.soldierHealth < 1) thisKillsTheTrimp();
	}

	const critSpanElem = document.getElementById('critSpan');
	const critSpanText = getCritText(critTier);
	if (critSpanElem.innerHTML !== critSpanText && !usingRealTimeOffline) critSpan.innerHTML = critSpanText;

	if (critTier >= 3) redCritCounter++;
	else redCritCounter = 0;

	if (redCritCounter >= 10) giveSingleAchieve('Critical Luck');

	let badCritText;

	if (badDodge) badCritText = 'Dodge!';
	else if (badCrit && wasAttacked) badCritText = 'Crit!';
	else badCritText = '';

	const badCritElem = document.getElementById('badCrit');
	if (badCritElem.innerHTML !== badCritText && !usingRealTimeOffline) badCritElem.innerHTML = badCritText;
	if (cell.health <= 0) game.global.battleCounter = 800;

	if (!game.global.mapsActive && getPerkLevel('Hunger')) {
		game.portal.Hunger.storedDamage += overkill;
	}

	if (overkill) {
		const nextCell = game.global.mapsActive ? game.global.mapGridArray[cellNum + 1] : game.global.gridArray[cellNum + 1];
		if (nextCell && nextCell.health !== 'compressed') {
			nextCell.health = overkill;
			nextCell.OKcount = 1;
		}
	} else if (plaguebringer > 0) {
		const nextCell = game.global.mapsActive ? game.global.mapGridArray[cellNum + 1] : game.global.gridArray[cellNum + 1];
		if (nextCell) {
			if (!nextCell.plaguebringer) nextCell.plaguebringer = plaguebringer;
			else nextCell.plaguebringer += plaguebringer;
			if (!nextCell.plagueHits) nextCell.plagueHits = getPlayerModifier;
			else nextCell.plagueHits += getPlayerModifier;
		}
	}

	if (challengeActive('Devastation') && impOverkill) {
		game.challenges.Devastation.lastOverkill = impOverkill;
	}

	if (challengeActive('Revenge') && impOverkill) {
		game.challenges.Revenge.lastOverkill = impOverkill;
	}

	if (cell.health <= 0 && typeof game.global.dailyChallenge.explosive !== 'undefined') {
		if (game.global.dailyChallenge.explosive.strength <= 15 || game.global.soldierHealthMax > game.global.soldierCurrentBlock) {
			const explodeDamage = cellAttack * dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength);
			let explodeAndBlock = explodeDamage - game.global.soldierCurrentBlock;
			if (explodeAndBlock < 0) explodeAndBlock = 0;
			if (pierce > 0) {
				const explodePierce = pierce * explodeDamage;
				if (explodeAndBlock < explodePierce) explodeAndBlock = explodePierce;
			}
			reduceSoldierHealth(explodeAndBlock);
			if (game.global.soldierHealth <= 0) thisKillsTheTrimp();
		}
	}

	if (game.global.universe === 2) {
		if (cell.health <= 0 && challengeActive('Storm')) {
			game.challenges.Storm.enemyDied();
		}
		if (cell.health <= 0 && challengeActive('Berserk')) {
			game.challenges.Berserk.enemyDied();
		}
		if (game.global.soldierHealth <= 0 && challengeActive('Berserk')) {
			game.challenges.Berserk.trimpDied();
		}
		if (game.global.soldierHealth <= 0 && challengeActive('Exterminate')) {
			game.challenges.Exterminate.trimpDied();
		}
		if (getPerkLevel('Frenzy') && game.global.soldierHealth <= 0) {
			game.portal.Frenzy.trimpDied();
		}
	}

	if (cell.health > 0) {
		game.global.fightAttackCount++;
	} else {
		game.global.fightAttackCount = 0;
	}

	if (game.global.soldierHealth > 0) {
		game.global.armyAttackCount++;
	} else if (game.portal.Equality.scalingActive && game.global.armyAttackCount <= game.portal.Equality.scalingSetting) {
		game.portal.Equality.scalingCount++;
		manageEqualityStacks();
	}

	if (game.global.fightAttackCount > 0 && game.portal.Equality.scalingActive && game.portal.Equality.scalingReverse && game.global.fightAttackCount % game.portal.Equality.reversingSetting === 0 && game.global.armyAttackCount > game.portal.Equality.scalingSetting && cell.health > 0) {
		game.portal.Equality.scalingCount--;
		manageEqualityStacks();
	}

	if (makeUp) return;
	updateGoodBar();
	updateBadBar(cell);
}

function nextWorld() {
	if (game.global.spireActive && game.global.universe === 2) {
		nextU2SpireFloor();
		return;
	}

	if (game.global.world > getHighestLevelCleared()) {
		if (game.global.universe === 2) {
			game.global.highestRadonLevelCleared = game.global.world;
		} else {
			game.global.highestLevelCleared = game.global.world;
		}

		setVoidMaxLevel(game.global.world);
		if (game.global.universe === 1) {
			if (game.global.world === 199) addNewSetting('mapsOnSpire');
			else if (game.global.world === 180) {
				unlockFormation(4);
				filterTabs('talents');
				addNewSetting('masteryTab');
			} else if (game.global.world === 64) tooltip('UnlockedChallenge2', null, 'update');
			else if (game.global.world === 60) addNewSetting('ctrlGigas');
			else if (game.global.world === 79) addNewSetting('bigPopups');
		} else if (game.global.universe === 2) {
			if (game.global.world === 49) tooltip('UnlockedChallenge3', null, 'update');
			countChallengeSquaredReward();
			if (game.global.world === 74) autoBattle.firstUnlock();
			if (game.global.world === 201) {
				game.global.tabForMastery = false;
				document.getElementById('MasteryTabName').innerHTML = 'Mutators';
			}
		}
	}
	if (game.global.universe === 2 && game.global.novaMutStacks > 0) u2Mutations.types.Nova.removeStacks();
	Fluffy.rewardExp();
	game.global.world++;
	document.getElementById('worldNumber').innerHTML = game.global.world;
	game.global.mapBonus = 0;
	const mapBonusElem = document.getElementById('mapBonus');
	if (mapBonusElem.innerHTML !== '') document.getElementById('mapBonus').innerHTML = '';
	game.global.lastClearedCell = -1;
	game.global.gridArray = [];
	if (checkIfSpireWorld()) startSpire();
	buildGrid();
	liquifyZone();
	drawGrid();
	buyAutoJobs(true);
	let msgText = getWorldText(game.global.world);
	if (msgText) {
		let extraClass = null;
		if (Array.isArray(msgText)) {
			extraClass = msgText[1];
			msgText = msgText[0];
		}
		message('Z:' + game.global.world + ' ' + msgText, 'Story', null, extraClass);
	}
	if (game.global.canMagma) checkAchieve('zones');
	checkGenStateSwitch();
	if (challengeActive('Scientist') && game.global.highestLevelCleared >= 129 && getSLevel() >= 4 && game.global.world === 76) {
		giveSingleAchieve('AntiScience');
	}
	if (getPerkLevel('Tenacity')) {
		if (game.portal.Tenacity.timeLastZone !== -1) game.portal.Tenacity.timeLastZone *= game.portal.Tenacity.getCarryoverMult();
		game.portal.Tenacity.timeLastZone += getZoneMinutes();
	}
	game.global.zoneStarted = getGameTime();
	if (challengeActive('Mapology')) {
		game.challenges.Mapology.credits++;
		updateMapCredits();
	}
	if (game.global.roboTrimpLevel && game.global.brokenPlanet) {
		if (game.global.roboTrimpCooldown > 0) game.global.roboTrimpCooldown--;
		displayRoboTrimp();
	}
	if (challengeActive('Toxicity')) {
		game.challenges.Toxicity.stacks = 0;
		updateToxicityStacks();
	}
	if (challengeActive('Watch')) {
		if (game.global.world > 6) dropPrestiges();
		if (!getAutoJobsSetting().enabled) assignExtraWorkers();
	}
	if (challengeActive('Lead')) {
		if (game.global.world % 2 === 0) game.challenges.Lead.stacks = 200;
		manageLeadStacks();
	}
	if (challengeActive('Decay') || challengeActive('Melt')) {
		let challenge = game.challenges[game.global.challengeActive];
		challenge.stacks = 0;
	}
	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.toxic !== 'undefined') {
			game.global.dailyChallenge.toxic.stacks = 0;
			updateDailyStacks('toxic');
		}
		if (typeof game.global.dailyChallenge.karma !== 'undefined') {
			game.global.dailyChallenge.karma.stacks = 0;
			updateDailyStacks('karma');
		}
		if (typeof game.global.dailyChallenge.pressure !== 'undefined') {
			dailyModifiers.pressure.resetTimer();
		}
	}
	if (game.talents.blacksmith.purchased && (!challengeActive('Mapology') || !game.global.runningChallengeSquared)) {
		let smithWorld = 0.5;
		if (game.talents.blacksmith3.purchased) smithWorld = 0.9;
		else if (game.talents.blacksmith2.purchased) smithWorld = 0.75;
		smithWorld = Math.floor((getHighestLevelCleared(false, true) + 1) * smithWorld);
		if (game.global.world <= smithWorld) {
			dropPrestiges();
		}
	}
	if (game.talents.bionic.purchased && game.global.universe === 1) {
		let bTier = (game.global.world - 126) / 15;
		if (game.global.world >= 126) game.mapUnlocks.BionicWonderland.canRunOnce = false;
		if (bTier % 1 === 0 && bTier === game.global.bionicOwned && game.global.roboTrimpLevel >= bTier) {
			game.mapUnlocks.roboTrimp.createMap(bTier);
			refreshMaps();
		}
	}
	if (game.talents.housing.purchased) {
		autoUnlockHousing();
	}
	if (game.global.universe === 2 && getPerkLevel('Prismal') >= 20 && game.global.world === 21 && game.upgrades.Prismalicious.locked === 1) {
		unlockUpgrade('Prismalicious');
		game.mapUnlocks.Prismalicious.canRunOnce = false;
	}
	if (game.talents.explorers.purchased) {
		if (Math.floor((game.global.world - game.mapUnlocks.Speedexplorer.next) / 10)) {
			game.mapUnlocks.Speedexplorer.fire(0, true);
			if (game.global.currentMapId) {
				for (let x = 0; x < game.global.mapGridArray.length; x++) {
					if (game.global.mapGridArray[x].special === 'Speedexplorer') game.global.mapGridArray[x].special = '';
				}
			}
		}
	}
	if (game.talents.portal.purchased && game.global.world === 21 && game.mapUnlocks.Portal.canRunOnce) {
		game.mapUnlocks.Portal.fire(0, true);
		game.mapUnlocks.Portal.canRunOnce = false;
		refreshMaps();
	}
	if (game.talents.bounty.purchased && game.global.world === 16 && game.mapUnlocks.Bounty.canRunOnce) {
		game.mapUnlocks.Bounty.fire();
		game.mapUnlocks.Bounty.canRunOnce = false;
		refreshMaps();
	}
	if (game.global.universe === 1 && game.global.world === mutations.Corruption.start(true)) {
		tooltip('Corruption', null, 'update');
	}
	if (mutations.Magma.active()) {
		if (game.global.world === mutations.Magma.start()) {
			startTheMagma();
		}
		mutations.Magma.increaseTrimpDecay();
		increaseTheHeat();
		decayNurseries();
	}
	if (challengeActive('Eradicated') && game.global.world <= 101) unlockUpgrade('Coordination');
	if (game.global.world === 30 && game.global.canRespecPerks && !game.global.bonePortalThisRun && countHeliumSpent() <= 60) giveSingleAchieve('Underachiever');
	else if (game.global.world === 10 && game.stats.trimpsKilled.value <= 5) giveSingleAchieve('Peacekeeper');
	else if (game.global.world === 60) {
		if (game.stats.trimpsKilled.value <= 1000) giveSingleAchieve('Workplace Safety');
		if (game.stats.cellsOverkilled.value + game.stats.zonesLiquified.value * 50 === 2950) giveSingleAchieve('Gotta Go Fast');
		if (getHighestPrestige() <= 3) giveSingleAchieve('Shaggy');
		//Without Hiring Anything
		let jobCount = 0;
		for (let job in game.jobs) jobCount += game.jobs[job].owned; //Dragimp adds 1
		if (jobCount - game.jobs.Dragimp.owned - game.jobs.Amalgamator.owned === 0 && game.stats.trimpsFired.value === 0) giveSingleAchieve('Unemployment');
		if (game.global.universe === 2) buffVoidMaps();
	} else if (game.global.world === 65) checkChallengeSquaredAllowed();
	else if (game.global.world === 75 && checkHousing(true) === 0) giveSingleAchieve('Tent City');
	else if (game.global.world === 120 && !game.global.researched) giveSingleAchieve('No Time for That');
	else if (game.global.world === 200 && game.global.universe === 1) buffVoidMaps200();
	if (game.global.world === 201 && game.global.universe === 2) {
		tooltip('The Mutated Zones', null, 'update');
	}
	if (challengeActive('Life')) {
		if (game.global.world >= 100 && game.challenges.Life.lowestStacks === 150) giveSingleAchieve('Very Sneaky');
		game.challenges.Life.lowestStacks = game.challenges.Life.stacks;
	}
	displayGoldenUpgrades();
	if (game.achievements.humaneRun.earnable) {
		if (game.stats.battlesLost.value > game.achievements.humaneRun.lastZone + 1) {
			game.achievements.humaneRun.lastZone = game.global.world - 1;
			game.achievements.humaneRun.earnable = false;
		} else {
			checkAchieve('humaneRun');
			game.achievements.humaneRun.lastZone = game.stats.battlesLost.value;
		}
	}
	setEmpowerTab();
	if (game.global.buyTab === 'nature') updateNatureInfoSpans();
	if (game.global.world === 236 && getUberEmpowerment() === 'Wind') unlockFormation(5);
	if (game.global.world >= 241 && game.global.world % 5 === 1) {
		resetEmpowerStacks();
	}
	game.stats.zonesCleared.value++;
	checkAchieve('totalZones');
	if (game.global.universe === 2) {
		checkAchieve('mapless');
		checkAchieve('shielded');
		checkAchieve('zones2');
	}

	if (game.global.challengeActive) {
		let challenge = game.challenges[game.global.challengeActive];
		if (!game.global.runningChallengeSquared && challenge.completeAfterZone && challenge.completeAfterZone === game.global.world - 1 && typeof challenge.onComplete !== 'undefined') challenge.onComplete();
		else if (typeof challenge.onNextWorld !== 'undefined') challenge.onNextWorld();
	}
	if (challengeActive('Exterminate') && game.challenges.Exterminate.swarmStacks >= 100 && game.global.world <= 120) game.challenges.Exterminate.achieveDone = true;
	if (challengeActive('Hypothermia') && game.global.world > game.challenges.Hypothermia.failAfterZone) game.challenges.Hypothermia.onFail();
	game.jobs.Meteorologist.onNextWorld();
	game.jobs.Worshipper.onNextWorld();
	if (!game.portal.Observation.radLocked && game.global.universe === 2) game.portal.Observation.onNextWorld();
	if (game.global.capTrimp) message("I'm terribly sorry, but your Trimp<sup>2</sup> run appears to have more than one Trimp fighting, which kinda defeats the purpose. Your score for this Challenge<sup>2</sup> will be capped at 230.", 'Notices');
	if (game.global.world >= getObsidianStart()) {
		let next = game.global.highestRadonLevelCleared >= 99 ? '50' : '10';
		let text;
		if (!Fluffy.checkU2Allowed()) text = " Fluffy has an idea for remelting the world, but it will take a tremendous amount of energy from a place Fluffy isn't yet powerful enough to send you. Fluffy asks you to help him reach the <b>10th Level of his 8th Evolution</b>, and he promises he'll make it worth your time.";
		else if (game.global.world === 810) text = '';
		else text = ' However, all is not lost! Every ' + next + ' Zones of progress you make in the Radon Universe will allow you to harness enough energy for Fluffy to slow down the hardening of your World for an extra 10 Zones in this Universe.';
		message('The Magma has solidified into impenetrable Obsidian; your Trimps have no hope of progressing here right now.' + text, 'Notices', null, 'obsidianMessage');
	}
	game.global.zoneRes.unshift(0);
	if (game.global.zoneRes.length > 5) game.global.zoneRes.pop();
	if (game.global.world === 60 && game.global.universe === 2 && game.global.exterminateDone && game.buildings.Hub.locked) {
		unlockBuilding('Hub');
	}
	if (game.global.world === 175 && game.global.universe === 2) {
		message('You see a strange light radiating out of a strange ice cube in a strange spot in the Zone. You have a nearby Trimp crack it open, and find a map to a Frozen Castle!', 'Story');
		createMap(175, 'Frozen Castle', 'Frozen', 10, 100, 5, true, true);
	}
	if (game.global.world >= 176 && game.global.world <= 200 && game.global.universe === 2) {
		for (let z = 0; z < game.global.mapsOwnedArray.length; z++) {
			if (game.global.mapsOwnedArray[z].location === 'Frozen') {
				game.global.mapsOwnedArray[z].level = game.global.world;
				if (game.global.currentMapId === game.global.mapsOwnedArray[z].id) {
					game.global.currentMapId = '';
					game.global.lastClearedMapCell = -1;
					game.global.mapGridArray = [];
				}
				break;
			}
		}
	}

	u2Mutations.tree.Tauntimps.check();
}

function screwThisUniverse(confirmed) {
	if (!confirmed) {
		tooltip('confirm', null, 'update', 'Are you sure you want to return to Universe 1? You will lose any Radon and Scruffy Exp earned so far.', 'screwThisUniverse(true)', 'Abandon Scruffy', "I'm sure he'll be fine");
		return;
	}

	game.global.totalRadonEarned -= game.resources.radon.owned;
	game.resources.radon.owned = 0;
	game.global.fluffyExp2 -= Fluffy.getBestExpStat().value;
	Fluffy.getBestExpStat().value = 0;
	portalClicked();
	swapPortalUniverse();
	portalUniverse = 1;
	resetGame(true);
	checkEquipPortalHeirlooms();
	document.getElementById('finishDailyBtnContainer').style.display = 'none';
}

game.worldUnlocks.Magmamancer.fire = function () {
	if (challengeActive('Metal') || challengeActive('Transmute')) {
		const challenge = challengeActive('Metal') ? game.challenges.Metal : game.challenges[game.global.challengeActive];
		challenge.holdMagma = true;
		message("This book really doesn't help too much while you're dealing with the minerlessness of this dimension. Better let your scientists hold this one for you for a bit.", 'Notices');
		return;
	}
	unlockUpgrade('Magmamancers');
};

game.challenges.Hypothermia.bonfireTooltip = function () {
	let text = '';

	if (this.bonfires === 0) {
		text = 'You have no active Bonfires. Your Trimps are sad and cold. Next Bonfire will be constructed at ' + prettify(this.bonfirePrice()) + ' Wood.';
	} else {
		const bonfireLength = this.getBonfireLength();
		text = 'You have ' + this.bonfires + ' active Bonfire' + needAnS(this.bonfires) + '. Your Trimps will automatically construct another Bonfire once you start a Zone with ' + prettify(this.bonfirePrice()) + ' total Wood. Your next Bonfire will expire at the start of Zone ' + (this.lastBurn + bonfireLength) + '.';
	}

	text += `<br><br>You have constructed ${this.totalBonfires} Bonfire${needAnS(this.totalBonfires)} so far this run.`;

	return text;
};

offlineProgress.fluff = function () {
	const fluffs = [
		`Your Trimps really missed you`,
		`Your Trimps didn't do dishes while you were gone`,
		`A Scientist has been locked outside all night`,
		`There's a Snimp in the pantry`,
		`Your Trimps threw a party while you were out`,
		`Your Trimps raided your fridge while you were gone`,
		`Some Trimps toilet papered your ship`,
		`Your Trimps were a few minutes away from burning the place down`,
		`The Turkimps escaped again`,
		`Your Trimps ran the AC all night`,
		`Wow, such speed`,
		`Your Trimps dinged your ship while out on a joyride`,
		`One of your Trimps got a tattoo while you were gone`
	];

	if (game.global.fluffyExp > 0) {
		const name = Fluffy.getName();
		fluffs.push(`${name} reminds you that he's not a babysitter`);
		fluffs.push(`${name} wrote a novel while you were gone`);
		fluffs.push(`${name} really missed you`);
		fluffs.push(`${name} greets you excitedly`);
		fluffs.push(`${name} forgives you for leaving`);
	}
	this.currentFluff = fluffs[Math.floor(Math.random() * fluffs.length)];
	return this.currentFluff;
};

offlineProgress.showEquality = function () {
	if (this.showingEquality || game.global.universe === 1 || game.portal.Equality.radLocked) {
		const newTimeOfflineHTML = 'Welcome back! You were offline for ' + this.formatTime(Math.floor(this.totalOfflineTime / 1000)) + '.';
		if (this.timeOfflineElem.innerHTML !== newTimeOfflineHTML) {
			this.timeOfflineElem.innerHTML = newTimeOfflineHTML;
		}
		if (this.equalityBtn.innerHTML !== 'Show Equality') {
			this.equalityBtn.innerHTML = 'Show Equality';
		}
		this.showingEquality = false;
		return;
	}
	let text = `<div style="font-size: 0.75vw; margin-top: -3.5vw;"><div style="width: 50%; font-size: 0.75vw;" role="button" class="noselect pointer portalThing thing perkColorOff changingOff equalityColorOn" id="equalityScaling3" onclick="toggleEqualityScale()"><span class="thingName">Scale Equality</span><br><span class="thingOwned"><span id="equalityScalingState3">On</span></span></div><br/></div>`;
	text += getEqualitySliders(true);
	text += '</div>';

	if (this.timeOfflineElem.innerHTML !== text) {
		this.timeOfflineElem.innerHTML = text;
	}
	updateEqualityScaling();

	if (this.equalityBtn.innerHTML !== 'Hide Equality') {
		this.equalityBtn.innerHTML = 'Hide Equality';
	}
	this.showingEquality = true;
};

offlineProgress.updateFormations = function (force) {
	if (!game.upgrades.Formations.done && !force) {
		if (this.formationsElem.style.display !== 'none') {
			this.formationsElem.style.display = 'none';
		}
		return;
	}

	let text = `<div class='formationBtn offlineForm pointer ${game.global.formation === 0 ? 'formationStateEnabled' : 'formationStateDisabled'}' onclick='setFormation("0")'>X</div>`;
	text += `<div class='formationBtn offlineForm pointer ${game.global.formation === 1 ? 'formationStateEnabled' : 'formationStateDisabled'}' onclick='setFormation("1")'>H</div>`;
	if (game.upgrades.Dominance.done) text += `<div class='formationBtn offlineForm pointer ${game.global.formation === 2 ? 'formationStateEnabled' : 'formationStateDisabled'}' onclick='setFormation("2")'>D</div>`;
	if (game.upgrades.Barrier.done) text += `<div class='formationBtn offlineForm pointer ${game.global.formation === 3 ? 'formationStateEnabled' : 'formationStateDisabled'}' onclick='setFormation("3")'>B</div>`;
	if (getHighestLevelCleared() >= 180) text += `<div class='formationBtn offlineForm pointer ${game.global.formation === 4 ? 'formationStateEnabled' : 'formationStateDisabled'}' onclick='setFormation("4")'>S</div>`;
	if (game.global.uberNature === 'Wind') text += `<div class='formationBtn offlineForm pointer ${game.global.formation === 5 ? 'formationStateEnabled' : 'formationStateDisabled'}' onclick='setFormation("5")'>W</div>`;

	if (this.formationsElem.innerHTML !== text) {
		this.formationsElem.innerHTML = text;
	}

	if (this.formationsElem.style.display !== 'block') {
		this.formationsElem.style.display = 'block';
	}
};

function calculateMapCost(plusLevel = 0) {
	const mapPresets = game.global.universe === 2 ? game.global.mapPresets2 : game.global.mapPresets;
	const { loot, difficulty, size, biome, perf, specMod } = mapPresets[`p${game.global.selectedMapPreset}`];

	const mapLevel = Math.max(game.global.world, 6);
	let baseCost = loot + difficulty + size;
	baseCost *= game.global.world >= 60 ? 0.74 : 1;

	if (perf && [loot, difficulty, size].reduce((a, b) => a + b) === 27) baseCost += 6;
	if (plusLevel > 0) baseCost += plusLevel * 10;
	if (specMod !== '0') baseCost += mapSpecialModifierConfig[specMod].costIncrease;

	baseCost += mapLevel;
	baseCost = Math.floor((baseCost / 150) * Math.pow(1.14, baseCost - 1) * mapLevel * 2 * Math.pow(1.03 + mapLevel / 50000, mapLevel));
	baseCost *= biome !== 'Random' ? 2 : 1;

	return baseCost;
}

offlineProgress.updateMapBtns = function () {
	if (game.global.preMapsActive || game.global.mapsActive) {
		if (this.zoneBtnsElem.style.display !== 'block') {
			this.zoneBtnsElem.style.display = 'block';
			this.mapBtnsElem.style.display = 'none';
		}
	} else {
		if (this.mapBtnsElem.style.display !== 'block') {
			this.zoneBtnsElem.style.display = 'none';
			this.mapBtnsElem.style.display = 'block';
		}
	}

	if (this.mapsAllowed < 1) {
		if (this.mapBtnsInnerElem.style.display !== 'block') {
			this.mapBtnsInnerElem.style.display = 'none';
			const elemText = 'No maps available<br>Gain 1 map for each 8 hours away';
			if (this.mapTextElem.innerHTML !== elemText) {
				this.mapTextElem.innerHTML = elemText;
			}
		}
		return;
	}

	this.mapBtnsInnerElem.style.display = 'block';
	const world = game.global.world;
	const frags = game.resources.fragments.owned;
	for (let x = 0; x < 4; x++) {
		const useWorld = world - x;
		if (useWorld < 6) {
			this.mapBtns[x].style.display = 'none';
			continue;
		}

		const price = calculateMapCost(0 - x);

		let mapText = '';
		let displayStyle = '';
		let innerHTML = '';

		if (x === 4 && price > frags) {
			mapText = "Oof, you don't have enough fragments to run a map.";
			displayStyle = 'none';
		} else {
			mapText = `You can run <b>${this.mapsAllowed} map${needAnS(this.mapsAllowed)}</b> while you wait!<br>Use ${this.mapsAllowed === 1 ? 'it' : 'them'} wisely...<br>You have ${prettify(frags)} Fragments.`;
			displayStyle = 'inline-block';
		}

		innerHTML = `Z ${useWorld} map<br>${prettify(price)} Frags<br>${this.countMapItems(useWorld)} items`;

		if (this.mapTextElem.innerHTML !== mapText) {
			this.mapTextElem.innerHTML = mapText;
		}

		if (this.mapBtns[x].style.display !== displayStyle) {
			this.mapBtns[x].style.display = displayStyle;
		}

		if (this.mapBtns[x].innerHTML !== innerHTML) {
			this.mapBtns[x].innerHTML = innerHTML;
		}
	}
};

offlineProgress.countMapItems = function (useWorld) {
	const dummy = { location: 'All', level: useWorld, size: 100 };
	return addSpecials(true, true, dummy);
};

offlineProgress.getHelpText = function () {
	let text = `<p>While you were out, your Trimps didn't get much done - unless you count destruction of property. Luckily you have a Time Portal! While you can't go forward in time, you can go back to keep the Trimps in line and I'll wait here for you.</p>`;
	text += `<p>While you're in the past, everything will progress like normal, just much faster. The temporal displacement effects give you blurry vision and a headache (making fine control impossible), but you can force your Trimps to stop and run 1 map whenever you want for each 8 hours spent offline! Maps created this way will use your first preset settings at your selected level with Repeat for Items and Exit to World.</p>`;
	text += `<p>If your Trimps look stuck, you can always <b>Stop Here</b> to regain full control of your Trimps, and you'll still receive resources from Trustworthy Trimps for any unused Time Warp time!</p>`;
	text += `<p><b>You can Time Warp for 100% of the time you spent offline, up to a maximum of 24 hours.</b></p>`;
	text += `<div style='text-align: center; border: 1px solid black;'><b>You can change your Offline Progress setting to suit your needs!</b><br/><br/>${getSettingHtml(game.options.menu.offlineProgress, 'offlineProgress', null, 'timewarp')}</div>`;
	return text;
};

offlineProgress.updateBar = function (current) {
	const width = ((current / this.progressMax) * 100).toFixed(1) + '%';
	this.progressElem.style.width = width;
	let newCellHTML = `Cell ${game.global.lastClearedCell + 2}`;
	let newZoneHTML = `Zone ${game.global.world}`;
	let newProgressTextHTML = `${prettify(current)} / ${prettify(this.progressMax)} ticks (${width})`;

	if (this.cellElem.innerHTML !== newCellHTML) {
		this.cellElem.innerHTML = newCellHTML;
	}

	if (this.zoneElem.innerHTML !== newZoneHTML) {
		this.zoneElem.innerHTML = newZoneHTML;
	}

	if (this.progressTextElem.innerHTML !== newProgressTextHTML) {
		this.progressTextElem.innerHTML = newProgressTextHTML;
	}
	this.updateMapBtns();
	let newMapDesc = '';
	if (game.global.mapsActive) {
		const map = getCurrentMapObject();
		newMapDesc = `<span style='font-size: 0.8em'>Mapping in ${map.name} (${map.level})<br/>Cell ${game.global.lastClearedMapCell + 2}<br/>${this.countMapItems(map.level)} items remain</span>`;
		if (this.countThisMap) newMapDesc += "<br/><span style='font-size: 0.6em'>Looks like you still haven't cleared this map. If you want to leave and make an easier one, I won't count it against you!</span>";
	} else if (game.global.preMapsActive) {
		newMapDesc = 'Sitting in the Map Chamber (lame)';
	}

	if (this.inMapDescriptionElem.innerHTML !== newMapDesc) {
		this.inMapDescriptionElem.innerHTML = newMapDesc;
	}

	if (current === 0) {
		this.extraInfoElem.innerHTML = 'Starting Offline Progress... (Updates every 2000 processed loops)';
		return;
	}
	const timeSpent = Math.floor((new Date().getTime() - this.startTime) / 1000);
	if (timeSpent > this.nextFluffIn) {
		this.fluff();
		this.nextFluffIn = timeSpent + 30;
	}
	const speed = current / (timeSpent * 10);
	const remaining = Math.floor((this.progressMax - current) / speed / 10);
	let newExtraText = `${prettify(current / 10)} seconds processed in ${prettify(timeSpent)} seconds (${this.loopTicks}L/F, ${prettify(speed)}x speed)<br>Estimated completion in ${this.formatTimeClock(remaining)}<br>${this.currentFluff}`;

	if (this.extraInfoElem.innerHTML !== newExtraText) {
		this.extraInfoElem.innerHTML = newExtraText;
	}
	let newEffectiveHTML = '';
	if (this.ticksProcessed - this.lastEnemyKilled > 25000) {
		newEffectiveHTML = 'Progress has slowed to a crawl!';
		const cell = game.global.gridArray[game.global.lastClearedCell + 1];
		if (cell && cell.health > cell.maxHealth) cell.health = cell.maxHealth;
	}

	if (this.effectiveElem.innerHTML !== newEffectiveHTML) {
		this.effectiveElem.innerHTML = newEffectiveHTML;
	}
};

function runEverySecond(makeUp) {
	//Change game state
	if (challengeActive('Decay') || challengeActive('Melt')) updateDecayStacks(true);
	if (challengeActive('Daily') && typeof game.global.dailyChallenge.pressure !== 'undefined') dailyModifiers.pressure.addSecond();
	if (challengeActive('Archaeology')) game.challenges.Archaeology.checkAutomator(true);
	if (game.global.autoStorage) autoStorage();
	if (game.global.sugarRush > 0) sugarRush.tick();
	//Achieves
	checkAchieve('totalGems');
	const heHr = game.stats.heliumHour.value();
	if (game.buildings.Trap.owned > 1000000) giveSingleAchieve('Hoarder');
	if (Math.floor(heHr) === 1337) {
		if (game.global.universe === 1) giveSingleAchieve('Elite Feat');
		if (game.global.universe === 2) giveSingleAchieve('Eliter Feat');
	}
	//Display and stats
	if (savedOfflineText && !game.global.lockTooltip) {
		tooltip('Trustworthy Trimps', null, 'update', savedOfflineText);
		savedOfflineText = '';
	}
	if (trimpStatsDisplayed) displayAllStats();
	if (game.resources.helium.owned > 0 || game.resources.radon.owned > 0) {
		game.stats.bestHeliumHourThisRun.evaluate();
		const newHeliumPhHTML = `${prettify(heHr)}/hr`;
		const heliumPhElem = document.getElementById('heliumPh');
		if (heliumPhElem.innerHTML !== newHeliumPhHTML && shouldUpdate(1000)) {
			heliumPhElem.innerHTML = newHeliumPhHTML;
		}
		if (game.global.universe === 1) checkAchieve('heliumHour');
	}
	if (Fluffy.getBestExpStat().value > 0) game.stats.bestFluffyExpHourThisRun.evaluate();
	if (game.global.selectedChallenge === 'Daily') updateDailyClock();
	if (game.global.autoEquipUnlocked) buyAutoEquip();
	Fluffy.handleBox();
	updatePortalTimer();
	if (playerSpire.initialized) playerSpire.moveEnemies(makeUp);
	trackAchievement();
	holidayObj.checkAll();
	if (game.global.tutorialActive) tutorial.check();
}

function checkAchieve(id, evalProperty, doubleChecking, noDisplay) {
	if (id === 'housing' && !game.achievements.oneOffs.finished[game.achievements.oneOffs.names.indexOf('Realtor')] && checkHousing(false, true) >= 100) giveSingleAchieve('Realtor');
	const achievement = game.achievements[id];
	if (typeof achievement.evaluate !== 'undefined') evalProperty = achievement.evaluate();
	if (achievement.timed && evalProperty < 0) return;
	if (typeof achievement.highest !== 'undefined') {
		if (achievement.reverse) {
			if (achievement.highest === 0 || evalProperty < achievement.highest) achievement.highest = evalProperty;
		} else {
			if (evalProperty > achievement.highest) achievement.highest = evalProperty;
		}
	}
	if (achievement.finished === achievement.tiers.length) return;
	if (typeof achievement.breakpoints[achievement.finished] === 'number') {
		if (!achievement.reverse) {
			if (evalProperty < achievement.breakpoints[achievement.finished]) return;
		} else {
			if (evalProperty >= achievement.breakpoints[achievement.finished]) return;
		}
	} else if (evalProperty !== achievement.breakpoints[achievement.finished]) return;
	if (!noDisplay) displayAchievementPopup(id, false, achievement.finished);
	achievement.newStuff.push(achievement.finished);
	achievement.finished++;
	checkAchieve(id, evalProperty, true, noDisplay);
	if (!doubleChecking) calculateAchievementBonus();
	if (trimpAchievementsOpen && !doubleChecking) displayAchievements();
}

function updateTalentNumbers() {
	// Store elements in variables to avoid multiple DOM lookups
	const mainEssenceElem = document.getElementById('essenceOwned');
	const nextCostElem = document.getElementById('talentsNextCost');
	const talentsCostElem = document.getElementById('talentsCost');
	const alertElem = document.getElementById('talentsAlert');
	const countElem = document.getElementById('talentsEssenceTotal');
	const affordableElem = document.getElementById('talentsAffordable');

	// Check primary elements, update
	if (!mainEssenceElem || !nextCostElem) return;

	const nextCost = getNextTalentCost();
	const affordable = checkAffordableTalents() - countPurchasedTalents();

	// Update elements only if their new value is different from the current one
	if (mainEssenceElem.innerHTML != prettify(game.global.essence)) {
		mainEssenceElem.innerHTML = prettify(game.global.essence);
	}

	if (affordable > 0 && affordableElem.innerHTML !== affordable + ' Affordable') {
		affordableElem.innerHTML = affordable + ' Affordable';
	} else if (affordable <= 0 && affordableElem.innerHTML !== '') {
		affordableElem.innerHTML = '';
	}

	if (nextCost === -1) {
		if (talentsCostElem.style.display !== 'none') {
			talentsCostElem.style.display = 'none';
		}
		if (alertElem.innerHTML !== '') {
			alertElem.innerHTML = '';
		}
		if (countElem.innerHTML !== '') {
			countElem.innerHTML = '';
		}
		return;
	}

	if (talentsCostElem.style.display !== 'block') {
		talentsCostElem.style.display = 'block';
	}
	if (nextCostElem.innerHTML !== prettify(nextCost)) {
		nextCostElem.innerHTML = prettify(nextCost);
	}

	// Check setting elements, update
	if (!alertElem || !countElem) return;

	const essence = game.options.menu.masteryTab.enabled >= 2 ? ' (' + (game.global.tabForMastery ? prettify(game.global.essence) : prettify(game.global.mutatedSeeds)) + ')' : '';
	if ((game.options.menu.masteryTab.enabled === 1 || game.options.menu.masteryTab.enabled === 3) && nextCost <= game.global.essence) {
		if (alertElem.innerHTML !== '!') {
			alertElem.innerHTML = '!';
		}
		if (countElem.innerHTML !== '') {
			countElem.innerHTML = '';
		}
		return;
	}

	if (alertElem.innerHTML !== '') {
		alertElem.innerHTML = '';
	}
	if (countElem.innerHTML !== essence) {
		countElem.innerHTML = essence;
	}
}

function manageEqualityStacks() {
	if (game.global.universe !== 2 || game.portal.Equality.radLocked) return;
	const equality = getPerkLevel('Equality');

	if (game.portal.Equality.scalingCount < 0) game.portal.Equality.scalingCount = 0;
	if (game.portal.Equality.scalingCount > equality) game.portal.Equality.scalingCount = equality;
	const tabElem = document.getElementById('equalityTab');
	const tabTextElem = document.getElementById('equalityA');
	const activeStacks = game.portal.Equality.getActiveLevels();
	let text = activeStacks + ' stack' + needAnS(activeStacks) + ' of Equality are active, multiplying the Attack of Trimps ';
	let elemText = 'Equality (Scaling ';
	const enemyMult = game.portal.Equality.getMult(false);
	if (game.heirlooms.Shield.inequality.currentBonus > 0) {
		const trimpMult = game.portal.Equality.getMult(true);
		text += ' by ' + prettifyTiny(trimpMult) + ' and Enemies by ' + prettifyTiny(enemyMult);
	} else {
		text += ' and Enemies by ' + prettifyTiny(enemyMult);
	}

	if (game.portal.Equality.getSetting('scalingActive')) {
		swapClass('equalityTabScaling', 'equalityTabScalingOn', tabElem);
		elemText += 'On)';
		text += '. Scaling is on.';
		manageStacks('Equality Scaling', activeStacks, true, 'equalityStacks', 'icomoon icon-arrow-bold-down', text, false);
	} else {
		swapClass('equalityTabScaling', 'equalityTabScalingOff', tabElem);
		elemText += 'Off)';
		text += '. Scaling is off.';
		manageStacks('Equality Scaling', activeStacks, true, 'equalityStacks', 'icomoon icon-arrow-bold-down', text, false);
	}

	if (tabTextElem.innerHTML !== elemText) {
		tabTextElem.innerHTML = elemText;
	}
}

function displayGoldenUpgrades(redraw) {
	if (usingRealTimeOffline && goldenUpgradesShown) return false;
	if (goldenUpgradesShown && !redraw) return false;
	if (getAvailableGoldenUpgrades() <= 0) return false;
	if (!goldenUpgradesShown) game.global.lastUnlock = new Date().getTime();

	const elem = document.getElementById('upgradesHere');
	if (elem && elem.children[0] && elem.children[0].id.includes('Golden')) return false;

	let html = '';
	for (let item in game.goldenUpgrades) {
		const upgrade = game.goldenUpgrades[item];
		if (item === 'Void' && getTotalPortals() < 1) continue;
		let color = 'thingColorGoldenUpgrade';
		if ((item === 'Void' && parseFloat((game.goldenUpgrades.Void.currentBonus + game.goldenUpgrades.Void.nextAmt()).toFixed(2)) > 0.72) || (item === 'Helium' && game.global.runningChallengeSquared)) {
			color = 'thingColorCanNotAfford';
		}
		let displayName = item;
		if (displayName === 'Helium' && game.global.universe === 2) displayName = 'Radon';
		if (usingScreenReader) {
			html += `<button id="srTooltip${item}" class="thing goldenUpgradeThing noSelect pointer upgradeThing" onclick="tooltip('${item}','goldenUpgrades','screenRead')">Golden ${item} Info</button><button onmouseover="tooltip('${item}','goldenUpgrades',event)" onmouseout="tooltip('hide')" class="${color} thing goldenUpgradeThing noselect pointer upgradeThing" id="${item}Golden" onclick="buyGoldenUpgrade('${item}')"><span class="thingName">Golden ${displayName} ${prettify(
				game.global.goldenUpgrades + 1
			)}</span>, <span class="thingOwned" id="golden${item}Owned">${upgrade.purchasedAt.length}</span></button>`;
		} else {
			html += `<div onmouseover="tooltip('${item}', 'goldenUpgrades', event)" onmouseout="tooltip('hide')" class="${color} thing goldenUpgradeThing noselect pointer upgradeThing" id="${item}Golden" onclick="buyGoldenUpgrade('${item}'); tooltip('hide')"><span class="thingName">Golden ${displayName} ${romanNumeral(game.global.goldenUpgrades + 1)}</span><br/><span class="thingOwned" id="golden${item}Owned">${upgrade.purchasedAt.length}</span></div>`;
		}
	}

	elem.innerHTML = html + elem.innerHTML;
	goldenUpgradesShown = true;
	return true;
}

function runMap(resetCounter = true) {
	if (game.options.menu.pauseGame.enabled || game.global.lookingAtMap === '') return;
	if (challengeActive('Watch')) game.challenges.Watch.enteredMap = true;
	if (challengeActive('Mapology') && !game.global.currentMapId) {
		if (game.challenges.Mapology.credits < 1) {
			message('You are all out of Map Credits! Clear some more Zones to earn some more.', 'Notices');
			return;
		}
		game.challenges.Mapology.credits--;
		if (game.challenges.Mapology.credits <= 0) game.challenges.Mapology.credits = 0;
		updateMapCredits();
		messageMapCredits();
	}
	if (game.achievements.mapless.earnable) {
		game.achievements.mapless.earnable = false;
		game.achievements.mapless.lastZone = game.global.world;
	}
	if (challengeActive('Quest') && game.challenges.Quest.questId === 5 && !game.challenges.Quest.questComplete) {
		game.challenges.Quest.questProgress++;
		if (game.challenges.Quest.questProgress === 1) game.challenges.Quest.failQuest();
	}
	if (game.global.formation !== 4 && game.global.formation !== 5) game.global.canScryCache = false;

	const mapId = game.global.lookingAtMap;
	game.global.preMapsActive = false;
	game.global.mapsActive = true;
	game.global.currentMapId = mapId;
	if (resetCounter) game.global.mapRunCounter = 0;

	mapsSwitch(true);

	const mapObj = getCurrentMapObject();
	if (mapObj.bonus) {
		game.global.mapExtraBonus = mapObj.bonus;
	}

	if (game.global.lastClearedMapCell === -1) {
		buildMapGrid(mapId);
		drawGrid(true);

		if (mapObj.location === 'Void') {
			game.global.voidDeaths = 0;
			game.global.voidBuff = mapObj.voidBuff;
			setVoidBuffTooltip();
		}
	}

	if (challengeActive('Insanity')) game.challenges.Insanity.drawStacks();
	if (challengeActive('Pandemonium')) game.challenges.Pandemonium.drawStacks();
}

function autoTrap() {
	if (game.resources.food.owned >= 10 && game.resources.wood.owned >= 10) {
		game.resources.food.owned -= 10;
		game.resources.wood.owned -= 10;
		game.buildings.Trap.purchased++;
		if (game.global.buildingsQueue[0] === 'Trap.1') {
			setNewCraftItem();
		} else {
			startQueue('Trap', 1);
		}
	}
}

function giveSingleAchieve(name) {
	const u1Achievements = ['Power Tower'];
	const u2Achievements = ['Huffstle', 'Just Smack It', 'Heavy Trinker', 'Peace'];

	let area = game.global.universe === 2 ? 'oneOffs2' : 'oneOffs';
	if (u1Achievements.includes(name)) area = 'oneOffs';
	if (u2Achievements.includes(name)) area = 'oneOffs2';

	const achievement = game.achievements[area];
	const index = achievement.names.indexOf(name);

	if (index === -1 || achievement.finished[index]) return;

	if (typeof greenworks !== 'undefined') {
		activateSteamAchieve(area, name);
	}

	displayAchievementPopup(area, false, index);
	achievement.newStuff.push(index);
	achievement.finished[index] = true;
	calculateAchievementBonus();

	if (trimpAchievementsOpen) displayAchievements();
}

function mapsSwitch(updateOnly, fromRecycle) {
	game.global.titimpLeft = 0;
	updateGammaStacks(true);
	updateTitimp();
	if (challengeActive('Quagmire')) game.challenges.Quagmire.drawStacks();
	if (!updateOnly) {
		//Coming out of maps or world (not necessarily to map chamber)
		game.global.fighting = false;
		game.global.switchToMaps = false;
		game.global.switchToWorld = false;
		game.global.voidBuff = '';
		if (game.global.preMapsActive) {
			game.global.mapsActive = false;
			game.global.preMapsActive = false;
		} else game.global.preMapsActive = true;
	}
	if (!updateOnly) game.global.mapExtraBonus = '';

	let currentMapObj;
	if (game.global.spireActive) handleExitSpireBtn();
	handleFinishDailyBtn();
	if (game.global.currentMapId !== '') currentMapObj = getCurrentMapObject();
	var mapsBtnText = document.getElementById('mapsBtnText');
	var recycleBtn = document.getElementById('recycleMapBtn');
	recycleBtn.innerHTML = 'Recycle Map';
	document.getElementById('mapsBtn').className = 'btn btn-warning fightBtn';
	document.getElementById('togglemapAtZone2').style.display = game.global.canMapAtZone ? 'block' : 'none';
	if (game.global.preMapsActive) {
		//Switching to Map Chamber
		refreshMaps();
		game.global.mazBw = -1;
		if (currentMapObj && (currentMapObj.location === 'Void' || currentMapObj.location === 'Darkness')) {
			recycleMap(-1, true, true);
			currentMapObj = false;
		}
		if (game.global.mapCounterGoal > 0) {
			game.global.mapCounterGoal = 0;
			toggleSetting('repeatUntil', null, false, true);
		}
		game.global.mapsActive = false;
		setNonMapBox();
		document.getElementById('battleHeadContainer').style.display = 'none';
		document.getElementById('mapsCreateRow').style.display = 'block';
		if (!fromRecycle) resetAdvMaps();
		document.getElementById('grid').style.display = 'none';
		document.getElementById('preMaps').style.display = 'block';
		toggleMapGridHtml();
		mapsBtnText.innerHTML = 'World';
		if (game.global.lookingAtMap && !game.global.currentMapId) selectMap(game.global.lookingAtMap, true);
		else if (game.global.currentMapId === '') {
			clearMapDescription();
		} else {
			selectMap(game.global.currentMapId, true);
			document.getElementById('selectMapBtn').innerHTML = 'Continue';
			document.getElementById('selectMapBtn').style.visibility = 'visible';
			recycleBtn.style.visibility = 'visible';
			if (currentMapObj.noRecycle) recycleBtn.innerHTML = 'Abandon Map';
		}
	} else if (game.global.mapsActive) {
		//Switching to maps
		if (!updateOnly) resetEmpowerStacks();
		if (game.global.formation != 4 && game.global.formation != 5) game.global.waitToScryMaps = true;
		if (game.global.usingShriek) {
			disableShriek();
			game.global.useShriek = true;
		}
		if (currentMapObj.location === 'Void') {
			currentMapObj.level = game.global.world;
			document.getElementById('repeatVoidsContainer').style.display = 'block';
		} else document.getElementById('repeatVoidsContainer').style.display = 'none';
		if (currentMapObj.location === 'Darkness') {
			currentMapObj.level = game.global.world;
		}
		if (currentMapObj.location === 'Bionic') {
			document.getElementById('climbBwContainer').style.display = 'block';
			toggleSetting('climbBw', null, false, true);
		} else document.getElementById('climbBwContainer').style.display = 'none';
		document.getElementById('mapsCreateRow').style.display = 'none';
		document.getElementById('grid').style.display = 'none';
		document.getElementById('preMaps').style.display = 'none';
		u2Mutations.clearStacks();
		toggleMapGridHtml(true, currentMapObj);
	} else {
		//Switching to world
		if (!updateOnly) resetEmpowerStacks();
		game.global.mazBw = -1;
		if (game.global.mapCounterGoal > 0) {
			game.global.mapCounterGoal = 0;
			toggleSetting('repeatUntil', null, false, true);
		}
		if (game.global.formation != 4 && game.global.formation != 5) game.global.waitToScry = true;
		if (game.global.lastClearedCell === 98 && game.global.useShriek && !game.global.usingShriek) activateShriek();
		document.getElementById('battleHeadContainer').style.display = 'block';
		document.getElementById('mapsCreateRow').style.display = 'none';
		document.getElementById('grid').style.display = 'block';
		document.getElementById('preMaps').style.display = 'none';
		toggleMapGridHtml();
		setNonMapBox();
		u2Mutations.checkStacks();
	}

	if (game.global.tutorialActive) tutorial.setWinSize();
	if (challengeActive('Smithless')) game.challenges.Smithless.drawStacks();
	toggleVoidMaps(true);
}

function buildMapGrid(mapId) {
	if (game.global.formation === 4 || game.global.formation === 5) game.global.canScryCache = true;
	game.global.mapStarted = getGameTime();

	const map = game.global.mapsOwnedArray[getMapIndex(mapId)];
	const array = new Array(map.size);
	const imports = Object.keys(game.unlocks.imps).filter((item) => game.unlocks.imps[item] && game.badGuys[item].location === 'Maps' && game.badGuys[item].world <= map.level);
	const showSnow = map.location === 'Frozen' || (game.badGuys.Presimpt.locked === 0 && game.options.menu.showSnow && game.options.menu.showSnow.enabled);
	const isVoid = map.location === 'Void';

	let fastTarget = 0;
	let forceNextFast = false;
	let fastEvery = -1;
	let forced = 0;

	if (game.global.universe === 2) {
		fastTarget = map.size / 6;
		const roll = Math.floor(Math.random() * 3);
		if (roll === 0) fastTarget--;
		else if (roll === 2) fastTarget++;

		const highAdd = map.level - game.global.world;
		if (highAdd > 0) fastTarget += highAdd * 0.5;
		if (fastTarget < 1) fastTarget = 1;
		fastEvery = Math.floor(map.size / fastTarget);
	}

	for (let i = 0; i < map.size; i++) {
		const thisFast = fastTarget && (forceNextFast || i % fastEvery === 0);
		const name = getRandomBadGuy(map.location, i + 1, map.size, map.level, imports, false, false, thisFast);
		const enemy = game.badGuys[name];
		const isEnemyFast = enemy.fast;

		const cell = {
			level: i + 1,
			maxHealth: -1,
			health: -1,
			attack: -1,
			special: '',
			text: '',
			name
		};

		forceNextFast = thisFast && !isEnemyFast;
		if (thisFast && isEnemyFast) forced++;

		if (showSnow) {
			if (isVoid) cell.vm = 'CorruptSnow';
			else cell.vm = 'TrimpmasSnow';
		}
		array[i] = cell;
	}

	game.global.mapGridArray = array;
	addSpecials(true);
	if (challengeActive('Exterminate')) game.challenges.Exterminate.startedMap();
}

function getRandomBadGuy(mapSuffix, level, totalCells, world, imports, mutation, visualMutation, fastOnly) {
	let selected;
	let force = false;
	let enemySeed = mapSuffix ? Math.floor(Math.random() * 10000000) : game.global.enemySeed;
	let badGuysArray = [];
	if (mapSuffix === 'Darkness') imports = [];

	const improbCheck = game.global.brokenPlanet || (game.global.universe === 2 && game.global.world >= 20) || game.global.world === 59;
	const magmaActive = mutations.Magma.active();

	for (let item in game.badGuys) {
		let badGuy = game.badGuys[item];
		if (badGuy.locked) continue;
		if (badGuy.location === 'Maps' && !mapSuffix) continue;
		let locationMatch = false;
		if (mapSuffix && badGuy.location2 && badGuy.location2 === mapSuffix) locationMatch = true;
		if (mapSuffix && badGuy.location === mapSuffix) locationMatch = true;
		if (level === totalCells && badGuy.last && (locationMatch || (!mapSuffix && badGuy.location === 'World')) && world >= badGuy.world) {
			if (item === 'Blimp' && world != 5 && world !== 10 && world < 15) continue;
			if (!mapSuffix && improbCheck && item === 'Blimp') {
				if (magmaActive) item = 'Omnipotrimp';
				else item = 'Improbability';
			}
			selected = item;
			force = true;
			break;
		}
		if (!mapSuffix && challengeActive('Exterminate') && game.global.world <= game.challenges.Exterminate.completeAfterZone) {
			if (badGuy.location === 'Exterminate') badGuysArray.push(item);
			continue;
		}
		if (!badGuy.last && (!fastOnly || badGuy.fast) && (typeof badGuy.world === 'undefined' || game.global.world >= game.badGuys[item].world) && (badGuy.location === 'All' || (mapSuffix && (badGuy.location === 'Maps' || locationMatch)) || (!mapSuffix && badGuy.location === 'World'))) {
			badGuysArray.push(item);
		}
	}

	if (!mapSuffix && canSkeletimp && !force && getRandomIntSeeded(enemySeed++, 0, 100) < 5) {
		canSkeletimp = false;
		game.global.enemySeed = enemySeed;
		return getRandomIntSeeded(game.global.skeleSeed++, 0, 100) < (game.talents.skeletimp.purchased ? 20 : 10) ? 'Megaskeletimp' : 'Skeletimp';
	}

	let exoticChance = getExoticChance();
	if (game.global.universe === 2 && game.global.spireActive && !mapSuffix) exoticChance = 0;

	if (imports.length && !force && getRandomIntSeeded(enemySeed++, 0, 1000) / 10 < imports.length * exoticChance) {
		if (!mapSuffix) game.global.enemySeed = enemySeed;
		return imports[getRandomIntSeeded(enemySeed++, 0, imports.length)];
	}

	if (!mapSuffix && !force) {
		let chance = 0.35 * (1 / (100 - 1 - exoticChance * imports.length));
		chance = Math.round(chance * 100000);
		if (game.talents.turkimp.purchased) chance *= 1.33;
		let roll = getRandomIntSeeded(enemySeed++, 0, 100000);
		if (roll < chance) {
			if (!mapSuffix) game.global.enemySeed = enemySeed;
			return 'Turkimp';
		}
	}

	const u2Spire = game.global.universe === 2 && game.global.spireActive && !game.global.mapsActive;
	if (!u2Spire && game.talents.magimp.purchased && mapSuffix !== 'Darkness' && !force) {
		let chance = 2 * (1 / (100 - 1 - exoticChance * imports.length));
		chance = Math.round(chance * 100000);
		let roll = getRandomIntSeeded(enemySeed++, 0, 100000);
		if (roll < chance) {
			if (!mapSuffix) game.global.enemySeed = enemySeed;
			return 'Magimp';
		}
	}

	if (!mapSuffix && !force && visualMutation === 'Pumpkimp') {
		if (getRandomIntSeeded(enemySeed++, 0, 10) < 5) {
			game.global.enemySeed = enemySeed;
			return 'Pumpkimp';
		}
	}

	if (challengeActive('Insanity') && mapSuffix && !force) {
		if (getRandomIntSeeded(enemySeed++, 0, 10000) < game.challenges.Insanity.getHorrimpChance(world) * 100) return 'Horrimp';
	}

	if (challengeActive('Daily') && typeof game.global.dailyChallenge.mutimps !== 'undefined' && !mapSuffix && !force) {
		let mutStr = game.global.dailyChallenge.mutimps.strength;
		if (level <= dailyModifiers.mutimps.getMaxCellNum(mutStr)) {
			let mobName = mutStr < 6 ? 'Mutimp' : 'Hulking_Mutimp';
			if (getRandomIntSeeded(enemySeed++, 0, 10) < 4) {
				game.global.enemySeed = enemySeed;
				return mobName;
			}
		}
	}

	if (!force) selected = badGuysArray[getRandomIntSeeded(enemySeed++, 0, badGuysArray.length)];
	if (!mapSuffix) game.global.enemySeed = enemySeed;
	return selected;
}

// fixes attack breakdown going infinite
// only modification is moving where Magma is calculated
function getBattleStatBd(what) {
	var name = what.charAt(0).toUpperCase() + what.substr(1, what.length);
	if ((what === 'block' || what === 'shield') && game.global.universe === 2) {
		what = 'shield';
		name = 'Prismatic Shield';
	}
	var textString = "<div id='breakdownScrollWrapper' class='niceScroll'><table class='bdTableSm table table-striped'><tbody><tr><td></td><td>Base</td><td>Level</td><td>Item " + name + '</td><td>Total</td>' + (what === 'attack' ? '<td>Min</td><td>Max</td>' : '') + '</tr>';
	var currentCalc = 0;
	var maxFluct = 0.2;
	var minFluct = 0.2;
	var percent = 0;
	if (what === 'health' || what === 'attack') {
		currentCalc += what === 'health' ? 50 : 6;
		textString += "<tr><td class='bdTitle'>Base</td><td class='bdPercentSm'>" + prettify(currentCalc) + "</td><td></td><td></td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? '<td>-20%</td><td>+20%</td>' : '') + '</tr>';
		if (what === 'attack') {
			//Discipline
			if (challengeActive('Discipline') || challengeActive('Unlucky')) {
				minFluct = 0.995;
				maxFluct = 0.995;
				var title = challengeActive('Discipline') ? 'Lack Discipline' : 'Unharnessed Luck';
				textString += "<tr><td class='bdTitle'>" + title + "</td><td class='bdPercentSm'></td><td></td><td></td><td class='bdNumberSm'></td><td>-99.5%</td><td>+99.5%</td></tr>";
			} else {
				//Range
				if (getPerkLevel('Range') > 0) {
					minFluct -= 0.02 * getPerkLevel('Range');
					textString += "<tr><td class='bdTitle'>Range</td><td class='bdPercentSm'>+2% Min</td><td>" + getPerkLevel('Range') + '</td><td>+' + prettify(2 * getPerkLevel('Range')) + "% Min</td><td class='bdNumberSm'></td><td>-" + prettify(minFluct * 100) + '%</td><td>+' + prettify(maxFluct * 100) + '%</td></tr>';
				}
				//MinDamageDaily
				if (typeof game.global.dailyChallenge.minDamage !== 'undefined') {
					var addMin = dailyModifiers.minDamage.getMult(game.global.dailyChallenge.minDamage.strength);
					minFluct += addMin;
					if (minFluct > 1) minFluct = 1;
					textString += "<tr style='color: red'><td class='bdTitle'>Minimalist (Daily)</td><td class='bdPercentSm'>-" + prettify(addMin * 100) + "% Min</td><td></td><td></td><td class='bdNumberSm'></td><td>-" + prettify(minFluct * 100) + '%</td><td>+' + prettify(maxFluct * 100) + '%</td></tr>';
				}
				//MaxDamageDaily
				if (typeof game.global.dailyChallenge.maxDamage !== 'undefined') {
					var addMax = dailyModifiers.maxDamage.getMult(game.global.dailyChallenge.maxDamage.strength);
					maxFluct += addMax;
					textString += "<tr><td class='bdTitle'>Prodigal (Daily)</td><td class='bdPercentSm'>+" + prettify(addMax * 100) + "% Max</td><td></td><td></td><td class='bdNumberSm'></td><td>-" + prettify(minFluct * 100) + '%</td><td>+' + prettify(maxFluct * 100) + '%</td></tr>';
				}
			}
		}
		for (var equip in game.equipment) {
			var temp = game.equipment[equip];
			if (typeof temp[what] === 'undefined' || temp.level <= 0 || temp.blockNow) continue;
			var equipStrength = temp[what + 'Calculated'] * temp.level;
			currentCalc += equipStrength;
			percent = ((equipStrength / game.global[what]) * 100).toFixed(1) + '%';
			textString += "<tr><td class='bdTitle'>" + equip + '</td><td>' + prettify(temp[what + 'Calculated']) + '</td><td>' + temp.level + '</td><td>' + prettify(equipStrength) + ' (' + percent + ')</td><td>' + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
		}
	} else if (what === 'block') {
		//Add Gym
		var gym = game.buildings.Gym;
		if (gym.owned > 0) {
			var gymStrength = gym.owned * gym.increase.by;
			percent = ((gymStrength / game.global.block) * 100).toFixed(1) + '%';
			currentCalc += gymStrength;
			textString += "<tr><td class='bdTitle'>Gym</td><td>" + prettify(gym.increase.by) + '</td><td>' + prettify(gym.owned) + '</td><td>' + prettify(gymStrength) + ' (' + percent + ')</td><td>' + prettify(currentCalc) + '</td></tr>';
		}
		var shield = game.equipment.Shield;
		if (shield.blockNow && shield.level > 0) {
			var shieldStrength = shield.level * shield.blockCalculated;
			percent = ((shieldStrength / game.global.block) * 100).toFixed(1) + '%';
			currentCalc += shieldStrength;
			textString += "<tr><td class='bdTitle'>Shield</td><td>" + prettify(shield.blockCalculated) + '</td><td>' + prettify(shield.level) + '</td><td>' + prettify(shieldStrength) + ' (' + percent + ')</td><td>' + prettify(currentCalc) + '</td></tr>';
		}
		var trainer = game.jobs.Trainer;
		if (trainer.owned > 0) {
			var trainerStrength = trainer.owned * (trainer.modifier / 100);
			trainerStrength = calcHeirloomBonus('Shield', 'trainerEfficiency', trainerStrength);
			currentCalc = Math.floor(currentCalc * (trainerStrength + 1));
			trainerStrength = prettify(trainerStrength * 100) + '%';
			textString += "<tr><td class='bdTitle'>Trainers</td><td>" + prettify(calcHeirloomBonus('Shield', 'trainerEfficiency', trainer.modifier)) + '%</td><td>' + prettify(trainer.owned) + '</td><td>+ ' + trainerStrength + '</td><td>' + prettify(currentCalc) + '</td></tr>';
		}
	} else if (what === 'shield') {
		if (game.upgrades.Prismatic.done) {
			currentCalc += 0.5;
			textString += "<tr><td class='bdTitle'>Prismatic (Z2)</td><td>50%</td><td>1</td><td>50%</td><td>" + Math.round(currentCalc * 100) + '%</td></tr>';
		}
		if (game.upgrades.Prismalicious.done) {
			currentCalc += 0.5;
			textString += "<tr><td class='bdTitle'>Prismalicious (Z20)</td><td>50%</td><td>1</td><td>50%</td><td>" + Math.round(currentCalc * 100) + '%</td></tr>';
		}
		if (Fluffy.isRewardActive('prism')) {
			let thisAmt = Fluffy.isRewardActive('prism') * 0.25;
			currentCalc += thisAmt;
			textString += "<tr><td class='bdTitle'>Prisms (Scruffy)</td><td>25%</td><td>" + Fluffy.isRewardActive('prism') + '</td><td>' + prettify(thisAmt * 100) + '%</td><td>' + Math.round(currentCalc * 100) + '%</td></tr>';
		}
		if (getPerkLevel('Prismal') > 0) {
			let thisAmt = getPerkLevel('Prismal') * game.portal.Prismal.modifier;
			currentCalc += thisAmt;
			textString += "<tr><td class='bdTitle'>Prismal (Perk)</td><td>" + prettify(game.portal.Prismal.modifier * 100) + '%</td><td>' + getPerkLevel('Prismal') + '</td><td>' + prettify(thisAmt * 100) + '%</td><td>' + Math.round(currentCalc * 100) + '%</td></tr>';
		}
		if (challengeActive('Bublé')) {
			currentCalc += 2.5;
			textString += "<tr><td class='bdTitle'>Bublé (Challenge)</td><td>100%</td><td>&nbsp;</td><td>250%</td><td>" + Math.round(currentCalc * 100) + '%</td></tr>';
		}
		if (getHeirloomBonus('Shield', 'prismatic') > 0) {
			var bonus = getHeirloomBonus('Shield', 'prismatic');
			currentCalc += bonus / 100;
			textString += "<tr><td class='bdTitle'>Heirloom</td><td>&nbsp;</td><td>&nbsp;</td><td>" + prettify(bonus) + '%</td><td>' + Math.round(currentCalc * 100) + '%</td></tr>';
		}
		if (autoBattle.oneTimers.Suprism.owned) {
			var bonus = autoBattle.oneTimers.Suprism.getMult();
			currentCalc += bonus;
			textString += "<tr><td class='bdTitle'>Suprism</td><td>3%</td><td>" + (autoBattle.maxEnemyLevel - 1) + '</td><td>' + prettify(bonus * 100) + '%</td><td>' + Math.round(currentCalc * 100) + '%</td></tr>';
		}
		if (Fluffy.isRewardActive('shieldlayer')) {
			var layers = Fluffy.isRewardActive('shieldlayer') + 1;
			currentCalc *= layers;
			textString += "<tr class='shieldLayerCalcRow'><td class='bdTitle'>Shield Layer</td><td>&nbsp;</td><td>&nbsp;</td><td>x " + layers + '</td><td>' + Math.round(currentCalc * 100) + '%</td></tr>';
		}
		textString += "<tr><td colspan='5' style='font-weight: bold'>Your Prismatic Shield is equal to " + Math.round(currentCalc * 100) + "% of your Trimps' maximum Health. All enemy damage hits your Prismatic Shield before Health, and Prismatic Shield always regenerates to full after an enemy is killed.</td></tr>";
	}
	//Add coordination
	if (what !== 'shield') {
		currentCalc *= game.resources.trimps.maxSoldiers;
		textString += "<tr><td class='bdTitle'>Soldiers</td><td class='bdPercentSm'></td><td></td><td>x " + prettify(game.resources.trimps.maxSoldiers) + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	//Add smithy
	if ((what === 'attack' || what === 'health') && game.global.universe === 2 && game.buildings.Smithy.owned > 0) {
		currentCalc *= game.buildings.Smithy.getMult();
		textString += "<tr><td class='bdTitle'>Smithy</td><td>x " + prettify(game.buildings.Smithy.getBaseMult()) + '</td><td>' + game.buildings.Smithy.owned + '</td><td>+ ' + prettify((game.buildings.Smithy.getMult() - 1) * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	if ((what === 'attack' || what === 'health') && challengeActive('Smithless')) {
		currentCalc *= game.challenges.Smithless.getTrimpMult();
		textString += "<tr><td class='bdTitle'>Enhanced Armor (Smithless)</td><td>x 1.25</td><td>" + game.challenges.Smithless.fakeSmithies + '</td><td>+ ' + prettify((game.challenges.Smithless.getTrimpMult() - 1) * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	//Add antenna
	if (what === 'health' && game.buildings.Antenna.owned >= 10 && game.global.universe === 2) {
		amt = game.jobs.Meteorologist.getExtraMult();
		var pct = (amt - 1) * 100;
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Antenna Array</td><td>" + prettify(pct) + '%</td><td></td><td>+ ' + prettify(pct) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td></tr>';
	}
	//Add achievements
	if (what === 'attack' && game.global.achievementBonus > 0) {
		currentCalc *= 1 + game.global.achievementBonus / 100;
		textString += "<tr><td class='bdTitle'>Achievements</td><td class='bdPercentSm'></td><td></td><td>+ " + game.global.achievementBonus + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	//Magma
	if (mutations.Magma.active() && (what === 'attack' || what === 'health')) {
		var mult = mutations.Magma.getTrimpDecay();
		var lvls = game.global.world - mutations.Magma.start() + 1;
		currentCalc *= mult;
		var display = mult > 0.0001 ? mult.toFixed(4) : mult.toExponential(3);
		textString += "<tr style='color: red'><td class='bdTitle'>Overheating (Magma)</td><td>x 0.8</td><td>" + lvls + "</td><td class='bdPercent'>x " + display + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	//Add perk
	var perk = '';
	if (what === 'health') perk = 'Toughness';
	if (what === 'attack') perk = 'Power';
	if (perk && getPerkLevel(perk) > 0) {
		var PerkStrength = getPerkLevel(perk) * game.portal[perk].modifier;
		currentCalc *= PerkStrength + 1;
		PerkStrength = prettify(PerkStrength * 100) + '%';
		textString += "<tr><td class='bdTitle'>" + perk + '</td><td>' + game.portal[perk].modifier * 100 + '%</td><td>' + getPerkLevel(perk) + '</td><td>+ ' + PerkStrength + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	perk = perk + '_II';
	if (game.portal[perk] && getPerkLevel(perk) > 0) {
		var PerkStrength = getPerkLevel(perk) * game.portal[perk].modifier;
		currentCalc *= PerkStrength + 1;
		PerkStrength = prettify(PerkStrength * 100) + '%';
		textString += "<tr><td class='bdTitle'>" + perk.replace('_', ' ') + '</td><td>' + game.portal[perk].modifier * 100 + '%</td><td>' + prettify(getPerkLevel(perk)) + '</td><td>+ ' + PerkStrength + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	if (what === 'attack' && getPerkLevel('Tenacity')) {
		amt = game.portal.Tenacity.getMult();
		currentCalc *= amt;
		var mins = Math.floor(game.portal.Tenacity.getTime());
		textString += "<tr><td class='bdTitle'>Tenacity</td><td>x " + prettify(game.portal.Tenacity.getBonusAmt()) + '</td><td>' + (getPerkLevel('Tenacity') + getPerkLevel('Masterfulness')) + ' (' + mins + ' min' + needAnS(mins) + ')</td><td>+ ' + prettify((amt - 1) * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what === 'attack' && getPerkLevel('Hunger')) {
		amt = game.portal.Hunger.getMult();
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Hunger</td><td></td><td>" + getPerkLevel('Hunger') + '</td><td>+ ' + prettify((amt - 1) * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	//Add resilience
	if (what === 'health' && getPerkLevel('Resilience') > 0) {
		var resStrength = Math.pow(game.portal.Resilience.modifier + 1, getPerkLevel('Resilience'));
		currentCalc *= resStrength;
		resStrength = prettify((resStrength - 1) * 100) + '%';
		textString += "<tr><td class='bdTitle'>Resilience</td><td>" + game.portal.Resilience.modifier * 100 + '%</td><td>' + getPerkLevel('Resilience') + '</td><td>+ ' + resStrength + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td></tr>';
	}
	//Add fluffy u2 healthy
	if (what === 'health' && Fluffy.isRewardActive('healthy')) {
		currentCalc *= 1.5;
		textString += "<tr><td class='bdTitle'>" + Fluffy.getName() + " is Life</td><td>+ 50%</td><td>&nbsp;</td><td>+ 50%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (what == 'health' && Fluffy.isRewardActive('scaledHealth')) {
		var amt = Fluffy.rewardConfig.scaledHealth.mult();
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Scruffy Scaling Health</td><td>+ 50%</td><td>" + Fluffy.getLevel() + '</td><td>+ ' + prettify((amt - 1) * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td></tr>';
	}

	//Add Geneticist
	var geneticist = game.jobs.Geneticist;
	if (game.global.lastLowGen > 0 && what === 'health') {
		var calcedGenes = game.global.lastLowGen;
		var geneticistStrength = Math.pow(1.01, calcedGenes);
		currentCalc *= geneticistStrength;
		geneticistStrength = prettify(geneticistStrength * 100 - 100) + '%';
		textString += "<tr><td class='bdTitle'>Geneticists</td><td>1%</td><td>" + prettify(calcedGenes) + '</td><td>+ ' + geneticistStrength + '</td><td>' + prettify(currentCalc) + '</td></tr>';
	}
	//Add Anticipation
	var anticipation = game.portal.Anticipation;
	if (getPerkLevel('Anticipation') > 0 && what === 'attack') {
		var antiStrength = getPerkLevel('Anticipation') * anticipation.modifier * game.global.antiStacks + 1;
		currentCalc *= antiStrength;
		antiStrength = prettify((antiStrength - 1) * 100) + '%';
		textString += "<tr><td class='bdTitle'>Anticipation</td><td>2% (x" + game.global.antiStacks + ')</td><td>' + prettify(getPerkLevel('Anticipation')) + '</td><td>+ ' + antiStrength + '</td><td>' + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (!game.portal.Observation.radLocked && game.global.universe === 2 && game.portal.Observation.trinkets > 0 && (what === 'attack' || what === 'health')) {
		var obsMult = game.portal.Observation.getMult();
		currentCalc *= obsMult;
		textString += "<tr><td class='bdTitle'>Observation</td><td>" + (game.portal.Observation.radLevel + 1) + '%</td><td>' + prettify(game.portal.Observation.trinkets) + '</td><td>' + formatMultAsPercent(obsMult) + '</td><td>' + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	//Add formations
	if (game.global.formation > 0 && game.global.formation != 5) {
		var formStrength = 0.5;
		if ((game.global.formation === 1 && what === 'health') || (game.global.formation === 2 && what === 'attack') || (game.global.formation === 3 && what === 'block')) formStrength = 4;
		currentCalc *= formStrength;
		textString += "<tr><td class='bdTitle'>Formation</td><td></td><td></td><td>x " + formStrength + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	//Add Titimp
	if (game.global.titimpLeft > 1 && game.global.mapsActive && what === 'attack') {
		currentCalc *= 2;
		textString += "<tr><td class='bdTitle'>Titimp</td><td></td><td></td><td>x 2</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	//Add map bonus
	if (!game.global.mapsActive && game.global.mapBonus > 0 && what === 'attack') {
		var base = 0.2;
		var displayBase = '20%';
		if (game.talents.mapBattery.purchased && game.global.mapBonus === 10) {
			base = 0.4;
			displayBase = '40%';
		}
		var mapBonusMult = base * game.global.mapBonus;
		currentCalc *= 1 + mapBonusMult;
		mapBonusMult *= 100;
		textString += "<tr><td class='bdTitle'>Map Bonus</td><td>" + displayBase + '</td><td>' + game.global.mapBonus + '</td><td>+ ' + prettify(mapBonusMult) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	//Add RoboTrimp
	if (what === 'attack' && game.global.roboTrimpLevel > 0) {
		var roboTrimpMod = 0.2 * game.global.roboTrimpLevel;
		currentCalc *= 1 + roboTrimpMod;
		roboTrimpMod *= 100;
		textString += "<tr><td class='bdTitle'><span class='icomoon icon-chain'></span> RoboTrimp <span class='icomoon icon-chain'></span></td><td>20%</td><td>" + game.global.roboTrimpLevel + '</td><td>+ ' + prettify(roboTrimpMod) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if ((what === 'attack' || what === 'health') && game.global.frigidCompletions && game.global.universe === 1) {
		var mult = game.challenges.Frigid.getTrimpMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Frigid Completions</td><td>+ 2.5N%</td><td>" + game.global.frigidCompletions + '</td><td>+ ' + prettify((mult - 1) * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	if ((what === 'attack' || what === 'health') && game.global.mayhemCompletions) {
		var mult = game.challenges.Mayhem.getTrimpMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Mayhem Completions</td><td>+ 10N%</td><td>" + game.global.mayhemCompletions + '</td><td>+ ' + prettify((mult - 1) * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	if ((what === 'attack' || what === 'health') && game.global.pandCompletions) {
		var mult = game.challenges.Pandemonium.getTrimpMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Pandemonium Completions</td><td>+ 10N%</td><td>" + game.global.pandCompletions + '</td><td>+ ' + prettify((mult - 1) * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	if ((what === 'attack' || what === 'health') && game.global.desoCompletions) {
		var mult = game.challenges.Desolation.getTrimpMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Desolation Completions</td><td>+ 10N%</td><td>" + game.global.desoCompletions + '</td><td>+ ' + prettify((mult - 1) * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	if ((what === 'attack' || what === 'health') && autoBattle.bonuses.Stats.level > 0 && game.global.universe === 2) {
		var mult = autoBattle.bonuses.Stats.getMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Spire Assault Stats</td><td>+ 10%</td><td>" + autoBattle.bonuses.Stats.level + '</td><td>+ ' + prettify((mult - 1) * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	//Add challenges
	if (what === 'health' && challengeActive('Life')) {
		currentCalc *= game.challenges.Life.getHealthMult();
		textString += "<tr><td class='bdTitle'>Unliving (Life)</td><td>10%</td><td>" + game.challenges.Life.stacks + '</td><td>+ ' + game.challenges.Life.getHealthMult(true) + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td></tr>';
	}
	if (what === 'attack' && challengeActive('Life')) {
		currentCalc *= game.challenges.Life.getHealthMult();
		textString += "<tr><td class='bdTitle'>Unliving (Life)</td><td></td><td></td><td>+ " + game.challenges.Life.getHealthMult(true) + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what === 'health' && challengeActive('Duel') && game.challenges.Duel.trimpStacks < 20) {
		currentCalc *= 10;
		textString += "<tr><td class='bdTitle'>Rallying Cry (Duel)</td><td>x 10</td><td></td><td>x 10</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td></tr>';
	}
	if (what === 'attack' && challengeActive('Duel') && game.challenges.Duel.trimpStacks > 50) {
		currentCalc *= 3;
		textString += "<tr><td class='bdTitle'>Winning (Duel)</td><td>x 3</td><td></td><td>x 3</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what === 'health' && challengeActive('Balance')) {
		var mult = game.challenges.Balance.getHealthMult();
		currentCalc *= mult;
		var display = mult > 0.0001 ? mult.toFixed(4) : mult.toExponential(3);
		textString += "<tr style='color: red'><td class='bdTitle'>Weakness (Balance)</td><td>1%</td><td>" + game.challenges.Balance.balanceStacks + '</td><td>x ' + display + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td></tr>';
	}
	if (what === 'attack' && challengeActive('Lead') && game.global.world % 2 === 1) {
		currentCalc *= 1.5;
		textString += "<tr><td class='bdTitle'>Determined (Lead)</td><td></td><td></td><td>+ 50%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what === 'attack' && challengeActive('Quagmire') && game.challenges.Quagmire.exhaustedStacks != 0) {
		var mult = game.challenges.Quagmire.getExhaustMult();
		currentCalc *= mult;
		var dispPercent = '';
		var dispTotal = '';
		if (mult < 1) {
			textString += "<tr style='color: red'>";
			dispPercent = game.global.mapsActive ? '-5%' : '-10%';
			dispTotal = 'x ' + prettify(mult);
		} else {
			textString += '<tr>';
			dispPercent = game.global.mapsActive ? '5%' : '10%';
			dispTotal = '+ ' + prettify((mult - 1) * 100) + '%';
		}
		textString += "<td class='bdTitle'>Exhausted (Quagmire)</td><td>" + dispPercent + '</td><td>' + game.challenges.Quagmire.exhaustedStacks + '</td><td>' + dispTotal + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what !== 'shield') {
		var heirloomBonus = calcHeirloomBonus('Shield', 'trimp' + capitalizeFirstLetter(what), 0, true);
		if (heirloomBonus > 0) {
			currentCalc *= heirloomBonus / 100 + 1;
			heirloomBonus = prettify(heirloomBonus) + '%';
			textString += "<tr><td class='bdTitle'>Heirloom (Shield)</td><td></td><td></td><td>+ " + heirloomBonus + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
		}
	}
	if (challengeActive('Decay') && what === 'attack') {
		currentCalc *= 5;
		textString += "<tr><td class='bdTitle'>Sanity (Decay)</td><td></td><td></td><td class='bdPercent'>x 5</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
		var stackStr = Math.pow(game.challenges.Decay.decayValue, game.challenges.Decay.stacks);
		currentCalc *= stackStr;
		textString += "<tr style='color: red'><td class='bdTitle'>Decay</td><td>x 0.995</td><td>" + game.challenges.Decay.stacks + "</td><td class='bdPercent'>x " + stackStr.toFixed(3) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (challengeActive('Melt') && what === 'attack') {
		currentCalc *= 5;
		textString += "<tr><td class='bdTitle'>Sanity (Melt)</td><td></td><td></td><td class='bdPercent'>x 5</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
		var stackStr = Math.pow(game.challenges.Melt.decayValue, game.challenges.Melt.stacks);
		currentCalc *= stackStr;
		textString += "<tr style='color: red'><td class='bdTitle'>Melt</td><td>x 0.995</td><td>" + game.challenges.Melt.stacks + "</td><td class='bdPercent'>x " + stackStr.toFixed(3) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (challengeActive('Quest') && game.challenges.Quest.finishedQuests > 0 && what === 'attack') {
		amt = game.challenges.Quest.getAttackMult();
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Finished Quests!</td><td>x 1.1</td><td>" + game.challenges.Quest.finishedQuests + "</td><td class='bdPercent'>+ " + prettify((amt - 1) * 100) + "%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (challengeActive('Revenge') && game.challenges.Revenge.stacks > 0 && (what === 'attack' || what === 'health')) {
		amt = game.challenges.Revenge.getMult();
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Revenge</td><td>+ 20%</td><td>" + game.challenges.Revenge.stacks + "</td><td class='bdPercent'>+ " + prettify((amt - 1) * 100) + "%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	if ((challengeActive('Electricity') || challengeActive('Mapocalypse')) && what === 'attack') {
		var mult = 1 - game.challenges.Electricity.stacks * 0.1;
		currentCalc *= mult;

		textString += "<tr style='color: red'><td class='bdTitle'>" + game.global.challengeActive + '</td><td>-10%</td><td>' + game.challenges.Electricity.stacks.toString() + "</td><td class='bdPercent'>x " + mult.toFixed(1) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (challengeActive('Archaeology') && what === 'attack') {
		var mult = game.challenges.Archaeology.getStatMult(what);
		var count = game.challenges.Archaeology.getPoints(what);
		var style = count < 0 ? " style='color: red'" : '';
		currentCalc *= mult;
		textString += '<tr><td' + style + " class='bdTitle'>Relic Strength</td><td>x1.05</td><td>" + count + "</td><td class='bdPercent'>x " + prettify(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	if (what === 'attack' && challengeActive('Storm') && game.global.mapsActive) {
		var mult = game.challenges.Storm.getMapMult();
		currentCalc *= mult;
		textString += "<tr style='color: red'><td class='bdTitle'>Beta Trimps</td><td>-0.05%</td><td>" + game.challenges.Storm.beta + '</td><td>x ' + prettify(mult) + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what === 'health' && challengeActive('Insanity')) {
		var mult = game.challenges.Insanity.getHealthMult();
		currentCalc *= mult;
		textString += "<tr style='color: red'><td class='bdTitle'>Insanity</td><td>x 0.99</td><td>" + game.challenges.Insanity.insanity + '</td><td>x ' + prettify(mult) + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td></tr>';
	}
	if (what === 'attack' && challengeActive('Berserk') && game.challenges.Berserk.frenzyStacks > 0) {
		var mult = game.challenges.Berserk.getAttackMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Frenzied</td><td>+50%</td><td>" + game.challenges.Berserk.frenzyStacks + '</td><td>x ' + prettify(mult) + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what === 'health' && challengeActive('Berserk') && game.challenges.Berserk.frenzyStacks > 0) {
		var mult = game.challenges.Berserk.getHealthMult();
		currentCalc *= mult;
		textString += "<tr style='color: red'><td class='bdTitle'>Frenzied</td><td>-2%</td><td>" + game.challenges.Berserk.frenzyStacks + '</td><td>x ' + prettify(mult) + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td></tr>';
	} else if (what === 'health' && challengeActive('Berserk') && game.challenges.Berserk.weakened > 0) {
		var mult = game.challenges.Berserk.getHealthMult();
		currentCalc *= mult;
		textString += "<tr style='color: red'><td class='bdTitle'>Weakened</td><td>-4.99%</td><td>" + game.challenges.Berserk.weakened + '</td><td>x ' + prettify(mult) + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td></tr>';
	}
	if (what === 'attack' && game.portal.Frenzy.frenzyActive()) {
		var mult = game.portal.Frenzy.getAttackMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Frenzied</td><td>+50%</td><td>" + getPerkLevel('Frenzy') + '</td><td>x ' + prettify(mult) + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if ((what === 'attack' || what === 'health') && getPerkLevel('Championism')) {
		var mult = game.portal.Championism.getMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Championism</td><td>" + (1 + 0.5 * (autoBattle.maxEnemyLevel - 1)) + '%</td><td>' + getPerkLevel('Championism') + '</td><td>' + formatMultAsPercent(mult) + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	if (what === 'attack' && Fluffy.isRewardActive('SADailies') && challengeActive('Daily')) {
		var mult = Fluffy.rewardConfig.SADailies.attackMod();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Scruffy Dailies</td><td>+ 4%</td><td>" + (autoBattle.maxEnemyLevel - 1) + '</td><td>+ ' + prettify((mult - 1) * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if ((what === 'attack' || what === 'health') && challengeActive('Alchemy') && game.global.universe === 2) {
		var mult = alchObj.getPotionEffect('Potion of Strength');
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Potion of Strength</td><td>+ 15%</td><td>" + alchObj.getPotionCount('Potion of Strength') + '</td><td>' + formatMultAsPercent(mult) + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	if (challengeActive('Daily')) {
		var mult = 0;
		if (typeof game.global.dailyChallenge.weakness !== 'undefined' && what === 'attack') {
			mult = dailyModifiers.weakness.getMult(game.global.dailyChallenge.weakness.strength, game.global.dailyChallenge.weakness.stacks);
			currentCalc *= mult;
			textString += "<tr style='color: red'><td class='bdTitle'>Weakness (Daily)</td><td>" + formatMultAsPercent(dailyModifiers.weakness.getMult(game.global.dailyChallenge.weakness.strength, 1)) + '</td><td>' + game.global.dailyChallenge.weakness.stacks + "</td><td class='bdPercent'>" + formatMultAsPercent(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
		}
		if (typeof game.global.dailyChallenge.oddTrimpNerf !== 'undefined' && what === 'attack' && game.global.world % 2 === 1) {
			mult = dailyModifiers.oddTrimpNerf.getMult(game.global.dailyChallenge.oddTrimpNerf.strength);
			currentCalc *= mult;
			textString += "<tr style='color: red'><td class='bdTitle'>Oddly Weak (Daily)</td><td>" + formatMultAsPercent(mult) + "</td><td></td><td class='bdPercent'>" + formatMultAsPercent(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
		}
		if (typeof game.global.dailyChallenge.evenTrimpBuff !== 'undefined' && what === 'attack' && game.global.world % 2 === 0) {
			mult = dailyModifiers.evenTrimpBuff.getMult(game.global.dailyChallenge.evenTrimpBuff.strength);
			currentCalc *= mult;
			textString += "<tr><td class='bdTitle'>Even Stronger (Daily)</td><td>" + formatMultAsPercent(mult) + "</td><td></td><td class='bdPercent'>" + formatMultAsPercent(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
		}
		if (typeof game.global.dailyChallenge.rampage !== 'undefined' && what === 'attack') {
			mult = dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, game.global.dailyChallenge.rampage.stacks);
			currentCalc *= mult;
			textString += "<tr><td class='bdTitle'>Rampage (Daily)</td><td>" + formatMultAsPercent(dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, 1)) + '</td><td>' + game.global.dailyChallenge.rampage.stacks + "</td><td class='bdPercent'>" + formatMultAsPercent(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
		}
		if (typeof game.global.dailyChallenge.pressure !== 'undefined' && what === 'health') {
			mult = dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks);
			currentCalc *= mult;
			textString += "<tr style='color: red'><td class='bdTitle'>Pressure (Daily)</td><td>" + formatMultAsPercent(mult) + "</td><td></td><td class='bdPercent'>" + formatMultAsPercent(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
		}
	}
	if (challengeActive('Wither') && what === 'health') {
		mult = game.challenges.Wither.getTrimpHealthMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Hardness (Wither)</td><td>+ 0.1%</td><td>" + game.challenges.Wither.trimpStacks + "</td><td class='bdPercent'>" + formatMultAsPercent(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}
	if (challengeActive('Desolation') && what === 'attack') {
		mult = game.challenges.Desolation.trimpAttackMult(true);
		currentCalc *= mult;
		textString += "<tr style='color: red'><td class='bdTitle'>Chilled (Desolation)</td><td>x 0.998</td><td>" + prettify(game.challenges.Desolation.chilled) + "</td><td class='bdPercent'>x " + prettify(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (challengeActive('Desolation') && what === 'health') {
		mult = game.challenges.Desolation.trimpHealthMult(true);
		currentCalc *= mult;
		textString += "<tr style='color: red'><td class='bdTitle'>Chilled (Desolation)</td><td>x 0.999</td><td>" + prettify(game.challenges.Desolation.chilled) + "</td><td class='bdPercent'>x " + prettify(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}
	if (challengeActive('Desolation')) {
		mult = game.challenges.Desolation.desolationMult();
		currentCalc *= mult;
		textString += "<tr style='color: red'><td class='bdTitle'>Desolation</td><td>x " + (1 - game.challenges.Desolation.getReducePercent()).toFixed(3) + '</td><td>' + (game.global.world - 1) + "</td><td class='bdPercent'>x " + prettify(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>';
		if (what === 'attack') textString += getFluctuation(currentCalc, minFluct, maxFluct);
		textString += '</tr>';
	}
	//Add golden battle
	if (what !== 'block' && what !== 'shield' && game.goldenUpgrades.Battle.currentBonus > 0) {
		amt = game.goldenUpgrades.Battle.currentBonus;
		currentCalc *= 1 + amt;
		textString += "<tr><td class='bdTitle'>Golden Battle</td><td></td><td></td><td>+ " + prettify(amt * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	//Masteries
	if (what === 'attack' && game.talents.herbalist.purchased) {
		amt = game.talents.herbalist.getBonus();
		currentCalc *= amt;
		amt = (amt - 1) * 100;
		textString += "<tr><td class='bdTitle'>Herbalist</td><td></td><td></td><td>+ " + prettify(amt) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what !== 'block' && what !== 'shield' && game.talents.voidPower.purchased && game.global.voidBuff) {
		amt = game.talents.voidPower2.purchased ? (game.talents.voidPower3.purchased ? 65 : 35) : 15;
		currentCalc *= 1 + amt / 100;
		textString += "<tr><td class='bdTitle'>Void Power</td><td></td><td>" + (game.talents.voidPower2.purchased ? (game.talents.voidPower3.purchased ? 'III' : 'II') : 'I') + '</td><td>+ ' + amt + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	if (what === 'attack' && isScryerBonusActive() && game.talents.scry.purchased && !game.global.mapsActive && (getCurrentWorldCell().mutation === 'Corruption' || getCurrentWorldCell().mutation === 'Healthy')) {
		currentCalc *= 2;
		textString += "<tr><td class='bdTitle'>Scryhard I</td><td>+100%</td><td></td><td>+ 100%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what === 'attack' && game.talents.daily.purchased && game.global.challengeActive === 'Daily') {
		currentCalc *= 1.5;
		textString += "<tr><td class='bdTitle'>Legs for Days</td><td>+50%</td><td></td><td>+ 50%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (game.talents.magmamancer.purchased && what === 'attack' && game.jobs.Magmamancer.getBonusPercent() > 1) {
		amt = game.jobs.Magmamancer.getBonusPercent();
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Magmamancermancy</td><td></td><td></td><td>+ " + prettify((amt - 1) * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (game.talents.stillRowing2.purchased && what === 'attack' && game.global.spireRows >= 1) {
		amt = game.global.spireRows * 0.06;
		currentCalc *= amt + 1;
		textString += "<tr><td class='bdTitle'>Still Rowing II</td><td>6%</td><td>" + game.global.spireRows + '</td><td>+ ' + prettify(amt * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (game.talents.healthStrength.purchased && what === 'attack' && mutations.Healthy.active()) {
		var cellCount = mutations.Healthy.cellCount();
		amt = 0.15 * cellCount;
		currentCalc *= amt + 1;
		textString += "<tr><td class='bdTitle'>Strength in Health</td><td>15%</td><td>" + cellCount + '</td><td>+ ' + prettify(amt * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what === 'attack' && game.global.mapsActive && game.talents.bionic2.purchased && getCurrentMapObject().level > game.global.world) {
		currentCalc *= 1.5;
		textString += "<tr><td class='bdTitle'>Bionic Magnet II</td><td>+50%</td><td></td><td>+ 50%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what === 'attack' && game.global.voidBuff && game.talents.voidMastery.purchased) {
		currentCalc *= 5;
		textString += "<tr><td class='bdTitle'>Master of the Void</td><td>x5</td><td></td><td>x 5</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what === 'health' && game.talents.mapHealth.purchased && game.global.mapsActive) {
		currentCalc *= 2;
		textString += "<tr><td class='bdTitle'>Safe Mapping</td><td>x 2</td><td class='bdNumberSm'>&nbsp;</td><td class='bdNumberSm'>x 2</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td></tr>';
	}
	//Pumpkimp buff
	if (game.global.sugarRush > 0 && what === 'attack') {
		currentCalc *= sugarRush.getAttackStrength();
		textString += "<tr class='pumpkimpRow'><td class='bdTitle'>Sugar Rush</td><td>&nbsp;</td><td>&nbsp;</td><td>x " + sugarRush.getAttackStrength() + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}

	//Challenge^2 bonus
	if (game.global.totalSquaredReward > 0 && (what === 'attack' || what === 'health')) {
		amt = game.global.totalSquaredReward;
		currentCalc *= 1 + amt / 100;
		var c2Name = game.global.highestRadonLevelCleared < 49 ? '2' : "<span class='icomoon icon-infinity'></span>";
		textString += "<tr><td class='bdTitle'>Challenge<sup>" + c2Name + '</sup> Rewards</td><td></td><td></td><td>+ ' + prettify(amt) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}

	//Ice
	if (what === 'attack' && getEmpowerment() === 'Ice') {
		amt = game.empowerments.Ice.getDamageModifier();
		currentCalc *= 1 + amt;
		textString += "<tr><td class='bdTitle'>Chilled Enemy</td><td></td><td></td><td>+ " + prettify(amt * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	//Fluffy/Scruffy
	if (what === 'attack' && Fluffy.isActive()) {
		amt = Fluffy.getDamageModifier();
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>" + Fluffy.getName() + '</td><td></td><td></td><td>+ ' + prettify((amt - 1) * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	//Fluffy E8
	if (what === 'attack' && Fluffy.isRewardActive('voidSiphon') && game.stats.totalVoidMaps.value) {
		var voids = game.stats.totalVoidMaps.value;
		var voidWeight = 0.05;
		amt = voidWeight * voids;
		currentCalc *= 1 + amt;
		var voidE = game.talents.fluffyAbility.purchased ? '8' : '9';
		textString += "<tr><td class='bdTitle'>Void Siphon (" + Fluffy.getName() + ' E' + voidE + ')</td><td>+ ' + voidWeight * 100 + '%</td><td>' + voids + '</td><td>+ ' + prettify(amt * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what === 'attack' && game.global.universe === 1 && Fluffy.isActive() && game.talents.kerfluffle.purchased) {
		amt = game.talents.kerfluffle.mult();
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Kerfluffle</td><td>x 1.1</td><td>" + (Fluffy.getCurrentPrestige() + 1) + '</td><td>+ ' + prettify((amt - 1) * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	//Cruffys
	if (game.challenges.Nurture.boostsActive() && (what === 'attack' || what === 'health')) {
		mult = game.challenges.Nurture.getStatBoost();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Cruffys</td><td></td><td>" + game.challenges.Nurture.getLevel() + "</td><td class='bdPercent'>" + formatMultAsPercent(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + (what === 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
	}
	//Amalgamator health
	if (what === 'health' && game.jobs.Amalgamator.owned > 0) {
		amt = game.jobs.Amalgamator.getHealthMult();
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Amalgamator</td><td>x " + prettify(game.jobs.Amalgamator.healthModifier) + "</td><td class='bdNumberSm'>" + prettify(game.jobs.Amalgamator.owned) + "</td><td class='bdNumberSm'>x " + prettify(amt) + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td></tr>';
	}
	//Gator attack
	if (what === 'attack' && game.jobs.Amalgamator.owned > 0) {
		amt = game.jobs.Amalgamator.getDamageMult();
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Amalgamator</td><td>+ " + prettify(game.jobs.Amalgamator.damageModifier * 100) + '%</td><td>' + game.jobs.Amalgamator.owned + '</td><td>+ ' + prettify((amt - 1) * 100) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	//Strength Towers - TD
	if (what === 'attack' && playerSpireTraps.Strength.owned) {
		amt = playerSpireTraps.Strength.getWorldBonus();
		currentCalc *= 1 + amt / 100;
		textString += "<tr><td class='bdTitle'>Strength Tower" + needAnS(playerSpireTraps.Strength.owned) + '</td><td>+ ' + prettify(playerSpireTraps.Strength.getWorldBonus(true)) + '%</td><td>' + playerSpireTraps.Strength.owned + '</td><td>+ ' + prettify(amt) + "%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what === 'attack' && getUberEmpowerment() === 'Poison') {
		currentCalc *= 3;
		textString += "<tr><td class='bdTitle'>Enlightened Poison</td><td>x 3</td><td></td><td>x 3</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	//Sharp Trimps - bones
	if (what === 'attack' && game.singleRunBonuses.sharpTrimps.owned) {
		currentCalc *= 1.5;
		textString += "<tr><td class='bdTitle'>Sharp Trimps</td><td></td><td></td><td>+ 50%</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what === 'health' && game.global.universe === 2 && u2Mutations.tree.Health.purchased) {
		currentCalc *= 1.5;
		textString += "<tr><td class='bdTitle'>Healthy Mutator</td><td>x 1.5</td><td class='bdNumberSm'></td><td class='bdNumberSm'>x 1.5</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td></tr>';
	}
	if (what === 'attack' && game.global.universe === 2 && u2Mutations.tree.Attack.purchased) {
		currentCalc *= 1.5;
		textString += "<tr><td class='bdTitle'>Attack Mutator</td><td>x 1.5</td><td></td><td>x 1.5</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what === 'health' && game.global.universe === 2 && u2Mutations.tree.GeneHealth.purchased) {
		currentCalc *= 10;
		textString += "<tr><td class='bdTitle'>Gene Health Mutator</td><td>x 10</td><td class='bdNumberSm'></td><td class='bdNumberSm'>x 10</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td></tr>';
	}
	if (what === 'attack' && game.global.universe === 2 && u2Mutations.tree.GeneAttack.purchased) {
		currentCalc *= 10;
		textString += "<tr><td class='bdTitle'>Gene Attack Mutator</td><td>x 10</td><td></td><td>x 10</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what === 'attack' && game.global.universe === 2 && u2Mutations.tree.Brains.purchased) {
		mult = u2Mutations.tree.Brains.getBonus();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Brains to Brawn</td><td>x " + prettify(mult) + '</td><td></td><td>x ' + prettify(mult) + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (game.global.universe === 2 && game.global.novaMutStacks > 0 && what === 'attack') {
		amt = u2Mutations.types.Nova.trimpAttackMult();
		currentCalc *= amt;
		textString += "<tr style='color: red'><td class='bdTitle'>Blinded (Nova)</td><td>x 0.99</td><td>" + game.global.novaMutStacks + "</td><td class='bdPercent'>x " + prettify(amt) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (game.global.universe === 2 && game.global.spireActive && !game.global.mapsActive && game.global.spireMutStacks > 0 && what === 'attack') {
		amt = u2Mutations.types.Spire1.trimpAttackMult();
		currentCalc *= amt;
		textString += "<tr style='color: red'><td class='bdTitle'>Spore Cloud (Spire)</td><td>x 0.99</td><td>" + game.global.spireMutStacks.toFixed(1) + "</td><td class='bdPercent'>x " + prettify(amt) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what === 'attack' && challengeActive('Unbalance')) {
		var mult = game.challenges.Unbalance.getAttackMult();
		currentCalc *= mult;
		var display = mult > 0.0001 ? mult.toFixed(4) : mult.toExponential(3);
		textString += "<tr style='color: red'><td class='bdTitle'>Weakness (Unbalance)</td><td>x 0.99</td><td>" + game.challenges.Unbalance.balanceStacks + '</td><td>x ' + display + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (what === 'attack' && getPerkLevel('Equality') > 0) {
		mult = game.portal.Equality.getMult(true);
		currentCalc *= mult;
		var display = prettifyTiny(mult);
		var modifier = game.portal.Equality.getModifier(true);
		var modDisplay = modifier > 0.0001 ? modifier.toFixed(4) : modifier.toExponential(3);
		textString += "<tr style='color: red'><td class='bdTitle'>Equality</td><td>x " + modDisplay + '</td><td>' + game.portal.Equality.getActiveLevels() + "</td><td class='bdPercent'>x " + display + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td>' + getFluctuation(currentCalc, minFluct, maxFluct) + '</tr>';
	}
	if (game.global.universe === 2 && what !== 'shield') {
		var cellCredit = u2SpireBonuses.cellCredit();
		if (cellCredit > 0) {
			amt = u2SpireBonuses.basics();
			currentCalc *= amt;
			textString += "<tr><td class='bdTitle'>Stuffy's Spire</td><td></td><td>" + cellCredit + '</td><td>x ' + prettify(amt) + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td>' + (what == 'attack' ? getFluctuation(currentCalc, minFluct, maxFluct) : '') + '</tr>';
		}
	}

	//Crit
	if (what === 'attack') {
		var critChance = getPlayerCritChance();
		var thisCritChance = 0;
		var critCalc = 0;
		var critMult = 0;
		var baseCritMult = getPlayerCritDamageMult();
		if (critChance < 0) {
			//From reduced crit chance daily or maybe other stuff later
			critMult = 1;
			critCalc = currentCalc;
			textString += "<tr class='critRow'><td class='bdTitle'><span style='color: yellow;'>Crit!</span> Chance</td><td>0% (" + (critChance * 100).toFixed(1) + "% Total)</td><td class='bdTitle'><span style='color: yellow;'>Crit!</span> Damage</td><td>+ " + prettify((critMult - 1) * 100) + "%</td><td class='bdNumberSm'>" + prettify(critCalc) + '</td>' + getFluctuation(critCalc, minFluct, maxFluct) + '</tr>';
			textString += "<tr class='critRow'><td class='bdTitle'><span style='color: cyan;'>Weak!</span> Chance</td><td>" + (Math.abs(critChance) * 100).toFixed(1) + "%</td><td class='bdTitle'><span style='color: cyan;'>Weak!</span> Damage</td><td>x 0.2</td><td class='bdNumberSm'>" + prettify(currentCalc * 0.2) + '</td>' + getFluctuation(currentCalc * 0.2, minFluct, maxFluct) + '</tr>';
		} else {
			if (critChance > 0) {
				critMult = baseCritMult;
				if (critChance >= 2) thisCritChance = 0;
				else if (critChance >= 1) thisCritChance = 1 - (critChance % 1);
				else thisCritChance = critChance;
				critCalc = currentCalc * critMult;
				textString += "<tr class='critRow'><td class='bdTitle'><span style='color: yellow;'>Crit!</span> Chance</td><td>" + (thisCritChance * 100).toFixed(1) + '%';
				if (critChance > 1) textString += ' (' + (critChance * 100).toFixed(1) + '% Total)';
				textString += "</td><td class='bdTitle'><span style='color: yellow;'>Crit!</span> Damage</td><td>+ " + prettify((critMult - 1) * 100) + "%</td><td class='bdNumberSm'>" + prettify(critCalc) + '</td>' + getFluctuation(critCalc, minFluct, maxFluct) + '</tr>';
			}
			if (critChance > 1) {
				var max = 9;
				var doubleChance = getPlayerDoubleCritChance();
				var checkAdd = doubleChance > 0 ? 1 : 0;
				var doubleAdd = 0;
				for (var check = 1; check < max; check++) {
					if (critChance + checkAdd > check && critChance < check + 2) {
						var finalTier = check == max - 1;
						if (!finalTier && critChance >= check + 1) thisCritChance = 1 - (critChance % 1);
						else if (finalTier && critChance >= check + 1) thisCritChance = 1;
						else thisCritChance = critChance - check;
						if (doubleChance > 0) {
							if (finalTier && critChance > check) thisCritChance += doubleAdd;
							else if (critChance <= check) thisCritChance = doubleAdd;
							else {
								var oldAdd = doubleAdd;
								var doubleChange = thisCritChance * (1 - doubleChance);
								doubleAdd = thisCritChance - doubleChange;
								thisCritChance = doubleChange;
								thisCritChance += oldAdd;
							}
						}
						critMult = getMegaCritDamageMult(check + 1);
						critCalc = currentCalc * critMult * baseCritMult;
						textString += "<tr class='critRow'><td class='bdTitle'>" + getCritText(check + 1) + ' Chance</td><td>' + (thisCritChance * 100).toFixed(1) + "%</td><td class='bdTitle'>" + getCritText(check + 1) + " Damage</td><td><span style='color: yellow;'>Crit!</span> x " + prettify(critMult) + "</td><td class='bdNumberSm'>" + prettify(critCalc) + '</td>' + getFluctuation(critCalc, minFluct, maxFluct) + '</tr>';
					}
				}
			}
		}
	}

	textString += '</tbody></table></div>';
	game.global.lockTooltip = false;
	document.getElementById('tipText').className = '';
	tooltip('confirm', null, 'update', textString, "getBattleStatBd('" + what + "')", name, 'Refresh', true);

	if (what === 'attack' || what === 'health') {
		verticalCenterTooltip(true);
	}
}

function createHeirloom(zone, fromBones, spireCore, forceBest) {
	const rarityNames = game.heirlooms.rarityNames;
	//Determine Type
	let seed = fromBones ? game.global.heirloomBoneSeed : game.global.heirloomSeed;
	if (forceBest) seed = game.global.bestHeirloomSeed;

	let type;
	let rarity;
	if (spireCore) {
		type = 'Core';
		rarity = Math.round((zone - 200) / 100);
		if (rarity > 6) rarity = 6;
		if (rarity < 0) rarity = 0;
		game.stats.coresFound.value++;
		seed = game.global.coreSeed;
	} else {
		type = getRandomIntSeeded(seed++, 0, 2) === 0 ? 'Shield' : 'Staff';
		//Determine type rarity
		rarity = getHeirloomRarity(zone, seed++, fromBones, forceBest);
	}
	//Sort through modifiers and build a list of eligible items. Check filters if applicable
	let eligible = [];
	for (let item in game.heirlooms[type]) {
		const heirloom = game.heirlooms[type][item];

		if (item === 'empty' && (rarity === 0 || rarity === 1)) continue;
		if (typeof heirloom.filter !== 'undefined' && !heirloom.filter()) continue;
		if (heirloom.steps && heirloom.steps[rarity] === -1) continue;
		if (heirloom.minTier && rarity < heirloom.minTier) continue;
		if (heirloom.maxTier && rarity > heirloom.maxTier) continue;

		eligible.push(item);
	}

	const slots = game.heirlooms.slots[rarity];
	const name = rarityNames[rarity] + ' ' + type;
	//Heirloom configuration
	//{name: "", type: "", rarity: #, mods: [[ModName, value, createdStepsFromCap, upgradesPurchased, seed]]}

	const buildHeirloom = { id: game.stats.totalHeirlooms.valueTotal + game.stats.totalHeirlooms.value, nuMod: 1, name, type, repSeed: getRandomIntSeeded(seed++, 1, 10e6), rarity, mods: [] };

	if (buildHeirloom.rarity === 12) buildHeirloom.icon = type === 'Shield' ? '*qrcode2' : '*i-cursor';
	else buildHeirloom.icon = type === 'Core' ? 'adjust' : type === 'Shield' ? '*shield3' : 'grain';

	let x = 0;
	if (!game.heirlooms.canReplaceMods[rarity]) {
		x++;
		buildHeirloom.mods.push(['empty', 0, 0, 0, getRandomIntSeeded(seed++, 0, 1000)]);
	}

	for (x; x < slots; x++) {
		const roll = getRandomIntSeeded(seed++, 0, eligible.length);
		const thisMod = eligible[roll];
		eligible.splice(roll, 1);
		let steps = typeof game.heirlooms[type][thisMod].steps !== 'undefined' ? game.heirlooms[type][thisMod].steps : game.heirlooms.defaultSteps;
		steps = getRandomBySteps(steps[rarity], null, seed++);

		buildHeirloom.mods.push([thisMod, steps[0], steps[1], 0, getRandomIntSeeded(seed++, 0, 1000)]);
	}

	buildHeirloom.mods.sort(function (a, b) {
		a = a[0].toLowerCase();
		b = b[0].toLowerCase();
		if (a === 'empty') return 1;
		if (b === 'empty' || b > a) return -1;
		return a > b;
	});

	if (challengeActive('Daily') && !fromBones) {
		buildHeirloom.nuMod *= 1 + getDailyHeliumValue(countDailyWeight()) / 100;
	}

	if (autoBattle.oneTimers.Nullicious.owned && game.global.universe === 2) buildHeirloom.nuMod *= autoBattle.oneTimers.Nullicious.getMult();
	if (game.global.universe === 2 && u2Mutations.tree.Nullifium.purchased) buildHeirloom.nuMod *= 1.1;
	buildHeirloom.nuMod *= u2SpireBonuses.nullifium();
	game.global.heirloomsExtra.push(buildHeirloom);

	const displayCores = type === 'Core' && rarity >= game.global.spiresCompleted - 1;
	if (game.options.menu.voidPopups.enabled !== 2 || displayCores || getHeirloomRarityRanges(zone, fromBones).length === rarity + 1) {
		displaySelectedHeirloom(false, 0, false, 'heirloomsExtra', game.global.heirloomsExtra.length - 1, true);
	}

	if (game.stats.totalHeirlooms.value + game.stats.totalHeirlooms.valueTotal === 0) document.getElementById('heirloomBtnContainer').style.display = 'block';
	game.stats.totalHeirlooms.value++;
	checkAchieve('totalHeirlooms');
	if (heirloomsShown) displayExtraHeirlooms();

	seed += 6 - x * 2;
	if (spireCore) game.global.coreSeed = seed;
	else if (fromBones) game.global.heirloomBoneSeed = seed;
	else if (forceBest) game.global.bestHeirloomSeed = seed;
	else game.global.heirloomSeed = seed;
}

function positionTooltip(elem, event, extraInf) {
	const e = event || window.event;
	if (!e) return;

	let cordx = 0;
	let cordy = 0;

	if (e.pageX || e.pageY) {
		cordx = e.pageX;
		cordy = e.pageY;
	} else if (e.clientX || e.clientY) {
		cordx = e.clientX;
		cordy = e.clientY;
	}

	lastMousePos = [cordx, cordy];
	const bodw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	const bodh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	const tiph = Math.max(elem.clientHeight, elem.scrollHeight, elem.offsetHeight);
	const tipw = Math.max(elem.clientWidth, elem.scrollWidth, elem.offsetWidth);
	const center = cordx - tipw / 2;
	const spacing = bodh * 0.04;

	if (extraInf === 'forceLeft') {
		elem.style.left = Math.floor(cordx - bodw * 0.55) + 'px';
		elem.style.top = Math.floor(cordy - tiph * 0.5) + 'px';
		return;
	}

	const setting = extraInf === 'Heirloom' ? 1 : game.options.menu.tooltipPosition.enabled;
	let setLeft;
	let setTop;

	if (setting === 0) {
		setLeft = cordx + spacing;
		if (setLeft + tipw > bodw) {
			setLeft = bodw - tipw;
		}
		setTop = cordy - tiph - spacing;
	}

	if (setting >= 1 || setTop < 0) {
		setLeft = center;
		if (setLeft < 0) {
			setLeft = 0;
		} else if (setLeft > bodw - tipw) {
			setLeft = bodw - tipw;
		}

		const maxAbove = cordy - tiph - spacing;
		if (setting === 1 || maxAbove < 0) {
			setTop = cordy + spacing;
			if (setTop + tiph > bodh) {
				setTop = maxAbove;
			}
		} else {
			setTop = maxAbove;
		}
	}

	/* check if the tooltip is offscreen vertically */
	if (setTop < 0 || setTop + tiph > bodh) {
		const spaceLeft = cordx;
		const spaceRight = bodw - cordx;
		if (spaceRight >= spaceLeft) {
			setLeft = cordx + spacing;
			if (setLeft + tipw > bodw) {
				setLeft = bodw - tipw;
			}
		} else {
			setLeft = cordx - tipw - spacing;
			if (setLeft < 0) {
				setLeft = 0;
			}
		}
		setTop = Math.max(0, Math.min(cordy - tiph / 2, bodh - tiph));
	}

	elem.style.left = Math.floor(setLeft) + 'px';
	elem.style.top = Math.floor(setTop) + 'px';
}

function getScientistInfo(number, reward) {
	switch (number) {
		case 1: {
			const foreman = game.global.universe === 1 || !bwRewardUnlocked('Foremany') ? `, and 1 Foreman` : ``;
			return reward ? `start with 5000 Science, 100 Food, 100 Wood, 10 Traps${foreman}` : 11500;
		}
		case 2: {
			return reward ? 'start with 5 Barns, 5 Sheds, 5 Forges, and T2 Equipment unlocked' : 8000;
		}
		case 3: {
			return reward ? 'start with full Trimps and 200% player efficiency' : 1500;
		}
		case 4: {
			return reward ? 'earn two levels of each prestige upgrade per map' + (game.global.universe == 1 ? ', unlock AutoPrestiges, and your Warpstations will build instantly, skipping the queue' : '') + '. This bonus will apply' : 70;
		}
		case 5: {
			return reward ? 'permanently increase all ' + heliumOrRadon() + " found by 0.5% per zone (compounding). You'll also start with 1000% player efficiency and 50 Barns, Sheds, and Forges" : 1500;
		}
	}
}

function updatePs(jobObj, trimps, jobName) {
	//trimps is true/false, send PS as first if trimps is true, like (32.4, true)
	if (usingRealTimeOffline) return;
	if (jobObj.increase == 'custom' || (typeof jobObj.increase === 'undefined' && !trimps)) return;
	let psText;
	let elem;
	if (trimps) {
		psText = jobObj.toFixed(3);
		elem = document.getElementById('trimpsPs');
	} else {
		let increase = jobObj.increase;
		psText = jobObj.owned * jobObj.modifier;
		//portal Motivation
		if (getPerkLevel('Motivation')) psText *= 1 + getPerkLevel('Motivation') * game.portal.Motivation.modifier;
		if (getPerkLevel('Motivation_II')) psText *= 1 + getPerkLevel('Motivation_II') * game.portal.Motivation_II.modifier;
		if (increase !== 'gems' && game.permaBoneBonuses.multitasking.owned > 0 && game.resources.trimps.owned >= game.resources.trimps.realMax()) psText *= 1 + game.permaBoneBonuses.multitasking.mult();
		if (increase !== 'fragments' && increase !== 'science') {
			if (challengeActive('Alchemy')) psText *= alchObj.getPotionEffect('Potion of Finding');
			psText *= alchObj.getPotionEffect('Elixir of Finding');
		}
		if (challengeActive('Frigid')) psText *= game.challenges.Frigid.getShatteredMult();
		if (game.global.pandCompletions && increase !== 'fragments') psText *= game.challenges.Pandemonium.getTrimpMult();
		if (game.global.desoCompletions && increase !== 'fragments') psText *= game.challenges.Desolation.getTrimpMult();
		if (!game.portal.Observation.radLocked && game.global.universe == 2 && game.portal.Observation.trinkets > 0) psText *= game.portal.Observation.getMult();
		if (increase == 'food' || increase == 'wood' || increase == 'metal') {
			psText *= getParityBonus();
			if (autoBattle.oneTimers.Gathermate.owned && game.global.universe == 2) psText *= autoBattle.oneTimers.Gathermate.getMult();
		}
		if (getPerkLevel('Meditation') > 0) psText *= 1 + game.portal.Meditation.getBonusPercent() * 0.01;
		if (((increase == 'food' || increase == 'wood') && game.buildings.Antenna.owned >= 5) || (increase == 'metal' && game.buildings.Antenna.owned >= 15)) psText *= game.jobs.Meteorologist.getExtraMult();
		if (Fluffy.isRewardActive('gatherer')) psText *= 2;
		if (game.jobs.Magmamancer.owned > 0 && increase == 'metal') psText *= game.jobs.Magmamancer.getBonusPercent();
		if (challengeActive('Meditate')) psText *= 1.25;
		else if (challengeActive('Downsize')) psText *= 5;
		if (challengeActive('Toxicity')) {
			var toxMult = (game.challenges.Toxicity.lootMult * game.challenges.Toxicity.stacks) / 100;
			psText *= 1 + toxMult;
		}
		if (challengeActive('Balance')) {
			psText *= game.challenges.Balance.getGatherMult();
		}
		if (challengeActive('Unbalance')) {
			psText *= game.challenges.Unbalance.getGatherMult();
		}
		if (challengeActive('Decay')) {
			const challenge = game.challenges[game.global.challengeActive];
			psText *= 10 * Math.pow(challenge.decayValue, challenge.stacks);
		}
		if (challengeActive('Daily')) {
			if (typeof game.global.dailyChallenge.famine !== 'undefined' && increase !== 'fragments' && increase !== 'science') {
				psText *= dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
			}
			if (typeof game.global.dailyChallenge.dedication !== 'undefined') {
				psText *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
			}
		}
		if (challengeActive('Archaeology') && increase !== 'fragments') psText *= game.challenges.Archaeology.getStatMult('science');
		if (challengeActive('Insanity') && increase !== 'fragments') psText *= game.challenges.Insanity.getLootMult();
		if (challengeActive('Desolation')) psText *= game.challenges.Desolation.trimpResourceMult();
		if (game.challenges.Nurture.boostsActive() && increase !== 'fragments') psText *= game.challenges.Nurture.getResourceBoost();
		if (challengeActive('Hypothermia') && increase == 'wood') psText *= game.challenges.Hypothermia.getWoodMult(true);
		if (challengeActive('Watch')) psText /= 2;
		if (challengeActive('Lead') && game.global.world % 2 == 1) psText *= 2;
		if (jobName !== 'Explorer' && getEmpowerment() == 'Wind') {
			psText *= 1 + game.empowerments.Wind.getCombatModifier();
		}
		psText = calcHeirloomBonus('Staff', jobName + 'Speed', psText);
		if (game.global.playerGathering === increase) {
			if ((game.talents.turkimp2.purchased || game.global.turkimpTimer > 0) && increase !== 'science') {
				let tBonus = game.talents.turkimp2.purchased ? 2 : 1.5;
				psText *= tBonus;
			}
			psText += getPlayerModifier();
		}

		elem = document.getElementById(increase + 'Ps');
		//Portal Packrat
		increase = game.resources[increase];
		if (increase.max != -1) {
			let newMax = increase.max + increase.max * game.portal.Packrat.modifier * getPerkLevel('Packrat');
			newMax = calcHeirloomBonus('Shield', 'storageSize', newMax);
			if (increase.owned >= newMax) psText = 0;
		}
	}

	if (game.options.menu.useAverages.enabled) psText = parseFloat(psText) + getAvgLootSecond(jobObj.increase);
	psText = prettify(psText);
	psText = '+' + psText + '/sec';
	elem.textContent = psText;
	swapClass('sizeSec', psText.replace('.', '').length >= 11 ? 'sizeSecReduced' : 'sizeSecRegular', elem);
}

function getPsString(what, rawNum) {
	if (what === 'helium') return;
	let resOrder = ['food', 'wood', 'metal', 'science', 'gems', 'fragments'];
	const books = ['farming', 'lumber', 'miner', 'science'];
	const jobs = ['Farmer', 'Lumberjack', 'Miner', 'Scientist', 'Dragimp', 'Explorer'];
	const index = resOrder.indexOf(what);
	const job = game.jobs[jobs[index]];
	const book = game.upgrades['Speed' + books[index]];
	const mBook = game.upgrades['Mega' + books[index]];
	const base = what === 'fragments' ? 0.4 : 0.5;
	let textString = "<table class='bdTableSm table table-striped'><tbody>";
	//Add base
	textString += "<tr><td class='bdTitle'>Base</td><td class='bdPercent'></td><td class='bdNumber'>" + prettify(base) + '</td></tr>';
	//Add job count
	let currentCalc = job.owned * base;
	const s = job.owned == 1 ? '' : 's';
	textString += "<tr><td class='bdTitle'>" + jobs[index] + s + "</td><td class='bdPercent'>" + prettify(job.owned) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';

	//Add books
	if (what !== 'gems' && game.permaBoneBonuses.multitasking.owned > 0) {
		const str = game.resources.trimps.owned >= game.resources.trimps.realMax() ? game.permaBoneBonuses.multitasking.mult() : 0;
		currentCalc *= 1 + str;
		textString += "<tr><td class='bdTitle'>Multitasking (Bones)</td><td class='bdPercent'>+ " + prettify(str * 100) + "%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	//Add books
	if (typeof book !== 'undefined' && book.done > 0) {
		let bookStrength = Math.pow(1.25, book.done);
		currentCalc *= bookStrength;
		bookStrength = prettify((bookStrength - 1) * 100) + '%';
		textString += "<tr><td class='bdTitle'>Speed" + books[index] + "</td><td class='bdPercent'>+ " + bookStrength + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	//Add Megabooks
	if (typeof mBook !== 'undefined' && mBook.done > 0) {
		const mod = game.global.frugalDone ? 1.6 : 1.5;
		let mBookStrength = Math.pow(mod, mBook.done);
		currentCalc *= mBookStrength;
		mBookStrength = prettify((mBookStrength - 1) * 100) + '%';
		textString += "<tr><td class='bdTitle'>Mega" + books[index] + "</td><td class='bdPercent'>+ " + mBookStrength + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	//Add bounty
	if (what !== 'gems' && game.upgrades.Bounty.done > 0) {
		currentCalc *= 2;
		textString += "<tr><td class='bdTitle'>Bounty</td><td class='bdPercent'>+ 100%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	//Add Tribute
	if (what === 'gems' && game.buildings.Tribute.owned > 0) {
		let tributeStrength = Math.pow(game.buildings.Tribute.increase.by, game.buildings.Tribute.owned);
		currentCalc *= tributeStrength;
		tributeStrength = prettify((tributeStrength - 1) * 100) + '%';
		textString += "<tr><td class='bdTitle'>Tribute</td><td class='bdPercent'>+ " + tributeStrength + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	//Add Whipimp
	if (game.unlocks.impCount.Whipimp > 0) {
		let whipStrength = Math.pow(1.003, game.unlocks.impCount.Whipimp);
		currentCalc *= whipStrength;
		whipStrength = prettify((whipStrength - 1) * 100) + '%';
		textString += "<tr><td class='bdTitle'>Whipimp</td><td class='bdPercent'>+ " + whipStrength + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	//Add motivation
	if (getPerkLevel('Motivation') > 0) {
		let motivationStrength = getPerkLevel('Motivation') * game.portal.Motivation.modifier;
		currentCalc *= motivationStrength + 1;
		motivationStrength = prettify(motivationStrength * 100) + '%';
		textString += "<tr><td class='bdTitle'>Motivation</td><td class='bdPercent'>+ " + motivationStrength + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (getPerkLevel('Motivation_II') > 0) {
		let motivationStrength = getPerkLevel('Motivation_II') * game.portal.Motivation_II.modifier;
		currentCalc *= motivationStrength + 1;
		motivationStrength = prettify(motivationStrength * 100) + '%';
		textString += "<tr><td class='bdTitle'>Motivation II</td><td class='bdPercent'>+ " + motivationStrength + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (!game.portal.Observation.radLocked && game.global.universe == 2 && game.portal.Observation.trinkets > 0) {
		const mult = game.portal.Observation.getMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Observation</td><td class='bdPercent'>" + formatMultAsPercent(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	//Add Fluffy Gatherer
	if (Fluffy.isRewardActive('gatherer')) {
		currentCalc *= 2;
		textString += "<tr><td class='bdTitle'>Gatherer (" + Fluffy.getName() + ")</td><td class='bdPercent'>+ 100%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	//Add Meditation
	if (getPerkLevel('Meditation') > 0) {
		const meditation = game.portal.Meditation;
		const medStrength = meditation.getBonusPercent();
		if (medStrength > 0) {
			currentCalc *= 1 + medStrength * 0.01;
			textString += "<tr><td class='bdTitle'>Meditation</td><td class='bdPercent'>" + meditation.getBonusPercent(true) * 10 + ' minutes (+' + medStrength + "%)</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
		}
	}

	let potionFinding;
	if (challengeActive('Alchemy')) potionFinding = alchObj.getPotionEffect('Potion of Finding');
	if (potionFinding > 1 && what !== 'fragments' && what !== 'science') {
		currentCalc *= potionFinding;
		textString += "<tr><td class='bdTitle'>Potion of Finding</td><td class='bdPercent'>+ " + prettify((potionFinding - 1) * 100) + "%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	potionFinding = alchObj.getPotionEffect('Elixir of Finding');

	if (potionFinding > 1 && what !== 'fragments' && what !== 'science') {
		currentCalc *= potionFinding;
		textString += "<tr><td class='bdTitle'>Elixir of Finding</td><td class='bdPercent'>+ " + prettify((potionFinding - 1) * 100) + "%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	//Add Magmamancer
	if (game.jobs.Magmamancer.owned > 0 && what === 'metal') {
		let manceStrength = game.jobs.Magmamancer.getBonusPercent();
		if (manceStrength > 1) {
			currentCalc *= manceStrength;
			manceStrength = (manceStrength - 1) * 100;
			textString += "<tr><td class='bdTitle'>Magmamancers</td><td class='bdPercent'>" + game.jobs.Magmamancer.getBonusPercent(true) * 10 + ' minutes (+' + prettify(manceStrength) + "%)</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
		}
	}

	if (game.upgrades.Speedexplorer.done > 0 && what === 'fragments') {
		const bonus = Math.pow(4, game.upgrades.Speedexplorer.done);
		currentCalc *= bonus;
		textString += "<tr><td class='bdTitle'>Speedexplorer</td><td class='bdPercent'>+ " + prettify((bonus - 1) * 100) + "%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	//Add Size (challenge)
	if (challengeActive('Size') && (what === 'food' || what === 'metal' || what === 'wood')) {
		currentCalc *= 1.5;
		textString += "<tr><td class='bdTitle'>Huge (Size)</td><td class='bdPercent'>+ 50%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	//Add meditate (challenge)
	if (challengeActive('Frigid')) {
		const mult = game.challenges.Frigid.getShatteredMult();
		currentCalc *= mult;
		textString += "<tr style='color: red'><td class='bdTitle'>Shattered (Frigid)</td><td class='bdPercent'>x " + prettify(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Downsize')) {
		currentCalc *= 5;
		textString += "<tr><td class='bdTitle'>Solitary (Downsize)</td><td class='bdPercent'>+ 400%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Meditate')) {
		currentCalc *= 1.25;
		textString += "<tr><td class='bdTitle'>Meditate</td><td class='bdPercent'>+ 25%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Toxicity')) {
		let toxMult = (game.challenges.Toxicity.lootMult * game.challenges.Toxicity.stacks) / 100;
		currentCalc *= 1 + toxMult;
		toxMult = (toxMult * 100).toFixed(1) + '%';
		textString += "<tr><td class='bdTitle'>Tweaky (Toxicity)</td><td class='bdPercent'>+ " + toxMult + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Balance') || challengeActive('Unbalance')) {
		const chal = challengeActive('Balance') ? game.challenges.Balance : game.challenges[game.global.challengeActive];
		currentCalc *= chal.getGatherMult();
		textString += "<tr><td class='bdTitle'>Strength (" + game.global.challengeActive + ")</td><td class='bdPercent'>+ " + chal.getGatherMult(true) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Decay')) {
		currentCalc *= 10;
		textString += "<tr><td class='bdTitle'>Sanity (Decay)</td><td class='bdPercent'>x 10</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
		const stackStr = Math.pow(game.challenges.Decay.decayValue, game.challenges.Decay.stacks);
		currentCalc *= stackStr;
		textString += "<tr style='color: red'><td class='bdTitle'>Decay</td><td class='bdPercent'>x " + stackStr.toFixed(3) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Melt')) {
		currentCalc *= 10;
		textString += "<tr><td class='bdTitle'>Sanity (Melt)</td><td class='bdPercent'>x 10</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
		const stackStr = Math.pow(game.challenges.Melt.decayValue, game.challenges.Melt.stacks);
		currentCalc *= stackStr;
		textString += "<tr style='color: red'><td class='bdTitle'>Melt</td><td class='bdPercent'>x " + stackStr.toFixed(3) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Watch')) {
		currentCalc /= 2;
		textString += "<tr style='color: red'><td class='bdTitle'>Sleepy (Watch)</td><td class='bdPercent'>50%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Lead') && game.global.world % 2 == 1) {
		currentCalc *= 2;
		textString += "<tr><td class='bdTitle'>Determined (Lead)</td><td class='bdPercent'>+ 100%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Archaeology') && what !== 'fragments') {
		const mult = game.challenges.Archaeology.getStatMult('science');
		const count = game.challenges.Archaeology.getPoints('science');
		const style = count < 0 ? " style='color: red'" : '';
		currentCalc *= mult;
		textString += '<tr' + style + "><td class='bdTitle'>Resource Relic</td><td class='bdPercent'>x " + prettify(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Insanity')) {
		const mult = game.challenges.Insanity.getLootMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Insane (Insanity)</td><td class='bdPercent'>+ " + (100 * (mult - 1)).toFixed(4) + "%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (game.challenges.Nurture.boostsActive() && what !== 'fragments') {
		const mult = game.challenges.Nurture.getResourceBoost();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Cruffys</td><td class='bdPercent'>" + formatMultAsPercent(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (game.global.pandCompletions && what !== 'fragments') {
		const mult = game.challenges.Pandemonium.getTrimpMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Pandemonium</td><td class='bdPercent'>" + formatMultAsPercent(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (game.global.desoCompletions && what !== 'fragments') {
		const mult = game.challenges.Desolation.getTrimpMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Desolation Completions</td><td class='bdPercent'>" + formatMultAsPercent(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Daily')) {
		let mult = 0;

		if (typeof game.global.dailyChallenge.dedication !== 'undefined') {
			mult = dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
			currentCalc *= mult;
			textString += "<tr><td class='bdTitle'>Dedicated (Daily)</td><td class='bdPercent'>+ " + prettify(mult * 100 - 100) + "%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
		}

		if (typeof game.global.dailyChallenge.famine !== 'undefined' && what !== 'fragments' && what !== 'science') {
			mult = dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
			currentCalc *= mult;
			textString += "<tr style='color: red'><td class='bdTitle'>Famine (Daily)</td><td class='bdPercent'>" + prettify(mult * 100) + "%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
		}
	}

	if (challengeActive('Hypothermia') && what === 'wood') {
		const mult = game.challenges.Hypothermia.getWoodMult(true);
		currentCalc *= mult;
		textString += "<tr style='color: red'><td class='bdTitle'>Hypothermia</td><td class='bdPercent'>x " + prettify(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Desolation')) {
		const mult = game.challenges.Desolation.trimpResourceMult();
		currentCalc *= mult;
		textString += "<tr style='color: red'><td class='bdTitle'>Desolation</td><td class='bdPercent'>x " + prettify(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (((what === 'food' || what === 'wood') && game.buildings.Antenna.owned >= 5) || (what === 'metal' && game.buildings.Antenna.owned >= 15)) {
		const mult = game.jobs.Meteorologist.getExtraMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Antenna Network</td><td class='bdPercent'>+ " + prettify((mult - 1) * 100) + "%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if ((what === 'food' || what === 'metal' || what === 'wood') && getParityBonus() > 1) {
		const mult = getParityBonus();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Parity (Staff)</td><td class='bdPercent'>+ " + prettify((mult - 1) * 100) + "%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if ((what === 'food' || what === 'metal' || what === 'wood') && autoBattle.oneTimers.Gathermate.owned && game.global.universe == 2) {
		const mult = autoBattle.oneTimers.Gathermate.getMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Gathermate</td><td class='bdPercent'>" + formatMultAsPercent(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (what !== 'fragments' && getEmpowerment() == 'Wind') {
		const windMod = game.empowerments.Wind.getCombatModifier();
		currentCalc *= 1 + windMod;
		textString += "<tr><td class='bdTitle'>Swiftness (Wind)</td><td class='bdPercent'>+ " + prettify(windMod * 100) + "%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	let heirloomBonus = calcHeirloomBonus('Staff', jobs[index] + 'Speed', 0, true);
	if (heirloomBonus > 0) {
		currentCalc *= heirloomBonus / 100 + 1;
		heirloomBonus = prettify(heirloomBonus) + '%';
		textString += "<tr><td class='bdTitle'>Heirloom (Staff)</td><td class='bdPercent'>+ " + heirloomBonus + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	//Add player
	if (game.global.playerGathering == what) {
		if ((game.talents.turkimp2.purchased || game.global.turkimpTimer > 0) && (what === 'food' || what === 'wood' || what === 'metal')) {
			let tBonus = 50;
			if (game.talents.turkimp2.purchased) tBonus = 100;
			currentCalc *= 1 + tBonus / 100;
			textString += "<tr><td class='bdTitle'>Sharing Food</td><td class='bdPercent'>+ " + tBonus + "%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
		}

		const playerStrength = getPlayerModifier();
		currentCalc += playerStrength;
		textString += "<tr><td class='bdTitle'>You</td><td class='bdPercent'>+ " + prettify(playerStrength) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	//Add Loot	ALWAYS LAST
	if (game.options.menu.useAverages.enabled) {
		const avg = getAvgLootSecond(what);
		if (avg > 0.001) {
			currentCalc += avg;
			textString += "<tr><td class='bdTitle'>Average Loot</td><td class='bdPercent'>+ " + prettify(avg) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
		}
	}
	if (rawNum) return currentCalc;
	textString += '</tbody></table>';
	game.global.lockTooltip = false;
	tooltip('confirm', null, 'update', textString, "getPsString('" + what + "')", what.charAt(0).toUpperCase() + what.substr(1, what.length) + ' Per Second', 'Refresh', true);
}

function getLootBd(what) {
	let map;
	let world;
	let level = '';
	let cell;

	if (game.global.mapsActive) {
		map = getCurrentMapObject();
		cell = game.global.lastClearedMapCell + 1;
		level = scaleLootLevel(cell, map.level);
		world = map.level;
	} else {
		cell = game.global.lastClearedCell + 1;
		level = scaleLootLevel(cell);
		world = game.global.world;
	}

	let textString = '	<div><ul id="lootBdTabs" class="nav nav-tabs nav-justified"><li role="presentation" onclick="getLootBd(\'Food/Wood/Metal\')"><a href="#">Food/Wood/Metal</a></li>';
	if (game.global.mapsUnlocked) textString += '<li role="presentation" onclick="getLootBd(\'Fragments\')"><a href="#">Fragments</a></li><li role="presentation" onclick="getLootBd(\'Gems\')"><a href="#">Gems</a></li>';
	if ((game.global.universe == 1 && game.global.world >= 20) || (game.global.universe == 2 && game.global.world > 15)) textString += '<li role="presentation" onclick="getLootBd(\'Helium\')"><a href="#">' + heliumOrRadon() + '</a></li>';
	textString += '</ul></div>';

	const name = what === 'Helium' ? heliumOrRadon() : what;
	textString += "<table class='bdTableSm table table-striped'><tbody><tr><td style='font-weight: bold; font-size: 1.1em'>" + name + '</td><td>Base</td><td>Amount</td><td>Line Total</td><td>Total</td></tr>';
	let currentCalc = 0;
	let amt = 0;

	switch (what) {
		case 'Food/Wood/Metal': {
			let tempModifier = 0.5 * Math.pow(1.25, game.global.world >= 59 && game.global.universe == 1 ? 59 : game.global.world);
			//Mega books
			if (game.global.world >= 60 && game.global.universe == 1) {
				if (game.global.frugalDone) tempModifier *= Math.pow(1.6, game.global.world - 59);
				else tempModifier *= Math.pow(1.5, game.global.world - 59);
			}
			//Bounty
			if (game.global.world >= 15) tempModifier *= 2;
			//Whipimp
			if (game.unlocks.impCount.Whipimp) tempModifier *= Math.pow(1.003, game.unlocks.impCount.Whipimp);

			if (game.global.world < 100) amt = tempModifier * 3.5;
			else amt = tempModifier * 5;
			amt = amt * 0.8 + amt * 0.002 * (cell + 1);
			currentCalc = amt;
			textString += "<tr><td class='bdTitle'>Base</td><td></td><td></td><td>" + prettify(amt) + '</td><td>' + prettify(currentCalc) + '</td></tr>';

			if ((game.talents.turkimp2.purchased || game.global.turkimpTimer > 0) && (game.global.playerGathering == 'food' || game.global.playerGathering == 'metal' || game.global.playerGathering == 'wood')) {
				//Average the bonus out amongst all 3 resources. I can't remember why turkimp2 is 1.249 instead of 1.25 but at this point I'm too scared to change it
				tBonus = 1.166;
				if (game.talents.turkimp2.purchased) tBonus = 1.333;
				currentCalc *= tBonus;
				textString += "<tr><td class='bdTitle'>Turkimp</td><td></td><td></td><td>+ " + prettify((tBonus - 1) * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
			}

			amt = game.resources.trimps.realMax() * 0.16;
			currentCalc *= amt;
			textString += "<tr><td class='bdTitle'>Trimps</td><td>0.16</td><td>" + prettify(game.resources.trimps.realMax()) + '</td><td>x ' + prettify(amt) + '</td><td>' + prettify(currentCalc) + '</td></tr>';
			break;
		}
		case 'Gems': {
			level = (level - 400) * 1.35;
			if (level < 0) {
				level = 0;
			}
			amt = Math.round(0.5 * Math.pow(1.23, Math.sqrt(level)));
			amt += Math.round(0.5 * level);
			amt = amt * 0.8 + amt * 0.002 * (cell + 1);
			currentCalc = amt;
			textString += "<tr><td class='bdTitle'>Base</td><td></td><td></td><td>" + prettify(amt) + '</td><td>' + prettify(currentCalc) + '</td></tr>';
			if (game.jobs.Dragimp.owned >= 1) {
				amt = 1.5 * game.jobs.Dragimp.modifier;
				amt = amt * 0.8 + amt * 0.002 * (cell + 1);
				currentCalc += amt;
				textString += "<tr><td class='bdTitle'>Dragimp Scouting</td><td></td><td></td><td>+ " + prettify(amt) + '</td><td>' + prettify(currentCalc) + '</td></tr>';
			}
			break;
		}
		case 'Fragments': {
			amt = Math.floor(Math.pow(1.15, game.global.world) * game.global.world * game.global.world * 0.02);
			currentCalc = amt;
			textString += "<tr><td class='bdTitle'>Base</td><td></td><td></td><td>" + prettify(amt) + '</td><td>' + prettify(currentCalc) + '</td></tr>';
			break;
		}
		case 'Helium': {
			level = scaleLootLevel(99);
			level = Math.round((level - 1900) / 100);
			level *= 1.35;
			if (level < 0) level = 0;
			let baseAmt;
			if (game.global.universe == 2 || game.global.world < 59 || (game.global.world == 59 && game.global.mapsActive)) baseAmt = 1;
			else if (game.global.world < mutations.Corruption.start(true)) baseAmt = 5;
			else baseAmt = 10;
			amt = baseAmt * Math.pow(1.23, Math.sqrt(level));
			amt += baseAmt * level;
			amt /= baseAmt;
			currentCalc = amt;
			textString += "<tr><td class='bdTitle'>Base</td><td></td><td></td><td>" + prettify(amt) + '</td><td>' + prettify(currentCalc) + '</td></tr>';
			if (baseAmt >= 5) {
				if (mutations.Magma.active()) {
					currentCalc *= 15;
					textString += "<tr><td class='bdTitle'>Omnipotrimp Bonus</td><td></td><td></td><td>x 15</td><td>" + prettify(currentCalc) + '</td></tr>';
				} else {
					currentCalc *= 5;
					textString += "<tr><td class='bdTitle'>Improbability Bonus</td><td></td><td></td><td>x 5</td><td>" + prettify(currentCalc) + '</td></tr>';
				}
			}

			if (baseAmt >= 10) {
				currentCalc *= 2;
				textString += "<tr><td class='bdTitle'>Corruption Bonus</td><td></td><td></td><td>x 2</td><td>" + prettify(currentCalc) + '</td></tr>';
			}
			if (getSLevel() >= 5) {
				amt = Math.pow(1.005, game.global.world);
				currentCalc *= amt;
				textString += "<tr><td class='bdTitle'>Scientist V</td><td></td><td></td><td>x " + prettify(amt) + '</td><td>' + prettify(currentCalc) + '</td></tr>';
			}
			if (game.goldenUpgrades.Helium.currentBonus > 0) {
				amt = game.goldenUpgrades.Helium.currentBonus;
				currentCalc *= 1 + amt;
				textString += "<tr><td class='bdTitle'>Golden " + heliumOrRadon() + '</td><td></td><td></td><td>+ ' + prettify(amt * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
			}
			if (game.talents.scry2.purchased && game.global.voidBuff && game.global.canScryCache) {
				currentCalc *= 1.5;
				textString += "<tr><td class='bdTitle'>Scryhard II</td><td></td><td></td><td>+ 50%</td><td>" + prettify(currentCalc) + '</td></tr>';
			}
			if (game.global.voidBuff) {
				currentCalc *= 2;
				textString += "<tr><td class='bdTitle'>Void Map</td><td></td><td></td><td>x 2</td><td>" + prettify(currentCalc) + '</td></tr>';
			}
			const fluffyBonus = Fluffy.isRewardActive('helium');
			if (fluffyBonus > 0) {
				currentCalc += currentCalc * (0.25 * fluffyBonus);
				textString += "<tr><td class='bdTitle'>" + Fluffy.getName() + ' ' + heliumOrRadon() + '</td><td>25%</td><td>' + fluffyBonus + '</td><td>+ ' + 25 * fluffyBonus + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
			}
			if (Fluffy.isRewardActive('radortle')) {
				amt = Fluffy.getRadortleMult();
				currentCalc *= amt;
				textString += "<tr><td class='bdTitle'>" + Fluffy.getName() + ' ' + heliumOrRadon() + '</td><td>x 1.03</td><td>' + game.global.lastRadonPortal + '</td><td>+ ' + prettify((amt - 1) * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
			}
			if (game.jobs.Meteorologist.vestedHires > 0) {
				amt = game.jobs.Meteorologist.getMult();
				const pct = 1 + 0.05 * game.buildings.Antenna.owned;
				currentCalc *= amt;
				textString += "<tr><td class='bdTitle'>Meteorologists</td><td>" + prettify(pct) + '%</td><td>' + game.jobs.Meteorologist.vestedHires + '</td><td>+ ' + prettify(pct * game.jobs.Meteorologist.vestedHires) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
			}
			if (challengeActive('Quest') && game.challenges.Quest.questComplete) {
				currentCalc *= 2;
				textString += "<tr><td class='bdTitle'>Completed Quest!</td><td>+ 100%</td><td>&nbsp;</td><td>+ 100%</td><td>" + prettify(currentCalc) + '</td></tr>';
			}
			if (challengeActive('Archaeology')) {
				const points = game.challenges.Archaeology.getPoints('radon');
				const mult = game.challenges.Archaeology.getStatMult('radon');
				currentCalc *= mult;
				textString += "<tr><td class='bdTitle'>Radon Relic</td><td>x 1.05</td><td>" + points + '</td><td>x ' + prettify(mult) + '</td><td>' + prettify(currentCalc) + '</td></tr>';
			}
			if (game.global.universe == 2 && game.global.glassDone && game.global.world > 175) {
				var useGlassWorld = game.global.world > 400 ? 400 : game.global.world;
				var mult = Math.pow(1.1, useGlassWorld - 175);
				currentCalc *= mult;
				textString += "<tr><td class='bdTitle'>Advanced Processing (Glass)</td><td>x 1.1</td><td>" + (useGlassWorld  - 175) + '</td><td>x ' + prettify(mult) + '</td><td>' + prettify(currentCalc) + '</td></tr>';
			}
			if (game.global.universe == 2 && game.global.world >= 201) {
				let mult = 400;
				if (u2Mutations.tree.AllRadon.purchased) mult *= 1.5;
				currentCalc *= mult;
				textString += "<tr><td class='bdTitle'>Mutated Zone</td><td>x " + mult + '</td><td></td><td>x ' + mult + '</td><td>' + prettify(currentCalc) + '</td></tr>';
			}
		}
	}

	if (game.global.mapsActive && what !== 'Helium') {
		let compareLv = game.global.world;
		if (world > compareLv && map.location !== 'Bionic') {
			amt = Math.pow(1.1, world - compareLv);
			currentCalc *= amt;
			textString += "<tr><td class='bdTitle'>Extra Map Zones</td><td>+10%</td><td>x " + (world - compareLv) + '</td><td>+ ' + prettify((amt - 1) * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
		} else {
			if (game.talents.mapLoot.purchased) compareLv--;
			if (world < compareLv) {
				//-20% loot compounding for each level below world
				amt = Math.pow(0.8, compareLv - world);
				currentCalc *= amt;
				textString += "<tr style='color: red'><td class='bdTitle'>Low Map Level</td><td>-20%</td><td>" + (compareLv - world) + '</td><td>x ' + prettify(amt) + '</td><td>' + prettify(currentCalc) + '</td></tr>';
			}
		}
		//Add map loot bonus
		currentCalc = Math.round(currentCalc * map.loot);
		textString += "<tr><td class='bdTitle'>Map Loot</td><td></td><td></td><td>+ " + Math.round((map.loot - 1) * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Insanity')) {
		const mult = game.challenges.Insanity.getLootMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Insane (Insanity)</td><td>+ 13.13%</td><td>" + game.challenges.Insanity.insanity + '</td><td>x ' + mult.toFixed(4) + '</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (game.challenges.Nurture.boostsActive() && what !== 'Helium') {
		const mult = game.challenges.Nurture.getResourceBoost();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Cruffys</td><td>Lv " + game.challenges.Nurture.getLevel() + '</td><td></td><td>' + formatMultAsPercent(mult) + '</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (getPerkLevel('Looting')) {
		amt = 1 + getPerkLevel('Looting') * game.portal.Looting.modifier;
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Looting (perk)</td><td>+ 5%</td><td>" + getPerkLevel('Looting') + '</td><td>+ ' + prettify((amt - 1) * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (getPerkLevel('Looting_II')) {
		amt = 1 + getPerkLevel('Looting_II') * game.portal.Looting_II.modifier;
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Looting II (perk)</td><td>+ " + prettify(game.portal.Looting_II.modifier * 100) + '%</td><td>' + prettify(getPerkLevel('Looting_II')) + '</td><td>+ ' + prettify((amt - 1) * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (getPerkLevel('Greed')) {
		amt = game.portal.Greed.getMult();
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Greed (perk)</td><td>x" + ' ' + prettify(game.portal.Greed.getBonusAmt()) + '</td><td>' + (getPerkLevel('Greed') + getPerkLevel('Masterfulness')) + '</td><td>+ ' + prettify((amt - 1) * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	let potionFinding = challengeActive('Alchemy') ? alchObj.getPotionEffect('Potion of Finding') : '';
	if (what !== 'Helium' && what !== 'Fragments' && potionFinding > 1) {
		currentCalc *= potionFinding;
		textString += "<tr><td class='bdTitle'>Potion of Finding</td><td>+ 25%</td><td>" + alchObj.getPotionCount('Potion of Finding') + '</td><td>+ ' + prettify((potionFinding - 1) * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	potionFinding = alchObj.getPotionEffect('Elixir of Finding');
	if (what !== 'Helium' && what !== 'Fragments' && potionFinding > 1) {
		currentCalc *= potionFinding;
		textString += "<tr><td class='bdTitle'>Elixir of Finding</td><td>x 1.05</td><td>" + alchObj.getPotionCount('Elixir of Finding') + '</td><td>+ ' + prettify((potionFinding - 1) * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	const gaseousPotion = alchObj.getRadonMult();
	if (what === 'Helium' && gaseousPotion > 1) {
		currentCalc *= gaseousPotion;
		textString += "<tr><td class='bdTitle'>Gaseous Brew</td><td>+ 10%</td><td>" + alchObj.getPotionCount('Gaseous Brew') + '</td><td>+ ' + prettify((gaseousPotion - 1) * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Quagmire')) {
		amt = game.challenges.Quagmire.getLootMult();
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Motivated (Quagmire)</td><td>+ 40%</td><td>" + game.challenges.Quagmire.motivatedStacks + '</td><td>+ ' + prettify((amt - 1) * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (Fluffy.isRewardActive('wealthy') && what !== 'Helium') {
		currentCalc *= 2;
		textString += "<tr><td class='bdTitle'>Wealthy (" + Fluffy.getName() + ')</td><td>+ 100%</td><td>&nbsp;</td><td>+ 100%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (game.unlocks.impCount.Magnimp && what !== 'Helium') {
		amt = Math.pow(1.003, game.unlocks.impCount.Magnimp);
		currentCalc = Math.floor(currentCalc * amt);
		textString += "<tr><td class='bdTitle'>Magnimp</td><td>+ 0.3%</td><td>" + game.unlocks.impCount.Magnimp + '</td><td>+ ' + prettify((amt - 1) * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Toxicity')) {
		let toxMult = (game.challenges.Toxicity.lootMult * game.challenges.Toxicity.stacks) / 100;
		currentCalc *= 1 + toxMult;
		toxMult = (toxMult * 100).toFixed(1) + '%';
		textString += "<tr><td class='bdTitle'>Tweaky (Toxicity)</td><td>+" + game.challenges.Toxicity.lootMult + '%</td><td>' + game.challenges.Toxicity.stacks + '</td><td>+ ' + toxMult + '</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Decay') && what !== 'Helium') {
		currentCalc *= 10;
		textString += "<tr><td class='bdTitle'>Sanity (Decay)</td><td></td><td></td><td class='bdPercent'>x 10</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
		const stackStr = Math.pow(game.challenges.Decay.decayValue, game.challenges.Decay.stacks);
		currentCalc *= stackStr;
		textString += "<tr style='color: red'><td class='bdTitle'>Decay</td><td>x 0.995</td><td>" + game.challenges.Decay.stacks + "</td><td class='bdPercent'>x " + stackStr.toFixed(3) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Melt') && what !== 'Helium') {
		currentCalc *= 10;
		textString += "<tr><td class='bdTitle'>Sanity (Melt)</td><td></td><td></td><td class='bdPercent'>x 10</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
		const stackStr = Math.pow(game.challenges.Melt.decayValue, game.challenges.Melt.stacks);
		currentCalc *= stackStr;
		textString += "<tr style='color: red'><td class='bdTitle'>Melt</td><td>x 0.99</td><td>" + game.challenges.Melt.stacks + "</td><td class='bdPercent'>x " + stackStr.toFixed(3) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Watch') && what !== 'Helium') {
		currentCalc /= 2;
		textString += "<tr style='color: red'><td class='bdTitle'>Sleepy (Watch)</td><td></td><td></td><td class='bdPercent'>50%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Lead') && game.global.world % 2 === 1) {
		currentCalc *= 2;
		textString += "<tr><td class='bdTitle'>Determined (Lead)</td><td></td><td></td><td class='bdPercent'>+ 100%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.famine !== 'undefined' && what !== 'Fragments' && what !== 'Helium') {
			mult = dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
			currentCalc *= mult;
			textString += "<tr style='color: red'><td class='bdTitle'>Famine (Daily)</td><td class='bdPercent'>" + prettify(mult * 100) + '%</td><td></td><td>' + prettify(mult * 100) + "%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
		}
		if (typeof game.global.dailyChallenge.karma !== 'undefined' && what !== 'Helium') {
			mult = dailyModifiers.karma.getMult(game.global.dailyChallenge.karma.strength, game.global.dailyChallenge.karma.stacks);
			currentCalc *= mult;
			textString += "<tr><td class='bdTitle'>Karma (Daily)</td><td class='bdPercent'>x  " + mult.toFixed(3) + '</td><td></td><td>x  ' + mult.toFixed(3) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
		}
	}

	if (challengeActive('Archaeology') && what !== 'Helium' && what !== 'Fragments') {
		const points = game.challenges.Archaeology.getPoints('science');
		const mult = game.challenges.Archaeology.getStatMult('science');
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Resource Relic</td><td>x 1.05</td><td>" + points + '</td><td>x ' + prettify(mult) + '</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (game.global.spireRows > 0) {
		const spireRowBonus = game.talents.stillRowing.purchased ? 0.03 : 0.02;
		amt = game.global.spireRows * spireRowBonus;
		currentCalc *= 1 + amt;
		textString += "<tr><td class='bdTitle'>Spire Rows</td><td>+ " + Math.round(spireRowBonus * 100) + '%</td><td>' + game.global.spireRows + '</td><td>+ ' + prettify(amt * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (game.global.voidBuff && what === 'Helium' && game.talents.voidSpecial.purchased) {
		amt = getLastPortal() * 0.0025;
		currentCalc *= 1 + amt;
		textString += "<tr><td class='bdTitle'>Void Special</td><td></td><td></td><td>+ " + prettify(amt * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (what !== 'Fragments' && getEmpowerment() == 'Wind' && (what !== 'Helium' || !game.global.mapsActive)) {
		let windMod;
		let baseMod = 0;
		if (what === 'Helium') {
			windMod = game.empowerments.Wind.getCombatModifier(true);
			baseMod = game.empowerments.Wind.getModifier(0, true);
		} else {
			windMod = game.empowerments.Wind.getCombatModifier();
			baseMod *= game.empowerments.Wind.getModifier();
		}
		baseMod *= 100;
		currentCalc *= 1 + windMod;
		textString += "<tr><td class='bdTitle'>Swiftness (Wind)</td><td>" + prettify(baseMod) + '%</td><td>' + prettify(game.empowerments.Wind.currentDebuffPower) + "</td><td class='bdPercent'>+ " + prettify(windMod * 100) + "%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (what !== 'Helium' && isScryerBonusActive()) {
		currentCalc *= 2;
		textString += "<tr><td class='bdTitle'>Formation</td><td></td><td></td><td>x 2</td><td>" + prettify(currentCalc) + '</td></tr>';
	}

	if (getUberEmpowerment() == 'Wind' && what !== 'Helium' && what !== 'Fragments') {
		currentCalc *= 10;
		textString += "<tr><td class='bdTitle'>Enlightened Wind</td><td></td><td></td><td>x 10</td><td>" + prettify(currentCalc) + '</td></tr>';
	}

	if (game.global.totalSquaredReward > 0 && what === 'Helium') {
		amt = game.global.totalSquaredReward / 1000;
		currentCalc *= amt + 1;
		const c2Name = game.global.highestRadonLevelCleared < 49 ? '2' : "<span class='icomoon icon-infinity'></span>";
		textString += "<tr><td class='bdTitle'>Challenge<sup>" + c2Name + '</sup> Reward</td><td></td><td></td><td>+ ' + prettify(amt * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (what === 'Helium' && playerSpireTraps.Condenser.owned) {
		amt = playerSpireTraps.Condenser.getWorldBonus();
		currentCalc *= 1 + amt / 100;
		textString += "<tr><td class='bdTitle'>Condenser Tower" + needAnS(playerSpireTraps.Condenser.owned) + '</td><td>+ ' + prettify(playerSpireTraps.Condenser.getWorldBonus(true)) + '%</td><td>' + playerSpireTraps.Condenser.owned + '</td><td>+' + prettify(amt) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (game.singleRunBonuses.heliumy.owned && what === 'Helium') {
		currentCalc *= 1.25;
		textString += "<tr><td class='bdTitle'>" + game.singleRunBonuses.heliumy.name + '</td><td>25%</td><td></td><td>+ 25%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (game.global.frigidCompletions > 0 && game.global.universe == 1 && what === 'Helium') {
		amt = game.challenges.Frigid.getTrimpMult();
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Frigid Completions</td><td>+ 2.5N%</td><td>" + game.global.frigidCompletions + '</td><td>+ ' + prettify((amt - 1) * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (game.global.mayhemCompletions > 0 && what === 'Helium') {
		amt = game.challenges.Mayhem.getTrimpMult();
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Mayhem Completions</td><td>+ 10N%</td><td>" + game.global.mayhemCompletions + '</td><td>+ ' + prettify((amt - 1) * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (game.global.pandCompletions > 0 && what === 'Helium') {
		amt = game.challenges.Pandemonium.getTrimpMult();
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Pandemonium Completions</td><td>+ 10N%</td><td>" + game.global.pandCompletions + '</td><td>+ ' + prettify((amt - 1) * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (game.global.desoCompletions > 0 && what === 'Helium') {
		amt = game.challenges.Desolation.getTrimpMult();
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Desolation Completions</td><td>+ 10N%</td><td>" + game.global.desoCompletions + '</td><td>+ ' + prettify((amt - 1) * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (autoBattle.bonuses.Radon.level > 0 && game.global.universe == 2 && what === 'Helium') {
		amt = autoBattle.bonuses.Radon.getMult();
		currentCalc *= amt;
		textString += "<tr><td class='bdTitle'>Spire Assault Radon</td><td>+ 10%</td><td>" + autoBattle.bonuses.Radon.level + '</td><td>+ ' + prettify((amt - 1) * 100) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Hypothermia') && what === 'Food/Wood/Metal') {
		const mult = game.challenges.Hypothermia.getWoodMult();
		if (mult != 1) {
			currentCalc *= mult;
			textString += "<tr style='color: red'><td class='bdTitle'>Hypothermia (Wood only)</td><td class='bdPercent'>x0.95</td><td>" + game.challenges.Hypothermia.embers + '</td><td>x ' + prettify(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
		}
	}

	if (challengeActive('Desolation') && what !== 'Helium') {
		const mult = game.challenges.Desolation.trimpResourceMult();
		currentCalc *= mult;
		textString += "<tr style='color: red'><td class='bdTitle'>Desolation</td><td>-" + game.challenges.Desolation.getReducePercent() * 100 + '%</td><td>' + (game.global.world - 1) + "</td><td class='bdPercent'>x " + prettify(mult) + "</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	if (game.global.universe == 2 && u2Mutations.tree.Loot.purchased && what !== 'Helium') {
		currentCalc *= 1.5;
		textString += "<tr><td class='bdTitle'>Loot Mutator</td><td>+ 50%</td><td></td><td>+ 50%</td><td>" + prettify(currentCalc) + '</td></tr>';
	}

	if (challengeActive('Hypothermia') && what === 'Helium') {
		const mult = game.challenges.Hypothermia.getRadonMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Hypothermia</td><td class='bdPercent'>+300%</td><td>" + game.challenges.Hypothermia.embers + '</td><td>+ ' + prettify((mult - 1) * 100) + "%</td><td class='bdNumber'>" + prettify(currentCalc) + '</td></tr>';
	}

	//Cruffys
	if (challengeActive('Nurture') && what === 'Helium') {
		const mult = game.challenges.Nurture.getRadonMult();
		currentCalc *= mult;
		textString += "<tr><td class='bdTitle'>Cruffys</td><td>Lv " + game.challenges.Nurture.getLevel() + '</td><td></td><td>x ' + prettify(mult) + '</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	//Bonus from Domination challenge, keep right above Corruption/Healthy stuff, as regular boss bonus does not affect it
	if (challengeActive('Domination') && what === 'Helium') {
		textString += "<tr><td class='bdTitle'>Domination (Boss Only)</td><td>x 3</td><td></td><td>x 3</td><td>" + prettify(currentCalc * 3) + '</td></tr>';
		if (game.global.voidBuff) currentCalc *= 3;
	}

	//Corruption - World
	let fullCorVal = currentCalc;
	if (what === 'Helium' && !game.global.voidBuff && game.global.world >= mutations.Corruption.start()) {
		const corrVal = challengeActive('Corrupted') ? 7.5 : 15;
		let corrCount = mutations.Corruption.cellCount();
		if (mutations.Healthy.active()) corrCount -= mutations.Healthy.cellCount();
		const corrCalc = (corrVal / 100) * currentCalc;
		fullCorVal = currentCalc + corrCalc * corrCount;
		textString += "<tr class='corruptedCalcRow'><td class='bdTitle' style='vertical-align: middle'>Corruption Value</td><td>" + corrVal + '%<br/>' + corrCount + ' Cells</td><td>Per Cell:<br/>' + prettify(corrCalc) + '</td><td>Per Zone:<br/>' + prettify(Math.round(corrCalc * corrCount)) + "</td><td style='vertical-align: middle'>" + prettify(fullCorVal) + '</td></tr>';
		//<tr><td class='bdTitle'>Total Per Zone</td><td></td><td></td><td></td><td>" + prettify(currentCalc + (corrCalc * corrVal)) + "</td></tr>
	}

	//Healthy - World
	if (what === 'Helium' && mutations.Healthy.active() && !game.global.voidBuff) {
		const healthyCount = mutations.Healthy.cellCount();
		let healthyVal = 45;
		if (game.talents.healthStrength2.purchased) healthyVal = 65;
		const healthyCalc = (healthyVal / 100) * currentCalc;
		textString += "<tr class='healthyCalcRow'><td class='bdTitle' style='vertical-align: middle'>Healthy Value</td><td>" + healthyVal + '%<br/>' + healthyCount + ' Cells</td><td>Per Cell:<br/>' + prettify(healthyCalc) + '</td><td>Per Zone:<br/>' + prettify(Math.round(healthyCalc * healthyCount)) + "</td><td style='vertical-align: middle'>" + prettify(fullCorVal + healthyCalc * healthyCount) + '</td></tr>';
	}

	//Healthy - Void Maps
	if (what === 'Helium' && game.global.voidBuff && mutations.Corruption.active()) {
		let corruptedCells = mutations.Corruption.cellCount();
		if (mutations.Healthy.active()) corruptedCells -= mutations.Healthy.cellCount();
		const corrVal = challengeActive('Corrupted') ? 7.5 : 15;
		let percent = (corrVal / 100) * corruptedCells;

		if (mutations.Healthy.active()) {
			textString += "<tr class='corruptedCalcRow mutationSumRow'><td class='bdTitle'>Corruption Value</td><td>" + corrVal + '%</td><td>' + corruptedCells + '</td><td>+ ' + prettify(Math.round(percent * 100)) + '%</td><td></td></tr>';
			const healthyCells = mutations.Healthy.cellCount();
			let healthyVal = 45;
			if (game.talents.healthStrength2.purchased) healthyVal = 65;
			const healthyPercent = (healthyVal / 100) * healthyCells;
			textString += "<tr class='healthyCalcRow mutationSumRow'><td class='bdTitle'>Healthy Value</td><td>" + healthyVal + '%</td><td>' + healthyCells + '</td><td>+ ' + prettify(Math.round(healthyPercent * 100)) + '%</td><td></td></tr>';
			const mutationPercent = percent + healthyPercent;
			currentCalc *= mutationPercent + 1;
			textString += "<tr class='mutationSumRow mutationTotalRow'><td class='bdTitle'>Mutation Total</td><td></td><td>" + (healthyCells + corruptedCells) + '</td><td>+ ' + prettify(Math.round(mutationPercent * 100)) + '%</td><td>' + prettify(currentCalc) + '</td></tr>';
		} else {
			percent++;
			currentCalc *= percent;
			textString += "<tr class='corruptedCalcRow'><td class='bdTitle'>Corruption Value</td><td>" + corrVal + '%</td><td>' + corruptedCells + '</td><td>x ' + prettify(percent) + '</td><td>' + prettify(currentCalc) + '</td></tr>';
		}
	}

	if (what === 'Helium' && game.global.mapsActive && game.global.voidBuff && map.stacked >= 1) {
		const stacks = map.stacked;
		const maxStacks = Fluffy.getVoidStackCount() - 1;
		const countedStacks = stacks > maxStacks ? maxStacks : stacks;
		let bonusMod = 1 + 0.5 * countedStacks;
		if (game.talents.voidMastery.purchased) bonusMod = Math.pow(1.5, countedStacks);
		const flatBonus = currentCalc * bonusMod * stacks;
		currentCalc += flatBonus;
		textString += "<tr class='fluffyCalcRow'><td class='bdTitle'>Stacked Map" + needAnS(stacks) + ' (Fluffy)</td><td>+ ' + prettify((bonusMod - 1) * 100) + '%</td><td>' + stacks + ' extra</td><td>+ ' + prettify(flatBonus) + '</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (game.global.runningChallengeSquared && what === 'Helium') {
		currentCalc = 0;
		const cMode = game.global.universe == 1 ? 2 : 3;
		textString += "<tr class='colorSquared'><td class='bdTitle'>Challenge<sup>" + cMode + '</sup></td><td></td><td></td><td>0%</td><td>' + prettify(currentCalc) + '</td></tr>';
	}

	if (game.global.universe === 2 && what === 'Helium') {
		const cellCredit = u2SpireBonuses.cellCredit();
		if (cellCredit > 0) {
			amt = u2SpireBonuses.basics();
			currentCalc *= amt;
			textString += "<tr><td class='bdTitle'>Stuffy's Spire</td><td></td><td>" + cellCredit + '</td><td>x ' + prettify(amt) + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + '</td></tr>';
		}
	}

	//Heirloom bonuses last, since food/wood/metal mults can be different
	let heirloomBonus = 0;
	if (what === 'Food/Wood/Metal') {
		heirloomBonus = calcHeirloomBonus('Staff', 'foodDrop', 0, true);
		if (heirloomBonus > 0) {
			textString += "<tr><td class='bdTitle'>Heirloom - Food (Staff)</td><td></td><td></td><td>+ " + prettify(heirloomBonus) + '%</td><td>' + prettify(currentCalc * (heirloomBonus / 100 + 1)) + '</td></tr>';
			heirloomBonus = 0;
		}
		heirloomBonus = calcHeirloomBonus('Staff', 'woodDrop', 0, true);
		if (heirloomBonus > 0) {
			textString += "<tr><td class='bdTitle'>Heirloom - Wood (Staff)</td><td></td><td></td><td>+ " + prettify(heirloomBonus) + '%</td><td>' + prettify(currentCalc * (heirloomBonus / 100 + 1)) + '</td></tr>';
			heirloomBonus = 0;
		}
		heirloomBonus = calcHeirloomBonus('Staff', 'metalDrop', 0, true);
		if (heirloomBonus > 0) {
			textString += "<tr><td class='bdTitle'>Heirloom - Metal (Staff)</td><td></td><td></td><td>+ " + prettify(heirloomBonus) + '%</td><td>' + prettify(currentCalc * (heirloomBonus / 100 + 1)) + '</td></tr>';
			heirloomBonus = 0;
		}
	} else if (what === 'Fragments') {
		heirloomBonus = calcHeirloomBonus('Staff', 'fragmentsDrop', 0, true);
		if (heirloomBonus > 0) {
			textString += "<tr><td class='bdTitle'>Heirloom (Staff)</td><td></td><td></td><td>+ " + prettify(heirloomBonus) + '%</td><td>' + prettify(currentCalc * (heirloomBonus / 100 + 1)) + '</td></tr>';
			heirloomBonus = 0;
		}
	} else if (what === 'Gems') {
		heirloomBonus = calcHeirloomBonus('Staff', 'gemsDrop', 0, true);
		if (heirloomBonus > 0) {
			textString += "<tr><td class='bdTitle'>Heirloom (Staff)</td><td></td><td></td><td>+ " + prettify(heirloomBonus) + '%</td><td>' + prettify(currentCalc * (heirloomBonus / 100 + 1)) + '</td></tr>';
			heirloomBonus = 0;
		}
	}

	textString += '</tbody></table>';
	game.global.lockTooltip = false;
	tooltip('confirm', null, 'update', textString, "getLootBd('" + what + "')", name + ' Loot Breakdown', 'Refresh', true);
	verticalCenterTooltip();
}

function rewardU2Spire(level) {
	const totalCells = 100 * (game.global.spireLevel - 1) + level;
	let increase = u2SpireBonuses.basics();

	if (game.global.u2SpireCells < totalCells) {
		game.global.u2SpireCells = totalCells;
	}

	if (game.global.u2SpireCellsBest < totalCells || totalCells === 1000) {
		game.global.u2SpireCellsBest = totalCells;
		increase = u2SpireBonuses.basics() / increase;
		addSoldierHealth(increase - 1);
	}

	const text = getSpireStory('U21', totalCells);
	if (text === '') return;

	if (totalCells === 100) {
		for (let x = 0; x < 4; x++) {
			createHeirloom(300, false, false, true);
		}
	}

	message(text, 'Story');
}
