MODULES["portal"] = {};
MODULES["portal"].timeout = 5000;
MODULES["portal"].bufferExceedFactor = 5;
var zonePostpone = 0;

function autoPortal() {
	if (game.global.challengeActive === "Decay") decayFinishChallenge();
	if (!game.global.portalActive) return;
	if (game.global.challengeActive === 'Daily' || game.global.runningChallengeSquared) return;

	var universePrefix = game.global.universe === 2 ? 'R' : ''
	if (autoTrimpSettings[universePrefix + 'AutoPortal'].selected === "Off") return;
	var universeAbbreviation = game.global.universe === 2 ? 'Rn' : 'He'
	var resourceType = game.global.universe === 2 ? 'Radon' : 'Helium'

	var portalZone = getPageSetting(universePrefix + 'CustomAutoPortal');
	//Set portal zone to current zone!
	if (MODULES.mapFunctions.portalZone === game.global.world) portalZone = game.global.world;

	switch (autoTrimpSettings[universePrefix + 'AutoPortal'].selected) {
		case "Helium Per Hour":
		case "Radon Per Hour":
			var OKtoPortal = false;
			if (!game.global.runningChallengeSquared) {
				var minZone = getPageSetting(universeAbbreviation + 'HrDontPortalBefore');
				game.stats.bestHeliumHourThisRun.evaluate();
				var bestHeHr = game.stats.bestHeliumHourThisRun.storedValue;
				var bestHeHrZone = game.stats.bestHeliumHourThisRun.atZone;
				var myHeliumHr = game.stats.heliumHour.value();
				var heliumHrBuffer = Math.abs(getPageSetting(resourceType + 'HrBuffer'));
				if (!aWholeNewWorld)
					heliumHrBuffer *= MODULES["portal"].bufferExceedFactor;
				var bufferExceeded = myHeliumHr < bestHeHr * (1 - (heliumHrBuffer / 100));
				if (bufferExceeded && game.global.world >= minZone) {
					OKtoPortal = true;
					if (aWholeNewWorld)
						zonePostpone = 0;
				}
				if (heliumHrBuffer == 0 && !aWholeNewWorld)
					OKtoPortal = false;
				if (OKtoPortal && zonePostpone == 0) {
					zonePostpone += 1;
					debug("My " + resourceType + "Hr was: " + myHeliumHr + " & the Best " + resourceType + "Hr was: " + bestHeHr + " at zone: " + bestHeHrZone, "portal");
					cancelTooltip();
					tooltip('confirm', null, 'update', '<b>Auto Portaling NOW!</b><p>Hit Delay Portal to WAIT 1 more zone.', 'zonePostpone+=1', '<b>NOTICE: Auto-Portaling in 5 seconds....</b>', 'Delay Portal');
					setTimeout(cancelTooltip, MODULES["portal"].timeout);
					setTimeout(function () {
						if (zonePostpone >= 2)
							return;
						if (autoTrimpSettings[resourceType + 'HourChallenge'].selected != 'None')
							doPortal(autoTrimpSettings[resourceType + 'HourChallenge'].selected);
						else
							doPortal();
					}, MODULES["portal"].timeout + 100);
				}
			}
			break;
		case "Custom":
			if (game.global.world >= portalZone) {
				if (autoTrimpSettings[resourceType + 'HourChallenge'].selected != 'None')
					doPortal(autoTrimpSettings[resourceType + 'HourChallenge'].selected);
				else
					doPortal();
			}
			break;
		case "Challenge 2":
		case "Challenge 3":
			if (game.global.world >= portalZone) {
				var challengeType = game.global.universe === 2 ? 'C3' : 'C2'
				if (autoTrimpSettings[resourceType + challengeType + 'Challenge'].selected != 'None')
					doPortal(autoTrimpSettings[resourceType + challengeType + 'Challenge'].selected, true);
				else
					doPortal();
			}
			break;
		case "Balance":
		case "Decay":
		case "Electricity":
		case "Life":
		case "Crushed":
		case "Nom":
		case "Toxicity":
		case "Watch":
		case "Lead":
		case "Corrupted":
		case "Domination":
		case "Experience":
			if (!game.global.challengeActive) {
				doPortal(autoTrimpSettings.AutoPortal.selected);
			}
			break;
		case "Melt":
		case "Bublé":
		case "Quagmire":
		case "Archaeology":
		case "Mayhem":
		case "Insanity":
		case "Nurture":
		case "Pandemonium":
		case "Alchemy":
		case "Hypothermia":
			if (!game.global.challengeActive) {
				doPortal(autoTrimpSettings.RAutoPortal.selected);
			}
			break;
		default:
			break;
	}
}

function dailyAutoPortal() {
	if (!game.global.portalActive) return;
	if (game.global.challengeActive !== "Daily") return;
	if (game.global.universe === 1 && game.global.highestLevelCleared < 100) return;
	if (game.global.universe === 2 && game.global.highestRadonLevelCleared < 29) return;
	if (game.global.runningChallengeSquared) return;

	var universePrefix = game.global.universe === 2 ? 'R' : ''
	var universeOpp = game.global.universe === 2 ? '' : 'R'
	var resourceType = game.global.universe === 2 ? 'Radon' : 'Helium'
	if (getPageSetting(universePrefix + 'AutoPortalDaily') == 1) {
		const portalPrefix = portalUniverse === 2 ? 'u2' : 'u1';
		var OKtoPortal = false;
		var minZone = getPageSetting(universePrefix + 'dHeHrDontPortalBefore');
		game.stats.bestHeliumHourThisRun.evaluate();
		var bestHeHr = game.stats.bestHeliumHourThisRun.storedValue;
		var bestHeHrZone = game.stats.bestHeliumHourThisRun.atZone;
		var myHeliumHr = game.stats.heliumHour.value();
		var heliumHrBuffer = Math.abs(getPageSetting(universePrefix + 'dHeliumHrBuffer'));
		if (!aWholeNewWorld) {
			heliumHrBuffer *= MODULES["portal"].bufferExceedFactor;
			var bufferExceeded = myHeliumHr < bestHeHr * (1 - (heliumHrBuffer / 100));
			if (bufferExceeded && game.global.world >= minZone) {
				OKtoPortal = true;
				if (aWholeNewWorld)
					zonePostpone = 0;
			}
			if (heliumHrBuffer == 0 && !aWholeNewWorld)
				OKtoPortal = false;
			if (OKtoPortal && zonePostpone == 0) {
				zonePostpone += 1;
				debug("My " + resourceType + "Hr was: " + myHeliumHr + " & the Best " + resourceType + "Hr was: " + bestHeHr + " at zone: " + bestHeHrZone, "portal");
				cancelTooltip();
				tooltip('confirm', null, 'update', '<b>Auto Portaling NOW!</b><p>Hit Delay Portal to WAIT 1 more zone.', 'zonePostpone+=1', '<b>NOTICE: Auto-Portaling in 5 seconds....</b>', 'Delay Portal');
				setTimeout(cancelTooltip, MODULES["portal"].timeout);
				setTimeout(function () {
					if (zonePostpone >= 2)
						return;
					if (OKtoPortal) {
						abandonDaily();
						document.getElementById('finishDailyBtnContainer').style.display = 'none';
					}
					if (autoTrimpSettings[universePrefix + 'dHeliumHourChallenge'].selected != 'None' && !getPageSetting(portalPrefix + 'daily'))
						doPortal(autoTrimpSettings[universePrefix + 'dHeliumHourChallenge'].selected);
					else if (autoTrimpSettings[universeOpp + 'dHeliumHourChallenge'].selected != 'None' && getPageSetting(portalPrefix + 'daily'))
						doPortal(autoTrimpSettings[universeOpp + 'dHeliumHourChallenge'].selected);
					else
						doPortal();
				}, MODULES["portal"].timeout + 100);
			}
		}
	}
	if (getPageSetting(universePrefix + 'AutoPortalDaily') == 2) {
		var portalZone = getPageSetting(universePrefix + 'dCustomAutoPortal');

		if (MODULES.mapFunctions.portalZone === game.global.world) {
			portalZone = game.global.world;
		}
		if (game.global.world >= portalZone) {
			abandonDaily();
			document.getElementById('finishDailyBtnContainer').style.display = 'none';
			if (autoTrimpSettings[universePrefix + 'dHeliumHourChallenge'].selected != 'None' && !getPageSetting(portalPrefix + 'daily'))
				doPortal(autoTrimpSettings[universePrefix + 'dHeliumHourChallenge'].selected);
			else if (autoTrimpSettings[universeOpp + 'dHeliumHourChallenge'].selected != 'None' && getPageSetting(portalPrefix + 'daily'))
				doPortal(autoTrimpSettings[universeOpp + 'dHeliumHourChallenge'].selected);
			else
				doPortal();
		}
	}
}

//Last part to fix!
function c2runnerportal() {
	if (game.global.universe === 1 && game.global.highestLevelCleared < 63) return;
	if (game.global.universe === 2 && game.global.highestRadonLevelCleared < 48) return;
	const portalOppPrefix = game.global.universe === 2 ? 3 : 2;
	if (!getPageSetting('c' + portalOppPrefix + 'runnerstart')) return;
	if (getPageSetting('c' + portalOppPrefix + 'runnerportal') <= 0) return;
	if (!game.global.runningChallengeSquared) return;
	const challengeType = game.global.universe === 2 ? 'RadonHourChallenge' : 'HeliumHourChallenge';

	if (game.global.world >= getPageSetting('c' + portalOppPrefix + 'runnerstart')) {
		if (game.global.runningChallengeSquared)
			finishChallengeSquared(true);
		if (autoTrimpSettings[challengeType].selected !== 'None')
			doPortal(autoTrimpSettings[challengeType].selected);
		else
			doPortal();
	}
	return;
}

function c2runner() {
	if (!game.global.portalActive) return;
	if ((portalUniverse === 1 && game.global.highestLevelCleared > 63) || (portalUniverse === 2 && game.global.highestRadonLevelCleared > 48)) return;
	const portalOppPrefix = game.global.universe === 2 ? 3 : 2;
	if (!getPageSetting('c' + portalOppPrefix + 'runnerstart')) return;
	if (getPageSetting('c' + portalOppPrefix + 'runnerportal') <= 0 || getPageSetting('c' + portalOppPrefix + 'runnerpercent') <= 0) return;

	const challengeArray = [];
	const universePrefix = game.global.universe === 2 ? 'C3 ' : 'C2 ';

	if (game.global.universe === 1) {
		//Adding U1 challenges
		var highestZone = game.global.highestLevelCleared + 1;
		if (highestZone >= 35) challengeArray.push('Size');
		if (highestZone >= 130) challengeArray.push('Slow');
		if (highestZone >= 180) challengeArray.push('Watch');
		if (getTotalPerkResource(true) >= 30) challengeArray.push('Discipline');
		if (highestZone >= 40) challengeArray.push('Balance');
		if (highestZone >= 45) challengeArray.push('Meditate');
		if (highestZone >= 25) challengeArray.push('Metal');
		if (highestZone >= 180) challengeArray.push('Lead');
		if (highestZone >= 145) challengeArray.push('Nom');
		if (highestZone >= 165) challengeArray.push('Toxicity');
		if (game.global.prisonClear >= 1) challengeArray.push('Electricity');
		if (highestZone >= 150) challengeArray.push('Mapology');
	}

	//Adding U2 challenges
	if (game.global.universe === 2) {
		var highestZone = game.global.highestRadonLevelCleared + 1;
		if (highestZone >= 50) challengeArray.push('Unlucky');
		if (highestZone >= 50) challengeArray.push('Unbalance');
		if (highestZone >= 85) challengeArray.push('Quest');
		if (highestZone >= 105) challengeArray.push('Storm');
		if (highestZone >= 50) challengeArray.push('Downsize');
		if (highestZone >= 50) challengeArray.push('Duel');
		if (highestZone >= 201) challengeArray.push('Smithless');
	}

	const worldType = game.global.universe === 2 ? 'highestRadonLevelCleared' : 'highestLevelCleared';
	for (var x = 0; x < challengeArray.length; x++) {
		if ((100 * (game.c2[challengeArray[x]] / (game.global[worldType] + 1))) < getPageSetting('c' + portalOppPrefix + 'runnerpercent')) {
			debug(challengeArray[x]);
			if (!challengeSquaredMode) toggleChallengeSquared();
			selectChallenge(challengeArray[x]);
			debug(universePrefix + "Runner: Starting " + universePrefix + "Challenge " + challengeArray[x]);
			return;
		}
	}
	return;
}

function doPortal(challenge, squared) {
	if (!game.global.portalActive) return;

	//Spending Magmite
	if (getPageSetting('spendmagmite') === 1) autoMagmiteSpender();
	//Identifying if we need to keep any heirlooms before portaling.
	autoheirlooms();
	//Open portal window
	portalClicked();
	if (!portalWindowOpen) {
		portalClicked();
	}
	//If for some reason portal window isn't open stop running
	if (!portalWindowOpen) return;

	//Initialising variables that will be used later.
	const portalPrefix = portalUniverse === 2 ? 'u1' : 'u2';
	const universePrefix = portalUniverse === 2 ? 'R' : '';
	const portalOppPrefix = portalUniverse === 2 ? 'u2' : 'u1';
	const universeOppPrefix = portalUniverse === 2 ? '' : 'R';

	//Running C∞ runner
	if (((portalUniverse === 1 && game.global.highestLevelCleared > 63) || (portalUniverse === 2 && game.global.highestRadonLevelCleared > 48)) &&
		getPageSetting('c' + (Number(portalOppPrefix.charAt(1)) + 1) + 'runnerstart') &&
		getPageSetting('c' + (Number(portalOppPrefix.charAt(1)) + 1) + 'runnerportal') > 0 &&
		getPageSetting('c' + (Number(portalOppPrefix.charAt(1)) + 1) + 'runnerpercent') > 0) {
		c2runner();
		if (!challengeSquaredMode) debug("C" + (Number(portalOppPrefix.charAt(1)) + 1) + " Runner: All C" + (Number(portalOppPrefix.charAt(1)) + 1) + "s above Threshold!");
	}
	//Running Dailies
	if (getPageSetting(universePrefix + 'AutoStartDaily') && !challengeSquaredMode) {
		//Swapping to other universe if necessary to run daily.
		if (getPageSetting(portalPrefix + 'daily') && portalUniverse !== portalPrefix.charAt(1)) swapPortalUniverse();
		selectChallenge('Daily');
		//Checking to see which dailies can be run
		checkCompleteDailies();
		var lastUndone = -7;
		while (++lastUndone <= 0) {
			var dailyCompleted = (game.global.recentDailies.indexOf(getDailyTimeString(lastUndone)) !== -1);
			if (!dailyCompleted)
				break;
		}

		//Will stop it from autoPortaling into dailies when you have dontCapDailies enabled and don't have 7 dailies stored.
		if (getPageSetting('dontCapDailies') && game.global.recentDailies.length !== 0) lastUndone = 1;
		//Portaling into a filler if all dailies have been run
		if (lastUndone === 1) {
			debug("All available Dailies already completed.", "portal");
			if ((getPageSetting(portalPrefix + 'daily') && portalUniverse === portalPrefix.charAt(1) && challenge === autoTrimpSettings[universeOppPrefix + 'dHeliumHourChallenge'].selected) ||
				(getPageSetting(portalOppPrefix + 'daily') && portalUniverse === portalOppPrefix.charAt(1))) {
				swapPortalUniverse();
			}
			if (squared) toggleChallengeSquared();
			selectChallenge(challenge || 0);
		}
		//Portaling into a filler to use up scruffy3
		else if (game.global.challengeActive === 'Daily' && portalUniverse === 2 && getPageSetting('RFillerRun')) {
			if (autoTrimpSettings.RdHeliumHourChallenge.selected != 'None') {
				selectChallenge(autoTrimpSettings.RdHeliumHourChallenge.selected);
			}
		}
		//Portaling into a daily
		else {
			getDailyChallenge(lastUndone);
			debug("Portaling into Daily for: " + getDailyTimeString(lastUndone, true) + " now!", "portal");
		}
	}
	//Running Fillers
	else if (challenge && !challengeSquaredMode) {
		//Swapping to opposite universe if goal is to run a challenge there
		if (getPageSetting(portalPrefix + 'daily') && portalUniverse === portalPrefix.charAt(1) && challenge === autoTrimpSettings[universeOppPrefix + 'dHeliumHourChallenge'].selected) swapPortalUniverse();
		if (squared) toggleChallengeSquared();
		selectChallenge(challenge);
	}

	//Identifying which challenge type we're running to setup for the preset swapping function
	var preset = challengeSquaredMode ? 3 : game.global.selectedChallenge === 'Daily' ? 2 : 1;
	if (portalUniverse === 2) PresetSwapping(preset);
	//Reset packrat to 3 on Hypothermia
	if (portalUniverse === 2) hypoPackratReset(challenge);
	//Auto Allocate Perks
	allocatePerks();
	if (portalUniverse === 1 && getPageSetting('AutoAllocatePerks') === 1 && (typeof MODULES["perks"] !== 'undefined' || typeof AutoPerks !== 'undefined')) {
		AutoPerks.clickAllocate();
	}
	//Download save file
	downloadSave();

	pushData();
	activatePortal();
	lastHeliumZone = 0;
	zonePostpone = 0;
	resetmapvars();
}

function decaySkipMaps() {
	if (game.global.challengeActive !== "Decay" && !getPageSetting('decay')) {
		return false;
	}
	const stacks = game.challenges.Decay ? game.challenges.Decay.stacks : 0;
	const stacksToPush = getPageSetting('decayStacksToPush');
	return stacksToPush > 0 && stacks > stacksToPush;
}

function decayFinishChallenge() {
	//Pre-Init
	if (game.global.challengeActive !== "Decay" && !getPageSetting('decay')) return;

	//Init
	let stacks = game.challenges.Decay ? game.challenges.Decay.stacks : 0;
	let stacksToAbandon = getPageSetting('decayStacksToAbandon');

	//Finishes the challenge if above max stacks
	if (stacksToAbandon > 0 && stacks > stacksToAbandon) {
		abandonChallenge();
		debug(`Finished Decay challenge because we had more than ${stacksToAbandon} stacks.`, "general", "oil");
	}
}

function challengeInfo() {
	if (!game.global.runningChallengeSquared) return;
	if (challengeCurrentZone === game.stats.zonesCleared.value) return;

	const challengeType = game.global.universe === 2 ? 'C3' : 'C2';
	const finishChallenge = getPageSetting("Finish" + challengeType);
	const downloadSave = game.global.universe === 2 ? getPageSetting('RdownloadSaves') : getPageSetting('downloadSaves');

	if ((finishChallenge - 1) === game.global.world)
		debug("Warning: AT will " + (downloadSave ? 'download your save and ' : '') + "abandon your challenge when starting your next zone. If you want to stop this increase the zone set in 'Finish " + challengeType + "' or set it to -1")
	if (finishChallenge !== -1 && finishChallenge <= game.c2[game.global.challengeActive] && game.global.world < 3) {
		debug("The zone input in the '" + challengeType + " Finish' setting (" + finishChallenge + ") is below or equal to your HZE for this challenge (" + game.c2[game.global.challengeActive] + "). Increase it or it'll end earlier than you\'d probably like it to.");
	}

	//Quest -- Warning message when AutoStructure Smithy purchasing is enabled.
	if (game.global.challengeActive == "Quest" && getPageSetting('rQuest') && getPageSetting('RBuyBuildingsNew')) {
		if (getAutoStructureSetting().enabled && game.global.autoStructureSettingU2.Smithy.enabled) {
			debug("You have the setting for Smithy autopurchase enabled in the AutoStructure settings. This setting has the chance to cause issues later in the run.")
		}
		//Quest -- Warning message when C3 Finish Run setting isn't greater than your quest HZE.
		if (game.global.runningChallengeSquared && (getPageSetting('rQuestSmithyZone') === -1 ? Infinity : getPageSetting('rQuestSmithyZone')) <= game.c2.Quest) {
			debug("The setting 'Q: Smithy Zone' is lower or equal to your current Quest HZE. Increase this or smithies will be bought earlier than they should be.")
		}
	}
	//Downsize -- Warning message when about map settings causing issues later.
	if (game.global.challengeActive == "Downsize") {
		if (game.global.world < 10) {
			debug("Be aware that your usual C3 farming settings will not work properly for this Downsize run and likely cause it to stall out so high chance you will want to amend or disable them.")
		}
	}
	challengeCurrentZone = game.stats.zonesCleared.value;
}

function finishChallengeSquared(ignoreVariables) {
	if (!game.global.runningChallengeSquared) return;
	if (ignoreVariables) ignoreVariables = false;
	if (!ignoreVariables) {
		const challengeType = game.global.universe === 2 ? 'C3' : 'C2';
		var finishChallenge = getPageSetting("Finish" + challengeType);
		if (finishChallenge === -1) return;
		if (game.global.world < finishChallenge) return;
	}

	if (game.options.menu.disablePause.enabled && game.options.menu.pauseGame.enabled === 0) {
		toggleSetting('pauseGame');
	}
	downloadSave();
	//Cancel out of challenge run
	abandonChallenge();
	cancelTooltip();
	if (game.options.menu.pauseGame.enabled === 1) {
		setTimeout(function pause() { toggleSetting('pauseGame') }, 100);
	}
	debug("Finished challenge because we are on zone " + game.global.world, "other", "oil");
	return;
}

function findOutCurrentPortalLevel() {
	var a = -1, b = !1, d = getPageSetting("AutoPortal"); switch (d) { case "Off": break; case "Custom": "Daily" != game.global.challengeActive && (a = getPageSetting("CustomAutoPortal") + 1), "Daily" == game.global.challengeActive && (a = getPageSetting("Dailyportal") + 1), b = !("Lead" != getPageSetting("HeliumHourChallenge")); break; default: var e = { Balance: 41, Decay: 56, Electricity: 82, Crushed: 126, Nom: 146, Toxicity: 166, Lead: 181, Watch: 181, Corrupted: 191 }[d]; e && (a = e); }return { level: a, lead: b }
}

function resetmapvars() {
	//General
	rVanillaMAZ = false;
	currTime = 0;

	//Fragment Farming
	rFragmentFarming = false;
	rFragmentMapID = undefined;
	rInitialFragmentMapID = undefined;
	rFragMapBought = false;
	//Pandemonium
	savefile = null;
	//Prestige
	RAMPfragmappy = undefined;
	RAMPprefragmappy = undefined;
	RAMPpMap = new Array(5);
	RAMPrepMap = new Array(5);
	RAMPmapbought = [[false], [false], [false], [false], [false]];
	RAMPmapbought.fill(false); //Unsure if necessary - Need to test
	RAMPfragmappybought = false;
	RAMPfragfarming = false;
	runningPrestigeMaps = false;

	//Auto Level variables
	mapRepeats = 0;
	rAutoLevel = Infinity;

	//Resetting variables that would cause issues if they were left as is
	MODULES.mapFunctions.rVoidHDRatio = Infinity;
	MODULES.mapFunctions.rVoidVHDRatio = Infinity;
	MODULES.mapFunctions.rVoidHDIndex = Infinity;
	MODULES.mapFunctions.portalZone = Infinity;
	MODULES.mapFunctions.portalZone = Infinity;
	HDRatio = calcHDRatio(game.global.world, 'world');
	mapHDRatio = calcHDRatio(game.global.world, 'map');
	voidHDRatio = calcHDRatio(game.global.world, 'void');

	if (document.getElementById('hiderStatus').style.display == 'None' && getPageSetting('Rshowrnhr') && !game.global.runningChallengeSquared) {
		turnOn("hiderStatus")
		document.getElementById('hiderStatus').parentNode.style = 'display: block; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
	}

}
