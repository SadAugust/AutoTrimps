const atConfig = {
	initialise: {
		version: '',
		basepath: 'https://SadAugust.github.io/AutoTrimps/',
		loaded: false
	},
	modules: {
		path: 'modules/',
		pathMods: 'mods/',
		pathTesting: 'testing/',
		installedMain: ['versionNumber', 'SettingsGUI'],
		loadedMain: [],
		installedMods: ['spireTD', 'heirloomCalc', 'farmCalc', 'mutatorPreset', 'perky', 'surky', 'percentHealth'],
		installedModules: ['import-export', 'utils', 'query', 'modifyGameFunctions', 'mapFunctions', 'calc', 'portal', 'upgrades', 'heirlooms', 'buildings', 'jobs', 'equipment', 'gather', 'stance', 'maps', 'breedtimer', 'combat', 'magmite', 'nature', 'other', 'fight-info', 'performance', 'bones', 'MAZ', 'minigames'],
		installedTesting: ['testChallenges', 'testProfile', 'testSave'],
		loadedExternal: [],
		loadedModules: [],
		loadedMods: [],
		loadedTesting: []
	},
	updateAvailable: false,
	running: true,
	runInterval: 100,
	portal: { currentworld: 0, lastrunworld: 0, aWholeNewWorld: false, currentHZE: 0, lastHZE: 0, aWholeNewHZE: false },
	loops: { atTimeLapseFastLoop: false, mainLoop: null, guiLoop: null, gameLoop: null },
	intervals: { counter: 0, tenthSecond: false, halfSecond: false, oneSecond: false, twoSecond: false, fiveSecond: false, sixSecond: false, tenSecond: false, thirtySecond: false, oneMinute: false, tenMinute: false },
	timeWarp: { loopTicks: 100, updateFreq: 1000, nextUpdate: 1000, loopCount: 0, currentLoops: 0 },
	testing: {},
	autoSave: game.options.menu.autoSave.enabled,
	settingChangedTimeout: false,
	settingUniverse: 0
};

const atData = {};
let autoTrimpSettings = {};
let MODULES = {};
let mapSettings = { shouldRun: false, mapName: '', levelCheck: Infinity };
let hdStats = { autoLevel: Infinity };
let trimpStats = { isC3: false, isDaily: false, isFiller: false, mountainPriority: false, fluffyRewards: { universe: 0, level: 0 } };
var originalGameLoop = gameLoop;

function shouldUpdate(updateEvery = 2000) {
	if (usingRealTimeOffline && loops === atConfig.timeWarp.currentLoops) return true;
	if (usingRealTimeOffline && (atConfig.timeWarp.currentLoops === 0 || loops >= atConfig.timeWarp.currentLoops + updateEvery)) {
		if (updateEvery !== 2000) return true;
		atConfig.timeWarp.currentLoops = loops;
		if (typeof updateAllInnerHtmlFrames === 'function') updateAllInnerHtmlFrames();

		return true;
	}

	return !usingRealTimeOffline;
}

function loadScript(url, type = 'text/javascript', retries = 3) {
	return new Promise((resolve, reject) => {
		if (retries < 1) {
			reject(`Failed to load script ${url} after 3 attempts`);
			return;
		}

		const script = document.createElement('script');
		script.src = url;
		script.type = type;

		script.onload = () => {
			atConfig.modules.loadedExternal.push(url);
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
			reject(`Failed to load stylesheet ${url} after 3 attempts`);
			return;
		}

		const link = document.createElement('link');
		link.href = url;
		link.rel = rel;
		link.type = type;

		link.onload = () => {
			atConfig.modules.loadedExternal.push(url);
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

function isModuleLoaded(fileName, prefix) {
	if (prefix === atConfig.modules.path && atConfig.modules.loadedModules.includes(fileName)) {
		return true;
	} else if (prefix === atConfig.modules.pathMods && atConfig.modules.loadedMods.includes(fileName)) {
		return true;
	} else if (prefix === atConfig.modules.pathTesting && atConfig.modules.loadedTesting.includes(fileName)) {
		return true;
	}

	return false;
}

//Loading modules from basepath that are required for the script to run.
function loadModules(fileName, prefix = '', retries = 3) {
	return new Promise((resolve, reject) => {
		if (prefix) {
			if (prefix && isModuleLoaded(fileName, prefix)) {
				resolve();
				return;
			}
		}

		const script = document.createElement('script');
		script.src = `${atConfig.initialise.basepath}${prefix}${fileName}.js`;
		script.id = `${fileName}_MODULE`;
		script.async = false;
		script.defer = true;

		script.addEventListener('load', () => {
			if (!atConfig.modules.loadedModules.includes(fileName) && !atConfig.modules.loadedMain.includes(fileName)) {
				if (prefix) {
					if (prefix === atConfig.modules.path) atConfig.modules.loadedModules = [...atConfig.modules.loadedModules, fileName];
					else if (prefix === atConfig.modules.pathMods) atConfig.modules.loadedMods = [...atConfig.modules.loadedMods, fileName];
					else atConfig.modules.loadedTesting = [...atConfig.modules.loadedTesting, fileName];
				} else atConfig.modules.loadedMain = [...atConfig.modules.loadedMain, fileName];
			}
			resolve();
		});

		script.onerror = script.addEventListener('error', () => {
			console.log(`Failed to load script ${fileName}. Retries left: ${retries - 1}`);
			if (retries > 0) {
				loadModules(fileName, prefix, retries - 1)
					.then(resolve)
					.catch(reject);
			} else {
				reject(new Error(`Failed to load module: ${fileName} from path: ${prefix || ''} after 3 attempts.`));
			}
		});

		document.head.appendChild(script);
	});
}

function loadScriptsAT() {
	console.time();

	if (usingRealTimeOffline) {
		clearTimeout(offlineProgress.loop); /* Disable offline progress loop */
	} else {
		gameLoop = function () {}; /* Disable game from running until script loads to ensure no time is spent without AT running */
	}

	const scripts = Array.from(document.getElementsByTagName('script'));
	const autoTrimpsScript = scripts.find((script) => script.src.includes('AutoTrimps2'));

	if (autoTrimpsScript) atConfig.initialise.basepath = autoTrimpsScript.src.replace(/AutoTrimps2\.js$/, '');

	(async function () {
		try {
			const { pathMods, pathTesting, installedMods, installedModules, installedTesting } = atConfig.modules;
			const testing = atConfig.initialise.basepath === 'https://localhost:8887/AutoTrimps_Local/' ? installedTesting : [];

			const modules = ['versionNumber', ...installedMods, ...installedModules, ...testing, 'SettingsGUI'];
			const scripts = ['https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', 'https://Quiaaaa.github.io/AutoTrimps/Graphs.js', 'https://stellar-demesne.github.io/Trimps-QWUI/qwUI.js', 'https://stellar-demesne.github.io/Trimps-VoidMapClarifier/VoidMapClarifier.js'];
			const stylesheets = ['https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', `${atConfig.initialise.basepath}css/tabs.css`, `${atConfig.initialise.basepath}css/farmCalc.css`, `${atConfig.initialise.basepath}css/perky.css`];

			if (game.global.stringVersion === '5.9.2') {
				await loadModules('gameUpdates', atConfig.modules.pathMods);
			}

			for (const module of modules) {
				const path = installedTesting.includes(module) ? pathTesting : installedMods.includes(module) ? pathMods : installedModules.includes(module) ? atConfig.modules.path : '';
				await loadModules(module, path);
			}

			for (const script of scripts) {
				if (atConfig.modules.loadedExternal.includes(script)) continue;
				await loadScript(script);
			}

			for (const stylesheet of stylesheets) {
				if (atConfig.modules.loadedExternal.includes(stylesheet)) continue;
				await loadStylesheet(stylesheet);
			}

			initialiseScript();
		} catch (error) {
			console.error('Error loading script or stylesheet:', error);
			initialiseScript();
		}
	})();
}

loadScriptsAT();

function initialiseScript() {
	const filesNotLoaded = {
		main: atConfig.modules.installedMain.length > atConfig.modules.loadedMain.length,
		modules: atConfig.modules.installedModules.length > atConfig.modules.loadedModules.length,
		mods: atConfig.modules.installedMods.length > atConfig.modules.loadedMods.length,
		externalScripts: 5 > atConfig.modules.loadedExternal.length
	};

	if (Object.values(filesNotLoaded).some(Boolean)) {
		console.timeEnd();
		return loadScriptsAT();
	}

	setupAddonUser();
	setupMODULES();

	if (typeof MODULES.mapData === 'undefined') {
		setupAddonUser(true);
		setupMODULES();
	}

	/* temp solution. Will remove when I setup mapSettings saving on refresh */
	if (MODULES.maps) {
		MODULES.maps.fragmentFarming = false;
		MODULES.maps.fragmentCost = Infinity;
	}

	atlantrimpRespecOverride();
	_loadAutoTrimpsSettings();
	automationMenuSettingsInit();
	initialiseAllTabs();
	initialiseAllSettings();
	updateATVersion();
	localStorage.setItem('mutatorPresets', autoTrimpSettings.mutatorPresets.valueU2);

	if (getPageSetting('gameUser') === 'ray') MODULES.buildings.betaHouseEfficiency = true;
	atConfig.settingUniverse = getPageSetting('universeSetting') + 1;

	if (portalUniverse === -1) portalUniverse = game.global.universe;
	atData.autoPerks.displayGUI(portalUniverse);
	loadAugustSettings();
	_setupATButtons();
	loadRuneTrinketCounter();
	togglePercentHealth();
	updateShieldData();

	if (_getTargetWorldType() === 'void' && !hdStats.hitsSurvivedVoid) {
		hdStats.hitsSurvivedVoid = calcHitsSurvived(game.global.world, 'void', _getVoidPercent(game.global.world, game.global.universe));
	} else if (!hdStats.hitsSurvived) {
		hdStats.hitsSurvived = calcHitsSurvived(game.global.world, 'world', 1);
	}

	trimpStats = new TrimpStats(true);
	hdStats = new HDStats(true);

	if (usingRealTimeOffline) {
		if (game.options.menu.offlineProgress.enabled === 1) removeTrustworthyTrimps();
		cancelTooltip();
	}

	farmingDecision();
	autoMapsStatus();

	atConfig.initialise.loaded = true;
	toggleCatchUpMode();
	if (usingRealTimeOffline) offlineProgress.loop = setTimeout(timeWarpLoop, 0, true);
	debug(`AutoTrimps (${atConfig.initialise.version.split(' ')[0]} ${atConfig.initialise.version.split(' ')[1]}) has finished loading.`);
	challengeInfo(true);
	console.timeEnd();
}

function startStopLoop(loopName, action) {
	if (atConfig.loops[loopName]) {
		clearInterval(atConfig.loops[loopName]);
		atConfig.loops[loopName] = null;
	}

	if (action !== 'start') return;

	const interval = atConfig.runInterval * (loopName === 'guiLoop' ? 10 : 1);
	atConfig.loops[loopName] = setInterval(window[loopName], interval);
}

function resetLoops() {
	['mainLoop', 'guiLoop'].forEach((loop) => startStopLoop(loop, 'stop'));
	atConfig.loops.atTimeLapseFastLoop = false;
	gameLoop = originalGameLoop;
	['mainLoop', 'guiLoop'].forEach((loop) => startStopLoop(loop, 'start'));
}

function toggleCatchUpMode() {
	if (!atConfig.loops.mainLoop && !atConfig.loops.guiLoop && !atConfig.loops.atTimeLapseFastLoop) {
		resetLoops();
	}

	if (usingRealTimeOffline) {
		if (!atConfig.running || game.options.menu.pauseGame.enabled || getPageSetting('pauseScript', 1) || !getPageSetting('timeWarpSpeed')) {
			if (usingRealTimeOffline && atConfig.loops.atTimeLapseFastLoop) {
				resetLoops();
				debug(`Disabled Time Warp functionality.`, 'offline');
			}

			return;
		}
	}

	if (!usingRealTimeOffline && atConfig.loops.atTimeLapseFastLoop) {
		resetLoops();
	} else if (usingRealTimeOffline && !atConfig.loops.atTimeLapseFastLoop) {
		['mainLoop', 'guiLoop'].forEach((loop) => startStopLoop(loop, 'stop'));
		gameLoop = function (makeUp, now) {
			originalGameLoop(makeUp, now);

			updateInterval();
			mainCleanup();
			if (game.global.mapsActive) _adjustGlobalTimers(['mapStarted'], -100);
			if (atConfig.intervals.thirtyMinute && getPageSetting('timeWarpSaving')) _timeWarpSave();

			if (loops % getPageSetting('timeWarpFrequency') === 0 || atConfig.portal.aWholeNewWorld || liquifiedZone()) {
				mainLoop();
			} else if (atConfig.intervals.thirtySecond) {
				trimpStats = new TrimpStats();
				hdStats = new HDStats();
			}

			if (shouldUpdate()) _timeWarpUpdateUIDisplay();
			if (!elementVisible('science')) checkTriggers();
			_timeWarpATFunctions();
		};

		_setTimeWarpUI();
		_timeWarpAutoSaveSetting();
		const timeWarpTime = Math.floor(offlineProgress.totalOfflineTime / 1000);
		debug(`TimeLapse Mode Enabled. Your Time Warp duration is ${formatTimeForDescriptions(timeWarpTime)}.`, 'offline');
		if (getPageSetting('timeWarpDisplay')) {
			tooltip(`Time Warp`, `customText`, `lock`, `Your Time Warp duration is ${formatTimeForDescriptions(timeWarpTime)}. As you have the ${autoTrimpSettings.timeWarpDisplay.name()} setting enabled you have no visible timer but you can see the progress percent in the AutoMaps status bar at the bottom of the battle container.`, false, `center`);
		}
	}
}

function shouldRunInTimeWarp() {
	return !atConfig.loops.atTimeLapseFastLoop || (usingRealTimeOffline && !getPageSetting('timeWarpSpeed'));
}

function updateInterval() {
	atConfig.intervals.counter++;

	const intervals = {
		tenthSecond: 100,
		halfSecond: 500,
		oneSecond: 1000,
		twoSecond: 2000,
		fiveSecond: 5000,
		sixSecond: 6000,
		tenSecond: 10000,
		thirtySecond: 30000,
		oneMinute: 60000,
		fiveMinute: 300000,
		tenMinute: 600000,
		thirtyMinute: 1800000
	};

	for (const key in intervals) {
		atConfig.intervals[key] = atConfig.intervals.counter % (intervals[key] / atConfig.runInterval) === 0;
	}
}

function mainLoop() {
	toggleCatchUpMode();
	if (MODULES.popups.mazWindowOpen) _handleMazWindow();
	remakeTooltip();

	if (!atConfig.running || game.options.menu.pauseGame.enabled || autoTrimpSettings.pauseScript.enabled) return;
	if (game.global.ShieldEquipped.id !== MODULES.heirlooms.shieldEquipped) updateShieldData();

	const runDuringTimeWarp = shouldRunInTimeWarp();
	if (runDuringTimeWarp) {
		updateInterval();
		mainCleanup();
	}

	if (_handleSlowScumming()) return;

	boneShrine();
	buyUpgrades();
	buyBuildings();
	autoEquip();
	buyJobs();
	if (game.global.universe === 1) geneAssist();
	autoGoldUpgrades();
	autoGather();

	_handleIntervals();

	if (runDuringTimeWarp) {
		farmingDecision();
		autoMaps();
		autoMapsStatus();
		displayMostEfficientBuilding();
		displayMostEfficientEquipment();
		displayShieldGymEfficiency();
	}

	heirloomSwapping();
	callBetterAutoFight();

	mainLoopU1();
	mainLoopU2();
	buySingleRunBonuses();
	_handlePopupTimer();
	makeAdditionalInfo();

	if (runDuringTimeWarp) autoPortalCheck();
}

function mainLoopU1() {
	if (game.global.universe !== 1) return;

	autoRoboTrimp();
	autoEnlight();
	autoNatureTokens();
	if (!atConfig.settingChangedTimeout && getPageSetting('magmiteSpending') === 2) autoMagmiteSpender();
	autoGenerator();
	if (shouldRunInTimeWarp()) autoStance();
	if (game.global.spireActive) {
		exitSpireCell();
		atlantrimpRespecMessage();
	}
	fluffyEvolution();
}

function mainLoopU2() {
	if (game.global.universe !== 2) return;

	if (shouldRunInTimeWarp()) equalityManagement();
	/* automateSpireAssault(); */
	_alchemyVoidPotions();
}

function guiLoop() {
	if (!usingRealTimeOffline && (!liquifiedZone() || game.global.mapsActive) && getPageSetting('displayEnhancedGrid')) atData.fightInfo.Update();
	if (atData.performance && atData.performance.isAFK) atData.performance.UpdateAFKOverlay();
}

function updatePortalSettingVars(setting, currentValue) {
	atConfig.portal[setting + 'Last'] = atConfig.portal[setting + 'Current'];
	atConfig.portal[setting + 'Current'] = currentValue;
	atConfig.portal['aWholeNew' + setting] = atConfig.portal[setting + 'Last'] !== atConfig.portal[setting + 'Current'];
}

function updatePortalSettings() {
	updatePortalSettingVars('World', game.global.world);
	updatePortalSettingVars('HZE', game.global.universe === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal());
}

function _handleNewHZE() {
	if (!atConfig.portal.aWholeNewHZE) return;
	_challengeUnlockCheck();
}

function _handleNewWorld() {
	if (!atConfig.portal.aWholeNewWorld) return;
	if (autoPortalCheck()) return;
	if ((usingRealTimeOffline || atConfig.loops.atTimeLapseFastLoop) && game.global.world === 60) _timeWarpUpdateEquipment();
	buyUpgrades();
	autoEquip();
	archaeologyAutomator();
	challengeInfo();
	RTC_populateRunetrinketCounterInfo();

	if (atConfig.portal.currentworld === 1) {
		MODULES.portal.zonePostpone = 0;
		hideAutomationButtons();
		if (!game.upgrades.Battle.done) {
			_setButtonsPortal();
			setupAddonUser();
		}
	}

	resetVarsZone();
	setTitle();
	_debugZoneStart();
	if (getPageSetting('autoEggs', 1)) easterEggClicked();
}

function _debugZoneStart() {
	const { Tauntimp, Magnimp, Whipimp, Venimp } = game.unlocks.impCount;
	const heName = heliumOrRadon();
	debug(`Starting Zone ${game.global.world}`, 'zone');
	debug(`Zone #${game.global.world}: Tauntimp (${Tauntimp}), Magnimp (${Magnimp}), Whipimp (${Whipimp}), Venimp (${Venimp})`, 'exotic');
	/* debug(`Zone #${game.global.world}: ${heName} (${game.goldenUpgrades.Helium.purchasedAt.length}/${Math.round(game.goldenUpgrades.Helium.currentBonus * 100)}%}), Battle (${game.goldenUpgrades.Battle.purchasedAt.length}/${Math.round(game.goldenUpgrades.Battle.currentBonus * 100)}%), Void (${game.goldenUpgrades.Void.purchasedAt.length}/${Math.round(game.goldenUpgrades.Void.currentBonus * 100)}%)`, 'exotic'); */
	debug(`Zone # ${game.global.world}: Total pop (${prettify(game.resources.trimps.owned)}). A Bone Charge would give you ${boneShrineOutput(1).slice(0, -1).toLowerCase()}`, 'run_Stats');
}

function mainCleanup() {
	updatePortalSettings();
	_handleNewHZE();
	_handleNewWorld();
}

async function atVersionChecker() {
	if (atConfig.updateAvailable || usingRealTimeOffline) return;

	const url = `${atConfig.initialise.basepath}versionNumber.js`;
	const response = await fetch(url);

	if (response.ok) {
		const text = await response.text();
		const version = text.split("'")[1];

		if (version !== atConfig.initialise.version) {
			if (getPageSetting('updateReload')) {
				save(false, true);
				location.reload();
			}

			atConfig.updateAvailable = true;
			const changeLogBtn = document.getElementById('atChangelog');

			if (changeLogBtn) {
				changeLogBtn.innerHTML += " <span style='color: red; font-weight: bold;'>Update Available!</span>";
			}
		}
	}
}
