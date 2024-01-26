MODULES.gather = {
	trapBuffering: false,
	maxTrapBuffering: false
};

//Traps per second
function calcTPS() {
	const fluffyTrapMult = game.global.universe === 2 && Fluffy.isRewardActive('trapper') ? 10 : 1;
	return Math.min(10, game.global.playerModifier / 5) * fluffyTrapMult;
}

function safeSetGather(resource) {
	if (!resource) return;

	if (resource === 'metal' && challengeActive('Transmute')) resource = 'wood';

	if (game.global.playerGathering === resource) return;

	debug(`Setting gather to ${resource}`, 'gather');
	setGather(resource);
}

function setTrapBait(lowOnTraps) {
	//Bait trimps if we have traps
	if (!lowOnTraps && !MODULES.gather.trapBuffering && game.buildings.Trap.owned > 0) {
		safeSetGather('trimps');
		return;
	}

	//Or build them, if they are on the queue
	if (isBuildingInQueue('Trap') || safeBuyBuilding('Trap', 1)) {
		MODULES.gather.trapBuffering = true;
		safeSetGather('buildings');
	}
}

function autoGather() {
	const manualGather = getPageSetting('gatherType');
	if (manualGather === 0) return;

	const scientistsAvailable = game.upgrades.Scientists.allowed && !game.upgrades.Scientists.done;
	const minersAvailable = game.upgrades.Miners.allowed && !game.upgrades.Miners.done;
	const metalButtonAvailable = document.getElementById('metalCollectBtn').style.display !== 'none' && document.getElementById('metal').style.visibility !== 'hidden';

	//Setting it to use mining/building only!
	if (!scientistsAvailable && !minersAvailable && manualGather === 2 && document.getElementById('metalCollectBtn').style.display !== 'none' && document.getElementById('metal').style.visibility !== 'hidden') {
		autoGatherMetal();
		return;
	}

	const trapChallenge = noBreedChallenge();
	const needBattle = !game.upgrades.Battle.done && game.resources.science.owned < 10;
	const notFullPop = game.resources.trimps.owned < game.resources.trimps.realMax();
	const baseArmySize = game.resources.trimps.maxSoldiers;
	const trapperTrapUntilFull = trapChallenge && notFullPop;
	const trapsBufferSize = Math.ceil(5 * calcTPS());
	const minTraps = needBattle ? 0 : Math.ceil(calcTPS());
	const maxTraps = Math.max(100, getZoneSeconds() / 4);
	let trapTrimpsOK = (!game.upgrades.Battle.done || getPageSetting('TrapTrimps')) && (trapperTrapUntilFull || game.jobs.Geneticist.owned === 0);

	//Identify if we should disable trapping when running Trappa/Trapper
	if (trapTrimpsOK && trapChallenge && getPageSetting('trapper') && getPageSetting('trapperTrap')) {
		const trappaCoordToggle = 1; //getPageSetting('trapperCoordsToggle');
		if (trappaCoordToggle === 1) {
			let targetArmySize = baseArmySize;
			let coordTarget = getPageSetting('trapperCoords') > 0 ? getPageSetting('trapperCoords') - 1 : 999;
			if (!game.global.runningChallengeSquared && coordTarget === 999) coordTarget = trimps.currChallenge === 'Trapper' ? 32 : 49;
			const remainingTrimps = game.resources.trimps.owned - game.resources.trimps.employed;
			const coordinatedMult = getPerkLevel('Coordinated') > 0 ? 0.25 * Math.pow(game.portal.Coordinated.modifier, getPerkLevel('Coordinated')) + 1 : 1;

			//Work out the army size that we need to calculate traps based off of.
			if (game.upgrades.Coordination.done >= coordTarget) {
				for (let z = game.upgrades.Coordination.done; z < coordTarget; ++z) {
					targetArmySize = Math.ceil(1.25 * baseArmySize);
					targetArmySize = Math.ceil(baseArmySize * coordinatedMult);
				}
			}

			//Disable trapping if we are fighting with our max coord army (or better) OR if we have enough trimps to fill our max coord army
			if ((challengeActive('Trappapalooza') && game.global.fighting && game.resources.trimps.maxSoldiers + remainingTrimps >= baseArmySize) || remainingTrimps > baseArmySize) trapTrimpsOK = false;
		}
	}

	const lowOnTraps = game.buildings.Trap.owned < minTraps;
	const trapsReady = game.buildings.Trap.owned >= minTraps + trapsBufferSize;
	const fullOfTraps = game.buildings.Trap.owned >= maxTraps;
	const maxTrapsReady = game.buildings.Trap.owned >= maxTraps + trapsBufferSize;
	if (lowOnTraps) MODULES.gather.trapBuffering = true;
	if (trapsReady) MODULES.gather.trapBuffering = false;
	if (maxTrapsReady) MODULES.gather.maxTrapBuffering = false;

	const resourcesNeeded = getUpgradeCosts();
	const scienceAvailable = document.getElementById('science').style.visibility !== 'hidden';
	const researchAvailable = document.getElementById('scienceCollectBtn').style.display !== 'none' && scienceAvailable;

	const needScience = game.resources.science.owned < resourcesNeeded.science;
	const needScientists = scienceAvailable && !game.upgrades.Scientists.done;
	const needScientistsScience = needScientists && game.resources.science.owned < 100;
	const needScientistsScienceNow = needScientistsScience && !game.upgrades.Scientists.locked;

	const needMiner = !game.upgrades.Miners.done && game.global.challengeActive != "Metal";
	const needMinerScience = needMiner && game.resources.science.owned < 60;
	const needMinerScienceNow = needMinerScience && !game.upgrades.Miners.locked;

	const breedingTrimps = game.resources.trimps.owned - trimpsEffectivelyEmployed();
	const hasTurkimp = game.talents.turkimp2.purchased || game.global.turkimpTimer > 0;
	const building = game.global.buildingsQueue[0];

	//Verifies if trapping is still relevant
	//Relevant means we gain at least 10% more trimps per sec while trapping (which basically stops trapping during later zones)
	//And there is enough breed time remaining to open an entire trap (prevents wasting time and traps during early zones)
	const trappingIsRelevant = trapperTrapUntilFull || breedingPS().div(10).lt(calcTPS() * (game.portal.Bait.level + 1));
	const trapWontBeWasted = trapperTrapUntilFull || breedTimeRemaining().gte(1 / calcTPS()) || (game.global.playerGathering === 'trimps' && breedTimeRemaining().lte(MODULES.breedtimer.DecimalBreed(0.1)));

	//Build if we are building an Antenna. Priority over everything else.
	if (game.global.buildingsQueue.length && building === 'Antenna.1') {
		safeSetGather('buildings');
		return;
	}

	//Highest Priority Food/Wood for traps when we either cant afford Traps or don't have them unlocked as the requirement for unlocking it is the cost of the building
	if (game.buildings.Trap.locked || !canAffordBuilding('Trap')) {
		//If not building and not trapping
		if (!trapsReady && game.global.buildingsQueue.length === 0 && (game.global.playerGathering !== 'trimps' || game.buildings.Trap.owned === 0)) {
			if (game.resources.food.owned < 10) {
				safeSetGather('food');
				return;
			}

			if (game.triggers.wood.done && game.resources.wood.owned < 10) {
				safeSetGather('wood');
				return;
			}
		}
	}

	//Highest Priority Trapping (doing Trapper or without breeding trimps)
	if (trapTrimpsOK && trappingIsRelevant && trapWontBeWasted && ((notFullPop && breedingTrimps < 4) || trapperTrapUntilFull && !scientistsAvailable && !minersAvailable)) {
		setTrapBait(lowOnTraps);
		return;
	}

	//Highest Priority Research if we have less science than needed to buy Battle, Miner or part of Scientist, and they are already unlocked
	if (manualGather !== 3 && researchAvailable && (needBattle || needMinerScienceNow && needScientistsScienceNow)) {
		safeSetGather('science');
		return;
	}

	//Build if we don't have foremany, there are 2+ buildings in the queue, or if we can speed up something other than a trap
	if (!bwRewardUnlocked('Foremany') && game.global.buildingsQueue.length && (game.global.buildingsQueue.length > 1 || building !== 'Trap.1' && (game.global.autoCraftModifier === 0 || getPlayerModifier() > 100))) {
		safeSetGather('buildings');
		return;
	}

	//Also Build if we have storage buildings on top of the queue
	if ((!bwRewardUnlocked('Foremany') && game.global.buildingsQueue.length && building === 'Barn.1') || building === 'Shed.1' || building === 'Forge.1') {
		safeSetGather('buildings');
		return;
	}

	//High Priority Trapping (refilling after a sudden increase in population)
	if (trapTrimpsOK && trappingIsRelevant && trapWontBeWasted && game.resources.trimps.realMax() - game.resources.trimps.owned > baseArmySize) {
		setTrapBait(lowOnTraps);
		return;
	}

	//Highest Priority Research if we have less science than needed to buy Miner and Scientist
	if (manualGather !== 3 && researchAvailable && (needMinerScience || needScientistsScience)) {
		safeSetGather('science');
		return;
	}

	//Gather resources for Miner
	if (needMiner && (game.resources.metal.owned < 100 || game.resources.wood.owned < 300)) {
		safeSetGather(metalButtonAvailable && game.resources.metal.owned < 100 ? 'metal' : 'wood');
		return;
	}

	//Gather resources for Scientist
	if (needScientists && game.resources.food.owned < 350) {
		safeSetGather('food');
		return;
	}

	//Get coord if army size is not the problem.
	const coordUpgrade = game.upgrades['Coordination'];
	if (game.global.world < coordUpgrade.allowed && canAffordCoordinationTrimps()) {
		//TODO Put these resources in a priority queue
		//TODO Refactoring

		//Science
		let needResource = resolvePow(coordUpgrade.cost.resources.science, coordUpgrade) > game.resources.science.owned;
		let playerRelevant = getPlayerModifier() > getPsString_AT('science', true) / 10;
		if (manualGather !== 3 && researchAvailable && needResource && playerRelevant) {
			safeSetGather('science');
			return;
		}

		//Food
		needResource = resolvePow(coordUpgrade.cost.resources.food, coordUpgrade) > game.resources.food.owned;
		playerRelevant = hasTurkimp || getPlayerModifier() > getPsString_AT('food', true) / 10;
		if (needResource && playerRelevant) {
			safeSetGather('food');
			return;
		}

		//Wood
		needResource = resolvePow(coordUpgrade.cost.resources.wood, coordUpgrade) > game.resources.wood.owned;
		playerRelevant = hasTurkimp || getPlayerModifier() > getPsString_AT('wood', true) / 10;
		if (game.triggers.wood.done && needResource && playerRelevant) {
			safeSetGather('wood');
			return;
		}

		//Metal
		needResource = resolvePow(coordUpgrade.cost.resources.metal, coordUpgrade) > game.resources.metal.owned;
		playerRelevant = getPlayerModifier() > getPsString_AT('metal', true) / 10;
		if (metalButtonAvailable && needResource && playerRelevant) {
			safeSetGather('metal');
			return;
		}
	}

	//High Priority Research - When manual research still has more impact than scientists
	if (manualGather !== 3 && researchAvailable && needScience && getPlayerModifier() > getPsString_AT('science', true)) {
		safeSetGather('science');
		return;
	}

	if (hasTurkimp && game.global.mapsActive) {
		if (mapSettings.gather !== undefined && mapSettings.gather !== null) {
			safeSetGather(mapSettings.gather);
			return;
		}

		//Setting gather to the setting that corresponds to your current map special.
		const currentBonus = getCurrentMapObject().bonus;
		if (currentBonus) {
			if (currentBonus.includes('sc') || currentBonus.includes('hc')) safeSetGather('food');
			else if (currentBonus.includes('wc')) safeSetGather('wood');
			else if (currentBonus.includes('mc') || currentBonus.includes('lc')) safeSetGather('metal');
			else if (manualGather !== 3 && currentBonus.includes('rc') && researchAvailable) safeSetGather('science');
			else safeSetGather('metal');
			return;
		}
	}

	//Mid Priority Trapping
	if (trapTrimpsOK && trappingIsRelevant && trapWontBeWasted && notFullPop && !lowOnTraps && !MODULES.gather.trapBuffering && game.buildings.Trap.owned > 0) {
		safeSetGather('trimps');
		return;
	}

	//High Priority Trap Building
	if (trapTrimpsOK && trappingIsRelevant && canAffordBuilding('Trap', false, false, false, false, 1) && (lowOnTraps || MODULES.gather.trapBuffering)) {
		MODULES.gather.trapBuffering = true;
		safeBuyBuilding('Trap', 1);
		safeSetGather('buildings');
		return;
	}

	//Mid Priority Research
	if (manualGather !== 3 && researchAvailable && needScience) {
		safeSetGather('science');
		return;
	}

	//Metal if Turkimp is active
	if (hasTurkimp) {
		safeSetGather('metal');
		return;
	}

	//Low Priority Trap Building
	if (trapTrimpsOK && trappingIsRelevant && canAffordBuilding('Trap', false, false, false, false, 1) && (!fullOfTraps || MODULES.gather.maxTrapBuffering)) {
		MODULES.gather.trapBuffering = !fullOfTraps;
		MODULES.gather.maxTrapBuffering = true;
		safeBuyBuilding('Trap', 1);
		safeSetGather('buildings');
		return;
	}

	const manualResourceList = {
		food: 'Farmer',
		wood: 'Lumberjack',
		metal: 'Miner'
	};
	let lowestResource = 'food';
	let lowestResourceRate = -1;
	let haveWorkers = true;
	for (let resource in manualResourceList) {
		let job = manualResourceList[resource];
		let currentRate = game.jobs[job].owned * game.jobs[job].modifier;
		if (document.getElementById(resource).style.visibility !== 'hidden') {
			if (currentRate === 0) {
				currentRate = game.resources[resource].owned;
				if (haveWorkers || currentRate < lowestResourceRate) {
					haveWorkers = false;
					lowestResource = resource;
					lowestResourceRate = currentRate;
				}
			}
			if ((currentRate < lowestResourceRate || lowestResourceRate === -1) && haveWorkers) {
				lowestResource = resource;
				lowestResourceRate = currentRate;
			}
		}
	}
	if (document.getElementById('scienceCollectBtn').style.display !== 'none' && document.getElementById('science').style.visibility !== 'hidden') {
		if (manualGather !== 3 && researchAvailable && game.global.turkimpTimer < 1 && haveWorkers && game.resources.science.owned < getPsString_AT('science') * 60) {
			safeSetGather('science');
		} else {
			safeSetGather(lowestResource);
		}
	} else if (trapTrimpsOK && game.global.trapBuildToggled && lowOnTraps) {
		safeSetGather('buildings');
	} else {
		safeSetGather(lowestResource);
	}
}

//Mining/Building only setting
function autoGatherMetal() {
	if (game.global.buildingsQueue.length <= 1) {
		safeSetGather('metal');
	} else {
		safeSetGather('buildings');
	}
}
