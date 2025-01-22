function autoBattleItemSwap(items) {
	if (items) {
		for (let item in autoBattle.items) {
			const itemDetails = autoBattle.items[item];
			/* replace any underscores ("_") with spaces. If there's 2 spaces in a row then replace it with a hyphen ("-") instead */
			item = item.replace(/_/g, ' ').replace(/  /g, '-');
			const shouldEquip = items.includes(item);

			if (shouldEquip && itemDetails.hidden) itemDetails.hidden = false;
			if (shouldEquip || itemDetails.equipped) itemDetails.equipped = shouldEquip;
		}
	}
}

function autoBattleRingSwap(ring) {
	if (!autoBattle.oneTimers.The_Ring.owned) return;

	const allowedMods = autoBattle.getRingSlots();
	if (!Array.isArray(ring) || ring.length !== allowedMods) return;

	autoBattle.rings.mods = ring;
}

function automateSpireAssault() {
	if (!gameUserCheck() || game.global.stringVersion === '5.9.2') return;

	if (autoBattle.rings.level !== 60 && autoBattle.shards >= autoBattle.getRingLevelCost()) {
		autoBattle.levelRing();
	}

	if (autoBattle.bonuses.Extra_Limbs.level !== 14 && autoBattle.dust >= autoBattle.getBonusCost('Extra_Limbs')) {
		autoBattle.buyBonus('Extra_Limbs');
		autoBattle.equip('Snimp__Fanged_Blade');
	}
	//Turning off autoLevel
	if (autoBattle.maxEnemyLevel >= 151 && autoBattle.rings.level < 60) {
		if (autoBattle.autoLevel) autoBattle.toggleAutoLevel();
		if (autoBattle.enemyLevel === 148) return;

		autoBattle.enemyLevel = 148;
		autoBattle.resetCombat(true);
		autoBattle.updatePopupBtns();
	} else if (!autoBattle.autoLevel) {
		autoBattle.toggleAutoLevel();
	}

	if (autoBattle.sessionEnemiesKilled !== 0 || autoBattle.enemy.baseHealth !== autoBattle.enemy.health || autoBattle.maxEnemyLevel !== autoBattle.enemyLevel) return;

	/* 	shards is per second
		clearTime is hours */
	const levels = {
		144: {
			items: ['Lifegiving Gem', 'Hungering Mold', 'Shock and Awl', 'Wired Wristguards', 'Sacrificial Shank', 'Plague Bringer', 'Very Large Slime', 'Grounded Crown', 'Doppelganger Signet', 'Basket of Souls', 'Goo Golem', 'Omni Enhancer', 'Stormbringer', 'Box of Spores', 'Myco Mitts', 'Gaseous Greataxe', 'The Fibrillator'],
			ring: ['health', 'lifesteal', 'dustMult'],
			shards: 4.27e12,
			clearTime: 36
		},
		145: {
			items: ['Lifegiving Gem', 'Hungering Mold', 'Shock and Awl', 'Wired Wristguards', 'Sacrificial Shank', 'Plague Bringer', 'Very Large Slime', 'Grounded Crown', 'Doppelganger Signet', 'Basket of Souls', 'Goo Golem', 'Omni Enhancer', 'Stormbringer', 'Box of Spores', 'Myco Mitts', 'Gaseous Greataxe', 'The Fibrillator'],
			ring: ['health', 'lifesteal', 'dustMult'],
			shards: 6.34e12,
			clearTime: 33
		},
		146: {
			items: ['Lifegiving Gem', 'Hungering Mold', 'Shock and Awl', 'Wired Wristguards', 'Sacrificial Shank', 'Plague Bringer', 'Very Large Slime', 'Grounded Crown', 'Doppelganger Signet', 'Basket of Souls', 'Goo Golem', 'Omni Enhancer', 'Stormbringer', 'Box of Spores', 'Myco Mitts', 'Gaseous Greataxe', 'The Fibrillator'],
			ring: ['health', 'lifesteal', 'dustMult'],
			shards: 8.87e12,
			clearTime: 31
		},
		147: {
			items: ['Lifegiving Gem', 'Hungering Mold', 'Shock and Awl', 'Wired Wristguards', 'Sacrificial Shank', 'Plague Bringer', 'Very Large Slime', 'Doppelganger Signet', 'Basket of Souls', 'Goo Golem', 'Omni Enhancer', 'Stormbringer', 'Box of Spores', 'Nullifium Armor', 'Myco Mitts', 'Gaseous Greataxe', 'The Fibrillator'],
			ring: ['health', 'lifesteal', 'dustMult'],
			shards: 8.18e12,
			clearTime: 46
		},
		148: {
			items: ['Lifegiving Gem', 'Hungering Mold', 'Shock and Awl', 'Wired Wristguards', 'Sacrificial Shank', 'Plague Bringer', 'Very Large Slime', 'Grounded Crown', 'Doppelganger Signet', 'Basket of Souls', 'Goo Golem', 'Omni Enhancer', 'Stormbringer', 'Box of Spores', 'Myco Mitts', 'Gaseous Greataxe', 'The Fibrillator'],
			ring: ['health', 'lifesteal', 'dustMult'],
			shards: 1.54e13,
			clearTime: 32
		},
		149: {
			items: ['Lifegiving Gem', 'Hungering Mold', 'Shock and Awl', 'Wired Wristguards', 'Sacrificial Shank', 'Plague Bringer', 'Very Large Slime', 'Doppelganger Signet', 'Basket of Souls', 'Goo Golem', 'Omni Enhancer', 'Stormbringer', 'Box of Spores', 'Nullifium Armor', 'Myco Mitts', 'Gaseous Greataxe', 'The Fibrillator'],
			ring: ['health', 'lifesteal', 'dustMult'],
			shards: 8.95e12,
			clearTime: 75
		},
		150: {
			items: ['Lifegiving Gem', 'Hungering Mold', 'Shock and Awl', 'Wired Wristguards', 'Sacrificial Shank', 'Plague Bringer', 'Very Large Slime', 'Doppelganger Signet', 'Basket of Souls', 'Goo Golem', 'Omni Enhancer', 'Stormbringer', 'Box of Spores', 'Nullifium Armor', 'Myco Mitts', 'Gaseous Greataxe', 'The Fibrillator'],
			ring: ['health', 'lifesteal', 'dustMult'],
			shards: 1.31e13,
			clearTime: 68
		},
		/* after 150 r60 was only a 27 hour farm on 148 */
		151: {
			items: ['Shock and Awl', 'Spiked Gloves', 'Bloodstained Gloves', 'Eelimp in a Bottle', 'Big Cleaver', 'Sacrificial Shank', 'Grounded Crown', 'Fearsome Piercer', 'Bag of Nails', 'Snimp-Fanged Blade', 'Doppelganger Signet', 'Basket of Souls', 'Omni Enhancer', 'Stormbringer', 'Nullifium Armor', 'Haunted Harpoon', 'Doppelganger Diadem', 'The Fibrillator'],
			ring: ['attack', 'health', 'lifesteal'],
			shards: 7.94e9,
			clearTime: 13
		},
		152: {
			/* 	no idea atm
				think poison but can only get it down to 6d20h with the usual items */
		},
		153: {
			items: ['Lifegiving Gem', 'Hungering Mold', 'Shock and Awl', 'Sacrificial Shank', 'Plague Bringer', 'Very Large Slime', 'Grounded Crown', 'Doppelganger Signet', 'Basket of Souls', 'Goo Golem', 'Omni Enhancer', 'Stormbringer', 'Box of Spores', 'Nullifium Armor', 'Myco Mitts', 'Doppelganger Diadem', 'Gaseous Greataxe', 'The Fibrillator'],
			ring: ['health', 'lifesteal', 'dustMult'],
			shards: 2e14 /* ish */,
			clearTime: 33
		}
	};

	const levelData = levels[autoBattle.enemyLevel];
	if (!levelData) return;

	const { items, ring } = levelData;
	if (autoBattle.bonuses.Extra_Limbs.level === 14) {
		items.push('Snimp-Fanged Blade');
	}

	if (items) autoBattleItemSwap(items);
	if (ring) autoBattleRingSwap(ring);
	autoBattle.popup(true, false, true);
}

function totalSAResources() {
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

	return [dust, shards];
}
