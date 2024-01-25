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

function getMaxAffordable(baseCost, totalResource, costScaling, isCompounding) {
	if (!isCompounding) {
		return Math.floor((costScaling - 2 * baseCost + Math.sqrt(Math.pow(2 * baseCost - costScaling, 2) + 8 * costScaling * totalResource)) / 2);
	} else {
		return Math.floor(Math.log(1 - ((1 - costScaling) * totalResource) / baseCost) / Math.log(costScaling));
	}
}

function mostEfficientEquipment(resourceSpendingPct, zoneGo = false, ignoreShield = getPageSetting('equipNoShields'), skipForLevels = false, equipHighlight, fakeLevels = {}, ignorePrestiges) {
	if (mapSettings.pandaEquips) return pandemoniumEquipmentCheck(mapSettings.cacheGain);

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

	const canAtlantrimp = game.mapUnlocks.AncientTreasure.canRunOnce;
	const prestigeSetting = getPageSetting('equipPrestige');

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

	let prestigePct = 1;
	let highestPrestige = 0;
	let prestigesAvailable = false;
	if (prestigeSetting === 2 && !canAtlantrimp) prestigePct = getPageSetting('equipPrestigePct') / 100;

	//Checks what our highest prestige level is AND if there are any prestiges available to purchase
	//If this fully runs and returns true it WILL override checking non-prestige equip stats!
	for (let equipName in MODULES.equipment) {
		const equipType = MODULES.equipment[equipName].stat;
		const currentPrestige = game.equipment[equipName].prestige;
		highestPrestige = Math.max(highestPrestige, currentPrestige);

		if (prestigesAvailable || ignorePrestiges || equipName === 'Shield' || buyPrestigeMaybe(equipName).skip) continue;
		if (prestigeSetting === 0 || (prestigeSetting === 1 && mostEfficient[equipType].zoneGo) || (prestigeSetting === 2 && !canAtlantrimp)) continue;

		prestigesAvailable = true;
	}

	//Loops through each piece of equipment to figure out the most efficient one to buy
	for (let equipName in MODULES.equipment) {
		const equipData = game.equipment[equipName];
		if (equipData.locked || (challengeActive('Pandemonium') && game.challenges.Pandemonium.isEquipBlocked(equipName))) continue;
		if (equipName === 'Shield') {
			if (ignoreShield) continue;
			if (game.global.universe === 1 && needGymystic()) continue;
			if (challengeActive('Hypothermia') && game.resources.wood.owned > game.challenges.Hypothermia.bonfirePrice()) continue;
		}

		const equipType = MODULES.equipment[equipName].stat;
		const zoneGo = mostEfficient[equipType].zoneGo;
		resourceSpendingPct = equipType === 'attack' ? resourceSpendingPctAttack : resourceSpendingPctHealth;
		resourceSpendingPct = Math.min(resourceSpendingPct, 1);
		let nextLevelValue = 1;
		let safeRatio = 1;
		let prestige = false;
		//Figuring out if we should force prestige purchases or check non-prestige stats
		const forcePrestige = (prestigeSetting === 1 && zoneGo) || (prestigeSetting === 2 && canAtlantrimp) || prestigeSetting === 3;
		//Identifying the equip cap for this equip type
		let equipCap = !skipForLevels && equipType === 'attack' ? attackCap : !skipForLevels && equipType === 'health' ? healthCap : skipForLevels;

		let nextLevelCost = equipData.cost[MODULES.equipment[equipName].resource][0] * Math.pow(equipData.cost[MODULES.equipment[equipName].resource][1], equipData.level + fakeLevels[equipName]) * equipMult;
		//Setting armor equips to 100% when we need to farm health
		if (mapSettings.shouldHealthFarm && equipType === 'health') resourceSpendingPct = 1;
		//Setting equips to 100% spending during Smithless farm. Weapons always and armor if we are using more than 0 equality levels
		if (mapSettings.mapName === 'Smithless Farm' && (equipType === 'attack' || mapSettings.equality > 0)) {
			equipCap = Infinity;
			resourceSpendingPct = 1;
		}

		const maybeBuyPrestige = buyPrestigeMaybe(equipName, resourceSpendingPct, equipData.level);
		if (prestigesAvailable && forcePrestige && !maybeBuyPrestige.prestigeAvailable) continue;
		if (maybeBuyPrestige.prestigeAvailable && equipCap > 9) equipCap = 9;
		if (!maybeBuyPrestige.purchase && equipData.level >= equipCap) continue;
		//If prestiges available & running certain setting skips (check above for loop) look at non-prestige item stats.
		if (!prestigesAvailable || !forcePrestige) {
			nextLevelValue = equipData[MODULES.equipment[equipName].stat + 'Calculated'];
			safeRatio = nextLevelCost / nextLevelValue;
		}

		//Setting skipPrestiges to true if ignorePrestiges is called OR buyPrestigeMaybe.skip (we don't have enough Science or Gems for the Prestige which SHOULD only happen in the ultra early game)
		let skipPrestiges = ignorePrestiges || maybeBuyPrestige.skip || false;
		//Check for further overrides for if we want to skip looking at prestiges
		if (!skipPrestiges) {
			if ((prestigeSetting === 0 || (prestigeSetting === 1 && !zoneGoCheck(equipZone) && !ignorePrestiges)) && equipData.level < 6) skipPrestiges = true;
			else if (prestigeSetting === 2 && !canAtlantrimp && game.resources[MODULES.equipment[equipName].resource].owned * prestigePct < maybeBuyPrestige.prestigeCost) {
				skipPrestiges = true;
				if (equipData.level >= equipCap) continue;
			} else if (maybeBuyPrestige.purchase && (maybeBuyPrestige.statPerResource < mostEfficient[equipType].statPerResource || !mostEfficient[equipType].name)) {
				//Skips shields in favour of other equips if we can't afford the prestige as otherwise we'll get stuck on wood equips
				if (equipName === 'Shield' && game.resources[MODULES.equipment[equipName].resource].owned < maybeBuyPrestige.prestigeCost) continue;
				safeRatio = maybeBuyPrestige.statPerResource;
				nextLevelCost = maybeBuyPrestige.prestigeCost;
				nextLevelValue = maybeBuyPrestige.newStatValue;
				prestige = true;
			}
			//Skips items if they aren't at the highest prestige level so that we don't unnecessarily spend resources on equips levels that aren't at the highest prestige level we own
			else if (equipData.prestige > highestPrestige && forcePrestige) continue;
		}
		if (safeRatio === 1) continue;
		//Skips shields in favour of other equips if we aren't prestiging the equip as we'll otherwise we'll get stuck on wood equips
		if (equipName === 'Shield' && !prestige && (!canAffordBuilding(equipName, null, null, true, false, 1, resourceSpendingPct * 100) || equipData.level >= equipCap)) continue;

		//Stat per resource SHOULD BE resource per stat (so the inverse what of it is)
		//Check if the current saved equip is the most efficient (should be lowest statPerResource value equip available)
		//We want the item that gives us the most stats per resource spent so check if the current item is better than the saved one
		const isMostEfficient = mostEfficient[equipType].statPerResource > safeRatio || !mostEfficient[equipType].name;

		if (isMostEfficient) {
			mostEfficient[equipType] = {
				name: equipName,
				statPerResource: safeRatio,
				prestige,
				cost: nextLevelCost,
				resourceSpendingPct,
				zoneGo,
				equipCap,
				prestigeAvailable: maybeBuyPrestige.prestigeAvailable
			};
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

	if (scienceCost * Math.pow(scienceMultiplier, equipment.prestige - 1) > game.resources.science.owned) {
		return prestigeInfo;
	}
	if (gemsCost * Math.pow(gemsMultiplier, equipment.prestige - 1) > game.resources.gems.owned) {
		return prestigeInfo;
	}

	const resourceUsed = equipName === 'Shield' ? 'wood' : 'metal';
	const equipStat = equipment.attack !== undefined ? 'attack' : 'health';
	resourceSpendingPct = resourceSpendingPct || 1;

	const prestigeCost = getNextPrestigeCost(prestigeUpgradeName) * getEquipPriceMult();
	const newLevel = Math.max(1, Math.min(maxLevel, 1 + Math.max(0, Math.floor(getMaxAffordable(prestigeCost * 1.2, (game.resources[resourceUsed].owned - prestigeCost) * resourceSpendingPct, 1.2, true)))));
	//Figure out how many stats the new prestige + levels we can afford in it will provide
	const oneLevelStat = Math.round(equipment[equipStat] * Math.pow(1.19, equipment.prestige * game.global.prestige[equipStat] + 1));
	const newStatValue = newLevel * oneLevelStat;
	//Identify the stat total we currently get from the equip
	const currentStatValue = equipment.level * equipment[equipStat + 'Calculated'];
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
		if (mapSettings.mapName === 'Wither Farm' || mapSettings.mapName === 'Smithless Farm') return zoneDetails;
	}
	if (farmType === 'health') {
		if (whichHitsSurvived() < getPageSetting('equipCutOffHS') || mapSettings.shouldHealthFarm) return zoneDetails;
		//Since having to use equality will lower our damage then we want more health to reduce equality usage
		if ((mapSettings.mapName === 'Smithless Farm' || mapSettings.mapName === 'Wither Farm') && mapSettings.equality > 0) return zoneDetails;
		//Since equality has a big impact on u2 HD Ratio then we want more health to reduce equality required.
		if (game.global.universe === 2 && hdRatio > getPageSetting('equipCutOffHD') && game.portal.Equality.radLevel > 0) return zoneDetails;
	}

	const settingZone = setting;
	const world = game.global.world.toString();

	let p = settingZone.findIndex((zone) => {
		zone = zone.toString();
		if (zone.indexOf('.') >= 0) {
			let [start, end] = zone.split('.');
			return game.global.world >= start && game.global.world <= end;
		}
		return world === zone;
	});

	if (p !== -1) {
		return { ...zoneDetails, zone: settingZone[p] };
	}

	return { ...zoneDetails, active: false, zone: 999 };
}

function autoEquip() {
	//Disabling autoequip if the autoequip setting is disabled.
	if (!getPageSetting('equipOn')) return;
	//If running a wood or metal quest then disable autoequip
	if ([2, 3].indexOf(_getCurrentQuest()) >= 0) return;
	//If smithy farming then disable autoequip
	if (mapSettings.mapName === 'Smithy Farm' || settingChangedTimeout) return;
	//Trimple/Atlantrimp overrides for don't run when farming and the user intends to run them or when inside the map itself.
	if (game.mapUnlocks.AncientTreasure.canRunOnce) {
		if (mapSettings.ancientTreasure) return;
		else if (MODULES.mapFunctions.runUniqueMap === getAncientTreasureName()) return;
		else if (game.global.mapsActive && getCurrentMapObject().name === getAncientTreasureName()) return;
	}

	if (game.upgrades.Miners.allowed && !game.upgrades.Miners.done) return;

	//Loops through equips and buys prestiges if we can afford them and equipPrestige is set to 'AE: Always Prestige' (3).
	//If we can then instantly purchase the prestige regardless of efficiency.
	if (getPageSetting('equipPrestige') === 3) {
		let prestigeLeft = false;
		let prestigeInfo;
		do {
			prestigeLeft = false;
			for (let equipName in game.equipment) {
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
					if (!canAffordBuilding(equip, false, false, true, false, 1)) continue;
					if (trimpStats.currChallenge === 'Pandemonium' && game.challenges.Pandemonium.isEquipBlocked(equip)) continue;

					if (alwaysLvl2 && game.equipment[equip].level < 2) {
						buyEquipment(equip, true, true, 1);
						debug(`Upgrading 1 ${equip}`, `equipment`, `*upload3`);
					}
					if (alwaysPandemonium) {
						buyEquipment(equip, true, true, 1);
						equipLeft = true;
						debug(`Upgrading 1 ${equip}`, `equipment`, `*upload3`);
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
	const bestBuys = mostEfficientEquipment();
	const equipTypes = ['attack', 'health'].sort((a, b) => bestBuys[a].cost - bestBuys[b].cost);
	let keepBuying = false;

	for (let equipType of equipTypes) {
		let equip = bestBuys[equipType];
		let resourceUsed = equip.name === 'Shield' ? 'wood' : 'metal';
		let equipData = game.equipment[equip.name];

		if (!equip.name || equipData.locked || !(equip.prestige || canAffordBuilding(equip.name, false, false, true, false, 1))) continue;
		if (equipData.level >= equip.equipCap && !equip.prestige && !equip.zoneGo) continue;
		if (equip.cost > equip.resourceSpendingPct * game.resources[resourceUsed].owned) continue;

		if (equip.prestige) {
			buyUpgrade(MODULES.equipment[equip.name].upgrade, true, true);
			debug(`Upgrading ${equip.name} - Prestige ${equipData.prestige}`, `equipment`, '*upload');
			keepBuying = true;
		} else {
			//Find out how many levels we can afford with 0.1% of resources.
			let maxCanAfford = Math.max(1, getMaxAffordable(equip.cost, game.resources[resourceUsed].owned * 0.001, 1.2, true));
			maxCanAfford = Math.min(maxCanAfford, equip.equipCap - equipData.level);
			if (maxCanAfford > 0) {
				buyEquipment(equip.name, true, true, maxCanAfford);
				debug(`Upgrading ${maxCanAfford} ${equip.name}${maxCanAfford > 1 && !equip.name.endsWith('s') ? 's' : ''}`, `equipment`, `*upload3`);
				keepBuying = true;
			}
		}
	}

	hdStats.hdRatio = calcHDRatio(game.global.world, 'world');
	return keepBuying;
}

function displayMostEfficientEquipment() {
	if (!getPageSetting('equipEfficientEquipDisplay')) return;
	if (game.options.menu.equipHighlight.enabled > 0) toggleSetting('equipHighlight');
	if (!atSettings.intervals.oneSecond) return;

	const bestBuys = mostEfficientEquipment(1, false, true, false, true);

	for (let item in game.equipment) {
		if (game.equipment[item].locked || item === 'Shield') continue;

		const prestigeName = MODULES.equipment[item].upgrade;
		const equipType = MODULES.equipment[item].stat;
		const prestigeElement = document.getElementById(prestigeName);
		const itemElement = document.getElementById(item);
		//Looking at the prestiges for each item to see if it's available and if so then add the efficient class to it
		if (game.upgrades[prestigeName].locked === 0 && prestigeElement) {
			//If the prestige doesn't have the efficient class then add it
			if (!prestigeElement.classList.contains('efficient')) prestigeElement.classList.add('efficient');
			//Remove the swap the efficient class to efficientNo if the prestige isn't the most efficient thing to purchase
			if (prestigeElement.classList.contains('efficientYes') && (item !== bestBuys[equipType].name || (item === bestBuys[equipType].name && !bestBuys[equipType].prestige))) swapClass('efficient', 'efficientNo', prestigeElement);
		}

		//If we are looking at the most efficient item and it's not a prestige then add the efficientYes class to it
		//If the equip already has the efficientYes class swap it to efficientNo
		if (item === bestBuys[equipType].name && bestBuys[equipType].prestige && itemElement) {
			if (itemElement.classList.contains('efficientYes')) swapClass('efficient', 'efficientNo', itemElement);
			bestBuys[equipType].name = prestigeName;
			item = prestigeName;
		}

		if (itemElement) {
			swapClass('efficient', item === bestBuys[equipType].name ? 'efficientYes' : 'efficientNo', itemElement);
		}
	}
}
