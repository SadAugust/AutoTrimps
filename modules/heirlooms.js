MODULES.heirlooms = {
	plagueSwap: false,
	compressedCalc: false,
	gammaBurstPct: 1,
	shieldEquipped: game.global.ShieldEquipped.id,
}

MODULES.heirloomMods = {
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

	var heirloomLocation = location.includes('Equipped') ? game.global[location] : game.global[location][loom];
	var heirloomType = heirloomLocation.type;

	const heirloomRarity = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
	const raretokeep = heirloomRarity.indexOf(getPageSetting('heirloomAutoRareToKeep' + heirloomType));
	const typeToKeep = getPageSetting('heirloomAutoTypeToKeep');
	const heirloomEquipType = typeToKeep === 1 ? 'Shield' : typeToKeep === 2 ? 'Staff' : typeToKeep === 3 ? 'All' : 'Core';

	var modName;

	var heirloomLocation = location.includes('Equipped') ? game.global[location] : game.global[location][loom];
	var heirloomType = heirloomLocation.type;
	if (heirloomType !== heirloomEquipType && heirloomEquipType !== 'All') return 0;

	const rarity = heirloomLocation.rarity;
	if (getPageSetting('heirloomAutoRarityPlus')) {
		if (rarity < raretokeep) return 0;
	}
	else if (rarity !== raretokeep) return 0;

	//Will check if the heirloom is perfect and if it is, we will return infinity to make sure it is not recycled.
	//If it is not perfect, we will return 0 to make sure it is recycled.
	//Identify the setting prefix for the heirloom type
	const varAffix = heirloomType === 'Staff' ? 'heirloomAutoStaffMod' : heirloomType === 'Shield' ? 'heirloomAutoShieldMod' : heirloomType === 'Core' ? 'heirloomAutoCoreMod' : null;
	const blacklist = getPageSetting("heirloomAuto" + heirloomType + "Blacklist");
	var targetMods = [];
	var emptyMods = 0;

	//Increment through the setting inputs and push them to the targetMods array if not set to empty.
	for (var x = 1; x < (heirloomLocation.mods.length + 1); x++) {
		if (getPageSetting(varAffix + x) === 'Any') continue;
		targetMods.push(getPageSetting(varAffix + x));
	}

	//Loop through the heirloom mods and check if they are empty or not. If they are empty, increment emptyMods. If they are not empty, remove them from the targetMods array.
	for (var m in heirloomLocation.mods) {
		modName = heirloomLocation.mods[m][0];
		if (modName === 'empty') {
			emptyMods++;
			continue;
		}
		modName = MODULES.heirloomMods[heirloomType][modName];
		if (blacklist.includes(modName)) return 0;
		targetMods = targetMods.filter(e => e !== modName);
	}

	//Work out the target number of mods to have on the heirloom.
	const modGoal = getPageSetting('heirloomAutoModTarget') <= 0 ? 0 : Math.min(getPageSetting('heirloomAutoModTarget'), heirloomLocation.mods.length);
	const remainingMods = targetMods.length - emptyMods;
	//Mark heirloom as perfect if remaining mods is less than or equal to 0.
	if (remainingMods <= 0) return Infinity;
	//Mark heirloom as imperfect but passable if remaining mods is greater or equal to heirloom mod length minus mod goal.
	else if (remainingMods >= (heirloomLocation.mods.length - modGoal)) return heirloomLocation.mods.length - remainingMods;
	//Mark heirloom as garbage
	else return 0;
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

function autoHeirlooms(portal) {
	if (!game.global.heirloomsExtra.length > 0) return;
	if (!getPageSetting('heirloomAuto') || getPageSetting('heirloomAutoTypeToKeep') === 'None') return;
	if (portal && !portalWindowOpen) return;
	const typeToKeep = getPageSetting('heirloomAutoTypeToKeep');
	const heirloomType = typeToKeep === 1 ? 'Shield' : typeToKeep === 2 ? 'Staff' : typeToKeep === 4 ? 'Core' : 'All';
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
	else if (getPageSetting('heirloomAutoTypeToKeep') === 3) {
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
		if (loom.name === getPageSetting(heirloom))
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
			if (loom.mods[i][0] === modifier)
				return loom.mods[i][1];
		}
		return undefined;
	}
	if (game.global.StaffEquipped.name === getPageSetting(heirloom)) {
		var loom = game.global.StaffEquipped;
		for (var i = (loom.mods.length - 1); i > -1; i--) {
			if (loom.mods[i][0] === modifier)
				return loom.mods[i][1];
		}
		return undefined;
	}
	for (var loom of game.global.heirloomsCarried) {
		if (loom.name === getPageSetting(heirloom)) {
			for (var i = (loom.mods.length - 1); i > -1; i--) {
				if (loom.mods[i][0] === modifier)
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
		MODULES.heirlooms.gammaBurstPct = getPageSetting('gammaBurstCalc') && (getHeirloomBonus("Shield", "gammaBurst") / 100) > 0 ? (getHeirloomBonus("Shield", "gammaBurst") / 100) : 1;
	} else if (HeirloomSearch(heirloom) === undefined && game.global.ShieldEquipped.name !== getPageSetting(heirloom))
		if (atSettings.intervals.tenSecond) debug("The heirloom named \"" + getPageSetting(heirloom) + "\" doesn\'t exist. Rename an heirloom or adjust the input for your " + autoTrimpSettings[heirloom].name() + " shield. This will be causing at least one of your HD Ratios to be incorrect.", "other");
}

function HeirloomEquipStaff(heirloom) {
	if (HeirloomSearch(heirloom) !== undefined && game.global.StaffEquipped.name !== getPageSetting(heirloom)) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(HeirloomSearch(heirloom)), "heirloomsCarried", true);
		equipHeirloom(true);
	} else if (HeirloomSearch(heirloom) === undefined && game.global.StaffEquipped.name !== getPageSetting(heirloom))
		if (atSettings.intervals.tenSecond) debug("The heirloom named \"" + getPageSetting(heirloom) + "\" doesn\'t exist. Rename an heirloom or adjust the input for your " + autoTrimpSettings[heirloom].name() + " staff. This will be causing any loot related calcs to be incorrect.", "other");
}

function HeirloomShieldSwapped() {
	if (!game.global.ShieldEquipped.rarity >= 10) return;
	MODULES.heirlooms.gammaBurstPct = getPageSetting('gammaBurstCalc') && (getHeirloomBonus("Shield", "gammaBurst") / 100) > 0 ? (getHeirloomBonus("Shield", "gammaBurst") / 100) : 1;
	MODULES.heirlooms.shieldEquipped = game.global.ShieldEquipped.id;
}

function heirloomShieldToEquip(mapType, swapLooms) {
	if (!getPageSetting('heirloom')) return;
	if (!getPageSetting('heirloomShield')) return;

	//If we are slow scumming and we are on an ODD cell then equip afterpush shield otherwise equip initial shield
	if (MODULES.maps.slowScumming && mapType === 'map') {
		if ((game.global.lastClearedMapCell + 1) % 2 === 0 || game.global.lastClearedMapCell === getCurrentMapObject().size - 2)
			return ('heirloomAfterpush');
		else
			return ('heirloomInitial');
	}

	//Initial vars for swapping heirlooms
	var currChallenge = game.global.challengeActive.toLowerCase();

	//Identify the swap zone for shield swapping.
	//1) If we are running mayhem/panda/deso and the challenge is active then use the challenges swap zone.
	//2) If we are in a C2/C3 then use the C3 swap zone.
	//3) If we are running a daily then use the daily swap zone.
	//4) Otherwise if in a filler use regular swap zone.
	var swapZone = hdStats.isC3 && (currChallenge === 'mayhem' || currChallenge === 'pandemonium' || currChallenge === 'desolation') && getPageSetting(currChallenge) && getPageSetting(currChallenge + 'SwapZone') > 0 ? getPageSetting(currChallenge + 'SwapZone') :
		hdStats.isC3 ? getPageSetting('heirloomSwapZoneC3') :
			hdStats.isDaily ? getPageSetting('heirloomSwapZoneDaily') :
				hdStats.isFiller ? getPageSetting('heirloomSwapZone') :
					999;
	if (swapZone <= 0) swapZone = 999;
	//If we have the post void heirloom swap setting enabled and have already run void maps run this swap to afterpush shield until the end of the run
	if (getPageSetting('heirloomPostVoidSwap') && game.stats.totalVoidMaps.value > 0) swapZone = 0;
	//If we have the daily odd or even setting enabled and the negative daily mod is active then add one to our swap zone
	if (hdStats.isDaily && dailyOddOrEven().active && swapZone % 2 === dailyOddOrEven().remainder) swapZone += 1;
	//Challenges where abandoning your current army has the potential to be REALLY bad.
	var dontSwap = currChallenge === 'trapper' || currChallenge === 'berserk' || currChallenge === 'trappapalooza';
	if (swapLooms) {
		//Disable Shield swapping if on a dontSwap challenge and our army is still fighting or has health remaining.
		if (dontSwap && (game.global.fighting || game.global.soldierHealthRemaining > 0))
			return;
		//Disable plagueSwap variable if we are querying a map
		if (mapType === 'map')
			MODULES.heirlooms.plagueSwap = false;
	}
	if (mapType === 'world' && !dontSwap) {
		//Change swap zone to current zone if we're above X HD ratio.
		if (getPageSetting('heirloomSwapHD') > 0 && hdStats.hdRatio >= getPageSetting('heirloomSwapHD')) swapZone = game.global.world;
		//Set swap zone to current zone if we're above X HD ratio and next cell is compressed.
		//Only relevant if in U2 and we're above zone 200.
		if (game.global.universe === 2 && game.global.world >= 201 &&
			//If we have the compressedSwap setting enabled AND the value is greater than 0 (<= 0 means disabled)
			getPageSetting('heirloomCompressedSwap') && getPageSetting('heirloomSwapHDCompressed') > 0 &&
			//If current cell is less than 96 (95 is the last cell that a cell could possibly be compressed as that would be cell 97 and minimum length is primary+2 which would take it to 100)
			game.global.lastClearedCell < 96 && game.global.gridArray[game.global.lastClearedCell + 2].u2Mutation.indexOf('CMP') !== -1) {
			if (hdStats.hdRatio >= getPageSetting('heirloomSwapHDCompressed') || MODULES.heirlooms.plagueSwap) {
				swapZone = game.global.world;
				MODULES.heirlooms.plagueSwap = true;
			}
			else
				MODULES.heirlooms.plagueSwap = false;
		}
		//Otherwise set plagueSwap global var to false to ensure we don't mess up any code later on.
		else
			MODULES.heirlooms.plagueSwap = false;
	}
	//Set swap zone to 999 if we're running our afterpush shield & cell after next is compressed for maximum plaguebringer damage
	if (mapType === 'world' && !dontSwap && game.global.universe === 2 && getPageSetting('heirloomCompressedSwap') && game.global.world >= swapZone && game.global.world >= 201 && game.global.lastClearedCell < 96 && game.global.gridArray[game.global.lastClearedCell + 3].u2Mutation.indexOf('CMP') !== -1) swapZone = 999;

	var afterpushShield = hdStats.isC3 ? 'heirloomC3' : 'heirloomAfterpush';
	var voidActive = mapType === 'void';
	if (voidActive && swapLooms) {
		MODULES.heirlooms.plagueSwap =
			//Check we're in U2, we're in a void map and setting is enabled.
			game.global.universe === 2 && game.global.voidBuff !== '' && getPageSetting('heirloomVoidSwap') &&
			//Not running fast challenge
			!challengeActive('Glass') && !challengeActive('Berserk') && !challengeActive('Archaeology') && (!challengeActive('Quest') && currQuest() !== 8) &&
			//Not at final map cell
			game.global.lastClearedMapCell !== getCurrentMapObject().size - 2 &&
			//Current enemy is slow
			!MODULES.fightinfo.fastImps.includes(game.global.mapGridArray[game.global.lastClearedMapCell + 1].name) &&
			//Next cell is fast
			MODULES.fightinfo.fastImps.includes(game.global.mapGridArray[game.global.lastClearedMapCell + 2].name) &&
			//Not in double attack voids
			game.global.voidBuff !== 'doubleAttack';
	}
	if (voidActive && (getPageSetting('heirloomVoid') !== "undefined" || (MODULES.heirlooms.plagueSwap && getPageSetting('heirloomVoidPlaguebringer') !== "undefined"))) {
		if (MODULES.heirlooms.plagueSwap && getPageSetting('heirloomVoidPlaguebringer') !== "undefined") {
			return ('heirloomVoidPlaguebringer');
		}
		else
			return ('heirloomVoid');
	}
	//Return Duel shield if we are running that challenge with the settings active
	if (challengeActive('Duel') && getPageSetting('duel') && getPageSetting('duelShield') !== "undefined") {
		return ('duelShield');
	}
	//Return initial shield if we are in a void map and are going to plaguebringer scum the cell after next
	//This is a backup for if the void shield setting have not been properly setup.
	else if (voidActive && MODULES.heirlooms.plagueSwap && getPageSetting('heirloomInitial') !== "undefined")
		return ('heirloomInitial');
	//Run afterpush (c3 if running one) shield if we are in a map or a void.
	else if (getPageSetting(afterpushShield) !== "undefined" && (mapType === 'map' || mapType === 'void') && getPageSetting('heirloomMapSwap'))
		return (afterpushShield);
	//Run Spire shield if inside an active spire
	else if (getPageSetting('heirloomSpire') !== "undefined" && isDoingSpire())
		return ('heirloomSpire');
	//Run afterpush (c3 if running one) shield if above our swap zone
	else if (getPageSetting(afterpushShield) !== "undefined" && game.global.world >= swapZone)
		return (afterpushShield);
	//Otherwise run initial shield
	else if (getPageSetting('heirloomInitial') !== "undefined")
		return ('heirloomInitial');
}

function heirloomStaffToEquip(mapType) {
	if (!getPageSetting('heirloom')) return;
	if (!getPageSetting('heirloomStaff')) return;

	if (getPageSetting('heirloomStaffWorld') !== "undefined" && !game.global.mapsActive) {
		return ('heirloomStaffWorld');
	} else if (game.global.mapsActive) {
		const mapObject = getCurrentMapObject();
		const mapBonus = mapObject.bonus;
		if (challengeActive('Pandemonium') && getPageSetting('pandemoniumStaff') !== "undefined" && mapSettings.mapName === 'Pandemonium Farming')
			return ('pandemoniumStaff');
		else if (getPageSetting('heirloomStaffVoid') !== "undefined" && mapObject.location === 'Void')
			return ('heirloomStaffVoid');
		else if (getPageSetting('heirloomStaffMap') !== "undefined" && mapBonus === undefined)
			return ('heirloomStaffMap');
		else if (getCurrentMapObject().bonus !== undefined) {
			if (getPageSetting('heirloomStaffFood') !== "undefined" && mapBonus.includes("sc"))
				return ('heirloomStaffFood');
			else if (getPageSetting('heirloomStaffWood') !== "undefined" && mapBonus.includes("wc"))
				return ('heirloomStaffWood');
			else if (getPageSetting('heirloomStaffMetal') !== "undefined" && mapBonus.includes("mc"))
				return ('heirloomStaffMetal');
			else if (game.global.universe === 2 && getPageSetting('heirloomStaffResource') !== "undefined" && mapBonus.includes("rc"))
				return ('heirloomStaffResource');
			else if (getPageSetting('heirloomStaffMap') !== "undefined")
				return ('heirloomStaffMap');
		}
	}
}

function heirloomSwapping() {
	if (!getPageSetting('heirloom')) return;

	var mapType = 'world';
	if (game.global.voidBuff !== '') mapType = 'void';
	else if (game.global.mapsActive) mapType = 'map';
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

//AT versions for heirloom bonuses. 
//Check and update each patch!

function calcHeirloomBonus_AT(type, modName, number, getValueOnly, customShield) {
	var mod = getHeirloomBonus_AT(type, modName, customShield);
	if (!mod) return number;
	if (getValueOnly) return mod;
	if (mod <= 0) return number;
	return (number * ((mod / 100) + 1));
}

function getHeirloomBonus_AT(type, mod, customShield) {
	if (!game.heirlooms[type] || !game.heirlooms[type][mod]) {
		console.log('oh noes', type, mod)
	}
	var bonus = game.heirlooms[type][mod].currentBonus;
	//Override bonus if needed
	if (customShield) bonus = HeirloomModSearch(customShield, mod);
	if (bonus === undefined) bonus = 0;
	if (mod === "gammaBurst" && game.global.ShieldEquipped && game.global.ShieldEquipped.rarity >= 10) {
		bonus = MODULES.heirlooms.gammaBurstPct;
	}
	if (challengeActive('Daily') && typeof game.global.dailyChallenge.heirlost !== 'undefined') {
		if (type !== "FluffyExp" && type !== "VoidMaps") bonus *= dailyModifiers.heirlost.getMult(game.global.dailyChallenge.heirlost.strength);
	}
	return scaleHeirloomModUniverse(type, mod, bonus);
}

function getPlayerCritChance_AT(customShield) { //returns decimal: 1 = 100%
	if (challengeActive('Frigid') && game.challenges.Frigid.warmth <= 0) return 0;
	if (challengeActive('Duel')) return (game.challenges.Duel.enemyStacks / 100);
	var critChance = 0;
	critChance += (game.portal.Relentlessness.modifier * getPerkLevel("Relentlessness"));
	critChance += (getHeirloomBonus_AT("Shield", "critChance", customShield) / 100);
	if (game.talents.crit.purchased && getHeirloomBonus_AT("Shield", "critChance", customShield)) critChance += (getHeirloomBonus_AT("Shield", "critChance", customShield) * 0.005);
	if (Fluffy.isRewardActive("critChance")) critChance += (0.5 * Fluffy.isRewardActive("critChance"));
	if (game.challenges.Nurture.boostsActive() && game.challenges.Nurture.getLevel() >= 5) critChance += 0.35;
	if (game.global.universe === 2 && u2Mutations.tree.CritChance.purchased) critChance += 0.25;
	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.trimpCritChanceUp !== 'undefined') {
			critChance += dailyModifiers.trimpCritChanceUp.getMult(game.global.dailyChallenge.trimpCritChanceUp.strength);
		}
		if (typeof game.global.dailyChallenge.trimpCritChanceDown !== 'undefined') {
			critChance -= dailyModifiers.trimpCritChanceDown.getMult(game.global.dailyChallenge.trimpCritChanceDown.strength);
		}
		if (Fluffy.isRewardActive('SADailies')) critChance += Fluffy.rewardConfig.SADailies.critChance();
	}
	if (critChance > 7) critChance = 7;
	return critChance;
}

function getPlayerCritDamageMult_AT(customShield) {
	var relentLevel = getPerkLevel("Relentlessness");
	var critMult = (((game.portal.Relentlessness.otherModifier * relentLevel) + (getHeirloomBonus_AT("Shield", "critDamage", customShield) / 100)) + 1);
	critMult += (getPerkLevel("Criticality") * game.portal.Criticality.modifier);
	if (relentLevel > 0) critMult += 1;
	if (game.challenges.Nurture.boostsActive() && game.challenges.Nurture.getLevel() >= 5) critMult += 0.5;
	critMult += alchObj.getPotionEffect("Elixir of Accuracy");
	return critMult;
}

function getPlayerEqualityMult_AT(customShield) {
	var modifier = game.portal.Equality.modifier;
	var tempModifier = 1 - modifier;
	tempModifier *= (getHeirloomBonus_AT("Shield", "inequality", customShield) / 100);
	modifier += tempModifier;
	return modifier;
}

function getEnergyShieldMult_AT(mapType, noHeirloom) {
	if (game.global.universe !== 2) return 0;
	var total = 0;
	if (game.upgrades.Prismatic.done) total += 0.5; //Prismatic: Drops Z2
	if (game.upgrades.Prismalicious.done) total += 0.5; //Prismalicious: Drops from Prismatic Palace at Z20
	if (getPerkLevel("Prismal") > 0) total += (getPerkLevel("Prismal") * game.portal.Prismal.modifier); //Prismal perk, total possible is 100%
	total += (Fluffy.isRewardActive("prism") * 0.25); //Fluffy Prism reward, 25% each, total of 25% available
	if (challengeActive('Bublé')) total += 2.5; //Bublé challenge - 100%
	if (autoBattle.oneTimers.Suprism.owned) total += autoBattle.oneTimers.Suprism.getMult();

	if (!noHeirloom) {
		if (getHeirloomBonus_AT('Shield', 'prismatic', heirloomShieldToEquip(mapType)) > 0) total +=
			(getHeirloomBonus_AT('Shield', 'prismatic', heirloomShieldToEquip(mapType)) / 100);
	}
	return total;
}