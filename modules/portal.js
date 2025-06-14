function autoPortalCheck(specificPortalZone) {
	decayFinishChallenge();
	quagmireFinishChallenge();
	dailyFinishChallenge();

	if (!game.global.portalActive) return;
	if (atConfig.timeouts.autoPortal) return;

	if (game.global.runningChallengeSquared) c2RunnerPortal(specificPortalZone);
	else autoPortal(specificPortalZone);
}

function autoPortal(specificPortalZone, universe, skipDaily) {
	const respecSetting = MODULES.portal.portalForVoid || MODULES.portal.portalForRespec;
	if (respecSetting && !game.options.menu.liquification.enabled) toggleSetting('liquification');
	if (!game.global.portalActive) return;

	if (MODULES.portal.portalUniverse === null || isNaN(MODULES.portal.portalUniverse)) MODULES.portal.portalUniverse = game.global.universe;
	universe = universe || (MODULES.portal.portalUniverse !== Infinity ? MODULES.portal.portalUniverse : game.global.universe);
	const runningDaily = challengeActive('Daily');
	if (!shouldPortal(runningDaily, universe)) return;

	const portalZone = respecSetting ? _getPortalZoneVoid() : _getPortalZone(runningDaily, universe, specificPortalZone, skipDaily);
	if (respecSetting) {
		if (portalZone <= 0) return;
		else specificPortalZone = portalZone;
	}

	const heHrSettings = ['Helium Per Hour', 'Radon Per Hour', '1'];
	let portalType = getPageSetting('autoPortal', universe);
	let challengeSelected = portalType;

	if (heHrSettings.includes(portalType) || portalType.includes('Custom')) {
		challengeSelected = getPageSetting('heliumHourChallenge', universe);
	} else if (portalType.includes('One Off Challenges')) {
		challengeSelected = getPageSetting('heliumOneOffChallenge', universe);
	} else if (portalType.includes(`${_getPrimaryResourceInfo(universe).name} Challenges`)) {
		challengeSelected = getPageSetting('heliumChallenge', universe);
	}

	if (runningDaily) {
		portalType = getPageSetting('dailyPortal', universe).toString();
	}

	if (heHrSettings.includes(portalType)) {
		handleHeHrSettings(runningDaily, universe, challengeSelected, skipDaily);
	} else {
		handlePortalType(portalType, portalZone, specificPortalZone, universe, challengeSelected, skipDaily);
	}
}

function shouldPortal(runningDaily, universe) {
	const portalSetting = runningDaily ? getPageSetting('dailyPortal', universe) : getPageSetting('autoPortal', universe);
	const portalOff = runningDaily ? '0' : 'Off';

	return !((MODULES.portal.portalForVoid || MODULES.portal.portalForRespec) && portalSetting === portalOff);
}

function _getPortalZoneVoid() {
	if (MODULES.portal.portalForRespec) return game.global.world;

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

	if (!atConfig.portal.aWholeNewWorld) heliumHrBuffer *= MODULES.portal.bufferExceedFactor;
	const bufferExceeded = myHeliumHr < bestHeHr * (1 - heliumHrBuffer / 100);

	if (bufferExceeded && game.global.world >= minZone) {
		OKtoPortal = true;
		if (atConfig.portal.aWholeNewWorld) MODULES.portal.zonePostpone = 0;
	}

	if (heliumHrBuffer === 0 && !atConfig.portal.aWholeNewWorld) {
		OKtoPortal = false;
	}

	if (MODULES.mapFunctions.afterVoids || MODULES.portal.forcePortal || (OKtoPortal && MODULES.portal.zonePostpone === 0) || game.global.world >= getObsidianStart()) {
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

	if (usingRealTimeOffline || MODULES.portal.forcePortal || ((MODULES.mapFunctions.afterVoids || mapSettings.portalAfterVoids) && game.global.totalVoidMaps === 0)) {
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
		if (notPoisonZone && game.global.world < getObsidianStart()) debug(`Z${game.global.world} - Pushing to next Poison zone then portaling after void maps have been run.`, 'portal');
		else debug(`Z${game.global.world} - Portaling after void maps have been run.`, 'portal');
	}

	MODULES.mapFunctions.afterVoids = true;
}

function _handleHeHrPortalDelay(resourceType, myHeliumHr, bestHeHr, bestHeHrZone, challengeSelected, skipDaily) {
	MODULES.portal.zonePostpone += 1;
	MODULES.popups.portal = true;
	if (MODULES.popups.remainingTime === Infinity) MODULES.popups.remainingTime = 4000;
	tooltip('confirm', null, 'update', '<b>Auto Portaling NOW!</b><p>Hit Delay Portal to WAIT 1 more zone.', 'MODULES.portal.zonePostpone++; MODULES.popups.portal = false', `<b>NOTICE: Auto-Portaling in ${MODULES.popups.remainingTime} seconds....</b>`, 'Delay Portal');

	MODULES.portal.heHrTimeout = setTimeout(() => {
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
	if (mapSettings.portalAfterVoids && MODULES.mapFunctions.afterVoids && MODULES.portal.forcePortal && MODULES.portal.afterVoids) return;
	const challenge2Settings = ['Challenge 2', 'Challenge 3'];
	const atPortalZone = game.global.world >= portalZone;
	const respecPortal = atPortalZone && specificPortalZone;
	let challenge = 'None';

	if (portalType === '0') {
		/* daily portal */
		if (atPortalZone && (specificPortalZone || game.global.universe !== universe)) {
			if (challengeSelected !== 'None') challenge = challengeSelected;
			else challenge = 0;
		}
	} else if (portalType === '2' || portalType === 'Custom' || portalType === 'One Off Challenges' || challenge2Settings.includes(portalType)) {
		if (atPortalZone) {
			if (challengeSelected !== 'None') challenge = challengeSelected;
			else challenge = 0;
		}
	} else if (portalType === `${_getPrimaryResourceInfo(universe).name} Challenges`) {
		if (respecPortal || (!game.global.challengeActive && !MODULES.portal.portalForVoid && !MODULES.portal.portalForRespec)) {
			challenge = challengeSelected;
		}
	} else if (respecPortal) {
		doPortal(challengeSelected, skipDaily);
		return;
	}

	if (challenge === 'Off' || (portalType === 'Off' && respecPortal)) challenge = 0;
	if (challenge !== 'None') doPortal(challenge, skipDaily);
}

function c2RunnerPortal(portalZone) {
	if (!game.global.runningChallengeSquared) return;

	if (portalZone && game.global.world >= portalZone) {
		finishChallengeSquared(challengeActive('Obliterated') || challengeActive('Eradicated'));
		MODULES.portal.forcePortal = true;
		autoPortal(game.global.world);
		return;
	}

	if (!portalZone) portalZone = c2FinishZone();
	if (portalZone <= 0) portalZone = Infinity;

	if (game.global.world >= portalZone) {
		finishChallengeSquared(challengeActive('Obliterated') || challengeActive('Eradicated'));
		const endMode = getPageSetting('c2RunnerEndMode');
		if (getPageSetting('c2RunnerStart') && [1, 2, 3].includes(endMode)) {
			autoPortalForce(endMode >= 2, endMode === 3);
		}
	}
}

function doPortal(challenge, skipDaily) {
	if (!game.global.portalActive) return;

	if (!portalWindowOpen) {
		portalClicked();
	} else {
		if (challengeSquaredMode) toggleChallengeSquared();
		if (game.global.selectedChallenge) selectChallenge(0);
	}

	let heirloomText = autoHeirlooms(true);
	let magmiteText = getPageSetting('magmiteSpending') === 1 ? autoMagmiteSpender(true) : undefined;

	if (MODULES.portal.currentChallenge === 'None') MODULES.portal.currentChallenge = game.global.challengeActive;

	const abandonC2 = game.global.runningChallengeSquared && !challengeActive('Obliterated') && !challengeActive('Eradicated');
	if (challengeActive('Daily') || abandonC2 || challengeActive('Bublé')) _autoPortalAbandonChallenge();

	_autoPortalVoidTracker();
	if (MODULES.portal.portalForVoid || MODULES.portal.portalForRespec) {
		MODULES.portal.dontPushData = true;
		return;
	}

	while (MODULES.portal.portalUniverse !== Infinity) {
		if (MODULES.portal.portalUniverse === null || isNaN(MODULES.portal.portalUniverse)) MODULES.portal.portalUniverse = game.global.universe;
		swapPortalUniverse();
		if (portalUniverse === MODULES.portal.portalUniverse) {
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
		}
	}

	let c2Text = _autoPortalC2();
	let dailyText;
	if (!skipDaily && !challengeSquaredMode && (MODULES.portal.currentChallenge === 'Daily' || getPageSetting('dailyPortalStart', portalUniverse))) {
		const dailyPortal = _autoPortalDaily(challenge, portalUniverse, skipDaily);

		if (Array.isArray(dailyPortal)) {
			[dailyText, challenge] = dailyPortal;
		} else {
			challenge = dailyPortal;
		}
	}

	if (!game.global.portalActive) return;

	if (!game.global.selectedChallenge && challenge && !challengeSquaredMode) challenge = _autoPortalRegular(challenge);
	_autoPortalActivate(challenge);

	if (heirloomText) debug(heirloomText, 'heirlooms');
	if (magmiteText) debug(magmiteText, 'magmite');
	if (c2Text) debug(c2Text, 'portal');
	if (dailyText) debug(dailyText, 'portal');
	if (!game.global.runningChallengeSquared && !challengeActive('Daily')) debug(`Portaling into ${game.global.challengeActive || 'a no challenge run'}.`, 'portal');
}

function _autoPortalAbandonChallenge(portal = true) {
	if (challengeActive('Daily') && (typeof greenworks === 'undefined' || (typeof greenworks !== 'undefined' && process.version > 'v10.10.0'))) {
		const dailyMods = dailyModifiersOutput();
		MODULES.portal.dailyMods = dailyMods ? dailyMods.replace(/<br>/g, '|').slice(0, -1) : '';
		MODULES.portal.dailyPercent = Number(prettify(getDailyHeliumValue(countDailyWeight(game.global.dailyChallenge))));
	}

	confirmAbandonChallenge();
	abandonChallenge();
	cancelTooltip();
	if (portal) portalClicked();
}

function _autoPortalVoidTracker() {
	let forcePortal = false;
	MODULES.portal.portalForVoid = false;
	MODULES.portal.portalForRespec = false;

	const universe = MODULES.portal.portalUniverse !== Infinity ? MODULES.portal.portalUniverse : game.global.universe;
	const { owned, tracker } = game.permaBoneBonuses.voidMaps;

	const portalRespec = getPageSetting('portalRespec', universe);
	if (!portalRespec || checkLiqZoneCount(1) < 20) {
		return;
	}

	if (portalRespec === 2 && tracker < 100 - owned) forcePortal = true;
	if (!game.global.canRespecPerks) forcePortal = true;

	if (!forcePortal) return;
	if (!game.options.menu.liquification.enabled) toggleSetting('liquification');

	if (MODULES.portal.portalUniverse === Infinity || (game.global.universe !== 1 && game.global.universe === MODULES.portal.portalUniverse)) {
		if (portalUniverse !== 1) {
			MODULES.portal.portalUniverse = game.global.universe;
			while (portalUniverse !== 1) swapPortalUniverse();
		}
	}

	downloadSave();
	if (typeof Graphs !== 'undefined' && typeof Graphs.Push !== 'undefined' && typeof Graphs.Push.zoneData === 'function') Graphs.Push.zoneData();
	if (!MODULES.portal.dontPushData) pushSpreadsheetData();

	const trackerValue = owned === 10 ? Math.floor(tracker / 10) : tracker / 10;
	if (challengeSquaredMode) toggleChallengeSquared();
	if (game.global.selectedChallenge !== '') selectChallenge(0);
	activatePortal();
	resetVarsZone(true, false);

	let portalText = 'Portaling ';

	if (portalRespec === 1) {
		portalText += 'to refresh respec.';
		MODULES.portal.portalForRespec = true;
	} else {
		MODULES.portal.portalForVoid = true;
		portalText += `to increment void tracker (currently ${trackerValue}/10) with liquification.`;
	}

	debug(portalText, 'portal');
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

	MODULES.portal.portalUniverse = newUniverse;
	MODULES.portal.portalForVoid = false;
	MODULES.portal.portalForRespec = false;

	if (newUniverse !== portalUniverse) {
		MODULES.portal.forcePortal = true;
		autoPortal(game.global.world, newUniverse, undefined, true);
	}
}

function _c2RunnerCheck(portalCheck = false, universe = portalUniverse) {
	const highestZone = universe === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();
	if ((universe === 1 && highestZone < 65) || (universe === 2 && highestZone < 50)) return;
	if (portalCheck && !getPageSetting('c2RunnerStart', universe)) return;

	const challengeOrders = {
		dualC2: ['Waze', 'Enlightened', 'Nometal', 'Toxad', 'Paralysis', 'Topology'],
		dualC3: [],
		1: ['Size', 'Slow', 'Watch', 'Discipline', 'Balance', 'Meditate', 'Metal', 'Lead', 'Nom', 'Toxicity', 'Electricity', 'Coordinate', 'Trimp', 'Obliterated', 'Eradicated', 'Mapology', 'Trapper'],
		2: ['Unlucky', 'Storm', 'Unbalance', 'Quest', 'Downsize', 'Transmute', 'Duel', 'Wither', 'Glass', 'Smithless', 'Berserk', 'Trappapalooza']
	};

	/* insert dual challenges into the item list */
	challengeOrders[universe] = [...challengeOrders[`dualC${universe + 1}`].filter((item) => !challengeOrders[universe].includes(item)), ...challengeOrders[universe]];

	const hze = universe === 1 ? game.stats.highestLevel.valueTotal() : game.stats.highestRadLevel.valueTotal();
	const runType = getPageSetting('c2RunnerMode', universe);
	const unlockedC2s = filterAndSortChallenges(challengesUnlockedObj(universe, false, false), 'c2');
	const c2Setting = getPageSetting('c2RunnerSettings', universe);

	let challengeArray = [];
	for (let challenge in c2Setting) {
		if (typeof c2Setting[challenge] === 'undefined') continue;
		if (unlockedC2s.indexOf(challenge) === -1) continue;
		if (!c2Setting[challenge].enabled) continue;

		const { percent, zone, zoneHZE } = c2Setting[challenge];
		if (runType === 0 && (zoneHZE === 0 || percent === 0)) continue;
		if (runType === 1 && zone <= 0) continue;
		challengeArray.push(challenge);
	}
	challengeArray = challengeOrders[universe].filter((item) => challengeArray.includes(item) && unlockedC2s.includes(item));

	const toRunList = [];
	/* 	looping through challenge array to figure out if things should be run. */
	for (let x = 0; x < challengeArray.length; x++) {
		const challengeName = challengeArray[x];
		if (!unlockedC2s.includes(challengeName)) continue;

		const challenge = game.challenges[challengeName];
		const challengeList = challenge.multiChallenge ? challenge.multiChallenge : [challengeName];

		let challengeLevel = 0;
		for (let y = 0; y < challengeList.length; y++) {
			if (challengeLevel > 0) {
				const secondChallenge = game.c2[challengeList[y]];
				challengeLevel = Math.min(challengeLevel, secondChallenge);
			} else {
				challengeLevel += game.c2[challengeList[y]];
				if (challengeActive('Obliterated') || challengeActive('Eradicated')) challengeLevel = Math.max(game.global.world, game.c2[challengeList[y]]);
			}
		}

		let shouldRun = false;
		const { percent, zone, zoneHZE } = c2Setting[challengeName];

		if (runType === 0) {
			const portalZone = hze * (zoneHZE / 100 || 0.95);
			if (challengeLevel >= portalZone) continue;

			const runPercent = percent / 100 || 0.85;
			shouldRun = challengeLevel / highestZone < runPercent;
		} else {
			shouldRun = challengeLevel < zone;
		}

		if (!shouldRun || challengeActive(challengeName)) continue;
		if (portalCheck) return challengeName;
		toRunList.push(challengeName);
	}

	return { challengeArray, toRunList };
}

function _autoPortalC2() {
	if (!game.global.portalActive || !portalWindowOpen) return;

	const challenge = _c2RunnerCheck(true);
	if (!challenge || typeof challenge === 'object') return;

	const universePrefix = portalUniverse === 2 ? 'C3' : 'C2';
	if (Array.isArray(challenge)) return `${universePrefix} Runner: All ${universePrefix}'s above level threshold!`;

	if (!challengeSquaredMode) toggleChallengeSquared();
	selectChallenge(challenge);
	return `${universePrefix} Runner: Starting ${challenge}`;
}

function _autoPortalDaily(challenge, portalUniverse) {
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
		return [`All dailies have been completed.`, challenge];
	}

	if ((MODULES.portal.currentChallenge === 'Daily' && (!getPageSetting('dailyPortalStart', portalUniverse) || getPageSetting('dailyPortalFiller', portalUniverse))) || lastUndone === 1) {
		MODULES.portal.currentChallenge = 'None';
		MODULES.portal.portalUniverse = portalUniverse;
		autoPortal(game.global.world, portalUniverse, true);
		return challenge;
	}

	if (!dailyAvailable) {
		return challenge;
	}

	if (portalUniverse > 1 && getPageSetting('dailyPortalPreviousUniverse', portalUniverse) && dailyAvailable) {
		swapPortalUniverse();
	}

	selectChallenge('Daily');
	getDailyChallenge(lastUndone);
	const dailyString = getDailyTimeString(lastUndone, true);
	const dayName = dayOfWeek(getDailyTimeString(lastUndone, false, true)).slice(0, -1);
	return [`Portaling into ${dayName}ily (${dailyString})`, 'Daily'];
}

function _autoPortalRegular(challengeName) {
	if (challengeName.includes('Challenge ')) {
		challengeName = getPageSetting('heliumC2Challenge', portalUniverse) === 'None' ? 0 : getPageSetting('heliumC2Challenge', portalUniverse);
		if (challengeName !== 0 && game.challenges[challengeName].allowSquared) toggleChallengeSquared();
	}

	if (!document.getElementById(`challenge${challengeName}`)) return;
	selectChallenge(challengeName);

	return challengeName;
}

function _checkForPlaguedDaily() {
	const dailyElem = document.getElementById('specificChallengeDescription');
	if (!dailyElem || !dailyElem.childNodes[2]) return false;

	const description = dailyElem.childNodes[2];
	for (item in description.childNodes) {
		const modifier = description.childNodes[item].innerHTML;
		if (modifier && modifier.includes('Enemies stack a debuff with each attack, damaging Trimps for')) {
			return true;
		}
	}

	return false;
}

function _autoPortalActivate(challenge) {
	const currPreset = $$('#preset').value;
	const postPortalRespec = portalPerkCalc(currPreset);

	let preset = 0;
	if (portalUniverse === 2) {
		hypoPackratReset(challenge);

		const mutatorPresets = JSON.parse(localStorage.getItem('mutatorPresets'));
		if (mutatorPresets && mutatorPresets[`Preset ${preset}`] !== '' && getPageSetting('presetSwapMutators', 2)) {
			u2Mutations.toggleRespec();
		}
	}

	//Download save, push graphs data, push to spreadsheet for select users, activate portal, reset vars, and load mutators if necessary.
	downloadSave();
	if (typeof Graphs !== 'undefined' && typeof Graphs.Push !== 'undefined' && typeof Graphs.Push.zoneData === 'function') Graphs.Push.zoneData();
	if (!MODULES.portal.dontPushData) pushSpreadsheetData();
	activatePortal();
	autoUpgradeHeirlooms();

	resetVarsZone(true);
	_setButtonsPortal();
	setupAddonUser(true);

	if (postPortalRespec && (challengeActive('Trapper') || challengeActive('Trappapalooza'))) {
		viewPortalUpgrades();
		respecPerks();
		const presetFunction = portalUniverse === 1 ? fillPresetPerky : fillPresetSurky;
		presetFunction(postPortalRespec);
		const allocateFunction = portalUniverse === 1 ? allocatePerky : runSurky;
		allocateFunction(false);
		presetFunction(currPreset);
		activateClicked();
	}
}

function portalPerkCalc(currPreset = $$('#preset').value) {
	const fillerC2 = getPageSetting('c2Filler');
	const fillerOneOff = getPageSetting('oneOffFiller');
	let preset;
	let trapperRespec = false;

	const presetFunction = portalUniverse === 1 ? fillPresetPerky : fillPresetSurky;
	const allocateFunction = portalUniverse === 1 ? allocatePerky : runSurky;

	if (getPageSetting('presetSwap', portalUniverse)) {
		if (portalUniverse === 1) {
			if (game.global.selectedChallenge === 'Trappapalooza' && game.global.canRespecPerks) {
				trapperRespec = 'trapper';
				preset = 'carp';
			} else if (game.global.selectedChallenge === 'Metal' || game.global.selectedChallenge === 'Nometal') preset = 'metal';
			else if (game.global.selectedChallenge === 'Scientist') preset = 'scientist';
			else if (game.global.selectedChallenge === 'Trimp') preset = 'trimp';
			else if (game.global.selectedChallenge === 'Coordinate') preset = 'coord';
			else if (game.global.selectedChallenge === 'Experience') preset = 'experience';
			else if (!fillerC2 && (game.global.selectedChallenge === 'Frigid' || challengeSquaredMode)) preset = 'c2';
			else if (!fillerOneOff && autoPortalChallenges('oneOff').slice(1).indexOf(game.global.selectedChallenge) > 0 && !challengeSquaredMode) preset = 'c2';
			else {
				/* if a specific challenge isn't selected then we'll use the highest zone cleared to determine which preset to use. */
				[].slice.apply(document.querySelectorAll('#preset > *')).forEach(function (option) {
					if (parseInt(option.innerHTML.toLowerCase().replace(/[z+]/g, '').split('-')[0]) < game.global.highestLevelCleared) preset = option.value;
				});
			}
		}

		if (portalUniverse === 2) {
			if (game.global.selectedChallenge === 'Trappapalooza' && game.global.canRespecPerks && getPageSetting('trapperRespec')) {
				trapperRespec = 'trappa';
				preset = 'trappacarp';
			} else if (game.global.selectedChallenge === 'Downsize') preset = 'downsize';
			else if (game.global.selectedChallenge === 'Duel') preset = 'duel';
			else if (game.global.selectedChallenge === 'Berserk') preset = 'berserk';
			else if (game.global.selectedChallenge === 'Alchemy') preset = 'alchemy';
			else if (game.global.selectedChallenge === 'Smithless') preset = 'smithless';
			else if (!fillerC2 && challengeSquaredMode) preset = 'push';
			else if (game.global.selectedChallenge === 'Daily') preset = 'tufarm';
			else if (!fillerOneOff && autoPortalChallenges('oneOff').slice(1).indexOf(game.global.selectedChallenge) > 0 && !challengeSquaredMode) preset = 'push';
			else preset = 'ezfarm';
		}
	}

	if (typeof atData.autoPerks !== 'undefined' && getPageSetting('autoPerks', portalUniverse)) {
		presetFunction(preset);
		allocateFunction(false);
		presetFunction(currPreset);
		return trapperRespec;
	}
}

function decayFinishChallenge() {
	const challengeName = game.global.universe === 2 ? 'Melt' : 'Decay';
	if (!challengeActive(challengeName) || !getPageSetting('decay')) return;

	const challenge = game.challenges[challengeName];
	const currentStacks = challenge ? challenge.stacks : 0;
	const maxStacks = challengeName === 'Melt' ? 500 : 999;
	const stacksToAbandon = Math.min(getPageSetting('decayStacksToAbandon'), maxStacks);

	if (stacksToAbandon > 0 && currentStacks >= stacksToAbandon) {
		abandonChallenge();
		debug(`Finished ${challengeName} challenge because we had more than ${stacksToAbandon} stacks.`, 'general', 'oil');
	}
}

function dailyFinishChallenge() {
	if (!challengeActive('Daily') || getPageSetting('dailyPortal') !== 3) return;

	const endZone = getPageSetting('dailyAbandonZone');
	if (endZone > 0 && game.global.world >= endZone) {
		_autoPortalAbandonChallenge(false);
		debug(`Finished ${'Daily'} challenge because we reached zone ${endZone}.`, 'general', 'oil');
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

	const liqZoneActive = liquifiedZone();
	const liqZones = checkLiqZoneCount();
	const liqFreq = Math.floor((liqZones - 1) / 5) || 3;
	const displayMsg = (liqZoneActive && game.global.world % liqFreq === 0) || (!liqZoneActive && game.global.world % 4 === 0 && game.global.world < liqZones + 10);

	if (force || game.global.world === 1 || displayMsg) {
		if (challengeActive('Daily') && getPageSetting('mapOddEvenIncrement') && dailyOddOrEven().active) {
			debug(`Be aware that with the Odd/Even Increment setting enabled mapping can be delayed by a zone since your daily has either a positive or negative zone modifier.`, 'challenge');
		}

		if (challengeActive('Metal') || challengeActive('Transmute')) {
			debug(`Whilst running this challenge any metal map caches will be set to wooden caches and any miner job ratios will be set to lumberjack ratios. Additionally Pre Void Farm${game.global.universe === 2 ? ' and Smithy Farm' : ''} will be disabled.`, 'challenge');
		}

		if (challengeActive('Mapology') && !getPageSetting('mapology')) {
			debug(`You have the AutoTrimps setting for Mapology disabled which would be helpful with limiting the amount of map credits spent on mapping & raiding.`, 'challenge');
		}

		if ((challengeActive('Experience') && getPageSetting('experience') && getPageSetting('experienceC2')) || challengeActive('Frigid') || challengeActive('Mayhem') || challengeActive('Desolation')) {
			debug(`Be aware that the script classes this challenge as a C2 for all settings.`, 'challenge');
		}

		if (challengeActive('Downsize')) {
			debug(`Be aware that since your normal farming settings will not properly work due to reduced population and lower expected end zone any mapping lines that aren't specific to this challenge won't run.`, 'challenge');
		}

		if (_noMappingChallenges()) {
			debug(`Be aware that since the mapping you will do during this challenge is different from other challenges any mapping lines that aren't specific to this challenge won't run.`, 'challenge');
			if (noBreedChallenge()) debug(`Map Bonus, Prestige Climb, and the standalone HD Farm and Hits Survived settings won't start running unless your army is dead, you're in the map chamber or maps during this challenge.`, 'challenge');
		}

		if (challengeActive('Quest') && getPageSetting('quest') && getPageSetting('buildingsType')) {
			const autoStructureSettings = getAutoStructureSetting();
			if (autoStructureSettings && autoStructureSettings.Smithy && autoStructureSettings.enabled && autoStructureSettings.Smithy.enabled) {
				debug(`You have the setting for Smithy autopurchase enabled in the AutoStructure settings. This setting has the chance to cause issues later in the run.`, 'challenge');
			}
			if (game.global.runningChallengeSquared && (getPageSetting('questSmithyZone') === -1 ? Infinity : getPageSetting('questSmithyZone')) <= game.c2.Quest) {
				debug(`The setting 'Q: Smithy Zone' is lower or equal to your current Quest HZE. Increase this or smithies might be purchased earlier than they should be.`, 'challenge');
			}
		}

		if (challengeActive('Pandemonium')) {
			debug(`Be aware that the script classes this challenge as a C2 for all settings when and your usual farming settings might not work properly due to the map resource shred mechanic so you might want to amend or disable them. Additionally Smithy Farm is disabled when running this challenge.`, 'challenge');
		}
	}
}

function c2FinishZone() {
	let finishChallenge = Infinity;

	if (getPageSetting('c2RunnerStart')) {
		const hze = game.global.universe === 1 ? game.stats.highestLevel.valueTotal() : game.stats.highestRadLevel.valueTotal();
		const c2RunnerMode = getPageSetting('c2RunnerMode');
		const c2RunnerSettings = getPageSetting('c2RunnerSettings')[game.global.challengeActive];

		if (c2RunnerSettings && c2RunnerSettings.enabled) finishChallenge = c2RunnerMode === 0 ? hze * (c2RunnerSettings.zoneHZE / 100) : c2RunnerSettings.zone;
	} else {
		finishChallenge = getPageSetting('c2Finish');
	}

	return finishChallenge <= 0 ? Infinity : finishChallenge;
}

function finishChallengeSquared(onlyDebug) {
	debug(`Finished ${game.global.challengeActive} at zone ${game.global.world}`, 'challenge', 'oil');
	if (onlyDebug) return;
	abandonChallenge();
	cancelTooltip();
}

function resetVarsZone(loadingSave, notRespec = true) {
	if (loadingSave) {
		/* maps */
		MODULES.maps.lastMapWeWereIn = { id: 0 };
		MODULES.maps.mapTimer = 0;
		MODULES.maps.fragmentFarming = false;
		MODULES.maps.lifeActive = false;
		MODULES.maps.lifeCell = 0;
		MODULES.maps.slowScumming = false;
		/* mapFunctions */
		MODULES.mapFunctions.afterVoids = false;
		game.global.addonUser.mapFunctions.afterVoids = false;
		MODULES.mapFunctions.isHealthFarming = '';
		MODULES.mapFunctions.hasHealthFarmed = '';
		MODULES.mapFunctions.hasVoidFarmed = '';
		MODULES.mapFunctions.hypoPackrat = false;
		MODULES.mapFunctions.desoGearScum = false;

		atConfig.portal.currentworld = 0;
		atConfig.portal.lastrunworld = 0;
		atConfig.portal.aWholeNewWorld = false;
		atConfig.portal.currentHZE = 0;
		atConfig.portal.lastHZE = 0;

		atData.fightInfo.lastProcessedWorld = 0;
		MODULES.portal.afterVoids = false;
		MODULES.portal.afterPoisonVoids = false;
		MODULES.portal.zonePostpone = 0;

		MODULES.popups.challenge = false;
		MODULES.popups.respecAncientTreasure = false;
		MODULES.popups.remainingTime = Infinity;
		MODULES.popups.intervalID = null;
		MODULES.popups.portal = false;
		MODULES.popups.mazWindowOpen = false;
		clearTimeout(MODULES.portal.heHrTimeout);

		_hideAutomationButtons();

		if (notRespec) {
			MODULES.portal.forcePortal = false;
			MODULES.portal.portalForRespec = false;
			MODULES.portal.portalForVoid = false;
			MODULES.portal.portalUniverse = Infinity;

			MODULES.portal.currentChallenge = 'None';
			MODULES.portal.dontPushData = false;
			MODULES.portal.dailyMods = '';
			MODULES.portal.dailyPercent = 0;
		}
	}

	/* maps */
	MODULES.maps.mapRepeats = 0;
	MODULES.maps.mapRepeatsSmithy = [0, 0, 0];
	MODULES.maps.fragmentCost = Infinity;

	MODULES.mapFunctions.runUniqueMap = '';
	MODULES.mapFunctions.questRun = false;

	delete mapSettings.voidHDIndex;
	MODULES.heirlooms.plagueSwap = false;
	MODULES.heirlooms.compressedCalc = false;
	//General
	mapSettings.levelCheck = Infinity;
	mapSettings.levelData = [];
	//Challenge Repeat
	trimpStats = new TrimpStats();
	hdStats = new HDStats();

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
	const portalWindow = portalWindowOpen;
	if (portalWindow) {
		cancelTooltip();
		cancelPortal();
	}
	if (!game.global.viewingUpgrades) viewPortalUpgrades();
	if (game.global.canRespecPerks) respecPerks();

	const currPreset = $$('#preset').value;
	const presetFunction = game.global.universe === 1 ? fillPresetPerky : fillPresetSurky;
	const allocateFunction = game.global.universe === 1 ? allocatePerky : runSurky;

	const presetName = game.global.universe === 1 ? 'spire' : trimpStats.isC3 || trimpStats.isOneOff ? 'combat' : 'combatRadon';
	presetFunction(presetName);

	allocateFunction();
	fireAllWorkers();
	activateClicked();

	const calcName = game.global.universe === 2 ? 'Surky' : 'Perky';
	const respecPresetName = $$('#preset')[$$('#preset').selectedIndex].innerHTML;
	debug(`${calcName} - Respeccing into the ${respecPresetName} preset.`, 'portal');
	presetFunction(currPreset);

	if (portalWindow) portalClicked();
}

//Force tooltip appearance for Surky combat respec post Atlantrimp
function atlantrimpRespecMessage(cellOverride) {
	if (!game.global.canRespecPerks) return;
	/* stop this from running if we're in U1 and not at the highest Spire reached. */
	if (game.global.universe === 1 && (!game.global.spireActive || game.global.world < Math.floor((getHighestLevelCleared() + 1) / 100) * 100)) return;
	if (typeof atData.autoPerks === 'undefined') return;

	/* stop it running if we aren't above the necessary cell for u1 */
	if (!cellOverride) {
		/* if we have just toggled the setting, wait 5 seconds before running this. */
		if (atConfig.timeouts.respec) return;
		/* this variable is reset when changing the "presetCombatRespecCell" settings input. */
		if (MODULES.portal.disableAutoRespec === getTotalPortals()) return;
		const cell = getPageSetting('presetCombatRespecCell');
		if (cell <= 0) return;
		if (game.global.lastClearedCell + 2 < cell) return;
		MODULES.portal.disableAutoRespec = getTotalPortals();
	}

	MODULES.popups.respecAncientTreasure = false;

	const respecSetting = getPageSetting('presetCombatRespec');
	let presetName = !trimpStats.isC3 && !trimpStats.isOneOff ? 'Radon ' : '' + 'Combat Respec';
	if (game.global.universe === 1) presetName = 'Spire';

	if (respecSetting === 2) {
		MODULES.popups.respecAncientTreasure = true;
		MODULES.popups.remainingTime = MODULES.portal.timeout;
		tooltipAT('Ancient Treasure Respec', undefined, (MODULES.popups.remainingTime / 1000).toFixed(1), presetName, '');
		setTimeout(combatRespec, MODULES.portal.timeout);
	} else if (respecSetting === 1) {
		/* if setting is disabled, show tooltip to allow for respec after Atlantrimp has been run */
		const mapName = game.global.universe === 2 ? 'Atlantrimp' : 'Trimple Of Doom';
		const description = '<p>Click <b>Force Respec</b> to respec into the <b>' + presetName + '</b> preset.</p>';
		tooltip('confirm', null, 'update', description, 'MODULES.popups.respecAncientTreasure = true; combatRespec()', '<b>Post ' + mapName + ' Respec</b>', 'Force Respec');
	}
}

function _setButtonsPortal(onPortal = true) {
	if (onPortal && getPageSetting('autoMapsPortal') && !getPageSetting('autoMaps')) {
		setPageSetting('autoMaps', 1, game.global.universe);
	}
	_setAutoMapsClasses();

	if (onPortal && getPageSetting('equipPortal') && !getPageSetting('equipOn')) {
		setPageSetting('equipOn', true, game.global.universe);
	}
	_setAutoEquipClasses();

	const autoStructureSettings = getPageSetting('buildingSettingsArray');
	if (onPortal && typeof autoStructureSettings.portalOption !== 'undefined' && autoStructureSettings.portalOption !== '0') {
		setPageSetting('buildingsType', autoStructureSettings.portalOption === 'on', game.global.universe);
	}
	_setBuildingClasses();

	const autoJobsSettings = getPageSetting('jobSettingsArray');
	if (onPortal && typeof autoJobsSettings.portalOption !== 'undefined' && autoJobsSettings.portalOption !== '0') {
		const portalOptionMapping = {
			'Auto Jobs: Off': 0,
			'Auto Jobs: On': 1,
			'Auto Jobs: Manual': 2
		};

		if (portalOptionMapping.hasOwnProperty(autoJobsSettings.portalOption)) {
			setPageSetting('jobType', portalOptionMapping[autoJobsSettings.portalOption], game.global.universe);
		}
	}

	_setAutoJobsClasses();
	saveSettings();
}

function autoPortalForce(runVoids = false, poisonVoids = false) {
	if (!game.global.portalActive) return;

	mapSettings.portalAfterVoids = true;
	MODULES.mapFunctions.afterVoids = true;
	MODULES.portal.forcePortal = true;

	if (runVoids && game.global.totalVoidMaps > 0) {
		if (game.global.runningChallengeSquared) finishChallengeSquared(challengeActive('Obliterated') || challengeActive('Eradicated'));
		if (poisonVoids) MODULES.portal.afterPoisonVoids = true;
		MODULES.portal.afterVoids = true;
		return;
	}

	game.global.totalVoidMaps = 0;
	autoPortalCheck(game.global.world);
}
