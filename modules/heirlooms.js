MODULES.heirlooms = {
	plagueSwap: false,
	compressedCalc: false,
	gammaBurstPct: 1,
	shieldEquipped: null
};

function evaluateHeirloomMods(loom, location) {
	const heirloomLocation = location.includes('Equipped') ? game.global[location] : game.global[location][loom];
	const heirloomType = heirloomLocation.type;
	const heirloomRarity = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
	const raretokeep = heirloomRarity.indexOf(getPageSetting(`heirloomAutoRareToKeep${heirloomType}`));
	const typeToKeep = getPageSetting('heirloomAutoTypeToKeep');
	const heirloomEquipType = ['Shield', 'Staff', 'All', 'Core'][typeToKeep - 1];

	if (heirloomType !== heirloomEquipType && heirloomEquipType !== 'All') return 0;

	const rarity = heirloomLocation.rarity;
	if ((getPageSetting('heirloomAutoRarityPlus') && rarity < raretokeep) || (!getPageSetting('heirloomAutoRarityPlus') && rarity !== raretokeep)) return 0;

	const varAffix = { Staff: 'heirloomAutoStaffMod', Shield: 'heirloomAutoShieldMod', Core: 'heirloomAutoCoreMod' }[heirloomType] || null;
	const blacklist = getPageSetting(`heirloomAuto${heirloomType}Blacklist`);
	const heirloomData = heirloomInfo(heirloomType);
	let targetMods = [];
	let emptyMods = 0;

	for (let x = 1; x < heirloomLocation.mods.length + 1; x++) {
		const modSetting = getPageSetting(varAffix + x);
		if (modSetting !== 'Any') targetMods.push(modSetting);
	}

	for (const mod of heirloomLocation.mods) {
		let modName = [mod][0][0];
		if (modName === 'empty') {
			emptyMods++;
			continue;
		}
		if (blacklist.includes(game.heirlooms[heirloomType][modName].name)) return 0;
		modName = heirloomData[modName].name;
		if (blacklist.includes(modName)) return 0;
		targetMods = targetMods.filter((e) => e !== modName);
	}

	//Work out the target number of mods to have on the heirloom.
	const modGoal = Math.max(0, Math.min(getPageSetting('heirloomAutoModTarget'), heirloomLocation.mods.length));
	const remainingMods = targetMods.length - emptyMods;

	if (remainingMods <= 0) return Infinity;
	if (remainingMods >= heirloomLocation.mods.length - modGoal) return heirloomLocation.mods.length - remainingMods;

	return 0;
}

function worthOfHeirlooms() {
	if (!game.global.heirloomsExtra.length > 0 || !getPageSetting('heirloomAuto') || getPageSetting('heirloomAutoTypeToKeep') === 0) return;
	const heirloomWorth = { Shield: [], Staff: [], Core: [] };

	const recycle = game.global.heirloomsExtra
		.map((_, index) => index)
		.filter((index) => evaluateHeirloomMods(index, 'heirloomsExtra') === 0)
		.reverse();

	for (const index of recycle) {
		selectHeirloom(index, 'heirloomsExtra');
		recycleHeirloom(true);
	}

	for (const [index, theLoom] of game.global.heirloomsExtra.entries()) {
		const data = { location: 'heirloomsExtra', index, rarity: theLoom.rarity, eff: evaluateHeirloomMods(index, 'heirloomsExtra') };
		heirloomWorth[theLoom.type].push(data);
	}

	Object.values(heirloomWorth).forEach((heirlooms) => {
		heirlooms.sort((a, b) => b.eff - a.eff);
	});

	return heirloomWorth;
}

function autoHeirlooms(portal) {
	if (!game.global.heirloomsExtra.length > 0 || !getPageSetting('heirloomAuto') || getPageSetting('heirloomAutoTypeToKeep') === 0) return;
	if (portal && !portalWindowOpen) return;

	const typeToKeep = getPageSetting('heirloomAutoTypeToKeep');
	const heirloomType = typeToKeep === 1 ? 'Shield' : typeToKeep === 2 ? 'Staff' : typeToKeep === 4 ? 'Core' : 'All';
	const heirloomTypes = heirloomType === 'All' ? (game.global.universe === 1 ? ['Shield', 'Staff', 'Core'] : ['Shield', 'Staff']) : [heirloomType];

	const heirloomTypeEnabled = heirloomTypes.reduce((obj, type) => {
		obj[type] = getPageSetting(`heirloomAuto${type}`);
		return obj;
	}, {});

	const weights = worthOfHeirlooms();
	let types = 0;

	for (let key in weights) {
		if (heirloomTypeEnabled[key]) types++;
		else delete weights[key];
	}

	if (types === 0) return;

	const carrySpace = getMaxCarriedHeirlooms() - game.global.heirloomsCarried.length;
	const counts = Object.entries(weights).reduce((acc, [typeKey, looms]) => {
		acc[typeKey] = Math.min(looms.length, Math.floor(carrySpace / types));
		return acc;
	}, {});

	let used = Object.values(counts).reduce((acc, val) => (acc += val), 0);
	types = Object.entries(counts).reduce((acc, [key, count]) => (acc += count < weights[key].length));

	while (types > 0 && used <= carrySpace - types) {
		for (const key in Object.keys(counts)) {
			const uncountedLooms = weights[key].length - counts[key];
			if (uncountedLooms === 0) continue;

			let inc = Math.floor(carrySpace / types);
			if (uncountedLooms < inc) {
				inc = uncountedLooms;
				types--;
			}

			counts[key] += inc;
			used += inc;
		}
	}

	if (used < game.global.heirloomsExtra.length) {
		let n = 0;
		while (used < carrySpace) {
			const key = counts[Object.keys(counts)[n]];
			if (counts[key] < weights[key].length) counts[key]++;
			n++;
		}
	}

	// Instead of using an array to say if a loom should be removed we instead use a bitmask as it is more efficient.
	// Here every bit just represents the corresponding index its the same thing as an array of booleans

	const toKeepBitmask = Object.entries(weights).reduce((acc, [key, loomList]) => {
		// We know we get to keep counts amount of heirlooms for each type, and since the weights array is sorted from
		// heighest value to lowest we just grab the first counts heirlooms and mark them as the ones we want to keep.
		// Thus the fact they are out of order in the weights array doesn't matter as we will be sure to later
		// remove from the array starting at the back.

		for (let i = 0; i < counts[key]; i++) {
			// Here we set the bit on position i to 1 via a bitshift
			acc |= 1 << loomList[i].index;
		}
	}, 0b0);

	// Because we know the game recycles all heirlooms on portal there isn't really a reason to
	// explicitly recyle in this function. So instead we save a lot of processing by, only ever selecting heirlooms
	// we know we are going to keep.

	// This for loop assures we are always removing from the back of the array and thus won't get
	// array out of bound errors.

	for (let idx = game.global.heirloomsExtra.length - 1; idx >= 0; idx--) {
		if (toKeepBitmask & (1 << idx)) {
			selectHeirloom(idx, 'heirloomsExtra');
			carryHeirloom();
		}
	}
}

//Heirloom Swapping
//Checks to see if we own the heirloom we are trying to equip
function heirloomSearch(heirloom) {
	const heirloomName = getPageSetting(heirloom);
	return game.global.heirloomsCarried.find((loom) => loom.name === heirloomName);
}

//Loops through heirlooms and checks if they have a specified modifier on them, divides by 10 if in u2.
function heirloomModSearch(heirloom, modifier) {
	const heirloomName = getPageSetting(heirloom);
	const heirloomDetails = heirloomSearch(heirloom);
	const heirloomsToCheck = [game.global.ShieldEquipped, game.global.StaffEquipped];

	if (heirloomDetails) heirloomsToCheck.push(heirloomDetails);

	for (const loom of heirloomsToCheck) {
		if (loom.name !== heirloomName) continue;
		if (modifier === 'gammaBurst' && loom.rarity >= 10) return Infinity;
		for (const mod of loom.mods) {
			if (mod[0] === modifier) return mod[1];
		}
	}

	if (!heirloom || heirloomName === 'undefined' || !heirloomDetails) {
		for (const loom of [game.global.ShieldEquipped, game.global.StaffEquipped]) {
			if (Object.keys(loom).length <= 1) continue;
			if (modifier === 'gammaBurst' && loom.rarity >= 10) return Infinity;
			for (const mod of loom.mods) {
				if (mod[0] === modifier) return mod[1];
			}
		}
	}

	return undefined;
}

function heirloomEquip(heirloom, type) {
	if (!getPageSetting('heirloom') || !getPageSetting(`heirloom${type}`)) return;

	const heirloomName = getPageSetting(heirloom);
	const heirloomDetails = heirloomSearch(heirloom);
	const isHeirloomEquipped = game.global[`${type}Equipped`].name === heirloomName;

	if (heirloomDetails && !isHeirloomEquipped) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(heirloomDetails), 'heirloomsCarried', true);
		equipHeirloom(true);
		if (type === 'Shield') heirloomShieldSwapped();
	} else if (!heirloomDetails && !isHeirloomEquipped && atSettings.intervals.tenSecond) {
		const hdMessage = type === 'Shield' ? `This will be causing at least one of your HD Ratios to be incorrect.` : ``;
		debug(`The heirloom named ${heirloomName} doesn't exist. Rename an heirloom or adjust the input for your ${autoTrimpSettings[heirloom].name()} ${type.toLowerCase()}.${hdMessage}`, `other`);
	}
}

function heirloomShieldSwapped() {
	MODULES.heirlooms.gammaBurstPct = getPageSetting('gammaBurstCalc') && getHeirloomBonus('Shield', 'gammaBurst') / 100 > 0 ? getHeirloomBonus('Shield', 'gammaBurst') / 100 : 1;
	MODULES.heirlooms.shieldEquipped = game.global.ShieldEquipped.id;
}

function heirloomShieldToEquip(mapType, swapLooms, hdCheck = true) {
	if (!getPageSetting('heirloom') || !getPageSetting('heirloomShield')) return;

	const afterpushShield = trimpStats.isC3 ? 'heirloomC3' : 'heirloomAfterpush';
	//If we are slow scumming and we are on an ODD cell then equip afterpush shield otherwise equip initial shield
	if (MODULES.maps.slowScumming && mapType === 'map') {
		if ((game.global.lastClearedMapCell + 1) % 2 === 0 || game.global.lastClearedMapCell === getCurrentMapObject().size - 2) return afterpushShield;
		else return 'heirloomInitial';
	}

	if (swapLooms && !game.global.fighting && breedTimeRemaining().cmp(0.1) > 0 && getPerkLevel('Anticipation') === 0) {
		if (challengeActive('Archaeology') && getPageSetting('archaeologyBreedShield') !== 'undefined') return 'archaeologyBreedShield';
		if (getPageSetting('heirloomBreed') !== 'undefined') return 'heirloomBreed';
	}

	const currChallenge = game.global.challengeActive.toLowerCase();

	//Identify the swap zone for shield swapping.
	//1) If we are running frigid/mayhem/panda/deso and the challenge is active then use the challenges swap zone.
	//2) If we are in a C2/C3 then use the C3 swap zone.
	//3) If we are running a daily then use the daily swap zone.
	//4) Otherwise if in a filler use regular swap zone.
	let swapZone =
		trimpStats.isC3 && (currChallenge === 'frigid' || currChallenge === 'mayhem' || currChallenge === 'pandemonium' || currChallenge === 'desolation') && getPageSetting(currChallenge) && getPageSetting(currChallenge + 'SwapZone') > 0
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
	const dontSwap = currChallenge === 'trapper' || (currChallenge === 'berserk' && game.challenges.Berserk.weakened !== 20) || currChallenge === 'trappapalooza';
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

	let voidActive = mapType === 'void';
	if (voidActive && swapLooms) {
		//const fastChallenges = !challengeActive('Glass') && !challengeActive('Berserk') && game.challenges.Berserk.weakened !== 20 && !challengeActive('Archaeology') && !challengeActive('Quest') && _getCurrentQuest() !== 8;
		MODULES.heirlooms.plagueSwap =
			game.global.universe === 2 &&
			game.global.voidBuff &&
			getPageSetting('heirloomVoidSwap') &&
			!challengeActive('Glass') &&
			!challengeActive('Berserk') &&
			!game.challenges.Berserk.weakened !== 20 &&
			!challengeActive('Archaeology') &&
			!challengeActive('Quest') &&
			_getCurrentQuest() !== 8 &&
			game.global.lastClearedMapCell !== getCurrentMapObject().size - 2 &&
			!MODULES.fightinfo.fastImps.includes(game.global.mapGridArray[game.global.lastClearedMapCell + 1].name) &&
			MODULES.fightinfo.fastImps.includes(game.global.mapGridArray[game.global.lastClearedMapCell + 2].name) &&
			game.global.voidBuff !== 'doubleAttack';
	}
	if (voidActive && (getPageSetting('heirloomVoid') !== 'undefined' || (MODULES.heirlooms.plagueSwap && getPageSetting('heirloomVoidPlaguebringer') !== 'undefined'))) {
		if (MODULES.heirlooms.plagueSwap && getPageSetting('heirloomVoidPlaguebringer') !== 'undefined') return 'heirloomVoidPlaguebringer';
		else return 'heirloomVoid';
	}
	//Return Duel shield if we are running that challenge with the settings active
	if (challengeActive('Duel') && getPageSetting('duel') && getPageSetting('duelShield') !== 'undefined') return 'duelShield';
	else if (noBreedChallenge() && getPageSetting('trapper') && getPageSetting('trapperShield') !== 'undefined') return 'trapperShield';
	else if (challengeActive('Wither') && getPageSetting('wither') && getPageSetting('witherShield') !== 'undefined') return 'witherShield';
	//Return initial shield if we are in a void map and are going to plaguebringer scum the cell after next
	//This is a backup for if the void shield setting have not been properly setup.
	else if (voidActive && MODULES.heirlooms.plagueSwap && getPageSetting('heirloomInitial') !== 'undefined') return 'heirloomInitial';
	//Run afterpush (c3 if running one) shield if we are in a map or a void.
	else if (getPageSetting(afterpushShield) !== 'undefined' && (mapType === 'map' || mapType === 'void') && getPageSetting('heirloomMapSwap')) return afterpushShield;
	else if (getPageSetting('heirloomSpire') !== 'undefined' && isDoingSpire()) return 'heirloomSpire';
	else if (game.global.formation === 5 && getPageSetting('heirloomWindStack') !== 'undefined') return 'heirloomWindStack';
	else if (getPageSetting(afterpushShield) !== 'undefined' && game.global.world >= swapZone) return afterpushShield;
	else if (getPageSetting('heirloomInitial') !== 'undefined') return 'heirloomInitial';
}

function heirloomStaffToEquip(mapType) {
	if (!getPageSetting('heirloom') || !getPageSetting('heirloomStaff')) return;

	if (!game.global.mapsActive) {
		return getWorldHeirloomStaff();
	} else {
		return getMapHeirloomStaff();
	}
}

function getWorldHeirloomStaff() {
	if (['Trapper', 'Trappapalooza'].includes(trimpStats.currChallenge) && getPageSetting('trapper') && getPageSetting('trapperWorldStaff') !== 'undefined') return 'trapperWorldStaff';
	if (challengeActive('Exterminate') && getPageSetting('exterminate') && getPageSetting('exterminateWorldStaff') !== 'undefined') return 'exterminateWorldStaff';
	if (getPageSetting('heirloomStaffWorld') !== 'undefined') return 'heirloomStaffWorld';
}

function getMapHeirloomStaff() {
	if ((MODULES.maps.fragmentFarming || MODULES.maps.fragmentCost !== Infinity) && getPageSetting('heirloomStaffFragment') !== 'undefined') return 'heirloomStaffFragment';
	if (mapSettings.mapName === 'Experience' && getPageSetting('experienceStaff') !== 'undefined') return 'experienceStaff';
	if (mapSettings.mapName === 'Pandemonium Farming' && getPageSetting('pandemoniumStaff') !== 'undefined') return 'pandemoniumStaff';
	if (mapSettings.mapName === 'Quest' && mapSettings.resource && mapSettings.resource === 'science' && getPageSetting('heirloomStaffScience') !== 'undefined') return 'heirloomStaffScience';

	const mapObject = getCurrentMapObject();
	const mapBonus = mapObject.bonus;
	if (getPageSetting('heirloomStaffVoid') !== 'undefined' && mapObject.location === 'Void') return 'heirloomStaffVoid';
	if (getPageSetting('heirloomStaffMap') !== 'undefined' && mapBonus === undefined) return 'heirloomStaffMap';
	return getMapBonusHeirloomStaff(mapBonus);
}

function getMapBonusHeirloomStaff(mapBonus) {
	if (mapBonus !== undefined) {
		if (mapBonus === 'lc' || mapBonus === 'hc') {
			const gatherType = game.global.playerGathering[0].toUpperCase() + game.global.playerGathering.slice(1, 7);
			const staff = getPageSetting(`heirloomStaff${gatherType}`);
			if (staff && staff !== 'undefined') return `heirloomStaff${gatherType}`;
			if (getPageSetting('heirloomStaffMap') !== 'undefined') return 'heirloomStaffMap';
		}
		if (getPageSetting('heirloomStaffFood') !== 'undefined' && mapBonus.includes('sc')) return 'heirloomStaffFood';
		if (getPageSetting('heirloomStaffWood') !== 'undefined' && mapBonus.includes('wc')) return 'heirloomStaffWood';
		if (getPageSetting('heirloomStaffMetal') !== 'undefined' && mapBonus.includes('mc')) return 'heirloomStaffMetal';
		if (game.global.universe === 2 && getPageSetting('heirloomStaffScience') !== 'undefined' && mapBonus.includes('rc')) return 'heirloomStaffScience';
		if (getPageSetting('heirloomStaffMap') !== 'undefined') return 'heirloomStaffMap';
	}
}

function heirloomSwapping() {
	if (!getPageSetting('heirloom')) return;

	const mapType = game.global.voidBuff ? 'void' : game.global.mapsActive ? 'map' : 'world';
	if (getPageSetting('heirloomShield')) {
		const shield = heirloomShieldToEquip(mapType, true);
		if (shield) heirloomEquip(shield, 'Shield');
	}

	if (getPageSetting('heirloomStaff')) {
		const staff = heirloomStaffToEquip(mapType, true);
		if (staff) heirloomEquip(staff, 'Staff');
	}
}

function usingBreedHeirloom() {
	if (game.global.mapsActive) return false;
	let breedHeirloom = getPageSetting('heirloomBreed');
	if (challengeActive('Archaeology') && getPageSetting('archaeologyBreedShield') !== 'undefined') breedHeirloom = getPageSetting('archaeologyBreedShield');
	if (breedHeirloom === 'undefined') return false;

	return game.global.ShieldEquipped.name === breedHeirloom;
}
