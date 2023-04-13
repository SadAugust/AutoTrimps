MODULES["portal"] = {};
MODULES["portal"].timeout = 5000;
MODULES["portal"].bufferExceedFactor = 5;
MODULES["portal"].portalForVoid = false;
MODULES["portal"].portalUniverse = Infinity;
MODULES["portal"].currentChallenge = 'None';
MODULES["portal"].dontPushData = false;
var zonePostpone = 0;

function autoPortal() {
	if (challengeActive('Decay')) decayFinishChallenge();
	if (!game.global.portalActive) return;
	if (challengeActive('Daily') || game.global.runningChallengeSquared) return;
	if (!MODULES.portal.portalForVoid && getPageSetting('autoPortal') === "Off") return;

	var resourceType = game.global.universe === 2 ? 'Radon' : 'Helium'
	var universe = MODULES.portal.portalUniverse !== Infinity ? MODULES.portal.portalUniverse : portalUniverse;

	var portalZone = getPageSetting('autoPortalZone') > 0 ? getPageSetting('autoPortalZone') : 999;
	//Setting portal zone to infinity if autoportal is set to hour to allow liquification portalForVoid & void map portal to work
	if (getPageSetting('autoPortal', currSettingUniverse).includes('Hour')) portalZone = Infinity;
	//Set portal zone to current zone!
	if (MODULES.mapFunctions.portalZone === game.global.world) portalZone = game.global.world;
	if (MODULES.portal.portalForVoid) {
		portalZone = checkLiqZoneCount() >= 99 ? 99 : (checkLiqZoneCount() + 1);
		if (game.permaBoneBonuses.voidMaps.tracker >= (100 - game.permaBoneBonuses.voidMaps.owned)) portalZone = game.global.world;
	}

	switch (getPageSetting('autoPortal', universe)) {
		case "Helium Per Hour":
		case "Radon Per Hour":
			var OKtoPortal = false;
			var minZone = getPageSetting('HeHrDontPortalBefore', universe);
			game.stats.bestHeliumHourThisRun.evaluate();
			var bestHeHr = game.stats.bestHeliumHourThisRun.storedValue;
			var bestHeHrZone = game.stats.bestHeliumHourThisRun.atZone;
			var myHeliumHr = game.stats.heliumHour.value();
			var heliumHrBuffer = Math.abs(getPageSetting('HeliumHrBuffer', universe));
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
				if (getPageSetting('HeliumHrPortal') > 0 && game.global.totalVoidMaps > 0) {
					if (!MODULES.mapFunctions.portalAfterVoids) {
						if (getPageSetting('HeliumHrPortal') === 2 && getZoneEmpowerment(game.global.world) !== 'Poison') debug("Pushing to next Poison zone then portaling after void maps have been run.", "portal");
						else debug("Portaling after void maps have been run.", "portal");
					}
					MODULES.mapFunctions.portalAfterVoids = true;
				}
				if (MODULES.mapFunctions.portalAfterVoids) return;
				zonePostpone += 1;
				debug("My " + resourceType + "Hr was: " + myHeliumHr + " & the Best " + resourceType + "Hr was: " + bestHeHr + " at zone: " + bestHeHrZone, "portal");
				cancelTooltip();
				tooltip('confirm', null, 'update', '<b>Auto Portaling NOW!</b><p>Hit Delay Portal to WAIT 1 more zone.', 'zonePostpone+=1', '<b>NOTICE: Auto-Portaling in 5 seconds....</b>', 'Delay Portal');
				setTimeout(cancelTooltip, MODULES["portal"].timeout);
				setTimeout(function () {
					if (zonePostpone >= 2)
						return;
					if (getPageSetting('heliumHourChallenge', universe) != 'None')
						doPortal(getPageSetting('heliumHourChallenge', universe));
					else
						doPortal();
				}, MODULES["portal"].timeout + 100);
			}
			if (game.global.world >= portalZone) {
				if (getPageSetting('heliumHourChallenge', universe) != 'None')
					doPortal(getPageSetting('heliumHourChallenge', universe));
				else
					doPortal();
			}
			break;
		case "Custom":
			if (game.global.world >= portalZone) {
				if (getPageSetting('heliumHourChallenge', universe) != 'None')
					doPortal(getPageSetting('heliumHourChallenge', universe));
				else
					doPortal();
			}
			break;
		case "Challenge 2":
		case "Challenge 3":
			if (game.global.world >= portalZone) {
				if (getPageSetting('heliumC2Challenge', universe) != 'None')
					doPortal(getPageSetting('heliumC2Challenge', universe), true);
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
		case "Frigid":
		case "Experience":
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
		case "Desolation":
			if ((!game.global.challengeActive && !MODULES.portal.portalForVoid) || (game.global.world >= portalZone && (MODULES.portal.portalForVoid || MODULES.mapFunctions.portalZone !== Infinity)))
				doPortal(getPageSetting('autoPortal', universe));
			break;
		case "Off":
			if (game.global.world >= portalZone && (MODULES.portal.portalForVoid || MODULES.mapFunctions.portalZone !== Infinity))
				doPortal();
			break;
		default:
			break;
	}
}

function dailyAutoPortal() {
	if (!game.global.portalActive) return;
	if (!challengeActive('Daily')) return;
	if (game.global.universe === 1 && game.global.highestLevelCleared < 100) return;
	if (game.global.universe === 2 && game.global.highestRadonLevelCleared < 29) return;
	if (game.global.runningChallengeSquared) return;

	var resourceType = game.global.universe === 2 ? 'Radon' : 'Helium'

	var portalZone = getPageSetting('dailyPortalZone') > 0 ? getPageSetting('dailyPortalZone') : 999;
	//Setting portal zone to infinity if autoportal is set to hour to allow liquification portalForVoid & void map portal to work
	if (getPageSetting('dailyPortal', currSettingUniverse) === 1) portalZone = Infinity;
	//Set portal zone to current zone after void map line if setting enabled!
	if (MODULES.mapFunctions.portalZone === game.global.world) portalZone = game.global.world;

	if (getPageSetting('dailyPortal') == 1) {
		var OKtoPortal = false;
		var minZone = getPageSetting('dailyDontPortalBefore');
		game.stats.bestHeliumHourThisRun.evaluate();
		var bestHeHr = game.stats.bestHeliumHourThisRun.storedValue;
		var bestHeHrZone = game.stats.bestHeliumHourThisRun.atZone;
		var myHeliumHr = game.stats.heliumHour.value();
		var heliumHrBuffer = Math.abs(getPageSetting('dailyHeliumHrBuffer'));
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
				if (getPageSetting('dailyHeliumHrPortal') > 0 && game.global.totalVoidMaps > 0) {
					if (!MODULES.mapFunctions.portalAfterVoids) {
						if (getPageSetting('HeliumHrPortal') === 2 && getZoneEmpowerment(game.global.world) !== 'Poison') debug("Pushing to next Poison zone then portaling after void maps have been run.", "portal");
						else debug("Portaling after void maps have been run.", "portal");
					}
					MODULES.mapFunctions.portalAfterVoids = true;
				}
				if (MODULES.mapFunctions.portalAfterVoids) return;
				zonePostpone += 1;
				debug("My " + resourceType + "Hr was: " + myHeliumHr + " & the Best " + resourceType + "Hr was: " + bestHeHr + " at zone: " + bestHeHrZone, "portal");
				cancelTooltip();
				tooltip('confirm', null, 'update', '<b>Auto Portaling NOW!</b><p>Hit Delay Portal to WAIT 1 more zone.', 'zonePostpone+=1', '<b>NOTICE: Auto-Portaling in 5 seconds....</b>', 'Delay Portal');
				setTimeout(cancelTooltip, MODULES["portal"].timeout);
				setTimeout(function () {
					if (zonePostpone >= 2)
						return;
					if (OKtoPortal) {
						confirmAbandonChallenge();
						abandonChallenge();
						cancelTooltip();
					}
					if (getPageSetting('dailyHeliumHourChallenge') !== 'None')
						doPortal(getPageSetting('dailyHeliumHourChallenge'));
					else
						doPortal();
				}, MODULES["portal"].timeout + 100);
			}
		}
		if (game.global.world >= portalZone) {
			if (getPageSetting('dailyHeliumHourChallenge', universe) != 'None')
				doPortal(getPageSetting('dailyHeliumHourChallenge', universe));
			else
				doPortal();
		}
	}
	if (getPageSetting('dailyPortal') == 2) {
		var portalZone = getPageSetting('dailyPortalZone') > 0 ? getPageSetting('dailyPortalZone') : 999;
		if (MODULES.mapFunctions.portalZone === game.global.world) portalZone = game.global.world;

		if (game.global.world >= portalZone) {
			if (getPageSetting('dailyHeliumHourChallenge') !== 'None')
				doPortal(getPageSetting('dailyHeliumHourChallenge'));
			else
				doPortal();
		}
	}
}

function freeVoidPortal() {
	MODULES.portal.portalForVoid = true;
	if (!getPageSetting('portalVoidIncrement', 1)) MODULES.portal.portalForVoid = false;
	if (game.permaBoneBonuses.voidMaps.owned < 5) MODULES.portal.portalForVoid = false;
	if (game.options.menu.liquification.enabled === 0) MODULES.portal.portalForVoid = false;
	if (game.permaBoneBonuses.voidMaps.tracker >= (100 - game.permaBoneBonuses.voidMaps.owned)) MODULES.portal.portalForVoid = false;
	if (usingRealTimeOffline) MODULES.portal.portalForVoid = false;

	if (MODULES.portal.portalForVoid === false) return;
	if (checkLiqZoneCount() >= 20) {
		debug('Portaling to increment void tracker (' + ((game.permaBoneBonuses.voidMaps.owned === 10 ? Math.floor(game.permaBoneBonuses.voidMaps.tracker / 10) : game.permaBoneBonuses.voidMaps.tracker / 10) + '/10) with liquification.'), "portal");
		if (MODULES.portal.portalUniverse === Infinity) {
			if (portalUniverse !== 1) swapPortalUniverse();
			MODULES.portal.portalUniverse = game.global.universe;
			universeSwapped();
		}
		downloadSave();
		pushData();
		if (!MODULES["portal"].dontPushData) pushSpreadsheetData();
		activatePortal();
		return;
	}
	else return;;
}

function c2runnerportal() {
	if (game.global.universe === 1 && game.global.highestLevelCleared < 63) return;
	if (game.global.universe === 2 && game.global.highestRadonLevelCleared < 48) return;
	if (!getPageSetting('c2RunnerStart')) return;
	if (getPageSetting('c2RunnerPortal') <= 0) return;
	if (!game.global.runningChallengeSquared) return;

	if (game.global.world >= getPageSetting('c2RunnerPortal')) {
		finishChallengeSquared();
		if (getPageSetting('heliumHourChallenge') !== 'None')
			doPortal(getPageSetting('heliumHourChallenge'));
		else
			doPortal();
	}
	return;
}

function c2runner() {
	if (!game.global.portalActive) return;
	if ((portalUniverse === 1 && game.global.highestLevelCleared < 63) || (portalUniverse === 2 && game.global.highestRadonLevelCleared < 48)) return;
	if (!getPageSetting('c2RunnerStart', portalUniverse)) return;
	if (getPageSetting('c2RunnerPortal', portalUniverse) <= 0 || getPageSetting('c2RunnerPercent', portalUniverse) <= 0) return;

	const challengeArray = [];
	const universePrefix = game.global.universe === 2 ? 'C3 ' : 'C2 ';

	//Adding U1 challenges
	if (portalUniverse === 1) {
		var highestZone = game.global.highestLevelCleared + 1;

		//Adding Fused challenges to array if setting is toggled
		if (getPageSetting('c2Fused', portalUniverse)) {
			if (highestZone >= 45) challengeArray.push('Enlightened');
			if (highestZone >= 180) challengeArray.push('Waze');
			if (highestZone >= 180) challengeArray.push('Toxad');
			if (highestZone >= 130) challengeArray.push('Paralysis');
			if (highestZone >= 145) challengeArray.push('Nometal');
			if (highestZone >= 150) challengeArray.push('Topology');
		}

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
	if (portalUniverse === 2) {
		var highestZone = game.global.highestRadonLevelCleared + 1;
		if (highestZone >= 50) challengeArray.push('Unlucky');
		if (highestZone >= 50) challengeArray.push('Unbalance');
		if (highestZone >= 85) challengeArray.push('Quest');
		if (highestZone >= 105) challengeArray.push('Storm');
		if (highestZone >= 25) challengeArray.push('Transmute');
		if (highestZone >= 50) challengeArray.push('Duel');
		//if (highestZone >= 50) challengeArray.push('Downsize');
		if (highestZone >= 201) challengeArray.push('Smithless');
	}

	const worldType = portalUniverse === 2 ? 'highestRadonLevelCleared' : 'highestLevelCleared';

	//Checking regular challenges
	for (var x = 0; x < challengeArray.length; x++) {
		var challenge = game.challenges[challengeArray[x]];
		var challengeList;
		var challengeLevel = 0;

		if (challenge.multiChallenge) challengeList = challenge.multiChallenge;
		else challengeList = [challengeArray[x]];
		for (var y = 0; y < challengeList.length; y++) {
			if (challengeLevel > 0) challengeLevel = Math.min(challengeLevel, game.c2[challengeList[y]]);
			else challengeLevel += game.c2[challengeList[y]];
		}

		if ((100 * (challengeLevel / (game.global[worldType] + 1))) < getPageSetting('c2RunnerPercent', portalUniverse)) {
			if (challengeActive(challengeArray[x]))
				continue;
			if (!challengeSquaredMode)
				toggleChallengeSquared();
			selectChallenge(challengeArray[x]);
			debug(universePrefix + "Runner: Starting " + universePrefix + "Challenge " + challengeArray[x]);
			return;
		}
	}
	return;
}

var shouldPortal = false;

function doPortal(challenge, squared) {
	if (!game.global.portalActive) return;
	if (shouldPortal && portalWindowOpen) return;

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

	if (MODULES["portal"].currentChallenge === 'None') MODULES["portal"].currentChallenge = game.global.challengeActive;
	var currChall = MODULES["portal"].currentChallenge;

	if (game.global.challengeActive === 'Daily') {
		confirmAbandonChallenge();
		abandonChallenge();
		cancelTooltip();
		portalClicked();
	}
	//Initialising variables that will be used later.
	freeVoidPortal();
	if (MODULES.portal.portalForVoid) {
		MODULES["portal"].dontPushData = true;
		return;
	}

	while (MODULES.portal.portalUniverse !== Infinity) {
		if (portalUniverse === MODULES.portal.portalUniverse) {
			MODULES.portal.portalUniverse = Infinity;
			break
		}
		swapPortalUniverse();
	}

	if (currChall === 'Daily') {
		//Swapping to other universe if necessary to run daily.
		if (getPageSetting('dailyPortalPreviousUniverse', (currPortalUniverse + 1))) {
			swapPortalUniverse();
			universeSwapped();
			if (getPageSetting('dailyHeliumHourChallenge', portalUniverse) !== 'None') challenge = getPageSetting('dailyHeliumHourChallenge', portalUniverse);
			else challenge = 0;
		}
	}

	const portalOppPrefix = portalUniverse === 2 ? 'u2' : 'u1';
	//Running C∞ runner
	if (((portalUniverse === 1 && game.global.highestLevelCleared > 63) || (portalUniverse === 2 && game.global.highestRadonLevelCleared > 48)) &&
		getPageSetting('c2RunnerStart', portalUniverse) &&
		getPageSetting('c2RunnerPortal', portalUniverse) > 0 &&
		getPageSetting('c2RunnerPercent', portalUniverse) > 0) {
		c2runner();
		if (!challengeSquaredMode) debug("C" + (Number(portalOppPrefix.charAt(1)) + 1) + " Runner: All C" + (Number(portalOppPrefix.charAt(1)) + 1) + "s above Threshold!");
	}

	//Running Dailies
	if ((getPageSetting('dailyPortalStart', portalUniverse) || currChall === 'Daily') && !challengeSquaredMode) {
		selectChallenge('Daily');
		//Checking to see which dailies can be run
		checkCompleteDailies();
		var lastUndone = -7;
		while (++lastUndone <= 0) {
			if (getDailyTimeString(lastUndone) === parseInt(getPageSetting('dailySkip', portalUniverse))) continue;
			var dailyCompleted = (game.global.recentDailies.indexOf(getDailyTimeString(lastUndone)) !== -1);
			if (!dailyCompleted)
				break;
		}

		//Will stop it from autoPortaling into dailies when you have dailyDontCap enabled and don't have 7 dailies stored.
		if (getPageSetting('dailyDontCap', portalUniverse) && game.global.recentDailies.indexOf(getDailyTimeString(-6)) !== -1 && game.global.recentDailies.length !== 0) lastUndone = 1;

		//Portaling into a filler if all dailies have been run
		if (lastUndone === 1) {
			debug("All available Dailies already completed.", "portal");

			if (getPageSetting('dailyHeliumHourChallenge', portalUniverse).includes('Challenge ') && getPageSetting('dailyC2Challenge', portalUniverse) !== 'None') {
				toggleChallengeSquared();
				selectChallenge(getPageSetting('dailyC2Challenge', portalUniverse));
			}
			else {
				selectChallenge(challenge || 0);
			}
		}
		//Portaling into a filler to use up scruffy3
		else if (currChall === 'Daily' && getPageSetting('dailyPortalFiller', portalUniverse)) {
			if (getPageSetting('dailyHeliumHourChallenge', portalUniverse) != 'None') {
				if (getPageSetting('dailyHeliumHourChallenge', portalUniverse).includes('Challenge ')) {
					toggleChallengeSquared();
					selectChallenge(getPageSetting('dailyC2Challenge', portalUniverse));
				}
				else {
					challenge = getPageSetting('dailyHeliumHourChallenge', portalUniverse);
					selectChallenge(challenge || 0);
				}
			}
		}
		//Portaling into a daily
		else {
			if (getPageSetting('dailyPortalPreviousUniverse', portalUniverse)) {
				swapPortalUniverse();
				universeSwapped();
				selectChallenge('Daily');
				checkCompleteDailies();
			}
			getDailyChallenge(lastUndone);
			challenge = 'Daily';
			debug("Portaling into Daily for: " + getDailyTimeString(lastUndone, true) + " now!", "portal");
		}
	}
	//Selecting challenge that AT has chosen to run.
	else if (challenge && !challengeSquaredMode) {
		//Swapping to opposite universe if goal is to run a challenge there
		if (squared || challenge.includes('Challenge ')) toggleChallengeSquared();

		if (currChall === 'Daily' && challengeSquaredMode && getPageSetting('dailyC2Challenge', portalUniverse) !== 'None')
			challenge = getPageSetting('dailyC2Challenge', portalUniverse);
		selectChallenge(challenge);
	}

	debug('Portaling with void tracker at ' + ((game.permaBoneBonuses.voidMaps.owned === 10 ? Math.floor(game.permaBoneBonuses.voidMaps.tracker / 10) : game.permaBoneBonuses.voidMaps.tracker / 10) + '/10.'), "portal");
	shouldPortal = true;
	universeSwapped();
	//Identifying which challenge type we're running to setup for the preset swapping function
	if (portalUniverse === 2 && getPageSetting('presetSwap', 2)) {
		var preset = challengeSquaredMode || challenge === 'Mayhem' || challenge === 'Pandemonium' || challenge === 'Desolation' ? 'push' : game.global.selectedChallenge === 'Daily' ? 'tufarm' : 'ezfarm';
		fillPreset(preset);
	}

	//Run Perky/Surky.
	if (typeof AutoPerks !== 'undefined' && getPageSetting('autoPerks', portalUniverse)) {
		if (portalUniverse === 1 && ($('#preset').value !== null || $('#preset').value !== 'undefined' ||
			($('#weight-he').value !== 'undefined' && $('#weight-atk').value !== 'undefined' && $('#weight-hp').value !== 'undefined' && $('#weight-xp').value !== 'undefined'))
		) {
			runPerky();
		}
		if (portalUniverse === 2 && ($('#presetElem').value !== null || $('#presetElem').value !== 'undefined' ||
			($('#radonWeight').value !== 'undefined' && $('#clearWeight').value !== 'undefined' && $('#survivalWeight').value !== 'undefined'))) {
			runSurky();
		}
	}

	//Reset packrat to 3 on Hypothermia
	if (portalUniverse === 2) hypoPackratReset(challenge);

	downloadSave();
	pushData();
	if (!MODULES["portal"].dontPushData) pushSpreadsheetData();
	activatePortal();
	MODULES["portal"].currentChallenge = 'None';
	MODULES["portal"].dontPushData = false;
	lastHeliumZone = 0;
	zonePostpone = 0;
	resetmapvars();
	shouldPortal = false;
}

function decaySkipMaps() {
	if (!challengeActive('Decay') && !getPageSetting('decay')) {
		return false;
	}
	const stacks = game.challenges.Decay ? game.challenges.Decay.stacks : 0;
	const stacksToPush = getPageSetting('decayStacksToPush');
	return stacksToPush > 0 && stacks > stacksToPush;
}

function decayFinishChallenge() {
	//Pre-Init
	if (!challengeActive('Decay') && !getPageSetting('decay')) return;

	//Init
	var stacks = game.challenges.Decay ? game.challenges.Decay.stacks : 0;
	var stacksToAbandon = getPageSetting('decayStacksToAbandon');

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
	const finishChallenge = getPageSetting('c2Finish');
	const downloadSave = getPageSetting('downloadSaves')

	if ((finishChallenge - 1) === game.global.world)
		debug("Warning: AT will " + (downloadSave ? 'download your save and ' : '') + "abandon your challenge when starting your next zone. If you want to stop this increase the zone set in 'Finish " + challengeType + "' or set it to -1")
	if (finishChallenge !== -1 && finishChallenge <= game.c2[game.global.challengeActive] && game.global.world < 3) {
		debug("The zone input in the '" + challengeType + " Finish' setting (" + finishChallenge + ") is below or equal to your HZE for this challenge (" + game.c2[game.global.challengeActive] + "). Increase it or it'll end earlier than you\'d probably like it to.");
	}

	//Quest -- Warning message when AutoStructure Smithy purchasing is enabled.
	if (challengeActive('Quest') && getPageSetting('quest') && getPageSetting('buildingsType')) {
		if (getAutoStructureSetting().enabled && game.global.autoStructureSettingU2.Smithy.enabled) {
			debug("You have the setting for Smithy autopurchase enabled in the AutoStructure settings. This setting has the chance to cause issues later in the run.")
		}
		//Quest -- Warning message when C3 Finish Run setting isn't greater than your quest HZE.
		if (game.global.runningChallengeSquared && (getPageSetting('questSmithyZone') === -1 ? Infinity : getPageSetting('questSmithyZone')) <= game.c2.Quest) {
			debug("The setting 'Q: Smithy Zone' is lower or equal to your current Quest HZE. Increase this or smithies will be bought earlier than they should be.")
		}
	}
	//Downsize -- Warning message when about map settings causing issues later.
	if (challengeActive('Downsize')) {
		if (game.global.world < 10) {
			debug("Be aware that your usual C3 farming settings will not work properly for this Downsize run and likely cause it to stall out so high chance you will want to amend or disable them.")
		}
	}
	challengeCurrentZone = game.stats.zonesCleared.value;
}

function finishChallengeSquared() {

	if (!game.global.runningChallengeSquared) return;
	var finishChallenge = getPageSetting('c2Finish');

	if (getPageSetting('c2RunnerStart') && (getPageSetting('c2RunnerPortal') < finishChallenge))
		finishChallenge = getPageSetting('c2RunnerPortal');
	if (finishChallenge === -1 || game.global.world === 1) return;
	if (game.global.world < finishChallenge) return;

	downloadSave();
	//Cancel out of challenge run
	abandonChallenge();
	cancelTooltip();
	debug("Finished challenge because we are on zone " + game.global.world, "other", "oil");
	return;
}

function findOutCurrentPortalLevel() {
	var a = -1, b = !1, d = getPageSetting("autoPortal"); switch (d) { case "Off": break; case "Custom": !challengeActive('Daily') && (a = getPageSetting("autoPortalZone") + 1), challengeActive('Daily') && (a = getPageSetting("Dailyportal") + 1), b = !("Lead" != getPageSetting("heliumHourChallenge")); break; default: var e = { Balance: 41, Decay: 56, Electricity: 82, Crushed: 126, Nom: 146, Toxicity: 166, Lead: 181, Watch: 181, Corrupted: 191 }[d]; e && (a = e); }return { level: a, lead: b }
}

function resetmapvars() {
	//General
	vanillaMAZ = false;
	mappingTime = 0;

	//Fragment Farming	
	rInitialFragmentMapID = undefined;
	//Pandemonium
	savefile = null;
	//Prestige
	MODULES.mapFunctions.prestigeMapArray = new Array(5);
	MODULES.mapFunctions.prestigeFragMapBought = false;
	MODULES.mapFunctions.prestigeRunningMaps = false;
	MODULES.mapFunctions.prestigeRaidZone = 0;
	MODULES.mapFunctions.desolationContinueRunning = false;

	//Auto Level variables
	mapRepeats = 0;
	mapSettings.levelCheck = Infinity;

	//Resetting variables that would cause issues if they were left as is
	MODULES.mapFunctions.voidHDRatio = Infinity;
	MODULES.mapFunctions.voidVHDRatio = Infinity;
	MODULES.mapFunctions.voidHDIndex = Infinity;
	MODULES.mapFunctions.boneCharge = false;
	MODULES.mapFunctions.portalZone = Infinity;

	hdStats = new HDStats();
	mapSettings = FarmingDecision(hdStats);
}

function presetSwapping(preset) {
	if (!getPageSetting('presetSwap')) return

	var preset = !preset ? null :
		(preset != 1 && preset != 2 && preset != 3) ? null :
			preset;

	if (preset == null) {
		debug("Invalid input. Needs to be a value between 1 and 3.");
		return;
	}

	presetTab(preset);
	loadPerkPreset();
}

function downloadSave() {
	if (!getPageSetting('downloadSaves')) return
	if (game.global.runningChallengeSquared) {
		if (game.options.menu.disablePause.enabled && game.options.menu.pauseGame.enabled === 0) {
			toggleSetting('pauseGame');
			setTimeout(function pause() {
				if (game.options.menu.pauseGame.enabled === 1) toggleSetting('pauseGame')
			}, 100);
		}
	}
	tooltip('Export', null, 'update');
	document.getElementById("downloadLink").click();
	cancelTooltip();
}

function hypoPackratReset(challenge) {

	if (challenge === 'Hypothermia' && getPageSetting('hypothermiaDefaultSettings', portalUniverse).packrat) {
		toggleRemovePerks();
		numTab(6, true);
		buyPortalUpgrade('Packrat');
		toggleRemovePerks();
		tooltip('Custom', null, 'update', true);
		document.getElementById('customNumberBox').value = 3;
		numTab(5, true)
		buyPortalUpgrade('Packrat');
	}
}