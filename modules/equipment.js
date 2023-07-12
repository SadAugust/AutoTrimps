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

	const hasSciFour = ((game.global.universe === 1 && game.global.sLevel >= 4) || (game.global.universe === 2 && game.buildings.Microchip.owned >= 4));
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
			if (hasSciFour && prestigeCount % 2 === 1) {
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
			if (game.challenges.Pandemonium.isEquipBlocked(equipName) || equipmentList[equipName].Resource === 'wood') continue;
			nextLevelEquipmentCost = game.equipment[equipName].cost[equipmentList[equipName].Resource][0] * Math.pow(game.equipment[equipName].cost[equipmentList[equipName].Resource][1], game.equipment[equipName].level) * getEquipPriceMult();
			//Sets nextEquipmentCost to the price of an equip if it costs less than the current value of nextEquipCost
			if (nextLevelEquipmentCost < nextEquipmentCost || nextEquipmentCost === null) {
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
					if (nextLevelPrestigeCost < nextPrestigeCost || nextPrestigeCost === null) {
						prestigeName = prestigeUpgradeName
						nextPrestigeCost = nextLevelPrestigeCost;
					}
				}
			}
		}
	}
	return [equipmentName, nextEquipmentCost, prestigeName, nextLevelPrestigeCost]
}

function mostEfficientEquipment(resourceSpendingPct, zoneGo, ignoreShield, skipForLevels, equipHighlight, fakeLevels = {}, ignorePrestiges) {

	for (var i in equipmentList) {
		if (typeof fakeLevels[i] === 'undefined') {
			fakeLevels[i] = 0;
		}
	}
	if (!ignoreShield) ignoreShield = getPageSetting('equipNoShields');
	if (!skipForLevels) skipForLevels = false;

	var zoneGoHealth = !zoneGo ? zoneGoCheck(getPageSetting('equipZone'), 'health').active : zoneGo;
	var zoneGoAttack = !zoneGo ? zoneGoCheck(getPageSetting('equipZone'), 'attack').active : zoneGo;

	var resourceSpendingPctHealth = !resourceSpendingPct ? (zoneGoHealth ? 1 : getPageSetting('equipPercent') < 0 ? 1 : getPageSetting('equipPercent') / 100) : resourceSpendingPct;
	var resourceSpendingPctAttack = !resourceSpendingPct ? (zoneGoAttack ? 1 : getPageSetting('equipPercent') < 0 ? 1 : getPageSetting('equipPercent') / 100) : resourceSpendingPct;

	var prestigePct = getPageSetting('equipPrestigePct') / 100;


	if (challengeActive('Scientist')) {
		skipForLevels = Infinity;
	}

	var mostEfficient = {
		attack: {
			name: "",
			statPerResource: Infinity,
			prestige: false,
			cost: 0,
			resourceSpendingPct: 0,
			zoneGo: false,
			equipCap: 0,
		},
		health: {
			name: "",
			statPerResource: Infinity,
			prestige: false,
			cost: 0,
			resourceSpendingPct: 0,
			zoneGo: false,
			equipCap: 0,
		},
	};

	var highestPrestige = 0;
	var prestigesAvailable = false;

	var canAtlantrimp = game.mapUnlocks.AncientTreasure.canRunOnce;
	var prestigeSetting = getPageSetting('equipPrestige');

	//Checks what our highest prestige level is AND if there are any prestiges available to purchase
	//If this fully runs and returns true it WILL override checking non-prestige equip stats!
	for (var i in equipmentList) {
		var equipType = equipmentList[i].Stat;
		var prestigeGo = equipType === 'attack' ? zoneGoAttack : zoneGoHealth;
		if (game.equipment[i].prestige > highestPrestige) highestPrestige = game.equipment[i].prestige;
		if (prestigesAvailable) continue;
		if (ignorePrestiges) continue;
		if (prestigeSetting === 0) continue;
		if (prestigeSetting === 1 && prestigeGo) continue;
		if (prestigeSetting === 2 && !canAtlantrimp) continue;
		if (i === 'Shield') continue;
		if (buyPrestigeMaybe(i).skip) continue;

		prestigesAvailable = true;
	}

	//Loops through each piece of equipment to figure out the most efficient one to buy
	for (var i in equipmentList) {
		if (game.equipment[i].locked) continue;

		var equipType = equipmentList[i].Stat;
		zoneGo = equipType === 'attack' ? zoneGoAttack : zoneGoHealth;
		var prestige = false;
		resourceSpendingPct = equipType === 'attack' ? resourceSpendingPctAttack : resourceSpendingPctHealth;
		var nextLevelValue = 1;
		var safeRatio = 1;
		//Figuring out if we should force prestige purchases or check non-prestige stats
		var forcePrestige = (prestigeSetting === 1 && zoneGo) || (prestigeSetting === 2 && canAtlantrimp) || prestigeSetting === 3;
		//Identifying the equip cap for this equip type
		var equipCap = !skipForLevels && equipType === 'attack' ? getPageSetting('equipCapAttack') :
			!skipForLevels && equipType === 'health' ? getPageSetting('equipCapHealth') :
				skipForLevels

		var nextLevelCost = game.equipment[i].cost[equipmentList[i].Resource][0] * Math.pow(game.equipment[i].cost[equipmentList[i].Resource][1], game.equipment[i].level + fakeLevels[i]) * getEquipPriceMult();

		//Skipping Shields when can buy Gymystic
		if (game.global.universe === 1 && i === 'Shield' && needGymystic()) continue;
		//Setting armor equips to 100% when we need to farm health
		if (mapSettings.shouldHealthFarm && equipType === 'health') resourceSpendingPct = 1;
		//Setting equips to 100% spending during Smithless farm. Weapons always and armor if we are using more than 0 equality levels
		if (mapSettings.mapName === 'Smithless Farm') {
			if (equipType === 'attack' || mapSettings.equality > 0) {
				equipCap = Infinity;
				resourceSpendingPct = 1;
			}
		}
		//Load buyPrestigeMaybe into variable so it's not called 500 times
		var maybeBuyPrestige = buyPrestigeMaybe(i, resourceSpendingPct, game.equipment[i].level);
		//Skips if we have the equip capped and we aren't potentially farming for the prestige
		if (!maybeBuyPrestige.purchase && game.equipment[i].level >= equipCap) continue;
		//Skips if ignoreShield variable is true.
		if (ignoreShield && i === 'Shield') continue;
		//Skips looping through equips if they're blocked during Pandemonium.
		if (challengeActive('Pandemonium') && game.challenges.Pandemonium.isEquipBlocked(i)) continue;
		//Skips buying shields when you can afford bonfires on Hypothermia.
		if (challengeActive('Hypothermia') && i === 'Shield' && game.resources.wood.owned > game.challenges.Hypothermia.bonfirePrice()) continue;
		//Skips through equips if they cost more than your equip purchasing percent setting value.
		if (!equipHighlight && !canAffordBuilding(i, null, null, true, false, 1, resourceSpendingPct * 100) && !maybeBuyPrestige.purchase) continue;
		//Skips equips if we have prestiges available & no prestiges to get for this
		if (prestigesAvailable && forcePrestige && maybeBuyPrestige.prestigeDone) continue;
		//If prestiges available & running certain setting skips (check above for loop) look at non-prestige item stats.
		if (!prestigesAvailable || !forcePrestige) {
			nextLevelValue = game.equipment[i][equipmentList[i].Stat + "Calculated"];
			safeRatio = nextLevelCost / nextLevelValue;
		}

		//Early game bandaid fix for lack of gems, science etc.
		//Setting skipPrestiges to true if ignorePrestiges is called OR buyPrestigeMaybe.skip (we don't have enough Science or Gems for the Prestige which SHOULD only happen in the ultra early game)
		var skipPrestiges = ignorePrestiges || maybeBuyPrestige.skip || false;
		//Check for further overrides for if we want to skip looking at prestiges
		if (!skipPrestiges) {
			if ((prestigeSetting === 0 || (prestigeSetting === 1 && !zoneGo)) && !ignorePrestiges && game.equipment[i].level < 6) skipPrestiges = true;
			if (prestigeSetting === 2 && !canAtlantrimp && game.resources[equipmentList[i].Resource].owned * prestigePct < maybeBuyPrestige.prestigeCost) skipPrestiges = true;
		}

		if (!skipPrestiges) {
			if (maybeBuyPrestige.purchase && (maybeBuyPrestige.statPerResource < mostEfficient[equipType].statPerResource || mostEfficient[equipType].name === '')) {
				safeRatio = maybeBuyPrestige.statPerResource;
				nextLevelCost = maybeBuyPrestige.prestigeCost;
				nextLevelValue = maybeBuyPrestige.newStatValue;
				prestige = true;
			}
			//Skips items if they aren't at the highest prestige level
			//This is so that we don't unnecessarily spend resources on equips levels that aren't at the highest prestige level we own
			else if (game.equipment[i].prestige > highestPrestige && forcePrestige) continue;
		}

		if (safeRatio === 1) continue;
		//Stat per resource SHOULD BE resource per stat (so the inverse of it is)
		//Check if the current saved equip is the most efficient (should be lowest statPerResource value equip available)
		//We want the item that gives us the most stats per resource spent so check if the current item is better than the saved one
		if (mostEfficient[equipType].statPerResource > safeRatio || mostEfficient[equipType].name === '') {
			mostEfficient[equipType].name = i;
			mostEfficient[equipType].statPerResource = safeRatio;
			mostEfficient[equipType].prestige = prestige;
			mostEfficient[equipType].cost = nextLevelCost;
			mostEfficient[equipType].resourceSpendingPct = resourceSpendingPct;
			mostEfficient[equipType].zoneGo = zoneGo;
			mostEfficient[equipType].equipCap = equipCap;
		}
	}

	return mostEfficient;
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

	const prestigeInfo = {
		purchase: false,
		prestigeDone: false,
		oneLevelStat: 0,
		newStatValue: 0,
		prestigeCost: 0,
		newLevel: 0,
		statPerResource: 0,
		currentStatValue: 0,
		skip: true,
	}

	if (challengeActive('Pandemonium') && game.challenges.Pandemonium.isEquipBlocked(equipName)) return prestigeInfo;
	if (challengeActive('Scientist')) return prestigeInfo;
	if (!maxLevel) maxLevel = Infinity;

	var prestigeUpgrade = "";
	var prestigeDone = false;

	var allUpgradeNames = Object.getOwnPropertyNames(equipmentList);

	for (var upgrade of allUpgradeNames) {
		if (upgrade === equipName) {
			prestigeUpgrade = game.upgrades[equipmentList[upgrade].Upgrade];
			if (prestigeUpgrade.allowed === prestigeUpgrade.done) prestigeInfo.prestigeDone = true;
			break;
		}
	}

	if (prestigeInfo.prestigeDone) return prestigeInfo;

	if (!resourceSpendingPct) resourceSpendingPct = 1;

	var equipment = game.equipment[equipName];
	var prestigeUpgradeName = equipmentList[equipName].Upgrade;

	if (prestigeUpgrade.locked || (prestigeUpgradeName === 'Supershield' && getNextPrestigeCost(prestigeUpgradeName) * getEquipPriceMult() > game.resources.wood.owned * resourceSpendingPct)) return prestigeInfo;

	if (prestigeUpgrade.cost.resources.science[0] *
		Math.pow(prestigeUpgrade.cost.resources.science[1], equipment.prestige - 1)
		> game.resources.science.owned) {
		return prestigeInfo;
	}

	if (prestigeUpgrade.cost.resources.gems[0] *
		Math.pow(prestigeUpgrade.cost.resources.gems[1], equipment.prestige - 1)
		> game.resources.gems.owned) {
		return prestigeInfo;
	}

	var resourceUsed = (equipName === 'Shield') ? 'wood' : 'metal'
	var equipStat = (typeof equipment.attack !== 'undefined') ? 'attack' : 'health';

	//Cost of the base upgrade for the prestige
	var prestigeCost = getNextPrestigeCost(prestigeUpgradeName) * getEquipPriceMult();
	//How many levels we can afford in the prestige with out current resource total
	var newLevel = 1 + Math.max(0, Math.floor(getMaxAffordable((prestigeCost * 1.2), ((game.resources[resourceUsed].owned - prestigeCost) * resourceSpendingPct), 1.2, true)));
	//On the off chance we can't afford any levels then set the minimum to one otherwise use the actual value
	newLevel = Math.max(1, Math.min(maxLevel, newLevel));
	//Figure out how many stats the new prestige + levels we can afford in it will provide
	var oneLevelStat = Math.round(equipment[equipStat] * Math.pow(1.19, ((equipment.prestige) * game.global.prestige[equipStat]) + 1));
	var newStatValue = newLevel * oneLevelStat;
	//Identify the stat total we currently get from the equip
	var currentStatValue = equipment.level * equipment[equipStat + 'Calculated'];
	//Work out the total cost of the prestige + levels we can afford in it
	prestigeCostTotal = prestigeCost + (prestigeCost * Math.pow(1.2, (newLevel - 1)));
	//Figure out how many stats we get per resource
	var statPerResource = prestigeCost / oneLevelStat;

	prestigeInfo.purchase = newStatValue > currentStatValue;
	prestigeInfo.prestigeDone = prestigeDone;
	prestigeInfo.oneLevelStat = oneLevelStat;
	prestigeInfo.newStatValue = newStatValue;
	prestigeInfo.prestigeCost = prestigeCost;
	prestigeInfo.prestigeCostTotal = prestigeCost * newLevel;
	prestigeInfo.newLevel = newLevel;
	prestigeInfo.statPerResource = statPerResource;
	prestigeInfo.currentStatValue = currentStatValue;
	prestigeInfo.skip = false;

	return prestigeInfo;
}

//Check to see if we are in the zone range that the user set
function zoneGoCheck(setting, farmType) {

	const zoneDetails = {
		active: true,
		zone: game.global.world,
	};

	var hdRatio = mapSettings.mapName === 'Void Map' ? hdStats.hdRatioVoid : hdStats.hdRatio

	//Equipment related section for zone overrides
	if (farmType === 'attack' || farmType === 'health') {
		if (mapSettings.mapName === 'Wither') return zoneDetails;
		if (farmType === 'attack') {
			if (hdRatio > getPageSetting('equipCutOffHD')) return zoneDetails;
			if (mapSettings.mapName === 'Smithless Farm') return zoneDetails;
		}
		if (farmType === 'health') {
			if (whichHitsSurvived() < getPageSetting('equipCutOffHS')) return zoneDetails;
			//Farming for health means we should prio health equips 
			if (mapSettings.shouldHealthFarm) return zoneDetails;
			//Since having to use equality will lower our damage then we want more health to reduce equality usage
			if (mapSettings.mapName === 'Smithless Farm' && mapSettings.equality > 0) return zoneDetails;
			//Since equality has a big impact on u2 HD Ratio then we want more health to reduce equality required.
			if (game.global.universe === 2 && hdRatio > getPageSetting('equipCutOffHD')) return zoneDetails;
		}
	}

	var settingZone = setting;
	var world = game.global.world.toString();

	var p = -1;
	for (var i = 0; i < settingZone.length; i++) {
		var zone = settingZone[i].toString();
		//Check to see if we are in the zone range that the user set
		if (zone.indexOf(".") >= 0 && game.global.world >= zone.split(".")[0] && game.global.world <= zone.split(".")[1]) {
			p = i;
			break;
		}
		//Return true if zone match world
		else if (world === zone) {
			p = i;
			break;
		}
	}

	if (p !== -1) {
		zoneDetails.zone = settingZone[p];
		return zoneDetails;
	}
	//Setting config to false since nothing matches
	else {
		zoneDetails.active = false;
		zoneDetails.zone = 999;
	}

	return zoneDetails;
}

function autoEquip() {

	if (
		!getPageSetting('equipOn') ||
		([2, 3].indexOf(currQuest()) >= 0 && game.global.lastClearedCell < 90) ||
		(mapSettings.mapName === 'Smithy Farm') ||
		(game.mapUnlocks.AncientTreasure.canRunOnce &&
			(mapSettings.runAtlantrimp ||
				(game.global.mapsActive && (getCurrentMapObject().name === 'Atlantrimp' || getCurrentMapObject().name === 'Trimple Of Doom'))
			)
		) || settingChangedTimeout
	)
		return;

	if (game.upgrades.Miners.allowed && !game.upgrades.Miners.done) return;

	//This ignores HD Farm & Hits Survived overrides!
	var zoneGo = zoneGoCheck(getPageSetting('equipZone')).active;

	var equipPrestigeSetting = getPageSetting('equipPrestige');
	if (equipPrestigeSetting === 3 && !zoneGo) {
		var prestigeLeft = false;
		do {
			prestigeLeft = false;
			for (var equipName in game.equipment) {
				if (buyPrestigeMaybe(equipName).purchase) {
					if (!game.equipment[equipName].locked) {
						var equipType = equipmentList[equipName].Stat;
						if (getPageSetting('equipNoShields') && equipName === 'Shield') continue;
						if ((equipPrestigeSetting === 3 || mostEfficientEquipment()[equipType].prestige) && buyUpgrade(equipmentList[equipName].Upgrade, true, true))
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
				//Skips trying to buy extra levels if we can't afford them
				if (!canAffordBuilding(equip, false, false, true, false, 1)) continue;
				if (alwaysLvl2 && game.equipment[equip].level < 2) {
					buyEquipment(equip, true, true, 1);
					debug('Upgrading ' + '1' + ' ' + equip, 'equipment', '*upload3');
				}
				if (alwaysPandemonium && challengeActive('Pandemonium')) {
					if (game.challenges.Pandemonium.isEquipBlocked(equip)) continue;
					buyEquipment(equip, true, true, 1);
					debug('Upgrading ' + '1' + ' ' + equip, 'equipment', '*upload3');
				}
			}
		}
	}

	var maxCanAfford = 0;

	//Buy as many shields as possible when running Melting Point
	if (game.global.universe === 2 && !getPageSetting('equipNoShields') && getPageSetting('jobSettingsArray').NoLumberjacks.enabled && game.global.mapsActive && getCurrentMapObject().name === 'Melting Point')
		buyEquipment('Shield', true, true, 999)

	var ignoreShields = getPageSetting('equipNoShields');
	// Loop through actually getting equips
	var keepBuying = false;
	do {
		keepBuying = false;
		var bestBuys = mostEfficientEquipment(null, null, ignoreShields, false);
		// Set up for both Attack and Health depending on which is cheaper to purchase
		var equipType = (bestBuys.attack.cost < bestBuys.health.cost) ? 'attack' : 'health';
		var equipName = bestBuys[equipType].name;
		var equipCost = bestBuys[equipType].cost;
		var equipPrestige = bestBuys[equipType].prestige;
		var equipCap = bestBuys[equipType].equipCap;
		var resourceSpendingPct = bestBuys[equipType].resourceSpendingPct;
		zoneGo = bestBuys[equipType].zoneGo;
		var resourceUsed = (equipName === 'Shield') ? 'wood' : 'metal';

		for (var i = 0; i < 2; i++) {
			if (equipName !== '' && canAffordBuilding(equipName, false, false, true, false, 1)) {
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
								debug('Upgrading ' + equipName + " - Prestige " + game.equipment[equipName].prestige, 'equipment', '*upload');
							}
							else if (maxCanAfford > 0) {
								buyEquipment(equipName, true, true, maxCanAfford)
								debug('Upgrading ' + maxCanAfford + ' ' + equipName + (maxCanAfford > 1 && equipName !== 'Boots' && equipName !== 'Pants' && equipName !== 'Shoulderguards' ? 's' : ''), 'equipment', '*upload3');
								keepBuying = true;
							}
							hdStats.hdRatio = calcHDRatio(game.global.world, 'world');
						}
					}
				}
			}

			//Iterating to second set of equips. Will go through the opposite equipType from the first loop.
			equipType = (equipType !== 'attack') ? 'attack' : 'health';
			equipName = bestBuys[equipType].name;
			equipCost = bestBuys[equipType].cost;
			equipPrestige = bestBuys[equipType].prestige;
			equipCap = bestBuys[equipType].equipCap;
			resourceSpendingPct = bestBuys[equipType].resourceSpendingPct;
			resourceUsed = (equipName === 'Shield') ? 'wood' : 'metal';
			zoneGo = bestBuys[equipType].zoneGo;
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
	equipfarmHDmult = (HDFZone === 0) ? equipfarmHD : Math.pow(HDFMult, HDFZone) * equipfarmHD;
	return equipfarmHDmult;
}

function estimateEquipsForZone(rEFIndex) {
	var MAX_EQUIP_DELTA = 1000;

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
		var bestArmor = mostEfficientEquipment(1, true, true, false, false, bonusLevels, true)[1];
		healthNeeded -= game.equipment[bestArmor][equipmentList[bestArmor].Stat + "Calculated"];
		if (typeof bonusLevels[bestArmor] === 'undefined') {
			bonusLevels[bestArmor] = 0;
		}
		if (bonusLevels[bestArmor]++ > MAX_EQUIP_DELTA) {
			return [Infinity, bonusLevels];
		}
	}
	while (attackNeeded > 0) {
		var bestWeapon = mostEfficientEquipment(1, true, true, false, false, bonusLevels, true)[0];
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
			if (game.upgrades[equipmentList[item].Upgrade].locked === 0) {
				$eqNamePrestige = document.getElementById(equipmentList[item].Upgrade);
				if (document.getElementsByClassName(item).length === 0) {
					document.getElementById(equipmentList[item].Upgrade).classList.add("efficient");
					document.getElementById(equipmentList[item].Upgrade).classList.add(item);
				}
			}

			var $eqName = document.getElementById(item);
			if (!$eqName)
				continue;

			swapClass('efficient', 'efficientNo', $eqName)
			if ($eqNamePrestige !== null)
				swapClass('efficient', 'efficientNo', $eqNamePrestige)
		}

	}

	for (var item in game.equipment) {
		if (game.equipment[item].locked) continue;
		if (item === "Shield") continue;
		var bestBuys = mostEfficientEquipment(1, false, true, false, true);
		var equipType = equipmentList[item].Stat;
		var $eqNamePrestige = null;
		if (game.upgrades[equipmentList[item].Upgrade].locked === 0) {
			$eqNamePrestige = document.getElementById(equipmentList[item].Upgrade);
			if (document.getElementsByClassName(item).length === 0) {
				document.getElementById(equipmentList[item].Upgrade).classList.add("efficient");
				document.getElementById(equipmentList[item].Upgrade).classList.add(item);
			}
			if (document.getElementById(equipmentList[item].Upgrade).classList.contains('efficientYes') && (item !== bestBuys[equipType].name || (item === bestBuys[equipType].name && bestBuys[equipType].prestige !== true)))
				swapClass('efficient', 'efficientNo', $eqNamePrestige)
		}
		if (item === bestBuys[equipType].name && bestBuys[equipType].prestige === true) {
			bestBuys[equipType].name = equipmentList[item].Upgrade;
			if (document.getElementById(item).classList.contains('efficientYes'))
				swapClass('efficient', 'efficientNo', document.getElementById(item))
			item = equipmentList[item].Upgrade;
		}

		var $eqName = document.getElementById(item);
		if (!$eqName)
			continue;
		if (item === bestBuys[equipType].name)
			swapClass('efficient', 'efficientYes', $eqName)
		else {
			swapClass('efficient', 'efficientNo', $eqName)
		}
	}
}