MODULES["buildings"] = {};
MODULES["buildings"].storageMainCutoff = 0.85;
MODULES["buildings"].storageLowlvlCutoff1 = 0.7;
MODULES["buildings"].storageLowlvlCutoff2 = 0.5;

//Helium

var housingList = ['Hut', 'House', 'Mansion', 'Hotel', 'Resort', 'Gateway', 'Collector', 'Warpstation'];

function safeBuyBuilding(building) {
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
	debug('Building ' + building, "buildings", '*hammer2');
	if (!game.buildings[building].locked && canAffordBuilding(building)) {
		buyBuilding(building, true, true);
	}
	postBuy2(oldBuy);
	return true;
}

function buyFoodEfficientHousing() {
	var foodHousing = ["Hut", "House", "Mansion", "Hotel", "Resort"];
	var unlockedHousing = [];
	for (var house in foodHousing) {
		if (game.buildings[foodHousing[house]].locked === 0) {
			unlockedHousing.push(foodHousing[house]);
		}
	}
	var buildorder = [];
	for (var house in unlockedHousing) {
		var building = game.buildings[unlockedHousing[house]];
		var cost = getBuildingItemPrice(building, "food", false, 1);
		var ratio = cost / building.increase.by;
		buildorder.push({
			'name': unlockedHousing[house],
			'ratio': ratio
		});
		document.getElementById(unlockedHousing[house]).style.border = "1px solid #FFFFFF";
	}
	buildorder.sort(function (a, b) {
		return a.ratio - b.ratio;
	});
	var bestfoodBuilding = null;
	var bb = buildorder[0];
	var max = getPageSetting('Max' + bb.name);
	if (game.buildings[bb.name].owned < max || max == -1) {
		bestfoodBuilding = bb.name;
	}
	if (bestfoodBuilding) {
		document.getElementById(bestfoodBuilding).style.border = "1px solid #00CC01";
		safeBuyBuilding(bestfoodBuilding);
	}
}

function buyGemEfficientHousing() {
	var gemHousing = ["Hotel", "Resort", "Gateway", "Collector", "Warpstation"];
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
		if (unlockedHousing[house] == "Gateway" && !canAffordBuilding('Gateway'))
			continue;
		obj[unlockedHousing[house]] = ratio;
		document.getElementById(unlockedHousing[house]).style.border = "1px solid #FFFFFF";
	}
	var keysSorted = Object.keys(obj).sort(function (a, b) {
		return obj[a] - obj[b];
	});
	bestBuilding = null;
	for (var best in keysSorted) {
		var max = getPageSetting('Max' + keysSorted[best]);
		if (max === false) max = -1;
		if (game.buildings[keysSorted[best]].owned < max || max == -1) {
			bestBuilding = keysSorted[best];
			document.getElementById(bestBuilding).style.border = "1px solid #00CC00";
			var skipWarp = false;
			if (getPageSetting('WarpstationCap') && bestBuilding == "Warpstation") {
				if (game.buildings.Warpstation.owned >= (Math.floor(game.upgrades.Gigastation.done * getPageSetting('DeltaGigastation')) + getPageSetting('FirstGigastation')))
					skipWarp = true;
			}
			var warpwallpct = getPageSetting('WarpstationWall3');
			if (warpwallpct > 1 && bestBuilding == "Warpstation") {
				if (getBuildingItemPrice(game.buildings.Warpstation, "metal", false, 1) * Math.pow(1 - game.portal.Resourceful.modifier, game.portal.Resourceful.level) > (game.resources.metal.owned / warpwallpct))
					skipWarp = true;
			}
			if (skipWarp)
				bestBuilding = null;
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
							bestBuilding = "Warpstation";
					}
				}
			}
			break;
		}
	}
	if (bestBuilding) {
		safeBuyBuilding(bestBuilding);
	}
}

function buyBuildings() {
	if ((game.jobs.Miner.locked && game.global.challengeActive != 'Metal') || (game.jobs.Scientist.locked && game.global.challengeActive != "Scientist")) return;
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
		if (getPageSetting('DynamicGyms')) {
			if (!game.global.preMapsActive && calcOurBlock(true) > calcBadGuyDmg(getCurrentEnemy(), null, true, true))
				skipGym = true;
		}
		var gymwallpct = getPageSetting('GymWall');
		if (gymwallpct > 1) {
			if (getBuildingItemPrice(game.buildings.Gym, "wood", false, 1) * Math.pow(1 - game.portal.Resourceful.modifier, game.portal.Resourceful.level) > (game.resources.wood.owned / gymwallpct))
				skipGym = true;
		}
		//ShieldBlock cost Effectiveness:
		if (game.equipment['Shield'].blockNow) {
			var gymEff = evaluateEquipmentEfficiency('Gym');
			var shieldEff = evaluateEquipmentEfficiency('Shield');
			if ((gymEff.Wall) || (gymEff.Factor <= shieldEff.Factor && !gymEff.Wall))
				skipGym = true;
		}
		if (needGymystic) skipGym = true;
		if (!skipGym)
			safeBuyBuilding('Gym');
		needGymystic = false;
	}
	//Tributes:
	if (!game.buildings.Tribute.locked && !hidebuild && (getPageSetting('MaxTribute') > game.buildings.Tribute.owned || getPageSetting('MaxTribute') == -1)) {
		safeBuyBuilding('Tribute');
	}
	//Nurseries
	if (game.buildings.Nursery.locked == 0 && (!hidebuild && (game.global.world >= getPageSetting('NoNurseriesUntil') || getPageSetting('NoNurseriesUntil') < 1) && (getPageSetting('MaxNursery') > game.buildings.Nursery.owned || getPageSetting('MaxNursery') == -1)) || (game.global.challengeActive != "Daily" && getPageSetting('PreSpireNurseries') > game.buildings.Nursery.owned && isActiveSpireAT()) || (game.global.challengeActive == "Daily" && getPageSetting('dPreSpireNurseries') > game.buildings.Nursery.owned && disActiveSpireAT())) {
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

	if (rTributeFarming && typeof (rTrFbuyBuildings) !== 'undefined') {
		if (!rTrFbuyBuildings && getAutoStructureSetting().enabled && document.getElementById('autoStructureBtn').classList.contains("enabled"))
			toggleAutoStructure();
	}

	for (var house of HousingTypes) {
		var maxHousing = (((game.global.runningChallengeSquared || game.global.challengeActive == 'Mayhem' || game.global.challengeActive == 'Pandemonium') && getPageSetting('c3buildingzone') >= game.global.world) ? Infinity :
			autoTrimpSettings.rBuildingSettingsArray.value[house].buyMax === 0 ? Infinity : autoTrimpSettings.rBuildingSettingsArray.value[house].buyMax);
		if (!game.buildings[house].locked && game.buildings[house].owned < maxHousing) {
			housingTargets.push(house);
		}
	}
	var runningC3 = ((game.global.runningChallengeSquared || game.global.challengeActive == 'Mayhem' || game.global.challengeActive == 'Pandemonium') && getPageSetting('c3buildingzone') >= game.global.world)

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
		if (rTributeFarming && typeof (rTrFbuyBuildings) !== 'undefined' && !rTrFbuyBuildings && housing !== 'Collector') dontbuy.push(housing);
		for (var resource in game.buildings[housing].cost) {
			// Get production time for that resource
			var baseCost = game.buildings[housing].cost[resource][0];
			var costScaling = game.buildings[housing].cost[resource][1];
			var avgProduction = getPsString(resource, true);
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

	if (rBSRunningAtlantrimp)
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
		if (game.global.challengeActive == 'Quest' && smithiesBoughtThisZone < game.global.world && canAffordBuilding('Smithy')) {
			var smithycanBuy = calculateMaxAfford(game.buildings.Smithy, true, false, false, true, 1)
			var questZones = Math.floor(((!game.global.runningChallengeSquared ? 85 : getPageSetting('c3finishrun') === -1 ? Infinity : getPageSetting('c3finishrun') - game.global.world) / 2) - 1);
			var smithiesToBuy = smithycanBuy > questZones ? smithycanBuy - questZones : questcheck() == 10 || (RcalcHDratio() * 10 >= getPageSetting('Rmapcuntoff')) ? 1 : 0;
			if (smithiesBoughtThisZone > game.global.world) smithiesBoughtThisZone = 0;
			//Buying smithies that won't be needed for quests before user entered end goal
			if (smithiesToBuy > 0) {
				buyBuilding("Smithy", true, true, smithiesToBuy);
				smithiesBoughtThisZone = game.global.world;
			}
		}
		else if (game.global.challengeActive !== 'Quest' && (autoTrimpSettings.rBuildingSettingsArray.value.Smithy.enabled && (autoTrimpSettings.rBuildingSettingsArray.value.Smithy.buyMax === 0 ? Infinity : autoTrimpSettings.rBuildingSettingsArray.value.Smithy.buyMax) > game.buildings.Smithy.purchased && canAffordBuilding('Smithy', false, false, false, false, false, autoTrimpSettings.rBuildingSettingsArray.value.Smithy.percent) || rShouldSmithyFarm)) {
			buyBuilding("Smithy", true, true, 1);
		}
	}

	//Laboratory Purchasing (Nurture)
	if (game.global.challengeActive === 'Nurture' && !game.buildings.Laboratory.locked) {
		var labAmt = autoTrimpSettings.rBuildingSettingsArray.value.Laboratory.buyMax === 0 ? Infinity : autoTrimpSettings.rBuildingSettingsArray.value.Laboratory.buyMax;
		var labPct = autoTrimpSettings.rBuildingSettingsArray.value.Laboratory.percent / 100
		var labPurchase = calculateMaxAffordLocal(game.buildings.Laboratory, true, false, false, labAmt, labPct);
		if (labAmt > game.buildings.Laboratory.purchased && canAffordBuilding('Laboratory')) {
			buyBuilding('Laboratory', true, true, calculateMaxAffordLocal(game.buildings.Laboratory, true, false, false, labAmt, labPct));
		}
	}

	//Microchip
	if (!game.buildings.Microchip.locked && canAffordBuilding('Microchip')) {
		buyBuilding('Microchip', true, true, 1);
	}

	if (!rTributeFarming) {
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
	var runningC3 = ((game.global.runningChallengeSquared || game.global.challengeActive == 'Mayhem' || game.global.challengeActive == 'Pandemonium') && getPageSetting('c3buildingzone') >= game.global.world)
	do {
		boughtHousing = false;
		var housing = mostEfficientHousing();
		if (housing === null) continue;

		var housingAmt = autoTrimpSettings.rBuildingSettingsArray.value[housing].buyMax === 0 ? Infinity : autoTrimpSettings.rBuildingSettingsArray.value[housing].buyMax;
		var buildingspending = autoTrimpSettings.rBuildingSettingsArray.value[housing].percent / 100
		if (runningC3 || (!game.global.autoStorage && game.global.challengeActive === 'Hypothermia' && (housing !== 'Collector' && housing !== 'Gateway'))) buildingspending = 1;
		var maxCanAfford = housing !== null ? calculateMaxAffordLocal(game.buildings[housing], true, false, false, housingAmt, buildingspending) : false;
		if (((housing != null && canAffordBuilding(housing)) && (game.buildings[housing].purchased < (housingAmt === -1 ? Infinity : housingAmt) || runningC3))) {
			if (runningC3)
				buyBuilding(housing, true, true, 999);
			else if (rTributeFarming && typeof (rTrFbuyBuildings) !== 'undefined' && !rTrFbuyBuildings) {
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
	if (autoTrimpSettings.rJobSettingsArray.value.Meteorologist.enabled || rShouldTributeFarm || rShouldSmithyGemFarm) {
		affordableMets = getMaxAffordable(
			game.jobs.Meteorologist.cost.food[0] * Math.pow(game.jobs.Meteorologist.cost.food[1], game.jobs.Meteorologist.owned),
			game.resources.food.owned * (autoTrimpSettings.rJobSettingsArray.value.Meteorologist.percent / 100),
			game.jobs.Meteorologist.cost.food[1],
			true
		);
	}
	//Won't buy Tributes if they're locked or if a meteorologist can be purchased as that should always be the more efficient purchase
	if (!game.buildings.Tribute.locked && (game.jobs.Meteorologist.locked || !(affordableMets > 0 && !game.jobs.Meteorologist.locked && !rShouldTributeFarm))) {
		if (rShouldMetFarm && !rShouldTributeFarm) return;
		//Spend 100% of food on Tributes if Tribute Farming otherwise uses the value in RTributeSpendingPct.
		var rTributeSpendPct = typeof (rTrFTributes) !== 'undefined' && rTrFTributes > 0 ? 1 : autoTrimpSettings.rBuildingSettingsArray.value.Tribute.percent > 0 ? autoTrimpSettings.rBuildingSettingsArray.value.Tribute.percent / 100 : 1;
		var buyTributeCount = getMaxAffordable(Math.pow(1.05, game.buildings.Tribute.purchased) * 10000, (game.resources.food.owned * rTributeSpendPct), 1.05, true);
		maxTributes = autoTrimpSettings.rBuildingSettingsArray.value.Tribute.buyMax === 0 ? Infinity : typeof (rTrFTributes) !== 'undefined' && rTrFTributes > autoTrimpSettings.rBuildingSettingsArray.value.Smithy.buyMax ? rTrFTributes : autoTrimpSettings.rBuildingSettingsArray.value.Smithy.buyMax;
		if (rShouldSmithyGemFarm || rShouldQuest === 4) {
			maxTributes = Infinity;
			rTributeSpendPct = 1;
		}
		//Won't buy them if the RAlchDontBuyMets toggle is enabled and on zone 152
		if (maxTributes > game.buildings.Tribute.purchased)
			buyTributeCount = Math.min(buyTributeCount, maxTributes - game.buildings.Tribute.purchased);
		if (buyTributeCount > 0 && (maxTributes < 0 || (maxTributes > game.buildings.Tribute.purchased)))
			buyBuilding('Tribute', true, true, buyTributeCount);
	}
}
