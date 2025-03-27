function mapSettingsDisplay(elem, titleText) {
	MODULES.popups.mazWindowOpen = true;
	const settingNames = _mapSettingsNames();

	/* remove spaces from titleText to make varPrefix */
	let varPrefix = titleText.replace(/\s/g, '');
	let settingName = varPrefix.charAt(0).toLowerCase() + varPrefix.slice(1);
	if (varPrefix === 'HDFarm') settingName = settingName.charAt(0) + settingName.charAt(1).toLowerCase() + settingName.slice(2);

	const originalSetting = getPageSetting(`${settingName}Settings`, atConfig.settingUniverse);
	const settingType = originalSetting[0] ? originalSetting[0].settingType || 'basic' : 'basic';
	const activeSetting = _mapSettingsGetActive(settingName, settingNames);
	const activeSettingObj = JSON.stringify(activeSetting);
	const settingObj = _mapSettingsInputObj();
	const { settingInputs, settingInputsDefault, windowWidth } = settingObj[titleText];

	let tooltipText = '';
	/* setting up default settings row */
	const noDefaultRow = activeSetting.golden || activeSetting.profile;
	if (!noDefaultRow) {
		tooltipText += `<div id='windowError'></div>`;
		tooltipText += _mapSettingsRowTitles(JSON.stringify(settingInputsDefault), 'basic', true);
		const defaultSetting = originalSetting[0];
		const activeRow = typeof defaultSetting !== 'undefined';

		const vals = { active: false };
		for (let item in settingInputsDefault) {
			const name = settingInputsDefault[item].name;
			if (settingInputsDefault[item].width.display === 'advanced' && settingType.toLowerCase() !== 'advanced') {
				vals[name] = settingInputsDefault[item].defaultValue;
			} else {
				vals[name] = activeRow && typeof defaultSetting[name] !== 'undefined' && defaultSetting[name] !== null ? defaultSetting[name] : settingInputsDefault[item].defaultValue;
			}
		}

		tooltipText += _mapSettingsRowPopulateInputs(titleText, vals, settingInputsDefault, '', { classList: '', style: '' }, 'basic');
	}

	tooltipText += _mapSettingsRowTitles(JSON.stringify(settingInputs), settingType);

	/* as position 0 in the array stores base setting we need to take that out of the array before we start looping through rows */
	const currSetting = noDefaultRow ? originalSetting : originalSetting.slice(1, originalSetting.length);
	const profileData = activeSetting.profile ? JSON.parse(localStorage.getItem('atSettingsProfiles')) : null;
	let overflow = false;
	/* setting up the rows based on saved data */
	for (let x = 0; x < activeSetting.maxSettings; x++) {
		const vals = { active: false, priority: parseInt(x) + 1, settingType };
		const settingRow = currSetting[x];
		const activeRow = typeof settingRow !== 'undefined';
		if (currSetting.length - 1 >= 10) overflow = true;

		for (let item in settingInputs) {
			const name = settingInputs[item].name;

			if (activeSetting.golden && name.includes('golden')) {
				vals.goldenType = activeRow && typeof settingRow.golden !== 'undefined' ? settingRow.golden[0] : settingInputs.goldenType.defaultValue;
				vals.goldenNumber = activeRow && typeof settingRow.golden !== 'undefined' ? parseNum(settingRow.golden.toString().replace(/[^\d,:-]/g, '')) : settingInputs.goldenNumber.defaultValue;
				continue;
			}

			if (activeSetting.alchemy && name.includes('potion')) {
				vals.potionType = activeRow && typeof settingRow.potion !== 'undefined' ? settingRow.potion[0] : settingInputs.potionType.defaultValue;
				vals.potionNumber = activeRow && typeof settingRow.potion !== 'undefined' ? parseNum(settingRow.potion.toString().replace(/[^\d,:-]/g, '')) : settingInputs.potionNumber.defaultValue;
				continue;
			}

			if (activeSetting.profile && name === 'settingString') {
				const profileName = activeRow && settingRow.profileName;
				if (currSetting.length - 1 < x) vals[name] = settingInputs[item].defaultValue;
				else vals[name] = profileData && profileData[profileName] ? profileData[profileName] : 'Empty Dataset. Overwrite or delete and add profile again.';
				continue;
			}

			if (settingInputs[item].width.display === 'advanced' && settingType.toLowerCase() !== 'advanced') {
				vals[name] = settingInputs[item].defaultValue;
			} else {
				vals[name] = activeRow && typeof settingRow[name] !== 'undefined' && settingRow[name] !== null ? settingRow[name] : settingInputs[item].defaultValue;
			}
		}

		const style = currSetting.length - 1 < x ? ' style="display: none" ' : '';
		const classList = x <= currSetting.length - 1 ? 'active' : 'disabled';
		tooltipText += _mapSettingsRowPopulateInputs(titleText, vals, settingInputs, x, { style, classList }, settingType);
	}

	tooltipText += `<div id='windowAddRowBtn' style='display: ${currSetting.length < activeSetting.maxSettings ? 'inline-block' : 'none'}' class='btn btn-success btn-md' onclick='_mapSettingsAddRow("${titleText}")'>+ Add Row</div>`;
	tooltipText += `</div></div>`;
	tooltipText += `<div style='display: none' id='mazHelpContainer'>${_mapSettingsHelpWindow(activeSettingObj, settingType)}</div>`;

	const swapTo = settingType === 'basic' ? 'Advanced' : 'Basic';
	const noAdvancedSettings = noDefaultRow || ['Spire Assault', 'Worshipper', 'Toxicity', 'Quagmire', 'Archaeology', 'Insanity', 'Hypothermia'].some((name) => titleText.includes(name));
	const costText = `
		<div class='maxCenter'>
			<span id='saveBtn' class='btn btn-success btn-md' id='confirmTooltipBtn' onclick='_mapSettingsSave("${titleText}", "${settingName}", ${JSON.stringify(activeSettingObj)})'>Save and Close</span>
			<span id='cancelBtn' class='btn btn-danger btn-md' onclick='cancelTooltip(true)'>Cancel</span>
			<span id='SaveBtn' class='btn btn-primary btn-md' id='confirmTooltipBtn' onclick='_mapSettingsSave("${titleText}", "${settingName}", ${JSON.stringify(activeSettingObj)}, true)'>Save</span>
			<span id='HelpBtn' class='btn btn-info btn-md' onclick='_mapSettingsToggleHelp("${windowWidth}")'>Help</span>
			${!noAdvancedSettings ? `<span id='altVersionBtn' class='btn btn-warning btn-md' style='float:right;' data-setting-type='${settingType}' onclick='_mapSettingsToggleVersion("${titleText}", "${settingName}")'>Swap To ${swapTo} Version</span>` : ''}
		</div>`;

	elem.style.top = '10%';
	elem.style.left = '1%';
	elem.style.height = 'auto';
	elem.style.maxHeight = `${window.innerHeight * 0.85}px`;
	elem.style.overflowY = overflow ? 'scroll' : '';
	elem.classList = `tooltipExtraCustom${windowWidth[(originalSetting[0] ? originalSetting[0].settingType : 'basic') || 'basic']}`;
	return [elem, tooltipText, costText, null];
}

function _mapSettingsNames(titleName) {
	if (titleName) {
		return ['Map Farm', 'Map Bonus', 'Void Map', 'HD Farm', 'Raiding', 'Bionic Raiding', 'Toxicity', 'Bone Shrine', 'Auto Golden', 'Tribute Farm', 'Smithy Farm', 'Worshipper Farm', 'Quagmire', 'Archaeology', 'Insanity', 'Alchemy', 'Hypothermia', 'C2 Runner', 'C3 Runner', 'Profile', 'Hits Survived & HD Farm', 'Spire Assault Settings'];
	}

	return ['mapFarm', 'mapBonus', 'voidMap', 'hdFarm', 'raiding', 'bionic', 'toxicity', 'boneShrine', 'autoGolden', 'tributeFarm', 'smithyFarm', 'worshipperFarm', 'quagmire', 'archaeology', 'insanity', 'alchemy', 'hypothermia', 'profile', 'geneAssist', 'spireAssault'];
}

function _mapSettingsToggleVersion(titleText, settingName) {
	const setting = getPageSetting(`${settingName}Settings`, atConfig.settingUniverse);
	setting[0].settingType = !setting[0].settingType || setting[0].settingType === 'basic' ? 'advanced' : 'basic';
	setPageSetting(`${settingName}Settings`, setting, atConfig.settingUniverse);
	importExportTooltip('mapSettings', titleText);
}

function _mapSettingsGetActive(settingName = '', settingNames = []) {
	const activeSetting = { maxSettings: 30 };
	for (let name of settingNames) {
		if (settingName.includes(name)) {
			activeSetting[name] = true;
		}
	}

	if (activeSetting['autoGolden']) activeSetting['golden'] = true;
	const s = activeSetting;

	activeSetting.endZone = s.hdFarm || s.voidMap || s.mapBonus || s.mapFarm || s.raiding || s.bionic || s.worshipperFarm || s.tributeFarm || s.smithyFarm || s.toxicity || s.archaeology || s.alchemy || s.desolation;

	activeSetting.mapLevel = s.hdFarm || s.mapBonus || s.mapFarm || s.worshipperFarm || s.tributeFarm || s.smithyFarm || s.toxicity || s.archaeology || s.insanity || s.alchemy || s.hypothermia;

	activeSetting.mapType = s.mapFarm || s.tributeFarm || s.smithyFarm || s.alchemy;

	activeSetting.jobRatio = !s.golden && !s.raiding && !s.bionic && !s.smithyFarm && !s.profile && !s.spireAssault;

	activeSetting.repeatEvery = s.mapFarm || s.raiding || s.bionic || s.worshipperFarm || s.tributeFarm || s.smithyFarm || s.toxicity || s.archaeology || s.alchemy || s.desolation;

	activeSetting.special = s.mapBonus || s.mapFarm || s.toxicity || s.insanity || s.alchemy || s.desolation;

	activeSetting.prestigeGoal = s.raiding || s.bionic || s.desolation;

	activeSetting.runType = s.mapFarm || s.tributeFarm || s.smithyFarm || s.mapBonus || s.worshipperFarm || s.boneShrine || s.voidMap || s.hdFarm || s.raiding || s.bionic || s.golden;

	activeSetting.atlantrimp = s.boneShrine || s.mapFarm || s.tributeFarm;
	return activeSetting;
}

function _mapSettingsInputObj() {
	/* anything added here has to go in the order that the title & inputs will be displayed in */
	/* prettier-ignore */
	return {
		'Auto Golden': {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 11, advanced: 11, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 10, advanced: 10, display: 'basic' } },
				goldenType: { name: 'goldenType', title: 'Golden Type', defaultValue: 'v', width: { basic: 15, advanced: 15, display: 'basic' }, dropdownType: 'goldenType' },
				goldenNumber: { name: 'goldenNumber', title: 'Amount', defaultValue: -1, width: { basic: 15, advanced: 15, display: 'basic' } },
				
				runType: { name: 'runType', title: 'Run Type', defaultValue: 'All', width: { basic: 48, advanced: 48, display: 'basic', altWidth: function (vals) { return ['All', 'Daily'].includes(vals.runType) ? 48 : 24; } }, dropdownType: 'runType' },
				challenge: { name: 'challenge', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['Filler'].includes(vals.runType) ? 24 : 0; } }, dropdownType: 'challenge', extraTitle: 'Challenges' },
				challenge3: { name: 'challenge3', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['C3'].includes(vals.runType) ? 24 : 0; } }, dropdownType: 'c2', extraTitle: `C${atConfig.settingUniverse + 1} Challenges` },
				challengeOneOff: { name: 'challengeOneOff', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['One Off'].includes(vals.runType) ? 24 : 0; } }, dropdownType: 'oneOff', extraTitle: 'One Off Challenges' }
			},
			windowWidth: { basic: 45, advanced: 45 }
		},
		'HD Farm': {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 5, advanced: 6, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 6, advanced: 7, display: 'basic' } },
				world: { name: 'world', title: 'Start Zone', defaultValue: 999, width: { basic: 6, advanced: 6, display: 'basic' } },
				endzone: { name: 'endzone', title: 'End Zone', defaultValue: 999, width: { basic: 6, advanced: 6, display: 'basic' } },
				cell: { name: 'cell', title: 'Cell', defaultValue: 1, width: { basic: 6, advanced: 6, display: 'basic' } },
				autoLevel: { name: 'autoLevel', title: 'Auto Level', defaultValue: true, width: { basic: 4, advanced: 4, display: 'basic' }, disable: function() { return false } },
				level: { name: 'level', title: 'Map Level', defaultValue: -1, width: { basic: 6, advanced: 6, display: 'basic' }, disable: function(vals) { return vals.autoLevel } },
				
				hdType: { name: 'hdType', title: 'Farm Type', defaultValue: 'world', width: { basic: 15, advanced: 10, display: 'basic' }, dropdownType: 'hdType', disable: function() { return false } },
				hdBase: { name: 'hdBase', title: 'Farm Target', defaultValue: 1, width: { basic: 6, advanced: 7, display: 'basic' } },
				hdMult: { name: 'hdMult', title: 'Zone Mult', defaultValue: 1, width: { basic: 0, advanced: 7, display: 'advanced' } },

				mapCap: { name: 'mapCap', title: 'Map Cap', defaultValue: 100, width: { basic: 6, advanced: 6, display: 'basic' } },
				jobratio: { name: 'jobratio', title: 'Job Ratio', defaultValue: '1,1,1,0', width: { basic: 10, advanced: 6, display: 'basic' }, type: 'text' },
				
				runType: { name: 'runType', title: 'Run Type', defaultValue: 'All', width: { basic: 23, advanced: 22, display: 'basic', altWidth: function (vals) { return ['All', 'Daily'].includes(vals.runType) ? (vals.settingType === 'basic' ? 24 : 23) : (vals.settingType === 'basic' ? 10 : 10); } }, dropdownType: 'runType' },
				challenge: { name: 'challenge', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['Filler'].includes(vals.runType) ? (vals.settingType === 'basic' ? 14 : 13) : 0; } }, dropdownType: 'challenge', extraTitle: 'Challenges' },
				challenge3: { name: 'challenge3', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['C3'].includes(vals.runType) ? (vals.settingType === 'basic' ? 14 : 13) : 0; } }, dropdownType: 'c2', extraTitle: `C${atConfig.settingUniverse + 1} Challenges` },
				challengeOneOff: { name: 'challengeOneOff', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['One Off'].includes(vals.runType) ? (vals.settingType === 'basic' ? 14 : 13) : 0; } }, dropdownType: 'oneOff', extraTitle: 'One Off Challenges' },
			},
			settingInputsDefault: {
				active: { name: 'active', title: 'Enable Setting', defaultValue: true, width: { basic: 10, display: 'basic' } },
				jobratio: { name: 'jobratio', title: 'Job Ratio', defaultValue: "1,1,1,0", width: { basic: 10, display: 'basic' }, type: 'text' },
				mapCap: { name: 'mapCap', title: 'Map Cap', defaultValue: 100, width: { basic: 10, display: 'basic' } },
			},
			windowWidth: { basic: 65, advanced: 70 }
		},
		'Void Map': {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 7, advanced: 5, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 11, advanced: 6, display: 'basic' } },
				world: { name: 'world', title: 'Start Zone', defaultValue: 999, width: { basic: 10, advanced: 6, display: 'basic' } },
				endzone: { name: 'endzone', title: 'End Zone', defaultValue: 999, width: { basic: 10, advanced: 6, display: 'basic' } },
				cell: { name: 'cell', title: 'Cell', defaultValue: 1, width: { basic: 10, advanced: 6, display: 'basic' } },
				
				hdType: { name: 'hdType', title: 'Dropdown #1', defaultValue: 'disabled', width: { basic: 0, advanced: 12, display: 'advanced' }, dropdownType: 'hdType', disable: function() { return false } },
				hdRatio: { name: 'hdRatio', title: 'Option #1', defaultValue: 0, width: { basic: 0, advanced: 7, display: 'advanced' }, disable: function(vals) { return vals.hdType === 'disabled' } },
				hdType2: { name: 'hdType2', title: 'Dropdown #2', defaultValue: 'disabled', width: { basic: 0, advanced: 12, display: 'advanced' }, dropdownType: 'hdType2', disable: function() { return false } },
				voidHDRatio: { name: 'voidHDRatio', title: 'Option #2', defaultValue: 0, width: { basic: 0, advanced: 7, display: 'advanced' }, disable: function(vals) { return vals.hdType2 === 'disabled' } },

				jobratio: { name: 'jobratio', title: 'Job Ratio', defaultValue: '1,1,1,0', width: { basic: 15, advanced: 9, display: 'basic' }, type: 'text' },
				
				runType: { name: 'runType', title: 'Run Type', defaultValue: 'All', width: { basic: 31, advanced: 19, display: 'basic', altWidth: function (vals) { return ['All', 'Daily'].includes(vals.runType) ? (vals.settingType === 'basic' ? 33 : 20) : (vals.settingType === 'basic' ? 15 : 8); } }, dropdownType: 'runType' },
				challenge: { name: 'challenge', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['Filler'].includes(vals.runType) ? (vals.settingType === 'basic' ? 18 : 12) : 0; } }, dropdownType: 'challenge', extraTitle: 'Challenges' },
				challenge3: { name: 'challenge3', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['C3'].includes(vals.runType) ? (vals.settingType === 'basic' ? 18 : 12) : 0; } }, dropdownType: 'c2', extraTitle: `C${atConfig.settingUniverse + 1} Challenges` },
				challengeOneOff: { name: 'challengeOneOff', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['One Off'].includes(vals.runType) ? (vals.settingType === 'basic' ? 18 : 12) : 0; } }, dropdownType: 'oneOff', extraTitle: 'One Off Challenges' },
				portalAfter: { name: 'portalAfter', title: 'Portal After', defaultValue: false, width: { basic: 5, advanced: 5, display: 'basic', altWidth: function () { return 4 } } },
			},
			settingInputsDefault: {
				active: { name: 'active', title: 'Enable Setting', defaultValue: true, width: { basic: 11, display: 'basic' } },
				maxTenacity: { name: 'maxTenacity', title: 'Max Map Bonus', defaultValue: false, width: { basic: 11, display: 'basic' } },
				
				boneCharge: { name: 'boneCharge', title: 'Use Bone Charge', defaultValue: false, width: { basic: 11, display: 'basic' } },
				voidFarm: { name: 'maxTenacity', title: 'Pre Void Farm', defaultValue: false, width: { basic: 11, display: 'basic' } },

				hitsSurvived: { name: 'hitsSurvived', title: 'Void Farm<br>Hits Survived', defaultValue: 0, width: { basic: 16, display: 'basic', type: 'text' } },
				hdRatio: { name: 'hdRatio', title: 'Void Farm<br>HD Ratio', defaultValue: 0, width: { basic: 16, display: 'basic' }, type: 'text' },
				
				jobratio: { name: 'jobratio', title: 'Void Farm<br>Job Ratio', defaultValue: "1,1,1,0", width: { basic: 14, display: 'basic' }, type: 'text' }, 
				mapCap: { name: 'mapCap', title: 'Map Cap', defaultValue: 100, width: { basic: 10, display: 'basic' } },
			},
			windowWidth: { basic: 45, advanced: 70 }
		},
		'Bone Shrine': {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 9, advanced: 6, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 10, advanced: 9, display: 'basic' } },

				world: { name: 'world', title: 'Zone', defaultValue: 999, width: { basic: 11, advanced: 9, display: 'basic' } },
				cell: { name: 'cell', title: 'Cell', defaultValue: 1, width: { basic: 11, advanced: 9, display: 'basic' } },

				boneamount: { name: 'boneamount', title: 'To Use', defaultValue: 0, width: { basic: 10, advanced: 9, display: 'basic' } },
				bonebelow: { name: 'bonebelow', title: 'Use Above', defaultValue: 0, width: { basic: 0, advanced: 9, display: 'advanced' } },

				jobratio: { name: 'jobratio', title: 'Job Ratio', defaultValue: '1,1,1,0', width: { basic: 12, advanced: 10, display: 'basic' }, type: 'text' },
				gather: { name: 'gather', title: 'Gather', defaultValue: 'food', width: { basic: 12, advanced: 10, display: 'basic' }, dropdownType: 'gather' },
				atlantrimp: { name: 'atlantrimp', title: 'Run Atlantrimp', defaultValue: false, width: { basic: 4, advanced: 4, display: 'advanced' } },

				runType: { name: 'runType', title: 'Run Type', defaultValue: 'All', width: { basic: 25, advanced: 25, display: 'basic', altWidth: function (vals) { return ['All', 'Daily'].includes(vals.runType) ? 25 : 11; } }, dropdownType: 'runType' },
				challenge: { name: 'challenge', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['Filler'].includes(vals.runType) ? 14 : 0; } }, dropdownType: 'challenge', extraTitle: 'Challenges' },
				challenge3: { name: 'challenge3', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['C3'].includes(vals.runType) ? 14 : 0; } }, dropdownType: 'c2', extraTitle: `C${atConfig.settingUniverse + 1} Challenges` },
				challengeOneOff: { name: 'challengeOneOff', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['One Off'].includes(vals.runType) ? 14 : 0; } }, dropdownType: 'oneOff', extraTitle: 'One Off Challenges' }
			},
			settingInputsDefault: {
				active: { name: 'active', title: 'Enable Setting', defaultValue: true, width: { basic: 10, display: 'basic' } },
				autoBone: { name: 'active', title: 'Auto Spend Charges', defaultValue: false, width: { basic: 12, display: 'basic' } },
				bonebelow: { name: 'bonebelow', title: 'Auto Spend at X Charges', defaultValue: 0, width: { basic: 15, display: 'basic' } },
				boneWorld: { name: 'boneWorld', title: 'Auto Spend From Z', defaultValue: 0, width: { basic: 15, display: 'basic' } },
				gather: { name: 'gather', title: 'Auto Spend Gather', defaultValue: 'food', width: { basic: 15, display: 'basic' }, dropdownType: 'gather' },
				jobratio: { name: 'jobratio', title: 'Auto Spend Job Ratio', defaultValue: "1,1,1,0", width: { basic: 15, display: 'basic' }, type: 'text' }, 
			},
			windowWidth: { basic: 50, advanced: 60 }
		},
		'Map Bonus': {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 5, advanced: 5, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 7, advanced: 7, display: 'basic' } },
				world: { name: 'world', title: 'Start Zone', defaultValue: 999, width: { basic: 7, advanced: 6, display: 'basic' } },
				endzone: { name: 'endzone', title: 'End Zone', defaultValue: 999, width: { basic: 7, advanced: 6, display: 'basic' } },
				cell: { name: 'cell', title: 'Cell', defaultValue: 1, width: { basic: 7, advanced: 5, display: 'basic' } },
				autoLevel: { name: 'autoLevel', title: 'Auto Level', defaultValue: true, width: { basic: 4, advanced: 4, display: 'basic' }, disable: function() { return false } },
				level: { name: 'level', title: 'Map Level', defaultValue: -1, width: { basic: 7, advanced: 5, display: 'basic' }, disable: function(vals) { return vals.autoLevel } },

				repeat: { name: 'repeat', title: 'Map Stacks', defaultValue: 10, width: { basic: 7, advanced: 6, display: 'basic' },  type: 'text' },
				hdRatio: { name: 'hdRatio', title: 'Above X HD Ratio', defaultValue: 0, width: { basic: 0, advanced: 7, display: 'advanced' },  type: 'text' },
				jobratio: { name: 'jobratio', title: 'Job Ratio', defaultValue: '1,1,1,0', width: { basic: 9, advanced: 9, display: 'basic' }, type: 'text' },
				special: { name: 'special', title: 'Special', defaultValue: '0', width: { basic: 20, advanced: 20, display: 'basic', altWidth: function (vals) { return ['hc', 'lc'].includes(vals.special) ? 12 : 20 }  }, dropdownType: 'special' },
				gather: { name: 'gather', title: '', defaultValue: 'food', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['hc', 'lc'].includes(vals.special) ? 8 : 0 }  }, dropdownType: 'gather', extraTitle: `Gather` },

				runType: { name: 'runType', title: 'Run Type', defaultValue: 'All', width: { basic: 19, advanced: 20, display: 'basic', altWidth: function (vals) { return ['All', 'Daily'].includes(vals.runType) ? 20 : 9; } }, dropdownType: 'runType' },
				challenge: { name: 'challenge', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['Filler'].includes(vals.runType) ? 11 : 0; } }, dropdownType: 'challenge', extraTitle: 'Challenges' },
				challenge3: { name: 'challenge3', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['C3'].includes(vals.runType) ? 11 : 0; } }, dropdownType: 'c2', extraTitle: `C${atConfig.settingUniverse + 1} Challenges` },
				challengeOneOff: { name: 'challengeOneOff', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['One Off'].includes(vals.runType) ? 11 : 0; } }, dropdownType: 'oneOff', extraTitle: 'One Off Challenges' }
			},
			settingInputsDefault: {
				active: { name: 'active', title: 'Enable Setting', defaultValue: true, width: { basic: 10, display: 'basic' } },
				special: { name: 'special', title: 'Special', defaultValue: '0', width: { basic: 25, display: 'basic', altWidth: function (vals) { return ['hc', 'lc'].includes(vals.special) ? 17 : 25 }  }, dropdownType: 'special' },
				gather: { name: 'gather', title: '', defaultValue: 'food', width: { basic: 0, display: 'basic', altWidth: function (vals) { return ['hc', 'lc'].includes(vals.special) ? 8 : 0 }  }, dropdownType: 'gather', extraTitle: `Gather` },
				jobratio: { name: 'jobratio', title: 'Job Ratio', defaultValue: "1,1,1,0", width: { basic: 15, display: 'basic' }, type: 'text' }, 
			},
			windowWidth: { basic: 65, advanced: 75 }
		},
		'Map Farm': {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 6, advanced: 4, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 6, advanced: 5, display: 'basic' } },
				world: { name: 'world', title: 'Start Zone', defaultValue: 999, width: { basic: 6, advanced: 5, display: 'basic' } },
				endzone: { name: 'endzone', title: 'End Zone', defaultValue: 999, width: { basic: 6, advanced: 4, display: 'basic' } },
				cell: { name: 'cell', title: 'Cell', defaultValue: 1, width: { basic: 6, advanced: 5, display: 'basic' } },
				autoLevel: { name: 'autoLevel', title: 'Auto Level', defaultValue: true, width: { basic: 4, advanced: 4, display: 'basic' }, disable: function() { return false } },
				level: { name: 'level', title: 'Map Level', defaultValue: -1, width: { basic: 6, advanced: 5, display: 'basic' }, disable: function(vals) { return vals.autoLevel } },

				mapType: { name: 'mapType', title: 'Farm Type', defaultValue: 'Map Count', width: { basic: 0, advanced: 8, display: 'advanced' }, dropdownType: 'mapType', disable: function() { return false } },
				repeat: { name: 'repeat', title: 'Map Repeats', defaultValue: 0, width: { basic: 8, advanced: 6, display: 'basic' },  type: 'text', extraTitle: function(vals) { return vals.settingType === 'advanced' && vals.mapType !== 'Map Count' ? `${vals.mapType.split(' ')[0]} Timer` : '' } },
				hdRatio: { name: 'hdRatio', title: 'Above X HD Ratio', defaultValue: 0, width: { basic: 0, advanced: 6, display: 'advanced' },  type: 'text' },
				jobratio: { name: 'jobratio', title: 'Job Ratio', defaultValue: '1,1,1,0', width: { basic: 8, advanced: 6, display: 'basic' }, type: 'text' },
				special: { name: 'special', title: 'Special', defaultValue: '0', width: { basic: 14, advanced: 14, display: 'basic', altWidth: function (vals) { return ['hc', 'lc'].includes(vals.special) ? 8 : 14 }  }, dropdownType: 'special' },
				gather: { name: 'gather', title: '', defaultValue: 'food', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['hc', 'lc'].includes(vals.special) ? 6 : 0 }  }, dropdownType: 'gather', extraTitle: `Gather` },

				repeatevery: { name: 'repeatevery', title: 'Repeat Every', defaultValue: 0, width: { basic: 6, advanced: 5, display: 'basic' } },
				atlantrimp: { name: 'atlantrimp', title: 'Run Atlantrimp', defaultValue: false, width: { basic: 0, advanced: 4, display: 'advanced' } },

				runType: { name: 'runType', title: 'Run Type', defaultValue: 'All', width: { basic: 22, advanced: 19, display: 'basic', altWidth: function (vals) { return ['All', 'Daily'].includes(vals.runType) ? (vals.settingType === 'basic' ? 24 : 19) : 10; } }, dropdownType: 'runType' },
				challenge: { name: 'challenge', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['Filler'].includes(vals.runType) ? (vals.settingType === 'basic' ? 14 : 9) : 0; } }, dropdownType: 'challenge', extraTitle: 'Challenges' },
				challenge3: { name: 'challenge3', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['C3'].includes(vals.runType) ? (vals.settingType === 'basic' ? 14 : 9) : 0; } }, dropdownType: 'c2', extraTitle: `C${atConfig.settingUniverse + 1} Challenges` },
				challengeOneOff: { name: 'challengeOneOff', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['One Off'].includes(vals.runType) ? (vals.settingType === 'basic' ? 14 : 9) : 0; } }, dropdownType: 'oneOff', extraTitle: 'One Off Challenges' }
			},
			settingInputsDefault: {
				active: { name: 'active', title: 'Enable Setting', defaultValue: true, width: { basic: 10, display: 'basic' } },
			},
			windowWidth: { basic: 70, advanced: 80 }
		},
		Raiding: {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 6, advanced: 6, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 10, advanced: 6, display: 'basic' } },
				world: { name: 'world', title: 'Start Zone', defaultValue: 999, width: { basic: 10, advanced: 6, display: 'basic' } },
				endzone: { name: 'endzone', title: 'End Zone', defaultValue: 999, width: { basic: 10, advanced: 6, display: 'basic' } },
				raidingzone: { name: 'raidingzone', title: 'Raiding Zone', defaultValue: '0', width: { basic: 10, advanced: 6, display: 'basic' }, dropdownType: 'mapLevel' },
				cell: { name: 'cell', title: 'Cell', defaultValue: 1, width: { basic: 10, advanced: 6, display: 'basic' } },
				repeatevery: { name: 'repeatevery', title: 'Repeat Every', defaultValue: 0, width: { basic: 10, advanced: 6, display: 'basic' } },
				
				raidingdropdown: { name: 'raidingdropdown', title: 'Frag Type', defaultValue: '0', width: { basic: 0, advanced: 8, display: 'advanced' }, dropdownType: 'raidingTypes' },
				prestigeGoal: { name: 'prestigeGoal', title: 'Prestige Goal', defaultValue: 'All', width: { basic: 0, advanced: 17, display: 'advanced' }, dropdownType: 'prestigeGoal' },
				incrementMaps: { name: 'incrementMaps', title: 'Increment Maps', defaultValue: false, width: { basic: 0, advanced: 5, display: 'advanced' } },

				runType: { name: 'runType', title: 'Run Type', defaultValue: 'All', width: { basic: 34, advanced: 28, display: 'basic', altWidth: function (vals) { return ['All', 'Daily'].includes(vals.runType) ? (vals.settingType === 'basic' ? 34 : 28) : (vals.settingType === 'basic' ? 16 : 13); } }, dropdownType: 'runType' },
				challenge: { name: 'challenge', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['Filler'].includes(vals.runType) ? (vals.settingType === 'basic' ? 18 : 15) : 0; } }, dropdownType: 'challenge', extraTitle: 'Challenges' },
				challenge3: { name: 'challenge3', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['C3'].includes(vals.runType) ? (vals.settingType === 'basic' ? 18 : 15) : 0; } }, dropdownType: 'c2', extraTitle: `C${atConfig.settingUniverse + 1} Challenges` },
				challengeOneOff: { name: 'challengeOneOff', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['One Off'].includes(vals.runType) ? (vals.settingType === 'basic' ? 18 : 15) : 0; } }, dropdownType: 'oneOff', extraTitle: 'One Off Challenges' }
			},
			settingInputsDefault: {
				active: { name: 'active', title: 'Enable Setting', defaultValue: true, width: { basic: 10, display: 'basic' } },
				recycle: { name: 'recycle', title: 'Recycle Maps', defaultValue: false, width: { basic: 15, display: 'basic' } },
			},
			windowWidth: { basic: 50, advanced: 70 }
		},
		'Bionic Raiding': {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 9, advanced: 7, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 9, advanced: 7, display: 'basic' } },
				world: { name: 'world', title: 'Start Zone', defaultValue: 999, width: { basic: 9, advanced: 7, display: 'basic' } },
				endzone: { name: 'endzone', title: 'End Zone', defaultValue: 999, width: { basic: 9, advanced: 7, display: 'basic' } },
				raidingzone: { name: 'raidingzone', title: 'Raiding Zone', defaultValue: 0, width: { basic: 9, advanced: 7, display: 'basic' } },
				cell: { name: 'cell', title: 'Cell', defaultValue: 1, width: { basic: 9, advanced: 7, display: 'basic' } },
				repeatevery: { name: 'repeatevery', title: 'Repeat Every', defaultValue: 0, width: { basic: 9, advanced: 7, display: 'basic' } },
				
				prestigeGoal: { name: 'prestigeGoal', title: 'Prestige Goal', defaultValue: 'All', width: { basic: 0, advanced: 19, display: 'advanced' }, dropdownType: 'prestigeGoal' },

				runType: { name: 'runType', title: 'Run Type', defaultValue: 'All', width: { basic: 36, advanced: 31, display: 'basic', altWidth: function (vals) { return ['All', 'Daily'].includes(vals.runType) ? (vals.settingType === 'basic' ? 37 : 32) : (vals.settingType === 'basic' ? 15 : 13); } }, dropdownType: 'runType' },
				challenge: { name: 'challenge', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['Filler'].includes(vals.runType) ? (vals.settingType === 'basic' ? 22 : 19) : 0; } }, dropdownType: 'challenge', extraTitle: 'Challenges' },
				challenge3: { name: 'challenge3', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['C3'].includes(vals.runType) ? (vals.settingType === 'basic' ? 22 : 19) : 0; } }, dropdownType: 'c2', extraTitle: `C${atConfig.settingUniverse + 1} Challenges` },
				challengeOneOff: { name: 'challengeOneOff', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['One Off'].includes(vals.runType) ? (vals.settingType === 'basic' ? 22 : 19) : 0; } }, dropdownType: 'oneOff', extraTitle: 'One Off Challenges' }
			},
			settingInputsDefault: {
				active: { name: 'active', title: 'Enable Setting', defaultValue: true, width: { basic: 10, display: 'basic' } },
			},
			windowWidth: { basic: 50, advanced: 65 }
		},
		'Tribute Farm': {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 7, advanced: 5, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 7, advanced: 5, display: 'basic' } },
				world: { name: 'world', title: 'Start Zone', defaultValue: 999, width: { basic: 7, advanced: 5, display: 'basic' } },
				endzone: { name: 'endzone', title: 'End Zone', defaultValue: 999, width: { basic: 7, advanced: 5, display: 'basic' } },
				cell: { name: 'cell', title: 'Cell', defaultValue: 1, width: { basic: 7, advanced: 5, display: 'basic' } },
				autoLevel: { name: 'autoLevel', title: 'Auto<br>Level', defaultValue: true, width: { basic: 4, advanced: 4, display: 'basic' }, disable: function() { return false } },
				level: { name: 'level', title: 'Map Level', defaultValue: -1, width: { basic: 7, advanced: 5, display: 'basic' }, disable: function(vals) { return vals.autoLevel } },
				
				mapType: { name: 'mapType', title: 'Farm Type', defaultValue: 'Absolute', width: { basic: 0, advanced: 9, display: 'advanced' }, dropdownType: 'mapType', disable: function() { return false } },
				tributes: { name: 'tributes', title: 'Tributes', defaultValue: 0, width: { basic: 7, advanced: 6, display: 'basic' }, extraTitle: function(vals) { return vals.mapType === 'Map Count' ? 'Max Maps' : '' } },
				mets: { name: 'mets', title: 'Mets', defaultValue: 0, width: { basic: 7, advanced: 6, display: 'basic' }, extraTitle: function(vals) { return vals.mapType === 'Map Count' ? 'Max Maps' : '' } },
				jobratio: { name: 'jobratio', title: 'Job Ratio', defaultValue: '1,1,1,0', width: { basic: 10, advanced: 7, display: 'basic' }, type: 'text' },
				repeatevery: { name: 'repeatevery', title: 'Repeat Every', defaultValue: 0, width: { basic: 7, advanced: 6, display: 'basic' } },
				atlantrimp: { name: 'atlantrimp', title: 'Run Atlantrimp', defaultValue: false, width: { basic: 0, advanced: 6, display: 'advanced' } },
				buildings: { name: 'buildings', title: 'Buy<br>Buildings', defaultValue: true, width: { basic: 0, advanced: 10, display: 'advanced' } },

				runType: { name: 'runType', title: 'Run Type', defaultValue: 'All', width: { basic: 23, advanced: 16, display: 'basic', altWidth: function (vals) { return ['All', 'Daily'].includes(vals.runType) ? (vals.settingType === 'basic' ? 23 : 16) : (vals.settingType === 'basic' ? 9 : 7); } }, dropdownType: 'runType' },
				challenge: { name: 'challenge', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['Filler'].includes(vals.runType) ? (vals.settingType === 'basic' ? 14 : 9) : 0; } }, dropdownType: 'challenge', extraTitle: 'Challenges' },
				challenge3: { name: 'challenge3', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['C3'].includes(vals.runType) ? (vals.settingType === 'basic' ? 14 : 9) : 0; } }, dropdownType: 'c2', extraTitle: `C${atConfig.settingUniverse + 1} Challenges` },
				challengeOneOff: { name: 'challengeOneOff', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['One Off'].includes(vals.runType) ? (vals.settingType === 'basic' ? 14 : 9) : 0; } }, dropdownType: 'oneOff', extraTitle: 'One Off Challenges' }
			},
			settingInputsDefault: {
				active: { name: 'active', title: 'Enable Setting', defaultValue: true, width: { basic: 10, display: 'basic' } },
			},
			windowWidth: { basic: 60, advanced: 80 }
		},
		'Smithy Farm': {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 7, advanced: 6, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 8, advanced: 6, display: 'basic' } },
				world: { name: 'world', title: 'Start Zone', defaultValue: 999, width: { basic: 8, advanced: 7, display: 'basic' } },
				endzone: { name: 'endzone', title: 'End Zone', defaultValue: 999, width: { basic: 8, advanced: 7, display: 'basic' } },
				cell: { name: 'cell', title: 'Cell', defaultValue: 1, width: { basic: 8, advanced: 6, display: 'basic' } },
				autoLevel: { name: 'autoLevel', title: 'Auto Level', defaultValue: true, width: { basic: 6, advanced: 6, display: 'basic' }, disable: function() { return false } },
				level: { name: 'level', title: 'Map Level', defaultValue: -1, width: { basic: 8, advanced: 7, display: 'basic' }, disable: function(vals) { return vals.autoLevel } },

				mapType: { name: 'mapType', title: 'Farm Type', defaultValue: 'Absolute', width: { basic: 0, advanced: 13, display: 'advanced' }, dropdownType: 'mapType', disable: function() { return false } },
				repeat: { name: 'repeat', title: 'Smithies', defaultValue: 0, width: { basic: 8, advanced: 7, display: 'basic' }, extraTitle: function(vals) { return vals.mapType === 'Map Count' ? 'Max Maps' : '' } },
				repeatevery: { name: 'repeatevery', title: 'Repeat Every', defaultValue: 0, width: { basic: 8, advanced: 7, display: 'basic' } },
				meltingPoint: { name: 'meltingPoint', title: 'Run MP', defaultValue: false, width: { basic: 0, advanced: 5, display: 'advanced' } },

				runType: { name: 'runType', title: 'Run Type', defaultValue: 'All', width: { basic: 30, advanced: 23, display: 'basic', altWidth: function (vals) { return ['All', 'Daily'].includes(vals.runType) ? (vals.settingType === 'basic' ? 31 : 23) : (vals.settingType === 'basic' ? 14 : 10); } }, dropdownType: 'runType' },
				challenge: { name: 'challenge', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['Filler'].includes(vals.runType) ? (vals.settingType === 'basic' ? 17 : 13) : 0; } }, dropdownType: 'challenge', extraTitle: 'Challenges' },
				challenge3: { name: 'challenge3', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['C3'].includes(vals.runType) ? (vals.settingType === 'basic' ? 17 : 13) : 0; } }, dropdownType: 'c2', extraTitle: `C${atConfig.settingUniverse + 1} Challenges` },
				challengeOneOff: { name: 'challengeOneOff', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['One Off'].includes(vals.runType) ? (vals.settingType === 'basic' ? 17 : 13) : 0; } }, dropdownType: 'oneOff', extraTitle: 'One Off Challenges' }
			},
			settingInputsDefault: {
				active: { name: 'active', title: 'Enable Setting', defaultValue: true, width: { basic: 10, display: 'basic' } },
			},
			windowWidth: { basic: 55, advanced: 70 }
		},
		'Worshipper Farm': {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 6, advanced: 6, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 6, advanced: 6, display: 'basic' } },
				world: { name: 'world', title: 'Start Zone', defaultValue: 999, width: { basic: 8, advanced: 8, display: 'basic' } },
				endzone: { name: 'endzone', title: 'End Zone', defaultValue: 999, width: { basic: 8, advanced: 8, display: 'basic' } },
				cell: { name: 'cell', title: 'Cell', defaultValue: 1, width: { basic: 8, advanced: 8, display: 'basic' } },
				autoLevel: { name: 'autoLevel', title: 'Auto Level', defaultValue: true, width: { basic: 5, advanced: 5, display: 'basic' }, disable: function() { return false } },
				level: { name: 'level', title: 'Map Level', defaultValue: -1, width: { basic: 8, advanced: 8, display: 'basic' }, disable: function(vals) { return vals.autoLevel } },
				worshipper: { name: 'worshipper', title: 'Worshippers', defaultValue: 0, width: { basic: 8, advanced: 8, display: 'basic' } },

				jobratio: { name: 'jobratio', title: 'Job<br>Ratio', defaultValue: '1,1,1,0', width: { basic: 9, advanced: 9, display: 'basic' }, type: 'text' },
				repeatevery: { name: 'repeatevery', title: 'Repeat Every', defaultValue: 0, width: { basic: 8, advanced: 8, display: 'basic' } },

				runType: { name: 'runType', title: 'Run Type', defaultValue: 'All', width: { basic: 25, advanced: 25, display: 'basic', altWidth: function (vals) { return ['All', 'Daily'].includes(vals.runType) ? 26 : 13; } }, dropdownType: 'runType' },
				challenge: { name: 'challenge', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['Filler'].includes(vals.runType) ? 13 : 0; } }, dropdownType: 'challenge', extraTitle: 'Challenges' },
				challenge3: { name: 'challenge3', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['C3'].includes(vals.runType) ? 13 : 0; } }, dropdownType: 'c2', extraTitle: `C${atConfig.settingUniverse + 1} Challenges` },
				challengeOneOff: { name: 'challengeOneOff', title: '', defaultValue: 'All', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['One Off'].includes(vals.runType) ? 13 : 0; } }, dropdownType: 'oneOff', extraTitle: 'One Off Challenges' }
			},
			settingInputsDefault: {
				active: { name: 'active', title: 'Enable Setting', defaultValue: true, width: { basic: 10, display: 'basic' } },
				shipSkipEnabled: { name: 'shipSkipEnabled', title: 'Enable Skip', defaultValue: false, width: { basic: 15, display: 'basic' } },
				shipskip: { name: 'shipskip', title: 'Skip Value', defaultValue: 0, width: { basic: 15, display: 'basic' }, type: 'text' },
			},
			windowWidth: { basic: 65, advanced: 65 }
		},  
		Toxicity: {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 6, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 8, display: 'basic' } },
				world: { name: 'world', title: 'Start Zone', defaultValue: 999, width: { basic: 8, display: 'basic' } },
				endzone: { name: 'endzone', title: 'End Zone', defaultValue: 999, width: { basic: 8, display: 'basic' } },
				cell: { name: 'cell', title: 'Cell', defaultValue: 1, width: { basic: 8, display: 'basic' } },
				autoLevel: { name: 'autoLevel', title: 'Auto Level', defaultValue: true, width: { basic: 5, display: 'basic' }, disable: function() { return false } },
				level: { name: 'level', title: 'Map Level', defaultValue: -1, width: { basic: 8, display: 'basic' }, disable: function(vals) { return vals.autoLevel } },

				repeat: { name: 'repeat', title: 'Map Repeats', defaultValue: 0, width: { basic: 8, display: 'basic' } },
				jobratio: { name: 'jobratio', title: 'Job Ratio', defaultValue: '1,1,1,0', width: { basic: 8, display: 'basic' }, type: 'text' }, 
				special: { name: 'special', title: 'Special', defaultValue: '0', width: { basic: 24, display: 'basic', altWidth: function (vals) { return ['hc', 'lc'].includes(vals.special) ? 17 : 25 }  }, dropdownType: 'special' },
				gather: { name: 'gather', title: '', defaultValue: 'food', width: { basic: 0, display: 'basic', altWidth: function (vals) { return ['hc', 'lc'].includes(vals.special) ? 8 : 0 }  }, dropdownType: 'gather', extraTitle: `Gather` },

				repeatevery: { name: 'repeatevery', title: 'Repeat Every', defaultValue: 0, width: { basic: 8, display: 'basic' } },
			
			},
			settingInputsDefault: {
				active: { name: 'active', title: 'Enable Setting', defaultValue: true, width: { basic: 10, display: 'basic' } },
			},
			windowWidth: { basic: 55 }
		},
		Quagmire: {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 10, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 18, display: 'basic' } },
				world: { name: 'world', title: 'Start Zone', defaultValue: 999, width: { basic: 18, display: 'basic' } },
				cell: { name: 'cell', title: 'Cell', defaultValue: 1, width: { basic: 18, display: 'basic' } },
				bogs: { name: 'bogs', title: 'Black Bogs', defaultValue: 0, width: { basic: 18, display: 'basic' } },
				jobratio: { name: 'jobratio', title: 'Job Ratio', defaultValue: '1,1,1,0', width: { basic: 18, display: 'basic' }, type: 'text' }, 			
			},
			settingInputsDefault: {
				active: { name: 'active', title: 'Enable Setting', defaultValue: true, width: { basic: 10, display: 'basic' } },
				abandonZone: { name: 'abandonZone', title: 'Abandon Challenge Zone', defaultValue: 0, width: { basic: 30, display: 'basic' } },
			},
			windowWidth: { basic: 40 }
		},
		Archaeology: {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 6, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 8, display: 'basic' } },
				world: { name: 'world', title: 'Start Zone', defaultValue: 999, width: { basic: 8, display: 'basic' } },
				endzone: { name: 'endzone', title: 'End Zone', defaultValue: 999, width: { basic: 8, display: 'basic' } },
				cell: { name: 'cell', title: 'Cell', defaultValue: 1, width: { basic: 8, display: 'basic' } },
				autoLevel: { name: 'autoLevel', title: 'Auto Level', defaultValue: true, width: { basic: 6, display: 'basic' }, disable: function() { return false } },
				level: { name: 'level', title: 'Map Level', defaultValue: -1, width: { basic: 8, display: 'basic' }, disable: function(vals) { return vals.autoLevel } },

				relics: { name: 'relics', title: 'Relic String', defaultValue: '0', width: { basic: 20, display: 'basic' }, type: 'text' }, 
				mapCap: { name: 'mapCap', title: 'Map Cap', defaultValue: 100, width: { basic: 7, display: 'basic' } },
				jobratio: { name: 'jobratio', title: 'Job Ratio', defaultValue: '1,1,1,1', width: { basic: 13, display: 'basic' }, type: 'text' }, 
				repeatevery: { name: 'repeatevery', title: 'Repeat Every', defaultValue: 0, width: { basic: 8, display: 'basic' } },
			
			},
			settingInputsDefault: {
				active: { name: 'active', title: 'Enable Setting', defaultValue: true, width: { basic: 10, display: 'basic' } },
			},
			windowWidth: { basic: 50 }
		},
		Insanity: {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 8, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 8, display: 'basic' } },
				world: { name: 'world', title: 'Zone', defaultValue: 999, width: { basic: 8, display: 'basic' } },
				cell: { name: 'cell', title: 'Cell', defaultValue: 1, width: { basic: 8, display: 'basic' } },
				autoLevel: { name: 'autoLevel', title: 'Auto Level', defaultValue: true, width: { basic: 5, display: 'basic' }, disable: function() { return false } },
				level: { name: 'level', title: 'Map Level', defaultValue: -1, width: { basic: 8, display: 'basic' }, disable: function(vals) { return vals.autoLevel } },

				insanity: { name: 'insanity', title: 'Insanity', defaultValue: 0, width: { basic: 9, display: 'basic' } },
				jobratio: { name: 'jobratio', title: 'Job Ratio', defaultValue: '1,1,1,0', width: { basic: 11, display: 'basic' }, type: 'text' }, 
				special: { name: 'special', title: 'Special', defaultValue: '0', width: { basic: 26, display: 'basic', altWidth: function (vals) { return ['hc', 'lc'].includes(vals.special) ? 16 : 26 }  }, dropdownType: 'special' },
				gather: { name: 'gather', title: '', defaultValue: 'food', width: { basic: 0, display: 'basic', altWidth: function (vals) { return ['hc', 'lc'].includes(vals.special) ? 10 : 0 }  }, dropdownType: 'gather', extraTitle: `Gather` },
				destack: { name: 'destack', title: 'Destack', defaultValue: false, width: { basic: 9, display: 'basic' } },
			
			},
			settingInputsDefault: {
				active: { name: 'active', title: 'Enable Setting', defaultValue: true, width: { basic: 10, display: 'basic' } },
			},
			windowWidth: { basic: 55 }
		},
		Alchemy: {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 6, advanced: 5, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 7, advanced: 5, display: 'basic' } },
				world: { name: 'world', title: 'Start Zone', defaultValue: 999, width: { basic: 7, advanced: 5, display: 'basic' } },
				endzone: { name: 'endzone', title: 'End Zone', defaultValue: 999, width: { basic: 0, advanced: 5, display: 'advanced' } },
				cell: { name: 'cell', title: 'Cell', defaultValue: 1, width: { basic: 7, advanced: 5, display: 'basic' } },
				autoLevel: { name: 'autoLevel', title: 'Auto Level', defaultValue: true, width: { basic: 6, advanced: 5, display: 'basic' }, disable: function() { return false } },
				level: { name: 'level', title: 'Map Level', defaultValue: -1, width: { basic: 7, advanced: 5, display: 'basic' }, disable: function(vals) { return vals.autoLevel } },

				mapType: { name: 'mapType', title: 'Farm Type', defaultValue: 'Absolute', width: { basic: 0, advanced: 13 , display: 'advanced' }, dropdownType: 'mapType', disable: function() { return false } },
				potionType: { name: 'potionType', title: 'Potion Type', defaultValue: 'h', width: { basic: 18, advanced: 16, display: 'basic' }, dropdownType: 'potionTypes' },
				potionNumber: { name: 'potionNumber', title: 'Potion Number', defaultValue: 0, width: { basic: 9, advanced: 6, display: 'basic' },  extraTitle: function(vals) { return vals.mapType === 'Map Count' ? `Max Maps` : '' } },

				jobratio: { name: 'jobratio', title: 'Job Ratio', defaultValue: '1,1,1,0', width: { basic: 11, advanced: 6, display: 'basic' }, type: 'text' },
				special: { name: 'special', title: 'Special', defaultValue: '0', width: { basic: 21, advanced: 19, display: 'basic', altWidth: function (vals) { return ['hc', 'lc'].includes(vals.special) ? (vals.settingType === 'basic' ? 13 : 11) : (vals.settingType === 'basic' ? 21 : 19) }  }, dropdownType: 'special' },
				gather: { name: 'gather', title: '', defaultValue: 'food', width: { basic: 0, advanced: 0, display: 'basic', altWidth: function (vals) { return ['hc', 'lc'].includes(vals.special) ? 8 : 0 }  }, dropdownType: 'gather', extraTitle: `Gather` },
				repeatevery: { name: 'repeatevery', title: 'Repeat Every', defaultValue: 0, width: { basic: 0, advanced: 5, display: 'advanced' } },
			},
			settingInputsDefault: {
				active: { name: 'active', title: 'Enable Setting', defaultValue: true, width: { basic: 7, display: 'basic' } },
				voidpurchase: { name: 'voidpurchase', title: 'Void<br>Purchase', defaultValue: true, width: { basic: 15, display: 'basic' } },
			},
			windowWidth: { basic: 60, advanced: 75 }
		},
		Hypothermia: {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 10, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 12, display: 'basic' } },
				world: { name: 'world', title: 'Zone', defaultValue: 999, width: { basic: 12, display: 'basic' } },
				cell: { name: 'cell', title: 'Cell', defaultValue: 1, width: { basic: 12, display: 'basic' } },
				autoLevel: { name: 'autoLevel', title: 'Auto Level', defaultValue: true, width: { basic: 10, display: 'basic' }, disable: function() { return false } },
				level: { name: 'level', title: 'Map Level', defaultValue: -1, width: { basic: 12, display: 'basic' }, disable: function(vals) { return vals.autoLevel } },

				bonfire: { name: 'bonfire', title: 'Bonfires', defaultValue: 0, width: { basic: 12, display: 'basic' } },
				jobratio: { name: 'jobratio', title: 'Job Ratio', defaultValue: '1,1,1,0', width: { basic: 20, display: 'basic' }, type: 'text' }, 
			},
			settingInputsDefault: {
				active: { name: 'active', title: 'Enable Setting', defaultValue: true, width: { basic: 10, display: 'basic' } },
				frozencastle: { name: 'frozencastle', title: 'Frozen Castle', defaultValue: "200, 99", width: { basic: 22, display: 'basic' }, type: 'text' },
				autostorage: { name: 'autostorage', title: 'Auto<br>Storage', defaultValue: true, width: { basic: 15, display: 'basic' } },
				packrat: { name: 'packrat', title: 'Packrat', defaultValue: false, width: { basic: 15, display: 'basic' } },
			},
			windowWidth: { basic: 45 }
		},
		Profile: {
			settingInputs: {
				profileName: { name: 'profileName', title: 'Profile Name', defaultValue: 'None', width: { basic: 20, display: 'basic' }, type: 'text' },
				settingString: { name: 'settingString', title: 'Profile String', defaultValue: `${serializeSettings()}`, width: { basic: 55, display: 'basic' }, type: 'text' },
				load: { name: 'load', title: 'Load Profile', defaultValue: undefined, width: { basic: 15, display: 'basic' } },
				overwrite: { name: 'overwrite', title: 'Overwrite Profile', defaultValue: false, width: { basic: 10, display: 'basic' } },
			},
			windowWidth: { basic: 60 }
		},
		'Spire Assault': {
			settingInputs: {
				active: { name: 'active', title: 'Active?', defaultValue: true, width: { basic: 8, display: 'basic' } },
				priority: { name: 'priority', title: 'Priority', defaultValue: 1, width: { basic: 8, display: 'basic' } },
				world: { name: 'world', title: 'Level', defaultValue: 0, width: { basic: 8, display: 'basic' } },
				preset: { name: 'preset', title: 'Preset', defaultValue: '0', width: { basic: 23, display: 'basic' }, dropdownType: 'spireAssaultPresets' },
				settingType: { name: 'settingType', title: 'Setting Type', defaultValue: 'Clear Level', width: { basic: 20, display: 'basic' }, dropdownType: 'spireAssaultItemTypes', disable: function() { return false } },
				item: { name: 'item', title: 'Item', defaultValue: 'Menacing_Mask', width: { basic: 25, display: 'basic', altWidth: function (vals) { return ['Clear Level', 'Level Equipment', 'Level Ring'].includes(vals.settingType) ? 25 : 0; } }, dropdownType: 'spireAssaultItems', disable: function(vals) { return ['Clear Level', 'Level Ring'].includes(vals.settingType) } },
				bonusItem: { name: 'bonusItem', title: 'Item', defaultValue: 'Stats', width: { basic: 0, display: 'basic', altWidth: function (vals) { return ['Level Bonus'].includes(vals.settingType) ? 25 : 0; } }, dropdownType: 'spireAssaultBonuses'},
				oneTimerItem: { name: 'oneTimerItem', title: '', defaultValue: 'Gathermate', width: { basic: 0, display: 'basic', altWidth: function (vals) { return ['Buy One Timer'].includes(vals.settingType) ? 25 : 0; } }, dropdownType: 'spireAssaultOneTimers' },
				levelSA: { name: 'levelSA', title: 'Item Level', defaultValue: 0, width: { basic: 8, display: 'basic' }, disable: function(vals) { return ['Clear Level', 'Buy One Timer'].includes(vals.settingType) } },
			},
			settingInputsDefault: {
				active: { name: 'active', title: 'Enable Setting', defaultValue: true, width: { basic: 10, display: 'basic' } },
			},
			windowWidth: { basic: 55 }
		}
	};
}

function _mapSettingsRowTitles(settingObj, settingType = 'advanced', defaultRow = false) {
	if (!settingObj) return;
	const settingInputs = JSON.parse(settingObj);
	let tooltipText = `<div id='windowContainer' style='display: block'><div class='row windowRow titles'>`;
	for (let item in settingInputs) {
		item = settingInputs[item];
		let width = item.width[settingType] ? item.width[settingType] : 0;
		if (item.width.display === 'advanced' && settingType !== 'advanced') width = 0;
		const display = width > 0 ? 'inline-block' : 'none';
		const transform = item.name === 'active' && !defaultRow ? `transform: translateX(-35%);` : '';
		tooltipText += `<div class='windowDisplay' style = 'display: ${display}; width: ${item.width[settingType]}%; ${transform}'>${item.title}</div>`;
	}

	tooltipText += '</div>';

	return tooltipText;
}

function _mapSettingsRowPopulateInputs(titleText, vals, settingInputs, rowNo, cssData, settingType = 'advanced') {
	const dropdowns = _mapSettingsDropdowns(atConfig.settingUniverse, vals, titleText, settingType);
	let backgroundStyle = '';
	const updateWorldBackground = atConfig.settingUniverse === 1 && settingInputs.world && !titleText.includes('Spire Assault') && game.stats.highestLevel.valueTotal() >= 247;
	if (updateWorldBackground) {
		const natureStyles = {
			None: 'unset',
			Poison: 'rgba(50, 150, 50, 0.75)',
			Wind: 'rgba(60, 75, 130, 0.75)',
			Ice: 'rgba(50, 50, 200, 0.75)'
		};

		const empowerment = getZoneEmpowerment(vals.world);
		backgroundStyle = `${natureStyles[empowerment]}`;
	}

	let tooltipText = `<div id='windowRow${rowNo}' class='row windowRow ${cssData.classList}'${cssData.style}>`;
	if (rowNo !== '') tooltipText += `<div class='windowDelete' onclick='_mapSettingsRemoveRow("${rowNo}")'><span class='icomoon icon-cross'></span></div>`;

	const onChange = `onchange = '_mapSettingsUpdatePreset("${rowNo}","${titleText}")'`;
	for (let item in settingInputs) {
		item = settingInputs[item];
		const capitalizedItemName = item.name.charAt(0).toUpperCase() + item.name.slice(1);

		const button = typeof vals[item.name] === 'undefined' && item.name === 'load' ? `<button style='display: inline-block; width: auto;' onclick='_displayImportAutoTrimpsProfile("${LZString.compressToBase64(vals.settingString)}", "${vals.profileName}")'>Load Profile</button>` : '';

		const checkbox = typeof vals[item.name] === 'boolean' ? _mapSettingsBuildCheckbox(`window${capitalizedItemName}${rowNo}`, '', vals[item.name], rowNo, titleText) : '';

		const dropdown = item.dropdownType ? `<select id='window${capitalizedItemName}${rowNo}' value='${vals[item.name]}' ${onChange}>${dropdowns[item.dropdownType]}</select>` : '';

		const textBox = item.type === 'text' ? `<input id='window${capitalizedItemName}${rowNo}' type='text' value='${vals[item.name]}' placeholder='${item.defaultValue}'/>` : '';

		const value = typeof vals[item.name] === 'number' ? `<input id='window${capitalizedItemName}${rowNo}' type='number' value='${vals[item.name]}' ${item.name === 'world' && updateWorldBackground ? onChange : ''} placeholder='${item.defaultValue}'/>` : '';

		/* style setup */
		let width = item.width[settingType] ? item.width[settingType] : 0;
		if (item.width.altWidth) width = item.width.altWidth(vals);
		if (item.width.display === 'advanced' && settingType !== 'advanced') width = 0;
		const elemDisplay = width > 0 ? 'inline-block' : 'none';
		const textAlignCenter = checkbox ? ' text-align: center;' : '';
		const elemDisabled = item.disable && item.disable(vals) ? ' opacity: 0.3; cursor: not-allowed; pointer-events: none;' : '';
		const elemBackground = item.name === 'world' && updateWorldBackground ? ` background: ${backgroundStyle};` : '';
		const elemStyle = `display: ${elemDisplay}; width: ${width}%;${textAlignCenter}${elemBackground}${elemDisabled}`;

		const extraText = item.extraTitle ? (typeof item.extraTitle === 'function' ? item.extraTitle(vals) : item.extraTitle) : '';
		const extraDiv = item.extraTitle ? `<div style='font-size: 0.6vw;${textAlignCenter}'>${extraText}</div>` : '';
		const title = button ? button : checkbox ? checkbox : textBox ? textBox : dropdown ? dropdown : value;

		tooltipText += `<div id=${item.name}${rowNo} class='windowDisplay' style='${elemStyle}' data-defaultvalue="${item.defaultValue}">${extraDiv}${title}</div>`;
	}

	tooltipText += '</div>';
	return tooltipText;
}

function _mapSettingsBuildCheckbox(id, extraClass = '', enabled, index, titleText) {
	const defaultClasses = 'niceCheckbox noselect';
	const isChecked = enabled ? 'icomoon icon-checkbox-checked' : 'icomoon icon-checkbox-unchecked';
	const title = enabled ? 'Checked' : 'Not Checked';
	const extraFunction = id.includes('windowAutoLevel') ? ` _mapSettingsUpdatePreset("${index}", "${titleText}");` : '';

	return `
        <span id='${id}' title='${title}' class='${extraClass} ${defaultClasses} ${isChecked}' data-checked='${enabled}' onclick='swapNiceCheckbox(this);${extraFunction}'></span>
    `;
}

function _mapSettingsGetRowIDs(elem, index) {
	const elemChildren = elem.children;
	const elemChildrenIDs = [];

	for (let x = 0; x < elemChildren.length; x++) {
		const child = elemChildren[x];
		for (let y = 0; y < child.children.length; y++) {
			const id = child.children[y].id;
			if (id !== '') {
				if (index) elemChildrenIDs.push(id.slice(0, -index.toString().length));
				else elemChildrenIDs.push(id);
			}
		}
	}

	return elemChildrenIDs;
}

function _mapSettingsAddRow(titleText) {
	const maxRows = 30;

	const rows = Array.from({ length: maxRows }, (_, x) => document.getElementById(`windowRow${x}`));
	const firstHiddenRow = rows.find((row) => row.style.display === 'none');

	if (firstHiddenRow) {
		firstHiddenRow.style.display = '';
		swapClass('disabled', 'active', firstHiddenRow);
		const row = firstHiddenRow.id.replace(/[a-zA-Z]/g, '');
		const rowElem = document.getElementById(`windowPriority${row}`);
		if (rowElem) {
			const rows = Array.from({ length: Number(row) }, (_, x) => document.getElementById(`windowRow${x}`));
			const priorities = rows.map((row) => parseInt(document.getElementById(`windowPriority${row.id.replace(/[a-zA-Z]/g, '')}`).value, 10));
			const highestPriority = Math.max(...priorities);
			rowElem.value = Math.max(0, highestPriority) + 1;
		}

		_mapSettingsUpdatePreset(row, titleText);
	}

	const tooltipDiv = document.getElementById('tooltipDiv');
	const needScroll = document.querySelectorAll('#windowContainer .active').length > 10;
	tooltipDiv.style.top = '10%';
	tooltipDiv.style.left = '1%';
	tooltipDiv.style.height = 'auto';
	tooltipDiv.style.maxHeight = `${window.innerHeight * 0.85}px`;
	tooltipDiv.style.overflowY = needScroll ? 'scroll' : 'none';

	const btnElem = document.getElementById('windowAddRowBtn');
	btnElem.style.display = rows.some((row) => row.style.display === 'none') ? 'inline-block' : 'none';
}

function _mapSettingsRemoveRow(index) {
	const elem = document.getElementById('windowRow' + index);
	if (!elem) return;

	const elemChildrenIDs = _mapSettingsGetRowIDs(elem, index);
	for (let i = 0; i < elemChildrenIDs.length; i++) {
		const id = elemChildrenIDs[i];
		if (id === 'windowRow') continue;

		const elem = document.getElementById(`${id}${index}`);
		if (elem) {
			const defaultValue = elem.parentNode.dataset.defaultvalue;
			if (!elem.type) {
				swapClass('icon-', `icon-checkbox-${defaultValue ? '' : 'un'}checked`, elem);
				elem.setAttribute('data-checked', defaultValue);
			} else {
				elem.value = defaultValue;
			}
		}
	}

	const btnElem = document.getElementById('windowAddRowBtn');
	btnElem.style.display = 'inline-block';
	elem.style.display = 'none';
	swapClass('active', 'disabled', elem);

	const tooltipDiv = document.getElementById('tooltipDiv');
	const needScroll = document.querySelectorAll('#windowContainer .active').length > 10;
	tooltipDiv.style.top = '10%';
	tooltipDiv.style.left = '1%';
	tooltipDiv.style.height = 'auto';
	tooltipDiv.style.maxHeight = `${window.innerHeight * 0.85}px`;
	tooltipDiv.style.overflowY = needScroll ? 'scroll' : 'none';
}

function _mapSettingsUpdatePreset(index = '', titleText) {
	const settingInputsObj = _mapSettingsInputObj()[titleText];
	const settingInputs = settingInputsObj[index ? 'settingInputs' : 'settingInputsDefault'];
	const settingTypeElem = document.getElementById('altVersionBtn');
	const settingType = !settingTypeElem ? 'basic' : settingTypeElem.dataset.settingType;
	const vals = { settingType };

	for (let item in settingInputs) {
		item = settingInputs[item];

		if (item.name === 'world') {
			/* changing rows to use the colour of the Nature type that the world input will be run on. */
			if (atConfig.settingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 247) {
				const world = document.getElementById('windowWorld' + index);
				const natureStyle = ['unset', 'rgba(50, 150, 50, 0.75)', 'rgba(60, 75, 130, 0.75)', 'rgba(50, 50, 200, 0.75)'];
				const natureList = ['None', 'Poison', 'Wind', 'Ice'];
				const natureIndex = natureList.indexOf(getZoneEmpowerment(world.value));
				world.parentNode.style.background = natureStyle[natureIndex];
			}
			continue;
		}

		if (!item.width.altWidth && !item.extraTitle && !item.disable) continue;
		if (item.width.display === 'advanced' && vals.settingType !== 'advanced') continue;
		const capitalizedItemName = item.name.charAt(0).toUpperCase() + item.name.slice(1);
		const elem = document.getElementById(`window${capitalizedItemName}${index}`);
		if (!elem) continue;

		vals[item.name] = elem.type ? elem.value : elem.dataset.checked === 'true';
		if (item.width.altWidth) {
			const width = item.width.altWidth(vals);
			const elemDisplay = width && width > 0 ? 'inline-block' : 'none';
			elem.parentNode.style.width = `${width}%`;
			elem.parentNode.style.display = elemDisplay;
		}

		if (item.disable) {
			const disabled = item.disable(vals);
			elem.parentNode.style.opacity = disabled ? 0.3 : 1;
			elem.parentNode.style.cursor = disabled ? 'not-allowed' : 'pointer';
			elem.parentNode.style.pointerEvents = disabled ? 'none' : 'auto';
		}

		if (item.extraTitle) {
			const extraText = item.extraTitle ? (typeof item.extraTitle === 'function' ? item.extraTitle(vals) : item.extraTitle) : '';
			const extraElem = elem.parentNode.children[0];
			if (extraElem.innerHTML !== extraText) extraElem.innerHTML = extraText;
		}
	}
}

function _mapSettingsSave(titleText, varPrefix, activeSettings, reopen) {
	const s = JSON.parse(activeSettings);
	const setting = [];
	const profileData = {};

	const settingObj = _mapSettingsInputObj()[titleText];
	const settingTypeElem = document.getElementById('altVersionBtn');
	const settingType = !settingTypeElem ? 'basic' : settingTypeElem.dataset.settingType;
	const settingInputsDefault = settingObj.settingInputsDefault;
	const settingInputs = settingObj.settingInputs;
	const defaultSetting = { settingType };
	const floatSettings = ['hdBase', 'hdMult', 'hdRatio', 'hitsSurvived', 'voidHDRatio'];
	let error = '';

	for (let item in settingInputsDefault) {
		item = settingInputsDefault[item];
		const capitalizedItemName = item.name.charAt(0).toUpperCase() + item.name.slice(1);
		const elem = document.getElementById(`window${capitalizedItemName}`);
		if (!elem) continue;

		if (item.name === 'gather' && defaultSetting.special && defaultSetting.special !== 'hc' && defaultSetting.special !== 'lc') {
			defaultSetting[item.name] = null;
			continue;
		}

		if (item.name === 'frozencastle') {
			defaultSetting[item.name] = elem.value.split(',');
			continue;
		}

		const parseFunction = floatSettings.includes(item.name) ? parseFloat : parseInt;
		defaultSetting[item.name] = elem.type ? (elem.type === 'number' ? parseFunction(elem.value, 10) : elem.value) : elem.dataset.checked === 'true';

		const settingType = typeof defaultSetting[item.name];
		if (settingType === 'undefined' || (settingType === 'number' && isNaN(defaultSetting[item.name])) || (settingType === 'string' && defaultSetting[item.name] === '')) {
			error += ` The top rows ${item.title.replace(/<br>/g, ' ')} input is missing a value.<br>`;
		}
	}

	/* row settings */
	let counter = 1;
	for (let x = 0; x < s.maxSettings; x++) {
		const thisSetting = { row: counter };
		const parent = document.getElementById('windowRow' + x);
		if (parent.style.display === 'none') continue;
		counter++;

		for (let item in settingInputs) {
			item = settingInputs[item];
			const capitalizedItemName = item.name.charAt(0).toUpperCase() + item.name.slice(1);
			const elem = document.getElementById(`window${capitalizedItemName}${x}`);
			if (!elem || s.profile) continue;

			if (item.name === 'challenge' && thisSetting.runType !== 'Filler') {
				thisSetting[item.name] = null;
			} else if (item.name === 'challenge3' && thisSetting.runType !== 'C3') {
				thisSetting[item.name] = null;
			} else if (item.name === 'challengeOneOff' && thisSetting.runType !== 'One Off') {
				thisSetting[item.name] = null;
			} else if (item.name === 'gather' && thisSetting.special && thisSetting.special !== 'hc' && thisSetting.special !== 'lc') {
				thisSetting[item.name] = null;
			} else if (item.name === 'repeat' && thisSetting.mapType === 'Map Count') {
				thisSetting[item.name] = parseInt(elem.value, 10);
			} else {
				const parseFunction = floatSettings.includes(item.name) ? parseFloat : parseInt;
				thisSetting[item.name] = elem.type ? (elem.type === 'number' ? parseFunction(elem.value, 10) : elem.value) : elem.dataset.checked === 'true';
			}

			const settingType = typeof thisSetting[item.name];
			if (settingType === 'undefined' || (settingType === 'number' && isNaN(thisSetting[item.name])) || (settingType === 'string' && thisSetting[item.name] === '')) {
				error += ` Line #${x + 1} (${item.title.replace(/<br>/g, ' ')}) is missing a value.<br>`;
			}
		}

		if (s.alchemy) {
			thisSetting.potion = thisSetting.potionType + thisSetting.potionNumber;
		}

		if (s.golden) {
			thisSetting.golden = thisSetting.goldenType + thisSetting.goldenNumber;
		}

		if (s.profile) {
			const profileName = document.getElementById('windowProfileName' + x).value;
			thisSetting.profileName = profileName;
			const overwriteData = readNiceCheckbox(document.getElementById('windowOverwrite' + x));
			profileData[profileName] = overwriteData ? serializeSettings() : document.getElementById('windowSettingString' + x).value;
		}

		const checkSettingsErrors = (condition, errorMessage) => {
			if (condition) {
				error += ` Line #${x + 1} ${errorMessage}<br>`;
			}
		};

		if (!s.golden && !s.profile && !s.spireAssault) {
			checkSettingsErrors(isNaN(thisSetting.world) || thisSetting.world < 6, "needs a value for Start Zone that's greater than 5.");
			checkSettingsErrors(+thisSetting.world > 1000, "needs a value for Start Zone that's less than 1000.");
			checkSettingsErrors(+thisSetting.world + +thisSetting.level < 6 && !thisSetting.autoLevel, "can't have a zone and map combination below zone 6.");
		}

		if (s.mapBonus) {
			const repeat = Number(thisSetting.repeat);
			checkSettingsErrors(!thisSetting.autoLevel && +thisSetting.level < (atConfig.settingUniverse === 1 ? 0 - game.portal.Siphonology.level : 0), "can't have a map level below " + (game.global.universe === 1 && game.portal.Siphonology.level > 0 ? 0 - game.portal.Siphonology.level : 'world level') + " as you won't be able to get any map stacks.");
			checkSettingsErrors(repeat < 1, "can't have a map bonus value lower than 1 as you won't be able to get any map stacks.");
		}

		if (s.mapFarm) {
			const repeat = Number(thisSetting.repeat);
			checkSettingsErrors(repeat < 1 && repeat !== -1, "can't have a repeat value lower than 1 as you won't run any maps when this line runs.");
		}

		if (s.insanity) {
			const level = Number(thisSetting.level);
			checkSettingsErrors(level === 0 && !thisSetting.autoLevel && !thisSetting.destack, "can't have a map level of 0 as you won't gain any Insanity stacks running this map.");
			checkSettingsErrors(level < 0 && !thisSetting.destack && !thisSetting.autoLevel, "can't have a map level below world level as you will lose Insanity stacks running this map. To change this toggle the 'Destack' option.");
			checkSettingsErrors(level >= 0 && thisSetting.destack && !thisSetting.autoLevel, "can't have a map level at or above world level as you won't be able to lose Insanity stacks running this map. To change this toggle the 'Destack' option.");
			checkSettingsErrors(+thisSetting.insanity < 0, "can't have a insanity value below 0.");
		}

		if (isNaN(thisSetting.endzone) || +thisSetting.endzone < +thisSetting.world) thisSetting.endzone = thisSetting.world;
		if (isNaN(thisSetting.cell) || +thisSetting.cell < 1) thisSetting.cell = 1;
		if (+thisSetting.cell > 100) thisSetting.cell = 100;
		if (+thisSetting.worshipper > game.jobs.Worshipper.max) thisSetting.worshipper = game.jobs.Worshipper.max;
		if (+thisSetting.hdRatio < 0) thisSetting.hdRatio = 0;
		if (+thisSetting.voidHDRatio < 0) thisSetting.voidHDRatio = 0;
		if (+thisSetting.hdRatio < 0) thisSetting.hdRatio = 0;
		if (+thisSetting.repeat < 0 && +thisSetting.repeat !== -1) thisSetting.repeat = 0;
		if (+thisSetting.insanity > 500) thisSetting.insanity = 500;
		setting.push(thisSetting);
	}

	if (error) {
		const elem = document.getElementById('windowError');
		if (elem) elem.innerHTML = error;
		return;
	}

	if (!s.profile) {
		if (s.golden) {
			setting.sort(function (a, b) {
				if (a.priority === b.priority) return 1;
				return a.priority > b.priority ? 1 : -1;
			});
		} else {
			setting.sort(function (a, b) {
				if (a.priority === b.priority) return a.world === b.world ? (a.cell > b.cell ? 1 : -1) : a.world > b.world ? 1 : -1;
				return a.priority > b.priority ? 1 : -1;
			});
			//To ensure we always have base settings in position 0 of the array we want to unshift it after sorting.
			setting.unshift(defaultSetting);
		}
	}

	if (profileData && Object.keys(profileData).length > 0) {
		localStorage.setItem('atSettingsProfiles', JSON.stringify(profileData));
	}

	setPageSetting(varPrefix + 'Settings', setting, atConfig.settingUniverse);

	if (!s.golden && !s.profile && !s.spireAssault) {
		const value = atConfig.settingUniverse === 2 ? 'valueU2' : 'value';
		game.global.addonUser.mapData[varPrefix + 'Settings'][value] = Array.from({ length: 31 }, () => ({ done: '' }));

		if (!defaultSetting.active) {
			message(`${titleText} Settings has been saved but the setting is disabled so won't be run. To enable it, tick the "Enable Setting" checkbox in the top left of the window.`, 'Notices', null, 'seedMessage', undefined, undefined, 'color: white;');
			if (game.options.menu.pauseGame.enabled) postMessages();
		}
	}

	const elem = document.getElementById('tooltipDiv');
	elem.style.overflowY = '';
	swapClass(document.getElementById('tooltipDiv').classList[0], 'tooltipExtraNone', elem);
	cancelTooltip(true);
	if (reopen) importExportTooltip('mapSettings', titleText);

	/* disable global variables when saving settings to ensure we aren't overfarming after updating. */
	if (s.voidMap) {
		MODULES.mapFunctions.hasVoidFarmed = '';
		delete mapSettings.boneChargeUsed;
		delete mapSettings.voidHDIndex;
		delete mapSettings.dropdown;
		delete mapSettings.dropdown2;
		delete mapSettings.voidTrigger;
		delete mapSettings.portalAfterVoids;
	} else if (s.smithyFarm) {
		delete mapSettings.smithyTarget;
	} else if (s.tributeFarm) {
		delete mapSettings.tribute;
		delete mapSettings.meteorologist;
	} else if (s.alchemy) {
		delete mapSettings.potionTarget;
	}

	/* disables Atlantrimp for 0.5 seconds and recalculates mapSettings variable. */
	_settingTimeout('mapSettings', 500);
	farmingDecision();
}

function _mapSettingsDropdowns(universe = game.global.universe, vals, titleText, settingType) {
	if (!vals) return debug(`Issue with establishing values for dropdowns`, 'mazSettings');

	let dropdown = { hdType: '', hdType2: '', gather: '', mapType: '', mapLevel: '', special: '', prestigeGoal: '', challenge: '' };
	const highestZone = universe === 1 ? game.stats.highestLevel.valueTotal() : game.stats.highestRadLevel.valueTotal();
	const varPrefix = titleText.replace(/\s/g, '');

	/* HD types */
	const hdDropdowns = ['hdType', 'hdType2'];
	const hdTypeDropdowns = varPrefix === 'VoidMap' ? ['world', 'map', 'void', 'hitsSurvived', 'hitsSurvivedVoid', 'disabled'] : settingType === 'basic' ? ['world', 'hitsSurvived'] : ['world', 'map', 'void', 'maplevel', 'hitsSurvived', 'hitsSurvivedVoid'];
	const hdTypeNames = varPrefix === 'VoidMap' ? ['World HD Ratio', 'Map HD Ratio', 'Void HD Ratio', 'Hits Survived', 'Void Hits Survived', 'Disabled'] : settingType === 'basic' ? ['World HD Ratio', 'Hits Survived'] : ['World HD Ratio', 'Map HD Ratio', 'Void HD Ratio', 'Map Level', 'Hits Survived', 'Void Hits Survived'];
	for (let type in hdDropdowns) {
		let hdKey = hdDropdowns[type];
		dropdown[hdKey] = '';

		for (let item in hdTypeDropdowns) {
			let key = hdTypeDropdowns[item];
			dropdown[hdKey] += "<option value='" + key + "'" + (vals[hdKey] === key ? " selected='selected'" : '') + '>' + hdTypeNames[item] + '</option>';
		}
	}

	/* gather dropdown */
	const gatherDropdowns = ['food', 'wood', 'metal', 'science'];
	for (let item in gatherDropdowns) {
		let key = gatherDropdowns[item];
		dropdown.gather += "<option value='" + key + "'" + (vals.gather === key ? " selected='selected'" : '') + '>' + (key.charAt(0).toUpperCase() + key.slice(1)) + '</option>';
	}

	/* map type */
	if (varPrefix !== 'MapFarm') dropdown.mapType += "<option value='Absolute'" + (vals.mapType === 'Absolute' ? " selected='selected'" : '') + '>Absolute</option>';
	dropdown.mapType += "<option value='Map Count'" + (vals.mapType === 'Map Count' ? " selected='selected'" : '') + '>Map Count</option>';
	if (varPrefix === 'MapFarm') {
		const mapFarmDropdowns = ['Zone Time', 'Farm Time', 'Portal Time', 'Daily Reset', 'Skele Spawn'];
		for (let item in mapFarmDropdowns) {
			let key = mapFarmDropdowns[item];
			dropdown.mapType += "<option value='" + key + "'" + (vals.mapType === key ? " selected='selected'" : '') + '>' + key + '</option>';
		}
	}

	/* map levels (0-10) */
	dropdown.mapLevel = "<option value='0'" + (vals.raidingzone === '0' ? " selected='selected'" : '') + '>0</option>';
	if (universe === 2 ? highestZone >= 50 : highestZone >= 210) {
		for (let i = 1; i <= 10; i++) {
			dropdown.mapLevel += "<option value='" + i + "'" + (vals.raidingzone === i.toString() ? " selected='selected'" : '') + '>' + i + '</option>';
		}
	}

	/* map special */
	dropdown.special = "<option value='0'" + (vals.special === '0' ? " selected='selected'" : '') + '>No Modifier</option>';
	for (let item in mapSpecialModifierConfig) {
		let bonusItem = mapSpecialModifierConfig[item];
		let unlocksAt = universe === 2 ? bonusItem.unlocksAt2 : bonusItem.unlocksAt;
		if ((typeof unlocksAt === 'function' && !unlocksAt()) || unlocksAt === -1) continue;
		if (unlocksAt > highestZone) break;
		dropdown.special += "<option value='" + item + "'" + (vals.special === item ? " selected='selected'" : '') + '>' + bonusItem.name + '</option>';
	}

	/* prestige goal */
	dropdown.prestigeGoal = "<option value='All'" + (vals.prestigeGoal === 'All' ? " selected='selected'" : '') + '>All</option>';
	let equips = ['Shield', 'Dagger', 'Boots', 'Mace', 'Helmet', 'Polearm', 'Pants', 'Battleaxe', 'Shoulderguards', 'Greatsword', 'Breastplate'];
	if (game.global.slowDone) {
		equips.push('Arbalest', 'Gambeson');
	}

	for (let item in equips) {
		let key = equips[item];
		if (!game.global.slowDone && (key === 'Arbalest' || key === 'Gambeson')) continue;
		dropdown.prestigeGoal += "<option value='" + key + "'" + (vals.prestigeGoal === key ? " selected='selected'" : '') + '>' + key + '</option>';
	}

	/* raiding frag types */
	dropdown.raidingTypes = "<option value='0'" + (vals.raidingdropdown === '0' ? " selected='selected'" : '') + '>Frag</option>';
	dropdown.raidingTypes += "<option value='1'" + (vals.raidingdropdown === '1' ? " selected='selected'" : '') + '>Frag Min</option>';
	dropdown.raidingTypes += "<option value='2'" + (vals.raidingdropdown === '2' ? " selected='selected'" : '') + '>Frag Max</option>';

	const challengeObj = challengesUnlockedObj(atConfig.settingUniverse);

	const fillerObj = Object.entries(challengeObj).reduce((newObj, [key, val]) => {
		if (val.unlockedIn.indexOf('heHr') !== -1) newObj[key] = val;
		return newObj;
	}, {});
	dropdown.challenge = "<option value='All'" + (vals.challenge === 'All' ? " selected='selected'" : '') + '>All</option>';
	dropdown.challenge += "<option value='No Challenge'" + (vals.challenge === 'No Challenge' ? " selected='selected'" : '') + '>No Challenge</option>';
	for (let item in Object.keys(fillerObj)) {
		let key = Object.keys(fillerObj)[item];
		dropdown.challenge += "<option value='" + key + "'" + (vals.challenge === key ? " selected='selected'" : '') + '>' + key + '</option>';
	}

	const c2Obj = Object.entries(challengeObj).reduce((newObj, [key, val]) => {
		if (val.unlockedIn.indexOf('c2') !== -1) newObj[key] = val;
		return newObj;
	}, {});
	dropdown.c2 = "<option value='All'" + (vals.challenge3 === 'All' ? " selected='selected'" : '') + '>All</option>';
	for (let item in Object.keys(c2Obj)) {
		let key = Object.keys(c2Obj)[item];
		dropdown.c2 += "<option value='" + key + "'" + (vals.challenge3 === key ? " selected='selected'" : '') + '>' + key + '</option>';
	}

	const oneOffObj = Object.entries(challengeObj).reduce((newObj, [key, val]) => {
		if (val.unlockedIn.indexOf('oneOff') !== -1) newObj[key] = val;
		return newObj;
	}, {});
	dropdown.oneOff = "<option value='All'" + (vals.challengeOneOff === 'All' ? " selected='selected'" : '') + '>All</option>';
	for (let item in Object.keys(oneOffObj)) {
		let key = Object.keys(oneOffObj)[item];
		dropdown.oneOff += "<option value='" + key + "'" + (vals.challengeOneOff === key ? " selected='selected'" : '') + '>' + key + '</option>';
	}

	const c2Name = universe === 1 ? 'C2' : 'C3';
	dropdown.runType = "<option value='All'" + (vals.runType === 'All' ? " selected='selected'" : '') + '>All</option>';
	dropdown.runType += "<option value='Filler'" + (vals.runType === 'Filler' ? " selected = 'selected'" : '') + ' > Filler</option>';
	dropdown.runType += " <option value='One Off'" + (vals.runType === 'One Off' ? " selected='selected'" : '') + '>One Offs</option>';
	dropdown.runType += " <option value='Daily'" + (vals.runType === 'Daily' ? " selected='selected'" : '') + '>Daily</option>';
	dropdown.runType += `<option value='C3'${vals.runType === 'C3' ? " selected='selected'" : ''}>${c2Name}</option>`;

	/* auto golden */
	const heliumName = universe === 1 ? 'Helium' : 'Radon';
	const heliumShortForm = universe === 1 ? 'h' : 'r';
	if (!varPrefix.includes('C3')) dropdown.goldenType = `<option value='${heliumShortForm}'${vals.goldenType === heliumShortForm ? " selected='selected'" : ''}>${heliumName}</option>`;
	dropdown.goldenType += "<option value='b'" + (vals.goldenType === 'b' ? " selected = 'selected'" : '') + ' >Battle</option>';
	dropdown.goldenType += "<option value='v'" + (vals.goldenType === 'v' ? " selected = 'selected'" : '') + ' >Void</option>';

	/* alchemy potion types */
	dropdown.potionTypes = "<option value='h'" + (vals.potionType === 'h' ? " selected='selected'" : '') + '>Herby Brew</option>';
	dropdown.potionTypes += "<option value='g'" + (vals.potionType === 'g' ? " selected='selected'" : '') + '>Gaseous Brew</option>';
	dropdown.potionTypes += "<option value='f'" + (vals.potionType === 'f' ? " selected='selected'" : '') + '>Potion of Finding</option>';
	dropdown.potionTypes += "<option value='v'" + (vals.potionType === 'v' ? " selected='selected'" : '') + '>Potion of the Void</option>';
	dropdown.potionTypes += "<option value='s'" + (vals.potionType === 's' ? " selected='selected'" : '') + '>Potion of Strength</option>';

	/* spire assault presets */
	const spireAssaultPresets = JSON.parse(getPageSetting('spireAssaultPresets')).titles;
	dropdown.spireAssaultPresets = "<option value='0'" + (vals.preset === '0' ? " selected='selected'" : '') + '>No Change</option>';

	let x = 1;
	for (let item in spireAssaultPresets) {
		if (spireAssaultPresets[item] === 'Hidden Items') continue;
		let key = x++;
		dropdown.spireAssaultPresets += "<option value='" + key + "'" + (Number(vals.preset) === key ? " selected='selected'" : '') + '>' + spireAssaultPresets[item] + '</option>';
	}

	/* spire assault farm types */
	dropdown.spireAssaultItemTypes = "<option value='Clear Level'" + (vals.settingType === 'Clear Level' ? " selected='selected'" : '') + '>Clear Level</option>';
	const spireAssaultDropdowns = ['Level Equipment', 'Level Bonus', 'Buy One Timer'];
	if (autoBattle.oneTimers.The_Ring.owned) spireAssaultDropdowns.push('Level Ring');

	for (let item in spireAssaultDropdowns) {
		let key = spireAssaultDropdowns[item];
		dropdown.spireAssaultItemTypes += "<option value='" + key + "'" + (vals.settingType === key ? " selected='selected'" : '') + '>' + key + '</option>';
	}

	/* spire assault items */
	const spireAssaultItems = spireAssaultItemList();
	dropdown.spireAssaultItems = '';
	for (let item in spireAssaultItems) {
		let key = spireAssaultItems[item];
		if (key.includes('Doppelganger')) continue;
		dropdown.spireAssaultItems += "<option value='" + key + "'" + (vals.item === key ? " selected='selected'" : '') + '>' + autoBattle.cleanName(key) + '</option>';
	}

	const spireAssaultBonuses = ['Extra_Limbs', 'Radon', 'Stats'];
	if (autoBattle.maxEnemyLevel >= 51) spireAssaultBonuses.push('Scaffolding');
	dropdown.spireAssaultBonuses = '';
	for (let item in spireAssaultBonuses) {
		let key = spireAssaultBonuses[item];
		dropdown.spireAssaultBonuses += "<option value='" + key + "'" + (vals.bonusItem === key ? " selected='selected'" : '') + '>' + autoBattle.cleanName(key) + '</option>';
	}

	const spireAssaultOneTimers = [];
	let oneCount = 0;
	const ownedItems = autoBattle.countOwnedItems();
	for (let item in autoBattle.oneTimers) {
		let key = autoBattle.oneTimers[item];
		if (key.owned) continue;
		if (autoBattle.maxEnemyLevel >= 51 && oneCount >= 3) break;
		if (oneCount >= 4) break;
		if (ownedItems < key.requiredItems) continue;

		spireAssaultOneTimers.push(item);
	}

	dropdown.spireAssaultOneTimers = '';
	if (spireAssaultOneTimers.length === 0) {
		dropdown.spireAssaultOneTimers = "<option value='0'>None Available</option>";
	} else {
		for (let item in spireAssaultOneTimers) {
			let key = spireAssaultOneTimers[item];
			dropdown.spireAssaultOneTimers += "<option value='" + key + "'" + (vals.oneTimerItem === key ? " selected='selected'" : '') + '>' + autoBattle.cleanName(key) + '</option>';
		}
	}

	return dropdown;
}

function _mapSettingsToggleHelp() {
	const mazContainer = document.getElementById('windowContainer');
	const helpContainer = document.getElementById('mazHelpContainer');
	const parentWindow = document.getElementById('tooltipDiv');
	if (!mazContainer || !helpContainer) return;

	mazContainer.style.display = mazContainer.style.display === 'block' ? 'none' : 'block';
	helpContainer.style.display = helpContainer.style.display === 'block' ? 'none' : 'block';
	parentWindow.style.overflowY = '';
	_verticalCenterTooltip();
	parentWindow.style.top = '10%';
	parentWindow.style.left = '1%';
	parentWindow.style.height = 'auto';
	parentWindow.style.maxHeight = window.innerHeight * 0.85 + 'px';

	if (helpContainer.style.display === 'block' && document.querySelectorAll('#mazHelpContainer li').length > 15) parentWindow.style.overflowY = 'scroll';
}

function _mapSettingsHelpWindow(activeSettings, settingType = 'basic') {
	const s = JSON.parse(activeSettings);
	const radonSetting = atConfig.settingUniverse === 2;
	const trimple = atConfig.settingUniverse === 1 ? 'Trimple' : 'Atlantrimp';
	const trimpleName = atConfig.settingUniverse === 1 ? 'Trimple of Doom' : 'Atlantrimp';
	const hze = game.stats.highestLevel.valueTotal();
	const hzeU2 = game.stats.highestRadLevel.valueTotal();
	const advancedSettings = settingType === 'advanced';
	let mazHelp = '';

	/* 
		brief overview of what the setting does as it's kinda different from other settings. 
	*/
	if (s.mapBonus) {
		mazHelp += `<p><b>Map Bonus Settings</b> works by slightly differently from other mapping settings:</p>`;
		mazHelp += `<li class="indent">It finds the highest priority value line that's equal to or greater than your current world zone, and uses that lines settings when it runs.</li>`;
		mazHelp += `<li class="indent">Lines repeat every zone from when they start until they reach their <b>End Zone</b> input.</li>`;
	}

	if (s.voidMap) {
		mazHelp += `<p><b>Void Map Settings</b> works by using <b>Start Zone</b> as the lower bound zone to run voids on and <b>End Zone</b> as the upper bound.</p>`;
		if (advancedSettings) {
			mazHelp += `<li class="indent">It has dropdown options to allow fine-tuning for when a line should be run.</li>`;
			mazHelp += `<li class="indent">If you reach the <b>End Zone</b> input of a line it will run regardless of dropdown inputs.</li>`;
		}
	}

	if (s.smithyFarm) {
		mazHelp += `<p><b>Smithy Farm</b> will farm resources in the following order <b>Metal > Wood > Gems</b>. This cannot be changed.</p>`;
	}

	if (s.insanity) {
		mazHelp += `<p><b>Insanity Farm</b> will disable unique & lower than world level maps when you don't have a destack zone line setup.</p>`;
	}

	/* 
		top row information 
	*/
	if (!s.golden && !s.profile) {
		if (s.mapBonus || s.voidMap) mazHelp += `<br>`;
		mazHelp += `The top row of this settings window consists of toggles and inputs which add extra functions to the setting itself:<br></br><ul>`;
		mazHelp += `<li><b>Enabled</b> - A toggle to allow this setting to run.</li>`;

		if (s.raiding && !s.bionic) {
			mazHelp += `<li><b>Recycle Maps</b> - When enabled this will recycle maps this setting creates after it finishes raiding.</li>`;
		}

		if (s.mapBonus) {
			const showSpire = (!radonSetting && hze >= 170) || (radonSetting && hzeU2 >= 270);
			const settingText = showSpire ? `either the <b>Map Bonus Ratio</b> or <b>Max Map Bonus</b> Spire` : `the <b>Map Bonus Ratio</b>`;
			mazHelp += `<li><b>Job Ratio</b> - The job ratio to use when Map Bonus stacks are obtained from ${settingText} setting.</li>`;
			mazHelp += `<li class="indent">Input should look like this: <b>1,1,1,1</b> with the order being the games unlock order (farmers, lumberjacks, miners, scientists).</li>`;
			mazHelp += `<li class="indent">If set to <b>-1</b> it will use your current AT Auto Jobs ratio.</li>`;
			mazHelp += `<li class="indent">Your job ratio will only be used when the <b>AT Auto Jobs</b> setting is enabled.</li>`;

			mazHelp += `<li><b>Special</b> - The map cache (special modifier) you'd like to run when Map Bonus is run from ${settingText} setting.</li>`;
		}

		if (s.voidMap) {
			mazHelp += `<li><b>Max Map Bonus</b> - Makes your <b>Void HD Ratio</b> assume you have 10 map bonus stacks${radonSetting && !game.portal.Tenacity.radLocked ? ' and max Tenacity multiplier' : ''}.</li>`;

			if (game.permaBoneBonuses.boosts.owned > 0) mazHelp += `<li><b>Bone Charge</b> - The first time a line starts running Void Maps in each portal it will use a single Bone Charge.</li>`;

			mazHelp += `<li><b>Void Farm</b> - Will farm before running void maps if your void hits survived is below the input in <b>Void Farm Hits Survived</b> or your void hd ratio is below the input in <b>Void Farm Void HD Ratio</b>. Farms until you have reached the map cap set in the <b>HD Farm</b> settings.</li>`;
			mazHelp += `<li><b>Void Farm Hits Survived</b> - Will farm to this <b>Void Hits Survived</b> value before running void maps.</li>`;
			mazHelp += `<li class="indent">Will only farm <b>Void Hits Survived</b> to this value when set <b>above 0</b>.</li>`;
			mazHelp += `<li class="indent">Your current <b>Void Hits Survived</b> value can be seen in either the <b>Auto Maps Status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</li>`;
			mazHelp += `<li><b>Void Farm HD Ratio</b> - Will farm to this <b>Void HD Ratio</b> value before running void maps.</li>`;
			mazHelp += `<li class="indent">Will only farm <b>Void HD Ratio</b> to this value when set <b>above 0</b>.</li>`;
			mazHelp += `<li class="indent">Your current <b>Void HD Ratio</b> value can be seen in either the <b>Auto Maps Status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</li>`;

			mazHelp += `<li><b>Void Farm Job Ratio</b> - The job ratio you want to use when farming stats before you run your Void Maps.</li>`;
			mazHelp += `<li class="indent">Input should look like this: <b>1,1,1,1</b> with the order being the games unlock order (farmers, lumberjacks, miners, scientists).</li>`;
			mazHelp += `<li class="indent">If set to <b>-1</b> it will use your current AT Auto Jobs ratio.</li>`;
			mazHelp += `<li class="indent">Your job ratio will only be used when the <b>AT Auto Jobs</b> setting is enabled.</li>`;

			mazHelp += `<li><b>Map Cap</b> - The maximum amount of maps you would like to run during this farm.</li>`;
			mazHelp += `<li class="indent">If set to <b>-1</b> it will repeat an infinite amount of times.</li>`;
		}

		if (s.boneShrine) {
			mazHelp += `<li><b>Auto Spend Charges</b> - Enables the ability to automatically spend bone charges when above a certain value.</li>`;
			mazHelp += `<li><b>Auto Spend At X Charges</b> - The amount of bone charges you have to reach before one will automatically be spent.</li>`;
			mazHelp += `<li class="indent">If set to <b>0 or below</b> OR <b>above 10</b> it will stop bone charges from being auto spent.</li>`;
			mazHelp += `<li><b>Auto Spend From Z</b> - Will only auto spend bone charges when at or above this zone.</li>`;
			mazHelp += `<li><b>Auto Spend Gather</b> - The resource you'd like to gather when auto spending bone charges.</li>`;

			mazHelp += `<li><b>Auto Spend Job Ratio</b> - The job ratio you want to use when auto spending bone charges.</li>`;
			mazHelp += `<li class="indent">Input should look like this: <b>1,1,1,1</b> with the order being the games unlock order (farmers, lumberjacks, miners, scientists).</li>`;
			mazHelp += `<li class="indent">If set to <b>-1</b> it will use your current AT Auto Jobs ratio.</li>`;
			mazHelp += `<li class="indent">Your job ratio will only be used when the <b>AT Auto Jobs</b> setting is enabled.</li>`;
		}

		if (s.hdFarm) {
			const showSpire = (!radonSetting && hze >= 170) || (radonSetting && hzeU2 >= 270);
			const settingText = showSpire ? `either the <b>Hits Survived</b> or <b>Hits Survived</b> Spire` : `the <b>Hits Survived<</b>`;
			mazHelp += `<li><b>Job Ratio</b> - The job ratio to use when farming to improve your Hits Survived ratio through ${settingText} setting.</li>`;
			mazHelp += `<li class="indent">Input should look like this: <b>1,1,1,1</b> with the order being the games unlock order (farmers, lumberjacks, miners, scientists).</li>`;
			mazHelp += `<li class="indent">If set to <b>-1</b> it will use your current AT Auto Jobs ratio.</li>`;
			mazHelp += `<li class="indent">Your job ratio will only be used when the <b>AT Auto Jobs</b> setting is enabled.</li>`;

			mazHelp += `<li><b>Map Cap</b> - The maximum amount of maps you would like to run when farming to improve your Hits Survived ratio through ${settingText} setting.</li>`;
			mazHelp += `<li class="indent">If set to <b>-1</b> it will repeat an infinite amount of times.</li>`;
		}

		if (s.worshipperFarm) {
			mazHelp += `<li><b>Enabled Skip</b> - A toggle to enable the skip value setting.</li>`;
			mazHelp += `<li><b>Skip Value</b> - How many worshippers a small/large (dependant on what you have unlocked) savoury cache must provide for you to run your Worshipper Farming.</li>`;
		}

		if (s.quagmire) {
			mazHelp += `<li><b>Abandon Zone</b> - The zone you would like to abandon the challenge at.</li>`;
		}

		if (s.alchemy) {
			mazHelp += `<li><b>Void Purchase</b> - Will purchase as many void and strength potions as you can currently afford when you go into a void map. Would recommend only disabling this setting when going for the Alchemy achievement.</li>`;
		}

		if (s.hypothermia) {
			mazHelp += `<li><b>Frozen Castle</b> - The zone,cell combination that you'd like Frozen Castle to be run at. The input style is '200,99' and if you don't input it properly it'll default to zone 200 cell 99.</li>`;
			mazHelp += `<li><b>AutoStorage</b> - Disables AutoStorage until the first Bonfire farm zone that you reach during the challenge.</li>`;
			mazHelp += `<li><b>Packrat</b> - Will purchase as many levels of packrat as possible once the Hypothermia challenge ends with leftover radon and additionally when portaling it reset the packrat level to 3 so that you don't accidentally trigger a 5th bonfire at the start of the run.</li>`;
		}
	}

	/* 
		general settings
	*/
	if (!s.golden && !s.profile) mazHelp += `</ul></br>`;
	mazHelp += `Here's a description of settings for each added row:<ul>`;

	mazHelp += `<li><span style='padding-left: 0.3%; margin-right: -0.3%' class='mazDelete'><span class='icomoon icon-cross'></span></span> - Removes this line from the settings window.</li>`;
	if (!s.profile) {
		const includeCell = !s.golden && !s.spireAssault;
		mazHelp += `<li><b>Active</b> - A toggle to allow this row to be run.</li>`;
		mazHelp += `<li><b>Priority</b> - If multiple rows trigger ${includeCell ? 'at the same cell and ' : 'on the same '} zone, the ${s.mapBonus ? 'higher' : 'lower'} priority line runs first.</li>`;
		mazHelp += `<li class="indent">This also determines sort order of rows in the UI.</li>`;
	}
	if (!s.voidMap && !s.golden && !s.profile && !s.spireAssault) mazHelp += `<li><b>Start Zone</b> - The zone where this line starts running.</li>`;

	if (s.endZone && !s.voidMap) {
		mazHelp += `<li><b>End Zone</b> - The zone where this line should stop running.</li>`;
		if (s.repeatEvery) mazHelp += `<li class="indent">This input is only used when your <b>Repeat Every</b> input is <b>above 0</b>.</li>`;
	}

	if (s.voidMap) {
		mazHelp += `<li><b>Start Zone</b> - The lower bound zone to run voids maps on.</li>`;
		mazHelp += `<li><b>End Zone</b> - The upper bound zone to run voids maps on.</li>`;
	}

	if (!s.golden && !s.profile && !s.spireAssault) {
		mazHelp += `<li><b>Cell</b> - The cell number where this line should trigger.</li>`;
		mazHelp += `<li class="indent">The line will still trigger if you have passed the rows cell input.</li>`;
		if (!game.portal.Overkill.locked) mazHelp += `<li class="indent">Your line can be skipped if you overkill past it and onto the next zone in a single attack.</li>`;
	}

	if (s.mapLevel) {
		mazHelp += `<li><b>Auto Level</b> - Uses the recommendation from Auto Level to determine the optimal map level to run.</li>`;
		mazHelp += `<li class="indent">Your <b>Auto Level</b> recommendation can be seen in the games breeding section.</li>`;
		mazHelp += `<li><b>Map Level</b> - The map level you'd like this line to run.</li>`;
		if (s.mapBonus) mazHelp += `<li class="indent">Only accepts inputs for map levels you can gain map bonus stacks on.</li>`;
		else mazHelp += `<li class="indent">Inputs can be positive or negative, so you could do <b>-5</b>, or <b>0</b>, or <b>3</b>.</li>`;
		mazHelp += `<li class="indent">This input is disabled when the <b>Auto Level</b> checkbox is enabled.</li>`;
		if (radonSetting && !(s.mapBonus || s.insanity || s.alchemy || s.hypothermia)) mazHelp += `<li class="indent">Will override inputs above <b>-1</b> during the <b>Wither</b> challenge.</li>`;
	}

	if (s.jobRatio) {
		mazHelp += `<li><b>Job Ratio</b> - The job ratio you want to use when this line is run.</li>`;
		mazHelp += `<li class="indent">Input should look like this: <b>1,1,1,1</b> with the order being the games unlock order (farmers, lumberjacks, miners, scientists).</li>`;
		mazHelp += `<li class="indent">If set to <b>-1</b> it will use your current AT Auto Jobs ratio.</li>`;
		mazHelp += `<li class="indent">Your job ratio will only be used when the <b>AT Auto Jobs</b> setting is enabled.</li>`;
	}

	if (s.special) mazHelp += `<li><b>Special</b> - The map cache (special modifier) you'd like to use when this line runs.</li>`;
	if (s.repeatEvery) mazHelp += `<li><b>Repeat Every</b> - Repeat this line every X zones from when this line starts.</li>`;

	if (s.runType) {
		mazHelp += `<li><b>Run Type</b> - The type of run you would like this challenge to run on.</li>`;
		mazHelp += `<li class="indent">You can choose between Filler, One Offs, Daily, and ${_getChallenge2Info()} challenge runs.</li>`;
		mazHelp += `<li class="indent">The Filler, One Offs, and ${_getChallenge2Info()} options provide the ability to run this line on all challenges of that run type or a specific challenge.</li>`;
	}

	/* 
		row Settings 
	*/
	if (!s.profile) mazHelp += `</ul></br>These inputs are <b>specific to this setting</b> and can be quite important for how you try to set this up:<ul><br>`;

	if (s.voidMap) {
		if (advancedSettings) {
			mazHelp += `<li><b>Dropdowns</b> - Will only run the line when one or more of the dropdown options aren't met <b>OR</b> you are at the <b>End Zone</b> input for that line.</li>`;
			mazHelp += `<li class="indent"><b>HD Ratio</b> dropdowns will check to see if the input value is higher than your selected <b>HD Ratio</b> value.</li>`;
			mazHelp += `<li class="indent"><b>Hits Survived</b> dropdowns will check to see if the input value is lower than your selected <b>Hits Survived</b> value.</li>`;
			mazHelp += `<li class="indent"><b>Disabled</b> this dropdown is used to disable checking this dropdown. Can be used to only check against one <b>HD Ratio</b> or <b>Hits Survived</b> condition.</li>`;
			mazHelp += `<li class="indent">Your current values for each of the dropdown options can be seen in either the <b>Auto Maps Status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</li>`;
		}
		mazHelp += `<li><b>Portal After</b> - Will run Auto Portal immediately after this line has run.`;
		if (!radonSetting) mazHelp += `<br>When enabled and farming for, or running Void Maps this will buy as many nurseries as you can afford based upon your spending percentage in the AT AutoStructure settings.</li>`;
		mazHelp += `</li>`;
	}

	if (s.mapFarm) {
		if (advancedSettings) {
			mazHelp += `<li><b>Farm Type</b> The different ways that the script can determine how many maps are run.</li>`;
			mazHelp += `<li class="indent">All of the dropdown settings other than <b>Map Count</b> use a DD:HH:MM:SS input and will break if that format isn't followed.</li>`;
			mazHelp += `<li class="indent"><b>Map Count</b> - Will run maps until it has reached the specified repeat counter.</li>`;
			mazHelp += `<li class="indent"><b>Zone Time</b> - Runs maps until the zone time surpasses the time set in repeat counter.</li>`;
			mazHelp += `<li class="indent"><b>Farm Time</b> - Tracks when it starts farming then run maps until it reaches that timer.</li>`;
			mazHelp += `<li class="indent"><b>Portal Time</b> - Runs maps until the portal time surpasses the time set in repeat counter.</li>`;
			mazHelp += `<li class="indent"><b>Daily Reset</b> - Runs maps until the daily reset time is below the time set in repeat counter.</li>`;
			mazHelp += `<li class="indent"><b>Skele Spawn</b> - Runs maps until the time since your last Skeletimp kill was this amount of time or greater.</li>`;
		}

		mazHelp += `<li><b>Map Repeats</b> - The amount of maps you would like to run during this line.</li>`;
		mazHelp += `<li class="indent">If set to <b>-1</b> it will repeat an infinite amount of times.</li>`;
		if (advancedSettings) {
			mazHelp += `<li><b>Above X HD Ratio</b> - This line will only run when your <b>World HD Ratio</b> is above this value.</li>`;
			mazHelp += `<li class="indent">Requires an input above <b>0</b> for this to be checked.</li>`;
			mazHelp += `<li class="indent">Your current <b>World HD Ratio</b> can be seen in either the <b>Auto Maps Status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</li>`;
			mazHelp += `<li><b>Run ${trimple}</b> - Will run the ${trimpleName} unique map (if unlocked) once this line has been completed.</li>`;
			mazHelp += `<li class="indent">While lines with this enabled are running <b>AT Auto Equip</b> won't purchase any equipment until ${trimpleName} has been run so that there are no wasted resources.</li>`;
			mazHelp += `<li class="indent">If ${trimpleName} has been run then any line with this enabled won't be run.</li>`;
		}
	}

	if (s.mapBonus) {
		mazHelp += '<li><b>Map Stacks</b> - The amount of map bonus stacks to obtain when this line runs.</li>';
		if (advancedSettings) {
			mazHelp += `<li><b>Above X HD Ratio</b> - This line will only run when your <b>World HD Ratio</b> is above this value.</li>`;
			mazHelp += `<li class="indent">Requires an input above <b>0</b> for this to be checked.</li>`;
			mazHelp += `<li class="indent">Your current <b>World HD Ratio</b> can be seen in either the <b>Auto Maps Status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</li>`;
		}
	}

	if (s.raiding || s.bionic) {
		const raidingZone = s.bionic ? 'Raiding Zone' : 'Map Level';
		mazHelp += `<li><b>${raidingZone}</b> - The ${raidingZone.split(' ')[1].toLowerCase()} you'd like to raid when this line is run.</li>`;
		mazHelp += `<li class="indent">If <b>Repeat Every</b> is set to a value above 0 then it will also raise the ${raidingZone.toLowerCase()} by (<b>worldZone-startZone</b>) everytime this line runs.</li>`;

		if (!s.bionic && advancedSettings) {
			mazHelp += `<li><b>Frag Type</b> - The choices how for aggresively the script will spend fragments on maps.</li>`;
			mazHelp += `<li class="indent"><b>Frag</b> - General all purpose setting. Will set sliders to max and reduce when necessary to afford the maps you're trying to purchase.</li>`;
			mazHelp += `<li class="indent"><b>Frag Min</b> - Used for absolute minimum fragment costs. Will set everything but the map size to minimum and gradually reduce that if necessary to purchase maps.</li>`;
			mazHelp += `<li class="indent"><b>Frag Max</b> - This option will make sure that the map has perfect sliders and uses the <b>Prestigious</b> map special if available.</li>`;

			if (advancedSettings) mazHelp += `<li><b>Prestige Goal</b> - Will run maps to get this prestige if it's available on the selected ${raidingZone.toLowerCase()}.</li>`;

			if (!s.bionic && advancedSettings) {
				mazHelp += `<li><b>Increment Maps</b> - Swaps from running a single map to running multiple maps, starting from the lowest map level you can obtain prestiges.</li>`;
				mazHelp += `<li class="indent">This can help if additional stats will allow you to raid your target zone but it will use more fragments.</li>`;
			}
		}
	}

	if (s.hdFarm) {
		mazHelp += `<li><b>Farming Type</b> - The type of Hits Survived or HD Ratio you'd like to farm towards.</li>`;
		if (advancedSettings) {
			mazHelp += `<li class="indent">If <b>Map Level</b> has been selected it will farm until Auto Level (loot) reaches that level.</li>`;
			mazHelp += `<li class="indent">Will only run Void Map lines if you have void maps in your map chamber.</li>`;
		}

		mazHelp += `<li><b>Farm Target</b> - The Hits Survived or HD Ratio value you'd like to reach.</li>`;
		if (advancedSettings) {
			mazHelp += `<li><b>Zone Mult</b> - Starting from second zone this line runs, this will cause the target value (Farm Target) to be calculated as Farm Target * (Zone Mult^(worldZone-startZone)).</li>`;
			mazHelp += `<li class="indent">If your initial zone was 100, Farm Target was 10, Zone Mult was 1.2, then at z101 your target would be 12, at z102 it would be 14.4 and so on.</li>`;
			mazHelp += `<li class="indent">This can help you account for zones getting harder to complete so that you can reduce wasted farming time.</li>`;
		}

		mazHelp += `<li><b>Map Cap</b> - The maximum amount of maps you would like to run during this line.</li>`;
		mazHelp += `<li class="indent">If set to <b>-1</b> it will repeat an infinite amount of times.</li>`;
	}

	if (s.boneShrine) {
		mazHelp += `<li><b>To use</b> - How many bone charges to use on this line.</li>`;
		if (advancedSettings) mazHelp += `<li><b>Use above</b> - This stops bone charges being used when you're at or below this value.</li>`;
		if (advancedSettings) {
			mazHelp += `<li><b>Run ${trimple}</b> - Will run ${trimpleName} during this line.</li>`;
			mazHelp += `<li class="indent"><b>AT Auto Equip</b> is disabled while ${trimpleName} is running so that there are no wasted resources.</li>`;
			mazHelp += `<li class="indent">Will use your bone charges once cell 70 of the map has been reached.</b></li>`;
		}
		mazHelp += `<li><b>Gather</b> - Which resource you'd like to gather when using bone shrine charge(s) to make use of Turkimp's resource bonus.</li>`;
	}

	if (s.tributeFarm) {
		if (advancedSettings) {
			mazHelp += `<li><b>Farm Type</b> - Has a dropdown to allow you to decide how the Tributes and Meteorologists are farmed for.</li>`;
			mazHelp += `<li class="indent"><b>Absolute</b> - This will allow you to farm to a specific amount of Tributes and Meteorologists.</li>`;
			mazHelp += `<li class="indent"><b>Map Count</b> - The script will identify how many Tributes and Meteorologists you can purchase in the max amount of maps you input and farm for that amount.</li>`;
		}

		mazHelp += `<li><b>Tributes</b> - The amount of Tributes you want to reach during this line.</li>`;
		mazHelp += `<li class="indent">If the value is greater than your Tribute Cap setting in <b>AT Auto Structure</b> then it'll adjust it to the Tribute input whilst doing this farm.</li>`;
		mazHelp += `<li><b>Mets</b> - The amount of Meteorologists you want to reach during this line.</li>`;

		if (advancedSettings) {
			mazHelp += `<li><b>Buy Buildings</b> - Allows you to disable building purchases to reduce the amount of maps it takes to farm your specified Tribute or Meteorologist inputs.</li>`;
			mazHelp += `<li class="indent">When unselected, it will temporarily disable vanilla AutoStructure if it's enabled to remove the possibility of resources being spent there.</li>`;
		}

		if (advancedSettings) {
			mazHelp += `<li><b>Run ${trimple}</b> - Allows it to run ${trimpleName} during this line to complete it faster.</b></li>`;
			mazHelp += `<li class="indent">Calculates when it would be more efficient to run ${trimple} or continue farming Savory Cache maps to reach your target in the fastest time possible.</li>`;
		}
	}

	if (s.smithyFarm) {
		if (advancedSettings) {
			mazHelp += `<li><b>Farm Type</b> - Has a dropdown to allow you to decide how the smithies are farmed for.</li>`;
			mazHelp += `<li class="indent"><b>Absolute</b> - This will allow you to farm to a specific amount of smithies.</li>`;
			mazHelp += `<li class="indent"><b>Map Count</b> - The script will identify how many smithies you can purchase in the max amount of maps you input and farm for that amount.</li>`;
		}

		mazHelp += `<li><b>Smithies</b> - Smithy count you'd like to reach during this line.</li>`;
		mazHelp += `<li class="indent">If you currently own 18 and want to reach 21 you'd enter 21.</li>`;
		if (advancedSettings) {
			mazHelp += `<li><b>Run MP</b> - Will run the Melting Point unique map (if unlocked) after this line has been run.</b></li>`;
			mazHelp += `<li class="indent">If Melting Point has been run then any line with this enabled won't be run.</li>`;
		}
	}

	if (s.worshipperFarm) {
		mazHelp += `<li><b>Worshippers</b> - How many Worshippers you'd like to farm up to during this line.</li>`;
		mazHelp += `<li class="indent">Max input is 50 and it'll default to that value if you input anything higher.</li>`;
	}

	if (s.toxicity) {
		mazHelp += `<li><b>Toxic Stacks</b> - How many Toxic Stacks you'd like to farm up to during this line.</li>`;
	}

	if (s.quagmire) {
		mazHelp += `<li><b>Bogs</b> - How many Black Bog maps you'd like to run during this line.</li>`;
	}

	if (s.archaeology) {
		mazHelp += `<li><b>Relic String</b> - The relic string to be farmed on this zone.</li>`;
		mazHelp += `<li class="indent">This setting will override the ingame Archaeology Automator input so only use this setting in conjunction with the scripts Archaeology string settings.</li>`;

		mazHelp += `<li><b>Map Cap</b> - The maximum amount of maps you would like to run during this line.</li>`;
		mazHelp += `<li class="indent">If set to <b>-1</b> it will repeat an infinite amount of times.</li>`;
	}
	if (s.insanity) {
		mazHelp += `<li><b>Insanity</b> - How many Insanity stack you'd like to farm up to during this line.</li>`;
		mazHelp += `<li><b>Destack</b> - Toggle to allow you to run maps that are lower than world level during Insanity.</li>`;
		mazHelp += `<li class="indent">If a destack zone is set it will allow lower than world level maps to be run from that zone onwards.</li>`;
		mazHelp += `<li class="indent">When enabled, Insanity Farm will assume you're destacking and it will aim to reduce your max Insanity to the value in the Insanity field.</li>`;
	}

	if (s.alchemy) {
		if (advancedSettings) {
			mazHelp += `<li><b>Farm Type</b> - Has a dropdown to allow you to decide how many of the selected potion are farmed for.</li>`;
			mazHelp += `<li class="indent"><b>Absolute</b> - This will allow you to farm to a specific amount of potions.</li>`;
			mazHelp += `<li class="indent"><b>Map Count</b> - The script will identify how many potions you can purchase in the max amount of maps that you input and farm for that amount.</li>`;
		}
		mazHelp += `<li><b>Potion Type</b> - The type of potion you want to farm during this line.</li>`;
		mazHelp += `<li><b>Potion Number</b> - How many of the potion selected in <b>Potion Type</b> you'd like to farm for.</li>`;
	}

	if (s.hypothermia) {
		mazHelp += `<li><b>Bonfires</b> - How many Bonfires should be farmed to on this zone.</li>`;
		mazHelp += `<li class="indent">Uses max bonfires built, so if you have already built 14 and want another 8, then you'd input 22.</li>`;
	}

	if (s.golden) {
		mazHelp += `<li><b>Amount</b> - The amount of golden upgrades to purchase before moving onto the next line.</li>`;
		mazHelp += `<li class="indent">Setting this input to <b>-1</b> will purchase this golden type infinitely.</li>`;
		mazHelp += `<li><b>Golden Type</b> - The type of Golden upgrade that you'd like to get during this line.</li>`;

		mazHelp += `</ul><br>`;
		const heliumType = atConfig.settingUniverse === 2 ? 'Radon' : 'Helium';
		mazHelp += `<p>You are able to have multiple lines of the same type. For example 8 Void, 12 Battle, 10 ${heliumType}, 8 Battle would end with 8 Golden Voids, 20 Golden Battle, and 10 Golden ${heliumType} upgrades.<br>Requests to buy Golden Void will be skipped if it would put you above 72%.`;
		mazHelp += `<br>Will skip all ${heliumType} upgrades when running a ${_getChallenge2Info()} challenge.</p>`;
	}

	if (s.profile) {
		mazHelp += `<li><b>Profile Name</b> - The name of the settings profile.</li>`;
		mazHelp += `<li><b>Load Profile</b> - A button to load the profile.</li>`;
		mazHelp += `<li><b>Profile String</b> - The settings string that corresponds to the saved input. Can be copied but can't be adjusted.</li>`;
		mazHelp += `<li><b>Overwrite Profile</b> - Allows you to overwrite the profile with your current settings.</li>`;
	}

	if (s.spireAssault) {
		mazHelp += `<li><b>Level</b> - The Spire Assault level you would like to run during this line.</li>`;
		mazHelp += `<li class="indent">When switching levels <b>Auto Level</b> will be turned off.</li>`;
		mazHelp += `<li><b>Preset</b> - The preset you would like to switch to when this line runs.</li>`;
		mazHelp += `<li class="indent">Item presets can be setup in the <b>Item Presets</b> setting in the <b>Spire Assault</b> tab.</li>`;
		mazHelp += `<li class="indent">Ring mods will only be switched if you have selected the maximum amount of mods available.</li>`;
		mazHelp += `<li><b>Setting Type</b> - This provides the option to either clear a level or farm for limbs, equipment, or ring levels.</li>`;
		mazHelp += `<li><b>Item</b> - The item you would like to farm levels in.</li>`;
		mazHelp += `<li class="indent">This input is only accessible when <b>Setting Type</b> is set to <b>Level Equipment</b>.</li>`;
		mazHelp += `<li class="indent">Items saved in the <b>Hidden Items</b> tab of the <b>Item Presets</b> setting won't be visible in this list.</li>`;
		mazHelp += `<li><b>Item Level</b> - The limb, equipment or ring level you would like to farm for.</li>`;
		mazHelp += `<li class="indent">This input is only accessible when <b>Setting Type</b> isn't set to <b>Clear Level</b>.</li>`;
	}

	return mazHelp;
}
