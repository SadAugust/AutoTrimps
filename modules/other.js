MODULES["other"] = {};

function isCorruptionActive(targetZone) {
	if (game.global.universe == 2) return 9999;
	if (challengeActive('Eradicated')) return 1;
	if (challengeActive('Corrupted')) return 60;
	return targetZone >= ((game.talents.headstart.purchased && !game.global.runningChallengeSquared) ? ((game.talents.headstart2.purchased) ? ((game.talents.headstart3.purchased) ? 151 : 166) : 176) : 181);
}

function autoRoboTrimp() {
	if (game.global.roboTrimpLevel === 0) return;
	if (game.global.roboTrimpCooldown !== 0) return;
	if (getPageSetting("AutoRoboTrimp") > game.global.world || getPageSetting("AutoRoboTrimp") <= 0) return;

	var shouldShriek = (game.global.world - parseInt(getPageSetting("AutoRoboTrimp"))) % 5 === 0;
	if (shouldShriek) {
		if (!game.global.useShriek) {
			magnetoShriek();
			debug("Activated Robotrimp MagnetoShriek Ability @ z" + game.global.world, "zone", "*podcast");
		}
	}
	else if (game.global.useShriek)
		magnetoShriek();
}

function getZoneEmpowerment(zone) {
	if (!zone) return 'None';
	var natureStartingZone = game.global.universe === 1 ? getNatureStartZone() : 236;
	if (zone < natureStartingZone) return 'None';
	var activeEmpowerments = ["Poison", "Wind", "Ice"];
	zone = Math.floor((zone - natureStartingZone) / 5);
	zone = zone % activeEmpowerments.length;
	return activeEmpowerments[zone];
}

function saveToSteam(saveData) {
	if (typeof greenworks === 'undefined') return;
	greenworks.saveTextToFile('TrimpsSave.sav', saveData, cloudSaveCallback, cloudSaveErrorCallback);
}

function loadFromSteam() {
	if (typeof greenworks === 'undefined') return;
	greenworks.readTextFromFile('TrimpsSave.sav', loadFromSteamCallback, loadFromSteamErrorCallback);
}

function cloudSaveCallback(data) {
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
	if (getPerkLevel("Frenzy")) game.portal.Frenzy.trimpDied();
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
	var elem = document.getElementById("buildingsHere");
	elem.innerHTML = "";
	for (var item in game.buildings) {
		building = game.buildings[item];
		if (building.locked === 1) continue;
		drawBuilding(item, elem);
		if (building.alert && game.options.menu.showAlerts.enabled) {
			document.getElementById("buildingsAlert").innerHTML = "!";
			if (document.getElementById(item + "Alert")) document.getElementById(item + "Alert").innerHTML = "!";
		}
	}
	updateGeneratorInfo();
}

//Check and update each patch!
function drawAllUpgrades(force) {
	if (usingRealTimeOffline && !force) return;
	var elem = document.getElementById("upgradesHere");
	elem.innerHTML = "";
	for (var item in game.upgrades) {
		if (game.upgrades[item].locked == 1) continue;
		drawUpgrade(item, elem);
		if (game.upgrades[item].alert && game.options.menu.showAlerts.enabled) {
			document.getElementById("upgradesAlert").innerHTML = "!";
			if (document.getElementById(item + "Alert")) document.getElementById(item + "Alert").innerHTML = "!";
		}
	}
	goldenUpgradesShown = false;
	displayGoldenUpgrades();
}

//Check and update each patch!
function drawAllEquipment(force) {
	if (usingRealTimeOffline && !force) return;
	var elem = document.getElementById("equipmentHere");
	elem.innerHTML = "";
	for (var item in game.equipment) {
		if (game.equipment[item].locked == 1) continue;
		drawEquipment(item, elem);
	}
	displayEfficientEquipment();
}

//Check and update each patch!
function drawAllJobs(force) {
	if (usingRealTimeOffline && !force) return;
	var elem = document.getElementById("jobsHere");
	elem.innerHTML = "";
	for (var item in game.jobs) {
		if (game.jobs[item].locked == 1) continue;
		if (item == "Geneticist" && game.global.Geneticistassist) {
			drawGeneticistassist(elem);
		}
		else
			drawJob(item, elem);
		if (game.jobs[item].alert && game.options.menu.showAlerts.enabled) {
			document.getElementById("jobsAlert").innerHTML = "!";
			if (document.getElementById(item + "Alert")) document.getElementById(item + "Alert").innerHTML = "!";
		}
	}
}

//Check and update each patch!
function updateLabels(force) { //Tried just updating as something changes, but seems to be better to do all at once all the time
	if (usingRealTimeOffline && !force) return;
	var toUpdate;
	//Resources (food, wood, metal, trimps, science). Per second will be handled in separate function, and called from job loop.
	for (var item in game.resources) {
		toUpdate = game.resources[item];
		if (!(toUpdate.owned > 0)) {
			toUpdate.owned = parseFloat(toUpdate.owned);
			if (!(toUpdate.owned > 0)) toUpdate.owned = 0;
		}
		if (item == "radon") continue;
		if (item == "helium" && game.global.universe == 2) toUpdate = game.resources.radon;
		document.getElementById(item + "Owned").innerHTML = prettify(Math.floor(toUpdate.owned));
		if (toUpdate.max == -1 || document.getElementById(item + "Max") === null) continue;
		var newMax = toUpdate.max;
		if (item != "trimps")
			newMax = calcHeirloomBonus("Shield", "storageSize", (newMax * (game.portal.Packrat.modifier * getPerkLevel("Packrat") + 1)));
		else if (item == "trimps") newMax = toUpdate.realMax();
		document.getElementById(item + "Max").innerHTML = prettify(newMax);
		var bar = document.getElementById(item + "Bar");
		if (game.options.menu.progressBars.enabled) {
			var percentToMax = ((toUpdate.owned / newMax) * 100);
			swapClass("percentColor", getBarColorClass(100 - percentToMax), bar);
			bar.style.width = percentToMax + "%";
		}
	}
	updateSideTrimps();
	//Buildings, trap is the only unique building, needs to be displayed in trimp area as well
	for (var itemA in game.buildings) {
		toUpdate = game.buildings[itemA];
		if (toUpdate.locked == 1) continue;
		var elem = document.getElementById(itemA + "Owned");
		if (elem === null) {
			unlockBuilding(itemA);
			elem = document.getElementById(itemA + "Owned");
		}
		if (elem === null) continue;
		elem.innerHTML = (game.options.menu.menuFormatting.enabled) ? prettify(toUpdate.owned) : toUpdate.owned;
		if (itemA == "Trap") {
			var trap1 = document.getElementById("trimpTrapText")
			if (trap1) trap1.innerHTML = prettify(toUpdate.owned);
			var trap2 = document.getElementById("trimpTrapText2")
			if (trap2) trap2.innerHTML = prettify(toUpdate.owned);
		}
	}
	//Jobs, check PS here and stuff. Trimps per second is handled by breed() function
	for (var itemB in game.jobs) {
		toUpdate = game.jobs[itemB];
		if (toUpdate.locked == 1 && toUpdate.increase == "custom") continue;
		if (toUpdate.locked == 1) {
			if (game.resources[toUpdate.increase].owned > 0)
				updatePs(toUpdate, false, itemB);
			continue;
		}
		if (document.getElementById(itemB) === null) {
			unlockJob(itemB);
			drawAllJobs(true);
		}
		document.getElementById(itemB + "Owned").innerHTML = (game.options.menu.menuFormatting.enabled) ? prettify(toUpdate.owned) : toUpdate.owned;
		var perSec = (toUpdate.owned * toUpdate.modifier);
		updatePs(toUpdate, false, itemB);
	}
	//Upgrades, owned will only exist if 'allowed' exists on object
	for (var itemC in game.upgrades) {
		toUpdate = game.upgrades[itemC];
		if (toUpdate.allowed - toUpdate.done >= 1) toUpdate.locked = 0;
		if (toUpdate.locked == 1) continue;
		if (document.getElementById(itemC) === null) unlockUpgrade(itemC, true);
	}
	//Equipment
	checkAndDisplayEquipment();
}

//Check and update each patch!
function updateButtonColor(what, canAfford, isJob) {
	if (atSettings.initialise.loaded) {
		if (usingRealTimeOffline && !getPageSetting('timeWarpDisplay')) return;
	} else {
		if (usingRealTimeOffline) return;
	} if (what == "Amalgamator") return;
	var elem = document.getElementById(what);
	if (elem === null) {
		return;
	}
	if (game.options.menu.lockOnUnlock.enabled == 1 && (new Date().getTime() - 1000 <= game.global.lastUnlock)) canAfford = false;
	if (game.global.challengeActive == "Archaeology" && game.upgrades[what] && game.upgrades[what].isRelic) {
		var className = "thingColor" + ((canAfford) ? "CanAfford" : "CanNotAfford");
		var nextAuto = game.challenges.Archaeology.checkAutomator();
		if (nextAuto == "off") className += "RelicOff";
		else if (nextAuto == "satisfied") className += "RelicSatisfied";
		else if (nextAuto == what + "Cost") className += "RelicNextWaiting";
		else if (nextAuto + "Relic" == what) className += "RelicBuying";
		swapClass("thingColor", className, elem);
		return;
	}
	if (isJob && game.global.firing === true) {
		if (game.jobs[what].owned >= 1) {
			//note for future self:
			//if you need to add more states here, change these to use the swapClass func -grabz
			//with "thingColor" as first param
			swapClass("thingColor", "thingColorFiringJob", elem);
		}
		else {
			swapClass("thingColor", "thingColorCanNotAfford", elem);
		}
		return;
	}
	if (what == "Warpstation") {
		if (canAfford)
			elem.style.backgroundColor = getWarpstationColor();
		else
			elem.style.backgroundColor = "";
	}

	if (canAfford) {
		if
			(what == "Gigastation" && (ctrlPressed || game.options.menu.ctrlGigas.enabled)) swapClass("thingColor", "thingColorCtrl", elem);
		else
			swapClass("thingColor", "thingColorCanAfford", elem);
	}
	else
		swapClass("thingColor", "thingColorCanNotAfford", elem);
}

//Hacky way to allow the SA popup button to work within TW.
autoBattle.originalpopup = autoBattle.popup;
autoBattle.popup = function () {
	var offlineMode = false;
	if (usingRealTimeOffline) {
		offlineMode = true;
		usingRealTimeOffline = false;
	}
	autoBattle.originalpopup(...arguments);
	if (offlineMode) usingRealTimeOffline = true;
}