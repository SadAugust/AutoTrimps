MODULES.mapFunctions = {};

MODULES.mapFunctions.afterVoids = false;
MODULES.mapFunctions.hasHealthFarmed = '';
MODULES.mapFunctions.hasVoidFarmed = '';
MODULES.mapFunctions.runUniqueMap = '';
MODULES.mapFunctions.hypothermia = { buyPackrat: false, }
MODULES.mapFunctions.desolation = { gearScum: false, }

//Unique Maps Object. Used to store information about unique maps such as challenges that they need to be run to complete, zone they unlock, speedrun achievements linked to them.
MODULES.mapFunctions.uniqueMaps = Object.freeze({
	//Universe 1 Unique Maps
	'The Block': {
		zone: 11,
		challenges: ['Scientist', 'Trimp'],
		speedrun: 'blockTimed',
		universe: 1,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (aboveMapLevel && !game.upgrades.Shieldblock.allowed && getPageSetting('equipShieldBlock')) return true; //Don't bother before z12 outside of manual unique map settings setup
			else if (game.mapUnlocks.BigWall.canRunOnce && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		},
	},
	'The Wall': {
		zone: 15,
		challenges: [],
		speedrun: 'wallTimed',
		universe: 1,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (aboveMapLevel && !game.upgrades.Bounty.allowed && !game.talents.bounty.purchased) return true; //Don't bother before z16
			else if (game.mapUnlocks.TheWall.canRunOnce && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		},
	},
	'Dimension of Anger': {
		zone: 20,
		challenges: ['Discipline', 'Metal', 'Size', 'Frugal', 'Coordinate'],
		speedrun: 'angerTimed',
		universe: 1,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (document.getElementById('portalBtn').style.display !== 'none') return false;
			if ((game.global.world - 1 > map.level)) return true; //Don't bother before z22
			else if (game.mapUnlocks.Portal.canRunOnce && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		},
	},
	'Trimple Of Doom': {
		zone: 33,
		challenges: ['Meditate', 'Anger'],
		speedrun: 'doomTimed',
		universe: 1,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (aboveMapLevel && game.portal.Relentlessness.locked) return true; //Unlock the Relentlessness perk
			else if (game.mapUnlocks.AncientTreasure.canRunOnce && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		},
	},
	'The Prison': {
		zone: 80,
		challenges: ['Electricity', 'Mapocalypse'],
		speedrun: 'prisonTimed',
		universe: 1,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (aboveMapLevel && game.global.prisonClear <= 0 && enoughHealth(map)) return true; //Unlock the Electricity challenge
			else if (game.mapUnlocks.ThePrison.canRunOnce && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		},
	},
	'Imploding Star': {
		zone: 170,
		challenges: ['Devastation'],
		speedrun: 'starTimed',
		universe: 1,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (game.mapUnlocks.ImplodingStar.canRunOnce && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		},
	},
	'Bionic Wonderland': {
		zone: 125,
		challenges: ['Crushed'],
		speedrun: 'bionicTimed',
		universe: 1,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			return false;
		},
	},

	//Universe 2 Unique Maps
	'Big Wall': {
		zone: 8,
		challenges: [''],
		speedrun: 'bigWallTimed',
		universe: 2,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (aboveMapLevel && !game.upgrades.Bounty.allowed && !game.talents.bounty.purchased) return true; // we need Bounty
			else if (!game.upgrades.Bounty.allowed && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		},
	},
	'Dimension of Rage': {
		zone: 15,
		challenges: ['Unlucky'],
		speedrun: '',
		universe: 2,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (document.getElementById('portalBtn').style.display !== 'none') return false;
			if ((game.global.world - 1 > map.level) && game.global.totalRadPortals < 5) return true; //Don't bother before z22
			else if (mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		},
	},
	'Prismatic Palace': {
		zone: 20,
		challenges: [''],
		speedrun: 'palaceTimed',
		universe: 2,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (game.mapUnlocks.Prismalicious.canRunOnce && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		},
	},
	'Atlantrimp': {
		zone: 33,
		challenges: [''],
		speedrun: 'atlantrimpTimed',
		universe: 2,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (!game.mapUnlocks.AncientTreasure.canRunOnce) return false;
			else if (mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;
			return false;
		},
	},
	'Melting Point': {
		zone: 50,
		challenges: [''],
		speedrun: 'meltingTimed',
		universe: 2,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (!game.mapUnlocks.SmithFree.canRunOnce) return false;
			if (!trimpStats.isC3 && !trimpStats.isDaily && mapSetting.enabled && game.global.world >= mapSetting.zone && (game.global.lastClearedCell + 2 >= mapSetting.cell || liquified)) return true;

			const uniqueMapSetting = getPageSetting('uniqueMapSettingsArray');
			const currChallenge = trimpStats.currChallenge.toLowerCase();
			var smithyGoal = Infinity;
			if ((currChallenge === 'mayhem' || currChallenge === 'pandemonium' || currChallenge === 'desolation') && getPageSetting(currChallenge + 'MP') > 0)
				smithyGoal = getPageSetting(currChallenge + 'MP');
			else if (trimpStats.isC3 && uniqueMapSetting.MP_Smithy_C3.enabled && uniqueMapSetting.MP_Smithy_C3.value > 0)
				smithyGoal = uniqueMapSetting.MP_Smithy_C3.value;
			else if (trimpStats.isDaily && uniqueMapSetting.MP_Smithy_Daily.enabled && uniqueMapSetting.MP_Smithy_Daily.value > 0)
				smithyGoal = uniqueMapSetting.MP_Smithy_Daily.value;
			else if (trimpStats.isFiller && uniqueMapSetting.MP_Smithy.enabled && uniqueMapSetting.MP_Smithy.value > 0)
				smithyGoal = uniqueMapSetting.MP_Smithy.value;

			if (smithyGoal <= game.buildings.Smithy.owned) return true;
			return false;
		},
	},
	'The Black Bog': {
		zone: 6,
		challenges: [''],
		speedrun: '',
		universe: 2,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			if (mapSettings.mapName === 'Quagmire Farm' && quagmire().shouldRun) return true;
			return false;
		},
	},
	'Frozen Castle': {
		zone: 175,
		challenges: [''],
		speedrun: '',
		universe: 2,
		runConditions: function (map, mapSetting, liquified, aboveMapLevel) {
			const runningHypo = challengeActive('Hypothermia');
			const regularRun = !runningHypo && mapSetting.enabled && game.global.world >= mapSetting.zone && game.global.lastClearedCell + 2 >= mapSetting.cell;
			if (regularRun) return true;
			const hypoDefaultSettings = getPageSetting('hypothermiaSettings')[0];
			const hypothermiaRun = runningHypo && mapSettings.mapName !== 'Void Maps' &&
				hypoDefaultSettings.active && game.global.world >= (hypoDefaultSettings.frozencastle[0] !== undefined ? parseInt(hypoDefaultSettings.frozencastle[0]) : 200) &&
				(game.global.lastClearedCell + 2 >= (hypoDefaultSettings.frozencastle[1] !== undefined ? parseInt(hypoDefaultSettings.frozencastle[1]) : 99) || liquified);
			if (hypothermiaRun) return true;
			return false;
		},
	}
});

function isDoingSpire() {
	if (!game.global.spireActive) return false;
	const settingPrefix = trimpStats.isC3 ? 'c2' : trimpStats.isDaily ? 'd' : '';
	var spireNo = getPageSetting(settingPrefix + 'IgnoreSpiresUntil');
	if (spireNo <= 0) return true;
	var spireZone = (1 + spireNo) * 100;
	return game.global.world >= spireZone;
}

function exitSpireCell(checkCell) {
	if (!game.global.spireActive) return;
	const settingPrefix = trimpStats.isC3 ? 'c2' : trimpStats.isDaily ? 'd' : '';
	const exitCell = getPageSetting(settingPrefix + 'ExitSpireCell');
	var cell;
	if (isDoingSpire() && exitCell > 0 && exitCell <= 100)
		cell = exitCell;
	else cell = 100;
	if (checkCell) return cell;
	if (exitCell <= 0) return;

	isDoingSpire() && game.global.lastClearedCell > exitCell - 1 && endSpire()
}

//Checks to see if we have enough health to survive against the max attack of the worst enemy cell inside of a map.
function enoughHealth(map) {
	var health = calcOurHealth(false, 'map', false, true);
	var block = calcOurBlock(false, false);
	var totalHealth = health + block;
	//All maps are slow except Imploding Star so we only need to be able to survive against Snimps in every other map
	var enemyName = 'Snimp';
	if (map.name === 'Imploding Star') enemyName = 'Neutrimp';
	//Black Bogs don't update map level each zone until you first run them so we need to use the world number instead
	var level = map.name === 'The Black Bog' ? game.global.world : map.level;
	var equalityAmt = 0;
	if (game.global.universe === 2) equalityAmt = equalityQuery(enemyName, level, map.size, 'map', map.difficulty, 'gamma');
	//Calculate enemy damage for the map
	var enemyDmg = calcEnemyAttackCore('map', level, map.size, enemyName, false, false, equalityAmt) * map.difficulty;

	return totalHealth > enemyDmg;
}

//Returns false if we can't any new speed runs, unless it's the first tier
function shouldSpeedRun(achievement) {
	var minutesThisRun = Math.floor((new Date().getTime() - game.global.portalTime) / 1000 / 60);
	if (achievement.finished === achievement.tiers.length) return false;
	return minutesThisRun < achievement.breakpoints[achievement.finished];
}

//Unique Maps Pt.2
function shouldRunUniqueMap(map) {
	//Stops unique maps being run when we should be destacking instead as it is likely to be slower overall.
	if (mapSettings.mapName === 'Desolation Destacking') return false;
	if (mapSettings.mapName === 'Pandemonium Destacking') return false;
	if (mapSettings.mapName === 'Mayhem Destacking') return false;
	const mapData = MODULES.mapFunctions.uniqueMaps[map.name];
	if (mapData === undefined || game.global.world < mapData.zone)
		return false;
	if (game.global.universe !== mapData.universe)
		return false;
	if (!trimpStats.isC3 && mapData.challenges.includes(trimpStats.currChallenge) && !challengeActive('') && enoughHealth(map))
		return true;
	//Remove speed run check for now
	/* if (mapData.speedrun && shouldSpeedRun(game.achievements[mapData.speedrun]) && enoughHealth(map)) {
		return true;
	} */
	//Disable mapping if we don't have enough health to survive the map and the corresponding setting is enabled.
	if (getPageSetting('uniqueMapEnoughHealth') && !enoughHealth(map)) return false;

	if (MODULES.mapFunctions.runUniqueMap === map.name) {
		if (game.global.mapsActive && getCurrentMapObject().location === MODULES.mapFunctions.runUniqueMap) MODULES.mapFunctions.runUniqueMap = '';
	}
	//Check to see if the cell is liquified and if so we can replace the cell condition with it
	const liquified = game.global.gridArray && game.global.gridArray[0] && game.global.gridArray[0].name === 'Liquimp';
	const uniqueMapSetting = getPageSetting('uniqueMapSettingsArray');
	const mapSetting = uniqueMapSetting[map.name.replace(/ /g, "_")];
	const aboveMapLevel = game.global.world > map.level;

	//Check to see if the map should be run based on the user's settings.
	if (MODULES.mapFunctions.runUniqueMap === map.name || mapData.runConditions(map, mapSetting, liquified, aboveMapLevel)) {
		if (getPageSetting('spamMessages').map_Details && game.global.preMapsActive) debug('Running ' + map.name + (map.name === 'Melting Point' ? ' at ' + game.buildings.Smithy.owned + ' smithies' : '') + ' on zone ' + game.global.world + '.', 'map_Details');
		return true;
	}
	return false;
}

function recycleMap_AT(forceAbandon) {
	if (!getPageSetting('autoMaps')) return;
	if (!getPageSetting('recycleExplorer') && game.jobs.Explorer.locked === 1) return;
	if (!forceAbandon && (challengeActive('Mapology') || challengeActive('Unbalance') || challengeActive('Trappapalooza') || challengeActive('Archaeology') || (challengeActive('Berserk') && !game.challenges.Berserk.weakened !== 20) || game.portal.Frenzy.frenzyStarted !== -1 || !newArmyRdy() || mapSettings.mapName === 'Prestige Raiding' || mapSettings.mapName === 'Prestige Climb')) return;

	//If we're done mapping AND in a map, then exit map to either world if autoMaps is enabled or to map chamber if not.
	if (!game.global.preMapsActive)
		mapsClicked(true);
	if (game.global.preMapsActive) recycleMap();
}

//Check to see if we are running Atlantrimp or if we should be.
function runningAtlantrimp() {
	if (getPageSetting('autoMaps') === 1 && mapSettings.atlantrimp) return true;
	else if (game.global.mapsActive && (getCurrentMapObject().location === 'Atlantrimp' || getCurrentMapObject().location === 'Trimple Of Doom')) return true;

	return false;
}

function runUniqueMap(mapName) {
	if (game.global.mapsActive && getCurrentMapObject().name === mapName) return;
	if (getPageSetting('autoMaps') !== 1) return;
	if (challengeActive('Insanity')) return;
	if (mapName === 'Atlantrimp' && game.global.universe === 1) mapName = 'Trimple Of Doom';

	MODULES.mapFunctions.runUniqueMap = mapName;
	const map = game.global.mapsOwnedArray.find(map => map.name.includes(mapName));
	if (map !== undefined) {
		if (game.global.mapsActive && getCurrentMapObject().name !== mapName)
			recycleMap_AT();
		if (game.global.preMapsActive && game.global.currentMapId === '') {
			selectMap(map.id);
			runMap_AT();
			debug('Running ' + mapName + ' on zone ' + game.global.world + '.', 'map_Details');
		}
	}
}

//Void Maps
MODULES.mapFunctions.voidPrefixes = Object.freeze({
	'Poisonous': 10,
	'Destructive': 11,
	'Heinous': 20,
	'Deadly': 30
});

MODULES.mapFunctions.voidSuffixes = Object.freeze({
	'Descent': 7.077,
	'Void': 8.822,
	'Nightmare': 9.436,
	'Pit': 10.6
});

function getVoidMapDifficulty(map) {
	if (!map) {
		return 99999;
	}
	var score = 0;
	for (const [prefix, weight] of Object.entries(MODULES.mapFunctions.voidPrefixes)) {
		if (map.name.includes(prefix)) {
			score += weight;
			break;
		}
	}
	for (const [suffix, weight] of Object.entries(MODULES.mapFunctions.voidSuffixes)) {
		if (map.name.includes(suffix)) {
			score += weight;
			break;
		}
	}
	return score;
}

function selectEasierVoidMap(map1, map2) {
	if (getVoidMapDifficulty(map2) > getVoidMapDifficulty(map1))
		return map1;
	else
		return map2;
}

function voidMaps(lineCheck) {

	var shouldMap = false;
	const mapName = 'Void Map';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	const settingName = 'voidMapSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	var settingIndex = null;
	var setting;
	if (defaultSettings === null) return farmingDetails;

	if (!defaultSettings.active && !mapSettings.portalAfterVoids && !MODULES.mapFunctions.afterVoids) return farmingDetails;

	const voidReduction = trimpStats.isDaily ? dailyModiferReduction() : 0;
	const dailyAddition = dailyOddOrEven();
	const zoneAddition = dailyAddition.active ? 1 : 0;

	var dropdowns = ['hdRatio', 'voidHDRatio'];
	var hdTypes = ['hdType', 'hdType2'];

	var hdObject = {
		world: { hdStat: hdStats.hdRatio, hdStatVoid: hdStats.vhdRatio, name: 'World HD Ratio', },
		map: { hdStat: hdStats.hdRatioMap, name: 'Map HD Ratio', },
		void: { hdStat: hdStats.hdRatioVoid, hdStatVoid: hdStats.vhdRatioVoid, name: 'Void HD Ratio', },
		hitsSurvived: { hdStat: hdStats.hitsSurvived, name: 'Hits Survived', },
		hitsSurvivedVoid: { hdStat: hdStats.hitsSurvivedVoid, name: 'Hits Survived Void', },
		maplevel: { hdStat: hdStats.autoLevel, name: 'Map Level', },
	};

	for (var y = 0; y < baseSettings.length; y++) {
		if (y === 0) continue;
		const currSetting = baseSettings[y];
		var world = currSetting.world + voidReduction;
		var maxVoidZone = currSetting.maxvoidzone + voidReduction;

		if (dailyAddition.active) {
			if (dailyAddition.skipZone) continue;
			if (!settingShouldRun(currSetting, world, 0, settingName) && !settingShouldRun(currSetting, world, zoneAddition, settingName)) continue;
		}
		else if (!settingShouldRun(currSetting, world, 0, settingName)) continue;

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
						hdRatio: obj.hdStat,
					}
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

		const voidSetting = getPageSetting('voidMapSettings')[0];
		setting = {
			cell: 1, jobratio: defaultSettings.jobratio ? defaultSettings.jobratio : '0,0,1', world: game.global.world, portalAfter: true, priority: 0,
		}
		//Checking to see which of hits survived and hd farm should be run. Prioritises hits survived.
		if (voidSetting.hitsSurvived > hdStats.hitsSurvivedVoid) {
			setting.hdBase = Number(voidSetting.hitsSurvived);
			setting.hdType = 'hitsSurvivedVoid';
		}
		mapSettings.voidTrigger = (resource() + ' Per Hour (') + autoTrimpSettings.heliumHrPortal.name()[portalSetting] + ')';
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
			if (defaultSettings.voidFarm && !(challengeActive('Metal') || challengeActive('Transmute')) && MODULES.mapFunctions.hasVoidFarmed !== (getTotalPortals() + '_' + game.global.world) &&
				((defaultSettings.hitsSurvived > 0 && defaultSettings.hitsSurvived > hdStats.hitsSurvivedVoid) ||
					(defaultSettings.hdRatio > 0 && defaultSettings.hdRatio < hdStats.vhdRatioVoid)
				)
			) {
				//Print farming message if we haven't already started HD Farming for stats.
				if (!mapSettings.voidFarm && getPageSetting('autoMaps'))
					debug(mapName + ' (z' + game.global.world + 'c' + (game.global.lastClearedCell + 2) + ') farming for stats before running void maps.', 'map_Details');
				return hdFarm(false, false, true, true);
			}
		}

		var stackedMaps = Fluffy.isRewardActive('void') ? countStackedVoidMaps() : 0;
		var status = 'Void Maps: ' + game.global.totalVoidMaps + ((stackedMaps) ? ' (' + stackedMaps + ' stacked)' : '') + ' remaining';

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

	var shouldMap = false;
	var mapAutoLevel = Infinity;
	const mapName = 'Map Bonus';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	//Initialise variables
	const settingName = 'mapBonusSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	var settingIndex = null;
	var setting;
	if (defaultSettings === null) return farmingDetails;
	var mapBonusRatio = getPageSetting('mapBonusRatio');
	//Will get map stacks if below our set hd threshold.
	var hdCheck = mapBonusRatio > 0 && hdStats.hdRatio > mapBonusRatio && getPageSetting('mapBonusStacks') > game.global.mapBonus;
	var healthStacks = hdCheck ? getPageSetting('mapBonusStacks') : 0;
	//Will get max map bonus stacks if we are doing an active spire.
	var spireCheck = getPageSetting('MaxStacksForSpire') && isDoingSpire();
	var spireStacks = spireCheck ? 10 : 0;

	if (defaultSettings.active) {
		if (settingIndex === null)
			for (var y = 0; y < baseSettings.length; y++) {
				if (y === 0) continue;
				if (game.global.mapBonus === 10) continue;
				const currSetting = baseSettings[y];
				var world = currSetting.world;
				if (!settingShouldRun(currSetting, world, 0, settingName)) continue;
				if (currSetting.hdRatio > 0 && hdStats.hdRatio < currSetting.hdRatio) continue;
				settingIndex = y;
			}
	}

	if (hdCheck || spireCheck) {
		//Set settings variable if we need to get hd or spire map bonus. Uses inputs from default settings (top) row of map bonus settings.
		const defaultEmpty = Object.keys(defaultSettings).length === 1;
		setting = {
			jobratio: defaultEmpty ? '1,1,2' : defaultSettings.jobratio, autoLevel: true, level: 0, special: defaultEmpty ? 'lmc' : defaultSettings.special, repeat: Math.max(spireStacks, healthStacks), priority: Infinity,
		}
	}

	if (settingIndex !== null) setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting !== undefined) {
		//Initialise variables for map settings.
		var repeatCounter = setting.repeat;
		var mapLevel = setting.level;
		var autoLevel = setting.autoLevel;
		var jobRatio = setting.jobratio;
		var mapSpecial = setting.special !== '0' ? getAvailableSpecials(setting.special) : '0';

		//Factor in siphonology for U1.
		var minZone = game.global.universe === 1 ? (0 - game.portal.Siphonology.level) : 0
		//If auto level enabled will get the level of the map we should run.
		if (autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && MODULES.maps.mapRepeats !== 0) {
				game.global.mapRunCounter = MODULES.maps.mapRepeats;
				MODULES.maps.mapRepeats = 0;
			}

			var autoLevel_Repeat = mapSettings.levelCheck;
			mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, 10, minZone);
			if (mapAutoLevel !== Infinity) {
				if (autoLevel_Repeat !== Infinity && mapAutoLevel !== autoLevel_Repeat) MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
				mapLevel = mapAutoLevel;
			}
		}

		if (repeatCounter > game.global.mapBonus) {
			shouldMap = true;
		}
		var repeat = game.global.mapBonus >= (repeatCounter - 1);

		var status = (spireCheck ? 'Spire ' : '') + 'Map Bonus: ' + game.global.mapBonus + '/' + repeatCounter;

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = mapLevel;
		farmingDetails.autoLevel = autoLevel;
		farmingDetails.jobRatio = jobRatio;
		farmingDetails.special = mapSpecial;
		farmingDetails.mapRepeats = repeatCounter;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
		farmingDetails.settingIndex = settingIndex;
		if (setting.priority) farmingDetails.priority = setting.priority;
	}

	//Display setting run message. Reset map vars that were used.
	if (mapSettings.mapName === mapName && (game.global.mapBonus >= mapSettings.mapRepeats || !farmingDetails.shouldRun)) {
		mappingDetails(mapName, mapSettings.mapLevel, mapSettings.special);
		resetMapVars();
	}
	return farmingDetails;
}

function mapFarm(lineCheck) {

	var shouldMap = false;
	var mapAutoLevel = Infinity;
	const mapName = 'Map Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	const settingName = 'mapFarmSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	var settingIndex = null;
	var setting;
	if (defaultSettings === null) return farmingDetails;

	if (!defaultSettings.active) return farmingDetails;
	const dailyAddition = dailyOddOrEven();
	const zoneAddition = dailyAddition.active ? 1 : 0;

	for (var y = 0; y < baseSettings.length; y++) {
		if (y === 0) continue;
		var currSetting = baseSettings[y];
		var world = currSetting.world;
		if (currSetting.atlantrimp && !game.mapUnlocks.AncientTreasure.canRunOnce) continue;

		if (dailyAddition.active) {
			if (dailyAddition.skipZone) continue;
			if (!settingShouldRun(currSetting, world, 0, settingName) && !settingShouldRun(currSetting, world, zoneAddition, settingName)) continue;
		}
		else if (!settingShouldRun(currSetting, world, 0, settingName)) continue;
		if (currSetting.hdRatio > 0 && hdStats.hdRatio < currSetting.hdRatio) continue;

		for (var x = 0; x < zoneAddition + 1; x++) {
			if (game.global.world === world || ((game.global.world - world) % currSetting.repeatevery === 0)) {
				settingIndex = y;
				break;
			}
			world += zoneAddition;
		}
		if (settingIndex !== null) break;
	}

	if (settingIndex !== null) setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting !== undefined) {
		var mapLevel = setting.level;
		var mapSpecial = setting.special;
		var repeatCounter = setting.repeat;
		if (repeatCounter === -1) repeatCounter = Infinity;
		var jobRatio = setting.jobratio;
		var shouldAtlantrimp = !game.mapUnlocks.AncientTreasure.canRunOnce ? false : setting.atlantrimp;
		var gather = setting.gather;
		var mapType = setting.mapType;
		var repeatCheck =
			mapType === 'Daily Reset' ? updateDailyClock(true).split(':').reduce((acc, time) => (60 * acc) + +time) :
				mapType === 'Zone Time' ? (getGameTime() - game.global.zoneStarted) / 1000 :
					mapType === 'Portal Time' ? (getGameTime() - game.global.portalTime) / 1000 :
						mapType === 'Skele Spawn' ? (getGameTime() - game.global.lastSkeletimp) / 1000 :
							game.global.mapRunCounter;

		if (setting.autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && MODULES.maps.mapRepeats !== 0) {
				game.global.mapRunCounter = MODULES.maps.mapRepeats;
				MODULES.maps.mapRepeats = 0;
			}

			var autoLevel_Repeat = mapSettings.levelCheck;
			mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, null, null);
			if (mapAutoLevel !== Infinity) {
				if (autoLevel_Repeat !== Infinity && mapAutoLevel !== autoLevel_Repeat) MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
				mapLevel = mapAutoLevel;
			}
		}

		var repeatNumber = repeatCounter === Infinity ? '∞' : repeatCounter;
		if (mapType === 'Portal Time' || mapType === 'Daily Reset' || mapType === 'Zone Time' || mapType === 'Skele Spawn') {
			repeatCounter = repeatCounter.split(':').reduce((acc, time) => (60 * acc) + +time);
		}

		//When running Wither make sure map level is lower than 0 so that we don't accumulate extra stacks.
		if (challengeActive('Wither') && mapLevel >= 0)
			mapLevel = -1;
		//If you're running Transmute and the mapSpecial variable is either LMC or SMC it changes it to LSC/SSC.
		mapSpecial = (getAvailableSpecials(mapSpecial));

		if (mapType === 'Daily Reset' ? repeatCounter < repeatCheck : repeatCounter > repeatCheck)
			shouldMap = true;

		//Marking setting as complete if we've run enough maps.
		if (mapSettings.mapName === mapName && (mapType === 'Daily Reset' ? repeatCheck <= repeatCounter : repeatCheck >= repeatCounter)) {
			mappingDetails(mapName, mapLevel, mapSpecial);
			resetMapVars(setting, settingName);
			if (shouldAtlantrimp) runUniqueMap('Atlantrimp');
		}
		var repeat = repeatCheck + 1 === repeatCounter;
		var status = mapType + ': ' +
			(mapType === 'Daily Reset' ? (setting.repeat + ' / ' + updateDailyClock(true)) :
				mapType === 'Zone Time' ? (formatSecondsAsClock((getGameTime() - game.global.zoneStarted) / 1000, 4 - setting.repeat.split(':').length) + ' / ' + setting.repeat) :
					mapType === 'Skele Spawn' ? (formatSecondsAsClock((getGameTime() - game.global.lastSkeletimp) / 1000, 4 - setting.repeat.split(':').length) + ' / ' + setting.repeat) :
						mapType === 'Portal Time' ? (formatSecondsAsClock((getGameTime() - game.global.portalTime) / 1000, 4 - setting.repeat.split(':').length) + ' / ' + setting.repeat) :
							(repeatCheck + '/' + repeatNumber));

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = mapLevel;
		farmingDetails.autoLevel = setting.autoLevel;
		farmingDetails.jobRatio = jobRatio;
		farmingDetails.special = mapSpecial;
		farmingDetails.mapType = mapType;
		farmingDetails.mapRepeats = repeatCounter;
		farmingDetails.gather = gather;
		farmingDetails.runAtlantrimp = shouldAtlantrimp;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
		farmingDetails.settingIndex = settingIndex;
		if (setting.priority) farmingDetails.priority = setting.priority;
	}

	return farmingDetails;
}

function tributeFarm(lineCheck) {

	var shouldMap = false;
	var mapAutoLevel = Infinity;
	const mapName = 'Tribute Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	const settingName = 'tributeFarmSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	var settingIndex = null;
	var setting;
	if (defaultSettings === null) return farmingDetails;
	if (!defaultSettings.active || (game.buildings.Tribute.locked && game.jobs.Meteorologist.locked)) return farmingDetails;

	const dailyAddition = dailyOddOrEven();
	const zoneAddition = dailyAddition.active ? 1 : 0;

	for (var y = 0; y < baseSettings.length; y++) {
		if (y === 0) continue;
		var currSetting = baseSettings[y];
		var world = currSetting.world;
		if (dailyAddition.active) {
			if (dailyAddition.skipZone) continue;
			if (!settingShouldRun(currSetting, world, 0, settingName) && !settingShouldRun(currSetting, world, zoneAddition, settingName)) continue;
		}
		else if (!settingShouldRun(currSetting, world, 0, settingName)) continue;

		for (var x = 0; x < zoneAddition + 1; x++) {
			if (game.global.world === world || ((game.global.world - world) % currSetting.repeatevery === 0)) {
				settingIndex = y;
				break;
			}
			world += zoneAddition;
		}
		if (settingIndex !== null) break;
	}

	if (settingIndex !== null) setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting !== undefined) {
		//Initialing variables
		var mapLevel = setting.level;
		var tributeGoal = game.buildings.Tribute.locked === 1 ? 0 : setting.tributes;
		var meteorologistGoal = game.jobs.Meteorologist.locked === 1 ? 0 : setting.mets;
		var mapSpecial = getAvailableSpecials('lsc', true);
		var biome = getBiome(null, 'Sea');
		var jobRatio = setting.jobratio;
		var shouldAtlantrimp = !game.mapUnlocks.AncientTreasure.canRunOnce ? false : setting.atlantrimp;

		//AutoLevel code.
		if (setting.autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && MODULES.maps.mapRepeats !== 0) {
				game.global.mapRunCounter = MODULES.maps.mapRepeats;
				MODULES.maps.mapRepeats = 0;
			}
			var autoLevel_Repeat = mapSettings.levelCheck;
			mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, null, null);
			if (mapAutoLevel !== Infinity) {
				if (autoLevel_Repeat !== Infinity && mapAutoLevel !== autoLevel_Repeat) MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
				mapLevel = mapAutoLevel;
			}
		}

		if (challengeActive('Wither') && mapLevel >= 0)
			mapLevel = -1;

		//When mapType is set as Map Count work out how many Tributes/Mets we can farm in the amount of maps specified.
		if (setting.mapType === 'Map Count') {
			if (mapSettings.tribute || mapSettings.meteorologist) {
				tributeGoal = mapSettings.tribute;
				meteorologistGoal = mapSettings.meteorologist;
			} else {
				if (tributeGoal !== 0) {
					var tributeMaps = mapSettings.mapName === mapName ? tributeGoal - game.global.mapRunCounter : tributeGoal;
					var tributeTime = tributeMaps * 25;
					if (tributeMaps > 4) tributeTime += (Math.floor(tributeMaps / 5) * 45);
					var foodEarnedTributes = game.resources.food.owned + scaleToCurrentMap_AT(simpleSeconds_AT('food', tributeTime, jobRatio), false, true, mapLevel);
					tributeGoal = game.buildings.Tribute.purchased + calculateMaxAfford_AT(game.buildings.Tribute, true, false, false, false, 1, foodEarnedTributes);
				}
				if (meteorologistGoal !== 0) {
					var meteorologistTime = (mapSettings.mapName === mapName ? meteorologistGoal - game.global.mapRunCounter : meteorologistGoal) * 25;
					if (meteorologistGoal > 4) meteorologistTime += (Math.floor(meteorologistGoal / 5) * 45);
					var foodEarnedMets = game.resources.food.owned + scaleToCurrentMap_AT(simpleSeconds_AT('food', meteorologistTime, jobRatio), false, true, mapLevel);
					meteorologistGoal = game.jobs.Meteorologist.owned + calculateMaxAfford_AT(game.jobs.Meteorologist, false, false, true, false, 1, foodEarnedMets);
				}
			}
		}

		if (tributeGoal > game.buildings.Tribute.purchased || meteorologistGoal > game.jobs.Meteorologist.owned) {
			shouldMap = true;
		}

		if (shouldMap && tributeGoal > game.buildings.Tribute.purchased && !getPageSetting('buildingsType')) buyTributes();

		//Figuring out if we have enough resources to run Atlantrimp when setting is enabled.
		if (shouldAtlantrimp && (shouldMap) && (game.global.world > 33 || (game.global.world === 33 && game.global.lastClearedCell + 2 > 50))) {
			var tributeCost = 0;
			var metCost = 0;

			if (tributeGoal > game.buildings.Tribute.purchased) {
				for (var x = 0; x < tributeGoal - game.buildings.Tribute.purchased; x++) {
					tributeCost += Math.pow(1.05, game.buildings.Tribute.purchased) * 10000;
				}
			}
			if (meteorologistGoal > game.jobs.Meteorologist.owned) {
				for (var x = 0; x < meteorologistGoal - game.jobs.Meteorologist.owned; x++) {
					metCost += Math.pow(game.jobs.Meteorologist.cost.food[1], game.jobs.Meteorologist.owned + x) * game.jobs.Meteorologist.cost.food[0];
				}
			}
			var totalTrFCost = tributeCost + metCost;

			var barnCost = 0;
			if (totalTrFCost > (game.resources.food.max * (1 + (game.portal.Packrat.modifier * game.portal.Packrat.radLevel))))
				barnCost += game.buildings.Barn.cost.food();
			totalTrFCost += barnCost;

			//Figuring out how much Food we'd farm in the time it takes to run Atlantrimp. Seconds is 165 due to avg of 5x caches (20s per), 4x chronoimps (5s per), 1x jestimp (45s)
			var resourceFarmed = scaleToCurrentMap_AT(simpleSeconds_AT('food', 165, jobRatio), false, true, mapLevel);

			if ((totalTrFCost > game.resources.food.owned - barnCost + resourceFarmed) && game.resources.food.owned > totalTrFCost / 2) {
				runUniqueMap('Atlantrimp');
			}
		}
		//Recycles map if we don't need to finish it for meeting the tribute/meteorologist requirements
		if (mapSettings.mapName === mapName && !shouldMap) {
			mappingDetails(mapName, mapLevel, mapSpecial, tributeGoal, meteorologistGoal);
			resetMapVars(setting, settingName);
			if (game.global.mapsActive) recycleMap_AT();
		}

		var status = tributeGoal > game.buildings.Tribute.owned ?
			'Tribute Farm: ' + game.buildings.Tribute.owned + '/' + tributeGoal :
			'Meteorologist Farm: ' + game.jobs.Meteorologist.owned + '/' + meteorologistGoal;

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = mapLevel;
		farmingDetails.autoLevel = setting.autoLevel;
		farmingDetails.jobRatio = jobRatio;
		farmingDetails.special = mapSpecial;
		farmingDetails.biome = biome;
		farmingDetails.shouldTribute = tributeGoal > game.buildings.Tribute.purchased;
		farmingDetails.tribute = tributeGoal;
		farmingDetails.shouldMeteorologist = meteorologistGoal > game.jobs.Meteorologist.owned;
		farmingDetails.meteorologist = meteorologistGoal;
		farmingDetails.runAtlantrimp = shouldAtlantrimp;
		farmingDetails.buyBuildings = setting.buildings;
		farmingDetails.repeat = true;
		farmingDetails.status = status;
		farmingDetails.settingIndex = settingIndex;
		if (setting.priority) farmingDetails.priority = setting.priority;
	}
	return farmingDetails;
}

function smithyFarm(lineCheck) {

	var shouldMap = false;
	var mapAutoLevel = Infinity;
	const mapName = 'Smithy Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	const settingName = 'smithyFarmSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	var settingIndex = null;
	var setting;
	if (defaultSettings === null) return farmingDetails;

	if (game.buildings.Smithy.locked) return farmingDetails;
	if (challengeActive('Transmute') || challengeActive('Pandemonium')) return farmingDetails;
	if (!defaultSettings.active && !challengeActive('Quest')) return farmingDetails;
	if (challengeActive('Quest') && getPageSetting('quest') && (currQuest() !== 10 && !(game.global.world >= getPageSetting('questSmithyZone') && defaultSettings.active))) return farmingDetails;

	var shouldSmithyGemFarm = false;
	var shouldSmithyWoodFarm = false;
	var shouldSmithyMetalFarm = false;

	const dailyAddition = dailyOddOrEven();
	const zoneAddition = dailyAddition.active ? 1 : 0;

	for (var y = 0; y < baseSettings.length; y++) {
		if (y === 0) continue;
		var currSetting = baseSettings[y];
		var world = currSetting.world;
		if (dailyAddition.active) {
			if (dailyAddition.skipZone) continue;
			if (!settingShouldRun(currSetting, world, 0, settingName) && !settingShouldRun(currSetting, world, zoneAddition, settingName)) continue;
		}
		else if (!settingShouldRun(currSetting, world, 0, settingName)) continue;

		for (var x = 0; x < zoneAddition + 1; x++) {
			if (game.global.world === world || ((game.global.world - world) % currSetting.repeatevery === 0)) {
				settingIndex = y;
				break;
			}
			world += zoneAddition;
		}
		if (settingIndex !== null) break;
	}

	//If we are running a Smithy quest then we need to setup the correct settings for it.
	if (currQuest() === 10)
		setting = {
			jobratio: '0,0,0', autoLevel: true, level: 0, special: '0', priority: 0, mapType: 'Map Count', repeat: getPageSetting('questSmithyMaps'), runningQuest: true,
		}

	if (settingIndex !== null && setting === undefined) setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting !== undefined) {
		var mapBonus;
		if (game.global.mapsActive) mapBonus = getCurrentMapObject().bonus;

		var mapLevel = setting.level;
		var mapSpecial = getAvailableSpecials('lmc', true);
		var biome = getBiome();
		var jobRatio = '0,0,0';
		var smithyGoal = setting.repeat;

		if (setting.autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && typeof getCurrentMapObject().bonus !== 'undefined') {
				if (MODULES.maps.mapRepeatsSmithy[0] !== 0 && (mapBonus === 'lsc' || mapBonus === 'ssc')) game.global.mapRunCounter = MODULES.maps.mapRepeatsSmithy[0];
				else if (MODULES.maps.mapRepeatsSmithy[1] !== 0 && (mapBonus === 'lwc' || mapBonus === 'swc')) game.global.mapRunCounter = MODULES.maps.mapRepeatsSmithy[1];
				else if (MODULES.maps.mapRepeatsSmithy[2] !== 0 && (mapBonus === 'lmc' || mapBonus === 'smc')) game.global.mapRunCounter = MODULES.maps.mapRepeatsSmithy[2];
			}

			var autoLevel_Repeat = mapSettings.levelCheck;
			mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, null, null);
			if (mapAutoLevel !== Infinity) {
				if (autoLevel_Repeat !== Infinity && mapAutoLevel !== autoLevel_Repeat) {
					if (game.global.mapsActive && typeof mapBonus !== 'undefined') {
						if (mapBonus === 'lsc' || mapBonus === 'ssc') MODULES.maps.mapRepeatsSmithy[0] = (game.global.mapRunCounter + 1);
						else if (mapBonus === 'lwc' || mapBonus === 'swc') MODULES.maps.mapRepeatsSmithy[1] = (game.global.mapRunCounter + 1);
						else if (mapBonus === 'lmc' || mapBonus === 'smc') MODULES.maps.mapRepeatsSmithy[2] = (game.global.mapRunCounter + 1);
					}
				}
				mapLevel = mapAutoLevel;
			}
		}
		if (challengeActive('Wither') && mapLevel >= 0)
			mapLevel = -1;

		//Initialising base food & metal vars for calcs later on
		var woodBase = scaleToCurrentMap_AT(simpleSeconds_AT('wood', 1, '0,1,0'), false, true, mapLevel);
		var metalBase = scaleToCurrentMap_AT(simpleSeconds_AT('metal', 1, '0,0,1'), false, true, mapLevel);

		//When mapType is set as Map Count work out how many Smithies we can farm in the amount of maps specified.
		//If we already have a goal set then use that otherwise calculate what we should be getting.
		if (setting.mapType === 'Map Count' && smithyGoal !== 0) {
			if (mapSettings.smithies)
				smithyGoal = mapSettings.smithies;
			else {
				var smithyCount = 0;
				//Checking total map count user wants to run
				var totalMaps = mapSettings.mapName === mapName ? smithyGoal - game.global.mapRunCounter : smithyGoal;
				//Calculating cache + jestimp + chronoimp
				var mapTime = totalMaps * 25;
				if (totalMaps > 4) mapTime += (Math.floor(totalMaps / 5) * 45);
				var costMult = game.buildings.Smithy.cost.gems[1];

				//Calculating wood & metal earned then using that info to identify how many Smithies you can afford from those values.
				const woodEarned = woodBase * mapTime;
				const metalEarned = metalBase * mapTime;
				const woodSmithies = game.buildings.Smithy.purchased + getMaxAffordable(Math.pow(costMult, game.buildings.Smithy.owned) * game.buildings.Smithy.cost.wood[0], (game.resources.wood.owned + woodEarned), costMult, true);
				const metalSmithies = game.buildings.Smithy.purchased + getMaxAffordable(Math.pow(costMult, game.buildings.Smithy.owned) * game.buildings.Smithy.cost.metal[0], (game.resources.metal.owned + metalEarned), costMult, true);

				if (woodSmithies > 0 && metalSmithies > 0) {
					//Taking the minimum value of the 2 to see which is more reasonable to aim for
					smithyCount = Math.min(woodSmithies, metalSmithies)

					//Figuring out Smithy cost of the 2 different resources
					const woodCost = getBuildingItemPrice(game.buildings.Smithy, 'wood', false, smithyCount - game.buildings.Smithy.purchased);
					const metalCost = getBuildingItemPrice(game.buildings.Smithy, 'metal', false, smithyCount - game.buildings.Smithy.purchased);

					//Looking to see how many maps it would take to reach this smithy target
					const woodMapCount = Math.floor((woodCost - game.resources.wood.owned) / (woodBase * 34));
					const metalMapCount = Math.floor((metalCost - game.resources.metal.owned) / (metalBase * 34));
					//If combined maps for both resources is higher than desired maps to be run then will farm 1 less smithy
					if ((woodMapCount + metalMapCount) > smithyGoal) smithyGoal = smithyCount - 1
					else smithyGoal = smithyCount;
					//If running Quest we only want to target 1 Smithy! There's also a chance this is wrong as on some zones you want multiple but I'll need to test and fix it when I have more time
					if (setting.runningQuest && smithyGoal > game.buildings.Smithy.purchased) smithyGoal = game.buildings.Smithy.purchased + 1;
				}
				else smithyGoal = 1;
			}
		}

		resourceGoal = 0;
		const smithyGemCost = getBuildingItemPrice(game.buildings.Smithy, 'gems', false, smithyGoal - game.buildings.Smithy.purchased);
		const smithyWoodCost = getBuildingItemPrice(game.buildings.Smithy, 'wood', false, smithyGoal - game.buildings.Smithy.purchased);
		const smithyMetalCost = getBuildingItemPrice(game.buildings.Smithy, 'metal', false, smithyGoal - game.buildings.Smithy.purchased);

		if (smithyGoal > game.buildings.Smithy.purchased) {
			shouldMap = true;
			if (smithyMetalCost > game.resources.metal.owned) {
				shouldSmithyMetalFarm = true;
				mapSpecial = getAvailableSpecials('lmc', true);
				biome = getBiome(null, 'Mountain');
				jobRatio = '0,0,1,0';
				resourceGoal = prettify(smithyMetalCost) + ' metal.';
			} else if (smithyWoodCost > game.resources.wood.owned) {
				shouldSmithyWoodFarm = true;
				mapSpecial = getAvailableSpecials('lwc', true);
				biome = getBiome(null, 'Forest');
				jobRatio = '0,1,0';
				resourceGoal = prettify(smithyWoodCost) + ' wood.';
			}
			else if (smithyGemCost > game.resources.gems.owned) {
				shouldSmithyGemFarm = true;
				mapSpecial = getAvailableSpecials('lsc', true);
				biome = getBiome(null, 'Sea');
				jobRatio = '1,0,0';
				resourceGoal = prettify(smithyGemCost) + ' gems.';
			}
		}

		//Overrides to purchase smithies under the following circumstances
		//1. If the user has either the AT AutoStructure setting OR the AT AutoStructure Smithy setting disabled.
		//2. If the user is running Hypothermia and is specifically Smithy Farming.
		if ((!getPageSetting('buildingsType') || !getPageSetting('buildingSettingsArray').Smithy.enabled || challengeActive('Hypothermia')) && shouldMap && smithyGoal > game.buildings.Smithy.purchased && canAffordBuilding('Smithy', false, false, false, false, 1)) {
			buyBuilding('Smithy', true, true, 1);
		}

		//Recycles map if we don't need to finish it for meeting the farm requirements
		if (mapSettings.mapName === mapName) {
			if (getPageSetting('autoMaps') && game.global.mapsActive && typeof mapBonus !== 'undefined' && ((!shouldSmithyGemFarm && mapBonus.includes('sc')) || (!shouldSmithyWoodFarm && mapBonus.includes('wc')) || (!shouldSmithyMetalFarm && mapBonus.includes('mc')))) {
				var mapProg = game.global.mapsActive ? ((getCurrentMapCell().level - 1) / getCurrentMapObject().size) : 0;
				var mappingLength = (mapProg > 0 ? Number(((game.global.mapRunCounter + mapProg)).toFixed(2)) : game.global.mapRunCounter);
				if (mapBonus === 'lsc' || mapBonus === 'ssc') MODULES.maps.mapRepeatsSmithy[0] = mappingLength;
				else if (mapBonus === 'lwc' || mapBonus === 'swc') MODULES.maps.mapRepeatsSmithy[1] = mappingLength;
				else if (mapBonus === 'lmc' || mapBonus === 'smc') MODULES.maps.mapRepeatsSmithy[2] = mappingLength;
				recycleMap_AT();
			}
			if (!shouldMap) {
				mappingDetails(mapName, mapLevel, mapSpecial, smithyGoal);
				resetMapVars(setting, settingName);
				if (!challengeActive('Quest') && setting.meltingPoint) runUniqueMap('Melting Point');
			}
		}

		var status = 'Smithy Farming for ' + resourceGoal;

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = mapLevel;
		farmingDetails.autoLevel = setting.autoLevel;
		farmingDetails.jobRatio = jobRatio;
		farmingDetails.special = mapSpecial;
		farmingDetails.biome = biome;
		farmingDetails.smithies = smithyGoal;
		farmingDetails.gemFarm = shouldSmithyGemFarm;
		farmingDetails.repeat = true;
		farmingDetails.status = status;
		farmingDetails.settingIndex = settingIndex;
		if (setting && setting.priority) farmingDetails.priority = setting.priority;
	}
	return farmingDetails;
}

function worshipperFarm(lineCheck) {

	var shouldMap = false;
	var mapAutoLevel = Infinity;
	const mapName = 'Worshipper Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	const settingName = 'worshipperFarmSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	var settingIndex = null;
	var setting;
	if (defaultSettings === null) return farmingDetails;

	if (game.jobs.Worshipper.locked || !defaultSettings.active) return farmingDetails;
	const dailyAddition = dailyOddOrEven();
	const zoneAddition = dailyAddition.active ? 1 : 0;

	for (var y = 0; y < baseSettings.length; y++) {
		if (y === 0) continue;
		var currSetting = baseSettings[y];
		var world = currSetting.world;
		if (dailyAddition.active) {
			if (dailyAddition.skipZone) continue;
			if (!settingShouldRun(currSetting, world, 0, settingName) && !settingShouldRun(currSetting, world, zoneAddition, settingName)) continue;
		}
		else if (!settingShouldRun(currSetting, world, 0, settingName)) continue;

		for (var x = 0; x < zoneAddition + 1; x++) {
			if (game.global.world === world || ((game.global.world - world) % currSetting.repeatevery === 0)) {
				settingIndex = y;
				break;
			}
			world += zoneAddition;
		}
		if (settingIndex !== null) break;
	}

	if (settingIndex !== null) setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting !== undefined) {
		var worshipperGoal = setting.worshipper;
		var mapLevel = setting.level;
		var jobRatio = setting.jobratio;
		var mapSpecial = getAvailableSpecials('lsc', true);
		var cacheTime = mapSpecial === 'lsc' ? 20 : 10;
		var biome = getBiome(null, 'Sea');

		if (setting.autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && MODULES.maps.mapRepeats !== 0) {
				game.global.mapRunCounter = MODULES.maps.mapRepeats;
				MODULES.maps.mapRepeats = 0;
			}
			var autoLevel_Repeat = mapSettings.levelCheck;
			mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, null, null);
			if (mapAutoLevel !== Infinity) {
				if (autoLevel_Repeat !== Infinity && mapAutoLevel !== autoLevel_Repeat) MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
				mapLevel = mapAutoLevel;
			}
		}

		if (challengeActive('Wither') && mapLevel >= 0) mapLevel = -1;
		var shouldSkip = false;
		if (defaultSettings.shipSkipEnabled && game.jobs.Worshipper.owned !== 50 && (scaleToCurrentMap_AT(simpleSeconds_AT('food', cacheTime, jobRatio), false, true, mapLevel) < (game.jobs.Worshipper.getCost() * defaultSettings.shipskip)))
			shouldSkip = true;

		if (game.jobs.Worshipper.owned !== 50 && worshipperGoal > game.jobs.Worshipper.owned)
			shouldMap = true;

		if ((mapSettings.mapName === mapName && !shouldMap) || shouldSkip) {
			if (shouldSkip && getPageSetting('spamMessages').map_Skip)
				debug('Skipping Worshipper farming on zone ' + game.global.world + ' as 1 ' + mapSpecial + ' map doesn\'t provide ' + defaultSettings.shipskip + ' or more Worshippers. Evaluate your map settings to correct this', 'map_Skip');
			else if (!shouldSkip)
				mappingDetails(mapName, mapLevel, mapSpecial);
			resetMapVars(setting, settingName);
		}

		var status = 'Worshipper Farm: ' + game.jobs.Worshipper.owned + '/' + worshipperGoal;

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = mapLevel;
		farmingDetails.autoLevel = setting.autoLevel;
		farmingDetails.jobRatio = jobRatio;
		farmingDetails.special = mapSpecial;
		farmingDetails.biome = biome;
		farmingDetails.worshipper = worshipperGoal;
		farmingDetails.repeat = true;
		farmingDetails.status = status;
		farmingDetails.settingIndex = settingIndex;
		if (setting.priority) farmingDetails.priority = setting.priority;
		farmingDetails.gather = 'food';

	}
	return farmingDetails;
}

//Daily (bloodthirst), Balance, Unbalance & Storm Destacking
function mapDestacking(lineCheck) {

	const mapName = 'Destacking';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	if (
		!(getPageSetting('balance') && challengeActive('Balance')) &&
		!(getPageSetting('unbalance') && challengeActive('Unbalance')) &&
		!(getPageSetting('storm') && challengeActive('Storm')) &&
		!(challengeActive('Daily') && getPageSetting('bloodthirstDestack') && typeof game.global.dailyChallenge.bloodthirst !== 'undefined')
	)
		return farmingDetails;

	var shouldMap = false;
	var mapLevel = -(game.global.world - 6);
	var mapSpecial = getAvailableSpecials('fa');
	var destackValue = 0;

	//Balance Destacking
	if (challengeActive('Balance')) {
		var balanceZone = getPageSetting('balanceZone') > 0 ? getPageSetting('balanceZone') : Infinity;
		var balanceStacks = getPageSetting('balanceStacks') > 0 ? getPageSetting('balanceStacks') : Infinity;
		shouldMap = ((gammaMaxStacks(true) - game.heirlooms.Shield.gammaBurst.stacks !== 0) && game.global.world >= balanceZone && (game.challenges.Balance.balanceStacks >= balanceStacks || (getPageSetting('balanceImprobDestack') && game.global.lastClearedCell + 2 === 100 && game.challenges.Balance.balanceStacks !== 0)));
		destackValue = game.challenges.Balance.balanceStacks;
	}

	//Unbalance Destacking
	if (challengeActive('Unbalance')) {
		var unbalanceZone = getPageSetting('unbalanceZone') > 0 ? getPageSetting('unbalanceZone') : Infinity;
		var unbalanceStacks = getPageSetting('unbalanceStacks') > 0 ? getPageSetting('unbalanceStacks') : Infinity;
		shouldMap = ((gammaMaxStacks(true) - game.heirlooms.Shield.gammaBurst.stacks !== 0) && game.global.world >= unbalanceZone && (game.challenges.Unbalance.balanceStacks >= unbalanceStacks || (getPageSetting('unbalanceImprobDestack') && game.global.lastClearedCell + 2 === 100 && game.challenges.Unbalance.balanceStacks !== 0)));
		destackValue = game.challenges.Unbalance.balanceStacks;
	}

	//Bloodthirst Destacking
	if (challengeActive('Daily') && game.global.dailyChallenge.bloodthirst.stacks >= dailyModifiers.bloodthirst.getFreq(game.global.dailyChallenge.bloodthirst.strength) - 1) {
		shouldMap = true;
		destackValue = game.global.dailyChallenge.bloodthirst.stacks;
	}

	//Storm Destacking
	if (challengeActive('Storm')) {
		var stormZone = getPageSetting('stormZone') > 0 ? getPageSetting('stormZone') : Infinity;
		var stormStacks = getPageSetting('stormStacks') > 0 ? getPageSetting('stormStacks') : Infinity;
		shouldMap = (game.global.world >= stormZone && (game.challenges.Storm.beta >= stormStacks && game.challenges.Storm.beta !== 0));
		destackValue = game.challenges.Storm.beta;
	}

	//Recycling maps if we have 0 stacks
	if (game.global.mapsActive && getCurrentMapObject().level === 6 &&
		(
			(challengeActive('Balance') && !shouldMap && game.challenges.Balance.balanceStacks === 0) ||
			(challengeActive('Daily') && !shouldMap && game.global.dailyChallenge.bloodthirst.stacks === 0) ||
			(challengeActive('Unbalance') && !shouldMap && game.challenges.Unbalance.balanceStacks === 0) ||
			(challengeActive('Storm') && !shouldMap && game.challenges.Storm.beta === 0)
		)
	) {
		recycleMap_AT();
	}

	//Force mapping if we are in a map and haven't yet reached 0 stacks.
	if (mapSettings.mapName === mapName && destackValue > 0) shouldMap = true;

	//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
	if (lineCheck && shouldMap)
		return setting = { priority: 1, };

	var repeat = game.global.mapsActive && (getCurrentMapObject().size - getCurrentMapCell().level) > destackValue;

	var status = 'Destacking: ' + destackValue + ' stacks remaining';

	farmingDetails.shouldRun = shouldMap;
	farmingDetails.mapName = mapName;
	farmingDetails.mapLevel = mapLevel;
	farmingDetails.autoLevel = false;
	farmingDetails.special = mapSpecial;
	farmingDetails.destack = destackValue;
	farmingDetails.repeat = !repeat;
	farmingDetails.status = status;

	return farmingDetails;
}

function prestigesToGet(targetZone, targetPrestige) {

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

function prestigeRaiding(lineCheck) {

	var shouldMap = false;
	const mapName = 'Prestige Raiding';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	const settingName = 'raidingSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	var settingIndex = null;
	var setting;
	if (defaultSettings === null) return farmingDetails;
	if (!defaultSettings.active) return farmingDetails;

	for (var y = 0; y < baseSettings.length; y++) {
		if (y === 0) continue;
		const currSetting = baseSettings[y];
		var targetPrestige = challengeActive('Mapology') && getPageSetting('mapology') ? autoTrimpSettings['mapologyPrestige'].selected : currSetting.prestigeGoal !== 'All' ? MODULES.equipment[currSetting.prestigeGoal].upgrade : 'GamesOP';
		var raidZones = currSetting.world + Number(currSetting.raidingzone);

		var world = currSetting.world;
		if (!settingShouldRun(currSetting, world, 0, settingName)) continue;
		//Checks to see what our raid zone should be
		if (currSetting.repeatevery !== 0 && game.global.world > currSetting.world) {
			var times = currSetting.repeatevery;
			var repeats = Math.round((game.global.world - currSetting.world) / times);
			if (repeats > 0) raidZones += (times * repeats);
		}
		//Skips if we don't have the required prestige available.
		var equipsToFarm = prestigesToGet(raidZones, targetPrestige)[0];
		if (equipsToFarm === 0) continue;
		if (game.global.world === currSetting.world || ((game.global.world - currSetting.world) % currSetting.repeatevery === 0)) {
			settingIndex = y;
			break;
		}
	}

	if (settingIndex !== null) setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	function resetSetting() {
		mappingDetails(mapName, mapSettings.mapLevel, mapSettings.special);
		if (defaultSettings.recycle && game.global.preMapsActive && mapSettings.prestigeMapArray) {
			if (!game.global.preMapsActive) mapsClicked(true);
			for (var x = 0; x < mapSettings.prestigeMapArray.length; x++) {
				recycleMap(getMapIndex(mapSettings.prestigeMapArray[x]));
			}
		}
		resetMapVars();
	}

	if (setting !== undefined) {

		//Reduce raid zone to the value of the last prestige item we need to farm
		while (equipsToFarm === prestigesToGet(raidZones - 1, targetPrestige)[0])
			raidZones--;

		if (mapSettings.raidzones && mapSettings.raidzones !== raidZones) {
			debug(raidZones);
			resetSetting();
		}

		if (prestigesToGet(raidZones, targetPrestige)[0] > 0)
			shouldMap = true;

		var mapSpecial = getAvailableSpecials('p');
		var status = 'Prestige Raiding: ' + prestigesToGet(raidZones, targetPrestige)[0] + ' items remaining';

		if (mapSettings.prestigeFragMapBought) status = 'Prestige frag farm to: ' + (mapSettings.totalMapCost ? prettify(mapSettings.totalMapCost) : '∞');

		mapsToRun = game.global.mapsActive ? prestigesToGet(getCurrentMapObject().level, targetPrestige)[1] : Infinity;
		specialInMap = game.global.mapsActive && game.global.mapGridArray[getCurrentMapObject().size - 2].special === targetPrestige;

		var repeat = mapsToRun === 1 || (specialInMap && mapsToRun === 2);

		if (mapSettings.prestigeMapArray && mapSettings.prestigeMapArray[0] !== undefined && shouldMap) {
			if (game.global.mapsOwnedArray[getMapIndex(mapSettings.prestigeMapArray[0])] === undefined || (game.global.mapsActive && prestigesToGet(getCurrentMapObject().level)[0] === 0)) {
				debug('There was an error with your purchased map(s). Restarting the raiding procedure.');
				resetMapVars();
			}
		}

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.autoLevel = false;
		farmingDetails.mapLevel = raidZones - game.global.world;
		farmingDetails.recycle = defaultSettings.recycle;
		farmingDetails.prestigeGoal = targetPrestige;
		farmingDetails.fragSetting = Number(setting.raidingDropdown);
		farmingDetails.raidzones = raidZones;
		farmingDetails.special = mapSpecial;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
		farmingDetails.settingIndex = settingIndex;
		farmingDetails.incrementMaps = setting.incrementMaps;
		if (setting.priority) farmingDetails.priority = setting.priority;
		if (mapSettings.totalMapCost) farmingDetails.totalMapCost = mapSettings.totalMapCost;
		if (mapSettings.mapSliders) farmingDetails.mapSliders = mapSettings.mapSliders;
		if (mapSettings.prestigeMapArray) farmingDetails.prestigeMapArray = mapSettings.prestigeMapArray;
		if (mapSettings.prestigeFragMapBought) farmingDetails.prestigeFragMapBought = mapSettings.prestigeFragMapBought;
	}

	//Resetting variables and recycling the maps used
	if (mapSettings.mapName === mapName && !shouldMap) {
		resetSetting();
	}

	return farmingDetails;
}

function runPrestigeRaiding() {
	if (mapSettings.mapName !== 'Prestige Raiding') return;
	if (!getPageSetting('autoMaps')) return;

	//Initialising prestigeMapArray if it doesn't exist. This is used to store the maps we buy so we can run them later.
	if (!mapSettings.totalMapCost || !mapSettings.mapSliders) {
		var costAndSliders = prestigeTotalFragCost();
		if (!mapSettings.totalMapCost) mapSettings.totalMapCost = costAndSliders.cost;
		if (!mapSettings.mapSliders) mapSettings.mapSliders = costAndSliders.sliders;
	}
	if (!mapSettings.prestigeMapArray) mapSettings.prestigeMapArray = new Array(5);
	if (!mapSettings.prestigeFragMapBought) mapSettings.prestigeFragMapBought = false;

	if (mapSettings.mapSliders && mapSettings.mapSliders && mapSettings.prestigeMapArray[0] === undefined)
		if (mapSettings.totalMapCost < game.resources.fragments.owned) {
			if (mapSettings.prestigeFragMapBought) {
				if (game.global.repeatMap)
					repeatClicked();
				if (game.global.preMapsActive) {
					mapSettings.prestigeFragMapBought = false;
					MODULES.maps.fragmentFarming = false;
				}
			}
		}
		//If we can't afford the maps we need to farm fragments
		//Check if we can afford the fragment farming map and if so buy it and run it
		//Otherwise this will be stuck here ....forever?????
		else if (game.global.preMapsActive) {
			fragmentFarm()
			mapSettings.prestigeFragMapBought = true;
		}

	if (!mapSettings.prestigeFragMapBought && game.global.preMapsActive) {
		//Recycle maps if 5 below the map limit to ensure we can purchase maximum amount of maps we could need
		if (game.global.mapsOwnedArray.length >= 95) recycleBelow(true);
		//Buy the maps we need IF we haven't already purchased them and prints out a message stating they've been bought
		//Should really say map level for this, right???
		if (mapSettings.prestigeMapArray[0] === undefined) {
			for (var x = 0; x < 5; x++) {
				if (!mapSettings.incrementMaps && x > 0 || mapSettings.mapSliders[x] === undefined) break;
				if (prestigeMapHasEquips(x, mapSettings.raidzones, mapSettings.prestigeGoal)) {
					setMapSliders(mapSettings.mapSliders[x][0], mapSettings.mapSliders[x][1], mapSettings.mapSliders[x][2], mapSettings.mapSliders[x][3], mapSettings.mapSliders[x][4])
					if ((updateMapCost(true) <= game.resources.fragments.owned)) {
						buyMap();
						var purchasedMap = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1];
						mapSettings.prestigeMapArray[x] = purchasedMap.id;
						debug('Prestige Raiding' + ' (z' + game.global.world + ') bought a level ' + purchasedMap.level + ' map. Purchase #' + [(x + 1)], 'map_Details');
					}
				}
			}
			mapSettings.prestigeMapArray = mapSettings.prestigeMapArray.filter(function (e) { return e.replace(/(\r\n|\n|\r)/gm, '') });
		}

		for (var x = mapSettings.prestigeMapArray.length - 1; x > -1; x--) {
			if (game.global.preMapsActive && prestigeMapHasEquips(x, mapSettings.raidzones, mapSettings.prestigeGoal)) {
				if (mapSettings.prestigeMapArray[x] !== undefined) {
					var purchasedMap = game.global.mapsOwnedArray[getMapIndex(mapSettings.prestigeMapArray[x])];
					if (purchasedMap === undefined) {
						debug('Prestige Raiding - Error with finding the purchased map. Skipping this map and moving on to the next one.');
						mapSettings.prestigeMapArray[x] = undefined;
						continue;
					}
					debug('Prestige Raiding' + ' (z' + game.global.world + ") running a level " + (purchasedMap.level) + " map. Map #" + [(mapSettings.prestigeMapArray.length - x)], "map_Details");
					selectMap(mapSettings.prestigeMapArray[x]);
					runMap_AT();
				}
				//If errors occur then delete prestigeMapArray and attempt to start the raiding process again.
				//HOPEFULLY this fixes any potential issues that transpire due to my terrible coding.
				else {
					delete mapSettings.prestigeMapArray;
					delete mapSettings.totalMapCost;
					delete mapSettings.mapSliders;
					delete mapSettings.prestigeFragMapBought;
					debug("Prestige Raiding - Error with finding the purchased map. Restarting the raiding procedure.");
					return;
				}
			}
		}
	}

	if (game.global.preMapsActive)
		runMap_AT();
}

function prestigeClimb(lineCheck) {

	var shouldMap = false;
	const mapName = 'Prestige Climb';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	if (challengeActive('Frugal')) return farmingDetails;

	var targetPrestige = getPageSetting('Prestige');
	if (targetPrestige === "Off") return farmingDetails;
	const runningMapology = challengeActive('Mapology') && getPageSetting('mapology');
	if (runningMapology) targetPrestige = getPageSetting('mapologyPrestige');
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
	const prestigeInfo = prestigesToGet(game.global.world, targetPrestige);
	const prestigeToFarmFor = prestigeInfo[0];
	const mapsToRun = prestigeInfo[1];

	//Allow lower mapLevel if we are missing many prestiges. Count how many times prestigeToFarmFor can be divided by two.
	//var mapLevel = -(Math.floor(prestigeToFarmFor / 2) - 1);
	var mapLevel = 0;

	//Reduce map level to the value of the last prestige item we need to farm
	//Shouldn't be necessary but could be useful if a user enables this setting later in their run
	while (prestigeToFarmFor > 0 && prestigeToFarmFor === prestigesToGet(mapLevel - 1, targetPrestige)[0]) {
		mapLevel--;
	}

	shouldMap = prestigeToFarmFor > 0;

	//Prestige Skip
	//2 or more unbought prestiges
	if (shouldMap && getPageSetting('PrestigeSkip')) {
		const prestigeList = ['Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'];
		var numUnbought = 0;
		//Loop through prestiges in upgrade window to check how many equips we have unbought prestiges for
		for (const p of prestigeList) {
			if (game.upgrades[p].allowed - game.upgrades[p].done > 0)
				numUnbought++;
		}
		//If there are 2 or more unbought prestiges in our upgrades window then disable prestige farming
		if (numUnbought >= 2)
			shouldMap = false;
	}

	//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
	if (lineCheck && shouldMap)
		return setting = { priority: 1, };

	const mapSpecial = getAvailableSpecials('p');

	//Disable prestige farming if we can't afford the map we are trying to run and we aren't running mapping OR in a map and its a lower level than the map we want to run
	if (mapCost(mapLevel, mapSpecial, null, [0, 0, 0], false) > game.resources.fragments.owned) {
		var mapObject = getCurrentMapObject();
		if (!game.global.mapsActive || (mapObject && mapObject.level < game.global.world + mapLevel))
			shouldMap = false;
	}
	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, 0, mapSpecial);
		resetMapVars();
	}

	if (game.options.menu.mapLoot.enabled !== 1) toggleSetting('mapLoot');
	const status = 'Prestige Climb: ' + prestigeToFarmFor + ' items remaining';

	const repeat = !(
		game.global.mapsActive && (
			mapsToRun > (getCurrentMapObject().bonus === 'p' && (game.global.lastClearedMapCell !== getCurrentMapObject().size - 2) ? 2 : 1))
	);

	farmingDetails.shouldRun = shouldMap;
	farmingDetails.mapName = mapName;
	farmingDetails.status = status;
	farmingDetails.repeat = !repeat;
	farmingDetails.mapLevel = mapLevel;
	farmingDetails.autoLevel = true;
	farmingDetails.special = mapSpecial;
	farmingDetails.mapsToRun = mapsToRun;

	return farmingDetails;
}

function findLastBionicWithItems(bionicPool) {
	if (game.global.world < 115 || !bionicPool)
		return;
	if (challengeActive('Mapology') && !getPageSetting('mapology')) return;
	const targetPrestige = challengeActive('Mapology') && getPageSetting('mapology') ? autoTrimpSettings['mapologyPrestige'].selected : 'GambesOP';

	if (bionicPool.length > 1) {
		bionicPool.sort(function (bionicA, bionicB) { return bionicA.level - bionicB.level });
		while (bionicPool.length > 1 && prestigesToGet(bionicPool[0].level, targetPrestige)[0] === 0) {
			if (challengeActive('Experience') && getPageSetting('experience') && game.global.world > 600 && bionicPool[0].level >= getPageSetting('experienceEndBW')) break;
			bionicPool.shift();
			if (prestigesToGet(bionicPool[0].level, targetPrestige)[0] !== 0) break;
		}
	}

	return bionicPool[0];
}

function obtainUniqueMap(uniqueMap) {
	var shouldMap = false;
	const mapName = 'Unique Map Farm'
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	if (!uniqueMap || typeof uniqueMap !== 'string') return farmingDetails;

	var unlockLevel = MODULES.mapFunctions.uniqueMaps[uniqueMap].zone;

	//Only go for this map if we are able to obtain it
	if (!trimpStats.perfectMaps && unlockLevel > game.global.world)
		return farmingDetails;
	else if (trimpStats.perfectMaps && unlockLevel > (game.global.world + 10))
		return farmingDetails;

	const map = game.global.mapsOwnedArray.find(map => map.name.includes(uniqueMap));
	if (map === undefined) shouldMap = true;

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, mapLevel);
		resetMapVars();
	}
	var status = 'Obtaining Unique Map: ' + uniqueMap + ' (z' + unlockLevel + ')';

	if (shouldMap) farmingDetails.shouldRun = shouldMap;
	farmingDetails.mapName = mapName;
	farmingDetails.mapLevel = unlockLevel - game.global.world;
	farmingDetails.special = '0';
	farmingDetails.repeat = false;
	farmingDetails.status = status;
	return farmingDetails;
}

function bionicRaiding(lineCheck) {

	var shouldMap = false;
	const mapName = 'Bionic Raiding'
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	const settingName = 'bionicRaidingSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	var settingIndex = null;
	var setting;
	if (defaultSettings === null) return farmingDetails;

	if (!defaultSettings.active) return farmingDetails;
	if (challengeActive('Experience') && game.global.world > 600) return farmingDetails;

	for (var y = 0; y < baseSettings.length; y++) {
		if (y === 0) continue;
		const currSetting = baseSettings[y];
		var targetPrestige = challengeActive('Mapology') && getPageSetting('mapology') ? autoTrimpSettings['mapologyPrestige'].selected : currSetting.prestigeGoal !== 'All' ? MODULES.equipment[currSetting.prestigeGoal].upgrade : 'GamesOP';
		var raidZones = currSetting.raidingzone

		var world = currSetting.world;
		if (!settingShouldRun(currSetting, world, 0, settingName)) continue;

		if (currSetting.repeatevery !== 0 && game.global.world > currSetting.world) {
			var times = currSetting.repeatevery;
			var repeats = Math.round((game.global.world - currSetting.world) / times);
			if (repeats > 0) raidZones += (times * repeats);
		}
		if (prestigesToGet(raidZones, targetPrestige)[0] === 0) continue;
		if (game.global.world === currSetting.world || ((game.global.world - currSetting.world) % currSetting.repeatevery === 0)) {
			settingIndex = y;
			break;
		}
	}

	if (settingIndex !== null) setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting !== undefined) {
		//If we can't get the map then don't run this setting
		//If we can then go grab it if it's available
		const unlockLevel = MODULES.mapFunctions.uniqueMaps['Bionic Wonderland'].zone;
		if (!trimpStats.plusLevels && unlockLevel > game.global.world)
			return farmingDetails;
		else if (trimpStats.plusLevels && unlockLevel > (game.global.world + 10))
			return farmingDetails;
		const map = game.global.mapsOwnedArray.find(map => map.name.includes('Bionic Wonderland'));
		if (map === undefined) return obtainUniqueMap('Bionic Wonderland');
		var raidzonesBW = raidZones;

		if (prestigesToGet(raidzonesBW, targetPrestige)[0] > 0) {
			shouldMap = true;
		}
		var status = 'Raiding to BW' + raidzonesBW + ': ' + prestigesToGet(raidzonesBW, targetPrestige)[0] + ' items remaining';

		var mapsToRun = game.global.mapsActive ? prestigesToGet(getCurrentMapObject().level, targetPrestige)[1] : Infinity;
		var specialInMap = game.global.mapsActive && game.global.mapGridArray[getCurrentMapObject().size - 2].special === targetPrestige;
		var repeat = (game.global.mapsActive &&
			(mapsToRun === 1 || (specialInMap && mapsToRun === 2) ||
				getCurrentMapObject().location !== 'Bionic')
		);

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.repeat = !repeat
		farmingDetails.raidingZone = raidzonesBW;
		farmingDetails.status = status;
		farmingDetails.settingIndex = settingIndex;
		if (setting.priority) farmingDetails.priority = setting.priority;
	}

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, 0);
		resetMapVars();
	}

	return farmingDetails;
}

function runBionicRaiding(bionicPool) {
	if (!bionicPool) return false;
	if (!getPageSetting('autoMaps')) return false;

	if (!game.global.preMapsActive && !game.global.mapsActive) {
		mapsClicked(true);
		if (!game.global.preMapsActive) {
			mapsClicked(true);
		}
	}

	const raidingZone = challengeActive('Experience') && game.global.world > 600 ? getPageSetting('experienceEndBW') : mapSettings.raidingZone
	if (game.global.preMapsActive) {
		selectMap(findLastBionicWithItems(bionicPool).id);
	}
	if ((findLastBionicWithItems(bionicPool).level >= raidingZone
		|| findLastBionicWithItems(bionicPool).level < raidingZone)
		&& game.global.preMapsActive) {
		runMap();
	}
}

function toxicity(lineCheck) {

	var shouldMap = false;
	const mapName = 'Toxicity';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	const settingName = 'toxicitySettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	var settingIndex = null;
	var setting;
	if (defaultSettings === null) return farmingDetails;

	if (!defaultSettings.active) return farmingDetails;
	if (!challengeActive('Toxicity')) return farmingDetails;

	for (var y = 0; y < baseSettings.length; y++) {
		if (y === 0) continue;
		var currSetting = baseSettings[y];
		var world = currSetting.world;

		if (!settingShouldRun(currSetting, world, 0, settingName)) continue;

		if (game.global.world === world || ((game.global.world - world) % currSetting.repeatevery === 0)) {
			settingIndex = y;
			break;
		}
	}

	if (settingIndex !== null) setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting !== undefined) {
		const currentStacks = game.challenges.Toxicity.stacks;
		const stackGoal = setting.repeat > 1500 ? 1500 : setting.repeat;
		const mapSpecial = getAvailableSpecials(setting.special);
		var mapLevel = setting.level;

		//AutoLevel code.
		if (setting.autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && MODULES.maps.mapRepeats !== 0) {
				game.global.mapRunCounter = MODULES.maps.mapRepeats;
				MODULES.maps.mapRepeats = 0;
			}
			var autoLevel_Repeat = mapSettings.levelCheck;
			mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, null, null);
			if (mapAutoLevel !== Infinity) {
				if (autoLevel_Repeat !== Infinity && mapAutoLevel !== autoLevel_Repeat) MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
				mapLevel = mapAutoLevel;
			}
		}
		if (stackGoal > currentStacks) {
			shouldMap = true;
		}

		var cellsToClear = 0;
		if (game.global.mapsActive) {
			cellsToClear = getCurrentMapObject().size - getCurrentMapCell().level;
			cellsToClear = Math.ceil(cellsToClear / maxOneShotPower(true));
		}

		var repeat = game.global.mapsActive && cellsToClear > (stackGoal - currentStacks);
		var status = 'Toxicity: ' + currentStacks + '/' + stackGoal + ' stacks';

		if (mapSettings.mapName === mapName && !shouldMap) {
			mappingDetails(mapName, mapLevel, mapSpecial);
			resetMapVars();
			if (game.global.mapsActive) recycleMap_AT();
		}

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = mapLevel;
		farmingDetails.autoLevel = true;
		farmingDetails.special = mapSpecial;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
		farmingDetails.stackGoal = stackGoal;
		farmingDetails.currentStacks = currentStacks;
		farmingDetails.cellsToClear = cellsToClear;
		farmingDetails.settingIndex = settingIndex;
		if (setting.priority) farmingDetails.priority = setting.priority;

	}
	return farmingDetails;
}

function experience(lineCheck) {

	var shouldMap = false;
	var mapName = 'Experience';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	if (!challengeActive('Experience') || !getPageSetting('experience')) return farmingDetails;

	const wonderStartZone = getPageSetting('experienceStartZone') >= 300 ? getPageSetting('experienceStartZone') : Infinity;
	const mapSpecial = trimpStats.hyperspeed ? '0' : 'fa';
	const mapLevel = 0;
	var status = '';
	if (game.global.world >= wonderStartZone && game.global.world >= game.challenges.Experience.nextWonder) {
		shouldMap = true;
		status = 'Experience: Farming Wonders';
	}
	else {
		shouldMap = game.global.world > 600 && game.global.world >= (Math.max(605, getPageSetting('experienceEndZone')));
		if (shouldMap) mapName = 'Bionic Raiding';
		status = 'Experience: Ending Challenge';
	}

	//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
	if (lineCheck && shouldMap)
		return setting = { priority: Infinity, };

	var repeat = game.global.world < game.challenges.Experience.nextWonder;

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, mapLevel, mapSpecial);
		resetMapVars();
	}

	if (shouldMap) farmingDetails.shouldRun = shouldMap;
	farmingDetails.mapName = mapName;
	farmingDetails.mapLevel = mapLevel;
	farmingDetails.autoLevel = true;
	farmingDetails.special = mapSpecial;
	farmingDetails.repeat = !repeat;
	farmingDetails.status = status;

	return farmingDetails;
}

function wither(lineCheck) {

	var shouldMap = false;
	const mapName = 'Wither Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	if (!challengeActive('Wither') || !getPageSetting('wither')) return farmingDetails;
	if (game.challenges.Wither.healImmunity > 0) return farmingDetails;

	var mapAutoLevel = Infinity;
	var jobRatio = '0,0,1';
	var mapSpecial = getAvailableSpecials('lmc', true);

	if (game.global.mapRunCounter === 0 && game.global.mapsActive && MODULES.maps.mapRepeats !== 0) {
		game.global.mapRunCounter = MODULES.maps.mapRepeats;
		MODULES.maps.mapRepeats = 0;
	}

	var autoLevel_Repeat = mapSettings.levelCheck;
	mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, -1, null);
	if (mapAutoLevel !== Infinity) {
		if (autoLevel_Repeat !== Infinity && mapAutoLevel !== autoLevel_Repeat) MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
		var mapLevel = mapAutoLevel;
	}

	//Gamma burst info
	var gammaToTrigger = gammaMaxStacks(true) - game.heirlooms.Shield.gammaBurst.stacks;
	var gammaDmg = MODULES.heirlooms.gammaBurstPct;
	var canGamma = gammaToTrigger <= 1 ? true : false;

	var cell = game.global.lastClearedCell + 2;
	var name = game.global.gridArray[(cell - 1)].name;
	var damageGoal = 4;

	var equalityAmt = equalityQuery(name, game.global.world, cell, 'world', 1, 'gamma');
	var ourDmg = calcOurDmg('min', equalityAmt, false, 'world', 'never', 0, false);
	var enemyHealth = calcEnemyHealthCore('world', game.global.world, cell, name, calcMutationHealth(game.global.world));

	//Checking if we can clear current zone.
	if (((ourDmg * (canGamma ? gammaDmg : 1)) * damageGoal) < enemyHealth) {
		shouldMap = true;
	}

	//Checking if we can clear next zone.
	if (cell === 100) {
		equalityAmt = equalityQuery(name, game.global.world + 1, 100, 'world', 1, 'gamma');
		ourDmg = calcOurDmg('min', equalityAmt, false, 'world', 'never', 0, false);
		enemyHealth = calcEnemyHealthCore('world', game.global.world + 1, 100, 'Improbability', calcMutationHealth(game.global.world + 1));
		//Checking if we can clear current zone.
		if ((ourDmg * damageGoal) < enemyHealth) {
			shouldMap = true;
		}
	}

	//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
	if (lineCheck && shouldMap)
		return setting = { priority: Infinity, };

	var damageTarget = enemyHealth / damageGoal;

	var status = 'Wither Farm: Curr&nbsp;Dmg:&nbsp;' + prettify(ourDmg) + " Goal&nbsp;Dmg:&nbsp;" + prettify(damageTarget);

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

function quagmire(lineCheck) {

	var shouldMap = false;
	const mapName = 'Quagmire Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	const settingName = 'quagmireSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	var settingIndex = null;
	var setting;
	if (defaultSettings === null) return farmingDetails;
	if (!challengeActive('Quagmire') || !defaultSettings.active) return farmingDetails;

	for (var y = 0; y < baseSettings.length; y++) {
		if (y === 0) continue;
		const currSetting = baseSettings[y];
		var world = currSetting.world;
		if (!settingShouldRun(currSetting, world, 0, settingName)) continue;

		if (game.global.world === currSetting.world) {
			settingIndex = y;
			break;
		}
	}

	if (settingIndex !== null) setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting !== undefined) {
		var bogsToRun = 100;

		for (var i = 0; i < (settingIndex + 1); i++) {
			if (i === 0) continue;
			if (!baseSettings[i].active) continue;
			bogsToRun -= parseInt(baseSettings[i].bogs);
		}

		if ((game.challenges.Quagmire.motivatedStacks > bogsToRun))
			shouldMap = true;

		if (mapSettings.mapName === mapName && !shouldMap) {
			mappingDetails(mapName);
			resetMapVars(setting, settingName);
		}

		var repeat = game.global.mapsActive && (getCurrentMapObject().name !== 'The Black Bog' || (game.challenges.Quagmire.motivatedStacks - bogsToRun) === 1);
		var status = 'Black Bogs: ' + (game.challenges.Quagmire.motivatedStacks - bogsToRun) + " remaining";

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.jobRatio = setting.jobratio;
		farmingDetails.bogs = bogsToRun;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
		farmingDetails.settingIndex = settingIndex;
		if (setting.priority) farmingDetails.priority = setting.priority;
	}

	return farmingDetails;
}

function currQuest() {
	if (!challengeActive('Quest') || !getPageSetting('quest')) return 0;
	if (game.global.world < game.challenges.Quest.getQuestStartZone()) return 0;
	const questProgress = game.challenges.Quest.getQuestProgress();
	const questDescription = game.challenges.Quest.getQuestDescription();
	if (questProgress === 'Failed!' || questProgress === 'Quest Complete!') return 0;
	//Resource multipliers
	else if (questDescription.includes('food')) return 1;
	else if (questDescription.includes('wood')) return 2;
	else if (questDescription.includes('metal')) return 3;
	else if (questDescription.includes('gems')) return 4;
	else if (questDescription.includes('science')) return 5;
	//Everything else
	else if (questDescription === 'Complete 5 Maps at Zone level') return 6;
	else if (questDescription === 'One-shot 5 world enemies') return 7;
	else if (questDescription === 'Don\'t let your shield break before Cell 100') return 8;
	else if (questDescription === 'Don\'t run a map before Cell 100') return 9;
	else if (questDescription === 'Buy a Smithy') return 10;
	else return 0;
}

function quest(lineCheck) {

	var mapAutoLevel = Infinity;
	var shouldMap = false;
	const mapName = 'Quest';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	if (!challengeActive('Quest') || !getPageSetting('quest') || game.global.world < game.challenges.Quest.getQuestStartZone()) return farmingDetails;

	shouldMap = currQuest();

	//If we're running a one shot quest and 1) can one shot the enemy or 2) have max tenacity then don't map as it is very likely the quest won't be completed.
	if (shouldMap === 7) {
		if (calcOurDmg('min', 0, false, 'world', 'never') > calcEnemyHealthCore('world', game.global.world, 50, 'Turtlimp')) shouldMap = 0;
		if (game.portal.Tenacity.getMult() === Math.pow(1.4000000000000001, getPerkLevel('Tenacity') + getPerkLevel('Masterfulness'))) shouldMap = 0;
	}

	if (shouldMap && shouldMap !== 8) {
		//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
		if (lineCheck && shouldMap)
			return setting = { priority: 1, };

		var questArray = shouldMap === 1 || shouldMap === 4 ? ['lsc', '1'] :
			shouldMap === 2 ? ['lwc', '0,1'] :
				shouldMap === 3 || shouldMap === 7 ? ['lmc', '0,0,1'] :
					shouldMap === 5 ? ['fa', '0,0,0,1'] :
						['fa', '1,1,1,0'];
		var mapSpecial = questArray[0];
		var jobRatio = questArray[1];
		var questMin = (shouldMap === 6 || shouldMap === 7) && game.global.mapBonus !== 10 ? 0 : null;
		var mapLevel = 0;

		if (game.global.mapRunCounter === 0 && game.global.mapsActive && MODULES.maps.mapRepeats !== 0) {
			game.global.mapRunCounter = MODULES.maps.mapRepeats;
			MODULES.maps.mapRepeats = 0;
		}
		var autoLevel_Repeat = mapSettings.levelCheck;
		mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, null, questMin);
		if (mapAutoLevel !== Infinity) {
			if (autoLevel_Repeat !== Infinity && mapAutoLevel !== autoLevel_Repeat) MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
			mapLevel = mapAutoLevel;
		}

		var repeat = shouldMap === 6 && (game.global.mapBonus >= 4 || (game.global.mapsActive && getCurrentMapObject().level - game.global.world < 0));

		var status = 'Questing: ' + game.challenges.Quest.getQuestProgress();

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = mapLevel;
		farmingDetails.autoLevel = true;
		farmingDetails.special = mapSpecial;
		farmingDetails.jobRatio = jobRatio;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;

	}
	if (mapSettings.mapName === mapName && !farmingDetails.shouldRun) {
		mappingDetails(mapName);
		resetMapVars();
		if (game.global.mapsActive) recycleMap_AT();
	}

	return farmingDetails;
}

function mayhem(lineCheck) {

	var mapAutoLevel = Infinity;
	var shouldMap = false;
	const mapName = 'Mayhem Destacking';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	if (!challengeActive('Mayhem') || !getPageSetting('mayhem')) return farmingDetails;

	var destackHits = getPageSetting('mayhemDestack') > 0 ? getPageSetting('mayhemDestack') : Infinity;
	var destackZone = getPageSetting('mayhemZone') > 0 ? getPageSetting('mayhemZone') : Infinity;
	var mapLevel = 0;
	var mayhemMapIncrease = getPageSetting('mayhemMapIncrease') > 0 ? getPageSetting('mayhemMapIncrease') : 0;
	var mapSpecial = trimpStats.hyperspeed ? 'lmc' : 'fa';
	if (game.challenges.Mayhem.stacks > 0 && (hdStats.hdRatio > destackHits || game.global.world >= destackZone))
		shouldMap = true;

	//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
	if (lineCheck && shouldMap)
		return setting = { priority: 1, };

	if (game.global.mapRunCounter === 0 && game.global.mapsActive && MODULES.maps.mapRepeats !== 0) {
		game.global.mapRunCounter = MODULES.maps.mapRepeats;
		MODULES.maps.mapRepeats = 0;
	}
	var autoLevel_Repeat = mapSettings.levelCheck;
	mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, 10, (0 + mayhemMapIncrease));
	if (mapAutoLevel !== Infinity) {
		if (autoLevel_Repeat !== Infinity && mapAutoLevel !== autoLevel_Repeat) MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
		mapLevel = mapAutoLevel;
	}

	var repeat = game.challenges.Mayhem.stacks <= mapLevel + 1;
	var status = 'Mayhem Destacking: ' + game.challenges.Mayhem.stacks + " remaining";

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

	var mapAutoLevel = Infinity;
	var shouldMap = false;
	const mapName = 'Insanity Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	const settingName = 'insanitySettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	var settingIndex = null;
	var setting;
	if (defaultSettings === null) return farmingDetails;
	if (!challengeActive('Insanity') || !defaultSettings.active) return farmingDetails;

	for (var y = 0; y < baseSettings.length; y++) {
		if (y === 0) continue;
		const currSetting = baseSettings[y];
		var world = currSetting.world;
		if (!settingShouldRun(currSetting, world, 0, settingName)) continue;

		if (game.global.world === currSetting.world) {
			settingIndex = y;
			break;
		}
	}

	if (settingIndex !== null) setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting !== undefined) {
		var mapLevel = setting.level;
		var mapSpecial = setting.special;
		var insanityGoal = setting.insanity;
		var jobRatio = setting.jobratio;

		if (setting.autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && MODULES.maps.mapRepeats !== 0) {
				game.global.mapRunCounter = MODULES.maps.mapRepeats;
				MODULES.maps.mapRepeats = 0;
			}
			var autoLevel_Repeat = mapSettings.levelCheck;
			mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, null, null);
			if (mapAutoLevel !== Infinity) {
				if (autoLevel_Repeat !== Infinity && mapAutoLevel !== autoLevel_Repeat) MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
				mapLevel = mapAutoLevel;
			}
		}

		if (insanityGoal > game.challenges.Insanity.maxInsanity)
			insanityGoal = game.challenges.Insanity.maxInsanity;
		if (insanityGoal > game.challenges.Insanity.insanity || (setting.destack && game.challenges.Insanity.insanity > insanityGoal))
			shouldMap = true;

		var repeat = insanityGoal <= game.challenges.Insanity.insanity;
		var status = 'Insanity Farming: ' + game.challenges.Insanity.insanity + "/" + insanityGoal;

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
		}
	}

	return farmingDetails;
}

function pandemoniumDestack(lineCheck) {

	var shouldMap = false;
	var mapAutoLevel = Infinity;
	const mapName = 'Pandemonium Destacking';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	if (!challengeActive('Pandemonium') || !getPageSetting('pandemonium') || game.global.world < getPageSetting('pandemoniumZone')) return farmingDetails;

	var destackHits = getPageSetting('pandemoniumDestack') > 0 ? getPageSetting('pandemoniumDestack') : Infinity;
	var destackZone = getPageSetting('pandemoniumZone') > 0 ? getPageSetting('pandemoniumZone') : Infinity;

	if (destackHits === Infinity && destackZone === Infinity) return farmingDetails;

	var mapLevel = 1;
	var mapSpecial = trimpStats.hyperspeed ? 'lmc' : 'fa';
	var jobRatio = '0.001,1,1,0';

	if (game.global.mapRunCounter === 0 && game.global.mapsActive && MODULES.maps.mapRepeats !== 0) {
		game.global.mapRunCounter = MODULES.maps.mapRepeats;
		MODULES.maps.mapRepeats = 0;
	}
	var autoLevel_Repeat = mapSettings.levelCheck;
	mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, 10, 1);
	if (mapAutoLevel !== Infinity) {
		if (autoLevel_Repeat !== Infinity && autoLevel_Repeat !== mapAutoLevel) MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
		mapLevel = mapAutoLevel;
	}

	if (game.challenges.Pandemonium.pandemonium > 0 && (hdStats.hdRatio > destackHits || game.global.world >= destackZone))
		shouldMap = true;

	//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
	if (lineCheck && shouldMap)
		return setting = { priority: 1, };

	var repeat = (game.challenges.Pandemonium.pandemonium - mapLevel) < mapLevel;
	var status = 'Pandemonium Destacking: ' + game.challenges.Pandemonium.pandemonium + ' remaining';

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

function pandemoniumEquipFarm(lineCheck) {

	var mapAutoLevel = Infinity;
	var shouldMap = false;
	const mapName = 'Pandemonium Farming';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	if (!challengeActive('Pandemonium') || !getPageSetting('pandemonium') || getPageSetting('pandemoniumAE') < 2 || game.global.world === 150 || game.global.lastClearedCell + 2 < 91 || game.challenges.Pandemonium.pandemonium > 0) return farmingDetails;

	var jobRatio = '1,1,100,0';
	var equipCost = cheapestEquipmentCost();
	if (equipCost[0] === null) return farmingDetails;
	var nextEquipmentCost = equipCost[1];
	var farmFromZone = getPageSetting('pandemoniumAEZone') > 0 ? getPageSetting('pandemoniumAEZone') : Infinity;
	var mapLevel = 0;

	var autoLevel_Repeat = mapSettings.levelCheck;
	mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, null, null);
	if (mapAutoLevel !== Infinity) {
		if (autoLevel_Repeat !== Infinity && autoLevel_Repeat !== mapAutoLevel) MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
		mapLevel = mapAutoLevel;
	}

	var lmcCache = scaleToCurrentMap_AT(simpleSeconds_AT('metal', 20, jobRatio), false, true, mapLevel);
	var mapSpecial = nextEquipmentCost > lmcCache ? 'hc' : 'lmc';
	var resourceGain = mapSpecial === 'hc' ? lmcCache * 2 : lmcCache;

	//Checking if an equipment level costs less than a cache or a prestige level costs less than a jestimp and if so starts farming.
	if (resourceGain >= nextEquipmentCost && game.global.world >= farmFromZone)
		shouldMap = true;

	//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
	if (lineCheck && shouldMap)
		return setting = { priority: 1, };

	var repeat = nextEquipmentCost >= resourceGain;
	var status = 'Pandemonium Farming Equips below ' + prettify(resourceGain);

	farmingDetails.shouldRun = shouldMap;
	farmingDetails.mapName = mapName;
	farmingDetails.mapLevel = mapLevel;
	farmingDetails.autoLevel = true;
	farmingDetails.special = mapSpecial;
	farmingDetails.jobRatio = jobRatio;
	farmingDetails.gather = 'metal';
	farmingDetails.repeat = !repeat;
	farmingDetails.status = status;

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, mapLevel, mapSpecial);
		resetMapVars();
	}

	return farmingDetails;
}

function alchemy(lineCheck) {

	var shouldMap = false;
	var mapAutoLevel = Infinity;
	const mapName = 'Alchemy Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	const settingName = 'alchemySettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	var settingIndex = null;
	var setting;
	if (defaultSettings === null) return farmingDetails;
	if (!challengeActive('Alchemy') || !defaultSettings.active) return farmingDetails;

	for (var y = 0; y < baseSettings.length; y++) {
		if (y === 0) continue;
		const currSetting = baseSettings[y];
		var world = currSetting.world;
		if (!settingShouldRun(currSetting, world, 0, settingName)) continue;
		if (game.global.world === world || ((game.global.world - world) % currSetting.repeatevery === 0)) {
			settingIndex = y;
			break;
		}
	}

	if (settingIndex !== null) setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting !== undefined) {
		var mapLevel = setting.level;
		var mapSpecial = setting.special;
		var jobRatio = setting.jobratio;
		var potionGoal = setting.potion;

		if (setting.autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && MODULES.maps.mapRepeats !== 0) {
				game.global.mapRunCounter = MODULES.maps.mapRepeats;
				MODULES.maps.mapRepeats = 0;
			}
			var autoLevel_Repeat = mapSettings.levelCheck;
			mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, 10, 1);
			if (mapAutoLevel !== Infinity) {
				if (autoLevel_Repeat !== Infinity && mapAutoLevel !== autoLevel_Repeat) MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
				mapLevel = mapAutoLevel;
			}
		}

		//Working out which potion the input corresponds to.
		const potionIndex = ['h', 'g', 'f', 'v', 's'].indexOf(potionGoal.charAt('0'));
		const potionName = alchObj.potionNames[potionIndex];
		var potionTarget = potionGoal.toString().replace(/[^\d,:-]/g, '');
		//Alchemy biome selection, will select Farmlands if it's unlocked and appropriate otherwise it'll use the default map type for that herb.
		const potionBiomes = ['Mountain', 'Forest', 'Sea', 'Depths', 'Plentiful'];
		const farmlandResources = ['Metal', 'Wood', 'Food', 'Gems', 'Any'];
		const biome = game.global.farmlandsUnlocked && farmlandResources[potionIndex] === getFarmlandsResType() ? 'Farmlands' : potionBiomes[potionIndex];

		//Doing calcs to identify the total cost of all the Brews/Potions that are being farmed
		const herbMult = biome === 'Farmlands' ? 1.5 : 1;
		const potionCurrent = alchObj.potionsOwned[potionIndex];

		var potionCostTotal = 0;
		var potionMult = 1;
		//If farming for a potion then calculates the compounding mult for the potion from other potions
		if (!alchObj.potions[potionIndex].enemyMult) {
			var potionsOwned = 0;
			for (var y = 0; y < farmlandResources.length; y++) {
				if (alchObj.potions[y].enemyMult) continue;
				if (potionName !== alchObj.potionNames[y]) potionsOwned += alchObj.potionsOwned[y];
			}
			potionMult = Math.pow(alchObj.allPotionGrowth, potionsOwned);
		}

		//When mapType is set as Map Count work out how many of each Potion/Brew we can farm in the amount of maps specified.
		if (setting.mapType && setting.mapType === 'Map Count') {
			if (mapSettings.potionTarget)
				potionTarget = mapSettings.potionTarget;
			else {
				var herbsGained = game.herbs[alchObj.potions[potionIndex].cost[0][0]].cowned + (alchObj.getDropRate(game.global.world + mapLevel) * herbMult * potionTarget);
				potionTarget = potionCurrent;
				while (herbsGained > Math.pow(alchObj.potions[potionIndex].cost[0][2], potionTarget) * alchObj.potions[potionIndex].cost[0][1] * potionMult) {
					herbsGained -= (Math.pow(alchObj.potions[potionIndex].cost[0][2], potionTarget) * alchObj.potions[potionIndex].cost[0][1] * potionMult);
					potionTarget++;
				}
			}
		}

		//Looping through each potion level and working out their cost to calc total cost
		for (var x = potionCurrent; x < potionTarget; x++) {
			var potionCost = Math.pow(alchObj.potions[potionIndex].cost[0][2], x) * alchObj.potions[potionIndex].cost[0][1];
			potionCost *= potionMult;
			potionCostTotal += potionCost;
		}

		//Craft the potion if we can afford it and we're not at the goal
		if (potionTarget > potionCurrent && alchObj.canAffordPotion(alchObj.potionNames[potionIndex])) {
			for (var z = potionCurrent; z < potionTarget; z++) {
				//Only craft Gaseous Brews if we can afford all of them as they increase enemy stat scaling and only provide a radon benefit there's no point in buying them straight away.
				if (potionName === 'Gaseous Brew' && potionCostTotal > game.herbs[alchObj.potions[potionIndex].cost[0][0]].cowned) break;
				alchObj.craftPotion(alchObj.potionNames[potionIndex]);
			}
		}

		if (potionTarget > alchObj.potionsOwned[potionIndex])
			shouldMap = true;

		//Identifying current herbs + ones that we'll get from the map we should run
		const herbTotal = game.herbs[alchObj.potions[potionIndex].cost[0][0]].cowned + (alchObj.getDropRate(game.global.world + mapLevel) * herbMult);
		var repeat = herbTotal >= potionCostTotal;
		var status = 'Alchemy Farming ' + alchObj.potionNames[potionIndex] + " (" + alchObj.potionsOwned[potionIndex] + "/" + potionTarget + ")";

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
	}

	//Purchase Void & Strength potions if possible when inside a void map
	if ((typeof (defaultSettings.voidPurchase) !== 'undefined' ? defaultSettings.voidPurchase : false) && game.global.voidBuff !== '') {
		if (getCurrentMapObject().location === "Void" && (alchObj.canAffordPotion('Potion of the Void') || alchObj.canAffordPotion('Potion of Strength'))) {
			alchObj.craftPotion('Potion of the Void');
			alchObj.craftPotion('Potion of Strength');
		}
	}

	if (mapSettings.mapName === mapName && !shouldMap) {
		mappingDetails(mapName, mapLevel, mapSpecial, alchObj.potionsOwned[mapSettings.potionIndex], alchObj.potionNames[mapSettings.potionIndex]);
		resetMapVars(setting, settingName);
	}

	return farmingDetails;
}

function glass(lineCheck) {

	var shouldMap = false;
	var mapAutoLevel = Infinity;
	var mapName = 'Glass ';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	if (!challengeActive('Glass') || !getPageSetting('glass')) return farmingDetails;

	var mapLevel = 0;
	var jobRatio = '0,0,1';
	var mapSpecial = getAvailableSpecials('lmc', true);
	var glassStacks = getPageSetting('glassStacks');
	if (glassStacks <= 0) glassStacks = Infinity;

	//Auto level junk - Maybe pop this into its own function?
	if (game.global.mapRunCounter === 0 && game.global.mapsActive && MODULES.maps.mapRepeats !== 0) {
		game.global.mapRunCounter = MODULES.maps.mapRepeats;
		MODULES.maps.mapRepeats = 0;
	}

	var autoLevel_Repeat = mapSettings.levelCheck;
	mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, 10, null);
	if (mapAutoLevel !== Infinity) {
		if (autoLevel_Repeat !== Infinity && mapAutoLevel !== autoLevel_Repeat) MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
		mapLevel = mapAutoLevel;
	}

	//Gamma burst info
	var gammaTriggerStacks = gammaMaxStacks();
	var gammaToTrigger = gammaTriggerStacks - game.heirlooms.Shield.gammaBurst.stacks;
	if (game.global.mapsActive) gammaToTrigger = Infinity;
	var gammaDmg = MODULES.heirlooms.gammaBurstPct;
	var canGamma = gammaToTrigger <= 1 ? true : false;
	var damageGoal = 2;

	var equalityAmt = equalityQuery('Snimp', game.global.world, 20, 'map', 0.75, 'gamma');
	var ourDmg = calcOurDmg('min', equalityAmt, false, 'map', 'maybe', mapLevel, false);
	var enemyHealth = calcEnemyHealthCore('map', game.global.world, 20, 'Snimp') * .75;
	if (glassStacks <= gammaTriggerStacks) ourDmg *= gammaDmg;

	//Destacking
	if (!canGamma && mapSettings.mapName === 'Glass Destacking' || ((ourDmg * damageGoal) > enemyHealth && game.challenges.Glass.shards >= glassStacks)) {
		mapSpecial = getAvailableSpecials('fa');
		shouldMap = true;
		mapLevel = 0;
		mapName += 'Destacking';
	}
	//Farming if we don't have enough damage to clear stacks!
	else if (!canGamma && (ourDmg * damageGoal) < enemyHealth) {
		mapName += 'Farming';
		shouldMap = true;
	}
	//Checking if we can clear +0 maps on the next zone.
	else if (game.global.lastClearedCell + 2 === 100) {
		equalityAmt = equalityQuery('Snimp', game.global.world + 1, 20, 'map', 0.75, 'gamma');
		ourDmg = calcOurDmg('min', equalityAmt, false, 'map', 'maybe', mapLevel, false);
		enemyHealth = calcEnemyHealthCore('map', game.global.world + 1, 20, 'Snimp') * .75;
		mapName += 'Farming';
		//Checking if we can clear current zone.
		if ((ourDmg * damageGoal) < enemyHealth) {
			shouldMap = true;
		}
	}

	//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
	if (lineCheck && shouldMap)
		return setting = { priority: 1, };

	if ((game.global.mapsActive || game.challenges.Glass.shards > 0) && mapSettings.mapName === 'Glass Destacking') {
		if (game.challenges.Glass.shards > 0) {
			shouldMap = true;
		}
		else {
			recycleMap_AT();
			shouldMap = false;
		}
	}

	var damageTarget = enemyHealth / damageGoal;

	var status;
	if (mapName.includes('Destack')) status = mapName + " " + game.challenges.Glass.shards + " stacks remaining";
	else status = game.global.challengeActive + ' Farm: Curr&nbsp;Dmg:&nbsp;' + prettify(ourDmg) + " Goal&nbsp;Dmg:&nbsp;" + prettify(damageTarget);

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

	var shouldMap = false;
	var mapAutoLevel = Infinity;
	const mapName = 'Hypothermia Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};
	const settingName = 'hypothermiaSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	var settingIndex = null;
	var setting;
	if (defaultSettings === null) return farmingDetails;

	if ((!defaultSettings.active ||
		(!challengeActive('Hypothermia') && (!defaultSettings.packrat || !MODULES.mapFunctions.hypothermia.buyPackrat)))) return farmingDetails;

	if (defaultSettings.packrat) {
		if (!MODULES.mapFunctions.hypothermia.buyPackrat && challengeActive('Hypothermia'))
			MODULES.mapFunctions.hypothermia.buyPackrat = true;
		if (MODULES.mapFunctions.hypothermia.buyPackrat && challengeActive('')) {
			viewPortalUpgrades();
			numTab(6, true);
			buyPortalUpgrade('Packrat');
			MODULES.mapFunctions.hypothermia.buyPackrat = null;
			activateClicked();
		}
	}

	if (!challengeActive('Hypothermia')) return farmingDetails;

	for (var y = 0; y < baseSettings.length; y++) {
		if (y === 0) continue;
		const currSetting = baseSettings[y];
		var world = currSetting.world;
		if (!settingShouldRun(currSetting, world, 0, settingName)) continue;

		if (game.global.world === currSetting.world) {
			settingIndex = y;
			break;
		}
	}

	if (settingIndex !== null) setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting !== undefined) {
		var bonfireGoal = setting.bonfire;
		var mapSpecial = getAvailableSpecials("lwc", true);
		var mapLevel = setting.level;
		var jobRatio = setting.jobratio;
		var shedCost = 0;
		var bonfireCostTotal = 0;
		var bonfireCost;

		if (setting.autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && MODULES.maps.mapRepeats !== 0) {
				game.global.mapRunCounter = MODULES.maps.mapRepeats;
				MODULES.maps.mapRepeats = 0;
			}

			var autoLevel_Repeat = mapSettings.levelCheck;
			mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, null, null);
			if (mapAutoLevel !== Infinity) {
				if (autoLevel_Repeat !== Infinity && mapAutoLevel !== autoLevel_Repeat) MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
				mapLevel = mapAutoLevel;
			}
		}

		//Looping through each bonfire level and working out their cost to calc total cost
		for (var x = game.challenges.Hypothermia.totalBonfires; x < bonfireGoal; x++) {
			bonfireCost = 1e10 * Math.pow(100, x);
			bonfireCostTotal += bonfireCost;
		}
		if (bonfireCostTotal > (game.resources.wood.max * (1 + (game.portal.Packrat.modifier * game.portal.Packrat.radLevel))))
			shedCost += game.buildings.Shed.cost.wood();
		bonfireCostTotal += shedCost;

		if (bonfireCostTotal > game.resources.wood.owned && bonfireGoal > game.challenges.Hypothermia.totalBonfires) {
			shouldMap = true;
		}

		var repeat = game.resources.wood.owned > game.challenges.Hypothermia.bonfirePrice || scaleToCurrentMap_AT(simpleSeconds_AT("wood", 20, jobRatio), false, true, mapLevel) + game.resources.wood.owned > bonfireCostTotal;
		var status = 'Hypo Farming to ' + prettify(bonfireCostTotal) + ' wood';

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = mapLevel;
		farmingDetails.autoLevel = setting.autoLevel;
		farmingDetails.special = mapSpecial;
		farmingDetails.jobRatio = jobRatio;
		farmingDetails.bonfire = bonfireGoal;
		farmingDetails.woodGoal = bonfireCostTotal;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
		farmingDetails.settingIndex = settingIndex;
		if (setting.priority) farmingDetails.priority = setting.priority;

		if (mapSettings.mapName === mapName && !farmingDetails.shouldRun) {
			mappingDetails(mapName, mapLevel, mapSpecial, bonfireCostTotal);
			resetMapVars(setting, settingName);
		}
	}

	return farmingDetails;
}

function desolation(lineCheck, forceDestack) {

	var shouldMap = false;
	var mapAutoLevel = Infinity;
	const mapName = 'Desolation Destacking';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	if (!challengeActive('Desolation') || !getPageSetting('desolation')) return farmingDetails;

	var destackHits = getPageSetting('desolationDestack') > 0 ? getPageSetting('desolationDestack') : Infinity;
	var destackZone = getPageSetting('desolationZone') > 0 ? getPageSetting('desolationZone') : Infinity;
	var destackStacks = getPageSetting('desolationStacks') > 0 ? getPageSetting('desolationStacks') : 300;
	var destackOnlyZone = getPageSetting('desolationOnlyDestackZone') > 0 ? getPageSetting('desolationOnlyDestackZone') : Infinity;
	var mapLevel = 0;
	var mapSpecial = trimpStats.hyperspeed ? 'lmc' : 'fa';
	var sliders = [9, 9, 9];
	var biome = getBiome();
	var equality = false;

	//Forcing destack before doing any farmings.
	if (forceDestack) {
		destackZone = game.global.world;
		destackStacks = 0;
	}

	if ((game.challenges.Desolation.chilled >= destackStacks && (hdStats.hdRatio > destackHits || game.global.world >= destackZone || game.global.world >= destackOnlyZone)))
		shouldMap = true;

	if (game.global.mapRunCounter === 0 && game.global.mapsActive && MODULES.maps.mapRepeats !== 0) {
		game.global.mapRunCounter = MODULES.maps.mapRepeats;
		MODULES.maps.mapRepeats = 0;
	}
	if (game.global.world < destackOnlyZone && !game.jobs.Explorer.locked) {
		var autoLevel_Repeat = mapSettings.levelCheck;
		mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, 10, 0);
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
			if (game.global.mapsActive && mapSettings.mapName === mapName && (getCurrentMapObject().bonus === undefined ? '0' : getCurrentMapObject().bonus) === mapSpecial && (getCurrentMapObject().level - game.global.world) === mapLevel) break;
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
		}
		else {
			if (game.challenges.Desolation.chilled === 0) recycleMap_AT(true);
			shouldMap = false;
		}
	}

	//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
	if (lineCheck && shouldMap)
		return setting = { priority: 1, };

	var repeat = game.challenges.Desolation.chilled <= mapLevel + 1;
	var status = 'Desolation Destacking: ' + game.challenges.Desolation.chilled + " remaining";

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
		mapName: mapName,
	};

	if (!challengeActive('Desolation') || !getPageSetting('desolation')) return farmingDetails;

	const settingName = 'desolationSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	var settingIndex = null;
	var setting;
	if (defaultSettings === null) return farmingDetails;
	if (!defaultSettings.active) return farmingDetails;

	for (var y = 0; y < baseSettings.length; y++) {
		if (y === 0) continue;
		//Skip iterating lines if map bonus is capped.
		const currSetting = baseSettings[y];
		//Set cell ourselves since there is no input and you don't need to do this before c100. If you're overkilling you definitely don't need this setting.
		currSetting.cell = 100 - maxOneShotPower() + 1;
		var targetPrestige = currSetting.prestigeGoal !== 'All' ? MODULES.equipment[currSetting.prestigeGoal].upgrade : 'GamesOP';
		var world = currSetting.world - 1;
		if (!settingShouldRun(currSetting, world, 0, settingName)) continue;

		//Checks to see what our actual zone should be
		var raidZones = currSetting.world;
		if (currSetting.repeatevery !== 0 && game.global.world > currSetting.world) {
			var times = currSetting.repeatevery;
			var repeats = Math.round((game.global.world - currSetting.world) / times);
			if (repeats > 0) raidZones += (times * repeats);
		}

		//Skips if we don't have the required prestige available.
		if (prestigesToGet(raidZones, targetPrestige)[0] <= 0) continue;
		if (game.global.world === world || ((game.global.world - world) % currSetting.repeatevery === 0)) {
			settingIndex = y;
			break;
		}
	}

	if (settingIndex !== null) setting = baseSettings[settingIndex];
	if (lineCheck) return setting;

	if (setting !== undefined || MODULES.mapFunctions.desolation.gearScum) {
		var special;
		var jobRatio;
		var gather;
		var mapLevel = game.global.lastClearedCell < 80 ? 0 : 1;
		if (settingIndex !== null) {
			special = getAvailableSpecials(setting.special);
			jobRatio = setting.jobratio;
			gather = setting.gather;
		}
		else if (MODULES.maps.lastMapWeWereIn !== null && MODULES.maps.lastMapWeWereIn.mapLevel === mapLevel) {
			special = MODULES.maps.lastMapWeWereIn.bonus;
		}

		//Check if a max attack+gamma burst can clear the improb.
		//If it can't continue as normal, if it can then we start the +1 map for prestige scumming.
		var currCell = game.global.lastClearedCell + 2;
		var enemyHealth = getCurrentWorldCell().maxHealth > -1 ? getCurrentWorldCell().health : calcEnemyHealthCore('world', game.global.world, currCell, game.global.gridArray[currCell - 1].name);
		var equalityAmt = equalityQuery('Improbability', game.global.world, 100, 'world', 1, 'gamma');
		var ourDmg = calcOurDmg('max', equalityAmt, false, 'world', 'force', 0, false);
		var gammaDmg = MODULES.heirlooms.gammaBurstPct;
		var ourDmgTotal = (ourDmg * gammaDmg) * 5;

		//Check if we will overshoot the improb with our regular hit/gamma burst.
		//Add together the health of the cells between our current cell and the improb that we are able to overkill.
		if (currCell !== 100) {
			for (var x = currCell + 1; x <= 100; x++) {
				enemyHealth += calcEnemyHealthCore('world', game.global.world, x, game.global.gridArray[x - 1].name);
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
				debug(mapName + " (z" + game.global.world + "c" + (game.global.lastClearedCell + 2) + ") exiting map to ensure we complete it at start of the next zone.", "map_Details")
				mapsClicked(true);
			}
		}

		const prestigeList = ['Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'];

		//Marking setting as complete if we've run enough maps.
		if (mapSettings.mapName === mapName && MODULES.mapFunctions.desolation.gearScum && (game.global.currentMapId === '' || prestigeList.indexOf(game.global.mapGridArray[getCurrentMapObject().size - 1].special) === -1)) {
			debug(mapName + " (z" + game.global.world + "c" + (game.global.lastClearedCell + 2) + ") was successful.", "map_Details");
			resetMapVars();
			saveSettings();
			shouldMap = false;
			MODULES.mapFunctions.desolation.gearScum = false;
		}

		var status = 'Desolation Prestige Scumming';
		var repeat = true;
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
	var mapAutoLevel = Infinity;
	const mapName = 'Smithless Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
	};

	if (!challengeActive('Smithless') || !getPageSetting('smithless')) return farmingDetails;

	if (game.global.world % 25 === 0 && game.global.lastClearedCell === -1 && game.global.gridArray[0].ubersmith) {

		var jobRatio = '0,0,1';
		var mapSpecial = getAvailableSpecials('lmc', true);
		var smithlessMax = game.global.mapBonus !== 10 ? 10 : null;
		var smithlessMin = game.global.mapBonus !== 10 ? 0 : null;

		if (game.global.mapRunCounter === 0 && game.global.mapsActive && MODULES.maps.mapRepeats !== 0) {
			game.global.mapRunCounter = MODULES.maps.mapRepeats;
			MODULES.maps.mapRepeats = 0;
		}
		var autoLevel_Repeat = mapSettings.levelCheck;
		mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, smithlessMax, smithlessMin);
		if (mapAutoLevel !== Infinity) {
			if (autoLevel_Repeat !== Infinity && mapAutoLevel !== autoLevel_Repeat) MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
			mapLevel = mapAutoLevel;
		}

		var name = game.global.gridArray[0].name;
		var gammaDmg = MODULES.heirlooms.gammaBurstPct;
		var equalityAmt = equalityQuery(name, game.global.world, 1, 'world', 1, 'gamma');
		var ourDmg = calcOurDmg('min', equalityAmt, false, 'world', 'never', 0, false);
		var ourDmgTenacity = ourDmg;

		var gammas = 10 % gammaMaxStacks();
		var regularHits = 10 - (gammas * gammaMaxStacks());

		//Map Bonus
		if (game.global.mapBonus > 0 && game.global.mapBonus !== 10) {
			ourDmgTenacity /= 1 + 0.2 * game.global.mapBonus;
			ourDmgTenacity *= 5;
		}
		//Tenacity
		if (game.portal.Tenacity.radLevel > 0) {
			if (!(game.portal.Tenacity.getMult() === Math.pow(1.4000000000000001, getPerkLevel("Tenacity") + getPerkLevel("Masterfulness")))) {
				ourDmgTenacity /= game.portal.Tenacity.getMult();
				ourDmgTenacity *= Math.pow(1.4000000000000001, getPerkLevel("Tenacity") + getPerkLevel("Masterfulness"));
			}
		}

		ourDmgTenacity *= getZoneMinutes() > 100 ? 1 : 1.5;
		if (prestigesToGet(game.global.world + mapLevel)[0] > 0) ourDmgTenacity *= 1000;

		var totalDmgTenacity = ((ourDmgTenacity * regularHits) + (ourDmgTenacity * gammaDmg * gammas))

		var enemyHealth = calcEnemyHealthCore('world', game.global.world, 1, name);
		enemyHealth *= 3e15;
		const smithyThreshhold = [1, 0.01, 0.000001];
		const smithyThreshholdIndex = [0.000001, 0.01, 1];
		while (smithyThreshhold.length > 0 && totalDmgTenacity < (enemyHealth * smithyThreshhold[0])) {
			smithyThreshhold.shift();
		}
		enemyHealth *= smithyThreshhold[0];

		if (smithyThreshhold.length === 0) return farmingDetails;

		var totalDmg = ((ourDmg * regularHits) + (ourDmg * gammaDmg * gammas))
		var damageTarget = enemyHealth / totalDmg;

		if (totalDmg < enemyHealth) {
			shouldMap = true;
		}

		//As we need to be able to add this to the priority list and it should always be the highest priority then need to return this here
		if (lineCheck && shouldMap)
			return setting = { priority: Infinity, };

		var status = 'Smithless: Want ' + damageTarget.toFixed(2) + 'x more damage for ' + (smithyThreshholdIndex.indexOf(smithyThreshhold[0]) + 1) + '/3';

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
			mappingDetails(mapName, mapLevel, mapSpecial, (smithyThreshholdIndex.indexOf(smithyThreshhold[0]) + 1));
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
	return (zone === 0) ? hd : Math.pow(mult, zone) * hd;
}

function hdFarm(lineCheck, skipHealthCheck, voidFarm) {

	var shouldMap = false;
	var shouldSkip = false;
	var mapAutoLevel = Infinity;
	var mapName = 'HD Farm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName,
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
			autoLevel: true, hdMult: 1, jobratio: voidSetting.jobratio, world: game.global.world, level: -1, hdBase: Number(voidSetting.hdRatio), hdType: 'voidFarm', mapCap: (typeof voidSetting.mapCap !== 'undefined' ? voidSetting.mapCap : 100), priority: 1,
		}
		//Checking to see which of hits survived and hd farm should be run. Prioritises hits survived.
		if (voidSetting.hitsSurvived > hdStats.hitsSurvivedVoid) {
			setting.hdBase = Number(voidSetting.hitsSurvived);
			setting.hdType = 'hitsSurvivedVoid';
		}
	} //Standalone Hits Survived setting setup.
	else if (!skipHealthCheck && MODULES.mapFunctions.hasHealthFarmed !== (getTotalPortals() + "_" + game.global.world)) {
		const hitsSurvivedSetting = targetHitsSurvived(true);
		if (hitsSurvivedSetting > 0 && hdStats.hitsSurvived < hitsSurvivedSetting)
			setting = {
				autoLevel: true, hdBase: hitsSurvivedSetting, hdMult: 1, world: game.global.world, hdType: 'hitsSurvived', jobratio: typeof defaultSettings.jobratio !== 'undefined' ? defaultSettings.jobratio : '1,1,2', level: -1, hitsSurvivedFarm: true, priority: Infinity,
			}
	}
	if (!defaultSettings.active && setting === undefined) return farmingDetails;

	if (defaultSettings.active) {
		if (settingIndex === null)
			for (var y = 0; y < baseSettings.length; y++) {
				if (y === 0) continue;
				const currSetting = baseSettings[y];
				const world = currSetting.world;
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

		var mapLevelMin = null;
		//Setup min map level for world and hits survived farming as those settings care about map bonus
		if ((setting.hdType === 'world' && game.global.mapBonus !== 10) || (setting.hdType === 'hitsSurvived' && game.global.mapBonus < getPageSetting('mapBonusHealth')))
			mapLevelMin = game.global.universe === 1 ? (0 - game.portal.Siphonology.level) : 0;

		//Auto Level setup
		if (setting.autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && MODULES.maps.mapRepeats !== 0) {
				game.global.mapRunCounter = MODULES.maps.mapRepeats;
				MODULES.maps.mapRepeats = 0;
			}
			mapAutoLevel = callAutoMapLevel(mapSettings.mapName, mapSettings.levelCheck, mapSpecial, null, mapLevelMin);
			if (mapAutoLevel !== Infinity) {
				if (mapSettings.levelCheck !== Infinity && mapAutoLevel !== mapSettings.levelCheck) MODULES.maps.mapRepeats = game.global.mapRunCounter + 1;
				mapLevel = mapAutoLevel;
			}
		}

		//Identify which type of hdRatio/hits survived we're checking against and store it into a variable for future use.
		var hdRatio = hdType === 'world' ? hdStats.hdRatio :
			hdType === 'voidFarm' ? hdStats.vhdRatioVoid :
				hdType === 'void' ? hdStats.hdRatioVoid :
					hdType === 'map' ? hdStats.hdRatioMap :
						hdType === 'hitsSurvived' ? hdStats.hitsSurvived :
							hdType === 'hitsSurvivedVoid' ? hdStats.hitsSurvivedVoid :
								null;

		//Skipping farm if map repeat value is greater than our max maps value
		if (mapsRunCap > game.global.mapRunCounter && (hdType.includes('hitsSurvived') ? hdRatio < settingTarget : hdType === 'maplevel' ? setting.hdBase > hdStats.autoLevel : hdRatio > settingTarget))
			shouldMap = true;

		if (mapSettings.mapName !== mapName && (hdType.includes('hitsSurvived') ? hdRatio > settingTarget : hdType !== 'maplevel' ? settingTarget > hdRatio : hdStats.autoLevel > setting.hdBase))
			shouldSkip = true;
		if (((mapSettings.mapName === mapName && !shouldMap || game.global.mapRunCounter === mapsRunCap) || shouldSkip) && hdRatio !== Infinity) {
			if (!shouldSkip) mappingDetails(mapName, mapLevel, mapSpecial, hdRatio, settingTarget, hdType);
			//Messages detailing why we are skipping mapping.
			if (getPageSetting('spamMessages').map_Skip && shouldSkip) {
				if (hdType.includes('hitsSurvived'))
					debug("Hits Survived (z" + game.global.world + "c" + (game.global.lastClearedCell + 2) + ") skipped as Hits Survived goal has been met (" + hitsSurvived.toFixed(2) + "/" + settingTarget.toFixed(2) + ").", 'map_Skip');
				else if (hdType !== 'maplevel')
					debug("HD Farm (z" + game.global.world + "c" + (game.global.lastClearedCell + 2) + ") skipped as HD Ratio goal has been met (" + hdRatio.toFixed(2) + "/" + settingTarget.toFixed(2) + ").", 'map_Skip');
				else
					debug("HD Farm (z" + game.global.world + "c" + (game.global.lastClearedCell + 2) + ") skipped as Map Level goal has been met (Autolevel " + setting.hdBase + "/" + hdStats.autoLevel + ").", 'map_Skip');
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
			else status += '<br>' + (setting.hdBase >= 0 ? "+" : "") + setting.hdBase + ' Auto Level';
		}
		mapsRunCap = mapsRunCap === Infinity ? '∞' : mapsRunCap;
		var repeat = game.global.mapRunCounter + 1 === mapsRunCap;
		status += '<br>\ Maps:&nbsp;' + (game.global.mapRunCounter) + '/' + mapsRunCap;

		farmingDetails.shouldRun = shouldMap;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = mapLevel;
		farmingDetails.autoLevel = setting.autoLevel;
		farmingDetails.special = mapSpecial;
		farmingDetails.jobRatio = jobRatio;

		farmingDetails.hdType = hdType;
		farmingDetails.hdRatio = settingTarget;
		farmingDetails.hdRatio2 = hdRatio;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
		farmingDetails.runCap = mapsRunCap;
		farmingDetails.shouldHealthFarm = hdType.includes('hitsSurvived');
		farmingDetails.voidHitsSurvived = hdType === 'hitsSurvivedVoid';
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
		levelCheck: Infinity,
	}

	//Won't map till after cell 90 on Lead on Even zones
	if (challengeActive('Lead') && !game.global.runningChallengeSquared && game.global.world !== 180 && (game.global.world % 2 === 0 || game.global.lastClearedCell + 2 <= 90)) {
		mapSettings = farmingDetails;
	}
	if (!game.global.mapsUnlocked) mapSettings = farmingDetails;

	var mapTypes = [];
	//U1 map settings to check for.
	if (game.global.universe === 1) {
		mapTypes = [
			mapDestacking,
			prestigeClimb,
			prestigeRaiding,
			bionicRaiding,
			mapFarm,
			hdFarm,
			voidMaps,
			mapBonus,
			toxicity,
			experience,
			obtainUniqueMap,
		];

		//Skipping map farming if in Decay and above stack count user input
		if (decaySkipMaps())
			mapTypes = [
				prestigeClimb,
				voidMaps,
				obtainUniqueMap,
			];

		if (challengeActive('Mapology') && getPageSetting('mapology'))
			mapTypes = [
				prestigeClimb,
				prestigeRaiding,
				bionicRaiding,
				voidMaps,
				obtainUniqueMap,
			];

		if (isDoingSpire() && getPageSetting('skipSpires') && game.global.mapBonus === 10) mapSettings = farmingDetails;
	}

	if (game.global.universe === 2) {

		//U2 map settings to check for.
		mapTypes = [
			mapDestacking,
			quest,
			pandemoniumDestack,
			pandemoniumEquipFarm,
			desolationGearScum,
			desolation,
			prestigeClimb,
			prestigeRaiding,
			smithyFarm,
			mapFarm,
			tributeFarm,
			worshipperFarm,
			quagmire,
			insanity,
			alchemy,
			hypothermia,
			hdFarm,
			voidMaps,
			mapBonus,
			wither,
			mayhem,
			glass,
			smithless,
			obtainUniqueMap,
		];
	}

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
			priorityList.sort(function (a, b) {
				if (a.priority === b.priority) return (mapTypes.indexOf(a.settingName) > mapTypes.indexOf(b.settingName)) ? 1 : -1; return (a.priority > b.priority) ? 1 : -1;
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

	//Setup level check so that we can compare if we need to do some work with map run counters
	farmingDetails.levelCheck = farmingDetails.autoLevel ? farmingDetails.mapLevel : Infinity;
	mapSettings = farmingDetails;
}

//I have no idea where loot > drops, hopefully somebody can tell me one day :)
function getBiome(mapGoal, resourceGoal) {
	var biome;
	var dropBased = (challengeActive('Trapper') && game.stats.highestLevel.valueTotal() < 800) || (challengeActive('Trappapalooza') && game.stats.highestRadLevel.valueTotal() < 220);
	if (!dropBased && challengeActive('Metal')) {
		dropBased = true;
		if (!resourceGoal) resourceGoal = 'Mountain';
	}

	if (resourceGoal && dropBased) {
		if (game.global.farmlandsUnlocked && getFarmlandsResType() === game.mapConfig.locations[resourceGoal].resourceType)
			biome = 'Farmlands';
		else
			biome = resourceGoal;
	}
	else if (mapGoal === 'fragments')
		biome = 'Depths';
	else if (mapGoal === 'fragConservation')
		biome = 'Random';
	else if ((game.global.universe === 2 && game.global.farmlandsUnlocked))
		biome = 'Farmlands';
	else if (game.global.decayDone)
		biome = 'Plentiful';
	else
		biome = 'Mountain';

	return biome;
}

function getAvailableSpecials(special, skipCaches) {

	var cacheMods = [];
	var bestMod;
	if (special === undefined || special === 'undefined') return '0';

	if (special === 'lsc') cacheMods = ['lsc', 'hc', 'ssc', 'lc'];
	else if (special === 'lwc') cacheMods = ['lwc', 'hc', 'swc', 'lc'];
	else if (special === 'lmc') cacheMods = ['lmc', 'hc', 'smc', 'lc'];
	else if (special === 'lrc') cacheMods = ['lrc', 'hc', 'src', 'lc'];
	else if (special === 'p') cacheMods = ['p', 'fa'];
	else cacheMods = [special];

	var hze = getHighestLevelCleared() + 1;
	var unlocksAt = game.global.universe === 2 ? 'unlocksAt2' : 'unlocksAt';

	for (var mod of cacheMods) {
		if (typeof mapSpecialModifierConfig[mod] === 'undefined') continue;
		if ((mod === 'lmc' || mod === 'smc') && challengeActive('Transmute')) mod = mod.charAt(0) + "wc";
		if (skipCaches && mod === 'hc') continue;
		var unlock = mapSpecialModifierConfig[mod].name.includes('Research') ? mapSpecialModifierConfig[mod].unlocksAt2() : mapSpecialModifierConfig[mod][unlocksAt];
		if (unlock <= hze) {
			bestMod = mod;
			break;
		}
	}
	if (bestMod === undefined || bestMod === 'fa' && trimpStats.hyperspeed) bestMod = '0';
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
	document.getElementById('advExtraLevelSelect').value = pluslevel;
	document.getElementById('advSpecialSelect').value = special;
	document.getElementById("lootAdvMapsRange").value = mapSliders[0];
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
		//Reduce map difficulty
		while (difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned)
			difficultyAdvMapsRange.value -= 1;

		//Reduce map loot 
		while (lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned)
			lootAdvMapsRange.value -= 1;

		//Set biome to random if we have jestimps/caches we can run since size will be by far the most important that way
		if (!trimpStats.mountainPriority && updateMapCost(true) > game.resources.fragments.owned && !challengeActive('Metal'))
			document.getElementById('biomeAdvMapsSelect').value = "Random";

		if (updateMapCost(true) > game.resources.fragments.owned && (special === '0' || !mapSpecialModifierConfig[special].name.includes('Cache')))
			document.getElementById('advSpecialSelect').value = 0;

		//Reduce map size
		while (sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned)
			sizeAdvMapsRange.value -= 1;

		if (updateMapCost(true) > game.resources.fragments.owned)
			document.getElementById('advSpecialSelect').value = 0;

		if (trimpStats.mountainPriority && updateMapCost(true) > game.resources.fragments.owned && !challengeActive('Metal')) {
			document.getElementById('biomeAdvMapsSelect').value = "Random";
			updateMapCost();
		}
	}

	return updateMapCost(true);
}

function minMapFrag(level, specialModifier, biome, sliders) {

	if (!sliders) sliders = [9, 9, 9];
	var perfect = true;
	if (game.resources.fragments.owned < mapCost(level, specialModifier, biome)) {
		perfect = false;

		while (sliders[0] > 0 && sliders[2] > 0 && mapCost(level, specialModifier, biome, sliders, perfect) > game.resources.fragments.owned) {
			sliders[0] -= 1;
			if (mapCost(level, specialModifier, biome, sliders, perfect) <= game.resources.fragments.owned) break;
			sliders[2] -= 1;
		}
	}

	return mapCost(level, specialModifier, biome, sliders, perfect);
}

function mapCost(plusLevel, specialModifier, biome, sliders = [9, 9, 9], perfect = true) {
	if (!specialModifier) specialModifier = getAvailableSpecials('lmc');
	if (!plusLevel && plusLevel !== 0) plusLevel = 0;
	if (!biome) biome = getBiome();
	var specialModifier = specialModifier;
	var plusLevel = plusLevel;
	var baseCost = 0;
	//All sliders at 9
	baseCost += sliders[0];
	baseCost += sliders[1];
	baseCost += sliders[2];
	var mapLevel = game.global.world;
	//Check for negative map levels
	if (plusLevel < 0)
		mapLevel = mapLevel + plusLevel;
	//If map level we're checking is below level 6 (the minimum) then set it to 6
	if (mapLevel < 6)
		mapLevel = 6;
	//Post broken planet check
	baseCost *= (game.global.world >= 60) ? 0.74 : 1;
	//Perfect checked
	if (perfect && sliders.reduce(function (a, b) { return a + b; }, 0) === 27) baseCost += 6;
	//Adding in plusLevels
	if (plusLevel > 0)
		baseCost += (plusLevel * 10)
	//Special modifier
	if (specialModifier !== '0')
		baseCost += mapSpecialModifierConfig[specialModifier].costIncrease;
	baseCost += mapLevel;
	baseCost = Math.floor((((baseCost / 150) * (Math.pow(1.14, baseCost - 1))) * mapLevel * 2) * Math.pow((1.03 + (mapLevel / 50000)), mapLevel));
	baseCost *= biome !== 'Random' ? 2 : 1;
	return baseCost;
}

//Checks to see if the line from the settings should run
function settingShouldRun(currSetting, world, zoneReduction, settingName) {
	if (!currSetting) return false;
	if (!world) return false;
	if (!zoneReduction) zoneReduction = 0;
	world += zoneReduction;
	//Skips if line isn't active then skips
	if (!currSetting.active) return false;
	//If world input is greater than current zone then skips
	if (game.global.world < world) return false;
	//Skips if repeat every is set to 0 and the world is greater than the current world.
	if (game.global.world > world && currSetting.repeatevery === 0) return false;
	//Skips if repeat every is set to 0 and the world is greater than the current world.
	if (typeof currSetting.repeatevery === 'undefined' && typeof currSetting.repeat === 'undefined' && typeof currSetting.hdType === 'undefined' && typeof currSetting.voidHDRatio === 'undefined' && game.global.world > world) return false;

	//If the setting is marked as done then skips.
	var totalPortals = getTotalPortals();
	var value = game.global.universe === 2 ? 'valueU2' : 'value';
	if (settingName && currSetting.row) {
		var settingDone = game.global.addonUser[settingName][value][currSetting.row].done;
		if (settingDone === totalPortals + "_" + game.global.world) return false;

		//Ensure we don't eternally farm if daily reset timer is low enough that it will start again next zone
		//Checks against current portal counter to see if it has already been run this portal.
		if (typeof currSetting.mapType !== 'undefined' && currSetting.mapType === 'Daily Reset')
			if (settingDone && settingDone.split('_')[0] === totalPortals.toString()) return false;
	}

	//Skips if past designated end zone
	if (game.global.world > currSetting.endzone + zoneReduction) return false;
	//Skips if past designated max void zone
	if (typeof currSetting.maxvoidzone !== 'undefined' && game.global.world > (currSetting.maxvoidzone + zoneReduction)) return false;
	if (typeof currSetting.bonebelow !== 'undefined' && game.permaBoneBonuses.boosts.charges <= currSetting.bonebelow) return false;
	//Check to see if the cell is liquified and if so we can replace the cell condition with it
	var liquified = game.global.lastClearedCell === -1 && game.global.gridArray && game.global.gridArray[0] && game.global.gridArray[0].name === "Liquimp";
	//If cell input is greater than current zone then skips
	if (!liquified && game.global.lastClearedCell + 2 < currSetting.cell) return false;
	//Skips if challenge type isn't set to the type we're currently running or if it's not the challenge that's being run.
	if (typeof currSetting.runType !== 'undefined' && currSetting.runType !== 'All') {
		//Dailies
		if (trimpStats.isDaily) {
			if (currSetting.runType !== 'Daily') return false;
		}
		//C2/C3 runs + special challenges
		else if (trimpStats.isC3) {
			if (currSetting.runType !== 'C3') return false;
			else if (currSetting.challenge3 !== 'All' && !challengeActive(currSetting.challenge3)) return false;
		}
		//Fillers (non-daily/c2/c3)
		else {
			if (currSetting.runType !== 'Filler') return false;
			var currChallenge = currSetting.challenge === 'No Challenge' ? '' : currSetting.challenge;
			if (currSetting.challenge !== 'All' && !challengeActive(currChallenge)) return false;
		}
	}

	return true;
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

	if (mapSettings.voidFarm)
		MODULES.mapFunctions.hasVoidFarmed = (totalPortals + "_" + game.global.world);

	if (setting && setting.hitsSurvivedFarm)
		MODULES.mapFunctions.hasHealthFarmed = (totalPortals + "_" + game.global.world);

	if (setting && settingName && setting.row) {
		var value = game.global.universe === 2 ? 'valueU2' : 'value';
		game.global.addonUser[settingName][value][setting.row].done = (totalPortals + "_" + game.global.world);
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
		var mapProg = game.global.mapsActive ? ((getCurrentMapCell().level - 1) / getCurrentMapObject().size) : 0;
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
		message += (mapName + ' (z' + game.global.world + 'c' + currCell + ') took ' + (mappingLength) + ' (' + (mapLevel >= 0 ? '+' : '') + mapLevel + ' ' + mapSpecial + ')' + (mappingLength === 1 ? ' map' : ' maps') + ' and ' + formatTimeForDescriptions(timeMapping) + '.');
	}
	else if (mapName === 'Smithy Farm') {
		message += (mapName + ' (z' + game.global.world + 'c' + currCell + ') took ' + MODULES.maps.mapRepeatsSmithy[0] + ' food, ' + MODULES.maps.mapRepeatsSmithy[2] + ' metal, ' + MODULES.maps.mapRepeatsSmithy[1] + ' wood (' + (mapLevel >= 0 ? '+' : '') + mapLevel + ')' + ' maps and ' + formatTimeForDescriptions(timeMapping) + '.');
	}
	else if (mapName === 'Quagmire Farm') {
		message += (mapName + ' (z' + game.global.world + 'c' + currCell + ') took ' + (mappingLength) + (mappingLength === 1 ? ' map' : ' maps') + ' and ' + formatTimeForDescriptions(timeMapping) + '.');
	}
	else {
		message += (mapName + ' (z' + game.global.world + 'c' + currCell + ') took ' + formatTimeForDescriptions(timeMapping) + '.');
	}

	if (mapName === 'Void Map') {
		var hdObject = {
			'World HD Ratio': hdStats.hdRatio,
			'Map HD Ratio': hdStats.hdRatioMap,
			'Void HD Ratio': hdStats.hdRatioVoid,
			'Hits Survived': hdStats.hitsSurvived,
			'Hits Survived Void': hdStats.hitsSurvivedVoid,
			'Map Level': hdStats.autoLevel,
		};
		message += ' Void maps were triggered by ' + mapSettings.voidTrigger + '.<br>\n\
		' + (mapSettings.dropdown ? (mapSettings.dropdown.name + ' \
		(Start: ' + prettify(mapSettings.dropdown.hdRatio) + ' | \
		End: ' + prettify(hdObject[mapSettings.dropdown.name]) + ')<br>\n\
		'+ mapSettings.dropdown2.name + ' \
		(Start: ' + prettify(mapSettings.dropdown2.hdRatio) + ' | \
		End: ' + prettify(hdObject[mapSettings.dropdown2.name])) : '') + ').';
	}
	else if (mapName === 'Hits Survived')
		message += ' Finished with hits survived at  ' + prettify(whichHitsSurvived()) + '/' + targetHitsSurvived() + '.';
	else if (mapName === 'HD Farm' && extra !== null)
		message += ' Finished with a HD Ratio of ' + extra.toFixed(2) + '/' + extra2.toFixed(2) + '.';
	else if (mapName === 'HD Farm')
		message += ' Finished with an auto level of ' + (hdStats.autoLevel > 0 ? '+' : '') + hdStats.autoLevel + '.';
	else if (mapName === 'Tribute Farm')
		message += ' Finished with ' + game.buildings.Tribute.purchased + ' tributes and ' + game.jobs.Meteorologist.owned + ' meteorologists.';
	else if (mapName === 'Smithy Farm')
		message += ' Finished with ' + game.buildings.Smithy.purchased + ' smithies.';
	else if (mapName === 'Insanity Farm')
		message += ' Finished with ' + game.challenges.Insanity.insanity + ' stacks.';
	else if (mapName === 'Alchemy Farm')
		message += ' Finished with ' + extra + ' ' + extra2 + '.';
	else if (mapName === 'Hypothermia Farm')
		message += ' Finished with (' + prettify(game.resources.wood.owned) + '/' + prettify(extra.toFixed(2)) + ') wood.';
	else if (mapName === 'Smithless Farm')
		message += ' Finished with enough damage to get ' + extra + '/3 stacks.';
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
				if (!game.global.repeatMap)
					repeatClicked();
				if (game.options.menu.repeatUntil.enabled !== 0) {
					game.options.menu.repeatUntil.enabled = 0;
					toggleSetting('repeatUntil', null, false, true);
				}
			}
			else {
				debug('Not enough fragments to purchase fragment farming map. Waiting for fragments. If you don\'t have explorers then you will have to manually disable auto maps and continue.', 'maps');
			}
		}
	}
}

//Prestige Raiding
//Checks if map we want to run has equips
function prestigeMapHasEquips(number, raidzones, targetPrestige) {
	if (prestigesToGet((raidzones - number), targetPrestige)[0] > 0) return true;
	return false;
}

//Get raid zone based on skipping map levels above x5 if we have scientist4 or microchip4. Will subtract 5 from the map level to account for this.
function getRaidZone(raidZone) {
	if (getSLevel() >= 4 && !challengeActive('Mapology')) {
		var levelsToSkip = [0, 9, 8, 7, 6];
		if (levelsToSkip.includes((raidZone).toString().slice(-1))) raidZone = raidZone - 5;
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
		if (mapCost(raidZone, special, biome, sliders, perfect) > fragmentsOwned)
			perfect = false;
		//Remove biome
		if (mapCost(raidZone, special, biome, sliders, perfect) > fragmentsOwned)
			biome = 'Random';

		//Reduce map loot
		while (sliders[0] > 0 && mapCost(raidZone, special, biome, sliders, perfect) > fragmentsOwned)
			sliders[0] -= 1;
		//Reduce map difficulty
		while (sliders[2] > 0 && mapCost(raidZone, special, biome, sliders, perfect) > fragmentsOwned)
			sliders[2] -= 1;
		//Remove map special if one is set. Removing FA/P here is better than dropping Size as that can more than double increase the length of the maps we run.
		if (mapCost(raidZone, special, biome, sliders, perfect) > fragmentsOwned)
			special = '0';
		//Reduce map size
		while (sliders[1] > 0 && mapCost(raidZone, special, biome, sliders, perfect) > fragmentsOwned)
			sliders[1] -= 1;
	}

	return [raidZone, special, biome, sliders, perfect];
}

//Identify total cost of prestige raiding maps
function prestigeTotalFragCost() {
	var cost = 0;
	var sliders = new Array(5);
	var fragmentPercentage = mapSettings.incrementMaps ? calcFragmentPercentage(mapSettings.raidzones) : 1;

	if (prestigesToGet(mapSettings.raidzones, mapSettings.prestigeGoal)[0]) {
		sliders[0] = (prestigeRaidingSliderCost(mapSettings.raidzones, mapSettings.special, cost, fragmentPercentage));
		cost += mapCost(sliders[0][0], sliders[0][1], sliders[0][2], sliders[0][3], sliders[0][4]);
	}
	if (mapSettings.incrementMaps) {
		for (var i = 1; i < 5; i += 1) {
			if (prestigesToGet(mapSettings.raidzones - i, mapSettings.prestigeGoal)[0]) {
				sliders[i] = (prestigeRaidingSliderCost(mapSettings.raidzones - i, mapSettings.special, cost, calcFragmentPercentage(mapSettings.raidzones - i)));
				cost += mapCost(sliders[i][0], sliders[i][1], sliders[i][2], sliders[i][3], sliders[i][4]);
			}
			else break;
		}
	}

	return {
		'cost': cost,
		'sliders': sliders
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
				dailyReductionTemp = settingsArray[item].zone
			}
			if (dailyReduction > dailyReductionTemp) dailyReduction = dailyReductionTemp;
		}
	}
	return dailyReduction
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
		remainder: 0,
	}
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
		}
		else if (skipDetails.slipType === 'odd') {
			skipDetails.oddMult = 0;
		}
	} //If we don't have a dodge daily then skip on odd zones. Farm on even zones.
	else if (skipDetails.evenMult !== 1) {
		skipDetails.oddMult = 0;
	}

	if (skipDetails.evenMult < 1) {
		if (game.global.world % 2 === 0)
			skipDetails.skipZone = true;
	} else if (skipDetails.oddMult < 1) {
		if (game.global.world % 2 === 1)
			skipDetails.skipZone = true;
		skipDetails.remainder = 1;
	}
	skipDetails.active = true;
	return skipDetails;
}

//I hope I never use this again. Scumming for slow map enemies!
function mapScumming(slowTarget) {

	if (!game.global.mapsActive) return;
	if (game.global.lastClearedMapCell > -1) return;
	if (!atSettings.running) return;
	console.time();
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
			}
			else if (!MODULES.fightinfo.fastImps.includes(mapGrid[item].name)) {
				slowCount++;
			}
		}

		//Checking if the first enemy is slow
		var enemyName = mapGrid[0].name;
		if (trimpStats.currChallenge === 'Desolation') {
			if (MODULES.fightinfo.exoticImps.includes(enemyName)) firstCellSlow = true;
		}
		else if (!MODULES.fightinfo.fastImps.includes(enemyName)) firstCellSlow = true;

		if (slowCount < slowCellTarget || !firstCellSlow) {
			buildMapGrid(game.global.currentMapId);
			game.global.mapRunCounter = 0;
		}
		else
			break
		i++;
	}
	var msg = '';
	if (slowCount < slowCellTarget || !firstCellSlow) msg = 'Failed. ';
	msg += i + ' Rerolls. Current roll = ' + slowCount + ' odd slow enemies.';
	console.timeEnd();
	atSettings.running = true;
	debug(msg, 'mapping_Details');
}