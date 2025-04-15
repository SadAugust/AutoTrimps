function spireAssaultAcceptContract() {
	if (!game.global.voidBuff || game.global.universe !== 2 || !getPageSetting('spireAssaultContracts')) return;
	const contractsLeft = autoBattle.getContracts();
	if (contractsLeft.length === 0) return;

	const contract = contractsLeft[0];
	if (autoBattle.items[contract].zone <= MODULES.maps.lastMapWeWereIn.level) {
		autoBattle.acceptContract(contract);
	}
}

function spireAssaultItemList(showHidden = false, cleanNames = false) {
	const items = autoBattle.items;
	const itemList = autoBattle.getItemOrder();
	const hiddenItems = showHidden ? [] : JSON.parse(getPageSetting('spireAssaultPresets'))['Hidden Items'].items;
	let unlockedItems = [];

	for (let item in itemList) {
		item = itemList[item].name;
		const itemDetails = items[item];
		if (!itemDetails.owned) continue;
		5;

		const cleanName = autoBattle.cleanName(item);
		if (!showHidden && hiddenItems.includes(cleanName)) continue;

		unlockedItems.push(cleanNames ? cleanName : item);
	}

	return unlockedItems;
}

function spireAssaultShouldRun(setting) {
	if (!setting || !setting.active || autoBattle.maxEnemyLevel < setting.world) return false;

	if (setting.settingType === 'Clear Level') {
		if (autoBattle.maxEnemyLevel > setting.world) return false;
	} else if (setting.settingType === 'Buy One-Timer') {
		const oneTimer = autoBattle.oneTimers[setting.oneTimerItem];
		if (!oneTimer || oneTimer.owned) return false;
	} else {
		const itemLevel = Number(setting.levelSA);
		let item = autoBattle.items[setting.item];
		if (setting.settingType === 'Level Ring') item = autoBattle.rings;
		if (setting.settingType === 'Level Bonus') item = autoBattle.bonuses[setting.bonusItem];
		if (item.level >= itemLevel) return false;
	}

	return true;
}

function spireAssaultSettingsIndex(baseSettings) {
	for (let y = 1; y < baseSettings.length; y++) {
		const currSetting = baseSettings[y];
		if (!spireAssaultShouldRun(currSetting)) continue;

		return y;
	}

	return null;
}

function spireAssault() {
	if (autoBattle.sealed || game.stats.highestRadLevel.valueTotal() < 75) return;

	const settingName = 'spireAssaultSettings';
	const baseSettings = getPageSetting(settingName);
	if (!baseSettings) return;

	const defaultSettings = baseSettings[0];
	if (!defaultSettings || !defaultSettings.active) return;

	const settingIndex = spireAssaultSettingsIndex(baseSettings);
	const setting = baseSettings[settingIndex];
	if (setting) _runSpireAssault(setting);
}

function _runSpireAssault(setting) {
	const { settingType, world, levelSA, preset } = setting;

	if (settingType !== 'Clear Level') {
		const itemObj = {
			'Level Equipment': {
				item: autoBattle.items[setting.item],
				itemName: setting.item,
				cost: autoBattle.upgradeCost,
				upgradeFunction: autoBattle.upgrade
			},
			'Level Ring': {
				item: autoBattle.rings,
				itemName: 'The_Ring',
				cost: autoBattle.getRingLevelCost,
				upgradeFunction: autoBattle.levelRing
			},
			'Level Bonus': {
				item: autoBattle.bonuses[setting.bonusItem],
				itemName: setting.bonusItem,
				cost: autoBattle.getBonusCost,
				upgradeFunction: autoBattle.buyBonus
			},
			'Buy One-Timer': {
				item: autoBattle.oneTimers[setting.oneTimerItem],
				itemName: setting.oneTimerItem,
				cost: autoBattle.oneTimerPrice,
				upgradeFunction: autoBattle.buyOneTimer
			}
		};

		const { item, itemName, cost, upgradeFunction } = itemObj[settingType];
		autoBattle.upgradeFunction = upgradeFunction;
		autoBattle.costFunction = cost;

		let resourceType = settingType === 'Level Ring' || (item.dustType && item.dustType === 'shards') || item.useShards ? 'shards' : 'dust';
		let resources = autoBattle[resourceType];
		let levelCost = autoBattle.costFunction(itemName);

		if (settingType === 'Buy One-Timer') {
			if (resources >= levelCost) {
				autoBattle.buyOneTimer(itemName);
				return;
			}
		} else {
			while (item.level < Number(levelSA) && resources >= levelCost) {
				autoBattle.upgradeFunction(itemName);
				levelCost = autoBattle.costFunction(itemName);
				resources = autoBattle[resourceType];
			}

			if (item.level === Number(levelSA)) {
				return;
			}
		}
	}

	let reset = false;
	if (autoBattle.enemyLevel !== world) {
		if (autoBattle.autoLevel) autoBattle.toggleAutoLevel();
		autoBattle.enemyLevel = world;
		reset = true;
	}

	const presetSetting = JSON.parse(getPageSetting('spireAssaultPresets'));
	const itemPreset = preset === 'No Change' ? undefined : presetSetting[`Preset ${preset}`];
	if (itemPreset) {
		reset |= spireAssaultItemSwap(itemPreset.items);
		reset |= spireAssaultRingSwap(itemPreset.ringMods);
	}

	if (reset) {
		autoBattle.resetCombat(true);
		autoBattle.popup(true, false, true);
	}
}

function spireAssaultExport(preset) {
	const equippedItems = [];
	for (let item in autoBattle.items) {
		if (autoBattle.items[item].equipped) equippedItems.push(item);
	}

	const ringMods = autoBattle.rings.mods;

	const settings = JSON.parse(getPageSetting('spireAssaultPresets'));
	settings[preset].items = equippedItems;
	settings[preset].ringMods = ringMods;
	setPageSetting('spireAssaultPresets', JSON.stringify(settings));

	cancelTooltip();
	importExportTooltip('spireAssault');
}

function spireAssaultImport(preset) {
	const settings = JSON.parse(getPageSetting('spireAssaultPresets'));
	const { items, ringMods } = settings[preset];

	let reset = false;
	reset |= spireAssaultItemSwap(items);
	reset |= spireAssaultRingSwap(ringMods);

	if (reset) {
		autoBattle.resetCombat(true);
		autoBattle.popup(true, false, true);
	}
}

function spireAssaultImportSpreadsheet(preset) {
	const importBox = document.getElementById('importBox');
	const importString = importBox.value
		.replace(/[\n\r]/gm, '')
		.split('||')[1]
		.split(', Ring');
	let errorMsg = '';

	const itemString = importString[0].split(', ').map((item) => item.replace(/-/g, '__').replace(/ /g, '_').replace(/(\d+)/g, ' $1'));

	const itemArray = [];
	for (let item of itemString) {
		const itemSplit = item.split(' ');
		const itemData = autoBattle.items[itemSplit[0]];

		if (!itemData.owned) {
			errorMsg += `You do not own the ${autoBattle.cleanName(item)} item so it won't be imported.<br>`;
			continue;
		}

		itemArray.push(itemSplit[0]);
		if (itemData.level < Number(itemSplit[1])) {
			errorMsg += `<span style="color: red;">Your ${autoBattle.cleanName(itemSplit[0])} is level ${itemData.level} but the imported level is ${Number(itemSplit[1])}.</span><br>`;
		}
	}

	const ringString = importString[1].split(' ');
	const ringData = {
		level: (ringString && Number(ringString[0])) || 0,
		mods: {
			health: ringString && ringString[1].includes('HP'),
			attack: ringString && ringString[1].includes('Atk'),
			lifesteal: ringString && ringString[1].includes('LS'),
			dustMult: ringString && ringString[1].includes('Dust')
		}
	};

	const ringMods = Object.keys(ringData.mods).filter((mod) => ringData.mods[mod]);
	if (ringData.level > autoBattle.rings.level) {
		errorMsg += `<span style="color: red;">Your Ring is level ${autoBattle.rings.level} but the imported level is ${ringData.level}.</span><br>`;
	}

	if (errorMsg !== '' && importBox.style.display !== 'none') {
		errorMsg += '<br>If you would still like to import the item build, please click the Import button again.<br>';
		errorMsg += `<textarea id='importBox' style='width: 100%; display: none;' rows='3'>${importBox.value}</textarea>`;
		document.getElementById('tipText2').innerHTML = errorMsg;
		return;
	}

	const settings = JSON.parse(getPageSetting('spireAssaultPresets'));
	settings[preset].items = itemArray;
	settings[preset].ringMods = ringMods;
	setPageSetting('spireAssaultPresets', JSON.stringify(settings));

	cancelTooltip2();
	importExportTooltip('spireAssault');
	document.getElementById('tooltipDiv2').style.zIndex = 6;
}

function spireAssaultItemSwap(itemList) {
	if (!itemList || itemList.length > autoBattle.getMaxItems()) return false;

	let reset = false;
	for (let item in autoBattle.items) {
		const itemDetails = autoBattle.items[item];
		if (!itemDetails.owned) continue;

		const shouldEquip = itemList.includes(item);
		if (shouldEquip && itemDetails.hidden) itemDetails.hidden = false;
		if (shouldEquip !== itemDetails.equipped) {
			itemDetails.equipped = shouldEquip;
			reset = true;
		}
	}

	return reset;
}

function spireAssaultRingSwap(ringMods) {
	if (!autoBattle.oneTimers.The_Ring.owned) {
		return false;
	}

	const allowedMods = autoBattle.getRingSlots();
	if (!Array.isArray(ringMods) || ringMods.length !== allowedMods) {
		return false;
	}

	if (autoBattle.rings.mods.length === ringMods.length) {
		const allMatch = autoBattle.rings.mods.every((mod) => ringMods.includes(mod));
		if (allMatch) return false;
	}

	autoBattle.rings.mods = ringMods;
	return true;
}

function spireAssaultTotalResourcesSpent() {
	let dustContracts = 0;
	let shardContracts = 0;
	const itemsToSkip = ['Sword', 'Menacing_Mask', 'Armor', 'Rusty_Dagger', 'Fists_of_Goo', 'Battery_Stick', 'Pants'];
	for (let item in autoBattle.items) {
		if (itemsToSkip.includes(item)) continue;
		if (typeof autoBattle.items[item].dustType === 'undefined') dustContracts += autoBattle.contractPrice(item);
		else shardContracts += autoBattle.contractPrice(item);
	}

	let dustItems = 0;
	let shardItems = 0;
	for (let item in autoBattle.items) {
		const { startPrice, priceMod, level, dustType } = autoBattle.items[item];
		let itemPrice = startPrice !== undefined ? startPrice : 5;
		let itemPriceMod = priceMod !== undefined ? priceMod : 3;
		for (let x = 0; x < level; x++) {
			if (typeof dustType === 'undefined') dustItems += itemPrice * (Math.pow(itemPriceMod, x) / itemPriceMod);
			else shardItems += itemPrice * (Math.pow(itemPriceMod, x) / itemPriceMod);
		}
	}

	let dustBonuses = 0;
	let shardBonuses = 0;
	for (let bonus in autoBattle.bonuses) {
		const { price, priceMod, level } = autoBattle.bonuses[bonus];
		for (let x = 0; x < level; x++) {
			if (bonus !== 'Scaffolding') dustBonuses += Math.ceil(price * Math.pow(priceMod, x));
			else shardBonuses += Math.ceil(price * Math.pow(priceMod, x));
		}
	}

	let dustOneTimers = 0;
	let shardOneTimers = 0;
	for (let item in autoBattle.oneTimers) {
		if (typeof autoBattle.oneTimers[item].useShards === 'undefined') dustOneTimers += autoBattle.oneTimerPrice(item);
		else shardOneTimers += autoBattle.oneTimerPrice(item);
	}

	let ringCost = 0;
	if (autoBattle.oneTimers['The_Ring'].owned && autoBattle.rings.level > 1) {
		ringCost += Math.ceil(15 * Math.pow(2, autoBattle.rings.level) - 30);
	}

	const dust = [dustContracts, dustItems, dustBonuses, dustOneTimers].reduce((a, b) => a + b, 0);
	const shards = [shardContracts, shardItems, shardBonuses, shardOneTimers, ringCost].reduce((a, b) => a + b, 0);

	return `Total Dust Spent ${prettify(dust)}. Total Shards Spent ${prettify(shards)}`;
}
