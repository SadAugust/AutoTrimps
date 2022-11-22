
//Mapping Variables
MODULES.maps = {};
MODULES.maps.fragmentFarming = false;
var currTime = 0;
var lastMapWeWereIn = null;
//Prestige
var runningPrestigeMaps = false;

//Map Repeats! - Can prolly be consolidated into 1 setting???????
var rMFMapRepeats = 0;
var rTrFMapRepeats = 0;
var rSFMapRepeats = [0, 0, 0];
var smithyMapCount = [0, 0, 0];
var rWFMapRepeats = 0;
var rMBMapRepeats = 0;
var rMayhemMapRepeats = 0;
var rIFMapRepeats = 0;
var rPandemoniumMapRepeats = 0;
var rAFMapRepeats = 0;
var rHFMapRepeats = 0;
var rSmithlessMapRepeats = 0;
var rHDFMapRepeats = 0;

if (getAutoStructureSetting().enabled) {
	document.getElementById('autoStructureBtn').classList.add("enabled")
}

function updateAutoMapsStatus(get) {
	var status;

	//Fail Safes 
	if (game.global.universe === 1 ? getPageSetting('AutoMaps') == 0 : getPageSetting('RAutoMaps') == 0) status = 'Off';
	//Setting up status
	else if (!game.global.mapsUnlocked) status = 'Maps not unlocked!';
	else if (vanillaMAZ) status = 'Vanilla MAZ';
	else if (game.global.mapsActive && getCurrentMapObject().name == 'Trimple of Doom') status = 'Trimple of Doom';
	else if (game.global.mapsActive && getCurrentMapObject().name == 'Melting Point') status = 'Melting Point';
	else if (game.global.mapsActive && getCurrentMapObject().name == 'Atlantrimp') status = 'Atlantrimp';
	else if (game.global.mapsActive && getCurrentMapObject().name == 'Frozen Castle') status = 'Frozen Castle';
	else if (game.global.challengeActive == "Mapology" && game.challenges.Mapology.credits < 1) status = 'Out of Map Credits';
	else if (rCurrentMap !== '') status = rMapSettings.status;
	else if (getPageSetting('SkipSpires') == 1 && isDoingSpire()) status = 'Skipping Spire';
	//Advancing
	else status = 'Advancing';

	let resourceType = game.global.universe === 1 ? 'Helium' : 'Radon';
	let resourceShortened = game.global.universe === 1 ? 'He' : 'Rn';
	var getPercent = (game.stats.heliumHour.value() / (game.global['total' + resourceType + 'Earned'] - (game.global[resourceType.toLowerCase() + 'Leftover'] + game.resources[resourceType.toLowerCase()].owned))) * 100;
	var lifetime = (game.resources[resourceType.toLowerCase()].owned / (game.global['total' + resourceType + 'Earned'] - game.resources[resourceType.toLowerCase()].owned)) * 100;
	var hiderStatus = resourceShortened + '/hr: ' + getPercent.toFixed(3) + '%<br>&nbsp;&nbsp;&nbsp;' + resourceShortened + ': ' + lifetime.toFixed(3) + '%';

	if (get) {
		return [status, getPercent, lifetime];
	} else {
		document.getElementById('autoMapStatus').innerHTML = status;
		document.getElementById('hiderStatus').innerHTML = hiderStatus;
	}
}

function autoMap() {

	//Stops maps from running while doing Trimple of Doom or Atlantrimp.
	if (!game.mapUnlocks.AncientTreasure.canRunOnce) {
		rBSRunningAtlantrimp = false;
	}

	if (game.global.mapsActive && (getCurrentMapObject().name == 'Trimple of Doom' || getCurrentMapObject().name == 'Atlantrimp' || getCurrentMapObject().name == 'Melting Point' || getCurrentMapObject().name == 'Frozen Castle')) {
		if (game.global.repeatMap) repeatClicked();
		return;
	}

	//Failsafes
	if (!game.global.mapsUnlocked || RcalcOurDmg("avg", 0, 'world') <= 0 || questcheck() === 8 || questcheck() === 9) {
		if (game.global.preMapsActive)
			mapsClicked();
		return;
	}

	//No Mapology Credits
	if (game.global.challengeActive === "Mapology" && game.challenges.Mapology.credits < 1) {
		return;
	}

	//Stop maps from running if frag farming
	if (MODULES.maps.fragmentFarming) {
		rFragmentFarm();
		return;
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
	rShouldMap = rMapSettings.shouldRun;
	rCurrentMap = rShouldMap ? rMapSettings.mapName : '';
	rAutoLevel = rMapSettings.autoLevel ? rMapSettings.mapLevel : Infinity;

	//Farming & resetting variables.
	var dontRecycleMaps = game.global.challengeActive === 'Trappapalooza' || game.global.challengeActive === 'Archaeology' || game.global.challengeActive === 'Berserk' || game.portal.Frenzy.frenzyStarted !== -1;

	//Uniques
	let highestMap = null;
	let lowestMap = null;
	const runUniques = game.global.universe === 1 ? getPageSetting('AutoMaps') === 1 : getPageSetting('RAutoMaps') === 1;
	const bionicPool = [];
	let voidMap = null;
	let selectedMap = "world";

	for (const map of game.global.mapsOwnedArray) {
		if (!map.noRecycle) {
			if (!highestMap || map.level > highestMap.level) {
				highestMap = map;
			}
			if (!lowestMap || map.level < lowestMap.level) {
				lowestMap = map;
			}
		} else if (map.noRecycle && game.global.challengeActive != "Insanity") {
			if (runUniques && shouldRunUniqueMap(map)) {
				selectedMap = map.id;
			}
			if (map.location === "Bionic") {
				bionicPool.push(map);
			}
			if (map.location === 'Void' && rShouldMap && rCurrentMap === 'rVoidMap') {
				voidMap = selectEasierVoidMap(voidMap, map);
			}
		}
	}

	//Telling AT to create a map or setting void map as map to be run.
	if (selectedMap === 'world' && rShouldMap) {
		if (rCurrentMap !== '') {
			mapBiome = rMapSettings.biome !== undefined ? rMapSettings.biome : game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountain";
			if (voidMap) selectedMap = voidMap.id;
			else if (rCurrentMap === 'rPrestige') selectedMap = "prestigeRaid";
			else if (rCurrentMap === 'BionicRaiding') selectedMap = "bionicRaid";
			else selectedMap = RShouldFarmMapCreation(rMapSettings.mapLevel, rMapSettings.special, mapBiome);
			if (currTime === 0) currTime = getGameTime();
		}
	}

	//Map Repeat -- NEEDS REWRITTEN
	if (!game.global.preMapsActive && game.global.mapsActive) {
		//Swapping to LMC maps if we have 1 item left to get in current map - Needs special modifier unlock checks!
		if (rShouldMap && rCurrentMap === 'rPrestige' && !dontRecycleMaps && game.global.mapsActive && String(getCurrentMapObject().level).slice(-1) === '1' && Rgetequips(getCurrentMapObject().level) === 1 && getCurrentMapObject().bonus !== 'lmc' && game.resources.fragments.owned > PerfectMapCost(getCurrentMapObject().level - game.global.world, 'lmc')) {
			var maplevel = getCurrentMapObject().level
			mapsClicked();
			recycleMap();
			PerfectMapCost(maplevel - game.global.world, "lmc");
			buyMap();
			rRunMap();
			debug("Running LMC map due to only having 1 equip remaining on this map.")
		}
		if ((selectedMap == game.global.currentMapId || (!getCurrentMapObject().noRecycle && rShouldMap) || rCurrentMap === 'BionicRaiding')) {
			//Starting with repeat on
			if (!game.global.repeatMap)
				repeatClicked();
			//Changing repeat to repeat for items for Presitge & Bionic Raiding
			if (rShouldMap && ((rCurrentMap === 'rPrestige' && !RAMPfragfarming) || rCurrentMap === 'BionicRaiding')) {
				if (game.options.menu.repeatUntil.enabled != 2)
					game.options.menu.repeatUntil.enabled = 2;
			} else if (game.options.menu.repeatUntil.enabled != 0) {
				game.options.menu.repeatUntil.enabled = 0;
			}
			//Disabling repeat if we shouldn't map
			if (!rShouldMap)
				repeatClicked();
			//Disabling repeat if we'll beat Experience from the BW we're clearing.
			if (game.global.repeatMap && game.global.challengeActive === 'Experience' && getCurrentMapObject().location === 'Bionic' && game.global.world > 600 && getCurrentMapObject().level >= 605) {
				repeatClicked();
			}
			//Disabling repeat if repeat conditions have been met
			if (game.global.repeatMap && rCurrentMap !== 'rPrestige' && rCurrentMap !== 'BionicRaiding') {
				if (rCurrentMap !== '') {
					if (!rMapSettings.repeat) repeatClicked();
				}
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
			rRunRaid();
		} else if (selectedMap == "bionicRaid") {
			runBionicRaiding(bionicPool);
		} else if (selectedMap == "create") {
			//Setting sliders appropriately.
			if (rShouldMap) {
				mapBiome = rMapSettings.biome !== undefined ? rMapSettings.biome : game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountain";
				if (rCurrentMap !== '') {
					if (rMapSettings.autoLevel) PerfectMapCost(rMapSettings.mapLevel, rMapSettings.special, mapBiome);
					else RShouldFarmMapCost(rMapSettings.mapLevel, rMapSettings.special, mapBiome);
				}
			}

			const maplvlpicked = parseInt(document.getElementById("mapLevelInput").value);
			const mappluslevel = maplvlpicked === game.global.world && document.getElementById("advExtraLevelSelect").value > 0 ? parseInt(document.getElementById("advExtraLevelSelect").value) : "";
			const mapspecial = document.getElementById("advSpecialSelect").value === '0' ? 'No special' : document.getElementById("advSpecialSelect").value;
			if (highestMap !== null && updateMapCost(true) > game.resources.fragments.owned) {
				debug("Can't afford the map we designed, #" + maplvlpicked + (mappluslevel > 0 ? " +" + mappluslevel : "") + " " + mapspecial, "maps", 'th-large');
				rFragmentFarm();
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
