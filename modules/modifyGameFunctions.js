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
};

//Attach AT related buttons to the main TW UI.
//Will attach AutoMaps, AutoMaps Status, AutoTrimps Settings, AutoJobs, AutoStructure
offlineProgress.originalStart = offlineProgress.start;
offlineProgress.start = function () {
	const trustWorthy = game.options.menu.offlineProgress.enabled;
	if (game.options.menu.offlineProgress.enabled === 1) game.options.menu.offlineProgress.enabled = 2;
	offlineProgress.originalStart(...arguments);
	while (game.options.menu.offlineProgress.enabled !== trustWorthy) toggleSetting('offlineProgress');
	try {
		const offlineTime = offlineProgress.totalOfflineTime / 1000 - 86400;
		if (offlineTime > 0) {
			// offlineTime *= 1000;
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
			game.global.lastOnline -= timeRun;
			game.global.portalTime -= timeRun;
			game.global.zoneStarted -= timeRun;
			game.global.lastSoldierSentAt -= timeRun;
			game.global.lastSkeletimp -= timeRun;
			game.permaBoneBonuses.boosts.lastChargeAt -= timeRun;
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
	if (arguments[0] === 'totalMaps') {
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
	var elem = document.getElementById('buildingsHere');
	elem.innerHTML = '';
	for (var item in game.buildings) {
		let building = game.buildings[item];
		if (building.locked === 1) continue;
		drawBuilding(item, elem);
		if (building.alert && game.options.menu.showAlerts.enabled) {
			document.getElementById('buildingsAlert').innerHTML = '!';
			if (document.getElementById(item + 'Alert')) document.getElementById(item + 'Alert').innerHTML = '!';
		}
	}
	updateGeneratorInfo();
}

//Check and update each patch!
function drawAllUpgrades(force) {
	if (usingRealTimeOffline && !force) return;
	var elem = document.getElementById('upgradesHere');
	elem.innerHTML = '';
	for (var item in game.upgrades) {
		if (game.upgrades[item].locked == 1) continue;
		drawUpgrade(item, elem);
		if (game.upgrades[item].alert && game.options.menu.showAlerts.enabled) {
			document.getElementById('upgradesAlert').innerHTML = '!';
			if (document.getElementById(item + 'Alert')) document.getElementById(item + 'Alert').innerHTML = '!';
		}
	}
	goldenUpgradesShown = false;
	displayGoldenUpgrades();
}

//Check and update each patch!
function drawAllEquipment(force) {
	if (usingRealTimeOffline && !force) return;
	var elem = document.getElementById('equipmentHere');
	elem.innerHTML = '';
	for (var item in game.equipment) {
		if (game.equipment[item].locked == 1) continue;
		drawEquipment(item, elem);
	}
	displayEfficientEquipment();
}

//Check and update each patch!
function drawAllJobs(force) {
	if (usingRealTimeOffline && !force) return;
	var elem = document.getElementById('jobsHere');
	elem.innerHTML = '';
	for (var item in game.jobs) {
		if (game.jobs[item].locked == 1) continue;
		if (item == 'Geneticist' && game.global.Geneticistassist) {
			drawGeneticistassist(elem);
		} else drawJob(item, elem);
		if (game.jobs[item].alert && game.options.menu.showAlerts.enabled) {
			document.getElementById('jobsAlert').innerHTML = '!';
			if (document.getElementById(item + 'Alert')) document.getElementById(item + 'Alert').innerHTML = '!';
		}
	}
}

//Check and update each patch!
function updateLabels(force) {
	//Tried just updating as something changes, but seems to be better to do all at once all the time
	if (usingRealTimeOffline && !force) return;
	var toUpdate;
	//Resources (food, wood, metal, trimps, science). Per second will be handled in separate function, and called from job loop.
	for (var item in game.resources) {
		toUpdate = game.resources[item];
		if (!(toUpdate.owned > 0)) {
			toUpdate.owned = parseFloat(toUpdate.owned);
			if (!(toUpdate.owned > 0)) toUpdate.owned = 0;
		}
		if (item == 'radon') continue;
		if (item == 'helium' && game.global.universe == 2) toUpdate = game.resources.radon;
		document.getElementById(item + 'Owned').innerHTML = prettify(Math.floor(toUpdate.owned));
		if (toUpdate.max == -1 || document.getElementById(item + 'Max') === null) continue;
		var newMax = toUpdate.max;
		if (item != 'trimps') newMax = calcHeirloomBonus('Shield', 'storageSize', newMax * (game.portal.Packrat.modifier * getPerkLevel('Packrat') + 1));
		else if (item == 'trimps') newMax = toUpdate.realMax();
		document.getElementById(item + 'Max').innerHTML = prettify(newMax);
		var bar = document.getElementById(item + 'Bar');
		if (game.options.menu.progressBars.enabled) {
			var percentToMax = (toUpdate.owned / newMax) * 100;
			swapClass('percentColor', getBarColorClass(100 - percentToMax), bar);
			bar.style.width = percentToMax + '%';
		}
	}
	updateSideTrimps();
	//Buildings, trap is the only unique building, needs to be displayed in trimp area as well
	for (var itemA in game.buildings) {
		toUpdate = game.buildings[itemA];
		if (toUpdate.locked == 1) continue;
		var elem = document.getElementById(itemA + 'Owned');
		if (elem === null) {
			unlockBuilding(itemA);
			elem = document.getElementById(itemA + 'Owned');
		}
		if (elem === null) continue;
		elem.innerHTML = game.options.menu.menuFormatting.enabled ? prettify(toUpdate.owned) : toUpdate.owned;
		if (itemA == 'Trap') {
			var trap1 = document.getElementById('trimpTrapText');
			if (trap1) trap1.innerHTML = prettify(toUpdate.owned);
			var trap2 = document.getElementById('trimpTrapText2');
			if (trap2) trap2.innerHTML = prettify(toUpdate.owned);
		}
	}
	//Jobs, check PS here and stuff. Trimps per second is handled by breed() function
	for (var itemB in game.jobs) {
		toUpdate = game.jobs[itemB];
		if (toUpdate.locked == 1 && toUpdate.increase == 'custom') continue;
		if (toUpdate.locked == 1) {
			if (game.resources[toUpdate.increase].owned > 0) updatePs(toUpdate, false, itemB);
			continue;
		}
		if (document.getElementById(itemB) === null) {
			unlockJob(itemB);
			drawAllJobs(true);
		}
		document.getElementById(itemB + 'Owned').innerHTML = game.options.menu.menuFormatting.enabled ? prettify(toUpdate.owned) : toUpdate.owned;
		var perSec = toUpdate.owned * toUpdate.modifier;
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
	}
	if (what == 'Amalgamator') return;
	var elem = document.getElementById(what);
	if (elem === null) {
		return;
	}
	if (game.options.menu.lockOnUnlock.enabled == 1 && new Date().getTime() - 1000 <= game.global.lastUnlock) canAfford = false;
	if (game.global.challengeActive == 'Archaeology' && game.upgrades[what] && game.upgrades[what].isRelic) {
		var className = 'thingColor' + (canAfford ? 'CanAfford' : 'CanNotAfford');
		var nextAuto = game.challenges.Archaeology.checkAutomator();
		if (nextAuto == 'off') className += 'RelicOff';
		else if (nextAuto == 'satisfied') className += 'RelicSatisfied';
		else if (nextAuto == what + 'Cost') className += 'RelicNextWaiting';
		else if (nextAuto + 'Relic' == what) className += 'RelicBuying';
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
	if (what == 'Warpstation') {
		if (canAfford) elem.style.backgroundColor = getWarpstationColor();
		else elem.style.backgroundColor = '';
	}

	if (canAfford) {
		if (what == 'Gigastation' && (ctrlPressed || game.options.menu.ctrlGigas.enabled)) swapClass('thingColor', 'thingColorCtrl', elem);
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
		if (resName != 'gems' && game.permaBoneBonuses.multitasking.owned > 0 && game.resources.trimps.owned >= game.resources.trimps.realMax()) amt *= 1 + game.permaBoneBonuses.multitasking.mult();
		if (job != 'Explorer') {
			if (game.global.challengeActive == 'Alchemy') amt *= alchObj.getPotionEffect('Potion of Finding');
			amt *= alchObj.getPotionEffect('Elixir of Finding');
		}
		if (game.global.challengeActive == 'Frigid') amt *= game.challenges.Frigid.getShatteredMult();
		if (game.global.pandCompletions && job != 'Explorer') amt *= game.challenges.Pandemonium.getTrimpMult();
		if (game.global.desoCompletions && job != 'Explorer') amt *= game.challenges.Desolation.getTrimpMult();
		if (!game.portal.Observation.radLocked && game.global.universe == 2 && game.portal.Observation.trinkets > 0) amt *= game.portal.Observation.getMult();
		if (resName == 'food' || resName == 'wood' || resName == 'metal') {
			amt *= getParityBonus();
			if (autoBattle.oneTimers.Gathermate.owned && game.global.universe == 2) amt *= autoBattle.oneTimers.Gathermate.getMult();
		}
		if (Fluffy.isRewardActive('gatherer')) amt *= 2;
		if (getPerkLevel('Meditation') > 0 || (game.jobs.Magmamancer.owned > 0 && resName == 'metal')) {
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
			if (game.jobs.Magmamancer.owned && resName == 'metal') loops = 12;
			if (timeAtLastOnline < loops && chunkPercent < 100) {
				//Start from however many stacks were held before logging out. End at 5 stacks, the 6th will be all time remaining rather than chunks and handled at the end
				for (var z = timeAtLastOnline; z < loops; z++) {
					//If no full chunks left, let the final calculation handle it
					if (remaining < chunkPercent) break;
					//Remove a chunk from remaining, as it is about to be calculated
					remaining -= chunkPercent;
					//Check for z == 0 after removing chunkPercent, that way however much time was left before the first stack doesn't get calculated as having a stack
					if (z == 0) continue;
					//Find out exactly how much of amt needs to be modified to make up for this chunk
					toAlter = (originalAmt * chunkPercent) / 100;
					//Remove it from toAlter
					amt -= toAlter;
					//Modify and add back
					if (medLevel && z < 6) amt += toAlter * (1 + z * 0.01 * medLevel);
					//loops will only set to 72 if the current resource is metal and the player has Magmamancers
					if (loops == 12) amt += toAlter * game.jobs.Magmamancer.getBonusPercent(false, z);
				}
			}
			if (remaining) {
				//Check again how much needs to be altered
				toAlter = originalAmt * (remaining / 100);
				//Remove
				amt -= toAlter;
				//Modify and add back the final amount
				if (medLevel) amt += toAlter * (1 + game.portal.Meditation.getBonusPercent() * 0.01);
				if (loops == 12) amt += toAlter * game.jobs.Magmamancer.getBonusPercent();
			}
		}
		if (game.global.challengeActive == 'Decay' || game.global.challengeActive == 'Melt') {
			var challenge = game.challenges[game.global.challengeActive];
			amt *= 10;
			amt *= Math.pow(challenge.decayValue, challenge.stacks);
		}
		if (challengeActive('Meditate')) amt *= 1.25;
		if (challengeActive('Balance')) amt *= game.challenges.Balance.getGatherMult();
		if (game.global.challengeActive == 'Unbalance') amt *= game.challenges.Unbalance.getGatherMult();
		if (game.global.challengeActive == 'Archaeology' && resource != 'fragments') amt *= game.challenges.Archaeology.getStatMult('science');
		if (game.global.challengeActive == 'Insanity' && resource != 'fragments') amt *= game.challenges.Insanity.getLootMult();
		if (game.challenges.Nurture.boostsActive() && resource != 'fragments') amt *= game.challenges.Nurture.getResourceBoost();
		if (game.global.challengeActive == 'Desolation' && resource != 'fragments') amt *= game.challenges.Desolation.trimpResourceMult();
		if (game.global.challengeActive == 'Daily') {
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
			if (resName == 'gems') game.stats.gemsCollected.value += amt;
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
function getPsString_AT(what) {
	if (what === 'helium') return;
	const resOrder = ['food', 'wood', 'metal', 'science', 'gems', 'fragments'];
	const books = ['farming', 'lumber', 'miner', 'science'];
	const jobs = ['Farmer', 'Lumberjack', 'Miner', 'Scientist', 'Dragimp', 'Explorer'];
	const index = resOrder.indexOf(what);
	const job = game.jobs[jobs[index]];
	const book = game.upgrades['Speed' + books[index]];
	const mBook = game.upgrades['Mega' + books[index]];
	const base = what === 'fragments' ? 0.4 : 0.5;

	//Add base and job count
	let currentCalc = job.owned * base;

	//Add books
	if (what !== 'gems' && game.permaBoneBonuses.multitasking.owned > 0) {
		const str = game.resources.trimps.owned >= game.resources.trimps.realMax() ? game.permaBoneBonuses.multitasking.mult() : 0;
		currentCalc *= 1 + str;
	}
	//Add books
	if (typeof book !== 'undefined' && book.done > 0) {
		const bookStrength = Math.pow(1.25, book.done);
		currentCalc *= bookStrength;
	}
	//Add Megabooks
	if (typeof mBook !== 'undefined' && mBook.done > 0) {
		const mod = game.global.frugalDone ? 1.6 : 1.5;
		const mBookStrength = Math.pow(mod, mBook.done);
		currentCalc *= mBookStrength;
	}
	//Add bounty
	if (what !== 'gems' && game.upgrades.Bounty.done > 0) {
		currentCalc *= 2;
	}
	//Add Tribute
	if (what === 'gems' && game.buildings.Tribute.owned > 0) {
		const tributeStrength = Math.pow(game.buildings.Tribute.increase.by, game.buildings.Tribute.owned);
		currentCalc *= tributeStrength;
	}
	//Add Whipimp
	if (game.unlocks.impCount.Whipimp > 0) {
		const whipStrength = Math.pow(1.003, game.unlocks.impCount.Whipimp);
		currentCalc *= whipStrength;
	}
	//Add motivation
	if (getPerkLevel('Motivation') > 0) {
		const motivationStrength = getPerkLevel('Motivation') * game.portal.Motivation.modifier;
		currentCalc *= motivationStrength + 1;
	}
	//Add motivation 2
	if (getPerkLevel('Motivation_II') > 0) {
		const motivationStrength = getPerkLevel('Motivation_II') * game.portal.Motivation_II.modifier;
		currentCalc *= motivationStrength + 1;
	}
	//Observation
	if (!game.portal.Observation.radLocked && game.global.universe === 2 && game.portal.Observation.trinkets > 0) {
		const mult = game.portal.Observation.getMult();
		currentCalc *= mult;
	}
	//Add Fluffy Gatherer
	if (Fluffy.isRewardActive('gatherer')) {
		currentCalc *= 2;
	}
	//Add Meditation
	if (getPerkLevel('Meditation') > 0) {
		const medStrength = game.portal.Meditation.getBonusPercent();
		if (medStrength > 0) {
			currentCalc *= 1 + medStrength * 0.01;
		}
	}
	//Add Alchemy
	let potionFinding;
	if (challengeActive('Alchemy')) potionFinding = alchObj.getPotionEffect('Potion of Finding');
	if (potionFinding > 1 && what !== 'fragments' && what !== 'science') {
		currentCalc *= potionFinding;
	}
	potionFinding = alchObj.getPotionEffect('Elixir of Finding');
	if (potionFinding > 1 && what !== 'fragments' && what !== 'science') {
		currentCalc *= potionFinding;
	}
	//Add Magmamancer
	if (game.jobs.Magmamancer.owned > 0 && what === 'metal') {
		const manceStrength = game.jobs.Magmamancer.getBonusPercent();
		if (manceStrength > 1) currentCalc *= manceStrength;
	}
	//Add Speedbooks
	if (game.upgrades.Speedexplorer.done > 0 && what === 'fragments') {
		const bonus = Math.pow(4, game.upgrades.Speedexplorer.done);
		currentCalc *= bonus;
	}
	//Add Size
	if (challengeActive('Size') && (what === 'food' || what === 'metal' || what === 'wood')) {
		currentCalc *= 1.5;
	}
	//Add frigid
	if (challengeActive('Frigid')) {
		currentCalc *= game.challenges.Frigid.getShatteredMult();
	}
	//Add downsize
	if (challengeActive('Downsize')) {
		currentCalc *= 5;
	}
	//Add Meditate
	if (challengeActive('Meditate')) {
		currentCalc *= 1.25;
	}

	if (challengeActive('Toxicity')) {
		const toxMult = (game.challenges.Toxicity.lootMult * game.challenges.Toxicity.stacks) / 100;
		currentCalc *= 1 + toxMult;
	}
	if (challengeActive('Balance') || challengeActive('Unbalance')) {
		const chal = challengeActive('Balance') ? game.challenges.Balance : game.challenges.Unbalance;
		currentCalc *= chal.getGatherMult();
	}
	if (challengeActive('Decay') || challengeActive('Melt')) {
		currentCalc *= 10;
		const currChall = challengeActive('Decay') ? 'Decay' : 'Melt';
		const stackStr = Math.pow(game.challenges[currChall].decayValue, game.challenges[currChall].stacks);
		currentCalc *= stackStr;
	}
	if (challengeActive('Watch')) {
		currentCalc /= 2;
	}
	if (challengeActive('Lead') && game.global.world % 2 === 1) {
		currentCalc *= 2;
	}

	if (challengeActive('Archaeology') && what !== 'fragments') {
		currentCalc *= game.challenges.Archaeology.getStatMult('science');
	}
	if (challengeActive('Insanity')) {
		currentCalc *= game.challenges.Insanity.getLootMult();
	}
	if (game.challenges.Nurture.boostsActive() && what !== 'fragments') {
		currentCalc *= game.challenges.Nurture.getResourceBoost();
	}
	if (game.global.pandCompletions && what !== 'fragments') {
		currentCalc *= game.challenges.Pandemonium.getTrimpMult();
	}
	if (game.global.desoCompletions && what !== 'fragments') {
		currentCalc *= game.challenges.Desolation.getTrimpMult();
	}
	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.dedication !== 'undefined') {
			currentCalc *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
		}
		if (typeof game.global.dailyChallenge.famine !== 'undefined' && what !== 'fragments' && what !== 'science') {
			currentCalc *= dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
		}
	}
	if (challengeActive('Hypothermia') && what === 'wood') {
		currentCalc *= game.challenges.Hypothermia.getWoodMult(true);
	}
	if (challengeActive('Desolation') && what !== 'fragments') {
		currentCalc *= game.challenges.Desolation.trimpResourceMult();
	}
	if (((what === 'food' || what === 'wood') && game.buildings.Antenna.owned >= 5) || (what === 'metal' && game.buildings.Antenna.owned >= 15)) {
		currentCalc *= game.jobs.Meteorologist.getExtraMult();
	}
	if ((what === 'food' || what === 'metal' || what === 'wood') && getParityBonus() > 1) {
		currentCalc *= getParityBonus();
	}
	if ((what === 'food' || what === 'metal' || what === 'wood') && autoBattle.oneTimers.Gathermate.owned && game.global.universe === 2) {
		currentCalc *= autoBattle.oneTimers.Gathermate.getMult();
	}
	if (what !== 'fragments' && getEmpowerment() === 'Wind') {
		currentCalc *= 1 + game.empowerments.Wind.getCombatModifier();
	}
	const heirloomBonus = calcHeirloomBonus('Staff', jobs[index] + 'Speed', 0, true);
	if (heirloomBonus > 0) {
		currentCalc *= heirloomBonus / 100 + 1;
	}
	//Add player
	if (game.global.playerGathering === what) {
		if ((game.talents.turkimp2.purchased || game.global.turkimpTimer > 0) && (what === 'food' || what === 'wood' || what === 'metal')) {
			let tBonus = 50;
			if (game.talents.turkimp2.purchased) tBonus = 100;
			else if (game.talents.turkimp2.purchased) tBonus = 75;
			currentCalc *= 1 + tBonus / 100;
		}
		currentCalc += getPlayerModifier();
	}
	//Add Loot, ALWAYS LAST
	if (game.options.menu.useAverages.enabled) {
		let avg = getAvgLootSecond(what);
		if (avg > 0.001) {
			currentCalc += avg;
		}
	}
	return currentCalc;
}

//Check and update each patch!
function simpleSeconds_AT(what, seconds, workerRatio) {
	var workerRatio = !workerRatio ? null : workerRatio;

	if (typeof workerRatio !== 'undefined' && workerRatio !== null) {
		var desiredRatios = Array.from(workerRatio.split(','));
		desiredRatios = [desiredRatios[0] !== undefined ? Number(desiredRatios[0]) : 0, desiredRatios[1] !== undefined ? Number(desiredRatios[1]) : 0, desiredRatios[2] !== undefined ? Number(desiredRatios[2]) : 0, desiredRatios[3] !== undefined ? Number(desiredRatios[3]) : 0];
		var totalFraction = desiredRatios.reduce((a, b) => {
			return a + b;
		});
	}

	//Come home to the impossible flavour of balanced resource gain. Come home, to simple seconds.
	var jobName;
	var pos;
	switch (what) {
		case 'food':
			jobName = 'Farmer';
			pos = 0;
			break;
		case 'wood':
			jobName = 'Lumberjack';
			pos = 1;
			break;
		case 'metal':
			jobName = 'Miner';
			pos = 2;
			break;
		case 'gems':
			jobName = 'Dragimp';
			break;
		case 'fragments':
			jobName = 'Explorer';
			break;
		case 'science':
			jobName = 'Scientist';
			pos = 3;
			break;
	}
	var heirloom = !jobName
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
	var job = game.jobs[jobName];
	var trimpworkers = game.resources.trimps.realMax() / 2 - game.jobs.Explorer.owned - game.jobs.Meteorologist.owned - game.jobs.Worshipper.owned;
	if (challengeActive('Trappapalooza')) trimpworkers = game.resources.trimps.owned;
	var workers = workerRatio !== null ? Math.floor((trimpworkers * desiredRatios[pos]) / totalFraction) : mapSettings.mapName === 'Worshipper Farm' ? trimpworkers : job.owned;

	var amt = workers * job.modifier * seconds;
	amt += amt * getPerkLevel('Motivation') * game.portal.Motivation.modifier;
	if (what !== 'gems' && game.permaBoneBonuses.multitasking.owned > 0) amt *= 1 + game.permaBoneBonuses.multitasking.mult();
	if (what !== 'science' && what !== 'fragments' && challengeActive('Alchemy')) amt *= alchObj.getPotionEffect('Potion of Finding');
	if (challengeActive('Frigid')) amt *= game.challenges.Frigid.getShatteredMult();
	if (game.global.pandCompletions && game.global.universe === 2 && what !== 'fragments') amt *= game.challenges.Pandemonium.getTrimpMult();
	if (game.global.desoCompletions && game.global.universe === 2 && what !== 'fragments') amt *= game.challenges.Desolation.getTrimpMult();
	if (getPerkLevel('Observation') > 0 && game.portal.Observation.trinkets > 0) amt *= game.portal.Observation.getMult();

	if (what === 'food' || what === 'wood' || what === 'metal') {
		if (workerRatio) amt *= calculateParityBonus_AT(desiredRatios, heirloomSearch(heirloom));
		else amt *= getParityBonus();
		if (autoBattle.oneTimers.Gathermate.owned) amt *= autoBattle.oneTimers.Gathermate.getMult();
	}
	if (((what === 'food' || what === 'wood') && game.buildings.Antenna.owned >= 5) || (what === 'metal' && game.buildings.Antenna.owned >= 15)) amt *= game.jobs.Meteorologist.getExtraMult();
	if (Fluffy.isRewardActive('gatherer')) amt *= 2;
	if (challengeActive('Unbalance')) amt *= game.challenges.Unbalance.getGatherMult();

	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.famine !== 'undefined' && what !== 'fragments' && what !== 'science') amt *= dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
		if (typeof game.global.dailyChallenge.dedication !== 'undefined') amt *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
	}
	if (challengeActive('Melt')) {
		amt *= 10;
		amt *= Math.pow(game.challenges.Melt.decayValue, game.challenges.Melt.stacks);
	}

	if (game.challenges.Nurture.boostsActive()) amt *= game.challenges.Nurture.getResourceBoost();

	if (what === 'wood' && challengeActive('Hypothermia') && game.challenges.Hypothermia.bonfires > 0) amt *= game.challenges.Hypothermia.getWoodMult();

	if (challengeActive('Desolation')) amt *= game.challenges.Desolation.trimpResourceMult();
	//Calculating heirloom bonus
	if (heirloom === null) amt = calcHeirloomBonus('Staff', jobName + 'Speed', amt);
	else amt = calcHeirloomBonus_AT('Staff', jobName + 'Speed', amt, false, heirloom);

	var turkimpBonus = game.talents.turkimp2.purchased ? 2 : game.talents.turkimp2.purchased ? 1.75 : 1.5;

	if ((game.talents.turkimp2.purchased || game.global.turkimpTimer > 0) && (what === 'food' || what === 'metal' || what === 'wood')) {
		amt *= turkimpBonus;
		amt += getPlayerModifier() * seconds;
	}
	return amt;
}

//Check and update each patch!
function scaleToCurrentMap_AT(amt, ignoreBonuses, ignoreScry, map) {
	if (map) map = game.global.world + map;
	if (!map) map = game.global.mapsActive ? getCurrentMapObject().level : challengeActive('Pandemonium') ? game.global.world - 1 : game.global.world;
	game.global.world + map;
	var compare = game.global.world;
	if (map > compare && map.location !== 'Bionic') {
		amt *= Math.pow(1.1, map - compare);
	} else {
		if (game.talents.mapLoot.purchased) compare--;
		if (map < compare) {
			//-20% loot compounding for each level below world
			amt *= Math.pow(0.8, compare - map);
		}
	}
	if (ignoreBonuses) return amt;
	//Add map loot bonus
	var maploot = game.global.farmlandsUnlocked && game.singleRunBonuses.goldMaps.owned ? 3.6 : game.global.decayDone && game.singleRunBonuses.goldMaps.owned ? 2.85 : game.global.farmlandsUnlocked ? 2.6 : game.global.decayDone ? 1.85 : 1.6;
	amt = Math.round(amt * maploot);
	amt = scaleLootBonuses(amt, ignoreScry);
	return amt;
}

//Check and update each patch!
function calculateParityBonus_AT(workerRatio, heirloom) {
	if (!game.global.StaffEquipped || game.global.StaffEquipped.rarity < 10) {
		game.global.parityBonus = 1;
		return 1;
	}
	var allowed = ['Farmer', 'Lumberjack', 'Miner'];
	var totalWorkers = 0;
	var numWorkers = [];
	if (!workerRatio) {
		for (var x = 0; x < allowed.length; x++) {
			var thisWorkers = game.jobs[allowed[x]].owned;
			totalWorkers += thisWorkers;
			numWorkers[x] = thisWorkers;
		}
		var workerRatios = [];
		for (var x = 0; x < numWorkers.length; x++) {
			workerRatios.push(numWorkers[x] / totalWorkers);
		}
	} else {
		var freeWorkers = Math.ceil(Math.min(game.resources.trimps.realMax() / 2), game.resources.trimps.owned) - (game.resources.trimps.employed - game.jobs.Explorer.owned - game.jobs.Meteorologist.owned - game.jobs.Worshipper.owned);
		var workerRatios = workerRatio;
		var ratio = workerRatios.reduce((a, b) => a + b, 0);
		var freeWorkerDivided = Math.max(1, freeWorkers / ratio);

		for (var x = 0; x < allowed.length; x++) {
			var thisWorkers = freeWorkerDivided * workerRatios[x];
			totalWorkers += thisWorkers;
			numWorkers[x] = thisWorkers;
		}
	}
	var resourcePop = totalWorkers;
	resourcePop = Math.log(resourcePop) / Math.log(3);
	var largestWorker = Math.log(Math.max(...numWorkers)) / Math.log(3);
	var spreadFactor = resourcePop - largestWorker;
	var preLoomBonus = spreadFactor * spreadFactor;
	var finalWithParity = (1 + preLoomBonus) * getHazardParityMult(heirloom);
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
		let resource = game.resources[item];
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
	var bonus;
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
	var mod = getHeirloomBonus_AT(type, modName, customShield);
	if (!mod) return number;
	if (getValueOnly) return mod;
	if (mod <= 0) return number;
	return number * (mod / 100 + 1);
}

function getPlayerCritChance_AT(customShield) {
	//returns decimal: 1 = 100%
	if (challengeActive('Frigid') && game.challenges.Frigid.warmth <= 0) return 0;
	if (challengeActive('Duel')) return game.challenges.Duel.enemyStacks / 100;
	var heirloomValue = getHeirloomBonus_AT('Shield', 'critChance', customShield);
	var critChance = 0;
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
	var relentLevel = getPerkLevel('Relentlessness');
	var heirloomValue = getHeirloomBonus_AT('Shield', 'critDamage', customShield);
	var critMult = game.portal.Relentlessness.otherModifier * relentLevel + heirloomValue / 100 + 1;
	critMult += getPerkLevel('Criticality') * game.portal.Criticality.modifier;
	if (relentLevel > 0) critMult += 1;
	if (game.challenges.Nurture.boostsActive() && game.challenges.Nurture.getLevel() >= 5) critMult += 0.5;
	critMult += alchObj.getPotionEffect('Elixir of Accuracy');
	return critMult;
}

function getPlayerEqualityMult_AT(customShield) {
	var modifier = game.portal.Equality.modifier;
	var tempModifier = 1 - modifier;
	var heirloomValue = getHeirloomBonus_AT('Shield', 'inequality', customShield);
	tempModifier *= heirloomValue / 100;
	modifier += tempModifier;
	return modifier;
}

function getEnergyShieldMult_AT(mapType, noHeirloom) {
	if (game.global.universe !== 2) return 0;
	var total = 0;
	if (game.upgrades.Prismatic.done) total += 0.5; //Prismatic: Drops Z2
	if (game.upgrades.Prismalicious.done) total += 0.5; //Prismalicious: Drops from Prismatic Palace at Z20
	if (getPerkLevel('Prismal') > 0) total += getPerkLevel('Prismal') * game.portal.Prismal.modifier; //Prismal perk, total possible is 100%
	total += Fluffy.isRewardActive('prism') * 0.25; //Fluffy Prism reward, 25% each, total of 25% available
	if (challengeActive('Bublé')) total += 2.5; //Bublé challenge - 100%
	if (autoBattle.oneTimers.Suprism.owned) total += autoBattle.oneTimers.Suprism.getMult(); //SpireAssault - 3% per level

	if (!noHeirloom) {
		var heirloomValue = getHeirloomBonus_AT('Shield', 'prismatic', heirloomShieldToEquip(mapType));
		if (heirloomValue > 0) total += heirloomValue / 100;
	}
	return total;
}

function getHazardGammaBonus_AT(heirloom) {
	if (!heirloom) heirloom = game.global.ShieldEquipped;
	if (!heirloom || heirloom.rarity < 10) return 0;
	var spent = getTotalHeirloomRefundValue(heirloom, true);
	spent += 1e6;
	var mult = heirloom.rarity === 11 ? 10000 : 4000;
	var bonus = log10(spent) * mult;
	return bonus;
}
