function getHeirloomEff(modName, heirloomType, heirloomMods) {

	var varAffix = heirloomType === 'Staff' ? 'heirloomAutoStaffMod' : heirloomType === 'Shield' ? 'heirloomAutoShieldMod' : heirloomType === 'core' ? 'heirloomAutoCoreMod' : null;
	if (varAffix === null)
		return 0;

	for (var x = 1; x < (heirloomMods + 1); x++) {
		if (getPageSetting(varAffix + x) === modName || getPageSetting(varAffix + x) === 'empty') {
			return 5;
		}
	}
	return 0;
}

function evaluateHeirloomMods(loom, location) {

	const heirloomRarity = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
	const raretokeep = heirloomRarity.indexOf(getPageSetting('heirloomAutoRareToKeep'));
	const typeToKeep = getPageSetting('heirloomAutoTypeToKeep');
	const heirloomEquipType = typeToKeep === 1 ? 'Shield' : typeToKeep === 2 ? 'Staff' : typeToKeep === 3 ? 'Core' : 'All';
	const onlyPerfect = getPageSetting('heirloomAutoOnlyPefect')

	var eff = 0;
	var modName;
	var heirloomType;
	var rarity;

	var heirloomLocation = location.includes('Equipped') ? loom = game.global[location] : loom = game.global[location][loom];
	heirloomType = heirloomLocation.type;
	rarity = heirloomLocation.rarity;
	if (rarity !== raretokeep) return 0;

	for (var m in heirloomLocation.mods) {
		modName = heirloomLocation.mods[m][0];
		if ((heirloomType === 'Shield' || heirloomType === 'Staff') && onlyPerfect && modName !== "empty" && getHeirloomEff(modName, heirloomType, heirloomLocation.mods.length) === 0) return 0;

		if (heirloomType === heirloomEquipType || heirloomEquipType === 'All') {
			eff += getHeirloomEff(modName, heirloomType, heirloomLocation.mods.length);
		}
		if (modName === "empty") {
			eff *= 4;
		}
	}
	return eff;
}

var worth3 = { 'Shield': [], 'Staff': [], 'Core': [] };

function worthOfHeirlooms() {
	worth3 = { 'Shield': [], 'Staff': [], 'Core': [] };

	//Identify heirlooms to be recycled.
	var recycle = [];
	for (var index in game.global.heirloomsExtra) {
		var theLoom = game.global.heirloomsExtra[index];
		if (!theLoom.protected && evaluateHeirloomMods(index, 'heirloomsExtra') === 0) {
			recycle.push(index);
		}
	}

	//Recycle heirlooms
	if (recycle.length > 0) {
		for (x = recycle.length; x !== 0; x--) {
			selectHeirloom(recycle[x - 1], 'heirloomsExtra');
			recycleHeirloom(true);
		}
	}

	//Pushing data for remaining heirlooms
	for (var index in game.global.heirloomsExtra) {
		var theLoom = game.global.heirloomsExtra[index];
		var data = { 'location': 'heirloomsExtra', 'index': index, 'rarity': theLoom.rarity, 'eff': evaluateHeirloomMods(index, 'heirloomsExtra') };
		worth3[theLoom.type].push(data);
	}
	var valuesort = function (a, b) { return b.eff - a.eff; };
	worth3['Shield'].sort(valuesort);
	worth3['Staff'].sort(valuesort);
	worth3['Core'].sort(valuesort);
}

function autoheirlooms() {
	if (!game.global.heirloomsExtra.length > 0) return;
	if (!getPageSetting('heirloomAuto') || getPageSetting('heirloomAutoTypeToKeep') === 'None' || getPageSetting('heirloomAutoRareToKeep') === 'None') return;

	const typeToKeep = getPageSetting('heirloomAutoTypeToKeep');
	const heirloomType = typeToKeep === 1 ? 'Shield' : typeToKeep === 2 ? 'Staff' : typeToKeep === 3 ? 'Core' : 'All';

	worthOfHeirlooms();

	//Looping through the heirloom type set in typetokeep setting and stashing them.
	if (heirloomType !== 'All') {
		while ((game.global.heirloomsCarried.length < getMaxCarriedHeirlooms()) && game.global.heirloomsExtra.length > 0) {
			worthOfHeirlooms();
			if (worth3[heirloomType].length > 0) {
				var carriedHeirlooms = worth3[heirloomType].shift();
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
				worthOfHeirlooms();
				if (worth3[heirloomTypes[x]].length > 0) {
					var carriedHeirlooms = worth3[heirloomTypes[x]].shift();
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
	for (loom of game.global.heirloomsCarried)
		if (loom.name == getPageSetting(heirloom))
			return loom;
}

//Loops through heirlooms and checks if they have a specified modifier on them, divides by 10 if in u2.
function HeirloomModSearch(heirloom, modifier) {
	if (game.global.ShieldEquipped.name === getPageSetting(heirloom)) {
		var loom = game.global.ShieldEquipped;
		for (var i = (loom.mods.length - 1); i > -1; i--) {
			if (loom.mods[i][0] == modifier)
				if (game.global.universe == 1)
					return loom.mods[i][1];
				else
					return loom.mods[i][1] / 10;
		}
	}
	if (game.global.StaffEquipped.name === getPageSetting(heirloom)) {
		var loom = game.global.StaffEquipped;
		for (var i = (loom.mods.length - 1); i > -1; i--) {
			if (loom.mods[i][0] == modifier)
				if (game.global.universe == 1)
					return loom.mods[i][1];
				else
					return loom.mods[i][1] / 10;
		}
	}
	for (loom of game.global.heirloomsCarried) {
		if (loom.name == getPageSetting(heirloom)) {
			for (var i = (loom.mods.length - 1); i > -1; i--) {
				if (loom.mods[i][0] == modifier)
					if (game.global.universe == 1)
						return loom.mods[i][1];
					else
						return loom.mods[i][1] / 10;
			}
		}
	}
}

function HeirloomEquipShield(heirloom) {
	if (HeirloomSearch(heirloom) !== undefined && game.global.ShieldEquipped.name !== getPageSetting(heirloom)) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
		equipHeirloom(true);
		gammaBurstPct = getPageSetting('gammaBurstCalc') && (getHeirloomBonus("Shield", "gammaBurst") / 100) > 0 ? (getHeirloomBonus("Shield", "gammaBurst") / 100) : 1;
	} else if (HeirloomSearch(heirloom) === undefined && game.global.ShieldEquipped.name !== getPageSetting(heirloom))
		if (tenSecondInterval) debug("The heirloom named " + getPageSetting(heirloom) + " in the Shield setting: " + autoTrimpSettings[heirloom].name() + " doesn\'t exist. Rename an heirloom or adjust the settings input.");
}

function HeirloomEquipStaff(heirloom) {
	if (HeirloomSearch(heirloom) !== undefined && game.global.StaffEquipped.name !== getPageSetting(heirloom)) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
		equipHeirloom(true);
	} else if (HeirloomSearch(heirloom) === undefined && game.global.StaffEquipped.name !== getPageSetting(heirloom))
		if (tenSecondInterval) debug("The heirloom named " + getPageSetting(heirloom) + " in the Staff setting: " + autoTrimpSettings[heirloom].name() + " doesn\'t exist. Rename an heirloom or adjust the settings input.");
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
		if (Object.keys(game.global.ShieldEquipped).length !== 0 && game.permaBoneBonuses.voidMaps.tracker >= (100 - game.permaBoneBonuses.voidMaps.owned)) unequipHeirloom(game.global.ShieldEquipped);
		if (Object.keys(game.global.ShieldEquipped).length === 0 && game.permaBoneBonuses.voidMaps.tracker < (100 - game.permaBoneBonuses.voidMaps.owned)) return ('heirloomInitial');
		return;
	}
	//Initial vars for swapping heirlooms
	var isC3 = game.global.runningChallengeSquared || challengeActive('Mayhem') || challengeActive('Pandemonium') || challengeActive('Desolation');
	var isDaily = challengeActive('Daily');
	var isFiller = !isDaily && !isC3
	var swapZone = isC3 ? getPageSetting('heirloomSwapZoneC3') : isDaily ? getPageSetting('heirloomSwapZoneDaily') : isFiller ? getPageSetting('heirloomSwapZone') : 999;
	if (swapZone === -1) swapZone = 999;
	var afterpushShield = isC3 ? 'heirloomC3' : 'heirloomAfterpush';
	voidPBSwap = false;
	var voidActive = mapType === 'void';
	if (voidActive) {
		voidPBSwap =
			query && game.global.universe === 2 && getPageSetting('heirloomVoidSwap') &&
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
		if (voidPBSwap && getPageSetting('heirloomVoidPlaguebringer') !== "undefined")
			return ('heirloomVoidPlaguebringer');
		else
			return ('heirloomVoid');
	}
	else if (voidActive && voidPBSwap && getPageSetting('heirloomInitial') !== "undefined")
		return ('heirloomInitial');
	else if (getPageSetting(afterpushShield) !== "undefined" && (game.global.world >= swapZone || (mapType !== 'world' && getPageSetting('heirloomMapSwap'))))
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
		const mapBonus = getCurrentMapObject().bonus;
		if (challengeActive('Pandemonium') && getPageSetting('pandemoniumAE') > 1 && getPageSetting('pandemoniumStaff') != "undefined" && getPageSetting('pandemoniumAEZone') > 0 && game.global.world >= getPageSetting('pandemoniumAEZone') && game.global.lastClearedCell > 59)
			return ('pandemoniumStaff');
		else if (getPageSetting('heirloomStaffMap') != "undefined" && mapBonus === undefined)
			return ('heirloomStaffMap');
		else if (getCurrentMapObject().bonus != undefined) {
			if (getPageSetting('heirloomStaffFood') != "undefined" && mapBonus.includes("sc"))
				return ('heirloomStaffFood');
			else if (getPageSetting('heirloomStaffWood') != "undefined" && mapBonus.includes("wc"))
				return ('heirloomStaffWood');
			else if (getPageSetting('heirloomStaffMetal') != "undefined" && mapBonus.includes("mc"))
				return ('heirloomStaffMetal');
			else if (game.global.universe === 2 && getPageSetting('heirloomResourceStaff') != "undefined" && mapBonus.includes("rc"))
				return ('heirloomResourceStaff');
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