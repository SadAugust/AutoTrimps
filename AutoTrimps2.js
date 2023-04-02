var ATversion = 'SadAugust v6.1.7',
	atscript = document.getElementsByTagName("script"),
	basepath = '',
	modulepath = 'modules/';

//Searches html for where the AT script is being loaded from
for (var y = 0; y < atscript.length; y++) {
	if (atscript[y].src.includes('AutoTrimps2')) {
		basepath = atscript[y].src.replace(/AutoTrimps2\.js$/, '')
		break;
	}
	y++;
}

//Backup on the off chance the script hasn't been found
if (basepath === '') basepath = 'https://SadAugust.github.io/AutoTrimps/';

function ATscriptLoad(a, b) {
	null == b && debug('Wrong Syntax. Script could not be loaded. Try ATscriptLoad(modulepath, \'example.js\'); ');
	var c = document.createElement('script');
	null == a && (a = ''), c.src = basepath + a + b + '.js', c.id = b + '_MODULE', document.head.appendChild(c)
}
function ATscriptUnload(a) {
	var b = document.getElementById(a + "_MODULE");
	b && (document.head.removeChild(b), debug("Removing " + a + "_MODULE", "other"))
}

var ATrunning = true;
var ATmessageLogTabVisible = true;
var enableDebug = true;

var autoTrimpSettings = {};
var MODULES = {};
var ATmoduleList = [];
var scienceNeeded;
var breedFire = false;

var baseBlock = 0;
var baseHealth = 0;

var preBuyAmt;
var preBuyFiring;
var preBuyTooltip;
var preBuymaxSplit;

var currentworld = 0;
var lastrunworld = 0;
var aWholeNewWorld = false;
var currPortalUniverse = 0;
var currSettingUniverse = 0;

var currentradonhze = 0;
var lastradonhze = 0;
var aWholeNewHZE = false;

var needGymystic = true;
var heirloomFlag = false;
var heirloomCache = game.global.heirloomsExtra.length;
var magmiteSpenderChanged = false;
var lastHeliumZone = 0;
var lastRadonZone = 0;

var HDRatio = 0;
var mapHDRatio = 0;
var voidHDRatio = 0;
var autoLevel = 0;
var autoLevelCurrent = 0;
var challengeCurrentZone = -1;
var voidPBSwap = false;
var rBSRunningAtlantrimp = false;
var currentMap = undefined;
var rAutoLevel = Infinity;
var rMapRepeats = 0;
var freeVoids = -1;
var tenacityTime = '0m';
var tenacityTimeNew = '0m';

var showingPerky = false;
var showingSurky = false;
var atFinishedLoading = false;

var isC3 = game.global.runningChallengeSquared || challengeActive('Mayhem') || challengeActive('Pandemonium') || challengeActive('Desolation');
var isDaily = challengeActive('Daily');
var currChall = game.global.challengeActive;

//Get Gamma burst % value
var gammaBurstPct = (getHeirloomBonus("Shield", "gammaBurst") / 100) > 0 ? (getHeirloomBonus("Shield", "gammaBurst") / 100) : 1;
var shieldEquipped = game.global.ShieldEquipped.id;

var mapSettings = {
	shouldRun: false,
	mapName: ''
}

ATscriptLoad(modulepath, 'utils');

function initializeAutoTrimps() {
	loadPageVariables();
	ATscriptLoad('', 'SettingsGUI');
	ATscriptLoad('', 'Graphs');
	ATmoduleList = ['import-export', 'query', 'calc', 'portal', 'upgrades', 'heirlooms', 'buildings', 'jobs', 'equipment', 'gather', 'stance', 'maps', 'breedtimer', 'fight', 'scryer', 'magmite', 'nature', 'other', 'perky', 'surky', 'fight-info', 'performance', 'bones', 'MAZ', 'mapFunctions', 'minigames'];
	for (var m in ATmoduleList) {
		ATscriptLoad(modulepath, ATmoduleList[m]);
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
		title = 'Script Update Notice<br>' + ATversion,
		acceptBtnText = "Thank you for playing AutoTrimps. Accept and Continue.",
		hideCancel = true;
	tooltip('confirm', null, 'update', body + footer, action, title, acceptBtnText, null, hideCancel);
}

function assembleChangelog(c) {
	return `${c}<br><br>`
}

var runInterval = 100;
var startupDelay = 1500;
var runIntervalGame;

setTimeout(delayStart, 2500);

function delayStart() {
	initializeAutoTrimps();
	game.global.addonUser = true;
	game.global.autotrimps = true;
	setTimeout(delayStartAgain, startupDelay);
}

function delayStartAgain() {
	game.global.addonUser = true;
	game.global.autotrimps = true;
	setInterval(mainLoop, runInterval);
	setInterval(guiLoop, runInterval * 10);
	setupATButtons();
	updateCustomButtons(true);
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
	oneSecondInterval = ((date.getSeconds() % 1) === 0 && (date.getMilliseconds() < 100));
	twoSecondInterval = ((date.getSeconds() % 2) === 0 && (date.getMilliseconds() < 100));
	sixSecondInterval = ((date.getSeconds() % 6) === 0 && (date.getMilliseconds() < 100));
	tenSecondInterval = ((date.getSeconds() % 10) === 0 && (date.getMilliseconds() < 100));

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

		tenacityTimeNew = game.global.universe === 2 ? Math.floor(game.portal.Tenacity.getTime()) + "m" : '0m';
		if (freeVoids !== game.permaBoneBonuses.voidMaps.tracker || autoLevel !== autoLevelCurrent || tenacityTimeNew !== tenacityTime || (game.global.universe === 1 && oneSecondInterval)) {

			var freeVoidsText = 'Void: ' + ((game.permaBoneBonuses.voidMaps.owned === 10 ? Math.floor(game.permaBoneBonuses.voidMaps.tracker / 10) : game.permaBoneBonuses.voidMaps.tracker / 10) + '/10');

			var autoLevelText = " | Auto Level: " + autoLevel;

			var breedTimerText = game.global.universe === 1 ? " | B: " + ((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) + 's' : "";

			var tenacityText = game.global.universe === 2 && game.portal.Tenacity.radLevel > 0 ? " | T: " + tenacityTimeNew : "";

			document.getElementById('freeVoidMap').innerHTML = freeVoidsText + autoLevelText + breedTimerText + tenacityText;
			freeVoids = game.permaBoneBonuses.voidMaps.tracker
			autoLevelCurrent = autoLevel;
			tenacityTime = tenacityTimeNew;
			document.getElementById('freeVoidMap').parentNode.style.display = 'block';
			document.getElementById('freeVoidMap').style.display = 'block';
		}
	}

	universeSwapped();
	if (oneSecondInterval) {
		HDRatio = calcHDRatio(game.global.world, 'world');
		voidHDRatio = calcHDRatio(game.global.world, 'void');
		mapHDRatio = calcHDRatio(game.global.world, 'map');
		autoLevel = autoMapLevel();
		isC3 = game.global.runningChallengeSquared || challengeActive('Mayhem') || challengeActive('Pandemonium') || challengeActive('Desolation');
		isDaily = challengeActive('Daily');
		currChall = game.global.challengeActive;
	}

	if (ATrunning == false) return;
	if (getPageSetting('PauseScript', 1) || game.options.menu.pauseGame.enabled) return;
	if (getPageSetting('disableForTW') && usingRealTimeOffline) return;
	ATrunning = true;
	if (mainCleanup() || portalWindowOpen || (!heirloomsShown && heirloomFlag) || (heirloomCache != game.global.heirloomsExtra.length)) {
		heirloomCache = game.global.heirloomsExtra.length;
	}
	heirloomFlag = heirloomsShown;
	if (aWholeNewWorld) {
		switch (document.getElementById('tipTitle').innerHTML) {
			case 'The Improbability':
			case 'Corruption':
			case 'Spire':
			case 'The Magma':
				cancelTooltip();
		}
		resetmapvars()
		if (getPageSetting('AutoEggs'))
			easterEggClicked();
		setTitle();
	}


	//Heirloom Shield Swap Check
	if (shieldEquipped !== game.global.ShieldEquipped.id) HeirloomShieldSwapped();
	//Initiate Farming Code
	mapSettings = FarmingDecision();
	currentMap = mapSettings.mapName;

	//Offline Progress
	if (!usingRealTimeOffline) setScienceNeeded();

	//AutoMaps
	autoMap();
	//Status
	updateAutoMapsStatus();
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
	callBetterAutoFight()
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
	mainLoopU1()

	//Logic for Universe 2
	mainLoopU2()

	if (game.global.runningChallengeSquared || challengeActive('Mayhem') || challengeActive('Pandemonium') || challengeActive('Desolation') || challengeActive('Frigid')) BuySingleRunBonuses();

	//Auto SA -- Currently disabled
	automateSpireAssault();

	challengeInfo();
	atFinishedLoading = true;
}

//U1 functions
function mainLoopU1() {
	if (game.global.universe !== 1) return;

	//Core
	if (getPageSetting('ATGA2')) ATGA2();
	autoRoboTrimp();
	if (challengeActive('Daily') && getPageSetting('buyheliumy') >= 1 && getDailyHeliumValue(countDailyWeight()) >= getPageSetting('buyheliumy') && game.global.b >= 100 && !game.singleRunBonuses.heliumy.owned) purchaseSingleRunBonus('heliumy');
	if (getPageSetting('spendmagmite') === 2 && !magmiteSpenderChanged) autoMagmiteSpender();
	if (getPageSetting('AutoNatureTokens') && game.global.world > 229) autoNatureTokens();
	autoEnlight();
	autoGenerator();


	//Combat
	if (getPageSetting('ForceAbandon')) trimpcide();
	if (!game.global.fighting) {
		if (getPageSetting('fightforever') === 0) fightalways();
		else if (getPageSetting('fightforever') > 0 && HDRatio <= getPageSetting('fightforever')) fightalways();
		else if (getPageSetting('cfightforever') && (challengeActive('Electricty') || challengeActive('Toxicity') || challengeActive('Nom'))) fightalways();
		else if (getPageSetting('dfightforever') === 1 && challengeActive('Daily') && typeof game.global.dailyChallenge.empower === 'undefined' && typeof game.global.dailyChallenge.bloodthirst === 'undefined' && (typeof game.global.dailyChallenge.bogged !== 'undefined' || typeof game.global.dailyChallenge.plague !== 'undefined' || typeof game.global.dailyChallenge.pressure !== 'undefined')) fightalways();
		else if (getPageSetting('dfightforever') === 2 && challengeActive('Daily') && (typeof game.global.dailyChallenge.bogged !== 'undefined' || typeof game.global.dailyChallenge.plague !== 'undefined' || typeof game.global.dailyChallenge.pressure !== 'undefined')) fightalways();
	}
	if (game.global.mapsUnlocked && challengeActive('Daily') && getPageSetting('avoidempower') && typeof game.global.dailyChallenge.empower !== 'undefined' && !game.global.preMapsActive && !game.global.mapsActive && game.global.soldierHealth > 0) avoidempower();

	//Stance
	if ((getPageSetting('UseScryerStance')) || (getPageSetting('scryvoidmaps') && !challengeActive('Daily')) || (getPageSetting('dscryvoidmaps') && challengeActive('Daily'))) useScryerStance();
	else if ((getPageSetting('AutoStance') === 3) || (getPageSetting('use3daily') && challengeActive('Daily'))) windStance();
	else if (getPageSetting('AutoStance') === 1) autoStance();
	else if (getPageSetting('AutoStance') === 2) autoStance2();

	//Spire
	if (getPageSetting('ExitSpireCell') > 0 && !challengeActive('Daily') && getPageSetting('IgnoreSpiresUntil') <= game.global.world && game.global.spireActive) exitSpireCell();
	if (getPageSetting('dExitSpireCell') >= 1 && challengeActive('Daily') && getPageSetting('dIgnoreSpiresUntil') <= game.global.world && game.global.spireActive) dailyexitSpireCell();
	if (getPageSetting('SpireBreedTimer') > 0 && getPageSetting('IgnoreSpiresUntil') <= game.global.world) ATspirebreed();
}

//U2 functions
function mainLoopU2() {
	if (game.global.universe !== 2) return;
	//Archeology
	if (getPageSetting('archaeology') && challengeActive('Archaeology')) archstring();
	//Auto Equality Management
	if (getPageSetting('equalityManagement') === 1) equalityManagementBasic();
	if (getPageSetting('equalityManagement') === 2) equalityManagement();

	if (challengeActive('Daily') && getPageSetting('buyradony') >= 1 && getDailyHeliumValue(countDailyWeight()) >= getPageSetting('buyradony') && game.global.b >= 100 && !game.singleRunBonuses.heliumy.owned) purchaseSingleRunBonus('heliumy');
}

function guiLoop() {
	getPageSetting('displayEnhancedGrid') &&
		MODULES.fightinfo.Update(), 'undefined' != typeof MODULES && 'undefined' != typeof MODULES.performance && MODULES.performance.isAFK && MODULES.performance.UpdateAFKOverlay()
}

function mainCleanup() {
	lastrunworld = currentworld;
	currentworld = game.global.world;
	aWholeNewWorld = lastrunworld != currentworld;

	lastradonhze = currentradonhze;
	currentradonhze = game.global.highestRadonLevelCleared + 1;
	aWholeNewHZE = lastradonhze != currentradonhze;

	if (aWholeNewHZE) {
		if (game.global.universe === 2) radonChallengesSetting(true);
		else heliumChallengesSetting(true);

		document.getElementById('freeVoidMap').parentNode.style.display = 'block';
		document.getElementById('freeVoidMap').style.display = 'block';
	}

	if (currentworld == 1 && aWholeNewWorld) {
		lastHeliumZone = 0;
		zonePostpone = 0;
		lastRadonZone = 0;
		if (!game.upgrades.Battle.done) {
			updateButtonText();
			resetSettingsPortal();
		}
		if (getPageSetting('displayAutoMapStatus')) updateAutoMapsStatus();
		return true;
	}

	if (aWholeNewWorld) {
		debug("Starting Zone " + game.global.world, "zone");
		debug("Zone #" + game.global.world + ": Tauntimp (" + game.unlocks.impCount.Tauntimp + "), Magnimp (" + game.unlocks.impCount.Magnimp + "), Whipimp (" + game.unlocks.impCount.Whipimp + "), Venimp (" + game.unlocks.impCount.Venimp + ")", "exotic");
	}

	if (aWholeNewWorld || currentworld === 1) {
		toggleStatus(true);
		toggleHeHr(true);
	}

	if (getPageSetting('AutoEggs'))
		easterEggClicked();

}

function throwErrorfromMain() {
	throw new Error("We have successfully read the thrown error message out of the main file")
}
