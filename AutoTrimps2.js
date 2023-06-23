var MODULES_AT = {
	ATversion: 'SadAugust v6.3.12',
	atscript: document.getElementsByTagName("script"),
	basepath: '',
	modulepath: 'modules/'
};

//Searches html for where the AT script is being loaded from
function loadAT() {
	for (var y = 0; y < MODULES_AT.atscript.length; y++) {
		if (MODULES_AT.atscript[y].src.includes('AutoTrimps2')) {
			MODULES_AT.basepath = MODULES_AT.atscript[y].src.replace(/AutoTrimps2\.js$/, '');
			break;
		}
		y++;
	}
}

loadAT();

//Backup on the off chance the script hasn't been found
if (MODULES_AT.basepath === '') MODULES_AT.basepath = 'https://SadAugust.github.io/AutoTrimps/';
basepath = MODULES_AT.basepath;

function ATscriptLoad(a, b) {
	null === b && debug('Wrong Syntax. Script could not be loaded. Try ATscriptLoad(MODULES_AT.modulepath, \'example.js\'); ');
	var c = document.createElement('script');
	null === a && (a = ''), c.src = MODULES_AT.basepath + a + b + '.js', c.id = b + '_MODULE', document.head.appendChild(c);
}
function ATscriptUnload(a) {
	var b = document.getElementById(a + "_MODULE");
	b && (document.head.removeChild(b), debug("Removing " + a + "_MODULE", "other"));
}

var ATrunning = true;
var atFinishedLoading = false;
var ATmessageLogTabVisible = true;
var slowScumming = false;

var runInterval = 100;
var atTimeLapseFastLoop = false;
var mainLoopInterval = null;
var guiLoopInterval = null;
var ATMainLoopCounter = 0;

var autoTrimpSettings = {};
var MODULES = {};
var ATmoduleList = [];
var resourceNeeded = {
	food: 0,
	wood: 0,
	metal: 0,
	science: 0,
	gems: 0,
	fragments: 0,
};

var baseMinDamage = 0;
var baseMaxDamage = 0;
var baseDamage = 0;
var baseHealth = 0;
var baseBlock = 0;

var currentworld = 0;
var lastrunworld = 0;
var aWholeNewWorld = false;
var currPortalUniverse = 0;
var currSettingUniverse = 0;

var currentHZE = 0;
var lastHZE = 0;
var aWholeNewHZE = false;

var magmiteSpenderChanged = false;

var challengeCurrentZone = -1;
var heirloomPlagueSwap = false;
var runningAtlantrimp = false;
var mapRepeats = 0;

var showingPerky = false;
var showingSurky = false;
var mazWindowOpen = false;

var mapSettings = {
	shouldRun: false,
	mapName: '',
	levelCheck: Infinity,
}

var hdStats = {
	isC3: false,
	isDaily: false,
	isFiller: false
}
var mappingTIme = 0;
var twoSecondInterval = false;
var sixSecondInterval = false;

var popupsAT = {
	challenge: false,
	respecAtlantrimp: false,
	remainingTime: Infinity,
	intervalID: null,
	portal: false,
}

//Get Gamma burst % value
var gammaBurstPct = 1
var shieldEquipped = game.global.ShieldEquipped.id;

ATscriptLoad(MODULES_AT.modulepath, 'utils');

async function initializeAutoTrimps() {
    loadPageVariables();

    // Function to load a single script
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.type = 'text/javascript';
            script.addEventListener('load', resolve);
            script.addEventListener('error', reject);
            document.head.appendChild(script);
        });
    }

    try {
        // Load jQuery
        await loadScript('https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js');
        console.log(`jQuery ${$.fn.jquery} has been loaded successfully!`);

        // Load other scripts
        await loadScript('https://Quiaaaa.github.io/AutoTrimps/Graphs.js');

        // Load scripts from ATmoduleList
        const ATmoduleList = ['import-export', 'query', 'calc', 'portal', 'upgrades', 'heirlooms', 'buildings', 'jobs', 'equipment', 'gather', 'stance', 'maps', 'breedtimer', 'fight', 'scryer', 'magmite', 'nature', 'other', 'surky', 'perky', 'fight-info', 'performance', 'bones', 'MAZ', 'mapFunctions', 'minigames'];
        const loadPromises = ATmoduleList.map(m => loadScript(MODULES_AT.modulepath + m));

        // Wait for all scripts from ATmoduleList to load
        await Promise.all(loadPromises);

        // Code to run after all scripts are loaded
        debug('AutoTrimps Loaded!');

    } catch (error) {
        console.error('Error loading one or more scripts.', error);
    }
}

function printChangelog(changes) {
	var body = "";
	for (var i in changes) {
		var $item = changes[i];
		var result = assembleChangelog($item);
		body += result;
	}
	var footer =
		'<br><b>SadAugust fork</b> - <u>Report any bugs/problems please</u>!\
        <br>Talk with the other Trimpers: <a target="Trimps" href="https://discord.gg/trimps">Trimps Discord Channel</a>\
        <br>Check <a target="#" href="https://github.com/SadAugust/AutoTrimps_Local/commits/gh-pages" target="#">the commit history</a> (if you want).',
		action = 'cancelTooltip()',
		title = 'Script Update Notice<br>' + MODULES_AT.ATversion,
		acceptBtnText = "Thank you for playing with AutoTrimps.",
		hideCancel = true;

	tooltip('confirm', null, 'update', body + footer, action, title, acceptBtnText, null, hideCancel);
	verticalCenterTooltip(true);
}

function assembleChangelog(c) {
	return `${c}<br>`
}

delayStart();

async function delayStart() {
	if (typeof loadPageVariables !== 'function' || typeof swapBaseSettings !== 'function') {
		console.log("Script not loaded yet. Waiting 100ms to try loading again.")
		setTimeout(delayStart, 100);
		return;
	}
	await initializeAutoTrimps();
	game.global.addonUser = true;
	game.global.autotrimps = true;
	document.getElementById('activatePortalBtn').setAttribute("onClick", 'activateClicked(); pushSpreadsheetData()');
	delayStartAgain();
	//setTimeout(delayStartAgain, 1500);
}

function swapBaseSettings() {
	//raspberry pi related setting changes
	//Swaps base settings to improve performance & so that I can't accidentally pause. 
	//Shouldn't impact anybody else that uses AT as they'll never set the gameUser setting to SadAugust.
	if (autoTrimpSettings.gameUser.value !== 'SadAugust') return;
	if (navigator.oscpu === 'Linux armv7l') {
		game.options.menu.hotkeys.enabled = 0;
		game.options.menu.progressBars.enabled = 0;
		game.options.menu.showHeirloomAnimations.enabled = 0;
	}
	else {
		game.options.menu.hotkeys.enabled = 1;
		game.options.menu.progressBars.enabled = 2;
		game.options.menu.showHeirloomAnimations.enabled = 1;
	}
}

function delayStartAgain() {
	//if (typeof mappingDetails !== 'function' || typeof setupATButtons !== 'function') {
	//	console.log("Modules not loaded yet. Waiting 100ms to try loading again.")
	//	setTimeout(delayStartAgain, 100);
	//	return;
	//}

	swapBaseSettings();
	setupATButtons();

	atFinishedLoading = true;
	gammaBurstPct = (getHeirloomBonus("Shield", "gammaBurst") / 100) > 0 ? (getHeirloomBonus("Shield", "gammaBurst") / 100) : 1;
	hdStats = new HDStats();
	mapSettings = new farmingDecision();

	game.global.addonUser = true;
	game.global.autotrimps = true;

	originalGameLoop = gameLoop;

	//Starts the loop in either normal or TimeLapse mode.
	toggleCatchUpMode();

	updateCustomButtons(true);
	localStorage.setItem('mutatorPresets', autoTrimpSettings.mutatorPresets.valueU2);
	universeSwapped();
}

function universeSwapped() {
	//Displays Perky UI when changing universe to U1.
	if (currPortalUniverse !== portalUniverse) {
		//Removes UI display if currently active
		if (showingPerky) AutoPerks.removeGUI();
		if (showingSurky) AutoPerks.removeGUI();
		//Sets up Perky UI when in U1 or changing universe to U1.
		if (portalUniverse === 1) {
			setupPerkyUI();
		}
		if (portalUniverse === 2) {
			setupSurkyUI();
		}
		currPortalUniverse = portalUniverse;
	}
}

//Starts the main/gui loop and switches to catchup mode if needed also switches back to realtime mode if needed
function toggleCatchUpMode() {

	//Start and Intilise loop if this is called for the first time
	if (!mainLoopInterval && !guiLoopInterval && !atTimeLapseFastLoop) {
		mainLoopInterval = setInterval(mainLoop, runInterval);
		guiLoopInterval = setInterval(guiLoop, runInterval * 10);
	}

	if (getPageSetting('timeWarpDisable') && usingRealTimeOffline) return;
	if (usingRealTimeOffline && !getPageSetting('timeWarpSpeed')) return;

	//Enable Online Mode after Offline mode was enabled
	if (!usingRealTimeOffline && atTimeLapseFastLoop) {
		if (mainLoopInterval) clearInterval(mainLoopInterval);
		if (guiLoopInterval) clearInterval(guiLoopInterval);
		mainLoopInterval = null;
		atTimeLapseFastLoop = false;
		gameLoop = originalGameLoop;
		mainLoopInterval = setInterval(mainLoop, runInterval);
		guiLoopInterval = setInterval(guiLoop, runInterval * 10);
	}

	else if (usingRealTimeOffline && !atTimeLapseFastLoop) { //Enable Offline Mode
		if (mainLoopInterval) {
			clearInterval(mainLoopInterval);
			mainLoopInterval = null;
		}
		if (guiLoopInterval) {
			clearInterval(guiLoopInterval);
			guiLoopInterval = null;
		}
		atTimeLapseFastLoop = true;
		gameLoop = function (makeUp, now) {
			originalGameLoop(makeUp, now);

			var newZone = lastrunworld !== game.global.world;
			//Run mainLoop every n game loops and always on a new zone.
			if (loops % getPageSetting('timeWarpFrequency') === 0 || newZone) {
				mainLoop();
			}

			//Running a few functions everytime the game loop runs to ensure we aren't missing out on any mapping that needs to be done.
			mapSettings = farmingDecision();
			autoMap();
			callBetterAutoFight();
			if (game.global.universe === 2) equalityManagement();
		}
		debug("TimeLapse Mode Enabled", "offline");
	}
}

function mainLoop() {

	//Toggle between timelapse/catchup/offline speed and normal speed.
	toggleCatchUpMode();

	//Adjust tooltip when mazWindow is open OR clear our adjustments if it's not.
	if (mazWindowOpen && !usingRealTimeOffline) {
		var mazSettings = ["Map Farm", "Map Bonus", "Void Map", "HD Farm", "Raiding", "Bionic Raiding", "Quagmire Farm", "Insanity Farm", "Alchemy Farm", "Hypothermia Farm", "Bone Shrine", "Auto Golden", "Tribute Farm", "Smithy Farm", "Worshipper Farm"];
		var mazCheck = mazSettings.indexOf(document.getElementById('tooltipDiv').children.tipTitle.innerText);

		if (mazCheck === -1) {
			mazWindowOpen = false;
			if (document.getElementById('tooltipDiv').style.overflowY !== '')
				document.getElementById('tooltipDiv').style.overflowY = '';
			if (document.getElementById('tooltipDiv').style.maxHeight !== '')
				document.getElementById('tooltipDiv').style.maxHeight = '';

			if (document.getElementById('tooltipDiv').classList[0] !== undefined && document.getElementById('tooltipDiv').classList[0].includes('Window'))
				document.getElementById('tooltipDiv').classList.remove(document.getElementById('tooltipDiv').classList[0]);
		}
	}

	remakeTooltip();
	universeSwapped();

	if (ATrunning === false) return;
	if (getPageSetting('pauseScript', 1) || game.options.menu.pauseGame.enabled) return;
	if (getPageSetting('timeWarpDisable') && usingRealTimeOffline) return;
	ATrunning = true;

	ATMainLoopCounter++;
	//Interval code
	//var date = new Date();
	oneSecondInterval = ATMainLoopCounter % (1000 / runInterval) === 0;
	twoSecondInterval = ATMainLoopCounter % (2000 / runInterval) === 0;
	sixSecondInterval = ATMainLoopCounter % (6000 / runInterval) === 0;
	tenSecondInterval = ATMainLoopCounter % (10000 / runInterval) === 0;

	//Offline mode check
	var shouldRunTW = !usingRealTimeOffline || (usingRealTimeOffline && !getPageSetting('timeWarpSpeed'));

	if (oneSecondInterval) {
		hdStats = new HDStats();
	}
	if (shouldRunTW) mapSettings = farmingDecision();

	//Void, AutoLevel, Breed Timer, Tenacity information
	if (!usingRealTimeOffline && document.getElementById('additionalInfo') !== null) {
		var freeVoidsText = 'Void: ' + ((game.permaBoneBonuses.voidMaps.owned === 10 ? Math.floor(game.permaBoneBonuses.voidMaps.tracker / 10) : game.permaBoneBonuses.voidMaps.tracker / 10) + '/10');
		var autoLevelText = " | Auto Level: " + hdStats.autoLevel;
		var breedTimerText = game.global.universe === 1 ? " | B: " + ((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) + 's' : "";
		var tenacityText = game.global.universe === 2 && game.portal.Tenacity.radLevel > 0 ? " | T: " + (Math.floor(game.portal.Tenacity.getTime()) + "m") : "";

		document.getElementById('additionalInfo').innerHTML = freeVoidsText + autoLevelText + breedTimerText + tenacityText;
	}

	mainCleanup();

	if (slowScumming && game.global.mapRunCounter !== 0) {
		if (game.global.mapBonus === 10) slowScumming = false;
		else {
			mapScumming(challengeActive('Desolation') ? 9 : 10);
			return;
		}
	}

	//Heirloom Shield Swap Check
	if (shieldEquipped !== game.global.ShieldEquipped.id) HeirloomShieldSwapped();

	//Sets the resources needed for the upgrades you have to buy
	setResourceNeeded();

	if (shouldRunTW) {
		//AutoMaps
		autoMap();
		//Status
		updateAutoMapsStatus(false);
	}
	//Gather
	autoGather();
	//Auto Traps
	if (getPageSetting('TrapTrimps') && game.global.trapBuildAllowed && !game.global.trapBuildToggled) toggleAutoTrap();
	//Buildings
	buyBuildings();
	//Jobs
	buyJobs();
	//Upgrades
	buyUpgrades();
	//Combat
	callBetterAutoFight();
	//Bone Shrine
	boneShrine();
	//Auto Golden Upgrade
	autoGoldUpgrades();
	//Heirloom Management
	heirloomSwapping();
	//AutoEquip
	autoEquip();

	//Portal
	c2runnerportal();
	finishChallengeSquared();
	autoPortal();
	dailyAutoPortal();
	//Equip highlighting
	displayMostEfficientEquipment();

	//Logic for Universe 1
	mainLoopU1();

	//Logic for Universe 2
	mainLoopU2();

	//Bone purchases
	buySingleRunBonuses();

	//Auto SA -- Currently disabled
	automateSpireAssault();

	challengeInfo();
	atFinishedLoading = true;

	if (popupsAT.remainingTime === 5000) {
		popupsAT.remainingTime -= 0.0001;
		popupsAT.intervalID = setInterval(function () {
			if (popupsAT.remainingTime === Infinity) clearInterval(popupsAT.intervalID);
			popupsAT.remainingTime -= 100;
			if (popupsAT.remainingTime <= 0) popupsAT.remainingTime = 0;
		}, 100);
	}
}

//U1 functions
function mainLoopU1() {
	if (game.global.universe !== 1) return;
	var shouldRunTW = !usingRealTimeOffline || (usingRealTimeOffline && !getPageSetting('timeWarpSpeed'));
	//Core
	geneAssist();
	autoRoboTrimp();
	if (getPageSetting('spendmagmite') === 2 && !magmiteSpenderChanged) autoMagmiteSpender();
	autoNatureTokens();
	autoEnlight();
	autoGenerator();

	//Combat
	if (getPageSetting('ForceAbandon')) trimpcide();
	if (!game.global.fighting) {
		if (getPageSetting('fightforever') === 0) fightalways();
		else if (getPageSetting('fightforever') > 0 && hdStats.hdRatio <= getPageSetting('fightforever')) fightalways();
		else if (getPageSetting('cfightforever') && (challengeActive('Electricty') || challengeActive('Toxicity') || challengeActive('Nom'))) fightalways();
		else if (getPageSetting('dfightforever') === 1 && challengeActive('Daily') && typeof game.global.dailyChallenge.empower === 'undefined' && typeof game.global.dailyChallenge.bloodthirst === 'undefined' && (typeof game.global.dailyChallenge.bogged !== 'undefined' || typeof game.global.dailyChallenge.plague !== 'undefined' || typeof game.global.dailyChallenge.pressure !== 'undefined')) fightalways();
		else if (getPageSetting('dfightforever') === 2 && challengeActive('Daily') && (typeof game.global.dailyChallenge.bogged !== 'undefined' || typeof game.global.dailyChallenge.plague !== 'undefined' || typeof game.global.dailyChallenge.pressure !== 'undefined')) fightalways();
	}
	if (game.global.mapsUnlocked && challengeActive('Daily') && getPageSetting('avoidEmpower') && typeof game.global.dailyChallenge.empower !== 'undefined' && !game.global.preMapsActive && !game.global.mapsActive && game.global.soldierHealth > 0) avoidEmpower();

	//Stance
	var settingPrefix = challengeActive('Daily') ? 'd' : '';
	if ((getPageSetting('UseScryerStance')) || (game.global.mapsActive && getCurrentMapObject().location === 'Void' && game.talents.scry2.purchased && getPageSetting(settingPrefix + 'scryvoidmaps'))) useScryerStance();
	else {
		windStance();
		autoStance();
		autoStanceD();
	}

	//Spire
	exitSpireCell();
}

//U2 functions
function mainLoopU2() {
	if (game.global.universe !== 2) return;
	var shouldRunTW = !usingRealTimeOffline || (usingRealTimeOffline && !getPageSetting('timeWarpSpeed'));
	//Archeology
	if (getPageSetting('archaeology') && challengeActive('Archaeology')) archstring();
	//Auto Equality Management
	if (getPageSetting('equalityManagement') === 1) equalityManagementBasic();
	if (getPageSetting('equalityManagement') === 2) equalityManagement();

}

function guiLoop() {
	getPageSetting('displayEnhancedGrid') &&
		MODULES.fightinfo.Update(), 'undefined' !== typeof MODULES && 'undefined' !== typeof MODULES.performance && MODULES.performance.isAFK && MODULES.performance.UpdateAFKOverlay()
}

function mainCleanup() {
	lastrunworld = currentworld;
	currentworld = game.global.world;
	aWholeNewWorld = lastrunworld !== currentworld;

	lastHZE = currentHZE;
	currentHZE = game.global.universe === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();
	aWholeNewHZE = lastHZE !== currentHZE;

	if (aWholeNewHZE) {
		challengeUnlockCheck();
		updateCustomButtons(true);
	}

	if (currentworld === 1 && aWholeNewWorld) {
		zonePostpone = 0;
		if (!game.upgrades.Battle.done) {
			updateButtonText();
			resetSettingsPortal();
		}
	}

	if (aWholeNewWorld) {

		switch (document.getElementById('tipTitle').innerHTML) {
			case 'The Improbability':
			case 'Corruption':
			case 'Spire':
			case 'The Magma':
				cancelTooltip();
		}
		resetVarsZone();
		if (getPageSetting('autoEggs', 1))
			easterEggClicked();
		setTitle();

		debug("Starting Zone " + game.global.world, "zone");
		debug("Zone #" + game.global.world + ": Tauntimp (" + game.unlocks.impCount.Tauntimp + "), Magnimp (" + game.unlocks.impCount.Magnimp + "), Whipimp (" + game.unlocks.impCount.Whipimp + "), Venimp (" + game.unlocks.impCount.Venimp + ")", "exotic");
		debug("Zone # " + game.global.world + ": Total pop (" + prettify(game.resources.trimps.owned) + "). A Bone Charge would give you these resources (" + boneShrineOutput(1).slice(0, -1).toLowerCase() + ")", "run_Stats");

		if (getPageSetting('autoEggs', 1))
			easterEggClicked();
	}

	if (aWholeNewWorld || currentworld === 1) {
	}
}

function throwErrorfromMain() {
	throw new Error("We have successfully read the thrown error message out of the main file")
}
