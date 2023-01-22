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
	if (game.global.universe == 1)
		resourcePerHourContainer.setAttribute("onmouseover", 'tooltip(\"Helium/Hr Info\", \"customText\", event, \"1st is Current He/hr % out of Lifetime He(not including current+unspent).<br> 0.5% is an ideal peak target. This can tell you when to portal... <br>2nd is Current run Total He earned / Lifetime He(not including current)<br>\" + getDailyHeHrStats())');
	else if (game.global.universe == 2)
		resourcePerHourContainer.setAttribute("onmouseover", 'tooltip(\"Radon/Hr Info\", \"customText\", event, \"1st is Current Rn/hr % out of Lifetime Rn(not including current+unspent).<br> 0.5% is an ideal peak target. This can tell you when to portal... <br>2nd is Current run Total Rn earned / Lifetime Rn(not including current)<br>\" + getDailyRnHrStats())');
	resourcePerHourContainer.setAttribute("onmouseout", 'tooltip("hide")');
	var resourcePerHourButton = document.createElement("SPAN");
	resourcePerHourButton.id = 'hiderStatus';
	resourcePerHourContainer.appendChild(resourcePerHourButton);
	fightButtonCol.appendChild(resourcePerHourContainer);


	var voidMapContainer = document.createElement("DIV");
	voidMapContainer.setAttribute("style", "display: block; font-size: 0.9vw; text-align: centre; background-color: rgba(0, 0, 0, 0.3);");
	var voidMapText = document.createElement("SPAN");
	voidMapText.id = 'freeVoidMap';
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
	var radonChallenges = ["Off", "Radon Per Hour"];
	var radonHourChallenges = ["None"];
	var challenge3 = ["None"];

	//Core

	//Helium Core
	createSetting('ManualGather2', ['Manual Gather/Build', 'Auto Gather/Build', 'Mining/Building Only', 'Science Research OFF'], 'Controls what you gather/build do. Manual does nothing<br>Auto Gathering of Food,Wood,Metal(w/turkimp) & Science. Auto speed-Builds your build queue. <br>Mining/Building only does exactly what it says. Only use if you are passed the early stages of the game and have the mastery foremany unlocked (No longer need to trap, food and wood are useless). <br>You can disable science researching for the achievement: Reach Z120 without using manual research.', 'multitoggle', 1, null, 'Core', 1);
	createSetting('BuyUpgradesNew', ['Manual Upgrades', 'Buy All Upgrades', 'Upgrades no Coords'], 'Autobuys non-equipment upgrades (equipment is controlled in the Gear tab). The second option does NOT buy coordination (use this <b>ONLY</b> if you know what you\'re doing).', 'multitoggle', 1, null, 'Core', 1);
	createSetting('TrapTrimps', 'Trap Trimps', 'Automatically trap trimps when needed, including building traps. (when you turn this off, you may aswell turn off the in-game autotraps button, think of the starving trimps that could eat that food!)', 'boolean', true, null, 'Core', 1);
	createSetting('AutoAllocatePerks', ['Auto Allocate Off', 'Auto Allocate On', 'Dump into Looting II'], 'Uses a basic version of Perky (if you want more advanced settings import your save there). Dump into Looting II, all helium earned into this perk when auto portaling.', 'multitoggle', 0, null, 'Core', 1);
	createSetting('downloadSaves', 'Download Saves', 'Will automatically download saves whenever AutoTrimps portals.', 'boolean', false, null, 'Core', 1);
	createSetting('amalcoord', 'Amal Boost', 'Boost your Amal count for more Mi. Will not buy coords until your H:D ratio is below a certain value. This means that you will get amals quicker. Will not activate higher than your Amal Boost End Zone Setting! ', 'boolean', false, null, 'Core', 1);
	createSetting('amalcoordt', 'Amal Target', 'Set the amount of Amals you wish to aim for. Once this target is reached, it will buy coords below your Amal ratio regardless of your H:D, just enough to keep the Amal. -1 to disable and use H:D for entire boost. ', 'value', -1, null, 'Core', 1,
		function () { return (autoTrimpSettings.amalcoord.enabled) });
	createSetting('amalcoordhd', 'Amal Boost H:D', 'Set your H:D for Amal Boost here. The higher it is the less coords AT will buy. 0.0000025 is the default. ', 'value', 0.0000025, null, 'Core', 1,
		function () { return (autoTrimpSettings.amalcoord.enabled) });
	createSetting('amalcoordz', 'Amal Boost End Z', 'Amal Boost End Zone. Set the zone you want to stop Amal Boosting. -1 to do it infinitely. ', 'value', -1, null, 'Core', 1,
		function () { return (autoTrimpSettings.amalcoord.enabled) });

	//Radon Core
	createSetting('RManualGather2', ['Manual Gather/Build', 'Auto Gather/Build', 'Mining/Building Only'], 'Controls what you gather/build do. Manual does nothing<br>Auto Gathering of Food,Wood,Metal(w/turkimp) & Science. Auto speed-Builds your build queue. <br>Mining/Building only does exactly what it says. Only use if you are passed the early stages of the game and have the mastery foremany unlocked (No longer need to trap, food and wood are useless). ', 'multitoggle', 1, null, 'Core', 2);
	createSetting('RBuyUpgradesNew', ['Manual Upgrades', 'Buy All Upgrades', 'Upgrades no Coords'], 'Autobuys non-equipment upgrades (equipment is controlled in the Gear tab). The second option does NOT buy coordination (use this <b>ONLY</b> if you know what you\'re doing).', 'multitoggle', 1, null, 'Core', 2);
	createSetting('RTrapTrimps', 'Trap Trimps', 'Automatically trap trimps when needed, including building traps. (when you turn this off, you may aswell turn off the in-game autotraps button, think of the starving trimps that could eat that food!)', 'boolean', true, null, 'Core', 2);
	createSetting('RAutoAllocatePerks', ['Auto Allocate Off', 'Dump into Looting', 'Dump into Greed', 'Dump into Moti'], 'Dumps all excess radon into the selected perk when AutoPortaling.', 'multitoggle', 0, null, 'Core', 2);
	createSetting('RdownloadSaves', 'Download Saves', 'Will automatically download saves whenever AutoTrimps portals.', 'boolean', false, null, 'Core', 2);
	createSetting('RPerkSwapping', 'Preset Swapping', 'Will automatically load Preset 1 if portaling into a normal run, Preset 2 if portaling into a daily run or Preset 3 if portaling into a C3.<br>Be aware that you need to save your presets when making adjustments or it\'ll revert to the previous one you saved.', 'boolean', false, null, 'Core', 2);

	createSetting('AutoPortal', 'AutoPortal', 'Automatically portal. Will NOT auto-portal if you have a challenge active, the challenge setting dictates which challenge it will select for the next run. All challenge settings will portal right after the challenge ends, regardless. Helium Per Hour only <b>portals at cell 1</b> of the first level where your He/Hr went down even slightly compared to the current runs Best He/Hr. Take note, there is a Buffer option, which is like a grace percentage of how low it can dip without triggering. Setting a buffer will portal mid-zone if you exceed 5x of the buffer.  CAUTION: Selecting He/hr may immediately portal you if its lower-(use Pause AutoTrimps button to pause the script first to avoid this)', 'dropdown', 'Off', heliumChallenges, 'Core', 1,);

	createSetting('HeliumHourChallenge', 'Challenge', 'Automatically portal into this challenge when using helium per hour or custom autoportal. Custom portals after cell 100 of the zone specified. Do not choose a challenge if you havent unlocked it. ', 'dropdown', 'None', heliumHourChallenges, 'Core', 1,
		function () { return (autoTrimpSettings.AutoPortal.selected == 'Helium Per Hour' || autoTrimpSettings.AutoPortal.selected == 'Custom') });

	createSetting('HeliumC2Challenge', 'Challenge', 'Automatically portal into this challenge when using \'Challenge 2\' portal option on autoportal. Portals on the zone specified in \'Custom Portal\'. Must end the challenges with the \'Finish C2\' setting in the C2 tab if you want to run the challenge multiple times.', 'dropdown', 'None', challenge2, 'Core', 1,
		function () { return (autoTrimpSettings.AutoPortal.selected == 'Challenge 2') });
	createSetting('CustomAutoPortal', 'Custom Portal', 'Automatically portal at this zone. (ie: setting to 200 would portal when you reach zone 200)', 'value', '999', null, 'Core', 1,
		function () { return (autoTrimpSettings.AutoPortal.selected == 'Custom' || autoTrimpSettings.AutoPortal.selected == 'Challenge 2') });
	createSetting('HeHrDontPortalBefore', 'Don\'t Portal Before', 'Do NOT allow Helium per Hour AutoPortal setting to portal BEFORE this level is reached. It is an additional check that prevents drops in helium/hr from triggering autoportal. Set to 0 or -1 to completely disable this check. (only shows up with Helium per Hour set)', 'value', '999', null, 'Core', 1,
		function () { return (autoTrimpSettings.AutoPortal.selected == 'Helium Per Hour') });
	createSetting('HeliumHrBuffer', 'He/Hr Portal Buffer %', 'IMPORTANT SETTING. When using the He/Hr Autoportal, it will portal if your He/Hr drops by this amount of % lower than your best for current run, default is 0% (ie: set to 5 to portal at 95% of your best). Now with stuck protection - Allows portaling midzone if we exceed set buffer amount by 5x. (ie a normal 2% buffer setting would now portal mid-zone you fall below 10% buffer).', 'value', '0', null, 'Core', 1,
		function () { return (autoTrimpSettings.AutoPortal.selected == 'Helium Per Hour') });
	createSetting('HeliumHrPortal', ['Auto Portal Immediately', 'Portal after voids', 'Push Poison for voids'], 'Autobuys non-equipment upgrades (equipment is controlled in the Gear tab). The second option does NOT buy coordination (use this <b>ONLY</b> if you know what you\'re doing).', 'multitoggle', 1, null, 'Core', 1,
		function () { return (autoTrimpSettings.AutoPortal.selected == 'Helium Per Hour') });

	//Radon Portal
	createSetting('RAutoPortal', 'AutoPortal', 'Automatically portal. Will NOT auto-portal if you have a challenge active, the challenge setting dictates which challenge it will select for the next run. All challenge settings will portal right after the challenge ends, regardless. Radon Per Hour only <b>portals at cell 1</b> of the first level where your Rn/Hr went down even slightly compared to the current runs Best Rn/Hr. Take note, there is a Buffer option, which is like a grace percentage of how low it can dip without triggering. Setting a buffer will portal mid-zone if you exceed 5x of the buffer.  CAUTION: Selecting Rn/hr may immediately portal you if its lower-(use Pause AutoTrimps button to pause the script first to avoid this)', 'dropdown', 'Off', radonChallenges, 'Core', 2);

	createSetting('RadonHourChallenge', 'Challenge', 'Automatically portal into this challenge when using radon per hour or custom autoportal. Custom portals on the zone specified. Do not choose a challenge if you havent unlocked it. ', 'dropdown', 'None', radonHourChallenges, 'Core', 2,
		function () { return (autoTrimpSettings.RAutoPortal.selected == 'Custom' || autoTrimpSettings.RAutoPortal.selected == 'Radon Per Hour') });
	createSetting('RadonC3Challenge', 'Challenge', 'Automatically portal into this challenge when using \'Challenge 3\' portal option on autoportal. Portals on the zone specified in \'Custom Portal\'. Must end the challenges with the \'Finish C3\' setting in the C3 tab if you want to run the challenge multiple times.', 'dropdown', 'None', challenge3, 'Core', 2,
		function () { return (autoTrimpSettings.RAutoPortal.selected == 'Challenge 3') });
	createSetting('RCustomAutoPortal', 'Custom Portal', 'Automatically portal at this zone. (ie: setting to 200 would portal when you reach zone 200)', 'value', '999', null, 'Core', 2,
		function () { return (autoTrimpSettings.RAutoPortal.selected == 'Custom' || autoTrimpSettings.RAutoPortal.selected == 'Challenge 3') });
	createSetting('rCustomDailyAutoPortal', 'Daily Custom Portal', 'Automatically portal at this zone when a daily is available. (ie: setting to 200 would portal when you reach zone 200)', 'value', '999', null, 'Core', 2,
		function () { return (autoTrimpSettings.RAutoStartDaily.enabled && (autoTrimpSettings.RAutoPortal.selected == 'Custom' || autoTrimpSettings.RAutoPortal.selected == 'Challenge 3')) });
	createSetting('RnHrDontPortalBefore', 'Don\'t Portal Before', 'Do NOT allow Radon per Hour AutoPortal setting to portal BEFORE this level is reached. It is an additional check that prevents drops in radon/hr from triggering autoportal. Set to 0 or -1 to completely disable this check. (only shows up with Radon per Hour set)', 'value', '999', null, 'Core', 2,
		function () { return (autoTrimpSettings.RAutoPortal.selected == 'Radon Per Hour') });
	createSetting('RadonHrBuffer', 'Rn/Hr Portal Buffer %', 'IMPORTANT SETTING. When using the Rn/Hr Autoportal, it will portal if your Rn/Hr drops by this amount of % lower than your best for current run, default is 0% (ie: set to 5 to portal at 95% of your best). Now with stuck protection - Allows portaling midzone if we exceed set buffer amount by 5x. (ie a normal 2% buffer setting would now portal mid-zone you fall below 10% buffer).', 'value', '0', null, 'Core', 2,
		function () { return (autoTrimpSettings.RAutoPortal.selected == 'Radon Per Hour') });

	//Pause + Switch
	createSetting('PauseScript', 'Pause AutoTrimps', 'Pause AutoTrimps Script (not including the graphs module)', 'boolean', null, null, 'Core', null);
	var $pauseScript = document.getElementById('PauseScript');
	$pauseScript.parentNode.style.setProperty('float', 'right');
	$pauseScript.parentNode.style.setProperty('margin-right', '1vw');
	$pauseScript.parentNode.style.setProperty('margin-left', '0');

	createSetting('radonsettings', ['Helium', 'Radon'], 'Switch between Helium (U1) and Radon (U2) settings. ', 'multitoggle', 0, null, 'Core', null);
	var $radonsettings = document.getElementById('radonsettings');
	$radonsettings.parentNode.style.setProperty('float', 'right');
	$radonsettings.parentNode.style.setProperty('margin-right', '1vw');
	$radonsettings.parentNode.style.setProperty('margin-left', '0');

	createSetting('AutoEggs', 'AutoEggs', 'Click easter egg if it exists, upon entering a new zone. Warning: Quite overpowered. Please solemnly swear that you are up to no good.', 'boolean', false, null, 'Core', null,
		function () { return (!game.worldUnlocks.easterEgg.locked) });
	var $eggSettings = document.getElementById('AutoEggs');
	$eggSettings.parentNode.style.setProperty('float', 'right');
	$eggSettings.parentNode.style.setProperty('margin-right', '1vw');
	$eggSettings.parentNode.style.setProperty('margin-left', '0');

	//--------------------------------------------------------------------------------------------------------------------------

	//Daily
	//Helium Daily
	createSetting('buyheliumy', 'Buy Heliumy %', 'Buys the Heliumy bonus for <b>100 bones</b> when Daily bonus is above the value set in this setting. Recommend anything above 475. Will not buy if you cant afford to, or value is -1. ', 'value', -1, null, 'Daily', 1);
	createSetting('dfightforever', ['DFA: Off', 'DFA: Non-Empowered', 'DFA: All Dailies'], 'Daily Fight Always. Sends trimps to fight if they\'re not fighting in Daily challenges similar to Toxicity/Nom but not on Bloodthirst/Plagued/Bogged Dailies, regardless of BAF. Non-Empowered will only send to fight if the Daily is not Empowered. Essenitally the same as the one in combat, can use either if you wish, except this will only activate in these daily challenges (duh) ', 'multitoggle', '0', null, 'Daily', 1);
	createSetting('avoidempower', 'Avoid Empower', 'Tries to avoid Empower stacks in Empower Dailies. No harm in this being on, so default is On. ', 'boolean', true, null, 'Daily', 1);
	createSetting('dscryvoidmaps', 'Daily VM Scryer', 'Only use in Dailies if you have Scryhard II, for er, obvious reasons. Works without the scryer options. ', 'boolean', false, null, 'Daily', 1);

	//Helium Spire
	createSetting('dIgnoreSpiresUntil', 'Daily Ignore Spires Until', 'Spire specific settings like end-at-cell are ignored until at least this zone is reached in Dailies (0 to disable). ', 'value', '200', null, 'Daily', 1);
	createSetting('dExitSpireCell', 'Daily Exit Spire Cell', 'What cell to exit spire in dailys. ', 'value', -1, null, 'Daily', 1);
	createSetting('dPreSpireNurseries', 'Daily Nurseries pre-Spire', 'Set the maximum number of Nurseries to build for Spires in Dailies. Overrides No Nurseries Until z and Max Nurseries so you can keep them seperate! Disable with -1.', 'value', -1, null, 'Daily', 1);

	//Helium Windstacking
	createSetting('use3daily', 'Daily Windstacking', '<b> This must be on for Daily windstacking settings to appear!</b> Overrides your Autostance settings to use the WS stance on Dailies. ', 'boolean', false, null, 'Daily', 1);
	createSetting('dWindStackingMin', 'Daily Windstack Min Zone', 'For use with Windstacking Stance, enables windstacking in zones above and inclusive of the zone set for dailys. (Get specified windstacks then change to D, kill bad guy, then repeat). This is designed to force S use until you have specified stacks in wind zones, overriding scryer settings. All windstack settings apart from Daily WS MAX work off this setting. ', 'value', '-1', null, 'Daily', 1,
		function () { return (autoTrimpSettings.use3daily.enabled) });
	createSetting('dWindStackingMinHD', 'Daily Windstack H:D', 'For use with Windstacking Stance in Dailies, fiddle with this to maximise your stacks in wind zones for Dailies. If H:D is above this setting it will not use W stance. If it is below it will. ', 'value', '-1', null, 'Daily', 1,
		function () { return (autoTrimpSettings.use3daily.enabled) });
	createSetting('dWindStackingMax', 'Daily Windstack Stacks', 'For use with Windstacking Stance in Dailies. Amount of windstacks to obtain before switching to D stance. Default is 200, but I recommend anywhere between 175-190. In Wind Enlightenment it will add 100 stacks to your total automatically. So if this setting is 200 It will assume you want 300 stacks instead during enlightenment. ', 'value', '200', null, 'Daily', 1,
		function () { return (autoTrimpSettings.use3daily.enabled) });
	createSetting('liqstack', 'Stack Liquification', 'Stack Wind zones during Wind Enlight during Liquification. ', 'boolean', false, null, 'Daily', 1,
		function () { return (autoTrimpSettings.use3daily.enabled) });

	//Helium Daily Portal
	createSetting('AutoStartDaily', 'Auto Start Daily', 'Starts Dailies for you. When you portal with this on, it will select the oldest Daily and run it. Use the settings in this tab to decide whats next. ', 'boolean', false, null, 'Daily', 1);
	createSetting('u2daily', 'Daily in U2', 'If this is on, you will do your daily in U2. ', 'boolean', false, null, 'Daily', 1,
		function () { return game.global.highestRadonLevelCleared + 1 >= 30 });
	createSetting('AutoPortalDaily', ['Daily Portal Off', 'DP: He/Hr', 'DP: Custom'], '\
	<b>DP: He/Hr:</b> Portals when your world zone is above the minium you set (if applicable) and the buffer falls below the % you have defined.\
	<br><b>DP: Custom:</b> Portals into this challenge at the zone you have defined in Daily Custom Portal.', 'multitoggle', '0', null, 'Daily', 1);

	createSetting('dHeliumHourChallenge', 'DP: Challenge', 'Automatically portal into this challenge when using helium per hour or custom autoportal in dailies when there are none left. Custom portals on the zone specified in \'Daily Custom Portal\'. Do not choose a challenge if you havent unlocked it. ', 'dropdown', 'None', ['None', 'Balance', 'Decay', 'Electricity', 'Life', 'Crushed', 'Nom', 'Toxicity', 'Watch', 'Lead', 'Corrupted', 'Domination', 'Experience'], 'Daily', 1,
		function () { return (autoTrimpSettings.AutoPortalDaily.value > 0) });

	createSetting('dC2Challenge', 'DP: C2', 'Automatically portal into this challenge when using helium per hour or custom autoportal in dailies when there are none left. Custom portals at the zone specified.', 'dropdown', 'None', challenge2, "Daily", 1,
		function () { return (autoTrimpSettings.AutoPortalDaily.value > 0 && autoTrimpSettings.dHeliumHourChallenge.selected == 'Challenge 2') });

	createSetting('dCustomAutoPortal', 'Daily Custom Portal', 'Automatically portal at this zone during dailies. (ie: setting to 200 would portal when you reach zone 200)', 'value', '999', null, 'Daily', 1,
		function () { return (autoTrimpSettings.AutoPortalDaily.value >= 2) });

	createSetting('dHeHrDontPortalBefore', 'D: Don\'t Portal Before', 'Do NOT allow Helium per Hour Daily AutoPortal setting to portal BEFORE this level is reached in dailies. It is an additional check that prevents drops in helium/hr from triggering autoportal in dailies. Set to 0 or -1 to completely disable this check. (only shows up with Helium per Hour set in dailies)', 'value', '999', null, 'Daily', 1,
		function () { return (autoTrimpSettings.AutoPortalDaily.value === 1) });

	createSetting('dHeliumHrBuffer', 'D: He/Hr Portal Buffer %', 'IMPORTANT SETTING. When using the Daily He/Hr Autoportal, it will portal if your He/Hr drops by this amount of % lower than your best for current run in dailies, default is 0% (ie: set to 5 to portal at 95% of your best in dailies). Now with stuck protection - Allows portaling midzone if we exceed set buffer amount by 5x. (ie a normal 2% buffer setting would now portal mid-zone you fall below 10% buffer).', 'value', '0', null, 'Daily', 1,
		function () { return (autoTrimpSettings.AutoPortalDaily.value === 1) });

	//--------------------------------------------------------------------------------------------------------

	//Radon Daily
	createSetting('buyradony', 'Buy Radonculous %', 'Buys the Radonculous bonus for <b>100 bones</b> when Daily bonus is above the value set in this setting. Recommend anything above 475. Will not buy if you cant afford to, or value is -1. ', 'value', -1, null, 'Daily', 2);
	createSetting('rBloodthirstDestack', 'Bloodthirst Destack', 'Will automatically run a level 6 map when you are one stack (death) away from the enemy healing and gaining additional attack. <b>Won\'t function properly without Auto Maps enabled.</b>', 'boolean', true, null, 'Daily', 2);
	createSetting('rBloodthirstVoidMax', 'Void: Max Bloodthirst', 'Will make your Void HD Ratio assume you have max Bloodthirst stacks active if you\'re in a Bloodthirst daily.</b>', 'boolean', true, null, 'Daily', 2);
	createSetting('rAutoEqualityEmpower', 'AE: Empower', 'Will automatically adjust the enemies stats to factor in either Explosive or Crit modifiers if they\'re active on the current daily.</b>', 'boolean', true, null, 'Daily', 2,
		function () { return (autoTrimpSettings.rManageEquality.value === 2) });

	//Radon Daily Portal
	createSetting('RAutoStartDaily', 'Auto Daily', 'Starts Dailies for you. When you portal with this on, it will select the oldest Daily and run it. Use the settings in this tab to decide whats next. ', 'boolean', false, null, 'Daily', 2);

	createSetting('RAutoPortalDaily', ['Daily Portal Off', 'DP: Rn/Hr', 'DP: Custom'], '\
	<b>DP: Rn/Hr:</b> Portals when your world zone is above the minium you set (if applicable) and the buffer falls below the % you have defined.\
	<br><b>DP: Custom:</b> Portals into this challenge at the zone you have defined in Daily Custom Portal.', 'multitoggle', '0', null, 'Daily', 2);

	createSetting('RdHeliumHourChallenge', 'DP: Challenge', 'Automatically portal into this challenge when using radon per hour or custom autoportal in dailies when there are none left. Custom portals at the zone specified.', 'dropdown', 'None', radonHourChallenges, "Daily", 2,
		function () { return (autoTrimpSettings.RAutoPortalDaily.value > 0) });

	createSetting('RdC2Challenge', 'DP: C3', 'Automatically portal into this challenge when using radon per hour or custom autoportal in dailies when there are none left. Custom portals at the zone specified.', 'dropdown', 'None', challenge3, "Daily", 2,
		function () { return (autoTrimpSettings.RAutoPortalDaily.value > 0 && autoTrimpSettings.RdHeliumHourChallenge.selected == 'Challenge 3') });

	createSetting('RdCustomAutoPortal', 'Daily Custom Portal', 'Automatically portal AFTER clearing this level in dailies. (ie: setting to 200 would portal when you first reach level 201)', 'value', '999', null, "Daily", 2,
		function () { return (autoTrimpSettings.RAutoPortalDaily.value >= 2) });

	createSetting('RdHeHrDontPortalBefore', 'D: Don\'t Portal Before', 'Do NOT allow Radon per Hour Daily AutoPortal setting to portal BEFORE this level is reached in dailies. It is an additional check that prevents drops in rn/hr from triggering autoportal in dailies. Set to 0 or -1 to completely disable this check. (only shows up with Radon per Hour set in dailies)', 'value', '999', null, 'Daily', 2,
		function () { return (autoTrimpSettings.RAutoPortalDaily.value === 1) });

	createSetting('RdHeliumHrBuffer', 'Rn/Hr Portal Buffer %', 'IMPORTANT SETTING. When using the Daily Rn/Hr Autoportal, it will portal if your Rn/Hr drops by this amount of % lower than your best for current run in dailies, default is 0% (ie: set to 5 to portal at 95% of your best in dailies). Now with stuck protection - Allows portaling midzone if we exceed set buffer amount by 5x. (ie a normal 2% buffer setting would now portal mid-zone you fall below 10% buffer).', 'value', '0', null, 'Daily', 2,
		function () { return (autoTrimpSettings.RAutoPortalDaily.value === 1) });





	createSetting('RFillerRun', 'Filler run', 'Will automatically run a filler (challenge selected in DP: Challenge) if you\'re already in a daily and have this enabled.', 'boolean', false, null, 'Daily', 2,
		function () { return (autoTrimpSettings.RAutoPortalDaily.value > 0) });

	createSetting('u1daily', 'Daily in U1', 'If this is on, you will do your daily in U1. ', 'boolean', false, null, 'Daily', 2);

	createSetting('dontCapDailies', 'Use when capped', 'If this is on, you will only do the oldest daily when you have 7 dailies available. ', 'boolean', false, null, 'Daily', 2);

	createSetting('rDailyPortalSettingsArray', 'Daily Portal Settings', 'Click to adjust settings. ', 'mazDefaultArray', { portalZone: 0, portalChallenge: "None", Reflect: { enabled: true, zone: 0 }, ShredFood: { enabled: true, zone: 0 }, ShredWood: { enabled: true, zone: 0 }, ShredMetal: { enabled: true, zone: 0 }, Empower: { enabled: true, zone: 0 }, Mutimp: { enabled: true, zone: 0 }, Bloodthirst: { enabled: true, zone: 0 }, Famine: { enabled: true, zone: 0 }, Large: { enabled: true, zone: 0 }, Weakness: { enabled: true, zone: 0 } }, null, 'Jobs', 2);

	//---------------------------------------------------------------------------------------------------------

	//C2
	createSetting('FinishC2', 'Finish C2', '<b>DONT USE THIS WITH C2 RUNNER. ITS FINISH ZONE WILL OVERRIDE THIS</b><br>Finish / Abandon Challenge2 (any) when this zone is reached, if you are running one. For manual use. Recommended: Zones ending with 0 for most Challenge2. Disable with -1. Does not affect Non-Challenge2 runs.', 'value', -1, null, 'C2', 1);
	createSetting('c2table', 'C2 Table', 'Display your challenge runs in a convenient table which is colour coded. <br><b>Green</b> = Not worth updating. <br><b>Yellow</b> = Consider updating. <br><b>Red</b> = Updating this challenge is worthwhile. <br><b>Blue</b> = You have not yet done this challenge. ', 'infoclick', 'c2table', null, 'C2', 1);
	createSetting('cfightforever', 'Tox/Nom Fight Always', 'Sends trimps to fight if they\'re not fighting in the Toxicity and Nom Challenges, regardless of BAF. Essenitally the same as the one in combat, can use either if you wish, except this will only activate in these challenges (duh) ', 'boolean', false, null, 'C2', 1);
	createSetting('carmormagic', ['C2 Armor Magic Off', 'CAM: Above 80%', 'CAM: H:D', 'CAM: Always'], 'Will buy Armor to try and prevent death on Nom/Tox Challenges under the 3 conditions. <br><b>Above 80%:</b> Will activate at and above 80% of your HZE and when your health is sufficiently low. <br><b>H:D:</b> Will activate at and above the H:D you have defined in maps. <br><b>Always</b> Will activate always. <br>All options will activate at or <b>below 25% of your health.</b> ', 'multitoggle', 0, null, 'C2', 1);
	//C2 Runner
	createSetting('c2runnerstart', 'C2 Runner', 'Runs the normal C2s in sequence according to difficulty. See \'C2 Table\' for a list of challenges that this can run. Once zone you have defined has been reached, will portal into next. Only runs challenges that need updating, will not run ones close-ish to your HZE. ', 'boolean', false, null, 'C2', 1);
	createSetting('c2runnerportal', 'C2 Runner Portal', 'Automatically portal when this level is reached in C2 Runner. Set to 0 or -1 to disable.', 'value', '-1', null, 'C2', 1,
		function () { return (autoTrimpSettings.c2runnerstart.enabled) });
	createSetting('c2runnerpercent', 'C2 Runner %', 'What percent Threshhold you want C2s to be over. E.g 85, will only run C2s with HZE% below this number. Default is 85%. Must have a value set for C2 Runner to... well, run. ', 'value', '85', null, 'C2', 1,
		function () { return (autoTrimpSettings.c2runnerstart.enabled) });
	createSetting('c2fused', 'Fused C2s', 'Will make C2 runner do fused versions of the C2s rather than normal version to reduce time spent running C2s.', 'boolean', false, null, 'C2', 1,
		function () { return (autoTrimpSettings.c2runnerstart.enabled && game.global.stringVersion >= '5.9.0') });

	//Challenges

	//Balance
	createSetting('balance', 'Balance', 'Turn this on if you want to enable Balance destacking feautres.', 'boolean', false, null, 'C2', 1);
	createSetting('balanceZone', 'B: Zone', 'Which zone you would like to start destacking from.', 'value', [6], null, 'C2', 1,
		function () { return (autoTrimpSettings.balance.enabled) });
	createSetting('balanceStacks', 'B: Stacks', 'The amount of stack you have to reach before clearing them.', 'value', -1, null, 'C2', 1,
		function () { return (autoTrimpSettings.balance.enabled) });
	createSetting('balanceImprobDestack', 'B: Improbability Destack', 'Turn this on to always go down to 0 Balance on Improbabilities after you reach your specified destacking zone', 'boolean', false, null, 'C2', 1,
		function () { return (autoTrimpSettings.balance.enabled) });

	//Decay
	createSetting('decay', 'Decay', 'Turn this on if you want to enable Decay feautres.', 'boolean', false, null, 'Challenges', 1);
	createSetting('decayStacksToPush', 'D: Stacks to Push', 'During Decay, AT will ignore maps and push to end the zone if we go above this amount of stacks.<br><br>Use -1 or 0 to disable.<br>Defaults to 300.', 'value', '300', null, 'Challenges',
		function () { return (autoTrimpSettings.decay.enabled) });
	createSetting('decayStacksToAbandon', 'D: Stacks to Abandon', 'During Decay, AT will abandon the challenge if we go above this amount of stacks.<br><br>Use -1 or 0 to disable.<br>Defaults to 300.', 'value', '600', null, 'Challenges', 1,
		function () { return (autoTrimpSettings.decay.enabled) });

	//Life
	createSetting('life', 'Life', 'Turn this on if you want to enable Decay feautres.', 'boolean', false, null, 'Challenges', 1);
	createSetting('lifeZone', 'L: Zone', 'During Life, AT will only take you to the map chamber when the current enemy is Living when you are at or below this zone. <br><br>Must be used in conjunction with L: Stacks.<br><br>Defaults to 100.', 'value', '100', null, 'Challenges', 1,
		function () { return (autoTrimpSettings.life.enabled) });
	createSetting('lifeStacks', 'L: Stacks', 'During Life, AT will only take you to the map chamber when the current enemy is Living when you are at or below this stack count.<br><br>Must be used in conjunction with L: Stacks.<br><br>Defaults to 150.', 'value', '150', null, 'Challenges', 1,
		function () { return (autoTrimpSettings.life.enabled) });

	//Mapology
	createSetting('mapology', 'Mapology', 'Turn this on if you want to enable Mapology prestige climb feautre. Any BW Raiding settings will climb until the prestige selected in \'M: Prestige\' has been obtained rather than going for all the available prestiges.', 'boolean', false, null, 'C2', 1);
	createSetting('mapologyPrestige', 'M: Prestige', 'Acquire prestiges through the selected item (inclusive) as soon as they are available in maps. Automap must be enabled.', 'dropdown', 'Off', ['Off', 'Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'], 'C2', 1,
		function () { return (autoTrimpSettings.mapology.enabled) });

	//Experience
	createSetting('experience', 'Experience', 'Turn this on if you want to enable Experience feautres. <b>This setting is dependant on using \'Bionic Raiding\' in conjunction with it.</b><br><br>Will automatically disable repeat within Bionic Wonderland maps if you\'re above z600 and the Bionic map is at or above level 605.', 'boolean', false, null, 'Challenges', 1);
	createSetting('experienceStartZone', 'E: Start Zone', 'The zone you would like to start farming for Wonders at.', 'value', -1, null, 'Challenges', 1,
		function () { return (autoTrimpSettings.experience.enabled) });
	createSetting('experienceEndZone', 'E: End Zone', 'Will run the Bionic Wonderland map level specified in \'E: End BW\' at this zone. <b>This setting will not work if set below z601.</b>', 'value', '605', null, 'Challenges', 1,
		function () { return (autoTrimpSettings.experience.enabled) });
	createSetting('experienceEndBW', 'E: End BW', 'Will finish the challenge with specified Bionic Wonderland once reaching end zone. If the specified BW is not available, it will run one closest to the setting.', 'value', '605', null, 'Challenges', 1,
		function () { return (autoTrimpSettings.experience.enabled) });

	//--------------------------------------------------------------------------------------------------------

	//Buildings
	//Helium
	createSetting('BuyBuildingsNew', 'AutoBuildings', 'Buys buildings in an efficient way. Also enables Vanilla AutoStorage if its off. ', 'boolean', 'true', null, 'Legacy', 1);
	createSetting('warpstation', 'Warpstations', 'Enabling this will let AT purchase Warpstations. AT AutoStructure must be enabled for this to work.', 'boolean', true, null, 'Buildings', 1);
	createSetting('WarpstationCap', 'Warpstation Cap', 'Do not level Warpstations past Basewarp+DeltaGiga **. Without this, if a Giga wasnt available, it would level infinitely (wastes metal better spent on prestiges instead.) **The script bypasses this cap each time a new giga is bought, when it insta-buys as many as it can afford (since AT keeps available metal/gems to a low, overbuying beyond the cap to what is affordable at that first moment is not a bad thing). ', 'boolean', true, null, 'Buildings', 1,
		function () { return (autoTrimpSettings.warpstation.enabled) });
	createSetting('WarpstationCoordBuy', 'Buy Warp to Hit Coord', 'If we are very close to hitting the next coordination, and we can afford the warpstations it takes to do it, Do it! (even if we are over the Cap/Wall). Recommended with WarpCap/WarpWall. (has no point otherwise) ', 'boolean', true, null, 'Buildings', 1,
		function () { return (autoTrimpSettings.warpstation.enabled) });
	createSetting('FirstGigastation', 'First Gigastation', 'How many warpstations to buy before your first gigastation', 'value', '20', null, 'Buildings', 1,
		function () { return (autoTrimpSettings.warpstation.enabled) });
	createSetting('DeltaGigastation', 'Delta Gigastation', '<b>YOU MUST HAVE BUY UPGRADES ENABLED!</b><br> How many extra warpstations to buy for each gigastation. Supports decimal values. For example 2.5 will buy +2/+3/+2/+3...', 'value', '2', null, 'Buildings', 1,
		function () { return (autoTrimpSettings.warpstation.enabled) });
	createSetting('AutoGigas', 'Auto Gigas', "Advanced. <br>If enabled, AT will buy its first Gigastation if: <br>A) Has more than 2 Warps & <br>B) Can't afford more Coords & <br>C) (Only if Custom Delta Factor > 20) Lacking Health or Damage & <br>D) (Only if Custom Delta Factor > 20) Has run at least 1 map stack or <br>E) If forced to by using the firstGiga(true) command in the console. <br>Then, it'll calculate the delta based on your Custom Delta Factor and your Auto Portal/VM zone (whichever is higher), or Daily Auto Portal/VM zone, or C2 zone, or Custom AutoGiga Zone.", 'boolean', 'true', null, 'Buildings', 1,
		function () { return (autoTrimpSettings.warpstation.enabled) });
	createSetting('CustomTargetZone', 'Custom Target Zone', 'To be used with Auto Gigas. <br>The zone to be used as a the target zone when calculating the Auto Gigas delta. <br>Values below 60 will be discarded.', 'value', '-1', null, "Buildings", 1,
		function () { return (autoTrimpSettings.warpstation.enabled && autoTrimpSettings.AutoGigas.enabled) });
	createSetting('CustomDeltaFactor', 'Custom Delta Factor', 'Advanced. To be used with Auto Gigas. <br>This setting is used to calculate a better Delta. Think of this setting as how long your target zone takes to complete divided by the zone you bought your first giga in. <br>Basically, a higher number means a higher delta. Values below 1 will default to 10. <br><b>Recommended: 1-2 for very quick runs. 5-10 for regular runs where you slow down at the end. 20-100+ for very pushy runs.</b>', 'value', '-1', null, "Buildings", 1,
		function () { return (autoTrimpSettings.warpstation.enabled && autoTrimpSettings.AutoGigas.enabled) });

	createSetting('hBuildingSettingsArray', 'Building Settings', 'Click to adjust settings. ', 'mazDefaultArray', {
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
		Nursery: { enabled: true, percent: 100, buyMax: 0, fromZ: 999 }
	}, null, 'Jobs', 1);
	//Radon
	createSetting('RBuyBuildingsNew', 'AutoBuildings', 'Buys buildings in an efficient way. Also enables Vanilla AutoStorage if its off. ', 'boolean', 'true', null, 'Legacy', 2);
	createSetting('rBuildingSettingsArray', 'Building Settings', 'Click to adjust settings. ', 'mazDefaultArray', {
		Hut: { enabled: true, percent: 100, buyMax: 0 },
		House: { enabled: true, percent: 100, buyMax: 0 },
		Mansion: { enabled: true, percent: 100, buyMax: 0 },
		Hotel: { enabled: true, percent: 100, buyMax: 0 },
		Resort: { enabled: true, percent: 100, buyMax: 0 },
		Gateway: { enabled: true, percent: 10, buyMax: 0 },
		Collector: { enabled: true, percent: 100, buyMax: 0 },
		Smithy: { enabled: true, percent: 100, buyMax: 0 },
		Tribute: { enabled: true, percent: 100, buyMax: 0 },
		Laboratory: { enabled: true, percent: 100, buyMax: 0 },
		SafeGateway: { enabled: true, mapCount: 3, zone: 0 }
	}, null, 'Jobs', 2);

	//--------------------------------------------------------------------------------------------------------

	//Jobs
	//Helium
	createSetting('BuyJobsNew', ['Don\'t Buy Jobs', 'Auto Ratios', 'Manual Ratios'], 'Manual Ratios buys jobs for your trimps according to the ratios below, <b>Make sure they are all different values, if two of them are the same it might causing an infinite loop of hiring and firing!</b> Auto Worker ratios automatically changes these ratios based on current progress, <u>overriding your ratio settings</u>.<br>AutoRatios: 1/1/1 up to 300k trimps, 3/3/5 up to 3mil trimps, then 3/1/4 above 3 mil trimps, then 1/1/10 above 1000 tributes, then 1/2/22 above 1500 tributes, then 1/12/12 above 3000 tributes.<br>CAUTION: You cannot manually assign jobs with this, turn it off if you have to', 'multitoggle', 1, null, 'Jobs', 1);
	createSetting('hJobSettingsArray', 'Job Settings', 'Click to adjust settings. ', 'mazDefaultArray', {
		Farmer: { enabled: true, ratio: 1 },
		Lumberjack: { enabled: true, ratio: 1 },
		Miner: { enabled: true, ratio: 1 },
		Explorer: { enabled: true, percent: 5 },
		Trainer: { enabled: true, percent: 5 },
		Magmamancer: { enabled: true, percent: 100 }
	}, null, 'Jobs', 1);

	//Radon
	createSetting('RBuyJobsNew', ['AT AutoJobs Off', 'Auto Ratios', 'Manual Ratios'], 'Manual Ratios buys jobs for your trimps according to the ratios below, <b>Make sure they are all different values, if two of them are the same it might causing an infinite loop of hiring and firing!</b> Auto Worker ratios automatically changes these ratios based on current progress, <u>overriding your ratio settings</u>.<br>AutoRatios: 1/1/1 up to 300k trimps, 3/3/5 up to 3mil trimps, then 3/1/4 above 3 mil trimps, then 1/1/10 above 1000 tributes, then 1/2/22 above 1500 tributes, then 1/12/12 above 3000 tributes.<br>CAUTION: You cannot manually assign jobs with this, turn it off if you have to', 'multitoggle', 1, null, "Jobs", 2);
	createSetting('rJobSettingsArray', 'Job Settings', 'Click to adjust settings. ', 'mazDefaultArray', {
		Farmer: { enabled: true, ratio: 1 },
		Lumberjack: { enabled: true, ratio: 1 },
		Miner: { enabled: true, ratio: 1 },
		Explorer: { enabled: true, percent: 5 },
		Meteorologist: { enabled: true, percent: 100 },
		Worshipper: { enabled: true, percent: 5 },
		FarmersUntil: { enabled: false, zone: 999 },
		NoLumberjacks: { enabled: false }
	}, null, 'Jobs', 2);

	//--------------------------------------------------------------------------------------------------------

	//Gear
	//Helium
	createSetting('Hequipon', 'AutoEquip', 'AutoEquip. Buys Prestiges and levels equipment according to various settings. Will only buy prestiges if it is worth it. Levels all eqiupment according to best efficiency.', 'boolean', false, null, "Gear", 1);
	createSetting('Hdmgcuntoff', 'AE: Cut-off', 'Decides when to buy gear. 1 is default. This means it will take 1 hit to kill an enemy. If zone is below the zone you have defined in AE: Zone then it will only buy equips when needed.', 'value', '1', null, 'Gear', 1,
		function () { return (autoTrimpSettings.Hequipon.enabled) });
	createSetting('Hequipamount', 'AE: Amount', 'How much equipment to level per time.', 'value', 1, null, "Gear", 1,
		function () { return (autoTrimpSettings.Hequipon.enabled) });
	createSetting('Hequipcapattack', 'AE: Weapon Cap', 'What level to stop buying Weapons at.', 'value', 50, null, "Gear", 1,
		function () { return (autoTrimpSettings.Hequipon.enabled) });
	createSetting('Hequipcaphealth', 'AE: Armour Cap', 'What level to stop buying Armour at.', 'value', 50, null, "Gear", 1,
		function () { return (autoTrimpSettings.Hequipon.enabled) });
	createSetting('Hequipzone', 'AE: Zone', 'What zone to stop caring about H:D and buy as much prestiges and equipment as possible. <br><br>Can input multiple zones such as \'200\,231\,251\', doing this will spend all your resources purchasing gear and prestiges on each zone input but will only buy them until the end of the run after the last input. ', 'multiValue', -1, null, "Gear", 1,
		function () { return (autoTrimpSettings.Hequipon.enabled) });
	createSetting('Hequippercent', 'AE: Percent', 'What percent of resources to spend on equipment before the zone you have set in AE: Zone.', 'value', 1, null, "Gear", 1,
		function () { return (autoTrimpSettings.Hequipon.enabled) });
	createSetting('Hautoequipportal', 'AE: Portal', 'Makes sure Auto Equip is on after portalling. Turn this off to disable this and remember your choice.', 'boolean', false, null, 'Gear', 1);
	createSetting('Hequip2', 'AE: 2', 'Always buys level 2 of weapons and armor regardless of efficiency.', 'boolean', true, null, "Gear", 1,
		function () { return (autoTrimpSettings.Hequipon.enabled) });
	createSetting('Hequipprestige', ['AE: Prestige Off', 'AE: Prestige', 'AE: Always Prestige'], '\
	<b>AE: Prestige Off</b><br>Will go for a new prestige when you have 6 or more levels in your equipment.<br><br>\
	<b>AE: Prestige</b><br>Overrides the need for levels in your current equips before a prestige will be purchased. Will purchase gear levels again when you have run Atlantrimp (will buy any prestiges that cost less than 8% of your current metal).<br><br>\
	<b>AE: Always Prestige</b><br>Always buys prestiges of weapons and armor regardless of efficiency. Will override AE: Zone setting for an equip if it has a prestige available.', 'multitoggle', 0, null, "Gear", 1,
		function () { return (autoTrimpSettings.Hequipon.enabled) });
	createSetting('hEquipHighestPrestige', 'AE: Highest Prestige', 'Will only buy equips for the highest prestige currently owned.', 'boolean', true, null, "Gear", 1,
		function () { return (autoTrimpSettings.Hequipon.enabled && autoTrimpSettings.Hequipprestige.value !== 0) });
	createSetting('hEquipEfficientEquipDisplay', 'AE: Highlight Equips', 'Will highlight the most efficient equipment or prestige to buy. <b>This setting will disable the default game setting.', 'boolean', true, null, "Gear", 1);

	createSetting('Prestige', 'Prestige', 'Acquire prestiges through the selected item (inclusive) as soon as they are available in maps. Forces equip first mode. Automap must be enabled. THIS IS AN IMPORTANT SETTING related to speed climbing and should probably always be on something. If you find the script getting stuck somewhere, particularly where you should easily be able to kill stuff, setting this to an option lower down in the list will help ensure you are more powerful at all times, but will spend more time acquiring the prestiges in maps.', 'dropdown', 'Off', ['Off', 'Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'], "Gear", 1);
	createSetting('ForcePresZ', 'Force Prestige Z', 'On and after this zone is reached, always try to prestige for everything immediately, ignoring Dynamic Prestige settings and overriding that of Linear Prestige. Prestige Skip mode will exit this. Disable with -1.', 'value', -1, null, 'Gear', 1);
	createSetting('PrestigeSkip1_2', ['Prestige Skip Off', 'Prestige Skip 1 & 2', 'Prestige Skip 1', 'Prestige Skip 2'], '<b>Prestige Skip 1:</b> If there are more than 2 Unbought Prestiges (besides Shield), ie: sitting in your upgrades window but you cant afford them, AutoMaps will not enter Prestige Mode, and/or will exit from it. The amount of unboughts can be configured with this variable MODULES[\\"maps\\"].SkipNumUnboughtPrestiges = 2; <br><b>Prestige Skip 2:</b> If there are 2 or fewer <b>Unobtained Weapon Prestiges in maps</b>, ie: there are less than 2 types to run for, AutoMaps will not enter Prestige Mode, and/or will exit from it. For users who tends to not need the last few prestiges due to resource gain not keeping up. The amount of unboughts can be configured with MODULES.maps.UnearnedPrestigesRequired. If PrestigeSkipMode is enabled, both conditions need to be reached before exiting.', 'multitoggle', 0, null, "Gear", 1);
	createSetting('BuyShieldblock', 'Buy Shield Block', 'Will buy the shield block upgrade. CAUTION: If you are progressing past zone 60, you probably don\'t want this :)', 'boolean', false, null, "Gear", 1);


	//Radon
	createSetting('Requipon', 'AutoEquip', 'AutoEquip. Buys Prestiges and levels equipment according to various settings. Will only buy prestiges if it is worth it. Levels all eqiupment according to best efficiency.', 'boolean', false, null, "Gear", 2);
	createSetting('Rdmgcuntoff', 'AE: Cut-off', 'Decides when to buy gear. 1 is default. This means it will take 1 hit to kill an enemy. If zone is below the zone you have defined in AE: Zone then it will only buy equips when needed.', 'value', '1', null, 'Gear', 2,
		function () { return (autoTrimpSettings.Requipon.enabled) });
	createSetting('Requipamount', 'AE: Amount', 'How much equipment to level per time.', 'value', 1, null, "Gear", 2,
		function () { return (autoTrimpSettings.Requipon.enabled) });
	createSetting('Requipcapattack', 'AE: Weapon Cap', 'What level to stop buying Weapons at.', 'value', 50, null, "Gear", 2,
		function () { return (autoTrimpSettings.Requipon.enabled) });
	createSetting('Requipcaphealth', 'AE: Armour Cap', 'What level to stop buying Armour at.', 'value', 50, null, "Gear", 2,
		function () { return (autoTrimpSettings.Requipon.enabled) });
	createSetting('Requipzone', 'AE: Zone', 'What zone to stop caring about H:D and buy as much prestiges and equipment as possible. <br><br>Can input multiple zones such as \'200\,231\,251\', doing this will spend all your resources purchasing gear and prestiges on each zone input but will only buy them until the end of the run after the last input. ', 'multiValue', -1, null, "Gear", 2,
		function () { return (autoTrimpSettings.Requipon.enabled) });
	createSetting('Requippercent', 'AE: Percent', 'What percent of resources to spend on equipment before the zone you have set in AE: Zone.', 'value', 1, null, "Gear", 2,
		function () { return (autoTrimpSettings.Requipon.enabled) });
	createSetting('Rautoequipportal', 'AE: Portal', 'Makes sure Auto Equip is on after portalling. Turn this off to disable this and remember your choice.', 'boolean', false, null, 'Gear', 2);
	createSetting('Requip2', 'AE: 2', 'Always buys level 2 of weapons and armor regardless of efficiency.', 'boolean', true, null, "Gear", 2,
		function () { return (autoTrimpSettings.Requipon.enabled) });
	createSetting('Requipprestige', ['AE: Prestige Off', 'AE: Prestige', 'AE: Always Prestige'], '\
	<b>AE: Prestige Off</b><br>Will go for a new prestige when you have 6 or more levels in your equipment.<br><br>\
	<b>AE: Prestige</b><br>Overrides the need for levels in your current equips before a prestige will be purchased. Will purchase gear levels again when you have run Atlantrimp (will buy any prestiges that cost less than 8% of your current metal).<br><br>\
	<b>AE: Always Prestige</b><br>Always buys prestiges of weapons and armor regardless of efficiency. Will override AE: Zone setting for an equip if it has a prestige available.', 'multitoggle', 0, null, "Gear", 2,
		function () { return (autoTrimpSettings.Requipon.enabled) });
	createSetting('rEquipHighestPrestige', 'AE: Highest Prestige', 'Will only buy equips for the highest prestige currently owned.', 'boolean', true, null, "Gear", 2,
		function () { return (autoTrimpSettings.Requipon.enabled && autoTrimpSettings.Requipprestige.value !== 0) });
	createSetting('rEquipEfficientEquipDisplay', 'AE: Highlight Equips', 'Will highlight the most efficient equipment or prestige to buy. <b>This setting will disable the default game setting.', 'boolean', true, null, "Gear", 2);
	createSetting('rEquipNoShields', 'AE: No Shields', 'Will stop AT from buying Shield prestiges or upgrades when they\'re available.', 'boolean', false, null, "Gear", 2,
		function () { return (autoTrimpSettings.Requipon.enabled) });

	createSetting('rPrestige', 'Prestige', 'Acquire prestiges through the selected item (inclusive) as soon as they are available in maps. Forces equip first mode. Automap must be enabled. THIS IS AN IMPORTANT SETTING related to speed climbing and should probably always be on something. If you find the script getting stuck somewhere, particularly where you should easily be able to kill stuff, setting this to an option lower down in the list will help ensure you are more powerful at all times, but will spend more time acquiring the prestiges in maps.', 'dropdown', 'Off', ['Off', 'Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'], "Gear", 2);
	createSetting('rForcePresZ', 'Force Prestige Z', 'On and after this zone is reached, always try to prestige for everything immediately, ignoring Dynamic Prestige settings and overriding that of Linear Prestige. Prestige Skip mode will exit this. Disable with -1.', 'value', -1, null, 'Gear', 2);
	createSetting('rPrestigeSkip1_2', ['Prestige Skip Off', 'Prestige Skip 1 & 2', 'Prestige Skip 1', 'Prestige Skip 2'], '<b>Prestige Skip 1:</b> If there are more than 2 Unbought Prestiges (besides Shield), ie: sitting in your upgrades window but you cant afford them, AutoMaps will not enter Prestige Mode, and/or will exit from it. The amount of unboughts can be configured with this variable MODULES[\\"maps\\"].SkipNumUnboughtPrestiges = 2; <br><b>Prestige Skip 2:</b> If there are 2 or fewer <b>Unobtained Weapon Prestiges in maps</b>, ie: there are less than 2 types to run for, AutoMaps will not enter Prestige Mode, and/or will exit from it. For users who tends to not need the last few prestiges due to resource gain not keeping up. The amount of unboughts can be configured with MODULES.maps.UnearnedPrestigesRequired. If PrestigeSkipMode is enabled, both conditions need to be reached before exiting.', 'multitoggle', 0, null, "Gear", 2);

	//--------------------------------------------------------------------------------------------------------

	//Maps
	//Helium
	createSetting('AutoMaps', ["Auto Maps Off", "Auto Maps On", "Auto Maps No Unique"], 'Automaps. The no unique setting will not run unique maps such as dimensions of anger. Recommended ON. Do not use window, it will not work. ', 'multitoggle', 1, null, "Maps", 1);
	createSetting('automapsportal', 'AM Portal', 'Makes sure Auto Maps is on after portalling. Turn this off to disable this and remember your choice. ', 'boolean', true, null, 'Maps', 1);
	createSetting('onlyPerfectMaps', 'Perfect Maps', 'If enabled when AT is trying to map it will only create perfect maps. Be warned this may greatly decrease the map level that AT believes is efficient.', 'boolean', false, null, 'Maps', 1);
	createSetting('hUniqueMapSettingsArray', 'Unqiue Map Settings', 'Click to adjust settings.', 'mazDefaultArray', {
		The_Wall: { enabled: false, zone: 100, cell: 0 },
		The_Block: { enabled: false, zone: 100, cell: 0 },
		Dimension_of_Anger: { enabled: false, zone: 100, cell: 0 },
		Trimple_of_Doom: { enabled: false, zone: 100, cell: 0 },
		The_Prison: { enabled: false, zone: 100, cell: 0 },
		Imploding_Star: { enabled: false, zone: 100, cell: 0 }
	}, null, 'Maps', 1);
	createSetting('hUniqueMapPopup', 'Unique Map Settings', 'Click to adjust settings. Not fully implemented yet, still need to add in an Atlantrimp setting.', 'action', 'MAZLookalike("Unique Maps", " ", "UniqueMaps")', null, 'Maps', 1);
	createSetting('scryvoidmaps', 'VM Scryer', 'Only use if you have Scryhard II, for er, obvious reasons. Works without the scryer options. ', 'boolean', false, null, 'Maps', 1);

	//HD Farm
	createSetting('hHDFarmPopup', 'HD Farm Settings', 'Click to adjust settings. Not fully implemented yet, still need to add in an Atlantrimp setting.', 'action', 'MAZLookalike("HD Farm", "hHDFarm", "MAZ")', null, 'Maps', 1);
	createSetting('hHDFarmSettings', 'HD Farm: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps', 1);
	createSetting('hHDFarmDefaultSettings', 'HD Farm: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps', 1);

	//Void Maps
	createSetting('hVoidMapPopup', 'Void Map Settings', 'Will run all of your Void Maps on a specified zone according to this settings value.', 'action', 'MAZLookalike("Helium Void Map", "hVoidMap", "MAZ")', null, 'Maps', 1);
	createSetting('hVoidMapSettings', 'Void Map Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps', 1);
	createSetting('hVoidMapDefaultSettings', 'Void Map Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps', 1);

	//Bone Shrine (bone) 
	createSetting('hBoneShrinePopup', 'Bone Shrine Settings', 'Will use a specified amount of Bone Shrine charges according to this settings value.', 'action', 'MAZLookalike("Bone Shrine", "hBoneShrine", "MAZ")', null, 'Maps', 1);
	createSetting('hBoneShrineSettings', 'BS: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps', 1);
	createSetting('hBoneShrineDefaultSettings', 'BS: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps', 1);

	//Map Bonus
	createSetting('hMapBonusPopup', 'Map Bonus Settings', 'Will map stack to a specified amount according to this settings value.', 'action', 'MAZLookalike("Map Bonus", "hMapBonus", "MAZ")', null, 'Maps', 1);
	createSetting('hMapBonusSettings', 'Map Bonus: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps', 1);
	createSetting('hMapBonusDefaultSettings', 'Map Bonus: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps', 1);
	createSetting('hMapBonusZone', 'Map Bonus: Zone', 'Map Bonus', 'multiValue', [6], null, 'Legacy', 2);

	//Map Farm
	createSetting('hMapFarmPopup', 'Map Farm Settings', 'Will farm a specified amount of maps according to this settings value.', 'action', 'MAZLookalike("Map Farm", "hMapFarm", "MAZ")', null, 'Maps', 1);
	createSetting('hMapFarmSettings', 'MF: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps', 1);
	createSetting('hMapFarmDefaultSettings', 'MF: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps', 1);

	//Prestige Raiding
	createSetting('hRaidingPopup', 'Raiding Settings', 'Will raid up to a specified zone according to this settings value.', 'action', 'MAZLookalike("Raiding", "hRaiding", "MAZ")', null, 'Maps', 1);
	createSetting('hRaidingSettings', 'Raiding: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps', 1);
	createSetting('hRaidingDefaultSettings', 'Raiding: Default Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps', 1);

	//Prestige Raiding
	createSetting('hBionicRaidingPopup', 'BW Raiding Settings', 'Will Bionic Wonderlands up to a specified zone according to this settings value.', 'action', 'MAZLookalike("Bionic Raiding", "hBionicRaiding", "MAZ")', null, 'Maps', 1);
	createSetting('hBionicRaidingSettings', 'Raiding: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps', 1);
	createSetting('hBionicRaidingDefaultSettings', 'Raiding: Default Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps', 1);

	//Radon
	//General
	createSetting('RAutoMaps', ["Auto Maps", "Auto Maps", "Auto Maps No Unique"], 'Automaps. The no unique setting will not run unique maps such as dimensions of rage. Recommended ON. Do not use window, it will not work.', 'multitoggle', 1, null, "Maps", 2);
	createSetting('Rautomapsportal', 'AM Portal', 'Makes sure Auto Maps is on after portalling. Turn this off to disable this and remember your choice.', 'boolean', true, null, 'Maps', 2);
	createSetting('ronlyPerfectMaps', 'Perfect Maps', 'If enabled when AT is trying to map it will only create perfect maps. Be warned this may greatly decrease the map level that AT believes is efficient.', 'boolean', false, null, 'Maps', 2);

	createSetting('rUniqueMapSettingsArray', 'Unqiue Map Settings', 'Click to adjust settings.', 'mazDefaultArray', {
		Dimension_of_Rage: { enabled: false, zone: 100, cell: 0 },
		Prismatic_Palace: { enabled: false, zone: 100, cell: 0 },
		Atlantrimp: { enabled: false, zone: 100, cell: 0 },
		Melting_Point: { enabled: false, zone: 100, cell: 0 },
		Frozen_Castle: { enabled: false, zone: 100, cell: 0 },

		MP_Smithy: { enabled: false, value: 100 },
		MP_Smithy_Daily: { enabled: false, value: 100 },
		MP_Smithy_Daily_Shred: { enabled: false, value: 100 },
		MP_Smithy_C3: { enabled: false, value: 100 },
	}, null, 'Maps', 2);
	createSetting('rUniqueMapPopup', 'Unique Map Settings', 'Click to adjust settings. Not fully implemented yet, still need to add in an Atlantrimp setting.', 'action', 'MAZLookalike("Unique Maps", " ", "rUniqueMaps")', null, 'Maps', 2);

	//HD Farm
	createSetting('rHDFarmPopup', 'HD Farm Settings', 'Click to adjust settings. Not fully implemented yet, still need to add in an Atlantrimp setting.', 'action', 'MAZLookalike("HD Farm", "rHDFarm", "MAZ")', null, 'Maps', 2);
	createSetting('rHDFarmSettings', 'HD Farm: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps', 2);
	createSetting('rHDFarmDefaultSettings', 'HD Farm: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps', 2);

	//Void Maps
	createSetting('rVoidMapPopup', 'Void Map Settings', 'Will run all of your Void Maps on a specified zone according to this settings value.', 'action', 'MAZLookalike("Void Map", "rVoidMap", "MAZ")', null, 'Maps', 2);
	createSetting('rVoidMapSettings', 'Void Map Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps', 2);
	createSetting('rVoidMapDefaultSettings', 'Void Map Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps', 2);

	//Bone Shrine (bone) 
	createSetting('rBoneShrinePopup', 'Bone Shrine Settings', 'Will use a specified amount of Bone Shrine charges according to this settings value.', 'action', 'MAZLookalike("Bone Shrine", "rBoneShrine", "MAZ")', null, 'Maps', 2);
	createSetting('rBoneShrineSettings', 'BS: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps', 2);
	createSetting('rBoneShrineDefaultSettings', 'BS: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps', 2);

	//Worshipper Farm 
	createSetting('rWorshipperFarmPopup', 'Worshipper Farm Settings', 'Will farm to a specified amount of Worshippers according to this settings value.', 'action', 'MAZLookalike("Worshipper Farm", "rWorshipperFarm", "MAZ")', null, 'Maps', 2,
		function () { return game.global.highestRadonLevelCleared + 1 >= 50 });
	createSetting('rWorshipperFarmSettings', 'WF: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps', 2);
	createSetting('rWorshipperFarmDefaultSettings', 'WF: Default Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps', 2);

	//Map Bonus
	createSetting('rMapBonusPopup', 'Map Bonus Settings', 'Will map stack to a specified amount according to this settings value.', 'action', 'MAZLookalike("Map Bonus", "rMapBonus", "MAZ")', null, 'Maps', 2);
	createSetting('rMapBonusSettings', 'Map Bonus: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps', 2);
	createSetting('rMapBonusDefaultSettings', 'Map Bonus: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps', 2);
	createSetting('rMapBonusZone', 'Map Bonus: Zone', 'Map Bonus', 'multiValue', [6], null, 'Legacy', 2);

	//Map Farm
	createSetting('rMapFarmPopup', 'Map Farm Settings', 'Will farm a specified amount of maps according to this settings value.', 'action', 'MAZLookalike("Map Farm", "rMapFarm", "MAZ")', null, 'Maps', 2);
	createSetting('rMapFarmSettings', 'MF: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps', 2);
	createSetting('rMapFarmDefaultSettings', 'MF: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps', 2);

	//Prestige Raiding
	createSetting('rRaidingPopup', 'Raiding Settings', 'Will raid up to a specified zone according to this settings value.', 'action', 'MAZLookalike("Raiding", "rRaiding", "MAZ")', null, 'Maps', 2);
	createSetting('rRaidingSettings', 'Raiding: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps', 2);
	createSetting('rRaidingDefaultSettings', 'Raiding: Default Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps', 2);

	//Tribute Farming
	createSetting('rTributeFarmPopup', 'Tribute Farm Settings', 'Will farm for a specified amount of Tributes/Meteorologists according to this settings value.', 'action', 'MAZLookalike("Tribute Farm", "rTributeFarm", "MAZ")', null, 'Maps', 2);
	createSetting('rTributeFarmSettings', 'TrF: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps', 2);
	createSetting('rTributeFarmDefaultSettings', 'TrF: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps', 2);

	//Smithy Farming
	createSetting('rSmithyFarmPopup', 'Smithy Farm Settings', 'Will farm for a specified amount of Smithies according to this settings value.', 'action', 'MAZLookalike("Smithy Farm", "rSmithyFarm", "MAZ")', null, 'Maps', 2);
	createSetting('rSmithyFarmSettings', 'SF: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps', 2);
	createSetting('rSmithyFarmDefaultSettings', 'SF: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps', 2);

	//Spire
	//Helium
	createSetting('MaxStacksForSpire', 'Max Map Bonus for Spire', 'Get max map bonus before running the Spire.', 'boolean', false, null, 'Spire', 1);
	createSetting('IgnoreSpiresUntil', 'Ignore Spires Until', 'Spire specific settings like end-at-cell are ignored until at least this zone is reached (0 to disable).<br>Does not work with Run Bionic Before Spire.', 'value', '200', null, 'Spire', 1);
	createSetting('ExitSpireCell', 'Exit Spire After Cell', 'Optional/Rare. Exits the Spire early, after completing cell X. example: 40 for Row 4. (use 0 or -1 to disable)', 'value', '-1', null, 'Spire', 1);
	createSetting('SpireBreedTimer', 'Spire Breed Timer', '<b>ONLY USE IF YOU USE VANILLA GA</b>Set a time for your GA in spire. Recommend not touching GA during this time. ', 'value', -1, null, 'Spire', 1);
	createSetting('PreSpireNurseries', 'Nurseries pre-Spire', 'Set the maximum number of Nurseries to build for Spires. Overrides No Nurseries Until z and Max Nurseries so you can keep them seperate! Will build nurseries before z200 for Spire 1, but only on the zone of Spires 2+ to avoid unnecessary burning. Disable with -1.', 'value', -1, null, 'Spire', 1);
	createSetting('SkipSpires', 'Skip Spires', 'Useful to die in spires if farming takes too long', 'boolean', false, null, 'Spire', 1);

	//--------------------------------------------------------------

	//Windstacking
	createSetting('turnwson', 'Turn WS On!', 'Turn on Windstacking Stance in Combat to see the settings! ', 'boolean', false, null, 'Windstacking', 1,
		function () { return (autoTrimpSettings.AutoStance.value !== 3) });
	createSetting('WindStackingMin', 'Windstack Min Zone', 'For use with Windstacking Stance, enables windstacking in zones above and inclusive of the zone set. (Get specified windstacks then change to D, kill bad guy, then repeat). This is designed to force S use until you have specified stacks in wind zones, overriding scryer settings. All windstack settings apart from WS MAX work off this setting. ', 'value', '-1', null, 'Windstacking', 1,
		function () { return (autoTrimpSettings.AutoStance.value === 3) });
	createSetting('WindStackingMinHD', 'Windstack H:D', 'For use with Windstacking Stance, fiddle with this to maximise your stacks in wind zones. ', 'value', '-1', null, 'Windstacking', 1,
		function () { return (autoTrimpSettings.AutoStance.value === 3) });
	createSetting('WindStackingMax', 'Windstack Stacks', 'For use with Windstacking Stance. Amount of windstacks to obtain before switching to D stance. Default is 200, but I recommend anywhere between 175-190.  In Wind Enlightenment it will add 100 stacks to your total automatically. So if this setting is 200 It will assume you want 300 stacks instead during enlightenment. ', 'value', '200', null, 'Windstacking', 1,
		function () { return (autoTrimpSettings.AutoStance.value === 3) });

	//--------------------------------------------------------------

	//ATGA
	createSetting('ATGA2', 'ATGA', '<b>ATGA MASTER BUTTON</b><br>AT Geneticassist. Do not use vanilla GA, as it will conflict otherwise. May get fucky with super high values. ', 'boolean', false, null, 'ATGA', 1);
	createSetting('ATGA2gen', 'ATGA: Gen %', '<b>ATGA: Geneassist %</b><br>ATGA will only hire geneticists if they cost less than this value. E.g if this setting is 1 it will only buy geneticists if they cost less than 1% of your food. Default is 1%. ', 'value', '1', null, 'ATGA', 1,
		function () { return (autoTrimpSettings.ATGA2.enabled) });
	createSetting('ATGA2timer', 'ATGA: Timer', '<b>ATGA Timer</b><br>This is the default time your ATGA will use. ', 'value', '-1', null, 'ATGA', 1,
		function () { return (autoTrimpSettings.ATGA2.enabled) });

	//Zone Timers
	createSetting('zATGA2timer', 'ATGA: T: Before Z', '<b>ATGA Timer: Before Z</b><br>ATGA will use the value you define in ATGA: T: BZT before the zone you have defined in this setting, overwriting your default timer. Useful for Liq or whatever. ', 'value', '-1', null, 'ATGA', 1,
		function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
	createSetting('ztATGA2timer', 'ATGA: T: BZT', '<b>ATGA Timer: Before Z Timer</b><br>ATGA will use this value before the zone you have defined in ATGA: T: Before Z, overwriting your default timer. Useful for Liq or whatever. Does not work on challenges. ', 'value', '-1', null, 'ATGA', 1,
		function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0 && autoTrimpSettings.zATGA2timer.value > 0) });
	createSetting('ATGA2timerz', 'ATGA: T: After Z', '<b>ATGA Timer: After Z</b><br>ATGA will use the value you define in ATGA: T: AZT after the zone you have defined in this setting, overwriting your default timer. Useful for super push runs or whatever. Does not work on challenges. ', 'value', '-1', null, 'ATGA', 1,
		function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
	createSetting('ATGA2timerzt', 'ATGA: T: AZT', '<b>ATGA Timer: After Z Timer</b><br>ATGA will use this value after the zone that has been defined in ATGA: T: After Z, overwriting your default timer. Useful for super push runs or whatever. ', 'value', '-1', null, 'ATGA', 1,
		function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0 && autoTrimpSettings.ATGA2timerz.value > 0) });

	//Spire Timers
	createSetting('sATGA2timer', 'ATGA: T: Spire', '<b>ATGA Timer: Spire</b><br>ATGA will use this value in Spires. Respects your ignore Spires setting. Do not use this if you use the setting in the Spire tab! (As that uses vanilla GA) Nothing overwrites this except Daily Spire. ', 'value', '-1', null, 'ATGA', 1,
		function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
	createSetting('dsATGA2timer', 'ATGA: T: Daily Spire', '<b>ATGA Timer: Daily Spire</b><br>ATGA will use this value in Daily Spires. Respects your ignore Spires setting. Do not use this if you use the setting in the Spire tab! (As that uses vanilla GA) Nothing overwrites this. ', 'value', '-1', null, 'ATGA', 1,
		function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });

	//Daily Timers
	createSetting('dATGA2Auto', ['ATGA: Manual', 'ATGA: Auto No Spire', 'ATGA: Auto Dailies'], '<b>EXPERIMENTAL</b><br><b>ATGA Timer: Auto Dailies</b><br>ATGA will use automatically set breed timers in plague and bogged, overwriting your default timer.<br/>Set No Spire to not override in spire, respecting ignore spire settings.', 'multitoggle', 2, null, 'ATGA', 1,
		function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
	createSetting('dATGA2timer', 'ATGA: T: Dailies', '<b>ATGA Timer: Normal Dailies</b><br>ATGA will use this value for normal Dailies such as ones without plague etc, overwriting your default timer. Useful for pushing your dailies that extra bit at the end. Overwrites Default, Before Z and After Z. ', 'value', '-1', null, 'ATGA', 1,
		function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
	createSetting('dhATGA2timer', 'ATGA: T: D: Hard', '<b>ATGA Timer: Hard Dailies</b><br>ATGA will use this value in Dailies that are considered Hard. Such Dailies include plaged, bloodthirst and Dailies with a lot of negative mods. Overwrites Default, Before Z and After Z and normal Daily ATGA Timer. ', 'value', '-1', null, 'ATGA', 1,
		function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });

	//C2 Timers
	createSetting('cATGA2timer', 'ATGA: T: C2', '<b>ATGA Timer: C2s</b><br>ATGA will use this value in C2s. Overwrites Default, Before Z and After Z. ', 'value', '-1', null, 'ATGA', 1,
		function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
	createSetting('chATGA2timer', 'ATGA: T: C: Hard', '<b>ATGA Timer: Hard C2s</b><br>ATGA will use this value in C2s that are considered Hard. Electricity, Nom, Toxicity. Overwrites Default, Before Z and After Z and C2 ATGA', 'value', '-1', null, 'ATGA', 1,
		function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });

	//--------------------------------------------------------------

	//C3
	createSetting('FinishC3', 'Finish C3', '<b>DONT USE THIS WITH C2 RUNNER. ITS FINISH ZONE WILL OVERRIDE THIS</b><br>Finish / Abandon Challenge3 (any) when this zone is reached, if you are running one. Does not affect Non-C3 runs.', 'value', -1, null, 'C2', 2);
	createSetting('c3table', 'C∞ Table', 'Display your challenge runs in a convenient table which is colour coded. <br><b>Green</b> = Not worth updating. <br><b>Yellow</b> = Consider updating. <br><b>Red</b> = Updating this challenge is worthwhile. <br><b>Blue</b> = You have not yet done this challenge. ', 'infoclick', 'c2table', null, 'C2', 2);
	createSetting('c3buildings', 'Building max purchase', 'When in a C3 or special challenge  (Mayhem, Panda) run will spend 99% of resources on buildings regardless of your other designated caps until the zone you specify in the Buy Buildings Till setting.', 'boolean', false, null, 'C2', 2,
		function () { return (!autoBattle.oneTimers.Expanding_Tauntimp.owned) });
	createSetting('c3buildingzone', 'Buy buildings till', 'When in a C3 or special challenge  (Mayhem, Panda) will spend 99% of resource on buildings until this zone.', 'value', -1, null, 'C2', 2,
		function () { return (!autoBattle.oneTimers.Expanding_Tauntimp.owned) });
	createSetting('c3GM_ST', ['c3: GM/ST', 'c3: Golden Maps', 'c3: Sharp Trimps', 'c3: GM & ST'], 'Options to purchase sharp trimps, golden maps or both during C3 or special challenge (Mayhem, Pandemonium) runs.', 'multitoggle', 0, null, 'C2', 2);

	//C2 Runner
	createSetting('c3runnerstart', 'C3 Runner', 'Runs the normal C3s in sequence according to difficulty. See \'C∞ Table\' for a list of challenges that this can run. Once zone you have defined has been reached, will portal into next. I will advise you not to touch the challenges (abandoning, doing a different one, etc) if you are running this, it could break it. Only runs challenges that need updating, will not run ones close-ish to your HZE. ', 'boolean', false, null, 'C2', 2);
	createSetting('c3runnerportal', 'C3 Runner Portal', 'Automatically portal when this level is reached in C3 Runner.', 'value', '-1', null, 'C2', 2,
		function () { return (autoTrimpSettings.c3runnerstart.enabled) });
	createSetting('c3runnerpercent', 'C3 Runner %', 'What percent Threshhold you want C3s to be over. E.g 85, will only run C3s with HZE% below this number. Default is 85%. Must have a value set for C3 Runner to... well, run. ', 'value', '85', null, 'C2', 2,
		function () { return (autoTrimpSettings.c3runnerstart.enabled) });

	//Unbalance
	createSetting('rUnbalance', 'Unbalance', 'Turn this on if you want to enable Unbalance destacking feautres.', 'boolean', false, null, 'C2', 2);
	createSetting('rUnbalanceZone', 'U: Zone', 'Which zone you would like to start destacking from.', 'value', [6], null, 'C2', 2,
		function () { return (autoTrimpSettings.rUnbalance.enabled) });
	createSetting('rUnbalanceStacks', 'U: Stacks', 'The amount of stack you have to reach before clearing them.', 'value', -1, null, 'C2', 2,
		function () { return (autoTrimpSettings.rUnbalance.enabled) });
	createSetting('rUnbalanceImprobDestack', 'U: Improbability Destack', 'Turn this on to always go down to 0 Balance on Improbabilities after you reach your specified destacking zone', 'boolean', false, null, 'C2', 2,
		function () { return (autoTrimpSettings.rUnbalance.enabled) });

	//Trappapalooza
	createSetting('rTrappa', 'Trappa', 'Turn this on if you want to enable Trappa feautres.', 'boolean', false, null, 'C2', 2,
		function () { return (game.global.highestRadonLevelCleared + 1 >= 60) });
	createSetting('rTrappaCoords', 'T: Coords', 'The zone you would like to stop buying additional coordinations at.', 'value', -1, null, 'C2', 2,
		function () { return (autoTrimpSettings.rTrappa.enabled) });

	//Quest
	createSetting('rQuest', 'Quest', 'Turn this on if you want AT to automate Quests. Will only function properly with AutoMaps enabled.', 'boolean', true, null, 'C2', 2,
		function () { return (game.global.highestRadonLevelCleared + 1 >= 85) });
	createSetting('rQuestSmithyZone', 'Q: Smithy Zone', 'The zone you\'ll stop your Quest run at (will assume 85 for non C3 version). Will calculate the smithies required for Quests and purchase spare ones if possible.', 'value', [999], null, 'C2', 2,
		function () { return (autoTrimpSettings.rQuest.enabled) });

	//Mayhem
	createSetting('rMayhem', 'Mayhem', 'Turn on Mayhem settings. ', 'boolean', false, null, 'C2', 2,
		function () { return ((game.global.highestRadonLevelCleared + 1 >= 100 && game.global.mayhemCompletions !== 25) || autoTrimpSettings.rMayhem.enabled || game.global.currentChallenge === 'Mayhem') });
	createSetting('rMayhemDestack', 'M: HD Ratio', 'What HD ratio cut-off to use when farming for the boss. If this setting is 100, the script will destack until you can kill the boss in 100 average hits or there are no Mayhem stacks remaining to clear. ', 'value', '-1', null, 'C2', 2,
		function () { return (autoTrimpSettings.rMayhem.enabled) });
	createSetting('rMayhemZone', 'M: Zone', 'What zone you\'d like to start destacking from, can be used in conjunction with \'M: HD Ratio\' but will clear stacks until 0 are remaining regardless of the value set in \'M: HD Ratio\'.', 'value', '-1', null, 'C2', 2,
		function () { return (autoTrimpSettings.rMayhem.enabled) });
	createSetting('rMayhemMapIncrease', 'M: Map Increase', 'Will increase the map level of Mayhem farming by this value for if you find the map level AT is selecting is too low. Negative values will be automatically set to 0.<br>This setting will make it so that AT doesn\'t check if you can afford the new map level so beware it could cause some issues.', 'value', '-1', null, 'C2', 2,
		function () { return (autoTrimpSettings.rMayhem.enabled) });

	//Storm
	createSetting('Rstormon', 'Storm', 'Turn on Storm settings. This also controls the entireity of Storm settings. If you turn this off it will not do anything in Storm. ', 'boolean', false, null, 'C2', 2,
		function () { return (game.global.highestRadonLevelCleared + 1 >= 105) });
	createSetting('rStormZone', 'S: Zone', 'Which zone you would like to start destacking from.', 'value', [6], null, 'C2', 2,
		function () { return (autoTrimpSettings.Rstormon.enabled) });
	createSetting('rStormStacks', 'S: Stacks', 'The amount of stack you have to reach before clearing all of them.', 'value', -1, null, 'C2', 2,
		function () { return (autoTrimpSettings.Rstormon.enabled) });

	//Pandemonium
	createSetting('RPandemoniumOn', 'Pandemonium', 'Turn on Pandemonium settings.', 'boolean', false, null, 'C2', 2,
		function () { return ((game.global.highestRadonLevelCleared + 1 >= 150 && game.global.pandCompletions !== 25) || autoTrimpSettings.RPandemoniumOn.enabled || game.global.currentChallenge === 'Pandemonium') });
	createSetting('RPandemoniumZone', 'P: Destack Zone', 'What zone to start Pandemonium mapping at. Will ignore Pandemonium stacks below this zone.', 'value', '-1', null, 'C2', 2,
		function () { return (autoTrimpSettings.RPandemoniumOn.enabled) });
	createSetting('RPandemoniumAutoEquip', ['P: AutoEquip Off', 'P: AutoEquip', 'P AE: LMC', 'P AE: Huge Cache'], '<b>P: AutoEquip</b><br>Will automatically purchase equipment during Pandemonium regardless of efficiency.<br><br/><b>P AE: LMC Cache</b><br>Provides settings to run maps if the cost of equipment levels is less than a single large metal cache<br/>Will also purchase prestiges when they cost less than a Jestimp proc. Additionally will override worker settings to ensure that you farm as much metal as possible.<br/><br><b>P AE: Huge Cache</b><br>Uses the same settings as \'P: AE LMC\' but changes to if an equip will cost less than a single huge cache that procs metal. Will automatically switch caches between LMC and HC depending on the cost of equipment to ensure fast farming speed.', 'multitoggle', 0, null, 'C2', 2,
		function () { return (autoTrimpSettings.RPandemoniumOn.enabled) });
	createSetting('RPandemoniumAEZone', 'P AE: Zone', 'Which zone you would like to start farming as much gear as possible from.', 'value', '-1', null, 'C2', 2,
		function () { return (autoTrimpSettings.RPandemoniumOn.enabled && autoTrimpSettings.RPandemoniumAutoEquip.value > 1) });
	createSetting('PandemoniumFarmLevel', 'P AE: Map Level', 'The map level for farming Large Metal & Huge Caches.', 'value', '1', null, 'C2', 2,
		function () { return (autoTrimpSettings.RPandemoniumOn.enabled && autoTrimpSettings.RPandemoniumAutoEquip.value > 1) });
	createSetting('RhsPandStaff', 'P: Staff', 'The name of the staff you would like to equip while equip farming, should ideally be a full metal efficiency staff.', 'textValue', 'undefined', null, 'C2', 2,
		function () { return (autoTrimpSettings.RPandemoniumOn.enabled && autoTrimpSettings.RPandemoniumAutoEquip.value > 1) });
	createSetting('RPandemoniumMP', 'P: Melting Point', 'How many smithies to run Melting Point at during Pandemonium. <b>THIS OVERRIDES UNIQUE MAP SETTINGS INPUTS</b>', 'value', '-1', null, 'C2', 2,
		function () { return (autoTrimpSettings.RPandemoniumOn.enabled) });
	createSetting('rPandRespec', 'P: Respec', 'Turn this on to automate respeccing during Pandemonium. Be warned that this will spend bones to purchase bone portals if one is not available. <br><br>Will only function properly if the Pandemonium AutoEquip and destacking settings are all setup appropriately.<br><br>The respeccing will use the games preset system and will use Preset 2 for your destacking perk spec and Preset 3 for your farming perk spec.', 'boolean', false, null, 'C2', 2,
		function () { return (autoTrimpSettings.RPandemoniumOn.enabled && autoTrimpSettings.RPandemoniumAutoEquip.value > 1) });
	createSetting('rPandRespecZone', 'P: Respec Zone', 'The zone you\'d like to start respeccing from.', 'value', '-1', null, 'C2', 2,
		function () { return (autoTrimpSettings.RPandemoniumOn.enabled && autoTrimpSettings.RPandemoniumAutoEquip.value > 1 && autoTrimpSettings.rPandRespec.enabled) });

	//Glass
	createSetting('rGlass', 'Glass', 'Turn this on if you want to enable automating Glass damage farming & destacking feautres.', 'boolean', false, null, 'C2', 2,
		function () { return (game.global.highestRadonLevelCleared + 1 >= 175) });
	createSetting('rGlassStacks', 'G: Stacks', 'The amount of stack you have to reach before clearing them.', 'value', -1, null, 'C2', 2,
		function () { return (autoTrimpSettings.rGlass.enabled) });

	//Smithless
	createSetting('rSmithless', 'Smithless', 'Turn this on if you want to enable AT farming for damage to kill Ubersmiths on the Smithless challenge. It will identify breakpoints that can be reached with max tenacity & max map bonus to figure out how many stacks you are able to obtain from the Ubersmith on your current zone and farm till it reached that point if it\'s attainable.', 'boolean', false, null, 'C2', 2,
		function () { return (game.global.highestRadonLevelCleared + 1 >= 201) });

	//Wither
	createSetting('rWither', 'Wither', 'Turn this on if you want to enable AT farming until you can 4 shot your current world cell on Wither.', 'boolean', false, null, 'C2', 2,
		function () { return (game.global.highestRadonLevelCleared + 1 >= 70) });

	if (game.global.stringVersion >= '5.9.0') {
		//Mayhem
		createSetting('desolation', 'Desolation', 'Turn on Desolation settings. ', 'boolean', false, null, 'C2', 2,
			function () { return ((game.global.highestRadonLevelCleared + 1 >= 200 && game.global.desoCompletions !== 25) || autoTrimpSettings.desolation.enabled || game.global.currentChallenge === 'Desolation') });
		createSetting('desolationDestack', 'D: HD Ratio', 'What HD ratio cut-off to use when farming for the boss. If this setting is 100, the script will destack until you can kill the boss in 100 average hits or there are no Desolation stacks remaining to clear. ', 'value', '-1', null, 'C2', 2,
			function () { return (autoTrimpSettings.desolation.enabled) });
		createSetting('desolationZone', 'D: Zone', 'What stack you\'d like to start destacking from, can be used in conjunction with \'D: HD Ratio\' but will clear stacks until the value set in \'D: Stacks\'.', 'value', '-1', null, 'C2', 2,
			function () { return (autoTrimpSettings.desolation.enabled) });
		createSetting('desolationStacks', 'D: Stacks', 'Sets the minimum stacks that AT will start to clear from when \'D: HD Ratio\' or \'D: Zone\' are being run. If set to -1 it\'ll act as 0 stacks. WILL CLEAR TO 0 STACKS WHEN IT STARTS RUNNING.', 'value', '-1', null, 'C2', 2,
			function () { return (autoTrimpSettings.desolation.enabled) });
		createSetting('desolationMapIncrease', 'D: Map Increase', 'Will increase the minimum map level of Desolation farming by this value for if you find the map level AT is selecting is too low. Negative values will be automatically set to 0.', 'value', '-1', null, 'C2', 2,
			function () { return (autoTrimpSettings.desolation.enabled) });
		createSetting('desolationMP', 'D: Melting Point', 'How many smithies to run Melting Point at during Desolation. <b>THIS OVERRIDES UNIQUE MAP SETTINGS INPUTS</b>', 'value', '-1', null, 'C2', 2,
			function () { return (autoTrimpSettings.desolation.enabled) });
	}

	//--------------------------------------------------------------

	//Challenges

	//Hide Challenges
	createSetting('rHideChallenge', 'Hide Challenges', 'Enable seeing the hide challenges buttons. Feel free to turn this off once you are done. ', 'boolean', false, null, 'Challenges', 2);
	createSetting('rHideArchaeology', 'Arch', 'Enable to hide Archaeology challenge settings. ', 'boolean', false, null, 'Challenges', 2,
		function () { return (autoTrimpSettings.rHideChallenge.enabled && game.global.highestRadonLevelCleared + 1 >= 90) });
	createSetting('rHideExterminate', 'Exterminate', 'Enable to hide Exterminate challenge settings. ', 'boolean', false, null, 'Challenges', 2,
		function () { return (autoTrimpSettings.rHideChallenge.enabled && game.global.highestRadonLevelCleared + 1 >= 120) });

	//Arch
	createSetting('Rarchon', 'Archaeology', 'Turn on Archaeology settings. ', 'boolean', false, null, 'Challenges', 2,
		function () { return (game.global.highestRadonLevelCleared + 1 >= 90) });
	createSetting('Rarchstring1', 'First String', 'First string to use in Archaeology. Put the zone you want to stop using this string and start using the second string (Make sure the second string has a value) at the start. I.e: 70,10a,10e ', 'textValue', 'undefined', null, 'Challenges', 2,
		function () { return (autoTrimpSettings.Rarchon.enabled) });
	createSetting('Rarchstring2', 'Second String', 'Second string to use in Archaeology. Put the zone you want to stop using this string and start using the third string (Make sure the third string has a value) at the start. I.e: 94,10a,10e ', 'textValue', 'undefined', null, 'Challenges', 2,
		function () { return (autoTrimpSettings.Rarchon.enabled) });
	createSetting('Rarchstring3', 'Third String', 'Third string to use in Archaeology. Make sure this is just your Archaeology string and nothing else. I.e: 10a,10e ', 'textValue', 'undefined', null, 'Challenges', 2,
		function () { return (autoTrimpSettings.Rarchon.enabled) });

	//Exterminate
	createSetting('Rexterminateon', 'Exterminate', 'Turn on Exterminate settings. This also controls the entireity of Exterminate. If you turn this off it will not calculate Exterminate.', 'boolean', false, null, 'Challenges', 2,
		function () { return (game.global.highestRadonLevelCleared + 1 >= 90) });
	createSetting('Rexterminatecalc', 'E: Calc', 'Calculate Exterminate enemies instead of the usual ones. May improve your challenge experience. ', 'boolean', false, null, 'Challenges', 2,
		function () { return (autoTrimpSettings.Rexterminateon.enabled) });
	createSetting('Rexterminateeq', 'E: Equality', 'Will manage your equality \'better\' inside the challenge. When you have the experienced buff it will turn it off, when you dont it will turn it on and let it build up.', 'boolean', false, null, 'Challenges', 2,
		function () { return (autoTrimpSettings.Rexterminateon.enabled) });

	//Quagmire
	createSetting('rQuagPopup', 'Quag Farm Settings', 'Click to adjust settings. ', 'action', 'MAZLookalike("Quagmire Farm", "rQuag", "MAZ")', null, 'Challenges', 2,
		function () { return (game.global.highestRadonLevelCleared + 1 >= 70) });
	createSetting('rQuagSettings', 'Quag: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Challenges', 2);
	createSetting('rQuagDefaultSettings', 'Quag: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Challenges', 2);

	//Insanity
	createSetting('rInsanityPopup', 'Insanity Farm Settings', 'Click to adjust settings. ', 'action', 'MAZLookalike("Insanity Farm", "rInsanity", "MAZ")', null, 'Challenges', 2,
		function () { return (game.global.highestRadonLevelCleared + 1 >= 110) });
	createSetting('rInsanitySettings', 'Insanity: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Challenges', 2);
	createSetting('rInsanityDefaultSettings', 'Insanity: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Challenges', 2);

	//Alchemy
	createSetting('rAlchPopup', 'Alchemy Farm Settings', 'Click to adjust settings.', 'action', 'MAZLookalike("Alchemy Farm", "rAlch", "MAZ")', null, 'Challenges', 2,
		function () { return (game.global.highestRadonLevelCleared + 1 >= 155) });
	createSetting('rAlchSettings', 'AF: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Challenges', 2);
	createSetting('rAlchDefaultSettings', 'AF: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Challenges', 2);

	//Hypothermia
	createSetting('rHypoPopup', 'Hypo Farm Settings', 'Click to adjust settings.', 'action', 'MAZLookalike("Hypothermia Farm", "rHypo", "MAZ")', null, 'Challenges', 2,
		function () { return (game.global.highestRadonLevelCleared + 1 >= 175) });
	createSetting('rHypoSettings', 'HF: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Challenges', 2);
	createSetting('rHypoDefaultSettings', 'HF: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Challenges', 2);

	//--------------------------------------------------------------

	//Combat
	//Helium
	createSetting('BetterAutoFight', ['Better AutoFight OFF', 'Better Auto Fight', 'Vanilla'], '3-Way Button, Recommended. Will automatically handle fighting.<br>BAF = Old Algo (Fights if dead, new squad ready, new squad breed timer target exceeded, and if breeding takes under 0.5 seconds<br>BAF3 = Uses vanilla autofight and makes sure you fight on portal. <br> WARNING: If you autoportal with BetterAutoFight disabled, the game may sit there doing nothing until you click FIGHT. (not good for afk) ', 'multitoggle', 1, null, "Combat", null);
	createSetting('AutoStance', ['Auto Stance OFF', 'Auto Stance', 'D Stance', 'Windstacking'], '<b>Autostance:</b> Automatically swap stances to avoid death. <br><b>D Stance:</b> Keeps you in D stance regardless of Health. <br><b>Windstacking:</b> For use after nature (z230), and will keep you in D stance unless you are windstacking (Only useful if transfer is maxed out and wind empowerment is high). There\'s settings in the Windstacking tab that must be setup for this to function as intended.', 'multitoggle', 1, null, "Combat", 1);
	createSetting('IgnoreCrits', ['Safety First', 'Ignore Void Strength', 'Ignore All Crits'], 'No longer switches to B against corrupted precision and/or void strength. <b>Basically we now treat \'crit things\' as regular in both autoStance and autoStance2</b>. In fact it no longer takes precision / strength into account and will manage like a normal enemy, thus retaining X / D depending on your needs. If you\'re certain your block is high enough regardless if you\'re fighting a crit guy in a crit daily, use this! Alternatively, manage the stances yourself.', 'multitoggle', 0, null, 'Combat', 1,
		function () { return (autoTrimpSettings.AutoStance.value !== 3) });
	createSetting('PowerSaving', ['AutoAbandon', 'Don\'t Abandon', 'Only Rush Voids'], '<b>Autoabandon:</b> Considers abandoning trimps for void maps/prestiges.<br><b>Don\'t Abandon:</b> Will not abandon troops, but will still agressively autostance even if it will kill you (WILL NOT ABANDON TRIMPS TO DO VOIDS).<br><b>Only Rush Voids:</b> Considers abandoning trimps for void maps, but not prestiges, still autostances aggressively. <br>Made for Empower daily, and you might find this helpful if you\'re doing Workplace Safety feat. Then again with that I strongly recommend doing it fully manually. Anyway, don\'t blame me whatever happens.<br><b>Note:</b> AT will no longer be able to fix when your scryer gets stuck!', 'multitoggle', 0, null, 'Combat', null);
	createSetting('ForceAbandon', 'Trimpicide', 'If a new fight group is available and anticipation stacks aren\'t maxed, Trimpicide and grab a new group. Will not abandon in spire. Recommended ON. ', 'boolean', true, null, 'Combat', 1);
	createSetting('AutoRoboTrimp', 'AutoRoboTrimp', 'Use RoboTrimps ability starting at this level, and every 5 levels thereafter. (set to 0 to disable. default 60.) 60 is a good choice for mostly everybody.', 'value', '60', null, 'Combat', 1);
	createSetting('fightforever', 'Fight Always', 'U1: -1 to disable. Sends trimps to fight if they\'re not fighting, regardless of BAF. Has 2 uses. Set to 0 to always send out trimps. Or set a number higher than 0 to enable the H:D function. If the H:D ratio is below this number it will send them out. I.e, this is set to 1, it will send out trimps regardless with the H:D ratio is below 1. ', 'value', '-1', null, 'Combat', 1);
	createSetting('addpoison', 'Poison Calc', '<b>Experimental. </b><br>Adds poison to the battlecalc. May improve your poison zone speed. ', 'boolean', false, null, 'Combat', 1);
	createSetting('fullice', 'Ice Calc', '<b>Experimental. </b><br>Always calculates your ice to be a consistent level instead of going by the enemy debuff. Stops H:D spazzing out. ', 'boolean', false, null, 'Combat', 1);
	createSetting('45stacks', 'Antistack Calc', '<b>Experimental. </b><br>Always calcs your damage as having full antistacks. Useful for windstacking. ', 'boolean', false, null, 'Combat', 1);

	//Radon
	createSetting('rManageEquality', ['Auto Equality Off', 'Auto Equality: Basic', 'Auto Equality: Advanced'], 'Manages Equality settings for you. <br><br><b>Auto Equality: Basic</b><br>Sets Equality to 0 on Slow enemies, and Autoscaling on for Fast enemies.<br><br><b>Auto Equality: Advanced</b><br>Will automatically identify the best equality levels to kill the current enemy and change it when necessary.', 'multitoggle', 0, null, 'Combat', 2);
	createSetting('Rcalcmaxequality', ['Equality Calc Off', 'EC: On', 'EC: Health'], '<b>Experimental. </b><br>Adds Equality Scaling levels to the battlecalc. Will always calculate equality based on actual scaling levels when its turned off by other settings. Assumes you use Equality Scaling. Turning this on allows in-game Equality Scaling to adjust your Health accordingly. EC: Health only decreases enemies attack in the calculation which may improve speed. ', 'multitoggle', 0, null, 'Combat', 2,
		function () { return (autoTrimpSettings.rManageEquality.value < 2) });
	createSetting('rCalcGammaBurst', 'Gamma Burst Calc', '<b>Experimental.</b><br>Adds Gamma Burst to your HD Ratio. Be warned, it will assume that you have a gamma burst ready to trigger for every attack so your HD Ratio might be 1 but you\'d need to attack 4-5 times to reach that damage theshold.', 'boolean', true, null, 'Combat', 2,
		function () { return (autoTrimpSettings.rManageEquality.value === 2) });
	createSetting('Rcalcfrenzy', 'Frenzy Calc', '<b>Experimental.</b><br>Adds frenzy to the calc. Be warned, it will not farm as much with this on as it expects 100% frenzy uptime.', 'boolean', false, null, 'Combat', 2,
		function () { return (!game.portal.Frenzy.radLocked && !autoBattle.oneTimers.Mass_Hysteria.owned) });

	//--------------------------------------------------------------, 'Scryer'

	//Scryer
	createSetting('UseScryerStance', 'Enable Scryer Stance', '<b>MASTER BUTTON</b> Activates all other scrying settings, and overrides AutoStance when scryer conditions are met. Leave regular Autostance on while this is active. Scryer gives 2x Resources (Non-Helium/Nullifium) and a chance for Dark Essence. Once this is on, priority for Scryer decisions goes as such:<br>NEVER USE, FORCE USE, OVERKILL, MIN/MAX ZONE<br><br><b>NO OTHER BUTTONS WILL DO ANYTHING IF THIS IS OFF.</b>', 'boolean', true, null, 'Combat', 1);
	createSetting('ScryerUseWhenOverkill', 'Use When Overkill', 'Overrides everything! Toggles stance when we can Overkill in S, giving us double loot with no speed penalty (minimum one overkill, if you have more than 1, it will lose speed) <b>NOTE:</b> This being on, and being able to overkill in S will override ALL other settings <u>(Except never use in spire)</u>. This is a boolean logic shortcut that disregards all the other settings including Min and Max Zone. If you ONLY want to use S during Overkill, as a workaround: turn this on and Min zone: to 9999 and everything else off(red). ', 'boolean', true, null, 'Combat', 1);
	createSetting('ScryerMinZone', 'Min Zone', 'Minimum zone to start using scryer in.(inclusive) Recommend:(60 or 181). Overkill ignores this. This needs to be On & Valid for the <i>MAYBE</i> option on all other Scryer settings to do anything if Overkill is off. Tip: Use 9999 to disable all Non-Overkill, Non-Force, scryer usage.', 'value', '181', null, 'Combat', 1);
	createSetting('ScryerMaxZone', 'Max Zone', '<b>0 or -1 to disable (Recommended)</b><br>Overkill ignores this. Zone to STOP using scryer at (not inclusive). Turning this ON with a positive number stops <i>MAYBE</i> use of all other Scryer settings.', 'value', '230', null, 'Combat', 1);
	createSetting('onlyminmaxworld', 'World Min & Max Only', 'Forces Scryer to only work in world regardless of other settings. ', 'boolean', false, null, 'Combat', 1);
	createSetting('ScryerUseinMaps2', ['Maps: NEVER', 'Maps: FORCE', 'Maps: MAYBE'], '<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate in Maps<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br>This setting requires use on Corrupteds to be on after corruption/magma.<br><br>Recommend MAYBE.', 'multitoggle', 2, null, 'Combat', 1);
	createSetting('ScryerUseinVoidMaps2', ['VoidMaps: NEVER', 'VoidMaps: FORCE', 'VoidMaps: MAYBE'], '<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate in Void Maps<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed. ', 'multitoggle', 0, null, 'Combat', 1);
	createSetting('ScryerUseinPMaps', ['P Maps: NEVER', 'P Maps: FORCE', 'P Maps: MAYBE'], '<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate in maps higher than your zone<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br>Recommend NEVER.', 'multitoggle', 0, null, 'Combat', 1);
	createSetting('ScryerUseinBW', ['BW: NEVER', 'BW: FORCE', 'BW: MAYBE'], '<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate in BW Maps<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br>This setting requires use in Maps to be on. <br><br>Recommend NEVER.', 'multitoggle', 0, null, 'Combat', 1);
	createSetting('ScryerUseinSpire2', ['Spire: NEVER', 'Spire: FORCE', 'Spire: MAYBE'], '<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate in the Spire<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br>This setting requires use on Corrupteds to be on for corrupted enemies.<br><br>Recommend NEVER.', 'multitoggle', 0, null, 'Combat', 1);
	createSetting('ScryerSkipBoss2', ['Boss: NEVER (All Levels)', 'Boss: NEVER (Above VoidLevel)', 'Boss: MAYBE'], '<b>NEVER (All Levels)</b> will NEVER use S in cell 100 of the world!!!<br><b>NEVER (Above VoidLevel)</b> will NEVER use S in cell 100 of the world ABOVE the zone that your void maps are set to run at (Maps).<br><b>MAYBE</b> treats the cell no differently to any other, Overkill and Min/Max Scryer is allowed.<br><br>Recommend NEVER (There is little benefit to double NON-HELIUM resources and a small chance of DE).', 'multitoggle', 0, null, 'Combat', 1);
	createSetting('ScryerSkipCorrupteds2', ['Corrupted: NEVER', 'Corrupted: FORCE', 'Corrupted: MAYBE'], '<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate against Corrupted enemies<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br><b>Magma maps and Corrupted Voidmaps are currently classified as corrupted</b> and NEVER here will override Maps and Voidmaps use of Scryer<br><br>Recommend MAYBE.', 'multitoggle', 2, null, 'Combat', 1);
	createSetting('ScryerSkipHealthy', ['Healthy: NEVER', 'Healthy: FORCE', 'Healthy: MAYBE'], '<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate against Healthy enemies<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br><b>Corrupted Voidmaps are currently classified as Healthy (same as corrupted)</b> and NEVER here will override Maps and Voidmaps use of Scryer<br><br>Recommend MAYBE.', 'multitoggle', 2, null, 'Combat', 1);
	createSetting('ScryUseinPoison', 'Scry in Poison', 'Decides what you do in Poison. <br><b>-1</b> = Maybe <br><b>0</b> = Never <br><b>Above 0</b> = Max Zone you want it scrying ', 'value', -1, null, 'Combat', 1);
	createSetting('ScryUseinWind', 'Scry in Wind', 'Decides what you do in Wind. <br><b>-1</b> = Maybe <br><b>0</b> = Never <br><b>Above 0</b> = Max Zone you want it scrying', 'value', -1, null, 'Combat', 1);
	createSetting('ScryUseinIce', 'Scry in Ice', 'Decides what you do in Ice. <br><b>-1</b> = Maybe <br><b>0</b> = Never <br><b>Above 0</b> = Max Zone you want it scrying', 'value', -1, null, 'Combat', 1);
	createSetting('ScryerDieZ', 'Die To Use S', '<b>-1 to disable.</b><br>Turning this on will switch you back to S even when doing so would kill you. Happens in scenarios where you used Skip Corrupteds that took you into regular Autostance X/H stance, killed the corrupted and reached a non-corrupted enemy that you wish to use S on, but you havent bred yet and you are too low on health to just switch back to S. So you\'d rather die, wait to breed, then use S for the full non-corrupted enemy, to maximize DE. NOTE: Use at your own risk.<br>Use this input to set the minimum zone that scryer activates in (You can use decimal values to specify what cell this setting starts from)', 'value', 230.60, null, 'Combat', 1);
	createSetting('screwessence', 'Remaining Essence Only', 'Why scry when theres no essence? Turns off scrying when the remaining enemies with essence drops to 0. ', 'boolean', false, null, 'Combat', 1);

	//--------------------------------------------------------------

	//Magma
	createSetting('UseAutoGen', 'Auto Generator', 'Turn this on to use these settings. ', 'boolean', false, null, 'Magma', 1);
	createSetting('beforegen', ['Gain Mi', 'Gain Fuel', 'Hybrid'], '<b>MODE BEFORE FUELING: </b>Which mode to use before fueling. This is the mode which the generator will use if you fuel after z230. ', 'multitoggle', 1, null, 'Magma', 1);
	createSetting('fuellater', 'Start Fuel Z', 'Start fueling at this zone instead of 230. I would suggest you have a value lower than your max, for obvious reasons. Recommend starting at a value close-ish to your max supply. Use 230 to use your <b>BEFORE FUEL</b> setting. ', 'value', -1, null, 'Magma', 1);
	createSetting('fuelend', 'End Fuel Z', 'End fueling at this zone. After this zone is reached, will follow your preference. -1 to fuel infinitely. ', 'value', -1, null, 'Magma', 1);
	createSetting('defaultgen', ['Gain Mi', 'Gain Fuel', 'Hybrid'], '<b>MODE AFTER FUELING: </b>Which mode to use after fueling. ', 'multitoggle', 1, null, 'Magma', 1);
	createSetting('AutoGenDC', ['Daily: Normal', 'Daily: Fuel', 'Daily: Hybrid'], '<b>Normal:</b> Uses the AutoGen settings. <br><b>Fuel:</b> Fuels the entire Daily. <br><b>Hybrid:</b> Uses Hybrid for the entire Daily. ', 'multitoggle', 1, null, 'Magma', 1);
	createSetting('AutoGenC2', ['C2: Normal', 'C2: Fuel', 'C2: Hybrid'], '<b>Normal:</b> Uses the AutoGen settings. <br><b>Fuel:</b> Fuels the entire C2. <br><b>Hybrid:</b> Uses Hybrid for the entire C2. ', 'multitoggle', 1, null, 'Magma', 1);

	//Spend Mi
	createSetting('spendmagmite', ['Spend Magmite OFF', 'Spend Magmite (Portal)', 'Spend Magmite Always'], 'Auto Spends any unspent Magmite immediately before portaling. (Or Always, if toggled). Part 1 buys any permanent one-and-done upgrades in order from most expensive to least. Part 2 then analyzes Efficiency vs Capacity for cost/benefit, and buys Efficiency if its BETTER than Capacity. If not, if the PRICE of Capacity is less than the price of Supply, it buys Capacity. If not, it buys Supply. And then it repeats itself until you run out of Magmite and cant buy anymore. ', 'multitoggle', 1, null, 'Magma', 1);
	createSetting('ratiospend', 'Ratio Spending', 'Spends Magmite in a Ratio you define. ', 'boolean', false, null, 'Magma', 1);
	createSetting('effratio', 'Efficiency', 'Use -1 or 0 to not spend on this. Any value above 0 will spend. ', 'value', -1, null, 'Magma', 1,
		function () { return (autoTrimpSettings.ratiospend.enabled) });
	createSetting('capratio', 'Capacity', 'Use -1 or 0 to not spend on this. Any value above 0 will spend. ', 'value', -1, null, 'Magma', 1,
		function () { return (autoTrimpSettings.ratiospend.enabled) });
	createSetting('supratio', 'Supply', 'Use -1 or 0 to not spend on this. Any value above 0 will spend. ', 'value', -1, null, 'Magma', 1,
		function () { return (autoTrimpSettings.ratiospend.enabled) });
	createSetting('ocratio', 'Overclocker', 'Use -1 or 0 to not spend on this. Any value above 0 will spend. ', 'value', -1, null, 'Magma', 1,
		function () { return (autoTrimpSettings.ratiospend.enabled) });
	createSetting('SupplyWall', 'Throttle Supply (or Capacity)', 'Positive number NOT 1 e.g. 2.5: Consider Supply when its cost * 2.5 is < Capacity, instead of immediately when < Cap. Effectively throttles supply for when you don\'t need too many.<br><br>Negative number (-1 is ok) e.g. -2.5: Consider Supply if it costs < Capacity * 2.5, buy more supplys! Effectively throttling capacity instead.<br><br><b>Set to 1: DISABLE SUPPLY only spend magmite on Efficiency, Capacity and Overclocker. Always try to get supply close to your HZE. <br>Set to 0: IGNORE SETTING and use old behaviour (will still try to buy overclocker)</b>', 'valueNegative', 0.4, null, 'Magma', 1,
		function () { return (!autoTrimpSettings.ratiospend.enabled) });
	createSetting('spendmagmitesetting', ['Normal', 'Normal & No OC', 'OneTime Only', 'OneTime & OC'], '<b>Normal:</b> Spends Magmite Normally as Explained in Magmite spending behaviour. <br><b>Normal & No OC:</b> Same as normal, except skips OC afterbuying 1 OC upgrade. <br><b>OneTime Only:</b> Only Buys the One off upgrades except skips OC afterbuying 1 OC upgrade. <br><b>OneTime & OC:</b> Buys all One off upgrades, then buys OC only. ', 'multitoggle', 0, null, 'Magma', 1,
		function () { return (!autoTrimpSettings.ratiospend.enabled) });
	createSetting('MagmiteExplain', 'Magmite spending behaviour', '1. Buy one-and-done upgrades, expensive first, then consider 1st level of Overclocker;<br>2. Buy Overclocker IF AND ONLY IF we can afford it;<br>2.5. Exit if OneTimeOnly<br>3. Buy Efficiency if it is better than capacity;<br>4. Buy Capacity or Supply depending on which is cheaper, or based on SupplyWall', 'infoclick', 'MagmiteExplain', null, 'Magma', 1,
		function () { return (!autoTrimpSettings.ratiospend.enabled) });

	//--------------------------------------------------------------

	//Heirloom
	//Heirloom Swapping
	createSetting('Hhs', 'Heirloom Swapping', 'Heirloom swapping master button. Turn this on to allow heirloom swapping and its associated settings. ', 'boolean', false, null, 'Heirlooms', 1);
	createSetting('HhsMapSwap', 'Map Swap', 'Toggle to swap to your afterpush shield when inside maps', 'boolean', false, null, 'Heirlooms', 1,
		function () { return (autoTrimpSettings.Hhs.enabled) });

	//Shield swapping
	createSetting('HhsShield', 'Shields', 'Toggle to swap Shields', 'boolean', false, null, 'Heirlooms', 1,
		function () { return (autoTrimpSettings.Hhs.enabled && autoTrimpSettings.Hhs.enabled) });
	createSetting('HhsInitial', 'Initial', '<b>First Heirloom to use</b><br><br>Enter the name of your first heirloom. This is the heirloom that you will use before swapping to the second heirloom at the zone you have defined in the HS: Zone. ', 'textValue', 'undefined', null, 'Heirlooms', 1,
		function () { return (autoTrimpSettings.Hhs.enabled && autoTrimpSettings.HhsShield.enabled) });
	createSetting('HhsAfterpush', 'Afterpush', '<b>Second Heirloom to use</b><br><br>Enter the name of your second heirloom. This is the heirloom that you will use after swapping from the first heirloom at the zone you have defined in the HS: Zone. ', 'textValue', 'undefined', null, 'Heirlooms', 1,
		function () { return (autoTrimpSettings.Hhs.enabled && autoTrimpSettings.HhsShield.enabled) });
	createSetting('HhsC3', 'C3', '<b>C3 heirloom to use</b><br><br>Enter the name of the heirloom you would like to use during C3\s and special challenges (Mayhem, Pandemonium).', 'textValue', 'undefined', null, 'Heirlooms', 1,
		function () { return (autoTrimpSettings.Hhs.enabled && autoTrimpSettings.HhsShield.enabled) });
	createSetting('HhsSwapZone', 'Swap Zone', 'Which zone to swap from your first heirloom you have defined to your second heirloom you have defined. I.e if this value is 75 it will switch to the second heirloom <b>on z75</b>', 'value', '-1', null, 'Heirlooms', 1,
		function () { return (autoTrimpSettings.Hhs.enabled && autoTrimpSettings.HhsShield.enabled) });
	createSetting('HhsDailySwapZone', 'Daily Swap Zone', 'Which zone to swap from your first heirloom you have defined to your second heirloom you have defined. I.e if this value is 75 it will switch to the second heirloom <b>on z75</b>', 'value', '-1', null, 'Heirlooms', 1,
		function () { return (autoTrimpSettings.Hhs.enabled && autoTrimpSettings.HhsShield.enabled) });
	createSetting('HhsC3SwapZone', 'C3 Swap Zone', 'Which zone to swap from your first heirloom you have defined to the C3 heirloom you have defined. I.e if this value is 75 it will switch to the C3 heirloom <b>on z75</b>', 'value', -1, null, 'Heirlooms', 1,
		function () { return (autoTrimpSettings.Hhs.enabled && autoTrimpSettings.HhsShield.enabled) });

	//Staff swapping
	createSetting('HhsStaff', 'Staffs', 'Toggle to swap Staffs', 'boolean', false, null, 'Heirlooms', 1,
		function () { return (autoTrimpSettings.Hhs.enabled) });
	createSetting('HhsWorldStaff', 'World', '<b>World Staff</b><br><br>Enter the name of your world staff.', 'textValue', 'undefined', null, 'Heirlooms', 1,
		function () { return (autoTrimpSettings.Hhs.enabled && autoTrimpSettings.HhsStaff.enabled) });
	createSetting('HhsMapStaff', 'Map', '<b>General Map Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside maps, will be overwritten by the proceeding 3 heirloom settings if they\'re being used otherwise will work in every maptype.', 'textValue', 'undefined', null, 'Heirlooms', 1,
		function () { return (autoTrimpSettings.Hhs.enabled && autoTrimpSettings.HhsStaff.enabled) });
	createSetting('HhsFoodStaff', 'Savory Cache', '<b>Savory Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Savory Cache maps. Will use this staff for Tribute farming if it\'s enabled.', 'textValue', 'undefined', null, 'Heirlooms', 1,
		function () { return (autoTrimpSettings.Hhs.enabled && autoTrimpSettings.HhsStaff.enabled) });
	createSetting('HhsWoodStaff', 'Wooden Cache', '<b>Wooden Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Wooden Cache maps.', 'textValue', 'undefined', null, 'Heirlooms', 1,
		function () { return (autoTrimpSettings.Hhs.enabled && autoTrimpSettings.HhsStaff.enabled) });
	createSetting('HhsMetalStaff', 'Metal Cache', '<b>Metal Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Metal Cache maps.', 'textValue', 'undefined', null, 'Heirlooms', 1,
		function () { return (autoTrimpSettings.Hhs.enabled && autoTrimpSettings.HhsStaff.enabled) });

	//Heirloom Swapping
	createSetting('Rhs', 'Heirloom Swapping', 'Heirloom swapping master button. Turn this on to allow heirloom swapping and its associated settings. ', 'boolean', false, null, 'Heirlooms', 2);
	createSetting('RhsMapSwap', 'Map Swap', 'Toggle to swap to your afterpush shield when inside maps', 'boolean', false, null, 'Heirlooms', 2,
		function () { return (autoTrimpSettings.Rhs.enabled) });
	createSetting('RhsVoidSwap', 'Void PB Swap', 'Toggle to swap to your initial shield when your current enemy is slow and the next enemy is fast to maximise plaguebringer damage.<br><br>Will only run during Void Maps that aren\'t double attack and won\'t function properly if your Initial Shield has PlagueBringer or your Afterpush shield doesn\'t have PlagueBringer.', 'boolean', false, null, 'Heirlooms', 2,
		function () { return (autoTrimpSettings.Rhs.enabled) });

	//Shield swapping
	createSetting('RhsShield', 'Shields', 'Toggle to swap Shields', 'boolean', false, null, 'Heirlooms', 2,
		function () { return (autoTrimpSettings.Rhs.enabled) });
	createSetting('RhsInitial', 'Initial', '<b>First Heirloom to use</b><br><br>Enter the name of your first heirloom. This is the heirloom that you will use before swapping to the second heirloom at the zone you have defined in the HS: Zone. ', 'textValue', 'undefined', null, 'Heirlooms', 2,
		function () { return (autoTrimpSettings.Rhs.enabled && autoTrimpSettings.RhsShield.enabled) });
	createSetting('RhsAfterpush', 'Afterpush', '<b>Second Heirloom to use</b><br><br>Enter the name of your second heirloom. This is the heirloom that you will use after swapping from the first heirloom at the zone you have defined in the HS: Zone. ', 'textValue', 'undefined', null, 'Heirlooms', 2,
		function () { return (autoTrimpSettings.Rhs.enabled && autoTrimpSettings.RhsShield.enabled) });
	createSetting('RhsC3', 'C3', '<b>C3 heirloom to use</b><br><br>Enter the name of the heirloom you would like to use during C3\s and special challenges (Mayhem, Pandemonium).', 'textValue', 'undefined', null, 'Heirlooms', 2,
		function () { return (autoTrimpSettings.Rhs.enabled && autoTrimpSettings.RhsShield.enabled) });
	createSetting('RhsSwapZone', 'Swap Zone', 'Which zone to swap from your first heirloom you have defined to your second heirloom you have defined. I.e if this value is 75 it will switch to the second heirloom <b>on z75</b>', 'value', '-1', null, 'Heirlooms', 2,
		function () { return (autoTrimpSettings.Rhs.enabled && autoTrimpSettings.RhsShield.enabled) });
	createSetting('RhsDailySwapZone', 'Daily Swap Zone', 'Which zone to swap from your first heirloom you have defined to your second heirloom you have defined. I.e if this value is 75 it will switch to the second heirloom <b>on z75</b>', 'value', '-1', null, 'Heirlooms', 2,
		function () { return (autoTrimpSettings.Rhs.enabled && autoTrimpSettings.RhsShield.enabled) });
	createSetting('RhsC3SwapZone', 'C3 Swap Zone', 'Which zone to swap from your first heirloom you have defined to the C3 heirloom you have defined. I.e if this value is 75 it will switch to the C3 heirloom <b>on z75</b>', 'value', -1, null, 'Heirlooms', 2,
		function () { return (autoTrimpSettings.Rhs.enabled && autoTrimpSettings.RhsShield.enabled) });

	//Staff swapping
	createSetting('RhsStaff', 'Staffs', 'Toggle to swap Staffs', 'boolean', false, null, 'Heirlooms', 2,
		function () { return (autoTrimpSettings.Rhs.enabled) });
	createSetting('RhsWorldStaff', 'World', '<b>World Staff</b><br><br>Enter the name of your world staff.', 'textValue', 'undefined', null, 'Heirlooms', 2,
		function () { return (autoTrimpSettings.Rhs.enabled && autoTrimpSettings.RhsStaff.enabled) });
	createSetting('RhsMapStaff', 'Map', '<b>General Map Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside maps, will be overwritten by the proceeding 3 heirloom settings if they\'re being used otherwise will work in every maptype.', 'textValue', 'undefined', null, 'Heirlooms', 2,
		function () { return (autoTrimpSettings.Rhs.enabled && autoTrimpSettings.RhsStaff.enabled) });
	createSetting('RhsFoodStaff', 'Savory Cache', '<b>Savory Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Savory Cache maps. Will use this staff for Tribute farming if it\'s enabled.', 'textValue', 'undefined', null, 'Heirlooms', 2,
		function () { return (autoTrimpSettings.Rhs.enabled && autoTrimpSettings.RhsStaff.enabled) });
	createSetting('RhsWoodStaff', 'Wooden Cache', '<b>Wooden Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Wooden Cache maps.', 'textValue', 'undefined', null, 'Heirlooms', 2,
		function () { return (autoTrimpSettings.Rhs.enabled && autoTrimpSettings.RhsStaff.enabled) });
	createSetting('RhsMetalStaff', 'Metal Cache', '<b>Metal Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Metal Cache maps.', 'textValue', 'undefined', null, 'Heirlooms', 2,
		function () { return (autoTrimpSettings.Rhs.enabled && autoTrimpSettings.RhsStaff.enabled) });
	createSetting('RhsResourceStaff', 'Resource Cache', '<b>Resource Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Resource (Science) Cache maps.', 'textValue', 'undefined', null, 'Heirlooms', 2,
		function () { return (autoTrimpSettings.Rhs.enabled && autoTrimpSettings.RhsStaff.enabled) });

	//Heirloom Line
	createSetting('autoheirlooms', 'Auto Heirlooms', 'Auto Heirlooms master button. Turn this on to enable all Auto Heirloom settings. <br><br><b>The Modifier points will be explained here.</b> The more points an heirloom has, the better chance it has of being kept. If empty is selected, it will muliplty the score by 4. If any is selected, it will multiply the score of the heirloom by 2. <br><br>E.g Mod 1 = CC (+6 if dropped, 1st modifier) <br>Mod 2 = CD (+5 if dropped, 2nd modifier) <br>Mod 3 = PB (+4 if dropped, 3rd modifier) <br>Mod 4 = Empty (x4 if dropped, +0 if not) <br>Mod 5 = Empty (x4 if dropped, +0 if not) <br><br>If an heirloom dropped with these exact modifiers, it would get a score of 192 (6+5+4*4*4=240). The highest point heirlooms will be kept. ', 'boolean', false, null, 'Heirlooms', null);
	createSetting('typetokeep', ['None', 'Shields', 'Staffs', 'Cores', 'All'], '<b>Shields: </b>Keeps Shields and nothing else.<br><b>Staffs: </b>Keeps Staffs and nothing else.<br><b>Cores: </b>Keeps Cores and nothing else.<br><b>All: </b>Keeps 4 Shields and 3 Staffs and 3 Cores. If you have protected heirlooms in your inventory it will overrite one slot. E.g if one heirloom is protected, you will keep 4 Shields and 3 Staffs and 2 Cores. ', 'multitoggle', 0, null, 'Heirlooms', null,
		function () { return (autoTrimpSettings.autoheirlooms.enabled) });
	createSetting('raretokeep', 'Rarity to Keep', 'Auto Heirlooms. Keeps the selected rarity of heirloom, recycles all others. ', 'dropdown', 'Any', ["None", "Common", "Uncommon", "Rare", "Epic", "Legendary", "Magnificent", "Ethereal", "Magmatic", "Plagued", "Radiating", "Hazardous", "Enigmatic"], 'Heirlooms', null,
		function () { return (autoTrimpSettings.autoheirlooms.enabled) });
	createSetting('autoheirloomsperfect', 'Only Perfect', 'Will make sure that Auto Heirlooms will only keep heirlooms that have the mods you selected on them. Be warned you have to ensure that all modifier slots have been selected when using this setting or it won\'t function properly.', 'boolean', false, null, 'Heirlooms', null,
		function () { return (autoTrimpSettings.autoheirlooms.enabled) });

	//Shield Line
	createSetting('keepshields', 'Shields', 'Auto Heirlooms. Enables in-depth shield settings. ', 'boolean', false, null, 'Heirlooms', null,
		function () { return (autoTrimpSettings.autoheirlooms.enabled) });
	createSetting('slot1modsh', 'Shield: Modifier 1', 'Auto Heirlooms. Keeps Shields with selected Mod. Modifier 1 is worth 6 points. ', 'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms', null,
		function () {
			const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
			return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepshields.enabled && heirloomType.indexOf(autoTrimpSettings.raretokeep.selected) >= 0)
		});
	createSetting('slot2modsh', 'Shield: Modifier 2', 'Auto Heirlooms. Keeps Shields with selected Mod. Modifier 2 is worth 5 points. ', 'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms', null,
		function () {
			const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
			return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepshields.enabled && heirloomType.indexOf(autoTrimpSettings.raretokeep.selected) >= 1)
		});
	createSetting('slot3modsh', 'Shield: Modifier 3', 'Auto Heirlooms. Keeps Shields with selected Mod. Modifier 3 is worth 4 points. ', 'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms', null,
		function () {
			const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
			return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepshields.enabled && heirloomType.indexOf(autoTrimpSettings.raretokeep.selected) >= 2)
		});
	createSetting('slot4modsh', 'Shield: Modifier 4', 'Auto Heirlooms. Keeps Shields with selected Mod. Modifier 4 is worth 3 points. ', 'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms', null,
		function () {
			const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
			return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepshields.enabled && heirloomType.indexOf(autoTrimpSettings.raretokeep.selected) >= 5)
		});
	createSetting('slot5modsh', 'Shield: Modifier 5', 'Auto Heirlooms. Keeps Shields with selected Mod. Modifier 5 is worth 2 points. ', 'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms', null,
		function () {
			const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
			return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepshields.enabled && heirloomType.indexOf(autoTrimpSettings.raretokeep.selected) >= 8)
		});
	createSetting('slot6modsh', 'Shield: Modifier 6', 'Auto Heirlooms. Keeps Shields with selected Mod. Modifier 6 is worth 1 points. ', 'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms', null,
		function () {
			const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
			return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepshields.enabled && heirloomType.indexOf(autoTrimpSettings.raretokeep.selected) >= 9)
		});
	createSetting('slot7modsh', 'Shield: Modifier 7', 'Auto Heirlooms. Keeps Shields with selected Mod. Modifier 7 is worth 1 points. ', 'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms', null,
		function () {
			const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
			return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepshields.enabled && heirloomType.indexOf(autoTrimpSettings.raretokeep.selected) >= 11)
		});

	//Staff Line
	createSetting('keepstaffs', 'Staffs', 'Auto Heirlooms. Enables in-depth staff settings. ', 'boolean', false, null, 'Heirlooms', null,
		function () { return (autoTrimpSettings.autoheirlooms.enabled) });
	createSetting('slot1modst', 'Staff: Modifier 1', 'Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 1 is worth 6 points. ', 'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "MinerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms', null,
		function () {
			const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
			return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepstaffs.enabled && heirloomType.indexOf(autoTrimpSettings.raretokeep.selected) >= 0)
		});
	createSetting('slot2modst', 'Staff: Modifier 2', 'Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 2 is worth 5 points. ', 'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "MinerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms', null,
		function () {
			const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
			return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepstaffs.enabled && heirloomType.indexOf(autoTrimpSettings.raretokeep.selected) >= 1)
		});
	createSetting('slot3modst', 'Staff: Modifier 3', 'Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 3 is worth 4 points. ', 'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "MinerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms', null,
		function () {
			const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
			return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepstaffs.enabled && heirloomType.indexOf(autoTrimpSettings.raretokeep.selected) >= 2)
		});
	createSetting('slot4modst', 'Staff: Modifier 4', 'Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 4 is worth 3 points. ', 'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "MinerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms', null,
		function () {
			const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
			return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepstaffs.enabled && heirloomType.indexOf(autoTrimpSettings.raretokeep.selected) >= 5)
		});
	createSetting('slot5modst', 'Staff: Modifier 5', 'Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 5 is worth 2 points. ', 'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "MinerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms', null,
		function () {
			const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
			return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepstaffs.enabled && heirloomType.indexOf(autoTrimpSettings.raretokeep.selected) >= 7)
		});
	createSetting('slot6modst', 'Staff: Modifier 6', 'Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 6 is worth 1 points. ', 'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "MinerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms', null,
		function () {
			const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
			return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepstaffs.enabled && heirloomType.indexOf(autoTrimpSettings.raretokeep.selected) >= 9)
		});
	createSetting('slot7modst', 'Staff: Modifier 7', 'Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 7 is worth 1 points. ', 'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "MinerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms', null,
		function () {
			const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
			return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepstaffs.enabled && heirloomType.indexOf(autoTrimpSettings.raretokeep.selected) >= 11)
		});

	//Core Line
	createSetting('keepcores', 'Cores', 'Auto Heirlooms. Enables in-depth core settings. ', 'boolean', false, null, 'Heirlooms', 1,
		function () { return (autoTrimpSettings.autoheirlooms.enabled) });
	createSetting('slot1modcr', 'Cores: Modifier 1', 'Auto Heirlooms. Keeps Cores with selected Mod. Modifier 1 is worth 5 points. ', 'dropdown', 'empty', ["empty", "fireTrap", "poisonTrap", "lightningTrap", "runestones", "strengthEffect", "condenserEffect"], 'Heirlooms', 1,
		function () { return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepcores.enabled) });
	createSetting('slot2modcr', 'Cores: Modifier 2', 'Auto Heirlooms. Keeps Cores with selected Mod. Modifier 2 is worth 4 points. ', 'dropdown', 'empty', ["empty", "fireTrap", "poisonTrap", "lightningTrap", "runestones", "strengthEffect", "condenserEffect"], 'Heirlooms', 1,
		function () { return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepcores.enabled) });
	createSetting('slot3modcr', 'Cores: Modifier 3', 'Auto Heirlooms. Keeps Cores with selected Mod. Modifier 3 is worth 3 points. ', 'dropdown', 'empty', ["empty", "fireTrap", "poisonTrap", "lightningTrap", "runestones", "strengthEffect", "condenserEffect"], 'Heirlooms', 1,
		function () { return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepcores.enabled) });
	createSetting('slot4modcr', 'Cores: Modifier 4', 'Auto Heirlooms. Keeps Cores with selected Mod. Modifier 4 is worth 2 points. ', 'dropdown', 'empty', ["empty", "fireTrap", "poisonTrap", "lightningTrap", "runestones", "strengthEffect", "condenserEffect"], 'Heirlooms', 1,
		function () { return (autoTrimpSettings.autoheirlooms.enabled && autoTrimpSettings.keepcores.enabled) });

	//--------------------------------------------------------------

	//Golden
	//Helium
	createSetting('hAutoGoldenPopup', 'Auto Gold Settings', 'Click to adjust settings. ', 'action', 'MAZLookalike("Auto Golden", "hAutoGolden", "MAZ")', null, 'Golden', 1);
	createSetting('hAutoGoldenSettings', 'C3 AutoGoldenUpgrades', 'Contains arrays for this setting', 'mazArray', [], null, 'Golden', 1);
	createSetting('hAutoGoldenDailyPopup', 'Daily Auto Gold Settings', 'Click to adjust settings. ', 'action', 'MAZLookalike("Daily Auto Golden", "hAutoGoldenDaily", "MAZ")', null, 'Golden', 1);
	createSetting('hAutoGoldenDailySettings', 'C3 AutoGoldenUpgrades', 'Contains arrays for this setting', 'mazArray', [], null, 'Golden', 1);
	createSetting('hAutoGoldenC3Popup', 'C3 Auto Gold Settings', 'Click to adjust settings. ', 'action', 'MAZLookalike("C3 Auto Golden", "hAutoGoldenC3", "MAZ")', null, 'Golden', 1);
	createSetting('hAutoGoldenC3Settings', 'C3 AutoGoldenUpgrades', 'Contains arrays for this setting', 'mazArray', [], null, 'Golden', 1);

	createSetting('rAutoGoldenPopup', 'Auto Gold Settings', 'Click to adjust settings. ', 'action', 'MAZLookalike("Auto Golden", "rAutoGolden", "MAZ")', null, 'Golden', 2);
	createSetting('rAutoGoldenSettings', 'C3 AutoGoldenUpgrades', 'Contains arrays for this setting', 'mazArray', [], null, 'Golden', 2);
	createSetting('rAutoGoldenDailyPopup', 'Daily Auto Gold Settings', 'Click to adjust settings. ', 'action', 'MAZLookalike("Daily Auto Golden", "rAutoGoldenDaily", "MAZ")', null, 'Golden', 2);
	createSetting('rAutoGoldenDailySettings', 'C3 AutoGoldenUpgrades', 'Contains arrays for this setting', 'mazArray', [], null, 'Golden', 2);
	createSetting('rAutoGoldenC3Popup', 'C3 Auto Gold Settings', 'Click to adjust settings. ', 'action', 'MAZLookalike("C3 Auto Golden", "rAutoGoldenC3", "MAZ")', null, 'Golden', 2);
	createSetting('rAutoGoldenC3Settings', 'C3 AutoGoldenUpgrades', 'Contains arrays for this setting', 'mazArray', [], null, 'Golden', 2);

	//--------------------------------------------------------------

	//Nature
	//Tokens
	createSetting('AutoNatureTokens', 'Spend Nature Tokens', '<b>MASTER BUTTON</b> Automatically spend or convert nature tokens.', 'boolean', false, null, 'Nature', 1);
	createSetting('tokenthresh', 'Token Threshold', 'If Tokens would go below this value it will not convert tokens. ', 'value', -1, null, 'Nature', 1,
		function () { return (autoTrimpSettings.AutoNatureTokens.enabled) });
	createSetting('AutoPoison', 'Poison', 'Spend/convert Poison tokens', 'dropdown', 'Off', ['Off', 'Empowerment', 'Transfer', 'Convert to Wind', 'Convert to Ice', 'Convert to Both'], 'Nature', 1,
		function () { return (autoTrimpSettings.AutoNatureTokens.enabled) });
	createSetting('AutoWind', 'Wind', 'Spend/convert Wind tokens', 'dropdown', 'Off', ['Off', 'Empowerment', 'Transfer', 'Convert to Poison', 'Convert to Ice', 'Convert to Both'], 'Nature', 1,
		function () { return (autoTrimpSettings.AutoNatureTokens.enabled) });
	createSetting('AutoIce', 'Ice', 'Spend/convert Ice tokens', 'dropdown', 'Off', ['Off', 'Empowerment', 'Transfer', 'Convert to Poison', 'Convert to Wind', 'Convert to Both'], 'Nature', 1,
		function () { return (autoTrimpSettings.AutoNatureTokens.enabled) });

	//Enlights
	createSetting('autoenlight', 'Enlight: Auto', 'Enables Automatic Enlightenment. Use the settings to define how it works. ', 'boolean', false, null, 'Nature', 1);
	createSetting('pfillerenlightthresh', 'E: F: Poison', 'Activate Poison Enlight when Enlight cost is below this Thresh in Fillers. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature', 1,
		function () { return (autoTrimpSettings.autoenlight.enabled) });
	createSetting('wfillerenlightthresh', 'E: F: Wind', 'Activate Wind Enlight when Enlight cost is below this Thresh in Fillers. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature', 1,
		function () { return (autoTrimpSettings.autoenlight.enabled) });
	createSetting('ifillerenlightthresh', 'E: F: Ice', 'Activate Ice Enlight when Enlight cost is below this Thresh in Fillers. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature', 1,
		function () { return (autoTrimpSettings.autoenlight.enabled) });
	createSetting('pdailyenlightthresh', 'E: D: Poison', 'Activate Poison Enlight when Enlight cost is below this Thresh in Dailies. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature', 1,
		function () { return (autoTrimpSettings.autoenlight.enabled) });
	createSetting('wdailyenlightthresh', 'E: D: Wind', 'Activate Wind Enlight when Enlight cost is below this Thresh in Dailies. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature', 1,
		function () { return (autoTrimpSettings.autoenlight.enabled) });
	createSetting('idailyenlightthresh', 'E: D: Ice', 'Activate Ice Enlight when Enlight cost is below this Thresh in Dailies. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature', 1,
		function () { return (autoTrimpSettings.autoenlight.enabled) });
	createSetting('pc2enlightthresh', 'E: C: Poison', 'Activate Poison Enlight when Enlight cost is below this Thresh in C2s. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature', 1,
		function () { return (autoTrimpSettings.autoenlight.enabled) });
	createSetting('wc2enlightthresh', 'E: C: Wind', 'Activate Wind Enlight when Enlight cost is below this Thresh in C2s. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature', 1,
		function () { return (autoTrimpSettings.autoenlight.enabled) });
	createSetting('ic2enlightthresh', 'E: C: Ice', 'Activate Ice Enlight when Enlight cost is below this Thresh in C2s. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature', 1,
		function () { return (autoTrimpSettings.autoenlight.enabled) });

	//Display
	createSetting('EnhanceGrids', 'Enhance Grids', 'Apply slight visual enhancements to world and map grids that highlights with drop shadow all the exotic, powerful, skeletimps and other special imps.', 'boolean', false, null, 'Display', null);
	createSetting('showbreedtimer', 'Enable Breed Timer', 'Enables the display of the hidden breedtimer. Turn this off to reduce memory. ', 'boolean', true, null, 'Display', 1);
	createSetting('showautomapstatus', 'Enable AutoMap Status', 'Enables the display of the map status. Turn this off to reduce memory. ', 'boolean', true, null, 'Display', 1);
	createSetting('showhehr', 'Enable He/hr status', 'Enables the display of your helium per hour. Turn this off to reduce memory. ', 'boolean', true, null, 'Display', 1);
	createSetting('Rshowautomapstatus', 'Enable AutoMap Status', 'Enables the display of the map status. Turn this off to reduce memory. ', 'boolean', true, null, 'Display', 2);
	createSetting('Rshowrnhr', 'Enable Rn/hr status', 'Enables the display of your radon per hour. Turn this off to reduce memory. ', 'boolean', true, null, 'Display', 2);
	createSetting('rMapRepeatCount', 'Map Count Output', 'When you finish doing farming for any types of special farming this setting will display a message stating the amount of maps it took to complete and the time it took (format is h:m:s).', 'boolean', true, null, 'Display', null);
	createSetting('rDisplayAllSettings', 'Display all u2 settings', 'Will display all of the locked settings that have HZE requirements to be displayed.', 'boolean', true, null, 'Display', 2);
	createSetting('debugEqualityStats', 'debugEqualityStats', 'Will display details of trimp/enemy stats when you gamma burst.', 'boolean', false, null, 'Display', 2);
	createSetting('automateSpireAssault', 'Automate Spire Assault', 'Automates Spire Assault gear swaps from level 92 up to level 128. HIGHLY RECOMMENDED THAT YOU DO NOT USE THIS SETTING.', 'boolean', false, null, 'Display', 2);

	createSetting('EnableAFK', 'Go AFK Mode', '(Action Button). Go AFK uses a Black Screen, and suspends ALL the Trimps GUI visual update functions (updateLabels) to improve performance by not doing unnecessary stuff. This feature is primarily just a CPU and RAM saving mode. Everything will resume when you come back and press the Back button. Console debug output is also disabled. The blue color means this is not a settable setting, just a button. You can now also click the Zone # (World Info) area to go AFK now.', 'action', 'MODULES["performance"].EnableAFKMode()', null, 'Display', null);
	document.getElementById('battleSideTitle').setAttribute('onclick', 'MODULES["performance"].EnableAFKMode()');

	document.getElementById('showautomapstatus').setAttribute('onclick', 'toggleStatus()');
	document.getElementById('Rshowautomapstatus').setAttribute('onclick', 'toggleRadonStatus()');
	document.getElementById('showhehr').setAttribute('onclick', 'toggleHeHr()');
	document.getElementById('Rshowrnhr').setAttribute('onclick', 'toggleRnHr()');

	//Sorting out spacing issues with swapping between Helium & Radon settings.
	document.getElementById('radonsettings').setAttribute('onclick', 'settingChanged("radonsettings"), modifyParentNodeUniverseSwap()');
	document.getElementById('autoheirlooms').setAttribute('onclick', 'settingChanged("autoheirlooms"), modifyParentNodeUniverseSwap()');
	document.getElementById('rDisplayAllSettings').setAttribute('onclick', 'settingChanged("rDisplayAllSettings"), modifyParentNodeUniverseSwap()');

	document.getElementById('rHideArchaeology').setAttribute('onclick', 'settingChanged("rHideArchaeology"), modifyParentNode("rHideArchaeology", "Rarchstring3", "hide")');
	modifyParentNode("rHideArchaeology", "Rarchstring3", "hide");

	document.getElementById('rHideExterminate').setAttribute('onclick', 'settingChanged("rHideExterminate"), modifyParentNode("rHideExterminate", "Rexterminateeq", "hide")');
	modifyParentNode("rHideExterminate", "Rexterminateeq", "hide");

	document.getElementById('battleSideTitle').setAttribute('onmouseover', "getZoneStats(event);this.style.cursor='pointer'");

	//SPAM
	createSetting('spamMessages', 'Spam Message Settings', 'Click to adjust settings.', 'mazDefaultArray', {
		General: { enabled: false },
		Fragment: { enabled: false },
		Upgrades: { enabled: false },
		Equipment: { enabled: false },
		Maps: { enabled: false },
		Other: { enabled: false },
		Buildings: { enabled: false },
		Jobs: { enabled: false },
		Zone: { enabled: false },
	}, null, 'Display', null);
	createSetting('SpamGeneral', 'General Spam', 'General Spam = Notification Messages, Auto He/Hr', 'boolean', false, null, 'Display', null);
	createSetting('SpamFragments', 'Fragment Spam', 'Notification Messages about how many fragments your maps cost', 'boolean', false, null, 'Display', null);
	createSetting('SpamUpgrades', 'Upgrades Spam', 'Upgrades Spam', 'boolean', false, null, 'Display', null);
	createSetting('SpamEquipment', 'Equipment Spam', 'Equipment Spam', 'boolean', false, null, 'Display', null);
	createSetting('SpamMaps', 'Maps Spam', 'Maps Spam = Buy,Pick,Run Maps,Recycle,CantAfford', 'boolean', false, null, 'Display', null);
	createSetting('SpamOther', 'Other Spam', 'Other Spam = mostly Better Auto Fight (disable with: MODULES[\\"fight\\"].enableDebug=false ), Trimpicide & AutoBreed/Gene Timer changes, AnalyticsID, etc - a catch all. ', 'boolean', false, null, 'Display', null);
	createSetting('SpamBuilding', 'Building Spam', 'Building Spam = all buildings, even storage', 'boolean', false, null, 'Display', null);
	createSetting('SpamJobs', 'Job Spam', 'Job Spam = All jobs, in scientific notation', 'boolean', false, null, 'Display', null);
	createSetting('SpamGraphs', 'Starting Zone Spam', 'Disables \'Starting new Zone ###\' , RoboTrimp MagnetoShreik, and any future Graph Spam that comes from graph logs.', 'boolean', true, null, 'Display', null);

	createSetting('sitInMaps', 'Sit in maps', 'Will cause AT to go sit in the map chamber when enabled. The \'Sit In Zone\' setting must be setup for this to work properly.', 'boolean', false, null, 'Display', null);
	createSetting('sitInMaps_Zone', 'SIM: Zone', 'AT will go to the map chamber and stop running any maps at this zone.', 'value', -1, null, 'Display', null,
		function () { return (autoTrimpSettings.sitInMaps.enabled) });
	createSetting('sitInMaps_Cell', 'SIM: Cell', 'AT will go to the map chamber and stop running any maps after this cell has been reached.', 'value', -1, null, 'Display', null,
		function () { return (autoTrimpSettings.sitInMaps.enabled) });

	//Export/Import/Default
	createSetting('ImportAutoTrimps', 'Import AutoTrimps', 'Import your AutoTrimps Settings. Asks you to name it as a profile afterwards.', 'infoclick', 'ImportAutoTrimps', null, 'Import Export', null);
	createSetting('ExportAutoTrimps', 'Export AutoTrimps', 'Export your AutoTrimps Settings as a output string text formatted in JSON.', 'infoclick', 'ExportAutoTrimps', null, 'Import Export', null);
	createSetting('DefaultAutoTrimps', 'Reset to Default', 'Reset everything to the way it was when you first installed the script. ', 'infoclick', 'ResetDefaultSettingsProfiles', null, 'Import Export', null);
	createSetting('DownloadDebug', 'Download for debug', 'Will download both your save and AT settings so that they can be debugged easier.', 'action', 'ImportExportTooltip("ExportAutoTrimps","update",true)', null, 'Import Export', null);
	createSetting('CleanupAutoTrimps', 'Cleanup Saved Settings ', 'Deletes old values from previous versions of the script from your AutoTrimps Settings file.', 'infoclick', 'CleanupAutoTrimps', null, 'Import Export', null);
	settingsProfileMakeGUI();

}

initializeAllSettings();
automationMenuInit();
updateATVersion();
modifyParentNodeUniverseSwap();

function modifyParentNodeUniverseSwap() {

	radonon = getPageSetting('radonsettings') === 1 ? 'show' : 'hide'
	radonon_mayhem = getPageSetting('radonsettings') === 1 && (getPageSetting('rDisplayAllSettings') || game.global.mayhemCompletions < 25) ? 'show' : 'hide'
	radonon_panda = getPageSetting('radonsettings') === 1 && (getPageSetting('rDisplayAllSettings') || game.global.pandCompletions < 25) ? 'show' : 'hide'
	radonon_heirloom = getPageSetting('radonsettings') === 1 && getPageSetting('autoheirlooms') ? 'show' : 'hide'
	radonoff = getPageSetting('radonsettings') === 0 ? 'show' : 'hide'
	radonoff_heirloom = getPageSetting('radonsettings') === 0 && getPageSetting('autoheirlooms') ? 'show' : 'hide'

	//Core
	//Helium Settings
	modifyParentNode_Initial("amalcoordz", radonoff);
	//Radon Settings
	modifyParentNode_Initial("RPerkSwapping", radonon);

	//Dailies
	//Helium Settings
	modifyParentNode_Initial("dscryvoidmaps", radonoff);
	modifyParentNode_Initial("dPreSpireNurseries", radonoff);
	modifyParentNode_Initial("liqstack", radonoff);
	//Radon Settings
	modifyParentNode_Initial("rAutoEqualityEmpower", radonon);
	modifyParentNode_Initial("RdHeliumHrBuffer", radonon);

	//Maps
	//Helium Settings
	modifyParentNode_Initial("scryvoidmaps", radonoff);
	modifyParentNode_Initial("hBoneShrinePopup", radonoff);

	//Radon Settings
	modifyParentNode_Initial("rUniqueMapPopup", radonon);
	modifyParentNode_Initial("rWorshipperFarmPopup", radonon);

	//Gear
	//Helium
	modifyParentNode_Initial("hEquipEfficientEquipDisplay", radonoff);
	//Radon
	modifyParentNode_Initial("rEquipNoShields", radonon);

	//Spire
	//None!

	//Combat
	//Helium Settings
	modifyParentNode_Initial("45stacks", radonoff);
	//Radon Settings
	//None!

	//ATGA
	//Helium Settings
	modifyParentNode_Initial("ATGA2timer", radonoff);
	//Radon Settings
	//None!

	//C2
	//Helium Settings
	modifyParentNode_Initial("carmormagic", radonoff);
	modifyParentNode_Initial("c2fused", radonoff);
	modifyParentNode_Initial("balanceImprobDestack", radonoff);
	modifyParentNode_Initial("decayStacksToAbandon", radonoff);
	modifyParentNode_Initial("lifeStacks", radonoff);
	modifyParentNode_Initial("mapologyPrestige", radonoff);

	//Radon Settings
	//None!

	//C3
	//Helium Settings
	//None!
	//Radon Settings
	modifyParentNode_Initial("c3GM_ST", radonon);
	modifyParentNode_Initial("c3runnerpercent", radonon);
	modifyParentNode_Initial("rUnbalanceImprobDestack", radonon);
	modifyParentNode_Initial("rTrappaCoords", radonon);
	modifyParentNode_Initial("rQuestSmithyZone", radonon);
	modifyParentNode_Initial("rMayhemMapIncrease", radonon_mayhem);
	modifyParentNode_Initial("rStormStacks", radonon);
	modifyParentNode_Initial("rPandRespecZone", radonon_panda);
	modifyParentNode_Initial("rGlassStacks", radonon);
	if (game.global.stringVersion >= '5.9.0') modifyParentNode_Initial("rWither", radonon);

	//Challenges
	//Helium Settings
	//None!
	//Radon Settings
	modifyParentNode_Initial("rHideExterminate", radonon);

	//Magma
	//Helium Settings
	modifyParentNode_Initial("AutoGenC2", radonoff);
	//Radon Settings
	//None!

	//Heirlooms
	//Helium Settings
	modifyParentNode_Initial("HhsMapSwap", radonoff);
	modifyParentNode_Initial("HhsC3SwapZone", radonoff);
	modifyParentNode_Initial("HhsMetalStaff", radonoff);
	if (getPageSetting('radonsettings') === 0) {
		modifyParentNode_Initial("autoheirloomsperfect", radonoff_heirloom);
		modifyParentNode_Initial("slot7modsh", radonoff_heirloom);
		modifyParentNode_Initial("slot7modst", radonoff_heirloom);
	}
	//Radon Settings
	modifyParentNode_Initial("RhsVoidSwap", radonon);
	modifyParentNode_Initial("RhsC3SwapZone", radonon);
	modifyParentNode_Initial("RhsResourceStaff", radonon);
	if (getPageSetting('radonsettings') === 1) {
		modifyParentNode_Initial("autoheirloomsperfect", radonon_heirloom);
		modifyParentNode_Initial("slot7modsh", radonon_heirloom);
	}
	//Golden Upgrades
	//Helium Settings
	//Radon Settings

	//Nature Upgrades
	//Helium Settings
	modifyParentNode_Initial("AutoIce", radonoff);
	modifyParentNode_Initial("autoenlight", radonoff);
	modifyParentNode_Initial("ifillerenlightthresh", radonoff);
	modifyParentNode_Initial("idailyenlightthresh", radonoff);
	//Radon Settings
	//None!
}

function convertSettings(oldSetting, newSetting, type, newName) {

	if ((autoTrimpSettings[oldSetting].type === 'boolean' && autoTrimpSettings[oldSetting].enabled === false) || ((autoTrimpSettings[oldSetting].type === 'multiValue' || autoTrimpSettings[oldSetting].type === 'value' || autoTrimpSettings[oldSetting].type === 'textValue') && autoTrimpSettings[oldSetting].value === 'undefined') || autoTrimpSettings[oldSetting].type === 'dropdown')
		return

	//var defaultValue = type == 'boolean' ? false : type == 'value' ? '-1' : type == 'multiValue' ? [-1] : '0'
	if (autoTrimpSettings[oldSetting].type === 'boolean' && autoTrimpSettings[newSetting].type === 'boolean' && autoTrimpSettings[oldSetting].enabled === true && autoTrimpSettings[newSetting].enabled !== true) {
		settingChanged(newSetting);
		autoTrimpSettings[oldSetting].enabled = false;
	}
	else if (autoTrimpSettings[oldSetting].value !== 'undefined' && type != 'dropdown' && autoTrimpSettings[newSetting].type !== 'boolean') {
		autoTrimpSettings[newSetting].value = autoTrimpSettings[oldSetting].value;
		autoTrimpSettings[oldSetting].value = 'undefined';
	}
	else
		autoTrimpSettings[oldSetting].value = 'undefined';

}

//function createSetting(id, name, description, type, defaultValue, container, universe, require, list) {
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
				enabled: loaded === undefined ? (defaultValue || false) : loaded,
				enabledU2: loaded === undefined ? (defaultValue || false) : loaded,
				universe: universe
			};
		if (require) autoTrimpSettings[id].require = require
		btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1.1vw; height: auto;");
		btn.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + autoTrimpSettings[id].enabled);
		btn.setAttribute("onclick", 'settingChanged("' + id + '")');
		btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.innerHTML = name;
		btnParent.appendChild(btn);
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);

	} else if (type == 'value' || type == 'valueNegative') {
		if (!(loaded && id == loaded.id && loaded.type === type))
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				value: loaded === undefined ? defaultValue : loaded,
				valueU2: loaded === undefined ? defaultValue : loaded,
				universe: universe
			};
		if (require) autoTrimpSettings[id].require = require
		btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute('class', 'noselect settingsBtn btn-info');
		btn.setAttribute("onclick", `autoSetValueToolTip("${id}", "${name}", ${type == 'valueNegative'}, ${type == 'multiValue'})`);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.innerHTML = name;
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
				value: loaded === undefined ? defaultValue : loaded,
				valueU2: loaded === undefined ? defaultValue : loaded,
				universe: universe
			};
		if (require) autoTrimpSettings[id].require = require
		btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1.1vw; height: auto;");
		btn.setAttribute('class', 'noselect settingsBtn btn-info');
		btn.setAttribute("onclick", `autoSetValueToolTip("${id}", "${name}", ${type == 'valueNegative'}, ${type == 'multiValue'})`);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.innerHTML = name;
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
				value: loaded === undefined ? defaultValue : loaded,
				valueU2: loaded === undefined ? defaultValue : loaded,
				universe: universe
			};
		if (require) autoTrimpSettings[id].require = require
		btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute('class', 'noselect settingsBtn btn-info');
		btn.setAttribute("onclick", `autoSetTextToolTip("${id}", "${name}", ${type == 'textValue'})`);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.innerHTML = name;
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
				value: loaded === undefined ? defaultValue : loaded,
				valueU2: loaded === undefined ? defaultValue : loaded,
				universe: universe
			};
		if (require) autoTrimpSettings[id].require = require
		btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute('class', 'noselect settingsBtn btn-info');
		btn.setAttribute("onclick", `autoSetTextToolTip("${id}", "${name}", ${type == 'textarea'})`);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.innerHTML = name;
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
				selected: loaded === undefined ? defaultValue : loaded,
				selectedU2: loaded === undefined ? defaultValue : loaded,
				universe: universe,
				list: list
			};
		if (require) autoTrimpSettings[id].require = require;
		var btn = document.createElement("select");
		btn.id = id;
		if (game.options.menu.darkTheme.enabled == 2) btn.setAttribute("style", "color: #C8C8C8; font-size: 1.0vw;");
		else btn.setAttribute("style", "color:black; font-size: 1.0vw;");
		btn.setAttribute("class", "noselect");
		btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
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
		dropdownLabel.innerHTML = name + ":";
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
				value: loaded === undefined ? defaultValue || 0 : loaded,
				valueU2: loaded === undefined ? defaultValue || 0 : loaded,
				universe: universe
			};
		btn.setAttribute('class', 'noselect settingsBtn settingBtn3');
		btn.setAttribute("onclick", 'ImportExportTooltip(\'' + defaultValue + '\', \'update\')');
		btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.setAttribute("style", "color: black; background-color: #6495ed; font-size: 1.1vw;");
		btn.innerHTML = name;
		if (require) autoTrimpSettings[id].require = require
		//btnParent.style.width = '';
		btnParent.appendChild(btn);
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);
		return;

	} else if (type == 'mazArray') {
		if (!(loaded && id == loaded.id && loaded.type === type))
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				value: loaded === undefined ? [{ active: false, world: 999, cell: 0, level: 0, repeat: 0, special: 0, gather: 'food', tributes: 0, mets: 0, bogs: 0, insanity: 0, potion: 0, bonfire: 0, boneamount: 0, bonebelow: 0, worshipper: 50, boneruntype: 0, bonegather: 0, buildings: true, done: false, jobratio: '1,1,1,1' }] : loaded,
				valueU2: loaded === undefined ? [{ active: false, world: 999, cell: 0, level: 0, repeat: 0, special: 0, gather: 'food', tributes: 0, mets: 0, bogs: 0, insanity: 0, potion: 0, bonfire: 0, boneamount: 0, bonebelow: 0, worshipper: 50, boneruntype: 0, bonegather: 0, buildings: true, done: false, jobratio: '1,1,1,1' }] : loaded,
				universe: universe
			};
		var btn = document.createElement("select");
		btn.id = id;
		btn.setAttribute('class', 'noselect settingsBtn settingBtn3');
		btn.setAttribute("onclick", 'ImportExportTooltip(\'' + defaultValue + '\', \'update\')');
		btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.setAttribute("style", "color: black; background-color: #6495ed; font-size: 1.1vw;");
		btn.innerHTML = name;
		if (require) autoTrimpSettings[id].require = require
		//btnParent.style.width = '';
		btnParent.appendChild(btn);
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);
		return;

	} else if (type == 'mazDefaultArray') {
		if (!(loaded && id == loaded.id && loaded.type === type))
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				value: loaded === undefined ? defaultValue : loaded,
				valueU2: loaded === undefined ? defaultValue : loaded,
				universe: universe
			};
		var btn = document.createElement("select");
		btn.id = id;
		btn.setAttribute('class', 'noselect settingsBtn settingBtn3');
		btn.setAttribute("onclick", 'ImportExportTooltip(\'' + defaultValue + '\', \'update\')');
		btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.setAttribute("style", "color: black; background-color: #6495ed; font-size: 1.1vw; display: none;");
		btn.innerHTML = name;
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
				value: loaded === undefined ? defaultValue || 0 : loaded,
				valueU2: loaded === undefined ? defaultValue || 0 : loaded,
				universe: universe
			};
		btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1.1vw; height: auto;");
		btn.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + autoTrimpSettings[id].value);
		btn.setAttribute("onclick", 'settingChanged("' + id + '")');
		btn.setAttribute("onmouseover", 'tooltip(\"' + name.join(' / ') + '\", \"customText\", event, \"' + description + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.innerHTML = autoTrimpSettings[id]["name"][autoTrimpSettings[id]["value"]];
		btnParent.appendChild(btn);
		if (require) autoTrimpSettings[id].require = require
		if (id === 'RAutoPortalDaily') {
			btnParent.setAttribute('class', 'toggleConfigBtnLocal settingsBtnLocal settingsBtnfalse')
			btnParent.setAttribute('style', 'max-height: 3.1vh; display: inline-block; vertical-align: top; margin-left: 1vw; margin-bottom: 1vw; width: 13.142vw;border-bottom: 1px solid black !important;')
			btn.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1.1vw; height: auto;")
		}
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);

		if (id === 'RAutoPortalDaily') {

			var autoPortalContainer = document.getElementById("RAutoPortalDailyParent");
			var autoPortalSettings = document.createElement("DIV");
			autoPortalSettings.setAttribute('onclick', 'MAZLookalike("AT Daily Auto Portal", "a", "DailyAutoPortal")');
			autoPortalSettings.setAttribute('class', 'settingsBtnLocalCogwheel');
			autoPortalSettings.setAttribute('style', 'margin-left:-1px;');
			var autoPortalSettingsButton = document.createElement("SPAN");
			autoPortalSettingsButton.setAttribute('class', 'glyphicon glyphicon-cog');
			autoPortalContainer.appendChild(autoPortalSettings);
			autoPortalSettings.appendChild(autoPortalSettingsButton);
		}
	}

	else if (type === 'action') {
		if (!(loaded && id == loaded.id && loaded.type === type))
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				value: loaded === undefined ? defaultValue || 0 : loaded,
				valueU2: loaded === undefined ? defaultValue || 0 : loaded,
				universe: universe
			};
		//btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute('class', 'noselect settingsBtn settingBtn3');
		btn.setAttribute('onclick', defaultValue);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.setAttribute("style", "color: black; background-color: #6495ed; font-size: 1.1vw;");
		btn.innerHTML = name;
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

function settingChanged(id) {
	var btn = autoTrimpSettings[id];
	if (btn.type == 'boolean') {
		btn.enabled = !btn.enabled;
		document.getElementById(id).setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + btn.enabled);
		if (id == 'rEquipEfficientEquipDisplay') {
			displayMostEfficientEquipment();
		}
		if (btn === autoTrimpSettings.RAutoStartDaily) {
			document.getElementById('RAutoStartDaily').setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + btn.enabled);
		}
		if (btn.id === 'Hequipon' || btn.id === 'Requipon') {
			document.getElementById('autoEquipLabel').parentNode.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + btn.enabled);
		}
		if (btn === autoTrimpSettings.BuyBuildingsNew || btn === autoTrimpSettings.RBuyBuildingsNew) {
			document.getElementById('autoStructureLabel').parentNode.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + btn.enabled);
		}
	}
	if (btn.type == 'multitoggle') {
		if (id == 'AutoMagmiteSpender2' && btn.value == 1) {
			magmiteSpenderChanged = true;
			setTimeout(function () {
				magmiteSpenderChanged = false;
			}, 5000);
		}
		btn.value++;
		if (btn.value > btn.name.length - 1)
			btn.value = 0;
		document.getElementById(id).setAttribute('class', 'noselect settingsBtn settingBtn' + (btn.value));
		document.getElementById(id).innerHTML = btn.name[btn.value]
		if (btn.id === 'BuyJobsNew' || btn.id === 'RBuyJobsNew') {
			document.getElementById('autoJobLabel').parentNode.setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + (btn.value == 2 ? 3 : btn.value));
			document.getElementById('autoJobLabel').innerHTML = btn.name[btn.value];
		}
		if (btn.id === 'RAutoPortalDaily') {
			document.getElementById(btn.id).setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + (btn.value == 2 ? 3 : btn.value));
		}
	}
	if (btn.type == 'dropdown') {
		btn.selected = document.getElementById(id).value;
		if (id == "Prestige")
			autoTrimpSettings["PrestigeBackup"] = {
				selected: document.getElementById(id).value,
				name: "PrestigeBackup",
				id: "PrestigeBackup"
			};
		if (id === 'rPrestige')
			autoTrimpSettings["rPrestigeBackup"] = {
				selected: document.getElementById(id).value,
				name: "rPrestigeBackup",
				id: "rPrestigeBackup"
			};
	}

	updateCustomButtons();
	saveSettings();
}

function updateButtonText() {
	var id = game.global.universe === 1 ? 'BuyJobsNew' : 'RBuyJobsNew'
	var btn = autoTrimpSettings[id];
	if (btn.type == 'multitoggle') {
		if (btn.id === 'BuyJobsNew' || btn.id === 'RBuyJobsNew') {
			document.getElementById('autoJobLabel').parentNode.setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + (btn.value == 2 ? 3 : btn.value));
			document.getElementById('autoJobLabel').innerHTML = btn.name[btn.value];
		}
	}

	var id = game.global.universe === 1 ? 'Hequipon' : 'Requipon'
	var btn = autoTrimpSettings[id];
	document.getElementById('autoEquipLabel').parentNode.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + btn.enabled);
}

function modifyParentNode_Initial(id, style) {
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

function modifyParentNode(setting, id, style) {
	var style = !style ? 'show' : style;
	var toggled = style == 'show' ? false : true;
	var elem = document.getElementById(id).parentNode.parentNode.children;
	for (i = 0; i < elem.length; i++) {
		if (document.getElementById(id).parentNode.parentNode.children[i].children[0] === undefined) {
			continue
		}
		else {
			if (document.getElementById(id).parentNode.parentNode.children[i].children[0].id === id || document.getElementById(id).parentNode.parentNode.children[i].children[0].id === (id + 'Label')) {
				if (autoTrimpSettings[setting].enabled == toggled) {
					if (elem.length >= (i + 1)) {
						if (document.getElementById(id).parentNode.parentNode.children[(i + 1)].style.length == 0) {
							document.getElementById(id).parentNode.parentNode.children[(i + 1)].remove()
							break;
						}
					}
				}
				else {
					document.getElementById(id).parentNode.parentNode.children[i].insertAdjacentHTML('afterend', '<br>');
				}
			}
		}
	}
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
	if (highestZone >= 600) heliumChallenges.push("Experience");
	heliumChallenges.push("Custom");
	if (highestZone >= 65) heliumChallenges.push("Challenge 2");

	if (document.getElementById('AutoPortal').children.length !== heliumChallenges.length) {
		document.getElementById('AutoPortal').innerHTML = '';
		for (var item in heliumChallenges) {
			var option = document.createElement("option");
			option.value = heliumChallenges[item];
			option.text = heliumChallenges[item];
			document.getElementById('AutoPortal').appendChild(option);
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
		(document.getElementById('HeliumHourChallenge').children.length || document.getElementById('dHeliumHourChallenge').children.length)
		< heliumHourChallenges.length) {

		document.getElementById('HeliumHourChallenge').innerHTML = '';
		for (var item in heliumHourChallenges) {
			var option = document.createElement("option");
			option.value = heliumHourChallenges[item];
			option.text = heliumHourChallenges[item];
			document.getElementById('HeliumHourChallenge').appendChild(option);
		}
		document.getElementById('dHeliumHourChallenge').innerHTML = document.getElementById('HeliumHourChallenge').innerHTML;

		if (highestZone >= 65) {
			var option = document.createElement("option");
			option.value = 'Challenge 2';
			option.text = 'Challenge 2';
			document.getElementById('dHeliumHourChallenge').appendChild(option);
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

	if (document.getElementById('HeliumC2Challenge').children.length !== challenge2.length) {
		document.getElementById('HeliumC2Challenge').innerHTML = '';
		document.getElementById('dC2Challenge').innerHTML = '';
		for (var item in challenge2) {
			var option = document.createElement("option");
			option.value = challenge2[item];
			option.text = challenge2[item];
			document.getElementById('HeliumC2Challenge').appendChild(option);
		}

		document.getElementById('dC2Challenge').innerHTML = document.getElementById('HeliumC2Challenge').innerHTML;
	}
}

function radonChallengesSetting(hzeCheck) {
	var radonHZE = game.global.highestRadonLevelCleared + 1;
	var radonChallenges = ["Off", "Radon Per Hour"];
	if (radonHZE >= 40) radonChallenges.push("Bublé");
	if (radonHZE >= 55) radonChallenges.push("Melt");
	if (radonHZE >= 70) radonChallenges.push("Quagmire");
	if (radonHZE >= 90) radonChallenges.push("Archaeology");
	if (radonHZE >= 100) radonChallenges.push("Mayhem");
	if (radonHZE >= 110) radonChallenges.push("Insanity");
	if (radonHZE >= 135) radonChallenges.push("Nurture");
	if (radonHZE >= 150) radonChallenges.push("Pandemonium");
	if (radonHZE >= 155) radonChallenges.push("Alchemy");
	if (radonHZE >= 175) radonChallenges.push("Hypothermia");
	if (game.global.stringVersion >= '5.9.0' && radonHZE >= 200) radonChallenges.push('Desolation')
	radonChallenges.push("Custom");
	if (radonHZE >= 50) radonChallenges.push("Challenge 3");

	if (document.getElementById('RAutoPortal').children.length !== radonChallenges.length) {
		document.getElementById('RAutoPortal').innerHTML = '';
		for (var item in radonChallenges) {
			var option = document.createElement("option");
			option.value = radonChallenges[item];
			option.text = radonChallenges[item];
			document.getElementById('RAutoPortal').appendChild(option);
		}
	}

	var radonHourChallenges = ["None"];
	if (radonHZE >= 40) radonHourChallenges.push("Bublé");
	if (radonHZE >= 55) radonHourChallenges.push("Melt");
	if (radonHZE >= 70) radonHourChallenges.push("Quagmire");
	if (radonHZE >= 90) radonHourChallenges.push("Archaeology");
	if (radonHZE >= 110) radonHourChallenges.push("Insanity");
	if (radonHZE >= 135) radonHourChallenges.push("Nurture");
	if (radonHZE >= 155) radonHourChallenges.push("Alchemy");
	if (radonHZE >= 175) radonHourChallenges.push("Hypothermia");
	if (game.global.stringVersion >= '5.9.0' && radonHZE >= 200) radonHourChallenges.push("Desolation");

	if (
		(document.getElementById('RadonHourChallenge').children.length || document.getElementById('RdHeliumHourChallenge').children.length)
		< radonHourChallenges.length) {
		document.getElementById('RadonHourChallenge').innerHTML = '';

		for (var item in radonHourChallenges) {
			var option = document.createElement("option");
			option.value = radonHourChallenges[item];
			option.text = radonHourChallenges[item];
			document.getElementById('RadonHourChallenge').appendChild(option);
		}
		document.getElementById('RdHeliumHourChallenge').innerHTML = document.getElementById('RadonHourChallenge').innerHTML;

		if (radonHZE >= 50) {
			var option = document.createElement("option");
			option.value = 'Challenge 3';
			option.text = 'Challenge 3';
			document.getElementById('RdHeliumHourChallenge').appendChild(option);
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
	if (game.global.stringVersion >= '5.9.0' && radonHZE >= 200) radonChallenge3.push('Desolation')
	if (radonHZE >= 201) radonChallenge3.push("Smithless");

	if (
		(document.getElementById('RadonC3Challenge').children.length || document.getElementById('RdC2Challenge').children.length)
		< radonChallenge3.length) {
		document.getElementById('RadonC3Challenge').innerHTML = '';
		for (var item in radonChallenge3) {
			var option = document.createElement("option");
			option.value = radonChallenge3[item];
			option.text = radonChallenge3[item];
			document.getElementById('RadonC3Challenge').appendChild(option);
		}
		document.getElementById('RdC2Challenge').innerHTML = document.getElementById('RadonC3Challenge').innerHTML;
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
	var elem = document.getElementById("tooltipDiv");
	var tooltipText = 'Type a number below. You can also use shorthand such as 2e5 or 200k.';
	if (negative)
		tooltipText += ' Accepts negative numbers as validated inputs.';
	else
		tooltipText += ' Put -1 for Infinite.';
	tooltipText += `<br/><br/><input id="customNumberBox" style="width: 100%" onkeypress="onKeyPressSetting(event, '${id}', ${negative}, ${multi})" value="${autoTrimpSettings[id].value}"></input>`;
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


		if (autoTrimpSettings["ATversion"].split('v')[1] < '4.5.0') {
			if (typeof (autoTrimpSettings.rTimeFarmSettings.value[0]) !== 'undefined' && autoTrimpSettings.rTimeFarmSettings.value[0].done === undefined) {
				for (var y = 0; y < autoTrimpSettings.rTimeFarmSettings.value.length; y++) {
					autoTrimpSettings.rTimeFarmSettings.value[y].done = 1;
				}
				saveSettings();
			}
		}
		if (autoTrimpSettings["ATversion"].split('v')[1] < '4.6.0') {

			var settings_Atlantrimp = ['rTimeFarmSettings', 'rdTimeFarmSettings', 'rc3TimeFarmSettings']
			for (var x = 0; x < settings_Atlantrimp.length; x++) {
				if (typeof (autoTrimpSettings[settings_Atlantrimp[x]].value[0]) !== 'undefined' && autoTrimpSettings[settings_Atlantrimp[x]].value[0].atlantrimp === undefined) {
					for (var y = 0; y < autoTrimpSettings[settings_Atlantrimp[x]].value.length; y++) {
						autoTrimpSettings[settings_Atlantrimp[x]].value[y].atlantrimp = false;
					}
					saveSettings();
				}
			}

			var settings_Active = ['rTimeFarmSettings', 'rdTimeFarmSettings', 'rc3TimeFarmSettings', 'rTributeFarmSettings', 'rdTributeFarmSettings', 'rc3TributeFarmSettings',
				'rMapBonusSettings', 'rdMapBonusSettings', 'rc3MapBonusSettings', 'rSmithyFarmSettings', 'rdSmithyFarmSettings', 'rc3SmithyFarmSettings', 'rRaidingSettings', 'rdRaidingSettings', 'rc3RaidingSettings',
				'rBoneShrineSettings', 'rQuagSettings', 'rInsanitySettings', 'rAlchSettings', 'rHypoSettings']

			for (var x = 0; x < settings_Active.length; x++) {
				if (typeof (autoTrimpSettings[settings_Active[x]].value[0]) !== 'undefined' && autoTrimpSettings[settings_Active[x]].value[0].active === undefined) {
					for (var y = 0; y < autoTrimpSettings[settings_Active[x]].value.length; y++) {
						autoTrimpSettings[settings_Active[x]].value[y].active = true;
					}
					saveSettings();
				}
			}
		}

		//Adding done settings to Bone Shrine && autoMap to Time, Smtihy && Tribute Farm
		if (autoTrimpSettings["ATversion"].split('v')[1] < '4.7.0') {

			var settings_AtlantrimpDone = ['rBoneShrineSettings']
			for (var x = 0; x < settings_AtlantrimpDone.length; x++) {
				if (typeof (autoTrimpSettings[settings_AtlantrimpDone[x]].value[0]) !== 'undefined' && autoTrimpSettings[settings_AtlantrimpDone[x]].value[0].done === undefined) {
					for (var y = 0; y < autoTrimpSettings[settings_AtlantrimpDone[x]].value.length; y++) {
						autoTrimpSettings[settings_AtlantrimpDone[x]].value[y].done = false;
					}
					saveSettings();
				}
			}
		}
		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.4') {
			if (typeof (autoTrimpSettings.rMapFarmDefaultSettings.value) !== 'undefined' && autoTrimpSettings.rMapFarmDefaultSettings.value.shredMapCap === undefined) {
				autoTrimpSettings.rMapFarmDefaultSettings.value.shredMapCap = 100;
				saveSettings();
			}
			if (typeof (autoTrimpSettings.rHDFarmDefaultSettings.value) !== 'undefined' && autoTrimpSettings.rHDFarmDefaultSettings.value.shredMapCap === undefined) {
				autoTrimpSettings.rHDFarmDefaultSettings.value.shredMapCap = 100;
				saveSettings();
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.1') {
			if (typeof (autoTrimpSettings.rSmithyFarmDefaultSettings.value) !== 'undefined' && autoTrimpSettings.rSmithyFarmDefaultSettings.value.mapType === undefined) {
				autoTrimpSettings.rSmithyFarmDefaultSettings.value.mapType = 'Absolute';
				saveSettings();
			}
			if (typeof (autoTrimpSettings.rSmithyFarmSettings.value[0]) !== 'undefined' && autoTrimpSettings.rSmithyFarmSettings.value[0].mapType === undefined) {
				for (var y = 0; y < autoTrimpSettings.rSmithyFarmSettings.value.length; y++) {
					autoTrimpSettings.rSmithyFarmSettings.value[y].mapType = 'Absolute';
				}
				saveSettings();
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.2') {
			if (typeof (autoTrimpSettings.rSmithyFarmSettings.value[0]) !== 'undefined' && autoTrimpSettings.rSmithyFarmSettings.value[0].meltingPoint === undefined) {
				for (var y = 0; y < autoTrimpSettings.rSmithyFarmSettings.value.length; y++) {
					autoTrimpSettings.rSmithyFarmSettings.value[y].meltingPoint = false;
				}
				saveSettings();
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.3') {
			if (typeof (autoTrimpSettings.rVoidMapSettings.value[0]) !== 'undefined' && autoTrimpSettings.rVoidMapSettings.value[0].voidHDRatio === undefined) {
				for (var y = 0; y < autoTrimpSettings.rVoidMapSettings.value.length; y++) {
					autoTrimpSettings.rVoidMapSettings.value[y].voidHDRatio = 0;
					autoTrimpSettings.rVoidMapSettings.value[y].maxvoidzone = autoTrimpSettings.rVoidMapSettings.value[y].world;
				}
				saveSettings();
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.4') {
			if (typeof (autoTrimpSettings.rHDFarmDefaultSettings.value) !== 'undefined' && autoTrimpSettings.rHDFarmDefaultSettings.value.mapCap === undefined) {
				autoTrimpSettings.rHDFarmDefaultSettings.value.mapCap = 900;
				saveSettings();
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.5') {
			if (typeof (autoTrimpSettings.rVoidMapSettings.value[0]) !== 'undefined' && autoTrimpSettings.rVoidMapSettings.value[0].hdRatio === undefined) {
				for (var y = 0; y < autoTrimpSettings.rVoidMapSettings.value.length; y++) {
					autoTrimpSettings.rVoidMapSettings.value[y].hdRatio = 9999;
				}
				saveSettings();
			}
			changelog.push('Have added HD Ratio to Void Map settings! Will run Voids if either HD Ratio or Void HD Ratio are lower than their respective ratios')
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.6') {
			var settings_List = [
				'rHDFarmSettings', 'rWorshipperFarmSettings', 'rBoneShrineSettings', 'rVoidMapSettings',
				'rMapBonusSettings', 'rMapFarmSettings', 'rTributeFarmSettings', 'rSmithyFarmSettings', 'rRaidingSettings',
				//'rQuagSettings', 'rInsanitySettings', 'rAlchSettings', 'rHypoSettings'
			]

			for (var x = 0; x < settings_List.length; x++) {
				if (typeof (autoTrimpSettings[settings_List[x]].value[0]) !== 'undefined') {
					for (var y = 0; y < autoTrimpSettings[settings_List[x]].value.length; y++) {
						if (autoTrimpSettings[settings_List[x]].value[y].runType === 'Fillers') {
							autoTrimpSettings[settings_List[x]].value[y].runType = 'Filler'
							autoTrimpSettings[settings_List[x]].value[y].challenge = 'All'
						}
						if (autoTrimpSettings[settings_List[x]].value[y].runType === 'C3') {
							autoTrimpSettings[settings_List[x]].value[y].challenge3 = 'All'
						}
					}
					saveSettings();
				}
			}
			changelog.push("Each farming setting now has a Challenge & Challenge 3 dropdown when the Run Type dropdown has either 'Filler' or 'C3' selected. With this you can choose to have seperate settings for your radon challenge or for specific C3s.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.7') {
			changelog.push("Auto Heirlooms has been rewritten. Will now no longer keep heirlooms that aren't the rarity you select in 'Rarity to Keep' and have added a 'Only Perfect' setting to it which will recycle any heirloom that doesn't have the exact mods you desire but be warned you have to ensure that all modifier slots have been selected when using this setting or it won't function properly.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.7.2') {
			var settings_List = ['rVoidMapSettings']

			for (var x = 0; x < settings_List.length; x++) {
				if (typeof (autoTrimpSettings[settings_List[x]].value[0]) !== 'undefined') {
					for (var y = 0; y < autoTrimpSettings[settings_List[x]].value.length; y++) {
						autoTrimpSettings[settings_List[x]].value[y].portalAfter = false;
					}
				}
				saveSettings();
			}
			changelog.push("Added a 'Portal After' setting to Void Map settings. Will cause your portal zone to be set to current zone once your Void Maps have finished running!")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.7.3') {
			changelog.push("Have reworked U1 settings somewhat, added the Map Bonus, Map Farm, Raiding, HD Farm & Bone Shrine settings from u2. Have also reworked BW Raiding and implemented it into the MAZ layout window!.<br>This does mean that I've deleted all of the old raiding, map bonus, BW raiding etc settings, if you need to find out what your settings were before I'd recommend loading Zeks fork to see them as they'll still be intact there.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.7.4') {
			autoTrimpSettings.RdCustomAutoPortal.value = autoTrimpSettings.rDailyPortalSettingsArray.value.portalZone;
			autoTrimpSettings.RdHeliumHourChallenge.value = autoTrimpSettings.rDailyPortalSettingsArray.value.portalChallenge;

			changelog.push("I regret my decision of condensing the daily portal settings into the daily reduction settings window so have reverted that changed.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.7.5') {
			changelog.push("U1 job settings have been converted over to the way that U2 does jobs (button in vanilla jobs tab) also U1 settings that use job ratios should now function properly!<br><br>\
			I converted over the ratio settings for Farmers, Lumberjacks & Miners but you'll need to adjust the other settings yourself.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.7.5') {
			changelog.push("The Heirloom swapping settings from U2 have been added to U1, have deleted all of the old U1 settings as they done the same thing but worse.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.7.6') {
			changelog.push("The Auto Equip swapping settings from U2 have been added to U1, have deleted all of the old U1 settings as they done the same thing but worse. Not 100% tested so if there's any issues let me know.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.7.7') {
			changelog.push("Improved early game U1 a ton. Added challenge settings for Balance, Decay, Life, Mapology which should make the early game challenges a lot easier to play through. <br><br>\
			Changed the way that Golden Upgrades are purchased, has been moved to the MAZ layout with dropdowns for golden type and how many you want to buy to give you more flexibility on what you\'d like to purchase so those will need setup straight away.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.7.8') {
			var settings_List = ['hHDFarmSettings', 'rHDFarmSettings']
			for (var x = 0; x < settings_List.length; x++) {
				if (typeof (autoTrimpSettings[settings_List[x]].value[0]) !== 'undefined') {
					for (var y = 0; y < autoTrimpSettings[settings_List[x]].value.length; y++) {
						autoTrimpSettings[settings_List[x]].value[y].hdType = 'world';
					}
				}
				saveSettings();
			}
			changelog.push("HD Farm now has a HD Type setting to farm different types of HD Ratio. As normal, the different HD Ratio values can be found by mousing over the status display.<br><br>\
			Map HD Ratio assumes a 100% difficulty world level map.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.7.9') {
			changelog.push("Have completely redone the portal code, should work the exact same except to cancel out of a C3 using the 'C3 Finish' setting is now mandatory, AT will no longer autoportal with a c2/c3 active.<br>\
			Have added C2 runner to U2. An extra column has been added to the C2 Table to show which challenges C2 runner can run in each universe. It can run the easy challenges that don't require much intervention so hopefully that can help when updating C3s!")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.8.0') {
			changelog.push("Have reworked the Auto Allocate code for Universe 1 which now uses Perky! If you want the more advanced setting (loot mod, prod mod etc) you'll need to export your save to Perky itself but this version should work well for 99.99% of use cases.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.8.1') {
			var settings_List = ['hRaidingSettings', 'rRaidingSettings', 'hBionicRaidingSettings']
			for (var x = 0; x < settings_List.length; x++) {
				if (typeof (autoTrimpSettings[settings_List[x]].value[0]) !== 'undefined') {
					for (var y = 0; y < autoTrimpSettings[settings_List[x]].value.length; y++) {
						autoTrimpSettings[settings_List[x]].value[y].prestigeGoal = 'All';
					}
				}
				saveSettings();
			}
			var settings_List = ['hRaidingDefaultSettings', 'rRaidingDefaultSettings'];
			for (var x = 0; x < settings_List.length; x++) {
				if (typeof (autoTrimpSettings[settings_List[x]].value.active) !== 'undefined') {
					autoTrimpSettings[settings_List[x]].value.incrementMaps = true;
				}
			}
			saveSettings();
			changelog.push("Prestige Raiding has been rewritten and now allows for you to raid only until certain prestiges have been obtained. There's a dropdown window in all of the raiding settings to input what prestige you'd like to raid for.<br>\
			Additionally the raiding settings will now identify the highest map required to obtain the prestiges you're targetting and reduce the raiding zone accordingly, if this is an issue just let me know and I can change it or make it a toggle!.<br>\
			Lastly, there's now a toggle in the default sections part of the window for Raiding Settings to toggle between just doing 1 difficult map as many times as needed or incrementing map levels so you are gaining equips as you go and getting stronger for each map.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '5.7.5.8.2') {
			var settings_List = ['hRaidingSettings', 'rRaidingSettings']
			for (var x = 0; x < settings_List.length; x++) {
				if (typeof (autoTrimpSettings[settings_List[x]].value[0]) !== 'undefined') {
					for (var y = 0; y < autoTrimpSettings[settings_List[x]].value.length; y++) {
						autoTrimpSettings[settings_List[x]].value[y].repeatevery = 0;
					}
				}
				saveSettings();
			}
			saveSettings();
			changelog.push("Prestige Raiding now has a 'Repeat Every' input similar to Time Farm, Tribute Farm etc which allows for it to repeat the same raid every X zones.")
		}

		autoTrimpSettings["ATversion"] = ATversion;
		printChangelog(changelog);
		verticalCenterTooltip(false, true);
		saveSettings();
	}

	autoTrimpSettings["ATversion"] = ATversion;
	saveSettings();
}

function autoSetTextToolTip(id, text) {
	ranstring = text;
	var elem = document.getElementById("tooltipDiv");
	var tooltipText = 'Type your input below';
	tooltipText += `<br/><br/><input id="customTextBox" style="width: 100%" onkeypress="onKeyPressSetting(event, '${id}')" value="${autoTrimpSettings[id].value}"></input>`;
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
	autoTrimpSettings[id].value = num;
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
	unlockTooltip();
	tooltip('hide');
	var textBox = document.getElementById('customTextBox');
	if (textBox) {
		textVal = textBox.value
	} else return;
	autoTrimpSettings[id].value = textVal;
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
	if (autoTrimpSettings[elem].type === 'dropdown' && document.getElementById(elem).value !== autoTrimpSettings[elem].selected)
		document.getElementById(elem).value = autoTrimpSettings[elem].selected;
}

function turnOff(elem) {
	toggleElem(elem, false);
}

function turnOn(elem, radonon) {
	if (typeof (autoTrimpSettings[elem].require) !== 'undefined') {
		if ((radonon && autoTrimpSettings.rDisplayAllSettings.enabled) || autoTrimpSettings[elem].require()) {
			toggleElem(elem, true);
		}
		else { toggleElem(elem, false); }
	}

	else toggleElem(elem, true);
}

function updateCustomButtons(initialLoad) {
	if (lastTheme && game.options.menu.darkTheme.enabled != lastTheme) {
		if (typeof MODULES["graphs"] !== 'undefined')
			MODULES["graphs"].themeChanged();
		debug("Theme change - AutoTrimps styles updated.");
	}
	lastTheme = game.options.menu.darkTheme.enabled;

	var highestZone = game.global.highestRadonLevelCleared;
	var displayAllSettings = getPageSetting('rDisplayAllSettings');
	//Update portal challenges
	heliumChallengesSetting();
	radonChallengesSetting();

	//Hide settings
	//Radon
	var radonon = getPageSetting('radonsettings') == 1;
	var legacysettings = getPageSetting('radonsettings') == 2;

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
		if (item.type === 'mazArray' || item.type === 'mazDefaultArray') {
			turnOff(setting);
		} else if (item.universe === null ||
			(radonon && item.universe === 2) ||
			(!radonon && item.universe === 1)
		) {
			turnOn(setting, radonon);
		} else {
			turnOff(setting)
		};

		if (initialLoad) {
			if (item.type == 'value' || item.type == 'valueNegative' || item.type == 'multitoggle' || item.type == 'multiValue' || item.type == 'textValue') {
				var elem = document.getElementById(item.id);
				if (elem != null) {
					if (item.type == 'multitoggle')
						elem.innerHTML = item.name[item.value];
					else if (item.type == 'multiValue') {
						if (Array.isArray(item.value) && item.value.length == 1 && item.value[0] == -1)
							elem.innerHTML = item.name + ': ' + "<span class='icomoon icon-infinity'></span>";
						else if (Array.isArray(item.value))
							elem.innerHTML = item.name + ': ' + item.value[0] + '+';
						else
							elem.innerHTML = item.name + ': ' + item.value.toString();
					}
					else if (item.type == 'textValue' && item.value.substring !== undefined) {
						if (item.value.length > 18)
							elem.innerHTML = item.name + ': ' + item.value.substring(0, 21) + '...';
						else
							elem.innerHTML = item.name + ': ' + item.value.substring(0, 21);
					}
					else if (item.value > -1 || item.type == 'valueNegative') {
						elem.innerHTML = item.name + ': ' + prettify(item.value);
					}
					else
						elem.innerHTML = item.name + ': ' + "<span class='icomoon icon-infinity'></span>";
				}
			}
		}
	}


	if (game.global.universe == 1)
		document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + autoTrimpSettings.AutoMaps.value);
	if (game.global.universe == 2)
		document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + autoTrimpSettings.RAutoMaps.value);

	if (document.getElementById('Prestige').selectedIndex > 11 && !game.global.slowDone) {
		document.getElementById('Prestige').selectedIndex = 11;
		autoTrimpSettings.Prestige.selected = "Bestplate";
	}
}



/* function updateCustomButtons(initialLoad) {
	if (lastTheme && game.options.menu.darkTheme.enabled != lastTheme) {
		if (typeof MODULES["graphs"] !== 'undefined')
			MODULES["graphs"].themeChanged();
		debug("Theme change - AutoTrimps styles updated.");
	}
	lastTheme = game.options.menu.darkTheme.enabled;

	var highestZone = game.global.highestRadonLevelCleared;
	var displayAllSettings = autoTrimpSettings.rDisplayAllSettings.enabled;
	//Update portal challenges
	heliumChallengesSetting();
	radonChallengesSetting();

	//Hide settings
	//Radon
	var radonon = getPageSetting('radonsettings') == 1;
	var legacysettings = getPageSetting('radonsettings') == 2;

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
		if (item.type === 'mazArray' || item.type === 'mazDefaultArray') {
			turnOff(setting);
		} else if (item.universe === null ||
			(radonon && item.universe === 2) ||
			(!radonon && item.universe === 1)
		) {
			turnOn(setting, radonon);
		} else {
			turnOff(setting)
		};

		if (initialLoad) {
			if (item.type == 'value' || item.type == 'valueNegative' || item.type == 'multitoggle' || item.type == 'multiValue' || item.type == 'textValue') {
				itemValue = item.value;
				if (item.universe === null && radonon) itemValue = item['value' + 'U2'];
				var elem = document.getElementById(item.id);
				if (elem != null) {
					if (item.type == 'multitoggle')
						elem.innerHTML = item.name[itemValue];
					else if (item.type == 'multiValue') {
						if (Array.isArray(itemValue) && itemValue.length == 1 && itemValue[0] == -1)
							elem.innerHTML = item.name + ': ' + "<span class='icomoon icon-infinity'></span>";
						else if (Array.isArray(itemValue))
							elem.innerHTML = item.name + ': ' + itemValue[0] + '+';
						else
							elem.innerHTML = item.name + ': ' + itemValue.toString();
					}
					else if (item.type == 'textValue' && itemValue.substring !== undefined) {
						if (itemValue.length > 18)
							elem.innerHTML = item.name + ': ' + itemValue.substring(0, 21) + '...';
						else
							elem.innerHTML = item.name + ': ' + itemValue.substring(0, 21);
					}
					else if (itemValue > -1 || item.type == 'valueNegative') {
						elem.innerHTML = item.name + ': ' + prettify(itemValue);
					}
					else
						elem.innerHTML = item.name + ': ' + "<span class='icomoon icon-infinity'></span>";
				}
			}
		}
	}


	if (game.global.universe == 1)
		document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + autoTrimpSettings.AutoMaps.value);
	if (game.global.universe == 2)
		document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + autoTrimpSettings.RAutoMaps.value);

	if (document.getElementById('Prestige').selectedIndex > 11 && !game.global.slowDone) {
		document.getElementById('Prestige').selectedIndex = 11;
		autoTrimpSettings.Prestige.selected = "Bestplate";
	}
} */

function settingUniverse(setting) {
	if (setting === 'buyBuildings') {
		return game.global.universe === 2 ? 'RBuyBuildingsNew' : 'BuyBuildingsNew'
	}
	if (setting === 'equipOn') {
		return game.global.universe === 2 ? 'Requipon' : 'Hequipon'
	}
	if (setting === 'autoJobs') {
		return game.global.universe === 2 ? 'RBuyJobsNew' : 'BuyJobsNew'
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
	var atJobSetting = game.global.universe === 1 ? 'BuyJobsNew' : 'RBuyJobsNew'
	var atJobContainer = document.createElement("DIV");
	atJobContainer.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; float: left; width: 25%; font-size: 0.9vw; height: auto;");
	atJobContainer.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + (autoTrimpSettings[settingUniverse('autoJobs')].value == 2 ? 3 : autoTrimpSettings[atJobSetting].value));
	atJobContainer.setAttribute("onmouseover", 'tooltip(\"Toggle AutoJobs\", \"customText\", event, \"Toggle between the AutoJob settings.\")');
	atJobContainer.setAttribute("onmouseout", 'tooltip("hide")');

	//Text
	var atJobText = document.createElement("DIV");
	atJobText.innerHTML = autoTrimpSettings[atJobSetting].name[autoTrimpSettings[atJobSetting].value];
	atJobText.setAttribute("id", "autoJobLabel");
	atJobText.setAttribute("onClick", "settingChanged(settingUniverse('autoJobs'))");

	//Creating cogwheel & linking onclick
	var atJobSettings = document.createElement("DIV");
	atJobSettings.setAttribute('onclick', 'MAZLookalike("AT AutoJobs", "a", "AutoJobs")');
	var atJobSettingsButton = document.createElement("SPAN");
	atJobSettingsButton.setAttribute('class', 'glyphicon glyphicon-cog');

	var atJobColumn = document.getElementById("jobsTitleDiv").children[0];
	atJobContainer.appendChild(atJobText);
	atJobContainer.appendChild(atJobSettings);
	atJobSettings.appendChild(atJobSettingsButton);
	atJobColumn.insertBefore(atJobContainer, document.getElementById('jobsTitleDiv').children[0].children[2]);

	//AutoStructure Button.
	var atStructureSetting = game.global.universe === 1 ? 'BuyBuildingsNew' : 'RBuyBuildingsNew'
	//Creating button
	var atStructureContainer = document.createElement("DIV");
	atStructureContainer.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; float: left; width: 25%; font-size: 0.9vw; height: auto;");
	atStructureContainer.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + autoTrimpSettings[settingUniverse('buyBuildings')].enabled);
	atStructureContainer.setAttribute("onmouseover", 'tooltip(\"Toggle AutoStructure\", \"customText\", event, \"Toggle between the AutoStructure settings.\")');
	atStructureContainer.setAttribute("onmouseout", 'tooltip("hide")');

	//Text
	var atStructureText = document.createElement("DIV");
	atStructureText.innerHTML = 'AT AutoStructure';
	atStructureText.setAttribute("id", "autoStructureLabel");
	atStructureText.setAttribute("onClick", "settingChanged(settingUniverse('buyBuildings'))");

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
	atStructureColumn.replaceChild(atStructureContainer, document.getElementById('buildingsTitleDiv').children[0].children[1]);

	//AutoEquip Button
	//Creating button
	var atEquipContainer = document.createElement("DIV");
	atEquipContainer.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; float: left; width: 25%; font-size: 0.9vw; height: auto;");
	atEquipContainer.setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings[settingUniverse('equipOn')].enabled);
	atEquipContainer.setAttribute("onmouseover", 'tooltip(\"Toggle atEquip\", \"customText\", event, \"Toggle between the atEquip settings.\")');
	atEquipContainer.setAttribute("onmouseout", 'tooltip("hide")');

	//Text
	var atEquipText = document.createElement("DIV");
	atEquipText.innerHTML = 'AT AutoEquip';
	atEquipText.setAttribute("id", "autoEquipLabel");
	atEquipText.setAttribute("onClick", "settingChanged(settingUniverse('equipOn'))");

	//Setting up positioning
	var atEquipColumn = document.getElementById("equipmentTitleDiv").children[0];
	atEquipContainer.appendChild(atEquipText);
	atEquipColumn.replaceChild(atEquipContainer, document.getElementById('equipmentTitleDiv').children[0].children[2]);

	//autoTrimps Button.
	//Creating button
	var atBtnContainer = document.createElement("DIV");
	atBtnContainer.setAttribute('class', 'btn-group toggleConfigBtnLocal noselect settingsBtn');
	atBtnContainer.setAttribute('role', 'group');
	atBtnContainer.setAttribute("onmouseover", 'tooltip(\"Toggle AutoTrimps Messages\", \"customText\", event, \"Will enable/disable the AutoTrimps messages that you have enabled from appearing in the log window.\")');
	atBtnContainer.setAttribute("onmouseout", 'tooltip("hide")');

	//Text
	var atBtnText = document.createElement("button");
	atBtnText.innerHTML = 'AutoTrimps';
	atBtnText.setAttribute("id", "AutoTrimpsFilter");
	atBtnText.setAttribute('type', 'button');
	atBtnText.setAttribute("onClick", "filterMessage2(\'AutoTrimps\')");
	atBtnText.setAttribute('class', 'btn btn-success logFlt');
	//Setting up positioning
	atBtnContainer.appendChild(atBtnText);
	document.getElementById('logBtnGroup').appendChild(atBtnContainer);

	/* //Creating cogwheel & linking onclick
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
 */
}

function getDailyHeHrStats() { var a = ""; if (challengeActive('Daily')) { var b = game.stats.heliumHour.value() / (game.global.totalHeliumEarned - (game.global.heliumLeftover + game.resources.helium.owned)); b *= 100 + getDailyHeliumValue(countDailyWeight()), a = "<b>After Daily He/Hr: " + b.toFixed(3) + "%" } return a }
function getDailyRnHrStats() { var a = ""; if (challengeActive('Daily')) { var b = game.stats.heliumHour.value() / (game.global.totalRadonEarned - (game.global.radonLeftover + game.resources.radon.owned)); b *= 100 + getDailyHeliumValue(countDailyWeight()), a = "<b>After Daily Rn/Hr: " + b.toFixed(3) + "%" } return a }
function settingsProfileMakeGUI() { }

function toggleAutoMaps() {
	const autoMaps = game.global.universe === 2 ? 'RAutoMaps' : 'AutoMaps';

	if (getPageSetting(autoMaps))
		setPageSetting(autoMaps, 0);
	else
		setPageSetting(autoMaps, 1);

	document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + autoTrimpSettings[autoMaps].value);

	saveSettings();
}

function toggleStatus(update) {
	if (update) {
		if (getPageSetting('showautomapstatus')) {
			document.getElementById('autoMapStatus').parentNode.style = 'display: block; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
			document.getElementById('autoMapStatus').parentNode.setAttribute("onmouseover", 'tooltip(\"Health to Damage ratio\", \"customText\", event, \"This status box displays the current mode Automaps is in. The number usually shown here during Farming or Want more Damage modes is the \'HDratio\' meaning EnemyHealth to YourDamage Ratio (in X stance). Above 16 will trigger farming, above 4 will trigger going for Map bonus up to 10 stacks.\
			<p>\<br>\<b>H:D ratio = </b>\" + prettify(HDRatio)  + \"<br>\
			<b>Map H:D Ratio = </b>\" + prettify(mapHDRatio) + \"<br>\
			<b>Void H:D Ratio = </b>\" + prettify(voidHDRatio) + \"<br>\
			")');
		} else
			document.getElementById('autoMapStatus').parentNode.style = 'display: none; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
		return
	}
	if (getPageSetting('showautomapstatus')) {
		setPageSetting('showautomapstatus', 0);
		if (game.global.universe == 2) {
			turnOff('autoMapStatus')
			document.getElementById('autoMapStatus').parentNode.style = 'display: none; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
		}
	}
	else {
		setPageSetting('showautomapstatus', 1);
		if (game.global.universe == 2) {
			turnOn('autoMapStatus')
			document.getElementById('autoMapStatus').parentNode.style = 'display: block; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
			document.getElementById('autoMapStatus').parentNode.setAttribute("onmouseover", 'tooltip(\"Health to Damage ratio\", \"customText\", event, \"This status box displays the current mode Automaps is in. The number usually shown here during Farming or Want more Damage modes is the \'HDratio\' meaning EnemyHealth to YourDamage Ratio (in X stance). Above 16 will trigger farming, above 4 will trigger going for Map bonus up to 10 stacks.\
			<p>\<br>\<b>H:D ratio = </b>\" + prettify(HDRatio)  + \"<br>\
			<b>Map H:D Ratio = </b>\" + prettify(mapHDRatio) + \"<br>\
			<b>Void H:D Ratio = </b>\" + prettify(voidHDRatio) + \"<br>\
			")');
		}
	}
	saveSettings();
}

function toggleRadonStatus(update) {
	if (update) {
		if (getPageSetting('Rshowautomapstatus')) {
			document.getElementById('autoMapStatus').parentNode.style = 'display: block; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
			document.getElementById('autoMapStatus').parentNode.setAttribute("onmouseover", 'tooltip(\"Health to Damage ratio\", \"customText\", event, \"This status box displays the current mode Automaps is in. The number usually shown here during Farming or Want more Damage modes is the \'HDratio\' meaning EnemyHealth to YourDamage Ratio (in X stance). Above 16 will trigger farming, above 4 will trigger going for Map bonus up to 10 stacks.\
			<p>\<br>\<b>H:D ratio = </b>\" + prettify(HDRatio)  + \"<br>\
			<b>Map H:D Ratio = </b>\" + prettify(mapHDRatio) + \"<br>\
			<b>Void H:D Ratio = </b>\" + prettify(voidHDRatio) + \"<br>\
			")');
		} else
			document.getElementById('autoMapStatus').parentNode.style = 'display: none; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
		return
	}

	if (getPageSetting('Rshowautomapstatus')) {
		setPageSetting('Rshowautomapstatus', 0);
		if (game.global.universe == 2) {
			turnOff('autoMapStatus')
			document.getElementById('autoMapStatus').parentNode.style = 'display: none; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
			document.getElementById('autoMapStatus').parentNode.setAttribute("onmouseover", 'tooltip(\"Health to Damage ratio\", \"customText\", event, \"This status box displays the current mode Automaps is in. The number usually shown here during Farming or Want more Damage modes is the \'HDratio\' meaning EnemyHealth to YourDamage Ratio (in X stance). Above 16 will trigger farming, above 4 will trigger going for Map bonus up to 10 stacks.\
			<p>\<br>\<b>H:D ratio = </b>\" + prettify(HDRatio)  + \"<br>\
			<b>Map H:D Ratio = </b>\" + prettify(mapHDRatio) + \"<br>\
			<b>Void H:D Ratio = </b>\" + prettify(voidHDRatio) + \"<br>\
			")');
		}
	}
	else {
		setPageSetting('Rshowautomapstatus', 1);
		if (game.global.universe == 2) {
			turnOn('autoMapStatus')
			document.getElementById('autoMapStatus').parentNode.style = 'display: block; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
		}
	}
	saveSettings();
}

function toggleHeHr(update, universe) {
	if (update) {
		if (getPageSetting('showhehr')) {
			document.getElementById('hiderStatus').parentNode.style = 'display: block; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
			document.getElementById('hiderStatus').parentNode.setAttribute("onmouseover", 'tooltip(\"Helium/Hr Info\", \"customText\", event, \"1st is Current He/hr % out of Lifetime He(not including current+unspent).<br> 0.5% is an ideal peak target. This can tell you when to portal... <br>2nd is Current run Total He earned / Lifetime He(not including current)<br>\" + getDailyHeHrStats())');
		} else
			document.getElementById('hiderStatus').parentNode.style = 'display: none; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
		return
	}
	if (getPageSetting('showhehr')) {
		setPageSetting('showhehr', 0);
		if (game.global.universe == 1) {
			turnOff('hiderStatus')
			document.getElementById('hiderStatus').parentNode.style = 'display: none; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
		}
	}
	else {
		setPageSetting('showhehr', 1);
		if (game.global.universe == 1) {
			turnOn('hiderStatus');
			document.getElementById('hiderStatus').parentNode.style = 'display: block; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
			document.getElementById('hiderStatus').parentNode.setAttribute("onmouseover", 'tooltip(\"Helium/Hr Info\", \"customText\", event, \"1st is Current He/hr % out of Lifetime He(not including current+unspent).<br> 0.5% is an ideal peak target. This can tell you when to portal... <br>2nd is Current run Total He earned / Lifetime He(not including current)<br>\" + getDailyHeHrStats())');
		}
	}
	saveSettings();
}

function toggleRnHr(update) {
	if (update) {
		if (getPageSetting('Rshowrnhr')) {
			document.getElementById('hiderStatus').parentNode.style = 'display: block; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
			document.getElementById('hiderStatus').parentNode.setAttribute("onmouseover", 'tooltip(\"Radon/Hr Info\", \"customText\", event, \"1st is Current Rn/hr % out of Lifetime Rn(not including current+unspent).<br> 0.5% is an ideal peak target. This can tell you when to portal... <br>2nd is Current run Total Rn earned / Lifetime Rn(not including current)<br>\" + getDailyRnHrStats())');
		} else
			document.getElementById('hiderStatus').parentNode.style = 'display: none; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
		return
	}
	if (getPageSetting('Rshowrnhr')) {
		setPageSetting('Rshowrnhr', 0);
		if (game.global.universe == 2) {
			turnOff('hiderStatus')
			document.getElementById('hiderStatus').parentNode.style = 'display: none; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
		}
	}
	else {
		setPageSetting('Rshowrnhr', 1);
		if (game.global.universe == 2) {
			turnOn('hiderStatus')
			document.getElementById('hiderStatus').parentNode.style = 'display: block; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
			document.getElementById('hiderStatus').parentNode.setAttribute("onmouseover", 'tooltip(\"Radon/Hr Info\", \"customText\", event, \"1st is Current Rn/hr % out of Lifetime Rn(not including current+unspent).<br> 0.5% is an ideal peak target. This can tell you when to portal... <br>2nd is Current run Total Rn earned / Lifetime Rn(not including current)<br>\" + getDailyRnHrStats())');
		}
	}
	saveSettings();
}
