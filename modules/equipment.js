MODULES.equipment = {
	Dagger: {
		upgrade: 'Dagadder',
		stat: 'attack',
		resource: 'metal',
	},
	Mace: {
		upgrade: 'Megamace',
		stat: 'attack',
		resource: 'metal',
	},
	Polearm: {
		upgrade: 'Polierarm',
		stat: 'attack',
		resource: 'metal',
	},
	Battleaxe: {
		upgrade: 'Axeidic',
		stat: 'attack',
		resource: 'metal',
	},
	Greatsword: {
		upgrade: 'Greatersword',
		stat: 'attack',
		resource: 'metal',
	},
	Boots: {
		upgrade: 'Bootboost',
		stat: 'health',
		resource: 'metal',
	},
	Helmet: {
		upgrade: 'Hellishmet',
		stat: 'health',
		resource: 'metal',
	},
	Pants: {
		upgrade: 'Pantastic',
		stat: 'health',
		resource: 'metal',
	},
	Shoulderguards: {
		upgrade: 'Smoldershoulder',
		stat: 'health',
		resource: 'metal',
	},
	Breastplate: {
		upgrade: 'Bestplate',
		stat: 'health',
		resource: 'metal',
	},
	Arbalest: {
		upgrade: 'Harmbalest',
		stat: 'attack',
		resource: 'metal',
	},
	Gambeson: {
		upgrade: 'GambesOP',
		stat: 'health',
		resource: 'metal',
	},
	Shield: {
		upgrade: 'Supershield',
		stat: 'health',
		resource: 'wood',
	}
};

function equipsToGet(targetZone, targetPrestige) {

	const prestigeList = ['Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'];
	if (!targetZone) targetZone = game.global.world;
	if (!targetPrestige) targetPrestige = 'GambesOP';
	//Skip locked equips
	if (!game.global.slowDone && prestigeList.indexOf(targetPrestige) > 10) targetPrestige = 'Bestplate';

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
			if (game.challenges.Pandemonium.isEquipBlocked(equipName) || MODULES.equipment[equipName].resource === 'wood') continue;
			nextLevelEquipmentCost = game.equipment[equipName].cost[MODULES.equipment[equipName].resource][0] * Math.pow(game.equipment[equipName].cost[MODULES.equipment[equipName].resource][1], game.equipment[equipName].level) * getEquipPriceMult();
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

	for (var i in MODULES.equipment) {
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
	for (var i in MODULES.equipment) {
		var equipType = MODULES.equipment[i].stat;
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
	for (var i in MODULES.equipment) {
		if (game.equipment[i].locked) continue;

		var equipType = MODULES.equipment[i].stat;
		zoneGo = equipType === 'attack' ? zoneGoAttack : zoneGoHealth;
		var prestige = false;
		resourceSpendingPct = equipType === 'attack' ? resourceSpendingPctAttack : resourceSpendingPctHealth;
		if (resourceSpendingPct > 1) resourceSpendingPct = 1;
		var nextLevelValue = 1;
		var safeRatio = 1;
		//Figuring out if we should force prestige purchases or check non-prestige stats
		var forcePrestige = (prestigeSetting === 1 && zoneGo) || (prestigeSetting === 2 && canAtlantrimp) || prestigeSetting === 3;
		//Identifying the equip cap for this equip type
		var equipCap = !skipForLevels && equipType === 'attack' ? getPageSetting('equipCapAttack') :
			!skipForLevels && equipType === 'health' ? getPageSetting('equipCapHealth') :
				skipForLevels

		var nextLevelCost = game.equipment[i].cost[MODULES.equipment[i].resource][0] * Math.pow(game.equipment[i].cost[MODULES.equipment[i].resource][1], game.equipment[i].level + fakeLevels[i]) * getEquipPriceMult();

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
		//Stops the script from buying more than 9 levels in an equip if we have prestiges available
		if (maybeBuyPrestige.prestigeAvailable) equipCap = 9;
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
		if (prestigesAvailable && forcePrestige && !maybeBuyPrestige.prestigeAvailable) continue;
		//If prestiges available & running certain setting skips (check above for loop) look at non-prestige item stats.
		if (!prestigesAvailable || !forcePrestige) {
			nextLevelValue = game.equipment[i][MODULES.equipment[i].stat + "Calculated"];
			safeRatio = nextLevelCost / nextLevelValue;
		}

		//Early game bandaid fix for lack of gems, science etc.
		//Setting skipPrestiges to true if ignorePrestiges is called OR buyPrestigeMaybe.skip (we don't have enough Science or Gems for the Prestige which SHOULD only happen in the ultra early game)
		var skipPrestiges = ignorePrestiges || maybeBuyPrestige.skip || false;
		//Check for further overrides for if we want to skip looking at prestiges
		if (!skipPrestiges) {
			if ((prestigeSetting === 0 || (prestigeSetting === 1 && !zoneGo && !ignorePrestiges)) && game.equipment[i].level < 6) skipPrestiges = true;
			if (prestigeSetting === 2 && !canAtlantrimp && game.resources[MODULES.equipment[i].resource].owned * prestigePct < maybeBuyPrestige.prestigeCost) skipPrestiges = true;
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
			mostEfficient[equipType].prestigeAvailable = maybeBuyPrestige.prestigeAvailable;
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
		prestigeAvailable: false,
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
	if (getPageSetting('equipNoShields') && equipName === 'Shield') return prestigeInfo;
	if (!maxLevel) maxLevel = Infinity;

	//Check to see if the equipName is valid
	if (Object.getOwnPropertyNames(MODULES.equipment).indexOf(equipName) === -1) return prestigeInfo;

	const prestigeUpgradeName = MODULES.equipment[equipName].upgrade;
	const prestigeUpgrade = game.upgrades[prestigeUpgradeName];

	if (prestigeUpgrade.locked || prestigeUpgrade.allowed === prestigeUpgrade.done) return prestigeInfo;
	prestigeInfo.prestigeAvailable = true;

	const equipment = game.equipment[equipName];

	//Check to see if we have enough science to purchase the prestige
	if (prestigeUpgrade.cost.resources.science[0] *
		Math.pow(prestigeUpgrade.cost.resources.science[1], equipment.prestige - 1)
		> game.resources.science.owned) {
		return prestigeInfo;
	}
	//Check to see if we have enough gems to purchase the prestige
	if (prestigeUpgrade.cost.resources.gems[0] *
		Math.pow(prestigeUpgrade.cost.resources.gems[1], equipment.prestige - 1)
		> game.resources.gems.owned) {
		return prestigeInfo;
	}

	var resourceUsed = (equipName === 'Shield') ? 'wood' : 'metal';
	var equipStat = (typeof equipment.attack !== 'undefined') ? 'attack' : 'health';
	if (!resourceSpendingPct) resourceSpendingPct = 1;

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
	//var prestigeCostTotal = prestigeCost + (prestigeCost * Math.pow(1.2, (newLevel - 1)));
	//Figure out how many stats we get per resource
	var statPerResource = prestigeCost / oneLevelStat;

	prestigeInfo.purchase = newStatValue > currentStatValue;
	prestigeInfo.oneLevelStat = oneLevelStat;
	prestigeInfo.newStatValue = newStatValue;
	prestigeInfo.prestigeCost = prestigeCost;
	prestigeInfo.prestigeCostTotal = prestigeCost * newLevel;
	prestigeInfo.newLevel = newLevel;
	prestigeInfo.statPerResource = statPerResource;
	prestigeInfo.currentStatValue = currentStatValue;
	prestigeInfo.skip = false;
	prestigeInfo.resource = resourceUsed;

	return prestigeInfo;
}

//Check to see if we are in the zone range that the user set
function zoneGoCheck(setting, farmType) {

	const zoneDetails = {
		active: true,
		zone: game.global.world,
	};

	var hdRatio = mapSettings.mapName === 'Void Map' ? hdStats.hdRatioVoid : hdStats.hdRatio;

	//Equipment related section for zone overrides
	//At or above z10 so that we have enough time to purchase buildings during the early game
	if (game.global.world >= 10 && (farmType === 'attack' || farmType === 'health')) {
		if (mapSettings.mapName === 'Wither') return zoneDetails;
		if (farmType === 'attack') {
			//Farming for damage means we should prio attack equips 
			if (hdRatio > getPageSetting('equipCutOffHD')) return zoneDetails;
			//Since we're farming for more damage to kill the Ubersmith we want to spend 100% of our resources on attack equips
			if (mapSettings.mapName === 'Smithless Farm') return zoneDetails;
		}
		if (farmType === 'health') {
			if (whichHitsSurvived() < getPageSetting('equipCutOffHS')) return zoneDetails;
			//Farming for health means we should prio health equips 
			if (mapSettings.shouldHealthFarm) return zoneDetails;
			//Since having to use equality will lower our damage then we want more health to reduce equality usage
			if (mapSettings.mapName === 'Smithless Farm' && mapSettings.equality > 0) return zoneDetails;
			//Since equality has a big impact on u2 HD Ratio then we want more health to reduce equality required.
			if (game.global.universe === 2 && hdRatio > getPageSetting('equipCutOffHD') && game.portal.Equality.radLevel > 0) return zoneDetails;
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

	//Disabling autoequip if the autoequip setting is disabled.
	if (!getPageSetting('equipOn')) return;
	//If running a wood or metal quest then disable autoequip
	if ([2, 3].indexOf(currQuest()) >= 0) return;
	//If smithy farming then disable autoequip
	if (mapSettings.mapName === 'Smithy Farm') return;
	//If we have just changed a setting that procs settingChangedTimeout then delay autoequip until the timeout has finished
	if (settingChangedTimeout) return;
	//Trimple/Atlantrimp overrides for don't run when farming and the user intends to run them or when inside the map itself.
	if (game.mapUnlocks.AncientTreasure.canRunOnce) {
		if (mapSettings.runAtlantrimp) return;
		else if (MODULES.mapFunctions.runUniqueMap === 'Atlantrimp' || MODULES.mapFunctions.runUniqueMap === 'Trimple Of Doom') return;
		else if (game.global.mapsActive && (getCurrentMapObject().name === 'Atlantrimp' || getCurrentMapObject().name === 'Trimple Of Doom')) return;
	}
	//Don't run before miners have been unlocked. This is to prevent a lengthy delay before miners are purchased when it buys several kinda unnecessary equips.
	if (game.upgrades.Miners.allowed && !game.upgrades.Miners.done) return;

	//Loops through equips and buys prestiges if we can afford them and equipPrestige is set to 'AE: Always Prestige' (3).
	//If we can then instantly purchase the prestige regardless of efficiency.
	if (getPageSetting('equipPrestige') === 3) {
		var prestigeLeft = false;
		var prestigeInfo = '';
		do {
			prestigeLeft = false;
			for (var equipName in game.equipment) {
				prestigeInfo = buyPrestigeMaybe(equipName);
				if (!game.equipment[equipName].locked && !prestigeInfo.skip) {
					if (game.resources[prestigeInfo.resource].owned < prestigeInfo.prestigeCost) continue;
					buyUpgrade(MODULES.equipment[equipName].upgrade, true, true);
					prestigeLeft = true;
					debug('Upgrading ' + equipName + " - Prestige " + game.equipment[equipName].prestige, 'equipment', '*upload');
				}
			}
		} while (prestigeLeft);
	}

	//Initialise settings for later user
	var alwaysLvl2 = getPageSetting('equip2');
	var alwaysPandemonium = hdStats.currChallenge === 'Pandemonium' && getPageSetting('pandemoniumAE') > 0;
	//always2 / alwaysPandemonium
	if (alwaysLvl2 || alwaysPandemonium) {
		var equipLeft = false;
		do {
			equipLeft = false;
			for (var equip in game.equipment) {
				if (!game.equipment[equip].locked) {
					//Skips trying to buy extra levels if we can't afford them
					if (!canAffordBuilding(equip, false, false, true, false, 1)) continue;
					//Skips levels if we're running Pandemonium and the equip isn't available for purchaes
					if (hdStats.currChallenge === 'Pandemonium' && game.challenges.Pandemonium.isEquipBlocked(equip)) continue;

					if (alwaysLvl2 && game.equipment[equip].level < 2) {
						buyEquipment(equip, true, true, 1);
						debug('Upgrading ' + '1' + ' ' + equip, 'equipment', '*upload3');
					}
					if (alwaysPandemonium) {
						buyEquipment(equip, true, true, 1);
						equipLeft = true;
						debug('Upgrading ' + '1' + ' ' + equip, 'equipment', '*upload3');
					}
				}
			}
		}
		while (equipLeft);
	}

	//Loop through actually getting equips
	var maxCanAfford = 0;
	var keepBuying = false;
	do {
		keepBuying = false;
		bestBuys = mostEfficientEquipment();
		//Set up for both Attack and Health depending on which is cheaper to purchase
		var equipType = (bestBuys.attack.cost < bestBuys.health.cost) ? 'attack' : 'health';
		var equipName = bestBuys[equipType].name;
		var equipCost = bestBuys[equipType].cost;
		var equipPrestige = bestBuys[equipType].prestige;
		var equipCap = bestBuys[equipType].equipCap;
		var resourceUsed = (equipName === 'Shield') ? 'wood' : 'metal';

		for (var i = 0; i < 2; i++) {
			if (equipName !== '' && canAffordBuilding(equipName, false, false, true, false, 1)) {
				//Check any of the overrides
				if (game.equipment[equipName].level < equipCap || equipPrestige || bestBuys[equipType].zoneGo) {
					if (equipCost <= bestBuys[equipType].resourceSpendingPct * game.resources[resourceUsed].owned) {
						if (!game.equipment[equipName].locked) {
							//Purchases prestiges if they are the most efficient thing to go for
							if (equipPrestige) {
								buyUpgrade(MODULES.equipment[equipName].upgrade, true, true);
								debug('Upgrading ' + equipName + " - Prestige " + game.equipment[equipName].prestige, 'equipment', '*upload');
								keepBuying = true;
							}
							else {
								//Find out how many levels we can afford with 0.1% of resources
								//If this value is below 1 we set it to 1 so that we always buy at least 1 level
								maxCanAfford = Math.max(1, getMaxAffordable(equipCost, (game.resources[resourceUsed].owned * 0.001), 1.2, true));
								//Checking to see if the max levels we can afford will take us over our equipcap threshold 
								//If it will then set it to the difference between the equipcap and our current level
								if (maxCanAfford >= (equipCap - game.equipment[equipName].level)) maxCanAfford = equipCap - game.equipment[equipName].level;
								//If the equip cap check didn't say we have 0 levels to buy then buy the max levels we can afford
								if (maxCanAfford > 0) {
									buyEquipment(equipName, true, true, maxCanAfford);
									debug('Upgrading ' + maxCanAfford + ' ' + equipName + (maxCanAfford > 1 && equipName !== 'Boots' && equipName !== 'Pants' && equipName !== 'Shoulderguards' ? 's' : ''), 'equipment', '*upload3');
									keepBuying = true;
								}
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
			resourceUsed = (equipName === 'Shield') ? 'wood' : 'metal';
		}
	} while (keepBuying);
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
	var gammaBurstDmg = getPageSetting('gammaBurstCalc') ? MODULES.heirlooms.gammaBurstPct : 1;
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
	for (var i in MODULES.equipment) {
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
		healthNeeded -= game.equipment[bestArmor][MODULES.equipment[bestArmor].stat + "Calculated"];
		if (typeof bonusLevels[bestArmor] === 'undefined') {
			bonusLevels[bestArmor] = 0;
		}
		if (bonusLevels[bestArmor]++ > MAX_EQUIP_DELTA) {
			return [Infinity, bonusLevels];
		}
	}
	while (attackNeeded > 0) {
		var bestWeapon = mostEfficientEquipment(1, true, true, false, false, bonusLevels, true)[0];
		attackNeeded -= game.equipment[bestWeapon][MODULES.equipment[bestWeapon].stat + "Calculated"];
		if (typeof bonusLevels[bestWeapon] === 'undefined') {
			bonusLevels[bestWeapon] = 0;
		}
		if (bonusLevels[bestWeapon]++ >= MAX_EQUIP_DELTA) {
			return [Infinity, bonusLevels];
		}
	}

	var totalCost = 0;
	for (var equip in bonusLevels) {
		var equipCost = game.equipment[equip].cost[MODULES.equipment[equip].resource];
		totalCost += getTotalMultiCost((equipCost[0]), bonusLevels[equip], equipCost[1], true) * getEquipPriceMult();
	}

	return [totalCost, bonusLevels];
}

function displayMostEfficientEquipment() {

	var highlightSetting = getPageSetting('equipEfficientEquipDisplay');
	if (!highlightSetting) return;
	if (game.options.menu.equipHighlight.enabled > 0) toggleSetting("equipHighlight")
	if (!atSettings.intervals.oneSecond) return;
	var $eqNamePrestige = null;

	if (!highlightSetting) return;

	if (!highlightSetting) {
		for (var item in game.equipment) {
			if (game.upgrades[MODULES.equipment[item].upgrade].locked === 0) {
				$eqNamePrestige = document.getElementById(MODULES.equipment[item].upgrade);
				if (document.getElementsByClassName(item).length === 0) {
					document.getElementById(MODULES.equipment[item].upgrade).classList.add("efficient");
					document.getElementById(MODULES.equipment[item].upgrade).classList.add(item);
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
		var equipType = MODULES.equipment[item].stat;
		var $eqNamePrestige = null;
		if (game.upgrades[MODULES.equipment[item].upgrade].locked === 0) {
			$eqNamePrestige = document.getElementById(MODULES.equipment[item].upgrade);
			if (document.getElementsByClassName(item).length === 0) {
				document.getElementById(MODULES.equipment[item].upgrade).classList.add("efficient");
				document.getElementById(MODULES.equipment[item].upgrade).classList.add(item);
			}
			if (document.getElementById(MODULES.equipment[item].upgrade).classList.contains('efficientYes') && (item !== bestBuys[equipType].name || (item === bestBuys[equipType].name && bestBuys[equipType].prestige !== true)))
				swapClass('efficient', 'efficientNo', $eqNamePrestige)
		}
		if (item === bestBuys[equipType].name && bestBuys[equipType].prestige === true) {
			bestBuys[equipType].name = MODULES.equipment[item].upgrade;
			if (document.getElementById(item).classList.contains('efficientYes'))
				swapClass('efficient', 'efficientNo', document.getElementById(item))
			item = MODULES.equipment[item].upgrade;
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