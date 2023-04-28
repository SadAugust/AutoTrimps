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
	autoMapsContainer.setAttribute("onmouseover", 'tooltip(\"Toggle Auto Maps\", \"customText\", event, autoTrimpSettings.autoMaps.description(true))');
	autoMapsContainer.setAttribute("onmouseout", 'tooltip("hide")');
	autoMapsContainer.innerHTML = 'Auto Maps';
	var fightButtonCol = document.getElementById("battleBtnsColumn");
	fightButtonCol.appendChild(autoMapsContainer);

	var autoMapsStatusContainer = document.createElement("DIV");
	autoMapsStatusContainer.setAttribute("style", "display: block; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);");
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
	<b>B</b>: The amount of time your trimps have been breeding.<br>\
	<b>T</b>: Your current tenacity time.\")');
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
	(link1.href = MODULES_AT.basepath + "tabs.css"),
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
	for (var a = document.getElementsByClassName("tabcontent"), b = 0, c = a.length; b < c; b++) {
		if (a[b].id === 'Test') continue;
		a[b].style.display = "block";
	}
	for (var d = document.getElementsByClassName("tablinks"), b = 0, c = d.length; b < c; b++) {
		if (d[b].id === 'Test') continue;
		(d[b].style.display = "block"), d[b].className.includes(" active") || (d[b].className += " active");
	}
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
	return (((game.stats.highestLevel.valueTotal()) * liquidAmount));
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
	createTabs("Jobs", "Geneticassist Settings");
	createTabs("Equipment", "Equipment Settings");
	createTabs("Maps", "Maps - AutoMaps & VoidMaps Settings");
	createTabs("Spire", "Spire - Settings for Spires");
	createTabs("Daily", "Dailies - Settings for Dailies");
	createTabs("C2", "C2 - Settings for C2s");
	createTabs("Challenges", "Challenges - Settings for Specific Challenges");
	createTabs("Combat", "Combat & Stance Settings");
	createTabs("Magma", "Dimensional Generator & Magmite Settings");
	createTabs("Heirlooms", "Heirloom Settings");
	createTabs("Golden", "Golden Upgrade Settings");
	createTabs("Nature", "Nature Settings");
	createTabs("Display", "Display & Spam Settings");
	createTabs("Test", "Basic testing functions - Should never be seen by users");
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

	//Core -- Descriptions done!
	const displayCore = true;
	if (displayCore) {
		createSetting('gatherType',
			function () { return (['Manual Gather', 'Auto Gather', 'Mining Only', 'Science Research OFF']) },
			function () {
				var description = "<p>Controls what you gather/build.</p>";
				description += "<p><b>Manual Gather</b><br>Disables this setting.</p>";
				description += "<p><b>Auto Gather</b><br>Automatically switch your gathering between different resources and the building queue depending on what it deems necessary.</p>";
				description += "<p><b>Mining Only</b><br>Sets gather to Mining. If buildings are in the queue then they will override this. Only use this if you are past the early stages of the game and have Foremany unlocked.</p>";
				description += "<p><b>Science Research OFF</b><br>Works the same as 'Auto Gather' but stops Science from being gathered.</p>";
				description += "<p><b>Recommended:</b> Auto Gather</p>";
				return description;
			}, 'multitoggle', 0, null, 'Core', [1, 2]);
		createSetting('upgradeType',
			function () { return (['Manual Upgrades', 'Buy All Upgrades', 'Upgrades no Coords']) },
			function () {
				var description = "<p>Controls what you upgrade.</p>";
				description += "<p><b>Manual Upgrades</b><br>Disables this setting.</p>";
				description += "<p><b>Buy All Upgrades</b><br>Automatically purchases non-equipment upgrades. Equipment upgrades are controlled by settings in the Gear tab.</p>";
				description += "<p><b>Upgrades no Coords</b><br>Works the same as 'Buy All Upgrades' but stops Coordination upgrades from being purchased.</p>";
				description += "<p><b>Recommended:</b> Buy All Upgrades</p>";
				return description;
			}, 'multitoggle', 0, null, 'Core', [1, 2]);
		createSetting('TrapTrimps',
			function () { return ('Trap Trimps') },
			function () {
				var description = "<p>Automatically builds traps and traps trimps when needed. <b>Upgrade setting must be set to 'Buy All Upgrades' for this to work!</b></p>";
				description += "<p><b>Recommended:</b> On whilst highest zone is below 30 otherwise off</p>";
				return description;
			}, 'boolean', false, null, 'Core', [1, 2]);
		createSetting('autoPerks',
			function () { return ('Auto Allocate Perks') },
			function () {
				var description = "<p>Uses a basic version of " + (currSettingUniverse === 2 ? "Surky" : "Perky") + ". If you want more advanced settings import your save into " + (currSettingUniverse === 2 ? "Surky" : "Perky") + ".</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [1, 2]);
		createSetting('presetSwap',
			function () { return ('Preset Swapping') },
			function () {
				var description = "<p>Will automatically swap Surky presets when portaling into runs.</p>";
				description += "<p>Fillers will load <b>'Easy Radon Challenge</b>'</p>";
				description += "<p>Dailies will load <b>'Difficult Radon Challenge</b>'</p>";
				description += "C3s or Mayhem-like challenges will load <b>'Push/C3/Mayhem</b>'.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [2],
			function () { return (getPageSetting('autoPerks')) });
		createSetting('presetSwapMutators',
			function () { return ('Preset Swap Mutators') },
			function () {
				var description = "<p>Will automatically load the preset that corresponds to your run type after auto portaling. For info on which preset is loaded and when, mouseover the presets in the games mutator window.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 201) });

		createSetting('radonsettings',
			function () { return (['Helium', 'Radon']) },
			function () { return ('Switch between Helium (U1) and Radon (U2) settings.') },
			'multitoggle', 0, null, 'Core', [0]);
		var $radonsettings = document.getElementById('radonsettings');
		$radonsettings.parentNode.style.setProperty('float', 'right');
		$radonsettings.parentNode.style.setProperty('margin-right', '1vw');
		$radonsettings.parentNode.style.setProperty('margin-left', '0');

		//Auto Portal
		createSetting('autoPortal',
			function () { return ('AutoPortal') },
			function () {
				var description = "<p>Will automatically portal into different challenges depending on the way you setup the AutoPortal related settings.</p>";
				description += "<p><b>" + resource() + " Challenges will appear here when they've been unlocked in the game.</b></p>";
				description += "<p>Additional settings appear when <b>" + resource() + " Per Hour</b> or <b>Custom</b> are selected.</p>";
				description += "<p><b>Off</b><br>Disables this setting.</p>";
				description += "<p><b>" + resource() + " Per Hour</b><br>Portals into new runs when your " + resourceHour().toLowerCase() + "/hr goes below your current runs best " + resourceHour().toLowerCase() + "/hr.";
				description += " There is a <b>Buffer</b> setting, which lowers the check from best " + resourceHour().toLowerCase() + "/hr to (best - buffer setting) " + resourceHour().toLowerCase() + "/hr.</p>";
				description += "<p><b>Specific Challenges</b><br>If a specific challenge has been selected it will automatically portal into it when you don't have a challenge active.</p>";
				description += "<p><b>Custom</b><br>Will portal into the challenge selected in the <b>Challenge</b> setting at the zone specified in the <b>Portal Zone</b> setting.</p>";
				description += "<p><b>Recommended:</b> " + (currSettingUniverse === 2 ? "Custom with a specified endzone to use the Scruffy 3 ability" : "Specific challenges until you reach zone 230 then " + resource() + " Per Hour") + "</p>";
				return description;
			}, 'dropdown', 'Off', ["None"], 'Core', [1, 2]);

		createSetting('heliumHourChallenge',
			function () { return ('Challenge') },
			function () {
				var description = "<p>Automatically portal into this challenge when using the <b>" + resource() + " Per Hour</b> or <b>Custom</b> AutoPortal settings.</p>";
				description += "<p><b>" + resource() + " challenges will appear here when they've been unlocked in the game.</b></p>";
				description += "<p><b>Recommended:</b> Last challenge available</p>";
				return description;
			}, 'dropdown', 'None', ['None'], 'Core', [1, 2],
			function () {
				return (
					getPageSetting('autoPortal', currSettingUniverse).includes('Hour') || getPageSetting('autoPortal', currSettingUniverse) === 'Custom')
			});
		createSetting('heliumC2Challenge',
			function () { return ('Challenge') },
			function () {
				var description = "<p>Automatically portal into this C" + cinf()[1] + " when using the <b>Challenge" + cinf()[1] + "</b> AutoPortal setting.</p>";
				description += "<p><b>C" + cinf()[1] + " challenges will appear here when they've been unlocked in the game.</b></p>";
				description += "<p><b>Must end the challenges with the <b>Finish " + cinf() + "</b> setting in the <b>" + cinf() + "</b> tab if you want the run to end.</b>";
				description += "<p><b>Recommended:</b> The C" + cinf()[1] + " you want to run</p>";
				return description;
			}, 'dropdown', 'None', ['None'], 'Core', [1, 2],
			function () {
				return (
					getPageSetting('autoPortal', currSettingUniverse) === 'Challenge 2' || getPageSetting('autoPortal', currSettingUniverse) === 'Challenge 3')
			});
		createSetting('autoPortalZone',
			function () { return ('Portal Zone') },
			function () {
				var description = "<p>Will automatically portal once this zone is reached when using the <b>Custom</b> AutoPortal setting.</p>";
				description += "<p><b>Setting this to 200 would portal when you reach zone 200.</b></p>";
				description += "<p><b>Recommended:</b> The zone you would like your run to end</p>";
				return description;
			}, 'value', 999, null, 'Core', [1, 2],
			function () {
				return (
					getPageSetting('autoPortal', currSettingUniverse) === 'Challenge 3' || getPageSetting('autoPortal', currSettingUniverse) === 'Custom')
			});
		createSetting('heHrDontPortalBefore',
			function () { return ('Don\'t Portal Before') },
			function () {
				var description = "<p>Will stop the script from automatically portaling before the specified zone when using the <b>" + resource() + " Per Hour</b> AutoPortal setting.</p>";
				description += "<p>It is an additional check that prevents drops in " + resourceHour().toLowerCase() + "/hr from triggering autoportal.</p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> The minimum zone you would like your run to reach</p>";
				return description;
			}, 'value', -1, null, 'Core', [1, 2],
			function () {
				return (
					getPageSetting('autoPortal', currSettingUniverse).includes('Hour'))
			});
		createSetting('heliumHrBuffer',
			function () { return (resourceHour() + '/Hr Buffer %') },
			function () {
				var description = "<p>When using the " + resourceHour() + " Per Hour AutoPortal setting, it will portal if your " + resourceHour().toLowerCase() + "/hr drops by this settings % input lower than your best for current run.</p>";
				description += "<p>Allows portaling midzone if we exceed set buffer amount by 5x. (ie a normal 2% buffer setting would now portal mid-zone you fall below 10% buffer).</p>";
				description += "<p><b>Set to 0 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> 4</p>";
				return description;
			}, 'value', 0, null, 'Core', [1, 2],
			function () {
				return (getPageSetting('autoPortal', currSettingUniverse).includes('Hour'))
			});
		createSetting('heliumHrPortal',
			function () { return (['Auto Portal Immediately', 'Portal after voids']) },
			function () {
				var description = "<p>How you would like to portal when below your " + resourceHour().toLowerCase() + "/hr threshold.</p>";
				description += "<p><b>Auto Portal Immediately</b><br>Will auto portal straight away.";
				description += "<p><b>Portal after voids</b><br>Will run any remaining void maps then proceed to portal.";
				if (currSettingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 230) description += "<p><b>Portal after poison voids</b><br>Will continue your run until you reach the next poison zone and run void maps there.";
				description += "<p><b>Recommended:</b> Portal after voids</p>";
				return description;
			}, 'multitoggle', 0, null, 'Core', [1, 2],
			function () {
				return (getPageSetting('autoPortal', currSettingUniverse).includes('Hour'))
			});
		createSetting('portalVoidIncrement',
			function () { return ('Liq for free Void') },
			function () {
				var description = "<p>Delays auto portaling into your preferred run and repeatedly does U1 portals until your bone void counter is 1 drop away from a guaranteed extra void map.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [0],
			function () { return (game.permaBoneBonuses.voidMaps.owned >= 5 && checkLiqZoneCount() >= 20) });

		//Pause + Switch
		createSetting('pauseScript',
			function () { return ('Pause AutoTrimps') },
			function () {
				var description = "<p>Pauses the AutoTrimps Script.</p>";
				description += "<p><b>Graphs will continue tracking data while paused.</b></p>";
				return description;
			}, 'boolean', null, null, 'Core', [0]);
		var $pauseScript = document.getElementById('pauseScript');
		$pauseScript.parentNode.style.setProperty('float', 'right');
		$pauseScript.parentNode.style.setProperty('margin-right', '1vw');
		$pauseScript.parentNode.style.setProperty('margin-left', '0');

		createSetting('autoEggs',
			function () { return ('AutoEggs') },
			function () {
				var description = "<p>Clicks easter eggs when they are active in the world.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'Core', [0],
			function () { return (!game.worldUnlocks.easterEgg.locked) });
		var $eggSettings = document.getElementById('autoEggs');
		$eggSettings.parentNode.style.setProperty('float', 'right');
		$eggSettings.parentNode.style.setProperty('margin-right', '1vw');
		$eggSettings.parentNode.style.setProperty('margin-left', '0');
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Daily -- U2+Portal descriptions done! Still need to finish U1 settings for Windstacking.
	const displayDaily = true
	if (displayDaily) {
		createSetting('buyheliumy',
			function () { return ('Buy ' + (currSettingUniverse === 2 ? "Radonculous" : "Heliumy") + ' %') },
			function () {
				var description = "<p>Buys the " + (currSettingUniverse === 2 ? "Radonculous" : "Heliumy") + " bonus for <b>100 bones</b> when the daily bonus is above this value.</p>";
				description += "<p><b>Recommended:</b> Anything above 475. Will not buy if you cant afford to, or value is -1.</p>";
				return description;
			},
			'value', -1, null, 'Daily', [1, 2]);
		createSetting('dfightforever',
			function () { return (['DFA: Off', 'DFA: Non-Empowered', 'DFA: All Dailies']) },
			function () {
				var description = "<p>Will control how combat is handled in dailies. If enabled will override settings in the <b>Combat</b> tab.</p>";
				description += "<p><b>DFA: Off</b><br>Disables this setting.</p>";
				description += "<p><b>DFA: Non-Empowered</b><br>Will only send trimps to fight if the daily doesn't have the empowered mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rariry to Keep</b> will be shown.</p>";
				description += "<p><b>DFA: All Dailies</b><br>Sends trimps to fight if they're not fighting in daily challenges, Won't do anything on Bloodthirst/Plagued/Bogged dailies.</p>";

				description += "<p><b>Recommended:</b> DFA: Off</p>";
				return description;
			},
			'multitoggle', 0, null, 'Daily', [1]);
		createSetting('avoidEmpower',
			function () { return ('Avoid Empower') },
			function () {
				var description = "<p>Tries to avoid Empower stacks during empower dailies by suiciding your trimps when the enemies next hit will kill them.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', true, null, 'Daily', [1]);
		createSetting('dscryvoidmaps',
			function () { return ('Daily VM Scryer') },
			function () {
				var description = "<p>Will override any stance settings and set your stance to Scryer during Void Maps if you have the Scryhard II talent.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'Daily', [1]);

		createSetting('dIgnoreSpiresUntil',
			function () { return ('Daily Ignore Spires Until') },
			function () {
				var description = "<p>Will disable all of the Spire features unless you're in a Spire at or above this value.</p>";
				description += "<p><b>This works based off Spire number rather than zone. So if you want to ignore Spires until Spire II at z300 then enter 2, Spire III at z400 would be 3 etc.</b></p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> Second to last Spire you reach on your runs.</p>";
				return description;
			}, 'value', -1, null, 'Daily', [1]);
		createSetting('dExitSpireCell',
			function () { return ('Daily Exit Spire Cell') },
			function () {
				var description = "<p>Will exit out of active Spires upon clearing this cell.</p>";
				description += "<p><b>Works based off cell number so if you want it to exit after Row #4 then set to 40.</b></p>";
				description += "<p>Any health or damage calculations for the Spire will be based off this if set.</p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b>-1</p>";
				return description;
			}, 'value', -1, null, 'Daily', [1]);
		createSetting('dPreSpireNurseries',
			function () { return ('Daily Nurseries pre-Spire') },
			function () {
				var description = "<p>Set the number of <b>Nurseries</b> to build during active Spires.</p>";
				description += "<p><b>Will override any <b>Nursery</b> settings that you have setup in the <b>AT AutoStructure</b> setting.</b></p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'Daily', [1]);

		createSetting('use3daily',
			function () { return ('Daily Windstacking') },
			function () { return ('<b> This must be on for Daily windstacking settings to appear!</b> Overrides your Autostance settings to use the WS stance on Dailies.') },
			'boolean', false, null, 'Daily', [1]);
		createSetting('dWindStackingMin',
			function () { return ('Daily Windstack Min Zone') },
			function () { return ('For use with Windstacking Stance, enables windstacking in zones above and inclusive of the zone set for dailys. (Get specified windstacks then change to D, kill bad guy, then repeat). This is designed to force S use until you have specified stacks in wind zones, overriding scryer settings. All windstack settings apart from Daily WS MAX work off this setting.') },
			'value', -1, null, 'Daily', [1],
			function () { return (autoTrimpSettings.use3daily.enabled) });
		createSetting('dWindStackingMinHD',
			function () { return ('Daily Windstack H:D') },
			function () { return ('For use with Windstacking Stance in Dailies, fiddle with this to maximise your stacks in wind zones for Dailies. If H:D is above this setting it will not use W stance. If it is below it will.') },
			'value', -1, null, 'Daily', [1],
			function () { return (autoTrimpSettings.use3daily.enabled) });
		createSetting('dWindStackingMax',
			function () { return ('Daily Windstack Stacks') },
			function () { return ('For use with Windstacking Stance in Dailies. Amount of windstacks to obtain before switching to D stance. Default is 200, but I recommend anywhere between 175-190. In Wind Enlightenment it will add 100 stacks to your total automatically. So if this setting is 200 It will assume you want 300 stacks instead during enlightenment.') },
			'value', 200, null, 'Daily', [1],
			function () { return (autoTrimpSettings.use3daily.enabled) });
		createSetting('liqstack',
			function () { return ('Stack Liquification') },
			function () { return ('Stack Wind zones during Wind Enlight during Liquification.') },
			'boolean', false, null, 'Daily', [1],
			function () { return (autoTrimpSettings.use3daily.enabled) });


		createSetting('bloodthirstDestack',
			function () { return ('Bloodthirst Destack') },
			function () {
				var description = "<p>Will automatically run a level 6 map when you are one bloodthirst stack (death) away from the enemy healing and gaining additional attack.</p>";
				description += "<p><b>Won't function without Auto Maps enabled.</b></p>"
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'Daily', [2]);
		createSetting('bloodthirstVoidMax',
			function () { return ('Void: Max Bloodthirst') },
			function () {
				var description = "<p>Will make your Void HD Ratio assume you have max bloodthirst stacks active if you're in a bloodthirst daily.</p>";
				description += "<p><b>Recommended:</b> On if you're running void maps at max tenacity</p>";
				return description;
			},
			'boolean', true, null, 'Daily', [2]);
		createSetting('empowerAutoEquality',
			function () { return ('AE: Empower') },
			function () {
				var description = "<p>When the empower mod is active it will automatically adjust calculations for enemy stats to factor in either explosive or crit modifiers if they're active on the current daily.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', true, null, 'Daily', [2],
			function () { return (getPageSetting('equalityManagement') === 2) });
		createSetting('mapOddEvenIncrement',
			function () { return ('Odd/Even Increment') },
			function () {
				var description = "<p>Will automatically increment your farming settings world input by 1 if the current zone has a negative even or odd related buff. If the daily has both types of mods it will try to identify which one is worse and skip farming on that zone type.</b></p>";
				description += "<p>Will only impact the following settings: Heirloom swap zone, Void Maps, Map Farm" + (currSettingUniverse === 2 ? ", Tribute Farm, Worshipper Farm, Smithy Farm." : ".") + "</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1, 2]);

		//Daily Portal
		createSetting('dailyPortalStart',
			function () { return ('Auto Start Daily') },
			function () {
				var description = "<p>When you portal with this on it will start a daily for you if there's any available. Will select the oldest daily available and run it.</p>";
				description += "<p><b>Recommended:</b> Only on when you want to run dailies</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1, 2]);
		createSetting('dailyPortal',
			function () { return (['Daily Portal Off', 'DP: ' + resourceHour() + '/Hr', 'DP: Custom']) },
			function () {
				var description = "<p>Will automatically portal into different challenges depending on the way you setup the Daily AutoPortal related settings.</p>";
				description += "<p>Additional settings appear when <b>DP: " + resourceHour() + "/Hr</b> or <b>DP: Custom</b> are selected.</p>";
				description += "<p><b>Daily Portal Off</b><br>Disables this setting. <b>Be warned it will never end your dailies!</b></p>";

				description += "<p><b>DP: " + resourceHour() + "/Hr</b><br>Portals into new runs when your " + resourceHour().toLowerCase() + "/hr goes below your current runs best " + resourceHour().toLowerCase() + "/hr.";

				description += " There is a <b>Buffer</b> setting, which lowers the check from best " + resourceHour().toLowerCase() + "/hr to (best - buffer setting) " + resourceHour().toLowerCase() + "/hr.</p>";
				description += "<p><b>DP: Custom</b><br>Will portal into the challenge selected in the <b>DP: Challenge</b> setting at the zone specified in the <b>Daily Portal Zone</b> setting.</p>";
				description += "<p><b>Recommended:</b> " + (currSettingUniverse === 2 ? "DP: Custom with a specified endzone to make use of the Scruffy level 3 ability" : ("DP: " + resourceHour() + "/Hr")) + "</p>";
				return description;
			}, 'multitoggle', 0, null, 'Daily', [1, 2]);

		createSetting('dailyHeliumHourChallenge',
			function () { return ('DP: Challenge') },
			function () {
				var description = "<p>Automatically portal into this challenge after dailies when using the <b>DP: " + resourceHour() + "/Hr</b> or <b>DP: Custom</b> Daily AutoPortal settings.</p>";
				description += "<p><b>" + resource() + " challenges will appear here when they've been unlocked in the game.</b></p>";
				description += "<p><b>Recommended:</b> Last challenge available</p>";
				return description;
			}, 'dropdown', 'None', ['None'], 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) > 0) });

		createSetting('dailyC2Challenge',
			function () { return ('DP: ' + cinf()) },
			function () {
				var description = "<p>Automatically portal into this C" + cinf()[1] + " when using the <b>Challenge" + cinf()[1] + "</b> DP: Challenge setting.</p>";
				description += "<p><b>C" + cinf()[1] + " challenges will appear here when they've been unlocked in the game.</b></p>";
				description += "<p><b>Must end the challenges with the <b>Finish " + cinf() + "</b> setting in the <b>" + cinf() + "</b> tab if you want the run to end.</b>";
				description += "<p><b>Recommended:</b> The C" + cinf()[1] + " you want to run</p>";
				return description;
			}, 'dropdown', 'None', ['None'], "Daily", [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) > 0 && getPageSetting('dailyHeliumHourChallenge', currSettingUniverse).includes('Challenge ')) });

		createSetting('dailyPortalZone',
			function () { return ('Daily Portal Zone') },
			function () {
				var description = "<p>Will automatically portal once this zone is reached when using the <b>DP: Custom</b> Daily AutoPortal setting.</p>";
				description += "<p><b>Setting this to 200 would portal when you reach zone 200.</b></p>";
				description += "<p><b>Recommended:</b> The zone you would like your run to end</p>";
				return description;
			}, 'value', 999, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) >= 2) });

		createSetting('dailyDontPortalBefore',
			function () { return ('D: Don\'t Portal Before') },
			function () {
				var description = "<p>Will stop the script from automatically portaling before the specified zone when using the <b>DP: " + resourceHour() + "/Hr</b> Daily AutoPortal setting.</p>";
				description += "<p>It is an additional check that prevents drops in " + resourceHour().toLowerCase() + "/hr from triggering autoportal.</p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> The minimum zone you would like your run to reach</p>";
				return description;
			}, 'value', 999, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) === 1) });

		createSetting('dailyHeliumHrBuffer',
			function () { return ('D: ' + resourceHour() + '/Hr Buffer %') },
			function () {
				var description = "<p>When using the Daily " + resourceHour() + "/Hr Autoportal setting, it will portal if your " + resourceHour().toLowerCase() + "/hr drops by this settings % input lower than your best for current run.</p>";
				description += "<p>Allows portaling midzone if we exceed set buffer amount by 5x. (ie a normal 2% buffer setting would now portal mid-zone you fall below 10% buffer).</p>";
				description += "<p><b>Set to 0 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> 1.25</p>";
				return description;
			}, 'value', 0, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) === 1) });

		createSetting('dailyHeliumHrPortal',
			function () { return (['Auto Portal Immediately', 'Portal after voids']) },
			function () {
				var description = "<p>How you would like to portal when below your " + resourceHour().toLowerCase() + "/hr threshold.</p>";
				description += "<p><b>Auto Portal Immediately</b><br>Will auto portal straight away.";
				description += "<p><b>Portal after voids</b><br>Will run any remaining void maps then proceed to portal.";
				if (currSettingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 230) description += "<p><b>Portal after poison voids</b><br>Will continue your run until you reach the next poison zone and run void maps there.";
				description += "<p><b>Recommended:</b> Portal after voids</p>";
				return description;
			}, 'multitoggle', 0, null, 'Daily', [1, 2],
			function () {
				return (getPageSetting('dailyPortal', currSettingUniverse) === 1)
			});

		createSetting('dailyPortalFiller',
			function () { return ('Filler run') },
			function () {
				var description = "<p>Will run a filler challenge (selected in DP: Challenge) inbetween dailies.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			},
			'boolean', false, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) > 0) });

		createSetting('dailyPortalPreviousUniverse',
			function () { return ('Daily prev universe') },
			function () {
				var description = "<p>Will start your daily in the previous universe. Takes you back to this universe after it has finished running and does runs as normal.</p>";
				description += "<p><b>ENSURE YOU SETUP DAILY PORTAL SETTINGS IN PREVIOUS UNIVERSE.</b><br>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			},
			'boolean', false, null, 'Daily', [2],
			function () { return game.stats.highestRadLevel.valueTotal() >= 30 });

		createSetting('dailyDontCap',
			function () { return ('Use when capped') },
			function () {
				var description = "<p>Will cause the script to only start dailies when you have 7 available to run.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			},
			'boolean', false, null, 'Daily', [1, 2]);

		createSetting('dailySkip',
			function () { return ('Skip this daily') },
			function () {
				var description = "<p>Use this to make the script skip a specific daily when starting runs.</p>";
				description += "<p><b>Must be input with the following format \'YEAR-MONTH-DAY\' without any hyphens.</b></p>"
				description += "<p><b>Recommended:</b> 0</p>";
				return description;
			},
			'textValue', 0, null, 'Daily', [1, 2]);

		createSetting('dailyPortalSettingsArray',
			function () { return ('Daily Portal Settings') },
			function () { return ('Click to adjust settings.') },
			'mazDefaultArray', {
			Reflect: { enabled: false, zone: 0 },
			Empower: { enabled: false, zone: 0 },
			Mutimp: { enabled: false, zone: 0 },
			Bloodthirst: { enabled: false, zone: 0 },
			Famine: { enabled: false, zone: 0 },
			Large: { enabled: false, zone: 0 },
			Weakness: { enabled: false, zone: 0 },
			Empowered_Void: { enabled: false, zone: 0 },
			Heirlost: { enabled: false, zone: 0 },
		}, null, 'Legacy', [1, 2]);
	}

	//----------------------------------------------------------------------------------------------------------------------

	//C2 -- Descriptions done!
	const displayC2 = true;
	if (displayC2) {
		createSetting('c2Finish',
			function () { return ('Finish ' + cinf()) },
			function () {
				var description = "<p>Abandons " + cinf() + "s when this zone is reached.</p>";
				description += "<p><b>It's recommended to only use <b>" + cinf() + " Runner Set Values</b> at endgame or if you're active.</b></p>";
				description += "<p><b>IF ENABLED " + cinf() + " RUNNERS PORTAL ZONE WILL OVERRIDE THIS</b></p>";
				description += "<p>If set to -1 it will disable this setting.</p>";
				description += "<p>Recommended: Zones ending with 0 for most " + cinf() + " runs.</p>";
				return description;
			}, 'value', -1, null, 'C2', [1, 2]);
		createSetting('c2Table',
			function () { return (cinf() + ' Table') },
			function () {
				var description = "<p>Display your challenge runs in a convenient table which is colour coded.</p>";
				description += "<p><b>Green</b><br>Challenges that are green are normally not worth updating.</p>";
				description += "<p><b>Yellow</b><br>You should consider updating yellow challenges.</p>";
				description += "<p><b>Red</b><br>Updating red challenges is typically worthwhile.</p>";
				description += "<p><b>Blue</b><br>This challenge hasn't been run yet and should be done as soon as possible.</p>";
				return description;
			}, 'infoclick', 'c2table', null, 'C2', [1, 2]);

		createSetting('cfightforever',
			function () { return ('Tox/Nom Fight Always') },
			function () {
				var description = "<p>Sends trimps to fight if they're not fighting in the Toxicity and Nom Challenges, regardless of BAF.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1]);

		createSetting('c2SharpTrimps',
			function () { return (cinf() + ' Sharp Trimps') },
			function () {
				var description = "<p>Buys the Sharp Trimps bonus for <b>25 bones</b> during " + cinf() + " or special challenge (" + (currSettingUniverse === 2 ? "Mayhem, Pandemonium, Desolation" : "Frigid") + ") runs.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1, 2]);
		createSetting('c2GoldenMaps',
			function () { return (cinf() + ' Golden Maps') },
			function () {
				var description = "<p>Buys the Golden Maps bonus for <b>20 bones</b> during " + cinf() + " or special challenge (" + (currSettingUniverse === 2 ? "Mayhem, Pandemonium, Desolation" : "Frigid") + ") runs.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1, 2]);
		createSetting('c2disableFinished',
			function () { return ('Hide Finished Challenges') },
			function () {
				var description = "<p>Hides challenges that have a maximum completion count when they've been finished.</p>";
				description += "<p><b>If you're running one of the challenges the settings will appear for the duration of that run.</b></p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 100) });

		createSetting('c2RunnerStart',
			function () { return (cinf() + ' Runner') },
			function () {
				var description = "<p>Enable this if you want to use " + cinf() + " running features.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
				return ('See \'' + cinf() + ' Table\' for a list of challenges that this can run.')
			},
			'boolean', false, null, 'C2', [1, 2]);

		createSetting('c2RunnerMode',
			function () { return ([cinf() + ' Runner %', cinf() + ' Runner Set Values']) },
			function () {
				var description = "<p>Toggles between the two modes that " + cinf() + " Runner can use.</p>";
				description += "<p><b>It's recommended to only use <b>" + cinf() + " Runner Set Values</b> at endgame or if you're active.</b></p>";
				description += "<p><b>" + cinf() + " Runner %</b><br>Will run " + cinf() + "s when they are below a set percentage of your HZE.</b><br><b>For a list of challenges that this will run see " + cinf() + " Table.</b></p>";
				description += "<p><b>" + cinf() + " Runner Set Values</b><br>\
				Uses the <b>" + cinf() + " Runner Settings</b> popup and will run enabled " + cinf() + "s when they are below the designated end zone.</p>";
				description += "<p><b>Recommended:</b> " + cinf() + " Runner %</p>";
				return description;
			}, 'multitoggle', 0, null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse)) });
		createSetting('c2RunnerSettings',
			function () { return (cinf() + ' Runner Settings') },
			function () {
				var description = "<p>Here you can enable the challenges you would like C3 runner to complete and the zone you'd like the respective challenge to finish at and it will start them on the next auto portal if necessary.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				return description;
			},
			'mazArray', {}, 'MAZLookalike("C2 Runner", "c2Runner", "c2Runner")', 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse) && getPageSetting('c2RunnerMode', currSettingUniverse) === 1) });

		createSetting('c2RunnerPortal',
			function () { return (cinf() + ' Runner Portal') },
			function () {
				var description = "<p>Automatically abandon challenge and portal when this zone is reached.</p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> Desired challenge end goal</p>";
				return description;
			}, 'value', -1, null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse) && getPageSetting('c2RunnerMode', currSettingUniverse) === 0) });
		createSetting('c2RunnerPercent',
			function () { return (cinf() + ' Runner %') },
			function () {
				var description = "<p>The percent threshhold you want " + cinf() + "s to be over.</p>";
				description += "<p>Will only run " + cinf() + "s with a HZE% below this settings value.</p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> 85</p>";
				return description;
			}, 'value', 0, null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse) && getPageSetting('c2RunnerMode', currSettingUniverse) === 0) });
		createSetting('c2Fused',
			function () { return ('Fused ' + cinf() + 's') },
			function () {
				var description = "<p>Will allow " + cinf() + " runner to do fused versions of the " + cinf() + "'s rather than normal versions to reduce time spent running " + cinf() + "s.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse)) });

		//Balance
		createSetting('balance',
			function () { return ('Balance') },
			function () {
				var description = "<p>Enable this if you want to use Balance destacking features.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 40) });
		createSetting('balanceZone',
			function () { return ('B: Zone') },
			function () {
				var description = "<p>The zone you would like to start destacking from.</p>";
				return description;
			}, 'value', [6], null, 'C2', [1],
			function () { return (getPageSetting('balance', currSettingUniverse) && autoTrimpSettings.balance.require()) });
		createSetting('balanceStacks',
			function () { return ('B: Stacks') },
			function () {
				var description = "<p>The amount of stack you have to reach before clearing them.</p>";
				description += "<p><b>Recommended:</b> 20</p>";
				return description;
			}, 'value', -1, null, 'C2', [1],
			function () { return (getPageSetting('balance', currSettingUniverse) && autoTrimpSettings.balance.require()) });
		createSetting('balanceImprobDestack',
			function () { return ('B: Improbability Destack') },
			function () {
				var description = "<p>Enable this to always fully destack when fighting Improbabilities after you reach your specified destacking zone.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1],
			function () { return (getPageSetting('balance', currSettingUniverse) && autoTrimpSettings.balance.require()) });

		//Mapology
		createSetting('mapology',
			function () { return ('Mapology') },
			function () {
				var description = "<p>Enabling this will disable all farming with the exception of Prestige Climb, Prestige Raiding, BW Raiding & Void Maps. Any Raiding settings will climb until the prestige selected in <b>M: Prestige</b> has been obtained rather than going for the settings targetted prestige.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'C2', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 150) });
		createSetting('mapologyPrestige',
			function () { return ('M: Prestige') },
			function () {
				var description = "<p>When running any prestige farming settings this will override the targetted prestige with the prestige selected here.</p>";
				description += "<p><b>Recommended:</b> Bootboost</p>";
				return description;
			}, 'dropdown', 'Bootboost', ['Off', 'Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'], 'C2', [1],
			function () { return (getPageSetting('mapology', currSettingUniverse) && autoTrimpSettings.mapology.require()) });

		//Unbalance
		createSetting('unbalance',
			function () { return ('Unbalance') },
			function () {
				var description = "<p>Enable this if you want to use Unbalance destacking features.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 35) });
		createSetting('unbalanceZone',
			function () { return ('U: Zone') },
			function () {
				var description = "<p>The zone you would like to start destacking from.</p>";
				return description;
			}, 'value', [6], null, 'C2', [2],
			function () { return (getPageSetting('unbalance', currSettingUniverse) && autoTrimpSettings.unbalance.require()) });
		createSetting('unbalanceStacks',
			function () { return ('U: Stacks') },
			function () {
				var description = "<p>The amount of stack you have to reach before clearing them.</p>";
				description += "<p><b>Recommended:</b> 20</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('unbalance', currSettingUniverse) && autoTrimpSettings.unbalance.require()) });
		createSetting('unbalanceImprobDestack',
			function () { return ('U: Improbability Destack') },
			function () {
				var description = "<p>Enable this to always fully destack when fighting Improbabilities after you reach your specified destacking zone.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (getPageSetting('unbalance', currSettingUniverse) && autoTrimpSettings.unbalance.require()) });

		//Trappapalooza
		createSetting('trappapalooza',
			function () { return ('Trappapalooza') },
			function () {
				var description = "<p>Enable this to setup Trappapalooza coord holding features.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 60) });
		createSetting('trappapaloozaCoords',
			function () { return ('T: Coords') },
			function () {
				var description = "<p>The zone you would like to stop buying additional coordinations from.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('trappapalooza', currSettingUniverse) && autoTrimpSettings.trappapalooza.require()) });

		//Wither
		createSetting('wither',
			function () { return ('Wither') },
			function () {
				var description = "<p>Enable this to force farming until you can 4 shot your current world cell on Wither.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 70) });

		//Quest
		createSetting('quest',
			function () { return ('Quest') },
			function () {
				var description = "<p>Enable this if you want to automate quest completion when running Quest.</p>";
				description += "<p><b>Will only function properly with AutoMaps enabled.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 85) });
		createSetting('questSmithyZone',
			function () { return ('Q: Smithy Zone') },
			function () {
				var description = "<p>Will calculate the smithies required for Quests based on this settings input and purchase spare ones if possible.</p>";
				description += "<p><b>Will assume zone 85 when running the regular version of Quest.</b></p>";
				description += "<p><b>Will disable the Smithy Farm setting whilst your world zone is below this value.</b></p>";
				description += "<p><b>Recommended:</b> Your desired end zone for Quest</p>";
				return description;
			}, 'value', 999, null, 'C2', [2],
			function () { return (getPageSetting('quest', currSettingUniverse) && autoTrimpSettings.quest.require()) });
		createSetting('questSmithyMaps',
			function () { return ('Q: Smithy Maps') },
			function () {
				var description = "<p>The maximum amount of maps you'd like to run to do a Smithy quest.</p>";
				description += "<p><b>Will potentially skip Smithy quests if this value is too low!</b></p>";
				description += "<p><b>Recommended:</b> 100</p>";
				return description;
			}, 'value', 100, null, 'C2', [2],
			function () { return (getPageSetting('quest', currSettingUniverse) && autoTrimpSettings.quest.require()) });

		//Mayhem
		createSetting('mayhem',
			function () { return ('Mayhem') },
			function () {
				var description = "<p>Enable this if you want to automate destacking and other features when running Mayhem.</p>";
				description += "<p><b>Will only function properly with AutoMaps enabled.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () {
				return (((!getPageSetting('c2disableFinished') || game.global.mayhemCompletions < 25) && game.stats.highestRadLevel.valueTotal() >= 100) || challengeActive('Mayhem'))
			});
		createSetting('mayhemDestack',
			function () { return ('M: HD Ratio') },
			function () {
				var description = "<p>What HD ratio cut-off to use when farming for the Improbability. If this setting is 100, the script will destack until you can kill the Improbability in 100 average hits or there are no Mayhem stacks remaining to clear.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse) && autoTrimpSettings.mayhem.require()) });
		createSetting('mayhemZone',
			function () { return ('M: Zone') },
			function () {
				var description = "<p>The zone you'd like to start destacking from, can be used in conjunction with <b>M: HD Ratio</b> but will clear stacks until 0 are remaining regardless of the value set in <b>M: HD Ratio</b>.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse) && autoTrimpSettings.mayhem.require()) });
		createSetting('mayhemMapIncrease',
			function () { return ('M: Map Increase') },
			function () {
				var description = "<p>Increases the minimum map level of Mayhem farming by this value.</p>";
				description += "<p><b>Negative values will be automatically set to 0.</b></p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse) && autoTrimpSettings.mayhem.require()) });
		createSetting('mayhemMP',
			function () { return ('M: Melting Point') },
			function () {
				var description = "<p>The amount of smithies you'd like to run Melting Point at during Mayhem.</p>";
				description += "<p><b>THIS OVERRIDES UNIQUE MAP SETTINGS INPUTS WHEN SET ABOVE 0</b></p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse) && autoTrimpSettings.mayhem.require()) });
		createSetting('mayhemSwapZone',
			function () { return ('M: Heirloom Swap Zone') },
			function () {
				var description = "<p>The zone you'd like to swap to your afterpush shield on Mayhem.</p>";
				description += "<p><b>THIS OVERRIDES C3 HEIRLOOM SWAP SETTING INPUT WHEN SET ABOVE 0</b></p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse) && autoTrimpSettings.mayhem.require()) });

		//Storm
		createSetting('storm',
			function () { return ('Storm') },
			function () {
				var description = "<p>Enable this if you want to use Storm destacking features.</p>";
				description += "<p><b>Will only function properly with AutoMaps enabled.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 105) });
		createSetting('stormZone',
			function () { return ('S: Zone') },
			function () {
				var description = "<p>From which zone destacking should be considered.</p>";
				description += "<p>Must be used in conjunction with <b>S: Stacks</b></p>";
				description += "<p><b>Recommended:</b> 6</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('storm', currSettingUniverse) && autoTrimpSettings.storm.require()) });
		createSetting('stormStacks',
			function () { return ('S: Stacks') },
			function () {
				var description = "<p>Minimal amount of stacks to reach before starting destacking</p>";
				description += "<p>If set to 0 or -1 it will disable destacking.</p>";
				description += "<p><b>WILL CLEAR TO 0 STACKS WHEN IT STARTS RUNNING.</b></p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			},
			'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('storm', currSettingUniverse) && autoTrimpSettings.storm.require()) });

		//Pandemonium
		createSetting('pandemonium',
			function () { return ('Pandemonium') },
			function () {
				var description = "<p>Enable this if you want to automate destacking and other features when running Pandemonium.</p>";
				description += "<p><b>Will only function properly with AutoMaps enabled.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (((!getPageSetting('c2disableFinished') || game.global.pandCompletions < 25) && game.stats.highestRadLevel.valueTotal() >= 150) || challengeActive('Pandemonium')) });

		createSetting('pandemoniumDestack',
			function () { return ('P: HD Ratio') },
			function () {
				var description = "<p>What HD ratio cut-off to use when farming for the Improbability. If this setting is 100, the script will destack until you can kill the Improbability in 100 average hits or there are no Pademonium stacks remaining to clear.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 10, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require()) });

		createSetting('pandemoniumZone',
			function () { return ('P: Destack Zone') },
			function () {
				var description = "<p>The zone you'd like to start destacking from, can be used in conjunction with <b>P: HD Ratio</b> but will clear stacks until 0 are remaining regardless of the value set in <b>P: HD Ratio</b>.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require()) });

		createSetting('pandemoniumAE',
			function () { return (['P: AutoEquip Off', 'P: AutoEquip', 'P AE: LMC', 'P AE: Huge Cache']) },
			function () {
				var description = "<p>This setting provides some equipment farming possibilites to help speedup runs.</p>";
				description += "<p><b>Will override equipment purchasing settings when enabled.</b></p>";
				description += "<p><b>Metal farming will only happen if pandemonium stacks are at 0.</b></p>";
				description += "<p><b>P: AutoEquip Off</b><br>Disables this setting.</p>";
				description += "<p><b>P: AutoEquip</b><br>Will automatically purchase equipment during Pandemonium regardless of efficiency.</p>";
				description += "<p><b>P AE: LMC</b><br>Provides settings to run maps if the cost of equipment levels is less than a single large metal cache. Overrides worker settings to ensure that you farm as much metal as possible.</p>";
				description += "<p><b>P AE: Huge Cache</b><br>Uses the same settings as <b>P: AE LMC</b> but changes to if an equip will cost less than a single huge cache that procs metal. Will automatically switch caches between LMC and HC depending on the cost of equipment to ensure a fast farming speed</p>";

				description += "<p><b>Recommended:</b> P AE: LMC</p>";
				return description;
			}, 'multitoggle', 0, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require()) });

		createSetting('pandemoniumAEZone',
			function () { return ('P AE: Zone') },
			function () {
				var description = "<p>The zone you would like to start farming LMC/HC maps from.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require() && getPageSetting('pandemoniumAE', currSettingUniverse) > 1) });

		createSetting('pandemoniumStaff',
			function () { return ('P: Staff') },
			function () {
				var description = "<p>The name of the staff you would like to equip while Pandemonium does equipment farming.</p>";
				description += "<p><b>Should ideally be a full metal efficiency staff.</b></p>";
				return description;
			}, 'textValue', 'undefined', null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require() && getPageSetting('pandemoniumAE', currSettingUniverse) > 1) });

		createSetting('pandemoniumMP',
			function () { return ('P: Melting Point') },
			function () {
				var description = "<p>The amount of smithies you'd like to run Melting Point at during Pandemonium.</p>";
				description += "<p><b>THIS OVERRIDES UNIQUE MAP SETTINGS INPUTS WHEN SET ABOVE 0</b></p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require()) });
		createSetting('pandemoniumSwapZone',
			function () { return ('P: Heirloom Swap Zone') },
			function () {
				var description = "<p>The zone you'd like to swap to your afterpush shield on Pandemonium.</p>";
				description += "<p><b>THIS OVERRIDES C3 HEIRLOOM SWAP SETTING INPUT WHEN SET ABOVE 0</b></p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require()) });

		//Glass
		createSetting('glass',
			function () { return ('Glass') },
			function () {
				var description = "<p>Enable this if you want to use Glass destacking & farming features.</p>";
				description += "<p>Will farm for damage if you can't clear stacks in a world level or above map. Additionally when at c100 of a zone it checks if you can clear world level maps on the next zone and if not farms damage until you are able to.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 175) });
		createSetting('glassStacks',
			function () { return ('G: Stacks') },
			function () {
				var description = "<p>The amount of stack you have to reach before clearing them.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('glass', currSettingUniverse) && autoTrimpSettings.glass.require()) });

		//Desolation
		createSetting('desolation',
			function () { return ('Desolation') },
			function () {
				var description = "<p>Enable this if you want to automate destacking and other features when running Desolation.</p>";
				description += "<p><b>Will only function properly with AutoMaps enabled.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (((!getPageSetting('c2disableFinished') || game.global.desoCompletions < 25) && game.stats.highestRadLevel.valueTotal() >= 200) || challengeActive('Desolation')) });
		createSetting('desolationDestack',
			function () { return ('D: HD Ratio') },
			function () {
				var description = "<p>At what HD ratio destacking should be considered.</p>";
				description += "<p>Must be used in conjunction with <b>D: Stacks</b></p>";
				description += "<p><b>Recommended:</b> 0.0001</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });
		createSetting('desolationZone',
			function () { return ('D: Zone') },
			function () {
				var description = "<p>From which zone HD ratio destacking should be considered.</p>";
				description += "<p>Must be used in conjunction with <b>D: Stacks</b></p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });
		createSetting('desolationStacks',
			function () { return ('D: Stacks') },
			function () {
				var description = "<p>Minimal amount of stacks to reach before starting destacking</p>";
				description += "<p>If set to 0 or -1 it will destack at 300 stacks.</p>";
				description += "<p><b>WILL CLEAR TO 0 STACKS WHEN IT STARTS RUNNING.</b></p>";
				description += "<p><b>Recommended:</b> 300</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });
		createSetting('desolationOnlyDestackZone',
			function () { return ('D: Destack Only From') },
			function () {
				var description = "<p>From which zone only destacking should be considered. This will stop it caring about farming for metal to improve gear.</p>";
				description += "<p>Purchases the highest level of map that you can afford and survive to reduce chilled stacks faster.</p>";
				description += "<p><b>Recommended:</b> 20 below Desolation end zone</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });
		createSetting('desolationMP',
			function () { return ('D: Melting Point') },
			function () {
				var description = "<p>The amount of smithies you'd like to run Melting Point at during Desolation.</p>";
				description += "<p><b>THIS OVERRIDES UNIQUE MAP SETTINGS INPUTS WHEN SET ABOVE 0</b></p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });
		createSetting('desolationSwapZone',
			function () { return ('D: Heirloom Swap') },
			function () {
				var description = "<p>The zone you'd like to swap to your afterpush shield on Desolation.</p>";
				description += "<p><b>THIS OVERRIDES C3 HEIRLOOM SWAP SETTING INPUT WHEN SET ABOVE 0</b></p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });

		//Smithless
		createSetting('smithless',
			function () { return ('Smithless') },
			function () {
				var description = "<p>Enable this if you want to automate farming to obtain maximum smithy stacks against Ubersmiths.</p>";
				description += "<p>It will identify breakpoints that can be reached with max tenacity & max map bonus to figure out how many stacks you are able to obtain from an Ubersmith and farm till it reachs that point if it's attainable.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 201) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Challenges -- Descriptions done! Need to do Arch but idk what to do with it
	const displayChallenges = true;
	if (displayChallenges) {
		//Helium
		//Decay
		createSetting('decay',
			function () { return ('Decay') },
			function () {
				var description = "<p>Enable this if you want to use Decay features.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Challenges', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 55) });
		createSetting('decayStacksToPush',
			function () { return ('D: Stacks to Push') },
			function () {
				var description = "<p>Will ignore maps and push to end the zone if we go above this amount of stacks.</p>";
				description += "<p>If set to 0 or -1 it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 150</p>";
				return description;
			}, 'value', -1, null, 'Challenges', [1],
			function () { return (autoTrimpSettings.decay.enabled) });
		createSetting('decayStacksToAbandon',
			function () { return ('D: Stacks to Abandon') },
			function () {
				var description = "<p>Will abandon the challenge if we go above this amount of stacks.</p>";
				description += "<p>If set to 0 or -1 it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 400</p>";
				return description;
			}, 'value', -1, null, 'Challenges', [1],
			function () { return (autoTrimpSettings.decay.enabled) });

		//Life
		createSetting('life',
			function () { return ('Life') },
			function () {
				var description = "<p>Enable this if you want to use Life features.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Challenges', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 110) });
		createSetting('lifeZone',
			function () { return ('L: Zone') },
			function () {
				var description = "<p>Will take you to the map chamber when the current enemy is Living and when you are at or below this zone.</p>";
				description += "<p>If set to 0 or -1 it will disable this setting.</p>";
				description += "<p><b>Must be used in conjunction with L: Stacks</b></p>";
				description += "<p><b>Recommended:</b> 100</p>";
				return description;
			}, 'value', -1, null, 'Challenges', [1],
			function () { return (autoTrimpSettings.life.enabled) });
		createSetting('lifeStacks',
			function () { return ('L: Stacks') },
			function () {
				var description = "<p>Will take you to the map chamber when the current enemy is Living and when you are at or below this stack count.</p>";
				description += "<p>If set to 0 or -1 it will disable this setting.</p>";
				description += "<p><b>Must be used in conjunction with L: Zone</b></p>";
				description += "<p><b>Recommended:</b> 100</p>";
			}, 'value', -1, null, 'Challenges', [1],
			function () { return (autoTrimpSettings.life.enabled) });

		//Experience
		createSetting('experience',
			function () { return ('Experience') },
			function () {
				var description = "<p>Enable this if you want to use Experience wonder farming features.</p>";
				description += "<p>This setting is dependant on using <b>Bionic Raiding</b> in conjunction with it if you want your ending Bionic Wonderland to be higher than 605. If you do you'll need to raid past bw 605 before z601.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'Challenges', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 600) });
		createSetting('experienceStartZone',
			function () { return ('E: Start Zone') },
			function () {
				var description = "<p>The zone you would like to start mapping for wonders at.</p>";
				description += "<p>If set below 300 it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 500 to start and lower over time</p>";
				return description;
			},
			'value', -1, null, 'Challenges', [1],
			function () { return (autoTrimpSettings.experience.enabled) });
		createSetting('experienceEndZone',
			function () { return ('E: End Zone') },
			function () {
				var description = "<p>'Will run the Bionic Wonderland map level specified in <b>E: End BW</b> at this zone.</p>";
				description += "<p>If set below 601 it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 605 to start and increase over time</p>";
				return description;
			}, 'value', -1, null, 'Challenges', [1],
			function () { return (autoTrimpSettings.experience.enabled) });
		createSetting('experienceEndBW',
			function () { return ('E: End BW') },
			function () {
				var description = "<p>'Will finish the challenge with this Bionic Wonderland level once reaching the end zone specified in <b>E: End Zone</b>.</p>";
				description += "<p><b>If the specified BW is not available, it will run one closest to the setting.</b></p>";
				description += "<p><b>Recommended:</b> 605 to start and increase over time</p>";
			}, 'value', -1, null, 'Challenges', [1],
			function () { return (autoTrimpSettings.experience.enabled) });

		//Archaeology -- I don't know what to do with these. Think this needs to be reworked.
		createSetting('archaeology',
			function () { return ('Archaeology') },
			function () {
				var description = "<p>Enable this if you want to use Archaeology relic switching features.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 90) });
		createSetting('archaeologyString1',
			function () { return ('First String') },
			function () { return ('Put the zone you want to stop using this string and start using the second string (Make sure the second string has a value) at the start. I.e: 70,10a,10e ') },
			'textValue', 'undefined', null, 'Challenges', [2],
			function () { return (autoTrimpSettings.archaeology.enabledU2) });
		createSetting('archaeologyString2',
			function () { return ('Second String') },
			function () { return ('Put the zone you want to stop using this string and start using the third string (Make sure the third string has a value) at the start. I.e: 94,10a,10e ') },
			'textValue', 'undefined', null, 'Challenges', [2],
			function () { return (autoTrimpSettings.archaeology.enabledU2) });
		createSetting('archaeologyString3',
			function () { return ('Third String') },
			function () { return ('Make sure this is just your Archaeology string and nothing else. I.e: 10a,10e ') },
			'textValue', 'undefined', null, 'Challenges', [2],
			function () { return (autoTrimpSettings.archaeology.enabledU2) });

		//Quagmire
		createSetting('quagmireSettings',
			function () { return ('Quagmire Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like farming to be done during Quagmire.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			}, 'mazArray', [], 'MAZLookalike("Quagmire Farm", "Quagmire", "MAZ")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 70) });
		createSetting('quagmireDefaultSettings',
			function () { return ('Quagmire Default Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Challenges', [2]);

		//Insanity
		createSetting('insanitySettings',
			function () { return ('Insanity Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like farming to be done during Insanity.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			}, 'mazArray', [], 'MAZLookalike("Insanity Farm", "Insanity", "MAZ")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 110) });
		createSetting('insanityDefaultSettings',
			function () { return ('Insanity Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Challenges', [2]);

		//Alchemy
		createSetting('alchemySettings',
			function () { return ('Alchemy Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like farming to be done during Alchemy.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			}, 'mazArray', [], 'MAZLookalike("Alchemy Farm", "Alchemy", "MAZ")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 155) });
		createSetting('alchemyDefaultSettings',
			function () { return ('Alchemy Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Challenges', [2]);

		//Hypothermia
		createSetting('hypothermiaSettings',
			function () { return ('Hypothermia Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like farming to be done during Hypothermia.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			},
			'mazArray', [], 'MAZLookalike("Hypothermia Farm", "Hypothermia", "MAZ")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 175) });
		createSetting('hypothermiaDefaultSettings',
			function () { return ('Hypothermia Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Challenges', [2]);
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Buildings -- Descriptions done!
	const displayBuildings = true;
	if (displayBuildings) {
		createSetting('buildingsType',
			function () { return ('AutoBuildings') },
			function () {
				//Initial button description
				var description = "Click the left side of the button to toggle this on or off.";
				//Cogwheel info
				description += "<p>Click the cog icon on the right side of this button to tell your Foremen what you want and when you want it.</p>";
				description += "For more detailed information for this setting check out its Help section.";
				return description;
			}, 'boolean', 'true', null, 'Legacy', [1]);
		createSetting('buildingSettingsArray',
			function () { return ('Building Settings') },
			function () { return ('Click to adjust settings.') },
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
			Nursery: { enabled: true, percent: 100, buyMax: 0, fromZ: 0 },
			Smithy: { enabled: true, percent: 100, buyMax: 0 },
			Tribute: { enabled: true, percent: 100, buyMax: 0 },
			Laboratory: { enabled: true, percent: 100, buyMax: 0 },
			SafeGateway: { enabled: true, mapCount: 1, zone: 0 }
		}, null, 'Legacy', [1]);

		//Helium
		createSetting('warpstation',
			function () { return ('Warpstations') },
			function () {
				var description = "<p>Enable this to allow Warpstation purchasing.</p>";
				description += "<p><b>Will only function properly with AT AutoStructure enabled.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Buildings', [1]);
		createSetting('firstGigastation',
			function () { return ('First Gigastation') },
			function () {
				var description = "<p>The amount of warpstations to purchase before your first gigastation.</p>";
				description += "<p><b>Recommended:</b> 20</p>";
				return description;
			}, 'value', 20, null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled) });
		createSetting('deltaGigastation',
			function () { return ('Delta Gigastation') },
			function () {
				var description = "<p>How many extra warpstations to buy for each gigastation.</p>";
				description += "<pSupports decimal values. For example 2.5 will buy +2/+3/+2/+3...</p>";
				description += "<p><b>YOU MUST HAVE BUY UPGRADES ENABLED!</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'value', 2, null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled) }
		);
		createSetting('autoGigas',
			function () { return ('Auto Gigas') },
			function () {
				var description = "<p>If enabled, AT will buy its first Gigastation if: <br>A) Has more than 2 Warps & <br>B) Can\'t afford more Coords & <br>C) (Only if Custom Delta Factor > 20) Lacking Health or Damage & <br>D) (Only if Custom Delta Factor > 20) Has run at least 1 map stack.</p>";
				description += "<p>Then, it'll calculate the delta based on your Custom Delta Factor and your Auto Portal/VM zone (whichever is higher), or Daily Auto Portal/VM zone, or " + cinf() + " zone, or Custom AutoGiga Zone.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', 'true', null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled) });
		createSetting('autoGigaTargetZone',
			function () { return ('Custom Target Zone') },
			function () {
				var description = "<p>The zone to be used as a the target zone when calculating the Auto Gigas delta.</p>";
				description += "<pValues below 60 will be discarded.</p>";
				description += "<p><b>Recommended:</b> Current challenge end zone</p>";
				return description;
			}, 'value', -1, null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled && autoTrimpSettings.autoGigas.enabled) });
		createSetting('autGigaDeltaFactor',
			function () { return ('Custom Delta Factor') },
			function () {
				var description = "<p>This setting is used to calculate a better Delta. Think of this setting as how long your target zone takes to complete divided by the zone you bought your first giga in.</p>";
				description += "<pBasically, a higher number means a higher delta.</p>";
				description += "<pValues below 1 will default to 10.</p>";
				description += "<pValues below 1 will default to 10.</p>";
				description += "<p><b>Recommended:</b> 1-2 for very quick runs. 5-10 for regular runs where you slow down at the end. 20-100+ for very pushy runs</p>";
				return description;
			}, 'value', -1, null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled && autoTrimpSettings.autoGigas.enabled) });

		createSetting('advancedNurseries',
			function () { return ('Advanced Nurseries') },
			function () {
				var description = "<p>Will only buy nurseries if you need more health, don't need more damage (because then you'd have to farm anyway), AND you have more map stacks than the <b>Map Bonus Health</b> setting, which becomes a very important setting.</p>"
				description += "<p>Requires Nurseries to be setup in the AT AutoStructure setting and will only buy Nurseries if past the 'From' input. Overrides the 'Up To' input and allows you to set 0 without it buying as many as possible.</p>"
				description += "<p><b>Recommended:</b> On. Nurseries set to 'Up To: 0' & 'From: 230'</p>";
				return description;
			},
			'boolean', false, null, 'Buildings', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 230) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Jobs -- Descriptions done!
	const displayJobs = true;
	if (displayJobs) {
		createSetting('jobType',
			function () { return (['Don\'t Buy Jobs', 'Auto Ratios', 'Manual Ratios']) },
			function () {
				//Initial button description
				var description = "Click the left side of the button to toggle between the AutoJobs settings. Each of them will adjust the 3 primary resource jobs but you'll have to manually set the rest by clicking the cog icon on the right side of this button.";
				//Manual Ratios
				description += '<p><b>Manual Ratios</b><br>Buys jobs for your trimps according to the ratios set in the cogwheel popup.</p>';
				//Auto Ratios
				description += '<p><b>Auto Ratios</b><br>Automatically adjusts the 3 primary resource job worker ratios based on current game progress. For more detailed information on this check out its Help section for this setting.</p>';
				//Override info
				description += "<p><b>Map setting job ratios always override both 'Auto Ratios' & 'Manual Ratios'.</b></p>";
				return description;
			}, 'multitoggle', 1, null, 'Legacy', [1]);
		createSetting('jobSettingsArray',
			function () { return ('Job Settings') },
			function () { return ('Click to adjust settings.') },
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
		}, null, 'Legacy', [1]);
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Equipment -- Descriptions done!
	const displayEquipment = true;
	if (displayEquipment) {
		createSetting('equipOn',
			function () { return ('AutoEquip') },
			function () {
				var description = "<p>Master switch for whether the script will do any form of equipment purchasing.</p>";
				description += "<p>There's settings in here to identify when to purchase gear and if it should purchase prestiges.<br></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, "Equipment", [1, 2]);
		createSetting('equipCutOff',
			function () { return ('AE: HD Cut-off') },
			function () {
				var description = "<p>If your HD (enemyHealth:trimpDamage) Ratio is below this value it will override your <b>AE: Percent</b> input and set your spending percentage to 100% of resources available.</p>";
				description += "<p>Goal with this setting is to have it purchase gear whenever you slow down in world.<br></p>";
				description += "<p><b>Your HD Ratio can be seen in the Auto Maps status tooltip.</b></p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', 1, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipAmount',
			function () { return ('AE: Amount') },
			function () {
				var description = "<p>How many levels of equipment you'd like to be purchased at once.</p>";
				description += "<p>It will already identify how many you can buy the percentage set in <b>AE: Percent</b> so only useful in very rare scenarios.<br></p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', 1, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipCapAttack',
			function () { return ('AE: Weapon Cap') },
			function () {
				var description = "<p>The value you want weapon equipment to stop being purchased at.</p>";
				description += "<p><b>Recommended:</b> 250</p>";
				return description;
			}, 'value', 250, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipCapHealth',
			function () { return ('AE: Armour Cap') },
			function () {
				var description = "<p>The value you want armor equipment to stop being purchased at.</p>";
				description += "<p><b>Recommended:</b> 250</p>";
				return description;
			}, 'value', 50, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipZone',
			function () { return ('AE: Zone') },
			function () {
				var description = "<p>What zone to stop caring about what percentage of resources you're spending and buy as many prestiges and equipment as possible. It will override your <b>AE: Percent</b> input and set your spending percentage to 100% of resources available.</p>";
				description += "<p>Can input multiple zones such as <b>200,231,251</b>, doing this will spend all your resources purchasing gear and prestiges on each zone input but will only buy them until the end of the run after the last input.</p>";
				description += "<p><b>Recommended:</b> 999</p>";
				return description;
			}, 'multiValue', -1, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipPercent',
			function () { return ('AE: Percent') },
			function () {
				var description = "<p>What percent of resources you'd like to spend on equipment.</p>";
				description += "<p>Both <b>AE: HD Cut-off</b> and <AE: Zone</b> will override this input when they are active and set it to 100.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 1, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipPortal',
			function () { return ('AE: Portal') },
			function () {
				var description = "<p>Will ensure Auto Equip is enabled after portalling.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, "Equipment", [1, 2]);
		createSetting('equip2',
			function () { return ('AE: 2') },
			function () {
				var description = "<p>Will also purchase a second level of weapons and armor regardless of efficiency.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipPrestige',
			function () { return (['AE: Prestige Off', 'AE: Prestige', 'AE: Always Prestige']) },
			function () {
				var trimple = currSettingUniverse === 1 ? "<b>Trimple of Doom</b>" : "<b>Atlantrimp</b>";
				var description = "<p>Will control how equipment levels & prestiges are purchased.</p>";
				description += "<p><b>AE: Prestige Off</b><br>Will only purchase prestiges when you have 6 or more levels in your that piece of equipment.</p>";
				description += "<p><b>AE: Prestige</b><br>Overrides the need for levels in your current equips before a prestige will be purchased. Will purchase gear levels again when you have run " + trimple + ".";
				description += "<br><b>If " + trimple + " has been run it will buy any prestiges that cost less than 8% of your current resources then spend your remaining resources on equipment levels.</b></p>"
				description += "<p><b>AE: Always Prestige</b><br>Always buys prestiges of weapons and armor regardless of efficiency. Will override AE: Zone setting for an equip if it has a prestige available.</p>";
				description += "<p><b>Recommended:</b> AE: Prestige</p>";
				return description;
			}, 'multitoggle', 0, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipEfficientEquipDisplay',
			function () { return ('AE: Highlight Equips') },
			function () {
				var description = "<p>Will highlight the most efficient equipment or prestige to buy.</p>";
				description += "<p><b>This setting will disable the default game setting.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, "Equipment", [1, 2]);
		createSetting('equipShieldBlock',
			function () { return ('Buy Shield Block') },
			function () {
				var description = "<p>Will allow the purchase of the shield block upgrade.</p>";
				description += "<p><b>If you are progressing past zone 50, you probably don\'t want this.</b></p>";
				description += "<p><b>Recommended:</b> On until you can reach z50</p>";
				return description;
			}, 'boolean', false, null, "Equipment", [1],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipNoShields',
			function () { return ('AE: No Shields') },
			function () {
				var description = "<p>Will stop the purchase of Shield equipment levels & prestiges.</p>";
				description += "<p><b>This is only ever useful in very niche scenarios.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, "Equipment", [2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });

		createSetting('Prestige',
			function () { return ('Prestige') },
			function () {
				var description = "<p>Acquire prestiges through the selected item (inclusive) as soon as they are available in maps.</p>";
				description += "<p><b>Forces equip first mode.<br>Auto Maps must be enabled.</b></p>";
				description += "<p><b>DISABLED UNTIL EXPLORERS ARE UNLOCKED</b></p>";
				description += "<p>This is important for speed climbing while climbing through the world. If you find the script getting stuck somewhere, particularly where you should easily be able to kill stuff, setting this to an option lower down in the list will help ensure you are more powerful at all times, but will spend more time acquiring the prestiges in maps.</p>";
				description += "<p><b>Recommended:</b> Dagadder</p>";
				return description;
			},
			'dropdown', 'Off', ['Off', 'Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'], "Equipment", [1, 2]);
		createSetting('ForcePresZ',
			function () { return ('Force Prestige Z') },
			function () {
				var description = "<p>On and after this zone is reached, always try to prestige for everything immediately, ignoring Dynamic Prestige settings and overriding that of Linear Prestige. </p>";
				description += "<p><b>Prestige Skip mode will exit this.</b></p>";
				description += "<p><b>Disable with -1.</b></p>";
				description += "<p><b>Recommended:</b> The zone you start heavily slowing down</p>";
				return description;
			}, 'value', -1, null, "Equipment", [1, 2]);
		createSetting('PrestigeSkip1_2',
			function () { return (['Prestige Skip Off', 'Prestige Skip 1 & 2', 'Prestige Skip 1', 'Prestige Skip 2']) },
			function () {
				var description = "<p>Master switch for whether the script will do any form of mapping.</p>";

				description += "<p><b>Prestige Skip Off</b><br>Disables this setting.</p>";

				description += "<p><b>Prestige Skip 1</b><br>If there are more than 2 Unbought Prestiges (besides Shield), ie: sitting in your upgrades window but you cant afford them, Auto Maps will not enter Prestige Mode, and/or will exit from it.</p>";

				description += "<p><b>Prestige Skip 2</b><br>If there are 2 or fewer <b>Unobtained Weapon Prestiges in maps</b>, ie: there are less than 2 types to run for, AutoMaps will not enter Prestige Mode, and/or will exit from it. For users who tends to not need the last few prestiges due to resource gain not keeping up.</p>";
				description += "<p><b>Recommended:</b> Prestige Skip Off</p>";
				return description;
			}, 'multitoggle', 0, null, "Equipment", [1, 2]);
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Maps -- Descriptions done!
	const displayMaps = true;
	if (displayMaps) {
		//Helium
		createSetting('autoMaps',
			function () { return (["Auto Maps Off", "Auto Maps On", "Auto Maps No Unique"]) },
			function (noUnique) {
				var description = "<p>Master switch for whether the script will do any form of mapping.</p>";
				description += "<p><b>The mapping that is done is decided by how you setup any mapping related settings.</b><br></p>";
				description += "<p><b>Auto Maps Off</b><br>Disables this setting.</p>";
				description += "<p><b>Auto Maps On</b><br>Enables mapping and will run all types of maps.</p>";
				if (!noUnique) description += "<p><b>Auto Maps No Unique</b><br>The same as <b>Auto Maps On</b> but won't run unique maps such as <b>The Block</b> or <b>Dimension of Rage</b>.</p>";
				description += "<p><b>Recommended:</b> Auto Maps On</p>";
				return description;
			},
			'multitoggle', 0, null, "Maps", [1, 2]);
		createSetting('autoMapsPortal',
			function () { return ('Auto Maps Portal') },
			function () {
				var description = "<p>Will ensure Auto Maps is enabled after portalling.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Maps', [1, 2]);
		createSetting('onlyPerfectMaps',
			function () { return ('Perfect Maps') },
			function () {
				var description = "<p>When trying to map it will only create perfect maps.</p>";
				description += "<p><b>Be warned this may greatly decrease the map level that AT believes is efficient.</b></p>";
				description += "<p><b>Recommended:</b> Off unless at end game</p>";
				return description;
			}, 'boolean', false, null, 'Maps', [1, 2]);

		createSetting('hitsSurvived',
			function () { return ('Hits Survived') },
			function () {
				var description = "<p>Will farm until you can survive this amount of attacks.</p>";
				description += "<p><b>Your Hits Survived can be seen in the Auto Maps status tooltip.</b></p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
				if (currSettingUniverse === 1) description += "<p><b>Recommended:</b> 2 for earlygame, gradually increase the further you progress</p>";
				if (currSettingUniverse === 2) description += "<p><b>Recommended:</b> 2 for earlygame, gradually increase the further you progress.<br><b>DO NOT SET ABOVE 1 WHEN USING AUTO EQUALITY: ADVANCED</b></p>";
				return description;
			}, 'value', -1, null, "Maps", [1, 2]);

		createSetting('mapBonusHealth',
			function () { return ('Map Bonus Health') },
			function () {
				var description = "<p>Map Bonus stacks will be obtained to this amount when <b>Hits Survived</b> is below the threshold set.</p>";
				if (currSettingUniverse === 1) description += "<p>This is a very important setting to be used with <b>Advanced Nurseries</b> after Magma. Basically, if you are running out of nurseries too soon, increase this value, otherwise lower it.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 10, null, "Maps", [1, 2]);

		createSetting('mapBonusRatio',
			function () { return ('Map Bonus Ratio') },
			function () {
				var description = "<p>Map Bonus stacks will be obtained when above this HD (enemyHealth:trimpDamage) Ratio value.</p>";
				description += "<p><b>Your HD Ratio can be seen in the Auto Maps status tooltip.</b></p>";
				description += "<p><b>Recommended:</b> 4</p>";
				return description;
			}, 'value', 4, null, "Maps", [1, 2]);

		createSetting('mapBonusStacks',
			function () { return ('Map Bonus Stacks') },
			function () {
				var description = "<p>The map bonus limit that will be used when above your <b>Map Bonus Ratio</b> threshold.</p>"
				description += "<p>Settings to adjust the cache it will run and the job ratio that it uses can be found in the <b>Map Bonus</b> setting.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 10, null, "Maps", [1, 2]);

		createSetting('scryvoidmaps',
			function () { return ('VM Scryer') },
			function () {
				var description = "<p>Will override any stance settings and set your stance to Scryer during Void Maps if you have the Scryhard II talent.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Maps', [1]);

		//HD Farm
		createSetting('hdFarmSettings',
			function () { return ('HD Farm Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like HD (enemyHealth:trimpDamage) Ratio farming to be run.</p>";
				description += "<p><b>Your HD Ratio can be seen in the Auto Maps status tooltip.</b></p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			}, 'mazArray', [], 'MAZLookalike("HD Farm", "HDFarm", "MAZ")', 'Maps', [1, 2]);
		createSetting('hdFarmDefaultSettings',
			function () { return ('HD Farm: Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [1, 2]);

		createSetting('voidMapSettings',
			function () { return ('Void Map Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like Void Maps to be run.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			}, 'mazArray', [], 'MAZLookalike("Void Map", "VoidMap", "MAZ")', 'Maps', [1, 2]);
		createSetting('voidMapDefaultSettings',
			function () { return ('Void Map Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [1, 2]);

		//Bone Shrine (bone) 
		createSetting('boneShrineSettings',
			function () { return ('Bone Shrine Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like Bone Shrine charges to be used.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			}, 'mazArray', [], 'MAZLookalike("Bone Shrine", "BoneShrine", "MAZ")', 'Maps', [1, 2]);
		createSetting('boneShrineDefaultSettings',
			function () { return ('BS: Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [1, 2]);

		//Worshipper Farm 
		createSetting('worshipperFarmSettings',
			function () { return ('Worshipper Farm Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like Worshippers to be farmed.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			}, 'mazArray', [], 'MAZLookalike("Worshipper Farm", "WorshipperFarm", "MAZ")', 'Maps', [2],
			function () { return game.stats.highestRadLevel.valueTotal() >= 50 });
		createSetting('worshipperFarmDefaultSettings',
			function () { return ('WF: Default Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [2]);

		//Unique Maps
		createSetting('uniqueMapSettingsArray',
			function () { return ('Unique Map Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like Unique Maps to be run.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			}, 'mazArray', {
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

		//Map Bonus
		createSetting('mapBonusSettings',
			function () { return ('Map Bonus Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like map bonus stacks to be obtained.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			}, 'mazArray', [], 'MAZLookalike("Map Bonus", "MapBonus", "MAZ")', 'Maps', [1, 2]);
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
			function () {
				var description = "<p>Here you can select how and when you would like to farm a specific amount of maps.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			}, 'mazArray', [], 'MAZLookalike("Map Farm", "MapFarm", "MAZ")', 'Maps', [1, 2]);
		createSetting('mapFarmDefaultSettings',
			function () { return ('MF: Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [1, 2]);

		//Prestige Raiding
		createSetting('raidingSettings',
			function () { return ('Raiding Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like to raid maps for prestiges.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			}, 'mazArray', [], 'MAZLookalike("Raiding", "Raiding", "MAZ")', 'Maps', [1, 2]);
		createSetting('raidingDefaultSettings',
			function () { return ('Raiding: Default Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [1, 2]);

		//Bionic Raiding
		createSetting('bionicRaidingSettings',
			function () { return ('BW Raiding Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like to raid Bionic Wonderland maps for prestiges.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			}, 'mazArray', [], 'MAZLookalike("Bionic Raiding", "BionicRaiding", "MAZ")', 'Maps', [1]);
		createSetting('bionicRaidingDefaultSettings',
			function () { return ('Raiding: Default Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [1]);

		//Tribute Farming
		createSetting('tributeFarmSettings',
			function () { return ('Tribute Farm Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like Tributes & Meteorologists to be farmed.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			}, 'mazArray', [], 'MAZLookalike("Tribute Farm", "TributeFarm", "MAZ")', 'Maps', [2]);
		createSetting('tributeFarmDefaultSettings',
			function () { return ('TrF: Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [2]);

		//Smithy Farming
		createSetting('smithyFarmSettings',
			function () { return ('Smithy Farm Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like Smithies to be farmed.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			}, 'mazArray', [], 'MAZLookalike("Smithy Farm", "SmithyFarm", "MAZ")', 'Maps', [2]);
		createSetting('smithyFarmDefaultSettings',
			function () { return ('SF: Settings') },
			function () { return ('Contains arrays for this setting') },
			'mazDefaultArray', { active: false }, null, 'Maps', [2]);

	}

	//Spire -- Descriptions done!
	const displaySpire = true;
	if (displaySpire) {
		createSetting('IgnoreSpiresUntil',
			function () { return ('Ignore Spires Until') },
			function () {
				var description = "<p>Will disable all of the Spire features unless you're in a Spire at or above this value.</p>";
				description += "<p><b>This works based off Spire number rather than zone. So if you want to ignore Spires until Spire II at z300 then enter 2, Spire III at z400 would be 3 etc.</b></p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> Second to last Spire you reach on your runs.</p>";
				return description;
			}, 'value', -1, null, 'Spire', [1]);
		createSetting('MaxStacksForSpire',
			function () { return ('Max Map Bonus for Spire') },
			function () {
				var description = "<p>Will get max map bonus stacks when inside of active Spires.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Spire', [1]);
		createSetting('ExitSpireCell',
			function () { return ('Exit Spire After Cell') },
			function () {
				var description = "<p>Will exit out of active Spires upon clearing this cell.</p>";
				description += "<p><b>Works based off cell number so if you want it to exit after Row #4 then set to 40.</b></p>";
				description += "<p>Any health or damage calculations for the Spire will be based off this if set.</p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b>-1</p>";
				return description;
			}, 'value', -1, null, 'Spire', [1]);
		createSetting('PreSpireNurseries',
			function () { return ('Nurseries pre-Spire') },
			function () {
				var description = "<p>Set the number of <b>Nurseries</b> to build during active Spires.</p>";
				description += "<p><b>Will override any <b>Nursery</b> settings that you have setup in the <b>AT AutoStructure</b> setting.</b></p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'Spire', [1]);
		createSetting('hitsSurvivedSpire',
			function () { return ('Hits Survived') },
			function () {
				var description = "<p>Will farm until you can survive this amount of attacks while in active Spires.</p>";
				description += "<p><b>Your Hits Survived can be seen in the Auto Maps status tooltip.</b></p>";
				description += "<p><b>Will override the Hits Survived setting in the <b>Maps</b> tab.</b></p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
				if (currSettingUniverse === 1) description += "<p><b>Recommended:</b> 1.5</p>";
				return description;
			}, 'value', 0, null, 'Spire', [1]);
		createSetting('skipSpires',
			function () { return ('Skip Spires') },
			function () {
				var description = "<p>Will disable any form of mapping after your trimps have max map bonus stacks..</p>";
				if (currSettingUniverse === 1) description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Spire', [1]);

	}

	//----------------------------------------------------------------------------------------------------------------------

	//ATGA -- TO DO
	const displayATGA = true;
	if (displayATGA) {
		createSetting('ATGA2',
			function () { return ('Gene Assist') },
			function () { return ('<b>ATGA MASTER BUTTON</b><br>AT Geneticassist. Do not use vanilla GA, as it will conflict otherwise. May get fucky with super high values.') },
			'boolean', false, null, 'Jobs', [1]);
		createSetting('ATGA2gen',
			function () { return ('GA: Gene Assist %') },
			function () {
				var description = "<p>Gene Assist will only hire geneticists if they cost less than this value.</p>";
				description += "<p>If this setting is 1 it will only buy geneticists if they cost less than 1% of your food.</p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', 1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled) });
		createSetting('ATGA2timer',
			function () { return ('GA: Timer') },
			function () { return ('<b>ATGA Timer</b><br>This is the default time your ATGA will use.') },
			'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled) });

		//Zone Timers
		createSetting('zATGA2timer',
			function () { return ('GA: T: Before Z') },
			function () { return ('<b>ATGA Timer: Before Z</b><br>ATGA will use the value you define in GA: T: BZT before the zone you have defined in this setting, overwriting your default timer. Useful for Liq or whatever.') },
			'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
		createSetting('ztATGA2timer',
			function () { return ('GA: T: BZT') },
			function () { return ('<b>ATGA Timer: Before Z Timer</b><br>ATGA will use this value before the zone you have defined in GA: T: Before Z, overwriting your default timer. Useful for Liq or whatever. Does not work on challenges.') },
			'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0 && autoTrimpSettings.zATGA2timer.value > 0) });
		createSetting('ATGA2timerz',
			function () { return ('GA: T: After Z') },
			function () { return ('<b>ATGA Timer: After Z</b><br>ATGA will use the value you define in GA: T: AZT after the zone you have defined in this setting, overwriting your default timer. Useful for super push runs or whatever. Does not work on challenges.') },
			'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
		createSetting('ATGA2timerzt',
			function () { return ('GA: T: AZT') },
			function () { return ('<b>ATGA Timer: After Z Timer</b><br>ATGA will use this value after the zone that has been defined in GA: T: After Z, overwriting your default timer. Useful for super push runs or whatever.') },
			'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0 && autoTrimpSettings.ATGA2timerz.value > 0) });

		//Spire Timers
		createSetting('sATGA2timer',
			function () { return ('GA: T: Spire') },
			function () { return ('<b>ATGA Timer: Spire</b><br>ATGA will use this value in Spires. Respects your ignore Spires setting. Do not use this if you use the setting in the Spire tab! (As that uses vanilla GA) Nothing overwrites this except Daily Spire.') },
			'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
		createSetting('dsATGA2timer',
			function () { return ('GA: T: Daily Spire') },
			function () { return ('<b>ATGA Timer: Daily Spire</b><br>ATGA will use this value in Daily Spires. Respects your ignore Spires setting. Do not use this if you use the setting in the Spire tab! (As that uses vanilla GA) Nothing overwrites this.') },
			'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });

		//Daily Timers
		createSetting('dATGA2Auto',
			function () { return (['GA: Manual', 'GA: Auto No Spire', 'GA: Auto Dailies']) },
			function () { return ('<b>EXPERIMENTAL</b><br><b>ATGA Timer: Auto Dailies</b><br>ATGA will use automatically set breed timers in plague and bogged, overwriting your default timer.<br/>Set No Spire to not override in spire, respecting ignore spire settings.') },
			'multitoggle', 2, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
		createSetting('dATGA2timer',
			function () { return ('GA: T: Dailies') },
			function () { return ('<b>ATGA Timer: Normal Dailies</b><br>ATGA will use this value for normal Dailies such as ones without plague etc, overwriting your default timer. Useful for pushing your dailies that extra bit at the end. Overwrites Default, Before Z and After Z.') },
			'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
		createSetting('dhATGA2timer',
			function () { return ('GA: T: D: Hard') },
			function () { return ('<b>ATGA Timer: Hard Dailies</b><br>ATGA will use this value in Dailies that are considered Hard. Such Dailies include plaged, bloodthirst and Dailies with a lot of negative mods. Overwrites Default, Before Z and After Z and normal Daily ATGA Timer.') },
			'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });

		//C2 Timers
		createSetting('cATGA2timer',
			function () { return ('GA: T: ' + cinf()) },
			function () { return ('<b>ATGA Timer: ' + cinf() + 's</b><br>ATGA will use this value in ' + cinf() + 's. Overwrites Default, Before Z and After Z.') },
			'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
		createSetting('chATGA2timer',
			function () { return ('GA: T: C: Hard') },
			function () { return ('<b>ATGA Timer: Hard ' + cinf() + 's</b><br>ATGA will use this value in ' + cinf() + 's that are considered Hard. Electricity, Nom, Toxicity. Overwrites Default, Before Z and After Z and ' + cinf() + ' ATGA') },
			'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.ATGA2.enabled && autoTrimpSettings.ATGA2timer.value > 0) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Combat -- TO DO
	const displayCombat = true;
	if (displayCombat) {
		//Helium
		createSetting('autoFight',
			function () { return (['Better AutoFight OFF', 'Better Auto Fight', 'Vanilla']) },
			function () { return ('3-Way Button, Recommended. Will automatically handle fighting.<br>BAF = Old Algo (Fights if dead, new squad ready, new squad breed timer target exceeded, and if breeding takes under 0.5 seconds<br>BAF3 = Uses vanilla autofight and makes sure you fight on portal. <br> WARNING: If you autoportal with BetterAutoFight disabled, the game may sit there doing nothing until you click FIGHT. (not good for afk) ') },
			'multitoggle', 0, null, "Combat", [1, 2]);
		createSetting('autoAbandon',
			function () { return (['AutoAbandon', 'Don\'t Abandon', 'Only Rush Voids']) },
			function () { return ('<b>Autoabandon:</b> Considers abandoning trimps for void maps/prestiges.<br><b>Don\'t Abandon:</b> Will not abandon troops, but will still agressively autostance even if it will kill you (WILL NOT ABANDON TRIMPS TO DO VOIDS).<br><b>Only Rush Voids:</b> Considers abandoning trimps for void maps, but not prestiges, still autostances aggressively. <br>Made for Empower daily, and you might find this helpful if you\'re doing Workplace Safety feat. Then again with that I strongly recommend doing it fully manually. Anyway, don\'t blame me whatever happens.<br><b>Note:</b> AT will no longer be able to fix when your scryer gets stuck!') },
			'multitoggle', 0, null, 'Combat', [1, 2]);
		createSetting('floorCritCalc',
			function () { return ('Never Crit Calc') },
			function () { return ('Will floor your crit chance to make AT assume you are never gonna crit when calculating trimp damage.') },
			'boolean', false, null, 'Combat', [1, 2]);
		createSetting('AutoStance',
			function () { return (['Auto Stance OFF', 'Auto Stance', 'D Stance', 'Windstacking']) },
			function () { return ('<b>Autostance:</b> Automatically swap stances to avoid death. <br><b>D Stance:</b> Keeps you in D stance regardless of Health. <br><b>Windstacking:</b> For use after nature (z230), and will keep you in D stance unless you are windstacking (Only useful if transfer is maxed out and wind empowerment is high). There\'s settings in the Windstacking tab that must be setup for this to function as intended.') },
			'multitoggle', 0, null, "Combat", [1]);
		createSetting('IgnoreCrits',
			function () { return (['Safety First', 'Ignore Void Strength', 'Ignore All Crits']) },
			function () { return ('No longer switches to B against corrupted precision and/or void strength. <b>Basically we now treat \'crit things\' as regular in both autoStance and autoStance2</b>. In fact it no longer takes precision / strength into account and will manage like a normal enemy, thus retaining X / D depending on your needs. If you\'re certain your block is high enough regardless if you\'re fighting a crit guy in a crit daily, use this! Alternatively, manage the stances yourself.') },
			'multitoggle', 0, null, 'Combat', [1],
			function () { return (autoTrimpSettings.AutoStance.value !== 3) });
		createSetting('ForceAbandon',
			function () { return ('Trimpicide') },
			function () { return ('If a new fight group is available and anticipation stacks aren\'t maxed, Trimpicide and grab a new group. Will not abandon in spire. Recommended ON.') },
			'boolean', false, null, 'Combat', [1]);
		createSetting('AutoRoboTrimp',
			function () { return ('AutoRoboTrimp') },
			function () { return ('Use RoboTrimps ability starting at this level, and every 5 levels thereafter. (set to 0 to disable. default 60.) 60 is a good choice for mostly everybody.') },
			'value', 60, null, 'Combat', [1]);
		createSetting('fightforever',
			function () { return ('Fight Always') },
			function () { return ('U1: -1 to disable. Sends trimps to fight if they\'re not fighting, regardless of BAF. Has 2 uses. Set to 0 to always send out trimps. Or set a number higher than 0 to enable the H:D function. If the H:D ratio is below this number it will send them out. I.e, this is set to 1, it will send out trimps regardless with the H:D ratio is below 1.') },
			'value', -1, null, 'Combat', [1]);
		createSetting('addpoison',
			function () { return ('Poison Calc') },
			function () { return ('<b>Experimental. </b><br>Adds poison to the battlecalc. May improve your poison zone speed.') },
			'boolean', false, null, 'Combat', [1]);
		createSetting('fullice',
			function () { return ('Ice Calc') },
			function () { return ('Always calculates your ice to be a consistent level instead of going by the enemy debuff. Primary use it to ensure your H:D ratios aren\'t all over the place.') },
			'boolean', false, null, 'Combat', [1]);
		createSetting('45stacks',
			function () { return ('Antistack Calc') },
			function () { return ('<b>Experimental. </b><br>Always calcs your damage as having full antistacks. Useful for windstacking.') },
			'boolean', false, null, 'Combat', [1]);

		//Radon
		createSetting('equalityManagement',
			function () { return (['Auto Equality Off', 'Auto Equality: Basic', 'Auto Equality: Advanced']) },
			function () { return ('Manages Equality settings for you. <br><br><b>Auto Equality: Basic</b><br>Sets Equality to 0 on Slow enemies, and Autoscaling on for Fast enemies.<br><br><b>Auto Equality: Advanced</b><br>Will automatically identify the best equality levels to kill the current enemy and change it when necessary.') },
			'multitoggle', 0, null, 'Combat', [2]);
		createSetting('equalityCalc',
			function () { return (['Equality Calc Off', 'EC: On', 'EC: Health']) },
			function () { return ('<b>Experimental. </b><br>Adds Equality Scaling levels to the battlecalc. Will always calculate equality based on actual scaling levels when its turned off by other settings. Assumes you use Equality Scaling. Turning this on allows in-game Equality Scaling to adjust your Health accordingly. EC: Health only decreases enemies attack in the calculation which may improve speed.') },
			'multitoggle', 0, null, 'Combat', [2],
			function () { return (getPageSetting('equalityManagement', 2) < 2) });
		createSetting('gammaBurstCalc',
			function () { return ('Gamma Burst Calc') },
			function () { return ('<b>Experimental.</b><br>Adds Gamma Burst to your HD Ratio. Be warned, it will assume that you have a gamma burst ready to trigger for every attack so your HD Ratio might be 1 but you\'d need to attack 4-5 times to reach that damage theshold.') },
			'boolean', true, null, 'Combat', [1, 2],
			function () { return (game.stats.highestRadLevel.valueTotal() > 10) });
		createSetting('frenzyCalc',
			function () { return ('Frenzy Calc') },
			function () { return ('<b>Experimental.</b><br>Adds frenzy to the calc. Be warned, it will not farm as much with this on as it expects 100% frenzy uptime.') },
			'boolean', false, null, 'Combat', [2],
			function () { return (!game.portal.Frenzy.radLocked && !autoBattle.oneTimers.Mass_Hysteria.owned) });

		//Scryer settings -- Need a rework!
		createSetting('UseScryerStance',
			function () { return ('Enable Scryer Stance') },
			function () { return ('<b>MASTER BUTTON</b> Activates all other scrying settings, and overrides AutoStance when scryer conditions are met. Leave regular Autostance on while this is active. Scryer gives 2x Resources (Non-' + resource() + '/Nullifium) and a chance for Dark Essence. Once this is on, priority for Scryer decisions goes as such:<br>NEVER USE, FORCE USE, OVERKILL, MIN/MAX ZONE<br><br><b>NO OTHER BUTTONS WILL DO ANYTHING IF THIS IS OFF.</b>') },
			'boolean', false, null, 'Combat', [1]);
		createSetting('ScryerUseWhenOverkill',
			function () { return ('Use When Overkill') },
			function () { return ('Overrides everything! Toggles stance when we can Overkill in S, giving us double loot with no speed penalty (minimum one overkill, if you have more than 1, it will lose speed) <b>NOTE:</b> This being on, and being able to overkill in S will override ALL other settings <u>(Except never use in spire)</u>. This is a boolean logic shortcut that disregards all the other settings including Min and Max Zone. If you ONLY want to use S during Overkill, as a workaround: turn this on and Min zone: to 9999 and everything else off(red).') },
			'boolean', true, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerMinZone',
			function () { return ('Min Zone') },
			function () { return ('Minimum zone to start using scryer in.(inclusive) Recommend:(60 or 181). Overkill ignores this. This needs to be On & Valid for the <i>MAYBE</i> option on all other Scryer settings to do anything if Overkill is off. Tip: Use 9999 to disable all Non-Overkill, Non-Force, scryer usage.') },
			'value', 181, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerMaxZone',
			function () { return ('Max Zone') },
			function () { return ('<b>0 or -1 to disable (Recommended)</b><br>Overkill ignores this. Zone to STOP using scryer at (not inclusive). Turning this ON with a positive number stops <i>MAYBE</i> use of all other Scryer settings.') },
			'value', 230, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('onlyminmaxworld',
			function () { return (['Min & Max: Everywhere', 'Min & Max: World', 'Min & Max: Corrupted Only', 'Min & Max: Healthy Only']) },
			function () { return ('Further restricts scrying usage based on the current world zone.<br><br><b>Everywhere:</b> Places set as MAYBE are affected by Min & Max Range.<br><b>World:</b> Only the World is affected by Min & Max zones.<br><b>Corrupted:</b> Only Corrupted and Healthy enemies in the World are affected.<br><b>Healthy:</b> Only Healthy enemies in the World are affected.') },
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerUseinMaps2',
			function () { return (['Maps: NEVER', 'Maps: FORCE', 'Maps: MAYBE']) },
			function () {
				return ('<b>NEVER</b> Means what it says!!!<br>\
						<b>FORCE</b> means Scryer will ALWAYS activate in Maps<br>\
						<b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br>This setting requires use on Corrupteds to be on after corruption/magma.<br><br>Recommend MAYBE.')
			},
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerUseinVoidMaps2',
			function () { return (['VoidMaps: NEVER', 'VoidMaps: FORCE', 'VoidMaps: MAYBE']) },
			function () {
				return ('<b>NEVER</b> Means what it says!!!<br>\
						<b>FORCE</b> means Scryer will ALWAYS activate in Void Maps<br>\
						<b>MAYBE</b> means that Overkill and Min/Max use are allowed.')
			},
			'multitoggle', 0, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerUseinPMaps',
			function () { return (['P Maps: NEVER', 'P Maps: FORCE', 'P Maps: MAYBE']) },
			function () {
				return ('<b>NEVER</b> Means what it says!!!<br>\
						<b>FORCE</b> means Scryer will ALWAYS activate in maps higher than your zone<br>\
						<b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br>Recommend NEVER.')
			},
			'multitoggle', 0, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerUseinBW',
			function () { return (['BW: NEVER', 'BW: FORCE', 'BW: MAYBE']) },
			function () {
				return ('<b>NEVER</b> Means what it says!!!<br>\
						<b>FORCE</b> means Scryer will ALWAYS activate in BW Maps<br>\
						<b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br>This setting requires use in Maps to be on. <br><br>Recommend NEVER.')
			},
			'multitoggle', 0, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerUseinSpire2',
			function () { return (['Spire: NEVER', 'Spire: FORCE', 'Spire: MAYBE']) },
			function () {
				return ('<b>NEVER</b> Means what it says!!!<br>\
						<b>FORCE</b> means Scryer will ALWAYS activate in the Spire<br>\
						<b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br>This setting requires use on Corrupteds to be on for corrupted enemies.<br><br>Recommend NEVER.')
			},
			'multitoggle', 0, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerSkipBoss2',
			function () { return (['Boss: NEVER (All Levels)', 'Boss: MAYBE']) },
			function () {
				return ('<b>NEVER (All Levels)</b> will NEVER use S in cell 100 of the world!!!<br>\
						<b>MAYBE</b> treats the cell no differently to any other, Overkill and Min/Max Scryer is allowed.<br><br>Recommend NEVER (There is little benefit to double NON-' + resource() + ' resources and a small chance of DE).')
			},
			'multitoggle', 0, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerSkipCorrupteds2',
			function () { return (['Corrupted: NEVER', 'Corrupted: FORCE', 'Corrupted: MAYBE']) },
			function () {
				return ('<b>NEVER</b> Means what it says!!!<br>\
						<b>FORCE</b> means Scryer will ALWAYS activate against Corrupted enemies<br>\
						<b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br><b>Magma maps and Corrupted Voidmaps are currently classified as corrupted</b> and NEVER here will override Maps and Voidmaps use of Scryer<br><br>Recommend MAYBE.')
			},
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryerSkipHealthy',
			function () { return (['Healthy: NEVER', 'Healthy: FORCE', 'Healthy: MAYBE']) },
			function () {
				return ('<b>NEVER</b> Means what it says!!!<br>\
						<b>FORCE</b> means Scryer will ALWAYS activate against Healthy enemies<br>\
						<b>MAYBE</b> means that Overkill and Min/Max use are allowed.<br><b>Corrupted Voidmaps are currently classified as Healthy (same as corrupted)</b> and NEVER here will override Maps and Voidmaps use of Scryer<br><br>Recommend MAYBE.')
			},
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });
		createSetting('ScryUseinPoison',
			function () { return ('Scry in Poison') },
			function () {
				return ('Decides what you do in Poison. <br>\
						<b>-1</b> = Maybe <br><b>0</b> = Never <br>\
						<b>Above 0</b> = Max Zone you want it scrying ')
			},
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
			function () { return ('Why scry when theres no essence? Turns off scrying when the remaining enemies with essence drops to 0.') },
			'boolean', false, null, 'Combat', [1],
			function () { return (getPageSetting('UseScryerStance', currSettingUniverse)) });


		//----------------------------------------------------------------------------------------------------------------------

		//Windstacking
		createSetting('WindStackingMin',
			function () { return ('Windstack Min Zone') },
			function () { return ('For use with Windstacking Stance, enables windstacking in zones above and inclusive of the zone set. (Get specified windstacks then change to D, kill bad guy, then repeat). This is designed to force S use until you have specified stacks in wind zones, overriding scryer settings. All windstack settings apart from WS MAX work off this setting.') },
			'value', -1, null, 'Combat', [1],
			function () { return (autoTrimpSettings.AutoStance.value === 3) });
		createSetting('WindStackingMinHD',
			function () { return ('Windstack H:D') },
			function () { return ('For use with Windstacking Stance, fiddle with this to maximise your stacks in wind zones.') },
			'value', -1, null, 'Combat', [1],
			function () { return (autoTrimpSettings.AutoStance.value === 3) });
		createSetting('WindStackingMax',
			function () { return ('Windstack Stacks') },
			function () { return ('For use with Windstacking Stance. Amount of windstacks to obtain before switching to D stance. Default is 200, but I recommend anywhere between 175-190.  In Wind Enlightenment it will add 100 stacks to your total automatically. So if this setting is 200 It will assume you want 300 stacks instead during enlightenment.') },
			'value', 200, null, 'Combat', [1],
			function () { return (autoTrimpSettings.AutoStance.value === 3) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Magma -- TO DO
	const displayMagma = true;
	if (displayMagma) {
		createSetting('UseAutoGen',
			function () { return ('Auto Generator') },
			function () { return ('Turn this on to use these settings.') },
			'boolean', false, null, 'Magma', [1]);
		createSetting('beforegen',
			function () { return (['Gain Mi', 'Gain Fuel', 'Hybrid']) },
			function () { return ('<b>MODE BEFORE FUELING: </b>Which mode to use before fueling. This is the mode which the generator will use if you fuel after z230.') },
			'multitoggle', 1, null, 'Magma', [1]);
		createSetting('fuellater',
			function () { return ('Start Fuel Z') },
			function () { return ('Start fueling at this zone instead of 230. I would suggest you have a value lower than your max, for obvious reasons. Recommend starting at a value close-ish to your max supply. Use 230 to use your <b>BEFORE FUEL</b> setting.') },
			'value', -1, null, 'Magma', [1]);
		createSetting('fuelend',
			function () { return ('End Fuel Z') },
			function () { return ('End fueling at this zone. After this zone is reached, will follow your preference. -1 to fuel infinitely.') },
			'value', -1, null, 'Magma', [1]);
		createSetting('defaultgen',
			function () { return (['Gain Mi', 'Gain Fuel', 'Hybrid']) },
			function () { return ('<b>MODE AFTER FUELING: </b>Which mode to use after fueling.') },
			'multitoggle', 1, null, 'Magma', [1]);
		createSetting('AutoGenDC',
			function () { return (['Daily: Normal', 'Daily: Fuel', 'Daily: Hybrid']) },
			function () { return ('<b>Normal:</b> Uses the AutoGen settings. <br><b>Fuel:</b> Fuels the entire Daily. <br><b>Hybrid:</b> Uses Hybrid for the entire Daily.') },
			'multitoggle', 1, null, 'Magma', [1]);
		createSetting('AutoGenC2',
			function () { return (['' + cinf() + ': Normal', '' + cinf() + ': Fuel', '' + cinf() + ': Hybrid']) },
			function () { return ('<b>Normal:</b> Uses the AutoGen settings. <br><b>Fuel:</b> Fuels the entire ' + cinf() + '. <br><b>Hybrid:</b> Uses Hybrid for the entire ' + cinf() + '.') },
			'multitoggle', 1, null, 'Magma', [1]);

		//Spend Mi
		createSetting('spendmagmite',
			function () { return (['Spend Magmite OFF', 'Spend Magmite (Portal)', 'Spend Magmite Always']) },
			function () { return ('Auto Spends any unspent Magmite immediately before portaling. (Or Always, if toggled). Part 1 buys any permanent one-and-done upgrades in order from most expensive to least. Part 2 then analyzes Efficiency vs Capacity for cost/benefit, and buys Efficiency if its BETTER than Capacity. If not, if the PRICE of Capacity is less than the price of Supply, it buys Capacity. If not, it buys Supply. And then it repeats itself until you run out of Magmite and cant buy anymore.') },
			'multitoggle', 1, null, 'Magma', [1]);
		createSetting('ratiospend',
			function () { return ('Ratio Spending') },
			function () { return ('Spends Magmite in a Ratio you define.') },
			'boolean', false, null, 'Magma', [1]);
		createSetting('effratio',
			function () { return ('Efficiency') },
			function () { return ('Use -1 or 0 to not spend on this. Any value above 0 will spend.') },
			'value', -1, null, 'Magma', [1],
			function () { return (autoTrimpSettings.ratiospend.enabled) });
		createSetting('capratio',
			function () { return ('Capacity') },
			function () { return ('Use -1 or 0 to not spend on this. Any value above 0 will spend.') },
			'value', -1, null, 'Magma', [1],
			function () { return (autoTrimpSettings.ratiospend.enabled) });
		createSetting('supratio',
			function () { return ('Supply') },
			function () { return ('Use -1 or 0 to not spend on this. Any value above 0 will spend.') },
			'value', -1, null, 'Magma', [1],
			function () { return (autoTrimpSettings.ratiospend.enabled) });
		createSetting('ocratio',
			function () { return ('Overclocker') },
			function () { return ('Use -1 or 0 to not spend on this. Any value above 0 will spend.') },
			'value', -1, null, 'Magma', [1],
			function () { return (autoTrimpSettings.ratiospend.enabled) });
		createSetting('SupplyWall',
			function () { return ('Throttle Supply (or Capacity)') },
			function () { return ('Positive number NOT 1 e.g. 2.5: Consider Supply when its cost * 2.5 is < Capacity, instead of immediately when < Cap. Effectively throttles supply for when you don\'t need too many.<br><br>Negative number (-1 is ok) e.g. -2.5: Consider Supply if it costs < Capacity * 2.5, buy more supplys! Effectively throttling capacity instead.<br><br><b>Set to 1: DISABLE SUPPLY only spend magmite on Efficiency, Capacity and Overclocker. Always try to get supply close to your HZE. <br>Set to 0: IGNORE SETTING and use old behaviour (will still try to buy overclocker)</b>') },
			'valueNegative', 0.4, null, 'Magma', [1],
			function () { return (!autoTrimpSettings.ratiospend.enabled) });
		createSetting('spendmagmitesetting',
			function () { return (['Normal', 'Normal & No OC', 'OneTime Only', 'OneTime & OC']) },
			function () { return ('<b>Normal:</b> Spends Magmite Normally as Explained in Magmite spending behaviour. <br><b>Normal & No OC:</b> Same as normal, except skips OC afterbuying 1 OC upgrade. <br><b>OneTime Only:</b> Only Buys the One off upgrades except skips OC afterbuying 1 OC upgrade. <br><b>OneTime & OC:</b> Buys all One off upgrades, then buys OC only.') },
			'multitoggle', 0, null, 'Magma', [1],
			function () { return (!autoTrimpSettings.ratiospend.enabled) });
		createSetting('MagmiteExplain',
			function () { return ('Magmite spending behaviour') },
			function () { return ('1. Buy one-and-done upgrades, expensive first, then consider 1st level of Overclocker;<br>2. Buy Overclocker IF AND ONLY IF we can afford it;<br>2.5. Exit if OneTimeOnly<br>3. Buy Efficiency if it is better than capacity;<br>4. Buy Capacity or Supply depending on which is cheaper, or based on SupplyWall') },
			'infoclick', 'MagmiteExplain', null, 'Magma', [1],
			function () { return (!autoTrimpSettings.ratiospend.enabled) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Heirloom -- Descriptions done!
	const displayHeirlooms = true;
	if (displayHeirlooms) {
		//Heirloom Swapping
		createSetting('heirloom',
			function () { return ('Heirloom Swapping') },
			function () {
				var description = "<p>Master switch for whether the script will do any form of heirloom swapping.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirlooms', [1, 2]);

		createSetting('heirloomMapSwap',
			function () { return ('Map Swap') },
			function () {
				var description = "<p>If below your assigned swap zone this will automatically swap from your <b>Initial</b> shield to your <b>Afterpush</b> (or <b>" + cinf() + "</b> depending on your run) shield when inside of maps.</p>";
				description += "<p><b>Void shield settings will override this.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomPostVoidSwap',
			function () { return ('Post Void Swap') },
			function () {
				var description = "<p>If you have completed any void maps on your run this will set your swap zone to 0 to maximise damage in your afterpush.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomVoidSwap',
			function () { return ('Void PB Swap') },
			function () {
				var description = "<p>When inside Void Maps and your current enemy is slow with your next enemy being fast this will automatically swap to your <b>Void PB</b> shield so that you can maximise PlagueBringer damage going into the next enemy.</p>";
				description += "<p><b>Won't do anything during double attack voids.</b></p>";
				description += "<p>Will only work if your <b>Void</b> Shield doesn't have <b>PlagueBringer</b> and your <b>Void PB</b> shield has <b>PlagueBringer</b>.</p>";
				description += "<p><b>Recommended:</b> Off unless you know what you're doing</p>";
				return description;
			}, 'boolean', false, null, 'Heirlooms', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		//Shield swapping
		createSetting('heirloomShield',
			function () { return ('Shields') },
			function () {
				var description = "<p>Master switch for whether the script will Shield related heirloom swapping.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse)) });

		createSetting('heirloomInitial',
			function () { return ('Initial') },
			function () {
				var description = "<p>Heirloom to use before your designated swap zone.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> a shield with void map drop chance</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomAfterpush',
			function () { return ('Afterpush') },
			function () {
				var description = "<p>Heirloom to use after your designated swap zone.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> a shield without void map drop chance</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomC3',
			function () { return (cinf()) },
			function () {
				var description = "<p>Heirloom to use after your designated swap zone during " + cinf() + " or special challenge (" + (currSettingUniverse === 2 ? "Mayhem, Pandemonium, Desolation" : "Frigid") + ") runs.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> a shield without void map drop chance</p>";
				return description;
			},
			'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomVoid',
			function () { return ('Void') },
			function () {
				var description = "<p>Heirloom to use inside of Void Maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> damage heirloom</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomVoidPlaguebringer',
			function () { return ('Void PB') },
			function () {
				var description = "<p>Heirloom to use inside of Void Maps when fighting a slow enemy and the next enemy is fast.</p>";
				description += "<p><b>Ignore Spires Until</b> settings will stop this swap from happening if the value is above your current world zone.</p>";
				description += "<p>A shield with <b>Plaguebringer MUST</b> be used.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> <b>Plaguebringer</b> heirloom</p>";
				return description;
			},
			'textValue', 'undefined', null, 'Heirlooms', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse) && getPageSetting('heirloomVoidSwap', currSettingUniverse)) });

		createSetting('heirloomSpire',
			function () { return ('Spire') },
			function () {
				var description = "<p>The name of the heirloom you would like to use during active Spires.</p>";
				description += "<p><b>Ignore Spires Until</b> settings will stop this swap from happening if the value is above your current world zone.</p>";
				description += "<p>The Map Swap setting will override this whilst in maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Damage+Health heirloom</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirlooms', [1],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse) && game.stats.highestLevel.valueTotal() >= 200) });

		createSetting('heirloomSwapZone',
			function () { return ('Swap Zone') },
			function () {
				var description = "<p>From which zone to swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield during filler (non daily/" + cinf() + " runs.</p>";
				description += "<p>If set to -1 it will disable this setting.</p>";
				description += "<p>If set to <b>75</b> it will swap shields from <b>z75</b> onwards.</p>";
				return description;
			}, 'value', -1, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomSwapZoneDaily',
			function () { return ('Daily Swap Zone') },
			function () {
				var description = "<p>From which zone to swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield during daily runs.</p>";
				description += "<p>If set to -1 it will disable this setting.</p>";
				description += "<p>If set to <b>75</b> it will swap shields from <b>z75</b> onwards.</p>";
				return description;
			},
			'value', -1, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomSwapZoneC3',
			function () { return (cinf() + ' Swap Zone') },
			function () {
				var description = "<p>From which zone to swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield during daily runs.</p>";
				description += "<p>If set to -1 it will disable this setting.</p>";
				description += "<p>If set to <b>75</b> it will swap shields from <b>z75</b> onwards.</p>";
				return description;
			}, 'value', -1, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		//Staff swapping
		createSetting('heirloomStaff',
			function () { return ('Staffs') },
			function () {
				var description = "<p>Master switch for whether the script will Staff related heirloom swapping.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse)) });

		createSetting('heirloomStaffWorld',
			function () { return ('World') },
			function () {
				var description = "<p>The staff that you would like to use when in world zones.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> High pet XP staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffMap',
			function () { return ('Map') },
			function () {
				var description = "<p>The staff that you would like to use when running maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p>Will be overridden by the proceeding heirloom settings if they've been assigned otherwise will use this in every map available.</p>";
				description += "<p><b>Recommended:</b> Resource efficiency heavy staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffVoid',
			function () { return ('Void') },
			function () {
				var description = "<p>The staff that you would like to use when running <b>Void</b> maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated metal efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffFood',
			function () { return ('Savory Cache') },
			function () {
				var description = "<p>The staff that you would like to use when running <b>Savory Cache</b> maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated food efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffWood',
			function () { return ('Wooden Cache') },
			function () {
				var description = "<p>The staff that you would like to use when running <b>Wooden Cache</b> maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated wood efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffMetal',
			function () { return ('Metal Cache') },
			function () {
				var description = "<p>The staff that you would like to use when running <b>Metal Cache</b> maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated metal efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffResource',
			function () { return ('Resource Cache') },
			function () {
				var description = "<p>The staff that you would like to use when running <b>Resource Cache</b> maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated science efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirlooms', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		//Auto Heirlooms
		createSetting('heirloomAuto',
			function () { return ('Auto Heirlooms') },
			function () {
				var description = "<p>Master switch for whether the script will try to keep any of the heirlooms in your temporary section when portaling.</p>";
				description += "<p>When portaling will create a list of mods you want heirlooms to have and checks if the heirlooms in your temporary section for the type(s) you have selected to keep have the possibility to have all of the selected mods and if any do they will be stashed otherwise will be recycled.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirlooms', [1, 2]);

		createSetting('heirloomAutoTypeToKeep',
			function () {
				var heirloomOptions = ['None', 'Shields', 'Staffs', 'All'];
				if (currSettingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 200) heirloomOptions.push('Cores');
				return (heirloomOptions)
			},
			function () {
				var description = "<p>Controls the heirloom types that the script will try to keep.</p>";
				description += "<p><b>Shields</b><br>Will check to see if any <b>Shield</b> heirlooms should be kept when portaling.</p>";
				description += "<p><b>Staffs</b><br>Will check to see if any <b>Staff</b> heirlooms should be kept when portaling.</p>";
				description += "<p><b>All</b><br>Will check to see if <b>ANY</b> heirlooms should be kept when portaling.</p>";
				if (currSettingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 200) description += "<p><b>Cores</b><br>Will check to see if any <b>Core</b> heirlooms should be kept when portaling.</p>";
				description += "<p><b>Recommended:</b> The type of heirlooms you need</p>";
				return description;
			},
			'multitoggle', 0, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });
		createSetting('heirloomAutoRareToKeep',
			function () { return ('Rarity to Keep') },
			function () {
				var description = "<p>When identifying which heirlooms to keep will look at this rarity of heirloom, recycles all others.</p>";
				description += "<p>Will only display tiers that can currently be obtained based on your highest zone reached.</p>";
				description += "<p>When changed the heirloom mods sections will only display the mods available for that heirloom tier.</p>";
				description += "<p><b>Recommended:</b> Highest tier available</p>";
				return description;
			}, 'dropdown', 'None', ["None"], 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		//Shield Line
		createSetting('heirloomAutoShield',
			function () { return ('Shields') },
			function () {
				var description = "<p>Enable to allow you to select the shield modifiers you would like to target.</p>";
				return description;
			}, 'boolean', false, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		createSetting('heirloomAutoShieldMod1',
			function () { return ('Shield: Modifier 1') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rariry to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 0)
			});

		createSetting('heirloomAutoShieldMod2',
			function () { return ('Shield: Modifier 2') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rariry to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 1)
			});

		createSetting('heirloomAutoShieldMod3',
			function () { return ('Shield: Modifier 3') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rariry to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 2)
			});

		createSetting('heirloomAutoShieldMod4',
			function () { return ('Shield: Modifier 4') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rariry to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 5)
			});

		createSetting('heirloomAutoShieldMod5',
			function () { return ('Shield: Modifier 5') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rariry to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 8)
			});

		createSetting('heirloomAutoShieldMod6',
			function () { return ('Shield: Modifier 6') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rariry to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 9)
			});

		createSetting('heirloomAutoShieldMod7',
			function () { return ('Shield: Modifier 7') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rariry to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 11)
			});

		//Staff Line
		createSetting('heirloomAutoStaff',
			function () { return ('Staffs') },
			function () {
				var description = "<p>Enable to allow you to select the staff modifiers you would like to target.</p>";
				return description;
			}, 'boolean', false, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		createSetting('heirloomAutoStaffMod1',
			function () { return ('Staff: Modifier 1') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rariry to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 0)
			});

		createSetting('heirloomAutoStaffMod2',
			function () { return ('Staff: Modifier 2') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rariry to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 1)
			});

		createSetting('heirloomAutoStaffMod3',
			function () { return ('Staff: Modifier 3') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rariry to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 2)
			});

		createSetting('heirloomAutoStaffMod4',
			function () { return ('Staff: Modifier 4') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rariry to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 5)
			});

		createSetting('heirloomAutoStaffMod5',
			function () { return ('Staff: Modifier 5') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rariry to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 7)
			});

		createSetting('heirloomAutoStaffMod6',
			function () { return ('Staff: Modifier 6') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rariry to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 9)
			});

		createSetting('heirloomAutoStaffMod7',
			function () { return ('Staff: Modifier 7') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rariry to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty"], 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse)) >= 11)
			});

		//Core Line
		createSetting('heirloomAutoCore',
			function () { return ('Cores') },
			function () { return ('Enables in-depth core settings.') },
			'boolean', false, null, 'Heirlooms', [1],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });
		createSetting('heirloomAutoCoreMod1',
			function () { return ('Cores: Modifier 1') },
			function () {
				var description = "<p>Keeps Cores with selected mod.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty", "Fire Trap Damage", "Poison Trap Damage", "Lightning Trap Power", "Runestone Drop Rate", "Strength Tower Effect", "Condenser Effect"], 'Heirlooms', [1],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse)) });
		createSetting('heirloomAutoCoreMod2',
			function () { return ('Cores: Modifier 2') },
			function () {
				var description = "<p>Keeps Cores with selected mod.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty", "Fire Trap Damage", "Poison Trap Damage", "Lightning Trap Power", "Runestone Drop Rate", "Strength Tower Effect", "Condenser Effect"], 'Heirlooms', [1],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse)) });
		createSetting('heirloomAutoCoreMod3',
			function () { return ('Cores: Modifier 3') },
			function () {
				var description = "<p>Keeps Cores with selected mod.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty", "Fire Trap Damage", "Poison Trap Damage", "Lightning Trap Power", "Runestone Drop Rate", "Strength Tower Effect", "Condenser Effect"], 'Heirlooms', [1],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse)) });
		createSetting('heirloomAutoCoreMod4',
			function () { return ('Cores: Modifier 4') },
			function () {
				var description = "<p>Keeps Cores with selected mod.</p>";
				return description;
			}, 'dropdown', 'Empty', ["Empty", "Fire Trap Damage", "Poison Trap Damage", "Lightning Trap Power", "Runestone Drop Rate", "Strength Tower Effect", "Condenser Effect"], 'Heirlooms', [1],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse)) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Golden -- Descriptions done!
	const displayGolden = true;
	if (displayGolden) {
		createSetting('autoGoldenSettings',
			function () { return ('Auto Gold Settings') },
			function () {
				var description = "<p>Here you can select the golden upgrades you would like to have purchased during filler runs.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			}, 'mazArray', [], 'MAZLookalike("Auto Golden", "AutoGolden", "MAZ")', 'Golden', [1, 2]);
		createSetting('autoGoldenDailySettings',
			function () { return ('Daily Auto Gold Settings') },
			function () {
				var description = "<p>Here you can select the golden upgrades you would like to have purchased during daily runs.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			}, 'mazArray', [], 'MAZLookalike("Daily Auto Golden", "AutoGoldenDaily", "MAZ")', 'Golden', [1, 2]);
		createSetting('autoGoldenC3Settings',
			function () { return (cinf() + ' Auto Gold Settings') },
			function () {
				var description = "<p>Here you can select the golden upgrades you would like to have purchased during " + cinf() + " runs.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>If needed, the Help button has information for all of the inputs.</b></p>";
				return description;
			}, 'mazArray', [], 'MAZLookalike("C3 Auto Golden", "AutoGoldenC3", "MAZ")', 'Golden', [1, 2]);
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Nature -- TO DO
	const displayNature = true;
	if (displayNature) {
		//Tokens
		createSetting('AutoNatureTokens',
			function () { return ('Spend Nature Tokens') },
			function () { return ('<b>MASTER BUTTON</b> Automatically spend or convert nature tokens.') },
			'boolean', false, null, 'Nature', [1]);
		createSetting('tokenthresh',
			function () { return ('Token Threshold') },
			function () { return ('If Tokens would go below this value it will not convert tokens.') },
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
			function () { return ('Enables Automatic Enlightenment. Use the settings to define how it works.') },
			'boolean', false, null, 'Nature', [1]);
		createSetting('pfillerenlightthresh',
			function () { return ('E: F: Poison') },
			function () { return ('Activate Poison Enlight when Enlight cost is below this Thresh in Fillers. Consumes Tokens. -1 to disable.') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('wfillerenlightthresh',
			function () { return ('E: F: Wind') },
			function () { return ('Activate Wind Enlight when Enlight cost is below this Thresh in Fillers. Consumes Tokens. -1 to disable.') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('ifillerenlightthresh',
			function () { return ('E: F: Ice') },
			function () { return ('Activate Ice Enlight when Enlight cost is below this Thresh in Fillers. Consumes Tokens. -1 to disable.') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('pdailyenlightthresh',
			function () { return ('E: D: Poison') },
			function () { return ('Activate Poison Enlight when Enlight cost is below this Thresh in Dailies. Consumes Tokens. -1 to disable.') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('wdailyenlightthresh',
			function () { return ('E: D: Wind') },
			function () { return ('Activate Wind Enlight when Enlight cost is below this Thresh in Dailies. Consumes Tokens. -1 to disable.') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('idailyenlightthresh',
			function () { return ('E: D: Ice') },
			function () { return ('Activate Ice Enlight when Enlight cost is below this Thresh in Dailies. Consumes Tokens. -1 to disable.') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('pc2enlightthresh',
			function () { return ('E: C: Poison') },
			function () { return ('Activate Poison Enlight when Enlight cost is below this Thresh in ' + cinf() + 's. Consumes Tokens. -1 to disable.') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('wc2enlightthresh',
			function () { return ('E: C: Wind') },
			function () { return ('Activate Wind Enlight when Enlight cost is below this Thresh in ' + cinf() + 's. Consumes Tokens. -1 to disable.') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('ic2enlightthresh',
			function () { return ('E: C: Ice') },
			function () { return ('Activate Ice Enlight when Enlight cost is below this Thresh in ' + cinf() + 's. Consumes Tokens. -1 to disable.') },
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Display -- TO DO
	const displayDisplay = true;
	if (displayDisplay) {
		createSetting('displayEnhancedGrid',
			function () { return ('Enhance Grids') },
			function () { return ('Apply slight visual enhancements to world and map grids that highlights with drop shadow all the exotic, powerful, skeletimps and other special imps.') },
			'boolean', false, null, 'Display', [0]);
		createSetting('displayHeHr',
			function () { return (resourceHour() + '/hr status') },
			function () { return ('Enables the display of your ' + resource().toLowerCase() + ' per hour. Turn this off to reduce memory.') },
			'boolean', true, null, 'Display', [1, 2]);

		createSetting('displayAllSettings',
			function () { return ('Display all settings') },
			function () { return ('Will display all of the locked settings that have HZE or other requirements to be displayed.') },
			'boolean', false, null, 'Display', [0]);

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
			'boolean', false, null, 'Display', [11]);
		createSetting('showbreedtimer',
			function () { return ('Enable Breed Timer') },
			function () { return ('Enables the display of the hidden breedtimer. Turn this off to reduce memory.') },
			'boolean', true, null, 'Display', [1]);

		createSetting('sitInMaps',
			function () { return ('Sit in maps') },
			function () {
				var description = "<p>Will force your trimps to go sit in the map chamber when enabled. </p>";
				description += "<p><b>The 'Sit In Zone' setting must be setup for this to work properly.</b></p>"
				description += "<p><b>Recommended:</b> Disabled</p>";
				return description;
			}, 'boolean', false, null, 'Display', [1, 2]);
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

		createSetting('disableForTW',
			function () { return ('Disable AT in TW') },
			function () { return ('Will disable all of AT\'s features during time warp.') },
			'boolean', false, null, 'Display', [0]);

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
			map_Destacking: false,
			map_Skip: false,
			other: false,
			buildings: false,
			jobs: false,
			zone: false,
			exotic: false,
		}, null, 'Display', [0]);
	}

	//----------------------------------------------------------------------------------------------------------------------

	document.getElementById('battleSideTitle').setAttribute('onclick', 'MODULES["performance"].EnableAFKMode()');
	document.getElementById('displayHeHr').setAttribute('onclick', 'toggleHeHr()');

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
			function () { return ('Reset everything to the way it was when you first installed the script.') },
			'infoclick', 'ResetDefaultSettingsProfiles', null, 'Import Export', [1, 2]);
		createSetting('DownloadDebug',
			function () { return ('Download for debug') },
			function () { return ('Will download both your save and AT settings so that they can be debugged easier.') },
			'action', 'ImportExportTooltip("ExportAutoTrimps","update",true)', null, 'Import Export', [1, 2]);
		createSetting('CleanupAutoTrimps',
			function () { return ('Cleanup Saved Settings') },
			function () { return ('Deletes old values from previous versions of the script from your AutoTrimps settings file.') },
			'infoclick', 'CleanupAutoTrimps', null, 'Import Export', [1, 2]);
		createSetting('downloadSaves',
			function () { return ('Download Saves') },
			function () { return ('Will automatically download saves whenever AutoTrimps portals.') },
			'boolean', false, null, 'Import Export', [1, 2]);

		createSetting('mutatorPresets',
			function () { return ('Mutator Preset Settings') },
			function () { return ('Click to adjust settings.') },
			'mazDefaultArray', JSON.stringify({
				preset1: {},
				preset2: {},
				preset3: {},
			}), null, 'Import Export', [0]);
	}


	//Testing - Hidden Features for testing purposes! Please never seek these out!
	const displayTesting = true;
	if (displayTesting) {

		createSetting('gameUser',
			function () { return ('User') },
			function () { return ('<b>Not gonna be seen</b>') },
			'textValue', 'undefined', null, 'Test', [0],
			function () { return (false) });

		createSetting('gameSpeed50',
			function () { return ('Game Speed 50x') },
			function () { return ('Set gamespeed to 50x the regular value.') },
			'action', 'cheatSpeedX(0.00001)', null, 'Test', [0]);

		createSetting('gameSpeedNormal',
			function () { return ('Game Speed Normal') },
			function () { return ('Set gamespeed to the regular value.') },
			'action', 'cheatSpeedNormal()', null, 'Test', [0]);

		createSetting('gameSetChallenge',
			function () { return ('Custom Challenge') },
			function () { return ('Will set the challenge that Trimps is running to your input.') },
			'action', 'ImportExportTooltip("SetCustomChallenge")', null, 'Test', [0]);

		createSetting('gameSetC2',
			function () { return ('Toggle ' + cinf()) },
			function () { return ('Will toggle on the setting for if you\'re running a ' + cinf() + '.') },
			'action', 'cheatRunningCinf()', null, 'Test', [0]);

		createSetting('gameLastWorldCell',
			function () { return ('Last World Cell') },
			function () { return ('Sets your current cell to the last world cell in the world.') },
			'action', 'cheatWorldCell()', null, 'Test', [0]);

		createSetting('gameLastMapCell',
			function () { return ('Last Map Cell') },
			function () { return ('Sets your current cell to the last map cell if currently mapping.') },
			'action', 'cheatMapCell()', null, 'Test', [0]);

		createSetting('gameMaxMapBonus',
			function () { return ('Max Map Bonus') },
			function () { return ('Sets map bonus to 10.') },
			'action', 'cheatMaxMapBonus()', null, 'Test', [0]);

		createSetting('gameMaxTenacity',
			function () { return ('Tenacity Max Mult') },
			function () { return ('Sets Tenacity to max mult.') },
			'action', 'cheatMaxTenacity()', null, 'Test', [0]);

		createSetting('gameStatMult',
			function () { return ('1e100x stats') },
			function () { return ('Multiplies soldier health & damage by 1e100.') },
			'action', 'cheatTrimpStats()', null, 'Test', [0]);
	}
}

function resource() {
	return currSettingUniverse === 2 ? 'Radon' : 'Helium';
}

function resourceHour() {
	return currSettingUniverse === 2 ? 'Rn' : 'He';
}

function heHourPortal() {
	var description = '';
	if (currSettingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 230) description += '<br>If \'Portal after voids (poison)\' is selected it will run until you reach the next poison band and run voids there.'
	return description;
}

function cinf() {
	return currSettingUniverse === 2 ? 'C3' : 'C2';
}

MODULES.u1unlocks = [];
MODULES.u2unlocks = [];

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

	} else if (type == 'value' || type == 'valueNegative' || type == 'multiValue') {
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
	} else if (type === 'mazDefaultArray') {
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
		return;
	}
	if (autoTrimpSettings[id].name != name)
		autoTrimpSettings[id].name = name;
	if (autoTrimpSettings[id].description != description)
		autoTrimpSettings[id].description = description;
}

function settingChanged(id, currUniverse) {
	var btn = autoTrimpSettings[id];
	var radonon = currUniverse ? game.global.universe === 2 : autoTrimpSettings.radonsettings.value == 1;
	if (btn.type === 'boolean') {
		var enabled = 'enabled'
		if (radonon && btn.universe.indexOf(0) === -1) enabled += 'U2';
		btn[enabled] = !btn[enabled];
		document.getElementById(id).setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + btn[enabled]);
		if (id === 'equipEfficientEquipDisplay') {
			displayMostEfficientEquipment();
		}
		if (id === 'radonsettings') {
			modifyParentNodeUniverseSwap(true);
		}
		if (id === 'heirloomAutoRareToKeep') {
			autoHeirloomOptions(true);
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
	if (btn.type === 'multitoggle') {
		var value = 'value'
		if (radonon && btn.universe.indexOf(0) === -1) value += 'U2';
		if (id === 'AutoMagmiteSpender2' && btn[value] == 1) {
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
		if (radonon && btn.universe.indexOf(0) === -1) selected += 'U2';
		btn[selected] = document.getElementById(id).value;
	}

	updateCustomButtons(id === 'radonsettings');
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
	for (var i = 0; i < elem.length; i++) {
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

	var radonon = getPageSetting('radonsettings') === 1 ? 'show' : 'hide';

	var radonon_mayhem = getPageSetting('radonsettings') === 1 && (getPageSetting('displayAllSettings') || autoTrimpSettings.mayhem.require()) ? 'show' : 'hide';
	var radonon_pandemonium = getPageSetting('radonsettings') === 1 && (getPageSetting('displayAllSettings') || autoTrimpSettings.pandemonium.require()) ? 'show' : 'hide';
	var radonon_desolation = getPageSetting('radonsettings') === 1 && (getPageSetting('displayAllSettings') || autoTrimpSettings.desolation.require()) ? 'show' : 'hide';

	var radonoff = getPageSetting('radonsettings') === 0 ? 'show' : 'hide';
	var heirloom = getPageSetting('heirloomAuto', currSettingUniverse) ? 'show' : 'hide';

	//Core
	modifyParentNode("radonsettings", 'show');

	//Dailies
	modifyParentNode("dscryvoidmaps", radonoff);
	modifyParentNode("dPreSpireNurseries", radonoff);
	modifyParentNode("liqstack", radonoff);
	modifyParentNode("mapOddEvenIncrement", radonon);
	modifyParentNode("dailyHeliumHrPortal", 'show');

	if (getPageSetting('displayAllSettings', currSettingUniverse) || (getPageSetting('autoPortal', currSettingUniverse).includes('Hour') && holidayObj.holiday === 'Eggy')) modifyParentNode("heliumC2Challenge", 'show');
	else modifyParentNode("heliumC2Challenge", 'hide');

	//Maps
	//Helium Settings
	modifyParentNode("scryvoidmaps", 'show');
	modifyParentNode("uniqueMapSettingsArray", 'show');

	//Gear equipNoShields
	modifyParentNode("equipNoShields", 'show');

	//Spire
	//None!

	//Combat
	modifyParentNode("gammaBurstCalc", radonoff);
	modifyParentNode("screwessence", radonoff);

	//ATGA
	modifyParentNode("ATGA2timer", radonoff);
	modifyParentNode("sATGA2timer", radonoff);
	modifyParentNode("dhATGA2timer", radonoff);

	//C2
	modifyParentNode("c2disableFinished", 'show');
	modifyParentNode("c2Fused", radonoff);
	modifyParentNode("balanceImprobDestack", radonoff);

	modifyParentNode("c2RunnerPercent", radonon);
	modifyParentNode("unbalanceImprobDestack", radonon);
	modifyParentNode("trappapaloozaCoords", radonon);
	modifyParentNode("wither", radonon);
	modifyParentNode("questSmithyMaps", radonon);
	modifyParentNode("mayhemSwapZone", radonon_mayhem);
	modifyParentNode("stormStacks", radonon);
	modifyParentNode("pandemoniumSwapZone", radonon_pandemonium);
	modifyParentNode("glassStacks", radonon_desolation);
	modifyParentNode("desolationSwapZone", radonon);

	//Buildings
	modifyParentNode("autGigaDeltaFactor", radonoff);

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
	modifyParentNode("heirloomSpire", 'show');
	modifyParentNode("heirloomSwapZoneC3", 'show');
	modifyParentNode("heirloomStaffVoid", 'show');
	modifyParentNode("heirloomStaffResource", 'show');

	modifyParentNode("heirloomAutoRareToKeep", heirloom);
	modifyParentNode("heirloomAutoShieldMod7", heirloom);
	modifyParentNode("heirloomAutoStaffMod7", heirloom);
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

	modifyParentNode("gameSetC2", 'show');

}

function HeHrPortalOptions() {
	var hze = game.stats.highestLevel.valueTotal();
	var portalOptions = ['Auto Portal Immediately', 'Portal after voids'];
	if (currSettingUniverse === 1 && hze >= 230) portalOptions.push('Portal after voids (poison)');

	autoTrimpSettings.heliumHrPortal.name = function () { return (portalOptions) }
	autoTrimpSettings.dailyHeliumHrPortal.name = function () { return (portalOptions) }
}

function challengeUnlock(challenge, setting, c2) {
	var c2Msg = game.global.universe === 2 ? '3' : '2';
	var msg = "You have unlocked the " + challenge + " challenge.";
	msg += " It has now been added to " + (c2 ? "Challenge " + c2Msg + " AutoPortal setting" : "AutoPortal");
	msg += (setting ? " & there's a setting for it in the AT " + (c2 ? '"C' + c2Msg + '"' : '"Challenges"') + " tab." : '.');
	return msg;
}

MODULES.u1unlocks = [];
MODULES.u2unlocks = [];

function heliumChallengesSetting(hzeCheck, forceUpdate) {
	var hze = game.stats.highestLevel.valueTotal();

	var challenge = ["Off", "Helium Per Hour"];
	if (hze >= 40) challenge.push("Balance");
	if (hze >= 55) challenge.push("Decay");
	if (game.global.prisonClear >= 1) challenge.push("Electricity");
	if (hze > 110) challenge.push("Life");
	if (hze > 125) challenge.push("Crushed");
	if (hze >= 145) challenge.push("Nom");
	if (hze >= 165) challenge.push("Toxicity");
	if (hze >= 180) challenge.push("Watch");
	if (hze >= 180) challenge.push("Lead");
	if (hze >= 190) challenge.push("Corrupted");
	if (hze >= 215) challenge.push("Domination");
	if (hze >= 510) challenge.push('Frigid');
	if (hze >= 600) challenge.push("Experience");
	challenge.push("Custom");
	if (hze >= 65) challenge.push("Challenge 2");

	if (document.getElementById('autoPortal').children.length !== challenge.length || forceUpdate) {
		document.getElementById('autoPortal').innerHTML = '';
		for (var item in challenge) {
			var option = document.createElement("option");
			option.value = challenge[item];
			option.text = challenge[item];
			document.getElementById('autoPortal').appendChild(option);
		}
	}

	var heliumHourChallenges = ["None"];
	if (hze >= 40) heliumHourChallenges.push("Balance");
	if (hze >= 55) heliumHourChallenges.push("Decay");
	if (game.global.prisonClear >= 1) heliumHourChallenges.push("Electricity");
	if (hze > 110) heliumHourChallenges.push("Life");
	if (hze > 125) heliumHourChallenges.push("Crushed");
	if (hze >= 145) heliumHourChallenges.push("Nom");
	if (hze >= 165) heliumHourChallenges.push("Toxicity");
	if (hze >= 180) heliumHourChallenges.push("Watch");
	if (hze >= 180) heliumHourChallenges.push("Lead");
	if (hze >= 190) heliumHourChallenges.push("Corrupted");
	if (hze >= 215) heliumHourChallenges.push("Domination");
	if (hze >= 600) heliumHourChallenges.push("Experience");

	if (((document.getElementById('heliumHourChallenge').children.length || document.getElementById('heliumHourChallenge').children.length)
		< heliumHourChallenges.length) || forceUpdate) {

		document.getElementById('heliumHourChallenge').innerHTML = '';
		for (var item in heliumHourChallenges) {
			var option = document.createElement("option");
			option.value = heliumHourChallenges[item];
			option.text = heliumHourChallenges[item];
			document.getElementById('heliumHourChallenge').appendChild(option);
		}
		document.getElementById('dailyHeliumHourChallenge').innerHTML = document.getElementById('heliumHourChallenge').innerHTML;

		if (hze >= 65) {
			var option = document.createElement("option");
			option.value = 'Challenge 2';
			option.text = 'Challenge 2';
			document.getElementById('dailyHeliumHourChallenge').appendChild(option);
		}
	}

	var challenge2 = ["None"];
	if (getTotalPerkResource(true) >= 30) challenge2.push("Discipline");
	if (hze >= 25) challenge2.push("Metal");
	if (hze >= 35) challenge2.push("Size");
	if (hze >= 40) challenge2.push("Balance");
	if (hze >= 45) challenge2.push("Meditate");
	if (hze >= 60) challenge2.push("Trimp");
	if (hze >= 70) challenge2.push("Trapper");
	if (game.global.prisonClear >= 1) challenge2.push("Electricity");
	if (hze >= 120) challenge2.push("Coordinate");
	if (hze >= 130) challenge2.push("Slow");
	if (hze >= 145) challenge2.push("Nom");
	if (hze >= 150) challenge2.push("Mapology");
	if (hze >= 165) challenge2.push("Toxicity");
	if (hze >= 180) challenge2.push("Watch");
	if (hze >= 180) challenge2.push("Lead");
	if (hze >= 425) challenge2.push("Obliterated");
	if (game.global.totalSquaredReward >= 4500) challenge2.push("Eradicated");

	if (((document.getElementById('heliumC2Challenge').children.length || document.getElementById('dailyC2Challenge').children.length)
		< challenge2.length) || forceUpdate) {
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

	if (Object.keys(MODULES.u1unlocks).length === 0) {
		MODULES.u1unlocks.challenge = challenge;
		MODULES.u1unlocks.heliumHourChallenges = heliumHourChallenges;
		MODULES.u1unlocks.challenge2 = challenge2;
	}

	if (hzeCheck) {
		if (hze === 40) {
			debug(challengeUnlock('Balance', false, false));
		} else if (hze === 55) {
			debug(challengeUnlock('Decay', true, false));
		} else if (hze === 60) {
			debug("Upon unlocking Warpstations's AT has a new settings tab available called 'Buildings'. Here you will find a variety of settings that will help with this new feature.");
		} else if (hze === 65) {
			debug("Due to unlocking Challenge 2's there is now a Challenge 2 option under AutoPortal to be able to auto portal into them. Also you can now access the C2 tab within the AT settings.")
		} else if (hze === 70) {
			debug(challengeUnlock('Trapper', false, true));
			debug("Upon unlocking Geneticist's AT has a new settings tab available called 'Jobs'. Here you will find a variety of settings that will help with this new feature.");
		} else if (game.global.prisonClear >= 1 && !MODULES.u1unlocks.challenge2.includes('Electricity')) {
			debug(challengeUnlock('Electricity', false, true));
		} else if (hze === 110) {
			debug("You can now access the Daily tab within the AT settings. Here you will find a variety of settings that will help optimise your dailies.");
		} else if (hze === 110) {
			debug(challengeUnlock('Life', true, false));
		} else if (hze === 120) {
			debug(challengeUnlock('Coordinate', false, true));
		} else if (hze === 125) {
			debug(challengeUnlock('Crushed'));
		} else if (hze === 130) {
			debug(challengeUnlock('Slow', false, true));
		} else if (hze === 145) {
			debug(challengeUnlock('Nom', false, true));
		} else if (hze === 150) {
			debug(challengeUnlock('Mapology', true, true));
		} else if (hze === 165) {
			debug(challengeUnlock('Toxicity', false, true));
		} else if (hze === 180) {
			debug(challengeUnlock('Watch', false, true));
		} else if (hze === 180) {
			debug(challengeUnlock('Lead', false, true));
		} else if (hze === 190) {
			debug(challengeUnlock('Corrupted', false, true));
		} else if (hze === 215) {
			debug(challengeUnlock('Domination', false, true));
		} else if (hze === 230) {
			debug("Upon unlocking the Dimensional Generator building AT has a new settings tab available called 'Magma'. Here you will find a variety of settings that will help optimise your generator. Additionally there's a new setting in the 'Buildings' tab called 'Advanced Nurseries' that will potentially be of help with the Nursery destruction mechanic.");
		} else if (hze === 236) {
			debug("Upon unlocking Nature AT has a new settings tab available called 'Nature'. Here you will find a variety of settings that will help with this new feature.");
		} else if (hze === 425) {
			debug(challengeUnlock('Obliterated', false, true));
		} else if (game.global.totalSquaredReward >= 4500 && !MODULES.u1unlocks.challenge2.includes('Eradicated')) {
			debug(challengeUnlock('Eradicated', false, true));
		} else if (hze === 510) {
			debug(challengeUnlock('Frigid', false, true));
		} else if (hze === 600) {
			debug(challengeUnlock('Experience', true, false));
		}
	}

	MODULES.u1unlocks.challenge = challenge;
	MODULES.u1unlocks.heliumHourChallenges = heliumHourChallenges;
	MODULES.u1unlocks.challenge2 = challenge2;
}

function radonChallengesSetting(hzeCheck, forceUpdate) {
	var hze = game.stats.highestRadLevel.valueTotal();
	var challenge = ["Off", "Radon Per Hour"];
	if (hze >= 40) challenge.push("Bublé");
	if (hze >= 55) challenge.push("Melt");
	if (hze >= 70) challenge.push("Quagmire");
	if (hze >= 85) challenge.push("Quest");
	if (hze >= 90) challenge.push("Archaeology");
	if (hze >= 100) challenge.push("Mayhem");
	if (hze >= 110) challenge.push("Insanity");
	if (hze >= 135) challenge.push("Nurture");
	if (hze >= 150) challenge.push("Pandemonium");
	if (hze >= 155) challenge.push("Alchemy");
	if (hze >= 175) challenge.push("Hypothermia");
	if (hze >= 200) challenge.push('Desolation');
	challenge.push("Custom");
	if (hze >= 50) challenge.push("Challenge 3");

	if (document.getElementById('autoPortal').children.length !== challenge.length || forceUpdate) {
		document.getElementById('autoPortal').innerHTML = '';
		for (var item in challenge) {
			var option = document.createElement("option");
			option.value = challenge[item];
			option.text = challenge[item];
			document.getElementById('autoPortal').appendChild(option);
		}
	}

	var radonHourChallenges = ["None"];
	if (hze >= 40) radonHourChallenges.push("Bublé");
	if (hze >= 55) radonHourChallenges.push("Melt");
	if (hze >= 70) radonHourChallenges.push("Quagmire");
	if (hze >= 85) radonHourChallenges.push("Quest");
	if (hze >= 90) radonHourChallenges.push("Archaeology");
	if (hze >= 100) radonHourChallenges.push("Mayhem");
	if (hze >= 110) radonHourChallenges.push("Insanity");
	if (hze >= 135) radonHourChallenges.push("Nurture");
	if (hze >= 150) radonHourChallenges.push("Pandemonium");
	if (hze >= 155) radonHourChallenges.push("Alchemy");
	if (hze >= 175) radonHourChallenges.push("Hypothermia");
	if (hze >= 200) radonHourChallenges.push("Desolation");

	if (((document.getElementById('heliumHourChallenge').children.length || document.getElementById('heliumHourChallenge').children.length)
		< radonHourChallenges.length) || forceUpdate) {
		document.getElementById('heliumHourChallenge').innerHTML = '';

		for (var item in radonHourChallenges) {
			var option = document.createElement("option");
			option.value = radonHourChallenges[item];
			option.text = radonHourChallenges[item];
			document.getElementById('heliumHourChallenge').appendChild(option);
		}
		document.getElementById('dailyHeliumHourChallenge').innerHTML = document.getElementById('heliumHourChallenge').innerHTML;

		if (hze >= 50) {
			var option = document.createElement("option");
			option.value = 'Challenge 3';
			option.text = 'Challenge 3';
			document.getElementById('dailyHeliumHourChallenge').appendChild(option);
		}
	}

	var challenge3 = ["None"];
	if (hze >= 15) challenge3.push("Unlucky");
	if (hze >= 20) challenge3.push("Downsize");
	if (hze >= 25) challenge3.push("Transmute");
	if (hze >= 35) challenge3.push("Unbalance");
	if (hze >= 45) challenge3.push("Duel");
	if (hze >= 60) challenge3.push("Trappapalooza");
	if (hze >= 70) challenge3.push("Wither");
	if (hze >= 85) challenge3.push("Quest");
	if (hze >= 105) challenge3.push("Storm");
	if (hze >= 115) challenge3.push("Berserk");
	if (hze >= 175) challenge3.push("Glass");
	if (hze >= 201) challenge3.push("Smithless");

	if (
		((document.getElementById('heliumC2Challenge').children.length || document.getElementById('dailyC2Challenge').children.length)
			< challenge3.length) || forceUpdate) {
		document.getElementById('heliumC2Challenge').innerHTML = '';
		for (var item in challenge3) {
			var option = document.createElement("option");
			option.value = challenge3[item];
			option.text = challenge3[item];
			document.getElementById('heliumC2Challenge').appendChild(option);
		}
		document.getElementById('dailyC2Challenge').innerHTML = document.getElementById('heliumC2Challenge').innerHTML;
	}

	if (Object.keys(MODULES.u2unlocks).length === 0) {
		MODULES.u2unlocks.challenge = challenge;
		MODULES.u2unlocks.radonHourChallenges = radonHourChallenges;
		MODULES.u2unlocks.challenge3 = challenge3;
	}

	if (hzeCheck) {

		//Transmute
		if (hze === 25) {
			debug("You have unlocked the Transmute challenge. Any metal related settings will be converted to wood instead while running this challenge.");
		} //Dailies
		else if (hze === 30) {
			debug("You can now access the Daily tab within the AT settings. Here you will find a variety of settings that will help optimise your dailies.");
		} //Unblance
		else if (hze === 35) {
			debug(challengeUnlock('Unbalance', true, true));
		} //Bublé
		else if (hze === 40) {
			debug(challengeUnlock('Bublé'));
		} //C3, Melt, Worshippers
		else if (hze === 50) {
			//C3
			debug("Due to unlocking Challenge 3's there is now a Challenge 3 option under AutoPortal to be able to auto portal into them. Also you can now access the C3 tab within the AT settings.")
			//Melt
			debug(challengeUnlock('Melt'));
			//Worshippers
			debug("You can now use the Worshipper Farm setting. This can be found in the AT 'Maps' tab.");
		} //Trappapalooza
		else if (hze === 60) {
			debug(challengeUnlock('Trappapalooza', true, true));
		} //Quagmire
		else if (hze === 70) {
			debug(challengeUnlock('Quagmire', true, false));
		} //Wither
		else if (hze === 70) {
			debug(challengeUnlock('Wither', true, true));
		} //Quest
		else if (hze === 85) {
			debug(challengeUnlock('Quest', true, true));
		} //Archaeology
		else if (hze === 90) {
			debug(challengeUnlock('Archaeology', true, false));
		} //Mayhem
		else if (hze === 100) {
			debug(challengeUnlock('Mayhem', true, true));
		} //Storm
		else if (hze === 105) {
			debug(challengeUnlock('Storm', true, true));
		} //Insanity
		else if (hze === 110) {
			debug(challengeUnlock('Insanity', true, false));
		} //Berserk
		else if (hze === 115) {
			debug(challengeUnlock('Berserk'));
		} //Nurture
		else if (hze === 135) {
			debug(challengeUnlock('Nurture', false, false) + " There is also setting for Laboratory's that has been added to AT's AutoStructure setting.");
		} //Pandemonium
		else if (hze === 150) {
			debug(challengeUnlock('Pandemonium', true, true));
		} //Alchemy
		else if (hze === 155) {
			debug(challengeUnlock('Alchemy', true, false));
		} //Hypothermia
		else if (hze === 175) {
			debug(challengeUnlock('Hypothermia', true, false));
		} //Glass
		else if (hze === 175) {
			debug(challengeUnlock('Glass', true, true));
		} //Smithless
		else if (hze === 200) {
			debug(challengeUnlock('Smithless', true, true));
		}
	}
	MODULES.u2unlocks.challenge = challenge;
	MODULES.u2unlocks.radonHourChallenges = radonHourChallenges;
	MODULES.u2unlocks.challenge3 = challenge3;
}

function autoHeirloomOptions() {

	var heirloomOptions = ['None', 'Shields', 'Staffs', 'All'];

	if (currSettingUniverse === 2) {
		var hze = game.stats.highestRadLevel.valueTotal();
		var heirloomTiersAvailable = ['Plagued', 'Radiating'];
		if (hze >= 100) heirloomTiersAvailable.push('Hazardous');
		if (hze >= 200) heirloomTiersAvailable.push('Enigmatic');
	}
	else {
		var hze = game.stats.highestLevel.valueTotal();
		var heirloomTiersAvailable = ['Common', 'Rare'];
		if (hze >= 60) heirloomTiersAvailable.push('Epic');
		if (hze >= 100) heirloomTiersAvailable.push('Legendary');
		if (hze >= 125) heirloomTiersAvailable.push('Magnificent');
		if (hze >= 146) heirloomTiersAvailable.push('Ethereal');
		if (hze >= 230) heirloomTiersAvailable.push('Magmatic');
		if (hze >= 500) heirloomTiersAvailable.push('Plagued');
	}

	if (document.getElementById('heirloomAutoRareToKeep').children.length !== heirloomTiersAvailable.length) {
		document.getElementById('heirloomAutoRareToKeep').innerHTML = '';
		for (var item in heirloomTiersAvailable) {
			var option = document.createElement("option");
			option.value = heirloomTiersAvailable[item];
			option.text = heirloomTiersAvailable[item];
			document.getElementById('heirloomAutoRareToKeep').appendChild(option);
		}
	}

	var heirloomRarity = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
	var heirloomSlots = [1, 2, 3, 3, 3, 4, 4, 5, 5, 6, 6, 7];
	var raretokeep = heirloomRarity.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse));
	var settingsToChange = heirloomSlots[raretokeep];

	var shieldMods = ["Empty"];

	for (var item in game.heirlooms['Shield']) {
		var heirloom = game.heirlooms['Shield'][item];
		if (item == "empty") continue;
		if (typeof heirloom.filter !== 'undefined' && !heirloom.filter()) continue;
		if (heirloom.steps && heirloom.steps[raretokeep] === -1) continue;
		shieldMods.push(heirloomMods['Shield'][item]);
	}

	document.getElementById('heirloomAutoShieldMod1').innerHTML = '';
	for (var item in shieldMods) {
		var option = document.createElement("option");
		option.value = shieldMods[item];
		option.text = shieldMods[item];
		document.getElementById('heirloomAutoShieldMod1').appendChild(option);
	}

	for (var x = 1; x <= settingsToChange; x++) {
		if (x > 1) document.getElementById('heirloomAutoShieldMod' + x).innerHTML = document.getElementById('heirloomAutoShieldMod1').innerHTML;
		if (getPageSetting('heirloomAutoShieldMod' + x, currSettingUniverse) !== "Empty" && shieldMods.indexOf(getPageSetting('heirloomAutoShieldMod' + x, currSettingUniverse)) === -1)
			setPageSetting('heirloomAutoShieldMod' + x, 'Empty', currSettingUniverse);
	}

	var staffMods = ["Empty"];

	for (var item in game.heirlooms['Staff']) {
		var heirloom = game.heirlooms['Staff'][item];
		if (item == "empty") continue;
		if (typeof heirloom.filter !== 'undefined' && !heirloom.filter()) continue;
		if (heirloom.steps && heirloom.steps[raretokeep] === -1) continue;
		staffMods.push(heirloomMods['Staff'][item]);
	}

	document.getElementById('heirloomAutoStaffMod1').innerHTML = '';
	for (var item in staffMods) {
		var option = document.createElement("option");
		option.value = staffMods[item];
		option.text = staffMods[item];
		document.getElementById('heirloomAutoStaffMod1').appendChild(option);
	}

	for (var x = 1; x <= settingsToChange; x++) {
		if (x > 1) document.getElementById('heirloomAutoStaffMod' + x).innerHTML = document.getElementById('heirloomAutoStaffMod1').innerHTML;
		if (getPageSetting('heirloomAutoStaffMod' + x, currSettingUniverse) !== "Empty" && staffMods.indexOf(getPageSetting('heirloomAutoStaffMod' + x, currSettingUniverse)) === -1)
			setPageSetting('heirloomAutoStaffMod' + x, 'Empty', currSettingUniverse);
	}
}

function autoSetValueToolTip(id, text, negative, multi) {
	ranstring = text;
	var value = 'value'
	if (autoTrimpSettings.radonsettings.value === 1 && autoTrimpSettings[id].universe.indexOf(0) === -1) value += 'U2';
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
	if (autoTrimpSettings.radonsettings.value === 1 && autoTrimpSettings[id].universe.indexOf(0) === -1) value += 'U2';
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
	if (autoTrimpSettings.radonsettings.value === 1 && autoTrimpSettings[id].universe.indexOf(0) === -1) value += 'U2';
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
	if (autoTrimpSettings.radonsettings.value === 1 && autoTrimpSettings[id].universe.indexOf(0) === -1) value += 'U2';
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
			if (currSettingUniverse === 2 && settingToCheck.universe.indexOf(0) === -1) selected += 'U2';
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

	//Hide settings
	//Radon
	var radonon = autoTrimpSettings.radonsettings.value == 1;
	var hze = game.stats.highestLevel.valueTotal();
	var highestRadonZone = game.stats.highestRadLevel.valueTotal();
	var legacysettings = autoTrimpSettings.radonsettings.value == 2;
	currSettingUniverse = (autoTrimpSettings.radonsettings.value + 1);
	var displayAllSettings = getPageSetting('displayAllSettings', currSettingUniverse);
	//Update portal challenges
	if (radonon) radonChallengesSetting(false, true);
	else heliumChallengesSetting(false, true);
	HeHrPortalOptions();
	if (atFinishedLoading) autoHeirloomOptions();

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
		document.getElementById("tabBuildings").style.display = !displayAllSettings && (radonon || (!radonon && hze < 60)) ? "none" : "";
	}
	if (document.getElementById("tabDaily") != null) {
		document.getElementById("tabDaily").style.display = !displayAllSettings && ((radonon && highestRadonZone < 30) || (!radonon && hze < 99)) ? "none" : "";
	}
	if (document.getElementById("tabC2") != null) {
		document.getElementById("tabC2").style.display = !displayAllSettings && ((radonon && highestRadonZone < 50) || (!radonon && hze < 65)) ? "none" : "";
	}
	if (document.getElementById("tabSpire") != null) {
		document.getElementById("tabSpire").style.display = radonon || (!displayAllSettings && hze < 190) ? "none" : "";
	}
	if (document.getElementById("tabJobs") != null) {
		document.getElementById("tabJobs").style.display = radonon || (!displayAllSettings && hze < 70) ? "none" : "";
	}
	if (document.getElementById("tabMagma") != null) {
		document.getElementById("tabMagma").style.display = radonon || (!displayAllSettings && hze < 230) ? "none" : "";
	}
	if (document.getElementById("tabNature") != null) {
		document.getElementById("tabNature").style.display = radonon || (!displayAllSettings && hze < 236) ? "none" : "";
	}
	if (document.getElementById("tabChallenges") != null) {
		document.getElementById("tabChallenges").style.display = !displayAllSettings && ((radonon && highestRadonZone < 70) || (!radonon && hze < 55)) ? "none" : "";
	}
	if (document.getElementById("tabLegacy") != null) {
		document.getElementById("tabLegacy").style.display = !legacysettings ? "none" : "";
	}
	if (document.getElementById("tabTest") != null) {
		document.getElementById("tabTest").style.display = getPageSetting('gameUser') !== 'SadAugust' && getPageSetting('gameUser') !== 'Kyotie' && getPageSetting('gameUser') !== 'Test' ? "none" : "";
	}

	for (var setting in autoTrimpSettings) {
		var item = autoTrimpSettings[setting];
		if (item === null || typeof item.id === 'undefined') continue;
		const settingUniverse = item.universe;
		if (!Array.isArray(settingUniverse)) continue;
		if (item.type === 'mazDefaultArray') continue;
		else if (settingUniverse.indexOf(currSettingUniverse) !== -1 || settingUniverse.indexOf(0) !== -1) {
			turnOn(setting, radonon);
		} else {
			turnOff(setting)
		};

		//Skips items not from the universe settings we're looking at. Has to be here so that they're disabled when swapping universe settings.
		if (settingUniverse.indexOf(currSettingUniverse) === -1 && settingUniverse.indexOf(0) === -1)
			continue;

		if (initialLoad) {
			var elem = document.getElementById(item.id);


			if (item.type === 'boolean') {
				var itemEnabled = item.enabled;
				if (radonon && settingUniverse.indexOf(0) === -1) itemEnabled = item['enabled' + 'U2'];
				elem.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + itemEnabled);
				elem.setAttribute("onmouseover", 'tooltip(\"' + item.name() + '\", \"customText\", event, \"' + item.description() + '\")');

				elem.innerHTML = item.name();
			}
			else if (item.type == 'value' || item.type == 'valueNegative' || item.type == 'multitoggle' || item.type == 'multiValue' || item.type == 'textValue') {
				var itemValue = item.value;
				if (radonon && settingUniverse.indexOf(0) === -1) itemValue = item['value' + 'U2'];
				if (elem != null) {
					if (item.type == 'multitoggle') {
						elem.innerHTML = item.name()[itemValue];
						elem.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + itemValue);
					}
					else if (item.type == 'textValue' && typeof itemValue !== 'undefined' && itemValue.substring !== undefined) {
						if (itemValue.length > 18)
							elem.innerHTML = item.name() + ': ' + itemValue.substring(0, 21) + '...';
						else
							elem.innerHTML = item.name() + ': ' + itemValue.substring(0, 21);
					}
					else if (item.type == 'multiValue') {
						if (Array.isArray(itemValue) && itemValue.length == 1 && itemValue[0] == -1)
							elem.innerHTML = item.name() + ': ' + "<span class='icomoon icon-infinity'></span>";
						else if (Array.isArray(itemValue))
							elem.innerHTML = item.name() + ': ' + itemValue[0] + '+';
						else
							elem.innerHTML = item.name() + ': ' + itemValue;
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
				//Updating input box & text that will be displayed upon saving!
				if (item.type === 'value' || item.type === 'multiValue' || item.type === 'valueNegative') elem.setAttribute("onclick", `autoSetValueToolTip("${item.id}", "${item.name()}", ${item.type == 'valueNegative'}, ${item.type == 'multiValue'})`);
				if (item.type === 'textValue') elem.setAttribute("onclick", `autoSetTextToolTip("${item.id}", "${item.name()}", ${item.type == 'textValue'})`);
			}
		}
	}

	document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + getPageSetting('autoMaps'));
	if (!initialLoad) modifyParentNodeUniverseSwap();

	if (document.getElementById('Prestige').selectedIndex > 11 && !game.global.slowDone) {
		document.getElementById('Prestige').selectedIndex = 11;
		autoTrimpSettings.Prestige.selected = "Bestplate";
	}
}

function settingUniverse(setting) {
	if (setting === 'buyBuildings') {
		return getPageSetting('buildingsType', currPortalUniverse);
	}
	if (setting === 'equipOn') {
		return getPageSetting('equipOn', currPortalUniverse);
	}
	if (setting === 'autoJobs') {
		return getPageSetting('jobType', currPortalUniverse);
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


	//Cogwheel info
	atJobContainer.setAttribute("style", "display: block; font-size: 0.9vw; border-color: #5D5D5D;");
	atJobContainer.setAttribute('class', 'toggleConfigBtn pointer noselect autoUpgradeBtn settingBtn' + (jobSetting === 2 ? 3 : jobSetting));
	atJobContainer.setAttribute("onmouseover", 'tooltip(\"Toggle AutoJobs\", \"customText\", event, autoTrimpSettings.jobType.description())');
	atJobContainer.setAttribute("onmouseout", 'tooltip("hide")');

	//Text
	var atJobText = document.createElement("DIV");
	atJobText.innerHTML = autoTrimpSettings.jobType.name()[jobSetting];
	atJobText.setAttribute("id", "autoJobLabel");
	atJobText.setAttribute("onClick", "settingChanged('jobType', true)");

	//Creating cogwheel & linking onclick
	var atJobSettings = document.createElement("DIV");
	atJobSettings.setAttribute('onclick', 'MAZLookalike("Configure AT AutoJobs", "a", "AutoJobs")');
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
	atStructureContainer.setAttribute("onmouseover", 'tooltip(\"Toggle AutoStructure\", \"customText\", event, autoTrimpSettings.buildingsType.description())');
	atStructureContainer.setAttribute("onmouseout", 'tooltip("hide")');

	//Text
	var atStructureText = document.createElement("DIV");
	atStructureText.innerHTML = 'AT AutoStructure';
	atStructureText.setAttribute("id", "autoStructureLabel");
	atStructureText.setAttribute("onClick", "settingChanged('buildingsType', true)");

	//Creating cogwheel & linking onclick
	var atStructureSettings = document.createElement("DIV");
	atStructureSettings.setAttribute('onclick', 'MAZLookalike("Configure AT AutoStructure", "a", "AutoStructure")');
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
	const resource = game.global.universe === 2 ? 'Radon' : 'Helium';
	var a = "";
	if (challengeActive('Daily')) {
		var b = game.stats.heliumHour.value() / (game.global['total' + resource + 'Earned'] - (game.global[resource.toLowerCase() + 'Leftover'] + game.resources[resource.toLowerCase()].owned));
		b *= 100 + getDailyHeliumValue(countDailyWeight()),
			a = "<b>After Daily " + resourceHr + "\/Hr: " + b.toFixed(3) + "%"
	} return a
}

function toggleAutoMaps() {

	if (getPageSetting('autoMaps'))
		setPageSetting('autoMaps', 0)
	else
		setPageSetting('autoMaps', 1)

	document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + getPageSetting('autoMaps'));

	saveSettings();
}

function toggleHeHr(update) {
	if (update) {
		if (getPageSetting('displayHeHr'))
			document.getElementById('hiderStatus').parentNode.style = 'display: block; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);'
		else
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
	if (autoTrimpSettings["ATversion"] !== undefined && autoTrimpSettings["ATversion"].includes('SadAugust') && autoTrimpSettings["ATversion"] === MODULES_AT.ATversion) return;
	var changelog = [];

	if (autoTrimpSettings["ATversion"] === undefined || !autoTrimpSettings["ATversion"].includes('SadAugust')) {

		var description = "<p>Welcome to the SadAugust fork of AutoTrimps!</p>";

		description += "<p><b>For those who are new to this fork here's some useful information on how to set it up.</b></p><br>";

		description += "<p>One of the most important things is where the settings are stored. The vast majority of settings can be accessed by pressing the <b>AutoTrimps</b> button at the bottom of your Trimps window.</p><br>";
		description += "<p>There are some setting that aren't located in the <b>AutoTrimps settings menu</b>, 2 of which are in the Trimps buy container (<b>AT AutoStructure & AutoJobs</b>), I recommend mousing over their tooltips and looking at what they do.</p>";
		description += "<p>The last one placed elsewhere is the <b>AT Messages</b> button at the top right of your Trimps window. This will enabling this will allow the script to output messages into the message log window. You can control what gets printed to it by pressing the cogwheel to the right of it.</p>";

		description += "<br><p>By default everything should be disabled but every setting has a detailed description and recommendation of how it should be setup. To start with I'd highly recommend looking through the settings in the <b>Core</b>, <b>Maps</b> and <b>Combat</b> tabs to identify which parts of the script you would like to use and go through the other tabs afterwards.</p>";

		description += "<br><p>If you've previously used somebody elses AutoTrimps version you'll need to set everything up again as this isn't compatible with other forks. The settings are stored differently so you can easily go back and forth between other forks.</p>";

		changelog.push(description);
		printChangelog(changelog);
	}

	if (autoTrimpSettings["ATversion"] !== undefined && autoTrimpSettings["ATversion"].includes('SadAugust')
		&& autoTrimpSettings["ATversion"] !== MODULES_AT.ATversion
	) {

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
			changelog.push("With Antennas/Meteorologists increasing wood gain in 5.9.0 I've added a job ratio input for the HD Farm setting to allow for more user control of equip farming. Was previously Set to '0,0,1' if you want to use the same setting as before.");
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

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.1.5') {
			changelog.push("Integrated checks for heirloom swapping into hp/dmg calcs so HD Ratios will now account for your world/map/void heirlooms and not cause issues with map stacking and the like.<br>\
			Fixed some issues with equip purchasing, setting for daily in previous universe & challenge calc bugfixes.<br>\
			Adjusted the 'Repeat Count' setting for Map Farm to allow for an input of '-1' which will set the repeat count to Infinity.<br>\
			Added a new setting for Desolation which will ignore farming caches and purely go for the max map level you can survive several hits on to speed up the destacking process in later zones.<br>\
			Implemented a new status tooltip that is very similar to Psycho-Rays as it seemed beneficial to allow the user to see more information rather than keeping it all stored in the background.<br>\
			")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.1.6') {
			changelog.push("Changed the way setting lines are being picked so if there's any issues let me know!<br>\
			Map Farm now has farm type options for Portal Time & Daily Reset time! For more info click the Help button at the bottom of the setting window.<br>\
			Void Map settings now has a 'Max Tenacity' toggle once the perk has been unlocked which makes the World & Void HD Ratio inputs  assume max tenacity.<br>\
			HD Ratio values will now factor in the type of shield that will be equipped when heirloom swapping is enabled so the value won't change when going between world/maps/voids.<br>\
			Quest, Void Map, Desolation, calc and perky bugfixes.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.1.7') {
			var tempSettings = JSON.parse(localStorage.getItem('autoTrimpSettings'));
			if (tempSettings.heirloomResourceStaff !== undefined)
				autoTrimpSettings['heirloomStaffResource'].valueU2 = tempSettings.heirloomResourceStaff.valueU2;
			autoTrimpSettings['hitsSurvived'].value = 0;
			autoTrimpSettings['hitsSurvived'].valueU2 = 0;

			changelog.push("Have added the 'Hits Survived' setting back into AT. Should properly work in both universes but it hasn't been fully tested in U2 so I've disabled it for everybody but if you want to use it set the value to anything higher than 0.<br>\
				Further changed how auto heirlooms interacts with HD Ratios so if there's any bugs let me know.<br>\
				Added a new setting for which staff you'd like to run whilst in void maps.<br>\
				Void Maps setting now has a toggle that will use a bone charge when you enter your first void map.<br>\
				Minor early U1 & U2 optimisations.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.1.8') {
			var tempSettings = JSON.parse(localStorage.getItem('autoTrimpSettings'));
			if (tempSettings.dailyPortalSettingsArray.valueU2 !== undefined)
				delete autoTrimpSettings.dailyPortalSettingsArray.valueU2.value;

			changelog.push("Have rewritten all of the AutoJobs, AutoStructure, Daily Portal Modifier help windows.<br>\
			Rewrote how the daily portal modifier settings are stored to make it usable in U1 and to implement the new U2 mods so there's a good chance any U2 settings will be lost. Sorry about that!")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.0') {
			var tempSettings = JSON.parse(localStorage.getItem('autoTrimpSettings'));
			if (tempSettings !== null) {
				safeSetItems('atSettings', serializeSettings());
				if (localStorage.atSettings !== null) {
					delete localStorage.autoTrimpSettings;
					console.log("Deleted old localStorage file so different forks can be used alongside this one!");
				}
				else return "Error with localStorage conversion. Please inform me asap!";
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.0') {
			changelog.push("Added an alternative to C2/C3 Runner % input, there's now a toggle to swap it to set end zone values where it'll start a run when beneath that value.<br>\
			Added heirloom swapping settings for Mayhem, Pandemonium, and Desolation.<br>\
			Void Map 'Max Tenacity' setting has been renamed 'Max Map Bonus' and now factors in both max map bonus & max tenacity.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.1') {
			var tempSettings = JSON.parse(localStorage.getItem('atSettings'));
			if (tempSettings.spamMessages !== undefined)
				autoTrimpSettings['spamMessages'].value.map_Destacking = tempSettings.spamMessages.value.map_Details;
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.2') {
			changelog.push("Have introduced a mutator preset saving & respeccing system. There's a new setting in the 'Core' tab that will swap your preset when portaling.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.3') {
			var tempSettings = JSON.parse(localStorage.getItem('atSettings'));
			if (tempSettings.c2RunnerSettings !== undefined) {
				autoTrimpSettings['c2RunnerSettings'].value = {};
				autoTrimpSettings['c2RunnerSettings'].valueU2 = {};
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.4') {
			for (var x = 1; x < 8; x++) {
				autoTrimpSettings['heirloomAutoStaffMod' + x].selected = 'Empty';
				autoTrimpSettings['heirloomAutoStaffMod' + x].selectedU2 = 'Empty';
				autoTrimpSettings['heirloomAutoShieldMod' + x].selected = 'Empty';
				autoTrimpSettings['heirloomAutoShieldMod' + x].selectedU2 = 'Empty';
			}
			for (var x = 1; x < 5; x++) {
				autoTrimpSettings['heirloomAutoCoreMod' + x].selected = 'Empty';
			}

			changelog.push("Have rewritten the auto heirlooms code to work as it should have to begin with. Will check if the heirloom can have all the mods you have selected and if it does then store it in your heirloom inventory.<br>\
			'Rarity to Keep' setting now only shows the heirlooms available for your current HZE & settings universe.<br>\
			The heirloom mods section has been reworked to display the actual modifier names rather than the internal names and also only display the mods available for that heirloom tier so I've had to reset everybodys settings for auto heirlooms back to their defaults.<br>\
			The Core heirloom type is now hidden in U2 and until you hit a HZE of 200 in U1")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.5') {
			var tempSettings = JSON.parse(localStorage.getItem('atSettings'));
			if (tempSettings.presetMutations !== undefined) {
				var mutatorObj = {
					preset1: {},
					preset2: {},
					preset3: {},
				};
				if (tempSettings.presetMutations.value.preset1 !== '') mutatorObj.preset1 = JSON.parse(tempSettings.presetMutations.value.preset1);
				if (tempSettings.presetMutations.value.preset2 !== '') mutatorObj.preset2 = JSON.parse(tempSettings.presetMutations.value.preset2);
				if (tempSettings.presetMutations.value.preset3 !== '') mutatorObj.preset3 = JSON.parse(tempSettings.presetMutations.value.preset3);

				autoTrimpSettings['mutatorPresets'].valueU2 = JSON.stringify(mutatorObj);
				localStorage['mutatorPresets'] = JSON.stringify(mutatorObj);
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.6') {
			var tempSettings = JSON.parse(localStorage.getItem('atSettings'));
			if (tempSettings.c2RunnerSettings !== undefined) {
				autoTrimpSettings['onlyminmaxworld'].value = 2;
			}
			autoTrimpSettings['spamMessages'].value.map_Skip = false;
			autoTrimpSettings['spamMessages'].value.stance = false;
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.7') {
			var tempSettings = JSON.parse(localStorage.getItem('atSettings'));
			autoTrimpSettings['avoidEmpower'].value = tempSettings.avoidempower.value;
			autoTrimpSettings['buyheliumy'].valueU2 = tempSettings.buyradony.valueU2;


			autoTrimpSettings['heHrDontPortalBefore'].value = tempSettings.HeHrDontPortalBefore.value;
			autoTrimpSettings['heHrDontPortalBefore'].valueU2 = tempSettings.HeHrDontPortalBefore.valueU2;
			autoTrimpSettings['heliumHrBuffer'].value = tempSettings.HeliumHrBuffer.value;
			autoTrimpSettings['heliumHrBuffer'].valueU2 = tempSettings.HeliumHrBuffer.valueU2;
			autoTrimpSettings['heliumHrPortal'].value = tempSettings.HeliumHrPortal.value;
			autoTrimpSettings['heliumHrPortal'].valueU2 = tempSettings.HeliumHrPortal.valueU2;
			autoTrimpSettings['pauseScript'].enabled = tempSettings.PauseScript.enabled;
			autoTrimpSettings['autoEggs'].enabled = tempSettings.AutoEggs.enabled;

			autoTrimpSettings['avoidEmpower'].enabled = tempSettings.avoidempower.enabled;
			autoTrimpSettings['buyheliumy'].valueU2 = tempSettings.buyradony.valueU2;

			autoTrimpSettings['firstGigastation'].value = tempSettings.FirstGigastation.value;
			autoTrimpSettings['deltaGigastation'].value = tempSettings.DeltaGigastation.value;
			autoTrimpSettings['autoGigas'].value = tempSettings.AutoGigas.enabled;
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.8') {
			var tempSettings = JSON.parse(localStorage.getItem('atSettings'));
			if (tempSettings.spamMessages !== undefined)
				autoTrimpSettings['spamMessages'].value.run_Stats = false;
		}

		autoTrimpSettings["ATversion"] = MODULES_AT.ATversion;
		if (changelog.length !== 0) {
			printChangelog(changelog);
			verticalCenterTooltip(false, true);
		}
		saveSettings();
	}

	autoTrimpSettings["ATversion"] = MODULES_AT.ATversion;
	saveSettings();
}