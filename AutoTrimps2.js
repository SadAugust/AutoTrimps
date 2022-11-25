var ATversion = 'SadAugust v5.7.5.7.6',
	atscript = document.getElementById('AutoTrimps-script'),
	basepath = 'https://SadAugust.github.io/AutoTrimps_Local/',
	modulepath = 'modules/';
null !== atscript && (basepath = atscript.src.replace(/AutoTrimps2\.js$/, ''));
function ATscriptLoad(a, b) {
	null == b && debug('Wrong Syntax. Script could not be loaded. Try ATscriptLoad(modulepath, \'example.js\'); ');
	var c = document.createElement('script');
	null == a && (a = ''), c.src = basepath + a + b + '.js', c.id = b + '_MODULE', document.head.appendChild(c)
}
function ATscriptUnload(a) {
	var b = document.getElementById(a + "_MODULE");
	b && (document.head.removeChild(b), debug("Removing " + a + "_MODULE", "other"))
}
ATscriptLoad(modulepath, 'utils');

function initializeAutoTrimps() {
	loadPageVariables();
	ATscriptLoad('', 'SettingsGUI');
	ATscriptLoad('', 'Graphs');
	ATmoduleList = ['import-export', 'query', 'calc', 'portal', 'upgrades', 'heirlooms', 'buildings', 'jobs', 'equipment', 'gather', 'stance', 'maps', 'breedtimer', 'dynprestige', 'fight', 'scryer', 'magmite', 'nature', 'other', 'perks', 'fight-info', 'performance', 'bones', 'MAZ', 'mapFunctions'];
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
var breedFire = false;

var shouldFarm = false;
var enoughDamage = true;
var enoughHealth = true;

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

var currentradonhze = 0;
var lastradonhze = 0;
var aWholeNewHZE = false;

var needGymystic = true;
var heirloomFlag = false;
var daily3 = false;
var heirloomCache = game.global.heirloomsExtra.length;
var magmiteSpenderChanged = false;
var lastHeliumZone = 0;
var lastRadonZone = 0;
var HDRatio = 0;
var voidHDRatio = 0;
var autoLevel = 0;
var autoLevelCurrent = 0;
var rC3EndZoneSetting = -1;
var voidPBSwap = false;
var rBSRunningAtlantrimp = false;
var rCurrentMap = undefined;
var rAutoLevel = Infinity;
var rMapRepeats = 0;
var freeVoids = 0;
var shredTimer = 0;

//Get Gamma burst % value
gammaBurstPct = (getHeirloomBonus("Shield", "gammaBurst") / 100) > 0 ? (getHeirloomBonus("Shield", "gammaBurst") / 100) : 1;
shieldEquipped = game.global.ShieldEquipped.id;

function mainLoop() {
	//Interval code
	date = new Date();
	oneSecondInterval = ((date.getSeconds() % 1) === 0 && (date.getMilliseconds() < 100));
	twoSecondInterval = ((date.getSeconds() % 2) === 0 && (date.getMilliseconds() < 100));
	sixSecondInterval = ((date.getSeconds() % 6) === 0 && (date.getMilliseconds() < 100));
	tenSecondInterval = ((date.getSeconds() % 10) === 0 && (date.getMilliseconds() < 100));
	var MAZCheck = document.getElementById('tooltipDiv').children.tipTitle.innerText.includes('Farm') || document.getElementById('tooltipDiv').children.tipTitle.innerText.includes('Bone Shrine') || document.getElementById('tooltipDiv').children.tipTitle.innerText.includes('Void Map') || document.getElementById('tooltipDiv').children.tipTitle.innerText.includes('Map Bonus') || document.getElementById('tooltipDiv').children.tipTitle.innerText.includes('Raiding');

	if (document.getElementById('tooltipDiv').classList[0] !== undefined && document.getElementById('tooltipDiv').classList[0].includes('tooltipWindow') && (MAZCheck) && document.getElementById('windowContainer') !== null && document.getElementById('windowContainer').style.display === 'block' && document.querySelectorAll('#windowContainer .active').length > 12) {
		document.getElementById('tooltipDiv').style.overflowY = 'scroll';
	}
	else {
		document.getElementById('tooltipDiv').style.overflowY = '';
		document.getElementById('tooltipDiv').style.maxHeight = '';
	}

	if (document.getElementById('tooltipDiv').classList[0] !== undefined && !MAZCheck && document.getElementById('tooltipDiv').classList[0].includes('tooltipWindow')) document.getElementById('tooltipDiv').classList.remove(document.getElementById('tooltipDiv').classList[0])

	if (freeVoids !== game.permaBoneBonuses.voidMaps.tracker || autoLevel !== autoLevelCurrent || shredTimer !== Math.floor(game.global.hemmTimer / 10)) {
		document.getElementById('freeVoidMap').innerHTML = "Void: " + (game.permaBoneBonuses.voidMaps.owned === 10 ? Math.floor(game.permaBoneBonuses.voidMaps.tracker / 10) : game.permaBoneBonuses.voidMaps.tracker / 10) + "/10" + (getPageSetting('rManageEquality') == 2 ? " | Auto Level: " + autoLevel : "") + (game.global.challengeActive === 'Daily' && typeof game.global.dailyChallenge.hemmorrhage !== 'undefined' ? " | Shred: " + (Math.max(game.global.hemmTimer / 10).toFixed(0)) + "s" : "");
		freeVoids = game.permaBoneBonuses.voidMaps.tracker
		autoLevelCurrent = autoLevel;
		shredTimer = game.global.hemmTimer / 10;
	}

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
	rMapSettings = FarmingDecision();
	rCurrentMap = rMapSettings.mapName;
	//RCore
	//AutoMaps
	if (oneSecondInterval) {
		HDRatio = game.global.universe === 1 ? calcHDRatio(game.global.world, 'world') : RcalcHDratio();
		voidHDRatio = game.global.universe === 1 ? calcVoidHDratio() : rCalcVoidHDratio();
		autoLevel = autoMapLevel();
	}

	//Offline Progress
	if (!usingRealTimeOffline) setScienceNeeded();

	//Logic for Universe 1
	if (game.global.universe == 1) {

		if (getPageSetting('showbreedtimer')) {
			if (game.options.menu.showFullBreed.enabled != 1) toggleSetting("showFullBreed");
			addbreedTimerInsideText.innerHTML = ((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) + 's'; //add breed time for next army;
			addToolTipToArmyCount();
		}
		//Core
		if (getPageSetting('AutoMaps') > 0 && game.global.mapsUnlocked) autoMap();
		if (getPageSetting('showautomapstatus') == true) updateAutoMapsStatus();
		if (getPageSetting('ManualGather2') > 0) autoGather();
		if (getPageSetting('TrapTrimps') && game.global.trapBuildAllowed && game.global.trapBuildToggled == false) toggleAutoTrap();
		if (getPageSetting('ATGA2') == true) ATGA2();
		if (aWholeNewWorld && getPageSetting('AutoRoboTrimp')) autoRoboTrimp();
		if (game.global.challengeActive == "Daily" && getPageSetting('buyheliumy') >= 1 && getDailyHeliumValue(countDailyWeight()) >= getPageSetting('buyheliumy') && game.global.b >= 100 && !game.singleRunBonuses.heliumy.owned) purchaseSingleRunBonus('heliumy');
		if (aWholeNewWorld && getPageSetting('FinishC2') > 0 && game.global.runningChallengeSquared) finishChallengeSquared();
		if (getPageSetting('spendmagmite') == 2 && !magmiteSpenderChanged) autoMagmiteSpender();
		if (getPageSetting('AutoNatureTokens') && game.global.world > 229) autoNatureTokens();
		if (getPageSetting('autoenlight') && game.global.world > 229 && game.global.uberNature == false) autoEnlight();
		if (getPageSetting('BuyUpgradesNew') != 0) buyUpgrades();

		//Buildings
		if (getPageSetting('BuyBuildingsNew') == 1) buyBuildings();
		if (getPageSetting('UseAutoGen') == true && game.global.world > 229) autoGenerator();

		//Jobs
		if (getPageSetting('BuyJobsNew') > 0) buyJobs();
		//Heirloom Management
		if (getPageSetting('Hhs')) HeirloomSwapping();

		//Portal
		if (autoTrimpSettings.AutoPortal.selected != "Off" && game.global.challengeActive != "Daily" && !game.global.runningChallengeSquared) autoPortal();
		if (getPageSetting('AutoPortalDaily') > 0 && game.global.challengeActive == "Daily") dailyAutoPortal();
		if (getPageSetting('c2runnerstart') == true && getPageSetting('c2runnerportal') > 0 && game.global.runningChallengeSquared && game.global.world >= getPageSetting('c2runnerportal')) c2runnerportal();

		//Combat
		if (getPageSetting('ForceAbandon') == true || getPageSetting('fuckanti') > 0) trimpcide();
		if (getPageSetting('trimpsnotdie') == true && game.global.world > 1) helptrimpsnotdie();
		if (!game.global.fighting) {
			if (getPageSetting('fightforever') == 0) fightalways();
			else if (getPageSetting('fightforever') > 0 && HDRatio <= getPageSetting('fightforever')) fightalways();
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


		//AutoEquip
		if (getPageSetting('Hequipon')) RautoEquip();

		//Bone Upgrades / Settings
		if (autoTrimpSettings.hBoneShrineDefaultSettings.value.active) BoneShrine();

		if (getPageSetting('hEquipEfficientEquipDisplay')) {
			if (oneSecondInterval) {
				displayMostEfficientEquipment();
				if (game.options.menu.equipHighlight.enabled > 0) toggleSetting("equipHighlight")
			}
		}

		//Spire
		if (getPageSetting('ExitSpireCell') > 0 && game.global.challengeActive != "Daily" && getPageSetting('IgnoreSpiresUntil') <= game.global.world && game.global.spireActive) exitSpireCell();
		if (getPageSetting('dExitSpireCell') >= 1 && game.global.challengeActive == "Daily" && getPageSetting('dIgnoreSpiresUntil') <= game.global.world && game.global.spireActive) dailyexitSpireCell();
		if (getPageSetting('SpireBreedTimer') > 0 && getPageSetting('IgnoreSpiresUntil') <= game.global.world) ATspirebreed();
		if (getPageSetting('spireshitbuy') && isDoingSpire()) buyshitspire();

		//Golden
		var agu = game.global.runningChallengeSquared ? getPageSetting('cAutoGoldenUpgrades') :
			game.global.challengeActive == "Daily" ? getPageSetting('dAutoGoldenUpgrades') :
				getPageSetting('AutoGoldenUpgrades');
		if (agu && agu != 'Off') autoGoldenUpgradesAT(agu);
	}

	//Logic for Universe 2
	if (game.global.universe == 2) {
		//Heirloom Shield Swap Check
		if (shieldEquipped !== game.global.ShieldEquipped.id) HeirloomShieldSwapped();
		//Initiate Farming Code
		rMapSettings = FarmingDecision();
		rCurrentMap = rMapSettings.mapName;
		//RCore
		//AutoMaps
		if (getPageSetting('RAutoMaps') > 0 && game.global.mapsUnlocked) autoMap();
		//Status - AutoMaps
		if (getPageSetting('Rshowautomapstatus')) updateAutoMapsStatus();
		//RBuildings
		if (getPageSetting('RBuyBuildingsNew')) buyBuildings();
		//RUpgrades
		if (!(game.global.challengeActive == "Quest" && game.global.world > 5 && game.global.lastClearedCell < 90 && ([5].indexOf(questcheck()) >= 0))) {
			if (getPageSetting('RBuyUpgradesNew') != 0)
				RbuyUpgrades();
		}
		//Gather
		if (getPageSetting('RManualGather2') > 0) autoGather();
		//Auto Traps
		if (getPageSetting('RTrapTrimps') && game.global.trapBuildAllowed && game.global.trapBuildToggled == false) toggleAutoTrap();
		//RJobs
		if (getPageSetting('RBuyJobsNew') > 0) buyJobs();
		if (game.global.runningChallengeSquared && rC3EndZoneSetting != game.stats.zonesCleared.value) {
			if (getPageSetting('c3finishrun') !== -1) {
				if ((getPageSetting('c3finishrun') - 1) === game.global.world)
					debug("Warning: AT will " + (getPageSetting('RdownloadSaves') ? 'download your save and ' : '') + "abandon your challenge when starting your next zone. If you want to stop this increase the zone set in 'Finish C3' or set it to -1")
				if (getPageSetting('c3finishrun') <= game.global.world) {
					debug("Pausing" + (getPageSetting('RdownloadSaves') ? ', downloading save' : '') + " and abandoning challenge as your run has reached your specified end point on " + game.global.world + ".")
					AbandonChallengeRuns()
				}
				if (getPageSetting('c3finishrun') <= game.c2[game.global.challengeActive]) {
					debug("The zone input in the 'C3 Finish' setting (" + getPageSetting('c3finishrun') + ") is below or equal to your HZE for this challenge " + game.c2[game.global.challengeActive] + ". Increase it or it'll end earlier than you\'d probably like it to.");
				}
			}
			//Quest -- Warning message when AutoStructure Smithy purchasing is enabled.
			if (game.global.challengeActive == "Quest" && getPageSetting('RBuyBuildingsNew')) {
				if (getAutoStructureSetting().enabled && game.global.autoStructureSettingU2.Smithy.enabled) {
					debug("You have the setting for Smithy autopurchase enabled in the AutoStructure settings. This setting has the chance to cause issues later in the run.")
				}
				//Quest -- Warning message when C3 Finish Run setting isn't greater than your quest HZE.
				if (game.global.runningChallengeSquared && (getPageSetting('rQuestSmithyZone') === -1 ? Infinity : getPageSetting('rQuestSmithyZone')) <= game.c2.Quest) {
					debug("The setting 'Q: Smithy Zone' is lower or equal to your current Quest HZE. Increase this or smithies will be bought earlier than they should be.")
				}
			}
			//Downsize -- Warning message when about map settings causing issues later.
			if (game.global.challengeActive == "Downsize") {
				if (game.global.world < 10) {
					debug("Be aware that your usual C3 farming settings will not work properly for this Downsize run and likely cause it to stall out so high chance you will want to amend or disable them.")
				}
			}
			rC3EndZoneSetting = game.stats.zonesCleared.value;
		}

		//Portal - Daily + Regular
		if (autoTrimpSettings.RAutoPortal.selected != "Off" && game.global.challengeActive != "Daily" && (!game.global.runningChallengeSquared || autoTrimpSettings.RAutoPortal.selected === 'Challenge 3')) RautoPortal();
		if (getPageSetting('RAutoPortalDaily') > 0 && game.global.challengeActive == "Daily" && game.global.world >= getPageSetting('RAutoPortalDaily')) RdailyAutoPortal();

		//Archeology
		if (getPageSetting('Rarchon') && game.global.challengeActive == "Archaeology") archstring();
		//AutoEquip
		if (getPageSetting('Requipon') && (!(game.global.challengeActive == "Quest" && game.global.world > 5 && game.global.lastClearedCell < 90 && ([2, 3].indexOf(questcheck()) >= 0)))) RautoEquip();
		//Combat
		if (getPageSetting('BetterAutoFight') == 1) betterAutoFight();
		if (getPageSetting('BetterAutoFight') == 2) betterAutoFight3();
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
		if (autoTrimpSettings.rBoneShrineDefaultSettings.value.active) BoneShrine();
		if (game.global.challengeActive == "Daily" && getPageSetting('buyradony') >= 1 && getDailyHeliumValue(countDailyWeight()) >= getPageSetting('buyradony') && game.global.b >= 100 && !game.singleRunBonuses.heliumy.owned) purchaseSingleRunBonus('heliumy');
		if (game.global.runningChallengeSquared || game.global.challengeActive == 'Mayhem' || game.global.challengeActive == 'Pandemonium') BuySingleRunBonuses()
		//Respecing between presets based on Destacking or Farming when running Pandemonium. Uses preset 2 for destacking and preset 3 while farming.
		if (game.global.challengeActive == "Pandemonium" && getPageSetting('rPandRespec')) PandemoniumPerkRespec();

		if (getPageSetting('rEquipEfficientEquipDisplay')) {
			if (oneSecondInterval) {
				displayMostEfficientEquipment();
				if (game.options.menu.equipHighlight.enabled > 0) toggleSetting("equipHighlight")
			}
		}
	}

	if (game.global.stringVersion >= '5.8.0' && getPageSetting('automateSpireAssault') && autoBattle.maxEnemyLevel !== 132)
		automateSpireAssault();
}

function guiLoop() {
	updateCustomButtons(),
		safeSetItems('storedMODULES', JSON.stringify(compareModuleVars())),
		getPageSetting('EnhanceGrids') &&
		MODULES.fightinfo.Update(), 'undefined' != typeof MODULES && 'undefined' != typeof MODULES.performance && MODULES.performance.isAFK && MODULES.performance.UpdateAFKOverlay()
}
function mainCleanup() {
	lastrunworld = currentworld;
	currentworld = game.global.world;
	aWholeNewWorld = lastrunworld != currentworld;

	lastradonhze = currentradonhze;
	currentradonhze = game.global.highestRadonLevelCleared + 1;
	aWholeNewHZE = lastradonhze != currentradonhze;

	if (game.global.universe == 1 && currentworld == 1 && aWholeNewWorld) {
		lastHeliumZone = 0;
		zonePostpone = 0;
		if (!game.upgrades.Battle.done) {
			updateButtonText()
			if (getPageSetting('automapsportal') && getPageSetting('AutoMaps') == 0)
				autoTrimpSettings["AutoMaps"].value = 1;

		}
		if (getPageSetting('showautomapstatus')) updateAutoMapsStatus();
		return true;
	}
	if (game.global.universe == 2 && currentworld == 1 && aWholeNewWorld) {
		lastRadonZone = 0;
		zonePostpone = 0;
		if (!game.upgrades.Battle.done) {
			game.global.buyAmt = 1;
			if (getPageSetting('Rautomapsportal') && getPageSetting('RAutoMaps') == 0) {
				autoTrimpSettings["RAutoMaps"].value = 1;
				document.getElementById('RAutoMaps').setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings.RAutoMaps.enabled);
				document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + autoTrimpSettings.RAutoMaps.value);
			}
			if (autoTrimpSettings.Rautoequipportal.enabled) {
				autoTrimpSettings.Requipon.enabled = true;
				document.getElementById('Requipon').setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings.Requipon.enabled);
				document.getElementById('autoEquipLabel').parentNode.setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings.Requipon.enabled);
			}
			if (typeof (autoTrimpSettings.rBuildingSettingsArray.value.portalOption) !== 'undefined' && autoTrimpSettings.rBuildingSettingsArray.value.portalOption === 'on') {
				autoTrimpSettings.RBuyBuildingsNew.enabled = true;
				document.getElementById('RBuyBuildingsNew').setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings.RBuyBuildingsNew.enabled);
				document.getElementById('autoStructureLabel').parentNode.setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings.RBuyBuildingsNew.enabled);
			}
			if (typeof (autoTrimpSettings.rBuildingSettingsArray.value.portalOption) !== 'undefined' && autoTrimpSettings.rBuildingSettingsArray.value.portalOption === 'off') {
				autoTrimpSettings.RBuyBuildingsNew.enabled = false;
				document.getElementById('RBuyBuildingsNew').setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings.RBuyBuildingsNew.enabled);
				document.getElementById('autoStructureLabel').parentNode.setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings.RBuyBuildingsNew.enabled);
			}
			if (typeof (autoTrimpSettings.rJobSettingsArray.value.portalOption) !== 'undefined' && autoTrimpSettings.rJobSettingsArray.value.portalOption === 'autojobs off') {
				autoTrimpSettings.RBuyJobsNew.value = 0;
				document.getElementById('RBuyJobsNew').setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + (autoTrimpSettings.RBuyJobsNew.value == 2 ? 3 : autoTrimpSettings.RBuyJobsNew.value));
				document.getElementById('autoJobLabel').parentNode.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + (autoTrimpSettings.RBuyJobsNew.value == 2 ? 3 : autoTrimpSettings.RBuyJobsNew.value));
			}
			if (typeof (autoTrimpSettings.rJobSettingsArray.value.portalOption) !== 'undefined' && autoTrimpSettings.rJobSettingsArray.value.portalOption === 'auto ratios') {
				autoTrimpSettings.RBuyJobsNew.value = 1;
				document.getElementById('RBuyJobsNew').setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + (autoTrimpSettings.RBuyJobsNew.value == 2 ? 3 : autoTrimpSettings.RBuyJobsNew.value));
				document.getElementById('autoJobLabel').parentNode.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + (autoTrimpSettings.RBuyJobsNew.value == 2 ? 3 : autoTrimpSettings.RBuyJobsNew.value));
			}
			if (typeof (autoTrimpSettings.rJobSettingsArray.value.portalOption) !== 'undefined' && autoTrimpSettings.rJobSettingsArray.value.portalOption === 'manual ratios') {
				autoTrimpSettings.RBuyJobsNew.value = 2;
				document.getElementById('RBuyJobsNew').setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + (autoTrimpSettings.RBuyJobsNew.value == 2 ? 3 : autoTrimpSettings.RBuyJobsNew.value));
				document.getElementById('autoJobLabel').parentNode.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + (autoTrimpSettings.RBuyJobsNew.value == 2 ? 3 : autoTrimpSettings.RBuyJobsNew.value));
			}
			updateButtonText()
			saveSettings();
		}
		if (getPageSetting('Rshowautomapstatus')) updateAutoMapsStatus();
		toggleRadonStatus(true);
		toggleRnHr(true);
		return true;
	}

	if (game.global.universe === 1 && (aWholeNewWorld || currentworld === 1)) {
		toggleStatus(true);
		toggleHeHr(true);
	}
	if (game.global.universe === 2 && (aWholeNewWorld || currentworld === 1)) {
		toggleRadonStatus(true);
		toggleRnHr(true);
	}
	if (getPageSetting('AutoEggs'))
		easterEggClicked();

	if (aWholeNewHZE) {
		radonChallengesSetting();
	}
}
function throwErrorfromMain() { throw new Error("We have successfully read the thrown error message out of the main file") }
