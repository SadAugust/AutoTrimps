function MAZLookalike(event, titleText) {
	const eventHandlers = {
		mapSettings: mapSettingsDisplay,
		AutoStructure: autoStructureDisplay,
		AutoJobs: autoJobsDisplay,
		UniqueMaps: uniqueMapsDisplay,
		MessageConfig: messageDisplay,
		DailyAutoPortal: dailyPortalModsDisplay,
		c2Runner: c2RunnerDisplay
	};

	const titleTexts = {
		AutoStructure: 'Configure AutoTrimps AutoStructure',
		AutoJobs: 'Configure AutoTrimps AutoJobs',
		UniqueMaps: 'Unique Maps',
		MessageConfig: 'Message Config',
		DailyAutoPortal: 'Daily Auto Portal',
		c2Runner: _getChallenge2Info() + ' Runner'
	};

	cancelTooltip();
	let elem = document.getElementById('tooltipDiv');
	let tooltipText;
	let costText = '';
	let ondisplay = null; //Called after the tooltip is displayed if not null
	if (event !== 'mapSettings') swapClass('tooltipExtra', 'tooltipExtraNone', elem);

	if (eventHandlers[event]) {
		titleText = titleTexts[event] || titleText;
		[elem, tooltipText, costText, ondisplay] = eventHandlers[event](elem, titleText);
	}

	document.getElementById('tipText').className = '';
	document.getElementById('tipText').innerHTML = tooltipText;
	document.getElementById('tipTitle').innerHTML = titleText;
	document.getElementById('tipCost').innerHTML = costText;
	elem.style.display = 'block';
	if (ondisplay !== null) ondisplay();
}

function mapSettingsDisplay(elem, titleText) {
	MODULES.popups.mazWindowOpen = true;

	//Remove spaces from titleText to make varPrefix
	let varPrefix = titleText.replace(/\s/g, '');
	if (varPrefix.includes('Desolation')) varPrefix = 'Desolation';
	let settingName = varPrefix.charAt(0).toLowerCase() + varPrefix.slice(1);
	if (varPrefix === 'HDFarm') settingName = settingName.charAt(0) + settingName.charAt(1).toLowerCase() + settingName.slice(2);

	//If you're adding a new setting here make sure to add it to the mazSettings variable at the start of mainLoop() in AutoTrimps2.js
	//If you don't it'll instantly get resized to a super small version of itself when you open the setting.
	const settingNames = ['mapFarm', 'mapBonus', 'voidMap', 'hdFarm', 'raiding', 'bionic', 'toxicity', 'boneShrine', 'autoGolden', 'tributeFarm', 'smithyFarm', 'worshipperFarm', 'quagmire', 'archaeology', 'insanity', 'alchemy', 'hypothermia', 'desolation'];

	const activeSetting = {};
	for (let name of settingNames) {
		if (settingName.includes(name)) {
			activeSetting[name] = true;
		}
	}
	if (activeSetting['autoGolden']) activeSetting['golden'] = true;

	let settingInputsDefault = ['active'];
	let settingInputs;
	let windowWidth;

	const settingObj = _mapSettingsInputObj();

	const settingInfo = settingObj[titleText];
	if (settingInfo) {
		settingInputs = settingInfo.settingInputs;
		settingInputsDefault = settingInfo.settingInputsDefault;
		settingInputsDefault.unshift('active');
		windowWidth = settingInfo.windowWidth;
	}
	const originalSetting = getPageSetting(settingName + 'Settings', currSettingUniverse);
	const maxSettings = 30;
	let overflow = false;

	//Setting up the Help onclick setting.
	const mazHelp = mapSettingsHelpWindow(titleText);

	let tooltipText = '';
	//Setting up default settings row
	if (!activeSetting.golden) {
		tooltipText += _mapSettingsDefaultTitles(varPrefix, activeSetting);

		const defaultVals = _mapSettingsDefaultVals();
		const defaultSetting = originalSetting[0];

		for (let item in settingInputsDefault) {
			let name = settingInputsDefault[item];
			defaultVals[name] = typeof defaultSetting[name] !== 'undefined' ? defaultSetting[name] : defaultVals[name];
		}

		tooltipText += _mapSettingsDefaultPopulateInputs(defaultVals, varPrefix, activeSetting);
	}

	tooltipText += _mapSettingsRowTitles(varPrefix, activeSetting);

	//As position 0 in the array stores base setting we need to take that out of the array before we start looping through rows
	const currSetting = activeSetting.golden ? originalSetting : originalSetting.slice(1, originalSetting.length);

	//Looping through each setting and setting up the rows and inputting the data from the setting into the inputs
	for (var x = 0; x < maxSettings; x++) {
		const vals = _mapSettingsVals(x, activeSetting);
		let style = '';

		//Taking data from the current setting and overriding the info in vals with it.
		if (currSetting.length - 1 >= x) {
			for (let item in settingInputs) {
				let name = settingInputs[item];
				//Since Golden upgrade & Alchemy farm have 2 inputs that get merged into a single string we need to handle them separately
				if (activeSetting.golden && name.includes('golden')) {
					vals.goldenType = typeof currSetting[x].golden !== 'undefined' ? currSetting[x].golden[0] : vals.golden;
					vals.goldenNumber = typeof currSetting[x].golden !== 'undefined' ? currSetting[x].golden.toString().replace(/[^\d,:-]/g, '') : -2;
					continue;
				}
				if (activeSetting.alchemy && name.includes('potion')) {
					vals.potionstype = typeof currSetting[x].potion !== 'undefined' ? currSetting[x].potion[0] : vals.potion;
					vals.potionsnumber = typeof currSetting[x].potion !== 'undefined' ? parseNum(currSetting[x].potion.toString().replace(/[^\d,:-]/g, '')) : 0;
					continue;
				}
				vals[name] = typeof currSetting[x][name] !== 'undefined' ? currSetting[x][name] : vals[name];
			}
			if (x >= 10) overflow = true;
		} else {
			style = " style='display: none' ";
			if (x < 10) overflow = false;
		}

		tooltipText += _mapSettingsRowPopulateInputs(vals, varPrefix, activeSetting, x, titleText, style, currSetting.length);
	}

	tooltipText += `<div id='windowAddRowBtn' style='display: ${currSetting.length < maxSettings ? 'inline-block' : 'none'}' class='btn btn-success btn-md' onclick='_mapSettingsAddRow("${varPrefix}","${titleText}")'>+ Add Row</div>`;
	tooltipText += `</div></div><div style='display: none' id='mazHelpContainer'>${mazHelp}</div>`;

	const costText = `
		<div class='maxCenter'>
			<span class='btn btn-success btn-md' id='confirmTooltipBtn' onclick='settingsWindowSave("${titleText}", "${settingName}")'>Save and Close</span>
			<span class='btn btn-danger btn-md' onclick='cancelTooltip(true)'>Cancel</span>
			<span class='btn btn-primary btn-md' id='confirmTooltipBtn' onclick='settingsWindowSave("${titleText}", "${settingName}", true)'>Save</span>
			<span class='btn btn-info btn-md' onclick='windowToggleHelp("${windowWidth}")'>Help</span>
		</div>`;
	const ondisplay = null;

	game.global.lockTooltip = true;
	elem.style.top = '10%';
	elem.style.left = '1%';
	elem.style.height = 'auto';
	elem.style.maxHeight = `${window.innerHeight * 0.85}px`;
	elem.style.width = windowWidth;
	elem.style.overflowY = overflow ? 'scroll' : '';

	return [elem, tooltipText, costText, ondisplay];
}

function _mapSettingsInputObj() {
	return {
		'Auto Golden': {
			settingInputs: ['active', 'priority', 'row', 'golden', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: [],
			windowWidth: '40%'
		},
		Hypothermia: {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'level', 'autoLevel', 'bonfire', 'jobratio'],
			settingInputsDefault: ['frozencastle', 'autostorage', 'packrat'],
			windowWidth: '45%'
		},
		Archaeology: {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'level', 'repeatevery', 'mapCap', 'endzone', 'autoLevel', 'relics', 'jobratio'],
			settingInputsDefault: [],
			windowWidth: '50%'
		},
		Quagmire: {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'bogs', 'jobratio'],
			settingInputsDefault: ['abandonZone'],
			windowWidth: '45%'
		},
		Toxicity: {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'level', 'repeatevery', 'endzone', 'special', 'gather', 'autoLevel', 'repeat', 'jobratio'],
			settingInputsDefault: [],
			windowWidth: '50%'
		},
		Insanity: {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'level', 'special', 'gather', 'autoLevel', 'jobratio', 'destack', 'insanity'],
			settingInputsDefault: [],
			windowWidth: '55%'
		},
		'Desolation Gear Scumming': {
			settingInputs: ['active', 'priority', 'row', 'world', 'repeatevery', 'endzone', 'special', 'gather', 'jobratio', 'prestigeGoal'],
			settingInputsDefault: ['abandonZone'],
			windowWidth: '50%'
		},
		'Bone Shrine': {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'boneamount', 'bonebelow', 'gather', 'atlantrimp', 'jobratio', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: ['autoBone', 'bonebelow', 'gather', 'world', 'jobratio'],
			windowWidth: '65%'
		},
		'Bionic Raiding': {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'repeatevery', 'endzone', 'raidingzone', 'prestigeGoal', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: [],
			windowWidth: '70%'
		},
		'Void Map': {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'maxvoidzone', 'hdRatio', 'voidHDRatio', 'portalAfter', 'hdType', 'hdType2', 'jobratio', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: ['jobratio', 'maxTenacity', 'boneCharge', 'voidFarm', 'hitsSurvived', 'hdRatio', 'mapCap'],
			windowWidth: '70%'
		},
		'Worshipper Farm': {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'level', 'repeatevery', 'endzone', 'autoLevel', 'worshipper', 'jobratio', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: ['shipSkipEnabled', 'shipskip'],
			windowWidth: '70%'
		},
		'Smithy Farm': {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'level', 'repeat', 'repeatevery', 'endzone', 'autoLevel', 'mapType', 'meltingPoint', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: [],
			windowWidth: '70%'
		},
		'HD Farm': {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'level', 'hdBase', 'hdMult', 'hdType', 'mapCap', 'endzone', 'autoLevel', 'jobratio', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: ['jobratio', 'mapCap'],
			windowWidth: '70%'
		},
		Raiding: {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'repeatevery', 'endzone', 'raidingzone', 'prestigeGoal', 'raidingDropdown', 'incrementMaps', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: ['recycle'],
			windowWidth: '75%'
		},
		Alchemy: {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'level', 'repeatevery', 'endzone', 'special', 'gather', 'autoLevel', 'mapType', 'potion', 'jobratio'],
			settingInputsDefault: ['voidPurchase'],
			windowWidth: '75%'
		},
		'Map Bonus': {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'level', 'repeat', 'endzone', 'special', 'gather', 'autoLevel', 'hdRatio', 'jobratio', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: ['special', 'gather', 'jobratio'],
			windowWidth: '75%'
		},
		'Map Farm': {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'level', 'repeatevery', 'endzone', 'special', 'gather', 'autoLevel', 'mapType', 'repeat', 'hdRatio', 'atlantrimp', 'jobratio', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: [],
			windowWidth: '80%'
		},
		'Tribute Farm': {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'level', 'repeatevery', 'endzone', 'autoLevel', 'mapType', 'tributes', 'mets', 'buildings', 'atlantrimp', 'jobratio', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: [],
			windowWidth: '80%'
		}
	};
}

function _mapSettingsDefaultVals() {
	return {
		active: false,
		special: '0',
		gather: 'food',
		mapType: 'Absolute',
		cell: 81,
		autoBone: false,
		bonebelow: 0,
		world: 0,
		jobratio: '1,1,1',
		worshipper: 50,
		shipSkipEnabled: false,
		shipskip: 10,
		voidPurchase: false,
		maxTenacity: false,
		boneCharge: false,
		voidFarm: false,
		hitsSurvived: 0,
		hdRatio: 0,
		mapCap: 100,
		frozencastle: [200, 99],
		autostorage: false,
		packrat: false,
		recycle: false,
		abandonZone: 0
	};
}

function _mapSettingsVals(lineNo, activeSetting) {
	return {
		active: true,
		priority: lineNo + 1,
		check: true,
		world: -2,
		cell: -1,
		level: -1,
		special: '0',
		repeat: 1,
		hdRatio: 0,
		gather: 'food',
		tributes: 0,
		mets: 0,
		bogs: 0,
		insanity: 0,
		potions: 0,
		bonfire: 0,
		relics: 0,
		boneamount: 0,
		bonebelow: 0,
		runType: 'All',
		prestigeGoal: 'All',
		raidingDropdown: 1,
		jobratio: '1,1,1',
		worshipper: 50,
		hdRatio: 0,
		voidHDRatio: 0,
		buildings: true,
		atlantrimp: false,
		meltingPoint: false,
		portalAfter: false,
		raidingzone: '0',
		maxvoidzone: -1,
		mapType: activeSetting.mapFarm ? 'Map Count' : 'Absolute',
		autoLevel: true,
		endzone: 999,
		repeatevery: 0,
		challenge: 'All',
		challenge3: 'All',
		challengeOneOff: 'All',
		hdBase: 1,
		hdMult: 1,
		goldenType: 'v',
		hdType: 'world',
		hdType2: 'hitsSurvived',
		goldenNumber: -2,
		destack: false,
		mapCap: 100,
		incrementMaps: false,
		golden: 'v',
		potion: 'h',
		potionsnumber: 0,
		potionstype: 'h'
	};
}

function _mapSettingsDefaultTitles(varPrefix, s) {
	let tooltipText = `
		<div id='windowContainer' style='display: block'>
			<div id='windowError'></div>
			<div class='row windowRow titles' style='border: 0px; margin-top: -0.5vw;'>
			<div class='windowActive${varPrefix}'>Enabled</div>`;
	if (s.worshipperFarm) {
		tooltipText += `<div class='windowWorshipperSkip'>Enable<br />Skip</div>`;
		tooltipText += `<div class='windowWorshipper'>Skip<br />Value</div>`;
	}
	if (s.boneShrine) {
		tooltipText += `<div class='windowAutoBoneShrine'>Auto Spend Charges</div>`;
		tooltipText += `<div class='windowBoneDefault'>Auto Spend<br>At X Charges</div>`;
		tooltipText += `<div class='windowBoneDefault'>Auto Spend<br>From Z</div>`;
		tooltipText += `<div class='windowBoneDefault'>Auto Spend<br>Gather</div>`;
		tooltipText += `<div class='windowBoneDefault'>Auto Spend<br>Job Ratio</div>`;
	}
	if (s.mapBonus || s.hdFarm) tooltipText += `<div class='windowJobRatio${varPrefix}'>Job<br>Ratio</div>`;

	if (s.mapBonus) tooltipText += `<div class='windowSpecial${varPrefix}'>Special</div>`;
	if (s.raiding && !s.bionic) tooltipText += `<div class='windowRecycle'>Recycle<br>Maps</div>`;
	if (s.alchemy) tooltipText += `<div class='windowStorage'>Void<br>Purchase</div>`;
	if (s.quagmire) tooltipText += `<div class='windowAbandonZone'>Abandon Challege<br>Zone</div>`;
	if (s.voidMap) {
		tooltipText += `<div class='windowDefaultVoidMap'>Max<br>Map Bonus</div>`;
		if (game.permaBoneBonuses.boosts.owned > 0) tooltipText += `<div class='windowDefaultVoidMap'>Use Bone<br>Charge</div>`;
		tooltipText += `<div class='windowDefaultVoidMap'>Pre Void<br>Farm</div>`;
		tooltipText += `<div class='windowDefaultVoidMap'>Void Farm<br>Hits Survived</div>`;
		tooltipText += `<div class='windowDefaultVoidMap'>Void Farm<br>HD Ratio</div>`;
		tooltipText += `<div class='windowDefaultVoidMap'>Void Farm<br>Job Ratio</div>`;
		tooltipText += `<div class='windowDefaultVoidMap'>Void Farm<br>Map Cap</div>`;
	}
	if (s.hypothermia) {
		tooltipText += `<div class='windowFrozenCastle'>Frozen<br>Castle</div>`;
		tooltipText += `<div class='windowStorage'>Auto<br>Storage</div>`;
		tooltipText += `<div class='windowPackrat'>Packrat</div>`;
	}
	if (s.hdFarm) tooltipText += `<div class='windowCell${varPrefix}'>Map<br>Cap</div>`;

	tooltipText += '</div>';

	return tooltipText;
}

function _mapSettingsDefaultPopulateInputs(defaultVals, varPrefix, s) {
	const defaultDropdowns = mapSettingsDropdowns(currSettingUniverse, defaultVals, varPrefix);
	const className = defaultVals.special === 'hc' || defaultVals.special === 'lc' ? ' windowGatherOn' : ' windowGatherOff';

	let tooltipText = `<div id='windowRow' class='row windowRow ${className}'>`;
	tooltipText += `<div class='windowActive${varPrefix}' style='text-align: center;'>${buildNiceCheckbox('windowActiveDefault', null, defaultVals.active)}</div>`;
	if (s.worshipperFarm) {
		tooltipText += `<div class='windowWorshipperSkip' style='text-align: center;'>${buildNiceCheckbox('windowSkipShipEnabled', null, defaultVals.shipSkipEnabled)}</div>`;
		tooltipText += `<div class='windowWorshipper'><input value='${defaultVals.shipskip}' type='number' id='windowRepeatDefault'/></div>`;
	}
	if (s.boneShrine) {
		tooltipText += `<div class='windowAuto${varPrefix}' style='text-align: center;'>${buildNiceCheckbox('windowAutoBone', null, defaultVals.autoBone)}</div>`;
		tooltipText += `<div class='windowBoneDefault'><input value='${defaultVals.bonebelow}' type='number' id='windowBoneBelowDefault'/></div>`;
		tooltipText += `<div class='windowBoneDefault'><input value='${defaultVals.world}' type='number' id='windowBoneWorld'/></div>`;
		tooltipText += `<div class='windowBoneDefault'><select value='${defaultVals.gather}' id='windowBoneGatherDefault'>${defaultDropdowns.gather}</select></div>`;
		tooltipText += `<div class='windowBoneDefault'><input value='${defaultVals.jobratio}' type='text' id='windowJobRatioDefault'/></div>`;
	}
	if (s.mapBonus || s.hdFarm) tooltipText += `<div class='windowJobRatio${varPrefix}'><input value='${defaultVals.jobratio}' type='text' id='windowJobRatioDefault'/></div>`;
	if (s.mapBonus) {
		tooltipText += `<div class='windowSpecial${varPrefix}'  onchange='_mapSettingsUpdatePreset()'><select value='${defaultVals.special}' id='windowSpecial'>${defaultDropdowns.special}</select></div>`;
		tooltipText += `<div class='windowGather'><div style='text-align: center; font-size: 0.6vw;'>Gather</div><onchange='_mapSettingsUpdatePreset()'><select value='${defaultVals.gather}' id='windowGather'>${defaultDropdowns.gather}</select></div>`;
	}
	if (s.quagmire) tooltipText += `<div class='windowAbandonZone'><input value='${defaultVals.abandonZone}' type='number' id='abandonZone'/></div>`;
	if (s.hypothermia) {
		tooltipText += `<div class='windowFrozenCastle'><input value='${defaultVals.frozencastle}' type='text' id='windowFrozenCastleDefault'/></div>`;
		tooltipText += `<div class='windowStorage' style='text-align: center;'>${buildNiceCheckbox('windowStorageDefault', null, defaultVals.autostorage)}</div>`;
		tooltipText += `<div class='windowPackrat' style='text-align: center;'>${buildNiceCheckbox('windowPackratDefault', null, defaultVals.packrat)}</div>`;
	}

	if (s.raiding && !s.bionic) tooltipText += `<div class='windowRecycle' style='text-align: center;'>${buildNiceCheckbox('windowRecycleDefault', null, defaultVals.recycle)}</div>`;
	if (s.alchemy) tooltipText += `<div class='windowStorage' style='text-align: center;'>${buildNiceCheckbox('windowVoidPurchase', null, defaultVals.voidPurchase)}</div>`;
	if (s.voidMap) {
		tooltipText += `<div class='windowDefaultVoidMap' style='text-align: center;'>${buildNiceCheckbox('windowMaxTenacity', null, defaultVals.maxTenacity)}</div>`;
		if (game.permaBoneBonuses.boosts.owned > 0) tooltipText += `<div class='windowDefaultVoidMap' style='text-align: center;'>${buildNiceCheckbox('windowBoneCharge', null, defaultVals.boneCharge)}</div>`;
		tooltipText += `<div class='windowDefaultVoidMap' style='text-align: center;'>${buildNiceCheckbox('windowVoidFarm', null, defaultVals.voidFarm)}</div>`;
		tooltipText += `<div class='windowDefaultVoidMap'><input value='${defaultVals.hitsSurvived}' type='number' id='windowHitsSurvived'/></div>`;
		tooltipText += `<div class='windowDefaultVoidMap'><input value='${defaultVals.hdRatio}' type='number' id='windowHDRatio'/></div>`;
		tooltipText += `<div class='windowDefaultVoidMap'><input value='${defaultVals.jobratio}' type='text' id='windowJobRatioDefault'/></div>`;
		tooltipText += `<div class='windowDefaultVoidMap'><input value='${defaultVals.mapCap}' type='text' id='windowMapCap'/></div>`;
	}
	if (s.hdFarm) tooltipText += `<div class='windowCell${varPrefix}'><input value='${defaultVals.mapCap}' type='number' id='mapCap'/></div>`;

	tooltipText += `</div>`;

	return tooltipText;
}

function _mapSettingsRowTitles(varPrefix, s) {
	const trimple = currSettingUniverse === 1 ? 'Trimple' : 'Atlantrimp';
	let tooltipText = `
		<div id='windowContainer' style='display: block'>
			<div id='windowError'></div>
			<div class='row windowRow titles'>`;
	if (!s.golden) tooltipText += `<div class='windowActive${varPrefix}'>Active?</div>`;
	if (s.golden) tooltipText += `<div class='windowActiveAutoGolden'>Active?</div>`;
	tooltipText += `<div class='windowPriority${varPrefix}'>Priority</div>`;
	if (!s.voidMap && !s.golden && !s.boneShrine) tooltipText += `<div class='windowWorld${varPrefix}'>Start<br/>Zone</div>`;
	if (s.boneShrine) tooltipText += `<div class='windowWorld${varPrefix}'>Zone</div>`;
	if (s.mapFarm || s.tributeFarm || s.worshipperFarm || s.hdFarm || s.raiding || s.bionic || s.mapBonus || s.smithyFarm || s.desolation || s.toxicity || s.archaeology || s.alchemy) tooltipText += `<div class='windowEndZone${varPrefix}'>End<br/>Zone</div>`;
	if (s.golden) tooltipText += `<div class='windowAmtAutoGolden'>Amount</div>`;
	if (s.voidMap) tooltipText += `<div class='windowWorld${varPrefix}'>Min Zone</div>`;
	if (s.voidMap) tooltipText += `<div class='windowMaxVoidZone'>Max Zone</div>`;
	if (s.bionic) tooltipText += `<div class='windowRaidingZone${varPrefix}'>Raiding<br/>Zone</div>`;
	if (s.raiding) tooltipText += `<div class='windowRaidingZone${varPrefix}'>Map<br/>Level</div>`;
	if (!s.golden && !s.desolation) tooltipText += `<div class='windowCell${varPrefix}'>Cell</div>`;
	if (s.mapFarm || s.tributeFarm || s.smithyFarm || s.mapBonus || s.worshipperFarm || s.archaeology || s.insanity || s.alchemy || s.hypothermia || s.hdFarm || s.toxicity) tooltipText += `<div class='windowAutoLevel${varPrefix}'>Auto<br/>Level</div>`;
	if (!s.quagmire && !s.boneShrine && !s.raiding && !s.bionic && !s.voidMap && !s.golden && !s.desolation) tooltipText += `<div class='windowLevel${varPrefix}'>Map<br/>Level</div>`;
	if (s.tributeFarm || s.smithyFarm || s.mapFarm || s.alchemy) tooltipText += `<div class='windowMapTypeDropdown${varPrefix}'>Farm Type</div>`;
	if (s.tributeFarm) tooltipText += `<div class='windowTributes'>Tributes</div>`;
	if (s.tributeFarm) tooltipText += `<div class='windowMets'>Mets</div>`;

	if (s.mapFarm) tooltipText += `<div class='windowRepeat${varPrefix}'>Map<br/>Repeats</div>`;
	if (s.toxicity) tooltipText += `<div class='windowRepeat${varPrefix}'>Toxic<br/>Stacks</div>`;
	if (s.mapFarm || s.mapBonus) tooltipText += `<div class='windowHDRatio${varPrefix}'>Above X<br/>HD Ratio</div>`;

	if (s.mapBonus) tooltipText += `<div class='windowMapStacks'>Map<br/>Stacks</div>`;
	if (s.golden) tooltipText += `<div class='windowTypeAutoGolden'>Golden Type</div>`;
	if (s.quagmire) tooltipText += `<div class='windowBogs'>Bogs</div>`;
	if (s.archaeology) {
		tooltipText += `<div class='windowRelics${varPrefix}'>Relic String</div>`;
		tooltipText += `<div class='windowMapCap'>Map<br/>Cap</div>`;
	}
	if (s.insanity) tooltipText += `<div class='windowInsanity'>Insanity</div>`;
	if (s.alchemy) tooltipText += `<div class='windowPotionType'>Potion Type</div>`;
	if (s.alchemy) tooltipText += `<div class='windowPotionNumber'>Potion Number</div>`;
	if (s.hypothermia) tooltipText += `<div class='windowBonfire'>Bonfires</div>`;

	if (s.boneShrine) tooltipText += `<div class='windowBoneAmount'>To use</div>`;
	if (s.boneShrine) tooltipText += `<div class='windowBoneBelow'>Use below</div>`;
	if (s.worshipperFarm) tooltipText += `<div class='windowWorshipper'>Worshippers</div>`;
	if (s.smithyFarm) tooltipText += `<div class='windowSmithies'>Smithies</div>`;

	if (s.hdFarm) {
		tooltipText += `<div class='windowHDBase'>HD Base</div>`;
		tooltipText += `<div class='windowHDMult'>HD Mult</div>`;
		tooltipText += `<div class='windowHDType'>HD<br/>Type</div>`;
		tooltipText += `<div class='windowMapCap'>Map<br/>Cap</div>`;
	}

	if (s.voidMap) {
		tooltipText += `<div class='windowHDTypeVoidMap'>Dropdown<br/>#1</div>`;
		tooltipText += `<div class='windowVoidHDRatio'>Option<br/>#1</div>`;
		tooltipText += `<div class='windowHDTypeVoidMap'>Dropdown<br/>#2</div>`;
		tooltipText += `<div class='windowVoidHDRatio'>Option<br/>#2</div>`;
	}
	if (!s.raiding && !s.bionic && !s.smithyFarm && !s.golden) tooltipText += `<div class='windowJobRatio${varPrefix}'>Job<br/>Ratio</div>`;
	if (s.mapFarm || s.tributeFarm || s.worshipperFarm || s.raiding || s.bionic || s.smithyFarm || s.desolation || s.toxicity || s.archaeology || s.alchemy) tooltipText += `<div class='windowRepeatEvery${varPrefix}'>Repeat<br/>Every</div>`;
	if (s.boneShrine) tooltipText += `<div class='windowBoneGather'>Gather</div>`;
	if (s.mapFarm || s.alchemy || s.mapBonus || s.insanity || s.desolation || s.toxicity) tooltipText += `<div class='windowSpecial${varPrefix}'>Special</div>`;
	if (s.raiding) tooltipText += `<div class='windowRaidingDropdown'>Frag Type</div>`;
	if (s.mapFarm || s.tributeFarm || s.boneShrine) tooltipText += `<div class='windowAtlantrimp'>Run<br/>${trimple}</div>`;
	if (s.smithyFarm) tooltipText += `<div class='windowMeltingPoint'>Run<br/>MP</div>`;
	if (s.insanity) tooltipText += `<div class='windowBuildings'>Destack</div>`;
	if (s.tributeFarm) tooltipText += `<div class='windowBuildings'>Buy<br/>Buildings</div>`;
	if (s.raiding || s.bionic || s.desolation) tooltipText += `<div class='windowPrestigeGoal${varPrefix}'>Prestige<br/>Goal</div>`;
	if (s.raiding) tooltipText += `<div class='windowIncrementMaps'>Increment<br>Maps</div>`;
	if (s.mapFarm || s.tributeFarm || s.smithyFarm || s.mapBonus || s.worshipperFarm || s.boneShrine || s.voidMap || s.hdFarm || s.raiding || s.bionic || s.golden) tooltipText += `<div class='windowRunType${varPrefix}'>Run&nbsp;Type</div>`;
	if (s.voidMap) tooltipText += `<div class='windowPortalAfter'>Portal<br/>After</div>`;
	tooltipText += '</div>';

	return tooltipText;
}

function _mapSettingsRowPopulateInputs(vals, varPrefix, s, x, titleText, style, currSettingLength) {
	const dropdowns = mapSettingsDropdowns(currSettingUniverse, vals, varPrefix);

	let backgroundStyle = '';
	if (currSettingUniverse === 1 && !s.golden) {
		const natureStyles = {
			None: 'unset',
			Poison: 'rgba(50, 150, 50, 0.75)',
			Wind: 'rgba(60, 75, 130, 0.75)',
			Ice: 'rgba(50, 50, 200, 0.75)'
		};
		const empowerment = getZoneEmpowerment(vals.world);
		backgroundStyle = ` background:${natureStyles[empowerment]}`;
	}

	let classNames = [vals.special === 'hc' || vals.special === 'lc' ? 'windowGatherOn' : 'windowGatherOff', !vals.autoLevel ? 'windowLevelOn' : 'windowLevelOff', x <= currSettingLength - 1 ? 'active' : 'disabled'];

	const runTypeSetting = s.mapFarm || s.tributeFarm || s.smithyFarm || s.mapBonus || s.worshipperFarm || s.boneShrine || s.voidMap || s.hdFarm || s.raiding || s.bionic || s.golden;
	if (runTypeSetting) {
		classNames.push(vals.runType === 'One Off' ? `windowChallengeOneOffOn${varPrefix}` : `windowChallengeOneOffOff${varPrefix}`);
		classNames.push(vals.runType === 'C3' ? `windowChallenge3On${varPrefix}` : `windowChallenge3Off${varPrefix}`);
		classNames.push(vals.runType === 'Filler' ? `windowChallengeOn${varPrefix}` : `windowChallengeOff${varPrefix}`);
	}

	if (s.hdFarm) {
		classNames.push(vals.hdType === 'maplevel' ? 'windowMapLevelOff' : 'windowMapLevelOn');
	}

	const className = classNames.join(' ');

	let tooltipText = `<div id='windowRow${x}' class='row windowRow ${className}'${style}>`;
	//Delete the row button
	if (!s.golden) tooltipText += `<div class='windowDelete${varPrefix}' onclick='_mapSettingsRemoveRow("${x}", "${titleText}", true)'><span class='icomoon icon-cross'></span></div>`;
	//Button to delete the row for golden settings
	if (s.golden) tooltipText += `<div class='windowDeleteAutoGolden' onclick='_mapSettingsRemoveRow("${x}", "${titleText}", true)'><span class='icomoon icon-cross'></span></div>`;
	//Active checkbox
	if (!s.golden) tooltipText += `<div class='windowActive${varPrefix}' style='text-align: center;'>${buildNiceCheckbox('windowActive' + x, null, vals.active)}</div>`;
	//Active checkbox for golden settings
	if (s.golden) tooltipText += `<div class='windowActiveAutoGolden' style='text-align: center;'>${buildNiceCheckbox('windowActive' + x, null, vals.active)}</div>`;
	//Priority input
	tooltipText += `<div class='windowPriority${varPrefix}'><input value='${vals.priority}' type='number' id='windowPriority${x}'/></div>`;
	//World input
	if (!s.golden) tooltipText += `<div class='windowWorld${varPrefix}' style='${backgroundStyle}' oninput='_mapSettingsUpdatePreset("${x}", "${varPrefix}")'><input value='${vals.world}' type='number' id='windowWorld${x}'/></div>`;
	//End Zone input
	if (s.mapFarm || s.tributeFarm || s.worshipperFarm || s.hdFarm || s.raiding || s.bionic || s.mapBonus || s.smithyFarm || s.desolation || s.toxicity || s.archaeology || s.alchemy) tooltipText += `<div class='windowEndZone${varPrefix}'><input value='${vals.endzone}' type='number' id='windowEndZone${x}'/></div>`;
	//Highest Void Zone input - SHOULD BE CONVERTED TO USE END ZONE INSTEAD!
	if (s.voidMap) tooltipText += `<div class='windowMaxVoidZone'><input value='${vals.maxvoidzone}' type='number' id='windowMaxVoidZone${x}'/></div>`;
	//Raiding Zone input
	if (s.bionic) tooltipText += `<div class='windowRaidingZone${varPrefix}'><input value='${vals.raidingzone}' type='number' id='windowRaidingZone${x}'/></div>`;
	//Map Level Dropdown for Raiding
	if (s.raiding) tooltipText += `<div class='windowRaidingZone${varPrefix}'><select value='${vals.raidingzone}' id='windowRaidingZone${x}'>${dropdowns.mapLevel}</select></div>`;
	//Cell input
	if (!s.golden && !s.desolation) tooltipText += `<div class='windowCell${varPrefix}'><input value='${vals.cell}' type='number' id='windowCell${x}'/></div>`;
	//Auto level checkbox
	if (s.mapFarm || s.tributeFarm || s.smithyFarm || s.mapBonus || s.worshipperFarm || s.archaeology || s.insanity || s.alchemy || s.hypothermia || s.hdFarm || s.toxicity) tooltipText += `<div class='windowAutoLevel${varPrefix}' style='text-align: center; padding-left: 5px;'>${buildNiceCheckboxAutoLevel('windowAutoLevel' + x, null, vals.autoLevel, x, varPrefix)}</div>`;
	//Level input
	if (s.mapFarm || s.tributeFarm || s.smithyFarm || s.mapBonus || s.worshipperFarm || s.archaeology || s.insanity || s.alchemy || s.hypothermia || s.hdFarm || s.toxicity) tooltipText += `<div class='windowLevel${varPrefix}'><input value='${vals.level}' type='number' id='windowLevel${x}'/></div>`;
	//Map Type dropdown
	if (s.tributeFarm || s.smithyFarm || s.mapFarm || s.alchemy) tooltipText += `<div class='windowMapTypeDropdown${varPrefix}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'><select value='${vals.mapType}' id='windowMapTypeDropdown${x}'>${dropdowns.mapType}</select></div>`;
	//World input
	if (s.worshipperFarm) tooltipText += `<div class='windowWorshipper'><input value='${vals.worshipper}' type='number' id='windowWorshipper${x}'/></div>`;
	//Repeat input (Map Farm);
	if (s.mapFarm || s.toxicity) tooltipText += `<div class='windowRepeat${varPrefix}'><input value='${vals.repeat}' type='value' id='windowRepeat${x}'/></div>`;
	//HD Ratio to farm when above
	if (s.mapFarm || s.mapBonus) tooltipText += `<div class='windowHDRatio${varPrefix}'><input value='${vals.hdRatio}' type='value' id='windowHDRatio${x}'/></div>`;
	//Map Bonus to farm when below
	if (s.mapBonus) tooltipText += `<div class='windowMapStacks'><input value='${vals.repeat}' type='number' id='windowRepeat${x}'/></div>`;
	//Smithies to farm for
	if (s.smithyFarm) tooltipText += `<div class='windowSmithies'><input value='${vals.repeat}' type='number' id='windowRepeat${x}'/></div>`;
	if (s.hdFarm) {
		//HD Base value
		tooltipText += `<div class='windowHDBase'><div style='text-align: center; font-size: 0.6vw;'>${vals.hdType === 'maplevel' ? 'Map Level' : ''}</div><input value='${vals.hdBase}' type='number' id='windowRepeat${x}'/></div>`;
		//HD Mult value
		tooltipText += `<div class='windowHDMult'><input value='${vals.hdMult}' type='number' id='windowHDMult${x}'/></div>`;
		//HD Type dropdown
		tooltipText += `<div class='windowHDType' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'><select value='${vals.hdType}' id='windowHDType${x}'>${dropdowns.hdType}</select></div>`;
		//Map Cap
		tooltipText += `<div class='windowMapCap'><input value='${vals.mapCap}' type='number' id='windowMapCap${x}'/></div>`;
	}
	//Tributes to farm for
	if (s.tributeFarm) tooltipText += `<div class='windowTributes'><input value='${vals.tributes}' type='number' id='windowTributes${x}'/></div>`;
	//Meteorologists to farm for
	if (s.tributeFarm) tooltipText += `<div class='windowMets'><input value='${vals.mets}' type='number' id='windowMets${x}'/></div>`;
	//Black bogs to run
	if (s.quagmire) tooltipText += `<div class='windowBogs'><input value='${vals.bogs}' type='number' id='windowBogs${x}'/></div>`;
	//Archaeology Relic String
	if (s.archaeology) {
		tooltipText += `<div class='windowRelics${varPrefix}'><input value='${vals.relics}' type='value' id='windowRelics${x}'/></div>`;
		tooltipText += `<div class='windowMapCap'><input value='${vals.mapCap}' type='number' id='windowMapCap${x}'/></div>`;
	}
	//Insanity stacks to farm for
	if (s.insanity) tooltipText += `<div class='windowInsanity'><input value='${vals.insanity}' type='number' id='windowInsanity${x}'/></div>`;
	//Alchemy potion type dropdown
	if (s.alchemy) tooltipText += `<div class='windowPotionType' onchange='_mapSettingsUpdatePreset(${x})'><select value='${vals.potionstype}' id='windowPotionType${x}'>${dropdowns.potionTypes}</select></div>`;
	//Alchemy potion input
	if (s.alchemy) tooltipText += `<div class='windowPotionNumber'><input value='${vals.potionsnumber}' type='number' id='windowPotionNumber${x}'/></div>`;
	//Hypothermia bonfire goal
	if (s.hypothermia) tooltipText += `<div class='windowBonfire'><input value='${vals.bonfire}' type='number' id='windowBonfire${x}'/></div>`;
	//Bone Shrine - Charges to use
	if (s.boneShrine) tooltipText += `<div class='windowBoneAmount'><input value='${vals.boneamount}' type='number' id='windowBoneAmount${x}'/></div>`;
	//Bone Shrine - Use charges when below this amount
	if (s.boneShrine) tooltipText += `<div class='windowBoneBelow'><input value='${vals.bonebelow}' type='number' id='windowBoneBelow${x}'/></div>`;
	//Void HD Dropdown #1
	if (s.voidMap) tooltipText += `<div class='windowHDTypeVoidMap' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'><select value='${vals.hdType}' id='windowHDTypeVoidMap${x}'>${dropdowns.hdType}</select></div>`;
	//Run void maps when HD Ratio is above this value
	if (s.voidMap) tooltipText += `<div class='windowVoidHDRatio'><input value='${vals.hdRatio}' type='number' id='windowHDRatio${x}'/></div>`;
	//Void HD Dropdown #2
	if (s.voidMap) tooltipText += `<div class='windowHDTypeVoidMap onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'><select value='${vals.hdType2}' id='windowHDTypeVoidMap2${x}'>${dropdowns.hdType2}</select></div>`;
	//Run void maps when Void HD Ratio is above this value
	if (s.voidMap) tooltipText += `<div class='windowVoidHDRatio'><input value='${vals.voidHDRatio}' type='number' id='windowVoidHDRatio${x}'/></div>`;
	//Job ratio input
	if (!s.raiding && !s.bionic && !s.smithyFarm && !s.golden) tooltipText += `<div class='windowJobRatio${varPrefix}'><input value='${vals.jobratio}' type='value' id='windowJobRatio${x}'/></div>`;
	//Repeat every X zones
	if (s.mapFarm || s.tributeFarm || s.worshipperFarm || s.raiding || s.bionic || s.smithyFarm || s.desolation || s.toxicity || s.archaeology || s.alchemy) tooltipText += `<div class='windowRepeatEvery${varPrefix}'><input value='${vals.repeatevery}' type='number' id='windowRepeatEvery${x}'/></div>`;
	//Gather type dropdown for bone shrines
	if (s.boneShrine) tooltipText += `<div class='windowBoneGather'><select value='${vals.gather}' id='windowBoneGather${x}'>${dropdowns.gather}</select></div>`;
	//Raiding type dropdown
	if (s.raiding) tooltipText += `<div class='windowRaidingDropdown' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'><select value='${vals.raidingDropdown}' id='windowRaidingDropdown${x}'>${dropdowns.raidingTypes}</select></div>`;
	//Special cache to use dropdown
	if (s.mapFarm || s.alchemy || s.mapBonus || s.insanity || s.desolation || s.toxicity) tooltipText += `<div class='windowSpecial${varPrefix}'  onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'><select value='${vals.special}' id='windowSpecial${x}'>${dropdowns.special}</select></div>`;
	//Gather dropdown. Only shows if Huge or Large cache specials are selected. Displays "Gather" text to show user what it's for.
	if (s.mapFarm || s.alchemy || s.mapBonus || s.insanity || s.desolation || s.toxicity) tooltipText += `<div class='windowGather'><div style='text-align: center; font-size: 0.6vw;'>Gather</div><onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'><select value='${vals.gather}' id='windowGather${x}'>${dropdowns.gather}</select></div>`;
	//Trimple/Atlantrimp checkbox
	if (s.mapFarm || s.tributeFarm || s.boneShrine) tooltipText += `<div class='windowAtlantrimp' style='text-align: center;'>${buildNiceCheckbox('windowAtlantrimp' + x, null, vals.atlantrimp)}</div>`;
	//Melting point checkbox
	if (s.smithyFarm) tooltipText += `<div class='windowMeltingPoint' style='text-align: center;'>${buildNiceCheckbox('windowMeltingPoint' + x, null, vals.meltingPoint)}</div>`;
	//Buy buildings checkbox
	if (s.tributeFarm) tooltipText += `<div class='windowBuildings' style='text-align: center;'>${buildNiceCheckbox('windowBuildings' + x, null, vals.buildings)}</div>`;
	//Buy buildings checkbox
	if (s.insanity) tooltipText += `<div class='windowBuildings' style='text-align: center;'>${buildNiceCheckbox('windowBuildings' + x, null, vals.destack)}</div>`;
	//Prestige Goal dropdown
	if (s.raiding || s.bionic || s.desolation) tooltipText += `<div class='windowPrestigeGoal${varPrefix}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'><select value='${vals.prestigeGoal}' id='windowPrestigeGoal${x}'>${dropdowns.prestigeGoal}</select></div>`;
	//Increment Maps checkbox
	if (s.raiding) tooltipText += `<div class='windowIncrementMaps' style='text-align: center;'>${buildNiceCheckbox('windowIncrementMapsDefault' + x, null, vals.incrementMaps)}</div>`;
	//Auto Golden input
	if (s.golden) tooltipText += `<div class='windowAmtAutoGolden'><input value='${vals.goldenNumber}' type='number' id='windowWorld${x}'/></div>`;
	//Type of golden dropdown
	if (s.golden) tooltipText += `<div class='windowTypeAutoGolden' onchange='_mapSettingsUpdatePreset(${x})'><select value='${vals.goldentype}' id='windowGoldenType${x}'>${dropdowns.goldenType}</select></div>`;
	//Run Type dropdown
	if (runTypeSetting) tooltipText += `<div class='windowRunType${varPrefix}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'><select value='${vals.runType}' id='windowRunType${x}'>${dropdowns.runType}</select></div>`;
	//Filler challenges dropdown
	if (runTypeSetting) tooltipText += `<div class='windowChallenge${varPrefix}'><div style='text-align: center; font-size: 0.6vw;'>Challenge</div><select value='${vals.challenge}' id='windowChallenge${x}'>${dropdowns.challenge}</select></div>`;
	//C2/C3 challenges dropdown
	if (runTypeSetting) tooltipText += `<div class='windowChallenge3${varPrefix}'><div style='text-align: center; font-size: 0.6vw;'>Challenge${currSettingUniverse + 1}</div><select value='${vals.challenge3}' id='windowChallenge3${x}'>${dropdowns.c2}</select></div>`;
	//C2/C3 challenges dropdown
	if (runTypeSetting) tooltipText += `<div class='windowChallengeOneOff${varPrefix}'><div style='text-align: center; font-size: 0.6vw;'>One Offs</div><select value='${vals.windowChallengeOneOff}' id='windowChallengeOneOff${x}'>${dropdowns.oneOff}</select></div>`;
	//Portal After Void Maps checkbox
	if (s.voidMap) tooltipText += `<div class='windowPortalAfter' style='text-align: center;'>${buildNiceCheckbox('windowPortalAfter' + x, null, vals.portalAfter)}</div>`;
	tooltipText += '</div>';

	return tooltipText;
}

function buildNiceCheckboxAutoLevel(id, extraClass = '', enabled, index, varPrefix) {
	const defaultClasses = 'niceCheckbox noselect';
	const isChecked = enabled ? "icomoon icon-checkbox-checked' data-checked='true'" : "icomoon icon-checkbox-unchecked' data-checked='false'";
	const title = enabled ? 'Checked' : 'Not Checked';
	extraClass = `${extraClass} ${defaultClasses}`;

	const html = `
        <span title='${title}' id='${id}' class='${extraClass} ${isChecked}' onclick='swapNiceCheckbox(this); _mapSettingsUpdatePreset("${index}", "${varPrefix}");'></span>
    `;

	const tooltipDiv = document.getElementById('tooltipDiv');
	if (tooltipDiv.classList.contains('tooltipExtraLg') && ['Farm', 'Map Bonus'].some((word) => tooltipDiv.children.tipTitle.innerText.includes(word))) {
		_mapSettingsUpdatePreset(index, varPrefix);
	}

	return html;
}

function settingsWindowSave(titleText, varPrefix, reopen) {
	let error = '';
	let maxSettings = 31;

	const mapFarm = titleText.includes('Map Farm');
	const mapBonus = titleText.includes('Map Bonus');
	const voidMap = titleText.includes('Void Map');
	const hdFarm = titleText.includes('HD Farm');
	const raiding = titleText.includes('Raiding');
	const bionic = titleText.includes('Bionic');
	const toxicity = titleText.includes('Toxicity');

	const quagmire = titleText.includes('Quagmire');
	const archaeology = titleText.includes('Archaeology');
	const insanity = titleText.includes('Insanity');
	const alchemy = titleText.includes('Alchemy');
	const hypothermia = titleText.includes('Hypothermia');
	const desolation = titleText.includes('Desolation');
	const boneShrine = titleText.includes('Bone Shrine');
	const golden = titleText.includes('Golden');
	const tributeFarm = titleText.includes('Tribute Farm');
	const smithyFarm = titleText.includes('Smithy Farm');
	const worshipperFarm = titleText.includes('Worshipper Farm');

	const setting = [];
	const defaultSetting = {};

	if (!golden) {
		defaultSetting.active = readNiceCheckbox(document.getElementById('windowActiveDefault'));
		if (worshipperFarm) {
			defaultSetting.shipSkipEnabled = readNiceCheckbox(document.getElementById('windowSkipShipEnabled'));
			defaultSetting.shipskip = parseInt(document.getElementById('windowRepeatDefault').value, 10);
		}
		if (mapBonus) {
			defaultSetting.special = document.getElementById('windowSpecial').value;

			if (defaultSetting.special === 'hc' || defaultSetting.special === 'lc') defaultSetting.gather = document.getElementById('windowGather').value;
			else defaultSetting.gather = null;
		}

		if (boneShrine) {
			defaultSetting.autoBone = readNiceCheckbox(document.getElementById('windowAutoBone'));
			defaultSetting.bonebelow = parseInt(document.getElementById('windowBoneBelowDefault').value, 10);
			defaultSetting.gather = document.getElementById('windowBoneGatherDefault').value;
			defaultSetting.world = parseInt(document.getElementById('windowBoneWorld').value, 10);
		}

		if (mapBonus || voidMap || boneShrine || hdFarm) defaultSetting.jobratio = document.getElementById('windowJobRatioDefault').value;
		if (alchemy) defaultSetting.voidPurchase = readNiceCheckbox(document.getElementById('windowVoidPurchase'));
		if (quagmire) defaultSetting.abandonZone = parseInt(document.getElementById('abandonZone').value);
		if (voidMap) {
			defaultSetting.maxTenacity = readNiceCheckbox(document.getElementById('windowMaxTenacity'));
			if (game.permaBoneBonuses.boosts.owned > 0) defaultSetting.boneCharge = readNiceCheckbox(document.getElementById('windowBoneCharge'));
			defaultSetting.voidFarm = readNiceCheckbox(document.getElementById('windowVoidFarm'));
			defaultSetting.hitsSurvived = document.getElementById('windowHitsSurvived').value;
			defaultSetting.hdRatio = document.getElementById('windowHDRatio').value;
			defaultSetting.mapCap = parseFloat(document.getElementById('windowMapCap').value, 10);
		}
		if (hypothermia) {
			defaultSetting.frozencastle = document.getElementById('windowFrozenCastleDefault').value.split(',');
			defaultSetting.autostorage = readNiceCheckbox(document.getElementById('windowStorageDefault'));
			defaultSetting.packrat = readNiceCheckbox(document.getElementById('windowPackratDefault'));
		}
		if (raiding && !bionic) {
			defaultSetting.recycle = readNiceCheckbox(document.getElementById('windowRecycleDefault'));
		}
		if (hdFarm) defaultSetting.mapCap = parseFloat(document.getElementById('mapCap').value, 10);
	}

	for (var x = 0; x < maxSettings; x++) {
		const thisSetting = {};

		let world = document.getElementById('windowWorld' + x);
		if (!world || world.value === '-2') {
			continue;
		}

		thisSetting.active = readNiceCheckbox(document.getElementById('windowActive' + x));
		thisSetting.priority = parseInt(document.getElementById('windowPriority' + x).value, 10);
		thisSetting.row = x + 1;
		if (!golden) {
			thisSetting.world = parseInt(document.getElementById('windowWorld' + x).value, 10);
			if (!desolation) thisSetting.cell = parseInt(document.getElementById('windowCell' + x).value, 10);
		}
		if (!quagmire && !boneShrine && !raiding && !voidMap && !golden && !desolation) thisSetting.level = parseInt(document.getElementById('windowLevel' + x).value, 10);
		if (smithyFarm || mapBonus) thisSetting.repeat = parseInt(document.getElementById('windowRepeat' + x).value, 10);
		if (hdFarm) {
			thisSetting.hdBase = parseFloat(document.getElementById('windowRepeat' + x).value, 10);
			thisSetting.hdMult = parseFloat(document.getElementById('windowHDMult' + x).value, 10);
			thisSetting.hdType = document.getElementById('windowHDType' + x).value;
			thisSetting.mapCap = parseInt(document.getElementById('windowMapCap' + x).value, 10);
		}
		if (mapFarm || tributeFarm || worshipperFarm || raiding || smithyFarm || desolation || toxicity || archaeology || alchemy) thisSetting.repeatevery = parseInt(document.getElementById('windowRepeatEvery' + x).value, 10);
		if (mapFarm || tributeFarm || worshipperFarm || hdFarm || raiding || mapBonus || smithyFarm || desolation || toxicity || archaeology || alchemy) thisSetting.endzone = parseInt(document.getElementById('windowEndZone' + x).value, 10);
		if (raiding && bionic) thisSetting.raidingzone = parseInt(document.getElementById('windowRaidingZone' + x).value, 10);
		if (raiding && !bionic) thisSetting.raidingzone = document.getElementById('windowRaidingZone' + x).value;

		if (mapFarm || alchemy || mapBonus || insanity || desolation || toxicity) {
			thisSetting.special = document.getElementById('windowSpecial' + x).value;
			if (thisSetting.special === 'hc' || thisSetting.special === 'lc') thisSetting.gather = document.getElementById('windowGather' + x).value;
			else thisSetting.gather = null;
		}
		if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || archaeology || insanity || alchemy || hypothermia || hdFarm || toxicity) thisSetting.autoLevel = readNiceCheckbox(document.getElementById('windowAutoLevel' + x));
		if (tributeFarm || smithyFarm || mapFarm || alchemy) thisSetting.mapType = document.getElementById('windowMapTypeDropdown' + x).value;
		if (mapFarm && thisSetting.mapType === 'Map Count') thisSetting.repeat = parseFloat(document.getElementById('windowRepeat' + x).value, 10);
		if (mapFarm && thisSetting.mapType !== 'Map Count') thisSetting.repeat = document.getElementById('windowRepeat' + x).value;
		if (toxicity) thisSetting.repeat = document.getElementById('windowRepeat' + x).value;
		if (mapFarm || mapBonus) thisSetting.hdRatio = document.getElementById('windowHDRatio' + x).value;
		if (tributeFarm) thisSetting.tributes = parseInt(document.getElementById('windowTributes' + x).value, 10);
		if (tributeFarm) thisSetting.mets = parseInt(document.getElementById('windowMets' + x).value, 10);
		if (golden) {
			thisSetting.golden = document.getElementById('windowGoldenType' + x).value;
			thisSetting.golden += parseInt(document.getElementById('windowWorld' + x).value, 10);
		}
		if (quagmire) thisSetting.bogs = parseInt(document.getElementById('windowBogs' + x).value, 10);
		if (archaeology) {
			thisSetting.relics = document.getElementById('windowRelics' + x).value;
			thisSetting.mapCap = parseInt(document.getElementById('windowMapCap' + x).value, 10);
		}
		if (alchemy) {
			thisSetting.potion = document.getElementById('windowPotionType' + x).value;
			thisSetting.potion += parseInt(document.getElementById('windowPotionNumber' + x).value, 10);
		}
		if (hypothermia) thisSetting.bonfire = parseInt(document.getElementById('windowBonfire' + x).value, 10);
		if (boneShrine) {
			thisSetting.boneamount = parseInt(document.getElementById('windowBoneAmount' + x).value, 10);
			thisSetting.bonebelow = parseInt(document.getElementById('windowBoneBelow' + x).value, 10);
			thisSetting.gather = document.getElementById('windowBoneGather' + x).value;
		}
		if (worshipperFarm) thisSetting.worshipper = parseInt(document.getElementById('windowWorshipper' + x).value, 10);
		if (voidMap) {
			thisSetting.maxvoidzone = parseInt(document.getElementById('windowMaxVoidZone' + x).value, 10);
			thisSetting.hdRatio = parseFloat(document.getElementById('windowHDRatio' + x).value, 10);
			thisSetting.voidHDRatio = parseFloat(document.getElementById('windowVoidHDRatio' + x).value, 10);
			thisSetting.portalAfter = readNiceCheckbox(document.getElementById('windowPortalAfter' + x));

			thisSetting.hdType = document.getElementById('windowHDTypeVoidMap' + x).value;
			thisSetting.hdType2 = document.getElementById('windowHDTypeVoidMap2' + x).value;
		}
		if (tributeFarm) thisSetting.buildings = readNiceCheckbox(document.getElementById('windowBuildings' + x));
		if (mapFarm || tributeFarm || boneShrine) thisSetting.atlantrimp = readNiceCheckbox(document.getElementById('windowAtlantrimp' + x));
		if (smithyFarm) thisSetting.meltingPoint = readNiceCheckbox(document.getElementById('windowMeltingPoint' + x));
		if (!raiding && !smithyFarm && !golden) thisSetting.jobratio = document.getElementById('windowJobRatio' + x).value;
		if (raiding || desolation) {
			thisSetting.prestigeGoal = document.getElementById('windowPrestigeGoal' + x).value;
			if (!bionic && !desolation) thisSetting.raidingDropdown = document.getElementById('windowRaidingDropdown' + x).value;
		}
		if (raiding && !bionic) thisSetting.incrementMaps = readNiceCheckbox(document.getElementById('windowIncrementMapsDefault' + x));

		if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden) thisSetting.runType = document.getElementById('windowRunType' + x).value;

		if (insanity) {
			thisSetting.destack = readNiceCheckbox(document.getElementById('windowBuildings' + x));
			thisSetting.insanity = parseInt(document.getElementById('windowInsanity' + x).value, 10);
		}
		if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden) {
			thisSetting.challenge = thisSetting.runType === 'Filler' ? document.getElementById('windowChallenge' + x).value : null;
			thisSetting.challenge3 = thisSetting.runType === 'C3' ? document.getElementById('windowChallenge3' + x).value : null;
			thisSetting.challengeOneOff = thisSetting.runType === 'One Off' ? document.getElementById('windowChallengeOneOff' + x).value : null;
		}

		if (!golden && (isNaN(thisSetting.world) || thisSetting.world < 6)) {
			error += ' Line #' + (x + 1) + " needs a value for Start Zone that's greater than 5.<br>";
		} else if (!golden && thisSetting.world > 1000) {
			error += ' Line #' + (x + 1) + " needs a value for Start Zone that's less than 1000.<br>";
		}
		if (!golden && thisSetting.world + thisSetting.level < 6 && !thisSetting.autoLevel) {
			error += ' Line #' + (x + 1) + " can't have a zone and map combination below zone 6.<br>";
		}
		if (mapBonus && thisSetting.level < (currSettingUniverse === 1 ? 0 - game.portal.Siphonology.level : 0)) {
			error += ' Line #' + (x + 1) + " can't have a map level below " + (game.global.universe === 1 && game.portal.Siphonology.level > 0 ? 0 - game.portal.Siphonology.level : 'world level') + " as you won't be able to get any map stacks.<br>";
		}
		if (mapBonus && thisSetting.repeat < 1) {
			error += ' Line #' + (x + 1) + " can't have a map bonus value lower than 1 as you won't be able to get any map stacks.<br>";
		}
		if (mapFarm && thisSetting.repeat < 1 && thisSetting.repeat !== -1) {
			error += ' Line #' + (x + 1) + " can't have a repeat value lower than 1 as you won't run any maps when this line runs.<br>";
		}
		if (insanity) {
			if (thisSetting.level === 0 && !thisSetting.autoLevel && !thisSetting.destack) {
				error += ' Line #' + (x + 1) + " can't have a map level of 0 as you won't gain any Insanity stacks running this map.<br>";
			}
			if (thisSetting.level < 0 && !thisSetting.destack && !thisSetting.autoLevel) {
				error += ' Line #' + (x + 1) + " can't have a map level below world level as you will lose Insanity stacks running this map. To change this toggle the 'Destack' option.<br>";
			}
			if (thisSetting.level >= 0 && thisSetting.destack && !thisSetting.autoLevel) {
				error += ' Line #' + (x + 1) + " can't have a map level at or above world level as you won't be able to lose Insanity stacks running this map. To change this toggle the 'Destack' option.<br>";
			}
			if (thisSetting.insanity < 0) {
				error += ' Line #' + (x + 1) + " can't have a insanity value below 0.<br>";
			}
		}
		if (thisSetting.level > 10) thisSetting.level = 10;
		if (thisSetting.endzone < thisSetting.world) thisSetting.endzone = thisSetting.world;
		if (thisSetting.cell < 1) thisSetting.cell = 1;
		if (thisSetting.cell > 100) thisSetting.cell = 100;
		if (thisSetting.worshipper > game.jobs.Worshipper.max) worshipper = game.jobs.Worshipper.max;
		if (thisSetting.hdRatio < 0) thisSetting.hdRatio = 0;
		if (thisSetting.voidHDRatio < 0) thisSetting.voidHDRatio = 0;
		if (thisSetting.hdRatio < 0) thisSetting.hdRatio = 0;
		if (thisSetting.maxvoidzone < thisSetting.world) thisSetting.maxvoidzone = thisSetting.world;

		if (thisSetting.repeat < 0 && thisSetting.repeat !== -1) thisSetting.repeat = 0;

		setting.push(thisSetting);
	}

	if (error) {
		const elem = document.getElementById('windowError');
		if (elem) elem.innerHTML = error;
		return;
	}

	if (golden) {
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

	setPageSetting(varPrefix + 'Settings', setting, currSettingUniverse);
	if (!golden) {
		const value = currSettingUniverse === 2 ? 'valueU2' : 'value';
		game.global.addonUser[varPrefix + 'Settings'][value] = Array.from({ length: 31 }, () => ({ done: '' }));
	}

	if (!golden && !defaultSetting.active) debug(titleText + " has been saved but is disabled. To enable it tick the 'Active' box in the top left of the window.", 'mazSettings');
	document.getElementById('tooltipDiv').style.overflowY = '';

	const elem = document.getElementById('tooltipDiv');
	swapClass(document.getElementById('tooltipDiv').classList[0], 'tooltipExtraNone', elem);
	cancelTooltip(true);
	if (reopen) MAZLookalike('mapSettings', titleText);

	//Disable Void Map global variables when saving Void Map settings to ensure we aren't running voids at the wrong zone after updating.
	if (voidMap) {
		MODULES.mapFunctions.hasVoidFarmed = '';
		delete mapSettings.boneChargeUsed;
		delete mapSettings.voidHDIndex;
		delete mapSettings.dropdown;
		delete mapSettings.dropdown2;
		delete mapSettings.voidTrigger;
		delete mapSettings.portalAfterVoids;
	} else if (smithyFarm) {
		delete mapSettings.smithyTarget;
	} else if (tributeFarm) {
		delete mapSettings.tribute;
		delete mapSettings.meteorologist;
	} else if (alchemy) {
		delete mapSettings.potionTarget;
	}

	//Disables Atlantrimp for 0.5 seconds and recalculates mapSettings variable.
	//This is to prevent the issue of Atlantrimp being run when you're saving settings.
	_settingTimeout(500);
	farmingDecision();
}

function mapSettingsHelpWindow(titleText) {
	let mazHelp = 'Welcome to <b>' + titleText + '</b> settings!';
	const mapFarm = titleText.includes('Map Farm');
	const mapBonus = titleText.includes('Map Bonus');
	const voidMap = titleText.includes('Void Map');
	const hdFarm = titleText.includes('HD Farm');
	const raiding = titleText.includes('Raiding');
	const bionic = titleText.includes('Bionic');
	const toxicity = titleText.includes('Toxicity');
	const tributeFarm = titleText.includes('Tribute Farm');
	const smithyFarm = titleText.includes('Smithy Farm');
	const worshipperFarm = titleText.includes('Worshipper Farm');
	const quagmire = titleText.includes('Quagmire');
	const archaeology = titleText.includes('Archaeology');
	const insanity = titleText.includes('Insanity');
	const alchemy = titleText.includes('Alchemy');
	const hypothermia = titleText.includes('Hypothermia');
	const desolation = titleText.includes('Desolation');
	const boneShrine = titleText.includes('Bone Shrine');
	const golden = titleText.includes('Golden');

	const radonSetting = currSettingUniverse === 2;
	const trimple = currSettingUniverse === 1 ? 'Trimple' : 'Atlantrimp';

	if (!golden) mazHelp += " This is a powerful automation tool that allows you to set when maps should be automatically run. Here's a quick overview of what everything does:";
	else if (golden) {
		mazHelp += " This is a powerful automation tool that allows you to set the order of golden upgrade purchases and how many of each type you'd like to have. Here's a quick overview of what everything does:";
	}

	//Brief overview of what the setting does as it's kinda different from other settings.
	if (desolation) {
		mazHelp += "<p>This setting is sligtly different from others. It abuses a bug in the game where you can scum prestiges through a <b>Blacksmithery 3</b> bug. <b>This definitely shouldn't exist so be aware this is exploiting unintentional game mechanics.</b></p>";
		mazHelp += '<li class="indent">By exploiting this bug we get the prestiges from <b>Blacksmithery 3</b> when entering the zone and then the prestiges from the equivalent of doing a +10 map to get those prestiges significantly easier than we should be able to.</li>';
		mazHelp += "<li class=\"indent\">For a more detailed explanation of how this setting works please see the <a href='https://discord.com/channels/371177798305447938/1075840564534202398/1087668293797679194' target='_blank'>guide in the <b>[Guide] Desolation</b> channel on the Trimps Discord.</a></li>";
		mazHelp += '<li class="indent">It will create a +1 map on cell 100 of the zone <b>PRIOR</b> to the start zone you set when the improbability is less than 5 gamma bursts from death.</li>';
		mazHelp += '<li class="indent">It then clears 3 cells before going back into the world and finishing off the improbability and clearing the map on the next zone to take advantage of the bug.</li>';
	}

	//Map Bonus Information to detail how it functions since it's unclear compared to every other setting
	if (mapBonus) mazHelp += "<br><br><b>Map Bonus</b> works by using the last active line that's greater or equal to your current world zone and then using those settings for every zone that follows on from it.";
	if (voidMap) {
		mazHelp += '<br><br>Void Map works by using Min Zone</b> as the lower bound zone to run voids on and <b>Max Zone</b> as the upper bound.';

		mazHelp += '<li class="indent">Additionally it has dropdown inputs which can give you the ability to add more fine-tuning for when a line should be run.';
		mazHelp += '<li class="indent">If you reach the <b>Max Zone</b> zone input of a line it will run regardless of dropdown inputs.';
	}
	if (smithyFarm) mazHelp += '<br><br><b>Smithy Farm</b> will farm resources in the following order <b>Metal > Wood > Gems</b>. This cannot be changed.';
	if (insanity) mazHelp += "<br><br><b>Insanity Farm</b> will disable unique & lower than world level maps when you don't have a destack zone line setup.";

	//Top Row Information
	if (!golden) {
		mazHelp += '<br><br>The top row section consists of toggles/inputs which add extra functions to the setting itself:<br></br><ul>';
		mazHelp += '<li><b>Enabled</b> - A toggle to disable/enable the entire setting.</li>';
		if (raiding && !bionic) {
			mazHelp += '<li><b>Recycle Maps</b> - A toggle to recycle maps after raiding has finished.</li>';
			mazHelp += "<li><b>Increment Maps</b> - A toggle to swap between just running the 1 target zone map and gradually running different maps from lowest map you can obtain a prestige to the highest which can help if you're not strong enough to raid your target zone immediately.</li>";
		}
		if (mapBonus) {
			mazHelp += '<li><b>Job Ratio</b> - The job ratio to use when Map Bonus is set to run from <b>Map Bonus Ratio</b> or <b>Max Map Bonus for Spire</b> settings. If set to <b>-1</b> it will use your world job ratios.</li>';
			mazHelp += "<li class=\"indent\">Input should look like '1,1,1,1' (Farmers, Lumberjacks, Miners, Scientists). If you don't want Farmers, Miners or Scientists you can input '0,1' for this setting.</li>";
			mazHelp += "<li><b>Special</b> - The type of cache you'd like to run when Map Bonus is set to run from <b>Map Bonus Ratio</b> or <b>Max Map Bonus for Spire</b> settings.</li>";
		}
		if (voidMap) {
			mazHelp += '<li><b>Max Map Bonus</b> - Will assume you have 10 map bonus stacks';
			if (radonSetting && !game.portal.Tenacity.radLocked) mazHelp += ' and max tenacity';
			mazHelp += ' when void maps HD Ratio calcs are being set.</li>';

			if (game.permaBoneBonuses.boosts.owned > 0) mazHelp += '<li><b>Bone Charge</b> - The first time a line starts running Void Maps in each portal it will use a single Bone Charge.</li>';

			mazHelp += '<li><b>Void Farm</b> - Will farm before running void maps if your void hits survived is below the input in <b>Void Farm Hits Survived</b> or your void hd ratio is below the input in <b>Void Farm Void HD Ratio</b>. Farms until you have reached the map cap set in the <b>HD Farm</b> settings.</li>';

			mazHelp += '<li><b>Void Farm Hits Survived</b> - Will farm to this void hits survived value before running void maps. Must be set above 0 to be used otherwise will be ignored.</li>';

			mazHelp += '<li><b>Void Farm HD Ratio</b> - Will farm to this void HD ratio survived value before running void maps. Must be set above 0 to be used otherwise will be ignored.</li>';

			mazHelp += '<li><b>Void Farm Job Ratio</b> - The job ratio to use when farming stats before running void maps.</li>';
			mazHelp += "<li class=\"indent\">Input should look like '1,1,1,1' (Farmers, Lumberjacks, Miners, Scientists). If you don't want Farmers, Miners or Scientists you can input '0,1' for this setting.</li>";
			mazHelp += "<li><b>Map Cap</b> - The maximum amount of maps you would like to run during this farm. If set to -1 it will repeat an Infinite amount of times and you'll have to manually stop farming, would only recommend this if you're confident you'll be able to get enough stats to finish the farm.</li>";
		}
		if (boneShrine) {
			mazHelp += '<li><b>Auto Spend Charges</b> - Enables the ability to automatically spend bone charges when above a certain value.</li>';
			mazHelp += '<li><b>Auto Spend At X Charges</b> - The amount of bone charges you have to reach before one will automatically be spent. Disable this by setting this to a value at or below 0 or above 10.</li>';
			mazHelp += '<li><b>Auto Spend From Z</b> - Will only auto spend bone charges when at or above this zone.</li>';
			mazHelp += '<li><b>Auto Spend Gather</b> - The gather type to use when auto spending bone charges.</li>';
			mazHelp += '<li><b>Auto Spend Job Ratio</b> - The job ratio to use when auto spending bone charges.</li>';
			mazHelp += "<li class=\"indent\">Input should look like '1,1,1,1' (Farmers, Lumberjacks, Miners, Scientists). If you don't want Farmers, Miners or Scientists you can input '0,1' for this setting.</li>";
		}
		if (hdFarm) {
			mazHelp += '<li><b>Job Ratio</b> - The job ratio to use when Map Bonus is set to run from the <b>Hits Survived</b> setting. If set to <b>-1</b> it will use your world job ratios.</li>';
			mazHelp += "<li><b>Map Cap</b> - The maximum amount of maps you would like to run during this farm. If set to -1 it will repeat an Infinite amount of times and you'll have to manually stop farming, would only recommend this if you're confident you'll be able to get enough stats to finish the farm.</li>";
		}
		if (worshipperFarm) {
			mazHelp += '<li><b>Enabled Skip</b> - A toggle to enable the skip value setting.</li>';
			mazHelp += '<li><b>Skip Value</b> - How many worshippers a small/large (dependant on what you have unlocked) savoury cache must provide for you to run your Worshipper Farming.</li>';
		}
		if (quagmire) {
			mazHelp += '<li><b>Abandon Zone</b> - The zone you would like to abandon the challenge at.</li>';
		}
		if (alchemy) {
			mazHelp += '<li><b>Void Purchase</b> - Will purchase as many void and strength potions as you can currently afford when you go into a void map. Would recommend only disabling this setting when going for the Alchemy achievement.</li>';
		}
		if (hypothermia) {
			mazHelp += "<li><b>Frozen Castle</b> - The zone,cell combination that you'd like Frozen Castle to be run at. The input style is '200,99' and if you don't input it properly it'll default to zone 200 cell 99.</li>";
			mazHelp += '<li><b>AutoStorage</b> - Disables AutoStorage until the first Bonfire farm zone that you reach during the challenge.</li>';
			mazHelp += "<li><b>Packrat</b> - Will purchase as many levels of packrat as possible once the Hypothermia challenge ends with leftover radon and additionally when portaling it reset the packrat level to 3 so that you don't accidentally trigger a 5th bonfire at the start of the run.</li>";
		}
	}

	if (golden) mazHelp += '<br>';

	//Row Settings
	mazHelp += '</ul></br> The settings for each row that is added:<ul>';

	//All Settings
	mazHelp += "<li><span style='padding-left: 0.3%' class='mazDelete'><span class='icomoon icon-cross'></span></span> - Remove this line completely</li>";
	//Active
	mazHelp += '<li><b>Active</b> - A toggle to disable/enable this line.</li>';
	//Priority
	mazHelp += '<li><b>Priority</b> - If this setting has two or more lines set to trigger at the same cell on the same Zone, the line with the lowest priority will run first. This also determines sort order of lines in the UI.</li>';
	//Zone
	if (!voidMap && !golden) mazHelp += '<li><b>Zone</b> - The Zone that this line should run. Must be between 6 and 1000.</li>';
	//Cell
	if (!golden && !desolation) {
		mazHelp += '<li><b>Cell</b> - The cell number between 1 and 100 where this line should trigger. 1 is the first cell of the Zone, 100 is the final cell.</li>';
		mazHelp += '<li class="indent"><b>Runs on the cell you have input or after if you have already gone past that cell on your zone.</b></li>';
		mazHelp += '<li class="indent"><b>Doesn\'t take overkill into account so for example if you overkill past c100 with a c100 line it will be skipped.</b></li>';
	}
	//AutoLevel
	if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || archaeology || insanity || alchemy || hypothermia || hdFarm || toxicity)
		mazHelp += '<li><b>Auto Level</b> - Will automatically identify the best map level for your farming needs by looking at highest affordable map level and then calculating if you can one shot enemies with Titimp buff. ' + (radonSetting ? "Highly recommended to use 'Auto Equality: Advanced' with this setting as it'll speed up map runs by a significant amount." : '') + '</li>';
	//Map Level
	if (mapFarm || tributeFarm || smithyFarm || worshipperFarm || hdFarm || insanity || alchemy || hypothermia || toxicity) mazHelp += "<li><b>Map Level</b> - The map level you'd like this line to run. Can input a positive or negative number for this so input could be '-5', '0', or '3'. " + (radonSetting && !(insanity || alchemy || hypothermia) ? 'Will override inputs above -1 during the Wither challenge.' : '') + '</li>';
	//Map Level for Map Bonus!
	if (mapBonus) mazHelp += "<li><b>Map Level</b> - The map level you'd like this line to run. Can only input a value for a map level you'd be able to gain map stacks from.</li>";

	if (!raiding && !smithyFarm && !hdFarm && !golden) {
		mazHelp += '<li><b>Job Ratio</b> - The job ratio you want to use for this line. If set to <b>-1</b> it will use your world job ratios.</li>';
		mazHelp += "<li class=\"indent\">Input should look like '1,1,1,1' (Farmers, Lumberjacks, Miners, Scientists). If you don't want Farmers, Miners or Scientists you can input '0,1' for this setting.</li>";
	}
	if (mapFarm || mapBonus || insanity || alchemy || desolation || toxicity) mazHelp += "<li><b>Special</b> - The type of cache you'd like to run during this map. Will override metal cache inputs with wooden caches during the Transmute challenge.</li>";

	//Setting specific inputs
	//Row Settings
	mazHelp += '</ul></br><b>These inputs are specific to this setting and can be quite important for how you try to set this up:</b><ul><br>';

	if (voidMap) {
		//Min Run Zone
		mazHelp += '<li><b>Min Zone</b> - The lower bound zone to run voids maps on.</li>';
		//Max Run Zone
		mazHelp += '<li><b>Max Zone</b> - The upper bound zone to run voids maps on.</li>';

		//Dropdown
		mazHelp += "<li><b>Dropdowns</b> - Will only run the line when one or more of the dropdown options aren't met OR you are at the <b>End Zone</b> input for that line. The information relating to each of the dropdowns can be found in the Auto Maps status tooltip.</li>";

		mazHelp += '<li class="indent">If you have selected a <b>HD Ratio</b> and that type of <b>HD Ratio</b> is greater than the value input OR if you\'ve selected one of Auto Level, Hits Survived, Hits Survived Void it will check if the value is lower than it and skip if it is.<br></li>';

		mazHelp += "<li><b>Portal After</b> - Will run AutoPortal immediately after this line has run. Won't do anything if AutoPortal is disabled!</b></li>";
	}

	if (mapFarm) {
		//Repeat Count

		mazHelp += '<li><b>Farm Type</b> The different ways that the script can determine how many maps are run.</li>';
		mazHelp += '<li class="indent"><b>Map Count</b> - Will run maps until it has reached the specified repeat counter.</li>';
		mazHelp += '<li class="indent"><b>Zone Time</b> - Uses DD:HH:MM:SS format and will run maps until the zone time surpasses the time set in repeat counter.</li>';
		mazHelp += '<li class="indent"><b>Portal Time</b> - Uses DD:HH:MM:SS format and will run maps until the portal time surpasses the time set in repeat counter.</li>';
		mazHelp += '<li class="indent"><b>Daily Reset</b> - Uses DD:HH:MM:SS format and will run maps until the daily reset time is below the time set in repeat counter.</li>';
		mazHelp += '<li class="indent"><b>Skele Spawn</b> - Uses DD:HH:MM:SS format and will run maps until the time since your last Skeletimp kill was this amount of time or greater.</li>';

		mazHelp += "<li><b>Map Repeats</b> - How many maps you'd like to run during this line. If set to -1 it will repeat an Infinite amount of times and you'll have to manually stop farming, would only recommend this if you're confident you'll be back to manually take over the run.</li>";
		//Run when HD Ratio above X value
		mazHelp += '<li><b>Above X HD Ratio</b> - Will only run this line when your world HD Ratio (can be seen in Auto Maps status tooltip) is above this value (and above 0).<br>';
		//Trimple Map Farm
		mazHelp += '<li><b>Run ' + trimple + '</b> - Will run ' + trimple + ' once this line has been completed.</li>';
		mazHelp += '<li class="indent">Whilst farming for this line the script will stop purchasing equips until ' + trimple + ' has been run so that there are no wasted resources.</li>';
		mazHelp += '<li class="indent">If ' + trimple + " has been run then any line with this enabled won't be run." + '</li>';
	}

	if (mapBonus) {
		mazHelp += '<li><b>Map Stacks</b> - How many stacks the script should aim for when running this line.</li>';
		//Run when HD Ratio above X value
		mazHelp += '<li><b>Above X HD Ratio</b> - Will only run this line when your world HD Ratio (can be seen in Auto Maps status tooltip) is above this value (and above 0).<br>';
	}

	if (raiding) {
		//Raiding Zone
		const raidingZone = bionic ? 'Raiding Zone' : 'Map Level';
		mazHelp += '<li><b>' + raidingZone + '</b> - The ' + raidingZone.split(' ')[1].toLowerCase() + " you'd like to raid when this line is run. If <b>Repeat Every X</b> is set to a value above 0 then it will also raise the " + raidingZone.toLowerCase() + ' by that value everytime this line runs.</li>';
		if (!bionic) mazHelp += '<li><b>Frag Type</b> - The choices how for aggresively the script will spend fragments on maps.</li>';
		if (!bionic) mazHelp += '<li class="indent"><b>Frag</b>: General all purpose setting. Will set sliders to max and reduce when necessary to afford the maps you\'re trying to purchase.</li>';
		if (!bionic) mazHelp += '<li class="indent"><b>Frag Min</b>: Used for absolute minimum frag costs. Will set everything but the map size to minimum and gradually reduce that if necessary to purchase maps.</li>';
		if (!bionic) mazHelp += '<li class="indent"><b>Frag Max</b>: This option will make sure that the map has perfect sliders and uses the prestegious special if available.</li>';

		mazHelp += '<li><b>Prestige Goal</b> - The script will identify if the prestige selected here is available in the raiding zone you have input and if so will run maps to get the highest available level of that prestige.</li>';
	}

	if (hdFarm) {
		mazHelp += "<li><b>HD Base</b> - What H:D you'd like to reach.</li>";
		mazHelp += "<li><b>HD Mult</b> - Starting from the zone above the lines initial zone, this setting will multiply the H:D you have set in HD Base. So if your initial zone was 100, HD Base was 10, HD Mult was 1.2, at z101 your H:D target will be 12, then at z102 it will be 14.4 and so on. This way you can account for the zones getting stronger and you will not waste Map Farming for a really low H:D.'</li>";

		mazHelp += "<li><b>HD Type</b> - The type of HD you'd like to target.</li>";
		mazHelp += '<li class="indent">If <b>Map Level</b> has been selected it will farm until auto level reaches that level.</li>';
		mazHelp += '<li class="indent">Will only run Void Map lines if you have void maps in your map chamber.</li>';
		mazHelp += "<li><b>Map Cap</b> - The maximum amount of maps you would like to run during this line. If set to -1 it will repeat an Infinite amount of times and you'll have to manually stop farming, would only recommend this if you're confident you'll be able to get enough stats to finish the farm.</li>";
	}

	if (boneShrine) {
		//To use
		mazHelp += '<li><b>To use</b> - How many bone charges to use on this line.</li>';
		//Use Below
		mazHelp += "<li><b>Use below</b> - This value will stop bone charges being spent when you're at or below this value.</li>";
		//Trimple Bone Shrine
		mazHelp += '<li><b>Run ' + trimple + '</b> - Will run ' + trimple + ' during this line. After using the bone shrine charges specified for this line it will stop AT purchasing equips until ' + trimple + ' has been run so that there is no wasted resources. <b>Will run ' + trimple + ' and use the charges after cell 95.</b></li>';
		//Gather setting
		mazHelp += "<li><b>Gather</b> - Which resource you'd like to gather when popping a Bone Shrine charge to make use of Turkimp resource bonus.</li>";
	}

	if (tributeFarm) {
		//Farm Type
		mazHelp += "<li><b>Farm Type</b> - The way in which Tribute Farming will operate. Either by using absolute values for what you'd like to farm e.g. 2700 Tributes and 37 Meteorologists or by having the script identify how many of each you can farm in X maps and then farming until you reach those values.</li>";
		//Tributes
		mazHelp += "<li><b>Tributes</b> - The amount of Tributes that should be farmed up to on this zone. If the value is greater than your Tribute Cap setting then it'll adjust it to the Tribute input whilst doing this farm.</li>";
		//Meteorologists
		mazHelp += '<li><b>Meteorologist</b> - The amount of Meteorologist that should be farmed up to on this zone.</li>';
		//Buy Buildings
		mazHelp += "<li><b>Buy Buildings</b> - If you'd like to buy buildings during this farming line to reduce the amount of maps it takes to farm your specified Tribute or Meteorologist inputs. When unselected it will automatically disable vanilla AutoStructure if it's enabled to remove the possibility of resources being spent there too.</li>";
		//Trimple Tribute Farm
		mazHelp += '<li><b>Run ' + trimple + '</b> - Will run ' + trimple + ' during this line. Autoamtically calculates when it would be more efficient to run ' + trimple + ' or continue farming Savory Cache maps to reach your target in the fastest time possible.</b></li>';
	}

	if (smithyFarm) {
		//Smithy Count
		mazHelp += "<li><b>Smithies</b> - Smithy count you'd like to reach during this line. If you currently own 18 and want to reach 21 you'd enter 21 into this field.</li>";
		//Farm Type
		mazHelp += "<li><b>Farm Type</b> - The way in which Smithy Farming will operate. Either by using absolute values for what you'd like to farm e.g. 27 Smithies or by having the script identify how many you can farm in X maps and then farming until you reach that value.</li>";
		//Runs MP after the line
		mazHelp += '<li><b>Run MP</b> - Will run Melting Point after this line has been run.</b></li>';
	}

	if (worshipperFarm) {
		mazHelp += "<li><b>Ship</b> - How many worshippers you'd like to farm up to during this line. Max input is 50 and it'll default to that value if you input anything higher.</li>";
	}

	if (toxicity) {
		mazHelp += "<li><b>Toxic Stacks</b> - How many Toxic Stacks you'd like to farm up to during this line.</li>";
	}

	if (quagmire) {
		mazHelp += "<li><b>Bogs</b> - How many Black Bog maps you'd like to run during this line.</li>";
	}

	if (archaeology) {
		mazHelp += '<li><b>Relic String</b> - The relic string to be farmed on this zone. This setting will override the ingame Archaeology Automator input so only use this setting in conjunction with the scripts Archaeology string settings.</li>';
		mazHelp += "<li><b>Map Cap</b> - The maximum amount of maps you would like to run during this line. If set to 0 or below it will farm an infinite amount of maps. Be warned this will force the script to check if you can afford your next relic in this amount of maps (minus maps run) and if you can't it'll skip farming so ensure your job ratio is setup appropriately.</li>";
	}
	if (insanity) {
		mazHelp += "<li><b>Insanity</b> - How many Insanity stack you'd like to farm up to during this line.</li>";
		mazHelp += '<li><b>Destack</b> - Toggle to allow you to run maps that are lower than world level during Insanity. If a destack zone is set it will allow lower than world level maps to be run from that zone onwards.</li>';
		mazHelp += '<li class="indent">When enabled Insanity Farm will assume you\'re destacking and it will aim to reduce your max Insanity to the value in the Insanity field.</li>';
	}

	if (alchemy) {
		mazHelp += "<li><b>Farm Type</b> - The way in which Alchemy Farm will operate. Either by using absolute values for what you'd like to farm e.g. 5 Potions of Strength or by having the script identify how many you can farm in X maps and then farming until you reach that value.</li>";
		mazHelp += '<li><b>Potion Type</b> - The type of potion you want to farm during this line.</li>';
		mazHelp += "<li><b>Potion Number</b> - How many of the potion specified in 'Potion Type' you'd like to farm for.</li>";
	}

	if (hypothermia) {
		mazHelp += "<li><b>Bonfires</b> - How many Bonfires should be farmed on this zone. Uses max bonfires built rather than a specific amount to farm for so if you have already built 14 so far during your run and want another 8 then you'd input 22.</li>";
	}

	if (desolation) {
		mazHelp += '<li><b>Prestige Goal</b> - The script will identify if the prestige selected here is available in the zone you have input and if so will run a map to get that prestige.</li>';
	}

	//Repeat Every
	if (mapFarm || tributeFarm || worshipperFarm || smithyFarm || toxicity || desolation || archaeology || alchemy) mazHelp += '<li><b>Repeat Every</b> - Line can be repeated every zone, or set to a custom number depending on need.</li>';
	//End Zone
	if (mapFarm || tributeFarm || worshipperFarm || hdFarm || raiding || mapBonus || smithyFarm || toxicity || desolation || archaeology || alchemy) mazHelp += "<li><b>End Zone</b> - Only matters if you're planning on having this line repeat. If so, the line will stop repeating at this zone. Must be between 6 and 1000.</li>";
	//Run Type
	if (boneShrine || voidMap || mapFarm || tributeFarm || worshipperFarm || hdFarm || raiding || mapBonus || smithyFarm || golden) mazHelp += "<li><b>Run Type</b> - What type of run you'd like this line to be run.</li>";

	if (golden) {
		//Amount of golden upgrades to get
		mazHelp += '<li><b>Amount</b> - The amount of golden upgrades to purchase before moving onto the next line.</li>';
		mazHelp += '<li class="indent">Setting this input to <b>-1</b> will purchase this golden type infinitely.</li>';
		//Golden Type
		mazHelp += "<li><b>Golden Type</b> - The type of Golden upgrade that you'd like to get during this line.</li>";

		mazHelp += '<br>';
		const heliumType = currSettingUniverse === 2 ? 'Radon' : 'Helium';
		mazHelp += `You are able to have multiple lines of the same type. For example 8 Void, 12 Battle, 10 ${heliumType}, 8 Battle would end with 8 Golden Voids, 20 Golden Battle, and 10 Golden ${heliumType} upgrades. Requests to buy Golden Void will be skipped if it would put you above 72%.`;
	}

	return mazHelp;
}

function windowToggleHelp(windowWidth) {
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
	parentWindow.style.width = windowWidth;
	parentWindow.style.height = 'auto';
	parentWindow.style.maxHeight = window.innerHeight * 0.85 + 'px';

	if (document.querySelectorAll('#mazHelpContainer li').length > 13) parentWindow.style.overflowY = 'scroll';
}

function _mapSettingsAddRow(varPrefix, titleText) {
	let settingName = varPrefix.charAt(0).toLowerCase() + varPrefix.slice(1);
	//Special case for HD Farm settings
	if (varPrefix === 'HDFarm') settingName = settingName.charAt(0) + settingName.charAt(1).toLowerCase() + settingName.slice(2);

	for (var x = 0; x < 31; x++) {
		var elem = document.getElementById('windowWorld' + x);
		if (!elem) continue;

		if (elem.value === '-2') {
			const parent = document.getElementById('windowRow' + x);
			if (parent) {
				parent.style.display = 'block';
				if (!titleText.includes('Golden') && !titleText.includes('Desolation')) elem.value = game.global.world < 6 ? 6 : game.global.world;

				if (currSettingUniverse === 1) {
					//Changing rows to use the colour of the Nature type that the world input will be run on.
					const natureStyle = ['unset', 'rgba(50, 150, 50, 0.75)', 'rgba(60, 75, 130, 0.75)', 'rgba(50, 50, 200, 0.75)'];
					const natureList = ['None', 'Poison', 'Wind', 'Ice'];
					const natureIndex = natureList.indexOf(getZoneEmpowerment(elem.value));
					elem.parentNode.style.background = natureStyle[natureIndex];
				}

				if (!titleText.includes('Smithy') && !titleText.includes('Worshipper Farm') && !titleText.includes('HD Farm') && document.getElementById('windowRepeat' + x) !== null) document.getElementById('windowRepeat' + x).value = 0;
				if ((titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Worshipper Farm') || titleText.includes('Raiding') || titleText.includes('Smithy Farm') || titleText.includes('Archaeology') || titleText.includes('Alchemy Farm')) && document.getElementById('windowRepeatEvery' + x) !== null) document.getElementById('windowRepeatEvery' + x).value = 0;
				if ((titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Worshipper Farm') || titleText.includes('HD Farm') || titleText.includes('Raiding') || titleText.includes('Map Bonus') || titleText.includes('Smithy Farm') || titleText.includes('Desolation') || titleText.includes('Archaeology') || titleText.includes('Alchemy Farm') || titleText.includes('Toxicity Farm')) && document.getElementById('windowEndZone' + x) !== null)
					document.getElementById('windowEndZone' + x).value = 999;
				if (titleText.includes('Void Map') && document.getElementById('windowMaxVoidZone' + x) !== null) document.getElementById('windowMaxVoidZone' + x).value = game.global.world < 6 ? 6 : game.global.world;
				if (titleText.includes('Bionic') && document.getElementById('windowRaidingZone' + x) !== null) document.getElementById('windowRaidingZone' + x).value = elem.value;
				if (document.getElementById('windowBoneGather' + x) !== null) document.getElementById('windowBoneGather' + x).value = 'food';
				if (document.getElementById('windowBuildings' + x) !== null) {
					if (titleText.includes('Insanity')) document.getElementById('windowBuildings' + x).value = false;
					else document.getElementById('windowBuildings' + x).value = true;
				}
				if (document.getElementById('windowChallenge' + x) !== null) document.getElementById('windowChallenge' + x).value = 'All';
				if (document.getElementById('windowChallenge3' + x) !== null) document.getElementById('windowChallenge3' + x).value = 'All';
				if (document.getElementById('windowChallengeOneOff' + x) !== null) document.getElementById('windowChallengeOneOff' + x).value = 'All';
				if (document.getElementById('windowAtlantrimp' + x) !== null) document.getElementById('windowAtlantrimp' + x).value = false;
				if (document.getElementById('windowMeltingPoint' + x) !== null) document.getElementById('windowMeltingPoint' + x).value = false;
				if (document.getElementById('windowPortalAfter' + x) !== null) document.getElementById('windowPortalAfter' + x).value = false;
				if (document.getElementById('windowAutoLevel' + x) !== null) document.getElementById('windowAutoLevel' + x).value = true;

				if (titleText.includes('Map Bonus') && document.getElementById('windowLevel' + x) !== null) document.getElementById('windowLevel' + x).value = 0;
				_mapSettingsUpdatePreset(x, varPrefix);
				swapClass('disabled', 'active', parent);
			}
		}

		if (titleText.includes('Golden') || titleText.includes('Desolation')) {
			var elemWorld = document.getElementById('windowWorld' + x);
			if (!elemWorld) continue;
			if (elemWorld.value === '-2') {
				var parent2 = document.getElementById('windowRow' + x);
				if (parent2) {
					parent2.style.display = 'block';
					if (titleText.includes('Desolation')) elem.value = game.global.world < 6 ? 6 : game.global.world;
					else elemWorld.value = 0;
					_mapSettingsUpdatePreset(x, varPrefix);
					break;
				}
			}
		} else {
			var elemCell = document.getElementById('windowCell' + x);
			if (!elemCell) continue;
			if (elemCell.value === '-1') {
				var parent2 = document.getElementById('windowRow' + x);
				if (parent2) {
					parent2.style.display = 'block';
					elemCell.value = 1;
					_mapSettingsUpdatePreset(x, varPrefix);
					break;
				}
			}
		}
	}

	const tooltipDiv = document.getElementById('tooltipDiv');
	tooltipDiv.style.top = '10%';
	tooltipDiv.style.left = '1%';
	tooltipDiv.style.height = 'auto';
	tooltipDiv.style.maxHeight = window.innerHeight * 0.85 + 'px';
	if (document.getElementById('windowContainer') !== null && document.getElementById('windowContainer').style.display === 'block' && document.querySelectorAll('#windowContainer .active').length > 10) tooltipDiv.style.overflowY = 'scroll';
	else tooltipDiv.style.overflowY = 'none';

	var btnElem = document.getElementById('windowAddRowBtn');
	for (var y = 0; y < 31; y++) {
		var elem = document.getElementById('windowWorld' + y);
		if (elem && elem.value === '-2') {
			btnElem.style.display = 'inline-block';
			return;
		}
		var elemCell = document.getElementById('windowCell' + y);
		if (elemCell && elem.value === '-1') {
			btnElem.style.display = 'inline-block';
			return;
		}
	}
	btnElem.style.display = 'none';
}

function _mapSettingsRemoveRow(index, titleText) {
	let elem = document.getElementById('windowRow' + index);
	if (!elem) return;

	const mapFarm = titleText.includes('Map Farm');
	const mapBonus = titleText.includes('Map Bonus');
	const voidMap = titleText.includes('Void Map');
	const hdFarm = titleText.includes('HD Farm');
	const raiding = titleText.includes('Raiding');
	const bionic = titleText.includes('Bionic');
	const toxicity = titleText.includes('Toxicity');

	const quagmire = titleText.includes('Quagmire');
	const archaeology = titleText.includes('Archaeology');
	const insanity = titleText.includes('Insanity');
	const alchemy = titleText.includes('Alchemy');
	const hypothermia = titleText.includes('Hypothermia');
	const desolation = titleText.includes('Desolation');
	const boneShrine = titleText.includes('Bone Shrine');
	const golden = titleText.includes('Golden');

	const tributeFarm = titleText.includes('Tribute Farm');
	const smithyFarm = titleText.includes('Smithy Farm');
	const worshipperFarm = titleText.includes('Worshipper Farm');

	/* 	//Checkbox setting IDs
	const checkBoxSettings = {
		windowAtlantrimp: 'false',
		windowMeltingPoint: 'false',
		windowPortalAfter: 'false',
		windowAutoLevel: 'true',
		windowBuildings: 'true'
	};

	//Get list of all the IDs from the children in document.getElementById('windowRow' + index)
	const elemChildren = elem.children;
	const elemChildrenIDs = [];
	for (let x = 0; x < elemChildren.length; x++) {
		const child = elemChildren[x];
		for (let y = 0; y < child.children.length; y++) {
			const id = child.children[y].id;
			if (id !== '') {
				elemChildrenIDs.push(id);
			}
		}
	}

	const defaultVars = _mapSettingsVals(index, mapFarm); */

	document.getElementById('windowWorld' + index).value = -2;
	if (!golden && !desolation) document.getElementById('windowCell' + index).value = -1;
	if (!quagmire && !boneShrine && !raiding && !voidMap && !golden && !desolation) document.getElementById('windowLevel' + index).value = 0;
	if (mapFarm || alchemy || insanity || mapBonus || desolation || toxicity) document.getElementById('windowSpecial' + index).value = '0';
	if (mapFarm || alchemy || mapBonus || insanity || toxicity) document.getElementById('windowGather' + index).value = 'food';
	if (mapFarm || smithyFarm || mapBonus || hdFarm || toxicity) document.getElementById('windowRepeat' + index).value = 0;
	if (hdFarm) document.getElementById('windowHDMult' + index).value = 0;
	if (mapFarm || tributeFarm || worshipperFarm || raiding || smithyFarm || desolation || toxicity || archaeology || alchemy) document.getElementById('windowRepeatEvery' + index).value = 0;
	if (mapFarm || tributeFarm || worshipperFarm || hdFarm || raiding || mapBonus || smithyFarm || desolation || toxicity || archaeology || alchemy) document.getElementById('windowEndZone' + index).value = 0;
	if (tributeFarm) document.getElementById('windowTributes' + index).value = 0;
	if (tributeFarm) document.getElementById('windowMets' + index).value = 0;
	if (quagmire) document.getElementById('windowBogs' + index).value = 0;
	if (archaeology) document.getElementById('windowRelics' + index).value = 0;
	if (insanity) document.getElementById('windowInsanity' + index).value = 0;
	if (hdFarm) document.getElementById('windowHDType' + index).value = 'world';
	if (golden) document.getElementById('windowGoldenType' + index).value = 'h';
	if (hypothermia) document.getElementById('windowBonfire' + index).value = 0;
	if (boneShrine) document.getElementById('windowBoneAmount' + index).value = 0;
	if (boneShrine) document.getElementById('windowBoneBelow' + index).value = 0;
	if (worshipperFarm) document.getElementById('windowWorshipper' + index).value = 50;
	if (voidMap || mapFarm) document.getElementById('windowHDRatio' + index).value = 0;
	if (voidMap) document.getElementById('windowVoidHDRatio' + index).value = 0;

	if (mapFarm || tributeFarm || boneShrine) {
		let checkBox = document.getElementById('windowAtlantrimp' + index);
		swapClass('icon-', 'icon-checkbox-unchecked', checkBox);
		checkBox.setAttribute('data-checked', false);
	}
	if (smithyFarm) {
		let checkBox = document.getElementById('windowMeltingPoint' + index);
		swapClass('icon-', 'icon-checkbox-unchecked', checkBox);
		checkBox.setAttribute('data-checked', false);
	}
	if (voidMap) {
		let checkBox = document.getElementById('windowPortalAfter' + index);
		swapClass('icon-', 'icon-checkbox-unchecked', checkBox);
		checkBox.setAttribute('data-checked', false);
	}
	if (tributeFarm) {
		let checkBox = document.getElementById('windowBuildings' + index);
		swapClass('icon-', 'icon-checkbox-checked', checkBox);
		checkBox.setAttribute('data-checked', true);
	}
	if (insanity) {
		let checkBox = document.getElementById('windowBuildings' + index);
		swapClass('icon-', 'icon-checkbox-checked', checkBox);
		checkBox.setAttribute('data-checked', false);
	}
	if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || archaeology || insanity || alchemy || hypothermia || hdFarm || toxicity) {
		let checkBox = document.getElementById('windowAutoLevel' + index);
		swapClass('icon-', 'icon-checkbox-checked', checkBox);
		checkBox.setAttribute('data-checked', true);
	}
	if (!raiding && !smithyFarm && !golden) document.getElementById('windowJobRatio' + index).value = '1,1,1,1';
	if (raiding || desolation) document.getElementById('windowPrestigeGoal' + index).value = 'All';
	if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden) document.getElementById('windowRunType' + index).value = 'All';
	if (raiding && !bionic) document.getElementById('windowRaidingDropdown' + index).value = 0;
	if (tributeFarm || smithyFarm || alchemy) document.getElementById('windowMapTypeDropdown' + index).value = 'Absolute';
	if (mapFarm) document.getElementById('windowMapTypeDropdown' + index).value = 'Map Count';
	if (boneShrine) document.getElementById('windowBoneGather' + index).value = 'metal';

	elem.style.display = 'none';
	const btnElem = document.getElementById('windowAddRowBtn');
	btnElem.style.display = 'inline-block';
	swapClass('active', 'disabled', elem);

	const tooltipDiv = document.getElementById('tooltipDiv');
	tooltipDiv.style.top = '10%';
	tooltipDiv.style.left = '1%';
	tooltipDiv.style.height = 'auto';
	tooltipDiv.style.maxHeight = window.innerHeight * 0.85 + 'px';
	if (document.getElementById('windowContainer') !== null && document.getElementById('windowContainer').style.display === 'block' && document.querySelectorAll('#windowContainer .active').length > 10) tooltipDiv.style.overflowY = 'scroll';
	else tooltipDiv.style.overflowY = 'none';
}

function _mapSettingsUpdatePreset(index, varPrefix) {
	varPrefix = !varPrefix ? document.getElementById('tipTitle').innerHTML.replace(/ /g, '') : varPrefix;
	if (!index) index = '';
	const row = document.getElementById('windowRow' + index);

	const mapFarm = varPrefix.includes('MapFarm');
	const mapBonus = varPrefix.includes('MapBonus');
	const voidMap = varPrefix.includes('VoidMap');
	const hdFarm = varPrefix.includes('HDFarm');
	const raiding = varPrefix.includes('Raiding');
	const toxicity = varPrefix.includes('Toxicity');

	const archaeology = varPrefix.includes('Archaeology');
	const insanity = varPrefix.includes('Insanity');
	const alchemy = varPrefix.includes('Alchemy');
	const hypothermia = varPrefix.includes('Hypothermia');
	const desolation = varPrefix.includes('Desolation');

	const boneShrine = varPrefix.includes('BoneShrine');
	const golden = varPrefix.includes('Golden');
	const tributeFarm = varPrefix.includes('Tribute');
	const smithyFarm = varPrefix.includes('Smithy');
	const worshipperFarm = varPrefix.includes('Worshipper');

	if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden) {
		if (index !== '') {
			const runType = document.getElementById('windowRunType' + index).value;

			if ((runType !== 'Filler' && row.classList.contains('windowChallengeOn' + varPrefix)) || (runType === 'Filler' && row.classList.contains('windowChallengeOff' + varPrefix))) {
				newClass = runType === 'Filler' ? 'windowChallengeOn' + varPrefix : 'windowChallengeOff' + varPrefix;
				newClass2 = runType !== 'Filler' ? 'windowChallengeOn' + varPrefix : 'windowChallengeOff' + varPrefix;
				swapClass(newClass2, newClass, row);
			}

			if ((runType !== 'C3' && row.classList.contains('windowChallenge3On' + varPrefix)) || (runType === 'C3' && row.classList.contains('windowChallenge3Off' + varPrefix))) {
				newClass = runType === 'C3' ? 'windowChallenge3On' + varPrefix : 'windowChallenge3Off' + varPrefix;
				newClass2 = runType !== 'C3' ? 'windowChallenge3On' + varPrefix : 'windowChallenge3Off' + varPrefix;
				swapClass(newClass2, newClass, row);
			}

			if ((runType !== 'One Off' && row.classList.contains('windowChallengeOneOffOn' + varPrefix)) || (runType === 'One Off' && row.classList.contains('windowChallengeOneOffOff' + varPrefix))) {
				newClass = runType === 'One Off' ? 'windowChallengeOneOffOn' + varPrefix : 'windowChallengeOneOffOff' + varPrefix;
				newClass2 = runType !== 'One Off' ? 'windowChallengeOneOffOn' + varPrefix : 'windowChallengeOneOffOff' + varPrefix;
				swapClass(newClass2, newClass, row);
			}
		}
	}

	if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || archaeology || insanity || alchemy || hypothermia || toxicity) {
		if (index !== '') {
			const autoLevel = document.getElementById('windowAutoLevel' + index).dataset.checked === 'true' ? 'windowLevelOff' : 'windowLevelOn';
			swapClass('windowLevel', autoLevel, row);
			document.getElementById('windowLevel' + index).disabled = document.getElementById('windowAutoLevel' + index).dataset.checked === 'true' ? true : false;
		}
	}

	if (mapFarm || alchemy || mapBonus || insanity || desolation || toxicity) {
		if (index !== '' || mapBonus) {
			var special = document.getElementById('windowSpecial' + index).value;
			newClass = special === 'hc' || special === 'lc' ? 'windowGatherOn' : 'windowGatherOff';
			swapClass('windowGather', newClass, row);
		}
	}

	if (hdFarm) {
		if (index !== '') {
			const special = document.getElementById('windowHDType' + index).value;

			newClass = special === 'maplevel' ? 'windowMapLevelOff' : 'windowMapLevelOn';
			swapClass('windowMapLevel', newClass, row);
			if (special === 'maplevel') {
				document.getElementById('windowRepeat' + index).parentNode.children[0].innerHTML = 'Map Level';
			} else {
				document.getElementById('windowRepeat' + index).parentNode.children[0].innerHTML = '';
			}
		}
	}

	//Changing rows to use the colour of the Nature type that the world input will be run on.
	if (currSettingUniverse === 1 && index !== '') {
		const world = document.getElementById('windowWorld' + index);
		const natureStyle = ['unset', 'rgba(50, 150, 50, 0.75)', 'rgba(60, 75, 130, 0.75)', 'rgba(50, 50, 200, 0.75)'];
		const natureList = ['None', 'Poison', 'Wind', 'Ice'];
		const natureIndex = natureList.indexOf(getZoneEmpowerment(world.value));
		world.parentNode.style.background = natureStyle[natureIndex];
	}
}

function mapSettingsDropdowns(universe = game.global.universe, vals, varPrefix) {
	if (!vals) return 'Issue with establishing values for dropdowns';

	var dropdown = {};
	var highestZone = universe === 1 ? game.stats.highestLevel.valueTotal() : game.stats.highestRadLevel.valueTotal();

	//HD Type dropdown
	const hdDropdowns = ['hdType', 'hdType2'];
	const hdTypeDropdowns = ['world', 'map', 'void', 'maplevel', 'hitsSurvived', 'hitsSurvivedVoid'];
	const hdTypeNames = ['World HD Ratio', 'Map HD Ratio', 'Void HD Ratio', 'Map Level', 'Hits Survived', 'Void Hits Survived'];
	dropdown.hdType = '';
	for (let type in hdDropdowns) {
		let hdKey = hdDropdowns[type];
		dropdown[hdKey] = '';

		for (let item in hdTypeDropdowns) {
			let key = hdTypeDropdowns[item];
			dropdown[hdKey] += "<option value='" + key + "'" + (vals[hdKey] === key ? " selected='selected'" : '') + '>' + hdTypeNames[item] + '</option>';
		}
	}

	//Gather dropdown
	const gatherDropdowns = ['food', 'wood', 'metal', 'science'];
	dropdown.gather = '';
	for (let item in gatherDropdowns) {
		let key = gatherDropdowns[item];
		dropdown.gather += "<option value='" + key + "'" + (vals.gather === key ? " selected='selected'" : '') + '>' + (key.charAt(0).toUpperCase() + key.slice(1)) + '</option>';
	}

	//Map Type dropdown
	dropdown.mapType = '';
	if (varPrefix !== 'MapFarm') dropdown.mapType += "<option value='Absolute'" + (vals.mapType === 'Absolute' ? " selected='selected'" : '') + '>Absolute</option>';
	dropdown.mapType += "<option value='Map Count'" + (vals.mapType === 'Map Count' ? " selected='selected'" : '') + '>Map Count</option>';
	if (varPrefix === 'MapFarm') {
		const mapFarmDropdowns = ['Zone Time', 'Portal Time', 'Daily Reset', 'Skele Spawn'];
		for (let item in mapFarmDropdowns) {
			let key = mapFarmDropdowns[item];
			dropdown.mapType += "<option value='" + key + "'" + (vals.mapType === key ? " selected='selected'" : '') + '>' + key + '</option>';
		}
	}

	//Map Numbers dropdown (0-10)
	dropdown.mapLevel = "<option value='0'" + (vals.raidingzone === '0' ? " selected='selected'" : '') + '>0</option>';
	if (universe === 2 ? highestZone >= 50 : highestZone >= 210) {
		for (let i = 1; i <= 10; i++) {
			dropdown.mapLevel += "<option value='" + i + "'" + (vals.raidingzone === i.toString() ? " selected='selected'" : '') + '>' + i + '</option>';
		}
	}

	//Map Special dropdown
	dropdown.special = "<option value='0'" + (vals.special === '0' ? " selected='selected'" : '') + '>No Modifier</option>';
	for (let item in mapSpecialModifierConfig) {
		let bonusItem = mapSpecialModifierConfig[item];
		let unlocksAt = universe === 2 ? bonusItem.unlocksAt2 : bonusItem.unlocksAt;
		if ((typeof unlocksAt === 'function' && !unlocksAt()) || unlocksAt == -1) continue;
		if (unlocksAt > highestZone) break;
		dropdown.special += "<option value='" + item + "'" + (vals.special === item ? " selected='selected'" : '') + '>' + bonusItem.name + '</option>';
	}

	//Prestige Goal dropdown
	dropdown.prestigeGoal = "<option value='All'" + (vals.prestigeGoal === 'All' ? " selected='selected'" : '') + '>All</option>';
	for (let item in Object.keys(MODULES.equipment)) {
		let key = Object.keys(MODULES.equipment)[item];
		if (!game.global.slowDone && (key === 'Arbalest' || key === 'Gambeson')) continue;
		dropdown.prestigeGoal += "<option value='" + key + "'" + (vals.prestigeGoal === key ? " selected='selected'" : '') + '>' + key + '</option>';
	}

	const challengeObj = challengesUnlockedObj(currSettingUniverse);

	//Challenge Dropdowns
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

	//C2+C3 Dropdowns
	const c2Obj = Object.entries(challengeObj).reduce((newObj, [key, val]) => {
		if (val.unlockedIn.indexOf('c2') !== -1) newObj[key] = val;
		return newObj;
	}, {});
	dropdown.c2 = "<option value='All'" + (vals.challenge3 === 'All' ? " selected='selected'" : '') + '>All</option>';
	for (let item in Object.keys(c2Obj)) {
		let key = Object.keys(c2Obj)[item];
		dropdown.c2 += "<option value='" + key + "'" + (vals.challenge3 === key ? " selected='selected'" : '') + '>' + key + '</option>';
	}

	//One off challenge Dropdowns
	const oneOffObj = Object.entries(challengeObj).reduce((newObj, [key, val]) => {
		if (val.unlockedIn.indexOf('oneOff') !== -1) newObj[key] = val;
		return newObj;
	}, {});
	dropdown.oneOff = "<option value='All'" + (vals.challengeOneOff === 'All' ? " selected='selected'" : '') + '>All</option>';
	for (let item in Object.keys(oneOffObj)) {
		let key = Object.keys(oneOffObj)[item];
		dropdown.oneOff += "<option value='" + key + "'" + (vals.challengeOneOff === key ? " selected='selected'" : '') + '>' + key + '</option>';
	}

	//Run Type options
	const c2Name = universe === 1 ? 'C2' : 'C3';
	dropdown.runType = "<option value='All'" + (vals.runType === 'All' ? " selected='selected'" : '') + '>All</option>';
	dropdown.runType += "<option value='Filler'" + (vals.runType === 'Filler' ? " selected = 'selected'" : '') + ' > Filler</option>';
	dropdown.runType += " <option value='One Off'" + (vals.runType === 'One Off' ? " selected='selected'" : '') + '>One Offs</option>';
	dropdown.runType += " <option value='Daily'" + (vals.runType === 'Daily' ? " selected='selected'" : '') + '>Daily</option>';
	dropdown.runType += `<option value='C3'${vals.runType === 'C3' ? " selected='selected'" : ''}>${c2Name}</option>`;

	//Golden dropdown options
	const heliumName = universe === 1 ? 'Helium' : 'Radon';
	const heliumShortForm = universe === 1 ? 'h' : 'r';

	if (!varPrefix.includes('C3')) dropdown.goldenType = `<option value='${heliumShortForm}'${vals.goldenType === heliumShortForm ? " selected='selected'" : ''}>${heliumName}</option>`;
	dropdown.goldenType += "<option value='b'" + (vals.goldenType === 'b' ? " selected = 'selected'" : '') + ' >Battle</option>';
	dropdown.goldenType += "<option value='v'" + (vals.goldenType === 'v' ? " selected = 'selected'" : '') + ' >Void</option>';

	//Alchemy potion types
	dropdown.potionTypes = "<option value='h'" + (vals.potionstype === 'h' ? " selected='selected'" : '') + '>Herby Brew</option>';
	dropdown.potionTypes += "<option value='g'" + (vals.potionstype === 'g' ? " selected='selected'" : '') + '>Gaseous Brew</option>';
	dropdown.potionTypes += "<option value='f'" + (vals.potionstype === 'f' ? " selected='selected'" : '') + '>Potion of Finding</option>';
	dropdown.potionTypes += "<option value='v'" + (vals.potionstype === 'v' ? " selected='selected'" : '') + '>Potion of the Void</option>';
	dropdown.potionTypes += "<option value='s'" + (vals.potionstype === 's' ? " selected='selected'" : '') + '>Potion of Strength</option>';

	//Raiding fragment types
	dropdown.raidingTypes =
		"<option value='0'" +
		(vals.raidingDropdown === '0' ? " selected='selected'" : '') +
		">Frag</option>\
	<option value='1'" +
		(vals.raidingDropdown === '1' ? " selected='selected'" : '') +
		">Frag Min</option>\
	<option value='2'" +
		(vals.raidingDropdown === '2' ? " selected='selected'" : '') +
		'>Frag Max</option>';

	return dropdown;
}

//Auto Structure
function autoStructureDisplay(elem) {
	let tooltipText;

	const hze = game.global.universe === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();
	const baseText =
		"<p>Here you can choose which structures will be automatically purchased when AutoStructure is toggled on. Check a box to enable the automatic purchasing of that structure, the 'Perc:' box specifies the cost-to-resource % that the structure should be purchased below, and set the 'Up To:' box to the maximum number of that structure you'd like purchased <b>(0&nbsp;for&nbsp;no&nbsp;limit)</b>. For example, setting the 'Perc:' box to 10 and the 'Up To:' box to 50 for 'House' will cause a House to be automatically purchased whenever the costs of the next house are less than 10% of your Food, Metal, and Wood, as long as you have less than 50 houses.</p>";
	const nursery = "<p><b>Nursery:</b> Acts the same as the other settings but also has a 'From' input which will cause nurseries to only be built from that zone onwards. Spire nursery settings within AT will ignore this start zone if needed for them to work. If 'Advanced Nurseries' is enabled and 'Up To' is set to 0 it will override buying max available and instead respect the input.</p>";
	const warpstation = '<p><b>Warpstation:</b> Settings for this type of building can be found in the AutoTrimp settings building tab!</p>';
	const safeGateway = "<p><b>Safe Gateway:</b> Will stop purchasing Gateways when your owned fragments are lower than the cost of the amount of maps you input in the 'Maps' field times by what a Perfect +10 LMC map would cost up to the zone specified in 'Till Z:', if that value is 0 it'll assume z999.</p>";

	tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Auto Structure Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp(); _verticalCenterTooltip(false, true);'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'>";
	tooltipText += `${baseText}`;
	if (game.global.universe === 1 && hze >= 230) tooltipText += `${nursery}`;
	if (game.global.universe === 1 && hze >= 60) tooltipText += `${warpstation}`;
	if (game.global.universe === 2) tooltipText += `${safeGateway}`;

	const settingGroup = getPageSetting('buildingSettingsArray');
	tooltipText += autoStructureTable(settingGroup, hze);

	const costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info btn-lg' onclick='autoStructureSave()'>Apply</div><div class='btn-lg btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
	game.global.lockTooltip = true;
	const ondisplay = () => _verticalCenterTooltip(false, true);

	return [elem, tooltipText, costText, ondisplay];
}

function autoStructureTable(settingGroup, hze) {
	let tooltipText = "</div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";
	let count = 0;

	for (let item in game.buildings) {
		const building = game.buildings[item];
		if (building[`blockU${game.global.universe}`]) continue;
		if (item === 'Warpstation') continue;
		if (item === 'Laboratory' && hze < 130) continue;
		if (item === 'Antenna' && game.buildings[item].locked) continue;
		if (!building.AP && item !== 'Antenna') continue;
		if (count !== 0 && count % 2 === 0) tooltipText += '</tr><tr>';
		let setting = settingGroup[item];
		let checkbox = buildNiceCheckbox('structConfig' + item, 'autoCheckbox', setting && setting.enabled);

		tooltipText += "<td><div class='row'>";
		tooltipText += "<div class='col-xs-3' style='width: 34%; padding-right: 5px'>" + checkbox + '&nbsp;&nbsp;<span>' + item + '</span></div>';
		tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>Perc: <input class='structConfigPercent' id='structPercent" + item + "' type='number' value='" + (setting && setting.percent ? setting.percent : 100) + "' /></div>";
		tooltipText += "<div class='col-xs-5' style='width: 33%; padding-left: 5px; text-align: right'>Up to: <input class='structConfigQuantity' id='structMax" + item + "' type='number' value='" + (setting && setting.buyMax ? setting.buyMax : 0) + "' /></div>";
		tooltipText += '</div></td>';
		count++;
	}
	tooltipText += '</tr><tr>';

	//Nursery Start Zone setting after reaching Magma
	if (game.global.universe === 1 && hze >= 230) {
		tooltipText += "<td><div class='row'>";
		tooltipText += "<div class='col-xs-3' style='width: 34%; padding-right: 5px'>" + '&nbsp;&nbsp;<span>' + 'Nursery (cont)' + '</span></div>';
		tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>From: <input class='structConfigQuantity' id='nurseryFromZ" + "' type='number' value='" + (settingGroup.Nursery && settingGroup.Nursery.fromZ ? settingGroup.Nursery.fromZ : 0) + "' /></div>";
	}
	//Safe Gateway setting for u2
	if (game.global.universe === 2) {
		tooltipText += "<td><div class='row'><div class='col-xs-3' style='width: 34%; style='padding-right: 5px'>" + buildNiceCheckbox('structConfigSafeGateway', 'autoCheckbox', typeof settingGroup.SafeGateway === 'undefined' ? false : settingGroup.SafeGateway.enabled) + '&nbsp;&nbsp;<span>' + 'Safe Gateway' + '</span></div>';
		tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>Maps: <input class='structConfigQuantity' id='structMapCountSafeGateway" + "' type='number' value='" + (settingGroup.SafeGateway && settingGroup.SafeGateway.mapCount ? settingGroup.SafeGateway.mapCount : 0) + "' /></div>";
		tooltipText += "<div class='col-xs-5' style='width: 33%; padding-left: 5px; text-align: right'>Till Z: <input class='structConfigPercent' id='structMax' type='number' value='" + (settingGroup.SafeGateway && settingGroup.SafeGateway.zone ? settingGroup.SafeGateway.zone : 0) + "' /></div>";
		tooltipText += '</div></td>';
	}
	//Portal Settings
	const values = ['Off', 'On'];
	tooltipText += "<td><div class='row'><div class='col-xs-3' style='width: 34%; style=' padding-right: 5px'> Setting on Portal:" + '</span></div>';
	tooltipText += "<div class='col-xs-5 style=' width: 33%; padding-left: 5px; text-align: right'><select style='width: 70%' id='autoJobSelfGather'><option value='0'>No change</option>";
	for (let x = 0; x < values.length; x++) {
		tooltipText += '<option' + (settingGroup.portalOption && settingGroup.portalOption === values[x].toLowerCase() ? " selected='selected'" : '') + " value='" + values[x].toLowerCase() + "'>" + values[x] + '</option>';
	}

	tooltipText += '</tr><tr>';
	tooltipText += '</tr></tbody></table > ';

	return tooltipText;
}

function autoStructureSave() {
	const checkboxes = document.getElementsByClassName('autoCheckbox');
	const percentboxes = document.getElementsByClassName('structConfigPercent');
	const quantboxes = document.getElementsByClassName('structConfigQuantity');
	const setting = {};
	let error = '';

	for (let x = 0; x < checkboxes.length; x++) {
		const name = checkboxes[x].id.split('structConfig')[1];
		const checked = checkboxes[x].dataset.checked === 'true';
		setting[name] = {
			enabled: checked
		};

		if (game.global.universe === 2 && name === 'SafeGateway') {
			let count = parseInt(quantboxes[x].value, 10);
			if (count > 10000) count = 10000;
			count = isNumberBad(count) ? 3 : count;
			setting[name].mapCount = count;

			let zone = parseInt(percentboxes[x].value, 10);
			if (zone > 999) zone = 999;
			zone = isNumberBad(zone) ? 3 : zone;
			setting[name].zone = zone;

			continue;
		}

		let perc = parseFloat(percentboxes[x].value, 10);
		if (perc > 100) perc = 100;
		setting[name].percent = perc;

		if (setting[name].percent < 0 || isNaN(setting[name].percent)) {
			error += `Your spending percentage for ${name}s needs to be above a valid number of 0 or above.<br>`;
		}

		let max = parseInt(quantboxes[x].value, 10);
		if (max > 10000) max = 10000;
		setting[name].buyMax = max;

		if (setting[name].buyMax < 0 || isNaN(setting[name].buyMax)) {
			error += `Your Up To value for ${name}s needs to be above a valid number of 0 or above.<br>`;
		}

		if (name === 'Nursery') {
			if (game.stats.highestLevel.valueTotal() < 230) {
				setting[name].fromZ = 0;
			} else {
				let fromZ = parseInt(document.getElementById('nurseryFromZ').value, 10);
				if (fromZ > 999) fromZ = 999;
				fromZ = isNumberBad(fromZ) ? 999 : fromZ;
				setting[name].fromZ = fromZ;

				if (setting[name].fromZ < 0 || isNaN(setting[name].fromZ)) {
					error += `Your zone input for ${name}s needs to be above a valid number of 0 or above.<br>`;
				}
			}
		}
	}

	if (error) {
		const elem = document.getElementById('autoJobsError');
		if (elem) elem.innerHTML = error;
		_verticalCenterTooltip(false, true);
		return;
	}

	//Adding in buildings that are locked so that there won't be any issues later on
	if (game.global.universe === 2) {
		if (!setting.Laboratory) {
			setting.Laboratory = {
				enabled: false,
				percent: 100,
				buyMax: 0
			};
		}
		if (!setting.Antenna) {
			setting.Antenna = {
				enabled: false,
				percent: 100,
				buyMax: 0
			};
		}
	}

	setting.portalOption = document.getElementById('autoJobSelfGather').value;

	setPageSetting('buildingSettingsArray', setting);
	cancelTooltip();
}

//Auto Jobs
function autoJobsDisplay(elem) {
	const ratio = "<p>The left side of this window is dedicated to jobs that are limited more by workspaces than resources. 1:1:1 will purchase all 3 of these ratio-based jobs evenly, and the ratio refers to the amount of workspaces you wish to dedicate to each job. Any number that's 0 or below will stop AT hiring any workers for that job. Scientists will be hired based on a ratio that is determined by how far you are into the game, the further you get the less Scientists will be hired.</p>";
	const percent = "<p>The right side of this window is dedicated to jobs limited more by resources than workspaces. Set the percentage of resources that you'd like to be spent on each job.</p>";
	const magmamancer = "<p><b>Magmamancers:</b> These will only be hired when they'll do something! So once the time spent on the zone is enough to activate the first metal boost.</p>";
	const farmersUntil = '<p><b>Farmers Until:</b> Stops buying Farmers from this zone. Map setting job ratios override this setting.</p>';
	const lumberjackMP = '<p><b>No Lumberjacks Post MP:</b> Stops buying Lumberjacks after Melting Point has been run. The Smithy Farm setting will override this setting.</p>';

	let autoRatios = '<p><b>AutoRatios</b> - Running <b>' + (portalUniverse === 2 ? 'Transmute' : 'Metal') + '</b> will override these values and use <b>4/5/0.</b>';
	autoRatios += '<br><b>1/1/1</b> Up until 300k trimps.';
	autoRatios += '<br><b>3/3/5</b> Up until 3 million trimps.';
	autoRatios += '<br><b>3/1/4</b> When above 3 million trimps.';
	autoRatios += '<br><b>1/1/10</b> When above 1000 tributes.';
	autoRatios += '<br><b>1/2/22</b> When above 1500 tributes.';
	autoRatios += '<br><b>1/7/12</b> When above 3000 tributes and at or above z230.';
	autoRatios += '<br><b>1/1/98</b> When at or above z300.';
	if (game.global.universe === 2) autoRatios += '<br><b>1/1/1</b> When using a Hazardous or better heirloom.';
	autoRatios += '</p>';

	let tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Auto Job Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp(); _verticalCenterTooltip(true);'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'> ";
	tooltipText += `${ratio}`;
	tooltipText += `${percent}`;
	if (game.global.universe === 1 && game.stats.highestLevel.valueTotal() >= 230) tooltipText += `${magmamancer}`;
	if (game.global.universe === 2) tooltipText += `${farmersUntil}${lumberjackMP}`;
	tooltipText += `${autoRatios}`;

	const hze = game.global.universe === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();
	let percentJobs = ['Explorer'];
	if (game.global.universe === 1) {
		percentJobs.push('Trainer');
		if (hze >= 230) percentJobs.push('Magmamancer');
	}
	if (game.global.universe === 2) {
		if (hze >= 30) percentJobs.push('Meteorologist');
		if (hze >= 50) percentJobs.push('Worshipper');
	}

	const ratioJobs = ['Farmer', 'Lumberjack', 'Miner'];
	const settingGroup = getPageSetting('jobSettingsArray');
	tooltipText += autoJobsTable(settingGroup, ratioJobs, percentJobs);

	const costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn-lg btn btn-info' onclick='autoJobsSave()'>Apply</div><div class='btn btn-lg btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";

	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	const ondisplay = () => _verticalCenterTooltip(true);

	return [elem, tooltipText, costText, ondisplay];
}

function autoJobsTable(settingGroup, ratioJobs, percentJobs) {
	let tooltipText = "</div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";

	for (let x = 0; x < ratioJobs.length; x++) {
		tooltipText += '<tr>';
		let item = ratioJobs[x];
		let setting = settingGroup[item];
		let checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', setting && setting.enabled);

		tooltipText += "<td style='width: 40%'><div class='row'>";
		tooltipText += "<div class='col-xs-6' style='padding-right: 5px'>" + checkbox + '&nbsp;&nbsp;<span>' + item + '</span></div>';
		tooltipText += "<div class='col-xs-6 lowPad' style='text-align: right'>Ratio: <input class='jobConfigQuantity' id='autoJobQuant" + item + "' type='number' value='" + (setting && setting.ratio >= 0 ? setting.ratio : 0) + "' /></div>";
		tooltipText += '</div></td>';
		if (percentJobs.length > x) {
			item = percentJobs[x];
			setting = settingGroup[item];
			let max = setting && setting.buyMax ? setting.buyMax : 0;
			if (max > 1e4) max = max.toExponential().replace('+', '');
			checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', setting && setting.enabled);
			tooltipText += "<td style='width: 60%'><div class='row'>";
			tooltipText += "<div class='col-xs-6' style='padding-right: 5px'>" + checkbox + '&nbsp;&nbsp;<span>' + item + '</span></div>';
			tooltipText += "<div class='col-xs-6 lowPad' style='text-align: right'>Percent: <input class='jobConfigQuantity' id='autoJobQuant" + item + "' type='number' value='" + (setting && setting.percent ? setting.percent : 100) + "' />";
			tooltipText += '</div></div>';
		}
	}

	if (game.global.universe === 2) {
		tooltipText += "<tr><td style='width: 40%'><div class='row'>";
		tooltipText += "<div class='col-xs-6' style='padding-right: 5px'>" + buildNiceCheckbox('autoJobCheckboxFarmersUntil', 'autoCheckbox', settingGroup.FarmersUntil.enabled) + '&nbsp;&nbsp;<span>' + 'Farmers Until</span></div>';
		tooltipText += "<div class='col-xs-6 lowPad' style='text-align: right'>Zone: <input class='jobConfigQuantity' id='FarmersUntilZone' type='number' value='" + (settingGroup.FarmersUntil.zone ? settingGroup.FarmersUntil.zone : 999) + "' /></div>";
		tooltipText += '</div></td>';

		tooltipText += "<td style='width: 60%'><div class='row'>";
		tooltipText += "<div class='col-xs-6' style='padding-right: 1px'>" + buildNiceCheckbox('autoJobCheckboxNoLumberjacks', 'autoCheckbox', settingGroup.NoLumberjacks.enabled) + '&nbsp;&nbsp;<span>' + 'No Lumberjacks Post MP</span></div>';
		tooltipText += '</td></tr>';
	}

	const portalOptions = ['AutoJobs Off', 'Auto Ratios', 'Manual Ratios'];
	tooltipText += "<tr><td style='width: 40%'>";
	tooltipText += "<div class='col-xs-6' style='padding-right: 3px; font-size: 1vw; '>Setting on Portal:</div>";
	tooltipText += "<div class='col-xs-6 lowPad' style='text-align: right'><select style='width: 100%' id='autoJobPortal'><option value='0'>No change</option>";

	for (let x = 0; x < portalOptions.length; x++) {
		tooltipText += '<option' + (settingGroup.portalOption && settingGroup.portalOption === portalOptions[x].toLowerCase() ? " selected='selected'" : '') + " value='" + portalOptions[x].toLowerCase() + "'>" + portalOptions[x] + '</option>';
	}

	tooltipText += '</div></td></tr>';
	tooltipText += '</tbody></table>';

	return tooltipText;
}

function autoJobsSave() {
	const checkBoxes = Array.from(document.getElementsByClassName('autoCheckbox'));
	const quantBoxes = Array.from(document.getElementsByClassName('jobConfigQuantity'));
	const ratioJobs = ['Farmer', 'Lumberjack', 'Miner'];
	const setting = {};

	let error = '';

	checkBoxes.forEach((checkbox, index) => {
		const name = checkbox.id.split('autoJobCheckbox')[1];
		const checked = checkbox.dataset.checked === 'true';
		setting[name] = {
			enabled: checked
		};

		if (name === 'NoLumberjacks') return;

		if (name === 'FarmersUntil') {
			setting[name].zone = parseInt(quantBoxes[index].value);

			if (setting[name].zone < 0 || isNaN(setting[name].zone)) {
				error += `Your zone input for ${name}s needs to be above a valid number of 0 or above.<br>`;
			}
			return;
		}

		if (ratioJobs.includes(name)) {
			setting[name].ratio = parseFloat(quantBoxes[index].value);

			if (setting[name].ratio < 0 || isNaN(setting[name].ratio)) {
				error += `Your ratio for ${name}s needs to be above a valid number of 0 or above.<br>`;
			}
			return;
		}

		const jobQuant = document.getElementById('autoJobQuant' + name).value;
		setting[name].percent = parseFloat(jobQuant);

		if (setting[name].percent < 0 || isNaN(setting[name].percent)) {
			error += `Your spending percentage for ${name}s needs to be above a valid number of 0 or above.<br>`;
		}
	});

	if (error) {
		let elem = document.getElementById('autoJobsError');
		if (elem) elem.innerHTML = error;
		_verticalCenterTooltip(true);
	}

	//Adding in jobs that are locked so that there won't be any issues later on
	if (game.global.universe === 1) {
		if (!setting.Magmamancer) {
			setting.Magmamancer = {
				enabled: false,
				percent: 100
			};
		}
	}
	if (game.global.universe === 2) {
		if (!setting.Meteorologist) {
			setting.Meteorologist = {
				enabled: true,
				percent: 20
			};
		}
		if (!setting.Worshipper) {
			setting.Worshipper = {
				enabled: true,
				percent: 20
			};
		}
	}

	setting.portalOption = document.getElementById('autoJobPortal').value;

	setPageSetting('jobSettingsArray', setting);
	cancelTooltip();
}

//Unique Maps
function uniqueMapsDisplay(elem) {
	const hze = currSettingUniverse === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();
	const baseText = "<p>Here you can choose which special maps you'd like to run throughout your runs. Each special map will have a Zone & Cell box to identify where you would like to run the map on the specified zone. If the map isn't run on your specified zone it will be run on any zone after the one you input. If there's a map you don't own and you want to run that drops in maps then the script will now run one to obtain it.</p>";
	const smithy = "<p>The right side of this window is dedicated to running Melting Point when you've reached a certain Smithy value. As each runtype of vastly different there's different inputs for each type of run that you can do! Certain challenges have overrides for this, once unlocked they can be found in the C3 tab.</p>";
	const smithyDisplay = currSettingUniverse === 2 && hze >= 50;

	const mapUnlocks = Object.keys(MODULES.mapFunctions.uniqueMaps).filter((mapName) => {
		const { universe, zone } = MODULES.mapFunctions.uniqueMaps[mapName];
		return !['Bionic Wonderland', 'The Black Bog'].includes(mapName) && universe === currSettingUniverse && zone <= hze;
	});
	const smithySettings = smithyDisplay ? ['MP Smithy', 'MP Smithy Daily', 'MP Smithy C3', 'MP Smithy One Off'] : [];
	const settingGroup = getPageSetting('uniqueMapSettingsArray', currSettingUniverse);

	let tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Unique Map Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp();  _verticalCenterTooltip(smithySettings.length > 0 ? false : true, smithySettings.length > 0 ? true : false);'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'>";
	tooltipText += `${baseText}${smithyDisplay ? smithy : ''}`;
	tooltipText += uniqueMapsTable(settingGroup, mapUnlocks, smithySettings);

	const costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info btn-lg' onclick='uniqueMapsSave()'>Apply</div><div class='btn-lg btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";

	game.global.lockTooltip = true;
	const ondisplay = () => _verticalCenterTooltip(smithySettings.length > 0 ? false : true, smithySettings.length > 0 ? true : false);
	return [elem, tooltipText, costText, ondisplay];
}

function uniqueMapsTable(settingGroup, mapUnlocks, smithySettings) {
	let tooltipText = "</div><table id='autoPurchaseConfigTable' style='font-size: 1.1vw;'><tbody>";

	for (let x = 0; x < mapUnlocks.length; x++) {
		tooltipText += '<tr>';
		let item = mapUnlocks[x];
		let setting = settingGroup[item];
		let checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', setting && setting.enabled);

		let max = setting && setting.buyMax ? setting.buyMax : 0;
		if (max > 1e4) max = max.toExponential().replace('+', '');

		tooltipText += "<td><div class='row'>";
		tooltipText += "<div class='col-xs-3' style='width: 34%; padding-right: 5px'>" + checkbox + '&nbsp;&nbsp;<span>' + item.replace(/_/g, '&nbsp;<span>') + '</span></div>';
		tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>Zone: <input class='structConfigZone' id='structPercent" + item + "' type='number'  value='" + (setting && setting.zone ? setting.zone : 999) + "'/></div>";
		tooltipText += "<div class='col-xs-5' style='width: 33%; padding-left: 5px; text-align: right'>Cell: <input class='structConfigCell' id='structMax" + item + "' type='number'  value='" + (setting && setting.cell ? setting.cell : 0) + "'/></div>";
		tooltipText += '</div></td>';

		if (smithySettings.length > x) {
			item = smithySettings[x];
			setting = settingGroup[item];
			checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', setting && setting.enabled);
			tooltipText += "<td style='width: 40%'><div class='row'>";
			tooltipText += "<div class='col-xs-6' style='padding-right: 5px'>" + checkbox + '&nbsp;&nbsp;<span>' + item.replace(/_/g, '&nbsp;<span>') + '</span></div>';
			tooltipText += "<div class='col-xs-6 lowPad' style='text-align: right'>Value: <input class='jobConfigQuantity' id='uniqueMapValue" + item + "' type='number'  value='" + (setting && setting.value ? setting.value : 1) + "'/></div></div>";
			tooltipText += '</div></td>';
		} else {
			tooltipText += '<tr>';
		}
	}

	tooltipText += '</tr><tr>';
	tooltipText += '</tr></tbody></table>';

	return tooltipText;
}

function uniqueMapsSave() {
	const setting = getPageSetting('uniqueMapSettingsArray', currSettingUniverse);
	const checkboxes = Array.from(document.getElementsByClassName('autoCheckbox'));
	const zoneBoxes = Array.from(document.getElementsByClassName('structConfigZone'));
	const cellBoxes = Array.from(document.getElementsByClassName('structConfigCell'));
	let y = 0;
	let z = 0;

	for (let x = 0; x < checkboxes.length; x++) {
		const name = checkboxes[x].id.split('autoJobCheckbox')[1];
		const checked = checkboxes[x].dataset.checked === 'true';
		if (!setting[name]) setting[name] = {};
		setting[name].enabled = checked;

		if (name.includes('MP Smithy')) {
			let valueBoxes = document.getElementsByClassName('jobConfigQuantity');
			let value = parseInt(valueBoxes[z].value, 10);
			value = Math.min(isNumberBad(value) ? 999 : value, 10000);
			setting[name].value = value;
			z++;
			continue;
		}

		let zone = parseInt(zoneBoxes[y].value, 10);
		zone = isNumberBad(zone) ? 0 : Math.max(Math.min(zone, 999), 0);
		setting[name].zone = zone;

		let cell = parseInt(cellBoxes[y].value, 10);
		cell = isNumberBad(cell) ? 0 : Math.max(Math.min(cell, 100), 1);
		setting[name].cell = cell;
		y++;
	}

	setPageSetting('uniqueMapSettingsArray', setting, currSettingUniverse);
	cancelTooltip();
}

//AT Messages
function messageDisplay(elem) {
	const msgs = getPageSetting('spamMessages');
	const keys = ['general', 'upgrades', 'equipment', 'maps', 'map_Details', 'map_Destacking', 'map_Skip', 'other', 'buildings', 'jobs', 'zone', 'exotic', 'gather', 'stance', 'run_Stats', 'nature'];
	const settingGroup = keys.reduce((obj, key) => {
		obj[key] = false;
		return obj;
	}, {});

	let tooltipText = "<div id='messageConfig'>Here you can finely tune your message settings. Mouse over the name of a filter for more info.</div>";
	tooltipText += "<div class='row'>";
	for (let x = 0; x < 1; x++) {
		tooltipText += "<div class='col-xs-4'></span><br/>";
		for (let item in settingGroup) {
			if (item === 'enabled') continue;
			const realName = (item.charAt(0).toUpperCase() + item.substr(1)).replace(/_/g, ' ');
			tooltipText += `<span class='messageConfigContainer'><span class='messageCheckboxHolder'>${buildNiceCheckbox(item, 'messageConfigCheckbox', msgs[item])}</span><span onmouseover='messageConfigHoverAT("${item}", event)' onmouseout='tooltip("hide")' class='messageNameHolderAT'> - ${realName}</span></span><br/>`;
		}
		tooltipText += '</div>';
	}
	tooltipText += '</div>';

	const ondisplay = () => _verticalCenterTooltip();
	game.global.lockTooltip = true;
	elem.style.top = '25%';
	elem.style.left = '35%';

	const costText = `
	<div class='maxCenter'>
		<div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip();messageSave();'>Confirm</div>
		<div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div>
	</div>
	`;

	return [elem, tooltipText, costText, ondisplay];
}

function messageConfigHoverAT(what, event) {
	const messageConfigMap = {
		general: { title: 'General', text: 'Notification Messages, Auto He/Hr.' },
		upgrades: { title: 'Upgrades', text: 'Log all the upgrades that AT has purchased.' },
		equipment: { title: 'Equipment', text: 'Log the equipment & prestiges that AT buys.' },
		maps: { title: 'Maps', text: 'Log the maps that AT decides to pick, buy, run, or recycle.' },
		map_Details: { title: 'Map Details', text: 'Logs run time & map count when AT decides to farm.' },
		map_Destacking: { title: 'Map Destacking', text: 'Logs run time & map count when AT does any map based destacking.' },
		map_Skip: { title: 'Map Skip', text: 'Logs when AT skips Worshipper Farm, HD Farm & Hits Survived.' },
		other: { title: 'Other', text: 'Log Better Auto Fight, Trimpicide & AutoBreed/Gene Timer changes, etc - a catch all.' },
		buildings: { title: 'Buildings', text: 'Log the buildings that AT purchases.' },
		jobs: { title: 'Jobs', text: 'Log the jobs that AT purchases.' },
		zone: { title: 'Zone', text: 'Log when you start a new zone.' },
		exotic: { title: 'Exotic', text: 'Log the amount of world exotics you start a zone with.' },
		gather: { title: 'Gather', text: 'Log the action that AT tries to gather.' },
		stance: { title: 'Stance', text: 'Logs when AT decides to change stance and what it changes to.' },
		nature: { title: 'Nature', text: 'Logs when the script spends nature tokens.' },
		run_Stats: { title: 'Run Stats', text: "Logs the total trimps you have and how many resources you'd gain from a bone charge when entering a new zone." }
	};

	const config = messageConfigMap[what];
	if (!config) return;

	document.getElementById('messageConfig').innerHTML = `<b>${config.title}</b><br>${config.text}`;
	tooltip(config.title, 'customText', event, config.text);
}

function messageSave() {
	const setting = getPageSetting('spamMessages', portalUniverse);
	const checkboxes = Array.from(document.getElementsByClassName('messageConfigCheckbox'));

	checkboxes.forEach((checkbox) => {
		setting[checkbox.id] = checkbox.dataset.checked === 'true';
	});

	setPageSetting('spamMessages', setting);
	cancelTooltip();
}

//Daily Portal Mods
function dailyPortalModsDisplay(elem) {
	const baseText =
		"<p>This setting allows you to adjust the portal zones based on the modifiers of the daily challenge you're running. For instance, if your Daily has a resource empower modifier and you input '-3', both your void map zone and daily portal zone will be set to 3 zones lower than your current settings. Please note that the lowest value will always be used. Therefore, if a daily challenge has both Empower and Famine modifiers, inputting '-3' in each box will not result in a combined adjustment of -6 zones.</p>";

	const tooltips = {
		reflect: '<p><b>Reflect:</b> % damage reflect damage modifier</p>',
		empower: '<p><b>Empower:</b> Empower modifier</p>',
		mutimp: '<p><b>Mutimp:</b> % chance to turn enemies into Mutimps</p>',
		bloodthirst: '<p><b>Bloodthirst:</b> Enemies gaining the bloodthirst buff on kills</p>',
		famine: '<p><b>Famine:</b> Gives % less resources</p>',
		large: '<p><b>Large:</b> Gives % less housing</p>',
		weakness: '<p><b>Weakness:</b> Gives % less attack when trimps attack</p>',
		empoweredVoid: '<p><b>Empowered Void:</b> Enemies gain a % health & damage increase inside void maps</p>',
		heirlost: '<p><b>Heirlost:</b> % bonus reduction on your heirlooms</p>'
	};

	const universeTooltips = {
		1: ['empower', 'mutimp', 'bloodthirst', 'famine', 'large', 'weakness', 'reflect'],
		2: ['empower', 'mutimp', 'bloodthirst', 'famine', 'large', 'weakness', 'empoweredVoid', 'heirlost']
	};

	let tooltipText = `<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Daily Auto Portal Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp(); _verticalCenterTooltip(true);'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'>${baseText}`;
	tooltipText += universeTooltips[currSettingUniverse].map((key) => tooltips[key]).join('');
	tooltipText += "</p></div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";

	const settingArray = getPageSetting('dailyPortalSettingsArray', currSettingUniverse);
	const settings = ['Reflect', 'Empower', 'Mutimp', 'Bloodthirst', 'Famine', 'Large', 'Weakness', 'Empowered_Void', 'Heirlost'];
	const settingGroup = {};

	settings.forEach((setting) => {
		settingGroup[setting] = {};
	});

	//Skip Lines to seperate
	tooltipText += "<td><div class='row'><div class='col-xs-3' style='width: 100%; padding-right: 5px'>" + '' + '&nbsp;&nbsp;<span>' + '<u>Modifier ± Zones</u>' + '</span></div></div>';
	tooltipText += '</td></tr><tr>';

	let count = 0;

	for (let item in settingGroup) {
		if (currSettingUniverse === 1 && (item === 'Empowered_Void' || item === 'Heirlost')) continue;
		if (currSettingUniverse === 2 && item === 'Reflect') continue;
		if (count !== 0 && count % 2 === 0) tooltipText += '</tr><tr>';
		const setting = settingArray[item];
		const checkbox = buildNiceCheckbox('structConfig' + item, 'autoCheckbox', setting && setting.enabled);
		const itemName = (item.charAt(0).toUpperCase() + item.substr(1)).replace(/_/g, ' ');
		tooltipText += `
        <td>
            <div class='row'>
                <div class='col-xs-6' style='width: 52%; padding-right: 5px'>
                    ${checkbox}&nbsp;&nbsp;<span>${itemName}</span>
                </div>
                <div class='col-xs-6' style='width: 48%; text-align: right'>
                    ± Zone: <input class='structConfigPercent' id='structZone${item}' type='number'  value='${setting && setting.zone ? setting.zone : 0}'/>
                </div>
            </div>
        </td>`;
		count++;
	}

	tooltipText += '</tr>';
	tooltipText += '</div></td></tr>';
	tooltipText += '</tbody></table>';
	const costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn-lg btn btn-info' onclick='dailyPortalModsSave()'>Apply</div><div class='btn btn-lg btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	const ondisplay = () => _verticalCenterTooltip(true);

	return [elem, tooltipText, costText, ondisplay];
}

function dailyPortalModsSave() {
	const setting = getPageSetting('dailyPortalSettingsArray', currSettingUniverse);
	const checkboxes = Array.from(document.getElementsByClassName('autoCheckbox'));
	const percentboxes = Array.from(document.getElementsByClassName('structConfigPercent'));

	checkboxes.forEach((checkbox, index) => {
		const name = checkbox.id.split('structConfig')[1];
		const checked = checkbox.dataset.checked === 'true';
		setting[name] = setting[name] || {};
		setting[name].enabled = checked;

		let zone = parseInt(percentboxes[index].value, 10);
		zone = zone > 100 ? 100 : Number.isInteger(zone) ? zone : 0;
		setting[name].zone = zone;
	});

	setPageSetting('dailyPortalSettingsArray', setting, currSettingUniverse);
	cancelTooltip();
}

//C2 Runner
function c2RunnerDisplay(elem) {
	MODULES.popups.mazWindowOpen = true;

	const baseText = `Here you can enable the challenges you would like ${_getChallenge2Info()} runner to complete and the zone you'd like the respective challenge to finish at and it will start them on the next auto portal if necessary.`;
	const fusedText = autoTrimpSettings.c2Fused.universe.indexOf(currSettingUniverse) !== -1 ? ` If the 'Fused ${_getChallenge2Info()}s' setting is enabled it will show Fused challenges and prioritise running them over their regular counterparts.` : '';

	let tooltipText = `
		<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div>
		<p>Welcome to ${_getChallenge2Info()} Runner Settings! 
		<span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp(); document.getElementById("tooltipDiv").style.top = "25%"; _verticalCenterTooltip();'>Help</span></p>
		<div id='autoTooltipHelpDiv' style='display: none'>
		<p>${baseText}${fusedText}</p>
		</div>
		<table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>
	`;

	//Skip Lines to seperate
	tooltipText += '</td></tr><tr>';
	//Setup challenges that will be displayed
	let count = 0;
	let addedFusedHeader = false;
	const fusedC2s = ['Enlightened', 'Paralysis', 'Nometal', 'Topology', 'Waze', 'Toxad'];
	const settingGroup = {};
	const c2RunnerSettings = getPageSetting('c2RunnerSettings', currSettingUniverse);

	let obj = challengesUnlockedObj(currSettingUniverse, true, !getPageSetting('c2Fused', currSettingUniverse));
	obj = filterAndSortChallenges(obj, 'c2');

	obj.forEach((setting) => {
		settingGroup[setting] = {};
	});

	const headers = [
		{ name: 'Challenge', style: 'width: 33%; padding-right: 5px; white-space: nowrap' },
		{ name: 'Current Zone', style: 'width: 33%; padding-right: 5px; text-align: center; white-space: nowrap' },
		{ name: 'End Zone', style: 'width: 32%; padding-left: 5px; text-align: right; white-space: nowrap' }
	];

	const headerHTML = headers.map(({ name, style }) => `<div class='col-xs-3' style='${style}'><span><u>${name}</u></span></div>`).join('');

	tooltipText += `<td><div class='row'>${headerHTML}</div></td>`.repeat(2);

	tooltipText += '</tr><tr>';
	for (let item in settingGroup) {
		if (fusedC2s.includes(item) && !addedFusedHeader) {
			count = 0;
			tooltipText += `
				<tr>
					<td>
						<div class='row'>
							<div class='col-xs-5' style='width: 100%; padding-right: 5px'>
								&nbsp;&nbsp;<span><u>Fused ${_getChallenge2Info()}s</u></span>
							</div>
						</div>
					</td>
				</tr>`;
			addedFusedHeader = true;
		}
		if (count !== 0 && count % 2 === 0) tooltipText += '</tr><tr>';
		const setting = c2RunnerSettings[item] !== 'undefined' ? c2RunnerSettings[item] : (setting = item = { enabled: false, zone: 0 });
		const checkbox = buildNiceCheckbox('structConfig' + item, 'autoCheckbox', setting && setting.enabled);

		const challenge = game.challenges[item];
		const challengeList = challenge.multiChallenge || [item];
		let challengeLevel = 0;

		for (let y = 0; y < challengeList.length; y++) {
			if (challengeLevel > 0) challengeLevel = Math.min(challengeLevel, game.c2[challengeList[y]]);
			else challengeLevel += game.c2[challengeList[y]];
		}

		tooltipText += `
			<td>
				<div class='row'>
					<div class='col-xs-3' style='width: 33%; padding-right: 5px; white-space: nowrap'>${checkbox}&nbsp;&nbsp;<span>${item}</span></div>
					<div class='col-xs-3' style='width: 33%; padding-right: 5px;text-align: center;  white-space: nowrap'>${challengeLevel}</span></div>
					<div class='col-xs-5' style='width: 34%; padding-left: 5px; text-align: right; white-space: nowrap'><input class='structConfigPercent' id='structZone${item}' type='number'  value='${setting && setting.zone ? setting.zone : 0}'/></div>
				</div>
			</td>`;
		count++;
	}
	tooltipText += '</tr>';

	tooltipText += '</div></td></tr>';
	tooltipText += '</tbody></table>';
	game.global.lockTooltip = true;

	const costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn-lg btn btn-info' onclick='c2RunnerSave()'>Apply</div><div class='btn btn-lg btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
	elem.style.width = '45%';
	elem.style.left = '30.5%';
	elem.style.top = '25%';
	const ondisplay = () => _verticalCenterTooltip();

	return [elem, tooltipText, costText, ondisplay];
}

function c2RunnerSave() {
	const setting = getPageSetting('c2RunnerSettings', currSettingUniverse);
	const checkboxes = Array.from(document.getElementsByClassName('autoCheckbox'));
	const percentboxes = Array.from(document.getElementsByClassName('structConfigPercent'));

	checkboxes.forEach((checkbox, index) => {
		const name = checkbox.id.split('structConfig')[1];
		const checked = checkbox.dataset.checked === 'true';
		setting[name] = setting[name] || {};
		setting[name].enabled = checked;

		let zone = parseInt(percentboxes[index].value, 10);
		if (zone > 810) zone = 810;
		zone = Number.isInteger(zone) ? zone : 0;
		setting[name].zone = zone;
	});

	setPageSetting('c2RunnerSettings', setting, currSettingUniverse);
	cancelTooltip();
}
