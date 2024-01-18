MODULES.equipment = {
	Dagger: {
		upgrade: 'Dagadder',
		stat: 'attack',
		resource: 'metal'
	},
	Mace: {
		upgrade: 'Megamace',
		stat: 'attack',
		resource: 'metal'
	},
	Polearm: {
		upgrade: 'Polierarm',
		stat: 'attack',
		resource: 'metal'
	},
	Battleaxe: {
		upgrade: 'Axeidic',
		stat: 'attack',
		resource: 'metal'
	},
	Greatsword: {
		upgrade: 'Greatersword',
		stat: 'attack',
		resource: 'metal'
	},
	Boots: {
		upgrade: 'Bootboost',
		stat: 'health',
		resource: 'metal'
	},
	Helmet: {
		upgrade: 'Hellishmet',
		stat: 'health',
		resource: 'metal'
	},
	Pants: {
		upgrade: 'Pantastic',
		stat: 'health',
		resource: 'metal'
	},
	Shoulderguards: {
		upgrade: 'Smoldershoulder',
		stat: 'health',
		resource: 'metal'
	},
	Breastplate: {
		upgrade: 'Bestplate',
		stat: 'health',
		resource: 'metal'
	},
	Arbalest: {
		upgrade: 'Harmbalest',
		stat: 'attack',
		resource: 'metal'
	},
	Gambeson: {
		upgrade: 'GambesOP',
		stat: 'health',
		resource: 'metal'
	},
	Shield: {
		upgrade: 'Supershield',
		stat: 'health',
		resource: 'wood'
	}
};

//Working out cheapest equips & prestiges
function cheapestEquipmentCost() {
	//Initialising Variables
	var equipmentName = null;
	var prestigeName = null;
	var nextLevelEquipmentCost = null;
	var nextEquipmentCost = null;
	var nextLevelPrestigeCost = null;
	var nextPrestigeCost = null;
	var prestigeUpgradeName;
	var prestigeUpgrade;
	var runningPandemonium = challengeActive('Pandemonium');

	//Looping through each piece of equipment to find the one that's cheapest
	for (var equipName in game.equipment) {
		//Blocks unavailable ones if we're running Pandemonium.
		if (runningPandemonium && (game.challenges.Pandemonium.isEquipBlocked(equipName) || MODULES.equipment[equipName].resource === 'wood')) continue;
		if (game.equipment[equipName].locked) continue;

		//Checking cost of next equipment level.
		nextLevelEquipmentCost = game.equipment[equipName].cost[MODULES.equipment[equipName].resource][0] * Math.pow(game.equipment[equipName].cost[MODULES.equipment[equipName].resource][1], game.equipment[equipName].level) * getEquipPriceMult();
		//Sets nextEquipmentCost to the price of an equip if it costs less than the current value of nextEquipCost
		if (nextLevelEquipmentCost < nextEquipmentCost || nextEquipmentCost === null) {
			equipmentName = equipName;
			nextEquipmentCost = nextLevelEquipmentCost;
		}

		//Checking cost of prestiges if any are available to purchase
		prestigeUpgradeName = MODULES.equipment[equipName].upgrade;
		prestigeUpgrade = game.upgrades[prestigeUpgradeName];
		//If the prestige is locked or we've already purchased all the prestiges for this equip then skip to the next equip
		if (prestigeUpgrade.locked || prestigeUpgrade.allowed === prestigeUpgrade.done) continue;

		//Checking cost of next prestige level.
		nextLevelPrestigeCost = getNextPrestigeCost(prestigeUpgradeName) * getEquipPriceMult();
		//Sets nextPrestigeCost to the price of an equip if it costs less than the current value of nextEquipCost
		if (nextLevelPrestigeCost < nextPrestigeCost || nextPrestigeCost === null) {
			prestigeName = prestigeUpgradeName;
			nextPrestigeCost = nextLevelPrestigeCost;
		}
	}
	if (equipName === null) return null;
	return [equipmentName, nextEquipmentCost, prestigeName, nextPrestigeCost];
}

function getMaxAffordable(baseCost, totalResource, costScaling, isCompounding) {
	if (!isCompounding) {
		return Math.floor((costScaling - 2 * baseCost + Math.sqrt(Math.pow(2 * baseCost - costScaling, 2) + 8 * costScaling * totalResource)) / 2);
	} else {
		return Math.floor(Math.log(1 - ((1 - costScaling) * totalResource) / baseCost) / Math.log(costScaling));
	}
}

function mostEfficientEquipment(resourceSpendingPct, zoneGo = false, ignoreShield = getPageSetting('equipNoShields'), skipForLevels = false, equipHighlight, fakeLevels = {}, ignorePrestiges) {
	Object.keys(MODULES.equipment).forEach((equipName) => {
		if (typeof fakeLevels[equipName] === 'undefined') {
			fakeLevels[equipName] = 0;
		}
	});

	const currentMap = getCurrentMapObject() || { location: 'world' };

	const attackCap = getPageSetting('equipCapAttack');
	const healthCap = getPageSetting('equipCapHealth');
	const equipZone = getPageSetting('equipZone');
	const equipPercent = getPageSetting('equipPercent');
	const equipMult = getEquipPriceMult();

	const getZoneGo = (type) => zoneGo || zoneGoCheck(equipZone, type, currentMap).active;
	const zoneGoHealth = getZoneGo('health');
	const zoneGoAttack = getZoneGo('attack');

	const calculateResourceSpendingPct = (zoneGo) => resourceSpendingPct || (zoneGo ? 1 : equipPercent < 0 ? 1 : equipPercent / 100);
	const resourceSpendingPctHealth = calculateResourceSpendingPct(zoneGoHealth);
	const resourceSpendingPctAttack = calculateResourceSpendingPct(zoneGoAttack);

	if (challengeActive('Scientist') || challengeActive('Frugal')) skipForLevels = Infinity;

	const mostEfficient = {
		attack: {
			name: '',
			statPerResource: Infinity,
			prestige: false,
			cost: 0,
			resourceSpendingPct: 0,
			zoneGo: zoneGoAttack,
			equipCap: 0
		},
		health: {
			name: '',
			statPerResource: Infinity,
			prestige: false,
			cost: 0,
			resourceSpendingPct: 0,
			zoneGo: zoneGoHealth,
			equipCap: 0
		}
	};

	let highestPrestige = 0;
	let prestigesAvailable = false;

	const canAtlantrimp = game.mapUnlocks.AncientTreasure.canRunOnce;
	const prestigeSetting = getPageSetting('equipPrestige');
	let prestigePct = 1;
	if (prestigeSetting === 2 && !canAtlantrimp) prestigePct = getPageSetting('equipPrestigePct') / 100;

	//Checks what our highest prestige level is AND if there are any prestiges available to purchase
	//If this fully runs and returns true it WILL override checking non-prestige equip stats!
	for (let equipName in MODULES.equipment) {
		let equipType = MODULES.equipment[equipName].stat;
		if (game.equipment[equipName].prestige > highestPrestige) highestPrestige = game.equipment[equipName].prestige;
		if (prestigesAvailable || ignorePrestiges || equipName === 'Shield' || buyPrestigeMaybe(equipName).skip) continue;
		if (prestigeSetting === 0) continue;
		if (prestigeSetting === 1 && mostEfficient[equipType].zoneGo) continue;
		if (prestigeSetting === 2 && !canAtlantrimp) continue;
		prestigesAvailable = true;
	}

	//Loops through each piece of equipment to figure out the most efficient one to buy
	for (let equipName in MODULES.equipment) {
		if (game.equipment[equipName].locked || (challengeActive('Pandemonium') && game.challenges.Pandemonium.isEquipBlocked(equipName))) continue;
		if (equipName === 'Shield') {
			if (ignoreShield) continue;
			if (game.global.universe === 1 && needGymystic()) continue;
			if (challengeActive('Hypothermia') && game.resources.wood.owned > game.challenges.Hypothermia.bonfirePrice()) continue;
		}

		const equipType = MODULES.equipment[equipName].stat;
		const zoneGo = mostEfficient[equipType].zoneGo;
		resourceSpendingPct = equipType === 'attack' ? resourceSpendingPctAttack : resourceSpendingPctHealth;
		if (resourceSpendingPct > 1) resourceSpendingPct = 1;
		let nextLevelValue = 1;
		let safeRatio = 1;
		let prestige = false;
		//Figuring out if we should force prestige purchases or check non-prestige stats
		const forcePrestige = (prestigeSetting === 1 && zoneGo) || (prestigeSetting === 2 && canAtlantrimp) || prestigeSetting === 3;
		//Identifying the equip cap for this equip type
		let equipCap = !skipForLevels && equipType === 'attack' ? attackCap : !skipForLevels && equipType === 'health' ? healthCap : skipForLevels;

		let nextLevelCost = game.equipment[equipName].cost[MODULES.equipment[equipName].resource][0] * Math.pow(game.equipment[equipName].cost[MODULES.equipment[equipName].resource][1], game.equipment[equipName].level + fakeLevels[equipName]) * equipMult;
		//Setting armor equips to 100% when we need to farm health
		if (mapSettings.shouldHealthFarm && equipType === 'health') resourceSpendingPct = 1;
		//Setting equips to 100% spending during Smithless farm. Weapons always and armor if we are using more than 0 equality levels
		if (mapSettings.mapName === 'Smithless Farm' && (equipType === 'attack' || mapSettings.equality > 0)) {
			equipCap = Infinity;
			resourceSpendingPct = 1;
		}
		//Load buyPrestigeMaybe into variable so it's not called 500 times
		const maybeBuyPrestige = buyPrestigeMaybe(equipName, resourceSpendingPct, game.equipment[equipName].level);
		//Skips if we have the equip capped and we aren't potentially farming for the prestige
		if (!maybeBuyPrestige.purchase && game.equipment[equipName].level >= equipCap) continue;
		//Skips through equips if they cost more than your equip purchasing percent setting value.
		//Potentially unnecessary with all the other checks for if we can afford a prestige -- Removed for now. Might need to come up with a different implementation if AE breaks due to this.
		//if (!equipHighlight && !canAffordBuilding(equipName, null, null, true, false, 1, resourceSpendingPct * 100) && !maybeBuyPrestige.purchase) continue;
		//Skips equips if we have prestiges available & no prestiges to get for this
		if (prestigesAvailable && forcePrestige && !maybeBuyPrestige.prestigeAvailable) continue;
		if (maybeBuyPrestige.prestigeAvailable && equipCap > 9) equipCap = 9;
		//If prestiges available & running certain setting skips (check above for loop) look at non-prestige item stats.
		if (!prestigesAvailable || !forcePrestige) {
			nextLevelValue = game.equipment[equipName][MODULES.equipment[equipName].stat + 'Calculated'];
			safeRatio = nextLevelCost / nextLevelValue;
		}

		//Early game bandaid fix for lack of gems, science etc.
		//Setting skipPrestiges to true if ignorePrestiges is called OR buyPrestigeMaybe.skip (we don't have enough Science or Gems for the Prestige which SHOULD only happen in the ultra early game)
		let skipPrestiges = ignorePrestiges || maybeBuyPrestige.skip || false;
		//Check for further overrides for if we want to skip looking at prestiges
		if (!skipPrestiges) {
			if ((prestigeSetting === 0 || (prestigeSetting === 1 && !zoneGoCheck(equipZone) && !ignorePrestiges)) && game.equipment[equipName].level < 6) skipPrestiges = true;
			if (prestigeSetting === 2 && !canAtlantrimp && game.resources[MODULES.equipment[equipName].resource].owned * prestigePct < maybeBuyPrestige.prestigeCost) {
				skipPrestiges = true;
				if (game.equipment[equipName].level >= equipCap) continue;
			}
		}

		if (!skipPrestiges) {
			if (maybeBuyPrestige.purchase && (maybeBuyPrestige.statPerResource < mostEfficient[equipType].statPerResource || !mostEfficient[equipType].name)) {
				//Skips shields in favour of other equips if we can't afford the prestige as otherwise we'll get stuck on wood equips
				if (equipName === 'Shield' && game.resources[MODULES.equipment[equipName].resource].owned < maybeBuyPrestige.prestigeCost) continue;
				safeRatio = maybeBuyPrestige.statPerResource;
				nextLevelCost = maybeBuyPrestige.prestigeCost;
				nextLevelValue = maybeBuyPrestige.newStatValue;
				prestige = true;
			}
			//Skips items if they aren't at the highest prestige level
			//This is so that we don't unnecessarily spend resources on equips levels that aren't at the highest prestige level we own
			else if (game.equipment[equipName].prestige > highestPrestige && forcePrestige) continue;
		}
		//Skips shields in favour of other equips if we aren't prestiging the equip as we'll otherwise we'll get stuck on wood equips
		if (equipName === 'Shield' && !prestige && (!canAffordBuilding(equipName, null, null, true, false, 1, resourceSpendingPct * 100) || game.equipment[equipName].level >= equipCap)) continue;

		if (safeRatio === 1) continue;
		//Stat per resource SHOULD BE resource per stat (so the inverse of it is)
		//Check if the current saved equip is the most efficient (should be lowest statPerResource value equip available)
		//We want the item that gives us the most stats per resource spent so check if the current item is better than the saved one
		if (mostEfficient[equipType].statPerResource > safeRatio || !mostEfficient[equipType].name) {
			mostEfficient[equipType].name = equipName;
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

function buyPrestigeMaybe(equipName, resourceSpendingPct, maxLevel = Infinity) {
	const prestigeInfo = {
		purchase: false,
		prestigeAvailable: false,
		oneLevelStat: 0,
		newStatValue: 0,
		prestigeCost: 0,
		newLevel: 0,
		statPerResource: 0,
		currentStatValue: 0,
		skip: true
	};

	if (challengeActive('Pandemonium') && game.challenges.Pandemonium.isEquipBlocked(equipName)) return prestigeInfo;
	if (challengeActive('Scientist') || challengeActive('Frugal')) return prestigeInfo;
	if (getPageSetting('equipNoShields') && equipName === 'Shield') return prestigeInfo;

	//Check to see if the equipName is valid
	if (!Object.getOwnPropertyNames(MODULES.equipment).includes(equipName)) return prestigeInfo;

	const prestigeUpgradeName = MODULES.equipment[equipName].upgrade;
	const prestigeUpgrade = game.upgrades[prestigeUpgradeName];

	if (prestigeUpgrade.locked || prestigeUpgrade.allowed === prestigeUpgrade.done) return prestigeInfo;
	prestigeInfo.prestigeAvailable = true;

	const equipment = game.equipment[equipName];

	const {
		science: [scienceCost, scienceMultiplier],
		gems: [gemsCost, gemsMultiplier]
	} = prestigeUpgrade.cost.resources;

	//Check to see if we have enough science to purchase the prestige
	if (scienceCost * Math.pow(scienceMultiplier, equipment.prestige - 1) > game.resources.science.owned) {
		return prestigeInfo;
	}
	//Check to see if we have enough gems to purchase the prestige
	if (gemsCost * Math.pow(gemsMultiplier, equipment.prestige - 1) > game.resources.gems.owned) {
		return prestigeInfo;
	}

	const resourceUsed = equipName === 'Shield' ? 'wood' : 'metal';
	const equipStat = equipment.attack !== undefined ? 'attack' : 'health';
	if (!resourceSpendingPct) resourceSpendingPct = 1;

	const prestigeCost = getNextPrestigeCost(prestigeUpgradeName) * getEquipPriceMult();
	let newLevel = 1 + Math.max(0, Math.floor(getMaxAffordable(prestigeCost * 1.2, (game.resources[resourceUsed].owned - prestigeCost) * resourceSpendingPct, 1.2, true)));
	newLevel = Math.max(1, Math.min(maxLevel, newLevel));
	//Figure out how many stats the new prestige + levels we can afford in it will provide
	const oneLevelStat = Math.round(equipment[equipStat] * Math.pow(1.19, equipment.prestige * game.global.prestige[equipStat] + 1));
	const newStatValue = newLevel * oneLevelStat;
	//Identify the stat total we currently get from the equip
	const currentStatValue = equipment.level * equipment[equipStat + 'Calculated'];
	//Work out the total cost of the prestige + levels we can afford in it
	//var prestigeCostTotal = prestigeCost + (prestigeCost * Math.pow(1.2, (newLevel - 1)));
	//Figure out how many stats we get per resource
	const statPerResource = prestigeCost / oneLevelStat;

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
function zoneGoCheck(setting, farmType, mapType = { location: 'world' }) {
	const zoneDetails = {
		active: true,
		zone: game.global.world
	};

	let hdRatio = hdStats.hdRatio;
	if (mapType.location === 'Void' || (mapSettings.voidHitsSurvived && trimpStats.autoMaps)) hdRatio = hdStats.hdRatioVoid;
	else if (mapType.location === 'Bionic' || (mapSettings.mapName === 'Bionic Raiding' && trimpStats.autoMaps)) hdRatio = hdStats.hdRatioMap;

	//Equipment related section for zone overrides
	if (farmType === 'attack') {
		//Farming for damage means we should prio attack equips
		if (hdRatio > getPageSetting('equipCutOffHD')) return zoneDetails;
		//Since we're farming for more damage to kill we want to spend 100% of our resources on attack equips
		if (mapSettings.mapName === 'Wither Farm') return zoneDetails;
		if (mapSettings.mapName === 'Smithless Farm') return zoneDetails;
	}
	if (farmType === 'health') {
		if (whichHitsSurvived() < getPageSetting('equipCutOffHS')) return zoneDetails;
		//Farming for health means we should prio health equips
		if (mapSettings.shouldHealthFarm) return zoneDetails;
		//Since having to use equality will lower our damage then we want more health to reduce equality usage
		if (mapSettings.mapName === 'Wither Farm' && mapSettings.equality > 0) return zoneDetails;
		if (mapSettings.mapName === 'Smithless Farm' && mapSettings.equality > 0) return zoneDetails;
		//Since equality has a big impact on u2 HD Ratio then we want more health to reduce equality required.
		if (game.global.universe === 2 && hdRatio > getPageSetting('equipCutOffHD') && game.portal.Equality.radLevel > 0) return zoneDetails;
	}

	var settingZone = setting;
	var world = game.global.world.toString();

	var p = -1;
	for (var i = 0; i < settingZone.length; i++) {
		var zone = settingZone[i].toString();
		//Check to see if we are in the zone range that the user set
		if (zone.indexOf('.') >= 0 && game.global.world >= zone.split('.')[0] && game.global.world <= zone.split('.')[1]) {
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
	if ([2, 3].indexOf(_getCurrentQuest()) >= 0) return;
	//If smithy farming then disable autoequip
	if (mapSettings.mapName === 'Smithy Farm') return;
	//If we have just changed a setting that procs settingChangedTimeout then delay autoequip until the timeout has finished
	if (settingChangedTimeout) return;
	//Trimple/Atlantrimp overrides for don't run when farming and the user intends to run them or when inside the map itself.
	if (game.mapUnlocks.AncientTreasure.canRunOnce) {
		if (mapSettings.ancientTreasure) return;
		else if (MODULES.mapFunctions.runUniqueMap === getAncientTreasureName()) return;
		else if (game.global.mapsActive && getCurrentMapObject().name === getAncientTreasureName()) return;
	}
	//Don't run before miners have been unlocked. This is to prevent a lengthy delay before miners are purchased when it buys several kinda unnecessary equips.
	if (game.upgrades.Miners.allowed && !game.upgrades.Miners.done) return;

	//Loops through equips and buys prestiges if we can afford them and equipPrestige is set to 'AE: Always Prestige' (3).
	//If we can then instantly purchase the prestige regardless of efficiency.
	if (getPageSetting('equipPrestige') === 3) {
		let prestigeLeft = false;
		let prestigeInfo;
		do {
			prestigeLeft = false;
			for (var equipName in game.equipment) {
				prestigeInfo = buyPrestigeMaybe(equipName);
				if (!game.equipment[equipName].locked && !prestigeInfo.skip) {
					if (game.resources[prestigeInfo.resource].owned < prestigeInfo.prestigeCost) continue;
					buyUpgrade(MODULES.equipment[equipName].upgrade, true, true);
					prestigeLeft = true;
					debug(`Upgrading ${equipName} - Prestige ${game.equipment[equipName].prestige}`, `equipment`, '*upload');
				}
			}
		} while (prestigeLeft);
	}

	//Initialise settings for later user
	const alwaysLvl2 = getPageSetting('equip2');
	const alwaysPandemonium = trimpStats.currChallenge === 'Pandemonium' && !mapSettings.pandaEquips && getPageSetting('pandemoniumAE') > 0;
	//always2 / alwaysPandemonium
	if (alwaysLvl2 || alwaysPandemonium) {
		let equipLeft = false;
		do {
			equipLeft = false;
			for (let equip in game.equipment) {
				if (!game.equipment[equip].locked) {
					//Skips trying to buy extra levels if we can't afford them
					if (!canAffordBuilding(equip, false, false, true, false, 1)) continue;
					//Skips levels if we're running Pandemonium and the equip isn't available for purchaes
					if (trimpStats.currChallenge === 'Pandemonium' && game.challenges.Pandemonium.isEquipBlocked(equip)) continue;

					if (alwaysLvl2 && game.equipment[equip].level < 2) {
						buyEquipment(equip, true, true, 1);
						debug(`Upgrading 1 ${equip}`, `equipment`, `*upload3`);
					}
					if (alwaysPandemonium) {
						buyEquipment(equip, true, true, 1);
						equipLeft = true;
						debug('Upgrading ' + '1' + ' ' + equip, `equipment`, `*upload3`);
					}
				}
			}
		} while (equipLeft);
	}

	let keepBuying = false;

	//Purchasing equipment upgrades/prestiges
	//If inside a do while loop in TW it will lag out the game at the start of a portal so best having it outside of that kind of loop
	if (usingRealTimeOffline || atSettings.loops.atTimeLapseFastLoop || checkIfLiquidZone()) buyEquips();
	else {
		do keepBuying = buyEquips();
		while (keepBuying);
	}
}

function buyEquips() {
	let maxCanAfford = 0;
	let keepBuying = false;
	let bestBuys;
	if (mapSettings.pandaEquips) bestBuys = pandemoniumEquipmentCheck(mapSettings.cacheGain);
	else bestBuys = mostEfficientEquipment();
	//Set up for both Attack and Health depending on which is cheaper to purchase
	let equipType = bestBuys.attack.cost < bestBuys.health.cost ? 'attack' : 'health';
	let equipName = bestBuys[equipType].name;
	let equipCost = bestBuys[equipType].cost;
	let equipPrestige = bestBuys[equipType].prestige;
	let equipCap = bestBuys[equipType].equipCap;
	let resourceUsed = equipName === 'Shield' ? 'wood' : 'metal';

	for (var i = 0; i < 2; i++) {
		if (equipName && (equipPrestige || canAffordBuilding(equipName, false, false, true, false, 1)) && !game.equipment[equipName].locked) {
			//Check any of the overrides
			if (game.equipment[equipName].level < equipCap || equipPrestige || bestBuys[equipType].zoneGo) {
				if (equipCost <= bestBuys[equipType].resourceSpendingPct * game.resources[resourceUsed].owned) {
					//Purchases prestiges if they are the most efficient thing to go for
					if (equipPrestige) {
						buyUpgrade(MODULES.equipment[equipName].upgrade, true, true);
						debug(`Upgrading ${equipName} - Prestige ${game.equipment[equipName].prestige}`, `equipment`, '*upload');
						keepBuying = true;
					}
					//Otherwise purchase equip levels
					else {
						//Find out how many levels we can afford with 0.1% of resources
						//If this value is below 1 we set it to 1 so that we always buy at least 1 level
						maxCanAfford = Math.max(1, getMaxAffordable(equipCost, game.resources[resourceUsed].owned * 0.001, 1.2, true));
						//Checking to see if the max levels we can afford will take us over our equipcap threshold
						//If it will then set it to the difference between the equipcap and our current level
						if (maxCanAfford >= equipCap - game.equipment[equipName].level) maxCanAfford = equipCap - game.equipment[equipName].level;
						//If the equip cap check didn't say we have 0 levels to buy then buy the max levels we can afford
						if (maxCanAfford > 0) {
							buyEquipment(equipName, true, true, maxCanAfford);
							debug(`Upgrading ${maxCanAfford} ${equipName}${maxCanAfford > 1 && !equipName.endsWith('s') ? 's' : ''}`, `equipment`, `*upload3`);
							keepBuying = true;
						}
					}
					hdStats.hdRatio = calcHDRatio(game.global.world, 'world');
				}
			}
		}

		//Iterating to second set of equips. Will go through the opposite equipType from the first loop.
		equipType = equipType !== 'attack' ? 'attack' : 'health';
		equipName = bestBuys[equipType].name;
		equipCost = bestBuys[equipType].cost;
		equipPrestige = bestBuys[equipType].prestige;
		equipCap = bestBuys[equipType].equipCap;
		resourceUsed = equipName === 'Shield' ? 'wood' : 'metal';
	}
	if (keepBuying) return true;
}

function displayMostEfficientEquipment() {
	if (!getPageSetting('equipEfficientEquipDisplay')) return;
	if (game.options.menu.equipHighlight.enabled > 0) toggleSetting('equipHighlight');
	if (!atSettings.intervals.oneSecond) return;

	var bestBuys = mostEfficientEquipment(1, false, true, false, true);

	for (var item in game.equipment) {
		if (game.equipment[item].locked) continue;
		if (item === 'Shield') continue;
		var prestigeName = MODULES.equipment[item].upgrade;
		var equipType = MODULES.equipment[item].stat;
		//Looking at the prestiges for each item to see if it's available and if so then add the efficient class to it
		if (game.upgrades[prestigeName].locked === 0) {
			//If the prestige doesn't have the efficient class then add it
			if (!document.getElementById(prestigeName).classList.value.includes('efficient')) document.getElementById(prestigeName).classList.add('efficient');
			//Remove the swap the efficient class to efficientNo if the prestige isn't the most efficient thing to purchase
			if (document.getElementById(prestigeName).classList.contains('efficientYes') && (item !== bestBuys[equipType].name || (item === bestBuys[equipType].name && !bestBuys[equipType].prestige))) swapClass('efficient', 'efficientNo', document.getElementById(prestigeName));
		}

		//If we are looking at the most efficient item and it's not a prestige then add the efficientYes class to it
		//If the equip already has the efficientYes class swap it to efficientNo
		if (item === bestBuys[equipType].name && bestBuys[equipType].prestige) {
			if (document.getElementById(item).classList.contains('efficientYes')) swapClass('efficient', 'efficientNo', document.getElementById(item));
			bestBuys[equipType].name = prestigeName;
			item = prestigeName;
		}

		var $eqName = document.getElementById(item);
		if (!$eqName) continue;
		if (item === bestBuys[equipType].name) swapClass('efficient', 'efficientYes', $eqName);
		else {
			swapClass('efficient', 'efficientNo', $eqName);
		}
	}
}
