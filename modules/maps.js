//Mapping Variables
MODULES.maps = {};
MODULES.maps.fragmentFarming = false;
MODULES.maps.lifeActive = false;
MODULES.maps.lifeCell = 0;

var mappingTime = 0;
var lastMapWeWereIn = null;

function runSelectedMap(mapId, madAdjective) {
	selectMap(mapId);
	runMap();
	if (lastMapWeWereIn !== getCurrentMapObject()) {
		const map = game.global.mapsOwnedArray[getMapIndex(mapId)];
		debug(`Running ${madAdjective} map ${prettifyMap(map)}`, "maps", 'th-large');
		lastMapWeWereIn = getCurrentMapObject();
	}
}

function updateAutoMapsStatus(get) {
	var status = '';

	//Setting up status
	if (!game.global.mapsUnlocked) status = 'Maps not unlocked!';
	else if (game.global.mapsActive && getCurrentMapObject().noRecycle && getCurrentMapObject().location !== 'Bionic' && getCurrentMapObject().location !== 'Void' && (mapSettings.mapName !== 'Quagmire Farm' && getCurrentMapObject().location !== 'Darkness')) status = getCurrentMapObject().name;
	else if (challengeActive('Mapology') && game.challenges.Mapology.credits < 1) status = 'Out of Map Credits';
	else if (mapSettings.mapName !== '') status = mapSettings.status;
	//Advancing
	else status = 'Advancing';

	if (getPageSetting('autoMaps') === 0) status = '[Off] ' + status;
	var resourceType = game.global.universe === 1 ? 'Helium' : 'Radon';
	var resourceShortened = game.global.universe === 1 ? 'He' : 'Rn';
	var getPercent = (game.stats.heliumHour.value() /
		(game.global['total' + resourceType + 'Earned'] - game.resources[resourceType.toLowerCase()].owned)
	) * 100;
	var lifetime = (game.resources[resourceType.toLowerCase()].owned /
		(game.global['total' + resourceType + 'Earned'] - game.resources[resourceType.toLowerCase()].owned)
	) * 100;
	var hiderStatus = resourceShortened + '/hr: ' + (getPercent > 0 ? getPercent.toFixed(3) : 0) + '%<br>&nbsp;&nbsp;&nbsp;' + resourceShortened + ': ' + (lifetime > 0 ? lifetime.toFixed(3) : 0) + '%';

	if (get) {
		return [status, getPercent, lifetime];
	}
	//Set auto maps status when inside of TW
	if (usingRealTimeOffline && document.getElementById('autoMapStatusTW') !== null && document.getElementById('autoMapStatusTW').innerHTML !== status) {
		var statusMsg = "<h9>Auto Maps Status</h9><br>" + status;
		document.getElementById('autoMapStatusTW').innerHTML = statusMsg;
		document.getElementById('autoMapStatusTW').setAttribute("onmouseover", makeAutomapStatusTooltip());
	}
	//Set auto maps status when outside of TW
	if (!usingRealTimeOffline && document.getElementById('autoMapStatus') !== null && document.getElementById('autoMapStatus').innerHTML !== status) {
		document.getElementById('autoMapStatus').innerHTML = status;
		document.getElementById('autoMapStatus').setAttribute("onmouseover", makeAutomapStatusTooltip());
	}
	//Set hider (he/hr) status when outside of TW
	if (!usingRealTimeOffline && document.getElementById('hiderStatus') !== null && document.getElementById('hiderStatus').innerHTML !== hiderStatus) {
		document.getElementById('hiderStatus').innerHTML = hiderStatus;
		document.getElementById('hiderStatus').setAttribute("onmouseover", makeResourceTooltip());
	}
}

function makeAutomapStatusTooltip() {
	const mapStacksText = (`Will run maps to get up to <i>${getPageSetting('mapBonusStacks')}</i> stacks when World HD Ratio is greater than <i>${prettify(getPageSetting('mapBonusRatio'))}</i>.`);
	const hdRatioText = 'HD Ratio is enemyHealth to yourDamage ratio, effectively hits to kill an enemy.';
	var enemyName = game.global.world < 60 ? 'Blimp' : 'Improbability';
	var hitsSurvivedText = `Hits Survived is the ratio of hits you can survive against a cell 100 ${enemyName}'s max attack${game.global.universe === 1 ? ' (subtracts Trimp block from that value)' : ''
		}.`;
	const hitsSurvived = prettify(hdStats.hitsSurvived);
	const hitsSurvivedVoid = prettify(hdStats.hitsSurvivedVoid);
	const hitsSurvivedSetting = targetHitsSurvived();
	const hitsSurvivedValue = hitsSurvivedSetting > 0 ? hitsSurvivedSetting : '∞';
	var tooltip = 'tooltip(' +
		'\"Automaps Status\", ' +
		'\"customText\", ' +
		'event, ' +
		'\"Variables that control the current state and target of Automaps.<br>' +
		'Values in <b>bold</b> are dynamically calculated based on current zone and activity.<br>' +
		'Values in <i>italics</i> are controlled via AT settings (you can change them).<br>';
	if (game.global.universe === 2) {
		if (!game.portal.Equality.radLocked) tooltip += `<br>\
		If you have the Auto Equality setting set to <b>Auto Equality: Advanced</b> then all calculations will factor expected equality value into them.<br>`;
		if (game.stats.highestRadLevel.valueTotal() > 200) tooltip += `If a mutated enemy has higher stats than the ${enemyName} on cell 100 then calculations will use that enemies stats instead.<br>`;
	}
	//Hits Survived
	tooltip += `<br>` +
		`<b> Hits Survived info</b > <br>` +
		`${hitsSurvivedText}<br>` +
		`<b>Hits Survived: ${hitsSurvived}</b> / <i>${hitsSurvivedValue}</i><br>` +
		`<b>Void Hits Survived: ${hitsSurvivedVoid}</b><br>`

	//Map Setting Info
	tooltip += `<br>` +
		`<b>Mapping info</b><br>`;
	if (mapSettings.shouldRun) {
		tooltip +=
			`Farming Setting: <b>${mapSettings.mapName}</b><br>` +
			`Map level: <b>${mapSettings.mapLevel}</b><br>` +
			`Auto level: <b>${mapSettings.autoLevel}</b><br>` +
			`Special: <b>${mapSettings.special !== undefined && mapSettings.special !== '0' ? mapSpecialModifierConfig[mapSettings.special].name : 'None'
			}</b > <br>` +
			`Wants to run: ${mapSettings.shouldRun}<br>` +
			`Repeat: ${mapSettings.repeat}<br>`;
	}
	else {
		tooltip += `Not running<br>`;
	}

	//HD Ratios
	tooltip += '<br>' +
		`<b>HD Ratio Info</b><br>` +
		`${hdRatioText}<br>` +
		`World HD Ratio ${(game.global.universe === 1 ? '(in X formation)' : '')} <b> ${prettify(hdStats.hdRatio)}</b><br>` +
		`Map HD Ratio ${(game.global.universe === 1 ? '(in X formation)' : '')} <b> ${prettify(hdStats.hdRatioMap)}</b><br>` +
		`Void HD Ratio ${(game.global.universe === 1 ? '(in X formation)' : '')} <b> ${prettify(hdStats.hdRatioVoid)}</b><br>` +
		`${mapStacksText}<br>`
	tooltip += '\")';
	return tooltip;
}

function makeResourceTooltip() {
	const resource = game.global.universe === 2 ? 'Radon' : 'Helium';
	const resourceHr = game.global.universe === 2 ? 'Rn' : 'He';
	var tooltip = 'tooltip(' +
		`\"${resource} /Hr Info\",` +
		'\"customText\", ' +
		'event, ' +
		'\"';

	tooltip +=
		`<b>${resourceHr}/hr</b><br>` +
		`Current ${resourceHr} /hr % out of Lifetime ${(resourceHr)} (not including current+unspent).<br> 0.5% is an ideal peak target. This can tell you when to portal... <br>` +
		`<b>${resourceHr}</b><br>` +
		`Current run Total ${resourceHr} / earned / Lifetime ${(resourceHr)} (not including current)<br>`
	tooltip += getDailyHeHrStats();

	tooltip += '\")';
	return tooltip;
}

function autoMap() {

	if (getPageSetting('sitInMaps') && game.global.world === getPageSetting('sitInMaps_Zone') && game.global.lastClearedCell + 2 >= getPageSetting('sitInMaps_Cell')) {
		if (!game.global.preMapsActive) {
			mapsClicked(true);
			debug('AutoMaps. Sitting in maps. Disable the setting to allow manual gameplay.', 'other');
		}
		return;
	}

	if (getPageSetting('autoMaps') === 0 || !game.global.mapsUnlocked) return;

	if (game.global.mapsActive) {
		var currMap = getCurrentMapObject();
		if (currMap !== undefined && (currMap.name === 'Trimple Of Doom' || currMap.name === 'Atlantrimp' || currMap.name === 'Melting Point' || currMap.name === 'Frozen Castle')) {
			if (currMap.name === MODULES.mapFunctions.runUniqueMap) MODULES.mapFunctions.runUniqueMap = '';
			if (game.global.repeatMap) repeatClicked();
			return;
		}
	}

	//Failsafes
	//If maps aren't active, or soldier attack is negative or we're running Quest and doing a shield break OR no maps quest
	if (!game.global.mapsUnlocked || game.global.soldierCurrentAttack < 0 || currQuest() === 8 || currQuest() === 9) {
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
		fragmentFarm();
		return;
	}

	//If we're inside of the Life challenge.
	//Will go to map chamber and sit back in the world without fighting until the cell we're on is Living.
	if (challengeActive('Life') && !game.global.mapsActive) {
		if (getPageSetting('life') && getPageSetting('lifeZone') > 0 && game.global.world >= getPageSetting('lifeZone') && getPageSetting('lifeStacks') > 0 && game.challenges.Life.stacks < getPageSetting('lifeStacks')) {
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

	//Go to map chamber if we should farm on Wither!
	if (mapSettings.mapName === 'Wither Farm' && mapSettings.shouldRun && !game.global.mapsActive && !game.global.preMapsActive) {
		mapsClicked(true);
	}

	//Vanilla Map at Zone
	var vanillaMAZ = false;
	if (game.options.menu.mapAtZone.enabled && game.global.canMapAtZone) {
		var nextCell = game.global.lastClearedCell;
		if (nextCell === -1) nextCell = 1;
		else nextCell += 2;
		var totalPortals = getTotalPortals();
		var setZone = game.options.menu.mapAtZone.getSetZone();
		for (var x = 0; x < setZone.length; x++) {
			if (!setZone[x].on) continue;
			if (game.global.world < setZone[x].world || game.global.world > setZone[x].through) continue;
			if (game.global.preMapsActive && setZone[x].done === totalPortals + "_" + game.global.world + "_" + nextCell) continue;
			if (setZone[x].times === -1 && game.global.world !== setZone[x].world) continue;
			if (setZone[x].times > 0 && (game.global.world - setZone[x].world) % setZone[x].times !== 0) continue;
			if (setZone[x].cell === game.global.lastClearedCell + 2) {
				vanillaMAZ = true;
				if (setZone[x].until === 6) game.global.mapCounterGoal = 25;
				if (setZone[x].until === 7) game.global.mapCounterGoal = 50;
				if (setZone[x].until === 8) game.global.mapCounterGoal = 100;
				if (setZone[x].until === 9) game.global.mapCounterGoal = setZone[x].rx;
				break;
			}
		}

		//Toggle void repeat on if it's disabled.
		if (vanillaMAZ) {
			if (game.options.menu.repeatVoids.enabled !== 1) toggleSetting('repeatVoids');
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
		mappingTime = 0;
		if (document.getElementById('advExtraLevelSelect').value > 0)
			document.getElementById('advExtraLevelSelect').value = "0";
	}

	//Uniques
	var highestMap = null;
	var lowestMap = null;
	var optimalMap = null;
	const runUniques = getPageSetting('autoMaps') === 1;
	const bionicPool = [];
	var voidMap = null;
	var selectedMap = "world";

	var perfSize = game.talents.mapLoot2.purchased ? 20 : 25;
	var perfMapLoot = game.global.farmlandsUnlocked && game.singleRunBonuses.goldMaps.owned ? 3.6 : game.global.decayDone && game.singleRunBonuses.goldMaps.owned ? 2.85 : game.global.farmlandsUnlocked ? 2.6 : game.global.decayDone ? 1.85 : 1.6;
	var mapBiome = mapSettings.biome !== undefined ? mapSettings.biome : getBiome();

	for (const map of game.global.mapsOwnedArray) {
		if (!map.noRecycle) {
			if (!highestMap || map.level > highestMap.level) {
				highestMap = map;
			}
			if (!optimalMap) {
				if ((mapSettings.mapLevel + game.global.world) === map.level && mapSettings.special === map.bonus && map.size === perfSize && map.difficulty === 0.75 && map.loot === perfMapLoot && map.location === mapBiome) {
					optimalMap = map;
				}
			}
			if (!lowestMap || map.level < lowestMap.level) {
				lowestMap = map;
			}
		} else if (map.noRecycle) {
			if (runUniques && shouldRunUniqueMap(map) && !challengeActive('Insanity')) {
				selectedMap = map.id;
				if (mappingTime === 0) mappingTime = getGameTime();
			}
			if (map.location === "Bionic") {
				bionicPool.push(map);
			}
			if (map.location === 'Void' && mapSettings.shouldRun && mapSettings.mapName === 'Void Map') {
				voidMap = selectEasierVoidMap(voidMap, map);
			}
		}
	}

	//Telling AT to create a map or setting void map as map to be run.
	if (selectedMap === 'world' && mapSettings.shouldRun) {
		if (mapSettings.mapName !== '') {
			if (voidMap) selectedMap = voidMap.id;
			else if (mapSettings.mapName === 'Prestige Raiding') selectedMap = "prestigeRaid";
			else if (mapSettings.mapName === 'Bionic Raiding') selectedMap = "bionicRaid";
			else if (optimalMap) selectedMap = optimalMap.id;
			else selectedMap = shouldFarmMapCreation(mapSettings.mapLevel, mapSettings.special, mapBiome);
			if (mappingTime === 0) mappingTime = getGameTime();
		}
	}

	//Map Repeat
	if (game.global.mapsActive) {
		//Recycling our maps below world level if we have 95 or more in our inventory.
		//Game refuses to let you buy a map if you have 100 maps in your inventory.
		if (game.global.mapsOwnedArray.length >= 95) recycleBelow(true);
		//Swapping to LMC maps if we have 1 item left to get in current map - Needs special modifier unlock checks!
		if (mapSettings.shouldRun && mapSettings.mapName === 'Prestige Raiding' && game.global.mapsActive && String(getCurrentMapObject().level).slice(-1) === '1' && equipsToGet(getCurrentMapObject().level) === 1 && getCurrentMapObject().bonus !== 'lmc' && game.resources.fragments.owned > perfectMapCost_Actual(getCurrentMapObject().level - game.global.world, 'lmc', mapBiome)) {
			var maplevel = getCurrentMapObject().level;
			recycleMap_AT();
			if (game.global.preMapsActive) {
				perfectMapCost(maplevel - game.global.world, "lmc", mapBiome);
				buyMap();
				runMapAT();
				debug("Running LMC map due to only having 1 equip remaining on this map.", "maps");
			}
		}
		if ((selectedMap === game.global.currentMapId || (!getCurrentMapObject().noRecycle && mapSettings.shouldRun) || mapSettings.mapName === 'Bionic Raiding')) {
			//Starting with repeat on
			if (!game.global.repeatMap)
				repeatClicked();
			//Changing repeat to repeat for items for Presitge & Bionic Raiding
			if (mapSettings.shouldRun && ((mapSettings.mapName === 'Prestige Raiding' && !mapSettings.prestigeFragMapBought) || mapSettings.mapName === 'Bionic Raiding')) {
				if (game.options.menu.repeatUntil.enabled !== 2) {
					game.options.menu.repeatUntil.enabled = 2;
					toggleSetting("repeatUntil", null, false, true);
				}
			} else if (game.options.menu.repeatUntil.enabled !== 0) {
				game.options.menu.repeatUntil.enabled = 0;
				toggleSetting("repeatUntil", null, false, true);
			}
			//Disabling repeat if we shouldn't map
			if (!mapSettings.shouldRun)
				repeatClicked();
			//Disabling repeat if we'll beat Experience from the BW we're clearing.
			if (game.global.repeatMap && challengeActive('Experience') && getCurrentMapObject().location === 'Bionic' && game.global.world > 600 && getCurrentMapObject().level >= 605) {
				repeatClicked();
			}
			if (mapSettings.prestigeFragMapBought && game.global.repeatMap) {
				runPrestigeRaiding();
			}
			//Disabling repeat if repeat conditions have been met
			if (game.global.repeatMap && mapSettings.mapName !== '' && !mapSettings.prestigeFragMapBought) {
				//Figuring out if we have the right map level & special
				var mapObj = game.global.mapsActive ? getCurrentMapObject() : null;
				var mapLevel = mapObj !== null && typeof mapSettings.mapLevel !== 'undefined' ? mapObj.level - game.global.world : mapSettings.mapLevel;

				var mapSpecial = mapObj !== null && typeof mapSettings.special !== 'undefined' && mapSettings.special !== "0" ? mapObj.bonus : mapSettings.special;
				//Disabling repeat if the map isn't right or we've finished farming
				if (!mapSettings.repeat || mapLevel !== mapSettings.mapLevel || mapSpecial !== mapSettings.special) repeatClicked();
			}
		} else {
			//Disable repeat if active and not mapping
			if (game.global.repeatMap) {
				repeatClicked();
			}
		}
	} else if (!game.global.preMapsActive && !game.global.mapsActive) {
		//Going to map chamber. Will override default 'Auto Abandon' setting if AT wants to map!
		if (selectedMap !== "world") {
			if (!game.global.switchToMaps) {
				mapsClicked();
			}
			if (game.global.switchToMaps && getPageSetting('autoAbandon')) {
				mapsClicked();
			}
		}
		//Creating Maps
	} else if (game.global.preMapsActive) {
		document.getElementById("mapLevelInput").value = game.global.world;
		if (selectedMap === "world") {
			mapsClicked();
		} else if (selectedMap === "prestigeRaid") {
			runPrestigeRaiding();
		} else if (selectedMap === "bionicRaid") {
			runBionicRaiding(bionicPool);
		} else if (selectedMap === "create") {
			//Setting sliders appropriately.
			if (mapSettings.shouldRun) {
				if (mapSettings.mapName !== '') {
					mapCost(mapSettings.mapLevel, mapSettings.special, mapBiome, mapSettings.mapSliders, getPageSetting('onlyPerfectMaps'));
				}
			}

			const maplvlpicked = parseInt(document.getElementById("mapLevelInput").value);
			const mappluslevel = maplvlpicked === game.global.world && document.getElementById("advExtraLevelSelect").value > 0 ? parseInt(document.getElementById("advExtraLevelSelect").value) : "";
			const mapspecial = document.getElementById("advSpecialSelect").value === '0' ? 'No special' : document.getElementById("advSpecialSelect").value;
			if (highestMap !== null && updateMapCost(true) > game.resources.fragments.owned) {
				debug("Can't afford the map we designed, #" + maplvlpicked + (mappluslevel > 0 ? " +" + mappluslevel : "") + " " + mapspecial, "maps", 'th-large');
				if (!game.jobs.Explorer.locked) fragmentFarm();
				else runSelectedMap(highestMap.id, 'highest');
				lastMapWeWereIn = getCurrentMapObject();
			} else {
				debug("Buying a Map, level: #" + maplvlpicked + (mappluslevel > 0 ? " +" + mappluslevel : "") + " " + mapspecial, "maps", 'th-large');
				updateMapCost(true);
				debug(("Spent " + prettify(updateMapCost(true)) + "/" + prettify(game.resources.fragments.owned) + " (" + ((updateMapCost(true) / game.resources.fragments.owned * 100).toFixed(2)) + "%) fragments on a " + (advExtraLevelSelect.value >= 0 ? "+" : "") + advExtraLevelSelect.value + " " + (advPerfectCheckbox.dataset.checked === 'true' ? "Perfect " : ("(" + lootAdvMapsRange.value + "," + sizeAdvMapsRange.value + "," + difficultyAdvMapsRange.value + ") ")) + advSpecialSelect.value + " map."), 'fragment');

				var result = buyMap();
				if (result === -2) {
					debug("Too many maps, recycling now. ", "maps", 'th-large');
					recycleBelow(true);
					debug("Retrying, Buying a Map, level: #" + maplvlpicked + (mappluslevel > 0 ? " +" + mappluslevel : "") + " " + mapspecial, "maps", 'th-large');
					result = buyMap();
					if (result === -2) {
						const mapToRecycleIfBuyingFails = lowestMap;
						recycleMap(game.global.mapsOwnedArray.indexOf(mapToRecycleIfBuyingFails));
						result = buyMap();
						if (result === -2)
							debug("AutoMaps unable to recycle to buy map!", "maps");
						else
							debug("Retrying map buy after recycling lowest level map", "maps");
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
			var voidorLevelText = themapobj.location === "Void" ? " Void: " : levelText;
			debug("Running selected " + selectedMap + voidorLevelText + " Name: " + themapobj.name, "maps", 'th-large');
			runMap();
			lastMapWeWereIn = getCurrentMapObject();
		}
	}

	var canRunSlowScum = mapSettings.mapName === 'Map Bonus' || mapSettings.mapName === 'Prestige Raiding' || mapSettings.mapName === 'Pandemonium Destacking'
	if (game.global.mapsActive && game.global.universe === 2 && canRunSlowScum && !getCurrentMapObject().noRecycle && hdStats.hdRatioMap > getPageSetting('testMapScummingValue')) {
		if (game.global.mapRunCounter !== 0 || !slowScumming) mapScumming(challengeActive('Desolation') ? 9 : 10);
	}
}
