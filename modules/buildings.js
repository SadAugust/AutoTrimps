MODULES["buildings"] = {};
MODULES["buildings"].storageMainCutoff = 0.85;
MODULES["buildings"].storageLowlvlCutoff1 = 0.7;
MODULES["buildings"].storageLowlvlCutoff2 = 0.5;

//Helium
var housingList = ['Hut', 'House', 'Mansion', 'Hotel', 'Resort', 'Gateway', 'Collector', 'Warpstation'];

function needGymystic() {
	return game.upgrades['Gymystic'].allowed - game.upgrades['Gymystic'].done > 0;
}

function safeBuyBuilding(building) {
	if (isBuildingInQueue(building))
		return false;
	if (game.buildings[building].locked)
		return false;
	var oldBuy = preBuy2();

	if (bwRewardUnlocked("DecaBuild")) {
		game.global.buyAmt = 10;
		if (!canAffordBuilding(building)) {
			game.global.buyAmt = 2;
			if (!canAffordBuilding(building))
				game.global.buyAmt = 1;
		}
	}
	else if (bwRewardUnlocked("DoubleBuild")) {
		game.global.buyAmt = 2;
		if (!canAffordBuilding(building))
			game.global.buyAmt = 1;
	}
	else game.global.buyAmt = 1;

	if (!canAffordBuilding(building)) {
		postBuy2(oldBuy);
		return false;
	}

	game.global.firing = false;

	if (building == 'Gym' && getPageSetting('GymWall')) {
		game.global.buyAmt = 1;
	}
	if (building == 'Warpstation' && !game.buildings[building].locked && canAffordBuilding(building)) {
		if (game.buildings.Warpstation.owned < 2) {
			game.global.buyAmt = 'Max';
			game.global.maxSplit = 1;
		} else {
			game.global.buyAmt = 1;
		}
		buyBuilding(building, true, true);
		debug('Building ' + game.global.buyAmt + ' ' + building + 's', "buildings", '*rocket');
		postBuy2(oldBuy);
		return;
	}
	if (building != 'Trap') debug('Building ' + building, "buildings", '*hammer2');
	if (!game.buildings[building].locked && canAffordBuilding(building)) {
		buyBuilding(building, true, true);
	}
	postBuy2(oldBuy);
	return true;
}

function buyFoodEfficientHousing() {
	//Init
	var ignoresLimit = getPageSetting('FoodEfficiencyIgnoresMax')
	var unlockedHousing = ["Hut", "House", "Mansion", "Hotel", "Resort"].filter(b => !game.buildings[b].locked);

	//Resets Border Color
	unlockedHousing.forEach(b => document.getElementById(b).style.border = "1px solid #FFFFFF")

	//Checks for Limits
	if (!ignoresLimit) {
		unlockedHousing = unlockedHousing.filter(b => {
			//Filter out buildings that are past the limits
			if (game.buildings[b].owned < getPageSetting('Max' + b) || getPageSetting('Max' + b) < 1)
				return true;

			//But paints their border before removing them
			document.getElementById(b).style.border = "1px solid orange"
			return false
		})
	}

	//Determines Food Efficiency for each housing
	var buildOrder = unlockedHousing.map(b => ({
		'name': b,
		'ratio': getBuildingItemPrice(game.buildings[b], "food", false, 1) / game.buildings[b].increase.by
	}));

	//Grabs the most Food Efficient Housing
	if (buildOrder.length == 0) return;
	bestFoodBuilding = buildOrder.reduce((best, current) => current.ratio < best.ratio ? current : best)

	//If Food Efficiency Ignores Limit is enabled, then it only buy Huts and Houses here
	if (!ignoresLimit || ["Hut", "House"].includes(bestFoodBuilding.name)) {
		document.getElementById(bestFoodBuilding.name).style.border = "1px solid #00CC01";
		safeBuyBuilding(bestFoodBuilding.name);
	}
}

function buyGemEfficientHousing() {
	var gemHousing = ["Mansion", "Hotel", "Resort", "Gateway", "Collector", "Warpstation"];
	var unlockedHousing = [];
	for (var house in gemHousing) {
		if (game.buildings[gemHousing[house]].locked === 0) {
			unlockedHousing.push(gemHousing[house]);
		}
	}
	var obj = {};
	for (var house in unlockedHousing) {
		var building = game.buildings[unlockedHousing[house]];
		var cost = getBuildingItemPrice(building, "gems", false, 1);
		var ratio = cost / building.increase.by;
		obj[unlockedHousing[house]] = ratio;
		document.getElementById(unlockedHousing[house]).style.border = "1px solid #FFFFFF";
	}
	var keysSorted = Object.keys(obj).sort(function (a, b) {
		return obj[a] - obj[b];
	});
	var bestGemBuilding = null;
	for (var best in keysSorted) {
		var max = getPageSetting('Max' + keysSorted[best]);
		if (max === false) max = -1;
		if (game.buildings[keysSorted[best]].owned < max || max == -1 || (getPageSetting('GemEfficiencyIgnoresMax') && keysSorted[best] != "Gateway")) {
			bestGemBuilding = keysSorted[best];
			document.getElementById(bestGemBuilding).style.border = "1px solid #00CC00";

			//Gateway Wall
			if (bestGemBuilding == "Gateway" && getPageSetting('GatewayWall') > 1) {
				if (getBuildingItemPrice(game.buildings.Gateway, "fragments", false, 1) > (game.resources.fragments.owned / getPageSetting('GatewayWall'))) {
					document.getElementById(bestGemBuilding).style.border = "1px solid orange";
					bestGemBuilding = null;
					continue;
				}
			}

			var skipWarp = false;
			if (getPageSetting('WarpstationCap') && bestGemBuilding == "Warpstation") {
				var firstGigaOK = MODULES["upgrades"].autoGigas == false || game.upgrades.Gigastation.done > 0;
				var gigaCapped = game.buildings.Warpstation.owned >= (Math.floor(game.upgrades.Gigastation.done * getPageSetting('DeltaGigastation')) + getPageSetting('FirstGigastation'))
				if (firstGigaOK && gigaCapped) skipWarp = true;
			}
			var warpwallpct = getPageSetting('WarpstationWall3');
			if (warpwallpct > 1 && bestGemBuilding == "Warpstation") {
				if (getBuildingItemPrice(game.buildings.Warpstation, "metal", false, 1) * Math.pow(1 - game.portal.Resourceful.modifier, game.portal.Resourceful.level) > (game.resources.metal.owned / warpwallpct))
					skipWarp = true;
			}
			if (skipWarp)
				bestGemBuilding = null;
			var getcoord = getPageSetting('WarpstationCoordBuy');
			if (getcoord && skipWarp) {
				var toTip = game.buildings.Warpstation;
				if (canAffordBuilding("Warpstation")) {
					var howMany = calculateMaxAfford(game.buildings["Warpstation"], true);
					var needCoord = game.upgrades.Coordination.allowed - game.upgrades.Coordination.done > 0;
					var coordReplace = (game.portal.Coordinated.level) ? (25 * Math.pow(game.portal.Coordinated.modifier, game.portal.Coordinated.level)).toFixed(3) : 25;
					if (!canAffordCoordinationTrimps()) {
						var nextCount = (game.portal.Coordinated.level) ? game.portal.Coordinated.currentSend : game.resources.trimps.maxSoldiers;
						var amtToGo = ((nextCount * 3) - game.resources.trimps.realMax());
						var increase = toTip.increase.by;
						if (game.portal.Carpentry.level && toTip.increase.what == "trimps.max") increase *= Math.pow(1.1, game.portal.Carpentry.level);
						if (game.portal.Carpentry_II.level && toTip.increase.what == "trimps.max") increase *= (1 + (game.portal.Carpentry_II.modifier * game.portal.Carpentry_II.level));
						if (amtToGo < increase * howMany)
							bestGemBuilding = "Warpstation";
					}
				}
			}
			break;
		}
	}
	if (bestGemBuilding) {
		bestBuilding = bestGemBuilding
		safeBuyBuilding(bestGemBuilding);
	}
}

function buyBuildings() {
	var customVars = MODULES["buildings"];
	var oldBuy = preBuy2();
	var hidebuild = (getPageSetting('BuyBuildingsNew') === 0 && getPageSetting('hidebuildings') == true);
	game.global.buyAmt = 1;
	if (!hidebuild) {
		buyFoodEfficientHousing();
		buyGemEfficientHousing();
	}
	if (!hidebuild && getPageSetting('MaxWormhole') > 0 && game.buildings.Wormhole.owned < getPageSetting('MaxWormhole') && !game.buildings.Wormhole.locked) {
		safeBuyBuilding('Wormhole');
	}

	//Gyms:
	if (!game.buildings.Gym.locked && (getPageSetting('MaxGym') > game.buildings.Gym.owned || getPageSetting('MaxGym') == -1)) {
		var skipGym = false;

		//Dynamic Gyms
		if (getPageSetting('DynamicGyms')) {
			//Target Zone
			var targetZone = game.global.world;

			//Enemy stats
			var block = calcOurBlock() / (game.global.brokenPlanet ? 2 : 1);
			var pierce = game.global.brokenPlanet ? (getPierceAmt() * (game.global.formation == 3 ? 2 : 1)) : 0;
			var nextGym = game.upgrades.Gymystic.modifier + Math.max(0, game.upgrades.Gymystic.done - 1) / 100;
			var currentEnemyDamageOK = block > nextGym * calcSpecificEnemyAttack();
			var zoneEnemyDamageOK = block > calcBadGuyDmg(null, getEnemyMaxAttack(game.global.world, 90, 'Snimp', 1.0), true, true) * (1 - pierce);

			//Challenge stats
			var moreBlockThanHealth = block >= nextGym * calcOurHealth(false);
			var crushedOK = game.global.challengeActive != "Crushed";
			var explosiveOK = game.global.challengeActive != "Daily" || typeof game.global.dailyChallenge.explosive == "undefined";
			var challengeOK = moreBlockThanHealth || crushedOK && explosiveOK;

			//Stop buying Gyms if we already have enough block for our current enemy and also a C99 Snimp
			if (currentEnemyDamageOK && zoneEnemyDamageOK && challengeOK) skipGym = true;
		}

		//Gym Wall
		var gymwallpct = getPageSetting('GymWall');
		if (gymwallpct > 1) {
			if (getBuildingItemPrice(game.buildings.Gym, "wood", false, 1) * Math.pow(1 - game.portal.Resourceful.modifier, game.portal.Resourceful.level)
				> (game.resources.wood.owned / gymwallpct))
				skipGym = true;
		}

		//ShieldBlock cost Effectiveness:
		if (game.equipment['Shield'].blockNow) {
			var gymEff = evaluateEquipmentEfficiency('Gym');
			var shieldEff = evaluateEquipmentEfficiency('Shield');
			if ((gymEff.Wall) || (gymEff.Factor <= shieldEff.Factor && !gymEff.Wall))
				skipGym = true;
		}

		//Buy Gym
		if (!((game.upgrades['Gymystic'].allowed - game.upgrades['Gymystic'].done) > 0) && !skipGym) safeBuyBuilding('Gym');
	}

	//Tributes:
	if (!game.buildings.Tribute.locked && !hidebuild && (getPageSetting('MaxTribute') > game.buildings.Tribute.owned || getPageSetting('MaxTribute') == -1))
		safeBuyBuilding('Tribute');

	//Nurseries Init
	var nurseryZoneOk = game.global.world >= getPageSetting('NoNurseriesUntil');
	var maxNurseryOk = getPageSetting('MaxNursery') < 0 || game.buildings.Nursery.owned < getPageSetting('MaxNursery');

	var spireNurseryActive = game.global.challengeActive != "Daily" && (game.global.world > 200 && isActiveSpireAT() || game.global.world <= 200 && getPageSetting('IgnoreSpiresUntil') <= 200);
	var nurseryPreSpire = spireNurseryActive && game.buildings.Nursery.owned < getPageSetting('PreSpireNurseries');

	var dailySpireNurseryActive = game.global.challengeActive == "Daily" && (disActiveSpireAT() || game.global.world <= 200 && getPageSetting('dIgnoreSpiresUntil') <= 200);
	var dailyNurseryPreSpire = dailySpireNurseryActive && game.buildings.Nursery.owned < getPageSetting('dPreSpireNurseries');

	//Nurseries
	if (game.buildings.Nursery.locked == 0 && !hidebuild && (nurseryZoneOk && maxNurseryOk || nurseryPreSpire || dailyNurseryPreSpire)) {
		safeBuyBuilding('Nursery');
	}

	postBuy2(oldBuy);
}

function buyStorage() {
	var customVars = MODULES["buildings"];
	var packMod = 1 + game.portal.Packrat.level * game.portal.Packrat.modifier;
	var Bs = {
		'Barn': 'food',
		'Shed': 'wood',
		'Forge': 'metal'
	};
	for (var B in Bs) {
		var jest = 0;
		var owned = game.resources[Bs[B]].owned;
		var max = game.resources[Bs[B]].max * packMod;
		max = calcHeirloomBonus("Shield", "storageSize", max);
		if (game.global.mapsActive && game.unlocks.imps.Jestimp) {
			jest = simpleSeconds(Bs[B], 45);
			jest = scaleToCurrentMap(jest);
		}
		if ((game.global.world == 1 && owned > max * customVars.storageLowlvlCutoff1) ||
			(game.global.world >= 2 && game.global.world < 10 && owned > max * customVars.storageLowlvlCutoff2) ||
			(owned + jest > max * customVars.storageMainCutoff)) {
			if (canAffordBuilding(B) && game.triggers[B].done) {
				safeBuyBuilding(B);
			}
		}
	}
}

//Radon


function getPsStringLocal(what, rawNum) {
	if (what == "helium") return;
	var resOrder = ["food", "wood", "metal", "science", "gems", "fragments"];
	var books = ["farming", "lumber", "miner", "science"];
	var jobs = ["Farmer", "Lumberjack", "Miner", "Scientist", "Dragimp", "Explorer"];
	var index = resOrder.indexOf(what);
	var job = game.jobs[jobs[index]];
	var book = game.upgrades["Speed" + books[index]];
	var base = (what == "fragments") ? 0.4 : 0.5;
	//Add base
	//Add job count
	var currentCalc = job.owned * base;
	var s = job.owned == 1 ? "" : "s";
	//Add books
	if (what != "gems" && game.permaBoneBonuses.multitasking.owned > 0) {
		var str = (game.resources.trimps.owned >= game.resources.trimps.realMax()) ? game.permaBoneBonuses.multitasking.mult() : 0;
		currentCalc *= (1 + str);
	}
	//Add books
	if (typeof book !== 'undefined' && book.done > 0) {
		var bookStrength = Math.pow(1.25, book.done);
		currentCalc *= bookStrength;
	}
	//Add bounty
	if (what != "gems" && game.upgrades.Bounty.done > 0) {
		currentCalc *= 2;
	}
	//Add Tribute
	if (what == "gems" && game.buildings.Tribute.owned > 0) {
		var tributeStrength = Math.pow(game.buildings.Tribute.increase.by, game.buildings.Tribute.owned);
		currentCalc *= tributeStrength;
	}
	//Add Whipimp
	if (game.unlocks.impCount.Whipimp > 0) {
		var whipStrength = Math.pow(1.003, game.unlocks.impCount.Whipimp);
		currentCalc *= (whipStrength);
	}
	//Add motivation
	if (getPerkLevel("Motivation") > 0) {
		var motivationStrength = (getPerkLevel("Motivation") * game.portal.Motivation.modifier);
		currentCalc *= (motivationStrength + 1);
	}
	if (!game.portal.Observation.radLocked && game.global.universe == 2 && game.portal.Observation.trinkets > 0) {
		var mult = game.portal.Observation.getMult();
		currentCalc *= mult;
	}
	//Add Fluffy Gatherer
	if (Fluffy.isRewardActive('gatherer')) {
		currentCalc *= 2;
	}
	var potionFinding;
	if (game.global.challengeActive == "Alchemy") potionFinding = alchObj.getPotionEffect("Potion of Finding");
	if (potionFinding > 1 && what != "fragments" && what != "science") {
		currentCalc *= potionFinding;
	}
	if (game.upgrades.Speedexplorer.done > 0 && what == "fragments") {
		var bonus = Math.pow(4, game.upgrades.Speedexplorer.done);
		currentCalc *= bonus;
	}
	if (game.global.challengeActive == "Melt") {
		currentCalc *= 10;
		var stackStr = Math.pow(game.challenges.Melt.decayValue, game.challenges.Melt.stacks);
		currentCalc *= stackStr;
	}
	if (game.global.challengeActive == "Archaeology" && what != "fragments") {
		var mult = game.challenges.Archaeology.getStatMult("science");
		currentCalc *= mult;
	}
	if (game.global.challengeActive == "Insanity") {
		var mult = game.challenges.Insanity.getLootMult();
		currentCalc *= mult;
	}
	if (game.challenges.Nurture.boostsActive() && what != "fragments") {
		var mult = game.challenges.Nurture.getResourceBoost();
		currentCalc *= mult;
	}
	if (game.global.pandCompletions && what != "fragments") {
		var mult = game.challenges.Pandemonium.getTrimpMult();
		currentCalc *= mult;
	}
	if (game.global.challengeActive == "Daily") {
		var mult = 0;
		if (typeof game.global.dailyChallenge.dedication !== 'undefined') {
			mult = dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
			currentCalc *= mult;
		}
		if (typeof game.global.dailyChallenge.famine !== 'undefined' && what != "fragments" && what != "science") {
			mult = dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
			currentCalc *= mult;
		}
	}
	if (game.global.challengeActive == "Hypothermia" && what == "wood") {
		var mult = game.challenges.Hypothermia.getWoodMult(true);
		currentCalc *= mult;
	}
	if ((what == "food" && game.buildings.Antenna.owned >= 5) || (what == "metal" && game.buildings.Antenna.owned >= 15)) {
		var mult = game.jobs.Meteorologist.getExtraMult();
		currentCalc *= mult;
	}
	if ((what == "food" || what == "metal" || what == "wood") && getParityBonus() > 1) {
		var mult = getParityBonus();
		currentCalc *= mult;
	}
	if ((what == "food" || what == "metal" || what == "wood") && autoBattle.oneTimers.Gathermate.owned && game.global.universe == 2) {
		var mult = autoBattle.oneTimers.Gathermate.getMult();
		currentCalc *= mult;
	}
	var heirloomBonus = calcHeirloomBonus("Staff", jobs[index] + "Speed", 0, true);
	if (heirloomBonus > 0) {
		currentCalc *= ((heirloomBonus / 100) + 1);
	}
	//Add player
	if (game.global.playerGathering == what) {
		if ((game.talents.turkimp2.purchased || game.global.turkimpTimer > 0) && (what == "food" || what == "wood" || what == "metal")) {
			var tBonus = 50;
			if (game.talents.turkimp2.purchased) tBonus = 100;
			else if (game.talents.turkimp2.purchased) tBonus = 75;
			currentCalc *= (1 + (tBonus / 100));
		}
		var playerStrength = getPlayerModifier();
		currentCalc += playerStrength;

	}
	//Add Loot	ALWAYS LAST
	if (game.options.menu.useAverages.enabled) {
		var avg = getAvgLootSecond(what);
		if (avg > 0.001) {
			currentCalc += avg;
		}
	}
	if (rawNum) return currentCalc;
	game.global.lockTooltip = false;
}

var RhousingList = ['Hut', 'House', 'Mansion', 'Hotel', 'Resort', 'Gateway', 'Collector'];

function RsafeBuyBuilding(building) {
	if (isBuildingInQueue(building))
		return false;
	if (game.buildings[building].locked)
		return false;
	var oldBuy = preBuy2();
	var decaChange = game.global.stringVersion < '5.7.0' ? game.talents.deciBuild.purchased : bwRewardUnlocked('DecaBuild');

	if (decaChange) {
		game.global.buyAmt = 10;
		if (!canAffordBuilding(building)) {
			game.global.buyAmt = 2;
			if (!canAffordBuilding(building))
				game.global.buyAmt = 1;
		}
	}
	else if (bwRewardUnlocked("DoubleBuild")) {
		game.global.buyAmt = 2;
		if (!canAffordBuilding(building))
			game.global.buyAmt = 1;
	}
	else game.global.buyAmt = 1;

	if (!canAffordBuilding(building)) {
		postBuy2(oldBuy);
		return false;
	}

	game.global.firing = false;

	debug('Building ' + building, "buildings", '*hammer2');
	if (!game.buildings[building].locked && canAffordBuilding(building)) {
		buyBuilding(building, true, true);
	}
	postBuy2(oldBuy);
	return true;
}

var smithiesBoughtThisZone = 0;

function mostEfficientHousing() {

	//Housing
	var HousingTypes = ['Hut', 'House', 'Mansion', 'Hotel', 'Resort', 'Gateway', 'Collector'];
	// Which houses we actually want to check
	var housingTargets = [];

	if (rCurrentMap === 'rTributeFarm' && rMapSettings.buyBuildings !== 'undefined') {
		if (!!rMapSettings.buyBuildings && getAutoStructureSetting().enabled && document.getElementById('autoStructureBtn').classList.contains("enabled"))
			toggleAutoStructure();
	}

	for (var house of HousingTypes) {
		var maxHousing = ((!autoBattle.oneTimers.Expanding_Tauntimp.owned && (game.global.runningChallengeSquared || game.global.challengeActive == 'Mayhem' || game.global.challengeActive == 'Pandemonium') && getPageSetting('c3buildings') && getPageSetting('c3buildingzone') >= game.global.world) ? Infinity :
			autoTrimpSettings.rBuildingSettingsArray.value[house].buyMax === 0 ? Infinity : autoTrimpSettings.rBuildingSettingsArray.value[house].buyMax);
		if (!game.buildings[house].locked && game.buildings[house].owned < maxHousing) {
			housingTargets.push(house);
		}
	}
	var runningC3 = (!autoBattle.oneTimers.Expanding_Tauntimp.owned && (game.global.runningChallengeSquared || game.global.challengeActive == 'Mayhem' || game.global.challengeActive == 'Pandemonium') && getPageSetting('c3buildings') && getPageSetting('c3buildingzone') >= game.global.world)

	var mostEfficient = {
		name: "",
		time: Infinity
	}

	for (var housing of housingTargets) {

		var worstTime = -Infinity;
		var currentOwned = game.buildings[housing].owned;
		var buildingspending = autoTrimpSettings.rBuildingSettingsArray.value[housing].percent / 100
		if (runningC3 || (!game.global.autoStorage && game.global.challengeActive === 'Hypothermia' && (housing !== 'Collector' && housing !== 'Gateway'))) buildingspending = 1;
		const dontbuy = [];
		if (!autoTrimpSettings.rBuildingSettingsArray.value[housing].enabled) dontbuy.push(housing);
		if (game.global.challengeActive === 'Quest' && questcheck() === 4 && housing === 'Collector') dontbuy.push(housing);
		if (game.global.challengeActive == 'Hypothermia' && (housing !== 'Collector' || housing !== 'Gateway') && game.challenges.Hypothermia.bonfires > 0 && game.resources.wood.owned > game.challenges.Hypothermia.bonfirePrice()) dontbuy.push(housing);
		if (rCurrentMap === 'rTributeFarm' && !rMapSettings.buyBuildings && housing !== 'Collector') dontbuy.push(housing);
		for (var resource in game.buildings[housing].cost) {
			// Get production time for that resource
			var baseCost = game.buildings[housing].cost[resource][0];
			var costScaling = game.buildings[housing].cost[resource][1];
			var avgProduction = getPsStringLocal(resource, true);
			if (avgProduction <= 0) avgProduction = 1;
			var housingBonus = game.buildings[housing].increase.by;
			if (!game.buildings.Hub.locked) housingBonus += 500;
			if (Math.max(baseCost * Math.pow(costScaling, currentOwned)) > game.resources[resource].owned * buildingspending) dontbuy.push(housing);
			if (housing == 'Gateway' && resource == 'fragments' && autoTrimpSettings.rBuildingSettingsArray.value.SafeGateway.enabled && (autoTrimpSettings.rBuildingSettingsArray.value.SafeGateway.zone === 0 || autoTrimpSettings.rBuildingSettingsArray.value.SafeGateway.zone > game.global.world)) {
				if (game.resources[resource].owned < ((PerfectMapCost_Actual(10, 'lmc') * autoTrimpSettings.rBuildingSettingsArray.value.SafeGateway.mapCount) + Math.max(baseCost * Math.pow(costScaling, currentOwned)))) dontbuy.push(housing);
			}
			// Only keep the slowest producer, aka the one that would take the longest to generate resources for
			worstTime = Math.max(baseCost * Math.pow(costScaling, currentOwned - 1) / (avgProduction * housingBonus), worstTime);
		}

		if (mostEfficient.time > worstTime && !dontbuy.includes(housing)) {
			mostEfficient.name = housing;
			mostEfficient.time = worstTime;
		}
	}
	if (mostEfficient.name == "") mostEfficient.name = null;

	return mostEfficient.name;
}

function RbuyBuildings() {

	// Storage, shouldn't be needed anymore that autostorage is lossless. Hypo fucked this statement :(
	//Turn on autostorage if you're past your last farmzone and you don't need to save wood anymore. Else will have to force it to purchase enough storage up to the cost of whatever bonfires
	if (!game.global.autoStorage && (game.global.challengeActive != 'Hypothermia' || (game.global.challengeActive == 'Hypothermia' && autoTrimpSettings.rHypoDefaultSettings.value.active && (autoTrimpSettings.rHypoDefaultSettings.value.autostorage && game.global.world >= getPageSetting('rHypoZone')[0]))))
		toggleAutoStorage(false);

	//Disables AutoStorage 
	if (game.global.challengeActive == 'Hypothermia' && autoTrimpSettings.rHypoDefaultSettings.value.active && (autoTrimpSettings.rHypoDefaultSettings.value.autostorage && game.global.world < getPageSetting('rHypoZone')[0])) {
		if (game.global.autoStorage)
			toggleAutoStorage(false);
	}
	if (!game.global.autoStorage) {
		var rBuildings = {
			'Barn': 'food',
			'Shed': 'wood',
			'Forge': 'metal'
		};
		for (var resources in rBuildings) {
			//Initialising variables
			var curRes = game.resources[rBuildings[resources]].owned;
			var maxRes = game.resources[rBuildings[resources]].max;
			//Identifying our max for the resource that's being checked
			maxRes = game.global.universe == 1 ? maxRes *= 1 + game.portal.Packrat.level * game.portal.Packrat.modifier :
				maxRes *= 1 + game.portal.Packrat.radLevel * game.portal.Packrat.modifier;
			maxRes = calcHeirloomBonus("Shield", "storageSize", maxRes);

			//Identifying the amount of resources you'd get from a Jestimp when inside a map otherwise setting the value to 1.1x current resource to ensure no storage issues
			var jestValue = game.global.mapsActive && (getCurrentMapObject().name == 'Atlantrimp' || getCurrentMapObject().name == 'Trimple of Doom') ? curRes * 2 :
				game.global.mapsActive && game.unlocks.imps.Jestimp ? scaleToCurrentMap(simpleSeconds(rBuildings[resources], 45)) :
					curRes * 1.1;
			//Skips buying sheds if you're not on one of your specified bonfire zones
			if (resources == 'Shed' && rHFBonfireCostTotal == 0) continue;
			if ((resources != 'Shed' && curRes + jestValue > maxRes) || (resources == 'Shed' && rHFBonfireCostTotal > maxRes)) {
				if (canAffordBuilding(resources, null, null, null, null, null) && game.triggers[resources].done) {
					RsafeBuyBuilding(resources);
				}
			}
		}
	}

	if (typeof rBSRunningAtlantrimp !== 'undefined' && rBSRunningAtlantrimp)
		return;

	//Still allows you to buy tributes during gem quests
	if (game.global.challengeActive == 'Quest' && game.global.world >= game.challenges.Quest.getQuestStartZone() && ([4].indexOf(questcheck()) >= 0))
		rBuyTributes();
	//Return when shouldn't run during quest
	if ((game.global.challengeActive == "Quest" && game.global.world >= game.challenges.Quest.getQuestStartZone() && game.global.lastClearedCell < 90 && ([1, 2, 3, 4].indexOf(questcheck()) >= 0)))
		return

	//Smithy purchasing
	if (!game.buildings.Smithy.locked) {
		// Purchasing a smithy whilst on Quest
		if (game.global.challengeActive == 'Quest' && (smithiesBoughtThisZone < game.global.world || questcheck() === 10) && canAffordBuilding('Smithy', null, null, false, false, 1) && getPageSetting('rQuest')) {
			var smithycanBuy = calculateMaxAfford(game.buildings.Smithy, true, false, false, true, 1);
			var questZones = Math.floor(((!game.global.runningChallengeSquared ? 85 : getPageSetting('rQuestSmithyZone') === -1 ? Infinity : getPageSetting('rQuestSmithyZone') - game.global.world) / 2) - 1);
			var smithiesToBuy = smithycanBuy > questZones ? smithycanBuy - questZones : questcheck() == 10 ? 1 : 0;
			if (smithiesBoughtThisZone > game.global.world) smithiesBoughtThisZone = 0;
			//Buying smithies that won't be needed for quests before user entered end goal
			if (smithiesToBuy > 0) {
				buyBuilding("Smithy", true, true, smithiesToBuy);
				smithiesBoughtThisZone = game.global.world;
			}
		}
		else if ((game.global.challengeActive !== 'Quest' || !getPageSetting('rQuest')) && (autoTrimpSettings.rBuildingSettingsArray.value.Smithy.enabled && (autoTrimpSettings.rBuildingSettingsArray.value.Smithy.buyMax === 0 ? Infinity : autoTrimpSettings.rBuildingSettingsArray.value.Smithy.buyMax) > game.buildings.Smithy.purchased && canAffordBuilding('Smithy', false, false, false, false, false, autoTrimpSettings.rBuildingSettingsArray.value.Smithy.percent) || rCurrentMap === 'rSmithyFarm')) {
			buyBuilding("Smithy", true, true, 1);
		}
	}

	//Laboratory Purchasing (Nurture)
	if (game.global.challengeActive === 'Nurture' && !game.buildings.Laboratory.locked && autoTrimpSettings.rBuildingSettingsArray.value.Laboratory.enabled) {
		var labAmt = autoTrimpSettings.rBuildingSettingsArray.value.Laboratory.buyMax === 0 ? Infinity : autoTrimpSettings.rBuildingSettingsArray.value.Laboratory.buyMax;
		var labPct = autoTrimpSettings.rBuildingSettingsArray.value.Laboratory.percent / 100;
		if (labAmt > game.buildings.Laboratory.purchased && canAffordBuilding('Laboratory')) {
			buyBuilding('Laboratory', true, true, calculateMaxAffordLocal(game.buildings.Laboratory, true, false, false, (labAmt - game.buildings.Laboratory.purchased), labPct));
		}
	}

	//Microchip
	if (!game.buildings.Microchip.locked && canAffordBuilding('Microchip')) {
		buyBuilding('Microchip', true, true, 1);
	}

	if (rCurrentMap !== 'rTributeFarm') {
		if (getAutoStructureSetting().enabled && !document.getElementById('autoStructureBtn').classList.contains("enabled")) {
			document.getElementById('autoStructureBtn').classList.add("enabled")
			autoTrimpSettings.rAutoStructureSetting.value = true;
		}
		else if (!getAutoStructureSetting().enabled && document.getElementById('autoStructureBtn').classList.contains("enabled")) {
			document.getElementById('autoStructureBtn').classList.remove("enabled")
			autoTrimpSettings.rAutoStructureSetting.value = false;
		}
	}

	rBuyTributes();

	//Housing 
	var boughtHousing = false;
	var runningC3 = (!autoBattle.oneTimers.Expanding_Tauntimp.owned && (game.global.runningChallengeSquared || game.global.challengeActive == 'Mayhem' || game.global.challengeActive == 'Pandemonium') && getPageSetting('c3buildings') && getPageSetting('c3buildingzone') >= game.global.world)
	do {
		boughtHousing = false;
		var housing = mostEfficientHousing();
		if (housing === null) continue;

		var housingAmt = autoTrimpSettings.rBuildingSettingsArray.value[housing].buyMax === 0 ? Infinity : autoTrimpSettings.rBuildingSettingsArray.value[housing].buyMax;
		var buildingspending = autoTrimpSettings.rBuildingSettingsArray.value[housing].percent / 100
		if (runningC3 || (!game.global.autoStorage && game.global.challengeActive === 'Hypothermia' && (housing !== 'Collector' && housing !== 'Gateway'))) buildingspending = 1;
		var maxCanAfford = housing !== null ? calculateMaxAffordLocal(game.buildings[housing], true, false, false, housingAmt, buildingspending) : false;
		if (((housing != null && canAffordBuilding(housing, false, false, false, false, 1)) && (game.buildings[housing].purchased < (housingAmt === -1 ? Infinity : housingAmt) || runningC3))) {
			if (rCurrentMap === 'rSmithyFarm' && housing !== 'Gateway') return;
			else if (runningC3)
				buyBuilding(housing, true, true, 999);
			else if (rCurrentMap === 'rTributeFarm' && !rMapSettings.buyBuildings) {
				if (document.getElementById('autoStructureBtn').classList.contains("enabled") && getAutoStructureSetting().enabled)
					toggleAutoStructure();
				return;
			}
			else if ((maxCanAfford > housingAmt) && game.global.buildingsQueue.length <= 3)
				buyBuilding(housing, true, true, housingAmt - game.buildings[housing].purchased, buildingspending);
			else if (maxCanAfford > 0 && game.global.buildingsQueue.length <= 3)
				buyBuilding(housing, true, true, maxCanAfford);
			else
				return;
			boughtHousing = true;
		}
	} while (boughtHousing)
}

function rBuyTributes() {
	var affordableMets = 0;
	if (autoTrimpSettings.rJobSettingsArray.value.Meteorologist.enabled || rMapSettings.shouldTribute || (rCurrentMap === 'rSmithyFarm' && rMapSettings.gemFarm)) {
		affordableMets = getMaxAffordable(
			game.jobs.Meteorologist.cost.food[0] * Math.pow(game.jobs.Meteorologist.cost.food[1], game.jobs.Meteorologist.owned),
			game.resources.food.owned * (autoTrimpSettings.rJobSettingsArray.value.Meteorologist.percent / 100),
			game.jobs.Meteorologist.cost.food[1],
			true
		);
	}
	//Won't buy Tributes if they're locked or if a meteorologist can be purchased as that should always be the more efficient purchase
	if (!game.buildings.Tribute.locked && (game.jobs.Meteorologist.locked || !(affordableMets > 0 && !game.jobs.Meteorologist.locked && !rMapSettings.shouldTribute))) {
		if ((!autoTrimpSettings.rBuildingSettingsArray.value.Tribute.enabled || rMapSettings.shouldMeteorologist || rCurrentMap === 'rWorshipperFarm') && !rMapSettings.shouldTribute) return;
		//Spend 100% of food on Tributes if Tribute Farming otherwise uses the value in RTributeSpendingPct.
		var rTributeSpendPct = rCurrentMap === 'rTributeFarm' && rMapSettings.tribute > 0 ? 1 : autoTrimpSettings.rBuildingSettingsArray.value.Tribute.percent > 0 ? autoTrimpSettings.rBuildingSettingsArray.value.Tribute.percent / 100 : 1;

		var buyTributeCount = getMaxAffordable(Math.pow(1.05, game.buildings.Tribute.purchased) * 10000, (game.resources.food.owned * rTributeSpendPct), 1.05, true);

		var maxTributes = autoTrimpSettings.rBuildingSettingsArray.value.Tribute.buyMax === 0 ? Infinity : rCurrentMap === 'rTributeFarm' && rMapSettings.tribute > autoTrimpSettings.rBuildingSettingsArray.value.Tribute.buyMax ? rMapSettings.tribute : autoTrimpSettings.rBuildingSettingsArray.value.Tribute.buyMax;
		if ((rCurrentMap === 'rSmithyFarm' && rMapSettings.gemFarm) || questcheck() === 4) {
			maxTributes = Infinity;
			rTributeSpendPct = 1;
		}
		if (maxTributes > game.buildings.Tribute.purchased)
			buyTributeCount = Math.min(buyTributeCount, maxTributes - game.buildings.Tribute.purchased);
		if (buyTributeCount > 0 && (maxTributes < 0 || (maxTributes > game.buildings.Tribute.purchased)))
			buyBuilding('Tribute', true, true, buyTributeCount);
	}
}
