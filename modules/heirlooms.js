const heirloomMods = {
	Shield: {
		playerEfficiency: "Player Efficiency",
		trainerEfficiency: "Trainer Efficiency",
		storageSize: "Storage Size",
		breedSpeed: "Breed Speed",
		trimpHealth: "Trimp Health",
		trimpAttack: "Trimp Attack",
		trimpBlock: "Trimp Block",
		critDamage: "Crit Damage",
		critChance: "Crit Chance",
		voidMaps: "Void Map Drop Chance",
		plaguebringer: "Plaguebringer",
		prismatic: "Prismatic Shield",
		gammaBurst: "Gamma Burst",
		inequality: "Inequality",
	},
	Staff: {
		metalDrop: "Metal Drop Rate",
		foodDrop: "Food Drop Rate",
		woodDrop: "Wood Drop Rate",
		gemsDrop: "Gem Drop Rate",
		fragmentsDrop: "Fragment Drop Rate",
		FarmerSpeed: "Farmer Efficiency",
		LumberjackSpeed: "Lumberjack Efficiency",
		MinerSpeed: "Miner Efficiency",
		DragimpSpeed: "Dragimp Efficiency",
		ExplorerSpeed: "Explorer Efficiency",
		ScientistSpeed: "Scientist Efficiency",
		FluffyExp: "Pet Exp",
		ParityPower: "Parity Power",
	},
	Core: {
		fireTrap: "Fire Trap Damage",
		poisonTrap: "Poison Trap Damage",
		lightningTrap: "Lightning Trap Power",
		runestones: "Runestone Drop Rate",
		strengthEffect: "Strength Tower Effect",
		condenserEffect: "Condenser Effect",
	}
}

function evaluateHeirloomMods(loom, location) {

	const heirloomRarity = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
	const raretokeep = heirloomRarity.indexOf(getPageSetting('heirloomAutoRareToKeep', currPortalUniverse));
	const typeToKeep = getPageSetting('heirloomAutoTypeToKeep', currPortalUniverse);
	const heirloomEquipType = typeToKeep === 1 ? 'Shield' : typeToKeep === 2 ? 'Staff' : typeToKeep === 3 ? 'All' : 'Core';

	var modName;
	var heirloomType;
	var rarity;

	var heirloomLocation = location.includes('Equipped') ? game.global[location] : game.global[location][loom];
	heirloomType = heirloomLocation.type;
	if (heirloomType !== heirloomEquipType && heirloomEquipType !== 'All') return 0;
	rarity = heirloomLocation.rarity;
	if (rarity !== raretokeep) return 0;

	//Will check if the heirloom is perfect and if it is, we will return infinity to make sure it is not recycled.
	//If it is not perfect, we will return 0 to make sure it is recycled.
	//Identify the setting prefix for the heirloom type
	const varAffix = heirloomType === 'Staff' ? 'heirloomAutoStaffMod' : heirloomType === 'Shield' ? 'heirloomAutoShieldMod' : heirloomType === 'core' ? 'heirloomAutoCoreMod' : null;
	var targetMods = [];
	var emptyMods = 0;
	//Increment through the setting inputs and push them to the targetMods array if not set to empty.
	for (var x = 1; x < (heirloomLocation.mods.length + 1); x++) {
		if (getPageSetting(varAffix + x) === 'Empty') continue;
		targetMods.push(getPageSetting(varAffix + x));
	}
	//Loop through the heirloom mods and check if they are empty or not. If they are empty, increment emptyMods. If they are not empty, remove them from the targetMods array.
	for (var m in heirloomLocation.mods) {
		modName = heirloomLocation.mods[m][0];
		if (modName === 'empty') {
			emptyMods++;
			continue;
		}
		modName = heirloomMods[heirloomType][modName];
		targetMods = targetMods.filter(e => e !== modName);
	}
	if (targetMods.length <= emptyMods)
		return Infinity;
	else
		return 0;
}

function worthOfHeirlooms() {
	var heirloomWorth = { 'Shield': [], 'Staff': [], 'Core': [] };

	//Identify heirlooms to be recycled.
	var recycle = [];
	for (var index in game.global.heirloomsExtra) {
		if (evaluateHeirloomMods(index, 'heirloomsExtra') === 0) {
			recycle.push(index);
		}
	}

	//Recycle heirlooms
	if (recycle.length > 0) {
		for (var x = recycle.length; x !== 0; x--) {
			selectHeirloom(recycle[x - 1], 'heirloomsExtra');
			recycleHeirloom(true);
		}
	}

	//Pushing data for remaining heirlooms
	for (var index in game.global.heirloomsExtra) {
		var theLoom = game.global.heirloomsExtra[index];
		var data = { 'location': 'heirloomsExtra', 'index': index, 'rarity': theLoom.rarity, 'eff': evaluateHeirloomMods(index, 'heirloomsExtra') };
		heirloomWorth[theLoom.type].push(data);
	}
	var valuesort = function (a, b) { return b.eff - a.eff; };
	heirloomWorth['Shield'].sort(valuesort);
	heirloomWorth['Staff'].sort(valuesort);
	heirloomWorth['Core'].sort(valuesort);

	return heirloomWorth;
}

function autoheirlooms() {
	if (!game.global.heirloomsExtra.length > 0) return;
	if (!getPageSetting('heirloomAuto') || getPageSetting('heirloomAutoTypeToKeep') === 'None' || getPageSetting('heirloomAutoRareToKeep') === 'None') return;

	const typeToKeep = getPageSetting('heirloomAutoTypeToKeep');
	const heirloomType = typeToKeep === 1 ? 'Shield' : typeToKeep === 2 ? 'Staff' : typeToKeep === 3 ? 'Core' : 'All';
	var heirloomWorth;

	//Looping through the heirloom type set in typetokeep setting and stashing them.
	if (heirloomType !== 'All') {
		while ((game.global.heirloomsCarried.length < getMaxCarriedHeirlooms()) && game.global.heirloomsExtra.length > 0) {
			heirloomWorth = worthOfHeirlooms();
			if (heirloomWorth[heirloomType].length > 0) {
				var carriedHeirlooms = heirloomWorth[heirloomType].shift();
				selectHeirloom(carriedHeirlooms.index, 'heirloomsExtra');
				carryHeirloom();
			}
			else break;
		}
	}
	//If typetokeep is set to all will loop through all heirloom types and stash them.
	else if (getPageSetting('heirloomAutoTypeToKeep') == 4) {
		const heirloomTypes = ['Shield', 'Staff'];
		if (game.global.universe === 1) heirloomTypes.push('Core');

		while ((game.global.heirloomsCarried.length < getMaxCarriedHeirlooms()) && game.global.heirloomsExtra.length > 0) {
			for (var x = 0; x < heirloomTypes.length; x++) {
				heirloomWorth = worthOfHeirlooms();
				if (heirloomWorth[heirloomTypes[x]].length > 0) {
					var carriedHeirlooms = heirloomWorth[heirloomTypes[x]].shift();
					selectHeirloom(carriedHeirlooms.index, 'heirloomsExtra');
					carryHeirloom();
				}
			}
		}
	}
	return;
}

//Heirloom Swapping
function HeirloomSearch(heirloom) {
	for (var loom of game.global.heirloomsCarried)
		if (loom.name == getPageSetting(heirloom))
			return loom;
}

//Loops through heirlooms and checks if they have a specified modifier on them, divides by 10 if in u2.
function HeirloomModSearch(heirloom, modifier) {
	if (heirloom === undefined || getPageSetting(heirloom) === undefined || getPageSetting(heirloom) === false || HeirloomSearch(heirloom) === undefined) {
		var type = ['ShieldEquipped', 'StaffEquipped'];
		for (var y = (type.length - 1); y > -1; y--) {
			if (Object.keys(game.global[type[y]]).length === 0) continue;
			var loom = game.global[type[y]];
			for (var i = (loom.mods.length - 1); i > -1; i--) {
				if (loom.mods[i][0] === modifier)
					return loom.mods[i][1];
			}
		}
		return undefined;
	}
	if (game.global.ShieldEquipped.name === getPageSetting(heirloom)) {
		var loom = game.global.ShieldEquipped;
		for (var i = (loom.mods.length - 1); i > -1; i--) {
			if (loom.mods[i][0] == modifier)
				return loom.mods[i][1];
		}
		return undefined;
	}
	if (game.global.StaffEquipped.name === getPageSetting(heirloom)) {
		var loom = game.global.StaffEquipped;
		for (var i = (loom.mods.length - 1); i > -1; i--) {
			if (loom.mods[i][0] == modifier)
				return loom.mods[i][1];
		}
		return undefined;
	}
	for (var loom of game.global.heirloomsCarried) {
		if (loom.name == getPageSetting(heirloom)) {
			for (var i = (loom.mods.length - 1); i > -1; i--) {
				if (loom.mods[i][0] == modifier)
					return loom.mods[i][1];
			}
		}
	}
	return undefined;
}

function HeirloomEquipShield(heirloom) {
	if (HeirloomSearch(heirloom) !== undefined && game.global.ShieldEquipped.name !== getPageSetting(heirloom)) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(HeirloomSearch(heirloom)), "heirloomsCarried", true);
		equipHeirloom(true);
		gammaBurstPct = getPageSetting('gammaBurstCalc') && (getHeirloomBonus("Shield", "gammaBurst") / 100) > 0 ? (getHeirloomBonus("Shield", "gammaBurst") / 100) : 1;
	} else if (HeirloomSearch(heirloom) === undefined && game.global.ShieldEquipped.name !== getPageSetting(heirloom))
		if (tenSecondInterval) debug("The heirloom named \"" + getPageSetting(heirloom) + "\" doesn\'t exist. Rename an heirloom or adjust the input for your " + autoTrimpSettings[heirloom].name() + " shield. This will be causing at least one of your HD Ratios to be incorrect.");
}

function HeirloomEquipStaff(heirloom) {
	if (HeirloomSearch(heirloom) !== undefined && game.global.StaffEquipped.name !== getPageSetting(heirloom)) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(HeirloomSearch(heirloom)), "heirloomsCarried", true);
		equipHeirloom(true);
	} else if (HeirloomSearch(heirloom) === undefined && game.global.StaffEquipped.name !== getPageSetting(heirloom))
		if (tenSecondInterval) debug("The heirloom named \"" + getPageSetting(heirloom) + "\" doesn\'t exist. Rename an heirloom or adjust the input for your " + autoTrimpSettings[heirloom].name() + " staff. This will be causing any loot related calcs to be incorrect.");
}

function HeirloomShieldSwapped() {
	if (!game.global.ShieldEquipped.rarity >= 10) return;
	gammaBurstPct = getPageSetting('gammaBurstCalc') && (getHeirloomBonus("Shield", "gammaBurst") / 100) > 0 ? (getHeirloomBonus("Shield", "gammaBurst") / 100) : 1;
	shieldEquipped = game.global.ShieldEquipped.id;
}

function heirloomShieldToEquip(mapType, query) {
	if (!getPageSetting('heirloom')) return;
	if (!getPageSetting('heirloomShield')) return;

	if (MODULES.portal.portalForVoid) {
		if (Object.keys(game.global.ShieldEquipped).length === 0 && game.permaBoneBonuses.voidMaps.tracker < (100 - game.permaBoneBonuses.voidMaps.owned)) return ('heirloomInitial');
		return;
	}

	if (slowScumming && game.global.mapsActive) {
		var oddCell = false;
		if ((game.global.lastClearedMapCell + 1) % 2 === 0) oddCell = true;

		if (oddCell) return ('heirloomAfterpush');
		else return ('heirloomInitial');
	}

	//Initial vars for swapping heirlooms
	var currChallenge = game.global.challengeActive.toLowerCase()

	var swapZone = hdStats.isC3 && (currChallenge === 'mayhem' || currChallenge === 'pandemonium' || currChallenge === 'desolation') && getPageSetting(currChallenge) && getPageSetting(currChallenge + 'SwapZone') > 0 ? getPageSetting(currChallenge + 'SwapZone') : hdStats.isC3 ? getPageSetting('heirloomSwapZoneC3') : hdStats.isDaily ? getPageSetting('heirloomSwapZoneDaily') : hdStats.isFiller ? getPageSetting('heirloomSwapZone') : 999;
	if (swapZone === -1) swapZone = 999;
	if (hdStats.isDaily && dailyOddOrEven().active) {
		if (swapZone % 2 === dailyOddOrEven().remainder) swapZone += 1;
	}
	var afterpushShield = hdStats.isC3 ? 'heirloomC3' : 'heirloomAfterpush';
	voidPBSwap = false;
	var voidActive = mapType === 'void';
	if (voidActive && query) {
		voidPBSwap =
			game.global.universe === 2 && getPageSetting('heirloomVoidSwap') &&
			//Not running fast challenge
			!challengeActive('Glass') && !challengeActive('Berserk') && !challengeActive('Archaeology') && (!challengeActive('Quest') && currQuest() !== 8) &&
			//Not at final map cell
			game.global.lastClearedMapCell !== getCurrentMapObject().size - 2 &&
			//Current enemy is slow
			!fastimps.includes(game.global.mapGridArray[game.global.lastClearedMapCell + 1].name) &&
			//Next cell is fast
			fastimps.includes(game.global.mapGridArray[game.global.lastClearedMapCell + 2].name) &&
			//Not in double attack voids
			game.global.voidBuff !== 'doubleAttack';
	}

	if (voidActive && (getPageSetting('heirloomVoid') !== "undefined" || (voidPBSwap && getPageSetting('heirloomVoidPlaguebringer') !== "undefined"))) {
		if (voidPBSwap && getPageSetting('heirloomVoidPlaguebringer') !== "undefined") {
			return ('heirloomVoidPlaguebringer');
		}
		else
			return ('heirloomVoid');
	}
	else if (voidActive && voidPBSwap && getPageSetting('heirloomInitial') !== "undefined")
		return ('heirloomInitial');
	else if (getPageSetting(afterpushShield) !== "undefined" && (mapType === 'map' || mapType === 'void') && getPageSetting('heirloomMapSwap'))
		return (afterpushShield);
	else if (getPageSetting('heirloomSpire') !== "undefined" && isDoingSpire())
		return ('heirloomSpire');
	else if (getPageSetting(afterpushShield) !== "undefined" && game.global.world >= swapZone)
		return (afterpushShield);
	else if (getPageSetting('heirloomInitial') !== "undefined")
		return ('heirloomInitial');
}

function heirloomStaffToEquip(mapType) {
	if (!getPageSetting('heirloom')) return;
	if (!getPageSetting('heirloomStaff')) return;

	if (getPageSetting('heirloomStaffWorld') != "undefined" && !game.global.mapsActive) {
		return ('heirloomStaffWorld');
	} else if (game.global.mapsActive) {
		const mapObject = getCurrentMapObject();
		const mapBonus = mapObject.bonus;
		if (challengeActive('Pandemonium') && getPageSetting('pandemoniumAE') > 1 && getPageSetting('pandemoniumStaff') != "undefined" && getPageSetting('pandemoniumAEZone') > 0 && game.global.world >= getPageSetting('pandemoniumAEZone') && game.global.lastClearedCell > 59)
			return ('pandemoniumStaff');
		else if (getPageSetting('heirloomStaffVoid') != "undefined" && mapObject.location === 'Void')
			return ('heirloomStaffVoid');
		else if (getPageSetting('heirloomStaffMap') != "undefined" && mapBonus === undefined)
			return ('heirloomStaffMap');
		else if (getCurrentMapObject().bonus != undefined) {
			if (getPageSetting('heirloomStaffFood') != "undefined" && mapBonus.includes("sc"))
				return ('heirloomStaffFood');
			else if (getPageSetting('heirloomStaffWood') != "undefined" && mapBonus.includes("wc"))
				return ('heirloomStaffWood');
			else if (getPageSetting('heirloomStaffMetal') != "undefined" && mapBonus.includes("mc"))
				return ('heirloomStaffMetal');
			else if (game.global.universe === 2 && getPageSetting('heirloomStaffResource') != "undefined" && mapBonus.includes("rc"))
				return ('heirloomStaffResource');
			else if (getPageSetting('heirloomStaffMap') != "undefined")
				return ('heirloomStaffMap');
		}
	}
}

function heirloomSwapping() {
	if (!getPageSetting('heirloom')) return;

	var mapType = 'world';
	if (game.global.mapsActive) mapType = 'map';
	if (game.global.mapsActive && getCurrentMapObject().location == "Void") mapType = 'void';
	//Swapping Shields
	if (getPageSetting('heirloomShield')) {
		var shield = heirloomShieldToEquip(mapType, true);
		if (shield !== undefined) HeirloomEquipShield(shield);
	}

	//Swapping Staffs
	if (getPageSetting('heirloomStaff')) {
		var staff = heirloomStaffToEquip(mapType, true);
		if (staff !== undefined) HeirloomEquipStaff(staff);
	}
}