MODULES["import-export"] = {};
var $settingsProfiles;
function settingsProfileMakeGUI() {
	var $settingsProfilesLabel = document.createElement("Label");
	$settingsProfilesLabel.id = 'settingsProfiles Label';
	$settingsProfilesLabel.innerHTML = "Settings Profile: ";
	if (game.options.menu.darkTheme.enabled == 2) $settingsProfilesLabel.setAttribute("style", "margin-left: 1.2vw; margin-right: 0.8vw; font-size: 0.8vw;");
	else $settingsProfilesLabel.setAttribute("style", "margin-left: 1.2vw; margin-right: 0.8vw; font-size: 0.8vw;");
	$settingsProfiles = document.createElement("select");
	$settingsProfiles.id = 'settingsProfiles';
	$settingsProfiles.setAttribute('class', 'noselect');
	$settingsProfiles.setAttribute('onchange', 'settingsProfileDropdownHandler()');
	var oldstyle = 'text-align: center; width: 160px; font-size: 1.0vw;';
	if (game.options.menu.darkTheme.enabled != 2) $settingsProfiles.setAttribute("style", oldstyle + " color: black;");
	else $settingsProfiles.setAttribute('style', oldstyle);
	//Create settings profile selection dropdown
	var $settingsProfilesButton = document.createElement("Button");
	$settingsProfilesButton.id = 'settingsProfiles Button';
	$settingsProfilesButton.setAttribute('class', 'btn btn-info');
	$settingsProfilesButton.innerHTML = "&lt;Delete Profile";
	$settingsProfilesButton.setAttribute('style', 'margin-left: 0.5vw; margin-right: 0.5vw; font-size: 0.8vw;');
	$settingsProfilesButton.setAttribute('onclick', 'onDeleteProfileHandler()');
	//populate with a Default (read default settings):
	var innerhtml = "<option id='customProfileCurrent'>Current</option>";
	//populate with a Default (read default settings):
	innerhtml += "<option id='customProfileDefault'>Reset to Default</option>";
	//Append a 2nd default item named "Save New..." and have it tied to a write function();
	innerhtml += "<option id='customProfileNew'>Save New...</option>";
	//dont forget to populate the rest of it with stored items:
	$settingsProfiles.innerHTML = innerhtml;
	//Add the $settingsProfiles dropdown to UI
	var $ietab = document.getElementById('Import Export');
	if ($ietab == null) return;
	//Any ERRORs here are caused by incorrect order loading of script and you should reload until its gone.(for now)
	$ietab.insertBefore($settingsProfilesLabel, $ietab.childNodes[1]);
	$ietab.insertBefore($settingsProfiles, $ietab.childNodes[2]);
	$ietab.insertBefore($settingsProfilesButton, $ietab.childNodes[3]);
}   //self-executes at the bottom of the file.

//Populate dropdown menu with list of AT SettingsProfiles
function initializeSettingsProfiles() {
	if ($settingsProfiles == null) return;
	//load the old data in:
	var loadLastProfiles = localStorage.getItem('ATSelectedSettingsProfile');
	var oldpresets = loadLastProfiles ? JSON.parse(loadLastProfiles) : new Array(); //load the import.
	oldpresets.forEach(function (elem) {
		//Populate dropdown menu to reflect new name:
		let optionElementReference = new Option(elem.name);
		optionElementReference.id = 'customProfileRead';
		$settingsProfiles.add(optionElementReference);
	});
	$settingsProfiles.selectedIndex = 0;
}

//This switches into the new profile when the dropdown is selected.
//it is the "onchange" handler of the settingsProfiles dropdown
//Asks them do a confirmation check tooltip first. The
function settingsProfileDropdownHandler() {
	if ($settingsProfiles == null) return;
	var index = $settingsProfiles.selectedIndex;
	var id = $settingsProfiles.options[index].id;
	//Current: placeholder.
	if (id == 'customProfileCurrent')
		return;
	cancelTooltip();
	//Default: simply calls Reset To Default:
	if (id == 'customProfileDefault')
		//calls a tooltip then resetAutoTrimps() below
		ImportExportTooltip('ResetDefaultSettingsProfiles');
	//Save new...: asks a name and saves new profile
	else if (id == 'customProfileNew')
		//calls a tooltip then nameAndSaveNewProfile() below
		ImportExportTooltip('NameSettingsProfiles');
	//Reads the existing profile name and switches into it.
	else if (id == 'customProfileRead')
		//calls a tooltip then confirmedSwitchNow() below
		ImportExportTooltip('ReadSettingsProfiles');
	//NOPE.XWait 200ms for everything to reset and then re-select the old index.
	//setTimeout(function(){ settingsProfiles.selectedIndex = index;} ,200);
	return;
}

function confirmedSwitchNow() {
	if ($settingsProfiles == null) return;
	var index = $settingsProfiles.selectedIndex;
	var profname = $settingsProfiles.options[index].text;
	//load the stored profiles from browser
	var loadLastProfiles = JSON.parse(localStorage.getItem('ATSelectedSettingsProfile'));
	if (loadLastProfiles != null) {
		var results = loadLastProfiles.filter(function (elem, i) {
			return elem.name == profname;
		});
		if (results.length > 0) {
			resetAutoTrimps(results[0].data, profname);
			debug("Successfully loaded existing profile: " + profname, "profile");
		}
	}
}

//called by ImportExportTooltip('NameSettingsProfiles')
function nameAndSaveNewProfile() {
	//read the name in from tooltip
	try {
		var profname = document.getElementById("setSettingsNameTooltip").value.replace(/[\n\r]/gm, "");
		if (profname == null) {
			debug("Error in naming, the string is empty.", "profile");
			return;
		}
	} catch (err) {
		debug("Error in naming, the string is bad." + err.message, "profile");
		return;
	}
	var profile = {
		name: profname,
		data: JSON.parse(serializeSettings())
	}
	//load the old data in,
	var loadLastProfiles = localStorage.getItem('ATSelectedSettingsProfile');
	var oldpresets = loadLastProfiles ? JSON.parse(loadLastProfiles) : new Array(); //load the import.
	//rewrite the updated array in
	var presetlists = [profile];
	//add the two arrays together, string them, and store them.
	safeSetItems('ATSelectedSettingsProfile', JSON.stringify(oldpresets.concat(presetlists)));
	debug("Successfully created new profile: " + profile.name, "profile");
	ImportExportTooltip('message', 'Successfully created new profile: ' + profile.name);
	//Update dropdown menu to reflect new name:
	let optionElementReference = new Option(profile.name);
	optionElementReference.id = 'customProfileRead';
	if ($settingsProfiles == null) return;
	$settingsProfiles.add(optionElementReference);
	$settingsProfiles.selectedIndex = $settingsProfiles.length - 1;
}

//event handler for profile delete button - confirmation check tooltip
function onDeleteProfileHandler() {
	ImportExportTooltip('DeleteSettingsProfiles');  //calls a tooltip then onDeleteProfile() below
}
//Delete Profile runs after.
function onDeleteProfile() {
	if ($settingsProfiles == null) return;
	var index = $settingsProfiles.selectedIndex;
	//Remove the option
	$settingsProfiles.options.remove(index);
	//Stay on the same index (becomes next item) - so we dont have to Toggle into a new profile again and can keep chain deleting.
	$settingsProfiles.selectedIndex = (index > ($settingsProfiles.length - 1)) ? $settingsProfiles.length - 1 : index;
	//load the old data in:
	var loadLastProfiles = localStorage.getItem('ATSelectedSettingsProfile');
	var oldpresets = loadLastProfiles ? JSON.parse(loadLastProfiles) : new Array(); //load the import.
	//rewrite the updated array in. string them, and store them.
	var target = (index - 3); //subtract the 3 default choices out
	oldpresets.splice(target, 1);
	safeSetItems('ATSelectedSettingsProfile', JSON.stringify(oldpresets));
	debug("Successfully deleted profile #: " + target, "profile");
}

function ImportExportTooltip(what, event, download) {
	if (game.global.lockTooltip) return;
	var $elem = document.getElementById("tooltipDiv");
	swapClass("tooltipExtra", "tooltipExtraNone", $elem);
	var ondisplay = null;
	var tooltipText;
	var costText = "";
	var titleText = what;
	if (what == "ExportAutoTrimps") {
		var saveName = 'AT Settings P' + game.global.totalPortals;
		if (game.global.universe == 2 || game.global.totalRadPortals > 0) {
			saveName += " " + game.global.totalRadPortals + " U" + game.global.universe;
		}
		tooltipText = "This is your AUTOTRIMPS save string. There are many like it but this one is yours. Save this save somewhere safe so you can save time next time. <br/><br/><textarea id='exportArea' style='width: 100%' rows='5'>" + serializeSettings() + "</textarea>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip()'>Got it</div>";
		if (document.queryCommandSupported('copy')) {
			costText += "<div id='clipBoardBtn' class='btn btn-success'>Copy to Clipboard</div>";
			ondisplay = function () {
				document.getElementById('exportArea').select();
				document.getElementById('clipBoardBtn').addEventListener('click', function (event) {
					document.getElementById('exportArea').select();
					try {
						document.execCommand('copy');
					} catch (err) {
						document.getElementById('clipBoardBtn').innerHTML = "Error, not copied";
					}
				});
			};
		} else {
			ondisplay = function () {
				document.getElementById('exportArea').select();
			};
		}
		costText += "<a id='downloadLink' target='_blank' download='" + saveName + ".txt', href=";
		costText += 'data:text/plain,' + encodeURIComponent(serializeSettings());
		costText += " ><div class='btn btn-danger' id='downloadBtn'>Download as File</div></a>";
		costText += "</div>";

	} else if (what == "ImportAutoTrimps") {
		tooltipText = "Import your AUTOTRIMPS save string! It'll be fine, I promise.<br/><br/><textarea id='importBox' style='width: 100%' rows='5'></textarea>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); loadAutoTrimps();'>Import</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
		ondisplay = function () {
			document.getElementById('importBox').focus();
		};
	} else if (what == "spireImport") {
		tooltipText = "Import your SPIRE string! <br/><br/><textarea id='importBox' style='width: 100%' rows='5'></textarea>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); tdStringCode2();'>Import</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
		ondisplay = function () {
			document.getElementById('importBox').focus();
		};
	} else if (what == "CleanupAutoTrimps") {
		cleanupAutoTrimps();
		tooltipText = "Autotrimps saved-settings have been attempted to be cleaned up. If anything broke, refreshing will fix it, but check that your settings are correct! (prestige in particular)";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>OK</div></div>";
	} else if (what == "ExportModuleVars") {
		tooltipText = "These are your custom Variables. The defaults have not been included, only what you have set... <br/><br/><textarea id='exportArea' style='width: 100%' rows='5'>" + exportModuleVars() + "</textarea>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip()'>Got it</div>";
		if (document.queryCommandSupported('copy')) {
			costText += "<div id='clipBoardBtn' class='btn btn-success'>Copy to Clipboard</div>";
			ondisplay = function () {
				document.getElementById('exportArea').select();
				document.getElementById('clipBoardBtn').addEventListener('click', function (event) {
					document.getElementById('exportArea').select();
					try {
						document.execCommand('copy');
					} catch (err) {
						document.getElementById('clipBoardBtn').innerHTML = "Error, not copied";
					}
				});
			};
		} else {
			ondisplay = function () {
				document.getElementById('exportArea').select();
			};
		}
		costText += "</div>";
	} else if (what == "ImportModuleVars") {
		tooltipText = "Enter your Autotrimps MODULE variable settings to load, and save locally for future use between refreshes:<br/><br/><textarea id='importBox' style='width: 100%' rows='5'></textarea>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); importModuleVars();'>Import</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
		ondisplay = function () {
			document.getElementById('importBox').focus();
		};
	} else if (what == "ATModuleLoad") {
		var mods = document.getElementById('ATModuleListDropdown');
		var modnames = "";
		for (script in mods.selectedOptions) {
			var $item = mods.selectedOptions[script];
			if ($item.value != null) {
				ATscriptLoad(modulepath, $item.value);
				modnames += $item.value + " ";
			}
		}
		tooltipText = "Autotrimps - Loaded the MODULE .JS File(s): " + modnames;
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>OK</div></div>";
	} else if (what == "ATModuleUnload") {
		var mods = document.getElementById('ATModuleListDropdown');
		var modnames = "";
		for (script in mods.selectedOptions) {
			var $item = mods.selectedOptions[script];
			if ($item.value != null) {
				ATscriptUnload($item.value);
				modnames += $item.value + " ";
			}
		}
		tooltipText = "Autotrimps - UnLoaded the MODULE .JS File(s): " + modnames;
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>OK</div></div>";
	} else if (what == "ResetModuleVars") {
		resetModuleVars();
		tooltipText = "Autotrimps MODULE variable settings have been successfully reset to its defaults!";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>OK</div></div>";
	} else if (what == 'MagmiteExplain') {
		tooltipText = "<img src='" + basepath + "mi.png'>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>Thats all the help you get.</div></div>";
	} else if (what == 'ReadSettingsProfiles') {
		titleText = '<b>Loading New AutoTrimps Profile...</b><p>Current Settings will be lost';
		tooltipText = '<b>NOTICE:</b> Switching to new AutoTrimps settings profile!!!! <br>All current settings <b>WILL</b> be lost after this point. <br>You might want to cancel, to go back and save your existing settings first....';
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 10vw' onclick='cancelTooltip(); confirmedSwitchNow();'>Confirm and Switch Profiles</div><div style='margin-left: 15%' class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();'>Cancel</div></div>";
	} else if (what == 'ResetDefaultSettingsProfiles') {
		titleText = '<b>Loading AutoTrimps Default Profile...</b><p>Current Settings will be lost!';
		tooltipText = '<b>NOTICE:</b> Switching to Default AutoTrimps settings profile!!!! <br>All current settings <b>WILL</b> be lost after this point. <br>You might want to cancel, to go back and save your existing settings first.... <br>This will <b><u>Reset</u></b> the script to factory settings.';
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 10vw' onclick='cancelTooltip(); resetAutoTrimps(); settingsProfiles.selectedIndex = 1;'>Reset to Default Profile</div><div style='margin-left: 15%' class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();'>Cancel</div></div>";
	} else if (what == 'NameSettingsProfiles') {
		titleText = "Enter New Settings Profile Name";
		tooltipText = "What would you like the name of the Settings Profile to be?<br/><br/><textarea id='setSettingsNameTooltip' style='width: 100%' rows='1'></textarea>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 10vw' onclick='cancelTooltip(); nameAndSaveNewProfile();'>Import</div><div class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();document.getElementById(\"settingsProfiles\").selectedIndex=0;'>Cancel</div></div>";
		ondisplay = function () {
			document.getElementById('setSettingsNameTooltip').focus();
		};
	} else if (what == 'DeleteSettingsProfiles') {
		titleText = "<b>WARNING:</b> Delete Profile???"
		tooltipText = "You are about to delete the <B><U>" + `${settingsProfiles.value}` + "</B></U> settings profile.<br>This will not switch your current settings though. Continue ?<br/>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); onDeleteProfile();'>Delete Profile</div><div style='margin-left: 15%' class='btn btn-info' onclick='cancelTooltip();'>Cancel</div></div>";
	} else if (what == 'message') {
		titleText = "Generic message";
		tooltipText = event;
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 50%' onclick='cancelTooltip();'>OK</div></div>";
	}
	game.global.lockTooltip = true;
	$elem.style.left = "33.75%";
	$elem.style.top = "25%";
	document.getElementById("tipTitle").innerHTML = titleText;
	document.getElementById("tipText").innerHTML = tooltipText;
	document.getElementById("tipCost").innerHTML = costText;
	$elem.style.display = "block";
	if (ondisplay !== null)
		ondisplay();

	if (download == true && what == "ExportAutoTrimps") {
		var pauseGame = 1;
		var paused = false;
		document.getElementById("downloadLink").click();
		document.getElementById("confirmTooltipBtn").click();
		if (game.options.menu.disablePause.enabled == 0) {
			pauseGame = 0;
			game.options.menu.disablePause.enabled = 1;
		}
		if (game.options.menu.pauseGame.enabled == 1) paused = true;
		setTimeout(function () {
			if (!paused && game.options.menu.pauseGame.enabled == 1) toggleSetting('pauseGame');
		}, 500);
		if (!paused) toggleSetting('pauseGame');
		tooltip('Export', null, 'update');
		document.getElementById("downloadLink").click();
		document.getElementById("confirmTooltipBtn").click();
		game.options.menu.disablePause.enabled = pauseGame;
	}
}

function resetAutoTrimps(a, b) { ATrunning = !1, setTimeout(function (d) { localStorage.removeItem("autoTrimpSettings"), autoTrimpSettings = d ? d : {}; var e = document.getElementById("settingsRow"); e.removeChild(document.getElementById("autoSettings")), e.removeChild(document.getElementById("autoTrimpsTabBarMenu")), automationMenuSettingsInit(), initializeAllTabs(), initializeAllSettings(), initializeSettingsProfiles(), updateCustomButtons(), saveSettings(), checkPortalSettings(), ATrunning = !0 }(a), 101), a ? (debug("Successfully imported new AT settings...", "profile"), b ? ImportExportTooltip("message", "Successfully Imported Autotrimps Settings File!: " + b) : ImportExportTooltip("NameSettingsProfiles")) : (debug("Successfully reset AT settings to Defaults...", "profile"), ImportExportTooltip("message", "Autotrimps has been successfully reset to its defaults!")) }
function loadAutoTrimps() { try { var a = document.getElementById("importBox").value.replace(/[\n\r]/gm, ""), b = JSON.parse(a); if (null == b) return void debug("Error importing AT settings, the string is empty.", "profile") } catch (c) { return void debug("Error importing AT settings, the string is bad." + c.message, "profile") } debug("Importing new AT settings file...", "profile"), resetAutoTrimps(b) }
function cleanupAutoTrimps() { for (var a in autoTrimpSettings) { var b = document.getElementById(autoTrimpSettings[a].id); null == b && delete autoTrimpSettings[a] } }
function exportModuleVars() { return JSON.stringify(compareModuleVars()) }

function compareModuleVars() {
	var diffs = {};
	var mods = Object.keys(MODULES);
	for (var i in mods) {
		var mod = mods[i];
		var vars = Object.keys(MODULES[mods[i]]);
		for (var j in vars) {
			var vj = vars[j];
			var a = MODULES[mod][vj];
			var b = MODULESdefault[mod][vj];
			if (JSON.stringify(a) != JSON.stringify(b)) {
				if (typeof diffs[mod] === 'undefined')
					diffs[mod] = {};
				diffs[mod][vj] = a;
			}
		}
	}
	return diffs;
}

function importModuleVars() { try { var thestring = document.getElementById('importBox').value, strarr = thestring.split(/\n/); for (var line in strarr) { var s = strarr[line]; s = s.substring(0, s.indexOf(';') + 1), s = s.replace(/\s/g, ''), eval(s), strarr[line] = s } var tmpset = compareModuleVars() } catch (a) { return void debug('Error importing MODULE vars, the string is bad.' + a.message, 'profile') } localStorage.removeItem('storedMODULES'), safeSetItems('storedMODULES', JSON.stringify(tmpset)) }
function resetModuleVars(a) { ATrunning = !1, setTimeout(function () { localStorage.removeItem('storedMODULES'), MODULES = JSON.parse(JSON.stringify(MODULESdefault)), safeSetItems('storedMODULES', JSON.stringify(storedMODULES)), ATrunning = !0 }(a), 101) }
settingsProfileMakeGUI();
initializeSettingsProfiles();
