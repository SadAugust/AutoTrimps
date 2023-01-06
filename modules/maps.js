//Mapping Variables
MODULES.maps = {};
MODULES.maps.fragmentFarming = false;
MODULES.maps.lifeActive = false;
MODULES.maps.lifeCell = 0;

var currTime = 0;
var lastMapWeWereIn = null;
//Prestige
var runningPrestigeMaps = false;

//Map Repeats! - Can prolly be consolidated into 1 setting???????
var mapRepeats = 0;
var vanillaMAZ = false;

function runSelectedMap(mapId, madAdjective) {
	selectMap(mapId);
	runMap();
	if (lastMapWeWereIn !== getCurrentMapObject()) {
		const map = game.global.mapsOwnedArray[getMapIndex(mapId)];
		debug(`Running ${madAdjective} map ${prettifyMap(map)}`, "maps", 'th-large');
		lastMapWeWereIn = getCurrentMapObject();
	}
}

if (getAutoStructureSetting().enabled) {
	document.getElementById('autoStructureBtn').classList.add("enabled")
}

function updateAutoMapsStatus(get) {
	const universeInitial = game.global.universe === 2 ? 'R' : '';
	if (!getPageSetting(universeInitial + 'showautomapstatus')) return;
	var status;

	//Setting up status
	if (!game.global.mapsUnlocked) status = 'Maps not unlocked!';
	else if (vanillaMAZ) status = 'Vanilla MAZ';
	else if (game.global.mapsActive && getCurrentMapObject().noRecycle && getCurrentMapObject().location !== 'Bionic' && getCurrentMapObject().location !== 'Void' && (currentMap !== 'Quagmire Farm' && getCurrentMapObject().location !== 'Darkness')) status = getCurrentMapObject().name;
	else if (challengeActive('Mapology') && game.challenges.Mapology.credits < 1) status = 'Out of Map Credits';
	else if (currentMap !== '') status = rMapSettings.status;
	else if (getPageSetting('SkipSpires') == 1 && isDoingSpire()) status = 'Skipping Spire';
	//Advancing
	else status = 'Advancing';


	if (getPageSetting(universeInitial + 'AutoMaps') == 0) status = '[Off] ' + status;
	let resourceType = game.global.universe === 1 ? 'Helium' : 'Radon';
	let resourceShortened = game.global.universe === 1 ? 'He' : 'Rn';
	var getPercent = (game.stats.heliumHour.value() / (game.global['total' + resourceType + 'Earned'] - (game.global[resourceType.toLowerCase() + 'Leftover'] + game.resources[resourceType.toLowerCase()].owned))) * 100;
	var lifetime = (game.resources[resourceType.toLowerCase()].owned / (game.global['total' + resourceType + 'Earned'] - game.resources[resourceType.toLowerCase()].owned)) * 100;
	var hiderStatus = resourceShortened + '/hr: ' + (getPercent > 0 ? getPercent.toFixed(3) : 0) + '%<br>&nbsp;&nbsp;&nbsp;' + resourceShortened + ': ' + (lifetime > 0 ? lifetime.toFixed(3) : 0) + '%';

	if (get) {
		return [status, getPercent, lifetime];
	} else {
		document.getElementById('autoMapStatus').innerHTML = status;
		document.getElementById('hiderStatus').innerHTML = hiderStatus;
	}
}

function autoMap() {

	if (getPageSetting('sitInMaps') && game.global.world === getPageSetting('sitInMaps_Zone') && game.global.lastClearedCell + 2 >= getPageSetting('sitInMaps_Cell')) {
		if (!game.global.preMapsActive) mapsClicked();
		return;

	}

	const universeInitial = game.global.universe === 2 ? 'R' : '';
	if (!getPageSetting(universeInitial + 'AutoMaps') > 0 && game.global.mapsUnlocked) return;

	//Stops maps from running while doing Trimple Of Doom or Atlantrimp.
	if (!game.mapUnlocks.AncientTreasure.canRunOnce) {
		rBSRunningAtlantrimp = false;
	}

	if (game.global.mapsActive && getCurrentMapObject() !== undefined && (getCurrentMapObject().name === 'Trimple Of Doom' || getCurrentMapObject().name === 'Atlantrimp' || getCurrentMapObject().name === 'Melting Point' || getCurrentMapObject().name === 'Frozen Castle') || rBSRunningAtlantrimp) {
		if (game.global.repeatMap) repeatClicked();
		return;
	}

	//Failsafes
	if (!game.global.mapsUnlocked || calcOurDmg("avg", 0, false, 'world') <= 0 || currQuest() === 8 || currQuest() === 9) {
		if (game.global.preMapsActive) mapsClicked();
		return;
	}

	//No Mapology Credits
	if (challengeActive('Mapology') && game.challenges.Mapology.credits < 1) {
		if (game.global.preMapsActive) mapsClicked();
		return;
	}

	//Stop maps from running if frag farming
	if (MODULES.maps.fragmentFarming) {
		rFragmentFarm();
		return;
	}

	if (challengeActive('Life') && !game.global.mapsActive) {
		if (getPageSetting('life') && game.global.world >= getPageSetting('lifeZone') && game.challenges.Life.stacks < getPageSetting('lifeStacks')) {
			var currCell = game.global.world + "_" + (game.global.lastClearedCell + 1);
			if (!game.global.fighting && timeForFormatting(game.global.lastSoldierSentAt) >= 40) MODULES.maps.lifeCell = currCell;
			if (MODULES.maps.lifeCell !== currCell && game.global.gridArray[game.global.lastClearedCell + 1].health !== 0 && game.global.gridArray[game.global.lastClearedCell + 1].mutation === 'Living') {
				MODULES.maps.livingActive = true;
				if (game.global.fighting || game.global.preMapsActive)
					mapsClicked();
				return;
			}
		}
		MODULES.maps.livingActive = false;
	}

	//Vanilla Map at Zone
	vanillaMAZ = false;
	if (game.options.menu.mapAtZone.enabled && game.global.canMapAtZone) {
		var nextCell = game.global.lastClearedCell;
		if (nextCell == -1) nextCell = 1;
		else nextCell += 2;
		var totalPortals = getTotalPortals();
		let setZone = game.options.menu.mapAtZone.getSetZone();
		for (var x = 0; x < setZone.length; x++) {
			if (!setZone[x].on) continue;
			if (game.global.world < setZone[x].world || game.global.world > setZone[x].through) continue;
			if (game.global.preMapsActive && setZone[x].done == totalPortals + "_" + game.global.world + "_" + nextCell) continue;
			if (setZone[x].times === -1 && game.global.world !== setZone[x].world) continue;
			if (setZone[x].times > 0 && (game.global.world - setZone[x].world) % setZone[x].times !== 0) continue;
			if (setZone[x].cell === game.global.lastClearedCell + 2) {
				vanillaMAZ = true;
				if (setZone[x].until == 6) game.global.mapCounterGoal = 25;
				if (setZone[x].until == 7) game.global.mapCounterGoal = 50;
				if (setZone[x].until == 8) game.global.mapCounterGoal = 100;
				if (setZone[x].until == 9) game.global.mapCounterGoal = setZone[x].rx;
				break;
			}
		}

		//Toggle void repeat on if it's disabled.
		if (vanillaMAZ) {
			if (game.options.menu.repeatVoids.enabled != 1) toggleSetting('repeatVoids');
			return;
		}
	}

	//Reset to defaults
	while ([1, 2, 3].includes(game.options.menu.repeatUntil.enabled) && !game.global.mapsActive && !game.global.preMapsActive) {
		toggleSetting('repeatUntil');
	}
	if (game.options.menu.exitTo.enabled) {
		toggleSetting('exitTo');
	}
	if (game.options.menu.repeatVoids.enabled) {
		toggleSetting('repeatVoids');
	}

	//Reset to defaults when on world grid
	if (!game.global.mapsActive && !game.global.preMapsActive) {
		game.global.mapRunCounter = 0;
		currTime = 0;
		if (game.global.selectedMapPreset >= 4) game.global.selectedMapPreset = 1;
		if (document.getElementById('advExtraLevelSelect').value > 0)
			document.getElementById('advExtraLevelSelect').value = "0";
		runningPrestigeMaps = false;
	}

	//New Mapping Organisation!
	const rShouldMap = rMapSettings.shouldRun;
	currentMap = rShouldMap ? rMapSettings.mapName : '';
	rAutoLevel = rMapSettings.autoLevel ? rMapSettings.mapLevel : Infinity;

	//Farming & resetting variables.
	var dontRecycleMaps = challengeActive('Trappapalooza') || challengeActive('Archaeology') || challengeActive('Berserk') || game.portal.Frenzy.frenzyStarted !== -1 || !newArmyRdy();

	//Uniques
	let highestMap = null;
	let lowestMap = null;
	let optimalMap = null;
	const runUniques = game.global.universe === 1 ? getPageSetting('AutoMaps') === 1 : getPageSetting('RAutoMaps') === 1;
	const bionicPool = [];
	let voidMap = null;
	let selectedMap = "world";

	var perfSize = game.talents.mapLoot2.purchased ? 20 : 25;
	var perfMapLoot = game.global.farmlandsUnlocked && game.singleRunBonuses.goldMaps.owned ? 3.6 : game.global.decayDone && game.singleRunBonuses.goldMaps.owned ? 2.85 : game.global.farmlandsUnlocked ? 2.6 : game.global.decayDone ? 1.85 : 1.6;

	for (const map of game.global.mapsOwnedArray) {
		if (!map.noRecycle) {
			if (!highestMap || map.level > highestMap.level) {
				highestMap = map;
			}
			if (!optimalMap) {
				if ((rMapSettings.mapLevel + game.global.world) === map.level && rMapSettings.special === map.bonus && map.size === perfSize && map.difficulty === 0.75 && map.loot === perfMapLoot) {
					optimalMap = map;
				}
			}
			if (!lowestMap || map.level < lowestMap.level) {
				lowestMap = map;
			}
		} else if (map.noRecycle && !challengeActive('Insanity')) {
			if (runUniques && shouldRunUniqueMap(map)) {
				selectedMap = map.id;
				if (currTime === 0) currTime = getGameTime();
			}
			if (map.location === "Bionic") {
				bionicPool.push(map);
			}
			if (map.location === 'Void' && rShouldMap && currentMap === 'Void Map') {
				voidMap = selectEasierVoidMap(voidMap, map);
			}
		}
	}

	//Telling AT to create a map or setting void map as map to be run.
	if (selectedMap === 'world' && rShouldMap) {
		if (currentMap !== '') {
			mapBiome = rMapSettings.biome !== undefined ? rMapSettings.biome : game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountain";
			if (voidMap) selectedMap = voidMap.id;
			else if (optimalMap) selectedMap = optimalMap.id;
			else if (currentMap === 'rPrestige') selectedMap = "prestigeRaid";
			else if (currentMap === 'Bionic Raiding') selectedMap = "bionicRaid";
			else selectedMap = RShouldFarmMapCreation(rMapSettings.mapLevel, rMapSettings.special, mapBiome);
			if (currTime === 0) currTime = getGameTime();
		}
	}

	//Map Repeat
	if (!game.global.preMapsActive && game.global.mapsActive) {
		//Swapping to LMC maps if we have 1 item left to get in current map - Needs special modifier unlock checks!
		if (rShouldMap && currentMap === 'rPrestige' && !dontRecycleMaps && game.global.mapsActive && String(getCurrentMapObject().level).slice(-1) === '1' && equipsToGet(getCurrentMapObject().level) === 1 && getCurrentMapObject().bonus !== 'lmc' && game.resources.fragments.owned > PerfectMapCost(getCurrentMapObject().level - game.global.world, 'lmc')) {
			var maplevel = getCurrentMapObject().level
			mapsClicked();
			recycleMap();
			PerfectMapCost(maplevel - game.global.world, "lmc");
			buyMap();
			rRunMap();
			debug("Running LMC map due to only having 1 equip remaining on this map.")
		}
		if ((selectedMap == game.global.currentMapId || (!getCurrentMapObject().noRecycle && rShouldMap) || currentMap === 'Bionic Raiding')) {
			//Starting with repeat on
			if (!game.global.repeatMap)
				repeatClicked();
			//Changing repeat to repeat for items for Presitge & Bionic Raiding
			if (rShouldMap && ((currentMap === 'rPrestige' && !RAMPfragfarming) || currentMap === 'Bionic Raiding')) {
				if (game.options.menu.repeatUntil.enabled != 2)
					game.options.menu.repeatUntil.enabled = 2;
			} else if (game.options.menu.repeatUntil.enabled != 0) {
				game.options.menu.repeatUntil.enabled = 0;
			}
			//Disabling repeat if we shouldn't map
			if (!rShouldMap)
				repeatClicked();
			//Disabling repeat if we'll beat Experience from the BW we're clearing.
			if (game.global.repeatMap && challengeActive('Experience') && getCurrentMapObject().location === 'Bionic' && game.global.world > 600 && getCurrentMapObject().level >= 605) {
				repeatClicked();
			}
			//Disabling repeat if repeat conditions have been met
			if (game.global.repeatMap && currentMap !== '') {
				if (!rMapSettings.repeat) repeatClicked();
			}
		} else {
			if (game.global.repeatMap) {
				repeatClicked();
			}
		}
	} else if (!game.global.preMapsActive && !game.global.mapsActive) {
		//Going to map chamber. Will override default 'Auto Abandon' setting if AT wants to map!
		if (selectedMap != "world") {
			if (!game.global.switchToMaps) {
				mapsClicked();
			}
			const autoAbandon = getPageSetting('PowerSaving');
			if (game.global.switchToMaps && autoAbandon !== 1) {
				mapsClicked();
			}
		}
		//Creating Maps
	} else if (game.global.preMapsActive) {
		document.getElementById("mapLevelInput").value = game.global.world;
		if (selectedMap == "world") {
			mapsClicked();
		} else if (selectedMap == "prestigeRaid") {
			rRunRaid(rMapSettings);
		} else if (selectedMap == "bionicRaid") {
			runBionicRaiding(bionicPool);
		} else if (selectedMap == "create") {
			//Setting sliders appropriately.
			if (rShouldMap) {
				mapBiome = rMapSettings.biome !== undefined ? rMapSettings.biome : game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountain";
				if (currentMap !== '') {
					mapCost(rMapSettings.mapLevel, rMapSettings.special, mapBiome);
				}
			}

			const maplvlpicked = parseInt(document.getElementById("mapLevelInput").value);
			const mappluslevel = maplvlpicked === game.global.world && document.getElementById("advExtraLevelSelect").value > 0 ? parseInt(document.getElementById("advExtraLevelSelect").value) : "";
			const mapspecial = document.getElementById("advSpecialSelect").value === '0' ? 'No special' : document.getElementById("advSpecialSelect").value;
			if (highestMap !== null && updateMapCost(true) > game.resources.fragments.owned) {
				debug("Can't afford the map we designed, #" + maplvlpicked + (mappluslevel > 0 ? " +" + mappluslevel : "") + " " + mapspecial, "maps", 'th-large');
				if (!game.jobs.Explorer.locked) rFragmentFarm();
				else runSelectedMap(highestMap.id, 'highest');
				lastMapWeWereIn = getCurrentMapObject();
			} else {
				debug("Buying a Map, level: #" + maplvlpicked + (mappluslevel > 0 ? " +" + mappluslevel : "") + " " + mapspecial, "maps", 'th-large');
				if (getPageSetting('SpamFragments') && game.global.preMapsActive) {
					updateMapCost(true)
					debug("Spent " + prettify(updateMapCost(true)) + "/" + prettify(game.resources.fragments.owned) + " (" + ((updateMapCost(true) / game.resources.fragments.owned * 100).toFixed(2)) + "%) fragments on a " + (advExtraLevelSelect.value >= 0 ? "+" : "") + advExtraLevelSelect.value + " " + (advPerfectCheckbox.dataset.checked === 'true' ? "Perfect " : ("(" + lootAdvMapsRange.value + "," + sizeAdvMapsRange.value + "," + difficultyAdvMapsRange.value + ") ")) + advSpecialSelect.value + " map.")
				}
				var result = buyMap();
				if (result == -2) {
					debug("Too many maps, recycling now: ", "maps", 'th-large');
					recycleBelow(true);
					debug("Retrying, Buying a Map, level: #" + maplvlpicked + (mappluslevel > 0 ? " +" + mappluslevel : "") + " " + mapspecial, "maps", 'th-large');
					result = buyMap();
					if (result == -2) {
						const mapToRecycleIfBuyingFails = lowestMap;
						recycleMap(game.global.mapsOwnedArray.indexOf(mapToRecycleIfBuyingFails));
						result = buyMap();
						if (result == -2)
							debug("AutoMaps unable to recycle to buy map!");
						else
							debug("Retrying map buy after recycling lowest level map");
					}
				}
				if (result === 1) {
					runMap();
				}
			}
		} else {
			selectMap(selectedMap);
			var themapobj = game.global.mapsOwnedArray[getMapIndex(selectedMap)];
			var levelText;
			if (themapobj.level > 0) {
				levelText = " Level: " + themapobj.level;
			} else {
				levelText = " Level: " + game.global.world;
			}
			var voidorLevelText = themapobj.location == "Void" ? " Void: " : levelText;
			debug("Running selected " + selectedMap + voidorLevelText + " Name: " + themapobj.name, "maps", 'th-large');
			runMap();
			lastMapWeWereIn = getCurrentMapObject();
		}
	}
}
