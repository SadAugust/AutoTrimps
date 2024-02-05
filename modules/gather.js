MODULES.gather = {
	trapBuffering: false,
	maxTrapBuffering: false,
	coordBuffering: undefined
};

//Traps per second
function _calcTPS() {
	const fluffyTrapMult = game.global.universe === 2 && Fluffy.isRewardActive('trapper') ? 10 : 1;
	return Math.min(10, game.global.playerModifier / 5) * fluffyTrapMult;
}

function _calcTrapSupplySize() {
	const trapSize = 1 + game.portal.Bait.modifier * game.portal.Bait.level;
	const territoryBonus = 5 + game.portal.Trumps.modifier * getPerkLevel("Trumps");
	const tauntimp = game.unlocks.imps.Tauntimp ? Math.ceil(game.resources.trimps.realMax() * 0.003) : 0;
	let largestHouseSize = ['Hut', 'House', 'Mansion', 'Hotel', 'Resort', 'Gateway', 'Collector', 'Warpstation']
		.filter(houseName=> !game.buildings[houseName].locked)
		.map(houseName => _getHousingBonus(houseName))
		.reduce((max, bonus) => Math.max(max, bonus), 0);
	return Math.ceil(Math.max(territoryBonus, largestHouseSize, tauntimp) / trapSize);
}

function safeSetGather(resource) {
	if (resource === 'metal' && challengeActive('Transmute')) resource = 'wood';

	if (game.global.playerGathering === resource) return;

	debug(`Setting gather to ${resource}`, 'gather');
	setGather(resource);

	MODULES.gather.coordBuffering = undefined;
}

function _setTrapBait(lowOnTraps, ignoreBuffer = false, buildOnly = false) {
	if (!lowOnTraps && (!MODULES.gather.trapBuffering || ignoreBuffer) && !buildOnly) {
		safeSetGather('trimps');
		return true;
	}

	if (isBuildingInQueue('Trap') || safeBuyBuilding('Trap', 1)) {
		MODULES.gather.trapBuffering = true;
		safeSetGather('buildings');
		return true;
	}

	return false;
}

function _isTrappingOK(Battle, Coordination) {
	const trapChallenge = noBreedChallenge();
	const notFullPop = game.resources.trimps.owned < game.resources.trimps.realMax();
	const trapperTrapUntilFull = trapChallenge && notFullPop;
	const baseCheck = (!Battle.done || getPageSetting('TrapTrimps')) && (trapperTrapUntilFull || game.jobs.Geneticist.owned === 0);
	if (!baseCheck) return false;

	// Identify if we should disable trapping when running Trappa/Trapper.
	const trapChallengeCheck = trapChallenge && getPageSetting('trapper') && getPageSetting('trapperTrap');
	if (!trapChallengeCheck) return true;

	// TODO: Need a way to figure out how many coords it will purchase if using trappaCoordToggle === 2 since the goal with that feature is to cap army at X soliders so probably need to increment coordination until we reach that point
	const trappaCoordToggle = 1; //getPageSetting('trapperCoordsToggle');
	const baseArmySize = game.resources.trimps.maxSoldiers;
	const trapperCoords = getPageSetting('trapperCoords');
	const coordinated = getPerkLevel('Coordinated');

	let targetArmySize = baseArmySize;
	const remainingTrimps = game.resources.trimps.owned - game.resources.trimps.employed;
	const coordinatedMult = coordinated > 0 ? 0.25 * Math.pow(game.portal.Coordinated.modifier, coordinated) + 1 : 1;
	if (trappaCoordToggle === 1) {
		let coordTarget = trapperCoords > 0 ? trapperCoords - 1 : 999;
		if (!game.global.runningChallengeSquared && coordTarget === 999) coordTarget = trimpStats.currChallenge === 'Trapper' ? 32 : 49;
		if (Coordination.done >= coordTarget) {
			for (let z = Coordination.done; z < coordTarget; ++z) {
				targetArmySize = Math.ceil(1.25 * targetArmySize);
				targetArmySize = Math.ceil(targetArmySize * coordinatedMult);
			}
		}

		// Disable trapping if we are fighting with our max coord army (or better)
		const trappaCheck = challengeActive('Trappapalooza') && game.global.fighting && game.resources.trimps.maxSoldiers + remainingTrimps >= targetArmySize;

		// Disable trapping if we have enough trimps to fill our max coord army
		const maxCheck = remainingTrimps > targetArmySize;

		if (trappaCheck || maxCheck) return false;
	}

	return true;
}

function _isTrappingRelevant(trapperTrapUntilFull) {
	// Relevant means we gain at least 10% more trimps per sec while trapping (which basically stops trapping during later zones)
	const trappingIsRelevant = breedingPS()
		.div(10)
		.lt(_calcTPS() * getPerkLevel('Bait') + 1);
	return trapperTrapUntilFull || trappingIsRelevant;
}

function isPlayerRelevant(resourceName, hasTurkimp, customRatio = 0.1) {
	const turkimp = hasTurkimp && resourceName.toLowerCase() !== 'science';
	return turkimp || getPlayerModifier() >= getPsString_AT(resourceName, true) * customRatio;
}

function _gatherUpgrade(upgradeName, researchAvailable, hasTurkimp) {
	//Init
	const upgradeObj = game.upgrades[upgradeName];

	//Checks if we meet the conditions for each upgrade
	const upgradeAllowed = (({
		'Efficiency':   upgradeObj.done < Math.floor(game.global.world / 2),
		'Speedfarming': upgradeObj.done < Math.min(game.global.world, 59),
		'Speedlumber':  upgradeObj.done < Math.min(game.global.world, 59),
		'Speedminer':   upgradeObj.done < Math.min(game.global.world, 59) && !challengeActive('Metal'),
		'Speedscience': upgradeObj.done < Math.floor(game.global.world / 2) && !challengeActive('Scientist'),
		'Megafarming':  upgradeObj.done < game.global.world - 59,
		'Megalumber':   upgradeObj.done < game.global.world - 59,
		'Megaminer':    upgradeObj.done < game.global.world - 59 && !challengeActive('Metal'),
		'Megascience':  upgradeObj.done < Math.floor((game.global.world - 59) / 2) && !challengeActive('Scientist'),
		'Gymystic':     upgradeObj.done < Math.floor((Math.min(game.global.world, 55) - 20) / 5) + Math.max(0, Math.floor((Math.min(game.global.world, 150) - 70) / 5)),
		'Coordination': upgradeObj.done < game.global.world && canAffordCoordinationTrimps(),
		'Trainers':     upgradeObj.done < game.global.world >= 3 ? 1 : 0,
		'Blockmaster':  upgradeObj.done < game.global.world >= 4 ? 1 : 0,
		'TrainTacular':  upgradeObj.done < Math.floor(game.global.world / 5)
	})[upgradeName]);

	//Returns if we don't
	if (!upgradeAllowed)
		return false;

	//Checks if the given resource is allowed to be gathered
	const isResourceAllowed = (resourceName) => ({
		'science': researchAvailable,
		'food': true,
		'wood': game.triggers.wood.done,
		'metal': elementVisible('metal')
	})[resourceName];

	//Calculates the required amount of any resource used by the upgrade
	const neededResourceAmount = (resourceName) =>
		upgradeObj.cost.resources[resourceName] ? resolvePow(upgradeObj.cost.resources[resourceName], upgradeObj) : 0

	//Calculates the priority
	const getPriority = (resourceName) => {
		//Exception: Science only relies on Turkimp
		if (resourceName.toLowerCase() === 'science' && game.resources[resourceName].owned < neededResourceAmount(resourceName) && !hasTurkimp)
			return 2;

		//The priority equals the % of the resource we still need to gather (-1 would mean "last", not "don't gather")
		let priority = 1 - Math.min(1, game.resources[resourceName].owned / neededResourceAmount(resourceName));

		//Uses a buffer to avoid flickering between resources
		return priority + (MODULES.gather.coordBuffering === resourceName && priority > 0 ? 0.1 : 0);
	}

	//Defines the priority of each resource
	let priorityList = ['science', 'food', 'wood', 'metal']
		.filter(resourceName => isResourceAllowed(resourceName) && isPlayerRelevant(resourceName, hasTurkimp, 0.25))
		.map(resourceName => ({name: resourceName, priority: getPriority(resourceName)}))
		.filter(resource => resource.priority)
		.sort((r1, r2) => r2.priority - r1.priority);

	//No resource to gather?
	if (!priorityList.length)
		return false;

	//Gathers the highest priority resource
	safeSetGather(priorityList[0].name);
	MODULES.gather.coordBuffering = priorityList[0].name;

	return true;
}

function _willTrapsBeWasted() {
	// There is enough breed time remaining to open an entire trap (prevents wasting time and traps during early zones)
	const gteTime = breedTimeRemaining().gte(1 / _calcTPS());
	const lteTime = game.global.playerGathering === 'trimps' && breedTimeRemaining().lte(MODULES.breedtimer.DecimalBreed(0.1));
	return !(gteTime || lteTime);
}

function _lastResort(researchAvailable, trapTrimpsOK, lowOnTraps, needScience) {
	const manualResourceList = {
		food: 'Farmer',
		wood: 'Lumberjack',
		metal: 'Miner'
	};

	let lowestResource = 'food';
	let lowestResourceRate = -1;
	for (const resource in manualResourceList) {
		const job = manualResourceList[resource];
		let currentRate = game.jobs[job].owned * game.jobs[job].modifier;
		if (elementVisible(resource)) {
			if (currentRate === 0) currentRate = game.resources[resource].owned;

			if (currentRate < lowestResourceRate || lowestResourceRate === -1) {
				lowestResource = resource;
				lowestResourceRate = currentRate;
			}
		}
	}

	if (researchAvailable && game.global.turkimpTimer < 1 && (needScience || game.resources.science.owned < getPsString_AT('science') * 60)) {
		safeSetGather('science');
	} else if (trapTrimpsOK && game.global.trapBuildToggled && lowOnTraps) {
		safeSetGather('buildings');
	} else {
		safeSetGather(lowestResource);
	}
}

function _gatherTrapResources() {
	//Need Food
	if (game.resources.food.owned < 10 && isPlayerRelevant('food', false, 0.01)) {
		safeSetGather('food');
		return true;
	}

	//Need Wood
	if (game.triggers.wood.done && game.resources.wood.owned < 10 && isPlayerRelevant('wood', false, 0.01)) {
		safeSetGather('wood');
		return true;
	}

	return false;
}

function autoGather() {
	const manualGather = getPageSetting('gatherType');
	if (manualGather === 0) return;

	const { Battle, Bloodlust, Miners, Scientists, Coordination } = game.upgrades;

	const scientistsAvailable = Scientists.allowed && !Scientists.done;
	const minersAvailable = Miners.allowed && !Miners.done;
	const metalButtonAvailable = elementVisible('metal');

	// Setting it to use mining/building only!
	if (!scientistsAvailable && !minersAvailable && manualGather === 2 && elementVisible('metal')) {
		_autoGatherMetal();
		return;
	}

	const trapChallenge = noBreedChallenge();
	const needBattle = !Battle.done && game.resources.science.owned < 10;
	const notFullPop = game.resources.trimps.owned < game.resources.trimps.realMax();
	const baseArmySize = game.resources.trimps.maxSoldiers;
	const trapperTrapUntilFull = trapChallenge && notFullPop;
	const trapsBufferSize = Math.ceil(5 * _calcTPS());
	const trapsSupplySize = _calcTrapSupplySize();
	const minTraps = Math.floor(_calcTPS());
	const maxTraps = Math.max(100, getZoneSeconds() / 4);
	const trapTrimpsOK = _isTrappingOK(Battle, Coordination);

	const lowOnTraps = game.buildings.Trap.owned <= minTraps;
	const trapsReady = game.buildings.Trap.owned >= minTraps + trapsBufferSize;
	const lowTrapSupply = game.buildings.Trap.owned < minTraps + trapsSupplySize;
	const fullOfTraps = game.buildings.Trap.owned >= maxTraps;
	const maxTrapsReady = game.buildings.Trap.owned >= maxTraps + trapsBufferSize;

	if (lowOnTraps) MODULES.gather.trapBuffering = true;
	if (trapsReady) MODULES.gather.trapBuffering = false;
	if (maxTrapsReady) MODULES.gather.maxTrapBuffering = false;

	const shouldBuildTraps = (untilFull = false) =>
		(untilFull ? (!fullOfTraps || MODULES.gather.maxTrapBuffering) : (lowOnTraps || MODULES.gather.trapBuffering));

	const resourcesNeeded = getUpgradeCosts();
	const scienceAvailable = elementVisible('science');
	const _scienceBtnAvailable = elementExists('scienceCollectBtn');
	const researchAvailable = scienceAvailable && _scienceBtnAvailable && manualGather !== 3;

	const needScience = game.resources.science.owned < resourcesNeeded.science;
	const needScientists = scienceAvailable && !Scientists.done;
	const needScientistsScience = needScientists && game.resources.science.owned < 100;
	const needMiner = !Miners.done && !challengeActive('Metal');
	const needMinerScience = needMiner && game.resources.science.owned < 60;
	const breedingTrimps = game.resources.trimps.owned - trimpsEffectivelyEmployed();
	const hasTurkimp = game.talents.turkimp2.purchased || game.global.turkimpTimer > 0;
	const building = game.global.buildingsQueue[0];

	const trappingIsRelevant = trapTrimpsOK && _isTrappingRelevant(trapperTrapUntilFull);
	const trapWontBeWasted = trapperTrapUntilFull || !_willTrapsBeWasted();
	const canAffordTrap = canAffordBuilding('Trap', false, false, false, false, 1);

	if (game.global.buildingsQueue.length && building === 'Antenna.1') {
		safeSetGather('buildings');
		return;
	}

	// Highest Priority Food/Wood for traps when we either cant afford Traps or don't have them unlocked as the requirement for unlocking it is the cost of the building
	if (game.buildings.Trap.locked || !canAffordTrap) {
		//If not building and not trapping
		if (!trapsReady && game.global.buildingsQueue.length === 0 && (game.global.playerGathering !== 'trimps' || game.buildings.Trap.owned === 0)) {
			//Food and wood for traps
			if (_gatherTrapResources())
				return;
		}
	}

	// Highest Priority Trapping (doing Trapper or without breeding trimps)
	if (trappingIsRelevant && trapWontBeWasted && ((notFullPop && breedingTrimps < 4) || (trapperTrapUntilFull && !scientistsAvailable && !minersAvailable))) {
		if (_setTrapBait(lowOnTraps, true))
			return;
	}

	// Builds if we have storage buildings on top of the queue
	if ((!bwRewardUnlocked('Foremany') && game.global.buildingsQueue.length && building === 'Barn.1') || building === 'Shed.1' || building === 'Forge.1') {
		safeSetGather('buildings');
		return;
	}

	// Highest Priority Research if we have less science than needed to buy Battle
	if (researchAvailable && needBattle && isPlayerRelevant('science', hasTurkimp, 0.01)) {
		safeSetGather('science');
		return;
	}

	// Builds if we don't have Foremany, there are 2+ buildings in the queue, or if we can speed up something other than a trap (TODO Better condition than pMod > 100)
	if (!bwRewardUnlocked('Foremany') && game.global.buildingsQueue.length && (game.global.buildingsQueue.length > 1 || (building !== 'Trap.1' && (game.global.autoCraftModifier === 0 || getPlayerModifier() > 100)))) {
		safeSetGather('buildings');
		return;
	}

	// High Priority Trapping (refilling after a sudden increase in population)
	if (trappingIsRelevant && trapWontBeWasted && (game.resources.trimps.realMax() - game.resources.trimps.owned > baseArmySize)) {
		if (_setTrapBait(lowOnTraps, true))
			return;
	}

	// High Priority Research if we have less science than needed to buy Bloodlust
	if (researchAvailable && !Bloodlust.done && game.global.world >= 2 && isPlayerRelevant('science', hasTurkimp, 0.1)) {
		safeSetGather('science');
		return;
	}

	// Gathers food for Bloodlust
	if (!Bloodlust.done && game.global.world >= 2 && isPlayerRelevant('food', hasTurkimp, 0.1)) {
		safeSetGather('food');
		return;
	}

	// High Priority Trap Building (has fewer traps than needed during a sudden increase in population)
	if (trappingIsRelevant && lowTrapSupply) {
		//Food and wood for traps
		if (_gatherTrapResources())
			return;

		//Builds traps
		if (canAffordTrap) {
			safeBuyBuilding('Trap', 1);
			safeSetGather('buildings');
			return;
		}
	}

	// High Priority Research if we have less science than needed to buy Miner
	if (researchAvailable && needMinerScience && isPlayerRelevant('science', hasTurkimp, 0.01)) {
		safeSetGather('science');
		return;
	}

	// Gather metal for Miner
	if (needMiner && metalButtonAvailable && game.resources.metal.owned < 100 && isPlayerRelevant('metal', hasTurkimp)) {
		safeSetGather('metal');
		return;
	}

	// Higher Priority Research we already have enough food for Scientists
	if (researchAvailable && needScientistsScience && game.resources.food.owned > 300 && isPlayerRelevant('science', hasTurkimp, 0.01)) {
		safeSetGather('science');
		return;
	}

	// Gathers wood for Miner
	if (needMiner && game.triggers.wood.done && game.resources.wood.owned < 300 && isPlayerRelevant('wood', hasTurkimp)) {
		safeSetGather('wood');
		return;
	}

	// Higher Priority Research if we have less science than needed to buy Scientist
	if (researchAvailable && needScientistsScience && isPlayerRelevant('science', hasTurkimp, 0.01)) {
		safeSetGather('science');
		return;
	}

	// Gather resources for Scientist
	if (needScientists && game.resources.food.owned < 350 && isPlayerRelevant('food', hasTurkimp, 0.01)) {
		safeSetGather('food');
		return;
	}

	//Efficiency has the highest priority amongst upgrades
	if (_gatherUpgrade('Efficiency', researchAvailable, hasTurkimp))
		return;

	// Medium Priority Trapping (soldiers are dead)
	if (trappingIsRelevant && trapWontBeWasted && game.global.soldierHealth <= 0) {
		if (_setTrapBait(lowOnTraps, true))
			return;
	}

	//Gathers resources for some important upgrades
	let upgradesToGather = ['Speedscience', 'Speedminer', 'Speedlumber', 'Speedfarming'];
	upgradesToGather = upgradesToGather.concat(['Megascience', 'Megaminer', 'Megalumber', 'Megafarming']);
	upgradesToGather = upgradesToGather.concat(['Coordination', 'Blockmaster', 'Trainers', 'TrainTacular', 'Potency','Gymystic']);

	//Doesn't focus on Speedscience if manual research is still way too relevant
	if (isPlayerRelevant('science', hasTurkimp, 4))
		upgradesToGather = upgradesToGather.filter(up => !['Speedscience', 'Megascience'].includes(up))

	//Prioritizes upgrades that are pilling up
	upgradesToGather = upgradesToGather
		.map((up, idx) => ({up, idx}))
		.sort((a, b)=>
			(game.upgrades[b.up].allowed - game.upgrades[b.up].done) - (game.upgrades[a.up].allowed - game.upgrades[a.up].done) || a.idx - b.idx);

	//Upgrade accelerator
	for (let upgrade of upgradesToGather) {
		if (_gatherUpgrade(upgrade, researchAvailable, hasTurkimp))
			return;
	}

	if (hasTurkimp && game.global.mapsActive) {
		if (mapSettings.gather !== undefined && mapSettings.gather !== null) {
			safeSetGather(mapSettings.gather);
			return;
		}

		// Setting gather to the setting that corresponds to your current map special.
		const currentBonus = getCurrentMapObject().bonus;
		if (currentBonus) {
			if (currentBonus.includes('sc') || currentBonus.includes('hc')) safeSetGather('food');
			else if (currentBonus.includes('wc')) safeSetGather('wood');
			else if (currentBonus.includes('mc') || currentBonus.includes('lc')) safeSetGather('metal');
			else if (currentBonus.includes('rc') && researchAvailable) safeSetGather('science');
			else safeSetGather('metal');
			return;
		}
	}

	// High Priority Research - When manual research is still relevant
	if (researchAvailable && needScience && isPlayerRelevant('science', hasTurkimp, 0.25)) {
		safeSetGather('science');
		return;
	}

	// Medium Priority Trapping
	if (trappingIsRelevant && trapWontBeWasted && notFullPop && !shouldBuildTraps() && game.buildings.Trap.owned > 0) {
		safeSetGather('trimps');
		return;
	}

	// Medium Priority Trap Building
	if (trappingIsRelevant && canAffordTrap && shouldBuildTraps()) {
		MODULES.gather.trapBuffering = true;
		safeBuyBuilding('Trap', 1);
		safeSetGather('buildings');
		return;
	}

	// Metal if Turkimp is active
	if (hasTurkimp) {
		safeSetGather('metal');
		return;
	}

	// Low Priority Research
	if (researchAvailable && needScience && isPlayerRelevant('science', hasTurkimp)) {
		safeSetGather('science');
		return;
	}

	// Low Priority Trap Building
	if (trappingIsRelevant && canAffordTrap && shouldBuildTraps(true)) {
		MODULES.gather.trapBuffering = !fullOfTraps;
		MODULES.gather.maxTrapBuffering = true;
		safeBuyBuilding('Trap', 1);
		safeSetGather('buildings');
		return;
	}

	_lastResort(researchAvailable, trapTrimpsOK, lowOnTraps, needScience);
}

// Mining/Building only setting
function _autoGatherMetal() {
	if (game.global.buildingsQueue.length <= 1) {
		safeSetGather('metal');
	} else {
		safeSetGather('buildings');
	}
}
