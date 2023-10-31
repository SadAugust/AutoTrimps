MODULES.buildings = {
	storageMainCutoff: 0.85,
	storageLowlvlCutoff1: 0.7,
	storageLowlvlCutoff2: 0.5,
	smithiesBoughtThisZone: 0
};

function safeBuyBuilding(building, amt) {
	if (!building || !amt)
		return;
	if (isBuildingInQueue(building))
		return;
	if (game.buildings[building].locked)
		return;
	if (!canAffordBuilding(building, false, false, false, false, amt))
		return;

	//Cap the amount we purchase to ensure we don't spend forever building
	if (!bwRewardUnlocked("Foremany") && game.global.world <= 10) amt = 1;

	buyBuilding(building, true, true, amt);
	if (building !== 'Trap') debug('Building ' + amt + ' ' + building + (amt > 1 ? 's' : ''), "buildings", '*hammer2');
	return;
}

function buyStorage(hypoZone) {
	var customVars = MODULES["buildings"];
	var buildings = {
		'Barn': 'food',
		'Shed': 'wood',
		'Forge': 'metal'
	};
	for (var resource in buildings) {
		//Initialising variables
		var curRes = game.resources[buildings[resource]].owned;
		var maxRes = game.resources[buildings[resource]].max;
		//Identifying our max for the resource that's being checked
		maxRes = game.global.universe === 1 ? maxRes *= 1 + game.portal.Packrat.level * game.portal.Packrat.modifier :
			maxRes *= 1 + game.portal.Packrat.radLevel * game.portal.Packrat.modifier;
		maxRes = calcHeirloomBonus("Shield", "storageSize", maxRes);

		//Identifying the amount of resources you'd get from a Jestimp when inside a map otherwise setting the value to 1.1x current resource to ensure no storage issues
		var exoticValue = 0;
		if (game.global.mapsActive) {
			exoticValue = (getCurrentMapObject().name === 'Atlantrimp' || getCurrentMapObject().name === 'Trimple Of Doom') ? curRes :
				game.unlocks.imps.Jestimp ? scaleToCurrentMap(simpleSeconds(buildings[resource], 45)) :
					game.unlocks.imps.Chronoimp ? scaleToCurrentMap(simpleSeconds(buildings[resource], 5)) :
						exoticValue
		}
		//Skips buying sheds if you're not on one of your specified bonfire zones
		if (challengeActive('Hypothermia') && hypoZone > game.global.world && resource === 'Shed') continue;
		if ((game.global.world === 1 && curRes > maxRes * customVars.storageLowlvlCutoff1) ||
			(game.global.world >= 2 && game.global.world < 10 && curRes > maxRes * customVars.storageLowlvlCutoff2) ||
			(curRes + exoticValue > maxRes * customVars.storageMainCutoff)) {
			if (canAffordBuilding(resource, null, null, null, null, null) && game.triggers[resource].done) {
				safeBuyBuilding(resource, 1);
			}
		}
	}
}

//Overall more performance efficient to remove the textStrings from getPsString so copied it from the game and removed the textStrings.
//Check and update each patch!
function getPsString_AT(what) {
	if (what === "helium") return;
	var resOrder = ["food", "wood", "metal", "science", "gems", "fragments"];
	var books = ["farming", "lumber", "miner", "science"];
	var jobs = ["Farmer", "Lumberjack", "Miner", "Scientist", "Dragimp", "Explorer"];
	var index = resOrder.indexOf(what);
	var job = game.jobs[jobs[index]];
	var book = game.upgrades["Speed" + books[index]];
	var mBook = game.upgrades["Mega" + books[index]];
	var base = (what === "fragments") ? 0.4 : 0.5;
	//Add base
	//Add job count
	var currentCalc = job.owned * base;
	//Add books
	if (what !== 'gems' && game.permaBoneBonuses.multitasking.owned > 0) {
		var str = (game.resources.trimps.owned >= game.resources.trimps.realMax()) ? game.permaBoneBonuses.multitasking.mult() : 0;
		currentCalc *= (1 + str);
	}
	//Add books
	if (typeof book !== 'undefined' && book.done > 0) {
		var bookStrength = Math.pow(1.25, book.done);
		currentCalc *= bookStrength;
	}
	//Add Megabooks
	if (typeof mBook !== 'undefined' && mBook.done > 0) {
		var mod = (game.global.frugalDone) ? 1.6 : 1.5;
		var mBookStrength = Math.pow(mod, mBook.done);
		currentCalc *= mBookStrength;
	}
	//Add bounty
	if (what !== 'gems' && game.upgrades.Bounty.done > 0) {
		currentCalc *= 2;
	}
	//Add Tribute
	if (what === 'gems' && game.buildings.Tribute.owned > 0) {
		var tributeStrength = Math.pow(game.buildings.Tribute.increase.by, game.buildings.Tribute.owned);
		currentCalc *= tributeStrength;
	}
	//Add Whipimp
	if (game.unlocks.impCount.Whipimp > 0) {
		var whipStrength = Math.pow(1.003, game.unlocks.impCount.Whipimp);
		currentCalc *= (whipStrength);
	}
	//Add motivation
	if (getPerkLevel('Motivation') > 0) {
		var motivationStrength = (getPerkLevel('Motivation') * game.portal.Motivation.modifier);
		currentCalc *= (motivationStrength + 1);
	}
	if (getPerkLevel('Motivation_II') > 0) {
		var motivationStrength = (getPerkLevel('Motivation_II') * game.portal.Motivation_II.modifier);
		currentCalc *= (motivationStrength + 1);
	}
	//Observation
	if (!game.portal.Observation.radLocked && game.global.universe === 2 && game.portal.Observation.trinkets > 0) {
		var mult = game.portal.Observation.getMult();
		currentCalc *= mult;
	}
	//Add Fluffy Gatherer
	if (Fluffy.isRewardActive('gatherer')) {
		currentCalc *= 2;
	}
	//Add Meditation
	if (getPerkLevel('Meditation') > 0) {
		var meditation = game.portal.Meditation;
		var medStrength = meditation.getBonusPercent();
		if (medStrength > 0) {
			currentCalc *= (1 + (medStrength * .01));
		}
	}
	//Add Alchemy
	var potionFinding;
	if (challengeActive('Alchemy')) potionFinding = alchObj.getPotionEffect('Potion of Finding');
	if (potionFinding > 1 && what !== 'fragments' && what !== 'science') {
		currentCalc *= potionFinding;
	}
	potionFinding = alchObj.getPotionEffect('Elixir of Finding');
	if (potionFinding > 1 && what !== 'fragments' && what !== 'science') {
		currentCalc *= potionFinding;
	}
	//Add Magmamancer
	if (game.jobs.Magmamancer.owned > 0 && what == "metal") {
		var manceStrength = game.jobs.Magmamancer.getBonusPercent();
		if (manceStrength > 1) {
			currentCalc *= manceStrength;
		}
	}
	//Add Speedbooks
	if (game.upgrades.Speedexplorer.done > 0 && what === 'fragments') {
		var bonus = Math.pow(4, game.upgrades.Speedexplorer.done);
		currentCalc *= bonus;
	}
	//Add Size
	if (challengeActive('Size') && (what === 'food' || what === 'metal' || what === 'wood')) {
		currentCalc *= 1.5;
	}
	//Add frigid
	if (challengeActive('Frigid')) {
		var mult = game.challenges.Frigid.getShatteredMult();
		currentCalc *= mult;
	}
	//Add downsize
	if (challengeActive('Downsize')) {
		currentCalc *= 5;
	}
	//Add Meditate
	if (challengeActive('Meditate')) {
		currentCalc *= 1.25;
	}

	if (challengeActive('Toxicity')) {
		var toxMult = (game.challenges.Toxicity.lootMult * game.challenges.Toxicity.stacks) / 100;
		currentCalc *= (1 + toxMult);
	}
	if (challengeActive('Balance') || challengeActive('Unbalance')) {
		var chal = (challengeActive("Balance")) ? game.challenges.Balance : game.challenges.Unbalance;
		currentCalc *= chal.getGatherMult();
	}
	if (challengeActive('Decay') || challengeActive('Melt')) {
		currentCalc *= 10;
		var currChall = challengeActive('Decay') ? 'Decay' : 'Melt';
		var stackStr = Math.pow(game.challenges[currChall].decayValue, game.challenges[currChall].stacks);
		currentCalc *= stackStr;
	}
	if (challengeActive('Watch')) {
		currentCalc /= 2;
	}
	if (challengeActive('Lead') && ((game.global.world % 2) == 1)) {
		currentCalc *= 2;
	}

	if (challengeActive('Archaeology') && what !== 'fragments') {
		var mult = game.challenges.Archaeology.getStatMult("science");
		currentCalc *= mult;
	}
	if (challengeActive('Insanity')) {
		var mult = game.challenges.Insanity.getLootMult();
		currentCalc *= mult;
	}
	if (game.challenges.Nurture.boostsActive() && what !== 'fragments') {
		var mult = game.challenges.Nurture.getResourceBoost();
		currentCalc *= mult;
	}
	if (game.global.pandCompletions && what !== 'fragments') {
		var mult = game.challenges.Pandemonium.getTrimpMult();
		currentCalc *= mult;
	}
	if (game.global.desoCompletions && what !== 'fragments') {
		var mult = game.challenges.Desolation.getTrimpMult();
		currentCalc *= mult;
	}
	if (challengeActive('Daily')) {
		var mult = 0;
		if (typeof game.global.dailyChallenge.dedication !== 'undefined') {
			mult = dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
			currentCalc *= mult;
		}
		if (typeof game.global.dailyChallenge.famine !== 'undefined' && what !== 'fragments' && what !== 'science') {
			mult = dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
			currentCalc *= mult;
		}
	}
	if (challengeActive('Hypothermia') && what === 'wood') {
		var mult = game.challenges.Hypothermia.getWoodMult(true);
		currentCalc *= mult;
	}
	if (challengeActive('Desolation') && what !== 'fragments') {
		mult = game.challenges.Desolation.trimpResourceMult();
		currentCalc *= mult;
	}
	if (((what === "food" || (what === "wood")) && game.buildings.Antenna.owned >= 5) || (what === "metal" && game.buildings.Antenna.owned >= 15)) {
		var mult = game.jobs.Meteorologist.getExtraMult();
		currentCalc *= mult;
	}
	if ((what === "food" || what === "metal" || what === "wood") && getParityBonus() > 1) {
		var mult = getParityBonus();
		currentCalc *= mult;
	}
	if ((what === "food" || what === "metal" || what === "wood") && autoBattle.oneTimers.Gathermate.owned && game.global.universe === 2) {
		var mult = autoBattle.oneTimers.Gathermate.getMult();
		currentCalc *= mult;
	}
	if (what !== 'fragments' && getEmpowerment() === 'Wind') {
		var windMod = game.empowerments.Wind.getCombatModifier();
		currentCalc *= (1 + windMod);
	}
	var heirloomBonus = calcHeirloomBonus("Staff", jobs[index] + "Speed", 0, true);
	if (heirloomBonus > 0) {
		currentCalc *= ((heirloomBonus / 100) + 1);
	}
	//Add player
	if (game.global.playerGathering === what) {
		if ((game.talents.turkimp2.purchased || game.global.turkimpTimer > 0) && (what === "food" || what === "wood" || what === "metal")) {
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
	return currentCalc;
}

function advancedNurseries() {
	if (!getPageSetting('advancedNurseries')) return false;
	if (game.stats.highestLevel.valueTotal() < 230) return false;
	if (game.global.universe !== 1) return false;
	//Builds nurseries if lacking health & shouldn't HD farm.
	//Only build nurseries if: A) Lacking Health & B) Doesn't need to HD farm & C) Has max health map stacks
	//Also, it requires less health during spire
	const a = whichHitsSurvived() < targetHitsSurvived();
	const b = !hdFarm(false, true).shouldRun;
	const c = game.global.mapBonus >= getPageSetting('mapBonusHealth');
	return (a && b && c);
}

function mostEfficientHousing() {

	//Housing
	const housingTypes = ['Hut', 'House', 'Mansion', 'Hotel', 'Resort', 'Gateway', 'Collector'];

	const buildingSettings = getPageSetting('buildingSettingsArray');
	const resourcefulMod = game.global.universe === 1 ? Math.pow(1 - game.portal.Resourceful.modifier, game.portal.Resourceful.level) : 1;
	// Which houses we actually want to check
	var housingTargets = [];
	var maxHousing;
	for (var house of housingTypes) {
		maxHousing = buildingSettings[house].buyMax === 0 ? Infinity : buildingSettings[house].buyMax;
		if (!game.buildings[house].locked && game.buildings[house].owned < maxHousing) {
			housingTargets.push(house);
		}
	}

	var mostEfficient = {
		name: "",
		time: Infinity
	}

	//Track resource types and their production per second.
	const resourceTypes = ['food', 'wood', 'metal', 'gems', 'fragments'];
	const resourcePerSecond = {};
	for (var resource in resourceTypes) {
		resourcePerSecond[resourceTypes[resource]] = getPsString_AT(resourceTypes[resource]);
	}

	var dontbuy = [];
	var avgProduction;

	const questActive = challengeActive('Quest') && currQuest() === 4;
	const hypoActive = challengeActive('Hypothermia');
	const woodChallengeActive = challengeActive('Metal') || challengeActive('Transmute');

	for (var housing of housingTargets) {
		var worstTime = -Infinity;
		var currentOwned = game.buildings[housing].owned;
		var buildingspending = buildingSettings[housing].percent / 100;
		//If setting is disabled then don't buy building.
		if (!buildingSettings[housing].enabled) dontbuy.push(housing);
		//Stops Collectors being purchased when on Quest gem quests.
		if (questActive && housing === 'Collector') dontbuy.push(housing);
		//Fix for Infinity collectors since it doesn't take resourceful into account.
		if (housing === 'Collector' && game.buildings[housing].purchased >= 6000) dontbuy.push(housing);
		//Stops buildings that cost wood from being pushed if we're running Hypothermia and have enough wood for a bonfire.
		if (hypoActive && (housing !== 'Collector' || housing !== 'Gateway') && game.resources.wood.owned > game.challenges.Hypothermia.bonfirePrice()) dontbuy.push(housing);
		//Stops Food buildings being pushed to queue if Tribute Farming with Buy Buildings toggle disabled.
		if (mapSettings.mapName === 'Tribute Farm' && !mapSettings.buyBuildings && housing !== 'Collector') dontbuy.push(housing);

		var housingBonus = game.buildings[housing].increase.by;
		if (!game.buildings.Hub.locked) {
			var hubAmt = 1;
			if (housing === 'Collector') hubAmt = autoBattle.oneTimers.Collectology.owned ? (2 + Math.floor((autoBattle.maxEnemyLevel - 1) / 30)) : 1;
			housingBonus += (hubAmt * 25000);
		}

		for (var resource in game.buildings[housing].cost) {
			if (dontbuy.includes(housing)) continue;
			// Get production time for that resource
			var baseCost = game.buildings[housing].cost[resource][0];
			var costScaling = game.buildings[housing].cost[resource][1];
			if (woodChallengeActive && resource === 'metal') avgProduction = resourcePerSecond['wood'];
			else avgProduction = resourcePerSecond[resource];
			if (avgProduction <= 0) avgProduction = 1;
			if (Math.max(baseCost * Math.pow(costScaling, currentOwned) * resourcefulMod) > (game.resources[resource].owned) * buildingspending) dontbuy.push(housing);
			if (game.global.universe === 2 && housing === 'Gateway' && resource === 'fragments' && buildingSettings.SafeGateway.enabled && (buildingSettings.SafeGateway.zone === 0 || buildingSettings.SafeGateway.zone > game.global.world)) {
				if (game.resources[resource].owned < ((mapCost(10, getAvailableSpecials('lmc', true)) * buildingSettings.SafeGateway.mapCount) + Math.max(baseCost * Math.pow(costScaling, currentOwned)))) dontbuy.push(housing);
			}
			// Only keep the slowest producer, aka the one that would take the longest to generate resources for
			worstTime = Math.max((baseCost * Math.pow(costScaling, currentOwned - 1) * resourcefulMod) / (avgProduction * housingBonus), worstTime);
		}

		if (mostEfficient.time > worstTime && !dontbuy.includes(housing)) {
			mostEfficient.name = housing;
			mostEfficient.time = worstTime;
		}
	}
	if (mostEfficient.name === '') mostEfficient.name = null;

	return mostEfficient.name;
}

function buyBuildings() {

	if (game.jobs.Farmer.locked || game.resources.trimps.owned === 0) return;
	if (game.global.world === 1 && game.upgrades.Miners.allowed && !game.upgrades.Miners.done) return;

	//Disabling autoBuildings if AT AutoStructure is disabled.
	if (!getPageSetting('buildingsType')) return;

	const buildingSettings = getPageSetting('buildingSettingsArray');

	//A quick way to identify if we are running Hypothermia and what our very first farm zone is for autostorage manipulation purposes.
	//Need to have it setup to go through every setting to ensure we don't miss the first one after introducing the priority input.
	var hypoZone = 0;
	if (challengeActive('Hypothermia')) {
		const hypoSettings = getPageSetting('hypothermiaSettings');
		if (hypoSettings[0].active && hypoSettings[0].autostorage && hypoSettings.length > 0) {
			for (var y = 1; y < hypoSettings.length; y++) {
				if (!hypoSettings[y].active) {
					continue;
				}
				if (hypoZone === 0 || hypoZone > hypoSettings[y].world)
					hypoZone = hypoSettings[y].world;
			}
		}
	}

	//Storage, shouldn't be needed anymore that autostorage is lossless.
	//Hypothermia messed this up. Has a check for if on Hypo and checks for the first Hypo farm zone.
	if (!game.global.autoStorage && game.global.world >= hypoZone)
		toggleAutoStorage(false);

	//Disables AutoStorage when our first Hypothermia farm zone is greater than current world zone
	if (game.global.world < hypoZone && game.global.autoStorage)
		toggleAutoStorage(false);

	//Buys storage buildings when about to cap resources
	if (!game.global.improvedAutoStorage)
		buyStorage(hypoZone);

	//Disable buying buildings inside of unique maps
	if (game.global.mapsActive && (getCurrentMapObject().name === 'Trimple Of Doom' || getCurrentMapObject().name === 'Atlantrimp' || getCurrentMapObject().name === 'Melting Point' || getCurrentMapObject().name === 'Frozen Castle')) {
		if (game.global.repeatMap) repeatClicked();
		return;
	}

	//Checks to see if we are running Quest and above our first Quest zone and the current zones Quest hasn't been completed.
	if (challengeActive('Quest') && getPageSetting('quest') && game.global.world >= game.challenges.Quest.getQuestStartZone()) {
		//Still allows you to buy tributes during gem quests
		if ([4].indexOf(currQuest()) >= 0)
			buyTributes();
		//Disables the rest of this function when you are on a resource (food,wood,metal,gems) quest.
		if ([1, 2, 3, 4].indexOf(currQuest()) >= 0)
			return;
	}

	if (game.global.universe === 1) {
		//Nurseries
		if (!game.buildings.Nursery.locked) {
			const nurseryZoneOk = buildingSettings.Nursery.enabled && game.global.world >= buildingSettings.Nursery.fromZ;
			const settingPrefix = trimpStats.isC3 ? 'c2' : trimpStats.isDaily ? 'd' : '';

			var nurseryPreSpire = isDoingSpire() && game.buildings.Nursery.owned < getPageSetting(settingPrefix + 'PreSpireNurseries') ? getPageSetting(settingPrefix + 'PreSpireNurseries') : 0;

			var nurseryAmt = nurseryPreSpire > 0 ? nurseryPreSpire : Math.max(nurseryPreSpire, buildingSettings.Nursery.buyMax);
			if (nurseryAmt === 0 && !getPageSetting('advancedNurseries')) nurseryAmt = Infinity;

			var nurseryPct = buildingSettings.Nursery.percent / 100;
			var nurseryCanAfford = calculateMaxAfford_AT(game.buildings.Nursery, true, false, false, null, nurseryPct);
			var nurseryToBuy = Math.min(nurseryCanAfford, nurseryAmt - game.buildings.Nursery.owned);
			if (nurseryCanAfford > 0 && (nurseryZoneOk || nurseryPreSpire > 0)) {
				if (nurseryPreSpire > 0 && nurseryToBuy > 0) safeBuyBuilding('Nursery', nurseryToBuy);
				else if (advancedNurseries()) {
					safeBuyBuilding('Nursery', Math.min(nurseryCanAfford, getPageSetting('advancedNurseriesAmount')));
				}
				else if (nurseryToBuy > 0) safeBuyBuilding('Nursery', nurseryToBuy);
			}
		}

		//Gyms
		if (!game.buildings.Gym.locked && buildingSettings.Gym && buildingSettings.Gym.enabled) {
			var gymAmt = buildingSettings.Gym.buyMax === 0 ? Infinity : buildingSettings.Gym.buyMax;
			var gymPct = buildingSettings.Gym.percent / 100;
			var gymCanAfford = calculateMaxAfford_AT(game.buildings.Gym, true, false, false, (gymAmt - game.buildings.Gym.purchased), gymPct);
			if (gymAmt > game.buildings.Gym.purchased && gymCanAfford > 0) {
				if (!needGymystic())
					safeBuyBuilding('Gym', gymCanAfford);
			}
		}

		//Wormhole (costs Helium)
		if (!game.buildings.Wormhole.locked && buildingSettings.Wormhole && buildingSettings.Wormhole.enabled) {
			var wormholeAmt = buildingSettings.Wormhole.buyMax === 0 ? Infinity : buildingSettings.Wormhole.buyMax;
			var wormholePct = buildingSettings.Wormhole.percent / 100;
			var wormholeCanAfford = calculateMaxAfford_AT(game.buildings.Wormhole, true, false, false, (wormholeAmt - game.buildings.Wormhole.purchased), wormholePct);
			if (wormholeAmt > game.buildings.Wormhole.purchased && wormholeCanAfford > 0) {
				safeBuyBuilding('Wormhole', wormholeCanAfford);
			}
		}

		//Warpstations
		if (!game.buildings.Warpstation.locked && getPageSetting('warpstation')) {
			var firstGigaOK = MODULES["upgrades"].autoGigas === false || game.upgrades.Gigastation.done > 0;
			var warpstationAmt = Math.floor(game.upgrades.Gigastation.done * getPageSetting('deltaGigastation')) + getPageSetting('firstGigastation');
			var warpstationPct = getPageSetting('warpstationPct') / 100;
			if (game.upgrades.Gigastation.done === 0 && getPageSetting('autoGigas')) warpstationAmt = Infinity;
			var gigaCapped = game.buildings.Warpstation.owned >= warpstationAmt;
			var warpstationCanAfford = calculateMaxAfford_AT(game.buildings.Warpstation, true, false, false, (warpstationAmt - game.buildings.Warpstation.owned), warpstationPct)

			if (!(firstGigaOK && gigaCapped) && warpstationCanAfford > 0)
				safeBuyBuilding('Warpstation', warpstationCanAfford);
		}
	}

	if (game.global.universe === 2) {
		//Smithy purchasing
		if (!game.buildings.Smithy.locked) {
			var smithyAmt = buildingSettings.Smithy.buyMax === 0 ? Infinity : buildingSettings.Smithy.buyMax;
			var smithyPct = buildingSettings.Smithy.percent / 100;
			var smithyCanAfford = calculateMaxAfford_AT(game.buildings.Smithy, true, false, false, (smithyAmt - game.buildings.Smithy.purchased), smithyPct);
			//Overrides for Smithy farming.
			//If we have our purchase pct less than 100% or our cap is lower than the amount we are targetting then temporarily adjust inputs.
			if (mapSettings.mapName === 'Smithy Farm') {
				if (smithyPct < 1 || smithyAmt > mapSettings.smithies) smithyAmt = mapSettings.smithies;
				smithyPct = 1;
			}
			//Purchasing a smithy whilst on Quest
			if (challengeActive('Quest') && getPageSetting('quest')) {
				//Resetting smithyCanAfford to avoid any accidental purchases during Quest.
				smithyCanAfford = 0;
				if ((MODULES["buildings"].smithiesBoughtThisZone < game.global.world || currQuest() === 10) && canAffordBuilding('Smithy', null, null, false, false, 1)) {
					var smithycanBuy = calculateMaxAfford(game.buildings.Smithy, true, false, false, true, 1);
					var questEndZone = !game.global.runningChallengeSquared ? 85 : getPageSetting('questSmithyZone') === -1 ? Infinity : getPageSetting('questSmithyZone')
					var questZones = Math.floor(((questEndZone - game.global.world) / 2) - 1);
					if (questZones < 0) questZones = 0;
					//Buying smithies that won't be needed for quests before user entered end goal or for Smithy quests
					smithyCanAfford = smithycanBuy > questZones ? smithycanBuy - questZones : currQuest() === 10 ? 1 : 0;
				}
			}
			//Don't buy Smithies when you can afford a bonfire on Hypo.
			//The Smithy Farm setting has an override to purchase them 1 at a time during Smithy Farm to ensure we can still farm and don't overpurchase.
			if (challengeActive('Hypothermia') && game.resources.wood.owned > game.challenges.Hypothermia.bonfirePrice()) smithyCanAfford = 0;

			if (((buildingSettings.Smithy.enabled && smithyAmt > game.buildings.Smithy.purchased) || challengeActive('Quest')) && smithyCanAfford > 0) {
				safeBuyBuilding("Smithy", smithyCanAfford);
				MODULES["buildings"].smithiesBoughtThisZone = game.global.world;
			}
		}

		//Laboratory Purchasing (Nurture)
		if (challengeActive('Nurture') && !game.buildings.Laboratory.locked && buildingSettings.Laboratory && buildingSettings.Laboratory.enabled) {
			var labAmt = buildingSettings.Laboratory.buyMax === 0 ? Infinity : buildingSettings.Laboratory.buyMax;
			var labPct = buildingSettings.Laboratory.percent / 100;
			var labCanAfford = calculateMaxAfford_AT(game.buildings.Laboratory, true, false, false, (labAmt - game.buildings.Laboratory.purchased), labPct);
			if (labAmt > game.buildings.Laboratory.purchased && labCanAfford > 0) {
				safeBuyBuilding('Laboratory', labCanAfford);
			}
		}

		//Microchip
		//Will always purchase these if available. No settings for the user to disable.
		if (!game.buildings.Microchip.locked && canAffordBuilding('Microchip', null, null, false, false, 1)) {
			safeBuyBuilding('Microchip', 1);
		}

		//Antenna
		//Need to setup to pause portaling when one is building.
		if (!game.buildings.Antenna.locked && buildingSettings.Antenna && buildingSettings.Antenna.enabled) {
			var antennaAmt = buildingSettings.Antenna.buyMax === 0 ? Infinity : buildingSettings.Antenna.buyMax;
			var antennaPct = buildingSettings.Antenna.percent / 100;
			var antennaCanAfford = calculateMaxAfford_AT(game.buildings.Antenna, true, false, false, (antennaAmt - game.buildings.Antenna.purchased), antennaPct);
			if (antennaAmt > game.buildings.Antenna.purchased && antennaCanAfford > 0) {
				safeBuyBuilding('Antenna', antennaCanAfford);
			}
		}
	}

	//Purchasing Tributes
	buyTributes();

	//Purchasing housing buildings
	//If inside a do while loop in TW it will lag out the game at the start of a portal so best having it outside of that kind of loop
	if (usingRealTimeOffline || atSettings.loops.atTimeLapseFastLoop) {
		buyHousing(buildingSettings);
	} else {
		var boughtHousing = false;
		do {
			boughtHousing = buyHousing(buildingSettings);
		} while (boughtHousing);
	}
}

function buyTributes() {
	if (game.buildings.Tribute.locked) return;
	const buildingSettings = getPageSetting('buildingSettingsArray');
	var affordableMets = 0;
	if (game.global.universe === 2) {
		const jobSettings = getPageSetting('jobSettingsArray');
		if (jobSettings.Meteorologist.enabled || mapSettings.shouldTribute) {
			affordableMets = getMaxAffordable(
				game.jobs.Meteorologist.cost.food[0] * Math.pow(game.jobs.Meteorologist.cost.food[1], game.jobs.Meteorologist.owned),
				game.resources.food.owned * (jobSettings.Meteorologist.percent / 100),
				game.jobs.Meteorologist.cost.food[1],
				true
			);
		}
	}
	//Won't buy Tributes if they're locked or if a meteorologist can be purchased as that should always be the more efficient purchase
	if (!game.jobs.Meteorologist.locked && !mapSettings.shouldTribute && affordableMets > 0) return;
	//Won't buy Tributes if the users building setting is disabled OR we are met farming OR worshipper farming.
	if ((!buildingSettings.Tribute.enabled || mapSettings.shouldMeteorologist || mapSettings.mapName === 'Worshipper Farm') && !mapSettings.shouldTribute) return;
	//Spend 100% of food on Tributes if Tribute Farming otherwise uses the value in the users building settings.
	var tributePct = mapSettings.mapName === 'Tribute Farm' && mapSettings.tribute > 0 ? 1 : buildingSettings.Tribute.percent > 0 ? buildingSettings.Tribute.percent / 100 : 1;

	var tributeAmt = buildingSettings.Tribute.buyMax === 0 ? Infinity : mapSettings.mapName === 'Tribute Farm' && mapSettings.tribute > buildingSettings.Tribute.buyMax ? mapSettings.tribute : buildingSettings.Tribute.buyMax;
	if ((mapSettings.mapName === 'Smithy Farm' && mapSettings.gemFarm) || currQuest() === 4) {
		tributeAmt = Infinity;
		tributePct = 1;
	}
	var tributeCanAfford = calculateMaxAfford_AT(game.buildings.Tribute, true, false, false, (tributeAmt - game.buildings.Tribute.purchased), tributePct);
	if (tributeAmt > game.buildings.Tribute.purchased && tributeCanAfford > 0) {
		safeBuyBuilding('Tribute', tributeCanAfford);
	}
}

function buyHousing(buildingSettings) {
	var housing = mostEfficientHousing();
	//If nothing is optimal the function will return null so we break out of the loop.
	if (housing === null) return;
	//Skips if the building is already in the purchase queue.
	if (isBuildingInQueue(housing)) return;
	//Skips if we can't afford the building.
	if (!canAffordBuilding(housing)) return;

	//Disable building purchases whilst Smithy Farming so that we aren't going back and forth between Smithy gem/wood/metal maps constantly while trying to farm resources for them.
	if (mapSettings.mapName === 'Smithy Farm' && housing !== 'Gateway')
		return;
	//If Tribute Farming and the buyBuildings setting for that line is disabled then don't buy buildings.
	//Will still purchase Gateways/Collectors as they don't cost food.
	if (mapSettings.mapName === 'Tribute Farm' && !mapSettings.buyBuildings && (housing !== 'Gateway' || housing !== 'Collector'))
		return;

	var housingAmt = buildingSettings[housing].buyMax === 0 ? Infinity : buildingSettings[housing].buyMax;
	var buildingspending = buildingSettings[housing].percent / 100;
	//Identify the amount of this type of housing we can afford and stay within our housing cap.
	var maxCanAfford = calculateMaxAfford_AT(game.buildings[housing], true, false, false, (housingAmt - game.buildings[housing].purchased), buildingspending);
	if (housing === 'Collector' && maxCanAfford + game.buildings[housing].purchased >= 6000) maxCanAfford = 6000 - game.buildings[housing].purchased;
	//Finally purchases the correct amount of housing.
	//calculateMaxAfford_AT will return 0 if we can't afford any housing as we have set a custom ratio so check if higher than that.
	if (maxCanAfford > 0) {
		safeBuyBuilding(housing, maxCanAfford);
		return true;
	}
}