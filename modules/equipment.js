atData.equipment = {
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

function _shouldSaveResource(resourceName) {
	const upgradeType = getPageSetting('upgradeType');

	let upgrades = ['Bounty', 'Efficiency', 'TrainTacular'];
	if (upgradeType !== 2) upgrades = upgrades.concat(['Coordination']);
	upgrades = upgrades.concat(resourceName === 'metal' ? ['Speedminer', 'Megaminer', 'Blockmaster'] : ['Speedlumber', 'Megalumber', 'Potency']);

	const shouldSave = !challengeActive('Scientist') && (game.global.autoUpgrades || upgradeType);
	return shouldSave && upgrades.some((up) => shouldSaveForSpeedUpgrade(game.upgrades[up]));
}

function mostEfficientEquipment(resourceSpendingPct = undefined, zoneGo = false, ignoreShield = false, saveResources = { metal: _shouldSaveResource('metal'), wood: _shouldSaveResource('wood') }) {
	if (mapSettings.pandaEquips) return pandemoniumEquipmentCheck(mapSettings.cacheGain);

	const canAncientTreasure = game.mapUnlocks.AncientTreasure.canRunOnce;
	const prestigeSetting = getPageSetting('equipPrestige');
	const noPrestigeChallenge = challengeActive('Scientist') || challengeActive('Frugal');

	const equipSettingsArray = JSON.parse(JSON.stringify(getPageSetting('autoEquipSettingsArray')));
	if (ignoreShield) equipSettingsArray.Shield.enabled = false;

	const baseEquipmentObj = _getMostEfficientObject(resourceSpendingPct, zoneGo, noPrestigeChallenge);
	const [highestPrestige, prestigesAvailableObj] = _getHighestPrestige(baseEquipmentObj, prestigeSetting, canAncientTreasure, noPrestigeChallenge, saveResources);

	const buyPrestigesObj = _populateBuyPrestiges(equipSettingsArray, baseEquipmentObj, saveResources);
	const mostEfficientObj = _populateMostEfficientEquipment(equipSettingsArray, baseEquipmentObj, buyPrestigesObj, canAncientTreasure, prestigeSetting, highestPrestige, prestigesAvailableObj);

	return mostEfficientObj;
}

function calculateEquipCap(type, zoneGo = false, noPrestigeChallenge = challengeActive('Scientist') || challengeActive('Frugal'), externalCheck = false) {
	if ((zoneGo && externalCheck) || noPrestigeChallenge) return Infinity;
	if (mapSettings.mapName === 'Smithless Farm' && (type === 'attack' || mapSettings.equality > 0)) return Infinity;
}

function calculateResourceSpendingPct(zoneGo = false, type = 'attack', resourceSpendingPct = 0) {
	if (zoneGo || (mapSettings.shouldHealthFarm && type !== 'attack')) return 1;
	if (mapSettings.mapName === 'Smithless Farm' && (type === 'attack' || mapSettings.equality > 0)) return 1;
	return resourceSpendingPct;
}

function _getMostEfficientObject(resourceSpendingPct, zoneGo, noPrestigeChallenge) {
	const equipZone = getPageSetting('equipZone');
	const currentMap = getCurrentMapObject() || { location: 'world' };

	const getZoneGo = (type) => zoneGo || zoneGoCheck(equipZone, type, currentMap).active;

	const createObject = (type) => {
		const zoneGo = getZoneGo(type);

		return {
			name: '',
			statPerResource: Infinity,
			prestige: false,
			cost: 0,
			resourceSpendingPct: calculateResourceSpendingPct(zoneGo, type, resourceSpendingPct),
			zoneGo: zoneGo,
			equipCap: calculateEquipCap(type, zoneGo, noPrestigeChallenge)
		};
	};

	return {
		attack: createObject('attack'),
		health: createObject('health'),
		block: createObject('block')
	};
}

function _getHighestPrestige(mostEfficient, prestigeSetting, canAncientTreasure, noPrestigeChallenge, saveResources) {
	let highestPrestige = 0;
	const prestigesObj = {
		prestigesAvailable: false,
		prestigeTypes: {
			attack: false,
			health: false
		}
	};

	if (!saveResources) {
		saveResources = {
			metal: _shouldSaveResource('metal'),
			wood: _shouldSaveResource('wood')
		};
	}

	if (!noPrestigeChallenge) {
		for (let equipName in atData.equipment) {
			if (equipName === 'Shield') continue;
			const equipType = atData.equipment[equipName].stat;
			const currentPrestige = game.equipment[equipName].prestige;
			highestPrestige = Math.max(highestPrestige, currentPrestige);
			if (prestigesObj.prestigesAvailable || buyPrestigeMaybe(equipName, undefined, undefined, saveResources).skip) continue;
			if ((prestigeSetting === 0 && mostEfficient[equipType].zoneGo) || (prestigeSetting === 1 && !canAncientTreasure)) continue;

			prestigesObj.prestigesAvailable = true;
			prestigesObj.prestigeTypes[equipType] = true;
		}
	}

	return [highestPrestige, prestigesObj];
}

function _populateBuyPrestiges(equipSettingsArray, mostEfficient, saveResources) {
	const buyPrestiges = {};
	const pandemonium = challengeActive('Pandemonium');

	if (!saveResources) {
		saveResources = {
			metal: _shouldSaveResource('metal'),
			wood: _shouldSaveResource('wood')
		};
	}

	for (const equipName in atData.equipment) {
		const equipData = game.equipment[equipName];
		if (equipData.locked || (pandemonium && game.challenges.Pandemonium.isEquipBlocked(equipName))) continue;
		if (!equipSettingsArray[equipName].enabled) continue;

		const equipModule = atData.equipment[equipName];
		const equipType = equipModule.stat;
		const resourceSpendingPct = mostEfficient[equipType].resourceSpendingPct !== 1 ? equipSettingsArray[equipName].percent / 100 : 1;
		buyPrestiges[equipName] = buyPrestigeMaybe(equipName, resourceSpendingPct, equipData.level, saveResources);
	}

	return buyPrestiges;
}

function _populateMostEfficientEquipment(equipSettingsArray, mostEfficient, buyPrestigesObj, canAncientTreasure, prestigeSetting, highestPrestige, prestigesAvailableObj) {
	const mostEfficientOrig = { ...mostEfficient };
	const { prestigeTypes, prestigesAvailable } = prestigesAvailableObj;
	const prestigeSkip = { attack: false, health: false };
	let allowPrestigeSkip = true;

	const equipWeight = getPageSetting('equipWeight') > 0 ? getPageSetting('equipWeight') : 1;

	function findEfficientItems(mostEfficient) {
		const equipMult = getEquipPriceMult();
		const healthStats = calcEquipment('attack');
		const attackStats = calcEquipment('health');
		const pandemonium = challengeActive('Pandemonium');
		const prestigePct = prestigeSetting === 1 && !canAncientTreasure ? Math.min(1, getPageSetting('equipPrestigePct') / 100) : 1;

		for (const equipName in atData.equipment) {
			const equipData = game.equipment[equipName];
			const maybeBuyPrestige = buyPrestigesObj[equipName];

			if (equipData.locked || (pandemonium && game.challenges.Pandemonium.isEquipBlocked(equipName))) continue;
			if (!equipSettingsArray[equipName].enabled) continue;

			if (equipName === 'Shield') {
				if (game.global.universe === 1 && !game.buildings.Gym.locked) {
					if (needGymystic()) continue;
					const { Gym } = getPageSetting('buildingSettingsArray');

					if (Gym && Gym.enabled && (Gym.buyMax <= 0 || Gym.buyMax > game.buildings.Gym.owned) && getPageSetting('buildingsType')) {
						if (!maybeBuyPrestige.prestigeAvailable || game.resources.wood.owned * 0.001 < maybeBuyPrestige.prestigeCost) {
							if (hdStats.shieldGymEff.mostEfficient !== 'Shield') continue;
						}
					}
				}

				if (challengeActive('Hypothermia') && game.resources.wood.owned > game.challenges.Hypothermia.bonfirePrice()) continue;
			}

			const equipModule = atData.equipment[equipName];
			const equipType = equipModule.stat;
			const zoneGo = mostEfficient[equipType].zoneGo;
			const resourceSpendingPct = mostEfficient[equipType].resourceSpendingPct !== 1 ? equipSettingsArray[equipName].percent / 100 : 1;
			const forcePrestige = (prestigeSetting === 1 && canAncientTreasure) || prestigeSetting === 2;
			if (forcePrestige && equipName !== 'Shield') {
				if (prestigesAvailable && allowPrestigeSkip && !maybeBuyPrestige.prestigeAvailable) {
					const otherEquipType = equipType === 'attack' ? 'health' : 'attack';
					const mapType = mapSettings.mapName.includes(equipType === 'health' ? 'Hits Survived' : 'HD Farm');
					if (!mapType && (!zoneGo || (!prestigeTypes[equipType] && mostEfficient[otherEquipType].zoneGo))) {
						prestigeSkip[otherEquipType] = true;
						continue;
					}
				}
			}

			let equipCap = mostEfficient[equipType].equipCap || 0;
			if (equipData.level >= equipCap && mostEfficient[equipType].zoneGo) equipCap = Infinity;
			if (equipCap !== Infinity) equipCap = equipSettingsArray[equipName].buyMax;
			if (equipCap === 0) equipCap = Infinity;
			if (maybeBuyPrestige.prestigeAvailable) equipCap = Math.min(equipCap, 9);

			const ancientTreasurePrestigeSkip = prestigeSetting === 1 && !canAncientTreasure && game.resources[equipModule.resource].owned * prestigePct < maybeBuyPrestige.prestigeCost;
			let nextLevelValue = 1;
			let safeRatio = 1;
			let nextLevelCost = 1;
			let prestige = false;

			if (maybeBuyPrestige.purchase && !ancientTreasurePrestigeSkip) {
				({ prestigeCost: nextLevelCost, newStatValue: nextLevelValue, statPerResource: safeRatio } = maybeBuyPrestige);
				prestige = true;
			} else if (forcePrestige && highestPrestige > game.equipment[equipName].prestige) {
				continue;
			} else {
				nextLevelCost = equipData.cost[equipModule.resource][0] * Math.pow(equipData.cost[equipModule.resource][1], equipData.level) * equipMult;
				nextLevelValue = equipData[`${equipType}Calculated`];
				safeRatio = nextLevelCost / nextLevelValue;
			}

			if (!prestige) {
				if (equipData.level >= equipCap) continue;

				if (equipData.prestige <= highestPrestige - 2 && equipData.level >= mostEfficient[equipType].equipCap) {
					let maxCanAfford = Math.max(1, getMaxAffordable(nextLevelCost, game.resources[equipModule.resource].owned, 1.2, true));
					maxCanAfford = Math.min(maxCanAfford, equipCap - equipData.level);

					const equipStats = equipType === 'health' ? healthStats : attackStats;
					const statIncrease = (nextLevelValue * maxCanAfford) / equipStats;
					if (1e-3 > statIncrease) {
						continue;
					}
				}
			}

			if (equipName === 'Shield' && nextLevelCost / (equipWeight < 1 ? equipWeight : 1) > game.resources.wood.owned * resourceSpendingPct) continue;

			const shieldEff = equipName === 'Shield' && equipType === 'health' && mostEfficient[equipType].cost > game.resources.metal.owned * resourceSpendingPct;
			const isMostEfficient = mostEfficient[equipType].statPerResource > safeRatio || !mostEfficient[equipType].name || shieldEff;

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

	mostEfficient = findEfficientItems(mostEfficientOrig);

	if (prestigeSkip.attack || prestigeSkip.health) {
		if (prestigeSkip.attack && mostEfficient.attack.prestige) return mostEfficient;
		if (prestigeSkip.health && mostEfficient.health.prestige) return mostEfficient;
		allowPrestigeSkip = false;
		mostEfficient = findEfficientItems(mostEfficientOrig);
	}

	return mostEfficient;
}

function buyPrestigeMaybe(equipName, resourceSpendingPct = 1, maxLevel = Infinity, saveResources) {
	const prestigeInfo = {
		minNewLevel: 0,
		newStatMinValue: 0,
		purchase: false,
		prestigeAvailable: false,
		newStatValue: 0,
		prestigeCost: 0,
		statPerResource: 0,
		shouldPrestige: false,
		skip: true,
		resourceSpendingPct
	};

	if (!saveResources) {
		saveResources = {
			metal: _shouldSaveResource('metal'),
			wood: _shouldSaveResource('wood')
		};
	}

	if (!Object.getOwnPropertyNames(atData.equipment).includes(equipName)) return prestigeInfo;
	if (challengeActive('Pandemonium') && game.challenges.Pandemonium.isEquipBlocked(equipName)) return prestigeInfo;
	if (challengeActive('Scientist') || challengeActive('Frugal')) return prestigeInfo;

	const resourceUsed = equipName === 'Shield' ? 'wood' : 'metal';
	if (saveResources[resourceUsed]) return prestigeInfo;

	const prestigeUpgradeName = atData.equipment[equipName].upgrade;
	const prestigeUpgrade = game.upgrades[prestigeUpgradeName];

	if (prestigeUpgrade.locked || prestigeUpgrade.allowed === prestigeUpgrade.done) return prestigeInfo;

	prestigeInfo.prestigeAvailable = true;

	const equipment = game.equipment[equipName];
	const equipStat = equipment.attack !== undefined ? 'attack' : resourceUsed === 'wood' && equipment.blockNow ? 'block' : 'health';
	const currentStatValue = equipment.level * equipment[`${equipStat}Calculated`];
	const oneLevelStat = Math.round(equipment[equipStat] * Math.pow(1.19, equipment.prestige * game.global.prestige[equipStat] + 1));
	const prestigeCost = getNextPrestigeCost(prestigeUpgradeName) * getEquipPriceMult();

	const minLevelBeforePrestige = getPageSetting('equip2') && ![1, 2].includes(getPageSetting('equipPrestige')) ? 2 : 1;
	prestigeInfo.shouldPrestige = (equipment.level === 0 || equipment.level >= minLevelBeforePrestige) && game.resources.gems.owned > 0;
	prestigeInfo.minNewLevel = Math.min(maxLevel, Math.ceil(0.25 + currentStatValue / oneLevelStat));
	prestigeInfo.newStatMinValue = oneLevelStat * prestigeInfo.minNewLevel;
	prestigeInfo.prestigeCost = prestigeCost;

	if (saveResources[resourceUsed]) {
		return prestigeInfo;
	}

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

	const newLevel = Math.max(1, Math.min(maxLevel, 1 + Math.max(0, Math.floor(getMaxAffordable(prestigeCost * 1.2, (game.resources[resourceUsed].owned - prestigeCost) * resourceSpendingPct, 1.2, true)))));
	const newStatValue = newLevel * oneLevelStat;
	const statPerResource = prestigeCost / oneLevelStat;

	prestigeInfo.purchase = prestigeInfo.shouldPrestige && (newLevel >= prestigeInfo.minNewLevel || equipment.level === 0);
	prestigeInfo.newStatValue = newStatValue;
	prestigeInfo.prestigeCost = prestigeCost;
	prestigeInfo.statPerResource = statPerResource;
	prestigeInfo.skip = false;
	prestigeInfo.resource = resourceUsed;

	return prestigeInfo;
}

//Check to see if we are in the zone range that the user set
function zoneGoCheck(setting = getPageSetting('equipZone'), farmType = 'attack', mapType = { location: 'world' }) {
	const zoneDetails = {
		active: true,
		zone: game.global.world
	};

	let hdRatio = hdStats.hdRatio;
	if (mapType.location === 'Void' || (mapSettings.voidHitsSurvived && trimpStats.autoMaps)) hdRatio = hdStats.hdRatioVoid;
	else if (mapType.location === 'Bionic' || (mapSettings.mapName === 'Bionic Raiding' && trimpStats.autoMaps)) hdRatio = hdStats.hdRatioMap;

	if (farmType === 'attack') {
		const cutOffHD = getPageSetting('equipCutOffHD');
		if (MODULES.buildings.betaHouseEfficiency) {
			const formation = game.global.world < 60 || game.global.highestLevelCleared < 180 ? 'X' : 'S';
			if (cutOffHD > 0 && hdRatio > cutOffHD && oneShotZone(mapType.location, formation) < maxOneShotPower()) return zoneDetails;
		} else {
			if (cutOffHD > 0 && hdRatio > getPageSetting('equipCutOffHD')) return zoneDetails;
		}

		if (mapSettings.mapName === 'Wither Farm' || mapSettings.mapName === 'Smithless Farm') return zoneDetails;
	}

	if (farmType === 'health' || farmType === 'block') {
		const hitsSurvived = whichHitsSurvived();
		const cutOffHS = getPageSetting('equipCutOffHS');
		if ((cutOffHS > 0 && hitsSurvived < cutOffHS) || mapSettings.shouldHealthFarm) return zoneDetails;
		if ((mapSettings.mapName === 'Smithless Farm' || mapSettings.mapName === 'Wither Farm') && mapSettings.equality > 0) return zoneDetails;
		if (game.global.universe === 2) {
			const cutOffHD = getPageSetting('equipCutOffHD');
			if (cutOffHD > 0 && hdRatio > cutOffHD && getPerkLevel('Equality') > 0) return zoneDetails;
		}
	}

	const settingZone = setting;
	const world = game.global.world.toString();

	const p = settingZone.findIndex((zone) => {
		zone = zone.toString();
		if (zone.indexOf('.') >= 0) {
			const [start, end] = zone.split('.');
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
	if (!getPageSetting('equipOn')) return;

	const upgradeType = getPageSetting('upgradeType');
	if (!challengeActive('Scientist') && (game.global.autoUpgrades || upgradeType)) {
		const upgradeList = ['Efficiency', 'TrainTacular'];
		if (upgradeType !== 2) upgradeList.push('Coordination');

		if (upgradeList.some((up) => shouldSaveForSpeedUpgrade(game.upgrades[up]))) {
			return;
		}
	}

	if ([2, 3].includes(getCurrentQuest())) return;
	if (mapSettings.mapName === 'Smithy Farm' || atConfig.timeouts.mapSettings) return;
	if (runningAncientTreasure()) return;

	const saveResources = {
		metal: _shouldSaveResource('metal'),
		wood: _shouldSaveResource('wood')
	};

	const quest = getCurrentQuest();
	if (quest === 2) saveResources.wood = false;
	if (quest === 3) saveResources.metal = false;

	if (_autoEquipTimeWarp(saveResources)) return;

	let equipLeft = false;
	do {
		equipLeft = buyEquipsAlways2(saveResources);
	} while (equipLeft);

	let keepBuying = false;
	do {
		keepBuying = buyEquips(saveResources);
	} while (keepBuying);
}

function _autoEquipTimeWarp(saveResources) {
	const dontWhileLoop = usingRealTimeOffline || atConfig.loops.atTimeLapseFastLoop || liquifiedZone();
	if (!dontWhileLoop) return false;

	buyEquipsAlways2(saveResources);
	buyEquips(saveResources);

	return true;
}

function buyEquipsAlways2(saveResources) {
	const alwaysLvl2 = getPageSetting('equip2');
	const alwaysPandemonium = trimpStats.currChallenge === 'Pandemonium' && !mapSettings.pandaEquips && getPageSetting('pandemoniumAE') > 0;
	if (!alwaysLvl2 && !alwaysPandemonium) return false;

	let equipLeft = false;

	if (!game.upgrades.Miners.done && !challengeActive('Metal') && !challengeActive('Transmute')) saveResources.metal = true;

	for (let equip in game.equipment) {
		if (!game.equipment[equip].locked) {
			if (!canAffordBuilding(equip, false, false, true, false, 1)) continue;
			if (trimpStats.currChallenge === 'Pandemonium' && game.challenges.Pandemonium.isEquipBlocked(equip)) continue;
			if (saveResources[atData.equipment[equip].resource]) continue;

			if (alwaysLvl2 && game.equipment[equip].level < 2) {
				buyEquipment(equip, true, true, 1);
				debug(`Upgrading 1 ${equip}`, `equipment`, `*upload3`);
			}

			if (alwaysPandemonium) {
				buyEquipment(equip, true, true, 1);
				debug(`Upgrading 1 ${equip}`, `equipment`, `*upload3`);
				equipLeft = true;
			}
		}
	}

	return equipLeft;
}

function buyEquips(saveResources) {
	const bestBuys = mostEfficientEquipment(undefined, undefined, undefined, saveResources);
	const equipTypeList = ['attack', 'health'];
	if (game.global.universe === 1) equipTypeList.push('block');
	const equipTypes = equipTypeList.sort((a, b) => bestBuys[a].cost - bestBuys[b].cost);
	const equipWeight = getPageSetting('equipWeight') > 0 ? getPageSetting('equipWeight') : 1;
	let keepBuying = false;

	if (!game.upgrades.Miners.done && !challengeActive('Metal') && !challengeActive('Transmute')) saveResources.metal = true;

	for (let equipType of equipTypes) {
		const equip = bestBuys[equipType];
		const resourceUsed = equip.name === 'Shield' ? 'wood' : 'metal';
		const equipData = game.equipment[equip.name];

		if (equipType === 'health' && equipWeight < 1) equip.cost /= equipWeight;
		if (equipType === 'attack' && equipWeight > 1) equip.cost *= equipWeight;

		if (!equip.name || equipData.locked) continue;
		if (equip.cost > equip.resourceSpendingPct * game.resources[resourceUsed].owned) continue;
		if (equipData.level >= equip.equipCap && !equip.prestige && !equip.zoneGo) continue;
		if (saveResources[resourceUsed]) continue;
		if (!(equip.prestige || canAffordBuilding(equip.name, false, false, true, false, 1))) continue;

		if (equip.prestige) {
			buyUpgrade(atData.equipment[equip.name].upgrade, true, true);
			debug(`Upgrading ${equip.name} - Prestige ${equipData.prestige}`, `equipment`, '*upload');
			keepBuying = true;
		} else {
			/* calculate amount of levels that can be afforded with 0.1% of resources. */
			let maxCanAfford = Math.max(1, getMaxAffordable(equip.cost, game.resources[resourceUsed].owned * 0.001, 1.2, true));
			maxCanAfford = Math.min(maxCanAfford, equip.equipCap - equipData.level);

			if (maxCanAfford > 0) {
				buyEquipment(equip.name, true, true, maxCanAfford);
				debug(`Upgrading ${maxCanAfford} ${equip.name}${maxCanAfford > 1 && !equip.name.endsWith('s') ? 's' : ''}`, `equipment`, `*upload3`);
				keepBuying = true;
			}
		}
	}

	/* if (keepBuying && mapSettings.mapName === 'HD Ratio') hdStats.hdRatio = calcHDRatio(game.global.world, 'world', false, 1);
	if (keepBuying && mapSettings.mapName === 'Hits Survived') hdStats.hitsSurvived = calcHitsSurvived(game.global.world, 'world', 1); */

	return keepBuying;
}

function displayMostEfficientEquipment(forceUpdate = false) {
	if (!atConfig.intervals.oneSecond && !forceUpdate) return;
	if (!getPageSetting('equipEfficientEquipDisplay')) return;
	if (game.options.menu.equipHighlight.enabled > 0) toggleSetting('equipHighlight');

	const saveResources = {
		metal: _shouldSaveResource('metal'),
		wood: _shouldSaveResource('wood')
	};

	const bestBuys = mostEfficientEquipment(1, undefined, true, saveResources);

	for (let item in game.equipment) {
		if (game.equipment[item].locked || item === 'Shield') continue;

		const prestigeName = atData.equipment[item].upgrade;
		const equipType = atData.equipment[item].stat;
		const prestigeElement = document.getElementById(prestigeName);
		let itemElement = document.getElementById(item);

		/* 	Looking at the prestiges for each item to see if it's available and if so then add the efficient class to it */
		if (game.upgrades[prestigeName].locked === 0 && prestigeElement) {
			/* 	If the prestige doesn't have the efficient class then add it */
			if (!prestigeElement.classList.contains('efficient')) prestigeElement.classList.add('efficient');
			/* 	Swap the efficient class to efficientNo if the prestige isn't the most efficient thing to purchase */
			if (prestigeElement.classList.contains('efficientYes') && (item !== bestBuys[equipType].name || (item === bestBuys[equipType].name && !bestBuys[equipType].prestige))) swapClass('efficient', 'efficientNo', prestigeElement);
		}

		/* 	When looking at the most efficient item, and it's not a prestige, then add the efficientYes class to it
			If the equipment already has the efficientYes class swap it to efficientNo */
		if (item === bestBuys[equipType].name && bestBuys[equipType].prestige && itemElement) {
			if (itemElement.classList.contains('efficientYes')) swapClass('efficient', 'efficientNo', itemElement);
			bestBuys[equipType].name = prestigeName;
			item = prestigeName;
			itemElement = prestigeElement;
		}

		if (itemElement) {
			swapClass('efficient', item === bestBuys[equipType].name ? 'efficientYes' : 'efficientNo', itemElement);
		}
	}
}
