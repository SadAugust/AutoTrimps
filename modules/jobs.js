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

	const freeWorkers = _freeWorkers(owned, maxTrimps, employed);
	const flexibleWorkers = _flexibleWorkers();
	const notNeededBreeding = _workersNotNeededBreeding(owned, maxTrimps, employed);

	let availableWorkers = Math.min(Math.max(flexibleWorkers, notNeededBreeding), flexibleWorkers + freeWorkers);
	availableWorkers = _handleNoBreedChallenges(availableWorkers, owned, employed, maxSoldiers);

	const desiredRatios = _getDesiredRatios(forceRatios, jobType, jobSettings, maxTrimps);
	_handleJobRatios(desiredRatios, availableWorkers, maxTrimps);
}

function _employableWorkers(owned, maxTrimps) {
	return Math.min(Math.ceil(maxTrimps / 2), Math.floor(owned));
}

function _freeWorkers(owned, maxTrimps, employed) {
	return _employableWorkers(owned, maxTrimps) - employed;
}

function _flexibleWorkers() {
	const ratioWorkers = ['Farmer', 'Lumberjack', 'Miner', 'Scientist'];
	return ratioWorkers.reduce((total, worker) => total + game.jobs[worker].owned, 0);
}

function _workersNotNeededBreeding(owned, maxTrimps, employed) {
	if (!game.upgrades.Battle.done) return maxTrimps;

	const breeding = owned - employed;
	const multitasking = employed * game.permaBoneBonuses.multitasking.mult();
	const neededBreeding = Math.min(maxTrimps/3, breeding + multitasking);

	let excess = breeding + multitasking - neededBreeding;
	excess /= (1 - game.permaBoneBonuses.multitasking.mult());

	return employed + excess;
}

function _handleNoBreedChallenges(freeWorkers, owned, employed, maxSoldiers) {
	if (!noBreedChallenge()) return freeWorkers;

	const ratioWorkers = ['Farmer', 'Lumberjack', 'Miner', 'Scientist'];
	const ratioWorkerCount = ratioWorkers.reduce((total, worker) => total + game.jobs[worker].owned, 0);

	freeWorkers = owned - employed + ratioWorkerCount;
	if ((!game.global.fighting || game.global.soldierHealth <= 0) && freeWorkers > maxSoldiers) freeWorkers -= maxSoldiers;

	if (getPageSetting('trapper')) {
		const trappaCoordToggle = getPageSetting('trapperCoordStyle');
		const { done, allowed } = game.upgrades.Coordination;
		const nextCoordCost = Math.ceil(1.25 * maxSoldiers) - maxSoldiers;

		if (trappaCoordToggle === 0) {
			let coordTarget = getPageSetting('trapperCoords') - 1;
			if (!game.global.runningChallengeSquared && coordTarget <= 0) coordTarget = trimps.currChallenge === 'Trapper' ? 32 : 49;
			const canBuyCoordination = done < coordTarget && done !== allowed;
			if (freeWorkers > nextCoordCost && canBuyCoordination) freeWorkers -= nextCoordCost;
		}

		if (trappaCoordToggle === 1) {
			const armyTarget = getPageSetting('trapperArmySize');
			const shouldBuyCoord = armyTarget > game.resources.trimps.maxSoldiers * 1.25;
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

	//Save for important upgrades
	const upgrades = ['Bounty', 'Efficiency', 'Speedfarming', 'Speedlumber', 'Megafarming', 'Megalumber', 'Coordination', 'Blockmaster', 'TrainTacular', 'Potency'];
	if (upgrades.some((up) => shouldSaveForSpeedUpgrade(game.upgrades[up]))) return;

	//Extra priority to the first few trainers
	const { cost, owned } = game.jobs.Trainer;
	const firstTrainers = owned < 7 && hdStats.hitsSurvived < Infinity;
	const basePercent = Math.max(75, jobSettings.Trainer.percent);
	const percent = (firstTrainers && jobSettings.Trainer.percent > 0) ? basePercent - ((basePercent - jobSettings.Trainer.percent) * owned / 7) : jobSettings.Trainer.percent;

	const affordableTrainers = getMaxAffordable(cost.food[0] * Math.pow(cost.food[1], owned), game.resources.food.owned * (percent / 100), cost.food[1], true);

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
	const conditions = [
		{ condition: () => game.global.world >= 150, ratio: 4098 },
		{ condition: () => game.global.world >= 120, ratio: 1024 },
		{ condition: () => game.global.world >= 90, ratio: 256 },
		{ condition: () => game.global.world >= 65, ratio: 64 },
		{ condition: () => game.global.world >= 50, ratio: 16 },
		{ condition: () => game.global.turkimpTimer > 0, ratio: 2 },
		{ condition: () => maxTrimps >= 400, ratio: 4 },
		{ condition: () => true, ratio: 5 }
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
