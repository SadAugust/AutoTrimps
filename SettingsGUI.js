function automationMenuInit() {
	var settingBtnSrch = document.getElementsByClassName("btn btn-default");
	for (var i = 0; i < settingBtnSrch.length; i++) {
		if (settingBtnSrch[i].getAttribute("onclick") === "toggleSettingsMenu()")
			settingBtnSrch[i].setAttribute("onclick", "autoPlusSettingsMenu()");
	}
	var newItem = document.createElement("TD");
	newItem.appendChild(document.createTextNode("AutoTrimps"));
	newItem.setAttribute("class", "btn btn-default");
	newItem.setAttribute("onclick", "autoToggle()");
	var settingbarRow = document.getElementById("settingsTable").firstElementChild.firstElementChild;
	settingbarRow.insertBefore(newItem, settingbarRow.childNodes[10]);

	//AutoMaps
	var autoMapsContainer = document.createElement("DIV");
	autoMapsContainer.setAttribute("style", "margin-top: 0.2vw; display: block; font-size: 1.1vw; height: 1.5em; text-align: center; border-radius: 4px");
	autoMapsContainer.setAttribute("id", "autoMapBtn");
	autoMapsContainer.setAttribute("class", "toggleConfigBtn noselect settingsBtn");
	autoMapsContainer.setAttribute("onClick", "toggleAutoMaps()");
	autoMapsContainer.setAttribute("onmouseover", 'tooltip(\"Toggle Automapping\", \"customText\", event, \"Toggle automapping on and off.\")');
	autoMapsContainer.setAttribute("onmouseout", 'tooltip("hide")');
	autoMapsContainer.innerHTML = 'Auto Maps';
	var fightButtonCol = document.getElementById("battleBtnsColumn");
	fightButtonCol.appendChild(autoMapsContainer);

	var autoMapsStatusContainer = document.createElement("DIV");
	autoMapsStatusContainer.setAttribute("style", "display: none; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);");
	autoMapsStatusContainer.setAttribute("onmouseout", 'tooltip("hide")');
	var autoMapsStatusText = document.createElement("SPAN");
	autoMapsStatusText.id = 'autoMapStatus';
	autoMapsStatusContainer.appendChild(autoMapsStatusText);
	fightButtonCol.appendChild(autoMapsStatusContainer);

	var resourcePerHourContainer = document.createElement("DIV");
	resourcePerHourContainer.setAttribute("style", "display: none; font-size: 1vw; text-align: center; margin-top: 2px; background-color: rgba(0,0,0,0.3);");

	resourcePerHourContainer.setAttribute("onmouseover", 'tooltip(\"Helium/Hr Info\", \"customText\", event, \"1st is Current He/hr % out of Lifetime He(not including current+unspent).<br> 0.5% is an ideal peak target. This can tell you when to portal... <br>2nd is Current run Total He earned / Lifetime He(not including current)<br>\" + getDailyHeHrStats())');

	resourcePerHourContainer.setAttribute("onmouseout", 'tooltip("hide")');
	var resourcePerHourButton = document.createElement("SPAN");
	resourcePerHourButton.id = 'hiderStatus';
	resourcePerHourContainer.appendChild(resourcePerHourButton);
	fightButtonCol.appendChild(resourcePerHourContainer);


	var voidMapContainer = document.createElement("DIV");
	voidMapContainer.setAttribute("style", "display: block; font-size: 0.9vw; text-align: centre; background-color: rgba(0, 0, 0, 0.3);");
	var voidMapText = document.createElement("SPAN");
	voidMapContainer.setAttribute("onmouseover", 'tooltip(\"Additional AT Info\", \"customText\", event, \"<b>Void</b>: The progress you have towards a free void map from the \'Void Maps\' permanent bone upgrade.<br>\
	<b>Auto Level</b>: The level that AT recommends using whilst farming.<br>\
	<b>T</b>: Your current tenacity time\")');
	voidMapText.setAttribute("onmouseout", 'tooltip("hide")');
	voidMapText.id = 'freeVoidMap';
	fightButtonCol.appendChild(voidMapContainer);
	voidMapContainer.appendChild(voidMapText);
	var trimpsButtonCol = document.getElementById("trimps");
	trimpsButtonCol.appendChild(voidMapContainer);

	var $portalTimer = document.getElementById('portalTimer');
	$portalTimer.setAttribute('onclick', 'toggleSetting(\'pauseGame\')');
	$portalTimer.setAttribute('style', 'cursor: default');

	var btns = document.getElementsByClassName("fightBtn");
	for (var x = 0; x < btns.length; x++) {
		btns[x].style.padding = "0.01vw 0.01vw";
	}
}

function automationMenuSettingsInit() {
	var a = document.getElementById("settingsRow"),
		b = document.createElement("DIV");
	(b.id = "autoSettings"), b.setAttribute("style", "display: none; max-height: 92.5vh;overflow: auto;"), b.setAttribute("class", "niceScroll"), a.appendChild(b);
}

automationMenuSettingsInit();

var link1 = document.createElement("link");
(link1.rel = "stylesheet"),
	(link1.type = "text/css"),
	(link1.href = basepath + "tabs.css"),
	document.head.appendChild(link1);

function createTabs(a, b) {
	var c = document.createElement("li"),
		d = document.createElement("a");
	(d.className = "tablinks"), d.setAttribute("onclick", "toggleTab(event, '" + a + "')"), (d.href = "#"), d.appendChild(document.createTextNode(a)), (c.id = "tab" + a), c.appendChild(d), addtabsUL.appendChild(c), createTabContents(a, b);
}

function createTabContents(a, b) {
	var c = document.createElement("div");
	(c.className = "tabcontent"), (c.id = a);
	var d = document.createElement("div");
	d.setAttribute("style", "margin-left: 1vw; margin-right: 1vw;");
	var e = document.createElement("h4");
	e.setAttribute("style", "font-size: 1.2vw;"), e.appendChild(document.createTextNode(b)), d.appendChild(e), c.appendChild(d), addTabsDiv.appendChild(c);
}

function toggleTab(a, b) {
	-1 < a.currentTarget.className.indexOf(" active")
		? ((document.getElementById(b).style.display = "none"), (a.currentTarget.className = a.currentTarget.className.replace(" active", "")))
		: ((document.getElementById(b).style.display = "block"), (a.currentTarget.className += " active"));
}

function minimizeAllTabs() {
	for (var a = document.getElementsByClassName("tabcontent"), b = 0, c = a.length; b < c; b++) a[b].style.display = "none";
	for (var d = document.getElementsByClassName("tablinks"), b = 0, c = d.length; b < c; b++) d[b].className = d[b].className.replace(" active", "");
}

function maximizeAllTabs() {
	for (var a = document.getElementsByClassName("tabcontent"), b = 0, c = a.length; b < c; b++) a[b].style.display = "block";
	for (var d = document.getElementsByClassName("tablinks"), b = 0, c = d.length; b < c; b++) (d[b].style.display = "block"), d[b].className.includes(" active") || (d[b].className += " active");
}

var addTabsDiv;
var addtabsUL;

function checkLiqZoneCount() {
	if (game.options.menu.liquification.enabled == 0) return 0;
	/* if (game.global.universe == 2) {
		if (!u2Mutations.tree.Liq1.purchased) return 0;
		var amt = 0.1;
		if (u2Mutations.tree.Liq2.purchased) amt = 0.2;
		return ((getHighestLevelCleared(false, true) + 1) * amt);
	} */
	var spireCount = game.global.spiresCompleted;
	if (game.talents.liquification.purchased) spireCount++;
	if (game.talents.liquification2.purchased) spireCount++;
	if (game.talents.liquification3.purchased) spireCount += 2;
	spireCount += (Fluffy.isRewardActive("liquid") * 0.5);
	var liquidAmount = ((spireCount) / 20);
	return (((game.global.highestLevelCleared + 1) * liquidAmount));
}

function initializeAllTabs() {
	addTabsDiv = document.createElement('div');
	addtabsUL = document.createElement('ul');
	addtabsUL.className = "tab";
	addtabsUL.id = 'autoTrimpsTabBarMenu';
	addtabsUL.style.display = "none";
	var sh = document.getElementById("settingsRow")
	sh.insertBefore(addtabsUL, sh.childNodes[2]);
	createTabs("Core", "Core - Main Controls for the script");
	createTabs("Buildings", "Building Settings");
	createTabs("Jobs", "Jobs - Worker Settings");
	createTabs("Gear", "Gear - Equipment Settings");
	createTabs("Maps", "Maps - AutoMaps & VoidMaps Settings");
	createTabs("Spire", "Spire - Settings for Spires");
	createTabs("Daily", "Dailies - Settings for Dailies");
	createTabs("C2", "C2 - Settings for C2s");
	createTabs("Challenges", "Challenges - Settings for Specific Challenges");
	createTabs("Combat", "Combat & Stance Settings");
	createTabs("Windstacking", "Windstacking Settings");
	createTabs("ATGA", "Geneticassist Settings");
	createTabs("Scryer", "Scryer Settings");
	createTabs("Magma", "Dimensional Generator & Magmite Settings");
	createTabs("Heirlooms", "Heirloom Settings");
	createTabs("Golden", "Golden Upgrade Settings");
	createTabs("Nature", "Nature Settings");
	createTabs("Display", "Display & Spam Settings");
	createTabs("Import Export", "Import & Export Settings");
	createTabs("Legacy", "Legacy Settings. Will be removed every major patch cycle.");
	var li_0 = document.createElement('li');
	var a_0 = document.createElement('a');
	a_0.className = "tablinks minimize";
	a_0.setAttribute('onclick', 'minimizeAllTabs();');
	a_0.href = "#";
	a_0.appendChild(document.createTextNode("-"));
	li_0.appendChild(a_0);
	li_0.setAttribute("style", "float:right!important;");
	li_0.setAttribute("onmouseover", 'tooltip("Minimize all tabs", "customText", event, "Minimize all AT settings tabs.")');
	li_0.setAttribute("onmouseout", 'tooltip("hide")');
	var li_1 = document.createElement('li');
	var a_1 = document.createElement('a');
	a_1.className = "tablinks maximize";
	a_1.setAttribute('onclick', 'maximizeAllTabs();');
	a_1.href = "#";
	a_1.appendChild(document.createTextNode("+"));
	li_1.appendChild(a_1);
	li_1.setAttribute("style", "float:right!important;");
	li_1.setAttribute("onmouseover", 'tooltip("Maximize all tabs", "customText", event, "Maximize all AT settings tabs.")');
	li_1.setAttribute("onmouseout", 'tooltip("hide")');
	var li_2 = document.createElement('li');
	var a_2 = document.createElement('a');
	a_2.className = "tablinks tabclose";
	a_2.setAttribute('onclick', 'autoToggle();');
	a_2.href = "#";
	a_2.appendChild(document.createTextNode("x"));
	li_2.appendChild(a_2);
	li_2.setAttribute("style", "float:right!important;");
	li_2.setAttribute("onmouseover", 'tooltip("Exit (duplicate)", "customText", event, "Closes/toggles/hides AutoTrimps (just a UI shortcut)")');
	li_2.setAttribute("onmouseout", 'tooltip("hide")');
	addtabsUL.appendChild(li_2);
	addtabsUL.appendChild(li_1);
	addtabsUL.appendChild(li_0);
	document.getElementById("autoSettings").appendChild(addTabsDiv);
	document.getElementById("Core").style.display = "block";
	document.getElementsByClassName("tablinks")[0].className += " active";
}

initializeAllTabs();

function initializeAllSettings() {

	var heliumChallenges = ["Off", "Helium Per Hour"];
	var heliumHourChallenges = ["None"];
	var challenge2 = ["None"];

	//Core
	const displayCore = true;
	if (displayCore) {
		createSetting('gatherType',
			function () { return (['Manual Gather/Build', 'Auto Gather/Build', 'Mining/Building Only', 'Science Research OFF']) },
			function () { return ('Controls what you gather/build do. Manual does nothing<br>Auto Gathering of Food,Wood,Metal(w/turkimp) & Science. Auto speed-Builds your build queue. <br>Mining/Building only does exactly what it says. Only use if you are passed the early stages of the game and have the mastery foremany unlocked (No longer need to trap, food and wood are useless). <br>You can disable science researching for the achievement: Reach Z120 without using manual research.') },
			'multitoggle', 1, null, 'Core', [1, 2]);
		createSetting('upgradeType',
			function () { return (['Manual Upgrades', 'Buy All Upgrades', 'Upgrades no Coords']) },
			function () { return ('Autobuys non-equipment upgrades (equipment is controlled in the Gear tab). The second option does NOT buy coordination (use this <b>ONLY</b> if you know what you\'re doing).') },
			'multitoggle', 1, null, 'Core', [1, 2]);
		createSetting('TrapTrimps',
			function () { return ('Trap Trimps') },
			function () { return ('Automatically trap trimps when needed, including building traps. (when you turn this off, you may aswell turn off the in-game autotraps button, think of the starving trimps that could eat that food!)') },
			'boolean', true, null, 'Core', [1, 2]);
		createSetting('autoPerks',
			function () { return ('Auto Allocate Perks') },
			function () { return ('Uses a basic version of Perky/Surky (if you want more advanced settings import your save into the desired tool).') },
			'boolean', false, null, 'Core', [1, 2]);
		createSetting('downloadSaves',
			function () { return ('Download Saves') },
			function () { return ('Will automatically download saves whenever AutoTrimps portals.') },
			'boolean', false, null, 'Core', [1, 2]);
		createSetting('presetSwap',
			function () { return ('Preset Swapping') },
			function () { return ('Will automatically swap Surky presets when portaling into runs. Fillers will load \"Easy Radon Challenge\", Dailies will load \"Difficult Radon Challenge\", and \"Push/C3/Mayhem\" when portaling into any C3s or Mayhem-like challenges.') },
			'boolean', false, null, 'Core', [2],
			function () { return (getPageSetting('autoPerks')) });

		createSetting('radonsettings',
			function () { return (['Helium', 'Radon']) },
			function () { return ('Switch between Helium (U1) and Radon (U2) settings. ') },
			'multitoggle', 0, null, 'Core', [1, 2]);
		var $radonsettings = document.getElementById('radonsettings');
		$radonsettings.parentNode.style.setProperty('float', 'right');
		$radonsettings.parentNode.style.setProperty('margin-right', '1vw');
		$radonsettings.parentNode.style.setProperty('margin-left', '0');

		//Gator settings
		createSetting('amalcoord',
			function () { return ('Amal Boost') },
			function () { return ('Boost your Amal count for more Mi. Will not buy coords until your H:D ratio is below a certain value. This means that you will get amals quicker. Will not activate higher than your Amal Boost End Zone Setting! ') },
			'boolean', false, null, 'Core', [1]);
		createSetting('amalcoordt',
			function () { return ('Amal Target') },
			function () { return ('Set the amount of Amals you wish to aim for. Once this target is reached, it will buy coords below your Amal ratio regardless of your H:D, just enough to keep the Amal. -1 to disable and use H:D for entire boost. ') },
			'value', -1, null, 'Core', [1],
			function () { return (autoTrimpSettings.amalcoord.enabled) });
		createSetting('amalcoordhd',
			function () { return ('Amal Boost H:D') },
			function () { return ('Set your H:D for Amal Boost here. The higher it is the less coords AT will buy. 0.0000025 is the default. ') },
			'value', 0.0000025, null, 'Core', [1],
			function () { return (autoTrimpSettings.amalcoord.enabled) });
		createSetting('amalcoordz',
			function () { return ('Amal Boost End Z') },
			function () { return ('Amal Boost End Zone. Set the zone you want to stop Amal Boosting. -1 to do it infinitely. ') },
			'value', -1, null, 'Core', [1],
			function () { return (autoTrimpSettings.amalcoord.enabled) });

		//Auto Portal
		createSetting('autoPortal',
			function () { return ('AutoPortal') },
			function () { return ('Automatically portal. Will NOT auto-portal if you have a challenge active, the challenge setting dictates which challenge it will select for the next run. All challenge settings will portal right after the challenge ends, regardless. ' + resource() + ' Per Hour only <b>portals at cell 1</b> of the first level where your ' + resourceHour() + '/Hr went down even slightly compared to the current runs Best ' + resourceHour() + '/Hr. Take note, there is a Buffer option, which is like a grace percentage of how low it can dip without triggering. Setting a buffer will portal mid-zone if you exceed 5x of the buffer.  CAUTION: Selecting ' + resourceHour() + '/hr may immediately portal you if its lower-(use Pause AutoTrimps button to pause the script first to avoid this)') },
			'dropdown', 'Off', heliumChallenges, 'Core', [1, 2]);

		createSetting('heliumHourChallenge',
			function () { return ('Challenge') },
			function () { return ('Automatically portal into this challenge when using ' + resource().toLowerCase() + ' per hour or custom autoportal. Custom portals after cell 100 of the zone specified. Do not choose a challenge if you havent unlocked it. ') },
			'dropdown', 'None', heliumHourChallenges, 'Core', [1, 2],
			function () {
				return (
					getPageSetting('autoPortal', currSettingUniverse) === 'Helium Per Hour' || getPageSetting('autoPortal', currSettingUniverse) === 'Radon Per Hour' || getPageSetting('autoPortal', currSettingUniverse) === 'Custom')
			});
		createSetting('heliumC2Challenge',
			function () { return ('Challenge') },
			function () { return ('Automatically portal into this challenge when using \'Challenge 2\' portal option on autoportal. Portals on the zone specified in \'Custom Portal\'. Must end the challenges with the \'Finish ' + cinf() + ' setting in the ' + cinf() + ' tab if you want to run the challenge multiple times.') },
			'dropdown', 'None', challenge2, 'Core', [1, 2],
			function () {
				return (
					getPageSetting('autoPortal', currSettingUniverse) === 'Challenge 2' || getPageSetting('autoPortal', currSettingUniverse) === 'Challenge 3')
			});
		createSetting('autoPortalZone',
			function () { return ('Portal Zone') },
			function () { return ('Automatically portal at this zone. (ie: setting to 200 would portal when you reach zone 200)') },
			'value', '999', null, 'Core', [1, 2],
			function () {
				return (
					getPageSetting('autoPortal', currSettingUniverse) === 'Challenge 2' || getPageSetting('autoPortal', currSettingUniverse) === 'Challenge 3' || getPageSetting('autoPortal', currSettingUniverse) === 'Custom')
			});
		createSetting('HeHrDontPortalBefore',
			function () { return ('Don\'t Portal Before') },
			function () { return ('Do NOT allow ' + resource() + ' per Hour AutoPortal setting to portal BEFORE this level is reached. It is an additional check that prevents drops in ' + resource().toLowerCase() + '/hr from triggering autoportal. Set to 0 or -1 to completely disable this check. (only shows up with ' + resource() + ' per Hour set)') },
			'value', '999', null, 'Core', [1, 2],
			function () {
				return (
					getPageSetting('autoPortal', currSettingUniverse) === ('Hour'))
			});
		createSetting('HeliumHrBuffer',
			function () { return (resourceHour() + '/Hr Portal Buffer %') },
			function () { return ('IMPORTANT SETTING. When using the ' + resourceHour() + '/Hr Autoportal, it will portal if your ' + resourceHour() + '/Hr drops by this amount of % lower than your best for current run, default is 0% (ie: set to 5 to portal at 95% of your best). Now with stuck protection - Allows portaling midzone if we exceed set buffer amount by 5x. (ie a normal 2% buffer setting would now portal mid-zone you fall below 10% buffer).') },
			'value', '0', null, 'Core', [1, 2],
			function () {
				return (
					getPageSetting('autoPortal', currSettingUniverse) === 'Helium Per Hour' || getPageSetting('autoPortal', currSettingUniverse) === 'Radon Per Hour')
			});
		createSetting('HeliumHrPortal',
			function () { return (['Auto Portal Immediately', 'Portal after voids', 'Push Poison for voids']) },
			function () { return ('Autobuys non-equipment upgrades (equipment is controlled in the Gear tab). The second option does NOT buy coordination (use this <b>ONLY</b> if you know what you\'re doing).') },
			'multitoggle', 1, null, 'Core', [1],
			function () {
				return (
					getPageSetting('autoPortal', currSettingUniverse) === 'Helium Per Hour' || getPageSetting('autoPortal', currSettingUniverse) === 'Radon Per Hour')
			});
		createSetting('portalVoidIncrement',
			function () { return ('Liq for free Void') },
			function () { return ('Delays auto portaling into your preferred run and repeatedly does U1 portals until your bone void counter is 1 drop away from a guaranteed extra void map.') },
			'boolean', false, null, 'Core', [1, 2],
			function () { return (game.permaBoneBonuses.voidMaps.owned >= 5 && checkLiqZoneCount() >= 20) });


		//Pause + Switch
		createSetting('PauseScript',
			function () { return ('Pause AutoTrimps') },
			function () { return ('Pause AutoTrimps Script (not including the graphs module)') },
			'boolean', null, null, 'Core', [1, 2]);
		var $pauseScript = document.getElementById('PauseScript');
		$pauseScript.parentNode.style.setProperty('float', 'right');
		$pauseScript.parentNode.style.setProperty('margin-right', '1vw');
		$pauseScript.parentNode.style.setProperty('margin-left', '0');

		createSetting('AutoEggs',
			function () { return ('AutoEggs') },
			function () { return ('Click easter egg if it exists, upon entering a new zone. Warning: Quite overpowered. Please solemnly swear that you are up to no good.') },
			'boolean', false, null, 'Core', [1, 2],
			function () { return (!game.worldUnlocks.easterEgg.locked) });
		var $eggSettings = document.getElementById('AutoEggs');
		$eggSettings.parentNode.style.setProperty('float', 'right');
		$eggSettings.parentNode.style.setProperty('margin-right', '1vw');
		$eggSettings.parentNode.style.setProperty('margin-left', '0');
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Daily
	const displayDaily = true
	if (displayDaily) {
		createSetting('buyheliumy',
			function () { return ('Buy Heliumy %') },
			function () { return ('Buys the Heliumy bonus for <b>100 bones</b> when Daily bonus is above the value set in this setting. Recommend anything above 475. Will not buy if you cant afford to, or value is -1. ') },
			'value', -1, null, 'Daily', [1]);
		createSetting('dfightforever',
			function () { return (['DFA: Off', 'DFA: Non-Empowered', 'DFA: All Dailies']) },
			function () { return ('Daily Fight Always. Sends trimps to fight if they\'re not fighting in Daily challenges similar to Toxicity/Nom but not on Bloodthirst/Plagued/Bogged Dailies, regardless of BAF. Non-Empowered will only send to fight if the Daily is not Empowered. Essenitally the same as the one in combat, can use either if you wish, except this will only activate in these daily challenges (duh) ') },
			'multitoggle', '0', null, 'Daily', [1]);
		createSetting('avoidempower',
			function () { return ('Avoid Empower') },
			function () { return ('Tries to avoid Empower stacks in Empower Dailies. No harm in this being on, so default is On. ') },
			'boolean', true, null, 'Daily', [1]);
		createSetting('dscryvoidmaps',
			function () { return ('Daily VM Scryer') },
			function () { return ('Only use in Dailies if you have Scryhard II, for er, obvious reasons. Works without the scryer options. ') },
			'boolean', false, null, 'Daily', [1]);

		createSetting('dIgnoreSpiresUntil',
			function () { return ('Daily Ignore Spires Until') },
			function () { return ('Spire specific settings like end-at-cell are ignored until at least this zone is reached in Dailies (0 to disable). ') },
			'value', '200', null, 'Daily', [1]);
		createSetting('dExitSpireCell',
			function () { return ('Daily Exit Spire Cell') },
			function () { return ('What cell to exit spire in dailys. ') },
			'value', -1, null, 'Daily', [1]);
		createSetting('dPreSpireNurseries',
			function () { return ('Daily Nurseries pre-Spire') },
			function () { return ('Set the maximum number of Nurseries to build for Spires in Dailies. Overrides No Nurseries Until z and Max Nurseries so you can keep them seperate! Disable with -1.') },
			'value', -1, null, 'Daily', [1]);

		createSetting('use3daily',
			function () { return ('Daily Windstacking') },
			function () { return ('<b> This must be on for Daily windstacking settings to appear!</b> Overrides your Autostance settings to use the WS stance on Dailies. ') },
			'boolean', false, null, 'Daily', [1]);
		createSetting('dWindStackingMin',
			function () { return ('Daily Windstack Min Zone') },
			function () { return ('For use with Windstacking Stance, enables windstacking in zones above and inclusive of the zone set for dailys. (Get specified windstacks then change to D, kill bad guy, then repeat). This is designed to force S use until you have specified stacks in wind zones, overriding scryer settings. All windstack settings apart from Daily WS MAX work off this setting. ') },
			'value', '-1', null, 'Daily', [1],
			function () { return (autoTrimpSettings.use3daily.enabled) });
		createSetting('dWindStackingMinHD',
			function () { return ('Daily Windstack H:D') },
			function () { return ('For use with Windstacking Stance in Dailies, fiddle with this to maximise your stacks in wind zones for Dailies. If H:D is above this setting it will not use W stance. If it is below it will. ') },
			'value', '-1', null, 'Daily', [1],
			function () { return (autoTrimpSettings.use3daily.enabled) });
		createSetting('dWindStackingMax',
			function () { return ('Daily Windstack Stacks') },
			function () { return ('For use with Windstacking Stance in Dailies. Amount of windstacks to obtain before switching to D stance. Default is 200, but I recommend anywhere between 175-190. In Wind Enlightenment it will add 100 stacks to your total automatically. So if this setting is 200 It will assume you want 300 stacks instead during enlightenment. ') },
			'value', '200', null, 'Daily', [1],
			function () { return (autoTrimpSettings.use3daily.enabled) });
		createSetting('liqstack',
			function () { return ('Stack Liquification') },
			function () { return ('Stack Wind zones during Wind Enlight during Liquification. ') },
			'boolean', false, null, 'Daily', [1],
			function () { return (autoTrimpSettings.use3daily.enabled) });

		createSetting('buyradony',
			function () { return ('Buy Radonculous %') },
			function () { return ('Buys the Radonculous bonus for <b>100 bones</b> when Daily bonus is above the value set in this setting. Recommend anything above 475. Will not buy if you cant afford to, or value is -1. ') },
			'value', -1, null, 'Daily', [2]);
		createSetting('bloodthirstDestack',
			function () { return ('Bloodthirst Destack') },
			function () { return ('Will automatically run a level 6 map when you are one stack (death) away from the enemy healing and gaining additional attack. <b>Won\'t function properly without Auto Maps enabled.</b>') },
			'boolean', false, null, 'Daily', [2]);
		createSetting('bloodthirstVoidMax',
			function () { return ('Void: Max Bloodthirst') },
			function () { return ('Will make your Void HD Ratio assume you have max Bloodthirst stacks active if you\'re in a Bloodthirst daily.</b>') },
			'boolean', true, null, 'Daily', [2]);
		createSetting('empowerAutoEquality',
			function () { return ('AE: Empower') },
			function () { return ('Will automatically adjust the enemies stats to factor in either Explosive or Crit modifiers if they\'re active on the current daily.</b>') },
			'boolean', true, null, 'Daily', [2],
			function () { return (getPageSetting('equalityManagement') === 2) });
		createSetting('mapOddEvenIncrement',
			function () { return ('Odd/Even Increment') },
			function () {
				return ('Will automatically increment your farming settings world input by 1 if the current zone has a negative even or odd related buff. If the daily has both types of mods it\'ll continue running them as normal.<br>\
		Won\'t do anything to Prestige Raiding inputs.')
			}
			, 'boolean', false, null, 'Daily', [2],
			function () { return (false) });

		//Daily Portal
		createSetting('dailyPortalStart',
			function () { return ('Auto Start Daily') },
			function () { return ('Starts Dailies for you. When you portal with this on, it will select the oldest Daily and run it. Use the settings in this tab to decide whats next. ') },
			'boolean', false, null, 'Daily', [1, 2]);
		createSetting('dailyPortal',
			function () { return (['Daily Portal Off', 'DP: ' + resourceHour() + '/Hr', 'DP: Custom']) },
			function () {
				return ('\
	<b>DP: '+ resourceHour() + '/Hr:</b> Portals when your world zone is above the minium you set (if applicable) and the buffer falls below the % you have defined.\
	<br><b>DP: Custom:</b> Portals into this challenge at the zone you have defined in Daily Custom Portal.')
			}
			, 'multitoggle', '0', null, 'Daily', [1, 2]);

		createSetting('dailyHeliumHourChallenge',
			function () { return ('DP: Challenge') },
			function () { return ('Automatically portal into this challenge when using ' + resource().toLowerCase() + ' per hour or custom autoportal in dailies when there are none left. Custom portals on the zone specified in \'Daily Custom Portal\'. Do not choose a challenge if you havent unlocked it. ') },
			'dropdown', 'None', ['None', 'Balance', 'Decay', 'Electricity', 'Life', 'Crushed', 'Nom', 'Toxicity', 'Watch', 'Lead', 'Corrupted', 'Domination', 'Experience'], 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) > 0) });

		createSetting('dailyC2Challenge',
			function () { return ('DP: ' + cinf()) },
			function () { return ('Automatically portal into this challenge when using ' + resource().toLowerCase() + ' per hour or custom autoportal in dailies when there are none left. Custom portals at the zone specified.') },
			'dropdown', 'None', challenge2, "Daily", [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) > 0 && getPageSetting('dailyHeliumHourChallenge', currSettingUniverse).includes('Challenge ')) });

		createSetting('dailyPortalZone',
			function () { return ('Daily Custom Portal') },
			function () { return ('Automatically portal at this zone during dailies. (ie: setting to 200 would portal when you reach zone 200)') },
			'value', '999', null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) >= 2) });

		createSetting('dailyDontPortalBefore',
			function () { return ('D: Don\'t Portal Before') },
			function () { return ('Do NOT allow ' + resource() + ' per Hour Daily AutoPortal setting to portal BEFORE this level is reached in dailies. It is an additional check that prevents drops in ' + resource().toLowerCase() + '/hr from triggering autoportal in dailies. Set to 0 or -1 to completely disable this check. (only shows up with ' + resource() + ' per Hour set in dailies)') },
			'value', '999', null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) === 1) });

		createSetting('dailyHeliumHrBuffer',
			function () { return ('D: ' + resourceHour() + '/Hr Portal Buffer %') },
			function () { return ('IMPORTANT SETTING. When using the Daily ' + resourceHour() + '/Hr Autoportal, it will portal if your ' + resourceHour() + '/Hr drops by this amount of % lower than your best for current run in dailies, default is 0% (ie: set to 5 to portal at 95% of your best in dailies). Now with stuck protection - Allows portaling midzone if we exceed set buffer amount by 5x. (ie a normal 2% buffer setting would now portal mid-zone you fall below 10% buffer).') },
			'value', '0', null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) === 1) });

		createSetting('dailyPortalFiller',
			function () { return ('Filler run') },
			function () { return ('Will automatically run a filler (challenge selected in DP: Challenge) if you\'re already in a daily and have this enabled.') },
			'boolean', false, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) > 0) });

		createSetting('dailyPortalPreviousUniverse',
			function () { return ('Daily prev universe') },
			function () { return ('If this is on, you will do your daily in U2. ') },
			'boolean', false, null, 'Daily', [2],
			function () { return game.global.highestRadonLevelCleared + 1 >= 30 });

		createSetting('dailyDontCap',
			function () { return ('Use when capped') },
			function () { return ('If this is on, you will only do the oldest daily when you have 7 dailies available. ') },
			'boolean', false, null, 'Daily', [1, 2]);

		createSetting('dailySkip',
			function () { return ('Skip this daily') },
			function () { return ('Input the date of a daily you\'d like AT not to run when automatically starting dailies. Must be input with the following format \'YEAR-MONTH-DAY\' without any hyphens.') },
			'textValue', false, null, 'Daily', [1, 2]);

		createSetting('dailyPortalSettingsArray',
			function () { return ('Daily Portal Settings') },
			function () { return ('Click to adjust settings. ') },
			'mazDefaultArray', { portalZone: 0, portalChallenge: "None", Empower: { enabled: true, zone: 0 }, Mutimp: { enabled: true, zone: 0 }, Bloodthirst: { enabled: true, zone: 0 }, Famine: { enabled: true, zone: 0 }, Large: { enabled: true, zone: 0 }, Weakness: { enabled: true, zone: 0 } }, null, 'Jobs', [2]);
	}

	//----------------------------------------------------------------------------------------------------------------------

	//C2
	const displayC2 = true;
	if (displayC2) {
		createSetting('c2Finish',
			function () { return ('Finish ' + cinf()) },
			function () { return ('<b>DONT USE THIS WITH ' + cinf() + ' RUNNER. ITS FINISH ZONE WILL OVERRIDE THIS</b><br>Finish / Abandon ' + cinf() + 's (any) when this zone is reached, if you are running one. For manual use. Recommended: Zones ending with 0 for most ' + cinf() + ' runs. Disable with -1. Does not affect Non-' + cinf() + ' runs.') },
			'value', -1, null, 'C2', [1, 2]);
		createSetting('c2Table',
			function () { return (cinf() + ' Table') },
			function () { return ('Display your challenge runs in a convenient table which is colour coded. <br><b>Green</b> = Not worth updating. <br><b>Yellow</b> = Consider updating. <br><b>Red</b> = Updating this challenge is worthwhile. <br><b>Blue</b> = You have not yet done this challenge. ') },
			'infoclick', 'c2table', null, 'C2', [1, 2]);

		createSetting('cfightforever',
			function () { return ('Tox/Nom Fight Always') },
			function () { return ('Sends trimps to fight if they\'re not fighting in the Toxicity and Nom Challenges, regardless of BAF. Essenitally the same as the one in combat, can use either if you wish, except this will only activate in these challenges (duh) ') },
			'boolean', false, null, 'C2', [1]);
		createSetting('carmormagic',
			function () { return (['C2 Armor Magic Off', 'CAM: Above 80%', 'CAM: H:D', 'CAM: Always']) },
			function () { return ('Will buy Armor to try and prevent death on Nom/Tox Challenges under the 3 conditions. <br><b>Above 80%:</b> Will activate at and above 80% of your HZE and when your health is sufficiently low. <br><b>H:D:</b> Will activate at and above the H:D you have defined in maps. <br><b>Always</b> Will activate always. <br>All options will activate at or <b>below 25% of your health.</b> ') },
			'multitoggle', 0, null, 'C2', [1]);

		createSetting('c3buildings',
			function () { return ('Building max purchase') },
			function () { return ('When in a C3 or special challenge  (Mayhem, Panda) run will spend 99% of resources on buildings regardless of your other designated caps until the zone you specify in the Buy Buildings Till setting.') },
			'boolean', false, null, 'C2', [2],
			function () { return (!autoBattle.oneTimers.Expanding_Tauntimp.owned) });
		createSetting('c3buildingzone',
			function () { return ('Buy buildings till') },
			function () { return ('When in a C3 or special challenge  (Mayhem, Panda) will spend 99% of resource on buildings until this zone.') },
			'value', -1, null, 'C2', [2],
			function () { return (!autoBattle.oneTimers.Expanding_Tauntimp.owned) });
		createSetting('c2SharpTrimps',
			function () { return (cinf() + ' Sharp Trimps') },
			function () { return ('Will purchase Sharp Trimps during ' + cinf() + ' or special challenge (Mayhem, Pandemonium) runs when enabled.') },
			'boolean', false, null, 'C2', [1, 2]);
		createSetting('c2GoldenMaps',
			function () { return (cinf() + ' Golden Maps') },
			function () { return ('Will purchase Golden Maps during ' + cinf() + ' or special challenge (Mayhem, Pandemonium) runs when enabled.') },
			'boolean', false, null, 'C2', [1, 2]);

		createSetting('c2RunnerStart',
			function () { return (cinf() + ' Runner') },
			function () { return ('Runs the normal ' + cinf() + 's in sequence according to difficulty. See \'' + cinf() + ' Table\' for a list of challenges that this can run. Once zone you have defined has been reached, will portal into next. Only runs challenges that need updating, will not run ones close-ish to your HZE. ') },
			'boolean', false, null, 'C2', [1, 2]);
		/* createSetting('c2RunnerMode',
			function () { return ([cinf() + ' Runner %', cinf() + ' Runner Set Values']) },
			function () {
				return ('Toggles between the two types of modes that ' + cinf() + ' Runner can use. It\'s only recommended to use  \'' + cinf() + ' Runner Set Values\' at endgame. <br>\
			<b>' + cinf() + ' Runner %</b> Will run ' + cinf() + 's when they are below a set percentage of your HZE. <br>\
			<b>'+ cinf() + ' Runner Set Values</b> Uses the \'' + cinf() + ' Runner Settings\' popup and will run enabled ' + cinf() + 's when they are below the designated end zone. <br>')
			},
			'multitoggle', 0, null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse)) });
		createSetting('c2RunnerSettings',
			function () { return (cinf() + ' Runner Settings') },
			function () { return ('Click to adjust settings.') },
			'mazArray', [], 'MAZLookalike("C2 Runner", "c2Runner", "c2Runner")', 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse) && getPageSetting('c2RunnerMode', currSettingUniverse) === 1) }); */
		createSetting('c2RunnerPortal',
			function () { return (cinf() + ' Runner Portal') },
			function () { return ('Automatically portal when this level is reached in ' + cinf() + ' Runner. Set to 0 or -1 to disable.') },
			'value', '-1', null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse) /* && getPageSetting('c2RunnerMode', currSettingUniverse) === 0 */) });
		createSetting('c2RunnerPercent',
			function () { return (cinf() + ' Runner %') },
			function () { return ('What percent Threshhold you want ' + cinf() + 's to be over. E.g 85, will only run ' + cinf() + 's with HZE% below this number. Default is 85%. Must have a value set for C2 Runner to... well, run. ') },
			'value', '85', null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse) /* && getPageSetting('c2RunnerMode', currSettingUniverse) === 0 */) });
		createSetting('c2Fused',
			function () { return ('Fused ' + cinf() + 's') },
			function () { return ('Will make ' + cinf() + ' runner do fused versions of the ' + cinf() + 's rather than normal version to reduce time spent running ' + cinf() + 's.') },
			'boolean', false, null, 'C2', [1],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse) /* && getPageSetting('c2RunnerMode', currSettingUniverse) === 0 */) });

		//Balance
		createSetting('balance',
			function () { return ('Balance') },
			function () { return ('Turn this on if you want to enable Balance destacking feautres.') },
			'boolean', false, null, 'C2', [1]);
		createSetting('balanceZone',
			function () { return ('B: Zone') },
			function () { return ('Which zone you would like to start destacking from.') },
			'value', [6], null, 'C2', [1],
			function () { return (getPageSetting('balance', currSettingUniverse)) });
		createSetting('balanceStacks',
			function () { return ('B: Stacks') },
			function () { return ('The amount of stack you have to reach before clearing them.') },
			'value', -1, null, 'C2', [1],
			function () { return (getPageSetting('balance', currSettingUniverse)) });
		createSetting('balanceImprobDestack',
			function () { return ('B: Improbability Destack') },
			function () { return ('Turn this on to always go down to 0 Balance on Improbabilities after you reach your specified destacking zone') },
			'boolean', false, null, 'C2', [1],
			function () { return (getPageSetting('balance', currSettingUniverse)) });

		//Mapology
		createSetting('mapology',
			function () { return ('Mapology') },
			function () { return ('Turn this on if you want to enable Mapology prestige climb feautre. Any BW Raiding settings will climb until the prestige selected in \'M: Prestige\' has been obtained rather than going for all the available prestiges.') },
			'boolean', false, null, 'C2', [1]);
		createSetting('mapologyPrestige',
			function () { return ('M: Prestige') },
			function () { return ('Acquire prestiges through the selected item (inclusive) as soon as they are available in maps. Automap must be enabled.') },
			'dropdown', 'Off', ['Off', 'Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'], 'C2', [1],
			function () { return (autoTrimpSettings.mapology.enabled) });

		//Radon

		//Unbalance
		createSetting('unbalance',
			function () { return ('Unbalance') },
			function () { return ('Turn this on if you want to enable Unbalance destacking feautres.') },
			'boolean', false, null, 'C2', [2]);
		createSetting('unbalanceZone',
			function () { return ('U: Zone') },
			function () { return ('Which zone you would like to start destacking from.') },
			'value', [6], null, 'C2', [2],
			function () { return (getPageSetting('unbalance', currSettingUniverse)) });
		createSetting('unbalanceStacks',
			function () { return ('U: Stacks') },
			function () { return ('The amount of stack you have to reach before clearing them.') },
			'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('unbalance', currSettingUniverse)) });
		createSetting('unbalanceImprobDestack',
			function () { return ('U: Improbability Destack') },
			function () { return ('Turn this on to always go down to 0 Balance on Improbabilities after you reach your specified destacking zone') },
			'boolean', false, null, 'C2', [2],
			function () { return (getPageSetting('unbalance', currSettingUniverse)) });

		//Trappapalooza
		createSetting('trappapalooza',
			function () { return ('Trappa') },
			function () { return ('Turn this on if you want to enable Trappa feautres.') },
			'boolean', false, null, 'C2', [2],
			function () { return (game.global.highestRadonLevelCleared + 1 >= 60) });
		createSetting('trappapaloozaCoords',
			function () { return ('T: Coords') },
			function () { return ('The zone you would like to stop buying additional coordinations at.') },
			'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('trappapalooza', currSettingUniverse)) });

		//Quest
		createSetting('quest',
			function () { return ('Quest') },
			function () { return ('Turn this on if you want AT to automate Quests. Will only function properly with AutoMaps enabled.') },
			'boolean', true, null, 'C2', [2],
			function () { return (game.global.highestRadonLevelCleared + 1 >= 85) });
		createSetting('questSmithyZone',
			function () { return ('Q: Smithy Zone') },
			function () { return ('The zone you\'ll stop your Quest run at (will assume 85 for non C3 version). Will calculate the smithies required for Quests and purchase spare ones if possible.') },
			'value', 999, null, 'C2', [2],
			function () { return (getPageSetting('quest', currSettingUniverse)) });
		createSetting('questSmithyMaps',
			function () { return ('Q: Smithy Maps') },
			function () { return ('The maximum amount of maps you\'d like to spend on a Smithy quest.') },
			'value', 100, null, 'C2', [2],
			function () { return (getPageSetting('quest', currSettingUniverse)) });

		//Mayhem
		createSetting('mayhem',
			function () { return ('Mayhem') },
			function () { return ('Turn on Mayhem settings. ') },
			'boolean', false, null, 'C2', [2],
			function () { return ((game.global.highestRadonLevelCleared + 1 >= 100 && game.global.mayhemCompletions !== 25) || getPageSetting('mayhem', currSettingUniverse) || game.global.currentChallenge === 'Mayhem') });
		createSetting('mayhemDestack',
			function () { return ('M: HD Ratio') },
			function () { return ('What HD ratio cut-off to use when farming for the boss. If this setting is 100, the script will destack until you can kill the boss in 100 average hits or there are no Mayhem stacks remaining to clear. ') },
			'value', '-1', null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse)) });
		createSetting('mayhemZone',
			function () { return ('M: Zone') },
			function () { return ('What zone you\'d like to start destacking from, can be used in conjunction with \'M: HD Ratio\' but will clear stacks until 0 are remaining regardless of the value set in \'M: HD Ratio\'.') },
			'value', '-1', null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse)) });
		createSetting('mayhemMapIncrease',
			function () { return ('M: Map Increase') },
			function () { return ('Will increase the map level of Mayhem farming by this value for if you find the map level AT is selecting is too low. Negative values will be automatically set to 0.<br>This setting will make it so that AT doesn\'t check if you can afford the new map level so beware it could cause some issues.') },
			'value', '-1', null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse)) });
		createSetting('mayhemMP',
			function () { return ('M: Melting Point') },
			function () { return ('How many smithies to run Melting Point at during Mayhem. <b>THIS OVERRIDES UNIQUE MAP SETTINGS INPUTS WHEN SET ABOVE 0</b>') },
			'value', '-1', null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse)) });

		//Storm
		createSetting('storm',
			function () { return ('Storm') },
			function () { return ('Turn on Storm settings. This also controls the entireity of Storm settings. If you turn this off it will not do anything in Storm. ') },
			'boolean', false, null, 'C2', [2],
			function () { return (game.global.highestRadonLevelCleared + 1 >= 105) });
		createSetting('stormZone',
			function () { return ('S: Zone') },
			function () { return ('Which zone you would like to start destacking from.') },
			'value', [6], null, 'C2', [2],
			function () { return (getPageSetting('storm', currSettingUniverse)) });
		createSetting('stormStacks',
			function () { return ('S: Stacks') },
			function () { return ('The amount of stack you have to reach before clearing all of them.') },
			'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('storm', currSettingUniverse)) });

		//Pandemonium
		createSetting('pandemonium',
			function () { return ('Pandemonium') },
			function () { return ('Turn on Pandemonium settings.') },
			'boolean', false, null, 'C2', [2],
			function () { return ((game.global.highestRadonLevelCleared + 1 >= 150 && game.global.pandCompletions !== 25) || getPageSetting('pandemonium', currSettingUniverse) || game.global.currentChallenge === 'Pandemonium') });

		createSetting('pandemoniumZone',
			function () { return ('P: Destack Zone') },
			function () { return ('What zone to start Pandemonium mapping at. Will ignore Pandemonium stacks below this zone.') },
			'value', '-1', null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse)) });

		createSetting('pandemoniumDestack',
			function () { return ('P: HD Ratio') },
			function () { return ('What HD ratio cut-off to use when farming for the boss. If this setting is 10, the script will destack until you can kill the boss in 10 average hits or there are no Pademonium stacks remaining to clear. ') },
			'value', '10', null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse)) });

		createSetting('pandemoniumAE',
			function () { return (['P: AutoEquip Off', 'P: AutoEquip', 'P AE: LMC', 'P AE: Huge Cache']) },
			function () { return ('<b>P: AutoEquip</b><br>Will automatically purchase equipment during Pandemonium regardless of efficiency. Uses either \'P: HD Ratio\' or \'P: AE Zone\' to decide when to activate.<br><br/><b>P AE: LMC Cache</b><br>Provides settings to run maps if the cost of equipment levels is less than a single large metal cache<br/>Will also purchase prestiges when they cost less than a Jestimp proc. Additionally will override worker settings to ensure that you farm as much metal as possible.<br/><br><b>P AE: Huge Cache</b><br>Uses the same settings as \'P: AE LMC\' but changes to if an equip will cost less than a single huge cache that procs metal. Will automatically switch caches between LMC and HC depending on the cost of equipment to ensure fast farming speed.') },
			'multitoggle', 0, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse)) });

		createSetting('pandemoniumAEZone',
			function () { return ('P AE: Zone') },
			function () { return ('Which zone you would like to start farming as much gear as possible from.') },
			'value', '-1', null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && getPageSetting('pandemoniumAE', currSettingUniverse) > 1) });

		/* createSetting('pandemoniumFarmLevel',
			function () { return ('P AE: Map Level') },
			function () { return ('The map level for farming Large Metal & Huge Caches.') },
			'value', '1', null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && getPageSetting('pandemoniumAE', currSettingUniverse) > 1) }); */

		createSetting('pandemoniumStaff',
			function () { return ('P: Staff') },
			function () { return ('The name of the staff you would like to equip while equip farming, should ideally be a full metal efficiency staff.') },
			'textValue', 'undefined', null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && getPageSetting('pandemoniumAE', currSettingUniverse) > 1) });

		createSetting('pandemoniumMP',
			function () { return ('P: Melting Point') },
			function () { return ('How many smithies to run Melting Point at during Pandemonium. <b>THIS OVERRIDES UNIQUE MAP SETTINGS INPUTS WHEN SET ABOVE 0</b>') },
			'value', '-1', null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse)) });

		//Glass
		createSetting('glass',
			function () { return ('Glass') },
			function () { return ('Turn this on if you want to enable automating Glass damage farming & destacking feautres.') },
			'boolean', false, null, 'C2', [2],
			function () { return (game.global.highestRadonLevelCleared + 1 >= 175) });
		createSetting('glassStacks',
			function () { return ('G: Stacks') },
			function () { return ('The amount of stack you have to reach before clearing them.') },
			'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('glass', currSettingUniverse)) });

		//Smithless
		createSetting('smithless',
			function () { return ('Smithless') },
			function () { return ('Turn this on if you want to enable AT farming for damage to kill Ubersmiths on the Smithless challenge. It will identify breakpoints that can be reached with max tenacity & max map bonus to figure out how many stacks you are able to obtain from the Ubersmith on your current zone and farm till it reached that point if it\'s attainable.') },
			'boolean', false, null, 'C2', [2],
			function () { return (game.global.highestRadonLevelCleared + 1 >= 201) });

		//Wither
		createSetting('wither',
			function () { return ('Wither') },
			function () { return ('Turn this on if you want to enable AT farming until you can 4 shot your current world cell on Wither.') },
			'boolean', false, null, 'C2', [2],
			function () { return (game.global.highestRadonLevelCleared + 1 >= 70) });

		//Desolation
		createSetting('desolation',
			function () { return ('Desolation') },
			function () { return ('Turn on Desolation settings.') },
			'boolean', false, null, 'C2', [2],
			function () { return ((game.global.highestRadonLevelCleared + 1 >= 200 && game.global.desoCompletions !== 25) || getPageSetting('desolation', currSettingUniverse) || game.global.currentChallenge === 'Desolation') });
		createSetting('desolationDestack',
			function () { return ('D: HD Ratio') },
			function () { return ('At what HD ratio destacking should be considered. Must be used in conjunction with \'D: Stacks\'.') },
			'value', '-1', null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse)) });
		createSetting('desolationZone',
			function () { return ('D: Zone') },
			function () { return ('From which zone destacking should be considered. Must be used in conjunction with \'D: Stacks\'.') },
			'value', '-1', null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse)) });
		createSetting('desolationStacks',
			function () { return ('D: Stacks') },
			function () { return ('Minimal amount of stacks to reach before starting destacking. <b>WILL CLEAR TO 0 STACKS WHEN IT STARTS RUNNING.</b>') },
			'value', '-1', null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse)) });
		createSetting('desolationMapIncrease',
			function () { return ('D: Map Increase') },
			function () { return ('Increases the minimum map level of Desolation farming by this value. Negative values will be automatically set to 0.') },
			'value', '-1', null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse)) });
		createSetting('desolationMP',
			function () { return ('D: Melting Point') },
			function () { return ('How many smithies to run Melting Point at during Desolation. <b>THIS OVERRIDES UNIQUE MAP SETTINGS INPUTS WHEN SET ABOVE 0</b>') },
			'value', '-1', null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse)) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Challenges
	const displayChallenges = true;
	if (displayChallenges) {
		//Helium
		//Decay
		createSetting('decay',
			function () { return ('Decay') },
			function () { return ('Turn this on if you want to enable Decay feautres.') },
			'boolean', false, null, 'Challenges', [1]);
		createSetting('decayStacksToPush',
			function () { return ('D: Stacks to Push') },
			function () { return ('During Decay, AT will ignore maps and push to end the zone if we go above this amount of stacks.<br><br>Use -1 or 0 to disable.<br>Defaults to 300.') },
			'value', '300', null, 'Challenges', [1],
			function () { return (autoTrimpSettings.decay.enabled) });
		createSetting('decayStacksToAbandon',
			function () { return ('D: Stacks to Abandon') },
			function () { return ('During Decay, AT will abandon the challenge if we go above this amount of stacks.<br><br>Use -1 or 0 to disable.<br>Defaults to 300.') },
			'value', '600', null, 'Challenges', [1],
			function () { return (autoTrimpSettings.decay.enabled) });

		//Life
		createSetting('life',
			function () { return ('Life') },
			function () { return ('Turn this on if you want to enable Decay feautres.') },
			'boolean', false, null, 'Challenges', [1]);
		createSetting('lifeZone',
			function () { return ('L: Zone') },
			function () { return ('During Life, AT will only take you to the map chamber when the current enemy is Living when you are at or below this zone. <br><br>Must be used in conjunction with L: Stacks.<br><br>Defaults to 100.') },
			'value', '100', null, 'Challenges', [1],
			function () { return (autoTrimpSettings.life.enabled) });
		createSetting('lifeStacks',
			function () { return ('L: Stacks') },
			function () { return ('During Life, AT will only take you to the map chamber when the current enemy is Living when you are at or below this stack count.<br><br>Must be used in conjunction with L: Stacks.<br><br>Defaults to 150.') },
			'value', '150', null, 'Challenges', [1],
			function () { return (autoTrimpSettings.life.enabled) });
		//Experience
		createSetting('experience',
			function () { return ('Experience') },
			function () { return ('Turn this on if you want to enable Experience feautres. <b>This setting is dependant on using \'Bionic Raiding\' in conjunction with it.</b><br><br>Will automatically disable repeat within Bionic Wonderland maps if you\'re above z600 and the Bionic map is at or above level 605.') },
			'boolean', false, null, 'Challenges', [1]);
		createSetting('experienceStartZone',
			function () { return ('E: Start Zone') },
			function () { return ('The zone you would like to start farming for Wonders at.') },
			'value', -1, null, 'Challenges', [1],
			function () { return (autoTrimpSettings.experience.enabled) });
		createSetting('experienceEndZone',
			function () { return ('E: End Zone') },
			function () { return ('Will run the Bionic Wonderland map level specified in \'E: End BW\' at this zone. <b>This setting will not work if set below z601.</b>') },
			'value', '605', null, 'Challenges', [1],
			function () { return (autoTrimpSettings.experience.enabled) });
		createSetting('experienceEndBW',
			function () { return ('E: End BW') },
			function () { return ('Will finish the challenge with specified Bionic Wonderland once reaching end zone. If the specified BW is not available, it will run one closest to the setting.') },
			'value', '605', null, 'Challenges', [1],
			function () { return (autoTrimpSettings.experience.enabled) });

		//Arch
		createSetting('archaeology',
			function () { return ('Archaeology') },
			function () { return ('Turn on Archaeology settings. ') },
			'boolean', false, null, 'Challenges', [2],
			function () { return (game.global.highestRadonLevelCleared + 1 >= 90) });
		createSetting('archaeologyString1',
			function () { return ('First String') },
			function () { return ('First string to use in Archaeology. Put the zone you want to stop using this string and start using the second string (Make sure the second string has a value) at the start. I.e: 70,10a,10e ') },
			'textValue', 'undefined', null, 'Challenges', [2],
			function () { return (autoTrimpSettings.archaeology.enabledU2) });
		createSetting('archaeologyString2',
			function () { return ('Second String') },
			function () { return ('Second string to use in Archaeology. Put the zone you want to stop using this string and start using the third string (Make sure the third string has a value) at the start. I.e: 94,10a,10e ') },
			'textValue', 'undefined', null, 'Challenges', [2],
			function () { return (autoTrimpSettings.archaeology.enabledU2) });
		createSetting('archaeologyString3',
			function () { return ('Third String') },
			function () { return ('Third string to use in Archaeology. Make sure this is just your Archaeology string and nothing else. I.e: 10a,10e ') },
			'textValue', 'undefined', null, 'Challenges', [2],
			function () { return (autoTrimpSettings.archaeology.enabledU2) });

		//Quagmire
		createSetting('quagmireSettings',
			function () { return ('Quagmire Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazArray', [], 'MAZLookalike("Quagmire Farm", "Quagmire", "MAZ")', 'Challenges', [2],
			function () { return (game.global.highestRadonLevelCleared + 1 >= 70) });
		createSetting('quagmireDefaultSettings',
			function () { return ('Quagmire Default Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Challenges', [2]);

		//Insanity
		createSetting('insanitySettings',
			function () { return ('Insanity Settings') },
			function () { return ('Click to adjust settings. ') },
			'mazArray', [], 'MAZLookalike("Insanity Farm", "Insanity", "MAZ")', 'Challenges', [2],
			function () { return (game.global.highestRadonLevelCleared + 1 >= 110) });
		createSetting('insanityDefaultSettings',
			function () { return ('Insanity Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Challenges', [2]);

		//Alchemy
		createSetting('alchemySettings',
			function () { return ('Alchemy Settings') },
			function () { return ('Click to adjust settings.') },
			'mazArray', [], 'MAZLookalike("Alchemy Farm", "Alchemy", "MAZ")', 'Challenges', [2],
			function () { return (game.global.highestRadonLevelCleared + 1 >= 155) });
		createSetting('alchemyDefaultSettings',
			function () { return ('Alchemy Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Challenges', [2]);

		//Hypothermia
		createSetting('hypothermiaSettings',
			function () { return ('Hypothermia Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazArray', [], 'MAZLookalike("Hypothermia Farm", "Hypothermia", "MAZ")', 'Challenges', [2],
			function () { return (game.global.highestRadonLevelCleared + 1 >= 175) });
		createSetting('hypothermiaDefaultSettings',
			function () { return ('Hypothermia Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Challenges', [2]);
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Buildings
	const displayBuildings = true;
	if (displayBuildings) {
		createSetting('buildingsType',
			function () { return ('AutoBuildings') },
			function () { return ('Buys buildings in an efficient way. Also enables Vanilla AutoStorage if its off. ') },
			'boolean', 'true', null, 'Legacy', [1]);
		createSetting('buildingSettingsArray',
			function () { return ('Building Settings') },
			function () { return ('Click to adjust settings. ') },
			'mazDefaultArray', {
			Hut: { enabled: true, percent: 100, buyMax: 200 },
			House: { enabled: true, percent: 100, buyMax: 200 },
			Mansion: { enabled: true, percent: 100, buyMax: 200 },
			Hotel: { enabled: true, percent: 100, buyMax: 200 },
			Wormhole: { enabled: false, percent: 1, buyMax: 1 },
			Resort: { enabled: true, percent: 100, buyMax: 200 },
			Gateway: { enabled: true, percent: 10, buyMax: 200 },
			Collector: { enabled: true, percent: 100, buyMax: 200 },
			Gym: { enabled: true, percent: 100, buyMax: 0 },
			Tribute: { enabled: true, percent: 100, buyMax: 0 },
			Nursery: { enabled: true, percent: 100, buyMax: 0, fromZ: 999 },
			Smithy: { enabled: true, percent: 100, buyMax: 0 },
			Tribute: { enabled: true, percent: 100, buyMax: 0 },
			Laboratory: { enabled: true, percent: 100, buyMax: 0 },
			SafeGateway: { enabled: true, mapCount: 3, zone: 0 }
		}, null, 'Jobs', [1]);

		//Helium
		createSetting('warpstation',
			function () { return ('Warpstations') },
			function () { return ('Enabling this will let AT purchase Warpstations. AT AutoStructure must be enabled for this to work.') },
			'boolean', true, null, 'Buildings', [1]);
		createSetting('WarpstationCap',
			function () { return ('Warpstation Cap') },
			function () { return ('Do not level Warpstations past Basewarp+DeltaGiga **. Without this, if a Giga wasnt available, it would level infinitely (wastes metal better spent on prestiges instead.) **The script bypasses this cap each time a new giga is bought, when it insta-buys as many as it can afford (since AT keeps available metal/gems to a low, overbuying beyond the cap to what is affordable at that first moment is not a bad thing). ') },
			'boolean', true, null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled) });
		createSetting('WarpstationCoordBuy',
			function () { return ('Buy Warp to Hit Coord') },
			function () { return ('If we are very close to hitting the next coordination, and we can afford the warpstations it takes to do it, Do it! (even if we are over the Cap/Wall). Recommended with WarpCap/WarpWall. (has no point otherwise) ') },
			'boolean', true, null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled) });
		createSetting('FirstGigastation',
			function () { return ('First Gigastation') },
			function () { return ('How many warpstations to buy before your first gigastation') },
			'value', '20', null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled) });
		createSetting('DeltaGigastation',
			function () { return ('Delta Gigastation') },
			function () { return ('<b>YOU MUST HAVE BUY UPGRADES ENABLED!</b><br> How many extra warpstations to buy for each gigastation. Supports decimal values. For example 2.5 will buy +2/+3/+2/+3...') },
			'value', '2', null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled) }
		);
		createSetting('AutoGigas',
			function () { return ('Auto Gigas') },
			function () { return ('Advanced. <br>If enabled, AT will buy its first Gigastation if: <br>A) Has more than 2 Warps & <br>B) Can\'t afford more Coords & <br>C) (Only if Custom Delta Factor > 20) Lacking Health or Damage & <br>D) (Only if Custom Delta Factor > 20) Has run at least 1 map stack or <br>E) If forced to by using the firstGiga(true) command in the console. <br>Then, it\'ll calculate the delta based on your Custom Delta Factor and your Auto Portal/VM zone (whichever is higher), or Daily Auto Portal/VM zone, or ' + cinf() + ' zone, or Custom AutoGiga Zone.') },
			'boolean', 'true', null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled) });
		createSetting('CustomTargetZone',
			function () { return ('Custom Target Zone') },
			function () { return ('To be used with Auto Gigas. <br>The zone to be used as a the target zone when calculating the Auto Gigas delta. <br>Values below 60 will be discarded.') },
			'value', '-1', null, "Buildings", [1],
			function () { return (autoTrimpSettings.warpstation.enabled && autoTrimpSettings.AutoGigas.enabled) });
		createSetting('CustomDeltaFactor',
			function () { return ('Custom Delta Factor') },
			function () { return ('Advanced. To be used with Auto Gigas. <br>This setting is used to calculate a better Delta. Think of this setting as how long your target zone takes to complete divided by the zone you bought your first giga in. <br>Basically, a higher number means a higher delta. Values below 1 will default to 10. <br><b>Recommended: 1-2 for very quick runs. 5-10 for regular runs where you slow down at the end. 20-100+ for very pushy runs.</b>') },
			'value', '-1', null, "Buildings", [1],
			function () { return (autoTrimpSettings.warpstation.enabled && autoTrimpSettings.AutoGigas.enabled) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Jobs
	const displayJobs = true;
	if (displayJobs) {
		createSetting('jobType',
			function () { return (['Don\'t Buy Jobs', 'Auto Ratios', 'Manual Ratios']) },
			function () { return ('Manual Ratios buys jobs for your trimps according to the ratios below, <b>Make sure they are all different values, if two of them are the same it might causing an infinite loop of hiring and firing!</b> Auto Worker ratios automatically changes these ratios based on current progress, <u>overriding your ratio settings</u>.<br>AutoRatios: 1/1/1 up to 300k trimps, 3/3/5 up to 3mil trimps, then 3/1/4 above 3 mil trimps, then 1/1/10 above 1000 tributes, then 1/2/22 above 1500 tributes, then 1/12/12 above 3000 tributes.<br>CAUTION: You cannot manually assign jobs with this, turn it off if you have to') },
			'multitoggle', 1, null, 'Jobs', [1]);
		createSetting('jobSettingsArray',
			function () { return ('Job Settings') },
			function () { return ('Click to adjust settings. ') },
			'mazDefaultArray', {
			Farmer: { enabled: true, ratio: 1 },
			Lumberjack: { enabled: true, ratio: 1 },
			Miner: { enabled: true, ratio: 1 },
			Explorer: { enabled: true, percent: 5 },
			Trainer: { enabled: true, percent: 5 },
			Magmamancer: { enabled: true, percent: 100 },
			Meteorologist: { enabled: true, percent: 100 },
			Worshipper: { enabled: true, percent: 5 },
			FarmersUntil: { enabled: false, zone: 999 },
			NoLumberjacks: { enabled: false }
		}, null, 'Jobs', [1]);
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Gear
	const displayGear = true;
	if (displayGear) {
		createSetting('equipOn',
			function () { return ('AutoEquip') },
			function () { return ('AutoEquip. Buys Prestiges and levels equipment according to various settings. Will only buy prestiges if it is worth it. Levels all eqiupment according to best efficiency.') },
			'boolean', false, null, "Gear", [1, 2]);
		createSetting('equipCutOff',
			function () { return ('AE: Cut-off') },
			function () { return ('Decides when to buy gear. 1 is default. This means it will take 1 hit to kill an enemy. If zone is below the zone you have defined in AE: Zone then it will only buy equips when needed.') },
			'value', '1', null, 'Gear', [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipAmount',
			function () { return ('AE: Amount') },
			function () { return ('How much equipment to level per time.') },
			'value', 1, null, "Gear", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipCapAttack',
			function () { return ('AE: Weapon Cap') },
			function () { return ('What level to stop buying Weapons at.') },
			'value', 50, null, "Gear", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipCapHealth',
			function () { return ('AE: Armour Cap') },
			function () { return ('What level to stop buying Armour at.') },
			'value', 50, null, "Gear", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipZone',
			function () { return ('AE: Zone') },
			function () { return ('What zone to stop caring about H:D and buy as much prestiges and equipment as possible. <br><br>Can input multiple zones such as \'200\,231\,251\', doing this will spend all your resources purchasing gear and prestiges on each zone input but will only buy them until the end of the run after the last input. ') },
			'multiValue', -1, null, "Gear", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipPercent',
			function () { return ('AE: Percent') },
			function () { return ('What percent of resources to spend on equipment before the zone you have set in AE: Zone.') },
			'value', 1, null, "Gear", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipPortal',
			function () { return ('AE: Portal') },
			function () { return ('Makes sure Auto Equip is on after portalling. Turn this off to disable this and remember your choice.') },
			'boolean', false, null, 'Gear', [1, 2]);
		createSetting('equip2',
			function () { return ('AE: 2') },
			function () { return ('Always buys level 2 of weapons and armor regardless of efficiency.') },
			'boolean', true, null, "Gear", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipPrestige',
			function () { return (['AE: Prestige Off', 'AE: Prestige', 'AE: Always Prestige']) },
			function () {
				return ('\
	<b>AE: Prestige Off</b><br>Will go for a new prestige when you have 6 or more levels in your equipment.<br><br>\
	<b>AE: Prestige</b><br>Overrides the need for levels in your current equips before a prestige will be purchased. Will purchase gear levels again when you have run Atlantrimp (will buy any prestiges that cost less than 8% of your current metal).<br><br>\
	<b>AE: Always Prestige</b><br>Always buys prestiges of weapons and armor regardless of efficiency. Will override AE: Zone setting for an equip if it has a prestige available.')
			},
			'multitoggle', 0, null, "Gear", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipHighestPrestige',
			function () { return ('AE: Highest Prestige') },
			function () { return ('Will only buy equips for the highest prestige currently owned.') },
			'boolean', true, null, "Gear", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse) && getPageSetting('equipPrestige', currSettingUniverse) !== 0) });
		createSetting('equipEfficientEquipDisplay',
			function () { return ('AE: Highlight Equips') },
			function () { return ('Will highlight the most efficient equipment or prestige to buy. <b>This setting will disable the default game setting.') },
			'boolean', true, null, "Gear", [1, 2]);
		createSetting('equipShieldBlock',
			function () { return ('Buy Shield Block') },
			function () { return ('Will buy the shield block upgrade. CAUTION: If you are progressing past zone 60, you probably don\'t want this.') },
			'boolean', false, null, "Gear", [1],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipNoShields',
			function () { return ('AE: No Shields') },
			function () { return ('Will stop AT from buying Shield prestiges or upgrades when they\'re available.') },
			'boolean', false, null, "Gear", [2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });

		createSetting('Prestige',
			function () { return ('Prestige') },
			function () { return ('Acquire prestiges through the selected item (inclusive) as soon as they are available in maps. Forces equip first mode. Automap must be enabled. THIS IS AN IMPORTANT SETTING related to speed climbing and should probably always be on something. If you find the script getting stuck somewhere, particularly where you should easily be able to kill stuff, setting this to an option lower down in the list will help ensure you are more powerful at all times, but will spend more time acquiring the prestiges in maps.') },
			'dropdown', 'Off', ['Off', 'Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'], "Gear", [1, 2]);
		createSetting('ForcePresZ',
			function () { return ('Force Prestige Z') },
			function () { return ('On and after this zone is reached, always try to prestige for everything immediately, ignoring Dynamic Prestige settings and overriding that of Linear Prestige. Prestige Skip mode will exit this. Disable with -1.') },
			'value', -1, null, 'Gear', [1, 2]);
		createSetting('PrestigeSkip1_2',
			function () { return (['Prestige Skip Off', 'Prestige Skip 1 & 2', 'Prestige Skip 1', 'Prestige Skip 2']) },
			function () { return ('<b>Prestige Skip 1:</b> If there are more than 2 Unbought Prestiges (besides Shield), ie: sitting in your upgrades window but you cant afford them, AutoMaps will not enter Prestige Mode, and/or will exit from it. The amount of unboughts can be configured with this variable MODULES[\\"maps\\"].SkipNumUnboughtPrestiges = 2; <br><b>Prestige Skip 2:</b> If there are 2 or fewer <b>Unobtained Weapon Prestiges in maps</b>, ie: there are less than 2 types to run for, AutoMaps will not enter Prestige Mode, and/or will exit from it. For users who tends to not need the last few prestiges due to resource gain not keeping up. The amount of unboughts can be configured with MODULES.maps.UnearnedPrestigesRequired. If PrestigeSkipMode is enabled, both conditions need to be reached before exiting.') },
			'multitoggle', 0, null, "Gear", [1, 2]);
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Maps
	const displayMaps = true;
	if (displayMaps) {
		//Helium
		createSetting('autoMaps',
			function () { return (["Auto Maps Off", "Auto Maps On", "Auto Maps No Unique"]) },
			function () { return ('Automaps. The no unique setting will not run unique maps such as dimensions of anger. Recommended ON. Do not use window, it will not work. ') },
			'multitoggle', 0, null, "Maps", [1, 2]);
		createSetting('autoMapsPortal',
			function () { return ('AM Portal') },
			function () { return ('Makes sure Auto Maps is on after portalling. Turn this off to disable this and remember your choice. ') },
			'boolean', true, null, 'Maps', [1, 2]);
		createSetting('onlyPerfectMaps',
			function () { return ('Perfect Maps') },
			function () { return ('If enabled when AT is trying to map it will only create perfect maps. Be warned this may greatly decrease the map level that AT believes is efficient.') },
			'boolean', false, null, 'Maps', [1, 2]);

		createSetting('uniqueMapSettingsArray',
			function () { return ('Unique Map Settings') },
			function () { return ('Click to adjust settings.') },
			'mazArray', {
			The_Wall: { enabled: false, zone: 100, cell: 0 },
			The_Block: { enabled: false, zone: 100, cell: 0 },
			Dimension_of_Anger: { enabled: false, zone: 100, cell: 0 },
			Trimple_of_Doom: { enabled: false, zone: 100, cell: 0 },
			The_Prison: { enabled: false, zone: 100, cell: 0 },
			Imploding_Star: { enabled: false, zone: 100, cell: 0 },

			Dimension_of_Rage: { enabled: false, zone: 100, cell: 0 },
			Prismatic_Palace: { enabled: false, zone: 100, cell: 0 },
			Atlantrimp: { enabled: false, zone: 100, cell: 0 },
			Melting_Point: { enabled: false, zone: 100, cell: 0 },
			Frozen_Castle: { enabled: false, zone: 100, cell: 0 },

			MP_Smithy: { enabled: false, value: 100 },
			MP_Smithy_Daily: { enabled: false, value: 100 },
			MP_Smithy_C3: { enabled: false, value: 100 },
		}, 'MAZLookalike("Unique Maps", " ", "UniqueMaps")', 'Maps', [1, 2]);

		createSetting('mapBonusRatio',
			function () { return ('Map Bonus Ratio') },
			function () { return ('Map Bonus will be run when above this HD Ratio value.') },
			'value', 4, null, "Maps", [1, 2]);
		createSetting('mapBonusStacks',
			function () { return ('Map Bonus Stacks') },
			function () { return ('The map bonus limit that will be used when above your \'Map Bonus Ratio\' threshold.') },
			'value', 10, null, "Maps", [1, 2]);

		createSetting('scryvoidmaps',
			function () { return ('VM Scryer') },
			function () { return ('Only use if you have Scryhard II, for er, obvious reasons. Works without the scryer options. ') },
			'boolean', false, null, 'Maps', [1]);

		//HD Farm
		createSetting('hdFarmSettings',
			function () { return ('HD Farm Settings') },
			function () { return ('Click to adjust settings.') },
			'mazArray', [], 'MAZLookalike("HD Farm", "HDFarm", "MAZ")', 'Maps', [1, 2]);
		createSetting('hdFarmDefaultSettings',
			function () { return ('HD Farm: Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [1, 2]);

		createSetting('voidMapSettings',
			function () { return ('Void Map Settings') },
			function () { return ('Will run all of your Void Maps on a specified zone according to this settings value.') },
			'mazArray', [], 'MAZLookalike("Void Map", "VoidMap", "MAZ")', 'Maps', [1, 2]);
		createSetting('voidMapDefaultSettings',
			function () { return ('Void Map Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [1, 2]);

		//Bone Shrine (bone) 
		createSetting('boneShrineSettings',
			function () { return ('Bone Shrine Settings') },
			function () { return ('Will use a specified amount of Bone Shrine charges according to this settings value.') },
			'mazArray', [], 'MAZLookalike("Bone Shrine", "BoneShrine", "MAZ")', 'Maps', [1, 2]);
		createSetting('boneShrineDefaultSettings',
			function () { return ('BS: Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [1, 2]);

		//Worshipper Farm 
		createSetting('worshipperFarmSettings',
			function () { return ('Worshipper Farm Settings') },
			function () { return ('Will farm to a specified amount of Worshippers according to this settings value.') },
			'mazArray', [], 'MAZLookalike("Worshipper Farm", "WorshipperFarm", "MAZ")', 'Maps', [2],
			function () { return game.global.highestRadonLevelCleared + 1 >= 50 });
		createSetting('worshipperFarmDefaultSettings',
			function () { return ('WF: Default Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [2]);

		//Map Bonus
		createSetting('mapBonusSettings',
			function () { return ('Map Bonus Settings') },
			function () { return ('Will map stack to a specified amount according to this settings value.') },
			'mazArray', [], 'MAZLookalike("Map Bonus", "MapBonus", "MAZ")', 'Maps', [1, 2]);
		createSetting('mapBonusDefaultSettings',
			function () { return ('Map Bonus: Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [1, 2]);
		createSetting('mapBonusZone',
			function () { return ('Map Bonus: Zone') },
			function () { return ('Map Bonus') },
			'multiValue', [6], null, 'Legacy', [1, 2]);

		//Map Farm
		createSetting('mapFarmSettings',
			function () { return ('Map Farm Settings') },
			function () { return ('Will farm a specified amount of maps according to this settings value.') },
			'mazArray', [], 'MAZLookalike("Map Farm", "MapFarm", "MAZ")', 'Maps', [1, 2]);
		createSetting('mapFarmDefaultSettings',
			function () { return ('MF: Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [1, 2]);

		//Prestige Raiding
		createSetting('raidingSettings',
			function () { return ('Raiding Settings') },
			function () { return ('Will raid up to a specified zone according to this settings value.') },
			'mazArray', [], 'MAZLookalike("Raiding", "Raiding", "MAZ")', 'Maps', [1, 2]);
		createSetting('raidingDefaultSettings',
			function () { return ('Raiding: Default Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [1, 2]);

		//Bionic Raiding
		createSetting('bionicRaidingSettings',
			function () { return ('BW Raiding Settings') },
			function () { return ('Will run Bionic Wonderlands up to a specified zone according to this settings value.') },
			'mazArray', [], 'MAZLookalike("Bionic Raiding", "BionicRaiding", "MAZ")', 'Maps', [1]);
		createSetting('bionicRaidingDefaultSettings',
			function () { return ('Raiding: Default Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [1]);

		//Tribute Farming
		createSetting('tributeFarmSettings',
			function () { return ('Tribute Farm Settings') },
			function () { return ('Will farm for a specified amount of Tributes or Meteorologists according to this settings value.') },
			'mazArray', [], 'MAZLookalike("Tribute Farm", "TributeFarm", "MAZ")', 'Maps', [2]);
		createSetting('tributeFarmDefaultSettings',
			function () { return ('TrF: Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [2]);

		//Smithy Farming
		createSetting('smithyFarmSettings',
			function () { return ('Smithy Farm Settings') },
			function () { return ('Will farm for a specified amount of Smithies according to this settings value.') },
			'mazArray', [], 'MAZLookalike("Smithy Farm", "SmithyFarm", "MAZ")', 'Maps', [2]);
		createSetting('smithyFarmDefaultSettings',
			function () { return ('SF: Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [2]);


		//Spire
		//Helium
		createSetting('MaxStacksForSpire',
			function () { return ('Max Map Bonus for Spire') },
			function () { return ('Get max map bonus before running the Spire.') },
			'boolean', false, null, 'Spire', [1]);
		createSetting('IgnoreSpiresUntil',
			function () { return ('Ignore Spires Until') },
			function () { return ('Spire specific settings like end-at-cell are ignored until at least this zone is reached (0 to disable).<br>Does not work with Run Bionic Before Spire.') },
			'value', '200', null, 'Spire', [1]);
		createSetting('ExitSpireCell',
			function () { return ('Exit Spire After Cell') },
			function () { return ('Optional/Rare. Exits the Spire early, after completing cell X. example: 40 for Row 4. (use 0 or -1 to disable)') },
			'value', '-1', null, 'Spire', [1]);
		createSetting('SpireBreedTimer',
			function () { return ('Spire Breed Timer') },
			function () { return ('<b>ONLY USE IF YOU USE VANILLA GA</b>Set a time for your GA in spire. Recommend not touching GA during this time. ') },
			'value', -1, null, 'Spire', [1]);
		createSetting('PreSpireNurseries',
			function () { return ('Nurseries pre-Spire') },
			function () { return ('Set the maximum number of Nurseries to build for Spires. Overrides No Nurseries Until z and Max Nurseries so you can keep them seperate! Will build nurseries before z200 for Spire 1, but only on the zone of Spires 2+ to avoid unnecessary burning. Disable with -1.') },
			'value', -1, null, 'Spire', [1]);
		createSetting('SkipSpires',
			function () { return ('Skip Spires') },
			function () { return ('Useful to die in spires if farming takes too long') },
			'boolean', false, null, 'Spire', [1]);
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Windstacking
	const displayWindstacking = true;
	if (displayWindstacking) {
		createSetting('turnwson',
			function () { return ('Turn WS On!') },
			function () { return ('Turn on Windstacking Stance in Combat to see the settings! ') },
			'boolean', false, null, 'Windstacking', [1],
			function () { return (autoTrimpSettings.AutoStance.value !== 3) });
		createSetting('WindStackingMin',
			function () { return ('Windstack Min Zone') },
			function () { return ('For use with Windstacking Stance, enables windstacking in zones above and inclusive of the zone set. (Get specified windstacks then change to D, kill bad guy, then repeat). This is designed to force S use until you have specified stacks in wind zones, overriding scryer settings. All windstack settings apart from WS MAX work off this setting. ') },
			'value', '-1', null, 'Windstacking', [1],
			function () { return (autoTrimpSettings.AutoStance.value === 3) });
		createSetting('WindStackingMinHD',
			function () { return ('Windstack H:D') },
			function () { return ('For use with Windstacking Stance, fiddle with this to maximise your stacks in wind zones. ') },
			'value', '-1', null, 'Windstacking', [1],
			function () { return (autoTrimpSettings.AutoStance.value === 3) });
		createSetting('WindStackingMax',
			function () { return ('Windstack Stacks') },
			function () { return ('For use with Windstacking Stance. Amount of windstacks to obtain before switching to D stance. Default is 200, but I recommend anywhere between 175-190.  In Wind Enlightenment it will add 100 stacks to your total automatically. So if this setting is 200 It will assume you want 300 stacks instead during enlightenment. ') },
			'value', '200', null, 'Windstacking', [1],
			function () { return (autoTrimpSettings.AutoStance.value === 3) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//ATGA
	const displayATGA = true;
	if (displayATGA) {
		createSetting('ATGA2',
			function () { return ('ATGA') },
			function () { return ('<b>ATGA MASTER BUTTON</b><br>AT Geneticassist. Do not use vanilla GA, as it will conflict otherwise. May get fucky with super high values. ') },
			'boolean', false, null, 'ATGA', [1]);
		createSetting('ATGA2gen',
			function () { return ('ATGA: Gen %') },
			function () { return ('<b>ATGA: Geneassist %</b><br>ATGA will only hire geneticists if they cost less than this value. E.g if this setting is 1 it will only buy geneticists if they cost less than 1% of your food. Default is 1%. ') },
			'value', '1', null, 'ATGA', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled) });
		createSetting('ATGA2timer',
			function () { return ('ATGA: Timer') },
			function () { return ('<b>ATGA Timer</b><br>This is the default time your ATGA will use. ') },
			'value', '-1', null, 'ATGA', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled) });

		//Zone Timers
		createSetting('zATGA2timer',
			function () { return ('ATGA: T: Before Z') },
			function () { return ('<b>ATGA Timer: Before Z</b><br>ATGA will use the value you define in ATGA: T: BZT before the zone you have defined in this setting, overwriting your default timer. Useful for Liq or whatever. ') },
			'value', '-1', null, 'ATGA', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
		createSetting('ztATGA2timer',
			function () { return ('ATGA: T: BZT') },
			function () { return ('<b>ATGA Timer: Before Z Timer</b><br>ATGA will use this value before the zone you have defined in ATGA: T: Before Z, overwriting your default timer. Useful for Liq or whatever. Does not work on challenges. ') },
			'value', '-1', null, 'ATGA', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0 && autoTrimpSettings.zATGA2timer.value > 0) });
		createSetting('ATGA2timerz',
			function () { return ('ATGA: T: After Z') },
			function () { return ('<b>ATGA Timer: After Z</b><br>ATGA will use the value you define in ATGA: T: AZT after the zone you have defined in this setting, overwriting your default timer. Useful for super push runs or whatever. Does not work on challenges. ') },
			'value', '-1', null, 'ATGA', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
		createSetting('ATGA2timerzt',
			function () { return ('ATGA: T: AZT') },
			function () { return ('<b>ATGA Timer: After Z Timer</b><br>ATGA will use this value after the zone that has been defined in ATGA: T: After Z, overwriting your default timer. Useful for super push runs or whatever. ') },
			'value', '-1', null, 'ATGA', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0 && autoTrimpSettings.ATGA2timerz.value > 0) });

		//Spire Timers
		createSetting('sATGA2timer',
			function () { return ('ATGA: T: Spire') },
			function () { return ('<b>ATGA Timer: Spire</b><br>ATGA will use this value in Spires. Respects your ignore Spires setting. Do not use this if you use the setting in the Spire tab! (As that uses vanilla GA) Nothing overwrites this except Daily Spire. ') },
			'value', '-1', null, 'ATGA', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
		createSetting('dsATGA2timer',
			function () { return ('ATGA: T: Daily Spire') },
			function () { return ('<b>ATGA Timer: Daily Spire</b><br>ATGA will use this value in Daily Spires. Respects your ignore Spires setting. Do not use this if you use the setting in the Spire tab! (As that uses vanilla GA) Nothing overwrites this. ') },
			'value', '-1', null, 'ATGA', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });

		//Daily Timers
		createSetting('dATGA2Auto',
			function () { return (['ATGA: Manual', 'ATGA: Auto No Spire', 'ATGA: Auto Dailies']) },
			function () { return ('<b>EXPERIMENTAL</b><br><b>ATGA Timer: Auto Dailies</b><br>ATGA will use automatically set breed timers in plague and bogged, overwriting your default timer.<br/>Set No Spire to not override in spire, respecting ignore spire settings.') },
			'multitoggle', 2, null, 'ATGA', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
		createSetting('dATGA2timer',
			function () { return ('ATGA: T: Dailies') },
			function () { return ('<b>ATGA Timer: Normal Dailies</b><br>ATGA will use this value for normal Dailies such as ones without plague etc, overwriting your default timer. Useful for pushing your dailies that extra bit at the end. Overwrites Default, Before Z and After Z. ') },
			'value', '-1', null, 'ATGA', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
		createSetting('dhATGA2timer',
			function () { return ('ATGA: T: D: Hard') },
			function () { return ('<b>ATGA Timer: Hard Dailies</b><br>ATGA will use this value in Dailies that are considered Hard. Such Dailies include plaged, bloodthirst and Dailies with a lot of negative mods. Overwrites Default, Before Z and After Z and normal Daily ATGA Timer. ') },
			'value', '-1', null, 'ATGA', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });

		//C2 Timers
		createSetting('cATGA2timer',
			function () { return ('ATGA: T: ' + cinf()) },
			function () { return ('<b>ATGA Timer: ' + cinf() + 's</b><br>ATGA will use this value in ' + cinf() + 's. Overwrites Default, Before Z and After Z. ') },
			'value', '-1', null, 'ATGA', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
		createSetting('chATGA2timer',
			function () { return ('ATGA: T: C: Hard') },
			function () { return ('<b>ATGA Timer: Hard ' + cinf() + 's</b><br>ATGA will use this value in ' + cinf() + 's that are considered Hard. Electricity, Nom, Toxicity. Overwrites Default, Before Z and After Z and ' + cinf() + ' ATGA') },
			'value', '-1', null, 'ATGA', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Combat
	const displayCombat = true;
	if (displayCombat) {
		//Helium
		createSetting('autoFight',
			function () { return (['Better AutoFight OFF', 'Better Auto Fight', 'Vanilla']) },
			function () { return ('3-Way Button, Recommended. Will automatically handle fighting.<br>BAF = Old Algo (Fights if dead, new squad ready, new squad breed timer target exceeded, and if breeding takes under 0.5 seconds<br>BAF3 = Uses vanilla autofight and makes sure you fight on portal. <br> WARNING: If you autoportal with BetterAutoFight disabled, the game may sit there doing nothing until you click FIGHT. (not good for afk) ') },
			'multitoggle', 1, null, "Combat", [1, 2]);
		createSetting('AutoStance',
			function () { return (['Auto Stance OFF', 'Auto Stance', 'D Stance', 'Windstacking']) },
			function () { return ('<b>Autostance:</b> Automatically swap stances to avoid death. <br><b>D Stance:</b> Keeps you in D stance regardless of Health. <br><b>Windstacking:</b> For use after nature (z230), and will keep you in D stance unless you are windstacking (Only useful if transfer is maxed out and wind empowerment is high). There\'s settings in the Windstacking tab that must be setup for this to function as intended.') },
			'multitoggle', 1, null, "Combat", [1]);
		createSetting('IgnoreCrits',
			function () { return (['Safety First', 'Ignore Void Strength', 'Ignore All Crits']) },
			function () { return ('No longer switches to B against corrupted precision and/or void strength. <b>Basically we now treat \'crit things\' as regular in both autoStance and autoStance2</b>. In fact it no longer takes precision / strength into account and will manage like a normal enemy, thus retaining X / D depending on your needs. If you\'re certain your block is high enough regardless if you\'re fighting a crit guy in a crit daily, use this! Alternatively, manage the stances yourself.') },
			'multitoggle', 0, null, 'Combat', [1],
			function () { return (autoTrimpSettings.AutoStance.value !== 3) });
		createSetting('autoAbandon',
			function () { return (['AutoAbandon', 'Don\'t Abandon', 'Only Rush Voids']) },
			function () { return ('<b>Autoabandon:</b> Considers abandoning trimps for void maps/prestiges.<br><b>Don\'t Abandon:</b> Will not abandon troops, but will still agressively autostance even if it will kill you (WILL NOT ABANDON TRIMPS TO DO VOIDS).<br><b>Only Rush Voids:</b> Considers abandoning trimps for void maps, but not prestiges, still autostances aggressively. <br>Made for Empower daily, and you might find this helpful if you\'re doing Workplace Safety feat. Then again with that I strongly recommend doing it fully manually. Anyway, don\'t blame me whatever happens.<br><b>Note:</b> AT will no longer be able to fix when your scryer gets stuck!') },
			'multitoggle', 0, null, 'Combat', [1, 2]);
		createSetting('ForceAbandon',
			function () { return ('Trimpicide') },
			function () { return ('If a new fight group is available and anticipation stacks aren\'t maxed, Trimpicide and grab a new group. Will not abandon in spire. Recommended ON. ') },
			'boolean', true, null, 'Combat', [1]);
		createSetting('AutoRoboTrimp',
			function () { return ('AutoRoboTrimp') },
			function () { return ('Use RoboTrimps ability starting at this level, and every 5 levels thereafter. (set to 0 to disable. default 60.) 60 is a good choice for mostly everybody.') },
			'value', '60', null, 'Combat', [1]);
		createSetting('fightforever',
			function () { return ('Fight Always') },
			function () { return ('U1: -1 to disable. Sends trimps to fight if they\'re not fighting, regardless of BAF. Has 2 uses. Set to 0 to always send out trimps. Or set a number higher than 0 to enable the H:D function. If the H:D ratio is below this number it will send them out. I.e, this is set to 1, it will send out trimps regardless with the H:D ratio is below 1. ') },
			'value', '-1', null, 'Combat', [1]);
		createSetting('addpoison',
			function () { return ('Poison Calc') },
			function () { return ('<b>Experimental. </b><br>Adds poison to the battlecalc. May improve your poison zone speed. ') },
			'boolean', false, null, 'Combat', [1]);
		createSetting('fullice',
			function () { return ('Ice Calc') },
			function () { return ('<b>Experimental. </b><br>Always calculates your ice to be a consistent level instead of going by the enemy debuff. Stops H:D spazzing out. ') },
			'boolean', false, null, 'Combat', [1]);
		createSetting('45stacks',
			function () { return ('Antistack Calc') },
			function () { return ('<b>Experimental. </b><br>Always calcs your damage as having full antistacks. Useful for windstacking. ') },
			'boolean', false, null, 'Combat', [1]);

		//Radon
		createSetting('equalityManagement',
			function () { return (['Auto Equality Off', 'Auto Equality: Basic', 'Auto Equality: Advanced']) },
			function () { return ('Manages Equality settings for you. <br><br><b>Auto Equality: Basic</b><br>Sets Equality to 0 on Slow enemies, and Autoscaling on for Fast enemies.<br><br><b>Auto Equality: Advanced</b><br>Will automatically identify the best equality levels to kill the current enemy and change it when necessary.') },
			'multitoggle', 0, null, 'Combat', [2]);
		createSetting('equalityCalc',
			function () { return (['Equality Calc Off', 'EC: On', 'EC: Health']) },
			function () { return ('<b>Experimental. </b><br>Adds Equality Scaling levels to the battlecalc. Will always calculate equality based on actual scaling levels when its turned off by other settings. Assumes you use Equality Scaling. Turning this on allows in-game Equality Scaling to adjust your Health accordingly. EC: Health only decreases enemies attack in the calculation which may improve speed. ') },
			'multitoggle', 0, null, 'Combat', [2],
			function () { return (getPageSetting('equalityManagement') < 2) });
		createSetting('gammaBurstCalc',
			function () { return ('Gamma Burst Calc') },
			function () { return ('<b>Experimental.</b><br>Adds Gamma Burst to your HD Ratio. Be warned, it will assume that you have a gamma burst ready to trigger for every attack so your HD Ratio might be 1 but you\'d need to attack 4-5 times to reach that damage theshold.') },
			'boolean', true, null, 'Combat', [1, 2],
			function () { return (getPageSetting('equalityManagement') === 2) });
		createSetting('frenzyCalc',
			function () { return ('Frenzy Calc') },
			function () { return ('<b>Experimental.</b><br>Adds frenzy to the calc. Be warned, it will not farm as much with this on as it expects 100% frenzy uptime.') },
			'boolean', false, null, 'Combat', [2],
			function () { return (!game.portal.Frenzy.radLocked && !autoBattle.oneTimers.Mass_Hysteria.owned) });

		//Scryer settings -- Need a rework!
		createSetting('UseScryerStance',
			function () { return ('Enable Scryer Stance') },
			function () { return ('<b>MASTER BUTTON</b> Activates all other scrying settings, and overrides AutoStance when scryer conditions are met. Leave regular Autostance on while this is active. Scryer gives 2x Resources (Non-' + resource() + '/Nullifium) and a chance for Dark Essence. Once this is on, priority for Scryer decisions goes as such:<br>NEVER USE, FORCE USE, OVERKILL, MIN/MAX ZONE<br><br><b>NO OTHER BUTTONS WILL DO ANYTHING IF THIS IS OFF.</b>') },
			'boolean', true, null, 'Combat', [1]);
		createSetting('ScryerUseWhenOverkill',
			function () { return ('Use When Overkill') },
			function () { return ('Overrides everything! Toggles stance when we can Overkill in S, giving us double loot with no speed penalty (minimum one overkill, if you have more than 1, it will lose speed) <b>NOTE:</b> This being on, and being able to overkill in S will override ALL other settings <u>(Except never use in spire)</u>. This is a boolean logic shortcut that disregards all the other settings including Min and Max Zone. If you ONLY want to use S during Overkill, as a workaround: turn this on and Min zone: to 9999 and everything else off(red). ') },
			'boolean', true, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerMinZone',
			function () { return ('Min Zone') },
			function () { return ('Minimum zone to start using scryer in.(inclusive) Recommend:(60 or 181). Overkill ignores this. This needs to be On & Valid for the <i>MAYBE</i> option on all other Scryer settings to do anything if Overkill is off. Tip: Use 9999 to disable all Non-Overkill, Non-Force, scryer usage.') },
			'value', '181', null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerMaxZone',
			function () { return ('Max Zone') },
			function () { return ('<b>0 or -1 to disable (Recommended)</b><br>Overkill ignores this. Zone to STOP using scryer at (not inclusive). Turning this ON with a positive number stops <i>MAYBE</i> use of all other Scryer settings.') },
			'value', '230', null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('onlyminmaxworld',
			function () { return ('World Min & Max Only') },
			function () { return ('Forces Scryer to only work in world regardless of other settings. ') },
			'boolean', false, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerUseinMaps2',
			function () { return (['Maps: NEVER', 'Maps: FORCE', 'Maps: MAYBE']) },
			function () { return ('<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate in Maps<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br>This setting requires use on Corrupteds to be on after corruption/magma.<br><br>Recommend MAYBE.') },
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerUseinVoidMaps2',
			function () { return (['VoidMaps: NEVER', 'VoidMaps: FORCE', 'VoidMaps: MAYBE']) },
			function () { return ('<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate in Void Maps<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed. ') },
			'multitoggle', 0, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerUseinPMaps',
			function () { return (['P Maps: NEVER', 'P Maps: FORCE', 'P Maps: MAYBE']) },
			function () { return ('<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate in maps higher than your zone<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br>Recommend NEVER.') },
			'multitoggle', 0, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerUseinBW',
			function () { return (['BW: NEVER', 'BW: FORCE', 'BW: MAYBE']) },
			function () { return ('<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate in BW Maps<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br>This setting requires use in Maps to be on. <br><br>Recommend NEVER.') },
			'multitoggle', 0, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerUseinSpire2',
			function () { return (['Spire: NEVER', 'Spire: FORCE', 'Spire: MAYBE']) },
			function () { return ('<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate in the Spire<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br>This setting requires use on Corrupteds to be on for corrupted enemies.<br><br>Recommend NEVER.') },
			'multitoggle', 0, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerSkipBoss2',
			function () { return (['Boss: NEVER (All Levels)', 'Boss: NEVER (Above VoidLevel)', 'Boss: MAYBE']) },
			function () { return ('<b>NEVER (All Levels)</b> will NEVER use S in cell 100 of the world!!!<br><b>NEVER (Above VoidLevel)</b> will NEVER use S in cell 100 of the world ABOVE the zone that your void maps are set to run at (Maps).<br><b>MAYBE</b> treats the cell no differently to any other, Overkill and Min/Max Scryer is allowed.<br><br>Recommend NEVER (There is little benefit to double NON-' + resource() + ' resources and a small chance of DE).') },
			'multitoggle', 0, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerSkipCorrupteds2',
			function () { return (['Corrupted: NEVER', 'Corrupted: FORCE', 'Corrupted: MAYBE']) },
			function () { return ('<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate against Corrupted enemies<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br><b>Magma maps and Corrupted Voidmaps are currently classified as corrupted</b> and NEVER here will override Maps and Voidmaps use of Scryer<br><br>Recommend MAYBE.') },
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerSkipHealthy',
			function () { return (['Healthy: NEVER', 'Healthy: FORCE', 'Healthy: MAYBE']) },
			function () { return ('<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate against Healthy enemies<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br><b>Corrupted Voidmaps are currently classified as Healthy (same as corrupted)</b> and NEVER here will override Maps and Voidmaps use of Scryer<br><br>Recommend MAYBE.') },
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryUseinPoison',
			function () { return ('Scry in Poison') },
			function () { return ('Decides what you do in Poison. <br><b>-1</b> = Maybe <br><b>0</b> = Never <br><b>Above 0</b> = Max Zone you want it scrying ') },
			'value', -1, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryUseinWind',
			function () { return ('Scry in Wind') },
			function () { return ('Decides what you do in Wind. <br><b>-1</b> = Maybe <br><b>0</b> = Never <br><b>Above 0</b> = Max Zone you want it scrying') },
			'value', -1, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryUseinIce',
			function () { return ('Scry in Ice') },
			function () { return ('Decides what you do in Ice. <br><b>-1</b> = Maybe <br><b>0</b> = Never <br><b>Above 0</b> = Max Zone you want it scrying') },
			'value', -1, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerDieZ',
			function () { return ('Die To Use S') },
			function () { return ('<b>-1 to disable.</b><br>Turning this on will switch you back to S even when doing so would kill you. Happens in scenarios where you used Skip Corrupteds that took you into regular Autostance X/H stance, killed the corrupted and reached a non-corrupted enemy that you wish to use S on, but you havent bred yet and you are too low on health to just switch back to S. So you\'d rather die, wait to breed, then use S for the full non-corrupted enemy, to maximize DE. NOTE: Use at your own risk.<br>Use this input to set the minimum zone that scryer activates in (You can use decimal values to specify what cell this setting starts from)') },
			'value', 230.60, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('screwessence',
			function () { return ('Remaining Essence Only') },
			function () { return ('Why scry when theres no essence? Turns off scrying when the remaining enemies with essence drops to 0. ') },
			'boolean', false, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Magma
	const displayMagma = true;
	if (displayMagma) {
		createSetting('UseAutoGen',
			function () { return ('Auto Generator') },
			function () { return ('Turn this on to use these settings. ') },
			'boolean', false, null, 'Magma', [1]);
		createSetting('beforegen',
			function () { return (['Gain Mi', 'Gain Fuel', 'Hybrid']) },
			function () { return ('<b>MODE BEFORE FUELING: </b>Which mode to use before fueling. This is the mode which the generator will use if you fuel after z230. ') },
			'multitoggle', 1, null, 'Magma', [1]);
		createSetting('fuellater',
			function () { return ('Start Fuel Z') },
			function () { return ('Start fueling at this zone instead of 230. I would suggest you have a value lower than your max, for obvious reasons. Recommend starting at a value close-ish to your max supply. Use 230 to use your <b>BEFORE FUEL</b> setting. ') },
			'value', -1, null, 'Magma', [1]);
		createSetting('fuelend',
			function () { return ('End Fuel Z') },
			function () { return ('End fueling at this zone. After this zone is reached, will follow your preference. -1 to fuel infinitely. ') },
			'value', -1, null, 'Magma', [1]);
		createSetting('defaultgen',
			function () { return (['Gain Mi', 'Gain Fuel', 'Hybrid']) },
			function () { return ('<b>MODE AFTER FUELING: </b>Which mode to use after fueling. ') },
			'multitoggle', 1, null, 'Magma', [1]);
		createSetting('AutoGenDC',
			function () { return (['Daily: Normal', 'Daily: Fuel', 'Daily: Hybrid']) },
			function () { return ('<b>Normal:</b> Uses the AutoGen settings. <br><b>Fuel:</b> Fuels the entire Daily. <br><b>Hybrid:</b> Uses Hybrid for the entire Daily. ') },
			'multitoggle', 1, null, 'Magma', [1]);
		createSetting('AutoGenC2',
			function () { return (['' + cinf() + ': Normal', '' + cinf() + ': Fuel', '' + cinf() + ': Hybrid']) },
			function () { return ('<b>Normal:</b> Uses the AutoGen settings. <br><b>Fuel:</b> Fuels the entire ' + cinf() + '. <br><b>Hybrid:</b> Uses Hybrid for the entire ' + cinf() + '. ') },
			'multitoggle', 1, null, 'Magma', [1]);

		//Spend Mi
		createSetting('spendmagmite',
			function () { return (['Spend Magmite OFF', 'Spend Magmite (Portal)', 'Spend Magmite Always']) },
			function () { return ('Auto Spends any unspent Magmite immediately before portaling. (Or Always, if toggled). Part 1 buys any permanent one-and-done upgrades in order from most expensive to least. Part 2 then analyzes Efficiency vs Capacity for cost/benefit, and buys Efficiency if its BETTER than Capacity. If not, if the PRICE of Capacity is less than the price of Supply, it buys Capacity. If not, it buys Supply. And then it repeats itself until you run out of Magmite and cant buy anymore. ') },
			'multitoggle', 1, null, 'Magma', [1]);
		createSetting('ratiospend',
			function () { return ('Ratio Spending') },
			function () { return ('Spends Magmite in a Ratio you define. ') },
			'boolean', false, null, 'Magma', [1]);
		createSetting('effratio',
			function () { return ('Efficiency') },
			function () { return ('Use -1 or 0 to not spend on this. Any value above 0 will spend. ') },
			'value', -1, null, 'Magma', [1],
			function () { return (autoTrimpSettings.ratiospend.enabled) });
		createSetting('capratio',
			function () { return ('Capacity') },
			function () { return ('Use -1 or 0 to not spend on this. Any value above 0 will spend. ') },
			'value', -1, null, 'Magma', [1],
			function () { return (autoTrimpSettings.ratiospend.enabled) });
		createSetting('supratio',
			function () { return ('Supply') },
			function () { return ('Use -1 or 0 to not spend on this. Any value above 0 will spend. ') },
			'value', -1, null, 'Magma', [1],
			function () { return (autoTrimpSettings.ratiospend.enabled) });
		createSetting('ocratio',
			function () { return ('Overclocker') },
			function () { return ('Use -1 or 0 to not spend on this. Any value above 0 will spend. ') },
			'value', -1, null, 'Magma', [1],
			function () { return (autoTrimpSettings.ratiospend.enabled) });
		createSetting('SupplyWall',
			function () { return ('Throttle Supply (or Capacity)') },
			function () { return ('Positive number NOT 1 e.g. 2.5: Consider Supply when its cost * 2.5 is < Capacity, instead of immediately when < Cap. Effectively throttles supply for when you don\'t need too many.<br><br>Negative number (-1 is ok) e.g. -2.5: Consider Supply if it costs < Capacity * 2.5, buy more supplys! Effectively throttling capacity instead.<br><br><b>Set to 1: DISABLE SUPPLY only spend magmite on Efficiency, Capacity and Overclocker. Always try to get supply close to your HZE. <br>Set to 0: IGNORE SETTING and use old behaviour (will still try to buy overclocker)</b>') },
			'valueNegative', 0.4, null, 'Magma', [1],
			function () { return (!autoTrimpSettings.ratiospend.enabled) });
		createSetting('spendmagmitesetting',
			function () { return (['Normal', 'Normal & No OC', 'OneTime Only', 'OneTime & OC']) },
			function () { return ('<b>Normal:</b> Spends Magmite Normally as Explained in Magmite spending behaviour. <br><b>Normal & No OC:</b> Same as normal, except skips OC afterbuying 1 OC upgrade. <br><b>OneTime Only:</b> Only Buys the One off upgrades except skips OC afterbuying 1 OC upgrade. <br><b>OneTime & OC:</b> Buys all One off upgrades, then buys OC only. ') },
			'multitoggle', 0, null, 'Magma', [1],
			function () { return (!autoTrimpSettings.ratiospend.enabled) });
		createSetting('MagmiteExplain',
			function () { return ('Magmite spending behaviour') },
			function () { return ('1. Buy one-and-done upgrades, expensive first, then consider 1st level of Overclocker;<br>2. Buy Overclocker IF AND ONLY IF we can afford it;<br>2.5. Exit if OneTimeOnly<br>3. Buy Efficiency if it is better than capacity;<br>4. Buy Capacity or Supply depending on which is cheaper, or based on SupplyWall') },
			'infoclick', 'MagmiteExplain', null, 'Magma', [1],
			function () { return (!autoTrimpSettings.ratiospend.enabled) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Heirloom //Done
	const displayHeirlooms = true;
	if (displayHeirlooms) {
		//Heirloom Swapping
		createSetting('heirloom',
			function () { return ('Heirloom Swapping') },
			function () { return ('Heirloom swapping master button. Turn this on to allow heirloom swapping and its associated settings. ') },
			'boolean', false, null, 'Heirlooms', [1, 2]);

		createSetting('heirloomMapSwap',
			function () { return ('Map Swap') },
			function () { return ('Toggle to swap to your afterpush shield when inside maps') },
			'boolean', false, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse)) });

		createSetting('heirloomVoidSwap',
			function () { return ('Void PB Swap') },
			function () { return ('If current enemy is slow and next enemy is fast swaps to your \'Void PB\' shield so that you can maximise PlagueBringer damage going into the next enemy.<br><br>Will only run during Void Maps that aren\'t double attack and won\'t function properly if your Void Shield doesn\'t have PlagueBringer and your Void PB shield has PlagueBringer.') },
			'boolean', false, null, 'Heirlooms', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse)) });

		//Shield swapping
		createSetting('heirloomShield',
			function () { return ('Shields') },
			function () { return ('Toggle to swap Shields') },
			'boolean', false, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse)) });

		createSetting('heirloomInitial',
			function () { return ('Initial') },
			function () { return ('<b>First Heirloom to use</b><br><br>Enter the name of your first heirloom. This is the heirloom that you will use before swapping to the second heirloom at the zone you have defined in the HS: Zone. ') },
			'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomAfterpush',
			function () { return ('Afterpush') },
			function () { return ('<b>Second Heirloom to use</b><br><br>Enter the name of your second heirloom. This is the heirloom that you will use after swapping from the first heirloom at the zone you have defined in the HS: Zone. ') },
			'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomC3',
			function () { return (cinf()) },
			function () { return ('<b>C3 heirloom to use</b><br><br>Enter the name of the heirloom you would like to use during C3\s and special challenges (Mayhem, Pandemonium).') },
			'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomVoid',
			function () { return ('Void') },
			function () { return ('<b>Void heirloom to use</b><br>Enter the name of the heirloom you would like to use during Void Maps.') },
			'textValue', 'undefined', null, 'Heirlooms', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomVoidPlaguebringer',
			function () { return ('Void PB') },
			function () { return ('Heirloom to use inside of Void Maps when fighting a slow enemy and the next enemy is fast. Either a max damage no health shield or plaguebringer shield should be used.') },
			'textValue', 'undefined', null, 'Heirlooms', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse) && getPageSetting('heirloomVoidSwap', currSettingUniverse)) });

		createSetting('heirloomSwapZone',
			function () { return ('Swap Zone') },
			function () { return ('Which zone to swap from your first heirloom you have defined to your second heirloom you have defined. I.e if this value is 75 it will switch to the second heirloom <b>on z75</b>') },
			'value', '-1', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomSwapZoneDaily',
			function () { return ('Daily Swap Zone') },
			function () { return ('Which zone to swap from your first heirloom you have defined to your second heirloom you have defined. I.e if this value is 75 it will switch to the second heirloom <b>on z75</b>') },
			'value', '-1', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomSwapZoneC3',
			function () { return (cinf() + ' Swap Zone') },
			function () { return ('Which zone to swap from your first heirloom you have defined to the ' + cinf() + ' heirloom you have defined. I.e if this value is 75 it will switch to the ' + cinf() + ' heirloom <b>on z75</b>') },
			'value', -1, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		//Staff swapping
		createSetting('heirloomStaff',
			function () { return ('Staffs') },
			function () { return ('Toggle to swap Staffs') },
			'boolean', false, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse)) });

		createSetting('heirloomStaffWorld',
			function () { return ('World') },
			function () { return ('<b>World Staff</b><br><br>Enter the name of your world staff.') },
			'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffMap',
			function () { return ('Map') },
			function () { return ('<b>General Map Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside maps, will be overwritten by the proceeding 3 heirloom settings if they\'re being used otherwise will work in every maptype.') },
			'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffFood',
			function () { return ('Savory Cache') },
			function () { return ('<b>Savory Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Savory Cache maps. Will use this staff for Tribute farming if it\'s enabled.') },
			'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffWood',
			function () { return ('Wooden Cache') },
			function () { return ('<b>Wooden Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Wooden Cache maps.') },
			'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffMetal',
			function () { return ('Metal Cache') },
			function () { return ('<b>Metal Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Metal Cache maps.') },
			'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomResourceStaff',
			function () { return ('Resource Cache') },
			function () { return ('<b>Resource Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Resource (Science) Cache maps.') },
			'textValue', 'undefined', null, 'Heirlooms', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		//Heirloom Line

		createSetting('heirloomAuto',
			function () { return ('Auto Heirlooms') },
			function () { return ('Auto Heirlooms master button. Turn this on to enable all Auto Heirloom settings. <br><br><b>The Modifier points will be explained here.</b> The more points an heirloom has, the better chance it has of being kept. If empty is selected, it will muliplty the score by 4. If any is selected, it will multiply the score of the heirloom by 2. <br><br>E.g Mod 1 = CC (+6 if dropped, 1st modifier) <br>Mod 2 = CD (+5 if dropped, 2nd modifier) <br>Mod 3 = PB (+4 if dropped, 3rd modifier) <br>Mod 4 = Empty (x4 if dropped, +0 if not) <br>Mod 5 = Empty (x4 if dropped, +0 if not) <br><br>If an heirloom dropped with these exact modifiers, it would get a score of 192 (6+5+4*4*4=240). The highest point heirlooms will be kept. ') },
			'boolean', false, null, 'Heirlooms', [1, 2]);

		createSetting('heirloomAutoTypeToKeep',
			function () { return (['None', 'Shields', 'Staffs', 'Cores', 'All']) },
			function () { return ('<b>Shields: </b>Keeps Shields and nothing else.<br><b>Staffs: </b>Keeps Staffs and nothing else.<br><b>Cores: </b>Keeps Cores and nothing else.<br><b>All: </b>Keeps 4 Shields and 3 Staffs and 3 Cores. If you have protected heirlooms in your inventory it will overrite one slot. E.g if one heirloom is protected, you will keep 4 Shields and 3 Staffs and 2 Cores. ') },
			'multitoggle', 0, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });
		createSetting('heirloomAutoRareToKeep',
			function () { return ('Rarity to Keep') },
			function () { return ('Auto Heirlooms. Keeps the selected rarity of heirloom, recycles all others. ') },
			'dropdown', 'Any', ["None", "Common", "Uncommon", "Rare", "Epic", "Legendary", "Magnificent", "Ethereal", "Magmatic", "Plagued", "Radiating", "Hazardous", "Enigmatic"], 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });
		createSetting('heirloomAutoOnlyPefect',
			function () { return ('Only Perfect') },
			function () { return ('Will make sure that Auto Heirlooms will only keep heirlooms that have the mods you selected on them. Be warned you have to ensure that all modifier slots have been selected when using this setting or it won\'t function properly.') },
			'boolean', false, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		//Shield Line
		createSetting('heirloomAutoShield',
			function () { return ('Shields') },
			function () { return ('Auto Heirlooms. Enables in-depth shield settings. ') },
			'boolean', false, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		createSetting('heirloomAutoShieldMod1',
			function () { return ('Shield: Modifier 1') },
			function () { return ('Auto Heirlooms. Keeps Shields with selected Mod. Modifier 1 is worth 6 points. ') },
			'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 0)
			});

		createSetting('heirloomAutoShieldMod2',
			function () { return ('Shield: Modifier 2') },
			function () { return ('Auto Heirlooms. Keeps Shields with selected Mod. Modifier 2 is worth 5 points. ') },
			'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 1)
			});

		createSetting('heirloomAutoShieldMod3',
			function () { return ('Shield: Modifier 3') },
			function () { return ('Auto Heirlooms. Keeps Shields with selected Mod. Modifier 3 is worth 4 points. ') },
			'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 2)
			});

		createSetting('heirloomAutoShieldMod4',
			function () { return ('Shield: Modifier 4') },
			function () { return ('Auto Heirlooms. Keeps Shields with selected Mod. Modifier 4 is worth 3 points. ') },
			'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 5)
			});

		createSetting('heirloomAutoShieldMod5',
			function () { return ('Shield: Modifier 5') },
			function () { return ('Auto Heirlooms. Keeps Shields with selected Mod. Modifier 5 is worth 2 points. ') },
			'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 8)
			});

		createSetting('heirloomAutoShieldMod6',
			function () { return ('Shield: Modifier 6') },
			function () { return ('Auto Heirlooms. Keeps Shields with selected Mod. Modifier 6 is worth 1 points. ') },
			'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 9)
			});

		createSetting('heirloomAutoShieldMod7',
			function () { return ('Shield: Modifier 7') },
			function () { return ('Auto Heirlooms. Keeps Shields with selected Mod. Modifier 7 is worth 1 points. ') },
			'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 11)
			});

		//Staff Line
		createSetting('heirloomAutoStaff',
			function () { return ('Staffs') },
			function () { return ('Auto Heirlooms. Enables in-depth staff settings. ') },
			'boolean', false, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		createSetting('heirloomAutoStaffMod1',
			function () { return ('Staff: Modifier 1') },
			function () { return ('Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 1 is worth 6 points. ') },
			'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "MinerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 0)
			});

		createSetting('heirloomAutoStaffMod2',
			function () { return ('Staff: Modifier 2') },
			function () { return ('Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 2 is worth 5 points. ') },
			'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "MinerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 1)
			});

		createSetting('heirloomAutoStaffMod3',
			function () { return ('Staff: Modifier 3') },
			function () { return ('Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 3 is worth 4 points. ') },
			'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "MinerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 2)
			});

		createSetting('heirloomAutoStaffMod4',
			function () { return ('Staff: Modifier 4') },
			function () { return ('Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 4 is worth 3 points. ') },
			'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "MinerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 5)
			});

		createSetting('heirloomAutoStaffMod5',
			function () { return ('Staff: Modifier 5') },
			function () { return ('Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 5 is worth 2 points. ') },
			'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "MinerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 7)
			});

		createSetting('heirloomAutoStaffMod6',
			function () { return ('Staff: Modifier 6') },
			function () { return ('Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 6 is worth 1 points. ') },
			'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "MinerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 9)
			});

		createSetting('heirloomAutoStaffMod7',
			function () { return ('Staff: Modifier 7') },
			function () { return ('Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 7 is worth 1 points. ') },
			'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "MinerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 11)
			});

		//Core Line
		createSetting('heirloomAutoCore',
			function () { return ('Cores') },
			function () { return ('Auto Heirlooms. Enables in-depth core settings. ') },
			'boolean', false, null, 'Heirlooms', [1],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });
		createSetting('heirloomAutoCoreMod1',
			function () { return ('Cores: Modifier 1') },
			function () { return ('Auto Heirlooms. Keeps Cores with selected Mod. Modifier 1 is worth 5 points. ') },
			'dropdown', 'empty', ["empty", "fireTrap", "poisonTrap", "lightningTrap", "runestones", "strengthEffect", "condenserEffect"], 'Heirlooms', [1],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse)) });
		createSetting('heirloomAutoCoreMod2',
			function () { return ('Cores: Modifier 2') },
			function () { return ('Auto Heirlooms. Keeps Cores with selected Mod. Modifier 2 is worth 4 points. ') },
			'dropdown', 'empty', ["empty", "fireTrap", "poisonTrap", "lightningTrap", "runestones", "strengthEffect", "condenserEffect"], 'Heirlooms', [1],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse)) });
		createSetting('heirloomAutoCoreMod3',
			function () { return ('Cores: Modifier 3') },
			function () { return ('Auto Heirlooms. Keeps Cores with selected Mod. Modifier 3 is worth 3 points. ') },
			'dropdown', 'empty', ["empty", "fireTrap", "poisonTrap", "lightningTrap", "runestones", "strengthEffect", "condenserEffect"], 'Heirlooms', [1],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse)) });
		createSetting('heirloomAutoCoreMod4',
			function () { return ('Cores: Modifier 4') },
			function () { return ('Auto Heirlooms. Keeps Cores with selected Mod. Modifier 4 is worth 2 points. ') },
			'dropdown', 'empty', ["empty", "fireTrap", "poisonTrap", "lightningTrap", "runestones", "strengthEffect", "condenserEffect"], 'Heirlooms', [1],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse)) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Golden //Done
	const displayGolden = true;
	if (displayGolden) {
		createSetting('autoGoldenSettings',
			function () { return ('Auto Gold Settings') },
			function () { return ('Click to adjust settings.') },
			'mazArray', [], 'MAZLookalike("Auto Golden", "AutoGolden", "MAZ")', 'Golden', [1, 2]);
		createSetting('autoGoldenDailySettings',
			function () { return ('Daily Auto Gold Settings') },
			function () { return ('Click to adjust settings.') },
			'mazArray', [], 'MAZLookalike("Daily Auto Golden", "AutoGoldenDaily", "MAZ")', 'Golden', [1, 2]);
		createSetting('autoGoldenC3Settings',
			function () { return (cinf() + 'Auto Gold Settings') },
			function () { return ('Click to adjust settings.') },
			'mazArray', [], 'MAZLookalike("C3 Auto Golden", "AutoGoldenC3", "MAZ")', 'Golden', [1, 2]);
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Nature
	const displayNature = true;
	if (displayNature) {
		//Tokens
		createSetting('AutoNatureTokens',
			function () { return ('Spend Nature Tokens') },
			function () { return ('<b>MASTER BUTTON</b> Automatically spend or convert nature tokens.') },
			'boolean', false, null, 'Nature', [1]);
		createSetting('tokenthresh',
			function () { return ('Token Threshold') },
			function () { return ('If Tokens would go below this value it will not convert tokens. ') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.AutoNatureTokens.enabled) });
		createSetting('AutoPoison',
			function () { return ('Poison') },
			function () { return ('Spend/convert Poison tokens') },
			'dropdown', 'Off', ['Off', 'Empowerment', 'Transfer', 'Convert to Wind', 'Convert to Ice', 'Convert to Both'], 'Nature', [1],
			function () { return (autoTrimpSettings.AutoNatureTokens.enabled) });
		createSetting('AutoWind',
			function () { return ('Wind') },
			function () { return ('Spend/convert Wind tokens') },
			'dropdown', 'Off', ['Off', 'Empowerment', 'Transfer', 'Convert to Poison', 'Convert to Ice', 'Convert to Both'], 'Nature', [1],
			function () { return (autoTrimpSettings.AutoNatureTokens.enabled) });
		createSetting('AutoIce',
			function () { return ('Ice') },
			function () { return ('Spend/convert Ice tokens') },
			'dropdown', 'Off', ['Off', 'Empowerment', 'Transfer', 'Convert to Poison', 'Convert to Wind', 'Convert to Both'], 'Nature', [1],
			function () { return (autoTrimpSettings.AutoNatureTokens.enabled) });

		//Enlights
		createSetting('autoenlight',
			function () { return ('Enlight: Auto') },
			function () { return ('Enables Automatic Enlightenment. Use the settings to define how it works. ') },
			'boolean', false, null, 'Nature', [1]);
		createSetting('pfillerenlightthresh',
			function () { return ('E: F: Poison') },
			function () { return ('Activate Poison Enlight when Enlight cost is below this Thresh in Fillers. Consumes Tokens. -1 to disable. ') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('wfillerenlightthresh',
			function () { return ('E: F: Wind') },
			function () { return ('Activate Wind Enlight when Enlight cost is below this Thresh in Fillers. Consumes Tokens. -1 to disable. ') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('ifillerenlightthresh',
			function () { return ('E: F: Ice') },
			function () { return ('Activate Ice Enlight when Enlight cost is below this Thresh in Fillers. Consumes Tokens. -1 to disable. ') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('pdailyenlightthresh',
			function () { return ('E: D: Poison') },
			function () { return ('Activate Poison Enlight when Enlight cost is below this Thresh in Dailies. Consumes Tokens. -1 to disable. ') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('wdailyenlightthresh',
			function () { return ('E: D: Wind') },
			function () { return ('Activate Wind Enlight when Enlight cost is below this Thresh in Dailies. Consumes Tokens. -1 to disable. ') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('idailyenlightthresh',
			function () { return ('E: D: Ice') },
			function () { return ('Activate Ice Enlight when Enlight cost is below this Thresh in Dailies. Consumes Tokens. -1 to disable. ') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('pc2enlightthresh',
			function () { return ('E: C: Poison') },
			function () { return ('Activate Poison Enlight when Enlight cost is below this Thresh in ' + cinf() + 's. Consumes Tokens. -1 to disable. ') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('wc2enlightthresh',
			function () { return ('E: C: Wind') },
			function () { return ('Activate Wind Enlight when Enlight cost is below this Thresh in ' + cinf() + 's. Consumes Tokens. -1 to disable. ') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('ic2enlightthresh',
			function () { return ('E: C: Ice') },
			function () { return ('Activate Ice Enlight when Enlight cost is below this Thresh in ' + cinf() + 's. Consumes Tokens. -1 to disable. ') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Display
	const displayDisplay = true;
	if (displayDisplay) {
		createSetting('displayEnhancedGrid',
			function () { return ('Enhance Grids') },
			function () { return ('Apply slight visual enhancements to world and map grids that highlights with drop shadow all the exotic, powerful, skeletimps and other special imps.') },
			'boolean', false, null, 'Display', [1, 2]);
		createSetting('displayAutoMapStatus',
			function () { return ('AutoMap Status') },
			function () { return ('Enables the display of the map status. Turn this off to reduce memory. ') },
			'boolean', true, null, 'Display', [1, 2]);
		createSetting('displayHeHr',
			function () { return (resourceHour() + '/hr status') },
			function () { return ('Enables the display of your ' + resource().toLowerCase() + ' per hour. Turn this off to reduce memory. ') },
			'boolean', true, null, 'Display', [1, 2]);

		createSetting('displayAllSettings',
			function () { return ('Display all settings') },
			function () { return ('Will display all of the locked settings that have HZE or other requirements to be displayed.') },
			'boolean', false, null, 'Display', [1, 2]);

		createSetting('EnableAFK',
			function () { return ('Go AFK Mode') },
			function () { return ('(Action Button). Go AFK uses a Black Screen, and suspends ALL the Trimps GUI visual update functions (updateLabels) to improve performance by not doing unnecessary stuff. This feature is primarily just a CPU and RAM saving mode. Everything will resume when you come back and press the Back button. Console debug output is also disabled. The blue color means this is not a settable setting, just a button. You can now also click the Zone # (World Info) area to go AFK now.') },
			'action', 'MODULES["performance"].EnableAFKMode()', null, 'Display', [1, 2]);

		createSetting('debugEqualityStats',
			function () { return ('debugEqualityStats') },
			function () { return ('Will display details of trimp/enemy stats when you gamma burst.') },
			'boolean', false, null, 'Display', [2]);
		createSetting('automateSpireAssault',
			function () { return ('Automate Spire Assault') },
			function () { return ('Automates Spire Assault gear swaps from level 92 up to level 128. HIGHLY RECOMMENDED THAT YOU DO NOT USE THIS SETTING.') },
			'boolean', false, null, 'Display', [0]);
		createSetting('showbreedtimer',
			function () { return ('Enable Breed Timer') },
			function () { return ('Enables the display of the hidden breedtimer. Turn this off to reduce memory. ') },
			'boolean', true, null, 'Display', [1]);
	}

	//Spam
	const displaySpam = true;
	if (displaySpam) {
		createSetting('spamMessages',
			function () { return ('Spam Message Settings') },
			function () { return ('Click to adjust settings.') },
			'mazDefaultArray', {
			general: false,
			fragment: false,
			upgrades: false,
			equipment: false,
			maps: false,
			map_Details: false,
			other: false,
			buildings: false,
			jobs: false,
			zone: false,
		}, null, 'Display', [1, 2]);

		createSetting('sitInMaps',
			function () { return ('Sit in maps') },
			function () { return ('Will cause AT to go sit in the map chamber when enabled. The \'Sit In Zone\' setting must be setup for this to work properly.') },
			'boolean', false, null, 'Display', [1, 2]);
		createSetting('sitInMaps_Zone',
			function () { return ('SIM: Zone') },
			function () { return ('AT will go to the map chamber and stop running any maps at this zone.') },
			'value', -1, null, 'Display', [1, 2],
			function () { return (getPageSetting('sitInMaps', currSettingUniverse)) });
		createSetting('sitInMaps_Cell',
			function () { return ('SIM: Cell') },
			function () { return ('AT will go to the map chamber and stop running any maps after this cell has been reached.') },
			'value', -1, null, 'Display', [1, 2],
			function () { return (getPageSetting('sitInMaps', currSettingUniverse)) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	document.getElementById('battleSideTitle').setAttribute('onclick', 'MODULES["performance"].EnableAFKMode()');

	document.getElementById('displayAutoMapStatus').setAttribute('onclick', 'toggleStatus()');
	document.getElementById('displayHeHr').setAttribute('onclick', 'toggleHeHr()');

	//Sorting out spacing issues with swapping between Helium & Radon settings.
	document.getElementById('radonsettings').setAttribute('onclick', 'settingChanged("radonsettings"), modifyParentNodeUniverseSwap()');
	document.getElementById('heirloomAuto').setAttribute('onclick', 'settingChanged("heirloomAuto"), modifyParentNodeUniverseSwap()');
	document.getElementById('displayAllSettings').setAttribute('onclick', 'settingChanged("displayAllSettings"), modifyParentNodeUniverseSwap()');

	document.getElementById('battleSideTitle').setAttribute('onmouseover', "getZoneStats(event);this.style.cursor='pointer'");

	//----------------------------------------------------------------------------------------------------------------------

	//Export/Import/Default
	const displayImport = true;
	if (displayImport) {
		createSetting('ImportAutoTrimps',
			function () { return ('Import AutoTrimps') },
			function () { return ('Import your AutoTrimps Settings. Asks you to name it as a profile afterwards.') },
			'infoclick', 'ImportAutoTrimps', null, 'Import Export', [1, 2]);
		createSetting('ExportAutoTrimps',
			function () { return ('Export AutoTrimps') },
			function () { return ('Export your AutoTrimps Settings as a output string text formatted in JSON.') },
			'infoclick', 'ExportAutoTrimps', null, 'Import Export', [1, 2]);
		createSetting('DefaultAutoTrimps',
			function () { return ('Reset to Default') },
			function () { return ('Reset everything to the way it was when you first installed the script. ') },
			'infoclick', 'ResetDefaultSettingsProfiles', null, 'Import Export', [1, 2]);
		createSetting('DownloadDebug',
			function () { return ('Download for debug') },
			function () { return ('Will download both your save and AT settings so that they can be debugged easier.') },
			'action', 'ImportExportTooltip("ExportAutoTrimps","update",true)', null, 'Import Export', [1, 2]);
		createSetting('spreadsheet',
			function () { return ('Spreadsheet Output') },
			function () { return ('Will print a list of your current C3, SA and other relevant settings to paste into a spreadsheet. Only relevant to a select few.') },
			'action', 'ImportExportTooltip("Spreadsheet","update")', null, 'Import Export', [1, 2]);
		createSetting('CleanupAutoTrimps',
			function () { return ('Cleanup Saved Settings') },
			function () { return ('Deletes old values from previous versions of the script from your AutoTrimps Settings file.') },
			'infoclick', 'CleanupAutoTrimps', null, 'Import Export', [1, 2]);
	}
}

function resource() {
	return currSettingUniverse === 2 ? 'Radon' : 'Helium';
}
function resourceHour() {
	return currSettingUniverse === 2 ? 'Rn' : 'He';
}

function cinf() {
	return currSettingUniverse === 2 ? 'C3' : 'C2';
}

initializeAllSettings();
automationMenuInit();
updateATVersion();
modifyParentNodeUniverseSwap();

function createSetting(id, name, description, type, defaultValue, list, container, universe, require) {
	var btnParent = document.createElement("DIV");
	btnParent.setAttribute('style', 'display: inline-block; vertical-align: top; margin-left: 1vw; margin-bottom: 1vw; width: 13.142vw;');
	btnParent.setAttribute("id", id + 'Parent');
	var btn = document.createElement("DIV");
	btn.id = id;
	var loaded = autoTrimpSettings[id];

	if (type == 'boolean') {
		if (!(loaded && id == loaded.id && loaded.type === type))
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				enabled: loaded === undefined ? (defaultValue || false) : typeof loaded.enabled === 'undefined' ? loaded : loaded.enabled,
				enabledU2: loaded === undefined ? (defaultValue || false) : typeof loaded.enabledU2 === 'undefined' ? loaded : loaded.enabledU2,
				universe: universe
			};
		if (require) autoTrimpSettings[id].require = require
		btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1.1vw; height: auto;");
		btn.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + autoTrimpSettings[id].enabled);
		btn.setAttribute("onclick", 'settingChanged("' + id + '")');
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.innerHTML = name();
		btnParent.appendChild(btn);
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);

	} else if (type == 'value' || type == 'valueNegative' || type == 'mazDefaultArray') {
		if (!(loaded && id == loaded.id && loaded.type === type))
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				value: loaded === undefined || loaded === null ? defaultValue : typeof loaded.value === 'undefined' ? loaded : loaded.value,
				valueU2: loaded === undefined || loaded === null ? defaultValue : typeof loaded.valueU2 === 'undefined' ? loaded : loaded.valueU2,
				universe: universe
			};
		if (require) autoTrimpSettings[id].require = require
		btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute('class', 'noselect settingsBtn btn-info');
		btn.setAttribute("onclick", `autoSetValueToolTip("${id}", "${name()}", ${type == 'valueNegative'}, ${type == 'multiValue'})`);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.innerHTML = name();
		btnParent.appendChild(btn);
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);

	} else if (type == 'multiValue' || type == 'valueNegative') {
		if (!(loaded && id == loaded.id && loaded.type === type))
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				value: loaded === undefined ? defaultValue : typeof loaded.value === 'undefined' ? loaded : loaded.value,
				valueU2: loaded === undefined ? defaultValue : typeof loaded.valueU2 === 'undefined' ? loaded : loaded.valueU2,
				universe: universe
			};
		if (require) autoTrimpSettings[id].require = require
		btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1.1vw; height: auto;");
		btn.setAttribute('class', 'noselect settingsBtn btn-info');
		btn.setAttribute("onclick", `autoSetValueToolTip("${id}", "${name()}", ${type == 'valueNegative'}, ${type == 'multiValue'})`);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.innerHTML = name();
		btnParent.appendChild(btn);
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);

	} else if (type == 'textValue') {
		if (!(loaded && id == loaded.id && loaded.type === type))
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				value: loaded === undefined ? defaultValue : typeof loaded.value === 'undefined' ? loaded : loaded.value,
				valueU2: loaded === undefined ? defaultValue : typeof loaded.valueU2 === 'undefined' ? loaded : loaded.valueU2,
				universe: universe
			};
		if (require) autoTrimpSettings[id].require = require
		btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute('class', 'noselect settingsBtn btn-info');
		btn.setAttribute("onclick", `autoSetTextToolTip("${id}", "${name()}", ${type == 'textValue'})`);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.innerHTML = name();
		btnParent.appendChild(btn);
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);

	} else if (type == 'textArea') {
		if (!(loaded && id == loaded.id && loaded.type === type))
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				value: loaded === undefined ? defaultValue : typeof loaded.value === 'undefined' ? loaded : loaded.value,
				valueU2: loaded === undefined ? defaultValue : typeof loaded.valueU2 === 'undefined' ? loaded : loaded.valueU2,
				universe: universe
			};
		if (require) autoTrimpSettings[id].require = require
		btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute('class', 'noselect settingsBtn btn-info');
		btn.setAttribute("onclick", `autoSetTextToolTip("${id}", "${name()}", ${type == 'textarea'})`);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.innerHTML = name();
		btnParent.appendChild(btn);
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);

	} else if (type == 'dropdown') {
		if (!(loaded && id == loaded.id && loaded.type === type))
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				selected: loaded === undefined ? defaultValue : typeof loaded.selected === 'undefined' ? loaded : loaded.selected,
				selectedU2: loaded === undefined ? defaultValue : typeof loaded.selectedU2 === 'undefined' ? loaded : loaded.selectedU2,
				universe: universe,
				list: list
			};
		if (require) autoTrimpSettings[id].require = require;
		var btn = document.createElement("select");
		btn.id = id;
		if (game.options.menu.darkTheme.enabled == 2) btn.setAttribute("style", "color: #C8C8C8; font-size: 1.0vw;");
		else btn.setAttribute("style", "color:black; font-size: 1.0vw;");
		btn.setAttribute("class", "noselect");
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.setAttribute("onchange", 'settingChanged("' + id + '")');
		for (var item in list) {
			var option = document.createElement("option");
			option.value = list[item];
			option.text = list[item];
			btn.appendChild(option);
		}
		btn.value = autoTrimpSettings[id].selected;
		var dropdownLabel = document.createElement("Label");
		dropdownLabel.id = id + "Label";
		dropdownLabel.innerHTML = name() + ":";
		dropdownLabel.setAttribute('style', 'margin-right: 0.3vw; font-size: 0.8vw;');
		btnParent.appendChild(dropdownLabel);
		btnParent.appendChild(btn);
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);
	} else if (type == 'infoclick') {
		if (!(loaded && id == loaded.id && loaded.type === type))
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				universe: universe
			};
		btn.setAttribute('class', 'noselect settingsBtn settingBtn3');
		btn.setAttribute("onclick", 'ImportExportTooltip(\'' + defaultValue + '\', \'update\')');
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.setAttribute("style", "color: black; background-color: #6495ed; font-size: 1.1vw;");
		btn.innerHTML = name();
		if (require) autoTrimpSettings[id].require = require
		//btnParent.style.width = '';
		btnParent.appendChild(btn);
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);
		return;

	} else if (type == 'multitoggle') {
		if (!(loaded && id == loaded.id && loaded.type === type))
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				value: loaded === undefined ? defaultValue : typeof loaded.value === 'undefined' ? loaded : loaded.value,
				valueU2: loaded === undefined ? defaultValue : typeof loaded.valueU2 === 'undefined' ? loaded : loaded.valueU2,
				universe: universe
			};
		btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1.1vw; height: auto;");
		btn.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + autoTrimpSettings[id].value);
		btn.setAttribute("onclick", 'settingChanged("' + id + '")');
		btn.setAttribute("onmouseover", 'tooltip(\"' + name().join(' / ') + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.innerHTML = autoTrimpSettings[id].name()[autoTrimpSettings[id]["value"]];
		btnParent.appendChild(btn);
		if (require) autoTrimpSettings[id].require = require
		if (id === 'dailyPortal') {
			btnParent.setAttribute('class', 'toggleConfigBtnLocal settingsBtnLocal settingsBtnfalse')
			btnParent.setAttribute('style', 'max-height: 3.1vh; display: inline-block; vertical-align: top; margin-left: 1vw; margin-bottom: 1vw; width: 13.142vw;border-bottom: 1px solid black !important;')
			btn.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1.1vw; height: auto;")
		}
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);

		if (id === 'dailyPortal') {

			var autoPortalContainer = document.getElementById("dailyPortalParent");
			var autoPortalSettings = document.createElement("DIV");
			autoPortalSettings.setAttribute('onclick', 'MAZLookalike("AT Daily Auto Portal", "a", "DailyAutoPortal")');
			autoPortalSettings.setAttribute('class', 'settingsBtnLocalCogwheel');
			autoPortalSettings.setAttribute('style', 'margin-left:-1px;');
			var autoPortalSettingsButton = document.createElement("SPAN");
			autoPortalSettingsButton.setAttribute('class', 'glyphicon glyphicon-cog');
			autoPortalContainer.appendChild(autoPortalSettings);
			autoPortalSettings.appendChild(autoPortalSettingsButton);
		}
	} else if (type === 'mazArray') {
		if (!(loaded && id == loaded.id && loaded.type === type))
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				value: loaded === undefined ? defaultValue : typeof loaded.value === 'undefined' ? loaded : loaded.value,
				valueU2: loaded === undefined ? defaultValue : typeof loaded.valueU2 === 'undefined' ? loaded : loaded.valueU2,
				universe: universe
			};
		//btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute('class', 'noselect settingsBtn settingBtn3');
		btn.setAttribute('onclick', list);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.setAttribute("style", "color: black; background-color: #6495ed; font-size: 1.1vw;");
		btn.innerHTML = name();
		btnParent.appendChild(btn);
		if (require) autoTrimpSettings[id].require = require
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);
		return;
	} else if (type === 'action') {
		if (!(loaded && id == loaded.id && loaded.type === type))
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				universe: universe
			};
		//btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute('class', 'noselect settingsBtn settingBtn3');
		btn.setAttribute('onclick', defaultValue);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.setAttribute("style", "color: black; background-color: #6495ed; font-size: 1.1vw;");
		btn.innerHTML = name();
		btnParent.appendChild(btn);
		if (require) autoTrimpSettings[id].require = require
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);
		return;
	}
	if (autoTrimpSettings[id].name != name)
		autoTrimpSettings[id].name = name;
	if (autoTrimpSettings[id].description != description)
		autoTrimpSettings[id].description = description;

}

function createInput(id, name, description) {
	var $btnParent = document.createElement("DIV");
	$btnParent.setAttribute('style', 'display: inline-block; vertical-align: top; margin-left: 0.5vw; margin-bottom: 0.5vw; width: 6.5vw;');
	$btnParent.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
	$btnParent.setAttribute("onmouseout", 'tooltip("hide")');
	var $input = document.createElement("input");
	$input.type = 'checkbox';
	$input.setAttribute('id', id);
	$input.setAttribute('style', 'text-align: left; width: 0.8vw; ');
	$btnParent.appendChild($input);
	var $label = document.createElement("label");
	$label.setAttribute('style', 'text-align: left; margin-left: 0.2vw; font-size: 0.6vw');
	$label.innerHTML = name;
	$btnParent.appendChild($label);
	document.getElementById("autoSettings").appendChild($btnParent);
}

function settingChanged(id, currUniverse) {
	var btn = autoTrimpSettings[id];
	var radonon = currUniverse ? game.global.universe === 2 : autoTrimpSettings.radonsettings.value == 1;
	if (btn.type == 'boolean') {
		var enabled = 'enabled'
		if (radonon && id !== 'portalVoidIncrement' && id !== 'PauseScript') enabled += 'U2';
		btn[enabled] = !btn[enabled];
		document.getElementById(id).setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + btn[enabled]);
		if (id == 'equipEfficientEquipDisplay') {
			displayMostEfficientEquipment();
		}
		if (btn === autoTrimpSettings.dailyPortalStart) {
			document.getElementById('dailyPortalStart').setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + btn[enabled]);
		}
		if (btn.id === 'equipOn') {
			document.getElementById('autoEquipLabel').parentNode.setAttribute('class', 'pointer noselect autoUpgradeBtn settingBtn' + btn[enabled]);
		}
		if (btn === autoTrimpSettings.buildingsType) {
			document.getElementById('autoStructureLabel').parentNode.setAttribute('class', 'toggleConfigBtn pointer noselect autoUpgradeBtn settingBtn' + btn[enabled]);
		}
	}
	if (btn.type == 'multitoggle') {
		var value = 'value'
		if (radonon && id !== 'radonsettings') value += 'U2';
		if (id == 'AutoMagmiteSpender2' && btn[value] == 1) {
			magmiteSpenderChanged = true;
			setTimeout(function () {
				magmiteSpenderChanged = false;
			}, 5000);
		}
		btn[value]++;
		if (btn[value] > btn.name().length - 1)
			btn[value] = 0;
		document.getElementById(id).setAttribute('class', 'noselect settingsBtn settingBtn' + btn[value]);
		document.getElementById(id).innerHTML = btn.name()[btn[value]]
		if (btn.id === 'jobType') {
			document.getElementById('autoJobLabel').parentNode.setAttribute('class', 'toggleConfigBtn pointer noselect autoUpgradeBtn settingBtn' + (btn[value] == 2 ? 3 : btn[value]));
			document.getElementById('autoJobLabel').innerHTML = btn.name()[btn[value]];
		}
		if (btn.id === 'dailyPortal') {
			document.getElementById(btn.id).setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + (btn[value] == 2 ? 3 : btn[value]));
		}
	}
	if (btn.type == 'dropdown') {
		var selected = 'selected'
		if (radonon) selected += 'U2';
		btn[selected] = document.getElementById(id).value;
	}

	updateCustomButtons();
	saveSettings();
}

function updateButtonText() {

	var id = 'jobType'
	var btn = autoTrimpSettings[id];
	var btnValue = getPageSetting(id);

	document.getElementById('autoJobLabel').parentNode.setAttribute('class', 'toggleConfigBtn pointer noselect autoUpgradeBtn settingBtn' + (btnValue == 2 ? 3 : btnValue));
	document.getElementById('autoJobLabel').innerHTML = btn.name()[btnValue];

	var id = 'equipOn'
	var btnValue = getPageSetting(id);

	document.getElementById('autoEquipLabel').parentNode.setAttribute('class', 'pointer noselect autoUpgradeBtn settingBtn' + btnValue);
}

function modifyParentNode(id, style) {
	var style = !style ? 'show' : style;
	var elem = document.getElementById(id).parentNode.parentNode.children;
	for (i = 0; i < elem.length; i++) {
		if (document.getElementById(id).parentNode.parentNode.children[i].children[0] === undefined) {
			continue
		}
		else {
			if (document.getElementById(id).parentNode.parentNode.children[i].children[0].id === id || document.getElementById(id).parentNode.parentNode.children[i].children[0].id === (id + 'Label')) {
				if (elem.length >= (i + 1) && document.getElementById(id).parentNode.parentNode.children[(i + 1)].style.length == 0) {
					if (style === 'hide') document.getElementById(id).parentNode.parentNode.children[(i + 1)].remove()
					break;

				}
				else if (style === 'show') {
					document.getElementById(id).parentNode.parentNode.children[i].insertAdjacentHTML('afterend', '<br>');
				}
			}
		}
	}
}

function modifyParentNodeUniverseSwap() {

	radonon = getPageSetting('radonsettings') === 1 ? 'show' : 'hide'
	radonon_mayhem = getPageSetting('radonsettings') === 1 && (getPageSetting('displayAllSettings') || game.global.mayhemCompletions < 25) ? 'show' : 'hide'
	radonon_panda = getPageSetting('radonsettings') === 1 && (getPageSetting('displayAllSettings') || game.global.pandCompletions < 25) ? 'show' : 'hide'
	radonon_heirloom = getPageSetting('radonsettings') === 1 && getPageSetting('heirloomAuto') ? 'show' : 'hide'
	radonoff = getPageSetting('radonsettings') === 0 ? 'show' : 'hide'
	radonoff_heirloom = getPageSetting('radonsettings') === 0 && getPageSetting('heirloomAuto') ? 'show' : 'hide'

	//Core
	modifyParentNode("radonsettings", 'show');
	modifyParentNode("amalcoordz", radonoff);

	//Dailies
	modifyParentNode("dscryvoidmaps", radonoff);
	modifyParentNode("dPreSpireNurseries", radonoff);
	modifyParentNode("liqstack", radonoff);
	modifyParentNode("mapOddEvenIncrement", radonon);
	modifyParentNode("dailyHeliumHrBuffer", 'show');

	if (getPageSetting('displayAllSettings', currSettingUniverse)) modifyParentNode("heliumC2Challenge", 'show');
	else modifyParentNode("heliumC2Challenge", 'hide');

	//Maps
	//Helium Settings
	modifyParentNode("scryvoidmaps", 'show');
	modifyParentNode("worshipperFarmSettings", 'show');

	//Gear equipNoShields
	modifyParentNode("equipNoShields", 'show');

	//Spire
	//None!

	//Combat
	modifyParentNode("gammaBurstCalc", radonoff);

	//ATGA
	modifyParentNode("ATGA2timer", radonoff);

	//C2
	modifyParentNode("c2GoldenMaps", 'show');
	modifyParentNode("c2Fused", radonoff);
	modifyParentNode("balanceImprobDestack", radonoff);

	modifyParentNode("c2RunnerPercent", radonon);
	modifyParentNode("unbalanceImprobDestack", radonon);
	modifyParentNode("trappapaloozaCoords", radonon);
	modifyParentNode("questSmithyMaps", radonon);
	modifyParentNode("mayhemMP", radonon_mayhem);
	modifyParentNode("stormStacks", radonon);
	modifyParentNode("pandemoniumMP", radonon_panda);
	modifyParentNode("glassStacks", radonon);
	modifyParentNode("wither", radonon);

	//Challenges
	modifyParentNode("decayStacksToAbandon", radonoff);
	modifyParentNode("lifeStacks", radonoff);
	modifyParentNode("mapologyPrestige", radonoff);
	modifyParentNode("archaeologyString3", radonon);

	//Magma
	modifyParentNode("AutoGenC2", radonoff);

	//Heirlooms
	//Helium Settings
	modifyParentNode("heirloomVoidSwap", 'show');
	modifyParentNode("heirloomVoidPlaguebringer", 'show');
	modifyParentNode("heirloomSwapZoneC3", 'show');
	modifyParentNode("heirloomResourceStaff", 'show');
	if (getPageSetting('radonsettings') === 0) {
		modifyParentNode("heirloomAutoOnlyPefect", radonoff_heirloom);
		modifyParentNode("heirloomAutoShieldMod7", radonoff_heirloom);
		modifyParentNode("heirloomAutoStaffMod7", radonoff_heirloom);
	}
	//Radon Settings
	if (getPageSetting('radonsettings') === 1) {
		modifyParentNode("heirloomAutoOnlyPefect", radonon_heirloom);
		modifyParentNode("heirloomAutoShieldMod7", radonon_heirloom);
	}
	//Golden Upgrades
	//Helium Settings
	//Radon Settings

	//Nature Upgrades
	//Helium Settings
	modifyParentNode("AutoIce", radonoff);
	modifyParentNode("autoenlight", radonoff);
	modifyParentNode("ifillerenlightthresh", radonoff);
	modifyParentNode("idailyenlightthresh", radonoff);
	//Radon Settings
	//None!


	modifyParentNode("automateSpireAssault", radonon);
	modifyParentNode("showbreedtimer", radonoff);

	updateCustomButtons(true);
}

function heliumChallengesSetting() {
	var highestZone = game.global.highestLevelCleared + 1;
	var heliumChallenges = ["Off", "Helium Per Hour"];
	if (highestZone >= 40) heliumChallenges.push("Balance");
	if (highestZone >= 55) heliumChallenges.push("Decay");
	if (game.global.prisonClear >= 1) heliumChallenges.push("Electricity");
	if (highestZone > 110) heliumChallenges.push("Life");
	if (highestZone > 125) heliumChallenges.push("Crushed");
	if (highestZone >= 145) heliumChallenges.push("Nom");
	if (highestZone >= 165) heliumChallenges.push("Toxicity");
	if (highestZone >= 180) heliumChallenges.push("Watch");
	if (highestZone >= 180) heliumChallenges.push("Lead");
	if (highestZone >= 190) heliumChallenges.push("Corrupted");
	if (highestZone >= 215) heliumChallenges.push("Domination");
	if (highestZone >= 510) heliumChallenges.push('Frigid');
	if (highestZone >= 600) heliumChallenges.push("Experience");
	heliumChallenges.push("Custom");
	if (highestZone >= 65) heliumChallenges.push("Challenge 2");

	if (document.getElementById('autoPortal').children.length !== heliumChallenges.length) {
		document.getElementById('autoPortal').innerHTML = '';
		for (var item in heliumChallenges) {
			var option = document.createElement("option");
			option.value = heliumChallenges[item];
			option.text = heliumChallenges[item];
			document.getElementById('autoPortal').appendChild(option);
		}
	}

	var heliumHourChallenges = ["None"];
	if (highestZone >= 40) heliumHourChallenges.push("Balance");
	if (highestZone >= 55) heliumHourChallenges.push("Decay");
	if (game.global.prisonClear >= 1) heliumHourChallenges.push("Electricity");
	if (highestZone > 110) heliumHourChallenges.push("Life");
	if (highestZone > 125) heliumHourChallenges.push("Crushed");
	if (highestZone >= 145) heliumHourChallenges.push("Nom");
	if (highestZone >= 165) heliumHourChallenges.push("Toxicity");
	if (highestZone >= 180) heliumHourChallenges.push("Watch");
	if (highestZone >= 180) heliumHourChallenges.push("Lead");
	if (highestZone >= 190) heliumHourChallenges.push("Corrupted");
	if (highestZone >= 215) heliumHourChallenges.push("Domination");
	if (highestZone >= 600) heliumHourChallenges.push("Experience");

	if (
		(document.getElementById('heliumHourChallenge').children.length || document.getElementById('dailyHeliumHourChallenge').children.length)
		< heliumHourChallenges.length) {

		document.getElementById('heliumHourChallenge').innerHTML = '';
		for (var item in heliumHourChallenges) {
			var option = document.createElement("option");
			option.value = heliumHourChallenges[item];
			option.text = heliumHourChallenges[item];
			document.getElementById('heliumHourChallenge').appendChild(option);
		}
		document.getElementById('dailyHeliumHourChallenge').innerHTML = document.getElementById('heliumHourChallenge').innerHTML;

		if (highestZone >= 65) {
			var option = document.createElement("option");
			option.value = 'Challenge 2';
			option.text = 'Challenge 2';
			document.getElementById('dailyHeliumHourChallenge').appendChild(option);
		}
	}

	var challenge2 = ["None"];
	if (getTotalPerkResource(true) >= 30) challenge2.push("Discipline");
	if (highestZone >= 25) challenge2.push("Metal");
	if (highestZone >= 35) challenge2.push("Size");
	if (highestZone >= 40) challenge2.push("Balance");
	if (highestZone >= 45) challenge2.push("Meditate");
	if (highestZone >= 60) challenge2.push("Trimp");
	if (highestZone >= 70) challenge2.push("Trapper");
	if (game.global.prisonClear >= 1) challenge2.push("Electricity");
	if (highestZone >= 120) challenge2.push("Coordinate");
	if (highestZone >= 130) challenge2.push("Slow");
	if (highestZone >= 145) challenge2.push("Nom");
	if (highestZone >= 150) challenge2.push("Mapology");
	if (highestZone >= 165) challenge2.push("Toxicity");
	if (highestZone >= 180) challenge2.push("Watch");
	if (highestZone >= 180) challenge2.push("Lead");
	if (highestZone >= 425) challenge2.push("Obliterated");
	if (game.global.totalSquaredReward >= 4500) challenge2.push("Eradicated");

	if (document.getElementById('heliumC2Challenge').children.length !== challenge2.length) {
		document.getElementById('heliumC2Challenge').innerHTML = '';
		document.getElementById('dailyC2Challenge').innerHTML = '';
		for (var item in challenge2) {
			var option = document.createElement("option");
			option.value = challenge2[item];
			option.text = challenge2[item];
			document.getElementById('heliumC2Challenge').appendChild(option);
		}

		document.getElementById('dailyC2Challenge').innerHTML = document.getElementById('heliumC2Challenge').innerHTML;
	}
}

function radonChallengesSetting(hzeCheck, forceUpdate) {
	var radonHZE = game.global.highestRadonLevelCleared + 1;
	var radonChallenges = ["Off", "Radon Per Hour"];
	if (radonHZE >= 40) radonChallenges.push("Bublé");
	if (radonHZE >= 55) radonChallenges.push("Melt");
	if (radonHZE >= 70) radonChallenges.push("Quagmire");
	if (radonHZE >= 85) radonChallenges.push("Quest");
	if (radonHZE >= 90) radonChallenges.push("Archaeology");
	if (radonHZE >= 100) radonChallenges.push("Mayhem");
	if (radonHZE >= 110) radonChallenges.push("Insanity");
	if (radonHZE >= 135) radonChallenges.push("Nurture");
	if (radonHZE >= 150) radonChallenges.push("Pandemonium");
	if (radonHZE >= 155) radonChallenges.push("Alchemy");
	if (radonHZE >= 175) radonChallenges.push("Hypothermia");
	if (radonHZE >= 200) radonChallenges.push('Desolation');
	radonChallenges.push("Custom");
	if (radonHZE >= 50) radonChallenges.push("Challenge 3");

	if (document.getElementById('autoPortal').children.length !== radonChallenges.length || forceUpdate) {
		document.getElementById('autoPortal').innerHTML = '';
		for (var item in radonChallenges) {
			var option = document.createElement("option");
			option.value = radonChallenges[item];
			option.text = radonChallenges[item];
			document.getElementById('autoPortal').appendChild(option);
		}
	}

	var radonHourChallenges = ["None"];
	if (radonHZE >= 40) radonHourChallenges.push("Bublé");
	if (radonHZE >= 55) radonHourChallenges.push("Melt");
	if (radonHZE >= 70) radonHourChallenges.push("Quagmire");
	if (radonHZE >= 85) radonHourChallenges.push("Quest");
	if (radonHZE >= 90) radonHourChallenges.push("Archaeology");
	if (radonHZE >= 110) radonHourChallenges.push("Insanity");
	if (radonHZE >= 135) radonHourChallenges.push("Nurture");
	if (radonHZE >= 155) radonHourChallenges.push("Alchemy");
	if (radonHZE >= 175) radonHourChallenges.push("Hypothermia");
	if (radonHZE >= 200) radonHourChallenges.push("Desolation");

	if (
		((document.getElementById('heliumHourChallenge').children.length || document.getElementById('heliumHourChallenge').children.length)
			< radonHourChallenges.length) || forceUpdate) {
		document.getElementById('heliumHourChallenge').innerHTML = '';

		for (var item in radonHourChallenges) {
			var option = document.createElement("option");
			option.value = radonHourChallenges[item];
			option.text = radonHourChallenges[item];
			document.getElementById('heliumHourChallenge').appendChild(option);
		}
		document.getElementById('dailyHeliumHourChallenge').innerHTML = document.getElementById('heliumHourChallenge').innerHTML;

		if (radonHZE >= 50) {
			var option = document.createElement("option");
			option.value = 'Challenge 3';
			option.text = 'Challenge 3';
			document.getElementById('dailyHeliumHourChallenge').appendChild(option);
		}
	}

	var radonChallenge3 = ["None"];
	if (radonHZE >= 15) radonChallenge3.push("Unlucky");
	if (radonHZE >= 20) radonChallenge3.push("Downsize");
	if (radonHZE >= 25) radonChallenge3.push("Transmute");
	if (radonHZE >= 35) radonChallenge3.push("Unbalance");
	if (radonHZE >= 45) radonChallenge3.push("Duel");
	if (radonHZE >= 60) radonChallenge3.push("Trappapalooza");
	if (radonHZE >= 70) radonChallenge3.push("Wither");
	if (radonHZE >= 85) radonChallenge3.push("Quest");
	if (radonHZE >= 105) radonChallenge3.push("Storm");
	if (radonHZE >= 115) radonChallenge3.push("Berserk");
	if (radonHZE >= 175) radonChallenge3.push("Glass");
	if (radonHZE >= 201) radonChallenge3.push("Smithless");

	if (
		((document.getElementById('heliumC2Challenge').children.length || document.getElementById('dailyC2Challenge').children.length)
			< radonChallenge3.length) || forceUpdate) {
		document.getElementById('heliumC2Challenge').innerHTML = '';
		for (var item in radonChallenge3) {
			var option = document.createElement("option");
			option.value = radonChallenge3[item];
			option.text = radonChallenge3[item];
			document.getElementById('heliumC2Challenge').appendChild(option);
		}
		document.getElementById('dailyC2Challenge').innerHTML = document.getElementById('heliumC2Challenge').innerHTML;
	}
	if (hzeCheck) {
		//if (radonHZE === 15) debug("You have unlocked the Unlucky challenge.")
		if (radonHZE === 5) debug("You can now use the Smithy Farm setting. This can be found in the AT 'Maps' tab.")
		if (radonHZE === 25) debug("You have unlocked the Transmute challenge. Any metal related settings will be converted to food instead while running this challenge.")
		if (radonHZE === 30) debug("You can now access the Daily tab within the AT settings. Here you will find a variety of settings that will help optimise your dailies.")
		if (radonHZE === 35) debug("You have unlocked the Unbalance challenge. There's setting for it in the AT 'C3' tab.")
		if (radonHZE === 40) debug("You have unlocked the Bublé challenge. It has now been added to AutoPortal setting.")
		//if (radonHZE === 45) debug("Duel");
		if (radonHZE === 50) debug("You can now use the Worshipper Farm setting. This can be found in the AT 'Maps' tab.")
		if (radonHZE === 50) debug("You can now access the C3 tab within the AT settings. Here you will find a variety of settings that will help optimise your C3 runs.")
		if (radonHZE === 50) debug("Due to unlocking Challenge 3's there is now a Challenge 3 option under AutoPortal to be able to auto portal into them.");
		if (radonHZE === 50) debug("You have unlocked the Melt challenge. It has now been added to AutoPortal setting.")
		if (radonHZE === 60) debug("You have unlocked the Trappapalooza challenge. It has now been added to Challenge 3 AutoPortal settings & there's a setting for it in the AT 'C3' tab.")
		if (radonHZE === 70) debug("You have unlocked the Quagmire challenge. It has now been added to AutoPortal setting & there are settings for it in the AT 'Challenges' tab.")
		if (radonHZE === 70) debug("You have unlocked the Wither challenge. It has now been added to Challenge 3 AutoPortal settings & any map level settings with the exception of Map Bonus will make the highest level map you run -1 to not obtain additional stacks.")
		if (radonHZE === 85) debug("You have unlocked the Quest challenge. It has now been added to Challenge 3 AutoPortal settings & AT will automatically complete Quests if AutoMaps is enabled during this challenge.")
		if (radonHZE === 90) debug("You have unlocked the Archaeology challenge. It has now been added to AutoPortal setting & there are settings for it in the AT 'Challenges' tab.")
		if (radonHZE === 100) debug("You have unlocked the Mayhem challenge. It has now been added to AutoPortal setting & there's setting for it in the AT 'C3' tab.")
		if (radonHZE === 105) debug("You have unlocked the Storm challenge. It has now been added to Challenge 3 AutoPortal setting & there's setting for it in the AT 'C3' tab.")
		if (radonHZE === 110) debug("You have unlocked the Insanity challenge. It has now been added to AutoPortal setting & there are settings for it in the AT 'Challenges' tab.")
		if (radonHZE === 115) debug("You have unlocked the Berserk challenge. It has now been added to Challenge 3 AutoPortal setting.")
		if (radonHZE === 135) debug("You have unlocked the Nurture challenge. It has now been added to AutoPortal setting & there is a setting for Laboratory's that has been added to AT's AutoStructure setting.")
		if (radonHZE === 150) debug("You have unlocked the Pandemonium challenge. It has now been added to AutoPortal setting & there's setting for it in the AT 'C3' tab.")
		if (radonHZE === 155) debug("You have unlocked the Alchemy challenge. It has now been added to AutoPortal setting & there are settings for it in the AT 'Challenges' tab.")
		if (radonHZE === 175) debug("You have unlocked the Hypothermia challenge. It has now been added to AutoPortal setting & there are settings for it in the AT 'Challenges' tab.")
		if (radonHZE === 175) debug("You have unlocked the Glass challenge. It has now been added to Challenge 3 AutoPortal setting.")
	}
}

function autoSetValueToolTip(id, text, negative, multi) {
	ranstring = text;
	var value = 'value'
	if (autoTrimpSettings.radonsettings.value === 1) value += 'U2';
	var elem = document.getElementById("tooltipDiv");
	var tooltipText = 'Type a number below. You can also use shorthand such as 2e5 or 200k.';
	if (negative)
		tooltipText += ' Accepts negative numbers as validated inputs.';
	else
		tooltipText += ' Put -1 for Infinite.';
	tooltipText += `<br/><br/><input id="customNumberBox" style="width: 100%" onkeypress="onKeyPressSetting(event, '${id}', ${negative}, ${multi})" value="${autoTrimpSettings[id][value]}"></input>`;
	var costText = '<div class="maxCenter"><div class="btn btn-info" onclick="autoSetValue(\'' + id + '\',' + negative + ',' + multi + ')">Apply</div><div class="btn btn-info" onclick="cancelTooltip()">Cancel</div></div>';
	game.global.lockTooltip = true;
	elem.style.left = '32.5%';
	elem.style.top = '25%';
	document.getElementById('tipTitle').innerHTML = ranstring + ':  Value Input';
	document.getElementById('tipText').innerHTML = tooltipText;
	document.getElementById('tipCost').innerHTML = costText;
	elem.style.display = 'block';
	var box = document.getElementById('customNumberBox');
	try {
		box.setSelectionRange(0, box.value.length);
	} catch (e) {
		box.select();
	}
	box.focus();
}

function autoSetTextToolTip(id, text) {
	ranstring = text;
	var elem = document.getElementById("tooltipDiv");
	var value = 'value'
	if (autoTrimpSettings.radonsettings.value === 1) value += 'U2';
	var tooltipText = 'Type your input below';
	tooltipText += `<br/><br/><input id="customTextBox" style="width: 100%" onkeypress="onKeyPressSetting(event, '${id}')" value="${autoTrimpSettings[id][value]}"></input>`;
	var costText = '<div class="maxCenter"><div class="btn btn-info" onclick="autoSetText(\'' + id + '\')">Apply</div><div class="btn btn-info" onclick="cancelTooltip()">Cancel</div></div>';
	game.global.lockTooltip = true;
	elem.style.left = '32.5%';
	elem.style.top = '25%';
	document.getElementById('tipTitle').innerHTML = ranstring + ':  Value Input';
	document.getElementById('tipText').innerHTML = tooltipText;
	document.getElementById('tipCost').innerHTML = costText;
	elem.style.display = 'block';
	var box = document.getElementById('customTextBox');
	try {
		box.setSelectionRange(0, box.value.length);
	} catch (e) {
		box.select();
	}
	box.focus();
}

function onKeyPressSetting(event, id, negative, multi) {
	if (event.which == 13 || event.keyCode == 13) {
		if (negative !== undefined && multi !== undefined)
			autoSetValue(id, negative, multi);
		else
			autoSetText(id);
	}
}

function parseNum(num) {
	if (num.split('e')[1]) {
		num = num.split('e');
		num = Math.floor(parseFloat(num[0]) * (Math.pow(10, parseInt(num[1]))));
	} else {
		var letters = num.replace(/[^a-z]/gi, '');
		var base = 0;
		if (letters.length) {
			var suffices = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Od', 'Nd', 'V', 'Uv', 'Dv', 'Tv', 'Qav', 'Qiv', 'Sxv', 'Spv', 'Ov', 'Nv', 'Tt'];
			for (var x = 0; x < suffices.length; x++) {
				if (suffices[x].toLowerCase() == letters) {
					base = x + 1;
					break;
				}
			}
			if (base) num = Math.round(parseFloat(num.split(letters)[0]) * Math.pow(1000, base));
		}
		if (!base) num = parseFloat(num);
	}
	return num;
}

function autoSetValue(id, negative, multi) {
	var value = 'value'
	if (autoTrimpSettings.radonsettings.value === 1) value += 'U2';
	var num = 0;
	unlockTooltip();
	tooltip('hide');
	var numBox = document.getElementById('customNumberBox');
	if (numBox) {
		num = numBox.value.toLowerCase();
		if (multi) {
			num = num.split(',').map(parseNum);
		} else {
			num = parseNum(num);
		}
	} else return;
	autoTrimpSettings[id][value] = num;
	if (Array.isArray(num)) {
		// In here
		document.getElementById(id).innerHTML = ranstring + ': ' + num[0] + '+';
	}
	else if (num > -1 || negative)
		document.getElementById(id).innerHTML = ranstring + ': ' + prettify(num);
	else
		document.getElementById(id).innerHTML = ranstring + ': ' + "<span class='icomoon icon-infinity'></span>";
	updateCustomButtons();
	saveSettings();
}

function autoSetText(id) {
	var textVal = 'empty';
	var value = 'value'
	if (autoTrimpSettings.radonsettings.value === 1) value += 'U2';
	unlockTooltip();
	tooltip('hide');
	var textBox = document.getElementById('customTextBox');
	if (textBox) {
		textVal = textBox.value
	} else return;
	autoTrimpSettings[id][value] = textVal;
	if (textVal != undefined) {
		document.getElementById(id).innerHTML = ranstring + ': ' + textVal;
	}
	updateCustomButtons();
	saveSettings();
}

function autoToggle(what) {
	if (what) {
		var $what = document.getElementById(what);
		if ($what.style.display === 'block') {
			$what.style.display = 'none';
			document.getElementById(what + 'BTN').style.border = '';
		} else {
			$what.style.display = 'block';
			document.getElementById(what + 'BTN').style.border = '4px solid green';
		}
	} else {
		if (game.options.displayed)
			toggleSettingsMenu();
		var $item = document.getElementById('graphParent');
		if ($item.style.display === 'block')
			$item.style.display = 'none';
		var $item = document.getElementById('autoTrimpsTabBarMenu');
		if ($item.style.display === 'block')
			$item.style.display = 'none';
		else $item.style.display = 'block';
		var $item = document.getElementById('autoSettings');
		if ($item.style.display === 'block')
			$item.style.display = 'none';
		else $item.style.display = 'block';
	}
	updateCustomButtons();
}

function autoPlusSettingsMenu() {
	var $item = document.getElementById('autoSettings');
	if ($item.style.display === 'block')
		$item.style.display = 'none';
	var $item = document.getElementById('graphParent');
	if ($item.style.display === 'block')
		$item.style.display = 'none';
	var $item = document.getElementById('autoTrimpsTabBarMenu');
	if ($item.style.display === 'block')
		$item.style.display = 'none';
	toggleSettingsMenu();
}

function toggleElem(elem, showHide) {
	var $item = document.getElementById(elem);
	if ($item == null) return;
	var state = showHide ? '' : 'none';
	var stateParent = showHide ? 'inline-block' : 'none';
	if ($item.style.display !== state)
		$item.style.display = state;
	if ($item.parentNode.style.display !== stateParent)
		$item.parentNode.style.display = stateParent;

	var settingToCheck = autoTrimpSettings[elem];

	if (settingToCheck !== undefined)
		if (settingToCheck.type === 'dropdown') {
			var selected = 'selected';
			if (currSettingUniverse === 2) selected += 'U2';
			if (document.getElementById(elem).value !== settingToCheck[selected]) {
				document.getElementById(elem).value = settingToCheck[selected];
			}
		}
}

function turnOff(elem) {
	toggleElem(elem, false);
}

function turnOn(elem) {
	if (typeof autoTrimpSettings[elem] !== 'undefined' && typeof (autoTrimpSettings[elem].require) !== 'undefined') {
		if (getPageSetting('displayAllSettings', currSettingUniverse) || autoTrimpSettings[elem].require()) {
			toggleElem(elem, true);
		}
		else
			toggleElem(elem, false);
	}

	else toggleElem(elem, true);
}

function updateCustomButtons(initialLoad) {
	if (typeof lastTheme !== 'undefined' && lastTheme && game.options.menu.darkTheme.enabled != lastTheme) {
		if (typeof MODULES["graphs"] !== 'undefined')
			MODULES["graphs"].themeChanged();
		debug("Theme change - AutoTrimps styles updated.");
	}
	lastTheme = game.options.menu.darkTheme.enabled;

	var highestZone = game.global.highestRadonLevelCleared;

	//Hide settings
	//Radon
	var radonon = autoTrimpSettings.radonsettings.value == 1;
	var legacysettings = autoTrimpSettings.radonsettings.value == 2;
	currSettingUniverse = (autoTrimpSettings.radonsettings.value + 1);
	var displayAllSettings = getPageSetting('displayAllSettings', currSettingUniverse);
	//Update portal challenges
	if (radonon) radonChallengesSetting(false, true);
	else heliumChallengesSetting();

	//Swapping name and description of C2 tab when Radon is toggled on.
	if (radonon) {
		if (document.getElementById("C2").children[0].children[0].innerHTML !== 'C3 - Settings for C3s and special challenges (Mayhem, Pandemonium)') document.getElementById("C2").children[0].children[0].innerHTML = 'C3 - Settings for C3s and special challenges (Mayhem, Pandemonium)';
		if (document.getElementById("tabC2").children[0].innerHTML !== 'C3') document.getElementById("tabC2").children[0].innerHTML = 'C3';
	}
	else {
		if (document.getElementById("C2").children[0].children[0].innerHTML !== 'Settings for C2s') document.getElementById("C2").children[0].children[0].innerHTML = 'Settings for C2s';
		if (document.getElementById("tabC2").children[0].innerHTML !== 'C2') document.getElementById("tabC2").children[0].innerHTML = 'C2';
	}
	//Tabs
	if (document.getElementById("tabBuildings") != null) {
		document.getElementById("tabBuildings").style.display = radonon ? "none" : "";
	}
	if (document.getElementById("tabJobs") != null) {
		document.getElementById("tabJobs").style.display = radonon ? "none" : !radonon ? "none" : "";
	}
	if (document.getElementById("tabDaily") != null) {
		document.getElementById("tabDaily").style.display = radonon && (!displayAllSettings && highestZone < 29) ? "none" : "";
	}
	if (document.getElementById("tabSpire") != null) {
		document.getElementById("tabSpire").style.display = radonon ? "none" : "";
	}
	if (document.getElementById("tabWindstacking") != null) {
		document.getElementById("tabWindstacking").style.display = radonon ? "none" : "";
	}
	if (document.getElementById("tabATGA") != null) {
		document.getElementById("tabATGA").style.display = radonon ? "none" : "";
	}
	if (document.getElementById("tabScryer") != null) {
		document.getElementById("tabScryer").style.display = radonon ? "none" : "none";
	}
	if (document.getElementById("tabMagma") != null) {
		document.getElementById("tabMagma").style.display = radonon ? "none" : "";
	}
	if (document.getElementById("tabNature") != null) {
		document.getElementById("tabNature").style.display = radonon ? "none" : "";
	}
	if (document.getElementById("tabChallenges") != null) {
		document.getElementById("tabChallenges").style.display = !radonon ? "" : "";
	}
	if (document.getElementById("tabLegacy") != null) {
		document.getElementById("tabLegacy").style.display = !legacysettings ? "none" : "";
	}

	for (setting in autoTrimpSettings) {
		var item = autoTrimpSettings[setting];
		if (item === null || typeof item.id === 'undefined') continue;
		const settingUniverse = item.universe;
		if (!Array.isArray(settingUniverse)) continue;
		if (item.type === 'mazDefaultArray') {
			turnOff(setting);
		} else if (settingUniverse.indexOf(currSettingUniverse) !== -1) {
			turnOn(setting, radonon);
		} else {
			turnOff(setting)
		};

		//Skips items not from the universe settings we're looking at. Has to be here so that they're disabled when swapping universe settings.
		if (settingUniverse.indexOf(currSettingUniverse) === -1)
			continue;

		if (initialLoad) {
			var elem = document.getElementById(item.id);

			if (item.type === 'boolean') {
				itemEnabled = item.enabled;
				if (radonon && item.id !== 'portalVoidIncrement' && item.id !== 'PauseScript') itemEnabled = item['enabled' + 'U2'];
				elem.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + itemEnabled);
				elem.setAttribute("onmouseover", 'tooltip(\"' + item.name() + '\", \"customText\", event, \"' + item.description() + '\")');

				elem.innerHTML = item.name();
			}
			else if (item.type == 'value' || item.type == 'valueNegative' || item.type == 'multitoggle' || item.type == 'multiValue' || item.type == 'textValue') {
				itemValue = item.value;
				if (radonon && item.id !== 'radonsettings') itemValue = item['value' + 'U2'];
				if (elem != null) {
					if (item.type == 'multitoggle') {
						elem.innerHTML = item.name()[itemValue];
						elem.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + itemValue);
					}
					else if (item.type == 'multiValue') {
						if (Array.isArray(itemValue) && itemValue.length == 1 && itemValue[0] == -1)
							elem.innerHTML = item.name() + ': ' + "<span class='icomoon icon-infinity'></span>";
						else if (Array.isArray(itemValue))
							elem.innerHTML = item.name() + ': ' + itemValue[0] + '+';
						else
							elem.innerHTML = item.name() + ': ' + itemValue;
					}
					else if (item.type == 'textValue' && typeof itemValue !== 'undefined' && itemValue.substring !== undefined) {
						if (itemValue.length > 18)
							elem.innerHTML = item.name() + ': ' + itemValue.substring(0, 21) + '...';
						else
							elem.innerHTML = item.name() + ': ' + itemValue.substring(0, 21);
					}
					else if (itemValue > -1 || item.type == 'valueNegative') {
						elem.innerHTML = item.name() + ': ' + prettify(itemValue);
					}
					else
						elem.innerHTML = item.name() + ': ' + "<span class='icomoon icon-infinity'></span>";
				}
			}
			else if (item.type !== 'dropdown') {
				elem.innerHTML = item.name();
			}

			if (item.type === 'multitoggle') {
				elem.setAttribute("onmouseover", 'tooltip(\"' + item.name().join(' / ') + '\", \"customText\", event, \"' + item.description() + '\")');
			}
			else {
				elem.setAttribute("onmouseover", 'tooltip(\"' + item.name() + '\", \"customText\", event, \"' + item.description() + '\")');
			}
		}
	}

	document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + getPageSetting('autoMaps'));

	if (document.getElementById('Prestige').selectedIndex > 11 && !game.global.slowDone) {
		document.getElementById('Prestige').selectedIndex = 11;
		autoTrimpSettings.Prestige.selected = "Bestplate";
	}
}

function settingUniverse(setting) {
	if (setting === 'buyBuildings') {
		return getPageSetting('buildingsType');
	}
	if (setting === 'equipOn') {
		return getPageSetting('equipOn');
	}
	if (setting === 'autoJobs') {
		return getPageSetting('jobType');
	}
}

function setupATButtons() {
	//AutoJobs

	//Changing Default Widths for Job buttons
	document.getElementById('fireBtn').parentElement.style.width = '14.2%'
	document.getElementById('fireBtn').parentElement.style.paddingRight = '2px'
	document.getElementById('jobsTitleSpan').parentElement.style.width = '10%'

	//AutoJobs button.
	//Creating button
	var jobSetting = getPageSetting('jobType')
	var atJobInitial = document.createElement("DIV");
	atJobInitial.setAttribute("class", "col-xs-3 lowPad");
	var atJobContainer = document.createElement("DIV");
	atJobContainer.setAttribute("style", "display: block; font-size: 0.9vw; border-color: #5D5D5D;");
	atJobContainer.setAttribute('class', 'toggleConfigBtn pointer noselect autoUpgradeBtn settingBtn' + (jobSetting === 2 ? 3 : jobSetting));
	atJobContainer.setAttribute("onmouseover", 'tooltip(\"Toggle AutoJobs\", \"customText\", event, \"Toggle between the AutoJob settings.\")');
	atJobContainer.setAttribute("onmouseout", 'tooltip("hide")');

	//Text
	var atJobText = document.createElement("DIV");
	atJobText.innerHTML = autoTrimpSettings.jobType.name()[jobSetting];
	atJobText.setAttribute("id", "autoJobLabel");
	atJobText.setAttribute("onClick", "settingChanged('jobType', true)");

	//Creating cogwheel & linking onclick
	var atJobSettings = document.createElement("DIV");
	atJobSettings.setAttribute('onclick', 'MAZLookalike("AT AutoJobs", "a", "AutoJobs")');
	var atJobSettingsButton = document.createElement("SPAN");
	atJobSettingsButton.setAttribute('class', 'glyphicon glyphicon-cog');

	var atJobColumn = document.getElementById("jobsTitleDiv").children[0];
	atJobContainer.appendChild(atJobText);
	atJobContainer.appendChild(atJobSettings);
	atJobSettings.appendChild(atJobSettingsButton);
	atJobInitial.appendChild(atJobContainer);
	atJobColumn.insertBefore(atJobInitial, document.getElementById('jobsTitleDiv').children[0].children[2]);

	//AutoStructure Button.
	//Creating button
	var atStructureInitial = document.createElement("DIV");
	atStructureInitial.setAttribute("class", "col-xs-3 lowPad");
	var atStructureContainer = document.createElement("DIV");
	atStructureContainer.setAttribute("style", "display: block; font-size: 0.9vw; border-color: #5D5D5D;");
	atStructureContainer.setAttribute('class', 'toggleConfigBtn pointer noselect autoUpgradeBtn settingBtn' + settingUniverse('buyBuildings'));
	atStructureContainer.setAttribute("onmouseover", 'tooltip(\"Toggle AutoStructure\", \"customText\", event, \"Toggle between the AutoStructure settings.\")');
	atStructureContainer.setAttribute("onmouseout", 'tooltip("hide")');

	//Text
	var atStructureText = document.createElement("DIV");
	atStructureText.innerHTML = 'AT AutoStructure';
	atStructureText.setAttribute("id", "autoStructureLabel");
	atStructureText.setAttribute("onClick", "settingChanged('buildingsType', true)");

	//Creating cogwheel & linking onclick
	var atStructureSettings = document.createElement("DIV");
	atStructureSettings.setAttribute('onclick', 'MAZLookalike("AT AutoStructure", "a", "AutoStructure")');
	var atStructureSettingsButton = document.createElement("SPAN");
	atStructureSettingsButton.setAttribute('class', 'glyphicon glyphicon-cog');

	//Setting up positioning
	var atStructureColumn = document.getElementById("buildingsTitleDiv").children[0];
	atStructureContainer.appendChild(atStructureText);
	atStructureContainer.appendChild(atStructureSettings);
	atStructureSettings.appendChild(atStructureSettingsButton);
	atStructureInitial.appendChild(atStructureContainer);
	atStructureColumn.replaceChild(atStructureInitial, document.getElementById('buildingsTitleDiv').children[0].children[1]);

	//AutoEquip Button
	//Creating button
	var atEquipInitial = document.createElement("DIV");
	atEquipInitial.setAttribute("class", "col-xs-3 lowPad");
	var atEquipContainer = document.createElement("DIV");
	atEquipContainer.setAttribute("style", "display: block; font-size: 0.9vw;");
	atEquipContainer.setAttribute('class', 'pointer noselect autoUpgradeBtn settingBtn' + settingUniverse('equipOn'));
	atEquipContainer.setAttribute("onmouseover", 'tooltip(\"Toggle atEquip\", \"customText\", event, \"Toggle between the atEquip settings.\")');
	atEquipContainer.setAttribute("onmouseout", 'tooltip("hide")');

	//Text
	var atEquipText = document.createElement("DIV");
	atEquipText.innerHTML = 'AT AutoEquip';
	atEquipText.setAttribute("id", "autoEquipLabel");
	atEquipText.setAttribute("onClick", "settingChanged('equipOn', true)");

	//Setting up positioning
	var atEquipColumn = document.getElementById("equipmentTitleDiv").children[0];
	atEquipContainer.appendChild(atEquipText);
	atEquipInitial.appendChild(atEquipContainer);
	atEquipColumn.replaceChild(atEquipInitial, document.getElementById('equipmentTitleDiv').children[0].children[2]);

	//autoTrimps Button.
	//Creating button
	var atBtnContainer = document.createElement("DIV");
	atBtnContainer.setAttribute('class', 'btn-group');
	atBtnContainer.setAttribute('role', 'group');
	atBtnContainer.setAttribute("onmouseover", 'tooltip(\"Toggle AutoTrimps Messages\", \"customText\", event, \"Will enable/disable the AutoTrimps messages that you have enabled from appearing in the log window.\")');
	atBtnContainer.setAttribute("onmouseout", 'tooltip("hide")');

	//Text
	var atBtnText = document.createElement("button");
	atBtnText.innerHTML = 'AT Messages';
	atBtnText.setAttribute("id", "AutoTrimpsFilter");
	atBtnText.setAttribute('type', 'button');
	atBtnText.setAttribute("onClick", "filterMessage2(\'AutoTrimps\')");
	atBtnText.setAttribute('class', 'btn btn-success logFlt');
	//Setting up positioning
	atBtnContainer.appendChild(atBtnText);
	document.getElementById('logBtnGroup').appendChild(atBtnContainer);

	//Creating cogwheel & linking onclick
	var atBtnSettings = document.createElement("button");
	atBtnSettings.setAttribute("id", "logConfigBtn");
	atBtnSettings.setAttribute('type', 'button');
	atBtnSettings.setAttribute('onclick', 'MAZLookalike("Message Config", "a", "MessageConfig")');
	atBtnSettings.setAttribute('class', 'btn btn-default logFlt');
	var atBtnSettingsButton = document.createElement("SPAN");
	atBtnSettingsButton.setAttribute('class', 'glyphicon glyphicon-cog');
	atBtnSettings.appendChild(atBtnSettingsButton);
	var tab = document.createElement('DIV');
	tab.setAttribute("id", "logConfigHolder"),
		tab.setAttribute('class', 'btn-group'),
		tab.setAttribute('role', 'group'),
		tab.appendChild(atBtnSettings),
		document.getElementById('logBtnGroup').appendChild(tab);

}

function getDailyHeHrStats() {
	const resourceHr = game.global.universe === 2 ? 'Rn' : 'He';
	var a = ""; if (challengeActive('Daily')) { var b = game.stats.heliumHour.value() / (game.global.totalHeliumEarned - (game.global.heliumLeftover + game.resources.helium.owned)); b *= 100 + getDailyHeliumValue(countDailyWeight()), a = "<b>After Daily '" + resourceHr + "\/Hr: " + b.toFixed(3) + "%" } return a
}

function toggleAutoMaps() {

	if (getPageSetting('autoMaps'))
		setPageSetting('autoMaps', 0)
	else
		setPageSetting('autoMaps', 1)

	document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + getPageSetting('autoMaps'));

	saveSettings();
}

function toggleStatus(update) {

	if (update) {
		if (getPageSetting('displayAutoMapStatus')) {
			document.getElementById('autoMapStatus').parentNode.style = 'display: block; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
			document.getElementById('autoMapStatus').parentNode.setAttribute("onmouseover", 'tooltip(\"Health to Damage ratio\", \"customText\", event, \"This status box displays the current mode Automaps is in. The number usually shown here during Farming or Want more Damage modes is the \'HDratio\' meaning EnemyHealth to YourDamage Ratio (in X stance). Above 16 will trigger farming, above 4 will trigger going for Map bonus up to 10 stacks.\
			<p>\<br>\<b>World H:D Ratio = </b>\" + prettify(HDRatio)  + \"<br>\
			<b>Map H:D Ratio = </b>\" + prettify(mapHDRatio) + \"<br>\
			<b>Void H:D Ratio = </b>\" + prettify(voidHDRatio) + \"<br>\
			")');
		} else
			document.getElementById('autoMapStatus').parentNode.style = 'display: none; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
		return
	}

	if (getPageSetting('displayAutoMapStatus', currSettingUniverse)) {
		setPageSetting('displayAutoMapStatus', 0, currSettingUniverse);
		if (game.global.universe === currSettingUniverse) {
			turnOff('autoMapStatus')
			document.getElementById('autoMapStatus').parentNode.style = 'display: none; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
		}
	}
	else {
		setPageSetting('displayAutoMapStatus', 1, currSettingUniverse);
		if (game.global.universe === currSettingUniverse) {
			turnOn('autoMapStatus', true)
			document.getElementById('autoMapStatus').parentNode.style = 'display: block; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
		}
	}
	saveSettings();
}

function toggleHeHr(update) {
	const resource = game.global.universe === 2 ? 'Radon' : 'Helium';
	const resourceHr = game.global.universe === 2 ? 'Rn' : 'He';
	if (update) {
		if (getPageSetting('displayHeHr')) {
			document.getElementById('hiderStatus').parentNode.style = 'display: block; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
			document.getElementById('hiderStatus').parentNode.setAttribute("onmouseover", 'tooltip(\
				"' + resource + '\/Hr Info\", \"customText\", event, \"1st is Current ' + resourceHr + '\//hr % out of Lifetime ' + resourceHr + '\/(not including current+unspent).<br> 0.5% is an ideal peak target. This can tell you when to portal... <br>2nd is Current run Total ' + resourceHr + '\/ earned / Lifetime ' + resourceHr + '\/(not including current)<br>\" + getDailyHeHrStats())');
		} else
			document.getElementById('hiderStatus').parentNode.style = 'display: none; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
		return
	}
	if (getPageSetting('displayHeHr')) {
		setPageSetting('displayHeHr', 0);
		if (game.global.universe == 1) {
			turnOff('hiderStatus')
			document.getElementById('hiderStatus').parentNode.style = 'display: none; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
		}
	}
	else {
		setPageSetting('displayHeHr', 1);
		if (game.global.universe == 1) {
			turnOn('hiderStatus');
			document.getElementById('hiderStatus').parentNode.style = 'display: block; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
			document.getElementById('hiderStatus').parentNode.setAttribute("onmouseover", 'tooltip(\"' + resource + '\/Hr Info\", \"customText\", event, \"1st is Current "' + resourceHr + '\/hr % out of Lifetime "' + resourceHr + '\(not including current+unspent).<br> 0.5% is an ideal peak target. This can tell you when to portal... <br>2nd is Current run Total "' + resourceHr + '\ earned / Lifetime "' + resourceHr + '\(not including current)<br>\" + getDailyHeHrStats())');
		}
	}
	saveSettings();
}

function updateATVersion() {
	//Setting Conversion!
	if (autoTrimpSettings["ATversion"] !== undefined && autoTrimpSettings["ATversion"].includes('SadAugust') && autoTrimpSettings["ATversion"] === ATversion) return;

	if (autoTrimpSettings["ATversion"] === undefined || !autoTrimpSettings["ATversion"].includes('SadAugust')) {
		var changelog = [];
		changelog.push('Welcome to SadAugust fork! <br><br>\
		I highly recommend you check the <a target="#" href="https://github.com/SadAugust/AutoTrimps_Local/commits/gh-pages" target="#">list of changes from Zeks fork</a> (if you haven\'t already).<br><br>\
		If you\'re unsure on what a setting does then I highly recommend checking the "Help" toggle on the popups that have been introduced as it should explain almost everything!<br><br>\
		You\'ll need to redo all of your farming settings as everything is drastically different :(')
		printChangelog(changelog);
	}

	if (autoTrimpSettings["ATversion"] !== undefined && autoTrimpSettings["ATversion"].includes('SadAugust')
		&& autoTrimpSettings["ATversion"] !== ATversion
	) {

		var changelog = [];

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.001') {
			var settings_List = ['raidingSettings', 'bionicRaidingSettings']
			var values = ['value', 'valueU2'];
			for (var x = 0; x < settings_List.length; x++) {
				for (var z = 0; z < values.length; z++) {
					if (typeof (autoTrimpSettings[settings_List[x]][values[z]][0]) !== 'undefined') {
						for (var y = 0; y < autoTrimpSettings[settings_List[x]][values[z]].length; y++) {
							autoTrimpSettings[settings_List[x]][values[z]][y].endzone = 999;
						}
					}
					saveSettings();
				}
			}
			saveSettings();
			changelog.push("Prestige Raiding & Bionic Raiding now have an added option for end zone so you can choose when to stop running specific lines.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.002') {
			changelog.push("Have added a Priority input for every farming setting to allow you to properly allow certain lines to run before others without having to save the window multiple times to make it work.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.003') {
			changelog.push("With Antennas/Meteorologists increasing wood gain in 5.9.0 I've added a job ratio input for the HD Farm setting to allow for more user control of equip farming. Was previously Set to '0,0,1' if you want to use the same setting as before.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.1') {
			changelog.push("Surky has now been implemented for U2. Enable Auto Allocate and it'll respec perks just like Perky currently does for U1, make sure to set the inputs up properly or you'll get odd respecs.<br>\
			As usual, report any bugs and I'll aim to fix them ASAP. You will need to enable Auto Allocate again for both universes if you want to use them as the setting has been autoset to off after this implementation.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.1.1') {
			var tempSettings = JSON.parse(localStorage.getItem('autoTrimpSettings'));
			if (tempSettings.mapBonusDefaultSettings.value.healthHDRatio !== undefined)
				autoTrimpSettings['mapBonusRatio'].value = tempSettings.mapBonusDefaultSettings.value.healthHDRatio;
			if (tempSettings.mapBonusDefaultSettings.valueU2.healthHDRatio !== undefined)
				autoTrimpSettings['mapBonusRatio'].valueU2 = tempSettings.mapBonusDefaultSettings.valueU2.healthHDRatio
			if (tempSettings.mapBonusDefaultSettings.value.mapBonusStacks !== undefined)
				autoTrimpSettings['mapBonusStacks'].value = tempSettings.tempSettings.mapBonusDefaultSettings.value.healthBonus
			if (tempSettings.mapBonusDefaultSettings.valueU2.mapBonusStacks !== undefined)
				autoTrimpSettings['mapBonusStacks'].valueU2 = tempSettings.tempSettings.mapBonusDefaultSettings.valueU2.healthBonus
			if (tempSettings.autoPerks.value > 0) autoTrimpSettings['autoPerks'].enabled = true;
			else autoTrimpSettings['autoPerks'].enabled = false;
			if (tempSettings.autoPerks.valueU2 > 0) autoTrimpSettings['autoPerks'].enabledU2 = true;
			else autoTrimpSettings['autoPerks'].enabledU2 = false;
			changelog.push("Map Bonus HD related settings have been moved to 2 inputs in the Maps tab rather than in the Map Bonus setting.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.1.2') {
			changelog.push("Quest now has an additional setting for the max amount of maps you'd like to run while on Smithy quests.<br>\
			HD Farm now has an additional dropdown for targetting map levels. When using this feature it will cause AT to farm until auto level is at or above the designated level.<br>\
			Worshipper Farm has a new setting in default row to enable the ship skip map limit setting.<br>\
			There's a brand new setting in the 'Core' tab which when auto portaling (goes to U1 if not in it) uses liquification to ensure your next void map drop gives a bonus drop then portals into your actual run.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.1.3') {
			changelog.push("Added a new Mayhem setting which will run melting point at X smithies like the Panda & Deso settings.<br>\
			Added a new Pandemonium setting for HD Ratio destacking like Mayhem & Deso have. Equipment farming will also use this if the equip farm zone hasn't been setup or you're below that value.<br>\
			Surky now saves inputs when swapping between presets so you don't have to set them back up every time!")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.1.4') {
			changelog.push("The U2 Preset Swapping setting has been modified and it will adjust the Surky preset that is selected depending on the type of challenge that you're about to run.")
		}

		autoTrimpSettings["ATversion"] = ATversion;
		printChangelog(changelog);
		verticalCenterTooltip(false, true);
		saveSettings();
	}

	autoTrimpSettings["ATversion"] = ATversion;
	saveSettings();
}