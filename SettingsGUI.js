//Creates a new div element, gives it an id, sets the style to display:none, and then appends it to the settingsRow div.
//Div for the settings menu
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

function createTabs(tabName, tabDescription, addTabsDiv, addtabsUL) {
	var c = document.createElement("li"),
		d = document.createElement("a");
	(d.className = "tablinks"),
		d.setAttribute("onclick", "toggleTab(event, '" + tabName + "')"),
		(d.href = "#"), d.appendChild(document.createTextNode(tabName)),
		d.style.fontSize = "1vw",
		(c.id = "tab" + tabName),
		c.appendChild(d),
		addtabsUL.appendChild(c),
		createTabContents(tabName, tabDescription, addTabsDiv);
}

function createTabContents(tabName, tabDescription, addTabsDiv) {
	var elem = document.createElement("div");
	(elem.className = "tabcontent"), (elem.id = tabName);
	var d = document.createElement("div");
	d.setAttribute("style", "margin-left: 1vw; margin-right: 1vw;");
	var e = document.createElement("h4");
	e.setAttribute("style", "font-size: 1.2vw;"), e.appendChild(document.createTextNode(tabDescription)), d.appendChild(e), elem.appendChild(d), addTabsDiv.appendChild(elem);
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
		if (a[b].id.toLowerCase() === 'test') continue;
		a[b].style.display = "block";
	}
	for (var d = document.getElementsByClassName("tablinks"), b = 0, c = d.length; b < c; b++) {
		if (d[b].id.toLowerCase() === 'test') continue;
		(d[b].style.display = "block"), d[b].className.includes(" active") || (d[b].className += " active");
	}
}

function initializeAllTabs() {
	var addTabsDiv;
	var addtabsUL;

	addTabsDiv = document.createElement('div');
	addtabsUL = document.createElement('ul');
	addtabsUL.className = "tab";
	addtabsUL.id = 'autoTrimpsTabBarMenu';
	addtabsUL.style.display = "none";
	var sh = document.getElementById("settingsRow");
	sh.insertBefore(addtabsUL, sh.childNodes[2]);
	createTabs("Core", "Core - Main Controls for the script", addTabsDiv, addtabsUL);
	createTabs("Buildings", "Building Settings", addTabsDiv, addtabsUL);
	createTabs("Jobs", "Geneticassist Settings", addTabsDiv, addtabsUL);
	createTabs("Equipment", "Equipment Settings", addTabsDiv, addtabsUL);
	createTabs("Maps", "Maps - AutoMaps & VoidMaps Settings", addTabsDiv, addtabsUL);
	createTabs("Spire", "Spire - Settings for Spires", addTabsDiv, addtabsUL);
	createTabs("Daily", "Dailies - Settings for Dailies", addTabsDiv, addtabsUL);
	createTabs("C2", "C2 - Settings for C2s", addTabsDiv, addtabsUL);
	createTabs("Challenges", "Challenges - Settings for Specific Challenges", addTabsDiv, addtabsUL);
	createTabs("Combat", "Combat & Stance Settings", addTabsDiv, addtabsUL);
	createTabs("Magma", "Dimensional Generator & Magmite Settings", addTabsDiv, addtabsUL);
	createTabs("Heirlooms", "Heirloom Settings", addTabsDiv, addtabsUL);
	createTabs("Golden", "Golden Upgrade Settings", addTabsDiv, addtabsUL);
	createTabs("Nature", "Nature Settings", addTabsDiv, addtabsUL);
	createTabs("Time Warp", "Time Warp Settings", addTabsDiv, addtabsUL);
	createTabs("Display", "Display & Spam Settings", addTabsDiv, addtabsUL);
	createTabs("Import Export", "Import & Export Settings", addTabsDiv, addtabsUL);
	createTabs("Test", "Basic testing functions - Should never be seen by users", addTabsDiv, addtabsUL);
	createTabs("Legacy", "Legacy Settings. Will be removed every major patch cycle.", addTabsDiv, addtabsUL);
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
		createSetting('downloadSaves',
			function () { return ('Download Saves') },
			function () { return ('Will automatically download saves whenever AutoTrimps portals.') },
			'boolean', false, null, 'Core', [1, 2]);
		createSetting('portalVoidIncrement',
			function () { return ('Liq for free Void') },
			function () {
				var description = "<p>Delays auto portaling into your preferred run and repeatedly does U1 portals until your bone void counter is 1 drop away from a guaranteed extra void map.</p>";
				if (currSettingUniverse !== 1) description += "<p><b>Recommended:</b> On</p>";
				else description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Core', [0],
			function () { return (game.permaBoneBonuses.voidMaps.owned >= 5 && checkLiqZoneCount() >= 20) });
		createSetting('autoPerks',
			function () { return ('Auto Allocate Perks') },
			function () {
				var description = "<p>Uses a basic version of " + (currSettingUniverse === 2 ? "Surky" : "Perky") + ". If you want more advanced settings import your save into " + (currSettingUniverse === 2 ? "Surky" : "Perky") + ".</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [1, 2]);

		createSetting('autoCombatRespec',
			function () { return (['Atlantrimp Respec Off', 'Atlantrimp Respec Popup', 'Atlantrimp Respec Force']) },
			function () {
				var trimple = currSettingUniverse === 1 ? "<b>Trimple of Doom</b>" : "<b>Atlantrimp</b>";

				var description = "<p><b>Atlantrimp Respec Off</b><br>Disables this setting.</p>";

				description += "<p><b>Atlantrimp Respec Popup</b><br>Will display a popup after complete " + trimple + " asking whether you would like to respec into a combat spec.</p>";

				description += "<p><b>Atlantrimp Respec Force</b><br>5 seconds after completing " + trimple + " will respec into the Surky <b>Radon Combat Respec</b> preset to maximise combat stats. Has a popup that allows you to disable the respec if clicked within the 5 second window.</p>";

				description += "<p>Won't be worthwhile using without having <b>Auto Allocate Perks</b> enabled as your next run would be started with the combat respec.</p>";
				description += "<p>Will respec into the <b>Combat Respec</b> preset when running " + c2Description() + ".</p>";
				description += "<p>Will only run when <b>Liq for free Void</b> is enabled and will go back to U1 when a respec isn't available at the end of a run.</p>";

				description += "<p><b>Recommended:</b> Atlantrimp Respec Off</p>";
				return description
			},
			'multitoggle', [0], null, 'Core', [2]);

		createSetting('presetSwap',
			function () { return ('Preset Swapping') },
			function () {
				var description = "<p>Will automatically swap Surky presets when portaling into runs.</p>";
				description += "<p>Fillers (non daily/" + cinf() + " runs) will load <b>'Easy Radon Challenge</b>'</p>";
				description += "<p>Dailies will load <b>'Difficult Radon Challenge</b>'</p>";
				description += "C3s or Mayhem-like challenges will load <b>'Push/C3/Mayhem</b>'.</p>";
				description += "Challenges that have a dedicated preset will be loaded when starting that challenge.</p>";
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
				var c2setting = currSettingUniverse === 2 ? "Challenge 3" : "Challenge 2";
				var specialChall = "Special challenges (" + (currSettingUniverse === 2 ? "Mayhem, Pandemonium, Desolation" : "Frigid, Experience") + ") are run with this.";
				var description = "<p>Will automatically portal into different challenges depending on the way you setup the AutoPortal related settings.</p>";
				description += "<p><b>" + resource() + " Challenges will appear here when they've been unlocked in the game.</b></p>";
				description += "<p>Additional settings appear when <b>" + resource() + " Per Hour</b> or <b>Custom</b> are selected.</p>";
				description += "<p><b>Off</b><br>Disables this setting.</p>";
				description += "<p><b>" + resource() + " Per Hour</b><br>Portals into new runs when your " + resourceHour().toLowerCase() + "/hr goes below your current runs best " + resourceHour().toLowerCase() + "/hr.";
				description += " There is a <b>Buffer</b> setting, which lowers the check from best " + resourceHour().toLowerCase() + "/hr to (best - buffer setting) " + resourceHour().toLowerCase() + "/hr.</p>";
				description += "<p><b>Specific Challenges</b><br>If a specific challenge has been selected it will automatically portal into it when you don't have a challenge active.</p>";
				description += "<p><b>Custom</b><br>Will portal into the challenge selected in the <b>Challenge</b> setting at the zone specified in the <b>Portal Zone</b> setting.</p>";
				if (game.stats.highestLevel.valueTotal() >= 65) description += "<p><b>" + c2setting + "</b><br>Will portal into the challenge selected in the <b>" + c2setting + "</b> setting at the zone specified in the <b>Finish " + cinf() + "</b> setting in the " + cinf() + " settings tab.<br>" + specialChall + "</p>";
				description += "<p><b>Recommended:</b> " + (currSettingUniverse === 2 ? "Custom with a specified endzone to use the Scruffy 3 ability" : "Specific challenges until you reach zone 230 then " + resource() + " Per Hour") + "</p>";
				return description;
			}, 'dropdown', 'Off', function () { return autoPortalChallenges() }, 'Core', [1, 2]);

		createSetting('heliumHourChallenge',
			function () { return ('Challenge') },
			function () {
				var description = "<p>Automatically portal into this challenge when using the <b>" + resource() + " Per Hour</b> or <b>Custom</b> AutoPortal settings.</p>";
				description += "<p><b>" + resource() + " challenges will appear here when they've been unlocked in the game.</b></p>";
				description += "<p><b>Recommended:</b> Last challenge available</p>";
				return description;
			}, 'dropdown', 'None', function () { return heliumHourChallenges() }, 'Core', [1, 2],
			function () {
				return (
					getPageSetting('autoPortal', currSettingUniverse).includes('Hour') || getPageSetting('autoPortal', currSettingUniverse) === 'Custom');
			});
		createSetting('heliumC2Challenge',
			function () { return ('Challenge') },
			function () {
				var description = "<p>Automatically portal into this C" + cinf()[1] + " when using the <b>Challenge" + cinf()[1] + "</b> AutoPortal setting.</p>";
				description += "<p><b>C" + cinf()[1] + " challenges will appear here when they've been unlocked in the game.</b></p>";
				description += "<p><b>Must end the challenges with the <b>Finish " + cinf() + "</b> setting in the <b>" + cinf() + "</b> tab if you want the run to end.</b>";
				description += "<p><b>Recommended:</b> The C" + cinf()[1] + " you want to run</p>";
				return description;
			}, 'dropdown', 'None', function () { return heliumC2Challenges() }, 'Core', [1, 2],
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
			function () {
				var hze = game.stats.highestLevel.valueTotal();
				var portalOptions = ['Auto Portal Immediately', 'Portal after voids'];
				if (currSettingUniverse === 1 && hze >= 230) portalOptions.push('Portal after voids (poison)');
				return portalOptions;
			},
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

		createSetting('heliumHrExitSpire',
			function () { return ('Exit Spires for Voids') },
			function () {
				var description = "<p>If enabled will automatically exit Spires to run your voids earlier.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [1],
			function () { return (getPageSetting('autoPortal', currSettingUniverse).includes('Hour') && game.stats.highestLevel.valueTotal() >= 170) });

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

	//Daily -- General+U2+Portal+Spire descriptions done! Still need to finish U1 settings for Windstacking.
	const displayDaily = true
	if (displayDaily) {
		createSetting('buyheliumy',
			function () {
				return ('Buy ' + (currSettingUniverse === 2 ? "Radonculous" : "Heliumy") + ' %')
			},
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
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
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
				description += "<p><b>Recommended:</b> Second to last Spire you reach on your runs</p>";
				return description;
			}, 'value', -1, null, 'Daily', [1]);
		createSetting('dExitSpireCell',
			function () { return ('Daily Exit Spire Cell') },
			function () {
				var description = "<p>Will exit out of active Spires upon clearing this cell.</p>";
				description += "<p><b>Works based off cell number so if you want it to exit after Row #4 then set to 40.</b></p>";
				description += "<p>Any health or damage calculations for the Spire will be based off this if set.</p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> -1</p>";
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
				description += "<p><b>Recommended:</b> On</p>";
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
				var c2setting = currSettingUniverse === 2 ? "Challenge 3" : "Challenge 2";
				var c2setting_Daily = currSettingUniverse === 2 ? "DP 3" : "DP 2";
				var specialChall = "Special challenges (" + (currSettingUniverse === 2 ? "Mayhem, Pandemonium, Desolation" : "Frigid, Experience") + ") are run with this.";

				var description = "<p>Automatically portal into this challenge after dailies when using the <b>DP: " + resourceHour() + "/Hr</b> or <b>DP: Custom</b> Daily AutoPortal settings.</p>";
				description += "<p><b>" + resource() + " challenges will appear here when they've been unlocked in the game.</b></p>";

				if (game.stats.highestLevel.valueTotal() >= 65) description += "<p><b>" + c2setting + "</b><br>Will portal into the challenge selected in the <b>" + c2setting_Daily + "</b> setting at the zone specified in the <b>Finish " + cinf() + "</b> setting in the " + cinf() + " settings tab.<br>" + specialChall + "</p>";


				description += "<p><b>Recommended:</b> Last challenge available</p>";
				return description;
			}, 'dropdown', 'None', function () { return heliumHourChallenges(true) }, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) > 0) });

		createSetting('dailyC2Challenge',
			function () { return ('DP: ' + cinf()) },
			function () {
				var description = "<p>Automatically portal into this C" + cinf()[1] + " when using the <b>Challenge" + cinf()[1] + "</b> DP: Challenge setting.</p>";
				description += "<p><b>C" + cinf()[1] + " challenges will appear here when they've been unlocked in the game.</b></p>";
				description += "<p><b>Must end the challenges with the <b>Finish " + cinf() + "</b> setting in the <b>" + cinf() + "</b> tab if you want the run to end.</b>";
				description += "<p><b>Recommended:</b> The C" + cinf()[1] + " you want to run</p>";
				return description;
			}, 'dropdown', 'None', function () { return heliumC2Challenges() }, "Daily", [1, 2],
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
			function () {
				var hze = game.stats.highestLevel.valueTotal();
				var portalOptions = ['Auto Portal Immediately', 'Portal after voids'];
				if (currSettingUniverse === 1 && hze >= 230) portalOptions.push('Portal after voids (poison)');
				return portalOptions;
			},
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

		createSetting('dailyHeliumHrExitSpire',
			function () { return ('Exit Spires for Voids') },
			function () {
				var description = "<p>If enabled will automatically exit Spires to run your voids earlier.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) === 1 && game.stats.highestLevel.valueTotal() >= 170) });

		createSetting('dailyPortalFiller',
			function () { return ('Filler run') },
			function () {
				var description = "<p>Will run a filler (non daily/" + cinf() + " runs) challenge (selected in DP: Challenge) inbetween dailies.</p>";
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
				var description = "<p>Use this to make the script skip specific dailies when starting runs.</p>";
				description += "<p>Must be input with same format as the game uses which is <b>'YEAR-MONTH-DAY'.</b></p>"
				description += "<p>An example of an input would be <b>'2023-04-22'.</b></p>"
				description += "<p>Can have multiple inputs, seperate by commas.</p>"
				return description;
			},
			'multiTextValue', [0], null, 'Daily', [1, 2]);

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
			}, 'infoclick', 'c2table', null, 'C2', [0]);

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
				var description = "<p>Buys the Sharp Trimps bonus for <b>25 bones</b> during " + c2Description() + " runs.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1, 2]);
		createSetting('c2GoldenMaps',
			function () { return (cinf() + ' Golden Maps') },
			function () {
				var description = "<p>Buys the Golden Maps bonus for <b>20 bones</b> during " + c2Description() + " runs.</p>";
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
			function () {
				return (getPageSetting('c2RunnerStart', currSettingUniverse) && getPageSetting('c2RunnerMode', currSettingUniverse) === 1)
			});

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
			}, 'dropdown', 'Bootboost', function () {
				var equips = ['Off', 'Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate'];
				if (game.global.slowDone) {
					equips.push('Harmbalest')
					equips.push('GambesOP')
				}
				return equips;
			}, 'C2', [1],
			function () { return (getPageSetting('mapology', currSettingUniverse) && autoTrimpSettings.mapology.require()) });

		//Experience
		createSetting('experience',
			function () { return ('Experience') },
			function () {
				var description = "<p>Enable this if you want to use Experience wonder farming features.</p>";
				description += "<p>This setting is dependant on using <b>Bionic Raiding</b> in conjunction with it if you want your ending Bionic Wonderland to be higher than 605. If you do you'll need to raid past bw 605 before z601.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'C2', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 600) });
		createSetting('experienceStartZone',
			function () { return ('E: Start Zone') },
			function () {
				var description = "<p>The zone you would like to start mapping for wonders at.</p>";
				description += "<p>If set below 300 it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 500 to start and lower over time</p>";
				return description;
			},
			'value', -1, null, 'C2', [1],
			function () { return (autoTrimpSettings.experience.enabled) });
		createSetting('experienceEndZone',
			function () { return ('E: End Zone') },
			function () {
				var description = "<p>'Will run the Bionic Wonderland map level specified in <b>E: End BW</b> at this zone.</p>";
				description += "<p>If set below 601 it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 605 to start and increase over time</p>";
				return description;
			}, 'value', -1, null, 'C2', [1],
			function () { return (autoTrimpSettings.experience.enabled) });
		createSetting('experienceEndBW',
			function () { return ('E: End BW') },
			function () {
				var description = "<p>Will finish the challenge with this Bionic Wonderland level once reaching the end zone specified in <b>E: End Zone</b>.</p>";
				description += "<p><b>If the specified BW is not available, it will run one closest to the setting.</b></p>";
				description += "<p><b>Recommended:</b> 605 to start and increase over time</p>";
			}, 'value', -1, null, 'C2', [1],
			function () { return (autoTrimpSettings.experience.enabled) });

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
			}, 'value', 6, null, 'C2', [2],
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

		//Duel
		createSetting('duel',
			function () { return ('Duel') },
			function () {
				var description = "<p>Enable this to setup Duel features.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 45) });
		createSetting('duelHealth',
			function () { return ('D: Force x10 Health') },
			function () {
				var description = "<p>Enable this to have the script suicide on Duel by setting equality to 0 when you don't have the 10x trimp health buff.</p>";
				description += "<p>Will only work if the <b>Auto Equality</b> setting is set to <b>Auto Equality: Advanced</b>."
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (getPageSetting('duel', currSettingUniverse) && autoTrimpSettings.duel.require()) });
		createSetting('duelShield',
			function () { return ('D: Shield') },
			function () {
				var description = "<p>The name of the shield you would like to equip while running Duel.</p>";
				description += "<p>This will override all other heirloom swapping features and only use this shield during Duel!</p>"
				description += "<p>Should ideally be a shield without the <b>Crit Chance</b> modifier.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'C2', [2],
			function () { return (getPageSetting('duel', currSettingUniverse) && autoTrimpSettings.duel.require()) });

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
				description += "<p><b>Set to 0 or -1 to disable this setting and not have any caps.</b></p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('trappapalooza', currSettingUniverse) && autoTrimpSettings.trappapalooza.require()) });

		createSetting('trappapaloozaTrap',
			function () { return ('T: Disable Trapping') },
			function () {
				var description = "<p>If enabled then trapping (both ingame and through the script) will be disabled when you have the coordination amount input in <b>T: Coords</b>.</p>";
				description += "<p>To work <b>T: Coords</b> must have an input above 0!</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
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
			function () { return ('D: Destack From') },
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

		//Balance
		createSetting('balance',
			function () { return ('Balance') },
			function () {
				var description = "<p>Enable this if you want to use Balance destacking features.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Challenges', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 40) });
		createSetting('balanceZone',
			function () { return ('B: Zone') },
			function () {
				var description = "<p>The zone you would like to start destacking from.</p>";
				return description;
			}, 'value', 6, null, 'Challenges', [1],
			function () { return (getPageSetting('balance', currSettingUniverse) && autoTrimpSettings.balance.require()) });
		createSetting('balanceStacks',
			function () { return ('B: Stacks') },
			function () {
				var description = "<p>The amount of stack you have to reach before clearing them.</p>";
				description += "<p><b>Recommended:</b> 20</p>";
				return description;
			}, 'value', -1, null, 'Challenges', [1],
			function () { return (getPageSetting('balance', currSettingUniverse) && autoTrimpSettings.balance.require()) });
		createSetting('balanceImprobDestack',
			function () { return ('B: Improbability Destack') },
			function () {
				var description = "<p>Enable this to always fully destack when fighting Improbabilities after you reach your specified destacking zone.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Challenges', [1],
			function () { return (getPageSetting('balance', currSettingUniverse) && autoTrimpSettings.balance.require()) });

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
				return description;
			}, 'value', -1, null, 'Challenges', [1],
			function () { return (autoTrimpSettings.life.enabled) });

		//Toxicity
		createSetting('toxicity',
			function () { return ('Toxicity') },
			function () {
				var description = "<p>Enable this if you want to use Toxicity stack farming features.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'Challenges', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 165) });

		createSetting('toxicityZone',
			function () { return ('T: Zone') },
			function () {
				var description = "<p>The zone(s) you would like to start mapping for stacks at.</p>";
				description += "<p>Can input multiple zones such as <b>200,231,251</b>, doing this will farm for stacks on all of these zones.</p>";
				description += "<p>You are able to enter a zone range, this can be done by using a decimal point between number ranges e.g. <b>23.120</b> which will farm stacks between zones 23 and 120. <b>This can be used in conjunction with other zones too, just seperate inputs with commas!</b></p>";
				description += "<p><b>Recommended:</b> 165</p>";
				return description;
			},
			'multiTextValue', -1, null, 'Challenges', [1],
			function () { return (autoTrimpSettings.toxicity.enabled) });

		createSetting('toxicityStacks',
			function () { return ('T: Stack Target') },
			function () {
				var description = "<p>Will farm to this amount of stacks when you're in a zone input in <b>T: Zone</b>.</p>";
				description += "<p>Can input multiple values seperated by commas such as <b>1000,1500,1500</b>. Doing this will cause the script to farm 1000 stacks on the first zone(s) set in <b>T: Zone</b> then 1500 in the second set etc.</p>";
				description += "<p><b>If only 1 value is set it will automatically use that for every farming zone.</b></p>";
				description += "<p><b>Recommended:</b> 1500</p>";
				return description;
			}, 'multiValue', -1, null, 'Challenges', [1],
			function () { return (autoTrimpSettings.toxicity.enabled) });

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
			}, 'boolean', 'true', null, 'Legacy', [1, 2]);
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
		}, null, 'Legacy', [1, 2]);

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
				description += "<p><b>You must have the upgrades setting enabled for this setting to run!</b></p>";
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
		createSetting('advancedNurseriesAmount',
			function () { return ('AN: Amount') },
			function () {
				var description = "<p>The amount of Nurseries that the script will attempt to purchase everytime you need additional health from Advanced Nurseries.</p>"
				description += "<p>Default is 2."
				return description;
			},
			'value', 2, null, 'Buildings', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 230 && autoTrimpSettings.advancedNurseries.enabled) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Jobs -- Descriptions done!
	const displayJobs = true;
	if (displayJobs) {
		createSetting('jobType',
			function () { return (['Don\'t Buy Jobs', 'Auto Ratios', 'Manual Ratios']) },
			function () {
				//Initial button description
				var description = "<p>Click the left side of the button to toggle between the AutoJobs settings. Each of them will adjust the 3 primary resource jobs but you'll have to manually set the rest by clicking the cog icon on the right side of this button.</p>";
				//Don't Buy Jobs
				description += "<p><b>Don\'t Buy Jobs</b><br>Will disable the script from purchasing any jobs.</p>";
				//Auto Ratios
				description += "<p><b>Auto Ratios</b><br>Automatically adjusts the 3 primary resource job worker ratios based on current game progress. For more detailed information on this check out its Help section for this setting.</p>";
				//Manual Ratios
				description += "<p><b>Manual Ratios</b><br>Buys jobs for your trimps according to the ratios set in the cogwheel popup.</p>";
				//Override info
				description += "<p><b>Map setting job ratios always override both 'Auto Ratios' & 'Manual Ratios' when AutoMaps is enabled.</b></p>";
				return description;
			}, 'multitoggle', 1, null, 'Legacy', [1, 2]);
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
		}, null, 'Legacy', [1, 2]);
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
		createSetting('equipCutOffHD',
			function () { return ('AE: HD Cut-off') },
			function () {
				var description = "<p>If your H:D (enemyHealth/trimpDamage) ratio is below this value it will override your <b>AE: Percent</b> input when looking at " + (currSettingUniverse !== 2 ? "weapon purchases " : "") + "and set your spending percentage to 100% of resources available.</p>";
				description += "<p>Goal with this setting is to have it purchase gear whenever you slow down in world.<br></p>";
				description += "<p><b>Your HD Ratio can be seen in the Auto Maps status tooltip.</b></p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', 1, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipCutOffHS',
			function () { return ('AE: HS Cut-off') },
			function () {
				var description = "<p>If your Hits Survived (trimpHealth/enemyDamage) ratio is below this value it will override your <b>AE: Percent</b> input when looking at armor purchases and set your spending percentage to 100% of resources available.</p>";
				description += "<p>Goal with this setting is to have it purchase gear whenever you slow down in world.<br></p>";
				description += "<p><b>Your Hits Survived Ratio can be seen in the Auto Maps status tooltip.</b></p>";
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
				description += "<p>Can input multiple zones such as <b>200,231,251</b>, doing this will spend all your resources purchasing gear and prestiges on each zone input.</p>";
				description += "<p>You are able to enter a zone range, this can be done by using a decimal point between number ranges e.g. <b>23.120</b> which will cause the zone check to set your purchasing percentage to 100% between zones 23 and 120. <b>This can be used in conjunction with other zones too, just seperate inputs with commas!</b></p>";
				description += "<p><b>Recommended:</b> 999</p>";
				return description;
			}, 'multiTextValue', [-1], null, "Equipment", [1, 2],
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
		createSetting('equip2',
			function () { return ('AE: 2') },
			function () {
				var description = "<p>Will also purchase a second level of weapons and armor regardless of efficiency.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipPrestige',
			function () { return (['AE: Prestige Off', 'AE: Maybe Prestige', 'AE: Prestige', 'AE: Always Prestige']) },
			function () {
				var trimple = currSettingUniverse === 1 ? "<b>Trimple of Doom</b>" : "<b>Atlantrimp</b>";
				var description = "<p>Will control how equipment levels & prestiges are purchased.</p>";

				description += "<p><b>AE: Prestige Off</b><br>Will only purchase prestiges when you have 6 or more levels in your that piece of equipment.</p>";

				description += "<p><b>AE: Maybe Prestige</b><br>Will only purchase prestiges you have either 6 or more levels in an equip <b>OR</b> when outside of your <b>AE: Zone</b> range <b>OR</b> when you can afford them .</p>";

				description += "<p><b>AE: Prestige</b><br>Overrides the need for levels in your current equips before a prestige will be purchased. Will purchase gear levels again when you have run " + trimple + ".";

				description += "<br><b>If " + trimple + " has been run it will buy any prestiges that cost less than 8% of your current resources then spend your remaining resources on equipment levels.</b></p>";

				description += "<p><b>AE: Always Prestige</b><br>Always buys prestiges of weapons and armor regardless of efficiency. Will override AE: Zone setting for an equip if it has a prestige available.</p>";

				description += "<p><b>Recommended:</b> AE: Prestige</p>";
				return description;
			}, 'multitoggle', 0, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });

		createSetting('equipPrestigePct',
			function () { return ('AE: Prestige Pct') },
			function () {
				var description = "<p>What percent of resources you'd like to spend on equipment before prestiges will be priorities over them.</p>";
				description += "<p>Both <b>AE: HD Cut-off</b> and <AE: Zone</b> will override this input when they are active and set it to 100.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 6, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });

		createSetting('equipNoShields',
			function () { return ('AE: No Shields') },
			function () {
				var description = "<p>Will stop the purchase of Shield equipment levels & prestiges.</p>";
				description += "<p><b>This is only ever useful in very niche scenarios.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) }); 22

		createSetting('equipPortal',
			function () { return ('AE: Portal') },
			function () {
				var description = "<p>Will ensure Auto Equip is enabled after portalling.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, "Equipment", [1, 2]);
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
			}, 'boolean', false, null, "Equipment", [1]);

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
			'dropdown', 'Off', function () {
				var equips = ['Off', 'Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate'];
				if (game.global.slowDone) {
					equips.push('Harmbalest')
					equips.push('GambesOP')
				}
				return equips;
			}, "Equipment", [1, 2]);
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

		createSetting('recycleExplorer',
			function () { return ('Recycle Pre-Explorers') },
			function () {
				var description = "<p>Will allow the script to abandon and recycle maps before Explorers have been unlocked.</p>";
				description += "<p><b>Be warned this may cause issues with fragments in the early game or on select challenges.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Maps', [1, 2]);

		createSetting('hitsSurvived',
			function () { return ('Hits Survived') },
			function () {
				var description = "<p>Will farm until you can survive this amount of attacks.</p>";
				description += "<p><b>Your Hits Survived can be seen in the Auto Maps status tooltip.</b></p>";
				description += "<p>Will use the job ratio settings that have been set in the <b>Map Bonus</b> settings default values section. If that hasn't been setup then it will use a ratio of <b>0/1/3</b></p>";
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
				description += "<p>Will use the job ratio settings that have been set in the <b>Map Bonus</b> settings default values section. If that hasn't been setup then it will use a ratio of <b>0/1/3</b></p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
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
				var description = "<p>Here you can select how and when you would like H:D (enemyHealth:trimpDamage) Ratio farming to be run.</p>";
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
				description += "<p><b>Set to 0 or -1 to disable this setting and have the script assume all Spires are active.</b></p>";
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
				description += "<p><b>Recommended:</b> -1</p>";
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
				description += "<p>Will use the job ratio settings that have been set in the <b>Map Bonus</b> setting. If that hasn't been setup then it will use a ratio of <b>0/1/3</b></p>";
				description += "<p><b>Will override the Hits Survived setting in the <b>Maps</b> tab so if this is disabled it won't farm for health at all.</b></p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
				if (currSettingUniverse === 1) description += "<p><b>Recommended:</b> 1.5</p>";
				return description;
			}, 'value', 0, null, 'Spire', [1]);
		createSetting('skipSpires',
			function () { return ('Skip Spires') },
			function () {
				var description = "<p>Will disable any form of mapping after your trimps have max map bonus stacks.</p>";
				if (currSettingUniverse === 1) description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Spire', [1]);

	}

	//----------------------------------------------------------------------------------------------------------------------

	//ATGA -- Descriptions done!
	const displayATGA = true;
	if (displayATGA) {
		createSetting('geneAssist',
			function () { return ('Gene Assist') },
			function () {
				var description = "<p>Master switch for whether the script will do any form of Geneticist purchasing.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p><b>If enabled will disable the ingame version.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Jobs', [1]);
		createSetting('geneAssistPercent',
			function () { return ('GA: Gene Assist %') },
			function () {
				var description = "<p>Gene Assist will only hire geneticists if they cost less than this value.</p>";
				description += "<p>If this setting is 1 it will only buy geneticists if they cost less than 1% of your food.</p>";
				description += "<p>Setting this to 0 or -1 will disable all of the <b>Gene Assist</b> settings.</p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', 1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
		createSetting('geneAssistTimer',
			function () { return ('GA: Timer') },
			function () {
				var description = "<p>This is the default time your gene assist settings will use.</p>";
				description += "<p>Setting this to 0 or -1 will disable all of the <b>Gene Assist</b> settings.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		//Spire Timers
		createSetting('geneAssistTimerSpire',
			function () { return ('GA: Spire Timer') },
			function () {
				var description = "<p>Gene Assist will use the value set here when inside of active Spires.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		//Zone Timers
		createSetting('geneAssistZoneBefore',
			function () { return ('GA: Before Z') },
			function () {
				var description = "<p>Gene Assist will use the value set in <bGA: Before Z Timer</b> when below this zone.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p><b>Recommended:</b> The zone where you stop 1 shotting in a new portal</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
		createSetting('geneAssistTimerBefore',
			function () { return ('GA: Before Z Timer') },
			function () {
				var description = "<p>Gene Assist will use the value set here when below the zone in <bGA: Before Z Timer</b>.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
		createSetting('geneAssistZoneAfter',
			function () { return ('GA: After Z') },
			function () {
				var description = "<p>Gene Assist will use the value set in <bGA: After Z Timer</b> when below this zone.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p><b>Recommended:</b> The zone where you stop 1 shotting after using your <b>GA: Timer</b> setting in a new portal</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
		createSetting('geneAssistTimerAfter',
			function () { return ('GA: After Z Timer') },
			function () {
				var description = "<p>Gene Assist will use the value set here when below the zone in <bGA: After Z Timer</b>.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p><b>Recommended:</b> Your <b>Anticipation</b> perk timer</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		//Daily Timers
		createSetting('geneAssistTimerDaily',
			function () { return ('GA: Daily Timer') },
			function () {
				var description = "<p>Gene Assist will use the value set here when running dailies. </p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
		createSetting('geneAssistTimerDailyHard',
			function () { return ('GA: Daily Timer Hard') },
			function () {
				var description = "<p>Gene Assist will use the value set here when running dailies that are considered hard (Plagued, Bloodthirst). </p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
		createSetting('geneAssistTimerSpireDaily',
			function () { return ('GA: Daily Spire Timer') },
			function () {
				var description = "<p>Gene Assist will use the value set here when inside of active Spires in dailies.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> Your <b>Anticipation</b> perk timer</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		//C2 Timers
		createSetting('geneAssistTimerC2',
			function () { return ('GA: ' + cinf() + ' Timer') },
			function () {
				var description = "<p>Gene Assist will use the value set here when running " + cinf() + "s.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> Use regular Gene Assist settings instead of this</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
		createSetting('geneAssistTimerC2Hard',
			function () { return ('GA: ' + cinf() + ' Timer Hard') },
			function () {
				var description = "<p>Gene Assist will use the value set here when running " + cinf() + "s that are considered hard (Electricity, Nom, Toxicity). </p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Combat -- TO DO Scryer+Windstacking
	const displayCombat = true;
	if (displayCombat) {
		//Helium
		createSetting('autoFight',
			function () { return (['Better AutoFight Off', 'Better Auto Fight', 'Vanilla']) },
			function () {
				var description = "<p>Controls how combat is handled by the script.</p>";
				description += "<p><b>Better Auto Fight Off</b><br>Disables this setting.";
				description += "<p><b>Better Auto Fight</b><br>Sends a new army to fight if : current army is dead, new squad ready, new squad breed timer target exceeded, and if breeding takes under 0.5 seconds.";
				description += "<p><b>Vanilla</b><br>Will make sure the ingames AutoFight is enabled at all times and ensures you start fighting on portal.";
				description += "<p><b>Recommended:</b> Better Auto Fight</p>";
				return description;
			}, 'multitoggle', 0, null, "Combat", [1, 2]);
		createSetting('autoAbandon',
			function () { return ('Auto Abandon') },
			function () {
				var description = "<p>Enabling this will force abandon trimps if necessary for mapping.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1, 2]);
		createSetting('floorCritCalc',
			function () { return ('Never Crit Calc') },
			function () {
				var description = "<p>When doing trimp damage calculations this will floor your crit chance to make the script assume you will never crit.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1, 2]);
		createSetting('AutoStance',
			function () { return (['Auto Stance Off', 'Auto Stance', 'D Stance', 'Windstacking']) },
			function () {
				var description = "<p>Enabling this setting will force any enemy damage calculations to ignore enemy crits.</p>";
				description += "<p><b>Autostance Off</b><br>Disables this setting.";
				description += "<p><b>Autostance</b><br>Automatically swap stances to avoid death.";
				description += "<p><b>D stance</b><br>Keeps you in D stance regardless of Health.";
				description += "<p><b>Windstacking</b><br>For use after nature (z230), and will keep you in D stance unless you are windstacking (Only useful if transfer is maxed out and wind empowerment is high). There's settings that will appear at the bottom of this tab if selected that must be setup for this to function as intended.";
				description += "<p><b>Recommended:</b> Autostance</p>";
				return description;
			}, 'multitoggle', 0, null, "Combat", [1]);
		createSetting('IgnoreCrits',
			function () { return (['Safety First', 'Ignore Void Strength', 'Ignore All Crits']) },
			function () {
				var description = "<p>Enabling this setting will force any enemy damage calculations to ignore enemy crits.</p>";
				description += "<p><b>Safety First</b><br>Disables this setting.";
				description += "<p><b>Ignore Void Strength</b><br>Will ignore crits from enemies in Void maps.";
				description += "<p><b>Ignore All Crits</b><br>Will ignore crits from enemies in challenges, daily mods or void maps.";
				description += "<p><b>Recommended:</b> Safety First</p>";
				return description;
			}, 'multitoggle', 0, null, 'Combat', [1],
			function () {
				return (autoTrimpSettings.AutoStance.value !== 3)
			});
		createSetting('ForceAbandon',
			function () { return ('Trimpicide') },
			function () {
				var description = "<p>If a new army is available to send and anticipation stacks aren't maxed this will suicide your current army and send a new one.</p>";
				description += "<p><b>Will not abandon in Spires.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1]);
		createSetting('AutoRoboTrimp',
			function () { return ('AutoRoboTrimp') },
			function () {
				var description = "<p>Use the RoboTrimp ability starting at this level, and every 5 levels thereafter.</p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> 60</p>";
				return description;
			}, 'value', -1, null, 'Combat', [1]);
		createSetting('fightforever',
			function () { return ('Fight Always') },
			function () {
				var description = "<p>Sends trimps to fight if they're not fighting, regardless of <b>Better Auto Fight</b>.</p>";
				description += "<p>Set to 0 to always send out trimps.</p>";
				description += "<p>Set a number higher than 0 to enable the H:D function. If the H:D ratio is below this number it will send them out.</p>";
				description += "<p>If set to -1 it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'Combat', [1]);
		createSetting('addpoison',
			function () { return ('Poison Calc') },
			function () {
				var description = "<p>Adds poison stack damage to any trimp damage calculations.</p>";
				description += "<p>May improve your poison zone speed.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1]);
		createSetting('fullice',
			function () { return ('Ice Calc') },
			function () {
				var description = "<p>Always calculates your ice to be a consistent level instead of going by the enemy debuff. Primary use is to ensure your H:D (enemyHealth:trimpDamage) ratios aren't all over the place.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1]);
		createSetting('45stacks',
			function () { return ('Antistack Calc') },
			function () {
				var description = "<p>Will force any damage calculations to assume you have max anticipation stacks.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1]);

		//Radon
		createSetting('equalityManagement',
			function () { return (['Auto Equality Off', 'Auto Equality: Basic', 'Auto Equality: Advanced']) },
			function () {
				var description = "<p>Controls how the script handles interactions with the Equality perk.</p>";
				description += "<p><b>Auto Equality Off</b><br>Disables this setting.</p>";
				description += "<p><b>Auto Equality: Basic</b><br>Sets equality to 0 on slow enemies, and autoscaling on for fast enemies.<br><b>If using this you must setup the scaling & reversing settings in the equality menu!</p>";
				description += "<p><b>Auto Equality: Advanced</b><br>Will disable scaling and use the equality slider. Uses the slider to set your equality to the ideal amount to kill the current enemy in the least amount of hits necessary.</p>";
				description += "<p><b>Recommended:</b> Auto Equality: Advanced</p>";
				return description;
			}, 'multitoggle', 0, null, 'Combat', [2]);
		createSetting('gammaBurstCalc',
			function () { return ('Gamma Burst Calc') },
			function () {
				var description = "<p>Factors Gamma Burst damage into your H:D (enemyHealth:trimpDamage) Ratio.</p>";
				description += "<p>Be warned, the script will assume that you have a gamma burst ready to trigger for every attack if enabled so your H:D Ratio might be 1 but you'd need to multiply that value by your gamma burst proc count to get the actual value.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [1, 2],
			function () { return (game.stats.highestRadLevel.valueTotal() > 10) });
		createSetting('frenzyCalc',
			function () { return ('Frenzy Calc') },
			function () {
				var description = "<p>Adds the Frenzy perk to trimp damage calculations.</p>";
				description += "<p>Be warned, the script will not farm as much with this on as it assumes 100% frenzy uptime.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [2],
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


		//---------------------------------------------------------------------------------------------------------------------

		//Windstacking
		createSetting('WindStackingMin',
			function () { return ('Windstack Min Zone') },
			function () {
				/* var description = "<p>When Wind Enlightenment </b></p>";
				description += "<p><b>Recommended:</b> On whilst highest zone is below 30 otherwise off</p>";
				return description; */
				return ('For use with Windstacking Stance, enables windstacking in zones above and inclusive of the zone set. (Get specified windstacks then change to D, kill bad guy, then repeat). This is designed to force S use until you have specified stacks in wind zones, overriding scryer settings. All windstack settings apart from WS MAX work off this setting.')
			},
			'value', -1, null, 'Combat', [1],
			function () {
				return (autoTrimpSettings.AutoStance.value === 3)
			});
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
			function () {
				var description = "<p>Master switch for whether the script will do any form of dimensional generator mode switching or Mi purchasing.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Magma', [1]);
		createSetting('beforegen',
			function () { return (['Gain Mi', 'Gain Fuel', 'Hybrid']) },
			function () {
				var description = "<p>The mode you would like your dimensional generator to be on before your <b>Start Fuel Z</b> zone.</p>";
				description += "<p><b>Gain Mi</b><br>Will set the generator to collect Mi.</p>";
				description += "<p><b>Gain Fuel</b><br>Will set the generator to collect fuel.</p>";
				description += "<p><b>Hybrid</b><br>Pseudo-Hybrid. This will collect fuel until full, then goes into Mi mode.</p>";
				description += "<p><b>Recommended:</b> Gain Mi</p>";
				return description;
			}, 'multitoggle', 1, null, 'Magma', [1]);
		createSetting('fuellater',
			function () { return ('Start Fuel Z') },
			function () {
				var description = "<p>Will automatically set the generator to gather <b>Fuel</b> when this zone is reached.</p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> Use Gatorcalc website to find ideal zone</p>";
				return description;
			}, 'value', -1, null, 'Magma', [1]);
		createSetting('fuelend',
			function () { return ('End Fuel Z') },
			function () {
				var description = "<p>Will automatically set the generator to gather <b>Fuel</b> until this zone is reached.</p>";
				description += "<p><b>Set to 0 or -1 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> Use Gatorcalc website to find ideal zone</p>";
				return description;
			}, 'value', -1, null, 'Magma', [1]);
		createSetting('defaultgen',
			function () { return (['Gain Mi', 'Gain Fuel', 'Hybrid']) },
			function () {
				var description = "<p>The mode you would like your dimensional generator to be on after your <b>End Fuel Z</b> zone.</p>";
				description += "<p><b>Gain Mi</b><br>Will set the generator to collect Mi.</p>";
				description += "<p><b>Gain Fuel</b><br>Will set the generator to collect fuel.</p>";
				description += "<p><b>Hybrid</b><br>Pseudo-Hybrid. This will collect fuel until full, then goes into Mi mode.</p>";
				description += "<p><b>Recommended:</b> Gain Mi</p>";
				return description;
			}, 'multitoggle', 1, null, 'Magma', [1]);
		createSetting('AutoGenDC',
			function () { return (['Daily: Normal', 'Daily: Fuel', 'Daily: Hybrid']) },
			function () {
				var description = "<p>The mode that the script will use for the entire daily run.</p>";
				description += "<p><b>Daily Normal</b><br>Disables this setting and uses the normal script auto generator settings.</p>";
				description += "<p><b>Daily Fuel</b><br>Will set the generator to collect fuel.</p>";
				description += "<p><b>Daily Hybrid</b><br>Pseudo-Hybrid. This will collect fuel until full, then goes into Mi mode.</p>";
				description += "<p><b>Recommended:</b> Daily Normal</p>";
				return description;
			}, 'multitoggle', 1, null, 'Magma', [1]);
		createSetting('AutoGenC2',
			function () { return (['' + cinf() + ': Normal', '' + cinf() + ': Fuel', '' + cinf() + ': Hybrid']) },
			function () {
				var description = "<p>The mode that the script will use for the entire " + c2Description() + " run.</p>";
				description += "<p><b>" + cinf() + " Normal</b><br>Disables this setting and uses the normal script auto generator settings.</p>";
				description += "<p><b>" + cinf() + " Fuel</b><br>Will set the generator to collect fuel.</p>";
				description += "<p><b>" + cinf() + " Hybrid</b><br>Pseudo-Hybrid. This will collect fuel until full, then goes into Mi mode.</p>";
				description += "<p><b>Recommended:</b> " + cinf() + " Fuel</p>";
				return description;
			}, 'multitoggle', 1, null, 'Magma', [1]);

		//Spend Mi
		createSetting('spendmagmite',
			function () { return (['Spend Magmite Off', 'Spend Magmite (Portal)', 'Spend Magmite Always']) },
			function () {
				var description = "<p>Controls when the script will spend the Magmite that you obtain throughout your runs.</p>";
				description += "<p><b>Spend Magmite Off</b><br>Disables this setting.</p>";
				description += "<p><b>Spend Magmite (Portal)</b><br>Auto Spends any unspent Magmite immediately before portaling.</p>";
				description += "<p><b>Spend Magmite Always</b><br>Will spend any Magmite that you acquire straight away. Typically means you'll purchase the cheapest upgrades possible.</p>";
				description += "<p><b>Recommended:</b> Spend Magmite (Portal)</p>";
				return description;
			}, 'multitoggle', 1, null, 'Magma', [1]);
		createSetting('ratiospend',
			function () { return ('Ratio Spending') },
			function () {
				var description = "<p>If enabled will spend all your magmite in a ratio that you define.</p>";
				description += "<p><b>Additional settings will appear if enabled.</b></p>";
				description += "<p>For more accurate ratio values to use for these settings check out the Gatorcalc website!</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'Magma', [1]);

		createSetting('effratio',
			function () { return ('Efficiency') },
			function () {
				return ('Use -1 or 0 to not spend on this. Any value above 0 will spend.')
			}, 'value', -1, null, 'Magma', [1],
			function () { return (autoTrimpSettings.ratiospend.enabled) });
		createSetting('capratio',
			function () { return ('Capacity') },
			function () {
				return ('Use -1 or 0 to not spend on this. Any value above 0 will spend.')
			}, 'value', -1, null, 'Magma', [1],
			function () { return (autoTrimpSettings.ratiospend.enabled) });
		createSetting('supratio',
			function () { return ('Supply') },
			function () {
				return ('Use -1 or 0 to not spend on this. Any value above 0 will spend.')
			}, 'value', -1, null, 'Magma', [1],
			function () { return (autoTrimpSettings.ratiospend.enabled) });
		createSetting('ocratio',
			function () { return ('Overclocker') },
			function () {
				return ('Use -1 or 0 to not spend on this. Any value above 0 will spend.')
			}, 'value', -1, null, 'Magma', [1],
			function () { return (autoTrimpSettings.ratiospend.enabled) });

		createSetting('SupplyWall',
			function () { return ('Throttle Supply (or Capacity)') },
			function () {
				return ('Positive number NOT 1 e.g. 2.5: Consider Supply when its cost * 2.5 is < Capacity, instead of immediately when < Cap. Effectively throttles supply for when you don\'t need too many.<br><br>Negative number (-1 is ok) e.g. -2.5: Consider Supply if it costs < Capacity * 2.5, buy more supplys! Effectively throttling capacity instead.<br><br><b>Set to 1: DISABLE SUPPLY only spend magmite on Efficiency, Capacity and Overclocker. Always try to get supply close to your HZE. <br>Set to 0: IGNORE SETTING and use old behaviour (will still try to buy overclocker)</b>')
			}, 'valueNegative', 0.4, null, 'Magma', [1],
			function () { return (!autoTrimpSettings.ratiospend.enabled) });
		createSetting('spendmagmitesetting',
			function () { return (['Normal', 'Normal & No OC', 'OneTime Only', 'OneTime & OC']) },
			function () {
				return ('<b>Normal:</b> Spends Magmite Normally as Explained in Magmite spending behaviour. <br><b>Normal & No OC:</b> Same as normal, except skips OC afterbuying 1 OC upgrade. <br><b>OneTime Only:</b> Only Buys the One off upgrades except skips OC afterbuying 1 OC upgrade. <br><b>OneTime & OC:</b> Buys all One off upgrades, then buys OC only.')
			}, 'multitoggle', 0, null, 'Magma', [1],
			function () { return (!autoTrimpSettings.ratiospend.enabled) });
		createSetting('MagmiteExplain',
			function () { return ('Magmite spending behaviour') },
			function () {
				var description = "<p>Infographic on how the magmite spending process works.</p>";
				description += "<p><b>1.</b><br>Buy one-and-done upgrades, expensive first, then consider 1st level of Overclocker.</p>";
				description += "<p><b>2.</b><br>Buy Overclocker IF AND ONLY IF we can afford it.</p>";
				description += "<p><b>2.5.</b><br>Exit if one time only upgrade.</p>";
				description += "<p><b>3.</b><br>Buy Efficiency if it is better than capacity.</p>";
				description += "<p><b>4.</b><br>Buy Capacity or Supply depending on which is cheaper, or based on SupplyWall.</p>";
				return description;
			}, 'infoclick', 'MagmiteExplain', null, 'Magma', [1],
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

		createSetting('heirloomCompressedSwap',
			function () { return ('Compressed Swap') },
			function () {
				var description = "<p>When the cell after next is compressed and you are past your heirloom swap zone this will equip your <b>Initial</b> shield so that the next enemy spawns with max health to maximise plaguebringer damage on it.</p>";
				description += "<p>Will ensure you start the compressed cell at the lowest health it can be from plaguebringer which reduces initial rage stack if the enemy has it and the clear time.</p>";
				description += "<p>Will only work if your <b>Initial</b> Shield doesn't have <b>PlagueBringer</b> and your <b>Afterpush</b> shield has <b>PlagueBringer</b>.</p>";
				description += "<p>Displays an additional setting when enabled where you can force swap to your <b>Afterpush</b> shield when above X <b>World HD Ratio</b> and the next cell is compressed.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirlooms', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse) && game.stats.highestRadLevel.valueTotal() >= 203) });

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
				var description = "<p>Heirloom to use after your designated swap zone during " + c2Description() + " runs.</p>";
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
				var description = "<p>From which zone to swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield during filler (non daily/" + cinf() + " runs).</p>";
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

		createSetting('heirloomSwapHD',
			function () { return ('HD Ratio Swap') },
			function () {
				var description = "<p>Will swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield when your <b>World HD Ratio</b> is above this value.</p>";
				description += "<p>If set to 0 or -1 it will disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomSwapHDCompressed',
			function () { return ('Comp Swap HD') },
			function () {
				var description = "<p>Will swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield when the next cell is compressed and your <b>World HD Ratio</b> is above this value.</p>";
				description += "<p>If set to -1 it will disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Heirlooms', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse) && getPageSetting('heirloomCompressedSwap', currSettingUniverse)) });

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

		/* createSetting('heirloomAutoRareToKeep',
			function () { return ('Rarity to Keep') },
			function () {
				var description = "<p>When identifying which heirlooms to keep will look at this rarity of heirloom, recycles all others.</p>";
				description += "<p>Will only display tiers that can currently be obtained based on your highest zone reached.</p>";
				description += "<p>When changed the heirloom mods sections will only display the mods available for that heirloom tier.</p>";
				description += "<p><b>Recommended:</b> Highest tier available</p>";
				return description;
			}, 'dropdown', 'None', function () {
				var hze;
				var heirloomTiersAvailable;
				if (currSettingUniverse === 2) {
					hze = game.stats.highestRadLevel.valueTotal();
					heirloomTiersAvailable = ['Plagued', 'Radiating'];
					if (hze >= 100) heirloomTiersAvailable.push('Hazardous');
					if (hze >= 200) heirloomTiersAvailable.push('Enigmatic');
				}
				else {
					hze = game.stats.highestLevel.valueTotal();
					heirloomTiersAvailable = ['Common', 'Rare'];
					if (hze >= 60) heirloomTiersAvailable.push('Epic');
					if (hze >= 100) heirloomTiersAvailable.push('Legendary');
					if (hze >= 125) heirloomTiersAvailable.push('Magnificent');
					if (hze >= 146) heirloomTiersAvailable.push('Ethereal');
					if (hze >= 230) heirloomTiersAvailable.push('Magmatic');
					if (hze >= 500) heirloomTiersAvailable.push('Plagued');
				}
				return heirloomTiersAvailable;
			}, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) }); */

		//Shield Line
		createSetting('heirloomAutoShield',
			function () { return ('Shields') },
			function () {
				var description = "<p>Enable to allow you to select the shield modifiers you would like to target.</p>";
				return description;
			}, 'boolean', false, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		createSetting('heirloomAutoRareToKeepShield',
			function () { return ('Rarity to Keep') },
			function () {
				var description = "<p>When identifying which heirlooms to keep will look at this rarity of heirloom, recycles all others.</p>";
				description += "<p>Will only display tiers that can currently be obtained based on your highest zone reached.</p>";
				description += "<p>When changed the heirloom mods sections will only display the mods available for that heirloom tier.</p>";
				description += "<p><b>Recommended:</b> Highest tier available</p>";
				return description;
			}, 'dropdown', 'None', function () {
				var hze;
				var heirloomTiersAvailable;
				if (currSettingUniverse === 2) {
					hze = game.stats.highestRadLevel.valueTotal();
					heirloomTiersAvailable = ['Plagued', 'Radiating'];
					if (hze >= 100) heirloomTiersAvailable.push('Hazardous');
					if (hze >= 200) heirloomTiersAvailable.push('Enigmatic');
				}
				else {
					hze = game.stats.highestLevel.valueTotal();
					heirloomTiersAvailable = ['Common', 'Rare'];
					if (hze >= 60) heirloomTiersAvailable.push('Epic');
					if (hze >= 100) heirloomTiersAvailable.push('Legendary');
					if (hze >= 125) heirloomTiersAvailable.push('Magnificent');
					if (hze >= 146) heirloomTiersAvailable.push('Ethereal');
					if (hze >= 230) heirloomTiersAvailable.push('Magmatic');
					if (hze >= 500) heirloomTiersAvailable.push('Plagued');
				}
				return heirloomTiersAvailable;
			}, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse)) });

		createSetting('heirloomAutoShieldBlacklist',
			function () { return ('Blacklist') },
			function () {
				var description = "<p>Will automatically recycle any Shield heirlooms with the mods you input into this setting.</p>";
				description += "<p>Mod names to be entered exactly the same as they appear in the modifier settings.</p>";
				description += "<p>Can input multiple modifier names but they need to be seperated by a comma!</p>";
				return description;
			}, 'multiTextValue', 'None', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse)) });

		createSetting('heirloomAutoShieldMod1',
			function () { return ('Shield: Modifier 1') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Shield'); }, 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 0)
			});

		createSetting('heirloomAutoShieldMod2',
			function () { return ('Shield: Modifier 2') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Shield'); }, 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 1)
			});

		createSetting('heirloomAutoShieldMod3',
			function () { return ('Shield: Modifier 3') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Shield'); }, 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 2)
			});

		createSetting('heirloomAutoShieldMod4',
			function () { return ('Shield: Modifier 4') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Shield'); }, 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 5)
			});

		createSetting('heirloomAutoShieldMod5',
			function () { return ('Shield: Modifier 5') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Shield'); }, 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 7)
			});

		createSetting('heirloomAutoShieldMod6',
			function () { return ('Shield: Modifier 6') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Shield'); }, 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 9)
			});

		createSetting('heirloomAutoShieldMod7',
			function () { return ('Shield: Modifier 7') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Shield'); }, 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 11)
			});

		//Staff Line
		createSetting('heirloomAutoStaff',
			function () { return ('Staffs') },
			function () {
				var description = "<p>Enable to allow you to select the staff modifiers you would like to target.</p>";
				return description;
			}, 'boolean', false, null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		createSetting('heirloomAutoRareToKeepStaff',
			function () { return ('Rarity to Keep') },
			function () {
				var description = "<p>When identifying which heirlooms to keep will look at this rarity of heirloom, recycles all others.</p>";
				description += "<p>Will only display tiers that can currently be obtained based on your highest zone reached.</p>";
				description += "<p>When changed the heirloom mods sections will only display the mods available for that heirloom tier.</p>";
				description += "<p><b>Recommended:</b> Highest tier available</p>";
				return description;
			}, 'dropdown', 'None', function () {
				var hze;
				var heirloomTiersAvailable;
				if (currSettingUniverse === 2) {
					hze = game.stats.highestRadLevel.valueTotal();
					heirloomTiersAvailable = ['Plagued', 'Radiating'];
					if (hze >= 100) heirloomTiersAvailable.push('Hazardous');
					if (hze >= 200) heirloomTiersAvailable.push('Enigmatic');
				}
				else {
					hze = game.stats.highestLevel.valueTotal();
					heirloomTiersAvailable = ['Common', 'Rare'];
					if (hze >= 60) heirloomTiersAvailable.push('Epic');
					if (hze >= 100) heirloomTiersAvailable.push('Legendary');
					if (hze >= 125) heirloomTiersAvailable.push('Magnificent');
					if (hze >= 146) heirloomTiersAvailable.push('Ethereal');
					if (hze >= 230) heirloomTiersAvailable.push('Magmatic');
					if (hze >= 500) heirloomTiersAvailable.push('Plagued');
				}
				return heirloomTiersAvailable;
			}, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse)) });

		createSetting('heirloomAutoStaffBlacklist',
			function () { return ('Blacklist') },
			function () {
				var description = "<p>Will automatically recycle any Staff heirlooms with the mods you input into this setting.</p>";
				description += "<p>Mod names to be entered exactly the same as they appear in the modifier settings.</p>";
				description += "<p>Can input multiple modifier names but they need to be seperated by a comma!</p>";
				return description;
			}, 'textValue', 'None', null, 'Heirlooms', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse)) });

		createSetting('heirloomAutoStaffMod1',
			function () { return ('Staff: Modifier 1') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Staff'); }, 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 0)
			});

		createSetting('heirloomAutoStaffMod2',
			function () { return ('Staff: Modifier 2') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Staff'); }, 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 1)
			});

		createSetting('heirloomAutoStaffMod3',
			function () { return ('Staff: Modifier 3') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Staff'); }, 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 2)
			});

		createSetting('heirloomAutoStaffMod4',
			function () { return ('Staff: Modifier 4') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Staff'); }, 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 5)
			});

		createSetting('heirloomAutoStaffMod5',
			function () { return ('Staff: Modifier 5') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Staff'); }, 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 7)
			});

		createSetting('heirloomAutoStaffMod6',
			function () { return ('Staff: Modifier 6') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Staff'); }, 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 9)
			});

		createSetting('heirloomAutoStaffMod7',
			function () { return ('Staff: Modifier 7') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Staff'); }, 'Heirlooms', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 11)
			});

		//Core Line
		createSetting('heirloomAutoCore',
			function () { return ('Cores') },
			function () { return ('Enables in-depth core settings.') },
			'boolean', false, null, 'Heirlooms', [1],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		createSetting('heirloomAutoRareToKeepCore',
			function () { return ('Rarity to Keep') },
			function () {
				var description = "<p>When identifying which heirlooms to keep will look at this rarity of heirloom, recycles all others.</p>";
				description += "<p>Will only display tiers that can currently be obtained based on your highest zone reached.</p>";
				description += "<p><b>Recommended:</b> Highest tier available</p>";
				return description;
			}, 'dropdown', 'None', function () {
				var hze = game.stats.highestLevel.valueTotal();
				var heirloomTiersAvailable = ['Common'];

				if (hze >= 200) heirloomTiersAvailable.push('Uncommon');
				if (hze >= 300) heirloomTiersAvailable.push('Rare');
				if (hze >= 400) heirloomTiersAvailable.push('Epic');
				if (hze >= 500) heirloomTiersAvailable.push('Legendary');
				if (hze >= 600) heirloomTiersAvailable.push('Magnificent');
				if (hze >= 700) heirloomTiersAvailable.push('Ethereal');

				return heirloomTiersAvailable;
			}, 'Heirlooms', [1],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse)) });

		createSetting('heirloomAutoCoreBlacklist',
			function () { return ('Blacklist') },
			function () {
				var description = "<p>Will automatically recycle any Core heirlooms with the mods you input into this setting.</p>";
				description += "<p>Mod names to be entered exactly the same as they appear in the modifier settings.</p>";
				description += "<p>Can input multiple modifier names but they need to be seperated by a comma!</p>";
				return description;
			}, 'textValue', 'None', null, 'Heirlooms', [1],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse)) });

		createSetting('heirloomAutoCoreMod1',
			function () { return ('Cores: Modifier 1') },
			function () {
				var description = "<p>Keeps Cores with selected mod.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Core'); }, 'Heirlooms', [1],
			function () {
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse))
			});
		createSetting('heirloomAutoCoreMod2',
			function () { return ('Cores: Modifier 2') },
			function () {
				var description = "<p>Keeps Cores with selected mod.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Core'); }, 'Heirlooms', [1],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepCore', currSettingUniverse)) >= 1)
			});
		createSetting('heirloomAutoCoreMod3',
			function () { return ('Cores: Modifier 3') },
			function () {
				var description = "<p>Keeps Cores with selected mod.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Core'); }, 'Heirlooms', [1],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepCore', currSettingUniverse)) >= 2)
			});
		createSetting('heirloomAutoCoreMod4',
			function () { return ('Cores: Modifier 4') },
			function () {
				var description = "<p>Keeps Cores with selected mod.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Core'); }, 'Heirlooms', [1],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepCore', currSettingUniverse)) >= 6)
			});
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Golden -- Descriptions done!
	const displayGolden = true;
	if (displayGolden) {
		createSetting('autoGoldenSettings',
			function () { return ('Auto Gold Settings') },
			function () {
				var description = "<p>Here you can select the golden upgrades you would like to have purchased during filler (non daily/" + cinf() + " runs) runs.</p>";
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

	//Nature -- Descriptions done!
	const displayNature = true;
	if (displayNature) {
		//Tokens
		createSetting('AutoNatureTokens',
			function () { return ('Spend Nature Tokens') },
			function () {
				var description = "<p>Controls how Nature tokens are handled by the script.</p>";
				description += "<p>Additional settings appear when enabled for token transfer & automatically spending tokens on enlightenments.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Nature', [1]);
		createSetting('tokenthresh',
			function () { return ('Token Threshold') },
			function () {
				var description = "<p>If tokens would go below this value it will disable token conversion.</p>";
				description += "<p><b>Set to 0 or -1 to completely disable token conversion.</b></p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.AutoNatureTokens.enabled) });
		createSetting('AutoPoison',
			function () { return ('Poison') },
			function () {
				var description = "<p>Decides what to do with Poison tokens.</p>";
				description += "<p>Will only spend tokens if the action costs less than your current total + the value in <b>Token Threshold</b><br></p>";
				description += "<p><b>Off</b><br>Disables this setting.</p>";
				description += "<p><b>Empowerment</b><br>Will upgrade your Poison level.</p>";
				description += "<p><b>Transfer</b><br>Will purchase levels in your Poison transfer rate.</p>";
				description += "<p><b>Convert to X</b> Will convert your tokens to the specified nature type.</p>";
				return description;
			},
			'dropdown', 'Off', function () { return ['Off', 'Empowerment', 'Transfer', 'Convert to Wind', 'Convert to Ice']; }, 'Nature', [1],
			function () { return (autoTrimpSettings.AutoNatureTokens.enabled) });
		createSetting('AutoWind',
			function () { return ('Wind') },
			function () {
				var description = "<p>Decides what to do with Wind tokens.</p>";
				description += "<p>Will only spend tokens if the action costs less than your current total + the value in <b>Token Threshold</b><br></p>";
				description += "<p><b>Off</b><br>Disables this setting.</p>";
				description += "<p><b>Empowerment</b><br>Will upgrade your Wind level.</p>";
				description += "<p><b>Transfer</b><br>Will purchase levels in your Wind transfer rate.</p>";
				description += "<p><b>Convert to X</b> Will convert your tokens to the specified nature type.</p>";
				return description;
			}, 'dropdown', 'Off', function () { return ['Off', 'Empowerment', 'Transfer', 'Convert to Poison', 'Convert to Ice']; }, 'Nature', [1],
			function () { return (autoTrimpSettings.AutoNatureTokens.enabled) });
		createSetting('AutoIce',
			function () { return ('Ice') },
			function () {
				var description = "<p>Decides what to do with Ice tokens.</p>";
				description += "<p>Will only spend tokens if the action costs less than your current total + the value in <b>Token Threshold</b><br></p>";
				description += "<p><b>Off</b><br>Disables this setting.</p>";
				description += "<p><b>Empowerment</b><br>Will upgrade your Ice level.</p>";
				description += "<p><b>Transfer</b><br>Will purchase levels in your Ice transfer rate.</p>";
				description += "<p><b>Convert to X</b> Will convert your tokens to the specified nature type.</p>";
				return description;
			}, 'dropdown', 'Off', function () { return ['Off', 'Empowerment', 'Transfer', 'Convert to Poison', 'Convert to Wind']; }, 'Nature', [1],
			function () { return (autoTrimpSettings.AutoNatureTokens.enabled) });

		//Enlightenments
		createSetting('autoenlight',
			function () { return ('Enlight: Auto') },
			function () {
				var description = "<p>Controls when the script will purchase nature enlightenments.</p>";
				description += "<p>Priority system for the purchases is <b>Nature > Wind > Ice</b>.</p>";
				description += "<p>Will only purchase an enlightenment when <b>Magma</b> is active.</p>";
				description += "<p>Englightenment purchases ignore the <b>Token Threshold</b> setting value.</p>";
				return description;
			},
			'boolean', false, null, 'Nature', [1]);
		createSetting('poisonEnlight',
			function () { return ('E: F: Poison') },
			function () {
				var description = "<p>Will activate Poison enlightenment when below this token threshold when running fillers (non daily/" + cinf() + " runs).</p>";
				description += "<p><b>Set to 0 or -1 to completely disable this setting.</b></p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('windEnlight',
			function () { return ('E: F: Wind') },
			function () {
				var description = "<p>Will activate Wind enlightenment when below this token threshold when running fillers (non daily/" + cinf() + " runs).</p>";
				description += "<p><b>Set to 0 or -1 to completely disable this setting.</b></p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('iceEnlight',
			function () { return ('E: F: Ice') },
			function () {
				var description = "<p>Will activate Ice enlightenment when below this token threshold when running fillers (non daily/" + cinf() + " runs).</p>";
				description += "<p><b>Set to 0 or -1 to completely disable this setting.</b></p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('poisonEnlightDaily',
			function () { return ('E: D: Poison') },
			function () {
				var description = "<p>Will activate Poison enlightenment when below this token threshold when running dailies.</p>";
				description += "<p><b>Set to 0 or -1 to completely disable this setting.</b></p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('windEnlightDaily',
			function () { return ('E: D: Wind') },
			function () {
				var description = "<p>Will activate Wind enlightenment when below this token threshold when running dailies.</p>";
				description += "<p><b>Set to 0 or -1 to completely disable this setting.</b></p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('iceEnlightDaily',
			function () { return ('E: D: Ice') },
			function () {
				var description = "<p>Will activate Ice enlightenment when below this token threshold when running dailies.</p>";
				description += "<p><b>Set to 0 or -1 to completely disable this setting.</b></p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('poisonEnlightC2',
			function () { return ('E: C: Poison') },
			function () {
				var description = "<p>Will activate Poison enlightenment when below token threshold when doing " + c2Description() + " runs.</p>";
				description += "<p><b>Set to 0 or -1 to completely disable this setting.</b></p>";
				return description;
			},
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('windEnlightC2',
			function () { return ('E: C: Wind') },
			function () {
				var description = "<p>Will activate Wind enlightenment when below this token threshold when doing " + c2Description() + " runs.</p>";
				description += "<p><b>Set to 0 or -1 to completely disable this setting.</b></p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('iceEnlightC2',
			function () { return ('E: C: Ice') },
			function () {
				var description = "<p>Will activate Ice enlightenment when below this token threshold when doing " + c2Description() + " runs.</p>";
				description += "<p><b>Set to 0 or -1 to completely disable this setting.</b></p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Time Warp
	const displayTimewarp = true;
	if (displayTimewarp) {
		createSetting('timeWarpDisable',
			function () { return ("Disable in Time Warp") },
			function () { return ("Will disable all of the scripts features during time warp in an attempt to speed it up.") },
			'boolean', false, null, 'Time Warp', [0]);

		createSetting('timeWarpSpeed',
			function () { return ('Time Warp Support') },
			function () {
				var description = "<p>Will force AutoTrimps to run the script more frequently during time warp.</p>";
				description += "<p>This will be a significant slow down when running time warp but should allow you to use the script during it.</p>";
				return description;
			}, 'boolean', false, null, 'Time Warp', [0]);

		createSetting('timeWarpFrequency',
			function () { return ('Time Warp Frequency') },
			function () {
				var description = "<p>How often the scripts code will run during time warp.</p>";
				description += "<p>If set to 20 it will run on the 20th time the games code runs.</p>";
				description += "<p>The lower you set this value the longer time warp will take.</p>";
				description += "<p><b>Recommended:</b> 20</p>";
				return description;
			}, 'value', 20, null, 'Time Warp', [0],
			function () { return (autoTrimpSettings.timeWarpSpeed.enabled) });
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
			'boolean', true, null, 'Display', [0]);

		createSetting('displayAllSettings',
			function () { return ('Display all settings') },
			function () { return ('Will display all of the locked settings that have HZE or other requirements to be displayed.') },
			'boolean', false, null, 'Display', [0]);

		createSetting('EnableAFK',
			function () { return ('Go AFK Mode') },
			function () { return ('(Action Button). Go AFK uses a Black Screen, and suspends ALL the Trimps GUI visual update functions (updateLabels) to improve performance by not doing unnecessary stuff. This feature is primarily just a CPU and RAM saving mode. Everything will resume when you come back and press the Back button. Console debug output is also disabled. The blue color means this is not a settable setting, just a button. You can now also click the Zone # (World Info) area to go AFK now.') },
			'action', 'MODULES["performance"].EnableAFKMode()', null, 'Display', [1, 2]);

		createSetting('automateSpireAssault',
			function () { return ('Automate Spire Assault') },
			function () { return ('Automates Spire Assault gear swaps from level 92 up to level 128. HIGHLY RECOMMENDED THAT YOU DO NOT USE THIS SETTING.') },
			'boolean', false, null, 'Display', [11]);

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
	document.getElementById('battleSideTitle').setAttribute('onmouseover', "getZoneStats(event);this.style.cursor='pointer'");

	//----------------------------------------------------------------------------------------------------------------------

	//Export/Import/Default
	const displayImport = true;
	if (displayImport) {
		createSetting('ImportAutoTrimps',
			function () { return ('Import AutoTrimps') },
			function () { return ('Import your AutoTrimps Settings. Asks you to name it as a profile afterwards.') },
			'infoclick', 'ImportAutoTrimps', null, 'Import Export', [0]);
		createSetting('ExportAutoTrimps',
			function () { return ('Export AutoTrimps') },
			function () { return ('Export your AutoTrimps Settings as a output string text formatted in JSON.') },
			'infoclick', 'ExportAutoTrimps', null, 'Import Export', [0]);
		createSetting('DefaultAutoTrimps',
			function () { return ('Reset to Default') },
			function () { return ('Reset everything to the way it was when you first installed the script.') },
			'infoclick', 'ResetDefaultSettingsProfiles', null, 'Import Export', [0]);
		createSetting('DownloadDebug',
			function () { return ('Download for Debug') },
			function () { return ('Will download both your save and AT settings so that they can be debugged easier.') },
			'action', 'ImportExportTooltip("ExportAutoTrimps","update",true)', null, 'Import Export', [0]);
		/* createSetting('CleanupAutoTrimps',
			function () { return ('Cleanup Saved Settings') },
			function () { return ('Deletes old values from previous versions of the script from your AutoTrimps settings file.') },
			'infoclick', 'CleanupAutoTrimps', null, 'Import Export', [0]); */

		createSetting('autoAllocatePresets',
			function () { return ('Auto Allocate Presets') },
			function () { return ('Click to adjust settings.') },
			'mazDefaultArray', JSON.stringify({
				'': '',
			}), null, 'Import Export', [1, 2]);

		createSetting('mutatorPresets',
			function () { return ('Mutator Presets') },
			function () { return ('Click to adjust settings.') },
			'mazDefaultArray', JSON.stringify({
				preset1: {},
				preset2: {},
				preset3: {},
			}), null, 'Import Export', [2]);
	}

	//Testing - Hidden Features for testing purposes! Please never seek these out!
	const displayTesting = true;
	if (displayTesting) {
		createSetting('gameUser',
			function () { return ('User') },
			function () {
				var description = "<p>Not gonna be seen by anybody.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Test', [0],
			function () { return (false) });

		createSetting('testSpeed20',
			function () { return ('Game Speed 12x') },
			function () {
				var description = "<p>Increases the game run speed. Runs both the entire script & main trimps loop on every tick.</p>";
				description += "<p><b>There's no way to clear this without refreshing your page.</b></p>";
				description += "<p><b>Speed increase is variable depending on your machine.</b></p>";
				return description;
			}, 'action', 'testSpeedX(0.00001);', null, 'Test', [0]);

		createSetting('testSetChallenge',
			function () { return ('Custom Challenge') },
			function () {
				var description = "<p>Will set the challenge that Trimps is running to your input.</p>";
				return description;
			}, 'action', 'ImportExportTooltip("SetCustomChallenge");', null, 'Test', [0]);

		createSetting('testSetC2',
			function () { return ('Toggle ' + cinf()) },
			function () {
				var description = "<p>Will toggle on the setting for if you\'re running a " + cinf() + ".</p>";
				return description;
			}, 'action', 'testRunningCinf();', null, 'Test', [0]);

		createSetting('testBoneCharges',
			function () { return ('Max Bone Charges') },
			function () {
				var description = "<p>Sets your bone charge counter to 10.</p>";
				return description;
			}, 'action', 'game.permaBoneBonuses.boosts.charges=10; game.permaBoneBonuses.boosts.updateBtn();', null, 'Test', [0]);

		createSetting('testMetalOneDay',
			function () { return ('1 day of metal') },
			function () {
				var description = "<p>Will tell you how much metal you'd gain from 1 day of metal farming.</p>";
				description += "<p>If in a map if will use your map level otherwise it'll assume world level maps.</p>";
				description += "<p>Assumes killing at max speed and factors overkill into the calculations.</p>";
				return description;
			}, 'action', 'testMetalIncome();', null, 'Test', [0]);

		createSetting('testTotalEquipmentCost',
			function () { return ('Total Equipment Cost') },
			function () {
				var description = "<p>Will calculate the total metal cost of your equipment.</p>";
				description += "<p>Outputs in total prestige cost, total equip cost & total overall.</p>";
				description += "<p>Assumes killing at max speed and factors overkill into the calculations.</p>";
				return description;
			},
			'action', 'testEquipmentMetalSpent();', null, 'Test', [0]);

		createSetting('testLastWorldCell',
			function () { return ('Last World Cell') },
			function () {
				var description = "<p>Sets your current cell to the last world cell in the world.</p>";
				description += "<p>Will also set the last enemy cells health to 0.</p>";
				return description;
			}, 'action', 'testWorldCell();', null, 'Test', [0]);

		createSetting('testLastMapCell',
			function () { return ('Last Map Cell') },
			function () {
				var description = "<p>Sets your current cell to the last world cell in maps.</p>";
				description += "<p>Will also set the last enemy cells health to 0.</p>";
				return description;
			}, 'action', 'testMapCell();', null, 'Test', [0]);

		createSetting('testMaxMapBonus',
			function () { return ('Max Map Bonus') },
			function () {
				var description = "<p>Sets your map bonus stacks to 10.</p>";
				return description;
			}, 'action', 'testMaxMapBonus();', null, 'Test', [0]);
		createSetting('testMaxTenacity',
			function () { return ('Tenacity Max Mult') },
			function () {
				var description = "<p>Sets your current cell to the last world cell in maps.</p>";
				description += "<p>Will also set the last enemy cells health to 0.</p>";
				return description;
			}, 'action', 'cheatMaxTenacity();', null, 'Test', [0]);

		createSetting('testStatMult',
			function () { return ('1e100x stats') },
			function () {
				var description = "<p>Multiplies soldier health & damage by 1e100.</p>";
				description += "<p>Doesn't have any protecion to ensure you stay below infinity health.</p>";
				return description;
			}, 'action', 'testTrimpStats();', null, 'Test', [0]);

		createSetting('testMapScumming',
			function () { return ('Slow Map Scum') },
			function () {
				var description = "<p>Will remake maps until you have 9+ slow enemies on odd cells.</p>";
				description += "<p>Will only work if you\'re in maps and on cell 1.</p>";
				description += "<p><b>Due to the map remaking process your game will hang for roughly 60s while this finds an ideal map.</b></p>";
				return description;
			}, 'action', 'mapScumming(9);', null, 'Test', [0]);

		createSetting('testMapScummingValue',
			function () { return ('Slow Map Value') },
			function () {
				var description = "<p>Will reroll for slow cells on maps when your <b>Map HD Ratio</b> is at or below this value.</p>";
				description += "<p>If running <b>Desolation</b> will roll for <b>9</b> slow enemies, otherwise will go for <b>10</b>.</p>";
				description += "<p><b>Due to the map remaking process your game will hang for a while till this finds an ideal map.</b></p>";
				return description;
			}, 'value', 1e10, null, 'Test', [2]);

		createSetting('debugEqualityStats',
			function () { return ('Debug Equality Stats') },
			function () {
				var description = "<p>Will display details of trimp/enemy stats when you gamma burst.</p>";
				description += "<p>Requires your auto equality setting to be set to <b>Auto Equality: Advanced</b></p>";
				return description;
			}, 'boolean', false, null, 'Legacy', [2]);
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

function c2Description() {
	return cinf() + "'s or special challenge (" + (currSettingUniverse === 2 ? "Mayhem, Pandemonium, Desolation" : "Frigid, Experience") + ")";
}

//Will output how many zones you can liquify to.
function checkLiqZoneCount() {
	if (game.options.menu.liquification.enabled === 0) return 0;
	/* if (game.global.universe === 2) {
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

function updateButtonText() {

	var id = 'jobType';
	var btn = autoTrimpSettings[id];
	var btnValue = getPageSetting(id);

	document.getElementById('autoJobLabel').parentNode.setAttribute('class', 'toggleConfigBtn pointer noselect autoUpgradeBtn settingBtn' + (btnValue === 2 ? 3 : btnValue));
	document.getElementById('autoJobLabel').innerHTML = btn.name()[btnValue];

	var id = 'equipOn';
	var btnValue = getPageSetting(id);

	document.getElementById('autoEquipLabel').parentNode.setAttribute('class', 'pointer noselect autoUpgradeBtn settingBtn' + btnValue);
}

MODULES.u1unlocks = [];
MODULES.u2unlocks = [];

initializeAllSettings();
//automationMenuInit();
updateATVersion();

function createSetting(id, name, description, type, defaultValue, list, container, universe, require) {
	var btnParent = document.createElement("DIV");
	btnParent.setAttribute('style', 'display: inline-block; vertical-align: top; margin-left: 0.75vw; margin-bottom: 1vw; width: 13.382vw;');
	btnParent.setAttribute("id", id + 'Parent');
	var btn = document.createElement("DIV");
	btn.id = id;
	var loaded = autoTrimpSettings[id];

	var u1Setting = (universe.indexOf(0) !== -1 || universe.indexOf(1) !== -1);
	var u2Setting = (universe.indexOf(2) !== -1);
	if (type === 'boolean') {
		if (!(loaded && id === loaded.id && loaded.type === type)) {
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				universe: universe
			};
			if (u1Setting) autoTrimpSettings[id].enabled = loaded === undefined ? (defaultValue || false) : typeof loaded.enabled === 'undefined' ? loaded : loaded.enabled;
			if (u2Setting) autoTrimpSettings[id].enabledU2 = loaded === undefined ? (defaultValue || false) : typeof loaded.enabledU2 === 'undefined' ? loaded : loaded.enabledU2;
			if (require) autoTrimpSettings[id].require = require;
		}
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

	} else if (type === 'value' || type === 'valueNegative' || type === 'multiValue') {
		if (!(loaded && id === loaded.id && loaded.type === type)) {
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				universe: universe
			};
			if (u1Setting) autoTrimpSettings[id].value = loaded === undefined || loaded === null ? defaultValue : typeof loaded.value === 'undefined' ? loaded : loaded.value;
			if (u2Setting) autoTrimpSettings[id].valueU2 = loaded === undefined || loaded === null ? defaultValue : typeof loaded.valueU2 === 'undefined' ? loaded : loaded.valueU2;
			if (require) autoTrimpSettings[id].require = require;
		}
		btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1.1vw; height: auto;");
		btn.setAttribute('class', 'noselect settingsBtn btn-info');
		btn.setAttribute("onclick", `autoSetValueToolTip("${id}", "${name()}", "${type === 'multiValue'}", "${type === 'valueNegative'}")`);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.innerHTML = name();
		btnParent.appendChild(btn);
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);
	} else if (type === 'textValue' || type === 'multiTextValue') {
		if (!(loaded && id === loaded.id && loaded.type === type)) {
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				universe: universe
			};
			if (u1Setting) autoTrimpSettings[id].value = loaded === undefined ? defaultValue : typeof loaded.value === 'undefined' ? loaded : loaded.value;
			if (u2Setting) autoTrimpSettings[id].valueU2 = loaded === undefined ? defaultValue : typeof loaded.valueU2 === 'undefined' ? loaded : loaded.valueU2;
			if (require) autoTrimpSettings[id].require = require;
		}
		btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute('class', 'noselect settingsBtn btn-info');
		btn.setAttribute("onclick", `autoSetTextToolTip("${id}", "${name()}", ${type === 'multiTextValue'})`);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.innerHTML = name();
		btnParent.appendChild(btn);
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);
	} else if (type === 'dropdown') {
		if (!(loaded && id === loaded.id && loaded.type === type)) {
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				universe: universe,
				list: list
			};
			if (u1Setting) autoTrimpSettings[id].selected = loaded === undefined ? defaultValue : typeof loaded.selected === 'undefined' ? loaded : loaded.selected;
			if (u2Setting) autoTrimpSettings[id].selectedU2 = loaded === undefined ? defaultValue : typeof loaded.selectedU2 === 'undefined' ? loaded : loaded.selectedU2;
			if (require) autoTrimpSettings[id].require = require;
		}
		var btn = document.createElement("select");
		btn.id = id;
		if (game.options.menu.darkTheme.enabled === 2) btn.setAttribute("style", "color: #C8C8C8; font-size: 1.0vw;");
		else btn.setAttribute("style", "color:black; font-size: 1.0vw;");
		btn.setAttribute("class", "noselect");
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.setAttribute("onchange", 'settingChanged("' + id + '")');
		listItems = list();
		for (var item in listItems) {
			var option = document.createElement("option");
			option.value = listItems[item];
			option.text = listItems[item];
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
	} else if (type === 'infoclick') {
		if (!(loaded && id === loaded.id && loaded.type === type)) {
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				universe: universe
			};
		}
		btn.setAttribute('class', 'noselect settingsBtn settingBtn3');
		btn.setAttribute("onclick", 'ImportExportTooltip(\'' + defaultValue + '\', \'update\')');
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.setAttribute("style", "color: black; background-color: #6495ed; font-size: 1.1vw;");
		btn.innerHTML = name();
		if (require) autoTrimpSettings[id].require = require;
		//btnParent.style.width = '';
		btnParent.appendChild(btn);
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);
		return;

	} else if (type === 'multitoggle') {
		if (!(loaded && id === loaded.id && loaded.type === type)) {
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				universe: universe
			};
			if (u1Setting) autoTrimpSettings[id].value = loaded === undefined ? defaultValue : typeof loaded.value === 'undefined' ? loaded : loaded.value;
			if (u2Setting) autoTrimpSettings[id].valueU2 = loaded === undefined ? defaultValue : typeof loaded.valueU2 === 'undefined' ? loaded : loaded.valueU2;
		}
		btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1.1vw; height: auto;");
		btn.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + autoTrimpSettings[id].value);
		btn.setAttribute("onclick", 'settingChanged("' + id + '")');
		btn.setAttribute("onmouseover", 'tooltip(\"' + name().join(' / ') + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.innerHTML = autoTrimpSettings[id].name()[autoTrimpSettings[id]["value"]];
		btnParent.appendChild(btn);
		if (require) autoTrimpSettings[id].require = require;
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
		if (!(loaded && id === loaded.id && loaded.type === type)) {
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				universe: universe
			};
			if (u1Setting) autoTrimpSettings[id].value = loaded === undefined ? defaultValue : typeof loaded.value === 'undefined' ? loaded : loaded.value;
			if (u2Setting) autoTrimpSettings[id].valueU2 = loaded === undefined ? defaultValue : typeof loaded.valueU2 === 'undefined' ? loaded : loaded.valueU2;
			if (require) autoTrimpSettings[id].require = require;
		}
		//btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute('class', 'noselect settingsBtn settingBtn3');
		btn.setAttribute('onclick', list);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.setAttribute("style", "color: black; background-color: #6495ed; font-size: 1.1vw;");
		btn.innerHTML = name();
		btnParent.appendChild(btn);
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);
		return;
	} else if (type === 'action') {
		if (!(loaded && id === loaded.id && loaded.type === type)) {
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				universe: universe
			};
			if (require) autoTrimpSettings[id].require = require;
		}
		//btn.setAttribute("style", "font-size: 1.1vw;");
		btn.setAttribute('class', 'noselect settingsBtn settingBtn3');
		btn.setAttribute('onclick', defaultValue);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.setAttribute("style", "color: black; background-color: #6495ed; font-size: 1.1vw;");
		btn.innerHTML = name();
		btnParent.appendChild(btn);
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);
		return;
	} else if (type === 'mazDefaultArray') {
		if (!(loaded && id === loaded.id && loaded.type === type)) {
			autoTrimpSettings[id] = {
				id: id,
				name: name,
				description: description,
				type: type,
				universe: universe
			};
			if (u1Setting) autoTrimpSettings[id].value = loaded === undefined ? defaultValue : typeof loaded.value === 'undefined' ? loaded : loaded.value;
			if (u2Setting) autoTrimpSettings[id].valueU2 = loaded === undefined ? defaultValue : typeof loaded.valueU2 === 'undefined' ? loaded : loaded.valueU2;
			if (require) autoTrimpSettings[id].require = require;
		}
		return;
	}
	if (autoTrimpSettings[id].name !== name)
		autoTrimpSettings[id].name = name;
	if (autoTrimpSettings[id].description !== description)
		autoTrimpSettings[id].description = description;
}

function settingChanged(id, currUniverse) {
	autoMapsBtn = id === 'autoMapsToggle';
	if (autoMapsBtn) {
		id = 'autoMaps';
		currUniverse = true;
	}

	var btn = autoTrimpSettings[id];
	var radonon = currUniverse ? game.global.universe === 2 : autoTrimpSettings.radonsettings.value === 1;
	if (btn.type === 'boolean') {
		var enabled = 'enabled'
		if (radonon && btn.universe.indexOf(0) === -1) enabled += 'U2';
		btn[enabled] = !btn[enabled];
		document.getElementById(id).setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + btn[enabled]);
		if (id === 'equipEfficientEquipDisplay') {
			displayMostEfficientEquipment();
		}
		if (id === 'equipOn') {
			document.getElementById('autoEquipLabel').parentNode.setAttribute('class', 'pointer noselect autoUpgradeBtn settingBtn' + btn[enabled]);
		}
		if (id === 'buildingsType') {
			document.getElementById('autoStructureLabel').parentNode.setAttribute('class', 'toggleConfigBtn pointer noselect autoUpgradeBtn settingBtn' + btn[enabled]);
		}
		if (id === "c2disableFinished") modifyParentNodeUniverseSwap();

		if (id === "displayHeHr") {
			document.getElementById('hiderStatus').style.display = btn[enabled] ? 'block' : 'none';
		}
	}

	if (btn.type === 'multitoggle') {
		var value = 'value'
		if (radonon && btn.universe.indexOf(0) === -1) value += 'U2';
		if (id === 'AutoMagmiteSpender2' && btn[value] === 1) {
			magmiteSpenderChanged = true;
			setTimeout(function () {
				magmiteSpenderChanged = false;
			}, 5000);
		}
		//Skip no unique setting for automaps button in battle container
		if (autoMapsBtn && btn[value] === 1) {
			btn[value]++;
		}
		btn[value]++;
		if (btn[value] > btn.name().length - 1)
			btn[value] = 0;
		document.getElementById(id).setAttribute('class', 'noselect settingsBtn settingBtn' + btn[value]);
		document.getElementById(id).innerHTML = btn.name()[btn[value]]
		if (id === 'jobType') {
			document.getElementById('autoJobLabel').parentNode.setAttribute('class', 'toggleConfigBtn pointer noselect autoUpgradeBtn settingBtn' + (btn[value] === 2 ? 3 : btn[value]));
			document.getElementById('autoJobLabel').innerHTML = btn.name()[btn[value]];
		}
		if (id === 'dailyPortal') {
			document.getElementById(btn.id).setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + (btn[value] === 2 ? 3 : btn[value]));
		}
		if (id === 'autoMaps' && btn[value] !== 2) {
			//Use regular class for AutoMaps button UNLESS we are in TW then use special case to make it look prettier!
			document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + btn[value])
			document.getElementById('autoMapBtnTW').setAttribute('class', 'btn btn-lg btn-warning offlineExtraBtn settingsBtn settingBtn' + btn[value]);
		}
	}

	if (btn.type === 'dropdown') {
		var selected = 'selected'
		if (radonon && btn.universe.indexOf(0) === -1) selected += 'U2';
		btn[selected] = document.getElementById(id).value;
	}

	updateCustomButtons(id === 'radonsettings' || id === 'heirloomAutoRareToKeep');
	saveSettings();
}

//Tells the script when to insert a break or remove a break to put settings on new lines.
function modifyParentNode(id, style) {
	//Set style to 'show' to insert a break OR 'hide' to remove.
	var style = !style ? 'show' : style;
	var elem = document.getElementById(id).parentNode;

	//Looks at the next element in the DOM and either adds or removes a break depending on what style is set to.
	var elemSibling = elem.nextElementSibling;
	var nextElemSibling = elemSibling.nextElementSibling;
	//Insert break if it doesn't exist.
	if (style === 'show' && elemSibling.style.length !== 0 && elemSibling.style.display !== 'none')
		elem.insertAdjacentHTML('afterend', '<br>');
	//Remove the break if it exists.
	if (style === 'hide' && elemSibling.style.length === 0)
		elemSibling.remove();
	//Remove break if we are hiding the element and the next element is a break.
	if (elemSibling.style.length === 0 && nextElemSibling.style.display === 'none')
		elemSibling.remove();

	return;
}

//Tells the script which settings you want a new line after.
function modifyParentNodeUniverseSwap() {

	var radonon = getPageSetting('radonsettings') === 1 ? 'show' : 'hide';
	var radonoff = getPageSetting('radonsettings') === 0 ? 'show' : 'hide';
	var heirloom = getPageSetting('heirloomAuto', currSettingUniverse) ? 'show' : 'hide';

	//Core

	modifyParentNode("portalVoidIncrement", radonon);
	modifyParentNode("radonsettings", 'show');

	//Dailies
	modifyParentNode("dscryvoidmaps", radonoff);
	modifyParentNode("dPreSpireNurseries", radonoff);
	modifyParentNode("liqstack", radonoff);
	modifyParentNode("mapOddEvenIncrement", 'show');
	modifyParentNode("dailyHeliumHrPortal", 'show');

	if (getPageSetting('displayAllSettings')// || (getPageSetting('autoPortal', currSettingUniverse).includes('Hour') && holidayObj.holiday === 'Eggy')
	) modifyParentNode("heliumC2Challenge", 'show');
	else modifyParentNode("heliumC2Challenge", 'hide');

	//Maps
	modifyParentNode("recycleExplorer", 'show');
	modifyParentNode("scryvoidmaps", 'show');
	modifyParentNode("uniqueMapSettingsArray", 'show');

	//Gear
	modifyParentNode("equipPercent", 'show');
	modifyParentNode("equipNoShields", 'show');
	modifyParentNode("equipShieldBlock", 'show');

	//Spire
	//None!

	//Combat
	modifyParentNode("gammaBurstCalc", radonoff);
	modifyParentNode("screwessence", radonoff);

	//ATGA
	modifyParentNode("geneAssistTimerSpire", radonoff);
	modifyParentNode("geneAssistTimerAfter", radonoff);
	modifyParentNode("geneAssistTimerSpireDaily", radonoff);

	//C2
	modifyParentNode("c2disableFinished", 'show');
	modifyParentNode("c2Fused", 'show');

	modifyParentNode("experienceEndBW", radonon);
	modifyParentNode("unbalanceImprobDestack", radonon);
	modifyParentNode("duelShield", radonon);
	modifyParentNode("trappapaloozaTrap", radonon);
	modifyParentNode("wither", radonon);
	modifyParentNode("questSmithyMaps", radonon);
	modifyParentNode("mayhemSwapZone", radonon);
	modifyParentNode("stormStacks", radonon);
	modifyParentNode("pandemoniumSwapZone", radonon);
	modifyParentNode("glassStacks", radonon);
	modifyParentNode("desolationSwapZone", radonon);

	//Buildings
	modifyParentNode("autGigaDeltaFactor", radonoff);

	//Challenges
	modifyParentNode("balanceImprobDestack", radonoff);
	modifyParentNode("decayStacksToAbandon", radonoff);
	modifyParentNode("lifeStacks", radonoff);
	modifyParentNode("mapologyPrestige", radonoff);
	//modifyParentNode("toxicityStacks", radonon);
	modifyParentNode("archaeologyString3", radonon);

	//Magma
	modifyParentNode("AutoGenC2", radonoff);

	//Heirlooms
	modifyParentNode("heirloomCompressedSwap", 'show');
	modifyParentNode("heirloomSpire", 'show');
	modifyParentNode("heirloomSwapHDCompressed", 'show');
	modifyParentNode("heirloomStaffVoid", 'show');
	modifyParentNode("heirloomStaffResource", 'show');

	modifyParentNode("heirloomAutoTypeToKeep", heirloom);
	modifyParentNode("heirloomAutoShieldMod7", heirloom);
	modifyParentNode("heirloomAutoStaffMod7", heirloom);
	//Golden
	//None!

	//Nature
	modifyParentNode("AutoIce", radonoff);
	modifyParentNode("autoenlight", radonoff);
	modifyParentNode("iceEnlight", radonoff);
	modifyParentNode("iceEnlightDaily", radonoff);

	//Display
	modifyParentNode("automateSpireAssault", radonon);
	modifyParentNode("EnableAFK", radonoff);

	//Test
	modifyParentNode("testTotalEquipmentCost", 'show');
}

function challengeUnlock(challenge, setting, c2) {
	//Skips running if the challenge is already unlocked.
	if ((Object.keys(MODULES.u1unlocks).length !== 0 && MODULES.u1unlocks.challenge.includes(challenge)) || (Object.keys(MODULES.u2unlocks).length !== 0 && MODULES.u2unlocks.challenge.includes(challenge))) {
		return '';
	}
	var c2Msg = game.global.universe === 2 ? '3' : '2';
	var msg = "You have unlocked the " + challenge + " challenge.";
	msg += " It has now been added to " + (c2 ? "Challenge " + c2Msg + " AutoPortal setting" : "AutoPortal");
	msg += (setting ? " & there's settings for it in the AT " + (c2 ? '"C' + c2Msg + '"' : '"Challenges"') + " tab." : '.');
	if (challenge === "Frigid" || challenge === "Experience" || challenge === "Mayhem" || challenge === "Pandemonium" || challenge === "Desolation") msg += "<br><br><b>This is a special challenge and will use " + cinf() + " settings when run.</b>";
	return msg;
}

MODULES.u1unlocks = [];
MODULES.u2unlocks = [];

//autoPortal
function autoPortalChallenges() {
	var hze;
	var challenge = [];
	if (currSettingUniverse === 2) {
		hze = game.stats.highestRadLevel.valueTotal();
		challenge = ["Off", "Radon Per Hour"];
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
	}
	else {
		hze = game.stats.highestLevel.valueTotal();
		challenge = ["Off", "Helium Per Hour"];
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
		if (hze >= 460) challenge.push('Frigid');
		if (hze >= 600) challenge.push("Experience");
		challenge.push("Custom");
		if (hze >= 65) challenge.push("Challenge 2");
	}
	return challenge;
}
//heliumHourChallenge && dailyHeliumHourChallenge
function heliumHourChallenges(isDaily) {
	var hze;
	var challenge = ["None"];
	if (currSettingUniverse === 2) {
		hze = game.stats.highestRadLevel.valueTotal();
		if (hze >= 40) challenge.push("Bublé");
		if (hze >= 55) challenge.push("Melt");
		if (hze >= 70) challenge.push("Quagmire");
		if (hze >= 85) challenge.push("Quest");
		if (hze >= 90) challenge.push("Archaeology");
		if (hze >= 110) challenge.push("Insanity");
		if (hze >= 135) challenge.push("Nurture");
		if (hze >= 155) challenge.push("Alchemy");
		if (hze >= 175) challenge.push("Hypothermia");
		if (isDaily && hze >= 50) challenge.push("Challenge 3");
	}
	else {
		hze = game.stats.highestLevel.valueTotal();
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
		if (isDaily && hze >= 65) challenge.push("Challenge 2");
	}
	return challenge;
}
//heliumC2Challenge && dailyC2Challenge
function heliumC2Challenges() {
	var hze;
	var challenge = ["None"];
	if (currSettingUniverse === 2) {
		hze = game.stats.highestRadLevel.valueTotal();
		if (hze >= 15) challenge.push("Unlucky");
		if (hze >= 20) challenge.push("Downsize");
		if (hze >= 25) challenge.push("Transmute");
		if (hze >= 35) challenge.push("Unbalance");
		if (hze >= 45) challenge.push("Duel");
		if (hze >= 60) challenge.push("Trappapalooza");
		if (hze >= 70) challenge.push("Wither");
		if (hze >= 85) challenge.push("Quest");
		if (hze >= 100) challenge.push("Mayhem");
		if (hze >= 105) challenge.push("Storm");
		if (hze >= 115) challenge.push("Berserk");
		if (hze >= 150) challenge.push("Pandemonium");
		if (hze >= 175) challenge.push("Glass");
		if (hze >= 200) challenge.push('Desolation');
		if (hze >= 201) challenge.push("Smithless");
	}
	else {
		hze = game.stats.highestLevel.valueTotal();
		if (getTotalPerkResource(true) >= 30) challenge.push("Discipline");
		if (hze >= 25) challenge.push("Metal");
		if (hze >= 35) challenge.push("Size");
		if (hze >= 40) challenge.push("Balance");
		if (hze >= 45) challenge.push("Meditate");
		if (hze >= 60) challenge.push("Trimp");
		if (hze >= 70) challenge.push("Trapper");
		if (game.global.prisonClear >= 1) challenge.push("Electricity");
		if (hze >= 120) challenge.push("Coordinate");
		if (hze >= 130) challenge.push("Slow");
		if (hze >= 145) challenge.push("Nom");
		if (hze >= 150) challenge.push("Mapology");
		if (hze >= 165) challenge.push("Toxicity");
		if (hze >= 180) challenge.push("Watch");
		if (hze >= 180) challenge.push("Lead");
		if (hze >= 425) challenge.push("Obliterated");
		if (game.global.totalSquaredReward >= 4500) challenge.push("Eradicated");
		if (hze >= 460) challenge.push('Frigid');
		if (hze >= 600) challenge.push("Experience");
	}
	return challenge;
}

//Checks to see if we should inform the user of any new challenge unlocks.
function challengeUnlockCheck() {
	if (game.global.universe === 2) return challengeUnlockCheckU2();
	var hze = game.stats.highestLevel.valueTotal();
	var challenge = ["None"];

	if (getTotalPerkResource(true) >= 30) challenge.push("Discipline");
	if (hze >= 25) challenge.push("Metal");
	if (hze >= 35) challenge.push("Size");
	if (hze >= 40) challenge.push("Balance");
	if (hze >= 45) challenge.push("Meditate");
	if (hze >= 55) challenge.push("Decay");
	if (hze >= 60) challenge.push("Trimp");
	if (hze >= 70) challenge.push("Trapper");
	if (game.global.prisonClear >= 1) challenge.push("Electricity");
	if (hze > 110) challenge.push("Life");
	if (hze >= 120) challenge.push("Coordinate");
	if (hze > 125) challenge.push("Crushed");
	if (hze >= 130) challenge.push("Slow");
	if (hze >= 145) challenge.push("Nom");
	if (hze >= 150) challenge.push("Mapology");
	if (hze >= 165) challenge.push("Toxicity");
	if (hze >= 180) challenge.push("Watch");
	if (hze >= 180) challenge.push("Lead");
	if (hze >= 215) challenge.push("Domination");
	if (hze >= 425) challenge.push("Obliterated");
	if (game.global.totalSquaredReward >= 4500) challenge.push("Eradicated");
	if (hze >= 460) challenge.push('Frigid');
	if (hze >= 600) challenge.push("Experience");
	if (Object.keys(MODULES.u1unlocks).length === 0) {
		MODULES.u1unlocks.challenge = challenge;
		return;
	}
	//Sets up messages when the challenges are unlocked.
	//Tooltip is sent to users and can't be deleted until they click confirm.
	var message = '';
	if (hze === 40) {
		message = challengeUnlock('Balance', false, false);
		message += "<br><br>"
		message = "Upon unlocking Balance AT has a new settings tab available called 'Challenge'. Here you will find a variety of settings that might be beneficial when running this challenge.";
	} else if (hze === 55) {
		message = challengeUnlock('Decay', true, false);
	} else if (hze === 60) {
		message = "Upon unlocking Warpstations's AT has a new settings tab available called 'Buildings'. Here you will find a variety of settings that will help with this new feature.";
	} else if (hze === 65) {
		message = "Due to unlocking Challenge 2's there is now a Challenge 2 option under AutoPortal to be able to auto portal into them. Also you can now access the C2 tab within the AT settings.";
	} else if (hze === 70) {
		message = challengeUnlock('Trapper', false, true);
		message += "<br><br>"
		message = "Upon unlocking Geneticist's AT has a new settings tab available called 'Jobs'. Here you will find a variety of settings that will help with this new feature.";
	} else if (game.global.prisonClear >= 1 && !MODULES.u1unlocks.challenge.includes('Electricity')) {
		message = challengeUnlock('Electricity', false, true);
	} else if (hze === 100) {
		message = "You can now access the Daily tab within the AT settings. Here you will find a variety of settings that will help optimise your dailies.";
	} else if (hze === 110) {
		message = challengeUnlock('Life', true, false);
	} else if (hze === 120) {
		message = challengeUnlock('Coordinate', false, true);
	} else if (hze === 125) {
		message = challengeUnlock('Crushed');
	} else if (hze === 130) {
		message = challengeUnlock('Slow', false, true);
	} else if (hze === 145) {
		message = challengeUnlock('Nom', false, true);
	} else if (hze === 150) {
		message = challengeUnlock('Mapology', true, true);
	} else if (hze === 165) {
		message = challengeUnlock('Toxicity', false, true);
	} else if (hze === 180) {
		message = challengeUnlock('Watch', false, true);
	} else if (hze === 180) {
		message = challengeUnlock('Lead', false, true);
	} else if (hze === 190) {
		message = challengeUnlock('Corrupted', false, true);
	} else if (hze === 215) {
		message = challengeUnlock('Domination', false, true);
	} else if (hze === 230) {
		message = "Upon unlocking the Dimensional Generator building AT has a new settings tab available called 'Magma'. Here you will find a variety of settings that will help optimise your generator. Additionally there's a new setting in the 'Buildings' tab called 'Advanced Nurseries' that will potentially be of help with the Nursery destruction mechanic.";
	} else if (hze === 236) {
		message = "Upon unlocking Nature, AutoTrimps has a new settings tab available called 'Nature'. Here you will find a variety of settings that will help with this new feature.";
	} else if (hze === 425) {
		message = challengeUnlock('Obliterated', false, true);
	} else if (game.global.totalSquaredReward >= 4500 && !MODULES.u1unlocks.challenge.includes('Eradicated')) {
		message = challengeUnlock('Eradicated', false, true);
	} else if (hze === 460) {
		message = challengeUnlock('Frigid', false, true);
	} else if (hze === 600) {
		message = challengeUnlock('Experience', true, true);
	}
	if (message !== '') {
		message += "<br><br><b>To disable this popup, click confirm!<b>";
		hzeMessage = message;
		popupsAT.challenge = true;
		tooltip('confirm', null, 'update', hzeMessage, ('popupsAT.challenge = false, delete hzeMessage'), 'AutoTrimps New Unlock!');
	}

	MODULES.u1unlocks.challenge = challenge;
}

//Checks to see if we should inform the user of any new challenge unlocks in U2.
function challengeUnlockCheckU2() {
	var hze = game.stats.highestRadLevel.valueTotal();
	var challenges = [];

	var challenges = ["None"];
	if (hze >= 15) challenges.push("Unlucky");
	if (hze >= 20) challenges.push("Downsize");
	if (hze >= 25) challenges.push("Transmute");
	if (hze >= 35) challenges.push("Unbalance");
	if (hze >= 40) challenges.push("Bublé");
	if (hze >= 45) challenges.push("Duel");
	if (hze >= 55) challenges.push("Melt");
	if (hze >= 60) challenges.push("Trappapalooza");
	if (hze >= 70) challenges.push("Wither");
	if (hze >= 70) challenges.push("Quagmire");
	if (hze >= 85) challenges.push("Quest");
	if (hze >= 90) challenges.push("Archaeology");
	if (hze >= 100) challenges.push("Mayhem");
	if (hze >= 105) challenges.push("Storm");
	if (hze >= 110) challenges.push("Insanity");
	if (hze >= 115) challenges.push("Berserk");
	if (hze >= 135) challenges.push("Nurture");
	if (hze >= 150) challenges.push("Pandemonium");
	if (hze >= 155) challenges.push("Alchemy");
	if (hze >= 175) challenges.push("Hypothermia");
	if (hze >= 175) challenges.push("Glass");
	if (hze >= 200) challenges.push('Desolation');
	if (hze >= 201) challenges.push("Smithless");

	if (Object.keys(MODULES.u2unlocks).length === 0) {
		MODULES.u2unlocks.challenge = challenges;
		return;
	}

	var message = '';
	//Transmute
	if (hze === 25) {
		message = "You have unlocked the Transmute challenge. Any metal related settings will be converted to wood instead while running this challenge.";
	} //Dailies
	else if (hze === 30) {
		message = "You can now access the Daily tab within the AT settings. Here you will find a variety of settings that will help optimise your dailies.";
	} //Unblance
	else if (hze === 35) {
		message = challengeUnlock('Unbalance', true, true);
	} //Duel
	else if (hze === 45) {
		message = challengeUnlock('Duel', true, true);
	} //Bublé
	else if (hze === 40) {
		message = challengeUnlock('Bublé');
	} //C3, Melt, Worshippers
	else if (hze === 50) {
		//C3
		message = "Due to unlocking Challenge 3's there is now a Challenge 3 option under AutoPortal to be able to auto portal into them. Also you can now access the C3 tab within the AT settings.";
		//Melt
		message += "<br><br>"
		message += challengeUnlock('Melt');
		//Worshippers
		message += "<br><br>"
		message += "You can now use the Worshipper Farm setting. This can be found in the AT 'Maps' tab.";
	} //Trappapalooza
	else if (hze === 60) {
		message = challengeUnlock('Trappapalooza', true, true);
	} //Quagmire
	else if (hze === 70) {
		message = challengeUnlock('Quagmire', true, false);
		//Wither
		message += challengeUnlock('Wither', true, true);
	} //Quest
	else if (hze === 85) {
		message = challengeUnlock('Quest', true, true);
	} //Archaeology
	else if (hze === 90) {
		message = challengeUnlock('Archaeology', true, false);
	} //Mayhem
	else if (hze === 100) {
		message = challengeUnlock('Mayhem', true, true);
	} //Storm
	else if (hze === 105) {
		message = challengeUnlock('Storm', true, true);
	} //Insanity
	else if (hze === 110) {
		message = challengeUnlock('Insanity', true, false);
	} //Berserk
	else if (hze === 115) {
		message = challengeUnlock('Berserk');
	} //Nurture
	else if (hze === 135) {
		message = challengeUnlock('Nurture', false, false) + " There is also setting for Laboratory's that has been added to the AutoStructure setting.";
	} //Pandemonium
	else if (hze === 150) {
		message = challengeUnlock('Pandemonium', true, true);
	} //Alchemy
	else if (hze === 155) {
		message = challengeUnlock('Alchemy', true, false);
	} //Hypothermia
	else if (hze === 175) {
		message = challengeUnlock('Hypothermia', true, false);
		//Glass
		message += "<br><br>"
		message += challengeUnlock('Glass', true, true);
	} //Desolation
	else if (hze === 200) {
		message = challengeUnlock('Desolation', true, true);
	} //Smithless
	else if (hze === 201) {
		message = challengeUnlock('Smithless', true, true);
	}
	if (message !== '') {
		message += "<br><br><b>To disable this popup, click confirm!<b>";
		hzeMessage = message;
		popupsAT.challenge = true;
		tooltip('confirm', null, 'update', hzeMessage, ('popupsAT.challenge = false, delete hzeMessage'), 'AutoTrimps New Unlock!');
	}
	MODULES.u2unlocks.challenge = challenges;
}

//Remakes challenge/setting popup if the user doesn't click confirm and it's not showing.
function remakeTooltip() {
	if (!popupsAT.challenge && !popupsAT.respecAtlantrimp && !popupsAT.portal) {
		if (!popupsAT.challenge) delete hzeMessage
		return;
	}
	if (!game.global.lockTooltip) {
		if (popupsAT.respecAtlantrimp) {
			var description = "<p><b>Respeccing into " + (!hdStats.isC3 ? "Radon " : "") + "Combat Respec preset.</b></p>";
			tooltip('confirm', null, 'update', description + '<p>Hit <b>Disable Respec</b> to stop this.</p>', 'popupsAT.respecAtlantrimp = false', '<b>NOTICE: Auto-Respeccing in ' + popupsAT.remainingTime + ' seconds....</b>', 'Disable Respec');
		}
		else if (popupsAT.challenge) {
			tooltip('confirm', null, 'update', hzeMessage, ('popupsAT.challenge = false, delete hzeMessage'), 'AutoTrimps New Unlock!');
		}
		else {
			tooltip('confirm', null, 'update', '<b>Auto Portaling NOW!</b><p>Hit Delay Portal to WAIT 1 more zone.', 'zonePostpone+=1; popupsAT.portal = false', '<b>NOTICE: Auto-Portaling in ' + popupsAT.remainingTime + ' seconds....</b>', 'Delay Portal');
		}
	}
	else if (popupsAT.respecAtlantrimp) {
		document.getElementById('tipTitle').innerHTML = "<b>NOTICE: Auto-Respeccing in " + (popupsAT.remainingTime / 1000).toFixed(1) + " seconds....</b>"
	}
	else if (popupsAT.portal) {
		document.getElementById('tipTitle').innerHTML = "<b>NOTICE: Auto-Portaling in " + (popupsAT.remainingTime / 1000).toFixed(1) + " seconds....</b>"
	}
}

//It sets the options for the heirloom auto selecter based on the highest zone ever reached, and the current universe.
function autoHeirloomOptions(heirloomType) {
	if (!atFinishedLoading) return;
	var heirloomRarity = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
	var raretokeep = heirloomRarity.indexOf(getPageSetting('heirloomAutoRareToKeep' + heirloomType.slice(0, 1).toUpperCase() + heirloomType.slice(1, heirloomType.length), currSettingUniverse));
	var heirloomModsArray = [];

	heirloomModsArray = ["Any"];

	for (var item in game.heirlooms[heirloomType]) {
		var heirloom = game.heirlooms[heirloomType][item];
		if (item === "empty") continue;
		if (typeof heirloom.filter !== 'undefined' && !heirloom.filter()) continue;
		if (heirloom.steps && heirloom.steps[raretokeep] === -1) continue;
		heirloomModsArray.push(heirloomMods[heirloomType][item]);
	}

	return heirloomModsArray;
}

function autoSetValueToolTip(id, text, multi, negative) {
	ranstring = text;
	var value = 'value'
	if (autoTrimpSettings.radonsettings.value === 1 && autoTrimpSettings[id].universe.indexOf(0) === -1) value += 'U2';
	var elem = document.getElementById("tooltipDiv");
	var tooltipText = 'Type a number below. You can also use shorthand such as 2e5 or 200k.';
	if (negative)
		tooltipText += ' Accepts negative numbers as validated inputs.';
	else
		tooltipText += ' Put -1 for Infinite.';
	tooltipText += `<br/><br/><input id="customNumberBox" style="width: 100%" onkeypress="onKeyPressSetting(event, '${id}', ${multi}, ${negative})" value="${autoTrimpSettings[id][value]}"></input>`;
	var costText = '<div class="maxCenter"><div class="btn btn-info" onclick="autoSetValue(\'' + id + '\',' + multi + ',' + negative + ')">Apply</div><div class="btn btn-info" onclick="cancelTooltip()">Cancel</div></div>';
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

function autoSetTextToolTip(id, text, multiValue) {
	ranstring = text;
	var elem = document.getElementById("tooltipDiv");
	var value = 'value'
	if (autoTrimpSettings.radonsettings.value === 1 && autoTrimpSettings[id].universe.indexOf(0) === -1) value += 'U2';
	var tooltipText = 'Type your input below';
	tooltipText += `<br/><br/><input id="customTextBox" style="width: 100%" onkeypress="onKeyPressSetting(event, '${id}', ${multiValue})" value="${autoTrimpSettings[id][value]}"></input>`;
	var costText = '<div class="maxCenter"><div class="btn btn-info" onclick="autoSetText(\'' + id + '\',' + multiValue + ')">Apply</div><div class="btn btn-info" onclick="cancelTooltip()">Cancel</div></div>';
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

function onKeyPressSetting(event, id, multi, negative) {
	if (event.which === 13 || event.keyCode === 13) {
		if (negative !== undefined && multi !== undefined)
			autoSetValue(id, multi, negative);
		else
			autoSetText(id, multi);
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
				if (suffices[x].toLowerCase() === letters) {
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

function autoSetValue(id, multiValue, negative) {
	var value = 'value'
	if (autoTrimpSettings.radonsettings.value === 1 && autoTrimpSettings[id].universe.indexOf(0) === -1) value += 'U2';
	var num = 0;
	unlockTooltip();
	tooltip('hide');
	var numBox = document.getElementById('customNumberBox');
	if (numBox) {
		num = numBox.value;
		if (multiValue) {
			num = num.split(',').map(parseNum);
			for (var item in num) {
				if (isNaN(item) || item === null || item === '') {
					return tooltip('confirm', null, 'update', 'Error with input ("' + numBox.value + '"), please try again', null, '<b>' + autoTrimpSettings[id].name() + ' Setting Input Error!');
				}
			}
		} else {
			num = parseNum(num);
			if (isNaN(num) || num === null || num === '') {
				return tooltip('confirm', null, 'update', 'Error with input ("' + numBox.value + '"), please try again', null, '<b>' + autoTrimpSettings[id].name() + ' Setting Input Error!');
			}
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

function autoSetText(id, multiValue) {
	var textVal = 'empty';
	var value = 'value'
	if (autoTrimpSettings.radonsettings.value === 1 && autoTrimpSettings[id].universe.indexOf(0) === -1) value += 'U2';
	unlockTooltip();
	tooltip('hide');
	var textBox = document.getElementById('customTextBox');
	if (textBox) {
		if (multiValue) {
			textVal = textBox.value.replace(/, /g, ",");
			textVal = textVal.split(',').map(String);
		} else {
			textVal = textBox.value
		}
	} else return

	autoTrimpSettings[id][value] = textVal;
	if (textVal !== undefined) {

		if (Array.isArray(textVal) && textVal.length === 1 && textVal[0] === -1)
			document.getElementById(id).innerHTML = ranstring + ': ' + "<span class='icomoon icon-infinity'></span>";
		else if (Array.isArray(textVal))
			document.getElementById(id).innerHTML = ranstring + ': ' + textVal[0] + '+';
		else if (textVal.length > 18)
			document.getElementById(id).innerHTML = ranstring + ': ' + textVal.substring(0, 21) + '...';
		else
			document.getElementById(id).innerHTML = ranstring + ': ' + textVal.substring(0, 21);
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
	$item = document.getElementById('graphParent');
	if ($item.style.display === 'block')
		$item.style.display = 'none';
	$item = document.getElementById('autoTrimpsTabBarMenu');
	if ($item.style.display === 'block')
		$item.style.display = 'none';
	toggleSettingsMenu();
}

function toggleElem(elem, showHide) {
	var $item = document.getElementById(elem);
	if ($item === null) return;
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
		if (getPageSetting('displayAllSettings') || autoTrimpSettings[elem].require()) {
			toggleElem(elem, true);
		}
		else
			toggleElem(elem, false);
	}

	else toggleElem(elem, true);
}

function updateCustomButtons(initialLoad) {
	if (typeof lastTheme !== 'undefined' && lastTheme && game.options.menu.darkTheme.enabled !== lastTheme) {
		if (typeof MODULES["graphs"] !== 'undefined')
			MODULES["graphs"].themeChanged();
		debug("Theme change - AutoTrimps styles updated.", "other");
		lastTheme = game.options.menu.darkTheme.enabled;
	}

	//Hide settings
	//Radon
	var radonon = autoTrimpSettings.radonsettings.value === 1;
	currSettingUniverse = (autoTrimpSettings.radonsettings.value + 1);

	//Loops through all the AT settings so we can properly setup the UI.
	for (var setting in autoTrimpSettings) {
		if (setting === 'ATversion') continue;
		var item = autoTrimpSettings[setting];
		//Looks for the settings that don't exist anymore and deletes them.
		if (item === null || typeof item.id === 'undefined') {
			//Skip ATversion. Deletes old settings.
			if (atFinishedLoading) delete autoTrimpSettings[setting];
			continue;
		}
		var settingUniverse = item.universe;
		//Looping the deletion process again for old settings that got loaded but don't have the universe property.
		if (!Array.isArray(settingUniverse)) {
			if (atFinishedLoading) delete autoTrimpSettings[setting];
			continue;
		}
		//Skips ever looking at settings with the mazDefaultArray type.
		if (item.type === 'mazDefaultArray') continue;
		//Skip if it's not a setting from the current universe.
		else if (settingUniverse.indexOf(currSettingUniverse) !== -1 || settingUniverse.indexOf(0) !== -1) {
			turnOn(setting, radonon);
		} else {
			turnOff(setting)
		};

		//Skips items not from the universe settings we're looking at. Has to be here so that they're disabled when swapping universe settings.
		if (settingUniverse.indexOf(currSettingUniverse) === -1 && settingUniverse.indexOf(0) === -1)
			continue;

		//Looks at all the settings that are from the current universe and sets them up. Will set text, tooltips.	
		//Only happens when initialLoad is called which should only happen the 1st time AT loads or radonsettings is toggled.
		if (initialLoad) {
			var elem = document.getElementById(item.id);
			if (item.type === 'boolean') {
				var itemEnabled = item.enabled;
				if (radonon && settingUniverse.indexOf(0) === -1) itemEnabled = item['enabled' + 'U2'];
				elem.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + itemEnabled);
				elem.setAttribute("onmouseover", 'tooltip(\"' + item.name() + '\", \"customText\", event, \"' + item.description() + '\")');

				elem.innerHTML = item.name();
			}
			else if (item.type === 'value' || item.type === 'valueNegative' || item.type === 'multitoggle' || item.type === 'multiValue' || item.type === 'textValue' || item.type === 'multiTextValue') {
				var itemValue = item.value;
				if (radonon && settingUniverse.indexOf(0) === -1) itemValue = item['value' + 'U2'];
				if (elem !== null) {
					if (item.type === 'multitoggle') {
						elem.innerHTML = item.name()[itemValue];
						elem.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + itemValue);
					}
					else if (item.type === 'textValue' && typeof itemValue !== 'undefined' && itemValue.substring !== undefined) {
						if (itemValue.length > 18)
							elem.innerHTML = item.name() + ': ' + itemValue.substring(0, 21) + '...';
						else
							elem.innerHTML = item.name() + ': ' + itemValue.substring(0, 21);
					}
					else if (item.type === 'multiValue' || item.type === 'multiTextValue') {
						if (Array.isArray(itemValue) && itemValue.length === 1 && itemValue[0] === -1)
							elem.innerHTML = item.name() + ': ' + "<span class='icomoon icon-infinity'></span>";
						else if (Array.isArray(itemValue))
							elem.innerHTML = item.name() + ': ' + itemValue[0] + '+';
						else
							elem.innerHTML = item.name() + ': ' + itemValue;
					}
					else if (itemValue > -1 || item.type === 'valueNegative') {
						elem.innerHTML = item.name() + ': ' + prettify(itemValue);
					}
					else
						elem.innerHTML = item.name() + ': ' + "<span class='icomoon icon-infinity'></span>";
				}
			}
			else if (item.type !== 'dropdown') {
				elem.innerHTML = item.name();
			}
			else if (item.type === 'dropdown') {
				var itemSelected = item.selected;
				if (radonon && settingUniverse.indexOf(0) === -1) itemSelected = item['selected' + 'U2'];
				elem.innerHTML = '';
				var listItems = item.list();
				for (var dropdown in listItems) {
					var option = document.createElement("option");
					option.value = listItems[dropdown];
					option.text = listItems[dropdown];
					elem.appendChild(option);
				}
				elem.value = itemSelected
			}
			if (item.type === 'multitoggle') {
				elem.setAttribute("onmouseover", 'tooltip(\"' + item.name().join(' / ') + '\", \"customText\", event, \"' + item.description() + '\")');
			}
			else {
				elem.setAttribute("onmouseover", 'tooltip(\"' + item.name() + '\", \"customText\", event, \"' + item.description() + '\")');
				//Updating input box & text that will be displayed upon saving!
				if (item.type === 'value' || item.type === 'multiValue' || item.type === 'valueNegative') elem.setAttribute("onclick", `autoSetValueToolTip("${item.id}", "${item.name()}", "${item.type === 'multiValue'}", "${item.type === 'valueNegative'}")`);
				if (item.type === 'textValue') elem.setAttribute("onclick", `autoSetTextToolTip("${item.id}", "${item.name()}", ${item.type === 'multiTextValue'})`);
			}
		}
	}

	//Sets up if the tabs will be visible or not.
	//Only happens when initialLoad is called which should only happen the 1st time AT loads or radonsettings is toggled.
	if (initialLoad) {
		var hze = game.stats.highestLevel.valueTotal();
		var highestRadonZone = game.stats.highestRadLevel.valueTotal();
		var displayAllSettings = getPageSetting('displayAllSettings');
		//Swapping name and description of C2 tab when Radon is toggled on.
		if (document.getElementById("C2").children[0].children[0].innerHTML !==
			(cinf() + ' - Settings for ' + c2Description())
		) document.getElementById("C2").children[0].children[0].innerHTML =
			(cinf() + ' - Settings for ' + c2Description());

		if (document.getElementById("tabC2").children[0].innerHTML !== cinf()) document.getElementById("tabC2").children[0].innerHTML = cinf();

		//Tabs
		if (document.getElementById("tabBuildings") !== null) {
			document.getElementById("tabBuildings").style.display = !displayAllSettings && (radonon || (!radonon && hze < 60)) ? "none" : "";
		}
		if (document.getElementById("tabDaily") !== null) {
			document.getElementById("tabDaily").style.display = !displayAllSettings && ((radonon && highestRadonZone < 30) || (!radonon && hze < 99)) ? "none" : "";
		}
		if (document.getElementById("tabC2") !== null) {
			document.getElementById("tabC2").style.display = !displayAllSettings && (!radonon && hze < 65) ? "none" : "";
		}
		if (document.getElementById("tabSpire") !== null) {
			document.getElementById("tabSpire").style.display = radonon || (!displayAllSettings && hze < 190) ? "none" : "";
		}
		if (document.getElementById("tabJobs") !== null) {
			document.getElementById("tabJobs").style.display = radonon || (!displayAllSettings && hze < 70) ? "none" : "";
		}
		if (document.getElementById("tabMagma") !== null) {
			document.getElementById("tabMagma").style.display = radonon || (!displayAllSettings && hze < 230) ? "none" : "";
		}
		if (document.getElementById("tabNature") !== null) {
			document.getElementById("tabNature").style.display = radonon || (!displayAllSettings && hze < 236) ? "none" : "";
		}
		if (document.getElementById("tabChallenges") !== null) {
			document.getElementById("tabChallenges").style.display = !displayAllSettings && ((radonon && highestRadonZone < 70) || (!radonon && hze < 40)) ? "none" : "";
		}
		if (document.getElementById("tabLegacy") !== null) {
			document.getElementById("tabLegacy").style.display = "none";
		}
		if (document.getElementById("tabTest") !== null) {
			document.getElementById("tabTest").style.display = getPageSetting('gameUser') !== 'SadAugust' && getPageSetting('gameUser') !== 'Kyotie' && getPageSetting('gameUser').toLowerCase() !== 'test' ? "none" : "";
		}
	}
	modifyParentNodeUniverseSwap();
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
	if (setting === 'autoMaps') {
		return getPageSetting('autoMaps', currPortalUniverse);
	}
}

function autoMapsButton(offlineProgress) {
	//Auto Maps button
	var autoMapsContainer = document.createElement("DIV");
	if (offlineProgress) autoMapsContainer = document.createElement("DIV");
	autoMapsContainer.setAttribute("id", "autoMapBtnTW");
	autoMapsContainer.setAttribute("class", "btn btn-lg btn-warning offlineExtraBtn settingsBtn settingBtn" + settingUniverse('autoMaps'));
	autoMapsContainer.setAttribute("onClick", "settingChanged('autoMapsToggle', true);");
	autoMapsContainer.setAttribute("onmouseover", 'tooltip(\"Toggle Auto Maps\", \"customText\", event, autoTrimpSettings.autoMaps.description(true))');
	autoMapsContainer.setAttribute("onmouseout", 'tooltip("hide")');
	autoMapsContainer.innerHTML = 'Auto Maps';

	return autoMapsContainer;
}

function autoMapsBtnTW() {
	if (document.getElementById('autoMapBtnTW') === null) {
		document.getElementById('offlineExtraBtnsContainer').children[2].insertAdjacentHTML('afterend', '<br>');
		var u2MutColumn = document.getElementById("offlineFightBtn").parentNode;
		u2MutColumn.replaceChild(autoMapsButton(true), document.getElementById("offlineFightBtn").parentNode.children[3]);
	}
}


//Attach to the main UI button
offlineProgress.originalgetHelpText = offlineProgress.start;
offlineProgress.start = function () {
	offlineProgress.originalgetHelpText(...arguments)
	try {
		autoMapsBtnTW()
	}
	catch (e) { console.log("Loading mutator presets failed " + e, "other") }
}
if (usingRealTimeOffline) autoMapsBtnTW();

//Sets up the various AT buttons that sit outside of the AutoTrimps setting menu.
function setupATButtons() {
	//Setup AutoTrimps settings button
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

	//Identifying fight button column now so we can add to it later.
	var fightButtonCol = document.getElementById("battleBtnsColumn");

	//Auto Maps button
	var autoMapsContainer = document.createElement("DIV");
	autoMapsContainer.setAttribute("style", "margin-top: 0.2vw; display: block; font-size: 1vw; height: 1.5em; text-align: center; border-radius: 4px");
	autoMapsContainer.setAttribute("id", "autoMapBtn");
	autoMapsContainer.setAttribute("class", "noselect settingsBtn settingBtn" + settingUniverse('autoMaps'));
	autoMapsContainer.setAttribute("onClick", "settingChanged('autoMapsToggle', true);");
	autoMapsContainer.setAttribute("onmouseover", 'tooltip(\"Toggle Auto Maps\", \"customText\", event, autoTrimpSettings.autoMaps.description(true))');
	autoMapsContainer.setAttribute("onmouseout", 'tooltip("hide")');
	autoMapsContainer.innerHTML = 'Auto Maps';
	fightButtonCol.appendChild(autoMapsContainer);

	//Status textbox
	var autoMapsStatusContainer = document.createElement("DIV");
	autoMapsStatusContainer.setAttribute("class", "noselect");
	autoMapsStatusContainer.setAttribute("style", "display: block; font-size: 1vw; text-align: center; background-color: rgba(0,0,0,0.3);");
	autoMapsStatusContainer.setAttribute("onmouseout", 'tooltip("hide")');
	autoMapsStatusContainer.id = 'autoMapStatus';
	fightButtonCol.appendChild(autoMapsStatusContainer);


	//Helium/Hr Info textbox
	var resourcePerHourContainer = document.createElement("DIV");
	resourcePerHourContainer.setAttribute("style", "display: " + (getPageSetting('displayHeHr') ? 'block' : 'none') + "; font-size: 1vw; text-align: center; margin-top: 2px; background-color: rgba(0,0,0,0.3);");
	resourcePerHourContainer.setAttribute("onmouseover", 'tooltip(\"Helium/Hr Info\", \"customText\", event, \"1st is Current He/hr % out of Lifetime He(not including current+unspent).<br> 0.5% is an ideal peak target. This can tell you when to portal... <br>2nd is Current run Total He earned / Lifetime He(not including current)<br>\" + getDailyHeHrStats())');
	resourcePerHourContainer.setAttribute("onmouseout", 'tooltip("hide")');
	resourcePerHourContainer.id = 'hiderStatus';
	fightButtonCol.appendChild(resourcePerHourContainer);

	//Additional AT Info textbox
	var voidMapContainer = document.createElement("DIV");
	voidMapContainer.setAttribute("style", "display: block; font-size: 0.9vw; text-align: centre; background-color: rgba(0, 0, 0, 0.3);");
	var voidMapText = document.createElement("SPAN");
	voidMapContainer.setAttribute("onmouseover", 'tooltip(\"Additional AT Info\", \"customText\", event, \"<b>Void</b>: The progress you have towards a free void map from the \'Void Maps\' permanent bone upgrade.<br>\
	<b>Auto Level</b>: The level that AT recommends using whilst farming.<br>\
	<b>B</b>: The amount of time your trimps have been breeding.<br>\
	<b>T</b>: Your current tenacity time.\")');
	voidMapContainer.setAttribute("onmouseout", 'tooltip("hide")');
	voidMapText.id = 'additionalInfo';
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
	var tooltip = "";
	if (challengeActive('Daily')) {
		var helium = game.stats.heliumHour.value() / (game.global['total' + resource + 'Earned'] - (game.global[resource.toLowerCase() + 'Leftover'] + game.resources[resource.toLowerCase()].owned));
		helium *= 100 + getDailyHeliumValue(countDailyWeight()),
			tooltip = "<b>After Daily " + resourceHr + "\/Hr: " + helium.toFixed(3) + "%</b>"
	}
	return tooltip;
}

function updateATVersion() {
	//Setting Conversion!
	if (autoTrimpSettings["ATversion"] !== undefined && autoTrimpSettings["ATversion"].includes('SadAugust') && autoTrimpSettings["ATversion"] === MODULES_AT.ATversion) return;
	if (typeof (autoTrimpSettings) === 'undefined') return;
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

		var tempSettings = JSON.parse(localStorage.getItem('atSettings'));

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
			if (tempSettings.dailyPortalSettingsArray.valueU2 !== undefined)
				delete autoTrimpSettings.dailyPortalSettingsArray.valueU2.value;

			changelog.push("Have rewritten all of the AutoJobs, AutoStructure, Daily Portal Modifier help windows.<br>\
			Rewrote how the daily portal modifier settings are stored to make it usable in U1 and to implement the new U2 mods so there's a good chance any U2 settings will be lost. Sorry about that!")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.0') {
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
			if (tempSettings.spamMessages !== undefined)
				autoTrimpSettings['spamMessages'].value.map_Destacking = tempSettings.spamMessages.value.map_Details;
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.2') {
			changelog.push("Have introduced a mutator preset saving & respeccing system. There's a new setting in the 'Core' tab that will swap your preset when portaling.")
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.3') {
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
			if (tempSettings.c2RunnerSettings !== undefined) {
				autoTrimpSettings['onlyminmaxworld'].value = 2;
			}
			autoTrimpSettings['spamMessages'].value.map_Skip = false;
			autoTrimpSettings['spamMessages'].value.stance = false;
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.7') {
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
			autoTrimpSettings['autoGigas'].enabled = tempSettings.AutoGigas.enabled;
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.8') {
			if (tempSettings.spamMessages !== undefined)
				autoTrimpSettings['spamMessages'].value.run_Stats = false;
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.9') {
			if (tempSettings.autoAbandon !== undefined) {
				autoTrimpSettings['autoAbandon'].enabled = tempSettings.autoAbandon.value !== 1;
				autoTrimpSettings['autoAbandon'].enabledU2 = tempSettings.autoAbandon.valueU2 !== 1;
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.91') {
			if (tempSettings.spamMessages !== undefined)
				autoTrimpSettings['spamMessages'].value.nature = false;

			if (tempSettings.pfillerenlightthresh !== undefined) autoTrimpSettings['poisonEnlight'].value = tempSettings.pfillerenlightthresh.value;
			if (tempSettings.pdailyenlightthresh !== undefined) autoTrimpSettings['poisonEnlightDaily'].value = tempSettings.pdailyenlightthresh.value;
			if (tempSettings.pc2enlightthresh !== undefined) autoTrimpSettings['poisonEnlightC2'].value = tempSettings.pc2enlightthresh.value;

			if (tempSettings.wfillerenlightthresh !== undefined) autoTrimpSettings['windEnlight'].value = tempSettings.wfillerenlightthresh.value;
			if (tempSettings.wdailyenlightthresh !== undefined) autoTrimpSettings['windEnlightDaily'].value = tempSettings.wdailyenlightthresh.value;
			if (tempSettings.wc2enlightthresh !== undefined) autoTrimpSettings['windEnlightC2'].value = tempSettings.wc2enlightthresh.value;

			if (tempSettings.ifillerenlightthresh !== undefined) autoTrimpSettings['iceEnlight'].value = tempSettings.ifillerenlightthresh.value;
			if (tempSettings.idailyenlightthresh !== undefined) autoTrimpSettings['iceEnlightDaily'].value = tempSettings.idailyenlightthresh.value;
			if (tempSettings.ic2enlightthresh !== undefined) autoTrimpSettings['iceEnlightC2'].value = tempSettings.ic2enlightthresh.value;
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.92') {

			if (tempSettings.ATGA2 !== undefined) autoTrimpSettings['geneAssist'].enabled = tempSettings.ATGA2.enabled;
			if (tempSettings.ATGA2gen !== undefined) autoTrimpSettings['geneAssistPercent'].value = tempSettings.ATGA2gen.value;
			if (tempSettings.ATGA2timer !== undefined) autoTrimpSettings['geneAssistTimer'].value = tempSettings.ATGA2timer.value;

			if (tempSettings.zATGA2timer !== undefined) autoTrimpSettings['geneAssistZoneBefore'].value = tempSettings.zATGA2timer.value;
			if (tempSettings.ztATGA2timer !== undefined) autoTrimpSettings['geneAssistTimerBefore'].value = tempSettings.ztATGA2timer.value;
			if (tempSettings.ATGA2timerz !== undefined) autoTrimpSettings['geneAssistZoneAfter'].value = tempSettings.ATGA2timerz.value;
			if (tempSettings.ATGA2timerzt !== undefined) autoTrimpSettings['geneAssistTimerAfter'].value = tempSettings.ATGA2timerzt.value;
			if (tempSettings.sATGA2timer !== undefined) autoTrimpSettings['geneAssistTimerSpire'].value = tempSettings.sATGA2timer.value;

			if (tempSettings.dATGA2timer !== undefined) autoTrimpSettings['geneAssistTimerDaily'].value = tempSettings.dATGA2timer.value;
			if (tempSettings.dhATGA2timer !== undefined) autoTrimpSettings['geneAssistTimerDailyHard'].value = tempSettings.dhATGA2timer.value;
			if (tempSettings.dsATGA2timer !== undefined) autoTrimpSettings['geneAssistTimerSpireDaily'].value = tempSettings.dsATGA2timer.value;

			if (tempSettings.cATGA2timer !== undefined) autoTrimpSettings['geneAssistTimerC2'].value = tempSettings.cATGA2timer.value;
			if (tempSettings.chATGA2timer !== undefined) autoTrimpSettings['geneAssistTimerC2Hard'].value = tempSettings.chATGA2timer.value;

			var perkyInputs = JSON.parse(localStorage.getItem("perkyInputs"));
			if (perkyInputs !== null) autoTrimpSettings['autoAllocatePresets'].value = perkyInputs;
			var surkyInputs = JSON.parse(localStorage.getItem("surkyInputs"));
			if (surkyInputs !== null) autoTrimpSettings['autoAllocatePresets'].valueU2 = surkyInputs;
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.93') {

			changelog.push("Updated tooltips to reflect what the settings actually do and provide recommendations for what to set them to. Still have a few tabs left to do but it's primarily U1 stuff left.<br>\
			Hits Survived & HD Ratio map bonus now allow you to set a custom job ratio through the Map Bonus settings window.<br>\
			HD Ratio calcs now take inequality into account when your have shields with different values.<br>\
			Auto Portal will now respect your normal portal settings if you have <b>Auto Start Daily</b> enabled and no dailies left to run.<br>\
			Added heirloom mod blacklist inputs for shields & staffs. These will allow you to make sure heirlooms with those mods automatically get recycled.<br>\
			Added a new setting to the Heirloom tab to allow you to swap your shields to maximise plaguebringer damage on compressed enemies.");
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.94') {
			changelog.push("Surky has undergone a few adjustments. The missing presets are now available and the input boxes & presets all have mouseover tooltips to explain what they do.<br>\
			Some values that were hidden have now been displayed but they will get overwritten if they are below your current value when running Surky.<br>\
			Downsize, Duel, Berserk, Alchemy & Smithless will now all load the relevant presets when you auto portal into them.<br>\
			Alchemy now has an input for potions of finding & trappa now has an input for hours trapped.");
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.95') {
			var settings_List = ['mapFarmSettings']
			var values = ['value', 'valueU2'];
			for (var x = 0; x < settings_List.length; x++) {
				for (var z = 0; z < values.length; z++) {
					if (typeof (autoTrimpSettings[settings_List[x]][values[z]][0]) !== 'undefined') {
						for (var y = 0; y < autoTrimpSettings[settings_List[x]][values[z]].length; y++) {
							autoTrimpSettings[settings_List[x]][values[z]][y].hdRatio = 0;
						}
					}
					saveSettings();
				}
			}
			changelog.push("Map Farm now has a <b>Above X HD Ratio</b> input. Will make it so the line only runs above the specified HD Ratio but only runs if the input is greater than 0.");
		}
		//Fixing Surky & Perky input issues. 
		//Changing daily skip to be an array instead of a string so more items can be added.
		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.96') {

			if (typeof (tempSettings["dailySkip"]) !== 'undefined') {
				if (typeof (tempSettings.dailySkip.value) !== 'string') tempSettings.dailySkip.value = '';
				if (typeof (tempSettings.dailySkip.valueU2) !== 'string') tempSettings.dailySkip.valueU2 = '';
				autoTrimpSettings.dailySkip.value = tempSettings.dailySkip.value.split();
				autoTrimpSettings.dailySkip.valueU2 = tempSettings.dailySkip.valueU2.split();
			}

			if (typeof (autoTrimpSettings.autoAllocatePresets.value) === 'object') {
				if (typeof (tempSettings.autoAllocatePresets.value) !== 'string') tempSettings.dailySkip.value = '';
				autoTrimpSettings.autoAllocatePresets.value = JSON.stringify(autoTrimpSettings.autoAllocatePresets.value);
				localStorage.perkyInputs = autoTrimpSettings.autoAllocatePresets.value;
			}

			if (typeof (autoTrimpSettings.autoAllocatePresets.valueU2) === 'object') {
				autoTrimpSettings.autoAllocatePresets.valueU2 = JSON.stringify(autoTrimpSettings.autoAllocatePresets.valueU2);
				localStorage.surkyInputs = autoTrimpSettings.autoAllocatePresets.valueU2;
			}
		}

		//Adding auto bone charge usage
		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.97') {

			if (typeof (tempSettings["boneShrineDefaultSettings"]) !== 'undefined') {
				var setting = autoTrimpSettings["boneShrineDefaultSettings"];
				//Delete cell variable so that it isn't retained for adding new lines
				if (typeof (setting.value.cell !== 'undefined')) delete setting.value.cell;
				if (typeof (setting.valueU2.cell !== 'undefined')) delete setting.valueU2.cell;

				//Add new settings
				setting.value.bonebelow = 11;
				setting.valueU2.bonebelow = 11;

				setting.value.world = 999;
				setting.valueU2.world = 999;
			}

			changelog.push("Settings to automatically spend bone charges upon reaching a certain value have been added to the Bone Shrine default values section.<br>\
			When spending these bone charges it will use the job ratio & gather settings that you have setup in that section.");
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.2.99') {
			if (typeof (tempSettings['testRadonCombatRespec']) !== 'undefined') {
				if (typeof (tempSettings['testRadonCombatRespec'].enabledU2) !== 'undefined') autoTrimpSettings['autoCombatRespec'].valueU2 = (tempSettings['testRadonCombatRespec'].enabledU2 ? 2 : 0);
			}
			saveSettings();
		}

		//Changing Empty mode name to Any
		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.001') {
			if (typeof (tempSettings['heirloomAutoStaffMod1']) !== 'undefined') {
				for (var x = 1; x < 8; x++) {
					if (tempSettings['heirloomAutoStaffMod' + x].selected === 'Empty') autoTrimpSettings['heirloomAutoStaffMod' + x].selected = 'Any';
					if (tempSettings['heirloomAutoStaffMod' + x].selectedU2 === 'Empty') autoTrimpSettings['heirloomAutoStaffMod' + x].selectedU2 = 'Any';
					if (tempSettings['heirloomAutoShieldMod' + x].selected === 'Empty') autoTrimpSettings['heirloomAutoShieldMod' + x].selected = 'Any';
					if (tempSettings['heirloomAutoShieldMod' + x].selectedU2 === 'Empty') autoTrimpSettings['heirloomAutoShieldMod' + x].selectedU2 = 'Any';
				}
				for (var x = 1; x < 5; x++) {
					if (tempSettings['heirloomAutoCoreMod' + x].selected === 'Empty') autoTrimpSettings['heirloomAutoCoreMod' + x].selected = 'Any';
				}
			}
			saveSettings();
		}
		//Changing setting name and converting current state of it. 
		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.001') {

			if (typeof (tempSettings["disableForTW"]) !== 'undefined') {
				autoTrimpSettings.timeWarpDisable.enabled = tempSettings.disableForTW.enabled;
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.001') {
			var settings_List = ['mapBonusSettings']
			var values = ['value', 'valueU2'];
			for (var x = 0; x < settings_List.length; x++) {
				for (var z = 0; z < values.length; z++) {
					if (typeof (autoTrimpSettings[settings_List[x]][values[z]][0]) !== 'undefined') {
						for (var y = 0; y < autoTrimpSettings[settings_List[x]][values[z]].length; y++) {
							autoTrimpSettings[settings_List[x]][values[z]][y].hdRatio = 0;
						}
					}
					saveSettings();
				}
			}
			changelog.push("Map Bonus now has a <b>Above X HD Ratio</b> input. Will make it so the line only runs above the specified HD Ratio but only runs if the input is greater than 0.");
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.1') {
			changelog.push("The Void Map setting now has additional inputs to farm to specific hits survived & hd ratio before running any void maps.<br>\
			Toxicity now has challenge related settings allowing you to farm for a certain amount of stacks on specific zones. These settings can be found in the <b>Challenge</b> tab.<br>\
			There is now a <b>Time Warp</b> tab which houses a few settings for making the script more compatible with time warp.</br>\
			The equipment setting <b>AE: Zone</b> now no longer sets your spending percentage to 100% when you're at or above the last input. Instead there is now the choice to input a zone range so if you're between those zones it will set your spending percentage to 100%. If you want that style back just set your last input to 'currentEndZone.999'.<br>\
			Perky now has a target zone input and the xp input has been hidden until Fluffy has been unlocked.");
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.11') {

			if (typeof (tempSettings['heirloomAutoRareToKeep']) !== 'undefined') {

				autoTrimpSettings['heirloomAutoRareToKeepShield'].selected = tempSettings['heirloomAutoRareToKeep'].selected;
				autoTrimpSettings['heirloomAutoRareToKeepShield'].selectedU2 = tempSettings['heirloomAutoRareToKeep'].selectedU2;

				autoTrimpSettings['heirloomAutoRareToKeepStaff'].selected = tempSettings['heirloomAutoRareToKeep'].selected;
				autoTrimpSettings['heirloomAutoRareToKeepStaff'].selectedU2 = tempSettings['heirloomAutoRareToKeep'].selectedU2;
			}

			changelog.push("The Auto Heirloom <b>Rarity to Keep</b> setting has been split into multiple settings for each heirloom type. Your previous input has been converted to the new system but if you want to go for a different rarity for each type you'll need to change it manually.");
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.12') {

			if (typeof (tempSettings.equipCutOff) !== 'undefined') {
				autoTrimpSettings['equipCutOffHD'].value = tempSettings.equipCutOff.value;
				autoTrimpSettings['equipCutOffHD'].valueU2 = tempSettings.equipCutOff.valueU2;
			}

			changelog.push("The U2 challenge <b>Duel</b> now has settings available for it in the <b>C3</b> tab.<br>\
			Have added an additional equipment setting <b>AE: HS Cut-off</b>. It will set your spending percentage for health equips to 100% when your <b>Hits Survived</b> value is below the input value.<br>\
			With this equipment change the <b>AE: HD Cut-Off</b> setting will now only override your spending percentage for attack equips unless in U2 where it will override both attack & health equips as it's necessary for equality improvements.<br>\
			Void Map background variables now get reset when you save void map settings so that you don't continue running your voids at the wrong zone.");
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.13') {

			if (typeof (tempSettings.equipNoShields) !== 'undefined') {
				autoTrimpSettings['equipNoShields'].enabled = false;
			}
			if (typeof (tempSettings.equipPrestige) !== 'undefined') {
				if (tempSettings.equipPrestige.value !== 0) autoTrimpSettings['equipPrestige'].value++;
				if (tempSettings.equipPrestige.valueU2 !== 0) autoTrimpSettings['equipPrestige'].valueU2++;
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.14') {

			var settings_List = ['voidMapSettings']
			var values = ['value', 'valueU2'];
			for (var x = 0; x < settings_List.length; x++) {
				for (var z = 0; z < values.length; z++) {
					if (typeof (autoTrimpSettings[settings_List[x]][values[z]][0]) !== 'undefined') {
						for (var y = 0; y < autoTrimpSettings[settings_List[x]][values[z]].length; y++) {
							autoTrimpSettings[settings_List[x]][values[z]][y].hdType = 'world';
							autoTrimpSettings[settings_List[x]][values[z]][y].hdType2 = 'void';
						}
					}
					saveSettings();
				}
			}
		}
	}

	autoTrimpSettings["ATversion"] = MODULES_AT.ATversion;
	if (changelog.length !== 0) {
		printChangelog(changelog);
		verticalCenterTooltip(false, true);
	}
	saveSettings();
}