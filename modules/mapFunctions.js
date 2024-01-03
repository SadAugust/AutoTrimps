MODULES.mapFunctions = {};

MODULES.mapFunctions.afterVoids = false;
MODULES.mapFunctions.hasHealthFarmed = '';
MODULES.mapFunctions.hasVoidFarmed = '';
MODULES.mapFunctions.runUniqueMap = '';
MODULES.mapFunctions.quest = { run: false };
MODULES.mapFunctions.hypothermia = { buyPackrat: false };
MODULES.mapFunctions.desolation = { gearScum: false };

//Unique Maps Object. Used to store information about unique maps such as challenges that they need to be run to complete, zone they unlock, speedrun achievements linked to them.
MODULES.mapFunctions.uniqueMaps = Object.freeze({
	//Universe 1 Unique Maps
	'The Block': {
		zone: 11,
		challenges: ['Scientist', 'Trimp'],
		speedrun: 'blockTimed',
		universe: 1,
		mapUnlock: true,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (game.upgrades.Shieldblock.allowed) return false;
			if (aboveMapLevel && getPageSetting('equipShieldBlock')) return true; //Don't bother before z12 outside of manual unique map settings setup
			else if (game.mapUnlocks.BigWall.canRunOnce && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	'The Wall': {
		zone: 15,
		challenges: [],
		speedrun: 'wallTimed',
		universe: 1,
		mapUnlock: true,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (game.upgrades.Bounty.allowed) return false;
			if (aboveMapLevel && !game.talents.bounty.purchased) return true; //Don't bother before z16
			else if (mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	'Dimension of Anger': {
		zone: 20,
		challenges: ['Discipline', 'Metal', 'Size', 'Frugal', 'Coordinate'],
		speedrun: 'angerTimed',
		universe: 1,
		mapUnlock: false,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (document.getElementById('portalBtn').style.display !== 'none') return false;
			if (game.global.world - 1 > map.level) return true; //Don't bother before z22
			else if (game.mapUnlocks.Portal.canRunOnce && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	'Trimple Of Doom': {
		zone: 33,
		challenges: ['Meditate', 'Trapper'],
		speedrun: 'doomTimed',
		universe: 1,
		mapUnlock: false,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (aboveMapLevel && game.portal.Relentlessness.locked) return true; //Unlock the Relentlessness perk
			else if (game.mapUnlocks.AncientTreasure.canRunOnce && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	'The Prison': {
		zone: 80,
		challenges: ['Electricity', 'Mapocalypse'],
		speedrun: 'prisonTimed',
		universe: 1,
		mapUnlock: true,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (aboveMapLevel && game.global.prisonClear <= 0 && enoughHealth(map)) return true; //Unlock the Electricity challenge
			else if (game.mapUnlocks.ThePrison.canRunOnce && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	'Bionic Wonderland': {
		zone: 125,
		challenges: ['Crushed'],
		speedrun: 'bionicTimed',
		universe: 1,
		mapUnlock: true,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			return false;
		}
	},
	'Imploding Star': {
		zone: 170,
		challenges: ['Devastation'],
		speedrun: 'starTimed',
		universe: 1,
		mapUnlock: true,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (game.mapUnlocks.ImplodingStar.canRunOnce && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	//Universe 2 Unique Maps
	'Big Wall': {
		zone: 7,
		challenges: [''],
		speedrun: 'bigWallTimed',
		universe: 2,
		mapUnlock: true,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (game.upgrades.Bounty.allowed) return false;
			if (aboveMapLevel && !game.talents.bounty.purchased) return true; // we need Bounty
			else if (mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	'Dimension of Rage': {
		zone: 16,
		challenges: ['Unlucky'],
		speedrun: '',
		universe: 2,
		mapUnlock: false,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (document.getElementById('portalBtn').style.display !== 'none') return false;
			if (game.global.world - 1 > map.level && game.global.totalRadPortals === 0) return true; //Don't bother before z17
			else if (mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	'Prismatic Palace': {
		zone: 20,
		challenges: [''],
		speedrun: 'palaceTimed',
		universe: 2,
		mapUnlock: false,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (game.mapUnlocks.Prismalicious.canRunOnce && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	Atlantrimp: {
		zone: 33,
		challenges: [''],
		speedrun: 'atlantrimpTimed',
		universe: 2,
		mapUnlock: false,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (!game.mapUnlocks.AncientTreasure.canRunOnce) return false;
			else if (mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		}
	},
	'Melting Point': {
		zone: 50,
		challenges: [''],
		speedrun: 'meltingTimed',
		universe: 2,
		mapUnlock: false,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (!game.mapUnlocks.SmithFree.canRunOnce) return false;
			if (!trimpStats.isC3 && !trimpStats.isDaily && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;

			const uniqueMapSetting = getPageSetting('uniqueMapSettingsArray');
			const currChallenge = trimpStats.currChallenge.toLowerCase();
			var smithyGoal = Infinity;
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
		challenges: [''],
		speedrun: '',
		universe: 2,
		mapUnlock: false,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (mapSettings.mapName === 'Quagmire Farm' && quagmire().shouldRun) return true;
			return false;
		}
	},
	'Frozen Castle': {
		zone: 175,
		challenges: [''],
		speedrun: '',
		universe: 2,
		mapUnlock: false,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			const runningHypo = challengeActive('Hypothermia');
			const regularRun = !runningHypo && mapSetting.enabled && game.global.world >= mapSetting.zone && game.global.lastClearedCell + 2 >= mapSetting.cell;
			if (regularRun) return true;
			const hypoDefaultSettings = getPageSetting('hypothermiaSettings')[0];
			const hypothermiaRun = runningHypo && mapSettings.mapName !== 'Void Maps' && hypoDefaultSettings.active && game.global.world >= (hypoDefaultSettings.frozencastle[0] !== undefined ? parseInt(hypoDefaultSettings.frozencastle[0]) : 200) && (game.global.lastClearedCell + 2 >= (hypoDefaultSettings.frozencastle[1] !== undefined ? parseInt(hypoDefaultSettings.frozencastle[1]) : 99) || liquified);
			if (hypothermiaRun) return true;
			return false;
		}
	}
});

//Returns false if we can't any new speed runs, unless it's the first tier
function shouldSpeedRun(map, achievement) {
	if (achievement.finished === achievement.tiers.length) return false;

	let speed = 10 * 0.95 ** getPerkLevel('Agility');
	speed -= mastery('hyperspeed') + trimpStats.hyperspeed2;
	speed += challengeActive('Quagmire') ? game.challenges.Quagmire.getSpeedPenalty() / 100 : 0;
	speed /= 10;

	const timeToRun = (Math.ceil(map.size / maxOneShotPower(true)) * speed) / 60;
	const minutesThisRun = Math.floor((new Date().getTime() - game.global.portalTime) / 1000 / 60);

	return minutesThisRun - timeToRun < achievement.breakpoints[achievement.finished];
}

//Unique Maps Pt.2
function shouldRunUniqueMap(map) {
	//Stops unique maps being run when we should be destacking instead as it is likely to be slower overall.
	const isDestackingMap = ['Desolation Destacking', 'Pandemonium Destacking', 'Mayhem Destacking'].includes(mapSettings.mapName);
	if (isDestackingMap) return false;
	const mapData = MODULES.mapFunctions.uniqueMaps[map.name];
	if (mapData === undefined || game.global.world < mapData.zone - (trimpStats.plusLevels ? 10 : 0)) return false;
	if (game.global.universe !== mapData.universe) return false;
	if (!trimpStats.isC3 && mapData.challenges.includes(trimpStats.currChallenge) && !challengeActive('') && enoughHealth(map)) return true;
	//Remove speed run check for now
	/* if (mapData.speedrun && shouldSpeedRun(map, game.achievements[mapData.speedrun]) && enoughHealth(map) && enoughDamage(map)) {
		return true;
	} */
	//Disable mapping if we don't have enough health to survive the map and the corresponding setting is enabled.
	if (getPageSetting('uniqueMapEnoughHealth') && !enoughHealth(map)) return false;

	//Check to see if the cell is liquified and if so we can replace the cell condition with it
	const liquified = game.global.gridArray && game.global.gridArray[0] && game.global.gridArray[0].name === 'Liquimp';
	const uniqueMapSetting = getPageSetting('uniqueMapSettingsArray');
	const mapSetting = uniqueMapSetting[map.name];
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

function _obtainUniqueMap(uniqueMap) {
	const mapName = 'Unique Map Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!uniqueMap || typeof uniqueMap !== 'string') {
		uniqueMap = mapSettings.uniqueMap || null;
		if (!uniqueMap) return farmingDetails;
	}

	const unlockLevel = MODULES.mapFunctions.uniqueMaps[uniqueMap].zone;
	const mapLevel = unlockLevel - game.global.world;

	//Only go for this map if we are able to obtain it
	if (!trimpStats.perfectMaps && unlockLevel > game.global.world) return farmingDetails;
	else if (trimpStats.perfectMaps && unlockLevel > game.global.world + 10) return farmingDetails;

	const map = game.global.mapsOwnedArray.find((map) => map.name.includes(uniqueMap));
	const shouldMap = !map;

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
	if (game.global.mapsActive && getCurrentMapObject().name === mapName) return;
	if (getPageSetting('autoMaps') !== 1) return;
	if (_insanityDisableUniqueMaps()) return;

	MODULES.mapFunctions.runUniqueMap = mapName;

	const map = game.global.mapsOwnedArray.find((map) => map.name.includes(mapName));

	if (map) {
		if (game.global.mapsActive && getCurrentMapObject().name !== mapName) recycleMap_AT();
		if (game.global.preMapsActive && game.global.currentMapId === '') {
			selectMap(map.id);
			runMap_AT();
			debug(`Running ${mapName} on zone ${game.global.world}.`, 'map_Details');
			MODULES.mapFunctions.runUniqueMap = '';
		}
	}
}

function runningAncientTreasure() {
	if (mapSettings.ancientTreasure && getPageSetting('autoMaps') === 1) return true;
	if (game.global.mapsActive && getCurrentMapObject().location === getAncientTreasureName()) return true;
	return false;
}

function recycleMap_AT(forceAbandon) {
	if (!getPageSetting('autoMaps')) return;
	if (!getPageSetting('recycleExplorer') && game.jobs.Explorer.locked === 1) return;
	if (!forceAbandon && (challengeActive('Mapology') || challengeActive('Unbalance') || challengeActive('Trappapalooza') || challengeActive('Archaeology') || (challengeActive('Berserk') && !game.challenges.Berserk.weakened !== 20) || game.portal.Frenzy.frenzyStarted !== -1 || !newArmyRdy() || mapSettings.mapName === 'Prestige Raiding' || mapSettings.mapName === 'Prestige Climb')) return;

	if (!game.global.preMapsActive) mapsClicked(true);
	if (game.global.preMapsActive) recycleMap();
}

//Void Maps
MODULES.mapFunctions.voidPrefixes = Object.freeze({
	Poisonous: 10,
	Destructive: 11,
	Heinous: 20,
	Deadly: 30
});

MODULES.mapFunctions.voidSuffixes = Object.freeze({
	Descent: 7.077,
	Void: 8.822,
	Nightmare: 9.436,
	Pit: 10.6
});

function _getVoidMapDifficulty(map) {
	if (!map) return 99999;

	let score = 0;
	const mapName = map.name;
	for (const [prefix, weight] of Object.entries(MODULES.mapFunctions.voidPrefixes)) {
		if (mapName.includes(prefix)) {
			score += weight;
			if (trimpStats.shieldBreak) score = 100;
			break;
		}
	}
	for (const [suffix, weight] of Object.entries(MODULES.mapFunctions.voidSuffixes)) {
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
	let shouldMap = false;
	const mapName = 'Void Map';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	const settingName = 'voidMapSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	let settingIndex = null;
	let setting;
	if (defaultSettings === null) return farmingDetails;

	if (!defaultSettings.active && !mapSettings.portalAfterVoids && !MODULES.mapFunctions.afterVoids) return farmingDetails;

	const voidReduction = trimpStats.isDaily ? dailyModiferReduction() : 0;
	const dailyAddition = dailyOddOrEven();
	const zoneAddition = dailyAddition.active ? 1 : 0;

	const dropdowns = ['hdRatio', 'voidHDRatio'];
	const hdTypes = ['hdType', 'hdType2'];

	let hdObject = {
		world: { hdStat: hdStats.hdRatio, hdStatVoid: hdStats.vhdRatio, name: 'World HD Ratio' },
		map: { hdStat: hdStats.hdRatioMap, name: 'Map HD Ratio' },
		void: { hdStat: hdStats.hdRatioVoid, hdStatVoid: hdStats.vhdRatioVoid, name: 'Void HD Ratio' },
		hitsSurvived: { hdStat: hdStats.hitsSurvived, name: 'Hits Survived' },
		hitsSurvivedVoid: { hdStat: hdStats.hitsSurvivedVoid, name: 'Hits Survived Void' },
		maplevel: { hdStat: hdStats.autoLevel, name: 'Map Level' }
	};

	for (let y = 1; y < baseSettings.length; y++) {
		let currSetting = baseSettings[y];
		let world = currSetting.world + voidReduction;
		let maxVoidZone = currSetting.maxvoidzone + voidReduction;

		if (dailyAddition.active) {
			if (dailyAddition.skipZone) continue;
			if (!settingShouldRun(currSetting, world, 0, settingName) && !settingShouldRun(currSetting, world, zoneAddition, settingName)) continue;
		} else if (!settingShouldRun(currSetting, world, 0, settingName)) continue;

		for (var x = 0; x < zoneAddition + 1; x++) {
			//Running voids regardless of HD if we reach our max void zone OR run them if we have less HD Ratio than our target OR we can survive fewer hits than our target.
			var skipLine = 0;
			for (var item in dropdowns) {
				var obj = hdObject[currSetting[hdTypes[item]]];
				var hdSetting = obj.hdStat;
				if (obj.hdStatVoid) hdSetting = obj.hdStatVoid;
				if (currSetting[dropdowns[item]] > hdSetting) skipLine++;
			}
			if (skipLine === 2 && maxVoidZone !== game.global.world) continue;

			if (maxVoidZone === game.global.world || game.global.world - world >= 0) {
				settingIndex = y;
				break;
			}
			world += zoneAddition;
			maxVoidZone += zoneAddition;
		}

		if (settingIndex !== null) {
			if (!mapSettings.hdType && !lineCheck && getPageSetting('autoMaps')) {
				//Need to improve the void hd ratio inputs so that they match the dropdowns the user has selected.
				var dropdownTitles = ['dropdown', 'dropdown2'];

				for (var item in dropdowns) {
					var obj = hdObject[currSetting[hdTypes[item]]];
					mapSettings[dropdownTitles[item]] = {
						name: obj.name,
						hdRatio: obj.hdStat
					};
					var hdSetting = obj.hdStat;
					if (hdSetting.hdStatVoid) hdSetting = obj.hdStatVoid;
					//If our HD Ratio is less than our target then track that this is what caused VMs to run.
					if (currSetting[dropdowns[item]] < hdSetting) {
						mapSettings.voidTrigger = obj.name;
					}
				}
				if (!mapSettings.voidTrigger) mapSettings.voidTrigger = 'Zone';
			}
			mapSettings.voidHDIndex = y;
			break;
		}
	}

	//Helium per hour void setting setup
	if (MODULES.mapFunctions.afterVoids) {
		portalSetting = challengeActive('Daily') ? getPageSetting('dailyHeliumHrPortal') : getPageSetting('heliumHrPortal');
		if (portalSetting === 2 && getZoneEmpowerment(game.global.world) !== 'Poison') return farmingDetails;
		if (dailyAddition.skipZone) return farmingDetails;

		setting = {
			cell: 1,
			jobratio: defaultSettings.jobratio ? defaultSettings.jobratio : '0,0,1',
			world: game.global.world,
			portalAfter: true,
			priority: 0
		};
		//Checking to see which of hits survived and hd farm should be run. Prioritises hits survived.
		if (defaultSettings.hitsSurvived > hdStats.hitsSurvivedVoid) {
			setting.hdBase = Number(defaultSettings.hitsSurvived);
			setting.hdType = 'hitsSurvivedVoid';
		}
		mapSettings.voidTrigger = _getPrimaryResourceInfo().name + ' Per Hour (' + autoTrimpSettings.heliumHrPortal.name()[portalSetting] + ')';
	}

	if (setting === undefined) {
		if (mapSettings.voidHDIndex) setting = baseSettings[mapSettings.voidHDIndex];
		else if (settingIndex !== null) setting = baseSettings[settingIndex];
	}
	if (lineCheck) return setting;

	if (setting !== undefined) {
		var jobRatio = setting !== undefined ? setting.jobratio : '1,1,1,1';
		mapSettings.portalAfterVoids = mapSettings.portalAfterVoids || setting.portalAfter;

		if (game.global.totalVoidMaps > 0) {
			shouldMap = true;
			//Uses a bone charge if the user has toggled the setting on.
			if (defaultSettings.boneCharge && !mapSettings.boneChargeUsed && game.permaBoneBonuses.boosts.charges > 0 && !game.options.menu.pauseGame.enabled) {
				debug('Consumed 1 bone shrine charge on zone ' + game.global.world + ' and gained ' + boneShrineOutput(1), 'bones');
				buyJobs(jobRatio);
				game.permaBoneBonuses.boosts.consume();
				mapSettings.boneChargeUsed = true;
			}

			//Identifying if we need to do any form of HD Farming before actually running voids
			//If we do then run HD Farm and stop this function until it has been completed.
			//Override for if we have already farmed enough maps. Gets reset when Void Map MAZ window is saved.
			if (defaultSettings.voidFarm && !(challengeActive('Metal') || challengeActive('Transmute')) && MODULES.mapFunctions.hasVoidFarmed !== getTotalPortals() + '_' + game.global.world && ((defaultSettings.hitsSurvived > 0 && defaultSettings.hitsSurvived > hdStats.hitsSurvivedVoid) || (defaultSettings.hdRatio > 0 && defaultSettings.hdRatio < hdStats.vhdRatioVoid))) {
				//Print farming message if we haven't already started HD Farming for stats.
				if (!mapSettings.voidFarm && getPageSetting('autoMaps')) debug(mapName + ' (z' + game.global.world + 'c' + (game.global.lastClearedCell + 2) + ') farming for stats before running void maps.', 'map_Details');
				return hdFarm(false, false, true, true);
			}
		}

		var stackedMaps = Fluffy.isRewardActive('void') ? countStackedVoidMaps() : 0;
		var status = 'Void Maps: ' + game.global.totalVoidMaps + (stackedMaps ? ' (' + stackedMaps + ' stacked)' : '') + ' remaining';

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = game.global.world;
		farmingDetails.jobRatio = jobRatio;
		farmingDetails.autoLevel = false;
		farmingDetails.repeat = false;
		farmingDetails.status = status;
		farmingDetails.settingIndex = settingIndex;
		if (setting && setting.priority) farmingDetails.priority = setting.priority;
		//This is a check for the whichHitsSurvived function to see which type of hitsSurvived we should be looking at.
		farmingDetails.voidHitsSurvived = true;
		//Saving settings here so that we don't need to store them in global variables. They'll just be wiped after Void Maps has finished running.
		//They all need to be copied into HDFarm() as well due to pre-void farming.
		if (mapSettings.boneChargeUsed) farmingDetails.boneChargeUsed = mapSettings.boneChargeUsed;
		if (mapSettings.voidHDIndex) farmingDetails.voidHDIndex = mapSettings.voidHDIndex;
		if (mapSettings.dropdown) farmingDetails.dropdown = mapSettings.dropdown;
		if (mapSettings.dropdown2) farmingDetails.dropdown2 = mapSettings.dropdown2;
		if (mapSettings.voidTrigger) farmingDetails.voidTrigger = mapSettings.voidTrigger;
		if (mapSettings.portalAfterVoids) farmingDetails.portalAfterVoids = mapSettings.portalAfterVoids;

		if (mapSettings.mapName === mapName && !shouldMap) {
			mappingDetails(mapName, null, null, null, null, null);
			resetMapVars();
			MODULES.mapFunctions.afterVoids = false;
			if (mapSettings.portalAfterVoids) autoPortalCheck(game.global.world);
		}
	}

	return farmingDetails;
}

function mapBonus(lineCheck) {
	const mapName = 'Map Bonus';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	//Initialise variables
	const settingName = 'mapBonusSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	if (defaultSettings === null) return farmingDetails;

	const settingIndex = _findSettingsIndexMapBonus(settingName, baseSettings);

	const mapBonusRatio = getPageSetting('mapBonusRatio');
	const hdCheck = mapBonusRatio > 0 && hdStats.hdRatio > mapBonusRatio && getPageSetting('mapBonusStacks') > game.global.mapBonus;
	const spireCheck = getPageSetting('MaxStacksForSpire') && isDoingSpire();
	const hdFarmCheck = (hdCheck || spireCheck) && !_berserkDisableMapping() && !_noMappingChallenges();

	const setting = settingIndex ? baseSettings[settingIndex] : hdFarmCheck ? _mapBonusRatioSetting(defaultSettings, hdCheck, spireCheck) : undefined;
	if (lineCheck) return setting;

	if (setting) Object.assign(farmingDetails, _runMapBonus(setting, mapName, settingIndex));

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
		let currSetting = baseSettings[y];
		let world = currSetting.world;
		if (currSetting.hdRatio > 0 && hdStats.hdRatio < currSetting.hdRatio) continue;
		if (shouldSkipSetting(currSetting, world, settingName)) continue;
		settingIndex = y;
	}
	return settingIndex;
}

function _mapBonusRatioSetting(defaultSettings, hdCheck, spireCheck) {
	const isSettingsEmpty = Object.keys(defaultSettings).length === 1;
	const repeatCount = Math.max(spireCheck ? 10 : 0, hdCheck ? getPageSetting('mapBonusStacks') : 0);

	return {
		jobratio: isSettingsEmpty ? '1,1,2' : defaultSettings.jobratio,
		autoLevel: true,
		level: 0,
		special: isSettingsEmpty ? 'lmc' : defaultSettings.special,
		repeat: repeatCount,
		priority: Infinity
	};
}

function _runMapBonus(setting, mapName, settingIndex) {
	const { repeat: repeatCounter, jobratio: jobRatio, special, autoLevel, level, priority } = setting;
	const mapSpecial = special !== '0' ? getAvailableSpecials(special) : '0';
	const minLevel = game.global.universe === 1 ? 0 - game.portal.Siphonology.level : 0;
	const mapLevel = autoLevel ? autoLevelCheck(mapName, mapSpecial, null, minLevel) : level;

	if (mapLevel < minLevel) return farmingDetails;

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
	let mapLevel = setting.autoLevel ? autoLevelCheck(mapName, mapSpecial, null, null) : setting.level;
	if (challengeActive('Wither') && mapLevel >= 0) mapLevel = -1;
	let repeatCounter = setting.repeat === -1 ? Infinity : setting.repeat;
	const repeatNumber = repeatCounter === Infinity ? '∞' : repeatCounter;
	const jobRatio = setting.jobratio;
	const shouldAtlantrimp = setting.atlantrimp && game.mapUnlocks.AncientTreasure.canRunOnce;
	const gather = setting.gather;
	const mapType = setting.mapType;

	const [repeatCheck, status] = _getMapFarmActions(mapType, setting, repeatNumber);

	if (mapType !== 'Map Count') {
		repeatCounter = repeatCounter.split(':').reduce((acc, time) => 60 * acc + +time);
	}

	const shouldMap = mapType === 'Daily Reset' ? repeatCounter < repeatCheck : repeatCounter > repeatCheck;

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
	const timeBasedActions = ['Daily Reset', 'Zone Time', 'Portal Time', 'Skele Spawn'];
	const timeBasedAction = () => {
		const repeatCheck = {
			'Daily Reset': updateDailyClock(true)
				.split(':')
				.reduce((acc, time) => 60 * acc + +time),
			'Zone Time': (getGameTime() - game.global.zoneStarted) / 1000,
			'Portal Time': (getGameTime() - game.global.portalTime) / 1000,
			'Skele Spawn': (getGameTime() - game.global.lastSkeletimp) / 1000
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
	let mapLevel = setting.autoLevel ? autoLevelCheck(mapName, mapSpecial, null, null) : setting.level;
	if (challengeActive('Wither') && mapLevel >= 0) mapLevel = -1;
	let totalCost = 0;

	if (setting.mapType === 'Map Count') {
		[tributeGoal, meteorologistGoal] = _tributeFarmCalculateGoal(mapLevel, mapSpecial, jobRatio, tributeGoal, meteorologistGoal);
	}

	const shouldMap = tributeGoal > game.buildings.Tribute.purchased || meteorologistGoal > game.jobs.Meteorologist.owned;

	if (shouldMap && tributeGoal > game.buildings.Tribute.purchased && !getPageSetting('buildingsType')) buyTributes();

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

	const smithyQuest = _getCurrentQuest() === 10;
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
	let mapLevel = setting.autoLevel ? autoLevelCheck(mapName, mapSpecial, null, null) : setting.level;
	if (challengeActive('Wither') && mapLevel >= 0) mapLevel = -1;
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
	//1. If the user has either the AT AutoStructure setting OR the AT AutoStructure Smithy setting disabled.
	//2. If the user is running Hypothermia and is specifically Smithy Farming.
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
	let mapLevel = setting.autoLevel ? autoLevelCheck(mapName, mapSpecial, null, null) : setting.level;

	if (challengeActive('Wither') && mapLevel >= 0) mapLevel = -1;

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

	if (challengeActive('Balance') || (challengeActive('Unbalance') && !getPageSetting('balance'))) return farmingDetails;
	if (challengeActive('Daily') && (!getPageSetting('bloodthirstDestack') || typeof game.global.dailyChallenge.bloodthirst === 'undefined')) return farmingDetails;
	if (challengeActive('Storm') && !getPageSetting('storm')) return farmingDetails;

	const mapLevel = -(game.global.world - 6);
	const mapSpecial = getAvailableSpecials('fa');
	let shouldMap = false;
	let destackValue = 0;

	// Balance + Unbalance Destacking
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

	// Bloodthirst Destacking
	if (challengeActive('Daily') && game.global.dailyChallenge.bloodthirst.stacks >= dailyModifiers.bloodthirst.getFreq(game.global.dailyChallenge.bloodthirst.strength) - 1) {
		shouldMap = true;
		destackValue = game.global.dailyChallenge.bloodthirst.stacks;
	}

	// Storm Destacking
	if (challengeActive('Storm')) {
		const stormZone = getPageSetting('stormZone') > 0 ? getPageSetting('stormZone') : Infinity;
		const stormStacks = getPageSetting('stormStacks') > 0 ? getPageSetting('stormStacks') : Infinity;
		shouldMap = game.global.world >= stormZone && game.challenges.Storm.beta >= stormStacks && game.challenges.Storm.beta !== 0;
		destackValue = game.challenges.Storm.beta;
	}

	if (game.global.mapsActive && getCurrentMapObject().level === 6 && !shouldMap && destackValue === 0) {
		recycleMap_AT();
	}

	if (mapSettings.mapName === mapName && destackValue > 0) shouldMap = true;

	// As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
	if (lineCheck && shouldMap) return (setting = { priority: 1 });

	const repeat = game.global.mapsActive && getCurrentMapObject().size - getCurrentMapCell().level + 1 >= destackValue;
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

function prestigesToGet(targetZone = game.global.world, targetPrestige = 'GambesOP') {
	const prestigeList = ['Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'];
	//Skip locked equips
	if (!game.global.slowDone && prestigeList.indexOf(targetPrestige) > 10) targetPrestige = 'Bestplate';

	//Figure out how many equips to farm for
	let mapsToRun = 0;
	let prestigeToFarmFor = 0;

	const hasSciFour = (game.global.universe === 1 && game.global.sLevel >= 4) || (game.global.universe === 2 && game.buildings.Microchip.owned >= 4);
	const prestigeInterval = challengeActive('Mapology') || !hasSciFour ? 5 : 10;

	//Loops through all prestiges
	for (const p of prestigeList) {
		if (game.equipment[game.upgrades[p].prestiges].locked) continue;
		const prestigeUnlock = game.mapUnlocks[p];
		const pMapLevel = prestigeUnlock.last + 5;

		if ((game.upgrades[p].allowed || prestigeUnlock.last <= 5) && prestigeUnlock && pMapLevel <= targetZone) {
			mapsToRun += Math.max(1, Math.ceil((targetZone - pMapLevel) / prestigeInterval));
			let prestigeCount = Math.floor((targetZone - prestigeUnlock.last) / 5);

			if (hasSciFour && prestigeCount % 2 === 1) {
				prestigeCount++;
			}
			prestigeToFarmFor += prestigeCount;
		}

		if (p === targetPrestige) break;
	}

	return [prestigeToFarmFor, mapsToRun];
}

/* 
To be done
 */
function prestigeClimb(lineCheck) {
	const mapName = 'Prestige Climb';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (challengeActive('Frugal') || _berserkDisableMapping() || _noMappingChallenges()) return farmingDetails;

	const runningMapology = challengeActive('Mapology') && getPageSetting('mapology');
	let targetPrestige = runningMapology ? getPageSetting('mapologyPrestige') : getPageSetting('Prestige');
	if (targetPrestige === 'Off') return farmingDetails;
	if (game.jobs.Explorer.locked) {
		farmingDetails.biome = 'Random';
		farmingDetails.mapSliders = [0, 9, 9];
	}
	//If we're past the zone we want to farm for all prestiges in then set targetPrestige to the highest prestige available.
	//equipsToGet will automatically change GambesOP to Breastplate if the Slow challenge has not yet been completed.
	if (!runningMapology && getPageSetting('ForcePresZ') >= 0 && game.global.world >= getPageSetting('ForcePresZ')) {
		targetPrestige = 'GambesOP';
	}

	//Figure out how many equips to farm for & maps to run to get to that value
	const [prestigeToFarmFor, mapsToRun] = prestigesToGet(game.global.world, targetPrestige);

	let mapLevel = 0;
	while (prestigeToFarmFor > 0 && prestigeToFarmFor === prestigesToGet(mapLevel - 1, targetPrestige)[0]) {
		mapLevel--;
	}

	let shouldMap = prestigeToFarmFor > 0;

	if (shouldMap && getPageSetting('PrestigeSkip')) {
		const prestigeList = ['Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'];
		const numUnbought = prestigeList.filter((p) => game.upgrades[p].allowed - game.upgrades[p].done > 0).length;
		shouldMap = numUnbought >= 2;
	}

	if (lineCheck && shouldMap) return (setting = { priority: 1 });

	const mapSpecial = getAvailableSpecials('p');
	const mapObject = getCurrentMapObject();

	if (mapCost(mapLevel, mapSpecial, null, [0, 0, 0], false) > game.resources.fragments.owned && (!game.global.mapsActive || (mapObject && mapObject.level < game.global.world + mapLevel))) {
		shouldMap = false;
	}

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, 0, mapSpecial);
		resetMapVars();
	}

	if (game.options.menu.mapLoot.enabled !== 1) toggleSetting('mapLoot');
	const status = `Prestige Climb: ${prestigeToFarmFor} items remaining`;

	const repeat = !(game.global.mapsActive && mapsToRun > (getCurrentMapObject().bonus === 'p' && game.global.lastClearedMapCell !== getCurrentMapObject().size - 2 ? 2 : 1));

	Object.assign(farmingDetails, {
		shouldRun: shouldMap,
		mapName,
		status,
		repeat: !repeat,
		mapLevel,
		autoLevel: true,
		special: mapSpecial,
		mapsToRun
	});

	return farmingDetails;
}

function _raidingTargetPrestige(setting) {
	const isMapologyActive = challengeActive('Mapology') && getPageSetting('mapology');
	const targetPrestige = isMapologyActive ? autoTrimpSettings['mapologyPrestige'].selected : setting.prestigeGoal && setting.prestigeGoal !== 'All' ? MODULES.equipment[setting.prestigeGoal].upgrade : 'GamesOP';
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
	if (!defaultSettings || !defaultSettings.active || _getCurrentQuest() === 8) return farmingDetails;

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

	const mapsToRun = game.global.mapsActive ? prestigesToGet(getCurrentMapObject().level, targetPrestige)[1] : Infinity;
	const specialInMap = game.global.mapsActive && game.global.mapGridArray[getCurrentMapObject().size - 2].special === targetPrestige;

	const repeat = mapsToRun <= 1 || (specialInMap && mapsToRun === 2);

	if (mapSettings.prestigeMapArray && mapSettings.prestigeMapArray[0] !== undefined && shouldMap) {
		const mapIndex = getMapIndex(mapSettings.prestigeMapArray[0]);
		const mapOwned = game.global.mapsOwnedArray[mapIndex] === undefined;
		const prestigesToGetZero = game.global.mapsActive && prestigesToGet(getCurrentMapObject().level)[0] === 0;

		if (mapOwned || prestigesToGetZero) {
			debug(`There was an error with your purchased map(s). Restarting the raiding procedure.`);
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
	const { mapName, totalMapCost, mapSliders, prestigeMapArray, prestigeFragMapBought } = mapSettings;

	if (mapName !== 'Prestige Raiding' || !getPageSetting('autoMaps')) return;

	if (!totalMapCost || !mapSliders) {
		const costAndSliders = prestigeTotalFragCost();
		if (!totalMapCost) mapSettings.totalMapCost = costAndSliders.cost;
		if (!mapSliders) mapSettings.mapSliders = costAndSliders.sliders;
	}

	mapSettings.prestigeMapArray = prestigeMapArray || new Array(5);
	mapSettings.prestigeFragMapBought = prestigeFragMapBought || false;

	if (mapSliders && prestigeMapArray[0] === undefined) {
		if (totalMapCost < game.resources.fragments.owned) {
			_handlePrestigeFragMapBought();
		} else if (game.global.preMapsActive) {
			fragmentFarm();
			mapSettings.prestigeFragMapBought = true;
		}
	}

	if (!prestigeFragMapBought && game.global.preMapsActive) {
		_handlePrestigeMapBuying();
		_handlePrestigeMapRunning();
	}

	if (game.global.preMapsActive) runMap_AT();
}

function _handlePrestigeMapBuying() {
	if (game.global.mapsOwnedArray.length >= 95) recycleBelow(true);
	const mapsCanRun = challengeActive('Mapology') ? Math.min(5, game.challenges.Mapology.credits) : 5;
	if (mapSettings.prestigeMapArray[0] === undefined) {
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
			mapSettings.prestigeFragMapBought = false;
			MODULES.maps.fragmentFarming = false;
		}
	}
}

function _buyPrestigeMap(x) {
	if (prestigeMapHasEquips(x, mapSettings.raidzones, mapSettings.prestigeGoal)) {
		setMapSliders(mapSettings.mapSliders[x][0], mapSettings.mapSliders[x][1], mapSettings.mapSliders[x][2], mapSettings.mapSliders[x][3], mapSettings.mapSliders[x][4]);
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
		if (game.global.preMapsActive && prestigeMapHasEquips(x, mapSettings.raidzones, mapSettings.prestigeGoal)) {
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
		debug('Prestige Raiding - Error with finding the purchased map. Skipping this map and moving on to the next one.');
		mapSettings.prestigeMapArray[x] = undefined;
	} else {
		debug(`Prestige Raiding (z${game.global.world}) running a level ${purchasedMap.level} map. Map #${mapSettings.prestigeMapArray.length - x}`, 'map_Details');
		selectMap(mapId);
		runMap_AT();
	}
}

function _restartRaidingProcedure() {
	delete mapSettings.prestigeMapArray;
	delete mapSettings.totalMapCost;
	delete mapSettings.mapSliders;
	delete mapSettings.prestigeFragMapBought;
	debug('Prestige Raiding - Error with finding the purchased map. Restarting the raiding procedure.');
}

function findLastBionicWithItems(bionicPool) {
	if (game.global.world < 115 || !bionicPool) return;
	const isMapologyActive = challengeActive('Mapology') && getPageSetting('mapology');
	const targetPrestige = isMapologyActive ? getPageSetting('mapologyPrestige') : 'GambesOP';

	if (bionicPool.length <= 1) return bionicPool[0];

	bionicPool.sort((bionicA, bionicB) => bionicA.level - bionicB.level);
	const isExperienceActive = challengeActive('Experience') && getPageSetting('experience') && game.global.world > 600;
	const experienceEndBW = getPageSetting('experienceEndBW');

	while (bionicPool.length > 1 && prestigesToGet(bionicPool[0].level, targetPrestige)[0] === 0) {
		if (isExperienceActive && bionicPool[0].level >= experienceEndBW) break;
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

	const defaultSettings = baseSettings ? baseSettings[0] : null;
	if (!defaultSettings || !defaultSettings.active) return farmingDetails;
	if (challengeActive('Experience') && game.global.world > 600) return farmingDetails;

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
	//If we can't get the map then don't run this setting
	//If we can then go grab it if it's available
	const unlockLevel = MODULES.mapFunctions.uniqueMaps['Bionic Wonderland'].zone;
	if (!trimpStats.plusLevels && unlockLevel > game.global.world) return farmingDetails;
	else if (trimpStats.plusLevels && unlockLevel > game.global.world + 10) return farmingDetails;
	const map = game.global.mapsOwnedArray.find((map) => map.name.includes('Bionic Wonderland'));
	if (!map) return _obtainUniqueMap('Bionic Wonderland');
	const raidZones = _raidingRaidZone(setting, mapName);
	const targetPrestige = _raidingTargetPrestige(setting);

	const itemsRemaining = prestigesToGet(raidZones, targetPrestige)[0];
	shouldMap = itemsRemaining > 0;

	const status = `Raiding to BW${raidZones}: ${itemsRemaining} items remaining`;
	const mapObject = getCurrentMapObject();
	const mapsToRun = game.global.mapsActive ? prestigesToGet(mapObject.level, targetPrestige)[1] : Infinity;
	const specialInMap = game.global.mapsActive && game.global.mapGridArray[mapObject.size - 2].special === targetPrestige;
	const repeat = game.global.mapsActive && (mapsToRun <= 1 || (specialInMap && mapsToRun === 2) || mapObject.location !== 'Bionic');

	return {
		shouldRun: shouldMap,
		mapName: mapName,
		repeat: !repeat,
		raidingZone: raidZones,
		status: status,
		settingIndex: settingIndex,
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

	const raidingZone = challengeActive('Experience') && game.global.world > 600 ? getPageSetting('experienceEndBW') : mapSettings.raidingZone;
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
	const mapLevel = setting.autoLevel ? autoLevelCheck(mapName, mapSpecial, null, null) : setting.level;

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

/*  To be done  */
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

	let jobRatio = '0,0,1';
	let mapSpecial = getAvailableSpecials('lmc', true);
	let mapLevel = autoLevelCheck(mapName, mapSpecial, -1, null);
	let cell = game.global.lastClearedCell + 2;
	let equalityAmt = 0;
	let ourDmg = 0;
	let enemyHealth = 0;

	//Checking if we can clear to the speedbook on the next zone.
	if (cell === 100 && witherZones.indexOf(game.global.world + 1) === -1) {
		let dmgBuff = 1;
		equalityAmt = equalityQuery('Snimp', game.global.world + 1, 60, 'world', 1, 'gamma', false, 4);
		//If we can afford a coordination on the next zone then factor it into our calcs.
		//Equality is just a flat minus 2 (because of 25% more health, it's off by 4% so might mean 1 higher equality in some cases)
		if (canAffordCoordinationTrimps()) {
			dmgBuff = 1.25;
			equalityAmt = Math.max(0, equalityAmt - 2);
		}

		ourDmg = calcOurDmg('min', equalityAmt, false, 'world', 'never', 0, false) * dmgBuff;
		enemyHealth = calcEnemyHealthCore('world', game.global.world + 1, 60, 'Snimp', calcMutationHealth(game.global.world + 1));

		if (ourDmg * 4 < enemyHealth) shouldMap = true;
	}
	//Checking if we can clear current cell.
	else {
		const gammaToTrigger = gammaMaxStacks(true) - game.heirlooms.Shield.gammaBurst.stacks;
		const name = game.global.gridArray && game.global.gridArray[0] ? game.global.gridArray[cell - 1].name : undefined;
		equalityAmt = equalityQuery(name, game.global.world, cell, 'world', 1, 'gamma', false, 4);
		ourDmg = calcOurDmg('min', equalityAmt, false, 'world', 'never', 0, false);
		enemyHealth = calcEnemyHealthCore('world', game.global.world, cell, name, calcMutationHealth(game.global.world));

		//If we can gamma burst then factor that into damage calcs so that mapping doesn't cause us to not kill an enemy
		if (ourDmg * (gammaToTrigger <= 1 ? MODULES.heirlooms.gammaBurstPct : 1) * 4 < enemyHealth) shouldMap = true;
	}

	//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
	if (lineCheck && shouldMap) return (setting = { priority: Infinity });

	const damageTarget = enemyHealth / 4;

	const status = `Wither Farm: Curr&nbsp;Dmg:&nbsp;${prettify(ourDmg)} Goal&nbsp;Dmg:&nbsp;${prettify(damageTarget)}`;

	farmingDetails.shouldRun = shouldMap;
	farmingDetails.mapName = mapName;
	farmingDetails.mapLevel = mapLevel;
	farmingDetails.autoLevel = true;
	farmingDetails.special = mapSpecial;
	farmingDetails.jobRatio = jobRatio;
	farmingDetails.damageTarget = damageTarget;
	farmingDetails.repeat = true;
	farmingDetails.status = status;
	farmingDetails.equalityAmt = equalityAmt;

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

	for (var i = 1; i < baseSettings.length; i++) {
		let currSetting = baseSettings[i];
		if (!currSetting.active || currSetting.world > game.global.world || (currSetting.world === game.global.world && currSetting.cell > game.global.lastClearedCell + 2)) continue;
		bogsToRun -= parseInt(currSetting.bogs);
	}

	const shouldMap = game.challenges.Quagmire.motivatedStacks > bogsToRun;
	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName);
		resetMapVars(setting, settingName);
	}

	const repeat = game.global.mapsActive && (getCurrentMapObject().name !== 'The Black Bog' || game.challenges.Quagmire.motivatedStacks - bogsToRun === 1);
	const status = `Black Bogs: ${game.challenges.Quagmire.motivatedStacks - bogsToRun} remaining`;

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

	let shouldMap = _getCurrentQuest();

	// If we're running a one shot quest and can one shot the enemy then disable questing.
	if (shouldMap === 7 && calcOurDmg('min', 0, false, 'world', 'never') > calcEnemyHealthCore('world', game.global.world, 50, 'Turtlimp')) shouldMap = 0;
	// No Quest specific mapping necessary on shield break quests.
	if (shouldMap === 8) return farmingDetails;
	// Need to use Smithy Farm to do any smithy quests.
	if (shouldMap === 10) return smithyFarm();
	// Disable farming if enough maps have been farmed to meet the map cap criteria.
	if (MODULES.mapFunctions.quest.run) shouldMap = 0;
	if (lineCheck && shouldMap) return (setting = { priority: shouldMap !== 7 ? 1 : Infinity });

	if (shouldMap) Object.assign(farmingDetails, _runQuest(shouldMap, mapName));

	if (mapSettings.mapName === mapName && !farmingDetails.shouldRun) {
		mappingDetails(mapName);
		resetMapVars();
		if (game.global.mapsActive) recycleMap_AT();
	}

	return farmingDetails;
}

function _getCurrentQuest() {
	if (!challengeActive('Quest') || !getPageSetting('quest')) return 0;
	if (game.global.world < game.challenges.Quest.getQuestStartZone()) return 0;

	const questProgress = game.challenges.Quest.getQuestProgress();
	const questDescription = game.challenges.Quest.getQuestDescription();

	if (questProgress === 'Failed!' || questProgress === 'Quest Complete!') return 0;

	const resourceMultipliers = ['food', 'wood', 'metal', 'gems', 'science'];
	const resourceIndex = resourceMultipliers.findIndex((resource) => questDescription.includes(resource));
	if (resourceIndex !== -1) return resourceIndex + 1;

	const otherQuests = ['Complete 5 Maps at Zone level', 'One-shot 5 world enemies', "Don't let your shield break before Cell 100", "Don't run a map before Cell 100", 'Buy a Smithy'];
	const otherIndex = otherQuests.findIndex((quest) => questDescription === quest);
	return otherIndex !== -1 ? otherIndex + 6 : 0;
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
	const questMin = [6, 7].includes(shouldMap) && game.global.mapBonus !== 10 ? 0 : null;
	const mapLevel = autoLevelCheck(mapName, mapSpecial, null, questMin);
	const mapCap = getPageSetting('questMapCap') > 0 ? getPageSetting('questMapCap') : Infinity;

	if (mapSettings.mapName !== mapName && mapCap > 0 && [1, 2, 3, 4, 5].includes(shouldMap)) {
		const resourcesEarned = game.resources[questResource].owned + resourcesFromMap(questResource, mapSpecial, jobRatio, mapLevel, mapCap);
		// Disable Questing if we can't earn enough resources to complete the quest.
		shouldMap = game.challenges.Quest.questProgress >= resourcesEarned ? 0 : shouldMap;
	}
	// Stop farming for damage if we have run more than our allocated amount of maps.
	if (shouldMap === 7 && mapSettings.mapName === mapName && game.global.mapRunCounter >= mapCap) {
		shouldMap = 0;
		MODULES.mapFunctions.quest.run = true;
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

/* Done up to here */
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

	if (setting) {
		const nextRelicCost = game.challenges.Archaeology.getNextCost();
		const relicString = setting.relics.split(',');
		const mapSpecial = getAvailableSpecials('lrc', true);
		const relicObj = game.challenges.Archaeology.points;
		const relicsToPurchase = [];
		const mapLevel = setting.autoLevel ? autoLevelCheck(mapName, mapSpecial, null, null) : setting.level;

		for (let item in relicString) {
			let relicName = game.challenges.Archaeology.getDefs()[relicString[item].slice(-1)];
			if (relicName === undefined) {
				farmingDetails.undefinedRelic = relicString[item].slice(-1);
				return farmingDetails;
			}
			let relicToBuy = parseInt(relicString[item]);
			if (relicToBuy > relicObj[relicName]) {
				relicsToPurchase.push(relicString[item]);
			}
		}

		if (!game.options.menu.pauseGame.enabled && getPageSetting('autoMaps')) {
			while (relicsToPurchase.length > 0 && game.resources.science.owned > game.challenges.Archaeology.getNextCost()) {
				let relicName = game.challenges.Archaeology.getDefs()[relicsToPurchase[0].slice(-1)];
				let relicToBuy = parseInt(relicsToPurchase[0]);
				game.challenges.Archaeology.buyRelic(relicName + 'Relic', true);
				if (game.challenges.Archaeology.points[relicName] >= relicToBuy) relicsToPurchase.shift();
			}
		}

		if (relicsToPurchase.length > 0) shouldMap = true;

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
		const status = 'Archaeology Farm: ' + relicCost;

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = mapLevel;
		farmingDetails.autoLevel = setting.autoLevel;
		farmingDetails.special = mapSpecial;
		farmingDetails.gather = 'science';
		farmingDetails.jobRatio = setting.jobratio;
		farmingDetails.relicString = setting.relics;
		if (typeof canAffordNextRelic !== 'undefined') farmingDetails.canAffordNextRelic = canAffordNextRelic;
		farmingDetails.nextRelicCost = nextRelicCost;
		farmingDetails.relicsToPurchase = relicsToPurchase;

		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
		farmingDetails.settingIndex = settingIndex;
		if (setting.priority) farmingDetails.priority = setting.priority;
	}

	return farmingDetails;
}

function mayhem(lineCheck) {
	var shouldMap = false;
	const mapName = 'Mayhem Destacking';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Mayhem') || !getPageSetting('mayhem')) return farmingDetails;

	const destackHits = getPageSetting('mayhemDestack') > 0 ? getPageSetting('mayhemDestack') : Infinity;
	const destackZone = getPageSetting('mayhemZone') > 0 ? getPageSetting('mayhemZone') : Infinity;
	const mayhemMapIncrease = getPageSetting('mayhemMapIncrease') > 0 ? getPageSetting('mayhemMapIncrease') : 0;
	const mapSpecial = trimpStats.hyperspeed2 ? 'lmc' : 'fa';
	if (game.challenges.Mayhem.stacks > 0 && (hdStats.hdRatio > destackHits || game.global.world >= destackZone)) shouldMap = true;

	//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
	if (lineCheck && shouldMap) return (setting = { priority: 1 });

	const mapLevel = autoLevelCheck(mapName, mapSpecial, null, 0 + mayhemMapIncrease);

	const repeat = game.challenges.Mayhem.stacks <= mapLevel + 1;
	const status = `Mayhem Destacking: ${game.challenges.Mayhem.stacks} remaining`;

	farmingDetails.shouldRun = shouldMap;
	farmingDetails.mapName = mapName;
	farmingDetails.mapLevel = mapLevel;
	farmingDetails.autoLevel = true;
	farmingDetails.special = mapSpecial;
	farmingDetails.repeat = !repeat;
	farmingDetails.status = status;

	if (mapSettings.mapName === mapName && !farmingDetails.shouldRun) {
		mappingDetails(mapName, mapLevel, mapSpecial);
		resetMapVars();
	}
	return farmingDetails;
}

function insanity(lineCheck) {
	var shouldMap = false;
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

	if (setting) {
		var mapLevel = setting.level;
		var mapSpecial = setting.special;
		var insanityGoal = setting.insanity;
		var jobRatio = setting.jobratio;

		//PRETTY SURE this needs some min/max checks to make sure we don't try to run a map that is too high or too low depending on our insanityGoal target
		//If auto level enabled will get the level of the map we should run.
		if (setting.autoLevel) {
			if (setting.destack) mapLevel = -(game.global.world - 6);
			else mapLevel = autoLevelCheck(mapName, mapSpecial, null, null);
		}

		if (insanityGoal > game.challenges.Insanity.maxInsanity) insanityGoal = game.challenges.Insanity.maxInsanity;
		if ((!setting.destack && insanityGoal > game.challenges.Insanity.insanity) || (setting.destack && game.challenges.Insanity.insanity > insanityGoal)) shouldMap = true;

		var repeat = insanityGoal <= game.challenges.Insanity.insanity;
		var status = `Insanity Farming: ${game.challenges.Insanity.insanity}/${insanityGoal}`;

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = mapLevel;
		farmingDetails.autoLevel = setting.autoLevel;
		farmingDetails.special = mapSpecial;
		farmingDetails.jobRatio = jobRatio;
		farmingDetails.insanity = insanityGoal;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
		farmingDetails.settingIndex = settingIndex;
		if (setting.priority) farmingDetails.priority = setting.priority;

		if (mapSettings.mapName === mapName && !farmingDetails.shouldRun) {
			mappingDetails(mapName, mapLevel, mapSpecial, insanityGoal);
			resetMapVars(setting, settingName);
			if (game.global.mapsActive) recycleMap_AT(true);
		}
	}

	return farmingDetails;
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

	let shouldMap = false;
	const mapLevel = -(game.global.world - 6);
	const mapSpecial = getAvailableSpecials('fa');

	if (game.challenges.Berserk.frenzyStacks !== 25) {
		shouldMap = true;
	}

	//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
	if (lineCheck && shouldMap) return (setting = { priority: 0 });
	const stacksToObtain = 25 - game.challenges.Berserk.frenzyStacks;
	const repeat = game.global.mapsActive && getCurrentMapObject().size - getCurrentMapCell().level + 1 >= stacksToObtain;
	const status = `${mapName}: Obtaining Frenzy Stacks`;

	farmingDetails.shouldRun = shouldMap;
	farmingDetails.mapName = mapName;
	farmingDetails.mapLevel = mapLevel;
	farmingDetails.autoLevel = false;
	farmingDetails.special = mapSpecial;
	farmingDetails.repeat = !repeat;
	farmingDetails.status = status;

	return farmingDetails;
}

function pandemoniumDestack(lineCheck) {
	var shouldMap = false;
	const mapName = 'Pandemonium Destacking';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Pandemonium') || !getPageSetting('pandemonium') || game.global.world < getPageSetting('pandemoniumZone')) return farmingDetails;

	var destackHits = getPageSetting('pandemoniumDestack') > 0 ? getPageSetting('pandemoniumDestack') : Infinity;
	var destackZone = getPageSetting('pandemoniumZone') > 0 ? getPageSetting('pandemoniumZone') : Infinity;

	if (destackHits === Infinity && destackZone === Infinity) return farmingDetails;

	var mapSpecial = trimpStats.hyperspeed2 ? 'lmc' : 'fa';
	var mapLevel = autoLevelCheck(mapName, mapSpecial, null, 1);
	var jobRatio = '0.001,1,1,0';

	if (game.challenges.Pandemonium.pandemonium > 0 && (hdStats.hdRatio > destackHits || game.global.world >= destackZone)) shouldMap = true;

	//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
	if (lineCheck && shouldMap) return (setting = { priority: 1 });

	var repeat = game.challenges.Pandemonium.pandemonium - mapLevel < mapLevel;
	var status = `Pandemonium Destacking: ${game.challenges.Pandemonium.pandemonium} remaining`;

	farmingDetails.shouldRun = shouldMap;
	farmingDetails.mapName = mapName;
	farmingDetails.mapLevel = mapLevel;
	farmingDetails.autoLevel = true;
	farmingDetails.special = mapSpecial;
	farmingDetails.jobRatio = jobRatio;
	farmingDetails.pandemonium = game.challenges.Pandemonium.pandemonium;
	farmingDetails.repeat = !repeat;
	farmingDetails.status = status;

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, mapLevel, mapSpecial);
		resetMapVars();
	}

	return farmingDetails;
}

function pandemoniumEquipmentCheck(cacheGain) {
	const equipArray = { ...MODULES.equipment };

	const equipsToPurchaseBaseline = {
		attack: {
			name: '',
			cost: Infinity,
			resourceSpendingPct: 1,
			stat: 'attack',
			zoneGo: true
		},
		health: {
			name: '',
			cost: Infinity,
			resourceSpendingPct: 1,
			stat: 'health',
			zoneGo: true
		}
	};

	let equipsToBuy = [];
	let prestigesToBuy = [];

	for (let equipName in game.equipment) {
		if (game.challenges.Pandemonium.isEquipBlocked(equipName) || equipArray[equipName].resource === 'wood') continue;
		let prestigeUpgrade = game.upgrades[equipArray[equipName].upgrade];

		let equip = game.equipment[equipName];
		if (equip.locked) continue;
		let equipCost = equip.cost[equipArray[equipName].resource][0] * Math.pow(equip.cost[equipArray[equipName].resource][1], equip.level) * getEquipPriceMult();
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
	let shouldMap = false;
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
	const mapLevel = autoLevelCheck(mapName, 'lmc', null, null);

	const cacheGain = scaleToCurrentMap_AT(simpleSeconds_AT('metal', equipSetting === 3 ? 40 : 20, jobRatio), false, true, mapLevel);

	const equipsToPurchase = pandemoniumEquipmentCheck(cacheGain);

	if (!equipsToPurchase.attack.name && !equipsToPurchase.health.name) return equipsToPurchase;
	let nextEquipmentCost = Infinity;
	for (let equip in equipsToPurchase) {
		if (equipsToPurchase[equip].cost < nextEquipmentCost) nextEquipmentCost = equipsToPurchase[equip].cost;
	}

	if (cacheGain / 2 > nextEquipmentCost) mapSpecial = 'lmc';

	if (cacheGain >= nextEquipmentCost) shouldMap = true;

	if (lineCheck && shouldMap) return (setting = { priority: 1 });

	const repeat = nextEquipmentCost >= cacheGain;
	const status = `Pandemonium Farming Equips below ${prettify(cacheGain)}`;

	farmingDetails.shouldRun = shouldMap;
	farmingDetails.mapName = mapName;
	farmingDetails.mapLevel = mapLevel;
	farmingDetails.autoLevel = true;
	farmingDetails.special = mapSpecial;
	farmingDetails.jobRatio = jobRatio;
	farmingDetails.gather = 'metal';
	farmingDetails.repeat = !repeat;
	farmingDetails.status = status;
	farmingDetails.pandaEquips = equipsToPurchase;
	farmingDetails.cacheGain = cacheGain;

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, mapLevel, mapSpecial);
		resetMapVars();
	}

	return farmingDetails;
}

function alchemy(lineCheck) {
	var shouldMap = false;
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

	if (setting) {
		const mapSpecial = setting.special;
		const jobRatio = setting.jobratio;
		const potionGoal = setting.potion;
		let mapLevel = setting.autoLevel ? autoLevelCheck(mapName, mapSpecial, null, 1) : setting.level;

		//Working out which potion the input corresponds to.
		const potionIndex = ['h', 'g', 'f', 'v', 's'].indexOf(potionGoal.charAt('0'));
		const potionName = alchObj.potionNames[potionIndex];
		let potionTarget = potionGoal.toString().replace(/[^\d,:-]/g, '');
		//Alchemy biome selection, will select Farmlands if it's unlocked and appropriate otherwise it'll use the default map type for that herb.
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
			var potionsOwned = 0;
			for (let y = 0; y < farmlandResources.length; y++) {
				if (alchObj.potions[y].enemyMult) continue;
				if (potionName !== alchObj.potionNames[y]) potionsOwned += alchObj.potionsOwned[y];
			}
			potionMult = Math.pow(alchObj.allPotionGrowth, potionsOwned);
		}

		//When mapType is set as Map Count work out how many of each Potion/Brew we can farm in the amount of maps specified.
		if (setting.mapType && setting.mapType === 'Map Count') {
			potionTarget = mapSettings.potionTarget || potionCurrent;
			if (!mapSettings.potionTarget) {
				let herbsGained = game.herbs[alchObj.potions[potionIndex].cost[0][0]].cowned + alchObj.getDropRate(game.global.world + mapLevel) * herbMult * potionTarget;
				while (herbsGained > Math.pow(alchObj.potions[potionIndex].cost[0][2], potionTarget) * alchObj.potions[potionIndex].cost[0][1] * potionMult) {
					herbsGained -= Math.pow(alchObj.potions[potionIndex].cost[0][2], potionTarget) * alchObj.potions[potionIndex].cost[0][1] * potionMult;
					potionTarget++;
				}
			}
		}

		//Looping through each potion level and working out their cost to calc total cost
		for (let x = potionCurrent; x < potionTarget; x++) {
			var potionCost = Math.pow(alchObj.potions[potionIndex].cost[0][2], x) * alchObj.potions[potionIndex].cost[0][1];
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

		if (potionTarget > alchObj.potionsOwned[potionIndex]) shouldMap = true;
		//Identifying current herbs + ones that we'll get from the map we should run
		const herbTotal = game.herbs[alchObj.potions[potionIndex].cost[0][0]].cowned + alchObj.getDropRate(game.global.world + mapLevel) * herbMult;
		const repeat = herbTotal >= potionCostTotal;
		const status = `Alchemy Farming ${alchObj.potionNames[potionIndex]} (${alchObj.potionsOwned[potionIndex]}/${potionTarget})`;

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = mapLevel;
		farmingDetails.autoLevel = setting.autoLevel;
		farmingDetails.special = mapSpecial;
		farmingDetails.jobRatio = jobRatio;
		farmingDetails.biome = biome;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
		farmingDetails.settingIndex = settingIndex;
		farmingDetails.potionTarget = potionTarget;
		farmingDetails.potionIndex = potionIndex;
		if (setting.priority) farmingDetails.priority = setting.priority;

		if (!shouldMap) {
			resetMapVars(setting, settingName);
			return alchemy();
		}
	}

	if (mapSettings.mapName === mapName && !farmingDetails.shouldRun) {
		mappingDetails(mapName, mapLevel, mapSpecial, alchObj.potionsOwned[mapSettings.potionIndex], alchObj.potionNames[mapSettings.potionIndex]);
		resetMapVars(setting, settingName);
	}

	return farmingDetails;
}

function _alchemyVoidPotions() {
	if (!challengeActive('Alchemy') || !getPageSetting('alchemySettings')[0].active || !getPageSetting('alchemySettings')[0].voidPurchase) return;
	if (!game.global.voidBuff) return;

	if (alchObj.canAffordPotion('Potion of the Void')) alchObj.craftPotion('Potion of the Void');
	if (alchObj.canAffordPotion('Potion of Strength')) alchObj.craftPotion('Potion of Strength');
}

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
	let mapLevel = autoLevelCheck(mapName, mapSpecial, null, null);
	let glassStacks = getPageSetting('glassStacks');
	if (glassStacks <= 0) glassStacks = Infinity;
	const endZone = true; //getPageSetting('glassEndZone') <= 0 ? Infinity : getPageSetting('glassEndZone');

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
		if (game.challenges.Glass.shards > 0) {
			shouldMap = true;
		} else {
			recycleMap_AT();
			shouldMap = false;
		}
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
	if (!defaultSettings || !defaultSettings.active || (!challengeActive('Hypothermia') && (!defaultSettings.packrat || !MODULES.mapFunctions.hypothermia.buyPackrat))) return farmingDetails;

	if (defaultSettings.packrat) hypothermiaBuyPackrat();

	if (!challengeActive('Hypothermia')) return farmingDetails;

	const settingIndex = findSettingsIndex(settingName, baseSettings, mapName);
	const setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting) Object.assign(farmingDetails, _runHypothermia(setting, mapName, settingName, settingIndex));

	return farmingDetails;
}

/* Done */
function hypothermiaBuyPackrat() {
	if (!MODULES.mapFunctions.hypothermia.buyPackrat && challengeActive('Hypothermia')) MODULES.mapFunctions.hypothermia.buyPackrat = true;
	if (MODULES.mapFunctions.hypothermia.buyPackrat && challengeActive('')) {
		viewPortalUpgrades();
		numTab(6, true);
		buyPortalUpgrade('Packrat');
		MODULES.mapFunctions.hypothermia.buyPackrat = null;
		activateClicked();
	}
}

function _runHypothermia(setting, mapName, settingName, settingIndex) {
	const bonfireGoal = setting.bonfire;
	const mapSpecial = getAvailableSpecials('lwc', true);
	const mapLevel = setting.autoLevel ? autoLevelCheck(mapName, mapSpecial, null, null) : setting.level;
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

	const shouldMap = bonfireGoal > game.challenges.Hypothermia.totalBonfires && bonfireCostTotal > game.resources.wood.owned;
	const repeat = game.resources.wood.owned > game.challenges.Hypothermia.bonfirePrice || scaleToCurrentMap_AT(simpleSeconds_AT('wood', 20, jobRatio), false, true, mapLevel) + game.resources.wood.owned > bonfireCostTotal;
	const status = `Hypo Farming To: ${prettify(bonfireCostTotal)} wood`;

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, mapLevel, mapSpecial, bonfireCostTotal);
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
	var shouldMap = false;
	const mapName = 'Desolation Destacking';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Desolation') || !getPageSetting('desolation')) return farmingDetails;

	var destackHits = getPageSetting('desolationDestack') > 0 ? getPageSetting('desolationDestack') : Infinity;
	var destackZone = getPageSetting('desolationZone') > 0 ? getPageSetting('desolationZone') : Infinity;
	var destackStacks = getPageSetting('desolationStacks') > 0 ? getPageSetting('desolationStacks') : 300;
	var destackOnlyZone = getPageSetting('desolationOnlyDestackZone') > 0 ? getPageSetting('desolationOnlyDestackZone') : Infinity;
	var mapLevel = 0;
	var mapSpecial = trimpStats.hyperspeed2 ? 'lmc' : 'fa';
	var sliders = [9, 9, 9];
	var biome = getBiome();
	var equality = false;

	//Forcing destack before doing any farmings.
	if (forceDestack) {
		destackZone = game.global.world;
		destackStacks = 0;
	}

	if (game.challenges.Desolation.chilled >= destackStacks && (hdStats.hdRatio > destackHits || game.global.world >= destackZone || game.global.world >= destackOnlyZone)) shouldMap = true;

	if (game.global.mapRunCounter === 0 && game.global.mapsActive && MODULES.maps.mapRepeats !== 0) {
		game.global.mapRunCounter = MODULES.maps.mapRepeats;
		MODULES.maps.mapRepeats = 0;
	}
	if (game.global.world < destackOnlyZone && !game.jobs.Explorer.locked) {
		var autoLevel_Repeat = mapSettings.levelCheck;
		mapAutoLevel = callAutoMapLevel(mapName, mapSpecial, 10, 0);
		if (mapAutoLevel !== Infinity) {
			if (autoLevel_Repeat !== Infinity && mapAutoLevel !== autoLevel_Repeat) MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
			mapLevel = mapAutoLevel;
		}
	} else {
		sliders = [0, 0, 9];
		if (mapSpecial === 'lmc' || game.jobs.Explorer.locked) mapSpecial = '0';
		else mapSpecial = 'fa';

		biome = getBiome('fragConservation');
		var trimpHealth = calcOurHealth(false, 'map');
		for (var y = 10; y >= 0; y--) {
			mapLevel = y;
			if (game.global.mapsActive && mapSettings.mapName === mapName && (getCurrentMapObject().bonus === undefined ? '0' : getCurrentMapObject().bonus) === mapSpecial && getCurrentMapObject().level - game.global.world === mapLevel) break;
			if (mapLevel === 0) break;
			if (game.resources.fragments.owned < minMapFrag(mapLevel, mapSpecial, 'Random', sliders)) continue;
			var enemyDmg = calcEnemyAttackCore('map', game.global.world + y, 1, 'Snimp', false, false, game.portal.Equality.radLevel) * 0.84 * 4;
			if (enemyDmg > trimpHealth) continue;
			break;
		}
		if (game.global.mapsActive && getCurrentMapObject().level !== game.global.world + mapLevel) {
			recycleMap_AT();
		}
		equality = true;
	}

	if ((forceDestack && game.challenges.Desolation.chilled > 0) || ((game.global.mapsActive || game.challenges.Desolation.chilled > 0) && mapSettings.mapName === 'Desolation Destacking')) {
		if (game.challenges.Desolation.chilled > 0) {
			shouldMap = true;
		} else {
			if (game.challenges.Desolation.chilled === 0) recycleMap_AT(true);
			shouldMap = false;
		}
	}

	//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
	if (lineCheck && shouldMap) return (setting = { priority: 1 });

	const repeat = game.challenges.Desolation.chilled <= mapLevel + 1;
	const status = `Desolation Destacking: ' ${game.challenges.Desolation.chilled} remaining`;

	farmingDetails.shouldRun = shouldMap;
	farmingDetails.mapName = mapName;
	farmingDetails.mapLevel = mapLevel;
	farmingDetails.autoLevel = true;
	farmingDetails.special = mapSpecial;
	farmingDetails.mapSliders = sliders;
	farmingDetails.biome = biome;
	farmingDetails.repeat = !repeat;
	farmingDetails.status = status;
	farmingDetails.equality = equality;

	if (mapSettings.mapName === mapName && !farmingDetails.shouldRun) {
		mappingDetails(mapName, mapLevel, mapSpecial);
		resetMapVars();
	}
	return farmingDetails;
}

function desolationGearScum(lineCheck) {
	var shouldMap = false;
	const mapName = 'Desolation Gear Scum';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Desolation') || !getPageSetting('desolation')) return farmingDetails;

	const settingName = 'desolationSettings';
	const baseSettings = getPageSetting(settingName);
	if (!baseSettings) return farmingDetails;

	const defaultSettings = baseSettings ? baseSettings[0] : null;
	if (!defaultSettings || !defaultSettings.active) return farmingDetails;

	const settingIndex = findSettingsIndex(settingName, baseSettings, mapName);
	const setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting || MODULES.mapFunctions.desolation.gearScum) {
		var special;
		var jobRatio;
		var gather;
		var mapLevel = game.global.lastClearedCell < 80 ? 0 : 1;
		if (settingIndex) {
			special = getAvailableSpecials(setting.special);
			jobRatio = setting.jobratio;
			gather = setting.gather;
		} else if (MODULES.maps.lastMapWeWereIn !== null && MODULES.maps.lastMapWeWereIn.mapLevel === mapLevel) {
			special = MODULES.maps.lastMapWeWereIn.bonus;
		}

		//Check if a max attack+gamma burst can clear the improb.
		//If it can't continue as normal, if it can then we start the +1 map for prestige scumming.
		var currCell = game.global.lastClearedCell + 2;
		var name = game.global.gridArray && game.global.gridArray[0] ? game.global.gridArray[cell - 1].name : undefined;
		var enemyHealth = getCurrentWorldCell().maxHealth > -1 ? getCurrentWorldCell().health : calcEnemyHealthCore('world', game.global.world, currCell, name);
		var equalityAmt = equalityQuery('Improbability', game.global.world, 100, 'world', 1, 'gamma');
		var ourDmg = calcOurDmg('max', equalityAmt, false, 'world', 'force', 0, false);
		var gammaDmg = MODULES.heirlooms.gammaBurstPct;
		var ourDmgTotal = ourDmg * gammaDmg * 5;

		//Check if we will overshoot the improb with our regular hit/gamma burst.
		//Add together the health of the cells between our current cell and the improb that we are able to overkill.
		if (currCell !== 100) {
			for (var x = currCell + 1; x <= 100; x++) {
				name = game.global.gridArray && game.global.gridArray[0] ? game.global.gridArray[x - 1].name : undefined;
				enemyHealth += calcEnemyHealthCore('world', name);
			}
		}

		//Identify how much damage we can do in 5 gamma bursts. If this value is greater than the improb health then we can clear it and we should start the map.
		if (ourDmgTotal > enemyHealth || MODULES.mapFunctions.desolation.gearScum) {
			shouldMap = true;
		}

		//Disabling the need to map if we are at the right conditions.
		//Correct map level
		//Have already cleared cell #1 in the map so it won't recycle
		//If these are met then we should just return to world and set a condition to finish this at the start of the next zone.
		if (settingIndex !== null && shouldMap && game.global.currentMapId !== '' && getCurrentMapCell().level > 3 && getCurrentMapObject().level === game.global.world + mapLevel) {
			shouldMap = false;
			MODULES.mapFunctions.desolation.gearScum = true;
			//Exit map if we're in it so that we don't clear the map.
			if (game.global.mapsActive) {
				debug(mapName + ' (z' + game.global.world + 'c' + (game.global.lastClearedCell + 2) + ') exiting map to ensure we complete it at start of the next zone.', 'map_Details');
				mapsClicked(true);
			}
		}

		const prestigeList = ['Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'];

		//Marking setting as complete if we've run enough maps.
		if (mapSettings.mapName === mapName && MODULES.mapFunctions.desolation.gearScum && (game.global.currentMapId === '' || prestigeList.indexOf(game.global.mapGridArray[getCurrentMapObject().size - 1].special) === -1)) {
			debug(mapName + ' (z' + game.global.world + 'c' + (game.global.lastClearedCell + 2) + ') was successful.', 'map_Details');
			resetMapVars();
			saveSettings();
			shouldMap = false;
			MODULES.mapFunctions.desolation.gearScum = false;
		}

		const status = `Desolation Prestige Scumming`;
		const repeat = true;
		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = mapLevel;
		farmingDetails.jobRatio = jobRatio;
		farmingDetails.special = special;
		farmingDetails.gather = gather;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
		farmingDetails.settingIndex = settingIndex;
		if (setting && setting.priority) farmingDetails.priority = setting.priority;
	}
	return farmingDetails;
}

function smithless(lineCheck) {
	var shouldMap = false;
	const mapName = 'Smithless Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};

	if (!challengeActive('Smithless') || !getPageSetting('smithless')) return farmingDetails;

	if (game.global.world % 25 === 0 && game.global.lastClearedCell === -1 && game.global.gridArray[0].ubersmith) {
		var jobRatio = '0,0,1';
		var mapSpecial = getAvailableSpecials('lmc', true);
		var smithlessMin = game.global.mapBonus !== 10 ? 0 : null;
		var mapLevel = autoLevelCheck(mapName, mapSpecial, null, smithlessMin);

		var name = game.global.gridArray[0].name;
		var gammaDmg = MODULES.heirlooms.gammaBurstPct;
		var equalityAmt = equalityQuery(name, game.global.world, 1, 'world', 1, 'gamma');
		var ourDmg = calcOurDmg('min', equalityAmt, false, 'world', 'never', 0, false);
		var ourDmgTenacity = ourDmg;

		var gammas = 10 % gammaMaxStacks();
		var regularHits = 10 - gammas * gammaMaxStacks();

		//Map Bonus
		if (game.global.mapBonus > 0 && game.global.mapBonus !== 10) {
			ourDmgTenacity /= 1 + 0.2 * game.global.mapBonus;
			ourDmgTenacity *= 5;
		}
		//Tenacity
		if (game.portal.Tenacity.radLevel > 0) {
			if (!(game.portal.Tenacity.getMult() === Math.pow(1.4000000000000001, getPerkLevel('Tenacity') + getPerkLevel('Masterfulness')))) {
				ourDmgTenacity /= game.portal.Tenacity.getMult();
				ourDmgTenacity *= Math.pow(1.4000000000000001, getPerkLevel('Tenacity') + getPerkLevel('Masterfulness'));
			}
		}

		ourDmgTenacity *= getZoneMinutes() > 100 ? 1 : 1.5;
		if (prestigesToGet(game.global.world + mapLevel)[0] > 0) ourDmgTenacity *= 1000;

		var totalDmgTenacity = ourDmgTenacity * regularHits + ourDmgTenacity * gammaDmg * gammas;

		var enemyHealth = calcEnemyHealthCore('world', game.global.world, 1, name);
		enemyHealth *= 3e15;
		const smithyThreshhold = [1, 0.01, 0.000001];
		const smithyThreshholdIndex = [0.000001, 0.01, 1];
		while (smithyThreshhold.length > 0 && totalDmgTenacity < enemyHealth * smithyThreshhold[0]) {
			smithyThreshhold.shift();
		}
		enemyHealth *= smithyThreshhold[0];

		if (smithyThreshhold.length === 0) return farmingDetails;

		var totalDmg = ourDmg * regularHits + ourDmg * gammaDmg * gammas;
		var damageTarget = enemyHealth / totalDmg;

		if (totalDmg < enemyHealth) {
			shouldMap = true;
		}

		//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
		if (lineCheck && shouldMap) return (setting = { priority: Infinity });

		var status = `Smithless: Want ${damageTarget.toFixed(2)} x more damage for ${smithyThreshholdIndex.indexOf(smithyThreshhold[0]) + 1}/3`;

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = mapLevel;
		farmingDetails.autoLevel = true;
		farmingDetails.special = mapSpecial;
		farmingDetails.jobRatio = jobRatio;
		farmingDetails.damageTarget = damageTarget;
		farmingDetails.equality = equalityAmt;
		farmingDetails.repeat = true;
		farmingDetails.status = status;

		if (mapSettings.mapName === mapName && !farmingDetails.shouldRun) {
			mappingDetails(mapName, mapLevel, mapSpecial, smithyThreshholdIndex.indexOf(smithyThreshhold[0]) + 1);
			resetMapVars();
		}
	}

	return farmingDetails;
}

//Calculates the hd ratio that should be used for the current zone from each hd farm setting line.
function hdFarmSettingRatio(setting) {
	var mult = setting.hdMult;
	var hd = setting.hdBase;
	var zone = game.global.world - setting.world;
	return zone === 0 ? hd : Math.pow(mult, zone) * hd;
}

function hdFarm(lineCheck, skipHealthCheck, voidFarm) {
	var shouldMap = false;
	var shouldSkip = false;
	var mapName = 'HD Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName
	};
	const settingName = 'hdFarmSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	var settingIndex = null;
	var setting;
	var mapsRunCap = Infinity;

	//Void Farming setting setup
	if (voidFarm) {
		const voidSetting = getPageSetting('voidMapSettings')[0];
		setting = {
			autoLevel: true,
			hdMult: 1,
			jobratio: voidSetting.jobratio,
			world: game.global.world,
			level: -1,
			hdBase: Number(voidSetting.hdRatio),
			hdType: 'voidFarm',
			mapCap: typeof voidSetting.mapCap !== 'undefined' ? voidSetting.mapCap : 100,
			priority: 1
		};
		//Checking to see which of hits survived and hd farm should be run. Prioritises hits survived.
		if (voidSetting.hitsSurvived > hdStats.hitsSurvivedVoid) {
			setting.hdBase = Number(voidSetting.hitsSurvived);
			setting.hdType = 'hitsSurvivedVoid';
		}
	} //Standalone Hits Survived setting setup.
	else if (!skipHealthCheck && MODULES.mapFunctions.hasHealthFarmed !== getTotalPortals() + '_' + game.global.world && !_berserkDisableMapping() && !_noMappingChallenges()) {
		let hitsSurvivedSetting = targetHitsSurvived(true);
		if (hitsSurvivedSetting > 0 && hdStats.hitsSurvived < hitsSurvivedSetting)
			setting = {
				autoLevel: true,
				hdBase: hitsSurvivedSetting,
				hdMult: 1,
				world: game.global.world,
				hdType: 'hitsSurvived',
				jobratio: typeof defaultSettings.jobratio !== 'undefined' ? defaultSettings.jobratio : '1,1,2',
				level: -1,
				hitsSurvivedFarm: true,
				priority: Infinity
			};
	}
	if (!defaultSettings.active && setting === undefined) return farmingDetails;

	if (defaultSettings.active && settingIndex === null) {
		for (let y = 1; y < baseSettings.length; y++) {
			let currSetting = baseSettings[y];
			let world = currSetting.world;
			if (!settingShouldRun(currSetting, world, 0, settingName)) continue;
			if (currSetting.hdType.toLowerCase().includes('void') && game.global.totalVoidMaps === 0) continue;
			if (skipHealthCheck && currSetting.hdType.includes('hitsSurvived')) continue;
			settingIndex = y;
			break;
		}
	}

	//Setting up setting variable when we aren't void or hits survived farming
	if (settingIndex !== null && setting === undefined) setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting !== undefined) {
		var mapLevel = setting.level;
		var mapSpecial = getAvailableSpecials('lmc');
		var jobRatio = setting.jobratio;
		var hdType = setting.hdType;
		var hitsSurvived = hdStats.hitsSurvived;
		var settingTarget = hdFarmSettingRatio(setting);

		if (mapsRunCap === Infinity) mapsRunCap = typeof setting.mapCap !== 'undefined' ? setting.mapCap : typeof defaultSettings.mapCap !== 'undefined' ? defaultSettings.mapCap : 100;
		if (mapsRunCap === -1) mapsRunCap = Infinity;

		//Rename mapName if running a hits survived setting for some checks
		//Needs to be done before auto level code is run
		if (hdType.includes('hitsSurvived')) {
			mapName = 'Hits Survived';
			if (hdType === 'hitsSurvivedVoid') hitsSurvived = hdStats.hitsSurvivedVoid;
		}

		if (setting.autoLevel) {
			var minLevel = null;
			//Setup min map level for world and hits survived farming as those settings care about map bonus
			if ((setting.hdType === 'world' && game.global.mapBonus !== 10) || (setting.hdType === 'hitsSurvived' && game.global.mapBonus < getPageSetting('mapBonusHealth'))) minLevel = game.global.universe === 1 ? 0 - game.portal.Siphonology.level : 0;
			mapLevel = autoLevelCheck(mapName, mapSpecial, null, minLevel);
		}

		//Identify which type of hdRatio/hits survived we're checking against and store it into a variable for future use.
		var hdRatio = hdType === 'world' ? hdStats.hdRatio : hdType === 'voidFarm' ? hdStats.vhdRatioVoid : hdType === 'void' ? hdStats.hdRatioVoid : hdType === 'map' ? hdStats.hdRatioMap : hdType === 'hitsSurvived' ? hdStats.hitsSurvived : hdType === 'hitsSurvivedVoid' ? hdStats.hitsSurvivedVoid : null;

		//Skipping farm if map repeat value is greater than our max maps value
		if (mapsRunCap > game.global.mapRunCounter && (hdType.includes('hitsSurvived') ? hdRatio < settingTarget : hdType === 'maplevel' ? setting.hdBase > hdStats.autoLevel : hdRatio > settingTarget)) shouldMap = true;

		if (mapSettings.mapName !== mapName && (hdType.includes('hitsSurvived') ? hdRatio > settingTarget : hdType !== 'maplevel' ? settingTarget > hdRatio : hdStats.autoLevel > setting.hdBase)) shouldSkip = true;
		if (((mapSettings.mapName === mapName && !shouldMap) || game.global.mapRunCounter === mapsRunCap || shouldSkip) && hdRatio !== Infinity) {
			if (!shouldSkip) mappingDetails(mapName, mapLevel, mapSpecial, hdRatio, settingTarget, hdType);
			//Messages detailing why we are skipping mapping.
			if (shouldSkip) {
				if (hdType.includes('hitsSurvived')) debug('Hits Survived (z' + game.global.world + 'c' + (game.global.lastClearedCell + 2) + ') skipped as Hits Survived goal has been met (' + hitsSurvived.toFixed(2) + '/' + settingTarget.toFixed(2) + ').', 'map_Skip');
				else if (hdType !== 'maplevel') debug('HD Farm (z' + game.global.world + 'c' + (game.global.lastClearedCell + 2) + ') skipped as HD Ratio goal has been met (' + hdRatio.toFixed(2) + '/' + settingTarget.toFixed(2) + ').', 'map_Skip');
				else debug('HD Farm (z' + game.global.world + 'c' + (game.global.lastClearedCell + 2) + ') skipped as Map Level goal has been met (Autolevel ' + setting.hdBase + '/' + hdStats.autoLevel + ').', 'map_Skip');
			}
			resetMapVars(setting, settingName);
			shouldMap = false;
			if (game.global.mapsActive) recycleMap_AT();
			if (voidFarm) return voidMaps();
		}

		var status = '';

		if (hdType.includes('hitsSurvived')) {
			if (hdType === 'hitsSurvivedVoid') status += 'Void&nbsp;';
			status += 'Hits&nbsp;Survived to:&nbsp;' + settingTarget.toFixed(2) + '<br>';
			status += 'Current:&nbsp;' + prettify(hdRatio.toFixed(2));
		} else {
			status += 'HD&nbsp;Farm&nbsp;to:&nbsp;';
			if (hdType !== 'maplevel') status += settingTarget.toFixed(2) + '<br>Current&nbsp;HD:&nbsp;' + hdRatio.toFixed(2);
			else status += '<br>' + (setting.hdBase >= 0 ? '+' : '') + setting.hdBase + ' Auto Level';
		}
		mapsRunCap = mapsRunCap === Infinity ? '∞' : mapsRunCap;
		var repeat = game.global.mapRunCounter + 1 === mapsRunCap;
		status += '<br> Maps:&nbsp;' + game.global.mapRunCounter + '/' + mapsRunCap;

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = mapLevel;
		farmingDetails.autoLevel = setting.autoLevel;
		farmingDetails.special = mapSpecial;
		farmingDetails.gather = 'metal';
		farmingDetails.jobRatio = jobRatio;
		farmingDetails.hdType = hdType;
		farmingDetails.hdRatio = settingTarget;
		farmingDetails.hdRatio2 = hdRatio;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
		farmingDetails.runCap = mapsRunCap;
		farmingDetails.shouldHealthFarm = hdType.includes('hitsSurvived');
		farmingDetails.voidHitsSurvived = hdType === 'hitsSurvivedVoid' || hdType === 'void';
		farmingDetails.settingIndex = settingIndex;
		if (setting.priority) farmingDetails.priority = setting.priority;
		//Retain info that we have used a bone charge if we are farming stats before we run void maps.
		if (voidFarm) {
			if (mapSettings.boneChargeUsed) farmingDetails.boneChargeUsed = mapSettings.boneChargeUsed;
			if (mapSettings.voidHDIndex) farmingDetails.voidHDIndex = mapSettings.voidHDIndex;
			if (mapSettings.dropdown) farmingDetails.dropdown = mapSettings.dropdown;
			if (mapSettings.dropdown2) farmingDetails.dropdown2 = mapSettings.dropdown2;
			if (mapSettings.voidTrigger) farmingDetails.voidTrigger = mapSettings.voidTrigger;
			if (mapSettings.portalAfterVoids) farmingDetails.portalAfterVoids = mapSettings.portalAfterVoids;
			farmingDetails.voidFarm = true;
		}
	}

	return farmingDetails;
}

function farmingDecision() {
	//Setting up addon user settings.
	setupAddonUser();
	var farmingDetails = {
		shouldRun: false,
		mapName: '',
		levelCheck: Infinity
	};

	//Won't map till after cell 90 on Lead on Even zones
	/* if (challengeActive('Lead') && !game.global.runningChallengeSquared && game.global.world !== 180 && (game.global.world % 2 === 0 || game.global.lastClearedCell + 2 <= 90))
		mapSettings = farmingDetails; */

	if (!game.global.mapsUnlocked) mapSettings = farmingDetails;

	var mapTypes = [];
	//U1 map settings to check for.
	if (game.global.universe === 1) {
		mapTypes = [mapDestacking, prestigeClimb, prestigeRaiding, bionicRaiding, mapFarm, hdFarm, voidMaps, experience, mapBonus, toxicity, _obtainUniqueMap];

		if (challengeActive('Mapology') && getPageSetting('mapology')) mapTypes = [prestigeClimb, prestigeRaiding, bionicRaiding, voidMaps, _obtainUniqueMap];

		if (challengeActive('Frigid') && getPageSetting('frigid') && game.challenges.Frigid.warmth > 0) mapTypes = [voidMaps];

		if (isDoingSpire() && getPageSetting('skipSpires') && game.global.mapBonus === 10) mapSettings = farmingDetails;
	}

	if (game.global.universe === 2) {
		//Disable mapping if we have Withered as it's more beneficial to just push through the zone(s).
		if (game.challenges.Wither.healImmunity > 0 && getPageSetting('wither') && getPageSetting('witherFarm')) return (mapSettings = farmingDetails);

		//U2 map settings to check for.
		mapTypes = [mapDestacking, quest, archaeology, berserk, pandemoniumDestack, pandemoniumEquipFarm, desolationGearScum, desolation, prestigeClimb, prestigeRaiding, smithyFarm, mapFarm, tributeFarm, worshipperFarm, quagmire, insanity, alchemy, hypothermia, hdFarm, voidMaps, mapBonus, wither, mayhem, glass, smithless, _obtainUniqueMap];
	}

	//Skipping map farming if in Decay or Melt and above stack count user input
	if (decaySkipMaps()) mapTypes = [prestigeClimb, voidMaps, _obtainUniqueMap];

	const priorityList = [];
	//If we are currently running a map and it should be continued then continue running it.
	//Running the entire function again is done to ensure that we update the status message and check if it still wants to run.
	if (mapSettings.mapName !== '' && mapTypes.indexOf(mapSettings.settingName) > 0) {
		var mapCheck = mapSettings.settingName();
		if (mapCheck.shouldRun) {
			farmingDetails = mapCheck;
			farmingDetails.settingName = mapSettings.settingName;
		}
	}

	//Checking which settings should be run and adding them to a priority list.
	//This should only run if we aren't already running a setting.
	if (farmingDetails.mapName === '') {
		for (const map of mapTypes) {
			var mapCheck = map(true);
			if (mapCheck && mapCheck.mapName === undefined) {
				mapCheck.settingName = map;
				priorityList.push(mapCheck);
			}
		}
		//Sort priority list by priority > mapTypes index(settingName) if the priority sorting toggle is on
		if (getPageSetting('autoMapsPriority')) {
			//mapTypes.unshift(boneShrine);
			priorityList.sort(function (a, b) {
				if (a.priority === b.priority) return mapTypes.indexOf(a.settingName) > mapTypes.indexOf(b.settingName) ? 1 : -1;
				return a.priority > b.priority ? 1 : -1;
			});
		}
		//Loops through each item in the priority list and checks if it should be run.
		for (const item in priorityList) {
			var mapCheck = priorityList[item].settingName();
			if (mapCheck.shouldRun) {
				farmingDetails = mapCheck;
				farmingDetails.settingName = priorityList[item].settingName;
				break;
			}
		}
	}

	//If in desolation then check if we should destack before farming.
	//This will ALWAYS run when above 0 stacks and another type of farming is meant to be done as it will destack and then run the farming type.
	if (farmingDetails.mapName !== '' && game.challenges.Desolation.chilled > 0 && getPageSetting('desolation') && !MODULES.mapFunctions.desolation.gearScum && challengeActive('Desolation') && !farmingDetails.mapName.includes('Desolation Destacking')) {
		var desolationCheck = desolation(false, true);
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

//I have no idea where loot > drops, hopefully somebody can tell me one day :)
function getBiome(mapGoal, resourceGoal) {
	const dropBased = (challengeActive('Trapper') && game.stats.highestLevel.valueTotal() < 800) || (challengeActive('Trappapalooza') && game.stats.highestRadLevel.valueTotal() < 220) || challengeActive('Metal');
	if (dropBased && !resourceGoal && challengeActive('Metal')) resourceGoal = 'Mountain';

	let biome;
	if (resourceGoal && dropBased) biome = game.global.farmlandsUnlocked && getFarmlandsResType() === game.mapConfig.locations[resourceGoal].resourceType ? 'Farmlands' : resourceGoal;
	else if (mapGoal === 'fragments' || mapGoal === 'gems') biome = 'Depths';
	else if (mapGoal === 'fragConservation') biome = 'Random';
	else if (game.global.universe === 2 && game.global.farmlandsUnlocked) biome = 'Farmlands';
	else if (game.global.decayDone) biome = 'Plentiful';
	else biome = 'Mountain';

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

		let unlock = mapSpecialModifierConfig[mod].name.includes('Research') ? mapSpecialModifierConfig[mod].unlocksAt2() : mapSpecialModifierConfig[mod][unlocksAt];
		if (unlock && unlock <= hze) {
			bestMod = mod;
			break;
		}
	}

	if (!bestMod || (bestMod === 'fa' && trimpStats.hyperspeed2)) bestMod = '0';
	return bestMod;
}

function setMapSliders(pluslevel, special, biome, mapSliders, onlyPerfect) {
	var maplevel = pluslevel < 0 ? game.global.world + pluslevel : game.global.world;
	if (!pluslevel || pluslevel < 0) pluslevel = 0;
	if (!special) special = '0';
	if (!biome) biome = getBiome();
	if (!mapSliders) mapSliders = [9, 9, 9];
	if (mapSliders[0] !== 9 || mapSliders[1] !== 9 || mapSliders[2] !== 9) onlyPerfect = false;
	document.getElementById('biomeAdvMapsSelect').value = biome;
	document.getElementById('advExtraLevelSelect').value = pluslevel > 0 ? pluslevel : 0;
	document.getElementById('advSpecialSelect').value = special;
	document.getElementById('lootAdvMapsRange').value = mapSliders[0];
	document.getElementById('sizeAdvMapsRange').value = mapSliders[1];
	document.getElementById('difficultyAdvMapsRange').value = mapSliders[2];
	document.getElementById('advPerfectCheckbox').dataset.checked = true;
	document.getElementById('mapLevelInput').value = maplevel;
	updateMapCost();

	//If we don't want to only check perfect maps then gradually reduce map sliders if we don't have enough fragments
	if (!onlyPerfect) {
		if (updateMapCost(true) > game.resources.fragments.owned) {
			document.getElementById('advPerfectCheckbox').dataset.checked = false;
			updateMapCost();
		}
		//Highest priority is listed first
		//Special > Difficulty > Loot > Biome > Size
		if (mapSettings.mapName === 'Insanity Farm') {
			while (sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) sizeAdvMapsRange.value -= 1;
			if (!trimpStats.mountainPriority && updateMapCost(true) > game.resources.fragments.owned && !challengeActive('Metal')) document.getElementById('biomeAdvMapsSelect').value = 'Random';
			while (lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) lootAdvMapsRange.value -= 1;
			while (difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) difficultyAdvMapsRange.value -= 1;
			if (updateMapCost(true) > game.resources.fragments.owned) document.getElementById('advSpecialSelect').value = 0;
		} else {
			//Reduce map difficulty
			while (difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) difficultyAdvMapsRange.value -= 1;

			//Reduce map loot
			while (lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) lootAdvMapsRange.value -= 1;

			//Set biome to random if we have jestimps/caches we can run since size will be by far the most important that way
			if (!trimpStats.mountainPriority && updateMapCost(true) > game.resources.fragments.owned && !challengeActive('Metal')) document.getElementById('biomeAdvMapsSelect').value = 'Random';

			if (updateMapCost(true) > game.resources.fragments.owned && (special === '0' || !mapSpecialModifierConfig[special].name.includes('Cache'))) document.getElementById('advSpecialSelect').value = 0;

			//Reduce map size
			while (sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) sizeAdvMapsRange.value -= 1;

			if (updateMapCost(true) > game.resources.fragments.owned) document.getElementById('advSpecialSelect').value = 0;

			if (trimpStats.mountainPriority && updateMapCost(true) > game.resources.fragments.owned && !challengeActive('Metal')) {
				document.getElementById('biomeAdvMapsSelect').value = 'Random';
				updateMapCost();
			}
		}
	}

	return updateMapCost(true);
}

function minMapFrag(level, specialModifier, biome, sliders = [9, 9, 9]) {
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

function mapCost(plusLevel = 0, specialModifier = getAvailableSpecials('lmc'), biome = getBiome(), sliders = [9, 9, 9], perfect = true) {
	const mapLevel = Math.max(game.global.world + plusLevel, 6);
	let baseCost = sliders[0] + sliders[1] + sliders[2];
	//Post broken planet check
	baseCost *= game.global.world >= 60 ? 0.74 : 1;
	//Perfect checked
	if (perfect && sliders.reduce((a, b) => a + b) === 27) baseCost += 6;
	//Adding in plusLevels
	if (plusLevel > 0) baseCost += plusLevel * 10;
	//Special modifier
	if (specialModifier !== '0') baseCost += mapSpecialModifierConfig[specialModifier].costIncrease;
	baseCost += mapLevel;
	baseCost = Math.floor((baseCost / 150) * Math.pow(1.14, baseCost - 1) * mapLevel * 2 * Math.pow(1.03 + mapLevel / 50000, mapLevel));
	baseCost *= biome !== 'Random' ? 2 : 1;
	return baseCost;
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

function findSettingsIndex(settingName, baseSettings, mapName, dailyAddition) {
	for (let y = 1; y < baseSettings.length; y++) {
		let currSetting = baseSettings[y];
		let world = currSetting.world;
		if (currSetting.atlantrimp && !game.mapUnlocks.AncientTreasure.canRunOnce) continue;
		if (currSetting.hdRatio && currSetting.hdRatio > 0 && hdStats.hdRatio < currSetting.hdRatio) continue;

		currSetting.cell = currSetting.cell || 100 - maxOneShotPower() + 1;

		if (shouldSkipSetting(currSetting, world, settingName, dailyAddition)) continue;
		if (shouldSkipSettingPrestigeGoal(currSetting, mapName)) continue;

		currSetting.repeatevery = currSetting.repeatevery || 0;

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
	//If the line isn't active or we're above the zone set then skip
	if (!currSetting.active || game.global.world < world) return false;
	//Skips if repeat every is set to 0 and the world is greater than the current world.
	if (game.global.world > world && currSetting.repeatevery === 0) return false;
	//Skips if repeat every is set to 0 and the world is greater than the current world.
	if (typeof currSetting.repeatevery === 'undefined' && typeof currSetting.repeat === 'undefined' && typeof currSetting.hdType === 'undefined' && typeof currSetting.voidHDRatio === 'undefined' && game.global.world > world) return false;

	//If the setting is marked as done then skips.
	const totalPortals = getTotalPortals();
	const value = game.global.universe === 2 ? 'valueU2' : 'value';
	if (settingName && currSetting.row) {
		const settingDone = game.global.addonUser[settingName][value][currSetting.row].done;
		if (settingDone === `${totalPortals}_${game.global.world}`) return false;

		//Ensure we don't eternally farm if daily reset timer is low enough that it will start again next zone
		//Checks against current portal counter to see if it has already been run this portal.
		if (currSetting.mapType && currSetting.mapType === 'Daily Reset' && settingDone && settingDone.split('_')[0] === totalPortals.toString()) return false;
	}

	//Skips if past designated end zone
	if (game.global.world > currSetting.endzone + zoneReduction) return false;
	//Skips if past designated max void zone
	if (typeof currSetting.maxvoidzone !== 'undefined' && game.global.world > currSetting.maxvoidzone + zoneReduction) return false;
	if (typeof currSetting.bonebelow !== 'undefined' && game.permaBoneBonuses.boosts.charges <= currSetting.bonebelow) return false;
	//Check to see if the cell is liquified and if so we can replace the cell condition with it
	let liquified = game.global.lastClearedCell === -1 && game.global.gridArray && game.global.gridArray[0] && game.global.gridArray[0].name === 'Liquimp';

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
				var currChallenge = currSetting.challenge === 'No Challenge' ? '' : currSetting.challenge;
				if (currSetting.challenge !== 'All' && !challengeActive(currChallenge)) return false;
			} else return false;
		}
	}

	return true;
}

function autoLevelCheck(mapName, mapSpecial, maxZone, minZone) {
	//If we're switching maps we need to set the new map to the current repeat counter so that we don't run too many maps.
	if (game.global.mapRunCounter === 0 && game.global.mapsActive) {
		//As Smithy farm uses 3 different repeat counters we need to check which one we're using and set it to the current repeat counter.
		if (mapName === 'Smithy Farm') {
			if (typeof getCurrentMapObject().bonus !== 'undefined') {
				var mapBonus = getCurrentMapObject().bonus.slice(1);
				var index = ['sc', 'wc', 'mc'].indexOf(mapBonus);
				if (MODULES.maps.mapRepeatsSmithy[index] !== 0 && isFinite(MODULES.maps.mapRepeatsSmithy[index])) game.global.mapRunCounter = MODULES.maps.mapRepeatsSmithy[index];
				//MODULES.maps.mapRepeatsSmithy[0] = 0, MODULES.maps.mapRepeatsSmithy[1] = 0, MODULES.maps.mapRepeatsSmithy[2] = 0;
			}
		} else if (MODULES.maps.mapRepeats !== 0) {
			game.global.mapRunCounter = MODULES.maps.mapRepeats;
		}
		MODULES.maps.mapRepeats = 0;
	}

	let mapLevel = 0;
	if (challengeActive('Bublé') || _getCurrentQuest() === 8) mapLevel = callAutoMapLevel(mapName, mapSpecial);
	else mapLevel = callAutoMapLevel(mapName, mapSpecial, maxZone, minZone);

	if (mapLevel !== mapSettings.levelCheck && mapSettings.levelCheck !== Infinity) {
		if (mapName === 'Smithy Farm') {
			if (game.global.mapsActive && typeof getCurrentMapObject().bonus !== 'undefined') {
				var mapBonus = getCurrentMapObject().bonus.slice(1);
				var index = ['sc', 'wc', 'mc'].indexOf(mapBonus);
				MODULES.maps.mapRepeatsSmithy[index] = game.global.mapRunCounter + 1;
			}
		} else {
			MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
		}
	}
	return mapLevel;
}

function resetMapVars(setting, settingName) {
	const totalPortals = getTotalPortals();
	mapSettings.levelCheck = Infinity;
	mapSettings.mapName = '';
	MODULES.maps.mapTimer = 0;
	MODULES.maps.mapRepeats = 0;
	MODULES.maps.slowScumming = false;
	game.global.mapRunCounter = 0;
	MODULES.maps.mapRepeatsSmithy = [0, 0, 0];

	if (mapSettings.voidFarm) MODULES.mapFunctions.hasVoidFarmed = totalPortals + '_' + game.global.world;

	if (setting && setting.hitsSurvivedFarm) MODULES.mapFunctions.hasHealthFarmed = totalPortals + '_' + game.global.world;

	if (setting && settingName && setting.row) {
		var value = game.global.universe === 2 ? 'valueU2' : 'value';
		game.global.addonUser[settingName][value][setting.row].done = totalPortals + '_' + game.global.world;
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

//Prints out information relating to the mapSettings object to let the user know which setting was run on which zone, cell, how long it took etc
function mappingDetails(mapName, mapLevel, mapSpecial, extra, extra2, extra3) {
	const mapType = mapName.includes('Destack') ? 'map_Destacking' : 'map_Details';
	if (!getPageSetting('spamMessages')[mapType]) return;
	if (!getPageSetting('autoMaps')) return;
	if (!mapName) return;
	if (mapName === 'HD Farm' && extra3 === 'hitsSurvived') mapName = 'Hits Survived';
	//Figuring out exact amount of maps run
	if (mapName !== 'Smithy Farm') {
		var mapProg = game.global.mapsActive ? (getCurrentMapCell().level - 1) / getCurrentMapObject().size : 0;
		var mappingLength = mapProg > 0 ? (game.global.mapRunCounter + mapProg).toFixed(2) : game.global.mapRunCounter;
	}
	//Setting special to current maps special if we're in a map.
	if (game.global.mapsActive) mapSpecial = getCurrentMapObject().bonus === undefined ? 'no special' : getCurrentMapObject().bonus;
	if (mapSpecial === '0') mapSpecial = 'no special';
	if (mapName === 'Bionic Raiding') mapSpecial = game.talents.bionic2.purchased ? 'fa' : 'no special';

	var timeMapping = MODULES.maps.mapTimer > 0 ? getZoneSeconds() - MODULES.maps.mapTimer : 0;
	var currCell = game.global.lastClearedCell + 2;
	var message = '';
	if (mapName !== 'Void Map' && mapName !== 'Quagmire Farm' && mapName !== 'Smithy Farm' && mapName !== 'Bionic Raiding' && mapName !== 'Quest') {
		message += mapName + ' (z' + game.global.world + 'c' + currCell + ') took ' + mappingLength + ' (' + (mapLevel >= 0 ? '+' : '') + mapLevel + ' ' + mapSpecial + ')' + (mappingLength === 1 ? ' map' : ' maps') + ' and ' + formatTimeForDescriptions(timeMapping) + '.';
	} else if (mapName === 'Smithy Farm') {
		message += mapName + ' (z' + game.global.world + 'c' + currCell + ') took ' + MODULES.maps.mapRepeatsSmithy[0] + ' food, ' + MODULES.maps.mapRepeatsSmithy[2] + ' metal, ' + MODULES.maps.mapRepeatsSmithy[1] + ' wood (' + (mapLevel >= 0 ? '+' : '') + mapLevel + ')' + ' maps and ' + formatTimeForDescriptions(timeMapping) + '.';
	} else if (mapName === 'Quagmire Farm') {
		message += mapName + ' (z' + game.global.world + 'c' + currCell + ') took ' + mappingLength + (mappingLength === 1 ? ' map' : ' maps') + ' and ' + formatTimeForDescriptions(timeMapping) + '.';
	} else {
		message += mapName + ' (z' + game.global.world + 'c' + currCell + ') took ' + formatTimeForDescriptions(timeMapping) + '.';
	}

	if (mapName === 'Void Map') {
		var hdObject = {
			'World HD Ratio': hdStats.hdRatio,
			'Map HD Ratio': hdStats.hdRatioMap,
			'Void HD Ratio': hdStats.hdRatioVoid,
			'Hits Survived': hdStats.hitsSurvived,
			'Hits Survived Void': hdStats.hitsSurvivedVoid,
			'Map Level': hdStats.autoLevel
		};
		message +=
			' Void maps were triggered by ' +
			mapSettings.voidTrigger +
			'.<br>\n\
		' +
			(mapSettings.dropdown
				? mapSettings.dropdown.name +
				  ' \
		(Start: ' +
				  prettify(mapSettings.dropdown.hdRatio) +
				  ' | \
		End: ' +
				  prettify(hdObject[mapSettings.dropdown.name]) +
				  ')<br>\n\
		' +
				  mapSettings.dropdown2.name +
				  ' \
		(Start: ' +
				  prettify(mapSettings.dropdown2.hdRatio) +
				  ' | \
		End: ' +
				  prettify(hdObject[mapSettings.dropdown2.name])
				: '') +
			').';
	} else if (mapName === 'Hits Survived') message += ' Finished with hits survived at  ' + prettify(whichHitsSurvived()) + '/' + targetHitsSurvived() + '.';
	else if (mapName === 'HD Farm' && extra !== null) message += ' Finished with a HD Ratio of ' + extra.toFixed(2) + '/' + extra2.toFixed(2) + '.';
	else if (mapName === 'HD Farm') message += ' Finished with an auto level of ' + (hdStats.autoLevel > 0 ? '+' : '') + hdStats.autoLevel + '.';
	else if (mapName === 'Tribute Farm') message += ' Finished with ' + game.buildings.Tribute.purchased + ' tributes and ' + game.jobs.Meteorologist.owned + ' meteorologists.';
	else if (mapName === 'Smithy Farm') message += ' Finished with ' + game.buildings.Smithy.purchased + ' smithies.';
	else if (mapName === 'Insanity Farm') message += ' Finished with ' + game.challenges.Insanity.insanity + ' stacks.';
	else if (mapName === 'Alchemy Farm') message += ' Finished with ' + extra + ' ' + extra2 + '.';
	else if (mapName === 'Hypothermia Farm') message += ' Finished with (' + prettify(game.resources.wood.owned) + '/' + prettify(extra.toFixed(2)) + ') wood.';
	else if (mapName === 'Smithless Farm') message += ' Finished with enough damage to get ' + extra + '/3 stacks.';
	MODULES.maps.mapRepeats = 0;
	debug(message, mapType);
}

function fragmentFarm() {
	var fragmentsNeeded = mapCost(mapSettings.mapLevel, mapSettings.special, mapSettings.biome);
	if (mapSettings.mapName === 'Prestige Raiding' && mapSettings.totalMapCost) fragmentsNeeded = mapSettings.totalMapCost;
	//Check to see if we can afford a perfect map with the maplevel & special selected. If we can then ignore this function otherwise farm fragments until we reach that goal.
	if (game.resources.fragments.owned > fragmentsNeeded || !mapSettings.shouldRun) {
		if (!mapSettings.shouldRun && !MODULES.maps.fragmentFarming) debug('Fragment farming successful');
		MODULES.maps.fragmentFarming = false;
	} //Farms for fragments
	else {
		MODULES.maps.fragmentFarming = true;
		//Purchase fragment farming map if we're in map chamber. If you don't have enough fragments for this map then RIP
		if (game.global.preMapsActive) {
			const mapLevel = game.talents.mapLoot.purchased ? -1 : 0;
			const special = getAvailableSpecials('fa');
			const biome = getBiome('fragments');
			const mapCheck = findMap(mapLevel, special, biome);
			if (!mapCheck) setMapSliders(game.talents.mapLoot.purchased ? -1 : 0, getAvailableSpecials('fa'), getBiome('fragments'), [9, 9, 9], false);
			if (mapCheck || updateMapCost(true) <= game.resources.fragments.owned) {
				if (!mapCheck) buyMap();
				selectMap(mapCheck ? mapCheck : game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id);
				debug('Fragment farming for ' + prettify(fragmentsNeeded) + ' fragments.');
				runMap();
				//Enable repeat and set it to repeat forever if frag farming
				if (!game.global.repeatMap) repeatClicked();
				if (game.options.menu.repeatUntil.enabled !== 0) {
					game.options.menu.repeatUntil.enabled = 0;
					toggleSetting('repeatUntil', null, false, true);
				}
				MODULES.maps.lastMapWeWereIn = getCurrentMapObject();
			} else {
				debug("Not enough fragments to purchase fragment farming map. Waiting for fragments. If you don't have explorers then you will have to manually disable auto maps and continue.", 'maps');
			}
		}
	}
}

//Prestige Raiding
//Checks if map we want to run has equips
function prestigeMapHasEquips(number, raidzones, targetPrestige) {
	if (prestigesToGet(raidzones - number, targetPrestige)[0] > 0) return true;
	return false;
}

//Get raid zone based on skipping map levels above x5 if we have scientist4 or microchip4. Will subtract 5 from the map level to account for this.
function getRaidZone(raidZone) {
	if (getSLevel() >= 4 && !challengeActive('Mapology')) {
		var levelsToSkip = [0, 9, 8, 7, 6];
		if (levelsToSkip.includes(raidZone.toString().slice(-1))) raidZone = raidZone - 5;
	}
	return raidZone;
}

//Calculate the percentage of fragment we should spend on a particular map
function calcFragmentPercentage(raidZone) {
	return !prestigesToGet(raidZone - 1, mapSettings.prestigeGoal)[0] ? 1 : getRaidZone(raidZone) - getRaidZone(raidZone - 1) === 1 ? 0.8 : 0.99;
}

//Calculate cost of maps for prestige raiding
function prestigeRaidingSliderCost(raidZone, special, totalCost, fragmentPercentage) {
	if (!special) special = getAvailableSpecials('p');
	raidZone = getRaidZone(raidZone);
	if (!totalCost) totalCost = 0;
	raidZone = raidZone - game.global.world;

	var fragmentsOwned = (game.resources.fragments.owned - totalCost) * fragmentPercentage;
	var sliders = [9, 9, 9];
	var biome = getBiome();
	var perfect = true;

	//Set loot, difficulty sliders to 0, biome to Random & perfect maps to off if using frag min setting!
	if (mapSettings.fragSetting === 1) {
		biome = 'Random';
		sliders[0] = 0;
		sliders[2] = 0;
		perfect = false;
	}

	//Gradually reduce map sliders if not using frag max setting!
	if (mapSettings.fragSetting !== 2) {
		//Remove perfect maps
		if (mapCost(raidZone, special, biome, sliders, perfect) > fragmentsOwned) perfect = false;
		//Remove biome
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
	var cost = 0;
	var sliders = new Array(5);
	var fragmentPercentage = mapSettings.incrementMaps ? calcFragmentPercentage(mapSettings.raidzones) : 1;

	if (prestigesToGet(mapSettings.raidzones, mapSettings.prestigeGoal)[0]) {
		sliders[0] = prestigeRaidingSliderCost(mapSettings.raidzones, mapSettings.special, cost, fragmentPercentage);
		cost += mapCost(sliders[0][0], sliders[0][1], sliders[0][2], sliders[0][3], sliders[0][4]);
	}
	if (mapSettings.incrementMaps) {
		for (var i = 1; i < 5; i += 1) {
			if (prestigesToGet(mapSettings.raidzones - i, mapSettings.prestigeGoal)[0]) {
				sliders[i] = prestigeRaidingSliderCost(mapSettings.raidzones - i, mapSettings.special, cost, calcFragmentPercentage(mapSettings.raidzones - i));
				cost += mapCost(sliders[i][0], sliders[i][1], sliders[i][2], sliders[i][3], sliders[i][4]);
			} else break;
		}
	}

	return {
		cost: cost,
		sliders: sliders
	};
}

function dailyModiferReduction() {
	if (!challengeActive('Daily')) return 0;

	var dailyMods = dailyModifiersOutput().split('<br>');
	dailyMods.length = dailyMods.length - 1;
	var dailyReduction = 0;
	var settingsArray = getPageSetting('dailyPortalSettingsArray');

	for (var item in settingsArray) {
		if (!settingsArray[item].enabled) continue;
		var dailyReductionTemp = 0;
		var modifier = item;
		if (modifier.includes('Weakness')) modifier = 'Enemies stack a debuff with each attack, reducing Trimp attack by';
		else if (modifier.includes('Famine')) modifier = 'less Metal, Food, Wood, and Gems from all sources';
		else if (modifier.includes('Large')) modifier = 'All housing can store';
		else if (modifier.includes('Void')) modifier = 'Enemies in Void Maps have';
		else if (modifier.includes('Heirlost')) modifier = 'Heirloom combat and resource bonuses are reduced by';

		for (var x = 0; x < dailyMods.length; x++) {
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
	if (!challengeActive('Daily')) return skipDetails;
	if (!getPageSetting('mapOddEvenIncrement')) return skipDetails;
	//Skip if we're on the last zone of a nature band to ensure we don't accidentally farm in the wrong band type
	if (game.global.world >= getNatureStartZone() && getEmpowerment() !== getZoneEmpowerment(game.global.world + 1)) return skipDetails;

	//Odd trimp nerf - 30-80%
	if (typeof game.global.dailyChallenge.oddTrimpNerf !== 'undefined') {
		skipDetails.oddMult -= dailyModifiers.oddTrimpNerf.getMult(game.global.dailyChallenge.oddTrimpNerf.strength);
	}
	//Even trimp buff - 120-300%
	if (typeof game.global.dailyChallenge.evenTrimpBuff !== 'undefined') {
		skipDetails.evenMult = dailyModifiers.evenTrimpBuff.getMult(game.global.dailyChallenge.evenTrimpBuff.strength);
	}
	//Dodge Dailies -- 2-30%!
	if (typeof game.global.dailyChallenge.slippery !== 'undefined') {
		skipDetails.slipStr = game.global.dailyChallenge.slippery.strength / 100;
		skipDetails.slipPct = skipDetails.slipStr > 15 ? skipDetails.slipStr - 15 : skipDetails.slipStr;
		skipDetails.slipMult = 0.02 * skipDetails.slipPct * 100;
		if (skipDetails.slipStr > 0.15) skipDetails.slipType = 'even';
		else skipDetails.slipType = 'odd';
	}

	//Return if no even/odd or dodge daily mods
	if (skipDetails.oddMult === 1 && skipDetails.evenMult === 1 && skipDetails.slipType === '') return skipDetails;

	//If we have even AND odd mods, set odd to 0
	if (skipDetails.oddMult !== 1 && skipDetails.evenMult !== 1) {
		if (skipDetails.slipType !== '') {
			//Sets evenMult to 0 if we have an even dodge daily and it's over 20%
			if (skipDetails.slipType === 'even' && skipDetails.slipMult > 15) {
				skipDetails.evenMult = 0;
			}
			//Sets evenMult to 0 if we have an even dodge daily and it's over 10% and oddMult is less than 50%
			else if (skipDetails.slipType === 'even' && skipDetails.slipMult > 10 && skipDetails.oddMult > 0.5) {
				skipDetails.evenMult = 0;
			}
			//Sets oddMult to 0 if we have an odd dodge daily
			else if (skipDetails.slipType === 'odd') {
				skipDetails.oddMult = 0;
			}
		} //Set oddMult to 0 if we don't have a dodge daily
		else {
			skipDetails.oddMult = 0;
		}
	} //If we have even OR odd mods & dodge chance, set the other mod to 0
	else if (skipDetails.slipType !== '' && (skipDetails.oddMult !== 1 || skipDetails.evenMult !== 1)) {
		if (skipDetails.slipType === 'even' && skipDetails.oddMult === 1) {
			skipDetails.evenMult = 0;
		}
		if (skipDetails.slipType === 'odd' && skipDetails.evenMult === 1) {
			skipDetails.oddMult = 0;
		}
	} //If dodge daily & no negative trimp mods then disable farming on the dodge zone
	else if (skipDetails.slipType !== '') {
		if (skipDetails.slipType === 'even') {
			skipDetails.evenMult = 0;
		} else if (skipDetails.slipType === 'odd') {
			skipDetails.oddMult = 0;
		}
	} //If we don't have a dodge daily then skip on odd zones. Farm on even zones.
	else if (skipDetails.evenMult !== 1) {
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
	if (!game.global.mapsActive) return;
	if (game.global.lastClearedMapCell > -1) return;
	if (!atSettings.running) return;
	atSettings.running = false;

	const map = getCurrentMapObject();
	if (map.size > 36) return;

	const maxSlowCells = Math.ceil(map.size / 2);

	var slowCellTarget = !slowTarget ? maxSlowCells : slowTarget;
	if (slowCellTarget >= maxSlowCells) slowCellTarget = maxSlowCells;
	if (challengeActive('Desolation')) slowCellTarget = 9;
	slowCellTarget = Math.ceil(slowCellTarget);
	var firstCellSlow = false;
	var slowCount = 0;
	game.global.fighting = false;
	var i = 0;

	//Setting up variables for heirloom swapping!
	game.global.mapRunCounter = 0;
	MODULES.maps.slowScumming = true;
	console.time();

	//Repeats the process of exiting and re-entering maps until the first cell is slow and you have desired slow cell count on odd cells!
	while (slowCount < slowCellTarget || !firstCellSlow) {
		var mapGrid = game.global.mapGridArray;
		firstCellSlow = false;
		slowCount = 0;

		//Looping to figure out if we have enough slow enemies on odd cells
		for (var item in mapGrid) {
			if (mapGrid[item].level % 2 === 0) continue;
			if (trimpStats.currChallenge === 'Desolation') {
				if (MODULES.fightinfo.exoticImps.includes(mapGrid[item].name)) slowCount++;
			} else if (!MODULES.fightinfo.fastImps.includes(mapGrid[item].name)) {
				slowCount++;
			}
		}

		//Checking if the first enemy is slow
		var enemyName = mapGrid[0].name;
		if (trimpStats.currChallenge === 'Desolation') {
			if (MODULES.fightinfo.exoticImps.includes(enemyName)) firstCellSlow = true;
		} else if (!MODULES.fightinfo.fastImps.includes(enemyName)) firstCellSlow = true;

		if (slowCount < slowCellTarget || !firstCellSlow) {
			buildMapGrid(game.global.currentMapId);
			game.global.mapRunCounter = 0;
		} else break;
		i++;
	}
	var msg = '';
	if (slowCount < slowCellTarget || !firstCellSlow) msg = 'Failed. ';
	msg += i + ' Rerolls. Current roll = ' + slowCount + ' odd slow enemies.';
	console.timeEnd();
	atSettings.running = true;
	debug(msg, 'mapping_Details');
}

function setupAddonUser(force) {
	//Setting up addon user settings.
	if (typeof game.global.addonUser !== 'object' || force) {
		game.global.addonUser = {};

		const u1Settings = ['hdFarm', 'voidMap', 'boneShrine', 'mapBonus', 'mapFarm', 'raiding', 'bionicRaiding', 'toxicity'];
		const u2Settings = ['hdFarm', 'voidMap', 'boneShrine', 'mapBonus', 'mapFarm', 'raiding', 'worshipperFarm', 'tributeFarm', 'smithyFarm', 'quagmire', 'archaeology', 'insanity', 'alchemy', 'hypothermia', 'desolation'];

		const createObjArray = () => Array.from({ length: 31 }, () => ({ done: '' }));

		u1Settings.forEach((item) => {
			const settingKey = `${item}Settings`;
			if (!game.global.addonUser[settingKey]) game.global.addonUser[settingKey] = {};
			if (!game.global.addonUser[settingKey].value) game.global.addonUser[settingKey].value = createObjArray();
		});

		u2Settings.forEach((item) => {
			const settingKey = `${item}Settings`;
			if (!game.global.addonUser[settingKey]) game.global.addonUser[settingKey] = {};
			if (!game.global.addonUser[settingKey].valueU2) game.global.addonUser[settingKey].valueU2 = createObjArray();
		});
	}
}
