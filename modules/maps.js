//Helium

MODULES.maps = {};
MODULES.maps.numHitsSurvived = 8;
MODULES.maps.LeadfarmingCutoff = 10;
MODULES.maps.NomfarmingCutoff = 10;
MODULES.maps.NomFarmStacksCutoff = [7, 30, 100];
MODULES.maps.MapTierZone = [72, 47, 16];
MODULES.maps.MapTier0Sliders = [9, 9, 9, "Mountain"];
MODULES.maps.MapTier1Sliders = [9, 9, 9, "Depths"];
MODULES.maps.MapTier2Sliders = [9, 9, 9, "Random"];
MODULES.maps.MapTier3Sliders = [9, 9, 9, "Random"];
MODULES.maps.preferGardens = !getPageSetting("PreferMetal");
MODULES.maps.SpireFarm199Maps = !0;
MODULES.maps.shouldFarmCell = 59;
MODULES.maps.SkipNumUnboughtPrestiges = 2;
MODULES.maps.UnearnedPrestigesRequired = 2;

var doVoids = !1;
var needToVoid = !1;
var skippedPrestige = !1;
var shouldDoMaps = !1;
var mapTimeEstimate = 0;
var lastMapWeWereIn = null;
var preSpireFarming = !1;
var spireMapBonusFarming = !1;
var spireTime = 0;
var doMaxMapBonus = !1;
var rVanillaMAZ = false;
var additionalCritMulti = 2 < getPlayerCritChance() ? 25 : 5;

function updateAutoMapsStatus(get) {

	var status;
	var minSp = getPageSetting('MinutestoFarmBeforeSpire');

	//Fail Safes
	if (getPageSetting('AutoMaps') == 0) status = 'Off';
	else if (game.global.challengeActive == "Mapology" && game.challenges.Mapology.credits < 1) status = 'Out of Map Credits';

	//Spire
	else if (preSpireFarming) {
		var secs = Math.floor(60 - (spireTime * 60) % 60).toFixed(0);
		var mins = Math.floor(minSp - spireTime).toFixed(0);
		var hours = ((minSp - spireTime) / 60).toFixed(2);
		var spiretimeStr = (minSp - spireTime >= 60) ?
			(hours + 'h') : (mins + 'm:' + (secs >= 10 ? secs : ('0' + secs)) + 's');
		status = 'Farming for Spire ' + spiretimeStr + ' left';
	}

	else if (spireMapBonusFarming) status = 'Getting Spire Map Bonus';
	else if (getPageSetting('SkipSpires') == 1 && ((game.global.challengeActive != 'Daily' && isActiveSpireAT()) || (game.global.challengeActive === 'Daily' && disActiveSpireAT()))) status = 'Skipping Spire';
	else if (doMaxMapBonus) status = 'Max Map Bonus After Zone';
	else if (!game.global.mapsUnlocked) status = 'Maps not unlocked!';
	else if (doVoids) {
		var stackedMaps = Fluffy.isRewardActive('void') ? countStackedVoidMaps() : 0;
		status = 'Void Maps: ' + game.global.totalVoidMaps + ((stackedMaps) ? " (" + stackedMaps + " stacked)" : "") + ' remaining';
	}
	else if (rCurrentMap !== '') {
		status = rMapSettings.status;
	}
	else if (shouldFarm && !doVoids) status = 'Farming: ' + calcHDratio().toFixed(4) + 'x';
	else if (!enoughHealth && !enoughDamage) status = 'Want Health & Damage';
	else if (!enoughDamage) status = 'Want ' + calcHDratio().toFixed(4) + 'x &nbspmore damage';
	else if (!enoughHealth) status = 'Want more health';
	else if (enoughHealth && enoughDamage) status = 'Advancing';

	//hider he/hr% status
	var getPercent = (game.stats.heliumHour.value() / (game.global.totalHeliumEarned - (game.global.heliumLeftover + game.resources.helium.owned))) * 100;
	var lifetime = (game.resources.helium.owned / (game.global.totalHeliumEarned - game.resources.helium.owned)) * 100;
	var hiderStatus = 'He/hr: ' + getPercent.toFixed(3) + '%<br>&nbsp;&nbsp;&nbsp;He: ' + lifetime.toFixed(3) + '%';

	if (get) {
		return [status, getPercent, lifetime];
	} else {
		document.getElementById('autoMapStatus').innerHTML = status;
		document.getElementById('hiderStatus').innerHTML = hiderStatus;
		game.global.universe === 1 ? document.getElementById('freeVoidMap').innerHTML = "Free void: " + (game.permaBoneBonuses.voidMaps.owned === 10 ? Math.floor(game.permaBoneBonuses.voidMaps.tracker / 10) : game.permaBoneBonuses.voidMaps.tracker / 10) + "/10" : ""
	}
}

MODULES["maps"].advSpecialMapMod_numZones = 3;
var advExtraMapLevels = 0;
function testMapSpecialModController() {
	var a = [];
	if (Object.keys(mapSpecialModifierConfig).forEach(function (o) {
		var p = mapSpecialModifierConfig[o];
		game.global.highestLevelCleared + 1 >= p.unlocksAt && a.push(p.abv.toLowerCase());
	}), !(1 > a.length)) {
		var c = document.getElementById("advSpecialSelect");
		if (c) {
			if (59 <= game.global.highestLevelCleared) {
				if (shouldFarm || !enoughHealth || preSpireFarming) {
					c.value = a.includes("lmc") ? "lmc" : a.includes("hc") ? "hc" : a.includes("smc") ? "smc" : "lc";
				} else c.value = "fa";
				for (var d = updateMapCost(!0), e = game.resources.fragments.owned, f = 100 * (d / e); 0 < c.selectedIndex && d > e;) {
					c.selectedIndex -= 1;
					"0" != c.value && console.log("Could not afford " + mapSpecialModifierConfig[c.value].name);
				}
				var d = updateMapCost(!0),
					e = game.resources.fragments.owned;
				"0" != c.value && debug("Set the map special modifier to: " + mapSpecialModifierConfig[c.value].name + ". Cost: " + (100 * (d / e)).toFixed(2) + "% of your fragments.");
			}
			var g = getSpecialModifierSetting(),
				h = 109 <= game.global.highestLevelCleared,
				i = checkPerfectChecked(),
				j = document.getElementById("advPerfectCheckbox"),
				k = getPageSetting("AdvMapSpecialModifier") ? getExtraMapLevels() : 0,
				l = 209 <= game.global.highestLevelCleared;
			if (l) {
				var m = document.getElementById("advExtraMapLevelselect");
				if (!m)
					return;
				var n = document.getElementById("mapLevelInput").value;
				for (m.selectedIndex = n == game.global.world ? MODULES.maps.advSpecialMapMod_numZones : 0; 0 < m.selectedIndex && updateMapCost(!0) > game.resources.fragments.owned;)
					m.selectedIndex -= 1;
			}
		}
	}
}

function runSelectedMap(mapId, madAdjective) {
	selectMap(mapId);
	runMap();
	if (RlastMapWeWereIn !== getCurrentMapObject()) {
		const map = game.global.mapsOwnedArray[getMapIndex(mapId)];
		debug(`Running ${madAdjective} map ${prettifyMap(map)}`, "maps", 'th-large');
		RlastMapWeWereIn = getCurrentMapObject();
	}
}

function autoMap() {

	//Failsafes
	if (!game.global.mapsUnlocked || calcOurDmg("avg", false, true) <= 0) {
		enoughDamage = true;
		enoughHealth = true;
		shouldFarm = false;
		return;
	}

	//No Mapology Credits
	if (game.global.challengeActive === "Mapology" && game.challenges.Mapology.credits < 1) {
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
	const challSQ = game.global.runningChallengeSquared;

	//Reset to defaults when on world grid
	if (!game.global.mapsActive && !game.global.preMapsActive) {
		game.global.mapRunCounter = 0;
		currTime = 0;
		if (game.global.repeatMap) repeatClicked();
		if (game.global.selectedMapPreset >= 4) game.global.selectedMapPreset = 1;
		if (document.getElementById('advExtraLevelSelect').value > 0)
			document.getElementById('advExtraLevelSelect').value = "0";
		runningPrestigeMaps = false;
	}

	//New Mapping Organisation!
	rShouldMap = rMapSettings.shouldRun;
	rCurrentMap = rShouldMap ? rMapSettings.mapName : '';
	rAutoLevel = rMapSettings.autoLevel ? rMapSettings.mapLevel : Infinity;

	if (game.global.spireActive) {
		enemyDamage = calcSpire(99, game.global.gridArray[99].name, 'attack');
	}

	//Automaps -- Map Creation
	if (shouldDoMaps || doVoids || rShouldMap) {
		if (selectedMap == "world") {
			if (rCurrentMap !== '') {
				mapBiome = rMapSettings.biome !== undefined ? rMapSettings.biome : game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountain";
				if (rCurrentMap === 'rPrestige') selectedMap = "createp";
				if (rCurrentMap === 'BionicRaiding') selectedMap = "bwraid";
				else selectedMap = RShouldFarmMapCreation(rMapSettings.mapLevel, rMapSettings.special, mapBiome);
				if (currTime === 0) currTime = getGameTime();
			} else
				selectedMap = "create";
		}
	}

	//Map Repeat
	if (!game.global.preMapsActive && game.global.mapsActive) {
		if ((selectedMap == game.global.currentMapId || (!getCurrentMapObject().noRecycle && (doMaxMapBonus || shouldFarm || shouldDoSpireMaps || rShouldMap)) || rCurrentMap === 'BionicRaiding')) {
			if (!game.global.repeatMap) {
				repeatClicked();
			}
			if (rShouldMap && ((rCurrentMap === 'rPrestige' && !RAMPfragfarming) || rCurrentMap === 'BionicRaiding')) {
				if (game.options.menu.repeatUntil.enabled != 2)
					game.options.menu.repeatUntil.enabled = 2;
			} else if (game.options.menu.repeatUntil.enabled != 0) {
				game.options.menu.repeatUntil.enabled = 0;
			}
			else if (game.global.repeatMap && rCurrentMap !== 'rPrestige' && rCurrentMap !== 'BionicRaiding') {
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
		if (selectedMap != "world") {
			if (!game.global.switchToMaps) {
				mapsClicked();
			}
			if ((!getPageSetting('PowerSaving') || (getPageSetting('PowerSaving') == 2) && doVoids) && game.global.switchToMaps &&
				(doVoids ||
					((game.global.challengeActive === 'Lead' && !challSQ) && game.global.world % 2 == 1) ||
					(!enoughDamage && enoughHealth && game.global.lastClearedCell < 9) ||
					(shouldFarm && game.global.lastClearedCell >= MODULES["maps"].shouldFarmCell)) &&
				(
					(game.resources.trimps.realMax() <= game.resources.trimps.owned + 1) ||
					((game.global.challengeActive === 'Lead' && !challSQ) && game.global.lastClearedCell > 93) ||
					(doVoids && game.global.lastClearedCell > 70)
				)
			) {
				mapsClicked();
			}
		}
	} else if (game.global.preMapsActive) {
		if (selectedMap == "world") {
			mapsClicked();
		} else if (selectedMap == "createp") {
			rRunRaid();
		} else if (selectedMap == "bwraid") {
			runBionicRaiding();
		} else if (selectedMap == "create") {
			var $mapLevelInput = document.getElementById("mapLevelInput");
			$mapLevelInput.value = siphlvl;
			if (preSpireFarming && MODULES["maps"].SpireFarm199Maps)
				$mapLevelInput.value = game.talents.mapLoot.purchased ? game.global.world - 1 : game.global.world;
			var decrement;
			var tier;
			if (game.global.world >= MODULES["maps"].MapTierZone[0]) {
				tier = MODULES["maps"].MapTier0Sliders;
				decrement = [];
			} else if (game.global.world >= MODULES["maps"].MapTierZone[1]) {
				tier = MODULES["maps"].MapTier1Sliders;
				decrement = ['loot'];
			} else if (game.global.world >= MODULES["maps"].MapTierZone[2]) {
				tier = MODULES["maps"].MapTier2Sliders;
				decrement = ['loot'];
			} else {
				tier = MODULES["maps"].MapTier3Sliders;
				decrement = ['diff', 'loot'];
			}
			sizeAdvMapsRange.value = tier[0];
			adjustMap('size', tier[0]);
			difficultyAdvMapsRange.value = tier[1];
			adjustMap('difficulty', tier[1]);
			lootAdvMapsRange.value = tier[2];
			adjustMap('loot', tier[2]);
			biomeAdvMapsSelect.value = autoTrimpSettings.mapselection.selected == "Gardens" ? "Plentiful" : autoTrimpSettings.mapselection.selected;
			updateMapCost();
			if (shouldFarm || game.global.challengeActive === 'Metal') {
				biomeAdvMapsSelect.value = game.global.decayDone ? "Plentiful" : "Mountain";
				updateMapCost();
			}
			if (updateMapCost(true) > game.resources.fragments.owned) {
				if (shouldFarm) decrement.push('size');
			}
			//Setting sliders appropriately. --- ITS ALREADY PRESTIGE RAIDING HERE
			if (rShouldMap) {
				mapBiome = rMapSettings.biome !== undefined ? rMapSettings.biome : game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountain";
				if (rCurrentMap !== '') {
					if (rMapSettings.autoLevel) PerfectMapCost(rMapSettings.mapLevel, rMapSettings.special, mapBiome);
					else RShouldFarmMapCost(rMapSettings.mapLevel, rMapSettings.special, mapBiome);
				}
			}
			while (decrement.indexOf('loot') > -1 && lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				lootAdvMapsRange.value -= 1;
			}
			while (decrement.indexOf('diff') > -1 && difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				difficultyAdvMapsRange.value -= 1;
			}
			while (decrement.indexOf('size') > -1 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				sizeAdvMapsRange.value -= 1;
			}
			while (lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				lootAdvMapsRange.value -= 1;
			}
			while (difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				difficultyAdvMapsRange.value -= 1;
			}
			while (sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				sizeAdvMapsRange.value -= 1;
			}
			if (rCurrentMap === '' && getPageSetting('AdvMapSpecialModifier'))
				testMapSpecialModController();
			const mapToRecycleIfBuyingFails = lowestMap;
			var maplvlpicked = parseInt($mapLevelInput.value);
			if (highestMap !== null && updateMapCost(true) > game.resources.fragments.owned) {
				debug("Can't afford the map we designed, #" + maplvlpicked, "maps", '*crying2');
				rFragmentFarm();
				//debug("...selected our highest map instead # " + highestMap.id + " Level: " + highestMap.level, "maps", '*happy2');
				//runSelectedMap(highestMap.id, 'highest');
				lastMapWeWereIn = getCurrentMapObject();
			} else {
				debug("Buying a Map, level: #" + maplvlpicked, "maps", 'th-large');
				var result = buyMap();
				if (result == -2) {
					debug("Too many maps, recycling now: ", "maps", 'th-large');
					recycleBelow(true);
					debug("Retrying, Buying a Map, level: #" + maplvlpicked, "maps", 'th-large');
					result = buyMap();
					if (result == -2) {
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
			var levelText = " Level: " + themapobj.level;
			var voidorLevelText = themapobj.location == "Void" ? " Void: " : levelText;
			debug("Running selected " + selectedMap + voidorLevelText + " Name: " + themapobj.name, "maps", 'th-large');
			runMap();
			lastMapWeWereIn = getCurrentMapObject();
		}
	}
}

//General
var RlastMapWeWereIn = null;
var rVanillaMAZ = false;
var currTime = 0;
//Fragment Farming
var rFragmentFarming = false;

//Prestige
var RAMPfragfarming = false;
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

MODULES.maps.fragmentFarming = false;

if (getAutoStructureSetting().enabled) {
	document.getElementById('autoStructureBtn').classList.add("enabled")
}

function RupdateAutoMapsStatus(get) {

	var status;

	//Fail Safes 
	if (getPageSetting('RAutoMaps') == 0) status = 'Off';
	//Setting up status
	else if (!game.global.mapsUnlocked) status = 'Maps not unlocked!';
	else if (rVanillaMAZ) status = 'Vanilla MAZ';
	else if (game.global.mapsActive && getCurrentMapObject().name == 'Melting Point') status = 'Melting Point';
	else if (game.global.mapsActive && getCurrentMapObject().name == 'Atlantrimp') status = 'Atlantrimp';
	else if (game.global.mapsActive && getCurrentMapObject().name == 'Frozen Castle') status = 'Frozen Castle';
	else if (rCurrentMap !== '') status = rMapSettings.status;
	//Advancing
	else status = 'Advancing';

	var getPercent = (game.stats.heliumHour.value() / (game.global.totalRadonEarned - (game.global.radonLeftover + game.resources.radon.owned))) * 100;
	var lifetime = (game.resources.radon.owned / (game.global.totalRadonEarned - game.resources.radon.owned)) * 100;
	var hiderStatus = 'Rn/hr: ' + getPercent.toFixed(3) + '%<br>&nbsp;&nbsp;&nbsp;Rn: ' + lifetime.toFixed(3) + '%';

	if (get) {
		return [status, getPercent, lifetime];
	} else {
		document.getElementById('autoMapStatus').innerHTML = status;
		document.getElementById('hiderStatus').innerHTML = hiderStatus;
	}
}

function RautoMap() {
	//Stops maps from running while doing Atlantrimp.
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
	rVanillaMAZ = false;
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
				rVanillaMAZ = true;
				if (setZone[x].until == 6) game.global.mapCounterGoal = 25;
				if (setZone[x].until == 7) game.global.mapCounterGoal = 50;
				if (setZone[x].until == 8) game.global.mapCounterGoal = 100;
				if (setZone[x].until == 9) game.global.mapCounterGoal = setZone[x].rx;
				break;
			}
		}

		//Toggle void repeat on if it's disabled.
		if (rVanillaMAZ) {
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
		if ((selectedMap == game.global.currentMapId || (!getCurrentMapObject().noRecycle && rShouldMap))) {
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
				updateMapCost(true);
			}

			const maplvlpicked = parseInt(document.getElementById("mapLevelInput").value);
			const mappluslevel = maplvlpicked === game.global.world && document.getElementById("advExtraLevelSelect").value > 0 ? parseInt(document.getElementById("advExtraLevelSelect").value) : "";
			const mapspecial = document.getElementById("advSpecialSelect").value === '0' ? 'No special' : document.getElementById("advSpecialSelect").value;
			if (highestMap !== null && updateMapCost(true) > game.resources.fragments.owned) {
				debug("Can't afford the map we designed, #" + maplvlpicked + (mappluslevel > 0 ? " +" + mappluslevel : "") + " " + mapspecial, "maps", 'th-large');

				rFragmentFarm();
				//debug("...selected our highest map instead # " + highestMap.id + " Level: " + highestMap.level, "maps", '*happy2');
				//runSelectedMap(highestMap.id, 'highest');
				RlastMapWeWereIn = getCurrentMapObject();
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
			RlastMapWeWereIn = getCurrentMapObject();
		}
	}
}
