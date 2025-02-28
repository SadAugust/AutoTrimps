function mapSettingsDisplay(elem, titleText) {
	MODULES.popups.mazWindowOpen = true;
	const settingNames = mazSettingNames();

	/* remove spaces from titleText to make varPrefix */
	let varPrefix = titleText.replace(/\s/g, '');
	if (varPrefix.includes('Desolation')) varPrefix = 'Desolation';
	let settingName = varPrefix.charAt(0).toLowerCase() + varPrefix.slice(1);
	if (varPrefix === 'HDFarm') settingName = settingName.charAt(0) + settingName.charAt(1).toLowerCase() + settingName.slice(2);

	const originalSetting = getPageSetting(`${settingName}Settings`, atConfig.settingUniverse);
	const activeSetting = _getActiveSetting(settingName, settingNames);
	const activeSettingObj = JSON.stringify(activeSetting);
	const settingObj = _mapSettingsInputObj();
	const { settingInputs, settingInputsDefault, windowWidth } = settingObj[titleText];
	settingInputsDefault.unshift('active');
	if (activeSetting.golden) settingInputs.splice(4, 0, 'golden2');
	if (activeSetting.alchemy) settingInputs.splice(10, 0, 'potion2');

	let tooltipText = '';
	/* setting up default settings row */
	const noDefaultRow = activeSetting.golden || activeSetting.profile;
	if (!noDefaultRow) {
		tooltipText += _mapSettingsDefaultTitles(varPrefix, activeSetting, settingInputsDefault);

		const defaultVals = _mapSettingsDefaultVals();
		const defaultSetting = originalSetting[0];

		for (let item in settingInputsDefault) {
			let name = settingInputsDefault[item];
			defaultVals[name] = typeof defaultSetting[name] !== 'undefined' ? defaultSetting[name] : defaultVals[name];
		}

		tooltipText += _mapSettingsDefaultPopulateInputs(defaultVals, varPrefix, activeSetting);
	}

	tooltipText += _mapSettingsRowTitles(varPrefix, activeSetting, settingInputs);

	/* as position 0 in the array stores base setting we need to take that out of the array before we start looping through rows */
	const currSetting = noDefaultRow ? originalSetting : originalSetting.slice(1, originalSetting.length);
	const profileData = activeSetting.profile ? JSON.parse(localStorage.getItem('atSettingsProfiles')) : null;
	let overflow = false;
	/* looping through each setting and setting up the rows and inputting the data from the setting into the inputs */
	for (let x = 0; x < activeSetting.maxSettings; x++) {
		const vals = _mapSettingsVals(x, activeSetting);
		if (activeSetting.archaeology) vals.jobratio += ',1';
		let style = '';

		/* taking data from the current setting and overriding the info in vals with it. */
		if (currSetting.length - 1 >= x) {
			for (let item in settingInputs) {
				let name = settingInputs[item];
				/* handle settings with different inputs styles seperately */
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

				if (activeSetting.profile && name === 'settingString') {
					const profileName = currSetting[x].profileName;
					vals[name] = profileData && profileData[profileName] ? profileData[profileName] : 'Empty Dataset. Overwrite or delete and add profile again.';
					continue;
				}

				vals[name] = typeof currSetting[x][name] !== 'undefined' ? currSetting[x][name] : vals[name];
			}

			if (x >= 10) overflow = true;
		} else {
			style = " style='display: none' ";
		}

		tooltipText += _mapSettingsRowPopulateInputs(vals, varPrefix, activeSetting, x, style, currSetting.length, settingInputs);
	}

	tooltipText += `<div id='windowAddRowBtn' style='display: ${currSetting.length < activeSetting.maxSettings ? 'inline-block' : 'none'}' class='btn btn-success btn-md' onclick='_mapSettingsAddRow("${varPrefix}")'>+ Add Row</div>`;
	tooltipText += `</div></div>`;
	tooltipText += `<div style='display: none' id='mazHelpContainer'>${mapSettingsHelpWindow(titleText, activeSettingObj)}</div>`;

	const costText = `
		<div class='maxCenter'>
			<span class='btn btn-success btn-md' id='confirmTooltipBtn' onclick='settingsWindowSave("${titleText}", "${settingName}", ${JSON.stringify(activeSettingObj)})'>Save and Close</span>
			<span class='btn btn-danger btn-md' onclick='cancelTooltip(true)'>Cancel</span>
			<span class='btn btn-primary btn-md' id='confirmTooltipBtn' onclick='settingsWindowSave("${titleText}", "${settingName}", ${JSON.stringify(activeSettingObj)}, true)'>Save</span>
			<span class='btn btn-info btn-md' onclick='windowToggleHelp("${windowWidth}")'>Help</span>
		</div>`;

	elem.style.top = '10%';
	elem.style.left = '1%';
	elem.style.height = 'auto';
	elem.style.maxHeight = `${window.innerHeight * 0.85}px`;
	elem.style.overflowY = overflow ? 'scroll' : '';
	elem.classList = `tooltipExtraCustom${windowWidth.replace(/\D/g, '')}`;

	return [elem, tooltipText, costText, null];
}

function mazSettingNames(titleName) {
	if (titleName) {
		return ['Map Farm', 'Map Bonus', 'Void Map', 'HD Farm', 'Raiding', 'Bionic Raiding', 'Toxicity', 'Bone Shrine', 'Auto Golden', 'Tribute Farm', 'Smithy Farm', 'Worshipper Farm', 'Quagmire', 'Archaeology', 'Insanity', 'Alchemy', 'Hypothermia', 'Desolation Gear Scumming', 'C2 Runner', 'C3 Runner', 'Profile', 'Gene Assist', 'Hits Survived & HD Farm', 'Spire Assault Settings'];
	}

	return ['mapFarm', 'mapBonus', 'voidMap', 'hdFarm', 'raiding', 'bionic', 'toxicity', 'boneShrine', 'autoGolden', 'tributeFarm', 'smithyFarm', 'worshipperFarm', 'quagmire', 'archaeology', 'insanity', 'alchemy', 'hypothermia', 'desolation', 'profile', 'geneAssist', 'spireAssault'];
}

function _getActiveSetting(settingName = '', settingNames = []) {
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
	return {
		/* anything added here has to go in the order that the title & inputs will be displayed in */
		'Auto Golden': {
			settingInputs: ['active', 'priority', 'row', 'golden', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: [],
			windowWidth: '40%'
		},
		'HD Farm': {
			settingInputs: ['active', 'priority', 'row', 'world', 'endzone', 'cell', 'autoLevel', 'level', 'hdType', 'hdBase', 'hdMult', 'mapCap', 'jobratio', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: ['jobratio', 'mapCap'],
			windowWidth: '70%'
		},
		'Void Map': {
			settingInputs: ['active', 'priority', 'row', 'world', 'endzone', 'cell', 'hdType', 'hdRatio', 'hdType2', 'voidHDRatio', 'jobratio', 'runType', 'challenge', 'challenge3', 'challengeOneOff', 'portalAfter'],
			settingInputsDefault: ['maxTenacity', 'boneCharge', 'voidFarm', 'hitsSurvived', 'hdRatio', 'jobratio', 'mapCap'],
			windowWidth: '70%'
		},
		'Bone Shrine': {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'boneamount', 'bonebelow', 'jobratio', 'gather', 'atlantrimp', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: ['autoBone', 'bonebelow', 'world', 'gather', 'jobratio'],
			windowWidth: '65%'
		},
		'Map Bonus': {
			settingInputs: ['active', 'priority', 'row', 'world', 'endzone', 'cell', 'autoLevel', 'level', 'hdRatio', 'repeat', 'jobratio', 'special', 'gather', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: ['jobratio', 'special', 'gather'],
			windowWidth: '75%'
		},
		'Map Farm': {
			settingInputs: ['active', 'priority', 'row', 'world', 'endzone', 'cell', 'autoLevel', 'level', 'mapType', 'repeat', 'hdRatio', 'jobratio', 'special', 'repeatevery', 'gather', 'atlantrimp', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: [],
			windowWidth: '80%'
		},
		Raiding: {
			settingInputs: ['active', 'priority', 'row', 'world', 'endzone', 'raidingzone', 'cell', 'repeatevery', 'raidingDropdown', 'prestigeGoal', 'incrementMaps', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: ['recycle'],
			windowWidth: '75%'
		},
		'Bionic Raiding': {
			settingInputs: ['active', 'priority', 'row', 'world', 'endzone', 'raidingzone', 'cell', 'repeatevery', 'prestigeGoal', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: [],
			windowWidth: '70%'
		},
		'Worshipper Farm': {
			settingInputs: ['active', 'priority', 'row', 'world', 'endzone', 'cell', 'autoLevel', 'level', 'worshipper', 'jobratio', 'repeatevery', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: ['shipSkipEnabled', 'shipskip'],
			windowWidth: '70%'
		},
		'Tribute Farm': {
			settingInputs: ['active', 'priority', 'row', 'world', 'endzone', 'cell', 'autoLevel', 'level', 'mapType', 'tributes', 'mets', 'jobratio', 'repeatevery', 'atlantrimp', 'buildings', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: [],
			windowWidth: '80%'
		},
		'Smithy Farm': {
			settingInputs: ['active', 'priority', 'row', 'world', 'endzone', 'cell', 'autoLevel', 'level', 'mapType', 'repeat', 'repeatevery', 'meltingPoint', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: [],
			windowWidth: '70%'
		},
		Toxicity: {
			settingInputs: ['active', 'priority', 'row', 'world', 'endzone', 'cell', 'autoLevel', 'level', 'repeat', 'jobratio', 'special', 'repeatevery', 'gather'],
			settingInputsDefault: [],
			windowWidth: '50%'
		},
		Quagmire: {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'bogs', 'jobratio'],
			settingInputsDefault: ['abandonZone'],
			windowWidth: '45%'
		},
		Archaeology: {
			settingInputs: ['active', 'priority', 'row', 'world', 'endzone', 'cell', 'autoLevel', 'level', 'relics', 'mapCap', 'jobratio', 'repeatevery'],
			settingInputsDefault: [],
			windowWidth: '50%'
		},
		Insanity: {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'autoLevel', 'level', 'insanity', 'jobratio', 'special', 'gather', 'destack'],
			settingInputsDefault: [],
			windowWidth: '55%'
		},
		Alchemy: {
			settingInputs: ['active', 'priority', 'row', 'world', 'endzone', 'cell', 'autoLevel', 'level', 'mapType', 'potion', 'jobratio', 'special', 'repeatevery', 'gather'],
			settingInputsDefault: ['voidPurchase'],
			windowWidth: '75%'
		},
		Hypothermia: {
			settingInputs: ['active', 'priority', 'row', 'world', 'cell', 'autoLevel', 'level', 'bonfire', 'jobratio'],
			settingInputsDefault: ['frozencastle', 'autostorage', 'packrat'],
			windowWidth: '45%'
		},
		'Desolation Gear Scumming': {
			settingInputs: ['active', 'priority', 'row', 'world', 'endzone', 'jobratio', 'special', 'repeatevery', 'gather', 'prestigeGoal'],
			settingInputsDefault: ['abandonZone'],
			windowWidth: '50%'
		},
		Profile: {
			settingInputs: ['profileName', 'row', 'load', 'settingString', 'overwrite'],
			settingInputsDefault: [],
			windowWidth: '60%'
		},
		'Gene Assist': {
			settingInputs: ['active', 'priority', 'row', 'world', 'endzone', 'cell', 'autoLevel', 'level', 'hdRatio', 'jobratio', 'special', 'repeatevery', 'gather', 'runType', 'challenge', 'challenge3', 'challengeOneOff'],
			settingInputsDefault: ['geneAssistSpendingPct', 'geneAssistBleedVoids'],
			windowWidth: '70%'
		},
		'Spire Assault': {
			settingInputs: ['active', 'priority', 'row', 'world', 'preset', 'settingType', 'item', 'bonusItem', 'oneTimerItem', 'levelSA'],
			settingInputsDefault: [],
			windowWidth: '55%'
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
		abandonZone: 0,
		geneSpendingPct: 1,
		geneBleedVoids: 6
	};
}

function _mapSettingsVals(lineNo, activeSetting) {
	return {
		active: true,
		priority: parseInt(lineNo) + 1,
		check: true,
		world: activeSetting.spireAssault ? autoBattle.enemyLevel : game.global.world,
		cell: 1,
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
		goldenNumber: -1,
		destack: false,
		mapCap: 100,
		incrementMaps: false,
		golden: 'v',
		potion: 'h',
		potionsnumber: 0,
		potionstype: 'h',
		profileName: 'None',
		load: false,
		overwrite: false,
		settingString: serializeSettings(),
		preset: '0',
		settingType: 'Clear Level',
		item: 'Menacing_Mask',
		bonusItem: 'Stats',
		oneTimerItem: 'Gathermate',
		levelSA: '0'
	};
}

function _mapSettingsValsKeys(s) {
	return {
		windowActive: 'active',
		windowPriority: 'priority',
		windowWorld: s.golden ? 'goldenNumber' : 'world',
		windowEndZone: 'endzone',
		windowRaidingZone: 'raidingzone',
		windowCell: 'cell',
		windowAutoLevel: 'autoLevel',
		windowLevel: 'level',
		windowMapTypeDropdown: 'mapType',
		windowWorshipper: 'worshipper',
		windowRepeat: s.hdFarm ? 'hdBase' : 'repeat',
		windowHDMult: 'hdMult',
		windowHDType: 'hdType',
		windowMapCap: 'mapCap',
		windowTributes: 'tributes',
		windowMets: 'mets',
		windowBogs: 'bogs',
		windowRelics: 'relics',
		windowInsanity: 'insanity',
		windowPotionType: 'potionstype',
		windowPotionNumber: 'potionsnumber',
		windowBonfire: 'bonfire',
		windowBoneAmount: 'boneamount',
		windowBoneBelow: 'bonebelow',
		windowHDTypeVoidMap: 'hdType',
		windowHDTypeVoidMap2: 'hdType2',
		windowVoidHDRatio: 'voidHDRatio',
		windowHDRatio: 'hdRatio',
		windowJobRatio: 'jobratio',
		windowRepeatEvery: 'repeatevery',
		windowBoneGather: 'gather',
		windowRaidingDropdown: 'raidingDropdown',
		windowSpecial: 'special',
		windowGather: 'gather',
		windowAtlantrimp: 'atlantrimp',
		windowMeltingPoint: 'meltingPoint',
		windowBuildings: s.insanity ? 'destack' : 'buildings',
		windowPrestigeGoal: 'prestigeGoal',
		windowIncrementMapsDefault: 'incrementMaps',
		windowGoldenType: 'goldenType',
		windowRunType: 'runType',
		windowChallenge: 'challenge',
		windowChallenge3: 'challenge3',
		windowChallengeOneOff: 'challengeOneOff',
		windowPortalAfter: 'portalAfter',
		windowNameProfiles: 'profileName',
		windowLoadProfiles: 'load',
		windowOverwriteProfiles: 'overwrite',
		windowSettingStringProfiles: 'settingString',
		windowGeneSpentPct: 'geneAssistSpendingPct',
		windowGeneBleedVoids: 'geneAssistBleedVoids',
		windowSettingType: 'settingType',
		windowItem: 'item',
		windowBonusItem: 'bonusItem',
		windowOneTimerItem: 'oneTimerItem',
		windowItemLevel: 'levelSA'
	};
}

function _mapSettingsDefaultTitles(varPrefix, activeSettings, settingOrder) {
	const s = activeSettings;
	const elements = [];

	if (s.worshipperFarm) {
		elements.push({ name: 'shipSkipEnabled', class: `windowWorshipperSkip`, title: 'Enable<br/>Skip' });
		elements.push({ name: 'shipskip', class: `windowWorshipper`, title: 'Skip<br/>Value' });
	}

	if (s.boneShrine) {
		elements.push({ name: 'autoBone', class: `windowAutoBoneShrine`, title: 'Auto Spend Charges' });
		elements.push({ name: 'bonebelow', class: `windowBoneDefault`, title: 'Auto Spend<br>At X Charges' });
		elements.push({ name: 'world', class: `windowBoneDefault`, title: 'Auto Spend<br>From Z' });
		elements.push({ name: 'gather', class: `windowBoneDefault`, title: 'Auto Spend<br>Gather' });
		elements.push({ name: 'jobratio', class: `windowBoneDefault`, title: 'Auto Spend<br>Job Ratio' });
	}

	if (s.mapBonus || s.hdFarm) {
		elements.push({ name: 'jobratio', class: `windowJobRatio${varPrefix}`, title: 'Job<br>Ratio' });
	}

	if (s.mapBonus) {
		elements.push({ name: 'special', class: `windowSpecial${varPrefix}`, title: 'Special' });
	}

	if (s.raiding) {
		elements.push({ name: 'recycle', class: `windowRecycle`, title: 'Recycle<br>Maps' });
	}

	if (s.alchemy) {
		elements.push({ name: 'voidPurchase', class: `windowStorage`, title: 'Void<br>Purchase' });
	}

	if (s.quagmire) {
		elements.push({ name: 'abandonZone', class: `windowAbandonZone`, title: 'Abandon Challenge Zone' });
	}

	if (s.voidMap) {
		elements.push({ name: 'maxTenacity', class: `windowDefaultVoidMap`, title: 'Max<br>Map Bonus' });
		if (game.permaBoneBonuses.boosts.owned > 0) {
			elements.push({ name: 'boneCharge', class: `windowDefaultVoidMap`, title: 'Use Bone<br>Charge' });
		}
		elements.push({ name: 'voidFarm', class: `windowDefaultVoidMap`, title: 'Pre Void<br>Farm' });
		elements.push({ name: 'hitsSurvived', class: `windowDefaultVoidMap`, title: 'Void Farm<br>Hits Survived' });
		elements.push({ name: 'hdRatio', class: `windowDefaultVoidMap`, title: 'Void Farm<br>HD Ratio' });
		elements.push({ name: 'jobratio', class: `windowDefaultVoidMap`, title: 'Void Farm<br>Job Ratio' });
		elements.push({ name: 'mapCap', class: `windowDefaultVoidMap`, title: 'Void Farm<br>Map Cap' });
	}

	if (s.hypothermia) {
		elements.push({ name: 'frozencastle', class: `windowFrozenCastle`, title: 'Frozen<br>Castle' });
		elements.push({ name: 'autostorage', class: `windowStorage`, title: 'Auto<br>Storage' });
		elements.push({ name: 'packrat', class: `windowPackrat`, title: 'Packrat' });
	}

	if (s.hdFarm) {
		elements.push({ name: 'mapCap', class: `windowCell${varPrefix}`, title: 'Map<br>Cap' });
	}

	if (s.geneAssist) {
		elements.push({ name: 'geneAssistSpendingPct', class: `windowGeneSpentPct`, title: 'Spending<br/>Pct' });
		elements.push({ name: 'geneAssistBleedVoids', class: `windowGeneBleedVoids`, title: 'Bleed Voids<br/>Timer' });
	}

	const sortedElements = new Array(settingOrder.length).fill(null);
	elements.forEach((item) => {
		const index = settingOrder.indexOf(item.name);
		if (index !== -1) {
			sortedElements[index] = item;
		}
	});

	let tooltipText = `
		<div id='windowContainer' style='display: block'>
			<div id='windowError'></div>
			<div class='row windowRow titles' style='border: 0px; margin-top: -0.5vw;'>
			<div class='windowDisplay windowActive${varPrefix}'>Enabled</div>`;
	/* <div class='windowDisplay windowAdvanced${varPrefix}'>Advanced</div> */

	sortedElements.forEach((item) => {
		if (item === null) return;
		tooltipText += `<div class='windowDisplay ${item.class}'>${item.title}</div>`;
	});

	tooltipText += '</div>';

	return tooltipText;
}

function _mapSettingsDefaultPopulateInputs(defaultVals, varPrefix, activeSettings) {
	const s = activeSettings;
	const defaultDropdowns = mapSettingsDropdowns(atConfig.settingUniverse, defaultVals, varPrefix);
	const className = defaultVals.special === 'hc' || defaultVals.special === 'lc' ? ' windowGatherOn' : ' windowGatherOff';

	let tooltipText = `<div id='windowRow' class='row windowRow ${className}'>`;
	tooltipText += `<div class='windowDisplay windowActive${varPrefix}' style='text-align: center;'>${buildNiceCheckbox('windowActiveDefault', null, defaultVals.active)}</div>`;

	/* tooltipText += `<div class='windowDisplay windowAdvanced${varPrefix}' style='text-align: center;'>${buildNiceCheckbox('windowActiveDefault', null, defaultVals.active)}</div>`; */

	if (s.worshipperFarm) {
		tooltipText += `<div class='windowDisplay windowWorshipperSkip' style='text-align: center;'>${buildNiceCheckbox('windowSkipShipEnabled', null, defaultVals.shipSkipEnabled)}</div>`;
		tooltipText += `<div class='windowDisplay windowWorshipper'><input value='${defaultVals.shipskip}' type='number' id='windowRepeatDefault'/></div>`;
	}
	if (s.boneShrine) {
		tooltipText += `<div class='windowDisplay windowAuto${varPrefix}' style='text-align: center;'>${buildNiceCheckbox('windowAutoBone', null, defaultVals.autoBone)}</div>`;
		tooltipText += `<div class='windowDisplay windowBoneDefault'><input value='${defaultVals.bonebelow}' type='number' id='windowBoneBelowDefault'/></div>`;
		tooltipText += `<div class='windowDisplay windowBoneDefault'><input value='${defaultVals.world}' type='number' id='windowBoneWorld'/></div>`;
		tooltipText += `<div class='windowDisplay windowBoneDefault'><select value='${defaultVals.gather}' id='windowBoneGatherDefault'>${defaultDropdowns.gather}</select></div>`;
		tooltipText += `<div class='windowDisplay windowBoneDefault'><input value='${defaultVals.jobratio}' type='text' id='windowJobRatioDefault'/></div>`;
	}
	if (s.mapBonus || s.hdFarm) tooltipText += `<div class='windowDisplay windowJobRatio${varPrefix}'><input value='${defaultVals.jobratio}' type='text' id='windowJobRatioDefault'/></div>`;
	if (s.mapBonus) {
		tooltipText += `<div class='windowDisplay windowSpecial${varPrefix}'  onchange='_mapSettingsUpdatePreset()'><select value='${defaultVals.special}' id='windowSpecial'>${defaultDropdowns.special}</select></div>`;
		tooltipText += `<div class='windowDisplay windowGather'><div style='text-align: center; font-size: 0.6vw;'>Gather</div><onchange='_mapSettingsUpdatePreset()'><select value='${defaultVals.gather}' id='windowGather'>${defaultDropdowns.gather}</select></div>`;
	}
	if (s.quagmire) tooltipText += `<div class='windowDisplay windowAbandonZone'><input value='${defaultVals.abandonZone}' type='number' id='abandonZone'/></div>`;
	if (s.hypothermia) {
		tooltipText += `<div class='windowDisplay windowFrozenCastle'><input value='${defaultVals.frozencastle}' type='text' id='windowFrozenCastleDefault'/></div>`;
		tooltipText += `<div class='windowDisplay windowStorage' style='text-align: center;'>${buildNiceCheckbox('windowStorageDefault', null, defaultVals.autostorage)}</div>`;
		tooltipText += `<div class='windowDisplay windowPackrat' style='text-align: center;'>${buildNiceCheckbox('windowPackratDefault', null, defaultVals.packrat)}</div>`;
	}

	if (s.raiding) tooltipText += `<div class='windowDisplay windowRecycle' style='text-align: center;'>${buildNiceCheckbox('windowRecycleDefault', null, defaultVals.recycle)}</div>`;
	if (s.alchemy) tooltipText += `<div class='windowDisplay windowStorage' style='text-align: center;'>${buildNiceCheckbox('windowVoidPurchase', null, defaultVals.voidPurchase)}</div>`;
	if (s.voidMap) {
		tooltipText += `<div class='windowDisplay windowDefaultVoidMap' style='text-align: center;'>${buildNiceCheckbox('windowMaxTenacity', null, defaultVals.maxTenacity)}</div>`;
		if (game.permaBoneBonuses.boosts.owned > 0) tooltipText += `<div class='windowDisplay windowDefaultVoidMap' style='text-align: center;'>${buildNiceCheckbox('windowBoneCharge', null, defaultVals.boneCharge)}</div>`;
		tooltipText += `<div class='windowDisplay windowDefaultVoidMap' style='text-align: center;'>${buildNiceCheckbox('windowVoidFarm', null, defaultVals.voidFarm)}</div>`;
		tooltipText += `<div class='windowDisplay windowDefaultVoidMap'><input value='${defaultVals.hitsSurvived}' type='number' id='windowHitsSurvived'/></div>`;
		tooltipText += `<div class='windowDisplay windowDefaultVoidMap'><input value='${defaultVals.hdRatio}' type='number' id='windowHDRatio'/></div>`;
		tooltipText += `<div class='windowDisplay windowDefaultVoidMap'><input value='${defaultVals.jobratio}' type='text' id='windowJobRatioDefault'/></div>`;
		tooltipText += `<div class='windowDisplay windowDefaultVoidMap'><input value='${defaultVals.mapCap}' type='text' id='windowMapCap'/></div>`;
	}
	if (s.hdFarm) tooltipText += `<div class='windowDisplay windowCell${varPrefix}'><input value='${defaultVals.mapCap}' type='number' id='mapCap'/></div>`;

	if (s.geneAssist) {
		tooltipText += `<div class='windowDisplay windowGeneSpentPct'><input value='${defaultVals.geneSpendingPct}' type='number' id='geneAssistSpendingPct'/></div>`;
		tooltipText += `<div class='windowDisplay windowGeneBleedVoids'><input value='${defaultVals.geneBleedVoids}' type='number' id='geneAssistBleedVoids'/></div>`;
	}

	tooltipText += `</div>`;

	return tooltipText;
}

function _mapSettingsRowTitles(varPrefix, activeSettings, settingOrder) {
	const s = activeSettings;
	const elements = [];

	if (s.golden) {
		elements.push({ name: 'row', class: `windowAmtAutoGolden`, title: 'Amount' });
		elements.push({ name: 'golden', class: `windowTypeAutoGolden`, title: 'Golden Type' });
	}

	if (s.hdFarm) {
		elements.push({ name: 'hdType', class: `windowHDType`, title: 'Farming<br/>Type' });
		elements.push({ name: 'hdBase', class: `windowHDBase`, title: 'HD Base' });
		elements.push({ name: 'hdMult', class: `windowHDMult`, title: 'HD Mult' });
		elements.push({ name: 'mapCap', class: `windowMapCap`, title: 'Map<br/>Cap' });
	}

	if (s.voidMap) {
		elements.push({ name: 'hdType', class: `windowHDTypeVoidMap`, title: 'Dropdown<br/>#1' });
		elements.push({ name: 'hdRatio', class: `windowVoidHDRatio`, title: 'Option<br/>#1' });
		elements.push({ name: 'hdType2', class: `windowHDTypeVoidMap`, title: 'Dropdown<br/>#2' });
		elements.push({ name: 'voidHDRatio', class: `windowVoidHDRatio`, title: 'Option<br/>#2' });
		elements.push({ name: 'portalAfter', class: `windowPortalAfter`, title: 'Portal<br/>After' });
	}

	if (s.boneShrine) {
		elements.push({ name: 'world', class: `windowWorld${varPrefix}`, title: 'Zone' });
		elements.push({ name: 'boneamount', class: `windowBoneAmount`, title: 'To use' });
		elements.push({ name: 'bonebelow', class: `windowBoneBelow`, title: 'Use above' });
		elements.push({ name: 'gather', class: `windowBoneGather`, title: 'Gather' });
	}

	if (s.mapBonus) {
		elements.push({ name: 'hdRatio', class: `windowHDRatio${varPrefix}`, title: 'Above X<br/>HD Ratio' });
		elements.push({ name: 'repeat', class: `windowMapStacks`, title: 'Map<br/>Stacks' });
	}

	if (s.mapFarm) {
		elements.push({ name: 'repeat', class: `windowRepeat${varPrefix}`, title: 'Map<br/>Repeats' });
		elements.push({ name: 'hdRatio', class: `windowHDRatio${varPrefix}`, title: 'Above X<br/>HD Ratio' });
	}

	if (s.raiding) {
		elements.push({ name: 'raidingzone', class: `windowRaidingZone${varPrefix}`, title: 'Map<br/>Level' });
		elements.push({ name: 'raidingDropdown', class: `windowRaidingDropdown`, title: 'Frag Type' });
		elements.push({ name: 'incrementMaps', class: `windowIncrementMaps`, title: 'Increment<br>Maps' });
	}

	if (s.bionic) {
		elements.push({ name: 'raidingzone', class: `windowRaidingZone${varPrefix}`, title: 'Raiding<br/>Zone' });
	}

	if (s.worshipperFarm) {
		elements.push({ name: 'worshipper', class: `windowWorshipper`, title: 'Worshippers' });
	}

	if (s.tributeFarm) {
		elements.push({ name: 'tributes', class: `windowTributes`, title: 'Tributes' });
		elements.push({ name: 'mets', class: `windowMets`, title: 'Mets' });
		elements.push({ name: 'buildings', class: `windowBuildings`, title: 'Buy<br/>Buildings' });
	}

	if (s.smithyFarm) {
		elements.push({ name: 'repeat', class: `windowSmithies`, title: 'Smithies' });
		elements.push({ name: 'meltingPoint', class: `windowMeltingPoint`, title: 'Run<br/>MP' });
	}

	if (s.toxicity) {
		elements.push({ name: 'repeat', class: `windowRepeat${varPrefix}`, title: 'Toxic<br/>Stacks' });
	}

	if (s.quagmire) {
		elements.push({ name: 'bogs', class: `windowBogs`, title: 'Bogs' });
	}

	if (s.archaeology) {
		elements.push({ name: 'relics', class: `windowRelics${varPrefix}`, title: 'Relic String' });
		elements.push({ name: 'mapCap', class: `windowMapCap`, title: 'Map<br/>Cap' });
	}

	if (s.insanity) {
		elements.push({ name: 'insanity', class: `windowInsanity`, title: 'Insanity' });
		elements.push({ name: 'destack', class: `windowBuildings`, title: 'Destack' });
	}

	if (s.alchemy) {
		elements.push({ name: 'potion', class: `windowPotionType`, title: 'Potion Type' });
		elements.push({ name: 'potion2', class: `windowPotionNumber`, title: 'Potion Number' });
	}

	if (s.hypothermia) {
		elements.push({ name: 'bonfire', class: `windowBonfire`, title: 'Bonfires' });
	}

	if (s.profile) {
		elements.push({ name: 'profileName', class: `windowNameProfiles`, title: 'Profile Name' });
		elements.push({ name: 'load', class: `windowLoadProfiles`, title: 'Load Profile' });
		elements.push({ name: 'settingString', class: `windowSettingStringProfiles`, title: 'Profile String' });
		elements.push({ name: 'overwrite', class: `windowOverwriteProfiles`, title: 'Overwrite Profile?' });
	}

	/* Misc Settings that have multiple categories */
	if (!s.profile) {
		elements.push({ name: 'active', class: `windowActive${varPrefix}`, title: 'Active?' });
		elements.push({ name: 'priority', class: `windowPriority${varPrefix}`, title: 'Priority' });
	}

	if (!s.golden && !s.profile && !s.spireAssault) {
		if (!s.boneShrine) elements.push({ name: 'world', class: `windowWorld${varPrefix}`, title: 'Start<br/>Zone' });
		if (!s.desolation) elements.push({ name: 'cell', class: `windowCell${varPrefix}`, title: 'Cell' });
	}

	if (s.endZone) {
		elements.push({ name: 'endzone', class: `windowEndZone${varPrefix}`, title: 'End<br/>Zone' });
	}

	if (s.mapLevel) {
		elements.push({ name: 'autoLevel', class: `windowAutoLevel${varPrefix}`, title: 'Auto<br/>Level' });
		elements.push({ name: 'level', class: `windowLevel windowLevel${varPrefix}`, title: 'Map<br/>Level' });
	}

	if (s.mapType) {
		elements.push({ name: 'mapType', class: `windowMapTypeDropdown${varPrefix}`, title: 'Farm Type' });
	}

	if (s.jobRatio) {
		elements.push({ name: 'jobratio', class: `windowJobRatio${varPrefix}`, title: 'Job<br/>Ratio' });
	}

	if (s.special) {
		elements.push({ name: 'special', class: `windowSpecial${varPrefix}`, title: 'Special' });
	}

	if (s.repeatEvery) {
		elements.push({ name: 'repeatevery', class: `windowRepeatEvery${varPrefix}`, title: 'Repeat<br/>Every' });
	}

	if (s.prestigeGoal) {
		elements.push({ name: 'prestigeGoal', class: `windowPrestigeGoal${varPrefix}`, title: 'Prestige<br/>Goal' });
	}

	if (s.runType) {
		elements.push({ name: 'runType', class: `windowRunType${varPrefix}`, title: 'Run&nbsp;Type' });
	}

	const trimpleName = atConfig.settingUniverse === 1 ? 'Trimple' : 'Atlantrimp';
	if (s.atlantrimp) {
		elements.push({ name: 'atlantrimp', class: `windowAtlantrimp`, title: `Run<br/>${trimpleName}` });
	}

	if (s.spireAssault) {
		elements.push({ name: 'world', class: `windowWorld${varPrefix}`, title: 'Level' });
		elements.push({ name: 'preset', class: `windowPreset${varPrefix}`, title: 'Preset' });
		elements.push({ name: 'settingType', class: `windowSettingType${varPrefix}`, title: `Setting&nbsp;Type` });
		elements.push({ name: 'item', class: `windowClear windowItem${varPrefix}`, title: `Item` });
		elements.push({ name: 'levelSA', class: `windowLevel windowItemLevel${varPrefix}`, title: `Item&nbsp;Level` });
	}

	const sortedElements = new Array(settingOrder.length).fill(null);
	elements.forEach((item) => {
		const index = settingOrder.indexOf(item.name);
		if (index !== -1) {
			sortedElements[index] = item;
		}
	});

	let tooltipText = `
        <div id='windowContainer' style='display: block'>
            <div id='windowError'></div>
            <div class='row windowRow titles'>`;

	sortedElements.forEach((item) => {
		if (item === null) return;
		tooltipText += `<div class='windowDisplay ${item.class}'>${item.title}</div>`;
	});

	tooltipText += '</div>';

	return tooltipText;
}

function _mapSettingsRowPopulateInputs(vals, varPrefix, activeSettings, x, style, currSettingLength, settingOrder) {
	const s = activeSettings;
	const dropdowns = mapSettingsDropdowns(atConfig.settingUniverse, vals, varPrefix);

	let backgroundStyle = '';
	if (atConfig.settingUniverse === 1 && !s.golden && !s.profile) {
		const natureStyles = {
			None: 'unset',
			Poison: 'rgba(50, 150, 50, 0.75)',
			Wind: 'rgba(60, 75, 130, 0.75)',
			Ice: 'rgba(50, 50, 200, 0.75)'
		};

		const empowerment = getZoneEmpowerment(vals.world);
		backgroundStyle = ` background:${natureStyles[empowerment]}`;
	}

	const elements = [];
	const classNames = [vals.special === 'hc' || vals.special === 'lc' ? 'windowGatherOn' : 'windowGatherOff', x <= currSettingLength - 1 ? 'active' : 'disabled'];

	if (!s.spireAssault) {
		classNames.push(!vals.autoLevel ? 'windowLevelOn' : 'windowLevelOff');
	}

	if (s.spireAssault) {
		classNames.push(['Clear Level', 'Level Ring'].includes(vals.settingType) ? `windowClearOn` : `windowClearOff`);
		classNames.push(['Level Equipment', 'Level Ring', 'Level Bonus'].includes(vals.settingType) ? `windowLevelOn` : `windowLevelOff`);

		classNames.push(['Clear Level', 'Level Equipment', 'Level Ring'].includes(vals.settingType) ? `windowItemOn` : `windowItemOff`);
		classNames.push(vals.settingType === 'Level Bonus' ? `windowBonusItemOn` : `windowBonusItemOff`);
		classNames.push(vals.settingType === 'Buy One Timer' ? `windowOneTimerItemOn` : `windowOneTimerItemOff`);
	}

	if (s.hdFarm) {
		classNames.push(vals.hdType === 'maplevel' ? 'windowMapLevelOff' : 'windowMapLevelOn');
	}

	if (s.voidMap) {
		classNames.push(vals.hdType === 'disabled' ? 'windowHDTypeDisabledOn' : 'windowHDTypeDisabledOff');
		classNames.push(vals.hdType2 === 'disabled' ? 'windowHDTypeDisabled2On' : 'windowHDTypeDisabled2Off');
	}

	if (s.runType) {
		classNames.push(vals.runType === 'One Off' ? `windowChallengeOneOffOn${varPrefix}` : `windowChallengeOneOffOff${varPrefix}`);
		classNames.push(vals.runType === 'C3' ? `windowChallenge3On${varPrefix}` : `windowChallenge3Off${varPrefix}`);
		classNames.push(vals.runType === 'Filler' ? `windowChallengeOn${varPrefix}` : `windowChallengeOff${varPrefix}`);
	}

	const className = classNames.join(' ');

	if (s.golden) {
		elements.push({ name: 'golden', class: `windowAmtAutoGolden`, title: `<input value='${vals.goldenNumber}' type='number' id='windowWorld${x}'/>` });
		elements.push({ name: 'golden2', class: `windowTypeAutoGolden`, title: `<select value='${vals.goldentype}' id='windowGoldenType${x}' onchange='_mapSettingsUpdatePreset(${x})'>${dropdowns.goldenType}</select>` });
	}

	if (s.hdFarm) {
		elements.push({ name: 'hdBase', class: `windowHDBase`, title: `<div style='text-align: center; font-size: 0.6vw;'>${vals.hdType === 'maplevel' ? 'Map Level' : ''}</div><input value='${vals.hdBase}' type='number' id='windowRepeat${x}'/>` });
		elements.push({ name: 'hdMult', class: `windowHDMult`, title: `<input value='${vals.hdMult}' type='number' id='windowHDMult${x}'/>` });
		elements.push({ name: 'hdType', class: `windowHDType`, title: `<select value='${vals.hdType}' id='windowHDType${x}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'>${dropdowns.hdType}</select>` });
		elements.push({ name: 'mapCap', class: `windowMapCap`, title: `<input value='${vals.mapCap}' type='number' id='windowMapCap${x}'/>` });
	}

	if (s.voidMap) {
		elements.push({ name: 'hdType', class: `windowHDTypeVoidMap`, title: `<select value='${vals.hdType}' id='windowHDTypeVoidMap${x}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'>${dropdowns.hdType}</select>` });
		elements.push({ name: 'hdRatio', class: `windowVoidHDRatio`, title: `<input value='${vals.hdRatio}' type='number' id='windowHDRatio${x}'/>` });
		elements.push({ name: 'hdType2', class: `windowHDTypeVoidMap2`, title: `<select value='${vals.hdType2}' id='windowHDTypeVoidMap2${x}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'>${dropdowns.hdType2}</select>` });
		elements.push({ name: 'voidHDRatio', class: `windowVoidHDRatio2`, title: `<input value='${vals.voidHDRatio}' type='number' id='windowVoidHDRatio${x}'/>` });
		elements.push({ name: 'portalAfter', class: `windowPortalAfter`, title: `${buildNiceCheckbox('windowPortalAfter' + x, null, vals.portalAfter)}`, style: 'text-align: center;' });
	}

	if (s.boneShrine) {
		elements.push({ name: 'boneamount', class: `windowBoneAmount`, title: `<input value='${vals.boneamount}' type='number' id='windowBoneAmount${x}'/>` });
		elements.push({ name: 'bonebelow', class: `windowBoneBelow`, title: `<input value='${vals.bonebelow}' type='number' id='windowBoneBelow${x}'/>` });
		elements.push({ name: 'gather', class: `windowBoneGather`, title: `<select value='${vals.gather}' id='windowBoneGather${x}'>${dropdowns.gather}</select>` });
	}

	if (s.mapBonus) {
		elements.push({ name: 'hdRatio', class: `windowHDRatio${varPrefix}`, title: `<input value='${vals.hdRatio}' type='value' id='windowHDRatio${x}'/>` });
		elements.push({ name: 'repeat', class: `windowMapStacks`, title: `<input value='${vals.repeat}' type='number' id='windowRepeat${x}'/>` });
	}

	if (s.mapFarm) {
		elements.push({ name: 'repeat', class: `windowRepeat${varPrefix}`, title: `<input value='${vals.repeat}' type='value' id='windowRepeat${x}'/>` });
		elements.push({ name: 'hdRatio', class: `windowHDRatio${varPrefix}`, title: `<input value='${vals.hdRatio}' type='value' id='windowHDRatio${x}'/>` });
	}

	if (s.raiding) {
		elements.push({ name: 'raidingzone', class: `windowRaidingZone${varPrefix}`, title: `<select value='${vals.raidingzone}' id='windowRaidingZone${x}'>${dropdowns.mapLevel}</select>` });
		elements.push({ name: 'raidingDropdown', class: `windowRaidingDropdown`, title: `<select value='${vals.raidingDropdown}' id='windowRaidingDropdown${x}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'>${dropdowns.raidingTypes}</select>` });
		elements.push({ name: 'incrementMaps', class: `windowIncrementMaps`, title: `${buildNiceCheckbox('windowIncrementMapsDefault' + x, null, vals.incrementMaps)}`, style: 'text-align: center;' });
	}

	if (s.bionic) {
		elements.push({ name: 'raidingzone', class: `windowRaidingZone${varPrefix}`, title: `<input value='${vals.raidingzone}' type='number' id='windowRaidingZone${x}'/>` });
	}

	if (s.worshipperFarm) {
		elements.push({ name: 'worshipper', class: `windowWorshipper`, title: `<input value='${vals.worshipper}' type='number' id='windowWorshipper${x}'/>` });
	}

	if (s.tributeFarm) {
		elements.push({ name: 'tributes', class: `windowTributes`, title: `<div style='text-align: center; font-size: 0.6vw;'>${vals.mapType === 'Map Count' ? 'Max Maps' : ''}</div><input value='${vals.tributes}' type='number' id='windowTributes${x}'/>` });
		elements.push({ name: 'mets', class: `windowMets`, title: `<div style='text-align: center; font-size: 0.6vw;'>${vals.mapType === 'Map Count' ? 'Max Maps' : ''}</div><input value='${vals.mets}' type='number' id='windowMets${x}'/>` });
		elements.push({ name: 'buildings', class: `windowBuildings`, title: `${buildNiceCheckbox('windowBuildings' + x, null, vals.buildings)}`, style: 'text-align: center;' });
	}

	if (s.smithyFarm) {
		elements.push({ name: 'repeat', class: `windowSmithies`, title: `<div style='text-align: center; font-size: 0.6vw;'>${vals.mapType === 'Map Count' ? 'Max Maps' : ''}</div><input value='${vals.repeat}' type='number' id='windowRepeat${x}'/>` });
		elements.push({ name: 'meltingPoint', class: `windowMeltingPoint`, title: `${buildNiceCheckbox('windowMeltingPoint' + x, null, vals.meltingPoint)}`, style: 'text-align: center;' });
	}

	if (s.toxicity) {
		elements.push({ name: 'repeat', class: `windowRepeat${varPrefix}`, title: `<input value='${vals.repeat}' type='value' id='windowRepeat${x}'/>` });
	}

	if (s.quagmire) {
		elements.push({ name: 'bogs', class: `windowBogs`, title: `<input value='${vals.bogs}' type='number' id='windowBogs${x}'/>` });
	}

	if (s.archaeology) {
		elements.push({ name: 'relics', class: `windowRelics${varPrefix}`, title: `<input value='${vals.relics}' type='value' id='windowRelics${x}'/>` });
		elements.push({ name: 'mapCap', class: `windowMapCap`, title: `<input value='${vals.mapCap}' type='number' id='windowMapCap${x}'/>` });
	}

	if (s.insanity) {
		elements.push({ name: 'insanity', class: `windowInsanity`, title: `<input value='${vals.insanity}' type='number' id='windowInsanity${x}'/>` });
		elements.push({ name: 'destack', class: `windowBuildings`, title: `${buildNiceCheckbox('windowBuildings' + x, null, vals.destack)}`, style: 'text-align: center;' });
	}

	if (s.alchemy) {
		elements.push({ name: 'potion', class: `windowPotionType`, title: `<select value='${vals.potionstype}' id='windowPotionType${x}' onchange='_mapSettingsUpdatePreset(${x})'>${dropdowns.potionTypes}</select>` });
		elements.push({ name: 'potion2', class: `windowPotionNumber`, title: `<div style='text-align: center; font-size: 0.6vw;'>${vals.mapType === 'Map Count' ? 'Max Maps' : ''}</div><input value='${vals.potionsnumber}' type='number' id='windowPotionNumber${x}'/>` });
	}

	if (s.hypothermia) {
		elements.push({ name: 'bonfire', class: `windowBonfire`, title: `<input value='${vals.bonfire}' type='number' id='windowBonfire${x}'/>` });
	}

	if (s.profile) {
		elements.push({ name: 'profileName', class: `windowNameProfiles`, title: `<input value='${vals.profileName}' type='text' id='windowNameProfiles${x}'/>` });
		elements.push({ name: 'load', class: `windowLoadProfiles`, title: `<button style='display: inline-block; width: auto;' onclick='_displayImportAutoTrimpsProfile("${LZString.compressToBase64(vals.settingString)}", "${vals.profileName}")'>Load Profile</button>`, style: 'text-align: center; white-space: nowrap; margin-left: 5px' });
		elements.push({ name: 'settingString', class: `windowSettingStringProfiles`, title: `<input value='${vals.settingString}' type='text' id='windowSettingStringProfiles${x}' readonly/>` });
		elements.push({ name: 'overwrite', class: `windowOverwriteProfiles`, title: `${buildNiceCheckbox('windowOverwriteProfiles' + x, null, vals.overwrite)}`, style: 'text-align: center;' });
	}

	/* misc settings that have multiple categories */
	if (!s.profile) {
		elements.push({ name: 'active', class: `windowActive${varPrefix}`, title: buildNiceCheckbox('windowActive' + x, null, vals.active), style: 'text-align: center;' });
		elements.push({ name: 'priority', class: `windowPriority${varPrefix}`, title: `<input value='${vals.priority}' type='number' id='windowPriority${x}'/>` });
	}

	if (!s.golden && !s.profile && !s.spireAssault) {
		elements.push({ name: 'world', class: `windowWorld${varPrefix}`, title: `<input value='${vals.world}' type='number' id='windowWorld${x}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'/>`, style: backgroundStyle });
		if (!s.desolation) elements.push({ name: 'cell', class: `windowCell${varPrefix}`, title: `<input value='${vals.cell}' type='number' id='windowCell${x}'/>` });
	}

	if (s.endZone) {
		elements.push({ name: 'endzone', class: `windowEndZone${varPrefix}`, title: `<input value='${vals.endzone}' type='number' id='windowEndZone${x}'/>` });
	}

	if (s.mapLevel) {
		elements.push({ name: 'autoLevel', class: `windowAutoLevel${varPrefix}`, title: buildNiceCheckboxAutoLevel('windowAutoLevel' + x, null, vals.autoLevel, x, varPrefix), style: 'text-align: center; padding-left: 5px;' });
		elements.push({ name: 'level', class: `windowLevel windowLevel${varPrefix}`, title: `<input value='${vals.level}' type='number' id='windowLevel${x}'/>` });
	}

	if (s.mapType) {
		elements.push({ name: 'mapType', class: `windowMapTypeDropdown${varPrefix}`, title: `<select value='${vals.mapType}' id='windowMapTypeDropdown${x}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'>${dropdowns.mapType}</select>` });
	}

	if (s.jobRatio) {
		elements.push({ name: 'jobratio', class: `windowJobRatio${varPrefix}`, title: `<input value='${vals.jobratio}' type='value' id='windowJobRatio${x}'/>` });
	}

	if (s.special) {
		elements.push({ name: 'special', class: `windowSpecial${varPrefix}`, title: `<select value='${vals.special}' id='windowSpecial${x}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'>${dropdowns.special}</select>` });
		elements.push({ name: 'gather', class: `windowGather`, title: `<div style='text-align: center; font-size: 0.6vw;'>Gather</div><select value='${vals.gather}' id='windowGather${x}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'>${dropdowns.gather}</select>` });
	}

	if (s.repeatEvery) {
		elements.push({ name: 'repeatevery', class: `windowRepeatEvery${varPrefix}`, title: `<input value='${vals.repeatevery}' type='number' id='windowRepeatEvery${x}'/>` });
	}

	if (s.prestigeGoal) {
		elements.push({ name: 'prestigeGoal', class: `windowPrestigeGoal${varPrefix}`, title: `<select value='${vals.prestigeGoal}' id='windowPrestigeGoal${x}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'>${dropdowns.prestigeGoal}</select>` });
	}

	if (s.runType) {
		elements.push({ name: 'runType', class: `windowRunType${varPrefix}`, title: `<select value='${vals.runType}' id='windowRunType${x}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'>${dropdowns.runType}</select>` });
		elements.push({ name: 'challenge', class: `windowChallenge${varPrefix}`, title: `<div style='text-align: center; font-size: 0.6vw;'>Challenge</div><select value='${vals.challenge}' id='windowChallenge${x}'>${dropdowns.challenge}</select>` });
		elements.push({ name: 'challenge3', class: `windowChallenge3${varPrefix}`, title: `<div style='text-align: center; font-size: 0.6vw;'>Challenge${atConfig.settingUniverse + 1}</div><select value='${vals.challenge3}' id='windowChallenge3${x}'>${dropdowns.c2}</select>` });
		elements.push({ name: 'challengeOneOff', class: `windowChallengeOneOff${varPrefix}`, title: `<div style='text-align: center; font-size: 0.6vw;'>One Offs</div><select value='${vals.windowChallengeOneOff}' id='windowChallengeOneOff${x}'>${dropdowns.oneOff}</select>` });
	}

	if (s.atlantrimp) {
		elements.push({ name: 'atlantrimp', class: `windowAtlantrimp`, title: `${buildNiceCheckbox('windowAtlantrimp' + x, null, vals.atlantrimp)}`, style: 'text-align: center;' });
	}

	if (s.spireAssault) {
		elements.push({ name: 'world', class: `windowWorld${varPrefix}`, title: `<input value='${vals.world}' type='number' id='windowWorld${x}'/>` });
		elements.push({ name: 'preset', class: `windowPreset${varPrefix}`, title: `<select value='${vals.preset}' id='windowPreset${x}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'>${dropdowns.spireAssaultPresets}</select>` });
		elements.push({ name: 'settingType', class: `windowSettingType${varPrefix}`, title: `<select value='${vals.settingType}' id='windowSettingType${x}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'>${dropdowns.spireAssaultItemTypes}</select>` });

		elements.push({ name: 'item', class: `windowClear windowItem${varPrefix}`, title: `<select value='${vals.item}' id='windowItem${x}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'>${dropdowns.spireAssaultItems}</select>` });
		elements.push({ name: 'bonusItem', class: `windowClear windowBonusItem${varPrefix}`, title: `<select value='${vals.bonusItem}' id='windowBonusItem${x}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'>${dropdowns.spireAssaultBonuses}</select>` });
		elements.push({ name: 'oneTimerItem', class: `windowClear windowOneTimerItem${varPrefix}`, title: `<select value='${vals.oneTimerItem}' id='windowOneTimerItem${x}' onchange='_mapSettingsUpdatePreset("${x}","${varPrefix}")'>${dropdowns.spireAssaultOneTimers}</select>` });

		elements.push({ name: 'levelSA', class: `windowLevel windowItemLevel${varPrefix}`, title: `<input value='${vals.levelSA}' type='number' id='windowLevel${x}'/>` });
	}

	const sortedElements = new Array(settingOrder.length).fill(null);
	elements.forEach((item) => {
		const index = settingOrder.indexOf(item.name);
		if (index !== -1) {
			sortedElements[index] = item;
		}
	});

	let tooltipText = `<div id='windowRow${x}' class='row windowRow ${className}'${style}>`;
	tooltipText += `<div class='windowDelete' onclick='_mapSettingsRemoveRow("${x}", ${JSON.stringify(s).replace(/"/g, '&quot;')})'><span class='icomoon icon-cross'></span></div>`;

	sortedElements.forEach((item) => {
		if (item === null) return;
		tooltipText += `<div class='windowDisplay ${item.class}'${item.style ? ` style='${item.style}'` : ''}>${item.title}</div>`;
	});

	tooltipText += '</div>';

	if (document.getElementById('tooltipDiv').classList.contains('tooltipExtraLg')) _mapSettingsUpdatePreset(x, varPrefix);
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

function settingsWindowSave(titleText, varPrefix, activeSettings, reopen) {
	const s = JSON.parse(activeSettings);
	const setting = [];
	const defaultSetting = {};
	const profileData = {};

	/* default settings */
	if (!s.golden && !s.profile) {
		defaultSetting.active = readNiceCheckbox(document.getElementById('windowActiveDefault'));

		if (s.worshipperFarm) {
			defaultSetting.shipSkipEnabled = readNiceCheckbox(document.getElementById('windowSkipShipEnabled'));
			defaultSetting.shipskip = parseInt(document.getElementById('windowRepeatDefault').value, 10);
		}

		if (s.mapBonus) {
			defaultSetting.special = document.getElementById('windowSpecial').value;

			if (defaultSetting.special === 'hc' || defaultSetting.special === 'lc') defaultSetting.gather = document.getElementById('windowGather').value;
			else defaultSetting.gather = null;
		}

		if (s.boneShrine) {
			defaultSetting.autoBone = readNiceCheckbox(document.getElementById('windowAutoBone'));
			defaultSetting.bonebelow = parseInt(document.getElementById('windowBoneBelowDefault').value, 10);
			defaultSetting.gather = document.getElementById('windowBoneGatherDefault').value;
			defaultSetting.world = parseInt(document.getElementById('windowBoneWorld').value, 10);
		}

		if (s.mapBonus || s.voidMap || s.boneShrine || s.hdFarm) {
			defaultSetting.jobratio = document.getElementById('windowJobRatioDefault').value;
		}

		if (s.alchemy) {
			defaultSetting.voidPurchase = readNiceCheckbox(document.getElementById('windowVoidPurchase'));
		}

		if (s.quagmire) {
			defaultSetting.abandonZone = parseInt(document.getElementById('abandonZone').value);
		}

		if (s.voidMap) {
			defaultSetting.maxTenacity = readNiceCheckbox(document.getElementById('windowMaxTenacity'));
			if (game.permaBoneBonuses.boosts.owned > 0) defaultSetting.boneCharge = readNiceCheckbox(document.getElementById('windowBoneCharge'));
			defaultSetting.voidFarm = readNiceCheckbox(document.getElementById('windowVoidFarm'));
			defaultSetting.hitsSurvived = document.getElementById('windowHitsSurvived').value;
			defaultSetting.hdRatio = document.getElementById('windowHDRatio').value;
			defaultSetting.mapCap = parseFloat(document.getElementById('windowMapCap').value, 10);
		}

		if (s.hypothermia) {
			defaultSetting.frozencastle = document.getElementById('windowFrozenCastleDefault').value.split(',');
			defaultSetting.autostorage = readNiceCheckbox(document.getElementById('windowStorageDefault'));
			defaultSetting.packrat = readNiceCheckbox(document.getElementById('windowPackratDefault'));
		}

		if (s.raiding) {
			defaultSetting.recycle = readNiceCheckbox(document.getElementById('windowRecycleDefault'));
		}

		if (s.hdFarm) {
			defaultSetting.mapCap = parseFloat(document.getElementById('mapCap').value, 10);
		}
	}

	/* row settings */
	let counter = 1;
	let error = '';
	for (let x = 0; x < s.maxSettings; x++) {
		const thisSetting = { row: counter };
		const parent = document.getElementById('windowRow' + x);
		if (parent.style.display === 'none') continue;
		counter++;

		if (s.golden) {
			thisSetting.golden = document.getElementById('windowGoldenType' + x).value;
			thisSetting.golden += parseInt(document.getElementById('windowWorld' + x).value, 10);
		}

		if (s.hdFarm) {
			thisSetting.hdBase = parseFloat(document.getElementById('windowRepeat' + x).value, 10);
			thisSetting.hdMult = parseFloat(document.getElementById('windowHDMult' + x).value, 10);
			thisSetting.hdType = document.getElementById('windowHDType' + x).value;
			thisSetting.mapCap = parseInt(document.getElementById('windowMapCap' + x).value, 10);
		}

		if (s.voidMap) {
			thisSetting.hdType = document.getElementById('windowHDTypeVoidMap' + x).value;
			thisSetting.hdRatio = parseFloat(document.getElementById('windowHDRatio' + x).value, 10);
			thisSetting.hdType2 = document.getElementById('windowHDTypeVoidMap2' + x).value;
			thisSetting.voidHDRatio = parseFloat(document.getElementById('windowVoidHDRatio' + x).value, 10);
			thisSetting.portalAfter = readNiceCheckbox(document.getElementById('windowPortalAfter' + x));
		}

		if (s.boneShrine) {
			thisSetting.boneamount = parseInt(document.getElementById('windowBoneAmount' + x).value, 10);
			thisSetting.bonebelow = parseInt(document.getElementById('windowBoneBelow' + x).value, 10);
			thisSetting.gather = document.getElementById('windowBoneGather' + x).value;
		}

		if (s.mapBonus) {
			thisSetting.repeat = parseInt(document.getElementById('windowRepeat' + x).value, 10);
			thisSetting.hdRatio = document.getElementById('windowHDRatio' + x).value;
		}

		if (s.mapFarm) {
			if (thisSetting.mapType === 'Map Count') thisSetting.repeat = parseFloat(document.getElementById('windowRepeat' + x).value, 10);
			if (thisSetting.mapType !== 'Map Count') thisSetting.repeat = document.getElementById('windowRepeat' + x).value;
			thisSetting.hdRatio = document.getElementById('windowHDRatio' + x).value;
		}

		if (s.raiding) {
			thisSetting.raidingzone = document.getElementById('windowRaidingZone' + x).value;
			thisSetting.raidingDropdown = document.getElementById('windowRaidingDropdown' + x).value;
			thisSetting.incrementMaps = readNiceCheckbox(document.getElementById('windowIncrementMapsDefault' + x));
		}

		if (s.bionic) {
			thisSetting.raidingzone = parseInt(document.getElementById('windowRaidingZone' + x).value, 10);
		}

		if (s.worshipperFarm) {
			thisSetting.worshipper = parseInt(document.getElementById('windowWorshipper' + x).value, 10);
		}

		if (s.tributeFarm) {
			thisSetting.tributes = parseInt(document.getElementById('windowTributes' + x).value, 10);
			thisSetting.mets = parseInt(document.getElementById('windowMets' + x).value, 10);
			thisSetting.buildings = readNiceCheckbox(document.getElementById('windowBuildings' + x));
		}

		if (s.smithyFarm) {
			thisSetting.repeat = parseInt(document.getElementById('windowRepeat' + x).value, 10);
			thisSetting.meltingPoint = readNiceCheckbox(document.getElementById('windowMeltingPoint' + x));
		}

		if (s.toxicity) {
			thisSetting.repeat = document.getElementById('windowRepeat' + x).value;
		}

		if (s.quagmire) {
			thisSetting.bogs = parseInt(document.getElementById('windowBogs' + x).value, 10);
		}

		if (s.archaeology) {
			thisSetting.relics = document.getElementById('windowRelics' + x).value;
			thisSetting.mapCap = parseInt(document.getElementById('windowMapCap' + x).value, 10);
		}

		if (s.insanity) {
			thisSetting.insanity = parseInt(document.getElementById('windowInsanity' + x).value, 10);
			thisSetting.destack = readNiceCheckbox(document.getElementById('windowBuildings' + x));
		}

		if (s.alchemy) {
			thisSetting.potion = document.getElementById('windowPotionType' + x).value;
			thisSetting.potion += parseInt(document.getElementById('windowPotionNumber' + x).value, 10);
		}

		if (s.hypothermia) {
			thisSetting.bonfire = parseInt(document.getElementById('windowBonfire' + x).value, 10);
		}

		if (s.profile) {
			const profileName = document.getElementById('windowNameProfiles' + x).value;
			thisSetting.profileName = profileName;
			const overwriteData = readNiceCheckbox(document.getElementById('windowOverwriteProfiles' + x));
			profileData[profileName] = overwriteData ? serializeSettings() : document.getElementById('windowSettingStringProfiles' + x).value;
		}

		/* Misc Settings that have multiple categories */
		if (!s.profile) {
			thisSetting.active = readNiceCheckbox(document.getElementById('windowActive' + x));
			thisSetting.priority = parseInt(document.getElementById('windowPriority' + x).value, 10);
		}

		if (!s.golden && !s.profile && !s.spireAssault) {
			thisSetting.world = parseInt(document.getElementById('windowWorld' + x).value, 10);
			if (!s.desolation) {
				thisSetting.cell = parseInt(document.getElementById('windowCell' + x).value, 10);
				thisSetting.cell = Math.min(Math.max(thisSetting.cell, 1), 100);
			}
		}

		if (s.endZone) {
			thisSetting.endzone = parseInt(document.getElementById('windowEndZone' + x).value, 10);
		}

		if (s.mapLevel) {
			thisSetting.autoLevel = readNiceCheckbox(document.getElementById('windowAutoLevel' + x));
			thisSetting.level = Math.min(parseInt(document.getElementById('windowLevel' + x).value, 10), 10);
		}

		if (s.mapType) {
			thisSetting.mapType = document.getElementById('windowMapTypeDropdown' + x).value;
		}

		if (s.jobRatio) {
			thisSetting.jobratio = document.getElementById('windowJobRatio' + x).value;
		}

		if (s.repeatEvery) {
			thisSetting.repeatevery = parseInt(document.getElementById('windowRepeatEvery' + x).value, 10);
		}

		if (s.special) {
			thisSetting.special = document.getElementById('windowSpecial' + x).value;
			if (thisSetting.special === 'hc' || thisSetting.special === 'lc') {
				thisSetting.gather = document.getElementById('windowGather' + x).value;
			} else {
				thisSetting.gather = null;
			}
		}

		if (s.prestigeGoal) {
			thisSetting.prestigeGoal = document.getElementById('windowPrestigeGoal' + x).value;
		}

		if (s.runType) {
			thisSetting.runType = document.getElementById('windowRunType' + x).value;
			thisSetting.challenge = thisSetting.runType === 'Filler' ? document.getElementById('windowChallenge' + x).value : null;
			thisSetting.challenge3 = thisSetting.runType === 'C3' ? document.getElementById('windowChallenge3' + x).value : null;
			thisSetting.challengeOneOff = thisSetting.runType === 'One Off' ? document.getElementById('windowChallengeOneOff' + x).value : null;
		}

		if (s.atlantrimp) {
			thisSetting.atlantrimp = readNiceCheckbox(document.getElementById('windowAtlantrimp' + x));
		}

		if (s.spireAssault) {
			thisSetting.world = parseInt(document.getElementById('windowWorld' + x).value, 10);
			thisSetting.preset = document.getElementById('windowPreset' + x).value;
			thisSetting.settingType = document.getElementById('windowSettingType' + x).value;
			thisSetting.item = document.getElementById('windowItem' + x).value;
			thisSetting.bonusItem = document.getElementById('windowBonusItem' + x).value;
			thisSetting.oneTimerItem = document.getElementById('windowOneTimerItem' + x).value;
			thisSetting.levelSA = document.getElementById('windowLevel' + x).value;
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

		if (+thisSetting.endzone < +thisSetting.world) thisSetting.endzone = thisSetting.world;
		if (+thisSetting.worshipper > game.jobs.Worshipper.max) worshipper = game.jobs.Worshipper.max;
		if (+thisSetting.hdRatio < 0) thisSetting.hdRatio = 0;
		if (+thisSetting.voidHDRatio < 0) thisSetting.voidHDRatio = 0;
		if (+thisSetting.hdRatio < 0) thisSetting.hdRatio = 0;

		if (+thisSetting.repeat < 0 && +thisSetting.repeat !== -1) thisSetting.repeat = 0;
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

		if (!defaultSetting.active) debug(`${titleText} has been saved but is disabled. To enable it tick the 'Active' box in the top left of the window.`, 'mazSettings');
	}

	document.getElementById('tooltipDiv').style.overflowY = '';

	const elem = document.getElementById('tooltipDiv');
	swapClass(document.getElementById('tooltipDiv').classList[0], 'tooltipExtraNone', elem);
	cancelTooltip(true);
	if (reopen) importExportTooltip('mapSettings', titleText);

	/* disable void map global variables when saving void map settings to ensure we aren't running voids at the wrong zone after updating. */
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

function mapSettingsHelpWindow(titleText, activeSettings) {
	const s = JSON.parse(activeSettings);
	const radonSetting = atConfig.settingUniverse === 2;
	const trimple = atConfig.settingUniverse === 1 ? 'Trimple' : 'Atlantrimp';
	const trimpleName = atConfig.settingUniverse === 1 ? 'Trimple of Doom' : 'Atlantrimp';
	const hze = game.stats.highestLevel.valueTotal();
	const hzeU2 = game.stats.highestRadLevel.valueTotal();
	let mazHelp = '';

	/* 
		brief overview of what the setting does as it's kinda different from other settings. 
	*/
	if (s.desolation) {
		mazHelp += `<p>This setting is sligtly different from others. It abuses a bug in the game where you can scum prestiges through a <b>Blacksmithery 3</b> bug. <b>This definitely shouldn't exist so be aware this is exploiting unintentional game mechanics.</b></p>`;
		mazHelp += `<li class="indent">By exploiting this bug we get the prestiges from <b>Blacksmithery 3</b> when entering the zone and then the prestiges from the equivalent of doing a +10 map to get those prestiges significantly easier than we should be able to.</li>`;
		mazHelp += `<li class="indent">For a more detailed explanation of how this setting works please see the <a href='https://discord.com/channels/371177798305447938/1075840564534202398/1087668293797679194' target='_blank'>guide in the <b>[Guide] Desolation</b> channel on the Trimps Discord.</a></li>`;
		mazHelp += `<li class="indent">It will create a +1 map on cell 100 of the zone <b>PRIOR</b> to the start zone you set when the improbability is less than 5 gamma bursts from death.</li>`;
		mazHelp += `<li class="indent">It then clears 3 cells before going back into the world and finishing off the improbability and clearing the map on the next zone to take advantage of the bug.</li>`;
	}

	if (s.mapBonus) {
		mazHelp += `<p><b>Map Bonus Settings</b> works by slightly differently from other mapping settings:</p>`;
		mazHelp += `<li class="indent">It finds the highest priority value line that's equal to or greater than your current world zone, and uses that lines settings when it runs.</li>`;
		mazHelp += `<li class="indent">Lines repeat every zone from when they start until they reach their <b>End Zone</b> input.</li>`;
	}

	if (s.voidMap) {
		mazHelp += `<p><b>Void Map Settings</b> works by using <b>Start Zone</b> as the lower bound zone to run voids on and <b>End Zone</b> as the upper bound.</p>`;
		mazHelp += `<li class="indent">It has dropdown options to allow fine-tuning for when a line should be run.</li>`;
		mazHelp += `<li class="indent">If you reach the <b>End Zone</b> input of a line it will run regardless of dropdown inputs.</li>`;
	}

	if (s.smithyFarm) {
		mazHelp += `<p><b>Smithy Farm</b> will farm resources in the following order <b>Metal > Wood > Gems</b>. This cannot be changed.</p>`;
	}

	if (s.archaeology) {
		mazHelp += `<p><b>Archaeology Farm</b> requires you to have a scientist ratio set in the <b>Job Ratio</b> input field for it to run properly.</p>`;
	}

	if (s.insanity) {
		mazHelp += `<p><b>Insanity Farm</b> will disable unique & lower than world level maps when you don't have a destack zone line setup.</p>`;
	}

	/* 
		top row information 
	*/
	if (!s.golden && !s.profile) {
		if (s.desolation || s.mapBonus || s.voidMap) mazHelp += `<br>`;
		mazHelp += `The top row of this settings window consists of toggles and inputs which add extra functions to the setting itself:<br></br><ul>`;
		mazHelp += `<li><b>Enabled</b> - A toggle to allow this setting to run.</li>`;

		if (s.raiding && !s.bionic) {
			mazHelp += `<li><b>Recycle Maps</b> - When enabled this will recycle maps this setting creates after it finishes raiding.</li>`;
			mazHelp += `<li><b>Increment Maps</b> - Swaps from running a single map to running multiple maps, starting from the lowest map level you can obtain prestiges.</li>`;
			mazHelp += `<li class="indent">This can help if additional stats will allow you to raid your target zone but it will use more fragments.</li>`;
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
			mazHelp += `<li class="indent">If set to <b>-1</b> it will repeat an Infinite amount of times.</li>`;
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
			mazHelp += `<li class="indent">If set to <b>-1</b> it will repeat an Infinite amount of times.</li>`;
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

	if (!s.golden && !s.desolation && !s.profile && !s.spireAssault) {
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
		mazHelp += `<li><b>Dropdowns</b> - Will only run the line when one or more of the dropdown options aren't met <b>OR</b> you are at the <b>End Zone</b> input for that line.</li>`;
		mazHelp += `<li class="indent"><b>HD Ratio</b> dropdowns will check to see if the input value is higher than your selected <b>HD Ratio</b> value.</li>`;
		mazHelp += `<li class="indent"><b>Hits Survived</b> dropdowns will check to see if the input value is lower than your selected <b>Hits Survived</b> value.</li>`;
		mazHelp += `<li class="indent"><b>Disabled</b> this dropdown is used to disable checking this dropdown. Can be used to only check against one <b>HD Ratio</b> or <b>Hits Survived</b> condition.</li>`;
		mazHelp += `<li class="indent">Your current values for each of the dropdown options can be seen in either the <b>Auto Maps Status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</li>`;
		mazHelp += `<li><b>Portal After</b> - Will run Auto Portal immediately after this line has run.`;
		if (!radonSetting) mazHelp += `<br>When enabled and farming for, or running Void Maps this will buy as many nurseries as you can afford based upon your spending percentage in the AT AutoStructure settings.</li>`;
		mazHelp += `</li>`;
	}

	if (s.mapFarm) {
		mazHelp += `<li><b>Farm Type</b> The different ways that the script can determine how many maps are run.</li>`;
		mazHelp += `<li class="indent">All of the dropdown settings other than <b>Map Count</b> use a DD:HH:MM:SS input and will break if that format isn't followed.</li>`;
		mazHelp += `<li class="indent"><b>Map Count</b> - Will run maps until it has reached the specified repeat counter.</li>`;
		mazHelp += `<li class="indent"><b>Zone Time</b> - Runs maps until the zone time surpasses the time set in repeat counter.</li>`;
		mazHelp += `<li class="indent"><b>Farm Time</b> - Tracks when it starts farming then run maps until it reaches that timer.</li>`;
		mazHelp += `<li class="indent"><b>Portal Time</b> - Runs maps until the portal time surpasses the time set in repeat counter.</li>`;
		mazHelp += `<li class="indent"><b>Daily Reset</b> - Runs maps until the daily reset time is below the time set in repeat counter.</li>`;
		mazHelp += `<li class="indent"><b>Skele Spawn</b> - Runs maps until the time since your last Skeletimp kill was this amount of time or greater.</li>`;

		mazHelp += `<li><b>Map Repeats</b> - The amount of maps you would like to run during this line.</li>`;
		mazHelp += `<li class="indent">If set to <b>-1</b> it will repeat an Infinite amount of times.</li>`;
		mazHelp += `<li><b>Above X HD Ratio</b> - This line will only run when your <b>World HD Ratio</b> is above this value.</li>`;
		mazHelp += `<li class="indent">Requires an input above <b>0</b> for this to be checked.</li>`;
		mazHelp += `<li class="indent">Your current <b>World HD Ratio</b> can be seen in either the <b>Auto Maps Status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</li>`;
		mazHelp += `<li><b>Run ${trimple}</b> - Will run the ${trimpleName} unique map (if unlocked) once this line has been completed.</li>`;
		mazHelp += `<li class="indent">While lines with this enabled are running <b>AT Auto Equip</b> won't purchase any equipment until ${trimpleName} has been run so that there are no wasted resources.</li>`;
		mazHelp += `<li class="indent">If ${trimpleName} has been run then any line with this enabled won't be run.</li>`;
	}

	if (s.mapBonus) {
		mazHelp += '<li><b>Map Stacks</b> - The amount of map bonus stacks to obtain when this line runs.</li>';
		mazHelp += `<li><b>Above X HD Ratio</b> - This line will only run when your <b>World HD Ratio</b> is above this value.</li>`;
		mazHelp += `<li class="indent">Requires an input above <b>0</b> for this to be checked.</li>`;
		mazHelp += `<li class="indent">Your current <b>World HD Ratio</b> can be seen in either the <b>Auto Maps Status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</li>`;
	}

	if (s.raiding || s.bionic) {
		const raidingZone = s.bionic ? 'Raiding Zone' : 'Map Level';
		mazHelp += `<li><b>${raidingZone}</b> - The ${raidingZone.split(' ')[1].toLowerCase()} you'd like to raid when this line is run.</li>`;
		if (s.bionic) mazHelp += `<li class="indent">If <b>Repeat Every</b> is set to a value above 0 then it will also raise the ${raidingZone.toLowerCase()} by (<b>worldZone-startZone</b>) everytime this line runs.</li>`;

		if (!s.bionic) {
			mazHelp += `<li><b>Frag Type</b> - The choices how for aggresively the script will spend fragments on maps.</li>`;
			mazHelp += `<li class="indent"><b>Frag</b> - General all purpose setting. Will set sliders to max and reduce when necessary to afford the maps you're trying to purchase.</li>`;
			mazHelp += `<li class="indent"><b>Frag Min</b> - Used for absolute minimum fragment costs. Will set everything but the map size to minimum and gradually reduce that if necessary to purchase maps.</li>`;
			mazHelp += `<li class="indent"><b>Frag Max</b> - This option will make sure that the map has perfect sliders and uses the <b>Prestigious</b> map special if available.</li>`;
		}

		mazHelp += `<li><b>Prestige Goal</b> - Will run maps to get this prestige if it's available on the selected ${raidingZone.toLowerCase()}.</li>`;
	}

	if (s.hdFarm) {
		mazHelp += `<li><b>Farming Type</b> - The type of Hits Survived or HD Ratio you'd like to farm towards.</li>`;
		mazHelp += `<li class="indent">If <b>Map Level</b> has been selected it will farm until Auto Level (loot) reaches that level.</li>`;
		mazHelp += `<li class="indent">Will only run Void Map lines if you have void maps in your map chamber.</li>`;

		mazHelp += `<li><b>HD Base</b> - The Hits Survived or HD Ratio value you'd like to reach.</li>`;
		mazHelp += `<li><b>HD Mult</b> - Starting from second zone this line runs, this will cause the target value (HD Base) to be calculated as HD Base * (HD Mult^(worldZone-startZone)).</li>`;
		mazHelp += `<li class="indent">If your initial zone was 100, HD Base was 10, HD Mult was 1.2, then at z101 your target would be 12, at z102 it would be 14.4 and so on.</li>`;
		mazHelp += `<li class="indent">This can help you account for zones getting harder to complete so that you can reduce wasted farming time.</li>`;

		mazHelp += `<li><b>Map Cap</b> - The maximum amount of maps you would like to run during this line.</li>`;
		mazHelp += `<li class="indent">If set to <b>-1</b> it will repeat an Infinite amount of times.</li>`;
	}

	if (s.boneShrine) {
		mazHelp += `<li><b>To use</b> - How many bone charges to use on this line.</li>`;
		mazHelp += `<li><b>Use above</b> - This stops bone charges being used when you're at or below this value.</li>`;
		mazHelp += `<li><b>Run ${trimple}</b> - Will run ${trimpleName} during this line.</li>`;
		mazHelp += `<li class="indent"><b>AT Auto Equip</b> is disabled while ${trimpleName} is running so that there are no wasted resources.</li>`;
		mazHelp += `<li class="indent">Will use your bone charges once cell 70 of the map has been reached.</b></li>`;
		mazHelp += `<li><b>Gather</b> - Which resource you'd like to gather when using bone shrine charge(s) to make use of Turkimp's resource bonus.</li>`;
	}

	if (s.tributeFarm) {
		mazHelp += `<li><b>Farm Type</b> - Has a dropdown to allow you to decide how the Tributes and Meteorologists are farmed for.</li>`;
		mazHelp += `<li class="indent"><b>Absolute</b> - This will allow you to farm to a specific amount of Tributes and Meteorologists.</li>`;
		mazHelp += `<li class="indent"><b>Map Count</b> - The script will identify how many Tributes and Meteorologists you can purchase in the max amount of maps you input and farm for that amount.</li>`;

		mazHelp += `<li><b>Tributes</b> - The amount of Tributes you want to reach during this line.</li>`;
		mazHelp += `<li class="indent">If the value is greater than your Tribute Cap setting in <b>AT Auto Structure</b> then it'll adjust it to the Tribute input whilst doing this farm.</li>`;
		mazHelp += `<li><b>Mets</b> - The amount of Meteorologists you want to reach during this line.</li>`;

		mazHelp += `<li><b>Buy Buildings</b> - Allows you to disable building purchases to reduce the amount of maps it takes to farm your specified Tribute or Meteorologist inputs.</li>`;
		mazHelp += `<li class="indent">When unselected, it will temporarily disable vanilla AutoStructure if it's enabled to remove the possibility of resources being spent there.</li>`;

		mazHelp += `<li><b>Run ${trimple}</b> - Allows it to run ${trimpleName} during this line to complete it faster.</b></li>`;
		mazHelp += `<li class="indent">Calculates when it would be more efficient to run ${trimple} or continue farming Savory Cache maps to reach your target in the fastest time possible.</li>`;
	}

	if (s.smithyFarm) {
		mazHelp += `<li><b>Farm Type</b> - Has a dropdown to allow you to decide how the smithies are farmed for.</li>`;
		mazHelp += `<li class="indent"><b>Absolute</b> - This will allow you to farm to a specific amount of smithies.</li>`;
		mazHelp += `<li class="indent"><b>Map Count</b> - The script will identify how many smithies you can purchase in the max amount of maps you input and farm for that amount.</li>`;

		mazHelp += `<li><b>Smithies</b> - Smithy count you'd like to reach during this line.</li>`;
		mazHelp += `<li class="indent">If you currently own 18 and want to reach 21 you'd enter 21.</li>`;
		mazHelp += `<li><b>Run MP</b> - Will run the Melting Point unique map (if unlocked) after this line has been run.</b></li>`;
		mazHelp += `<li class="indent">If Melting Point has been run then any line with this enabled won't be run.</li>`;
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
		mazHelp += `<li class="indent">If set to <b>-1</b> it will repeat an Infinite amount of times.</li>`;
	}
	if (s.insanity) {
		mazHelp += `<li><b>Insanity</b> - How many Insanity stack you'd like to farm up to during this line.</li>`;
		mazHelp += `<li><b>Destack</b> - Toggle to allow you to run maps that are lower than world level during Insanity.</li>`;
		mazHelp += `<li class="indent">If a destack zone is set it will allow lower than world level maps to be run from that zone onwards.</li>`;
		mazHelp += `<li class="indent">When enabled, Insanity Farm will assume you're destacking and it will aim to reduce your max Insanity to the value in the Insanity field.</li>`;
	}

	if (s.alchemy) {
		mazHelp += `<li><b>Farm Type</b> - Has a dropdown to allow you to decide how many of the selected potion are farmed for.</li>`;
		mazHelp += `<li class="indent"><b>Absolute</b> - This will allow you to farm to a specific amount of potions.</li>`;
		mazHelp += `<li class="indent"><b>Map Count</b> - The script will identify how many potions you can purchase in the max amount of maps that you input and farm for that amount.</li>`;
		mazHelp += `<li><b>Potion Type</b> - The type of potion you want to farm during this line.</li>`;
		mazHelp += `<li><b>Potion Number</b> - How many of the potion selected in <b>Potion Type</b> you'd like to farm for.</li>`;
	}

	if (s.hypothermia) {
		mazHelp += `<li><b>Bonfires</b> - How many Bonfires should be farmed to on this zone.</li>`;
		mazHelp += `<li class="indent">Uses max bonfires built, so if you have already built 14 and want another 8, then you'd input 22.</li>`;
	}

	if (s.desolation) {
		mazHelp += `<li><b>Prestige Goal</b> - The script will identify if the prestige selected here is available in the zone you have input and if so will run a map to get that prestige.</li>`;
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

function windowToggleHelp() {
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

function _mapSettingsAddRow(varPrefix) {
	const maxRows = 30;

	const rows = Array.from({ length: maxRows }, (_, x) => document.getElementById(`windowRow${x}`));
	const firstHiddenRow = rows.find((row) => row.style.display === 'none');

	if (firstHiddenRow) {
		firstHiddenRow.style.display = '';
		swapClass('disabled', 'active', firstHiddenRow);
		const row = firstHiddenRow.id.replace(/[a-zA-Z]/g, '');

		const world = document.getElementById(`windowWorld${row}`);
		if (atConfig.settingUniverse === 1 && world) {
			const natureStyle = ['unset', 'rgba(50, 150, 50, 0.75)', 'rgba(60, 75, 130, 0.75)', 'rgba(50, 50, 200, 0.75)'];
			const natureList = ['None', 'Poison', 'Wind', 'Ice'];
			const natureIndex = natureList.indexOf(getZoneEmpowerment(world.value));
			world.parentNode.style.background = natureStyle[natureIndex];
		}

		_mapSettingsUpdatePreset(row, varPrefix);

		const rows = Array.from({ length: Number(row) }, (_, x) => document.getElementById(`windowRow${x}`));
		const priorities = rows.map((row) => parseInt(document.getElementById(`windowPriority${row.id.replace(/[a-zA-Z]/g, '')}`).value, 10));
		const highestPriority = Math.max(...priorities);
		document.getElementById(`windowPriority${row}`).value = Math.max(0, highestPriority) + 1;
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

function _mapSettingsRemoveRow(index, s) {
	const elem = document.getElementById('windowRow' + index);
	if (!elem) return;

	const checkBoxSettings = ['windowActive', 'windowAtlantrimp', 'windowMeltingPoint', 'windowPortalAfter', 'windowAutoLevel', 'windowBuildings'];
	const elemChildrenIDs = _mapSettingsGetRowIDs(elem, index);
	const initialVals = _mapSettingsVals(index, s);
	const defaultVarsKey = _mapSettingsValsKeys(s);

	for (let i = 0; i < elemChildrenIDs.length; i++) {
		const id = elemChildrenIDs[i];
		const val = defaultVarsKey[id];

		if (val) {
			if (checkBoxSettings.includes(id)) {
				const checkBox = document.getElementById(id + index);
				swapClass('icon-', `icon-checkbox-${initialVals[val] ? '' : 'un'}checked`, checkBox);
				checkBox.setAttribute('data-checked', initialVals[val]);
			} else {
				if (val === 'jobratio') initialVals[val] += ',1';
				document.getElementById(id + index).value = initialVals[val];
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

function _mapSettingsUpdatePreset(index = '', varPrefix = document.getElementById('tipTitle').innerHTML.replace(/ /g, '')) {
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
	const profile = varPrefix.includes('Profile');
	const spireAssault = varPrefix.includes('SpireAssault');

	if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden) {
		if (index !== '') {
			function updateClass(runType, type, row, varPrefix, cssName) {
				const onClass = `windowChallenge${cssName}On${varPrefix}`;
				const offClass = `windowChallenge${cssName}Off${varPrefix}`;
				const newClass = `windowChallenge${cssName}${runType === type ? 'On' : 'Off'}${varPrefix}`;
				const newClass2 = `windowChallenge${cssName}${runType !== type ? 'On' : 'Off'}${varPrefix}`;

				if ((runType !== type && row.classList.contains(onClass)) || (runType === type && row.classList.contains(offClass))) {
					swapClass(newClass2, newClass, row);
				}
			}

			const runType = document.getElementById('windowRunType' + index).value;
			updateClass(runType, 'Filler', row, varPrefix, '');
			updateClass(runType, 'C3', row, varPrefix, '3');
			updateClass(runType, 'One Off', row, varPrefix, 'OneOff');
		}
	}

	if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || archaeology || insanity || alchemy || hypothermia || toxicity) {
		if (index !== '') {
			const autoLevel = document.getElementById('windowAutoLevel' + index).dataset.checked === 'true' ? 'windowLevelOff' : 'windowLevelOn';
			swapClass('windowLevel', autoLevel, row);
			document.getElementById('windowLevel' + index).disabled = document.getElementById('windowAutoLevel' + index).dataset.checked === 'true';
		}
	}

	if (spireAssault) {
		if (index !== '') {
			const settingType = document.getElementById('windowSettingType' + index).value;
			let newClass = ['Clear Level', 'Level Ring'].includes(settingType) ? 'windowClearOn' : 'windowClearOff';
			swapClass('windowClear', newClass, row);

			newClass = ['Level Equipment', 'Level Ring', 'Level Bonus'].includes(settingType) ? 'windowLevelOn' : 'windowLevelOff';
			swapClass('windowLevel', newClass, row);

			function updateClass(settingType, type, row, cssName) {
				const onClass = `window${cssName}ItemOn`;
				const offClass = `window${cssName}ItemOff`;
				const newClass = `window${cssName}Item${type.includes(settingType) ? 'On' : 'Off'}`;
				const newClass2 = `window${cssName}Item${!type.includes(settingType) ? 'On' : 'Off'}`;

				if ((!type.includes(settingType) && row.classList.contains(onClass)) || (type.includes(settingType) && row.classList.contains(offClass))) {
					swapClass(newClass2, newClass, row);
				}
			}

			updateClass(settingType, ['Clear Level', 'Level Equipment', 'Level Ring'], row, '');
			updateClass(settingType, ['Level Bonus'], row, 'Bonus');
			updateClass(settingType, ['Buy One Timer'], row, 'OneTimer');
		}
	}

	if (mapFarm || alchemy || mapBonus || insanity || desolation || toxicity) {
		if (index !== '' || mapBonus) {
			const special = document.getElementById('windowSpecial' + index).value;
			const newClass = special === 'hc' || special === 'lc' ? 'windowGatherOn' : 'windowGatherOff';
			swapClass('windowGather', newClass, row);
		}
	}

	if (hdFarm && index !== '') {
		const special = document.getElementById('windowHDType' + index).value;
		const newClass = special === 'maplevel' ? 'windowMapLevelOff' : 'windowMapLevelOn';
		swapClass('windowMapLevel', newClass, row);

		const repeatElem = document.getElementById('windowRepeat' + index).parentNode.children[0];
		const repeatText = special === 'maplevel' ? 'Map Level' : '';
		if (repeatElem.innerHTML !== repeatText) repeatElem.innerHTML = repeatText;
	}

	if (tributeFarm && index !== '') {
		const mapType = document.getElementById('windowMapTypeDropdown' + index).value;
		['windowTributes', 'windowMets'].forEach((type) => {
			const repeatElem = document.getElementById(`${type}${index}`).parentNode.children[0];
			const repeatText = mapType === 'Map Count' ? 'Max Maps' : '';
			if (repeatElem.innerHTML !== repeatText) repeatElem.innerHTML = repeatText;
		});
	}

	if (alchemy && index !== '') {
		const mapType = document.getElementById('windowMapTypeDropdown' + index).value;

		const repeatElem = document.getElementById('windowPotionNumber' + index).parentNode.children[0];
		const repeatText = mapType === 'Map Count' ? 'Max Maps' : '';
		if (repeatElem.innerHTML !== repeatText) repeatElem.innerHTML = repeatText;
	}

	if (smithyFarm && index !== '') {
		const mapType = document.getElementById('windowMapTypeDropdown' + index).value;

		const repeatElem = document.getElementById('windowRepeat' + index).parentNode.children[0];
		const repeatText = mapType === 'Map Count' ? 'Max Maps' : '';
		if (repeatElem.innerHTML !== repeatText) repeatElem.innerHTML = repeatText;
	}

	if (voidMap && index !== '') {
		const hdDropdowns = ['windowHDTypeVoidMap', 'windowHDTypeVoidMap2'];
		const hdInputs = ['windowHDRatio', 'windowVoidHDRatio'];
		const classes = ['windowHDTypeDisabled', 'windowHDTypeDisabled2'];

		hdDropdowns.forEach((dropdownId, i) => {
			const isDisabled = document.getElementById(dropdownId + index).value === 'disabled';
			const onClass = `${classes[i]}On`;
			const offClass = `${classes[i]}Off`;
			const [newClass, newClass2] = isDisabled ? [onClass, offClass] : [offClass, onClass];

			if ((isDisabled && row.classList.contains(offClass)) || (!isDisabled && row.classList.contains(onClass))) {
				swapClass(newClass2, newClass, row);
			}
			document.getElementById(hdInputs[i] + index).disabled = newClass === onClass;
		});
	}

	//Changing rows to use the colour of the Nature type that the world input will be run on.
	if (atConfig.settingUniverse === 1 && index !== '' && !profile) {
		const world = document.getElementById('windowWorld' + index);
		const natureStyle = ['unset', 'rgba(50, 150, 50, 0.75)', 'rgba(60, 75, 130, 0.75)', 'rgba(50, 50, 200, 0.75)'];
		const natureList = ['None', 'Poison', 'Wind', 'Ice'];
		const natureIndex = natureList.indexOf(getZoneEmpowerment(world.value));
		world.parentNode.style.background = natureStyle[natureIndex];
	}
}

function mapSettingsDropdowns(universe = game.global.universe, vals, varPrefix) {
	if (!vals) return debug(`Issue with establishing values for dropdowns`, 'mazSettings');

	let dropdown = { hdType: '', hdType2: '', gather: '', mapType: '', mapLevel: '', special: '', prestigeGoal: '', challenge: '' };
	const highestZone = universe === 1 ? game.stats.highestLevel.valueTotal() : game.stats.highestRadLevel.valueTotal();

	/* HD types */
	const hdDropdowns = ['hdType', 'hdType2'];
	const hdTypeDropdowns = varPrefix === 'VoidMap' ? ['world', 'map', 'void', 'hitsSurvived', 'hitsSurvivedVoid', 'disabled'] : ['world', 'map', 'void', 'maplevel', 'hitsSurvived', 'hitsSurvivedVoid'];
	const hdTypeNames = varPrefix === 'VoidMap' ? ['World HD Ratio', 'Map HD Ratio', 'Void HD Ratio', 'Hits Survived', 'Void Hits Survived', 'Disabled'] : ['World HD Ratio', 'Map HD Ratio', 'Void HD Ratio', 'Map Level', 'Hits Survived', 'Void Hits Survived'];
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
	dropdown.raidingTypes = "<option value='0'" + (vals.raidingDropdown === '0' ? " selected='selected'" : '') + '>Frag</option>';
	dropdown.raidingTypes += "<option value='1'" + (vals.raidingDropdown === '1' ? " selected='selected'" : '') + '>Frag Min</option>';
	dropdown.raidingTypes += "<option value='2'" + (vals.raidingDropdown === '2' ? " selected='selected'" : '') + '>Frag Max</option>';

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
	dropdown.potionTypes = "<option value='h'" + (vals.potionstype === 'h' ? " selected='selected'" : '') + '>Herby Brew</option>';
	dropdown.potionTypes += "<option value='g'" + (vals.potionstype === 'g' ? " selected='selected'" : '') + '>Gaseous Brew</option>';
	dropdown.potionTypes += "<option value='f'" + (vals.potionstype === 'f' ? " selected='selected'" : '') + '>Potion of Finding</option>';
	dropdown.potionTypes += "<option value='v'" + (vals.potionstype === 'v' ? " selected='selected'" : '') + '>Potion of the Void</option>';
	dropdown.potionTypes += "<option value='s'" + (vals.potionstype === 's' ? " selected='selected'" : '') + '>Potion of Strength</option>';

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

//Auto Stcture
function autoStructureDisplay(elem) {
	let tooltipText;

	const hze = game.global.universe === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();
	const baseText =
		"<p>Here you can choose which structures will be automatically purchased when AutoStructure is toggled on. Check a box to enable the automatic purchasing of that structure, the 'Perc:' box specifies the cost-to-resource % that the structure should be purchased below, and set the 'Up To:' box to the maximum number of that structure you'd like purchased <b>(0&nbsp;for&nbsp;no&nbsp;limit)</b>. For example, setting the 'Perc:' box to 10 and the 'Up To:' box to 50 for 'House' will cause a House to be automatically purchased whenever the costs of the next house are less than 10% of your Food, Metal, and Wood, as long as you have less than 50 houses.</p>";
	const nursery = "<p><b>Nursery:</b> Acts the same as the other settings but also has a 'From' input which will cause nurseries to only be built from that zone onwards. Spire nursery settings within AT will ignore this start zone if needed for them to work. If 'Advanced Nurseries' is enabled and 'Up To' is set to 0 it will override buying max available and instead respect the input.</p>";
	const warpstation = '<p><b>Warpstation:</b> Settings for this type of building can be found in the AutoTrimp settings building tab!</p>';
	const safeGateway = "<p><b>Safe Gateway:</b> Will stop purchasing Gateways when your owned fragments are lower than the cost of the amount of maps you input in the 'Maps' field times by what a perfect LMC map of the level picked would cost up to the zone specified in 'Till Z:', if that value is 0 it'll assume z999.</p>";

	tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Auto Structure Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp(); _verticalCenterTooltip(false, true);'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'>";
	tooltipText += `${baseText}`;
	if (game.global.universe === 1 && hze >= 230) tooltipText += `${nursery}`;
	if (game.global.universe === 1 && hze >= 60) tooltipText += `${warpstation}`;
	if (game.global.universe === 2) tooltipText += `${safeGateway}`;

	const settingGroup = getPageSetting('buildingSettingsArray');
	tooltipText += autoStructureTable(settingGroup, hze);

	const costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info btn-lg' onclick='autoStructureSave()'>Apply</div><div class='btn-lg btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";

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
		if (count !== 0 && (count % 2 === 0 || (item === 'Nursery' && hze >= 230))) tooltipText += '</tr><tr>';
		let setting = settingGroup[item];
		let checkbox = buildNiceCheckbox('structConfig' + item, 'autoCheckbox', setting && setting.enabled);

		tooltipText += "<td><div class='row'>";
		tooltipText += "<div class='col-xs-3' style='width: 34%; padding-right: 5px'>" + checkbox + '<span>' + item + '</span></div>';
		tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>Perc: <input class='structConfigPercent' id='structPercent" + item + "' type='number' value='" + (setting && setting.percent ? setting.percent : 100) + "' /></div>";
		tooltipText += "<div class='col-xs-5' style='width: 33%; padding-left: 5px; text-align: right'>Up to: <input class='structConfigQuantity' id='structMax" + item + "' type='number' value='" + (setting && setting.buyMax ? setting.buyMax : 0) + "' /></div>";
		tooltipText += '</div></td>';
		count++;
	}

	if (game.global.universe === 1 && hze >= 230) {
		tooltipText += "<td><div class='row'>";
		tooltipText += "<div class='col-xs-5' style='width: 44%; padding-right: 5px'>From Z: <input class='structConfigQuantity' id='nurseryFromZ" + "' type='number' value='" + (settingGroup.Nursery && settingGroup.Nursery.fromZ ? settingGroup.Nursery.fromZ : 0) + "' /></div>";
	}

	if (game.global.universe === 2) {
		const setting = settingGroup.SafeGateway;
		let item = 'Safe Gateway';
		let checkbox = buildNiceCheckbox('structConfigSafeGateway', 'autoCheckbox', typeof setting === 'undefined' ? false : setting.enabled);

		tooltipText += '</tr><tr>';

		tooltipText += "<td><div class='row'>";
		tooltipText += "<div class='col-xs-3' style='width: 34%; padding-right: 5px'>" + checkbox + '<span>' + item + '</span></div>';
		tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>Maps: <input class='structConfigPercent' id='structPercent" + "' type='number' value='" + (setting && setting.mapCount ? setting.mapCount : 0) + "' /></div>";
		tooltipText += "<div class='col-xs-5' style='width: 33%; padding-left: 5px; text-align: right'>Till Z: <input class='structConfigQuantity' id='structMax' type='number' value='" + (setting && setting.zone ? setting.zone : 0) + "' /></div>";
		tooltipText += '</div></td>';

		tooltipText += "<td><div class='row'>";
		tooltipText += "<div class='col-xs-3' style='width: 44%; padding-right: 5px'><span>Map Level:" + "&nbsp;</span><select class='structConfigPercent' id='safeGatewayMapLevel'><option value='0'>0</option>";

		if (hze >= 50) {
			for (let i = 1; i <= 10; i++) {
				tooltipText += "<option value='" + i + "'" + (setting.mapLevel === i.toString() ? " selected='selected'" : '') + '>' + i + '</option>';
			}
		}

		tooltipText += '</select></div>';
		tooltipText += '</div></td>';
	}

	tooltipText += '</tr><tr>';

	//Portal Settings
	const values = ['Off', 'On'];
	tooltipText += "<td><div class='row'>";
	tooltipText += "<div class='col-xs-3' style='width: 32.5%; padding-right: 5px'><span>Setting on Portal" + '</span></div>';
	tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'><select style='width: 100%' id='autoJobSelfGather'><option value='0'>No change</option>";
	for (let x = 0; x < values.length; x++) {
		tooltipText += '<option' + (settingGroup.portalOption && settingGroup.portalOption === values[x].toLowerCase() ? " selected='selected'" : '') + " value='" + values[x].toLowerCase() + "'>" + values[x] + '</option>';
	}

	tooltipText += '/></div>';
	tooltipText += '</div></td>';

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
			let count = parseInt(percentboxes[x].value, 10);
			if (count > 10000) count = 10000;
			count = isNumberBad(count) ? 3 : count;
			setting[name].mapCount = count;

			let zone = parseInt(quantboxes[x].value, 10);
			if (zone > 999) zone = 999;
			zone = isNumberBad(zone) ? 3 : zone;
			setting[name].zone = zone;

			setting[name].mapLevel = document.getElementById('safeGatewayMapLevel').value;

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
	const ratio =
		"<p>The left side of this window is dedicated to jobs that are limited more by workspaces than resources. 1:1:1 will purchase all 3 of these ratio-based jobs evenly, and the ratio refers to the amount of workspaces you wish to dedicate to each job. Any number that's 0 or below will stop the script hiring any workers for that job. Scientists will be hired based on a ratio that is determined by how far you are into the game, the further you get, the less Scientists will be hired.</p>";
	const percent = "<p>The right side of this window is dedicated to jobs limited more by resources than workspaces. Set the percentage of resources that you'd like to be spent on each job.</p>";
	const magmamancer = "<p><b>Magmamancers:</b> These will only be hired when they'll do something! So once the time spent on the zone is enough to activate the first metal boost.</p>";
	const farmersUntil = '<p><b>Farmers Until:</b> Stops buying Farmers from this zone. Map setting job ratios override this setting.</p>';
	const lumberjackMP = '<p><b>No Lumberjacks Post MP:</b> Stops buying Lumberjacks after Melting Point has been run. The Smithy Farm setting will override this setting.</p>';

	let autoRatios = '<p><b>Auto Ratios</b> - Using ratios from top to bottom based on the following criteria:';
	autoRatios += '<br></b><b>4/5/0</b> - When running the <b>' + (portalUniverse === 2 ? 'Transmute' : 'Metal') + '</b> challenge.';

	if (game.global.universe === 1) {
		autoRatios += '<br><b>1/1/100</b> - When at or above z300 or running the <b>Eradicated</b> challenge.';
		autoRatios += '<br><b>1/7/12</b> - When at or above z230.';
		autoRatios += '<br><b>1/2/22</b> - When above 1500 tributes.';
		autoRatios += '<br><b>1/1/10</b> - When above 1000 tributes.';
	}

	if (game.global.universe === 2) {
		autoRatios += '<br><b>1/1/1</b> - When using a <b>Hazardous</b> or higher rarity heirloom.';
		autoRatios += '<br><b>1/2/4</b> - When above 1250 tributes.';
		autoRatios += '<br><b>2/1/4</b> - When at or above z110.';
	}

	autoRatios += `<br><b>3/1/4</b> - When above ${prettify(3e6)} trimps.`;
	autoRatios += `<br><b>3/3/5</b> - When above ${prettify(3e5)} trimps.`;
	autoRatios += `<br><b>1/1/2</b> - Used running a map until you reach ${prettify(3e6)} trimps.`;
	autoRatios += `<br><b>1/1/1</b> - Base ratio.`;
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
		tooltipText += "<div class='col-xs-6' style='padding-right: 5px'>" + checkbox + '<span>' + item + '</span></div>';
		tooltipText += "<div class='col-xs-6 lowPad' style='text-align: right'>Ratio: <input class='jobConfigQuantity' id='autoJobQuant" + item + "' type='number' value='" + (setting && setting.ratio >= 0 ? setting.ratio : 0) + "' /></div>";
		tooltipText += '</div></td>';
		if (percentJobs.length > x) {
			item = percentJobs[x];
			setting = settingGroup[item];
			let max = setting && setting.buyMax ? setting.buyMax : 0;
			if (max > 1e4) max = max.toExponential().replace('+', '');
			checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', setting && setting.enabled);
			tooltipText += "<td style='width: 60%'><div class='row'>";
			tooltipText += "<div class='col-xs-6' style='padding-right: 5px'>" + checkbox + '<span>' + item + '</span></div>';
			tooltipText += "<div class='col-xs-6 lowPad' style='text-align: right'>Percent: <input class='jobConfigQuantity' id='autoJobQuant" + item + "' type='number' value='" + (setting && setting.percent ? setting.percent : 100) + "' />";
			tooltipText += '</div></div>';
		}
	}

	if (game.global.universe === 2) {
		tooltipText += "<tr><td style='width: 40%'><div class='row'>";
		tooltipText += "<div class='col-xs-6' style='padding-right: 5px'>" + buildNiceCheckbox('autoJobCheckboxFarmersUntil', 'autoCheckbox', settingGroup.FarmersUntil.enabled) + '<span>' + 'Farmers Until</span></div>';
		tooltipText += "<div class='col-xs-6 lowPad' style='text-align: right'>Zone: <input class='jobConfigQuantity' id='FarmersUntilZone' type='number' value='" + (settingGroup.FarmersUntil.zone ? settingGroup.FarmersUntil.zone : 999) + "' /></div>";
		tooltipText += '</div></td>';

		tooltipText += "<td style='width: 60%'><div class='row'>";
		tooltipText += "<div class='col-xs-6' style='padding-right: 1px'>" + buildNiceCheckbox('autoJobCheckboxNoLumberjacks', 'autoCheckbox', settingGroup.NoLumberjacks.enabled) + '<span>' + 'No Lumberjacks Post MP</span></div>';
		tooltipText += '</td></tr>';
	}

	const portalOptions = ['AutoJobs: Off', 'Auto Jobs: On', 'Auto Jobs: Manual'];
	tooltipText += "<tr><td style='width: 40%'><div class='row'>";
	tooltipText += "<div class='col-xs-6' style='width: 50%; padding-right: 5px'><span>Setting on Portal" + '</span></div>';
	tooltipText += "<div class='col-xs-6 lowPad' style='width: 45.25%; text-align: right'><select style='width: 100%; font-size: 0.9vw;' id='autoJobPortal'><option value='0'>No change</option>";

	for (let x = 0; x < portalOptions.length; x++) {
		tooltipText += '<option' + (settingGroup.portalOption && settingGroup.portalOption === portalOptions[x] ? " selected='selected'" : '') + " value='" + portalOptions[x] + "'>" + portalOptions[x] + '</option>';
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
		return;
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
	const hze = atConfig.settingUniverse === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();
	const baseText = "<p>Here you can choose which special maps you'd like to run throughout your runs. Each special map will have a Zone & Cell box to identify where you would like to run the map on the specified zone. If the map isn't run on your specified zone it will be run on any zone after the one you input. If there's a map you don't own and you want to run that drops in maps then the script will now run one to obtain it.</p>";
	const smithy = "<p>The right side of this window is dedicated to running Melting Point when you've reached a certain Smithy value. As each runtype of vastly different there's different inputs for each type of run that you can do! Certain challenges have overrides for this, once unlocked they can be found in the C3 tab.</p>";
	const smithyDisplay = atConfig.settingUniverse === 2 && hze >= 50;

	const mapUnlocks = Object.keys(atData.uniqueMaps).filter((mapName) => {
		const { universe, zone } = atData.uniqueMaps[mapName];
		return !['Bionic Wonderland', 'The Black Bog'].includes(mapName) && universe === atConfig.settingUniverse && zone <= hze;
	});
	const smithySettings = smithyDisplay ? ['MP Smithy', 'MP Smithy Daily', 'MP Smithy C3', 'MP Smithy One Off'] : [];
	const settingGroup = getPageSetting('uniqueMapSettingsArray', atConfig.settingUniverse);

	let tooltipText = `
    <div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div>
    <p>Welcome to AT's Unique Map Settings! 
    <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp(); _verticalCenterTooltip(${smithySettings && smithySettings.length > 0 ? false : true}, ${smithySettings.length > 0 ? true : false});'>Help</span></p>
    <div id='autoTooltipHelpDiv' style='display: none'>
`;
	tooltipText += `${baseText}${smithyDisplay ? smithy : ''}`;
	tooltipText += uniqueMapsTable(settingGroup, mapUnlocks, smithySettings);

	const costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info btn-lg' onclick='uniqueMapsSave()'>Apply</div><div class='btn-lg btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";

	const ondisplay = () => _verticalCenterTooltip(smithySettings && smithySettings.length > 0 ? false : true, smithySettings.length > 0 ? true : false);
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

		if (smithySettings && smithySettings.length > x) {
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
	const setting = getPageSetting('uniqueMapSettingsArray', atConfig.settingUniverse);
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

	setPageSetting('uniqueMapSettingsArray', setting, atConfig.settingUniverse);
	cancelTooltip();
}

//AT Messages
function messageDisplay(elem) {
	const msgs = getPageSetting('spamMessages');
	const keys = ['gather', 'buildings', 'jobs', 'equipment', 'upgrades', 'maps', 'map_Details', 'map_Destacking', 'map_Skip', 'golden_Upgrades', 'other', 'stance', 'magmite', 'nature', 'zone', 'run_Stats', 'exotic', 'challenge_Abandon', 'portal'];

	const settingGroup = keys.reduce((obj, key) => {
		obj[key] = false;
		return obj;
	}, {});

	let tooltipText = "<div id='messageConfig'>Here you can select the messages that the script will print into the message log.<br>Mouse over the name of a filter for more info.<br></div>";
	tooltipText += `<div id='baseGameItems'>`;

	let rowData = '';
	let rows = 0;
	let total = 0;
	for (let item in settingGroup) {
		if (item === 'enabled') continue;
		const realName = (item.charAt(0).toUpperCase() + item.substr(1)).replace(/_/g, ' ');
		if (typeof msgs[item] === 'undefined') msgs[item] = false;

		if ((total > 0 && total % 5 === 0) || item === 'zone') {
			tooltipText += `<div id='row${rows}'>${rowData}</div>`;
			rowData = '';
			rows++;
			if (item === 'zone') total++;
		}

		let equipClass = msgs[item] ? 'Equipped' : 'NotEquipped';

		rowData += `
			<div class='spireAssaultItem spireItems${equipClass}' onclick='hideAutomationToggleElem(this)' data-hidden-text="${item}" <span onmouseover='messageConfigHoverAT("${item}", event)' onmouseout='messageConfigHoverAT("hide", event)'>
				<span>${realName}</span>
			</div>`;
		total++;
	}
	rows++;
	tooltipText += `<div id='row${rows}'>${rowData}</div>`;
	tooltipText += `</div>`;
	const ondisplay = () => _verticalCenterTooltip(true);

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
		hide: { title: 'Hide', text: 'Here you can finely tune the messages that the script will print into the message log.<br>Mouse over the name of a filter for more info.' },
		general: { title: 'General', text: 'Notification Messages, Auto He/Hr.' },
		buildings: { title: 'Buildings', text: 'Log buildings purchased.' },
		jobs: { title: 'Jobs', text: 'Log workers hired.' },
		equipment: { title: 'Equipment', text: 'Log equipment and prestiges purchases.' },
		upgrades: { title: 'Upgrades', text: 'Log upgrades purchased.' },
		golden_Upgrades: { title: 'Golden Upgrades', text: 'Log golden upgrades purchases.' },
		/*  */
		maps: { title: 'Maps', text: 'Log maps purchases and maps run.' },
		map_Details: { title: 'Map Details', text: 'Log the time and amount of maps it takes to finish mapping.' },
		map_Destacking: { title: 'Map Destacking', text: 'Log the time and amount of maps it takes to finish destacking through maps.' },
		map_Skip: { title: 'Map Skip', text: 'Log when the script skips any mapping settings.' },
		other: { title: 'Other', text: 'Log Trimpicide army suicides and Robotrimp activations.' },
		gather: { title: 'Gather', text: 'Log gather changes.' },
		stance: { title: 'Stance', text: 'Log stance changes.' },
		magmite: { title: 'Magmite', text: 'Log magmite spending.' },
		nature: { title: 'Nature', text: 'Log when the script spends nature tokens.' },
		/*  */
		zone: { title: 'Zone', text: 'Log when you start a new zone.' },
		run_Stats: { title: 'Run Stats', text: "Log your total trimps and how many resources you'd gain from a bone charge when starting a new zone." },
		exotic: { title: 'Exotic', text: 'Log your current world exotics when starting a new zone.' },
		challenge_Abandon: { title: 'Challenge Abandon', text: 'Log when challenges are abandoned through the scripts settings.' },
		portal: { title: 'Portal', text: 'Log challenges started by Auto Portal.' }
	};

	const config = messageConfigMap[what];
	if (!config) return;

	if (what === 'hide') document.getElementById('messageConfig').innerHTML = `${config.text}`;
	else document.getElementById('messageConfig').innerHTML = `<b>${config.title}</b><br>${config.text}`;
	tooltip(config.title, 'customText', event, config.text);
}

function messageSave() {
	const setting = getPageSetting('spamMessages', portalUniverse);
	const items = Array.from(document.getElementsByClassName('spireAssaultItem'));

	items.forEach((item) => {
		setting[item.dataset.hiddenText] = item.classList.contains('spireItemsEquipped');
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
	tooltipText += universeTooltips[atConfig.settingUniverse].map((key) => tooltips[key]).join('');
	tooltipText += "</p></div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";

	const settingArray = getPageSetting('dailyPortalSettingsArray', atConfig.settingUniverse);
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
		if (atConfig.settingUniverse === 1 && (item === 'Empowered_Void' || item === 'Heirlost')) continue;
		if (atConfig.settingUniverse === 2 && item === 'Reflect') continue;
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

	elem.style.left = '33.75%';
	elem.style.top = '25%';
	const ondisplay = () => _verticalCenterTooltip(true);

	return [elem, tooltipText, costText, ondisplay];
}

function dailyPortalModsSave() {
	const setting = getPageSetting('dailyPortalSettingsArray', atConfig.settingUniverse);
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

	setPageSetting('dailyPortalSettingsArray', setting, atConfig.settingUniverse);
	cancelTooltip();
}

//C2 Runner
function c2RunnerDisplay(elem) {
	MODULES.popups.mazWindowOpen = true;

	const baseText = `Here you can enable the challenges you would like ${_getChallenge2Info()} runner to complete and the zone you'd like the respective challenge to finish at.`;
	const fusedText = autoTrimpSettings.c2Fused.universe.indexOf(atConfig.settingUniverse) !== -1 ? ` Fused challenges are prioritised over their regular counterparts when starting challenges.` : '';

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
	const c2RunnerSettings = getPageSetting('c2RunnerSettings', atConfig.settingUniverse);

	let obj = challengesUnlockedObj(atConfig.settingUniverse, true, false);
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

	const costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn-lg btn btn-info' onclick='c2RunnerSave()'>Apply</div><div class='btn btn-lg btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
	elem.style.left = '30.5%';
	elem.style.top = '25%';
	elem.classList = `tooltipExtraCustom45`;
	const ondisplay = () => _verticalCenterTooltip();

	return [elem, tooltipText, costText, ondisplay];
}

function c2RunnerSave() {
	const setting = getPageSetting('c2RunnerSettings', atConfig.settingUniverse);
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

	setPageSetting('c2RunnerSettings', setting, atConfig.settingUniverse);
	cancelTooltip();

	if (getPageSetting('autoPortalTimeout')) {
		_settingTimeout('autoPortal');
	}
}

function hideAutomationToggleElem(element) {
	const elemPrefix = `spireItems`;

	element.classList.toggle(`${elemPrefix}Equipped`);
	element.classList.toggle(`${elemPrefix}NotEquipped`);
}

function hideAutomationDisplay(elem) {
	const msgs = getPageSetting('displayHideAutoButtons');
	const keys = ['fight', 'autoFight', 'trap', 'storage', 'structure', 'jobs', 'gold', 'upgrade', 'prestige', 'equip', 'recycleMaps'];
	const settingGroup = keys.reduce((obj, key) => {
		obj[key] = false;
		return obj;
	}, {});

	let tooltipText = "<div id='messageConfig'>Here you can select certain ingame (and AutoTrimps) buttons and messages you'd prefer to hide.<br>Mouse over the name of a filter for more info.</div>";

	tooltipText += `<div id='baseGameItems'>`;
	tooltipText += `<span class='messageConfigContainer' style='font-size: 1.3vw;'>&nbsp;Base Game Features</span></span><br/>`;

	let rowData = '';
	let rows = 0;
	let total = 0;
	for (let item in settingGroup) {
		if (item === 'enabled') continue;
		if (total > 0 && total % 5 === 0) {
			tooltipText += `<div id='row${rows}'>${rowData}</div>`;
			rowData = '';
			rows++;
		}

		let equipClass = msgs[item] ? 'Equipped' : 'NotEquipped';

		const addAuto = item.includes('ight') || item.includes('recycle') ? '' : 'Auto ';
		let realName = addAuto + (item.charAt(0).toUpperCase() + item.substr(1)).replace(/_/g, ' ');
		if (realName === 'AutoFight') realName = 'Auto Fight';
		if (realName === 'RecycleMaps') realName = 'Recycle Maps';

		rowData += `
			<div class='spireAssaultItem spireItems${equipClass}' onclick='hideAutomationToggleElem(this)' data-hidden-text="${item}" <span onmouseover='hideAutomationConfigHover("${item}", event)' onmouseout='hideAutomationConfigHover("hide", event)'>
				<span>${realName}</span>
			</div>`;
		total++;
	}
	rows++;
	tooltipText += `<div id='row${rows}'>${rowData}</div>`;
	tooltipText += `</div>`;
	tooltipText += `</div>`;

	tooltipText += `<div id='autoTrimpsItems'>`;
	tooltipText += `<span class='messageConfigContainer' style='font-size: 1.3vw;'>&nbsp;AutoTrimps Features</span></span><br/>`;
	const atKeys = ['structure', 'jobs', 'equip', 'maps', 'status', 'heHr'];
	const atSettingGroup = atKeys.reduce((obj, key) => {
		obj[key] = false;
		return obj;
	}, {});

	rowData = '';
	rows = 0;
	total = 0;
	for (let item in atSettingGroup) {
		if (item === 'enabled') continue;
		if (total > 0 && total % 5 === 0) {
			tooltipText += `<div id='row${rows}'>${rowData}</div>`;
			rowData = '';
			rows++;
		}

		let equipClass = msgs[item] ? 'Equipped' : 'NotEquipped';

		let realName = 'Auto ' + (item.charAt(0).toUpperCase() + item.substr(1)).replace(/_/g, ' ');
		if (item === 'status') realName = 'Auto Maps Status';
		if (item === 'heHr') realName = `${heliumOrRadon()} Per Hour Status`;

		rowData += `
			<div class='spireAssaultItem spireItems${equipClass}' onclick='hideAutomationToggleElem(this)' data-hidden-text="${item}" <span onmouseover='hideAutomationConfigHover("AT${item}", event)' onmouseout='hideAutomationConfigHover("hide", event)'>
				<span>${realName}</span>
			</div>`;
		total++;
	}
	rows++;
	tooltipText += `<div id='row${rows}'>${rowData}</div>`;
	tooltipText += `</div>`;
	tooltipText += `</div>`;

	const ondisplay = function () {
		_verticalCenterTooltip(true);
	};

	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	const costText = `
	<div class='maxCenter'>
		<div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip();hideAutomationSave();'>Confirm</div>
		<div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div>
	</div>
	`;

	return [elem, tooltipText, costText, ondisplay];
}

function hideAutomationConfigHover(what, event, hide = false) {
	const messageConfigMap = {
		hide: { title: 'Hide', text: "Here you can finely tune ingame automation buttons  you'd prefer to hide. Mouse over the name of a filter for more info." },
		fight: { title: 'Fight', text: 'Hides the games Fight button.' },
		autoFight: { title: 'Auto Fight', text: 'Hides the games AutoFight button.' },
		trap: { title: 'Auto Traps', text: 'Hides the games AutoTraps button.' },
		storage: { title: 'Auto Storage', text: 'Hides the games AutoStorage button.' },
		structure: { title: 'Auto Structure', text: 'Hides the games AutoStructure button.' },
		jobs: { title: 'Auto Jobs', text: 'Hides the games AutoJobs button.' },
		gold: { title: 'Auto Gold', text: 'Hides the games AutoGold button.' },
		geneticistassist: { title: 'Geneticistassist', text: 'Hides the games Geneticistassist button.' },
		upgrade: { title: 'Auto Upgrade', text: 'Hides the games AutoUpgrade button.' },
		prestige: { title: 'Auto Prestige', text: 'Hides the games AutoPrestige button.' },
		equip: { title: 'Auto Equip', text: 'Hides the games AutoEquip button.' },
		recycleMaps: { title: 'Recycle Maps', text: 'Hides Recycle Maps messages in the message log.' },
		ATstructure: { title: 'Auto Structure', text: 'Hides the AT Auto Structure button.' },
		ATjobs: { title: 'Auto Jobs', text: 'Hides the AT Auto Jobs button.' },
		ATequip: { title: 'Auto Equip', text: 'Hides the AT Auto Equip button.' },
		ATmaps: { title: 'Auto Maps', text: 'Hides the Auto Maps button.' },
		ATstatus: { title: 'Auto Maps Status', text: 'Hides the AutoTrimps Map Status message.' },
		ATheHr: { title: `${heliumOrRadon()} Per Hour Status`, text: `Hides the ${heliumOrRadon()} Per Hour Status message.` }
	};

	const config = messageConfigMap[what];
	if (!config) return;

	if (what === 'hide') document.getElementById('messageConfig').innerHTML = `${config.text}`;
	else document.getElementById('messageConfig').innerHTML = `<b>${config.title}</b><br>${config.text}`;
	tooltip(config.title, 'customText', event, config.text);
}

function hideAutomationSave() {
	const setting = getPageSetting('displayHideAutoButtons');
	const items = Array.from(document.getElementsByClassName('spireAssaultItem'));

	items.forEach((item) => {
		setting[item.dataset.hiddenText] = item.classList.contains('spireItemsEquipped');
	});

	setPageSetting('displayHideAutoButtons', setting);
	saveSettings();
	cancelTooltip();

	hideAutomationButtons();
}

function hideAutomationButtons() {
	const setting = getPageSetting('displayHideAutoButtons');

	const automationUnlocked = {
		fight: game.upgrades.Battle.done,
		trap: game.upgrades.Trapstorm.done,
		storage: game.global.autoStorageAvailable,
		structure: bwRewardUnlocked('AutoStructure'),
		jobs: bwRewardUnlocked('AutoJobs'),
		geneticistassist: bwRewardUnlocked('Geneticistassist'),
		gold: game.stats.goldenUpgrades.valueTotal + game.stats.goldenUpgrades.value >= 77,
		upgrade: game.global.autoUpgradesAvailable,
		prestige: game.global.sLevel >= 4,
		equip: game.global.autoEquipUnlocked,
		recycleMaps: false,
		ATstructure: true,
		ATjobs: true,
		ATequip: true,
		ATmaps: true,
		ATstatus: true,
		ATheHr: true
	};

	for (let item in setting) {
		if (!automationUnlocked[item]) continue;

		if (item === 'fight') {
			_setFightButtons(setting);
			continue;
		}

		const itemName = `${item.charAt(0).toUpperCase() + item.substr(1)}${item === 'gold' ? 'en' : ''}`;
		let elemName = `auto${itemName}Btn`;

		if (item === 'ATmaps') elemName = 'autoMapBtn';
		else if (item === 'ATstatus') elemName = 'autoMapStatus';
		else if (item === 'ATheHr') elemName = 'heHrStatus';
		else if (item.includes('AT')) elemName = `auto${item.charAt(2).toUpperCase() + itemName.substr(3)}Parent`;

		const elem = document.getElementById(elemName);
		let elemVisible = setting[item] ? 'hidden' : '';

		if (['autoMapStatus', 'heHrStatus'].includes(elemName)) {
			elemVisible = !setting[item] ? 'block' : 'none';
			if (elem && elem.style.display !== elemVisible) elem.style.display = elemVisible;
		} else {
			if (elem && elem.style.visibility !== elemVisible) elem.style.visibility = elemVisible;
		}
	}
}
