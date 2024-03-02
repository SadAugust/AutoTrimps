function safeBuyJob(jobTitle, amount) {
	if (!Number.isFinite(amount) || amount === 0 || game.jobs[jobTitle].locked) return;

	const percentWorker = ['Explorer', 'Trainer', 'Magmamancer', 'Meteorologist', 'Worshipper'].includes(jobTitle);
	const freeWorkers = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed;
	if (!percentWorker && amount > 0 && freeWorkers <= 0) return;

	const { firing, buyAmt } = game.global;
	game.global.firing = amount < 0;
	amount = Math.abs(amount);
	if (!game.global.firing && !percentWorker) amount = Math.min(amount, freeWorkers);

	game.global.buyAmt = amount;
	let result = game.global.firing || canAffordJobCheck(jobTitle, amount);

	if (!result) {
		game.global.buyAmt = 'Max';
		game.global.maxSplit = 1;
		amount = calculateMaxAfford(jobTitle, false, false, true);
		result = canAffordJobCheck(jobTitle, amount);
	}

	if (result) {
		buyJob(jobTitle, true, true);
		debug(`${game.global.firing ? 'Firing' : 'Hiring'} ${prettify(amount)} ${jobTitle}${addAnS(amount)}`, 'jobs', '*users');
	}

	if (game.global.firing !== firing) _toggleFireMode();
	game.global.buyAmt = buyAmt;
}

function canAffordJobCheck(what, amt) {
	const job = game.jobs[what];
	if (job.max <= job.owned) return false;

	if (game.global.buyAmt === 'Max') {
		amt = calculateMaxAfford(job, false, false, true);
	}

	return Object.keys(job.cost).every((costItem) => checkJobItem(what, false, costItem, null, amt));
}

function _toggleFireMode() {
	game.global.firing = !game.global.firing;
	const elem = document.getElementById('fireBtn');
	const firingClass = game.global.firing ? 'fireBtnFiring' : 'fireBtnNotFiring';
	const notFiringClass = game.global.firing ? 'fireBtnNotFiring' : 'fireBtnFiring';
	const buttonText = game.global.firing ? 'Firing' : 'Fire';

	elem.className = elem.className.replace(notFiringClass, firingClass);
	elem.innerHTML = buttonText;
}

function fireAllWorkers() {
	['Farmer', 'Lumberjack', 'Miner', 'Scientist'].forEach((job) => {
		if (game.jobs[job].owned > 0) safeBuyJob(job, -game.jobs[job].owned);
	});
}

function buyJobs(forceRatios) {
	const jobType = getPageSetting('jobType');
	if (game.jobs.Farmer.locked || game.resources.trimps.owned === 0 || jobType === 0) return;

	if (!game.global.fighting && challengeActive('Archaeology') && breedTimeRemaining().cmp(0.1) > 0) {
		fireAllWorkers();
		return;
	}

	const jobSettings = getPageSetting('jobSettingsArray');
	_buyRatioJobs(jobSettings);

	const maxTrimps = game.resources.trimps.realMax();
	const maxSoldiers = game.resources.trimps.getCurrentSend();
	const { owned, employed } = game.resources.trimps;
	if (!game.options.menu.fireForJobs.enabled) game.options.menu.fireForJobs.enabled = 1;

	let freeWorkers = _calculateFreeWorkers(owned, maxTrimps, employed);
	freeWorkers = Math.min(freeWorkers, _employableTrimps(owned, maxTrimps, employed));
	freeWorkers = _handleNoBreedChallenges(freeWorkers, owned, employed, maxSoldiers);

	const desiredRatios = _getDesiredRatios(forceRatios, jobType, jobSettings, maxTrimps);
	_handleJobRatios(desiredRatios, freeWorkers, maxTrimps);
}

function _calculateCurrentlyFreeWorkers(owned, maxTrimps, employed) {
	return Math.ceil(Math.min(maxTrimps / 2, owned)) - employed;
}

function _calculateFreeWorkers(owned, maxTrimps, employed) {
	const currentFreeWorkers = _calculateCurrentlyFreeWorkers(owned, maxTrimps, employed);
	const ratioWorkers = ['Farmer', 'Lumberjack', 'Miner', 'Scientist'];
	const ratioWorkerCount = ratioWorkers.reduce((total, worker) => total + game.jobs[worker].owned, 0);

	return currentFreeWorkers + ratioWorkerCount;
}

function _employableTrimps(owned, maxTrimps, employed) {
	const breedingTrimps = owned - trimpsEffectivelyEmployed();
	if (!game.upgrades.Battle.done) return owned;

	let employable = Math.ceil((breedingTrimps - maxTrimps / 3) / (1 - game.permaBoneBonuses.multitasking.mult()));

	return employed + Math.max(0, Math.min(employable, owned));
}

function _handleNoBreedChallenges(freeWorkers, owned, employed, maxSoldiers) {
	if (!noBreedChallenge()) return freeWorkers;

	const ratioWorkers = ['Farmer', 'Lumberjack', 'Miner', 'Scientist'];
	const ratioWorkerCount = ratioWorkers.reduce((total, worker) => total + game.jobs[worker].owned, 0);

	freeWorkers = owned - employed + ratioWorkerCount;
	if ((!game.global.fighting || game.global.soldierHealth <= 0) && freeWorkers > maxSoldiers) freeWorkers -= maxSoldiers;

	if (getPageSetting('trapper')) {
		const trappaCoordToggle = 1; //getPageSetting('trapperCoordsToggle');
		let coordTarget = getPageSetting('trapperCoords');
		const { done, allowed } = game.upgrades.Coordination;
		const nextCoordCost = Math.ceil(1.25 * maxSoldiers) - maxSoldiers;

		if (trappaCoordToggle === 1) {
			coordTarget--;
			if (!game.global.runningChallengeSquared && coordTarget <= 0) coordTarget = trimps.currChallenge === 'Trapper' ? 32 : 49;
			const canBuyCoordination = done < coordTarget && done !== allowed;
			if (freeWorkers > nextCoordCost && canBuyCoordination) freeWorkers -= nextCoordCost;
		}

		if (trappaCoordToggle === 2) {
			const shouldBuyCoord = coordTarget > game.resources.trimps.maxSoldiers * 1.25;
			if (freeWorkers > nextCoordCost && done !== allowed && shouldBuyCoord) freeWorkers -= nextCoordCost;
		}
	}

	const reserveMod = 1 + game.resources.trimps.owned / 1e8;
	freeWorkers -= game.resources.trimps.owned > 1e6 ? reserveMod : 0;

	return freeWorkers;
}

function _buyRatioJobs(jobSettings) {
	_buyExplorer(jobSettings);

	if (game.global.universe === 1) {
		_buyTrainer(jobSettings);
		_buyMagmamancer(jobSettings);
	}

	if (game.global.universe === 2) {
		_buyMeteorologist(jobSettings);
		_buyWorshipper(jobSettings);
	}
}

function _buyExplorer(jobSettings) {
	if (game.jobs.Explorer.locked || !jobSettings.Explorer.enabled || mapSettings.mapName === 'Tribute Farm') return;

	const { cost, owned } = game.jobs.Explorer;
	const affordableExplorers = getMaxAffordable(cost.food[0] * Math.pow(cost.food[1], owned), game.resources.food.owned * (jobSettings.Explorer.percent / 100), cost.food[1], true);

	if (affordableExplorers > 0) safeBuyJob('Explorer', affordableExplorers);
}

function _buyTrainer(jobSettings) {
	if (game.jobs.Trainer.locked || !jobSettings.Trainer.enabled) return;

	const { cost, owned } = game.jobs.Trainer;
	const affordableTrainers = getMaxAffordable(cost.food[0] * Math.pow(cost.food[1], owned), game.resources.food.owned * (jobSettings.Trainer.percent / 100), cost.food[1], true);

	if (affordableTrainers > 0) safeBuyJob('Trainer', affordableTrainers);
}

function _buyMagmamancer(jobSettings) {
	if (game.jobs.Magmamancer.locked || !jobSettings.Magmamancer.enabled) return;

	let timeOnZone = Math.floor((Date.now() - game.global.zoneStarted) / 60000);
	timeOnZone += game.talents.magmamancer.purchased ? 5 : 0;
	timeOnZone += game.talents.stillMagmamancer.purchased ? game.global.spireRows : 0;

	if (timeOnZone < 10) return;

	const { cost, owned } = game.jobs.Magmamancer;
	const affordableMagmamancer = getMaxAffordable(cost.gems[0] * Math.pow(cost.gems[1], owned), game.resources.gems.owned * (jobSettings.Magmamancer.percent / 100), cost.gems[1], true);

	if (affordableMagmamancer > 0) safeBuyJob('Magmamancer', affordableMagmamancer);
}

function _buyMeteorologist(jobSettings) {
	if (game.jobs.Meteorologist.locked || (!jobSettings.Meteorologist.enabled && !mapSettings.shouldMeteorologist) || runningAncientTreasure()) return;

	const { cost, owned } = game.jobs.Meteorologist;
	const costMult = mapSettings.shouldMeteorologist ? 1 : jobSettings.Meteorologist.percent / 100;
	let affordableMets = getMaxAffordable(cost.food[0] * Math.pow(cost.food[1], owned), game.resources.food.owned * costMult, cost.food[1], true);
	if (mapSettings.shouldMeteorologist && mapSettings.ancientTreasure && mapSettings.totalCost > game.resources.food.owned) affordableMets = 0;

	if (affordableMets > 0 && !mapSettings.shouldTribute) safeBuyJob('Meteorologist', affordableMets);
}

function _buyWorshipper(jobSettings) {
	if (game.jobs.Worshipper.locked || !jobSettings.Worshipper.enabled) return;

	const { owned, getCost } = game.jobs.Worshipper;
	const costMult = mapSettings.mapName !== 'Worshipper Farm' ? jobSettings.Worshipper.percent / 100 : 1;
	const affordableShips = Math.min(Math.floor((game.resources.food.owned / getCost()) * costMult), 50 - owned);

	if (affordableShips > 0) safeBuyJob('Worshipper', affordableShips);
}

function _getDesiredRatios(forceRatios, jobType, jobSettings, maxTrimps) {
	const ratioWorkers = ['Farmer', 'Lumberjack', 'Miner', 'Scientist'];
	const overrideRatio = forceRatios || (getPageSetting('autoMaps') > 0 && mapSettings.jobRatio && mapSettings.jobRatio !== '-1');
	let desiredRatios = [0, 0, 0, 0];

	if (overrideRatio) {
		const workerRatios = (forceRatios || mapSettings.jobRatio).split(',');
		desiredRatios = ratioWorkers.map((_, i) => (!workerRatios[i] ? 0 : Number(workerRatios[i])));
	} else {
		desiredRatios = jobType === 2 ? ratioWorkers.map((worker) => (!jobSettings[worker] || !jobSettings[worker].enabled ? 0 : Number(jobSettings[worker].ratio))) : _getAutoJobRatio(maxTrimps);
	}

	if (challengeActive('Metal') || challengeActive('Transmute')) {
		if (!game.jobs.Lumberjack.locked) desiredRatios[1] += desiredRatios[2];
		else desiredRatios[0] += desiredRatios[2];
		desiredRatios[2] = 0;
	}

	const scienceNeeded = getUpgradeCosts().science;
	const isScienceNeeded = scienceNeeded > 0 && scienceNeeded > game.resources.science.owned;
	const scientistMod = desiredRatios[3] !== 0 || (maxTrimps >= 1e5 && isScienceNeeded) ? 1 : _getScientistRatio(maxTrimps);

	ratioWorkers.forEach((worker, workerIndex) => {
		if (!game.jobs[worker].locked) {
			if (worker === 'Scientist') {
				if (desiredRatios[workerIndex] === 0) desiredRatios[workerIndex] = 1;
			} else {
				desiredRatios[workerIndex] = scientistMod * parseFloat(desiredRatios[workerIndex]);
			}
		} else {
			desiredRatios[workerIndex] = 0;
		}
	});

	if (game.global.universe === 2 && !overrideRatio) {
		if (jobSettings.FarmersUntil.enabled && game.global.world >= jobSettings.FarmersUntil.zone) desiredRatios[0] = 0;
		if (jobSettings.NoLumberjacks.enabled && !game.mapUnlocks.SmithFree.canRunOnce) desiredRatios[1] = 0;
	}

	return desiredRatios;
}

function _getScientistRatio(maxTrimps) {
	const scientistRatios = { earlyTurkimp: 2, early: 5, pop400: 4, z50: 16, z65: 64, z90: 256, z120: 1024, z150: 4098 };

	const conditions = [
		{ condition: () => game.global.world >= 150, ratio: scientistRatios.z150 },
		{ condition: () => game.global.world >= 120, ratio: scientistRatios.z120 },
		{ condition: () => game.global.world >= 90, ratio: scientistRatios.z90 },
		{ condition: () => game.global.world >= 65, ratio: scientistRatios.z65 },
		{ condition: () => game.global.world >= 50, ratio: scientistRatios.z50 },
		{ condition: () => game.global.turkimpTimer > 0, ratio: scientistRatios.earlyTurkimp },
		{ condition: () => maxTrimps >= 400, ratio: scientistRatios.pop400 },
		{ condition: () => true, ratio: scientistRatios.early }
	];

	return conditions.find(({ condition }) => condition()).ratio;
}

function _getAutoJobRatio(maxTrimps) {
	const conditions = [
		{ condition: () => game.global.StaffEquipped.rarity !== undefined && game.global.StaffEquipped.rarity >= 10 && game.global.universe !== 1, ratio: [1, 1, 1, 0] },
		{ condition: () => game.global.world >= 300, ratio: [1, 1, 100, 0] },
		{ condition: () => game.buildings.Tribute.owned > 3000 && mutations.Magma.active(), ratio: [1, 7, 12, 0] },
		{ condition: () => game.buildings.Tribute.owned > 1500, ratio: [1, 2, 22, 0] },
		{ condition: () => game.buildings.Tribute.owned > 1000, ratio: [1, 1, 10, 0] },
		{ condition: () => maxTrimps > 3000000, ratio: [3, 1, 4, 0] },
		{ condition: () => maxTrimps > 300000, ratio: [3, 3, 5, 0] },
		{ condition: () => game.global.mapsActive && !game.mapUnlocks.Shieldblock.canRunOnce, ratio: [1, 1.5, 2, 0] },
		{ condition: () => game.global.mapsActive, ratio: [1, 1, 2, 0] },
		{ condition: () => challengeActive('Metal') || challengeActive('Transmute'), ratio: [4, 5, 0, 0] },
		{ condition: () => true, ratio: [1, 1, 1, 0] }
	];

	return conditions.find(({ condition }) => condition()).ratio;
}

function _handleJobRatios(desiredRatios, freeWorkers, maxTrimps) {
	const ratioWorkers = ['Farmer', 'Lumberjack', 'Miner', 'Scientist'];
	const hireWorkers = desiredRatios.map((ratio) => ratio > 0);

	const totalFraction = desiredRatios.reduce((a, b) => a + b, 0) || 1;

	//Calculates both the decimal and the floored number of desired workers
	const fDesiredWorkers = desiredRatios.map((r) => (r * freeWorkers) / totalFraction);
	let desiredWorkers = fDesiredWorkers.map((w) => Math.floor(w));

	//Calculates how many workers will be left out of the initial distribution
	const remainder = freeWorkers > 10e6 ? 0 : freeWorkers - desiredWorkers.reduce((partialSum, value) => partialSum + value, 0);

	//Decides where to put them
	const diff = fDesiredWorkers.map((w, idx) => w - desiredWorkers[idx]);
	const whereToIncrement = argSort(diff, true).slice(diff.length - remainder);
	whereToIncrement.forEach((idx) => (hireWorkers[idx] ? desiredWorkers[idx]++ : null)); //TODO Fix hireWorkers messing with the remainder

	//Calculates the actual number of workers to buy or fire
	desiredWorkers = desiredWorkers.map((w, idx) => w - game.jobs[ratioWorkers[idx]].owned);

	//Prevents scientist from being fired very early on
	if (desiredWorkers[3] === -1 && maxTrimps < 400 && remainder > 0) {
		desiredWorkers[whereToIncrement[0]]--;
		desiredWorkers[3]++;
	}

	let totalWorkerCost = desiredWorkers.reduce((partialSum, w, idx) => partialSum + (w > 0 ? w * game.jobs[ratioWorkers[idx]].cost.food : 0), 0);

	if (totalWorkerCost > game.resources.food.owned) {
		const totalWorkersOwned = ratioWorkers.reduce((total, worker) => total + game.jobs[worker].owned, 0);
		const maxWorkersToHire = Math.max(Math.floor(freeWorkers / 10), freeWorkers - totalWorkersOwned);
		const farmersToHire = Math.max(calculateMaxAfford('Farmer', false, false, true), maxWorkersToHire + 1 - game.jobs.Farmer.owned);
		if (farmersToHire > game.jobs.Farmer.owned) {
			_freeWorkspaces(farmersToHire);
			safeBuyJob('Farmer', farmersToHire);
		}
	} else {
		desiredWorkers.forEach((amount, index) => {
			if (amount < 0) safeBuyJob(ratioWorkers[index], amount);
		});

		desiredWorkers.forEach((amount, index) => {
			if (amount > 0) safeBuyJob(ratioWorkers[index], amount);
		});
	}
}

function _freeWorkspaces(amount = 1) {
	const jobs = ['Miner', 'Lumberjack'];
	const toCheck = jobs.filter((job) => game.jobs[job].owned >= amount);
	if (toCheck.length === 0) return;

	const selected = toCheck[Math.floor(Math.random() * toCheck.length)];
	game.jobs[selected].owned -= amount;
}
