//Helium

MODULES["equipment"] = {};

var equipmentList = {
	'Dagger': {
		Upgrade: 'Dagadder',
		Stat: 'attack',
		Resource: 'metal',
		Equip: true
	},
	'Mace': {
		Upgrade: 'Megamace',
		Stat: 'attack',
		Resource: 'metal',
		Equip: true
	},
	'Polearm': {
		Upgrade: 'Polierarm',
		Stat: 'attack',
		Resource: 'metal',
		Equip: true
	},
	'Battleaxe': {
		Upgrade: 'Axeidic',
		Stat: 'attack',
		Resource: 'metal',
		Equip: true
	},
	'Greatsword': {
		Upgrade: 'Greatersword',
		Stat: 'attack',
		Resource: 'metal',
		Equip: true
	},
	'Boots': {
		Upgrade: 'Bootboost',
		Stat: 'health',
		Resource: 'metal',
		Equip: true
	},
	'Helmet': {
		Upgrade: 'Hellishmet',
		Stat: 'health',
		Resource: 'metal',
		Equip: true
	},
	'Pants': {
		Upgrade: 'Pantastic',
		Stat: 'health',
		Resource: 'metal',
		Equip: true
	},
	'Shoulderguards': {
		Upgrade: 'Smoldershoulder',
		Stat: 'health',
		Resource: 'metal',
		Equip: true
	},
	'Breastplate': {
		Upgrade: 'Bestplate',
		Stat: 'health',
		Resource: 'metal',
		Equip: true
	},
	'Arbalest': {
		Upgrade: 'Harmbalest',
		Stat: 'attack',
		Resource: 'metal',
		Equip: true
	},
	'Gambeson': {
		Upgrade: 'GambesOP',
		Stat: 'health',
		Resource: 'metal',
		Equip: true
	},
	'Shield': {
		Upgrade: 'Supershield',
		Stat: 'health',
		Resource: 'wood',
		Equip: true
	}
};

function equipsToGet(targetZone, targetPrestige) {

	const prestigeList = ['Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'];
	if (!targetPrestige) targetPrestige = 'GambesOP';

	//Figure out how many equips to farm for
	var mapsToRun = 0;
	var prestigeToFarmFor = 0;

	const hasSciFour = ((game.global.universe == 1 && game.global.sLevel >= 3) || (game.global.universe == 2 && game.buildings.Microchip.owned >= 3));
	const prestigeInterval = challengeActive('Mapology') || !hasSciFour ? 5 : 10;

	//Loops through all prestiges
	for (const p of prestigeList) {
		//Skip locked equips (Panda)
		if (game.equipment[game.upgrades[p].prestiges].locked) continue;
		const prestigeUnlock = game.mapUnlocks[p];

		//Last prestige obtained (maplevel) for this equip
		var pMapLevel = prestigeUnlock.last + 5;

		if ((game.upgrades[p].allowed || prestigeUnlock.last <= 5) && prestigeUnlock && pMapLevel <= targetZone) {
			mapsToRun += Math.max(1, Math.ceil((targetZone - pMapLevel) / prestigeInterval));
			var prestigeCount = Math.floor((targetZone - prestigeUnlock.last) / 5);
			if (hasSciFour && prestigeCount % 2 == 1) {
				prestigeCount++;
			}
			prestigeToFarmFor += prestigeCount;
		}

		if (p === targetPrestige) break;
	}

	return [prestigeToFarmFor, mapsToRun];
}

//Working out cheapestt Equips & Prestiges
function cheapestEquipmentCost() {
	//Looping through each piece of equipment

	var equipmentName = null;
	var prestigeName = null;
	//Initialising Variables
	nextLevelEquipmentCost = null;
	nextEquipmentCost = null;
	nextLevelPrestigeCost = null;
	nextPrestigeCost = null;
	jestMetalTotal = null;
	var prestigeUpgradeName = "";
	var allUpgradeNames = Object.getOwnPropertyNames(game.upgrades);

	for (var equipName in game.equipment) {
		if (!game.equipment[equipName].locked) {
			//Checking cost of next equipment level. Blocks unavailable ones.
			if (game.challenges.Pandemonium.isEquipBlocked(equipName) || equipmentList[equipName].Resource == 'wood') continue;
			nextLevelEquipmentCost = game.equipment[equipName].cost[equipmentList[equipName].Resource][0] * Math.pow(game.equipment[equipName].cost[equipmentList[equipName].Resource][1], game.equipment[equipName].level) * getEquipPriceMult();
			//Sets nextEquipmentCost to the price of an equip if it costs less than the current value of nextEquipCost
			if (nextLevelEquipmentCost < nextEquipmentCost || nextEquipmentCost == null) {
				equipmentName = equipName;
				nextEquipmentCost = nextLevelEquipmentCost;
			}
			//Checking cost of prestiges if any are available to purchase
			for (var upgrade of allUpgradeNames) {
				if (game.upgrades[upgrade].prestiges === equipName) {
					prestigeUpgradeName = upgrade;
					//Checking if prestiges are purchasable
					if (game.challenges.Pandemonium.isEquipBlocked(game.upgrades[upgrade].prestiges) || game.upgrades[prestigeUpgradeName].locked) continue;
					nextLevelPrestigeCost = getNextPrestigeCost(prestigeUpgradeName) * getEquipPriceMult();
					//Sets nextPrestigeCost to the price of an equip if it costs less than the current value of nextEquipCost
					if (nextLevelPrestigeCost < nextPrestigeCost || nextPrestigeCost == null) {
						prestigeName = prestigeUpgradeName
						nextPrestigeCost = nextLevelPrestigeCost;
					}
				}
			}
		}
	}
	return [equipmentName, nextEquipmentCost, prestigeName, nextLevelPrestigeCost]
}

function mostEfficientEquipment(resourceMaxPercent, zoneGo, ignoreShield, skipForLevels, showAllEquips, fakeLevels = {}, ignorePrestiges) {

	for (var i in equipmentList) {
		if (typeof fakeLevels[i] === 'undefined') {
			fakeLevels[i] = 0;
		}
	}
	if (!ignoreShield) ignoreShield = getPageSetting('equipNoShields');
	if (!skipForLevels) skipForLevels = false;
	if (!showAllEquips) showAllEquips = false;
	var equipZone = getPageSetting('equipZone');
	if (!zoneGo) zoneGo = currentMap === 'Wither' || (HDRatio >= getPageSetting('equipCutOff')) || (equipZone.length > 0 && ((equipZone.includes(game.global.world)) || (game.global.world >= equipZone[equipZone.length - 1])));
	if (!resourceMaxPercent) resourceMaxPercent = zoneGo ? 1 : getPageSetting('equipPercent') < 0 ? 1 : getPageSetting('equipPercent') / 100;
	var resourceMaxPercentBackup = resourceMaxPercent;

	if (challengeActive('Scientist')) {
		skipForLevels = Infinity;
	}

	var mostEfficient = [
		{
			name: "",
			statPerResource: Infinity,
			prestige: false,
			cost: 0,
		},
		{
			name: "",
			statPerResource: Infinity,
			prestige: false,
			cost: 0,
		}
	];

	var highestPrestige = 0;
	var prestigesAvailable = false;

	var canAtlantrimp = game.mapUnlocks.AncientTreasure.canRunOnce;
	var prestigeSetting = getPageSetting('equipPrestige');

	//Checks what our highest prestige level is && if there are any prestiges available to purchase
	for (var i in equipmentList) {
		if (game.equipment[i].prestige > highestPrestige) highestPrestige = game.equipment[i].prestige;
		if (prestigesAvailable) continue;
		if (ignorePrestiges) continue;
		if (prestigeSetting === 0) continue;
		if (prestigeSetting === 1 && !canAtlantrimp) continue;
		if (i === 'Shield') continue;
		if (game.upgrades[equipmentList[i].Upgrade].done !== game.upgrades[equipmentList[i].Upgrade].allowed) {
			prestigesAvailable = true;
		}
	}

	for (var i in equipmentList) {
		if (game.equipment[i].locked) continue;

		var isAttack = (equipmentList[i].Stat === 'attack' ? 0 : 1);
		var nextLevelValue = 1;
		var safeRatio = 1;

		var skipForLevels = !skipForLevels && isAttack == 0 ? getPageSetting('equipCapAttack') :
			!skipForLevels && isAttack == 1 ? getPageSetting('equipCapHealth') :
				skipForLevels

		var nextLevelCost = game.equipment[i].cost[equipmentList[i].Resource][0] * Math.pow(game.equipment[i].cost[equipmentList[i].Resource][1], game.equipment[i].level + fakeLevels[i]) * getEquipPriceMult();

		var prestige = false;
		var ignorePrestiges_temp = ignorePrestiges || false;
		//Skipping gyms when not in u1
		if (i === 'Gym') continue;
		//Skipping gyms when can buy Gymystic
		if (game.global.univere === 1 && (i === 'Shield' || i === 'Gym') && needGymystic()) continue;
		if (mapSettings.shouldHealthFarm && isAttack === 1) resourceMaxPercent
			= 1;
		//Setting weapon equips to 100% spending during Smithless farm.
		if (challengeActive('Smithless') && currentMap === 'Smithless Farm') {
			if (isAttack === 0) {
				skipForLevels = Infinity;
				resourceMaxPercent = 1;
			}
			if (isAttack === 1) resourceMaxPercent = resourceMaxPercentBackup;
		}
		//Load buyPrestigeMaybe into variable so it's not called 500 times
		var maybeBuyPrestige = buyPrestigeMaybe(i, resourceMaxPercent, game.equipment[i].level);
		//Skips if we have the required number of that item and below zoneGo
		if (!maybeBuyPrestige && Number.isInteger(skipForLevels) && game.equipment[i].level >= skipForLevels) continue;
		//Skips if ignoreShield variable is true.
		if (game.global.universe === 2 && ignoreShield && i == 'Shield') continue;
		//Skips looping through equips if they're blocked during Pandemonium.
		if (challengeActive('Pandemonium') && game.challenges.Pandemonium.isEquipBlocked(i)) continue;
		//Skips buying shields when you can afford bonfires on Hypothermia.
		if (challengeActive('Hypothermia') && game.resources.wood.owned > game.challenges.Hypothermia.bonfirePrice() && i == 'Shield') continue;
		//Skips through equips if they cost more than your equip purchasing percent setting value.
		if (equipmentList[i].Resource == 'metal' && !zoneGo && !canAffordBuilding(i, null, null, true, false, 1, resourceMaxPercent * 100) && !maybeBuyPrestige[0]) continue;
		//Skips through equips if they don't cost metal and you don't have enough resources for them.
		if (equipmentList[i].Resource != 'metal' && !canAffordBuilding(i, null, null, true, false, 1, resourceMaxPercent * 100) && !maybeBuyPrestige[0]) continue;
		//Skips equips if we have prestiges available & no prestiges to get for this
		if (prestigesAvailable && ((prestigeSetting === 1 && canAtlantrimp) || prestigeSetting === 2) && game.upgrades[equipmentList[i].Upgrade].done === game.upgrades[equipmentList[i].Upgrade].allowed) continue;
		//If prestiges available & running certain settings skips looking at non-prestige item stats.
		if (!prestigesAvailable) {
			nextLevelValue = game.equipment[i][equipmentList[i].Stat + "Calculated"];
			safeRatio = nextLevelCost / nextLevelValue;
		}

		if (prestigeSetting === 0 && !ignorePrestiges && game.equipment[i].level < 6 && game.resources.metal.owned * 0.2 < maybeBuyPrestige[2]) ignorePrestiges_temp = true;
		if (prestigeSetting === 1 && !canAtlantrimp && game.resources.metal.owned * 0.08 < maybeBuyPrestige[2]) ignorePrestiges_temp = true;

		if (!ignorePrestiges_temp && (maybeBuyPrestige[0] && (maybeBuyPrestige[1] > mostEfficient[isAttack].statPerResource || maybeBuyPrestige[3]))) {
			safeRatio = maybeBuyPrestige[1];
			nextLevelCost = maybeBuyPrestige[2];
			nextLevelValue = maybeBuyPrestige[4];
			prestige = true;
		}

		//if (!showAllEquips && prestigeSetting === 1 && !canAtlantrimp && nextLevelCost > game.resources.metal.owned) continue;

		//Skips items if they aren't at the highest prestige level we own and we have that setting enabled
		if (getPageSetting('equipPrestige') > 0 && getPageSetting('equipHighestPrestige') && !prestige && game.equipment[i].prestige < highestPrestige) continue;
		if (safeRatio === 1) continue;

		if (mostEfficient[isAttack].statPerResource > safeRatio && mostEfficient[isAttack].statPerResource != '') {
			mostEfficient[isAttack].name = i;
			mostEfficient[isAttack].statPerResource = safeRatio;
			mostEfficient[isAttack].prestige = prestige;
			mostEfficient[isAttack].cost = nextLevelCost;

		}
	}

	return [mostEfficient[0].name, mostEfficient[1].name, mostEfficient[0].statPerResource, mostEfficient[1].statPerResource, mostEfficient[0].prestige, mostEfficient[1].prestige, mostEfficient[0].cost, mostEfficient[1].cost];
}

function getMaxAffordable(baseCost, totalResource, costScaling, isCompounding) {
	if (!isCompounding) {
		return Math.floor(
			(costScaling - (2 * baseCost) + Math.sqrt(Math.pow(2 * baseCost - costScaling, 2) + (8 * costScaling * totalResource))) / 2
		);
	} else {
		return Math.floor(Math.log(1 - (1 - costScaling) * totalResource / baseCost) / Math.log(costScaling));
	}
}

function buyPrestigeMaybe(equipName, resourceSpendingPct, maxLevel) {

	if (challengeActive('Pandemonium') && game.challenges.Pandemonium.isEquipBlocked(equipName)) return false;
	if (challengeActive('Scientist')) return false;
	if (!maxLevel) maxLevel = Infinity;

	var prestigeUpgrade = "";
	var prestigeDone = false;

	var allUpgradeNames = Object.getOwnPropertyNames(equipmentList);

	for (var upgrade of allUpgradeNames) {
		if (upgrade === equipName) {
			prestigeUpgrade = game.upgrades[equipmentList[upgrade].Upgrade];
			if (prestigeUpgrade.allowed === prestigeUpgrade.done) prestigeDone = true;
			break;
		}
	}

	if (prestigeDone) return false;

	if (!resourceSpendingPct) resourceSpendingPct = 1;

	var equipment = game.equipment[equipName];

	var resource = (equipName == "Shield") ? 'wood' : 'metal'
	var equipStat = (typeof equipment.attack !== 'undefined') ? 'attack' : 'health';
	var prestigeUpgradeName = equipmentList[equipName].Upgrade;

	if (prestigeUpgrade.locked || (prestigeUpgradeName == 'Supershield' && getNextPrestigeCost(prestigeUpgradeName) * getEquipPriceMult() > game.resources.wood.owned * resourceSpendingPct)) return false;

	if (prestigeUpgrade.cost.resources.science[0] *
		Math.pow(prestigeUpgrade.cost.resources.science[1], equipment.prestige - 1)
		> game.resources.science.owned) {
		return false;
	}

	if (prestigeUpgrade.cost.resources.gems[0] *
		Math.pow(prestigeUpgrade.cost.resources.gems[1], equipment.prestige - 1)
		> game.resources.gems.owned) {
		return false;
	}

	var levelOnePrestige = getNextPrestigeCost(prestigeUpgradeName) * getEquipPriceMult();
	var newLevel = 1 + Math.max(0, Math.floor(getMaxAffordable((levelOnePrestige * 1.2), ((game.resources[resource].owned - levelOnePrestige) * resourceSpendingPct), 1.2, true)));
	newLevel = Math.max(1, Math.min(maxLevel, newLevel));
	var newStatValue = (newLevel) * Math.round(equipment[equipStat] * Math.pow(1.19, ((equipment.prestige) * game.global.prestige[equipStat]) + 1));
	var currentStatValue = equipment.level * equipment[equipStat + 'Calculated'];
	var statPerResource = levelOnePrestige / newStatValue;

	return [newStatValue > currentStatValue, statPerResource, levelOnePrestige, !prestigeDone, newStatValue];
}

function autoEquip() {

	if (
		!getPageSetting('equipOn') ||
		([2, 3].indexOf(currQuest()) >= 0 && game.global.lastClearedCell < 90) ||
		(currentMap === 'Smithy Farm') ||
		(game.mapUnlocks.AncientTreasure.canRunOnce &&
			(rBSRunningAtlantrimp || mapSettings.runAtlantrimp ||
				(game.global.mapsActive && (getCurrentMapObject().name === 'Atlantrimp' || getCurrentMapObject().name === 'Trimple Of Doom'))
			)
		)
	)
		return;

	if (game.global.universe === 1 && needGymystic() && canAffordTwoLevel('Gymystic')) {
		buyUpgrade('Gymystic', true, true);
		debug('Upgrading Gymystic', "equips", '*upload');
	}

	if (game.upgrades.Miners.allowed && !game.upgrades.Miners.done) return;

	var equipZone = getPageSetting('equipZone');
	var zoneGo = currentMap === 'Wither' || (HDRatio >= getPageSetting('equipCutOff')) || (equipZone.length > 0 && ((equipZone.includes(game.global.world)) || (game.global.world >= equipZone[equipZone.length - 1])));

	if (getPageSetting('equipPrestige') == 2 && !zoneGo) {
		var prestigeLeft = false;
		do {
			prestigeLeft = false;
			for (var equipName in game.equipment) {
				if (buyPrestigeMaybe(equipName)[0]) {
					if (!game.equipment[equipName].locked) {
						var isAttack = (equipmentList[equipName].Stat === 'attack' ? 0 : 1);
						if (game.global.universe === 2 && getPageSetting('equipNoShields') && equipName == 'Shield') continue;
						if ((getPageSetting('equipPrestige') === 2 || mostEfficientEquipment()[isAttack + 4]) && buyUpgrade(equipmentList[equipName].Upgrade, true, true))
							prestigeLeft = true;
					}
				}
			}
		} while (prestigeLeft)
	}

	//Initialise settings for later user
	var alwaysLvl2 = getPageSetting('equip2');
	var alwaysPandemonium = getPageSetting('pandemoniumAE') > 0;
	// always2 / alwaysPrestige / alwaysPandemonium
	if (alwaysLvl2 || (alwaysPandemonium && challengeActive('Pandemonium'))) {
		for (var equip in game.equipment) {
			if (!game.equipment[equip].locked) {
				if (alwaysLvl2 && game.equipment[equip].level < 2) {
					buyEquipment(equip, null, true, 1);
					debug('Upgrading ' + '1' + ' ' + equip, "equips", '*upload3');
				}
				if (alwaysPandemonium && challengeActive('Pandemonium')) {
					if (game.challenges.Pandemonium.isEquipBlocked(equip)) continue;
					buyEquipment(equip, null, true, 1);
					debug('Upgrading ' + '1' + ' ' + equip, "equips", '*upload3');
				}
			}
		}
	}

	var attackEquipCap = (getPageSetting('equipCapAttack') <= 0 || currentMap === 'Smithless Farm' ? Infinity : getPageSetting('equipCapAttack'));
	var healthEquipCap = (getPageSetting('equipCapHealth') <= 0 || currentMap === 'Smithless Farm' ? Infinity : getPageSetting('equipCapHealth') || mapSettings.shouldHealthFarm);
	var maxCanAfford = 0;

	if (challengeActive('Scientist')) {
		attackEquipCap = Infinity;
		healthEquipCap = Infinity;
	}

	//Buy as many shields as possible when running Melting Point
	if (game.global.universe === 2 && !getPageSetting('equipNoShields') && getPageSetting('jobSettingsArray').NoLumberjacks.enabled && game.global.mapsActive && getCurrentMapObject().name == 'Melting Point')
		buyEquipment('Shield', null, true, 999)

	var ignoreShields = game.global.universe === 2 && getPageSetting('equipNoShields');
	// Loop through actually getting equips
	var keepBuying = false;
	do {
		keepBuying = false;
		var resourceSpendingPct = zoneGo ? 1 : getPageSetting('equipPercent') < 0 ? 1 : getPageSetting('equipPercent') / 100;
		var bestBuys = mostEfficientEquipment(resourceSpendingPct, zoneGo, ignoreShields, false, false);
		// Set up for both Attack and Health depending on which is cheaper to purchase
		var equipType = (bestBuys[6] < bestBuys[7]) ? 'attack' : 'health';
		var equipName = (equipType == 'attack') ? bestBuys[0] : bestBuys[1];
		var equipCost = (equipType == 'attack') ? bestBuys[6] : bestBuys[7];
		var equipPrestige = (equipType == 'attack') ? bestBuys[4] : bestBuys[5];
		var equipCap = (equipType == 'attack') ? attackEquipCap : healthEquipCap;
		var resourceUsed = (equipName == 'Shield') ? 'wood' : 'metal';

		zoneGo = (HDRatio >= getPageSetting('equipCutOff')) || (equipZone.length > 0 && ((equipZone.includes(game.global.world)) || (game.global.world >= equipZone[equipZone.length - 1])));



		for (var i = 0; i < 2; i++) {
			//Setting weapon equips to 100% spending during Smithless farm.
			if (equipType === 'attack') {
				if (challengeActive('Smithless') && currentMap === 'Smithless Farm') {
					resourceSpendingPct = 1;
					zoneGo = true;
				}
			}
			if (equipType === 'health') {
				if (mapSettings.shouldHealthFarm) {
					resourceSpendingPct = 1;
					zoneGo = true;
				}
			}
			if ((game.resources[resourceUsed].owned - resourceNeeded[resourceUsed]) > equipCost) {
				if (game.equipment[equipName].level < equipCap || equipPrestige || zoneGo) {
					if (!equipPrestige) {
						maxCanAfford = getMaxAffordable(equipCost, (game.resources[resourceUsed].owned * 0.001), 1.2, true);
						if (maxCanAfford === 0)
							maxCanAfford = 1;
						if (maxCanAfford >= (equipCap - game.equipment[equipName].level))
							maxCanAfford = equipCap - game.equipment[equipName].level;
					}

					// Check any of the overrides
					if (equipCost <= resourceSpendingPct * game.resources[resourceUsed].owned) {
						if (!game.equipment[equipName].locked) {
							if (equipPrestige) {
								buyUpgrade(equipmentList[equipName].Upgrade, true, true)
								debug('Upgrading ' + equipName + " - Prestige " + game.equipment[equipName].prestige, "equips", '*upload');
							}
							else if (maxCanAfford > 0) {
								buyEquipment(equipName, null, true, maxCanAfford)
								debug('Upgrading ' + maxCanAfford + ' ' + equipName + (maxCanAfford > 1 && equipName !== 'Boots' && equipName !== 'Pants' && equipName !== 'Shoulderguards' ? 's' : ''), "equips", '*upload3');
								keepBuying = true;
							}
							HDRatio = calcHDRatio(game.global.world, 'world');
						}
					}
				}
			}

			//Iterating to second set of equips. Will go through the opposite equipType from the first loop.
			equipType = (equipType != 'attack') ? 'attack' : 'health';
			equipName = (equipType == 'attack') ? bestBuys[0] : bestBuys[1];
			equipCost = (equipType == 'attack') ? bestBuys[6] : bestBuys[7];
			equipPrestige = (equipType == 'attack') ? bestBuys[4] : bestBuys[5];
			resourceUsed = (equipName == 'Shield') ? 'wood' : 'metal';
			equipCap = (equipType === 'attack') ? attackEquipCap : healthEquipCap;
			zoneGo = (HDRatio >= getPageSetting('equipCutOff')) || (equipZone.length > 0 && ((equipZone.includes(game.global.world)) || (game.global.world >= equipZone[equipZone.length - 1])));
		}
	} while (keepBuying)
}

function getTotalMultiCost(baseCost, multiBuyCount, costScaling, isCompounding) {

	if (!isCompounding) {
		return multiBuyCount * (multiBuyCount * costScaling - costScaling + 2 * baseCost) / 2;
	} else {
		return baseCost * ((1 - Math.pow(costScaling, multiBuyCount)) / (1 - costScaling));
	}
}

function equipfarmdynamicHD(HDFSettings) {
	var equipfarmHD = 0;
	var equipfarmHDmult = 1;
	var HDFMult = HDFSettings.hdMult;
	var HDFZone = HDFSettings.world
	equipfarmHD = HDFSettings.hdBase;
	HDFZone = (game.global.world - HDFZone);
	equipfarmHDmult = (HDFZone == 0) ? equipfarmHD : Math.pow(HDFMult, HDFZone) * equipfarmHD;
	return equipfarmHDmult;
}

function estimateEquipsForZone(rEFIndex) {
	var MAX_EQUIP_DELTA = 1000;
	var checkMutations = game.global.world > 200;

	// calculate stats needed pass zone
	var gammaBurstDmg = getPageSetting('gammaBurstCalc') ? gammaBurstPct : 1;
	var ourHealth = calcOurHealth(false, 'world');
	var ourDmg = calcOurDmg('avg', 0, false, 'world', 'maybe', 0, false) * gammaBurstDmg;
	var enemyHealth = calcEnemyHealthCore('world', game.global.world, 99, 'Turtlimp');
	var enemyDamageBeforeEquality = calcEnemyAttackCore('world', game.global.world, 99, 'Snimp', false, false, 0);

	var healthNeededMulti = enemyDamageBeforeEquality / ourHealth; // The multiplier we need to apply to our health to survive

	// Get a fake ratio pretending that we don't have any equality in.
	var fakeHDRatio = enemyHealth / ourDmg;
	var attackNeededMulti = fakeHDRatio / (equipfarmdynamicHD(rEFIndex));

	// Something something figure out equality vs health farming
	var tempEqualityUse = 0;
	while (
		(healthNeededMulti > 1 || attackNeededMulti > 1)  // If it's below 1 we don't actually need more
		&&
		(healthNeededMulti * game.portal.Equality.getModifier() > attackNeededMulti / game.portal.Equality.getModifier(true)) // Need more health proportionally
		&&
		tempEqualityUse < game.portal.Equality.radLevel
	) {
		tempEqualityUse++;
		healthNeededMulti *= game.portal.Equality.getModifier();
		attackNeededMulti /= game.portal.Equality.getModifier(true);
		enemyDamageBeforeEquality *= game.portal.Equality.getModifier();
	}

	//debug("E = " + tempEqualityUse + " HPmult = " + healthNeededMulti + " Atkmult = " + attackNeededMulti)

	if (healthNeededMulti < 1 && attackNeededMulti < 1 || ((healthNeededMulti + attackNeededMulti) / 2 < 1)) { return [0, {}] };

	var ourAttack = 6;
	for (var i in equipmentList) {
		if (game.equipment[i].locked !== 0) continue;
		var attackBonus = game.equipment[i].attackCalculated;
		var level = game.equipment[i].level;
		ourAttack += (attackBonus !== undefined ? attackBonus : 0) * level;
	}

	// Amount of stats needed directly from equipment
	var attackNeeded = ourAttack * attackNeededMulti;
	var healthNeeded = ourHealth * healthNeededMulti / (getTotalHealthMod() * game.resources.trimps.maxSoldiers);

	var bonusLevels = {}; // How many levels you'll be getting in each shield-gambeson armor slots


	while (healthNeeded > 0) {
		var bestArmor = mostEfficientEquipment(1, true, true, false, true, bonusLevels, true)[1];
		healthNeeded -= game.equipment[bestArmor][equipmentList[bestArmor].Stat + "Calculated"];
		if (typeof bonusLevels[bestArmor] === 'undefined') {
			bonusLevels[bestArmor] = 0;
		}
		if (bonusLevels[bestArmor]++ > MAX_EQUIP_DELTA) {
			return [Infinity, bonusLevels];
		}
	}
	while (attackNeeded > 0) {
		var bestWeapon = mostEfficientEquipment(1, true, true, false, true, bonusLevels, true)[0];
		attackNeeded -= game.equipment[bestWeapon][equipmentList[bestWeapon].Stat + "Calculated"];
		if (typeof bonusLevels[bestWeapon] === 'undefined') {
			bonusLevels[bestWeapon] = 0;
		}
		if (bonusLevels[bestWeapon]++ >= MAX_EQUIP_DELTA) {
			return [Infinity, bonusLevels];
		}
	}

	var totalCost = 0;
	for (var equip in bonusLevels) {
		var equipCost = game.equipment[equip].cost[equipmentList[equip].Resource];
		totalCost += getTotalMultiCost((equipCost[0]), bonusLevels[equip], equipCost[1], true) * getEquipPriceMult();
	}

	return [totalCost, bonusLevels];
}

function displayMostEfficientEquipment() {

	if (usingRealTimeOffline) return;
	var highlightSetting = getPageSetting('equipEfficientEquipDisplay');
	if (!highlightSetting) return;
	if (game.options.menu.equipHighlight.enabled > 0) toggleSetting("equipHighlight")
	if (!oneSecondInterval) return;
	var $eqNamePrestige = null;

	if (!highlightSetting) return;

	if (!highlightSetting) {
		for (var item in game.equipment) {
			if (game.upgrades[equipmentList[item].Upgrade].locked == 0) {
				$eqNamePrestige = document.getElementById(equipmentList[item].Upgrade);
				if (document.getElementsByClassName(item).length == 0) {
					document.getElementById(equipmentList[item].Upgrade).classList.add("efficient");
					document.getElementById(equipmentList[item].Upgrade).classList.add(item);
				}
			}

			var $eqName = document.getElementById(item);
			if (!$eqName)
				continue;

			swapClass('efficient', 'efficientNo', $eqName)
			if ($eqNamePrestige != null)
				swapClass('efficient', 'efficientNo', $eqNamePrestige)
		}

	}

	for (var item in game.equipment) {
		if (game.equipment[item].locked) continue;
		if (item == "Shield") continue;
		var bestBuys = mostEfficientEquipment(1, true, true, false, true);
		var isAttack = (equipmentList[item].Stat === 'attack' ? 0 : 1);
		var $eqNamePrestige = null;
		if (game.upgrades[equipmentList[item].Upgrade].locked == 0) {
			$eqNamePrestige = document.getElementById(equipmentList[item].Upgrade);
			if (document.getElementsByClassName(item).length == 0) {
				document.getElementById(equipmentList[item].Upgrade).classList.add("efficient");
				document.getElementById(equipmentList[item].Upgrade).classList.add(item);
			}
			if (document.getElementById(equipmentList[item].Upgrade).classList.contains('efficientYes') && (item != bestBuys[isAttack] || (item == bestBuys[isAttack] && bestBuys[isAttack + 4] !== true)))
				swapClass('efficient', 'efficientNo', $eqNamePrestige)
		}
		if (item == bestBuys[isAttack] && bestBuys[isAttack + 4] === true) {
			bestBuys[isAttack] = equipmentList[item].Upgrade;
			if (document.getElementById(item).classList.contains('efficientYes'))
				swapClass('efficient', 'efficientNo', document.getElementById(item))
			item = equipmentList[item].Upgrade;
		}

		var $eqName = document.getElementById(item);
		if (!$eqName)
			continue;
		if (item == bestBuys[isAttack])
			swapClass('efficient', 'efficientYes', $eqName)
		else {
			swapClass('efficient', 'efficientNo', $eqName)
		}
	}
}