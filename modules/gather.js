MODULES.gather = {
	minScienceSeconds: 60,
	trapBuffering: false,
	maxTrapBuffering: false,
	maxZoneDuration: 0,
}

//Traps per second
function calcTPS() {
	var tps = Math.min(10, game.global.playerModifier / 5);
	if (game.global.universe === 2 && Fluffy.isRewardActive("trapper")) tps *= 10;
	return tps;
}

function calcMaxTraps() {
	//Tries to keep in mind the longest duration any zone has lasted in this portal
	var time = getZoneSeconds();
	if (game.global.world === 1) MODULES.gather.maxZoneDuration = time;
	if (time > MODULES.gather.maxZoneDuration) MODULES.gather.maxZoneDuration = time;

	//Return enough traps to last 1/4 of the longest duration zone we've seen so far
	return Math.ceil(calcTPS() * MODULES.gather.maxZoneDuration / 4);
}

function safeSetGather(resource) {
	if (!resource)
		return;

	//Can't gather metal on this challenge so need to override it
	if (resource === 'metal' && challengeActive('Transmute')) resource = 'wood';

	if (game.global.playerGathering !== resource) {
		debug("Setting gather to " + resource, "gather");
		setGather(resource);
	}
	return;
}

//Gather selection
function autoGather() {

	var manualGather = getPageSetting('gatherType');

	if (manualGather === 0) return;

	var scientistsAvailable = game.upgrades.Scientists.allowed && !game.upgrades.Scientists.done;
	var minersAvailable = game.upgrades.Miners.allowed && !game.upgrades.Miners.done;

	//Setting it to use mining/building only!
	if (!scientistsAvailable && !minersAvailable && manualGather === 2 && document.getElementById('metalCollectBtn').style.display !== 'none' && document.getElementById('metal').style.visibility !== 'hidden') {
		autoGatherMetal();
		return;
	}


	var needBattle = !game.upgrades.Battle.done && game.resources.science.owned < 10;
	var notFullPop = game.resources.trimps.owned < game.resources.trimps.realMax();
	var trapperTrapUntilFull = (challengeActive('Trapper') || challengeActive('Trappapalooza')) && notFullPop;
	var trapsBufferSize = Math.ceil(5 * calcTPS());
	var minTraps = needBattle ? 0 : Math.ceil(calcTPS());
	var maxTraps = calcMaxTraps();
	var trapTrimpsOK = (!game.upgrades.Battle.done || (getPageSetting('TrapTrimps'))) && (trapperTrapUntilFull || game.jobs.Geneticist.owned === 0);
	if (trapTrimpsOK && challengeActive('Trappapalooza') && getPageSetting('trappapalooza') && getPageSetting('trappapaloozaCoords') > 0 && game.upgrades.Coordination.done >= getPageSetting('trappapaloozaCoords') && getPageSetting('trappapaloozaTrap')) trapTrimpsOK = false;

	//Vars
	var lowOnTraps = game.buildings.Trap.owned < minTraps;
	var trapsReady = game.buildings.Trap.owned >= minTraps + trapsBufferSize;
	var fullOfTraps = game.buildings.Trap.owned >= maxTraps;
	var maxTrapsReady = game.buildings.Trap.owned >= maxTraps + trapsBufferSize;
	if (lowOnTraps) MODULES.gather.trapBuffering = true;
	if (trapsReady) MODULES.gather.trapBuffering = false;
	if (maxTrapsReady) MODULES.gather.maxTrapBuffering = false;

	// Init - Science
	var firstFightOK = game.global.world > 1 || game.global.lastClearedCell >= 0;
	var researchAvailable = document.getElementById('scienceCollectBtn').style.display !== 'none' && document.getElementById('science').style.visibility !== 'hidden';
	var scienceAvailable = document.getElementById('science').style.visibility !== 'hidden';
	var needScience = game.resources.science.owned < MODULES.resourceNeeded.science;
	var needScientists = firstFightOK && !challengeActive('Scientist') && !game.upgrades.Scientists.done && game.resources.science.owned < 100 && scienceAvailable;

	//Init - Others
	var needMiner = firstFightOK && minersAvailable;
	var breedingTrimps = game.resources.trimps.owned - trimpsEffectivelyEmployed();
	var hasTurkimp = game.talents.turkimp2.purchased || game.global.turkimpTimer > 0;
	var building = game.global.buildingsQueue[0];
	//Verifies if trapping is still relevant
	//Relevant means we gain at least 10% more trimps per sec while trapping (which basically stops trapping during later zones)
	//And there is enough breed time remaining to open an entire trap (prevents wasting time and traps during early zones)
	var trappingIsRelevant = trapperTrapUntilFull || breedingPS().div(10).lt(calcTPS() * (game.portal.Bait.level + 1));
	var trapWontBeWasted = trapperTrapUntilFull || (breedTimeRemaining().gte(1 / calcTPS()) || game.global.playerGathering === "trimps" && breedTimeRemaining().lte(MODULES.breedtimer.DecimalBreed(0.1)));

	//Build if we are building an Antenna. Priority over everything else.
	if (game.global.buildingsQueue.length && building === 'Antenna.1') {
		safeSetGather('buildings');
		return;
	}

	//Highest Priority Food/Wood for traps when we either cant afford Traps or don't have them unlocked as the requirement for the unlock is the cost of the building
	if (game.buildings.Trap.locked || !canAffordBuilding('Trap')) {
		//If not building and not trapping
		if (!trapsReady && game.global.buildingsQueue.length === 0 && (game.global.playerGathering !== 'trimps' || game.buildings.Trap.owned === 0)) {
			//Gather food or wood
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

	//High Priority Trapping (doing Trapper or without breeding trimps)
	if (!scientistsAvailable && !minersAvailable && trapTrimpsOK && trappingIsRelevant && trapWontBeWasted && ((notFullPop && breedingTrimps < 4) || trapperTrapUntilFull)) {
		//Bait trimps if we have traps
		if (!lowOnTraps && !MODULES.gather.trapBuffering && game.buildings.Trap.owned > 0) {
			safeSetGather('trimps');
			return;
		}
		//Or build them, if they are on the queue
		else if (isBuildingInQueue('Trap') || safeBuyBuilding('Trap', 1)) {
			MODULES.gather.trapBuffering = true;
			safeSetGather('buildings');
			return;
		}
	}

	//Highest Priority Research if we have less science than needed to buy Battle, Miner and Scientists
	if (manualGather !== 3 && researchAvailable && ((needBattle || needScientists || needMiner) && game.resources.science.owned < 100)) {
		safeSetGather('science');
		return;
	}

	//Build if we don't have foremany, there are 2+ buildings in the queue, or if we can speed up something other than a trap
	if (!bwRewardUnlocked("Foremany") && game.global.buildingsQueue.length && (game.global.buildingsQueue.length > 1 || game.global.autoCraftModifier === 0 || (getPlayerModifier() > 100 && building !== 'Trap.1'))) {
		safeSetGather('buildings');
		return;
	}

	//Also Build if we have storage buildings on top of the queue
	if (!bwRewardUnlocked("Foremany") && game.global.buildingsQueue.length && building === 'Barn.1' || game.building === 'Shed.1' || building === 'Forge.1') {
		safeSetGather('buildings');
		return;
	}

	//Get coord if army size is not the problem.
	//Should only be a necessary thing when at z5 or below as that's where you'll be most resource starved
	var coordUpgrade = game.upgrades["Coordination"];
	if (game.global.world <= 5 && !coordUpgrade.locked && canAffordCoordinationTrimps()) {
		if (resolvePow(coordUpgrade.cost.resources.science, coordUpgrade) > game.resources.science.owned) { // Help with science.
			safeSetGather("science");
			return;
		}
		if (resolvePow(coordUpgrade.cost.resources.food, coordUpgrade) > game.resources.food.owned) { // Help with food.
			safeSetGather("food");
			return;
		}
		if (resolvePow(coordUpgrade.cost.resources.wood, coordUpgrade) > game.resources.wood.owned) { // Help with wood.
			safeSetGather("wood");
			return;
		}
		if (resolvePow(coordUpgrade.cost.resources.metal, coordUpgrade) > game.resources.metal.owned) { // Help with metal.
			safeSetGather("metal");
			return;
		}
	}

	//High Priority Research - When manual research still has more impact than scientists
	if (manualGather !== 3 && researchAvailable && needScience && getPlayerModifier() > getPerSecBeforeManual('Scientist') && game.resources.science.owned < 100) {
		safeSetGather('science');
		return;
	}

	if (hasTurkimp && game.global.mapsActive) {
		//Setting gather to the option selected in farming settings if it exists.
		if (mapSettings.gather !== undefined && mapSettings.gather !== null) {
			safeSetGather(mapSettings.gather);
			return;
		}

		//Setting gather to the setting that corresponds to your current map special.
		var currentBonus = getCurrentMapObject().bonus;
		if (currentBonus) {
			if (currentBonus.includes('sc') || currentBonus.includes('hc'))
				safeSetGather('food');
			else if (currentBonus.includes('wc'))
				safeSetGather('wood');
			else if (currentBonus.includes('mc') || currentBonus.includes('lc'))
				safeSetGather('metal');
			else if (manualGather !== 3 && currentBonus.includes('rc') && researchAvailable)
				safeSetGather('science');
			else
				safeSetGather('metal');
			return;
		}
	}

	//Gather resources for Miner
	if (needMiner && (game.resources.metal.owned < 100 || game.resources.wood.owned < 300)) {
		safeSetGather(game.resources.metal.owned < 100 ? "metal" : "wood");
		return;
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

	var manualResourceList = {
		'food': 'Farmer',
		'wood': 'Lumberjack',
		'metal': 'Miner',
	};
	var lowestResource = 'food';
	var lowestResourceRate = -1;
	var haveWorkers = true;
	for (var resource in manualResourceList) {
		var job = manualResourceList[resource];
		var currentRate = game.jobs[job].owned * game.jobs[job].modifier;
		if (document.getElementById(resource).style.visibility !== 'hidden') {
			if (currentRate === 0) {
				currentRate = game.resources[resource].owned;
				if ((haveWorkers) || (currentRate < lowestResourceRate)) {
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
		if (manualGather !== 3 && researchAvailable && game.global.turkimpTimer < 1 && haveWorkers && game.resources.science.owned < getPsString_AT('science', true) * MODULES["gather"].minScienceSeconds) {
			safeSetGather('science');
			return;
		}
		else {
			safeSetGather(lowestResource);
			return;
		}
	}
	else if (trapTrimpsOK && game.global.trapBuildToggled === true && lowOnTraps) {
		safeSetGather('buildings');
		return;
	}
	else {
		safeSetGather(lowestResource);
		return;
	}
}

//Mining/Building only setting
function autoGatherMetal() {
	if (game.global.buildingsQueue.length <= 1) {
		safeSetGather('metal');
	}
	else {
		safeSetGather('buildings')
	}
}