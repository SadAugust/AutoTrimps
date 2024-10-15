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
		if (upgrade === 'Blockmaster' && game.global.world < 1) return;
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

function _calcHDRatioDebug(ourBaseDamage, enemyHealth, universeSetting, worldType) {
	debug(`ourBaseDamage: ${ourBaseDamage}`, `debugStats`);
	debug(`enemyHealth: ${enemyHealth}`, `debugStats`);
	debug(`universeSetting: ${universeSetting}`, `debugStats`);
	debug(`HD type: ${worldType}`, `debugStats`);
	debug(`HD value (H:D): ${enemyHealth / ourBaseDamage}`, `debugStats`);
}

function _calcHitsSurvivedDebug(targetZone, damageMult, worldDamage, equality, block, pierce, health, hitsToSurvive, finalDmg) {
	debug(`Target Zone: ${targetZone}`, `debugStats`);
	debug(`Damage Mult: ${damageMult}`, `debugStats`);
	debug(`World Damage: ${worldDamage}`, `debugStats`);
	if (game.global.universe === 1) debug(`Block: ${block}`, `debugStats`);
	if (game.global.universe === 1) debug(`Pierce: ${pierce}`, `debugStats`);
	if (game.global.universe === 2) debug(`Equality: ${equality}`, `debugStats`);
	debug(`Health: ${health}`, `debugStats`);
	debug(`Hits to Survive: ${hitsToSurvive}`, `debugStats`);
	debug(`finalDmg: ${finalDmg}`, `debugStats`);
}

function _calcCurrentStatsDebug() {
	if (game.global.preMapsActive) return;

	const mapping = game.global.mapsActive;
	const mapObject = mapping ? getCurrentMapObject() : { level: game.global.world, difficulty: 1 };
	const currentCell = mapping ? getCurrentMapCell() : getCurrentWorldCell();
	const currentEnemy = getCurrentEnemy();

	const dailyRampageMult = _getRampageBonus();

	const worldType = !mapping ? 'world' : mapObject.location === 'Void' ? 'void' : 'map';
	const zone = mapObject.level;
	const cell = currentCell ? currentCell.level : 1;
	const difficulty = mapObject.difficulty;

	const name = currentEnemy ? currentEnemy.name : 'Chimp';
	const equality = game.global.universe === 2 ? Math.pow(game.portal.Equality.getModifier(), game.portal.Equality.disabledStackCount) : 1;
	const enemyMin = calcEnemyAttackCore(worldType, zone, cell, name, true, false, 0) * difficulty;
	const enemyMax = calcEnemyAttackCore(worldType, zone, cell, name, false, false, 0) * difficulty;
	const mapLevel = mapping && masteryPurchased('bionic2') ? zone - game.global.world : 0;
	const equalityStackCount = game.global.universe === 2 ? game.portal.Equality.disabledStackCount : false;
	const isUniverse1 = game.global.universe !== 2;

	const displayedMin = calcOurDmg('min', equalityStackCount, true, worldType, 'never', mapLevel, true) * dailyRampageMult;
	const displayedMax = calcOurDmg('max', equalityStackCount, true, worldType, 'never', mapLevel, true) * dailyRampageMult;

	debug(`Our Stats`, 'debugStats');
	debug(`Our Attack: ${displayedMin.toExponential(2)} - ${displayedMax.toExponential(2)}`, 'debugStats');
	debug(`Our Health: ${calcOurHealth(isUniverse1, worldType).toExponential(2)}`, 'debugStats');
	if (game.global.universe === 1) debug(`Our Block: ${calcOurBlock(game.global.formation, true).toExponential(2)}`, 'debugStats');
	if (game.global.universe === 2) debug(`Our Equality: ${game.portal.Equality.disabledStackCount}`, 'debugStats');
	debug(`Our Crit: ${100 * getPlayerCritChance().toExponential(2)}% for ${getPlayerCritDamageMult().toFixed(2)}x damage. Average of ${getCritMulti('maybe').toFixed(2)}x`, 'debugStats');

	debug(`Enemy Stats`, 'debugStats');
	debug(`Enemy Attack: ${(enemyMin * equality).toExponential(2)} - ${(enemyMax * equality).toExponential(2)}`, 'debugStats');
	debug(`Enemy Health: ${(calcEnemyHealthCore(worldType, zone, cell, name) * difficulty).toExponential(2)}`, 'debugStats');
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

function _getPortalAfterVoidSetting() {
	if (!MODULES.mapFunctions.afterVoids) return false;

	const portalSetting = challengeActive('Daily') ? getPageSetting('dailyPortal') : getPageSetting('portal');
	if (portalSetting === 2 && getZoneEmpowerment(game.global.world) !== 'Poison') return false;

	return true;
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

	const runningMapo = challengeActive('Mapology');
	const hasSciFour = !runningMapo && ((game.global.universe === 1 && game.global.sLevel >= 4) || (game.global.universe === 2 && game.buildings.Microchip.owned >= 4));
	const prestigeInterval = !hasSciFour || challengeActive('Mapology') ? 5 : 10;

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

function canU2OverkillAT(targetZone = game.global.world) {
	if (!u2Mutations.tree.Overkill1.purchased) return false;

	const { Overkill2, Overkill3, Liq3, Liq2 } = u2Mutations.tree;

	let allowed = 0.3;
	if (Overkill2.purchased) allowed += 0.1;
	if (Overkill3.purchased) allowed += 0.1;
	if (Liq3.purchased) {
		allowed += 0.1;
		if (Liq2.purchased) allowed += 0.1;
	}

	const hze = game.stats.highestRadLevel.valueTotal();
	return targetZone <= hze * allowed;
}

function getCurrentEnemy(cell = 1) {
	if (game.global.gridArray.length <= 0) return { name: 'Snimp' };

	const mapping = game.global.mapsActive;
	const currentCell = mapping ? game.global.lastClearedMapCell + cell : game.global.lastClearedCell + cell;
	const mapGrid = mapping ? 'mapGridArray' : 'gridArray';

	if (typeof game.global[mapGrid][currentCell] === 'undefined') return game.global[mapGrid][game.global[mapGrid].length - 1];

	return game.global[mapGrid][currentCell];
}

function _checkFastEnemyU1(enemy) {
	const enemyFast = ['Corruption', 'Healthy'].includes(enemy.mutation);
	if (enemyFast) return true;

	const slow = challengeActive('Slow');
	if (slow) return true;

	return false;
}

function _checkFastEnemyU2(enemy) {
	const mapping = game.global.mapsActive;

	if (enemy.u2Mutation && enemy.u2Mutation.length > 0) return true;

	if (challengeActive('Bublé') || getCurrentQuest() === 8) return true;
	if (challengeActive('Duel')) {
		if (!mapping) return true;
		if (game.challenges.Duel.enemyStacks < 10) return true;
	}
	if (challengeActive('Archaeology')) return true;
	if (challengeActive('Trappapalooza')) return true;
	if (challengeActive('Berserk') && game.challenges.Berserk.weakened !== 20) return true;
	if (challengeActive('Glass')) return true;
	if (challengeActive('Revenge') && game.challenges.Revenge.stacks === 19) return true;
	if (challengeActive('Smithless') && enemy.ubersmith) return true;
	if (challengeActive('Desolation') && mapping) {
		// Exotic mapimps in deso are bugged and slow
		const exoticImp = atData.fightInfo.exoticImps.includes(enemy.name);
		return !exoticImp;
	}

	return false;
}

function checkFastEnemy(enemy = getCurrentEnemy()) {
	const mapping = game.global.mapsActive;
	const worldType = !mapping ? 'world' : game.global.voidBuff ? 'void' : 'map';

	if (game.global.universe === 1) {
		if (challengeActive('Coordinate') || challengeActive('Nom')) return false;
	} else if (game.global.universe === 2) {
		if (challengeActive('Duel') && !game.global.runningChallengeSquared && game.challenges.Duel.trimpStacks < 10) return false;
		if (challengeActive('Exterminate') && game.challenges.Exterminate.experienced) return false;
	}

	if (game.global.voidBuff === 'doubleAttack') return true;

	const fastImp = atData.fightInfo.fastImps.includes(enemy.name);
	if (fastImp) return true;

	if (game.global.universe === 2) {
		const isDaily = challengeActive('Daily');
		const dailyChallenge = game.global.dailyChallenge;
		const dailyEmpower = isDaily && typeof dailyChallenge.empower !== 'undefined';
		if (dailyEmpower && !mapping) return true;

		const dailyExplosive = isDaily && typeof dailyChallenge.explosive !== 'undefined';
		if (dailyExplosive) {
			if (worldType === 'map' && !MODULES.maps.slowScumming) return true;
			if (worldType === 'world') return true;
		}
	}

	if (game.global.universe === 1) return _checkFastEnemyU1(enemy);

	if (game.global.universe === 2) return _checkFastEnemyU2(enemy);

	return false;
}

/* Subtracts time paused from game time value */
function getGameTime() {
	const { start: startTime, time: globalTime } = game.global;

	if (game.options.menu.pauseGame.enabled) {
		return startTime + (game.options.menu.pauseGame.timeAtPause - startTime) + globalTime;
	}

	return startTime + globalTime;
}

function targetHitsSurvived(skipHDCheck, worldType) {
	if (!skipHDCheck && mapSettings.mapName === 'Hits Survived') return mapSettings.hdRatio;
	if (worldType === 'void') return Number(getPageSetting('voidMapSettings')[0].hitsSurvived);
	if (isDoingSpire()) return getPageSetting('hitsSurvivedSpire');
	return getPageSetting('hitsSurvived');
}

function whichHitsSurvived() {
	const worldType = game.global.mapsActive ? getCurrentMapObject().location : { location: 'world' };

	if (worldType.location === 'Void' || (mapSettings.voidHitsSurvived && trimpStats.autoMaps)) return hdStats.hitsSurvivedVoid;
	if (worldType.location === 'Bionic' || (mapSettings.mapName === 'Bionic Raiding' && trimpStats.autoMaps)) return hdStats.hitsSurvivedMap;
	return hdStats.hitsSurvived;
}

function whichAutoLevel() {
	return hdStats.autoLevelLoot;
}

function whichScryVoidMaps() {
	if (trimpStats.isDaily) return getPageSetting('dscryvoidmaps');
	return getPageSetting('scryvoidmaps');
}
