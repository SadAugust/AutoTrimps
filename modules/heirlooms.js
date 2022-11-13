function highdmgshield() { for (loom of game.global.heirloomsCarried) if (loom.name == getPageSetting('highdmg')) return loom; }
function lowdmgshield() { for (loom of game.global.heirloomsCarried) if (loom.name == getPageSetting('lowdmg')) return loom; }
function dhighdmgshield() { for (loom of game.global.heirloomsCarried) if (loom.name == getPageSetting('dhighdmg')) return loom; }
function dlowdmgshield() { for (loom of game.global.heirloomsCarried) if (loom.name == getPageSetting('dlowdmg')) return loom; }

function getHeirloomEff(modName, heirloomType, heirloomMods) {

	var varAffix = heirloomType === 'Staff' ? 'modst' : heirloomType === 'Shield' ? 'modsh' : heirloomType === 'core' ? 'modcr' : null;
	if (varAffix === null)
		return 0;

	for (var x = 1; x < heirloomMods + 1; x++) {
		if (getPageSetting('slot' + x + varAffix) === modName || getPageSetting('slot' + x + varAffix) === 'empty') {
			if (getPageSetting('slot' + x + varAffix) === 'empty') debug("works")
			return 5;
		}
	}
	return 0;
}

function evaluateHeirloomMods2(loom, location) {

	const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
	const raretokeep = heirloomType.indexOf(getPageSetting('raretokeep'));
	const typeToKeep = getPageSetting('typetokeep');
	const heirloomEquipType = typeToKeep === 1 ? 'Shield' : typeToKeep === 2 ? 'Staff' : typeToKeep === 3 ? 'Core' : 'All';

	var eff = 0;
	var name;
	var type;
	var rarity;

	var heirloomLocation = location.includes('Equipped') ? loom = game.global[location] : loom = game.global[location][loom];

	for (var m in heirloomLocation.mods) {
		name = heirloomLocation.mods[m][0];
		type = heirloomLocation.type;
		rarity = heirloomLocation.rarity;

		if (rarity !== raretokeep) return 0;
		if (type === 'Shield' && getPageSetting('autoheirloomsperfect') && name !== "empty" && getHeirloomEff(name, type, heirloomLocation.mods.length) === 0) return 0;

		if (type === heirloomEquipType) {
			eff += getHeirloomEff(name, type, heirloomLocation.mods.length);
		}
		if (name === "empty") {
			eff *= 4;
		}
	}
	return eff;
}

var worth3 = { 'Shield': [], 'Staff': [], 'Core': [] };
function worthOfHeirlooms3() {
	worth3 = { 'Shield': [], 'Staff': [], 'Core': [] };

	//Identify heirlooms to be recycled.
	var recycle = [];
	for (var index in game.global.heirloomsExtra) {
		var theLoom = game.global.heirloomsExtra[index];
		if (!theLoom.protected && evaluateHeirloomMods2(index, 'heirloomsExtra') === 0) {
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
		var data = { 'location': 'heirloomsExtra', 'index': index, 'rarity': theLoom.rarity, 'eff': evaluateHeirloomMods2(index, 'heirloomsExtra') };
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

	worthOfHeirlooms3();

	//Looping through the heirloom type set in typetokeep setting and stashing them.
	if (heirloomType !== 'All') {
		while ((game.global.heirloomsCarried.length < getMaxCarriedHeirlooms()) && game.global.heirloomsExtra.length > 0) {
			worthOfHeirlooms3();
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
			worthOfHeirlooms3();
			for (var x = 0; x < heirloomTypes.length; x++) {
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


//Loom Swapping

function lowHeirloom() {
	if (lowdmgshield() != undefined && game.global.ShieldEquipped.name != getPageSetting('lowdmg')) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
		equipHeirloom();
	}
}
function dlowHeirloom() {
	if (dlowdmgshield() != undefined && game.global.ShieldEquipped.name != getPageSetting('dlowdmg')) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
		equipHeirloom();
	}
}
function highHeirloom() {
	if (highdmgshield() != undefined && game.global.ShieldEquipped.name != getPageSetting('highdmg')) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
		equipHeirloom();
	}
}
function dhighHeirloom() {
	if (dhighdmgshield() != undefined && game.global.ShieldEquipped.name != getPageSetting('dhighdmg')) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
		equipHeirloom();
	}
}

//Radon
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

function HeirloomSwapping() {
	var rRunningC3 = game.global.runningChallengeSquared || game.global.challengeActive == 'Mayhem' || game.global.challengeActive == 'Pandemonium';
	var rRunningDaily = game.global.challengeActive == "Daily";
	var rRunningRegular = game.global.challengeActive != "Daily" && game.global.challengeActive != "Mayhem" && game.global.challengeActive != "Pandemonium" && !game.global.runningChallengeSquared;
	var rSwapZone = rRunningC3 ? getPageSetting('RhsC3SwapZone') : rRunningDaily ? getPageSetting('RhsDailySwapZone') : rRunningRegular ? getPageSetting('RhsSwapZone') : 0;
	var rAfterpushShield = rRunningC3 ? 'RhsC3' : 'RhsAfterpush';
	if (game.global.universe == 2) {
		//Swapping Shields
		if (getPageSetting('RhsShield')) {
			if (game.global.challengeActive == 'Pandemonium' && rCurrentMap === 'rPandemoniumJestimpFarm' && getPageSetting('RhsPandJestFarmShield') != 'undefined' && autoBattle.oneTimers.Mass_Hysteria.owned)
				HeirloomEquipShield('RhsPandJestFarmShield');
			else if (game.global.mapsActive && getCurrentMapObject().location == "Void" && getPageSetting('RhsVoidSwap') && game.global.voidBuff !== 'doubleAttack' && getPageSetting('RhsInitial') !== "undefined" && !voidPBSwap) {
				HeirloomEquipShield('RhsInitial');
			}
			else if (getPageSetting(rAfterpushShield) !== "undefined" && (game.global.world >= rSwapZone || game.global.mapsActive && getPageSetting('RhsMapSwap')))
				HeirloomEquipShield(rAfterpushShield);
			else if (getPageSetting('RhsInitial') !== "undefined") {
				HeirloomEquipShield('RhsInitial');
			}
		}

		//Swapping Staffs
		if (getPageSetting('RhsStaff')) {
			if (getPageSetting('RhsWorldStaff') != "undefined" && !game.global.mapsActive) {
				HeirloomEquipStaff('RhsWorldStaff');
			} else if (game.global.mapsActive) {
				if (game.global.challengeActive == "Pandemonium" && getPageSetting('RPandemoniumAutoEquip') > 1 && getPageSetting('RhsPandStaff') != "undefined" && getPageSetting('RPandemoniumAEZone') > 0 && game.global.world >= getPageSetting('RPandemoniumAEZone') && game.global.lastClearedCell > 59)
					HeirloomEquipStaff('RhsPandStaff');
				else if (getPageSetting('RhsMapStaff') != "undefined" && getCurrentMapObject().bonus === undefined)
					HeirloomEquipStaff('RhsMapStaff');
				else if (getCurrentMapObject().bonus != undefined) {
					if (getPageSetting('RhsFoodStaff') != "undefined" && getCurrentMapObject().bonus.includes("sc"))
						HeirloomEquipStaff('RhsFoodStaff');
					else if (getPageSetting('RhsWoodStaff') != "undefined" && getCurrentMapObject().bonus.includes("wc"))
						HeirloomEquipStaff('RhsWoodStaff');
					else if (getPageSetting('RhsMetalStaff') != "undefined" && getCurrentMapObject().bonus.includes("mc"))
						HeirloomEquipStaff('RhsMetalStaff');
					else if (getPageSetting('RhsResourceStaff') != "undefined" && getCurrentMapObject().bonus.includes("rc"))
						HeirloomEquipStaff('RhsResourceStaff');
					else if (getPageSetting('RhsMapStaff') != "undefined")
						HeirloomEquipStaff('RhsMapStaff');
				}
			}
		}
	}
}
