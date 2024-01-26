function tdStringCode2() {
	const trapIndexs = ['', 'Fire', 'Frost', 'Poison', 'Lightning', 'Strength', 'Condenser', 'Knowledge'];
	const inputString = document.getElementById('importBox').value.replace(/\s/g, '');
	let s = new String(inputString);
	let index = s.indexOf('+', 0);
	s = s.slice(0, index);
	let length = s.length;

	let saveLayout = [];
	for (let i = 0; i < length; i++) {
		saveLayout.push(trapIndexs[s.charAt(i)]);
	}
	playerSpire['savedLayout' + -1] = saveLayout;

	if (playerSpire.runestones + playerSpire.getCurrentLayoutPrice() < playerSpire.getSavedLayoutPrice(-1)) return false;
	playerSpire.resetTraps();
	for (let x = 0; x < saveLayout.length; x++) {
		if (!saveLayout[x]) continue;
		playerSpire.buildTrap(x, saveLayout[x]);
	}
}

var oldPlayerSpireDrawInfo = playerSpire.drawInfo;
playerSpire.drawInfo = function (arguments) {
	let ret = oldPlayerSpireDrawInfo.apply(this, arguments);
	let elem = document.getElementById('spireTrapsWindow');
	if (!elem) return arguments;
	let importBtn = `<div onclick="MAZLookalike('spireImport')" class="spireControlBox">Import</div>`;
	elem.innerHTML = importBtn + elem.innerHTML;
	return arguments;
};

function ABItemSwap(items, ring) {
	if (items) {
		for (var item in autoBattle.items) {
			if (autoBattle.items[item].equipped) {
				autoBattle.items[item].equipped = false;
			}
		}
		for (var item of items) {
			if (!autoBattle.items[item].equipped) {
				if (autoBattle.items[item].hidden) autoBattle.items[item].hidden = false;
				autoBattle.items[item].equipped = true;
			}
		}
	}

	if (ring) {
		autoBattle.rings.mods = ring;
	}
}

function automateSpireAssault() {
	return;
	if (!getPageSetting('automateSpireAssault')) return;
	if (autoBattle.enemyLevel === 121) {
		if (autoBattle.rings.level === 49 && autoBattle.shards >= autoBattle.getRingLevelCost()) {
			autoBattle.levelRing();
		}
	}

	if (autoBattle.rings.level === 50 && (autoBattle.items.Basket_of_Souls.level === 10 || autoBattle.items.Snimp__Fanged_Blade.level === 11)) {
		if (autoBattle.items.Basket_of_Souls.level === 10 && autoBattle.shards >= autoBattle.upgradeCost('Basket_of_Souls')) autoBattle.upgrade('Basket_of_Souls');
		if (autoBattle.items.Snimp__Fanged_Blade.level === 11 && autoBattle.shards >= autoBattle.upgradeCost('Snimp__Fanged_Blade')) autoBattle.upgrade('Snimp__Fanged_Blade');
	}

	if (autoBattle.rings.level >= 50) {
		if (autoBattle.enemyLevel === 130) {
			//Done
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']];
			var ring = ['attack', 'lifesteal'];
		}
		if (autoBattle.enemyLevel === 131) {
			//Done
			var items = [['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Grounded_Crown'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']];
			var ring = ['attack', 'lifesteal'];
		}
		if (autoBattle.enemyLevel === 132) {
			//Done
			var items = [['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Bloodstained_Gloves'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Grounded_Crown'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Nullifium_Armor'], ['Haunted_Harpoon']];
			var ring = ['attack', 'lifesteal'];
		}
		if (autoBattle.enemyLevel === 133) {
			//Done
			var items = [['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']];
			var ring = ['attack', 'lifesteal'];
		}
		if (autoBattle.enemyLevel === 134) {
			//Done
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Grounded_Crown'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']];
			var ring = ['attack', 'lifesteal'];
		}
		if (autoBattle.enemyLevel === 135) {
			//Done
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Wired_Wristguards'], ['Bloodstained_Gloves'], ['Eelimp_in_a_Bottle'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Grounded_Crown'], ['Fearsome_Piercer'], ['Doppelganger_Signet'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']];
			var ring = ['attack', 'lifesteal'];
		}
		if (autoBattle.enemyLevel === 136) {
			//Done 2d10h
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']];
			var ring = ['attack', 'health'];
		}
		if (autoBattle.enemyLevel === 137) {
			//Done 18h47m
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']];
			var ring = ['attack', 'health'];
		}
		if (autoBattle.enemyLevel === 138) {
			//Done 1d20h
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']];
			var ring = ['attack', 'health'];
		}
		if (autoBattle.enemyLevel === 139) {
			//Done 1d6h
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']];
			var ring = ['attack', 'health'];
		}
		if (autoBattle.enemyLevel === 140) {
			//Done 3d6h
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']];
			var ring = ['attack', 'health'];
		}
	}

	//Swapping Items
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
	let dust = 0;
	let shards = 0;

	let dustContracts = 0;
	let shardContracts = 0;
	for (let item in autoBattle.items) {
		const itemsToSkip = ['Sword', 'Menacing_Mask', 'Armor', 'Rusty_Dagger', 'Fists_of_Goo', 'Battery_Stick', 'Pants'];
		if (itemsToSkip.includes(item)) continue;
		if (typeof autoBattle.items[item].dustType === 'undefined') dustContracts += autoBattle.contractPrice(item);
		else shardContracts += autoBattle.contractPrice(item);
	}
	dust += dustContracts;
	shards += shardContracts;

	let dustItems = 0;
	let shardItems = 0;
	for (let item in autoBattle.items) {
		const { startPrice, priceMod, level, dustType } = autoBattle.items[item];
		//if (typeof (autoBattle.items[item].dustType) !== 'undefined' && autoBattle.items[item].dustType === 'shards') continue;
		let itemPrice = startPrice !== undefined ? startPrice : 5;
		let itemPriceMod = priceMod !== undefined ? priceMod : 3;
		for (var x = 0; x < level; x++) {
			if (typeof dustType === 'undefined') dustItems += itemPrice * (Math.pow(itemPriceMod, x) / itemPriceMod);
			else shardItems += itemPrice * (Math.pow(itemPriceMod, x) / itemPriceMod);
		}
	}
	dust += dustItems;
	shards += shardItems;

	let dustBonuses = 0;
	let shardBonuses = 0;
	for (let bonus in autoBattle.bonuses) {
		const { price, priceMod, level } = autoBattle.bonuses[bonus];
		for (let x = 0; x < level; x++) {
			if (bonus !== 'Scaffolding') dustBonuses += Math.ceil(price * Math.pow(priceMod, x));
			else shardBonuses += Math.ceil(price * Math.pow(priceMod, x));
		}
	}
	dust += dustBonuses;
	shards += shardBonuses;

	let dustOneTimers = 0;
	let shardOneTimers = 0;
	for (let item in autoBattle.oneTimers) {
		if (typeof autoBattle.oneTimers[item].useShards === 'undefined') dustOneTimers += autoBattle.oneTimerPrice(item);
		else shardOneTimers += autoBattle.oneTimerPrice(item);
	}
	dust += dustOneTimers;
	shards += shardOneTimers;

	//Ring
	let ringCost = 0;
	if (autoBattle.oneTimers['The_Ring'].owned && autoBattle.rings.level > 1) {
		ringCost += Math.ceil(15 * Math.pow(2, autoBattle.rings.level) - 30);
	}
	shards += ringCost;

	return [dust, shards];
}
