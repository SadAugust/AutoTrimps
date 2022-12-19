function getHeirloomEff(modName, heirloomType, heirloomMods) {

	var varAffix = heirloomType === 'Staff' ? 'modst' : heirloomType === 'Shield' ? 'modsh' : heirloomType === 'core' ? 'modcr' : null;
	if (varAffix === null)
		return 0;

	for (var x = 1; x < heirloomMods + 1; x++) {
		if (getPageSetting('slot' + x + varAffix) === modName || getPageSetting('slot' + x + varAffix) === 'empty') {
			return 5;
		}
	}
	return 0;
}

function evaluateHeirloomMods(loom, location) {

	const heirloomRarity = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
	const raretokeep = heirloomRarity.indexOf(getPageSetting('raretokeep'));
	const typeToKeep = getPageSetting('typetokeep');
	const heirloomEquipType = typeToKeep === 1 ? 'Shield' : typeToKeep === 2 ? 'Staff' : typeToKeep === 3 ? 'Core' : 'All';
	const onlyPerfect = getPageSetting('autoheirloomsperfect')

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
		if ((heirloomType === 'Shield' || heirloomType === 'Staff') && onlyPerfect && modName !== "empty" && getHeirloomEff(modName, heirloomRarity, heirloomLocation.mods.length) === 0) return 0;

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

function autoheirlooms3() {
	if (!game.global.heirloomsExtra.length > 0) return;
	if (!getPageSetting('autoheirlooms') || getPageSetting('typetokeep') === 'None' || getPageSetting('raretokeep') === 'None') return;

	const typeToKeep = getPageSetting('typetokeep');
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
	else if (getPageSetting('typetokeep') == 4) {
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
	if (HeirloomSearch(heirloom) != undefined && game.global.ShieldEquipped.name != getPageSetting(heirloom)) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
		equipHeirloom(true);
		gammaBurstPct = getPageSetting('rCalcGammaBurst') && (getHeirloomBonus("Shield", "gammaBurst") / 100) > 0 ? (getHeirloomBonus("Shield", "gammaBurst") / 100) : 1;
	} else if (HeirloomSearch(heirloom) == undefined && game.global.ShieldEquipped.name != getPageSetting(heirloom))
		if (tenSecondInterval) debug("The heirloom named " + autoTrimpSettings[heirloom].value + " in the Shield setting: " + autoTrimpSettings[heirloom].name + " doesn\'t exist. Rename an heirloom or adjust the settings input.");
}

function HeirloomEquipStaff(heirloom) {
	if (HeirloomSearch(heirloom) != undefined && game.global.StaffEquipped.name != getPageSetting(heirloom)) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
		equipHeirloom(true);
	} else if (HeirloomSearch(heirloom) == undefined && game.global.StaffEquipped.name != getPageSetting(heirloom))
		if (tenSecondInterval) debug("The heirloom named " + autoTrimpSettings[heirloom].value + " in the Staff setting: " + autoTrimpSettings[heirloom].name + " doesn\'t exist. Rename an heirloom or adjust the settings input.");
}

function HeirloomShieldSwapped() {
	if (!game.global.ShieldEquipped.rarity >= 10) return;
	gammaBurstPct = getPageSetting('rCalcGammaBurst') && (getHeirloomBonus("Shield", "gammaBurst") / 100) > 0 ? (getHeirloomBonus("Shield", "gammaBurst") / 100) : 1;
	shieldEquipped = game.global.ShieldEquipped.id;
}

function heirloomSwapping() {
	const prefix = game.global.universe === 1 ? 'H' : 'R';
	if (!getPageSetting(prefix + 'hs')) return;
	const isC3 = game.global.runningChallengeSquared || game.global.challengeActive == 'Mayhem' || game.global.challengeActive == 'Pandemonium';
	const isDaily = game.global.challengeActive == "Daily";
	const rRunningRegular = !isDaily && !isC3
	const swapZone = isC3 ? getPageSetting(prefix + 'hsC3SwapZone') : isDaily ? getPageSetting(prefix + 'hsDailySwapZone') : rRunningRegular ? getPageSetting(prefix + 'hsSwapZone') : 0;
	const rAfterpushShield = isC3 ? prefix + 'hsC3' : prefix + 'hsAfterpush';

	//Swapping Shields
	if (getPageSetting(prefix + 'hsShield')) {
		if (game.global.challengeActive == 'Pandemonium' && rCurrentMap === prefix + 'PandemoniumJestimpFarm' && getPageSetting(prefix + 'hsPandJestFarmShield') != 'undefined' && autoBattle.oneTimers.Mass_Hysteria.owned)
			HeirloomEquipShield(prefix + 'hsPandJestFarmShield');
		else if (game.global.universe === 2 && game.global.mapsActive && getCurrentMapObject().location == "Void" && getPageSetting(prefix + 'hsVoidSwap') && game.global.voidBuff !== 'doubleAttack' && getPageSetting(prefix + 'hsInitial') !== "undefined" && !voidPBSwap)
			HeirloomEquipShield(prefix + 'hsInitial');
		else if (getPageSetting(rAfterpushShield) !== "undefined" && (game.global.world >= swapZone || ((game.global.preMapsActive || game.global.mapsActive) && getPageSetting(prefix + 'hsMapSwap'))))
			HeirloomEquipShield(rAfterpushShield);
		else if (getPageSetting(prefix + 'hsInitial') !== "undefined") {
			HeirloomEquipShield(prefix + 'hsInitial');
		}
	}

	//Swapping Staffs
	if (getPageSetting(prefix + 'hsStaff')) {
		if (getPageSetting(prefix + 'hsWorldStaff') != "undefined" && !game.global.mapsActive) {
			HeirloomEquipStaff(prefix + 'hsWorldStaff');
		} else if (game.global.mapsActive) {
			if (game.global.challengeActive == "Pandemonium" && getPageSetting(prefix + 'PandemoniumAutoEquip') > 1 && getPageSetting(prefix + 'hsPandStaff') != "undefined" && getPageSetting(prefix + 'PandemoniumAEZone') > 0 && game.global.world >= getPageSetting(prefix + 'PandemoniumAEZone') && game.global.lastClearedCell > 59)
				HeirloomEquipStaff(prefix + 'hsPandStaff');
			else if (getPageSetting(prefix + 'hsMapStaff') != "undefined" && getCurrentMapObject().bonus === undefined)
				HeirloomEquipStaff(prefix + 'hsMapStaff');
			else if (getCurrentMapObject().bonus != undefined) {
				if (getPageSetting(prefix + 'hsFoodStaff') != "undefined" && getCurrentMapObject().bonus.includes("sc"))
					HeirloomEquipStaff(prefix + 'hsFoodStaff');
				else if (getPageSetting(prefix + 'hsWoodStaff') != "undefined" && getCurrentMapObject().bonus.includes("wc"))
					HeirloomEquipStaff(prefix + 'hsWoodStaff');
				else if (getPageSetting(prefix + 'hsMetalStaff') != "undefined" && getCurrentMapObject().bonus.includes("mc"))
					HeirloomEquipStaff(prefix + 'hsMetalStaff');
				else if (game.global.universe === 2 && getPageSetting(prefix + 'hsResourceStaff') != "undefined" && getCurrentMapObject().bonus.includes("rc"))
					HeirloomEquipStaff(prefix + 'hsResourceStaff');
				else if (getPageSetting(prefix + 'hsMapStaff') != "undefined")
					HeirloomEquipStaff(prefix + 'hsMapStaff');
			}
		}
	}
}
