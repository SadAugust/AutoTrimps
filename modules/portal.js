MODULES.portal = {
	timeout: 4000,
	bufferExceedFactor: 5,
	portalForVoid: false,
	portalUniverse: Infinity,
	currentChallenge: 'None',
	dontPushData: false,
	dailyMods: '',
	dailyPercent: 0,
	zonePostpone: 0,
	disableAutoRespec: 0
};

//Figures out which type of autoPortal we should be running depending on what kind of challenge we are in.
function autoPortalCheck(specificPortalZone) {
	decayFinishChallenge();
	quagmireFinishChallenge();

	if (!game.global.portalActive) return;

	if (game.global.runningChallengeSquared) c2RunnerPortal(specificPortalZone);
	else autoPortal(specificPortalZone);
}

function autoPortal(specificPortalZone, universe, skipDaily) {
	if (MODULES.portal.portalForVoid && !game.options.menu.liquification.enabled) toggleSetting('liquification');
	if (!game.global.portalActive || game.global.runningChallengeSquared) return;

	universe = universe || (MODULES.portal.portalUniverse !== Infinity ? MODULES.portal.portalUniverse : game.global.universe);
	const runningDaily = challengeActive('Daily');
	if (!shouldPortal(runningDaily, universe)) return;

	const portalZone = MODULES.portal.portalForVoid ? _getPortalZoneVoid() : _getPortalZone(runningDaily, universe, specificPortalZone, skipDaily);
	if (MODULES.portal.portalForVoid && portalZone <= 0) return;

	const heHrSettings = ['Helium Per Hour', 'Radon Per Hour', '1'];
	let portalType = getPageSetting('autoPortal', universe);
	let challengeSelected = portalType;

	if (heHrSettings.includes(portalType) || portalType.includes('Custom')) {
		challengeSelected = getPageSetting('heliumHourChallenge', universe);
	} else if (portalType.includes('One Off Challenges')) {
		challengeSelected = getPageSetting('heliumOneOffChallenge', universe);
	}

	if (runningDaily) portalType = getPageSetting('dailyPortal', universe).toString();

	if (heHrSettings.includes(portalType)) {
		handleHeHrSettings(runningDaily, universe, challengeSelected, skipDaily);
	} else {
		handlePortalType(portalType, portalZone, specificPortalZone, universe, challengeSelected, skipDaily);
	}
}

function shouldPortal(runningDaily, universe) {
	const portalSetting = runningDaily ? getPageSetting('dailyPortal', universe) : getPageSetting('autoPortal', universe);
	const portalOff = runningDaily ? '0' : 'Off';

	return !(MODULES.portal.portalForVoid && portalSetting === portalOff);
}

function _getPortalZoneVoid() {
	const { owned, tracker } = game.permaBoneBonuses.voidMaps;
	const maxTracker = 100 - owned;
	if (tracker >= maxTracker) return game.global.world;

	const liquificationZone = checkLiqZoneCount();
	const portalZone = liquificationZone >= 99 ? 99 : Math.floor(liquificationZone) + 1;
	if (game.global.world < portalZone) return 0;

	return portalZone;
}

function _getPortalZone(runningDaily, universe, specificPortalZone, skipDaily) {
	if (skipDaily) return game.global.world;
	if (specificPortalZone) return specificPortalZone;
	if (runningDaily) return _getPortalZoneDaily(universe);
	if (!runningDaily && getPageSetting('autoPortal', universe).includes('Hour')) return Infinity;

	const portalZone = getPageSetting('autoPortalZone', universe);
	return portalZone > 0 ? portalZone : Infinity;
}

function _getPortalZoneDaily(universe) {
	if (getPageSetting('dailyPortal', universe) === 1) return Infinity;

	const portalZone = getPageSetting('dailyPortalZone');
	return portalZone > 0 ? portalZone : Infinity;
}

function handleHeHrSettings(runningDaily, universe, challengeSelected, skipDaily) {
	const resourceType = game.global.universe === 2 ? 'Radon' : 'Helium';
	const prefix = runningDaily ? 'dailyHelium' : 'helium';
	const minZone = getPageSetting(runningDaily ? 'dailyDontPortalBefore' : 'heliumHrDontPortalBefore', universe);
	game.stats.bestHeliumHourThisRun.evaluate();
	const bestHeHr = game.stats.bestHeliumHourThisRun.storedValue;
	const bestHeHrZone = game.stats.bestHeliumHourThisRun.atZone;
	const myHeliumHr = _getHeliumPerHour(resourceType.toLowerCase());
	let heliumHrBuffer = Math.abs(getPageSetting(prefix + 'HrBuffer', universe));
	let OKtoPortal = false;

	if (!atSettings.portal.aWholeNewWorld) heliumHrBuffer *= MODULES.portal.bufferExceedFactor;
	const bufferExceeded = myHeliumHr < bestHeHr * (1 - heliumHrBuffer / 100);

	if (bufferExceeded && game.global.world >= minZone) {
		OKtoPortal = true;
		if (atSettings.portal.aWholeNewWorld) MODULES.portal.zonePostpone = 0;
	}
	if (heliumHrBuffer === 0 && !atSettings.portal.aWholeNewWorld) OKtoPortal = false;

	if (MODULES.mapFunctions.afterVoids || (OKtoPortal && MODULES.portal.zonePostpone === 0)) {
		handleHeHrPortal(prefix, universe, resourceType, myHeliumHr, bestHeHr, bestHeHrZone, challengeSelected, skipDaily);
	}
}

function _getHeliumPerHour(resourceType) {
	let timeThisPortal = new Date().getTime() - game.global.portalTime;
	if (timeThisPortal < 1) return 0;
	timeThisPortal /= 3.6e6;
	const resToUse = game.resources[resourceType].owned;

	return resToUse / timeThisPortal;
}

function handleHeHrPortal(prefix, universe, resourceType, myHeliumHr, bestHeHr, bestHeHrZone, challengeSelected, skipDaily) {
	if (getPageSetting(prefix + 'HrPortal', universe) > 0 && game.global.totalVoidMaps > 0) {
		_handleHeHrAfterVoids(prefix, universe);
	}

	if (MODULES.mapFunctions.afterVoids && game.global.totalVoidMaps > 0) {
		if (game.global.spireActive && getPageSetting(prefix + 'HrExitSpire')) {
			debug(`Exiting Spire to run voids faster.`, 'portal');
			endSpire();
		}
		return;
	}

	if (usingRealTimeOffline || (MODULES.mapFunctions.afterVoids && game.global.totalVoidMaps === 0)) {
		const challenge = challengeSelected !== 'None' ? challengeSelected : 0;
		doPortal(challenge, skipDaily);

		setTimeout(() => {
			debug(`My ${resourceType}Hr was: ${prettify(myHeliumHr)} & the Best ${resourceType}Hr was: ${prettify(bestHeHr)} at zone ${bestHeHrZone}`, 'portal');
		}, 1000);
	} else {
		_handleHeHrPortalDelay(resourceType, myHeliumHr, bestHeHr, bestHeHrZone, challengeSelected, skipDaily);
	}
}

function _handleHeHrAfterVoids(prefix, universe) {
	if (!MODULES.mapFunctions.afterVoids) {
		const notPoisonZone = getPageSetting(prefix + 'HrPortal', universe) === 2 && getZoneEmpowerment(game.global.world) !== 'Poison';
		if (notPoisonZone) debug(`Z${game.global.world} - Pushing to next Poison zone then portaling after void maps have been run.`, 'portal');
		else debug(`Z${game.global.world} - Portaling after void maps have been run.`, 'portal');
	}

	MODULES.mapFunctions.afterVoids = true;
}

function _handleHeHrPortalDelay(resourceType, myHeliumHr, bestHeHr, bestHeHrZone, challengeSelected, skipDaily) {
	MODULES.portal.zonePostpone += 1;
	MODULES.popups.portal = true;
	if (MODULES.popups.remainingTime === Infinity) MODULES.popups.remainingTime = 4000;
	tooltip('confirm', null, 'update', '<b>Auto Portaling NOW!</b><p>Hit Delay Portal to WAIT 1 more zone.', 'MODULES.portal.zonePostpone++; MODULES.popups.portal = false', `<b>NOTICE: Auto-Portaling in ${MODULES.popups.remainingTime} seconds....</b>`, 'Delay Portal');

	setTimeout(() => {
		cancelTooltip();
		MODULES.popups.portal = false;
		MODULES.popups.remainingTime = Infinity;
	}, MODULES.portal.timeout);

	setTimeout(() => {
		if (MODULES.portal.zonePostpone >= 2) return;
		const challenge = challengeSelected !== 'None' ? challengeSelected : 0;
		doPortal(challenge, skipDaily);

		setTimeout(() => {
			debug(`My ${resourceType}Hr was: ${prettify(myHeliumHr)} & the Best ${resourceType}Hr was: ${prettify(bestHeHr)} at zone ${bestHeHrZone}`, 'portal');
		}, 1000);
	}, MODULES.portal.timeout + 100);
}

function handlePortalType(portalType, portalZone, specificPortalZone, universe, challengeSelected, skipDaily) {
	const challenge2Settings = ['Challenge 2', 'Challenge 3'];
	const atPortalZone = game.global.world >= portalZone;
	let challenge = 'None';

	if (portalType === '0') {
		if (atPortalZone && (specificPortalZone || game.global.universe !== universe)) {
			if (challengeSelected !== 'None') challenge = challengeSelected;
			else challenge = 0;
		}
	} else if (portalType === 'Off') {
		if (atPortalZone && specificPortalZone) challenge = 0;
	} else if (portalType === 'Custom' || portalType === '2' || portalType === 'One Off Challenges' || challenge2Settings.includes(portalType)) {
		if (atPortalZone) {
			if (challengeSelected !== 'None') challenge = challengeSelected;
			else challenge = 0;
		}
	} else {
		if ((!game.global.challengeActive && !MODULES.portal.portalForVoid) || (atPortalZone && specificPortalZone)) {
			doPortal(challengeSelected, skipDaily);
			return;
		}
	}

	if (challenge === 'Off') challenge = 0;
	if (challenge !== 'None') doPortal(challenge, skipDaily);
}

function c2RunnerPortal(portalZone) {
	if (!game.global.runningChallengeSquared) return;

	if (portalZone && game.global.world >= portalZone) {
		finishChallengeSquared();
		autoPortal(portalZone);
		return;
	}

	if (!portalZone) portalZone = c2FinishZone();
	if (portalZone <= 0) portalZone = Infinity;

	if (game.global.world >= portalZone) {
		finishChallengeSquared();
		//Only portal automatically if using C2 Runner Pct input.
		if (getPageSetting('c2RunnerStart') && getPageSetting('c2RunnerEndMode') === 1) {
			autoPortal(portalZone);
		}
	}
}

function doPortal(challenge, skipDaily) {
	if (!game.global.portalActive) return;

	if (getPageSetting('magmiteSpending') === 1) autoMagmiteSpender();
	autoHeirlooms();
	if (!portalWindowOpen) portalClicked();

	if (MODULES.portal.currentChallenge === 'None') MODULES.portal.currentChallenge = game.global.challengeActive;

	if (challengeActive('Daily') || game.global.runningChallengeSquared || challengeActive('Bublé')) _autoPortalAbandonChallenge();

	_autoPortalVoidTracker();
	if (MODULES.portal.portalForVoid) {
		MODULES.portal.dontPushData = true;
		return;
	}

	while (MODULES.portal.portalUniverse !== Infinity) {
		swapPortalUniverse();
		if (portalUniverse === MODULES.portal.portalUniverse) {
			universeSwapped();
			MODULES.portal.portalUniverse = Infinity;
		}
	}

	if (Fluffy.checkU2Allowed()) {
		_autoPortalUniverseSwap();
		if (!game.global.portalActive) return;
	}

	if (MODULES.portal.currentChallenge === 'Daily') {
		if (getPageSetting('dailyPortalPreviousUniverse', portalUniverse + 1)) {
			swapPortalUniverse();
			universeSwapped();
		}
	}

	_autoPortalC2();

	challenge = _autoPortalDaily(challenge, portalUniverse, skipDaily);
	if (!game.global.portalActive) return;

	if (!game.global.selectedChallenge && challenge && !challengeSquaredMode) challenge = _autoPortalRegular(challenge);
	_autoPortalActivate(challenge);
}

function _autoPortalAbandonChallenge() {
	if (challengeActive('Daily') && (typeof greenworks === 'undefined' || (typeof greenworks !== 'undefined' && process.version > 'v10.10.0'))) {
		const dailyMods = dailyModifiersOutput();
		MODULES.portal.dailyMods = dailyMods ? dailyMods.replace(/<br>/g, '|').slice(0, -1) : '';
		MODULES.portal.dailyPercent = Number(prettify(getDailyHeliumValue(countDailyWeight(game.global.dailyChallenge))));
	}

	confirmAbandonChallenge();
	abandonChallenge();
	cancelTooltip();
	portalClicked();
}

function _autoPortalVoidTracker() {
	MODULES.portal.portalForVoid = true;
	const universe = MODULES.portal.portalUniverse !== Infinity ? MODULES.portal.portalUniverse : game.global.universe;
	const { owned, tracker } = game.permaBoneBonuses.voidMaps;

	if (!getPageSetting('portalVoidIncrement', universe) || game.options.menu.liquification.enabled === 0) MODULES.portal.portalForVoid = false;
	if (owned < 5 || (tracker >= 100 - owned && game.global.canRespecPerks)) MODULES.portal.portalForVoid = false;
	if (checkLiqZoneCount(1) < 20) MODULES.portal.portalForVoid = false;

	if (!MODULES.portal.portalForVoid) return;

	if (!game.global.canRespecPerks) debug(`Portaling to refresh respec.`, 'portal');

	if (MODULES.portal.portalUniverse === Infinity || (game.global.universe !== 1 && game.global.universe === MODULES.portal.portalUniverse)) {
		if (portalUniverse !== 1) {
			MODULES.portal.portalUniverse = game.global.universe;
			while (portalUniverse !== 1) swapPortalUniverse();
		}
		universeSwapped();
	}

	downloadSave();
	if (typeof pushData === 'function') pushData();
	if (!MODULES.portal.dontPushData) pushSpreadsheetData();
	autoUpgradeHeirlooms();

	const trackerValue = owned === 10 ? Math.floor(tracker / 10) : tracker / 10;
	debug(`Portaling to increment void tracker (${trackerValue}/10) with liquification.`, 'portal');

	activatePortal();
}

function _autoPortalUniverseSwap() {
	let newUniverse = portalUniverse;
	while (getPageSetting('autoPortalUniverseSwap', newUniverse)) {
		newUniverse++;
		if (newUniverse > 2) {
			newUniverse = 1;
			break;
		}
	}

	if (getPageSetting('autoPortal', newUniverse) !== 'Off') MODULES.portal.portalUniverse = newUniverse;
	MODULES.portal.portalForVoid = false;

	if (newUniverse !== portalUniverse) {
		autoPortal(game.global.world, newUniverse);
	}
}

function _autoPortalC2() {
	if (!game.global.portalActive || !portalWindowOpen) return;
	if ((portalUniverse === 1 && game.stats.highestLevel.valueTotal() < 65) || (portalUniverse === 2 && game.stats.highestRadLevel.valueTotal() < 50)) return;
	if (!getPageSetting('c2RunnerStart', portalUniverse)) return;

	const runType = getPageSetting('c2RunnerMode', portalUniverse);
	const c2RunnerPortal = getPageSetting('c2RunnerPortal', portalUniverse);
	const c2RunnerPercent = getPageSetting('c2RunnerPercent', portalUniverse);
	if (runType === 0 && (c2RunnerPortal <= 0 || c2RunnerPercent <= 0)) return;

	const challengeArray = [];
	const universePrefix = portalUniverse === 2 ? 'C3' : 'C2';
	const worldType = portalUniverse === 2 ? 'highestRadonLevelCleared' : 'highestLevelCleared';
	const c2Setting = getPageSetting('c2RunnerSettings', portalUniverse);

	if (runType === 0) {
		if (portalUniverse === 1) {
			let highestZone = game.stats.highestLevel.valueTotal();

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

		if (portalUniverse === 2) {
			let highestZone = game.stats.highestRadLevel.valueTotal();
			if (highestZone >= 50) challengeArray.push('Unlucky');
			if (highestZone >= 50) challengeArray.push('Unbalance');
			if (highestZone >= 85) challengeArray.push('Quest');
			if (highestZone >= 105) challengeArray.push('Storm');
			if (highestZone >= 50) challengeArray.push('Duel');
			if (highestZone >= 50) challengeArray.push('Downsize');
			if (highestZone >= 201) challengeArray.push('Smithless');
		}
	} else if (runType === 1) {
		for (let x in c2Setting) {
			if (typeof c2Setting[x] === 'undefined') continue;
			if (!c2Setting[x].enabled) continue;
			if (c2Setting[x].zone <= 0) continue;
			challengeArray.push(x);
		}
	}

	//Looping through challenge array to figure out if things should be run.
	for (let x = 0; x < challengeArray.length; x++) {
		const challengeName = challengeArray[x];
		const challenge = game.challenges[challengeName];
		let challengeList;
		let challengeLevel = 0;
		let check = false;

		if (challenge.multiChallenge) challengeList = challenge.multiChallenge;
		else challengeList = [challengeName];

		for (var y = 0; y < challengeList.length; y++) {
			if (challengeLevel > 0) challengeLevel = Math.min(challengeLevel, game.c2[challengeList[y]]);
			else challengeLevel += game.c2[challengeList[y]];
		}

		if (runType === 0) check = 100 * (challengeLevel / (game.global[worldType] + 1)) < c2RunnerPercent;
		else check = challengeLevel < c2Setting[challengeName].zone;

		if (check) {
			if (challengeActive(challengeName)) continue;
			if (!challengeSquaredMode) toggleChallengeSquared();
			if (!document.getElementById(`challenge${challengeName}`)) continue;
			selectChallenge(challengeName);
			debug(`${universePrefix} Runner: Starting ${challengeName}`, 'portal');
			return;
		}
	}

	if (!challengeSquaredMode) debug(`C${portalUniverse + 1} Runner: All C${portalUniverse + 1}'s above level threshold!`, 'portal');
}

function _autoPortalDaily(challenge, portalUniverse, skipDaily = false) {
	if (!skipDaily && (MODULES.portal.currentChallenge === 'Daily' || getPageSetting('dailyPortalStart', portalUniverse)) && !challengeSquaredMode) {
		const dailyAvailable = document.getElementById('challengeDaily') !== null;
		checkCompleteDailies();
		const dailiesToSkip = getPageSetting('dailySkip', portalUniverse).map((item) => item.replace(/-/g, ''));
		let lastUndone;

		for (lastUndone = -6; lastUndone <= 0; lastUndone++) {
			const dailyTime = getDailyTimeString(lastUndone);
			if (dailiesToSkip.includes(dailyTime.toString())) continue;
			if (game.global.recentDailies.indexOf(dailyTime) === -1) break;
		}

		if (getPageSetting('dailyDontCap', portalUniverse)) {
			let dailiesCompleted = 0;

			for (let x = -6; x <= 1 - getPageSetting('dailyDontCapAmt', portalUniverse); x++) {
				if (game.global.recentDailies.indexOf(getDailyTimeString(x)) !== -1) dailiesCompleted++;
			}
			if (dailiesCompleted === 8 - getPageSetting('dailyDontCapAmt', portalUniverse)) lastUndone = 1;
		}

		if (!getPageSetting('dailyPortalStart', portalUniverse)) {
			lastUndone = 1;
		}

		if (lastUndone === 1) {
			debug(`All dailies have been completed.`, 'portal');
			return challenge;
		}

		if ((MODULES.portal.currentChallenge === 'Daily' && (!getPageSetting('dailyPortalStart', portalUniverse) || getPageSetting('dailyPortalFiller', portalUniverse))) || lastUndone === 1) {
			MODULES.portal.currentChallenge = 'None';
			MODULES.portal.portalUniverse = portalUniverse;
			autoPortal(game.global.world, portalUniverse, true);
			return challenge;
		}

		if (!dailyAvailable) return challenge;

		if (portalUniverse > 1 && getPageSetting('dailyPortalPreviousUniverse', portalUniverse) && dailyAvailable) {
			swapPortalUniverse();
			universeSwapped();
		}

		selectChallenge('Daily');
		getDailyChallenge(lastUndone);
		debug(`Portaling into Daily for: ${getDailyTimeString(lastUndone, true)} now!`, 'portal');
		challenge = 'Daily';
	}

	return challenge;
}

function _autoPortalRegular(challengeName) {
	if (challengeName.includes('Challenge ')) {
		challengeName = getPageSetting('heliumC2Challenge', portalUniverse) === 'None' ? 0 : getPageSetting('heliumC2Challenge', portalUniverse);
		if (challengeName !== 0 && game.challenges[challengeName].allowSquared) toggleChallengeSquared();
	}

	if (!document.getElementById(`challenge${challengeName}`)) return;
	selectChallenge(challengeName);
}

function _autoPortalActivate(challenge) {
	const { owned, tracker } = game.permaBoneBonuses.voidMaps;
	const trackerValue = owned === 10 ? Math.floor(tracker / 10) : tracker / 10;
	debug(`Portaling with void tracker at ${trackerValue}/10.`, 'portal');
	universeSwapped();
	portalPerkCalc();

	let preset = 0;
	if (portalUniverse === 2) {
		hypoPackratReset(challenge);

		preset = challengeSquaredMode || challenge === 'Mayhem' || challenge === 'Pandemonium' || challenge === 'Desolation' ? 3 : game.global.selectedChallenge === 'Daily' ? 2 : 1;
		if (getPageSetting('presetSwapMutators', 2) && JSON.parse(localStorage.getItem('mutatorPresets'))['preset' + preset] !== '') {
			u2Mutations.toggleRespec();
		}
	}

	//Download save, push graphs data, push to spreadsheet for select users, activate portal, reset vars, and load mutators if necessary.
	downloadSave();
	if (typeof pushData === 'function') pushData();
	if (!MODULES.portal.dontPushData) pushSpreadsheetData();
	autoUpgradeHeirlooms();
	activatePortal();
	resetVarsZone(true);
	_setButtonsPortal();

	if (u2Mutations.open && getPageSetting('presetSwapMutators', 2)) {
		loadMutations(preset);
		u2Mutations.closeTree();
	}
}

function portalPerkCalc() {
	let preset;
	//Identifying which challenge type we're running to setup for the preset swapping function
	if (getPageSetting('presetSwap', portalUniverse)) {
		if (portalUniverse === 1) {
			if (game.global.selectedChallenge === 'Metal' || game.global.selectedChallenge === 'Nometal') preset = 'metal';
			else if (game.global.selectedChallenge === 'Scientist') preset = 'scientist';
			else if (game.global.selectedChallenge === 'Trimp') preset = 'trimp';
			else if (game.global.selectedChallenge === 'Coord') preset = 'coord';
			else if (game.global.selectedChallenge === 'Experience') preset = 'experience';
			else if (game.global.selectedChallenge === 'Frigid' || challengeSquaredMode) preset = 'c2';
			else {
				//If a specific challenge isn't selected then we'll use the highest zone cleared to determine which preset to use.
				[].slice.apply(document.querySelectorAll('#preset > *')).forEach(function (option) {
					if (parseInt(option.innerHTML.toLowerCase().replace(/[z+]/g, '').split('-')[0]) < game.global.highestLevelCleared) preset = option.value;
				});
			}
			fillPresetPerky(preset);
		}

		if (portalUniverse === 2) {
			if (game.global.selectedChallenge === 'Downsize') preset = 'downsize';
			//else if (game.global.selectedChallenge === 'Trappapalooza') preset = 'trappacarp';
			else if (game.global.selectedChallenge === 'Duel') preset = 'duel';
			else if (game.global.selectedChallenge === 'Berserk') preset = 'berserk';
			else if (game.global.selectedChallenge === 'Alchemy') preset = 'alchemy';
			else if (game.global.selectedChallenge === 'Smithless') preset = 'smithless';
			else if (['Mayhem', 'Pandemonium', 'Desolation'].indexOf(game.global.selectedChallenge) >= 0 || challengeSquaredMode) preset = 'push';
			else if (game.global.selectedChallenge === 'Daily') preset = 'tufarm';
			else if (autoPortalChallenges('oneOff').slice(1).indexOf(game.global.selectedChallenge) > 0) preset = 'push';
			else preset = 'ezfarm';
			fillPresetSurky(preset);
		}
	}

	//Run Perky/Surky.
	if (typeof MODULES.autoPerks !== 'undefined' && getPageSetting('autoPerks', portalUniverse)) {
		if (portalUniverse === 1) allocatePerky();
		if (portalUniverse === 2) runSurky();
	}
}

function decayFinishChallenge() {
	const challengeName = game.global.universe === 2 ? 'Melt' : 'Decay';
	if (!challengeActive(challengeName) || !getPageSetting('decay')) return;

	const challenge = game.challenges[challengeName];
	const currentStacks = challenge ? challenge.stacks : 0;
	const stacksToAbandon = getPageSetting('decayStacksToAbandon');

	if (stacksToAbandon > 0 && currentStacks > stacksToAbandon) {
		abandonChallenge();
		debug(`Finished ${challengeName} challenge because we had more than ${stacksToAbandon} stacks.`, 'general', 'oil');
	}
}

function quagmireFinishChallenge() {
	if (!challengeActive('Quagmire') || !getPageSetting('quagmireSettings')[0].active) return;
	const zoneToAbandon = getPageSetting('quagmireSettings')[0].abandonZone;

	if (zoneToAbandon > 0 && game.global.world >= zoneToAbandon) {
		abandonChallenge();
		debug(`Finished Quagmire challenge because we are at or past zone ${zoneToAbandon}.`, 'general', 'oil');
	}
}

function challengeInfo(force) {
	const challengeType = game.global.universe === 2 ? 'C3' : 'C2';
	const finishChallenge = c2FinishZone();

	if (game.global.runningChallengeSquared) {
		if (finishChallenge - 1 === game.global.world) debug(`Warning: AT will abandon your challenge when starting your next zone. If you want to stop this increase the zone set in 'Finish ${challengeType}' or set it to -1`, 'challenge');
		if (finishChallenge <= 0 && finishChallenge <= game.c2[game.global.challengeActive] && game.global.world < 3) {
			debug(`The zone input in the '${challengeType} Finish' setting (${finishChallenge}) is below or equal to your HZE for this challenge (${game.c2[game.global.challengeActive]}). Increase it or it'll end earlier than you'd probably like it to.`, 'challenge');
		}
	}

	if (force || game.global.world === 1 || (game.global.world % 3 === 0 && game.global.world < checkLiqZoneCount(game.global.universe) + 10)) {
		if (challengeActive('Daily') && getPageSetting('mapOddEvenIncrement') && dailyOddOrEven().active) {
			debug(`Be aware that with the Odd/Even Increment setting enabled mapping can be delayed by a zone since your daily has either a positive or negative zone modifier.`);
		}
		if (challengeActive('Metal') || challengeActive('Transmute')) {
			debug(`Whilst running this challenge any metal map caches will be set to wooden caches and any miner job ratios will be set to lumberjack ratios. Additionally Pre Void Farm${game.global.universe === 2 ? ' and Smithy Farm' : ''} will be disabled.`);
		}
		if (challengeActive('Mapology') && !getPageSetting('mapology')) {
			debug(`You have the AT setting for Mapology disabled which would be helpful with limiting the amount of map credits spent on mapping & raiding.`);
		}
		if (challengeActive('Downsize')) {
			debug(`Be aware that since your normal farming settings will not properly work due to reduced population and lower expected end zone any mapping lines that aren't specific to this challenge won't run.`);
		}

		if (_noMappingChallenges()) {
			debug(`Be aware that since the mapping you will do during this challenge is different from other challenges any mapping lines that aren't specific to this challenge won't run.`);
		}
		if (challengeActive('Quest') && getPageSetting('quest') && getPageSetting('buildingsType')) {
			const autoStructureSettings = getAutoStructureSetting();
			if (autoStructureSettings && autoStructureSettings.Smithy && autoStructureSettings.enabled && autoStructureSettings.Smithy.enabled) {
				debug(`You have the setting for Smithy autopurchase enabled in the AutoStructure settings. This setting has the chance to cause issues later in the run.`);
			}
			if (game.global.runningChallengeSquared && (getPageSetting('questSmithyZone') === -1 ? Infinity : getPageSetting('questSmithyZone')) <= game.c2.Quest) {
				debug(`The setting 'Q: Smithy Zone' is lower or equal to your current Quest HZE. Increase this or smithies might be purchased earlier than they should be.`);
			}
		}
		if (challengeActive('Pandemonium')) {
			debug(`Be aware that your usual farming settings will not work properly due to the map resource shred mechanic so you might want to amend or disable them. Additionally Smithy Farm is disabled when running this challenge.`);
		}
	}
}

function c2FinishZone() {
	let finishChallenge = Infinity;

	if (getPageSetting('c2RunnerStart')) {
		const c2RunnerMode = getPageSetting('c2RunnerMode');
		const c2RunnerPortal = getPageSetting('c2RunnerPortal');
		const c2RunnerSettings = getPageSetting('c2RunnerSettings')[game.global.challengeActive];

		finishChallenge = c2RunnerMode === 0 ? c2RunnerPortal : c2RunnerSettings && c2RunnerSettings.enabled ? c2RunnerSettings.zone : Infinity;
	} else {
		finishChallenge = getPageSetting('c2Finish');
	}

	return finishChallenge <= 0 ? Infinity : finishChallenge;
}

function finishChallengeSquared() {
	debug(`Finished ${game.global.challengeActive} at zone ${game.global.world}`, 'challenge', 'oil');
	abandonChallenge();
	cancelTooltip();
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

		MODULES.portal.currentChallenge = 'None';
		MODULES.portal.dontPushData = false;
		MODULES.portal.dailyMods = '';
		MODULES.portal.dailyPercent = 0;
		MODULES.portal.portalUniverse = Infinity;
		MODULES.portal.zonePostpone = 0;

		_setFightButtons();
	}

	delete mapSettings.voidHDIndex;
	MODULES.heirlooms.plagueSwap = false;
	MODULES.heirlooms.compressedCalc = false;
	//General
	MODULES.maps.mapTimer = 0;
	MODULES.maps.fragmentCost = Infinity;
	//Auto Level variables
	MODULES.maps.mapRepeats = 0;
	mapSettings.levelCheck = Infinity;
	//Challenge Repeat
	MODULES.mapFunctions.challengeContinueRunning = false;
	MODULES.mapFunctions.runUniqueMap = '';
	MODULES.mapFunctions.questRun = false;
	trimpStats = new TrimpStats();
	hdStats = new HDStats();
	//Reset map settings to default
	mapSettings = {
		shouldRun: false,
		mapName: '',
		levelCheck: Infinity
	};

	farmingDecision();
}

function hypoPackratReset(challenge) {
	if (challenge !== 'Hypothermia' || !getPageSetting('hypothermiaSettings', portalUniverse)[0].packrat) return;

	toggleRemovePerks();
	numTab(6, true);
	buyPortalUpgrade('Packrat');
	toggleRemovePerks();
	tooltip('Custom', null, 'update', true);
	document.getElementById('customNumberBox').value = 3;
	numTab(5, true);
	buyPortalUpgrade('Packrat');
}

//Auto-Respec into combat spec after running Trimple/Atlantrimp
function combatRespec() {
	if (!MODULES.popups.respecAncientTreasure) return;
	MODULES.popups.respecAncientTreasure = false;
	MODULES.popups.remainingTime = Infinity;
	if (!game.global.viewingUpgrades) viewPortalUpgrades();
	const currPreset = $$('#preset').value;

	//Swapping to Spire respec in u1
	if (game.global.universe === 1) fillPresetPerky('spire');
	//Changing to combat preset if in a C3/special challenge or Radon Combat Respec preset if not.
	else if (trimpStats.isC3 || trimpStats.isOneOff) fillPresetSurky('combat');
	else fillPresetSurky('combatRadon');

	//Respecing perks
	if (game.global.universe === 2) runSurky();
	else allocatePerky();

	//Fire all workers so that we don't run into issues when finishing the respec
	fireAllWorkers();
	activateClicked();

	const calcName = game.global.universe === 2 ? 'Surky' : 'Perky';
	const respecPresetName = $$('#preset')[$$('#preset').selectedIndex].innerHTML;
	debug(`${calcName} - Respeccing into the ${respecPresetName} preset.`, 'portal');

	//Reverting back to original preset
	if (game.global.universe === 2) fillPresetSurky(currPreset);
	else fillPresetPerky(currPreset);
}

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
		const cell = getPageSetting('presetCombatRespecCell');
		//Override for if cell is set to 0 or below.
		if (cell <= 0) return;
		if (game.global.lastClearedCell + 2 < cell) return;
		//Set the variable to the current portal count so that we don't run this again this portal.
		MODULES.portal.disableAutoRespec = getTotalPortals();
	}

	MODULES.popups.respecAncientTreasure = false;

	const respecSetting = getPageSetting('presetCombatRespec');
	//If setting is enabled, respec into Surky combat respec
	let respecName = !trimpStats.isC3 && !trimpStats.isOneOff ? 'Radon ' : '' + 'Combat Respec';
	if (game.global.universe === 1) respecName = 'Spire';

	if (respecSetting === 2) {
		MODULES.popups.respecAncientTreasure = true;
		MODULES.popups.remainingTime = MODULES.portal.timeout;
		var description = '<p>Respeccing into the <b>' + respecName + '</b> preset</p>';
		tooltip('confirm', null, 'update', description + '<p>Hit <b>Disable Respec</b> to stop this.</p>', 'MODULES.popups.respecAncientTreasure = false, MODULES.popups.remainingTime = Infinity', '<b>NOTICE: Auto-Respeccing in ' + (MODULES.popups.remainingTime / 1000).toFixed(1) + ' seconds....</b>', 'Disable Respec');
		setTimeout(combatRespec, MODULES.portal.timeout);
	}
	//If setting is disabled, show tooltip to allow for respec after Atlantrimp has been run
	else if (respecSetting === 1) {
		const mapName = game.global.universe === 2 ? 'Atlantrimp' : 'Trimple Of Doom';
		const description = '<p>Click <b>Force Respec</b> to respec into the <b>' + respecName + '</b> preset.</p>';
		tooltip('confirm', null, 'update', description, 'MODULES.popups.respecAncientTreasure = true; combatRespec()', '<b>Post ' + mapName + ' Respec</b>', 'Force Respec');
	}
}

function _setButtonsPortal() {
	if (getPageSetting('autoMapsPortal') && !getPageSetting('autoMaps')) {
		setPageSetting('autoMaps', 1, game.global.universe);
	}
	_setAutoMapsClasses();

	if (getPageSetting('equipPortal') && !getPageSetting('equipOn')) {
		setPageSetting('equipOn', true, game.global.universe);
	}
	_setAutoEquipClasses();

	const autoStructureSettings = getPageSetting('buildingSettingsArray');
	if (typeof autoStructureSettings.portalOption !== 'undefined' && autoStructureSettings.portalOption !== '0') {
		setPageSetting('buildingsType', autoStructureSettings.portalOption === 'on', game.global.universe);
	}
	_setBuildingClasses();

	const autoJobsSettings = getPageSetting('jobSettingsArray');
	if (typeof autoJobsSettings.portalOption !== 'undefined' && autoJobsSettings.portalOption !== '0') {
		const portalOptionMapping = {
			'autojobs off': 0,
			'auto ratios': 1,
			'manual ratios': 2
		};

		if (portalOptionMapping.hasOwnProperty(autoJobsSettings.portalOption)) {
			setPageSetting('jobType', portalOptionMapping[autoJobsSettings.portalOption], game.global.universe);
		}
	}
	_setAutoJobsClasses();

	saveSettings();
}
