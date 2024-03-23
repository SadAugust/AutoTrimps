MODULES.gather = {
	coordBuffering: undefined
};

MODULES.trapPools = [
	{
		size: () => Math.floor(_calcTPS()),
		bufferSize: () => 0,
		buffering: false
	},
	{
		size: () => _calcTrapSupplySize(),
		bufferSize: () => Math.floor(_calcTPS()),
		buffering: false
	},
	{
		size: () => _calcTrapsToFullArmy(),
		bufferSize: () => Math.floor(_calcTPS()),
		buffering: false
	},
	{
		size: () => 5 * _calcTrapsToFullArmy(),
		bufferSize: () => Math.floor(_calcTPS()),
		buffering: false
	},
	{
		size: () => Math.max(100, Math.ceil((_calcTPS() * getZoneSeconds()) / 4)),
		bufferSize: () => 5 * Math.floor(_calcTPS()),
		buffering: false,
		highBuffering: false
	},
	{
		size: () => Infinity,
		bufferSize: () => 10 * Math.floor(_calcTPS()),
		buffering: false
	}
];

function _trapSize() {
	return 1 + getPerkLevel('Bait') * game.portal.Bait.modifier;
}

function _calcTrapsToFullArmy() {
	return Math.ceil(game.resources.trimps.maxSoldiers / _trapSize());
}

function _calcTPS() {
	const fluffyTrapMult = game.global.universe === 2 && Fluffy.isRewardActive('trapper') ? 10 : 1;
	return Math.min(10, game.global.playerModifier / 5) * fluffyTrapMult;
}

function _calcTrapSupplySize() {
	const territoryBonus = 5 + game.portal.Trumps.modifier * getPerkLevel('Trumps');
	const tauntimp = game.unlocks.imps.Tauntimp ? Math.ceil(game.resources.trimps.realMax() * 0.003) : 0;
	let largestHouseSize = ['Hut', 'House', 'Mansion', 'Hotel', 'Resort', 'Gateway', 'Collector', 'Warpstation']
		.filter((houseName) => !game.buildings[houseName].locked)
		.map((houseName) => _getHousingBonus(houseName))
		.reduce((max, bonus) => Math.max(max, bonus), 0);
	return Math.ceil(Math.max(territoryBonus, largestHouseSize, tauntimp) / _trapSize()) - 1;
}

function safeSetGather(resource) {
	if (resource === 'metal' && challengeActive('Transmute')) resource = 'wood';

	if (game.global.playerGathering === resource) return;

	debug(`Setting gather to ${resource}`, 'gather');
	setGather(resource);

	MODULES.gather.coordBuffering = undefined;
}

function _isTrappingOK(Battle, Coordination) {
	const trapChallenge = noBreedChallenge();
	const notFullPop = game.resources.trimps.owned < game.resources.trimps.realMax();
	const trapperTrapUntilFull = trapChallenge && notFullPop;
	const baseCheck = (!Battle.done || getPageSetting('TrapTrimps') || _breedTimeRemaining() === Infinity || (game.global.world === 1 && game.global.lastClearedCell === -1)) && (trapperTrapUntilFull || game.jobs.Geneticist.owned === 0);
	if (!trapChallenge) return baseCheck;

	// Identify if we should disable trapping when running Trappa/Trapper.
	const trapSettingsEnabled = getPageSetting('trapper') && !getPageSetting('trapperTrap');
	if (!trapSettingsEnabled) return true;

	const trappaCoordToggle = getPageSetting('trapperCoordStyle');
	const coordinated = getPerkLevel('Coordinated');

	let targetArmySize = game.resources.trimps.getCurrentSend();
	const remainingTrimps = game.resources.trimps.owned - game.resources.trimps.employed;
	let trappaCheck;
	let maxCheck;
	if (trappaCoordToggle === 0) {
		const trapperCoords = getPageSetting('trapperCoords');
		const coordinatedMult = coordinated > 0 ? 0.25 * Math.pow(game.portal.Coordinated.modifier, coordinated) + 1 : 1;
		let coordTarget = trapperCoords > 0 ? trapperCoords - 1 : 999;
		if (!game.global.runningChallengeSquared && coordTarget === 999) coordTarget = trimpStats.currChallenge === 'Trapper' ? 32 : 49;
		if (Coordination.done >= coordTarget) {
			for (let z = Coordination.done; z < coordTarget; ++z) {
				targetArmySize = Math.ceil(1.25 * targetArmySize);
				targetArmySize = Math.ceil(targetArmySize * coordinatedMult);
			}
		}
	}

	if (trappaCoordToggle === 1) {
		const armySize = getPageSetting('trapperArmySize');
		if (armySize > 0) targetArmySize = armySize;
	}

	trappaCheck = challengeActive('Trappapalooza') && game.global.fighting && game.resources.trimps.maxSoldiers + remainingTrimps >= targetArmySize;
	maxCheck = remainingTrimps > targetArmySize;
	if (trappaCheck || maxCheck) return false;

	return true;
}

function _isTrappingRelevant() {
	// Relevant means we gain at least 10% more trimps per sec while trapping (which basically stops trapping during later zones)
	return _breedingPS() / 10 < _calcTPS() * _trapSize();
}

function isPlayerRelevant(resourceName, hasTurkimp, customRatio = 0.1) {
	const turkimp = hasTurkimp && resourceName.toLowerCase() !== 'science';
	return turkimp || getPlayerModifier() >= customRatio * trimpStats.resourcesPS[resourceName].normal;
}

function _gatherUpgrade(upgradeName, researchAvailable, hasTurkimp) {
	return _gatherUpgrades([upgradeName], researchAvailable, hasTurkimp);
}

function _gatherUpgrades(upgradeNames, researchAvailable, hasTurkimp) {
	const upgrades = upgradeNames.map((upName) => ({ name: upName, obj: game.upgrades[upName] }));

	const upgradeAllowedFuncs = {
		Efficiency: (upObj) => upObj.done < Math.floor(game.global.world / 2),
		Speedfarming: (upObj) => upObj.done < Math.min(game.global.world, 59),
		Speedlumber: (upObj) => upObj.done < Math.min(game.global.world, 59),
		Speedminer: (upObj) => upObj.done < Math.min(game.global.world, 59) && !challengeActive('Metal'),
		Speedscience: (upObj) => upObj.done < Math.floor(game.global.world / 2) && !challengeActive('Scientist'),
		Megafarming: (upObj) => upObj.done < game.global.world - 59,
		Megalumber: (upObj) => upObj.done < game.global.world - 59,
		Megaminer: (upObj) => upObj.done < game.global.world - 59 && !challengeActive('Metal'),
		Megascience: (upObj) => upObj.done < Math.floor((game.global.world - 59) / 2) && !challengeActive('Scientist'),
		Coordination: (upObj) => upObj.done < game.global.world && canAffordCoordinationTrimps(),
		Blockmaster: (upObj) => upObj.done < (game.global.world >= 4 ? 1 : 0),
		Trainers: (upObj) => upObj.done < (game.global.world >= 3 ? 1 : 0),
		TrainTacular: (upObj) => upObj.done < Math.floor(game.global.world / 5),
		Potency: (upObj) => upObj.done < Math.floor(game.global.world / 5),
		Dagadder: (upObj) => !upObj.done && upObj.allowed && game.resources.gems.owned >= upObj.cost.resources.gems[0],
		Supershield: (upObj) => !upObj.done && upObj.allowed && game.resources.gems.owned >= upObj.cost.resources.gems[0],
		Bootboost: (upObj) => !upObj.done && upObj.allowed && game.resources.gems.owned >= upObj.cost.resources.gems[0],
		Bounty: (upObj) => !upObj.done && upObj.allowed,
		Gymystic: (upObj) => upObj.done < Math.floor((Math.min(game.global.world, 55) - 20) / 5) + Math.max(0, Math.floor((Math.min(game.global.world, 150) - 70) / 5))
	};

	const allowedUpgrades = upgrades.filter((up) => upgradeAllowedFuncs[up.name]).filter((up) => upgradeAllowedFuncs[up.name](up.obj));
	const upsAvailable = allowedUpgrades.filter((up) => game.upgrades[up]).filter((up) => game.upgrades[up].allowed > game.upgrades[up].done);

	const isResourceAllowed = (resourceName) =>
		({
			science: researchAvailable,
			food: true,
			wood: game.triggers.wood.done,
			metal: elementVisible('metal') && (upsAvailable.length || !challengeActive('Metal'))
		}[resourceName]);

	// Calculates the required amount of any resource used by the upgrade
	function neededResourceAmount(resourceName) {
		return allowedUpgrades
			.map((up) => ({ up: up, cost: up.obj.cost.resources[resourceName] }))
			.filter((upC) => upC.cost)
			.map((upC) => (upC.cost[1] === undefined ? upC.cost : resolvePow(upC.cost, upC.up.obj)))
			.reduce((total, cost) => total + cost, 0);
	}

	// Calculates the priority
	const getPriority = (resourceName) => {
		// Exception: Science only relies on Turkimp
		if (resourceName.toLowerCase() === 'science' && game.resources[resourceName].owned < neededResourceAmount(resourceName) && !hasTurkimp) return 2;

		// The priority equals the % of the resource we still need to gather (-1 would mean "last", not "don't gather")
		let priority = 1 - Math.min(1, game.resources[resourceName].owned / neededResourceAmount(resourceName));

		// Keeps a higher priority for science, even with turkimp
		if (resourceName.toLowerCase() === 'science') priority = Math.min(2 * priority, 1);

		// Uses a buffer to avoid flickering between resources
		return priority + (MODULES.gather.coordBuffering === resourceName && priority > 0 ? 0.1 : 0);
	};

	// Defines the priority of each resource
	let priorityList = ['science', 'food', 'wood', 'metal']
		.filter((resourceName) => isResourceAllowed(resourceName) && isPlayerRelevant(resourceName, hasTurkimp, 0.25))
		.map((resourceName) => ({ name: resourceName, priority: getPriority(resourceName) }))
		.filter((resource) => resource.priority)
		.sort((r1, r2) => r2.priority - r1.priority);

	if (!priorityList.length) return false;

	safeSetGather(priorityList[0].name);
	MODULES.gather.coordBuffering = priorityList[0].name;

	return true;
}

function _willTrapsBeWasted() {
	// There is enough breed time and space remaining to open an entire trap (prevents wasting time and traps during early zones)
	const breedTimer = _breedTimeRemaining();
	const tps = _calcTPS();
	const gteTime = breedTimer >= 1 / tps;
	const gte2Time = breedTimer >= 2 / tps;
	const lteTime = game.global.playerGathering === 'trimps' && breedTimer <= 0.1;
	const excessBait = _trapSize() >= game.resources.trimps.realMax() - game.resources.trimps.owned;
	const fighting = game.global.fighting;

	return ((!gte2Time || fighting) && excessBait) || !(gteTime || lteTime);
}

function _lastResort(researchAvailable, trapTrimpsOK, needScience) {
	let lowestResource = 'food';
	let lowestResourceRate = -1;
	const manualResourceList = {
		food: 'Farmer',
		wood: 'Lumberjack',
		metal: 'Miner'
	};

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

	if (researchAvailable && game.global.turkimpTimer < 1 && (needScience || game.resources.science.owned < trimpStats.resourcesPS['science'].manual * 60)) {
		safeSetGather('science');
	} else if (trapTrimpsOK && game.global.trapBuildToggled) {
		_handleTrapping('build', 4);
	} else {
		safeSetGather(lowestResource);
	}
}

function _gatherTrapResources() {
	if (game.resources.food.owned < 10 && isPlayerRelevant('food', false, 0.01)) {
		safeSetGather('food');
		return true;
	}

	if (game.triggers.wood.done && game.resources.wood.owned < 10 && isPlayerRelevant('wood', false, 0.01)) {
		safeSetGather('wood');
		return true;
	}

	return false;
}

function _handleTrapping(action, priority) {
	const buyTrap = () => canAffordBuilding('Trap') && (safeBuyBuilding('Trap', 1) || true);
	const canBuild = () => isBuildingInQueue('Trap') || buyTrap();
	const bait = () => safeSetGather('trimps') || true;
	const build = () => (canBuild() && (safeSetGather('buildings') || true)) || _gatherTrapResources();

	const trapsOwned = game.buildings.Trap.owned;

	if (trapsOwned <= MODULES.trapPools[0].size() && action === 'bait') return false;
	if (trapsOwned < MODULES.trapPools[0].size()) {
		build();
		return true;
	}

	priority = Math.min(priority + 1, MODULES.trapPools.length - 1);
	const previousSize = MODULES.trapPools.slice(0, priority).reduce((t, pool) => t + pool.size(), 0);
	const currentSize = MODULES.trapPools[priority].size();
	const bufferSize = MODULES.trapPools[priority].bufferSize();

	// Disable high buffers
	if (trapsOwned >= previousSize + currentSize + bufferSize)
		MODULES.trapPools
			.slice(0, priority + 1)
			.filter((pool) => pool.highBuffering)
			.map((pool) => (pool.highBuffering = false));

	// Disable buffers
	if (trapsOwned >= previousSize + bufferSize) MODULES.trapPools.slice(0, priority + 1).map((pool) => (pool.buffering = false));

	// Above the inverted buffer zone
	if (trapsOwned >= previousSize + currentSize + bufferSize && action === 'build') return false;
	if (trapsOwned > previousSize + currentSize + bufferSize) return bait();

	// Inverted buffering zone (TODO Auto toggle enabled)
	const highBuffering = MODULES.trapPools[priority].highBuffering;
	if (trapsOwned >= previousSize + currentSize && highBuffering && action === 'build') return build();
	if (trapsOwned > previousSize + currentSize && highBuffering) return bait();

	// Above the target pool limit
	if (trapsOwned >= previousSize + currentSize && action === 'build') return false;
	if (trapsOwned > previousSize + currentSize) return bait();

	// Activates high buffers
	MODULES.trapPools
		.slice(priority)
		.filter((pool) => pool.highBuffering !== undefined)
		.map((pool) => (pool.highBuffering = true));

	// Above buffering zone
	if (trapsOwned >= previousSize + bufferSize && action === 'build') return build();
	if (trapsOwned > previousSize + bufferSize) return bait();

	// Buffering zone
	const buffering = MODULES.trapPools[priority].buffering;
	if (trapsOwned >= previousSize && buffering && action === 'bait') return false;
	if (trapsOwned >= previousSize && buffering) return build();
	if (trapsOwned >= previousSize && action === 'build') return build();
	if (trapsOwned > previousSize) return bait();

	// Below pool limits
	MODULES.trapPools.slice(priority).map((pool) => (pool.buffering = true));
	return action !== 'bait' && build();
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
	const fighting = game.global.fighting;
	const needBattle = !Battle.done && game.resources.science.owned < 10;
	const notFullPop = game.resources.trimps.owned < game.resources.trimps.realMax();
	const baseArmySize = game.resources.trimps.maxSoldiers;
	const trapperTrapUntilFull = trapChallenge && notFullPop;

	const trapTrimpsOK = _isTrappingOK(Battle, Coordination);

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
	const trappingIsRelevant = trapTrimpsOK && (trapperTrapUntilFull || _isTrappingRelevant());
	const trapWontBeWasted = trapperTrapUntilFull || !_willTrapsBeWasted();

	// Toggle Trapstorm
	if (trapTrimpsOK && game.global.trapBuildAllowed && !game.global.trapBuildToggled) toggleAutoTrap();

	if (game.global.buildingsQueue.length && building === 'Antenna.1') {
		safeSetGather('buildings');
		return;
	}

	// Highest Priority Trapping (doing Trapper or without breeding trimps)
	if ((game.buildings.Trap.locked || trappingIsRelevant) && trapWontBeWasted && ((notFullPop && breedingTrimps < 4) || (trapperTrapUntilFull && !scientistsAvailable && !minersAvailable))) {
		if (_handleTrapping('both', 0)) return;
	}

	// Builds if we have storage buildings in the queue
	if (!bwRewardUnlocked('Foremany') && game.global.buildingsQueue.filter(b => ['Barn.1', 'Shed.1', 'Forge.1'].includes(b)).length) {
		safeSetGather('buildings');
		return;
	}

	// Highest Priority Research if we have less science than needed to buy Battle
	if (researchAvailable && needBattle && isPlayerRelevant('science', hasTurkimp, 0.01)) {
		safeSetGather('science');
		return;
	}

	// High Priority Trapping (refilling after a sudden increase in population and not fighting)
	if (trappingIsRelevant && trapWontBeWasted && !fighting && game.resources.trimps.realMax() - game.resources.trimps.owned > baseArmySize) {
		if (_handleTrapping('both', 0)) return;
	}

	// Builds if we don't have Foremany, there are 2+ buildings in the queue, or if we can speed up something other than a trap (TODO Better condition than pMod > 100)
	if (!bwRewardUnlocked('Foremany') && game.global.buildingsQueue.length && (game.global.buildingsQueue.length > 1 || (building !== 'Trap.1' && (game.global.autoCraftModifier === 0 || getPlayerModifier() > 100)))) {
		safeSetGather('buildings');
		return;
	}

	// High Priority Trapping (refilling after a sudden increase in population)
	if (trappingIsRelevant && trapWontBeWasted && game.resources.trimps.realMax() - game.resources.trimps.owned > baseArmySize) {
		if (_handleTrapping('both', 0)) return;
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
	if (trappingIsRelevant && _handleTrapping('build', 0)) return;

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

	// Efficiency has the highest priority amongst upgrades
	if (!game.global.mapsActive && _gatherUpgrade('Efficiency', researchAvailable, hasTurkimp)) return;

	// Medium Priority Trapping (soldiers are dead)
	if (trappingIsRelevant && trapWontBeWasted && game.global.soldierHealth <= 0) {
		if (_handleTrapping('bait', 1)) return;
	}

	// Gathers resources for some important upgrades
	let upgradesToGather = ['Efficiency', 'Bounty', 'Speedscience', 'Speedminer', 'Speedlumber', 'Speedfarming'];
	upgradesToGather = upgradesToGather.concat(['Megascience', 'Megaminer', 'Megalumber', 'Megafarming']);
	upgradesToGather = upgradesToGather.concat(['Coordination', 'Dagadder', 'Blockmaster', 'Trainers', 'TrainTacular', 'Potency', 'Explorers', 'Gymystic']);

	// Doesn't focus on Speedscience if manual research is still way too relevant
	if (isPlayerRelevant('science', hasTurkimp, 2)) upgradesToGather = upgradesToGather.filter((up) => !['Speedscience', 'Megascience'].includes(up));

	// Prioritizes upgrades that are pilling up
	upgradesToGather = upgradesToGather
		.map((up, idx) => ({ up, idx }))
		.sort((a, b) => game.upgrades[b.up].allowed - game.upgrades[b.up].done - (game.upgrades[a.up].allowed - game.upgrades[a.up].done) || a.idx - b.idx)
		.map(({ up }) => up);

	// Upgrade accelerator (available only)
	for (let upgrade of upgradesToGather.filter((up) => game.upgrades[up].allowed > game.upgrades[up].done)) {
		if (_gatherUpgrade(upgrade, researchAvailable, hasTurkimp)) return;
	}

	// Medium Priority Trap Building
	if (trappingIsRelevant) {
		if (_handleTrapping('build', 1)) return;
	}

	// Upgrade accelerator
	for (let upgrade of upgradesToGather) {
		if (_gatherUpgrade(upgrade, researchAvailable, hasTurkimp)) return;
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
			else safeSetGather(challengeActive('Metal') ? 'wood' : 'metal');
			return;
		}
	}

	// Medium Priority Research - When science is needed and manual research is still relevant
	if (researchAvailable && needScience && isPlayerRelevant('science', hasTurkimp, 0.25)) {
		safeSetGather('science');
		return;
	}

	// Low Priority Trapping
	if (trappingIsRelevant && trapWontBeWasted && notFullPop) {
		if (_handleTrapping('bait', 2)) return;
	}

	// Low Priority Trap Building
	if (trappingIsRelevant) {
		if (_handleTrapping('build', 2)) return;
	}

	// Metal if Turkimp is active
	if (hasTurkimp) {
		safeSetGather(challengeActive('Metal') ? 'wood' : 'metal');
		return;
	}

	// Low Priority Trap Building
	if (trappingIsRelevant) {
		if (_handleTrapping('build', 3)) return;
	}

	// Upgrade accelerator - Accumulates resources for all the important upgrades of this zone
	if (_gatherUpgrades(upgradesToGather, researchAvailable, hasTurkimp)) return;

	// Low Priority Research
	if (researchAvailable && needScience && isPlayerRelevant('science', hasTurkimp)) {
		safeSetGather('science');
		return;
	}

	_lastResort(researchAvailable, trapTrimpsOK, needScience);
}

// Mining/Building only setting
function _autoGatherMetal() {
	if (game.global.buildingsQueue.length <= 1) {
		safeSetGather('metal');
	} else {
		safeSetGather('buildings');
	}
}
