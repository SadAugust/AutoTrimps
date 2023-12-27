var atSettings = {
    initialise: {
        version: '',
        basepath: 'https://SadAugust.github.io/AutoTrimps/',
        loaded: false
    },
    modules: {
        path: 'modules/',
        installedModules: ['import-export', 'query', 'modifyGameFunctions', 'mapFunctions', 'calc', 'portal', 'upgrades', 'heirloomCalc', 'heirlooms', 'buildings', 'jobs', 'equipment', 'gather', 'stance', 'maps', 'breedtimer', 'combat', 'scryer', 'magmite', 'nature', 'other', 'surky', 'perky', 'fight-info', 'performance', 'bones', 'MAZ', 'minigames', 'utils', 'mutatorPreset', 'farmCalc'],
        loadedModules: [],
        loaded: []
    },
    updateAvailable: false,
    running: true,
    runInterval: 100,
    portal: { currentworld: 0, lastrunworld: 0, aWholeNewWorld: false, currentHZE: 0, lastHZE: 0, aWholeNewHZE: false },
    loops: { atTimeLapseFastLoop: false, mainLoopInterval: null, guiLoopInterval: null },
    intervals: { counter: 0, oneSecond: false, twoSecond: false, fiveSecond: false, sixSecond: false, tenSecond: false, thirtySecond: false, oneMinute: false, tenMinute: false },
    autoSave: game.options.menu.autoSave.enabled
};

//Searches html for where the AT script is being loaded from
//This is pretty much only useful for me as I have a local version of AT that I use for testing.
function loadAT() {
    console.time();
    const scripts = Array.from(document.getElementsByTagName('script'));
    const autoTrimpsScript = scripts.find((script) => script.src.includes('AutoTrimps2'));

    if (autoTrimpsScript) {
        atSettings.initialise.basepath = autoTrimpsScript.src.replace(/AutoTrimps2\.js$/, '');
    }

    //Implement new div into the offlineWrapper to hold the settings bar we introduce when in offline mode.
    if (document.getElementById('settingsRowTW') === null) {
        var settingBarRow = document.createElement('DIV');
        settingBarRow.setAttribute('id', 'settingsRowTW');
        document.getElementById('offlineWrapper').children[0].insertAdjacentHTML('afterend', '<br>');
        var offlineWrapperParent = document.getElementById('offlineInnerWrapper').parentNode;
        offlineWrapperParent.replaceChild(settingBarRow, document.getElementById('offlineInnerWrapper').parentNode.children[1]);
    }

    //Load jQuery
    (function () {
        const script = document.createElement('script');
        script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js';
        script.type = 'text/javascript';
        // Append the script to the document
        document.head.appendChild(script);
    })();

    //The basepath variable is used in graphs, can't remove this while using Quias graphs fork unless I copy code and change that line for every update.
    basepath = atSettings.initialise.basepath;
}

loadAT();

var ATmessageLogTabVisible = true;

var autoTrimpSettings = {};
var MODULES = {
    popups: { challenge: false, respecAtlantrimp: false, remainingTime: Infinity, intervalID: null, portal: false, mazWindowOpen: false },
    stats: { baseMinDamage: 0, baseMaxDamage: 0, baseDamage: 0, baseHealth: 0, baseBlock: 0 },
    graphs: {},
    u1unlocks: [],
    u2unlocks: []
};

var currPortalUniverse = 0;
var currSettingUniverse = 0;
var settingChangedTimeout = false;
var challengeCurrentZone = -1;

var mapSettings = { shouldRun: false, mapName: '', levelCheck: Infinity };
var hdStats = {};
var trimpStats = { isC3: false, isDaily: false, isFiller: false, mountainPriority: false };

//Loading modules from basepath that are required for the script to run.
function ATscriptLoad(fileName, prefix = '') {
    if (atSettings.modules.loadedModules.includes(fileName)) return;

    const script = document.createElement('script');
    script.src = `${atSettings.initialise.basepath}${prefix}${fileName}.js`;
    script.id = `${fileName}_MODULE`;
    script.async = false;
    script.defer = true;

    script.addEventListener('load', () => {
        if (prefix !== '' && !atSettings.modules.loadedModules.includes(fileName)) {
            atSettings.modules.loadedModules = [...atSettings.modules.loadedModules, fileName];
        }
    });

    document.head.appendChild(script);
}

//Load version number from a seperate file so that we can compare it to the current version number and let users know if they're using an outdated version.
ATscriptLoad('versionNumber');
ATscriptLoad('utils', atSettings.modules.path);

delayStart();

//Runs first
function delayStart() {
    //Will try to reload the utils module every 1000 milliseconds until it's loaded.
    //Shouldn't be necessary but sometimes it can mess up and not load properly.
    if (atSettings.intervals.counter % 100 === 0) {
        ATscriptLoad('utils', atSettings.modules.path);
        ATscriptLoad('versionNumber');
    }
    //Reload script every 10 milliseconds until the utils module has been loaded.
    if (typeof _setupAutoTrimpsSettings !== 'function' || atSettings.initialise.version === '' || typeof jQuery !== 'function') {
        setTimeout(delayStart, 1);
        atSettings.intervals.counter++;
        return;
    }

    //Loading jQuery select2 to style dropdown boxes more than basic html/css can.
    var script = document.createElement('link');
    script.rel = 'stylesheet';
    script.href = 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css';
    script.type = 'text/css';
    // Append the script to the document
    document.head.appendChild(script);

    //Loads the settings from the save file, settingsGUI & the various modules installed.
    initializeAutoTrimps();
}

//Runs second
function initializeAutoTrimps() {
    //Load CSS
    const linkStylesheet = document.createElement('link');
    (linkStylesheet.rel = 'stylesheet'), (linkStylesheet.type = 'text/css'), (linkStylesheet.href = atSettings.initialise.basepath + 'tabs.css'), document.head.appendChild(linkStylesheet);

    _setupAutoTrimpsSettings();
    ATscriptLoad('SettingsGUI');

    const script = document.createElement('script');
    script.src = 'https://Quiaaaa.github.io/AutoTrimps/Graphs.js';
    document.head.appendChild(script);

    atSettings.modules.installedModules.forEach((module) => {
        ATscriptLoad(`${module}`, `${atSettings.modules.path}`);
    });
    delayStartAgain();
}

function delayStartAgain() {
    //Reload script every 10 milliseconds until these scripts have been loaded
    //Added incrementing variable at the end of every script so that we can be sure that the script has fully loaded before we start the main loop.
    if (atSettings.modules.installedModules.length > atSettings.modules.loadedModules.length || typeof updateATVersion !== 'function' || typeof calcHeirloomBonus_AT !== 'function' || typeof _challengeUnlockCheck !== 'function') {
        console.log(timeStamp() + ' Delaying start by 10ms');
        setTimeout(delayStartAgain, 10);
        return;
    }

    _raspberryPiSettings();
    _setupATButtons();

    atSettings.initialise.loaded = true;
    MODULES.heirlooms.gammaBurstPct = getHeirloomBonus('Shield', 'gammaBurst') / 100 > 0 ? getHeirloomBonus('Shield', 'gammaBurst') / 100 : 1;
    trimpStats = new TrimpStats(true);
    hdStats = new HDStats(true);
    autoMapsStatus();

    //Copy gameLoop for when we enter toggleCatchUpMode.
    originalGameLoop = gameLoop;
    //Starts the loop in either normal or TimeLapse mode.
    toggleCatchUpMode();

    localStorage.setItem('mutatorPresets', autoTrimpSettings.mutatorPresets.valueU2);
    //Setup Perky/Surky UI
    universeSwapped();
    //Loads my game settings
    loadAugustSettings();
    currSettingUniverse = autoTrimpSettings.universeSetting.value + 1;
    challengeInfo(true);

    //Loading jQuery select2 to style dropdown boxes more than basic html/css can.
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js';
    script.type = 'text/javascript';
    // Append the script to the document
    document.head.appendChild(script);
    debug(`AutoTrimps (${atSettings.initialise.version.split(' ')[0]} ${atSettings.initialise.version.split(' ')[1]}) finished loading.`);
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
    if (action === 'start') {
        atSettings.loops[loopName] = setInterval(window[loopName], atSettings.runInterval * (loopName === 'guiLoop' ? 10 : 1));
    }
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
    challengeInfo();

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

function updatePortalSettings() {
    atSettings.portal.lastrunworld = atSettings.portal.currentworld;
    atSettings.portal.currentworld = game.global.world;
    atSettings.portal.aWholeNewWorld = atSettings.portal.lastrunworld !== atSettings.portal.currentworld;

    atSettings.portal.lastHZE = atSettings.portal.currentHZE;
    atSettings.portal.currentHZE = game.global.universe === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();
    atSettings.portal.aWholeNewHZE = atSettings.portal.lastHZE !== atSettings.portal.currentHZE;
}

function _handleNewHZE() {
    if (!atSettings.portal.aWholeNewHZE) return;
    _challengeUnlockCheck();
}

function _handleNewWorld() {
    if (!atSettings.portal.aWholeNewWorld) return;
    autoPortalCheck();
    archaeologyAutomator();
    if (atSettings.portal.currentworld === 1) {
        MODULES.mapFunctions.afterVoids = false;
        MODULES.portal.zonePostpone = 0;
        if (!game.upgrades.Battle.done) {
            resetSettingsPortal();
        }
    }
    resetVarsZone();
    setTitle();
    _debugZoneStart();
    if (getPageSetting('autoEggs', 1)) easterEggClicked();
    if (dailyOddOrEven().skipZone) {
        debug('Zone #' + game.global.world + ':  Heirloom swapping and mapping will be affected by Daily Odd/Even.', 'daily');
    }
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

    const url = `${basepath}/versionNumber.js`;
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
