//Creates a new div element, gives it an id, sets the style to display:none, and then appends it to the settingsRow div.
//Div for the settings menu
function automationMenuSettingsInit() {
	var a = document.getElementById("settingsRow");
	var b;
	b = document.createElement("DIV");
	b.id = "autoSettings";
	b.setAttribute("style", "display: none; max-height: 92.5vh;overflow: auto;");
	b.setAttribute("class", "niceScroll");
	a.appendChild(b);
}

automationMenuSettingsInit();

function createTabs(tabName, tabDescription, addTabsDiv, addtabsUL) {
	var c = document.createElement("li"),
		d = document.createElement("a");
	(d.className = "tablinks"),
		d.setAttribute("onclick", "toggleTab(event, '" + tabName + "')"),
		(d.href = "#"), d.appendChild(document.createTextNode(tabName)),
		(c.id = "tab" + tabName),
		c.appendChild(d),
		addtabsUL.appendChild(c),
		createTabContents(tabName, tabDescription, addTabsDiv);
}

function createTabContents(tabName, tabDescription, addTabsDiv) {
	var elem = document.createElement("div");
	(elem.className = "tabcontent"), (elem.id = tabName);
	var d = document.createElement("div");
	d.setAttribute("style", "margin-left: 1vw; margin-right: 1vw; margin-top: 0.25vw; margin-bottom: 0.25vw;");
	var e = document.createElement("h4");
	e.setAttribute("style", "font-size: 1.2vw;"), e.appendChild(document.createTextNode(tabDescription)), d.appendChild(e), elem.appendChild(d), addTabsDiv.appendChild(elem);
}

function toggleTab(a, tabName) {
	-1 < a.currentTarget.className.indexOf(" active")
		? ((document.getElementById(tabName).style.display = "none"), (a.currentTarget.className = a.currentTarget.className.replace(" active", "")))
		: ((document.getElementById(tabName).style.display = "block"), (a.currentTarget.className += " active"));
}

function minimizeAllTabs() {
	for (var a = document.getElementsByClassName("tabcontent"), b = 0, c = a.length; b < c; b++) a[b].style.display = "none";
	for (var d = document.getElementsByClassName("tablinks"), b = 0, c = d.length; b < c; b++) d[b].className = d[b].className.replace(" active", "");
}

function maximizeAllTabs() {
	for (var a = document.getElementsByClassName("tabcontent"), b = 0, c = a.length; b < c; b++) {
		if (a[b].id.toLowerCase() === 'test' || a[b].id.toLowerCase() === 'beta') continue;
		a[b].style.display = "block";
	}
	for (var d = document.getElementsByClassName("tablinks"), b = 0, c = d.length; b < c; b++) {
		if (d[b].id.toLowerCase() === 'test' || d[b].id.toLowerCase() === 'beta') continue;
		(d[b].style.display = "block"), d[b].className.includes(" active") || (d[b].className += " active");
	}
}

function initializeAllTabs() {

	var addTabsDiv;
	var addtabsUL;

	addTabsDiv = document.createElement('div');
	addtabsUL = document.createElement('ul');
	addtabsUL.id = 'autoTrimpsTabBarMenu';
	addtabsUL.className = "tab";
	addtabsUL.style.display = "none";
	var sh = document.getElementById("settingsRow");
	sh.insertBefore(addtabsUL, sh.childNodes[2]);

	createTabs("Core", "Core - Main Controls for the script", addTabsDiv, addtabsUL);
	createTabs("Jobs", "Geneticassist Settings", addTabsDiv, addtabsUL);
	createTabs("Buildings", "Building Settings", addTabsDiv, addtabsUL);
	createTabs("Equipment", "Equipment Settings", addTabsDiv, addtabsUL);
	createTabs("Combat", "Combat & Stance Settings", addTabsDiv, addtabsUL);
	createTabs("Maps", "Maps - AutoMaps & VoidMaps Settings", addTabsDiv, addtabsUL);
	createTabs("Challenges", "Challenges - Settings for Specific Challenges", addTabsDiv, addtabsUL);
	createTabs("C2", "C2 - Settings for C2s", addTabsDiv, addtabsUL);
	createTabs("Daily", "Dailies - Settings for Dailies", addTabsDiv, addtabsUL);
	createTabs("Heirloom", "Heirloom Settings", addTabsDiv, addtabsUL);
	createTabs("Golden", "Golden Upgrade Settings", addTabsDiv, addtabsUL);
	createTabs("Spire", "Spire - Settings for Spires", addTabsDiv, addtabsUL);
	createTabs("Magma", "Dimensional Generator & Magmite Settings", addTabsDiv, addtabsUL);
	createTabs("Nature", "Nature Settings", addTabsDiv, addtabsUL);
	createTabs("Fluffy", "Fluffy Evolution Settings", addTabsDiv, addtabsUL);
	createTabs("Time Warp", "Time Warp Settings", addTabsDiv, addtabsUL);
	createTabs("Display", "Display & Spam Settings", addTabsDiv, addtabsUL);
	createTabs("Import Export", "Import & Export Settings", addTabsDiv, addtabsUL);
	createTabs("Help", "Helpful information (hopefully)", addTabsDiv, addtabsUL);
	createTabs("Test", "Basic testing functions - Should never be seen by users", addTabsDiv, addtabsUL);
	createTabs("Beta", "Beta features - Should never be seen by users as they aren't user ready", addTabsDiv, addtabsUL);

	//Minimize tabs incon
	var li_0 = document.createElement('li');
	var a_0 = document.createElement('a');
	a_0.className = "tablinks minimize";
	a_0.setAttribute('onclick', 'minimizeAllTabs();');
	a_0.href = "#";
	a_0.appendChild(document.createTextNode("-"));
	li_0.appendChild(a_0);
	li_0.setAttribute("style", "float:right!important;");
	li_0.setAttribute("onmouseover", 'tooltip("Minimize all tabs", "customText", event, "Minimize all of the settings tabs.")');
	li_0.setAttribute("onmouseout", 'tooltip("hide")');
	//Maximize tabs icon
	var li_1 = document.createElement('li');
	var a_1 = document.createElement('a');
	a_1.className = "tablinks maximize";
	a_1.setAttribute('onclick', 'maximizeAllTabs();');
	a_1.href = "#";
	a_1.appendChild(document.createTextNode("+"));
	li_1.appendChild(a_1);
	li_1.setAttribute("style", "float:right!important;");
	li_1.setAttribute("onmouseover", 'tooltip("Maximize all tabs", "customText", event, "Maximize all of the settings tabs.")');
	li_1.setAttribute("onmouseout", 'tooltip("hide")');
	//Exit tab icon
	var li_2 = document.createElement('li');
	var a_2 = document.createElement('a');
	a_2.className = "tablinks tabclose";
	a_2.setAttribute('onclick', 'autoToggle();');
	a_2.href = "#";
	a_2.appendChild(document.createTextNode("x"));
	li_2.appendChild(a_2);
	li_2.setAttribute("style", "float:right!important;");
	li_2.setAttribute("onmouseover", 'tooltip("Exit", "customText", event, "Closes/toggles/hides AutoTrimps (just a UI shortcut)")');
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
	//Core
	const displayCore = true;
	if (displayCore) {
		createSetting('gatherType',
			function () { return (['Manual Gather', 'Auto Gather', 'Mining Only', 'Science Research Off']) },
			function () {
				var description = "<p>Controls what you gather/build.</p>";
				description += "<p><b>Manual Gather</b><br>Disables this setting.</p>";
				description += "<p><b>Auto Gather</b><br>Automatically switch your gathering between different resources and the building queue depending on what it deems necessary.</p>";
				description += "<p><b>Mining Only</b><br>Sets gather to Mining. If buildings are in the queue then they will override this. Only use this if you are past the early stages of the game and have Foremany unlocked.</p>";
				description += "<p><b>Science Research Off</b><br>Works the same as 'Auto Gather' but stops Science from being gathered.</p>";
				description += "<p><b>Recommended:</b> Auto Gather</p>";
				return description;
			}, 'multitoggle', 1, null, 'Core', [1, 2]);
		createSetting('upgradeType',
			function () { return (['Manual Upgrades', 'Buy All Upgrades', 'Upgrades no Coords']) },
			function () {
				var description = "<p>Controls what you upgrade.</p>";
				description += "<p><b>Manual Upgrades</b><br>Disables this setting.</p>";
				description += "<p><b>Buy All Upgrades</b><br>Automatically purchases non-equipment upgrades. Equipment upgrades are controlled by settings in the Equipment tab.</p>";
				description += "<p><b>Upgrades no Coords</b><br>Works the same as 'Buy All Upgrades' but stops Coordination upgrades from being purchased.</p>";
				description += "<p><b>Recommended:</b> Buy All Upgrades</p>";

				if (currSettingUniverse === 1) {
					description += "<p>Will purchase the following upgrades when on your next <b>Scientist</b> run - ";
					if (game.global.sLevel === 0) description += "Battle, Miners, Coordination x9, Megamace, Bestplate</p>";
					if (game.global.sLevel === 1) description += "Battle, Miners, Coordination x8, Bestplate</p>";
					if (game.global.sLevel === 2) description += "Battle, Miners, Coordination x3, Speedminer</p>";
					if (game.global.sLevel === 3) description += "Battle, Miners</p>";
					if (game.global.sLevel >= 4) description += "Battle, Miners, Coordination x3, Speedminer, Egg</p>";
					return description;
				}
				return description;
			}, 'multitoggle', 1, null, 'Core', [1, 2]);
		createSetting('TrapTrimps',
			function () { return ('Trap Trimps') },
			function () {
				var description = "<p>Automatically builds traps and traps trimps when needed.</p>";
				description += "<p>Upgrade setting must be set to <b>Buy All Upgrades</b> for this to work</p>";
				description += "<p><b>Recommended:</b> On whilst highest zone is below 30</p>";
				return description;
			}, 'boolean', true, null, 'Core', [1, 2]);
		createSetting('downloadSaves',
			function () { return ('Download Saves') },
			function () { return ('Will automatically download saves when the script portals.') },
			'boolean', false, null, 'Core', [1, 2]);
		createSetting('portalVoidIncrement',
			function () { return ('Void Map Liquification') },
			function () {
				var description = "<p>Delays portaling into your preferred run and repeatedly does portals in universe 1 until your bone void map counter is 1 drop away from a guaranteed extra void map.</p>";
				if (currSettingUniverse !== 1) description += "<p><b>Recommended:</b> On</p>";
				else description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Core', [0],
			function () { return (game.permaBoneBonuses.voidMaps.owned >= 5 && checkLiqZoneCount() >= 20) });
		createSetting('autoPerks',
			function () { return ('Auto Allocate Perks') },
			function () {
				var calcName = currSettingUniverse === 2 ? "Surky" : "Perky";
				var description = "<p>Uses a modified version of <b>" + calcName + "</b> to identify the most optimal perk distribution when auto portaling.</p>";
				description += "<p>There are inputs you can adjust in the <b>Portal</b> window to allow you to adjust how it distributes perks.</p>";
				description += "<p>If you want more advanced settings import your save into <b>" + calcName + "</b>.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [1, 2]);

		createSetting('presetSwap',
			function () { return ('Preset Swapping') },
			function () {
				var calcName = currSettingUniverse === 2 ? "Surky" : "Perky";
				var fillerPreset = currSettingUniverse === 2 ? "Easy Radon Challenge" : "the most appropriate zone progression preset";
				var dailyPreset = currSettingUniverse === 2 ? "Difficult Radon Challenge" : "the most appropriate zone progression preset";
				var c2Preset = currSettingUniverse === 2 ? "Push/C3/Mayhem" : "Other c²";
				var universeChallenges = currSettingUniverse === 2 ? "Downsize, Duel, Berserk, Alchemy, Smithless" : "Coord, Trimp, Metal";

				var description = "<p>Will automatically swap <b>" + calcName + "</b> presets when portaling into runs.</p>";
				description += "<p>Fillers (non daily/" + cinf() + " runs) will load <b>" + fillerPreset + ".</b></p>";
				description += "<p>Dailies will load <b>" + dailyPreset + "</b>.</p>";
				description += c2Description() + " runs will load <b>" + c2Preset + "</b>.</p>";

				description += "Challenges that have a dedicated preset (<b>" + universeChallenges + "</b>) will be loaded when starting that challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [1, 2],
			function () { return (getPageSetting('autoPerks', currSettingUniverse)) });

		createSetting('presetCombatRespec',
			function () {
				var trimple = currSettingUniverse === 1 ? "Trimple" : "Atlantrimp";
				return ([trimple + ' Respec Off', trimple + ' Respec Popup', trimple + ' Respec Force'])
			},
			function () {
				var calcName = currSettingUniverse === 2 ? "Surky" : "Perky";
				var trimple = currSettingUniverse === 1 ? "<b>Trimple of Doom</b>" : "<b>Atlantrimp</b>";
				var trimpleShortened = currSettingUniverse === 1 ? "Trimple" : "Atlantrimp";

				var respecName = !trimpStats.isC3 ? "Radon " : "" + "Combat Respec";
				if (currSettingUniverse === 1) respecName = 'Spire';

				var description = '';
				if (currSettingUniverse === 1) {
					description += "<p>Will only run during the highest Spire you have reached and will respec into the Perky <b>Spire</b> preset to maximise your combat stats during it.</p>";
				}
				if (currSettingUniverse === 2) {
					description += "<p>Will respec into the <b>Combat Respec</b> preset when running " + c2Description() + " <b>OR</b> you have more golden battle upgrades than golden radon upgrades. Otherwise it will assume it's a radon run and respec into the <b>Radon Combat Respec</b> preset.</p>";
				}

				description += "<p><b>" + trimpleShortened + " Respec Off</b><br>Disables this setting.</p>";

				description += "<p><b>" + trimpleShortened + " Respec Popup</b><br>Will display a popup after completing " + trimple + " asking whether you would like to respec into the preset listed above.</p>";

				description += "<p><b>" + trimpleShortened + " Respec Force</b><br>5 seconds after completing " + trimple + " it will respec into the <b>" + calcName + "</b> preset listed above to maximise combat stats. Has a popup that allows you to disable the respec if clicked within the 5 second window.</p>";

				description += "<p>This likely won't be worthwhile using without having <b>Auto Allocate Perks</b> enabled as your next run would be started with the combat respec.</p>";

				description += "<p>I'd recommend only using this when <b>Liq for free Void</b> is enabled as it will run an extra portal to obtain a respec when one isn't available at the end of a run.<br>Without this unless you have used a Bone Portal you'll need to manually respec at the start of your next portal or you will start it in a suboptimal preset.</p>";

				if (currSettingUniverse === 1) description += "<p>Has an additional setting (<b>Spire Respec Cell</b>) which has a <b>5</b> second delay after toggling this setting before it will function.</p>";

				description += "<p><b>Recommended:</b> " + trimpleShortened + " Respec Off</p>";
				return description
			},
			'multitoggle', [0], null, 'Core', [1, 2],
			function () { return (game.stats.highestLevel.valueTotal() >= 170 || currSettingUniverse === 2) });

		createSetting('presetCombatRespecCell',
			function () { return ('Spire Respec Cell') },
			function () {
				var trimple = currSettingUniverse === 1 ? "<b>Trimple of Doom</b>" : "<b>Atlantrimp</b>";
				var trimpleShortened = currSettingUniverse === 1 ? "Trimple" : "Atlantrimp";
				var description = "<p>An override for the " + trimple + " requirement for the <b>" + trimpleShortened + " Respec</b> setting. Will either give you a popup or automatically respec depending on your <b>" + trimpleShortened + " Respec</b> setting when you reach this cell and don't have any mapping to do on it.</p>";
				description += "<p>Will only function on your <b>highest Spire reached.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this way to Spire respec.</p>";
				description += "<p><b>Recommended:</b> cell after your farming has finished.</p>";
				return description;
			}, 'value', -1, null, 'Core', [1],
			function () { return (getPageSetting('presetCombatRespec', currSettingUniverse) > 0 && game.stats.highestLevel.valueTotal() >= 170) });
		createSetting('presetSwapMutators',
			function () { return ('Preset Swap Mutators') },
			function () {
				var description = "<p>Will automatically load the preset that corresponds to your run type after auto portaling.</p>";
				description += "<p>For info on which preset is loaded and when, mouseover the presets in the games <b>Mutators</b> window.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 201) });

		createSetting('universeSetting',
			function () {
				var portalOptions = ['Helium Settings'];
				if (Fluffy.checkU2Allowed()) portalOptions.push('Radon Settings');
				return portalOptions;
			},
			function () { return ('Switch between settings for universes you have unlocked.') },
			'multitoggle', 0, null, 'Core', [0]);
		var $universeSetting = document.getElementById('universeSetting');
		$universeSetting.parentNode.style.setProperty('float', 'right');
		$universeSetting.parentNode.style.setProperty('margin-right', '1.1vw');
		$universeSetting.parentNode.style.setProperty('margin-left', '0');

		//Auto Portal
		createSetting('autoPortal',
			function () { return ('Auto Portal') },
			function () {
				var c2setting = currSettingUniverse === 2 ? "Challenge 3" : "Challenge 2";
				var specialChall = "Special challenges (" + (currSettingUniverse === 2 ? "Mayhem, Pandemonium, Desolation" : "Frigid, Experience") + ") can be run with this but they will use the <b>Portal Zone</b> input for when to portal.";
				var description = "<p>Will automatically portal into different challenges depending on the way you setup the Auto Portal related settings.</p>";
				description += "<p><b>" + resource() + " Challenges will appear here when they've been unlocked in the game.</b></p>";
				description += "<p>Additional settings appear when <b>" + resource() + " Per Hour</b>, <b>Custom</b> or <b>One Off Challenges</b> are selected.</p>";
				description += "<p><b>Off</b><br>Disables this setting.</p>";
				description += "<p><b>" + resource() + " Per Hour</b><br>Portals into new runs when your " + resource().toLowerCase() + " per hour goes below your current runs best " + resource().toLowerCase() + " per hour.</p>";
				description += "<p>There is a <b>Buffer</b> setting, which lowers the check from best " + resource().toLowerCase() + " per hour to (best - buffer setting) " + resource().toLowerCase() + " per hour.</p>";
				description += "<p><b>Specific Challenges</b><br>If a specific challenge has been selected it will automatically portal into it when you don't have a challenge active.</p>";
				description += "<p><b>Custom</b>/<b>One Off Challenges</b><br>Will portal into the challenge selected in the <b>Challenge</b> setting at the zone specified in the <b>Portal Zone</b> setting.</p>";
				if (game.stats.highestLevel.valueTotal() >= 65) description += "<p><b>" + c2setting + "</b><br>Will portal into the challenge selected in the <b>" + cinf() + "</b> setting. If not inside of a " + cinf() + " then it will use the zone specified in the <b>Portal Zone</b> setting. When inside of " + cinf() + "s it will use <b>" + cinf() + " Runner Portal</b> for your portal zone. If <b>" + cinf() + " Runner</b> is enabled otherwise will use the zone specified in the <b>Finish " + cinf() + "</b> setting in the " + cinf() + " settings tab.</p>"
				description += "<p>" + specialChall + "</p>";
				description += "<p><b>Recommended:</b> " + (currSettingUniverse === 2 ? "Custom with a specified endzone to use the Scruffy 3 ability" : "Specific challenges until you reach zone 230 then " + resource() + " Per Hour") + "</p>";
				return description;
			}, 'dropdown', 'Off', function () { return autoPortalChallenges() }, 'Core', [1, 2]);

		createSetting('heliumHourChallenge',
			function () { return ('Challenge') },
			function () {
				var description = "<p>Automatically portal into this challenge when using the <b>" + resource() + " Per Hour</b> or <b>Custom</b> Auto Portal settings.</p>";
				description += "<p><b>" + resource() + " challenges will appear here when they've been unlocked in the game.</b></p>";
				description += "<p><b>Recommended:</b> Last challenge available</p>";
				return description;
			}, 'dropdown', 'None', function () { return heliumHourChallenges() }, 'Core', [1, 2],
			function () {
				var namesToCheck = ['Helium Per Hour', 'Radon Per Hour', 'Custom'];
				return (
					namesToCheck.indexOf(getPageSetting('autoPortal', currSettingUniverse)) !== -1);
			});

		createSetting('heliumOneOffChallenge',
			function () { return ('Challenge') },
			function () {
				var description = "<p>Automatically portal into this challenge when using the <b>One Off Challenges</b> Auto Portal setting.</p>";
				description += "<p><b>Challenges that are only worthwhile running once for perks/special unlocks will appear here when they've been unlocked in the game.</b></p>";
				description += "<p><b>Recommended:</b> Last challenge available</p>";
				return description;
			}, 'dropdown', 'None', function () { return heliumOneOffChallenges() }, 'Core', [1, 2],
			function () {
				var namesToCheck = ['One Off Challenges'];
				return (
					namesToCheck.indexOf(getPageSetting('autoPortal', currSettingUniverse)) !== -1);
			});
		createSetting('heliumC2Challenge',
			function () { return (cinf()) },
			function () {
				var specialChall = "Special challenges (" + (currSettingUniverse === 2 ? "Mayhem, Pandemonium, Desolation" : "Frigid, Experience") + ") can be run with this but they will use the <b>Portal Zone</b> input for when to portal.";
				var description = "<p>Automatically portal into this C" + cinf()[1] + " when using the <b>Challenge " + cinf()[1] + "</b> Auto Portal setting.</p>";
				description += "<p>C" + cinf()[1] + " challenges will appear here when they've been unlocked in the game.</p>";
				description += "<p>When inside of " + cinf() + "s it will use <b>" + cinf() + " Runner Portal</b> for your portal zone. If <b>" + cinf() + " Runner</b> is enabled otherwise will use the zone specified in the <b>Finish " + cinf() + "</b> setting in the " + cinf() + " settings tab.</p>"
				description += "<p>" + specialChall + "</p>";
				return description;
			}, 'dropdown', 'None', function () { return heliumC2Challenges() }, 'Core', [1, 2],
			function () {
				var namesToCheck = ['Helium Per Hour', 'Radon Per Hour', 'Custom'];
				return (
					getPageSetting('autoPortal', currSettingUniverse) === 'Challenge 2' || getPageSetting('autoPortal', currSettingUniverse) === 'Challenge 3' || (namesToCheck.indexOf(getPageSetting('autoPortal', currSettingUniverse)) !== -1 && getPageSetting('heliumHourChallenge', currSettingUniverse).includes('Challenge')))
			});
		createSetting('autoPortalZone',
			function () { return ('Portal Zone') },
			function () {
				var description = "<p>Will automatically portal once this zone is reached when using the <b>Custom OR One Off Challenges</b> Auto Portal settings.</p>";
				description += "<p>Setting this to <b>200</b> would portal when you reach <b>zone 200</b>.</p>";
				description += "<p><b>Recommended:</b> The zone you would like your run to end</p>";
				return description;
			}, 'value', 999, null, 'Core', [1, 2],
			function () {
				var namesToCheck = ['Challenge 2', 'Challenge 3', 'Custom', 'One Off Challenges'];
				return (
					namesToCheck.indexOf(getPageSetting('autoPortal', currSettingUniverse)) !== -1);
			});

		createSetting('heliumHrDontPortalBefore',
			function () { return ("Don't Portal Before") },
			function () {
				var description = "<p>Will stop the script from automatically portaling before the specified zone when using the <b>" + resource() + " Per Hour</b> Auto Portal setting.</p>";
				description += "<p>This is an additional check that prevents drops in " + resource().toLowerCase() + " per hour from triggering Auto Portal.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and assume any zone is okay to portal on.</p>";
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
				var description = "<p>When using the <b>" + resource() + " Per Hour</b> Auto Portal setting, it will portal if your " + resource().toLowerCase() + " per hour drops by this settings % input lower than your best for current run.</p>";
				description += "<p>Allows portaling midzone if you exceed the set buffer amount by 5x. (ie a normal 2% buffer setting would now portal mid-zone if you fall below 10% buffer).</p>";
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
				var portalOptions = ['Auto Portal Immediately', 'Portal After Voids'];
				if (currSettingUniverse === 1 && hze >= 230) portalOptions.push('Portal after voids (poison)');
				return portalOptions;
			},
			function () {
				var description = "<p>How you would like to portal when below your " + resource().toLowerCase() + " per hour threshold.</p>";
				description += "<p><b>Auto Portal Immediately</b><br>Will auto portal straight away.</p>";
				description += "<p><b>Portal after voids</b><br>Will run any remaining void maps then proceed to portal.</p>";
				if (currSettingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 230) description += "<p><b>Portal after poison voids</b><br>Will continue your run until you reach the next poison zone and run void maps there.</p>";
				description += "<p><b>Recommended:</b> Portal after voids</p>";
				return description;
			}, 'multitoggle', 0, null, 'Core', [1, 2],
			function () {
				return (getPageSetting('autoPortal', currSettingUniverse).includes('Hour'))
			});

		createSetting('heliumHrExitSpire',
			function () { return ('Exit Spires for Voids') },
			function () {
				var description = "<p>If enabled will automatically exit Spires to run your voids earlier when the <b>" + resource() + " Per Hour</b> Auto Portal setting is wanting to portal.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [1],
			function () { return (getPageSetting('autoPortal', currSettingUniverse).includes('Hour') && game.stats.highestLevel.valueTotal() >= 170) });

		//Pause + Switch
		createSetting('pauseScript',
			function () { return ('Pause AutoTrimps') },
			function () {
				var description = "<p>Pauses the AutoTrimps script.</p>";
				description += "<p><b>Graphs will continue tracking data while paused.</b></p>";
				return description;
			}, 'boolean', null, null, 'Core', [0]);
		var $pauseScript = document.getElementById('pauseScript');
		$pauseScript.parentNode.style.setProperty('float', 'right');
		$pauseScript.parentNode.style.setProperty('margin-right', '1.2vw');
		$pauseScript.parentNode.style.setProperty('margin-left', '0');

		createSetting('autoEggs',
			function () { return ('Auto Eggs') },
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

	//Jobs
	const displayJobs = true;
	if (displayJobs) {
		createSetting('jobType',
			function () { return (["Don't Buy Jobs", 'Auto Ratios', 'Manual Ratios']) },
			function () {
				//Initial button description
				var description = "<p>Click the left side of the button to toggle between the AutoJobs settings. Each of them will adjust the 3 primary resource jobs but you'll have to manually set the rest by clicking the cog icon on the right side of this button.</p>";
				//Don't Buy Jobs
				description += "<p><b>Don't Buy Jobs</b><br>Will disable the script from purchasing any jobs.</p>";
				//Auto Ratios
				description += "<p><b>Auto Ratios</b><br>Automatically adjusts the 3 primary resource job worker ratios based on current game progress. For more detailed information on this check out its Help section for this setting.</p>";
				//Manual Ratios
				description += "<p><b>Manual Ratios</b><br>Buys jobs for your trimps according to the ratios set in the cogwheel popup.</p>";
				//Override info
				description += "<p>Automatically swaps the games default hiring setting <b>Not Firing For Jobs</b> to <b>Firing For Jobs</b>.</p>";
				description += "<p>Map setting job ratios always override both <b>Auto Ratios</b> & <b>Manual Ratios</b> when AutoMaps is enabled.</p>";
				return description;
			}, 'multitoggle', 1, null, 'Jobs', [1, 2],
			function () { return (false) });
		createSetting('jobSettingsArray',
			function () { return ('Job Settings') },
			function () { return ('Click to adjust settings.') },
			'mazDefaultArray', {
			Farmer: { enabled: true, ratio: 1 },
			Lumberjack: { enabled: true, ratio: 1 },
			Miner: { enabled: true, ratio: 1 },
			Explorer: { enabled: true, percent: 10 },
			Trainer: { enabled: true, percent: 25 },
			Magmamancer: { enabled: true, percent: 100 },
			Meteorologist: { enabled: true, percent: 100 },
			Worshipper: { enabled: true, percent: 5 },
			FarmersUntil: { enabled: false, zone: 999 },
			NoLumberjacks: { enabled: false }
		}, null, 'Jobs', [1, 2]);

		//----------------------------------------------------------------------------------------------------------------------

		//ATGA
		createSetting('geneAssist',
			function () { return ('Gene Assist') },
			function () {
				var description = "<p>Master switch for whether the script will do any form of Geneticist purchasing.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p><b>If enabled will disable the ingame Geneticistassist setting.</b></p>";
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

		createSetting('geneAssistTimerHard',
			function () { return ('GA: Hard Chall Timer') },
			function () {
				var description = "<p>Gene Assist will use the value set here when running challenges that are considered hard (Nom, Toxicity, Lead). </p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>This setting is disabled if you have the <b>Angelic</b> mastery.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> 8</p>";
				return description;
			}, 'value', 8, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistTimerElectricity',
			function () { return ('GA: Electricity Timer') },
			function () {
				var description = "<p>Gene Assist will use the value set here when running the Electricity challenge. </p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>This also overwrites your breed timer in the <b>Mapocalypse</b> challenge.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> 2.5</p>";
				return description;
			}, 'value', 2.5, null, 'Jobs', [1],
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
				var description = "<p>Gene Assist will use the value set in <b>GA: Before Z Timer</b> when below this zone.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p><b>Recommended:</b> The zone where you stop 1 shotting in a new portal</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
		createSetting('geneAssistTimerBefore',
			function () { return ('GA: Before Z Timer') },
			function () {
				var description = "<p>Gene Assist will use the value set here when below the zone in <b>GA: Before Z Timer</b>.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
		createSetting('geneAssistZoneAfter',
			function () { return ('GA: After Z') },
			function () {
				var description = "<p>Gene Assist will use the value set in <b>GA: After Z Timer</b> when after this zone.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p><b>Recommended:</b> The zone where you stop 1 shotting after using your <b>GA: Timer</b> setting in a new portal</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
		createSetting('geneAssistTimerAfter',
			function () { return ('GA: After Z Timer') },
			function () {
				var description = "<p>Gene Assist will use the value set here when below the zone in <b>GA: After Z Timer</b>.</p>";
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
				var description = "<p>Gene Assist will use the value set here when running dailies that are considered hard (Plagued, Bogged). </p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>This setting won't do anything on Bogged dailies if you have the <b>Angelic</b> mastery.</p>";
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
		createSetting('geneAssistTimerSpireC2',
			function () { return ('GA: ' + cinf() + ' Spire Timer') },
			function () {
				var description = "<p>Gene Assist will use the value set here when inside of active Spires in " + cinf() + "s.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> Your <b>Anticipation</b> perk timer</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Buildings
	const displayBuildings = true;
	if (displayBuildings) {
		createSetting('buildingsType',
			function () { return ('AutoBuildings') },
			function () {
				//Initial button description
				var description = "Click the left side of the button to toggle this on or off.</p>";
				//Cogwheel info
				description += "<p>Click the cog icon on the right side of this button to tell your Foremen what you want and when you want it.</p>";
				description += "For more detailed information for this setting check out its Help section.</p>";
				return description;
			}, 'boolean', 'true', null, 'Buildings', [1, 2],
			function () { return (false) });
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
			Gym: { enabled: true, percent: 75, buyMax: 0 },
			Tribute: { enabled: true, percent: 100, buyMax: 0 },
			Nursery: { enabled: true, percent: 100, buyMax: 0, fromZ: 0 },
			Smithy: { enabled: true, percent: 100, buyMax: 0 },
			Tribute: { enabled: true, percent: 100, buyMax: 0 },
			Laboratory: { enabled: true, percent: 100, buyMax: 0 },
			SafeGateway: { enabled: true, mapCount: 1, zone: 0 }
		}, null, 'Buildings', [1, 2]);

		//Helium
		createSetting('warpstation',
			function () { return ('Warpstations') },
			function () {
				var description = "<p>Enable this to allow Warpstation purchasing.</p>";
				description += "<p><b>Will only function properly with AT AutoStructure enabled.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Buildings', [1]);
		createSetting('warpstationPct',
			function () { return ('Warpstation Percent') },
			function () {
				var description = "<p>What percentage of resources to spend on Warpstations.</p>";
				description += "<p><b>The script will still purchase Gigastations at 100% resources.</b></p>";
				description += "<p><b>Recommended:</b> 25</p>";
				return description;
			}, 'value', 25, null, 'Buildings', [1]);
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
				description += "<p>Once your first gigastation of a run has been purchased this setting won't be evaluated again until your next run.</p>";
				description += "<p><b>You must have buy upgrades enabled!</b></p>";
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			}, 'value', 2, null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled) }
		);
		createSetting('autoGigas',
			function () { return ('Auto Gigas') },
			function () {
				var description = "<p>If enabled, the script will buy its first Gigastation if: <br>A) Has more than 2 Warps & <br>B) Can\'t afford more Coords & <br>C) (Only if Custom Delta Factor > 20) Lacking Health or Damage & <br>D) (Only if Custom Delta Factor > 20) Has run at least 1 map stack.</p>";
				description += "<p>Then, it'll calculate the delta based on your Custom Delta Factor and your Auto Portal/VM zone (whichever is higher), or Daily Auto Portal/VM zone, or " + cinf() + " zone, or Custom AutoGiga Zone.</p>";
				description += "<p>Once your first gigastation of a run has been purchased this setting won't be evaluated again until your next run.</p>";
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
				description += "<p>Once your first gigastation of a run has been purchased this setting won't be evaluated again until your next run.</p>";
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
				description += "<p>Once your first gigastation of a run has been purchased this setting won't be evaluated again until your next run.</p>";
				description += "<p><b>Recommended:</b> 1-2 for very quick runs. 5-10 for regular runs where you slow down at the end. 20-100+ for very pushy runs</p>";
				return description;
			}, 'value', -1, null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled && autoTrimpSettings.autoGigas.enabled) });

		createSetting('advancedNurseries',
			function () { return ('Advanced Nurseries') },
			function () {
				var description = "<p>Will only buy nurseries if you need more health and you have more map stacks than the <b>Map Bonus Health</b> setting, which becomes a very important setting.</p>"
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
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			},
			'value', 2, null, 'Buildings', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 230 && autoTrimpSettings.advancedNurseries.enabled) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Equipment
	const displayEquipment = true;
	if (displayEquipment) {
		createSetting('equipOn',
			function () { return ('Auto Equip') },
			function () {
				var description = "<p>Master switch for whether the script will do any form of equipment purchasing.</p>";
				description += "<p>There's settings in here to identify when to purchase gear and if it should purchase prestiges.<br></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, "Equipment", [1, 2]);
		createSetting('equipCutOffHD',
			function () { return ('AE: HD Cut-off') },
			function () {
				var description = "<p>If your H:D (enemyHealth/trimpDamage) ratio is above this value it will override your <b>AE: Percent</b> input when looking at " + (currSettingUniverse !== 2 ? "weapon purchases " : "") + "and set your spending percentage to 100% of resources available.</p>";
				description += "<p>Goal with this setting is to have it purchase gear whenever you slow down in world.<br></p>";
				description += "<p>Your HD ratio can be seen in either the <b>Auto Maps status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', 1, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipCutOffHS',
			function () { return ('AE: HS Cut-off') },
			function () {
				var description = "<p>If your Hits Survived (trimpHealth/enemyDamage) ratio is below this value it will override your <b>AE: Percent</b> input when looking at armor purchases and set your spending percentage to 100% of resources available.</p>";
				description += "<p>Goal with this setting is to have it purchase gear whenever you slow down in world.<br></p>";
				description += "<p>Your Hits Survived ratio can be seen in either the <b>Auto Maps status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</p>";
				description += "<p><b>Recommended:</b> 1.25</p>";
				return description;
			}, 'value', 1.25, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipCapAttack',
			function () { return ('AE: Weapon Cap') },
			function () {
				var description = "<p>The value you want weapon equipment to stop being purchased at.</p>";
				description += "<p>Equipment levels are capped at <b>9</b> when a prestige is available for that equip to ensure the script doesn't unnecessarily spend resources on them when prestiges would be more efficient.</p>";
				description += "<p><b>Recommended:</b> 20 during earlygame and gradually raise it to 250 as needed.</p>";
				return description;
			}, 'value', 20, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipCapHealth',
			function () { return ('AE: Armour Cap') },
			function () {
				var description = "<p>The value you want armor equipment to stop being purchased at.</p>";
				description += "<p>Equipment levels are capped at <b>9</b> when a prestige is available for that equip to ensure the script doesn't unnecessarily spend resources on them when prestiges would be more efficient.</p>";
				description += "<p><b>Recommended:</b> 20 during earlygame and gradually raise it to 250 as needed.</p>";
				return description;
			}, 'value', 20, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipZone',
			function () { return ('AE: Zone') },
			function () {
				var description = "<p>What zone to stop caring about what percentage of resources you're spending and buy as many prestiges and equipment as possible.</p>";
				description += "<p>Can input multiple zones such as <b>200,231,251</b>, doing this will spend all your resources purchasing gear and prestiges on each zone input.</p>";
				description += "<p>You are able to enter a zone range, this can be done by using a decimal point between number ranges e.g. <b>23.120</b> which will cause the zone check to set your purchasing percentage to 100% between zones 23 and 120. <b>This can be used in conjunction with other zones too, just seperate inputs with commas!</b></p>";
				description += "<p>If inside one of these zones it will override your <b>AE: Percent</b> input and set your spending percentage to 100% of resources available.</p>"
				description += "<p><b>Recommended:</b> 999</p>";
				return description;
			}, 'multiTextValue', [-1], null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipPercent',
			function () { return ('AE: Percent') },
			function () {
				var description = "<p>What percent of resources you'd like to spend on equipment.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 10, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equip2',
			function () { return ('AE: 2') },
			function () {
				var description = "<p>This will make the script always purchase a second level of weapons and armor regardless of efficiency.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipPrestige',
			function () { return (['AE: Prestige Off', 'AE: Maybe Prestige', 'AE: Prestige', 'AE: Always Prestige']) },
			function () {
				var trimple = currSettingUniverse === 1 ? "<b>Trimple of Doom</b>" : "<b>Atlantrimp</b>";
				var description = "<p>Will control how equipment levels & prestiges are purchased.</p>";
				description += "<p>Equipment levels are capped at <b>9</b> when a prestige is available for that equip to ensure the script doesn't unnecessarily spend resources on them when prestiges would be more efficient.</p>";

				description += "<p><b>AE: Prestige Off</b><br>Will only purchase prestiges for equipment when you have 6 or more levels in it.</p>";

				description += "<p><b>AE: Maybe Prestige</b><br>Will only purchase prestiges you have either 6 or more levels in an equip <b>OR</b> when outside of your <b>AE: Zone</b> range <b>OR</b> when you can afford them.</p>";

				description += "<p><b>AE: Prestige</b><br>Overrides the need for levels in your current equips before a prestige will be purchased. Will purchase gear levels again when you have run " + trimple + ".";

				description += "<br>If <b>" + trimple + "</b> has been run it will buy any prestiges that cost less than what you have input in the <b>AE: Prestige Pct</b> setting then spend your remaining resources on equipment levels.</p>";

				description += "<p><b>AE: Always Prestige</b><br>Always buys prestiges of weapons and armor regardless of efficiency. Will override the <b>AE: Zone</b> setting for an equip if it has a prestige available.</p>";

				description += "<p><b>Recommended:</b> AE: Prestige</p>";
				return description;
			}, 'multitoggle', 2, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });

		createSetting('equipPrestigePct',
			function () { return ('AE: Prestige Pct') },
			function () {
				var trimple = currSettingUniverse === 1 ? "<b>Trimple of Doom</b>" : "<b>Atlantrimp</b>";
				var description = "<p>What percent of resources you'd like to spend on equipment before prestiges will be priorities over them.</p>";
				description += "Only impacts prestige purchasing when <b>AE: Prestige</b> is selected and " + trimple + " has been run.</p>";

				description += "<p><b>Recommended:</b> 6</p>";
				return description;
			}, 'value', 6, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse) && getPageSetting('equipPrestige', currSettingUniverse) === 2) });

		createSetting('equipNoShields',
			function () { return ('AE: No Shields') },
			function () {
				var description = "<p>Will stop the purchase of Shield equipment levels & prestiges.</p>";
				description += "<p><b>This is only ever useful in very niche scenarios.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, "Equipment", [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });

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
				description += "<p><b>Recommended:</b> On until you can reach zone 40</p>";
				return description;
			}, 'boolean', true, null, "Equipment", [1]);

		createSetting('Prestige',
			function () { return ('Prestige Climb') },
			function () {
				var description = "<p>Acquire prestiges through the selected item (inclusive) as soon as they are available in maps.</p>";
				description += "<p>Automatically swaps the games default setting from <b>Tier First</b> to <b>Equip First</b>.</p>";
				description += "<p><b>Auto Maps must be enabled for this to run.</b></p>";
				description += "<p><b>Before Explorers have been unlocked when this setting runs it will automatically set all map sliders except size to the minimum they can be and set the biome used to Random.</b></p>";
				description += "<p>This is important for speed climbing through world zones. If you find the script getting stuck somewhere, particularly where you should easily be able to kill stuff, setting this to an option lower down in the list will help ensure you are more powerful at all times, but will spend more time acquiring the prestiges in maps.</p>";
				description += "<p><b>Recommended:</b> Dagadder</p>";
				return description;
			},
			'dropdown', 'Off', function () {
				var equips = ['Off', 'Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate'];
				if (game.global.slowDone) {
					equips.push('Harmbalest');
					equips.push('GambesOP');
				}
				return equips;
			}, "Equipment", [1, 2]);
		createSetting('ForcePresZ',
			function () { return ('Force Prestige Z') },
			function () {
				var description = "<p>On and after this zone is reached, always try to prestige for everything immediately regardless of <b>Prestige Climb</b> input unless it is set to <b>Off</b>.</p>";
				description += "<p>The <b>Prestige Skip</b> setting has the potential to disable this if it's enabled.</p>";
				description += "<p><b>Disable with -1.</b></p>";
				description += "<p><b>Recommended:</b> The zone you start heavily slowing down</p>";
				return description;
			}, 'value', -1, null, "Equipment", [1, 2]);
		createSetting('PrestigeSkip',
			function () { return ('Prestige Skip') },
			function () {
				var description = "<p>Will stop <b>Presige Climb</b> from running if you have 2 or more unbought prestiges (besides Supershield) in your upgrades window.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, "Equipment", [1, 2]);
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Combat
	const displayCombat = true;
	if (displayCombat) {
		createSetting('autoFight',
			function () { return (['Better Auto Fight Off', 'Better Auto Fight', 'Vanilla Auto Fight']) },
			function () {
				var description = "<p>Controls how combat is handled by the script.</p>";
				description += "<p><b>Better Auto Fight Off</b><br>Disables this setting.</p>";
				description += "<p><b>Better Auto Fight</b><br>Sends a new army to fight if your current army is dead, new squad ready, new squad breed timer target exceeded, and if breeding takes under 0.5 seconds.</p>";
				description += "<p><b>Vanilla Auto Fight</b><br>Will make sure the games AutoFight setting is enabled at all times and ensures you start fighting on portal.</p>";
				description += "<p><b>Recommended:</b> Better Auto Fight</p>";
				return description;
			}, 'multitoggle', 1, null, "Combat", [1, 2]);
		createSetting('autoAbandon',
			function () { return (['Never Abandon', 'Always Abandon', 'Smart Abandon']) },
			function () {
				var description = "<p>Controls whether to force abandon trimps for mapping.</p>";
				description += "<p><b>Never Abandon</b><br>Never abandon trimps for mapping.</p>";
				description += "<p><b>Always Abandon</b><br>Always abandon trimps for mapping.</p>";
				description += "<p><b>Smart Abandon</b><br>Abandon trimps for mapping when the next group of trimps is ready, or when (0 + overkill) cells away from c100.</p>";
				description += "<p><b>Recommended:</b> Smart Abandon</p>";
				return description;
			}, 'multitoggle', 2, null, 'Combat', [1, 2]);
		createSetting('floorCritCalc',
			function () { return ('Never Crit Calc') },
			function () {
				var description = "<p>When doing trimp damage calculations this will floor your crit chance to make the script assume you will never crit.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1, 2]);
		createSetting('AutoStance',
			function () { return (['Auto Stance Off', 'Auto Stance', 'D Stance']) },
			function () {
				var description = "<p>Enabling this setting will allow the script to swap stances to stop you having to do it manually.</p>";
				description += "<p><b>Auto Stance Off</b><br>Disables this setting.</p>";
				description += "<p><b>Auto Stance</b><br>Automatically swap stances to avoid death. Prioritises damage when you have enough health to survive.</p>";
				description += "<p><b>D stance</b><br>Keeps you in D stance regardless of your armies health.</p>";
				description += "<p><b>Recommended:</b> Auto Stance</p>";
				return description;
			}, 'multitoggle', 1, null, 'Combat', [1]);
		createSetting('IgnoreCrits',
			function () { return (['Safety First', 'Ignore Void Strength', 'Ignore All Crits']) },
			function () {
				var description = "<p>Enabling this setting will force any enemy damage calculations to ignore enemy crits.</p>";
				description += "<p><b>Safety First</b><br>Disables this setting.</p>";
				description += "<p><b>Ignore Void Strength</b><br>Will ignore crits from enemies in Void maps.</p>";
				description += "<p><b>Ignore All Crits</b><br>Will ignore crits from enemies in challenges, daily mods or void maps.</p>";
				description += "<p><b>Recommended:</b> Safety First</p>";
				return description;
			}, 'multitoggle', 0, null, 'Combat', [1, 2]);
		createSetting('ForceAbandon',
			function () { return ('Trimpicide') },
			function () {
				var description = "<p>If a new army is available to send and anticipation stacks aren't maxed this will suicide your current army and send a new one.</p>";
				description += "<p><b>Will not abandon in Spires.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [1]);
		createSetting('AutoRoboTrimp',
			function () { return ('AutoRoboTrimp') },
			function () {
				var description = "<p>Use the RoboTrimp ability starting at this level, and every 5 levels thereafter.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> 60</p>";
				return description;
			}, 'value', 60, null, 'Combat', [1]);
		createSetting('addpoison',
			function () { return ('Poison Calc') },
			function () {
				var description = "<p>Adds poison stack damage to any trimp damage calculations.</p>";
				description += "<p>May improve your poison zone speed.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [1]);
		createSetting('fullice',
			function () { return ('Ice Calc') },
			function () {
				var description = "<p>Always calculates your ice to be a consistent level instead of going by the enemy debuff. Primary use is to ensure your H:D (enemyHealth:trimpDamage) ratios aren't all over the place.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [1]);
		createSetting('45stacks',
			function () { return ('Antistack Calc') },
			function () {
				var description = "<p>Will force any damage calculations to assume you have max anticipation stacks.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [1]);
		createSetting('AutoDStanceSpire',
			function () { return ('D Stance in Spires') },
			function () {
				var description = "<p>Enabling this setting will force the script to only use Domination stance during Spires and not inside maps.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });

		createSetting('equalityManagement',
			function () { return (['Auto Equality Off', 'Auto Equality: Basic', 'Auto Equality: Advanced']) },
			function () {
				var description = "<p>Controls how the script handles interactions with the Equality perk.</p>";
				description += "<p><b>Auto Equality Off</b><br>Disables this setting.</p>";
				description += "<p><b>Auto Equality: Basic</b><br>Sets equality to 0 on slow enemies, and autoscaling on for fast enemies.<br><b>If using this you must setup the scaling & reversing settings in the equality menu!</b></p>";
				description += "<p><b>Auto Equality: Advanced</b><br>Will disable equality scaling and use the equality stack slider to set your equality to the ideal amount to kill the current enemy in the least amount of hits necessary.</p>";
				description += "<p><b>Recommended:</b> Auto Equality: Advanced</p>";
				return description;
			}, 'multitoggle', 2, null, 'Combat', [2]);
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

		//Scryer settings
		createSetting('AutoStanceScryer',
			function () { return ('Enable Scryer Stance') },
			function () {
				var description = "<p>Master switch for whether the script will use scryer stance.</p>";
				description += "<p>Overrides your <b>Auto Stance</b> setting when scryer conditions are met.</p>";
				description += "<p>Leave regular Auto Stance setting on while this is active.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'Combat', [1]);
		createSetting('scryerOverkill',
			function () { return ('Use When Overkill') },
			function () {
				var description = "<p>Overrides everything!";
				description += "<p>Switches to scryer stance when we can guaranteed overkill, giving us double loot with no speed penalty (minimum one overkill, if you have more than 1, it has the potential to lose speed)";
				description += "<p>This being on, and being able to overkill in scryer stance will override ALL other settings except the Spire setting when set to <b>Never</b>.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			},
			'boolean', false, null, 'Combat', [1],
			function () { return (getPageSetting('AutoStanceScryer', currSettingUniverse)) });
		createSetting('scryerMinZone',
			function () { return ('Min Zone') },
			function () {
				var description = "<p>Minimum zone (inclusive of the zone set) to start using scryer stance in.</p>";
				description += "<p>This needs to be on <b>AND</b> valid for the <b>MAYBE</b> option on all other Scryer settings to do anything if the <b>Use When Overkill</b> setting is disabled.</p>";
				description += "<p><b>Use When Overkill</b> ignores this input and will use scryer stance regardless of what this is set to if you can overkill the cell(s).</p>";
				description += "<p>Use 9999 to disable all Non-Overkill, Non-Force, scryer usage.</p>";
				description += "<p><b>Recommended:</b> 60 or 181</p>";
				return description;
			},
			'value', 60, null, 'Combat', [1],
			function () { return (getPageSetting('AutoStanceScryer', currSettingUniverse)) });
		createSetting('scryerMaxZone',
			function () { return ('Max Zone') },
			function () {
				var description = "<p>Maximum zone (not inclusive of the zone set) to stop using scryer stance in.</p>";
				description += "<p>Turning this on with a positive number stops <b>MAYBE</b> use of all other Scryer settings.</p>";
				description += "<p><b>Use When Overkill</b> ignores this input and will use scryer stance regardless of what this is set to if you can overkill the cell(s).</p>";
				description += "<p>Use 9999 to disable all Non-Overkill, Non-Force, scryer usage.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> 9999</p>";
				return description;
			},
			'value', 999, null, 'Combat', [1],
			function () { return (getPageSetting('AutoStanceScryer', currSettingUniverse)) });
		createSetting('scryerMinMaxWorld',
			function () { return (['Min & Max: Everywhere', 'Min & Max: World', 'Min & Max: Corrupted Only', 'Min & Max: Healthy Only']) },
			function () {
				var description = "<p>Further restricts scrying usage based on the current world zone.</p>";
				description += "<p><b>Everywhere</b><br>Places set as MAYBE are affected by Min & Max Range.</p>";
				description += "<p><b>World</b><br>Only world zones are affected by Min & Max zone settings.</p>";
				description += "<p><b>Corrupted Only</b><br>Only Corrupted and Healthy enemies in the World are affected.</p>";
				description += "<p><b>Healthy Only</b><br>Only Healthy enemies in the World are affected.</p>";
				description += "<p><b>Recommended:</b> World</p>";
				return description;
			},
			'multitoggle', 1, null, 'Combat', [1],
			function () { return (getPageSetting('AutoStanceScryer', currSettingUniverse)) });
		createSetting('scryerMaps',
			function () { return (['Maps: Never', 'Maps: Force', 'Maps: Maybe']) },
			function () {
				var useType = "maps";
				var description = "<p><b>Never</b><br>Will force the script to never use scryer stance in " + useType + ".</p>";
				description += "<p><b>Force</b><br>Will force the script to always use scryer stance in " + useType + ".</p>";
				description += "<p><b>Maybe</b><br>Will maybe run scryer stance in " + useType + " depending on how difficult the map is.</p>";
				description += "<p>The <b>Void Map</b>, <b>Plus Level</b>, and <b>Bionic Wonderland</b> settings all override this.</p>";
				description += "<p><b>Recommended:</b> Maps: Maybe</p>";
				return description;
			},
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('AutoStanceScryer', currSettingUniverse)) });
		createSetting('scryerVoidMaps',
			function () { return (['Void Maps: Never', 'Void Maps: Force', 'Void Maps: Maybe']) },
			function () {
				var useType = "void maps";
				var description = "<p><b>Never</b><br>Will force the script to never use scryer stance in " + useType + ".</p>";
				description += "<p><b>Force</b><br>Will force the script to always use scryer stance in " + useType + ".</p>";
				description += "<p><b>Maybe</b><br>Will maybe run scryer stance in " + useType + " depending on how difficult the void map is.</p>";
				description += "<p><b>Recommended:</b> Void Maps: Maybe</p>";
				return description;
			},
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('AutoStanceScryer', currSettingUniverse)) });
		createSetting('scryerPlusMaps',
			function () { return (['Plus Maps: Never', 'Plus Maps: Force', 'Plus Maps: Maybe']) },
			function () {
				var useType = "plus level maps";
				var description = "<p><b>Never</b><br>Will force the script to never use scryer stance in " + useType + ".</p>";
				description += "<p><b>Force</b><br>Will force the script to always use scryer stance in " + useType + ".</p>";
				description += "<p><b>Maybe</b><br>Will maybe run scryer stance in " + useType + " depending on how difficult the map is.</p>";
				description += "<p><b>Recommended:</b> Plus Maps: Maybe</p>";
				return description;
			},
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('AutoStanceScryer', currSettingUniverse)) });
		createSetting('scryerBW',
			function () { return (['BW: Never', 'BW: Force', 'BW: Maybe']) },
			function () {
				var useType = "Bionic Wonderland maps";
				var description = "<p><b>Never</b><br>Will force the script to never use scryer stance in " + useType + ".</p>";
				description += "<p><b>Force</b><br>Will force the script to always use scryer stance in " + useType + ".</p>";
				description += "<p><b>Maybe</b><br>Will maybe run scryer stance in " + useType + " depending on how difficult the map is.</p>";
				description += "<p><b>Recommended:</b> BW: Maybe</p>";
				return description;
			},
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('AutoStanceScryer', currSettingUniverse)) });
		createSetting('scryerSpire',
			function () { return (['Spire: Never', 'Spire: Force', 'Spire: Maybe']) },
			function () {
				var useType = "active Spires";
				var description = "<p><b>Never</b><br>Will force the script to never use scryer stance in " + useType + ".</p>";
				description += "<p><b>Force</b><br>Will force the script to always use scryer stance in " + useType + ".</p>";
				description += "<p><b>Maybe</b><br>Will maybe run scryer stance in " + useType + " depending on how difficult the Spire is.</p>";
				description += "<p><b>Recommended:</b> Spire: Maybe</p>";
				return description;
			},
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('AutoStanceScryer', currSettingUniverse)) });
		createSetting('scryerSkipBoss',
			function () { return (['Boss: Never', 'Boss: Maybe']) },
			function () {
				var useType = "when at cell 100 in the world";
				var description = "<p><b>Never</b><br>Will force the script to never use scryer stance " + useType + ".</p>";
				description += "<p><b>Maybe</b><br>Will maybe run scryer stance " + useType + " depending on how difficult the enemy is.</p>";
				description += "<p><b>Recommended:</b> Boss: Never</p>";
				return description;
			},
			'multitoggle', 0, null, 'Combat', [1],
			function () { return (getPageSetting('AutoStanceScryer', currSettingUniverse)) });
		createSetting('scryerCorrupted',
			function () { return (['Corrupted: Never', 'Corrupted: Force', 'Corrupted: Maybe']) },
			function () {
				var useType = "when fighting corrupted enemies";
				var description = "<p><b>Never</b><br>Will force the script to never use scryer stance " + useType + ".</p>";
				description += "<p><b>Force</b><br>Will force the script to always use scryer stance " + useType + ".</p>";
				description += "<p><b>Maybe</b><br>Will maybe run scryer stance " + useType + " depending on how difficult the enemy is.</p>";
				description += "<p>Magma maps and Corrupted Void Maps are currently classified as corrupted</b> and selecting <b>Never</b> here will override maps and Void Maps use of scryer stance.</p>";
				description += "<p><b>Recommended:</b> Maps: Maybe</p>";
				return description;
			},
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('AutoStanceScryer', currSettingUniverse)) });
		createSetting('scryerHealthy',
			function () { return (['Healthy: Never', 'Healthy: Force', 'Healthy: Maybe']) },
			function () {
				var useType = "when fighting healthy enemies";
				var description = "<p><b>Never</b><br>Will force the script to never use scryer stance " + useType + ".</p>";
				description += "<p><b>Force</b><br>Will force the script to always use scryer stance " + useType + ".</p>";
				description += "<p><b>Maybe</b><br>Will maybe run scryer stance " + useType + " depending on how difficult the enemy is.</p>";
				description += "<p><b>Recommended:</b> Healthy: Maybe</p>";
				return description;
			},
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('AutoStanceScryer', currSettingUniverse)) });
		createSetting('scryerPoison',
			function () { return ('Scry in Poison') },
			function () {
				var useType = "in poison zones";
				var description = "<p>Override for what to do within Poison empowerment zones.</p>";
				description += "<p><b>0 = Never</b><br>Will force the script to never use scryer stance " + useType + ".</p>";
				description += "<p><b>-1 = Maybe</b><br>Will maybe run scryer stance " + useType + " depending on how difficult the enemy is to kill.</p>";
				description += "<p><b>Above 0</b><br>Will force the script to always use scryer stance " + useType + ".</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			},
			'value', -1, null, 'Combat', [1],
			function () { return (getPageSetting('AutoStanceScryer', currSettingUniverse)) });
		createSetting('scryerWind',
			function () { return ('Scry in Wind') },
			function () {
				var useType = "in wind zones";
				var description = "<p>Override for what to do within Wind empowerment zones.</p>";
				description += "<p><b>0 = Never</b><br>Will force the script to never use scryer stance " + useType + ".</p>";
				description += "<p><b>-1 = Maybe</b><br>Will maybe run scryer stance " + useType + " depending on how difficult the enemy is to kill.</p>";
				description += "<p><b>Above 0</b><br>Will force the script to always use scryer stance " + useType + ".</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			},
			'value', -1, null, 'Combat', [1],
			function () { return (getPageSetting('AutoStanceScryer', currSettingUniverse)) });
		createSetting('scryerIce',
			function () { return ('Scry in Ice') },
			function () {
				var useType = "in ice zones";
				var description = "<p>Override for what to do within Ice empowerment zones.</p>";
				description += "<p><b>0 = Never</b><br>Will force the script to never use scryer stance " + useType + ".</p>";
				description += "<p><b>-1 = Maybe</b><br>Will maybe run scryer stance " + useType + " depending on how difficult the enemy is to kill.</p>";
				description += "<p><b>Above 0</b><br>Will force the script to always use scryer stance " + useType + ".</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			},
			'value', -1, null, 'Combat', [1],
			function () { return (getPageSetting('AutoStanceScryer', currSettingUniverse)) });
		createSetting('scryerDieZone',
			function () { return ('Die To Use S') },
			function () {
				var description = "<p>Enabling this will switch you back to scryer stance even when doing so would kill you.</p>";
				description += "<p>This has potential to happen in scenarios such as when skipping corrupted enemies switches you into regular X/H stance through Auto Stance, you've killed the corrupted and reached a non-corrupted enemy that you wish to use scryer stance on, but you havent bred yet and you are too low on health to just switch back to scryer stance.</p>";
				description += "<p>So use this if you'd rather die, wait to breed, then use scryer stance for the full non-corrupted enemy, to maximize dark essence gain.</p>";
				description += "<p>Use this input to set the minimum zone that scryer activates in. You can use decimal values to specify what cell this setting starts from.</p>";
				description += "<p><b>Set to -1 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			},
			'value', -1, null, 'Combat', [1],
			function () { return (getPageSetting('AutoStanceScryer', currSettingUniverse)) });
		createSetting('scryerEssenceOnly',
			function () { return ('Remaining Essence Only') },
			function () {
				var description = "<p>Will disable Scryer stance whilst in the world if there are no remaining enemies that hold dark essence.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1],
			function () { return (getPageSetting('AutoStanceScryer', currSettingUniverse)) });


		//---------------------------------------------------------------------------------------------------------------------

		//Windstacking

		createSetting('AutoStanceWind',
			function () { return ('Wind Stacking') },
			function () {
				var description = "<p>Enabling this will give you settings to allow you to wind stack in your runs.</p>";
				description += "<p>Will use your regular <b>Auto Stance</b> setting when outside of zones you're wind stacking in.</p>";
				description += "<p>If running a daily challenge then you will need to setup the windstacking settings in the <b>Daily</b> tab.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'Combat', [1],
			function () { return (game.empowerments.Wind.retainLevel >= 50) });
		createSetting('WindStackingZone',
			function () { return ('Wind Stack Min Zone') },
			function () {
				var description = "<p>Enables wind stacking in zones above and inclusive of the zone set.</p>";
				description += "<p><b>Recommended:</b> 100 zones below portal zone</p>";
				return description;
			},
			'value', 999, null, 'Combat', [1],
			function () {
				return (autoTrimpSettings.AutoStanceWind.enabled)
			});
		createSetting('WindStackingRatio',
			function () { return ('Wind Stack H:D') },
			function () {
				var description = "<p>If your H:D ratio is above this setting it will not use wind stance.</p>";
				description += "<p>If set to <b>0 or below</b> it will always use wind stance when past your wind stacking zone input.</p>";
				description += "<p><b>Recommended:</b> 1000</p>";
				return description;
			},
			'value', -1, null, 'Combat', [1],
			function () { return (autoTrimpSettings.AutoStanceWind.enabled) });
		createSetting('WindStackingLiq',
			function () { return ('Wind Stack Liquification') },
			function () {
				var description = "<p>Will wind stack during liquification regardless of your <b>Wind Stack H:D</b> or <b>Windstack Zone</b> inputs.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			},
			'boolean', false, null, 'Combat', [1],
			function () { return (autoTrimpSettings.AutoStanceWind.enabled) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Maps
	const displayMaps = true;
	if (displayMaps) {
		createSetting('autoMaps',
			function () { return (["Auto Maps Off", "Auto Maps On", "Auto Maps No Unique"]) },
			function (noUnique) {
				var description = "<p>Master switch for whether the script will do any form of mapping.</p>";
				description += "<p><b>The mapping that is done is decided by how you setup any mapping related settings.</b><br></p>";
				description += "<p><b>Auto Maps Off</b><br>Disables this setting.</p>";
				description += "<p><b>Auto Maps On</b><br>Enables mapping and will run all types of maps.</p>";
				if (!noUnique) description += "<p><b>Auto Maps No Unique</b><br>The same as <b>Auto Maps On</b> but won't run unique maps such as <b>The Block</b> or <b>Dimension of Rage</b>.</p>";
				description += "<p>Automatically adjusts the games repeat and exit to settings to ensure that you don't waste time in maps or time having to breed another army.</p>";
				description += "<p><b>Recommended:</b> Auto Maps On</p>";
				return description;
			},
			'multitoggle', 1, null, "Maps", [1, 2]);
		createSetting('autoMapsPortal',
			function () { return ('Auto Maps Portal') },
			function () {
				var description = "<p>Will ensure Auto Maps is enabled after portalling.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Maps', [1, 2]);
		createSetting('autoMapsPriority',
			function () { return ('Auto Maps Priority') },
			function () {
				var description = "<p>Will allow you to have map settings run in any combination you want through the settings priority system.</p>";
				var description = "<p>When enabled will sort the mapping order by priority inputs and run the lowest priority first. If multiple settings have the same priority then it will run them in the order that can be seen in the <b>Auto Maps Priority</b> popup that's found in the Help tab.</p>";
				var description = "<p>There are certain settings that will always run <b>first</b> regardless of your priority setup, these are the ones in bold in the <b>Auto Maps Priority</b> popup that's found in the Help tab.</p>";
				var description = "<p>There are certain settings that will always run <b>last</b> regardless of your priority setup, these are the ones in bold and italics in the <b>Auto Maps Priority</b> popup that's found in the Help tab.</p>";

				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Maps', [1, 2]);
		createSetting('onlyPerfectMaps',
			function () { return ('Perfect Maps') },
			function () {
				var description = "<p>When trying to map this will cause the script to create only perfect maps.</p>";
				description += "<p><b>Be warned this may greatly decrease the map level that the script believes is efficient.</b></p>";
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

		createSetting('autoLevelTest',
			function () { return ('Test New Auto Level') },
			function () {
				var description = "<p>Will switch the auto level system that is being used to the new one based off of and adapted from the zfarm code.</p>";
				description += "<p><b>Recommended:</b> On when active and can test</p>";
				return description;
			}, 'boolean', false, null, 'Maps', [1, 2]);

		createSetting('uniqueMapEnoughHealth',
			function () { return ('Unique Map Health Check') },
			function () {
				var description = "<p>Will disable Unique Maps from being run if you don't have enough health to survive the minimum attack of the highest attacking cell in that map.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Maps', [1, 2]);

		createSetting('hitsSurvived',
			function () { return ('Hits Survived') },
			function () {
				var description = "<p>Will farm until you can survive this amount of attacks.</p>";
				description += "<p>Will use the <b>Map Cap</b> and <b>Job Ratio</b> inputs that have been set in the top row of the <b>HD Farm</b> setting. If they haven't been setup then it will default to a job ratio of <b>1/1/2</b> and a map cap of <b>100</b>.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>Your Hits Survived can be seen in either the <b>Auto Maps status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</p>";
				description += "<p><b>Recommended:</b> 1.5 for earlygame, gradually increase the further you progress</p>";
				if (currSettingUniverse === 2) description += "<p>Don't set this above 1 when using <b>Auto Equality: Advanced</b> as it can cause you to eternally farm.</p>";
				return description;
			}, 'value', 1.25, null, "Maps", [1, 2]);

		createSetting('mapBonusHealth',
			function () { return ('Map Bonus Health') },
			function () {
				var description = "<p>Map Bonus stacks will be obtained to this amount when your current <b>Hits Survived</b> is below the threshold set in the <b>Hits Survived</b> setting.</p>";
				if (currSettingUniverse === 1) description += "<p>This is a very important setting to be used with <b>Advanced Nurseries</b> once you reach magma zones. Basically, if you are running out of nurseries too soon, increase this value, otherwise lower it.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 10, null, "Maps", [1, 2]);

		createSetting('mapBonusRatio',
			function () { return ('Map Bonus Ratio') },
			function () {
				var description = "<p>Map Bonus stacks will be obtained when above this World HD Ratio value.</p>";
				description += "<p>Will use the <b>Special</b> and <b>Job Ratio</b> inputs that have been set in the top row of the <b>Map Bonus</b> setting. If they haven't been setup then it will default to a job ratio of <b>0/1/3</b> and the best <b>Metal</b> cache available.</p>";
				description += "<p>Your HD Ratio can be seen in either the <b>Auto Maps status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> 4</p>";
				return description;
			}, 'value', -1, null, "Maps", [1, 2]);

		createSetting('mapBonusStacks',
			function () { return ('Map Bonus Stacks') },
			function () {
				var description = "<p>Map Bonus stacks will be obtained to this amount when your current <b>World HD Ratio</b> is above the threshold set in the <b>Map Bonus Ratio</b> setting.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 10, null, "Maps", [1, 2]);

		createSetting('scryvoidmaps',
			function () { return ('VM Scryer') },
			function () {
				var description = "<p>Will override any stance settings and set your stance to Scryer during Void Maps if you have the <b>Scryhard II</b> talent.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Maps', [1]);

		//HD Farm
		createSetting('hdFarmSettings',
			function () { return ('HD Farm Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like <b>H:D Ratio</b> or <b>Hits Survived</b> farming to be run.</p>";
				description += "<p>Your Hits Survived can be seen in either the <b>Auto Maps status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false, jobratio: '1,1,2', mapCap: 100 }], 'MAZLookalike("HD Farm", "HDFarm", "MAZ")', 'Maps', [1, 2]);

		createSetting('voidMapSettings',
			function () { return ('Void Map Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like Void Maps to be run.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'MAZLookalike("Void Map", "VoidMap", "MAZ")', 'Maps', [1, 2]);

		//Bone Shrine (bone) 
		createSetting('boneShrineSettings',
			function () { return ('Bone Shrine Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like Bone Shrine charges to be used.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'MAZLookalike("Bone Shrine", "BoneShrine", "MAZ")', 'Maps', [1, 2]);

		//Worshipper Farm 
		createSetting('worshipperFarmSettings',
			function () { return ('Worshipper Farm Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like Worshippers to be farmed.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'MAZLookalike("Worshipper Farm", "WorshipperFarm", "MAZ")', 'Maps', [2],
			function () { return game.stats.highestRadLevel.valueTotal() >= 50 });

		//Unique Maps
		createSetting('uniqueMapSettingsArray',
			function () { return ('Unique Map Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like Unique Maps to be run.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', {
			The_Wall: { enabled: false, zone: 100, cell: 0 },
			The_Block: { enabled: false, zone: 100, cell: 0 },
			Dimension_of_Anger: { enabled: false, zone: 100, cell: 0 },
			Trimple_Of_Doom: { enabled: false, zone: 100, cell: 0 },
			The_Prison: { enabled: false, zone: 100, cell: 0 },
			Imploding_Star: { enabled: false, zone: 100, cell: 0 },

			Big_Wall: { enabled: false, zone: 100, cell: 0 },
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
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false, jobratio: '1,1,2', special: '0', }], 'MAZLookalike("Map Bonus", "MapBonus", "MAZ")', 'Maps', [1, 2]);

		//Map Farm
		createSetting('mapFarmSettings',
			function () { return ('Map Farm Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like to farm a specific amount of maps.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'MAZLookalike("Map Farm", "MapFarm", "MAZ")', 'Maps', [1, 2]);

		//Prestige Raiding
		createSetting('raidingSettings',
			function () { return ('Raiding Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like to raid maps for prestiges.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'MAZLookalike("Raiding", "Raiding", "MAZ")', 'Maps', [1, 2]);

		//Bionic Raiding
		createSetting('bionicRaidingSettings',
			function () { return ('BW Raiding Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like to raid Bionic Wonderland maps for prestiges.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'MAZLookalike("Bionic Raiding", "BionicRaiding", "MAZ")', 'Maps', [1]);

		//Tribute Farming
		createSetting('tributeFarmSettings',
			function () { return ('Tribute Farm Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like Tributes & Meteorologists to be farmed.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'MAZLookalike("Tribute Farm", "TributeFarm", "MAZ")', 'Maps', [2]);

		//Smithy Farming
		createSetting('smithyFarmSettings',
			function () { return ('Smithy Farm Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like Smithies to be farmed.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'MAZLookalike("Smithy Farm", "SmithyFarm", "MAZ")', 'Maps', [2]);
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Challenges
	const displayChallenges = true;
	if (displayChallenges) {
		//Balance
		createSetting('balance',
			function () { return ('Balance') },
			function () {
				var description = "<p>Enable this if you want to automate destacking when running the <b>Balance</b> challenge.</p>";
				if (game.global.highestRadonLevelCleared > 1) description += "<p>If you have a gamma burst charged this will delay destacking until it has been used.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Challenges', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 40) });
		createSetting('balanceZone',
			function () { return ('B: Zone') },
			function () {
				var description = "<p>The zone you would like to start destacking your Unbalance stacks from.</p>";
				description += "<p>If set to <b>0 or below</b> it will never destack.</p>";
				return description;
			}, 'value', 6, null, 'Challenges', [1],
			function () { return (getPageSetting('balance', currSettingUniverse) && autoTrimpSettings.balance.require()) });
		createSetting('balanceStacks',
			function () { return ('B: Stacks') },
			function () {
				var description = "<p>The amount of Unbalance stacks you have to reach before clearing them.</p>";
				description += "<p>Once it starts destacking it will destack until you have no Unbalance stacks remaining.</p>";
				description += "<p>If set to <b>0 or below</b> it will never destack.</p>";
				description += "<p><b>Recommended:</b> 20</p>";
				return description;
			}, 'value', 20, null, 'Challenges', [1],
			function () { return (getPageSetting('balance', currSettingUniverse) && autoTrimpSettings.balance.require()) });
		createSetting('balanceImprobDestack',
			function () { return ('B: Improbability Destack') },
			function () {
				var description = "<p>If enabled this will cause you to fully destack when at cell 100 once you reach your destacking zone.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Challenges', [1],
			function () { return (getPageSetting('balance', currSettingUniverse) && autoTrimpSettings.balance.require()) });

		//Decay
		createSetting('decay',
			function () { return ('Decay') },
			function () {
				var description = "<p>Enable this if you want to use automation features when running the <b>Decay</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Challenges', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 55) });
		createSetting('decayStacksToPush',
			function () { return ('D: Stacks to Push') },
			function () {
				var description = "<p>Will ignore maps and push to end the zone if we go above this amount of stacks.</p>";
				description += "<p>Both Prestige Climb and Void Maps will override this and still run when above this stack count.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> 150</p>";
				return description;
			}, 'value', -1, null, 'Challenges', [1],
			function () { return (autoTrimpSettings.decay.enabled) });
		createSetting('decayStacksToAbandon',
			function () { return ('D: Stacks to Abandon') },
			function () {
				var description = "<p>Will abandon the challenge if you go above this amount of stacks.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> 400</p>";
				return description;
			}, 'value', -1, null, 'Challenges', [1],
			function () { return (autoTrimpSettings.decay.enabled) });

		//Life
		createSetting('life',
			function () { return ('Life') },
			function () {
				var description = "<p>Enable this if you want to use automation features when running the <b>Life</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Challenges', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 110) });
		createSetting('lifeZone',
			function () { return ('L: Zone') },
			function () {
				var description = "<p>Will take you to the map chamber when the current enemy is Living and when you are at or above this zone.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Must be used in conjunction with L: Stacks</b></p>";
				description += "<p><b>Recommended:</b> 100</p>";
				return description;
			}, 'value', -1, null, 'Challenges', [1],
			function () { return (autoTrimpSettings.life.enabled) });
		createSetting('lifeStacks',
			function () { return ('L: Stacks') },
			function () {
				var description = "<p>Will take you to the map chamber when the current enemy is Living and when you are at or below this stack count.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Must be used in conjunction with L: Zone</b></p>";
				description += "<p><b>Recommended:</b> 100</p>";
				return description;
			}, 'value', -1, null, 'Challenges', [1],
			function () { return (autoTrimpSettings.life.enabled) });

		//Toxicity
		createSetting('toxicitySettings',
			function () { return ('Toxicity Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like to farm a specific amount of Toxicity stacks for increased " + resource().toLowerCase() + " and resources gain.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'MAZLookalike("Toxicity Farm", "Toxicity", "MAZ")', 'Challenges', [1]);

		//Quagmire
		createSetting('quagmireSettings',
			function () { return ('Quagmire Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like Black Bog farming to be done during Quagmire.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'MAZLookalike("Quagmire Farm", "Quagmire", "MAZ")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 70) });

		//Insanity
		createSetting('insanitySettings',
			function () { return ('Insanity Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like Insanity stack farming to be done during Insanity.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'MAZLookalike("Insanity Farm", "Insanity", "MAZ")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 110) });

		//Alchemy
		createSetting('alchemySettings',
			function () { return ('Alchemy Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like potion farming to be done during Alchemy.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'MAZLookalike("Alchemy Farm", "Alchemy", "MAZ")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 155) });

		//Hypothermia
		createSetting('hypothermiaSettings',
			function () { return ('Hypothermia Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like bonfire farming to be done during Hypothermia.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			},
			'mazArray', [{ active: false }], 'MAZLookalike("Hypothermia Farm", "Hypothermia", "MAZ")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 175) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//C2
	const displayC2 = true;
	if (displayC2) {
		createSetting('c2Finish',
			function () { return ("Finish " + cinf()) },
			function () {
				var description = "<p>Abandons " + cinf() + "s when this zone is reached but won't portal.</p>";
				description += "<p>If <b>" + cinf() + " Runner</b> is enabled then this setting is disabled. </p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
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
			}, 'boolean', true, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 100) });

		createSetting('c2RunnerStart',
			function () { return (cinf() + ' Runner') },
			function () {
				var description = "<p>Enable this if you want to use " + cinf() + " running features.</p>";
				description += "<p>Allows the script to automatically start running " + cinf() + "'s when portaling in an effort to maintain your " + cinf() + " score</p>";
				description += "<p>If enabled will disable the <b>Finish " + cinf() + "</b> setting.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'C2', [1, 2]);

		createSetting('c2RunnerMode',
			function () { return ([cinf() + ' Runner %', cinf() + ' Runner Set Values']) },
			function () {
				var description = "<p>Toggles between the two modes that " + cinf() + " Runner can use for selecting which " + cinf() + " to start.</p>";
				description += "<p><b>" + cinf() + " Runner %</b><br>Will run " + cinf() + "s when they are below a set percentage of your HZE.</b><br>For a list of challenges that this will run see " + cinf() + " Table.</p>";
				description += "<p><b>" + cinf() + " Runner Set Values</b><br>\
				Uses the <b>" + cinf() + " Runner Settings</b> popup and will run enabled " + cinf() + "s when they are below the designated end zone.</p>";
				description += "<p>If using <b>" + cinf() + " Runner Set Values</b> then the " + cinf() + " will only be be finished if the challenge is enabled and a zone above 0 has been set.</p>";
				description += "<p>I recommend only using <b>" + cinf() + " Runner Set Values</b> if you're actively going to update the inputs as you progress.</p>";
				description += "<p><b>Recommended:</b> " + cinf() + " Runner %</p>";
				return description;
			}, 'multitoggle', 0, null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse)) });
		createSetting('c2RunnerSettings',
			function () { return (cinf() + ' Runner Settings') },
			function () {
				var description = "<p>Here you can enable the challenges you would like " + cinf() + " Runner to complete and the zone you'd like the respective challenge to finish at. It will start them on the next auto portal if necessary.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				return description;
			},
			'mazArray', {}, 'MAZLookalike("C2 Runner", "c2Runner", "c2Runner")', 'C2', [1, 2],
			function () {
				return (getPageSetting('c2RunnerStart', currSettingUniverse) && getPageSetting('c2RunnerMode', currSettingUniverse) === 1)
			});
		createSetting('c2RunnerPortal',
			function () { return (cinf() + ' Runner End Zone') },
			function () {
				var description = "<p>Automatically abandon " + cinf() + "s when this zone is reached.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and disable ending your " + cinf() + "s.</p>";
				description += "<p><b>Recommended:</b> Desired challenge end goal</p>";
				return description;
			}, 'value', -1, null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse) && getPageSetting('c2RunnerMode', currSettingUniverse) === 0) });
		createSetting('c2RunnerPercent',
			function () { return (cinf() + ' Runner %') },
			function () {
				var description = "<p>The percent threshhold you want " + cinf() + "s to be over.</p>";
				description += "<p>Will only run " + cinf() + "s with a HZE% below this settings value.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> 85</p>";
				return description;
			}, 'value', 0, null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse) && getPageSetting('c2RunnerMode', currSettingUniverse) === 0) });

		createSetting('c2RunnerEndMode',
			function () { return ([cinf() + ' Runner End Challenge', cinf() + ' Runner Portal']) },
			function () {
				var description = "<p>If set to <b>" + cinf() + " Runner Portal</b> this will automatically portal once you reach your " + cinf() + " end zone otherwise it will  end the challenge and continue your run on as normal.</p>";
				description += "<p><b>Recommended:</b> " + cinf() + " Runner Portal</p>";
				return description;
			}, 'multitoggle', 1, null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse)) });
		createSetting('c2Fused',
			function () { return ('Fused ' + cinf() + 's') },
			function () {
				var description = "<p>Will allow " + cinf() + " Runner to do fused versions of " + cinf() + "'s rather than normal versions to reduce time spent running " + cinf() + "s.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse)) });

		createSetting('c2IgnoreSpiresUntil',
			function () { return (cinf() + ' Ignore Spires Until') },
			function () {
				var description = "<p>Will disable all of the Spire features unless you're in a Spire at or above this value.</p>";
				description += "<p><b>This works based off Spire number rather than zone. So if you want to ignore Spires until Spire II at z300 then enter 2, Spire III at z400 would be 3 etc.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and make the script assume every Spire is an active Spire.</p>";
				description += "<p><b>Recommended:</b> Second to last Spire you reach on your runs</p>";
				return description;
			}, 'value', -1, null, 'C2', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });
		createSetting('c2ExitSpireCell',
			function () { return (cinf() + ' Exit Spire After Cell') },
			function () {
				var description = "<p>Will exit out of active Spires upon clearing this cell.</p>";
				description += "<p><b>Works based off cell number so if you want it to exit after Row #4 then set to 40.</b></p>";
				description += "<p>Any health or damage calculations for the Spire will be based off this cell if set.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'C2', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });
		createSetting('c2PreSpireNurseries',
			function () { return (cinf() + ' Nurseries pre-Spire') },
			function () {
				var description = "<p>Set the number of <b>Nurseries</b> to build during active Spires.</p>";
				description += "<p><b>Will override any <b>Nursery</b> settings that you have setup in the <b>AT AutoStructure</b> setting.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'C2', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });
		createSetting('c2AutoDStanceSpire',
			function () { return (cinf() + ' Stance in Spires') },
			function () {
				var description = "<p>Enabling this setting will force the script to only use Domination stance during Spires and not inside maps.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });

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
				description += "<p><b>Recommended:</b> Axeidic for <b>push</b> runs or Bootboost for <b>speed</b> runs</p>";
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
				var description = "<p>Enable this if you want to automate wonder farming on the <b>Experience</b> challenge.</p>";
				description += "<p>This setting is dependant on using <b>Bionic Raiding</b> in conjunction with it if you the Bionic Wonderland level you finish with to be higher than 605.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1],
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
				var description = "<p>Will run the Bionic Wonderland map level specified in <b>E: End BW</b> at this zone.</p>";
				description += "<p>If set below 601 it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 605 to start and increase over time</p>";
				return description;
			}, 'value', -1, null, 'C2', [1],
			function () { return (autoTrimpSettings.experience.enabled) });
		createSetting('experienceEndBW',
			function () { return ('E: End BW') },
			function () {
				var description = "<p>Will finish the challenge with this Bionic Wonderland level once reaching the end zone specified in <b>E: End Zone</b>.</p>";
				description += "<p><b>If the specified BW is not available, it will run the one closest to the setting.</b></p>";
				description += "<p><b>Recommended:</b> 605 to start and increase over time</p>";
				return description;
			}, 'value', -1, null, 'C2', [1],
			function () { return (autoTrimpSettings.experience.enabled) });

		//Unbalance
		createSetting('unbalance',
			function () { return ('Unbalance') },
			function () {
				var description = "<p>Enable this if you want to automate destacking when running the <b>Unbalance</b> challenge.</p>";
				description += "<p>If you have a gamma burst charged this will delay destacking until it has been used.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 35) });
		createSetting('unbalanceZone',
			function () { return ('U: Zone') },
			function () {
				var description = "<p>The zone you would like to start destacking your Unbalance stacks from.</p>";
				description += "<p>If set to <b>0 or below</b> it will never destack.</p>";
				return description;
			}, 'value', 6, null, 'C2', [2],
			function () { return (getPageSetting('unbalance', currSettingUniverse) && autoTrimpSettings.unbalance.require()) });
		createSetting('unbalanceStacks',
			function () { return ('U: Stacks') },
			function () {
				var description = "<p>The amount of Unbalance stacks you have to reach before clearing them.</p>";
				description += "<p>Once it starts destacking it will destack until you have no Unbalance stacks remaining.</p>";
				description += "<p>If set to <b>0 or below</b> it will never destack.</p>";
				description += "<p><b>Recommended:</b> 20</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('unbalance', currSettingUniverse) && autoTrimpSettings.unbalance.require()) });
		createSetting('unbalanceImprobDestack',
			function () { return ('U: Improbability Destack') },
			function () {
				var description = "<p>If enabled this will cause you to fully destack when at cell 100 once you reach your destacking zone.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (getPageSetting('unbalance', currSettingUniverse) && autoTrimpSettings.unbalance.require()) });

		//Duel
		createSetting('duel',
			function () { return ('Duel') },
			function () {
				var description = "<p>Enable this if you want to use automation features when running the <b>Duel</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 45) });
		createSetting('duelHealth',
			function () { return ('D: Force x10 Health') },
			function () {
				var description = "<p>Enable this to have the script suicide when running <b>Duel</b> by setting equality to 0 when you don't have the 10x health buff.</p>";
				description += "<p>Will only work if the <b>Auto Equality</b> setting is set to <b>Auto Equality: Advanced</b>."
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (getPageSetting('duel', currSettingUniverse) && autoTrimpSettings.duel.require()) });
		createSetting('duelShield',
			function () { return ('D: Shield') },
			function () {
				var description = "<p>The name of the shield you would like to equip while running <b>Duel</b>.</p>";
				description += "<p>This will override all other heirloom swapping features and only use this shield during <b>Duel</b>!</p>"
				description += "<p>Should ideally be a shield without the <b>Crit Chance</b> modifier.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'C2', [2],
			function () { return (getPageSetting('duel', currSettingUniverse) && autoTrimpSettings.duel.require()) });

		//Trappapalooza
		createSetting('trappapalooza',
			function () { return ('Trappapalooza') },
			function () {
				var description = "<p>Enable this if you want to use coordination witholding features when running the <b>Trappapalooza</b> challenge.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 60) });
		createSetting('trappapaloozaCoords',
			function () { return ('T: Coords') },
			function () {
				var description = "<p>The zone you would like to stop buying additional <b>Coordination</b> from.</p>";
				description += "<p><b>Set to 0 or -1 to disable this setting and not have any caps.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and not have a cap on <b>Coordination</b> purchases.</p>";
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
				description += "<p>When at cell 100 it will identify the damage required for clearing the next zone and if you don't have enough damage it will farm until you do.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 70) });

		//Quest
		createSetting('quest',
			function () { return ('Quest') },
			function () {
				var description = "<p>Enable this if you want automate running quests when running the <b>Quest</b> challenge.</p>";
				description += "<p>Will only function properly with <b>AutoMaps</b> enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 85) });
		createSetting('questSmithyZone',
			function () { return ('Q: Smithy Zone') },
			function () {
				var description = "<p>Will calculate the smithies required for quests based on this settings input and purchase spare ones if possible.</p>";
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
				var description = "<p>Enable this if you want to automate destacking and other features when running the <b>Mayhem</b> challenge.</p>";
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
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse) && autoTrimpSettings.mayhem.require()) });
		createSetting('mayhemZone',
			function () { return ('M: Zone') },
			function () {
				var description = "<p>The zone you'd like to start destacking from, can be used in conjunction with <b>M: HD Ratio</b> but when you're at or above this zone it will clear stacks until 0 are remaining regardless of the value set in <b>M: HD Ratio</b>.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse) && autoTrimpSettings.mayhem.require()) });
		createSetting('mayhemMapIncrease',
			function () { return ('M: Map Increase') },
			function () {
				var description = "<p>Increases the minimum map level of Mayhem farming by this value.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and assume a map increase of 0.</p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse) && autoTrimpSettings.mayhem.require()) });
		createSetting('mayhemMP',
			function () { return ('M: Melting Point') },
			function () {
				var description = "<p>The amount of smithies you'd like to run Melting Point at during Mayhem.</p>";
				description += "<p>This overrides the Smithy unique map settings input when set above <b>0</b>.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse) && autoTrimpSettings.mayhem.require()) });
		createSetting('mayhemSwapZone',
			function () { return ('M: Heirloom Swap Zone') },
			function () {
				var description = "<p>The zone you'd like to swap to your afterpush shield on Mayhem.</p>";
				description += "<p>This overrides the " + cinf() + " heirloom swap setting input when set above <b>0</b>.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse) && autoTrimpSettings.mayhem.require()) });

		//Storm
		createSetting('storm',
			function () { return ('Storm') },
			function () {
				var description = "<p>Enable this if you want to automate destacking when running the <b>Storm</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 105) });
		createSetting('stormZone',
			function () { return ('S: Zone') },
			function () {
				var description = "<p>From which zone destacking should be considered.</p>";
				description += "<p>Must be used in conjunction with <b>S: Stacks</b></p>";
				description += "<p>If set to <b>0 or below</b> it will never destack.</p>";
				description += "<p><b>Recommended:</b> 6</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('storm', currSettingUniverse) && autoTrimpSettings.storm.require()) });
		createSetting('stormStacks',
			function () { return ('S: Stacks') },
			function () {
				var description = "<p>Minimal amount of stacks to reach before starting destacking</p>";
				description += "<p>Once it starts destacking it will destack until you have no Cloudy stacks remaining.</p>";
				description += "<p>If set to <b>0 or below</b> it will never destack.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			},
			'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('storm', currSettingUniverse) && autoTrimpSettings.storm.require()) });

		//Pandemonium
		createSetting('pandemonium',
			function () { return ('Pandemonium') },
			function () {
				var description = "<p>Enable this if you want to automate destacking and other features when running the <b>Pandemonium</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";;
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (((!getPageSetting('c2disableFinished') || game.global.pandCompletions < 25) && game.stats.highestRadLevel.valueTotal() >= 150) || challengeActive('Pandemonium')) });

		createSetting('pandemoniumDestack',
			function () { return ('P: HD Ratio') },
			function () {
				var description = "<p>What HD ratio cut-off to use when farming for the Improbability. If this setting is 100, the script will destack until you can kill the Improbability in 100 average hits or there are no Pademonium stacks remaining to clear.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 10, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require()) });

		createSetting('pandemoniumZone',
			function () { return ('P: Destack Zone') },
			function () {
				var description = "<p>The zone you'd like to start destacking from, can be used in conjunction with <b>P: HD Ratio</b> but when you're at or above this zone it will clear stacks until 0 are remaining regardless of the value set in <b>P: HD Ratio</b>.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require()) });

		createSetting('pandemoniumAE',
			function () { return (['P: Auto Equip Off', 'P: Auto Equip', 'P AE: LMC', 'P AE: Huge Cache']) },
			function () {
				var description = "<p>This setting provides some equipment farming possibilites to help speedup runs.</p>";
				description += "<p><b>Will override equipment purchasing settings when enabled.</b></p>";
				description += "<p><b>Metal farming will only happen if pandemonium stacks are at 0.</b></p>";
				description += "<p><b>P: Auto Equip Off</b><br>Disables this setting.</p>";
				description += "<p><b>P: Auto Equip</b><br>Will automatically purchase equipment during Pandemonium regardless of efficiency.</p>";
				description += "<p><b>P AE: LMC</b><br>Provides settings to run maps if the cost of equipment levels is less than a single large metal cache. Overrides worker settings to ensure that you farm as much metal as possible.</p>";
				description += "<p><b>P AE: Huge Cache</b><br>Uses the same settings as <b>P: AE LMC</b> but changes to if an equip will cost less than a single huge cache that procs metal. Will automatically switch caches between LMC and HC depending on the cost of equipment to ensure a fast farming speed</p>";

				description += "<p><b>Recommended:</b> P AE: LMC</p>";
				return description;
			}, 'multitoggle', 0, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require()) });

		createSetting('pandemoniumAEZone',
			function () { return ('P AE: Zone') },
			function () {
				var description = "<p>The zone you would like to start equipment farming from.</p>";
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
				description += "<p>This overrides the Smithy unique map settings input when set above <b>0</b>.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require()) });
		createSetting('pandemoniumSwapZone',
			function () { return ('P: Heirloom Swap Zone') },
			function () {
				var description = "<p>The zone you'd like to swap to your afterpush shield on Pandemonium.</p>";
				description += "<p>This overrides the " + cinf() + " heirloom swap setting input when set above <b>0</b>.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require()) });

		//Glass
		createSetting('glass',
			function () { return ('Glass') },
			function () {
				var description = "<p>Enable this if you want to automate destacking and farming when running the <b>Glass</b> challenge.</p>";
				description += "<p>Will farm for damage if you can't clear stacks in a world level or above map.</p>";
				description += "<p>When at c100 of a zone it checks if you can clear world level maps on the next zone and if you can't it will farm damage until you are able to.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 175) });
		createSetting('glassStacks',
			function () { return ('G: Stacks') },
			function () {
				var description = "<p>Minimal amount of stacks to reach before starting destacking</p>";
				description += "<p>Once it starts destacking it will destack until you have no Glass stacks remaining.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('glass', currSettingUniverse) && autoTrimpSettings.glass.require()) });

		//Desolation
		createSetting('desolation',
			function () { return ('Desolation') },
			function () {
				var description = "<p>Enable this if you want to automate destacking and other features when running the <b>Desolation</b> challenge.</p>";
				description += "<p>Once this starts destacking it will destack until you have no chilled stacks remaining.</p>";
				description += "<p>If enabled then this will <b>always</b> reduce your chilled stacks to 0 before doing any other form of mapping.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (((!getPageSetting('c2disableFinished') || game.global.desoCompletions < 25) && game.stats.highestRadLevel.valueTotal() >= 200) || challengeActive('Desolation')) });
		createSetting('desolationDestack',
			function () { return ('D: HD Ratio') },
			function () {
				var description = "<p>At what HD ratio destacking should be considered.</p>";
				description += "<p>Must be used in conjunction with <b>D: Stacks</b>.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 0.0001</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });
		createSetting('desolationZone',
			function () { return ('D: Zone') },
			function () {
				var description = "<p>From which zone destacking should be considered.</p>";
				description += "<p>Must be used in conjunction with <b>D: Stacks</b>.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });
		createSetting('desolationStacks',
			function () { return ('D: Stacks') },
			function () {
				var description = "<p>Minimal amount of stacks to reach before starting destacking</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and automatically destack at 300 stacks.</p>";
				description += "<p>Once it starts destacking it will destack until you have no Chilled stacks remaining.</p>";
				description += "<p><b>Recommended:</b> 300</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });
		createSetting('desolationOnlyDestackZone',
			function () { return ('D: Only Destack Z') },
			function () {
				var description = "<p>From which zone only destacking should be considered. This will stop it caring about farming for metal to improve gear.</p>";
				description += "<p>Purchases the highest level of map that you can afford and survive to reduce chilled stacks faster.</p>";
				description += "<p>Disables perfect maps and sets sliders to minimum for all options to reduce fragment spending.</p>";
				description += "<p>If using <b>Auto Equality: Advanced</b> will set your equality level to the max it can be whilst destacking."
				description += "<p><b>Recommended:</b> 20 below Desolation end zone or when you stop clearing your destacking maps.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });
		createSetting('desolationMP',
			function () { return ('D: Melting Point') },
			function () {
				var description = "<p>The amount of smithies you'd like to run Melting Point at during Desolation.</p>";
				description += "<p>This overrides the Smithy unique map settings input when set above <b>0</b>.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });
		createSetting('desolationSwapZone',
			function () { return ('D: Heirloom Swap') },
			function () {
				var description = "<p>The zone you'd like to swap to your afterpush shield on Desolation.</p>";
				description += "<p>This overrides the " + cinf() + " heirloom swap setting input when set above <b>0</b>.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });

		//Desolation Prestige Scumming
		//Currently only visible to select people for testing purposes.
		//Should be functional but can't be sure until it has been tested.
		createSetting('desolationSettings',
			function () { return ('Desolation Settings') },
			function () {
				var description = "<p>Here you can select how and when you would like to prestige scum gear whilst running <b>Desolation</b>.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>This definitely shouldn't exist so be aware this is exploiting unintentional game mechanics.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'MAZLookalike("Desolation Gear Scumming", "Desolation", "MAZ")', 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });

		//Smithless
		createSetting('smithless',
			function () { return ('Smithless') },
			function () {
				var description = "<p>Enable this if you want to automate farming to obtain maximum Enhanced Armor stacks against Ubersmiths when running the <b>Smithless</b> challenge.</p>";
				description += "<p>It will identify breakpoints that can be reached with max tenacity & max map bonus to figure out how many stacks you are able to obtain from an Ubersmith and farm till it reachs that point if it's attainable.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 201) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Daily
	const displayDaily = true
	if (displayDaily) {
		createSetting('buyheliumy',
			function () {
				return ('Buy ' + (currSettingUniverse === 2 ? "Radonculous" : "Heliumy") + ' %')
			},
			function () {
				var description = "<p>Buys the " + (currSettingUniverse === 2 ? "Radonculous" : "Heliumy") + " bonus for <b>100 bones</b> when the daily bonus is above this value.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> Anything above 475.</p>";
				return description;
			}, 'value', -1, null, 'Daily', [1, 2]);

		createSetting('bloodthirstDestack',
			function () { return ('Bloodthirst Destack') },
			function () {
				var description = "<p>Will automatically run a level 6 map when you are one bloodthirst stack (death) away from the enemy healing and gaining additional attack.</p>";
				description += "<p><b>Won't function without Auto Maps enabled.</b></p>"
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Daily', [1, 2]);
		createSetting('bloodthirstMaxStacks',
			function () { return ('Bloodthirst TTK Check') },
			function () {
				var description = "<p>When mapping on a daily with the bloodthirst modifier this will cause Auto Equality to check if you can kill your current enemy in less hits than it will heal from bloodthirst stack accumulation and if it doesn't it will suicide your trimps until it has max stacks.</p>";
				description += "<p>Requires your auto equality setting to be set to <b>Auto Equality: Advanced</b> to work.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Daily', [2]);
		createSetting('bloodthirstVoidMax',
			function () { return ('Void: Max Bloodthirst') },
			function () {
				var description = "<p>Will make your Void HD Ratio assume you have max bloodthirst stacks active if you're in a bloodthirst daily.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1, 2]);
		createSetting('empowerAutoEquality',
			function () { return ('AE: Empower') },
			function () {
				var description = "<p>When the empower mod is active it will automatically adjust calculations for enemy stats to factor in either explosive or crit modifiers if they're active on the current daily.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Daily', [2],
			function () { return (getPageSetting('equalityManagement') === 2) });
		createSetting('mapOddEvenIncrement',
			function () { return ('Odd/Even Increment') },
			function () {
				var description = "<p>Will automatically increment your farming settings world input by 1 if the current zone has a negative even or odd related buff. If the daily has both types of mods it will try to identify which one is worse and skip farming on that zone type.</b></p>";
				description += "<p>Will only impact the following settings: Heirloom swap zone, Void Maps, Map Farm" + (currSettingUniverse === 2 ? ", Tribute Farm, Worshipper Farm, Smithy Farm." : ".") + "</p>";
				description += "<p>Prints a message in your message log everytime you start a zone with negative mods telling you it will skip the farming settings mentioned above.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1, 2]);
		createSetting('avoidEmpower',
			function () { return ('Avoid Empower') },
			function () {
				var description = "<p>Tries to avoid Empower stacks during empower dailies by suiciding your trimps when the enemies next hit will kill them.</p>";
				description += "<p>Doesn't factor in damage taken from the Explosive daily modifier.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Daily', [1]);
		createSetting('dscryvoidmaps',
			function () { return ('D: VM Scryer') },
			function () {
				var description = "<p>Will override any stance settings and set your stance to Scryer during Void Maps if you have the <b>Scryhard II</b> talent.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1]);

		createSetting('dIgnoreSpiresUntil',
			function () { return ('D: Ignore Spires Until') },
			function () {
				var description = "<p>Will disable all of the Spire features unless you're in a Spire at or above this value.</p>";
				description += "<p><b>This works based off Spire number rather than zone. So if you want to ignore Spires until Spire II at z300 then enter 2, Spire III at z400 would be 3 etc.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and make the script assume every Spire is an active Spire.</p>";
				description += "<p><b>Recommended:</b> Second to last Spire you reach on your runs</p>";
				return description;
			}, 'value', -1, null, 'Daily', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });
		createSetting('dExitSpireCell',
			function () { return ('D: Exit Spire After Cell') },
			function () {
				var description = "<p>Will exit out of active Spires upon clearing this cell.</p>";
				description += "<p><b>Works based off cell number so if you want it to exit after Row #4 then set to 40.</b></p>";
				description += "<p>Any health or damage calculations for the Spire will be based off this cell if set.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'Daily', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });
		createSetting('dPreSpireNurseries',
			function () { return ('D: Nurseries pre-Spire') },
			function () {
				var description = "<p>Set the number of <b>Nurseries</b> to build during active Spires.</p>";
				description += "<p><b>Will override any <b>Nursery</b> settings that you have setup in the <b>AT AutoStructure</b> setting.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'Daily', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });
		createSetting('dAutoDStanceSpire',
			function () { return ('D Stance in Spires') },
			function () {
				var description = "<p>Enabling this setting will force the script to only use Domination stance during Spires and not inside maps.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });

		createSetting('dAutoStanceWind',
			function () { return ('D: Wind Stacking') },
			function () {
				var description = "<p>Enabling this will give you settings to allow you to wind stack in your runs.</p>";
				description += "<p>Will use your regular <b>Auto Stance</b> setting when outside of zones you're wind stacking in.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1],
			function () { return (game.empowerments.Wind.retainLevel >= 50) });
		createSetting('dWindStackingZone',
			function () { return ('D: Wind Stack Zone') },
			function () {
				var description = "<p>Enables wind stacking in zones above and inclusive of the zone set.</p>";
				description += "<p><b>Recommended:</b> 100 zones below portal zone</p>";
				return description;
			}, 'value', -1, null, 'Daily', [1],
			function () { return (autoTrimpSettings.dAutoStanceWind.enabled) });
		createSetting('dWindStackingRatio',
			function () { return ('D: Wind Stack H:D') },
			function () {
				var description = "<p>If your H:D ratio is above this setting it will not use wind stance.</p>";
				description += "<p>If set to <b>0 or below</b> it will always use wind stance when at or above your wind stack zone input.</p>";
				description += "<p><b>Recommended:</b> 1000</p>";
				return description;
			}, 'value', -1, null, 'Daily', [1],
			function () { return (autoTrimpSettings.dAutoStanceWind.enabled) });
		createSetting('dWindStackingLiq',
			function () { return ('Wind Stack Liquification') },
			function () {
				var description = "<p>Will wind stack during liquification regardless of your <b>Daily Wind Stack H:D</b> or <b>Daily Wind Stack Zone</b> inputs.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1],
			function () { return (autoTrimpSettings.dAutoStanceWind.enabled) });

		//Daily Portal
		createSetting('dailyPortalStart',
			function () { return ('Auto Start Daily') },
			function () {
				var description = "<p>When you portal with this on it will start a daily for you if there's any available. Will select the oldest daily available and run it.</p>";
				description += "<p><b>Recommended:</b> Only on when you want to run dailies</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1, 2]);
		createSetting('dailyPortal',
			function () { return (['Daily Portal: Off', 'Daily Portal: ' + resourceHour() + '/Hr', 'Daily Portal: Custom']) },
			function () {
				var description = "<p>Will automatically portal into different challenges depending on the way you setup the Daily Auto Portal related settings. The challenge that it portals into can be setup through the <b>Auto Portal</b> settings in the <b>Core</b> tab.</p>";
				description += "<p>Additional settings appear when <b>Daily Portal: " + resourceHour() + "/Hr</b> or <b>Daily Portal: Custom</b> are selected.</p>";
				description += "<p><b>Daily Portal Off</b><br>Disables this setting. Be warned it will never end your dailies unless you use the Portal After option in Void Map settings!</p>";

				description += "<p><b>Daily Portal: " + resourceHour() + "/Hr</b><br>Portals into new runs when your " + resource().toLowerCase() + " per hour goes below your current runs best " + resourceHour().toLowerCase() + "/hr.</p>";
				description += "<p>There is a <b>Buffer</b> setting, which lowers the check from best " + resource().toLowerCase() + " per hour to (best - buffer setting) " + resource().toLowerCase() + " per hour.</p>";
				description += "<p><b>Daily Portal: Custom</b><br>Will portal into your Auto Portal challenge at the zone specified in the <b>Daily Portal Zone</b> setting.</p>";
				description += "<p><b>Recommended:</b> " + (currSettingUniverse === 2 ? "Daily Portal: Custom with a specified endzone to make use of the Scruffy level 3 ability" : ("Daily Portal: " + resourceHour() + "/Hr")) + "</p>";
				return description;
			}, 'multitoggle', 0, null, 'Daily', [1, 2]);

		createSetting('dailyPortalZone',
			function () { return ('Daily Portal Zone') },
			function () {
				var description = "<p>Will automatically portal once this zone is reached when using the <b>Daily Portal: Custom</b> Auto Portal setting.</p>";
				description += "<p>Setting this to <b>200</b> would portal when you reach <b>zone 200</b>.</p>";
				description += "<p><b>Recommended:</b> The zone you would like your run to end</p>";
				return description;
			}, 'value', 999, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) >= 2) });

		createSetting('dailyDontPortalBefore',
			function () { return ("D: Don't Portal Before") },
			function () {
				var description = "<p>Will stop the script from automatically portaling before the specified zone when using the <b>Daily Portal: " + resourceHour() + "/Hr</b> Auto Portal setting.</p>";
				description += "<p>It is an additional check that prevents drops in " + resource().toLowerCase() + " per hour from triggering Auto Portal.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and assume any zone is okay to portal on.</p>";
				description += "<p><b>Recommended:</b> The minimum zone you would like your run to reach</p>";
				return description;
			}, 'value', 999, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) === 1) });

		createSetting('dailyHeliumHrBuffer',
			function () { return ('D: ' + resourceHour() + '/Hr Buffer %') },
			function () {
				var description = "<p>When using the <b>Daily Portal: " + resourceHour() + "/Hr</b> Auto Portal setting, it will portal if your " + resource().toLowerCase() + " per hour drops by this settings % input lower than your best for current run.</p>";
				description += "<p>Allows portaling midzone if you exceed the set buffer amount by 5x. (ie a normal 2% buffer setting would now portal mid-zone if you fall below 10% buffer).</p>";
				description += "<p><b>Set to 0 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> 4</p>";
				return description;
			}, 'value', 0, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) === 1) });

		createSetting('dailyHeliumHrPortal',
			function () {
				var hze = game.stats.highestLevel.valueTotal();
				var portalOptions = ['Auto Portal Immediately', 'Portal After Voids'];
				if (currSettingUniverse === 1 && hze >= 230) portalOptions.push('Portal After Poison Voids');
				return portalOptions;
			},
			function () {
				var description = "<p>How you would like to portal when below your " + resource().toLowerCase() + " per hour threshold.</p>";
				description += "<p><b>Auto Portal Immediately</b><br>Will auto portal straight away.</p>";
				description += "<p><b>Portal After Voids</b><br>Will run any remaining void maps then proceed to portal.</p>";
				if (currSettingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 230) description += "<p><b>Portal After Poison Voids</b><br>Will continue your run until you reach the next poison zone and run void maps there.</p>";
				description += "<p><b>Recommended:</b> Portal After Voids</p>";
				return description;
			}, 'multitoggle', 0, null, 'Daily', [1, 2],
			function () {
				return (getPageSetting('dailyPortal', currSettingUniverse) === 1)
			});

		createSetting('dailyHeliumHrExitSpire',
			function () { return ('Exit Spires for Voids') },
			function () {
				var description = "<p>If enabled will automatically exit Spires to run your voids earlier when the <b>" + resource() + " Per Hour</b> Auto Portal setting is wanting to portal.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) === 1 && game.stats.highestLevel.valueTotal() >= 170) });

		createSetting('dailyPortalFiller',
			function () { return ('Filler Run') },
			function () {
				var description = "<p>Will run a filler (non daily/" + cinf() + " run) challenge (selected through the <b>Auto Portal</b> settings in the <b>Core</b> tab) inbetween dailies.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			},
			'boolean', false, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) > 0) });

		createSetting('dailyPortalPreviousUniverse',
			function () { return ('Daily Previous Universe') },
			function () {
				var description = "<p>Will start your dailies in the previous universe. Takes you back to this universe after it has finished running.</p>";
				description += "<p>Ensure you setup daily settings for the <b>previous universe</b>.<br>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			},
			'boolean', false, null, 'Daily', [2],
			function () { return game.stats.highestRadLevel.valueTotal() >= 30 });

		createSetting('dailyDontCap',
			function () { return ('Use When Capped') },
			function () {
				var description = "<p>Will cause the script to only start dailies when you have the amount of dailies input in the <b>UWC: Amount</b> setting available to run.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			},
			'boolean', false, null, 'Daily', [1, 2]);

		createSetting('dailyDontCapAmt',
			function () { return ('UWC: Amount') },
			function () {
				var description = "<p>Will cause the script to only start dailies when you have this amount available to run.</p>";
				description += "<p><b>Recommended:</b> 7</p>";
				return description;
			},
			'value', 7, null, 'Daily', [1, 2],
			function () { return getPageSetting('dailyDontCap', currSettingUniverse) });

		createSetting('dailySkip',
			function () { return ('Skip Daily') },
			function () {
				var description = "<p>Use this to make the script skip specific dailies when starting runs.</p>";
				description += "<p>Must be input with same format as the game uses which is <b>'YEAR-MONTH-DAY'</b>.</p>"
				description += "<p>An example of an input would be <b>'2023-04-22'</b>.</p>"
				description += "<p>Can have multiple inputs, seperate them by commas.</p>"
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
		}, null, 'Daily', [1, 2],
			function () { return (false) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Heirloom
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
			}, 'boolean', false, null, 'Heirloom', [1, 2]);

		createSetting('heirloomMapSwap',
			function () { return ('Map Swap') },
			function () {
				var description = "<p>If below your assigned swap zone this will automatically swap from your <b>Initial</b> shield to your <b>Afterpush</b> (or <b>" + cinf() + "</b> depending on your run) shield when inside of maps.</p>";
				description += "<p><b>Void shield settings will override this.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomPostVoidSwap',
			function () { return ('Post Void Swap') },
			function () {
				var description = "<p>If you have completed any void maps on your run this will set your swap zone to 0 to maximise damage in your afterpush.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomVoidSwap',
			function () { return ('Void PB Swap') },
			function () {
				var description = "<p>When inside Void Maps and your current enemy is slow with your next enemy being fast this will automatically swap to your <b>Void PB</b> shield so that you can maximise PlagueBringer damage going into the next enemy.</p>";
				description += "<p><b>Won't do anything during double attack voids.</b></p>";
				description += "<p>Will only work if your <b>Void</b> Shield doesn't have <b>PlagueBringer</b> and your <b>Void PB</b> shield has <b>PlagueBringer</b>.</p>";
				description += "<p><b>Recommended:</b> Off unless you know what you're doing</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [2],
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
			}, 'boolean', false, null, 'Heirloom', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse) && game.stats.highestRadLevel.valueTotal() >= 203) });

		//Shield swapping
		createSetting('heirloomShield',
			function () { return ('Shields') },
			function () {
				var description = "<p>Switch for enabling Shield heirloom swapping.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p>Respects the <b>Auto Abandon</b> setting for if Shields should be swapped but ignores the cell check.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse)) });

		createSetting('heirloomInitial',
			function () { return ('Initial') },
			function () {
				var description = "<p>Shield to use before your designated swap zone.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> a shield with void map drop chance</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomAfterpush',
			function () { return ('Afterpush') },
			function () {
				var description = "<p>Shield to use after your designated swap zone.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> a shield without void map drop chance</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomC3',
			function () { return (cinf()) },
			function () {
				var description = "<p>Shield to use after your designated swap zone during " + c2Description() + " runs.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> a shield without void map drop chance</p>";
				return description;
			},
			'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomVoid',
			function () { return ('Void') },
			function () {
				var description = "<p>Shield to use inside of Void Maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> damage heirloom</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomVoidPlaguebringer',
			function () { return ('Void PB') },
			function () {
				var description = "<p>Shield to use inside of Void Maps when fighting a slow enemy and the next enemy is fast.</p>";
				description += "<p><b>Ignore Spires Until</b> settings will stop this swap from happening if the value is above your current world zone.</p>";
				description += "<p>A shield with <b>Plaguebringer MUST</b> be used.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> <b>Plaguebringer</b> heirloom</p>";
				return description;
			},
			'textValue', 'undefined', null, 'Heirloom', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse) && getPageSetting('heirloomVoidSwap', currSettingUniverse)) });

		createSetting('heirloomSpire',
			function () { return ('Spire') },
			function () {
				var description = "<p>Shield to use during active Spires.</p>";
				description += "<p><b>Ignore Spires Until</b> settings will stop this swap from happening if the value is above your current world zone.</p>";
				description += "<p>The Map Swap setting will override this whilst in maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Damage+Health heirloom</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse) && game.stats.highestLevel.valueTotal() >= 170) });

		createSetting('heirloomSwapZone',
			function () { return ('Swap Zone') },
			function () {
				var description = "<p>From which zone to swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield during filler (non daily/" + cinf() + " runs).</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>If set to <b>75</b> it will swap shields from <b>z75</b> onwards.</p>";
				return description;
			}, 'value', -1, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomSwapZoneDaily',
			function () { return ('Daily Swap Zone') },
			function () {
				var description = "<p>From which zone to swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield during daily runs.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>If set to <b>75</b> it will swap shields from <b>z75</b> onwards.</p>";
				return description;
			},
			'value', -1, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomSwapZoneC3',
			function () { return (cinf() + ' Swap Zone') },
			function () {
				var description = "<p>From which zone to swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield during daily runs.</p>";
				description += "<p>If the " + cinf() + " shield setting has been setup then it will use that instead of the <b>Afterpush</b> shield.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>If set to <b>75</b> it will swap shields from <b>z75</b> onwards.</p>";
				return description;
			}, 'value', -1, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomSwapHD',
			function () { return ('HD Ratio Swap') },
			function () {
				var description = "<p>Will swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield when your <b>World HD Ratio</b> is above this value.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomSwapHDCompressed',
			function () { return ('Comp Swap HD') },
			function () {
				var description = "<p>Will swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield when the next cell is compressed and your <b>World HD Ratio</b> is above this value.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Heirloom', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse) && getPageSetting('heirloomCompressedSwap', currSettingUniverse)) });

		//Staff swapping
		createSetting('heirloomStaff',
			function () { return ('Staffs') },
			function () {
				var description = "<p>Switch for enabling Staff heirloom swapping.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse)) });

		createSetting('heirloomStaffWorld',
			function () { return ('World') },
			function () {
				var description = "<p>The staff to use when in world zones.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> High pet XP staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffMap',
			function () { return ('Map') },
			function () {
				var description = "<p>The staff to use when running maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p>Will be overridden by the cache heirloom settings if they've been setup.</p>";
				description += "<p><b>Recommended:</b> Resource efficiency heavy staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffVoid',
			function () { return ('Void') },
			function () {
				var description = "<p>The staff to use when running <b>Void</b> maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated metal efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffFragment',
			function () { return ('Fragment') },
			function () {
				var description = "<p>The staff to use when the script is farming for fragments to be able to afford maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffFood',
			function () { return ('Savory Cache') },
			function () {
				var description = "<p>The staff to use when running <b>Savory Cache</b> maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated food efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffWood',
			function () { return ('Wooden Cache') },
			function () {
				var description = "<p>The staff to use when running <b>Wooden Cache</b> maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated wood efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffMetal',
			function () { return ('Metal Cache') },
			function () {
				var description = "<p>The staff to use when running <b>Metal Cache</b> maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated metal efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffResource',
			function () { return ('Resource Cache') },
			function () {
				var description = "<p>The staff to use when running <b>Resource Cache</b> maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated science efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		//Auto Heirlooms
		createSetting('heirloomAuto',
			function () { return ('Auto Heirlooms') },
			function () {
				var description = "<p>Master switch for whether the script will try to keep any of the heirlooms in your temporary section when portaling.</p>";
				description += "<p>When run it will check the mods you want the heirloom to have and checks if the heirlooms in your temporary section for the type(s) you have selected to keep have all of the selected mods and if any do they will be stashed otherwise will be recycled.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2]);

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
			'multitoggle', 0, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		createSetting('heirloomAutoRarityPlus',
			function () { return ('Rarity+') },
			function () {
				var description = "<p>Overrides <b>Rarity to Keep</b> recycling heirlooms of a higher quality and instead allows the script to look at if they'd be worth keeping.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2]);

		createSetting('heirloomAutoModTarget',
			function () { return ('Mod Target Count') },
			function () {
				var description = "<p>Allows you to make it so that auto heirlooms will keep heirlooms if they have <b>X</b> amount of the mods you have setup in the different heirloom type options.</p>";
				description += "<p>When using this I recommend not setting any of the mod inputs to <b>Any</b> as it can cause you to keep heirlooms with more suboptimal mods than you desire.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and have the script assume you want to only keep perfect heirlooms.</p>";
				description += "<p><b>Recommended:</b> 0</p>";
				return description;
			}, 'value', 0, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		//Shield Line
		createSetting('heirloomAutoShield',
			function () { return ('Shields') },
			function () {
				var description = "<p>Enable to allow you to select the shield modifiers you would like to target.</p>";
				description += "<p>Auto Heirlooms won't keep any shields if this setting is disabled.</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		createSetting('heirloomAutoRareToKeepShield',
			function () { return ('Rarity to Keep') },
			function () {
				var description = "<p>When identifying which heirlooms to keep will look at this rarity of heirloom and recycle others.</p>";
				description += "<p>Will only display tiers that can currently be obtained based on your highest zone reached.</p>";
				description += "<p>Only display the mods available for your selected heirloom tier.</p>";
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
			}, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse)) });

		createSetting('heirloomAutoShieldBlacklist',
			function () { return ('Blacklist') },
			function () {
				var description = "<p>Will automatically recycle Shield heirlooms with the mods you input into this setting.</p>";
				description += "<p>Mod names must be entered exactly the same as they appear in the modifier settings.</p>";
				description += "<p>You can input multiple modifier names but they need to be seperated by commas.</p>";
				return description;
			}, 'multiTextValue', 'None', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse)) });

		createSetting('heirloomAutoShieldMod1',
			function () { return ('Mod 1') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Shield'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 0)
			});

		createSetting('heirloomAutoShieldMod2',
			function () { return ('Mod 2') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Shield'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 1)
			});

		createSetting('heirloomAutoShieldMod3',
			function () { return ('Mod 3') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Shield'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 2)
			});

		createSetting('heirloomAutoShieldMod4',
			function () { return ('Mod 4') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Shield'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 5)
			});

		createSetting('heirloomAutoShieldMod5',
			function () { return ('Mod 5') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Shield'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 7)
			});

		createSetting('heirloomAutoShieldMod6',
			function () { return ('Mod 6') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Shield'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 9)
			});

		createSetting('heirloomAutoShieldMod7',
			function () { return ('Mod 7') },
			function () {
				var description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Shield'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 11)
			});

		//Staff Line
		createSetting('heirloomAutoStaff',
			function () { return ('Staffs') },
			function () {
				var description = "<p>Enable to allow you to select the staff modifiers you would like to target.</p>";
				description += "<p>Auto Heirlooms won't keep any staffs if this setting is disabled.</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		createSetting('heirloomAutoRareToKeepStaff',
			function () { return ('Rarity to Keep') },
			function () {
				var description = "<p>When identifying which heirlooms to keep will look at this rarity of heirloom and recycle others.</p>";
				description += "<p>Will only display tiers that can currently be obtained based on your highest zone reached.</p>";
				description += "<p>Only display the mods available for your selected heirloom tier.</p>";
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
			}, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse)) });

		createSetting('heirloomAutoStaffBlacklist',
			function () { return ('Blacklist') },
			function () {
				var description = "<p>Will automatically recycle Staff heirlooms with the mods you input into this setting.</p>";
				description += "<p>Mod names must be entered exactly the same as they appear in the modifier settings.</p>";
				description += "<p>You can input multiple modifier names but they need to be seperated by commas.</p>";
				return description;
			}, 'multiTextValue', 'None', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse)) });

		createSetting('heirloomAutoStaffMod1',
			function () { return ('Mod 1') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Staff'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 0)
			});

		createSetting('heirloomAutoStaffMod2',
			function () { return ('Mod 2') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Staff'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 1)
			});

		createSetting('heirloomAutoStaffMod3',
			function () { return ('Mod 3') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Staff'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 2)
			});

		createSetting('heirloomAutoStaffMod4',
			function () { return ('Mod 4') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Staff'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 5)
			});

		createSetting('heirloomAutoStaffMod5',
			function () { return ('Mod 5') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Staff'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 7)
			});

		createSetting('heirloomAutoStaffMod6',
			function () { return ('Mod 6') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Staff'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 9)
			});

		createSetting('heirloomAutoStaffMod7',
			function () { return ('Mod 7') },
			function () {
				var description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Staff'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 11)
			});

		//Core Line
		createSetting('heirloomAutoCore',
			function () { return ('Cores') },
			function () {
				var description = "<p>Enable to allow you to select the core modifiers you would like to target.</p>";
				description += "<p>Auto Heirlooms won't keep any cores if this setting is disabled.</p>";
				return description
			}, 'boolean', false, null, 'Heirloom', [1],
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
			}, 'Heirloom', [1],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse)) });

		createSetting('heirloomAutoCoreBlacklist',
			function () { return ('Blacklist') },
			function () {
				var description = "<p>Will automatically recycle Core heirlooms with the mods you input into this setting.</p>";
				description += "<p>Mod names must be entered exactly the same as they appear in the modifier settings.</p>";
				description += "<p>You can input multiple modifier names but they need to be seperated by commas.</p>";
				return description;
			}, 'multiTextValue', 'None', null, 'Heirloom', [1],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse)) });

		createSetting('heirloomAutoCoreMod1',
			function () { return ('Mod 1') },
			function () {
				var description = "<p>Keeps Cores with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Core'); }, 'Heirloom', [1],
			function () {
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse))
			});
		createSetting('heirloomAutoCoreMod2',
			function () { return ('Mod 2') },
			function () {
				var description = "<p>Keeps Cores with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Core'); }, 'Heirloom', [1],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepCore', currSettingUniverse)) >= 1)
			});
		createSetting('heirloomAutoCoreMod3',
			function () { return ('Mod 3') },
			function () {
				var description = "<p>Keeps Cores with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Core'); }, 'Heirloom', [1],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepCore', currSettingUniverse)) >= 2)
			});
		createSetting('heirloomAutoCoreMod4',
			function () { return ('Mod 4') },
			function () {
				var description = "<p>Keeps Cores with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return autoHeirloomOptions('Core'); }, 'Heirloom', [1],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepCore', currSettingUniverse)) >= 6)
			});
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Golden
	const displayGolden = true;
	if (displayGolden) {
		createSetting('autoGoldenSettings',
			function () { return ('Auto Gold Settings') },
			function () {
				var description = "<p>Here you can select the golden upgrades you would like to have purchased during your runs.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [], 'MAZLookalike("Auto Golden", "AutoGolden", "MAZ")', 'Golden', [1, 2]);
	}

	//Spire
	const displaySpire = true;
	if (displaySpire) {
		createSetting('IgnoreSpiresUntil',
			function () { return ('Ignore Spires Until') },
			function () {
				var description = "<p>Will disable all of the Spire features unless you're in a Spire at or above this value.</p>";
				description += "<p><b>This works based off Spire number rather than zone. So if you want to ignore Spires until Spire II at z300 then enter 2, Spire III at z400 would be 3 etc.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and make the script assume every Spire is an active Spire.</p>";
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
				description += "<p>Any health or damage calculations for the Spire will be based off this cell if set.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'Spire', [1]);
		createSetting('PreSpireNurseries',
			function () { return ('Nurseries pre-Spire') },
			function () {
				var description = "<p>Set the number of <b>Nurseries</b> to build during active Spires.</p>";
				description += "<p><b>Will override any <b>Nursery</b> settings that you have setup in the <b>AT AutoStructure</b> setting.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'Spire', [1]);
		createSetting('hitsSurvivedSpire',
			function () { return ('Hits Survived') },
			function () {
				var description = "<p>Will farm until you can survive this amount of attacks while in active Spires.</p>";
				description += "<p><b>Your Hits Survived can be seen in either the Auto Maps status tooltip or the AutoTrimp settings Help tab.</b></p>";
				description += "<p>Will use the <b>Map Cap</b> and <b>Job Ratio</b> inputs that have been set in the top row of the <b>HD Farm</b> setting. If they haven't been setup then it will default to a job ratio of <b>1/1/2</b> and a map cap of <b>100</b>.</p>";
				description += "<p><b>Will override the Hits Survived setting in the <b>Maps</b> tab so if this is disabled it won't farm for health at all during active Spires.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				if (currSettingUniverse === 1) description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 10, null, 'Spire', [1]);
		createSetting('skipSpires',
			function () { return ('Skip Spires') },
			function () {
				var description = "<p>Will disable any form of mapping after your trimps have max map bonus stacks inside active Spires.</p>";
				if (currSettingUniverse === 1) description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Spire', [1]);

	}

	//----------------------------------------------------------------------------------------------------------------------

	//Magma
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
				description += "<p>Set to <b>0</b> to disable this setting.</p>";
				description += "<p>If set <b>below 0</b> it will assume you always want this active.</p>";
				description += "<p>If the <b>Overclocker</b> upgrade has been purchased at least once it will use Hybrid mode if unlocked otherwise it will use the scripts pseudo-hybrid solution.</p>";
				description += "<p><b>Recommended:</b> Use Gatorcalc website to find ideal zone</p>";
				return description;
			}, 'value', 0, null, 'Magma', [1]);
		createSetting('fuelend',
			function () { return ('End Fuel Z') },
			function () {
				var description = "<p>Will automatically set the generator to gather <b>Fuel</b> until this zone is reached.</p>";
				description += "<p>Set to <b>0</b> to disable this setting.</p>";
				description += "<p>If set <b>below 0</b> it will assume you always want this active.</p>";
				description += "<p>If the <b>Overclocker</b> upgrade has been purchased at least once it will use Hybrid mode if unlocked otherwise it will use the scripts pseudo-hybrid solution.</p>";
				description += "<p><b>Recommended:</b> Use Gatorcalc website to find ideal zone</p>";
				return description;
			}, 'value', 0, null, 'Magma', [1]);
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
				var description = "<p>The mode that the script will use for the entire " + c2Description() + " runs.</p>";
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
			function () { return ('Efficient Spending') },
			function () {
				var description = "<p>If enabled the script will spend your magmite on the most efficient upgrade available.</p>";
				description += "<p>Uses the same system as the Gatorcalc website so look there if you want more advanced settings!</p>";
				description += "<p>Won't purchase any one and done upgrades!</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'Magma', [1]);

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

		//Automate Fuel Zones
		createSetting('magmiteAutoFuel',
			function () { return ('Automate Fuel Zones') },
			function () {
				var description = "<p>Will change your zones immediately before auto portaling to ensure that they are accurate going into your next run.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Magma', [1]);
		createSetting('magmiteFuelZones',
			function () { return ('Zones To Fuel') },
			function () {
				var description = "<p>When Automate Fuel Zones runs it will use this value for how many zones you should fuel for.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and assume 20 zones.</p>";
				description += "<p><b>Recommended:</b> 20</p>";
				return description;
			}, 'value', 20, null, 'Magma', [1],
			function () { return (autoTrimpSettings.magmiteAutoFuel.enabled) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Nature
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
				var description = "<p>If tokens would go below this value it will disable token expenditure.</p>";
				description += "<p>Set to <b>0 or below</b> to completely disable token expenditure.</p>";
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
			}, 'dropdown', 'Off', function () { return ['Off', 'Empowerment', 'Transfer', 'Convert to Wind', 'Convert to Ice', 'Convert to Both']; }, 'Nature', [1],
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
			}, 'dropdown', 'Off', function () { return ['Off', 'Empowerment', 'Transfer', 'Convert to Poison', 'Convert to Ice', 'Convert to Both']; }, 'Nature', [1],
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
			}, 'dropdown', 'Off', function () { return ['Off', 'Empowerment', 'Transfer', 'Convert to Poison', 'Convert to Wind', 'Convert to Both']; }, 'Nature', [1],
			function () { return (autoTrimpSettings.AutoNatureTokens.enabled) });

		//Enlightenments
		createSetting('autoenlight',
			function () { return ('Enlight: Auto') },
			function () {
				var description = "<p>Controls when the script will purchase nature enlightenments.</p>";
				description += "<p>Priority system for the purchases is <b>Poison > Wind > Ice</b>.</p>";
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
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('windEnlight',
			function () { return ('E: F: Wind') },
			function () {
				var description = "<p>Will activate Wind enlightenment when below this token threshold when running fillers (non daily/" + cinf() + " runs).</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('iceEnlight',
			function () { return ('E: F: Ice') },
			function () {
				var description = "<p>Will activate Ice enlightenment when below this token threshold when running fillers (non daily/" + cinf() + " runs).</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('poisonEnlightDaily',
			function () { return ('E: D: Poison') },
			function () {
				var description = "<p>Will activate Poison enlightenment when below this token threshold when running dailies.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('windEnlightDaily',
			function () { return ('E: D: Wind') },
			function () {
				var description = "<p>Will activate Wind enlightenment when below this token threshold when running dailies.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('iceEnlightDaily',
			function () { return ('E: D: Ice') },
			function () {
				var description = "<p>Will activate Ice enlightenment when below this token threshold when running dailies.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('poisonEnlightC2',
			function () { return ('E: C: Poison') },
			function () {
				var description = "<p>Will activate Poison enlightenment when below token threshold when doing " + c2Description() + " runs.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			},
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('windEnlightC2',
			function () { return ('E: C: Wind') },
			function () {
				var description = "<p>Will activate Wind enlightenment when below this token threshold when doing " + c2Description() + " runs.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('iceEnlightC2',
			function () { return ('E: C: Ice') },
			function () {
				var description = "<p>Will activate Ice enlightenment when below this token threshold when doing " + c2Description() + " runs.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Nature
	const displayFluffy = true;
	if (displayFluffy) {
		createSetting('fluffyEvolve',
			function () { return ('Evolve Fluffy') },
			function () {
				var description = "<p>Controls whether or not the script will automatically evolve Fluffy if you are at level 10.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Fluffy', [1]);

		createSetting('fluffyMinZone',
			function () { return ('Fluffy: Min Zone') },
			function () {
				var description = "<p>From which zone evolving should be considered.</p>";
				description += "<p>Must be used in conjunction with <b>Fluffy: Max Zone</b>.</p>";
				description += "<p><b>Recommended:</b> 0</p>";
				return description;
			}, 'value', -1, null, 'Fluffy', [1],
			function () { return (getPageSetting('fluffyEvolve', currSettingUniverse)) });

		createSetting('fluffyMaxZone',
			function () { return ('Fluffy: Max Zone') },
			function () {
				var description = "<p>From which zone evolving should stop being considered.</p>";
				description += "<p>Must be used in conjunction with <b>Fluffy: Min Zone</b>.</p>";
				description += "<p><b>Recommended:</b> 999</p>";
				return description;
			}, 'value', -1, null, 'Fluffy', [1],
			function () { return (getPageSetting('fluffyEvolve', currSettingUniverse)) });

		createSetting('fluffyBP',
			function () { return ('Fluffy: Bone Portals') },
			function () {
				var description = "<p>How many Bone Portals to use when the script evolves Fluffy.</p>";
				description += "<p>If set above 0 and you don't have enough bones to afford the necessary bone portals then the script won't evolve until you have enough bones.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', -1, null, 'Fluffy', [1],
			function () { return (getPageSetting('fluffyEvolve', currSettingUniverse)) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Time Warp
	const displayTimewarp = true;
	if (displayTimewarp) {
		createSetting('timeWarpSpeed',
			function () { return ('Time Warp Support') },
			function () {
				var description = "<p>Will allow the script to run more frequently during time warp so instead of running once every 100ms it will run based off of when the game runs its code.</p>";
				description += "<p>When enabled auto maps, auto fight, auto portal, auto stance, and auto equality will be run every time the game runs its code.</p>";
				description += "<p>This will be a significant slow down when running time warp but should allow you to use the script during it.</p>";
				return description;
			}, 'boolean', true, null, 'Time Warp', [0]);

		createSetting('timeWarpFrequency',
			function () { return ('Time Warp Frequency') },
			function () {
				var description = "<p>How often the scripts code will run during time warp.</p>";
				description += "<p>If set to 20 it will run once every 20 times the games code runs.</p>";
				description += "<p>The lower you set this value the longer time warp will take.</p>";
				description += "<p><b>Recommended:</b> 20</p>";
				return description;
			}, 'value', 20, null, 'Time Warp', [0],
			function () { return (autoTrimpSettings.timeWarpSpeed.enabled) });

		createSetting('timeWarpDisplay',
			function () { return ('Time Warp Display') },
			function () {
				var description = "<p>Will display the Trimps user interface during time warp.</p>";
				description += "<p>Updates the display every 600 ingame ticks so every minute of ingame time.</p>";
				description += "<p>If enabled it will cause your time warp to take longer as it has to render additional frames.</p>";
				description += "<p>When first loading Time Warp you will have a tooltip to inform you of your Time Warp duration as you won't be able to see it ingame. Additionally adds your current Time Warp progress percentage to the start of the Auto Maps status at the bottom of the battle container.</p>";
				description += "<p><b>Recommended:</b> Enabled</p>";
				return description;
			}, 'boolean', false, null, 'Time Warp', [0],
			function () { return (autoTrimpSettings.timeWarpSpeed.enabled) });
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Display
	const displayDisplay = true;
	if (displayDisplay) {
		createSetting('displayEnhancedGrid',
			function () { return ('Enhance Grids') },
			function () {
				var description = "<p>Apply slight visual enhancements to world and map grids that highlights with drop shadow all the exotic, powerful, skeletimps and other special imps.</p>";
				return description;
			}, 'boolean', false, null, 'Display', [0]);
		createSetting('displayHeHr',
			function () { return (resourceHour() + '/hr status') },
			function () {
				var description = "<p>Enables the display of your " + resource().toLowerCase() + " per hour.</p>";
				return description;
			}, 'boolean', true, null, 'Display', [0]);

		createSetting('displayAllSettings',
			function () { return ('Display All settings') },
			function () {
				var description = "<p>Will display all of the locked settings that have highest zone or other requirements to be displayed.</p>";
				return description;
			}, 'boolean', false, null, 'Display', [0]);

		createSetting('EnableAFK',
			function () { return ('Go AFK Mode') },
			function () {
				var description = "<p>AFK Mode uses a Black Screen, and suspends ALL the Trimps GUI visual update functions (updateLabels) to improve performance by not doing unnecessary stuff. This feature is primarily just a CPU saving mode.</p>";
				description += "<p>The blue color means this is not a settable setting, just a button.</p>";
				description += "<p>You can also click the Zone # (World Info) area to go AFK now.</p>";
				return description;
			},
			'action', 'MODULES["performance"].EnableAFKMode()', null, 'Display', [1, 2]);

		createSetting('automateSpireAssault',
			function () { return ('Automate Spire Assault') },
			function () { return ('Automates Spire Assault gear swaps from level 92 up to level 128. HIGHLY RECOMMENDED THAT YOU DO NOT USE THIS SETTING.') },
			'boolean', false, null, 'Display', [11]);

		createSetting('sitInMaps',
			function () { return ('Sit In maps') },
			function () {
				var description = "<p>Will force your trimps to go sit in the map chamber when enabled.</p>";
				description += "<p><b>The <b>Sit In Zone</b> setting must be setup for this to work.</b></p>"
				description += "<p><b>Recommended:</b> Disabled</p>";
				return description;
			}, 'boolean', false, null, 'Display', [1, 2]);
		createSetting('sitInMaps_Zone',
			function () { return ('SIM: Zone') },
			function () {
				var description = "<p>The script will go to the map chamber and stop running any maps at this zone.</p>";
				return description;
			}, 'value', -1, null, 'Display', [1, 2],
			function () { return (getPageSetting('sitInMaps', currSettingUniverse)) });
		createSetting('sitInMaps_Cell',
			function () { return ('SIM: Cell') },
			function () {
				var description = "<p>The script will go to the map chamber and stop running any maps after this cell has been reached.</p>";
				return description;
			}, 'value', -1, null, 'Display', [1, 2],
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
			map_Details: true,
			map_Destacking: false,
			map_Skip: false,
			other: false,
			buildings: false,
			jobs: false,
			zone: true,
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
			function () {
				var description = "<p>Import a AutoTrimps settings file.</p>";
				return description;
			}, 'infoclick', 'ImportAutoTrimps', null, 'Import Export', [0]);
		createSetting('ExportAutoTrimps',
			function () { return ('Export AutoTrimps') },
			function () {
				var description = "<p>Export your AutoTrimps Settings as a output string text formatted in JSON.</p>";
				return description;
			}, 'infoclick', 'ExportAutoTrimps', null, 'Import Export', [0]);
		createSetting('DefaultAutoTrimps',
			function () { return ('Reset To Default') },
			function () {
				var description = "<p>Reset everything to the way it was when you first installed the script.</p>";
				return description;
			}, 'infoclick', 'ResetDefaultSettingsProfiles', null, 'Import Export', [0]);
		createSetting('DownloadDebug',
			function () { return ('Download For Debug') },
			function () {
				var description = "<p>Will download both your save and the scripts settings so that they can be debugged easier.</p>";
				return description;
			}, 'action', 'ImportExportTooltip("ExportAutoTrimps","update",true)', null, 'Import Export', [0]);

		createSetting('updateReload',
			function () { return ('Update Reload') },
			function () {
				var description = "<p>Will reload your Trimps window when an AutoTrimps update is available.</p>";
				description += "<p><b>Updates have the potential to have errors that would break the script so be aware this might not be wise to enable.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Import Export', [0]);

		createSetting('autoAllocatePresets',
			function () { return ('Auto Allocate Presets') },
			function () { return ('Click to adjust settings.') },
			'mazDefaultArray', JSON.stringify({
				'': '',
			}), null, 'Import Export', [1, 2]);

		createSetting('autoHeirloomStorage',
			function () { return ('Auto Heirlooms') },
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

	//----------------------------------------------------------------------------------------------------------------------

	//Help Window - For information to help users understand how to use the script!
	const displayHelp = true;
	if (displayHelp) {
		createSetting('helpIntroduction',
			function () { return ('Introduction Message') },
			function () {
				var description = "<p>Will display the introduction message that is shown when you first load the script.</p>";
				return description;
			}, 'action', 'cancelTooltip(); introMessage();', null, 'Help', [0]);
		createSetting('helpStatus',
			function () { return ('Auto Maps Status') },
			function () {
				var description = "<p>Will display the Auto Maps status window.</p>";
				description += "<p>This can also be accessed by mousing over the text that tells you what Auto Maps is currently trying to do just beneath the Auto Maps button.</p>";
				return description;
			}, 'action', 'cancelTooltip(); makeAutomapStatusTooltip(false);', null, 'Help', [0]);
		createSetting('helpResourceHour',
			function () { return (resource() + ' Per Hour') },
			function () {
				var description = "<p>Will display the " + resource() + "/Hr tooltip message.</p>";
				description += "<p>This can also be accessed by mousing over the text beneath the Auto Maps status when the <b>" + resourceHour() + "/hr status</b> setting in the <b>Display</b> tab is enabled.</p>";
				return description;
			}, 'action', 'cancelTooltip(); makeResourceTooltip();', null, 'Help', [0]);
		createSetting('helpAutoPortal',
			function () { return ('Auto Portal Info') },
			function () {
				var description = "<p>Will display a description of what order Auto Portal will try to perform its actions.</p>";
				return description;
			}, 'action', 'cancelTooltip(); makeAutoPortalHelpTooltip(false);', null, 'Help', [0]);
		createSetting('helpAutoPortal',
			function () { return ('Auto Maps Priority') },
			function () {
				var description = "<p>Will display the order that Auto Maps will run each setting in.</p>";
				return description;
			}, 'action', 'cancelTooltip(); makeFarmingDecisionHelpTooltip(false);', null, 'Help', [0]);
		/* createSetting('helpFragments',
			function () { return ('Fragment Decisions') },
			function () {
				var description = "<p>Will display the decision for map creation slider/setting adjustments.</p>";
				return description;
			}, 'action', 'cancelTooltip(); makeFragmentDecisionHelpTooltip(false);', null, 'Help', [0]); */
	}

	//----------------------------------------------------------------------------------------------------------------------

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
			function () { return ('1 Day Of Metal') },
			function () {
				var description = "<p>Will tell you how much metal you'd gain from 1 day of metal farming.</p>";
				description += "<p>If in a map if will use your map level otherwise it'll assume world level maps.</p>";
				description += "<p>Assumes killing at max speed and factors overkill into the calculations.</p>";
				return description;
			}, 'action', 'testMetalIncome();', null, 'Test', [0]);

		createSetting('testTimeWarp',
			function () { return ('Time Warp') },
			function () {
				var description = "<p>Allows you to input how many hours of Time Warp you would like to do.</p>";
				description += "<p>If you input a value higher than 24 it will increase the max time you can time warp for to the value you have input.</p>";
				return description;
			}, 'action', 'ImportExportTooltip("timeWarp");', null, 'Test', [0]);

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
			function () { return ('Max Tenacity Mult') },
			function () {
				var description = "<p>Sets your current cell to the last world cell in maps.</p>";
				description += "<p>Will also set the last enemy cells health to 0.</p>";
				return description;
			}, 'action', 'testMaxTenacity();', null, 'Test', [0]);

		createSetting('testStatMult',
			function () { return ('1e100x Stats') },
			function () {
				var description = "<p>Multiplies soldier health & damage by 1e100.</p>";
				description += "<p>Doesn't have any protecion to ensure you stay below infinity health.</p>";
				return description;
			}, 'action', 'testTrimpStats();', null, 'Test', [0]);
	}

	//----------------------------------------------------------------------------------------------------------------------

	//Beta - Features that are in beta testing and may not work properly!
	const displayBeta = true;
	if (displayBeta) {

		createSetting('testMapScumming',
			function () { return ('Slow Map Scum') },
			function () {
				var description = "<p>Will remake maps until you have 9+ slow enemies on odd cells.</p>";
				description += "<p>Will only work if you\'re in maps and on cell 1.</p>";
				description += "<p><b>Due to the map remaking process your game will hang for roughly 60s while this finds an ideal map.</b></p>";
				return description;
			}, 'action', 'mapScumming(9);', null, 'Beta', [0]);
		createSetting('testMapScummingValue',
			function () { return ('Slow Map Value') },
			function () {
				var description = "<p>Will reroll for slow cells on maps when your <b>Map HD Ratio</b> is at or below this value.</p>";
				description += "<p>If running <b>Desolation</b> will roll for <b>9</b> slow enemies, otherwise will go for <b>10</b>.</p>";
				description += "<p><b>Due to the map remaking process your game will hang for a while till this finds an ideal map.</b></p>";
				return description;
			}, 'value', 1e10, null, 'Beta', [0]);

		createSetting('debugEqualityStats',
			function () { return ('Debug Equality Stats') },
			function () {
				var description = "<p>Will display details of trimp/enemy stats when you gamma burst.</p>";
				description += "<p>Requires your auto equality setting to be set to <b>Auto Equality: Advanced</b></p>";
				return description;
			}, 'boolean', false, null, 'Beta', [2],
			function () { return (false) });
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

//Check if the gameUser setting has been set to a valid user.
function gameUserCheck(skipTest) {
	const user = autoTrimpSettings.gameUser.value;
	if (user === '') return false;
	const allowedUsers = ['sadaugust', 'kyotie', 'charles', 'test'];
	if (skipTest) allowedUsers.pop();
	return allowedUsers.includes(user.toLowerCase());
}

//Will output how many zones you can liquify to.
function checkLiqZoneCount(universe) {
	if (game.options.menu.liquification.enabled === 0) return 0;
	if (universe === 2) {
		if (!u2Mutations.tree.Liq1.purchased) return 0;
		var amt = 0.1;
		if (u2Mutations.tree.Liq2.purchased) amt = 0.2;
		return ((getHighestLevelCleared(false, true) + 1) * amt);
	}
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
	if (document.getElementById('autoJobLabelTW') !== null) {
		document.getElementById('autoJobLabelTW').parentNode.setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + (btnValue === 2 ? 3 : btnValue));
		document.getElementById('autoJobLabelTW').innerHTML = btn.name()[btnValue];
	}

	var id = 'equipOn';
	var btnValue = getPageSetting(id);

	document.getElementById('autoEquipLabel').parentNode.setAttribute('class', 'pointer noselect autoUpgradeBtn settingBtn' + btnValue);
}

MODULES.u1unlocks = {};
MODULES.u2unlocks = {};

initializeAllSettings();
//automationMenuInit();
updateATVersion();

function createSetting(id, name, description, type, defaultValue, list, container, universe, require) {
	var btnParent = document.createElement("DIV");
	btnParent.setAttribute('style', 'display: inline-block; vertical-align: top; margin-left: 0.6vw; margin-bottom: 1vw; width: 13.50vw;');
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
		btn.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1vw; height: auto;");
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
		btn.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1vw; height: auto;");
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
		btn.setAttribute("style", "font-size: 1vw;");
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
		/* if (game.options.menu.darkTheme.enabled === 2)
			btn.setAttribute("style", "color: #C8C8C8; font-size: 0.9vw; min-width: 13.50vw; min-height: 1.7vw; text-align:right;");
		else
			btn.setAttribute("style", "color:black; font-size: 0.9vw; min-width: 13.50vw; min-height: 1.7vw; text-align:right;"); */
		btnParent.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btnParent.setAttribute("onmouseout", 'tooltip("hide")');

		btnParent.setAttribute("onchange", 'settingChanged("' + id + '")');
		var listItems = list();
		for (var item in listItems) {
			var option = document.createElement("option");
			option.value = listItems[item];
			option.text = listItems[item];
			btn.appendChild(option);
		}
		btn.value = autoTrimpSettings[id].selected;
		/* btn.setAttribute("data-prefix", name());
		btnParent.setAttribute("data-prefix", name());
		btnParent.setAttribute('class', 'select-wrapper'); */
		btn.setAttribute("class", "select2");
		btnParent.appendChild(btn);
		if (container) document.getElementById(container).appendChild(btnParent);
		else document.getElementById("autoSettings").appendChild(btnParent);
		return;
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
		btn.setAttribute("style", "color: black; background-color: #6495ed; font-size: 1vw;");
		btn.setAttribute('class', 'noselect settingsBtn settingBtn3');
		btn.setAttribute("onclick", 'ImportExportTooltip(\'' + defaultValue + '\', \'update\')');
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
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
		btn.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1vw; height: auto;");
		btn.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + autoTrimpSettings[id].value);
		btn.setAttribute("onclick", 'settingChanged("' + id + '")');
		btn.setAttribute("onmouseover", 'tooltip(\"' + name().join(' / ') + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
		btn.innerHTML = autoTrimpSettings[id].name()[autoTrimpSettings[id]["value"]];
		btnParent.appendChild(btn);
		if (require) autoTrimpSettings[id].require = require;
		if (id === 'dailyPortal') {
			btnParent.setAttribute('class', 'toggleConfigBtnLocal settingsBtnLocal settingsBtnfalse')
			btnParent.setAttribute('style', 'max-height: 3vh; display: inline-block; vertical-align: top; margin-left: 1vw; margin-bottom: 1vw; width: 13.142vw;border-bottom: 1px solid black !important;')
			btn.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1vw; height: auto;")
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
		btn.setAttribute("style", "color: black; background-color: #6495ed; font-size: 1vw;");
		btn.setAttribute('class', 'noselect settingsBtn settingBtn3');
		btn.setAttribute('onclick', list);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
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
		btn.setAttribute("style", "color: black; background-color: #6495ed; font-size: 1vw;");
		btn.setAttribute('class', 'noselect settingsBtn settingBtn3');
		btn.setAttribute('onclick', defaultValue);
		btn.setAttribute("onmouseover", 'tooltip(\"' + name() + '\", \"customText\", event, \"' + description() + '\")');
		btn.setAttribute("onmouseout", 'tooltip("hide")');
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
	var autoMapsBtn = id === 'autoMapsToggle';
	if (autoMapsBtn) {
		id = 'autoMaps';
		currUniverse = true;
	}

	var btn = autoTrimpSettings[id];
	var radonon = currUniverse ? game.global.universe === 2 : autoTrimpSettings.universeSetting.value === 1;
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
			if (document.getElementById('autoStructureLabelTW') !== null) document.getElementById('autoStructureLabelTW').parentNode.setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + btn[enabled]);
		}
		if (id === "c2disableFinished") modifyParentNodeUniverseSwap();

		if (id === "displayHeHr") {
			document.getElementById('hiderStatus').style.display = btn[enabled] ? 'block' : 'none';
		}
		if (id === "timeWarpDisplay") {
			timeWarpDisplay();
		}
	}

	if (btn.type === 'multitoggle') {
		var value = 'value'
		if (radonon && btn.universe.indexOf(0) === -1) value += 'U2';
		if ((id === 'AutoMagmiteSpender2' && btn[value] === 1) || (game.global.universe === 1 && id === 'presetCombatRespec')) {
			settingChangedTimeout = true;
			setTimeout(function () {
				settingChangedTimeout = false;
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
			if (document.getElementById('autoJobLabelTW') !== null) {
				document.getElementById('autoJobLabelTW').parentNode.setAttribute('class', 'toggleConfigBtn noselect settingsBtn  settingBtn' + (btn[value] === 2 ? 3 : btn[value]));
				document.getElementById('autoJobLabelTW').innerHTML = btn.name()[btn[value]];
			}
		}
		if (id === 'dailyPortal') {
			document.getElementById(btn.id).setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + (btn[value] === 2 ? 3 : btn[value]));
		}
		if (id === 'autoMaps' && btn[value] !== 2) {
			//Use regular class for AutoMaps button UNLESS we are in TW then use special case to make it look prettier!
			document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + btn[value])
			if (document.getElementById('autoMapBtnTW') !== null) document.getElementById('autoMapBtnTW').setAttribute('class', 'btn btn-lg offlineExtraBtn settingsBtn settingBtn' + btn[value]);
		}
	}

	if (btn.type === 'dropdown') {
		var selected = 'selected';
		if (radonon && btn.universe.indexOf(0) === -1) selected += 'U2';
		btn[selected] = document.getElementById(id).value;
	}

	updateCustomButtons(id === 'universeSetting' || id === 'heirloomAutoRareToKeep');
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

	var radonon = getPageSetting('universeSetting') === 1 ? 'show' : 'hide';
	var radonoff = getPageSetting('universeSetting') === 0 ? 'show' : 'hide';
	var heirloom = getPageSetting('heirloomAuto', currSettingUniverse) ? 'show' : 'hide';

	//Core

	modifyParentNode("portalVoidIncrement", 'show');
	modifyParentNode("universeSetting", 'show');

	if (getPageSetting('displayAllSettings') || (getPageSetting('autoPortal', currSettingUniverse).includes('Hour') && (getPageSetting('heliumHourChallenge', currSettingUniverse).includes('Challenge') || holidayObj.holiday === 'Eggy')))
		modifyParentNode("heliumHrDontPortalBefore", 'show');
	else
		modifyParentNode("heliumHrDontPortalBefore", 'hide');

	//Dailies
	modifyParentNode("dscryvoidmaps", radonoff);
	modifyParentNode("dPreSpireNurseries", radonoff);
	modifyParentNode("dWindStackingLiq", 'show');
	modifyParentNode("dailyHeliumHrPortal", 'show');

	//Maps
	modifyParentNode("uniqueMapEnoughHealth", 'show');
	modifyParentNode("scryvoidmaps", 'show');
	modifyParentNode("uniqueMapSettingsArray", 'show');

	//Gear
	modifyParentNode("equipPercent", 'show');
	modifyParentNode("equipNoShields", 'show');
	modifyParentNode("equipShieldBlock", 'show');

	//Spire
	//None!

	//Combat
	modifyParentNode("frenzyCalc", radonoff);
	modifyParentNode("scryerEssenceOnly", radonoff);

	//ATGA
	modifyParentNode("geneAssistTimerSpire", radonoff);
	modifyParentNode("geneAssistTimerAfter", radonoff);
	modifyParentNode("geneAssistTimerSpireDaily", radonoff);

	//C2
	modifyParentNode("c2disableFinished", 'show');
	modifyParentNode("c2Fused", 'show');
	modifyParentNode("c2AutoDStanceSpire", 'show');

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
	modifyParentNode("desolationSettings", radonon);

	//Buildings
	modifyParentNode("autGigaDeltaFactor", radonoff);

	//Challenges
	modifyParentNode("balanceImprobDestack", radonoff);
	modifyParentNode("decayStacksToAbandon", radonoff);
	modifyParentNode("lifeStacks", radonoff);
	modifyParentNode("mapologyPrestige", radonoff);
	//modifyParentNode("toxicitySettings", radonon);
	//modifyParentNode("archaeologyString3", radonon);

	//Magma
	modifyParentNode("AutoGenC2", radonoff);

	//Heirlooms
	modifyParentNode("heirloomCompressedSwap", 'show');
	modifyParentNode("heirloomSpire", 'show');
	modifyParentNode("heirloomSwapHDCompressed", 'show');
	modifyParentNode("heirloomStaffFragment", 'show');
	modifyParentNode("heirloomStaffResource", 'show');

	modifyParentNode("heirloomAutoModTarget", heirloom);
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
	msg += " It has now been added to " + (c2 ? "Challenge " + c2Msg + " Auto Portal setting" : "Auto Portal");
	msg += (setting ? " & there's settings for it in the scripts " + (c2 ? '"C' + c2Msg + '"' : '"Challenges"') + " tab." : '.');
	if (challenge === "Frigid" || challenge === "Experience" || challenge === "Mayhem" || challenge === "Pandemonium" || challenge === "Desolation") msg += "<br><br><b>This is a special challenge and will use " + cinf() + " settings when run.</b>";
	return msg;
}

//autoPortal
function autoPortalChallenges() {
	var hze;
	var challenge = [];
	if (currSettingUniverse === 2) {
		hze = game.stats.highestRadLevel.valueTotal();
		challenge = ["Off", "Radon Per Hour"];
		if (hze >= 40) challenge.push("Bublé");
		if (hze >= 50) challenge.push("Melt");
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
		if (hze >= 15) challenge.push("One Off Challenges");
		if (hze >= 50) challenge.push("Challenge 3");
	}
	else {
		hze = game.stats.highestLevel.valueTotal();
		challenge = ["Off", "Helium Per Hour"];
		if (hze >= 40) challenge.push("Balance");
		if (hze >= 55) challenge.push("Decay");
		if (game.global.prisonClear >= 1) challenge.push("Electricity");
		if (hze >= 110) challenge.push("Life");
		if (hze >= 125) challenge.push("Crushed");
		if (hze >= 145) challenge.push("Nom");
		if (hze >= 165) challenge.push("Toxicity");
		if (hze >= 180) challenge.push("Watch");
		if (hze >= 180) challenge.push("Lead");
		if (hze >= 190) challenge.push("Corrupted");
		if (hze >= 215) challenge.push("Domination");
		if (hze >= 460) challenge.push('Frigid');
		if (hze >= 600) challenge.push("Experience");
		challenge.push("Custom");
		if (getTotalPerkResource(true) >= 30) challenge.push("One Off Challenges");
		if (hze >= 65) challenge.push("Challenge 2");
	}
	return challenge;
}
//heliumHourChallenge && dailyHeliumHourChallenge
function heliumHourChallenges() {
	var hze;
	var challenge = ["None"];
	if (currSettingUniverse === 2) {
		hze = game.stats.highestRadLevel.valueTotal();
		if (hze >= 40) challenge.push("Bublé");
		if (hze >= 50) challenge.push("Melt");
		if (hze >= 70) challenge.push("Quagmire");
		if (hze >= 85) challenge.push("Quest");
		if (hze >= 90) challenge.push("Archaeology");
		if (hze >= 110) challenge.push("Insanity");
		if (hze >= 135) challenge.push("Nurture");
		if (hze >= 155) challenge.push("Alchemy");
		if (hze >= 175) challenge.push("Hypothermia");
		if (hze >= 50) challenge.push("Challenge 3");
	}
	else {
		hze = game.stats.highestLevel.valueTotal();
		if (hze >= 40) challenge.push("Balance");
		if (hze >= 55) challenge.push("Decay");
		if (game.global.prisonClear >= 1) challenge.push("Electricity");
		if (hze >= 110) challenge.push("Life");
		if (hze >= 125) challenge.push("Crushed");
		if (hze >= 145) challenge.push("Nom");
		if (hze >= 165) challenge.push("Toxicity");
		if (hze >= 180) challenge.push("Watch");
		if (hze >= 180) challenge.push("Lead");
		if (hze >= 190) challenge.push("Corrupted");
		if (hze >= 215) challenge.push("Domination");
		if (hze >= 600) challenge.push("Experience");
		if (hze >= 65) challenge.push("Challenge 2");
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
//heliumC2Challenge && dailyC2Challenge
function heliumOneOffChallenges() {
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
		if (hze >= 80) challenge.push("Revenge");
		if (hze >= 100) challenge.push("Mayhem");
		if (hze >= 105) challenge.push("Storm");
		if (hze >= 115) challenge.push("Berserk");
		if (hze >= 120) challenge.push("Exterminate");
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
		if (hze >= 40) challenge.push("Scientist");
		if (hze >= 45) challenge.push("Meditate");
		if (hze >= 60) challenge.push("Trimp");
		if (hze >= 70) challenge.push("Trapper");
		if (hze >= 100) challenge.push("Frugal");
		if (hze >= 115) challenge.push("Mapocalypse");
		if (hze >= 120) challenge.push("Coordinate");
		if (hze >= 130) challenge.push("Slow");
		if (hze >= 150) challenge.push("Mapology");
		if (hze >= 165) challenge.push("Devastation");
		if (hze >= 460) challenge.push('Frigid');
	}
	return challenge;
}

//Checks to see if we should inform the user of any new challenge unlocks.
function challengeUnlockCheck() {
	if (atSettings.initialise.basepath === 'https://localhost:8887/AutoTrimps_Local/') return;
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
	if (hze >= 110) challenge.push("Life");
	if (hze >= 120) challenge.push("Coordinate");
	if (hze >= 125) challenge.push("Crushed");
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
		message = "Upon unlocking Balance the script has a new settings tab available called 'Challenge'. Here you will find a variety of settings that might be beneficial when running this challenge.";
	} else if (hze === 55) {
		message = challengeUnlock('Decay', true, false);
	} else if (hze === 60) {
		message = "Upon unlocking Warpstations's the script has a new settings tab available called 'Buildings'. Here you will find a variety of settings that will help with this new feature.";
	} else if (hze === 65) {
		message = "Due to unlocking Challenge 2's there is now a Challenge 2 option under Auto Portal to be able to auto portal into them. Also you can now access the C2 tab within the the scripts settings.";
	} else if (hze === 70) {
		message = challengeUnlock('Trapper', false, true);
		message += "<br><br>"
		message = "Upon unlocking Geneticist's the script has a new settings tab available called 'Jobs'. Here you will find a variety of settings that will help with this new feature.";
	} else if (game.global.prisonClear >= 1 && !MODULES.u1unlocks.challenge.includes('Electricity')) {
		message = challengeUnlock('Electricity', false, true);
	} else if (hze === 100) {
		message = "You can now access the Daily tab within the the scripts settings. Here you will find a variety of settings that will help optimise your dailies.";
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
		message = "Upon unlocking the Dimensional Generator building the script has a new settings tab available called 'Magma'. Here you will find a variety of settings that will help optimise your generator. Additionally there's a new setting in the 'Buildings' tab called 'Advanced Nurseries' that will potentially be of help with the Nursery destruction mechanic.";
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
		MODULES.popups.challenge = true;
		tooltip('confirm', null, 'update', hzeMessage, ('MODULES.popups.challenge = false, delete hzeMessage'), 'AutoTrimps New Unlock!');
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
	if (hze >= 50) challenges.push("Melt");
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
		message = "You can now access the Daily tab within the the scripts settings. Here you will find a variety of settings that will help optimise your dailies.";
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
		message = "Due to unlocking Challenge 3's there is now a Challenge 3 option under Auto Portal to be able to auto portal into them. Also you can now access the " + cinf() + " tab within the the scripts settings.";
		//Melt
		message += "<br><br>"
		message += challengeUnlock('Melt');
		//Worshippers
		message += "<br><br>"
		message += "You can now use the Worshipper Farm setting. This can be found in the the scripts 'Maps' tab.";
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
		MODULES.popups.challenge = true;
		tooltip('confirm', null, 'update', hzeMessage, ('MODULES.popups.challenge = false, delete hzeMessage'), 'AutoTrimps New Unlock!');
	}
	MODULES.u2unlocks.challenge = challenges;
}

//Remakes challenge/setting popup if the user doesn't click confirm and it's not showing.
function remakeTooltip() {
	if (!MODULES.popups.challenge && !MODULES.popups.respecAtlantrimp && !MODULES.popups.portal) {
		if (!MODULES.popups.challenge) delete hzeMessage
		return;
	}

	if (!game.global.lockTooltip) {
		if (MODULES.popups.respecAtlantrimp) {
			var respecName = !trimpStats.isC3 ? "Radon " : "" + "Combat Respec";
			if (game.global.universe === 1) respecName = 'Spire'
			var description = "<p><b>Respeccing into the " + respecName + " preset.</b></p>";
			tooltip('confirm', null, 'update', description + '<p>Hit <b>Disable Respec</b> to stop this.</p>', 'MODULES.popups.respecAtlantrimp = false', '<b>NOTICE: Auto-Respeccing in ' + MODULES.popups.remainingTime + ' seconds....</b>', 'Disable Respec');
		}
		else if (MODULES.popups.challenge) {
			tooltip('confirm', null, 'update', hzeMessage, ('MODULES.popups.challenge = false, delete hzeMessage'), 'AutoTrimps New Unlock!');
		}
		else {
			tooltip('confirm', null, 'update', '<b>Auto Portaling NOW!</b><p>Hit Delay Portal to WAIT 1 more zone.', 'MODULES.portal.zonePostpone+=1; MODULES.popups.portal = false', '<b>NOTICE: Auto-Portaling in ' + MODULES.popups.remainingTime + ' seconds....</b>', 'Delay Portal');
		}
	}
	else if (MODULES.popups.respecAtlantrimp) {
		document.getElementById('tipTitle').innerHTML = "<b>NOTICE: Auto-Respeccing in " + (MODULES.popups.remainingTime / 1000).toFixed(1) + " seconds....</b>"
	}
	else if (MODULES.popups.portal) {
		document.getElementById('tipTitle').innerHTML = "<b>NOTICE: Auto-Portaling in " + (MODULES.popups.remainingTime / 1000).toFixed(1) + " seconds....</b>"
	}
}

//It sets the options for the heirloom auto selecter based on the highest zone ever reached, and the current universe.
function autoHeirloomOptions(heirloomType) {
	if (!atSettings.initialise.loaded) return;
	var heirloomRarity = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
	var raretokeep = heirloomRarity.indexOf(getPageSetting('heirloomAutoRareToKeep' + heirloomType.slice(0, 1).toUpperCase() + heirloomType.slice(1, heirloomType.length), currSettingUniverse));
	var heirloomModsArray = [];

	heirloomModsArray = ["Any"];
	const heirloomData = heirloomInfo(heirloomType);
	for (var item in game.heirlooms[heirloomType]) {
		var heirloom = game.heirlooms[heirloomType][item];
		if (item === "empty") continue;
		if (typeof heirloom.filter !== 'undefined' && !heirloom.filter()) continue;
		if (heirloom.steps && heirloom.steps[raretokeep] === -1) continue;
		heirloomModsArray.push(heirloomData[item].name);
	}

	return heirloomModsArray;
}

function autoSetValueToolTip(id, text, multi, negative) {
	ranstring = text;
	var value = 'value'
	if (autoTrimpSettings.universeSetting.value === 1 && autoTrimpSettings[id].universe.indexOf(0) === -1) value += 'U2';
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
	if (autoTrimpSettings.universeSetting.value === 1 && autoTrimpSettings[id].universe.indexOf(0) === -1) value += 'U2';
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
	var value = 'value';
	if (autoTrimpSettings.universeSetting.value === 1 && autoTrimpSettings[id].universe.indexOf(0) === -1) value += 'U2';
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
	if (id === 'presetCombatRespecCell') MODULES.portal.disableAutoRespec = 0;
	if (num > game.global.world && (id === 'dailyDontPortalBefore' || id === 'heliumHrDontPortalBefore')) {
		MODULES.mapFunctions.afterVoids = false;
		mapSettings.portalAfterVoids = false;
	}
}

function autoSetText(id, multiValue) {
	var textVal = 'empty';
	var value = 'value'
	if (autoTrimpSettings.universeSetting.value === 1 && autoTrimpSettings[id].universe.indexOf(0) === -1) value += 'U2';
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

	//Changing where buttons are placed depending on TW status.
	if (usingRealTimeOffline && !getPageSetting('timeWarpDisplay')) {
		if (document.getElementById("autoTrimpsTabBarMenu").parentNode.id === 'settingsRow') {
			document.getElementById("settingsRowTW").appendChild(document.getElementById("autoTrimpsTabBarMenu"));
			document.getElementById("settingsRowTW").appendChild(document.getElementById("autoSettings"));

			document.getElementById('autoTrimpsTabBarMenu').style.display = 'none';
			document.getElementById('autoSettings').style.display = 'none';
		}
	}
	else {
		if (document.getElementById("autoTrimpsTabBarMenu").parentNode.id === 'settingsRowTW') {
			document.getElementById("settingsRow").appendChild(document.getElementById("autoTrimpsTabBarMenu"));
			document.getElementById("settingsRow").appendChild(document.getElementById("autoSettings"));

			document.getElementById('autoTrimpsTabBarMenu').style.display = 'none';
			document.getElementById('autoSettings').style.display = 'none';
		}
	}

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
		if ($item !== null) {
			if ($item.style.display === 'block')
				$item.style.display = 'none';
		}
		var $item = document.getElementById('autoTrimpsTabBarMenu');
		if ($item !== null) {
			if ($item.style.display === 'block')
				$item.style.display = 'none';
			else
				$item.style.display = 'block';
		}
		var $item = document.getElementById('autoSettings');
		if ($item !== null) {
			if ($item.style.display === 'block')
				$item.style.display = 'none';
			else {
				$item.style.display = 'block';
				updateCustomButtons(true);
			}
		}
	}
	updateCustomButtons();
}

function autoPlusSettingsMenu() {
	var $item = document.getElementById('autoSettings');
	if ($item !== null && $item.style.display === 'block')
		$item.style.display = 'none';
	$item = document.getElementById('graphParent');
	if ($item !== null && $item.style.display === 'block')
		$item.style.display = 'none';
	$item = document.getElementById('autoTrimpsTabBarMenu');
	if ($item !== null && $item.style.display === 'block')
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

	if (settingToCheck !== undefined && settingToCheck.type === 'dropdown') {
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
	var radonon = autoTrimpSettings.universeSetting.value === 1;
	currSettingUniverse = autoTrimpSettings.universeSetting.value + 1;

	//Loops through all the AT settings so we can properly setup the UI.
	for (var setting in autoTrimpSettings) {
		if (setting === 'ATversion' || setting === 'ATversionChangelog') continue;
		var item = autoTrimpSettings[setting];
		//Looks for the settings that don't exist anymore and deletes them.
		if (item === null || typeof item.id === 'undefined') {
			//Skip ATversion. Deletes old settings.
			if (atSettings.initialise.loaded) delete autoTrimpSettings[setting];
			continue;
		}
		var settingUniverse = item.universe;
		//Looping the deletion process again for old settings that got loaded but don't have the universe property.
		if (!Array.isArray(settingUniverse)) {
			if (atSettings.initialise.loaded) delete autoTrimpSettings[setting];
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
		//Only happens when initialLoad is called which should only happen the 1st time AT loads or universeSetting is toggled.
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
				elem.value = itemSelected;
				/* elem.parentNode.setAttribute("data-prefix", item.name()); */
				elem = elem.parentNode;
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
	//Only happens when initialLoad is called which should only happen the 1st time AT loads or universeSetting is toggled.
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
		if (document.getElementById("tabFluffy") !== null) {
			document.getElementById("tabFluffy").style.display = radonon || (!displayAllSettings && game.global.spiresCompleted < 2) ? "none" : "";
		}
		if (document.getElementById("tabChallenges") !== null) {
			document.getElementById("tabChallenges").style.display = !displayAllSettings && ((radonon && highestRadonZone < 70) || (!radonon && hze < 40)) ? "none" : "";
		}
		if (document.getElementById("tabTest") !== null) {
			document.getElementById("tabTest").style.display = !gameUserCheck() ? "none" : "";
		}
		if (document.getElementById("tabBeta") !== null) {
			document.getElementById("tabBeta").style.display = !gameUserCheck() ? "none" : "";
		}

		updateDropdownLabels();
	}
	modifyParentNodeUniverseSwap();
}

function updateDropdownLabels() {
	//Reload script every 10 milliseconds until the utils module has been loaded.
	if (typeof jQuery.fn.select2 !== 'function') {
		setTimeout(updateDropdownLabels, 10);

		var script = document.createElement("script");
		script.src = 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js';
		script.type = 'text/javascript';
		// Append the script to the document
		document.head.appendChild(script);
		return;
	}
	if (!atSettings.initialise.loaded) {
		setTimeout(updateDropdownLabels, 10);
		return;
	}

	$(document).ready(function () {
		$('.select2').select2({
			templateSelection: formatDropdownPrefix,
			escapeMarkup: function (m) {
				return m;
			},
		});
	});
}

function formatDropdownPrefix(dropdownSetting) {
	var prefix = dropdownSetting._resultId.split('-');
	var prefixName;
	var text = dropdownSetting.text;

	if (prefix)
		prefixName = autoTrimpSettings[prefix[1]].name() + ': ';
	else
		prefixName = '';
	return "<font color='#00A7E1'>" + prefixName + "</font> <float='right'>" + text + "</float>";
}

function settingUniverse(setting) {
	if (setting === 'buyBuildings') {
		return getPageSetting('buildingsType', portalUniverse);
	}
	if (setting === 'equipOn') {
		return getPageSetting('equipOn', portalUniverse);
	}
	if (setting === 'autoJobs') {
		return getPageSetting('jobType', portalUniverse);
	}
	if (setting === 'autoMaps') {
		return getPageSetting('autoMaps', portalUniverse);
	}
}

//Setting up the Auto Maps status inside of Time Warp.
function autoMapsStatusTW() {

	if (typeof updateAutoMapsStatus !== 'function' || typeof isDoingSpire !== 'function') {
		setTimeout(autoMapsStatusTW, 100);
		console.log("Retrying to setup AutoMaps status in Time Warp.")
		return;
	};

	//The position of the status textbox is based on if we're mapping or not mapping as each one has a different CSS position.
	var whereToPlace = ["offlineZoneBtns", "offlineMapBtns"];
	var id = ["autoMapStatusMapsTW", "autoMapStatusTW"];
	var autoMapsStatusSection;

	//Status textbox
	var autoMapsStatusContainer;

	for (var item in whereToPlace) {
		if (document.getElementById(id[item]) !== null) continue;
		autoMapsStatusContainer = document.createElement("DIV");
		autoMapsStatusContainer.id = id[item];
		autoMapsStatusContainer.setAttribute("class", "noselect");
		autoMapsStatusContainer.setAttribute("style", "display: block; font-size: 1.25vw; text-align: center; background-color: rgba(0,0,0,0.3); position: absolute; bottom: 1vw; left: 10%; right: 10%");
		autoMapsStatusContainer.setAttribute("onmouseout", 'tooltip("hide")');
		//Place it at the bottom of the appropriate (left hand side )
		document.getElementById(whereToPlace[item]).children[1].insertAdjacentHTML('afterend', '<br>');
		autoMapsStatusSection = document.getElementById(whereToPlace[item]);
		autoMapsStatusSection.replaceChild(autoMapsStatusContainer, document.getElementById(whereToPlace[item]).children[2]);
	}

	updateAutoMapsStatus(false);
}

//Add the Time Warp settings to the right hand side section.
function setupTimeWarpAT() {
	autoMapsStatusTW();

	//Remove the automaps button if it already exists.
	if (document.getElementById('autoMapBtnTW') !== null) {
		document.getElementById('autoMapBtnTW').parentNode.removeChild(document.getElementById('autoMapBtnTW'));
	}

	//Add the AutoMaps button to the right hand side section.
	if (document.getElementById('autoMapBtnTW') === null) {
		document.getElementById('offlineExtraBtnsContainer').children[2].insertAdjacentHTML('afterend', '<br>');
		var offlineExtraBtnsContainer = document.getElementById("offlineFightBtn").parentNode;
		offlineExtraBtnsContainer.replaceChild(autoMapsButton(true), document.getElementById("offlineFightBtn").parentNode.children[3]);
	}

	//Integrate the 3 AT TimeWarp related settings beneath the main UI.
	//AT Settings, AT Auto Jobs, AT AutoStructure
	if (document.getElementById('offlineInnerWrapper').children[4] === undefined) {
		//Creating the row for the AT buttons that will be shown.
		var settingsRow = document.createElement("DIV");
		settingsRow.setAttribute("class", "row");
		settingsRow.setAttribute("id", "settingBtnTW");
		settingsRow.setAttribute("style", "display: block");

		document.getElementById('offlineInnerWrapper').children[3].insertAdjacentHTML('afterend', '<br>');
		var offlineProgressParent = document.getElementById("offlineProgressWrapper").parentNode;
		offlineProgressParent.replaceChild(settingsRow, document.getElementById("offlineProgressWrapper").parentNode.children[4]);

		//AutoJobs button.
		var autoJobs = true;
		if (autoJobs) {
			//Creating parent button
			var jobSetting = getPageSetting('jobType')
			var atJobInitial = document.createElement("DIV");
			atJobInitial.setAttribute('style', 'display: inline-block; vertical-align: top; margin-left: 0.5vw; margin-top: 0.25vw; margin-bottom: 1vw; width: 16.382vw; border-color: #5D5D5D;');
			atJobInitial.setAttribute("id", "autoJobTWParent");
			//Setting up mouseover & class, style
			var atJobContainer = document.createElement("DIV");
			atJobContainer.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1.1vw; height: auto; border-color: #5D5D5D;");
			atJobContainer.setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + (jobSetting === 2 ? 3 : jobSetting));
			atJobContainer.setAttribute("onmouseover", 'tooltip(\"Toggle AutoJobs\", \"customText\", event, autoTrimpSettings.jobType.description())');
			atJobContainer.setAttribute("onmouseout", 'tooltip("hide")');
			//Text
			var atJobText = document.createElement("DIV");
			atJobText.innerHTML = autoTrimpSettings.jobType.name()[jobSetting];
			atJobText.setAttribute("id", "autoJobLabelTW");
			atJobText.setAttribute("onClick", "settingChanged('jobType', true)");
			//Creating cogwheel & linking onclick
			var atJobSettings = document.createElement("DIV");
			atJobSettings.setAttribute('onclick', 'MAZLookalike("Configure AT AutoJobs", "a", "AutoJobs")');
			var atJobSettingsButton = document.createElement("SPAN");
			atJobSettingsButton.setAttribute('class', 'glyphicon glyphicon-cog');
			//Linking all the elements together and attaching them to the settings TW row.
			atJobContainer.appendChild(atJobText);
			atJobContainer.appendChild(atJobSettings);
			atJobSettings.appendChild(atJobSettingsButton);
			atJobInitial.appendChild(atJobContainer);
			$('#settingBtnTW').append(atJobInitial);
		}

		//AutoTrimp Settings button.
		var autoTrimpsSettings = true;
		if (autoTrimpsSettings) {

			//Creating parent button
			var atSettingsInitial = document.createElement("DIV");
			atSettingsInitial.setAttribute('style', 'display: inline-block; vertical-align: top; margin-left: 0.5vw; margin-top: 0.25vw; margin-bottom: 1vw; width: 16.382vw; border-color: #5D5D5D;');
			atSettingsInitial.setAttribute("id", "atSettingsTW");

			//Setting up mouseover & class, style
			var atSettingsContainer = document.createElement("DIV");
			atSettingsContainer.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1.1vw; height: auto; border-color: #5D5D5D;");
			atSettingsContainer.setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn4');
			atSettingsContainer.innerHTML = 'AutoTrimp Settings';
			atSettingsContainer.setAttribute("onClick", "autoToggle();");
			atSettingsContainer.setAttribute("onmouseover", 'tooltip(\"AutoTrimp Settings\", \"customText\", event, \"Click to open the AutoTrimps Settings menu.\")');
			atSettingsContainer.setAttribute("onmouseout", 'tooltip("hide")');

			//Linking all the elements together and attaching them to the settings TW row.
			atSettingsInitial.appendChild(atSettingsContainer);
			$('#settingBtnTW').append(atSettingsInitial);
		}

		//AutoStructure Button.
		var autoStructure = true;
		if (autoStructure) {

			//Creating parent button
			var autoStructureBtnParent = document.createElement("DIV");
			autoStructureBtnParent.setAttribute('style', 'display: inline-block; vertical-align: top; margin-left: 0.5vw; margin-top: 0.25vw; margin-bottom: 1vw; width: 16.382vw; border-color: #5D5D5D;');
			autoStructureBtnParent.setAttribute("id", "autoStructureLabelTWParent");

			//Setting up mouseover & class, style
			var atStructureContainer = document.createElement("DIV");
			atStructureContainer.setAttribute("style", "position: relative; min-height: 1px; padding-left: 5px; font-size: 1.1vw; height: auto; border-color: #5D5D5D;");
			atStructureContainer.setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + settingUniverse('buyBuildings'));
			atStructureContainer.setAttribute("onmouseover", 'tooltip(\"Toggle AutoStructure\", \"customText\", event, autoTrimpSettings.buildingsType.description())');
			atStructureContainer.setAttribute("onmouseout", 'tooltip("hide")');

			//Text
			var atStructureText = document.createElement("DIV");
			atStructureText.innerHTML = 'AT AutoStructure';
			atStructureText.setAttribute("id", "autoStructureLabelTW");
			atStructureText.setAttribute("onClick", "settingChanged('buildingsType', true)");

			//Creating cogwheel & linking onclick
			var atStructureSettings = document.createElement("DIV");
			atStructureSettings.setAttribute('onclick', 'MAZLookalike("Configure AT AutoStructure", "a", "AutoStructure")');
			var atStructureSettingsButton = document.createElement("SPAN");
			atStructureSettingsButton.setAttribute('class', 'glyphicon glyphicon-cog');

			//Linking all the elements together and attaching them to the settings TW row.
			atStructureContainer.appendChild(atStructureText);
			atStructureContainer.appendChild(atStructureSettings);
			atStructureSettings.appendChild(atStructureSettingsButton);
			autoStructureBtnParent.appendChild(atStructureContainer);
			$('#settingBtnTW').append(autoStructureBtnParent);
		}
	}

	timeWarpDisplay();
}

//Display TW UI or regular UI depending on timeWarpDisplay setting.
function timeWarpDisplay() {
	if (!usingRealTimeOffline) return;

	document.getElementById('offlineWrapper').style.display = getPageSetting('timeWarpDisplay') ? 'none' : 'block';
	document.getElementById('innerWrapper').style.display = getPageSetting('timeWarpDisplay') ? 'block' : 'none';
}

function autoMapsButton() {
	//Auto Maps button
	var autoMapsContainer = document.createElement("DIV");
	autoMapsContainer.setAttribute("id", "autoMapBtnTW");
	autoMapsContainer.setAttribute("class", "btn btn-lg offlineExtraBtn settingsBtn settingBtn" + settingUniverse('autoMaps'));
	autoMapsContainer.setAttribute("onClick", "settingChanged('autoMapsToggle', true);");
	autoMapsContainer.setAttribute("onmouseover", 'tooltip(\"Toggle Auto Maps\", \"customText\", event, autoTrimpSettings.autoMaps.description(true))');
	autoMapsContainer.setAttribute("onmouseout", 'tooltip("hide")');
	autoMapsContainer.innerHTML = 'Auto Maps';

	return autoMapsContainer;
}

//Attach AT related buttons to the main TW UI.
//Will attach AutoMaps, AutoMaps Status, AutoTrimps Settings, AutoJobs, AutoStructure
offlineProgress.originalStart = offlineProgress.start;
offlineProgress.start = function () {
	offlineProgress.originalStart(...arguments)
	try {
		setupTimeWarpAT();
	}
	catch (e) { console.log("Loading Time Warp failed " + e, "other") }
}

//Try to restart TW once it finishes to ensure we don't miss out on time spent running TW.
offlineProgress.originalFinish = offlineProgress.finish;
offlineProgress.finish = function () {
	//Time we have run TW in seconds
	var timeRun = Math.floor((new Date().getTime() - offlineProgress.startTime) / 1000);
	if (game.options.menu.autoSave.enabled !== atSettings.autoSave) toggleSetting('autoSave');
	offlineProgress.originalFinish(...arguments)
	try {
		//Rerun TW if it took over 30 seconds to complete
		if (timeRun > 30) {
			debug(`Running Time Warp again for ${timeRun} seconds to catchup on the time we missed whilst running it.`);
			//Convert time to milliseconds and subtract it from the variables that TW uses to calculate offline progress so we don't have tons of time related issues.
			timeRun *= 1000;
			game.global.lastOnline -= timeRun;
			game.global.portalTime -= timeRun;
			game.global.zoneStarted -= timeRun;
			game.global.lastSoldierSentAt -= timeRun;
			game.global.lastSkeletimp -= timeRun;
			game.permaBoneBonuses.boosts.lastChargeAt -= timeRun;
			offlineProgress.start();
		}
	}
	catch (e) { console.log("Failed to restart Time Warp to finish it off. " + e, "other") }
}

//Make AT button visible on timewarp screen if already in TW when loading AT
if (usingRealTimeOffline) {
	setupTimeWarpAT();
}

//Sets up the various AT buttons that sit outside of the AutoTrimps setting menu.
function setupATButtons() {
	//Setup AutoTrimps settings button
	var settingBtnSrch = document.getElementsByClassName("btn btn-default");
	for (var i = 0; i < settingBtnSrch.length; i++) {
		if (settingBtnSrch[i].getAttribute("onclick") === "toggleSettingsMenu()")
			settingBtnSrch[i].setAttribute("onclick", "autoPlusSettingsMenu()");
	}

	//AutoTrimps Changelog button
	var newItem = document.createElement("TD");
	var newChanges = autoTrimpSettings.ATversionChangelog !== atSettings.initialise.version;
	newItem.appendChild(document.createTextNode("AT " + atSettings.initialise.version.split('SadAugust ')[1] + (newChanges ? " | What's New" : "")));
	newItem.setAttribute("id", "atChangelog");
	newItem.setAttribute("class", "btn" + (newChanges ? " btn-changelogNew" : " btn-primary"));
	newItem.setAttribute("onclick", "window.open(basepath + 'updates.html', '_blank'); updateChangelogButton();");
	var settingbarRow = document.getElementById("settingsTable").firstElementChild.firstElementChild;
	settingbarRow.insertBefore(newItem, settingbarRow.childNodes[settingbarRow.childNodes.length - 4]);

	//AutoTrimps setting button
	var newItem = document.createElement("TD");
	newItem.appendChild(document.createTextNode("AutoTrimps"));
	newItem.setAttribute("id", "atSettingsBtn");
	newItem.setAttribute("class", "btn btn-default");
	newItem.setAttribute("onclick", "autoToggle();");
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
	resourcePerHourContainer.setAttribute("onmouseout", 'tooltip("hide")');
	resourcePerHourContainer.id = 'hiderStatus';
	fightButtonCol.appendChild(resourcePerHourContainer);

	//Additional AT Info textbox
	var voidMapContainer = document.createElement("DIV");
	voidMapContainer.setAttribute("style", "display: block; font-size: 0.9vw; text-align: centre; background-color: rgba(0, 0, 0, 0.3);");
	var voidMapText = document.createElement("SPAN");
	voidMapContainer.setAttribute("onmouseover", 'tooltip(\"Additional AT Info\", \"customText\", event, \"<b>Void</b>: The progress you have towards a free void map from the \'Void Maps\' permanent bone upgrade.<br>\
	<b>Auto Level</b>: The level that the script recommends using whilst farming.<br>\
	<b>B</b>: The amount of time your trimps have been breeding.<br>\
	<b>T</b>: Your current tenacity time.\")');
	voidMapContainer.setAttribute("onmouseout", 'tooltip("hide")');
	voidMapText.id = 'additionalInfo';
	voidMapContainer.appendChild(voidMapText);
	var trimpsButtonCol = document.getElementById("trimps");
	trimpsButtonCol.appendChild(voidMapContainer);

	//Portal Timer
	var $portalTimer = document.getElementById('portalTimer');
	$portalTimer.setAttribute('onclick', 'toggleSetting(\'pauseGame\')');
	$portalTimer.setAttribute('style', 'cursor: default; min-width: 8.5vw');
	$portalTimer.classList.add("btn");

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
	atEquipText.innerHTML = 'AT Auto Equip';
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

	debug("Finished loading buttons.");
}

function introMessage() {
	var description = "<p>Welcome to the SadAugust fork of AutoTrimps!</p>";

	description += "<p><b>For those who are new to this fork here's some useful information on how to set it up.</b></p><br>";

	description += "<p>One of the most important things is where the settings are stored. The vast majority of settings can be accessed by pressing the <b>AutoTrimps</b> button at the bottom of your Trimps window.</p><br>";
	description += "<p>There are some setting that aren't located in the <b>AutoTrimps settings menu</b>, 2 of which are in the Trimps buy container (<b>AT AutoStructure & AutoJobs</b>), I recommend mousing over their tooltips and looking at what they do.</p>";
	description += "<p>The last one placed elsewhere is the <b>AT Messages</b> button at the top right of your Trimps window. This will enabling this will allow the script to output messages into the message log window. You can control what gets printed to it by pressing the cogwheel to the right of it.</p>";

	description += "<br><p>By default everything should be disabled but every setting has a detailed description and recommendation of how it should be setup. To start with I'd highly recommend looking through the settings in the <b>Core</b>, <b>Maps</b> and <b>Combat</b> tabs to identify which parts of the script you would like to use and go through the other tabs afterwards.</p>";

	description += "<br><p>If you've previously used somebody elses AutoTrimps version you'll need to set everything up again as this isn't compatible with other forks. The settings are stored differently so you can easily go back and forth between other forks.</p>";

	tooltip('Introduction Message', 'customText', 'lock', description, false, 'center');
	verticalCenterTooltip(true);
}

//When clicking changelog button set new attribute, text & update Changelog AT Setting to proper value if not already correct.
function updateChangelogButton() {
	if (autoTrimpSettings.ATversionChangelog === atSettings.initialise.version) return;
	var changeLogBtn = document.getElementById("atChangelog");
	if (changeLogBtn !== null) {
		//Swap the button class remove colour of new changelog.
		var classSwap = changeLogBtn.classList.contains('btn-changelogNew') ? 'btn-primary' : 'btn-changelogNew';
		swapClass(changeLogBtn.classList[1], classSwap, changeLogBtn);
		//Remove the new changelog text if it exists.
		changeLogBtn.innerHTML = changeLogBtn.innerHTML.replace(" | What's New", "");
		autoTrimpSettings.ATversionChangelog = atSettings.initialise.version;
		saveSettings();
	}
}

function setupAddonUser(force) {
	//Setting up addon user settings.

	if (typeof game.global.addonUser !== 'object' || force) {


		game.global.addonUser = {};

		const u1Settings = ['hdFarm', 'voidMap', 'boneShrine', 'mapBonus', 'mapFarm', 'raiding', 'bionicRaiding', 'toxicity'];
		const u2Settings = ['hdFarm', 'voidMap', 'boneShrine', 'mapBonus', 'mapFarm', 'raiding', 'worshipperFarm', 'tributeFarm', 'smithyFarm', 'quagmire', 'insanity', 'alchemy', 'hypothermia', 'desolation'];

		for (var item in u1Settings) {
			if (typeof game.global.addonUser[u1Settings[item] + 'Settings'] === 'undefined')
				game.global.addonUser[u1Settings[item] + 'Settings'] = {};
			if (typeof game.global.addonUser[u1Settings[item] + 'Settings']['value'] === 'undefined') {
				var obj = [];
				for (var x = 0; x < 30; x++) {
					obj[x] = {};
					obj[x].done = '';
				}
				game.global.addonUser[u1Settings[item] + 'Settings'].value = obj;
			}
		}

		for (var item in u2Settings) {
			if (typeof game.global.addonUser[u2Settings[item] + 'Settings'] === 'undefined')
				game.global.addonUser[u2Settings[item] + 'Settings'] = {};
			if (typeof game.global.addonUser[u2Settings[item] + 'Settings']['valueU2'] === 'undefined') {
				var obj = [];
				for (var x = 0; x < 30; x++) {
					obj[x] = {};
					obj[x].done = '';
				}
				game.global.addonUser[u2Settings[item] + 'Settings'].valueU2 = obj;
			}
		}
	}
}

function updateATVersion() {
	//Setting Conversion!
	if (autoTrimpSettings["ATversion"] !== undefined && autoTrimpSettings["ATversion"].includes('SadAugust') && autoTrimpSettings["ATversion"] === atSettings.initialise.version) return;
	if (typeof (autoTrimpSettings) === 'undefined') return;
	var changelog = [];

	//Prints the new user message if it's the first time loading the script.
	if (autoTrimpSettings["ATversion"] === undefined || !autoTrimpSettings["ATversion"].includes('SadAugust')) {
		autoTrimpSettings["ATversion"] = atSettings.initialise.version;
		saveSettings();

		//Setting up addon user settings.
		setupAddonUser();

		if (atSettings.initialise.basepath === 'https://localhost:8887/AutoTrimps_Local/') return;

		introMessage();
		return;
	}

	if (autoTrimpSettings["ATversion"] !== undefined && autoTrimpSettings["ATversion"].includes('SadAugust')
		&& autoTrimpSettings["ATversion"] !== atSettings.initialise.version
	) {
		//On the offchance anybody is using a super old version of AT then they need their localStorage setting converted
		if (JSON.parse(localStorage.getItem('atSettings')) === null)
			saveSettings();
		const tempSettings = JSON.parse(localStorage.getItem('atSettings'));

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

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.17') {

			if (typeof (tempSettings["presetSwap"]) !== 'undefined') {
				autoTrimpSettings.presetSwap.enabled = false;
			}
			if (typeof (tempSettings["autoCombatRespec"]) !== 'undefined') {
				autoTrimpSettings.presetCombatRespec.value = 0;
				autoTrimpSettings.presetCombatRespec.valueU2 = autoTrimpSettings['autoCombatRespec'].valueU2;
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.18') {

			if (typeof (tempSettings["bloodthirstDestack"]) !== 'undefined') {
				autoTrimpSettings.bloodthirstDestack.enabled = false;
			}
			if (typeof (tempSettings["bloodthirstVoidMax"]) !== 'undefined') {
				autoTrimpSettings.bloodthirstVoidMax.enabled = false;
			}
			changelog.push("AutoTrimps now has an actual changelog! You can find it right next to the AutoTrimps button.<br>\
			You will now only be shown this popup if there's an update and you're in Time Warp as you would be unable to see the changelog otherwise.");
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.21') {
			if (typeof (tempSettings["IgnoreCrits"]) !== 'undefined') {
				autoTrimpSettings.IgnoreCrits.valueU2 = 0;
			}
		}

		//Scryer stance changes
		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.24') {

			if (typeof (tempSettings["UseScryerStance"]) !== 'undefined') {
				autoTrimpSettings.AutoStanceScryer.enabled = tempSettings.UseScryerStance.enabled;
			}
			if (typeof (tempSettings["screwessence"]) !== 'undefined') {
				autoTrimpSettings.scryerEssenceOnly.enabled = tempSettings.screwessence.enabled;
			}
			if (typeof (tempSettings["ScryerUseWhenOverkill"]) !== 'undefined') {
				autoTrimpSettings.scryerOverkill.enabled = tempSettings.ScryerUseWhenOverkill.enabled;
			}
			if (typeof (tempSettings["use3daily"]) !== 'undefined') {
				autoTrimpSettings.dAutoStanceWind.enabled = tempSettings.use3daily.enabled;
			}
			if (typeof (tempSettings["liqstack"]) !== 'undefined') {
				autoTrimpSettings.dWindStackingLiq.enabled = tempSettings.liqstack.enabled;
			}
			if (typeof (tempSettings["AutoStance"]) !== 'undefined') {
				if (tempSettings.AutoStance.value > 2) {
					autoTrimpSettings.AutoStance.value = 2;
					autoTrimpSettings.AutoStanceWind.enabled = true;
				}
			}

			const originalSettings = ["ScryerUseinMaps2", "ScryerUseinVoidMaps2", "ScryerUseinPMaps", "ScryerUseinBW", "ScryerUseinSpire2", "ScryerSkipBoss2", "ScryUseinPoison", "ScryUseinWind", "ScryUseinIce", "ScryerSkipCorrupteds2", "ScryerSkipHealthy", "ScryerDieZ", "ScryerMaxZone", "ScryerMinZone", "onlyminmaxworld", "dWindStackingMinHD", "WindStackingMinHD", "WindStackingMin", "dWindStackingMin"];
			const newSettings = ["scryerMaps", "scryerVoidMaps", "scryerPlusMaps", "scryerBW", "scryerSpire", "scryerSkipBoss", "scryerPoison", "scryerWind", "scryerIce", "scryerCorrupted", "scryerHealthy", "scryerDieZone", "scryerMaxZone", "scryerMinZone", "scryerMinMaxWorld", "dWindStackingRatio", "WindStackingRatio", "WindStackingZone", "dWindStackingZone"];
			for (var item in originalSettings) {
				if (typeof (tempSettings[originalSettings[item]]) !== 'undefined') {
					autoTrimpSettings[newSettings[item]].value = tempSettings[originalSettings[item]].value;
				}
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.25') {
			if (typeof (tempSettings["radonsettings"]) !== 'undefined') {
				autoTrimpSettings.universeSetting.value = tempSettings.radonsettings.value;
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.26') {
			if (typeof (tempSettings["PrestigeSkip1_2"]) !== 'undefined') {
				autoTrimpSettings.PrestigeSkip.enabled = tempSettings.PrestigeSkip1_2.value > 0;
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.29') {
			const u1Settings = ['hdFarm', 'voidMap', 'boneShrine', 'mapBonus', 'mapFarm', 'raiding', 'bionicRaiding', 'toxicity'];

			const u2Settings = ['hdFarm', 'voidMap', 'boneShrine', 'mapBonus', 'mapFarm', 'raiding', 'worshipperFarm', 'tributeFarm', 'smithyFarm', 'quagmire', 'insanity', 'alchemy', 'hypothermia', 'desolation'];

			for (var item in u1Settings) {
				if (typeof (tempSettings[u1Settings[item] + "DefaultSettings"]) !== 'undefined') {
					autoTrimpSettings[u1Settings[item] + "Settings"].value.unshift(tempSettings[u1Settings[item] + "DefaultSettings"].value);
				}
			}

			for (var item in u2Settings) {
				if (typeof (tempSettings[u2Settings[item] + "DefaultSettings"]) !== 'undefined') {
					autoTrimpSettings[u2Settings[item] + "Settings"].valueU2.unshift(tempSettings[u2Settings[item] + "DefaultSettings"].valueU2);
				}
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.30') {

			var settings_List = ['autoGoldenSettings', 'autoGoldenDailySettings', 'autoGoldenC3Settings'];
			var runType = ['Filler', 'Daily', 'C3'];
			var values = ['value', 'valueU2'];
			for (var x = 0; x < settings_List.length; x++) {
				for (var z = 0; z < values.length; z++) {
					if (typeof (tempSettings[settings_List[x]][values[z]][0]) !== 'undefined') {
						for (var y = 0; y < tempSettings[settings_List[x]][values[z]].length; y++) {
							tempSettings[settings_List[x]][values[z]][y].runType = runType[x];
							if (runType[x] === 'Filler') tempSettings[settings_List[x]][values[z]][y].challenge = 'All';
							if (runType[x] === 'C3') tempSettings[settings_List[x]][values[z]][y].challenge3 = 'All';
						}
					}
				}
			}

			for (item in values) {
				autoTrimpSettings.autoGoldenSettings[values[item]] = [...tempSettings[settings_List[0]][values[item]], ...tempSettings[settings_List[1]][values[item]], ...tempSettings[settings_List[2]][values[item]]];
			}
			saveSettings();
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.36') {

			if (typeof (tempSettings["uniqueMapSettingsArray"]) !== 'undefined') {
				autoTrimpSettings.uniqueMapSettingsArray.valueU2["Big_Wall"] = {
					enabled: false,
					zone: 100,
					cell: 0,
				};
			}
		}

		//Converting addonUser saves variable to object and storing farming settings .done stuff in it
		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.37') {

			var obj = [];
			for (var x = 0; x < 30; x++) {
				obj[x] = {};
				obj[x].done = '';
			}

			if (typeof game.global.addonUser !== 'object')
				game.global.addonUser = {};


			const u1Settings = ['hdFarm', 'voidMap', 'boneShrine', 'mapBonus', 'mapFarm', 'raiding', 'bionicRaiding', 'toxicity'];

			const u2Settings = ['hdFarm', 'voidMap', 'boneShrine', 'mapBonus', 'mapFarm', 'raiding', 'worshipperFarm', 'tributeFarm', 'smithyFarm', 'quagmire', 'insanity', 'alchemy', 'hypothermia', 'desolation'];

			for (var item in u1Settings) {
				if (typeof game.global.addonUser[u1Settings[item] + 'Settings'] === 'undefined')
					game.global.addonUser[u1Settings[item] + 'Settings'] = {};

				var obj = [];
				for (var x = 0; x < 30; x++) {
					obj[x] = {};
					obj[x].done = '';
				}
				game.global.addonUser[u1Settings[item] + 'Settings'].value = obj;

				if (typeof (autoTrimpSettings[u1Settings[item] + 'Settings'].value[0]) !== 'undefined') {
					for (var y = 0; y < autoTrimpSettings[u1Settings[item] + 'Settings'].value.length; y++) {
						autoTrimpSettings[u1Settings[item] + 'Settings'].value[y].row = y;
					}
				}
			}

			for (var item in u2Settings) {
				if (typeof game.global.addonUser[u2Settings[item] + 'Settings'] === 'undefined')
					game.global.addonUser[u2Settings[item] + 'Settings'] = {};
				var obj = [];
				for (var x = 0; x < 30; x++) {
					obj[x] = {};
					obj[x].done = '';
				}
				game.global.addonUser[u2Settings[item] + 'Settings'].value = obj;

				if (typeof (autoTrimpSettings[u2Settings[item] + 'Settings'].valueU2[0]) !== 'undefined') {
					for (var y = 0; y < autoTrimpSettings[u2Settings[item] + 'Settings'].valueU2.length; y++) {
						autoTrimpSettings[u2Settings[item] + 'Settings'].valueU2[y].row = y;
					}
				}
			}
		}
		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.3.38') {
			setupAddonUser();
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.4.09') {
			if (typeof (tempSettings["heHrDontPortalBefore"]) !== 'undefined') {
				autoTrimpSettings.heliumHrDontPortalBefore.value = tempSettings.heHrDontPortalBefore.value;
				autoTrimpSettings.heliumHrDontPortalBefore.valueU2 = tempSettings.heHrDontPortalBefore.valueU2;
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.4.20') {
			if (typeof (tempSettings["buildingSettingsArray"]) !== 'undefined') {
				autoTrimpSettings.buildingSettingsArray.valueU2.Antenna = {}
				autoTrimpSettings.buildingSettingsArray.valueU2.Antenna.enabled = false;
				autoTrimpSettings.buildingSettingsArray.valueU2.Antenna.percent = 100;
				autoTrimpSettings.buildingSettingsArray.valueU2.Antenna.buyMax = 0;

			}
		}


		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.5.06') {
			if (typeof (autoTrimpSettings.alchemySettings['valueU2'][1]) !== 'undefined') {
				for (var y = 1; y < autoTrimpSettings.alchemySettings['valueU2'].length; y++) {
					autoTrimpSettings.alchemySettings['valueU2'][y].repeatevery = 0;
					autoTrimpSettings.alchemySettings['valueU2'][y].endzone = 999;
				}
				saveSettings();
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.5.09') {
			if (typeof (tempSettings["autoAbandon"]) !== 'undefined') {
				autoTrimpSettings.autoAbandon.value = tempSettings.autoAbandon.enabled ? 2 : 0;
				autoTrimpSettings.autoAbandon.valueU2 = tempSettings.autoAbandon.enabledU2 ? 2 : 0;
			}
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.5.13') {
			var values = ['value', 'valueU2'];
			for (var z = 0; z < values.length; z++) {
				var incrementMaps = tempSettings['raidingSettings'][values[z]][0].incrementMaps;
				if (typeof (tempSettings['raidingSettings'][values[z]][0]) !== 'undefined') {
					for (var y = 0; y < tempSettings['raidingSettings'][values[z]].length; y++) {
						if (y === 0) continue;
						var currSetting = tempSettings['raidingSettings'][values[z]][y];
						autoTrimpSettings['raidingSettings'][values[z]][y].incrementMaps = incrementMaps;
						autoTrimpSettings['raidingSettings'][values[z]][y].raidingzone = (currSetting.raidingzone - currSetting.world).toString();
					}
				}
			}
			saveSettings();
		}

		if (autoTrimpSettings["ATversion"].split('v')[1] < '6.5.15') {
			if (typeof (tempSettings["uniqueMapSettingsArray"]) !== 'undefined') {
				const currTrimple = tempSettings['uniqueMapSettingsArray'].value["Trimple_of_Doom"];
				delete tempSettings['uniqueMapSettingsArray'].value["Trimple_of_Doom"];
				autoTrimpSettings.uniqueMapSettingsArray.value["Trimple_Of_Doom"] = currTrimple;
				delete autoTrimpSettings.uniqueMapSettingsArray.value["Trimple_of_Doom"];
				if (autoTrimpSettings.uniqueMapSettingsArray.value['Trimple_Of_Doom'] === undefined)
					autoTrimpSettings.uniqueMapSettingsArray.value['Trimple_Of_Doom'] = {
						enabled: false,
						zone: 999,
						cell: 1,
					}
			}
		}

	}

	//Print link to changelog if the user is in TW when they first load the update so that they can look at any relevant notes.
	//No other way to access it in TW currently.
	if (usingRealTimeOffline) {
		var changelogURL = basepath + 'updates.html';
		changelog.push("There has been an AutoTrimps update. <a href=\"" + changelogURL + "\" 'updates.html target='_blank'><u>Click here</u></a> to view the changelog.");
	}

	autoTrimpSettings["ATversion"] = atSettings.initialise.version;
	if (changelog.length !== 0) {
		printChangelog(changelog);
		verticalCenterTooltip(false, true);
	}
	updateCustomButtons(true);
	saveSettings();
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
        <br>Talk with the other Trimpers: <a target="Trimps" href="https://discord.gg/trimps">Trimps Discord Server</a>\
        <br>Check <a target="#" href="https://github.com/SadAugust/AutoTrimps_Local/commits/gh-pages" target="#">the commit history</a> (if you want).',
		action = 'cancelTooltip()',
		title = 'Script Update Notice<br>' + atSettings.initialise.version,
		acceptBtnText = "Thank you for playing with AutoTrimps.",
		hideCancel = true;

	tooltip('confirm', null, 'update', body + footer, action, title, acceptBtnText, null, hideCancel);
	verticalCenterTooltip(true);
}

function assembleChangelog(c) {
	return `${c}<br>`
}