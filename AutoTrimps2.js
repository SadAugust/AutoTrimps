atSettings = {
	initialise: {
		version: '',
		basepath: 'https://SadAugust.github.io/AutoTrimps/',
		basepathOriginal: 'https://SadAugust.github.io/AutoTrimps/',
		loaded: false
	},
	modules: {
		path: 'modules/',
		installedMain: ['versionNumber', 'SettingsGUI'],
		loadedMain: [],
		installedModules: ['import-export', 'query', 'modifyGameFunctions', 'mapFunctions', 'calc', 'portal', 'upgrades', 'heirloomCalc', 'heirlooms', 'buildings', 'jobs', 'equipment', 'gather', 'stance', 'maps', 'breedtimer', 'combat', 'scryer', 'magmite', 'nature', 'other', 'surky', 'perky', 'fight-info', 'performance', 'bones', 'MAZ', 'minigames', 'utils', 'mutatorPreset', 'farmCalc'],
		loadedModules: [],
		loadedExternal: []
	},
	updateAvailable: false,
	running: true,
	runInterval: 100,
	portal: { currentworld: 0, lastrunworld: 0, aWholeNewWorld: false, currentHZE: 0, lastHZE: 0, aWholeNewHZE: false },
	loops: { atTimeLapseFastLoop: false, mainLoopInterval: null, guiLoopInterval: null },
	intervals: { counter: 0, oneSecond: false, twoSecond: false, fiveSecond: false, sixSecond: false, tenSecond: false, thirtySecond: false, oneMinute: false, tenMinute: false },
	autoSave: game.options.menu.autoSave.enabled
};

ATmessageLogTabVisible = true;
autoTrimpSettings = {};
MODULES = {
	popups: { challenge: false, respecAtlantrimp: false, remainingTime: Infinity, intervalID: null, portal: false, mazWindowOpen: false },
	stats: { baseMinDamage: 0, baseMaxDamage: 0, baseDamage: 0, baseHealth: 0, baseBlock: 0 },
	graphs: {},
	u1unlocks: [],
	u2unlocks: []
};

currPortalUniverse = 0;
currSettingUniverse = 0;
settingChangedTimeout = false;

mapSettings = { shouldRun: false, mapName: '', levelCheck: Infinity };
hdStats = {};
trimpStats = { isC3: false, isDaily: false, isFiller: false, mountainPriority: false };

function loadScript(url, type = 'text/javascript', retries = 3) {
	return new Promise((resolve, reject) => {
		if (retries < 1) {
			reject(`Failed to load script ${url} after multiple attempts`);
			return;
		}

		const script = document.createElement('script');
		script.src = url;
		script.type = type;
		script.onload = () => {
			atSettings.modules.loadedExternal.push(url);
			resolve();
		};
		script.onerror = () => {
			console.log(`Failed to load script ${url}. Retries left: ${retries - 1}`);
			loadScript(url, type, retries - 1)
				.then(resolve)
				.catch(reject);
		};
		document.head.appendChild(script);
	});
}

function loadStylesheet(url, rel = 'stylesheet', type = 'text/css', retries = 3) {
	return new Promise((resolve, reject) => {
		if (retries < 1) {
			reject(`Failed to load stylesheet ${url} after multiple attempts`);
			return;
		}

		const link = document.createElement('link');
		link.href = url;
		link.rel = rel;
		link.type = type;
		link.onload = () => {
			atSettings.modules.loadedExternal.push(url);
			resolve();
		};
		link.onerror = () => {
			console.log(`Failed to load stylesheet ${url}. Retries left: ${retries - 1}`);
			loadStylesheet(url, rel, type, retries - 1)
				.then(resolve)
				.catch(reject);
		};
		document.head.appendChild(link);
	});
}

//Loading modules from basepath that are required for the script to run.
function loadModules(fileName, prefix = '') {
	if (prefix && atSettings.modules.loadedModules.includes(fileName)) {
		return;
	}

	const script = document.createElement('script');
	script.src = `${atSettings.initialise.basepath}${prefix}${fileName}.js`;
	script.id = `${fileName}_MODULE`;
	script.async = false;
	script.defer = true;

	script.addEventListener('load', () => {
		if (!atSettings.modules.loadedModules.includes(fileName) && !atSettings.modules.loadedMain.includes(fileName)) {
			if (prefix) atSettings.modules.loadedModules = [...atSettings.modules.loadedModules, fileName];
			else atSettings.modules.loadedMain = [...atSettings.modules.loadedMain, fileName];
		}
	});

	document.head.appendChild(script);
}

function loadScriptsAT() {
	console.time();
	//The basepath variable is used in graphs, can't remove this while using Quias graphs fork unless I copy code and change that line for every update.
	basepath = atSettings.initialise.basepathOriginal + 'css/';
	const scripts = Array.from(document.getElementsByTagName('script'));
	const autoTrimpsScript = scripts.find((script) => script.src.includes('AutoTrimps2'));

	if (autoTrimpsScript) atSettings.initialise.basepath = autoTrimpsScript.src.replace(/AutoTrimps2\.js$/, '');
	loadModules('versionNumber');

	atSettings.modules.installedModules.forEach((module) => {
		loadModules(`${module}`, `${atSettings.modules.path}`);
	});
	loadModules('SettingsGUI');

	(async function () {
		try {
			await loadScript('https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js');
			await loadStylesheet('https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css');
			await loadStylesheet(atSettings.initialise.basepathOriginal + 'css/tabs.css');
			await loadScript('https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js');
			if (typeof formatters !== 'object') await loadScript('https://Quiaaaa.github.io/AutoTrimps/Graphs.js');
		} catch (error) {
			console.error('Error loading script or stylesheet:', error);
		}
	})();

	initialiseScript();
}

loadScriptsAT();

function initialiseScript() {
	const filesNotLoaded = {
		main: atSettings.modules.installedMain.length > atSettings.modules.loadedMain.length,
		modules: atSettings.modules.installedModules.length > atSettings.modules.loadedModules.length,
		externalScripts: 5 > atSettings.modules.loadedExternal.length
	};

	if (Object.values(filesNotLoaded).some(Boolean)) {
		atSettings.intervals.counter++;
		if (atSettings.intervals.counter % 500 === 0) return loadScriptsAT();
		return setTimeout(initialiseScript, 1);
	}

	_loadAutoTrimpsSettings();
	automationMenuSettingsInit();
	initialiseAllTabs();
	initialiseAllSettings();
	_raspberryPiSettings();
	updateATVersion();

	const gammaBurstPct = getHeirloomBonus('Shield', 'gammaBurst') / 100;
	MODULES.heirlooms.gammaBurstPct = gammaBurstPct > 0 ? gammaBurstPct : 1;
	trimpStats = new TrimpStats(true);
	hdStats = new HDStats(true);
	autoMapsStatus();

	if (usingRealTimeOffline) {
		if (game.options.menu.offlineProgress.enabled === 1) removeTrustworthyTrimps();
		cancelTooltip();
	}

	localStorage.setItem('mutatorPresets', autoTrimpSettings.mutatorPresets.valueU2);
	//Setup Perky/Surky UI
	universeSwapped();
	loadAugustSettings();
	currSettingUniverse = autoTrimpSettings.universeSetting.value + 1;
	challengeInfo(true);
	_setupATButtons();

	//Copy gameLoop for when we enter toggleCatchUpMode.
	originalGameLoop = gameLoop;
	toggleCatchUpMode();
	atSettings.initialise.loaded = true;
	debug(`AutoTrimps (${atSettings.initialise.version.split(' ')[0]} ${atSettings.initialise.version.split(' ')[1]}) has finished loading.`);
	console.timeEnd();
}

//Displays Perky UI when changing universes.
function universeSwapped() {
	//Hard to do an alternative to this. Would have linked it to the swapPortalUniverse() function but the force going back to U1 button in U2 causes issues with that.
	//Sets up the proper calc UI when switching between portal universes.
	if (currPortalUniverse !== portalUniverse) {
		if (portalUniverse === -1) portalUniverse = game.global.universe;
		MODULES.autoPerks.displayGUI(portalUniverse);
		currPortalUniverse = portalUniverse;
	}
}

function startStopLoop(loopName, action) {
	if (atSettings.loops[loopName]) {
		clearInterval(atSettings.loops[loopName]);
		atSettings.loops[loopName] = null;
	}

	if (action !== 'start') return;

	const interval = atSettings.runInterval * (loopName === 'guiLoop' ? 10 : 1);
	atSettings.loops[loopName] = setInterval(window[loopName], interval);
}

function resetLoops() {
	['mainLoop', 'guiLoop'].forEach((loop) => startStopLoop(loop, 'stop'));
	atSettings.loops.atTimeLapseFastLoop = false;
	gameLoop = originalGameLoop;
	['mainLoop', 'guiLoop'].forEach((loop) => startStopLoop(loop, 'start'));
}

function toggleCatchUpMode() {
	if (!atSettings.loops.mainLoop && !atSettings.loops.guiLoop && !atSettings.loops.atTimeLapseFastLoop) {
		['mainLoop', 'guiLoop'].forEach((loop) => startStopLoop(loop, 'start'));
	}

	if (usingRealTimeOffline) {
		if (atSettings.running === false || game.options.menu.pauseGame.enabled || getPageSetting('pauseScript', 1) || !getPageSetting('timeWarpSpeed')) {
			if (usingRealTimeOffline && atSettings.loops.atTimeLapseFastLoop) {
				resetLoops();
				debug('Disabled Time Warp functionality.', 'offline');
			}
			return;
		}
	}

	if (!usingRealTimeOffline && atSettings.loops.atTimeLapseFastLoop) {
		resetLoops();
	} else if (usingRealTimeOffline && !atSettings.loops.atTimeLapseFastLoop) {
		['mainLoop', 'guiLoop'].forEach((loop) => startStopLoop(loop, 'stop'));
		gameLoop = function (makeUp, now) {
			originalGameLoop(makeUp, now);

			updateInterval();
			if (atSettings.intervals.thirtyMinute && getPageSetting('timeWarpSaving')) _timeWarpSave();
			mainCleanup();
			if (game.global.mapsActive && getPageSetting('timeWarpDisplay')) _adjustGlobalTimers(['mapStarted'], -100);
			if (loops % getPageSetting('timeWarpFrequency') === 0 || atSettings.portal.aWholeNewWorld || checkIfLiquidZone()) {
				mainLoop();
			} else if (atSettings.intervals.thirtySecond) {
				trimpStats = new TrimpStats();
				hdStats = new HDStats();
			}

			if (loops % 600 === 0) _timeWarpUpdateUIDisplay();
			//Fix bug that is caused by this not running when the game is in offline mode
			else _timeWarpUpdateEquipment();
			_timeWarpATFunctions();
		};

		_setTimeWarpUI();
		_timeWarpAutoSaveSetting();
		const timeWarpTime = offlineProgress.formatTime(Math.floor(offlineProgress.totalOfflineTime / 1000));
		debug(`TimeLapse Mode Enabled. Your Time Warp duration is ${timeWarpTime}.`, 'offline');
		if (getPageSetting('timeWarpDisplay')) {
			tooltip(`Time Warp`, `customText`, `lock`, `Your Time Warp duration is ${timeWarpTime}. As you have the ${autoTrimpSettings.timeWarpDisplay.name()} setting enabled you have no visible timer but you can see the progress percent in the AutoMaps status bar at the bottom of the battle container.`, false, `center`);
		}
	}
}

//Offline mode check
function shouldRunInTimeWarp() {
	return !atSettings.loops.atTimeLapseFastLoop || (usingRealTimeOffline && !getPageSetting('timeWarpSpeed'));
}

function updateInterval() {
	atSettings.intervals.counter++;

	const intervals = {
		oneSecond: 1000,
		twoSecond: 2000,
		fiveSecond: 5000,
		sixSecond: 6000,
		tenSecond: 10000,
		thirtySecond: 30000,
		oneMinute: 60000,
		tenMinute: 600000,
		thirtyMinute: 1800000
	};

	for (let key in intervals) {
		atSettings.intervals[key] = atSettings.intervals.counter % (intervals[key] / atSettings.runInterval) === 0;
	}
}

function mainLoop() {
	toggleCatchUpMode();

	if (MODULES.popups.mazWindowOpen) {
		_handleMazWindow();
	}

	remakeTooltip();
	universeSwapped();

	if (atSettings.running === false) return;
	if (getPageSetting('pauseScript', 1) || game.options.menu.pauseGame.enabled) return;
	atSettings.running = true;
	const runDuringTimeWarp = shouldRunInTimeWarp();
	if (runDuringTimeWarp) updateInterval();

	_handleIntervals();
	if (runDuringTimeWarp) farmingDecision();

	if (runDuringTimeWarp) mainCleanup();

	if (_handleSlowScumming()) return;

	if (MODULES.heirlooms.shieldEquipped !== game.global.ShieldEquipped.id) heirloomShieldSwapped();

	if (runDuringTimeWarp) {
		autoMaps();
		autoMapsStatus();
	}

	autoGather();

	if (getPageSetting('TrapTrimps') && game.global.trapBuildAllowed && !game.global.trapBuildToggled) toggleAutoTrap();

	buyBuildings();
	buyJobs();
	buyUpgrades();
	heirloomSwapping();
	callBetterAutoFight();
	boneShrine();
	autoGoldUpgrades();
	autoEquip();

	if (runDuringTimeWarp) {
		autoPortalCheck();
		displayMostEfficientEquipment();
	}

	mainLoopU1();
	mainLoopU2();

	buySingleRunBonuses();
	automateSpireAssault();

	_handlePopupTimer();
	makeAdditionalInfo();
}

//U1 functions
function mainLoopU1() {
	if (game.global.universe !== 1) return;
	//Core
	geneAssist();
	autoRoboTrimp();
	autoEnlight();
	autoNatureTokens();
	if (getPageSetting('spendmagmite') === 2 && !settingChangedTimeout) autoMagmiteSpender();
	autoGenerator();
	//Stance
	if (shouldRunInTimeWarp()) checkStanceSetting();
	//Spire. Exit cell & respec
	if (game.global.spireActive) {
		exitSpireCell();
		atlantrimpRespecMessage();
	}
	fluffyEvolution();
}

//U2 functions
function mainLoopU2() {
	if (game.global.universe !== 2) return;
	//Auto Equality Management
	if (shouldRunInTimeWarp()) equalityManagement();
	_alchemyVoidPotions();
}

function guiLoop() {
	if (getPageSetting('displayEnhancedGrid')) {
		MODULES.fightinfo.Update();
	}

	if (MODULES.performance && MODULES.performance.isAFK) {
		MODULES.performance.UpdateAFKOverlay();
	}
}

function updatePortalSettingVars(setting, currentValue) {
	atSettings.portal[setting + 'Last'] = atSettings.portal[setting + 'Current'];
	atSettings.portal[setting + 'Current'] = currentValue;
	atSettings.portal['aWholeNew' + setting] = atSettings.portal[setting + 'Last'] !== atSettings.portal[setting + 'Current'];
}

function updatePortalSettings() {
	updatePortalSettingVars('World', game.global.world);
	updatePortalSettingVars('HZE', game.global.universe === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal());
}

function _handleNewHZE() {
	if (!atSettings.portal.aWholeNewHZE) return;
	_challengeUnlockCheck();
}

function _handleNewWorld() {
	if (!atSettings.portal.aWholeNewWorld) return;
	autoPortalCheck();
	archaeologyAutomator();
	challengeInfo();
	if (atSettings.portal.currentworld === 1) {
		MODULES.mapFunctions.afterVoids = false;
		MODULES.portal.zonePostpone = 0;
		if (!game.upgrades.Battle.done) {
			_setButtonsPortal();
		}
	}
	resetVarsZone();
	setTitle();
	_debugZoneStart();
	if (getPageSetting('autoEggs', 1)) easterEggClicked();
	if (dailyOddOrEven().skipZone) debug('Zone #' + game.global.world + ':  Heirloom swapping and mapping will be affected by Daily Odd/Even.', 'daily');
	if (usingRealTimeOffline && game.global.world === 60) _timeWarpUpdateEquipment();
}

function _debugZoneStart() {
	debug('Starting Zone ' + game.global.world, 'zone');
	debug('Zone #' + game.global.world + ': Tauntimp (' + game.unlocks.impCount.Tauntimp + '), Magnimp (' + game.unlocks.impCount.Magnimp + '), Whipimp (' + game.unlocks.impCount.Whipimp + '), Venimp (' + game.unlocks.impCount.Venimp + ')', 'exotic');
	debug('Zone # ' + game.global.world + ': Total pop (' + prettify(game.resources.trimps.owned) + '). A Bone Charge would give you these resources (' + boneShrineOutput(1).slice(0, -1).toLowerCase() + ')', 'run_Stats');
}

function mainCleanup() {
	updatePortalSettings();
	_handleNewHZE();
	_handleNewWorld();
}

function throwErrorfromMain() {
	throw new Error('We have successfully read the thrown error message out of the main file');
}

async function atVersionChecker() {
	if (atSettings.updateAvailable) return;

	const url = `${atSettings.initialise.basepath}/versionNumber.js`;
	const response = await fetch(url);

	if (response.ok) {
		const text = await response.text();
		const version = text.split("'")[1];

		if (version !== atSettings.initialise.version) {
			if (getPageSetting('updateReload')) {
				save(false, true);
				location.reload();
			}

			atSettings.updateAvailable = true;
			const changeLogBtn = document.getElementById('atChangelog');

			if (changeLogBtn) {
				changeLogBtn.innerHTML += " <span style='color: red; font-weight: bold;'>Update Available!</span>";
			}
		}
	}
}
