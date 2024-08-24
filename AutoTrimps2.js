const atSettings = {
	initialise: {
		version: '',
		basepath: 'https://SadAugust.github.io/AutoTrimps/',
		basepathOriginal: 'https://SadAugust.github.io/AutoTrimps/',
		loaded: false
	},
	modules: {
		path: 'modules/',
		pathMods: 'mods/',
		installedMain: ['versionNumber', 'SettingsGUI'],
		loadedMain: [],
		installedMods: ['spireTD', 'heirloomCalc', 'farmCalc', 'mutatorPreset', 'perky', 'surky'],
		installedModules: ['import-export', 'utils', 'query', 'modifyGameFunctions', 'mapFunctions', 'calc', 'portal', 'upgrades', 'heirlooms', 'buildings', 'jobs', 'equipment', 'gather', 'stance', 'maps', 'breedtimer', 'combat', 'magmite', 'nature', 'other', 'fight-info', 'performance', 'bones', 'MAZ', 'minigames'],
		loadedModules: [],
		loadedMods: [],
		loadedExternal: []
	},
	updateAvailable: false,
	running: true,
	runInterval: 100,
	portal: { currentworld: 0, lastrunworld: 0, aWholeNewWorld: false, currentHZE: 0, lastHZE: 0, aWholeNewHZE: false },
	loops: { atTimeLapseFastLoop: false, mainLoop: null, guiLoop: null, gameLoop: null },
	intervals: { counter: 0, tenthSecond: false, halfSecond: false, oneSecond: false, twoSecond: false, fiveSecond: false, sixSecond: false, tenSecond: false, thirtySecond: false, oneMinute: false, tenMinute: false },
	timeWarp: { loopTicks: 100, updateFreq: 1000, nextUpdate: 1000, loopCount: 0, currentLoops: 0 },
	autoSave: game.options.menu.autoSave.enabled
};

let autoTrimpSettings = {};
const MODULES = {
	popups: { challenge: false, respecAncientTreasure: false, remainingTime: Infinity, intervalID: null, portal: false, mazWindowOpen: false },
	heirlooms: { plagueSwap: false, compressedCalc: false, gammaBurstPct: 1, shieldEquipped: null, breedHeirloom: false },
	graphs: {},
	u1unlocks: [],
	u2unlocks: []
};

let currPortalUniverse = 0;
let currSettingUniverse = 0;
let settingChangedTimeout = false;
var originalGameLoop = gameLoop;

let mapSettings = { shouldRun: false, mapName: '', levelCheck: Infinity };
let hdStats = { autoLevel: Infinity };
let trimpStats = { isC3: false, isDaily: false, isFiller: false, mountainPriority: false, fluffyRewards: { universe: 0, level: 0 } };

function shouldUpdate(updateEvery = 2000) {
	if (usingRealTimeOffline && loops === atSettings.timeWarp.currentLoops) return true;
	if (usingRealTimeOffline && (atSettings.timeWarp.currentLoops === 0 || loops >= atSettings.timeWarp.currentLoops + updateEvery)) {
		if (updateEvery !== 2000) return true;
		atSettings.timeWarp.currentLoops = loops;
		updateAllInnerHtmlFrames();

		return true;
	}

	return !usingRealTimeOffline;
}

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

function isModuleLoaded(fileName, prefix) {
	if (prefix === atSettings.modules.path && atSettings.modules.loadedModules.includes(fileName)) {
		return true;
	} else if (prefix === atSettings.modules.pathMods && atSettings.modules.loadedMods.includes(fileName)) {
		return true;
	}
	return false;
}

//Loading modules from basepath that are required for the script to run.
function loadModules(fileName, prefix = '') {
	return new Promise((resolve, reject) => {
		if (prefix) {
			if (prefix && isModuleLoaded(fileName, prefix)) {
				resolve();
				return;
			}
		}

		const script = document.createElement('script');
		script.src = `${atSettings.initialise.basepath}${prefix}${fileName}.js`;
		script.id = `${fileName}_MODULE`;
		script.async = false;
		script.defer = true;

		script.addEventListener('load', () => {
			if (!atSettings.modules.loadedModules.includes(fileName) && !atSettings.modules.loadedMain.includes(fileName)) {
				if (prefix) {
					if (prefix === atSettings.modules.path) atSettings.modules.loadedModules = [...atSettings.modules.loadedModules, fileName];
					else atSettings.modules.loadedMods = [...atSettings.modules.loadedMods, fileName];
				} else atSettings.modules.loadedMain = [...atSettings.modules.loadedMain, fileName];
			}
			resolve();
		});

		script.addEventListener('error', () => {
			reject(new Error(`Failed to load module: ${fileName} from path: ${prefix || ''}`));
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

	//The basepath variable is used in graphs, can't remove this while using Quias graphs fork unless I copy code and change that line for every update.
	basepath = `${atSettings.initialise.basepathOriginal}css/`;
	const scripts = Array.from(document.getElementsByTagName('script'));
	const autoTrimpsScript = scripts.find((script) => script.src.includes('AutoTrimps2'));

	if (autoTrimpsScript) atSettings.initialise.basepath = autoTrimpsScript.src.replace(/AutoTrimps2\.js$/, '');

	(async function () {
		try {
			const modules = ['versionNumber', ...atSettings.modules.installedMods, ...atSettings.modules.installedModules, 'SettingsGUI'];
			const scripts = ['https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', 'https://Quiaaaa.github.io/AutoTrimps/Graphs.js'];
			const stylesheets = ['https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', `${atSettings.initialise.basepath}css/tabs.css`];

			if (game.global.stringVersion === '5.9.2') {
				await loadModules('gameUpdates', atSettings.modules.pathMods);
			}

			for (const module of modules) {
				const path = atSettings.modules.installedMods.includes(module) ? atSettings.modules.pathMods : atSettings.modules.installedModules.includes(module) ? atSettings.modules.path : '';
				await loadModules(module, path);
			}

			for (const script of scripts) {
				if (atSettings.modules.loadedExternal.includes(script)) continue;
				await loadScript(script);
			}

			for (const stylesheet of stylesheets) {
				if (atSettings.modules.loadedExternal.includes(stylesheet)) continue;
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
		main: atSettings.modules.installedMain.length > atSettings.modules.loadedMain.length,
		modules: atSettings.modules.installedModules.length > atSettings.modules.loadedModules.length,
		mods: atSettings.modules.installedMods.length > atSettings.modules.loadedMods.length,
		externalScripts: 5 > atSettings.modules.loadedExternal.length
	};

	if (Object.values(filesNotLoaded).some(Boolean)) {
		console.timeEnd();
		return loadScriptsAT();
	}

	atlantrimpRespecOverride();
	_loadAutoTrimpsSettings();
	automationMenuSettingsInit();
	initialiseAllTabs();
	initialiseAllSettings();
	updateATVersion();
	localStorage.setItem('mutatorPresets', autoTrimpSettings.mutatorPresets.valueU2);

	if (getPageSetting('gameUser') === 'ray') MODULES.buildings.betaHouseEfficiency = true;
	currSettingUniverse = getPageSetting('universeSetting') + 1;

	if (portalUniverse === -1) portalUniverse = game.global.universe;
	MODULES.autoPerks.displayGUI(portalUniverse);
	loadAugustSettings();
	_setupATButtons();
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

	atSettings.initialise.loaded = true;
	toggleCatchUpMode();
	if (usingRealTimeOffline) offlineProgress.loop = setTimeout(timeWarpLoop, 0, true);
	debug(`AutoTrimps (${atSettings.initialise.version.split(' ')[0]} ${atSettings.initialise.version.split(' ')[1]}) has finished loading.`);
	challengeInfo(true);
	console.timeEnd();
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
		resetLoops();
	}

	if (usingRealTimeOffline) {
		if (!atSettings.running || game.options.menu.pauseGame.enabled || getPageSetting('pauseScript', 1) || !getPageSetting('timeWarpSpeed')) {
			if (usingRealTimeOffline && atSettings.loops.atTimeLapseFastLoop) {
				resetLoops();
				debug(`Disabled Time Warp functionality.`, 'offline');
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
			mainCleanup();
			if (game.global.mapsActive) _adjustGlobalTimers(['mapStarted'], -100);
			if (atSettings.intervals.thirtyMinute && getPageSetting('timeWarpSaving')) _timeWarpSave();

			if (loops % getPageSetting('timeWarpFrequency') === 0 || atSettings.portal.aWholeNewWorld || liquifiedZone()) {
				mainLoop();
			} else if (atSettings.intervals.thirtySecond) {
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
	return !atSettings.loops.atTimeLapseFastLoop || (usingRealTimeOffline && !getPageSetting('timeWarpSpeed'));
}

function updateInterval() {
	atSettings.intervals.counter++;

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
		tenMinute: 600000,
		thirtyMinute: 1800000
	};

	for (let key in intervals) {
		atSettings.intervals[key] = atSettings.intervals.counter % (intervals[key] / atSettings.runInterval) === 0;
	}
}

function mainLoop() {
	toggleCatchUpMode();
	if (MODULES.popups.mazWindowOpen) _handleMazWindow();
	remakeTooltip();

	if (!atSettings.running || game.options.menu.pauseGame.enabled || autoTrimpSettings.pauseScript.enabled) return;
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
	if (!settingChangedTimeout && getPageSetting('magmiteSpending') === 2) autoMagmiteSpender();
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
	if (!usingRealTimeOffline && (!liquifiedZone() || game.global.mapsActive) && getPageSetting('displayEnhancedGrid')) MODULES.fightinfo.Update();
	if (MODULES.performance && MODULES.performance.isAFK) MODULES.performance.UpdateAFKOverlay();
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
	if (autoPortalCheck()) return;
	if ((usingRealTimeOffline || atSettings.loops.atTimeLapseFastLoop) && game.global.world === 60) _timeWarpUpdateEquipment();
	buyUpgrades();
	autoEquip();
	archaeologyAutomator();
	challengeInfo();

	if (atSettings.portal.currentworld === 1) {
		MODULES.portal.zonePostpone = 0;
		if (!game.upgrades.Battle.done) {
			_setButtonsPortal();
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
	if (atSettings.updateAvailable || usingRealTimeOffline) return;

	const url = `${atSettings.initialise.basepath}versionNumber.js`;
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
