MODULES.jobs = {
	scientist: { ratio: 8, ratio2: 4, ratio3: 16, ratio4: 64, ratio5: 256, ratio6: 1024, ratio7: 4098, },
	autoRatio: { ratioHaz: [1, 1, 1], ratio7: [1, 1, 98], ratio6: [1, 7, 12], ratio5: [1, 2, 22], ratio4: [1, 1, 10], ratio3: [3, 1, 4], ratio2: [3, 3, 5], ratio1: [1.1, 1.15, 1.2], },
}

function safeBuyJob(jobTitle, amount) {
	if (!Number.isFinite(amount) || amount === 0 || typeof amount === 'undefined' || Number.isNaN(amount)) {
		return false;
	}
	if (game.jobs[jobTitle].locked) debug(`Trying to buy locked job: ${jobTitle}. Please report this.`);
	var freeWorkers = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed;
	var fireState = game.global.firing;
	var result;
	const currBuyAmt = game.global.buyAmt;
	if (amount < 0) {
		amount = Math.abs(amount);
		game.global.firing = true;
		game.global.buyAmt = amount;
		result = true;
	} else {
		game.global.firing = false;
		game.global.buyAmt = amount;
		result = canAffordJob(jobTitle, false);
		if (!result) {
			game.global.buyAmt = 'Max';
			game.global.maxSplit = 1;
			result = canAffordJob(jobTitle, false) && freeWorkers > 0;
		}
	}
	if (result) {
		debug((game.global.firing ? 'Firing ' : 'Hiring ') + prettify(amount) + ' ' + jobTitle + (amount > 1 ? 's' : ''), "jobs", "*users");
		buyJob(jobTitle, true, true);
		if (game.global.firing && !fireState) fireMode_AT();
		if (!game.global.firing && fireState) fireMode_AT();
	}
	game.global.buyAmt = currBuyAmt;
	return true;
}

function workerRatios(workerRatio) {
	var workerRatio = !workerRatio ? null : workerRatio
	if (workerRatio === null) return;

	const jobSetting = getPageSetting('jobType');

	if (jobSetting === 2) {
		var jobSettings = getPageSetting('jobSettingsArray');
		if (jobSettings[workerRatio].enabled)
			return jobSettings[workerRatio].ratio;
		else
			return 0;
	}

	var ratioSet;

	if (game.global.StaffEquipped.rarity !== undefined && game.global.StaffEquipped.rarity >= 10 && game.global.universe !== 1) {
		ratioSet = MODULES["jobs"].autoRatio.ratioHaz;
	} else if (game.global.world >= 300) {
		ratioSet = MODULES["jobs"].autoRatio.ratio7;
	} else if (game.buildings.Tribute.owned > 3000 && mutations.Magma.active()) {
		ratioSet = MODULES["jobs"].autoRatio.ratio6;
	} else if (game.buildings.Tribute.owned > 1500) {
		ratioSet = MODULES["jobs"].autoRatio.ratio5;
	} else if (game.buildings.Tribute.owned > 1000) {
		ratioSet = MODULES["jobs"].autoRatio.ratio4;
	} else if (game.resources.trimps.realMax() > 3000000) {
		ratioSet = MODULES["jobs"].autoRatio.ratio3;
	} else if (game.resources.trimps.realMax() > 300000) {
		ratioSet = MODULES["jobs"].autoRatio.ratio2;
	} else if (challengeActive('Metal') || challengeActive('Transmute')) {
		ratioSet = [4, 5, 0];
	} else if (game.global.world < 5) {
		ratioSet = [1.5, 0.7, 1];
	}
	else {
		ratioSet = MODULES["jobs"].autoRatio.ratio1;
	}

	if (workerRatio.includes('Farmer')) return ratioSet[0]
	else if (workerRatio.includes('Lumber')) return ratioSet[1]
	else if (workerRatio.includes('Miner')) return ratioSet[2]
}

function fireMode_AT() {
	game.global.firing = !game.global.firing;
	var elem = document.getElementById("fireBtn");
	if (game.global.firing) {
		elem.className = elem.className.replace("fireBtnNotFiring", "fireBtnFiring");
		elem.innerHTML = "Firing";
	} else {
		elem.className = elem.className.replace("fireBtnFiring", "fireBtnNotFiring");
		elem.innerHTML = "Fire";
	}
}

//Fires all workers to ensure we can do things like respec
function fireAllWorkers() {
	if (game.jobs.Farmer.owned > 0)
		safeBuyJob('Farmer', -game.jobs.Farmer.owned);

	if (game.jobs.Lumberjack.owned > 0)
		safeBuyJob('Lumberjack', -game.jobs.Lumberjack.owned);

	if (game.jobs.Miner.owned > 0)
		safeBuyJob('Miner', -game.jobs.Miner.owned);

	if (game.jobs.Scientist.owned > 0)
		safeBuyJob('Scientist', -game.jobs.Scientist.owned);
}

function buyJobs(forceRatios) {

	if (game.jobs.Farmer.locked || game.resources.trimps.owned === 0) return;

	//Disabling autoJobs if AT AutoJobs is disabled.
	if (getPageSetting('jobType') === 0) return;

	var jobSettings = getPageSetting('jobSettingsArray');
	var freeWorkers = Math.ceil(Math.min(game.resources.trimps.realMax() / 2), game.resources.trimps.owned) - (game.resources.trimps.employed);

	var canBreed = !challengeActive('Trapper') && !challengeActive('Trappapalooza');
	var breedingTrimps = !canBreed ? Infinity : game.resources.trimps.owned - trimpsEffectivelyEmployed();

	//Enables Firing for Jobs. It's a setting that will save hassle later by forcing it to be enalbed.
	if (!game.options.menu.fireForJobs.enabled) game.options.menu.fireForJobs.enabled = 1;

	//Check breeding trimps and if we can have enough breeding then purchase workers.
	if (canBreed && game.resources.trimps.owned < game.resources.trimps.realMax() * 0.9) {
		if (breedingTrimps > game.resources.trimps.realMax() * 0.33) {
			freeWorkers = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed;
			if (freeWorkers > 0 && game.resources.trimps.realMax() <= 3e5) {
				if (!game.jobs.Miner.locked) safeBuyJob('Miner', 1);
				safeBuyJob('Farmer', 1);
				safeBuyJob('Lumberjack', 1);
			}
		}
		return;
	}

	//Do non-ratio/limited jobs first
	//Explorers
	if (jobSettings.Explorer.enabled && mapSettings.mapName !== 'Tribute Farm') {
		if (!game.jobs.Explorer.locked) {
			var affordableExplorers = getMaxAffordable(
				game.jobs.Explorer.cost.food[0] * Math.pow(game.jobs.Explorer.cost.food[1], game.jobs.Explorer.owned),
				game.resources.food.owned * (jobSettings.Explorer.percent / 100),
				game.jobs.Explorer.cost.food[1],
				true
			);
			if (affordableExplorers > 0) {
				safeBuyJob('Explorer', affordableExplorers);
				freeWorkers -= affordableExplorers;
			}
		}
	}

	if (game.global.universe === 1) {
		//Trainers
		if (!game.jobs.Trainer.locked && jobSettings.Trainer.enabled) {
			var affordableTrainers = getMaxAffordable(
				game.jobs.Trainer.cost.food[0] * Math.pow(game.jobs.Trainer.cost.food[1], game.jobs.Trainer.owned),
				game.resources.food.owned * (jobSettings.Trainer.percent / 100),
				game.jobs.Trainer.cost.food[1],
				true
			);
			if (affordableTrainers > 0) {
				safeBuyJob('Trainer', affordableTrainers);
				freeWorkers -= affordableTrainers;
			}
		}
		//Magmamancers
		if (!game.jobs.Magmamancer.locked && jobSettings.Magmamancer.enabled) {
			//Only buying Magmamancers when they'll do something!
			var timeOnZone = Math.floor((new Date().getTime() - game.global.zoneStarted) / 60000);
			if (game.talents.magmamancer.purchased) {
				timeOnZone += 5;
			}
			if (game.talents.stillMagmamancer.purchased) {
				timeOnZone = Math.floor(timeOnZone + game.global.spireRows);
			}
			if (timeOnZone >= 10) {
				var affordableMagmamancer = getMaxAffordable(
					game.jobs.Magmamancer.cost.gems[0] * Math.pow(game.jobs.Magmamancer.cost.gems[1], game.jobs.Magmamancer.owned),
					game.resources.gems.owned * (jobSettings.Magmamancer.percent / 100),
					game.jobs.Magmamancer.cost.gems[1],
					true
				);
				if (affordableMagmamancer > 0) {
					safeBuyJob('Magmamancer', affordableMagmamancer);
					freeWorkers -= affordableMagmamancer;
				}
			}
		}
	}
	if (game.global.universe === 2) {
		//Meteorologists
		if (!game.jobs.Meteorologist.locked && (jobSettings.Meteorologist.enabled || mapSettings.shouldMeteorologist) && !runningAtlantrimp()) {
			var affordableMets = getMaxAffordable(
				game.jobs.Meteorologist.cost.food[0] * Math.pow(game.jobs.Meteorologist.cost.food[1], game.jobs.Meteorologist.owned),
				game.resources.food.owned * (mapSettings.shouldMeteorologist ? 1 : (jobSettings.Meteorologist.percent / 100)),
				game.jobs.Meteorologist.cost.food[1],
				true
			);
			affordableMets = mapSettings.shouldMeteorologist && mapSettings.runAtlantrimp && game.mapUnlocks.AncientTreasure.canRunOnce && !(game.resources.food.owned > (typeof (totalTrFCost) === 'undefined' ? 0 : totalTrFCost)) ? 0 : affordableMets;
			if (affordableMets > 0 && !mapSettings.shouldTribute) {
				safeBuyJob('Meteorologist', affordableMets);
				freeWorkers -= affordableMets;
			}
		}

		//Ships
		if ((!game.jobs.Worshipper.locked && game.jobs.Worshipper.owned < 50 && (jobSettings.Worshipper.enabled || mapSettings.mapName === 'Worshipper Farm') && !runningAtlantrimp())) {
			var affordableShips = mapSettings.mapName === 'Worshipper Farm' ? Math.floor(game.resources.food.owned / game.jobs.Worshipper.getCost()) : Math.floor((game.resources.food.owned / game.jobs.Worshipper.getCost()) * (jobSettings.Worshipper.percent / 100));
			if (affordableShips > (50 - game.jobs.Worshipper.owned))
				affordableShips = 50 - game.jobs.Worshipper.owned;
			if (affordableShips > 0) {
				safeBuyJob('Worshipper', affordableShips);
				freeWorkers -= affordableShips;
			}
		}
	}
	var nextCoordCost = 0;

	//Gather up the total number of workers available to be distributed across ratio workers
	//In the process store how much of each for later.
	if (challengeActive('Trapper') || challengeActive('Trappapalooza')) {
		freeWorkers = game.resources.trimps.owned - game.resources.trimps.employed;
		if (challengeActive('Trappapalooza') && getPageSetting('trappapalooza'))
			if (game.upgrades.Coordination.done <= getPageSetting('trappapaloozaCoords')) {
				if (!metCoordGoal) nextCoordCost = Math.ceil(1.25 * game.resources.trimps.maxSoldiers);
				if (nextCoordCost < freeWorkers) freeWorkers -= nextCoordCost;
			}
	}
	var ratioWorkers = ['Farmer', 'Lumberjack', 'Miner', 'Scientist'];
	var currentworkers = [];
	for (var worker of ratioWorkers) {
		currentworkers.push(game.jobs[worker].owned);
	}
	freeWorkers += currentworkers.reduce((a, b) => { return a + b; });

	/* // Explicit firefox handling because Ff specifically reduces free workers to 0.
	var reserveMod = 1 + (game.resources.trimps.owned / 1e14) + nextCoordCost;
	freeWorkers -= (game.resources.trimps.owned > 1e6) ? 100 * reserveMod : 0; */

	//Scientist ratio hack to ensure that we always have at least 1 scientist unless Scientist ratio is set to 0 inside of any override settings.     
	var scientistMod;
	if (game.global.world >= 150)
		scientistMod = MODULES["jobs"].scientist.ratio7;
	else if (game.global.world >= 120)
		scientistMod = MODULES["jobs"].scientist.ratio6;
	else if (game.global.world >= 90)
		scientistMod = MODULES["jobs"].scientist.ratio5;
	else if (game.global.world >= 65)
		scientistMod = MODULES["jobs"].scientist.ratio4;
	else if (game.global.world >= 50)
		scientistMod = MODULES["jobs"].scientist.ratio3;
	else if (game.jobs.Farmer.owned < 100)
		scientistMod = MODULES["jobs"].scientist.ratio2;
	else
		scientistMod = MODULES["jobs"].scientist.ratio;

	var desiredRatios = [0, 0, 0, 0];
	//Looks first if we want to manually set ratios for workers through map settings or through overrides (bone shrine).
	var workerRatio;
	var overrideRatio = forceRatios || (getPageSetting('autoMaps') > 0 && mapSettings.jobRatio !== undefined);
	if (overrideRatio) {
		//Check if bone shrine wants to force override our job ratio
		if (forceRatios) {
			if (typeof forceRatios !== 'string') {
				debug("Error! forceRatios is not setup as a string! Not buying jobs until this has been fixed!");
				return;
			}
			workerRatio = forceRatios;
		}
		//If not then check if we are running a map with a job ratio set
		else {
			workerRatio = mapSettings.jobRatio;
		}

		desiredRatios = Array.from(workerRatio.split(','))
		for (var [index, val] of ratioWorkers.entries()) {
			// your code goes here    
			if (game.jobs[val].locked)
				desiredRatios[index] = 0;
			else
				desiredRatios[index] = desiredRatios[index] !== undefined ? Number(desiredRatios[index]) : 0;
		}
	}

	if (desiredRatios[3] !== 0) scientistMod = 1;
	if (MODULES.resourceNeeded.science > 0 && MODULES.resourceNeeded.science > game.resources.science.owned) scientistMod = 1;

	for (var worker of ratioWorkers) {
		if (!game.jobs[worker].locked) {
			if (worker === 'Scientist') {
				if (desiredRatios[ratioWorkers.indexOf(worker)] === 0) desiredRatios[ratioWorkers.indexOf(worker)] = 1;
				continue;
			}
			else if (overrideRatio) {
				desiredRatios[ratioWorkers.indexOf(worker)] = scientistMod * desiredRatios[ratioWorkers.indexOf(worker)];
			}
			else {
				desiredRatios[ratioWorkers.indexOf(worker)] = scientistMod * parseFloat(workerRatios(worker))
			}
		}
		else
			desiredRatios[ratioWorkers.indexOf(worker)] = 0;
	}

	if (game.global.universe === 2 && workerRatio === undefined) {
		//Setting farmers to 0 if past NFF zone & in world.
		if (jobSettings.FarmersUntil.enabled && game.global.world >= jobSettings.FarmersUntil.zone)
			desiredRatios[0] = 0;
		//Setting lumberjacks to 0 if Melting Point has been run.
		if (jobSettings.NoLumberjacks.enabled && !game.mapUnlocks.SmithFree.canRunOnce)
			desiredRatios[1] = 0;
	}

	//Adding Miners to Lumberjacks ratio if unlocked otherwise add to Farmers while running Transmute or Metal challenges 
	if ((challengeActive('Metal') || challengeActive('Transmute'))) {
		if (!game.jobs.Lumberjack.locked)
			desiredRatios[1] += desiredRatios[2];
		else
			desiredRatios[0] += desiredRatios[2];
		desiredRatios[2] = 0;
	}

	//Disable Scientists if we don't have the upgrade
	var scientistsAvailable = game.upgrades.Scientists.done;
	if (!scientistsAvailable) desiredRatios[3] = 0;

	var totalFraction = desiredRatios.reduce((a, b) => { return a + b; });
	totalFraction = totalFraction === 0 ? 1 : totalFraction
	var desiredWorkers = [0, 0, 0, 0];
	var totalWorkerCost = 0;
	for (var i = 0; i < ratioWorkers.length; i++) {
		desiredWorkers[i] = Math.floor(freeWorkers * desiredRatios[i] / totalFraction - currentworkers[i]);
		if (desiredWorkers[i] > 0) totalWorkerCost += game.jobs[ratioWorkers[i]].cost.food * desiredWorkers[i];
	}

	//If we can't afford all the workers we want, buy Farmers until they can be afforded.
	if (totalWorkerCost > game.resources.food.owned) {
		safeBuyJob('Farmer', freeWorkers);
	} else {
		//Fire anything that we need to fire to free up workers
		for (var i = 0; i < desiredWorkers.length; i++) {
			if (desiredWorkers[i] > 0) continue;
			if (Math.abs(desiredWorkers[i]) <= 0) continue;
			safeBuyJob(ratioWorkers[i], -Math.abs(desiredWorkers[i]))
		}
		//Buy up workers that we need to
		for (var i = 0; i < desiredWorkers.length; i++) {
			if (desiredWorkers[i] <= 0) continue;
			safeBuyJob(ratioWorkers[i], Math.abs(desiredWorkers[i]))
		}
	}
}