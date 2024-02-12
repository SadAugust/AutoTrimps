//Override for the Atlantrimp fire function to add Surky respec
function atlantrimpRespecOverride() {
	if (typeof game.mapUnlocks.AncientTreasure.originalFire !== 'undefined') return;
	//Add Surky respec to Trimple/Atlantrimp map completion
	game.mapUnlocks.AncientTreasure.originalFire = game.mapUnlocks.AncientTreasure.fire;

	game.mapUnlocks.AncientTreasure.fire = function () {
		game.mapUnlocks.AncientTreasure.originalFire(...arguments);
		try {
			atlantrimpRespecMessage(true);
		} catch (e) {
			console.log('Loading respec function failed! ' + e, 'other');
		}
	};
}

//Runs when AT initially loads
atlantrimpRespecOverride();

// On loading save
var originalLoad = load;
load = function () {
	resetLoops();
	originalLoad(...arguments);
	try {
		loadAugustSettings();
		atlantrimpRespecOverride();
		resetVarsZone(true);
		if (typeof MODULES['graphs'].themeChanged === 'function') MODULES['graphs'].themeChanged();
		updateAutoTrimpSettings(true);
	} catch (e) {
		debug(`Load save failed: ${e}`);
	}
};

// On portal/game reset
var originalresetGame = resetGame;
resetGame = function () {
	originalresetGame(...arguments);
	try {
		atlantrimpRespecOverride();
	} catch (e) {
		debug(`Load save failed: ${e}`);
	}
};

//Hacky way to allow the SA popup button to work within TW.
autoBattle.originalpopup = autoBattle.popup;
autoBattle.popup = function () {
	const offlineMode = usingRealTimeOffline;
	usingRealTimeOffline = false;
	autoBattle.originalpopup(...arguments);
	usingRealTimeOffline = offlineMode;
};

//Attach AT related buttons to the main TW UI.
//Will attach AutoMaps, AutoMaps Status, AutoTrimps Settings, AutoJobs, AutoStructure
offlineProgress.originalStart = offlineProgress.start;
offlineProgress.start = function () {
	const trustWorthy = game.options.menu.offlineProgress.enabled;
	if (game.options.menu.offlineProgress.enabled === 1) game.options.menu.offlineProgress.enabled = 2;
	offlineProgress.originalStart(...arguments);
	toggleCatchUpMode();
	while (game.options.menu.offlineProgress.enabled !== trustWorthy) toggleSetting('offlineProgress');
	try {
		const offlineTime = offlineProgress.totalOfflineTime / 1000 - 86400;
		if (offlineTime > 0) {
			game.global.portalTime += offlineTime;
			if (getZoneSeconds() >= offlineTime) game.global.zoneStarted += offlineTime;
		}
		if (typeof _setTimeWarpUI === 'function') _setTimeWarpUI();
	} catch (e) {
		console.log('Loading Time Warp failed ' + e, 'other');
	}
};

//Try to restart TW once it finishes to ensure we don't miss out on time spent running TW.
offlineProgress.originalFinish = offlineProgress.finish;
offlineProgress.finish = function () {
	const offlineTime = arguments[0] ? 0 : offlineProgress.totalOfflineTime / 1000 - 86400;
	let timeRun = arguments[0] ? 0 : (new Date().getTime() - offlineProgress.startTime) / 1000;
	timeRun += Math.max(0, offlineTime);
	if (game.options.menu.autoSave.enabled !== atSettings.autoSave) toggleSetting('autoSave');
	offlineProgress.originalFinish(...arguments);
	try {
		//Rerun TW if it took over 30 seconds to complete
		if (timeRun > 30) {
			debug(`Running Time Warp again for ${offlineProgress.formatTime(Math.min(timeRun, offlineProgress.maxTicks / 10))} to catchup on the time you missed whilst running it.`);
			//Convert time to milliseconds and subtract it from the variables that TW uses to calculate offline progress so we don't have tons of time related issues.
			timeRun *= 1000;

			const keys = ['lastOnline', 'portalTime', 'zoneStarted', 'lastSoldierSentAt', 'lastSkeletimp', 'lastChargeAt'];
			_adjustGlobalTimers(keys, -timeRun);

			offlineProgress.start();
			if (typeof _setupTimeWarpAT === 'function') _setupTimeWarpAT();
		} else if (game.options.menu.autoSave.enabled !== atSettings.autoSave) toggleSetting('autoSave');
	} catch (e) {
		console.log('Failed to restart Time Warp to finish it off. ' + e, 'other');
	}
};

//Add misc functions onto the button to activate portals so that if a user wants to manually portal they can without losing the AT features.
originalActivateClicked = activateClicked;
activateClicked = function () {
	downloadSave(true);
	if (typeof pushData === 'function') pushData();
	if (!MODULES.portal.dontPushData) pushSpreadsheetData();
	autoUpgradeHeirlooms();
	autoHeirlooms(true);
	autoMagmiteSpender(true);
	originalActivateClicked(...arguments);
	resetVarsZone(true);
	_setButtonsPortal();
	if (u2Mutations.open && getPageSetting('presetSwapMutators', 2)) {
		loadMutations(preset);
		u2Mutations.closeTree();
	}
};

originalCheckAchieve = checkAchieve;
checkAchieve = function () {
	if (arguments && arguments[0] === 'totalMaps') {
		const mapObj = getCurrentMapObject();
		mapObj.clears++;
	}
	originalCheckAchieve(...arguments);
};

//Add misc functions onto the button to activate portals so that if a user wants to manually portal they can without losing the AT features.
originalFadeIn = fadeIn;
fadeIn = function () {
	if (arguments[0] === 'pauseFight' && getPageSetting('displayHideFightButtons')) return;
	originalFadeIn(...arguments);
};

//Runs a map WITHOUT resetting the mapRunCounter variable so that we can have an accurate count of how many maps we've run
//Check and update each patch!
function runMap_AT() {
	if (game.options.menu.pauseGame.enabled) return;
	if (game.global.lookingAtMap === '') return;
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
	var mapId = game.global.lookingAtMap;
	game.global.preMapsActive = false;
	game.global.mapsActive = true;
	game.global.currentMapId = mapId;
	mapsSwitch(true);
	var mapObj = getCurrentMapObject();
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

//Check and update each patch!
function suicideTrimps() {
	//Throw this in so that if GS updates anything in there it won't cause AT to fuck with it till I can check it out
	//Check out mapsClicked(confirmed) && mapsSwitch(updateOnly, fromRecycle) patch notes for any changes to this section!
	if (game.global.stringVersion > '5.9.5') {
		mapsClicked();
		return;
	}

	if (game.resources.trimps.soldiers > 0) {
		game.global.soldierHealth = 0;
		game.stats.trimpsKilled.value += game.resources.trimps.soldiers;
		game.stats.battlesLost.value++;
		game.resources.trimps.soldiers = 0;
	}

	if (challengeActive('Berserk')) game.challenges.Berserk.trimpDied();
	if (challengeActive('Exterminate')) game.challenges.Exterminate.trimpDied();
	if (getPerkLevel('Frenzy')) game.portal.Frenzy.trimpDied();
	if (challengeActive('Storm')) {
		game.challenges.Storm.alpha = 0;
		game.challenges.Storm.drawStacks();
	}
	if (game.global.novaMutStacks > 0) u2Mutations.types.Nova.drawStacks();
	if (challengeActive('Smithless')) game.challenges.Smithless.drawStacks();

	game.global.mapCounterGoal = 0;
	game.global.titimpLeft = 0;
	game.global.fighting = false;
	game.global.switchToMaps = false;
	game.global.switchToWorld = false;
	game.global.mapsActive = false;
	updateGammaStacks(true);
	resetEmpowerStacks();
}

//Check and update each patch!
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

	if (usingRealTimeOffline && loops % 600 !== 0) return;

	updateGeneratorFuel();

	const generatorTrimps = document.getElementById('generatorTrimpsPs');
	const nextTickAmount = getGeneratorTickAmount();
	const generatorTrimpsText = prettify(scaleNumberForBonusHousing(nextTickAmount));
	if (generatorTrimps.innerHTML !== generatorTrimpsText.toString()) generatorTrimps.innerHTML = generatorTrimpsText;

	const totalMi = document.getElementById('upgradeMagmiteTotal');
	const totalMiText = `${prettify(game.global.magmite)} Mi`;
	if (totalMi.innerHTML !== totalMiText.toString()) totalMi.innerHTML = totalMiText;
}

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

//Check and update each patch!
function drawAllUpgrades(force) {
	if ((usingRealTimeOffline || (liquifiedZone() && !game.global.mapsActive)) && !force) return;

	const upgrades = game.upgrades;
	const elem = document.getElementById('upgradesHere');
	let innerHTML = '';
	let alert = false;

	for (const item in upgrades) {
		if (upgrades[item].locked === 1) continue;
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

function drawUpgrade(what) {
	const alertMessage = what.alert && game.options.menu.showAlerts.enabled ? '!' : '';
	const upgrade = game.upgrades[what];
	if (upgrade.prestiges && (!upgrade.cost.resources[metal] || !upgrade.cost.resources[wood])) {
		const resName = what == 'Supershield' ? 'wood' : 'metal';
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

//Check and update each patch!
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

//Check and update each patch!
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

	for (let x = 0; x < toDrop.length; x++) {
		unlockUpgrade(toDrop[x]);
		let prestigeUnlock = game.mapUnlocks[toDrop[x]];
		if (getSLevel() >= 4 && !challengeActive('Mapology') && Math.ceil(prestigeUnlock.last / 5) % 2 == 0) {
			unlockUpgrade(toDrop[x]);
			prestigeUnlock.last += 10;
		} else prestigeUnlock.last += 5;
	}

	if (liquifiedZone()) drawAllUpgrades(true);
}

//Check and update each patch!
function updateLabels(force) {
	//Tried just updating as something changes, but seems to be better to do all at once all the time
	if (usingRealTimeOffline && !force) return;
	//Resources (food, wood, metal, trimps, science). Per second will be handled in separate function, and called from job loop.
	checkAndDisplayResources();
	updateSideTrimps();
	//Buildings, trap is the only unique building, needs to be displayed in trimp area as well
	checkAndDisplayBuildings();
	//Jobs, check PS here and stuff. Trimps per second is handled by breed() function
	checkAndDisplayJobs();
	//Upgrades, owned will only exist if 'allowed' exists on object
	checkAndDisplayUpgrades();
	//Equipment
	checkAndDisplayEquipment();
}

function updateSideTrimps() {
	const trimps = game.resources.trimps;
	const realMax = trimps.realMax();

	let elem = document.getElementById('trimpsEmployed');
	let elemText = prettify(trimps.employed);
	if (elem.innerHTML !== elemText.toString()) elem.innerHTML = elemText;

	const multitaskingMult = game.permaBoneBonuses.multitasking.owned ? game.permaBoneBonuses.multitasking.mult() : 1;
	const breedEmployed = trimps.employed * multitaskingMult;
	const breedCount = trimps.owned - breedEmployed > 2 ? prettify(Math.floor(trimps.owned - breedEmployed)) : 0;

	elem = document.getElementById('trimpsUnemployed');
	elemText = breedCount;
	if (elem.innerHTML !== elemText.toString()) elem.innerHTML = elemText;

	elem = document.getElementById('maxEmployed');
	elemText = prettify(Math.ceil(realMax / 2));
	if (elem.innerHTML !== elemText.toString()) elem.innerHTML = elemText;

	let free = Math.ceil(realMax / 2) - trimps.employed;
	if (free < 0) free = 0;
	const s = free > 1 ? 's' : '';

	elem = document.getElementById('jobsTitleUnemployed');
	elemText = `${prettify(free)} workspace${s}`;
	if (elem.innerHTML !== elemText.toString()) elem.innerHTML = elemText;
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
		if (elem.innerHTML !== elemText.toString()) elem.innerHTML = elemText;

		if (toUpdate.max === -1 || document.getElementById(`${item}Max`) === null) continue;
		let newMax = toUpdate.max;
		if (item !== 'trimps') newMax = calcHeirloomBonus('Shield', 'storageSize', newMax * (game.portal.Packrat.modifier * getPerkLevel('Packrat') + 1));
		else if (item === 'trimps') newMax = toUpdate.realMax();

		elem = document.getElementById(`${item}Max`);
		elemText = prettify(newMax);
		if (elem.innerHTML !== elemText.toString()) elem.innerHTML = elemText;

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
		if (elem === null) {
			unlockBuilding(item);
			elem = document.getElementById(`${item}Owned`);
		}
		if (elem === null) continue;
		let elemText = game.options.menu.menuFormatting.enabled ? prettify(toUpdate.owned) : toUpdate.owned;
		if (elem.innerHTML !== elemText.toString()) elem.innerHTML = elemText;
		if (item === 'Trap') {
			const trap1 = document.getElementById('trimpTrapText');
			if (trap1 && trap1.innerHTML !== elemText.toString()) trap1.innerHTML = elemText;
			const trap2 = document.getElementById('trimpTrapText2');
			if (trap2 && trap2.innerHTML !== elemText.toString()) trap2.innerHTML = elemText;
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
		if (elem.innerHTML !== elemText.toString()) elem.innerHTML = elemText;
		updatePs(toUpdate, false, item);
	}
}

function checkAndDisplayUpgrades() {
	const upgrades = game.upgrades;
	for (const item in upgrades) {
		let toUpdate = upgrades[item];
		if (toUpdate.allowed - toUpdate.done >= 1) toUpdate.locked = 0;
		if (toUpdate.locked === 1) continue;
		if (document.getElementById(item) === null) unlockUpgrade(item, true);
	}
}

function checkAndDisplayEquipment() {
	const equipment = game.equipment;
	for (const item in equipment) {
		let toUpdate = equipment[item];
		if (toUpdate.locked === 1) continue;
		if (document.getElementById(item) === null) drawAllEquipment();
		const elem = document.getElementById(`${item}Owned`);
		const elemText = toUpdate.level.toString();
		if (elem.innerHTML !== elemText) elem.innerHTML = elemText;
	}
}

//Check and update each patch!
function updateButtonColor(what, canAfford, isJob) {
	if (atSettings && atSettings.initialise.loaded) {
		if (usingRealTimeOffline && !getPageSetting('timeWarpDisplay')) return;
	} else {
		if (usingRealTimeOffline) return;
	}
	if (what === 'Amalgamator') return;
	const elem = document.getElementById(what);
	if (elem === null) {
		return;
	}
	if (game.options.menu.lockOnUnlock.enabled === 1 && new Date().getTime() - 1000 <= game.global.lastUnlock) canAfford = false;
	if (game.global.challengeActive === 'Archaeology' && game.upgrades[what] && game.upgrades[what].isRelic) {
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
	} else swapClass('thingColor', 'thingColorCanNotAfford', elem);
}

//Check and update each patch!
function untrustworthyTrimps(noTip, forceTime, negative) {
	if (!game.global.lastOnline) return;
	if (!forceTime) return;
	var dif = forceTime;

	var storageBought = [];
	var compatible = ['Farmer', 'Lumberjack', 'Miner', 'Dragimp', 'Explorer'];
	var storages = ['Barn', 'Shed', 'Forge'];
	for (var x = 0; x < compatible.length; x++) {
		var job = game.jobs[compatible[x]];
		var resName = job.increase;
		var resource = game.resources[resName];
		var amt = job.owned * job.modifier;
		amt += amt * getPerkLevel('Motivation') * game.portal.Motivation.modifier;
		if (getPerkLevel('Motivation_II') > 0) amt *= 1 + getPerkLevel('Motivation_II') * game.portal.Motivation_II.modifier;
		if (resName !== 'gems' && game.permaBoneBonuses.multitasking.owned > 0 && game.resources.trimps.owned >= game.resources.trimps.realMax()) amt *= 1 + game.permaBoneBonuses.multitasking.mult();
		if (job !== 'Explorer') {
			if (game.global.challengeActive === 'Alchemy') amt *= alchObj.getPotionEffect('Potion of Finding');
		}
		if (game.global.challengeActive === 'Frigid') amt *= game.challenges.Frigid.getShatteredMult();
		if (game.global.pandCompletions && job !== 'Explorer') amt *= game.challenges.Pandemonium.getTrimpMult();
		if (game.global.desoCompletions && job !== 'Explorer') amt *= game.challenges.Desolation.getTrimpMult();
		if (!game.portal.Observation.radLocked && game.global.universe === 2 && game.portal.Observation.trinkets > 0) amt *= game.portal.Observation.getMult();
		if (resName === 'food' || resName === 'wood' || resName === 'metal') {
			amt *= getParityBonus();
			if (autoBattle.oneTimers.Gathermate.owned && game.global.universe === 2) amt *= autoBattle.oneTimers.Gathermate.getMult();
		}
		if (Fluffy.isRewardActive('gatherer')) amt *= 2;
		if (getPerkLevel('Meditation') > 0 || (game.jobs.Magmamancer.owned > 0 && resName === 'metal')) {
			var medLevel = getPerkLevel('Meditation');
			var toAlter;
			var originalAmt = amt;
			//Find how many stacks of 10 minutes were already stacked before logging out
			var timeAtLastOnline = Math.floor((game.global.lastOnline - game.global.zoneStarted) / 600000);
			//Figure out what percentage of the total time offline one 10 minute chunk is. This will be used to modify amt to the proper amount in 10 minute chunks in order to mimic stacks
			var chunkPercent = 60000 / dif;
			//Start at 100% untouched
			var remaining = 100;
			//if a 10 minute chunk is larger than the time offline, no need to scale in chunks, skip to the end.
			var loops = 6;
			if (game.jobs.Magmamancer.owned && resName === 'metal') loops = 12;
			if (timeAtLastOnline < loops && chunkPercent < 100) {
				//Start from however many stacks were held before logging out. End at 5 stacks, the 6th will be all time remaining rather than chunks and handled at the end
				for (var z = timeAtLastOnline; z < loops; z++) {
					//If no full chunks left, let the final calculation handle it
					if (remaining < chunkPercent) break;
					//Remove a chunk from remaining, as it is about to be calculated
					remaining -= chunkPercent;
					//Check for z === 0 after removing chunkPercent, that way however much time was left before the first stack doesn't get calculated as having a stack
					if (z === 0) continue;
					//Find out exactly how much of amt needs to be modified to make up for this chunk
					toAlter = (originalAmt * chunkPercent) / 100;
					//Remove it from toAlter
					amt -= toAlter;
					//Modify and add back
					if (medLevel && z < 6) amt += toAlter * (1 + z * 0.01 * medLevel);
					//loops will only set to 72 if the current resource is metal and the player has Magmamancers
					if (loops === 12) amt += toAlter * game.jobs.Magmamancer.getBonusPercent(false, z);
				}
			}
			if (remaining) {
				//Check again how much needs to be altered
				toAlter = originalAmt * (remaining / 100);
				//Remove
				amt -= toAlter;
				//Modify and add back the final amount
				if (medLevel) amt += toAlter * (1 + game.portal.Meditation.getBonusPercent() * 0.01);
				if (loops === 12) amt += toAlter * game.jobs.Magmamancer.getBonusPercent();
			}
		}
		if (game.global.challengeActive === 'Decay' || game.global.challengeActive === 'Melt') {
			var challenge = game.challenges[game.global.challengeActive];
			amt *= 10;
			amt *= Math.pow(challenge.decayValue, challenge.stacks);
		}
		if (challengeActive('Meditate')) amt *= 1.25;
		if (challengeActive('Balance')) amt *= game.challenges.Balance.getGatherMult();
		if (game.global.challengeActive === 'Unbalance') amt *= game.challenges.Unbalance.getGatherMult();
		if (game.global.challengeActive === 'Archaeology' && resource !== 'fragments') amt *= game.challenges.Archaeology.getStatMult('science');
		if (game.global.challengeActive === 'Insanity' && resource !== 'fragments') amt *= game.challenges.Insanity.getLootMult();
		if (game.challenges.Nurture.boostsActive() && resource !== 'fragments') amt *= game.challenges.Nurture.getResourceBoost();
		if (game.global.challengeActive === 'Desolation' && resource !== 'fragments') amt *= game.challenges.Desolation.trimpResourceMult();
		if (game.global.challengeActive === 'Daily') {
			if (typeof game.global.dailyChallenge.famine !== 'undefined' && x < 4) {
				amt *= dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
			}
			if (typeof game.global.dailyChallenge.dedication !== 'undefined') {
				amt *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
			}
		}
		amt = calcHeirloomBonus('Staff', compatible[x] + 'Speed', amt);
		amt *= dif;
		if (x < 3) {
			var newMax = resource.max + resource.max * game.portal.Packrat.modifier * getPerkLevel('Packrat');
			newMax = calcHeirloomBonus('Shield', 'storageSize', newMax);
			var allowed = newMax - resource.owned;
			if (amt > allowed) {
				if (!game.global.autoStorage) {
					amt = allowed;
				} else {
					var storageBuilding = game.buildings[storages[x]];
					var count;
					for (count = 1; count < 300; count++) {
						amt -= storageBuilding.cost[resName]();
						storageBuilding.owned++;
						storageBuilding.purchased++;
						resource.max *= 2;
						newMax = resource.max + resource.max * game.portal.Packrat.modifier * getPerkLevel('Packrat');
						newMax = calcHeirloomBonus('Shield', 'storageSize', newMax);
						if (newMax > resource.owned + amt) break;
					}
					storageBought.push(count + ' ' + storages[x] + addAnS(count) + ', ');
				}
			}
		}
		if (amt > 0) {
			if (negative) amt = -amt;
			resource.owned += amt;
			if (resName === 'gems') game.stats.gemsCollected.value += amt;
		}
	}

	if (playerSpire.initialized && playerSpire.lootAvg.average) {
		var avg = playerSpire.getRsPs();
		if (!isNumberBad(avg)) {
			var rsCap = dif;
			if (rsCap > 604800) rsCap = 604800;
			var rsReward = rsCap * 0.75 * avg;
			if (negative) rsReward = -rsReward;
			playerSpire.runestones += rsReward;
		}
	}
}

function removeTrustworthyTrimps() {
	cancelTooltip();
	var dif = Math.floor(offlineProgress.totalOfflineTime / 100);
	var ticks = dif > offlineProgress.maxTicks ? offlineProgress.maxTicks : dif;
	var unusedTicks = dif - ticks;
	if (unusedTicks > 0) untrustworthyTrimps(false, unusedTicks / 10, true);
}

//Check and update each patch!
function _verticalCenterTooltip(makeLarge, makeSuperLarge) {
	var tipElem = document.getElementById('tooltipDiv');
	if (makeLarge) {
		swapClass('tooltipExtra', 'tooltipExtraLg', tipElem);
		tipElem.style.left = '25%';
	}
	if (makeSuperLarge) {
		swapClass('tooltipExtra', 'tooltipExtraSuperLg', tipElem);
		tipElem.style.left = '17.5%';
	}
	var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	var tipHeight = Math.max(tipElem.clientHeight, tipElem.innerHeight || 0);
	if (makeLarge && tipHeight / height > 0.95) {
		document.getElementById('tipText').className = 'tinyTextTip';
		tipHeight = Math.max(tipElem.clientHeight, tipElem.innerHeight || 0);
	}
	var dif = height - tipHeight;
	tipElem.style.top = dif > 0 ? dif / 2 + 'px' : '0';
}

function saveToSteam(saveData) {
	if (typeof greenworks === 'undefined') return;
	greenworks.saveTextToFile('TrimpsSave.sav', saveData, cloudSaveCallback, cloudSaveErrorCallback);
}

function loadFromSteam() {
	if (typeof greenworks === 'undefined') return;
	greenworks.readTextFromFile('TrimpsSave.sav', loadFromSteamCallback, loadFromSteamErrorCallback);
}

function cloudSaveCallback(data) {}

//Overall more performance efficient to remove the textStrings from getPsString so copied it from the game and removed the textStrings.
//Check and update each patch!
function getPsString_AT(what, ignoreManual = false) {
	if (what === 'helium') return;
	const resOrder = ['food', 'wood', 'metal', 'science', 'gems', 'fragments'];
	const books = ['farming', 'lumber', 'miner', 'science'];
	const jobs = ['Farmer', 'Lumberjack', 'Miner', 'Scientist', 'Dragimp', 'Explorer'];
	const index = resOrder.indexOf(what);
	const job = game.jobs[jobs[index]];
	const book = game.upgrades[`Speed${books[index]}`];
	const mBook = game.upgrades['Mega' + books[index]];
	const base = what === 'fragments' ? 0.4 : 0.5;

	let currentCalc = job.owned * base;

	if (what !== 'gems' && game.permaBoneBonuses.multitasking.owned > 0) {
		const str = game.resources.trimps.owned >= game.resources.trimps.realMax() ? game.permaBoneBonuses.multitasking.mult() : 0;
		currentCalc *= 1 + str;
	}

	if (typeof book !== 'undefined' && book.done > 0) currentCalc *= Math.pow(1.25, book.done);

	if (typeof mBook !== 'undefined' && mBook.done > 0) {
		const mod = game.global.frugalDone ? 1.6 : 1.5;
		currentCalc *= Math.pow(mod, mBook.done);
	}

	if (what !== 'gems' && game.upgrades.Bounty.done > 0) currentCalc *= 2;
	if (what === 'gems' && game.buildings.Tribute.owned > 0) currentCalc *= Math.pow(game.buildings.Tribute.increase.by, game.buildings.Tribute.owned);
	if (game.unlocks.impCount.Whipimp > 0) currentCalc *= Math.pow(1.003, game.unlocks.impCount.Whipimp);
	if (getPerkLevel('Motivation') > 0) currentCalc *= 1 + getPerkLevel('Motivation') * getPerkModifier('Motivation');

	const balanceChallenge = ['Balance', 'Unbalance'].find(challengeActive);
	if (balanceChallenge) currentCalc *= game.challenges[balanceChallenge].getGatherMult();

	const decayChallenge = ['Decay', 'Melt'].find(challengeActive);
	if (decayChallenge) {
		currentCalc *= 10;
		const stackStr = Math.pow(game.challenges[decayChallenge].decayValue, game.challenges[decayChallenge].stacks);
		currentCalc *= stackStr;
	}

	if (game.global.universe === 1) {
		if (['food', 'metal', 'wood'].includes(what) && challengeActive('Size')) currentCalc *= 1.5;
		if (challengeActive('Meditate')) currentCalc *= 1.25;
		if (getPerkLevel('Meditation') > 0) currentCalc *= 1 + game.portal.Meditation.getBonusPercent() * 0.01;
		if (challengeActive('Toxicity')) currentCalc *= 1 + (game.challenges.Toxicity.lootMult * game.challenges.Toxicity.stacks) / 100;
		if (challengeActive('Watch')) currentCalc /= 2;
		if (challengeActive('Lead') && game.global.world % 2 === 1) currentCalc *= 2;
		if (getPerkLevel('Motivation_II') > 0) currentCalc *= 1 + getPerkLevel('Motivation_II') * getPerkModifier('Motivation_II');
		if (what === 'metal' && game.jobs.Magmamancer.owned > 0) currentCalc *= game.jobs.Magmamancer.getBonusPercent();
		if (challengeActive('Frigid')) currentCalc *= game.challenges.Frigid.getShatteredMult();
		if (what !== 'fragments' && getEmpowerment() === 'Wind') currentCalc *= 1 + game.empowerments.Wind.getCombatModifier();
	}

	if (game.global.universe === 2) {
		if (challengeActive('Downsize')) currentCalc *= 5;
		if (Fluffy.isRewardActive('gatherer')) currentCalc *= 2;
		if (what !== 'fragments' && challengeActive('Archaeology')) currentCalc *= game.challenges.Archaeology.getStatMult('science');
		if (challengeActive('Insanity')) currentCalc *= game.challenges.Insanity.getLootMult();
		if (what !== 'fragments' && game.challenges.Nurture.boostsActive()) currentCalc *= game.challenges.Nurture.getResourceBoost();
		if (what !== 'science' && what !== 'fragments' && challengeActive('Alchemy')) currentCalc *= alchObj.getPotionEffect('Potion of Finding');
		if (game.portal.Observation.trinkets > 0) currentCalc *= game.portal.Observation.getMult();
		if (what === 'wood' && challengeActive('Hypothermia') && game.challenges.Hypothermia.bonfires > 0) currentCalc *= game.challenges.Hypothermia.getWoodMult(true);
		if (challengeActive('Desolation') && what !== 'fragments') currentCalc *= game.challenges.Desolation.trimpResourceMult();
		if (['food', 'metal', 'wood'].includes(what) && autoBattle.oneTimers.Gathermate.owned) currentCalc *= autoBattle.oneTimers.Gathermate.getMult();
		if ((['food', 'wood'].includes(what) && game.buildings.Antenna.owned >= 5) || (what === 'metal' && game.buildings.Antenna.owned >= 15)) {
			currentCalc *= game.jobs.Meteorologist.getExtraMult();
		}
	}

	if (game.upgrades.Speedexplorer.done > 0 && what === 'fragments') currentCalc *= Math.pow(4, game.upgrades.Speedexplorer.done);
	if (game.global.pandCompletions && what !== 'fragments') currentCalc *= game.challenges.Pandemonium.getTrimpMult();
	if (game.global.desoCompletions && what !== 'fragments') currentCalc *= game.challenges.Desolation.getTrimpMult();

	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.dedication !== 'undefined') {
			currentCalc *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
		}
		if (typeof game.global.dailyChallenge.famine !== 'undefined' && what !== 'fragments' && what !== 'science') {
			currentCalc *= dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
		}
	}

	if (['food', 'metal', 'wood'].includes(what) && getParityBonus() > 1) currentCalc *= getParityBonus();
	const heirloomBonus = calcHeirloomBonus('Staff', `${jobs[index]}Speed`, 0, true);
	if (heirloomBonus > 0) currentCalc *= heirloomBonus / 100 + 1;

	if (!ignoreManual) {
		if (game.global.playerGathering === what) {
			if ((game.talents.turkimp2.purchased || game.global.turkimpTimer > 0) && ['food', 'metal', 'wood'].includes(what)) {
				const turkimpBonus = game.talents.turkimp2.purchased ? 2 : game.talents.turkimp2.purchased ? 1.75 : 1.5;
				currentCalc *= turkimpBonus;
			}
			currentCalc += getPlayerModifier();
		}

		if (game.options.menu.useAverages.enabled) {
			const avg = getAvgLootSecond(what);
			if (avg > 0.001) currentCalc += avg;
		}
	}

	return currentCalc;
}

//Check and update each patch!
function simpleSeconds_AT(what, seconds, workerRatio = null) {
	if (typeof workerRatio === 'undefined' || workerRatio === null) return;

	const desiredRatios = workerRatio.split(',').map((ratio) => (ratio ? Number(ratio) : 0));
	const totalFraction = desiredRatios.reduce((a, b) => a + b, 0);

	const jobMap = {
		food: { jobName: 'Farmer', pos: 0 },
		wood: { jobName: 'Lumberjack', pos: 1 },
		metal: { jobName: 'Miner', pos: 2 },
		gems: { jobName: 'Dragimp' },
		fragments: { jobName: 'Explorer' },
		science: { jobName: 'Scientist', pos: 3 }
	};

	const { jobName, pos } = jobMap[what];

	let heirloom = !jobName
		? null
		: jobName === 'Miner' && challengeActive('Pandemonium') && getPageSetting('pandemoniumStaff') !== 'undefined'
		? 'pandemoniumStaff'
		: jobName === 'Farmer' && getPageSetting('heirloomStaffFood') !== 'undefined'
		? 'heirloomStaffFood'
		: jobName === 'Lumberjack' && getPageSetting('heirloomStaffWood') !== 'undefined'
		? 'heirloomStaffWood'
		: jobName === 'Miner' && getPageSetting('heirloomStaffMetal') !== 'undefined'
		? 'heirloomStaffMetal'
		: jobName === 'Scientist' && getPageSetting('heirloomStaffScience') !== 'undefined'
		? 'heirloomStaffScience'
		: getPageSetting('heirloomStaffMap') !== 'undefined'
		? 'heirloomStaffMap'
		: getPageSetting('heirloomStaffWorld') !== 'undefined'
		? 'heirloomStaffWorld'
		: null;

	if (game.global.StaffEquipped.name !== heirloom && heirloomSearch(heirloom) === undefined) heirloom = null;

	const job = game.jobs[jobName];
	const trimpworkers = noBreedChallenge() ? game.resources.trimps.owned : game.resources.trimps.realMax() / 2 - game.jobs.Explorer.owned - game.jobs.Meteorologist.owned - game.jobs.Worshipper.owned;
	const workers = workerRatio !== null ? Math.floor((trimpworkers * desiredRatios[pos]) / totalFraction) : mapSettings.mapName === 'Worshipper Farm' ? trimpworkers : job.owned;

	let amt = workers * job.modifier * seconds;

	amt += amt * getPerkLevel('Motivation') * game.portal.Motivation.modifier;
	if (what !== 'gems' && game.permaBoneBonuses.multitasking.owned > 0) amt *= 1 + game.permaBoneBonuses.multitasking.mult();

	const balanceChallenge = ['Balance', 'Unbalance'].find(challengeActive);
	if (balanceChallenge) amt *= game.challenges[balanceChallenge].getGatherMult();

	const decayChallenge = ['Decay', 'Melt'].find(challengeActive);
	if (decayChallenge) {
		amt *= 10;
		const stackStr = Math.pow(game.challenges[decayChallenge].decayValue, game.challenges[decayChallenge].stacks);
		amt *= stackStr;
	}

	if (game.global.universe === 1) {
		if (['food', 'metal', 'wood'].includes(what) && challengeActive('Size')) amt *= 1.5;
		if (challengeActive('Meditate')) amt *= 1.25;
		if (getPerkLevel('Meditation') > 0) amt *= 1 + game.portal.Meditation.getBonusPercent() * 0.01;
		if (challengeActive('Toxicity')) amt *= 1 + (game.challenges.Toxicity.lootMult * game.challenges.Toxicity.stacks) / 100;
		if (challengeActive('Watch')) amt /= 2;
		if (challengeActive('Lead') && game.global.world % 2 === 1) amt *= 2;
		if (getPerkLevel('Motivation_II') > 0) amt *= 1 + getPerkLevel('Motivation_II') * getPerkModifier('Motivation_II');
		if (what === 'metal' && game.jobs.Magmamancer.owned > 0) amt *= game.jobs.Magmamancer.getBonusPercent();
		if (challengeActive('Frigid')) amt *= game.challenges.Frigid.getShatteredMult();
		if (getEmpowerment() === 'Wind') amt *= 1 + game.empowerments.Wind.getCombatModifier();
	}

	if (game.global.universe === 2) {
		if (Fluffy.isRewardActive('gatherer')) amt *= 2;
		if ((['food', 'wood'].includes(what) && game.buildings.Antenna.owned >= 5) || (what === 'metal' && game.buildings.Antenna.owned >= 15)) amt *= game.jobs.Meteorologist.getExtraMult();
		if (game.challenges.Nurture.boostsActive()) amt *= game.challenges.Nurture.getResourceBoost();
		if (game.portal.Observation.trinkets > 0) amt *= game.portal.Observation.getMult();
		if (what !== 'science' && what !== 'fragments' && challengeActive('Alchemy')) amt *= alchObj.getPotionEffect('Potion of Finding');
		if (what === 'wood' && challengeActive('Hypothermia') && game.challenges.Hypothermia.bonfires > 0) amt *= game.challenges.Hypothermia.getWoodMult();
		if (challengeActive('Desolation')) amt *= game.challenges.Desolation.trimpResourceMult();
	}

	if (['food', 'metal', 'wood'].includes(what)) {
		if (workerRatio) amt *= calculateParityBonus_AT(desiredRatios, heirloomSearch(heirloom));
		else amt *= getParityBonus();
		if (autoBattle.oneTimers.Gathermate.owned && game.global.universe === 2) amt *= autoBattle.oneTimers.Gathermate.getMult();
	}

	if (game.global.pandCompletions && what !== 'fragments') amt *= game.challenges.Pandemonium.getTrimpMult();
	if (game.global.desoCompletions && what !== 'fragments') amt *= game.challenges.Desolation.getTrimpMult();

	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.famine !== 'undefined' && what !== 'fragments' && what !== 'science') amt *= dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
		if (typeof game.global.dailyChallenge.dedication !== 'undefined') amt *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
	}

	const calcHeirloomBonusFunc = heirloom ? calcHeirloomBonus_AT : calcHeirloomBonus;
	amt = calcHeirloomBonusFunc('Staff', `${jobName}Speed`, amt, false, heirloom);

	const turkimpBonus = game.talents.turkimp2.purchased ? 2 : game.talents.turkimp2.purchased ? 1.75 : 1.5;

	if ((game.talents.turkimp2.purchased || game.global.turkimpTimer > 0) && ['food', 'metal', 'wood'].includes(what)) {
		amt *= turkimpBonus;
		amt += getPlayerModifier() * seconds;
	}
	return amt;
}

//Check and update each patch!
function scaleToCurrentMap_AT(amt, ignoreBonuses, ignoreScry, map) {
	map = map ? game.global.world + map : game.global.mapsActive ? getCurrentMapObject().level : challengeActive('Pandemonium') ? game.global.world - 1 : game.global.world;
	let compare = game.global.world;

	if (map > compare) {
		amt *= Math.pow(1.1, map - compare);
	} else {
		if (game.talents.mapLoot.purchased) compare--;
		if (map < compare) {
			amt *= Math.pow(0.8, compare - map);
		}
	}

	if (ignoreBonuses) return amt;

	const goldenMaps = game.singleRunBonuses.goldMaps.owned ? 1 : 0;
	const mapLoot = (game.global.farmlandsUnlocked ? 2.6 : game.global.decayDone ? 1.85 : 1.6) + goldenMaps;
	amt = Math.round(amt * mapLoot);
	amt = scaleLootBonuses(amt, ignoreScry);
	return amt;
}

//Check and update each patch!
function calculateParityBonus_AT(workerRatio, heirloom) {
	if (!game.global.StaffEquipped || game.global.StaffEquipped.rarity < 10) return 1;

	const allowed = ['Farmer', 'Lumberjack', 'Miner'];
	let totalWorkers = 0;
	let numWorkers = [];

	if (!workerRatio) {
		numWorkers = allowed.map((job) => game.jobs[job].owned);
		totalWorkers = numWorkers.reduce((a, b) => a + b, 0);
	} else {
		const freeWorkers = Math.ceil(Math.min(game.resources.trimps.realMax() / 2), game.resources.trimps.owned) - (game.resources.trimps.employed - game.jobs.Explorer.owned - game.jobs.Meteorologist.owned - game.jobs.Worshipper.owned);
		const workerRatios = workerRatio;
		const ratio = workerRatios.reduce((a, b) => a + b, 0);
		const freeWorkerDivided = Math.max(1, freeWorkers / ratio);

		numWorkers = workerRatios.map((workerRatio) => freeWorkerDivided * workerRatio);
		totalWorkers = numWorkers.reduce((a, b) => a + b, 0);
	}

	const resourcePop = Math.log(totalWorkers) / Math.log(3);
	const largestWorker = Math.log(Math.max(...numWorkers)) / Math.log(3);
	const spreadFactor = resourcePop - largestWorker;
	const preLoomBonus = spreadFactor * spreadFactor;
	const finalWithParity = (1 + preLoomBonus) * getHazardParityMult(heirloom);
	return finalWithParity;
}

//Check and update each patch!
function calculateMaxAfford_AT(itemObj, isBuilding, isEquipment, isJob, forceMax, forceRatio, resources) {
	if (!itemObj.cost) return 1;
	let mostAfford = -1;
	if (Number.isInteger(forceMax)) forceMax = forceMax;
	//if (!forceMax) var forceMax = false;
	forceMax = Number.isInteger(forceMax) ? forceMax : false;
	let currentOwned = itemObj.purchased ? itemObj.purchased : itemObj.level ? itemObj.level : itemObj.owned;
	const artMult = getEquipPriceMult();
	const runningHypo = challengeActive('Hypothermia');
	const hypoWoodCost = runningHypo && hypothermiaEndZone() - 1 > game.global.world ? hypothermiaBonfireCost() : 0;
	if (!currentOwned) currentOwned = 0;
	if (isJob && game.global.firing && !forceRatio) return Math.floor(currentOwned * game.global.maxSplit);
	for (let item in itemObj.cost) {
		let price = itemObj.cost[item];
		let toBuy;
		const resource = game.resources[item];
		let resourcesAvailable = !resources ? resource.owned : resources;
		if (item === 'wood' && runningHypo) resourcesAvailable -= hypoWoodCost;
		if (resourcesAvailable < 0) resourcesAvailable = 0;
		if (game.global.maxSplit !== 1 && !forceMax && !forceRatio) resourcesAvailable = Math.floor(resourcesAvailable * game.global.maxSplit);
		else if (forceRatio) resourcesAvailable = Math.floor(resourcesAvailable * forceRatio);

		if (item === 'fragments' && game.global.universe === 2) {
			const buildingSetting = getPageSetting('buildingSettingsArray');
			resourcesAvailable = buildingSetting.SafeGateway && buildingSetting.SafeGateway.zone !== 0 && game.global.world >= buildingSetting.SafeGateway.zone ? resourcesAvailable : buildingSetting.SafeGateway.enabled && resourcesAvailable > resource.owned - mapCost(10, 'lmc') * buildingSetting.SafeGateway.mapCount ? resource.owned - mapCost(10, 'lmc') * buildingSetting.SafeGateway.mapCount : resourcesAvailable;
		}
		if (!resource || typeof resourcesAvailable === 'undefined') {
			console.log(`resource ${item} not found`);
			return 1;
		}
		if (typeof price[1] !== 'undefined') {
			let start = price[0];
			if (isEquipment) start = Math.ceil(start * artMult);
			if (isBuilding && getPerkLevel('Resourceful')) start = start * Math.pow(1 - getPerkModifier('Resourceful'), getPerkLevel('Resourceful'));
			toBuy = Math.floor(log10((resourcesAvailable / (start * Math.pow(price[1], currentOwned))) * (price[1] - 1) + 1) / log10(price[1]));
		} else if (typeof price === 'function') {
			return 1;
		} else {
			if (isBuilding && getPerkLevel('Resourceful')) price = Math.ceil(price * Math.pow(1 - getPerkModifier('Resourceful'), getPerkLevel('Resourceful')));
			toBuy = Math.floor(resourcesAvailable / price);
		}
		if (mostAfford === -1 || mostAfford > toBuy) mostAfford = toBuy;
	}
	if (forceRatio && (mostAfford <= 0 || isNaN(mostAfford))) return 0;
	if (isBuilding && mostAfford > 1000000000) return 1000000000;
	if (mostAfford <= 0) return 1;
	if (forceMax !== false && mostAfford > forceMax) return forceMax;
	if (isJob && itemObj.max && itemObj.owned + mostAfford > itemObj.max) return itemObj.max - itemObj.owned;
	return mostAfford;
}

//AT versions for heirloom bonuses.
//Check and update each patch!
function getHeirloomBonus_AT(type, modName, customShield) {
	if (!customShield && (!game.heirlooms[type] || !game.heirlooms[type][modName])) return 0;
	let bonus;
	//Override bonus if needed with gammaBurst otherwise check customShield and lastly use the game heirloom bonus.
	if (customShield) bonus = heirloomModSearch(customShield, modName);
	else if (modName === 'gammaBurst') bonus = game.global.gammaMult / 100;
	else bonus = game.heirlooms[type][modName].currentBonus;
	if (bonus === undefined) return 0;

	if (challengeActive('Daily') && typeof game.global.dailyChallenge.heirlost !== 'undefined') {
		if (modName !== 'FluffyExp' && modName !== 'VoidMaps') bonus *= dailyModifiers.heirlost.getMult(game.global.dailyChallenge.heirlost.strength);
	}
	return scaleHeirloomModUniverse(type, modName, bonus);
}

function calcHeirloomBonus_AT(type, modName, number, getValueOnly, customShield) {
	let mod = getHeirloomBonus_AT(type, modName, customShield);
	if (getValueOnly) return mod;
	if (!mod || mod <= 0) return number;
	return number * (mod / 100 + 1);
}

function getPlayerCritChance_AT(customShield) {
	//returns decimal: 1 = 100%
	if (challengeActive('Frigid') && game.challenges.Frigid.warmth <= 0) return 0;
	if (challengeActive('Duel')) return game.challenges.Duel.enemyStacks / 100;
	const heirloomValue = getHeirloomBonus_AT('Shield', 'critChance', customShield);
	let critChance = 0;
	critChance += game.portal.Relentlessness.modifier * getPerkLevel('Relentlessness');
	critChance += heirloomValue / 100;
	if (game.talents.crit.purchased && heirloomValue) critChance += heirloomValue * 0.005;
	if (Fluffy.isRewardActive('critChance')) critChance += 0.5 * Fluffy.isRewardActive('critChance');
	if (game.challenges.Nurture.boostsActive() && game.challenges.Nurture.getLevel() >= 5) critChance += 0.35;
	if (game.global.universe === 2 && u2Mutations.tree.CritChance.purchased) critChance += 0.25;
	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.trimpCritChanceUp !== 'undefined') critChance += dailyModifiers.trimpCritChanceUp.getMult(game.global.dailyChallenge.trimpCritChanceUp.strength);
		if (typeof game.global.dailyChallenge.trimpCritChanceDown !== 'undefined') critChance -= dailyModifiers.trimpCritChanceDown.getMult(game.global.dailyChallenge.trimpCritChanceDown.strength);
		if (Fluffy.isRewardActive('SADailies')) critChance += Fluffy.rewardConfig.SADailies.critChance();
	}
	if (critChance > 7) critChance = 7;
	return critChance;
}

function getPlayerCritDamageMult_AT(customShield) {
	const relentLevel = getPerkLevel('Relentlessness');
	const heirloomValue = getHeirloomBonus_AT('Shield', 'critDamage', customShield);
	let critMult = game.portal.Relentlessness.otherModifier * relentLevel + heirloomValue / 100 + 1;
	critMult += getPerkLevel('Criticality') * game.portal.Criticality.modifier;
	if (relentLevel > 0) critMult += 1;
	if (game.challenges.Nurture.boostsActive() && game.challenges.Nurture.getLevel() >= 5) critMult += 0.5;
	critMult += alchObj.getPotionEffect('Elixir of Accuracy');
	return critMult;
}

function getPlayerEqualityMult_AT(customShield) {
	let modifier = game.portal.Equality.modifier;
	let tempModifier = 1 - modifier;
	const heirloomValue = getHeirloomBonus_AT('Shield', 'inequality', customShield);
	tempModifier *= heirloomValue / 100;
	modifier += tempModifier;
	return modifier;
}

function getEnergyShieldMult_AT(mapType, noHeirloom) {
	if (game.global.universe !== 2) return 0;
	let total = 0;
	if (game.upgrades.Prismatic.done) total += 0.5; //Prismatic: Drops Z2
	if (game.upgrades.Prismalicious.done) total += 0.5; //Prismalicious: Drops from Prismatic Palace at Z20
	if (getPerkLevel('Prismal') > 0) total += getPerkLevel('Prismal') * game.portal.Prismal.modifier; //Prismal perk, total possible is 100%
	total += Fluffy.isRewardActive('prism') * 0.25; //Fluffy Prism reward, 25% each, total of 25% available
	if (challengeActive('Bublé')) total += 2.5; //Bublé challenge - 100%
	if (autoBattle.oneTimers.Suprism.owned) total += autoBattle.oneTimers.Suprism.getMult(); //SpireAssault - 3% per level

	if (!noHeirloom) {
		const heirloomValue = getHeirloomBonus_AT('Shield', 'prismatic', heirloomShieldToEquip(mapType));
		if (heirloomValue > 0) total += heirloomValue / 100;
	}
	return total;
}

function getHazardGammaBonus_AT(heirloom) {
	if (!heirloom) heirloom = game.global.ShieldEquipped;
	if (!heirloom || heirloom.rarity < 10) return 0;
	const spent = getTotalHeirloomRefundValue(heirloom, true) + 1e6;
	const mult = heirloom.rarity === 11 ? 10000 : 4000;
	const bonus = log10(spent) * mult;
	return bonus;
}

//See if GS can implement these modified functions as they're more performance efficient
function updateTurkimpTime() {
	const elem = document.getElementById('turkimpTime');
	if (game.talents.turkimp2.purchased) {
		const icon = `<span class="icomoon icon-infinity"></span>`;
		if (elem.innerHTML !== icon) elem.innerHTML = icon;
		return;
	}

	if (game.global.turkimpTimer <= 0) return;

	game.global.turkimpTimer -= 100;
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
	if (elem.innerHTML !== formattedTime) elem.innerHTML = formattedTime;
}

var DecimalBreed = Decimal.clone({ precision: 30, rounding: 4 });
function breed() {
	const breedElem = document.getElementById('trimpsTimeToFill');
	const trimps = game.resources.trimps;
	const trimpsMax = trimps.realMax();
	let employedTrimps = trimps.employed;
	checkAchieve('trimps', trimps.owned);

	if (game.permaBoneBonuses.multitasking.owned) employedTrimps *= 1 - game.permaBoneBonuses.multitasking.mult();
	const maxBreedable = new DecimalBreed(trimpsMax).minus(employedTrimps);
	if (missingTrimps.cmp(0) < 0) missingTrimps = new DecimalBreed(0);
	let decimalOwned = missingTrimps.add(trimps.owned);
	let breeding = decimalOwned.minus(employedTrimps);
	if (breeding.cmp(2) == -1 || challengeActive('Trapper') || challengeActive('Trappapalooza')) {
		updatePs(0, true);
		if (breedElem.innerHTML !== '') breedElem.innerHTML = '';
		srLastBreedTime = '';
		return;
	}
	let potencyMod = new DecimalBreed(trimps.potency);
	//Add potency (book)
	if (game.upgrades.Potency.done > 0) potencyMod = potencyMod.mul(Math.pow(1.1, game.upgrades.Potency.done));
	//Add Nurseries
	if (game.buildings.Nursery.owned > 0) potencyMod = potencyMod.mul(Math.pow(1.01, game.buildings.Nursery.owned));
	//Add Venimp
	if (game.unlocks.impCount.Venimp > 0) potencyMod = potencyMod.mul(Math.pow(1.003, game.unlocks.impCount.Venimp));
	//Broken Planet
	if (game.global.brokenPlanet) potencyMod = potencyMod.div(10);
	//Pheromones
	potencyMod = potencyMod.mul(1 + getPerkLevel('Pheromones') * game.portal.Pheromones.modifier);

	//Quick Trimps
	if (game.singleRunBonuses.quickTrimps.owned) potencyMod = potencyMod.mul(2);
	//Challenges
	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.dysfunctional !== 'undefined') {
			potencyMod = potencyMod.mul(dailyModifiers.dysfunctional.getMult(game.global.dailyChallenge.dysfunctional.strength));
		}
		if (typeof game.global.dailyChallenge.toxic !== 'undefined') {
			potencyMod = potencyMod.mul(dailyModifiers.toxic.getMult(game.global.dailyChallenge.toxic.strength, game.global.dailyChallenge.toxic.stacks));
		}
	}
	if (challengeActive('Toxicity') && game.challenges.Toxicity.stacks > 0) {
		potencyMod = potencyMod.mul(Math.pow(game.challenges.Toxicity.stackMult, game.challenges.Toxicity.stacks));
	}
	if (challengeActive('Archaeology')) {
		potencyMod = potencyMod.mul(game.challenges.Archaeology.getStatMult('breed'));
	}
	if (game.global.voidBuff == 'slowBreed') {
		potencyMod = potencyMod.mul(0.2);
	}
	if (challengeActive('Quagmire')) {
		potencyMod = potencyMod.mul(game.challenges.Quagmire.getExhaustMult());
	}
	potencyMod = calcHeirloomBonusDecimal('Shield', 'breedSpeed', potencyMod);
	//console.log(getDesiredGenes(potencyMod.toNumber()));

	//Geneticist
	if (game.jobs.Geneticist.owned > 0) potencyMod = potencyMod.mul(Math.pow(0.98, game.jobs.Geneticist.owned));
	//Mutators
	//Gene Attack
	if (game.global.universe == 2 && u2Mutations.tree.GeneAttack.purchased) potencyMod = potencyMod.div(50);
	//Gene Health
	if (game.global.universe == 2 && u2Mutations.tree.GeneHealth.purchased) potencyMod = potencyMod.div(50);
	breeding = potencyMod.mul(breeding);
	updatePs(breeding.toNumber(), true);
	potencyMod = potencyMod.div(10).add(1);
	let timeRemaining = DecimalBreed.log10(maxBreedable.div(decimalOwned.minus(employedTrimps)))
		.div(DecimalBreed.log10(potencyMod))
		.div(10);
	//Calculate full breed time
	let fullBreed = '';
	const currentSend = trimps.getCurrentSend();
	let totalTime = DecimalBreed.log10(maxBreedable.div(maxBreedable.minus(currentSend)))
		.div(DecimalBreed.log10(potencyMod))
		.div(10);
	//breeding, potencyMod, timeRemaining, and totalTime are DecimalBreed
	game.global.breedTime = currentSend / breeding.toNumber();
	if (!game.jobs.Geneticist.locked && game.global.Geneticistassist && game.global.GeneticistassistSetting > 0) {
		const target = new Decimal(game.global.GeneticistassistSetting);
		//tired of typing Geneticistassist
		let GAElem = document.getElementById('Geneticistassist');
		let GAIndicator = document.getElementById('GAIndicator');
		let canRun = false;
		const now = new Date().getTime();
		if (lastGAToggle === -1) canRun = true;
		else if (now > lastGAToggle + 2000) {
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
			let compareTime;
			let htmlMessage = '';
			if (timeRemaining.cmp(1) > 0 && timeRemaining.cmp(target.add(1)) > 0) {
				compareTime = new DecimalBreed(timeRemaining.add(-1));
			} else {
				compareTime = new DecimalBreed(totalTime);
			}
			if (!thresh.isFinite()) thresh = new Decimal(0);
			if (!compareTime.isFinite()) compareTime = new Decimal(999);
			let genDif = new DecimalBreed(Decimal.log10(target.div(compareTime)).div(Decimal.log10(1.02))).ceil();

			if (compareTime.cmp(target) < 0) {
				swapClass('state', 'stateHiring', GAElem);
				if (game.resources.food.owned * 0.01 < getNextGeneticistCost()) {
					htmlMessage = " (<span style='font-size: 0.8em' class='glyphicon glyphicon-apple'></span>)";
				} else if (timeRemaining.cmp(1) < 0 || target.minus((now - game.global.lastSoldierSentAt) / 1000).cmp(timeRemaining) > 0) {
					if (genDif.cmp(0) > 0) {
						if (genDif.cmp(10) > 0) genDif = new Decimal(10);
						addGeneticist(genDif.toNumber());
					}
					htmlMessage = ' (+)';
				} else htmlMessage = " (<span style='font-size: 0.8em' class='icmoon icon-clock3'></span>)";
			} else if (compareTime.add(thresh.mul(-1)).cmp(target) > 0 || potencyMod.cmp(1) == 0) {
				if (!genDif.isFinite()) genDif = new Decimal(-1);
				swapClass('state', 'stateFiring', GAElem);
				htmlMessage = ' (-)';
				if (genDif.cmp(0) < 0 && game.options.menu.gaFire.enabled != 2) {
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
	const remainingTime = `${timeRemaining} Secs`;
	//Display full breed time if desired
	const totalTimeText = Math.ceil(totalTime * 10) / 10;
	if (game.options.menu.showFullBreed.enabled) {
		fullBreed = `${totalTimeText} Secs`;
		timeRemaining = `${timeRemaining} / ${fullBreed}`;
	}

	if (decimalOwned.cmp(trimpsMax) >= 0 && trimps.owned >= trimpsMax) {
		trimps.owned = trimpsMax;
		missingTrimps = new DecimalBreed(0);
		var updateGenes = false;
		if (game.options.menu.geneSend.enabled == 3 && game.global.lastBreedTime / 1000 < game.global.GeneticistassistSetting) {
			game.global.lastBreedTime += 100;
			if (remainingTime === 0.0) updateGenes = true;
		}
		srLastBreedTime = fullBreed ? fullBreed : '';
		if (breedElem.innerHTML !== srLastBreedTime.toString()) breedElem.innerHTML = srLastBreedTime;
		if (updateGenes || (!game.global.fighting && totalTimeText === '0.0')) {
			updateStoredGenInfo(breeding.toNumber());
		}
		return;
	}

	srLastBreedTime = timeRemaining;
	if (breedElem.innerHTML !== timeRemaining.toString()) breedElem.innerHTML = timeRemaining;
	trimps.owned = decimalOwned.toNumber();
	if (decimalOwned.cmp(trimps.owned) != 0 && breeding.cmp(0) > 0) {
		missingTrimps = decimalOwned.minus(trimps.owned);
	} else {
		missingTrimps = new DecimalBreed(0);
	}
	if (trimps.owned >= trimpsMax) trimps.owned = trimpsMax;
	else game.global.realBreedTime += 100;
	game.global.lastBreedTime += 100;
	updateStoredGenInfo(breeding);
}

Fluffy.updateExp = function () {
	const expElem = document.getElementById('fluffyExp');
	const lvlElem = document.getElementById('fluffyLevel');
	const fluffyInfo = this.cruffysTipActive() ? game.challenges.Nurture.getExp() : this.getExp();
	const width = Math.ceil((fluffyInfo[1] / fluffyInfo[2]) * 100);
	if (width > 100) width = 100;
	expElem.style.width = width + '%';
	if (lvlElem.innerHTML !== fluffyInfo[0].toString()) {
		lvlElem.innerHTML = fluffyInfo[0];
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
			if (map.size % cols === 0) rows = map.size / cols;
			else {
				const sizeGreaterThanCols = map.size - cols * cols > cols;
				rows = sizeGreaterThanCols ? cols + 2 : cols + 1;
			}
		}
	}

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
	let counter = 0;
	let size = maps ? game.global.mapGridArray.length : 0;
	let rowHTML = '';

	for (let i = 0; i < rows; i++) {
		if (maps && counter >= size) break;
		let html = '';
		for (let x = 0; x < cols; x++) {
			if (maps && counter >= size) break;

			const cell = game.global[maps ? 'mapGridArray' : 'gridArray'][counter];
			const id = `${idText}${counter}`;
			const width = `${100 / cols}%`;
			const paddingTop = `${100 / cols / 19}vh`;
			const paddingBottom = `${100 / cols / 19}vh`;
			const fontSize = `${cols / 14 + 1}vh`;

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

function updateAllBattleNumbers(skipNum) {
	if (usingRealTimeOffline) return;

	const prefix = game.global.mapsActive ? 'Map' : '';
	const cellNum = game.global[`lastCleared${prefix}Cell`] + 1;
	const cell = game.global[`${prefix ? 'mapGridArray' : 'gridArray'}`][cellNum];
	const cellElem = document.getElementById(`${prefix ? 'mapCell' : 'cell'}${cellNum}`);
	if (!cellElem) return;

	swapClass('cellColor', 'cellColorCurrent', cellElem);
	let elem = document.getElementById('goodGuyHealthMax');
	let elemText = prettify(game.global.soldierHealthMax);
	if (elem.innerHTML !== elemText.toString()) elem.innerHTML = elemText;
	updateGoodBar();
	updateBadBar(cell);

	elem = document.getElementById('badGuyHealthMax');
	elemText = prettify(cell.maxHealth);
	if (elem.innerHTML !== elemText.toString()) elem.innerHTML = elemText;

	if (!skipNum) {
		elem = document.getElementById('trimpsFighting');
		elemText = prettify(game.resources.trimps.getCurrentSend());
		if (challengeActive('Trimp') && game.jobs.Amalgamator.owned > 0) elemText = toZalgo(elemText, game.global.world);
		if (elem.innerHTML !== elemText.toString()) elem.innerHTML = elemText;
	}

	let blockDisplay = '';
	if (game.global.universe == 2) {
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
	if (elem.innerHTML !== elemText.toString()) elem.innerHTML = elemText;

	elem = document.getElementById('badGuyAttack');
	elemText = `${calculateDamage(cell.attack, true, false, false, cell)}${game.global.usingShriek ? ' <span class="icomoon icon-chain"></span>' : ''}`;
	if (elem.innerHTML !== elemText) elem.innerHTML = elemText;

	if (game.global.usingShriek) swapClass('dmgColor', 'dmgColorRed', elem);
}

function setVoidCorruptionIcon(regularMap) {
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
	if (corruptionElem.innerHTML !== elemText.toString()) corruptionElem.innerHTML = elemText;
}

function updateAntiStacks() {
	const elem = document.getElementById('anticipationSpan');
	let elemText = '';

	if (game.global.antiStacks > 0) {
		let number = game.global.antiStacks * getPerkLevel('Anticipation') * game.portal.Anticipation.modifier;
		number = Math.floor(number * 100);
		const verb = game.jobs.Amalgamator.owned > 0 ? 'prepare' : 'populate';
		const s = game.global.antiStacks == 1 ? '' : 's';
		elemText = `<span class="badge antiBadge" onmouseover="tooltip('Anticipation', 'customText', event, 'Your Trimps are dealing ${number}% extra damage for taking ${game.global.antiStacks} second${s} to ${verb}.')" onmouseout="tooltip('hide')">${game.global.antiStacks}<span class="icomoon icon-target2"></span></span>`;
	}

	if (elem.innerHTML !== elemText) elem.innerHTML = elemText;
}

function setMutationTooltip(which, mutation) {
	if (usingRealTimeOffline && loops % 600 !== 0) return;
	const elem = document.getElementById('corruptionBuff');
	const effect = mutationEffects[which];
	if (typeof effect === 'undefined') return;
	if (typeof mutations[mutation].tooltip === 'undefined') return;

	const elemText = `<span class="badge badBadge ${mutation}" onmouseover="tooltip('${effect.title}', 'customText', event, '${mutations[mutation].tooltip(which)}')" onmouseout="tooltip('hide')"><span class="${effect.icon}"></span></span>&nbsp;`;
	if (elem.innerHTML !== elemText) elem.innerHTML = elemText;
}

function rewardLiquidZone() {
	messageLock = true;
	game.stats.battlesWon.value += 99;
	var voidMaps = 0;
	var unlocks = ['', '']; //[unique, repeated]
	var food = game.resources.food.owned;
	var wood = game.resources.wood.owned;
	var metal = game.resources.metal.owned;
	var helium = game.resources.helium.owned;
	var fragments = game.resources.fragments.owned;
	var trimpsCount = game.resources.trimps.realMax();
	var tokText;
	var trackedImps = {
		Feyimp: 0,
		Magnimp: 0,
		Tauntimp: 0,
		Venimp: 0,
		Whipimp: 0,
		Skeletimp: 0,
		Megaskeletimp: 0
	};
	var hiddenUpgrades = ['fiveTrimpMax', 'Map', 'fruit', 'groundLumber', 'freeMetals', 'Foreman', 'FirstMap'];
	for (var x = 1; x < 100; x++) {
		game.global.voidSeed++;
		game.global.scrySeed++;
		if (isScryerBonusActive()) tryScry();
		if (checkVoidMap() == 1) voidMaps++;
		var cell = game.global.gridArray[x];
		if (cell.special !== '') {
			var unlock = game.worldUnlocks[cell.special];
			if (typeof unlock !== 'undefined' && typeof unlock.fire !== 'undefined') {
				unlock.fire(x);
				if (hiddenUpgrades.indexOf(cell.special) == -1) {
					var index = unlock.world < 0 ? 1 : 0;
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
			var tokReward = rewardToken(cell.empowerment);
			if (game.global.messages.Loot.token && game.global.messages.Loot.enabled && tokReward) {
				tokText = "<span class='message empoweredCell" + cell.empowerment + "'>Found " + prettify(tokReward) + ' Token' + (tokReward == 1 ? '' : 's') + ' of ' + cell.empowerment + '!</span>';
			}
		}
		if (typeof game.badGuys[cell.name].loot !== 'undefined') game.badGuys[cell.name].loot(cell.level);
		if (typeof trackedImps[cell.name] !== 'undefined') {
			trackedImps[cell.name]++;
		}
	}
	messageLock = false;
	var text = '';
	var addUniques = unlocks[0] !== '' && game.global.messages.Unlocks.unique;
	var addRepeateds = unlocks[1] !== '' && game.global.messages.Unlocks.repeated;
	if ((addUniques || addRepeateds) && game.global.messages.Unlocks.enabled) {
		text += 'Unlocks Found: ';
		if (addUniques) {
			text += unlocks[0];
			if (addRepeateds) text += ', ';
		}
		if (addRepeateds) text += unlocks[1];
		text += '<br/>';
	}
	if (game.global.messages.Loot.enabled && (game.global.messages.Loot.primary || game.global.messages.Loot.secondary)) {
		text += 'Resources Found:';
		var heCount = game.resources.helium.owned - helium;
		if (game.global.messages.Loot.helium && heCount > 0) {
			text += ' Helium - ' + prettify(heCount) + ',';
		}
		if (game.global.messages.Loot.secondary) {
			text += ' Max Trimps - ' + prettify(game.resources.trimps.realMax() - trimpsCount) + ',';
			text += ' Fragments - ' + prettify(game.resources.fragments.owned - fragments) + ',';
		}
		if (game.global.messages.Loot.primary) {
			text += ' Food - ' + prettify(game.resources.food.owned - food) + ',';
			text += ' Wood - ' + prettify(game.resources.wood.owned - wood) + ',';
			text += ' Metal - ' + prettify(game.resources.metal.owned - metal) + ',';
		}

		text = text.slice(0, -1);
		text += '<br/>';
	}
	var trackedList = '';
	var bones = '';
	for (var item in trackedImps) {
		if (trackedImps[item] > 0) {
			if (item == 'Skeletimp' || item == 'Megaskeletimp') {
				bones = item;
				continue;
			}
			if (trackedList !== '') trackedList += ', ';
			trackedList += item + ' - ' + trackedImps[item];
		}
	}
	if (trackedList != '' && game.global.messages.Loot.exotic && game.global.messages.Loot.enabled) {
		trackedList = 'Rare Imps: ' + trackedList + '<br/>';
		text += trackedList;
	}
	if (bones != '' && game.global.messages.Loot.bone && game.global.messages.Loot.enabled) {
		bones = 'Found a ' + bones + '!<br/>';
		text += bones;
	}
	if (tokText != null) {
		text += tokText + '<br/>';
	}
	if (text) {
		text = 'You liquified a Liquimp!<br/>' + text;
		text = text.slice(0, -5);
		message(text, 'Notices', 'star', 'LiquimpMessage');
	}
	if (challengeActive('Lead')) {
		game.challenges.Lead.stacks -= 100;
		manageLeadStacks();
	}
	game.stats.zonesLiquified.value++;
	nextWorld();
	drawAllUpgrades(true);
}

function getGeneratorTickTime() {
	const baseTick = 60;
	const zoneMult = game.talents.quickGen.purchased ? 1.03 : 1.02;
	const tickTime = Math.ceil((1 / Math.pow(zoneMult, Math.floor((game.global.world - mutations.Magma.start()) / 3))) * baseTick * 10) / 10;
	return tickTime < 5 ? 5 : tickTime;
}

function canGeneratorTick() {
	return game.global.timeSinceLastGeneratorTick >= getGeneratorTickTime() * 1000;
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
	if (item == 'Overclocker' && (!game.permanentGeneratorUpgrades.Hybridization.owned || !game.permanentGeneratorUpgrades.Storage.owned)) color = 'Danger';
	let text;
	if (permanent && game.permanentGeneratorUpgrades[item].owned) {
		color = 'Grey';
		text = 'Done';
	} else text = 'Buy: ' + prettify(cost) + ' Magmite';

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
	if ((nextTickElem !== message.toString() && !usingRealTimeOffline) || (usingRealTimeOffline && loops % 600 === 0)) nextTickElem.innerHTML = message;

	let countingTick = Math.round((tickTime - nextTickIn) * 10) / 10;
	countingTick = Math.round(countingTick * 10) / 10;
	if (game.options.menu.generatorAnimation.enabled == 1 && thisTime >= framesPerVisual - 1) {
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
	if (elem.innerHTML !== prettify(currentFuel).toString()) elem.innerHTML = prettify(currentFuel);
	const elem2 = document.getElementById('generatorFuelMax');
	if (elem2.innerHTML !== prettify(maxFuel).toString()) elem2.innerHTML = prettify(maxFuel);

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
	if (challengeActive('Eradicated')) to = 1;
	if (!updateOnly) game.global.generatorMode = to;
	to = game.global.generatorMode;
	if (game.global.genPaused) to = challengeActive('Eradicated') ? 1 : 0;
	if (to === 2 && game.global.magmaFuel < getGeneratorFuelCap(false, true)) to = 3;

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

function handlePoisonDebuff() {
	if (usingRealTimeOffline && loops % 600 !== 0) return;
	let elem = document.getElementById('poisonEmpowermentIcon');

	if (getEmpowerment() !== 'Poison') {
		game.empowerments.Poison.currentDebuffPower = 0;
		if (elem && elem.style.display !== 'none') {
			elem.style.display = 'none';
		}
		return;
	}

	if (!elem) {
		document.getElementById('badDebuffSpan').innerHTML += `<span class="badge badBadge" id="poisonEmpowermentIcon" onmouseover="tooltip('Poisoned', null, event)" onmouseout="tooltip('hide')"><span id="poisonEmpowermentText"></span><span class="icomoon icon-flask"></span></span>`;
		elem = document.getElementById('poisonEmpowermentIcon');
	}

	if (elem.style.display !== 'inline-block') {
		elem.style.display = 'inline-block';
	}

	const poisonEmpowermentText = document.getElementById('poisonEmpowermentText');
	const poisonDamage = prettify(game.empowerments.Poison.getDamage());
	if (poisonEmpowermentText && poisonEmpowermentText.innerHTML !== poisonDamage.toString()) {
		poisonEmpowermentText.innerHTML = poisonDamage;
	}
}

function handleIceDebuff() {
	if (usingRealTimeOffline && loops % 600 !== 0) return;
	let elem = document.getElementById('iceEmpowermentIcon');

	if (getEmpowerment() !== 'Ice') {
		game.empowerments.Ice.currentDebuffPower = 0;
		if (elem && elem.style.display !== 'none') {
			elem.style.display = 'none';
		}
		return;
	}

	if (!elem) {
		document.getElementById('badDebuffSpan').innerHTML += `<span class="badge badBadge" id="iceEmpowermentIcon" onmouseover="tooltip('Chilled', null, event)" onmouseout="tooltip('hide')"><span id="iceEmpowermentText"></span><span class="glyphicon glyphicon-certificate"></span></span>`;
		elem = document.getElementById('iceEmpowermentIcon');
	}

	if (elem.style.display !== 'inline-block') {
		elem.style.display = 'inline-block';
	}

	const iceEmpowermentText = document.getElementById('iceEmpowermentText');
	const newIceEmpowermentText = prettify(game.empowerments.Ice.currentDebuffPower);
	if (iceEmpowermentText && iceEmpowermentText.innerHTML !== newIceEmpowermentText.toString()) {
		iceEmpowermentText.innerHTML = newIceEmpowermentText;
	}
}

function handleWindDebuff() {
	if (usingRealTimeOffline && loops % 600 !== 0) return;
	let elem = document.getElementById('windEmpowermentIcon');
	if (getEmpowerment() !== 'Wind') {
		game.empowerments.Wind.currentDebuffPower = 0;
		if (elem && elem.style.display !== 'none') {
			elem.style.display = 'none';
		}
		return;
	}

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
	if (windEmpowermentText && windEmpowermentText.innerHTML !== newWindEmpowermentText.toString()) {
		windEmpowermentText.innerHTML = newWindEmpowermentText;
	}
}

function manageStacks(stackName, stackCount, isTrimps, elemName, icon, tooltipText, forceHide, addSpace, addClass) {
	if (usingRealTimeOffline && loops % 600 !== 0) return;
	var elem = document.getElementById(elemName);
	var parentName = isTrimps ? 'goodGuyName' : 'badDebuffSpan';
	var parent = document.getElementById(parentName);
	if (forceHide) {
		if (elem === null) return;
		parent.removeChild(elem);
		return;
	}
	if (elem === null) {
		var className = addClass ? " class='" + addClass + "'" : '';
		parent.innerHTML += "<span id='" + elemName + "'" + className + '></span>';
		elem = document.getElementById(elemName);
	}
	if (stackCount == -1) stackCount = '';
	var space = addSpace ? '&nbsp;' : '';
	elem.innerHTML = ' <span class="badge antiBadge" onmouseover="tooltip(\'' + stackName + "', 'customText', event, '" + tooltipText + '\');" onmouseout="tooltip(\'hide\')"><span>' + stackCount + '</span>' + space + '<span class="' + icon + '"></span></span>';
}

function applyMultipliers(multipliers, stat, challenge, postChallengeCheck) {
	Object.keys(multipliers).forEach((key) => {
		if (challenge && postChallengeCheck && key === 'Nurture' && game.challenges.Nurture.boostsActive()) stat *= multipliers[key]();
		else if (challenge) stat *= challengeActive(key) ? multipliers[key]() : 1;
		else stat *= multipliers[key]();
	});
	return stat;
}

function applyDailyMultipliers(modifier, value = 1) {
	const dailyChallenge = game.global.dailyChallenge;
	if (typeof dailyChallenge[modifier] === 'undefined') return value;
	return dailyModifiers[modifier].getMult(dailyChallenge[modifier].strength, dailyChallenge[modifier].stacks);
}

/* function calculateDamage(number = 1, buildString, isTrimp, noCheckAchieve, cell, noFluctuation) {
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
				voidSipon: () => (Fluffy.isRewardActive('voidSiphon') && game.stats.totalVoidMaps.value ? 1 + game.stats.totalVoidMaps.value * 0.05 : 1),
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
				spireDaily: () => (Fluffy.isRewardActive('SADailies') && challengeActive('Daily') ? Fluffy.rewardConfig.SADailies.attackMod() : 1)
			};
			number = applyMultipliers(multipliers, number, true, true);

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
			number = applyMultipliers(challengeMultipliers, number, true, true);
		}

		if (challengeActive('Daily')) {
			if (game.talents.daily.purchased) number *= 1.5;
			if (typeof game.global.dailyChallenge.minDamage !== 'undefined') {
				if (minFluct == -1) minFluct = fluctuation;
				minFluct += dailyModifiers.minDamage.getMult(game.global.dailyChallenge.minDamage.strength);
			}
			if (typeof game.global.dailyChallenge.maxDamage !== 'undefined') {
				if (maxFluct == -1) maxFluct = fluctuation;
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
			number = applyMultipliers(challengeMultipliers, number, true);
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
			number = applyMultipliers(challengeMultipliers, number, true);

			if (!game.global.mapsActive && game.global.novaMutStacks > 0) number *= u2Mutations.types.Nova.enemyAttackMult();
			if (game.global.universe == 2 && cell.u2Mutation && cell.u2Mutation.length && u2Mutations.types.Rage.hasRage(cell)) number *= u2Mutations.types.Rage.enemyAttackMult();
		}

		if (challengeActive('Daily')) {
			number *= applyDailyMultipliers('bloodthirst', 1);
			number *= applyDailyMultipliers('badStrength', 1);
			if (game.global.mapsActive) number *= applyDailyMultipliers('badMapStrength', 1);
			if (!game.global.mapsActive) number *= applyDailyMultipliers('empower', 1);
		}

		//Keep ice last for achievements
		if (getEmpowerment() == 'Ice') {
			number *= game.empowerments.Ice.getCombatModifier();
			if (number >= 0 && number < 1 && !game.global.mapsActive) giveSingleAchieve('Brr');
		}
		if (game.global.world >= getObsidianStart() && !game.global.mapsActive) number = Infinity;
	}

	if (minFluct > 1) minFluct = 1;
	if (maxFluct == -1) maxFluct = fluctuation;
	if (minFluct == -1) minFluct = fluctuation;

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
				if (Number(critMin.toString()[0]) % 2 == 0) actuallyLucky = true;
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
} */

function buyBuilding(what, confirmed, fromAuto, forceAmt) {
	if (game.options.menu.pauseGame.enabled || what === 'Hub') return false;
	if (!forceAmt && !confirmed && game.options.menu.lockOnUnlock.enabled == 1 && new Date().getTime() - 1000 <= game.global.lastUnlock) return false;

	const toBuy = game.buildings[what];
	if (typeof toBuy === 'undefined') return false;

	let purchaseAmt = 1;
	if (what === 'Antenna') purchaseAmt = 1;
	else if (forceAmt) purchaseAmt = Math.min(forceAmt, calculateMaxAfford(toBuy, true, false, false, true));
	else if (!toBuy.percent) purchaseAmt = game.global.buyAmt == 'Max' ? calculateMaxAfford(toBuy, true, false) : game.global.buyAmt;
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
	if (!buildingsBar) return;

	const timeRemaining = document.getElementById('queueTimeRemaining');
	const speedElem = document.getElementById('buildSpeed');

	if (game.global.crafting === '' && game.global.buildingsQueue.length > 0) {
		setNewCraftItem();
	}

	if ((game.global.autoCraftModifier <= 0 && game.global.playerGathering !== 'buildings') || game.global.crafting === '') {
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
		if (timeRemaining.textContent !== elemText) timeRemaining.textContent = elemText;

		buildingsBar.style.opacity = game.options.menu.queueAnimation.enabled ? percent : '0';
		if (game.global.timeLeftOnCraft > 0) return;
	}

	if (game.global.trapBuildToggled && game.global.trapBuildAllowed && game.global.buildingsQueue.length === 1 && game.global.buildingsQueue[0] === 'Trap.1') {
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

//Buildings Specific
function removeQueueItem(what, force) {
	if (game.options.menu.pauseGame.enabled && !force) return;
	const queue = document.getElementById('queueItemsHere');

	if (what === 'first') {
		const elem = queue.firstChild;
		let multiCraftMax = bwRewardUnlocked('DecaBuild') ? 10 : bwRewardUnlocked('DoubleBuild') ? 2 : 1;
		let [item, amount] = game.global.buildingsQueue[0].split('.');
		amount = parseInt(amount, 10);
		multiCraftMax = Math.min(multiCraftMax, amount);

		amount -= multiCraftMax;
		buildBuilding(item, multiCraftMax);

		if (amount > 0) {
			const newQueue = `${item}.${amount}`;
			const name = `${item} X${amount}`;
			game.global.buildingsQueue[0] = newQueue;
			elem.firstChild.innerHTML = name;
			checkEndOfQueue();
			return;
		}
		queue.removeChild(elem);
		game.global.buildingsQueue.splice(0, 1);
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
	const originalAmt = building.owned;
	building.owned += amt;
	let toIncrease;
	checkAchieve('housing', what);

	const ownedElem = document.getElementById(what + 'Owned');
	if (ownedElem) ownedElem.innerHTML = building.owned;

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
	if (typeof building.fire !== 'undefined') building.fire();

	if (what === 'Wormhole') {
		const [baseCost, costRatio] = building.cost.helium;
		let spent = (baseCost * (Math.pow(costRatio, building.owned - originalAmt) - Math.pow(costRatio, building.owned))) / (costRatio - 1);
		spent = Math.floor(spentLastX);
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

function numTab(what, p) {
	let num = 0;
	if (what == 6 && game.global.buyAmt == 'Max') tooltip('Max', null, 'update', p);
	if (what == 5) {
		unlockTooltip();
		tooltip('hide');
		var numBox = document.getElementById('customNumberBox');
		if (numBox) {
			num = numBox.value;
			game.global.lastCustomExact = num;
			if (game.global.firstCustomExact == -1) game.global.firstCustomExact = num;
			if (num.split('%')[1] == '') {
				num = num.split('%');
				num[0] = parseFloat(num[0]);
				if (num[0] <= 100 && num[0] >= 0) {
					var workspaces = game.workspaces;
					num = Math.floor(workspaces * (num[0] / 100));
				} else num = 1;
			} else if (num.split('/')[1]) {
				num = num.split('/');
				num[0] = parseFloat(num[0]);
				num[1] = parseFloat(num[1]);
				var workspaces = game.workspaces;
				num = Math.floor(workspaces * (num[0] / num[1]));
				if (num < 0 || num > workspaces) num = 1;
			} else {
				num = convertNotationsToNumber(num);
			}
		} else num = game.global.lastCustomAmt;
		if (num === 0) num = 1;
		if (!isNumberBad(num)) {
			let = document.getElementById('tab5Text');
			const elemText = `+${prettify(num)}`;
			if (elem && elem.innerHTML !== elemText) elem.innerHTML = elemText;

			elem = document.getElementById('ptab5Text');
			if (elem && elem.innerHTML !== elemText) elem.innerHTML = elemText;
			game.global.buyAmt = num;
			game.global.lastCustomAmt = num;
			if (game.global.firstCustomAmt == -1) game.global.firstCustomAmt = num;
		} else {
			if (numBox.value == 'pants' && game.global.sLevel >= 4) {
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
		if (what == x) thisTab.className = thisTab.className.replace('tabNotSelected', 'tabSelected');
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
	const elemText = what == 6 && game.global.maxSplit != 1 ? game.global.maxSplit : 'Max';
	if (elem && elem.innerHTML !== elemText.toString()) elem.innerHTML = elemText;
	if (p) {
		displayPortalUpgrades(true);
	}
}

function startFight() {
	if (game.global.challengeActive && typeof game.challenges[game.global.challengeActive].onStartFight === 'function') {
		game.challenges[game.global.challengeActive].onStartFight();
	}
	game.global.battleCounter = 0;
	document.getElementById('badGuyCol').style.visibility = 'visible';
	var cellNum;
	var cell;
	var cellElem;
	var badCoord;
	var instaFight = false;
	var madeBadGuy = false;
	var ubersmithActive = false;
	var map = false;
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
		if (cellElem == null) {
			//Not sure what causes this to be needed, but on very rare occasions, this can prevent some save files from freezing on load
			if (game.global.lastClearedCell != 99) {
				if (game.global.lastClearedCell == -1) {
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
	var badName = "<span id='actualBadName'>" + cell.name + '</span>';
	var displayedName;
	if (challengeActive('Coordinate')) badCoord = getBadCoordLevel();
	if (typeof game.badGuys[cell.name].displayName !== 'undefined') {
		badName = game.badGuys[cell.name].displayName;
		if (challengeActive('Coordinate')) badName += 's (' + prettify(badCoord) + ')';
		displayedName = "<span id='actualBadName'>" + badName + '</span>';
	}
	if (cell.name == 'Improbability' && game.global.spireActive) {
		displayedName = 'Druopitee';
		if (challengeActive('Coordinate')) displayedName = 'Druopitee and Pals';
	} else if (cell.name == 'Omnipotrimp' && game.global.spireActive) {
		displayedName = 'Echo of Druopitee';
		if (challengeActive('Coordinate')) displayedName = "<span class='smallEnemyName'>Echoes of Druopitee and Pals</span>";
	} else if (cell.name == 'Improbability' && challengeActive('Coordinate')) {
		displayedName = 'Improbabilities';
	} else if (!displayedName && challengeActive('Coordinate')) {
		var newName = cell.name.replace('_', ' ') + 's' + ' (' + prettify(badCoord) + ')';
		badName = badName.replace(cell.name, newName);
		displayedName = badName;
	} else {
		displayedName = badName.replace('_', ' ');
	}
	if (challengeActive('Smithless') && !game.global.mapsActive && game.global.world % 25 == 0 && game.global.lastClearedCell == -1 && !cell.failedUber) {
		ubersmithActive = true;
		game.challenges.Smithless.saveName = displayedName;
		displayedName = 'Ubersmith';
	}
	if (displayedName == 'Mutimp' || displayedName == 'Hulking Mutimp') {
		displayedName = "<span class='Mutimp'>" + displayedName + '</span>';
	}
	if (mutations.Living.active()) {
		badName = "<span id='livingMutationContainer'" + (cell.mutation == 'Living' ? " class='badNameMutation Living'" : '') + "><span id='livingMutationName'>" + (cell.mutation == 'Living' ? 'Living ' : '') + '</span>' + displayedName + '</span>';
	} else if (cell.vm && visualMutations[cell.vm].highlightMob && displayedName == visualMutations[cell.vm].highlightMob) {
		var tempName = cell.mutation ? mutations[cell.mutation].namePrefix + ' ' + displayedName : displayedName;
		badName = "<span class='badNameMutation " + cell.vm + "'>" + tempName + '</span>';
	} else if (cell.mutation) {
		badName = "<span class='badNameMutation " + cell.mutation + "'>" + mutations[cell.mutation].namePrefix + ' ' + displayedName + '</span>';
	} else if (cell.u2Mutation && cell.u2Mutation.length) {
		badName = "<span class='badNameMutation u2Mutation' style='color: " + u2Mutations.getColor(cell.u2Mutation) + "'>" + u2Mutations.getName(cell.u2Mutation) + ' ' + displayedName + '</span>';
	} else if (cell.vm && visualMutations[cell.vm].namePrefix) {
		badName = "<span class='badNameMutation " + cell.vm + "'>" + visualMutations[cell.vm].namePrefix + ' ' + displayedName + '</span>';
	} else badName = displayedName;
	if (cell.empowerment) {
		badName = getEmpowerment(-1, true) + ' ' + badName;
		badName = "<span class='badNameMutation badName" + getEmpowerment(-1) + "'>" + badName + '</span>';
	}
	if (cell.name == 'Omnipotrimp' && game.global.world % 5 == 0 && !game.global.spireActive) {
		badName += ' <span class="badge badBadge Magma" onmouseover="tooltip(\'Superheated\', \'customText\', event, \'This Omnipotrimp is Superheated, and will explode on death.\')" onmouseout="tooltip(\'hide\')"><span class="icomoon icon-fire2"></span></span>';
	}
	if (game.global.brokenPlanet && !game.global.mapsActive) {
		badName += " <span class=\"badge badBadge\" onmouseover=\"tooltip('Pierce', 'customText', event, '" + prettify(getPierceAmt() * 100) + '% of the damage from this Bad Guy pierces through block\')" onmouseout="tooltip(\'hide\')"><span class="glyphicon glyphicon-tint"></span></span>';
	}
	if (challengeActive('Glass') || challengeActive('Slow') || (challengeActive('Desolation') && game.global.mapsActive) || (cell.u2Mutation && cell.u2Mutation.length) || ((game.badGuys[cell.name].fast || cell.mutation == 'Corruption') && game.global.challengeActive != 'Coordinate' && game.global.challengeActive != 'Nom'))
		badName += ' <span class="badge badBadge" onmouseover="tooltip(\'Fast\', \'customText\', event, \'This Bad Guy is fast and attacks first\')" onmouseout="tooltip(\'hide\')"><span class="glyphicon glyphicon-forward"></span></span>';
	if (challengeActive('Electricity') || challengeActive('Mapocalypse')) {
		badName += ' <span class="badge badBadge" onmouseover="tooltip(\'Electric\', \'customText\', event, \'This Bad Guy is electric and stacks a debuff on your Trimps\')" onmouseout="tooltip(\'hide\')"><span class="icomoon icon-power-cord"></span></span>';
	}
	const badGuyName = document.getElementById('badGuyName');
	if ((badGuyName.innerHTML !== badName.toString() && !usingRealTimeOffline) || (usingRealTimeOffline && loops % 600 === 0)) badGuyName.innerHTML = badName;

	if (challengeActive('Domination')) handleDominationDebuff();
	var corruptionStart = mutations.Corruption.start(true);
	if (cell.maxHealth == -1 && checkIfSpireWorld() && game.global.spireActive && !game.global.mapsActive && cell.corrupted) {
		if (Fluffy.isRewardActive('eliminator')) {
			cell.corrupted = 'none';
		} else if (Fluffy.isRewardActive('purifier')) {
			if (getRandomIntSeeded(game.global.mutationSeed++, 0, 100) < 50) cell.corrupted = 'none';
		}
	}
	if (cell.mutation) setMutationTooltip(cell.corrupted, cell.mutation);
	else if (map && map.location == 'Void' && game.global.world >= corruptionStart) {
		setVoidCorruptionIcon();
	} else if (map && mutations.Magma.active()) {
		setVoidCorruptionIcon(true);
	} else {
		const corruptionBuffElem = document.getElementById('corruptionBuff');
		if ((corruptionBuffElem.innerHTML !== '' && !usingRealTimeOffline) || (usingRealTimeOffline && loops % 600 === 0)) corruptionBuffElem.innerHTML = '';
	}
	if (challengeActive('Balance') || challengeActive('Unbalance')) updateBalanceStacks();
	if (challengeActive('Toxicity')) updateToxicityStacks();
	if (cell.maxHealth == -1) {
		refillEnergyShield();
		var overkill = 0;
		var plaguebringer = 0;

		if (cell.health != -1) overkill = cell.health;
		if (cell.u2Mutation && cell.u2Mutation.length) cell.attack = u2Mutations.getAttack(cell);
		else if (cell.mutation && typeof mutations[cell.mutation].attack !== 'undefined') cell.attack = mutations[cell.mutation].attack(cell.level, cell.name);
		else cell.attack = game.global.getEnemyAttack(cell.level, cell.name);
		if (cell.u2Mutation && cell.u2Mutation.length) cell.health = u2Mutations.getHealth(cell);
		else if (cell.mutation && typeof mutations[cell.mutation].health !== 'undefined') cell.health = mutations[cell.mutation].health(cell.level, cell.name);
		else cell.health = game.global.getEnemyHealth(cell.level, cell.name);
		if (game.global.spireActive && checkIfSpireWorld() && !game.global.mapsActive) {
			cell.origAttack = cell.attack;
			cell.origHealth = cell.health;
			cell.attack = getSpireStats(cell.level, cell.name, 'attack');
			cell.health = getSpireStats(cell.level, cell.name, 'health');
		}
		if (cell.corrupted == 'corruptStrong') cell.attack *= 2;
		if (cell.corrupted == 'healthyStrong') cell.attack *= 2.5;
		if (cell.corrupted == 'corruptTough') cell.health *= 5;
		if (cell.corrupted == 'healthyTough') cell.health *= 7.5;
		if (cell.empowerment) {
			if (cell.mutation != 'Corruption') {
				cell.health = mutations.Corruption.health(cell.level, cell.name);
				cell.attack = mutations.Corruption.attack(cell.level, cell.name);
			}
			cell.health *= 4;
			cell.attack *= 1.2;
		}
		if (challengeActive('Obliterated') || challengeActive('Eradicated')) {
			var oblitMult = challengeActive('Eradicated') ? game.challenges.Eradicated.scaleModifier : 1e12;
			var zoneModifier = Math.floor(game.global.world / game.challenges[game.global.challengeActive].zoneScaleFreq);
			oblitMult *= Math.pow(game.challenges[game.global.challengeActive].zoneScaling, zoneModifier);
			cell.health *= oblitMult;
			cell.attack *= oblitMult;
		}
		if (challengeActive('Daily')) {
			if (typeof game.global.dailyChallenge.badHealth !== 'undefined') {
				cell.health *= dailyModifiers.badHealth.getMult(game.global.dailyChallenge.badHealth.strength);
			}
			if (typeof game.global.dailyChallenge.badMapHealth !== 'undefined' && game.global.mapsActive) {
				cell.health *= dailyModifiers.badMapHealth.getMult(game.global.dailyChallenge.badMapHealth.strength);
			}
			if (typeof game.global.dailyChallenge.empoweredVoid !== 'undefined' && game.global.mapsActive && map.location == 'Void') {
				var empVoidStr = dailyModifiers.empoweredVoid.getMult(game.global.dailyChallenge.empoweredVoid.strength);
				cell.health *= empVoidStr;
				cell.attack *= empVoidStr;
			}
			if (typeof game.global.dailyChallenge.empower !== 'undefined') {
				if (!game.global.mapsActive) cell.health *= dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks);
				updateDailyStacks('empower');
			}
		}
		if (challengeActive('Life')) {
			cell.health *= 11;
			cell.attack *= 6;
		}
		if (challengeActive('Coordinate')) cell.health *= badCoord;
		if (game.global.mapsActive) {
			var difficulty = map.difficulty;
			cell.attack *= difficulty;
			cell.health *= difficulty;
			if (game.global.world >= corruptionStart) {
				if (mutations.Magma.active() && map.location == 'Void') {
					cell.attack *= mutations.Corruption.statScale(3).toFixed(1);
					cell.health *= mutations.Corruption.statScale(10).toFixed(1);
				} else if (map.location == 'Void' || mutations.Magma.active()) {
					cell.attack *= (mutations.Corruption.statScale(3) / 2).toFixed(1);
					cell.health *= (mutations.Corruption.statScale(10) / 2).toFixed(1);
				}
			}
		}
		if (challengeActive('Meditate')) cell.health *= 2;
		if (challengeActive('Toxicity')) {
			cell.attack *= 5;
			cell.health *= 2;
		}
		if (challengeActive('Balance')) {
			cell.attack *= game.global.mapsActive ? 2.35 : 1.17;
			cell.health *= 2;
		}
		if (challengeActive('Lead') && game.challenges.Lead.stacks > 0) {
			cell.health *= 1 + Math.min(game.challenges.Lead.stacks, 200) * 0.04;
		}
		if (challengeActive('Unbalance')) {
			cell.health *= game.global.mapsActive ? 2 : 3;
			cell.attack *= 1.5;
		} else if (challengeActive('Domination')) {
			var dominating = false;
			if (map && map.size == cellNum + 1) dominating = true;
			else if (!map && cellNum == 99) dominating = true;
			if (dominating) {
				cell.attack *= 2.5;
				cell.health *= 7.5;
			} else {
				cell.attack *= 0.1;
				cell.health *= 0.1;
			}
		} else if (challengeActive('Quest')) {
			cell.health *= game.challenges.Quest.getHealthMult();
		} else if (challengeActive('Revenge') && game.global.world % 2 == 0) {
			cell.health *= 10;
		} else if (challengeActive('Mayhem')) {
			var mayhemMult = game.challenges.Mayhem.getEnemyMult();
			cell.health *= mayhemMult;
			cell.attack *= mayhemMult;
		} else if (challengeActive('Exterminate')) {
			var extMult = game.challenges.Exterminate.getSwarmMult();
			cell.health *= extMult;
			cell.attack *= extMult;
		} else if (challengeActive('Hypothermia')) {
			var hypMult = game.challenges.Hypothermia.getEnemyMult();
			cell.health *= hypMult;
			cell.attack *= hypMult;
		} else if (challengeActive('Experience')) {
			var xpMult = game.challenges.Experience.getEnemyMult();
			cell.health *= xpMult;
			cell.attack *= xpMult;
		} else if (challengeActive('Desolation')) {
			var desoMult = game.challenges.Desolation.getEnemyMult();
			cell.health *= desoMult;
			cell.attack *= desoMult;
		} else if (challengeActive('Frigid')) {
			var frigidMult = game.challenges.Frigid.getEnemyMult();
			cell.health *= frigidMult;
			cell.attack *= frigidMult;
		}
		if (challengeActive('Duel')) {
			if (game.challenges.Duel.enemyStacks < 20) cell.health *= game.challenges.Duel.healthMult;
		}
		if (cell.name == 'Improbability' || cell.name == 'Omnipotrimp') {
			if (game.global.roboTrimpLevel && game.global.useShriek) activateShriek();
			if (game.global.world >= corruptionStart) {
				if (game.global.spireActive) {
					cell.origHealth *= mutations.Corruption.statScale(10);
					cell.origAttack *= mutations.Corruption.statScale(3);
				} else {
					cell.health *= mutations.Corruption.statScale(10);
					cell.attack *= mutations.Corruption.statScale(3);
				}
			}
		}
		if (challengeActive('Nurture')) {
			if (map) cell.health *= 10;
			else cell.health *= 2;
			cell.health *= game.buildings.Laboratory.getEnemyMult();
		}
		if (challengeActive('Alchemy')) {
			const alchMap = Boolean(map);
			const alchVoid = alchMap && map.location == 'Void';
			const statMult = alchObj.getEnemyStats(alchMap, alchVoid) + 1;
			cell.attack *= statMult;
			cell.health *= statMult;
		}
		//Mayhem and Storm last so attack and health restore properly
		if ((challengeActive('Mayhem') && cellNum == 99 && !game.global.mapsActive) || challengeActive('Pandemonium')) {
			cell.preMayhemHealth = cell.health;
			if (cellNum == 99 && !game.global.mapsActive) cell.health *= game.challenges[game.global.challengeActive].getBossMult();
			else cell.health *= game.challenges.Pandemonium.getPandMult();
		}
		if (challengeActive('Storm') && !map) {
			game.challenges.Storm.cellStartAttack = cell.attack;
			game.challenges.Storm.cellStartHealth = cell.health;
			cell.health *= game.challenges.Storm.getHealthMult();
			cell.attack *= game.challenges.Storm.getAttackMult();
		}
		if (challengeActive('Glass')) {
			game.challenges.Glass.cellStartHealth = cell.health;
			cell.health *= game.challenges.Glass.healthMult();
		}
		if (ubersmithActive) {
			cell.health *= game.challenges.Smithless.uberMult;
			cell.ubersmith = true;
			game.challenges.Smithless.uberAttacks = 0;
			overkill = 0;
		}
		//End bonuses that alter starting attack/health
		cell.maxHealth = cell.health;
		if (overkill == 'shatter' || overkill == 'compressed') cell.health = 0;
		else if (game.global.universe == 1 && getPerkLevel('Overkill') && !(!map && game.global.gridArray[0].name == 'Liquimp')) cell.health -= overkill * getPerkLevel('Overkill') * 0.005;
		else if (game.global.universe == 2 && (game.global.challengeActive != 'Wither' || !game.global.runningChallengeSquared) && (u2Mutations.tree.Overkill1.purchased || (game.global.mapsActive && u2Mutations.tree.MadMap.purchased))) {
			if (game.global.mapsActive && u2Mutations.tree.MadMap.purchased) {
				cell.health -= overkill;
			} else {
				if (canU2Overkill()) cell.health -= overkill * 0.005;
			}
		}
		if (cell.health < 1) {
			var overkillerCount = 0;
			if (game.global.universe == 1) {
				var overkillerCount = Fluffy.isRewardActive('overkiller');
				if (game.talents.overkill.purchased) overkillerCount++;
				if (getEmpowerment() == 'Ice') {
					if (game.empowerments.Ice.getLevel() >= 50) overkillerCount++;
					if (game.empowerments.Ice.getLevel() >= 100) overkillerCount++;
				}
				if (getUberEmpowerment() == 'Ice') overkillerCount += 2;
			} else {
				overkillerCount = 0;
				if (u2Mutations.tree.MaxOverkill.purchased && canU2Overkill()) overkillerCount++;
			}
			if (cell.OKcount <= overkillerCount) {
				var nextCell = game.global.mapsActive ? game.global.mapGridArray[cellNum + 1] : game.global.gridArray[cellNum + 1];
				if (nextCell) {
					nextCell.health = overkill == 'shatter' && (cellNum != 98 || !game.global.spireActive) ? 'shatter' : Math.abs(cell.health);
					nextCell.OKcount = cell.OKcount + 1;
				}
			}
			cell.health = 0;
			cell.overkilled = true;
			if (cell.name == 'Improbability') giveSingleAchieve('One-Hit Wonder');
			if (cell.name == 'Omnipotrimp') giveSingleAchieve('Mighty');
			instaFight = true;
			if (!game.global.mapsActive) game.stats.cellsOverkilled.value++;
		} else {
			if (cell.plaguebringer) {
				if (cell.health > cell.maxHealth * 0.05) {
					cell.health -= cell.plaguebringer;
					if (cell.health < cell.maxHealth * 0.05) cell.health = cell.maxHealth * 0.05;
				}
				var empowerment = getEmpowerment();
				if (empowerment) {
					if (empowerment == 'Poison') {
						stackPoison(cell.plaguebringer);
						//stackPoison handles the poison debuff and plaguebrought scaling
					}
					if (empowerment == 'Wind') {
						var hits = cell.plagueHits;
						if (getEmpowerment() == 'Wind' && getUberEmpowerment() == 'Wind') hits *= 2;
						if (Fluffy.isRewardActive('plaguebrought')) hits *= 2;
						game.empowerments[empowerment].currentDebuffPower += Math.ceil(hits);
						handleWindDebuff();
					}
					if (empowerment == 'Ice') {
						var hits = cell.plagueHits;
						if (getEmpowerment() == 'Ice' && getUberEmpowerment() == 'Ice') hits *= 2;
						if (Fluffy.isRewardActive('plaguebrought')) hits *= 2;
						game.empowerments[empowerment].currentDebuffPower += Math.ceil(hits);
						handleIceDebuff();
					}
				}
			}
			if (game.global.formation == 4 || game.global.formation == 5) {
				if (game.global.mapsActive) game.global.waitToScryMaps = false;
				else game.global.waitToScry = false;
			}
		}
		madeBadGuy = true;
	} else if (challengeActive('Nom') && cell.nomStacks) {
		updateNomStacks(cell.nomStacks);
	}
	var trimpsFighting = game.resources.trimps.maxSoldiers;
	var currentSend = game.resources.trimps.getCurrentSend();
	if (game.global.soldierHealth <= 0) {
		if (getHeirloomBonus('Shield', 'gammaBurst') > 0) {
			game.heirlooms.Shield.gammaBurst.stacks = 0;
			updateGammaStacks();
		}
		game.global.armyAttackCount = 0;
		game.global.fightAttackCount = 0;
		game.global.battleCounter = 0;
		if (cell.name == 'Voidsnimp' && !game.achievements.oneOffs.finished[game.achievements.oneOffs.names.indexOf('Needs Block')]) {
			if (!cell.killCount) cell.killCount = 1;
			else cell.killCount++;
			if (cell.killCount >= 50) giveSingleAchieve('Needs Block');
		}
		if (game.global.realBreedTime >= 600000 && game.jobs.Geneticist.owned >= 1) giveSingleAchieve('Extra Crispy');
		if (getPerkLevel('Anticipation')) {
			game.global.antiStacks = game.jobs.Amalgamator.owned > 0 ? Math.floor((getGameTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000);
			if (game.talents.patience.purchased) {
				if (game.global.antiStacks >= 45) game.global.antiStacks = 45;
			} else if (game.global.antiStacks >= 30) game.global.antiStacks = 30;
			updateAntiStacks();
		}
		game.global.lastSoldierSentAt = getGameTime();
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
		//Amalgamators
		if (game.jobs.Amalgamator.owned > 0) {
			game.global.soldierHealthMax *= game.jobs.Amalgamator.getHealthMult();
		}
		//Magma
		if (mutations.Magma.active()) {
			var magMult = mutations.Magma.getTrimpDecay();
			game.global.soldierHealthMax *= magMult;
			game.global.soldierCurrentAttack *= magMult;
		}
		//Soldiers
		game.global.soldierHealthMax *= trimpsFighting;
		game.global.soldierCurrentAttack *= trimpsFighting;
		//Toughness
		if (getPerkLevel('Toughness') > 0) game.global.soldierHealthMax += game.global.soldierHealthMax * getPerkLevel('Toughness') * game.portal.Toughness.modifier;
		if (getPerkLevel('Toughness_II') > 0) game.global.soldierHealthMax *= 1 + game.portal.Toughness_II.modifier * getPerkLevel('Toughness_II');
		//Observation
		if (!game.portal.Observation.radLocked && game.global.universe == 2 && game.portal.Observation.trinkets > 0) game.global.soldierHealthMax *= game.portal.Observation.getMult();
		if (getPerkLevel('Championism') > 0) game.global.soldierHealthMax *= game.portal.Championism.getMult();
		if (game.global.mayhemCompletions) game.global.soldierHealthMax *= game.challenges.Mayhem.getTrimpMult();
		if (game.global.pandCompletions) game.global.soldierHealthMax *= game.challenges.Pandemonium.getTrimpMult();
		if (game.global.desoCompletions) game.global.soldierHealthMax *= game.challenges.Desolation.getTrimpMult();
		if (game.global.frigidCompletions > 0 && game.global.universe == 1) game.global.soldierHealthMax *= game.challenges.Frigid.getTrimpMult();
		if (autoBattle.bonuses.Stats.level > 0 && game.global.universe == 2) game.global.soldierHealthMax *= autoBattle.bonuses.Stats.getMult();
		if (challengeActive('Alchemy')) game.global.soldierHealthMax *= alchObj.getPotionEffect('Potion of Strength');
		if (game.talents.mapHealth.purchased && game.global.mapsActive) {
			game.global.soldierHealthMax *= 2;
			game.global.mapHealthActive = true;
		} else game.global.mapHealthActive = false;
		if (game.global.lowestGen >= 0) {
			if (game.global.breedBack <= 0) {
				game.global.soldierHealthMax *= Math.pow(1.01, game.global.lowestGen);
				game.global.lastLowGen = game.global.lowestGen;
				game.global.lowestGen = -1;
			} else game.global.lastLowGen = 0;
			game.global.breedBack = currentSend / 2;
		}
		if (game.goldenUpgrades.Battle.currentBonus > 0) {
			game.global.soldierHealthMax *= game.goldenUpgrades.Battle.currentBonus + 1;
		}
		if (challengeActive('Insanity') && game.challenges.Insanity.insanity > 0) {
			game.global.soldierHealthMax *= game.challenges.Insanity.getHealthMult();
		}
		//Smithy
		if (game.global.universe == 2 && game.buildings.Smithy.owned > 0) {
			game.global.soldierHealthMax *= game.buildings.Smithy.getMult();
		}
		if (challengeActive('Smithless') && game.challenges.Smithless.fakeSmithies > 0) {
			game.global.soldierHealthMax *= game.challenges.Smithless.getTrimpMult();
		}
		//Fluffy U2 Healthy
		if (Fluffy.isRewardActive('healthy')) {
			game.global.soldierHealthMax *= 1.5;
		}
		if (game.buildings.Antenna.owned >= 10) {
			game.global.soldierHealthMax *= game.jobs.Meteorologist.getExtraMult();
		}
		//Health Mutator
		if (game.global.universe == 2 && u2Mutations.tree.Health.purchased) game.global.soldierHealthMax *= 1.5;
		if (game.global.universe == 2 && u2Mutations.tree.GeneHealth.purchased) game.global.soldierHealthMax *= 10;
		//Resilience
		if (getPerkLevel('Resilience') > 0) game.global.soldierHealthMax *= Math.pow(game.portal.Resilience.modifier + 1, getPerkLevel('Resilience'));
		//Power
		if (getPerkLevel('Power') > 0) game.global.soldierCurrentAttack += game.global.soldierCurrentAttack * getPerkLevel('Power') * game.portal.Power.modifier;
		if (getPerkLevel('Power_II') > 0) game.global.soldierCurrentAttack *= 1 + game.portal.Power_II.modifier * getPerkLevel('Power_II');
		game.global.soldierCurrentBlock = getBaseBlock() * trimpsFighting;
		game.global.soldierHealthMax = calcHeirloomBonus('Shield', 'trimpHealth', game.global.soldierHealthMax);
		//block handled in getBaseBlock()
		if (challengeActive('Daily') && typeof game.global.dailyChallenge.pressure !== 'undefined') game.global.soldierHealthMax *= dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks);
		if (game.global.formation !== 0 && game.global.formation != 5) {
			game.global.soldierHealthMax *= game.global.formation == 1 ? 4 : 0.5;
			var formAttackMod = 0.5;
			if (game.global.formation == 2) formAttackMod = 4;
			game.global.soldierCurrentAttack *= formAttackMod;
			//block handled in getBaseBlock()
		}
		if (challengeActive('Balance')) {
			game.global.soldierHealthMax *= game.challenges.Balance.getHealthMult();
		}
		if (challengeActive('Life')) {
			game.global.soldierHealthMax *= game.challenges.Life.getHealthMult();
		}
		if (challengeActive('Revenge')) game.global.soldierHealthMax *= game.challenges.Revenge.getMult();
		if (challengeActive('Duel') && game.challenges.Duel.trimpStacks < 20) game.global.soldierHealthMax *= game.challenges.Duel.healthMult;
		if (game.talents.voidPower.purchased && game.global.voidBuff) {
			game.global.soldierHealthMax *= game.talents.voidPower.getTotalVP() / 100 + 1;
			game.global.voidPowerActive = true;
		} else game.global.voidPowerActive = false;
		if (challengeActive('Wither')) {
			game.global.soldierHealthMax *= game.challenges.Wither.getTrimpHealthMult();
		}
		if (game.global.totalSquaredReward > 0) game.global.soldierHealthMax *= game.global.totalSquaredReward / 100 + 1;
		if (challengeActive('Berserk')) {
			game.global.soldierHealthMax *= game.challenges.Berserk.getHealthMult();
		}
		if (challengeActive('Desolation')) {
			game.global.soldierHealthMax *= game.challenges.Desolation.trimpHealthMult();
		}
		if (game.challenges.Nurture.boostsActive()) game.global.soldierHealthMax *= game.challenges.Nurture.getStatBoost();

		//Soldier starting health is determined
		game.global.soldierHealth = game.global.soldierHealthMax;
		//Finished setting up new army
		refillEnergyShield();
		if (challengeActive('Devastation') || challengeActive('Revenge')) {
			var lastOverkill = game.challenges[game.global.challengeActive].lastOverkill;
			if (lastOverkill != -1) reduceSoldierHealth(lastOverkill * 7.5);
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
		if (game.resources.trimps.soldiers != currentSend && game.global.maxSoldiersAtStart > 0) {
			var freeTrimps = game.resources.trimps.owned - game.resources.trimps.employed;
			var newTrimps = (game.resources.trimps.maxSoldiers - game.global.maxSoldiersAtStart) / game.global.maxSoldiersAtStart + 1;
			var requiredTrimps = currentSend - game.resources.trimps.soldiers;
			if (freeTrimps >= requiredTrimps) {
				game.resources.trimps.owned -= requiredTrimps;
				var oldHealth = game.global.soldierHealthMax;
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
				if (game.global.universe == 2) {
					game.global.soldierEnergyShieldMax /= 2;
					if (game.global.soldierEnergyShield > game.global.soldierEnergyShieldMax) game.global.soldierEnergyShield = game.global.soldierEnergyShieldMax;
				}
			} else if (!game.global.mapHealthActive && map) {
				game.global.soldierHealthMax *= 2;
				game.global.mapHealthActive = true;
				if (game.global.universe == 2) game.global.soldierEnergyShieldMax *= 2;
			}
		}
		if (game.talents.voidPower.purchased) {
			var mod = 1 + game.talents.voidPower.getTotalVP() / 100;
			if (game.global.voidPowerActive && (!map || map.location != 'Void')) {
				game.global.soldierHealthMax /= mod;
				if (game.global.soldierHealth > game.global.soldierHealthmax) game.global.soldierHealth = game.global.soldierHealthMax;
				game.global.voidPowerActive = false;
			} else if (!game.global.voidPowerActive && map && map.location == 'Void') {
				game.global.soldierHealthMax *= mod;
				game.global.voidPowerActive = true;
			}
		}
		//Check differences in equipment, apply perks, bonuses, and formation
		if (game.global.difs.health !== 0) {
			var healthTemp = trimpsFighting * game.global.difs.health * (game.portal.Toughness.modifier * getPerkLevel('Toughness') + 1);
			if (mutations.Magma.active()) {
				healthTemp *= mutations.Magma.getTrimpDecay();
			}
			if (game.global.universe == 2 && u2Mutations.tree.Health.purchased) healthTemp *= 1.5;
			if (game.global.universe == 2 && u2Mutations.tree.GeneHealth.purchased) healthTemp *= 10;
			if (getPerkLevel('Toughness_II')) healthTemp *= 1 + game.portal.Toughness_II.modifier * getPerkLevel('Toughness_II');
			if (!game.portal.Observation.radLocked && game.global.universe == 2 && game.portal.Observation.trinkets > 0) healthTemp *= game.portal.Observation.getMult();
			if (getPerkLevel('Championism')) healthTemp *= game.portal.Championism.getMult();
			if (game.global.mayhemCompletions) healthTemp *= game.challenges.Mayhem.getTrimpMult();
			if (autoBattle.bonuses.Stats.level > 0 && game.global.universe == 2) healthTemp *= autoBattle.bonuses.Stats.getMult();
			if (challengeActive('Alchemy')) healthTemp *= alchObj.getPotionEffect('Potion of Strength');
			if (game.global.pandCompletions) healthTemp *= game.challenges.Pandemonium.getTrimpMult();
			if (game.global.desoCompletions) healthTemp *= game.challenges.Desolation.getTrimpMult();
			if (game.global.frigidCompletions > 0 && game.global.universe == 1) healthTemp *= game.challenges.Frigid.getTrimpMult();
			if (game.talents.mapHealth.purchased && game.global.mapsActive) healthTemp *= 2;
			if (Fluffy.isRewardActive('healthy')) healthTemp *= 1.5;
			if (game.jobs.Geneticist.owned > 0) healthTemp *= Math.pow(1.01, game.global.lastLowGen);
			if (game.goldenUpgrades.Battle.currentBonus > 0) healthTemp *= game.goldenUpgrades.Battle.currentBonus + 1;
			if (game.global.universe == 2 && game.buildings.Smithy.owned > 0) healthTemp *= game.buildings.Smithy.getMult();
			if (challengeActive('Insanity')) healthTemp *= game.challenges.Insanity.getHealthMult();
			if (getPerkLevel('Resilience') > 0) healthTemp *= Math.pow(game.portal.Resilience.modifier + 1, getPerkLevel('Resilience'));
			if (game.global.universe == 2 && game.buildings.Antenna.owned >= 10) healthTemp *= game.jobs.Meteorologist.getExtraMult();
			if (challengeActive('Daily') && typeof game.global.dailyChallenge.pressure !== 'undefined') healthTemp *= dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks);
			if (game.global.formation !== 0 && game.global.formation !== 5) {
				healthTemp *= game.global.formation == 1 ? 4 : 0.5;
			}
			if (game.global.totalSquaredReward > 0) healthTemp *= game.global.totalSquaredReward / 100 + 1;
			if (challengeActive('Balance')) {
				healthTemp *= game.challenges.Balance.getHealthMult();
			}
			if (challengeActive('Smithless') && game.challenges.Smithless.fakeSmithies > 0) {
				healthTemp *= game.challenges.Smithless.getTrimpMult();
			}
			if (challengeActive('Revenge')) healthTemp *= game.challenges.Revenge.getMult();
			if (challengeActive('Life')) {
				healthTemp *= game.challenges.Life.getHealthMult();
			}
			if (challengeActive('Duel') && game.challenges.Duel.trimpStacks < 20) healthTemp *= game.challenges.Duel.healthMult;
			if (challengeActive('Wither')) {
				healthTemp *= game.challenges.Wither.getTrimpHealthMult();
			}
			if (game.challenges.Nurture.boostsActive()) healthTemp *= game.challenges.Nurture.getStatBoost();
			healthTemp = calcHeirloomBonus('Shield', 'trimpHealth', healthTemp);
			if (game.jobs.Amalgamator.owned > 0) healthTemp *= game.jobs.Amalgamator.getHealthMult();
			if (challengeActive('Berserk')) {
				healthTemp *= game.challenges.Berserk.getHealthMult();
			}
			if (challengeActive('Desolation')) {
				healthTemp *= game.challenges.Desolation.trimpHealthMult();
			}
			game.global.soldierHealthMax += healthTemp;
			game.global.soldierHealth += healthTemp;
			game.global.difs.health = 0;
			if (game.global.soldierHealth <= 0) game.global.soldierHealth = 0;
		}
		if (game.global.difs.attack !== 0) {
			var attackTemp = trimpsFighting * game.global.difs.attack * (game.portal.Power.modifier * getPerkLevel('Power') + 1);
			if (mutations.Magma.active()) {
				attackTemp *= mutations.Magma.getTrimpDecay();
			}
			if (getPerkLevel('Power_II')) attackTemp *= 1 + game.portal.Power_II.modifier * getPerkLevel('Power_II');
			if (game.global.formation !== 0 && game.global.formation != 5) {
				attackTemp *= game.global.formation == 2 ? 4 : 0.5;
			}
			game.global.soldierCurrentAttack += attackTemp;
			game.global.difs.attack = 0;
		}
		if (game.global.difs.block !== 0) {
			var blockTemp = trimpsFighting * game.global.difs.block * (game.global.difs.trainers * (calcHeirloomBonus('Shield', 'trainerEfficiency', game.jobs.Trainer.modifier) / 100) + 1);
			if (game.global.formation !== 0 && game.global.formation !== 5) {
				blockTemp *= game.global.formation == 3 ? 4 : 0.5;
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
	var randomText;
	var cellNum;
	var cell;
	var cellElem;
	var currentMapObj;
	var isVoid = false;
	game.global.passive = false;
	if (game.global.mapsActive) {
		cellNum = game.global.lastClearedMapCell + 1;
		cell = game.global.mapGridArray[cellNum];
		cellElem = document.getElementById('mapCell' + cellNum);
		currentMapObj = getCurrentMapObject();
		if (currentMapObj.location == 'Void') isVoid = true;
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
				var maxStacks = dailyModifiers.bloodthirst.getMaxStacks(game.global.dailyChallenge.bloodthirst.strength);
				if (game.global.dailyChallenge.bloodthirst.stacks > maxStacks) {
					game.global.dailyChallenge.bloodthirst.stacks = maxStacks;
				} else if (game.global.dailyChallenge.bloodthirst.stacks % dailyModifiers.bloodthirst.getFreq(game.global.dailyChallenge.bloodthirst.strength) == 0) {
					cell.health = cell.maxHealth;
				}
				updateDailyStacks('bloodthirst');
			}
			if (!game.global.passive && typeof game.global.dailyChallenge.empower !== 'undefined') {
				if (!game.global.mapsActive) {
					game.global.dailyChallenge.empower.stacks += dailyModifiers.empower.stacksToAdd(game.global.dailyChallenge.empower.strength);
					var maxStack = dailyModifiers.empower.getMaxStacks(game.global.dailyChallenge.empower.strength);
					if (game.global.dailyChallenge.empower.stacks >= maxStack) game.global.dailyChallenge.empower.stacks = maxStack;
				}
				updateDailyStacks('empower');
			}
		}
		var s = game.resources.trimps.soldiers > 1 ? 's ' : ' ';
		randomText = game.trimpDeathTexts[Math.floor(Math.random() * game.trimpDeathTexts.length)];
		var msgText = prettify(game.resources.trimps.soldiers) + ' Trimp' + s + 'just ' + randomText + '.';
		if (usingScreenReader) msgText = 'Cell ' + cellNum + ': ' + msgText;
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
		if ((game.global.formation == 4 || game.global.formation == 5) && !game.global.mapsActive && !game.global.waitToScry) tryScry();
		if (game.jobs.Worshipper.owned > 0 && !game.global.mapsActive) tryWorship();
		if (challengeActive('Nom') && cell.nomStacks == 100) giveSingleAchieve('Great Host');
		if (challengeActive('Obliterated')) giveSingleAchieve('Obliterate');
		if (challengeActive('Eradicated')) giveSingleAchieve('Eradicate');
		if (game.global.usingShriek) disableShriek();
		if (game.global.universe == 2) u2Mutations.types.Rage.clearStacks();
		//Death message
		randomText = game.badGuyDeathTexts[Math.floor(Math.random() * game.badGuyDeathTexts.length)];
		var displayName = cell.name;
		if (typeof game.badGuys[cell.name].displayName !== 'undefined') displayName = game.badGuys[cell.name].displayName;
		var firstChar = displayName.charAt(0);
		var aAn = firstChar == 'A' || firstChar == 'E' || firstChar == 'I' || firstChar == 'O' || firstChar == 'U' ? ' an ' : ' a ';
		var killedText = 'You ' + randomText + aAn + displayName;
		if (challengeActive('Coordinate')) killedText += ' group';
		killedText += '!';
		if (usingScreenReader) killedText = 'Cell ' + cellNum + ': ' + killedText;
		if (!game.global.spireActive || cellNum != 99 || game.global.mapsActive) message(killedText, 'Combat', null, null, 'enemy');
		try {
			if (typeof kongregate !== 'undefined' && !game.global.mapsActive) kongregate.stats.submit('HighestLevel', game.global.world * 100 + cell.level);
		} catch (err) {
			console.debug(err);
		}
		if (usingRealTimeOffline) offlineProgress.lastEnemyKilled = offlineProgress.ticksProcessed;
		//Challenge Shenanigans
		if (challengeActive('Lead') && cell.name != 'Liquimp') manageLeadStacks(!game.global.mapsActive);
		if ((challengeActive('Balance') || challengeActive('Unbalance')) && game.global.world >= 6) {
			var chal = challengeActive('Balance') ? game.challenges.Balance : game.challenges.Unbalance;
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
				var maxStack = dailyModifiers.karma.getMaxStacks(game.global.dailyChallenge.karma.strength);
				if (game.global.dailyChallenge.karma.stacks >= maxStack) game.global.dailyChallenge.karma.stacks = maxStack;
				updateDailyStacks('karma');
			}
			if (typeof game.global.dailyChallenge.toxic !== 'undefined') {
				game.global.dailyChallenge.toxic.stacks++;
				var maxStack = dailyModifiers.toxic.getMaxStacks(game.global.dailyChallenge.toxic.strength);
				if (game.global.dailyChallenge.toxic.stacks >= maxStack) game.global.dailyChallenge.toxic.stacks = maxStack;
				updateDailyStacks('toxic');
			}
			if (typeof game.global.dailyChallenge.rampage !== 'undefined') {
				game.global.dailyChallenge.rampage.stacks++;
				var maxStack = dailyModifiers.rampage.getMaxStacks(game.global.dailyChallenge.rampage.strength);
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
			if (game.options.menu.overkillColor.enabled == 2) {
				var prevCellElem = document.getElementById((game.global.mapsActive ? 'mapCell' : 'cell') + (cellNum - 1));
				if (prevCellElem) swapClass('cellColor', 'cellColorOverkill', prevCellElem);
			}
			swapClass('cellColor', 'cellColorOverkill', cellElem);
		} else swapClass('cellColor', 'cellColorBeaten', cellElem);
		if (game.global.mapsActive) game.global.lastClearedMapCell = cellNum;
		else {
			game.global.lastClearedCell = cellNum;
		}
		game.global.fighting = false;
		document.getElementById('badGuyCol').style.visibility = 'hidden';
		//Loot!
		if (cell.empowerment) {
			rewardToken(cell.empowerment);
		}
		var unlock;
		if (game.global.mapsActive) unlock = game.mapUnlocks[cell.special];
		else {
			checkVoidMap();
			unlock = game.worldUnlocks[cell.special];
		}
		var noMessage = false;
		if (typeof unlock !== 'undefined' && typeof unlock.fire !== 'undefined') {
			unlock.fire(cell.level);
			if (game.global.mapsActive) {
				if (typeof game.mapUnlocks[cell.special].last !== 'undefined') {
					game.mapUnlocks[cell.special].last += 5;
					if (typeof game.upgrades[cell.special].prestige && getSLevel() >= 4 && !challengeActive('Mapology') && Math.ceil(game.mapUnlocks[cell.special].last / 5) % 2 == 1) {
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
		var doNextVoid = false;
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
		if (game.global.mapsActive && cellNum == game.global.mapGridArray.length - 1) {
			//ayy you beat a map
			if (usingRealTimeOffline && offlineProgress.countThisMap) {
				offlineProgress.mapsAllowed--;
				offlineProgress.countThisMap = false;
			}
			var mapObj = getCurrentMapObject();
			game.stats.mapsCleared.value++;
			checkAchieve('totalMaps');
			alchObj.mapCleared(mapObj);
			var shouldRepeat = game.global.repeatMap;
			var nextBw = false;
			var mazBw = -1;
			game.global.mapRunCounter++;
			if (game.options.menu.repeatUntil.enabled == 0 && game.global.mapCounterGoal > 0) toggleSetting('repeatUntil', null, false, true);
			if (game.global.challengeActive && game.challenges[game.global.challengeActive].clearedMap) game.challenges[game.global.challengeActive].clearedMap(mapObj.level);
			var mapBonusEarned = 0;
			if (currentMapObj.level >= game.global.world - getPerkLevel('Siphonology') && game.global.mapBonus < 10) mapBonusEarned = 1;
			game.global.mapBonus += mapBonusEarned;
			if (challengeActive('Quest') && game.challenges.Quest.questId == 2) {
				game.challenges.Quest.questProgress += mapBonusEarned;
				game.challenges.Quest.checkQuest();
			}
			var mapBonusReached = game.global.mapBonus == 10;
			var allItemsEarned = addSpecials(true, true, mapObj) == 0;
			if (mapObj.name.search('Bionic Wonderland') > -1 && allItemsEarned && game.options.menu.climbBw.enabled == 1 && game.global.repeatMap) {
				if (game.global.mazBw > 0 && game.global.mazBw <= mapObj.level) {
					nextBw = false;
				} else {
					nextBw = getNextBwId();
					mazBw = game.global.mazBw;
				}
			}
			if (game.options.menu.repeatUntil.enabled == 0 && game.global.mapCounterGoal > 0 && game.global.mapRunCounter >= game.global.mapCounterGoal) shouldRepeat = false;
			else if (game.options.menu.repeatUntil.enabled == 1 && mapBonusReached) shouldRepeat = false;
			else if (game.options.menu.repeatUntil.enabled == 2 && allItemsEarned) shouldRepeat = false;
			else if (game.options.menu.repeatUntil.enabled == 3 && allItemsEarned && (mapBonusReached || mapBonusEarned == 0)) shouldRepeat = false;
			if (mapObj.bonus && mapSpecialModifierConfig[mapObj.bonus].onCompletion) {
				mapSpecialModifierConfig[mapObj.bonus].onCompletion();
			}
			var skip = false;
			if (isVoid) {
				if (currentMapObj.stacked > 0) {
					var timeout = 1500;
					if (currentMapObj.stacked > 3) timeout = 1000;
					rewardingTimeoutHeirlooms = true;
					for (var x = 0; x < currentMapObj.stacked; x++) {
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
				if (game.options.menu.repeatVoids.enabled == 1) {
					//repeat void maps
					if (game.global.totalVoidMaps > 0) doNextVoid = getNextVoidId();
				}
				skip = true;
			}
			if (!game.global.runningChallengeSquared && game.global.challengeActive && game.challenges[game.global.challengeActive].completeAfterMap) {
				var challenge = game.challenges[game.global.challengeActive];
				if (mapObj.name == challenge.completeAfterMap && typeof challenge.onComplete !== 'undefined') {
					challenge.onComplete();
				}
			}
			if (challengeActive('Insanity')) {
				game.challenges.Insanity.completeMap(mapObj.level);
			}
			if (currentMapObj.location != 'Frozen' && !nextBw && shouldRepeat && !game.global.switchToMaps && (!challengeActive('Mapology') || game.challenges.Mapology.credits >= 1) && !skip) {
				if (game.global.mapBonus > 0) {
					var innerText = game.global.mapBonus;
					if (game.talents.mapBattery.purchased && game.global.mapBonus == 10) innerText = "<span class='mapBonus10'>" + innerText + '</span>';
					const mapBtnElem = document.getElementById('mapsBtnText');
					const mapBtnText = `Maps (${innerText})`;
					if ((mapBtnElem.innerHTML !== mapBtnText && !usingRealTimeOffline) || (usingRealTimeOffline && loops % 600 === 0)) mapBtnElem.innerHTML = mapBtnText;
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
				game.global.preMapsActive = game.options.menu.exitTo.enabled && nextBw == false ? false : true;
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
				} else if (doNextVoid !== false) {
					game.global.lookingAtMap = doNextVoid;
					runMap();
				} else if (isVoid && game.global.preMapsActive && game.global.totalVoidMaps > 0) {
					toggleVoidMaps();
				} else if (currentMapObj.location == 'Frozen') {
					document.getElementById('mapsHere').removeChild(document.getElementById(currentMapObj.id));
					game.global.mapsOwnedArray.splice(getMapIndex(currentMapObj.id), 1);
					game.global.lookingAtMap = '';
					mapsSwitch(true);
				} else checkMapAtZoneWorld(true);
				return;
			}
		}
		//World Only
		if (!game.global.mapsActive && cellNum == 99) {
			nextWorld();
		}
		var startMaZ = false;
		if (!game.global.mapsActive) startMaZ = checkMapAtZoneWorld(true);
		if (startMaZ !== true && game.global.soldierHealth > 0) battle(true);
		return;
	}
	var cellAttack = calculateDamage(cell.attack, false, false, false, cell);
	if (getEmpowerment() == 'Ice') {
		const badAttackElem = document.getElementById('badGuyAttack');
		const badAttackText = calculateDamage(cell.attack, true, false, false, cell);
		if ((badAttackElem.innerHTML !== badAttackText.toString() && !usingRealTimeOffline) || (usingRealTimeOffline && loops % 600 === 0)) badAttackElem.innerHTML = badAttackText;
	}
	var badCrit = false;
	if (challengeActive('Crushed')) {
		if (checkCrushedCrit()) {
			cellAttack *= 5;
			badCrit = true;
			if (game.global.world > 5) game.challenges.Crushed.critsTaken++;
		}
	}
	if (challengeActive('Duel')) {
		var critChance = game.challenges.Duel.trimpStacks;
		var roll = Math.floor(Math.random() * 100);
		if (roll < critChance) {
			cellAttack *= 10;
			badCrit = true;
		}
	}
	if (game.global.voidBuff == 'getCrit' || cell.corrupted == 'corruptCrit' || cell.corrupted == 'healthyCrit') {
		if (Math.floor(Math.random() * 4) == 0) {
			cellAttack *= cell.corrupted == 'healthyCrit' ? 7 : 5;
			badCrit = true;
		}
	}
	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.crits !== 'undefined') {
			if (Math.floor(Math.random() * 4) == 0) {
				cellAttack *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
				badCrit = true;
			}
		}
	}
	var attackAndBlock = cellAttack - game.global.soldierCurrentBlock;
	var pierce = 0;
	if (game.global.brokenPlanet && !game.global.mapsActive) {
		pierce = getPierceAmt();
		var atkPierce = pierce * cellAttack;
		if (attackAndBlock < atkPierce) attackAndBlock = atkPierce;
	}
	if (attackAndBlock < 0) attackAndBlock = 0;
	if (getPerkLevel('Frenzy') > 0) game.portal.Frenzy.beforeAttack();
	var trimpAttack = calculateDamage(game.global.soldierCurrentAttack, false, true);
	if (getEmpowerment() == 'Ice') {
		const goodAttackElem = document.getElementById('goodGuyAttack');
		const goodAttackText = calculateDamage(game.global.soldierCurrentAttack, true, true);
		if ((goodAttackElem.innerHTML !== goodAttackText.toString() && !usingRealTimeOffline) || (usingRealTimeOffline && loops % 600 === 0)) goodAttackElem.innerHTML = goodAttackText;
	}
	updateTitimp();
	var critTier = 0;
	var critChance = getPlayerCritChance();
	if (critChance > 0) {
		critTier = Math.floor(critChance);
		critChance = critChance % 1;
		if (Math.random() < critChance) {
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
	var attacked = false;
	var wasAttacked = false;
	var badDodge = false;
	if (cell.corrupted == 'corruptDodge') {
		if (Math.random() < 0.3) badDodge = true;
	}
	if (challengeActive('Daily') && typeof game.global.dailyChallenge.slippery !== 'undefined') {
		var slipStr = game.global.dailyChallenge.slippery.strength;
		if ((slipStr > 15 && game.global.world % 2 == 0) || (slipStr <= 15 && game.global.world % 2 == 1)) {
			if (Math.random() < dailyModifiers.slippery.getMult(slipStr)) badDodge = true;
		}
	}
	var overkill = 0;
	var plaguebringer = 0;
	var impOverkill = 0;
	var trimpsWereFull = game.global.soldierHealth == game.global.soldierHealthMax;
	var enemyWasFull = cell.health == cell.maxHealth;
	var thisKillsTheTrimp = function () {
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
	var thisKillsTheBadGuy = function () {
		cell.health = 0;
	};
	//Angelic Heal
	if (game.talents.angelic.purchased && game.global.challengeActive != 'Berserk' && (!game.global.spireActive || game.global.mapsActive || Math.floor((game.global.world - 100) / 100) <= game.global.spiresCompleted)) {
		game.global.soldierHealth += game.global.soldierHealth / 2;
		if (game.global.soldierHealth > game.global.soldierHealthMax) game.global.soldierHealth = game.global.soldierHealthMax;
	}
	if (challengeActive('Wither')) {
		if (game.challenges.Wither.healImmunity <= 0 && cell.health < cell.maxHealth) {
			var heal = Math.floor(cell.maxHealth / 4);
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
	var checkFast = challengeActive('Glass') || challengeActive('Slow') || ((((game.badGuys[cell.name].fast || cell.mutation == 'Corruption') && game.global.challengeActive != 'Nom') || game.global.voidBuff == 'doubleAttack') && game.global.challengeActive != 'Coordinate');
	if (game.global.soldierHealth <= 0) checkFast = false;
	if (checkFast && challengeActive('Exterminate') && game.challenges.Exterminate.experienced) checkFast = false;
	var forceSlow = false;
	if (challengeActive('Duel')) {
		if (game.challenges.Duel.enemyStacks < 10) checkFast = true;
		else if (game.challenges.Duel.trimpStacks < 10 && !game.global.runningChallengeSquared) forceSlow = true;
	}
	if (challengeActive('Smithless') && cell.ubersmith && !cell.failedUber) checkFast = true;
	if (cell.u2Mutation && cell.u2Mutation.length) checkFast = true;

	if (trimpAttack > 0 && checkFast && !forceSlow) {
		//Fighting a fast enemy, Trimps attack last
		reduceSoldierHealth(attackAndBlock, true);
		wasAttacked = true;
		if (game.global.soldierHealth > 0) {
			if (!badDodge) {
				if (getEmpowerment() == 'Poison') {
					cell.health -= game.empowerments.Poison.getDamage();
					stackPoison(trimpAttack);
				}
				if (trimpAttack >= cell.health) {
					overkill = trimpAttack - cell.health;
					if (cell.name == 'Improbability' && enemyWasFull) giveSingleAchieve('One-Hit Wonder');
					if (enemyWasFull && challengeActive('Unlucky') && game.global.mapsActive && currentMapObj.name == 'Dimension of Rage') {
						if (!game.challenges.Unlucky.lastHitLucky) giveSingleAchieve("Don't Need Luck");
					}
					if (!game.global.mapsActive && enemyWasFull && challengeActive('Quest') && game.challenges.Quest.questId == 3) game.challenges.Quest.questProgress++;
				} else if (getPlaguebringerModifier() > 0) {
					plaguebringer = trimpAttack * getPlaguebringerModifier();
				}
				if (challengeActive('Glass') && trimpAttack < cell.health) game.challenges.Glass.notOneShot();
				cell.health -= trimpAttack;
				attacked = true;
				if ((game.global.voidBuff == 'doubleAttack' || cell.corrupted == 'corruptDbl' || cell.corrupted == 'healthyDbl') && cell.health > 0) {
					reduceSoldierHealth(cell.corrupted == 'healthyDbl' ? attackAndBlock * 1.5 : attackAndBlock, true);
					if (game.global.soldierHealth < 0) thisKillsTheTrimp();
				}
			}
		} else thisKillsTheTrimp();
		if (cell.health < 1 && game.global.formation == 5 && getUberEmpowerment() == 'Wind' && getEmpowerment() == 'Wind' && game.empowerments.Wind.currentDebuffPower < game.empowerments.Wind.stackMax()) {
			cell.health = 1;
		}
		if (cell.health <= 0) {
			thisKillsTheBadGuy();
		}
	} else {
		//Fighting a slow enemy, Trimps attack first
		if (game.global.soldierHealth > 0) {
			if (!badDodge) {
				if (getEmpowerment() == 'Poison') {
					cell.health -= game.empowerments.Poison.getDamage();
					stackPoison(trimpAttack);
				}
				if (trimpAttack >= cell.health) {
					overkill = trimpAttack - cell.health;
					if (cell.name == 'Improbability' && enemyWasFull) giveSingleAchieve('One-Hit Wonder');
					if (enemyWasFull && challengeActive('Unlucky') && game.global.mapsActive && currentMapObj.name == 'Dimension of Rage') {
						if (!game.challenges.Unlucky.lastHitLucky) giveSingleAchieve("Don't Need Luck");
					}
					if (!game.global.mapsActive && enemyWasFull && challengeActive('Quest') && game.challenges.Quest.questId == 3) game.challenges.Quest.questProgress++;
				} else if (getPlaguebringerModifier() > 0) {
					plaguebringer = trimpAttack * getPlaguebringerModifier();
				}
				cell.health -= trimpAttack;
				attacked = true;
			}
			if (cell.health < 1 && game.global.formation == 5 && getUberEmpowerment() == 'Wind' && getEmpowerment() == 'Wind' && game.empowerments.Wind.currentDebuffPower < game.empowerments.Wind.stackMax()) {
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
	if (wasAttacked && !game.global.mapsActive && cellNum == 99 && game.global.challengeActive && game.challenges[game.global.challengeActive].onBossAttack) game.challenges[game.global.challengeActive].onBossAttack();
	if (challengeActive('Mayhem') && attacked) {
		game.global.soldierHealth -= game.challenges.Mayhem.poison;
		if (game.global.soldierHealth < 0) thisKillsTheTrimp();
	}
	if (game.global.soldierHealth > 0 && getHeirloomBonus('Shield', 'gammaBurst') > 0) {
		var burst = game.heirlooms.Shield.gammaBurst;
		burst.stacks++;
		var triggerStacks = autoBattle.oneTimers.Burstier.owned ? 4 : 5;
		if (Fluffy.isRewardActive('scruffBurst')) triggerStacks--;
		if (burst.stacks >= triggerStacks) {
			burst.stacks = triggerStacks;
			if (cell.health > 0) {
				var burstDamage = calcHeirloomBonus('Shield', 'gammaBurst', trimpAttack);
				if (challengeActive('Storm') && game.challenges.Storm.mutations > 0) burstDamage *= game.challenges.Storm.getGammaMult();
				cell.health -= burstDamage;
				burst.stacks = 0;
				if (cell.health > 0 && getPlaguebringerModifier() > 0) {
					plaguebringer += burstDamage * getPlaguebringerModifier();
				}
				if (getUberEmpowerment() == 'Wind' && getEmpowerment() == 'Wind' && game.global.formation == 5 && cell.health < 1) {
					cell.health = 1;
				} else if (cell.health <= 0) {
					overkill = Math.abs(cell.health);
					thisKillsTheBadGuy();
				}
				if (getEmpowerment() == 'Poison') stackPoison(burstDamage);
			}
		}
		updateGammaStacks();
	}
	//if (challengeActive("Quagmire") overkill = 0;
	//if (challengeActive("Archaeology" && !game.global.mapsActive) overkill = 0;
	//if (game.challenges.Quest.disableOverkill()) overkill = 0;
	if (getUberEmpowerment() == 'Wind' && getEmpowerment() == 'Wind' && game.global.formation == 5) {
		overkill = 0;
		if (plaguebringer == 0) plaguebringer = 1;
	}
	if (cell.health / cell.maxHealth < 0.5 && getUberEmpowerment() == 'Ice' && getEmpowerment() == 'Ice' && game.empowerments.Ice.currentDebuffPower > 20) {
		cell.health = 0;
		thisKillsTheBadGuy();
		overkill = 'shatter';
	}
	if (challengeActive('Daily') && typeof game.global.dailyChallenge.mirrored !== 'undefined' && attacked && game.global.soldierHealth > 0) {
		reduceSoldierHealth(dailyModifiers.mirrored.reflectDamage(game.global.dailyChallenge.mirrored.strength, Math.min(cell.maxHealth, trimpAttack)));
		if (game.global.soldierHealth <= 0) thisKillsTheTrimp();
	}
	if (challengeActive('Glass') && attacked && game.global.soldierHealth > 0) {
		game.challenges.Glass.checkReflect(cell, trimpAttack);
		if (game.global.soldierHealth <= 0) thisKillsTheTrimp();
	}
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
	if (getEmpowerment() == 'Ice' && attacked) {
		var addStacks = 1;
		if (getUberEmpowerment() == 'Ice' && getEmpowerment() == 'Ice') addStacks *= 2;
		if (Fluffy.isRewardActive('plaguebrought')) addStacks *= 2;
		game.empowerments.Ice.currentDebuffPower += addStacks;
		handleIceDebuff();
	}
	if (getEmpowerment() == 'Wind' && attacked) {
		var addStacks = 1;
		if (getUberEmpowerment() == 'Wind' && getEmpowerment() == 'Wind') addStacks *= 2;
		if (Fluffy.isRewardActive('plaguebrought')) addStacks *= 2;
		game.empowerments.Wind.currentDebuffPower += addStacks;
		if (game.empowerments.Wind.currentDebuffPower > game.empowerments.Wind.stackMax()) game.empowerments.Wind.currentDebuffPower = game.empowerments.Wind.stackMax();
		handleWindDebuff();
	}
	if (getPerkLevel('Frenzy') > 0 && attacked && game.global.soldierHealth > 0) {
		game.portal.Frenzy.trimpAttacked();
	}
	if (challengeActive('Daily')) {
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
	if (challengeActive('Desolation')) {
		if (wasAttacked && !game.global.mapsActive) {
			game.challenges.Desolation.addChilledStacks(1);
			game.challenges.Desolation.drawStacks();
		}
		if (attacked && game.global.mapsActive) {
			game.challenges.Desolation.mapAttacked(currentMapObj.level);
		}
	}
	if (challengeActive('Smithless') && cell.ubersmith) {
		game.challenges.Smithless.attackedUber();
	}
	var dominating = false;
	if (challengeActive('Domination')) {
		if (game.global.mapsActive && currentMapObj.size == cellNum + 1) dominating = true;
		else if (!game.global.mapsActive && cellNum == 99) dominating = true;
	}
	if (cell.health > 0 && dominating) {
		if (cell.health / cell.maxHealth < 0.95) cell.health += cell.maxHealth * 0.05;
		if (cell.health > cell.maxHealth) cell.health = cell.maxHealth;
	}
	if (challengeActive('Toxicity') && attacked) {
		var tox = game.challenges.Toxicity;
		tox.stacks++;
		if (tox.stacks > tox.maxStacks) tox.stacks = tox.maxStacks;
		if (tox.stacks > tox.highestStacks) tox.highestStacks = tox.stacks;
		updateToxicityStacks();
	}
	if (!game.global.mapsActive && challengeActive('Life') && attacked) {
		var life = game.challenges.Life;
		var oldStacks = life.stacks;
		if (cell.mutation == 'Living') life.stacks -= 5;
		else life.stacks++;
		if (life.stacks > life.maxStacks) life.stacks = life.maxStacks;
		if (life.stacks < 0) life.stacks = 0;
		if (life.stacks != oldStacks) {
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
	} else if (challengeActive('Lead') && attacked && cell.health > 0) {
		game.global.soldierHealth -= game.global.soldierHealthMax * Math.min(game.challenges.Lead.stacks, 200) * 0.0003;
		if (game.global.soldierHealth < 0) thisKillsTheTrimp();
	}
	if (game.global.universe == 2 && attacked && cell.u2Mutation && cell.u2Mutation.length) {
		if (u2Mutations.types.Nova.hasNova(cell)) u2Mutations.types.Nova.attacked();
		if (u2Mutations.types.Rage.hasRage(cell)) u2Mutations.types.Rage.attacked();
	}
	if (challengeActive('Berserk') && attacked) {
		game.challenges.Berserk.attacked();
	}
	if ((game.global.voidBuff == 'bleed' || cell.corrupted == 'corruptBleed' || cell.corrupted == 'healthyBleed') && wasAttacked) {
		var bleedMod = cell.corrupted == 'healthyBleed' ? 0.3 : 0.2;
		game.global.soldierHealth -= game.global.soldierHealth * bleedMod;
		if (game.global.soldierHealth < 1) thisKillsTheTrimp();
	}

	//Crit/Overkill
	if (challengeActive('Duel')) {
		var challenge = game.challenges.Duel;
		var trimpPoints = 0;
		var enemyPoints = 0;
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
	const critSpanElem = document.getElementById('critSpan');
	const critSpanText = getCritText(critTier);
	if (critSpanElem.innerHTML !== critSpanText.toString() && !usingRealTimeOffline) critSpan.innerHTML = critSpanText;
	if (critTier >= 3) redCritCounter++;
	else redCritCounter = 0;
	if (redCritCounter >= 10) giveSingleAchieve('Critical Luck');
	let badCritText;
	if (badDodge) badCritText = 'Dodge!';
	else if (badCrit && wasAttacked) badCritText = 'Crit!';
	else badCritText = '';
	const badCritElem = document.getElementById('badCrit');
	if (badCritElem.innerHTML !== badCritText.toString() && !usingRealTimeOffline) badCritElem.innerHTML = badCritText;
	if (cell.health <= 0) game.global.battleCounter = 800;
	if (!game.global.mapsActive && getPerkLevel('Hunger')) {
		game.portal.Hunger.storedDamage += overkill;
	}
	if (overkill) {
		var nextCell = game.global.mapsActive ? game.global.mapGridArray[cellNum + 1] : game.global.gridArray[cellNum + 1];
		if (nextCell && nextCell.health != 'compressed') {
			nextCell.health = overkill;
			nextCell.OKcount = 1;
		}
	} else if (plaguebringer > 0) {
		var nextCell = game.global.mapsActive ? game.global.mapGridArray[cellNum + 1] : game.global.gridArray[cellNum + 1];
		if (nextCell) {
			if (!nextCell.plaguebringer) nextCell.plaguebringer = plaguebringer;
			else nextCell.plaguebringer += plaguebringer;
			if (!nextCell.plagueHits) nextCell.plagueHits = getPlaguebringerModifier();
			else nextCell.plagueHits += getPlaguebringerModifier();
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
			var explodeDamage = cellAttack * dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength);
			var explodeAndBlock = explodeDamage - game.global.soldierCurrentBlock;
			if (explodeAndBlock < 0) explodeAndBlock = 0;
			if (pierce > 0) {
				var explodePierce = pierce * explodeDamage;
				if (explodeAndBlock < explodePierce) explodeAndBlock = explodePierce;
			}
			reduceSoldierHealth(explodeAndBlock);
			if (game.global.soldierHealth <= 0) thisKillsTheTrimp();
		}
	}
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
	if (game.global.fightAttackCount > 0 && game.portal.Equality.scalingActive && game.portal.Equality.scalingReverse && game.global.fightAttackCount % game.portal.Equality.reversingSetting == 0 && game.global.armyAttackCount > game.portal.Equality.scalingSetting && cell.health > 0) {
		game.portal.Equality.scalingCount--;
		manageEqualityStacks();
	}
	if (makeUp) return;
	updateGoodBar();
	updateBadBar(cell);
}
