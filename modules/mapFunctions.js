//Unique Maps
const uniqueMaps = {
	'Big Wall': {
		zone: 8,
		challenges: [""],
		speedrun: 'bigWallTimed'
	},
	'Dimension of Rage': {
		zone: 15,
		challenges: ["Unlucky"],
		speedrun: ''
	},
	'Prismatic Palace': {
		zone: 20,
		challenges: [""],
		speedrun: 'palaceTimed'
	},
	'Atlantrimp': {
		zone: 33,
		challenges: [""],
		speedrun: 'atlantrimpTimed'
	},
	'Melting Point': {
		zone: 55,
		challenges: [""],
		speedrun: 'meltingTimed'
	},
	'The Black Bog': {
		zone: 6,
		challenges: [""],
		speedrun: ''
	},
	'Frozen Castle': {
		zone: 174,
		challenges: [""],
		speedrun: 'starTimed'
	}
};

//Unique Maps
function shouldRunUniqueMap(map) {
	const challenge = game.global.challengeActive;
	const isC3 = game.global.runningChallengeSquared || game.global.challengeActive === 'Mayhem' || game.global.challengeActive === 'Pandemonium';
	const isDaily = game.global.challengeActive === 'Daily';
	const mapData = uniqueMaps[map.name];
	const uniqueMapSetting = autoTrimpSettings.rUniqueMapSettingsArray.value;

	if (mapData === undefined || game.global.world < mapData.zone) {
		return false;
	}
	if (!isC3 && mapData.challenges.includes(challenge) && game.global.challengeActive !== '') {
		return true;
	}
	if (mapData.speedrun && shouldSpeedRun(game.achievements[mapData.speedrun])) {
		return true;
	}
	if (rCurrentMap === 'rQuagmireFarm' && map.name === 'The Black Bog') {
		return true;
	} else if (map.name === 'Big Wall') {
		// we need Bounty
		if (!game.upgrades.Bounty.allowed && !game.talents.bounty.purchased) {
			return true;
		}
	} else if (map.name === 'Dimension of Rage') {
		// unlock the portal
		if (document.getElementById("portalBtn").style.display === "none" && game.upgrades.Rage.done == 1 && uniqueMapSetting.Dimension_of_Rage.enabled && game.global.world >= uniqueMapSetting.Dimension_of_Rage.zone && game.global.lastClearedCell + 2 >= uniqueMapSetting.Dimension_of_Rage.cell) {
			return true;
		}
	} else if (map.name === 'Prismatic Palace') {
		// we need Shieldblock
		if (game.mapUnlocks.Prismalicious.canRunOnce && uniqueMapSetting.Prismatic_Palace.enabled && game.global.world >= uniqueMapSetting.Prismatic_Palace.zone && game.global.lastClearedCell + 2 >= uniqueMapSetting.Prismatic_Palace.cell) {
			return true;
		}
	} else if (map.name === 'Atlantrimp') {
		// maybe get the treasure
		if (game.mapUnlocks.AncientTreasure.canRunOnce && uniqueMapSetting.Atlantrimp.enabled && game.global.world >= uniqueMapSetting.Atlantrimp.zone && game.global.lastClearedCell + 2 >= uniqueMapSetting.Atlantrimp.cell) {
			if (getPageSetting('rMapRepeatCount') && game.global.preMapsActive) debug('Running Atlantrimp on zone ' + game.global.world + '.')
			return true;
		}
	} else if (map.name === 'Melting Point') {
		const metalShred = isDaily && typeof (game.global.dailyChallenge.hemmorrhage) !== 'undefined' && dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('metal');
		const woodShred = isDaily && typeof (game.global.dailyChallenge.hemmorrhage) !== 'undefined' && dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('wood');
		const smithyShred = woodShred || metalShred;
		// maybe get extra smithiesvar 
		meltsmithy =
			game.global.challengeActive == "Pandemonium" && getPageSetting('RPandemoniumMP') > 0 ? getPageSetting('RPandemoniumMP') :
				isC3 && uniqueMapSetting.MP_Smithy_C3.enabled && uniqueMapSetting.MP_Smithy_C3.value > 0 ? uniqueMapSetting.MP_Smithy_C3.value :
					isDaily && !smithyShred && uniqueMapSetting.MP_Smithy_Daily.enabled && uniqueMapSetting.MP_Smithy_Daily.value > 0 ? uniqueMapSetting.MP_Smithy_Daily.value :
						isDaily && smithyShred && uniqueMapSetting.MP_Smithy_Daily_Shred.enabled && uniqueMapSetting.MP_Smithy_Daily_Shred.value > 0 ? uniqueMapSetting.MP_Smithy_Daily_Shred.value :
							!isC3 && !isDaily && uniqueMapSetting.MP_Smithy.enabled && uniqueMapSetting.MP_Smithy.value > 0 ? uniqueMapSetting.MP_Smithy.value :
								Infinity;
		if (game.mapUnlocks.SmithFree.canRunOnce &&
			((!isC3 && !isDaily && uniqueMapSetting.Melting_Point.enabled && game.global.world >= uniqueMapSetting.Melting_Point.zone && game.global.lastClearedCell + 2 >= uniqueMapSetting.Melting_Point.cell) ||
				(meltsmithy !== Infinity && meltsmithy <= game.buildings.Smithy.owned))) {
			if (getPageSetting('rMapRepeatCount') && game.global.preMapsActive)
				debug('Running Melting Point at ' + game.buildings.Smithy.owned + ' smithies on zone ' + game.global.world + '.')
			return true;
		}
	} else if (map.name === 'Frozen Castle') {
		// maybe get the treasure
		var frozencastle = game.global.challengeActive !== 'Hypothermia' && uniqueMapSetting.Frozen_Castle.enabled && game.global.world >= uniqueMapSetting.Frozen_Castle.zone && game.global.lastClearedCell + 2 >= uniqueMapSetting.Frozen_Castle.cell;
		var hypothermia = game.global.challengeActive === 'Hypothermia' && !VoidMaps().shouldRun &&
			game.global.world >= (autoTrimpSettings.rHypoDefaultSettings.value.frozencastle[0] !== undefined ? parseInt(autoTrimpSettings.rHypoDefaultSettings.value.frozencastle[0]) : 200) &&
			game.global.lastClearedCell + 2 >= (autoTrimpSettings.rHypoDefaultSettings.value.frozencastle[1] !== undefined ? parseInt(autoTrimpSettings.rHypoDefaultSettings.value.frozencastle[1]) : 99);
		if (frozencastle || hypothermia) {
			if (getPageSetting('rMapRepeatCount') && game.global.preMapsActive) debug('Running Frozen Castle on zone ' + game.global.world + '.')
			return true;
		}
	}

	return false;
}

//Void Maps
const voidPrefixes = Object.freeze({
	'Poisonous': 10,
	'Destructive': 11,
	'Heinous': 20,
	'Deadly': 30
});

//Void Maps
var voidSuffixes = Object.freeze({
	'Descent': 7.077,
	'Void': 8.822,
	'Nightmare': 9.436,
	'Pit': 10.6
});

//Void Maps
function getVoidMapDifficulty(map) {
	if (!map) {
		return 99999;
	}
	let score = 0;
	for (const [prefix, weight] of Object.entries(voidPrefixes)) {
		if (map.name.includes(prefix)) {
			score += weight;
			break;
		}
	}
	for (const [suffix, weight] of Object.entries(voidSuffixes)) {
		if (map.name.includes(suffix)) {
			score += weight;
			break;
		}
	}
	return score;
}

//Void Maps
function selectEasierVoidMap(map1, map2) {
	if (getVoidMapDifficulty(map2) > getVoidMapDifficulty(map1)) {
		return map1;
	} else {
		return map2;
	}
}

MODULES.mapFunctions = {};
MODULES.mapFunctions.rVoidHDRatio = Infinity;
MODULES.mapFunctions.rVoidVHDRatio = Infinity;
MODULES.mapFunctions.rVoidHDIndex = Infinity;
MODULES.mapFunctions.rPortalZone = Infinity;

//Void Maps -- WORKING AS IS
function VoidMaps() {

	var rDoVoids = false;
	const mapName = 'rVoidMap';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};

	if (!autoTrimpSettings.rVoidMapDefaultSettings.value.active) return farmingDetails;
	var module = MODULES['mapFunctions'];
	const isC3 = game.global.runningChallengeSquared || game.global.challengeActive === 'Mayhem' || game.global.challengeActive === 'Pandemonium';
	const isDaily = game.global.challengeActive === 'Daily';
	const dailyReduction = isDaily ? dailyModiferReduction() : 0;
	const currChall = game.global.challengeActive;
	const rVMBaseSettings = autoTrimpSettings.rVoidMapSettings.value;
	var rVMIndex;
	for (var y = 0; y < rVMBaseSettings.length; y++) {
		const currSetting = rVMBaseSettings[y];
		if (!currSetting.active || game.global.lastClearedCell + 2 < currSetting.cell) continue;
		if (game.global.world < (currSetting.world + dailyReduction)) continue;
		if (game.global.world > (currSetting.maxvoidzone + dailyReduction)) continue;
		if (currSetting.runType !== 'All') {
			if (!isC3 && !isDaily && (currSetting.runType !== 'Filler' ||
				(currSetting.runType === 'Filler' && (currSetting.challenge !== 'All' && currSetting.challenge !== currChall)))) continue;
			if (isDaily && currSetting.runType !== 'Daily') continue;
			if (isC3 && (currSetting.runType !== 'C3' ||
				(currSetting.runType === 'C3' && (currSetting.challenge3 !== 'All' && currSetting.challenge3 !== currChall)))) continue;
		}
		if (((currSetting.maxvoidzone + dailyReduction) === game.global.world) ||
			(game.global.world - (currSetting.world + dailyReduction) >= 0 &&
				//Running voids regardless of HD if we reach our max void zone / Running voids if our voidHDRatio is greater than our target value
				(currSetting.voidHDRatio < voidHDRatio || currSetting.hdRatio < HDRatio))) {
			rVMIndex = y;
			if (module.rVoidHDRatio === Infinity) module.rVoidHDRatio = HDRatio;
			if (module.rVoidVHDRatio === Infinity) module.rVoidVHDRatio = voidHDRatio;
			module.rVoidHDIndex = y;
			break;
		}
		else
			continue;
	}

	if (rVMIndex >= 0 || module.rVoidHDIndex !== Infinity) {
		var rVMSettings = rVMBaseSettings[rVMIndex >= 0 ? rVMIndex : module.rVoidHDIndex];
		var rVMJobRatio = rVMSettings.jobratio
		var shouldPortal = rVMSettings.portalAfter

		if (game.global.totalVoidMaps > 0) {
			rDoVoids = true;
			var stackedMaps = Fluffy.isRewardActive('void') ? countStackedVoidMaps() : 0;
		}

		var status = 'Void Maps: ' + game.global.totalVoidMaps + ((stackedMaps) ? " (" + stackedMaps + " stacked)" : "") + ' remaining'

		farmingDetails.shouldRun = rDoVoids;
		farmingDetails.mapName = mapName;
		farmingDetails.jobRatio = rVMJobRatio;
		farmingDetails.repeat = false;
		farmingDetails.status = status;
	}

	if (rCurrentMap === mapName && !rDoVoids) {
		if (getPageSetting('rMapRepeatCount')) debug("Void Maps took " + formatTimeForDescriptions(timeForFormatting(currTime > 0 ? currTime : getGameTime())) + " to complete on zone " + game.global.world + ". You started with " + module.rVoidVHDRatio.toFixed(2) + " and ended with a Void HD Ratio of " + voidHDRatio.toFixed(2) + ".");
		rCurrentMap = undefined;
		rAutoLevel = Infinity;
		currTime = 0;
		game.global.mapRunCounter = 0;
		module.rVoidHDIndex = Infinity;
		module.rVoidHDRatio = Infinity;
		module.rVoidVHDRatio = Infinity;
		if (shouldPortal) module.rPortalZone = game.global.world;
	}

	return farmingDetails;
}

MODULES.mapFunctions.rMBHealthFarm = false;
var rMBHealthFarm = false;
//Map Bonus -- WORKING AS IS
function MapBonus() {

	var rShouldMaxMapBonus = false;
	var mapAutoLevel = Infinity;

	const mapName = 'rMapBonus';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};

	if (!autoTrimpSettings.rMapBonusDefaultSettings.value.active) return farmingDetails;

	//Setting up variables and checking if we should use daily settings instead of regular Map Bonus settings
	const isC3 = game.global.runningChallengeSquared || game.global.challengeActive === 'Mayhem' || game.global.challengeActive === 'Pandemonium';
	const isDaily = game.global.challengeActive === 'Daily';
	const dontRecycleMaps = game.global.challengeActive === 'Trappapalooza' || game.global.challengeActive === 'Archaeology' || game.global.challengeActive === 'Berserk' || game.portal.Frenzy.frenzyStarted !== -1;
	const currChall = game.global.challengeActive;
	const rMBZone = getPageSetting('rMapBonusZone');
	const rMBBaseSettings = autoTrimpSettings.rMapBonusSettings.value;
	const rMBDefaultSettings = autoTrimpSettings.rMapBonusDefaultSettings.value;
	var rMBshouldDoHealthMaps = rMBDefaultSettings.healthBonus > game.global.mapBonus && HDRatio > rMBDefaultSettings.healthHDRatio && game.global.mapBonus !== 10;
	var rMBIndex = null;
	for (var y = 0; y < rMBBaseSettings.length; y++) {
		const currSetting = rMBBaseSettings[y];
		if (!currSetting.active || game.global.lastClearedCell + 2 < currSetting.cell) continue;
		if (currSetting.runType !== 'All') {
			if (!isC3 && !isDaily && (currSetting.runType !== 'Filler' ||
				(currSetting.runType === 'Filler' && (currSetting.challenge !== 'All' && currSetting.challenge !== currChall)))) continue;
			if (isDaily && currSetting.runType !== 'Daily') continue;
			if (isC3 && (currSetting.runType !== 'C3' ||
				(currSetting.runType === 'C3' && (currSetting.challenge3 !== 'All' && currSetting.challenge3 !== currChall)))) continue;
		}
		if (game.global.world - rMBZone[y] >= 0)
			rMBIndex = rMBZone.indexOf(rMBZone[y]);
		else
			continue;
	}

	if ((rMBIndex !== null && rMBIndex >= 0) || rMBshouldDoHealthMaps) {
		var rMBSettings = rMBIndex !== null ? rMBBaseSettings[rMBIndex] : rMBDefaultSettings;
		var rMBRepeatCounter = 0;
		if (rMBIndex !== null) {
			rMBRepeatCounter = 1
		}
		rMBRepeatCounter = rMBIndex !== null && rMBshouldDoHealthMaps && rMBSettings.repeat !== rMBDefaultSettings.healthBonus ?
			Math.max(rMBSettings.repeat, rMBDefaultSettings.healthBonus) : rMBIndex === null ? rMBDefaultSettings.healthBonus : rMBSettings.repeat
		var rMBSpecial = rMBSettings.special;
		if (game.global.challengeActive === 'Transmute' && rMBSpecial.includes('mc'))
			rMBSpecial = rMBSpecial.charAt(0) + "sc";
		var rMBMapLevel = rMBIndex !== null ? rMBSettings.level : 0;
		var rMBJobRatio = rMBSettings.jobratio;
		var rMBautoLevel = rMBSettings.autoLevel || rMBIndex === null;

		if (rMBSettings.autoLevel || rMBIndex === null) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && rMBMapRepeats !== 0) {
				game.global.mapRunCounter = rMBMapRepeats;
				rMBMapRepeats = 0;
			}

			var rAutoLevel_Repeat = rAutoLevel;
			mapAutoLevel = callAutoMapLevel(rCurrentMap, rAutoLevel, rMBSpecial, 10, 0, true);
			if (mapAutoLevel !== Infinity) {
				if (rAutoLevel_Repeat !== Infinity && mapAutoLevel !== rAutoLevel_Repeat) rMBMapRepeats = game.global.mapRunCounter + 1;
				rMBMapLevel = mapAutoLevel;
			}
		}

		if (rMBRepeatCounter > game.global.mapBonus) {
			rShouldMaxMapBonus = true;
			if (rMBshouldDoHealthMaps) rMBHealthFarm = true;
			else rMBHealthFarm = false;
		}
		var repeat = game.global.mapsActive && ((getCurrentMapObject().level - game.global.world) !== rMBMapLevel || getCurrentMapObject().bonus !== rMBSpecial || game.global.mapBonus >= (rMBRepeatCounter - 1));
		var status = 'Map Bonus: ' + game.global.mapBonus + "/" + rMBRepeatCounter;

		if (rShouldMaxMapBonus) farmingDetails.shouldRun = rShouldMaxMapBonus || rMBHealthFarm;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = rMBMapLevel;
		farmingDetails.autoLevel = rMBautoLevel;
		farmingDetails.jobRatio = rMBJobRatio;
		farmingDetails.special = rMBSpecial;
		farmingDetails.mapRepeats = rMBRepeatCounter;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
	}

	if (rCurrentMap === mapName && (game.global.mapBonus >= rMBRepeatCounter || !farmingDetails.shouldRun)) {
		if (getPageSetting('rMapRepeatCount')) debug("Map Bonus took " + (game.global.mapRunCounter) + " (" + (rCurrentSetting.mapLevel >= 0 ? "+" : "") + rCurrentSetting.mapLevel + " " + rCurrentSetting.special + ")" + (game.global.mapRunCounter == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime > 0 ? currTime : getGameTime())) + " to complete on zone " + game.global.world + ".");
		rMBHealthFarm = false;
		rCurrentMap = undefined;
		mapAutoLevel = Infinity;
		rMBMapRepeats = 0;
		currTime = 0;
		game.global.mapRunCounter = 0;
		if (!dontRecycleMaps && game.global.mapsActive) {
			mapsClicked();
			recycleMap();
		}
		return farmingDetails;
	}
	return farmingDetails;
}

//Map Farm -- WORKING AS IS
function MapFarm() {

	var rShouldMapFarm = false;
	var mapAutoLevel = Infinity;
	const mapName = 'rMapFarm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};

	if (!autoTrimpSettings.rMapFarmDefaultSettings.value.active) return farmingDetails;
	const isC3 = game.global.runningChallengeSquared || game.global.challengeActive === 'Mayhem' || game.global.challengeActive === 'Pandemonium';
	const isDaily = game.global.challengeActive === 'Daily';
	const shredActive = isDaily && typeof (game.global.dailyChallenge.hemmorrhage) !== 'undefined';
	const totalPortals = getTotalPortals();
	const shredMods = shredActive ? dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength) : [];
	const foodShred = shredActive && shredMods.includes('food');
	const metalShred = shredActive && shredMods.includes('metal');
	const woodShred = shredActive && shredMods.includes('wood');
	const currChall = game.global.challengeActive;

	const rMFBaseSetting = autoTrimpSettings.rMapFarmSettings.value;
	var rMFIndex;

	//Checking to see if any lines are to be run.
	for (var y = 0; y < rMFBaseSetting.length; y++) {
		const currSetting = rMFBaseSetting[y];
		if (!currSetting.active || currSetting.done === totalPortals + "_" + game.global.world || game.global.lastClearedCell + 2 < currSetting.cell || game.global.world < currSetting.world || game.global.world > currSetting.endzone || (game.global.world > currSetting.world && currSetting.repeatevery === 0)) {
			continue;
		}
		if (currSetting.runType !== 'All') {
			if (!isC3 && !isDaily && (currSetting.runType !== 'Filler' ||
				(currSetting.runType === 'Filler' && (currSetting.challenge !== 'All' && currSetting.challenge !== currChall)))) continue;
			if (isDaily && currSetting.runType !== 'Daily') continue;
			if (isC3 && (currSetting.runType !== 'C3' ||
				(currSetting.runType === 'C3' && (currSetting.challenge3 !== 'All' && currSetting.challenge3 !== currChall)))) continue;
		}
		if (game.global.world === currSetting.world) {
			rMFIndex = y;
			break;
		}
		if ((game.global.world - currSetting.world) % currSetting.repeatevery === 0) {
			rMFIndex = y;
			break;
		}
	}

	if (rMFIndex >= 0) {
		var rMFSettings = rMFBaseSetting[rMFIndex];
		var rMFMapLevel = rMFSettings.level;
		var rMFSpecial = rMFSettings.special;
		var rMFRepeatCounter = rMFSettings.repeat;
		var rMFJobRatio = rMFSettings.jobratio;
		var rMFAtlantrimp = !game.mapUnlocks.AncientTreasure.canRunOnce ? false : rMFSettings.atlantrimp;
		var rMFGather = rMFSettings.gather;
		var rMFshredMapCap = autoTrimpSettings.rMapFarmDefaultSettings.value.shredMapCap;

		if (shredActive && (rMFRepeatCounter > rMFshredMapCap || rMFAtlantrimp === true)) {
			if ((foodShred && mapSpecialModifierConfig[rMFSpecial].name.includes('Savory')) || (woodShred && mapSpecialModifierConfig[rMFSpecial].name.includes('Wooden')) || (metalShred && mapSpecialModifierConfig[rMFSpecial].name.includes('Metal'))) {
				if (rMFRepeatCounter > rMFshredMapCap) rMFRepeatCounter = rMFshredMapCap;
				rMFAtlantrimp = false;
			}
		}
		if (rMFSettings.autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && rMFMapRepeats !== 0) {
				game.global.mapRunCounter = rMFMapRepeats;
				rMFMapRepeats = 0;
			}

			var rAutoLevel_Repeat = rAutoLevel;
			mapAutoLevel = callAutoMapLevel(rCurrentMap, rAutoLevel, rMFSpecial, null, null, false);
			if (mapAutoLevel !== Infinity) {
				if (rAutoLevel_Repeat !== Infinity && mapAutoLevel !== rAutoLevel_Repeat) rMFMapRepeats = game.global.mapRunCounter + 1;
				rMFMapLevel = mapAutoLevel;
			}
		}

		//When running Wither make sure map level is lower than 0 so that we don't accumulate extra stacks.
		if (game.global.challengeActive === "Wither" && rMFMapLevel >= 0)
			rMFMapLevel = -1;
		//If you're running Transmute and the rMFSpecial variable is either LMC or SMC it changes it to LSC/SSC.
		if (game.global.challengeActive === 'Transmute' && rMFSpecial.includes('mc'))
			rMFSpecial = rMFSpecial.charAt(0) + "sc";

		if (rMFRepeatCounter > game.global.mapRunCounter)
			rShouldMapFarm = true;

		//Marking setting as complete if we've run enough maps.
		if (rCurrentMap === mapName && game.global.mapRunCounter >= rMFRepeatCounter) {
			if (getPageSetting('rMapRepeatCount')) debug("Map Farm took " + (game.global.mapRunCounter) + " (" + (rMFMapLevel >= 0 ? "+" : "") + rMFMapLevel + " " + rMFSpecial + ")" + (game.global.mapRunCounter == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime > 0 ? currTime : getGameTime())) + " to complete on zone " + game.global.world + ".");
			rCurrentMap = undefined;
			mapAutoLevel = Infinity;
			rShouldMapFarm = false;
			rMFMapRepeats = 0;
			currTime = 0;
			rMFSettings.done = totalPortals + "_" + game.global.world;
			if (rMFAtlantrimp) runAtlantrimp();
			game.global.mapRunCounter = 0;
			saveSettings();
		}

		var repeat = game.global.mapsActive && ((getCurrentMapObject().level - game.global.world) !== rMFMapLevel || getCurrentMapObject().bonus !== rMFSpecial || game.global.mapRunCounter + 1 === rMFRepeatCounter);
		var status = 'Map Farm: ' + game.global.mapRunCounter + "/" + rMFRepeatCounter;

		farmingDetails.shouldRun = rShouldMapFarm;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = rMFMapLevel;
		farmingDetails.autoLevel = rMFSettings.autoLevel;
		farmingDetails.jobRatio = rMFJobRatio;
		farmingDetails.special = rMFSpecial;
		farmingDetails.mapRepeats = rMFRepeatCounter;
		farmingDetails.gather = rMFGather;
		farmingDetails.runAtlantrimp = rMFAtlantrimp;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
	}

	return farmingDetails;
}

//Tribute Farm --WORKING AS IS
function TributeFarm() {

	var rShouldTributeFarm = false;
	var rShouldMetFarm = false;
	var mapAutoLevel = Infinity;
	const mapName = 'rTributeFarm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};

	if (!autoTrimpSettings.rTributeFarmDefaultSettings.value.active || (game.buildings.Tribute.locked && game.jobs.Meteorologist.locked)) return farmingDetails;
	var rShouldTributeFarm = false;
	var rShouldMetFarm = false;
	const isC3 = game.global.runningChallengeSquared || game.global.challengeActive === 'Mayhem' || game.global.challengeActive === 'Pandemonium';
	const isDaily = game.global.challengeActive === 'Daily';
	const foodShred = isDaily && typeof (game.global.dailyChallenge.hemmorrhage) !== 'undefined' && dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('food');
	const dontRecycleMaps = game.global.challengeActive === 'Trappapalooza' || game.global.challengeActive === 'Archaeology' || game.global.challengeActive === 'Berserk' || game.portal.Frenzy.frenzyStarted !== -1;
	const totalPortals = getTotalPortals();
	const currChall = game.global.challengeActive;
	const rTrFBaseSetting = autoTrimpSettings.rTributeFarmSettings.value;
	var rTrFIndex;

	//Identifying which map line to run.
	for (var y = 0; y < rTrFBaseSetting.length; y++) {
		const currSetting = rTrFBaseSetting[y];
		if (!currSetting.active || currSetting.done === totalPortals + "_" + game.global.world || game.global.world < currSetting.world || game.global.world > currSetting.endzone || (game.global.world > currSetting.zone && currSetting.repeatevery === 0) || game.global.lastClearedCell + 2 < currSetting.cell) {
			continue;
		}
		if (currSetting.runType !== 'All') {
			if (!isC3 && !isDaily && (currSetting.runType !== 'Filler' ||
				(currSetting.runType === 'Filler' && (currSetting.challenge !== 'All' && currSetting.challenge !== currChall)))) continue;
			if (isDaily && currSetting.runType !== 'Daily') continue;
			if (isC3 && (currSetting.runType !== 'C3' ||
				(currSetting.runType === 'C3' && (currSetting.challenge3 !== 'All' && currSetting.challenge3 !== currChall)))) continue;
		}
		if (game.global.world === currSetting.world) {
			rTrFIndex = y;
			break;
		}
		if ((game.global.world - currSetting.world) % currSetting.repeatevery === 0) {
			rTrFIndex = y;
			break;
		}
	}

	if (rTrFIndex >= 0) {
		//Initialing variables
		var rTrFSettings = rTrFBaseSetting[rTrFIndex];
		var rTrFMapLevel = rTrFSettings.level
		var rTrFTributes = game.buildings.Tribute.locked == 1 ? 0 : rTrFSettings.tributes;
		var rTrFMeteorologists = game.jobs.Meteorologist.locked == 1 ? 0 : rTrFSettings.mets;
		var rTrFSpecial = game.global.highestRadonLevelCleared > 83 ? "lsc" : "ssc";
		var rTrFJobRatio = rTrFSettings.jobratio;
		var rTrFbuyBuildings = rTrFSettings.buildings;
		var rTrFAtlantrimp = !game.mapUnlocks.AncientTreasure.canRunOnce || (isDaily && foodShred) ? false : rTrFSettings.atlantrimp;

		//AutoLevel code.
		if (rTrFSettings.autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && rTrFMapRepeats !== 0) {
				game.global.mapRunCounter = rTrFMapRepeats;
				rTrFMapRepeats = 0;
			}
			var rAutoLevel_Repeat = rAutoLevel;
			mapAutoLevel = callAutoMapLevel(rCurrentMap, rAutoLevel, rTrFSpecial, null, null, false);
			if (mapAutoLevel !== Infinity) {
				if (rAutoLevel_Repeat !== Infinity && mapAutoLevel !== rAutoLevel_Repeat) rTrFMapRepeats = game.global.mapRunCounter + 1;
				rTrFMapLevel = mapAutoLevel;
			}
		}

		if (game.global.challengeActive == "Wither" && rTrFMapLevel >= 0)
			rTrFMapLevel = -1;

		//When mapType is set as Map Count work out how many Tributes/Mets we can farm in the amount of maps specified.
		if (rTrFSettings.mapType === 'Map Count') {
			if (rTrFTributes !== 0) {
				var tributeMaps = rCurrentMap === mapName ? rTrFTributes - game.global.mapRunCounter : rTrFTributes;
				var tributeTime = tributeMaps * 25;
				if (tributeMaps > 4) tributeTime += (Math.floor(tributeMaps / 5) * 45);
				var foodEarnedTributes = game.resources.food.owned + scaleToCurrentMapLocal(simpleSecondsLocal("food", tributeTime, true, rTrFJobRatio), false, true, rTrFMapLevel);
				rTrFTributes = game.buildings.Tribute.purchased + calculateMaxAffordLocal(game.buildings.Tribute, true, false, false, false, 1, foodEarnedTributes);
			}
			if (rTrFMeteorologists !== 0) {
				var meteorologistTime = (rCurrentMap === mapName ? rTrFMeteorologists - game.global.mapRunCounter : rTrFMeteorologists) * 25;
				if (rTrFMeteorologists > 4) meteorologistTime += (Math.floor(rTrFMeteorologists / 5) * 45);
				var foodEarnedMets = game.resources.food.owned + scaleToCurrentMapLocal(simpleSecondsLocal("food", meteorologistTime, true, rTrFJobRatio), false, true, rTrFMapLevel);
				rTrFMeteorologists = game.jobs.Meteorologist.owned + calculateMaxAffordLocal(game.jobs.Meteorologist, false, false, true, false, 1, foodEarnedMets);
			}
		}

		//Identifying how much food you'd get from the amount of jestimps you want to farm on the map level you've selected for them
		if (isDaily && foodShred) {
			var mapDrop = scaleToCurrentMapLocal(simpleSecondsLocal("food", 45, true, rTrFJobRatio), false, true, rTrFMapLevel);
			var shred = 1 - (dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength)[0] / 100);
			var maps = 10;
			var foodTotal = mapDrop;
			//For loop for adding the food from subsequent map runs to the base total
			for (i = 1; i < maps; i++) {
				foodTotal += (mapDrop * (Math.pow(shred, i)));
			}
			tributeShredAmt = game.buildings.Tribute.purchased + calculateMaxAffordLocal(game.buildings.Tribute, true, false, false, false, 1, foodTotal);
			metShredAmt = game.jobs.Meteorologist.owned + calculateMaxAffordLocal(game.jobs.Meteorologist, false, false, true, false, 1, foodTotal);

			if (rTrFMeteorologists > metShredAmt) rTrFMeteorologists = metShredAmt;
			if (rTrFTributes > tributeShredAmt) rTrFTributes = tributeShredAmt;
		}

		if (rTrFTributes > game.buildings.Tribute.purchased || rTrFMeteorologists > game.jobs.Meteorologist.owned) {
			if (rTrFTributes > game.buildings.Tribute.purchased)
				rShouldTributeFarm = true;
			if (rTrFMeteorologists > game.jobs.Meteorologist.owned)
				rShouldMetFarm = true;
		}

		if (rShouldTributeFarm && !getPageSetting('RBuyBuildingsNew')) rBuyTributes();

		//Figuring out if we have enough resources to run Atlantrimp when setting is enabled.
		if (rTrFAtlantrimp && (rShouldTributeFarm || rShouldMetFarm) && (game.global.world > 33 || (game.global.world === 33 && game.global.lastClearedCell + 2 > 50))) {
			var tributeCost = 0;
			var metCost = 0;

			if (rTrFTributes > game.buildings.Tribute.purchased) {
				for (x = 0; x < rTrFTributes - game.buildings.Tribute.purchased; x++) {
					tributeCost += Math.pow(1.05, game.buildings.Tribute.purchased) * 10000;
				}
			}
			if (rTrFMeteorologists > game.jobs.Meteorologist.owned) {
				for (x = 0; x < rTrFMeteorologists - game.jobs.Meteorologist.owned; x++) {
					metCost += Math.pow(game.jobs.Meteorologist.cost.food[1], game.jobs.Meteorologist.owned + x) * game.jobs.Meteorologist.cost.food[0];
				}
			}
			var totalTrFCost = tributeCost + metCost;

			var barnCost = 0;
			if (totalTrFCost > (game.resources.food.max * (1 + (game.portal.Packrat.modifier * game.portal.Packrat.radLevel))))
				barnCost += game.buildings.Barn.cost.food();
			totalTrFCost += barnCost;

			//Figuring out how much Food we'd farm in the time it takes to run Atlantrimp. Seconds is 165 due to avg of 5x caches (20s per), 4x chronoimps (5s per), 1x jestimp (45s)
			var resourceFarmed = scaleToCurrentMapLocal(simpleSecondsLocal("food", 165, true, rTrFJobRatio), false, true, rTrFMapLevel);

			if ((totalTrFCost > game.resources.food.owned - barnCost + resourceFarmed) && game.resources.food.owned > totalTrFCost / 2) {
				runAtlantrimp(dontRecycleMaps);
			}
		}
		//Recycles map if we don't need to finish it for meeting the tribute/meteorologist requirements
		if (rCurrentMap === mapName && !rShouldTributeFarm && !rShouldMetFarm) {
			var mapProg = game.global.mapsActive ? ((getCurrentMapCell().level - 1) / getCurrentMapObject().size) : 0;
			if (getPageSetting('rMapRepeatCount')) debug("Tribute Farm took " + (game.global.mapRunCounter + mapProg) + " (" + (rTrFMapLevel >= 0 ? "+" : "") + rTrFMapLevel + " " + rTrFSpecial + ")" + (game.global.mapRunCounter + mapProg == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime > 0 ? currTime : getGameTime())) + " to complete on zone " + game.global.world + ". You ended it with " + game.buildings.Tribute.purchased + " tributes and " + game.jobs.Meteorologist.owned + " meteorologists.");
			rCurrentMap = undefined;
			mapAutoLevel = Infinity;
			rTrFMapRepeats = 0;
			currTime = 0;
			game.global.mapRunCounter = 0;
			rTrFSettings.done = totalPortals + "_" + game.global.world;
			if (!dontRecycleMaps && game.global.mapsActive) {
				mapsClicked();
				recycleMap();
			}
			if (document.getElementById('autoStructureBtn').classList.contains("enabled") && !getAutoStructureSetting().enabled)
				toggleAutoStructure();
			rTrFbuyBuildings = false;
			return farmingDetails;
		}

		var repeat = game.global.mapsActive && ((getCurrentMapObject().level - game.global.world) !== rTrFMapLevel || getCurrentMapObject().bonus !== rTrFSpecial);
		var status = rTrFTributes > game.buildings.Tribute.owned ?
			'Tribute Farm: ' + game.buildings.Tribute.owned + "/" + rTrFTributes :
			'Meteorologist Farm: ' + game.jobs.Meteorologist.owned + "/" + rTrFMeteorologists;

		farmingDetails.shouldRun = rShouldTributeFarm || rShouldMetFarm;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = rTrFMapLevel;
		farmingDetails.autoLevel = rTrFSettings.autoLevel;
		farmingDetails.jobRatio = rTrFJobRatio;
		farmingDetails.special = rTrFSpecial;
		farmingDetails.shouldTribute = rShouldTributeFarm;
		farmingDetails.tribute = rTrFTributes;
		farmingDetails.shouldMeteorologist = rShouldMetFarm;
		farmingDetails.meteorologist = rTrFMeteorologists;
		farmingDetails.runAtlantrimp = rTrFAtlantrimp;
		farmingDetails.buyBuildings = rTrFbuyBuildings;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
	}

	return farmingDetails;
}

//Smithy Farming -- WORKING AS IS
function SmithyFarm() {

	const mapName = 'rSmithyFarm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};

	if (game.buildings.Smithy.locked || (!autoTrimpSettings.rSmithyFarmDefaultSettings.value.active && game.global.challengeActive !== 'Quest') || (game.global.challengeActive === 'Quest' && questcheck() !== 10) || game.global.challengeActive === 'Transmute') return farmingDetails;

	var rShouldSmithyFarm = false;
	var rShouldSmithyGemFarm = false;
	var rShouldSmithyWoodFarm = false;
	var rShouldSmithyMetalFarm = false;
	var mapAutoLevel = Infinity;

	const isC3 = game.global.runningChallengeSquared || game.global.challengeActive === 'Mayhem' || game.global.challengeActive === 'Pandemonium';
	const isDaily = game.global.challengeActive === 'Daily';
	const metalShred = isDaily && typeof (game.global.dailyChallenge.hemmorrhage) !== 'undefined' && dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('metal');
	const woodShred = isDaily && typeof (game.global.dailyChallenge.hemmorrhage) !== 'undefined' && dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('wood');
	const smithyShred = woodShred || metalShred;
	const dontRecycleMaps = game.global.challengeActive === 'Trappapalooza' || game.global.challengeActive === 'Archaeology' || game.global.challengeActive === 'Berserk' || game.portal.Frenzy.frenzyStarted !== -1;
	const totalPortals = getTotalPortals();
	const currChall = game.global.challengeActive;
	const rSFBaseSetting = autoTrimpSettings.rSmithyFarmSettings.value;

	var rSFIndex;

	for (var y = 0; y < rSFBaseSetting.length; y++) {
		const currSetting = rSFBaseSetting[y];
		if (!currSetting.active || currSetting.done === totalPortals + "_" + game.global.world || game.global.world !== currSetting.world || game.global.lastClearedCell + 2 < currSetting.cell) {
			continue;
		}
		if (currSetting.runType !== 'All') {
			if (!isC3 && !isDaily && (currSetting.runType !== 'Filler' ||
				(currSetting.runType === 'Filler' && (currSetting.challenge !== 'All' && currSetting.challenge !== currChall)))) continue;
			if (isDaily && currSetting.runType !== 'Daily') continue;
			if (isC3 && (currSetting.runType !== 'C3' ||
				(currSetting.runType === 'C3' && (currSetting.challenge3 !== 'All' && currSetting.challenge3 !== currChall)))) continue;
		}
		if (game.global.world === currSetting.world) {
			rSFIndex = y;
			break;
		}
	}

	if (rSFIndex >= 0 || questcheck() === 10) {

		//NO IDEA HOW TO IMPLEMENT THIS. HELP PLEASE!
		// 0 === cache, 1 === job ratio, 2 === farm type, 3 === amount needed to farm for
		//var rSmithyArray = questcheck() == 1 ? ['lsc', '1', ' gems.'] : questcheck() == 2 ? ['lwc', '0,1', ' wood.'] : questcheck() == 3 ? ['lmc', '0,0,1', ' metal.'] : [0, 0, 0, 0];

		var rSFSettings = autoTrimpSettings.rSmithyFarmSettings.value[rSFIndex];
		var rSFMapLevel = game.global.challengeActive === 'Quest' ? -1 : rSFSettings.level;
		var rSFSpecial = game.global.highestRadonLevelCleared > 83 ? "lmc" : "smc";
		var rSFJobRatio = '0,0,0,0';
		var rSFSmithies = game.global.challengeActive === 'Quest' ? game.buildings.Smithy.purchased + 1 : rSFSettings.repeat;

		if (questcheck() === 10 || rSFSettings.autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && smithyMapCount !== [0, 0, 0] && typeof getCurrentMapObject().bonus !== 'undefined') {
				if (getCurrentMapObject().bonus === 'lsc' || getCurrentMapObject().bonus === 'ssc') game.global.mapRunCounter = smithyMapCount[0];
				else if (getCurrentMapObject().bonus === 'lwc' || getCurrentMapObject().bonus === 'swc') game.global.mapRunCounter = smithyMapCount[1];
				else if (getCurrentMapObject().bonus === 'lmc' || getCurrentMapObject().bonus === 'smc') game.global.mapRunCounter = smithyMapCount[2];
			}

			var rAutoLevel_Repeat = rAutoLevel;
			mapAutoLevel = callAutoMapLevel(rCurrentMap, rAutoLevel, rSFSpecial, null, null, false);
			if (mapAutoLevel !== Infinity) {
				if (rAutoLevel_Repeat !== Infinity && mapAutoLevel !== rAutoLevel_Repeat) {
					if (game.global.mapsActive && typeof getCurrentMapObject().bonus !== 'undefined') {
						if (getCurrentMapObject().bonus === 'lsc' || getCurrentMapObject().bonus === 'ssc') smithyMapCount[0] = game.global.mapRunCounter + 1;
						else if (getCurrentMapObject().bonus === 'lwc' || getCurrentMapObject().bonus === 'swc') smithyMapCount[1] = game.global.mapRunCounter + 1;
						else if (getCurrentMapObject().bonus === 'lmc' || getCurrentMapObject().bonus === 'smc') smithyMapCount[2] = game.global.mapRunCounter + 1;
					}
				}
				rSFMapLevel = mapAutoLevel;
			}
		}
		if (game.global.challengeActive == "Wither" && rSFMapLevel >= 0)
			rSFMapLevel = -1;


		//When mapType is set as Map Count work out how many Smithies we can farm in the amount of maps specified.
		if (questcheck() !== 10 && rSFSettings.mapType === 'Map Count' && rSFSmithies !== 0) {
			var smithyCount = 0;
			//Checking total map count user wants to run
			var totalMaps = rCurrentMap === mapName ? rSFSmithies - game.global.mapRunCounter : rSFSmithies;
			//Calculating cache + jestimp + chronoimp
			var mapTime = totalMaps * 25;
			if (totalMaps > 4) mapTime += (Math.floor(totalMaps / 5) * 45);
			var smithy_Cost_Mult = game.buildings.Smithy.cost.gems[1];

			//Calculating wood & metal earned then using that info to identify how many Smithies you can afford from those values.
			var woodEarned = scaleToCurrentMapLocal(simpleSecondsLocal("wood", mapTime, true, '0,1,0'), false, true, rSFMapLevel);
			var metalEarned = scaleToCurrentMapLocal(simpleSecondsLocal("metal", mapTime, true, '0,0,1'), false, true, rSFMapLevel);
			var woodSmithies = game.buildings.Smithy.purchased + getMaxAffordable(Math.pow((smithy_Cost_Mult), game.buildings.Smithy.owned) * game.buildings.Smithy.cost.wood[0], (game.resources.wood.owned + woodEarned), (smithy_Cost_Mult), true)
			var metalSmithies = game.buildings.Smithy.purchased + getMaxAffordable(Math.pow((smithy_Cost_Mult), game.buildings.Smithy.owned) * game.buildings.Smithy.cost.wood[0], (game.resources.metal.owned + metalEarned), (smithy_Cost_Mult), true)

			if (woodSmithies > 0 && metalSmithies > 0) {
				//Taking the minimum value of the 2 to see which is more reasonable to aim for
				smithyCount = Math.min(woodSmithies, metalSmithies)

				//Figuring out Smithy cost of the 2 different resources
				var rSFWoodCost = getBuildingItemPrice(game.buildings.Smithy, 'wood', false, smithyCount - game.buildings.Smithy.purchased);
				var rSFMetalCost = getBuildingItemPrice(game.buildings.Smithy, 'metal', false, smithyCount - game.buildings.Smithy.purchased);

				//Looking to see how many maps it would take to reach this smithy target
				var rSFWoodMapCount = Math.floor((rSFWoodCost - game.resources.wood.owned) / scaleToCurrentMapLocal(simpleSecondsLocal("wood", 34, true, '0,1'), false, true, rSFMapLevel));
				var rSFMetalMapCount = Math.floor((rSFMetalCost - game.resources.metal.owned) / scaleToCurrentMapLocal(simpleSecondsLocal("metal", 34, true, '0,0,1'), false, true, rSFMapLevel));
				//If combined maps for both resources is higher than desired maps to be run then will farm 1 less smithy
				if ((rSFWoodMapCount + rSFMetalMapCount) > rSFSmithies) rSFSmithies = smithyCount - 1
				else rSFSmithies = smithyCount;
			}
			else rSFSmithies = 1;
		}

		//Checking for daily resource shred
		if (typeof game.global.dailyChallenge.hemmorrhage !== 'undefined' && smithyShred) {
			var rSFSpecialTime = game.global.highestRadonLevelCleared > 83 ? 20 : 10;

			if (woodShred && metalShred) {
				var woodGain = scaleToCurrentMapLocal(simpleSecondsLocal("wood", rSFSpecialTime, true, '0,1,0,0'), false, true, rSFMapLevel);
				var metalGain = scaleToCurrentMapLocal(simpleSecondsLocal("metal", rSFSpecialTime, true, '0,0,1,0'), false, true, rSFMapLevel);
			}
			else if (woodShred) {
				var woodGain = scaleToCurrentMapLocal(simpleSecondsLocal("wood", (rSFSpecialTime * 2) + 45, true, '0,1,0,0'), false, true, rSFMapLevel);
				var metalGain = Infinity;
			}
			else if (metalShred) {
				var woodGain = Infinity;
				var metalGain = scaleToCurrentMapLocal(simpleSecondsLocal("metal", (rSFSpecialTime * 2) + 45, true, '0,0,1,0'), false, true, rSFMapLevel);
			}
			var smithy_Cost_Mult = game.buildings.Smithy.cost.gems[1];
			var smithy_Max_Affordable = [getMaxAffordable(Math.pow((smithy_Cost_Mult), game.buildings.Smithy.owned) * game.buildings.Smithy.cost.gems[0], (Infinity), (smithy_Cost_Mult), true),
			getMaxAffordable(Math.pow((smithy_Cost_Mult), game.buildings.Smithy.owned) * game.buildings.Smithy.cost.metal[0], (woodGain), (smithy_Cost_Mult), true),
			getMaxAffordable(Math.pow((smithy_Cost_Mult), game.buildings.Smithy.owned) * game.buildings.Smithy.cost.wood[0], (metalGain), (smithy_Cost_Mult), true)];
			var smithy_Can_Afford = game.buildings.Smithy.purchased + Math.min(smithy_Max_Affordable[0], smithy_Max_Affordable[1], smithy_Max_Affordable[2]);
			rSFSmithies = smithy_Can_Afford > 0 && rSFSmithies > smithy_Can_Afford ? smithy_Can_Afford : rSFSmithies;
		}

		rSFGoal = 0;

		var smithyGemCost = getBuildingItemPrice(game.buildings.Smithy, 'gems', false, rSFSmithies - game.buildings.Smithy.purchased);
		var smithyWoodCost = getBuildingItemPrice(game.buildings.Smithy, 'wood', false, rSFSmithies - game.buildings.Smithy.purchased);
		var smithyMetalCost = getBuildingItemPrice(game.buildings.Smithy, 'metal', false, rSFSmithies - game.buildings.Smithy.purchased);

		if (rSFSmithies > game.buildings.Smithy.purchased) {
			if (smithyGemCost > game.resources.gems.owned) {
				rShouldSmithyGemFarm = true;
				rSFSpecial = game.global.highestRadonLevelCleared > 83 ? "lsc" : "ssc";
				rSFJobRatio = '1,0,0,0';
				rSFGoal = smithyGemCost.toExponential(2) + ' gems.';
			}
			else if (smithyWoodCost > game.resources.wood.owned) {
				rShouldSmithyWoodFarm = true;
				rSFSpecial = game.global.highestRadonLevelCleared > 83 ? "lwc" : "swc";
				rSFJobRatio = '0,1,0,0';
				rSFGoal = smithyWoodCost.toExponential(2) + ' wood.';
			}
			else if (smithyMetalCost > game.resources.metal.owned) {
				rShouldSmithyMetalFarm = true;
				rSFSpecial = game.global.highestRadonLevelCleared > 83 ? "lmc" : "smc";
				rSFJobRatio = '0,0,1,0';
				rSFGoal = smithyMetalCost.toExponential(2) + ' metal.';
			}
			rShouldSmithyFarm = true;
		}

		if ((!autoTrimpSettings.RBuyBuildingsNew.enabled || !autoTrimpSettings.rBuildingSettingsArray.value.Smithy.enabled || game.global.challengeActive === 'Hypothermia') && rShouldSmithyFarm && rSFSmithies > game.buildings.Smithy.purchased && canAffordBuilding('Smithy', false, false, false, false, 1)) {
			buyBuilding("Smithy", true, true, 1);
		}

		//Recycles map if we don't need to finish it for meeting the farm requirements
		if (rCurrentMap === mapName && !dontRecycleMaps) {
			if (game.global.mapsActive && typeof getCurrentMapObject().bonus !== 'undefined' && ((!rShouldSmithyGemFarm && getCurrentMapObject().bonus.includes('sc')) || (!rShouldSmithyWoodFarm && getCurrentMapObject().bonus.includes('wc')) || (!rShouldSmithyMetalFarm && getCurrentMapObject().bonus.includes('mc')))) {
				if (getCurrentMapObject().bonus === 'lsc' || getCurrentMapObject().bonus === 'ssc') rSFMapRepeats[0] = game.global.mapRunCounter + (game.global.mapsActive ? (getCurrentMapCell().level - 1) / getCurrentMapObject().size : 0);
				else if (getCurrentMapObject().bonus === 'lwc' || getCurrentMapObject().bonus === 'swc') rSFMapRepeats[1] = game.global.mapRunCounter + (game.global.mapsActive ? (getCurrentMapCell().level - 1) / getCurrentMapObject().size : 0);
				else if (getCurrentMapObject().bonus === 'lmc' || getCurrentMapObject().bonus === 'smc') rSFMapRepeats[2] = game.global.mapRunCounter + (game.global.mapsActive ? (getCurrentMapCell().level - 1) / getCurrentMapObject().size : 0);
				if (!dontRecycleMaps) {
					mapsClicked();
					recycleMap();
				}
			}
		}
		if (rCurrentMap === mapName && !rShouldSmithyFarm) {
			if (getPageSetting('rMapRepeatCount')) debug("Smithy Farm took " + rSFMapRepeats[0] + " food map" + (rSFMapRepeats[0] === 1 ? ", " : "s, ") + rSFMapRepeats[1] + " wood map" + (rSFMapRepeats[1] === 1 ? ", " : "s, ") + rSFMapRepeats[2] + " metal map" + (rSFMapRepeats[2] === 1 ? " " : "s ") + " (" + (rSFMapLevel >= 0 ? "+" : "") + rSFMapLevel + ")" + " and " + formatTimeForDescriptions(timeForFormatting(currTime > 0 ? currTime : getGameTime())) + " to complete on z" + game.global.world + ". You ended it with " + game.buildings.Smithy.purchased + " smithies.");
			rCurrentMap = undefined;
			mapAutoLevel = Infinity;
			if (document.getElementById('autoStructureBtn').classList.contains("enabled") && !getAutoStructureSetting().enabled)
				toggleAutoStructure();
			rSFMapRepeats = [0, 0, 0];
			smithyMapCount = [0, 0, 0];
			currTime = 0;
			game.global.mapRunCounter = 0;
			HDRatio = RcalcHDratio();
			if (game.global.challengeActive !== 'Quest' && rSFSettings.meltingPoint) runUnique('Melting Point', false);
			rSFSettings.done = totalPortals + "_" + game.global.world;
			return farmingDetails;
		}

		var repeat = game.global.mapsActive && ((getCurrentMapObject().level - game.global.world) !== rSFMapLevel || getCurrentMapObject().bonus !== rSFSpecial);
		var status = 'Smithy Farming for ' + rSFGoal;

		farmingDetails.shouldRun = rShouldSmithyFarm;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = rSFMapLevel;
		farmingDetails.autoLevel = questcheck() === 10 ? true : rSFSettings.autoLevel;
		farmingDetails.jobRatio = rSFJobRatio;
		farmingDetails.special = rSFSpecial;
		farmingDetails.smithies = rSFSmithies;
		farmingDetails.farmGoal = rSFGoal;
		farmingDetails.gemFarm = rShouldSmithyGemFarm;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;

	}
	return farmingDetails;
}

var rWFDebug = 0;

//Worshipper Farm -- WORKING AS IS
function WorshipperFarm() {
	const mapName = 'rWorshipperFarm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};
	if (game.jobs.Worshipper.locked || !autoTrimpSettings.rWorshipperFarmDefaultSettings.value.active) return farmingDetails;
	const isC3 = game.global.runningChallengeSquared || game.global.challengeActive === 'Mayhem' || game.global.challengeActive === 'Pandemonium';
	const isDaily = game.global.challengeActive === 'Daily';
	const currChall = game.global.challengeActive;
	const rWFBaseSetting = autoTrimpSettings.rWorshipperFarmSettings.value

	var rShouldWorshipperFarm = false;
	var rShouldSkip = false;
	var mapAutoLevel = Infinity;

	var rWFIndex;
	for (var y = 0; y < rWFBaseSetting.length; y++) {
		const currSetting = rWFBaseSetting[y];
		if (!currSetting.active || game.global.world < currSetting.world || game.global.world > currSetting.endzone || (game.global.world > currSetting.zone && currSetting.repeatevery === 0)) {
			continue;
		}
		if (currSetting.runType !== 'All') {
			if (!isC3 && !isDaily && (currSetting.runType !== 'Filler' ||
				(currSetting.runType === 'Filler' && (currSetting.challenge !== 'All' && currSetting.challenge !== currChall)))) continue;
			if (isDaily && currSetting.runType !== 'Daily') continue;
			if (isC3 && (currSetting.runType !== 'C3' ||
				(currSetting.runType === 'C3' && (currSetting.challenge3 !== 'All' && currSetting.challenge3 !== currChall)))) continue;
		}
		if (game.global.world === currSetting.world && game.global.lastClearedCell + 2 >= currSetting.cell) {
			rWFIndex = y;
			break;
		}
		if ((game.global.world - currSetting.world) % currSetting.repeatevery === 0 && game.global.lastClearedCell + 2 >= currSetting.cell) {
			rWFIndex = y;
			break;
		}
	}

	if (rWFIndex >= 0) {
		var rWFSettings = rWFBaseSetting[rWFIndex];
		rWFGoal = rWFSettings.worshipper;
		var rWFMapLevel = rWFSettings.level;
		var rWFJobRatio = rWFSettings.jobratio;
		var rWFSpecial = game.global.highestRadonLevelCleared > 83 ? "lsc" : "ssc";

		if (rWFSettings.autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && rWFMapRepeats !== 0) {
				game.global.mapRunCounter = rWFMapRepeats;
				rWFMapRepeats = 0;
			}
			var rAutoLevel_Repeat = rAutoLevel;
			mapAutoLevel = callAutoMapLevel(rCurrentMap, rAutoLevel, rWFSpecial, null, null, false);
			if (mapAutoLevel !== Infinity) {
				if (rAutoLevel_Repeat !== Infinity && mapAutoLevel !== rAutoLevel_Repeat) rWFMapRepeats = game.global.mapRunCounter + 1;
				rWFMapLevel = mapAutoLevel;
			}
		}

		if (game.global.challengeActive == "Wither" && rWFMapLevel >= 0) rWFMapLevel = -1;
		if (game.jobs.Worshipper.owned != 50 && game.stats.zonesCleared.value != rWFDebug && (scaleToCurrentMapLocal(simpleSecondsLocal("food", 20, true, rWFJobRatio), false, true, rWFMapLevel) < (game.jobs.Worshipper.getCost() * autoTrimpSettings.rWorshipperFarmDefaultSettings.value.shipskip))) {
			debug("Skipping Worshipper farming on zone " + game.global.world + " as 1 " + rWFSpecial + " map doesn't provide " + autoTrimpSettings.rWorshipperFarmDefaultSettings.value.shipskip + " or more Worshippers. Evaluate your map settings to correct this");
			rWFDebug = game.stats.zonesCleared.value;
		}
		if (game.jobs.Worshipper.owned != 50 && rWFGoal > game.jobs.Worshipper.owned && scaleToCurrentMapLocal(simpleSecondsLocal("food", 20, true, rWFJobRatio), false, true, rWFMapLevel) >= (game.jobs.Worshipper.getCost() * autoTrimpSettings.rWorshipperFarmDefaultSettings.value.shipskip))
			rShouldWorshipperFarm = true;


		if (rCurrentMap === mapName && !rShouldWorshipperFarm) {
			if (getPageSetting('rMapRepeatCount') && !rShouldSkip) debug("Worshipper Farm took " + (game.global.mapRunCounter) + " (" + (rWFMapLevel >= 0 ? "+" : "") + rWFMapLevel + " " + rWFSpecial + ")" + (game.global.mapRunCounter == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime > 0 ? currTime : getGameTime())) + " to complete on zone " + game.global.world + ".");
			if (getPageSetting('rMapRepeatCount') && rShouldSkip) debug("Worshipper Farm was skipped on zone " + game.global.world + " as you already had " + rWFGoal + " worshippers.");
			rCurrentMap = undefined;
			mapAutoLevel = Infinity;
			rWFMapRepeats = 0;
			currTime = 0;
			game.global.mapRunCounter = 0;
		}

		var repeat = game.global.mapsActive && ((getCurrentMapObject().level - game.global.world) !== rWFMapLevel || getCurrentMapObject().bonus !== rWFSpecial);
		var status = 'Worshipper Farm: ' + game.jobs.Worshipper.owned + "/" + rWFGoal;

		farmingDetails.shouldRun = rShouldWorshipperFarm;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = rWFMapLevel;
		farmingDetails.autoLevel = rWFSettings.autoLevel;
		farmingDetails.jobRatio = rWFJobRatio;
		farmingDetails.special = rWFSpecial;
		farmingDetails.worshipper = rWFGoal;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;

	}
	return farmingDetails;
}

//NEEDS REWRITTEN
//Daily (bloodthirst), Unbalance & Storm Destacking -- WORKING AS IS
function MapDestacking() {

	const mapName = 'rDestack';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};

	if (
		!(getPageSetting('rUnbalance') && game.global.challengeActive == "Unbalance") &&
		!(getPageSetting('Rstormon') && game.global.challengeActive == "Storm") &&
		!(game.global.challengeActive === 'Daily' && getPageSetting('rBloodthirstDestack') && typeof game.global.dailyChallenge.bloodthirst !== 'undefined')
	)
		return farmingDetails;

	var rShouldUnbalance = false;
	var rShouldStorm = false;
	var rShouldBloodthirst = false;
	var rShouldDestack = false;
	var rDMapLevel = -(game.global.world - 6)
	var rDSpecial = 'fa';
	var rDDestack = 0;

	//Unbalance Destacking
	var rUnbalanceZone = getPageSetting('rUnbalanceZone') > 0 ? getPageSetting('rUnbalanceZone') : Infinity;
	var rUnbalanceStacks = getPageSetting('rUnbalanceStacks') > 0 ? getPageSetting('rUnbalanceStacks') : Infinity;

	if (game.global.challengeActive == "Unbalance") {
		rShouldUnbalance = (((game.global.mapsActive ? Infinity : autoBattle.oneTimers.Burstier.owned ? 4 : 5) - game.heirlooms.Shield.gammaBurst.stacks !== 0) && game.global.world >= rUnbalanceZone && (game.challenges.Unbalance.balanceStacks >= rUnbalanceStacks || (getPageSetting('rUnbalanceImprobDestack') && game.global.lastClearedCell + 2 == 100 && game.challenges.Unbalance.balanceStacks != 0)));
		rDDestack = game.challenges.Unbalance.balanceStacks;
	}

	//Bloodthirst Destacking
	if (game.global.challengeActive === 'Daily' && !game.global.mapsActive && game.global.dailyChallenge.bloodthirst.stacks >= dailyModifiers.bloodthirst.getFreq(game.global.dailyChallenge.bloodthirst.strength) - 1) {
		rShouldBloodthirst = true;
		rDDestack = game.global.dailyChallenge.bloodthirst.stacks;
	}

	//Storm Destacking
	var rStormZone = getPageSetting('rStormZone') > 0 ? getPageSetting('rStormZone') : Infinity;
	var rStormStacks = getPageSetting('rStormStacks') > 0 ? getPageSetting('rStormStacks') : Infinity;

	if (game.global.challengeActive == "Storm") {
		rShouldStorm = (game.global.world >= rStormZone && (game.challenges.Storm.beta >= rStormStacks && game.challenges.Storm.beta != 0));
		rDDestack = game.challenges.Storm.beta;
	}
	//Recycles the map we're running if you have 0 stacks of balance and the map is level 6 as that's the only time we should be running a map at this level.
	if (rShouldUnbalance || rShouldStorm || rShouldBloodthirst)
		rShouldDestack = true;

	if (game.global.mapsActive && getCurrentMapObject().level == 6 &&
		(
			(game.global.challengeActive === 'Daily' && !rShouldBloodthirst && game.global.dailyChallenge.bloodthirst.stacks === 0) ||
			(game.global.challengeActive == "Unbalance" && !rShouldUnbalance && game.challenges.Unbalance.balanceStacks == 0) ||
			(game.global.challengeActive == "Storm" && !rShouldStorm && game.challenges.Storm.beta == 0)
		)
	) {
		mapsClicked();
		recycleMap();
	}

	var repeat = game.global.mapsActive && ((getCurrentMapObject().level - game.global.world) !== rDMapLevel || getCurrentMapObject().bonus !== rDSpecial || (getCurrentMapObject().size - getCurrentMapCell().level) > rDDestack);
	var status = 'Destacking: ' + rDDestack + ' stacks remaining';

	farmingDetails.shouldRun = rShouldDestack;
	farmingDetails.mapName = mapName;
	farmingDetails.mapLevel = rDMapLevel;
	farmingDetails.autoLevel = false;
	farmingDetails.special = rDSpecial;
	farmingDetails.destack = rDDestack;
	farmingDetails.repeat = !repeat;
	farmingDetails.status = status;


	return farmingDetails;
}

//Prestige variables == TO GET SORTED LATER!
var RAMPfragmappy = undefined;
var RAMPprefragmappy = undefined;
var RAMPpMap = new Array(5);
var RAMPrepMap = new Array(5);
var RAMPmapbought = [[false], [false], [false], [false], [false]];
RAMPmapbought.fill(false); //Unsure if necessary - Need to test
var RAMPfragmappybought = false;
var RAMPfragfarming = false;
var runningPrestigeMaps = false;

//Prestige Raiding -- WORKING AS IS
function PrestigeRaiding() {

	const mapName = 'rPrestige'
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};

	if (!autoTrimpSettings.rRaidingDefaultSettings.value.active) return farmingDetails;

	var rShouldPrestigeRaid = false;
	const isC3 = game.global.runningChallengeSquared || game.global.challengeActive === 'Mayhem' || game.global.challengeActive === 'Pandemonium';
	const isDaily = game.global.challengeActive === 'Daily';
	const currChall = game.global.challengeActive;
	const rRaidingBaseSetting = autoTrimpSettings.rRaidingSettings.value;

	var rRaidingIndex;

	for (var y = 0; y < rRaidingBaseSetting.length; y++) {
		const currSetting = rRaidingBaseSetting[y];
		if (!currSetting.active || game.global.world < currSetting.world || game.global.lastClearedCell + 2 < currSetting.cell || Rgetequips(currSetting.raidingzone, false) === 0) {
			continue;
		}
		if (currSetting.runType !== 'All') {
			if (!isC3 && !isDaily && (currSetting.runType !== 'Filler' ||
				(currSetting.runType === 'Filler' && (currSetting.challenge !== 'All' && currSetting.challenge !== currChall)))) continue;
			if (isDaily && currSetting.runType !== 'Daily') continue;
			if (isC3 && (currSetting.runType !== 'C3' ||
				(currSetting.runType === 'C3' && (currSetting.challenge3 !== 'All' && currSetting.challenge3 !== currChall)))) continue;
		}
		if (game.global.world === currSetting.world) {
			rRaidingIndex = y;
			break;
		}
	}

	if (rRaidingIndex >= 0) {
		//Setting up variables and checking if we should use daily settings instead of normal Prestige Farm settings
		var rRaidingSettings = rRaidingBaseSetting[rRaidingIndex];
		raidzones = rRaidingSettings.raidingzone;
		var rPRRecycle = autoTrimpSettings.rRaidingDefaultSettings.value.recycle;
		var rPRFragFarm = rRaidingSettings.raidingDropdown;

		if (Rgetequips(raidzones, false) > 0) {
			rShouldPrestigeRaid = true;
		}

		var status = 'Prestige Raiding: ' + Rgetequips(raidzones, false) + ' items remaining';

		farmingDetails.shouldRun = rShouldPrestigeRaid;
		farmingDetails.mapName = mapName;
		farmingDetails.recycle = rPRRecycle;
		farmingDetails.fragSetting = rPRFragFarm;
		farmingDetails.status = status;
	}


	//Resetting variables and recycling the maps used
	if (!rShouldPrestigeRaid && (rCurrentMap === mapName || (RAMPrepMap[0] != undefined || RAMPrepMap[1] != undefined || RAMPrepMap[2] != undefined || RAMPrepMap[3] != undefined || RAMPrepMap[4] != undefined))) {
		RAMPfragmappy = undefined;
		RAMPprefragmappy = undefined;
		RAMPfragmappybought = false;
		for (var x = 0; x < 5; x++) {
			RAMPpMap[x] = undefined;
			RAMPmapbought[x] = undefined;

			if (RAMPrepMap[x] != undefined) {
				if (autoTrimpSettings.rRaidingDefaultSettings.value.recycle) {
					recycleMap(getMapIndex(RAMPrepMap[x]));
				}
				RAMPrepMap[x] = undefined;
			}
		}
	}

	return farmingDetails;
}

//Running Prestige Raid Code -- WORKING AS IS
function rRunRaid() {
	var RAMPfragcheck = true;
	rPRFragFarm = rMapSettings.fragSetting;
	if (rPRFragFarm > 0) {
		if (RAMPfrag(raidzones, rPRFragFarm) == true) {
			RAMPfragcheck = true;
			RAMPfragfarming = false;
		} else if (RAMPfrag(raidzones, rPRFragFarm) == false && !RAMPmapbought[0] && !RAMPmapbought[1] && !RAMPmapbought[2] && !RAMPmapbought[3] && !RAMPmapbought[4]) {
			RAMPfragfarming = true;
			RAMPfragcheck = false;
			if (!RAMPfragcheck && RAMPfragmappy == undefined && !RAMPfragmappybought && game.global.preMapsActive) {
				debug("Check complete for frag map");
				fragmap();
				if ((updateMapCost(true) <= game.resources.fragments.owned)) {
					buyMap();
					RAMPfragmappybought = true;
					if (RAMPfragmappybought) {
						RAMPfragmappy = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
						debug("Frag map bought");
					}
				}
			}
			if (!RAMPfragcheck && game.global.preMapsActive && !game.global.mapsActive && RAMPfragmappybought && RAMPfragmappy != undefined) {
				debug("Running frag map");
				selectedMap = RAMPfragmappy;
				selectMap(RAMPfragmappy);
				runMap();
				RlastMapWeWereIn = getCurrentMapObject();
				RAMPprefragmappy = RAMPfragmappy;
				RAMPfragmappy = undefined;
			}
			if (!RAMPfragcheck && game.global.mapsActive && RAMPfragmappybought && RAMPprefragmappy != undefined) {
				if (RAMPfrag(raidzones, rPRFragFarm) == false) {
					if (!game.global.repeatMap) {
						repeatClicked();
					}
				} else if (RAMPfrag(raidzones, rPRFragFarm) == true) {
					if (game.global.repeatMap) {
						repeatClicked();
						mapsClicked();
					}
					if (game.global.preMapsActive && RAMPfragmappybought && RAMPprefragmappy != undefined) {
						RAMPfragmappybought = false;
					}
					if (RAMPprefragmappy != undefined) {
						recycleMap(getMapIndex(RAMPprefragmappy));
						RAMPprefragmappy = undefined;
					}
					RAMPfragcheck = true;
					RAMPfragfarming = false;
				}
			}
		} else {
			RAMPfragcheck = true;
			RAMPfragfarming = false;
		}
	}
	if (RAMPfragcheck) {
		raiding = rPRFragFarm == 2 ? RAMPplusPresfragmax : rPRFragFarm == 1 ? RAMPplusPresfragmin : RAMPplusPres;
		document.getElementById("mapLevelInput").value = game.global.world;
		incrementMapLevel(1);
		for (var x = 0; x < 5; x++) {
			if (RAMPpMap[x] == undefined && !RAMPmapbought[x] && game.global.preMapsActive && RAMPshouldrunmap(x, raidzones)) {
				raiding(x, raidzones);
				if ((updateMapCost(true) <= game.resources.fragments.owned)) {
					buyMap();
					RAMPmapbought[x] = true;
					if (RAMPmapbought[x]) {
						RAMPpMap[x] = (game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id);
						RAMPMapsRun = x;
						debug("Map " + [(x + 1)] + " bought");
					}
				}
			}
		}

		if (!RAMPmapbought[0] && !RAMPmapbought[1] && !RAMPmapbought[2] && !RAMPmapbought[3] && !RAMPmapbought[4]) {
			RAMPpMap.fill(undefined);
			debug("Failed to Prestige Raid. Looks like you can't afford to or have no equips to get!");
			autoTrimpSettings["RAutoMaps"].value = 0;
		}
		for (var x = RAMPMapsRun; x > -1; x--) {
			if (game.global.preMapsActive && !game.global.mapsActive && RAMPmapbought[x] && RAMPpMap[x] != undefined) {
				debug("Running map " + [(RAMPMapsRun - x + 1)]);
				selectedMap = RAMPpMap[x];
				selectMap(RAMPpMap[x]);
				runMap();
				RlastMapWeWereIn = getCurrentMapObject();
				RAMPrepMap[x] = RAMPpMap[x];
				RAMPpMap[x] = undefined;
				runningPrestigeMaps = true;
			}
		}
	}

	if (game.global.preMapsActive && runningPrestigeMaps) runMap()
}

//Quagmire - Black Bogs -- WORKING AS IS
function Quagmire() {

	var rShouldQuagFarm = false;

	const mapName = 'rQuagmireFarm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};

	if (game.global.challengeActive !== "Quagmire" || !autoTrimpSettings.rQuagDefaultSettings.value.active) return farmingDetails;

	const rQFBaseSettings = autoTrimpSettings.rQuagSettings.value;
	var rQFIndex;
	//Checking to see if any lines are to be run.
	for (var y = 0; y < rQFBaseSettings.length; y++) {
		const currSetting = rQFBaseSettings[y];
		if (!currSetting.active || game.global.world !== currSetting.world || game.global.lastClearedCell + 2 < currSetting.cell) {
			continue;
		}

		if (game.global.world === currSetting.world) {
			rQFIndex = y;
			break;
		}
	}

	if (rQFIndex >= 0) {

		var rQuagFarmSettings = rQFBaseSettings[rQFIndex];
		var rQFJobRatio = rQuagFarmSettings.jobratio
		stacksum = 0;

		for (var i = 0; i < (rQFIndex + 1); i++) {
			if (!autoTrimpSettings.rQuagSettings.value[i].active) continue;
			stacksum += parseInt(autoTrimpSettings.rQuagSettings.value[i].bogs);
		}

		totalstacks = 100 - stacksum;

		if ((game.challenges.Quagmire.motivatedStacks > totalstacks))
			rShouldQuagFarm = true;

		if (rCurrentMap === mapName && !rShouldQuagFarm) {
			rCurrentMap = undefined;
			if (getPageSetting('rMapRepeatCount')) debug("Quag Farm took " + (game.global.mapRunCounter) + (game.global.mapRunCounter == 1 ? " map" : " maps") + " to complete on zone " + game.global.world + ".")
		}

		var repeat = game.global.mapsActive && (getCurrentMapObject().name !== 'The Black Bog' || (game.challenges.Quagmire.motivatedStacks - totalstacks) === 1);
		var status = 'Black Bogs: ' + game.challenges.Quagmire.motivatedStacks - totalstacks + " remaining";

		farmingDetails.shouldRun = rShouldQuagFarm;
		farmingDetails.mapName = mapName;
		farmingDetails.jobRatio = rQFJobRatio;
		farmingDetails.bogs = totalstacks;
		farmingDetails.bogsToClear = game.challenges.Quagmire.motivatedStacks - totalstacks;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
	}

	return farmingDetails;
}

//Quest -- WORKING AS IS
function Quest() {

	var rShouldQuest = 0;

	const mapName = 'rQuest';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};

	if (game.global.challengeActive !== "Quest" || !getPageSetting('rQuest') || game.global.world < game.challenges.Quest.getQuestStartZone()) return farmingDetails;

	rShouldQuest = questcheck() == 1 ? 1 :
		questcheck() == 2 ? 2 :
			questcheck() == 3 ? 3 :
				questcheck() == 4 ? 4 :
					questcheck() == 5 ? 5 :
						questcheck() == 6 ? 6 :
							questcheck() == 7 && (RcalcOurDmg('min', 0, 'world') < game.global.gridArray[50].maxHealth) && !(game.portal.Tenacity.getMult() === Math.pow(1.4000000000000001, getPerkLevel("Tenacity") + getPerkLevel("Masterfulness"))) ? 7 :
								questcheck() == 8 ? 8 :
									questcheck() == 9 ? 9 :
										0;

	if (rShouldQuest) {
		var rQuestArray = rShouldQuest == 1 || rShouldQuest == 4 ? ['lsc', '1'] : rShouldQuest == 2 ? ['lwc', '0,1'] : rShouldQuest == 3 || rShouldQuest == 7 ? ['lmc', '0,0,1'] : rShouldQuest === 5 ? ['fa', '0,0,0,1'] : ['fa', '0,0,0,0']
		var rQuestSpecial = rQuestArray[0]
		var rQuestJobRatio = rQuestArray[1];
		var rQuestMax = rShouldQuest === 6 ? 10 : null;
		var rQuestMin = rShouldQuest === 6 ? 0 : null;

		if (game.global.mapRunCounter === 0 && game.global.mapsActive && rMapRepeats !== 0) {
			game.global.mapRunCounter = rMapRepeats;
			rMapRepeats = 0;
		}
		var rAutoLevel_Repeat = rAutoLevel;
		mapAutoLevel = callAutoMapLevel(rCurrentMap, rAutoLevel, rQuestSpecial, rQuestMax, rQuestMin, false);
		if (mapAutoLevel !== Infinity) {
			if (rAutoLevel_Repeat !== Infinity && mapAutoLevel !== rAutoLevel_Repeat) rMapRepeats = game.global.mapRunCounter + 1;
			rQuestMapLevel = mapAutoLevel;
		}

		var repeat = game.global.mapsActive && ((getCurrentMapObject().level - game.global.world) !== rQuestMapLevel || getCurrentMapObject().bonus !== rQuestSpecial || (rShouldQuest == 6 && (game.global.mapBonus >= 4 || getCurrentMapObject().level - game.global.world < 0)));

		var status = 'Questing: ' + game.challenges.Quest.getQuestProgress();

		farmingDetails.shouldRun = rShouldQuest;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = rQuestMapLevel;
		farmingDetails.autoLevel = true;
		farmingDetails.special = rQuestSpecial;
		farmingDetails.jobRatio = rQuestJobRatio;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;

	}
	if (rCurrentMap === mapName && !farmingDetails.shouldRun) {
		if (getPageSetting('rMapRepeatCount')) debug("Questing took " + (game.global.mapRunCounter) + (game.global.mapRunCounter == 1 ? " map" : " maps") + " to complete on zone " + game.global.world + ".")
		if (game.global.mapsActive) mapsClicked();
		if (game.global.preMapsActive && game.global.currentMapId !== '') recycleMap();
		rCurrentMap = undefined;
		rAutoLevel = Infinity;
		rMapRepeats = 0;
	}

	return farmingDetails;

}

//Mayhem -- WORKING AS IS
function Mayhem() {

	const mapName = 'rMayhem';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};

	if (game.global.challengeActive !== "Mayhem" || !getPageSetting('rMayhem')) return farmingDetails;

	var rShouldMayhem = false;
	var mapAutoLevel = Infinity;

	var destackHits = getPageSetting('rMayhemDestack') > 0 ? getPageSetting('rMayhemDestack') : Infinity;
	var destackZone = getPageSetting('rMayhemZone') > 0 ? getPageSetting('rMayhemZone') : Infinity;
	var rMayhemMapLevel = 0;
	var rMayhemMapIncrease = getPageSetting('rMayhemMapIncrease') > 0 ? getPageSetting('rMayhemMapIncrease') : 0;
	var hyperspeed2 = game.talents.liquification3.purchased ? 75 : game.talents.hyperspeed2.purchased ? 50 : 0;
	var rMayhemSpecial = (Math.floor(game.global.highestRadonLevelCleared + 1) * (hyperspeed2 / 100) >= game.global.world ? "lmc" : "fa");
	if (game.challenges.Mayhem.stacks > 0 && (HDRatio > destackHits || game.global.world >= destackZone))
		rShouldMayhem = true;

	if (game.global.mapRunCounter === 0 && game.global.mapsActive && rMayhemMapRepeats !== 0) {
		game.global.mapRunCounter = rMayhemMapRepeats;
		rMayhemMapRepeats = 0;
	}
	var rAutoLevel_Repeat = rAutoLevel;
	mapAutoLevel = callAutoMapLevel(rCurrentMap, rAutoLevel, rMayhemSpecial, 10, 0, false);
	if (mapAutoLevel !== Infinity) {
		if (rAutoLevel_Repeat !== Infinity && mapAutoLevel !== rAutoLevel_Repeat) rMayhemMapRepeats = game.global.mapRunCounter + 1;
		rMayhemMapLevel = (mapAutoLevel + rMayhemMapIncrease > 10 ? 10 : mapAutoLevel + rMayhemMapIncrease);
	}

	var repeat = game.global.mapsActive && ((getCurrentMapObject().level - game.global.world) !== rMayhemMapLevel || getCurrentMapObject().bonus !== rMayhemSpecial || game.challenges.Mayhem.stacks <= rMayhemMapLevel + 1);
	var status = 'Mayhem Destacking: ' + game.challenges.Mayhem.stacks + " remaining";

	farmingDetails.shouldRun = rShouldMayhem;
	farmingDetails.mapName = mapName;
	farmingDetails.mapLevel = rMayhemMapLevel;
	farmingDetails.autoLevel = true;
	farmingDetails.special = rMayhemSpecial;
	farmingDetails.repeat = !repeat;
	farmingDetails.status = status;

	if (rCurrentMap === mapName && !farmingDetails.shouldRun) {
		if (getPageSetting('rMapRepeatCount')) debug("Mayhem Destacking took " + (game.global.mapRunCounter) + " (" + (rMayhemMapLevel >= 0 ? "+" : "") + rMayhemMapLevel + " " + rMayhemSpecial + ")" + (game.global.mapRunCounter == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime > 0 ? currTime : getGameTime())) + " to complete on zone " + game.global.world + ".");
		rCurrentMap = undefined;
		rAutoLevel = Infinity;
		rMayhemMapRepeats = 0;
		currTime = 0;
		game.global.mapRunCounter = 0;
		mapAutoLevel = Infinity;
	}
	return farmingDetails;
}

//Insanity Farm -- WORKING AS IS
function Insanity() {

	const mapName = 'rInsanityFarm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};
	if (game.global.challengeActive !== "Insanity" || !autoTrimpSettings.rInsanityDefaultSettings.value.active) return farmingDetails;

	var rShouldInsanityFarm = false;
	var mapAutoLevel = Infinity;

	const rIFBaseSettings = autoTrimpSettings.rInsanitySettings.value;
	var rIFIndex;
	//Checking to see if any lines are to be run.
	for (var y = 0; y < rIFBaseSettings.length; y++) {
		const currSetting = rIFBaseSettings[y];
		if (!currSetting.active || game.global.world !== currSetting.world || game.global.lastClearedCell + 2 < currSetting.cell) {
			continue;
		}

		if (game.global.world === currSetting.world) {
			rIFIndex = y;
			break;
		}
	}

	if (rIFIndex >= 0) {

		var rIFSettings = rIFBaseSettings[rIFIndex];
		var rIFMapLevel = rIFSettings.level;
		var rIFSpecial = rIFSettings.special;
		var rIFStacks = rIFSettings.insanity;
		var rIFJobRatio = rIFSettings.jobratio;

		if (rIFSettings.autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && rIFMapRepeats !== 0) {
				game.global.mapRunCounter = rIFMapRepeats;
				rIFMapRepeats = 0;
			}
			var rAutoLevel_Repeat = rAutoLevel;
			mapAutoLevel = callAutoMapLevel(rCurrentMap, rAutoLevel, rIFSpecial, null, null, false);
			if (mapAutoLevel !== Infinity) {
				if (rAutoLevel_Repeat !== Infinity && mapAutoLevel !== rAutoLevel_Repeat) rIFMapRepeats = game.global.mapRunCounter + 1;
				rIFMapLevel = mapAutoLevel;
			}
		}

		if (rIFStacks > game.challenges.Insanity.maxInsanity)
			rIFStacks = game.challenges.Insanity.maxInsanity;
		if (rIFStacks > game.challenges.Insanity.insanity || (rIFSettings.destack && game.challenges.Insanity.insanity > rIFStacks))
			rShouldInsanityFarm = true;

		var repeat = game.global.mapsActive && ((getCurrentMapObject().level - game.global.world) !== rIFMapLevel || getCurrentMapObject().bonus !== rIFSpecial || rIFStacks <= game.challenges.Insanity.insanity);
		var status = 'Insanity Farming: ' + game.challenges.Insanity.insanity + "/" + rIFStacks;

		farmingDetails.shouldRun = rShouldInsanityFarm;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = rIFMapLevel;
		farmingDetails.autoLevel = rIFSettings.autoLevel;
		farmingDetails.special = rIFSpecial;
		farmingDetails.jobRatio = rIFJobRatio;
		farmingDetails.insanity = rIFStacks;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;

		if (rCurrentMap === mapName && !farmingDetails.shouldRun) {
			if (getPageSetting('rMapRepeatCount')) debug("Insanity Farm took " + (game.global.mapRunCounter) + " (" + (rIFMapLevel >= 0 ? "+" : "") + rIFMapLevel + " " + rIFSpecial + ")" + (game.global.mapRunCounter == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime > 0 ? currTime : getGameTime())) + " to complete on zone " + game.global.world + ". You ended it with " + game.challenges.Insanity.insanity + " insanity stacks.");
			rCurrentMap = undefined;
			mapAutoLevel = Infinity;
			rIFMapRepeats = 0;
			currTime = 0;
			game.global.mapRunCounter = 0;
		}

	}

	return farmingDetails;
}

//Pandemonium -- WORKING AS IS
function PandemoniumDestack() {

	var rShouldPandemoniumDestack = false;
	var mapAutoLevel = Infinity;

	const mapName = 'rPandemoniumDestack';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};

	if (game.global.challengeActive !== "Pandemonium" || !getPageSetting('RPandemoniumOn') || game.global.world < getPageSetting('RPandemoniumZone')) return farmingDetails;

	var rPandemoniumMapLevel = 1;
	var hyperspeed2 = game.talents.liquification3.purchased ? 75 : game.talents.hyperspeed2.purchased ? 50 : 0;
	var rPandemoniumSpecial = (Math.floor(game.global.highestRadonLevelCleared + 1) * (hyperspeed2 / 100) >= game.global.world ? "lmc" : game.challenges.Pandemonium.pandemonium > 7 ? "fa" : "lmc");
	var rPandemoniumJobRatio = '0.001,0.001,1,0';


	if (game.global.mapRunCounter === 0 && game.global.mapsActive && rPandemoniumMapRepeats !== 0) {
		game.global.mapRunCounter = rPandemoniumMapRepeats;
		rPandemoniumMapRepeats = 0;
	}
	var rAutoLevel_Repeat = rAutoLevel;
	mapAutoLevel = callAutoMapLevel(rCurrentMap, rAutoLevel, rPandemoniumSpecial, 10, 1, false);
	if (mapAutoLevel !== Infinity) {
		if (rAutoLevel_Repeat !== Infinity && rAutoLevel_Repeat !== mapAutoLevel) rPandemoniumMapRepeats = game.global.mapRunCounter + 1;
		rPandemoniumMapLevel = mapAutoLevel;
	}

	if (game.challenges.Pandemonium.pandemonium !== 0) {
		rShouldPandemoniumDestack = true;
	}

	var repeat = game.global.mapsActive && ((getCurrentMapObject().level - game.global.world) !== rPandemoniumMapLevel || getCurrentMapObject().bonus !== rPandemoniumSpecial || ((game.challenges.Pandemonium.pandemonium - rPandemoniumMapLevel) < rPandemoniumMapLevel));
	var status = 'Pandemonium Destacking: ' + game.challenges.Pandemonium.pandemonium + " remaining";

	farmingDetails.shouldRun = rShouldPandemoniumDestack;
	farmingDetails.mapName = mapName;
	farmingDetails.mapLevel = rPandemoniumMapLevel;
	farmingDetails.autoLevel = true;
	farmingDetails.special = rPandemoniumSpecial;
	farmingDetails.jobRatio = rPandemoniumJobRatio;
	farmingDetails.pandemonium = game.challenges.Pandemonium.pandemonium;
	farmingDetails.repeat = !repeat;
	farmingDetails.status = status;

	if (rCurrentMap === mapName && !rShouldPandemoniumDestack) {
		if (getPageSetting('rMapRepeatCount')) debug("Pandemonium Destacking took " + (game.global.mapRunCounter) + " (" + (rPandemoniumMapLevel >= 0 ? "+" : "") + rPandemoniumMapLevel + " " + rPandemoniumSpecial + ")" + (game.global.mapRunCounter == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime > 0 ? currTime : getGameTime())) + " to complete on zone " + game.global.world + ".");
		rCurrentMap = undefined;
		mapAutoLevel = Infinity;
		rPandemoniumMapRepeats = 0;
		currTime = 0;
		game.global.mapRunCounter = 0;
	}

	return farmingDetails;
}

//Pandemonium Equip Farming -- NEEDS REWRITTEN BUT WORKS AS IS I THINK
function PandemoniumFarm() {

	const mapName = 'rPandemoniumFarm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};

	if (game.global.challengeActive !== 'Pandemonium' || !getPageSetting('RPandemoniumOn') || getPageSetting('RPandemoniumAutoEquip') < 2 || game.global.world === 150 || game.global.lastClearedCell + 2 < 91 || game.challenges.Pandemonium.pandemonium > 0) return farmingDetails;

	var rShouldPandemoniumFarm = false;

	var rPandemoniumJobRatio = '1,1,100,0';
	var equipCost = CheapestEquipmentCost();
	var nextEquipmentCost = equipCost[1];

	var rPandemoniumMapLevel = getPageSetting('PandemoniumFarmLevel');
	var rPandemonium_LMC = scaleToCurrentMapLocal(simpleSecondsLocal("metal", 20, true, rPandemoniumJobRatio), false, true, getPageSetting('PandemoniumFarmLevel'));
	var rPandemonium_HC = rPandemonium_LMC * 2;
	var rPandemoniumSpecial = nextEquipmentCost > rPandemonium_LMC ? 'hc' : 'lmc'

	var rPandemonium_Resource_Gain = rPandemoniumSpecial === 'hc' ? rPandemonium_HC : rPandemonium_LMC;

	//Checking if an equipment level costs less than a cache or a prestige level costs less than a jestimp and if so starts farming.
	if (getPageSetting('RPandemoniumAutoEquip') > 2 && game.global.world >= getPageSetting('RPandemoniumAEZone') && nextEquipmentCost < rPandemonium_Resource_Gain)
		rShouldPandemoniumFarm = true;

	var repeat = game.global.mapsActive && ((getCurrentMapObject().level - game.global.world) !== rPandemoniumMapLevel || getCurrentMapObject().bonus != rPandemoniumSpecial || nextEquipmentCost >= rPandemonium_Resource_Gain);
	var status = 'Pandemonium Farming Equips below ' + prettify(rPandemonium_Resource_Gain);

	if (rShouldPandemoniumFarm) {
		farmingDetails.shouldRun = rShouldPandemoniumFarm;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = rPandemoniumMapLevel;
		farmingDetails.autoLevel = true;
		farmingDetails.special = rPandemoniumSpecial;
		farmingDetails.jobRatio = rPandemoniumJobRatio;
		farmingDetails.gather = 'metal';
		farmingDetails.pandemonium = game.challenges.Pandemonium.pandemonium;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
	}

	return farmingDetails;
}

function PandemoniumJestimpFarm() {

	const mapName = 'rPandemoniumJestimpFarm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};

	if (game.global.challengeActive !== 'Pandemonium' || !getPageSetting('RPandemoniumOn') || getPageSetting('RPandemoniumAutoEquip') < 2 || game.global.world === 150 || game.global.lastClearedCell + 2 < 91 || game.challenges.Pandemonium.pandemonium > 0) return farmingDetails;

	var rShouldPandemoniumJestimpFarm = false;

	var rPandemoniumJobRatio = '0.001,0.001,1,0';
	var equipCost = CheapestEquipmentCost();
	var nextEquipmentCost = equipCost[1];

	var rPandemoniumMapLevel = getPageSetting('PandemoniumJestFarmLevel');
	var rPandemoniumSpecial = 0;

	//Identifying how much metal you'd get from the amount of jestimps you want to farm on the map level you've selected for them
	if (getPageSetting('RPandemoniumAutoEquip') > 3 && game.global.world >= getPageSetting('RPandemoniumJestZone')) {

		var jestDrop = scaleToCurrentMapLocal(simpleSecondsLocal("metal", 45, true, rPandemoniumJobRatio), false, true, rPandemoniumMapLevel);
		var shred = 1 - (0.75 - (rPandemoniumMapLevel * 0.05));
		var kills = getPageSetting('PandemoniumJestFarmKills');
		jestMetalTotal = jestDrop;
		//For loop for adding the metal from subsequent jestimp kills to the base total
		for (i = 1; i < kills; i++) {
			jestMetalTotal += (jestDrop * (Math.pow(shred, i)));
		}
		if ((jestMetalTotal != null && (jestMetalTotal > nextEquipmentCost)) || jestFarmMap == true) {
			rShouldPandemoniumJestimpFarm = true;
			jestFarmMap = true;
			if (!game.global.messages.Loot.exotic)
				game.global.messages.Loot.exotic = true;
		}

		var repeat = nextEquipmentCost > jestMetalTotal;
		var status = 'Jestimp Scumming Equips below ' + prettify(jestMetalTotal);

		farmingDetails.shouldRun = rShouldPandemoniumJestimpFarm;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = rPandemoniumMapLevel;
		farmingDetails.autoLevel = true;
		farmingDetails.gather = 'metal';
		farmingDetails.special = rPandemoniumSpecial;
		farmingDetails.jobRatio = rPandemoniumJobRatio;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
	}

	if (rShouldPandemoniumJestimpFarm) {
		PandemoniumJestimpScumming();
	}

	return farmingDetails;
}

function PandemoniumJestimpScumming() {
	reloadDelay = false;
	//Saves your savefile to a variable when that variable is null and frenzy is active
	if (game.global.mapsActive && game.global.mapGridArray[0].name == "Jestimp" && ((savefile == null && game.portal.Frenzy.frenzyStarted != -1) || (autoBattle.oneTimers.Mass_Hysteria.owned && game.global.soldierHealth == game.global.soldierHealthMax && game.global.mapGridArray[0].health > 0)))
		savefile = save(true);
	//Makes it take another copy of the save if you lose frenzy before killing the Jestimp.
	if (autoBattle.oneTimers.Mass_Hysteria.owned == false && game.global.mapsActive && game.global.lastClearedMapCell == -1 && game.global.mapGridArray[0].name == "Jestimp" && savefile != null && game.portal.Frenzy.frenzyStarted == -1)
		savefile = null;

	//If the last item in the message log doesn't include the word metal it loads your save to reroll for a metal jestimp drop.
	if (game.global.mapsActive && game.global.lastClearedMapCell != -1) {
		if (document.getElementById("log").lastChild != null) {
			if (!document.getElementById("log").lastChild.innerHTML.includes("metal") && savefile != null) {
				tooltip('Import', null, 'update');
				document.getElementById('importBox').value = savefile;
				cancelTooltip();
				load(true);
				reloadDelay = true;
			}
		}
	}

	if (!game.global.mapsActive || (game.global.mapsActive && (game.global.mapGridArray[0].name != "Jestimp" || game.global.lastClearedMapCell != -1))) {
		//Recycles your map if you are past the first cell
		if (game.global.mapsActive && game.global.lastClearedMapCell != -1) {
			mapsClicked();
			recycleMap();
		}
	}
	//Purchases a perfect map with your Jestimp farming level setting, resets savefile variable to null and runs the map
	if (game.global.preMapsActive) {
		PerfectMapCost(getPageSetting('PandemoniumJestFarmLevel'), 0);
		buyMap();
		savefile = null;
		runMap();
	}
	//Repeats the process of exiting and re-entering maps until the first cell is a Jestimp
	for (i = 0; i < 10000; i++) {
		if (game.global.mapsActive) {
			if (game.global.mapGridArray[game.global.lastClearedMapCell + 1].name != "Jestimp") {
				mapsClicked();
				runMap();
			} else if (game.global.mapGridArray[game.global.lastClearedMapCell + 1].name == "Jestimp")
				break
		}
	}

	//Used to abandon current map once the Jestimp farming on your current zone has finished.
	if (jestMetalTotal != null && jestMetalTotal < nextEquipmentCost && jestFarmMap == true) {
		mapsClicked();
		recycleMap();
		jestFarmMap = false;
	}
}

//Alchemy Farm -- WORKING AS IS
function Alchemy() {

	var rShouldAlchFarm = false;
	var mapAutoLevel = Infinity;

	const mapName = 'rAlchemyFarm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};


	if (game.global.challengeActive !== "Alchemy" || !autoTrimpSettings.rAlchDefaultSettings.value.active) return farmingDetails;

	const rAFBaseSettings = autoTrimpSettings.rAlchSettings.value;
	var rAFIndex;

	//Checking to see if any lines are to be run.
	for (var y = 0; y < rAFBaseSettings.length; y++) {
		const currSetting = rAFBaseSettings[y];
		if (!currSetting.active || game.global.world !== currSetting.world || game.global.lastClearedCell + 2 < currSetting.cell) {
			continue;
		}

		if (game.global.world === currSetting.world) {
			rAFIndex = y;
			break;
		}
	}

	if (rAFIndex >= 0) {
		var rAFSettings = rAFBaseSettings[rAFIndex];
		var rAFMapLevel = rAFSettings.level;
		var rAFSpecial = rAFSettings.special;
		var rAFJobRatio = rAFSettings.jobratio;
		var rAFPotions = rAFSettings.potion;

		if (rAFSettings.autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && rAFMapRepeats !== 0) {
				game.global.mapRunCounter = rAFMapRepeats;
				rAFMapRepeats = 0;
			}
			var rAutoLevel_Repeat = rAutoLevel;
			mapAutoLevel = callAutoMapLevel(rCurrentMap, rAutoLevel, rAFSpecial, 10, 1, false);
			if (mapAutoLevel !== Infinity) {
				if (rAutoLevel_Repeat !== Infinity && mapAutoLevel !== rAutoLevel_Repeat) rAFMapRepeats = game.global.mapRunCounter + 1;
				rAFMapLevel = mapAutoLevel;
			}
		}

		rMFMapLevel = mapAutoLevel;
		if (rAFSpecial.includes('l') && rAFSpecial.length === 3 && PerfectMapCost(rAFMapLevel, rAFSpecial) >= game.resources.fragments.owned) rAFSpecial = rAFSpecial.charAt(0) + "sc";

		if (rAFPotions != undefined) {
			//Working out which potion the input corresponds to.
			potion = rAFPotions.charAt('0') == 'h' ? 0 :
				rAFPotions.charAt('0') == 'g' ? 1 :
					rAFPotions.charAt('0') == 'f' ? 2 :
						rAFPotions.charAt('0') == 'v' ? 3 :
							rAFPotions.charAt('0') == 's' ? 4 :
								undefined;

			//Alchemy biome selection, will select Farmlands if it's unlocked and appropriate otherwise it'll use the default map type for that herb.
			rAFBiome = alchObj.potionNames[potion] == alchObj.potionNames[0] ? game.global.farmlandsUnlocked && getFarmlandsResType() == "Metal" ? "Farmlands" : "Mountain" :
				alchObj.potionNames[potion] == alchObj.potionNames[1] ? game.global.farmlandsUnlocked && getFarmlandsResType() == "Wood" ? "Farmlands" : "Forest" :
					alchObj.potionNames[potion] == alchObj.potionNames[2] ? game.global.farmlandsUnlocked && getFarmlandsResType() == "Food" ? "Farmlands" : "Sea" :
						alchObj.potionNames[potion] == alchObj.potionNames[3] ? game.global.farmlandsUnlocked && getFarmlandsResType() == "Gems" ? "Farmlands" : "Depths" :
							alchObj.potionNames[potion] == alchObj.potionNames[4] ? game.global.farmlandsUnlocked && getFarmlandsResType() == "Any" ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Random" :
								game.global.farmlandsUnlocked && getFarmlandsResType() == "Any" ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Random";

			//Doing calcs to identify the total cost of all the Brews/Potions that are being farmed
			//Initialising vars
			var alchmult = rAFBiome == "Farmlands" ? 1.5 : 1;
			var potioncost = 0;
			potioncosttotal = 0;
			var potionscurrent = alchObj.potionsOwned[potion];
			//Identifying current herbs + ones that we'll get from the map we should run
			herbtotal = game.herbs[alchObj.potions[potion].cost[0][0]].cowned + (alchObj.getDropRate(game.global.world + rAFMapLevel) * alchmult);
			//Looping through each potion level and working out their cost to calc total cost
			for (x = potionscurrent; x < (rAFPotions.toString().replace(/[^\d,:-]/g, '')); x++) {
				var potioncost = Math.pow(alchObj.potions[potion].cost[0][2], x) * alchObj.potions[potion].cost[0][1];
				//Checking if the potion being farmed is a Potion and if so factors in compounding cost scaling from other potions owned
				if (!alchObj.potions[potion].enemyMult) {
					var potionsowned = 0;
					//Calculating total level of potions that aren't being farmed
					for (var y = 0; y < alchObj.potionsOwned.length; y++) {
						if (alchObj.potions[y].challenge != (game.global.challengeActive == "Alchemy")) continue;
						if (y != alchObj.potionNames.indexOf(alchObj.potionNames[potion]) && !alchObj.potions[y].enemyMult) potionsowned += alchObj.potionsOwned[y];
					}
					potioncost *= Math.pow(alchObj.allPotionGrowth, potionsowned);
				}
				//Summing cost of potion levels
				potioncosttotal += potioncost;
			}
			if (potion == undefined)
				debug('You have an incorrect value in AF: Potions, each input needs to start with h, g, f, v, or s.');
			else {
				if (rAFPotions.toString().replace(/[^\d:-]/g, '') > potionscurrent) {
					if (alchObj.canAffordPotion(alchObj.potionNames[potion])) {
						for (z = potionscurrent; z < rAFPotions.toString().replace(/[^\d:-]/g, ''); z++) {
							if (potion === 1) {
								if (game.herbs[alchObj.potions[potion].cost[0][0]].cowned > potioncosttotal)
									for (var x = potionscurrent; x < rAFPotions.toString().replace(/[^\d,:-]/g, ''); x++) {
										alchObj.craftPotion(alchObj.potionNames[potion]);
									}
							}
							else alchObj.craftPotion(alchObj.potionNames[potion]);
						}
					}
				}
				if (rAFPotions.toString().replace(/[^\d,:-]/g, '') > alchObj.potionsOwned[potion])
					rShouldAlchFarm = true;
			}

			var repeat = game.global.mapsActive && ((getCurrentMapObject().level - game.global.world) !== rAFMapLevel || getCurrentMapObject().bonus !== rAFSpecial || herbtotal >= potioncosttotal);
			var status = 'Alchemy Farming ' + alchObj.potionNames[potion] + " (" + alchObj.potionsOwned[potion] + "/" + rAFPotions.toString().replace(/[^\d,:-]/g, '') + ")";

			farmingDetails.shouldRun = rShouldAlchFarm;
			farmingDetails.mapName = mapName;
			farmingDetails.mapLevel = rAFMapLevel;
			farmingDetails.autoLevel = rAFSettings.autoLevel;
			farmingDetails.special = rAFSpecial;
			farmingDetails.jobRatio = rAFJobRatio;
			farmingDetails.biome = rAFBiome;
			farmingDetails.herbtotal = herbtotal;
			farmingDetails.potionTotalCost = potioncosttotal;
			farmingDetails.potionName = alchObj.potionNames[potion];
			farmingDetails.potionOwned = alchObj.potionsOwned[potion];
			farmingDetails.potionGoal = rAFPotions.toString().replace(/[^\d,:-]/g, '');
			farmingDetails.repeat = !repeat;
			farmingDetails.status = status;

			if (rCurrentMap === mapName && !farmingDetails.shouldRun) {
				if (getPageSetting('rMapRepeatCount')) debug("Alchemy Farm took " + (game.global.mapRunCounter) + " (" + (rAFMapLevel >= 0 ? "+" : "") + rAFMapLevel + " " + rAFSpecial + ")" + (game.global.mapRunCounter == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime > 0 ? currTime : getGameTime())) + " to complete on zone " + game.global.world + ".");
				rCurrentMap = undefined;
				mapAutoLevel = Infinity;
				rAFMapRepeats = 0;
				currTime = 0;
				game.global.mapRunCounter = 0;
			}
		}

	}


	if ((typeof (autoTrimpSettings.rAlchDefaultSettings.value.voidPurchase) === 'undefined' ? true : autoTrimpSettings.rAlchDefaultSettings.value.voidPurchase) && rCurrentMap === 'rVoidMap' && game.global.mapsActive) {
		if (getCurrentMapObject().location == "Void" && (alchObj.canAffordPotion('Potion of the Void') || alchObj.canAffordPotion('Potion of Strength'))) {
			alchObj.craftPotion('Potion of the Void');
			alchObj.craftPotion('Potion of Strength');
		}
	}

	return farmingDetails;
}

MODULES.mapFunctions.rHFBuyPackrat = false;
rHFBuyPackrat = false;

//Hypothermia Farm -- WORKING AS IS
function Hypothermia() {

	var rShouldHypoFarm = false;
	var mapAutoLevel = Infinity;

	const mapName = 'rHypothermiaFarm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};

	if ((!autoTrimpSettings.rHypoDefaultSettings.value.active ||
		(game.global.challengeActive !== 'Hypothermia' && (!autoTrimpSettings.rHypoDefaultSettings.value.packrat || !rHFBuyPackrat)))) return farmingDetails;

	if (autoTrimpSettings.rHypoDefaultSettings.value.packrat) {
		if (!rHFBuyPackrat && game.global.challengeActive === 'Hypothermia')
			rHFBuyPackrat = true;
		if (rHFBuyPackrat && game.global.challengeActive === '') {
			viewPortalUpgrades();
			numTab(6, true);
			buyPortalUpgrade('Packrat');
			rHFBuyPackrat = null;
			activateClicked();
		}
	}
	rHFBonfireCostTotal = 0;

	if (game.global.challengeActive !== 'Hypothermia') return farmingDetails;
	const rHFBaseSettings = autoTrimpSettings.rHypoSettings.value;
	var rHFIndex;

	//Checking to see if any lines are to be run.
	for (var y = 0; y < rHFBaseSettings.length; y++) {
		const currSetting = rHFBaseSettings[y];
		if (!currSetting.active || game.global.world !== currSetting.world || game.global.lastClearedCell + 2 < currSetting.cell) {
			continue;
		}

		if (game.global.world === currSetting.world) {
			rHFIndex = y;
			break;
		}
	}

	if (rHFIndex >= 0) {

		var rHFSettings = rHFBaseSettings[rHFIndex];
		var rHFBonfire = rHFSettings.bonfire;
		var rHFSpecial = "lwc";
		var rHFMapLevel = rHFSettings.level;
		var rHFJobRatio = rHFSettings.jobratio;
		var rHFBonfiresBuilt = game.challenges.Hypothermia.totalBonfires;
		var rHFShedCost = 0;
		//Looping through each bonfire level and working out their cost to calc total cost
		for (x = rHFBonfiresBuilt; x < rHFBonfire; x++) {
			rHFBonfireCost = 1e10 * Math.pow(100, x);
			rHFBonfireCostTotal += rHFBonfireCost;
		}
		if (rHFBonfireCostTotal > (game.resources.wood.max * (1 + (game.portal.Packrat.modifier * game.portal.Packrat.radLevel))))
			rHFShedCost += game.buildings.Shed.cost.wood();
		rHFBonfireCostTotal += rHFShedCost;

		if (rHFSettings.autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && rHFMapRepeats !== 0) {
				game.global.mapRunCounter = rHFMapRepeats;
				rHFMapRepeats = 0;
			}

			var rAutoLevel_Repeat = rAutoLevel;
			mapAutoLevel = callAutoMapLevel(rCurrentMap, rAutoLevel, rHFSpecial, null, null, false);
			if (mapAutoLevel !== Infinity) {
				if (rAutoLevel_Repeat !== Infinity && mapAutoLevel !== rAutoLevel_Repeat) rHFMapRepeats = game.global.mapRunCounter + 1;
				rHFMapLevel = mapAutoLevel;
			}
		}

		if (rHFBonfireCostTotal > game.resources.wood.owned && rHFBonfire > game.challenges.Hypothermia.totalBonfires) {
			rShouldHypoFarm = true;
		}
		if (rCurrentMap === mapName && !rShouldHypoFarm) {
			if (getPageSetting('rMapRepeatCount')) debug("Hypothermia Farm took " + (game.global.mapRunCounter) + " (" + (rHFMapLevel >= 0 ? "+" : "") + rHFMapLevel + " " + rHFSpecial + ")" + (game.global.mapRunCounter == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime > 0 ? currTime : getGameTime())) + " to complete on zone " + game.global.world + ".");
			rCurrentMap = undefined;
			mapAutoLevel = Infinity;
			rHFMapRepeats = 0;
			currTime = 0;
			game.global.mapRunCounter = 0;
		}

		var repeat = game.global.mapsActive && ((getCurrentMapObject().level - game.global.world) !== rHFMapLevel || getCurrentMapObject().bonus !== rHFSpecial || game.resources.wood.owned > game.challenges.Hypothermia.bonfirePrice || scaleToCurrentMapLocal(simpleSecondsLocal("wood", 20, true, rHFJobRatio), false, true, rHFMapLevel) + game.resources.wood.owned > rHFBonfireCostTotal);
		var status = 'Hypo Farming to ' + prettify(rHFBonfireCostTotal) + ' wood';

		farmingDetails.shouldRun = rShouldHypoFarm;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = rHFMapLevel;
		farmingDetails.autoLevel = rHFSettings.autoLevel;
		farmingDetails.special = rHFSpecial;
		farmingDetails.jobRatio = rHFJobRatio;
		farmingDetails.bonfire = rHFBonfire;
		farmingDetails.woodGoal = rHFBonfireCostTotal;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
	}

	return farmingDetails;
}

//Smithless -- WORKING AS IS
function Smithless() {

	var rShouldSmithless = false;
	var mapAutoLevel = Infinity;

	const mapName = 'rSmithlessFarm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};

	if (game.global.challengeActive !== "Smithless" || !getPageSetting('rSmithless')) return farmingDetails;

	if (game.global.world % 25 === 0 && game.global.lastClearedCell == -1 && game.global.gridArray[0].ubersmith) {
		var name = game.global.gridArray[0].name
		var gammaDmg = gammaBurstPct;
		var equalityAmt = equalityQuery(name, game.global.world, 1, 'world', 1, 'gamma')
		var ourDmg = RcalcOurDmg('min', equalityAmt, 'world', false, false, true);
		var totalDmg = (ourDmg * 2 + (ourDmg * gammaDmg * 2))
		var enemyHealth = RcalcEnemyHealthMod(game.global.world, 1, name, 'world');
		enemyHealth *= 3e15;
		var rSmithlessJobRatio = '0,0,1,0';
		var rSmithlessSpecial = 'lmc';
		var rSmithlessMax = game.global.mapBonus != 10 ? 10 : null;
		var rSmithlessMin = game.global.mapBonus != 10 ? 0 : null;
		var damageTarget = enemyHealth / totalDmg;

		if (game.global.mapRunCounter === 0 && game.global.mapsActive && rSmithlessMapRepeats !== 0) {
			game.global.mapRunCounter = rSmithlessMapRepeats;
			rSmithlessMapRepeats = 0;
		}
		var rAutoLevel_Repeat = rAutoLevel;
		mapAutoLevel = callAutoMapLevel(rCurrentMap, rAutoLevel, rSmithlessSpecial, rSmithlessMax, rSmithlessMin, false);
		if (mapAutoLevel !== Infinity) {
			if (rAutoLevel_Repeat !== Infinity && mapAutoLevel !== rAutoLevel_Repeat) rSmithlessMapRepeats = game.global.mapRunCounter + 1;
			rSmithlessMapLevel = mapAutoLevel;
		}

		if (totalDmg < enemyHealth) {
			if (game.global.mapBonus != 10)
				rShouldSmithless = true;
			else if (!(game.portal.Tenacity.getMult() === Math.pow(1.4000000000000001, getPerkLevel("Tenacity") + getPerkLevel("Masterfulness"))))
				rShouldSmithless = true;
		}

		var repeat = game.global.mapsActive && ((getCurrentMapObject().level - game.global.world) !== rSmithlessMapLevel || getCurrentMapObject().bonus !== rSmithlessSpecial);
		var status = 'Smithless: Want ' + damageTarget.toFixed(2) + 'x more damage for 3/3';

		farmingDetails.shouldRun = rShouldSmithless;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = rSmithlessMapLevel;
		farmingDetails.autoLevel = true;
		farmingDetails.special = rSmithlessSpecial;
		farmingDetails.jobRatio = rSmithlessJobRatio;
		farmingDetails.damageTarget = damageTarget;
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;

	}
	if (rCurrentMap === mapName && !farmingDetails.shouldRun) {
		if (getPageSetting('rMapRepeatCount')) debug("Smithless Farming took " + (game.global.mapRunCounter) + " (" + (rSmithlessMapLevel >= 0 ? "+" : "") + rSmithlessMapLevel + " " + rSmithlessSpecial + ")" + (game.global.mapRunCounter == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime > 0 ? currTime : getGameTime())) + " to complete on zone " + game.global.world + ".");
		rCurrentMap = undefined;
		rAutoLevel = Infinity;
		rSmithlessMapRepeats = 0;
		currTime = 0;
		game.global.mapRunCounter = 0;
		mapAutoLevel = Infinity;
	}

	return farmingDetails;
}

//HD Farm -- WORKING AS IS
function HDFarm() {

	const mapName = 'rHDFarm';
	const farmingDetails = {
		shouldRun: false,
		mapName: mapName
	};

	if (!autoTrimpSettings.rHDFarmDefaultSettings.value.active) return farmingDetails;


	const isC3 = game.global.runningChallengeSquared || game.global.challengeActive === 'Mayhem' || game.global.challengeActive === 'Pandemonium';
	const isDaily = game.global.challengeActive === 'Daily';
	const dontRecycleMaps = game.global.challengeActive === 'Trappapalooza' || game.global.challengeActive === 'Archaeology' || game.global.challengeActive === 'Berserk' || game.portal.Frenzy.frenzyStarted !== -1;
	const totalPortals = getTotalPortals();
	const metalShred = isDaily && typeof (game.global.dailyChallenge.hemmorrhage) !== 'undefined' && dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('metal');
	const rHDFBaseSetting = autoTrimpSettings.rHDFarmSettings.value;
	const rHDFZone = getPageSetting('rHDFarmZone');
	const currChall = game.global.challengeActive;
	var rShouldHDFarm = false;
	var rShouldSkip = false;
	var mapAutoLevel = Infinity;

	var rHDFIndex;
	for (var y = 0; y < rHDFBaseSetting.length; y++) {
		const currSetting = rHDFBaseSetting[y];
		if (!currSetting.active || currSetting.done === totalPortals + "_" + game.global.world || currSetting.world > game.global.world || game.global.world > currSetting.endzone) {
			continue;
		}
		if (currSetting.runType !== 'All') {
			if (!isC3 && !isDaily && (currSetting.runType !== 'Filler' ||
				(currSetting.runType === 'Filler' && (currSetting.challenge !== 'All' && currSetting.challenge !== currChall)))) continue;
			if (isDaily && currSetting.runType !== 'Daily') continue;
			if (isC3 && (currSetting.runType !== 'C3' ||
				(currSetting.runType === 'C3' && (currSetting.challenge3 !== 'All' && currSetting.challenge3 !== currChall)))) continue;
		}
		if (game.global.world >= currSetting.world && game.global.lastClearedCell + 2 >= currSetting.cell) {
			rHDFIndex = y;
			break;
		}
		else
			continue;
	}

	if (rHDFIndex >= 0) {
		var rHDFSettings = autoTrimpSettings.rHDFarmSettings.value[rHDFIndex];
		var rHDFMapLevel = rHDFSettings.level;
		var rHDFSpecial = game.global.highestRadonLevelCleared > 83 ? "lmc" : "smc";
		var rHDFJobRatio = '0,0,1,0';
		var rHDFMax = game.global.mapBonus != 10 ? 10 : null;
		var rHDFMin = game.global.mapBonus != 10 ? 0 : null;
		var rHDFshredMapCap = autoTrimpSettings.rHDFarmDefaultSettings.value.shredMapCap;
		var rHDFmapCap = autoTrimpSettings.rHDFarmDefaultSettings.value.mapCap;

		var rHDFmaxMaps = metalShred ? rHDFshredMapCap : rHDFmapCap;

		if (rHDFSettings.autoLevel) {
			if (game.global.mapRunCounter === 0 && game.global.mapsActive && rHDFMapRepeats !== 0) {
				game.global.mapRunCounter = rHDFMapRepeats;
				rHDFMapRepeats = 0;
			}

			var rAutoLevel_Repeat = rAutoLevel;
			mapAutoLevel = callAutoMapLevel(rCurrentMap, rAutoLevel, rHDFSpecial, rHDFMax, rHDFMin, false);
			if (mapAutoLevel !== Infinity) {
				if (rAutoLevel_Repeat !== Infinity && mapAutoLevel !== rAutoLevel_Repeat) rHDFMapRepeats = game.global.mapRunCounter + 1;
				rHDFMapLevel = mapAutoLevel;
			}
		}

		if (HDRatio > equipfarmdynamicHD(rHDFIndex))
			rShouldHDFarm = true;
		//Skipping farm if map repeat value is greater than our max maps value
		if (rShouldHDFarm && game.global.mapsActive && rCurrentMap === mapName && game.global.mapRunCounter >= rHDFmaxMaps) {
			rShouldHDFarm = false;
		}
		if (rCurrentMap !== mapName && equipfarmdynamicHD(rHDFIndex) > HDRatio)
			rShouldSkip = true;

		if (((rCurrentMap === mapName && !rShouldHDFarm) || rShouldSkip) && HDRatio !== Infinity) {
			var mapProg = game.global.mapsActive ? ((getCurrentMapCell().level - 1) / getCurrentMapObject().size) : 0;
			if (getPageSetting('rMapRepeatCount') && !rShouldSkip) debug("Equip Farm took " + (game.global.mapRunCounter + mapProg) + " (" + (rHDFMapLevel >= 0 ? "+" : "") + rHDFMapLevel + " " + rHDFSpecial + ")" + (game.global.mapRunCounter + mapProg == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime > 0 ? currTime : getGameTime())) + " to complete on zone " + game.global.world + ". You ended it with a HD Ratio of " + RcalcHDratio().toFixed(2) + ".");
			if (getPageSetting('rMapRepeatCount') && rShouldSkip) debug("Equip Farm took was skipped on zone " + game.global.world + ". It wanted a HD Ratio of " + equipfarmdynamicHD(rHDFIndex).toFixed(2) + " but you already had a HD Ratio of " + RcalcHDratio().toFixed(2) + ".");
			rCurrentMap = undefined;
			mapAutoLevel = Infinity;
			rHDFMapRepeats = 0;
			currTime = 0;
			game.global.mapRunCounter = 0;
			rHDFSettings.done = totalPortals + "_" + game.global.world;
			if (!dontRecycleMaps && game.global.mapsActive) {
				mapsClicked();
				recycleMap();
			}
		}

		var repeat = game.global.mapsActive && ((getCurrentMapObject().level - game.global.world) !== rHDFMapLevel || getCurrentMapObject().bonus !== rHDFSpecial);
		var status = 'HD Farm to:&nbsp;' + equipfarmdynamicHD(rHDFIndex).toFixed(2) + '<br>\
		Current HD:&nbsp;' + HDRatio.toFixed(2) + '<br>\
		Maps:&nbsp;' + (game.global.mapRunCounter + 1) + '/' + rHDFmaxMaps;

		farmingDetails.shouldRun = rShouldHDFarm;
		farmingDetails.mapName = mapName;
		farmingDetails.mapLevel = rHDFMapLevel;
		farmingDetails.autoLevel = rHDFSettings.autoLevel;
		farmingDetails.special = rHDFSpecial;
		farmingDetails.jobRatio = rHDFJobRatio;
		farmingDetails.HDRatio = equipfarmdynamicHD(rHDFIndex);
		farmingDetails.repeat = !repeat;
		farmingDetails.status = status;
	}

	return farmingDetails;
}

function FarmingDecision() {
	var farmingDetails = {
		shouldRun: false,
		mapName: ''
	}

	//Resetting map run counter to 0 when in world
	if (!game.global.mapsActive && !game.global.preMapsActive) {
		game.global.mapRunCounter = 0;
	}

	if (!autoTrimpSettings.RAutoMaps.value || !game.global.mapsUnlocked) return farmingDetails;

	const mapTypes = [Quest(), PandemoniumDestack(), SmithyFarm(), MapFarm(), TributeFarm(), WorshipperFarm(), MapDestacking(), PrestigeRaiding(), Mayhem(), Insanity(), PandemoniumJestimpFarm(), PandemoniumFarm(), Alchemy(), Hypothermia(), HDFarm(), VoidMaps(), Quagmire(), MapBonus(), Smithless()]

	for (const map of mapTypes) {
		if (map.shouldRun) {
			return map;
		}
	}

	return farmingDetails;
}

//RAMP - Prestige Raiding
function RAMPplusMapToRun(number, raidzones) {
	var map;

	map = (raidzones - game.global.world - number);

	if ((raidzones - number).toString().slice(-1) == 0) map = map - 5
	if ((raidzones - number).toString().slice(-1) == 9) map = map - 5
	if ((raidzones - number).toString().slice(-1) == 8) map = map - 5
	if ((raidzones - number).toString().slice(-1) == 7) map = map - 5
	if ((raidzones - number).toString().slice(-1) == 6) map = map - 5
	return map;
}

function RAMPshouldrunmap(number, raidzones) {
	var go = false;
	var actualraidzone = (raidzones - number);
	if (Rgetequips(actualraidzone, false) > 0) go = true;

	return go;
}

function RAMPplusPres(number, raidzones) {
	document.getElementById("biomeAdvMapsSelect").value = game.global.farmlandsUnlocked ? "Farmlands" : "Plentiful";
	document.getElementById("mapLevelInput").value = game.global.world;
	document.getElementById("advExtraLevelSelect").value = RAMPplusMapToRun(number, raidzones);
	document.getElementById("advSpecialSelect").value = "p";
	document.getElementById("lootAdvMapsRange").value = 9;
	document.getElementById("difficultyAdvMapsRange").value = 9;
	document.getElementById("sizeAdvMapsRange").value = 9;
	document.getElementById("advPerfectCheckbox").dataset.checked = true;
	updateMapCost();
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);
	document.getElementById("advPerfectCheckbox").dataset.checked = false;
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);
	document.getElementById("biomeAdvMapsSelect").value = "Random";
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);

	while (lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
		lootAdvMapsRange.value -= 1;
	}
	while (difficultyAdvMapsRange.value > 0 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
		difficultyAdvMapsRange.value -= 1;
		if (updateMapCost(true) <= game.resources.fragments.owned) break;
		sizeAdvMapsRange.value -= 1;
	}
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);
	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("advSpecialSelect").value = "0";
		updateMapCost();
	}
	if (document.getElementById("advSpecialSelect").value == "0") return updateMapCost(true);
}

function RAMPplusPresfragmax(number, raidzones) {
	document.getElementById("biomeAdvMapsSelect").value = game.global.farmlandsUnlocked ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountains";
	document.getElementById("mapLevelInput").value = game.global.world;
	incrementMapLevel(1);
	document.getElementById("advExtraLevelSelect").value = RAMPplusMapToRun(number, raidzones);
	document.getElementById("advSpecialSelect").value = "p";
	document.getElementById("lootAdvMapsRange").value = 9;
	document.getElementById("difficultyAdvMapsRange").value = 9;
	document.getElementById("sizeAdvMapsRange").value = 9;
	document.getElementById("advPerfectCheckbox").dataset.checked = true;
	updateMapCost();
	return updateMapCost(true);
}

function RAMPplusPresfragmin(number, raidzones) {
	document.getElementById("biomeAdvMapsSelect").value = game.global.farmlandsUnlocked ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountains";
	document.getElementById("mapLevelInput").value = game.global.world;
	document.getElementById("advExtraLevelSelect").value = RAMPplusMapToRun(number, raidzones);
	document.getElementById("advSpecialSelect").value = "p";
	document.getElementById("lootAdvMapsRange").value = 0;
	document.getElementById("difficultyAdvMapsRange").value = 9;
	document.getElementById("sizeAdvMapsRange").value = 9;
	document.getElementById("advPerfectCheckbox").dataset.checked = false;
	updateMapCost();
	if (updateMapCost(true) <= game.resources.fragments.owned) {
		return updateMapCost(true);
	}
	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("biomeAdvMapsSelect").value = "Random";
		updateMapCost();
	}
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);

	while (difficultyAdvMapsRange.value > 0 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
		difficultyAdvMapsRange.value -= 1;
		if (updateMapCost(true) <= game.resources.fragments.owned) break;
		sizeAdvMapsRange.value -= 1;
	}
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);

	document.getElementById("advSpecialSelect").value = "fa";
	updateMapCost();

	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);

	document.getElementById("advSpecialSelect").value = "0";
	updateMapCost();
	return updateMapCost(true);
}

function RAMPfrag(raidzones, fragtype) {
	var cost = 0;
	if (rShouldPrestigeRaid) {

		if (Rgetequips(raidzones, false)) {
			if (fragtype == 1) cost += RAMPplusPresfragmin(0);
			else if (fragtype == 2) cost += RAMPplusPresfragmax(0);
		}
		if (Rgetequips((raidzones - 1), false)) {
			if (fragtype == 1) cost += RAMPplusPresfragmin(1);
			else if (fragtype == 2) cost += RAMPplusPresfragmax(1);
		}
		if (Rgetequips((raidzones - 2), false)) {
			if (fragtype == 1) cost += RAMPplusPresfragmin(2);
			else if (fragtype == 2) cost += RAMPplusPresfragmax(2);
		}
		if (Rgetequips((raidzones - 3), false)) {
			if (fragtype == 1) cost += RAMPplusPresfragmin(3);
			else if (fragtype == 2) cost += RAMPplusPresfragmax(3);
		}
		if (Rgetequips((raidzones - 4), false)) {
			if (fragtype == 1) cost += RAMPplusPresfragmin(4);
			else if (fragtype == 2) cost += RAMPplusPresfragmax(4);
		}

		if (game.resources.fragments.owned >= cost) return true;
		else return false;
	}
}

function fragmap() {
	var fragmentsOwned = game.resources.fragments.owned
	document.getElementById("biomeAdvMapsSelect").value = game.global.farmlandsUnlocked ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountains";
	document.getElementById("advExtraLevelSelect").value = 0;
	document.getElementById("advSpecialSelect").value = "fa";
	document.getElementById("lootAdvMapsRange").value = 9;
	document.getElementById("difficultyAdvMapsRange").value = 9;
	document.getElementById("sizeAdvMapsRange").value = 9;
	document.getElementById("advPerfectCheckbox").dataset.checked = true;
	document.getElementById("mapLevelInput").value = game.global.world;
	updateMapCost();

	if (updateMapCost(true) > fragmentsOwned) {
		document.getElementById("biomeAdvMapsSelect").value = "Random";
		updateMapCost();
	}
	if (updateMapCost(true) > fragmentsOwned) {
		document.getElementById("advPerfectCheckbox").dataset.checked = false;
		updateMapCost();
	}

	while (difficultyAdvMapsRange.value > 0 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > fragmentsOwned) {
		if (difficultyAdvMapsRange.value !== 0) difficultyAdvMapsRange.value -= 1;
		if (updateMapCost(true) <= fragmentsOwned) break;
		if (sizeAdvMapsRange.value !== 0) sizeAdvMapsRange.value -= 1;
	}
	if (updateMapCost(true) <= fragmentsOwned) return updateMapCost(true);

	if (updateMapCost(true) > fragmentsOwned) {
		document.getElementById("advSpecialSelect").value = 0;
		updateMapCost();
	}
}

function fragmin(number) {
	document.getElementById("biomeAdvMapsSelect").value = game.global.farmlandsUnlocked ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountains";
	document.getElementById("advExtraLevelSelect").value = number;
	document.getElementById("advSpecialSelect").value = "fa";
	document.getElementById("lootAdvMapsRange").value = 9;
	document.getElementById("difficultyAdvMapsRange").value = 9;
	document.getElementById("sizeAdvMapsRange").value = 9;
	document.getElementById("advPerfectCheckbox").dataset.checked = true;
	document.getElementById("mapLevelInput").value = game.global.world;
	updateMapCost();

	if (updateMapCost(true) <= game.resources.fragments.owned) {
		return updateMapCost(true);
	}
	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("biomeAdvMapsSelect").value = "Random";
		updateMapCost();
		if (updateMapCost(true) <= game.resources.fragments.owned) {
			return updateMapCost(true);
		}
	}
	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("advPerfectCheckbox").dataset.checked = false;
		updateMapCost();
		if (updateMapCost(true) <= game.resources.fragments.owned) {
			return updateMapCost(true);
		}
	}
	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("lootAdvMapsRange").value = 8;
		updateMapCost();
		if (updateMapCost(true) <= game.resources.fragments.owned) {
			return updateMapCost(true);
		}
	}

	while (difficultyAdvMapsRange.value > 0 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
		difficultyAdvMapsRange.value -= 1;
		if (updateMapCost(true) <= game.resources.fragments.owned) break;
		sizeAdvMapsRange.value -= 1;
	}
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);
	if (document.getElementById("sizeAdvMapsRange").value == 0) {
		return updateMapCost(true);
	}
}

function fragmapcost() {
	var cost = 0;

	if (rShouldInsanityFarm) {
		var insanityfarmzone = getPageSetting('Rinsanityfarmzone');
		var insanityfarmlevel = getPageSetting('Rinsanityfarmlevel');
		var insanityfarmlevelindex = insanityfarmzone.indexOf(game.global.world);
		var insanitylevelzones = insanityfarmlevel[insanityfarmlevelindex];

		if (getPageSetting('Rinsanityfarmfrag')) cost = PerfectMapCost(insanitylevelzones, 'fa');
	}
	else if (rShouldWorshipperFarm) {
		var shipfarmzone = getPageSetting('Rshipfarmzone');
		var shipfarmlevel = getPageSetting('Rshipfarmlevel');
		var shipfarmlevelindex = shipfarmzone.indexOf(game.global.world);
		var shiplevelzones = shipfarmlevel[shipfarmlevelindex];

		if (getPageSetting('Rshipfarmfrag'))
			cost = fragmin(shiplevelzones);
	}
	else
		cost = 0;

	if (game.resources.fragments.owned >= cost)
		return true;
	else
		return false;
}

function rFragmentFarm(type, level, special, perfect) {

	var perfect = !perfect ? null : perfect;

	//Worshipper farming
	var rFragCheck = true;
	if (getPageSetting('R' + type + 'farmfrag')) {
		if (fragmapcost() == true) {
			rFragCheck = true;
			rFragmentFarming = false;
		} else if (fragmapcost() == false) {
			rFragmentFarming = true;
			rFragCheck = false;
			if (!rFragCheck && rInitialFragmentMapID == undefined && !rFragMapBought && game.global.preMapsActive) {
				debug("Check complete for fragment farming map");
				fragmap();
				if ((updateMapCost(true) <= game.resources.fragments.owned)) {
					buyMap();
					rFragMapBought = true;
					if (rFragMapBought) {
						rInitialFragmentMapID = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
						debug("Fragment farming map purchased");
					}
				}
			}
			if (!rFragCheck && game.global.preMapsActive && !game.global.mapsActive && rFragMapBought && rInitialFragmentMapID != undefined) {
				debug("Running fragment farming map");
				selectedMap = rInitialFragmentMapID;
				selectMap(rInitialFragmentMapID);
				runMap();
				RlastMapWeWereIn = getCurrentMapObject();
				rFragmentMapID = rInitialFragmentMapID;
				rInitialFragmentMapID = undefined;
			}
			if (!rFragCheck && game.resources.fragments.owned >= PerfectMapCost(level, special) && game.global.mapsActive && rFragMapBought && rFragmentMapID != undefined) {
				if (fragmapcost() == false) {
					if (!game.global.repeatMap) {
						repeatClicked();
					}
				} else if (fragmapcost() == true) {
					if (game.global.repeatMap) {
						repeatClicked();
						//mapsClicked();
					}
					if (game.global.preMapsActive && rFragMapBought && rFragmentMapID != undefined) {
						rFragMapBought = false;
					}
					rFragCheck = true;
					rFragmentFarming = false;
				}
			}
		} else {
			rFragCheck = true;
			rFragmentFarming = false;
		}
	}

	if (rFragCheck) {
		if (type == 'insanity')
			PerfectMapCost(level, special);
		if (type == 'ship')
			RShouldFarmMapCost(level, special);
	}
	updateMapCost();
}

function PerfectMapCost(pluslevel, special, biome) {
	maplevel = pluslevel < 0 ? game.global.world + pluslevel : game.global.world;
	if (!pluslevel || pluslevel < 0) pluslevel = 0;
	if (!special) special = '0';
	if (!biome) biome = game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Random";
	document.getElementById("biomeAdvMapsSelect").value = biome;
	document.getElementById("advExtraLevelSelect").value = pluslevel;
	document.getElementById("advSpecialSelect").value = special;
	document.getElementById("lootAdvMapsRange").value = 9;
	document.getElementById("difficultyAdvMapsRange").value = 9;
	document.getElementById("sizeAdvMapsRange").value = 9;
	document.getElementById("advPerfectCheckbox").dataset.checked = true;
	document.getElementById("mapLevelInput").value = maplevel;
	updateMapCost();

	return updateMapCost(true);
}

function RShouldFarmMapCost(pluslevel, special, biome) {
	//Pre-init
	maplevel = pluslevel < 0 ? game.global.world + pluslevel : game.global.world;
	if (!pluslevel || pluslevel < 0) pluslevel = 0;
	if (!special) special = game.global.highestRadonLevelCleared > 83 ? "lmc" : "smc";
	if (!biome) biome = game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountains";

	//Working out appropriate map settings
	document.getElementById("mapLevelInput").value = maplevel;
	document.getElementById("advExtraLevelSelect").value = pluslevel;
	document.getElementById("biomeAdvMapsSelect").value = biome;
	document.getElementById("advSpecialSelect").value = special;
	updateMapCost();
	return updateMapCost(true);
}

function RShouldFarmMapCreation(pluslevel, special, biome, difficulty, loot, size) {
	//Pre-Init
	if (!pluslevel) pluslevel = 0;
	if (!special) special = game.global.highestRadonLevelCleared > 83 ? "lmc" : "smc";
	if (!biome) biome = game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountains";
	if (!difficulty) difficulty = 0.75;
	if (!loot) loot = game.global.farmlandsUnlocked && game.singleRunBonuses.goldMaps.owned ? 3.6 : game.global.farmlandsUnlocked ? 2.6 : game.singleRunBonuses.goldMaps.owned ? 2.85 : 1.85;
	if (!size) size = 20;

	for (var mapping in game.global.mapsOwnedArray) {
		if (!game.global.mapsOwnedArray[mapping].noRecycle && (
			(game.global.world + pluslevel) == game.global.mapsOwnedArray[mapping].level) &&
			(game.global.mapsOwnedArray[mapping].bonus == special || game.global.mapsOwnedArray[mapping].bonus === undefined && special === '0') &&
			game.global.mapsOwnedArray[mapping].location == biome/*  &&
			game.global.mapsOwnedArray[mapping].difficulty == difficulty &&
			game.global.mapsOwnedArray[mapping].loot == loot &&
			game.global.mapsOwnedArray[mapping].size == size */) {

			return (game.global.mapsOwnedArray[mapping].id);
		}
	}
	return ("create");
}

function rRunMap() {
	if (game.options.menu.pauseGame.enabled) return;
	if (game.global.lookingAtMap === "") return;
	if (game.achievements.mapless.earnable) {
		game.achievements.mapless.earnable = false;
		game.achievements.mapless.lastZone = game.global.world;
	}
	if (game.global.challengeActive == "Quest" && game.challenges.Quest.questId == 5 && !game.challenges.Quest.questComplete) {
		game.challenges.Quest.questProgress++;
		if (game.challenges.Quest.questProgress == 1) game.challenges.Quest.failQuest();
	}
	var mapId = game.global.lookingAtMap;
	game.global.preMapsActive = false;
	game.global.mapsActive = true;
	game.global.currentMapId = mapId;
	mapsSwitch(true);
	var mapObj = getCurrentMapObject();
	if (mapObj.bonus) {
		game.global.mapExtraBonus = mapObj.bonus;
	}
	if (game.global.lastClearedMapCell == -1) {
		buildMapGrid(mapId);
		drawGrid(true);

		if (mapObj.location == "Void") {
			game.global.voidDeaths = 0;
			game.global.voidBuff = mapObj.voidBuff;
			setVoidBuffTooltip();
		}
	}
	if (game.global.challengeActive == "Insanity") game.challenges.Insanity.drawStacks();
	if (game.global.challengeActive == "Pandemonium") game.challenges.Pandemonium.drawStacks();
}