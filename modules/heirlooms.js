function evaluateHeirloomMods(loom, location) {
	const heirloomLocation = location.includes('Equipped') ? game.global[location] : game.global[location][loom];
	const heirloomType = heirloomLocation.type;
	const totalMods = heirloomLocation.mods.length;
	const heirloomRarity = game.heirlooms.rarityNames;
	const typeToKeep = getPageSetting('heirloomAutoTypeToKeep');
	const heirloomEquipType = ['Shield', 'Staff', 'All', 'Core'][typeToKeep - 1];

	if (heirloomType !== heirloomEquipType && heirloomEquipType !== 'All') return 0;
	const heirloomRaritySetting = getPageSetting('heirloomAutoRarityPlus');
	const rarity = heirloomLocation.rarity;

	const rareToKeep = heirloomRarity.indexOf(getPageSetting(`heirloomAutoRareToKeep${heirloomType}`));
	if ((heirloomRaritySetting && rarity < rareToKeep) || (!heirloomRaritySetting && rarity !== rareToKeep)) return 0;

	const blacklist = getPageSetting(`heirloomAutoBlacklist${heirloomType}`)[heirloomRarity[rarity]] || [];
	const heirloomData = heirloomInfo(heirloomType);
	let targetMods = getPageSetting(`heirloomAutoMods${heirloomType}`)[heirloomRarity[rarity]] || [];
	const targetModsTotal = targetMods.length;
	let emptyMods = 0;

	for (const mod of heirloomLocation.mods) {
		const baseName = mod[0];
		if (baseName === 'empty') {
			emptyMods++;
			continue;
		}

		const modName = heirloomData[baseName].name;
		if (blacklist.includes(modName)) return 0;
		targetMods = targetMods.filter((e) => e !== modName);
	}

	const modTarget = heirloomType === 'Core' ? getPageSetting('heirloomAutoCoreModTarget') : getPageSetting('heirloomAutoModTarget');
	const modGoal = Math.max(0, Math.min(modTarget, totalMods));
	const remainingMods = targetMods.length - emptyMods;

	const modsLeft = totalMods - remainingMods - emptyMods;
	if (modTarget > 0 && remainingMods > 0 && modGoal >= targetModsTotal - modsLeft + emptyMods) return totalMods - remainingMods;
	if (modGoal > modsLeft) return 0;
	if (remainingMods <= 0) return Infinity;
	if (remainingMods >= totalMods - modGoal) return totalMods - remainingMods;

	return 0;
}

function worthOfHeirlooms() {
	const heirloomWorth = { Shield: [], Staff: [], Core: [] };
	if (!game.global.heirloomsExtra.length === 0 || !getPageSetting('heirloomAuto') || getPageSetting('heirloomAutoTypeToKeep') === 0) return heirloomWorth;

	let heirloomEvaluations = game.global.heirloomsExtra.map((_, index) => evaluateHeirloomMods(index, 'heirloomsExtra'));

	for (const [index, theLoom] of game.global.heirloomsExtra.entries()) {
		const data = { location: 'heirloomsExtra', index, rarity: theLoom.rarity, eff: heirloomEvaluations[index] };
		heirloomWorth[theLoom.type].push(data);
	}

	Object.values(heirloomWorth).forEach((heirlooms) => {
		heirlooms.sort((a, b) => b.eff - a.eff);
	});

	return heirloomWorth;
}

function autoHeirlooms(portal = false) {
	if (portal && !portalWindowOpen) return;
	if (game.global.heirloomsExtra.length === 0 || !getPageSetting('heirloomAuto') || getPageSetting('heirloomAutoTypeToKeep') === 0) return;

	const maxHeirlooms = getMaxCarriedHeirlooms();
	const typeToKeep = getPageSetting('heirloomAutoTypeToKeep');

	const heirloomType = typeToKeep === 1 ? 'Shield' : typeToKeep === 2 ? 'Staff' : typeToKeep === 4 ? 'Core' : 'All';
	const heirloomTypes = heirloomType === 'All' ? ['Shield', 'Staff', 'Core'] : [heirloomType];
	const heirloomTypeEnabled = heirloomTypes.reduce((obj, type) => {
		obj[type] = getPageSetting(`heirloomAuto${type}`);
		return obj;
	}, {});

	let weights = worthOfHeirlooms();
	let types = Object.keys(weights).filter((key) => heirloomTypeEnabled[key]).length;
	if (types === 0) return;

	let heirloomText;
	while (game.global.heirloomsCarried.length < maxHeirlooms && game.global.heirloomsExtra.length > 0) {
		for (let x = 0; x < heirloomTypes.length; x++) {
			if (game.global.heirloomsCarried.length >= maxHeirlooms) break;
			weights = worthOfHeirlooms();

			if (weights && weights[heirloomTypes[x]].length > 0) {
				let carriedHeirlooms = weights[heirloomTypes[x]].shift();

				if (heirloomTypeEnabled[heirloomTypes[x]] && carriedHeirlooms.eff > 0) {
					selectHeirloom(carriedHeirlooms.index, 'heirloomsExtra');
					carryHeirloom();
				} else {
					/* recycleHeirloom(true); */
					continue;
				}

				x--;
			}
		}

		break;
	}

	/* if (portal) return heirloomText;
	else debug(`AutoHeirlooms: ${heirloomText}`, 'heirlooms'); */
}

//Heirloom Swapping
//Checks to see if we own the heirloom we are trying to equip
function heirloomSearch(heirloom, type) {
	const heirloomName = getPageSetting(heirloom);

	if (type && game.global[`${type}Equipped`].name === heirloomName) return game.global[`${type}Equipped`];

	return game.global.heirloomsCarried.find((loom) => loom.name === heirloomName);
}

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
	if (!getPageSetting('heirloomSwapping') || !getPageSetting(`heirloom${type}`)) return;

	const heirloomName = getPageSetting(heirloom);
	const heirloomDetails = heirloomSearch(heirloom);
	const isHeirloomEquipped = game.global[`${type}Equipped`].name === heirloomName;

	if (heirloomDetails && !isHeirloomEquipped) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(heirloomDetails), 'heirloomsCarried', true);
		equipHeirloom(!heirloomsShown);
		if (type === 'Shield') updateShieldData();
	} else if (!heirloomDetails && !isHeirloomEquipped && atConfig.intervals.tenSecond) {
		const hdMessage = type === 'Shield' ? `This will be causing at least one of your HD Ratios to be incorrect.` : ``;
		debug(`The heirloom named ${heirloomName} doesn't exist. Rename an heirloom or adjust the input for your ${autoTrimpSettings[heirloom].name()} ${type.toLowerCase()}.${hdMessage}`, `error`);
	}
}

function updateShieldData() {
	const updateGamma = getPageSetting('gammaBurstCalc');
	const gammaValue = updateGamma ? getHeirloomBonus('Shield', 'gammaBurst') / 100 : 0;
	MODULES.heirlooms.gammaBurstPct = gammaValue > 0 ? gammaValue : 1;

	MODULES.heirlooms.breedHeirloom = usingBreedHeirloom();
	MODULES.heirlooms.shieldEquipped = game.global.ShieldEquipped.id;
}

function heirloomShieldToEquip(mapType = _getWorldType(), swapLooms = false, hdCheck = true, sendingArmy = false) {
	if (!getPageSetting('heirloomSwapping') || !getPageSetting('heirloomShield')) return;

	const afterpushShield = trimpStats.isC3 ? 'heirloomC3' : 'heirloomAfterpush';
	//If we are slow scumming and we are on an ODD cell then equip afterpush shield otherwise equip initial shield
	if (MODULES.maps.slowScumming && mapType === 'map') {
		if ((game.global.lastClearedMapCell + 1) % 2 === 0 || game.global.lastClearedMapCell === getCurrentMapObject().size - 2) return afterpushShield;
		else return 'heirloomInitial';
	}

	/* challenge shields */
	if (challengeActive('Duel') && getPageSetting('duel') && getPageSetting('duelShield') !== 'undefined') return 'duelShield';
	else if (noBreedChallenge() && getPageSetting('trapper') && getPageSetting('trapperShield') !== 'undefined') return 'trapperShield';
	else if (challengeActive('Wither') && getPageSetting('wither') && getPageSetting('witherShield') !== 'undefined') return 'witherShield';

	if (swapLooms && game.global.soldierHealth <= 0 && !sendingArmy && getPerkLevel('Anticipation') === 0 && !noBreedChallenge() && _breedTimeRemaining() > 0) {
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
	if (trimpStats.daily) {
		const dailyModifiers = dailyOddOrEven();
		if (dailyModifiers.active && swapZone % 2 === dailyModifiers.remainder) swapZone += 1;
	}

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
		//Otherwise set plagueSwap global variable to false to ensure we don't mess up any code later on.
		else MODULES.heirlooms.plagueSwap = false;
	}

	//Set swap zone to 999 if we're running our afterpush shield & cell after next is compressed for maximum plaguebringer damage
	if (mapType === 'world' && !dontSwap && game.global.universe === 2 && getPageSetting('heirloomCompressedSwap') && game.global.world >= swapZone && game.global.world >= 201 && game.global.lastClearedCell < 96 && game.global.gridArray[game.global.lastClearedCell + 3].u2Mutation.indexOf('CMP') !== -1) swapZone = 999;

	let voidActive = mapType === 'void';
	if (voidActive && swapLooms) {
		//const fastChallenges = !challengeActive('Glass') && !challengeActive('Berserk') && game.challenges.Berserk.weakened !== 20 && !challengeActive('Archaeology') && !challengeActive('Quest') && getCurrentQuest() !== 8;
		MODULES.heirlooms.plagueSwap =
			game.global.universe === 2 &&
			game.global.voidBuff &&
			getPageSetting('heirloomVoidSwap') &&
			!challengeActive('Glass') &&
			!challengeActive('Berserk') &&
			!game.challenges.Berserk.weakened !== 20 &&
			!challengeActive('Archaeology') &&
			!challengeActive('Quest') &&
			getCurrentQuest() !== 8 &&
			game.global.lastClearedMapCell !== getCurrentMapObject().size - 2 &&
			!atData.fightInfo.fastImps.includes(game.global.mapGridArray[game.global.lastClearedMapCell + 1].name) &&
			atData.fightInfo.fastImps.includes(game.global.mapGridArray[game.global.lastClearedMapCell + 2].name) &&
			game.global.voidBuff !== 'doubleAttack';
	}

	if (voidActive && (getPageSetting('heirloomVoid') !== 'undefined' || (MODULES.heirlooms.plagueSwap && getPageSetting('heirloomVoidPlaguebringer') !== 'undefined'))) {
		if (MODULES.heirlooms.plagueSwap && getPageSetting('heirloomVoidPlaguebringer') !== 'undefined') return 'heirloomVoidPlaguebringer';
		else return 'heirloomVoid';
	}
	//Return initial shield if we are in a void map and are going to plaguebringer scum the cell after next
	//This is a backup for if the void shield setting have not been properly setup.
	if (voidActive && MODULES.heirlooms.plagueSwap && getPageSetting('heirloomInitial') !== 'undefined') return 'heirloomInitial';
	//Run afterpush (c3 if running one) shield if we are in a map or a void.
	else if (getPageSetting(afterpushShield) !== 'undefined' && (mapType === 'map' || mapType === 'void') && getPageSetting('heirloomMapSwap')) return afterpushShield;
	else if (getPageSetting('heirloomSpire') !== 'undefined' && isDoingSpire()) return 'heirloomSpire';
	else if (game.global.formation === 5 && getPageSetting('heirloomWindStack') !== 'undefined') return 'heirloomWindStack';
	else if (getPageSetting(afterpushShield) !== 'undefined' && game.global.world >= swapZone) return afterpushShield;
	else if (getPageSetting('heirloomInitial') !== 'undefined') return 'heirloomInitial';
}

function heirloomStaffToEquip() {
	if (!getPageSetting('heirloomSwapping') || !getPageSetting('heirloomStaff')) return;

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

function heirloomSwapping(sendingArmy = false) {
	if (!getPageSetting('heirloomSwapping')) return;

	const mapType = _getWorldType();

	if (getPageSetting('heirloomShield')) {
		const shield = heirloomShieldToEquip(mapType, true, true, sendingArmy);
		if (shield) heirloomEquip(shield, 'Shield');
	}

	if (getPageSetting('heirloomStaff')) {
		const staff = heirloomStaffToEquip();
		if (staff) heirloomEquip(staff, 'Staff');
	}
}

function usingBreedHeirloom(mapCheck = false) {
	if (!getPageSetting('heirloomSwapping') || !getPageSetting('heirloomShield')) return false;

	if (mapCheck) {
		if (liquifiedZone() || getCurrentWorldCell().level + Math.max(0, maxOneShotPower(true) - 1) >= 100) return false;
	}

	let breedHeirloom = getPageSetting('heirloomBreed');
	if (challengeActive('Archaeology') && getPageSetting('archaeology')) {
		const archBreedShield = getPageSetting('archaeologyBreedShield');
		if (archBreedShield !== 'undefined') breedHeirloom = archBreedShield;
	}

	if (breedHeirloom === 'undefined') return false;

	return game.global.ShieldEquipped.name === breedHeirloom;
}
