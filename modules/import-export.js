function importExportTooltip(event, titleText, extraParam, extraParam2) {
	const eventHandlers = {
		mapSettings: typeof mapSettingsDisplay === 'function' ? mapSettingsDisplay : null,
		AutoStructure: typeof autoStructureDisplay === 'function' ? autoStructureDisplay : null,
		AutoJobs: typeof autoJobsDisplay === 'function' ? autoJobsDisplay : null,
		UniqueMaps: typeof uniqueMapsDisplay === 'function' ? uniqueMapsDisplay : null,
		MessageConfig: typeof messageDisplay === 'function' ? messageDisplay : null,
		DailyAutoPortal: typeof dailyPortalModsDisplay === 'function' ? dailyPortalModsDisplay : null,
		c2Runner: typeof c2RunnerDisplay === 'function' ? c2RunnerDisplay : null,
		/* Import Export Functions */
		exportAutoTrimps: typeof _displayExportAutoTrimps === 'function' ? _displayExportAutoTrimps : null,
		importAutoTrimps: typeof _displayImportAutoTrimps === 'function' ? _displayImportAutoTrimps : null,
		forceAutoPortal: typeof _displayPortalForce === 'function' ? _displayPortalForce : null,
		forceAutoHeirlooms: typeof _displayAutoHeirloomsForce === 'function' ? _displayAutoHeirloomsForce : null,
		donate: typeof _displayDonate === 'function' ? _displayDonate : null,
		spireImport: typeof _displaySpireImport === 'function' ? _displaySpireImport : null,
		priorityOrder: typeof _displayPriorityOrder === 'function' ? _displayPriorityOrder : null,
		autoHeirloomMods: typeof _displayAutoHeirloomMods === 'function' ? _displayAutoHeirloomMods : null,
		spireAssault: typeof _displaySpireAssaultPresets === 'function' ? _displaySpireAssaultPresets : null,
		c2table: typeof _displayC2Table === 'function' ? _displayC2Table : null,
		resetDefaultSettingsProfiles: typeof _displayResetDefaultSettingsProfiles === 'function' ? _displayResetDefaultSettingsProfiles : null,
		disableSettingsProfiles: typeof _displayDisableSettingsProfiles === 'function' ? _displayDisableSettingsProfiles : null,
		setCustomChallenge: typeof _displaySetCustomChallenge === 'function' ? _displaySetCustomChallenge : null,
		timeWarp: typeof _displayTimeWarp === 'function' ? _displayTimeWarp : null,
		resetPerkPreset: typeof _displayResetPerkPreset === 'function' ? _displayResetPerkPreset : null,
		hideAutomation: typeof hideAutomationDisplay === 'function' ? hideAutomationDisplay : null,
		display: typeof _displayFarmCalcTable === 'function' ? _displayFarmCalcTable : null
	};

	const c2Info = typeof _getChallenge2Info === 'function' ? _getChallenge2Info() : '';

	const titleTexts = {
		AutoStructure: 'Configure AutoTrimps AutoStructure',
		AutoJobs: 'Configure AutoTrimps AutoJobs',
		UniqueMaps: 'Unique Maps',
		MessageConfig: 'Message Config',
		DailyAutoPortal: 'Daily Auto Portal',
		c2Runner: c2Info + ' Runner',
		/* Import Export Titles */
		exportAutoTrimps: titleText === 'downloadSave' ? 'downloadSave' : 'Export AutoTrimps Settings',
		importAutoTrimps: 'Import AutoTrimps Settings',
		forceAutoPortal: 'Force Auto Portal',
		forceAutoHeirlooms: 'Force Auto Heirlooms',
		donate: 'Donate',
		spireImport: 'Import Spire Settings',
		priorityOrder: 'Priority Order Table',
		autoHeirloomMods: 'Auto Heirloom Mods',
		spireAssault: 'Spire Assault Presets',
		c2table: c2Info + ' Table',
		resetDefaultSettingsProfiles: 'Reset Default Settings',
		disableSettingsProfiles: 'Disable All Settings',
		setCustomChallenge: 'Set Custom Challenge',
		timeWarp: 'Time Warp Hours',
		resetPerkPreset: 'Reset Perk Preset Weights',
		hideAutomation: 'Hide Automation Buttons',
		display: 'Farm Calc Table'
	};

	cancelTooltip();
	let tooltipDiv = document.getElementById('tooltipDiv');
	let tooltipText;
	let costText = '';
	let ondisplay = null;
	lastTooltipTitle = null;
	if (event !== 'mapSettings') swapClass('tooltipExtra', 'tooltipExtraNone', tooltipDiv);

	if (eventHandlers[event]) {
		if (typeof eventHandlers[event] === 'function') {
			[tooltipDiv, tooltipText, costText, ondisplay] = eventHandlers[event](tooltipDiv, titleText, extraParam, extraParam2);
		}

		titleText = titleTexts[event] || titleText;
	}

	if (event) {
		const tipText = document.getElementById('tipText');
		const tipTitle = document.getElementById('tipTitle');
		const tipCost = document.getElementById('tipCost');
		if (event === 'mapSettings') {
			if (titleText === 'HD Farm') titleText = 'Hits Survived & HD Farm';
			if (titleText === 'Spire Assault') titleText = 'Spire Assault Settings';
		}

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

/* need to integrate this into importExportTooltip in the future */
function _displayImportAutoTrimpsProfile(profileSettings, profileName) {
	cancelTooltip();
	const tooltipDiv = document.getElementById('tooltipDiv');
	swapClass('tooltipExtra', 'tooltipExtraNone', tooltipDiv);

	const tooltipText = `Are you sure you wish to import the settings from the profile named: ${profileName}?`;

	let costText = "<div class='maxCenter'>";
	costText += `<div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); resetAutoTrimps("${profileSettings}", "${profileName}");'>Switch Profile</div>`;
	costText += "<div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div>";
	costText += '</div>';

	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	const tipText = document.getElementById('tipText');
	const tipTitle = document.getElementById('tipTitle');
	const tipCost = document.getElementById('tipCost');
	const titleText = 'Import Settings';

	game.global.lockTooltip = true;
	if (tipText.className !== '') tipText.className = '';
	if (tipText.innerHTML !== tooltipText) tipText.innerHTML = tooltipText;
	if (tipTitle.innerHTML !== titleText) tipTitle.innerHTML = titleText;
	if (tipCost.innerHTML !== costText) tipCost.innerHTML = costText;
	tooltipDiv.style.display = 'block';
	_verticalCenterTooltip();
}
function atProfileSave(profileName = autoTrimpSettings.ATprofile) {
	const settingProfiles = localStorage.getItem('atSettingsProfiles');
	if (!settingProfiles) return void debug('No setting profiles found.', 'profile');

	const profileData = JSON.parse(settingProfiles);
	profileData[profileName] = serializeSettings();
	localStorage.setItem('atSettingsProfiles', JSON.stringify(profileData));
	debug(`Profile: ${profileName} has been saved.`, 'profile');
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

function spireAssaultPresetSave() {
	function getEquippedItems(selector) {
		return $(selector)
			.map((index, item) => $(item).data('hidden-text'))
			.get();
	}

	const equippedItems = getEquippedItems('.spireItemsEquipped');
	const equippedRingMods = getEquippedItems('.spireRingEquipped');

	const activePreset = document.getElementsByClassName('spireHeaderSelected')[0].dataset.hiddenName;
	const spireAssaultSettings = JSON.parse(getPageSetting('spireAssaultPresets'));
	spireAssaultSettings[activePreset] = {
		name: spireAssaultSettings[activePreset].name,
		items: equippedItems,
		ringMods: equippedRingMods
	};

	setPageSetting('spireAssaultPresets', JSON.stringify(spireAssaultSettings));
}

function spireAssaultPresetSwap(preset) {
	const setting = JSON.parse(getPageSetting('spireAssaultPresets'));
	setting.selectedPreset = preset;
	setPageSetting('spireAssaultPresets', JSON.stringify(setting));
	cancelTooltip();
	importExportTooltip('spireAssault');
}

function spireAssaultPresetRename() {
	const selectedPreset = $('.spireHeaderSelected')[0].innerText;
	const newName = prompt(`Enter a new name for preset ${selectedPreset}:`, selectedPreset);

	if (newName) {
		const activePreset = document.getElementsByClassName('spireHeaderSelected')[0].dataset.hiddenName;
		const setting = JSON.parse(getPageSetting('spireAssaultPresets'));
		setting[activePreset].name = newName;

		const presetNumber = parseInt(activePreset.replace(/[^\d]/g, ''), 10) - 1 || 1;
		setting.titles[presetNumber] = newName;
		setPageSetting('spireAssaultPresets', JSON.stringify(setting));
		$('.spireHeaderSelected')[0].innerText = newName;
	}
}

function spireAssaultToggleElem(element, type, maxItems = Infinity, heirloom = false) {
	const elemPrefix = `spire${type}`;

	const equippedElem = document.getElementById(`spireAssault${type}Equipped`);
	if (equippedElem) {
		const equippedItems = Number(equippedElem.innerText);
		const errorElem = document.getElementById(`spireAssault${type}Error`);
		let removeItem = element.classList.contains(`${elemPrefix}Equipped`);

		if (!removeItem && equippedItems >= maxItems) {
			if (heirloom) type = 'mods';
			if (type === 'Ring') type = 'Ring mods';
			const errorText = `Max ${type} ${heirloom ? 'selected' : 'equipped'}!`;
			if (errorElem.innerText !== errorText) errorElem.innerText = errorText;
			return;
		} else if (errorElem.innerText !== '') {
			errorElem.innerText = '';
		}
		equippedElem.innerHTML = removeItem ? equippedItems - 1 : equippedItems + 1;
	}

	element.classList.toggle(`${elemPrefix}Equipped`);
	element.classList.toggle(`${elemPrefix}NotEquipped`);
}

function _displaySpireAssaultPresets(tooltipDiv) {
	const itemList = spireAssaultItemList(true);
	const setting = JSON.parse(getPageSetting('spireAssaultPresets'));
	const selectedPreset = setting.selectedPreset;
	const presetName = setting[selectedPreset].name || 'Preset 1';
	const preset = setting[selectedPreset] || { items: [], ringMods: [] };
	const hiddenItems = setting['Hidden Items'].items || [];
	const maxItems = autoBattle.getMaxItems();

	let rowData = '';
	let rows = 0;
	let total = 0;
	let tooltipText = '';

	function escapeHtmlAttribute(str) {
		return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	const headerList = ['Preset 1', 'Preset 2', 'Preset 3', 'Preset 4', 'Preset 5', 'Hidden Items'];
	tooltipText += `<div id='spireAssaultPresets' style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">`;
	for (const header of headerList) {
		const titleName = setting[header].name || header;
		const headerClass = header === selectedPreset ? 'Selected' : 'NotSelected';
		const escapedTitleName = escapeHtmlAttribute(titleName);
		tooltipText += `<div style="display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;" class='spireAssaultHeader spireHeader${headerClass}' onclick='spireAssaultPresetSwap("${header}")'  data-hidden-name="${header}"><b>${escapedTitleName}</b></div>`;
	}
	tooltipText += `</div>`;

	const itemsEquipped = preset.items;
	tooltipText += `<div id='spireAssaultItems'>`;
	if (selectedPreset !== 'Hidden Items') {
		tooltipText += `<div style="white-space: nowrap;">
		<span>Items (</span><span id='spireAssaultItemsEquipped'>${itemsEquipped.length}</span><span>/</span><span id='spireAssaultItemsMax'>${maxItems}</span><span>) </span><span id='spireAssaultItemsError' style='color: red;'></span>
		</div>`;
	} else {
		tooltipText += `<div>&nbsp;</div>`;
	}

	for (let x = 0; x < itemList.length; x++) {
		let item = itemList[x];
		const itemObj = autoBattle.items[item];
		if (!itemObj.owned) continue;
		if (selectedPreset !== 'Hidden Items' && hiddenItems.includes(item) && !itemsEquipped.includes(item)) continue;
		if (total > 0 && total % 5 === 0) {
			tooltipText += `<div id='row${rows}'>${rowData}</div>`;
			rowData = '';
			rows++;
		}

		let equipClass = itemsEquipped.includes(item) ? 'Equipped' : 'NotEquipped';
		const itemLevel = item.includes('Doppelganger') ? '' : ` Lv ${itemObj.level}`;
		rowData += `
			<div class='spireAssaultItem spireItems${equipClass}' onclick='spireAssaultToggleElem(this, "Items", ${maxItems})' data-hidden-text="${item}">
				<span style="float: left;">${autoBattle.cleanName(item)}</span>
				<span style="float: right;">${itemLevel}</span>
			</div>`;
		total++;
	}

	rows++;
	tooltipText += `<div id='row${rows}'>${rowData}</div>`;
	tooltipText += `</div>`;

	if (autoBattle.oneTimers.The_Ring.owned && selectedPreset !== 'Hidden Items') {
		const ringSlots = autoBattle.getRingSlots();
		const ringModsEquipped = preset.ringMods;
		tooltipText += `<div style="white-space: nowrap;">
			<span>The Ring - Level ${autoBattle.rings.level} (</span><span id='spireAssaultRingEquipped'>${ringModsEquipped.length}</span><span>/</span><span id='spireAssaultRingMax'>${ringSlots}</span><span>) </span><span id='spireAssaultRingError' style='color: red;'></span>
		</div>`;

		const ringMods = Object.keys(autoBattle.ringStats);
		for (let item in ringMods) {
			const name = ringMods[item];
			const modName = autoBattle.ringStats[name].name;
			const ringModClass = ringModsEquipped.includes(name) ? 'Equipped' : 'NotEquipped';
			tooltipText += `<div class='spireAssaultRing spireRing${ringModClass}' onclick='spireAssaultToggleElem(this, "Ring", ${ringSlots})' data-hidden-text="${name}">${modName}</div>`;
		}
	}

	let costText = `
		<div class='maxCenter'>
			<span class='btn btn-success btn-md' id='confirmTooltipBtn' onclick='spireAssaultPresetSave(); cancelTooltip()'>Save and Close</span>
			<span class='btn btn-danger btn-md' onclick='cancelTooltip(true)'>Close</span>
			<span class='btn btn-primary btn-md' id='confirmTooltipBtn' onclick='spireAssaultPresetSave(); importExportTooltip("spireAssault")'>Save</span>
		`;

	if (selectedPreset !== 'Hidden Items') {
		costText += ` <span class='btn btn-info btn-md' onclick='spireAssaultPresetRename(this)'>Rename Preset</span>`;
		costText += ` <span class='btn btn-success btn-md' onclick='tooltipAT("Spire Assault Import", event, "${escapeHtmlAttribute(presetName)}", "${selectedPreset}")'>Import to SA</span>`;
		costText += ` <span class='btn btn-warning btn-md' onclick='tooltipAT("Spire Assault Export", event, "${escapeHtmlAttribute(presetName)}", "${selectedPreset}")'>Export from SA</span>`;
		costText += ` <span class='btn btn-primary btn-md' onclick='tooltipAT("Spire Assault Spreadsheet", event, "${escapeHtmlAttribute(presetName)}", "${selectedPreset}")'>Import from Spreadsheet</span>`;
	}

	costText += `</div> `;

	const ondisplay = function () {
		_verticalCenterTooltip(true);
	};

	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	return [tooltipDiv, tooltipText, costText, ondisplay];
}

function autoHeirloomsPresetSave(heirloomType = 'Shield', blacklist = false) {
	function getSelectedMods(selector) {
		return $(selector)
			.map((index, item) => $(item).data('hidden-text'))
			.get();
	}

	const equippedItems = getSelectedMods('.spireItemsEquipped');

	const heirloomRarity = document.getElementsByClassName('spireHeaderSelected')[0].dataset.hiddenName;
	const settingName = blacklist ? `heirloomAutoBlacklist${heirloomType}` : `heirloomAutoMods${heirloomType}`;
	const autoHeirloomSettings = getPageSetting(settingName);
	autoHeirloomSettings[heirloomRarity] = equippedItems;

	setPageSetting(settingName, autoHeirloomSettings);
}

function _displayAutoHeirloomMods(tooltipDiv, heirloomRarity, heirloomType = 'Shield', blacklist = false) {
	const settingName = blacklist ? `heirloomAutoBlacklist${heirloomType}` : `heirloomAutoMods${heirloomType}`;
	const setting = getPageSetting(settingName);
	const rarityNames = game.heirlooms.rarityNames;
	const rareToKeep = heirloomRarity || getPageSetting(`heirloomAutoRareToKeep${heirloomType}`);
	const preset = setting[rareToKeep] || [];
	const modList = _autoHeirloomMods(heirloomType, rareToKeep, false);
	const modSlots = game.heirlooms.slots[rarityNames.indexOf(rareToKeep)];

	let rowData = '';
	let rows = 0;
	let total = 0;
	let tooltipText = '';

	let hze = game.stats.highestLevel.valueTotal();
	const headerList = [];

	if (heirloomType !== 'Core') {
		headerList.push('Common');
		headerList.push('Rare');
		if (hze >= 60) headerList.push('Epic');
		if (hze >= 100) headerList.push('Legendary');
		if (hze >= 125) headerList.push('Magnificent');
		if (hze >= 146) headerList.push('Ethereal');
		if (hze >= 230) headerList.push('Magmatic');
		if (hze >= 500) headerList.push('Plagued');

		if (Fluffy.checkU2Allowed()) {
			hze = game.stats.highestRadLevel.valueTotal();
			headerList.push('Radiating');
			if (hze >= 100) headerList.push('Hazardous');
			if (hze >= 200) headerList.push('Enigmatic');
			if (game.global.stringVersion !== '5.9.2' && hze >= 300) headerList.push('Mutated');
		}
	} else {
		headerList.push('Basic');
		if (hze >= 200) headerList.push('Common');
		if (hze >= 300) headerList.push('Rare');
		if (hze >= 400) headerList.push('Epic');
		if (hze >= 500) headerList.push('Legendary');
		if (hze >= 600) headerList.push('Magnificent');
		if (hze >= 700) headerList.push('Ethereal');
	}

	tooltipText += `<div id='spireAssaultPresets' style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">`;
	let itemCount = 0;
	const maxItemsInRow = 6;

	tooltipText += `<div id='spireAssaultPresets' style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">`;

	while (itemCount < headerList.length) {
		const itemsInRow = Math.min(maxItemsInRow, headerList.length - itemCount);
		const widthStyle = `width: calc((100% - ${0.2 + 0.2 * itemsInRow}em - 6px) / ${itemsInRow});`;

		for (let i = 0; i < itemsInRow; i++) {
			const header = headerList[itemCount];
			const titleName = header;
			const headerClass = header === rareToKeep ? 'Selected' : 'NotSelected';
			tooltipText += `<div style="display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; ${widthStyle}" class='spireAssaultHeader spireHeader${headerClass}' onclick='importExportTooltip("autoHeirloomMods", "${header}", "${heirloomType}", ${blacklist})' data-hidden-name="${header}"><b>${titleName}</b></div>`;
			itemCount++;
		}

		tooltipText += `<br>`;
	}

	tooltipText += `</div>`;

	const itemsEquipped = preset;
	tooltipText += `<div id='spireAssaultItems'>`;
	if (!blacklist) {
		tooltipText += `<div style="white-space: nowrap;">
		<span>Mods  (</span><span id='spireAssaultItemsEquipped'>${itemsEquipped.length}</span><span>/</span><span id='spireAssaultItemsMax'>${modSlots}</span><span>) </span><span id='spireAssaultItemsError' style='color: red;'></span>
		</div>`;
	} else {
		tooltipText += `<div>&nbsp;</div>`;
	}

	for (let x = 0; x < modList.length; x++) {
		let item = modList[x];
		if (total > 0 && total % 5 === 0) {
			tooltipText += `<div id='row${rows}'>${rowData}</div>`;
			rowData = '';
			rows++;
		}

		let equipClass = itemsEquipped.includes(item) ? 'Equipped' : 'NotEquipped';
		rowData += `<div class='spireAssaultItem spireItems${equipClass}' onclick='spireAssaultToggleElem(this, "Items", ${modSlots}, true)' data-hidden-text="${item}">${item}</div>`;
		total++;
	}

	rows++;
	tooltipText += `<div id='row${rows}'>${rowData}</div>`;
	tooltipText += `</div>`;

	let costText = `
		<div class='maxCenter'>
			<span class='btn btn-success btn-md' id='confirmTooltipBtn' onclick='autoHeirloomsPresetSave("${heirloomType}", ${blacklist}); cancelTooltip()'>Save and Close</span>
			<span class='btn btn-danger btn-md' onclick='cancelTooltip(true)'>Close</span>
			<span class='btn btn-primary btn-md' id='confirmTooltipBtn' onclick='autoHeirloomsPresetSave("${heirloomType}", ${blacklist}); importExportTooltip("autoHeirloomMods", "${rareToKeep}", "${heirloomType}", ${blacklist})'>Save</span>
		`;

	costText += `</div> `;

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

	const challengesToRun = {
		c2: _c2RunnerCheck(false, 1),
		c3: _c2RunnerCheck(false, 2)
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
			percentzone: `HZE%`,
			c2runner: `${type} Runner`,
			runChallenge: `Auto Portal`
		};
	};

	let challengeList = {};
	const hze = game.stats.highestLevel.valueTotal();
	const hzeU2 = game.stats.highestRadLevel.valueTotal();

	const processArray = (type, array, runnerList, challengesToRun) => {
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
				runChallenge: challengesToRun && challengesToRun.includes(item) ? '✅' : '❌',
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
		processArray(type, array, runnerLists[type], challengesToRun[type]);
	});

	const createTableRow = (key, { number, percent, zone, color, percentzone, c2runner, runChallenge }) => `
		<tr>
			<td>${key}</td>
			<td>${number}</td>
			<td>${percent}</td>
			<td>${zone}</td>
			<td${!['C2', 'C3'].includes(key) ? ` bgcolor='black'><font color=${color}>${percentzone}</font>` : `>${percentzone}`}</td>
			<td>${c2runner}</td>
			<td>${runChallenge}</td>
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
						<td>${prettify(game.global.totalSquaredReward.toFixed(2))}%</td>
						<td></td>
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
	if (challengeList.C3) tooltipText = `<div class='litScroll'>${tooltipText}</div>`;

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
	} else if (usingRealTimeOffline) {
		if (game.options.menu.autoSave.enabled !== atConfig.autoSave) {
			saveGame.options.menu.autoSave.enabled = atConfig.autoSave;
		}
		const reduceBy = offlineProgress.totalOfflineTime - offlineProgress.ticksProcessed * 100;
		['lastOnline', 'portalTime', 'zoneStarted', 'lastSoldierSentAt', 'lastBonePresimpt', 'lastSkeletimp'].forEach((key) => {
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
function resetAutoTrimps(autoTrimpsSettings, switchProfile) {
	atConfig.running = false;

	setTimeout(() => {
		if (switchProfile) autoTrimpsSettings = JSON.parse(LZString.decompressFromBase64(autoTrimpsSettings));
		const profileSettings = switchProfile ? autoTrimpSettings.profileSettings.value : undefined;
		localStorage.removeItem('atSettings');
		autoTrimpSettings = autoTrimpsSettings || {};

		if (switchProfile) {
			autoTrimpSettings.ATprofile = switchProfile;
			autoTrimpSettings.profileSettings.value = profileSettings;
		}

		const settingsRow = document.getElementById('settingsRow');
		['autoSettings', 'autoTrimpsTabBarMenu'].forEach((id) => {
			const element = document.getElementById(id);
			if (element) {
				const clonedElement = element.cloneNode(true);
				settingsRow.replaceChild(clonedElement, element);
				settingsRow.removeChild(clonedElement);
			}
		});

		automationMenuSettingsInit();
		initialiseAllTabs();
		initialiseAllSettings();
		saveSettings();
		updateATVersion();
		_setButtonsPortal();
		setupAddonUser(true);
		updateAutoTrimpSettings(true);
		saveSettings();
		loadAugustSettings();
		alterHeirloomWindow();

		const keys = ['perkyInputs', 'surkyInputs', 'heirloomInputs'];

		keys.forEach((key) => {
			const item = localStorage.getItem(key);
			if (item && Object.keys(JSON.parse(item)).length === 1) {
				localStorage.removeItem(key);
			}
		});

		localStorage.perkyInputs = autoTrimpSettings.autoAllocatePresets.value;
		localStorage.surkyInputs = autoTrimpSettings.autoAllocatePresets.valueU2;
		localStorage.heirloomInputs = autoTrimpSettings.autoHeirloomStorage.value;
		localStorage.mutatorPresets = autoTrimpSettings.mutatorPresets.valueU2;
		atData.autoPerks.displayGUI(game.global.universe, true);
		hideAutomationButtons();
	}, 101);

	const displayedMessage = {
		switchProfile: {
			message: `Successfully loaded existing profile: ${switchProfile}`,
			tooltipMessage: `Successfully loaded existing profile: ${switchProfile}`,
			title: 'Profile Loaded'
		},
		defaultSettings: {
			message: 'Successfully reset AutoTrimps settings to Defaults...',
			tooltipMessage: 'Autotrimps has been successfully reset to its default settings!',
			title: 'Settings Reset'
		},
		importSettings: {
			message: 'Successfully imported new AutoTrimps settings...',
			tooltipMessage: 'Successfully imported Autotrimps settings file.',
			title: 'Settings Imported'
		}
	};

	const profileType = switchProfile ? 'switchProfile' : autoTrimpsSettings ? 'importSettings' : 'defaultSettings';
	const { message, tooltipMessage, title } = displayedMessage[profileType];

	debug(message, 'profile');
	tooltip(`${title}`, `customText`, `lock`, `${tooltipMessage}`, false, `center`);
	_verticalCenterTooltip();
	document.getElementById('tipCost').children[0].id = 'tipCostID';
	document.getElementById('tipCostID').focus();
	atConfig.running = true;
}

function disableAllSettings() {
	for (const setting in autoTrimpSettings) {
		if (['ATversion', 'ATversionChangelog', 'ATprofile', 'gameUser'].includes(setting)) continue;
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
	_verticalCenterTooltip();
}

function makeShieldGymHelpTooltip() {
	let tooltipText = '';

	tooltipText += `<p>When both the scripts <b>Auto Equip</b> and <b>Auto Structure</b> settings are enabled the script does multiple checks to identify the most efficient purchase between Shields and Gyms.</p>`;
	tooltipText += `<p>It calculates the cost of each and which one will provide the best hits survived impact for your current zone (or map if you're mapping) and uses those values to identify the best one to purchase.</p>`;
	tooltipText += `<p>The calculations do take Shield prestiges and the Gymystic upgrade multiplication bonus into account.</p>`;

	tooltip('Shield and Gym Info', 'customText', 'lock', tooltipText, false, 'center');
	_verticalCenterTooltip();
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
		tooltipText += `<p>HD Farm (and Hits Survived)</p>`;
		tooltipText += `<p>Void Maps</p>`;
		tooltipText += `<p>Map Bonus</p>`;
		if (challengeActive('Wither')) tooltipText += `<p><b><i>Wither Farm</b></i></p>`;
		if (challengeActive('Mayhem')) tooltipText += `<p><b><i>Mayhem Destacking</b></i></p>`;
		if (challengeActive('Glass')) tooltipText += `<p><b><i>Glass Destacking</b></i></p>`;
		if (challengeActive('Smithless')) tooltipText += `<p><b><i>Smithless Farm</b></i></p>`;
	}

	tooltip('Auto Maps Priority', 'customText', 'lock', tooltipText, false, 'center');
	_verticalCenterTooltip();
}

function makeFragmentDecisionHelpTooltip() {
	let tooltipText = '';

	tooltipText += `<p>When you can't afford a map with perfect sliders and the desired map special & biome the script will make adjustments to the map properties in the following order until the map can be afforded:</p>`;
	if (trimpStats.plusLevels) tooltipText += `<p>Disables perfect maps.</p>`;
	tooltipText += `<p>Reduces the <b>Difficulty</b> slider until it either reaches 0 or you can afford the map.</p>`;
	tooltipText += `<p>Reduces the <b>Loot</b> slider until it either reaches 0 or you can afford the map.</p>`;
	tooltipText += `<p>Sets the <b>Biome</b> to <b>Random</b>.</p>`;
	tooltipText += `<p>Removes the <b>Special Modifier</b> if it's not set to a <b>Cache</b> special.</p>`;
	tooltipText += `<p>Reduces the <b>Size</b> slider until it either reaches 0 or you can afford the map.</p>`;
	tooltipText += `<p>Removes the <b>Special Modifier</b> if still set.</p>`;

	tooltip('Fragment Decision Info', 'customText', 'lock', tooltipText, false, 'center');
	_verticalCenterTooltip();
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
	tooltipText += `S: The ideal map level for a mixture of speed and loot gains. Auto Maps will use this when gaining Map Bonus stacks through the <b>Map Bonus</b> setting.`;

	const farmCalcDetails = farmCalcGetMapDetails();
	if (farmCalcDetails) tooltipText += `<br>${farmCalcDetails}`;
	tooltipText += `</p>`;
	const refreshTimer = usingRealTimeOffline ? 30 : 5;
	const remainingTime = Math.ceil(refreshTimer - ((atConfig.intervals.counter / 10) % refreshTimer)) || refreshTimer;
	tooltipText += `<p>The data shown is updated every ${refreshTimer} seconds. <b>${remainingTime}s</b> until the next update.</p>`;
	tooltipText += `<p>Click this button while in the map chamber to either select your already purchased map or automatically set the inputs to the desired values.</p>`;
	tooltipText += `<p>Control click this button to display a table of the calculators simulation results.</p>`;

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
	if (atConfig.initialise.basepath !== 'https://localhost:8887/AutoTrimps_Local/') return;
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

	const toggles = ['darkTheme', 'standardNotation', 'hotkeys'];
	for (let i in toggles) {
		let setting = game.options.menu[toggles[i]];
		if (setting.onToggle) setting.onToggle();
	}
}

//Process data to google forms to update stats spreadsheet
function pushSpreadsheetData() {
	if (!portalWindowOpen || !gameUserCheck(true)) return;
	const graphData = JSON.parse(localStorage.getItem('portalDataCurrent'))[Graphs.getportalID()];

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
	debug(`Spreadsheet upload complete.`, 'profile');
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
		_verticalCenterTooltip();
	}
}

function _displayResetPerkPreset(tooltipDiv) {
	const tooltipText = `This will restore your selected preset to its original values.<br><br/>Are you sure you want to do this?`;
	const costText = `<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' style='width: 13vw' onclick='cancelTooltip(); fillPreset${atData.autoPerks.loaded}(perkCalcPreset(), true);'>Reset to Preset Defaults</div><div style='margin-left: 15%' class='btn btn-info' style='margin-left: 5vw' onclick='cancelTooltip();'>Cancel</div></div>`;

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
	if (atConfig.settingUniverse === 1 && hze >= 230) costText += "<div class='btn btn-warning' onclick='cancelTooltip(); autoPortalForce(true, true);'>Force Portal After Poison Voids</div>";
	costText += "<div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div>";

	costText += '</div>';

	return [tooltipDiv, tooltipText, costText, ondisplay];
}

function _displayAutoHeirloomsForce(tooltipDiv) {
	let tooltipText;
	let costText = "<div class='maxCenter'>";
	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	if (!getPageSetting('heirloomAuto')) {
		tooltipText = `<p>You must enable <b>Auto Heirlooms</b> in the AutoTrimps settings window to use this feature.</p>`;
		costText += "<div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div>";
	} else if (game.global.heirloomsExtra.length === 0) {
		tooltipText = `<p>You don't have any heirlooms in your temporary storage to run <b>Auto Heirlooms</b> on.</p>`;
		costText += "<div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div>";
	} else {
		tooltipText = `<p>Are you sure you want to run <b>Auto Heirlooms</b>? This will move  any heirlooms meet the criteria of mods you selected in the <b>AutoTrimps settings</b> into your carried heirlooms section.</p>`;
		costText += "<div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); autoHeirlooms();'>Force Auto Heirlooms</div>";
		costText += "<div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div>";
		costText += '</div>';
	}

	const ondisplay = function () {
		if (typeof _verticalCenterTooltip === 'function') _verticalCenterTooltip();
		else verticalCenterTooltip();
	};

	return [tooltipDiv, tooltipText, costText, ondisplay];
}

function _displayDonate(tooltipDiv) {
	let tooltipText = "<p>If you'd like to donate to AutoTrimps development, you can now do so with Buy me a coffee.</p>";
	tooltipText += "<p>If you want to contribute but can't afford a donation, you can still give back by joining the community and sharing your feedback or helping others. Thank you either way, you're awesome!</p>";

	/* buymeacoffee button */
	const buttonHTML = `
        <div class="bmc-button-container">
            <a href="https://www.buymeacoffee.com/augustAutoTrimps" target="_blank">
                <img src="https://cdn.buymeacoffee.com/buttons/v2/default-pink.png" alt="Buy Me a Coffee" style="height: 60px; width: 217px;">
            </a>
        </div>
    `;
	tooltipText += buttonHTML;

	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	const ondisplay = function () {
		if (typeof _verticalCenterTooltip === 'function') _verticalCenterTooltip(true);
		else verticalCenterTooltip(true);
	};

	let costText = "<div class='maxCenter'>";
	costText += "<div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>Confirm</div>";
	costText += '</div>';

	return [tooltipDiv, tooltipText, costText, ondisplay];
}

function _displayFarmCalcTable(tooltipDiv, titleText, currFragments = 'Current Fragments') {
	if (!currFragments) currFragments = 'Current Fragments';
	const fragSetting = currFragments === 'Current Fragments';
	const results = stats(undefined, fragSetting);
	const [mapData, stances] = results;
	const best = get_best(results, undefined, undefined, true);

	let show_stance = game.global.world >= 60;
	let tooltipText = '';

	const headerList = ['Current Fragments', 'Infinite Fragments'];
	let headerText = `<div id='farmCalcHeaders' style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">`;
	for (const header of headerList) {
		const titleName = header;
		const headerClass = header === currFragments ? 'Selected' : 'NotSelected';
		headerText += `<div style="display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;" class='farmCalcHeader farmCalcHeader${headerClass}' onclick='importExportTooltip("display", undefined, "${header}")'  data-hidden-name="${header}"><b>${titleName}</b></div>`;
	}
	headerText += `</div>`;

	if (show_stance && stances.length > 1) {
		tooltipText += '<tr><th colspan=2 style="text-align:center; border: 1px solid black;"></th>';
		for (const stance of stances) {
			tooltipText += `<th colspan=2 style="text-align:center; border: 1px solid black;">${stance}</th>`;
		}
		tooltipText += '</tr>';
	}

	tooltipText += '<tr>';
	tooltipText += '<th style="text-align:center; border: 1px solid black;">Level</th>';
	tooltipText += '<th style="text-align:center; border: 1px solid black;">Base loot</th>';

	for (const _ of stances) {
		tooltipText += `<th style="text-align:center; border: 1px solid black;">Cells/s</th>`;
		tooltipText += `<th style="text-align:center; border: 1px solid black;">Total</th>`;
	}

	if (game.global.universe === 2) {
		tooltipText += '<th style="text-align:center; border: 1px solid black;">Equality</th>';
	}

	tooltipText += '</tr>';

	for (let zone_stats of mapData) {
		const zone = zone_stats.zone;
		let stance_data = '';
		tooltipText += '</tr><tr>';

		for (let stance of stances) {
			if (zone === best.loot[stance] && show_stance) {
				stance_data += `<b>${stance}</b> `;
			}
		}

		if (stance_data !== '') {
			tooltipText += `<td style="text-align:right">`;
			if (game.global.universe === 1) tooltipText += `${stance_data}`;
		} else {
			tooltipText += `<td style="text-align:center">`;
		}

		tooltipText += zone === best.loot.zone ? `<b>${zone}</b>` : `${zone}`;
		tooltipText += `</td>`;
		tooltipText += '<td>' + prettify(zone_stats.loot) + '%';

		for (let stance of stances) {
			const stanceData = zone_stats[stance];
			if (!stanceData || stanceData.value < 1) {
				tooltipText += '<td><td>';
			} else {
				let value = prettify(stanceData.value);
				tooltipText += '<td>' + stanceData.killSpeed.toFixed(3).replace(/\.?0+$/, '') + '<td>';
				tooltipText += zone === best.loot[stance] ? `<b>${value}</b>` : `${value}`;
			}
		}

		if (game.global.universe === 2) {
			const equality = zone_stats.equality;
			tooltipText += '<td>' + equality;
		}
	}

	tooltipText += '</tr>';

	if (show_stance) {
		if (game.global.universe === 1) {
			best.loot.zone += ' in ' + best.loot.stance;
			if (best.loot.lootSecond) best.loot.lootSecond.zone += ' in ' + best.loot.lootSecond.stance;
		} else if (game.global.universe === 2) {
			best.loot.zone += ` with ${best.loot.equality} equality`;
			if (best.loot.lootSecond) best.loot.lootSecond.zone += ` with ${best.loot.lootSecond.equality} equality`;
		}
	}

	const percentage = (best.loot.ratio - 1) * 100;
	const adverbValue = Math.max(Math.min(Math.floor(percentage / 2), 4), 0);
	const adverbs = ['', 'probably', '', 'really', 'definitely'];

	let bestFarm = `You should ${adverbs[[adverbValue]]} farm on <b>${best.loot.zone}</b>`;

	if (mapData.length > 1) {
		if (percentage < 2) bestFarm += ` or <b>${best.loot.lootSecond.zone}</b>.`;
		bestFarm += percentage < 2 ? ` They’re equally efficient.` : percentage < 4 ? `. But <b>${best.loot.lootSecond.zone}</b> is almost as good.` : `. It’s <b>${percentage.toFixed(1)}%</b> more efficient than <b>${best.loot.lootSecond.zone}</b>.`;
	} else {
		bestFarm += '.';
	}

	if (game.global.spireActive) bestFarm += '<br>Good luck with the Spire!';
	if (game.unlocks.imps.Jestimp && challengeActive('Unlucky')) bestFarm += `<br>The displayed equality values account for jestimp buff for lucky damage.`;

	const extraNote = 'Note: the displayed loot values don’t account for looting perks and staffs. As such, your actual loot will be much higher. However, these factors affect all maps in the same way, and don’t affect the choice of map.';

	const costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip();'>Close</div></div>";

	const ondisplay = function () {
		if (typeof _verticalCenterTooltip === 'function') _verticalCenterTooltip();
		else verticalCenterTooltip();
	};

	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	const initialText = `${bestFarm}<br>`;
	const endText = `<br>${extraNote}`;
	const tableContent = `<table class='bdTableSm table table-striped'>${tooltipText}</table>`;

	tooltipText = headerText;
	if (mapData.length > 19) {
		tooltipText += `${initialText}<div class='litScroll'>${tableContent}</div>${endText}`;
	} else {
		tooltipText += `${initialText}${tableContent}${endText}`;
	}

	return [tooltipDiv, tooltipText, costText, ondisplay];
}
