atData.uniqueMaps = Object.freeze({
	/* Universe 1 Unique Maps */
	'The Block': {
		zone: 11,
		difficulty: 1.3,
		challenges: ['Scientist', 'Trimp'],
		speedrun: 'blockTimed',
		universe: 1,
		mapUnlock: true,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (game.upgrades.Shieldblock.allowed) return false;
			if (mapSetting.unlocks && aboveMapLevel && getPageSetting('equipShieldBlock')) return true; //Don't bother before z12 outside of manual unique map settings setup
			else if (map.clears === 0 && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	'The Wall': {
		zone: 15,
		difficulty: 1.5,
		challenges: [],
		speedrun: 'wallTimed',
		universe: 1,
		mapUnlock: true,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (game.upgrades.Bounty.allowed) return false;
			if (mapSetting.unlocks && aboveMapLevel && !masteryPurchased('bounty')) return true; //Don't bother before z16
			else if (map.clears === 0 && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	'Dimension of Anger': {
		zone: 20,
		difficulty: 2.5,
		challenges: ['Discipline', 'Metal', 'Size', 'Frugal', 'Coordinate'],
		speedrun: 'angerTimed',
		universe: 1,
		mapUnlock: false,
		runConditions: function (map, mapSetting, liquified) {
			if (elementExists('portalBtn')) return false;
			if (mapSetting.unlocks && game.global.world - 1 > map.level) return true; //Don't bother before z22
			else if (map.clears === 0 && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	'Trimple Of Doom': {
		zone: 33,
		difficulty: 1.8,
		challenges: ['Meditate', 'Trapper'],
		speedrun: 'doomTimed',
		universe: 1,
		mapUnlock: false,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (mapSetting.unlocks && aboveMapLevel && game.portal.Relentlessness.locked) return true; //Unlock the Relentlessness perk
			else if (map.clears === 0 && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	'The Prison': {
		zone: 80,
		difficulty: 2.6,
		challenges: ['Electricity', 'Mapocalypse'],
		speedrun: 'prisonTimed',
		universe: 1,
		mapUnlock: true,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (mapSetting.unlocks && aboveMapLevel && game.global.prisonClear <= 0 && enoughHealth(map)) return true; //Unlock the Electricity challenge
			else if (map.clears === 0 && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	'Bionic Wonderland': {
		zone: 125,
		difficulty: 2.6,
		challenges: ['Crushed'],
		speedrun: 'bionicTimed',
		universe: 1,
		mapUnlock: true,
		runConditions: function () {
			return false;
		}
	},
	'Imploding Star': {
		zone: 170,
		difficulty: 3.2,
		challenges: ['Devastation'],
		speedrun: 'starTimed',
		universe: 1,
		mapUnlock: true,
		runConditions: function (map, mapSetting, liquified) {
			if (map.clears === 0 && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	/* Universe 2 Unique Maps */
	'Big Wall': {
		zone: 7,
		difficulty: 3.5,
		challenges: [''],
		speedrun: 'bigWallTimed',
		universe: 2,
		mapUnlock: true,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (game.upgrades.Bounty.allowed) return false;
			if (mapSetting.unlocks && aboveMapLevel && !masteryPurchased('bounty')) return true; // we need Bounty
			else if (map.clears === 0 && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	'Dimension of Rage': {
		zone: 16,
		difficulty: 6,
		challenges: ['Unlucky'],
		speedrun: '',
		universe: 2,
		mapUnlock: false,
		runConditions: function (map, mapSetting, liquified) {
			if (elementExists('portalBtn')) return false;
			if (mapSetting.unlocks && game.global.world - 1 > map.level && game.global.totalRadPortals === 0) return true; //Don't bother before z17
			else if (map.clears === 0 && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	'Prismatic Palace': {
		zone: 20,
		difficulty: 4,
		challenges: [''],
		speedrun: 'palaceTimed',
		universe: 2,
		mapUnlock: false,
		runConditions: function (map, mapSetting, liquified) {
			if (map.clears === 0 && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	Atlantrimp: {
		zone: 33,
		difficulty: 1.8,
		challenges: [''],
		speedrun: 'atlantrimpTimed',
		universe: 2,
		mapUnlock: false,
		runConditions: function (map, mapSetting, liquified) {
			if (!game.mapUnlocks.AncientTreasure.canRunOnce) return false;
			else if (mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	'Melting Point': {
		zone: 50,
		difficulty: 3.5,
		challenges: [''],
		speedrun: 'meltingTimed',
		universe: 2,
		mapUnlock: false,
		runConditions: function (map, mapSetting, liquified) {
			if (!game.mapUnlocks.SmithFree.canRunOnce) return false;
			if (!trimpStats.isC3 && !trimpStats.isDaily && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;

			const uniqueMapSetting = getPageSetting('uniqueMapSettingsArray');
			const currChallenge = trimpStats.currChallenge.toLowerCase();
			let smithyGoal = Infinity;
			if (['mayhem', 'pandemonium', 'desolation'].indexOf(currChallenge) >= 0 && getPageSetting(currChallenge) && getPageSetting(currChallenge + 'MP') > 0) smithyGoal = getPageSetting(currChallenge + 'MP');
			else if (trimpStats.isC3 && uniqueMapSetting['MP Smithy C3'].enabled && uniqueMapSetting['MP Smithy C3'].value > 0) smithyGoal = uniqueMapSetting['MP Smithy C3'].value;
			else if (trimpStats.isDaily && uniqueMapSetting['MP Smithy Daily'].enabled && uniqueMapSetting['MP Smithy Daily'].value > 0) smithyGoal = uniqueMapSetting['MP Smithy Daily'].value;
			else if (trimpStats.isOneOff && uniqueMapSetting['MP Smithy One Off'].enabled && uniqueMapSetting['MP Smithy One Off'].value > 0) smithyGoal = uniqueMapSetting['MP Smithy One Off'].value;
			else if (trimpStats.isFiller && uniqueMapSetting['MP Smithy'].enabled && uniqueMapSetting['MP Smithy'].value > 0) smithyGoal = uniqueMapSetting['MP Smithy'].value;
			if (smithyGoal <= game.buildings.Smithy.owned) return true;
			return false;
		}
	},
	'The Black Bog': {
		zone: 6,
		difficulty: 3,
		challenges: [''],
		speedrun: '',
		universe: 2,
		mapUnlock: false,
		runConditions: function () {
			if (mapSettings.mapName === 'Quagmire Farm' && quagmire().shouldRun) return true;
			return false;
		}
	},
	'Frozen Castle': {
		zone: 175,
		difficulty: 5,
		challenges: [''],
		speedrun: '',
		universe: 2,
		mapUnlock: false,
		runConditions: function (map, mapSetting, liquified) {
			const hypoSettings = getPageSetting('hypothermiaSettings')[0];
			const runningHypo = challengeActive('Hypothermia') && hypoSettings.active;
			const regularRun = !runningHypo && mapSetting.enabled && game.global.world >= mapSetting.zone && game.global.lastClearedCell + 2 >= mapSetting.cell;

			if (regularRun) return true;
			if (!runningHypo || mapSettings.mapName === 'Void Maps') return false;

			const frozenCastleSettings = hypoSettings.frozencastle;
			const world = frozenCastleSettings && frozenCastleSettings[0] !== undefined ? parseInt(frozenCastleSettings[0]) : 200;
			const cell = frozenCastleSettings && frozenCastleSettings[1] !== undefined ? parseInt(frozenCastleSettings[1]) : 99;
			const hypothermiaRun = hypoSettings.active && game.global.world >= world && (game.global.lastClearedCell + 2 >= cell || liquified);
			if (hypothermiaRun) return true;

			return false;
		}
	}
});

//Unique Maps Pt.2
function shouldRunUniqueMap(map) {
	//Stops unique maps being run when we should be destacking instead as it is likely to be slower overall.
	const isDestackingMap = ['Desolation Destacking', 'Pandemonium Destacking', 'Mayhem Destacking'].includes(mapSettings.mapName);
	if (isDestackingMap) return false;
	const mapData = atData.uniqueMaps[map.name];
	if (mapData === undefined || game.global.world < mapData.zone - (trimpStats.plusLevels ? 10 : 0)) return false;
	if (game.global.universe !== mapData.universe) return false;
	if (!challengeActive('Scientist') || game.global.sLevel < 5) {
		if (!trimpStats.isC3 && mapData.challenges.includes(trimpStats.currChallenge) && map.clears === 0 && !challengeActive('') && enoughHealth(map)) return true;
	}

	//Remove speed run check for now
	/* if (mapData.speedrun && shouldSpeedRun(map, game.achievements[mapData.speedrun]) && enoughHealth(map) && enoughDamage(map)) {
		return true;
	} */

	//Disable mapping if we don't have enough health to survive the map and the corresponding setting is enabled.
	if (getPageSetting('uniqueMapEnoughHealth') && !enoughHealth(map)) return false;

	//Check to see if the cell is liquified and if so we can replace the cell condition with it
	const liquified = liquifiedZone();
	const uniqueMapSetting = getPageSetting('uniqueMapSettingsArray');
	const mapSetting = uniqueMapSetting[map.name];
	if (mapSetting) mapSetting.unlocks = getPageSetting('uniqueMapUnlocks');
	const aboveMapLevel = game.global.world > map.level;

	//Check to see if the map should be run based on the user's settings.
	if (MODULES.mapFunctions.runUniqueMap === map.name || mapData.runConditions(map, mapSetting, liquified, aboveMapLevel)) {
		if (game.global.preMapsActive) {
			debug(`Running ${map.name}${map.name === 'Melting Point' ? ` at ${game.buildings.Smithy.owned} smithies` : ''} on zone ${game.global.world}.`, 'map_Details');
			if (MODULES.mapFunctions.runUniqueMap === map.name) MODULES.mapFunctions.runUniqueMap = '';
		}
		return true;
	}

	return false;
}

function liquifiedZone() {
	return game.global.gridArray && game.global.gridArray[0] && game.global.gridArray[0].name === 'Liquimp';
}

function _obtainUniqueMap(uniqueMap) {
	const mapName = 'Unique Map Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!uniqueMap || typeof uniqueMap !== 'string') uniqueMap = mapSettings.uniqueMap;
	if (!uniqueMap) return farmingDetails;

	const unlockLevel = atData.uniqueMaps[uniqueMap].zone;

	//Only go for this map if we are able to obtain it
	if (!trimpStats.perfectMaps && unlockLevel > game.global.world) return farmingDetails;
	else if (trimpStats.perfectMaps && unlockLevel > game.global.world + 10) return farmingDetails;

	const map = game.global.mapsOwnedArray.find((map) => map.name.includes(uniqueMap));
	const shouldMap = !map;
	const mapLevel = unlockLevel - game.global.world;

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, mapLevel);
		recycleMap_AT();
		resetMapVars();
	}

	const status = `Obtaining Unique Map: ${uniqueMap} (z${unlockLevel})`;

	Object.assign(farmingDetails, {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		special: '0',
		repeat: false,
		status,
		uniqueMap
	});

	return farmingDetails;
}

function _runUniqueMap(mapName) {
	const mapObj = getCurrentMapObject();
	if (game.global.mapsActive && mapObj.name === mapName) return;
	if (getPageSetting('autoMaps') !== 1) return;
	if (_insanityDisableUniqueMaps()) return;

	MODULES.mapFunctions.runUniqueMap = mapName;
	const map = game.global.mapsOwnedArray.find((map) => map.name.includes(mapName));

	if (map) {
		if (game.global.mapsActive && mapObj.name !== mapName) recycleMap_AT();
		if (game.global.preMapsActive && game.global.currentMapId === '') {
			selectMap(map.id);
			runMap(false);
			debug(`Running ${mapName} on zone ${game.global.world}.`, 'map_Details');
			MODULES.mapFunctions.runUniqueMap = '';
		}
	}
}

//Returns false if we can't any new speed runs, unless it's the first tier
function shouldSpeedRun(map, achievement) {
	if (achievement.finished === achievement.tiers.length) return false;

	let speed = 10 * 0.95 ** getPerkLevel('Agility');
	speed -= masteryPurchased('hyperspeed') + trimpStats.hyperspeed2;
	speed += challengeActive('Quagmire') ? game.challenges.Quagmire.getSpeedPenalty() / 100 : 0;
	speed /= 10;

	const timeToRun = (Math.ceil(map.size / maxOneShotPower(true)) * speed) / 60;
	const minutesThisRun = Math.floor((new Date().getTime() - game.global.portalTime) / 1000 / 60);
	const timeToBeat = achievement.breakpoints[achievement.finished];

	return minutesThisRun - timeToRun < timeToBeat;
}

function runningAncientTreasure() {
	if (!game.mapUnlocks.AncientTreasure.canRunOnce) return false;
	if (mapSettings.ancientTreasure && getPageSetting('autoMaps') === 1) return true;
	const mapName = getAncientTreasureName();
	if (MODULES.mapFunctions.runUniqueMap === mapName) return true;
	if (game.global.mapsActive && getCurrentMapObject().name === mapName) return true;
	return false;
}

function recycleMap_AT(forceAbandon) {
	if (!getPageSetting('autoMaps')) return;
	if (!getPageSetting('recycleExplorer') && game.jobs.Explorer.locked === 1) return;

	if (game.global.mapsActive && !mapSettings.equality) {
		const mapObj = getCurrentMapObject();
		if (mapCost(mapObj.level - game.global.world, mapObj.bonus, mapObj.location, [9, 9, 9], getPageSetting('onlyPerfectMaps')) > game.resources.fragments * 0.1) return;
		if (prestigesToGet(mapObj.level)[0] !== 0) return;
	}

	const skipChallenges = challengeActive('Mapology') || challengeActive('Unbalance') || challengeActive('Trappapalooza') || challengeActive('Archaeology') || (challengeActive('Berserk') && !game.challenges.Berserk.weakened !== 20);
	const isFrenzyStarted = game.portal.Frenzy.frenzyStarted !== -1;
	const skipMapping = ['Prestige Raiding', 'Prestige Climb'].includes(mapSettings.mapName);

	if (!forceAbandon && (skipChallenges || isFrenzyStarted || skipMapping || !newArmyRdy())) return;

	if (!game.global.preMapsActive) mapsClicked(true);
	if (game.global.preMapsActive) recycleMap();
}

//Void Maps
atData.voidPrefixes = Object.freeze({
	Poisonous: 10,
	Destructive: 11,
	Heinous: 20,
	Deadly: 30
});

atData.voidSuffixes = Object.freeze({
	Descent: 7.077,
	Void: 8.822,
	Nightmare: 9.436,
	Pit: 10.6
});

function _getVoidMapDifficulty(map) {
	if (!map) return 99999;

	let score = 0;
	const mapName = map.name;
	for (const [prefix, weight] of Object.entries(atData.voidPrefixes)) {
		if (mapName.includes(prefix)) {
			score += weight;
			if (trimpStats.shieldBreak) score = 100;
			break;
		}
	}
	for (const [suffix, weight] of Object.entries(atData.voidSuffixes)) {
		if (mapName.includes(suffix)) {
			score += weight;
			break;
		}
	}
	return score;
}

function _selectEasierVoidMap(map1, map2) {
	return _getVoidMapDifficulty(map2) > _getVoidMapDifficulty(map1) ? map1 : map2;
}

function voidMaps(lineCheck) {
	const mapName = 'Void Map';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	const settingName = 'voidMapSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	if (defaultSettings === null) return farmingDetails;

	if (!defaultSettings.active && !mapSettings.portalAfterVoids && !MODULES.mapFunctions.afterVoids) return farmingDetails;

	const dailyAddition = dailyOddOrEven();
	const settingIndex = _findSettingsIndexVoidMaps(settingName, baseSettings, dailyAddition);
	const heHrSetting = _getVoidMapsHeHrSetting(defaultSettings, dailyAddition);
	const setting = MODULES.mapFunctions.afterVoids ? heHrSetting : mapSettings.voidHDIndex ? baseSettings[mapSettings.voidHDIndex] : settingIndex ? baseSettings[settingIndex] : undefined;

	if (setting && setting.dontMap) return farmingDetails;
	if (lineCheck) return setting;

	if (setting) Object.assign(farmingDetails, _runVoidMaps(setting, mapName, settingIndex, defaultSettings, farmingDetails));

	return farmingDetails;
}

function _getVoidMapsHDObject() {
	return {
		world: { hdStat: hdStats.hdRatio, hdStatVoid: hdStats.vhdRatio, name: 'World HD Ratio' },
		map: { hdStat: hdStats.hdRatioMap, name: 'Map HD Ratio' },
		void: { hdStat: hdStats.hdRatioVoid, hdStatVoid: hdStats.vhdRatioVoid, name: 'Void HD Ratio' },
		hitsSurvived: { hdStat: hdStats.hitsSurvived, name: 'Hits Survived' },
		hitsSurvivedVoid: { hdStat: hdStats.hitsSurvivedVoid, name: 'Hits Survived Void' }
	};
}

function _findSettingsIndexVoidMaps(settingName, baseSettings, dailyAddition) {
	let settingIndex = null;
	if (!baseSettings[0].active) return settingIndex;
	const voidReduction = trimpStats.isDaily ? dailyModiferReduction() : 0;
	const zoneAddition = +dailyAddition.active;

	const dropdowns = ['hdRatio', 'voidHDRatio'];
	const hdTypes = ['hdType', 'hdType2'];
	const hdObject = _getVoidMapsHDObject();

	for (let y = 1; y < baseSettings.length; y++) {
		const currSetting = baseSettings[y];
		let world = currSetting.world + voidReduction;
		let endzone = currSetting.endzone + voidReduction;
		if (shouldSkipSetting(currSetting, world, settingName, dailyAddition)) continue;

		for (let x = 0; x < zoneAddition + 1; x++) {
			const shouldSkipLine = dropdowns.every((dropdown, index) => {
				if (currSetting[dropdowns[0]] === 0 && currSetting[dropdowns[1]] === 0) return false;
				if (currSetting[hdTypes[index]] === 'disabled') return false;
				const obj = hdObject[currSetting[hdTypes[index]]];
				const hdSetting = obj.hdStatVoid || obj.hdStat;
				/* This is if it should skip so the inverse of intended action */
				if (currSetting[hdTypes[index]].includes('hitsSurvived')) return currSetting[dropdown] < hdSetting;
				return currSetting[dropdown] > hdSetting;
			});

			if (shouldSkipLine && endzone !== game.global.world) continue;
			if (endzone === game.global.world || game.global.world - world >= 0) {
				settingIndex = y;
				break;
			}

			world += zoneAddition;
			endzone += zoneAddition;
		}
	}

	return settingIndex;
}

function _getVoidMapsHeHrSetting(defaultSettings, dailyAddition) {
	const portalSetting = MODULES.portal.C2afterPoisonVoids ? 2 : challengeActive('Daily') ? getPageSetting('dailyHeliumHrPortal') : getPageSetting('heliumHrPortal');
	if (portalSetting === 2 && getZoneEmpowerment(game.global.world) !== 'Poison') return { dontMap: true };
	if (dailyAddition.skipZone && !MODULES.portal.C2afterVoids) return { dontMap: true };

	return {
		cell: 1,
		jobratio: defaultSettings.jobratio ? defaultSettings.jobratio : '0,0,1',
		world: game.global.world,
		portalAfter: true,
		priority: 0,
		heHr: true
	};
}

function _setVoidMapsInitiator(setting, settingIndex) {
	if (MODULES.portal.C2afterVoids) {
		mapSettings.voidTrigger = `Portal After Voids (${_getChallenge2Info()})`;
		return;
	}

	if (setting.heHr) {
		const portalSetting = challengeActive('Daily') ? getPageSetting('dailyHeliumHrPortal') : getPageSetting('heliumHrPortal');
		const portalName = autoTrimpSettings.heliumHrPortal.name()[portalSetting];
		mapSettings.voidTrigger = `${_getPrimaryResourceInfo().name} Per Hour (${portalName})`;
		return;
	}

	const currSetting = getPageSetting('voidMapSettings')[settingIndex];
	const hdObject = _getVoidMapsHDObject();
	const dropdownTitles = ['dropdown', 'dropdown2'];
	const dropdowns = ['hdRatio', 'voidHDRatio'];
	const hdTypes = ['hdType', 'hdType2'];

	dropdowns.forEach((dropdown, index) => {
		const title = dropdownTitles[index];
		const type = hdTypes[index];
		if (currSetting[type] === 'disabled') return;
		const obj = hdObject[currSetting[type]];
		const hdSetting = obj.hdStatVoid || obj.hdStat;

		mapSettings[title] = {
			name: obj.name,
			hdRatio: obj.hdStat
		};
		if (mapSettings[title].name.includes('Hits Survived')) {
			if (currSetting[dropdown] > hdSetting) mapSettings.voidTrigger = obj.name;
		} else if (currSetting[dropdown] < hdSetting) {
			mapSettings.voidTrigger = obj.name;
		}
	});

	if (!mapSettings.voidTrigger) mapSettings.voidTrigger = 'Zone';
	mapSettings.voidHDIndex = settingIndex;
}

function _runVoidMaps(setting, mapName, settingIndex, defaultSettings, farmingDetails) {
	if (!mapSettings.voidTrigger && getPageSetting('autoMaps')) _setVoidMapsInitiator(setting, settingIndex);
	mapSettings.portalAfterVoids = mapSettings.portalAfterVoids || setting.portalAfter;

	const shouldMap = game.global.totalVoidMaps > 0;

	if (shouldMap && defaultSettings.boneCharge && !mapSettings.boneChargeUsed && game.permaBoneBonuses.boosts.charges > 0 && !game.options.menu.pauseGame.enabled) {
		debug(`Consumed 1 bone shrine charge on zone ${game.global.world} and gained ${boneShrineOutput(1)}`, 'bones');
		buyJobs(setting.jobratio);
		game.permaBoneBonuses.boosts.consume();
		mapSettings.boneChargeUsed = true;
	}

	const skipFarmChallenges = challengeActive('Metal') || challengeActive('Transmute');
	const hasNotVoidFarmed = MODULES.mapFunctions.hasVoidFarmed !== getTotalPortals() + '_' + game.global.world;
	const shouldHitsSurvived = defaultSettings.hitsSurvived && defaultSettings.hitsSurvived > 0 && defaultSettings.hitsSurvived > hdStats.hitsSurvivedVoid;
	const shouldHDFarm = defaultSettings.hdRatio && defaultSettings.hdRatio > 0 && defaultSettings.hdRatio < hdStats.vhdRatioVoid;

	if (shouldMap && defaultSettings.voidFarm && !skipFarmChallenges && hasNotVoidFarmed && (shouldHitsSurvived || shouldHDFarm)) {
		if (!mapSettings.voidFarm && getPageSetting('autoMaps')) {
			debug(`${mapName} (z${game.global.world}c${game.global.lastClearedCell + 2}) farming stats before running void maps.`, 'map_Details');
		}
		return hdFarm(false, true, true);
	}

	const stackedMaps = Fluffy.isRewardActive('void') ? countStackedVoidMaps() : 0;
	const status = `Void Maps: ${game.global.totalVoidMaps}${stackedMaps ? ` (${stackedMaps} stacked)` : ''} remaining`;

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, null, null, null, null, null);
		resetMapVars();
		if (mapSettings.portalAfterVoids) {
			const heHrSettings = ['Helium Per Hour', 'Radon Per Hour', '1'];
			const portalType = getPageSetting('autoPortal', game.global.universe);
			if (heHrSettings.includes(portalType)) MODULES.mapFunctions.afterVoids = true;
			autoPortalCheck(game.global.world);
		}
	}

	Object.assign(farmingDetails, {
		shouldRun: shouldMap,
		mapName: mapName,
		mapLevel: game.global.world,
		jobRatio: setting.jobratio,
		autoLevel: false,
		repeat: false,
		status: status,
		settingIndex: settingIndex,
		priority: setting.priority,
		voidHitsSurvived: true,
		boneChargeUsed: mapSettings.boneChargeUsed,
		voidHDIndex: mapSettings.voidHDIndex || settingIndex,
		dropdown: mapSettings.dropdown,
		dropdown2: mapSettings.dropdown2,
		voidTrigger: mapSettings.voidTrigger,
		portalAfterVoids: mapSettings.portalAfterVoids
	});

	return farmingDetails;
}

function mapBonus(lineCheck) {
	const mapName = 'Map Bonus';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	const settingName = 'mapBonusSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	if (defaultSettings === null) return farmingDetails;

	const settingIndex = _findSettingsIndexMapBonus(settingName, baseSettings);

	const settingAffix = trimpStats.isC3 ? 'C2' : trimpStats.isDaily ? 'Daily' : '';
	const spireCheck = isDoingSpire() && getPageSetting('spireMapBonus' + settingAffix) && !_berserkDisableMapping() && !_noMappingChallenges(undefined, true);
	if (!spireCheck && !defaultSettings.active) return farmingDetails;

	const setting = spireCheck ? _mapBonusSpireSetting(defaultSettings) : settingIndex ? baseSettings[settingIndex] : undefined;
	if (lineCheck) return setting;

	if (setting) Object.assign(farmingDetails, _runMapBonus(setting, mapName, settingIndex, spireCheck));

	//Done outside of _runMapBonus as that won't get run if we're above the set map bonus value.
	if (mapSettings.mapName === mapName && (game.global.mapBonus >= mapSettings.mapRepeats || !farmingDetails.shouldRun)) {
		mappingDetails(mapName, mapSettings.mapLevel, mapSettings.special);
		resetMapVars();
	}
	return farmingDetails;
}

function _findSettingsIndexMapBonus(settingName, baseSettings) {
	let settingIndex = null;
	if (!baseSettings[0].active) return settingIndex;

	for (let y = 1; y < baseSettings.length; y++) {
		const currSetting = baseSettings[y];
		const world = currSetting.world;
		if (currSetting.hdRatio > 0 && hdStats.hdRatio < currSetting.hdRatio) continue;
		if (shouldSkipSetting(currSetting, world, settingName)) continue;
		settingIndex = y;
	}
	return settingIndex;
}

function _mapBonusSpireSetting(defaultSettings) {
	const isSettingsEmpty = Object.keys(defaultSettings).length === 1;

	return {
		jobratio: isSettingsEmpty ? '1,1,2' : defaultSettings.jobratio,
		autoLevel: true,
		level: 0,
		special: isSettingsEmpty ? 'lmc' : defaultSettings.special,
		repeat: 10,
		priority: Infinity
	};
}

function _runMapBonus(setting, mapName, settingIndex, spireCheck) {
	const { repeat: repeatCounter, jobratio: jobRatio, special, autoLevel, level, priority } = setting;
	const mapSpecial = special !== '0' ? getAvailableSpecials(special) : '0';
	const minLevel = game.global.universe === 1 ? 0 - getPerkLevel('Siphonology') : 0;
	const mapLevel = autoLevel ? autoLevelCheck(mapName, mapSpecial) : level;

	if (mapLevel < minLevel) return {};

	const shouldMap = repeatCounter > game.global.mapBonus;
	const repeat = game.global.mapBonus >= repeatCounter - 1;
	const status = `${spireCheck ? 'Spire ' : ''}Map Bonus: ${game.global.mapBonus}/${repeatCounter}`;

	return {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel,
		jobRatio,
		special: mapSpecial,
		mapRepeats: repeatCounter,
		repeat: !repeat,
		status,
		settingIndex,
		priority
	};
}

function mapFarm(lineCheck) {
	const mapName = 'Map Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	const settingName = 'mapFarmSettings';
	const baseSettings = getPageSetting(settingName);
	if (!baseSettings) return farmingDetails;

	const defaultSettings = baseSettings[0];
	if (!defaultSettings || !defaultSettings.active) return farmingDetails;

	const dailyAddition = dailyOddOrEven();
	const settingIndex = findSettingsIndex(settingName, baseSettings, mapName, dailyAddition);

	const setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting) Object.assign(farmingDetails, _runMapFarm(setting, mapName, settingName, settingIndex));

	return farmingDetails;
}

function _runMapFarm(setting, mapName, settingName, settingIndex) {
	const mapSpecial = getAvailableSpecials(setting.special);
	const mapLevel = setting.autoLevel ? autoLevelCheck(mapName, mapSpecial) : setting.level;
	let repeatCounter = Number(setting.repeat) === -1 ? Infinity : Number(setting.repeat);
	if (isNaN(repeatCounter)) repeatCounter = setting.repeat;
	const repeatNumber = repeatCounter === Infinity ? '∞' : repeatCounter;
	const jobRatio = setting.jobratio;
	const shouldAtlantrimp = setting.atlantrimp && game.mapUnlocks.AncientTreasure.canRunOnce;
	const gather = setting.gather;
	const mapType = setting.mapType;

	if (setting.mapType === 'Farm Time') {
		const value = game.global.universe === 2 ? 'valueU2' : 'value';
		const userSetting = game.global.addonUser.mapData.mapFarmSettings[value][setting.row];
		if (!userSetting.zone || userSetting.zone !== game.global.world) {
			userSetting.zone = game.global.world;
			userSetting.timer = getGameTime() - game.global.zoneStarted;
		}
	}

	const [repeatCheck, status] = _getMapFarmActions(mapType, setting, repeatNumber);

	if (mapType !== 'Map Count') {
		if (typeof repeatCounter === 'string' && repeatCounter.includes(':')) {
			repeatCounter = repeatCounter.split(':').reduce((acc, time) => 60 * acc + +time);
		} else {
			repeatCounter = -Infinity;
		}
	}

	const shouldMap = (() => {
		if (repeatCounter === -Infinity) return false;
		if (mapType === 'Daily Reset') return repeatCounter < repeatCheck;
		return repeatCounter > repeatCheck;
	})();

	//Marking setting as complete if we've run enough maps.
	if (mapSettings.mapName === mapName && (mapType === 'Daily Reset' ? repeatCheck <= repeatCounter : repeatCheck >= repeatCounter)) {
		mappingDetails(mapName, mapLevel, mapSpecial);
		resetMapVars(setting, settingName);
		if (shouldAtlantrimp) _runUniqueMap(getAncientTreasureName());
	}

	const repeat = repeatCheck + 1 === repeatCounter;

	return {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel: setting.autoLevel,
		jobRatio,
		special: mapSpecial,
		mapType,
		mapRepeats: repeatCounter,
		gather,
		ancientTreasure: shouldAtlantrimp,
		repeat: !repeat,
		status,
		settingIndex,
		priority: setting.priority
	};
}

function _getMapFarmActions(mapType, setting, repeatNumber) {
	const timeBasedActions = ['Daily Reset', 'Zone Time', 'Farm Time', 'Portal Time', 'Skele Spawn'];
	const value = game.global.universe === 2 ? 'valueU2' : 'value';
	const userSetting = game.global.addonUser.mapData.mapFarmSettings[value][setting.row];
	const gameTimer = getGameTime();

	const timeBasedAction = () => {
		const repeatCheck = {
			'Daily Reset': updateDailyClock(true)
				.split(':')
				.reduce((acc, time) => 60 * acc + +time),
			'Zone Time': (gameTimer - game.global.zoneStarted) / 1000,
			'Farm Time': (gameTimer - game.global.zoneStarted - userSetting.timer) / 1000,
			'Portal Time': (gameTimer - game.global.portalTime) / 1000,
			'Skele Spawn': (gameTimer - game.global.lastSkeletimp) / 1000
		}[mapType];

		const status = mapType === 'Daily Reset' ? `${mapType}: ${setting.repeat} / ${updateDailyClock(true)}` : `${mapType}: ${formatSecondsAsClock(repeatCheck, 4 - setting.repeat.split(':').length)} / ${setting.repeat}`;
		return [repeatCheck, status];
	};

	const mapCountAction = () => {
		const repeatCheck = game.global.mapRunCounter;
		const status = `${mapType}: ${repeatCheck}/${repeatNumber}`;
		return [repeatCheck, status];
	};

	return timeBasedActions.includes(mapType) ? timeBasedAction() : mapCountAction();
}

function tributeFarm(lineCheck) {
	const mapName = 'Tribute Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (game.buildings.Tribute.locked && game.jobs.Meteorologist.locked) return farmingDetails;

	const settingName = 'tributeFarmSettings';
	const baseSettings = getPageSetting(settingName);
	if (!baseSettings) return farmingDetails;

	const defaultSettings = baseSettings[0];
	if (!defaultSettings || !defaultSettings.active) return farmingDetails;

	const dailyAddition = dailyOddOrEven();
	const settingIndex = findSettingsIndex(settingName, baseSettings, mapName, dailyAddition);

	const setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting) Object.assign(farmingDetails, _runTributeFarm(setting, mapName, settingName, settingIndex));

	return farmingDetails;
}

function _runTributeFarm(setting, mapName, settingName, settingIndex) {
	const mapSpecial = getAvailableSpecials('lsc', true);
	const jobRatio = setting.jobratio;
	const biome = getBiome(null, 'Sea');
	const shouldAtlantrimp = setting.atlantrimp && game.mapUnlocks.AncientTreasure.canRunOnce;
	let tributeGoal = game.buildings.Tribute.locked === 1 ? 0 : setting.tributes;
	let meteorologistGoal = game.jobs.Meteorologist.locked === 1 ? 0 : setting.mets;
	const mapLevel = setting.autoLevel ? autoLevelCheck(mapName, mapSpecial) : setting.level;
	let totalCost = 0;

	if (setting.mapType === 'Map Count') {
		[tributeGoal, meteorologistGoal] = _tributeFarmCalculateGoal(mapLevel, mapSpecial, jobRatio, tributeGoal, meteorologistGoal);
	}

	const shouldMap = tributeGoal > game.buildings.Tribute.purchased || meteorologistGoal > game.jobs.Meteorologist.owned;

	if (shouldMap && tributeGoal > game.buildings.Tribute.purchased && !getPageSetting('buildingsType')) _buyTribute();

	//Figuring out if we have enough resources to run Atlantrimp when setting is enabled.
	if (shouldAtlantrimp && shouldMap) {
		totalCost = _tributeFarmShouldAncientTreasure(mapSpecial, jobRatio, mapLevel, tributeGoal, meteorologistGoal);
	}

	//Recycles map if we don't need to finish it for meeting the tribute/meteorologist requirements
	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, mapLevel, mapSpecial, tributeGoal, meteorologistGoal);
		resetMapVars(setting, settingName);
		if (game.global.mapsActive) recycleMap_AT();
	}

	const status = tributeGoal > game.buildings.Tribute.owned ? `Tribute Farm: ${game.buildings.Tribute.owned}/${tributeGoal}` : `Meteorologist Farm: ${game.jobs.Meteorologist.owned}/${meteorologistGoal}`;

	return {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel: setting.autoLevel,
		jobRatio,
		special: mapSpecial,
		biome,
		shouldTribute: tributeGoal > game.buildings.Tribute.purchased,
		tribute: tributeGoal,
		shouldMeteorologist: meteorologistGoal > game.jobs.Meteorologist.owned,
		meteorologist: meteorologistGoal,
		ancientTreasure: shouldAtlantrimp,
		buyBuildings: setting.buildings,
		totalCost: totalCost,
		repeat: true,
		status: status,
		settingIndex,
		priority: setting.priority
	};
}

function _tributeFarmCalculateGoal(mapLevel, mapSpecial, jobRatio, tributeGoal, meteorologistGoal) {
	if (mapSettings.tribute || mapSettings.meteorologist) return [mapSettings.tribute, mapSettings.meteorologist];

	const lootMult = decayLootMult(tributeGoal + meteorologistGoal);
	const calculateGoal = (goal, item, isJob = false) => {
		if (goal === 0) return goal;
		const foodEarned = game.resources.food.owned + resourcesFromMap('food', mapSpecial, jobRatio, mapLevel, goal) * lootMult;
		goal = item[isJob ? 'owned' : 'purchased'] + calculateMaxAfford_AT(item, !isJob, false, isJob, false, 1, foodEarned);

		return goal;
	};

	tributeGoal = calculateGoal(tributeGoal, game.buildings.Tribute);
	meteorologistGoal = calculateGoal(meteorologistGoal, game.jobs.Meteorologist, true);

	return [tributeGoal, meteorologistGoal];
}

function _tributeFarmShouldAncientTreasure(mapSpecial, jobRatio, mapLevel, tributeGoal, meteorologistGoal) {
	let totalCost = 0;
	if (game.global.world < 33 || (game.global.world === 33 && game.global.lastClearedCell + 2 <= 50)) return totalCost;
	const calculateItemCost = ({ goal, current, baseCost, increment }) => {
		const numToPurchase = goal - current;
		if (numToPurchase > 0) {
			const currentCost = Math.pow(increment, current) * baseCost;
			return (currentCost * (1 - Math.pow(increment, numToPurchase))) / (1 - increment);
		}
		return 0;
	};

	const tributeConfig = {
		goal: tributeGoal,
		current: game.buildings.Tribute.purchased,
		baseCost: 10000,
		increment: 1.05
	};

	const meteorologistConfig = {
		goal: meteorologistGoal,
		current: game.jobs.Meteorologist.owned,
		baseCost: game.jobs.Meteorologist.cost.food[0],
		increment: game.jobs.Meteorologist.cost.food[1]
	};

	const tributeCost = calculateItemCost(tributeConfig);
	const metCost = calculateItemCost(meteorologistConfig);

	totalCost = tributeCost + metCost;
	const isFoodExceeded = totalCost > game.resources.food.max * (1 + getPerkModifier('Packrat') * getPerkLevel('Packrat'));
	if (isFoodExceeded) totalCost += game.buildings.Barn.cost.food();

	//Figuring out how much Food we'd farm in the time it takes to run Atlantrimp. Seconds is avg of 5x caches (20s per), 4x chronoimps (5s per), 1x jestimp (45s)
	let resourceSeconds = (mapSpecial === 'lsc' ? 20 : mapSpecial === 'ssc' ? 10 : 0) * 5;
	if (game.unlocks.imps.Tauntimp) resourceSeconds += 45;
	if (game.unlocks.imps.Chronoimp) resourceSeconds += 20;

	const resourceFarmed = scaleToCurrentMap_AT(simpleSeconds_AT('food', resourceSeconds, jobRatio), false, true, mapLevel);
	const totalCostExceedsFarm = totalCost > game.resources.food.owned + resourceFarmed;
	const ownedFoodExceedsHalfCost = game.resources.food.owned > totalCost / 2;

	if (totalCostExceedsFarm && ownedFoodExceedsHalfCost) {
		_runUniqueMap(getAncientTreasureName());
	}
	return totalCost;
}

function smithyFarm(lineCheck) {
	const mapName = 'Smithy Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (game.buildings.Smithy.locked || challengeActive('Transmute') || challengeActive('Pandemonium')) return farmingDetails;

	const settingName = 'smithyFarmSettings';
	const baseSettings = getPageSetting(settingName);
	if (!baseSettings) return farmingDetails;

	const defaultSettings = baseSettings[0];
	if (!defaultSettings || (!defaultSettings.active && !challengeActive('Quest'))) return farmingDetails;

	const smithyQuest = getCurrentQuest() === 10;
	if (challengeActive('Quest') && getPageSetting('quest') && !smithyQuest && !(game.global.world >= getPageSetting('questSmithyZone') && defaultSettings.active)) return farmingDetails;

	const dailyAddition = dailyOddOrEven();
	const settingIndex = findSettingsIndex(settingName, baseSettings, mapName, dailyAddition);

	const setting = smithyQuest ? _smithyFarmQuestSetting() : settingIndex ? baseSettings[settingIndex] : undefined;
	if (lineCheck) return setting;

	if (setting) Object.assign(farmingDetails, _runSmithyFarm(setting, mapName, settingName, settingIndex));

	return farmingDetails;
}

function _smithyFarmQuestSetting() {
	return {
		autoLevel: true,
		level: 0,
		special: '0',
		priority: 0,
		mapType: 'Map Count',
		repeat: getPageSetting('questSmithyMaps'),
		runningQuest: true
	};
}

function _smithyFarmCalculateGoal(setting, mapLevel, smithyGoal) {
	if (mapSettings.smithies) return mapSettings.smithies;

	const totalMaps = smithyGoal;
	const mapTime = totalMaps * 25 + (totalMaps > 4 ? Math.floor(totalMaps / 5) * 45 : 0);
	const costMult = game.buildings.Smithy.cost.gems[1];
	const lootMult = decayLootMult(totalMaps);

	const woodBase = scaleToCurrentMap_AT(simpleSeconds_AT('wood', 1, '0,1,0'), false, true, mapLevel);
	const metalBase = scaleToCurrentMap_AT(simpleSeconds_AT('metal', 1, '0,0,1'), false, true, mapLevel);
	const woodEarned = woodBase * mapTime * lootMult;
	const metalEarned = metalBase * mapTime * lootMult;

	const woodSmithies = game.buildings.Smithy.purchased + getMaxAffordable(Math.pow(costMult, game.buildings.Smithy.owned) * game.buildings.Smithy.cost.wood[0], game.resources.wood.owned + woodEarned, costMult, true);
	const metalSmithies = game.buildings.Smithy.purchased + getMaxAffordable(Math.pow(costMult, game.buildings.Smithy.owned) * game.buildings.Smithy.cost.metal[0], game.resources.metal.owned + metalEarned, costMult, true);

	if (woodSmithies > 0 && metalSmithies > 0) {
		const smithyCount = Math.min(woodSmithies, metalSmithies);
		const woodCost = getBuildingItemPrice(game.buildings.Smithy, 'wood', false, smithyCount - game.buildings.Smithy.purchased);
		const metalCost = getBuildingItemPrice(game.buildings.Smithy, 'metal', false, smithyCount - game.buildings.Smithy.purchased);
		const woodMapCount = Math.floor((woodCost - game.resources.wood.owned) / (woodBase * 34));
		const metalMapCount = Math.floor((metalCost - game.resources.metal.owned) / (metalBase * 34));
		smithyGoal = woodMapCount + metalMapCount > smithyGoal ? smithyCount - 1 : smithyCount;
	} else {
		smithyGoal = 1;
	}

	if (setting.runningQuest && smithyGoal > game.buildings.Smithy.purchased) {
		smithyGoal = game.buildings.Smithy.purchased + 1;
	}

	return smithyGoal;
}

function _runSmithyFarm(setting, mapName, settingName, settingIndex) {
	let shouldMap = false;
	let mapSpecial = getAvailableSpecials('lmc', true);
	const mapLevel = setting.autoLevel ? autoLevelCheck(mapName, mapSpecial) : setting.level;
	let smithyGoal = setting.repeat;
	let biome = getBiome();
	let jobRatio = [0, 0, 0, 0];
	let gather = 'metal';
	let resourceGoal = 0;

	const resources = ['gems', 'wood', 'metal'];
	const farmStatus = { gems: false, wood: false, metal: false };
	const biomes = { gems: 'Sea', wood: 'Forest', metal: 'Mountain' };
	const specials = { gems: 'lsc', wood: 'lwc', metal: 'lmc' };
	const jobRatios = { gems: [1, 0, 0, 0], wood: [0, 1, 0, 0], metal: [0, 0, 1, 0] };
	const gatherType = { gems: 'food', wood: 'wood', metal: 'metal' };

	if (setting.mapType === 'Map Count' && smithyGoal !== 0) {
		smithyGoal = _smithyFarmCalculateGoal(setting, mapLevel, smithyGoal);
	}

	if (smithyGoal > game.buildings.Smithy.purchased) {
		resources.forEach((resource) => {
			const smithyCost = getBuildingItemPrice(game.buildings.Smithy, resource, false, smithyGoal - game.buildings.Smithy.purchased);
			if (smithyCost > game.resources[resource].owned) {
				farmStatus[resource] = true;
				shouldMap = true;

				mapSpecial = getAvailableSpecials(specials[resource], true);
				biome = getBiome(null, biomes[resource]);
				if (['lc', 'hc'].indexOf(mapSpecial) !== -1) jobRatio[resources.indexOf(resource)] = 1;
				else jobRatio = jobRatios[resource];
				resourceGoal = `${prettify(smithyCost)} ${resource}.`;
				gather = gatherType[resource];
			}
		});
	}

	if (farmStatus.gems && !game.buildings.Tribute.purchased) {
		biome = getBiome('gems', 'Depths');
		if (jobRatio[1] !== 0 || jobRatio[2] !== 0) jobRatio[0] = 0;
	}

	jobRatio = jobRatio.toString();

	//Overrides to purchase smithies under the following circumstances
	//1. If the user has AT AutoStructure OR AT AutoStructure Smithy setting disabled OR running Hypothermia.
	if ((!getPageSetting('buildingsType') || !getPageSetting('buildingSettingsArray').Smithy.enabled || challengeActive('Hypothermia')) && shouldMap && smithyGoal > game.buildings.Smithy.purchased && canAffordBuilding('Smithy', false, false, false, false, 1)) {
		buyBuilding('Smithy', true, true, 1);
	}

	if (mapSettings.mapName === mapName) {
		const mapBonus = game.global.mapsActive ? getCurrentMapObject().bonus : undefined;

		if (mapBonus && getPageSetting('autoMaps')) {
			const index = ['sc', 'wc', 'mc'].indexOf(mapBonus.slice(1));
			const mapProg = (getCurrentMapCell().level - 1) / getCurrentMapObject().size;
			const mappingLength = Number(game.global.mapRunCounter + mapProg).toFixed(2);

			if (!farmStatus[resources[index]]) {
				MODULES.maps.mapRepeatsSmithy[index] = Number(mappingLength);
				recycleMap_AT();
			}
		}
	}

	if (!shouldMap) {
		if (mapSettings.mapName === mapName) mappingDetails(mapName, mapLevel, mapSpecial, smithyGoal);
		resetMapVars(setting, settingName);
		if (setting.meltingPoint && game.mapUnlocks.SmithFree.canRunOnce) _runUniqueMap('Melting Point');
	}

	const status = `Smithy Farming for ${resourceGoal}`;

	return {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel: setting.autoLevel,
		jobRatio,
		special: mapSpecial,
		biome,
		gather,
		smithies: smithyGoal,
		gemFarm: farmStatus.gems,
		repeat: true,
		status,
		settingIndex,
		priority: setting.priority
	};
}

function worshipperFarm(lineCheck) {
	const mapName = 'Worshipper Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (game.jobs.Worshipper.locked) return farmingDetails;

	const settingName = 'worshipperFarmSettings';
	const baseSettings = getPageSetting(settingName);
	if (!baseSettings) return farmingDetails;

	const defaultSettings = baseSettings[0];
	if (!defaultSettings || !defaultSettings.active) return farmingDetails;

	const dailyAddition = dailyOddOrEven();
	const settingIndex = findSettingsIndex(settingName, baseSettings, mapName, dailyAddition);

	const setting = settingIndex ? baseSettings[settingIndex] : undefined;
	if (lineCheck) return setting;

	if (setting) Object.assign(farmingDetails, _runWorshipperFarm(setting, mapName, settingName, settingIndex, defaultSettings));

	return farmingDetails;
}

function _runWorshipperFarm(setting, mapName, settingName, settingIndex, defaultSettings) {
	const { worshipper: worshipperGoal, jobratio: jobRatio, autoLevel, priority } = setting;
	const mapSpecial = getAvailableSpecials('lsc', true);
	const cacheTime = mapSpecial === 'lsc' ? 20 : 10;
	const biome = getBiome(null, 'Sea');
	const worshippersOwned = game.jobs.Worshipper.owned;
	const mapLevel = setting.autoLevel ? autoLevelCheck(mapName, mapSpecial) : setting.level;

	const checkShouldSkip = defaultSettings.shipSkipEnabled && worshippersOwned !== 50;
	const skipIfAbove = game.jobs.Worshipper.getCost() * defaultSettings.shipskip;
	const shouldSkip = checkShouldSkip && skipIfAbove > scaleToCurrentMap_AT(simpleSeconds_AT('food', cacheTime, jobRatio), false, true, mapLevel);
	const shouldMap = worshippersOwned !== 50 && worshipperGoal > worshippersOwned;

	if ((mapSettings.mapName === mapName && !shouldMap) || shouldSkip) {
		if (shouldSkip) debug(`Skipping Worshipper farming on zone ${game.global.world} as 1 ${mapSpecial} map doesn't provide ${defaultSettings.shipskip} or more Worshippers. Evaluate your map settings if you want to farm here`, 'map_Skip');
		else mappingDetails(mapName, mapLevel, mapSpecial);
		resetMapVars(setting, settingName);
	}

	const status = `Worshipper Farm: ${worshippersOwned}/${worshipperGoal}`;

	return {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel,
		jobRatio,
		special: mapSpecial,
		biome,
		worshipper: worshipperGoal,
		repeat: true,
		status,
		settingIndex,
		priority,
		gather: 'food'
	};
}

// Daily (bloodthirst), Balance, Unbalance & Storm Destacking
function mapDestacking(lineCheck) {
	const mapName = 'Destacking';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if ((challengeActive('Balance') || challengeActive('Unbalance')) && !getPageSetting('balance')) return farmingDetails;
	if (challengeActive('Daily') && (!getPageSetting('bloodthirstDestack') || typeof game.global.dailyChallenge.bloodthirst === 'undefined')) return farmingDetails;
	if (challengeActive('Storm') && !getPageSetting('storm')) return farmingDetails;

	const mapLevel = -(game.global.world - 6);
	const mapSpecial = getAvailableSpecials('fa');
	let shouldMap = false;
	let destackValue = 0;

	if (challengeActive('Balance') || challengeActive('Unbalance')) {
		const challenge = challengeActive('Balance') ? 'Balance' : 'Unbalance';
		const challengeStacks = game.challenges[challenge].balanceStacks;
		const balanceHD = getPageSetting('balanceDestack') > 0 ? getPageSetting('balanceDestack') : Infinity;
		const balanceZone = getPageSetting('balanceZone') > 0 ? getPageSetting('balanceZone') : Infinity;
		const balanceStacks = getPageSetting('balanceStacks') > 0 ? getPageSetting('balanceStacks') : Infinity;
		shouldMap = game.global.world >= balanceZone && (challengeStacks >= balanceStacks || (getPageSetting('balanceImprobDestack') && game.global.lastClearedCell + 2 === 100 && challengeStacks !== 0));
		if (hdStats.hdRatio > balanceHD && challengeStacks >= balanceStacks) shouldMap = true;
		if (shouldMap && gammaMaxStacks(true) - game.heirlooms.Shield.gammaBurst.stacks === 0) shouldMap = false;
		destackValue = challengeStacks;
	}

	if (challengeActive('Daily') && game.global.dailyChallenge.bloodthirst.stacks >= dailyModifiers.bloodthirst.getFreq(game.global.dailyChallenge.bloodthirst.strength) - 1) {
		shouldMap = true;
		destackValue = game.global.dailyChallenge.bloodthirst.stacks;
	}

	if (challengeActive('Storm')) {
		const stormZone = getPageSetting('stormZone') > 0 ? getPageSetting('stormZone') : Infinity;
		const stormStacks = getPageSetting('stormStacks') > 0 ? getPageSetting('stormStacks') : Infinity;
		shouldMap = game.global.world >= stormZone && game.challenges.Storm.beta >= stormStacks && game.challenges.Storm.beta !== 0;
		destackValue = game.challenges.Storm.beta;
	}

	const mapObj = game.global.mapsActive ? getCurrentMapObject() : {};

	if (game.global.mapsActive && mapObj.level === 6 && !shouldMap && destackValue === 0) {
		recycleMap_AT();
	}

	if (mapSettings.mapName === mapName && destackValue > 0) shouldMap = true;

	if (lineCheck && shouldMap) return (setting = { priority: 1 });

	const repeat = game.global.mapsActive && mapObj.size - mapObj.level + 1 >= destackValue;
	const status = `Destacking: ${destackValue} stacks remaining`;

	Object.assign(farmingDetails, {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel: false,
		special: mapSpecial,
		destack: destackValue,
		repeat: !repeat,
		status
	});

	return farmingDetails;
}

function prestigeClimb(lineCheck) {
	const mapName = 'Prestige Climb';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (challengeActive('Frugal') || _berserkDisableMapping() || _noMappingChallenges(true, true)) return farmingDetails;

	const runningMapology = challengeActive('Mapology') && getPageSetting('mapology');
	let targetPrestige = runningMapology ? getPageSetting('mapologyPrestige') : getPageSetting('prestigeClimb');

	if (game.global.sciLevel < 2 && challengeActive('Scientist')) {
		const upgradeList = sciUpgrades();
		const upgrades = ({ Megamace, Breastplate } = game.upgrades);
		if (upgradeList.includes('Megamace') && upgrades.Megamace.locked) targetPrestige = 'Megamace';
		if (upgradeList.includes('Breastplate') && upgrades.Megamace.locked) targetPrestige = 'Breastplate';
	}

	if (targetPrestige === 'Off') return farmingDetails;

	if (game.jobs.Explorer.locked) {
		farmingDetails.biome = 'Random';
		farmingDetails.mapSliders = [0, 9, 9];
	}

	/* If we're past the zone we want to farm for all prestiges in then set targetPrestige to the highest prestige available.
	equipsToGet will automatically change GambesOP to Breastplate if the Slow challenge has not yet been completed. */
	if (!runningMapology && getPageSetting('prestigeClimbZone') > 0 && game.global.world >= getPageSetting('prestigeClimbZone')) {
		targetPrestige = game.global.slowDone ? 'GambesOP' : 'Bestplate';
	}

	/* Figure out which prestige (if any) to farm for and how many equips to farm for & maps to run to get all of them */

	const onlyPerfect = getPageSetting('onlyPerfectMaps');
	let mapLevel = 0;
	let mapSpecial = getAvailableSpecials('p');
	let simulateMap = _simulateSliders(game.global.world + mapLevel, mapSpecial, null, [9, 9, 9], trimpStats.perfectMaps, onlyPerfect);
	let fragCost = mapCost(simulateMap.level - game.global.world, simulateMap.special, simulateMap.location, [simulateMap.sliders.loot, simulateMap.sliders.size, simulateMap.sliders.difficulty], simulateMap.perfect);

	while ((fragCost > game.resources.fragments.owned || !enoughHealth(simulateMap, 'avg')) && mapLevel > -(game.global.world - 6)) {
		mapLevel--;
		simulateMap = _simulateSliders(game.global.world + mapLevel, mapSpecial, null, [9, 9, 9], trimpStats.perfectMaps, onlyPerfect);
		fragCost = mapCost(simulateMap.level - game.global.world, simulateMap.special, simulateMap.location, [simulateMap.sliders.loot, simulateMap.sliders.size, simulateMap.sliders.difficulty], simulateMap.perfect);
	}

	const [prestigeToFarmFor, mapsToRun] = prestigesToGet(game.global.world + mapLevel, targetPrestige);

	while (prestigeToFarmFor > 0 && prestigeToFarmFor === prestigesToGet(game.global.world + mapLevel - 1, targetPrestige)[0]) {
		mapLevel--;
	}

	mapSpecial = simulateMap.special;

	let shouldMap = prestigeToFarmFor > 0;
	if (shouldMap && getPageSetting('prestigeClimbSkip')) shouldMap = 2 > prestigesUnboughtCount();

	const mapObject = getCurrentMapObject();
	const worldMapCost = mapCost(mapLevel, mapSpecial, null, [0, 0, 0], false);
	if (worldMapCost > game.resources.fragments.owned && (!game.global.mapsActive || (mapObject && mapObject.level < game.global.world + mapLevel))) {
		shouldMap = false;
	}

	if (shouldMap && game.global.universe === 1) {
		shouldMap = enoughHealth(simulateMap, 'avg');
	}

	if (lineCheck && shouldMap) return (setting = { priority: getPageSetting('prestigeClimbPriority') });

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, 0, mapSpecial);
		resetMapVars();
	}

	if (game.options.menu.mapLoot.enabled !== 1) toggleSetting('mapLoot');
	const status = `Prestige Climb: ${prestigeToFarmFor} items remaining`;

	const repeat = !(game.global.mapsActive && mapsToRun > (mapObject.bonus === 'p' && game.global.lastClearedMapCell !== mapObject.size - 2 ? 2 : 1));

	Object.assign(farmingDetails, {
		shouldRun: shouldMap,
		mapName,
		status,
		repeat: !repeat,
		mapLevel,
		autoLevel: true,
		special: mapSpecial,
		mapsToRun,
		targetPrestige
	});

	return farmingDetails;
}

function _raidingTargetPrestige(setting) {
	const mapologyActive = challengeActive('Mapology') && getPageSetting('mapology');
	const targetPrestige = mapologyActive ? getPageSetting('mapologyPrestige') : setting.prestigeGoal && setting.prestigeGoal !== 'All' ? atData.equipment[setting.prestigeGoal].upgrade : 'GamesOP';
	return targetPrestige;
}

function _raidingRaidZone(setting, mapName) {
	let raidZones = Number(setting.raidingzone);
	raidZones += mapName !== 'Bionic Raiding' ? setting.world : 0;

	if (setting.repeatevery !== 0 && game.global.world > setting.world) {
		const repeats = Math.floor((game.global.world - setting.world) / setting.repeatevery);
		raidZones += repeats > 0 ? setting.repeatevery * repeats : 0;
	}

	return raidZones;
}

function prestigeRaiding(lineCheck) {
	const mapName = 'Prestige Raiding';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	const settingName = 'raidingSettings';
	const baseSettings = getPageSetting(settingName);
	if (!baseSettings) return farmingDetails;

	const defaultSettings = baseSettings[0];
	if (!defaultSettings || !defaultSettings.active || getCurrentQuest() === 8) return farmingDetails;

	const settingIndex = findSettingsIndex(settingName, baseSettings, mapName);
	const setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting) Object.assign(farmingDetails, _runPrestigeRaiding(setting, mapName, settingIndex, defaultSettings));

	//Resetting variables and recycling the maps used
	if (mapSettings.mapName === mapName && !farmingDetails.shouldRun) {
		mappingDetails(mapName, mapSettings.mapLevel, mapSettings.special);
		if (defaultSettings.recycle && game.global.preMapsActive && mapSettings.prestigeMapArray) {
			mapSettings.prestigeMapArray.forEach((map) => recycleMap(getMapIndex(map)));
		}
		resetMapVars(baseSettings[mapSettings.settingIndex], settingName);
	}

	return farmingDetails;
}

function _runPrestigeRaiding(setting, mapName, settingIndex, defaultSettings) {
	let raidZones = _raidingRaidZone(setting, mapName);
	const targetPrestige = _raidingTargetPrestige(setting);
	const [equipsToFarm] = prestigesToGet(raidZones, targetPrestige);

	//Reduce raid zone to the value of the last prestige item we need to farm
	while (equipsToFarm === prestigesToGet(raidZones - 1, targetPrestige)[0]) raidZones--;

	const shouldMap = prestigesToGet(raidZones, targetPrestige)[0] > 0;
	const mapSpecial = getAvailableSpecials('p');

	let status = `Prestige Raiding: ${equipsToFarm} items remaining`;
	if (mapSettings.prestigeFragMapBought) status = `Prestige Frag Farm to: ${mapSettings.totalMapCost ? prettify(mapSettings.totalMapCost) : '∞'}`;

	const mapObj = getCurrentMapObject();
	const mapsToRun = game.global.mapsActive ? prestigesToGet(mapObj.level, targetPrestige)[1] : Infinity;
	const specialInMap = game.global.mapsActive && game.global.mapGridArray[mapObj.size - 2].special === targetPrestige;

	const repeat = !mapSettings.prestigeMapArray || mapsToRun <= 1 || (mapObj && mapObj.bonus === 'p' && mapsToRun <= 2) || (specialInMap && mapsToRun === 2);

	if (mapSettings.prestigeMapArray && mapSettings.prestigeMapArray[0] !== undefined && shouldMap) {
		const mapIndex = getMapIndex(mapSettings.prestigeMapArray[0]);
		const mapOwned = game.global.mapsOwnedArray[mapIndex] === undefined;
		const prestigesToGetZero = game.global.mapsActive && prestigesToGet(mapObj.level)[0] === 0;

		if (mapOwned || prestigesToGetZero) {
			debug(`There was an error with your purchased map(s). Restarting the raiding procedure.`, 'map_Details');
			resetMapVars();
		}
	}

	return {
		shouldRun: shouldMap,
		mapName,
		autoLevel: false,
		mapLevel: raidZones - game.global.world,
		recycle: defaultSettings.recycle,
		prestigeGoal: targetPrestige,
		fragSetting: Number(setting.raidingDropdown),
		raidzones: raidZones,
		special: mapSpecial,
		repeat: !repeat,
		status: status,
		settingIndex: settingIndex,
		incrementMaps: setting.incrementMaps,
		priority: setting.priority,
		totalMapCost: mapSettings.totalMapCost,
		mapSliders: mapSettings.mapSliders,
		prestigeMapArray: mapSettings.prestigeMapArray,
		prestigeFragMapBought: mapSettings.prestigeFragMapBought
	};
}

function prestigeRaidingMapping() {
	if (mapSettings.mapName !== 'Prestige Raiding') return;

	if (!mapSettings.totalMapCost) {
		const { cost, sliders } = prestigeTotalFragCost();
		mapSettings.totalMapCost = cost;
		mapSettings.mapSliders = sliders;
	}

	mapSettings.prestigeMapArray = mapSettings.prestigeMapArray || new Array(5);
	mapSettings.prestigeFragMapBought = mapSettings.prestigeFragMapBought || false;

	if (!mapSettings.prestigeMapArray || typeof mapSettings.prestigeMapArray[0] === 'undefined') {
		const enoughFragments = mapSettings.totalMapCost < game.resources.fragments.owned;
		mapSettings.prestigeFragMapBought = !enoughFragments;
		enoughFragments ? _handlePrestigeFragMapBought() : fragmentFarm(true);
	}

	if (!mapSettings.prestigeFragMapBought && game.global.preMapsActive) {
		_handlePrestigeMapBuying();
		_handlePrestigeMapRunning();
	}

	if (game.global.preMapsActive) runMap(false);
}

function _handlePrestigeMapBuying() {
	if (game.global.mapsOwnedArray.length >= 95) recycleBelow(true);
	if (mapSettings.prestigeMapArray[0] === undefined) {
		const mapsCanRun = challengeActive('Mapology') ? Math.min(5, game.challenges.Mapology.credits) : 5;
		for (let x = 0; x < mapsCanRun; x++) {
			if ((!mapSettings.incrementMaps && x > 0) || mapSettings.mapSliders[x] === undefined) break;
			_buyPrestigeMap(x);
		}
		mapSettings.prestigeMapArray = mapSettings.prestigeMapArray.filter((e) => e.replace(/(\r\n|\n|\r)/gm, ''));
	}
}

function _handlePrestigeFragMapBought() {
	if (mapSettings.prestigeFragMapBought) {
		if (game.global.repeatMap) repeatClicked();
		if (game.global.preMapsActive) {
			delete mapSettings.prestigeFragMapBought;
			MODULES.maps.fragmentFarming = false;
		}
	}
}

function _buyPrestigeMap(x) {
	const [plusLevel, special, biome, sliders, perfectMaps] = mapSettings.mapSliders[x];
	const mapLevel = mapSettings.raidzones - (plusLevel + game.global.world);

	if (prestigeMapHasEquips(mapLevel, mapSettings.raidzones, mapSettings.prestigeGoal)) {
		setMapSliders(plusLevel, special, biome, sliders, perfectMaps);

		if (updateMapCost(true) <= game.resources.fragments.owned) {
			buyMap();
			const purchasedMap = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1];
			mapSettings.prestigeMapArray[x] = purchasedMap.id;
			debug(`Prestige Raiding (z${game.global.world}) bought a level ${purchasedMap.level} map. Purchase #${x + 1}`, 'map_Details');
		}
	}
}

function _handlePrestigeMapRunning() {
	for (let x = mapSettings.prestigeMapArray.length - 1; x >= 0; x--) {
		const mapId = mapSettings.prestigeMapArray[x];
		const sliders = mapSettings.mapSliders[x];

		if (game.global.preMapsActive && prestigeMapHasEquips(mapSettings.raidzones - (sliders[0] + game.global.world), mapSettings.raidzones, mapSettings.prestigeGoal)) {
			if (mapId !== undefined) {
				_runPurchasedMap(mapId, x);
			} else {
				_restartRaidingProcedure();
			}
		}
	}
}

function _runPurchasedMap(mapId, x) {
	const purchasedMap = game.global.mapsOwnedArray[getMapIndex(mapId)];
	if (purchasedMap === undefined) {
		debug(`Prestige Raiding - Error with finding the purchased map. Skipping this map and moving on to the next one.`, 'map_Details');
		mapSettings.prestigeMapArray[x] = undefined;
	} else {
		debug(`Prestige Raiding (z${game.global.world}) running a level ${purchasedMap.level} map. Map #${mapSettings.prestigeMapArray.length - x}`, 'map_Details');
		selectMap(mapId);
		runMap(false);
	}
}

function _restartRaidingProcedure() {
	delete mapSettings.prestigeMapArray;
	delete mapSettings.totalMapCost;
	delete mapSettings.mapSliders;
	delete mapSettings.prestigeFragMapBought;
	debug(`Prestige Raiding - Error with finding the purchased map. Restarting the raiding procedure.`, 'map_Details');
}

function findLastBionicWithItems(bionicPool) {
	if (game.global.world < 115 || !bionicPool) return;
	const mapologyActive = challengeActive('Mapology') && getPageSetting('mapology');
	const targetPrestige = mapologyActive ? getPageSetting('mapologyPrestige') : mapSettings.mapName === 'Bionic Raiding' && mapSettings.prestigeGoal ? mapSettings.prestigeGoal : 'GambesOP';

	if (bionicPool.length <= 1) return bionicPool[0];

	bionicPool.sort((bionicA, bionicB) => bionicA.level - bionicB.level);
	const isExperienceActive = challengeActive('Experience') && getPageSetting('experience') && game.global.world > 600;
	const experienceEndBW = getPageSetting('experienceEndBW');
	const experienceEndLevel = experienceEndBW <= 0 ? Infinity : experienceEndBW;

	while (bionicPool.length > 1 && prestigesToGet(bionicPool[0].level, targetPrestige)[0] === 0) {
		if (isExperienceActive && bionicPool[0].level >= experienceEndLevel) break;
		bionicPool.shift();
	}

	return bionicPool[0];
}

function bionicRaiding(lineCheck) {
	const mapName = 'Bionic Raiding';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	const settingName = 'bionicRaidingSettings';
	const baseSettings = getPageSetting(settingName);
	if (!baseSettings) return farmingDetails;

	const defaultSettings = baseSettings[0];
	if (!defaultSettings || !defaultSettings.active) return farmingDetails;
	if (challengeActive('Experience') && game.global.world > 600 && getPageSetting('experience')) return farmingDetails;

	const settingIndex = findSettingsIndex(settingName, baseSettings, mapName);
	const setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting) Object.assign(farmingDetails, _runBionicRaiding(setting, mapName, settingIndex));

	if (mapSettings.mapName === mapName && !farmingDetails.shouldRun) {
		mappingDetails(mapName, 0);
		resetMapVars();
	}

	return farmingDetails;
}

function _runBionicRaiding(setting, mapName, settingIndex) {
	const unlockLevel = atData.uniqueMaps['Bionic Wonderland'].zone;
	if (!trimpStats.plusLevels && unlockLevel > game.global.world) return {};
	else if (trimpStats.plusLevels && unlockLevel > game.global.world + 10) return {};

	const map = game.global.mapsOwnedArray.find((map) => map.name.includes('Bionic Wonderland'));
	if (!map) return _obtainUniqueMap('Bionic Wonderland');

	const raidZones = _raidingRaidZone(setting, mapName);
	const targetPrestige = _raidingTargetPrestige(setting);

	const itemsRemaining = prestigesToGet(raidZones, targetPrestige)[0];
	const shouldMap = itemsRemaining > 0;

	const mapObject = getCurrentMapObject();
	const mapsToRun = game.global.mapsActive ? prestigesToGet(mapObject.level, targetPrestige)[1] : Infinity;
	const specialInMap = game.global.mapsActive && game.global.mapGridArray[mapObject.size - 2].special === targetPrestige;

	const status = `Raiding to BW${raidZones}: ${itemsRemaining} items remaining`;
	const repeat = game.global.mapsActive && (mapsToRun <= 1 || (specialInMap && mapsToRun === 2) || mapObject.location !== 'Bionic');

	return {
		shouldRun: shouldMap,
		mapName,
		repeat: !repeat,
		raidingZone: raidZones,
		status,
		settingIndex,
		prestigeGoal: targetPrestige,
		priority: setting.priority
	};
}

function bionicRaidingMapping(bionicPool) {
	if (!bionicPool) return false;
	if (!getPageSetting('autoMaps')) return false;

	if (!game.global.preMapsActive && !game.global.mapsActive) {
		mapsClicked(true);
		if (!game.global.preMapsActive) {
			mapsClicked(true);
		}
	}

	const checkExperienceZone = challengeActive('Experience') && game.global.world > 600 && getPageSetting('experience') ? getPageSetting('experienceEndBW') : 0;
	const experienceBW = checkExperienceZone ? getPageSetting('experienceEndBW') : 0;

	const raidingZone = checkExperienceZone && experienceBW > 0 ? experienceBW : mapSettings.raidingZone;
	const bionicToCheck = findLastBionicWithItems(bionicPool);

	if (game.global.preMapsActive) {
		selectMap(bionicToCheck.id);
	}

	if ((bionicToCheck.level >= raidingZone || bionicToCheck.level < raidingZone) && game.global.preMapsActive) {
		runMap();
	}
}

function toxicity(lineCheck) {
	const mapName = 'Toxicity';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Toxicity')) return farmingDetails;

	const settingName = 'toxicitySettings';
	const baseSettings = getPageSetting(settingName);
	if (!baseSettings) return farmingDetails;

	const defaultSettings = baseSettings[0];
	if (!defaultSettings || !defaultSettings.active) return farmingDetails;

	const settingIndex = findSettingsIndex(settingName, baseSettings, mapName);
	const setting = settingIndex ? baseSettings[settingIndex] : undefined;
	if (lineCheck) return setting;

	if (setting) Object.assign(farmingDetails, _runToxicity(setting, mapName, settingName, settingIndex));

	return farmingDetails;
}

function _runToxicity(setting, mapName, settingName, settingIndex) {
	const currentStacks = game.challenges.Toxicity.stacks;
	const stackGoal = setting.repeat > 1500 ? 1500 : setting.repeat;
	const mapSpecial = getAvailableSpecials(setting.special);
	const mapLevel = setting.autoLevel ? autoLevelCheck(mapName, mapSpecial) : setting.level;

	const shouldMap = stackGoal > currentStacks;

	let cellsToClear = 0;
	if (game.global.mapsActive) {
		cellsToClear = getCurrentMapObject().size - getCurrentMapCell().level;
		cellsToClear = Math.ceil(cellsToClear / maxOneShotPower(true));
	}

	const repeat = game.global.mapsActive && cellsToClear > stackGoal - currentStacks;
	const status = `Toxicity: ${currentStacks}/${stackGoal} stacks`;

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, mapLevel, mapSpecial);
		resetMapVars(setting, settingName);
		if (game.global.mapsActive) recycleMap_AT();
	}

	return {
		shouldRun: shouldMap,
		mapName: mapName,
		mapLevel: mapLevel,
		autoLevel: true,
		special: mapSpecial,
		repeat: !repeat,
		status: status,
		stackGoal: stackGoal,
		currentStacks: currentStacks,
		cellsToClear: cellsToClear,
		settingIndex: settingIndex,
		priority: setting.priority
	};
}

function experience(lineCheck) {
	let mapName = 'Experience';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Experience') || !getPageSetting('experience')) return farmingDetails;

	const wonderStartZone = getPageSetting('experienceStartZone') >= 300 ? getPageSetting('experienceStartZone') : Infinity;
	const mapSpecial = trimpStats.hyperspeed2 ? '0' : 'fa';
	const mapLevel = 0;

	const shouldWonderFarm = game.global.world >= wonderStartZone && game.global.world >= game.challenges.Experience.nextWonder;
	const shouldEndChallenge = game.global.world > 600 && game.global.world >= Math.max(601, getPageSetting('experienceEndZone'));

	const shouldMap = shouldWonderFarm || shouldEndChallenge;

	if (lineCheck && shouldMap) return (setting = { priority: Infinity });

	const status = `${mapName}: ${shouldWonderFarm ? 'Farming Wonders' : 'Ending Challenge'}`;
	if (shouldEndChallenge) mapName = 'Bionic Raiding';

	const repeat = game.global.world < game.challenges.Experience.nextWonder;

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, mapLevel, mapSpecial);
		resetMapVars();
	}

	Object.assign(farmingDetails, {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel: true,
		special: mapSpecial,
		repeat: !repeat,
		status
	});

	return farmingDetails;
}

function wither(lineCheck) {
	let shouldMap = false;
	const mapName = 'Wither Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Wither') || !getPageSetting('wither') || !getPageSetting('witherFarm') || game.challenges.Wither.healImmunity > 0) return farmingDetails;
	const witherZones = getPageSetting('witherZones');
	if (witherZones.indexOf(game.global.world) >= 0) return farmingDetails;

	const mapSpecial = getAvailableSpecials('lmc', true);
	const mapLevel = autoLevelCheck(mapName, mapSpecial);
	const cell = game.global.lastClearedCell + 2;
	let equalityAmt,
		ourDmg,
		enemyHealth = false;

	//Checking if we can clear to the speedbook on the next zone.
	if (cell === 100 && witherZones.indexOf(game.global.world + 1) === -1) {
		let dmgBuff = 1;
		equalityAmt = equalityQuery('Snimp', game.global.world + 1, 60, 'world', 1, 'gamma', false, 4);

		if (canAffordCoordinationTrimps()) {
			dmgBuff = 1.25;
			equalityAmt = Math.max(0, equalityAmt - 2);
		}
		ourDmg = calcOurDmg('min', equalityAmt, false, 'world', 'never', 0, false) * dmgBuff;
		enemyHealth = calcEnemyHealthCore('world', game.global.world + 1, 60, 'Snimp', calcMutationStats(game.global.world + 1, 'health'));
		shouldMap = ourDmg * 4 < enemyHealth;
	}
	//Checking if we can clear current cell.
	else {
		const gammaToTrigger = gammaMaxStacks(true) - game.heirlooms.Shield.gammaBurst.stacks;
		const name = game.global.gridArray && game.global.gridArray[0] ? game.global.gridArray[cell - 1].name : undefined;
		equalityAmt = equalityQuery(name, game.global.world, cell, 'world', 1, 'gamma', false, 4);
		ourDmg = calcOurDmg('min', equalityAmt, false, 'world', 'never', 0, false);
		enemyHealth = calcEnemyHealthCore('world', game.global.world, cell, name, calcMutationStats(game.global.world, 'health'));
		shouldMap = ourDmg * (gammaToTrigger <= 1 ? MODULES.heirlooms.gammaBurstPct : 1) * 4 < enemyHealth;
	}

	if (lineCheck && shouldMap) return (setting = { priority: Infinity });

	const damageTarget = enemyHealth / 4;
	const status = `Wither Farm: Curr&nbsp;Dmg:&nbsp;${prettify(ourDmg)} Goal&nbsp;Dmg:&nbsp;${prettify(damageTarget)}`;

	Object.assign(farmingDetails, {
		shouldRun: shouldMap,
		mapLevel,
		autoLevel: true,
		special: mapSpecial,
		jobRatio: '0,0,1',
		damageTarget,
		repeat: true,
		status,
		equalityAmt
	});

	if (mapSettings.mapName === mapName && !farmingDetails.shouldRun) {
		mappingDetails(mapName, mapLevel, mapSpecial);
		resetMapVars();
	}

	return farmingDetails;
}

function quagmire(lineCheck) {
	const mapName = 'Quagmire Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Quagmire')) return farmingDetails;

	const settingName = 'quagmireSettings';
	const baseSettings = getPageSetting(settingName);
	if (!baseSettings) return farmingDetails;

	const defaultSettings = baseSettings[0];
	if (!defaultSettings || !defaultSettings.active) return farmingDetails;

	const settingIndex = findSettingsIndex(settingName, baseSettings, mapName);
	const setting = baseSettings[settingIndex];

	if (lineCheck) return setting;

	if (setting) Object.assign(farmingDetails, _runQuagmire(setting, mapName, settingName, settingIndex, baseSettings));

	return farmingDetails;
}

function _runQuagmire(setting, mapName, settingName, settingIndex, baseSettings) {
	let bogsToRun = 100;

	for (let i = 1; i < baseSettings.length; i++) {
		const currSetting = baseSettings[i];
		if (!currSetting.active || currSetting.world > game.global.world || (currSetting.world === game.global.world && currSetting.cell > game.global.lastClearedCell + 2)) continue;
		bogsToRun -= parseInt(currSetting.bogs);
	}

	const remainingBogs = game.challenges.Quagmire.motivatedStacks - bogsToRun;
	const shouldMap = game.challenges.Quagmire.motivatedStacks > bogsToRun;
	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName);
		resetMapVars(setting, settingName);
	}

	const repeat = game.global.mapsActive && (getCurrentMapObject().name !== 'The Black Bog' || remainingBogs === 1);
	const status = `Black Bogs: ${remainingBogs} remaining`;

	return {
		shouldRun: shouldMap,
		mapName,
		jobRatio: setting.jobratio,
		bogs: bogsToRun,
		repeat: !repeat,
		status,
		settingIndex,
		priority: setting.priority
	};
}

function quest(lineCheck) {
	const mapName = 'Quest';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};
	if (!challengeActive('Quest') || !getPageSetting('quest') || game.global.world < game.challenges.Quest.getQuestStartZone()) return farmingDetails;

	let shouldMap = getCurrentQuest();

	// If we're running a one shot quest and can one shot the enemy then disable questing.
	if (shouldMap === 7 && calcOurDmg('min', 0, false, 'world', 'never') > calcEnemyHealthCore('world', game.global.world, 50, 'Turtlimp')) shouldMap = 0;
	// No Quest specific mapping necessary on shield break quests.
	if (shouldMap === 8) return farmingDetails;
	// Need to use Smithy Farm to do any smithy quests.
	if (shouldMap === 10) return smithyFarm();
	// Disable farming if enough maps have been farmed to meet the map cap criteria.
	if (MODULES.mapFunctions.questRun) shouldMap = 0;
	if (lineCheck && shouldMap) return (setting = { priority: shouldMap !== 7 ? 1 : Infinity });

	if (shouldMap) Object.assign(farmingDetails, _runQuest(shouldMap, mapName));

	if (mapSettings.mapName === mapName && !farmingDetails.shouldRun) {
		mappingDetails(mapName);
		resetMapVars();
		if (game.global.mapsActive) recycleMap_AT();
	}

	return farmingDetails;
}

function _runQuest(shouldMap, mapName) {
	const questMapTypes = {
		1: ['lsc', '1', 'Sea'],
		4: ['lsc', '1', 'Sea'],
		2: ['lwc', '0,1', 'Forest'],
		3: ['lmc', '0,0,1', 'Mountains'],
		7: ['lmc', '0,0,1', 'Mountains'],
		5: ['fa', '0,0,0,1'],
		default: ['fa', '1,1,1,0']
	};

	const questArray = questMapTypes[shouldMap] || questMapTypes.default;
	const [mapSpecial, jobRatio] = questArray;
	const questResource = game.challenges.Quest.resource;
	const mapLevel = autoLevelCheck(mapName, mapSpecial);
	const mapCap = getPageSetting('questMapCap') > 0 ? getPageSetting('questMapCap') : Infinity;

	if (mapSettings.mapName !== mapName && mapCap > 0 && [1, 2, 3, 4, 5].includes(shouldMap)) {
		const resourcesEarned = game.resources[questResource].owned + resourcesFromMap(questResource, mapSpecial, jobRatio, mapLevel, mapCap);
		shouldMap = game.challenges.Quest.questProgress >= resourcesEarned ? 0 : shouldMap;
	}
	// Stop farming for damage if we have run more than our allocated amount of maps.
	if (shouldMap === 7 && mapSettings.mapName === mapName && game.global.mapRunCounter >= mapCap) {
		shouldMap = 0;
		MODULES.mapFunctions.questRun = true;
	}

	const repeat = (shouldMap === 7 && game.global.mapRunCounter + 1 >= mapCap) || (shouldMap === 6 && (game.global.mapBonus >= 4 || (game.global.mapsActive && getCurrentMapObject().level - game.global.world < 0)));
	const status = `Questing: ${game.challenges.Quest.getQuestProgress()}`;

	return {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel: true,
		special: mapSpecial,
		resource: questResource,
		jobRatio,
		repeat: !repeat,
		status
	};
}

function archaeology(lineCheck) {
	const mapName = 'Archaeology Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Archaeology')) return farmingDetails;

	const settingName = 'archaeologySettings';
	const baseSettings = getPageSetting(settingName);
	if (!baseSettings) return farmingDetails;

	const defaultSettings = baseSettings[0];
	if (!defaultSettings || !defaultSettings.active) return farmingDetails;

	const settingIndex = findSettingsIndex(settingName, baseSettings, mapName);
	const setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting) Object.assign(farmingDetails, _runArchaeology(setting, mapName, settingName, settingIndex));

	return farmingDetails;
}

function _runArchaeology(setting, mapName, settingName, settingIndex) {
	const nextRelicCost = game.challenges.Archaeology.getNextCost();
	const relicString = setting.relics.split(',');
	const mapSpecial = getAvailableSpecials('lrc', true);
	const relicObj = game.challenges.Archaeology.points;
	const relicsToPurchase = [];
	const mapLevel = setting.autoLevel ? autoLevelCheck(mapName, mapSpecial) : setting.level;

	for (let item in relicString) {
		const relicName = game.challenges.Archaeology.getDefs()[relicString[item].slice(-1)];

		if (relicName === undefined) {
			return {
				shouldRun: false,
				mapName
			};
		}

		const relicToBuy = parseInt(relicString[item]);

		if (relicToBuy > relicObj[relicName]) {
			relicsToPurchase.push(relicString[item]);
		}
	}

	if (!game.options.menu.pauseGame.enabled && getPageSetting('autoMaps')) {
		while (relicsToPurchase.length > 0 && game.resources.science.owned > game.challenges.Archaeology.getNextCost()) {
			const relicName = game.challenges.Archaeology.getDefs()[relicsToPurchase[0].slice(-1)];
			const relicToBuy = parseInt(relicsToPurchase[0]);
			game.challenges.Archaeology.buyRelic(relicName + 'Relic', true);
			if (game.challenges.Archaeology.points[relicName] >= relicToBuy) relicsToPurchase.shift();
		}
	}

	let shouldMap = relicsToPurchase.length > 0;

	let canAffordNextRelic = false;
	if (shouldMap && setting.mapCap && setting.mapCap > 0) {
		const mapCap = mapSettings.mapName === mapName ? setting.mapCap - game.global.mapRunCounter : setting.mapCap;
		if (typeof mapSettings.canAffordNextRelic !== 'undefined' && nextRelicCost === mapSettings.nextRelicCost) {
			canAffordNextRelic = mapSettings.canAffordNextRelic;
		} else {
			canAffordNextRelic = game.resources.science.owned + resourcesFromMap('science', mapSpecial, setting.jobratio, mapLevel, mapCap) > nextRelicCost;
		}

		shouldMap = canAffordNextRelic;
	}

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, mapLevel, mapSpecial);
		resetMapVars(setting, settingName);
	}

	const repeat = false;
	const relicCost = setting.relics;
	const status = `Archaeology Farm: ${relicCost}`;

	return {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel: setting.autoLevel,
		special: mapSpecial,
		gather: 'science',
		jobRatio: setting.jobratio,
		relicString: setting.relics,
		canAffordNextRelic,
		nextRelicCost,
		relicsToPurchase,
		repeat: !repeat,
		status: status,
		settingIndex,
		priority: setting.priority
	};
}

function mayhem(lineCheck) {
	const mapName = 'Mayhem Destacking';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Mayhem') || !getPageSetting('mayhem')) return farmingDetails;

	const destackHits = getPageSetting('mayhemDestack') > 0 ? getPageSetting('mayhemDestack') : Infinity;
	const destackZone = getPageSetting('mayhemZone') > 0 ? getPageSetting('mayhemZone') : Infinity;
	const mapSpecial = trimpStats.hyperspeed2 ? 'lmc' : 'fa';

	const shouldMap = game.challenges.Mayhem.stacks > 0 && (hdStats.hdRatio > destackHits || game.global.world >= destackZone);
	if (lineCheck && shouldMap) return (setting = { priority: 1 });
	const mapLevel = autoLevelCheck(mapName, mapSpecial);

	const repeat = game.challenges.Mayhem.stacks <= mapLevel + 1;
	const status = `Mayhem Destacking: ${game.challenges.Mayhem.stacks} remaining`;

	Object.assign(farmingDetails, {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel: true,
		special: mapSpecial,
		repeat: !repeat,
		status
	});

	if (mapSettings.mapName === mapName && !farmingDetails.shouldRun) {
		mappingDetails(mapName, mapLevel, mapSpecial);
		resetMapVars();
	}
	return farmingDetails;
}

function insanity(lineCheck) {
	const mapName = 'Insanity Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Insanity')) return farmingDetails;

	const settingName = 'insanitySettings';
	const baseSettings = getPageSetting(settingName);
	if (!baseSettings) return farmingDetails;

	const defaultSettings = baseSettings[0];
	if (!defaultSettings || !defaultSettings.active) return farmingDetails;

	const settingIndex = findSettingsIndex(settingName, baseSettings, mapName);
	const setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting) Object.assign(farmingDetails, _runInsanity(setting, mapName, settingName, settingIndex));

	return farmingDetails;
}

function _runInsanity(setting, mapName, settingName, settingIndex) {
	const mapSpecial = setting.special;
	const insanityGoal = Math.min(setting.insanity, game.challenges.Insanity.maxInsanity);
	let mapLevel = setting.level;

	if (setting.autoLevel) {
		mapLevel = setting.destack ? -(game.global.world - 6) : autoLevelCheck(mapName, mapSpecial);
	}

	const farmStacks = !setting.destack && insanityGoal > game.challenges.Insanity.insanity;
	const shouldDestack = setting.destack && game.challenges.Insanity.insanity > insanityGoal;
	const negativeLevel = setting.destack && mapLevel < 0 ? Math.abs(mapLevel) * 2 : mapLevel;

	const shouldMap = farmStacks || shouldDestack;

	const repeat = (farmStacks && game.challenges.Insanity.insanity + 1 >= insanityGoal) || (setting.destack && game.challenges.Insanity.insanity - negativeLevel <= insanityGoal);
	const status = `Insanity Farming: ${game.challenges.Insanity.insanity}/${insanityGoal}`;

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, mapLevel, mapSpecial, insanityGoal);
		resetMapVars(setting, settingName);
		if (game.global.mapsActive) recycleMap_AT(true);
	}

	return {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel: setting.autoLevel,
		special: mapSpecial,
		jobRatio: setting.jobratio,
		insanity: insanityGoal,
		repeat: !repeat,
		status,
		settingIndex,
		priority: setting.priority,
		negativeLevel
	};
}

function _insanityDisableUniqueMaps() {
	if (!challengeActive('Insanity')) return false;
	// A quick way to identify if we are running Insanity and when our first destacking zone is to enable below world level maps.
	// Need to have it setup to go through every setting to ensure we don't miss the first one after introducing the priority input.
	let destackZone = 0;
	const insanitySettings = getPageSetting('insanitySettings');
	if (insanitySettings[0].active && insanitySettings.length > 0) {
		for (let y = 1; y < insanitySettings.length; y++) {
			const setting = insanitySettings[y];
			if (!setting.active) continue;
			if (!setting.destack) continue;
			if (destackZone === 0 || destackZone > setting.world) destackZone = setting.world;
		}
	}

	return destackZone === 0 || game.global.world <= destackZone;
}

function berserk(lineCheck) {
	const mapName = 'Berserk';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Berserk') || !getPageSetting('berserk')) return farmingDetails;
	if (game.challenges.Berserk.weakened === 20) return farmingDetails;

	const mapLevel = -(game.global.world - 6);
	const mapSpecial = getAvailableSpecials('fa');

	const shouldMap = game.challenges.Berserk.frenzyStacks !== 25;

	if (lineCheck && shouldMap) return (setting = { priority: 0 });

	const stacksToObtain = 25 - game.challenges.Berserk.frenzyStacks;
	const repeat = game.global.mapsActive && getCurrentMapObject().size - getCurrentMapCell().level + 1 >= stacksToObtain;
	const status = `${mapName}: Obtaining Frenzy Stacks`;

	Object.assign(farmingDetails, {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel: false,
		special: mapSpecial,
		repeat: !repeat,
		status
	});

	return farmingDetails;
}

function pandemoniumDestack(lineCheck) {
	const mapName = 'Pandemonium Destacking';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Pandemonium') || !getPageSetting('pandemonium') || game.global.world < getPageSetting('pandemoniumZone')) return farmingDetails;

	const pandemonium = game.challenges.Pandemonium.pandemonium;
	const destackHits = getPageSetting('pandemoniumDestack') > 0 ? getPageSetting('pandemoniumDestack') : Infinity;
	const destackZone = getPageSetting('pandemoniumZone') > 0 ? getPageSetting('pandemoniumZone') : Infinity;

	if (destackHits === Infinity && destackZone === Infinity) return farmingDetails;

	const mapSpecial = trimpStats.hyperspeed2 ? 'lmc' : 'fa';
	const mapLevel = autoLevelCheck(mapName, mapSpecial);

	const shouldMap = pandemonium > 0 && (hdStats.hdRatio > destackHits || game.global.world >= destackZone);

	if (lineCheck && shouldMap) return (setting = { priority: 1 });

	const repeat = pandemonium - mapLevel < mapLevel;
	const status = `Pandemonium Destacking: ${pandemonium} remaining`;

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, mapLevel, mapSpecial);
		resetMapVars();
	}

	Object.assign(farmingDetails, {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel: true,
		special: mapSpecial,
		jobRatio,
		pandemonium,
		repeat: !repeat,
		status
	});

	return farmingDetails;
}

function pandemoniumEquipmentCheck(cacheGain) {
	const equipArray = { ...atData.equipment };

	const equipsToPurchaseBaseline = {
		attack: {
			name: '',
			cost: Infinity,
			resourceSpendingPct: 1,
			stat: 'attack',
			zoneGo: true,
			equipCap: Infinity
		},
		health: {
			name: '',
			cost: Infinity,
			resourceSpendingPct: 1,
			stat: 'health',
			zoneGo: true,
			equipCap: Infinity
		}
	};

	let equipsToBuy = [];
	let prestigesToBuy = [];

	for (let equipName in game.equipment) {
		if (game.challenges.Pandemonium.isEquipBlocked(equipName) || equipArray[equipName].resource === 'wood') continue;
		const prestigeUpgrade = game.upgrades[equipArray[equipName].upgrade];

		const equip = game.equipment[equipName];
		if (equip.locked) continue;
		const equipCost = equip.cost[equipArray[equipName].resource][0] * Math.pow(equip.cost[equipArray[equipName].resource][1], equip.level) * getEquipPriceMult();
		let prestigeCost = getNextPrestigeCost(equipArray[equipName].upgrade) * getEquipPriceMult();
		if (prestigeUpgrade.locked || prestigeUpgrade.allowed === prestigeUpgrade.done) prestigeCost = Infinity;
		if (cacheGain > prestigeCost) {
			equipArray[equipName].upgradeCost = prestigeCost;
			equipArray[equipName].prestige = true;
			prestigesToBuy.push({ [equipName]: prestigeCost });
		} else if (cacheGain > equipCost) {
			equipArray[equipName].cost = equipCost;
			equipsToBuy.push({ [equipName]: equipCost });
		}
	}

	let equipsToPurchase = { ...equipsToPurchaseBaseline };

	function filterEquipments(equipmentsToBuy, equipArray, prestige) {
		return equipmentsToBuy.filter((equip) => {
			const equipName = Object.keys(equip)[0];
			const stat = equipArray[equipName].stat;

			if (stat === 'health' && !equipsToPurchase['health'].name) {
				equipsToPurchase['health'].name = equipName;
				equipsToPurchase['health'].cost = equip[equipName];
				if (prestige) equipsToPurchase['health'].prestige = true;
				return true;
			}
			if (stat === 'attack' && !equipsToPurchase['attack'].name) {
				equipsToPurchase['attack'].name = equipName;
				equipsToPurchase['attack'].cost = equip[equipName];
				if (prestige) equipsToPurchase['attack'].prestige = true;
				return true;
			}

			return false;
		});
	}

	equipsToBuy.sort((a, b) => Object.values(a)[0] - Object.values(b)[0]);
	filterEquipments(equipsToBuy, equipArray);
	if (equipsToPurchase.attack.name || equipsToPurchase.health.name) return equipsToPurchase;

	equipsToPurchase = { ...equipsToPurchaseBaseline };

	prestigesToBuy.sort((a, b) => Object.values(a)[0] - Object.values(b)[0]);
	filterEquipments(prestigesToBuy, equipArray, true);

	return equipsToPurchase;
}

function pandemoniumEquipFarm(lineCheck) {
	const mapName = 'Pandemonium Farming';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};
	const equipSetting = getPageSetting('pandemoniumAE');

	if (!challengeActive('Pandemonium') || !getPageSetting('pandemonium') || equipSetting < 2 || game.global.world === 150 || game.global.lastClearedCell + 2 < 91) return farmingDetails;

	const farmFromZone = getPageSetting('pandemoniumAEZone') > 0 ? getPageSetting('pandemoniumAEZone') : Infinity;
	if (game.global.world < farmFromZone) return farmingDetails;

	const hdRatioSetting = getPageSetting('pandemoniumAERatio');
	if (hdRatioSetting > 0 && hdStats.hdRatio < hdRatioSetting) return farmingDetails;

	const jobRatio = '1,0,100';
	let mapSpecial = getAvailableSpecials(equipSetting === 3 ? 'hc' : 'lmc');
	const mapLevel = autoLevelCheck(mapName, 'lmc');

	const cacheGain = scaleToCurrentMap_AT(simpleSeconds_AT('metal', equipSetting === 3 ? 40 : 20, jobRatio), false, true, mapLevel);
	const equipsToPurchase = pandemoniumEquipmentCheck(cacheGain);

	if (!equipsToPurchase.attack.name && !equipsToPurchase.health.name) return equipsToPurchase;

	let nextEquipmentCost = Infinity;
	for (let equip in equipsToPurchase) {
		if (equipsToPurchase[equip].cost < nextEquipmentCost) nextEquipmentCost = equipsToPurchase[equip].cost;
	}

	if (cacheGain / 2 > nextEquipmentCost) mapSpecial = 'lmc';

	const shouldMap = cacheGain >= nextEquipmentCost;

	if (lineCheck && shouldMap) return (setting = { priority: 1 });

	const repeat = nextEquipmentCost >= cacheGain;
	const status = `Pandemonium Farming Equips below ${prettify(cacheGain)}`;

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, mapLevel, mapSpecial);
		resetMapVars();
	}

	Object.assign(farmingDetails, {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel: true,
		special: mapSpecial,
		jobRatio,
		gather: 'metal',
		repeat: !repeat,
		status,
		pandaEquips: equipsToPurchase,
		cacheGain
	});

	return farmingDetails;
}

function alchemy(lineCheck) {
	const mapName = 'Alchemy Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Alchemy')) return farmingDetails;

	const settingName = 'alchemySettings';
	const baseSettings = getPageSetting(settingName);
	if (!baseSettings) return farmingDetails;

	const defaultSettings = baseSettings[0];
	if (!defaultSettings || !defaultSettings.active) return farmingDetails;

	const settingIndex = findSettingsIndex(settingName, baseSettings, mapName);
	const setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting) Object.assign(farmingDetails, _runAlchemy(setting, mapName, settingName, settingIndex));

	return farmingDetails;
}

function _runAlchemy(setting, mapName, settingName, settingIndex) {
	const mapSpecial = setting.special;
	const jobRatio = setting.jobratio;
	const potionGoal = setting.potion;
	const mapLevel = setting.autoLevel ? autoLevelCheck(mapName, mapSpecial) : setting.level;

	const potionIndex = ['h', 'g', 'f', 'v', 's'].indexOf(potionGoal.charAt('0'));
	const potionName = alchObj.potionNames[potionIndex];
	let potionTarget = potionGoal.toString().replace(/[^\d,:-]/g, '');

	const potionBiomes = ['Mountain', 'Forest', 'Sea', 'Depths', 'Plentiful'];
	const farmlandResources = ['Metal', 'Wood', 'Food', 'Gems', 'Any'];
	const biome = game.global.farmlandsUnlocked && farmlandResources[potionIndex] === getFarmlandsResType() ? 'Farmlands' : potionBiomes[potionIndex];

	//Doing calcs to identify the total cost of all the Brews/Potions that are being farmed
	const herbMult = biome === 'Farmlands' ? 1.5 : 1;
	const potionCurrent = alchObj.potionsOwned[potionIndex];

	let potionCostTotal = 0;
	let potionMult = 1;
	//If farming for a potion then calculates the compounding mult for the potion from other potions
	if (!alchObj.potions[potionIndex].enemyMult) {
		let potionsOwned = 0;
		for (let y = 0; y < farmlandResources.length; y++) {
			if (alchObj.potions[y].enemyMult) continue;
			if (potionName !== alchObj.potionNames[y]) potionsOwned += alchObj.potionsOwned[y];
		}
		potionMult = Math.pow(alchObj.allPotionGrowth, potionsOwned);
	}

	//When mapType is set as Map Count work out how many of each Potion/Brew we can farm in the amount of maps specified.
	if (setting.mapType && setting.mapType === 'Map Count') {
		if (mapSettings.potionTarget) {
			potionTarget = mapSettings.potionTarget;
		} else {
			const mapCount = potionTarget;
			let herbsGained = game.herbs[alchObj.potions[potionIndex].cost[0][0]].cowned + alchObj.getDropRate(game.global.world + mapLevel) * herbMult * mapCount;

			potionTarget = potionCurrent;
			while (herbsGained > Math.pow(alchObj.potions[potionIndex].cost[0][2], potionTarget) * alchObj.potions[potionIndex].cost[0][1] * potionMult) {
				herbsGained -= Math.pow(alchObj.potions[potionIndex].cost[0][2], potionTarget) * alchObj.potions[potionIndex].cost[0][1] * potionMult;
				potionTarget++;
			}
		}
	}

	//Looping through each potion level and working out their cost to calc total cost
	for (let x = potionCurrent; x < potionTarget; x++) {
		let potionCost = Math.pow(alchObj.potions[potionIndex].cost[0][2], x) * alchObj.potions[potionIndex].cost[0][1];
		potionCost *= potionMult;
		potionCostTotal += potionCost;
	}

	//Craft the potion if we can afford it and we're not at the goal
	if (potionTarget > potionCurrent && alchObj.canAffordPotion(alchObj.potionNames[potionIndex])) {
		for (let z = potionCurrent; z < potionTarget; z++) {
			//Only craft Gaseous Brews if we can afford all of them as they increase enemy stat scaling and only provide a radon benefit there's no point in buying them straight away.
			if (potionName === 'Gaseous Brew' && potionCostTotal > game.herbs[alchObj.potions[potionIndex].cost[0][0]].cowned) break;
			potionCostTotal -= alchObj.getPotionCost(alchObj.potionNames[potionIndex]);
			alchObj.craftPotion(alchObj.potionNames[potionIndex]);
		}
	}

	const shouldMap = potionTarget > alchObj.potionsOwned[potionIndex];
	//Identifying current herbs + ones that we'll get from the map we should run
	const herbTotal = game.herbs[alchObj.potions[potionIndex].cost[0][0]].cowned + alchObj.getDropRate(game.global.world + mapLevel) * herbMult;
	const repeat = herbTotal >= potionCostTotal;
	const status = `Alchemy Farming ${alchObj.potionNames[potionIndex]} (${alchObj.potionsOwned[potionIndex]}/${potionTarget})`;

	if (!shouldMap) {
		if (mapSettings.mapName === mapName) mappingDetails(mapName, mapLevel, mapSpecial, alchObj.potionsOwned[mapSettings.potionIndex], alchObj.potionNames[mapSettings.potionIndex]);
		resetMapVars(setting, settingName);
	}

	return {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel: setting.autoLevel,
		special: mapSpecial,
		jobRatio,
		biome,
		repeat: !repeat,
		status,
		settingIndex,
		potionTarget,
		potionIndex,
		priority: setting.priority
	};
}

function _alchemyVoidPotions() {
	if (!challengeActive('Alchemy') || !getPageSetting('alchemySettings')[0].active || !getPageSetting('alchemySettings')[0].voidPurchase) return;
	if (!game.global.voidBuff) return;

	if (alchObj.canAffordPotion('Potion of the Void')) alchObj.craftPotion('Potion of the Void');
	if (alchObj.canAffordPotion('Potion of Strength')) alchObj.craftPotion('Potion of Strength');
}

/* To be done */
function glass(lineCheck) {
	let shouldMap = false;
	let mapName = 'Glass ';
	const farmingDetails = {
		shouldRun: shouldMap,
		mapName
	};

	if (!challengeActive('Glass') || !getPageSetting('glass')) return farmingDetails;

	const jobRatio = '0,0,1';
	let mapSpecial = getAvailableSpecials('lmc', true);
	let mapLevel = autoLevelCheck(mapName, mapSpecial);
	let glassStacks = getPageSetting('glassStacks');
	if (glassStacks <= 0) glassStacks = Infinity;

	//Gamma burst info
	const gammaTriggerStacks = gammaMaxStacks();
	const gammaToTrigger = game.global.mapsActive ? Infinity : gammaTriggerStacks - game.heirlooms.Shield.gammaBurst.stacks;
	const gammaDmg = MODULES.heirlooms.gammaBurstPct;
	const canGamma = gammaToTrigger <= 1 ? true : false;
	const damageGoal = 2;

	let equalityAmt = equalityQuery('Snimp', game.global.world, 20, 'map', 0.75, 'gamma');
	let ourDmg = calcOurDmg('min', equalityAmt, false, 'map', 'maybe', mapLevel, false);
	let enemyHealth = calcEnemyHealthCore('map', game.global.world, 20, 'Snimp') * 0.75;
	if (glassStacks <= gammaTriggerStacks) ourDmg *= gammaDmg;

	//Destacking
	if ((!canGamma && mapSettings.mapName === 'Glass Destacking') || (ourDmg * damageGoal > enemyHealth && game.challenges.Glass.shards >= glassStacks)) {
		mapSpecial = getAvailableSpecials('fa');
		shouldMap = true;
		mapLevel = 0;
		mapName += 'Destacking';
	}
	//Farming if we don't have enough damage to clear stacks!
	else if (!canGamma && ourDmg * damageGoal < enemyHealth) {
		mapName += 'Farming';
		shouldMap = true;
	}
	//Checking if we can clear +0 maps on the next zone.
	else if (game.global.lastClearedCell + 2 === 100) {
		equalityAmt = equalityQuery('Snimp', game.global.world + 1, 20, 'map', 0.75, 'gamma');
		ourDmg = calcOurDmg('min', equalityAmt, false, 'map', 'maybe', mapLevel, false);
		enemyHealth = calcEnemyHealthCore('map', game.global.world + 1, 20, 'Snimp') * 0.75;
		mapName += 'Farming';
		//Checking if we can clear current zone.
		if (ourDmg * damageGoal < enemyHealth) {
			shouldMap = true;
		}
	}

	//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
	if (lineCheck && shouldMap) return (setting = { priority: 1 });

	if ((game.global.mapsActive || game.challenges.Glass.shards > 0) && mapSettings.mapName === 'Glass Destacking') {
		shouldMap = game.challenges.Glass.shards > 0;
		if (!shouldMap) recycleMap_AT();
	}

	const damageTarget = enemyHealth / damageGoal;

	let status;
	if (mapName.includes('Destack')) status = `${mapName}: ${game.challenges.Glass.shards} stacks remaining`;
	else status = `${game.global.challengeActive} Farm: Curr&nbsp;Dmg:&nbsp;${prettify(ourDmg)} Goal&nbsp;Dmg:&nbsp;${prettify(damageTarget)}`;

	farmingDetails.shouldRun = shouldMap;
	farmingDetails.mapName = mapName;
	farmingDetails.mapLevel = mapLevel;
	farmingDetails.autoLevel = true;
	farmingDetails.special = mapSpecial;
	farmingDetails.jobRatio = jobRatio;
	farmingDetails.damageTarget = damageTarget;
	farmingDetails.repeat = true;
	farmingDetails.status = status;

	if (mapSettings.mapName === mapName && !farmingDetails.shouldRun) {
		mappingDetails(mapName, mapLevel, mapSpecial);
		resetMapVars();
	}

	return farmingDetails;
}

function hypothermia(lineCheck) {
	const mapName = 'Hypothermia Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	const settingName = 'hypothermiaSettings';
	const baseSettings = getPageSetting(settingName);
	if (!baseSettings) return farmingDetails;

	const defaultSettings = baseSettings[0];
	if (!defaultSettings || !defaultSettings.active || (!challengeActive('Hypothermia') && (!defaultSettings.packrat || !MODULES.mapFunctions.hypoPackrat))) return farmingDetails;

	if (defaultSettings.packrat) _hypothermiaBuyPackrat();

	if (!challengeActive('Hypothermia')) return farmingDetails;

	const settingIndex = findSettingsIndex(settingName, baseSettings, mapName);
	const setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting) Object.assign(farmingDetails, _runHypothermia(setting, mapName, settingName, settingIndex));

	return farmingDetails;
}

function _hypothermiaBuyPackrat() {
	if (challengeActive('Hypothermia')) {
		MODULES.mapFunctions.hypoPackrat = true;
		return;
	}

	if (MODULES.mapFunctions.hypoPackrat) {
		viewPortalUpgrades();
		numTab(6, true);
		buyPortalUpgrade('Packrat');
		MODULES.mapFunctions.hypoPackrat = null;
		activateClicked();
	}
}

function _runHypothermia(setting, mapName, settingName, settingIndex) {
	let bonfireGoal = setting.bonfire;
	const mapSpecial = getAvailableSpecials('lwc', true);
	const mapLevel = setting.autoLevel ? autoLevelCheck(mapName, mapSpecial) : setting.level;
	const jobRatio = setting.jobratio;
	const maxWood = game.resources.wood.max * (1 + getPerkModifier('Packrat') * getPerkLevel('Packrat'));

	let bonfireCostTotal = 0;

	//Looping through each bonfire level and working out their cost to calc total cost
	for (let x = game.challenges.Hypothermia.totalBonfires; x < bonfireGoal; x++) {
		bonfireCostTotal += 1e10 * Math.pow(100, x);
	}

	if (bonfireCostTotal > maxWood) {
		bonfireCostTotal += game.buildings.Shed.cost.wood();
	}

	let shouldMap = bonfireGoal > game.challenges.Hypothermia.totalBonfires && bonfireCostTotal > game.resources.wood.owned;

	if (shouldMap && setting.mapCap && setting.mapCap > 0) {
		const mapCap = mapSettings.mapName === mapName ? setting.mapCap - game.global.mapRunCounter : setting.mapCap;
		if (typeof mapSettings.bonfire !== 'undefined') {
			bonfireGoal = mapSettings.bonfire;
		} else {
			const resourcesGained = game.resources.wood.owned + resourcesFromMap('wood', mapSpecial, setting.jobratio, mapLevel, mapCap);
			while (bonfireCostTotal < resourcesGained) {
				bonfireCostTotal -= 1e10 * Math.pow(100, bonfireGoal);
				bonfireGoal--;
			}
		}

		shouldMap = bonfireGoal > game.challenges.Hypothermia.totalBonfires && bonfireCostTotal > game.resources.wood.owned;
	}

	const repeat = game.resources.wood.owned > game.challenges.Hypothermia.bonfirePrice || scaleToCurrentMap_AT(simpleSeconds_AT('wood', 20, jobRatio), false, true, mapLevel) + game.resources.wood.owned > bonfireCostTotal;
	const status = `Hypo Farming To: ${prettify(bonfireCostTotal)} wood`;

	if (!shouldMap) {
		if (mapSettings.mapName === mapName) mappingDetails(mapName, mapLevel, mapSpecial, bonfireCostTotal);
		resetMapVars(setting, settingName);
	}

	return {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel: setting.autoLevel,
		special: mapSpecial,
		jobRatio,
		bonfire: bonfireGoal,
		woodGoal: bonfireCostTotal,
		repeat: !repeat,
		status,
		settingIndex,
		priority: setting.priority
	};
}

function desolation(lineCheck, forceDestack) {
	const mapName = 'Desolation Destacking';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Desolation') || !getPageSetting('desolation')) return farmingDetails;

	let destackZone = getPageSetting('desolationZone') > 0 ? getPageSetting('desolationZone') : Infinity;
	let destackStacks = getPageSetting('desolationStacks') > 0 ? getPageSetting('desolationStacks') : 300;
	const destackHits = getPageSetting('desolationDestack') > 0 ? getPageSetting('desolationDestack') : Infinity;
	const destackOnlyZone = getPageSetting('desolationOnlyDestackZone') > 0 ? getPageSetting('desolationOnlyDestackZone') : Infinity;
	const destackSpecial = getPageSetting('desolationSpecial');

	const equality = game.global.world >= destackOnlyZone || game.jobs.Explorer.locked;

	let mapSpecial = getAvailableSpecials(trimpStats.hyperspeed2 && destackSpecial ? 'lmc' : 'fa');
	let mapLevel = autoLevelCheck(mapName, mapSpecial);
	let sliders = [9, 9, 9];
	let biome = getBiome();

	if (forceDestack) {
		destackZone = game.global.world;
		destackStacks = 0;
	}

	if (equality) {
		sliders = [0, 0, 9];
		mapSpecial = mapSpecial === 'lmc' || game.jobs.Explorer.locked || trimpStats.hyperspeed2 ? '0' : 'fa';
		biome = getBiome('fragConservation');
		const trimpHealth = calcOurHealth(false, 'map');
		mapLevel = _getDesolationMapLevel(trimpHealth, mapName, mapSpecial, sliders);
	}

	let shouldMap = game.challenges.Desolation.chilled >= destackStacks && (hdStats.hdRatio > destackHits || game.global.world >= destackZone || game.global.world >= destackOnlyZone);
	if ((forceDestack && game.challenges.Desolation.chilled > 0) || ((game.global.mapsActive || game.challenges.Desolation.chilled > 0) && mapSettings.mapName === 'Desolation Destacking')) {
		shouldMap = game.challenges.Desolation.chilled > 0;
		if (!shouldMap) {
			mapsClicked(true);
		}
	}

	if (lineCheck && shouldMap) return (setting = { priority: 0 });

	const repeat = game.challenges.Desolation.chilled <= mapLevel + 1;
	const status = `Desolation Destacking: ${game.challenges.Desolation.chilled} remaining`;

	Object.assign(farmingDetails, {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel: true,
		special: mapSpecial,
		mapSliders: sliders,
		biome,
		repeat: !repeat,
		status,
		equality
	});

	if (mapSettings.mapName === mapName && !farmingDetails.shouldRun) {
		mappingDetails(mapName, mapLevel, mapSpecial);
		resetMapVars();
	}

	return farmingDetails;
}

function _getDesolationMapLevel(trimpHealth, mapName, mapSpecial, sliders) {
	let mapLevel;
	const mapObj = getCurrentMapObject();

	for (let y = 10; y >= 0; y--) {
		mapLevel = y;
		if (game.global.mapsActive && mapSettings.mapName === mapName && (mapObj.bonus === undefined ? '0' : mapObj.bonus) === mapSpecial && mapObj.level - game.global.world === mapLevel) break;
		if (mapLevel === 0) break;
		if (game.resources.fragments.owned < mapCostMin(mapLevel, mapSpecial, 'Random', sliders)) continue;
		const enemyDmg = calcEnemyAttackCore('map', game.global.world + y, 1, 'Snimp', false, false, game.portal.Equality.radLevel) * 0.84 * 4;
		if (enemyDmg > trimpHealth) continue;
		break;
	}

	if (game.global.mapsActive && mapSettings.mapName === mapName && !mapObj.noRecycle && mapObj.level !== game.global.world + mapLevel) {
		recycleMap_AT();
	}

	return mapLevel;
}

function _desolationGearScumSetting(defaultSettings) {
	return {
		mapLevel: 1,
		autoLevel: true,
		level: 1,
		special: MODULES.maps.lastMapWeWereIn.bonus || 'p',
		priority: 0
	};
}

/* To be done */
function desolationGearScum(lineCheck) {
	let shouldMap = false;
	const mapName = 'Desolation Gear Scum';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Desolation') || !getPageSetting('desolation')) return farmingDetails;

	const settingName = 'desolationSettings';
	const baseSettings = getPageSetting(settingName);
	if (!baseSettings) return farmingDetails;

	const defaultSettings = baseSettings[0];
	if (!defaultSettings || !defaultSettings.active) return farmingDetails;

	const settingIndex = findSettingsIndex(settingName, baseSettings, mapName);
	const setting = MODULES.mapFunctions.desoGearScum ? _desolationGearScumSetting(defaultSettings) : baseSettings[settingIndex];

	if (lineCheck) return setting;

	//if (setting) Object.assign(farmingDetails, _runDesoGearScum(setting, mapName, settingIndex));
	if (setting || MODULES.mapFunctions.desoGearScum) {
		let special;
		let jobRatio;
		let gather;
		const mapLevel = game.global.lastClearedCell < 80 ? 0 : 1;
		if (settingIndex) {
			special = getAvailableSpecials(setting.special);
			jobRatio = setting.jobratio;
			gather = setting.gather;
		} else if (MODULES.maps.lastMapWeWereIn.id !== 0 && MODULES.maps.lastMapWeWereIn.mapLevel === mapLevel) {
			special = MODULES.maps.lastMapWeWereIn.bonus;
		}

		//Check if a max attack+gamma burst can clear the improb.
		//If it can't continue as normal, if it can then we start the +1 map for prestige scumming.
		const currCell = game.global.lastClearedCell + 2;
		let name = game.global.gridArray && game.global.gridArray[0] ? game.global.gridArray[currCell - 1].name : undefined;
		let enemyHealth = getCurrentWorldCell().maxHealth > -1 ? getCurrentWorldCell().health : calcEnemyHealthCore('world', game.global.world, currCell, name);
		const equalityAmt = equalityQuery('Improbability', game.global.world, 100, 'world', 1, 'gamma');
		const ourDmg = calcOurDmg('max', equalityAmt, false, 'world', 'force', 0, false);
		const gammaDmg = MODULES.heirlooms.gammaBurstPct;
		const ourDmgTotal = ourDmg * gammaDmg * 5;

		//Check if we will overshoot the improb with our regular hit/gamma burst.
		//Add together the health of the cells between our current cell and the improb that we are able to overkill.
		if (currCell !== 100) {
			for (let x = currCell + 1; x <= 100; x++) {
				name = game.global.gridArray && game.global.gridArray[0] ? game.global.gridArray[x - 1].name : undefined;
				enemyHealth += calcEnemyHealthCore('world', name);
			}
		}

		//Identify how much damage we can do in 5 gamma bursts. If this value is greater than the improb health then we can clear it and we should start the map.
		if (ourDmgTotal > enemyHealth || MODULES.mapFunctions.desoGearScum) {
			shouldMap = true;
		}

		//Disabling the need to map if we are at the right conditions.
		//Correct map level
		//Have already cleared cell #1 in the map so it won't recycle
		//If these are met then we should just return to world and set a condition to finish this at the start of the next zone.
		if (settingIndex !== null && shouldMap && game.global.currentMapId !== '' && getCurrentMapCell().level > 3 && getCurrentMapObject().level === game.global.world + mapLevel) {
			shouldMap = false;
			MODULES.mapFunctions.desoGearScum = true;
			//Exit map if we're in it so that we don't clear the map.
			if (game.global.mapsActive) {
				debug(`${mapName} (z${game.global.world}c${game.global.lastClearedCell + 2}) exiting map to ensure we complete it at start of the next zone.`, 'map_Details');
				mapsClicked(true);
			}
		}

		const prestigeList = ['Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'];

		//Marking setting as complete if we've run enough maps.
		if (mapSettings.mapName === mapName && MODULES.mapFunctions.desoGearScum && (game.global.currentMapId === '' || prestigeList.indexOf(game.global.mapGridArray[getCurrentMapObject().size - 1].special) === -1)) {
			debug(`${mapName} (z${game.global.world}c${game.global.lastClearedCell + 2}) was successful.`, 'map_Details');
			resetMapVars();
			saveSettings();
			shouldMap = false;
			MODULES.mapFunctions.desoGearScum = false;
		}

		const status = `Desolation Prestige Scumming`;
		const repeat = true;

		Object.assign(farmingDetails, {
			shouldRun: shouldMap,
			mapName,
			mapLevel,
			jobRatio,
			special,
			gather,
			repeat: !repeat,
			status,
			settingIndex,
			priority: setting.priority
		});
	}
	return farmingDetails;
}

/* To be tested */
function _runDesoGearScum(setting, mapName, settingIndex) {
	let special;
	let jobRatio;
	let gather;
	const mapLevel = game.global.lastClearedCell < 80 ? 0 : 1;
	if (settingIndex) {
		special = getAvailableSpecials(setting.special);
		jobRatio = setting.jobratio;
		gather = setting.gather;
	} else if (MODULES.maps.lastMapWeWereIn.id !== 0 && MODULES.maps.lastMapWeWereIn.mapLevel === mapLevel) {
		special = MODULES.maps.lastMapWeWereIn.bonus;
	}

	//Check if a max attack+gamma burst can clear the improb.
	//If it can't continue as normal, if it can then we start the +1 map for prestige scumming.
	const currCell = game.global.lastClearedCell + 2;
	let name = game.global.gridArray && game.global.gridArray[0] ? game.global.gridArray[currCell - 1].name : undefined;
	let enemyHealth = getCurrentWorldCell().maxHealth > -1 ? getCurrentWorldCell().health : calcEnemyHealthCore('world', game.global.world, currCell, name);
	const equalityAmt = equalityQuery('Improbability', game.global.world, 100, 'world', 1, 'gamma');
	const ourDmg = calcOurDmg('max', equalityAmt, false, 'world', 'force', 0, false);
	const gammaDmg = MODULES.heirlooms.gammaBurstPct;
	const ourDmgTotal = ourDmg * gammaDmg * 5;

	//Check if we will overshoot the improb with our regular hit/gamma burst.
	//Add together the health of the cells between our current cell and the improb that we are able to overkill.
	if (currCell !== 100) {
		for (let x = currCell + 1; x <= 100; x++) {
			name = game.global.gridArray && game.global.gridArray[0] ? game.global.gridArray[x - 1].name : undefined;
			enemyHealth += calcEnemyHealthCore('world', name);
		}
	}

	//Identify how much damage we can do in 5 gamma bursts. If this value is greater than the improb health then we can clear it and we should start the map.
	let shouldMap = ourDmgTotal > enemyHealth || MODULES.mapFunctions.desoGearScum;

	//Disabling the need to map if we are at the right conditions.
	//Correct map level
	//Have already cleared cell #1 in the map so it won't recycle
	//If these are met then we should just return to world and set a condition to finish this at the start of the next zone.
	if (settingIndex !== null && shouldMap && game.global.currentMapId !== '' && getCurrentMapCell().level > 3 && getCurrentMapObject().level === game.global.world + mapLevel) {
		shouldMap = false;
		MODULES.mapFunctions.desoGearScum = true;
		//Exit map if we're in it so that we don't clear the map.
		if (game.global.mapsActive) {
			debug(`${mapName} (z${game.global.world}c${game.global.lastClearedCell + 2}) exiting map to ensure we complete it at start of the next zone.`, 'map_Details');
			mapsClicked(true);
		}
	}

	const prestigeList = ['Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'];

	//Marking setting as complete if we've run enough maps.
	if (mapSettings.mapName === mapName && MODULES.mapFunctions.desoGearScum && (game.global.currentMapId === '' || prestigeList.indexOf(game.global.mapGridArray[getCurrentMapObject().size - 1].special) === -1)) {
		debug(`${mapName} (z${game.global.world}c${game.global.lastClearedCell + 2}) was successful.`, 'map_Details');
		resetMapVars();
		saveSettings();
		shouldMap = false;
		MODULES.mapFunctions.desoGearScum = false;
	}

	const status = `Desolation Prestige Scumming`;
	const repeat = true;

	return {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		jobRatio,
		special,
		gather,
		repeat: !repeat,
		status,
		settingIndex,
		priority: setting.priority
	};
}

function smithless(lineCheck) {
	const mapName = 'Smithless Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Smithless') || !getPageSetting('smithless')) return farmingDetails;

	if (game.global.world % 25 !== 0 || game.global.lastClearedCell !== -1 || !game.global.gridArray[0].ubersmith) return farmingDetails;

	const zoneTime = getZoneMinutes();
	const farmTime = getPageSetting('smithlessFarmTime');
	const wantMapBonus = getPageSetting('smithlessMapBonus') && game.global.mapBonus !== 10;

	const mapSpecial = getAvailableSpecials('lmc', true);
	const mapLevel = autoLevelCheck(farmingDetails.mapName, mapSpecial);

	const name = game.global.gridArray[0].name;
	const gammas = 10 % gammaMaxStacks();
	const regularHits = 10 - gammas * gammaMaxStacks();
	const gammaDmg = MODULES.heirlooms.gammaBurstPct;
	const equalityAmt = equalityQuery(name, game.global.world, 1, 'world', 1, 'gamma');
	const ourDmg = calcOurDmg('min', equalityAmt, false, 'world', 'never', 0, false);
	let ourDmgTenacity = ourDmg;

	if (game.global.mapBonus > 0 && game.global.mapBonus !== 10) {
		ourDmgTenacity = (ourDmgTenacity / (1 + 0.2 * game.global.mapBonus)) * 5;
	}

	if (getPerkLevel('Tenacity') > 0) {
		const tenacityCurrentMult = game.portal.Tenacity.getMult();
		const tenacityMaxMult = Math.pow(1.4000000000000001, getPerkLevel('Tenacity') + getPerkLevel('Masterfulness'));
		if (tenacityCurrentMult !== tenacityMaxMult) {
			ourDmgTenacity = (ourDmgTenacity / tenacityCurrentMult) * tenacityMaxMult;
		}
	}

	ourDmgTenacity *= getZoneMinutes() > 100 ? 1 : 1.5;

	if (prestigesToGet(game.global.world + mapLevel)[0] > 0) ourDmgTenacity *= 1000;

	let enemyHealth = calcEnemyHealthCore('world', game.global.world, 1, name) * 3e15;
	const totalDmgTenacity = ourDmgTenacity * regularHits + ourDmgTenacity * gammaDmg * gammas;
	const smithyThreshhold = [1, 0.01, 0.000001];
	const smithyThreshholdIndex = [0.000001, 0.01, 1];

	while (smithyThreshhold.length > 0 && totalDmgTenacity < enemyHealth * smithyThreshhold[0]) {
		smithyThreshhold.shift();
	}

	enemyHealth *= smithyThreshhold[0];

	if (smithyThreshhold.length === 0) return farmingDetails;

	const totalDmg = ourDmg * regularHits + ourDmg * gammaDmg * gammas;
	const damageTarget = enemyHealth / totalDmg;

	let shouldMap = totalDmg < enemyHealth;
	if (shouldMap && (farmTime === 0 || (farmTime > 0 && zoneTime >= farmTime)) && !wantMapBonus) shouldMap = false;

	if (lineCheck && shouldMap) return (setting = { priority: Infinity });

	const status = `Smithless: Want ${damageTarget.toFixed(2)}x more damage for ${smithyThreshholdIndex.indexOf(smithyThreshhold[0]) + 1}/3`;

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, mapLevel, mapSpecial, smithyThreshholdIndex.indexOf(smithyThreshhold[0]) + 1);
		resetMapVars();
	}

	Object.assign(farmingDetails, {
		shouldRun: shouldMap,
		mapName,
		mapLevel,
		autoLevel: true,
		special: mapSpecial,
		jobRatio: '0,0,1',
		damageTarget,
		equality: equalityAmt,
		repeat: true,
		status
	});

	return farmingDetails;
}

function hdFarm(lineCheck, skipHealthCheck, voidFarm) {
	const mapName = 'HD Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	const settingName = 'hdFarmSettings';
	const baseSettings = getPageSetting(settingName);
	if (!baseSettings) return farmingDetails;
	const defaultSettings = baseSettings[0];

	const allowMapping = !_berserkDisableMapping() && !_noMappingChallenges(undefined, true);
	const currentPortal = getTotalPortals() + '_' + game.global.world;
	const hitsSurvivedGoal = targetHitsSurvived(true);

	if (!skipHealthCheck && MODULES.mapFunctions.hasHealthFarmed === currentPortal) {
		const resetHasFarmed = hitsSurvivedGoal > 0 && hitsSurvivedGoal * 0.8 > hdStats.hitsSurvived && getPageSetting('hitsSurvivedReset');

		if (resetHasFarmed) MODULES.mapFunctions.hasHealthFarmed = '';
	}

	const hitsSurvivedCheck = !skipHealthCheck && allowMapping && MODULES.mapFunctions.hasHealthFarmed !== currentPortal;
	const shouldHitsSurvived = hitsSurvivedCheck && hitsSurvivedGoal > 0 && (hdStats.hitsSurvived < hitsSurvivedGoal || (mapSettings.mapName === 'Hits Survived' && mapSettings.priority === Infinity));

	const hdRatioSetting = getPageSetting('mapBonusRatio');
	const hdRatioStacks = getPageSetting('mapBonusStacks');
	const hdRatioCheck = allowMapping && hdRatioSetting > 0 && hdRatioStacks > 0 && ((hdStats.hdRatio > hdRatioSetting && game.global.mapBonus < hdRatioStacks) || mapSettings.mapBonus);

	if (!voidFarm && !shouldHitsSurvived && !hdRatioCheck && (!defaultSettings || !defaultSettings.active)) return farmingDetails;

	const settingIndex = findSettingsIndex(settingName, baseSettings, mapName, null, skipHealthCheck);

	const setting = voidFarm ? _hdFarmVoidSetting() : shouldHitsSurvived ? _hdFarmHitsSurvivedSetting(hitsSurvivedGoal, defaultSettings) : settingIndex ? baseSettings[settingIndex] : hdRatioCheck ? _hdFarmRatioSetting(hdRatioSetting, hdRatioStacks) : undefined;
	if (lineCheck) return setting;

	if (setting) Object.assign(farmingDetails, _runHDFarm(setting, mapName, settingName, settingIndex, defaultSettings, voidFarm));
	if (farmingDetails.hasVoidFarmed) return voidMaps();
	return farmingDetails;
}

function _hdFarmVoidSetting() {
	const voidSetting = getPageSetting('voidMapSettings')[0];
	const useHitsSurvived = voidSetting.hitsSurvived > hdStats.hitsSurvivedVoid;

	return {
		autoLevel: true,
		hdMult: 1,
		jobratio: voidSetting.jobratio,
		world: game.global.world,
		level: -1,
		hdBase: useHitsSurvived ? Number(voidSetting.hitsSurvived) : Number(voidSetting.hdRatio),
		hdType: useHitsSurvived ? 'hitsSurvivedVoid' : 'voidFarm',
		mapCap: typeof voidSetting.mapCap !== 'undefined' ? voidSetting.mapCap : 100,
		priority: 1
	};
}

function hdFarmSettingRatio(setting) {
	const zone = game.global.world - setting.world;
	return zone === 0 ? setting.hdBase : Math.pow(setting.hdMult, zone) * setting.hdBase;
}

function _hdFarmRatioSetting(hdRatioSetting, hdRatioStacks) {
	const settingName = 'mapBonusSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	const isSettingsEmpty = Object.keys(defaultSettings).length === 1;

	return {
		repeat: true,
		autoLevel: true,
		hdMult: 1,
		jobratio: isSettingsEmpty ? '1,1,2' : defaultSettings.jobratio,
		world: game.global.world,
		level: 0,
		special: isSettingsEmpty ? 'lmc' : defaultSettings.special,
		hdBase: hdRatioSetting,
		hdType: 'world',
		mapCap: hdRatioStacks,
		priority: Infinity
	};
}

function _hdFarmHitsSurvivedSetting(hitsSurvivedGoal, defaultSettings) {
	return {
		autoLevel: true,
		hdBase: hitsSurvivedGoal,
		hdMult: 1,
		world: game.global.world,
		hdType: 'hitsSurvived',
		jobratio: typeof defaultSettings.jobratio !== 'undefined' ? defaultSettings.jobratio : '1,1,2',
		level: -1,
		hitsSurvivedFarm: true,
		priority: Infinity
	};
}

function _runHDFarm(setting, mapName, settingName, settingIndex, defaultSettings, voidFarm) {
	let mapLevel = setting.level;
	const farmingDetails = {};
	const mapSpecial = setting.special ? setting.special : getAvailableSpecials('lmc');
	const jobRatio = setting.jobratio;
	const hdType = setting.hdType;
	const hitsSurvived = hdType === 'hitsSurvivedVoid' ? hdStats.hitsSurvivedVoid : hdStats.hitsSurvived;
	const settingTarget = hdFarmSettingRatio(setting);

	let mapsRunCap = setting.mapCap || defaultSettings.mapCap || 100;
	if (mapsRunCap === -1) mapsRunCap = Infinity;

	//Rename mapName if running a hits survived setting for some checks
	//Needs to be done before auto level code is run
	if (hdType.includes('hitsSurvived')) mapName = 'Hits Survived';

	const biome = !hdType.includes('hdRatio') && hdStats.biomeEff && hdStats.biomeEff.biome === 'Forest' ? 'Forest' : 'Any';

	if (setting.autoLevel) {
		const shouldMapBonus = game.global.mapBonus !== 10 && (setting.repeat || hdType === 'world' || (hdType === 'hitsSurvived' && game.global.mapBonus < getPageSetting('mapBonusHealth')));
		const minLevel = shouldMapBonus ? 0 - getPerkLevel('Siphonology') : null;

		mapLevel = autoLevelCheck(mapName, mapSpecial, biome);
		if (setting.repeat && minLevel > mapLevel) return farmingDetails;
	}

	if (mapSettings.mapName.includes('Hits Survived') && game.global.mapRunCounter >= Math.min(mapsRunCap, getPageSetting('advancedNurseriesMapCap'))) {
		const portalZoneCheck = getTotalPortals() + '_' + game.global.world;
		if (MODULES.mapFunctions.isHealthFarming !== portalZoneCheck) {
			MODULES.mapFunctions.isHealthFarming = portalZoneCheck;
		}
	}

	const hdTypeMap = {
		world: 'hdRatio',
		voidFarm: 'vhdRatioVoid',
		void: 'hdRatioVoid',
		map: 'hdRatioMap',
		hitsSurvived: 'hitsSurvived',
		hitsSurvivedVoid: 'hitsSurvivedVoid'
	};

	const hdRatio = hdStats[hdTypeMap[hdType]] || null;

	//Skipping farm if map repeat value is greater than our max maps value
	let shouldMap = hdType.includes('hitsSurvived') ? hdRatio < settingTarget : hdType === 'maplevel' ? setting.hdBase > whichAutoLevel() : hdRatio > settingTarget;

	const shouldSkip = mapSettings.mapName !== mapName && !shouldMap;
	const mapType = setting.repeat ? game.global.mapBonus : Math.max(0, game.global.mapRunCounter - 1);

	if (shouldMap && game.global.mapsActive && mapSettings.mapName === mapName && mapType > mapsRunCap) shouldMap = false;
	let hasVoidFarmed = false;

	if (shouldSkip || mapType === mapsRunCap || (mapSettings.mapName === mapName && !shouldMap)) {
		if (!shouldSkip) mappingDetails(mapName, mapLevel, mapSpecial, hdRatio, settingTarget, hdType);
		//Messages detailing why we are skipping mapping.
		if (shouldSkip) {
			if (hdType.includes('hitsSurvived')) {
				debug(`Hits Survived (z${game.global.world}c${game.global.lastClearedCell + 2}) skipped as Hits Survived goal has been met (${hitsSurvived.toFixed(2)}/${settingTarget.toFixed(2)}).`, 'map_Skip');
			} else if (hdType !== 'maplevel') {
				debug(`HD Farm (z${game.global.world}c${game.global.lastClearedCell + 2}) skipped as HD Ratio goal has been met (${hdRatio.toFixed(2)}/${settingTarget.toFixed(2)}).`, 'map_Skip');
			} else {
				const autoLevel = whichAutoLevel();
				debug(`HD Farm (z${game.global.world}c${game.global.lastClearedCell + 2}) skipped as Map Level goal has been met (Auto Level ${setting.hdBase}/${autoLevel}).`, 'map_Skip');
			}
		}

		resetMapVars(setting, settingName);
		shouldMap = false;
		if (game.global.mapsActive) recycleMap_AT();
		if (voidFarm) hasVoidFarmed = true;
	}

	let status = '';

	if (hdType.includes('hitsSurvived')) {
		status = `${hdType === 'hitsSurvivedVoid' ? 'Void&nbsp;' : ''}`;
		status += `Hits&nbsp;Survived to:&nbsp;${prettify(settingTarget.toFixed(2))}<br>
		Current:&nbsp;${prettify(hdRatio.toFixed(2))}`;
	} else {
		status = `HD&nbsp;Farm&nbsp;to:&nbsp;${
			hdType !== 'maplevel'
				? `${prettify(settingTarget.toFixed(2))}<br>Current&nbsp;HD:&nbsp;${prettify(hdRatio.toFixed(2))}`
				: `<br>
		${setting.hdBase >= 0 ? '+' : ''}${setting.hdBase} Auto Level`
		}`;
	}
	status += `<br> Maps:&nbsp; ${mapType}/${mapsRunCap === Infinity ? '∞' : mapsRunCap}`;
	const repeat = mapType + 1 === mapsRunCap;

	Object.assign(farmingDetails, {
		shouldRun: shouldMap,
		mapName: mapName,
		mapLevel: mapLevel,
		autoLevel: setting.autoLevel,
		special: mapSpecial,
		gather: biome === 'Forest' ? 'wood' : 'metal',
		jobRatio: jobRatio,
		hdType: hdType,
		hdRatio: settingTarget,
		hdRatio2: hdRatio,
		repeat: !repeat,
		status: status,
		runCap: mapsRunCap,
		shouldHealthFarm: hdType.includes('hitsSurvived'),
		voidHitsSurvived: hdType === 'hitsSurvivedVoid' || hdType === 'void',
		settingIndex: settingIndex,
		priority: setting.priority,
		mapBonus: setting.repeat,
		biome
	});

	if (voidFarm) {
		Object.assign(farmingDetails, {
			hasVoidFarmed,
			boneChargeUsed: mapSettings.boneChargeUsed,
			voidHDIndex: mapSettings.voidHDIndex,
			dropdown: mapSettings.dropdown,
			dropdown2: mapSettings.dropdown2,
			voidTrigger: mapSettings.voidTrigger,
			portalAfterVoids: mapSettings.portalAfterVoids,
			voidFarm: true
		});
	}

	return farmingDetails;
}

function farmingDecision() {
	setupAddonUser();
	let farmingDetails = {
		shouldRun: false,
		mapName: '',
		levelCheck: Infinity
	};

	if (!game.global.mapsUnlocked || _leadDisableMapping()) return (mapSettings = farmingDetails);

	let mapTypes = [];

	if (game.global.universe === 1) {
		mapTypes = [mapDestacking, prestigeClimb, prestigeRaiding, bionicRaiding, mapFarm, hdFarm, voidMaps, experience, mapBonus, toxicity, _obtainUniqueMap];

		if (challengeActive('Mapology') && getPageSetting('mapology') && getPageSetting('mapologyMapOverrides')) mapTypes = [prestigeClimb, prestigeRaiding, bionicRaiding, voidMaps, _obtainUniqueMap];

		if (challengeActive('Frigid') && getPageSetting('frigid') && game.challenges.Frigid.warmth > 0) mapTypes = [voidMaps];
	}

	if (game.global.universe === 2) {
		/* disable mapping if we have Withered as it's more beneficial to just push through the zone(s). */
		if (game.challenges.Wither.healImmunity > 0 && getPageSetting('wither') && getPageSetting('witherFarm')) return (mapSettings = farmingDetails);

		mapTypes = [mapDestacking, quest, archaeology, berserk, pandemoniumDestack, pandemoniumEquipFarm, desolationGearScum, desolation, prestigeClimb, prestigeRaiding, smithyFarm, mapFarm, tributeFarm, worshipperFarm, quagmire, insanity, alchemy, hypothermia, hdFarm, voidMaps, mapBonus, wither, mayhem, glass, smithless, _obtainUniqueMap];
	}

	const settingAffix = trimpStats.isC3 ? 'C2' : trimpStats.isDaily ? 'Daily' : '';
	if (isDoingSpire() && getPageSetting('spireSkipMapping' + settingAffix) && game.global.mapBonus === 10) mapSettings = farmingDetails;

	if (usingBreedHeirloom(true)) {
		if (atConfig.intervals.oneMinute && (game.global.fighting || newArmyRdy()) && getPageSetting('autoMaps')) {
			debug(`Your breed heirloom is equipped and mapping is disabled due to it. If this is not intentional then swap the heirloom you're using for breeding with another.`, `heirlooms`);
		}

		return;
	}

	/* skipping map farming if in Decay or Melt and above stack count user input */
	if (decaySkipMaps()) {
		mapTypes = [prestigeClimb, voidMaps, _obtainUniqueMap];
	}

	const priorityList = [];
	//If we are currently running a map and it should be continued then continue running it.
	//Running the entire function again is done to ensure that we update the status message and check if it still wants to run.
	if (mapSettings.mapName !== '' && mapTypes.includes(mapSettings.settingName)) {
		const mapCheck = mapSettings.settingName();
		if (mapCheck.shouldRun) {
			farmingDetails = mapCheck;
			farmingDetails.settingName = mapSettings.settingName;
		}
	}

	//Checking which settings should be run and adding them to a priority list.
	//This should only run if we aren't already running a setting.
	if (farmingDetails.mapName === '') {
		for (const map of mapTypes) {
			const mapCheck = map(true);
			if (mapCheck && mapCheck.mapName === undefined) {
				mapCheck.settingName = map;
				priorityList.push(mapCheck);
			}
		}
		/* sort priority list by priority > mapTypes index(settingName) if the priority sorting toggle is on */
		if (getPageSetting('autoMapsPriority')) {
			priorityList.sort(function (a, b) {
				if (a.priority === b.priority) return mapTypes.indexOf(a.settingName) > mapTypes.indexOf(b.settingName) ? 1 : -1;
				return a.priority > b.priority ? 1 : -1;
			});
		}
		//loops through each item in the priority list and checks if it should be run.
		for (const item in priorityList) {
			const mapCheck = priorityList[item].settingName();
			if (mapCheck.shouldRun) {
				farmingDetails = mapCheck;
				farmingDetails.settingName = priorityList[item].settingName;
				break;
			}
		}
	}

	//If in desolation then check if we should destack before farming.
	//This will ALWAYS run when above 0 stacks and another type of farming is meant to be done as it will destack and then run the farming type.
	if (farmingDetails.mapName !== '' && game.challenges.Desolation.chilled > 0 && getPageSetting('desolation') && !MODULES.mapFunctions.desoGearScum && challengeActive('Desolation') && !farmingDetails.mapName.includes('Desolation Destacking')) {
		const desolationCheck = desolation(false, true);
		if (desolationCheck.shouldRun) {
			farmingDetails = desolationCheck;
			farmingDetails.settingName = desolation;
		}
	}

	//If running map bonus with Quagmire active then we should run quagmire before farming if it is set to run on this zone.
	if (farmingDetails.mapName === 'Map Bonus' && challengeActive('Quagmire') && quagmire().shouldRun) farmingDetails = quagmire();

	//Setup level check so that we can compare if we need to do some work with map run counters
	farmingDetails.levelCheck = farmingDetails.autoLevel ? farmingDetails.mapLevel : Infinity;
	mapSettings = farmingDetails;
}

function getBiome(mapGoal, resourceGoal) {
	const dropBased = (challengeActive('Trapper') && game.stats.highestLevel.valueTotal() < 800) || (challengeActive('Trappapalooza') && game.stats.highestRadLevel.valueTotal() < 220) || challengeActive('Metal');
	if (dropBased && !resourceGoal && challengeActive('Metal')) resourceGoal = 'Mountain';

	let biome;
	if (resourceGoal && dropBased) biome = game.global.farmlandsUnlocked && getFarmlandsResType() === game.mapConfig.locations[resourceGoal].resourceType ? 'Farmlands' : resourceGoal;
	else if (mapGoal === 'fragments' || mapGoal === 'gems') biome = 'Depths';
	else if (mapGoal === 'fragConservation') biome = 'Random';
	else if (game.global.universe === 2 && game.global.farmlandsUnlocked) biome = 'Farmlands';
	else if (game.global.decayDone) biome = 'Plentiful';
	else if (needGymystic()) biome = 'Forest';
	else biome = hdStats.biomeEff ? hdStats.biomeEff.biome : 'Mountain';

	return biome;
}

function getAvailableSpecials(special, skipCaches) {
	if (!special) return '0';

	const specialToMods = {
		lsc: ['lsc', 'hc', 'ssc', 'lc'],
		lwc: ['lwc', 'hc', 'swc', 'lc'],
		lmc: ['lmc', 'hc', 'smc', 'lc'],
		lrc: ['lrc', 'src', 'fa'],
		p: ['p', 'fa']
	};

	const cacheMods = specialToMods[special] || [special];
	const hze = getHighestLevelCleared() + 1;
	const unlocksAt = game.global.universe === 2 ? 'unlocksAt2' : 'unlocksAt';

	let bestMod;
	for (let mod of cacheMods) {
		if (typeof mapSpecialModifierConfig[mod] === 'undefined') continue;
		if ((mod === 'lmc' || mod === 'smc') && (challengeActive('Metal') || challengeActive('Transmute'))) mod = mod.charAt(0) + 'wc';
		if (skipCaches && mod === 'hc') continue;

		const unlock = mapSpecialModifierConfig[mod].name.includes('Research') ? mapSpecialModifierConfig[mod].unlocksAt2() : mapSpecialModifierConfig[mod][unlocksAt];
		if (unlock && unlock <= hze) {
			bestMod = mod;
			break;
		}
	}

	if (!bestMod || (bestMod === 'fa' && trimpStats.hyperspeed2)) bestMod = '0';
	return bestMod;
}

function getSpecialTime(special) {
	if (special === 'lmc') return 20;
	if (special === 'lc') return 14;
	if (special === 'smc') return 10;
	if (special === 'hc') return 7;

	return 0;
}

function setMapSliders(plusLevel, special = '0', biome = getBiome(), mapSliders = [9, 9, 9], perfectMaps = true) {
	const maplevel = plusLevel < 0 ? game.global.world + plusLevel : game.global.world;
	const [loot, size, difficulty] = mapSliders;
	if (!plusLevel || plusLevel < 0) plusLevel = 0;
	if (loot !== 9 || size !== 9 || difficulty !== 9) perfectMaps = false;
	const currentLevel = Number(document.getElementById('mapLevelInput').value);

	document.getElementById('biomeAdvMapsSelect').value = biome;
	document.getElementById('advExtraLevelSelect').value = plusLevel > 0 ? plusLevel : 0;
	document.getElementById('advSpecialSelect').value = special;
	document.getElementById('lootAdvMapsRange').value = loot;
	document.getElementById('sizeAdvMapsRange').value = size;
	document.getElementById('difficultyAdvMapsRange').value = difficulty;
	document.getElementById('advPerfectCheckbox').dataset.checked = true;
	document.getElementById('mapLevelInput').value = maplevel;

	const hze = getHighestLevelCleared();
	if (plusLevel > 0 && currentLevel < game.global.world && hze >= getUnlockZone('extra')) setAdvExtraZoneText();
	if (hze >= getUnlockZone('perfect')) checkSlidersForPerfect();

	if (!perfectMaps) {
		if (updateMapCost(true) > game.resources.fragments.owned) {
			document.getElementById('advPerfectCheckbox').dataset.checked = false;
			updateMapCost();
		}

		if (mapSettings.mapName === 'Insanity Farm') {
			_reduceMapSlidersInsanity();
		} else {
			_reduceMapSliders(special);
		}
	}

	return updateMapCost(true);
}

function _reduceMapSliders(special) {
	const fragmentsOwned = game.resources.fragments.owned;

	while (difficultyAdvMapsRange.value > 0 && updateMapCost(true) > fragmentsOwned) difficultyAdvMapsRange.value -= 1;
	while (lootAdvMapsRange.value > 0 && updateMapCost(true) > fragmentsOwned) lootAdvMapsRange.value -= 1;

	//Set biome to random if we have jestimps/caches we can run since size will be by far the most important that way
	if (!trimpStats.mountainPriority && updateMapCost(true) > fragmentsOwned && !challengeActive('Metal') && mapSettings.mapName !== 'Alchemy Farm') document.getElementById('biomeAdvMapsSelect').value = 'Random';
	if (updateMapCost(true) > fragmentsOwned && (special === '0' || !mapSpecialModifierConfig[special].name.includes('Cache'))) document.getElementById('advSpecialSelect').value = 0;

	while (sizeAdvMapsRange.value > 0 && updateMapCost(true) > fragmentsOwned) sizeAdvMapsRange.value -= 1;
	if (updateMapCost(true) > fragmentsOwned) document.getElementById('advSpecialSelect').value = 0;
	if (trimpStats.mountainPriority && updateMapCost(true) > fragmentsOwned && !challengeActive('Metal') && mapSettings.mapName !== 'Alchemy Farm') {
		document.getElementById('biomeAdvMapsSelect').value = 'Random';
		updateMapCost();
	}
}

function _reduceMapSlidersInsanity() {
	const fragmentsOwned = game.resources.fragments.owned;

	while (sizeAdvMapsRange.value > 0 && updateMapCost(true) > fragmentsOwned) sizeAdvMapsRange.value -= 1;
	if (!trimpStats.mountainPriority && updateMapCost(true) > fragmentsOwned && !challengeActive('Metal')) document.getElementById('biomeAdvMapsSelect').value = 'Random';
	while (lootAdvMapsRange.value > 0 && updateMapCost(true) > fragmentsOwned) lootAdvMapsRange.value -= 1;
	while (difficultyAdvMapsRange.value > 0 && updateMapCost(true) > fragmentsOwned) difficultyAdvMapsRange.value -= 1;
	if (updateMapCost(true) > fragmentsOwned) document.getElementById('advSpecialSelect').value = 0;
}

function _simulateSliders(mapLevel, special = getAvailableSpecials('lmc'), biome = getBiome(), sliders = [9, 9, 9], perfect = true, keepPerfect = false) {
	const fragmentsOwned = game.resources.fragments.owned;
	mapLevel = mapLevel - game.global.world;

	/* sliders is [loot,size, difficulty] */
	if (!keepPerfect) {
		if (mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned) perfect = false;

		while (sliders[2] > 0 && mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned) sliders[2] -= 1;
		while (sliders[0] > 0 && mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned) sliders[0] -= 1;

		if (mapSettings.mapName !== 'Insanity Farm') {
			if (!trimpStats.mountainPriority && mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned && !challengeActive('Metal')) biome = 'Random';
			if (mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned && (special === '0' || !mapSpecialModifierConfig[special].name.includes('Cache'))) special = '0';

			while (sliders[1] > 0 && mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned) sliders[1] -= 1;

			if (special !== '0' && mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned) special = '0';
			if (biome !== 'Random' && trimpStats.mountainPriority && mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned && !challengeActive('Metal')) {
				biome = 'Random';
			}
		} else {
			while (sliders[1] > 0 && mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned) sliders[1] -= 1;
			if (!trimpStats.mountainPriority && mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned && !challengeActive('Metal')) biome = 'Random';
			while (sliders[0] > 0 && mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned) sliders[0] -= 1;
			while (sliders[2] > 0 && mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned) sliders[2] -= 1;
			if (mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned) special = '0';
		}
	}

	const lootValues = Math.floor(getMapMinMax('loot', sliders[0])[perfect ? 1 : 0] * 100) / 100;
	const sizeValues = getMapMinMax('size', sliders[1])[perfect ? 0 : 1];
	let difficultyValues = Math.floor(getMapMinMax('difficulty', sliders[2])[perfect ? 0 : 1] * 100) / 100;
	if (challengeActive('Mapocalypse')) difficultyValues += 3;

	return {
		name: 'simulatedMap',
		level: mapLevel + game.global.world,
		mapLevel,
		special,
		location: biome,
		loot: lootValues,
		size: sizeValues,
		difficulty: difficultyValues,
		sliders: {
			loot: sliders[0],
			size: sliders[1],
			difficulty: sliders[2]
		},
		perfect
	};
}

function mapCost(plusLevel = 0, specialModifier = getAvailableSpecials('lmc'), biome = getBiome(), sliders = [9, 9, 9], perfect = true) {
	const mapLevel = Math.max(game.global.world, 6) + (plusLevel < 0 ? plusLevel : 0);
	let baseCost = sliders[0] + sliders[1] + sliders[2];
	baseCost *= game.global.world >= 60 ? 0.74 : 1;

	if (perfect && sliders.reduce((a, b) => a + b) === 27) baseCost += 6;
	if (plusLevel > 0) baseCost += plusLevel * 10;
	if (specialModifier !== '0') baseCost += mapSpecialModifierConfig[specialModifier].costIncrease;

	baseCost += mapLevel;
	baseCost = Math.floor((baseCost / 150) * Math.pow(1.14, baseCost - 1) * mapLevel * 2 * Math.pow(1.03 + mapLevel / 50000, mapLevel));
	baseCost *= biome !== 'Random' ? 2 : 1;

	return baseCost;
}

function mapCostMin(level, specialModifier, biome, sliders = [9, 9, 9]) {
	const perfect = game.resources.fragments.owned >= mapCost(level, specialModifier, biome);

	if (!perfect) {
		while (sliders[0] > 0 && sliders[2] > 0 && mapCost(level, specialModifier, biome, sliders, perfect) > game.resources.fragments.owned) {
			sliders[0]--;
			if (mapCost(level, specialModifier, biome, sliders, perfect) <= game.resources.fragments.owned) break;
			sliders[2]--;
		}
	}

	return mapCost(level, specialModifier, biome, sliders, perfect);
}

function shouldSkipSetting(currSetting, world, settingName, dailyAddition) {
	if (dailyAddition && dailyAddition.active) {
		if (dailyAddition.skipZone) return true;
		if (!settingShouldRun(currSetting, world, 0, settingName) && !settingShouldRun(currSetting, world, 1, settingName)) return true;
	} else if (!settingShouldRun(currSetting, world, 0, settingName)) return true;

	return false;
}

function shouldSkipSettingPrestigeGoal(currSetting, mapName) {
	if (currSetting.prestigeGoal) {
		const targetPrestige = _raidingTargetPrestige(currSetting);
		const raidZones = _raidingRaidZone(currSetting, mapName);
		const [equipsToFarm] = prestigesToGet(raidZones, targetPrestige);
		return equipsToFarm === 0;
	}
	return false;
}

function findSettingsIndex(settingName, baseSettings, mapName, dailyAddition, skipHealthCheck) {
	for (let y = 1; y < baseSettings.length; y++) {
		const currSetting = baseSettings[y];
		const world = currSetting.world;
		if (currSetting.atlantrimp && !game.mapUnlocks.AncientTreasure.canRunOnce) continue;
		if (currSetting.hdRatio && currSetting.hdRatio > 0 && hdStats.hdRatio < currSetting.hdRatio) continue;
		if (currSetting.hdType) {
			if (currSetting.hdType.toLowerCase().includes('void') && game.global.totalVoidMaps === 0) continue;
			if (skipHealthCheck && currSetting.hdType.includes('hitsSurvived')) continue;
		}
		currSetting.cell = currSetting.cell || 100 - maxOneShotPower() + 1;

		if (shouldSkipSetting(currSetting, world, settingName, dailyAddition)) continue;
		if (shouldSkipSettingPrestigeGoal(currSetting, mapName)) continue;

		currSetting.repeatevery = currSetting.repeatevery || (currSetting.hdType ? 1 : 0);

		if (isWorldMatch(world, currSetting.repeatevery) || (dailyAddition && dailyAddition.active && isWorldMatch(world + 1, currSetting.repeatevery))) {
			return y;
		}
	}
	return null;
}

function isWorldMatch(world, repeatevery) {
	return game.global.world === world || (game.global.world - world) % repeatevery === 0;
}

//Checks to see if the line from the settings should run
function settingShouldRun(currSetting, world, zoneReduction = 0, settingName) {
	if (!currSetting || !world || _berserkDisableMapping()) return false;

	world += zoneReduction;
	if (!currSetting.active || game.global.world < world) return false;
	// No idea what the latter part of this line is meant to skip during. Challenge settings that don't have a repeatevery line defined?
	if (game.global.world > world && (currSetting.repeatevery === 0 || (typeof currSetting.repeatevery === 'undefined' && typeof currSetting.repeat === 'undefined' && typeof currSetting.hdType === 'undefined' && typeof currSetting.voidHDRatio === 'undefined'))) return false;

	//If the setting is marked as done then skips.
	const totalPortals = getTotalPortals();
	const value = game.global.universe === 2 ? 'valueU2' : 'value';
	if (settingName && currSetting.row) {
		const settingDone = game.global.addonUser.mapData[settingName][value][currSetting.row].done;
		if (settingDone === `${totalPortals}_${game.global.world}`) {
			if (currSetting.hdType === 'hitsSurvived' && hdFarmSettingRatio(currSetting) * 0.8 > hdStats.hitsSurvived && getPageSetting('hitsSurvivedReset') === 2) {
				game.global.addonUser.mapData[settingName][value][currSetting.row].done = '';
			} else {
				return false;
			}
		}
		//Ensure we don't eternally farm if daily reset timer is low enough that it will start again next zone
		if (currSetting.mapType && currSetting.mapType === 'Daily Reset' && settingDone && settingDone.split('_')[0] === totalPortals.toString()) return false;
	}

	//Skips if past designated end zone
	if (game.global.world > currSetting.endzone + zoneReduction) return false;

	if (currSetting.endzone && game.global.world > currSetting.endzone + zoneReduction) return false;
	if (currSetting.bonebelow && game.permaBoneBonuses.boosts.charges <= currSetting.bonebelow) return false;

	const liquified = liquifiedZone();
	if (!liquified && game.global.lastClearedCell + 2 < currSetting.cell) return false;

	if ((currSetting.runType && _noMappingChallenges()) || challengeActive('Downsize') || (challengeActive('Berserk') && getPageSetting('berserk'))) {
		if (trimpStats.isC3 && (currSetting.runType !== 'C3' || !challengeActive(currSetting.challenge3))) return false;
		if (trimpStats.isOneOff && (currSetting.runType !== 'One Off' || !challengeActive(currSetting.challengeOneOff))) return false;
	}
	//Skips if challenge type isn't set to the type we're currently running or if it's not the challenge that's being run.
	else if (currSetting.runType && currSetting.runType !== 'All') {
		//Dailies
		if (trimpStats.isDaily) {
			if (currSetting.runType !== 'Daily') return false;
		}
		//C2/C3 runs + special challenges
		else if (trimpStats.isC3) {
			if (currSetting.runType !== 'C3') return false;
			else if (currSetting.challenge3 !== 'All' && !challengeActive(currSetting.challenge3)) return false;
		} else if (trimpStats.isOneOff) {
			if (currSetting.runType !== 'One Off') return false;
			if (currSetting.challengeOneOff !== 'All' && !challengeActive(currSetting.challengeOneOff)) return false;
		}
		//Fillers (non-daily/c2/c3) and One off challenges
		else {
			if (currSetting.runType === 'Filler') {
				const currChallenge = currSetting.challenge === 'No Challenge' ? '' : currSetting.challenge;
				if (currSetting.challenge !== 'All' && !challengeActive(currChallenge)) return false;
			} else return false;
		}
	}

	return true;
}

function autoLevelCheck(mapName, mapSpecial, biome = undefined) {
	const isSmithyFarm = mapName === 'Smithy Farm';
	const isHDFarm = (mapName === 'HD Farm' || mapName === 'Hits Survived') && mapSettings.mapName.includes(mapName);

	const mapObj = isSmithyFarm || isHDFarm ? getCurrentMapObject() : null;
	const mapBonus = isSmithyFarm && game.global.mapsActive && typeof mapObj.bonus !== 'undefined' ? mapObj.bonus.slice(1) : '0';
	const index = isSmithyFarm ? ['sc', 'wc', 'mc'].indexOf(mapBonus) : null;

	const incorrectBiome = isHDFarm && game.global.mapsActive && ((biome === 'Any' && mapObj.location === 'Forest') || biome !== mapObj.location);

	let repeatCounter = isSmithyFarm ? MODULES.maps.mapRepeatsSmithy[index] : MODULES.maps.mapRepeats;
	const mapLevel = callAutoMapLevel(mapName, mapSpecial);

	if (game.global.mapRunCounter === 0 && game.global.mapsActive) {
		if (repeatCounter !== 0 && isFinite(repeatCounter)) game.global.mapRunCounter = repeatCounter;
		repeatCounter = 0;
	}

	if ((mapLevel !== mapSettings.levelCheck && mapSettings.levelCheck !== Infinity) || incorrectBiome) {
		repeatCounter = game.global.mapRunCounter + 1;
	}

	isSmithyFarm ? (MODULES.maps.mapRepeatsSmithy[index] = repeatCounter) : (MODULES.maps.mapRepeats = repeatCounter);

	return mapLevel;
}

function resetMapVars(setting, settingName) {
	const totalPortals = getTotalPortals();
	game.global.mapRunCounter = 0;
	mapSettings.levelCheck = Infinity;
	mapSettings.mapName = '';
	MODULES.maps.mapTimer = 0;
	MODULES.maps.mapRepeats = 0;
	MODULES.maps.slowScumming = false;
	MODULES.maps.mapRepeatsSmithy = [0, 0, 0];

	if (mapSettings.voidFarm) MODULES.mapFunctions.hasVoidFarmed = `${totalPortals}_${game.global.world}`;
	if (setting && setting.hitsSurvivedFarm) MODULES.mapFunctions.hasHealthFarmed = `${totalPortals}_${game.global.world}`;

	if (setting && settingName && setting.row) {
		const value = game.global.universe === 2 ? 'valueU2' : 'value';
		game.global.addonUser.mapData[settingName][value][setting.row].done = `${totalPortals}_${game.global.world}`;
	}

	//Tribute Farm
	delete mapSettings.buyBuildings;
	//Prestige Farm
	delete mapSettings.prestigeMapArray;
	delete mapSettings.totalMapCost;
	delete mapSettings.mapSliders;
	delete mapSettings.prestigeFragMapBought;
	//Alch
	delete mapSettings.potionTarget;
	delete mapSettings.potionIndex;
	saveSettings();
}

function mappingDetails(mapName, mapLevel, mapSpecial, extra, extra2, extra3) {
	const mapType = mapName.includes('Destack') ? 'map_Destacking' : 'map_Details';
	if (!getPageSetting('spamMessages')[mapType]) return;
	if (!getPageSetting('autoMaps')) return;
	if (!mapName) return;
	if (mapName === 'HD Farm' && extra3 === 'hitsSurvived') mapName = 'Hits Survived';

	const mapObj = getCurrentMapObject();
	const mapProg = game.global.mapsActive ? (getCurrentMapCell().level - 1) / mapObj.size : 0;
	const mappingLength = mapProg > 0 ? (game.global.mapRunCounter + mapProg).toFixed(2) : game.global.mapRunCounter;
	//Setting special to current maps special if we're in a map.
	if (game.global.mapsActive) mapSpecial = mapObj.bonus === undefined ? 'no special' : mapObj.bonus;
	if (mapSpecial === '0') mapSpecial = 'no special';
	if (mapName === 'Bionic Raiding') mapSpecial = masteryPurchased('bionic2') ? 'fa' : 'no special';

	const timeMapping = MODULES.maps.mapTimer > 0 ? getZoneSeconds() - MODULES.maps.mapTimer : 0;
	const currCell = game.global.lastClearedCell + 2;
	let message = '';

	const mapDetails = ` (z${game.global.world}c${currCell}) took `;
	const timeDescription = formatTimeForDescriptions(timeMapping);
	const mapLevelPrefix = mapLevel >= 0 ? '+' : '';

	if (mapName !== 'Void Map' && mapName !== 'Quagmire Farm' && mapName !== 'Smithy Farm' && mapName !== 'Bionic Raiding' && mapName !== 'Quest') {
		message += `${mapName}${mapDetails}${mappingLength} (${mapLevelPrefix}${mapLevel} ${mapSpecial}) map${addAnS(mappingLength)} and ${timeDescription}.`;
	} else if (mapName === 'Smithy Farm') {
		message += `${mapName}${mapDetails}${MODULES.maps.mapRepeatsSmithy[0]} food, ${MODULES.maps.mapRepeatsSmithy[2]} metal, ${MODULES.maps.mapRepeatsSmithy[1]} wood (${mapLevelPrefix}${mapLevel}) maps and ${timeDescription}.`;
	} else if (mapName === 'Quagmire Farm') {
		message += `${mapName}${mapDetails}${mappingLength} map${addAnS(mappingLength)} and ${timeDescription}.`;
	} else {
		message += `${mapName}${mapDetails}${timeDescription}.`;
	}

	if (mapName === 'Void Map') {
		const hdObject = {
			'World HD Ratio': hdStats.hdRatio,
			'Map HD Ratio': hdStats.hdRatioMap,
			'Void HD Ratio': hdStats.hdRatioVoid,
			'Hits Survived': hdStats.hitsSurvived,
			'Hits Survived Void': hdStats.hitsSurvivedVoid
		};
		message += ` Void maps were triggered by ${mapSettings.voidTrigger}.`;

		if (mapSettings.dropdown) {
			message += `<br>\n`;
			message += `${mapSettings.dropdown.name} (Start: ${prettify(mapSettings.dropdown.hdRatio)} | End: ${prettify(hdObject[mapSettings.dropdown.name])})<br>\n`;
			if (mapSettings.dropdown2) message += `${mapSettings.dropdown2.name} (Start: ${prettify(mapSettings.dropdown2.hdRatio)} | End: ${prettify(hdObject[mapSettings.dropdown2.name])})`;
		}
	} else if (mapName === 'Hits Survived') message += ` Finished with hits survived at ${prettify(whichHitsSurvived())}/${targetHitsSurvived()}.`;
	else if (mapName === 'HD Farm' && extra !== null) message += ` Finished with a HD Ratio of ${extra.toFixed(2)}/${extra2.toFixed(2)}.`;
	else if (mapName === 'HD Farm') {
		const autoLevel = whichAutoLevel();
		message += ` Finished with an auto level of ${autoLevel > 0 ? '+' : ''}${autoLevel}.`;
	} else if (mapName === 'Tribute Farm') message += ` Finished with ${game.buildings.Tribute.purchased} tributes and ${game.jobs.Meteorologist.owned} meteorologists.`;
	else if (mapName === 'Smithy Farm') message += ` Finished with ${game.buildings.Smithy.purchased} smithies.`;
	else if (mapName === 'Insanity Farm') message += ` Finished with ${game.challenges.Insanity.insanity} stacks.`;
	else if (mapName === 'Alchemy Farm') message += ` Finished with ${extra} ${extra2}.`;
	else if (mapName === 'Hypothermia Farm') message += ` Finished with (${prettify(game.resources.wood.owned)}/${prettify(extra.toFixed(2))}) wood.`;
	else if (mapName === 'Smithless Farm') message += ` Finished with enough damage to get ${extra}/3 stacks.`;

	MODULES.maps.mapRepeats = 0;
	delete mapSettings.mapBonus;
	debug(message, mapType);
}

function fragmentFarm() {
	const fragmentsNeeded = mapSettings.mapName === 'Prestige Raiding' && mapSettings.totalMapCost ? mapSettings.totalMapCost : mapCost(mapSettings.mapLevel, mapSettings.special, mapSettings.biome);
	const canAffordMap = game.resources.fragments.owned > fragmentsNeeded || !mapSettings.shouldRun;
	//Check to see if we can afford a perfect map with the maplevel & special selected. If we can then ignore this function otherwise farm fragments until we reach that goal.

	if (canAffordMap) {
		if (!mapSettings.shouldRun && !MODULES.maps.fragmentFarming) debug(`Fragment farming successful`, 'map_Details');
		delete mapSettings.prestigeFragMapBought;
		MODULES.maps.fragmentFarming = false;
		return;
	}

	MODULES.maps.fragmentFarming = true;
	//Purchase fragment farming map if we're in map chamber. If you don't have enough fragments for this map then RIP
	if (!game.global.preMapsActive) return;

	const mapLevel = masteryPurchased('mapLoot') ? -1 : 0;
	const special = getAvailableSpecials('fa');
	const biome = getBiome('fragments');
	let mapCheck = findMap(mapLevel, special, biome);

	if (!mapCheck) {
		setMapSliders(mapLevel, special, biome, [9, 9, 9], false);
		if (updateMapCost(true) <= game.resources.fragments.owned) {
			buyMap();
			mapCheck = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1];
		} else {
			debug(`Not enough fragments to purchase fragment farming map. Waiting for fragments. If you don't have explorers then you will have to manually disable auto maps and continue.`, 'maps');
			return;
		}
	}

	selectMap(mapCheck.id);
	debug(`Fragment farming for ${prettify(fragmentsNeeded)} fragments.`, 'map_Details');
	runMap();

	if (!game.global.repeatMap) repeatClicked();
	if (game.options.menu.repeatUntil.enabled !== 0) {
		game.options.menu.repeatUntil.enabled = 0;
		toggleSetting('repeatUntil', null, false, true);
	}
}

//Prestige Raiding
//Checks if map we want to run has equips
function prestigeMapHasEquips(number, raidzones, targetPrestige) {
	return prestigesToGet(raidzones - number, targetPrestige)[0] > 0;
}

//Get raid zone based on skipping map levels above x5 if we have scientist4 or microchip4. Will subtract 5 from the map level to account for this.
function getRaidZone(raidZone) {
	if (getSLevel() >= 4 && !challengeActive('Mapology')) {
		const lastDigitOfRaidZone = raidZone % 10;
		if (lastDigitOfRaidZone >= 6 || lastDigitOfRaidZone === 0) {
			raidZone -= 5;
		}
	}
	return raidZone;
}

//Calculate the percentage of fragment we should spend on a particular map
function calcFragmentPercentage(raidZone) {
	return !prestigesToGet(raidZone - 1, mapSettings.prestigeGoal)[0] ? 1 : getRaidZone(raidZone) - getRaidZone(raidZone - 1) === 1 ? 0.8 : 0.99;
}

//Calculate cost of maps for prestige raiding
function prestigeRaidingSliderCost(raidZone, special = getAvailableSpecials('p'), totalCost = 0, fragmentPercentage) {
	raidZone = getRaidZone(raidZone) - game.global.world;

	const fragmentsOwned = (game.resources.fragments.owned - totalCost) * fragmentPercentage;
	const sliders = mapSettings.fragSetting === 1 ? [0, 9, 0] : [9, 9, 9];
	let biome = mapSettings.fragSetting === 1 ? 'Random' : getBiome();
	let perfect = mapSettings.fragSetting === 1 ? false : true;

	//Gradually reduce map sliders if not using frag max setting!
	if (mapSettings.fragSetting !== 2) {
		if (mapCost(raidZone, special, biome, sliders, perfect) > fragmentsOwned) perfect = false;
		if (mapCost(raidZone, special, biome, sliders, perfect) > fragmentsOwned) biome = 'Random';

		//Reduce map loot
		while (sliders[0] > 0 && mapCost(raidZone, special, biome, sliders, perfect) > fragmentsOwned) sliders[0] -= 1;
		//Reduce map difficulty
		while (sliders[2] > 0 && mapCost(raidZone, special, biome, sliders, perfect) > fragmentsOwned) sliders[2] -= 1;
		//Remove map special if one is set. Removing FA/P here is better than dropping Size as that can more than double increase the length of the maps we run.
		if (mapCost(raidZone, special, biome, sliders, perfect) > fragmentsOwned) special = '0';
		//Reduce map size
		while (sliders[1] > 0 && mapCost(raidZone, special, biome, sliders, perfect) > fragmentsOwned) sliders[1] -= 1;
	}

	return [raidZone, special, biome, sliders, perfect];
}

//Identify total cost of prestige raiding maps
function prestigeTotalFragCost() {
	const fragmentPercentage = mapSettings.incrementMaps ? calcFragmentPercentage(mapSettings.raidzones) : 1;
	const sliders = new Array(5);
	let cost = 0;

	if (prestigesToGet(mapSettings.raidzones, mapSettings.prestigeGoal)[0]) {
		sliders[0] = prestigeRaidingSliderCost(mapSettings.raidzones, mapSettings.special, cost, fragmentPercentage);
		cost += mapCost(sliders[0][0], sliders[0][1], sliders[0][2], sliders[0][3], sliders[0][4]);
	}
	if (mapSettings.incrementMaps) {
		for (let i = 1; i < 5; i += 1) {
			if (prestigesToGet(mapSettings.raidzones - i, mapSettings.prestigeGoal)[0]) {
				sliders[i] = prestigeRaidingSliderCost(mapSettings.raidzones - i, mapSettings.special, cost, calcFragmentPercentage(mapSettings.raidzones - i));
				cost += mapCost(...sliders[i]);
			} else {
				break;
			}
		}
	}

	return {
		cost: cost,
		sliders: sliders
	};
}

function dailyModiferReduction() {
	if (!challengeActive('Daily')) return 0;

	let dailyMods = dailyModifiersOutput().split('<br>');
	dailyMods.length = dailyMods.length - 1;
	let dailyReduction = 0;
	const settingsArray = getPageSetting('dailyPortalSettingsArray');

	for (let item in settingsArray) {
		if (!settingsArray[item].enabled) continue;
		let dailyReductionTemp = 0;
		let modifier = item;
		if (modifier.includes('Weakness')) modifier = 'Enemies stack a debuff with each attack, reducing Trimp attack by';
		else if (modifier.includes('Famine')) modifier = 'less Metal, Food, Wood, and Gems from all sources';
		else if (modifier.includes('Large')) modifier = 'All housing can store';
		else if (modifier.includes('Void')) modifier = 'Enemies in Void Maps have';
		else if (modifier.includes('Heirlost')) modifier = 'Heirloom combat and resource bonuses are reduced by';

		for (let x = 0; x < dailyMods.length; x++) {
			if (dailyMods[x].includes(modifier)) {
				dailyReductionTemp = settingsArray[item].zone;
			}
			if (dailyReduction > dailyReductionTemp) dailyReduction = dailyReductionTemp;
		}
	}
	return dailyReduction;
}

function dailyOddOrEven() {
	const skipDetails = {
		active: false,
		oddMult: 1,
		evenMult: 1,
		skipZone: false,
		slipPct: 0,
		slipMult: 0,
		slipType: '',
		remainder: 0
	};

	if (!challengeActive('Daily') || !getPageSetting('mapOddEvenIncrement')) return skipDetails;
	if (game.global.world >= getNatureStartZone() && getEmpowerment() !== getZoneEmpowerment(game.global.world + 1)) return skipDetails;

	const dailyChallenge = game.global.dailyChallenge;
	if (typeof dailyChallenge.oddTrimpNerf !== 'undefined') skipDetails.oddMult -= dailyModifiers.oddTrimpNerf.getMult(dailyChallenge.oddTrimpNerf.strength);

	if (typeof dailyChallenge.evenTrimpBuff !== 'undefined') skipDetails.evenMult = dailyModifiers.evenTrimpBuff.getMult(dailyChallenge.evenTrimpBuff.strength);

	if (typeof dailyChallenge.slippery !== 'undefined') {
		skipDetails.slipStr = dailyChallenge.slippery.strength / 100;
		skipDetails.slipPct = Math.min(skipDetails.slipStr, 15);
		skipDetails.slipMult = 0.02 * skipDetails.slipPct * 100;
		skipDetails.slipType = skipDetails.slipStr > 0.15 ? 'even' : 'odd';
	}

	if (skipDetails.oddMult === 1 && skipDetails.evenMult === 1 && skipDetails.slipType === '') return skipDetails;

	const isOddMult = skipDetails.oddMult !== 1;
	const isEvenMult = skipDetails.evenMult !== 1;
	const isSlipType = skipDetails.slipType !== '';
	const oppositeName = skipDetails.slipType === 'even' ? 'odd' : 'even';

	if (isOddMult && isEvenMult) {
		if (isSlipType) {
			if (skipDetails.slipType === 'even' && (skipDetails.slipMult > 15 || (skipDetails.slipMult > 10 && skipDetails.oddMult > 0.5))) skipDetails.evenMult = 0;
			else skipDetails.oddMult = 0;
		} else {
			skipDetails.oddMult = 0;
		}
	} else if (isSlipType && (isOddMult || isEvenMult)) {
		if (skipDetails[oppositeName + 'Mult'] === 1) {
			skipDetails[skipDetails.slipType + 'Mult'] = 0;
		}
	} else if (isSlipType) {
		skipDetails[skipDetails.slipType + 'Mult'] = 0;
	} else if (isEvenMult) {
		skipDetails.oddMult = 0;
	}

	if (skipDetails.evenMult < 1) {
		if (game.global.world % 2 === 0) skipDetails.skipZone = true;
	} else if (skipDetails.oddMult < 1) {
		if (game.global.world % 2 === 1) skipDetails.skipZone = true;
		skipDetails.remainder = 1;
	}

	skipDetails.active = true;
	return skipDetails;
}

//I hope I never use this again. Scumming for slow map enemies!
function slowScum(slowTarget) {
	if (!game.global.mapsActive || game.global.lastClearedMapCell > -1 || !atConfig.running) return;
	atConfig.running = false;

	const map = getCurrentMapObject();
	if (map.size > 36) return;

	const maxSlowCells = Math.ceil(map.size / 2);
	let slowCellTarget = Math.ceil(Math.min(slowTarget || maxSlowCells, maxSlowCells));

	const runningDeso = challengeActive('Desolation');
	if (runningDeso) slowCellTarget = 9;

	let firstCellSlow = false;
	let slowCount = 0;
	game.global.fighting = false;

	game.global.mapRunCounter = 0;
	MODULES.maps.slowScumming = true;
	console.time();

	const impArray = runningDeso ? atData.fightInfo.exoticImps : atData.fightInfo.fastImps;

	let i = 0;
	//Repeats the process of exiting and re-entering maps until the first cell is slow and you have desired slow cell count on odd cells!
	while (slowCount < slowCellTarget || !firstCellSlow) {
		const mapGrid = game.global.mapGridArray;
		firstCellSlow = false;
		slowCount = 0;

		//Looping to figure out if we have enough slow enemies on odd cells
		for (let item in mapGrid) {
			if (mapGrid[item].level % 2 === 0) continue;
			if (impArray.includes(mapGrid[item].name)) slowCount++;
		}

		//Checking if the first enemy is slow
		let enemyName = mapGrid[0].name;
		if (impArray.includes(enemyName)) firstCellSlow = true;

		if (slowCount < slowCellTarget || !firstCellSlow) {
			buildMapGrid(game.global.currentMapId);
			game.global.mapRunCounter = 0;
		} else {
			break;
		}
		i++;
	}

	let msg = `${i} Rerolls. Current roll = ${slowCount} odd slow enemies.`;
	if (slowCount < slowCellTarget || !firstCellSlow) msg = 'Failed. ' + msg;
	console.timeEnd();
	atConfig.running = true;
	debug(msg, 'map_Details');
}

function getEnoughHealthMap(mapLevel, special, biome) {
	const minMapLevel = mapLevel + game.global.world;
	const simulateMap = _simulateSliders(minMapLevel, special, biome);
	let mapOwned = findMap(minMapLevel, special, biome);
	if (!mapOwned) mapOwned = findMap(minMapLevel, simulateMap.special, simulateMap.biome, simulateMap.perfect);

	if (mapOwned) {
		mapOwned = game.global.mapsOwnedArray[getMapIndex(mapOwned)];
	} else {
		mapOwned = simulateMap;
	}

	return mapOwned;
}

function autoLevelType(mapName = mapSettings.mapname) {
	const speedSettings = ['Map Bonus', 'Experience', 'Mayhem Destacking'];

	if (['HD Farm', 'Hits Survived'].includes(mapName) && game.global.mapBonus !== 10 && getPageSetting('mapBonusLevelType')) {
		if (mapName === 'HD Farm') speedSettings.push('HD Farm');
		else if (mapName === 'Hits Survived' && game.global.mapBonus < getPageSetting('mapBonusHealth')) speedSettings.push('Hits Survived');
	}

	return speedSettings.includes(mapName) ? 'speed' : 'loot';
}

function callAutoMapLevel(mapName, special) {
	const mapType = autoLevelType(mapName);
	const mapModifiers = {
		special: special || trimpStats.mapSpecial,
		biome: mapSettings.biome || trimpStats.mapBiome
	};

	if (hdStats.autoLevelZone !== game.global.world) {
		hdStats.autoLevelInitial = stats(lootDefault);
		hdStats.autoLevelZone = game.global.world;
	}

	if (mapName === 'Desolation Destacking' && challengeActive('Desolation') && hdStats.autoLevelZoneDeso !== game.global.world) {
		hdStats.autoLevelDesolation = stats(lootDestack);
		hdStats.autoLevelZoneDeso = game.global.world;
	}

	let mapLevel = mapSettings.levelCheck;
	if (mapLevel !== Infinity && challengeActive('Mapology')) return mapLevel;
	const autoLevelObj = mapName === 'Desolation Destacking' ? hdStats.autoLevelDesolation : hdStats.autoLevelInitial;

	if (mapLevel === Infinity) {
		mapLevel = get_best(autoLevelObj, true, mapModifiers)[mapType].mapLevel;
	} else if (mapName && atConfig.intervals.sixSecond) {
		let autoLevelData = get_best(autoLevelObj, true, mapModifiers)[mapType];
		const secondBestMap = autoLevelData[`${mapType}Second`];
		/* if (mapSettings.mapLevel && mapSettings.mapLevel === secondBestMap.mapLevel && autoLevelData.) {
		} */
		const autoLevel = autoLevelData.mapLevel;
		mapLevel = Math.max(mapLevel, autoLevel);

		const autoLevelDataNoFrags = get_best(autoLevelObj)[mapType];
		const autoLevelIgnoreFragments = autoLevelDataNoFrags.mapLevel;
		mapLevel = Math.min(mapLevel, autoLevelIgnoreFragments);
	}

	if (getCurrentQuest() === 8 || challengeActive('Bublé')) return mapLevel;
	mapLevel = autoLevelOverides(mapName, mapLevel, mapModifiers);
	return mapLevel;
}

function autoLevelOverides(mapName, mapLevel, mapModifiers) {
	const mapBonusLevel = game.global.universe === 1 ? -game.portal.Siphonology.level || 0 : 0;
	const checkMapBonus = game.global.mapBonus !== 10 && mapLevel < mapBonusLevel && (mapName === 'Map Bonus' || mapName === 'HD Farm' || (mapName === 'Hits Survived' && game.global.mapBonus < getPageSetting('mapBonusHealth')));
	let forceMapBonus = true;
	let canAffordMap = true;

	if (checkMapBonus) {
		const mapObj = game.global.mapsActive ? getCurrentMapObject() : null;
		const mapBonusMinSetting = getPageSetting('mapBonusMinLevel');
		const needPrestiges = autoLevelPrestiges(mapName, mapObj, mapLevel, mapBonusLevel);

		const aboveMinMapLevel = mapBonusMinSetting <= 0 || mapLevel > -mapBonusMinSetting - Math.abs(mapBonusLevel);
		const willCapMapBonus = game.global.mapBonus === 9 && game.global.mapsActive && mapObj.level >= game.global.world + mapBonusLevel;
		forceMapBonus = (needPrestiges || aboveMinMapLevel) && !willCapMapBonus;
		canAffordMap = game.resources.fragments.owned > mapCost(mapBonusLevel, undefined, undefined, [0, 0, 0]);

		if (game.global.universe === 1 && forceMapBonus) {
			const mapOwned = getEnoughHealthMap(mapBonusLevel, mapModifiers.special, mapModifiers.biome);
			forceMapBonus = enoughHealth(mapOwned, 'avg');
		}
	}

	const mapBonusConditions = [
		{ condition: mapName === 'Map Bonus' && mapBonusLevel > mapLevel && forceMapBonus, level: mapBonusLevel },
		{ condition: mapName === 'HD Farm' && game.global.mapBonus !== 10 && mapBonusLevel > mapLevel && forceMapBonus && canAffordMap, level: mapBonusLevel },
		{ condition: mapName === 'Hits Survived' && mapBonusLevel > mapLevel && game.global.mapBonus < getPageSetting('mapBonusHealth') && forceMapBonus && canAffordMap, level: mapBonusLevel },
		{ condition: challengeActive('Wither') && mapName !== 'Map Bonus' && mapLevel >= 0, level: -1 },
		{ condition: mapName === 'Quest' && mapLevel < mapBonusLevel && [6, 7].includes(getCurrentQuest()) && game.global.mapBonus !== 10, level: mapBonusLevel },
		{ condition: ['Insanity Farm', 'Pandemonium Destacking', 'Alchemy Farm', 'Glass', 'Desolation Destacking'].includes(mapName) && mapLevel <= 0, level: 1 },
		{ condition: mapName === 'Mayhem Destacking' && mapLevel < 0, level: getPageSetting('mayhemMapIncrease') > 0 ? getPageSetting('mayhemMapIncrease') : 0 },
		{ condition: mapName === 'Smithless Farm' && game.global.mapBonus !== 10 && mapLevel < mapBonusLevel, level: mapBonusLevel },
		{ condition: _insanityDisableUniqueMaps() && mapLevel < 0, level: 0 }
	];

	const matchingCondition = mapBonusConditions.find(({ condition }) => condition);
	if (matchingCondition) mapLevel = matchingCondition.level;
	return mapLevel;
}

function autoLevelPrestiges(mapName, mapObj, mapLevel, mapBonusLevel) {
	const [prestigesAvailable] = prestigesToGet(game.global.world + mapBonusLevel);
	let needPrestiges = prestigesAvailable !== 0 && prestigesUnboughtCount() === 0;

	if (needPrestiges) {
		/* Reduce map level zone to the value of the last prestige item we need to farm */
		if (mapName !== 'Map Bonus' && getPageSetting('mapBonusPrestige')) {
			while (mapLevel !== mapBonusLevel && prestigesToGet(game.global.world + mapBonusLevel - 1)[0] > 0) {
				mapBonusLevel--;
			}
		}

		if (game.global.mapsActive) {
			const [prestigesToFarm, mapsToRun] = prestigesToGet(game.global.world + mapBonusLevel);
			let shouldRepeat = mapObj.level >= game.global.world + mapBonusLevel;

			if (shouldRepeat) {
				shouldRepeat = mapsToRun > 1 || (mapObj.bonus === 'p' && mapsToRun > 2);
				/* if (!shouldRepeat && mapBonusMinLevel !== mapBonusLevel && prestigesAvailable !== prestigesToFarm) {
					while (mapBonusLevel !== mapBonusMinLevel && prestigesToGet(game.global.world + mapBonusLevel + 1)[0] === prestigesToFarm) {
						mapBonusLevel++;
					}
					shouldRepeat = true;
				} */
				if (!shouldRepeat) needPrestiges = false;
			}
		}
	}

	return needPrestiges;
}
