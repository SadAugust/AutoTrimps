MODULES.heirlooms = {
	plagueSwap: false,
	compressedCalc: false,
	gammaBurstPct: 1,
	shieldEquipped: null
};

function evaluateHeirloomMods(loom, location) {
	var heirloomLocation = location.includes('Equipped') ? game.global[location] : game.global[location][loom];
	var heirloomType = heirloomLocation.type;

	const heirloomRarity = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
	const raretokeep = heirloomRarity.indexOf(getPageSetting('heirloomAutoRareToKeep' + heirloomType));
	const typeToKeep = getPageSetting('heirloomAutoTypeToKeep');
	const heirloomEquipType = typeToKeep === 1 ? 'Shield' : typeToKeep === 2 ? 'Staff' : typeToKeep === 3 ? 'All' : 'Core';

	if (heirloomType !== heirloomEquipType && heirloomEquipType !== 'All') return 0;

	const rarity = heirloomLocation.rarity;
	if (getPageSetting('heirloomAutoRarityPlus')) {
		if (rarity < raretokeep) return 0;
	} else if (rarity !== raretokeep) return 0;

	//Will check if the heirloom is perfect and if it is, we will return infinity to make sure it is not recycled.
	//If it is not perfect, we will return 0 to make sure it is recycled.
	//Identify the setting prefix for the heirloom type
	const varAffix = heirloomType === 'Staff' ? 'heirloomAutoStaffMod' : heirloomType === 'Shield' ? 'heirloomAutoShieldMod' : heirloomType === 'Core' ? 'heirloomAutoCoreMod' : null;
	const blacklist = getPageSetting('heirloomAuto' + heirloomType + 'Blacklist');
	var targetMods = [];
	var emptyMods = 0;

	//Increment through the setting inputs and push them to the targetMods array if not set to Any.
	for (var x = 1; x < heirloomLocation.mods.length + 1; x++) {
		if (getPageSetting(varAffix + x) === 'Any') continue;
		targetMods.push(getPageSetting(varAffix + x));
	}

	//Loop through the heirloom mods and check if they are empty or not. If they are empty, increment emptyMods. If they are not empty, remove them from the targetMods array.
	var modName;
	const heirloomData = heirloomInfo(heirloomType);
	for (var m in heirloomLocation.mods) {
		modName = heirloomLocation.mods[m][0];
		if (modName === 'empty') {
			emptyMods++;
			continue;
		}
		//Check if item on the blacklist is equal to the ingames mod name. If it is, return 0.
		if (blacklist.indexOf(game.heirlooms[heirloomType][modName].name) !== -1) return 0;
		modName = heirloomData[modName].name;
		//Check if item on the blacklist is equal to the AT mod name. If it is, return 0.
		if (blacklist.indexOf(modName) !== -1) return 0;
		targetMods = targetMods.filter((e) => e !== modName);
	}

	//Work out the target number of mods to have on the heirloom.
	const modGoal = getPageSetting('heirloomAutoModTarget') <= 0 ? 0 : Math.min(getPageSetting('heirloomAutoModTarget'), heirloomLocation.mods.length);
	const remainingMods = targetMods.length - emptyMods;
	//Mark heirloom as perfect if remaining mods is less than or equal to 0.
	if (remainingMods <= 0) return Infinity;
	//Mark heirloom as imperfect but passable if remaining mods is greater or equal to heirloom mod length minus mod goal.
	else if (remainingMods >= heirloomLocation.mods.length - modGoal) return heirloomLocation.mods.length - remainingMods;
	//Mark heirloom as garbage
	else return 0;
}

function worthOfHeirlooms() {
	var heirloomWorth = { Shield: [], Staff: [], Core: [] };

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
		var data = { location: 'heirloomsExtra', index: index, rarity: theLoom.rarity, eff: evaluateHeirloomMods(index, 'heirloomsExtra') };
		heirloomWorth[theLoom.type].push(data);
	}
	var valuesort = function (a, b) {
		return b.eff - a.eff;
	};
	heirloomWorth['Shield'].sort(valuesort);
	heirloomWorth['Staff'].sort(valuesort);
	heirloomWorth['Core'].sort(valuesort);

	return heirloomWorth;
}

function autoHeirlooms(portal) {
	if (!game.global.heirloomsExtra.length > 0) return;
	if (!getPageSetting('heirloomAuto') || getPageSetting('heirloomAutoTypeToKeep') === 0) return;
	if (portal && !portalWindowOpen) return;
	const typeToKeep = getPageSetting('heirloomAutoTypeToKeep');
	const heirloomType = typeToKeep === 1 ? 'Shield' : typeToKeep === 2 ? 'Staff' : typeToKeep === 4 ? 'Core' : 'All';
	var heirloomWorth;

	//Looping through the heirloom type set in typetokeep setting and stashing them.
	if (heirloomType !== 'All') {
		while (game.global.heirloomsCarried.length < getMaxCarriedHeirlooms() && game.global.heirloomsExtra.length > 0) {
			heirloomWorth = worthOfHeirlooms();
			if (heirloomWorth[heirloomType].length > 0) {
				var carriedHeirlooms = heirloomWorth[heirloomType].shift();
				selectHeirloom(carriedHeirlooms.index, 'heirloomsExtra');
				if (getPageSetting('heirloomAuto' + heirloomType)) carryHeirloom();
				else recycleHeirloom(true);
			} else break;
		}
	}
	//If typetokeep is set to all will loop through all heirloom types and stash them.
	else {
		const heirloomTypes = ['Shield', 'Staff'];
		if (game.global.universe === 1) heirloomTypes.push('Core');

		while (game.global.heirloomsCarried.length < getMaxCarriedHeirlooms() && game.global.heirloomsExtra.length > 0) {
			for (var x = 0; x < heirloomTypes.length; x++) {
				heirloomWorth = worthOfHeirlooms();
				if (heirloomWorth[heirloomTypes[x]].length > 0) {
					var carriedHeirlooms = heirloomWorth[heirloomTypes[x]].shift();
					selectHeirloom(carriedHeirlooms.index, 'heirloomsExtra');
					if (getPageSetting('heirloomAuto' + heirloomTypes[x])) carryHeirloom();
					else recycleHeirloom(true);
				}
			}
		}
	}
	return;
}

//Heirloom Swapping
//Checks to see if we own the heirloom we are trying to equip
function heirloomSearch(heirloom) {
	const heirloomName = getPageSetting(heirloom);
	var loom;
	for (loom of game.global.heirloomsCarried) if (loom.name === heirloomName) return loom;
}

//Loops through heirlooms and checks if they have a specified modifier on them, divides by 10 if in u2.
function heirloomModSearch(heirloom, modifier) {
	const heirloomName = getPageSetting(heirloom);
	const heirloomDetails = heirloomSearch(heirloom);
	var i;
	var loom;

	if (game.global.ShieldEquipped.name === heirloomName) {
		loom = game.global.ShieldEquipped;
		if (modifier === 'gammaBurst' && loom.rarity >= 10) return Infinity;
		for (i = loom.mods.length - 1; i > -1; i--) {
			if (loom.mods[i][0] === modifier) return loom.mods[i][1];
		}
		return undefined;
	} else if (game.global.StaffEquipped.name === heirloomName) {
		loom = game.global.StaffEquipped;
		for (i = loom.mods.length - 1; i > -1; i--) {
			if (loom.mods[i][0] === modifier) return loom.mods[i][1];
		}
		return undefined;
	}
	//If the heirloom exists and is in our inventory, check it for the modifier we're looking for
	else if (heirloomDetails) {
		if (modifier === 'gammaBurst' && heirloomDetails.rarity >= 10) return Infinity;
		for (i = heirloomDetails.mods.length - 1; i > -1; i--) {
			if (heirloomDetails.mods[i][0] === modifier) return heirloomDetails.mods[i][1];
		}
		return undefined;
	}
	//Checks through equipped heirlooms to try and find the mod we're searching for if the heirloom setting isn't properly set
	else {
		if (heirloom === undefined || heirloomName === 'undefined' || heirloomDetails === undefined) {
			var type = ['ShieldEquipped', 'StaffEquipped'];
			var y;
			for (y = type.length - 1; y > -1; y--) {
				if (Object.keys(game.global[type[y]]).length <= 1) continue;
				loom = game.global[type[y]];
				if (modifier === 'gammaBurst' && type[y] === 'ShieldEquipped' && loom.rarity >= 10) return Infinity;
				for (i = loom.mods.length - 1; i > -1; i--) {
					if (loom.mods[i][0] === modifier) return loom.mods[i][1];
				}
			}
		}
	}
	return undefined;
}

function heirloomEquipShield(heirloom) {
	if (!getPageSetting('heirloom') || !getPageSetting('heirloomShield')) return;
	const heirloomName = getPageSetting(heirloom);
	const heirloomDetails = heirloomSearch(heirloom);

	if (heirloomDetails !== undefined && game.global.ShieldEquipped.name !== heirloomName) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(heirloomDetails), 'heirloomsCarried', true);
		equipHeirloom(true);
		heirloomShieldSwapped();
	} else if (heirloomDetails === undefined && game.global.ShieldEquipped.name !== heirloomName && atSettings.intervals.tenSecond) debug(`The heirloom named ${heirloomName} doesn't exist. Rename an heirloom or adjust the input for your ${autoTrimpSettings[heirloom].name()} shield. This will be causing at least one of your HD Ratios to be incorrect.`, `other`);
}

function heirloomEquipStaff(heirloom) {
	if (!getPageSetting('heirloom') || !getPageSetting('heirloomStaff')) return;
	const heirloomName = getPageSetting(heirloom);
	const heirloomDetails = heirloomSearch(heirloom);

	if (heirloomDetails !== undefined && game.global.StaffEquipped.name !== heirloomName) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(heirloomDetails), 'heirloomsCarried', true);
		equipHeirloom(true);
	} else if (heirloomDetails === undefined && game.global.StaffEquipped.name !== heirloomName && atSettings.intervals.tenSecond) debug(`The heirloom named ${heirloomName} doesn't exist. Rename an heirloom or adjust the input for your ${autoTrimpSettings[heirloom].name()} staff.`, `other`);
}

function heirloomShieldSwapped() {
	MODULES.heirlooms.gammaBurstPct = getPageSetting('gammaBurstCalc') && getHeirloomBonus('Shield', 'gammaBurst') / 100 > 0 ? getHeirloomBonus('Shield', 'gammaBurst') / 100 : 1;
	MODULES.heirlooms.shieldEquipped = game.global.ShieldEquipped.id;
}

function heirloomShieldToEquip(mapType, swapLooms, hdCheck = true) {
	if (!getPageSetting('heirloom')) return;
	if (!getPageSetting('heirloomShield')) return;

	var afterpushShield = trimpStats.isC3 ? 'heirloomC3' : 'heirloomAfterpush';
	//If we are slow scumming and we are on an ODD cell then equip afterpush shield otherwise equip initial shield
	if (MODULES.maps.slowScumming && mapType === 'map') {
		if ((game.global.lastClearedMapCell + 1) % 2 === 0 || game.global.lastClearedMapCell === getCurrentMapObject().size - 2) return afterpushShield;
		else return 'heirloomInitial';
	}

	if (swapLooms && !game.global.fighting && getPageSetting('archaeologyBreedShield') !== 'undefined' && challengeActive('Archaeology') && breedTimeRemaining().cmp(0.1) > 0) {
		return 'archaeologyBreedShield';
	}

	//Initial vars for swapping heirlooms
	var currChallenge = game.global.challengeActive.toLowerCase();

	//Identify the swap zone for shield swapping.
	//1) If we are running mayhem/panda/deso and the challenge is active then use the challenges swap zone.
	//2) If we are in a C2/C3 then use the C3 swap zone.
	//3) If we are running a daily then use the daily swap zone.
	//4) Otherwise if in a filler use regular swap zone.
	var swapZone =
		trimpStats.isC3 && (currChallenge === 'mayhem' || currChallenge === 'pandemonium' || currChallenge === 'desolation') && getPageSetting(currChallenge) && getPageSetting(currChallenge + 'SwapZone') > 0
			? getPageSetting(currChallenge + 'SwapZone')
			: trimpStats.isC3
			? getPageSetting('heirloomSwapZoneC3')
			: trimpStats.isDaily
			? getPageSetting('heirloomSwapZoneDaily')
			: trimpStats.isOneOff
			? getPageSetting('heirloomSwapZoneOneOff')
			: trimpStats.isFiller
			? getPageSetting('heirloomSwapZone')
			: 999;
	if (swapZone <= 0) swapZone = 999;
	//If we have the post void heirloom swap setting enabled and have already run void maps run this swap to afterpush shield until the end of the run
	if (getPageSetting('heirloomPostVoidSwap') && game.stats.totalVoidMaps.value > 0) swapZone = 0;
	//If we have the daily odd or even setting enabled and the negative daily mod is active then add one to our swap zone
	if (trimpStats.isDaily && dailyOddOrEven().active && swapZone % 2 === dailyOddOrEven().remainder) swapZone += 1;
	//Challenges where abandoning your current army has the potential to be REALLY bad.
	var dontSwap = currChallenge === 'trapper' || (currChallenge === 'berserk' && game.challenges.Berserk.weakened !== 20) || currChallenge === 'trappapalooza';
	if (swapLooms) {
		//Disable Shield swapping if on a dontSwap challenge and our army is still fighting or has health remaining.
		if (dontSwap && (game.global.fighting || game.global.soldierHealthRemaining > 0)) return;
		//Disable shield swapping depending on auto abandon setting
		if (!shouldAbandon(false)) return;
		//Disable plagueSwap variable if we are querying a map
		if (mapType === 'map' && swapLooms) MODULES.heirlooms.plagueSwap = false;
	}
	if (mapType === 'world' && !dontSwap) {
		//Change swap zone to current zone if we're above X HD ratio.
		if (hdCheck && getPageSetting('heirloomSwapHD') > 0 && hdStats.hdRatioHeirloom >= getPageSetting('heirloomSwapHD') && shouldAbandon(false)) swapZone = game.global.world;
		//Set swap zone to current zone if we're above X HD ratio and next cell is compressed.
		//Only relevant if in U2 and we're above zone 200.
		if (
			game.global.universe === 2 &&
			game.global.world >= 201 &&
			//If we have the compressedSwap setting enabled AND the value is greater than 0 (<= 0 means disabled)
			getPageSetting('heirloomCompressedSwap') &&
			getPageSetting('heirloomSwapHDCompressed') > 0 &&
			//If current cell is less than 96 (95 is the last cell that a cell could possibly be compressed as that would be cell 97 and minimum length is primary+2 which would take it to 100)
			game.global.lastClearedCell < 96 &&
			game.global.gridArray[game.global.lastClearedCell + 2].u2Mutation.indexOf('CMP') !== -1
		) {
			if (hdStats.hdRatio >= getPageSetting('heirloomSwapHDCompressed') || MODULES.heirlooms.plagueSwap) {
				swapZone = game.global.world;
				MODULES.heirlooms.plagueSwap = true;
			} else MODULES.heirlooms.plagueSwap = false;
		}
		//Otherwise set plagueSwap global var to false to ensure we don't mess up any code later on.
		else MODULES.heirlooms.plagueSwap = false;
	}
	//Set swap zone to 999 if we're running our afterpush shield & cell after next is compressed for maximum plaguebringer damage
	if (mapType === 'world' && !dontSwap && game.global.universe === 2 && getPageSetting('heirloomCompressedSwap') && game.global.world >= swapZone && game.global.world >= 201 && game.global.lastClearedCell < 96 && game.global.gridArray[game.global.lastClearedCell + 3].u2Mutation.indexOf('CMP') !== -1) swapZone = 999;

	var voidActive = mapType === 'void';
	if (voidActive && swapLooms) {
		MODULES.heirlooms.plagueSwap =
			//Check we're in U2, we're in a void map and setting is enabled.
			game.global.universe === 2 &&
			game.global.voidBuff &&
			getPageSetting('heirloomVoidSwap') &&
			//Not running fast challenge
			!challengeActive('Glass') &&
			!challengeActive('Berserk') &&
			!game.challenges.Berserk.weakened !== 20 &&
			!challengeActive('Archaeology') &&
			!challengeActive('Quest') &&
			currQuest() !== 8 &&
			//Not at final map cell
			game.global.lastClearedMapCell !== getCurrentMapObject().size - 2 &&
			//Current enemy is slow
			!MODULES.fightinfo.fastImps.includes(game.global.mapGridArray[game.global.lastClearedMapCell + 1].name) &&
			//Next cell is fast
			MODULES.fightinfo.fastImps.includes(game.global.mapGridArray[game.global.lastClearedMapCell + 2].name) &&
			//Not in double attack voids
			game.global.voidBuff !== 'doubleAttack';
	}
	if (voidActive && (getPageSetting('heirloomVoid') !== 'undefined' || (MODULES.heirlooms.plagueSwap && getPageSetting('heirloomVoidPlaguebringer') !== 'undefined'))) {
		if (MODULES.heirlooms.plagueSwap && getPageSetting('heirloomVoidPlaguebringer') !== 'undefined') return 'heirloomVoidPlaguebringer';
		else return 'heirloomVoid';
	}
	//Return Duel shield if we are running that challenge with the settings active
	if (challengeActive('Duel') && getPageSetting('duel') && getPageSetting('duelShield') !== 'undefined') return 'duelShield';
	else if ((challengeActive('Trapper') || challengeActive('Trappapalooza')) && getPageSetting('trapper') && getPageSetting('trapperShield') !== 'undefined') return 'trapperShield';
	else if (challengeActive('Wither') && getPageSetting('wither') && getPageSetting('witherShield') !== 'undefined') return 'witherShield';
	//Return initial shield if we are in a void map and are going to plaguebringer scum the cell after next
	//This is a backup for if the void shield setting have not been properly setup.
	else if (voidActive && MODULES.heirlooms.plagueSwap && getPageSetting('heirloomInitial') !== 'undefined') return 'heirloomInitial';
	//Run afterpush (c3 if running one) shield if we are in a map or a void.
	else if (getPageSetting(afterpushShield) !== 'undefined' && (mapType === 'map' || mapType === 'void') && getPageSetting('heirloomMapSwap')) return afterpushShield;
	//Run Spire shield if inside an active spire
	else if (getPageSetting('heirloomSpire') !== 'undefined' && isDoingSpire()) return 'heirloomSpire';
	//Run Spire shield if currently in wind stance
	else if (game.global.formation === 5 && getPageSetting('heirloomWindStack') !== 'undefined') return 'heirloomWindStack';
	//Run afterpush (c3 if running one) shield if above our swap zone
	else if (getPageSetting(afterpushShield) !== 'undefined' && game.global.world >= swapZone) return afterpushShield;
	//Otherwise run initial shield
	else if (getPageSetting('heirloomInitial') !== 'undefined') return 'heirloomInitial';
}

function heirloomStaffToEquip(mapType) {
	if (!getPageSetting('heirloom')) return;
	if (!getPageSetting('heirloomStaff')) return;

	if (!game.global.mapsActive) {
		if (challengeActive('Exterminate') && getPageSetting('exterminate') && getPageSetting('exterminateWorldStaff') !== 'undefined') return 'exterminateWorldStaff';
		if (getPageSetting('heirloomStaffWorld') !== 'undefined') return 'heirloomStaffWorld';
	} else if (game.global.mapsActive) {
		const mapObject = getCurrentMapObject();
		const mapBonus = mapObject.bonus;
		if ((MODULES.maps.fragmentFarming || MODULES.maps.fragmentCost !== Infinity) && getPageSetting('heirloomStaffFragment') !== 'undefined') return 'heirloomStaffFragment';
		else if (mapSettings.mapName === 'Experience' && getPageSetting('experienceStaff') !== 'undefined') return 'experienceStaff';
		else if (mapSettings.mapName === 'Pandemonium Farming' && getPageSetting('pandemoniumStaff') !== 'undefined') return 'pandemoniumStaff';
		else if (mapSettings.mapName === 'Quest' && mapSettings.resource && mapSettings.resource === 'science' && getPageSetting('heirloomStaffScience') !== 'undefined') return 'heirloomStaffScience';
		else if (getPageSetting('heirloomStaffVoid') !== 'undefined' && mapObject.location === 'Void') return 'heirloomStaffVoid';
		else if (getPageSetting('heirloomStaffMap') !== 'undefined' && mapBonus === undefined) return 'heirloomStaffMap';
		else if (mapBonus !== undefined) {
			//Match your heirloom to your current gather setting during lc/hc maps.
			if (mapBonus === 'lc' || mapBonus === 'hc') {
				let gatherType = game.global.playerGathering[0].toUpperCase() + game.global.playerGathering.slice(1, 7);
				if (gatherType === 'Science') gatherType = 'Resource';
				const staff = getPageSetting('heirloomStaff' + gatherType);
				if (staff && staff !== 'undefined') return 'heirloomStaff' + gatherType;
				else if (getPageSetting('heirloomStaffMap') !== 'undefined') return 'heirloomStaffMap';
			}
			if (getPageSetting('heirloomStaffFood') !== 'undefined' && mapBonus.includes('sc')) return 'heirloomStaffFood';
			else if (getPageSetting('heirloomStaffWood') !== 'undefined' && mapBonus.includes('wc')) return 'heirloomStaffWood';
			else if (getPageSetting('heirloomStaffMetal') !== 'undefined' && mapBonus.includes('mc')) return 'heirloomStaffMetal';
			else if (game.global.universe === 2 && getPageSetting('heirloomStaffScience') !== 'undefined' && mapBonus.includes('rc')) return 'heirloomStaffScience';
			else if (getPageSetting('heirloomStaffMap') !== 'undefined') return 'heirloomStaffMap';
		}
	}
}

function heirloomSwapping() {
	if (!getPageSetting('heirloom')) return;

	var mapType = 'world';
	if (game.global.voidBuff) mapType = 'void';
	else if (game.global.mapsActive) mapType = 'map';
	//Swapping Shields
	if (getPageSetting('heirloomShield')) {
		var shield = heirloomShieldToEquip(mapType, true);
		if (shield !== undefined) heirloomEquipShield(shield);
	}

	//Swapping Staffs
	if (getPageSetting('heirloomStaff')) {
		var staff = heirloomStaffToEquip(mapType, true);
		if (staff !== undefined) heirloomEquipStaff(staff);
	}
}
