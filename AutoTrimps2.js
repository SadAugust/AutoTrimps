var MODULES_AT = {
	ATversion: 'SadAugust v6.2.8',
	atscript: document.getElementsByTagName("script"),
	basepath: '',
	modulepath: 'modules/'
};

//Searches html for where the AT script is being loaded from
function loadAT() {
	for (var y = 0; y < MODULES_AT.atscript.length; y++) {
		if (MODULES_AT.atscript[y].src.includes('AutoTrimps2')) {
			MODULES_AT.basepath = MODULES_AT.atscript[y].src.replace(/AutoTrimps2\.js$/, '')
			break;
		}
		y++;
	}
}
loadAT()

//Backup on the off chance the script hasn't been found
if (MODULES_AT.basepath === '') MODULES_AT.basepath = 'https://SadAugust.github.io/AutoTrimps/';
basepath = MODULES_AT.basepath;

function ATscriptLoad(a, b) {
	null == b && debug('Wrong Syntax. Script could not be loaded. Try ATscriptLoad(MODULES_AT.modulepath, \'example.js\'); ');
	var c = document.createElement('script');
	null == a && (a = ''), c.src = MODULES_AT.basepath + a + b + '.js', c.id = b + '_MODULE', document.head.appendChild(c)
}
function ATscriptUnload(a) {
	var b = document.getElementById(a + "_MODULE");
	b && (document.head.removeChild(b), debug("Removing " + a + "_MODULE", "other"))
}

var ATrunning = true;
var atFinishedLoading = false;
var ATmessageLogTabVisible = true;
var slowScumming = false;

var autoTrimpSettings = {};
var MODULES = {};
var ATmoduleList = [];
var resourceNeeded = {
	food: 0,
	wood: 0,
	metal: 0,
	science: 0
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
var voidPBSwap = false;
var rBSRunningAtlantrimp = false;
var mapRepeats = 0;

var showingPerky = false;
var showingSurky = false;

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

//Get Gamma burst % value
var gammaBurstPct = (getHeirloomBonus("Shield", "gammaBurst") / 100) > 0 ? (getHeirloomBonus("Shield", "gammaBurst") / 100) : 1;
var shieldEquipped = game.global.ShieldEquipped.id;


ATscriptLoad(MODULES_AT.modulepath, 'utils');

function initializeAutoTrimps() {
	loadPageVariables();
	ATscriptLoad('', 'SettingsGUI');
	ATscriptLoad('', 'Graphs');
	ATscriptLoad('', 'mutatorPreset');
	ATmoduleList = ['import-export', 'query', 'calc', 'portal', 'upgrades', 'heirlooms', 'buildings', 'jobs', 'equipment', 'gather', 'stance', 'maps', 'breedtimer', 'fight', 'scryer', 'magmite', 'nature', 'other', 'perky', 'surky', 'fight-info', 'performance', 'bones', 'MAZ', 'mapFunctions', 'minigames'];
	for (var m in ATmoduleList) {
		ATscriptLoad(MODULES_AT.modulepath, ATmoduleList[m]);
	}
	debug('AutoTrimps Loaded!');
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
		acceptBtnText = "Thank you for playing AutoTrimps. Accept and Continue.",
		hideCancel = true;
	tooltip('confirm', null, 'update', body + footer, action, title, acceptBtnText, null, hideCancel);
}

function assembleChangelog(c) {
	return `${c}<br><br>`
}

setTimeout(delayStart, 2500);

function delayStart() {
	initializeAutoTrimps();
	game.global.addonUser = true;
	game.global.autotrimps = true;
	document.getElementById('activatePortalBtn').setAttribute("onClick", 'activateClicked(); pushSpreadsheetData()');
	setTimeout(delayStartAgain, 1500);
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

	swapBaseSettings();

	atFinishedLoading = true;
	// Load jQuery
	// Immediately-invoked function expression
	(function () {
		// Load the script
		const script = document.createElement("script");
		script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js';
		script.type = 'text/javascript';
		script.addEventListener('load', () => {
			console.log(`jQuery ${$.fn.jquery} has been loaded successfully!`);
			// use jQuery below
		});
		document.head.appendChild(script);
	})();

	hdStats = new HDStats();
	mapSettings = new FarmingDecision(hdStats);

	game.global.addonUser = true;
	game.global.autotrimps = true;
	setInterval(mainLoop, 100);
	setInterval(guiLoop, 100 * 10);
	setupATButtons();
	updateCustomButtons(true);
	localStorage.setItem('mutatorPresets', autoTrimpSettings.mutatorPresets.valueU2);
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

function mainLoop() {
	//Interval code
	var date = new Date();
	//oneDayInterval = (date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() < 100);
	oneSecondInterval = ((date.getSeconds() % 1) === 0 && (date.getMilliseconds() < 100));
	twoSecondInterval = ((date.getSeconds() % 2) === 0 && (date.getMilliseconds() < 100));
	sixSecondInterval = ((date.getSeconds() % 6) === 0 && (date.getMilliseconds() < 100));
	tenSecondInterval = ((date.getSeconds() % 10) === 0 && (date.getMilliseconds() < 100));

	if (oneSecondInterval) {
		hdStats = new HDStats();
	}
	mapSettings = new FarmingDecision(hdStats);

	if (!usingRealTimeOffline) {
		var MAZCheck = document.getElementById('tooltipDiv').children.tipTitle.innerText.includes('Farm') || document.getElementById('tooltipDiv').children.tipTitle.innerText.includes('Golden') || document.getElementById('tooltipDiv').children.tipTitle.innerText.includes('Bone Shrine') || document.getElementById('tooltipDiv').children.tipTitle.innerText.includes('Void Map') || document.getElementById('tooltipDiv').children.tipTitle.innerText.includes('Map Bonus') || document.getElementById('tooltipDiv').children.tipTitle.innerText.includes('Raiding');

		if (document.getElementById('tooltipDiv').classList[0] !== undefined && (document.getElementById('mazHelpContainer') !== null && document.getElementById('mazHelpContainer').style.display === 'block') || (document.getElementById('tooltipDiv').classList[0].includes('tooltipWindow') && (MAZCheck) && document.getElementById('windowContainer') !== null && document.getElementById('windowContainer').style.display === 'block' && document.querySelectorAll('#windowContainer .active').length > 10)) {
			document.getElementById('tooltipDiv').style.overflowY = 'scroll';
		}
		else {
			document.getElementById('tooltipDiv').style.overflowY = '';
			document.getElementById('tooltipDiv').style.maxHeight = '';
		}

		if (document.getElementById('tooltipDiv').classList[0] !== undefined && !MAZCheck && document.getElementById('tooltipDiv').classList[0].includes('tooltipWindow')) document.getElementById('tooltipDiv').classList.remove(document.getElementById('tooltipDiv').classList[0])

		if (document.getElementById('freeVoidMap') !== null) {
			var freeVoidsText = 'Void: ' + ((game.permaBoneBonuses.voidMaps.owned === 10 ? Math.floor(game.permaBoneBonuses.voidMaps.tracker / 10) : game.permaBoneBonuses.voidMaps.tracker / 10) + '/10');
			var autoLevelText = " | Auto Level: " + hdStats.autoLevel;
			var breedTimerText = game.global.universe === 1 ? " | B: " + ((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) + 's' : "";
			var tenacityText = game.global.universe === 2 && game.portal.Tenacity.radLevel > 0 ? " | T: " + (Math.floor(game.portal.Tenacity.getTime()) + "m") : "";

			document.getElementById('freeVoidMap').innerHTML = freeVoidsText + autoLevelText + breedTimerText + tenacityText;
			document.getElementById('freeVoidMap').parentNode.style.display = 'block';
			document.getElementById('freeVoidMap').style.display = 'block';
		}
	}

	universeSwapped();
	presetMutations();

	if (ATrunning == false) return;
	if (getPageSetting('pauseScript', 1) || game.options.menu.pauseGame.enabled) return;
	if (getPageSetting('disableForTW') && usingRealTimeOffline) return;
	ATrunning = true;
	mainCleanup()

	if (aWholeNewWorld) {
		switch (document.getElementById('tipTitle').innerHTML) {
			case 'The Improbability':
			case 'Corruption':
			case 'Spire':
			case 'The Magma':
				cancelTooltip();
		}
		resetmapvars();
		if (getPageSetting('autoEggs', 1))
			easterEggClicked();
		setTitle();
	}

	if (slowScumming && game.global.mapRunCounter !== 0) {
		if (game.global.mapBonus === 10) slowScumming = false;
		else {
			mapScumming(9);
			return;
		}
	}

	//Heirloom Shield Swap Check
	if (shieldEquipped !== game.global.ShieldEquipped.id) HeirloomShieldSwapped();

	//Offline Progress
	if (!usingRealTimeOffline) setResourceNeeded();

	//AutoMaps
	autoMap(hdStats);
	//Status
	updateAutoMapsStatus(false, hdStats);
	//Gather
	autoGather();
	//Auto Traps
	if (getPageSetting('TrapTrimps') && game.global.trapBuildAllowed && !game.global.trapBuildToggled) toggleAutoTrap();
	//Buildings
	buyBuildings(hdStats);
	//Jobs
	buyJobs(hdStats);
	//Upgrades
	buyUpgrades();
	//Combat
	callBetterAutoFight(hdStats)
	//Bone Shrine
	boneShrine(hdStats);
	//Auto Golden Upgrade
	autoGoldUpgrades(hdStats);
	//Heirloom Management
	heirloomSwapping(hdStats);
	//AutoEquip
	autoEquip(hdStats);

	//Portal
	c2runnerportal(hdStats);
	finishChallengeSquared(hdStats);
	autoPortal(hdStats);
	dailyAutoPortal(hdStats);
	//Equip highlighting
	displayMostEfficientEquipment(hdStats);


	if (challengeActive('Daily') && getPageSetting('buyheliumy', portalUniverse) >= 1 && getDailyHeliumValue(countDailyWeight()) >= getPageSetting('buyheliumy', portalUniverse) && game.global.b >= 100 && !game.singleRunBonuses.heliumy.owned) purchaseSingleRunBonus('heliumy');

	//Logic for Universe 1
	mainLoopU1(hdStats);

	//Logic for Universe 2
	mainLoopU2(hdStats);

	if (hdStats.isC3) buySingleRunBonuses();

	//Auto SA -- Currently disabled
	automateSpireAssault(hdStats);

	challengeInfo(hdStats);
	atFinishedLoading = true;
}

//U1 functions
function mainLoopU1(hdStats) {
	if (game.global.universe !== 1) return;
	//Core
	if (getPageSetting('ATGA2')) ATGA2(hdStats);
	autoRoboTrimp();
	if (getPageSetting('spendmagmite') === 2 && !magmiteSpenderChanged) autoMagmiteSpender();
	if (getPageSetting('AutoNatureTokens') && game.global.world > 229) autoNatureTokens();
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
	if ((getPageSetting('UseScryerStance')) || (game.global.mapsActive && getCurrentMapObject().location === 'Void' && getPageSetting(settingPrefix + 'scryvoidmaps'))) useScryerStance(hdStats);
	else {
		windStance(hdStats);
		autoStance();
		autoStanceD();
	}

	//Spire
	exitSpireCell();
	if (getPageSetting('SpireBreedTimer') > 0 && getPageSetting('IgnoreSpiresUntil') <= game.global.world) ATspirebreed();
}

//U2 functions
function mainLoopU2(hdStats) {
	if (game.global.universe !== 2) return;
	//Archeology
	if (getPageSetting('archaeology') && challengeActive('Archaeology')) archstring();
	//Auto Equality Management
	if (getPageSetting('equalityManagement') === 1) equalityManagementBasic();
	if (getPageSetting('equalityManagement') === 2) equalityManagement();

}

function guiLoop() {
	getPageSetting('displayEnhancedGrid') &&
		MODULES.fightinfo.Update(), 'undefined' != typeof MODULES && 'undefined' != typeof MODULES.performance && MODULES.performance.isAFK && MODULES.performance.UpdateAFKOverlay()
}

function mainCleanup() {
	lastrunworld = currentworld;
	currentworld = game.global.world;
	aWholeNewWorld = lastrunworld != currentworld;

	lastHZE = currentHZE;
	currentHZE = game.global.universe === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();
	aWholeNewHZE = lastHZE != currentHZE;

	if (aWholeNewHZE) {
		if (game.global.universe === 2) radonChallengesSetting(true);
		else heliumChallengesSetting(true);
		HeHrPortalOptions();
		autoHeirloomOptions();
	}

	if (currentworld == 1 && aWholeNewWorld) {
		zonePostpone = 0;
		if (!game.upgrades.Battle.done) {
			updateButtonText();
			resetSettingsPortal();
		}
		return true;
	}

	if (aWholeNewWorld) {
		debug("Starting Zone " + game.global.world, "zone");
		debug("Zone #" + game.global.world + ": Tauntimp (" + game.unlocks.impCount.Tauntimp + "), Magnimp (" + game.unlocks.impCount.Magnimp + "), Whipimp (" + game.unlocks.impCount.Whipimp + "), Venimp (" + game.unlocks.impCount.Venimp + ")", "exotic");
		debug("Zone # " + game.global.world + ": Total pop (" + prettify(game.resources.trimps.owned) + "), Bone Charge resources (" + boneShrineOutput(1).slice(0, -1).toLowerCase() + ")", "run_Stats");
	}

	if (aWholeNewWorld || currentworld === 1) {
		toggleHeHr(true);
	}

	if (getPageSetting('autoEggs', 1))
		easterEggClicked();
}

function throwErrorfromMain() {
	throw new Error("We have successfully read the thrown error message out of the main file")
}
