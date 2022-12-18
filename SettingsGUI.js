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
	var newContainer = document.createElement("DIV");
	newContainer.setAttribute("style", "margin-top: 0.2vw; display: block; font-size: 1.1vw; height: 1.5em; text-align: center; border-radius: 4px");
	newContainer.setAttribute("id", "autoMapBtn");
	newContainer.setAttribute("class", "toggleConfigBtn noselect settingsBtn");
	newContainer.setAttribute("onClick", "toggleAutoMaps()");
	newContainer.setAttribute("onmouseover", 'tooltip(\"Toggle Automapping\", \"customText\", event, \"Toggle automapping on and off.\")');
	newContainer.setAttribute("onmouseout", 'tooltip("hide")');
	newContainer.innerHTML = 'Auto Maps';
	var fightButtonCol = document.getElementById("battleBtnsColumn");
	fightButtonCol.appendChild(newContainer);

	newContainer = document.createElement("DIV");
	newContainer.setAttribute("style", "display: none; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);");
	if (game.global.universe == 1) {
		newContainer.setAttribute("onmouseover", 'tooltip(\"Health to Damage ratio\", \"customText\", event, \"This status box displays the current mode Automaps is in. The number usually shown here during Farming or Want more Damage modes is the \'HDratio\' meaning EnemyHealth to YourDamage Ratio (in X stance). Above 16 will trigger farming, above 4 will trigger going for Map bonus up to 10 stacks.<p><b>enoughHealth: </b>\" + enoughHealth + \"<br><b>enoughDamage: </b>\" + enoughDamage +\"<br><b>shouldFarm: </b>\" + shouldFarm +\"<br><b>H:D ratio = </b>\" + calcHDRatio()  + \"<br>\<b>Free void = </b>\" + (game.permaBoneBonuses.voidMaps.tracker/10) + "/10" + \"<br>\")');
	}
	if (game.global.universe == 2) {
		newContainer.setAttribute("onmouseover", 'tooltip(\"Health to Damage ratio\", \"customText\", event, \"This status box displays the current mode Automaps is in.<br>\'H:D ratio\' means EnemyHealth to YourDamage Ratio.<br>When Auto Equality is toggled to \'Advanced\' it will factor in the equality required for the zone too.<p>\<br>\<b>H:D ratio = </b>\" + prettify(HDRatio)  + \"<br>\<b>Void H:D Ratio = </b>\" + prettify(voidHDRatio) + \"<br>\")');

	}
	newContainer.setAttribute("onmouseout", 'tooltip("hide")');
	abutton = document.createElement("SPAN");
	abutton.id = 'autoMapStatus';
	newContainer.appendChild(abutton);
	fightButtonCol.appendChild(newContainer);

	newContainer = document.createElement("DIV");
	newContainer.setAttribute("style", "display: none; font-size: 1vw; text-align: center; margin-top: 2px; background-color: rgba(0,0,0,0.3);");
	if (game.global.universe == 1)
		newContainer.setAttribute("onmouseover", 'tooltip(\"Helium/Hr Info\", \"customText\", event, \"1st is Current He/hr % out of Lifetime He(not including current+unspent).<br> 0.5% is an ideal peak target. This can tell you when to portal... <br>2nd is Current run Total He earned / Lifetime He(not including current)<br>\" + getDailyHeHrStats())');
	else if (game.global.universe == 2)
		newContainer.setAttribute("onmouseover", 'tooltip(\"Radon/Hr Info\", \"customText\", event, \"1st is Current Rn/hr % out of Lifetime Rn(not including current+unspent).<br> 0.5% is an ideal peak target. This can tell you when to portal... <br>2nd is Current run Total Rn earned / Lifetime Rn(not including current)<br>\" + getDailyRnHrStats())');
	newContainer.setAttribute("onmouseout", 'tooltip("hide")');
	abutton = document.createElement("SPAN");
	abutton.id = 'hiderStatus';
	newContainer.appendChild(abutton);
	fightButtonCol.appendChild(newContainer);


	newContainer = document.createElement("DIV");
	newContainer.setAttribute("style", "display: block; font-size: 0.9vw; text-align: centre; background-color: rgba(0, 0, 0, 0.3);");
	abutton = document.createElement("SPAN");
	abutton.id = 'freeVoidMap';
	newContainer.appendChild(abutton);
	fightButtonCol.appendChild(newContainer);
	var fightButtonCol = document.getElementById("trimps");
	fightButtonCol.appendChild(newContainer);

	var $portalTimer = document.getElementById('portalTimer');
	$portalTimer.setAttribute('onclick', 'toggleSetting(\'pauseGame\')');
	$portalTimer.setAttribute('style', 'cursor: default');

	var btns = document.getElementsByClassName("fightBtn");
	for (var x = 0; x < btns.length; x++) {
		btns[x].style.padding = "0.01vw 0.01vw";
	}
}

function automationMenuSettingsInit() { var a = document.getElementById("settingsRow"), b = document.createElement("DIV"); b.id = "autoSettings", b.setAttribute("style", "display: none; max-height: 92.5vh;overflow: auto;"), b.setAttribute("class", "niceScroll"), a.appendChild(b) }
automationMenuSettingsInit();
var link1 = document.createElement("link"); link1.rel = "stylesheet", link1.type = "text/css", link1.href = basepath + "tabs.css", document.head.appendChild(link1); function createTabs(a, b) { var c = document.createElement("li"), d = document.createElement("a"); d.className = "tablinks", d.setAttribute("onclick", "toggleTab(event, '" + a + "')"), d.href = "#", d.appendChild(document.createTextNode(a)), c.id = "tab" + a, c.appendChild(d), addtabsUL.appendChild(c), createTabContents(a, b) }
function createTabContents(a, b) { var c = document.createElement('div'); c.className = 'tabcontent', c.id = a; var d = document.createElement('div'); d.setAttribute('style', 'margin-left: 1vw; margin-right: 1vw;'); var e = document.createElement('h4'); e.setAttribute('style', 'font-size: 1.2vw;'), e.appendChild(document.createTextNode(b)), d.appendChild(e), c.appendChild(d), addTabsDiv.appendChild(c) }
function toggleTab(a, b) { -1 < a.currentTarget.className.indexOf(" active") ? (document.getElementById(b).style.display = "none", a.currentTarget.className = a.currentTarget.className.replace(" active", "")) : (document.getElementById(b).style.display = "block", a.currentTarget.className += " active") }
function minimizeAllTabs() { for (var a = document.getElementsByClassName("tabcontent"), b = 0, c = a.length; b < c; b++)a[b].style.display = "none"; for (var d = document.getElementsByClassName("tablinks"), b = 0, c = d.length; b < c; b++)d[b].className = d[b].className.replace(" active", "") }
function maximizeAllTabs() { for (var a = document.getElementsByClassName("tabcontent"), b = 0, c = a.length; b < c; b++)a[b].style.display = "block"; for (var d = document.getElementsByClassName("tablinks"), b = 0, c = d.length; b < c; b++)d[b].style.display = "block", d[b].className.includes(" active") || (d[b].className += " active") }

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
	createTabs("Raiding", "Raiding - Settings for Raiding");
	createTabs("Daily", "Dailies - Settings for Dailies");
	createTabs("C2", "C2 - Settings for C2s");
	createTabs("C3", "C3 - Settings for C3s and special challenges (Mayhem, Pandemonium)");
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

	var highestZone = game.global.highestRadonLevelCleared;
	//Core

	//Helium Core
	createSetting('ManualGather2', ['Manual Gather/Build', 'Auto Gather/Build', 'Mining/Building Only', 'Science Research OFF'], 'Controls what you gather/build do. Manual does nothing<br>Auto Gathering of Food,Wood,Metal(w/turkimp) & Science. Auto speed-Builds your build queue. <br>Mining/Building only does exactly what it says. Only use if you are passed the early stages of the game and have the mastery foremany unlocked (No longer need to trap, food and wood are useless). <br>You can disable science researching for the achievement: Reach Z120 without using manual research.', 'multitoggle', 1, null, 'Core');
	createSetting('gathermetal', 'Metal Only', 'For use with Mining/Gather Only. Only gathers Metal if you have foremany unlocked. ', 'boolean', false, null, "Core");
	createSetting('BuyUpgradesNew', ['Manual Upgrades', 'Buy All Upgrades', 'Upgrades no Coords'], 'Autobuys non-equipment upgrades (equipment is controlled in the Gear tab). The second option does NOT buy coordination (use this <b>ONLY</b> if you know what you\'re doing).', 'multitoggle', 1, null, 'Core');
	createSetting('amalcoord', 'Amal Boost', 'Boost your Amal count for more Mi. Will not buy coords until your H:D ratio is below a certain value. This means that you will get amals quicker. Will not activate higher than your Amal Boost End Zone Setting! ', 'boolean', false, null, 'Core');
	createSetting('amalcoordt', 'Amal Target', 'Set the amount of Amals you wish to aim for. Once this target is reached, it will buy coords below your Amal ratio regardless of your H:D, just enough to keep the Amal. -1 to disable and use H:D for entire boost. ', 'value', -1, null, 'Core');
	createSetting('amalcoordhd', 'Amal Boost H:D', 'Set your H:D for Amal Boost here. The higher it is the less coords AT will buy. 0.0000025 is the default. ', 'value', 0.0000025, null, 'Core');
	createSetting('amalcoordz', 'Amal Boost End Z', 'Amal Boost End Zone. Set the zone you want to stop Amal Boosting. -1 to do it infinitely. ', 'value', -1, null, 'Core');
	createSetting('AutoAllocatePerks', ['Auto Allocate Off', 'Auto Allocate On', 'Dump into Looting II'], 'Uses the AutoPerks ratio based preset system to automatically allocate your perks to spend whatever helium you have when you AutoPortal. Does not change Fixed Perks: siphonology, anticipation, meditation, relentlessness, range, agility, bait, trumps, packrat, capable. NEW: Dump into Looting II, dumps all loot gained from previous portal at specified zone', 'multitoggle', 0, null, 'Core');
	createSetting('fastallocate', 'Fast Allocate', 'Turn on if your helium is above 500Qa. Not recommended for low amounts of helium. ', 'boolean', false, null, 'Core');
	createSetting('TrapTrimps', 'Trap Trimps', 'Automatically trap trimps when needed, including building traps. (when you turn this off, you may aswell turn off the in-game autotraps button, think of the starving trimps that could eat that food!)', 'boolean', true, null, 'Core');

	createSetting('AutoPortal', 'AutoPortal', 'Automatically portal. Will NOT auto-portal if you have a challenge active, the challenge setting dictates which challenge it will select for the next run. All challenge settings will portal right after the challenge ends, regardless. Helium Per Hour only <b>portals at cell 1</b> of the first level where your He/Hr went down even slightly compared to the current runs Best He/Hr. Take note, there is a Buffer option, which is like a grace percentage of how low it can dip without triggering. Setting a buffer will portal mid-zone if you exceed 5x of the buffer.  CAUTION: Selecting He/hr may immediately portal you if its lower-(use Pause AutoTrimps button to pause the script first to avoid this)', 'dropdown', 'Off', ['Off', 'Helium Per Hour', 'Balance', 'Decay', 'Electricity', 'Life', 'Crushed', 'Nom', 'Toxicity', 'Watch', 'Lead', 'Corrupted', 'Domination', 'Experience', 'Custom'], 'Core');
	createSetting('HeliumHourChallenge', 'Portal Challenge', 'Automatically portal into this challenge when using helium per hour or custom autoportal. Custom portals after cell 100 of the zone specified. Do not choose a challenge if you havent unlocked it. ', 'dropdown', 'None', ['None', 'Balance', 'Decay', 'Electricity', 'Life', 'Crushed', 'Nom', 'Toxicity', 'Watch', 'Lead', 'Corrupted', 'Domination', 'Experience'], 'Core');
	document.getElementById("HeliumHourChallengeLabel").innerHTML = "Portal Challenge:";
	createSetting('CustomAutoPortal', 'Custom Portal', 'Automatically portal at this zone. (ie: setting to 200 would portal when you reach zone 200)', 'value', '999', null, 'Core');
	createSetting('HeHrDontPortalBefore', 'Don\'t Portal Before', 'Do NOT allow Helium per Hour AutoPortal setting to portal BEFORE this level is reached. It is an additional check that prevents drops in helium/hr from triggering autoportal. Set to 0 or -1 to completely disable this check. (only shows up with Helium per Hour set)', 'value', '999', null, 'Core');
	createSetting('HeliumHrBuffer', 'He/Hr Portal Buffer %', 'IMPORTANT SETTING. When using the He/Hr Autoportal, it will portal if your He/Hr drops by this amount of % lower than your best for current run, default is 0% (ie: set to 5 to portal at 95% of your best). Now with stuck protection - Allows portaling midzone if we exceed set buffer amount by 5x. (ie a normal 2% buffer setting would now portal mid-zone you fall below 10% buffer).', 'value', '0', null, 'Core');
	createSetting('downloadSaves', 'Download Saves', 'Will automatically download saves whenever AutoTrimps portals.', 'boolean', false, null, 'Core');

	var radonChallenges = ["Off", "Radon Per Hour"];
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 39) radonChallenges.push("Bublé");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 54) radonChallenges.push("Melt");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 69) radonChallenges.push("Quagmire");
	if (getPageSetting('rDisplayAllSettings') || highestZone > 89) radonChallenges.push("Archaeology");
	if (getPageSetting('rDisplayAllSettings') || highestZone > 99) radonChallenges.push("Mayhem");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 109) radonChallenges.push("Insanity");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 134) radonChallenges.push("Nurture");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 149) radonChallenges.push("Pandemonium");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 154) radonChallenges.push("Alchemy");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 174) radonChallenges.push("Hypothermia");
	radonChallenges.push("Custom");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 49) radonChallenges.push("Challenge 3");

	var radonHourChallenges = ["None"];
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 39) radonHourChallenges.push("Bublé");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 54) radonHourChallenges.push("Melt");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 69) radonHourChallenges.push("Quagmire");
	if (getPageSetting('rDisplayAllSettings') || highestZone > 89) radonHourChallenges.push("Archaeology");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 109) radonHourChallenges.push("Insanity");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 134) radonHourChallenges.push("Nurture");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 154) radonHourChallenges.push("Alchemy");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 174) radonHourChallenges.push("Hypothermia");

	var radonChallenge3 = ["None"];
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 14) radonChallenge3.push("Unlucky");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 19) radonChallenge3.push("Downsize");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 24) radonChallenge3.push("Transmute");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 34) radonChallenge3.push("Unbalance");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 44) radonChallenge3.push("Duel");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 59) radonChallenge3.push("Trappapalooza");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 69) radonChallenge3.push("Wither");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 84) radonChallenge3.push("Quest");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 104) radonChallenge3.push("Storm");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 114) radonChallenge3.push("Berserk");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 174) radonChallenge3.push("Glass");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 200) radonChallenge3.push("Smithless");

	var radonBiome = ["Random"];
	radonBiome.push("Mountain");
	radonBiome.push("Forest");
	radonBiome.push("Sea");
	radonBiome.push("Depths");
	if (getPageSetting('rDisplayAllSettings') || game.global.decayDone) radonBiome.push("Gardens");
	if (getPageSetting('rDisplayAllSettings') || game.global.farmlandsUnlocked) radonBiome.push("Farmlands");

	var radonSpecial = ["0"];
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 14) radonSpecial.push('fa');
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 14) radonSpecial.push("lc");
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 24) radonSpecial.push('ssc');
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 24) radonSpecial.push('swc');
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 24) radonSpecial.push('smc');
	if (getPageSetting('rDisplayAllSettings') || game.global.ArchaeologyDone) radonSpecial.push('src');
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 54) radonSpecial.push('p');
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 64) radonSpecial.push('hc');
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 84) radonSpecial.push('lsc');
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 84) radonSpecial.push('lwc');
	if (getPageSetting('rDisplayAllSettings') || highestZone >= 84) radonSpecial.push('lmc');
	if (getPageSetting('rDisplayAllSettings') || game.global.ArchaeologyDone) radonSpecial.push('lrc');


	//Radon Core
	createSetting('RManualGather2', ['Manual Gather/Build', 'Auto Gather/Build', 'Mining/Building Only'], 'Controls what you gather/build do. Manual does nothing<br>Auto Gathering of Food,Wood,Metal(w/turkimp) & Science. Auto speed-Builds your build queue. <br>Mining/Building only does exactly what it says. Only use if you are passed the early stages of the game and have the mastery foremany unlocked (No longer need to trap, food and wood are useless). ', 'multitoggle', 1, null, 'Core');
	createSetting('RTrapTrimps', 'Trap Trimps', 'Automatically trap trimps when needed, including building traps. (when you turn this off, you may aswell turn off the in-game autotraps button, think of the starving trimps that could eat that food!)', 'boolean', true, null, 'Core');
	createSetting('RBuyUpgradesNew', ['Manual Upgrades', 'Buy All Upgrades', 'Upgrades no Coords'], 'Autobuys non-equipment upgrades (equipment is controlled in the Gear tab). The second option does NOT buy coordination (use this <b>ONLY</b> if you know what you\'re doing).', 'multitoggle', 1, null, 'Core');
	createSetting('RAutoAllocatePerks', ['Auto Allocate Off', 'Dump into Looting', 'Dump into Greed', 'Dump into Moti'], 'Dumps all excess radon into the selected perk when AutoPortaling.', 'multitoggle', 0, null, 'Core');
	createSetting('RPerkSwapping', 'Preset Swapping', 'Will automatically load Preset 1 if portaling into a normal run, Preset 2 if portaling into a daily run or Preset 3 if portaling into a C3.<br>Be aware that you need to save your presets when making adjustments or it\'ll revert to the previous one you saved.', 'boolean', false, null, 'Core');

	//Radon Portal
	createSetting('RAutoPortal', 'AutoPortal', 'Automatically portal. Will NOT auto-portal if you have a challenge active, the challenge setting dictates which challenge it will select for the next run. All challenge settings will portal right after the challenge ends, regardless. Radon Per Hour only <b>portals at cell 1</b> of the first level where your Rn/Hr went down even slightly compared to the current runs Best Rn/Hr. Take note, there is a Buffer option, which is like a grace percentage of how low it can dip without triggering. Setting a buffer will portal mid-zone if you exceed 5x of the buffer.  CAUTION: Selecting Rn/hr may immediately portal you if its lower-(use Pause AutoTrimps button to pause the script first to avoid this)', 'dropdown', 'Off', radonChallenges, 'Core');
	createSetting('RadonHourChallenge', 'Challenge', 'Automatically portal into this challenge when using radon per hour or custom autoportal. Custom portals on the zone specified. Do not choose a challenge if you havent unlocked it. ', 'dropdown', 'None', radonHourChallenges, 'Core');
	createSetting('RadonC3Challenge', 'Challenge', 'Automatically portal into this challenge when using \'Challenge 3\' portal option on autoportal. Custom portals on the zone specified. Do not choose a challenge if you havent unlocked it. ', 'dropdown', 'None', radonChallenge3, 'Core');
	createSetting('RCustomAutoPortal', 'Custom Portal', 'Automatically portal at this zone. (ie: setting to 200 would portal when you reach zone 200)', 'value', '999', null, 'Core');
	createSetting('rCustomDailyAutoPortal', 'Daily Custom Portal', 'Automatically portal at this zone when a daily is available. (ie: setting to 200 would portal when you reach zone 200)', 'value', '999', null, 'Core');
	createSetting('RnHrDontPortalBefore', 'Don\'t Portal Before', 'Do NOT allow Radon per Hour AutoPortal setting to portal BEFORE this level is reached. It is an additional check that prevents drops in radon/hr from triggering autoportal. Set to 0 or -1 to completely disable this check. (only shows up with Radon per Hour set)', 'value', '999', null, 'Core');
	createSetting('RadonHrBuffer', 'Rn/Hr Portal Buffer %', 'IMPORTANT SETTING. When using the Rn/Hr Autoportal, it will portal if your Rn/Hr drops by this amount of % lower than your best for current run, default is 0% (ie: set to 5 to portal at 95% of your best). Now with stuck protection - Allows portaling midzone if we exceed set buffer amount by 5x. (ie a normal 2% buffer setting would now portal mid-zone you fall below 10% buffer).', 'value', '0', null, 'Core');
	createSetting('RdownloadSaves', 'Download Saves', 'Will automatically download saves whenever AutoTrimps portals.', 'boolean', false, null, 'Core');

	//Pause + Switch
	createSetting('PauseScript', 'Pause AutoTrimps', 'Pause AutoTrimps Script (not including the graphs module)', 'boolean', null, null, 'Core');
	var $pauseScript = document.getElementById('PauseScript');
	$pauseScript.parentNode.style.setProperty('float', 'right');
	$pauseScript.parentNode.style.setProperty('margin-right', '1vw');
	$pauseScript.parentNode.style.setProperty('margin-left', '0');
	createSetting('radonsettings', ['Helium', 'Radon'], 'Switch between Helium (U1) and Radon (U2) settings. ', 'multitoggle', 0, null, 'Core');
	var $radonsettings = document.getElementById('radonsettings');
	$radonsettings.parentNode.style.setProperty('float', 'right');
	$radonsettings.parentNode.style.setProperty('margin-right', '1vw');
	$radonsettings.parentNode.style.setProperty('margin-left', '0');
	createSetting('AutoEggs', 'AutoEggs', 'Click easter egg if it exists, upon entering a new zone. Warning: Quite overpowered. Please solemnly swear that you are up to no good.', 'boolean', false, null, 'Core');
	var $eggSettings = document.getElementById('AutoEggs');
	$eggSettings.parentNode.style.setProperty('float', 'right');
	$eggSettings.parentNode.style.setProperty('margin-right', '1vw');
	$eggSettings.parentNode.style.setProperty('margin-left', '0');

	//--------------------------------------------------------------------------------------------------------------------------

	//Daily
	//Helium Daily
	createSetting('buyheliumy', 'Buy Heliumy %', 'Buys the Heliumy bonus for <b>100 bones</b> when Daily bonus is above the value set in this setting. Recommend anything above 475. Will not buy if you cant afford to, or value is -1. ', 'value', -1, null, 'Daily');
	createSetting('dfightforever', ['DFA: Off', 'DFA: Non-Empowered', 'DFA: All Dailies'], 'Daily Fight Always. Sends trimps to fight if they\'re not fighting in Daily challenges similar to Toxicity/Nom but not on Bloodthirst/Plagued/Bogged Dailies, regardless of BAF. Non-Empowered will only send to fight if the Daily is not Empowered. Essenitally the same as the one in combat, can use either if you wish, except this will only activate in these daily challenges (duh) ', 'multitoggle', '0', null, 'Daily');
	createSetting('avoidempower', 'Avoid Empower', 'Tries to avoid Empower stacks in Empower Dailies. No harm in this being on, so default is On. ', 'boolean', true, null, 'Daily');
	createSetting('darmormagic', ['Daily Armor Magic Off', 'DAM: Above 80%', 'DAM: H:D', 'DAM: Always'], 'Will buy Armor to try and prevent death on Bleed/Plague/Bogged Dailies under the 3 conditions. <br><b>Above 80%:</b> Will activate at and above 80% of your HZE. <br><b>H:D:</b> Will activate at and above the H:D you have defined in maps. <br><b>Always</b> Will activate always. <br>All options will activate at or <b>below 25% of your health.</b> ', 'multitoggle', 0, null, "Daily");
	createSetting('dscryvoidmaps', 'Daily VM Scryer', 'Only use in Dailies if you have Scryhard II, for er, obvious reasons. Works without the scryer options. ', 'boolean', false, null, 'Daily');

	//Helium Spire
	createSetting('dIgnoreSpiresUntil', 'Daily Ignore Spires Until', 'Spire specific settings like end-at-cell are ignored until at least this zone is reached in Dailies (0 to disable). ', 'value', '200', null, 'Daily');
	createSetting('dExitSpireCell', 'Daily Exit Spire Cell', 'What cell to exit spire in dailys. ', 'value', -1, null, 'Daily');
	createSetting('dPreSpireNurseries', 'Daily Nurseries pre-Spire', 'Set the maximum number of Nurseries to build for Spires in Dailies. Overrides No Nurseries Until z and Max Nurseries so you can keep them seperate! Disable with -1.', 'value', -1, null, 'Daily');

	//Helium Windstacking
	createSetting('use3daily', 'Daily Windstacking', '<b> This must be on for Daily windstacking settings to appear!</b> Overrides your Autostance settings to use the WS stance on Dailies. ', 'boolean', false, null, 'Daily');
	createSetting('dWindStackingMin', 'Daily Windstack Min Zone', 'For use with Windstacking Stance, enables windstacking in zones above and inclusive of the zone set for dailys. (Get specified windstacks then change to D, kill bad guy, then repeat). This is designed to force S use until you have specified stacks in wind zones, overriding scryer settings. All windstack settings apart from Daily WS MAX work off this setting. ', 'value', '-1', null, 'Daily');
	createSetting('dWindStackingMinHD', 'Daily Windstack H:D', 'For use with Windstacking Stance in Dailies, fiddle with this to maximise your stacks in wind zones for Dailies. If H:D is above this setting it will not use W stance. If it is below it will. ', 'value', '-1', null, 'Daily');
	createSetting('dWindStackingMax', 'Daily Windstack Stacks', 'For use with Windstacking Stance in Dailies. Amount of windstacks to obtain before switching to D stance. Default is 200, but I recommend anywhere between 175-190. In Wind Enlightenment it will add 100 stacks to your total automatically. So if this setting is 200 It will assume you want 300 stacks instead during enlightenment. ', 'value', '200', null, 'Daily');
	createSetting('liqstack', 'Stack Liquification', 'Stack Wind zones during Wind Enlight during Liquification. ', 'boolean', false, null, 'Daily');

	//Helium Daily Portal
	createSetting('AutoStartDaily', 'Auto Start Daily', 'Starts Dailies for you. When you portal with this on, it will select the oldest Daily and run it. Use the settings in this tab to decide whats next. ', 'boolean', false, null, 'Daily');
	createSetting('u2daily', 'Daily in U2', 'If this is on, you will do your daily in U2. ', 'boolean', false, null, 'Daily');
	createSetting('AutoPortalDaily', ['Daily Portal Off', 'DP: He/Hr', 'DP: Custom'], '<b>DP: He/Hr:</b> Portals when your world zone is above the minium you set (if applicable) and the buffer falls below the % you have defined. <br><b>DP: Custom:</b> Portals after clearing the zone you have defined in Daily Custom Portal. ', 'multitoggle', '0', null, 'Daily');
	createSetting('dHeliumHourChallenge', 'DP: Challenge', 'Automatically portal into this challenge when using helium per hour or custom autoportal in dailies when there are none left. Custom portals after cell 100 of the zone specified. Do not choose a challenge if you havent unlocked it. ', 'dropdown', 'None', ['None', 'Balance', 'Decay', 'Electricity', 'Life', 'Crushed', 'Nom', 'Toxicity', 'Watch', 'Lead', 'Corrupted', 'Domination', 'Experience'], 'Daily');
	createSetting('dCustomAutoPortal', 'Daily Custom Portal', 'Automatically portal at this zone during dailies. (ie: setting to 200 would portal when you reach zone 200)', 'value', '999', null, 'Daily');
	createSetting('dHeHrDontPortalBefore', 'D: Don\'t Portal Before', 'Do NOT allow Helium per Hour Daily AutoPortal setting to portal BEFORE this level is reached in dailies. It is an additional check that prevents drops in helium/hr from triggering autoportal in dailies. Set to 0 or -1 to completely disable this check. (only shows up with Helium per Hour set in dailies)', 'value', '999', null, 'Daily');
	createSetting('dHeliumHrBuffer', 'D: He/Hr Portal Buffer %', 'IMPORTANT SETTING. When using the Daily He/Hr Autoportal, it will portal if your He/Hr drops by this amount of % lower than your best for current run in dailies, default is 0% (ie: set to 5 to portal at 95% of your best in dailies). Now with stuck protection - Allows portaling midzone if we exceed set buffer amount by 5x. (ie a normal 2% buffer setting would now portal mid-zone you fall below 10% buffer).', 'value', '0', null, 'Daily');

	//--------------------------------------------------------------------------------------------------------

	//Radon Daily
	createSetting('buyradony', 'Buy Radonculous %', 'Buys the Radonculous bonus for <b>100 bones</b> when Daily bonus is above the value set in this setting. Recommend anything above 475. Will not buy if you cant afford to, or value is -1. ', 'value', -1, null, 'Daily');
	createSetting('rBloodthirstDestack', 'Bloodthirst Destack', 'Will automatically run a level 6 map when you are one stack (death) away from the enemy healing and gaining additional attack. <b>Won\'t function properly without Auto Maps enabled.</b>', 'boolean', true, null, 'Daily');
	createSetting('rAutoEqualityEmpower', 'AE: Empower', 'Will automatically adjust the enemies stats to factor in either Explosive or Crit modifiers if they\'re active on the current daily.</b>', 'boolean', true, null, 'Daily');

	//Radon Daily Portal
	createSetting('RAutoStartDaily', 'Auto Daily', 'Starts Dailies for you. When you portal with this on, it will select the oldest Daily and run it. Use the settings in this tab to decide whats next. ', 'boolean', false, null, 'Daily');
	createSetting('RAutoPortalDaily', ['Daily Portal Off', 'DP: Rn/Hr', 'DP: Custom'], '<b>DP: Rn/Hr:</b> Portals when your world zone is above the minium you set (if applicable) and the buffer falls below the % you have defined. <br><b>DP: Custom:</b> Portals after clearing the zone you have defined in Daily Custom Portal. ', 'multitoggle', '0', null, 'Daily');
	createSetting('RdHeliumHourChallenge', 'DP: Challenge', 'Automatically portal into this challenge when using radon per hour or custom autoportal in dailies when there are none left. Custom portals after cell 100 of the zone specified. Do not choose a challenge if you havent unlocked it. ', 'dropdown', 'None', radonHourChallenges, "Daily");
	createSetting('RdCustomAutoPortal', 'Daily Custom Portal', 'Automatically portal AFTER clearing this level in dailies. (ie: setting to 200 would portal when you first reach level 201)', 'value', '999', null, "Daily");
	createSetting('RdHeliumHrBuffer', 'Rn/Hr Portal Buffer %', 'IMPORTANT SETTING. When using the Daily Rn/Hr Autoportal, it will portal if your Rn/Hr drops by this amount of % lower than your best for current run in dailies, default is 0% (ie: set to 5 to portal at 95% of your best in dailies). Now with stuck protection - Allows portaling midzone if we exceed set buffer amount by 5x. (ie a normal 2% buffer setting would now portal mid-zone you fall below 10% buffer).', 'value', '0', null, 'Daily');
	createSetting('RFillerRun', 'Filler run', 'Will automatically run a filler (challenge selected in DP: Challenge) if you\'re already in a daily and have this enabled.', 'boolean', false, null, 'Daily');
	createSetting('u1daily', 'Daily in U1', 'If this is on, you will do your daily in U1. ', 'boolean', false, null, 'Daily');
	createSetting('dontCapDailies', 'Use when capped', 'If this is on, you will only do the oldest daily when you have 7 dailies available. ', 'boolean', false, null, 'Daily');
	createSetting('rDailyPortalSettingsArray', 'Daily Portal Settings', 'Click to adjust settings. ', 'mazDefaultArray', { portalZone: 0, portalChallenge: "None", Reflect: { enabled: true, zone: 0 }, ShredFood: { enabled: true, zone: 0 }, ShredWood: { enabled: true, zone: 0 }, ShredMetal: { enabled: true, zone: 0 }, Empower: { enabled: true, zone: 0 }, Mutimp: { enabled: true, zone: 0 }, Bloodthirst: { enabled: true, zone: 0 }, Famine: { enabled: true, zone: 0 }, Large: { enabled: true, zone: 0 }, Weakness: { enabled: true, zone: 0 } }, null, 'Jobs');

	//---------------------------------------------------------------------------------------------------------

	//C2
	createSetting('FinishC2', 'Finish Challenge2', '<b>DONT USE THIS WITH C2 RUNNER</b><br>Finish / Abandon Challenge2 (any) when this zone is reached, if you are running one. For manual use. Recommended: Zones ending with 0 for most Challenge2. Disable with -1. Does not affect Non-Challenge2 runs.', 'value', -1, null, 'C2');
	createSetting('buynojobsc', 'No F/L/M in C2', 'Buys No Farmers, Lumberjacks or Miners in the C2 challenges Watch and Trapper. ', 'boolean', false, null, 'C2');
	createSetting('cfightforever', 'Tox/Nom Fight Always', 'Sends trimps to fight if they\'re not fighting in the Toxicity and Nom Challenges, regardless of BAF. Essenitally the same as the one in combat, can use either if you wish, except this will only activate in these challenges (duh) ', 'boolean', false, null, 'C2');
	createSetting('carmormagic', ['C2 Armor Magic Off', 'CAM: Above 80%', 'CAM: H:D', 'CAM: Always'], 'Will buy Armor to try and prevent death on Nom/Tox Challenges under the 3 conditions. <br><b>Above 80%:</b> Will activate at and above 80% of your HZE and when your health is sufficiently low. <br><b>H:D:</b> Will activate at and above the H:D you have defined in maps. <br><b>Always</b> Will activate always. <br>All options will activate at or <b>below 25% of your health.</b> ', 'multitoggle', 0, null, 'C2');
	createSetting('novmsc2', 'No VMs', 'Turn off VM running for C2s. Handy for the C2 Runner. ', 'boolean', false, null, 'C2');

	//C2 Runner
	createSetting('c2runnerstart', 'C2 Runner', 'Runs the normal C2s in sequence according to difficulty. See C2Table for list. Once zone you have defined has been reached, will portal into next. I will advise you not to touch the challenges (abandoning, doing a different one, etc) if you are running this, it could break it. Only runs challenges that need updating, will not run ones close-ish to your HZE. ', 'boolean', false, null, 'C2');
	createSetting('c2runnerportal', 'C2 Runner Portal', 'Automatically portal AFTER clearing this level in C2 Runner. (ie: setting to 200 would portal when you first reach level 201)', 'value', '999', null, 'C2');
	createSetting('c2runnerpercent', 'C2 Runner %', 'What percent Threshhold you want C2s to be over. E.g 85, will only run C2s with HZE% below this number. Default is 85%. Must have a value set for C2 Runner to... well, run. ', 'value', '85', null, 'C2');
	createSetting('c2table', 'C2 Table', 'Display your C2s and C3s in a convenient table which is colour coded. <br><b>Green</b> = Not worth updating. <br><b>Yellow</b> = Consider updating. <br><b>Red</b> = Updating this C2/C3 is worth doing. <br><b>Blue</b> = You have not yet done/unlocked this C2/C3 challenge. ', 'infoclick', 'c2table', null, 'C2');

	//Challenges

	//Balance
	createSetting('balance', 'Balance', 'Turn this on if you want to enable Balance destacking feautres.', 'boolean', false, null, 'C2');
	createSetting('balanceZone', 'B: Zone', 'Which zone you would like to start destacking from.', 'value', [6], null, 'C2');
	createSetting('balanceStacks', 'B: Stacks', 'The amount of stack you have to reach before clearing them.', 'value', -1, null, 'C2');
	createSetting('balanceImprobDestack', 'B: Improbability Destack', 'Turn this on to always go down to 0 Balance on Improbabilities after you reach your specified destacking zone', 'boolean', false, null, 'C2');

	//Decay
	createSetting('decay', 'Decay', 'Turn this on if you want to enable Decay feautres.', 'boolean', false, null, 'C2');
	createSetting('decayStacksToPush', 'D: Stacks to Push', 'During Decay, AT will ignore maps and push to end the zone if we go above this amount of stacks.<br><br>Use -1 or 0 to disable.<br>Defaults to 300.', 'value', '300', null, 'C2');
	createSetting('decayStacksToAbandon', 'D: Stacks to Abandon', 'During Decay, AT will abandon the challenge if we go above this amount of stacks.<br><br>Use -1 or 0 to disable.<br>Defaults to 300.', 'value', '600', null, 'C2');

	//Life
	createSetting('life', 'Life', 'Turn this on if you want to enable Decay feautres.', 'boolean', false, null, 'C2');
	createSetting('lifeZone', 'L: Zone', 'During Life, AT will only take you to the map chamber when the current enemy is Living when you are at or below this zone. <br><br>Must be used in conjunction with L: Stacks.<br><br>Defaults to 100.', 'value', '100', null, 'C2');
	createSetting('lifeStacks', 'L: Stacks', 'During Life, AT will only take you to the map chamber when the current enemy is Living when you are at or below this stack count.<br><br>Must be used in conjunction with L: Stacks.<br><br>Defaults to 150.', 'value', '150', null, 'C2');

	//Mapology
	createSetting('mapology', 'Mapology', 'Turn this on if you want to enable Mapology prestige climb feautre. Any BW Raiding settings will climb until the prestige selected in "M: Prestige" has been obtained rather than going for all the available prestiges.', 'boolean', false, null, 'C2');
	createSetting('mapologyPrestige', 'M: Prestige', 'Acquire prestiges through the selected item (inclusive) as soon as they are available in maps. Automap must be enabled.', 'dropdown', 'Off', ['Off', 'Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'], 'C2');

	//Experience
	createSetting('experience', 'Experience', 'Turn this on if you want to enable Experience feautres. <b>This setting is dependant on using \'Bionic Raiding\' in conjunction with it.</b><br><br>Will automatically disable repeat within Bionic Wonderland maps if you\'re above z600 and the Bionic map is at or above level 605.', 'boolean', false, null, 'C2');
	createSetting('experienceStartZone', 'E: Start Zone', 'The zone you would like to start farming for Wonders at.', 'value', -1, null, 'C2');
	createSetting('experienceEndZone', 'E: End Zone', 'Will run the Bionic Wonderland map level specified in \'E: End BW\' at this zone. <b>This setting will not work if set below z601.</b>', 'value', '605', null, 'C2');
	createSetting('experienceEndBW', 'E: End BW', 'Will finish the challenge with specified Bionic Wonderland once reaching end zone. If the specified BW is not available, it will run one closest to the setting.', 'value', '605', null, 'C2');

	//--------------------------------------------------------------------------------------------------------

	//Buildings
	//Helium
	createSetting('BuyBuildingsNew', 'AutoBuildings', 'Buys buildings in an efficient way. Also enables Vanilla AutoStorage if its off. ', 'boolean', 'true', null, 'Buildings');
	createSetting('WarpstationCap', 'Warpstation Cap', 'Do not level Warpstations past Basewarp+DeltaGiga **. Without this, if a Giga wasnt available, it would level infinitely (wastes metal better spent on prestiges instead.) **The script bypasses this cap each time a new giga is bought, when it insta-buys as many as it can afford (since AT keeps available metal/gems to a low, overbuying beyond the cap to what is affordable at that first moment is not a bad thing). ', 'boolean', true, null, 'Buildings');
	createSetting('WarpstationCoordBuy', 'Buy Warp to Hit Coord', 'If we are very close to hitting the next coordination, and we can afford the warpstations it takes to do it, Do it! (even if we are over the Cap/Wall). Recommended with WarpCap/WarpWall. (has no point otherwise) ', 'boolean', true, null, 'Buildings');
	createSetting('FirstGigastation', 'First Gigastation', 'How many warpstations to buy before your first gigastation', 'value', '20', null, 'Buildings');
	createSetting('DeltaGigastation', 'Delta Gigastation', '<b>YOU MUST HAVE BUY UPGRADES ENABLED!</b><br> How many extra warpstations to buy for each gigastation. Supports decimal values. For example 2.5 will buy +2/+3/+2/+3...', 'value', '2', null, 'Buildings');
	createSetting('AutoGigas', 'Auto Gigas', "Advanced. <br>If enabled, AT will buy its first Gigastation if: <br>A) Has more than 2 Warps & <br>B) Can't afford more Coords & <br>C) (Only if Custom Delta Factor > 20) Lacking Health or Damage & <br>D) (Only if Custom Delta Factor > 20) Has run at least 1 map stack or <br>E) If forced to by using the firstGiga(true) command in the console. <br>Then, it'll calculate the delta based on your Custom Delta Factor and your Auto Portal/VM zone (whichever is higher), or Daily Auto Portal/VM zone, or C2 zone, or Custom AutoGiga Zone.", 'boolean', 'true', null, 'Buildings');
	createSetting('CustomTargetZone', 'Custom Target Zone', 'To be used with Auto Gigas. <br>The zone to be used as a the target zone when calculating the Auto Gigas delta. <br>Values below 60 will be discarded.', 'value', '-1', null, "Buildings");
	createSetting('CustomDeltaFactor', 'Custom Delta Factor', 'Advanced. To be used with Auto Gigas. <br>This setting is used to calculate a better Delta. Think of this setting as how long your target zone takes to complete divided by the zone you bought your first giga in. <br>Basically, a higher number means a higher delta. Values below 1 will default to 10. <br><b>Recommended: 1-2 for very quick runs. 5-10 for regular runs where you slow down at the end. 20-100+ for very pushy runs.</b>', 'value', '-1', null, "Buildings");

	createSetting('hBuildingSettingsArray', 'Building Settings', 'Click to adjust settings. ', 'mazDefaultArray', {
		Hut: { enabled: true, percent: 100, buyMax: 0 },
		House: { enabled: true, percent: 100, buyMax: 0 },
		Mansion: { enabled: true, percent: 100, buyMax: 0 },
		Hotel: { enabled: true, percent: 100, buyMax: 0 },
		Wormhole: { enabled: false, percent: 1, buyMax: 1 },
		Resort: { enabled: true, percent: 100, buyMax: 0 },
		Gateway: { enabled: true, percent: 100, buyMax: 0 },
		Collector: { enabled: true, percent: 100, buyMax: 0 },
		Gym: { enabled: true, percent: 100, buyMax: 0 },
		Tribute: { enabled: true, percent: 100, buyMax: 0 },
		Nursery: { enabled: true, percent: 100, buyMax: 0, fromZ: 999 }
	}, null, 'Jobs');
	//Radon
	createSetting('RBuyBuildingsNew', 'AutoBuildings', 'Buys buildings in an efficient way. Also enables Vanilla AutoStorage if its off. ', 'boolean', 'true', null, 'Buildings');
	createSetting('rBuildingSettingsArray', 'Building Settings', 'Click to adjust settings. ', 'mazDefaultArray', {
		Hut: { enabled: true, percent: 100, buyMax: 0 },
		House: { enabled: true, percent: 100, buyMax: 0 },
		Mansion: { enabled: true, percent: 100, buyMax: 0 },
		Hotel: { enabled: true, percent: 100, buyMax: 0 },
		Resort: { enabled: true, percent: 100, buyMax: 0 },
		Gateway: { enabled: true, percent: 100, buyMax: 0 },
		Collector: { enabled: true, percent: 100, buyMax: 0 },
		Smithy: { enabled: true, percent: 100, buyMax: 0 },
		Tribute: { enabled: true, percent: 100, buyMax: 0 },
		Laboratory: { enabled: true, percent: 100, buyMax: 0 },
		SafeGateway: { enabled: true, mapCount: 3, zone: 0 }
	}, null, 'Jobs');

	//--------------------------------------------------------------------------------------------------------

	//Jobs
	//Helium
	createSetting('BuyJobsNew', ['Don\'t Buy Jobs', 'Auto Ratios', 'Manual Ratios'], 'Manual Ratios buys jobs for your trimps according to the ratios below, <b>Make sure they are all different values, if two of them are the same it might causing an infinite loop of hiring and firing!</b> Auto Worker ratios automatically changes these ratios based on current progress, <u>overriding your ratio settings</u>.<br>AutoRatios: 1/1/1 up to 300k trimps, 3/3/5 up to 3mil trimps, then 3/1/4 above 3 mil trimps, then 1/1/10 above 1000 tributes, then 1/2/22 above 1500 tributes, then 1/12/12 above 3000 tributes.<br>CAUTION: You cannot manually assign jobs with this, turn it off if you have to', 'multitoggle', 1, null, 'Jobs');
	createSetting('hJobSettingsArray', 'Job Settings', 'Click to adjust settings. ', 'mazDefaultArray', {
		Farmer: { enabled: true, ratio: 1 },
		Lumberjack: { enabled: true, ratio: 1 },
		Miner: { enabled: true, ratio: 1 },
		Explorer: { enabled: true, percent: 5 },
		Trainer: { enabled: true, percent: 5 },
		Magmamancer: { enabled: true, percent: 100 }
	}, null, 'Jobs');

	//Radon
	createSetting('RBuyJobsNew', ['AT AutoJobs Off', 'Auto Ratios', 'Manual Ratios'], 'Manual Ratios buys jobs for your trimps according to the ratios below, <b>Make sure they are all different values, if two of them are the same it might causing an infinite loop of hiring and firing!</b> Auto Worker ratios automatically changes these ratios based on current progress, <u>overriding your ratio settings</u>.<br>AutoRatios: 1/1/1 up to 300k trimps, 3/3/5 up to 3mil trimps, then 3/1/4 above 3 mil trimps, then 1/1/10 above 1000 tributes, then 1/2/22 above 1500 tributes, then 1/12/12 above 3000 tributes.<br>CAUTION: You cannot manually assign jobs with this, turn it off if you have to', 'multitoggle', 1, null, "Jobs");
	createSetting('rJobSettingsArray', 'Job Settings', 'Click to adjust settings. ', 'mazDefaultArray', {
		Farmer: { enabled: true, ratio: 1 },
		Lumberjack: { enabled: true, ratio: 1 },
		Miner: { enabled: true, ratio: 1 },
		Explorer: { enabled: true, percent: 5 },
		Meteorologist: { enabled: true, percent: 100 },
		Worshipper: { enabled: true, percent: 5 },
		FarmersUntil: { enabled: false, zone: 999 },
		NoLumberjacks: { enabled: false }
	}, null, 'Jobs');

	//--------------------------------------------------------------------------------------------------------

	//Gear
	//Helium
	createSetting('Hequipon', 'AutoEquip', 'AutoEquip. Buys Prestiges and levels equipment according to various settings. Will only buy prestiges if it is worth it. Levels all eqiupment according to best efficiency.', 'boolean', false, null, "Gear");
	createSetting('Hdmgcuntoff', 'AE: Cut-off', 'Decides when to buy gear. 1 is default. This means it will take 1 hit to kill an enemy. If zone is below the zone you have defined in AE: Zone then it will only buy equips when needed.', 'value', '1', null, 'Gear');
	createSetting('Hequipamount', 'AE: Amount', 'How much equipment to level per time.', 'value', 1, null, "Gear");
	createSetting('Hequipcapattack', 'AE: Weapon Cap', 'What level to stop buying Weapons at.', 'value', 50, null, "Gear");
	createSetting('Hequipcaphealth', 'AE: Armour Cap', 'What level to stop buying Armour at.', 'value', 50, null, "Gear");
	createSetting('Hequipzone', 'AE: Zone', 'What zone to stop caring about H:D and buy as much prestiges and equipment as possible. <br><br>Can input multiple zones such as \'200\,231\,251\', doing this will spend all your resources purchasing gear and prestiges on each zone input but will only buy them until the end of the run after the last input. ', 'multiValue', -1, null, "Gear");
	createSetting('Hequippercent', 'AE: Percent', 'What percent of resources to spend on equipment before the zone you have set in AE: Zone.', 'value', 1, null, "Gear");
	createSetting('Hautoequipportal', 'AE: Portal', 'Makes sure Auto Equip is on after portalling. Turn this off to disable this and remember your choice.', 'boolean', false, null, 'Gear');
	createSetting('Hequip2', 'AE: 2', 'Always buys level 2 of weapons and armor regardless of efficiency.', 'boolean', true, null, "Gear");
	createSetting('Hequipprestige', ['AE: Prestige Off', 'AE: Prestige', 'AE: Always Prestige'], '\
	<b>AE: Prestige Off</b><br>Will go for a new prestige when you have 6 or more levels in your equipment.<br><br>\
	<b>AE: Prestige</b><br>Overrides the need for levels in your current equips before a prestige will be purchased. Will purchase gear levels again when you have run Atlantrimp (will buy any prestiges that cost less than 8% of your current metal).<br><br>\
	<b>AE: Always Prestige</b><br>Always buys prestiges of weapons and armor regardless of efficiency. Will override AE: Zone setting for an equip if it has a prestige available.', 'multitoggle', 0, null, "Gear");
	createSetting('hEquipHighestPrestige', 'AE: Highest Prestige', 'Will only buy equips for the highest prestige currently owned.', 'boolean', true, null, "Gear");
	createSetting('hEquipEfficientEquipDisplay', 'AE: Highlight Equips', 'Will highlight the most efficient equipment or prestige to buy. <b>This setting will disable the default game setting.', 'boolean', true, null, "Gear");

	createSetting('Prestige', 'Prestige', 'Acquire prestiges through the selected item (inclusive) as soon as they are available in maps. Forces equip first mode. Automap must be enabled. THIS IS AN IMPORTANT SETTING related to speed climbing and should probably always be on something. If you find the script getting stuck somewhere, particularly where you should easily be able to kill stuff, setting this to an option lower down in the list will help ensure you are more powerful at all times, but will spend more time acquiring the prestiges in maps.', 'dropdown', 'Off', ['Off', 'Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'], "Gear");
	createSetting('ForcePresZ', 'Force Prestige Z', 'On and after this zone is reached, always try to prestige for everything immediately, ignoring Dynamic Prestige settings and overriding that of Linear Prestige. Prestige Skip mode will exit this. Disable with -1.', 'value', -1, null, 'Gear');
	createSetting('PrestigeSkip1_2', ['Prestige Skip Off', 'Prestige Skip 1 & 2', 'Prestige Skip 1', 'Prestige Skip 2'], '<b>Prestige Skip 1:</b> If there are more than 2 Unbought Prestiges (besides Shield), ie: sitting in your upgrades window but you cant afford them, AutoMaps will not enter Prestige Mode, and/or will exit from it. The amount of unboughts can be configured with this variable MODULES[\\"maps\\"].SkipNumUnboughtPrestiges = 2; <br><b>Prestige Skip 2:</b> If there are 2 or fewer <b>Unobtained Weapon Prestiges in maps</b>, ie: there are less than 2 types to run for, AutoMaps will not enter Prestige Mode, and/or will exit from it. For users who tends to not need the last few prestiges due to resource gain not keeping up. The amount of unboughts can be configured with MODULES.maps.UnearnedPrestigesRequired. If PrestigeSkipMode is enabled, both conditions need to be reached before exiting.', 'multitoggle', 0, null, "Gear");
	createSetting('BuyShieldblock', 'Buy Shield Block', 'Will buy the shield block upgrade. CAUTION: If you are progressing past zone 60, you probably don\'t want this :)', 'boolean', false, null, "Gear");


	//Radon
	createSetting('Requipon', 'AutoEquip', 'AutoEquip. Buys Prestiges and levels equipment according to various settings. Will only buy prestiges if it is worth it. Levels all eqiupment according to best efficiency.', 'boolean', false, null, "Gear");
	createSetting('Rdmgcuntoff', 'AE: Cut-off', 'Decides when to buy gear. 1 is default. This means it will take 1 hit to kill an enemy. If zone is below the zone you have defined in AE: Zone then it will only buy equips when needed.', 'value', '1', null, 'Gear');
	createSetting('Requipamount', 'AE: Amount', 'How much equipment to level per time.', 'value', 1, null, "Gear");
	createSetting('Requipcapattack', 'AE: Weapon Cap', 'What level to stop buying Weapons at.', 'value', 50, null, "Gear");
	createSetting('Requipcaphealth', 'AE: Armour Cap', 'What level to stop buying Armour at.', 'value', 50, null, "Gear");
	createSetting('Requipzone', 'AE: Zone', 'What zone to stop caring about H:D and buy as much prestiges and equipment as possible. <br><br>Can input multiple zones such as \'200\,231\,251\', doing this will spend all your resources purchasing gear and prestiges on each zone input but will only buy them until the end of the run after the last input. ', 'multiValue', -1, null, "Gear");
	createSetting('Requippercent', 'AE: Percent', 'What percent of resources to spend on equipment before the zone you have set in AE: Zone.', 'value', 1, null, "Gear");
	createSetting('Rautoequipportal', 'AE: Portal', 'Makes sure Auto Equip is on after portalling. Turn this off to disable this and remember your choice.', 'boolean', false, null, 'Gear');
	createSetting('Requip2', 'AE: 2', 'Always buys level 2 of weapons and armor regardless of efficiency.', 'boolean', true, null, "Gear");
	createSetting('Requipprestige', ['AE: Prestige Off', 'AE: Prestige', 'AE: Always Prestige'], '\
	<b>AE: Prestige Off</b><br>Will go for a new prestige when you have 6 or more levels in your equipment.<br><br>\
	<b>AE: Prestige</b><br>Overrides the need for levels in your current equips before a prestige will be purchased. Will purchase gear levels again when you have run Atlantrimp (will buy any prestiges that cost less than 8% of your current metal).<br><br>\
	<b>AE: Always Prestige</b><br>Always buys prestiges of weapons and armor regardless of efficiency. Will override AE: Zone setting for an equip if it has a prestige available.', 'multitoggle', 0, null, "Gear");
	createSetting('rEquipHighestPrestige', 'AE: Highest Prestige', 'Will only buy equips for the highest prestige currently owned.', 'boolean', true, null, "Gear");
	createSetting('rEquipEfficientEquipDisplay', 'AE: Highlight Equips', 'Will highlight the most efficient equipment or prestige to buy. <b>This setting will disable the default game setting.', 'boolean', true, null, "Gear");
	createSetting('rEquipNoShields', 'AE: No Shields', 'Will stop AT from buying Shield prestiges or upgrades when they\'re available.', 'boolean', false, null, "Gear");

	createSetting('rPrestige', 'Prestige', 'Acquire prestiges through the selected item (inclusive) as soon as they are available in maps. Forces equip first mode. Automap must be enabled. THIS IS AN IMPORTANT SETTING related to speed climbing and should probably always be on something. If you find the script getting stuck somewhere, particularly where you should easily be able to kill stuff, setting this to an option lower down in the list will help ensure you are more powerful at all times, but will spend more time acquiring the prestiges in maps.', 'dropdown', 'Off', ['Off', 'Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'], "Gear");
	createSetting('rForcePresZ', 'Force Prestige Z', 'On and after this zone is reached, always try to prestige for everything immediately, ignoring Dynamic Prestige settings and overriding that of Linear Prestige. Prestige Skip mode will exit this. Disable with -1.', 'value', -1, null, 'Gear');
	createSetting('rPrestigeSkip1_2', ['Prestige Skip Off', 'Prestige Skip 1 & 2', 'Prestige Skip 1', 'Prestige Skip 2'], '<b>Prestige Skip 1:</b> If there are more than 2 Unbought Prestiges (besides Shield), ie: sitting in your upgrades window but you cant afford them, AutoMaps will not enter Prestige Mode, and/or will exit from it. The amount of unboughts can be configured with this variable MODULES[\\"maps\\"].SkipNumUnboughtPrestiges = 2; <br><b>Prestige Skip 2:</b> If there are 2 or fewer <b>Unobtained Weapon Prestiges in maps</b>, ie: there are less than 2 types to run for, AutoMaps will not enter Prestige Mode, and/or will exit from it. For users who tends to not need the last few prestiges due to resource gain not keeping up. The amount of unboughts can be configured with MODULES.maps.UnearnedPrestigesRequired. If PrestigeSkipMode is enabled, both conditions need to be reached before exiting.', 'multitoggle', 0, null, "Gear");

	//--------------------------------------------------------------------------------------------------------

	//Maps
	//Helium
	createSetting('AutoMaps', ["Auto Maps Off", "Auto Maps On", "Auto Maps No Unique"], 'Automaps. The no unique setting will not run unique maps such as dimensions of anger. Recommended ON. Do not use window, it will not work. ', 'multitoggle', 1, null, "Maps");
	createSetting('automapsportal', 'AM Portal', 'Makes sure Auto Maps is on after portalling. Turn this off to disable this and remember your choice. ', 'boolean', true, null, 'Maps');
	createSetting('FarmWhenNomStacks7', 'Farm on >7 NOMstacks', 'Optional. If Improbability already has 5 NOMstacks, stack 30 Anticipation. If the Improbability has >7 NOMstacks on it, get +200% dmg from MapBonus. If we still cant kill it, enter Farming mode at 30 stacks, Even with DisableFarming On! (exits when we get under 10x). Farms if we hit 100 stacks in the world. If we ever hit (100) nomstacks in a map (likely a voidmap), farm, (exit the voidmap) and (prevent void from running, until situation is clear). Restarts any voidmaps if we hit 100 stacks. ', 'boolean', false, null, 'Maps');
	createSetting('scryvoidmaps', 'VM Scryer', 'Only use if you have Scryhard II, for er, obvious reasons. Works without the scryer options. ', 'boolean', false, null, 'Maps');
	createSetting('buywepsvoid', 'VM Buy Weps', 'Buys gear in Void maps regardless of your H:D ratio. Useful if you want to overkill as much as possible. ', 'boolean', false, null, 'Maps');

	createSetting('hUniqueMapSettingsArray', 'Unqiue Map Settings', 'Click to adjust settings.', 'mazDefaultArray', {
		The_Wall: { enabled: false, zone: 100, cell: 0 },
		The_Block: { enabled: false, zone: 100, cell: 0 },
		Dimension_of_Anger: { enabled: false, zone: 100, cell: 0 },
		Trimple_of_Doom: { enabled: false, zone: 100, cell: 0 },
		The_Prison: { enabled: false, zone: 100, cell: 0 },
		Imploding_Star: { enabled: false, zone: 100, cell: 0 }
	}, null, 'Maps');
	createSetting('hUniqueMapPopup', 'Unique Map Settings', 'Click to adjust settings. Not fully implemented yet, still need to add in an Atlantrimp setting.', 'action', 'MAZLookalike("Unique Maps", " ", "UniqueMaps")', null, 'Maps');

	//Void Maps
	createSetting('hVoidMapPopup', 'Void Map Settings', 'Will run all of your Void Maps on a specified zone according to this settings value.', 'action', 'MAZLookalike("Helium Void Map", "hVoidMap", "MAZ")', null, 'Maps');
	createSetting('hVoidMapSettings', 'Void Map Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps');
	createSetting('hVoidMapDefaultSettings', 'Void Map Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps');
	createSetting('hVoidMapZone', 'Void Zone', 'Map Bonus', 'multiValue', [6], null, 'Maps');

	//Map Bonus
	createSetting('hMapBonusPopup', 'Map Bonus Settings', 'Will map stack to a specified amount according to this settings value.', 'action', 'MAZLookalike("Map Bonus", "hMapBonus", "MAZ")', null, 'Maps');
	createSetting('hMapBonusSettings', 'Map Bonus: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps');
	createSetting('hMapBonusDefaultSettings', 'Map Bonus: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps');
	createSetting('hMapBonusZone', 'Map Bonus: Zone', 'Map Bonus', 'multiValue', [6], null, 'Maps');

	//Map Farm
	createSetting('hMapFarmPopup', 'Map Farm Settings', 'Will farm a specified amount of maps according to this settings value.', 'action', 'MAZLookalike("Map Farm", "hMapFarm", "MAZ")', null, 'Maps');
	createSetting('hMapFarmSettings', 'MF: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps');
	createSetting('hMapFarmDefaultSettings', 'MF: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps');
	createSetting('hMapFarmZone', 'MF: Zone', 'Which zones you would like to farm at. Can use 59,61,62. ', 'multiValue', [-1], null, 'Maps');

	//Prestige Raiding
	createSetting('hRaidingPopup', 'Raiding Settings', 'Will raid up to a specified zone according to this settings value.', 'action', 'MAZLookalike("Raiding", "hRaiding", "MAZ")', null, 'Maps');
	createSetting('hRaidingSettings', 'Raiding: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps');
	createSetting('hRaidingDefaultSettings', 'Raiding: Default Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps');
	createSetting('hRaidingZone', 'Raiding: Zone', 'Farms for specified worshippers in Raiding: Amount at zone according to this settings value. Can use 59,61,62. ', 'multiValue', [-1], null, 'Maps');

	//Prestige Raiding
	createSetting('hBionicRaidingPopup', 'BW Raiding Settings', 'Will Bionic Wonderlands up to a specified zone according to this settings value.', 'action', 'MAZLookalike("Bionic Raiding", "hBionicRaiding", "MAZ")', null, 'Maps');
	createSetting('hBionicRaidingSettings', 'Raiding: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps');
	createSetting('hBionicRaidingDefaultSettings', 'Raiding: Default Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps');
	createSetting('hBionicRaidingZone', 'Raiding: Zone', 'Farms for specified worshippers in Raiding: Amount at zone according to this settings value. Can use 59,61,62. ', 'multiValue', [-1], null, 'Maps');

	//HD Farm
	createSetting('hHDFarmPopup', 'HD Farm Settings', 'Click to adjust settings. Not fully implemented yet, still need to add in an Atlantrimp setting.', 'action', 'MAZLookalike("HD Farm", "hHDFarm", "MAZ")', null, 'Maps');
	createSetting('hHDFarmSettings', 'HD Farm: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps');
	createSetting('hHDFarmDefaultSettings', 'HD Farm: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps');
	createSetting('hHDFarmZone', 'HD Farm: Zone', 'Map Bonus', 'multiValue', [6], null, 'Maps');

	//Bone Shrine (bone) 
	if (game.global.stringVersion >= '5.7.0') {
		createSetting('hBoneShrinePopup', 'Bone Shrine Settings', 'Will use a specified amount of Bone Shrine charges according to this settings value.', 'action', 'MAZLookalike("Bone Shrine", "hBoneShrine", "MAZ")', null, 'Maps');
		createSetting('hBoneShrineSettings', 'BS: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps');
		createSetting('hBoneShrineDefaultSettings', 'BS: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps');
		createSetting('hBoneShrineZone', 'BS: Zone', 'Will use bone shrine charges at the following zone(s). Can use 59,61,62. ', 'multiValue', [-1], null, 'Maps');
		createSetting('hBoneShrineRunType', 'BS: RunType', 'Will only use bone charges in the type of run specified in this setting. Will use them in either no run, fillers, dailies, c3s or all runs.', 'textValue', 'undefined', null, "Maps");
	}

	//Radon
	//General
	createSetting('RAutoMaps', ["Auto Maps", "Auto Maps", "Auto Maps No Unique"], 'Automaps. The no unique setting will not run unique maps such as dimensions of rage. Recommended ON. Do not use window, it will not work.', 'multitoggle', 1, null, "Maps");
	createSetting('Rautomapsportal', 'AM Portal', 'Makes sure Auto Maps is on after portalling. Turn this off to disable this and remember your choice.', 'boolean', true, null, 'Maps');

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
	}, null, 'Maps');
	createSetting('rUniqueMapPopup', 'Unique Map Settings', 'Click to adjust settings. Not fully implemented yet, still need to add in an Atlantrimp setting.', 'action', 'MAZLookalike("Unique Maps", " ", "rUniqueMaps")', null, 'Maps');

	//HD Farm
	createSetting('rHDFarmPopup', 'HD Farm Settings', 'Click to adjust settings. Not fully implemented yet, still need to add in an Atlantrimp setting.', 'action', 'MAZLookalike("HD Farm", "rHDFarm", "MAZ")', null, 'Maps');
	createSetting('rHDFarmSettings', 'HD Farm: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps');
	createSetting('rHDFarmDefaultSettings', 'HD Farm: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps');
	createSetting('rHDFarmZone', 'HD Farm: Zone', 'Map Bonus', 'multiValue', [6], null, 'Maps');

	//Worshipper Farm 
	createSetting('rWorshipperFarmPopup', 'Worshipper Farm Settings', 'Will farm to a specified amount of Worshippers according to this settings value.', 'action', 'MAZLookalike("Worshipper Farm", "rWorshipperFarm", "MAZ")', null, 'Maps');
	createSetting('rWorshipperFarmSettings', 'WF: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps');
	createSetting('rWorshipperFarmDefaultSettings', 'WF: Default Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps');
	createSetting('rWorshipperFarmZone', 'WF: Zone', 'Farms for specified worshippers in WF: Amount at zone according to this settings value. Can use 59,61,62. ', 'multiValue', [-1], null, 'Maps');

	//Bone Shrine (bone) 
	if (game.global.stringVersion >= '5.7.0') {
		createSetting('rBoneShrinePopup', 'Bone Shrine Settings', 'Will use a specified amount of Bone Shrine charges according to this settings value.', 'action', 'MAZLookalike("Bone Shrine", "rBoneShrine", "MAZ")', null, 'Maps');
		createSetting('rBoneShrineSettings', 'BS: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps');
		createSetting('rBoneShrineDefaultSettings', 'BS: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps');
		createSetting('rBoneShrineZone', 'BS: Zone', 'Will use bone shrine charges at the following zone(s). Can use 59,61,62. ', 'multiValue', [-1], null, 'Maps');
		createSetting('rBoneShrineRunType', 'BS: RunType', 'Will only use bone charges in the type of run specified in this setting. Will use them in either no run, fillers, dailies, c3s or all runs.', 'textValue', 'undefined', null, "Maps");
	}

	//Void Maps
	createSetting('rVoidMapPopup', 'Void Map Settings', 'Will run all of your Void Maps on a specified zone according to this settings value.', 'action', 'MAZLookalike("Void Map", "rVoidMap", "MAZ")', null, 'Maps');
	createSetting('rVoidMapSettings', 'Void Map Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps');
	createSetting('rVoidMapDefaultSettings', 'Void Map Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps');
	createSetting('rVoidMapZone', 'Void Zone', 'Map Bonus', 'multiValue', [6], null, 'Maps');

	//Map Bonus
	createSetting('rMapBonusPopup', 'Map Bonus Settings', 'Will map stack to a specified amount according to this settings value.', 'action', 'MAZLookalike("Map Bonus", "rMapBonus", "MAZ")', null, 'Maps');
	createSetting('rMapBonusSettings', 'Map Bonus: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps');
	createSetting('rMapBonusDefaultSettings', 'Map Bonus: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps');
	createSetting('rMapBonusZone', 'Map Bonus: Zone', 'Map Bonus', 'multiValue', [6], null, 'Maps');

	//Map Farm
	createSetting('rMapFarmPopup', 'Map Farm Settings', 'Will farm a specified amount of maps according to this settings value.', 'action', 'MAZLookalike("Map Farm", "rMapFarm", "MAZ")', null, 'Maps');
	createSetting('rMapFarmSettings', 'MF: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps');
	createSetting('rMapFarmDefaultSettings', 'MF: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps');
	createSetting('rMapFarmZone', 'MF: Zone', 'Which zones you would like to farm at. Can use 59,61,62. ', 'multiValue', [-1], null, 'Maps');

	//Tribute Farming
	createSetting('rTributeFarmPopup', 'Tribute Farm Settings', 'Will farm for a specified amount of Tributes/Meteorologists according to this settings value.', 'action', 'MAZLookalike("Tribute Farm", "rTributeFarm", "MAZ")', null, 'Maps');
	createSetting('rTributeFarmSettings', 'TrF: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps');
	createSetting('rTributeFarmDefaultSettings', 'TrF: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps');
	createSetting('rTributeFarmZone', 'TrF: Zone', 'Farms for specified tributes in TF: Value at zone according to this settings value. Can use 59,61,62. ', 'multiValue', [6], null, 'Maps');

	//Smithy Farming
	createSetting('rSmithyFarmPopup', 'Smithy Farm Settings', 'Will farm for a specified amount of Smithies according to this settings value.', 'action', 'MAZLookalike("Smithy Farm", "rSmithyFarm", "MAZ")', null, 'Maps');
	createSetting('rSmithyFarmSettings', 'SF: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps');
	createSetting('rSmithyFarmDefaultSettings', 'SF: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps');
	createSetting('rSmithyFarmZone', 'SF: Zone', 'Farms for specified Smithy in SF: Value at zone according to this settings value. Can use 59,61,62. ', 'multiValue', [6], null, 'Maps');

	//Prestige Raiding
	createSetting('rRaidingPopup', 'Raiding Settings', 'Will raid up to a specified zone according to this settings value.', 'action', 'MAZLookalike("Raiding", "rRaiding", "MAZ")', null, 'Maps');
	createSetting('rRaidingSettings', 'Raiding: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Maps');
	createSetting('rRaidingDefaultSettings', 'Raiding: Default Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Maps');
	createSetting('rRaidingZone', 'Raiding: Zone', 'Farms for specified worshippers in Raiding: Amount at zone according to this settings value. Can use 59,61,62. ', 'multiValue', [-1], null, 'Maps');

	//Spire
	//Helium
	createSetting('MaxStacksForSpire', 'Max Map Bonus for Spire', 'Get max map bonus before running the Spire.', 'boolean', false, null, 'Spire');
	createSetting('MinutestoFarmBeforeSpire', 'Farm Before Spire', 'Farm level 200/199(or BW) maps for X minutes before continuing onto attempting Spire.<br><b>NOTE:</b> Set 0 to disable entirely (default). <br>Setting to -1/Infinite does not work here, set a very high number instead.', 'value', '0', null, 'Spire');
	createSetting('IgnoreSpiresUntil', 'Ignore Spires Until', 'Spire specific settings like end-at-cell are ignored until at least this zone is reached (0 to disable).<br>Does not work with Run Bionic Before Spire.', 'value', '200', null, 'Spire');
	createSetting('ExitSpireCell', 'Exit Spire After Cell', 'Optional/Rare. Exits the Spire early, after completing cell X. example: 40 for Row 4. (use 0 or -1 to disable)', 'value', '-1', null, 'Spire');
	createSetting('SpireBreedTimer', 'Spire Breed Timer', '<b>ONLY USE IF YOU USE VANILLA GA</b>Set a time for your GA in spire. Recommend not touching GA during this time. ', 'value', -1, null, 'Spire');
	createSetting('PreSpireNurseries', 'Nurseries pre-Spire', 'Set the maximum number of Nurseries to build for Spires. Overrides No Nurseries Until z and Max Nurseries so you can keep them seperate! Will build nurseries before z200 for Spire 1, but only on the zone of Spires 2+ to avoid unnecessary burning. Disable with -1.', 'value', -1, null, 'Spire');
	createSetting('spireshitbuy', 'Buy Gear in Spire', 'Will buy Weapons and Armor in Spire regardless of your H:D ratio. Respects your max gear level and ignore spires setting. ', 'boolean', false, null, 'Spire');
	createSetting('SkipSpires', 'Skip Spires', 'Will disregard your H:D ratio after Farm Before Spire is done (if set). Useful to die in spires if farming takes too long', 'boolean', false, null, 'Spire');

	//--------------------------------------------------------------

	//Windstacking
	createSetting('turnwson', 'Turn WS On!', 'Turn on Windstacking Stance in Combat to see the settings! ', 'boolean', false, null, 'Windstacking');
	createSetting('WindStackingMin', 'Windstack Min Zone', 'For use with Windstacking Stance, enables windstacking in zones above and inclusive of the zone set. (Get specified windstacks then change to D, kill bad guy, then repeat). This is designed to force S use until you have specified stacks in wind zones, overriding scryer settings. All windstack settings apart from WS MAX work off this setting. ', 'value', '-1', null, 'Windstacking');
	createSetting('WindStackingMinHD', 'Windstack H:D', 'For use with Windstacking Stance, fiddle with this to maximise your stacks in wind zones. ', 'value', '-1', null, 'Windstacking');
	createSetting('WindStackingMax', 'Windstack Stacks', 'For use with Windstacking Stance. Amount of windstacks to obtain before switching to D stance. Default is 200, but I recommend anywhere between 175-190.  In Wind Enlightenment it will add 100 stacks to your total automatically. So if this setting is 200 It will assume you want 300 stacks instead during enlightenment. ', 'value', '200', null, 'Windstacking');

	//--------------------------------------------------------------

	//ATGA
	createSetting('ATGA2', 'ATGA', '<b>ATGA MASTER BUTTON</b><br>AT Geneticassist. Do not use vanilla GA, as it will conflict otherwise. May get fucky with super high values. ', 'boolean', false, null, 'ATGA');
	createSetting('ATGA2gen', 'ATGA: Gen %', '<b>ATGA: Geneassist %</b><br>ATGA will only hire geneticists if they cost less than this value. E.g if this setting is 1 it will only buy geneticists if they cost less than 1% of your food. Default is 1%. ', 'value', '1', null, 'ATGA');
	createSetting('ATGA2timer', 'ATGA: Timer', '<b>ATGA Timer</b><br>This is the default time your ATGA will use. ', 'value', '-1', null, 'ATGA');

	//Zone Timers
	createSetting('zATGA2timer', 'ATGA: T: Before Z', '<b>ATGA Timer: Before Z</b><br>ATGA will use the value you define in ATGA: T: BZT before the zone you have defined in this setting, overwriting your default timer. Useful for Liq or whatever. ', 'value', '-1', null, 'ATGA');
	createSetting('ztATGA2timer', 'ATGA: T: BZT', '<b>ATGA Timer: Before Z Timer</b><br>ATGA will use this value before the zone you have defined in ATGA: T: Before Z, overwriting your default timer. Useful for Liq or whatever. Does not work on challenges. ', 'value', '-1', null, 'ATGA');
	createSetting('ATGA2timerz', 'ATGA: T: After Z', '<b>ATGA Timer: After Z</b><br>ATGA will use the value you define in ATGA: T: AZT after the zone you have defined in this setting, overwriting your default timer. Useful for super push runs or whatever. Does not work on challenges. ', 'value', '-1', null, 'ATGA');
	createSetting('ATGA2timerzt', 'ATGA: T: AZT', '<b>ATGA Timer: After Z Timer</b><br>ATGA will use this value after the zone that has been defined in ATGA: T: After Z, overwriting your default timer. Useful for super push runs or whatever. ', 'value', '-1', null, 'ATGA');

	//Spire Timers
	createSetting('sATGA2timer', 'ATGA: T: Spire', '<b>ATGA Timer: Spire</b><br>ATGA will use this value in Spires. Respects your ignore Spires setting. Do not use this if you use the setting in the Spire tab! (As that uses vanilla GA) Nothing overwrites this except Daily Spire. ', 'value', '-1', null, 'ATGA');
	createSetting('dsATGA2timer', 'ATGA: T: Daily Spire', '<b>ATGA Timer: Daily Spire</b><br>ATGA will use this value in Daily Spires. Respects your ignore Spires setting. Do not use this if you use the setting in the Spire tab! (As that uses vanilla GA) Nothing overwrites this. ', 'value', '-1', null, 'ATGA');

	//Daily Timers
	createSetting('dATGA2Auto', ['ATGA: Manual', 'ATGA: Auto No Spire', 'ATGA: Auto Dailies'], '<b>EXPERIMENTAL</b><br><b>ATGA Timer: Auto Dailies</b><br>ATGA will use automatically set breed timers in plague and bogged, overwriting your default timer.<br/>Set No Spire to not override in spire, respecting ignore spire settings.', 'multitoggle', 2, null, 'ATGA');
	createSetting('dATGA2timer', 'ATGA: T: Dailies', '<b>ATGA Timer: Normal Dailies</b><br>ATGA will use this value for normal Dailies such as ones without plague etc, overwriting your default timer. Useful for pushing your dailies that extra bit at the end. Overwrites Default, Before Z and After Z. ', 'value', '-1', null, 'ATGA');
	createSetting('dhATGA2timer', 'ATGA: T: D: Hard', '<b>ATGA Timer: Hard Dailies</b><br>ATGA will use this value in Dailies that are considered Hard. Such Dailies include plaged, bloodthirst and Dailies with a lot of negative mods. Overwrites Default, Before Z and After Z and normal Daily ATGA Timer. ', 'value', '-1', null, 'ATGA');

	//C2 Timers
	createSetting('cATGA2timer', 'ATGA: T: C2', '<b>ATGA Timer: C2s</b><br>ATGA will use this value in C2s. Overwrites Default, Before Z and After Z. ', 'value', '-1', null, 'ATGA');
	createSetting('chATGA2timer', 'ATGA: T: C: Hard', '<b>ATGA Timer: Hard C2s</b><br>ATGA will use this value in C2s that are considered Hard. Electricity, Nom, Toxicity. Overwrites Default, Before Z and After Z and C2 ATGA', 'value', '-1', null, 'ATGA');

	//--------------------------------------------------------------

	//C3
	createSetting('c3finishrun', 'Finish C3', 'Finish / Abandon Challenge3 (any) when this zone is reached, if you are running one. Does not affect Non-C3 runs.', 'value', -1, null, 'C3');
	createSetting('c3buildings', 'Building max purchase', 'When in a C3 or special challenge  (Mayhem, Panda) run will spend 99% of resources on buildings regardless of your other designated caps until the zone you specify in the Buy Buildings Till setting.', 'boolean', false, null, 'C3');
	createSetting('c3buildingzone', 'Buy buildings till', 'When in a C3 or special challenge  (Mayhem, Panda) will spend 99% of resource on buildings until this zone.', 'value', -1, null, 'C3');
	createSetting('c3GM_ST', ['c3: GM/ST', 'c3: Golden Maps', 'c3: Sharp Trimps', 'c3: GM & ST'], 'Options to purchase sharp trimps, golden maps or both during C3 or special challenge (Mayhem, Pandemonium) runs.', 'multitoggle', 0, null, 'C3');

	//Unbalance
	createSetting('rUnbalance', 'Unbalance', 'Turn this on if you want to enable Unbalance destacking feautres.', 'boolean', false, null, 'C3');
	createSetting('rUnbalanceZone', 'U: Zone', 'Which zone you would like to start destacking from.', 'value', [6], null, 'C3');
	createSetting('rUnbalanceStacks', 'U: Stacks', 'The amount of stack you have to reach before clearing them.', 'value', -1, null, 'C3');
	createSetting('rUnbalanceImprobDestack', 'U: Improbability Destack', 'Turn this on to always go down to 0 Balance on Improbabilities after you reach your specified destacking zone', 'boolean', false, null, 'C3');

	//Trappapalooza
	createSetting('rTrappa', 'Trappa', 'Turn this on if you want to enable Trappa feautres.', 'boolean', false, null, 'C3');
	createSetting('rTrappaCoords', 'T: Coords', 'The zone you would like to stop buying additional coordinations at.', 'value', -1, null, 'C3');

	//Quest
	createSetting('rQuest', 'Quest', 'Turn this on if you want AT to automate Quests. Will only function properly with AutoMaps enabled.', 'boolean', true, null, 'C3');
	createSetting('rQuestSmithyZone', 'Q: Smithy Zone', 'The zone you\'ll stop your Quest run at (will assume 85 for non C3 version). Will calculate the smithies required for Quests and purchase spare ones if possible.', 'value', [999], null, 'C3');

	//Mayhem
	createSetting('rMayhem', 'Mayhem', 'Turn on Mayhem settings. ', 'boolean', false, null, 'C3');
	createSetting('rMayhemDestack', 'M: HD Ratio', 'What HD ratio cut-off to use when farming for the boss. If this setting is 100, the script will destack until you can kill the boss in 100 average hits or there are no Mayhem stacks remaining to clear. ', 'value', '-1', null, 'C3');
	createSetting('rMayhemZone', 'M: Zone', 'What zone you\'d like to start destacking from, can be used in conjunction with \'M: HD Ratio\' but will clear stacks until 0 are remaining regardless of the value set in \'M: HD Ratio\'.', 'value', '-1', null, 'C3');
	createSetting('rMayhemMapIncrease', 'M: Map Increase', 'Will increase the map level of Mayhem farming by this value for if you find the map level AT is selecting is too low. Negative values will be automatically set to 0.<br>This setting will make it so that AT doesn\'t check if you can afford the new map level so beware it could cause some issues.', 'value', '-1', null, 'C3');

	//Storm
	createSetting('Rstormon', 'Storm', 'Turn on Storm settings. This also controls the entireity of Storm settings. If you turn this off it will not do anything in Storm. ', 'boolean', false, null, 'C3');
	createSetting('rStormZone', 'S: Zone', 'Which zone you would like to start destacking from.', 'value', [6], null, 'C3');
	createSetting('rStormStacks', 'S: Stacks', 'The amount of stack you have to reach before clearing all of them.', 'value', -1, null, 'C3');

	//Pandemonium
	createSetting('RPandemoniumOn', 'Pandemonium', 'Turn on Pandemonium settings.', 'boolean', false, null, 'C3');
	createSetting('RPandemoniumZone', 'P: Destack Zone', 'What zone to start Pandemonium mapping at. Will ignore Pandemonium stacks below this zone.', 'value', '-1', null, 'C3');
	createSetting('RPandemoniumAutoEquip', ['P: AutoEquip Off', 'P: AutoEquip', 'P AE: LMC', 'P AE: Huge Cache'], '<b>P: AutoEquip</b><br>Will automatically purchase equipment during Pandemonium regardless of efficiency.<br><br/><b>P AE: LMC Cache</b><br>Provides settings to run maps if the cost of equipment levels is less than a single large metal cache<br/>Will also purchase prestiges when they cost less than a Jestimp proc. Additionally will override worker settings to ensure that you farm as much metal as possible.<br/><br><b>P AE: Huge Cache</b><br>Uses the same settings as \'P: AE LMC\' but changes to if an equip will cost less than a single huge cache that procs metal. Will automatically switch caches between LMC and HC depending on the cost of equipment to ensure fast farming speed.<br/><br/><b>P AE: Jestimp</b><br/>Provides a setting for Jestimp farming from a set zone which will change the equipment buying condition from if they cost less than a huge cache to if they cost less than the metal you\'d gain from a Jestimp kill. <br/>Recommended to only use the later part of Pandemonium runs as it will increase farming time by a drastic amount.', 'multitoggle', 0, null, 'C3');
	createSetting('RPandemoniumAEZone', 'P AE: Zone', 'Which zone you would like to start farming as much gear as possible from.', 'value', '-1', null, 'C3');
	createSetting('PandemoniumFarmLevel', 'P AE: Map Level', 'The map level for farming Large Metal & Huge Caches.', 'value', '1', null, 'C3');
	createSetting('RhsPandStaff', 'P: Staff', 'The name of the staff you would like to equip while equip farming, should ideally be a full metal efficiency staff.', 'textValue', 'undefined', null, 'C3');
	createSetting('RPandemoniumMP', 'P: Melting Point', 'How many smithies to run Melting Point at during Pandemonium.', 'value', '-1', null, 'C3');
	createSetting('rPandRespec', 'P: Respec', 'Turn this on to automate respeccing during Pandemonium. Be warned that this will spend bones to purchase bone portals if one is not available. <br><br>Will only function properly if the Pandemonium AutoEquip and destacking settings are all setup appropriately.<br><br>The respeccing will use the games preset system and will use Preset 2 for your destacking perk spec and Preset 3 for your farming perk spec.', 'boolean', false, null, 'C3');
	createSetting('rPandRespecZone', 'P: Respec Zone', 'The zone you\'d like to start respeccing from.', 'value', '-1', null, 'C3');

	//Glass
	createSetting('rGlass', 'Glass NYI!', 'Turn this on if you want to enable Glass destacking feautres.', 'boolean', false, null, 'C3');
	createSetting('rGlassStacks', 'G: Stacks NYI!', 'The amount of stack you have to reach before clearing them.', 'value', -1, null, 'C3');

	//Smithless
	createSetting('rSmithless', 'Smithless', 'Turn this on if you want to enable AT farming for damage to kill Ubersmiths on the Smithless challenge. It will identify breakpoints that can be reached with max tenacity & max map bonus to figure out how many stacks you are able to obtain from the Ubersmith on your current zone and farm till it reached that point if it\'s attainable.', 'boolean', false, null, 'C3');

	//Wither
	createSetting('rWither', 'Wither', 'Turn this on if you want to enable AT farming until you can 4 shot your current world cell on Wither.', 'boolean', false, null, 'C3');

	//--------------------------------------------------------------

	//Challenges

	//Hide Challenges
	createSetting('rHideChallenge', 'Hide Challenges', 'Enable seeing the hide challenges buttons. Feel free to turn this off once you are done. ', 'boolean', false, null, 'Challenges');
	createSetting('rHideArchaeology', 'Arch', 'Enable to hide Archaeology challenge settings. ', 'boolean', false, null, 'Challenges');
	createSetting('rHideExterminate', 'Exterminate', 'Enable to hide Exterminate challenge settings. ', 'boolean', false, null, 'Challenges');

	//Arch
	createSetting('Rarchon', 'Archaeology', 'Turn on Archaeology settings. ', 'boolean', false, null, 'Challenges');
	createSetting('Rarchstring1', 'First String', 'First string to use in Archaeology. Put the zone you want to stop using this string and start using the second string (Make sure the second string has a value) at the start. I.e: 70,10a,10e ', 'textValue', 'undefined', null, 'Challenges');
	createSetting('Rarchstring2', 'Second String', 'Second string to use in Archaeology. Put the zone you want to stop using this string and start using the third string (Make sure the third string has a value) at the start. I.e: 94,10a,10e ', 'textValue', 'undefined', null, 'Challenges');
	createSetting('Rarchstring3', 'Third String', 'Third string to use in Archaeology. Make sure this is just your Archaeology string and nothing else. I.e: 10a,10e ', 'textValue', 'undefined', null, 'Challenges');

	//Exterminate
	createSetting('Rexterminateon', 'Exterminate', 'Turn on Exterminate settings. This also controls the entireity of Exterminate. If you turn this off it will not calculate Exterminate.', 'boolean', false, null, 'Challenges');
	createSetting('Rexterminatecalc', 'E: Calc', 'Calculate Exterminate enemies instead of the usual ones. May improve your challenge experience. ', 'boolean', false, null, 'Challenges');
	createSetting('Rexterminateeq', 'E: Equality', 'Will manage your equality \'better\' inside the challenge. When you have the experienced buff it will turn it off, when you dont it will turn it on and let it build up.', 'boolean', false, null, 'Challenges');

	//Quagmire
	createSetting('rQuagOn', 'Quagmire', 'Enable Bog Running for Quagmire. ', 'boolean', false, null, 'Challenges');
	createSetting('rQuagPopup', 'Quag Farm Settings', 'Click to adjust settings. ', 'action', 'MAZLookalike("Quagmire Farm", "rQuag", "MAZ")', null, 'Challenges');
	createSetting('rQuagSettings', 'Quag: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Challenges');
	createSetting('rQuagDefaultSettings', 'Quag: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Challenges');
	createSetting('rQuagZone', 'BB: Zone', 'What zones to run Black Bogs at. Can use 40,50,60. ', 'multiValue', [6], null, 'Challenges');

	//Insanity
	createSetting('rInsanityPopup', 'Insanity Farm Settings', 'Click to adjust settings. ', 'action', 'MAZLookalike("Insanity Farm", "rInsanity", "MAZ")', null, 'Challenges');
	createSetting('rInsanitySettings', 'Insanity: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Challenges');
	createSetting('rInsanityDefaultSettings', 'Insanity: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Challenges');
	createSetting('rInsanityZone', 'Insanity Farming', 'Farms for specified stacks in IF: Stacks at zone according to this settings value. Can use 108,109,110. ', 'multiValue', [6], null, 'Challenges');

	//Alchemy
	createSetting('rAlchPopup', 'Alchemy Farm Settings', 'Click to adjust settings.', 'action', 'MAZLookalike("Alchemy Farm", "rAlch", "MAZ")', null, 'Challenges');
	createSetting('rAlchSettings', 'AF: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Challenges');
	createSetting('rAlchDefaultSettings', 'AF: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Challenges');
	createSetting('rAlchZone', 'AF: Zone', 'Which zones you would like to farm at. Can use 59,61,62. ', 'multiValue', [6], null, 'Challenges');

	//Hypothermia
	createSetting('rHypoPopup', 'Hypo Farm Settings', 'Click to adjust settings.', 'action', 'MAZLookalike("Hypothermia Farm", "rHypo", "MAZ")', null, 'Challenges');
	createSetting('rHypoSettings', 'HF: Settings', 'Contains arrays for this setting', 'mazArray', [], null, 'Challenges');
	createSetting('rHypoDefaultSettings', 'HF: Settings', 'Contains arrays for this setting', 'mazDefaultArray', { active: false }, null, 'Challenges');
	createSetting('rHypoZone', 'HF: Zone', 'Which zones you would like to farm at. Can use 59,61,62. ', 'multiValue', [-1], null, 'Challenges');

	//--------------------------------------------------------------

	//Combat
	//Helium
	createSetting('BetterAutoFight', ['Better AutoFight OFF', 'Better Auto Fight', 'Vanilla'], '3-Way Button, Recommended. Will automatically handle fighting.<br>BAF = Old Algo (Fights if dead, new squad ready, new squad breed timer target exceeded, and if breeding takes under 0.5 seconds<br>BAF3 = Uses vanilla autofight and makes sure you fight on portal. <br> WARNING: If you autoportal with BetterAutoFight disabled, the game may sit there doing nothing until you click FIGHT. (not good for afk) ', 'multitoggle', 1, null, "Combat");
	createSetting('AutoStance', ['Auto Stance OFF', 'Auto Stance', 'D Stance', 'Windstacking'], '<b>Autostance:</b> Automatically swap stances to avoid death. <br><b>D Stance:</b> Keeps you in D stance regardless of Health. <br><b>Windstacking:</b> For use after nature (z230), and will keep you in D stance unless you are windstacking (Only useful if transfer is maxed out and wind empowerment is high). Manages your Heirloom swapping and stance to obtain wind stacks efficiently. You must set your High Dmg and Low Dmg Heirlooms, Windstack H:D or WSMAX H:D where relevant for this to work. ', 'multitoggle', 1, null, "Combat");
	createSetting('IgnoreCrits', ['Safety First', 'Ignore Void Strength', 'Ignore All Crits'], 'No longer switches to B against corrupted precision and/or void strength. <b>Basically we now treat \'crit things\' as regular in both autoStance and autoStance2</b>. In fact it no longer takes precision / strength into account and will manage like a normal enemy, thus retaining X / D depending on your needs. If you\'re certain your block is high enough regardless if you\'re fighting a crit guy in a crit daily, use this! Alternatively, manage the stances yourself.', 'multitoggle', 0, null, 'Combat');
	createSetting('PowerSaving', ['AutoAbandon', 'Don\'t Abandon', 'Only Rush Voids'], '<b>Autoabandon:</b> Considers abandoning trimps for void maps/prestiges.<br><b>Don\'t Abandon:</b> Will not abandon troops, but will still agressively autostance even if it will kill you (WILL NOT ABANDON TRIMPS TO DO VOIDS).<br><b>Only Rush Voids:</b> Considers abandoning trimps for void maps, but not prestiges, still autostances aggressively. <br>Made for Empower daily, and you might find this helpful if you\'re doing Workplace Safety feat. Then again with that I strongly recommend doing it fully manually. Anyway, don\'t blame me whatever happens.<br><b>Note:</b> AT will no longer be able to fix when your scryer gets stuck!', 'multitoggle', 0, null, 'Combat');
	createSetting('ForceAbandon', 'Trimpicide', 'If a new fight group is available and anticipation stacks aren\'t maxed, Trimpicide and grab a new group. Will not abandon in spire. Recommended ON. ', 'boolean', true, null, 'Combat');
	createSetting('AutoRoboTrimp', 'AutoRoboTrimp', 'Use RoboTrimps ability starting at this level, and every 5 levels thereafter. (set to 0 to disable. default 60.) 60 is a good choice for mostly everybody.', 'value', '60', null, 'Combat');
	createSetting('fightforever', 'Fight Always', 'U1: -1 to disable. Sends trimps to fight if they\'re not fighting, regardless of BAF. Has 2 uses. Set to 0 to always send out trimps. Or set a number higher than 0 to enable the H:D function. If the H:D ratio is below this number it will send them out. I.e, this is set to 1, it will send out trimps regardless with the H:D ratio is below 1. ', 'value', '-1', null, 'Combat');
	createSetting('addpoison', 'Poison Calc', '<b>Experimental. </b><br>Adds poison to the battlecalc. May improve your poison zone speed. ', 'boolean', false, null, 'Combat');
	createSetting('fullice', 'Ice Calc', '<b>Experimental. </b><br>Always calculates your ice to be a consistent level instead of going by the enemy debuff. Stops H:D spazzing out. ', 'boolean', false, null, 'Combat');
	createSetting('45stacks', 'Antistack Calc', '<b>Experimental. </b><br>Always calcs your damage as having full antistacks. Useful for windstacking. ', 'boolean', false, null, 'Combat');

	//Radon
	createSetting('rManageEquality', ['Auto Equality Off', 'Auto Equality: Basic', 'Auto Equality: Advanced'], 'Manages Equality settings for you. <br><br><b>Auto Equality: Basic</b><br>Sets Equality to 0 on Slow enemies, and Autoscaling on for Fast enemies.<br><br><b>Auto Equality: Advanced</b><br>Will automatically identify the best equality levels to kill the current enemy and change it when necessary.', 'multitoggle', 0, null, 'Combat');
	createSetting('Rcalcmaxequality', ['Equality Calc Off', 'EC: On', 'EC: Health'], '<b>Experimental. </b><br>Adds Equality Scaling levels to the battlecalc. Will always calculate equality based on actual scaling levels when its turned off by other settings. Assumes you use Equality Scaling. Turning this on allows in-game Equality Scaling to adjust your Health accordingly. EC: Health only decreases enemies attack in the calculation which may improve speed. ', 'multitoggle', 0, null, 'Combat');
	createSetting('rCalcGammaBurst', 'Gamma Burst Calc', '<b>Experimental.</b><br>Adds Gamma Burst to your HD Ratio. Be warned, it will assume that you have a gamma burst ready to trigger for every attack so your HD Ratio might be 1 but you\'d need to attack 4-5 times to reach that damage theshold.', 'boolean', true, null, 'Combat');
	createSetting('Rcalcfrenzy', 'Frenzy Calc', '<b>Experimental.</b><br>Adds frenzy to the calc. Be warned, it will not farm as much with this on as it expects 100% frenzy uptime.', 'boolean', false, null, 'Combat');
	createSetting('rMutationCalc', 'Mutation Calc', 'Whether you\'d like to factor Mutations into HD calc.', 'boolean', false, null, 'Combat');

	//--------------------------------------------------------------

	//Scryer
	createSetting('UseScryerStance', 'Enable Scryer Stance', '<b>MASTER BUTTON</b> Activates all other scrying settings, and overrides AutoStance when scryer conditions are met. Leave regular Autostance on while this is active. Scryer gives 2x Resources (Non-Helium/Nullifium) and a chance for Dark Essence. Once this is on, priority for Scryer decisions goes as such:<br>NEVER USE, FORCE USE, OVERKILL, MIN/MAX ZONE<br><br><b>NO OTHER BUTTONS WILL DO ANYTHING IF THIS IS OFF.</b>', 'boolean', true, null, 'Scryer');
	createSetting('ScryerUseWhenOverkill', 'Use When Overkill', 'Overrides everything! Toggles stance when we can Overkill in S, giving us double loot with no speed penalty (minimum one overkill, if you have more than 1, it will lose speed) <b>NOTE:</b> This being on, and being able to overkill in S will override ALL other settings <u>(Except never use in spire)</u>. This is a boolean logic shortcut that disregards all the other settings including Min and Max Zone. If you ONLY want to use S during Overkill, as a workaround: turn this on and Min zone: to 9999 and everything else off(red). ', 'boolean', true, null, 'Scryer');
	createSetting('ScryerMinZone', 'Min Zone', 'Minimum zone to start using scryer in.(inclusive) Recommend:(60 or 181). Overkill ignores this. This needs to be On & Valid for the <i>MAYBE</i> option on all other Scryer settings to do anything if Overkill is off. Tip: Use 9999 to disable all Non-Overkill, Non-Force, scryer usage.', 'value', '181', null, 'Scryer');
	createSetting('ScryerMaxZone', 'Max Zone', '<b>0 or -1 to disable (Recommended)</b><br>Overkill ignores this. Zone to STOP using scryer at (not inclusive). Turning this ON with a positive number stops <i>MAYBE</i> use of all other Scryer settings.', 'value', '230', null, 'Scryer');
	createSetting('onlyminmaxworld', 'World Min & Max Only', 'Forces Scryer to only work in world regardless of other settings. ', 'boolean', false, null, 'Scryer');
	createSetting('ScryerUseinMaps2', ['Maps: NEVER', 'Maps: FORCE', 'Maps: MAYBE'], '<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate in Maps<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br>This setting requires use on Corrupteds to be on after corruption/magma.<br><br>Recommend MAYBE.', 'multitoggle', 2, null, 'Scryer');
	createSetting('ScryerUseinVoidMaps2', ['VoidMaps: NEVER', 'VoidMaps: FORCE', 'VoidMaps: MAYBE'], '<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate in Void Maps<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed. ', 'multitoggle', 0, null, 'Scryer');
	createSetting('ScryerUseinPMaps', ['P Maps: NEVER', 'P Maps: FORCE', 'P Maps: MAYBE'], '<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate in maps higher than your zone<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br>Recommend NEVER.', 'multitoggle', 0, null, 'Scryer');
	createSetting('ScryerUseinBW', ['BW: NEVER', 'BW: FORCE', 'BW: MAYBE'], '<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate in BW Maps<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br>This setting requires use in Maps to be on. <br><br>Recommend NEVER.', 'multitoggle', 0, null, 'Scryer');
	createSetting('ScryerUseinSpire2', ['Spire: NEVER', 'Spire: FORCE', 'Spire: MAYBE'], '<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate in the Spire<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br>This setting requires use on Corrupteds to be on for corrupted enemies.<br><br>Recommend NEVER.', 'multitoggle', 0, null, 'Scryer');
	createSetting('ScryerSkipBoss2', ['Boss: NEVER (All Levels)', 'Boss: NEVER (Above VoidLevel)', 'Boss: MAYBE'], '<b>NEVER (All Levels)</b> will NEVER use S in cell 100 of the world!!!<br><b>NEVER (Above VoidLevel)</b> will NEVER use S in cell 100 of the world ABOVE the zone that your void maps are set to run at (Maps).<br><b>MAYBE</b> treats the cell no differently to any other, Overkill and Min/Max Scryer is allowed.<br><br>Recommend NEVER (There is little benefit to double NON-HELIUM resources and a small chance of DE).', 'multitoggle', 0, null, 'Scryer');
	createSetting('ScryerSkipCorrupteds2', ['Corrupted: NEVER', 'Corrupted: FORCE', 'Corrupted: MAYBE'], '<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate against Corrupted enemies<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br><b>Magma maps and Corrupted Voidmaps are currently classified as corrupted</b> and NEVER here will override Maps and Voidmaps use of Scryer<br><br>Recommend MAYBE.', 'multitoggle', 2, null, 'Scryer');
	createSetting('ScryerSkipHealthy', ['Healthy: NEVER', 'Healthy: FORCE', 'Healthy: MAYBE'], '<b>NEVER</b> Means what it says!!!<br><b>FORCE</b> means Scryer will ALWAYS activate against Healthy enemies<br><b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br><b>Corrupted Voidmaps are currently classified as Healthy (same as corrupted)</b> and NEVER here will override Maps and Voidmaps use of Scryer<br><br>Recommend MAYBE.', 'multitoggle', 2, null, 'Scryer');
	createSetting('ScryUseinPoison', 'Scry in Poison', 'Decides what you do in Poison. <br><b>-1</b> = Maybe <br><b>0</b> = Never <br><b>Above 0</b> = Max Zone you want it scrying ', 'value', -1, null, 'Scryer');
	createSetting('ScryUseinWind', 'Scry in Wind', 'Decides what you do in Wind. <br><b>-1</b> = Maybe <br><b>0</b> = Never <br><b>Above 0</b> = Max Zone you want it scrying', 'value', -1, null, 'Scryer');
	createSetting('ScryUseinIce', 'Scry in Ice', 'Decides what you do in Ice. <br><b>-1</b> = Maybe <br><b>0</b> = Never <br><b>Above 0</b> = Max Zone you want it scrying', 'value', -1, null, 'Scryer');
	createSetting('ScryerDieZ', 'Die To Use S', '<b>-1 to disable.</b><br>Turning this on will switch you back to S even when doing so would kill you. Happens in scenarios where you used Skip Corrupteds that took you into regular Autostance X/H stance, killed the corrupted and reached a non-corrupted enemy that you wish to use S on, but you havent bred yet and you are too low on health to just switch back to S. So you\'d rather die, wait to breed, then use S for the full non-corrupted enemy, to maximize DE. NOTE: Use at your own risk.<br>Use this input to set the minimum zone that scryer activates in (You can use decimal values to specify what cell this setting starts from)', 'value', 230.60, null, 'Scryer');
	createSetting('screwessence', 'Remaining Essence Only', 'Why scry when theres no essence? Turns off scrying when the remaining enemies with essence drops to 0. ', 'boolean', false, null, 'Scryer');

	//--------------------------------------------------------------

	//Magma
	createSetting('UseAutoGen', 'Auto Generator', 'Turn this on to use these settings. ', 'boolean', false, null, 'Magma');
	createSetting('beforegen', ['Gain Mi', 'Gain Fuel', 'Hybrid'], '<b>MODE BEFORE FUELING: </b>Which mode to use before fueling. This is the mode which the generator will use if you fuel after z230. ', 'multitoggle', 1, null, 'Magma');
	createSetting('fuellater', 'Start Fuel Z', 'Start fueling at this zone instead of 230. I would suggest you have a value lower than your max, for obvious reasons. Recommend starting at a value close-ish to your max supply. Use 230 to use your <b>BEFORE FUEL</b> setting. ', 'value', -1, null, 'Magma');
	createSetting('fuelend', 'End Fuel Z', 'End fueling at this zone. After this zone is reached, will follow your preference. -1 to fuel infinitely. ', 'value', -1, null, 'Magma');
	createSetting('defaultgen', ['Gain Mi', 'Gain Fuel', 'Hybrid'], '<b>MODE AFTER FUELING: </b>Which mode to use after fueling. ', 'multitoggle', 1, null, 'Magma');
	createSetting('AutoGenDC', ['Daily: Normal', 'Daily: Fuel', 'Daily: Hybrid'], '<b>Normal:</b> Uses the AutoGen settings. <br><b>Fuel:</b> Fuels the entire Daily. <br><b>Hybrid:</b> Uses Hybrid for the entire Daily. ', 'multitoggle', 1, null, 'Magma');
	createSetting('AutoGenC2', ['C2: Normal', 'C2: Fuel', 'C2: Hybrid'], '<b>Normal:</b> Uses the AutoGen settings. <br><b>Fuel:</b> Fuels the entire C2. <br><b>Hybrid:</b> Uses Hybrid for the entire C2. ', 'multitoggle', 1, null, 'Magma');

	//Spend Mi
	createSetting('spendmagmite', ['Spend Magmite OFF', 'Spend Magmite (Portal)', 'Spend Magmite Always'], 'Auto Spends any unspent Magmite immediately before portaling. (Or Always, if toggled). Part 1 buys any permanent one-and-done upgrades in order from most expensive to least. Part 2 then analyzes Efficiency vs Capacity for cost/benefit, and buys Efficiency if its BETTER than Capacity. If not, if the PRICE of Capacity is less than the price of Supply, it buys Capacity. If not, it buys Supply. And then it repeats itself until you run out of Magmite and cant buy anymore. ', 'multitoggle', 1, null, 'Magma');
	createSetting('ratiospend', 'Ratio Spending', 'Spends Magmite in a Ratio you define. ', 'boolean', false, null, 'Magma');
	createSetting('effratio', 'Efficiency', 'Use -1 or 0 to not spend on this. Any value above 0 will spend. ', 'value', -1, null, 'Magma');
	createSetting('capratio', 'Capacity', 'Use -1 or 0 to not spend on this. Any value above 0 will spend. ', 'value', -1, null, 'Magma');
	createSetting('supratio', 'Supply', 'Use -1 or 0 to not spend on this. Any value above 0 will spend. ', 'value', -1, null, 'Magma');
	createSetting('ocratio', 'Overclocker', 'Use -1 or 0 to not spend on this. Any value above 0 will spend. ', 'value', -1, null, 'Magma');
	createSetting('SupplyWall', 'Throttle Supply (or Capacity)', 'Positive number NOT 1 e.g. 2.5: Consider Supply when its cost * 2.5 is < Capacity, instead of immediately when < Cap. Effectively throttles supply for when you don\'t need too many.<br><br>Negative number (-1 is ok) e.g. -2.5: Consider Supply if it costs < Capacity * 2.5, buy more supplys! Effectively throttling capacity instead.<br><br><b>Set to 1: DISABLE SUPPLY only spend magmite on Efficiency, Capacity and Overclocker. Always try to get supply close to your HZE. <br>Set to 0: IGNORE SETTING and use old behaviour (will still try to buy overclocker)</b>', 'valueNegative', 0.4, null, 'Magma');
	createSetting('spendmagmitesetting', ['Normal', 'Normal & No OC', 'OneTime Only', 'OneTime & OC'], '<b>Normal:</b> Spends Magmite Normally as Explained in Magmite spending behaviour. <br><b>Normal & No OC:</b> Same as normal, except skips OC afterbuying 1 OC upgrade. <br><b>OneTime Only:</b> Only Buys the One off upgrades except skips OC afterbuying 1 OC upgrade. <br><b>OneTime & OC:</b> Buys all One off upgrades, then buys OC only. ', 'multitoggle', 0, null, 'Magma');
	createSetting('MagmiteExplain', 'Magmite spending behaviour', '1. Buy one-and-done upgrades, expensive first, then consider 1st level of Overclocker;<br>2. Buy Overclocker IF AND ONLY IF we can afford it;<br>2.5. Exit if OneTimeOnly<br>3. Buy Efficiency if it is better than capacity;<br>4. Buy Capacity or Supply depending on which is cheaper, or based on SupplyWall', 'infoclick', 'MagmiteExplain', null, 'Magma');

	//--------------------------------------------------------------

	//Heirloom
	//Heirloom Swapping
	createSetting('Hhs', 'Heirloom Swapping', 'Heirloom swapping master button. Turn this on to allow heirloom swapping and its associated settings. ', 'boolean', false, null, 'Heirlooms');
	createSetting('HhsMapSwap', 'Map Swap', 'Toggle to swap to your afterpush shield when inside maps', 'boolean', false, null, 'Heirlooms');

	//Shield swapping
	createSetting('HhsShield', 'Shields', 'Toggle to swap Shields', 'boolean', false, null, 'Heirlooms');
	createSetting('HhsInitial', 'Initial', '<b>First Heirloom to use</b><br><br>Enter the name of your first heirloom. This is the heirloom that you will use before swapping to the second heirloom at the zone you have defined in the HS: Zone. ', 'textValue', 'undefined', null, 'Heirlooms');
	createSetting('HhsAfterpush', 'Afterpush', '<b>Second Heirloom to use</b><br><br>Enter the name of your second heirloom. This is the heirloom that you will use after swapping from the first heirloom at the zone you have defined in the HS: Zone. ', 'textValue', 'undefined', null, 'Heirlooms');
	createSetting('HhsC3', 'C3', '<b>C3 heirloom to use</b><br><br>Enter the name of the heirloom you would like to use during C3\s and special challenges (Mayhem, Pandemonium).', 'textValue', 'undefined', null, 'Heirlooms');
	createSetting('HhsSwapZone', 'Swap Zone', 'Which zone to swap from your first heirloom you have defined to your second heirloom you have defined. I.e if this value is 75 it will switch to the second heirloom <b>on z75</b>', 'value', '-1', null, 'Heirlooms');
	createSetting('HhsDailySwapZone', 'Daily Swap Zone', 'Which zone to swap from your first heirloom you have defined to your second heirloom you have defined. I.e if this value is 75 it will switch to the second heirloom <b>on z75</b>', 'value', '-1', null, 'Heirlooms');
	createSetting('HhsC3SwapZone', 'C3 Swap Zone', 'Which zone to swap from your first heirloom you have defined to the C3 heirloom you have defined. I.e if this value is 75 it will switch to the C3 heirloom <b>on z75</b>', 'value', -1, null, 'Heirlooms');

	//Staff swapping
	createSetting('HhsStaff', 'Staffs', 'Toggle to swap Staffs', 'boolean', false, null, 'Heirlooms');
	createSetting('HhsWorldStaff', 'World', '<b>World Staff</b><br><br>Enter the name of your world staff.', 'textValue', 'undefined', null, 'Heirlooms');
	createSetting('HhsMapStaff', 'Map', '<b>General Map Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside maps, will be overwritten by the proceeding 3 heirloom settings if they\'re being used otherwise will work in every maptype.', 'textValue', 'undefined', null, 'Heirlooms');
	createSetting('HhsFoodStaff', 'Savory Cache', '<b>Savory Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Savory Cache maps. Will use this staff for Tribute farming if it\'s enabled.', 'textValue', 'undefined', null, 'Heirlooms');
	createSetting('HhsWoodStaff', 'Wooden Cache', '<b>Wooden Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Wooden Cache maps.', 'textValue', 'undefined', null, 'Heirlooms');
	createSetting('HhsMetalStaff', 'Metal Cache', '<b>Metal Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Metal Cache maps.', 'textValue', 'undefined', null, 'Heirlooms');

	//Heirloom Swapping
	createSetting('Rhs', 'Heirloom Swapping', 'Heirloom swapping master button. Turn this on to allow heirloom swapping and its associated settings. ', 'boolean', false, null, 'Heirlooms');
	createSetting('RhsMapSwap', 'Map Swap', 'Toggle to swap to your afterpush shield when inside maps', 'boolean', false, null, 'Heirlooms');
	createSetting('RhsVoidSwap', 'Void PB Swap', 'Toggle to swap to your initial shield when your current enemy is slow and the next enemy is fast to maximise plaguebringer damage.<br><br>Will only run during Void Maps that aren\'t double attack and won\'t function properly if your Initial Shield has PlagueBringer or your Afterpush shield doesn\'t have PlagueBringer.', 'boolean', false, null, 'Heirlooms');

	//Shield swapping
	createSetting('RhsShield', 'Shields', 'Toggle to swap Shields', 'boolean', false, null, 'Heirlooms');
	createSetting('RhsInitial', 'Initial', '<b>First Heirloom to use</b><br><br>Enter the name of your first heirloom. This is the heirloom that you will use before swapping to the second heirloom at the zone you have defined in the HS: Zone. ', 'textValue', 'undefined', null, 'Heirlooms');
	createSetting('RhsAfterpush', 'Afterpush', '<b>Second Heirloom to use</b><br><br>Enter the name of your second heirloom. This is the heirloom that you will use after swapping from the first heirloom at the zone you have defined in the HS: Zone. ', 'textValue', 'undefined', null, 'Heirlooms');
	createSetting('RhsC3', 'C3', '<b>C3 heirloom to use</b><br><br>Enter the name of the heirloom you would like to use during C3\s and special challenges (Mayhem, Pandemonium).', 'textValue', 'undefined', null, 'Heirlooms');
	createSetting('RhsSwapZone', 'Swap Zone', 'Which zone to swap from your first heirloom you have defined to your second heirloom you have defined. I.e if this value is 75 it will switch to the second heirloom <b>on z75</b>', 'value', '-1', null, 'Heirlooms');
	createSetting('RhsDailySwapZone', 'Daily Swap Zone', 'Which zone to swap from your first heirloom you have defined to your second heirloom you have defined. I.e if this value is 75 it will switch to the second heirloom <b>on z75</b>', 'value', '-1', null, 'Heirlooms');
	createSetting('RhsC3SwapZone', 'C3 Swap Zone', 'Which zone to swap from your first heirloom you have defined to the C3 heirloom you have defined. I.e if this value is 75 it will switch to the C3 heirloom <b>on z75</b>', 'value', -1, null, 'Heirlooms');

	//Staff swapping
	createSetting('RhsStaff', 'Staffs', 'Toggle to swap Staffs', 'boolean', false, null, 'Heirlooms');
	createSetting('RhsWorldStaff', 'World', '<b>World Staff</b><br><br>Enter the name of your world staff.', 'textValue', 'undefined', null, 'Heirlooms');
	createSetting('RhsMapStaff', 'Map', '<b>General Map Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside maps, will be overwritten by the proceeding 3 heirloom settings if they\'re being used otherwise will work in every maptype.', 'textValue', 'undefined', null, 'Heirlooms');
	createSetting('RhsFoodStaff', 'Savory Cache', '<b>Savory Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Savory Cache maps. Will use this staff for Tribute farming if it\'s enabled.', 'textValue', 'undefined', null, 'Heirlooms');
	createSetting('RhsWoodStaff', 'Wooden Cache', '<b>Wooden Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Wooden Cache maps.', 'textValue', 'undefined', null, 'Heirlooms');
	createSetting('RhsMetalStaff', 'Metal Cache', '<b>Metal Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Metal Cache maps.', 'textValue', 'undefined', null, 'Heirlooms');
	createSetting('RhsResourceStaff', 'Resource Cache', '<b>Resource Cache Staff</b><br><br>Enter the name of the staff you would like to equip whilst inside Small or Large Resource (Science) Cache maps.', 'textValue', 'undefined', null, 'Heirlooms');

	//Heirloom Line
	createSetting('autoheirlooms', 'Auto Heirlooms', 'Auto Heirlooms master button. Turn this on to enable all Auto Heirloom settings. <br><br><b>The Modifier points will be explained here.</b> The more points an heirloom has, the better chance it has of being kept. If empty is selected, it will muliplty the score by 4. If any is selected, it will multiply the score of the heirloom by 2. <br><br>E.g Mod 1 = CC (+6 if dropped, 1st modifier) <br>Mod 2 = CD (+5 if dropped, 2nd modifier) <br>Mod 3 = PB (+4 if dropped, 3rd modifier) <br>Mod 4 = Empty (x4 if dropped, +0 if not) <br>Mod 5 = Empty (x4 if dropped, +0 if not) <br><br>If an heirloom dropped with these exact modifiers, it would get a score of 192 (6+5+4*4*4=240). The highest point heirlooms will be kept. ', 'boolean', false, null, 'Heirlooms');
	createSetting('typetokeep', ['None', 'Shields', 'Staffs', 'Cores', 'All'], '<b>Shields: </b>Keeps Shields and nothing else.<br><b>Staffs: </b>Keeps Staffs and nothing else.<br><b>Cores: </b>Keeps Cores and nothing else.<br><b>All: </b>Keeps 4 Shields and 3 Staffs and 3 Cores. If you have protected heirlooms in your inventory it will overrite one slot. E.g if one heirloom is protected, you will keep 4 Shields and 3 Staffs and 2 Cores. ', 'multitoggle', 0, null, 'Heirlooms');
	createSetting('raretokeep', 'Rarity to Keep', 'Auto Heirlooms. Keeps the selected rarity of heirloom, recycles all others. ', 'dropdown', 'Any', ["None", "Common", "Uncommon", "Rare", "Epic", "Legendary", "Magnificent", "Ethereal", "Magmatic", "Plagued", "Radiating", "Hazardous", "Enigmatic"], 'Heirlooms');
	createSetting('autoheirloomsperfect', 'Only Perfect', 'Will make sure that Auto Heirlooms will only keep heirlooms that have the mods you selected on them. Be warned you have to ensure that all modifier slots have been selected when using this setting or it won\'t function properly.', 'boolean', false, null, 'Heirlooms');

	//Shield Line
	createSetting('keepshields', 'Shields', 'Auto Heirlooms. Enables in-depth shield settings. ', 'boolean', false, null, 'Heirlooms');
	createSetting('slot1modsh', 'Shield: Modifier 1', 'Auto Heirlooms. Keeps Shields with selected Mod. Modifier 1 is worth 6 points. ', 'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms');
	createSetting('slot2modsh', 'Shield: Modifier 2', 'Auto Heirlooms. Keeps Shields with selected Mod. Modifier 2 is worth 5 points. ', 'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms');
	createSetting('slot3modsh', 'Shield: Modifier 3', 'Auto Heirlooms. Keeps Shields with selected Mod. Modifier 3 is worth 4 points. ', 'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms');
	createSetting('slot4modsh', 'Shield: Modifier 4', 'Auto Heirlooms. Keeps Shields with selected Mod. Modifier 4 is worth 3 points. ', 'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms');
	createSetting('slot5modsh', 'Shield: Modifier 5', 'Auto Heirlooms. Keeps Shields with selected Mod. Modifier 5 is worth 2 points. ', 'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms');
	createSetting('slot6modsh', 'Shield: Modifier 6', 'Auto Heirlooms. Keeps Shields with selected Mod. Modifier 6 is worth 1 points. ', 'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms');
	createSetting('slot7modsh', 'Shield: Modifier 7', 'Auto Heirlooms. Keeps Shields with selected Mod. Modifier 7 is worth 1 points. ', 'dropdown', 'empty', ["empty", "playerEfficiency", "trainerEfficiency", "storageSize", "breedSpeed", "trimpHealth", "trimpAttack", "trimpBlock", "critDamage", "critChance", "voidMaps", "plaguebringer", "prismatic", "gammaBurst", "inequality"], 'Heirlooms');

	//Staff Line
	createSetting('keepstaffs', 'Staffs', 'Auto Heirlooms. Enables in-depth staff settings. ', 'boolean', false, null, 'Heirlooms');
	createSetting('slot1modst', 'Staff: Modifier 1', 'Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 1 is worth 6 points. ', 'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "minerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms');
	createSetting('slot2modst', 'Staff: Modifier 2', 'Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 2 is worth 5 points. ', 'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "minerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms');
	createSetting('slot3modst', 'Staff: Modifier 3', 'Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 3 is worth 4 points. ', 'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "minerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms');
	createSetting('slot4modst', 'Staff: Modifier 4', 'Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 4 is worth 3 points. ', 'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "minerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms');
	createSetting('slot5modst', 'Staff: Modifier 5', 'Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 5 is worth 2 points. ', 'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "minerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms');
	createSetting('slot6modst', 'Staff: Modifier 6', 'Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 6 is worth 1 points. ', 'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "minerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms');
	createSetting('slot7modst', 'Staff: Modifier 7', 'Auto Heirlooms. Keeps Staffs with selected Mod. Modifier 7 is worth 1 points. ', 'dropdown', 'empty', ["empty", "metalDrop", "foodDrop", "woodDrop", "gemsDrop", "fragmentsDrop", "minerSpeed", "FarmerSpeed", "LumberjackSpeed", "DragimpSpeed", "ExplorerSpeed", "ScientistSpeed", "FluffyExp", "ParityPower"], 'Heirlooms');

	//Core Line
	createSetting('keepcores', 'Cores', 'Auto Heirlooms. Enables in-depth core settings. ', 'boolean', false, null, 'Heirlooms');
	createSetting('slot1modcr', 'Cores: Modifier 1', 'Auto Heirlooms. Keeps Cores with selected Mod. Modifier 1 is worth 5 points. ', 'dropdown', 'empty', ["empty", "fireTrap", "poisonTrap", "lightningTrap", "runestones", "strengthEffect", "condenserEffect"], 'Heirlooms');
	createSetting('slot2modcr', 'Cores: Modifier 2', 'Auto Heirlooms. Keeps Cores with selected Mod. Modifier 2 is worth 4 points. ', 'dropdown', 'empty', ["empty", "fireTrap", "poisonTrap", "lightningTrap", "runestones", "strengthEffect", "condenserEffect"], 'Heirlooms');
	createSetting('slot3modcr', 'Cores: Modifier 3', 'Auto Heirlooms. Keeps Cores with selected Mod. Modifier 3 is worth 3 points. ', 'dropdown', 'empty', ["empty", "fireTrap", "poisonTrap", "lightningTrap", "runestones", "strengthEffect", "condenserEffect"], 'Heirlooms');
	createSetting('slot4modcr', 'Cores: Modifier 4', 'Auto Heirlooms. Keeps Cores with selected Mod. Modifier 4 is worth 2 points. ', 'dropdown', 'empty', ["empty", "fireTrap", "poisonTrap", "lightningTrap", "runestones", "strengthEffect", "condenserEffect"], 'Heirlooms');

	//--------------------------------------------------------------

	//Golden
	//Helium

	createSetting('hAutoGoldenPopup', 'Auto Gold Settings', 'Click to adjust settings. ', 'action', 'MAZLookalike("Auto Golden", "hAutoGolden", "MAZ")', null, 'Golden');
	createSetting('hAutoGoldenSettings', 'C3 AutoGoldenUpgrades', 'Contains arrays for this setting', 'mazArray', [], null, 'Golden');
	createSetting('hAutoGoldenDailyPopup', 'Daily Auto Gold Settings', 'Click to adjust settings. ', 'action', 'MAZLookalike("Daily Auto Golden", "hAutoGoldenDaily", "MAZ")', null, 'Golden');
	createSetting('hAutoGoldenDailySettings', 'C3 AutoGoldenUpgrades', 'Contains arrays for this setting', 'mazArray', [], null, 'Golden');
	createSetting('hAutoGoldenC3Popup', 'C3 Auto Gold Settings', 'Click to adjust settings. ', 'action', 'MAZLookalike("C3 Auto Golden", "hAutoGoldenC3", "MAZ")', null, 'Golden');
	createSetting('hAutoGoldenC3Settings', 'C3 AutoGoldenUpgrades', 'Contains arrays for this setting', 'mazArray', [], null, 'Golden');

	createSetting('rAutoGoldenPopup', 'Auto Gold Settings', 'Click to adjust settings. ', 'action', 'MAZLookalike("Auto Golden", "rAutoGolden", "MAZ")', null, 'Golden');
	createSetting('rAutoGoldenSettings', 'C3 AutoGoldenUpgrades', 'Contains arrays for this setting', 'mazArray', [], null, 'Golden');
	createSetting('rAutoGoldenDailyPopup', 'Daily Auto Gold Settings', 'Click to adjust settings. ', 'action', 'MAZLookalike("Daily Auto Golden", "rAutoGoldenDaily", "MAZ")', null, 'Golden');
	createSetting('rAutoGoldenDailySettings', 'C3 AutoGoldenUpgrades', 'Contains arrays for this setting', 'mazArray', [], null, 'Golden');
	createSetting('rAutoGoldenC3Popup', 'C3 Auto Gold Settings', 'Click to adjust settings. ', 'action', 'MAZLookalike("C3 Auto Golden", "rAutoGoldenC3", "MAZ")', null, 'Golden');
	createSetting('rAutoGoldenC3Settings', 'C3 AutoGoldenUpgrades', 'Contains arrays for this setting', 'mazArray', [], null, 'Golden');

	//--------------------------------------------------------------

	//Nature
	//Tokens
	createSetting('AutoNatureTokens', 'Spend Nature Tokens', '<b>MASTER BUTTON</b> Automatically spend or convert nature tokens.', 'boolean', false, null, 'Nature');
	createSetting('tokenthresh', 'Token Threshold', 'If Tokens would go below this value it will not convert tokens. ', 'value', -1, null, 'Nature');
	createSetting('AutoPoison', 'Poison', 'Spend/convert Poison tokens', 'dropdown', 'Off', ['Off', 'Empowerment', 'Transfer', 'Convert to Wind', 'Convert to Ice', 'Convert to Both'], 'Nature');
	createSetting('AutoWind', 'Wind', 'Spend/convert Wind tokens', 'dropdown', 'Off', ['Off', 'Empowerment', 'Transfer', 'Convert to Poison', 'Convert to Ice', 'Convert to Both'], 'Nature');
	createSetting('AutoIce', 'Ice', 'Spend/convert Ice tokens', 'dropdown', 'Off', ['Off', 'Empowerment', 'Transfer', 'Convert to Poison', 'Convert to Wind', 'Convert to Both'], 'Nature');

	//Enlights
	createSetting('autoenlight', 'Enlight: Auto', 'Enables Automatic Enlightenment. Use the settings to define how it works. ', 'boolean', false, null, 'Nature');
	createSetting('pfillerenlightthresh', 'E: F: Poison', 'Activate Poison Enlight when Enlight cost is below this Thresh in Fillers. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature');
	createSetting('wfillerenlightthresh', 'E: F: Wind', 'Activate Wind Enlight when Enlight cost is below this Thresh in Fillers. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature');
	createSetting('ifillerenlightthresh', 'E: F: Ice', 'Activate Ice Enlight when Enlight cost is below this Thresh in Fillers. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature');
	createSetting('pdailyenlightthresh', 'E: D: Poison', 'Activate Poison Enlight when Enlight cost is below this Thresh in Dailies. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature');
	createSetting('wdailyenlightthresh', 'E: D: Wind', 'Activate Wind Enlight when Enlight cost is below this Thresh in Dailies. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature');
	createSetting('idailyenlightthresh', 'E: D: Ice', 'Activate Ice Enlight when Enlight cost is below this Thresh in Dailies. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature');
	createSetting('pc2enlightthresh', 'E: C: Poison', 'Activate Poison Enlight when Enlight cost is below this Thresh in C2s. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature');
	createSetting('wc2enlightthresh', 'E: C: Wind', 'Activate Wind Enlight when Enlight cost is below this Thresh in C2s. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature');
	createSetting('ic2enlightthresh', 'E: C: Ice', 'Activate Ice Enlight when Enlight cost is below this Thresh in C2s. Consumes Tokens. -1 to disable. ', 'value', -1, null, 'Nature');

	//Display
	createSetting('EnhanceGrids', 'Enhance Grids', 'Apply slight visual enhancements to world and map grids that highlights with drop shadow all the exotic, powerful, skeletimps and other special imps.', 'boolean', false, null, 'Display');
	createSetting('showbreedtimer', 'Enable Breed Timer', 'Enables the display of the hidden breedtimer. Turn this off to reduce memory. ', 'boolean', true, null, 'Display');
	createSetting('showautomapstatus', 'Enable AutoMap Status', 'Enables the display of the map status. Turn this off to reduce memory. ', 'boolean', true, null, 'Display');
	createSetting('showhehr', 'Enable He/hr status', 'Enables the display of your helium per hour. Turn this off to reduce memory. ', 'boolean', true, null, 'Display');
	createSetting('Rshowautomapstatus', 'Enable AutoMap Status', 'Enables the display of the map status. Turn this off to reduce memory. ', 'boolean', true, null, 'Display');
	createSetting('Rshowrnhr', 'Enable Rn/hr status', 'Enables the display of your radon per hour. Turn this off to reduce memory. ', 'boolean', true, null, 'Display');
	createSetting('rMapRepeatCount', 'Map Count Output', 'When you finish doing farming for any types of special farming this setting will display a message stating the amount of maps it took to complete and the time it took (format is h:m:s).', 'boolean', true, null, 'Display');
	createSetting('rDisplayAllSettings', 'Display all u2 settings', 'Will display all of the locked settings that have HZE requirements to be displayed.', 'boolean', true, null, 'Display');
	createSetting('debugEqualityStats', 'debugEqualityStats', 'Will display details of trimp/enemy stats when you gamma burst.', 'boolean', false, null, 'Display');
	createSetting('automateSpireAssault', 'Automate Spire Assault', 'Automates Spire Assault gear swaps from level 92 up to level 128. HIGHLY RECOMMENDED THAT YOU DO NOT USE THIS SETTING.', 'boolean', false, null, 'Display');

	createSetting('EnableAFK', 'Go AFK Mode', '(Action Button). Go AFK uses a Black Screen, and suspends ALL the Trimps GUI visual update functions (updateLabels) to improve performance by not doing unnecessary stuff. This feature is primarily just a CPU and RAM saving mode. Everything will resume when you come back and press the Back button. Console debug output is also disabled. The blue color means this is not a settable setting, just a button. You can now also click the Zone # (World Info) area to go AFK now.', 'action', 'MODULES["performance"].EnableAFKMode()', null, 'Display');
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
	createSetting('SpamGeneral', 'General Spam', 'General Spam = Notification Messages, Auto He/Hr', 'boolean', false, null, 'Display');
	createSetting('SpamFragments', 'Fragment Spam', 'Notification Messages about how many fragments your maps cost', 'boolean', false, null, 'Display');
	createSetting('SpamUpgrades', 'Upgrades Spam', 'Upgrades Spam', 'boolean', false, null, 'Display');
	createSetting('SpamEquipment', 'Equipment Spam', 'Equipment Spam', 'boolean', false, null, 'Display');
	createSetting('SpamMaps', 'Maps Spam', 'Maps Spam = Buy,Pick,Run Maps,Recycle,CantAfford', 'boolean', false, null, 'Display');
	createSetting('SpamOther', 'Other Spam', 'Other Spam = mostly Better Auto Fight (disable with: MODULES[\\"fight\\"].enableDebug=false ), Trimpicide & AutoBreed/Gene Timer changes, AnalyticsID, etc - a catch all. ', 'boolean', false, null, 'Display');
	createSetting('SpamBuilding', 'Building Spam', 'Building Spam = all buildings, even storage', 'boolean', false, null, 'Display');
	createSetting('SpamJobs', 'Job Spam', 'Job Spam = All jobs, in scientific notation', 'boolean', false, null, 'Display');
	createSetting('SpamGraphs', 'Starting Zone Spam', 'Disables \'Starting new Zone ###\' , RoboTrimp MagnetoShreik, and any future Graph Spam that comes from graph logs.', 'boolean', true, null, 'Display');

	createSetting('rAutoStructureSetting', '', '', 'textValue', getAutoStructureSetting().enabled, 'Legacy')

	//Export/Import/Default
	createSetting('ImportAutoTrimps', 'Import AutoTrimps', 'Import your AutoTrimps Settings. Asks you to name it as a profile afterwards.', 'infoclick', 'ImportAutoTrimps', null, 'Import Export');
	createSetting('ExportAutoTrimps', 'Export AutoTrimps', 'Export your AutoTrimps Settings as a output string text formatted in JSON.', 'infoclick', 'ExportAutoTrimps', null, 'Import Export');
	createSetting('DefaultAutoTrimps', 'Reset to Default', 'Reset everything to the way it was when you first installed the script. ', 'infoclick', 'ResetDefaultSettingsProfiles', null, 'Import Export');
	createSetting('DownloadDebug', 'Download for debug', 'Will download both your save and AT settings so that they can be debugged easier.', 'action', 'ImportExportTooltip("ExportAutoTrimps","update",true)', null, 'Import Export');
	createSetting('CleanupAutoTrimps', 'Cleanup Saved Settings ', 'Deletes old values from previous versions of the script from your AutoTrimps Settings file.', 'infoclick', 'CleanupAutoTrimps', null, 'Import Export');
	settingsProfileMakeGUI();

}

initializeAllSettings();
automationMenuInit();
updateATVersion();
modifyParentNodeUniverseSwap();/* 
changePrestigeClimb();

function changePrestigeClimb() {
	if (autoTrimpSettings.Prestige.selected === 'Off' && autoTrimpSettings.PrestigeBackup.selected !== 'Off') {
		debug(autoTrimpSettings.Prestige.selected);
		autoTrimpSettings.Prestige.selected = autoTrimpSettings.PrestigeBackup.selected;
		saveSettings();
	}
	if (autoTrimpSettings.rPrestige.selected === 'Off' && autoTrimpSettings.rPrestigeBackup.selected !== 'Off') {
		autoTrimpSettings.rPrestige.selected = autoTrimpSettings.rPrestigeBackup.selected;
		saveSettings();
	}
} */

function modifyParentNodeUniverseSwap() {

	radonon = getPageSetting('radonsettings') === 1 ? 'show' : 'hide'
	radonon_mayhem = getPageSetting('radonsettings') === 1 && (getPageSetting('rDisplayAllSettings') || game.global.mayhemCompletions < 25) ? 'show' : 'hide'
	radonon_panda = getPageSetting('radonsettings') === 1 && (getPageSetting('rDisplayAllSettings') || game.global.pandCompletions < 25) ? 'show' : 'hide'
	radonon_heirloom = getPageSetting('radonsettings') === 1 && getPageSetting('autoheirlooms') ? 'show' : 'hide'
	radonoff = getPageSetting('radonsettings') === 0 ? 'show' : 'hide'
	radonoff_heirloom = getPageSetting('radonsettings') === 0 && getPageSetting('autoheirlooms') ? 'show' : 'hide'

	//Core
	//Helium Settings
	modifyParentNode_Initial("TrapTrimps", radonoff);
	//Radon Settings
	modifyParentNode_Initial("RPerkSwapping", radonon);

	//Dailies
	//Helium Settings
	modifyParentNode_Initial("dscryvoidmaps", radonoff);
	modifyParentNode_Initial("dPreSpireNurseries", radonoff);
	modifyParentNode_Initial("liqstack", radonoff);
	//Radon Settings
	modifyParentNode_Initial("rAutoEqualityEmpower", radonon);

	//Maps
	//Helium Settings
	modifyParentNode_Initial("hUniqueMapPopup", radonoff);

	//Radon Settings
	modifyParentNode_Initial("rUniqueMapPopup", radonon);
	modifyParentNode_Initial("rVoidMapPopup", radonon);

	//Gear
	//Helium
	modifyParentNode_Initial("hEquipEfficientEquipDisplay", radonoff);
	//Radon
	modifyParentNode_Initial("rEquipNoShields", radonon);

	//Spire
	//None!

	//ATGA
	//Helium Settings
	modifyParentNode_Initial("ATGA2timer", radonoff);
	//modifyParentNode_Initial("ATGA2timerzt", radonoff);
	//modifyParentNode_Initial("dsATGA2timer", radonoff);
	//modifyParentNode_Initial("dhATGA2timer", radonoff);
	//Radon Settings
	//None!

	//C2
	//Helium Settings
	modifyParentNode_Initial("novmsc2", radonoff);
	modifyParentNode_Initial("c2table", radonoff);
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
	modifyParentNode_Initial("rUnbalanceImprobDestack", radonon);
	modifyParentNode_Initial("rTrappaCoords", radonon);
	modifyParentNode_Initial("rQuestSmithyZone", radonon);
	modifyParentNode_Initial("rMayhemMapIncrease", radonon_mayhem);
	modifyParentNode_Initial("rStormStacks", radonon);
	modifyParentNode_Initial("rPandRespecZone", radonon_panda);
	modifyParentNode_Initial("rGlassStacks", radonon);

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

function createSetting(id, name, description, type, defaultValue, list, container) {
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
				enabled: loaded === undefined ? (defaultValue || false) : loaded
			};
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
				value: loaded === undefined ? defaultValue : loaded
			};
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
				value: loaded === undefined ? defaultValue : loaded
			};
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
				value: loaded === undefined ? defaultValue : loaded
			};
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
				value: loaded === undefined ? defaultValue : loaded
			};
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
				list: list
			};
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
		btn.setAttribute('class', 'noselect settingsBtn settingBtn3');
		btn.setAttribute("onclick", 'ImportExportTooltip(\'' + defaultValue + '\', \'update\')');
		btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.setAttribute("style", "color: black; background-color: #6495ed; font-size: 1.1vw;");
		btn.innerHTML = name;
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
				value: loaded === undefined ? [{ active: false, world: 999, cell: 0, level: 0, repeat: 0, special: 0, gather: 'food', tributes: 0, mets: 0, bogs: 0, insanity: 0, potion: 0, bonfire: 0, boneamount: 0, bonebelow: 0, worshipper: 50, boneruntype: 0, bonegather: 0, buildings: true, done: false, jobratio: '1,1,1,1' }] : loaded
			};
		var btn = document.createElement("select");
		btn.id = id;
		btn.setAttribute('class', 'noselect settingsBtn settingBtn3');
		btn.setAttribute("onclick", 'ImportExportTooltip(\'' + defaultValue + '\', \'update\')');
		btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.setAttribute("style", "color: black; background-color: #6495ed; font-size: 1.1vw;");
		btn.innerHTML = name;
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
				value: loaded === undefined ? defaultValue : loaded
			};
		var btn = document.createElement("select");
		btn.id = id;
		btn.setAttribute('class', 'noselect settingsBtn settingBtn3');
		btn.setAttribute("onclick", 'ImportExportTooltip(\'' + defaultValue + '\', \'update\')');
		btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.setAttribute("style", "color: black; background-color: #6495ed; font-size: 1.1vw; display: none;");
		btn.innerHTML = name;
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
				value: loaded === undefined ? defaultValue || 0 : loaded
			};
		btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1.1vw; height: auto;");
		btn.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + autoTrimpSettings[id].value);
		btn.setAttribute("onclick", 'settingChanged("' + id + '")');
		btn.setAttribute("onmouseover", 'tooltip(\"' + name.join(' / ') + '\", \"customText\", event, \"' + description + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.innerHTML = autoTrimpSettings[id]["name"][autoTrimpSettings[id]["value"]];
		btnParent.appendChild(btn);
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
		//btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute('class', 'noselect settingsBtn settingBtn3');
		btn.setAttribute('onclick', defaultValue);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.setAttribute("style", "color: black; background-color: #6495ed; font-size: 1.1vw;");
		btn.innerHTML = name;
		btnParent.appendChild(btn);
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
			displayMostEfficientEquipment()
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
	checkPortalSettings();
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
	saveSettings();
	checkPortalSettings();
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
	saveSettings();
	checkPortalSettings();
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
	$item.style.display = state;
	$item.parentNode.style.display = stateParent;
}

function turnOff(elem) {
	toggleElem(elem, false);
}

function turnOn(elem) {
	toggleElem(elem, true);
}

function updateCustomButtons() {
	if (lastTheme && game.options.menu.darkTheme.enabled != lastTheme) {
		if (typeof MODULES["graphs"] !== 'undefined')
			MODULES["graphs"].themeChanged();
		debug("Theme change - AutoTrimps styles updated.");
	}
	lastTheme = game.options.menu.darkTheme.enabled;

	var highestZone = game.global.highestRadonLevelCleared;
	var mayhemCompletions = game.global.mayhemCompletions;
	var pandCompletions = game.global.pandCompletions;
	var currentChallenge = game.global.challengeActive;
	var displayAllSettings = getPageSetting('rDisplayAllSettings');

	//Hide settings
	//Radon
	var radonon = getPageSetting('radonsettings') == 1;
	var legacysettings = getPageSetting('radonsettings') == 2;

	//Tabs
	if (document.getElementById("tabBuildings") != null) {
		document.getElementById("tabBuildings").style.display = radonon ? "none" : "";
	}
	if (document.getElementById("tabJobs") != null) {
		document.getElementById("tabJobs").style.display = radonon ? "none" : !radonon ? "none" : "";
	}
	if (document.getElementById("tabRaiding") != null) {
		document.getElementById("tabRaiding").style.display = radonon ? "none" : !radonon ? "none" : "";
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
		document.getElementById("tabScryer").style.display = radonon ? "none" : "";
	}
	if (document.getElementById("tabMagma") != null) {
		document.getElementById("tabMagma").style.display = radonon ? "none" : "";
	}
	if (document.getElementById("tabNature") != null) {
		document.getElementById("tabNature").style.display = radonon ? "none" : "";
	}
	if (document.getElementById("tabC2") != null) {
		document.getElementById("tabC2").style.display = radonon ? "none" : "";
	}
	if (document.getElementById("tabC3") != null) {
		document.getElementById("tabC3").style.display = !radonon ? "none" : radonon && (!displayAllSettings && highestZone < 49) ? "none" : "";
	}
	if (document.getElementById("tabChallenges") != null) {
		document.getElementById("tabChallenges").style.display = !radonon ? "none" : "";
	}
	if (document.getElementById("tabLegacy") != null) {
		document.getElementById("tabLegacy").style.display = !legacysettings ? "none" : "";
	}
	turnOff('rAutoStructureSetting');

	//Core
	!radonon ? turnOn('ManualGather2') : turnOff('ManualGather2');
	!radonon ? turnOn('BuyUpgradesNew') : turnOff('BuyUpgradesNew');
	(!radonon && getPageSetting('ManualGather2') == 2 && bwRewardUnlocked('Foremany')) ? turnOn('gathermetal') : turnOff('gathermetal');
	!radonon ? turnOn('amalcoord') : turnOff('amalcoord');
	!radonon && getPageSetting('amalcoord') ? turnOn('amalcoordt') : turnOff('amalcoordt');
	!radonon && getPageSetting('amalcoord') ? turnOn('amalcoordhd') : turnOff('amalcoordhd');
	!radonon && getPageSetting('amalcoord') ? turnOn('amalcoordz') : turnOff('amalcoordz');
	!radonon ? turnOn('AutoAllocatePerks') : turnOff('AutoAllocatePerks');
	!radonon && getPageSetting('AutoAllocatePerks') == 1 ? turnOn('fastallocate') : turnOff('fastallocate');
	!radonon ? turnOn('TrapTrimps') : turnOff('TrapTrimps');

	//Portal
	!radonon ? turnOn('AutoPortal') : turnOff('AutoPortal');
	var downloadSaves = autoTrimpSettings.AutoPortal.selected != 'Off';
	(!radonon && autoTrimpSettings.AutoPortal.selected == 'Custom') ? turnOn('CustomAutoPortal') : turnOff('CustomAutoPortal');
	var heHr = (autoTrimpSettings.AutoPortal.selected == 'Helium Per Hour');
	!radonon && (heHr || autoTrimpSettings.AutoPortal.selected == 'Custom') ? turnOn('HeliumHourChallenge') : turnOff('HeliumHourChallenge');
	!radonon && (heHr) ? turnOn('HeHrDontPortalBefore') : turnOff('HeHrDontPortalBefore');
	!radonon && (heHr) ? turnOn('HeliumHrBuffer') : turnOff('HeliumHrBuffer');
	!radonon && downloadSaves ? turnOn('downloadSaves') : turnOff('downloadSaves');

	//RCore
	radonon ? turnOn('RManualGather2') : turnOff('RManualGather2');
	radonon ? turnOn('RTrapTrimps') : turnOff('RTrapTrimps');
	radonon ? turnOn('RBuyUpgradesNew') : turnOff('RBuyUpgradesNew');
	radonon ? turnOn('RAutoAllocatePerks') : turnOff('RAutoAllocatePerks');
	radonon ? turnOn('RPerkSwapping') : turnOff('RPerkSwapping');

	//RPortal
	radonon ? turnOn('RAutoPortal') : turnOff('RAutoPortal');
	var RdownloadSaves = autoTrimpSettings.RAutoPortal.selected != 'Off';
	(radonon && (autoTrimpSettings.RAutoPortal.selected == 'Custom' || autoTrimpSettings.RAutoPortal.selected == 'Challenge 3')) ? turnOn('RCustomAutoPortal') : turnOff('RCustomAutoPortal');
	radonon && getPageSetting('RAutoStartDaily') && autoTrimpSettings.RAutoPortal.selected == 'Custom' ? turnOn('rCustomDailyAutoPortal') : turnOff('rCustomDailyAutoPortal');
	var rnHr = (autoTrimpSettings.RAutoPortal.selected == 'Radon Per Hour');
	radonon && (rnHr || autoTrimpSettings.RAutoPortal.selected == 'Custom') ? turnOn('RadonHourChallenge') : turnOff('RadonHourChallenge');
	radonon && (autoTrimpSettings.RAutoPortal.selected == 'Challenge 3') ? turnOn('RadonC3Challenge') : turnOff('RadonC3Challenge');

	radonon && (rnHr) ? turnOn('RnHrDontPortalBefore') : turnOff('RnHrDontPortalBefore');
	radonon && (rnHr) ? turnOn('RadonHrBuffer') : turnOff('RadonHrBuffer');
	radonon && RdownloadSaves ? turnOn('RdownloadSaves') : turnOff('RdownloadSaves');

	//Daily
	!radonon ? turnOn('buyheliumy') : turnOff('buyheliumy');
	!radonon ? turnOn('dfightforever') : turnOff('dfightforever');
	!radonon ? turnOn('avoidempower') : turnOff('avoidempower');
	!radonon ? turnOn('darmormagic') : turnOff('darmormagic');
	!radonon ? turnOn('dscryvoidmaps') : turnOff('dscryvoidmaps');
	!radonon ? turnOn('dIgnoreSpiresUntil') : turnOff('dIgnoreSpiresUntil');
	!radonon ? turnOn('dExitSpireCell') : turnOff('dExitSpireCell');
	!radonon ? turnOn('dPreSpireNurseries') : turnOff('dPreSpireNurseries');

	//DWind
	!radonon ? turnOn('use3daily') : turnOff('use3daily');
	!radonon && getPageSetting('use3daily') ? turnOn('dwindhealthy') : turnOff('dwindhealthy');
	!radonon && getPageSetting('use3daily') ? turnOn('dusebstance') : turnOff('dusebstance');
	!radonon && getPageSetting('use3daily') ? turnOn('dWindStackingMin') : turnOff('dWindStackingMin');
	!radonon && getPageSetting('use3daily') ? turnOn('dWindStackingMinHD') : turnOff('dWindStackingMinHD');
	!radonon && getPageSetting('use3daily') ? turnOn('dWindStackingMax') : turnOff('dWindStackingMax');
	!radonon && getPageSetting('use3daily') ? turnOn('liqstack') : turnOff('liqstack');

	//DPortal
	!radonon ? turnOn('AutoStartDaily') : turnOff('AutoStartDaily');
	!radonon ? turnOn('u2daily') : turnOff('u2daily');
	!radonon ? turnOn('AutoPortalDaily') : turnOff('AutoPortalDaily');
	!radonon && getPageSetting('AutoPortalDaily') > 0 ? turnOn('dHeliumHourChallenge') : turnOff('dHeliumHourChallenge');
	!radonon && getPageSetting('AutoPortalDaily') == 2 ? turnOn('dCustomAutoPortal') : turnOff('dCustomAutoPortal');
	!radonon && getPageSetting('AutoPortalDaily') == 1 ? turnOn('dHeHrDontPortalBefore') : turnOff('dHeHrDontPortalBefore');
	!radonon && getPageSetting('AutoPortalDaily') == 1 ? turnOn('dHeliumHrBuffer') : turnOff('dHeliumHrBuffer');
	//RDaily
	radonon ? turnOn('buyradony') : turnOff('buyradony');
	radonon ? turnOn('rBloodthirstDestack') : turnOff('rBloodthirstDestack');
	radonon && getPageSetting('rManageEquality') === 2 ? turnOn('rAutoEqualityEmpower') : turnOff('rAutoEqualityEmpower');

	//RDPortal 
	radonon ? turnOn('RAutoStartDaily') : turnOff('RAutoStartDaily');
	radonon && getPageSetting('RAutoStartDaily') ? turnOn('RFillerRun') : turnOff('RFillerRun');
	radonon ? turnOn('u1daily') : turnOff('u1daily');
	radonon ? turnOn('dontCapDailies') : turnOff('dontCapDailies');
	radonon ? turnOn('RAutoPortalDaily') : turnOff('RAutoPortalDaily');
	radonon && getPageSetting('RAutoPortalDaily') == 2 ? turnOn('RdCustomAutoPortal') : turnOff('RdCustomAutoPortal');
	radonon && getPageSetting('RAutoPortalDaily') == 1 ? turnOn('RdHeHrDontPortalBefore') : turnOff('RdHeHrDontPortalBefore');
	radonon && getPageSetting('RAutoPortalDaily') == 1 ? turnOn('RdHeliumHrBuffer') : turnOff('RdHeliumHrBuffer');
	radonon && getPageSetting('RAutoPortalDaily') > 0 ? turnOn("RdHeliumHourChallenge") : turnOff("RdHeliumHourChallenge");

	//C2
	!radonon ? turnOn('FinishC2') : turnOff('FinishC2');
	!radonon ? turnOn('buynojobsc') : turnOff('buynojobsc');
	!radonon ? turnOn('cfightforever') : turnOff('cfightforever');
	!radonon ? turnOn('carmormagic') : turnOff('carmormagic');
	!radonon ? turnOn('novmsc2') : turnOff('novmsc2');
	!radonon ? turnOn('c2runnerstart') : turnOff('c2runnerstart');
	!radonon && getPageSetting('c2runnerstart') ? turnOn('c2runnerportal') : turnOff('c2runnerportal');
	!radonon && getPageSetting('c2runnerstart') ? turnOn('c2runnerpercent') : turnOff('c2runnerpercent');

	//Balance
	!radonon ? turnOn('balance') : turnOff('balance');
	!radonon && getPageSetting('balance') ? turnOn('balanceZone') : turnOff('balanceZone');
	!radonon && getPageSetting('balance') ? turnOn('balanceStacks') : turnOff('balanceStacks');
	!radonon && getPageSetting('balance') ? turnOn('balanceImprobDestack') : turnOff('balanceImprobDestack');

	//Decay
	!radonon ? turnOn('decay') : turnOff('decay');
	!radonon && getPageSetting('decay') ? turnOn('decayStacksToPush') : turnOff('decayStacksToPush');
	!radonon && getPageSetting('decay') ? turnOn('decayStacksToAbandon') : turnOff('decayStacksToAbandon');

	//Life
	!radonon ? turnOn('life') : turnOff('life');
	!radonon && getPageSetting('life') ? turnOn('lifeZone') : turnOff('lifeZone');
	!radonon && getPageSetting('life') ? turnOn('lifeStacks') : turnOff('lifeStacks');

	//Mapology
	!radonon ? turnOn('mapology') : turnOff('mapology');
	!radonon && getPageSetting('mapology') ? turnOn('mapologyPrestige') : turnOff('mapologyPrestige');

	//Experience
	!radonon ? turnOn('experience') : turnOff('experience');
	!radonon && getPageSetting('experience') ? turnOn('experienceStartZone') : turnOff('experienceStartZone');
	!radonon && getPageSetting('experience') ? turnOn('experienceEndZone') : turnOff('experienceEndZone');
	!radonon && getPageSetting('experience') ? turnOn('experienceEndBW') : turnOff('experienceEndBW');

	//C3
	radonon ? turnOn('c3finishrun') : turnOff('c3finishrun');
	radonon && (displayAllSettings || !autoBattle.oneTimers.Expanding_Tauntimp.owned) ? turnOn('c3buildings') : turnOff('c3buildings');
	radonon && (displayAllSettings || !autoBattle.oneTimers.Expanding_Tauntimp.owned) && getPageSetting('c3buildings') ? turnOn('c3buildingzone') : turnOff('c3buildingzone');
	radonon ? turnOn('c3GM_ST') : turnOff('c3GM_ST');

	//Buildings
	turnOff('BuyBuildingsNew');
	!radonon ? turnOn('WarpstationCap') : turnOff('WarpstationCap');
	!radonon ? turnOn('WarpstationCoordBuy') : turnOff('WarpstationCoordBuy');
	!radonon ? turnOn('FirstGigastation') : turnOff('FirstGigastation');
	!radonon ? turnOn('DeltaGigastation') : turnOff('DeltaGigastation');
	!radonon ? turnOn("AutoGigas") : turnOff("AutoGigas");
	(!radonon && getPageSetting("AutoGigas")) ? turnOn("CustomTargetZone") : turnOff("CustomTargetZone");
	(!radonon && getPageSetting("AutoGigas")) ? turnOn("CustomDeltaFactor") : turnOff("CustomDeltaFactor");

	//RBuildings
	turnOff('RBuyBuildingsNew');

	//Jobs
	turnOff('BuyJobsNew');

	//RJobs
	radonon ? turnOn('RBuyJobsNew') : turnOff('RBuyJobsNew');
	turnOff('hJobSettingsArray');
	turnOff('rJobSettingsArray');
	turnOff('hBuildingSettingsArray');
	turnOff('rBuildingSettingsArray');
	turnOff('rDailyPortalSettingsArray');
	!radonon ? turnOn('Prestige') : turnOff('Prestige');
	!radonon ? turnOn('ForcePresZ') : turnOff('ForcePresZ');
	!radonon ? turnOn('PrestigeSkip1_2') : turnOff('PrestigeSkip1_2');
	!radonon ? turnOn('BuyShieldblock') : turnOff('BuyShieldblock');

	//HGear AutoEquip
	!radonon ? turnOn('Hequipon') : turnOff('Hequipon');
	!radonon && getPageSetting('Hequipon') ? turnOn('Hequipamount') : turnOff('Hequipamount');
	!radonon && getPageSetting('Hequipon') ? turnOn('Hequipcapattack') : turnOff('Hequipcapattack');
	!radonon && getPageSetting('Hequipon') ? turnOn('Hequipcaphealth') : turnOff('Hequipcaphealth');
	!radonon && getPageSetting('Hequipon') ? turnOn('Hequipzone') : turnOff('Hequipzone');
	!radonon && getPageSetting('Hequipon') ? turnOn('Hequippercent') : turnOff('Hequippercent');
	!radonon ? turnOn('Hautoequipportal') : turnOff('Hautoequipportal');
	!radonon && getPageSetting('Hequipon') ? turnOn('Hequip2') : turnOff('Hequip2');
	!radonon && getPageSetting('Hequipon') ? turnOn('Hequipprestige') : turnOff('Hequipprestige');
	!radonon && getPageSetting('Hequipon') && getPageSetting('Hequipprestige') !== 0 ? turnOn('hEquipHighestPrestige') : turnOff('hEquipHighestPrestige');
	!radonon ? turnOn('hEquipEfficientEquipDisplay') : turnOff('hEquipEfficientEquipDisplay');
	!radonon && getPageSetting('Hequipon') ? turnOn('Hdmgcuntoff') : turnOff('Hdmgcuntoff');


	//RGear AutoEquip
	radonon ? turnOn('Requipon') : turnOff('Requipon');
	radonon && getPageSetting('Requipon') ? turnOn('Requipamount') : turnOff('Requipamount');
	radonon && getPageSetting('Requipon') ? turnOn('Requipcapattack') : turnOff('Requipcapattack');
	radonon && getPageSetting('Requipon') ? turnOn('Requipcaphealth') : turnOff('Requipcaphealth');
	radonon && getPageSetting('Requipon') ? turnOn('Requipzone') : turnOff('Requipzone');
	radonon && getPageSetting('Requipon') ? turnOn('Requippercent') : turnOff('Requippercent');
	radonon ? turnOn('Rautoequipportal') : turnOff('Rautoequipportal');
	radonon && getPageSetting('Requipon') ? turnOn('Requip2') : turnOff('Requip2');
	radonon && getPageSetting('Requipon') ? turnOn('Requipprestige') : turnOff('Requipprestige');
	radonon && getPageSetting('Requipon') && getPageSetting('Requipprestige') !== 0 ? turnOn('rEquipHighestPrestige') : turnOff('rEquipHighestPrestige');
	radonon ? turnOn('rEquipEfficientEquipDisplay') : turnOff('rEquipEfficientEquipDisplay');
	radonon && getPageSetting('Requipon') ? turnOn('rEquipNoShields') : turnOff('rEquipNoShields');
	radonon && getPageSetting('Requipon') ? turnOn('Rdmgcuntoff') : turnOff('Rdmgcuntoff');

	radonon ? turnOn('rPrestige') : turnOff('rPrestige');
	radonon ? turnOn('rForcePresZ') : turnOff('rForcePresZ');
	radonon ? turnOn('rPrestigeSkip1_2') : turnOff('rPrestigeSkip1_2');

	//Maps
	!radonon ? turnOn('AutoMaps') : turnOff('AutoMaps');
	!radonon ? turnOn('automapsportal') : turnOff('automapsportal');
	!radonon ? turnOn('FarmWhenNomStacks7') : turnOff('FarmWhenNomStacks7');
	!radonon ? turnOn('scryvoidmaps') : turnOff('scryvoidmaps');
	!radonon ? turnOn('buywepsvoid') : turnOff('buywepsvoid');
	turnOff('hUniqueMapSettingsArray');
	!radonon ? turnOn('hUniqueMapPopup') : turnOff('hUniqueMapPopup');



	//Map Bonus  
	!radonon ? turnOn('hMapBonusPopup') : turnOff('hMapBonusPopup');
	turnOff('hMapBonusSettings');
	turnOff('hMapBonusDefaultSettings');
	turnOff('hMapBonusZone');

	//Void Map 
	!radonon ? turnOn('hVoidMapPopup') : turnOff('hVoidMapPopup');
	turnOff('hVoidMapSettings');
	turnOff('hVoidMapDefaultSettings');
	turnOff('hVoidMapZone');

	//Map Farming  
	!radonon ? turnOn('hMapFarmPopup') : turnOff('hMapFarmPopup');
	turnOff('hMapFarmSettings');
	turnOff('hMapFarmDefaultSettings');
	turnOff('hMapFarmZone');

	//HD Farm
	!radonon ? turnOn('hHDFarmPopup') : turnOff('hHDFarmPopup');
	turnOff('hHDFarmSettings');
	turnOff('hHDFarmDefaultSettings');
	turnOff('hHDFarmZone');

	//Raiding 
	!radonon ? turnOn('hRaidingPopup') : turnOff('hRaidingPopup');
	turnOff('hRaidingSettings');
	turnOff('hRaidingDefaultSettings');
	turnOff('hRaidingZone');

	//BW Raiding 
	!radonon ? turnOn('hBionicRaidingPopup') : turnOff('hBionicRaidingPopup');
	turnOff('hBionicRaidingSettings');
	turnOff('hBionicRaidingDefaultSettings');
	turnOff('hBionicRaidingZone');

	//Bone Shrine (bones) 
	if (game.global.stringVersion >= '5.7.0') {
		!radonon ? turnOn('hBoneShrinePopup') : turnOff('hBoneShrinePopup');
		turnOff('hBoneShrineSettings');
		turnOff('hBoneShrineDefaultSettings');
		turnOff('hBoneShrineZone');
		turnOff('hBoneShrineRunType');
	}

	//RMaps
	radonon ? turnOn('RAutoMaps') : turnOff('RAutoMaps');
	radonon ? turnOn('Rautomapsportal') : turnOff('Rautomapsportal');
	turnOff('rUniqueMapSettingsArray');
	radonon ? turnOn('rUniqueMapPopup') : turnOff('rUniqueMapPopup');

	//Map Bonus  
	radonon ? turnOn('rMapBonusPopup') : turnOff('rMapBonusPopup');
	turnOff('rMapBonusSettings');
	turnOff('rMapBonusDefaultSettings');
	turnOff('rMapBonusZone');

	//Void Map 
	radonon ? turnOn('rVoidMapPopup') : turnOff('rVoidMapPopup');
	turnOff('rVoidMapSettings');
	turnOff('rVoidMapDefaultSettings');
	turnOff('rVoidMapZone');

	radonon ? turnOn('rMapRepeatCount') : turnOff('rMapRepeatCount');
	radonon ? turnOn('automateSpireAssault') : turnOff('automateSpireAssault');
	radonon ? turnOn('debugStats') : turnOff('debugStats');

	//Tribute Farming
	radonon ? turnOn('rTributeFarmPopup') : turnOff('rTributeFarmPopup');
	turnOff('rTributeFarmSettings');
	turnOff('rTributeFarmDefaultSettings');
	turnOff('rTributeFarmZone');

	//Map Farming  
	radonon ? turnOn('rMapFarmPopup') : turnOff('rMapFarmPopup');
	turnOff('rMapFarmSettings');
	turnOff('rMapFarmDefaultSettings');
	turnOff('rMapFarmZone');

	//Smithy Farming  
	radonon && (displayAllSettings || highestZone >= 4) ? turnOn('rSmithyFarmPopup') : turnOff('rSmithyFarmPopup');
	turnOff('rSmithyFarmSettings');
	turnOff('rSmithyFarmDefaultSettings');
	turnOff('rSmithyFarmZone');

	//HD Farm
	radonon ? turnOn('rHDFarmPopup') : turnOff('rHDFarmPopup');
	turnOff('rHDFarmSettings');
	turnOff('rHDFarmDefaultSettings');
	turnOff('rHDFarmZone');

	//Worshippers 
	radonon && (displayAllSettings || highestZone >= 49) ? turnOn('rWorshipperFarmPopup') : turnOff('rWorshipperFarmPopup');
	turnOff('rWorshipperFarmSettings');
	turnOff('rWorshipperFarmDefaultSettings');
	turnOff('rWorshipperFarmZone');

	//Bone Shrine (bones) 
	if (game.global.stringVersion >= '5.7.0') {
		radonon ? turnOn('rBoneShrinePopup') : turnOff('rBoneShrinePopup');
		turnOff('rBoneShrineSettings');
		turnOff('rBoneShrineDefaultSettings');
		turnOff('rBoneShrineZone');
		turnOff('rBoneShrineRunType');
	}

	//Raiding 
	radonon ? turnOn('rRaidingPopup') : turnOff('rRaidingPopup');
	turnOff('rRaidingSettings');
	turnOff('rRaidingDefaultSettings');
	turnOff('rRaidingZone');

	//Spire
	!radonon ? turnOn('MaxStacksForSpire') : turnOff('MaxStacksForSpire');
	!radonon ? turnOn('MinutestoFarmBeforeSpire') : turnOff('MinutestoFarmBeforeSpire');
	!radonon ? turnOn('IgnoreSpiresUntil') : turnOff('IgnoreSpiresUntil');
	!radonon ? turnOn('ExitSpireCell') : turnOff('ExitSpireCell');
	!radonon ? turnOn('SpireBreedTimer') : turnOff('SpireBreedTimer');
	!radonon ? turnOn('PreSpireNurseries') : turnOff('PreSpireNurseries');
	!radonon ? turnOn('spireshitbuy') : turnOff('spireshitbuy');
	!radonon ? turnOn('SkipSpires') : turnOff('SkipSpires');

	//Windstacking
	var wson = (getPageSetting('AutoStance') == 3);
	(!radonon && !wson) ? turnOn('turnwson') : turnOff('turnwson');
	(!radonon && wson) ? turnOn('windhealthy') : turnOff('windhealthy');
	(!radonon && wson) ? turnOn('usebstance') : turnOff('usebstance');
	(!radonon && wson) ? turnOn('WindStackingMin') : turnOff('WindStackingMin');
	(!radonon && wson) ? turnOn('WindStackingMinHD') : turnOff('WindStackingMinHD');
	(!radonon && wson) ? turnOn('WindStackingMax') : turnOff('WindStackingMax');

	//ATGA
	!radonon ? turnOn('ATGA2') : turnOff('ATGA2');
	!radonon && getPageSetting('ATGA2') ? turnOn('ATGA2timer') : turnOff('ATGA2timer');
	!radonon && getPageSetting('ATGA2') ? turnOn('ATGA2gen') : turnOff('ATGA2gen');
	var ATGAon = (getPageSetting('ATGA2') && getPageSetting('ATGA2timer') > 0);
	(!radonon && ATGAon) ? turnOn('zATGA2timer') : turnOff('zATGA2timer');
	(!radonon && ATGAon && getPageSetting('zATGA2timer') > 0) ? turnOn('ztATGA2timer') : turnOff('ztATGA2timer');
	(!radonon && ATGAon) ? turnOn('ATGA2timerz') : turnOff('ATGA2timerz');
	(!radonon && ATGAon && getPageSetting('ATGA2timerz') > 0) ? turnOn('ATGA2timerzt') : turnOff('ATGA2timerzt');
	(!radonon && ATGAon) ? turnOn('sATGA2timer') : turnOff('sATGA2timer');
	(!radonon && ATGAon) ? turnOn('dsATGA2timer') : turnOff('dsATGA2timer');
	(!radonon && ATGAon) ? turnOn('dATGA2timer') : turnOff('dATGA2timer');
	(!radonon && ATGAon) ? turnOn('dhATGA2timer') : turnOff('dhATGA2timer');
	(!radonon && ATGAon) ? turnOn('cATGA2timer') : turnOff('cATGA2timer');
	(!radonon && ATGAon) ? turnOn('chATGA2timer') : turnOff('chATGA2timer');
	(!radonon && ATGAon) ? turnOn('dATGA2Auto') : turnOff('dATGA2Auto');

	//Combat
	!radonon ? turnOn('AutoStance') : turnOff('AutoStance');
	!radonon ? turnOn('AutoStanceNew') : turnOff('AutoStanceNew');
	!radonon ? turnOn('AutoRoboTrimp') : turnOff('AutoRoboTrimp');
	!radonon ? turnOn('fightforever') : turnOff('fightforever');
	!radonon ? turnOn('addpoison') : turnOff('addpoison');
	!radonon ? turnOn('fullice') : turnOff('fullice');
	!radonon ? turnOn('45stacks') : turnOff('45stacks');
	!radonon ? turnOn('ForceAbandon') : turnOff('ForceAbandon');
	!radonon && getPageSetting('AutoStance') != 3 ? turnOn('IgnoreCrits') : turnOff('IgnoreCrits');

	//RCombat
	radonon ? turnOn('rManageEquality') : turnOff('rManageEquality');
	radonon && getPageSetting('rManageEquality') < 2 ? turnOn('Rcalcmaxequality') : turnOff('Rcalcmaxequality');
	radonon && (displayAllSettings || getPageSetting('rManageEquality') === 2) ? turnOn('rCalcGammaBurst') : turnOff('rCalcGammaBurst');
	radonon && (displayAllSettings || (!game.portal.Frenzy.radLocked && !autoBattle.oneTimers.Mass_Hysteria.owned)) ? turnOn('Rcalcfrenzy') : turnOff('Rcalcfrenzy');

	radonon && (displayAllSettings || highestZone > 200) ? turnOn('rMutationCalc') : turnOff('rMutationCalc');

	//Challenges

	//Hide Challenges
	radonon ? turnOn("rHideChallenge") : turnOff("rHideChallenge");
	radonon && (displayAllSettings || highestZone >= 89) && getPageSetting('rHideChallenge') ? turnOn("rHideArchaeology") : turnOff("rHideArchaeology");
	radonon && (displayAllSettings || highestZone >= 119) && getPageSetting('rHideChallenge') ? turnOn("rHideExterminate") : turnOff("rHideExterminate");

	//Unbalance
	radonon ? turnOn('rUnbalance') : turnOff('rUnbalance');
	radonon && getPageSetting('rUnbalance') ? turnOn('rUnbalanceZone') : turnOff('rUnbalanceZone');
	radonon && getPageSetting('rUnbalance') ? turnOn('rUnbalanceStacks') : turnOff('rUnbalanceStacks');
	radonon && getPageSetting('rUnbalance') ? turnOn('rUnbalanceImprobDestack') : turnOff('rUnbalanceImprobDestack');

	//Trappapalooza
	radonon && (displayAllSettings || highestZone >= 59) ? turnOn('rTrappa') : turnOff('rTrappa');
	radonon && (displayAllSettings || highestZone >= 59) && getPageSetting('rTrappa') ? turnOn('rTrappaCoords') : turnOff('rTrappaCoords');
	//Quest
	radonon && (displayAllSettings || highestZone >= 59) ? turnOn('rQuest') : turnOff('rQuest');
	radonon && (displayAllSettings || highestZone >= 59) && getPageSetting('rQuest') ? turnOn('rQuestSmithyZone') : turnOff('rQuestSmithyZone');
	//Quagmire
	turnOff('rQuagOn');
	radonon && (displayAllSettings || highestZone >= 69) ? turnOn('rQuagPopup') : turnOff('rQuagPopup');
	turnOff('rQuagSettings');
	turnOff('rQuagDefaultSettings');
	turnOff('rQuagZone');

	//Archaeology
	radonon && (displayAllSettings || highestZone >= 89) && !getPageSetting('rHideArchaeology') ? turnOn('Rarchon') : turnOff('Rarchon');
	radonon && (displayAllSettings || highestZone >= 89) && getPageSetting('Rarchon') && !getPageSetting('rHideArchaeology') ? turnOn('Rarchstring1') : turnOff('Rarchstring1');
	radonon && (displayAllSettings || highestZone >= 89) && getPageSetting('Rarchon') && !getPageSetting('rHideArchaeology') ? turnOn('Rarchstring2') : turnOff('Rarchstring2');
	radonon && (displayAllSettings || highestZone >= 89) && getPageSetting('Rarchon') && !getPageSetting('rHideArchaeology') ? turnOn('Rarchstring3') : turnOff('Rarchstring3');

	//Mayhem
	radonon && (displayAllSettings || (highestZone >= 99 && mayhemCompletions < 25) || currentChallenge === 'Mayhem') ? turnOn('rMayhem') : turnOff('rMayhem');
	radonon && (displayAllSettings || (highestZone >= 99 && mayhemCompletions < 25) || currentChallenge === 'Mayhem') && getPageSetting('rMayhem') ? turnOn('rMayhemDestack') : turnOff('rMayhemDestack');
	radonon && (displayAllSettings || (highestZone >= 99 && mayhemCompletions < 25) || currentChallenge === 'Mayhem') && getPageSetting('rMayhem') ? turnOn('rMayhemZone') : turnOff('rMayhemZone');
	radonon && (displayAllSettings || (highestZone >= 99 && mayhemCompletions < 25) || currentChallenge === 'Mayhem') && getPageSetting('rMayhem') ? turnOn('rMayhemMapIncrease') : turnOff('rMayhemMapIncrease');


	//Storm
	radonon && (displayAllSettings || highestZone >= 104) ? turnOn('Rstormon') : turnOff('Rstormon');
	radonon && (displayAllSettings || highestZone >= 104) && getPageSetting('Rstormon') ? turnOn('rStormZone') : turnOff('rStormZone');
	radonon && (displayAllSettings || highestZone >= 104) && getPageSetting('Rstormon') ? turnOn('rStormStacks') : turnOff('rStormStacks');

	//Insanity
	radonon && (displayAllSettings || highestZone >= 109) ? turnOn('rInsanityPopup') : turnOff('rInsanityPopup');
	turnOff('rInsanitySettings');
	turnOff('rInsanityDefaultSettings');
	turnOff('rInsanityZone');

	//Exterminate
	radonon && (displayAllSettings || highestZone >= 119) && !getPageSetting('rHideExterminate') ? turnOn('Rexterminateon') : turnOff('Rexterminateon');
	radonon && (displayAllSettings || highestZone >= 119) && getPageSetting('Rexterminateon') && !getPageSetting('rHideExterminate') ? turnOn('Rexterminatecalc') : turnOff('Rexterminatecalc');
	radonon && (displayAllSettings || highestZone >= 119) && getPageSetting('Rexterminateon') && !getPageSetting('rHideExterminate') ? turnOn('Rexterminateeq') : turnOff('Rexterminateeq');

	//Pandemonium
	radonon && (displayAllSettings || (highestZone >= 149 && pandCompletions < 25) || currentChallenge === 'Pandemonium') ? turnOn('RPandemoniumOn') : turnOff('RPandemoniumOn');
	radonon && (displayAllSettings || (highestZone >= 149 && pandCompletions < 25) || currentChallenge === 'Pandemonium') && getPageSetting('RPandemoniumOn') ? turnOn('RPandemoniumZone') : turnOff('RPandemoniumZone');
	radonon && (displayAllSettings || (highestZone >= 149 && pandCompletions < 25) || currentChallenge === 'Pandemonium') && getPageSetting('RPandemoniumOn') ? turnOn('RPandemoniumAutoEquip') : turnOff('RPandemoniumAutoEquip');
	radonon && (displayAllSettings || (highestZone >= 149 && pandCompletions < 25) || currentChallenge === 'Pandemonium') && getPageSetting('RPandemoniumOn') && getPageSetting('RPandemoniumAutoEquip') > 1 ? turnOn('RPandemoniumAEZone') : turnOff('RPandemoniumAEZone');
	radonon && (displayAllSettings || (highestZone >= 149 && pandCompletions < 25) || currentChallenge === 'Pandemonium') && getPageSetting('RPandemoniumOn') && getPageSetting('RPandemoniumAutoEquip') > 1 ? turnOn('PandemoniumFarmLevel') : turnOff('PandemoniumFarmLevel');
	radonon && (displayAllSettings || (highestZone >= 149 && pandCompletions < 25) || currentChallenge === 'Pandemonium') && getPageSetting('RPandemoniumOn') && getPageSetting('RPandemoniumAutoEquip') > 1 ? turnOn('RhsPandStaff') : turnOff('RhsPandStaff');
	radonon && (displayAllSettings || (highestZone >= 149 && pandCompletions < 25) || currentChallenge === 'Pandemonium') && getPageSetting('RPandemoniumOn') && getPageSetting('RPandemoniumAutoEquip') > 1 && autoBattle.oneTimers.Mass_Hysteria.owned ? turnOn('RhsPandJestFarmShield') : turnOff('RhsPandJestFarmShield');

	radonon && (displayAllSettings || (highestZone >= 149 && pandCompletions < 25) || currentChallenge === 'Pandemonium') && getPageSetting('RPandemoniumOn') && getPageSetting('RPandemoniumAutoEquip') > 1 ? turnOn('rPandRespec') : turnOff('rPandRespec');
	radonon && (displayAllSettings || (highestZone >= 149 && pandCompletions < 25) || currentChallenge === 'Pandemonium') && getPageSetting('RPandemoniumOn') && getPageSetting('RPandemoniumAutoEquip') > 1 && getPageSetting('rPandRespec') ? turnOn('rPandRespecZone') : turnOff('rPandRespecZone');
	radonon && (displayAllSettings || (highestZone >= 149 && pandCompletions < 25) || currentChallenge === 'Pandemonium') && getPageSetting('RPandemoniumOn') ? turnOn('RPandemoniumMP') : turnOff('RPandemoniumMP');

	//Alchemy
	radonon && (displayAllSettings || highestZone >= 154) ? turnOn('rAlchPopup') : turnOff('rAlchPopup');
	turnOff('rAlchSettings');
	turnOff('rAlchDefaultSettings');
	turnOff('rAlchZone');

	//turnOff('rGlass');
	radonon ? turnOn('rGlass') : turnOff('rGlass');
	radonon && getPageSetting('rGlass') ? turnOn('rGlassStacks') : turnOff('rGlassStacks');
	//turnOff('rGlassStacks');

	//Smithless
	radonon ? turnOn('rSmithless') : turnOff('rSmithless');
	radonon ? turnOn('rWither') : turnOff('rWither');

	//Hypothermia 
	radonon && (displayAllSettings || highestZone >= 174) ? turnOn('rHypoPopup') : turnOff('rHypoPopup');
	turnOff('rHypoSettings');
	turnOff('rHypoDefaultSettings');
	turnOff('rHypoZone');

	//Scryer
	!radonon ? turnOn('UseScryerStance') : turnOff('UseScryerStance');
	!radonon ? turnOn('ScryerUseWhenOverkill') : turnOff('ScryerUseWhenOverkill');
	!radonon ? turnOn('ScryerMinZone') : turnOff('ScryerMinZone');
	!radonon ? turnOn('ScryerMaxZone') : turnOff('ScryerMaxZone');
	!radonon ? turnOn('onlyminmaxworld') : turnOff('onlyminmaxworld');
	!radonon ? turnOn('ScryerUseinMaps2') : turnOff('ScryerUseinMaps2');
	!radonon ? turnOn('ScryerUseinVoidMaps2') : turnOff('ScryerUseinVoidMaps2');
	!radonon ? turnOn('ScryerUseinPMaps') : turnOff('ScryerUseinPMaps');
	!radonon ? turnOn('ScryerUseinBW') : turnOff('ScryerUseinBW');
	!radonon ? turnOn('ScryerUseinSpire2') : turnOff('ScryerUseinSpire2');
	!radonon ? turnOn('ScryerSkipBoss2') : turnOff('ScryerSkipBoss2');
	!radonon ? turnOn('ScryerSkipCorrupteds2') : turnOff('ScryerSkipCorrupteds2');
	!radonon ? turnOn('ScryerSkipHealthy') : turnOff('ScryerSkipHealthy');
	!radonon ? turnOn('ScryUseinPoison') : turnOff('ScryUseinPoison');
	!radonon ? turnOn('ScryUseinWind') : turnOff('ScryUseinWind');
	!radonon ? turnOn('ScryUseinIce') : turnOff('ScryUseinIce');
	!radonon ? turnOn('ScryerDieZ') : turnOff('ScryerDieZ');
	!radonon ? turnOn('screwessence') : turnOff('screwessence');

	//Magma
	!radonon ? turnOn('UseAutoGen') : turnOff('UseAutoGen');
	!radonon ? turnOn('beforegen') : turnOff('beforegen');
	!radonon ? turnOn('fuellater') : turnOff('fuellater');
	!radonon ? turnOn('fuelend') : turnOff('fuelend');
	!radonon ? turnOn('defaultgen') : turnOff('defaultgen');
	!radonon ? turnOn('AutoGenDC') : turnOff('AutoGenDC');
	!radonon ? turnOn('AutoGenC2') : turnOff('AutoGenC2');
	!radonon ? turnOn('spendmagmite') : turnOff('spendmagmite');
	!radonon ? turnOn('ratiospend') : turnOff('ratiospend');
	var ratiospend = getPageSetting('ratiospend');
	(!radonon && !ratiospend) ? turnOn('SupplyWall') : turnOff('SupplyWall');
	(!radonon && !ratiospend) ? turnOn('spendmagmitesetting') : turnOff('spendmagmitesetting');
	(!radonon && !ratiospend) ? turnOn('MagmiteExplain') : turnOff('MagmiteExplain');
	(!radonon && ratiospend) ? turnOn('effratio') : turnOff('effratio');
	(!radonon && ratiospend) ? turnOn('capratio') : turnOff('capratio');
	(!radonon && ratiospend) ? turnOn('supratio') : turnOff('supratio');
	(!radonon && ratiospend) ? turnOn('ocratio') : turnOff('ocratio');

	!radonon ? turnOn('hAutoGoldenPopup') : turnOff('hAutoGoldenPopup');
	!radonon ? turnOn('hAutoGoldenDailyPopup') : turnOff('hAutoGoldenDailyPopup');
	!radonon ? turnOn('hAutoGoldenC3Popup') : turnOff('hAutoGoldenC3Popup');
	turnOff('hAutoGoldenSettings');
	turnOff('hAutoGoldenDailySettings');
	turnOff('hAutoGoldenC3Settings');


	radonon ? turnOn('rAutoGoldenPopup') : turnOff('rAutoGoldenPopup');
	radonon ? turnOn('rAutoGoldenDailyPopup') : turnOff('rAutoGoldenDailyPopup');
	radonon ? turnOn('rAutoGoldenC3Popup') : turnOff('rAutoGoldenC3Popup');
	turnOff('rAutoGoldenSettings');
	turnOff('rAutoGoldenDailySettings');
	turnOff('rAutoGoldenC3Settings');

	//Nature
	!radonon ? turnOn('AutoNatureTokens') : turnOff('AutoNatureTokens');
	!radonon && getPageSetting('AutoNatureTokens') ? turnOn('tokenthresh') : turnOff('tokenthresh');
	!radonon && getPageSetting('AutoNatureTokens') ? turnOn('AutoPoison') : turnOff('AutoPoison');
	!radonon && getPageSetting('AutoNatureTokens') ? turnOn('AutoWind') : turnOff('AutoWind');
	!radonon && getPageSetting('AutoNatureTokens') ? turnOn('AutoIce') : turnOff('AutoIce');

	//Enlight
	!radonon ? turnOn('autoenlight') : turnOff('autoenlight');
	!radonon && getPageSetting('autoenlight') ? turnOn('pfillerenlightthresh') : turnOff('pfillerenlightthresh');
	!radonon && getPageSetting('autoenlight') ? turnOn('wfillerenlightthresh') : turnOff('wfillerenlightthresh');
	!radonon && getPageSetting('autoenlight') ? turnOn('ifillerenlightthresh') : turnOff('ifillerenlightthresh');
	!radonon && getPageSetting('autoenlight') ? turnOn('pdailyenlightthresh') : turnOff('pdailyenlightthresh');
	!radonon && getPageSetting('autoenlight') ? turnOn('wdailyenlightthresh') : turnOff('wdailyenlightthresh');
	!radonon && getPageSetting('autoenlight') ? turnOn('idailyenlightthresh') : turnOff('idailyenlightthresh');
	!radonon && getPageSetting('autoenlight') ? turnOn('pc2enlightthresh') : turnOff('pc2enlightthresh');
	!radonon && getPageSetting('autoenlight') ? turnOn('wc2enlightthresh') : turnOff('wc2enlightthresh');
	!radonon && getPageSetting('autoenlight') ? turnOn('ic2enlightthresh') : turnOff('ic2enlightthresh');

	//Display
	(!game.worldUnlocks.easterEgg.locked) ? turnOn('AutoEggs') : turnOff('AutoEggs');

	//Memory
	!radonon ? turnOn("showbreedtimer") : turnOff("showbreedtimer");
	game.global.universe == 1 && !getPageSetting('showbreedtimer') ? turnOn("hiddenBreedTimer") : turnOff("hiddenBreedTimer");
	!radonon ? turnOn("showautomapstatus") : turnOff("showautomapstatus");
	!radonon ? turnOn("showhehr") : turnOff("showhehr");
	radonon ? turnOn("Rshowautomapstatus") : turnOff("Rshowautomapstatus");
	radonon ? turnOn("Rshowrnhr") : turnOff("Rshowrnhr");

	//Heirlooms

	//U1 Heirloom Swapping
	//Heirloom Swapping
	!radonon ? turnOn('Hhs') : turnOff('Hhs');
	var hson = getPageSetting('Hhs')
	var hsshieldon = getPageSetting('HhsShield');
	!radonon && hson && hsshieldon ? turnOn('HhsMapSwap') : turnOff('HhsMapSwap');

	//Shields
	!radonon && hson ? turnOn('HhsShield') : turnOff('HhsShield');

	!radonon && hson && hsshieldon ? turnOn('HhsInitial') : turnOff('HhsInitial');
	!radonon && hson && hsshieldon ? turnOn('HhsAfterpush') : turnOff('HhsAfterpush');
	!radonon && hson && hsshieldon ? turnOn('HhsSwapZone') : turnOff('HhsSwapZone');
	!radonon && hson && hsshieldon ? turnOn('HhsDailySwapZone') : turnOff('HhsDailySwapZone');
	!radonon && hson && hsshieldon ? turnOn('HhsC3SwapZone') : turnOff('HhsC3SwapZone');
	!radonon && hson && hsshieldon ? turnOn('HhsC3') : turnOff('HhsC3');

	//Staffs
	!radonon && hson ? turnOn('HhsStaff') : turnOff('HhsStaff');
	var hsstaffon = getPageSetting('HhsStaff');
	!radonon && hson && hsstaffon ? turnOn('HhsWorldStaff') : turnOff('HhsWorldStaff');
	!radonon && hson && hsstaffon ? turnOn('HhsMapStaff') : turnOff('HhsMapStaff');
	!radonon && hson && hsstaffon ? turnOn('HhsFoodStaff') : turnOff('HhsFoodStaff');
	!radonon && hson && hsstaffon ? turnOn('HhsWoodStaff') : turnOff('HhsWoodStaff');
	!radonon && hson && hsstaffon ? turnOn('HhsMetalStaff') : turnOff('HhsMetalStaff');
	!radonon && hson && hsstaffon && game.global.ArchaeologyDone ? turnOn('HhsResourceStaff') : turnOff('HhsResourceStaff');
	!radonon && hson && hsstaffon ? turnOn('HhsWCStaff') : turnOff('HhsWCStaff');
	!radonon && hson && hsstaffon ? turnOn('HhsMCStaff') : turnOff('HhsMCStaff');

	//U2 Heirloom Swapping
	//Heirloom Swapping
	radonon ? turnOn('Rhs') : turnOff('Rhs');
	var hson = getPageSetting('Rhs')
	var hsshieldon = getPageSetting('RhsShield');
	radonon && hson && hsshieldon ? turnOn('RhsMapSwap') : turnOff('RhsMapSwap');
	radonon && hson && hsshieldon ? turnOn('RhsVoidSwap') : turnOff('RhsVoidSwap');

	//Shields
	radonon && hson ? turnOn('RhsShield') : turnOff('RhsShield');

	radonon && hson && hsshieldon ? turnOn('RhsInitial') : turnOff('RhsInitial');
	radonon && hson && hsshieldon ? turnOn('RhsAfterpush') : turnOff('RhsAfterpush');
	radonon && hson && hsshieldon ? turnOn('RhsSwapZone') : turnOff('RhsSwapZone');
	radonon && hson && hsshieldon ? turnOn('RhsDailySwapZone') : turnOff('RhsDailySwapZone');
	radonon && hson && hsshieldon ? turnOn('RhsC3SwapZone') : turnOff('RhsC3SwapZone');
	radonon && hson && hsshieldon ? turnOn('RhsC3') : turnOff('RhsC3');

	//Staffs
	radonon && hson ? turnOn('RhsStaff') : turnOff('RhsStaff');
	var hsstaffon = getPageSetting('RhsStaff');
	radonon && hson && hsstaffon ? turnOn('RhsWorldStaff') : turnOff('RhsWorldStaff');
	radonon && hson && hsstaffon ? turnOn('RhsMapStaff') : turnOff('RhsMapStaff');
	radonon && hson && hsstaffon ? turnOn('RhsFoodStaff') : turnOff('RhsFoodStaff');
	radonon && hson && hsstaffon ? turnOn('RhsWoodStaff') : turnOff('RhsWoodStaff');
	radonon && hson && hsstaffon ? turnOn('RhsMetalStaff') : turnOff('RhsMetalStaff');
	radonon && hson && hsstaffon && game.global.ArchaeologyDone ? turnOn('RhsResourceStaff') : turnOff('RhsResourceStaff');
	radonon && hson && hsstaffon ? turnOn('RhsWCStaff') : turnOff('RhsWCStaff');
	radonon && hson && hsstaffon ? turnOn('RhsMCStaff') : turnOff('RhsMCStaff');

	var autoheirloomenable = getPageSetting('autoheirlooms');
	var keepshieldenable = autoheirloomenable && getPageSetting('keepshields');
	var keepstaffenable = autoheirloomenable && getPageSetting('keepstaffs');
	var keepcoreenable = autoheirloomenable && getPageSetting('keepcores');

	(autoheirloomenable) ? turnOn('typetokeep') : turnOff('typetokeep');
	(autoheirloomenable) ? turnOn('raretokeep') : turnOff('raretokeep');
	(autoheirloomenable) ? turnOn('autoheirloomsperfect') : turnOff('autoheirloomsperfect');
	(autoheirloomenable) ? turnOn('keepshields') : turnOff('keepshields');
	(autoheirloomenable) ? turnOn('keepstaffs') : turnOff('keepstaffs');
	!radonon && (autoheirloomenable) ? turnOn('keepcores') : turnOff('keepcores');


	const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
	const raretokeep = heirloomType.indexOf(getPageSetting('raretokeep'));

	(keepshieldenable && raretokeep >= 0) ? turnOn('slot1modsh') : turnOff('slot1modsh');
	(keepshieldenable && raretokeep >= 1) ? turnOn('slot2modsh') : turnOff('slot2modsh');
	(keepshieldenable && raretokeep >= 2) ? turnOn('slot3modsh') : turnOff('slot3modsh');
	(keepshieldenable && raretokeep >= 5) ? turnOn('slot4modsh') : turnOff('slot4modsh');
	(keepshieldenable && raretokeep >= 7) ? turnOn('slot5modsh') : turnOff('slot5modsh');
	(keepshieldenable && raretokeep >= 9) ? turnOn('slot6modsh') : turnOff('slot6modsh');
	(keepshieldenable && raretokeep >= 11) ? turnOn('slot7modsh') : turnOff('slot7modsh');

	(keepstaffenable && raretokeep >= 0) ? turnOn('slot1modst') : turnOff('slot1modst');
	(keepstaffenable && raretokeep >= 1) ? turnOn('slot2modst') : turnOff('slot2modst');
	(keepstaffenable && raretokeep >= 2) ? turnOn('slot3modst') : turnOff('slot3modst');
	(keepstaffenable && raretokeep >= 5) ? turnOn('slot4modst') : turnOff('slot4modst');
	(keepstaffenable && raretokeep >= 7) ? turnOn('slot5modst') : turnOff('slot5modst');
	(keepstaffenable && raretokeep >= 9) ? turnOn('slot6modst') : turnOff('slot6modst');
	(keepstaffenable && raretokeep >= 11) ? turnOn('slot7modst') : turnOff('slot7modst');

	!radonon && (keepcoreenable) ? turnOn('slot1modcr') : turnOff('slot1modcr');
	!radonon && (keepcoreenable) ? turnOn('slot2modcr') : turnOff('slot2modcr');
	!radonon && (keepcoreenable) ? turnOn('slot3modcr') : turnOff('slot3modcr');
	!radonon && (keepcoreenable) ? turnOn('slot4modcr') : turnOff('slot4modcr');

	//Dropdowns
	document.getElementById('AutoPortal').value = autoTrimpSettings.AutoPortal.selected;
	document.getElementById('HeliumHourChallenge').value = autoTrimpSettings.HeliumHourChallenge.selected;
	document.getElementById('RAutoPortal').value = autoTrimpSettings.RAutoPortal.selected;
	document.getElementById('RadonHourChallenge').value = autoTrimpSettings.RadonHourChallenge.selected;
	document.getElementById('RadonC3Challenge').value = autoTrimpSettings.RadonC3Challenge.selected;
	document.getElementById('dHeliumHourChallenge').value = autoTrimpSettings.dHeliumHourChallenge.selected;

	document.getElementById('Prestige').value = autoTrimpSettings.Prestige.selected;
	document.getElementById('rPrestige').value = autoTrimpSettings.rPrestige.selected;
	document.getElementById('mapologyPrestige').value = autoTrimpSettings.mapologyPrestige.selected;
	document.getElementById('AutoPoison').value = autoTrimpSettings.AutoPoison.selected;
	document.getElementById('AutoWind').value = autoTrimpSettings.AutoWind.selected;
	document.getElementById('AutoIce').value = autoTrimpSettings.AutoIce.selected;

	//Heirloom dropdowns
	document.getElementById('raretokeep').value = autoTrimpSettings.raretokeep.selected;
	document.getElementById('slot1modsh').value = autoTrimpSettings.slot1modsh.selected;
	document.getElementById('slot2modsh').value = autoTrimpSettings.slot2modsh.selected;
	document.getElementById('slot3modsh').value = autoTrimpSettings.slot3modsh.selected;
	document.getElementById('slot4modsh').value = autoTrimpSettings.slot4modsh.selected;
	document.getElementById('slot5modsh').value = autoTrimpSettings.slot5modsh.selected;
	document.getElementById('slot6modsh').value = autoTrimpSettings.slot6modsh.selected;
	document.getElementById('slot7modsh').value = autoTrimpSettings.slot7modsh.selected;
	document.getElementById('slot1modst').value = autoTrimpSettings.slot1modst.selected;
	document.getElementById('slot2modst').value = autoTrimpSettings.slot2modst.selected;
	document.getElementById('slot3modst').value = autoTrimpSettings.slot3modst.selected;
	document.getElementById('slot4modst').value = autoTrimpSettings.slot4modst.selected;
	document.getElementById('slot5modst').value = autoTrimpSettings.slot5modst.selected;
	document.getElementById('slot6modst').value = autoTrimpSettings.slot6modst.selected;
	document.getElementById('slot7modst').value = autoTrimpSettings.slot7modst.selected;
	document.getElementById('slot1modcr').value = autoTrimpSettings.slot1modcr.selected;
	document.getElementById('slot2modcr').value = autoTrimpSettings.slot2modcr.selected;
	document.getElementById('slot3modcr').value = autoTrimpSettings.slot3modcr.selected;
	document.getElementById('slot4modcr').value = autoTrimpSettings.slot4modcr.selected;

	if (game.global.universe == 1)
		document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + autoTrimpSettings.AutoMaps.value);
	if (game.global.universe == 2)
		document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + autoTrimpSettings.RAutoMaps.value);

	if (game.global.universe == 1 && getPageSetting('DisableFarm') <= 0)
		shouldFarm = false;

	if (document.getElementById('Prestige').selectedIndex > 11 && !game.global.slowDone) {
		document.getElementById('Prestige').selectedIndex = 11;
		autoTrimpSettings.Prestige.selected = "Bestplate";
	}

	for (var setting in autoTrimpSettings) {
		var item = autoTrimpSettings[setting];
		if (item.type == 'value' || item.type == 'valueNegative' || item.type == 'multitoggle' || item.type == 'multiValue' || item.type == 'textValue') {
			var elem = document.getElementById(item.id);
			if (elem.parentNode.style.display === 'none') continue;
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

function checkPortalSettings() {
	var result = findOutCurrentPortalLevel();
	var portalLevel = result.level;
	var leadCheck = result.lead;
	if (portalLevel == -1)
		return portalLevel;
	var voidmaps = 0;
	if (game.global.challengeActive != "Daily") {
		voidmaps = getPageSetting('VoidMaps');
	}
	if (game.global.challengeActive == "Daily") {
		voidmaps = getPageSetting('dVoidMaps');
	}
	if (voidmaps >= portalLevel)
		tooltip('confirm', null, 'update', 'WARNING: Your void maps are set to complete after your autoPortal, and therefore will not be done at all! Please Change Your Settings Now. This Box Will Not Go away Until You do. Remember you can choose \'Custom\' autoPortal along with challenges for complete control over when you portal. <br><br> Estimated autoPortal level: ' + portalLevel, 'cancelTooltip()', 'Void Maps Conflict');
	return portalLevel;
}

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

//AutoJobs

//Changing Default Widths for Job buttons
document.getElementById('fireBtn').parentElement.style.width = '14.2%'
document.getElementById('fireBtn').parentElement.style.paddingRight = '2px'
document.getElementById('jobsTitleSpan').parentElement.style.width = '10%'

//AutoJobs button.
//Creating button
var autoJobSetting = game.global.universe === 1 ? 'BuyJobsNew' : 'RBuyJobsNew'
var autoJobContainer = document.createElement("DIV");
autoJobContainer.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; float: left; width: 25%; font-size: 0.9vw; height: auto;");
autoJobContainer.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + (autoTrimpSettings[settingUniverse('autoJobs')].value == 2 ? 3 : autoTrimpSettings[autoJobSetting].value));
autoJobContainer.setAttribute("onmouseover", 'tooltip(\"Toggle AutoJobs\", \"customText\", event, \"Toggle between the AutoJob settings.\")');
autoJobContainer.setAttribute("onmouseout", 'tooltip("hide")');

//Text
var autoJobText = document.createElement("DIV");
autoJobText.innerHTML = autoTrimpSettings[autoJobSetting].name[autoTrimpSettings[autoJobSetting].value];
autoJobText.setAttribute("id", "autoJobLabel");
autoJobText.setAttribute("onClick", "settingChanged(settingUniverse('autoJobs'))");

//Creating cogwheel & linking onclick
var autoJobSettings = document.createElement("DIV");
autoJobSettings.setAttribute('onclick', 'MAZLookalike("AT AutoJobs", "a", "AutoJobs")');
var autoJobSettingsButton = document.createElement("SPAN");
autoJobSettingsButton.setAttribute('class', 'glyphicon glyphicon-cog');

var autoJobColumn = document.getElementById("jobsTitleDiv").children[0];
autoJobContainer.appendChild(autoJobText);
autoJobContainer.appendChild(autoJobSettings);
autoJobSettings.appendChild(autoJobSettingsButton);
autoJobColumn.insertBefore(autoJobContainer, document.getElementById('jobsTitleDiv').children[0].children[2]);

//AutoStructure Button.
var autoStructureSetting = game.global.universe === 1 ? 'BuyBuildingsNew' : 'RBuyBuildingsNew'
//Creating button
var autoStructureContainer = document.createElement("DIV");
autoStructureContainer.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; float: left; width: 25%; font-size: 0.9vw; height: auto;");
autoStructureContainer.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + autoTrimpSettings[settingUniverse('buyBuildings')].enabled);
autoStructureContainer.setAttribute("onmouseover", 'tooltip(\"Toggle AutoStructure\", \"customText\", event, \"Toggle between the AutoStructure settings.\")');
autoStructureContainer.setAttribute("onmouseout", 'tooltip("hide")');

//Text
var autoStructureText = document.createElement("DIV");
autoStructureText.innerHTML = 'AT AutoStructure';
autoStructureText.setAttribute("id", "autoStructureLabel");
autoStructureText.setAttribute("onClick", "settingChanged(settingUniverse('buyBuildings'))");

//Creating cogwheel & linking onclick
var autoStructureSettings = document.createElement("DIV");
autoStructureSettings.setAttribute('onclick', 'MAZLookalike("AT AutoStructure", "a", "AutoStructure")');
var autoStructureSettingsButton = document.createElement("SPAN");
autoStructureSettingsButton.setAttribute('class', 'glyphicon glyphicon-cog');

//Setting up positioning
var autoStructureColumn = document.getElementById("buildingsTitleDiv").children[0];
autoStructureContainer.appendChild(autoStructureText);
autoStructureContainer.appendChild(autoStructureSettings);
autoStructureSettings.appendChild(autoStructureSettingsButton);
autoStructureColumn.replaceChild(autoStructureContainer, document.getElementById('buildingsTitleDiv').children[0].children[1]);

//AutoEquip Button
//Creating button
var autoEquipContainer = document.createElement("DIV");
autoEquipContainer.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; float: left; width: 25%; font-size: 0.9vw; height: auto;");
autoEquipContainer.setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings[settingUniverse('equipOn')].enabled);
autoEquipContainer.setAttribute("onmouseover", 'tooltip(\"Toggle AutoEquip\", \"customText\", event, \"Toggle between the AutoEquip settings.\")');
autoEquipContainer.setAttribute("onmouseout", 'tooltip("hide")');

//Text
var autoEquipText = document.createElement("DIV");
autoEquipText.innerHTML = 'AT AutoEquip';
autoEquipText.setAttribute("id", "autoEquipLabel");
autoEquipText.setAttribute("onClick", "settingChanged(settingUniverse('equipOn'))");

//Setting up positioning
var autoEquipColumn = document.getElementById("equipmentTitleDiv").children[0];
autoEquipContainer.appendChild(autoEquipText);
autoEquipColumn.replaceChild(autoEquipContainer, document.getElementById('equipmentTitleDiv').children[0].children[2]);

function getDailyHeHrStats() { var a = ""; if ("Daily" == game.global.challengeActive) { var b = game.stats.heliumHour.value() / (game.global.totalHeliumEarned - (game.global.heliumLeftover + game.resources.helium.owned)); b *= 100 + getDailyHeliumValue(countDailyWeight()), a = "<b>After Daily He/Hr: " + b.toFixed(3) + "%" } return a }
function getDailyRnHrStats() { var a = ""; if ("Daily" == game.global.challengeActive) { var b = game.stats.heliumHour.value() / (game.global.totalRadonEarned - (game.global.radonLeftover + game.resources.radon.owned)); b *= 100 + getDailyHeliumValue(countDailyWeight()), a = "<b>After Daily Rn/Hr: " + b.toFixed(3) + "%" } return a }
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
			<p><b>enoughHealth: </b>\" + enoughHealth + \"<br><b>enoughDamage: </b>\" + enoughDamage +\"<br>\
			<b>shouldFarm: </b>\" + shouldFarm +\"<br>\
			<p>\<br>\<b>H:D ratio = </b>\" + prettify(HDRatio)  + \"<br>\
			<b>Void H:D Ratio = </b>\" + prettify(voidHDRatio) + \"<br>\
			")');
			document.getElementById('autoMapStatus').parentNode.setAttribute("onmouseover", 'tooltip(\"Health to Damage ratio\", \"customText\", event, \"This status box displays the current mode Automaps is in.<br>\'H:D ratio\' means EnemyHealth to YourDamage Ratio.<br>When Auto Equality is toggled to \'Advanced\' it will factor in the equality required for the zone too.\
			<p>\<br>\<b>H:D ratio = </b>\" + prettify(HDRatio)  + \"<br>\
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
			document.getElementById('autoMapStatus').parentNode.setAttribute("onmouseover", 'tooltip(\"Health to Damage ratio\", \"customText\", event, \"This status box displays the current mode Automaps is in. The number usually shown here during Farming or Want more Damage modes is the \'HDratio\' meaning EnemyHealth to YourDamage Ratio (in X stance). Above 16 will trigger farming, above 4 will trigger going for Map bonus up to 10 stacks.<p><b>enoughHealth: </b>\" + enoughHealth + \"<br><b>enoughDamage: </b>\" + enoughDamage +\"<br><b>shouldFarm: </b>\" + shouldFarm +\"<br><b>H:D ratio = </b>\" + calcHDRatio()  + \"<br>\<b>Free void = </b>\" + (game.permaBoneBonuses.voidMaps.tracker/10) + "/10" + \"<br>\")');
		}
	}
	saveSettings();
}

function toggleRadonStatus(update) {
	if (update) {
		if (getPageSetting('Rshowautomapstatus')) {
			document.getElementById('autoMapStatus').parentNode.style = 'display: block; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
			document.getElementById('autoMapStatus').parentNode.setAttribute("onmouseover", 'tooltip(\"Health to Damage ratio\", \"customText\", event, \"This status box displays the current mode Automaps is in.<br>\'H:D ratio\' means EnemyHealth to YourDamage Ratio.<br>When Auto Equality is toggled to \'Advanced\' it will factor in the equality required for the zone too.<p>\<br>\<b>H:D ratio = </b>\" + prettify(HDRatio)  + \"<br>\<b>Void H:D Ratio = </b>\" + prettify(voidHDRatio) + \"<br>\")');
		} else
			document.getElementById('autoMapStatus').parentNode.style = 'display: none; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
		return
	}

	if (getPageSetting('Rshowautomapstatus')) {
		setPageSetting('Rshowautomapstatus', 0);
		if (game.global.universe == 2) {
			turnOff('autoMapStatus')
			document.getElementById('autoMapStatus').parentNode.style = 'display: none; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'

			document.getElementById('autoMapStatus').parentNode.setAttribute("onmouseover", 'tooltip(\"Health to Damage ratio\", \"customText\", event, \"This status box displays the current mode Automaps is in.<br>\'H:D ratio\' means EnemyHealth to YourDamage Ratio.<br>When Auto Equality is toggled to \'Advanced\' it will factor in the equality required for the zone too.<p>\<br>\<b>H:D ratio = </b>\" + prettify(HDRatio)  + \"<br>\<b>Void H:D Ratio = </b>\" + prettify(voidHDRatio) + \"<br>\")');
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

function toggleHeHr(update) {
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
