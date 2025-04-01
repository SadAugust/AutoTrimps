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
	const escapedName = heirloomName ? escapeHtmlAttribute(heirloomName, 'apos') : null;
	if (type && game.global[`${type}Equipped`].name === escapedName) return game.global[`${type}Equipped`];

	return game.global.heirloomsCarried.find((loom) => loom.name === escapedName);
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
	const isHeirloomEquipped = game.global[`${type}Equipped`].name === escapeHtmlAttribute(heirloomName, 'apos');

	if (heirloomDetails && !isHeirloomEquipped) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(heirloomDetails), 'heirloomsCarried', true);
		equipHeirloom(!heirloomsShown);
		if (type === 'Shield') updateShieldData();
	} else if (!heirloomDetails && !isHeirloomEquipped && atConfig.intervals.tenSecond) {
		const hdMessage = type === 'Shield' ? ` This will be causing at least one of your HD Ratios to be incorrect.` : ``;
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

	const currChallenge = game.global.challengeActive.toLowerCase();
	const dontSwapChallenges = ['trapper', 'trappapalooza'].includes(currChallenge) || (currChallenge === 'berserk' && game.challenges.Berserk.weakened !== 20);
	const afterpushShield = trimpStats.isC3 && getPageSetting('heirloomC3') !== 'undefined' ? 'heirloomC3' : 'heirloomAfterpush';
	/* if slow scumming and on an odd cell then equip Afterpush shield otherwise equip Initial shield */
	if (MODULES.maps.slowScumming && mapType === 'map') {
		if ((game.global.lastClearedMapCell + 1) % 2 === 0 || game.global.lastClearedMapCell === MODULES.maps.lastMapWeWereIn.size - 2) return afterpushShield;
		else return 'heirloomInitial';
	}

	/* challenge shields. */
	if (noBreedChallenge() && getPageSetting('trapper') && getPageSetting('trapperShield') !== 'undefined') return 'trapperShield';
	else if (challengeActive('Wither') && getPageSetting('wither') && getPageSetting('witherShield') !== 'undefined') return 'witherShield';

	/* breed shield */
	if (swapLooms && game.global.soldierHealth <= 0 && !sendingArmy && getPerkLevel('Anticipation') === 0 && !noBreedChallenge() && _breedTimeRemaining() > 0) {
		if (challengeActive('Archaeology') && getPageSetting('archaeologyBreedShield') !== 'undefined') return 'archaeologyBreedShield';
		if (getPageSetting('heirloomBreed') !== 'undefined') return 'heirloomBreed';
	}

	if (swapLooms) {
		if (dontSwapChallenges && (game.global.fighting || game.global.soldierHealthRemaining > 0)) return;
		if (!shouldAbandon(false)) return;
		if (mapType === 'map' && swapLooms) MODULES.heirlooms.plagueSwap = false;
	}

	let swapZone = 999;
	const hdSwapCheck = mapType === 'world' && !dontSwapChallenges && hdCheck && getPageSetting('heirloomSwapHD') > 0;
	if (hdSwapCheck && hdStats.hdRatioHeirloom >= getPageSetting('heirloomSwapHD') && shouldAbandon(false)) swapZone = 1;
	else if (game.stats.totalVoidMaps.value > 0 && getPageSetting('heirloomPostVoidSwap')) swapZone = 1;
	else if (trimpStats.isC3 && ['frigid', 'mayhem', 'pandemonium', 'desolation'].includes(currChallenge) && getPageSetting(currChallenge) && getPageSetting(currChallenge + 'SwapZone') > 0) swapZone = getPageSetting(currChallenge + 'SwapZone');
	else if (trimpStats.isC3) swapZone = getPageSetting('heirloomSwapZoneC3');
	else if (trimpStats.isOneOff) swapZone = getPageSetting('heirloomSwapZoneOneOff');
	else if (trimpStats.isFiller) swapZone = getPageSetting('heirloomSwapZone');
	else if (trimpStats.isDaily) {
		swapZone = getPageSetting('heirloomSwapZoneDaily');
		const dailyModifiers = dailyOddOrEven();
		if (swapZone > 0 && dailyModifiers.active && swapZone % 2 === dailyModifiers.remainder) swapZone += 1;
	}

	if (swapZone <= 0) swapZone = 999;
	const aboveSwapZone = game.global.world >= swapZone;
	let plagueSwapInitialEnemy = false;

	if (mapType === 'world' && !dontSwapChallenges) {
		const compressedCheck = game.global.universe === 2 && game.global.world >= 201 && game.global.lastClearedCell < 96 && getPageSetting('heirloomCompressedSwap');
		if (compressedCheck) {
			const compressedHD = getPageSetting('heirloomSwapHDCompressed');
			if ((compressedHD > 0 || aboveSwapZone) && game.global.gridArray[game.global.lastClearedCell + 2].u2Mutation.indexOf('CMP') !== -1) {
				MODULES.heirlooms.plagueSwap = hdStats.hdRatio >= compressedHD || aboveSwapZone || MODULES.heirlooms.plagueSwap;
			} else {
				MODULES.heirlooms.plagueSwap = false;
			}

			if (aboveSwapZone && game.global.gridArray[game.global.lastClearedCell + 3].u2Mutation.indexOf('CMP') !== -1) {
				plagueSwapInitialEnemy = true;
			}
		} else {
			MODULES.heirlooms.plagueSwap = false;
		}
	}

	const voidActive = mapType === 'void';
	if (voidActive && swapLooms) {
		MODULES.heirlooms.plagueSwap = game.global.universe === 2 && game.global.voidBuff && game.global.voidBuff !== 'doubleAttack' && getPageSetting('heirloomVoidSwap');
		MODULES.heirlooms.plagueSwap = MODULES.heirlooms.plagueSwap && game.global.mapsActive && game.global.lastClearedMapCell !== MODULES.maps.lastMapWeWereIn.size - 2;

		if (MODULES.heirlooms.plagueSwap) {
			const fastImps = atData.fightInfo.fastImps;
			const currentCell = game.global.mapGridArray[game.global.lastClearedMapCell + 1];
			const nextCell = game.global.mapGridArray[game.global.lastClearedMapCell + 2];
			const thirdCell = game.global.mapGridArray[game.global.lastClearedMapCell + 3];

			MODULES.heirlooms.plagueSwap = !fastImps.includes(currentCell.name) && fastImps.includes(nextCell.name);
			plagueSwapInitialEnemy = thirdCell && !fastImps.includes(nextCell.name) && fastImps.includes(thirdCell.name);
		}
	}

	if (MODULES.heirlooms.plagueSwap || plagueSwapInitialEnemy) {
		if (dontSwapChallenges || challengeActive('Glass') || challengeActive('Archaeology') || challengeActive('Wither')) MODULES.heirlooms.plagueSwap = plagueSwapInitialEnemy = false;
		else if (challengeActive('Berserk') && game.challenges.Berserk.weakened !== 20) MODULES.heirlooms.plagueSwap = plagueSwapInitialEnemy = false;
		else if (challengeActive('Quest') && getCurrentQuest() === 8) MODULES.heirlooms.plagueSwap = plagueSwapInitialEnemy = false;
	}

	if (MODULES.heirlooms.plagueSwap || plagueSwapInitialEnemy) {
		// prettier-ignore
		const initialLoom = 	voidActive && getPageSetting('heirloomVoid') !== 'undefined' && heirloomModSearch('heirloomVoid', 'plaguebringer') === undefined ? 'heirloomVoid' : 
					aboveSwapZone && getPageSetting(afterpushShield) !== 'undefined' && heirloomModSearch(afterpushShield, 'plaguebringer') === undefined ? afterpushShield : 
					getPageSetting('heirloomInitial') !== 'undefined' && heirloomModSearch('heirloomInitial', 'plaguebringer') === undefined ? 'heirloomInitial' : 
					false;

		// prettier-ignore
		const afterLoom = 	getPageSetting('heirloomPlaguebringer') !== 'undefined' && heirloomModSearch('heirloomPlaguebringer', 'plaguebringer') > 0 ? 'heirloomPlaguebringer' : 
					getPageSetting(afterpushShield) !== 'undefined' && heirloomModSearch(afterpushShield, 'plaguebringer') > 0 ? afterpushShield : 
					false;

		if (initialLoom && afterLoom) {
			if (plagueSwapInitialEnemy) return initialLoom;
			return afterLoom;
		}
	}

	if (challengeActive('Duel') && getPageSetting('duel') && getPageSetting('duelShield') !== 'undefined') return 'duelShield';
	if (voidActive && getPageSetting('heirloomVoid') !== 'undefined') return 'heirloomVoid';
	if ((mapType === 'map' || mapType === 'void') && getPageSetting('heirloomMapSwap') && getPageSetting(afterpushShield) !== 'undefined') return afterpushShield;
	if (getPageSetting('heirloomSpire') !== 'undefined' && isDoingSpire()) return 'heirloomSpire';
	if (game.global.formation === 5 && getPageSetting('heirloomWindStack') !== 'undefined') return 'heirloomWindStack';
	if (getPageSetting(afterpushShield) !== 'undefined' && aboveSwapZone) return afterpushShield;
	if (getPageSetting('heirloomInitial') !== 'undefined') return 'heirloomInitial';
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
	if (mapSettings.mapName === 'Quest' && mapSettings.resource && mapSettings.resource === 'science' && getPageSetting('heirloomStaffScience') !== 'undefined') return 'heirloomStaffScience';
	if (mapSettings.mapName === 'Pandemonium Farming' && getPageSetting('pandemoniumStaff') !== 'undefined') return 'pandemoniumStaff';
	if (!game.global.mapsActive && getPageSetting('desolationStaff') !== 'undefined') return 'desolationStaff';

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
