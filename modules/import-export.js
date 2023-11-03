function ImportExportTooltip(what, event, download) {
	cancelTooltip();
	if (game.global.lockTooltip)
		return;
	var $elem = document.getElementById("tooltipDiv");
	if (document.getElementById("tipTitle").innerHTML === "Spire Assault") {
		autoBattle.help();
	} swapClass("tooltipExtra", "tooltipExtraNone", $elem);
	var ondisplay = null;
	var tooltipText;
	var costText = "";
	var titleText = what;
	if (what === "ExportAutoTrimps") {
		var saveName = 'AT Settings P' + game.global.totalPortals;
		if (game.global.universe === 2 || game.global.totalRadPortals > 0) {
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

	}
	else if (what === "ImportAutoTrimps") {

		tooltipText = "Import your AUTOTRIMPS save string! It'll be fine, I promise.<br/><br/><textarea id='importBox' style='width: 100%' rows='5'></textarea>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); loadAutoTrimps();'>Import</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
		ondisplay = function () {
			document.getElementById('importBox').focus();
		};
	}
	else if (what === "spireImport") {
		tooltipText = "Import your SPIRE string! <br/><br/><textarea id='importBox' style='width: 100%' rows='5'></textarea>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); tdStringCode2();'>Import</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
		ondisplay = function () {
			document.getElementById('importBox').focus();
		};
	}
	else if (what === 'MagmiteExplain') {
		tooltipText = "<img src='" + atSettings.initialise.basepath + "/imgs/mi.png'>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>Thats all the help you get.</div></div>";
	}
	else if (what === 'c2table') {
		//Adding U1 challenges
		var highestZone = game.stats.highestLevel.valueTotal();
		const c2array = [];
		if (highestZone >= 35) c2array.push('Size');
		if (highestZone >= 130) c2array.push('Slow');
		if (highestZone >= 180) c2array.push('Watch');
		if (getTotalPerkResource(true) >= 30) c2array.push('Discipline');
		if (highestZone >= 40) c2array.push('Balance');
		if (highestZone >= 45) c2array.push('Meditate');
		if (highestZone >= 25) c2array.push('Metal');
		if (highestZone >= 180) c2array.push('Lead');
		if (highestZone >= 145) c2array.push('Nom');
		if (highestZone >= 165) c2array.push('Toxicity');
		if (game.global.prisonClear >= 1) c2array.push('Electricity');
		if (highestZone >= 120) c2array.push('Coordinate');
		if (highestZone >= 60) c2array.push('Trimp');
		if (highestZone >= 425) c2array.push('Obliterated');
		if (game.global.totalSquaredReward >= 4500) c2array.push('Eradicated');
		if (highestZone >= 150) c2array.push('Mapology');
		if (highestZone >= 70) c2array.push('Trapper');

		//Adding U2 challenges
		var highestZone = game.stats.highestRadLevel.valueTotal();
		const c3array = [];

		if (highestZone >= 50) c3array.push('Unlucky');
		if (highestZone >= 50) c3array.push('Unbalance');
		if (highestZone >= 85) c3array.push('Quest');
		if (highestZone >= 105) c3array.push('Storm');
		if (highestZone >= 50) c3array.push('Downsize');
		if (highestZone >= 50) c3array.push('Transmute');
		if (highestZone >= 50) c3array.push('Duel');
		if (highestZone >= 70) c3array.push('Wither');
		if (highestZone >= 175) c3array.push('Glass');
		if (highestZone >= 201) c3array.push('Smithless');
		if (highestZone >= 60) c3array.push('Trappapalooza');
		if (highestZone >= 115) c3array.push('Berserk');

		challengeList = {};

		const c2runnerArray = ['Size', 'Slow', 'Watch', 'Discipline', 'Balance', 'Meditate', 'Metal', 'Lead', 'Nom', 'Toxicity', 'Electricity', 'Mapology'];
		const c3runnerArray = ['Unlucky', 'Unbalance', 'Quest', 'Storm', 'Downsize', 'Duel', 'Smithless'];

		for (var x = 0; x < c2array.length; x++) {
			challengeList[c2array[x]] = {
				number: (x + 1),
				percent: getIndividualSquaredReward(c2array[x]) + '%',
				zone: game.c2[c2array[x]],
				percentzone: (100 * (game.c2[c2array[x]] / (game.stats.highestLevel.valueTotal()))).toFixed(2) + '%',
				c2runner: c2runnerArray.includes(c2array[x]) ? '✅' : '❌',
				color: 0
			}
		}

		if (c3array.length > 0) {
			challengeList.C3s = {
				number: 'Difficulty',
				percent: 'C3 %',
				zone: 'Zone',
				percentzone: '%HZE',
				c2runner: 'C3 Runner',
				color: 0
			}

			for (var x = 0; x < c3array.length; x++) {
				challengeList[c3array[x]] = {
					number: (x + 1),
					percent: getIndividualSquaredReward(c3array[x]) + '%',
					zone: game.c2[c3array[x]],
					percentzone: (100 * (game.c2[c3array[x]] / (game.stats.highestRadLevel.valueTotal()))).toFixed(2) + '%',
					c2runner: c3runnerArray.includes(c3array[x]) ? '✅' : '❌',
					color: 0
				}
			}
		}

		function challengeListcolor() {
			function a(b, c, d) {
				var e = 100 * (game.c2[b] / (game.stats.highestLevel.valueTotal()));
				challengeList[b].color = e >= c ? "LIMEGREEN" : e < c && e >= d ? "GOLD" : e < d && 1 <= e ? "#de0000" : "DEEPSKYBLUE"
			}
			Object.keys(challengeList).forEach(function (b) {
				null !== game.c2[b] && ("Coordinate" === b ? a(b, 45, 38) : "Trimp" === b ? a(b, 45, 35) : "Obliterated" === b ? a(b, 25, 20) : "Eradicated" === b ? a(b, 14, 10) : "Mapology" === b ? a(b, 90, 80) : "Trapper" === b ? a(b, 85, 75) : a(b, 95, 85))
			})
		}
		function c3listcolor() {
			function colorC3(challenge, highPct, midPct) {
				var challengePercent = 100 * (game.c2[challenge] / (game.stats.highestRadLevel.valueTotal()));
				challengeList[challenge].color = "DEEPSKYBLUE"
				if (challengePercent >= highPct) challengeList[challenge].color = "LIMEGREEN";
				else if (challengePercent < highPct && challengePercent >= midPct) challengeList[challenge].color = "GOLD";
				else if (challengePercent < midPct && 1 <= challengePercent) challengeList[challenge].color = "#de0000";
			}
			Object.keys(challengeList).forEach(function (challenge) {
				if (game.c2[challenge] !== null) {
					if (challenge === "Unbalance")
						colorC3(challenge, 90, 80);
					else if (challenge === "Unlucky")
						colorC3(challenge, 90, 80);
					else if (challenge === "Duel")
						colorC3(challenge, 90, 80);
					else if (challenge === "Transmute")
						colorC3(challenge, 90, 80);
					else if (challenge === "Quest")
						colorC3(challenge, 90, 80);
					else if (challenge === "Downsize")
						colorC3(challenge, 85, 75);
					else if (challenge === "Trappapalooza")
						colorC3(challenge, 75, 60);
					else if (challenge === "Wither")
						colorC3(challenge, 85, 75);
					else if (challenge === "Storm")
						colorC3(challenge, 90, 80);
					else if (challenge === "Berserk")
						colorC3(challenge, 85, 75);
					else if (challenge === "Glass")
						colorC3(challenge, 90, 80);
					else if (challenge === "Smithless")
						colorC3(challenge, 90, 80);
				}
			});
		}
		challengeListcolor();
		c3listcolor();
		tooltipText = `<div class='litScroll'>
    	<table class='bdTableSm table table-striped'>
       		<tbody>
            	<tr>
                	<td>Name</td>
                	<td>Difficulty</td>
                	<td>C2 %</td>
                	<td>Zone</td>
                	<td>%HZE</td>
                	<td>C2 Runner</td>
            	</tr>
		`
		for (var x = 0; x < Object.keys(challengeList).length; x++) {
			if (x === 12) tooltipText += '<tr>'
			tooltipText += `<tr>
					<td>` + Object.keys(challengeList)[x] + `</td>
					<td>` + challengeList[Object.keys(challengeList)[x]].number + `</td>
					<td>` + challengeList[Object.keys(challengeList)[x]].percent + `</td>
					<td>` + challengeList[Object.keys(challengeList)[x]].zone + `</td>
					<td bgcolor='black'>
						<font color=` + challengeList[Object.keys(challengeList)[x]].color + `>` + challengeList[Object.keys(challengeList)[x]].percentzone + `
					</td>
					<td>` + challengeList[Object.keys(challengeList)[x]].c2runner + `</td>
				</tr>`
		}
		tooltipText += `<tr>
					<td>Total</td>
					<td> </td>
					<td>` + game.global.totalSquaredReward + `%</td>
					<td> </td>
					<td></td>
            	</tr>
			</tbody>
		</table>
	</div> `;
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>Close</div></div>";
	}
	else if (what === 'ResetDefaultSettingsProfiles') {
		titleText = '<b>Loading AutoTrimps Default Profile...</b><p>Current Settings will be lost!';
		tooltipText = '<b>NOTICE:</b> Switching to Default AutoTrimps settings profile!!!! <br>All current settings <b>WILL</b> be lost after this point. <br>You might want to cancel, to go back and save your existing settings first.... <br>This will <b><u>Reset</u></b> the script to factory settings.';
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 10vw' onclick='cancelTooltip(); resetAutoTrimps();'>Reset to Default Profile</div><div style='margin-left: 15%' class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();'>Cancel</div></div>";
	}
	else if (what === 'SetCustomChallenge') {
		titleText = "Enter Challenge To Run";
		tooltipText = "What challenge would you like to be switched to?<br/><br/><textarea id='setSettingsNameTooltip' style='width: 100%' rows='1'></textarea>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 10vw' onclick='cancelTooltip(); testChallenge();'>Import</div><div class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();'>Cancel</div></div>";
		ondisplay = function () {
			document.getElementById('setSettingsNameTooltip').focus();
		};
	}
	else if (what === 'timeWarp') {
		titleText = "Time Warp Hours";
		tooltipText = "How many hours of time warp would you like to run?<br/><br/><textarea id='setSettingsNameTooltip' style='width: 100%' rows='1'></textarea>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 10vw' onclick='cancelTooltip(); testTimeWarp();'>Activate Time Warp</div><div class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();'>Cancel</div></div>";
		ondisplay = function () {
			document.getElementById('setSettingsNameTooltip').focus();
		};
	}
	else if (what === 'NameSettingsProfiles') {
		titleText = "Enter New Settings Profile Name";
		tooltipText = "What would you like the name of the Settings Profile to be?<br/><br/><textarea id='setSettingsNameTooltip' style='width: 100%' rows='1'></textarea>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 10vw' onclick='cancelTooltip(); nameAndSaveNewProfile();'>Import</div><div class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();document.getElementById(\"settingsProfiles\").selectedIndex=0;'>Cancel</div></div>";
		ondisplay = function () {
			document.getElementById('setSettingsNameTooltip').focus();
		};
	}
	else if (what === 'message') {
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

	if (download === true && what === "ExportAutoTrimps") {
		var pauseGame = 1;
		var notation = 0;
		var theme = 2;
		var paused = false;
		document.getElementById("downloadLink").click();
		document.getElementById("confirmTooltipBtn").click();

		//Setting options to ones that make the most sense to me
		if (game.options.menu.standardNotation.enabled !== 0) {
			notation = game.options.menu.standardNotation.enabled;
			game.options.menu.standardNotation.enabled = 0;
		}
		if (game.options.menu.darkTheme.enabled !== 2) {
			theme = game.options.menu.darkTheme.enabled
			game.options.menu.darkTheme.enabled = 2;
		}
		if (game.options.menu.disablePause.enabled === 0) {
			pauseGame = 0;
			game.options.menu.disablePause.enabled = 1;
		}
		if (game.options.menu.pauseGame.enabled === 1) paused = true;
		setTimeout(function () {
			if (!paused && game.options.menu.pauseGame.enabled === 1) toggleSetting('pauseGame');
		}, 500);
		if (!paused) toggleSetting('pauseGame');
		tooltip('Export', null, 'update');
		document.getElementById("downloadLink").click();
		document.getElementById("confirmTooltipBtn").click();
		game.options.menu.disablePause.enabled = pauseGame;
		game.options.menu.standardNotation.enabled = notation
		game.options.menu.darkTheme.enabled = theme;
	}
}

//Loads new AT settings file from string
function loadAutoTrimps() {
	try {
		var importBox = document.getElementById("importBox").value.replace(/[\n\r]/gm, ""),
			autoTrimpsSettings = JSON.parse(importBox);
		if (autoTrimpsSettings === null || autoTrimpsSettings === '') return void
			debug("Error importing AT settings, the string is empty.", "profile");
	}
	catch (c) {
		return void debug("Error importing AT settings, the string is bad. " + c.message, "profile")
	}
	debug("Importing new AT settings file...", "profile");
	resetAutoTrimps(autoTrimpsSettings);
}

//Either sets the AT settings to default or to the ones imported in loadAutoTrimps()
function resetAutoTrimps(autoTrimpsSettings, b) {
	atSettings.running = false;
	setTimeout(
		(function (atSettings) {
			localStorage.removeItem("atSettings");
			autoTrimpSettings = atSettings ? atSettings : {};
			var e = document.getElementById("settingsRow");
			e.removeChild(document.getElementById("autoSettings"));
			e.removeChild(document.getElementById("autoTrimpsTabBarMenu"));

			automationMenuSettingsInit();
			initializeAllTabs();
			initializeAllSettings();
			saveSettings();
			updateATVersion();
			resetSettingsPortal();
			updateCustomButtons(true);
			saveSettings();
			localStorage.perkyInputs = autoTrimpSettings.autoAllocatePresets.value;
			localStorage.surkyInputs = autoTrimpSettings.autoAllocatePresets.valueU2;
			localStorage.mutatorPresets = autoTrimpSettings.mutatorPresets.valueU2;
			loadAugustSettings();
			modifyParentNodeUniverseSwap();
			if (typeof MODULES["graphs"].themeChanged === 'function')
				MODULES["graphs"].themeChanged();

			//Remove the localStorage entries if they are empty and rebuild the GUI to initialise base settings
			if (Object.keys(JSON.parse(localStorage.getItem('perkyInputs'))).length === 1) delete localStorage.perkyInputs;
			if (Object.keys(JSON.parse(localStorage.getItem('surkyInputs'))).length === 1) delete localStorage.surkyInputs;
			MODULES.autoPerks.displayGUI(game.global.universe);
		})
			(autoTrimpsSettings),
		101
	);

	if (autoTrimpsSettings) {
		debug("Successfully imported new AT settings...", "profile");
		ImportExportTooltip("message", "Successfully imported Autotrimps settings file.");
	}
	else {
		debug("Successfully reset AT settings to Defaults...", "profile");
		ImportExportTooltip("message", "Autotrimps has been successfully reset to its default settings!");
	}
	atSettings.running = true;
}

//Loads the base settings that I want to be the same when loading peoples saves as it will save me time.
function loadAugustSettings() {
	if (atSettings.initialise.basepath !== 'https://localhost:8887/AutoTrimps_Local/') return;
	autoTrimpSettings.gameUser.value = 'test';
	saveSettings();
	game.options.menu.darkTheme.enabled = 2;
	game.options.menu.standardNotation.enabled = 0;
	game.options.menu.disablePause.enabled = 1;
	game.options.menu.hotkeys.enabled = 1;

	var toggles = ['darkTheme', 'standardNotation', 'hotkeys'];
	for (var i in toggles) {
		var setting = game.options.menu[toggles[i]];
		if (setting.onToggle) setting.onToggle();
	}
	if (typeof MODULES["graphs"].themeChanged === 'function')
		MODULES["graphs"].themeChanged();
}