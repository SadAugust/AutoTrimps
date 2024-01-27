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

function mostEfficientEquipment(resourceSpendingPct, zoneGo = false, ignoreShield = getPageSetting('equipNoShields')) {
	if (mapSettings.pandaEquips) return pandemoniumEquipmentCheck(mapSettings.cacheGain);

	const currentMap = getCurrentMapObject() || { location: 'world' };
	const equipZone = getPageSetting('equipZone');
	const equipPercent = getPageSetting('equipPercent');
	const equipMult = getEquipPriceMult();

	const getZoneGo = (type) => zoneGo || zoneGoCheck(equipZone, type, currentMap).active;
	const zoneGoHealth = getZoneGo('health');
	const zoneGoAttack = getZoneGo('attack');

	const calculateResourceSpendingPct = (zoneGo, type) => {
		if (zoneGo || (mapSettings.shouldHealthFarm && type === 'health')) return 1;
		if (mapSettings.mapName === 'Smithless Farm' && (type === 'attack' || mapSettings.equality > 0)) return 1;
		return resourceSpendingPct || (equipPercent <= 0 ? 1 : Math.min(1, equipPercent / 100));
	};

	const calculateEquipCap = (type) => {
		if (challengeActive('Scientist') || challengeActive('Frugal')) return Infinity;
		if (mapSettings.mapName === 'Smithless Farm' && (type === 'attack' || mapSettings.equality > 0)) return Infinity;
		return type === 'attack' ? getPageSetting('equipCapAttack') : getPageSetting('equipCapHealth');
	};

	const canAtlantrimp = game.mapUnlocks.AncientTreasure.canRunOnce;
	const prestigeSetting = getPageSetting('equipPrestige');
	const prestigePct = prestigeSetting === 2 && !canAtlantrimp ? getPageSetting('equipPrestigePct') / 100 : 1;
	const [highestPrestige, prestigesAvailable] = _getHighestPrestige(prestigeSetting, canAtlantrimp);

	const mostEfficient = {
		attack: {
			name: '',
			statPerResource: Infinity,
			prestige: false,
			cost: 0,
			resourceSpendingPct: calculateResourceSpendingPct(zoneGoAttack, (type = 'attack')),
			zoneGo: zoneGoAttack,
			equipCap: calculateEquipCap('attack')
		},
		health: {
			name: '',
			statPerResource: Infinity,
			prestige: false,
			cost: 0,
			resourceSpendingPct: calculateResourceSpendingPct(zoneGoHealth, (type = 'health')),
			zoneGo: zoneGoHealth,
			equipCap: calculateEquipCap('health')
		}
	};

	for (let equipName in MODULES.equipment) {
		const equipData = game.equipment[equipName];
		if (equipData.locked || (challengeActive('Pandemonium') && game.challenges.Pandemonium.isEquipBlocked(equipName))) continue;
		if (equipName === 'Shield') {
			if (ignoreShield || (game.global.universe === 1 && needGymystic())) continue;
			if (challengeActive('Hypothermia') && game.resources.wood.owned > game.challenges.Hypothermia.bonfirePrice()) continue;
		}

		const equipModule = MODULES.equipment[equipName];
		const equipType = equipModule.stat;
		const zoneGo = mostEfficient[equipType].zoneGo;
		const resourceSpendingPct = mostEfficient[equipType].resourceSpendingPct;
		const forcePrestige = (prestigeSetting === 1 && zoneGo) || (prestigeSetting === 2 && canAtlantrimp) || prestigeSetting === 3;

		let nextLevelValue = 1;
		let safeRatio = 1;
		let nextLevelCost = 1;
		let prestige = false;

		const maybeBuyPrestige = buyPrestigeMaybe(equipName, resourceSpendingPct, equipData.level);
		const equipCap = maybeBuyPrestige.prestigeAvailable ? Math.max(mostEfficient[equipType].equipCap, 9) : mostEfficient[equipType].equipCap;

		if ((prestigesAvailable && forcePrestige && !maybeBuyPrestige.prestigeAvailable) || (!maybeBuyPrestige.purchase && equipData.level >= equipCap)) continue;

		if (!prestigesAvailable || !forcePrestige) {
			nextLevelCost = equipData.cost[equipModule.resource][0] * Math.pow(equipData.cost[equipModule.resource][1], equipData.level) * equipMult;
			nextLevelValue = equipData[`${equipType}Calculated`];
			safeRatio = nextLevelCost / nextLevelValue;
		}

		//Check for further overrides for if we want to skip looking at prestiges
		if (!maybeBuyPrestige.skip && !((prestigeSetting === 0 || (prestigeSetting === 1 && !zoneGo)) && equipData.level < 6)) {
			if (prestigeSetting === 2 && !canAtlantrimp && game.resources[equipModule.resource].owned * prestigePct < maybeBuyPrestige.prestigeCost) {
				if (equipData.level >= equipCap) continue;
			} else if (maybeBuyPrestige.purchase && (maybeBuyPrestige.statPerResource < mostEfficient[equipType].statPerResource || !mostEfficient[equipType].name)) {
				if (equipName === 'Shield' && game.resources[equipModule.resource].owned < maybeBuyPrestige.prestigeCost) continue;
				nextLevelCost = maybeBuyPrestige.prestigeCost;
				nextLevelValue = maybeBuyPrestige.newStatValue;
				safeRatio = maybeBuyPrestige.statPerResource;
				prestige = true;
			} else if (forcePrestige && equipData.prestige > highestPrestige) continue;
		}

		if (safeRatio === 1) continue;
		if (equipName === 'Shield' && !prestige && (equipData.level >= equipCap || !canAffordBuilding(equipName, null, null, true, false, 1, resourceSpendingPct * 100))) continue;

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

function _getHighestPrestige(prestigeSetting, canAtlantrimp) {
	let highestPrestige = 0;
	let prestigesAvailable = false;

	for (let equipName in MODULES.equipment) {
		const equipType = MODULES.equipment[equipName].stat;
		const currentPrestige = game.equipment[equipName].prestige;
		highestPrestige = Math.max(highestPrestige, currentPrestige);

		if (prestigesAvailable || equipName === 'Shield' || buyPrestigeMaybe(equipName).skip) continue;
		if (prestigeSetting === 0 || (prestigeSetting === 1 && mostEfficient[equipType].zoneGo) || (prestigeSetting === 2 && !canAtlantrimp)) continue;

		prestigesAvailable = true;
	}

	return [highestPrestige, prestigesAvailable];
}

function buyPrestigeMaybe(equipName, resourceSpendingPct = 1, maxLevel = Infinity) {
	const prestigeInfo = {
		purchase: false,
		prestigeAvailable: false,
		newStatValue: 0,
		prestigeCost: 0,
		statPerResource: 0,
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

	const prestigeCost = getNextPrestigeCost(prestigeUpgradeName) * getEquipPriceMult();
	const newLevel = Math.max(1, Math.min(maxLevel, 1 + Math.max(0, Math.floor(getMaxAffordable(prestigeCost * 1.2, (game.resources[resourceUsed].owned - prestigeCost) * resourceSpendingPct, 1.2, true)))));
	const oneLevelStat = Math.round(equipment[equipStat] * Math.pow(1.19, equipment.prestige * game.global.prestige[equipStat] + 1));
	const newStatValue = newLevel * oneLevelStat;
	const currentStatValue = equipment.level * equipment[`${equipStat}Calculated`];
	const statPerResource = prestigeCost / oneLevelStat;

	prestigeInfo.purchase = newStatValue > currentStatValue;
	prestigeInfo.newStatValue = newStatValue;
	prestigeInfo.prestigeCost = prestigeCost;
	prestigeInfo.statPerResource = statPerResource;
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

	if (farmType === 'attack') {
		if (hdRatio > getPageSetting('equipCutOffHD')) return zoneDetails;
		if (mapSettings.mapName === 'Wither Farm' || mapSettings.mapName === 'Smithless Farm') return zoneDetails;
	}
	if (farmType === 'health') {
		if (whichHitsSurvived() < getPageSetting('equipCutOffHS') || mapSettings.shouldHealthFarm) return zoneDetails;
		if ((mapSettings.mapName === 'Smithless Farm' || mapSettings.mapName === 'Wither Farm') && mapSettings.equality > 0) return zoneDetails;
		if (game.global.universe === 2 && hdRatio > getPageSetting('equipCutOffHD') && getPerkLevel('Equality') > 0) return zoneDetails;
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
	//Init
	const { Miners, Speedminer, Megaminer } = game.upgrades;
	const scienceOwned = game.resources.science.owned;
	const metalOwned = game.resources.metal.owned;

	if (!getPageSetting('equipOn')) return;

	//Saves metal for upgrades
	if (!challengeActive('Scientist') && (getPageSetting('upgradeType') || game.global.autoUpgrades)) {
		function shouldSaveForSpeedUpgrade(upgradeObj, metalPercentageAllowed) {
			//No upgrades available
			if (upgradeObj.done >= upgradeObj.allowed)
				return false;

			//Not enough science to start saving
			if (scienceOwned < resolvePow(upgradeObj.cost.resources.science, upgradeObj))
				return false;

			//Not enough metal to start saving
			return metalOwned >= resolvePow(upgradeObj.cost.resources.metal, upgradeObj) * metalPercentageAllowed;
		}

		//Saves metal for Speed upgrades
		if (shouldSaveForSpeedUpgrade(Speedminer, 1/4) || shouldSaveForSpeedUpgrade(Megaminer, 1.0/9.6))
			return false;

		//Saves metal for Miners
		if (Miners.allowed && !Miners.done) return;
	}

	//If running a wood or metal quest then disable autoEquip
	if ([2, 3].indexOf(_getCurrentQuest()) >= 0) return;
	if (mapSettings.mapName === 'Smithy Farm' || settingChangedTimeout) return;
	if (game.mapUnlocks.AncientTreasure.canRunOnce) {
		if (mapSettings.ancientTreasure) return;
		else if (MODULES.mapFunctions.runUniqueMap === getAncientTreasureName()) return;
		else if (game.global.mapsActive && getCurrentMapObject().name === getAncientTreasureName()) return;
	}

	//If inside a do while loop in TW it will lag out the game at the start of a portal so best having it outside of that kind of loop
	const dontWhileLoop = usingRealTimeOffline || atSettings.loops.atTimeLapseFastLoop || checkIfLiquidZone();

	if (dontWhileLoop) {
		buyEquipsPrestige();
		buyEquipsAlways2();
		buyEquips();
		return;
	}

	let prestigeLeft = false;
	do {
		prestigeLeft = buyEquipsPrestige();
	} while (prestigeLeft);

	let equipLeft = false;
	do {
		equipLeft = buyEquipsAlways2();
	} while (equipLeft);

	let keepBuying = false;
	do {
		keepBuying = buyEquips();
	} while (keepBuying);
}

function buyEquipsPrestige() {
	if (getPageSetting('equipPrestige') !== 3) return false;
	let prestigeLeft = false;

	for (let equipName in game.equipment) {
		const prestigeInfo = buyPrestigeMaybe(equipName);
		if (!game.equipment[equipName].locked && !prestigeInfo.skip) {
			if (game.resources[prestigeInfo.resource].owned < prestigeInfo.prestigeCost) continue;
			buyUpgrade(MODULES.equipment[equipName].upgrade, true, true);
			prestigeLeft = true;
			debug(`Upgrading ${equipName} - Prestige ${game.equipment[equipName].prestige}`, `equipment`, '*upload');
		}
	}

	return prestigeLeft;
}

function buyEquipsAlways2() {
	const alwaysLvl2 = getPageSetting('equip2');
	const alwaysPandemonium = trimpStats.currChallenge === 'Pandemonium' && !mapSettings.pandaEquips && getPageSetting('pandemoniumAE') > 0;
	if (!alwaysLvl2 && !alwaysPandemonium) return false;
	let equipLeft = false;

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

	return equipLeft;
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

	return keepBuying;
}

function displayMostEfficientEquipment(forceUpdate = false) {
	if (!getPageSetting('equipEfficientEquipDisplay')) return;
	if (!atSettings.intervals.oneSecond && !forceUpdate) return;
	if (game.options.menu.equipHighlight.enabled > 0) toggleSetting('equipHighlight');

	const bestBuys = mostEfficientEquipment(1, false, true);

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
