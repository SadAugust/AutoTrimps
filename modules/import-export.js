function importExportTooltip(event, titleText) {
	const eventHandlers = {
		mapSettings: mapSettingsDisplay,
		AutoStructure: autoStructureDisplay,
		AutoJobs: autoJobsDisplay,
		UniqueMaps: uniqueMapsDisplay,
		MessageConfig: messageDisplay,
		DailyAutoPortal: dailyPortalModsDisplay,
		c2Runner: c2RunnerDisplay,
		/* Import Export Functions */
		exportAutoTrimps: _displayExportAutoTrimps,
		importAutoTrimps: _displayImportAutoTrimps,
		forceAutoPortal: _displayPortalForce,
		spireImport: _displaySpireImport,
		priorityOrder: _displayPriorityOrder,
		c2table: _displayC2Table,
		resetDefaultSettingsProfiles: _displayResetDefaultSettingsProfiles,
		disableSettingsProfiles: _displayDisableSettingsProfiles,
		setCustomChallenge: _displaySetCustomChallenge,
		timeWarp: _displayTimeWarp,
		resetPerkPreset: _displayResetPerkPreset,
		hideAutomation: hideAutomationDisplay
	};

	const titleTexts = {
		AutoStructure: 'Configure AutoTrimps AutoStructure',
		AutoJobs: 'Configure AutoTrimps AutoJobs',
		UniqueMaps: 'Unique Maps',
		MessageConfig: 'Message Config',
		DailyAutoPortal: 'Daily Auto Portal',
		c2Runner: _getChallenge2Info() + ' Runner',
		/* Import Export Titles */
		exportAutoTrimps: titleText === 'downloadSave' ? 'downloadSave' : 'Export AutoTrimps Settings',
		importAutoTrimps: 'Import AutoTrimps Settings',
		forceAutoPortal: 'Force Auto Portal',
		spireImport: 'Import Spire Settings',
		priorityOrder: 'Priority Order Table',
		c2table: _getChallenge2Info() + ' Table',
		resetDefaultSettingsProfiles: 'Reset Default Settings',
		disableSettingsProfiles: 'Disable All Settings',
		setCustomChallenge: 'Set Custom Challenge',
		timeWarp: 'Time Warp Hours',
		resetPerkPreset: 'Reset Perk Preset Weights',
		hideAutomation: 'Hide Automation Buttons'
	};

	cancelTooltip();
	let tooltipDiv = document.getElementById('tooltipDiv');
	let tooltipText;
	let costText = '';
	let ondisplay = null;
	if (event !== 'mapSettings') swapClass('tooltipExtra', 'tooltipExtraNone', tooltipDiv);

	if (eventHandlers[event]) {
		titleText = titleTexts[event] || titleText;
		[tooltipDiv, tooltipText, costText, ondisplay] = eventHandlers[event](tooltipDiv, titleText);
	}

	if (event) {
		const tipText = document.getElementById('tipText');
		const tipTitle = document.getElementById('tipTitle');
		const tipCost = document.getElementById('tipCost');

		game.global.lockTooltip = true;
		if (tipText.className !== '') tipText.className = '';
		if (tipText.innerHTML !== tooltipText) tipText.innerHTML = tooltipText;
		if (tipTitle.innerHTML !== titleText) tipTitle.innerHTML = titleText;
		if (tipCost.innerHTML !== costText) tipCost.innerHTML = costText;
		tooltipDiv.style.display = 'block';
		if (typeof ondisplay === 'function') ondisplay();
	}

	if (titleText === 'downloadSave') _downloadSave(event);
}

function _displayImportAutoTrimps(tooltipDiv) {
	const tooltipText = "Import your AutoTrimps setting string to load those settings.<br/><br/><textarea id='importBox' style='width: 100%' rows='5'></textarea>";
	const costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); loadAutoTrimps();'>Import</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";

	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	const ondisplay = function () {
		_verticalCenterTooltip();
		document.getElementById('importBox').focus();
	};

	return [tooltipDiv, tooltipText, costText, ondisplay];
}

function _displayExportAutoTrimps(tooltipDiv) {
	const tooltipText = `This is your AutoTrimp settings save string. There are many like it but this one is yours. 
	Save this save somewhere safe so you can save time next time.<br/><br/>
	<textarea id='exportArea' style='width: 100%' rows='5'>${serializeSettings()}</textarea>`;

	const u2Affix = game.global.totalRadPortals > 0 ? ` ${game.global.totalRadPortals} U${game.global.universe}` : '';
	const saveName = `AT Settings P${game.global.totalPortals}${u2Affix} Z${game.global.world}`;
	const serializedSettings = encodeURIComponent(serializeSettings());

	const costText = `
		<div class='maxCenter'>
			<div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip()'>Got it</div>
			<div id='clipBoardBtn' class='btn btn-success'>Copy to Clipboard</div>
			<a id='downloadLink' target='_blank' download='${saveName}.txt' href='data:text/plain,${serializedSettings}'>
				<div class='btn btn-danger' id='downloadBtn'>Download as File</div>
			</a>
		</div>
	`;

	const ondisplay = () => {
		_verticalCenterTooltip();
		const exportArea = document.getElementById('exportArea');
		const clipBoardBtn = document.getElementById('clipBoardBtn');

		exportArea.select();

		clipBoardBtn.addEventListener('click', () => {
			exportArea.select();
			document.execCommand('copy') || (clipBoardBtn.innerHTML = 'Error, not copied');
		});
	};

	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	return [tooltipDiv, tooltipText, costText, ondisplay];
}

function _displayResetDefaultSettingsProfiles(tooltipDiv) {
	const tooltipText = `This will restore your current AutoTrimps settings to their original values.<br>It is advised to download a copy of your AutoTrimps settings before doing this.<br/><br/>Are you sure you want to do this?`;
	const costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 13vw' onclick='cancelTooltip(); resetAutoTrimps();'>Reset to Default Profile</div><div style='margin-left: 15%' class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();'>Cancel</div></div>";

	const ondisplay = function () {
		_verticalCenterTooltip();
	};

	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	return [tooltipDiv, tooltipText, costText, ondisplay];
}

function _displayDisableSettingsProfiles(tooltipDiv) {
	const tooltipText = `This will adjust the inputs of all of your settings to a disabled state.<br>It is advised to download a copy of your AutoTrimps settings before doing this.<br/><br/>Are you sure you want to do this?`;
	const costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 13vw' onclick='cancelTooltip(); disableAllSettings();'>Reset to Default Profile</div><div style='margin-left: 15%' class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();'>Cancel</div></div>";

	const ondisplay = function () {
		_verticalCenterTooltip();
	};

	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	return [tooltipDiv, tooltipText, costText, ondisplay];
}

function _displayPriorityOrder(tooltipDiv) {
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
		const endZone = item.endzone ? item.endzone : '';
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

	const costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>Close</div></div>";
	const ondisplay = function () {
		_verticalCenterTooltip(true);
	};

	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	return [tooltipDiv, tooltipText, costText, ondisplay];
}

function _displayC2Table(tooltipDiv) {
	const challengeOrders = {
		c2: ['Size', 'Slow', 'Watch', 'Discipline', 'Balance', 'Meditate', 'Metal', 'Lead', 'Nom', 'Toxicity', 'Electricity', 'Coordinate', 'Trimp', 'Obliterated', 'Eradicated', 'Mapology', 'Trapper'],
		c3: ['Unlucky', 'Unbalance', 'Quest', 'Storm', 'Downsize', 'Transmute', 'Duel', 'Wither', 'Glass', 'Smithless', 'Trappapalooza', 'Berserk']
	};

	const runnerLists = {
		c2: c2RunnerChallengeOrder(1),
		c3: c2RunnerChallengeOrder(2)
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

	const COLORS = {
		default: 'DEEPSKYBLUE',
		high: 'LIMEGREEN',
		mid: 'GOLD',
		low: '#de0000'
	};

	const populateHeaders = (type) => {
		challengeList[type] = {
			number: `Difficulty`,
			percent: `${type} %`,
			zone: `Zone`,
			percentzone: `%HZE`,
			c2runner: `${type} Runner`
		};
	};

	let challengeList = {};
	const hze = game.stats.highestLevel.valueTotal();
	const hzeU2 = game.stats.highestRadLevel.valueTotal();

	const processArray = (type, array, runnerList) => {
		if (array.length > 0) populateHeaders(type.toUpperCase());
		const radLevel = type === 'c3';
		const colourPercentages = type === 'c2' ? challengePercentages.c2 : challengePercentages.c3;
		array.forEach((item, index) => {
			const challengePercent = 100 * (game.c2[item] / (radLevel ? hzeU2 : hze));
			const [highPct, midPct] = colourPercentages[item] || colourPercentages['Default'];

			challengeList[item] = {
				number: index + 1,
				percent: `${getIndividualSquaredReward(item)}%`,
				zone: game.c2[item],
				percentzone: `${challengePercent.toFixed(2)}%`,
				c2runner: runnerList.includes(item) ? '✅' : '❌',
				color: getChallengeColor(challengePercent, highPct, midPct)
			};
		});
	};

	function getChallengeColor(challengePercent, highPct, midPct) {
		if (challengePercent >= highPct) return COLORS.high;
		if (challengePercent >= midPct) return COLORS.mid;
		if (challengePercent >= 1) return COLORS.low;
		return COLORS.default;
	}

	Object.keys(challengeOrders).forEach((type) => {
		if (type === 'c3' && !Fluffy.checkU2Allowed()) return;
		let challenges = challengesUnlockedObj(type === 'c2' ? 1 : 2, true, true);
		challenges = filterAndSortChallenges(challenges, 'c2');
		const array = challengeOrders[type].filter((item) => challenges.includes(item));
		processArray(type, array, runnerLists[type]);
	});

	const createTableRow = (key, { number, percent, zone, color, percentzone, c2runner }) => `
		<tr>
			<td>${key}</td>
			<td>${number}</td>
			<td>${percent}</td>
			<td>${zone}</td>
			<td${!['C2', 'C3'].includes(key) ? ` bgcolor='black'><font color=${color}>${percentzone}</font>` : `>${percentzone}`}</td>
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
						<td></td>
						<td>${game.global.totalSquaredReward.toFixed(2)}%</td>
						<td></td>
						<td></td>
						<td></td>
					</tr>
				</tbody>
			</table>
			</div>
		`;
	};

	let tooltipText = createTable(challengeList);
	if (challengeList.C3) tooltipText = `<div class='litScroll'>${tooltipText}`;

	const costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>Close</div></div>";

	const ondisplay = function () {
		_verticalCenterTooltip();
	};

	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	return [tooltipDiv, tooltipText, costText, ondisplay];
}

function _displaySetCustomChallenge(tooltipDiv) {
	const tooltipText = `This will set your current challenge to the challenge you enter.<br/><br/>
	<textarea id='importBox' style='width: 100%' rows='1'></textarea>`;
	const costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 10vw' onclick='cancelTooltip(); testChallenge();'>Import</div><div class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();'>Cancel</div></div>";

	const ondisplay = function () {
		_verticalCenterTooltip();
		document.getElementById('importBox').focus();
	};

	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	return [tooltipDiv, tooltipText, costText, ondisplay];
}

function _displayTimeWarp(tooltipDiv) {
	const tooltipText = `This will time warp for the amount of hours you enter.<br/><br/>
	<textarea id='importBox' style='width: 100%' rows='1'></textarea>`;
	const costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 10vw' onclick='cancelTooltip(); testTimeWarp();'>Activate Time Warp</div><div class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();'>Cancel</div></div>";

	const ondisplay = function () {
		_verticalCenterTooltip();
		document.getElementById('importBox').focus();
	};

	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	return [tooltipDiv, tooltipText, costText, ondisplay];
}

function _downloadSave(what = '') {
	if (what === 'exportAutoTrimps') {
		document.getElementById('downloadLink').click();
		document.getElementById('confirmTooltipBtn').click();
	}

	tooltip('Export', null, 'update');
	const saveFile = document.getElementById('exportArea').value.replace(/(\r\n|\n|\r|\s)/gm, '');
	let saveGame = JSON.parse(LZString.decompressFromBase64(saveFile));
	document.getElementById('confirmTooltipBtn').click();

	if (what === 'exportAutoTrimps') {
		saveGame.options.menu.pauseGame.enabled = 1;
		saveGame.options.menu.pauseGame.timeAtPause = new Date().getTime();
		saveGame.options.menu.standardNotation.enabled = 0;
		saveGame.options.menu.darkTheme.enabled = 2;
		saveGame.options.menu.disablePause.enabled = 1;
	} else if (usingRealTimeOffline) {
		if (game.options.menu.autoSave.enabled !== atSettings.autoSave) {
			saveGame.options.menu.autoSave.enabled = atSettings.autoSave;
		}
		const reduceBy = offlineProgress.totalOfflineTime - offlineProgress.ticksProcessed * 100;
		['lastOnline', 'portalTime', 'zoneStarted', 'lastSoldierSentAt', 'lastSkeletimp'].forEach((key) => {
			saveGame.global[key] -= reduceBy;
		});
	}

	saveGame = LZString.compressToBase64(JSON.stringify(saveGame));

	const u2Affix = game.global.totalRadPortals > 0 ? ` ${game.global.totalRadPortals} U${game.global.universe}` : '';
	const saveName = `Trimps Save P${game.global.totalPortals}${u2Affix} Z${game.global.world}`;

	const link = document.createElement('a');
	link.download = `${saveName}.txt`;
	link.href = `data:text/plain,${encodeURIComponent(saveGame)}`;
	link.click();
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
		localStorage.heirloomInputs = autoTrimpSettings.autoHeirloomStorage.value;
		localStorage.mutatorPresets = autoTrimpSettings.mutatorPresets.valueU2;
		loadAugustSettings();
		if (typeof MODULES['graphs'].themeChanged === 'function') MODULES['graphs'].themeChanged();

		//Remove the localStorage entries if they are empty and rebuild the GUI to initialise base settings
		if (Object.keys(JSON.parse(localStorage.getItem('perkyInputs'))).length === 1) delete localStorage.perkyInputs;
		if (Object.keys(JSON.parse(localStorage.getItem('surkyInputs'))).length === 1) delete localStorage.surkyInputs;
		if (Object.keys(JSON.parse(localStorage.getItem('heirloomInputs'))).length === 1) delete localStorage.heirloomInputs;
		MODULES.autoPerks.displayGUI(game.global.universe);
		hideAutomationButtons();
	}, 101);

	const message = autoTrimpsSettings ? 'Successfully imported new AT settings...' : 'Successfully reset AT settings to Defaults...';
	const tooltipMessage = autoTrimpsSettings ? 'Successfully imported Autotrimps settings file.' : 'Autotrimps has been successfully reset to its default settings!';
	const title = autoTrimpsSettings ? 'Settings Imported' : 'Settings Reset';

	debug(message, 'profile');
	tooltip(`${title}`, `customText`, `lock`, `${tooltipMessage}`, false, `center`);
	_verticalCenterTooltip();
	document.getElementById('tipCost').children[0].id = 'tipCostID';
	document.getElementById('tipCostID').focus();
	atSettings.running = true;
}

function disableAllSettings() {
	//Disable all settings
	for (const setting in autoTrimpSettings) {
		if (['ATversion', 'ATversionChangelog', 'gameUser'].includes(setting)) continue;
		const item = autoTrimpSettings[setting];
		if (item.type === 'mazDefaultArray') continue;

		if (setting === 'spamMessages') {
			item.value.show = false;
		} else if (item.type === 'boolean') {
			if (item.enabled) item.enabled = false;
			if (item.enabledU2) item.enabledU2 = false;
		} else if (item.type === 'dropdown') {
			if (item.dropdown) item.dropdown = 'Off';
			if (item.dropdownU2) item.dropdownU2 = 'Off';
		} else if (item.type === 'mazArray') {
			if (item.value && item.value[0] && item.value[0].active) {
				item.value[0].active = false;
			}
			if (item.valueU2 && item.valueU2[0] && item.valueU2[0].active) {
				item.valueU2[0].active = false;
			}
		} else if (typeof item.value !== 'undefined' || typeof item.valueU2 !== 'undefined') {
			if (item.value) item.value = 0;
			if (item.valueU2) item.valueU2 = 0;
		}
	}

	saveSettings();

	const title = 'Settings Disabled';
	const message = 'Successfully disabled all AutoTrimps settings.';
	const tooltipMessage = 'AutoTrimps settings have been successfully disabled!';

	debug(message, 'profile');
	tooltip(`${title}`, `customText`, `lock`, `${tooltipMessage}`, false, `center`);
	_verticalCenterTooltip();
	document.getElementById('tipCost').children[0].id = 'tipCostID';
	document.getElementById('tipCostID').focus();
}

function makeAutoPortalHelpTooltip() {
	let tooltipText = '';

	tooltipText += `<p>Auto Portal has a priority as to what it will portal into and if that isn't possible it'll try to portal into the next and so forth.</p>`;
	//C2/C3s
	tooltipText += `<p>To start with if the <b>${_getChallenge2Info()} Runner</b> setting is enabled it will check and see if all of your ${_getChallenge2Info()}'s are up to date according to your settings.</p>`;
	//Dailies
	tooltipText += `<p>Afterwards if the <b>Auto Start Daily</b> setting is enabled then it will portal into a Daily if there are any available to run.</p>`;
	//Fillers
	tooltipText += `<p>If neither of the options above are run then it will portal into the challenge that you have selected in the <b>Auto Portal</b> setting. If that is disabled then it will portal into a challengeless run.</p>`;

	tooltip('Auto Portal Info', 'customText', 'lock', tooltipText, false, 'center');
	_verticalCenterTooltip(true);
}

function makeFarmingDecisionHelpTooltip() {
	let tooltipText = '';

	tooltipText += `<p>Mapping has a priority as to what it will try to run and in what order. This is a static list and can't be modified with the exception of challenge settings only allowing certain settings to be run.</p>`;
	tooltipText += `<p>First it will check to see if you're running a setting and if you are then it will continue until that settings farming has been completed. Afterwards it will go through all of the settings (<b>challenge specific settings will only be shown when running that challenge</b>) in this order:</p>`;
	if (game.global.universe === 1) {
		if (challengeActive('Balance')) tooltipText += `<p><b>Balance Destacking</b></p>`;
		if (challengeActive('Daily')) tooltipText += `<p><b>Daily Bloodthirst Destacking</b></p>`;
		if (!challengeActive('Frugal')) tooltipText += `<p><b>Prestige Climb</b></p>`;
		tooltipText += `<p>Prestige Raiding</p>`;
		if (game.stats.highestLevel.valueTotal() >= 125) tooltipText += `<p>Bionic Raiding</p>`;
		tooltipText += `<p>Map Farm</p>`;
		tooltipText += `<p>HD Farm</p>`;
		tooltipText += `<p>Void Maps</p>`;
		if (challengeActive('Experience')) tooltipText += `<p><b><i>Experience Farm</b></i></p>`;
		tooltipText += `<p>Map Bonus</p>`;
		if (challengeActive('Toxicity')) tooltipText += `<p><b><i>Toxicity Farm</b></i></p>`;
	}

	if (game.global.universe === 2) {
		if (challengeActive('Unbalance')) tooltipText += `<p><b>Unbalance Destacking</b></p>`;
		if (challengeActive('Daily')) tooltipText += `<p><b>Daily Bloodthirst Destacking</b></p>`;
		if (challengeActive('Quest')) tooltipText += `<p><b>Quest Farm</b></p>`;
		if (challengeActive('Storm')) tooltipText += `<p><b>Storm Destacking</b></p>`;
		if (challengeActive('Pandemonium')) tooltipText += `<p><b>Pandemonium Destacking</b></p>`;
		if (challengeActive('Pandemonium')) tooltipText += `<p><b>Pandemonium Equipment Farming</b></p>`;
		if (challengeActive('Desolation')) tooltipText += `<p><b>Desolation Gear Scumming</b></p>`;
		if (challengeActive('Desolation')) tooltipText += `<p><b>Desolation Destacking</b></p>`;
		tooltipText += `<p><b>Prestige Climb</b></p>`;
		tooltipText += `<p>Prestige Raiding</p>`;
		tooltipText += `<p>Smithy Farm</p>`;
		tooltipText += `<p>Map Farm</p>`;
		tooltipText += `<p>Tribute Farm</p>`;
		tooltipText += `<p>Worshipper Farm</p>`;
		if (challengeActive('Quagmire')) tooltipText += `<p>Quagmire Farm</p>`;
		if (challengeActive('Insanity')) tooltipText += `<p>Insanity Farm</p>`;
		if (challengeActive('Alchemy')) tooltipText += `<p>Alchemy Farm</p>`;
		if (challengeActive('Hypothermia')) tooltipText += `<p>Hypothermia Farm</p>`;
		tooltipText += `<p>HD Farm (and Hit Survived)</p>`;
		tooltipText += `<p>Void Maps</p>`;
		tooltipText += `<p>Map Bonus</p>`;
		if (challengeActive('Wither')) tooltipText += `<p><b><i>Wither Farm</b></i></p>`;
		if (challengeActive('Mayhem')) tooltipText += `<p><b><i>Mayhem Destacking</b></i></p>`;
		if (challengeActive('Glass')) tooltipText += `<p><b><i>Glass Destacking</b></i></p>`;
		if (challengeActive('Smithless')) tooltipText += `<p><b><i>Smithless Farm</b></i></p>`;
	}

	tooltip('Auto Maps Priority', 'customText', 'lock', tooltipText, false, 'center');
	_verticalCenterTooltip(true);
}

function makeFragmentDecisionHelpTooltip() {
	let tooltipText = '';

	tooltip('Fragment Decision Info', 'customText', 'lock', tooltipText, false, 'center');
	_verticalCenterTooltip(true);
}

function makeAdditionalInfoTooltip(mouseover) {
	let tooltipText = '';

	if (mouseover) {
		tooltipText = 'tooltip(' + '"Additional Info", ' + '"customText", ' + 'event, ' + '"';
	}

	if (game.permaBoneBonuses.voidMaps.owned > 0) {
		tooltipText += `<p><b>Void</b><br>`;
		tooltipText += `The progress you have towards the <b>Void Maps</b> permanent bone upgrade counter.</p>`;
	}

	tooltipText += `<p><b>AL (Auto Level)</b><br>`;
	tooltipText += `L: The ideal map level for loot gains.<br>`;
	tooltipText += `S: The ideal map level for a mixture of speed and loot gains. Auto Maps will use this when gaining Map Bonus stacks through the Map Bonus setting.`;
	tooltipText += `<br>${farmCalcGetMapDetails()}</p>`;
	const refreshTimer = usingRealTimeOffline ? 30 : 5;
	const remainingTime = Math.ceil(refreshTimer - ((atSettings.intervals.counter / 10) % refreshTimer)) || refreshTimer;
	tooltipText += `<p>The data shown is updated every ${refreshTimer} seconds. <b>${remainingTime}s</b> until the next update.</p>`;
	tooltipText += `<p>Click this button while in the map chamber to either select your already purchased map or automatically set the inputs to the desired values.</p>`;

	if (game.global.universe === 1 && game.jobs.Amalgamator.owned > 0) {
		tooltipText += `<p><b>Breed Timer (B)</b><br>`;
		tooltipText += `The breeding time of your trimps, used to identify how long your <b>Anticipation</b> timer will be if you were to send an army to fight.</p>`;
	} else if (game.global.universe === 2 && getPerkLevel('Tenacity') > 0) {
		tooltipText += `<p><b>Tenacity Timer (T)</b><br>`;
		tooltipText += `Your current tenacity timer in minutes.</p>`;
	}

	if (mouseover) {
		tooltipText += '")';
		return tooltipText;
	} else {
		tooltip('Additional Info Tooltip', 'customText', 'lock', tooltipText, false, 'center');
		_verticalCenterTooltip(true);
	}
}

function makeAdditionalInfo() {
	//Void, AutoLevel, Breed Timer, Tenacity information
	let lineBreak = ` | `;
	let description = ``;

	if (game.permaBoneBonuses.voidMaps.owned > 0) {
		let voidValue = game.permaBoneBonuses.voidMaps.owned === 10 ? Math.floor(game.permaBoneBonuses.voidMaps.tracker / 10) : game.permaBoneBonuses.voidMaps.tracker / 10;
		description += `V: ${voidValue}/10`;
		description += lineBreak;
	}

	description += `AL: (L:${hdStats.autoLevelLoot} S:${hdStats.autoLevelSpeed})`;

	if (game.global.universe === 1 && game.jobs.Amalgamator.owned > 0) {
		const breedTimer = Math.floor((getGameTime() - game.global.lastSoldierSentAt) / 1000);
		description += lineBreak;
		description += `B: ${breedTimer.toFixed(0)}s`;
	}
	//Tenacity timer when you have tenacity
	else if (game.global.universe === 2 && getPerkLevel('Tenacity') > 0) {
		description += lineBreak;
		description += `T: ${Math.floor(game.portal.Tenacity.getTime())}m`;
	}

	return description;
}

/* 
raspberry pi related setting changes
Swaps base settings to improve performance & so that I can't accidentally pause.
Shouldn't impact anybody else that uses AT as they'll never set the gameUser setting to SadAugust. 
*/
function _raspberryPiSettings() {
	if (autoTrimpSettings.gameUser.value !== 'SadAugust') return;

	if (navigator.oscpu === 'Linux armv7l') {
		game.options.menu.hotkeys.enabled = 0;
		game.options.menu.progressBars.enabled = 0;
		game.options.menu.showHeirloomAnimations.enabled = 0;
	} else {
		game.options.menu.hotkeys.enabled = 1;
		game.options.menu.progressBars.enabled = 2;
		game.options.menu.showHeirloomAnimations.enabled = 1;
	}
}

//Loads the base settings that I want to be the same when loading peoples saves as it will save me time.
function loadAugustSettings() {
	_raspberryPiSettings();
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

	game.options.menu.achievementPopups.enabled = 0;
	game.options.menu.voidPopups.enabled = 0;
	game.options.menu.confirmhole.enabled = 0;

	let toggles = ['darkTheme', 'standardNotation', 'hotkeys'];
	for (let i in toggles) {
		let setting = game.options.menu[toggles[i]];
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
			const level = this.currentLevel();
			let experience = this.getCurrentExp();
			let removeExp = 0;
			if (level > 0) {
				removeExp = Math.floor(this.firstLevel * ((Math.pow(this.growth, level) - 1) / (this.growth - 1)));
			}
			let totalNeeded = Math.floor(this.firstLevel * ((Math.pow(this.growth, level + 1) - 1) / (this.growth - 1)));
			experience -= removeExp;
			totalNeeded -= removeExp;
			this.currentExp = [level, experience, totalNeeded];
		}
	};

	let heliumGained = game.global.universe === 2 ? game.resources.radon.owned : game.resources.helium.owned;
	let heliumHr = game.stats.heliumHour.value();

	let dailyMods = ' ';
	let dailyPercent = 0;

	if (MODULES.portal.currentChallenge === 'Daily' && !challengeActive('Daily')) {
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

	let obj = {
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

	for (let chall in game.c2) {
		if (!game.challenges[chall].allowU2) {
			obj[chall + '_zone'] = game.c2[chall];
			obj[chall + '_bonus'] = getIndividualSquaredReward(chall);
		} else {
			obj[chall + '_zone'] = game.c2[chall];
			obj[chall + '_bonus'] = getIndividualSquaredReward(chall);
		}
	}

	//Replaces any commas with semicolons to avoid breaking how the spreadsheet parses data.
	for (let item in obj) {
		if (typeof greenworks !== 'undefined' && process.version === 'v10.10.0') continue;
		if (typeof obj[item] === 'string') obj[item] = obj[item].replaceAll(',', ';');
	}

	//Data entry ID can easily be found in the URL of the form after setting up a pre-filled link.
	//Haven't found a way to get it from the form itself or a way to automate it so pushing the data as an object instead.
	const data = {
		'entry.1850071841': obj.user,
		'entry.815135863': JSON.stringify(obj)
	};

	const formId = '1FAIpQLScTqY2ti8WUwIKK_WOh_X_Oky704HOs_Lt07sCTG2sHCc3quA';
	const queryString = '/formResponse';
	const url = `https://docs.google.com/forms/d/e/${formId}${queryString}`;

	$.ajax({
		url: url,
		type: 'POST',
		crossDomain: true,
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		},
		data: data,
		dataType: 'jsonp'
	});
	debug(`Spreadsheet upload complete.`);
}

function makeAutomapStatusTooltip(mouseover = false) {
	const mapStacksSetting = getPageSetting('mapBonusStacks');
	const mapStacksValue = mapStacksSetting > 0 ? mapStacksSetting : 0;
	const hdFarmSetting = getPageSetting('mapBonusRatio');
	const hdFarmValue = hdFarmSetting > 0 ? hdFarmSetting : '∞';

	const mapStacksText = `Will run maps to get up to <i>${mapStacksValue}</i> Map Bonus stacks when World HD Ratio is greater than <i>${prettify(hdFarmValue)}</i>.`;
	const hdRatioText = 'HD Ratio is enemyHealth to yourDamage ratio, effectively hits to kill an enemy. The enemy health check is based on the highest health enemy in the map/zone.';
	const hitsSurvivedText = `Hits Survived is the ratio of hits you can survive against the highest damaging enemy in the map/zone${game.global.universe === 1 ? ' (subtracts Trimp block from that value)' : ''}.`;
	const hitsSurvived = prettify(hdStats.hitsSurvived);
	const hitsSurvivedVoid = prettify(hdStats.hitsSurvivedVoid);
	const hitsSurvivedSetting = targetHitsSurvived();
	const hitsSurvivedValue = hitsSurvivedSetting > 0 ? hitsSurvivedSetting : '∞';
	let tooltipText = '';

	if (mouseover) {
		tooltipText = 'tooltip(' + '"Auto Maps Status", ' + '"customText", ' + 'event, ' + '"';
	}

	tooltipText += 'Variables that control the current state and target of Automaps.<br>' + 'Values in <b>bold</b> are dynamically calculated based on current zone and activity.<br>' + 'Values in <i>italics</i> are controlled via AT settings (you can change them).<br>';
	if (game.global.universe === 2) {
		if (!game.portal.Equality.radLocked)
			tooltipText += `<br>\
		If you have the Auto Equality setting set to <b>Auto Equality: Advanced</b> then all calculations will factor expected equality value into them.<br>`;
	}

	tooltipText += `<br><b>Hits Survived info</b><br>${hitsSurvivedText}<br>Hits Survived: <b>${hitsSurvived}</b> / <i>${hitsSurvivedValue}</i><br>Void Hits Survived: <b>${hitsSurvivedVoid}</b><br>`;

	//Map Setting Info
	tooltipText += `<br><b>Mapping info</b><br>`;
	if (mapSettings.shouldRun) {
		tooltipText += `Farming Setting: <b>${mapSettings.mapName}</b><br>`;
		tooltipText += `Map Level: <b>${mapSettings.mapLevel}</b><br>`;
		tooltipText += `Auto Level: <b>${mapSettings.autoLevel}</b><br>`;
		if (mapSettings.settingIndex) tooltipText += `Line Run: <b>${mapSettings.settingIndex}</b>${mapSettings.priority ? ` Priority: <b>${mapSettings.priority}</b>` : ``}<br>`;
		tooltipText += `Special: <b>${mapSettings.special !== undefined && mapSettings.special !== '0' ? mapSpecialModifierConfig[mapSettings.special].name : 'None'}</b><br>`;
		tooltipText += `Wants To Run: ${mapSettings.shouldRun.toString().charAt(0).toUpperCase() + mapSettings.shouldRun.toString().slice(1)}<br>`;
		tooltipText += `Repeat: ${mapSettings.repeat}`;
	} else {
		tooltipText += `Not running`;
	}

	tooltipText += `<br>`;

	const availableStances = unlockedStances();
	const voidStance = availableStances.includes('S') && whichScryVoidMaps();
	const stanceInfo = game.global.universe === 1 && game.stats.highestLevel.valueTotal() >= 60 ? `(in X formation) ` : '';
	const stanceInfoVoids = game.global.universe === 1 ? (availableStances ? `(in S formation) ` : availableStances.includes('D') ? `(in D formation) ` : stanceInfo) : '';

	tooltipText += `<br><b>HD Ratio Info</b><br>`;
	tooltipText += `${hdRatioText}<br>`;
	tooltipText += `World HD Ratio ${stanceInfo}<b>${prettify(hdStats.hdRatio)}</b><br>`;
	tooltipText += `Map HD Ratio ${stanceInfo}<b>${prettify(hdStats.hdRatioMap)}</b><br>`;
	tooltipText += `Void HD Ratio ${stanceInfoVoids}<b>${prettify(hdStats.hdRatioVoid * (voidStance ? 2 : 1))}</b><br>`;
	tooltipText += `${mapStacksText}<br>`;

	if (mouseover) {
		return tooltipText + '")';
	} else {
		tooltip('Auto Maps Status', 'customText', 'lock', tooltipText, false, 'center');
		_verticalCenterTooltip(true);
	}
}

function makeResourceTooltip(mouseover) {
	const resource = game.global.universe === 2 ? 'Radon' : 'Helium';
	const resourceHr = game.global.universe === 2 ? 'Rn' : 'He';
	const resourceOwned = game.resources[resource.toLowerCase()].owned;
	const resourceEarned = game.global[`total${resource}Earned`];
	const resourceLeftover = game.global[resource.toLowerCase() + 'Leftover'];
	const resourceHrValue = game.stats.heliumHour.value();

	let getPercent = (resourceHrValue / (resourceEarned - resourceOwned)) * 100;
	let lifetime = (resourceOwned / (resourceEarned - resourceOwned)) * 100;
	const resourceHrMsg = getPercent > 0 ? getPercent.toFixed(3) : 0;
	const lifeTimeMsg = (lifetime > 0 ? lifetime.toFixed(3) : 0) + '%';

	let tooltipText = '';

	if (mouseover) {
		tooltipText = 'tooltip(' + `\"${resource} per hour Info\",` + '"customText", ' + 'event, ' + '"';
	}

	tooltipText += `<b>${resource} per hour</b>: ${resourceHrMsg}<br>` + `Current ${resource} per hour % out of Lifetime ${resourceHr} (not including current+unspent).<br> 0.5% is an ideal peak target. This can tell you when to portal... <br>` + `<b>${resource}</b>: ${lifeTimeMsg}<br>` + `Current run total ${resource} / earned / lifetime ${resourceHr} (not including current)<br>`;

	if (trimpStats.isDaily) {
		let helium = resourceHrValue / (resourceEarned - (resourceLeftover + resourceOwned));
		helium *= 100 + getDailyHeliumValue(countDailyWeight());
		tooltipText += `<b>After Daily ${resource} per hour</b>: ${helium.toFixed(3)}%`;
	}

	if (mouseover) {
		return tooltipText + '")';
	} else {
		tooltip(`${resource} per hour info`, 'customText', 'lock', tooltipText, false, 'center');
		_verticalCenterTooltip(true);
	}
}

function _displayResetPerkPreset(tooltipDiv) {
	const tooltipText = `This will restore your selected preset to its original values.<br><br/>Are you sure you want to do this?`;
	const costText = `<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 13vw' onclick='cancelTooltip(); fillPreset${MODULES.autoPerks.loaded}(perkCalcPreset(), true);'>Reset to Preset Defaults</div><div style='margin-left: 15%' class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();'>Cancel</div></div>`;

	const ondisplay = function () {
		if (typeof _verticalCenterTooltip === 'function') _verticalCenterTooltip(true);
		else verticalCenterTooltip(true);
	};

	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	return [tooltipDiv, tooltipText, costText, ondisplay];
}

function _displayPortalForce(tooltipDiv) {
	if (!game.global.portalActive) return;

	const hze = game.stats.highestLevel.valueTotal();
	let tooltipText = `<p>Are you sure you want to Auto Portal?</p>`;
	if (game.global.runningChallengeSquared) tooltipText += `<p>If you select a <b>Force Portal After Voids</b> option this will abandon your ${_getChallenge2Info()} before running them.</p>`;

	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	const ondisplay = function () {
		if (typeof _verticalCenterTooltip === 'function') _verticalCenterTooltip(true);
		else verticalCenterTooltip(true);
	};

	let costText = "<div class='maxCenter'>";
	costText += "<div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); autoPortalForce();'>Force Portal</div>";
	costText += "<div class='btn btn-success' onclick='cancelTooltip(); autoPortalForce(true);'>Force Portal After Voids</div>";
	if (currSettingUniverse === 1 && hze >= 230) costText += "<div class='btn btn-warning' onclick='cancelTooltip(); autoPortalForce(true, true);'>Force Portal After Poison Voids</div>";
	costText += "<div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div>";

	costText += '</div>';

	return [tooltipDiv, tooltipText, costText, ondisplay];
}
