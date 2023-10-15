//Mapping Variables
MODULES.maps = {
	fragmentFarming: false,
	lifeActive: false,
	lifeCell: 0,
	slowScumming: false,
	mapRepeats: 0,
	mapRepeatsSmithy: [0, 0, 0],
	mapTimer: 0,
	lastMapWeWereIn: null,
	fragmentCost: Infinity,
};

function prettifyMap(map) {
	if (!map) {
		return 'none'
	}
	var descriptor;
	if (!map.noRecycle) {
		// a crafted map
		const bonus = (map.hasOwnProperty('bonus') ? mapSpecialModifierConfig[map.bonus].name : 'no bonus');
		descriptor = `, Level ${map.level} (${bonus})`;
	} else if (map.location === 'Void') {
		descriptor = ' (Void)';
	} else {
		descriptor = ' (Unique)';
	}
	return `[${map.id}] ${map.name}${descriptor} `;
}

function debugPrettifyMap(map) {
	if (!map) {
		return 'none'
	}
	if (['world', 'create'].includes(map)) {
		return map;
	}
	var descriptor;
	if (!map.noRecycle) {
		// a crafted map
		const bonus = (map.hasOwnProperty('bonus') ? `+${map.bonus}` : '');
		descriptor = `L${map.level}${bonus}`;
	} else if (map.location === 'Void') {
		descriptor = `V(${map.name})`;
	} else {
		descriptor = `U(${map.name})`;
	}
	return `[${map.id}]${descriptor}`;
}

function runSelectedMap(mapId, madAdjective) {
	selectMap(mapId);
	runMap();
	if (MODULES.maps.lastMapWeWereIn !== getCurrentMapObject()) {
		const map = game.global.mapsOwnedArray[getMapIndex(mapId)];
		debug(`Running ${madAdjective} map ${prettifyMap(map)}`, "maps", 'th-large');
		MODULES.maps.lastMapWeWereIn = getCurrentMapObject();
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

	if (getPageSetting('autoMaps') === 0) status = '[Auto Maps Off] ' + status;


	if (usingRealTimeOffline && getPageSetting('timeWarpDisplay')) {
		var ticks = offlineProgress.ticksProcessed;
		var maxTicks = offlineProgress.progressMax;
		var barWidth = ((ticks / maxTicks) * 100).toFixed(1) + "%";

		status = "Time Warp - " + barWidth + "<br>" + status;
	}

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
	if (usingRealTimeOffline && !getPageSetting('timeWarpDisplay') && document.getElementById('autoMapStatusTW') !== null) {
		//Add in a header for the status to let the user know what it is
		var statusMsg = "<h9>Auto Maps Status</h9><br>" + status;
		var id = game.global.mapsActive ? 'autoMapStatusMapsTW' : 'autoMapStatusTW';
		if (document.getElementById(id).innerHTML !== status) document.getElementById(id).innerHTML = statusMsg;
		document.getElementById(id).setAttribute("onmouseover", makeAutomapStatusTooltip(true));
	}
	//Set auto maps status when outside of TW
	if ((!usingRealTimeOffline || getPageSetting('timeWarpDisplay')) && document.getElementById('autoMapStatus') !== null) {
		if (document.getElementById('autoMapStatus').innerHTML !== status) document.getElementById('autoMapStatus').innerHTML = status;
		document.getElementById('autoMapStatus').setAttribute("onmouseover", makeAutomapStatusTooltip(true));
	}
	//Set hider (he/hr) status when outside of TW
	if ((!usingRealTimeOffline || getPageSetting('timeWarpDisplay')) && document.getElementById('hiderStatus') !== null) {
		if (document.getElementById('hiderStatus').innerHTML !== hiderStatus) document.getElementById('hiderStatus').innerHTML = hiderStatus;
		document.getElementById('hiderStatus').setAttribute("onmouseover", makeResourceTooltip(true));
	}
	//Additional Info tooltip 
	if ((!usingRealTimeOffline || getPageSetting('timeWarpDisplay')) && document.getElementById('additionalInfo') !== null) {
		var infoStatus = makeAdditionalInfo();
		if (document.getElementById('additionalInfo').innerHTML !== infoStatus) document.getElementById('additionalInfo').innerHTML = infoStatus;
		document.getElementById('additionalInfo').parentNode.setAttribute("onmouseover", makeAdditionalInfoTooltip(true));
	}
}

function makeAutomapStatusTooltip(mouseover) {
	const mapStacksText = (`Will run maps to get up to <i>${getPageSetting('mapBonusStacks')}</i> stacks when World HD Ratio is greater than <i>${prettify(getPageSetting('mapBonusRatio'))}</i>.`);
	const hdRatioText = 'HD Ratio is enemyHealth to yourDamage ratio, effectively hits to kill an enemy. The enemy health check is based on the highest health enemy in the map/zone.';
	var hitsSurvivedText = `Hits Survived is the ratio of hits you can survive against the highest damaging enemy in the map/zone${game.global.universe === 1 ? ' (subtracts Trimp block from that value)' : ''
		}.`;
	const hitsSurvived = prettify(hdStats.hitsSurvived);
	const hitsSurvivedVoid = prettify(hdStats.hitsSurvivedVoid);
	const hitsSurvivedSetting = targetHitsSurvived();
	const hitsSurvivedValue = hitsSurvivedSetting > 0 ? hitsSurvivedSetting : '∞';
	var tooltipText = '';

	if (mouseover) {
		tooltipText = 'tooltip(' +
			'\"Automaps Status\", ' +
			'\"customText\", ' +
			'event, ' + '\"';
	}
	tooltipText += 'Variables that control the current state and target of Automaps.<br>' +
		'Values in <b>bold</b> are dynamically calculated based on current zone and activity.<br>' +
		'Values in <i>italics</i> are controlled via AT settings (you can change them).<br>';
	if (game.global.universe === 2) {
		if (!game.portal.Equality.radLocked) tooltipText += `<br>\
		If you have the Auto Equality setting set to <b>Auto Equality: Advanced</b> then all calculations will factor expected equality value into them.<br>`;
	}
	//Hits Survived
	tooltipText += `<br>` +
		`<b> Hits Survived info</b > <br>` +
		`${hitsSurvivedText}<br>` +
		`Hits Survived: <b>${hitsSurvived}</b> / <i>${hitsSurvivedValue}</i><br>` +
		`Void Hits Survived: <b>${hitsSurvivedVoid}</b><br>`

	//Map Setting Info
	tooltipText += `<br>` +
		`<b>Mapping info</b><br>`;
	if (mapSettings.shouldRun) {
		tooltipText += `Farming Setting: <b>${mapSettings.mapName}</b><br>`
		tooltipText += `Map level: <b>${mapSettings.mapLevel}</b><br>`
		tooltipText += `Auto level: <b>${mapSettings.autoLevel}</b><br>`
		if (mapSettings.settingIndex) tooltipText += `Line run: <b>${mapSettings.settingIndex}</b>${(mapSettings.priority) ? ` Priority: <b>${mapSettings.priority}</b>` : ``}<br>`;
		tooltipText += `Special: <b>${mapSettings.special !== undefined && mapSettings.special !== '0' ? mapSpecialModifierConfig[mapSettings.special].name : 'None'}</b > <br>`
		tooltipText += `Wants to run: ${mapSettings.shouldRun}<br>`
		tooltipText += `Repeat: ${mapSettings.repeat}<br>`;
	}
	else {
		tooltipText += `Not running<br>`;
	}

	//HD Ratios
	tooltipText += '<br>' +
		`<b>HD Ratio Info</b><br>` +
		`${hdRatioText}<br>` +
		`World HD Ratio ${(game.global.universe === 1 ? '(in X formation)' : '')} <b>${prettify(hdStats.hdRatio)}</b><br>` +
		`Map HD Ratio ${(game.global.universe === 1 ? '(in X formation)' : '')} <b>${prettify(hdStats.hdRatioMap)}</b><br>` +
		`Void HD Ratio ${(game.global.universe === 1 ? '(in X formation)' : '')} <b>${prettify(hdStats.hdRatioVoid)}</b><br>` +
		`${mapStacksText}<br>`;

	if (mouseover) {
		tooltipText += '\")';
		return tooltipText;
	}
	else {
		if (document.getElementById('tipTitle').innerHTML !== 'Automaps Status') tooltip('Auto Maps Status', 'customText', 'lock', tooltipText, false, 'center');
		verticalCenterTooltip(true);
	}
}

function makeResourceTooltip(mouseover) {
	const resource = game.global.universe === 2 ? 'Radon' : 'Helium';
	const resourceHr = game.global.universe === 2 ? 'Rn' : 'He';

	var getPercent = (game.stats.heliumHour.value() / (game.global['total' + resource + 'Earned'] - game.resources[resource.toLowerCase()].owned)
	) * 100;
	var lifetime = (game.resources[resource.toLowerCase()].owned /
		(game.global['total' + resource + 'Earned'] - game.resources[resource.toLowerCase()].owned)
	) * 100;
	const resourceHrMsg = (getPercent > 0 ? getPercent.toFixed(3) : 0);
	const lifeTimeMsg = (lifetime > 0 ? lifetime.toFixed(3) : 0) + '%';

	var tooltipText = '';

	if (mouseover) {
		tooltipText = 'tooltip(' +
			`\"${resource} per hour Info\",` +
			'\"customText\", ' +
			'event, ' +
			'\"';
	}
	tooltipText +=
		`<b>${resource} per hour</b>: ${resourceHrMsg}<br>` +
		`Current ${resource} per hour % out of Lifetime ${(resourceHr)} (not including current+unspent).<br> 0.5% is an ideal peak target. This can tell you when to portal... <br>` +
		`<b>${resource}</b>: ${lifeTimeMsg}<br>` +
		`Current run total ${resource} / earned / lifetime ${(resourceHr)} (not including current)<br>`

	if (trimpStats.isDaily) {
		var helium = game.stats.heliumHour.value() / (game.global['total' + resource + 'Earned'] - (game.global[resource.toLowerCase() + 'Leftover'] + game.resources[resource.toLowerCase()].owned));
		helium *= 100 + getDailyHeliumValue(countDailyWeight());
		tooltipText += `<b>After Daily ${resource} per hour</b>: ${helium.toFixed(3)}%`;
	}

	if (mouseover) {
		tooltipText += '\")';
		return tooltipText;
	}
	else {
		if (document.getElementById('tipTitle').innerHTML !== 'Automaps Status') tooltip(`${resource} per hour info`, 'customText', 'lock', tooltipText, false, 'center');
		verticalCenterTooltip(true);
	}
}

function makeAdditionalInfoTooltip(mouseover) {
	var tooltipText = '';

	if (mouseover) {
		tooltipText = 'tooltip(' +
			'\"Additional Info\", ' +
			'\"customText\", ' +
			'event, ' + '\"';
	}

	if (game.permaBoneBonuses.voidMaps.owned > 0) {
		tooltipText += `<p><b>Void</b><br>`;
		tooltipText += `The progress you have towards a free void map from the 'Void Maps' permanent bone upgrade</p>`;

	}
	tooltipText += `<p><b>Auto Level</b><br>`;
	tooltipText += `The level that the script recommends using whilst farming.</p>`;



	if (game.global.universe === 1 && game.jobs.Amalgamator.owned > 0) {
		tooltipText += `<p><b>Breed Timer (B)</b><br>`;
		tooltipText += `The breeding time of your trimps, used to identify how long your <b>Anticipation</b> timer will be if you were to send an army to fight.</p>`;
	}
	//Tenacity timer when you have tenacity
	else if (game.global.universe === 2 && game.portal.Tenacity.radLevel > 0) {
		tooltipText += `<p><b>Tenacity Timer (T)</b><br>`;
		tooltipText += `Your current tenacity timer in minutes.</p>`;
	}

	if (mouseover) {
		tooltipText += '\")';
		return tooltipText;
	}
	else {
		if (document.getElementById('tipTitle').innerHTML !== 'Additional Info') tooltip('Additional Info Tooltip', 'customText', 'lock', tooltipText, false, 'center');
		verticalCenterTooltip(true);
	}
}

function makeAutoPortalHelpTooltip() {
	var tooltipText = '';

	tooltipText += `<p>Auto Portal has a priority as to what it will portal into and if that isn't possible it'll try to portal into the next and so forth.</p>`;
	//C2/C3s
	tooltipText += `<p>To start with if the <b>${cinf()} Runner</b> setting is enabled it will check and see if all of your ${cinf()}'s are up to date according to your settings.</p>`;
	//Dailies
	tooltipText += `<p>Afterwards if the <b>Auto Start Daily</b> setting is enabled then it will portal into a Daily if there are any available to run.</p>`;
	//Fillers
	tooltipText += `<p>If neither of the options above are run then it will portal into the challenge that you have selected in the <b>Auto Portal</b> setting. If that is disabled then it will portal into a challengeless run.</p>`;


	if (document.getElementById('tipTitle').innerHTML !== 'Additional Info') tooltip('Auto Portal Info', 'customText', 'lock', tooltipText, false, 'center');
	verticalCenterTooltip(true);
}

function makeFarmingDecisionHelpTooltip() {
	var tooltipText = '';

	tooltipText += `<p>Mapping has a priority as to what it will try to run and in what order.</p>`;



	if (document.getElementById('tipTitle').innerHTML !== 'Additional Info') tooltip('Auto Maps Priority', 'customText', 'lock', tooltipText, false, 'center');
	verticalCenterTooltip(true);
}

function makeSettingConflictsHelpTooltip() {
	var tooltipText = '';


	if (document.getElementById('tipTitle').innerHTML !== 'Additional Info') tooltip('Auto Trimps Conflict Info', 'customText', 'lock', tooltipText, false, 'center');
	verticalCenterTooltip(true);
}

function makeAdditionalInfo() {
	//Void, AutoLevel, Breed Timer, Tenacity information

	var lineBreak = ` | `;

	var description = ``;
	//Free void tracker
	if (game.permaBoneBonuses.voidMaps.owned > 0) {
		var voidValue = game.permaBoneBonuses.voidMaps.owned === 10 ? Math.floor(game.permaBoneBonuses.voidMaps.tracker / 10) : game.permaBoneBonuses.voidMaps.tracker / 10;
		description += `Void: ${voidValue}/10`;
		description += lineBreak;
	}
	//Mapping auto level
	description += `AL: ${hdStats.autoLevel}`;
	description += lineBreak;
	description += `AL2: ${hdStats.autoLevelNew}`;
	//Breed timer when you have an amalgamator
	if (game.global.universe === 1 && game.jobs.Amalgamator.owned > 0) {
		description += lineBreak;
		description += `B: ${Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000)}s`;
	}
	//Tenacity timer when you have tenacity
	else if (game.global.universe === 2 && game.portal.Tenacity.radLevel > 0) {
		description += lineBreak;
		description += `T: ${Math.floor(game.portal.Tenacity.getTime())}m`;
	}

	return description;
}

//Looks to see if we currently have a map that matches the criteria we want to run if not tells us to create a new one
function shouldFarmMapCreation(pluslevel, special, biome, difficulty, loot, size) {
	//Pre-Init
	if (!pluslevel) pluslevel = 0;
	if (!special) special = getAvailableSpecials('lmc');
	if (!biome) biome = getBiome();
	if (!difficulty) difficulty = 0.75;
	if (!loot) loot = game.global.farmlandsUnlocked && game.singleRunBonuses.goldMaps.owned ? 3.6 : game.global.farmlandsUnlocked ? 2.6 : game.singleRunBonuses.goldMaps.owned ? 2.85 : 1.85;
	if (!size) size = 20;

	for (var mapping in game.global.mapsOwnedArray) {
		if (!game.global.mapsOwnedArray[mapping].noRecycle && (
			(game.global.world + pluslevel) === game.global.mapsOwnedArray[mapping].level) &&
			(game.global.mapsOwnedArray[mapping].bonus === special || special === '0') &&
			game.global.mapsOwnedArray[mapping].location === biome) {

			return (game.global.mapsOwnedArray[mapping].id);
		}
	}
	return ("create");
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

	//Hacky way to fix an issue with having no maps available to run and no fragments to purchase them
	if (MODULES.maps.fragmentCost !== Infinity) {
		if (MODULES.maps.fragmentCost > game.resources.fragments.owned) return;
		else MODULES.maps.fragmentCost = Infinity;
	}
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
		if (getPageSetting('life') && getPageSetting('lifeZone') > 0 && game.global.world >= getPageSetting('lifeZone') && getPageSetting('lifeStacks') > 0 && game.challenges.Life.stacks <= getPageSetting('lifeStacks')) {
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
		MODULES.maps.mapTimer = 0;
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
	var runUnique = false;

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
				runUnique = true;
				if (MODULES.maps.mapTimer === 0) MODULES.maps.mapTimer = getZoneSeconds();
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
			if (MODULES.maps.mapTimer === 0) MODULES.maps.mapTimer = getZoneSeconds();
		}
	}

	//Map Repeat
	if (game.global.mapsActive) {
		//Recycling our maps below world level if we have 95 or more in our inventory.
		//Game refuses to let you buy a map if you have 100 maps in your inventory.
		if (game.global.mapsOwnedArray.length >= 95) recycleBelow(true);
		//Swapping to LMC maps if we have 1 item left to get in current map - Needs special modifier unlock checks!
		var mapObj = getCurrentMapObject();
		if (mapSettings.shouldRun && mapSettings.mapName === 'Prestige Raiding' && game.global.mapsActive && String(mapObj.level).slice(-1) === '1' && prestigesToGet(mapObj.level) === 1 && mapObj.bonus !== 'lmc' && game.resources.fragments.owned > perfectMapCost_Actual(mapObj.level - game.global.world, 'lmc', mapBiome)) {
			var maplevel = mapObj.level;
			recycleMap_AT();
			if (game.global.preMapsActive) {
				perfectMapCost(maplevel - game.global.world, "lmc", mapBiome);
				buyMap();
				runMap_AT();
				debug("Running LMC map due to only having 1 equip remaining on this map.", "maps");
			}
		}
		if ((selectedMap === game.global.currentMapId || (!mapObj.noRecycle && mapSettings.shouldRun) || mapSettings.mapName === 'Bionic Raiding')) {
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
			if (mapObj && game.global.repeatMap && challengeActive('Experience') && mapObj.location === 'Bionic' && game.global.world > 600 && mapObj.level >= 605) {
				repeatClicked();
			}
			if (mapSettings.prestigeFragMapBought && game.global.repeatMap) {
				runPrestigeRaiding();
			}
			//Disabling repeat if repeat conditions have been met
			if (game.global.repeatMap && mapSettings.mapName !== '' && !mapSettings.prestigeFragMapBought && mapObj !== null) {
				//Figuring out if we have the right map level & special
				var mapLevel = typeof mapSettings.mapLevel !== 'undefined' ? mapObj.level - game.global.world : mapSettings.mapLevel;

				var mapSpecial = typeof mapSettings.special !== 'undefined' && mapSettings.special !== "0" ? mapObj.bonus : mapSettings.special;
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

		//Before we create a map check if we are currently in a map and if it doesn't match our farming type then recycle it.
		//Not FULLY bugtested but works with my initial tests and is hopefully bug free.
		function abandonMapCheck() {
			if (mapSettings.mapName === 'Desolation Gear Scum' && game.global.lastClearedCell + 2 === 1) return;
			if (game.global.currentMapId !== '') {
				//If we don't have info on the previous map then set it.
				if (MODULES.maps.lastMapWeWereIn === null) MODULES.maps.lastMapWeWereIn = game.global.mapsOwnedArray[getMapIndex(game.global.currentMapId)];
				//If we do have info on the previous map then check data for it.
				if (MODULES.maps.lastMapWeWereIn !== null) {
					//Ensure the map has the correct biome, if not then recycle it.
					if (mapSettings.biome && MODULES.maps.lastMapWeWereIn.location !== mapSettings.biome) recycleMap();
					//If the selected map is the wrong level then recycle it.
					if (MODULES.maps.lastMapWeWereIn.level !== (mapSettings.mapLevel + game.global.world)) recycleMap();
					//If the selected map is the wrong special then recycle it.
					//Since the game doesn't track bonus if it doesn't exist we need to check if the last map we were in had a bonus or not.
					if (MODULES.maps.lastMapWeWereIn.bonus === undefined) {
						if (mapSettings.special !== '0') recycleMap();
					}
					else if (MODULES.maps.lastMapWeWereIn.bonus !== mapSettings.special) recycleMap();
					if (runUnique && game.global.currentMapId !== selectedMap) recycleMap();
				}
			}
		}

		document.getElementById("mapLevelInput").value = game.global.world;

		if (selectedMap === "world") {
			mapsClicked();
		} else if (selectedMap === "prestigeRaid") {
			runPrestigeRaiding();
		} else if (selectedMap === "bionicRaid") {
			runBionicRaiding(bionicPool);
		} else if (selectedMap === "create") {
			abandonMapCheck();
			//Setting sliders appropriately.
			if (mapSettings.shouldRun) {
				if (mapSettings.mapName !== '') {
					mapCost(mapSettings.mapLevel, mapSettings.special, mapBiome, mapSettings.mapSliders, getPageSetting('onlyPerfectMaps'));
				}
			}

			const maplvlpicked = parseInt(document.getElementById("mapLevelInput").value);
			const mappluslevel = maplvlpicked === game.global.world && document.getElementById("advExtraLevelSelect").value > 0 ? parseInt(document.getElementById("advExtraLevelSelect").value) : "";
			const mapspecial = document.getElementById("advSpecialSelect").value === '0' ? 'No special' : document.getElementById("advSpecialSelect").value;
			if (updateMapCost(true) > game.resources.fragments.owned) {
				debug("Can't afford the map we designed, #" + maplvlpicked + (mappluslevel > 0 ? " +" + mappluslevel : "") + " " + mapspecial, "maps", 'th-large');
				//Runs fragment farming if 
				//A) We have explorers unlocked
				//B) We can afford a max loot+size sliders map
				if (!game.jobs.Explorer.locked && perfectMapCost_Actual(game.talents.mapLoot.purchased ? -1 : 0, getAvailableSpecials('fa'), 'Depths', [9, 9, 0], false) >= game.resources.fragments.owned) fragmentFarm();
				//Hacky way to disable mapping if we don't have a map and can't afford the one that we want to make.
				else if (highestMap === null) {
					MODULES.maps.fragmentCost = updateMapCost(true);
					mapsClicked();
					debug("Disabling mapping until we reach " + prettify(MODULES.maps.fragmentCost) + (MODULES.maps.fragmentCost === 1 ? " fragment." : " fragments.") + " as we don't have any maps to run.");
					return;
				}
				//Runs highest map we have available to farm fragments with
				else runSelectedMap(highestMap.id, 'highest');
				if (game.global.mapsActive) MODULES.maps.lastMapWeWereIn = getCurrentMapObject();
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
					MODULES.maps.lastMapWeWereIn = getCurrentMapObject();
				}
			}
		} else {
			abandonMapCheck();
			if (game.global.currentMapId === '') selectMap(selectedMap);
			var themapobj = game.global.mapsOwnedArray[getMapIndex(selectedMap)];
			var levelText;
			if (themapobj && themapobj.level > 0) {
				levelText = " Level: " + themapobj.level;
			} else {
				levelText = " Level: " + game.global.world;
			}
			var voidOrLevelText = themapobj && themapobj.location === "Void" ? " Void: " : levelText;
			debug("Running selected " + selectedMap + voidOrLevelText + " Name: " + themapobj.name, "maps", 'th-large');
			runMap();
			MODULES.maps.lastMapWeWereIn = getCurrentMapObject();
		}
	}

	var canRunSlowScum = mapSettings.mapName === 'Map Bonus' || mapSettings.mapName === 'Prestige Raiding' || mapSettings.mapName === 'Mayhem Destacking' || mapSettings.mapName === 'Pandemonium Destacking' || mapSettings.mapName === 'Desolation Gear Scum';
	if (game.global.mapsActive && game.global.universe === 2 && canRunSlowScum && !getCurrentMapObject().noRecycle && hdStats.hdRatioMap > getPageSetting('testMapScummingValue')) {
		if (game.global.mapRunCounter !== 0 || !MODULES.maps.slowScumming) mapScumming();
	}
}