function ImportExportTooltip(what, event) {
	cancelTooltip();

	if (game.global.lockTooltip) return;

	const tooltipDiv = document.getElementById('tooltipDiv');
	let titleText = what;
	let tooltipText;
	let costText = '';

	if (document.getElementById('tipTitle').innerHTML === 'Spire Assault') autoBattle.help();

	swapClass('tooltipExtra', 'tooltipExtraNone', tooltipDiv);
	let ondisplay = null;

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
		tooltipText = _displayPriorityOrder();
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>Close</div></div>";
		ondisplay = function () {
			_verticalCenterTooltip(true);
		};
	} else if (what === 'c2table') {
		titleText = _getChallenge2Info() + ' Table';
		tooltipText = _displayC2Table();

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
		tooltipDiv.style.left = '33.75%';
		tooltipDiv.style.top = '25%';
		tooltipDiv.style.display = 'block';
		document.getElementById('tipTitle').innerHTML = titleText;
		document.getElementById('tipText').innerHTML = tooltipText;
		document.getElementById('tipCost').innerHTML = costText;
		ondisplay && ondisplay();
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
			if (game.options.menu.autoSave.enabled !== atSettings.autoSave) {
				saveGame.options.menu.autoSave.enabled = atSettings.autoSave;
			}
			const reduceBy = offlineProgress.totalOfflineTime - offlineProgress.ticksProcessed * 100;
			['lastOnline', 'portalTime', 'zoneStarted', 'lastSoldierSentAt', 'lastSkeletimp'].forEach((key) => {
				saveGame.global[key] -= reduceBy;
			});
		}
		// Compress file and download
		saveGame = LZString.compressToBase64(JSON.stringify(saveGame));

		let saveName = 'Trimps Save P' + game.global.totalPortals;
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

function _displayPriorityOrder() {
	const priority = getPriorityOrder();
	let tooltipText = Object.keys(priority).length > 18 ? `<div class='litScroll'>` : '';
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

	Object.keys(priority).forEach((key, x) => {
		const item = priority[x];
		const special = item.special ? (item.special === '0' ? 'No Special' : mapSpecialModifierConfig[item.special].name) : '';
		const endZone = item.name === 'Void Maps' ? item.maxvoidzone : item.endzone ? item.endzone : '';
		const active = item.active ? '&#10004;' : '&times;';

		tooltipText += `
            <tr>
                <td>${item.name}</td>
                <td>${item.row}</td>
                <td>${active}</td>
                <td>${item.priority}</td>
                <td>${item.world}</td>
                <td>${endZone}</td>
                <td>${item.cell}</td>
                <td>${special}</td>
            </tr>
        `;
	});

	tooltipText += `
        </tbody>
    </table>
    </div> `;

	return tooltipText;
}

function _displayC2Table() {
	let tooltipText = ``;
	const challengeOrders = {
		c2: ['Size', 'Slow', 'Watch', 'Discipline', 'Balance', 'Meditate', 'Metal', 'Lead', 'Nom', 'Toxicity', 'Electricity', 'Coordinate', 'Trimp', 'Obliterated', 'Eradicated', 'Mapology', 'Trapper'],
		c3: ['Unlucky', 'Unbalance', 'Quest', 'Storm', 'Downsize', 'Transmute', 'Duel', 'Wither', 'Glass', 'Smithless', 'Trappapalooza', 'Berserk']
	};

	const runnerLists = {
		c2: ['Size', 'Slow', 'Watch', 'Discipline', 'Balance', 'Meditate', 'Metal', 'Lead', 'Nom', 'Toxicity', 'Electricity', 'Mapology'],
		c3: ['Unlucky', 'Unbalance', 'Quest', 'Storm', 'Downsize', 'Duel', 'Smithless']
	};

	const challengePercentages = {
		c2: {
			Coordinate: [45, 38],
			Trimp: [45, 35],
			Obliterated: [25, 20],
			Eradicated: [14, 10],
			Mapology: [90, 80],
			Trapper: [85, 75],
			Default: [95, 85]
		},
		c3: {
			Downsize: [80, 70],
			Duel: [85, 75],
			Trappapalooza: [75, 60],
			Wither: [85, 75],
			Berserk: [85, 75],
			Smithless: [80, 70],
			Default: [90, 80]
		}
	};

	let challengeList = {};

	const populateHeaders = (type) => {
		challengeList[type] = {
			number: `Difficulty`,
			percent: `${type} %`,
			zone: `Zone`,
			percentzone: `%HZE`,
			c2runner: `${type} Runner`,
			color: 0
		};
	};

	const processArray = (type, array, runnerList) => {
		const radLevel = type === 'c3';
		runList = array || [];
		if (array.length > 0) populateHeaders(type.toUpperCase());
		array.forEach((item, index) => {
			challengeList[item] = {
				number: index + 1,
				percent: getIndividualSquaredReward(item) + '%',
				zone: game.c2[item],
				percentzone: (100 * (game.c2[item] / (radLevel ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal()))).toFixed(2) + '%',
				c2runner: runnerList.includes(item) ? '✅' : '❌',
				color: 0
			};
		});
	};

	Object.keys(challengeOrders).forEach((type) => {
		let challenges = challengesUnlockedObj(type === 'c2' ? 1 : 2, true, true);
		challenges = filterAndSortChallenges(challenges, 'c2');
		const array = challengeOrders[type].filter((item) => challenges.includes(item));
		processArray(type, array, runnerLists[type]);
	});

	const COLORS = {
		default: 'DEEPSKYBLUE',
		high: 'LIMEGREEN',
		mid: 'GOLD',
		low: '#de0000'
	};

	function getChallengeColor(challengePercent, highPct, midPct) {
		if (challengePercent >= highPct) return COLORS.high;
		if (challengePercent >= midPct) return COLORS.mid;
		if (challengePercent >= 1) return COLORS.low;
		return COLORS.default;
	}

	function updateChallengeColor(challenge, highPct, midPct, highestLevel) {
		const challengePercent = 100 * (game.c2[challenge] / highestLevel);
		const color = getChallengeColor(challengePercent, highPct, midPct);
		challengeList[challenge].color = color;
	}

	function updateChallengeListColor(challengePct, highestLevel) {
		Object.keys(challengeList).forEach((challenge) => {
			if (game.c2[challenge] !== null) {
				const [highPct, midPct] = challengePct[challenge] || challengePct['Default'];
				updateChallengeColor(challenge, highPct, midPct, highestLevel);
			}
		});
	}

	Object.keys(challengePercentages).forEach((type) => {
		const highestLevel = type === 'c2' ? game.stats.highestLevel.valueTotal() : game.stats.highestRadLevel.valueTotal();
		updateChallengeListColor(challengePercentages[type], highestLevel);
	});

	const createTableRow = (key, { number, percent, zone, color, percentzone, c2runner }) => `
		<tr>
			<td>${key}</td>
			<td>${number}</td>
			<td>${percent}</td>
			<td>${zone}</td>
			<td bgcolor='black'><font color=${color}>${percentzone}</td>
			<td>${c2runner}</td>
		</tr>
	`;

	const createTable = (challengeList) => {
		const rows = Object.keys(challengeList).map((key) => createTableRow(key, challengeList[key]));
		return `
			<table class='bdTableSm table table-striped'>
				<tbody>
					${rows.join('')}
					<tr>
						<td>Total</td>
						<td> </td>
						<td>${game.global.totalSquaredReward.toFixed(2)}%</td>
						<td> </td>
						<td></td>
					</tr>
				</tbody>
			</table>
			</div>
		`;
	};

	tooltipText = createTable(challengeList);

	if (challengeList.C3) tooltipText = `<div class='litScroll'>${tooltipText}`;

	return tooltipText;
}

//Loads new AT settings file from string
function loadAutoTrimps() {
	let importBox, autoTrimpsSettings;
	try {
		importBox = document.getElementById('importBox').value.replace(/[\n\r]/gm, '');
		autoTrimpsSettings = JSON.parse(importBox);
		if (autoTrimpsSettings === null || autoTrimpsSettings === '') return void debug(`Error importing AT settings, the string is empty.`, 'profile');
	} catch (error) {
		return debug(`Error importing AT settings, the string is bad. ${error.message}`, 'profile');
	}

	if (!autoTrimpsSettings) {
		return debug(`Error importing AT settings, the string is empty.`, 'profile');
	}
	debug(`Importing new AT settings file...`, 'profile');
	resetAutoTrimps(autoTrimpsSettings);
}

//Either sets the AT settings to default or to the ones imported in loadAutoTrimps()
function resetAutoTrimps(autoTrimpsSettings) {
	atSettings.running = false;
	setTimeout(() => {
		localStorage.removeItem('atSettings');
		autoTrimpSettings = autoTrimpsSettings || {};
		const settingsRow = document.getElementById('settingsRow');
		['autoSettings', 'autoTrimpsTabBarMenu'].forEach((id) => settingsRow.removeChild(document.getElementById(id)));

		automationMenuSettingsInit();
		initialiseAllTabs();
		initialiseAllSettings();
		saveSettings();
		updateATVersion();
		_setButtonsPortal();
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

	const message = autoTrimpsSettings ? 'Successfully imported new AT settings...' : 'Successfully reset AT settings to Defaults...';
	const tooltipMessage = autoTrimpsSettings ? 'Successfully imported Autotrimps settings file.' : 'Autotrimps has been successfully reset to its default settings!';

	debug(message, 'profile');
	ImportExportTooltip('message', tooltipMessage);
	atSettings.running = true;
}

//Loads the base settings that I want to be the same when loading peoples saves as it will save me time.
function loadAugustSettings() {
	if (atSettings.initialise.basepath !== 'https://localhost:8887/AutoTrimps_Local/') return;
	if (typeof greenworks === 'undefined') autoTrimpSettings.gameUser.value = 'test';
	autoTrimpSettings.downloadSaves.enabled = 0;
	autoTrimpSettings.downloadSaves.enabledU2 = 0;
	saveSettings();
	game.options.menu.showAlerts.enabled = 0;
	game.options.menu.useAverages.enabled = 1;
	game.options.menu.showFullBreed.enabled = 1;
	game.options.menu.darkTheme.enabled = 2;
	game.options.menu.standardNotation.enabled = 0;
	game.options.menu.disablePause.enabled = 1;
	game.options.menu.hotkeys.enabled = 1;
	game.options.menu.timestamps.enabled = 2;
	game.options.menu.boneAlerts.enabled = 0;
	game.options.menu.romanNumerals.enabled = 0;

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
	debug(`Spreadsheet update complete.`, 'other');
}
