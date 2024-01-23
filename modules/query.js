function getPerSecBeforeManual(jobName) {
	let rate = 0;
	const increaseType = game.jobs[jobName].increase;

	if (increaseType === 'custom') return 0;

	if (game.jobs[jobName].owned > 0) {
		rate = game.jobs[jobName].owned * game.jobs[jobName].modifier;

		if (game.portal.Motivation.level > 0) rate += rate * game.portal.Motivation.level * game.portal.Motivation.modifier;

		if (game.global.universe === 1) {
			if (game.portal.Motivation_II.level > 0) rate *= 1 + game.portal.Motivation_II.level * game.portal.Motivation_II.modifier;

			if (game.portal.Meditation.level > 0) rate *= (1 + 0.01 * game.portal.Meditation.getBonusPercent()).toFixed(2);

			if (game.jobs.Magmamancer.owned > 0 && increaseType === 'metal') rate *= game.jobs.Magmamancer.getBonusPercent();
		}

		if (challengeActive('Meditate')) rate *= 1.25;
		else if (challengeActive('Size')) rate *= 1.5;

		if (challengeActive('Toxicity')) {
			const toxicityBonus = (game.challenges.Toxicity.lootMult * game.challenges.Toxicity.stacks) / 100;
			rate *= 1 + toxicityBonus;
		}

		if (challengeActive('Balance')) rate *= game.challenges.Balance.getGatherMult();

		if (challengeActive('Decay')) {
			rate *= 10;
			rate *= Math.pow(0.995, game.challenges.Decay.stacks);
		}

		if (challengeActive('Daily')) {
			if (typeof game.global.dailyChallenge.dedication !== 'undefined') {
				rate *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
			}

			if (typeof game.global.dailyChallenge.famine !== 'undefined' && increaseType !== 'fragments' && increaseType !== 'science') {
				rate *= dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
			}
		}

		if (challengeActive('Watch')) rate /= 2;

		if (challengeActive('Lead') && game.global.world % 2 === 1) rate *= 2;

		rate = calcHeirloomBonus('Staff', jobName + 'Speed', rate);
	}

	return rate;
}
function isBuildingInQueue(buildingName) {
	return game.global.buildingsQueue.some((queueItem) => queueItem.includes(buildingName));
}

function getCostToUpgrade(upgradeName, resource) {
	var upgrade = game.upgrades[upgradeName];
	return void 0 !== upgrade.cost.resources[resource] && void 0 !== upgrade.cost.resources[resource][0] ? Math.floor(upgrade.cost.resources[resource][0] * Math.pow(upgrade.cost.resources[resource][1], upgrade.done)) : void 0 !== upgrade.cost.resources[resource] && void 0 === upgrade.cost.resources[resource][0] ? upgrade.cost.resources[resource] : 0;
}

function setResourceNeeded() {
	const resourcesNeeded = {
		food: 0,
		wood: 0,
		metal: 0,
		science: 0,
		gems: 0,
		fragments: 0
	};
	const upgradeList = populateUpgradeList();

	for (let upgrade in upgradeList) {
		upgrade = upgradeList[upgrade];
		let gameUpgrade = game.upgrades[upgrade];
		if (gameUpgrade.allowed > gameUpgrade.done) {
			resourcesNeeded.science += getCostToUpgrade(upgrade, 'science');
			if (upgrade === 'Trapstorm') continue;
			resourcesNeeded.food += getCostToUpgrade(upgrade, 'food');
			resourcesNeeded.wood += getCostToUpgrade(upgrade, 'wood');
			resourcesNeeded.metal += getCostToUpgrade(upgrade, 'metal');
		}
	}
	if (game.global.universe === 1 && needGymystic()) {
		resourcesNeeded.science += getCostToUpgrade('Gymystic', 'science');
	}

	//Looping through all equipment to get the cost of upgrading them as they aren't in the upgrade list
	const equipmentList = ['Dagadder', 'Megamace', 'Polierarm', 'Axeidic', 'Greatersword', 'Harmbalest', 'Bootboost', 'Hellishmet', 'Pantastic', 'Smoldershoulder', 'Bestplate', 'GambesOP'];
	for (let prestigeName in equipmentList) {
		prestigeName = equipmentList[prestigeName];
		if (game.upgrades[prestigeName].allowed > game.upgrades[prestigeName].done) resourcesNeeded.science += getCostToUpgrade(prestigeName, 'science');
	}

	return resourcesNeeded;
}

function queryAutoEqualityStats(ourDamage, ourHealth, enemyDmgEquality, enemyHealth, equalityStacks, dmgMult) {
	debug(`Equality = ${equalityStacks}`, 'debugStats');
	debug(`Our dmg (min) = ${ourDamage.toFixed(3)} | Our health = ${ourHealth.toFixed(3)}`, 'debugStats');
	debug(`Enemy dmg = ${enemyDmgEquality.toFixed(3)} | Enemy health = ${enemyHealth.toFixed(3)}`, 'debugStats');
	debug(`Gamma Burst = ${game.heirlooms.Shield.gammaBurst.stacks} / ${gammaMaxStacks()}`, 'debugStats');
	if (dmgMult) debug(`Mult = ${dmgMult}`, 'debugStats');
}

function formatTimeForDescriptions(number) {
	const timeUnits = {
		year: Math.floor(number / 60 / 60 / 24 / 365),
		day: Math.floor((number / 60 / 60 / 24) % 365),
		hour: Math.floor((number / 60 / 60) % 24),
		minute: Math.floor((number / 60) % 60),
		second: Math.floor(number % 60)
	};

	let timeString = '';

	for (const [unit, value] of Object.entries(timeUnits)) {
		if (value > 0) {
			timeString += `${value}${unit[0]} `;
		}
	}

	return timeString.trim();
}

function timeForFormatting(number) {
	return Math.floor((getGameTime() - number) / 1000);
}
