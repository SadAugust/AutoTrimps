MODULES["portal"] = {};
MODULES["portal"].timeout = 5000;
MODULES["portal"].bufferExceedFactor = 5;
MODULES["portal"].portalForVoid = false;
MODULES["portal"].portalUniverse = Infinity;
MODULES["portal"].currentChallenge = 'None';
MODULES["portal"].dontPushData = false;
MODULES["portal"].dailyMods = '';
MODULES["portal"].dailyPercent = 0;

var zonePostpone = 0;

function autoPortal(skipDaily) {
	if (challengeActive('Decay')) decayFinishChallenge();
	if (!game.global.portalActive) return;
	if (challengeActive('Daily') || game.global.runningChallengeSquared) return;
	if (!MODULES.portal.portalForVoid && getPageSetting('autoPortal') === "Off") return;

	var resourceType = game.global.universe === 2 ? 'Radon' : 'Helium'
	var universe = MODULES.portal.portalUniverse !== Infinity ? MODULES.portal.portalUniverse : portalUniverse;
	var challenge = 'None';

	var portalZone = getPageSetting('autoPortalZone') > 0 ? getPageSetting('autoPortalZone') : 999;
	//Setting portal zone to infinity if autoportal is set to hour to allow liquification portalForVoid & void map portal to work
	if (getPageSetting('autoPortal', currSettingUniverse).includes('Hour')) portalZone = Infinity;
	//Set portal zone to current zone!
	skipDaily = !skipDaily ? false : skipDaily;
	if (skipDaily) portalZone = game.global.world;
	if (MODULES.mapFunctions.portalZone === game.global.world && game.global.totalVoidMaps === 0) portalZone = game.global.world;
	if (MODULES.portal.portalForVoid) {
		portalZone = checkLiqZoneCount() >= 99 ? 99 : (checkLiqZoneCount() + 1);
		if (game.permaBoneBonuses.voidMaps.tracker >= (100 - game.permaBoneBonuses.voidMaps.owned)) portalZone = game.global.world;
	}

	switch (getPageSetting('autoPortal', universe)) {
		case "Helium Per Hour":
		case "Radon Per Hour":
			var OKtoPortal = false;
			var minZone = getPageSetting('heHrDontPortalBefore', universe);
			game.stats.bestHeliumHourThisRun.evaluate();
			var bestHeHr = game.stats.bestHeliumHourThisRun.storedValue;
			var bestHeHrZone = game.stats.bestHeliumHourThisRun.atZone;
			var myHeliumHr = game.stats.heliumHour.value();
			var heliumHrBuffer = Math.abs(getPageSetting('heliumHrBuffer', universe));
			if (!aWholeNewWorld)
				heliumHrBuffer *= MODULES["portal"].bufferExceedFactor;
			var bufferExceeded = myHeliumHr < bestHeHr * (1 - (heliumHrBuffer / 100));
			if (bufferExceeded && game.global.world >= minZone) {
				OKtoPortal = true;
				if (aWholeNewWorld)
					zonePostpone = 0;
			}
			if (heliumHrBuffer === 0 && !aWholeNewWorld)
				OKtoPortal = false;
			if (OKtoPortal && zonePostpone === 0) {
				if (getPageSetting('heliumHrPortal', universe) > 0 && game.global.totalVoidMaps > 0) {
					if (!MODULES.mapFunctions.portalAfterVoids) {
						if (getPageSetting('heliumHrPortal', universe) === 2 && getZoneEmpowerment(game.global.world) !== 'Poison') debug("Z" + game.global.world + " - Pushing to next Poison zone then portaling after void maps have been run.", "portal");
						else debug("Z" + game.global.world + " - Portaling after void maps have been run.", "portal");
					}
					MODULES.mapFunctions.portalAfterVoids = true;
				}
				if (MODULES.mapFunctions.portalAfterVoids) {
					if (game.global.spireActive && getPageSetting('heliumHrExitSpire')) {
						debug("Exiting Spire to run voids faster.", "portal");
						endSpire();
					}
					return;
				}

				debug("My " + resourceType + "Hr was: " + myHeliumHr + " & the Best " + resourceType + "Hr was: " + bestHeHr + " at zone: " + bestHeHrZone, "portal");
				cancelTooltip();

				//Add time warp check to ensure we don't have a 5 second wait during time warp
				if (usingRealTimeOffline) {
					if (getPageSetting('heliumHourChallenge', universe) !== 'None')
						challenge = getPageSetting('heliumHourChallenge', universe);
					else
						challenge = 0;

					doPortal(challenge, skipDaily);
					return;
				}
				else {
					zonePostpone += 1;
					popupsAT.portal = true;
					if (popupsAT.remainingTime === Infinity) popupsAT.remainingTime = 5000;
					tooltip('confirm', null, 'update', '<b>Auto Portaling NOW!</b><p>Hit Delay Portal to WAIT 1 more zone.', 'zonePostpone+=1;; popupsAT.portal = false', '<b>NOTICE: Auto-Portaling in ' + popupsAT.remainingTime + ' seconds....</b>', 'Delay Portal');
					setTimeout(function () {
						cancelTooltip()
						popupsAT.portal = false;
						popupsAT.remainingTime = Infinity;
					}, MODULES["portal"].timeout);
					setTimeout(function () {
						if (zonePostpone >= 2)
							return;
						if (getPageSetting('heliumHourChallenge', universe) !== 'None')
							challenge = getPageSetting('heliumHourChallenge', universe);
						else
							challenge = 0;

						doPortal(challenge, skipDaily);
						return;
					}, MODULES["portal"].timeout + 100);
				}
			}
			if (game.global.world >= portalZone) {
				if (getPageSetting('heliumHourChallenge', universe) !== 'None')
					challenge = getPageSetting('heliumHourChallenge', universe);
				else
					challenge = 0;
			}
			break;
		case "Custom":
			if (game.global.world >= portalZone) {
				if (getPageSetting('heliumHourChallenge', universe) !== 'None')
					challenge = getPageSetting('heliumHourChallenge', universe);
				else
					challenge = 0;
			}
			break;
		case "Challenge 2":
		case "Challenge 3":
			if (game.global.world >= portalZone) {
				challenge = getPageSetting('autoPortal', universe);
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
			if ((!game.global.challengeActive && !MODULES.portal.portalForVoid) || (game.global.world >= portalZone && ((MODULES.portal.portalForVoid || MODULES.mapFunctions.portalZone !== Infinity) && game.global.totalVoidMaps === 0)))
				challenge = getPageSetting('autoPortal', universe);
			break;
		case "Off":
			if (game.global.world >= portalZone && ((MODULES.portal.portalForVoid || MODULES.mapFunctions.portalZone !== Infinity) && game.global.totalVoidMaps === 0))
				challenge = 0;
			break;
		default:
			break;
	}

	if (challenge !== 'None')
		doPortal(challenge, skipDaily);
}

function dailyAutoPortal() {
	if (!game.global.portalActive) return;
	if (!challengeActive('Daily')) return;
	if (game.global.universe === 1 && game.stats.highestLevel.valueTotal() < 100) return;
	if (game.global.universe === 2 && game.stats.highestRadLevel.valueTotal() < 30) return;
	if (game.global.runningChallengeSquared) return;

	var resourceType = game.global.universe === 2 ? 'Radon' : 'Helium'

	var portalZone = getPageSetting('dailyPortalZone') > 0 ? getPageSetting('dailyPortalZone') : 999;
	//Setting portal zone to infinity if autoportal is set to hour to allow liquification portalForVoid & void map portal to work
	if (getPageSetting('dailyPortal', currSettingUniverse) === 1) portalZone = Infinity;
	//Set portal zone to current zone after void map line if setting enabled!
	if (MODULES.mapFunctions.portalZone === game.global.world && game.global.totalVoidMaps === 0) portalZone = game.global.world;

	if (getPageSetting('dailyPortal') === 1) {
		var OKtoPortal = false;
		var minZone = getPageSetting('dailyDontPortalBefore');
		game.stats.bestHeliumHourThisRun.evaluate();
		var bestHeHr = game.stats.bestHeliumHourThisRun.storedValue;
		var bestHeHrZone = game.stats.bestHeliumHourThisRun.atZone;
		var myHeliumHr = game.stats.heliumHour.value();
		var heliumHrBuffer = Math.abs(getPageSetting('dailyHeliumHrBuffer'));
		if (!aWholeNewWorld)
			heliumHrBuffer *= MODULES["portal"].bufferExceedFactor;

		var bufferExceeded = myHeliumHr < bestHeHr * (1 - (heliumHrBuffer / 100));
		if (bufferExceeded && game.global.world >= minZone) {
			OKtoPortal = true;
			if (aWholeNewWorld)
				zonePostpone = 0;
		}
		if (heliumHrBuffer === 0 && !aWholeNewWorld)
			OKtoPortal = false;
		if (OKtoPortal && zonePostpone === 0) {
			if (getPageSetting('dailyHeliumHrPortal') > 0 && game.global.totalVoidMaps > 0) {
				if (!MODULES.mapFunctions.portalAfterVoids) {
					if (getPageSetting('heliumHrPortal') === 2 && getZoneEmpowerment(game.global.world) !== 'Poison') debug("Z" + game.global.world + " - Pushing to next Poison zone then portaling after void maps have been run.", "portal");
					else debug("Z" + game.global.world + " - Portaling after void maps have been run.", "portal");
				}
				MODULES.mapFunctions.portalAfterVoids = true;
			}
			if (MODULES.mapFunctions.portalAfterVoids) {
				if (game.global.spireActive && getPageSetting('dailyHeliumHrExitSpire')) {
					debug("Exiting Spire to run voids faster.", "portal");
					endSpire();
				}
				return;
			}

			debug("My " + resourceType + "Hr was: " + myHeliumHr + " & the Best " + resourceType + "Hr was: " + bestHeHr + " at zone: " + bestHeHrZone, "portal");
			cancelTooltip();

			//Add time warp check to ensure we don't have a 5 second wait during time warp
			if (usingRealTimeOffline) {
				if (OKtoPortal) {
					confirmAbandonChallenge();
					abandonChallenge();
					cancelTooltip();
				}
				if (getPageSetting('dailyHeliumHourChallenge') !== 'None')
					doPortal(getPageSetting('dailyHeliumHourChallenge'));
				else
					doPortal();
				return;
			}
			else {
				zonePostpone += 1;
				popupsAT.portal = true;
				if (popupsAT.remainingTime === Infinity) popupsAT.remainingTime = 5000;
				tooltip('confirm', null, 'update', '<b>Auto Portaling NOW!</b><p>Hit Delay Portal to WAIT 1 more zone.', 'zonePostpone+=1; popupsAT.portal = false', '<b>NOTICE: Auto-Portaling in ' + popupsAT.remainingTime + ' seconds....</b>', 'Delay Portal');
				setTimeout(function () {
					cancelTooltip()
					popupsAT.portal = false;
					popupsAT.remainingTime = Infinity;
				}, MODULES["portal"].timeout);
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
			if (getPageSetting('dailyHeliumHourChallenge', currPortalUniverse) !== 'None')
				doPortal(getPageSetting('dailyHeliumHourChallenge', currPortalUniverse));
			else
				doPortal();
		}
	}
	if (getPageSetting('dailyPortal') === 2) {
		var portalZone = getPageSetting('dailyPortalZone') > 0 ? getPageSetting('dailyPortalZone') : 999;
		if (MODULES.mapFunctions.portalZone === game.global.world && game.global.totalVoidMaps === 0) portalZone = game.global.world;

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
	if (game.permaBoneBonuses.voidMaps.tracker >= (100 - game.permaBoneBonuses.voidMaps.owned) && game.global.canRespecPerks) MODULES.portal.portalForVoid = false;
	if (usingRealTimeOffline) MODULES.portal.portalForVoid = false;

	if (MODULES.portal.portalForVoid === false) return;
	if (checkLiqZoneCount() >= 20) {
		debug('Portaling to increment void tracker (' + ((game.permaBoneBonuses.voidMaps.owned === 10 ? Math.floor(game.permaBoneBonuses.voidMaps.tracker / 10) : game.permaBoneBonuses.voidMaps.tracker / 10) + '/10) with liquification.'), "portal");
		if (!game.global.canRespecPerks) debug('Portaling to refresh respec.', "portal");
		if (MODULES.portal.portalUniverse === Infinity || (game.global.universe !== 1 && game.global.universe === MODULES.portal.portalUniverse)) {
			if (portalUniverse !== 1) {
				MODULES.portal.portalUniverse = game.global.universe;
				swapPortalUniverse();
			}
			universeSwapped();
		}
		downloadSave();
		pushData();
		if (!MODULES["portal"].dontPushData) pushSpreadsheetData();
		activatePortal();
		return;
	}
	else
		return;
}

function c2runnerportal() {
	if (!game.global.runningChallengeSquared) return;
	if (!getPageSetting('c2RunnerStart')) return;
	var portalZone = getPageSetting('c2RunnerPortal', portalUniverse);
	if (getPageSetting('c2RunnerMode') === 1) {
		if (typeof getPageSetting('c2RunnerSettings')[game.global.challengeActive] !== 'undefined') {
			if (!getPageSetting('c2RunnerSettings')[game.global.challengeActive].enabled) return;
			portalZone = getPageSetting('c2RunnerSettings')[game.global.challengeActive].zone;
		} else
			return;
	}

	if (portalZone <= 0) portalZone = Infinity;

	if (game.global.world >= portalZone) {
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
	if ((portalUniverse === 1 && game.stats.highestLevel.valueTotal() < 65) || (portalUniverse === 2 && game.stats.highestRadLevel.valueTotal() < 50)) return;
	if (!getPageSetting('c2RunnerStart', portalUniverse)) return;
	if (getPageSetting('c2RunnerMode', portalUniverse) === 0 && getPageSetting('c2RunnerPortal', portalUniverse) <= 0 || getPageSetting('c2RunnerPercent', portalUniverse) <= 0) return;

	const challengeArray = [];
	const universePrefix = game.global.universe === 2 ? 'C3 ' : 'C2 ';
	const worldType = portalUniverse === 2 ? 'highestRadonLevelCleared' : 'highestLevelCleared';
	const runType = getPageSetting('c2RunnerMode', portalUniverse);
	const c2Setting = getPageSetting('c2RunnerSettings', portalUniverse);
	if (runType === 0) {
		//Building challenge array with percent value challenges
		if (portalUniverse === 1) {
			var highestZone = game.stats.highestLevel.valueTotal();

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
			var highestZone = game.stats.highestRadLevel.valueTotal();
			if (highestZone >= 50) challengeArray.push('Unlucky');
			if (highestZone >= 50) challengeArray.push('Unbalance');
			if (highestZone >= 85) challengeArray.push('Quest');
			if (highestZone >= 105) challengeArray.push('Storm');
			if (highestZone >= 25) challengeArray.push('Transmute');
			if (highestZone >= 50) challengeArray.push('Duel');
			//if (highestZone >= 50) challengeArray.push('Downsize');
			if (highestZone >= 201) challengeArray.push('Smithless');
		}

	} else if (runType === 1) {
		//Building challenge array with set value challenges
		for (var x in c2Setting) {
			if (typeof c2Setting[x] === 'undefined') continue;
			if (!c2Setting[x].enabled) continue;
			if (c2Setting[x].zone <= 0) continue;
			challengeArray.push(x);
		}
	}

	//Looping through challenge array to figure out if things should be run.
	for (var x = 0; x < challengeArray.length; x++) {

		var challenge = game.challenges[challengeArray[x]];
		var challengeList;
		var challengeLevel = 0;
		var check = false;

		if (challenge.multiChallenge) challengeList = challenge.multiChallenge;
		else challengeList = [challengeArray[x]];
		for (var y = 0; y < challengeList.length; y++) {
			if (challengeLevel > 0) challengeLevel = Math.min(challengeLevel, game.c2[challengeList[y]]);
			else challengeLevel += game.c2[challengeList[y]];
		}
		if (runType === 0) check = (100 * (challengeLevel / (game.global[worldType] + 1))) < getPageSetting('c2RunnerPercent', portalUniverse);
		else check = challengeLevel < c2Setting[challengeArray[x]].zone;

		if (check) {
			if (challengeActive(challengeArray[x]))
				continue;
			if (!challengeSquaredMode)
				toggleChallengeSquared();
			selectChallenge(challengeArray[x]);
			debug(universePrefix + "Runner: Starting " + universePrefix + "Challenge " + challengeArray[x], "portal");
			return;
		}
	}
	return;
}

function doPortal(challenge, skipDaily) {
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

	if (MODULES.portal.currentChallenge === 'None') MODULES.portal.currentChallenge = game.global.challengeActive;
	var currChall = MODULES.portal.currentChallenge;

	MODULES.mapFunctions.portalZone = Infinity;

	if (challengeActive('Daily')) {
		if (typeof greenworks === 'undefined' || (typeof greenworks !== 'undefined' && process.version > 'v10.10.0')) {
			MODULES.portal.dailyMods = dailyModifiersOutput().replaceAll('<br>', '|').slice(0, -1);
			MODULES.portal.dailyPercent = Number(prettify(getDailyHeliumValue(countDailyWeight(game.global.dailyChallenge))));
		}
		confirmAbandonChallenge();
		abandonChallenge();
		cancelTooltip();
		portalClicked();
	}
	//Initialising variables that will be used later.
	freeVoidPortal();
	if (MODULES.portal.portalForVoid) {
		MODULES.portal.dontPushData = true;
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
	c2runner();
	if (!challengeSquaredMode) debug("C" + (Number(portalOppPrefix.charAt(1)) + 1) + " Runner: All C" + (Number(portalOppPrefix.charAt(1)) + 1) + "s above Threshold!", "portal");

	//Running Dailies
	if (!skipDaily && (currChall === 'Daily' || getPageSetting('dailyPortalStart', portalUniverse)) && !challengeSquaredMode) {
		selectChallenge('Daily');
		//Checking to see which dailies can be run
		checkCompleteDailies();
		var lastUndone = -7;
		dailiesToSkip = getPageSetting('dailySkip', portalUniverse).map(item => item.replace(/-/g, ''));
		while (++lastUndone <= 0) {
			if (dailiesToSkip.includes(getDailyTimeString(lastUndone).toString())) continue;
			var dailyCompleted = (game.global.recentDailies.indexOf(getDailyTimeString(lastUndone)) !== -1);
			if (!dailyCompleted)
				break;
		}

		//Will stop it from autoPortaling into dailies when you have dailyDontCap enabled and don't have 7 dailies stored.
		if (getPageSetting('dailyDontCap', portalUniverse) && game.global.recentDailies.indexOf(getDailyTimeString(-6)) !== -1 && game.global.recentDailies.length !== 0) lastUndone = 1;
		if (!getPageSetting('dailyPortalStart', portalUniverse)) lastUndone = 1;

		//Printing msg to state all dailies have been compelted
		if (lastUndone === 1) debug("All dailies have been completed.", "portal");

		//Portaling into a filler/c2/c3 if dailyPortalFiller is enabled OR all dailies completed or dailyPortalStart is disabled.
		if (currChall === 'Daily' && (!getPageSetting('dailyPortalStart', portalUniverse) || getPageSetting('dailyPortalFiller', portalUniverse) || lastUndone === 1)) {
			challenge = getPageSetting('dailyHeliumHourChallenge', portalUniverse);
			//Portaling into a C2/C3 if necessary.
			if (getPageSetting('dailyHeliumHourChallenge', portalUniverse).includes('Challenge ')) {
				toggleChallengeSquared();
				challenge = getPageSetting('dailyC2Challenge', portalUniverse) === 'None' ? 0 : getPageSetting('dailyC2Challenge', portalUniverse);
				//Disable challengeSquaredMode if dailyC2Challenge is set to 'None' or a special challenge.
				if (challengeSquaredMode && (challenge === 0 || !game.challenges[challenge].allowSquared)) toggleChallengeSquared();

				selectChallenge(getPageSetting('dailyC2Challenge', portalUniverse) === 'None' ? 0 : getPageSetting('dailyC2Challenge', portalUniverse));
			}
			else {
				selectChallenge(challenge === 'None' ? 0 : challenge);
			}
		}
		else if (lastUndone === 1) {
			MODULES.portal.currentChallenge = 'None';
			MODULES.portal.portalUniverse = portalUniverse;
			autoPortal(true);
			return;
		}
		//Portaling into a daily
		else {
			if (portalUniverse > 1 && getPageSetting('dailyPortalPreviousUniverse', portalUniverse)) {
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
		if (challenge.includes('Challenge ')) {
			challenge = getPageSetting('heliumC2Challenge', portalUniverse) === 'None' ? 0 : getPageSetting('heliumC2Challenge', portalUniverse);
			if ((challenge !== 0 && game.challenges[challenge].allowSquared)) toggleChallengeSquared();
		}
		selectChallenge(challenge);
	}
	debug('Portaling with void tracker at ' + ((game.permaBoneBonuses.voidMaps.owned === 10 ? Math.floor(game.permaBoneBonuses.voidMaps.tracker / 10) : game.permaBoneBonuses.voidMaps.tracker / 10) + '/10.'), "portal");
	universeSwapped();
	var preset;
	//Identifying which challenge type we're running to setup for the preset swapping function
	if (portalUniverse === 2 && getPageSetting('presetSwap', 2)) {
		if (game.global.selectedChallenge === 'Mayhem' || game.global.selectedChallenge === 'Pandemonium' || game.global.selectedChallenge === 'Desolation') preset = 'push';
		else if (game.global.selectedChallenge === 'Downsize') preset = 'downsize';
		//else if (game.global.selectedChallenge === 'Trappapalooza') preset = 'trappacarp';
		else if (game.global.selectedChallenge === 'Duel') preset = 'duel';
		else if (game.global.selectedChallenge === 'Berserk') preset = 'berserk';
		else if (game.global.selectedChallenge === 'Alchemy') preset = 'alchemy';
		else if (game.global.selectedChallenge === 'Smithless') preset = 'smithless';
		else if (challengeSquaredMode) preset = 'push';
		else if (game.global.selectedChallenge === 'Daily') preset = 'tufarm';
		else preset = 'ezfarm';
		fillPreset(preset);
	}

	//Run Perky/Surky.
	if (typeof AutoPerks !== 'undefined' && getPageSetting('autoPerks', portalUniverse)) {
		if (portalUniverse === 1 && ($('#preset').value !== null || $('#preset').value !== undefined ||
			($('#weight-he').value !== undefined && $('#weight-atk').value !== undefined && $('#weight-hp').value !== undefined && $('#weight-xp').value !== undefined))
		) {
			runPerky();
		}
		if (portalUniverse === 2 && ($('#presetElem').value !== null || $('#presetElem').value !== undefined ||
			($('#radonWeight').value !== undefined && $('#clearWeight').value !== undefined && $('#survivalWeight').value !== undefined))) {
			runSurky();
		}
	}

	preset = 0;

	//Reset packrat to 3 on Hypothermia - Setup mutator respec
	if (portalUniverse === 2) {
		hypoPackratReset(challenge);
		preset = challengeSquaredMode || challenge === 'Mayhem' || challenge === 'Pandemonium' || challenge === 'Desolation' ? 3 : game.global.selectedChallenge === 'Daily' ? 2 : 1;
		if (getPageSetting('presetSwapMutators', 2) && JSON.parse(localStorage.getItem("mutatorPresets"))['preset' + preset] !== '') {
			u2Mutations.toggleRespec();
		}
	}
	//Download save, push graphs data, push to spreadsheet for select users, activate portal, reset vars, and load mutators if necessary.
	downloadSave();
	pushData();
	if (!MODULES["portal"].dontPushData) pushSpreadsheetData();
	activatePortal();
	MODULES["portal"].currentChallenge = 'None';
	MODULES["portal"].dontPushData = false;
	MODULES["portal"].dailyMods = '';
	MODULES["portal"].dailyPercent = 0;
	lastHeliumZone = 0;
	zonePostpone = 0;
	resetVarsZone();
	if (u2Mutations.open && getPageSetting('presetSwapMutators', 2)) {
		loadMutations(preset);
		u2Mutations.closeTree();
	}
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
	if (usingRealTimeOffline) return;
	if (!game.global.runningChallengeSquared) return;
	if (challengeCurrentZone === game.stats.zonesCleared.value) return;

	const challengeType = game.global.universe === 2 ? 'C3' : 'C2';
	const finishChallenge = getPageSetting('c2Finish');
	const downloadSave = getPageSetting('downloadSaves');

	if ((finishChallenge - 1) === game.global.world)
		debug("Warning: AT will " + (downloadSave ? 'download your save and ' : '') + "abandon your challenge when starting your next zone. If you want to stop this increase the zone set in 'Finish " + challengeType + "' or set it to -1", "challenge");
	if (finishChallenge !== -1 && finishChallenge <= game.c2[game.global.challengeActive] && game.global.world < 3) {
		debug("The zone input in the '" + challengeType + " Finish' setting (" + finishChallenge + ") is below or equal to your HZE for this challenge (" + game.c2[game.global.challengeActive] + "). Increase it or it'll end earlier than you\'d probably like it to.", "challenge");
	}

	if (challengeActive('Mapology') && !getPageSetting('mapology') && game.global.world % 5 === 0 && game.global.world < (checkLiqZoneCount() + 10)) {
		debug("You have the AT setting for Mapology disabled which would be helpful with limiting the amount of map credits spent on mapping & raiding.", "challenge");
	}
	//Quest -- Warning message when AutoStructure Smithy purchasing is enabled.
	if (challengeActive('Quest') && getPageSetting('quest') && getPageSetting('buildingsType')) {
		if (getAutoStructureSetting().enabled && game.global.autoStructureSettingU2.Smithy.enabled) {
			debug("You have the setting for Smithy autopurchase enabled in the AutoStructure settings. This setting has the chance to cause issues later in the run.", "challenge");
		}
		//Quest -- Warning message when C3 Finish Run setting isn't greater than your quest HZE.
		if (game.global.runningChallengeSquared && (getPageSetting('questSmithyZone') === -1 ? Infinity : getPageSetting('questSmithyZone')) <= game.c2.Quest) {
			debug("The setting 'Q: Smithy Zone' is lower or equal to your current Quest HZE. Increase this or smithies will be bought earlier than they should be.", "challenge");
		}
	}
	//Downsize -- Warning message when about map settings causing issues later.
	if (challengeActive('Downsize')) {
		if (game.global.world < 10) {
			debug("Be aware that your usual C3 farming settings will not work properly for this Downsize run and likely cause it to stall out so high chance you will want to amend or disable them.", "challenge");
		}
	}
	challengeCurrentZone = game.stats.zonesCleared.value;
}

function finishChallengeSquared() {

	if (!game.global.runningChallengeSquared) return;
	var finishChallenge = getPageSetting('c2Finish');

	if (getPageSetting('c2RunnerStart') && getPageSetting('c2RunnerMode') === 0 && (getPageSetting('c2RunnerPortal') < finishChallenge))
		finishChallenge = getPageSetting('c2RunnerPortal');
	if (game.global.world === 1) return;
	if (finishChallenge <= 0) finishChallenge = Infinity;
	if (game.global.world < finishChallenge) return;

	downloadSave();
	//Cancel out of challenge run
	abandonChallenge();
	cancelTooltip();
	debug("Finished challenge because we are on zone " + game.global.world, "challenge", "oil");
	return;
}

function findOutCurrentPortalLevel() {
	var a = -1, b = !1, d = getPageSetting("autoPortal"); switch (d) { case "Off": break; case "Custom": !challengeActive('Daily') && (a = getPageSetting("autoPortalZone") + 1), challengeActive('Daily') && (a = getPageSetting("Dailyportal") + 1), b = !("Lead" !== getPageSetting("heliumHourChallenge")); break; default: var e = { Balance: 41, Decay: 56, Electricity: 82, Crushed: 126, Nom: 146, Toxicity: 166, Lead: 181, Watch: 181, Corrupted: 191 }[d]; e && (a = e); }return { level: a, lead: b }
}

function resetVarsZone(loadingSave) {

	//Reloading save variables
	if (loadingSave) {
		var resourceNeeded = {
			food: 0,
			wood: 0,
			metal: 0,
			science: 0,
			gems: 0,
			fragments: 0,
		};

		baseMinDamage = 0;
		baseMaxDamage = 0;
		baseDamage = 0;
		baseHealth = 0;
		baseBlock = 0;

		currentworld = 0;
		lastrunworld = 0;
		aWholeNewWorld = false;
		universeSwapped();

		currentHZE = 0;
		lastHZE = 0;

		heirloomPlagueSwap = false;
		runningAtlantrimp = false;
	}



	//General
	mappingTime = 0;
	var mapFunction = MODULES['mapFunctions'];

	//Fragment Farming	
	initialFragmentMapID = undefined;
	//Prestige
	mapFunction.prestigeMapArray = new Array(5);
	mapFunction.prestigeFragMapBought = false;
	mapFunction.prestigeRunningMaps = false;
	mapFunction.prestigeRaidZone = 0;
	mapFunction.challengeContinueRunning = false;

	//Auto Level variables
	mapRepeats = 0;
	mapSettings.levelCheck = Infinity;

	//Resetting variables that would cause issues if they were left as is
	mapFunction.voidHDRatio = Infinity;
	mapFunction.voidVHDRatio = Infinity;
	mapFunction.voidHDInfo = Infinity;
	mapFunction.voidHDIndex = Infinity;
	mapFunction.voidFarm = false;
	mapFunction.portalZone = Infinity;
	mapFunction.portalAfterVoids = false;
	mapFunction.boneCharge = false;
	mapFunction.voidTrigger = 'None';

	hdStats = new HDStats();
	mapSettings = new farmingDecision();
}

function presetSwapping(preset) {
	if (!getPageSetting('presetSwap')) return;

	var preset = !preset ? null :
		(preset !== 1 && preset !== 2 && preset !== 3) ? null :
			preset;

	if (preset === null) {
		debug("Invalid input. Needs to be a value between 1 and 3.", "challenge");
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

//Auto-Respec into combat spec after running Atlantrimp
function surkyCombatRespec() {

	if (!popupsAT.respecAtlantrimp) return;
	popupsAT.respecAtlantrimp = false;
	popupsAT.remainingTime = Infinity;
	if (!game.global.viewingUpgrades) viewPortalUpgrades();
	var currPreset = $$('#presetElem').value;
	//Temp changing to combat preset if in a C3/special challenge or Radon Combat Respec preset if not. 
	if (hdStats.isC3) fillPreset('combat');
	else fillPreset('combatRadon');
	//Respecing perks
	runSurky();
	//Reverting back to original preset
	fillPreset(currPreset);
	//Fire all workers so that we don't run into issues when finishing the respec
	fireAllWorkers();
	activateClicked();
	debug("Surky - Respeccing into " + (!hdStats.isC3 ? "Radon " : "") + "Combat Respec preset.", "portal")
}

//Force tooltip appearance for Surky combat respec post Atlantrimp
function atlantrimpRespecMessage() {
	if (!game.global.canRespecPerks) return;
	if (game.global.universe !== 2 || portalUniverse !== 2) return;
	if (typeof AutoPerks === 'undefined') return;

	popupsAT.respecAtlantrimp = false;

	var respecSetting = getPageSetting('autoCombatRespec');
	//If setting is enabled, respec into Surky combat respec
	if (respecSetting === 2) {
		popupsAT.respecAtlantrimp = true;
		popupsAT.remainingTime = 5000;
		var description = "<p><b>Respeccing into " + (!hdStats.isC3 ? "Radon " : "") + "Combat Respec preset.</b></p>";
		tooltip('confirm', null, 'update', description + '<p>Hit <b>Disable Respec</b> to stop this.</p>', 'popupsAT.respecAtlantrimp = false, popupsAT.remainingTime = Infinity', '<b>NOTICE: Auto-Respeccing in ' + (popupsAT.remainingTime / 1000).toFixed(1) + ' seconds....</b>', 'Disable Respec');
		setTimeout(surkyCombatRespec, 5000);
	}
	//If setting is disabled, show tooltip to allow for respec after Atlantrimp has been run
	else if (respecSetting === 1) {
		var description = "<p>Click <b>Force Respec</b> to respec into the Surky <b>" + (!hdStats.isC3 ? "Radon " : "") + "Combat Respec</b> preset.</p>";
		tooltip('confirm', null, 'update', description, 'popupsAT.respecAtlantrimp = true; surkyCombatRespec()', '<b>Post Atlantrimp Respec</b>', 'Force Respec');
	}
}

//Override for the Atlantrimp fire function to add Surky respec
function atlantrimpRespecOverride() {
	if ((typeof game.mapUnlocks.AncientTreasure.originalFire !== 'undefined')) return;
	//Add Surky respec to Trimple/Atlantrimp map completion
	game.mapUnlocks.AncientTreasure.originalFire = game.mapUnlocks.AncientTreasure.fire;

	game.mapUnlocks.AncientTreasure.fire = function () {
		game.mapUnlocks.AncientTreasure.originalFire(...arguments)
		try {
			atlantrimpRespecMessage();
		}
		catch (e) { console.log("Loading respec function failed! " + e, "other") }
	}
}

//Runs when AT initially loads
atlantrimpRespecOverride();

// On loading save
var originalLoad = load;
load = function () {
	originalLoad(...arguments)
	try {
		atlantrimpRespecOverride();
		resetVarsZone(true);
	}
	catch (e) { graphsDebug("Gather info failed: " + e) }
}

// On portal/game reset
var originalresetGame = resetGame;
resetGame = function () {
	originalresetGame(...arguments)
	try {
		atlantrimpRespecOverride()
	}
	catch (e) { graphsDebug("Gather info failed: " + e) }
}


