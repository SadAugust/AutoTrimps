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

	for (const item in jobs) {
		if (jobs[item].locked) continue;
		if (item === 'Geneticist' && game.global.Geneticistassist) {
			innerHTML += drawGeneticistassist(item);
			toggleGeneticistassist(true);
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
		return `<button class="thing noSelect pointer jobThing" onclick="tooltip('Geneticist','jobs','screenRead')">Geneticist Info</button>
			<button onmouseover="tooltip('Geneticist','jobs',event)" onmouseout="tooltip('hide')" class="thingColorCanNotAfford thing noselect pointer jobThing" id="Geneticist" onclick="buyJob('Geneticist')">
				<span class="thingName"><span id="GeneticistAlert" class="alert badge">${alertMessage}</span>Geneticist</span><br/>
				<span class="thingOwned" id="GeneticistOwned">0</span>
			</button>
			<button class="thing noSelect pointer jobThing"  onclick="tooltip('Geneticistassist',null,'screenRead')">Geneticistassist Info</button>
			<button onmouseover="tooltip('Geneticistassist',null,event)" onmouseout="tooltip('hide')" class="thing thingColorNone noselect stateHappy pointer jobThing" id="Geneticistassist" onclick="toggleGeneticistassist()">Geneticistassist
				<span id="GAIndicator"></span><br/>
				<span id="GeneticistassistSetting">&nbsp;</span>
			</button>`;
	}
	return `<div id="GeneticistassistContainer" class="thing">
			<div onmouseover="tooltip('Geneticist','jobs',event)" onmouseout="tooltip('hide')" class="thingColorCanNotAfford thing noselect pointer jobThing" id="Geneticist" onclick="buyJob('Geneticist')">
				<span class="thingName"><span id="GeneticistAlert" class="alert badge">${alertMessage}</span>Geneticist</span><br/>
				<span class="thingOwned" id="GeneticistOwned">0</span>
			</div>
			<div onmouseover="tooltip('Geneticistassist',null,event)" onmouseout="tooltip('hide')" class="thing thingColorNone noselect stateHappy pointer jobThing" id="Geneticistassist" onclick="toggleGeneticistassist()">Geneticistassist
				<span id="GAIndicator"></span><br/>
				<span id="GeneticistassistSetting">&nbsp;</span>
			</div>
		</div>`;
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
	if (atSettings.initialise.loaded) {
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
		if (breedElem.innerHTML !== srLastBreedTime) breedElem.innerHTML = srLastBreedTime;
		if (updateGenes || (!game.global.fighting && totalTimeText === '0.0')) {
			updateStoredGenInfo(breeding.toNumber());
		}
		return;
	}

	srLastBreedTime = timeRemaining;
	if (breedElem.innerHTML !== timeRemaining) breedElem.innerHTML = timeRemaining;
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

	const message = mousedOverClock && game.permanentGeneratorUpgrades.Supervision.owned ? "<span class='icomoon icon-pause3'></span>" : prettify(Math.floor(nextTickIn + 1));
	if (nextTickElem !== message.toString()) nextTickElem.innerHTML = message;

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
