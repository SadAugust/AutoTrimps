function isBuildingInQueue(buildingName) {
	return game.global.buildingsQueue.some((queueItem) => queueItem.includes(buildingName));
}

function getCostToUpgrade(upgradeName, resource) {
	const upgrade = game.upgrades[upgradeName];
	const cost = upgrade.cost.resources[resource];

	if (!cost) return 0;

	if (!Array.isArray(cost) || cost.length < 2) {
		return cost;
	}

	const [baseCost, multiplier] = cost;

	return multiplier !== undefined ? Math.floor(baseCost * Math.pow(multiplier, upgrade.done)) : baseCost;
}

function getUpgradeCosts() {
	const resourcesNeeded = {
		food: 0,
		wood: 0,
		metal: 0,
		science: 0
	};
	const upgradeList = populateUpgradeList();

	upgradeList.forEach((upgrade) => {
		const { allowed, done } = game.upgrades[upgrade];
		if (allowed > done) {
			resourcesNeeded.science += getCostToUpgrade(upgrade, 'science');
			if (upgrade !== 'Trapstorm') {
				resourcesNeeded.food += getCostToUpgrade(upgrade, 'food');
				resourcesNeeded.wood += getCostToUpgrade(upgrade, 'wood');
				resourcesNeeded.metal += getCostToUpgrade(upgrade, 'metal');
			}
		}
	});

	if (game.global.universe === 1 && needGymystic()) {
		resourcesNeeded.science += getCostToUpgrade('Gymystic', 'science');
	}

	const equipmentList = ['Dagadder', 'Megamace', 'Polierarm', 'Axeidic', 'Greatersword', 'Harmbalest', 'Bootboost', 'Hellishmet', 'Pantastic', 'Smoldershoulder', 'Bestplate', 'GambesOP'];
	equipmentList.forEach((prestigeName) => {
		const { allowed, done } = game.upgrades[prestigeName];
		if (allowed > done) {
			resourcesNeeded.science += getCostToUpgrade(prestigeName, 'science');
		}
	});

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
		if (value > 0 || unit === 'second') {
			timeString += `${value}${unit[0]} `;
		}
	}

	return timeString.trim();
}

function timeForFormatting(number) {
	return Math.floor((getGameTime() - number) / 1000);
}

function _getPrimaryResourceInfo() {
	return currSettingUniverse === 2 ? { name: 'Radon', abv: 'Rn' } : { name: 'Helium', abv: 'He' };
}

function _getChallenge2Info() {
	return currSettingUniverse === 2 ? 'C3' : 'C2';
}

function _getSpecialChallengeDescription() {
	return `${_getChallenge2Info()}'s or special challenge (${currSettingUniverse === 2 ? 'Mayhem, Pandemonium, Desolation' : 'Frigid, Experience'})`;
}
