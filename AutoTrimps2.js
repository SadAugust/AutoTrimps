var ATversion = 'SadAugust v4.4.0', atscript = document.getElementById('AutoTrimps-script'), basepath = 'https://SadAugust.github.io/AutoTrimps_Local/', modulepath = 'modules/'; null !== atscript && (basepath = atscript.src.replace(/AutoTrimps2\.js$/, ''));
function ATscriptLoad(a, b) { null == b && debug('Wrong Syntax. Script could not be loaded. Try ATscriptLoad(modulepath, \'example.js\'); '); var c = document.createElement('script'); null == a && (a = ''), c.src = basepath + a + b + '.js', c.id = b + '_MODULE', document.head.appendChild(c) }
function ATscriptUnload(a) { var b = document.getElementById(a + "_MODULE"); b && (document.head.removeChild(b), debug("Removing " + a + "_MODULE", "other")) }
ATscriptLoad(modulepath, 'utils');

function initializeAutoTrimps() {
	loadPageVariables();
	ATscriptLoad('', 'SettingsGUI');
	ATscriptLoad('', 'Graphs');
	ATmoduleList = ['import-export', 'query', 'calc', 'portal', 'upgrades', 'heirlooms', 'buildings', 'jobs', 'equipment', 'gather', 'stance', 'maps', 'breedtimer', 'dynprestige', 'fight', 'scryer', 'magmite', 'nature', 'other', 'perks', 'fight-info', 'performance', 'bones', 'MAZ'];
	for (var m in ATmoduleList) {
		ATscriptLoad(modulepath, ATmoduleList[m]);
	}
	debug('AutoTrimps Loaded!');
}

var runInterval = 100;
var startupDelay = 1000;

setTimeout(delayStart, startupDelay);

function delayStart() {
	initializeAutoTrimps();
	setTimeout(delayStartAgain, startupDelay);
}

function delayStartAgain() {
	game.global.addonUser = true;
	game.global.autotrimps = true;
	MODULESdefault = JSON.parse(JSON.stringify(MODULES));
	setInterval(mainLoop, runInterval);
	setInterval(guiLoop, runInterval * 10);
}

var ATrunning = true;
var ATmessageLogTabVisible = true;
var enableDebug = true;
var reloadDelay = false;

var autoTrimpSettings = {};
var MODULES = {};
var MODULESdefault = {};
var ATMODULES = {};
var ATmoduleList = [];

var bestBuilding;
var scienceNeeded;
var RscienceNeeded;
var breedFire = false;

var shouldFarm = false;
var RshouldFarm = false;
var enoughDamage = true;
var RenoughDamage = true;
var enoughHealth = true;
var RenoughHealth = true;

var baseDamage = 0;
var baseBlock = 0;
var baseHealth = 0;

var preBuyAmt;
var preBuyFiring;
var preBuyTooltip;
var preBuymaxSplit;

var currentworld = 0;
var lastrunworld = 0;
var aWholeNewWorld = false;
var needGymystic = true;
var heirloomFlag = false;
var daily3 = false;
var heirloomCache = game.global.heirloomsExtra.length;
var magmiteSpenderChanged = false;
var lastHeliumZone = 0;
var lastRadonZone = 0;

function mainLoop() {
	if (document.getElementById('tooltipDiv').classList.contains('tooltipExtraLg') === false)
		document.getElementById('tooltipDiv').style.overflowY = '';
	else
		document.getElementById('tooltipDiv').style.overflowY = 'scroll';

	if (ATrunning == false) return;
	if (reloadDelay) {
		if (!game.options.menu.pauseGame.enabled) {
			toggleSetting('pauseGame');
			setTimeout(function () {
				toggleSetting('pauseGame');
			}, 1000);
			reloadDelay = false;
		}
	}
	if (getPageSetting('PauseScript') || game.options.menu.pauseGame.enabled || game.global.viewingUpgrades) return;
	ATrunning = true;
	if (getPageSetting('showbreedtimer') == true) {
		if (game.options.menu.showFullBreed.enabled != 1) toggleSetting("showFullBreed");
		addbreedTimerInsideText.innerHTML = ((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) + 's'; //add breed time for next army;
		addToolTipToArmyCount();
	}
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
		if (game.global.universe == 2)
			Rresetmapvars()
		if (getPageSetting('AutoEggs'))
			easterEggClicked();
		setTitle();
	}

	//Logic for Universe 1
	if (game.global.universe == 1) {

		//Offline Progress
		if (!usingRealTimeOffline) {
			setScienceNeeded();
			autoLevelEquipment();
		}

		//Core
		if (getPageSetting('AutoMaps') > 0 && game.global.mapsUnlocked) autoMap();
		if (getPageSetting('showautomapstatus') == true) updateAutoMapsStatus();
		if (getPageSetting('ManualGather2') == 1) manualLabor2();
		if (getPageSetting('TrapTrimps') && game.global.trapBuildAllowed && game.global.trapBuildToggled == false) toggleAutoTrap();
		if (getPageSetting('ManualGather2') == 2) autogather3();
		if (getPageSetting('ATGA2') == true) ATGA2();
		if (aWholeNewWorld && getPageSetting('AutoRoboTrimp')) autoRoboTrimp();
		if (game.global.challengeActive == "Daily" && getPageSetting('buyheliumy') >= 1 && getDailyHeliumValue(countDailyWeight()) >= getPageSetting('buyheliumy') && game.global.b >= 100 && !game.singleRunBonuses.heliumy.owned) purchaseSingleRunBonus('heliumy');
		if (aWholeNewWorld && getPageSetting('FinishC2') > 0 && game.global.runningChallengeSquared) finishChallengeSquared();
		if (getPageSetting('spendmagmite') == 2 && !magmiteSpenderChanged) autoMagmiteSpender();
		if (getPageSetting('AutoNatureTokens') && game.global.world > 229) autoNatureTokens();
		if (getPageSetting('autoenlight') && game.global.world > 229 && game.global.uberNature == false) autoEnlight();
		if (getPageSetting('BuyUpgradesNew') != 0) buyUpgrades();

		//Buildings
		if (getPageSetting('BuyBuildingsNew') === 0 && getPageSetting('hidebuildings') == true) buyBuildings();
		else if (getPageSetting('BuyBuildingsNew') == 1) {
			buyBuildings();
			buyStorage();
		}
		else if (getPageSetting('BuyBuildingsNew') == 2) buyBuildings();
		else if (getPageSetting('BuyBuildingsNew') == 3) buyStorage();
		if (getPageSetting('UseAutoGen') == true && game.global.world > 229) autoGenerator();

		//Jobs
		if (getPageSetting('BuyJobsNew') == 1) {
			workerRatios();
			buyJobs();
		}
		else if (getPageSetting('BuyJobsNew') == 2) buyJobs();

		//Portal
		if (autoTrimpSettings.AutoPortal.selected != "Off" && game.global.challengeActive != "Daily" && !game.global.runningChallengeSquared) autoPortal();
		if (getPageSetting('AutoPortalDaily') > 0 && game.global.challengeActive == "Daily") dailyAutoPortal();
		if (getPageSetting('c2runnerstart') == true && getPageSetting('c2runnerportal') > 0 && game.global.runningChallengeSquared && game.global.world >= getPageSetting('c2runnerportal')) c2runnerportal();

		//Combat
		if (getPageSetting('ForceAbandon') == true || getPageSetting('fuckanti') > 0) trimpcide();
		if (getPageSetting('trimpsnotdie') == true && game.global.world > 1) helptrimpsnotdie();
		if (!game.global.fighting) {
			if (getPageSetting('fightforever') == 0) fightalways();
			else if (getPageSetting('fightforever') > 0 && calcHDratio() <= getPageSetting('fightforever')) fightalways();
			else if (getPageSetting('cfightforever') == true && (game.global.challengeActive == 'Electricty' || game.global.challengeActive == 'Toxicity' || game.global.challengeActive == 'Nom')) fightalways();
			else if (getPageSetting('dfightforever') == 1 && game.global.challengeActive == "Daily" && typeof game.global.dailyChallenge.empower == 'undefined' && typeof game.global.dailyChallenge.bloodthirst == 'undefined' && (typeof game.global.dailyChallenge.bogged !== 'undefined' || typeof game.global.dailyChallenge.plague !== 'undefined' || typeof game.global.dailyChallenge.pressure !== 'undefined')) fightalways();
			else if (getPageSetting('dfightforever') == 2 && game.global.challengeActive == "Daily" && (typeof game.global.dailyChallenge.bogged !== 'undefined' || typeof game.global.dailyChallenge.plague !== 'undefined' || typeof game.global.dailyChallenge.pressure !== 'undefined')) fightalways();
		}
		if (getPageSetting('BetterAutoFight') == 1) betterAutoFight();
		if (getPageSetting('BetterAutoFight') == 2) betterAutoFight3();
		var forcePrecZ = (getPageSetting('ForcePresZ') < 0) || (game.global.world < getPageSetting('ForcePresZ'));
		if (getPageSetting('DynamicPrestige2') > 0 && forcePrecZ) prestigeChanging2();
		else autoTrimpSettings.Prestige.selected = document.getElementById('Prestige').value;
		if (game.global.mapsUnlocked && game.global.challengeActive == "Daily" && getPageSetting('avoidempower') == true && typeof game.global.dailyChallenge.empower !== 'undefined' && !game.global.preMapsActive && !game.global.mapsActive && game.global.soldierHealth > 0) avoidempower();
		if (getPageSetting('buywepsvoid') == true && ((getPageSetting('VoidMaps') == game.global.world && game.global.challengeActive != "Daily") || (getPageSetting('DailyVoidMod') == game.global.world && game.global.challengeActive == "Daily")) && game.global.mapsActive && getCurrentMapObject().location == "Void") buyWeps();
		if ((getPageSetting('darmormagic') > 0 && typeof game.global.dailyChallenge.empower == 'undefined' && typeof game.global.dailyChallenge.bloodthirst == 'undefined' && (typeof game.global.dailyChallenge.bogged !== 'undefined' || typeof game.global.dailyChallenge.plague !== 'undefined' || typeof game.global.dailyChallenge.pressure !== 'undefined')) || (getPageSetting('carmormagic') > 0 && (game.global.challengeActive == 'Toxicity' || game.global.challengeActive == 'Nom'))) armormagic();

		//Stance
		if ((getPageSetting('UseScryerStance') == true) || (getPageSetting('scryvoidmaps') == true && game.global.challengeActive != "Daily") || (getPageSetting('dscryvoidmaps') == true && game.global.challengeActive == "Daily")) useScryerStance();
		else if ((getPageSetting('AutoStance') == 3) || (getPageSetting('use3daily') == true && game.global.challengeActive == "Daily")) windStance();
		else if (getPageSetting('AutoStance') == 1) autoStance();
		else if (getPageSetting('AutoStance') == 2) autoStance2();

		//Spire
		if (getPageSetting('ExitSpireCell') > 0 && game.global.challengeActive != "Daily" && getPageSetting('IgnoreSpiresUntil') <= game.global.world && game.global.spireActive) exitSpireCell();
		if (getPageSetting('dExitSpireCell') >= 1 && game.global.challengeActive == "Daily" && getPageSetting('dIgnoreSpiresUntil') <= game.global.world && game.global.spireActive) dailyexitSpireCell();
		if (getPageSetting('SpireBreedTimer') > 0 && getPageSetting('IgnoreSpiresUntil') <= game.global.world) ATspirebreed();
		if (getPageSetting('spireshitbuy') == true && (isActiveSpireAT() || disActiveSpireAT())) buyshitspire();

		//Raiding
		if ((getPageSetting('PraidHarder') == true && getPageSetting('Praidingzone').length > 0 && game.global.challengeActive != "Daily") || (getPageSetting('dPraidHarder') == true && getPageSetting('dPraidingzone').length > 0 && game.global.challengeActive == "Daily")) PraidHarder();
		else {
			if (getPageSetting('Praidingzone').length && game.global.challengeActive != "Daily") Praiding();
			if (getPageSetting('dPraidingzone').length && game.global.challengeActive == "Daily") dailyPraiding();
		}
		if (((getPageSetting('BWraid') && game.global.challengeActive != "Daily") || (getPageSetting('Dailybwraid') && game.global.challengeActive == "Daily"))) {
			BWraiding();
		}
		if ((getPageSetting('BWraid') == true || getPageSetting('DailyBWraid') == true) && bwraidon) buyWeps();
		if (game.global.mapsActive && getPageSetting('game.global.universe == 1 && BWraid') == true && game.global.world == getPageSetting('BWraidingz') && getCurrentMapObject().level <= getPageSetting('BWraidingmax')) buyWeps();

		//Golden
		var agu = game.global.runningChallengeSquared ? getPageSetting('cAutoGoldenUpgrades') :
			game.global.challengeActive == "Daily" ? getPageSetting('dAutoGoldenUpgrades') :
				getPageSetting('AutoGoldenUpgrades');
		if (agu && agu != 'Off') autoGoldenUpgradesAT(agu);
	}

	//Logic for Universe 2
	if (game.global.universe == 2) {

		//Offline Progress
		if (!usingRealTimeOffline) RsetScienceNeeded();
		//RBuildings
		if (getPageSetting('RBuyBuildingsNew')) RbuyBuildings();
		//RUpgrades
		if (!(game.global.challengeActive == "Quest" && game.global.world > 5 && game.global.lastClearedCell < 90 && ([5].indexOf(questcheck()) >= 0))) {
			if (getPageSetting('RBuyUpgradesNew') != 0)
				RbuyUpgrades();
		}
		//RCore
		//AutoMaps
		if (getPageSetting('RAutoMaps') > 0 && game.global.mapsUnlocked) RautoMap();
		//Status - AutoMaps
		if (getPageSetting('Rshowautomapstatus')) RupdateAutoMapsStatus();
		//Gather
		if (getPageSetting('RManualGather2') == 1) RmanualLabor2();
		//Auto Traps
		if (getPageSetting('RTrapTrimps') && game.global.trapBuildAllowed && game.global.trapBuildToggled == false) toggleAutoTrap();
		//RJobs
		if (getPageSetting('RBuyJobsNew') > 0) {
			//Check to see if we're on quest and at a quest zone or if we're trying to do some farming that needs other jobs.
			if (!(game.global.challengeActive == 'Quest' && game.global.world >= game.challenges.Quest.getQuestStartZone()) || (game.global.challengeActive == 'Quest' && (rShouldTributeFarm || rShouldWorshipperFarm || rShouldTimeFarm || rShouldEquipFarm))) RbuyJobs();
			else RquestbuyJobs();
		}
		//Portal - Daily + Regular
		if (autoTrimpSettings.RAutoPortal.selected != "Off" && game.global.challengeActive != "Daily" && !game.global.runningChallengeSquared) RautoPortal();
		if (getPageSetting('RAutoPortalDaily') > 0 && game.global.challengeActive == "Daily" && game.global.world >= getPageSetting('RAutoPortalDaily')) RdailyAutoPortal();
		//Archeology
		if (getPageSetting('Rarchon') && game.global.challengeActive == "Archaeology") archstring();
		//Quest -- Warning message when AutoStructure Smithy purchasing is enabled.
		if (game.global.challengeActive == "Quest" && game.global.autoStructureSettingU2.Smithy.enabled && getPageSetting('RBuyBuildingsNew') && RquestSmithyWarning != game.stats.zonesCleared.value) {
			debug("You have the setting for Smithy autopurchase enabled in the AutoStructure settings. This setting has the chance to cause issues later in the run.")
			RquestSmithyWarning = game.stats.zonesCleared.value;
		}
		//AutoEquip
		if (getPageSetting('Requipon') && (!(game.global.challengeActive == "Quest" && game.global.world > 5 && game.global.lastClearedCell < 90 && ([2, 3].indexOf(questcheck()) >= 0)))) RautoEquip();
		//Combat
		if (getPageSetting('BetterAutoFight') == 1) betterAutoFight();
		if (getPageSetting('BetterAutoFight') == 2) betterAutoFight3();
		//Avoid Empower on Dailies - Currently broken.
		//Auto Equality Management
		if (getPageSetting('rManageEquality') == 1) rManageEquality();
		if (getPageSetting('rManageEquality') == 2) equalityManagement();
		//Heirloom Management
		if (getPageSetting('Rhs')) HeirloomSwapping();
		//Auto Golden Upgrade
		var rAutoGoldenUpgrade = game.global.runningChallengeSquared || (game.global.challengeActive != '' && game.global.challengeActive != 'Daily' && typeof game.challenges[game.global.challengeActive].heliumThrough === 'undefined' && getPageSetting('rNonRadonUpgrade')) ? getPageSetting('RcAutoGoldenUpgrades') :
			game.global.challengeActive == "Daily" ? getPageSetting('RdAutoGoldenUpgrades') :
				getPageSetting('RAutoGoldenUpgrades');
		if (rAutoGoldenUpgrade && rAutoGoldenUpgrade != 'Off') RautoGoldenUpgradesAT(rAutoGoldenUpgrade);

		//Bone Upgrades / Settings
		if (getPageSetting('rBoneShrine')) BoneShrine();
		if (game.global.challengeActive == "Daily" && getPageSetting('buyradony') >= 1 && getDailyHeliumValue(countDailyWeight()) >= getPageSetting('buyradony') && game.global.b >= 100 && !game.singleRunBonuses.heliumy.owned) purchaseSingleRunBonus('heliumy');
		if (game.global.runningChallengeSquared || game.global.challengeActive == 'Mayhem' || game.global.challengeActive == 'Pandemonium') BuySingleRunBonuses()
		//Respecing between presets based on Destacking or Farming when running Pandemonium. Uses preset 2 for destacking and preset 3 while farming.
		if (game.global.challengeActive == "Pandemonium" && getPageSetting('rPandRespec')) PandemoniumPerkRespec();

		if (getPageSetting('rEquipEfficientEquipDisplay')) {
			displayMostEfficientEquipment();
			if (game.options.menu.equipHighlight.enabled > 0) toggleSetting("equipHighlight")
		}
	}
}

function guiLoop() { updateCustomButtons(), safeSetItems('storedMODULES', JSON.stringify(compareModuleVars())), getPageSetting('EnhanceGrids') && MODULES.fightinfo.Update(), 'undefined' != typeof MODULES && 'undefined' != typeof MODULES.performance && MODULES.performance.isAFK && MODULES.performance.UpdateAFKOverlay() }
function mainCleanup() {
	lastrunworld = currentworld;
	currentworld = game.global.world;
	aWholeNewWorld = lastrunworld != currentworld;
	if (game.global.universe == 1 && currentworld == 1 && aWholeNewWorld) {
		lastHeliumZone = 0;
		zonePostpone = 0;
		if (getPageSetting('automapsportal') && getPageSetting('AutoMaps') == 0 && !game.upgrades.Battle.done)
			autoTrimpSettings["AutoMaps"].value = 1;
		return true;
	}
	if (game.global.universe == 2 && currentworld == 1 && aWholeNewWorld) {
		lastRadonZone = 0;
		zonePostpone = 0;
		if (getPageSetting('Rautomapsportal') && getPageSetting('RAutoMaps') == 0 && !game.upgrades.Battle.done) {
			autoTrimpSettings["RAutoMaps"].value = 1;
			if (getPageSetting('Rshowautomapstatus')) RupdateAutoMapsStatus();
		}
		return true;
	}
	if (getPageSetting('AutoEggs'))
		easterEggClicked();
}
function throwErrorfromMain() { throw new Error("We have successfully read the thrown error message out of the main file") }
