MODULES.portal = {
	timeout: 5000,
	bufferExceedFactor: 5,
	portalForVoid: false,
	portalUniverse: Infinity,
	currentChallenge: 'None',
	dontPushData: false,
	dailyMods: '',
	dailyPercent: 0,
	zonePostpone: 0,
}

function getHeliumPerHour() {
	var timeThisPortal = new Date().getTime() - game.global.portalTime;
	if (timeThisPortal < 1) return 0;
	timeThisPortal /= 3600000;
	var resToUse;
	if (game.global.universe === 2)
		resToUse = game.resources.radon.owned;
	else
		resToUse = game.resources.helium.owned;
	return resToUse / timeThisPortal;
}

//Figures out which type of autoPortal we should be running depending on what kind of challenge we are in.
function autoPortalCheck(specificPortalZone) {
	if (!game.global.portalActive) return;
	if (game.global.runningChallengeSquared) c2runnerportal(specificPortalZone);
	else autoPortal(specificPortalZone);
}

function autoPortal(specificPortalZone, skipDaily) {
	if (challengeActive('Decay')) decayFinishChallenge();
	if (!game.global.portalActive) return;
	if (game.global.runningChallengeSquared) return;
	var universe = MODULES.portal.portalUniverse !== Infinity ? MODULES.portal.portalUniverse : game.global.universe;
	const runningDaily = challengeActive('Daily');
	if (!specificPortalZone && !MODULES.portal.portalForVoid && !runningDaily && getPageSetting('autoPortal', universe) === 'Off') return;
	if (!specificPortalZone && !MODULES.portal.portalForVoid && runningDaily && getPageSetting('dailyPortal', universe) === '0') return;

	//Setting up base portalZone for both regular runs & daily runs if in one
	var portalZone = getPageSetting('autoPortalZone') > 0 ? getPageSetting('autoPortalZone') : Infinity;
	//Setting portal zone to infinity if autoportal is set to hour to allow liquification portalForVoid & void map portal to work
	if (!runningDaily && getPageSetting('autoPortal', universe).includes('Hour')) portalZone = Infinity;

	//Same as above but overriding for dailies
	if (runningDaily) {
		portalZone = getPageSetting('dailyPortalZone') > 0 ? getPageSetting('dailyPortalZone') : 999;
		if (getPageSetting('dailyPortal', universe) === 1) portalZone = Infinity;
	}

	if (specificPortalZone) portalZone = specificPortalZone;
	if (skipDaily) portalZone = game.global.world;

	if (MODULES.portal.portalForVoid) {
		portalZone = checkLiqZoneCount() >= 99 ? 99 : (Math.floor(checkLiqZoneCount()) + 1);
		if (game.permaBoneBonuses.voidMaps.tracker >= (100 - game.permaBoneBonuses.voidMaps.owned)) {
			specificPortalZone = game.global.world;
			portalZone = game.global.world;
		}
		else if (game.global.world < portalZone) {
			return;
		}
	}

	var challenge = 'None';
	var portalType = getPageSetting('autoPortal', universe);
	//He/hr settings. If inside a daily then need to check for '1' as that is the daily setting value for he/hr.
	const heHrSettings = ['Helium Per Hour', 'Radon Per Hour', '1'];
	const challenge2Settings = ['Challenge 2', 'Challenge 3'];

	const challengeSelected = heHrSettings.indexOf(portalType) !== -1 || portalType.includes('Custom') ? getPageSetting('heliumHourChallenge', universe) : portalType.includes('One Off Challenges') ? getPageSetting('heliumOneOffChallenge', universe) : portalType;

	if (runningDaily) portalType = getPageSetting('dailyPortal', universe).toString();
	//Helium or Radon per hour portaling checks
	if (heHrSettings.indexOf(portalType) !== -1) {
		var resourceType = game.global.universe === 2 ? 'Radon' : 'Helium';
		var prefix = runningDaily ? 'dailyHelium' : 'helium';
		var OKtoPortal = false;
		var minZone = getPageSetting((runningDaily ? 'dailyDontPortalBefore' : 'heliumHrDontPortalBefore'), universe);
		game.stats.bestHeliumHourThisRun.evaluate();
		var bestHeHr = game.stats.bestHeliumHourThisRun.storedValue;
		var bestHeHrZone = game.stats.bestHeliumHourThisRun.atZone;
		var myHeliumHr = getHeliumPerHour();
		var heliumHrBuffer = Math.abs(getPageSetting(prefix + 'HrBuffer', universe));
		if (!atSettings.portal.aWholeNewWorld)
			heliumHrBuffer *= MODULES['portal'].bufferExceedFactor;
		var bufferExceeded = myHeliumHr < bestHeHr * (1 - (heliumHrBuffer / 100));
		if (bufferExceeded && game.global.world >= minZone) {
			OKtoPortal = true;
			if (atSettings.portal.aWholeNewWorld)
				MODULES.portal.zonePostpone = 0;
		}
		if (heliumHrBuffer === 0 && !atSettings.portal.aWholeNewWorld)
			OKtoPortal = false;
		if (OKtoPortal && MODULES.portal.zonePostpone === 0) {
			if (getPageSetting(prefix + 'HrPortal', universe) > 0 && game.global.totalVoidMaps > 0) {
				if (!MODULES.mapFunctions.afterVoids) {
					if (getPageSetting(prefix + 'HrPortal', universe) === 2 && getZoneEmpowerment(game.global.world) !== 'Poison') debug("Z" + game.global.world + " - Pushing to next Poison zone then portaling after void maps have been run.", "portal");
					else debug("Z" + game.global.world + " - Portaling after void maps have been run.", "portal");
				}
				MODULES.mapFunctions.afterVoids = true;
			}
			if (MODULES.mapFunctions.afterVoids) {
				if (game.global.spireActive && getPageSetting(prefix + 'HrExitSpire')) {
					debug("Exiting Spire to run voids faster.", "portal");
					endSpire();
				}
				return;
			}

			setTimeout(debug("My " + resourceType + "Hr was: " + myHeliumHr + " & the Best " + resourceType + "Hr was: " + bestHeHr + " at zone: " + bestHeHrZone, "portal"), 1000);
			cancelTooltip();

			//Add time warp check to ensure we don't have a 5 second wait during time warp
			if (usingRealTimeOffline) {
				if (challengeSelected !== 'None')
					challenge = challengeSelected;
				else
					challenge = 0;

				doPortal(challenge, skipDaily);
				return;
			}
			else {
				MODULES.portal.zonePostpone += 1;
				MODULES.popups.portal = true;
				if (MODULES.popups.remainingTime === Infinity) MODULES.popups.remainingTime = 5000;
				tooltip('confirm', null, 'update', '<b>Auto Portaling NOW!</b><p>Hit Delay Portal to WAIT 1 more zone.', 'MODULES.portal.zonePostpone+=1;; MODULES.popups.portal = false', '<b>NOTICE: Auto-Portaling in ' + MODULES.popups.remainingTime + ' seconds....</b>', 'Delay Portal');
				setTimeout(function () {
					cancelTooltip()
					MODULES.popups.portal = false;
					MODULES.popups.remainingTime = Infinity;
				}, MODULES["portal"].timeout);
				setTimeout(function () {
					if (MODULES.portal.zonePostpone >= 2)
						return;
					if (challengeSelected !== 'None')
						challenge = challengeSelected;
					else
						challenge = 0;

					doPortal(challenge, skipDaily);
					return;
				}, MODULES["portal"].timeout + 100);
			}
		}
		if (game.global.world >= portalZone) {
			if (challengeSelected !== 'None')
				challenge = challengeSelected;
			else
				challenge = 0;
		}
	}
	//If dailyPortal is set to 'Off' then we portal into a challenge run
	else if (portalType === '0') {
		if (game.global.world >= portalZone && specificPortalZone) {
			if (challengeSelected !== 'None')
				challenge = challengeSelected;
			else
				challenge = 0;
		}
	}
	//If AutoPortal  is set to 'Off' then we portal into a no challenge run
	else if (portalType === 'Off') {
		if (game.global.world >= portalZone && specificPortalZone)
			challenge = 0;
	}
	//Otherwise we portal into a challenge run
	else if (portalType === 'Custom' || portalType === '2' || portalType === 'One Off Challenges' || challenge2Settings.indexOf(portalType) !== -1) {
		if (game.global.world >= portalZone) {
			if (challengeSelected !== 'None')
				challenge = challengeSelected;
			else
				challenge = 0;
		}
	}
	else {
		if ((!game.global.challengeActive && !MODULES.portal.portalForVoid) || (game.global.world >= portalZone && specificPortalZone)) {
			doPortal(challengeSelected, skipDaily);
		}
	}

	if (challenge === 'Off') challenge = 0;

	if (challenge !== 'None')
		doPortal(challenge, skipDaily);
}

function freeVoidPortal() {
	MODULES.portal.portalForVoid = true;
	if (!getPageSetting('portalVoidIncrement', 1)) MODULES.portal.portalForVoid = false;
	if (game.permaBoneBonuses.voidMaps.owned < 5) MODULES.portal.portalForVoid = false;
	if (game.options.menu.liquification.enabled === 0) MODULES.portal.portalForVoid = false;
	if (game.permaBoneBonuses.voidMaps.tracker >= (100 - game.permaBoneBonuses.voidMaps.owned) && game.global.canRespecPerks) MODULES.portal.portalForVoid = false;

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
		if (typeof pushData === 'function') pushData();
		if (!MODULES["portal"].dontPushData) pushSpreadsheetData();
		activatePortal();
		return;
	}
	else
		return;
}

function c2runnerportal(portalZone) {
	if (!game.global.runningChallengeSquared) return;

	function c2Portal() {
		if (getPageSetting('heliumHourChallenge') !== 'None')
			doPortal(getPageSetting('heliumHourChallenge'));
		else
			doPortal();
	}

	if (portalZone) {
		c2Portal();
		return;
	}

	if (!portalZone)
		portalZone = c2FinishZone();

	if (portalZone <= 0) portalZone = Infinity;

	if (game.global.world >= portalZone) {
		finishChallengeSquared();
		//Only portal automatically if using C2 Runner Pct input.
		if (getPageSetting('c2RunnerStart') && getPageSetting('c2RunnerEndMode') === 1) {
			c2Portal();
		}
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
			if (highestZone >= 50) challengeArray.push('Duel');
			if (highestZone >= 50) challengeArray.push('Downsize');
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
	autoHeirlooms();
	//Open portal window
	portalClicked();
	if (!portalWindowOpen) {
		portalClicked();
	}
	//If for some reason portal window isn't open stop running
	if (!portalWindowOpen) return;

	if (MODULES.portal.currentChallenge === 'None') MODULES.portal.currentChallenge = game.global.challengeActive;
	var currChall = MODULES.portal.currentChallenge;

	//Cancel out of dailies if we're running them
	if (challengeActive('Daily') || game.global.runningChallengeSquared) {
		if (challengeActive('Daily') && (typeof greenworks === 'undefined' || (typeof greenworks !== 'undefined' && process.version > 'v10.10.0'))) {
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
		if (getPageSetting('dailyPortalPreviousUniverse', (portalUniverse + 1))) {
			swapPortalUniverse();
			universeSwapped();
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

		//Will stop it from autoPortaling into dailies when you have dailyDontCap enabled and have the last X dailies available.
		if (getPageSetting('dailyDontCap', portalUniverse)) {
			var dailiesCompleted = 0;

			for (var x = -6; x <= 1 - getPageSetting('dailyDontCapAmt', portalUniverse); x++) {
				if (game.global.recentDailies.indexOf(getDailyTimeString(x)) !== -1) {
					dailiesCompleted++;
				}
			}
			if (dailiesCompleted === (8 - getPageSetting('dailyDontCapAmt', portalUniverse))) lastUndone = 1;
		}
		if (!getPageSetting('dailyPortalStart', portalUniverse)) lastUndone = 1;

		//Printing msg to state all dailies have been compelted
		if (lastUndone === 1) debug("All dailies have been completed.", "portal");

		//Portaling into a filler/c2/c3 if dailyPortalFiller is enabled OR all dailies completed or dailyPortalStart is disabled.
		if (currChall === 'Daily' && (!getPageSetting('dailyPortalStart', portalUniverse) || getPageSetting('dailyPortalFiller', portalUniverse) || lastUndone === 1)) {
			MODULES.portal.currentChallenge = 'None';
			MODULES.portal.portalUniverse = portalUniverse;
			autoPortal(game.global.world, true);
			return;
		}
		else if (lastUndone === 1) {
			MODULES.portal.currentChallenge = 'None';
			MODULES.portal.portalUniverse = portalUniverse;
			autoPortal(game.global.world, true);
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
	if (getPageSetting('presetSwap', portalUniverse)) {
		if (portalUniverse === 1) {
			if (game.global.selectedChallenge === 'Frigid') preset = 'c2';
			else if (game.global.selectedChallenge === 'Scientist') preset = 'scientist';
			else if (game.global.selectedChallenge === 'Coord') preset = 'coord';
			else if (game.global.selectedChallenge === 'Trimp') preset = 'trimp';
			else if (game.global.selectedChallenge === 'Metal' || game.global.selectedChallenge === 'Nometal') preset = 'metal';
			else if (challengeSquaredMode) preset = 'c2';
			else {
				[].slice.apply(document.querySelectorAll('#preset > *')).forEach(function (option) {
					if (parseInt(option.innerHTML.toLowerCase().replace(/[z+]/g, '').split('-')[0]) < game.global.highestLevelCleared)
						preset = option.value;
				});
			}
			fillPresetPerky(preset);
		}

		if (portalUniverse === 2) {
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
			fillPresetSurky(preset);
		}
	}

	//Run Perky/Surky.
	if (typeof MODULES.autoPerks !== 'undefined' && getPageSetting('autoPerks', portalUniverse)) {
		if (portalUniverse === 1 && ($('#preset').value !== null || $('#preset').value !== undefined ||
			($('#weight-he').value !== undefined && $('#weight-atk').value !== undefined && $('#weight-hp').value !== undefined && $('#weight-xp').value !== undefined))
		) {
			allocatePerky();
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
	if (typeof pushData === 'function') pushData();
	if (!MODULES["portal"].dontPushData) pushSpreadsheetData();
	MODULES["portal"].currentChallenge = 'None';
	MODULES["portal"].dontPushData = false;
	MODULES["portal"].dailyMods = '';
	MODULES["portal"].dailyPercent = 0;
	lastHeliumZone = 0;
	MODULES.portal.zonePostpone = 0;

	activatePortal();
	resetVarsZone(true);
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

function challengeInfo(force) {
	if (challengeCurrentZone === game.stats.zonesCleared.value) return;

	const challengeType = game.global.universe === 2 ? 'C3' : 'C2';
	const finishChallenge = c2FinishZone();
	const downloadSave = getPageSetting('downloadSaves');

	if ((finishChallenge - 1) === game.global.world)
		debug("Warning: AT will " + (downloadSave ? 'download your save and ' : '') + "abandon your challenge when starting your next zone. If you want to stop this increase the zone set in 'Finish " + challengeType + "' or set it to -1", "challenge");
	if (finishChallenge <= 0 && finishChallenge <= game.c2[game.global.challengeActive] && game.global.world < 3) {
		debug("The zone input in the '" + challengeType + " Finish' setting (" + finishChallenge + ") is below or equal to your HZE for this challenge (" + game.c2[game.global.challengeActive] + "). Increase it or it'll end earlier than you\'d probably like it to.", "challenge");
	}

	if (force || game.global.world === 1 || (game.global.world % 3 === 0 && game.global.world < (checkLiqZoneCount(game.global.universe) + 10))) {
		if (challengeActive('Metal') || challengeActive('Transmute')) {
			//Warning about job ratio + cache adjustments
			debug("Whilst running this challenge any metal map caches will be set to wooden caches and any miner job ratios will be set to lumberjack ratios. Additionally Pre Void Farm" + (game.global.universe === 2 ? " and Smithy Farm" : "") + " will be disabled.");
		}
		if (challengeActive('Mapology') && !getPageSetting('mapology')) {
			//Warning about disabled Mapology setting
			debug("You have the AT setting for Mapology disabled which would be helpful with limiting the amount of map credits spent on mapping & raiding.");
		}

		if (challengeActive('Downsize')) {
			//Warning message when about map settings causing issues later.
			debug("Be aware that your usual farming settings will not work properly when running " + game.global.challengeActive + " due to reduced population and will likely cause it to stall out so you might want to amend or disable them.");
		}
		if (challengeActive('Quest') && getPageSetting('quest') && getPageSetting('buildingsType')) {
			//Warning message when AutoStructure Smithy purchasing is enabled.
			if (getAutoStructureSetting().enabled && game.global.autoStructureSettingU2.Smithy.enabled) {
				debug("You have the setting for Smithy autopurchase enabled in the AutoStructure settings. This setting has the chance to cause issues later in the run.");
			}
			//Warning message when C3 Finish Run setting isn't greater than your quest HZE.
			if (game.global.runningChallengeSquared && (getPageSetting('questSmithyZone') === -1 ? Infinity : getPageSetting('questSmithyZone')) <= game.c2.Quest) {
				debug("The setting 'Q: Smithy Zone' is lower or equal to your current Quest HZE. Increase this or smithies might be purchased earlier than they should be.");
			}
		}
		if (challengeActive('Pandemonium')) {
			//Warning message when about map settings causing issues later.
			debug("Be aware that your usual farming settings will not work properly due to the map resource shred mechanic so you might want to amend or disable them. Additionally Smithy Farm is disabled when running this challenge.");
		}
	}
	challengeCurrentZone = game.stats.zonesCleared.value;
}

function c2FinishZone() {

	var finishChallenge = Infinity;

	//Finish challenge overrides when C∞ Runner is enabled
	if (getPageSetting('c2RunnerStart')) {
		//Using C∞ Runner %
		if (getPageSetting('c2RunnerMode') === 0)
			finishChallenge = getPageSetting('c2RunnerPortal');
		//Using C∞ Runner Settings
		//If not enabled then set to Infinity!
		else if (getPageSetting('c2RunnerMode') === 1) {
			finishChallenge = getPageSetting("c2RunnerSettings")[game.global.challengeActive] && getPageSetting("c2RunnerSettings")[game.global.challengeActive].enabled ? getPageSetting("c2RunnerSettings")[game.global.challengeActive].zone : Infinity;
		}
	}
	else {
		finishChallenge = getPageSetting('c2Finish');
	}
	if (finishChallenge <= 0) finishChallenge = Infinity;

	return finishChallenge;
}

function finishChallengeSquared() {
	downloadSave();
	//Cancel out of challenge run
	abandonChallenge();
	cancelTooltip();
	debug("Finished challenge because we are on zone " + game.global.world, "challenge", "oil");
	return;
}

function resetVarsZone(loadingSave) {

	//Reloading save variables
	if (loadingSave) {

		MODULES.stats.baseMinDamage = 0;
		MODULES.stats.baseMaxDamage = 0;
		MODULES.stats.baseDamage = 0;
		MODULES.stats.baseHealth = 0;
		MODULES.stats.baseBlock = 0;

		atSettings.portal.currentworld = 0;
		atSettings.portal.lastrunworld = 0;
		atSettings.portal.aWholeNewWorld = false;
		universeSwapped();

		atSettings.portal.currentHZE = 0;
		atSettings.portal.lastHZE = 0;

		MODULES.fightinfo.lastProcessedWorld = 0;
		MODULES.portal.portalForVoid = false;
		MODULES.mapFunctions.afterVoids = false;

	}
	delete mapSettings.voidHDIndex;
	MODULES.heirlooms.plagueSwap = false;
	MODULES.heirlooms.compressedCalc = false;

	//General
	MODULES.maps.mapTimer = 0;
	MODULES.maps.fragmentCost = Infinity;

	//Fragment Farming
	initialFragmentMapID = undefined;

	//Auto Level variables
	MODULES.maps.mapRepeats = 0;
	mapSettings.levelCheck = Infinity;

	//Challenge Repeat
	MODULES.mapFunctions.challengeContinueRunning = false;

	trimpStats = new TrimpStats();
	hdStats = new HDStats(true);
	farmingDecision();
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

function downloadSave(portal) {
	if (!getPageSetting('downloadSaves')) return
	if (portal && !portalWindowOpen) return;
	tooltip('Export', null, 'update');
	document.getElementById("downloadLink").click();
	cancelTooltip();
}

function hypoPackratReset(challenge) {

	if (challenge === 'Hypothermia' && getPageSetting('hypothermiaSettings', portalUniverse)[0].packrat) {
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

//Auto-Respec into combat spec after running Trimple/Atlantrimp
function surkyCombatRespec() {

	if (!MODULES.popups.respecAtlantrimp) return;
	MODULES.popups.respecAtlantrimp = false;
	MODULES.popups.remainingTime = Infinity;
	if (!game.global.viewingUpgrades) viewPortalUpgrades();
	var currPreset = $$('#preset').value;

	//Swapping to Spire respec in u1
	if (game.global.universe === 1) fillPresetPerky('spire');
	//Changing to combat preset if in a C3/special challenge or Radon Combat Respec preset if not. 
	else if (trimpStats.isC3) fillPresetSurky('combat');
	else fillPresetSurky('combatRadon');
	//Respecing perks
	if (game.global.universe === 2)
		runSurky();
	else
		allocatePerky();
	//Fire all workers so that we don't run into issues when finishing the respec
	fireAllWorkers();
	activateClicked();
	var calcName = game.global.universe === 2 ? "Surky" : "Perky";
	debug(calcName + " - Respeccing into the " + $$('#preset')[$$('#preset').selectedIndex].innerHTML + " preset.", "portal");

	//Reverting back to original preset
	if (game.global.universe === 2)
		fillPresetSurky(currPreset);
	else
		fillPresetPerky(currPreset);
}

MODULES.portal.disableAutoRespec = 0;

//Force tooltip appearance for Surky combat respec post Atlantrimp
function atlantrimpRespecMessage(cellOverride) {
	if (!game.global.canRespecPerks) return;
	//Stop this from running if we're in U1 and not at the highest Spire reached.
	if (game.global.universe === 1 && (!game.global.spireActive || game.global.world < Math.floor((getHighestLevelCleared() + 1) / 100) * 100)) return;
	if (typeof MODULES.autoPerks === 'undefined') return;

	//Stop it running if we aren't above the necessary cell for u1.
	if (!cellOverride) {
		//If we have just toggled the setting, wait 5 seconds before running this.
		if (settingChangedTimeout) return;
		//Disable this from running if we have already disabled it this portal.
		//This variable is reset when changing the "presetCombatRespecCell" settings input.
		if (MODULES.portal.disableAutoRespec === getTotalPortals()) return;
		var cell = getPageSetting('presetCombatRespecCell');
		//Override for if cell is set to 0 or below.
		if (cell <= 0) return;
		if (game.global.lastClearedCell + 2 < cell) return;
		//Set the variable to the current portal count so that we don't run this again this portal.
		MODULES.portal.disableAutoRespec = getTotalPortals();
	}

	MODULES.popups.respecAtlantrimp = false;

	var respecSetting = getPageSetting('presetCombatRespec');
	//If setting is enabled, respec into Surky combat respec
	var respecName = !trimpStats.isC3 ? "Radon " : "" + "Combat Respec";
	if (game.global.universe === 1) respecName = 'Spire'
	if (respecSetting === 2) {
		MODULES.popups.respecAtlantrimp = true;
		MODULES.popups.remainingTime = 5000;
		var description = "<p>Respeccing into the <b>" + respecName + "</b> preset</p>";
		tooltip('confirm', null, 'update', description + '<p>Hit <b>Disable Respec</b> to stop this.</p>', 'MODULES.popups.respecAtlantrimp = false, MODULES.popups.remainingTime = Infinity', '<b>NOTICE: Auto-Respeccing in ' + (MODULES.popups.remainingTime / 1000).toFixed(1) + ' seconds....</b>', 'Disable Respec');
		setTimeout(surkyCombatRespec, 5000);
	}
	//If setting is disabled, show tooltip to allow for respec after Atlantrimp has been run
	else if (respecSetting === 1) {
		var mapName = game.global.universe === 2 ? 'Atlantrimp' : 'Trimple of Doom';
		var description = "<p>Click <b>Force Respec</b> to respec into the <b>" + respecName + "</b> preset.</p>";
		tooltip('confirm', null, 'update', description, 'MODULES.popups.respecAtlantrimp = true; surkyCombatRespec()', '<b>Post ' + mapName + ' Respec</b>', 'Force Respec');
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
			atlantrimpRespecMessage(true);
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
		loadAugustSettings();
		atlantrimpRespecOverride();
		resetVarsZone(true);
		if (typeof MODULES["graphs"].themeChanged === 'function')
			MODULES["graphs"].themeChanged();
		updateCustomButtons(true);
	}
	catch (e) { debug("Load save failed: " + e) }
}

// On portal/game reset
var originalresetGame = resetGame;
resetGame = function () {
	originalresetGame(...arguments)
	try {
		atlantrimpRespecOverride();
	}
	catch (e) { debug("Load save failed: " + e) }
}

function resetSettingsPortal() {

	var value = 'value';
	if (game.global.universe === 2) value += 'U2';

	var enabled = 'enabled';
	if (game.global.universe === 2) enabled += 'U2';


	//Enabling Auto Portal
	if (getPageSetting('autoMapsPortal')) {
		autoTrimpSettings["autoMaps"][value] = 1;
		document.getElementById('autoMaps').setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings['autoMaps'][value]);
		document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + autoTrimpSettings['autoMaps'][value]);
	}
	//Enabling Auto Equip
	if (getPageSetting('equipPortal')) {
		autoTrimpSettings["equipOn"][enabled] = true;
		const autoEquip = getPageSetting('equipOn');
		document.getElementById('equipOn').setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoEquip);
		document.getElementById('autoEquipLabel').parentNode.setAttribute('class', 'pointer noselect autoUpgradeBtn settingBtn' + autoEquip);
	}

	//Setting buildings button up
	if (typeof (autoTrimpSettings['buildingSettingsArray'][value].portalOption) !== 'undefined') {
		if (autoTrimpSettings['buildingSettingsArray'][value].portalOption === 'on')
			autoTrimpSettings["buildingsType"][enabled] = true;
		if (autoTrimpSettings['buildingSettingsArray'][value].portalOption === 'off')
			autoTrimpSettings["buildingsType"][enabled] = false;

		document.getElementById('buildingsType').setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings['buildingsType'][enabled]);
		document.getElementById('autoStructureLabel').parentNode.setAttribute('class', 'toggleConfigBtn pointer noselect autoUpgradeBtn settingBtn' + autoTrimpSettings['buildingsType'][enabled]);
	}

	//Setting jobs button up
	if (typeof (autoTrimpSettings['jobSettingsArray'][value].portalOption) !== 'undefined') {
		if (autoTrimpSettings['jobSettingsArray'][value].portalOption === 'autojobs off')
			autoTrimpSettings['jobType'][value] = 0;
		if (autoTrimpSettings['jobSettingsArray'][value].portalOption === 'auto ratios')
			autoTrimpSettings['jobType'][value] = 1;
		if (autoTrimpSettings['jobSettingsArray'][value].portalOption === 'manual ratios')
			autoTrimpSettings['jobType'][value] = 2;

		const autoJobs = getPageSetting('jobType');

		document.getElementById('jobType').setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + (autoJobs === 2 ? 3 : autoJobs));
		document.getElementById('autoJobLabel').parentNode.setAttribute('class', 'toggleConfigBtn pointer noselect autoUpgradeBtn settingBtn' + (autoJobs === 2 ? 3 : autoJobs));
	}

	updateButtonText();
	saveSettings();
}