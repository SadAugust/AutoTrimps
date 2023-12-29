function ImportExportTooltip(what, event) {
    cancelTooltip();
    if (game.global.lockTooltip) return;
    var $elem = document.getElementById('tooltipDiv');
    if (document.getElementById('tipTitle').innerHTML === 'Spire Assault') {
        autoBattle.help();
    }
    swapClass('tooltipExtra', 'tooltipExtraNone', $elem);
    var ondisplay = null;
    var tooltipText;
    var costText = '';
    var titleText = what;
    if (what === 'exportAutoTrimps') {
        var saveName = 'AT Settings P' + game.global.totalPortals;
        if (game.global.universe === 2 || game.global.totalRadPortals > 0) {
            saveName += ' ' + game.global.totalRadPortals + ' U' + game.global.universe;
        }
        tooltipText = "This is your AutoTrimp settings save string. There are many like it but this one is yours. Save this save somewhere safe so you can save time next time. <br/><br/><textarea id='exportArea' style='width: 100%' rows='5'>" + serializeSettings() + '</textarea>';
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
                        document.getElementById('clipBoardBtn').innerHTML = 'Error, not copied';
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
        costText += '</div>';
    } else if (what === 'importAutoTrimps') {
        tooltipText = "Import your AUTOTRIMPS save string! It'll be fine, I promise.<br/><br/><textarea id='importBox' style='width: 100%' rows='5'></textarea>";
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); loadAutoTrimps();'>Import</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
        ondisplay = function () {
            document.getElementById('importBox').focus();
        };
    } else if (what === 'spireImport') {
        tooltipText = "Import your SPIRE string! <br/><br/><textarea id='importBox' style='width: 100%' rows='5'></textarea>";
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); tdStringCode2();'>Import</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
        ondisplay = function () {
            document.getElementById('importBox').focus();
        };
    } else if (what === 'magmiteExplain') {
        tooltipText = "<img src='" + atSettings.initialise.basepath + "/imgs/mi.png'>";
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>Thats all the help you get.</div></div>";
    } else if (what === 'priorityOrder') {
        const priority = getPriorityOrder();
        tooltipText = ``;
        if (Object.keys(priority).length > 18) tooltipText += `<div class='litScroll'>`;
        tooltipText += `<table class='bdTableSm table table-striped'>
       		<tbody>
            	<tr>
                	<td>Name</td>
                	<td>Line</td>
                	<td>Active</td>
                	<td>Priority</td>
                	<td>Zone</td>
                	<td>End Zone</td>
                	<td>Cell</td>
                	<td>Special</td>
            	</tr>
		`;
        for (var x = 0; x < Object.keys(priority).length; x++) {
            titleText = 'Priority Order';
            tooltipText +=
                `<tr>
					<td>` +
                priority[x].name +
                `</td>
					<td>` +
                priority[x].row +
                `</td>
					<td>` +
                (priority[x].active ? '&#10004;' : '&times;') +
                `</td>
					<td>` +
                priority[x].priority +
                `</td>
                <td>` +
                priority[x].world +
                `</td>
                <td>` +
                (priority[x].name === 'Void Maps' ? priority[x].maxvoidzone : priority[x].endzone) +
                `</td>
                <td>` +
                priority[x].cell +
                `</td>
                <td>` +
                (priority[x].special ? (priority[x].special === '0' ? 'No Special' : mapSpecialModifierConfig[priority[x].special].name) : '') +
                `</td>
				</tr>`;
        }
        tooltipText += `
			</tbody>
		</table>
	</div> `;
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>Close</div></div>";
        ondisplay = function () {
            _verticalCenterTooltip(true);
        };
    } else if (what === 'c2table') {
        titleText = _getChallenge2Info() + ' Table';
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
                number: x + 1,
                percent: getIndividualSquaredReward(c2array[x]) + '%',
                zone: game.c2[c2array[x]],
                percentzone: (100 * (game.c2[c2array[x]] / game.stats.highestLevel.valueTotal())).toFixed(2) + '%',
                c2runner: c2runnerArray.includes(c2array[x]) ? '✅' : '❌',
                color: 0
            };
        }

        if (c3array.length > 0) {
            challengeList.C3s = {
                number: 'Difficulty',
                percent: 'C3 %',
                zone: 'Zone',
                percentzone: '%HZE',
                c2runner: 'C3 Runner',
                color: 0
            };

            for (var x = 0; x < c3array.length; x++) {
                challengeList[c3array[x]] = {
                    number: x + 1,
                    percent: getIndividualSquaredReward(c3array[x]) + '%',
                    zone: game.c2[c3array[x]],
                    percentzone: (100 * (game.c2[c3array[x]] / game.stats.highestRadLevel.valueTotal())).toFixed(2) + '%',
                    c2runner: c3runnerArray.includes(c3array[x]) ? '✅' : '❌',
                    color: 0
                };
            }
        }

        function challengeListcolor() {
            function a(b, c, d) {
                var e = 100 * (game.c2[b] / game.stats.highestLevel.valueTotal());
                challengeList[b].color = e >= c ? 'LIMEGREEN' : e < c && e >= d ? 'GOLD' : e < d && 1 <= e ? '#de0000' : 'DEEPSKYBLUE';
            }
            Object.keys(challengeList).forEach(function (b) {
                null !== game.c2[b] && ('Coordinate' === b ? a(b, 45, 38) : 'Trimp' === b ? a(b, 45, 35) : 'Obliterated' === b ? a(b, 25, 20) : 'Eradicated' === b ? a(b, 14, 10) : 'Mapology' === b ? a(b, 90, 80) : 'Trapper' === b ? a(b, 85, 75) : a(b, 95, 85));
            });
        }
        function c3listcolor() {
            function colorC3(challenge, highPct, midPct) {
                var challengePercent = 100 * (game.c2[challenge] / game.stats.highestRadLevel.valueTotal());
                challengeList[challenge].color = 'DEEPSKYBLUE';
                if (challengePercent >= highPct) challengeList[challenge].color = 'LIMEGREEN';
                else if (challengePercent < highPct && challengePercent >= midPct) challengeList[challenge].color = 'GOLD';
                else if (challengePercent < midPct && 1 <= challengePercent) challengeList[challenge].color = '#de0000';
            }
            Object.keys(challengeList).forEach(function (challenge) {
                if (game.c2[challenge] !== null) {
                    if (challenge === 'Unbalance') colorC3(challenge, 90, 80);
                    else if (challenge === 'Unlucky') colorC3(challenge, 90, 80);
                    else if (challenge === 'Duel') colorC3(challenge, 90, 80);
                    else if (challenge === 'Transmute') colorC3(challenge, 90, 80);
                    else if (challenge === 'Quest') colorC3(challenge, 90, 80);
                    else if (challenge === 'Downsize') colorC3(challenge, 85, 75);
                    else if (challenge === 'Trappapalooza') colorC3(challenge, 75, 60);
                    else if (challenge === 'Wither') colorC3(challenge, 85, 75);
                    else if (challenge === 'Storm') colorC3(challenge, 90, 80);
                    else if (challenge === 'Berserk') colorC3(challenge, 85, 75);
                    else if (challenge === 'Glass') colorC3(challenge, 90, 80);
                    else if (challenge === 'Smithless') colorC3(challenge, 90, 80);
                }
            });
        }
        challengeListcolor();
        c3listcolor();
        tooltipText = ``;
        if (c3array.length > 0) tooltipText += `<div class='litScroll'>`;
        tooltipText += `<table class='bdTableSm table table-striped'>
       		<tbody>
            	<tr>
                	<td>Name</td>
                	<td>Difficulty</td>
                	<td>C2 %</td>
                	<td>Zone</td>
                	<td>%HZE</td>
                	<td>C2 Runner</td>
            	</tr>
		`;
        for (var x = 0; x < Object.keys(challengeList).length; x++) {
            tooltipText +=
                `<tr>
					<td>` +
                Object.keys(challengeList)[x] +
                `</td>
					<td>` +
                challengeList[Object.keys(challengeList)[x]].number +
                `</td>
					<td>` +
                challengeList[Object.keys(challengeList)[x]].percent +
                `</td>
					<td>` +
                challengeList[Object.keys(challengeList)[x]].zone +
                `</td>
					<td bgcolor='black'>
						<font color=` +
                challengeList[Object.keys(challengeList)[x]].color +
                `>` +
                challengeList[Object.keys(challengeList)[x]].percentzone +
                `
					</td>
					<td>` +
                challengeList[Object.keys(challengeList)[x]].c2runner +
                `</td>
				</tr>`;
        }
        tooltipText +=
            `<tr>
					<td>Total</td>
					<td> </td>
					<td>` +
            game.global.totalSquaredReward.toFixed(2) +
            `%</td>
					<td> </td>
					<td></td>
            	</tr>
			</tbody>
		</table>
	</div> `;
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>Close</div></div>";
        ondisplay = function () {
            _verticalCenterTooltip();
        };
    } else if (what === 'resetDefaultSettingsProfiles') {
        titleText = '<b>Loading AutoTrimps Default Profile...</b><p>Current Settings will be lost!';
        tooltipText = '<b>NOTICE:</b> Switching to Default AutoTrimps settings profile!!!! <br>All current settings <b>WILL</b> be lost after this point. <br>You might want to cancel, to go back and save your existing settings first.... <br>This will <b><u>Reset</u></b> the script to factory settings.';
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 10vw' onclick='cancelTooltip(); resetAutoTrimps();'>Reset to Default Profile</div><div style='margin-left: 15%' class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();'>Cancel</div></div>";
    } else if (what === 'setCustomChallenge') {
        titleText = 'Enter Challenge To Run';
        tooltipText = "What challenge would you like to be switched to?<br/><br/><textarea id='setSettingsNameTooltip' style='width: 100%' rows='1'></textarea>";
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 10vw' onclick='cancelTooltip(); testChallenge();'>Import</div><div class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();'>Cancel</div></div>";
        ondisplay = function () {
            document.getElementById('setSettingsNameTooltip').focus();
        };
    } else if (what === 'timeWarp') {
        titleText = 'Time Warp Hours';
        tooltipText = "How many hours of time warp would you like to run?<br/><br/><textarea id='setSettingsNameTooltip' style='width: 100%' rows='1'></textarea>";
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 10vw' onclick='cancelTooltip(); testTimeWarp();'>Activate Time Warp</div><div class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();'>Cancel</div></div>";
        ondisplay = function () {
            document.getElementById('setSettingsNameTooltip').focus();
        };
    } else if (what === 'message') {
        titleText = 'Generic message';
        tooltipText = event;
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 50%' onclick='cancelTooltip();'>OK</div></div>";
    }
    if (what !== null) {
        game.global.lockTooltip = true;
        $elem.style.left = '33.75%';
        $elem.style.top = '25%';
        $elem.style.display = 'block';
        document.getElementById('tipTitle').innerHTML = titleText;
        document.getElementById('tipText').innerHTML = tooltipText;
        document.getElementById('tipCost').innerHTML = costText;
        if (ondisplay !== null) ondisplay();
    }

    if (event === 'downloadSave') {
        // Finish download of AT settings file
        if (what === 'exportAutoTrimps') {
            document.getElementById('downloadLink').click();
            document.getElementById('confirmTooltipBtn').click();
        }
        // Export save file
        tooltip('Export', null, 'update');
        const saveFile = document.getElementById('exportArea').value.replace(/(\r\n|\n|\r|\s)/gm, '');
        let saveGame = JSON.parse(LZString.decompressFromBase64(saveFile));
        document.getElementById('confirmTooltipBtn').click();
        // Pausing save and setting options to my preferences
        if (what === 'ExportAutoTrimps') {
            saveGame.options.menu.pauseGame.enabled = 1;
            saveGame.options.menu.timeAtPause = new Date().getTime();
            saveGame.options.menu.standardNotation.enabled = 0;
            saveGame.options.menu.darkTheme.enabled = 2;
            saveGame.options.menu.disablePause.enabled = 1;
        }
        // Adjust for remaining offline time
        else if (usingRealTimeOffline) {
            if (game.options.menu.autoSave.enabled !== atSettings.autoSave) saveGame.options.menu.autoSave.enabled = atSettings.autoSave;
            const reduceBy = offlineProgress.totalOfflineTime - offlineProgress.ticksProcessed * 100;
            saveGame.global.lastOnline -= reduceBy;
            saveGame.global.portalTime -= reduceBy;
            saveGame.global.zoneStarted -= reduceBy;
            saveGame.global.lastSoldierSentAt -= reduceBy;
            saveGame.global.lastSkeletimp -= reduceBy;
        }
        // Compress file and download
        saveGame = LZString.compressToBase64(JSON.stringify(saveGame));

        var saveName = 'Trimps Save P' + game.global.totalPortals;
        if (game.global.universe == 2 || game.global.totalRadPortals > 0) {
            saveName += ' ' + game.global.totalRadPortals + ' U' + game.global.universe;
        }
        saveName += ' Z' + game.global.world;

        let link = document.createElement('a');
        link.download = saveName + '.txt';
        link.href = 'data:text/plain,' + encodeURIComponent(saveGame);
        link.click();
    }
}

//Loads new AT settings file from string
function loadAutoTrimps() {
    try {
        var importBox = document.getElementById('importBox').value.replace(/[\n\r]/gm, ''),
            autoTrimpsSettings = JSON.parse(importBox);
        if (autoTrimpsSettings === null || autoTrimpsSettings === '') return void debug('Error importing AT settings, the string is empty.', 'profile');
    } catch (c) {
        return void debug('Error importing AT settings, the string is bad. ' + c.message, 'profile');
    }
    debug('Importing new AT settings file...', 'profile');
    resetAutoTrimps(autoTrimpsSettings);
}

//Either sets the AT settings to default or to the ones imported in loadAutoTrimps()
function resetAutoTrimps(autoTrimpsSettings) {
    atSettings.running = false;
    setTimeout(() => {
        localStorage.removeItem('atSettings');
        autoTrimpSettings = autoTrimpsSettings || {};
        var e = document.getElementById('settingsRow');
        e.removeChild(document.getElementById('autoSettings'));
        e.removeChild(document.getElementById('autoTrimpsTabBarMenu'));

        automationMenuSettingsInit();
        initialiseAllTabs();
        initialiseAllSettings();
        saveSettings();
        updateATVersion();
        resetSettingsPortal();
        updateAutoTrimpSettings(true);
        saveSettings();
        localStorage.perkyInputs = autoTrimpSettings.autoAllocatePresets.value;
        localStorage.surkyInputs = autoTrimpSettings.autoAllocatePresets.valueU2;
        localStorage.mutatorPresets = autoTrimpSettings.mutatorPresets.valueU2;
        loadAugustSettings();
        if (typeof MODULES['graphs'].themeChanged === 'function') MODULES['graphs'].themeChanged();

        //Remove the localStorage entries if they are empty and rebuild the GUI to initialise base settings
        if (Object.keys(JSON.parse(localStorage.getItem('perkyInputs'))).length === 1) delete localStorage.perkyInputs;
        if (Object.keys(JSON.parse(localStorage.getItem('surkyInputs'))).length === 1) delete localStorage.surkyInputs;
        MODULES.autoPerks.displayGUI(game.global.universe);
    }, 101);

    if (autoTrimpsSettings) {
        debug('Successfully imported new AT settings...', 'profile');
        ImportExportTooltip('message', 'Successfully imported Autotrimps settings file.');
    } else {
        debug('Successfully reset AT settings to Defaults...', 'profile');
        ImportExportTooltip('message', 'Autotrimps has been successfully reset to its default settings!');
    }
    atSettings.running = true;
}

//Loads the base settings that I want to be the same when loading peoples saves as it will save me time.
function loadAugustSettings() {
    if (atSettings.initialise.basepath !== 'https://localhost:8887/AutoTrimps_Local/') return;
    if (typeof greenworks === 'undefined') autoTrimpSettings.gameUser.value = 'test';
    autoTrimpSettings.downloadSaves.enabled = 0;
    autoTrimpSettings.downloadSaves.enabledU2 = 0;
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
    if (typeof MODULES['graphs'].themeChanged === 'function') MODULES['graphs'].themeChanged();
}

//Process data to google forms to update stats spreadsheet
function pushSpreadsheetData() {
    if (!portalWindowOpen || !gameUserCheck(true)) return;
    const graphData = JSON.parse(localStorage.getItem('portalDataCurrent'))[getportalID()];

    const fluffy_EvoLevel = {
        cap: game.portal.Capable.level,
        prestige: Number(game.global.fluffyPrestige),
        potential: function () {
            return Number(Math.log((0.003 * game.global.fluffyExp) / Math.pow(5, this.prestige) + 1) / Math.log(4));
        },
        level: function () {
            return Number(Math.min(Math.floor(this.potential()), this.cap));
        },
        progress: function () {
            return this.level() === this.cap ? 0 : Number((4 ** (this.potential() - this.level()) - 1) / 3).toFixed(2);
        },
        fluffy: function () {
            return 'E' + this.prestige + 'L' + (this.level() + this.progress());
        }
    };

    const scruffy_Level = {
        firstLevel: 1000,
        growth: 4,
        currentExp: [],
        getExp: function () {
            this.calculateExp();
            return this.currentExp;
        },
        getCurrentExp: function () {
            return game.global.fluffyExp2;
        },
        currentLevel: function () {
            return Math.floor(log10((this.getCurrentExp() / this.firstLevel) * (this.growth - 1) + 1) / log10(this.growth));
        },
        calculateExp: function () {
            var level = this.currentLevel();
            var experience = this.getCurrentExp();
            var removeExp = 0;
            if (level > 0) {
                removeExp = Math.floor(this.firstLevel * ((Math.pow(this.growth, level) - 1) / (this.growth - 1)));
            }
            var totalNeeded = Math.floor(this.firstLevel * ((Math.pow(this.growth, level + 1) - 1) / (this.growth - 1)));
            experience -= removeExp;
            totalNeeded -= removeExp;
            this.currentExp = [level, experience, totalNeeded];
        }
    };

    var heliumGained = game.global.universe === 2 ? game.resources.radon.owned : game.resources.helium.owned;
    var heliumHr = game.stats.heliumHour.value();

    var dailyMods = ' ';
    var dailyPercent = 0;
    if (MODULES['portal'].currentChallenge === 'Daily' && !challengeActive('Daily')) {
        dailyMods = MODULES.portal.dailyMods;
        dailyPercent = MODULES.portal.dailyPercent;
    } else if (challengeActive('Daily')) {
        if (typeof greenworks === 'undefined' || (typeof greenworks !== 'undefined' && process.version > 'v10.10.0')) dailyMods = dailyModifiersOutput().replaceAll('<br>', '|').slice(0, -1);
        dailyPercent = Number(prettify(getDailyHeliumValue(countDailyWeight(game.global.dailyChallenge)))) / 100;
        heliumGained *= 1 + dailyPercent;
        heliumHr *= 1 + dailyPercent;
    }

    const mapCount =
        graphData !== undefined
            ? Object.keys(graphData.perZoneData.mapCount)
                  .filter((k) => graphData.perZoneData.mapCount[k] !== null)
                  .reduce(
                      (a, k) => ({
                          ...a,
                          [k]: graphData.perZoneData.mapCount[k]
                      }),
                      {}
                  )
            : 0;
    const mapTotal =
        graphData !== undefined
            ? Object.keys(mapCount).reduce(function (m, k) {
                  return mapCount[k] > m ? mapCount[k] : m;
              }, -Infinity)
            : 0;
    const mapZone = graphData !== undefined ? Number(Object.keys(mapCount).find((key) => mapCount[key] === mapTotal)) : 0;

    var obj = {
        user: autoTrimpSettings.gameUser.value,
        date: new Date().toISOString(),
        portals: game.global.totalPortals,
        portals_U2: game.global.totalRadPortals,
        helium: game.global.totalHeliumEarned,
        radon: game.global.totalRadonEarned,
        radonBest: game.global.bestRadon,
        hZE: game.stats.highestLevel.valueTotal(),
        hZE_U2: game.stats.highestRadLevel.valueTotal(),
        fluffy: fluffy_EvoLevel.fluffy(),
        scruffy: Number((scruffy_Level.currentLevel() + scruffy_Level.getExp()[1] / scruffy_Level.getExp()[2]).toFixed(3)),
        achievement: game.global.achievementBonus,
        nullifium: game.global.nullifium,
        antenna: game.buildings.Antenna.purchased,
        spire_Assault_Level: autoBattle.maxEnemyLevel,
        spire_Assault_Radon: autoBattle.bonuses.Radon.level,
        spire_Assault_Stats: autoBattle.bonuses.Stats.level,
        spire_Assault_Scaffolding: autoBattle.bonuses.Scaffolding.level,
        frigid: game.global.frigidCompletions,
        mayhem: game.global.mayhemCompletions,
        pandemonium: game.global.pandCompletions,
        desolation: game.global.desoCompletions,
        c2: countChallengeSquaredReward(false, false, true)[0],
        c3: countChallengeSquaredReward(false, false, true)[1],
        cinf: game.global.totalSquaredReward,
        challenge: graphData !== undefined ? graphData.challenge : 'None',
        runtime: formatTimeForDescriptions((getGameTime() - game.global.portalTime) / 1000),
        runtimeMilliseconds: getGameTime() - game.global.portalTime,
        zone: game.global.world,
        voidZone: game.global.universe === 2 ? game.stats.highestVoidMap2.value : game.stats.highestVoidMap.value,
        mapZone: mapZone,
        mapCount: mapTotal,
        voidsCompleted: game.stats.totalVoidMaps.value,
        smithy: game.global.universe === 1 ? 'N/A' : !game.mapUnlocks.SmithFree.canRunOnce && autoBattle.oneTimers.Smithriffic.owned ? game.buildings.Smithy.owned - 2 + ' + 2' : !game.mapUnlocks.SmithFree.canRunOnce ? game.buildings.Smithy.owned - 1 + ' + 1' : game.buildings.Smithy.owned,
        meteorologist: game.global.universe === 1 ? 'N/A' : game.jobs.Meteorologist.owned,
        heliumGained: heliumGained,
        heliumHr: heliumHr,
        fluffyXP: game.stats.bestFluffyExp2.value,
        fluffyHr: game.stats.fluffyExpHour.value(),
        fluffyBest: game.stats.bestFluffyExp2.valueTotal,
        dailyMods: dailyMods,
        dailyPercent: dailyPercent,
        universe: game.global.universe,
        sharpTrimps: game.singleRunBonuses.sharpTrimps.owned,
        goldenMaps: game.singleRunBonuses.goldMaps.owned,
        heliumy: game.singleRunBonuses.heliumy.owned,
        runningChallengeSquared: game.global.runningChallengeSquared,
        mutatedSeeds: game.stats.mutatedSeeds.valueTotal,
        mutatedSeedsLeftover: game.global.mutatedSeeds,
        mutatedSeedsGained: game.stats.mutatedSeeds.value,
        patch: game.global.stringVersion,
        bones: game.global.b
    };

    for (var chall in game.c2) {
        if (!game.challenges[chall].allowU2) {
            obj[chall + '_zone'] = game.c2[chall];
            obj[chall + '_bonus'] = getIndividualSquaredReward(chall);
        } else {
            obj[chall + '_zone'] = game.c2[chall];
            obj[chall + '_bonus'] = getIndividualSquaredReward(chall);
        }
    }

    //Replaces any commas with semicolons to avoid breaking how the spreadsheet parses data.
    for (var item in obj) {
        if (typeof greenworks !== 'undefined' && process.version === 'v10.10.0') continue;
        if (typeof obj[item] === 'string') obj[item] = obj[item].replaceAll(',', ';');
    }

    setTimeout(function () {
        //Data entry ID can easily be found in the URL of the form after setting up a pre-filled link.
        //Haven't found a way to get it from the form itself or a way to automate it so pushing the data as an object instead.
        var data = {
            'entry.1850071841': obj.user, //User
            'entry.815135863': JSON.stringify(obj) //Object
            //'entry.1864995783': new Date().toISOString(), //Timestamp
        };

        var formSuccess = true;
        var formId = '1FAIpQLScTqY2ti8WUwIKK_WOh_X_Oky704HOs_Lt07sCTG2sHCc3quA';
        var queryString = '/formResponse';
        var url = 'https://docs.google.com/forms/d/e/' + formId + queryString;
        //Can't use the form's action URL because it's not a valid URL for CORS requests.
        //Google doesn't allow CORS requests to their forms by the looks of it
        //Using dataType "jsonp" instead of "json" to get around this issue.

        if (formSuccess) {
            // Send request
            $.ajax({
                url: url,
                type: 'POST',
                crossDomain: true,
                header: {
                    'Content-type': 'application/javascript; charset=utf-8'
                },
                data: data,
                dataType: 'jsonp'
            });
        }
    }, 300);
    debug('Spreadsheet update complete.', 'other');
}
