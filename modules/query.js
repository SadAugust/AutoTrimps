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
		if (upgrade === 'Bloodlust' && game.global.world === 1) return;
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

function prestigesToGet(targetZone = game.global.world, targetPrestige = 'GambesOP') {
	const prestigeList = ['Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'];

	if (!game.global.slowDone && prestigeList.indexOf(targetPrestige) > 10) targetPrestige = 'Bestplate';

	let mapsToRun = 0;
	let prestigeToFarmFor = 0;

	const hasSciFour = (game.global.universe === 1 && game.global.sLevel >= 4) || (game.global.universe === 2 && game.buildings.Microchip.owned >= 4);
	const prestigeInterval = challengeActive('Mapology') || !hasSciFour ? 5 : 10;

	for (const p of prestigeList) {
		if (game.equipment[game.upgrades[p].prestiges].locked) continue;
		const prestigeUnlock = game.mapUnlocks[p];
		const pMapLevel = prestigeUnlock.last + 5;

		if ((game.upgrades[p].allowed || prestigeUnlock.last <= 5) && prestigeUnlock && pMapLevel <= targetZone) {
			mapsToRun += Math.max(1, Math.ceil((targetZone - pMapLevel) / prestigeInterval));
			let prestigeCount = Math.floor((targetZone - prestigeUnlock.last) / 5);

			if (hasSciFour && prestigeCount % 2 === 1) {
				prestigeCount++;
			}
			prestigeToFarmFor += prestigeCount;
		}

		if (p === targetPrestige) break;
	}

	return [prestigeToFarmFor, mapsToRun];
}

function prestigesUnboughtCount() {
	const prestigeList = ['Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'];
	const numUnbought = prestigeList.filter((p) => game.upgrades[p].allowed - game.upgrades[p].done > 0).length;

	return numUnbought;
}
