MODULES.buildings = {
	betaHouseEfficiency: false
};

function safeBuyBuilding(building, amt) {
	const queued = isBuildingInQueue(building);
	const locked = game.buildings[building].locked;
	const notAfford = !canAffordBuilding(building, false, false, false, false, amt);
	if (queued || locked || notAfford) return;

	if (amt > 1) {
		const maxAffordable = Math.max(1, calculateMaxAfford_AT(game.buildings[building], true, false, false, amt, 0.01));
		amt = Math.min(amt, maxAffordable);

		if (amt > 1 && game.global.world <= 10 && !bwRewardUnlocked('Foremany')) amt = 1;
	}

	buyBuilding(building, true, true, amt);
	if (building !== 'Trap') debug(`Building ${amt} ${building}${addAnS(amt)}`, 'buildings', '*hammer2');
}

function advancedNurseries() {
	if (game.global.universe !== 1 || game.stats.highestLevel.valueTotal() < 230 || !getPageSetting('advancedNurseries')) return false;

	const disableIce = getPageSetting('advancedNurseriesIce');
	if (disableIce > 0 && getEmpowerment() === 'Ice' && (disableIce === 1 || (disableIce === 2 && game.global.spireActive))) return false;
	// Only build nurseries if: A) lacking Health & B) have max health map stacks
	const lackingHealth = whichHitsSurvived() < targetHitsSurvived();
	const maxMapBonus = game.global.mapBonus >= getPageSetting('mapBonusHealth');

	return lackingHealth & maxMapBonus;
}

function _housingToCheck() {
	const housingTypes = ['Hut', 'House', 'Mansion', 'Hotel', 'Resort', 'Gateway', 'Collector'];
	return housingTypes.filter((house) => _needHousing(house, MODULES.buildings.betaHouseEfficiency));
}

function _needHousing(houseName, ignoreAffordability) {
	/* Returns true if we can afford and need the building. */
	const buildingSettings = getPageSetting('buildingSettingsArray')[houseName];
	const buildingStat = game.buildings[houseName];

	if (buildingStat.locked) return false;
	if (!buildingSettings.enabled) return false;

	const maxHousing = buildingSettings.buyMax === 0 ? Infinity : buildingSettings.buyMax;
	if (buildingStat.owned >= maxHousing) return false;

	if (houseName === 'Collector') {
		// Stops Collectors being purchased when on Quest gem quests.
		if (getCurrentQuest() === 4) return false;
		// Fix for Infinity collectors since it doesn't take resourceful into account.
		if (buildingStat.purchased >= 6000) return false;
	}
	const safeHousingFood = ['Gateway', 'Collector'];

	// Stops Food buildings being pushed to queue if Tribute Farming with Buy Buildings toggle disabled.
	if (mapSettings.mapName === 'Tribute Farm' && !mapSettings.buyBuildings && !safeHousingFood.includes(houseName)) return false;

	// Stops buildings being pushed if Smithy Farming so that we aren't going back and forth between Smithy gem/wood/metal maps constantly while trying to farm resources for them.
	if (mapSettings.mapName === 'Smithy Farm' && houseName !== 'Gateway') return false;

	// Can afford the building.
	if (!ignoreAffordability) {
		const spendingPerc = buildingSettings.percent / 100;
		const resourcefulMod = getResourcefulMult();
		for (const resource in buildingStat.cost) {
			if (!_canAffordBuilding(resource, buildingStat, spendingPerc, resourcefulMod)) return false;
		}
	}

	if (houseName === 'Gateway') {
		//Use Safe Gateways for U2
		if (game.global.universe === 2) return !_checkSafeGateway(buildingStat);

		if (MODULES.buildings.betaHouseEfficiency) {
			//Applies the user defined Gateway % to fragments only
			const spendingPerc = buildingSettings.percent / 100;
			const resourcefulMod = getResourcefulMult();

			if (!_canAffordBuilding('fragments', buildingStat, spendingPerc, resourcefulMod)) return false;
		}
	}

	return true;
}

function _checkSafeGateway(buildingStat) {
	/* Returns true if SafeGateway says not to buy. */
	const safeGateway = getPageSetting('buildingSettingsArray').SafeGateway;
	if (safeGateway.enabled && (safeGateway.zone === 0 || safeGateway.zone > game.global.world)) {
		const fragsOwned = game.resources.fragments.owned;

		const gatewaysOwned = buildingStat.owned;
		const base = buildingStat.cost.fragments[0];
		const scaling = buildingStat.cost.fragments[1];
		const nextPrice = Math.max(base * Math.pow(scaling, gatewaysOwned));
		const cost = mapCost(10, getAvailableSpecials('lmc', true)) * safeGateway.mapCount + nextPrice;

		return fragsOwned < cost;
	}
}

function _getResourcePerSecond() {
	const resourceTypes = ['food', 'wood', 'metal', 'gems', 'fragments'];
	const resourcePerSecond = {};
	for (const resource of resourceTypes) {
		resourcePerSecond[resource] = trimpStats.resourcesPS[resource].manual;
	}

	return resourcePerSecond;
}

function mostEfficientHousing_beta(resourceName) {
	function effWrapper(houseName = undefined, eff = Infinity) {
		return { name: houseName, eff: eff };
	}

	function calcCostEff(houseName) {
		return getBuildingItemPrice(game.buildings[houseName], resourceName, false, 1) / _getHousingBonus(houseName);
	}

	return _housingToCheck()
		.filter((houseName) => game.buildings[houseName].cost[resourceName])
		.map((houseName) => effWrapper(houseName, calcCostEff(houseName)))
		.reduce((mostEff, current) => (current.eff < mostEff.eff ? current : mostEff), effWrapper()).name;
}

function mostEfficientHousing(resourcePerSecond) {
	function effWrapper(houseName = undefined, eff = 0) {
		return { name: houseName, eff: eff };
	}

	function calcEff(houseName) {
		return _getHousingBonus(houseName) / _getSlowestResource(resourcePerSecond, houseName);
	}

	return _housingToCheck()
		.map((houseName) => effWrapper(houseName, calcEff(houseName)))
		.reduce((mostEff, current) => (current.eff > mostEff.eff ? current : mostEff), effWrapper()).name;
}

function _canAffordBuilding(resourceName, buildingStat, spendingPerc, resourcefulMod) {
	const owned = buildingStat.owned;
	const base = buildingStat.cost[resourceName][0];
	const scaling = buildingStat.cost[resourceName][1];
	const price = Math.max(base * Math.pow(scaling, owned) * resourcefulMod);
	const maxSpending = game.resources[resourceName].owned * spendingPerc;

	return maxSpending > price;
}

function _getHousingBonus(houseName) {
	let housingBonus = game.buildings[houseName].increase.by;

	if (!game.buildings.Hub.locked) {
		let hubAmt = 1;
		if (houseName === 'Collector' && autoBattle.oneTimers.Collectology.owned) hubAmt = autoBattle.oneTimers.Collectology.getHubs();
		housingBonus += hubAmt * game.buildings.Hub.increase.by;
	}

	return housingBonus;
}

function _getSlowestResource(resourcePerSecond, houseName) {
	/* Return the time for the building resource which it takes the longest to generate resources for. */
	let avgProduction;
	let worstTime = -Infinity;
	const buildingStat = game.buildings[houseName];
	const resourcefulMod = getResourcefulMult();
	const owned = buildingStat.owned;

	for (const resource in buildingStat.cost) {
		const baseCost = buildingStat.cost[resource][0];
		const costScaling = buildingStat.cost[resource][1];
		const price = baseCost * Math.pow(costScaling, owned - 1) * resourcefulMod;

		if (resource === 'metal' && challengeActive('Transmute')) avgProduction = resourcePerSecond['wood'];
		else avgProduction = resourcePerSecond[resource];
		if (avgProduction <= 0) avgProduction = 1;

		worstTime = Math.max(price / avgProduction, worstTime);
	}

	return worstTime;
}

function buyBuildings() {
	if (game.jobs.Farmer.locked || game.resources.trimps.owned === 0) return;
	if (game.global.world === 1 && game.upgrades.Miners.allowed && !game.upgrades.Miners.done) return;

	// Disabling autoBuildings if AT AutoStructure is disabled.
	if (!getPageSetting('buildingsType')) return;

	const buildingSettings = getPageSetting('buildingSettingsArray');

	_handleStorage();

	if (_checkUniqueMaps()) return;

	if (_checkQuest()) return;

	if (game.global.universe === 1) {
		_buyNursery(buildingSettings);

		_buyGyms(buildingSettings);

		_buyWormholes(buildingSettings);

		_buyWarpstations();
	}

	if (game.global.universe === 2) {
		_buySmithy(buildingSettings);

		_buyLaboratory(buildingSettings);

		_buyMicrochip();

		_buyAntenna(buildingSettings);
	}

	_buyTribute();

	_keepBuyingHousing(buildingSettings);
}

function _getHypoZone() {
	// A quick way to identify if we are running Hypothermia and what our very first farm zone is for autostorage manipulation purposes.
	// Need to have it setup to go through every setting to ensure we don't miss the first one after introducing the priority input.
	let hypoZone = 0;
	if (challengeActive('Hypothermia')) {
		const hypoSettings = getPageSetting('hypothermiaSettings');
		if (hypoSettings[0].active && hypoSettings[0].autostorage && hypoSettings.length > 0) {
			for (let y = 1; y < hypoSettings.length; y++) {
				const setting = hypoSettings[y];
				if (!setting.active) continue;
				if (hypoZone === 0 || hypoZone > setting.world) hypoZone = setting.world;
			}
		}
	}

	return hypoZone;
}

function _buyStorage(hypoZone) {
	// hypoZone is only above 0 if Hypothermia is active.
	const buildings = {
		Barn: 'food',
		Shed: 'wood',
		Forge: 'metal'
	};

	const map = getCurrentMapObject();

	for (const [storage, resource] of Object.entries(buildings)) {
		if (storage === 'Shed' && hypoZone > game.global.world) continue;
		const curRes = game.resources[resource].owned;
		let maxRes = game.resources[resource].max;

		// Identifying our max for the resource that's being checked
		maxRes = maxRes *= 1 + getPerkLevel('Packrat') * getPerkModifier('Packrat');
		maxRes = calcHeirloomBonus('Shield', 'storageSize', maxRes);
		maxRes *= 0.9;

		// Identifying the amount of resources you'd get from a Jestimp when inside a map otherwise setting the value to 1.1x current resource to ensure no storage issues
		let exoticValue = 0;

		if (game.global.mapsActive) {
			if (map.name === getAncientTreasureName()) {
				exoticValue = curRes;
			} else {
				const seconds = game.unlocks.imps.Jestimp ? 45 : game.unlocks.imps.Chronoimp ? 5 : 0;
				exoticValue = scaleToCurrentMap(simpleSeconds(resource, seconds));
			}
		}

		const firstZoneCheck = game.global.world === 1 && curRes > maxRes;
		const tenZonesCheck = game.global.world >= 2 && game.global.world < 10 && curRes > maxRes;
		const mapsUnlockedCheck = curRes + exoticValue > maxRes;

		if ((firstZoneCheck || tenZonesCheck || mapsUnlockedCheck) && game.triggers[storage].done) {
			safeBuyBuilding(storage, 1);
		}
	}
}

/**
 * Handle storage when about to hit resource cap.
 * Special checks for Hypothermia.
 */
function _handleStorage() {
	const hypoZone = _getHypoZone();

	// Buys storage buildings when about to cap resources isn't needed with lossless autostorage.
	// But hypothermia messed this up. Has a check for if on Hypo and checks for the first Hypo farm zone.
	if (!game.global.autoStorage && game.global.world >= hypoZone) toggleAutoStorage(false);

	// Disables AutoStorage when our first Hypothermia farm zone is greater than current world zone
	if (game.global.autoStorage && game.global.world < hypoZone) toggleAutoStorage(false);

	// Buys storage buildings when about to cap resources.
	if (!game.global.improvedAutoStorage || hypoZone) _buyStorage(hypoZone);
}

/**
 * Disable buying buildings inside of unique maps.
 */
function _checkUniqueMaps() {
	if (game.global.mapsActive && getCurrentMapObject().name === getAncientTreasureName()) return true;
}

/**
 * Disable buying buildings if we are running quest and doing a resource quest.
 * [WARNING]: has side effect of purchasing tributes if the quest is a gem quest.
 */
function _checkQuest() {
	// Checks to see if we are running Quest and above our first Quest zone and the current zones Quest hasn't been completed.
	if (challengeActive('Quest') && getPageSetting('quest') && game.global.world >= game.challenges.Quest.getQuestStartZone()) {
		const questNumber = getCurrentQuest();
		// Still allows you to buy tributes during gem quests
		if (questNumber === 4) _buyTribute();
		// Don not buy buildings if on a resource (food, wood, metal, gems) quest.
		if ([1, 2, 3, 4].indexOf(questNumber) >= 0) return true;
	}
}

/**
 * Buys nurseries if necessary. For the helium universe.
 */
function _buyNursery(buildingSettings) {
	const nurseryInfo = game.buildings.Nursery;
	if (nurseryInfo.locked || challengeActive('Trapper')) return;
	if (runningAncientTreasure()) return;

	const nurserySetting = buildingSettings.Nursery;
	const settingPrefix = trimpStats.isC3 ? 'c2' : trimpStats.isDaily ? 'd' : '';
	const preSpireSetting = getPageSetting(settingPrefix + 'PreSpireNurseries');
	const nurseryPreSpire = isDoingSpire() && nurseryInfo.owned < preSpireSetting ? preSpireSetting : 0;
	const nurseryPct = nurserySetting.percent / 100;
	const nurseryCanAfford = calculateMaxAfford_AT(nurseryInfo, true, false, false, null, nurseryPct);
	const nurseryZoneOk = nurserySetting.enabled && game.global.world >= nurserySetting.fromZ;

	if (nurseryCanAfford > 0 && (nurseryZoneOk || nurseryPreSpire > 0)) {
		let nurseryAmt = nurseryPreSpire > 0 ? nurseryPreSpire : Math.max(nurseryPreSpire, nurserySetting.buyMax);
		if (nurseryAmt === 0 && (!getPageSetting('advancedNurseries') || game.stats.highestLevel.valueTotal() < 230)) nurseryAmt = Infinity;
		const nurseryToBuy = Math.min(nurseryCanAfford, nurseryAmt - nurseryInfo.owned);

		if (nurseryPreSpire > 0 && nurseryToBuy > 0) {
			safeBuyBuilding('Nursery', nurseryToBuy);
		} else if (advancedNurseries()) {
			safeBuyBuilding('Nursery', Math.min(nurseryCanAfford, getPageSetting('advancedNurseriesAmount')));
		} else if (nurseryToBuy > 0) {
			safeBuyBuilding('Nursery', nurseryToBuy);
		}
	}
}

/**
 * Buys gyms if necessary. For the helium universe.
 */
function _buyGyms(buildingSettings) {
	if (game.buildings.Gym.locked || !buildingSettings.Gym || !buildingSettings.Gym.enabled || needGymystic() || runningAncientTreasure()) return;

	//Gym vs Shield Efficiency
	if ((game.equipment.Shield.blockNow || MODULES.buildings.betaHouseEfficiency) && getPageSetting('equipOn')) {
		const data = shieldGymEfficiency();
		if (data.Gym > data.Shield) return;
	}

	// Saves wood for Speed upgrades
	const upgrades = ['Efficiency', 'Speedlumber', 'Megalumber', 'Coordination', 'Blockmaster', 'TrainTacular', 'Potency'];
	const saveWood = upgrades.some((up) => shouldSaveForSpeedUpgrade(game.upgrades[up]));
	if (saveWood && !challengeActive('Scientist') && (game.global.autoUpgrades || getPageSetting('upgradeType'))) return;

	const gymAmt = buildingSettings.Gym.buyMax === 0 ? Infinity : buildingSettings.Gym.buyMax;
	const purchased = game.buildings.Gym.purchased;
	const max = gymAmt - purchased;
	const gymPct = buildingSettings.Gym.percent / 100;

	const gymCanAfford = calculateMaxAfford_AT(game.buildings.Gym, true, false, false, max, gymPct);

	if (gymAmt > purchased && gymCanAfford > 0) {
		safeBuyBuilding('Gym', gymCanAfford);
	}
}

/**
 * Buys wormholes if necessary. For the helium universe. Handled separately as it spends helium (danger).
 */
function _buyWormholes(buildingSettings) {
	if (game.buildings.Wormhole.locked || !buildingSettings.Wormhole || !buildingSettings.Wormhole.enabled) return;

	const wormholeAmt = buildingSettings.Wormhole.buyMax === 0 ? Infinity : buildingSettings.Wormhole.buyMax;
	const wormholePct = buildingSettings.Wormhole.percent / 100;
	const purchased = game.buildings.Wormhole.purchased;
	const max = wormholeAmt - purchased;

	const wormholeCanAfford = calculateMaxAfford_AT(game.buildings.Wormhole, true, false, false, max, wormholePct);

	if (wormholeAmt > purchased && wormholeCanAfford > 0) {
		safeBuyBuilding('Wormhole', wormholeCanAfford);
	}
}

/**
 * Buys warpstations if necessary. For the helium universe.
 */
function _buyWarpstations() {
	if (game.buildings.Warpstation.locked || !getPageSetting('warpstation')) return;

	let warpstationAmt = Math.floor(game.upgrades.Gigastation.done * getPageSetting('deltaGigastation')) + getPageSetting('firstGigastation');
	const warpstationPct = getPageSetting('warpstationPct') / 100;
	if (game.upgrades.Gigastation.done === 0 && getPageSetting('autoGigas')) warpstationAmt = Infinity;
	const owned = game.buildings.Warpstation.owned;
	const max = warpstationAmt - owned;

	const firstGigaOK = game.upgrades.Gigastation.done > 0;
	const gigaCapped = owned >= warpstationAmt;
	const warpstationCanAfford = calculateMaxAfford_AT(game.buildings.Warpstation, true, false, false, max, warpstationPct);

	if (!(firstGigaOK && gigaCapped) && warpstationCanAfford > 0) {
		safeBuyBuilding('Warpstation', warpstationCanAfford);
	}
}

/**
 * Buys smithies if necessary. For the radon universe.
 */
function _buySmithy(buildingSettings) {
	if (game.buildings.Smithy.locked) return;

	const smithySetting = buildingSettings.Smithy;
	let smithyAmt = smithySetting.buyMax === 0 ? Infinity : smithySetting.buyMax;
	let smithyPct = smithySetting.percent / 100;

	// Overrides for Smithy farming.
	// If you have your purchase pct less than 100% or your cap is lower than the amount you are targetting then temporarily adjust inputs.
	if (mapSettings.mapName === 'Smithy Farm') {
		if (smithyPct < 1 || smithyAmt > mapSettings.smithies) smithyAmt = mapSettings.smithies;
		smithyPct = 1;
	}

	const purchased = game.buildings.Smithy.purchased;
	const max = smithyAmt - purchased;
	let smithyCanAfford = calculateMaxAfford_AT(game.buildings.Smithy, true, false, false, max, smithyPct);

	if (challengeActive('Quest') && getPageSetting('quest')) {
		smithyCanAfford = _calcSmithyDuringQuest();
	}

	if (((smithySetting.enabled && smithyAmt > purchased) || challengeActive('Quest')) && smithyCanAfford > 0) {
		safeBuyBuilding('Smithy', smithyCanAfford);
	}
}

/**
 * Purchasing a smithy whilst on Quest.  
    Only buys Smithies when you are on a Smithy quest or start a new zone and can buy more Smithies than you need to finish the challenge with.
 */
function _calcSmithyDuringQuest() {
	let smithyCanAfford = 0;
	if ((atSettings.portal.aWholeNewWorld || getCurrentQuest() === 10) && canAffordBuilding('Smithy', null, null, false, false, 1)) {
		const smithycanBuy = calculateMaxAfford(game.buildings.Smithy, true, false, false, true, 1);
		const questEndZone = !game.global.runningChallengeSquared ? 85 : getPageSetting('questSmithyZone') === -1 ? Infinity : getPageSetting('questSmithyZone');
		let questZones = Math.floor((questEndZone - game.global.world) / 2 - 1);
		if (questZones < 0) questZones = 0;
		// Buying smithies that won't be needed for quests before user entered end goal or for Smithy quests
		smithyCanAfford = smithycanBuy > questZones ? smithycanBuy - questZones : getCurrentQuest() === 10 ? 1 : 0;
	}

	return smithyCanAfford;
}

/**
 * Buys laboratories if necessary during Nurture. For the radon universe.
 */
function _buyLaboratory(buildingSettings) {
	if (game.buildings.Laboratory.locked || !buildingSettings.Laboratory || !buildingSettings.Laboratory.enabled) return;

	const labAmt = buildingSettings.Laboratory.buyMax === 0 ? Infinity : buildingSettings.Laboratory.buyMax;
	const labPct = buildingSettings.Laboratory.percent / 100;
	const labCanAfford = calculateMaxAfford_AT(game.buildings.Laboratory, true, false, false, labAmt - game.buildings.Laboratory.purchased, labPct);

	if (labAmt > game.buildings.Laboratory.purchased && labCanAfford > 0) {
		safeBuyBuilding('Laboratory', labCanAfford);
	}
}

/**
 * Buys microchip if possible. No settings for the user to disable. For the radon universe.
 */
function _buyMicrochip() {
	if (!game.buildings.Microchip.locked && canAffordBuilding('Microchip', null, null, false, false, 1)) {
		safeBuyBuilding('Microchip', 1);
	}
}

/**
 * Buys antenna if possible. For the radon universe.
 */
function _buyAntenna(buildingSettings) {
	if (!game.buildings.Antenna.locked || !buildingSettings.Antenna || !buildingSettings.Antenna.enabled) return;

	const antennaAmt = buildingSettings.Antenna.buyMax === 0 ? Infinity : buildingSettings.Antenna.buyMax;
	const antennaPct = buildingSettings.Antenna.percent / 100;
	const antennaCanAfford = calculateMaxAfford_AT(game.buildings.Antenna, true, false, false, antennaAmt - game.buildings.Antenna.purchased, antennaPct);

	if (antennaAmt > game.buildings.Antenna.purchased && antennaCanAfford > 0) {
		safeBuyBuilding('Antenna', antennaCanAfford);
	}
}

/**
 * Keeps buying the most efficient housing until no housing remains to buy.
 */
function _keepBuyingHousing(buildingSettings) {
	// If inside a do while loop in TW it will lag out the game at the start of a portal so best having it outside of that kind of loop
	if (usingRealTimeOffline || atSettings.loops.atTimeLapseFastLoop || liquifiedZone()) {
		_buyHousing(buildingSettings);
	} else {
		let boughtHousing = false;
		do {
			boughtHousing = _buyHousing(buildingSettings);
		} while (boughtHousing);
	}
}

function _buyTribute() {
	if (game.buildings.Tribute.locked || isBuildingInQueue('Tribute') || (!game.jobs.Meteorologist.locked && !mapSettings.shouldTribute && _getAffordableMets() > 0)) return;

	const tributeSetting = getPageSetting('buildingSettingsArray').Tribute;
	if ((!tributeSetting.enabled || mapSettings.shouldMeteorologist || mapSettings.mapName === 'Worshipper Farm') && !mapSettings.shouldTribute) return;

	const farmingGems = (mapSettings.mapName === 'Smithy Farm' && mapSettings.gemFarm) || getCurrentQuest() === 4;
	const tributePct = farmingGems || (mapSettings.mapName === 'Tribute Farm' && mapSettings.tribute > 0) ? 1 : tributeSetting.percent > 0 ? tributeSetting.percent / 100 : 1;
	const tributeAmt = farmingGems || tributeSetting.buyMax === 0 ? Infinity : mapSettings.mapName === 'Tribute Farm' && mapSettings.tribute > tributeSetting.buyMax ? mapSettings.tribute : tributeSetting.buyMax;

	const tribute = game.buildings.Tribute;
	const tributeCanAfford = calculateMaxAfford_AT(tribute, true, false, false, tributeAmt - tribute.purchased, tributePct);

	if (tributeAmt > tribute.purchased && tributeCanAfford > 0) {
		safeBuyBuilding('Tribute', tributeCanAfford);
	}
}

function _getAffordableMets() {
	if (game.global.universe === 2) {
		const jobSettings = getPageSetting('jobSettingsArray');
		if (jobSettings.Meteorologist.enabled || mapSettings.shouldTribute) {
			const meteorStats = game.jobs.Meteorologist;
			const foodBase = meteorStats.cost.food[0];
			const foodScale = meteorStats.cost.food[1];
			const baseCost = foodBase * Math.pow(foodScale, meteorStats.owned);
			const maxSpend = game.resources.food.owned * (jobSettings.Meteorologist.percent / 100);
			return getMaxAffordable(baseCost, maxSpend, foodScale, true);
		}
	}

	return 0;
}

function _buyHousing(buildSettings) {
	if (MODULES.buildings.betaHouseEfficiency && game.buildings.Hub.locked) {
		let boughtHousing = false;
		const foodEffHouse = mostEfficientHousing_beta('food');
		const gemsEffHouse = mostEfficientHousing_beta('gems');

		// Waits for the most food efficient house to be bought for its gem efficiency, except Huts and Houses
		if (['Hut', 'House'].includes(foodEffHouse)) boughtHousing = _buySelectedHouse(foodEffHouse, buildSettings);

		// Gem Efficiency
		boughtHousing |= _buySelectedHouse(gemsEffHouse, buildSettings);

		return boughtHousing;
	}

	// Old System
	return _buySelectedHouse(mostEfficientHousing(_getResourcePerSecond()), buildSettings);
}

function _shouldSaveFromHouse(houseName, upgradeName) {
	const houseResources = Object.entries(game.buildings[houseName].cost).map((entry) => entry[0]);
	return houseResources.some((resourceName) => game.upgrades[upgradeName].cost.resources[resourceName] !== undefined);
}

function _buySelectedHouse(houseName, buildingSettings) {
	if (!houseName || isBuildingInQueue(houseName) || !canAffordBuilding(houseName)) return false;

	// Saves resources for upgrades
	if (!challengeActive('Scientist') && (game.global.autoUpgrades || getPageSetting('upgradeType'))) {
		const skipHouse = ['Hut', 'House', 'Mansion', 'Hotel', 'Resort'].includes(houseName);
		const upgrades = ['Bounty', 'Efficiency', 'Speedfarming', 'Speedlumber', 'Megafarming', 'Megalumber', 'Coordination', 'Blockmaster', 'TrainTacular', 'Potency'];

		// Do not save Gems or Fragments TODO Don't save ie metal from Huts
		if (skipHouse && upgrades.some((up) => _shouldSaveFromHouse(houseName, up) && shouldSaveForSpeedUpgrade(game.upgrades[up], 0.5, 0.5, 0.25, 0.75))) return;
	}

	// Identify the amount of this type of housing we can afford and stay within our housing cap.
	const housingAmt = buildingSettings[houseName].buyMax === 0 ? Infinity : buildingSettings[houseName].buyMax;
	const max = housingAmt - game.buildings[houseName].purchased;
	const ratio = houseName === 'Gateway' ? 1 : buildingSettings[houseName].percent / 100;
	let maxCanAfford = calculateMaxAfford_AT(game.buildings[houseName], true, false, false, max, ratio);

	// Hard cap collectors to 6000 to avoid hitting infinity.
	const purchased = game.buildings[houseName].purchased;
	if (houseName === 'Collector' && maxCanAfford + purchased >= 6000) maxCanAfford = 6000 - purchased;

	if (maxCanAfford) {
		safeBuyBuilding(houseName, maxCanAfford);
		return true;
	}
}

function displayMostEfficientBuilding(forceUpdate = false) {
	if (!atSettings.intervals.oneSecond && !forceUpdate) return;
	if (!getPageSetting('buildingMostEfficientDisplay')) return;

	const foodHousing = ['Hut', 'House'];
	const gemHousing = ['Mansion', 'Hotel', 'Resort', 'Gateway', 'Collectors', 'Warpstations'];

	const bestFoodHousing = mostEfficientHousing_beta('food');
	const bestGemHousing = mostEfficientHousing_beta('gems');

	gemHousing
		.map((name) => ({ mostEff: name === bestGemHousing, elem: document.getElementById(name) }))
		.filter((house) => house.elem)
		.forEach((house) => _updateMostEfficientDisplay(house.elem, house.mostEff));

	foodHousing
		.map((name) => ({ mostEff: name === bestFoodHousing, elem: document.getElementById(name) }))
		.filter((house) => house.elem)
		.forEach((house) => _updateMostEfficientDisplay(house.elem, house.mostEff));
}
