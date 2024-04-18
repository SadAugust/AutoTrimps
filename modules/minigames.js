function ABItemSwap(items, ring) {
	if (items) {
		for (let item in autoBattle.items) {
			const itemDetails = autoBattle.items[item];
			const shouldEquip = items.includes(item);

			if (shouldEquip && itemDetails.hidden) itemDetails.hidden = false;
			itemDetails.equipped = shouldEquip;
		}
	}

	if (ring) {
		autoBattle.rings.mods = ring;
	}
}

function automateSpireAssault() {
	if (game.global.universe !== 999) return;
	if (autoBattle.enemyLevel === 121) {
		if (autoBattle.rings.level === 49 && autoBattle.shards >= autoBattle.getRingLevelCost()) {
			autoBattle.levelRing();
		}
	}

	if (autoBattle.rings.level === 50 && (autoBattle.items.Basket_of_Souls.level === 10 || autoBattle.items.Snimp__Fanged_Blade.level === 11)) {
		if (autoBattle.items.Basket_of_Souls.level === 10 && autoBattle.shards >= autoBattle.upgradeCost('Basket_of_Souls')) autoBattle.upgrade('Basket_of_Souls');
		if (autoBattle.items.Snimp__Fanged_Blade.level === 11 && autoBattle.shards >= autoBattle.upgradeCost('Snimp__Fanged_Blade')) autoBattle.upgrade('Snimp__Fanged_Blade');
	}

	const equip = {
		130: {
			items: ['Battery_Stick', 'Lifegiving_Gem', 'Spiked_Gloves', 'Tame_Snimp', 'Big_Cleaver', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Snimp__Fanged_Blade', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon'],
			ring: ['attack', 'lifesteal']
		},
		131: {
			items: ['Battery_Stick', 'Lifegiving_Gem', 'Spiked_Gloves', 'Tame_Snimp', 'Grounded_Crown', 'Big_Cleaver', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Snimp__Fanged_Blade', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon'],
			ring: ['attack', 'lifesteal']
		},
		132: {
			items: ['Battery_Stick', 'Lifegiving_Gem', 'Spiked_Gloves', 'Tame_Snimp', 'Bloodstained_Gloves', 'Big_Cleaver', 'Sacrificial_Shank', 'Grounded_Crown', 'Fearsome_Piercer', 'Bag_of_Nails', 'Snimp__Fanged_Blade', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Nullifium_Armor', 'Haunted_Harpoon'],
			ring: ['attack', 'lifesteal']
		},
		133: {
			items: ['Battery_Stick', 'Lifegiving_Gem', 'Spiked_Gloves', 'Tame_Snimp', 'Wired_Wristguards', 'Big_Cleaver', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Snimp__Fanged_Blade', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon'],
			ring: ['attack', 'lifesteal']
		},
		134: {
			items: ['Menacing_Mask', 'Battery_Stick', 'Lifegiving_Gem', 'Spiked_Gloves', 'Wired_Wristguards', 'Big_Cleaver', 'Sacrificial_Shank', 'Grounded_Crown', 'Fearsome_Piercer', 'Bag_of_Nails', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon'],
			ring: ['attack', 'lifesteal']
		},
		135: {
			items: ['Menacing_Mask', 'Battery_Stick', 'Lifegiving_Gem', 'Spiked_Gloves', 'Wired_Wristguards', 'Bloodstained_Gloves', 'Eelimp_in_a_Bottle', 'Big_Cleaver', 'Sacrificial_Shank', 'Grounded_Crown', 'Fearsome_Piercer', 'Doppelganger_Signet', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon'],
			ring: ['attack', 'lifesteal']
		},
		136: {
			items: ['Menacing_Mask', 'Battery_Stick', 'Spiked_Gloves', 'Tame_Snimp', 'Wired_Wristguards', 'Big_Cleaver', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Snimp__Fanged_Blade', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon'],
			ring: ['attack', 'health']
		},
		137: {
			items: ['Menacing_Mask', 'Battery_Stick', 'Spiked_Gloves', 'Tame_Snimp', 'Wired_Wristguards', 'Big_Cleaver', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Snimp__Fanged_Blade', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon'],
			ring: ['attack', 'health']
		},
		138: {
			items: ['Menacing_Mask', 'Battery_Stick', 'Spiked_Gloves', 'Tame_Snimp', 'Wired_Wristguards', 'Big_Cleaver', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Snimp__Fanged_Blade', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon'],
			ring: ['attack', 'health']
		},
		139: {
			items: ['Menacing_Mask', 'Battery_Stick', 'Spiked_Gloves', 'Tame_Snimp', 'Wired_Wristguards', 'Big_Cleaver', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Snimp__Fanged_Blade', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon'],
			ring: ['attack', 'health']
		},
		140: {
			items: ['Menacing_Mask', 'Battery_Stick', 'Spiked_Gloves', 'Tame_Snimp', 'Wired_Wristguards', 'Big_Cleaver', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Snimp__Fanged_Blade', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon'],
			ring: ['attack', 'health']
		}
	};

	const { items, ring } = equip[autoBattle.enemyLevel];
	if (autoBattle.sessionEnemiesKilled === 0 && autoBattle.enemy.baseHealth === autoBattle.enemy.health && autoBattle.maxEnemyLevel === autoBattle.enemyLevel) {
		ABItemSwap(items, ring);
		autoBattle.popup(true, false, true);
	}

	//Turning off autoLevel
	if (autoBattle.maxEnemyLevel >= 129 && autoBattle.rings.level < 50) {
		if (autoBattle.autoLevel) autoBattle.toggleAutoLevel();
		return;
	}

	if (!autoBattle.autoLevel) autoBattle.toggleAutoLevel();
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
