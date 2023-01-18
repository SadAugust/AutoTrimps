//updated
MODULES["gather"] = {};
//These can be changed (in the console) if you know what you're doing:
MODULES["gather"].minScienceSeconds = 60;

//Global flags
var trapBuffering = false, maxTrapBuffering = false;
var maxZoneDuration = 0;

//Traps per second
function calcTPS() {
	return Math.min(10, game.global.playerModifier / 5);
}

function calcMaxTraps() {
	//Tries to keep in mind the longest duration any zone has lasted in this portal
	var time = getZoneSeconds();
	if (game.global.world == 1) maxZoneDuration = time;
	if (time > maxZoneDuration) maxZoneDuration = time;

	//Return enough traps to last 1/4 of the longest duration zone we've seen so far
	return Math.ceil(calcTPS() * maxZoneDuration / 4);
}

function safeSetGather(resource) {
	if (!resource)
		return false;

	if (game.global.playerGathering !== resource) {
		setGather(resource);
	}
	return true;
}

//Gather selection
function autoGather() {

	var manualGather = game.global.universe === 1 ? getPageSetting('ManualGather2') : getPageSetting('RManualGather2');

	if (manualGather === 0) return;

	//Setting it to use mining/building only!
	if (manualGather === 2 && document.getElementById('metalCollectBtn').style.display != 'none' && document.getElementById('metal').style.visibility != 'hidden') {
		autoGatherMetal();
		return;
	}

	//Need to check this works in u2!
	var notFullPop = game.resources.trimps.owned < game.resources.trimps.realMax();
	var trapperTrapUntilFull = (challengeActive('Trapper') || challengeActive('Trappapalooza')) && notFullPop;
	var trapsBufferSize = Math.ceil(5 * calcTPS());
	var minTraps = Math.ceil(calcTPS());
	var maxTraps = calcMaxTraps();
	var trapTrimpsOK = (!game.upgrades.Battle.done || (game.global.universe === 1 ? getPageSetting('TrapTrimps') : getPageSetting('RTrapTrimps'))) && (trapperTrapUntilFull || game.jobs.Geneticist.owned == 0);

	//Vars
	var lowOnTraps = game.buildings.Trap.owned < minTraps;
	var trapsReady = game.buildings.Trap.owned >= minTraps + trapsBufferSize;
	var fullOfTraps = game.buildings.Trap.owned >= maxTraps;
	var maxTrapsReady = game.buildings.Trap.owned >= maxTraps + trapsBufferSize;
	if (lowOnTraps) trapBuffering = true;
	if (trapsReady) trapBuffering = false;
	if (maxTrapsReady) maxTrapBuffering = false;

	// Init - Science
	var firstFightOK = game.global.world > 1 || game.global.lastClearedCell >= 0;
	var researchAvailable = document.getElementById('scienceCollectBtn').style.display != 'none' && document.getElementById('science').style.visibility != 'hidden';
	var scienceAvailable = document.getElementById('science').style.visibility != 'hidden';
	var needBattle = !game.upgrades.Battle.done && game.resources.science.owned < 10;
	var needScience = game.resources.science.owned < scienceNeeded;
	var needScientists = firstFightOK && !challengeActive('Scientist') && !game.upgrades.Scientists.done && game.resources.science.owned < 100 && scienceAvailable;

	//Init - Others
	var needMiner = firstFightOK && (!challengeActive('Metal') && !challengeActive('Transmute')) && !game.upgrades.Miners.done;
	var breedingTrimps = game.resources.trimps.owned - trimpsEffectivelyEmployed();
	var hasTurkimp = game.talents.turkimp2.purchased || game.global.turkimpTimer > 0;

	//Verifies if trapping is still relevant
	//Relevant means we gain at least 10% more trimps per sec while trapping (which basically stops trapping during later zones)
	//And there is enough breed time remaining to open an entire trap (prevents wasting time and traps during early zones)
	var trappingIsRelevant = trapperTrapUntilFull || breedingPS().div(10).lt(calcTPS() * (game.portal.Bait.level + 1));
	var trapWontBeWasted = breedTimeRemaining().gte(1 / calcTPS()) || game.global.playerGathering == "trimps" && breedTimeRemaining().lte(DecimalBreed(0.1));

	//Highest Priority Food/Wood for traps (Early Game, when trapping is mandatory)
	if (game.global.world <= 3 &&
		(game.global.universe === 1 ? (game.global.totalHeliumEarned <= 500000) :
			(game.global.totalRadonEarned <= 5000))
	) {
		//If not building and not trapping
		if (!trapsReady && game.global.buildingsQueue.length == 0 && (game.global.playerGathering != 'trimps' || game.buildings.Trap.owned == 0)) {
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
	if (trapTrimpsOK && trappingIsRelevant && trapWontBeWasted && ((notFullPop && breedingTrimps < 4) || trapperTrapUntilFull)) {
		//Bait trimps if we have traps
		if (!lowOnTraps && !trapBuffering) {
			safeSetGather('trimps');
			return;
		}

		//Or build them, if they are on the queue
		else if (isBuildingInQueue('Trap') || safeBuyBuilding('Trap', 1)) {
			trapBuffering = true;
			safeSetGather('buildings');
			return;
		}
	}


	//Build if we don't have foremany, there are 2+ buildings in the queue, or if we can speed up something other than a trap
	if (!bwRewardUnlocked("Foremany") && game.global.buildingsQueue.length && (game.global.buildingsQueue.length > 1 || game.global.autoCraftModifier == 0 || (getPlayerModifier() > 100 && game.global.buildingsQueue[0] != 'Trap.1'))) {
		safeSetGather('buildings');
		return;
	}

	//Also Build if we have storage buildings on top of the queue
	if (!bwRewardUnlocked("Foremany") && game.global.buildingsQueue.length && game.global.buildingsQueue[0] == 'Barn.1' || game.global.buildingsQueue[0] == 'Shed.1' || game.global.buildingsQueue[0] == 'Forge.1') {
		safeSetGather('buildings');
		return;
	}

	//Highest Priority Research if we have less science than needed to buy Battle, Miner and Scientists
	if (manualGather != 3 && researchAvailable && (needBattle || needScientists || needMiner && game.resources.science.owned < 60)) {
		safeSetGather('science');
		return;
	}

	if (hasTurkimp && game.global.mapsActive) {
		//Setting gather to the option selected in farming settings if it exists.
		if (rMapSettings.gather !== undefined && rMapSettings.gather !== null) {
			safeSetGather(rMapSettings.gather);
			return;
		}

		//Setting gather to the setting that corresponds to your current map special.
		currentBonus = getCurrentMapObject().bonus;
		if (currentBonus) {
			if (currentBonus.includes('sc') || currentBonus.includes('hc'))
				safeSetGather('food');
			else if (currentBonus.includes('wc'))
				safeSetGather('wood');
			else if (currentBonus.includes('mc') || currentBonus.includes('lc'))
				safeSetGather('metal');
			else if (manualGather != 3 && currentBonus.includes('rc'))
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

	//High Priority Metal gathering for Metal Challenge
	if (challengeActive('Metal') && !game.global.mapsUnlocked) {
		safeSetGather('metal');
		return;
	}

	//Mid Priority Trapping
	if (trapTrimpsOK && trappingIsRelevant && trapWontBeWasted && notFullPop && !lowOnTraps && !trapBuffering) {
		safeSetGather('trimps');
		return;
	}

	//High Priority Research - When manual research still has more impact than scientists
	if (manualGather != 3 && researchAvailable && needScience && getPlayerModifier() > getPerSecBeforeManual('Scientist')) {
		safeSetGather('science');
		return;
	}

	//High Priority Trap Building
	if (trapTrimpsOK && trappingIsRelevant && canAffordBuilding('Trap', false, false, false, false, 1) && (lowOnTraps || trapBuffering)) {
		trapBuffering = true;
		safeBuyBuilding('Trap', 1);
		safeSetGather('buildings');
		return;
	}

	//Metal if Turkimp is active
	if (hasTurkimp) {
		if (!challengeActive('Transmute'))
			safeSetGather('metal');
		else
			safeSetGather('food');
		return;
	}

	//Mid Priority Research
	if (manualGather != 3 && researchAvailable && needScience) {
		safeSetGather('science');
		return;
	}

	//Low Priority Trap Building
	if (trapTrimpsOK && trappingIsRelevant && canAffordBuilding('Trap', false, false, false, false, 1) && (!fullOfTraps || maxTrapBuffering)) {
		trapBuffering = !fullOfTraps;
		maxTrapBuffering = true;
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
		if (document.getElementById(resource).style.visibility != 'hidden') {
			if (currentRate === 0) {
				currentRate = game.resources[resource].owned;
				if ((haveWorkers) || (currentRate < lowestResourceRate)) {
					haveWorkers = false;
					lowestResource = resource;
					lowestResourceRate = currentRate;
				}
			}
			if ((currentRate < lowestResourceRate || lowestResourceRate == -1) && haveWorkers) {
				lowestResource = resource;
				lowestResourceRate = currentRate;
			}
		}
	}
	if (challengeActive('Transmute') && game.global.playerGathering != lowestResource && !haveWorkers && !breedFire) {
		if (hasTurkimp)
			safeSetGather('food');
		else
			safeSetGather(lowestResource);
	} else if (document.getElementById('scienceCollectBtn').style.display != 'none' && document.getElementById('science').style.visibility != 'hidden') {
		if (game.resources.science.owned < getPsStringLocal('science', true) * MODULES["gather"].minScienceSeconds && game.global.turkimpTimer < 1 && haveWorkers)
			safeSetGather('science');
		else if (challengeActive('Transmute') && hasTurkimp)
			safeSetGather('food');
		else
			safeSetGather(lowestResource);
	}
	else if (trapTrimpsOK && game.global.trapBuildToggled == true && lowOnTraps)
		safeSetGather('buildings');
	else
		safeSetGather(lowestResource);
}

//Mining/Building only setting
function autoGatherMetal() {
	if (game.global.buildingsQueue.length <= 1) {
		safeSetGather(!challengeActive('Transmute') ? 'metal' : 'food');
	}
	else {
		safeSetGather('buildings')
	}
}