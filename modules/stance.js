function safeSetStance(stance) {
	const formationLetter = ['X', 'H', 'D', 'B', 'S', 'W'];
	if (typeof stance === 'string') stance = formationLetter.indexOf(stance);

	const currFormation = game.global.formation;
	if (currFormation === stance) return;

	debug(`Setting stance from ${formationLetter[currFormation]} to ${formationLetter[stance]}.`, 'stance');
	setFormation(stance.toString());
}

function maxOneShotPower(planToMap = false, targetZone = game.global.world) {
	let power = 2;

	if (game.global.universe === 1) {
		if (game.portal.Overkill.level === 0) return 1;
		if (masteryPurchased('overkill')) power++;

		const overkiller = Fluffy.isRewardActive('overkiller');
		if (overkiller) power += overkiller;

		const empowerment = getEmpowerment();
		if (empowerment === 'Ice') {
			const uberEmpowerment = getUberEmpowerment();
			if (uberEmpowerment === 'Ice') power += 2;

			const iceLevel = game.empowerments.Ice.getLevel();
			if (iceLevel >= 50) power++;
			if (iceLevel >= 100) power++;
		}
	} else if (game.global.universe === 2) {
		const overkill = canU2OverkillAT(targetZone);
		if (!overkill) {
			if (planToMap && u2Mutations.tree.MadMap.purchased) return power;
			return 1;
		}

		if (u2Mutations.tree.MaxOverkill.purchased) power++;
	}

	return power;
}

function oneShotZone(type, specificStance = 'X', useMax = false, worldType = _getWorldType()) {
	const maxOrMin = useMax ? 'max' : 'min';
	const zone = _getZone(worldType);
	const overkillRange = worldType === 'world' && liquifiedZone() ? 1 : maxOneShotPower();
	const overkillMultiplier = 0.005 * getPerkLevel('Overkill');
	let damageLeft = calcOurDmg(maxOrMin, specificStance, false, worldType, 'never') + addPoison(false, game.global.world);
	let power;

	for (power = 1; power <= overkillRange; power++) {
		const enemyHealth = calcEnemyHealth(type, zone, 99 - overkillRange + power, 'Dragimp');
		damageLeft -= enemyHealth;

		if (damageLeft < 0) return power - 1;

		damageLeft *= overkillMultiplier;
	}

	return power - 1;
}

function oneShotPower(specificStance = 'X', offset = 0, useMax = false, worldType = _getWorldType(), customAttack) {
	const maxOrMin = useMax ? 'max' : 'min';
	const zone = _getZone(worldType);
	const overkillRange = worldType === 'world' && liquifiedZone() ? 1 : maxOneShotPower();
	const overkillMultiplier = 0.005 * getPerkLevel('Overkill');
	let damageLeft = (customAttack ? customAttack : calcOurDmg(maxOrMin, specificStance, true, worldType, 'never')) + addPoison(true);
	let power;

	// Calculates how many enemies we can one shot + overkill
	for (power = 1; power <= overkillRange; power++) {
		const currentEnemy = getCurrentEnemy(power + offset);
		if (!currentEnemy) return power + offset - 1;

		// Enemy Health: current enemy or his neighbours
		const enemyHealth = power + offset > 1 ? calcSpecificEnemyHealth(worldType, zone, currentEnemy.level) : currentEnemy.health;
		damageLeft -= enemyHealth;

		// Check if we can one shot the next enemy
		if (damageLeft < 0) return power - 1;

		// Calculates our minimum 'left over' damage, which will be used by the Overkill
		damageLeft *= overkillMultiplier;
	}

	return power - 1;
}

function _challengeDamage(maxHealth = calcOurHealth('X', _getWorldType(), true), minDamage, maxDamage, missingHealth, block = calcOurBlock(false), pierce, critPower = 2) {
	const enemy = getCurrentEnemy();
	const enemyHealth = enemy.health;
	const enemyDamage = calcSpecificEnemyAttack(critPower);

	const leadChallenge = challengeActive('Lead');
	const electricityChallenge = challengeActive('Electricity') || challengeActive('Mapocalypse');
	const daily = challengeActive('Daily');
	const dailyPlague = daily && typeof game.global.dailyChallenge.plague !== 'undefined';
	const dailyBogged = daily && typeof game.global.dailyChallenge.bogged !== 'undefined';
	const dailyExplosive = daily && typeof game.global.dailyChallenge.explosive !== 'undefined';
	const dailyMirrored = daily && typeof game.global.dailyChallenge.mirrored !== 'undefined';
	const drainChallenge = dailyPlague || dailyBogged || challengeActive('Nom') || challengeActive('Toxicity');

	let challengeDamage = 0;
	let harm = 0;

	if (electricityChallenge) challengeDamage = game.challenges.Electricity.stacks * 0.1;
	else if (drainChallenge) challengeDamage = 0.05;

	if (dailyPlague) challengeDamage = dailyModifiers.plague.getMult(game.global.dailyChallenge.plague.strength, 1 + game.global.dailyChallenge.plague.stacks);
	if (dailyBogged) challengeDamage = dailyModifiers.bogged.getMult(game.global.dailyChallenge.bogged.strength);

	// Lead - Only takes damage if the enemy doesn't die
	if (leadChallenge && minDamage < enemyHealth) harm += maxHealth * game.challenges.Lead.stacks * 0.0003;

	// Adds Drain Damage -- % of max health
	harm += maxHealth * challengeDamage;

	// Adds Bleed Damage -- % of current health
	if (game.global.voidBuff === 'bleed' || enemy.corrupted === 'corruptBleed' || enemy.corrupted === 'healthyBleed') {
		const bleedDamage = enemy.corrupted === 'healthyBleed' ? 0.3 : 0.2;
		harm += (maxHealth - missingHealth) * bleedDamage;
	}

	if (dailyExplosive && critPower >= 0) {
		const explosionDmg = enemyDamage * dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength);
		if (maxDamage >= enemyHealth && maxHealth > block) harm += Math.max(explosionDmg - block, explosionDmg * pierce);
	}

	// Mirrored (Daily) -- Unblockable, unpredictable
	if (dailyMirrored && critPower >= -1) {
		const minCheck = Math.min(maxDamage - addPoison(true), enemyHealth);
		const mirrorStrength = dailyModifiers.mirrored.getMult(game.global.dailyChallenge.mirrored.strength);
		harm += minCheck * mirrorStrength;
	}

	return harm;
}

function _directDamage(block = calcOurBlock(game.global.formation, true), pierce, currentHealth, minDamage, critPower = 2) {
	const enemy = getCurrentEnemy();
	const enemyHealth = enemy.health;
	const enemyDamage = calcSpecificEnemyAttack(critPower, block, currentHealth);

	// Applies pierce
	let harm = Math.max(enemyDamage - block, pierce * enemyDamage, 0);
	//console.log(enemyDamage);
	const isDoubleAttack = game.global.voidBuff === 'doubleAttack' || enemy.corrupted === 'corruptDbl' || enemy.corrupted === 'healthyDbl';
	const enemyFast = checkFastEnemy(enemy);

	let dodgeDaily = false;
	if (challengeActive('Daily') && typeof game.global.dailyChallenge.slippery !== 'undefined') {
		const slipStr = game.global.dailyChallenge.slippery.strength;
		dodgeDaily = (slipStr > 15 && game.global.world % 2 === 0) || (slipStr <= 15 && game.global.world % 2 === 1);
	}

	if (isDoubleAttack && minDamage < enemyHealth) harm *= 2;
	if (!enemyFast && !dodgeDaily && minDamage > enemyHealth) harm = 0;

	return harm;
}

function wouldSurvive(formation = 'S', critPower = 2, baseStats = getBaseStats()) {
	let { health, block, minDamage, maxDamage } = baseStats;
	const missingHealth = game.global.soldierHealthMax - game.global.soldierHealth;

	// Applies the formation modifiers
	if (formation === 'XB') {
		health /= 2;
	} else if (formation === 'D') {
		minDamage *= 4;
		maxDamage *= 4;
		health /= 2;
		block /= 2;
	} else if (formation === 'B') {
		minDamage /= 2;
		maxDamage /= 2;
		health /= 2;
		block *= 4;
	} else if (formation === 'H') {
		minDamage /= 2;
		maxDamage /= 2;
		health *= 4;
		block /= 2;
	} else if (formation === 'S') {
		minDamage /= 2;
		maxDamage /= 2;
		health /= 2;
		block /= 2;
	}

	// Max health for XB formation
	const maxHealth = health * (formation === 'XB' ? 2 : 1);

	const poisonDmg = addPoison(true);
	minDamage += poisonDmg;
	maxDamage += poisonDmg;

	let pierce = game.global.brokenPlanet && !game.global.mapsActive ? getPierceAmt() : 0;
	if (formation !== 'B' && game.global.formation === 3) pierce *= 2;

	const notSpire = game.global.mapsActive || !game.global.spireActive;

	// Decides if the trimps can survive in this formation
	const harm = _directDamage(block, pierce, health - missingHealth, minDamage, critPower) + _challengeDamage(maxHealth, minDamage, maxDamage, missingHealth, block, pierce, critPower);
	//console.log('hp', health, 'miss hp', missingHealth, 'remain', health - missingHealth, 'enemyDmg', harm, 'here', critPower);
	if (health - missingHealth > harm) return true;
	// Updated Genes and Block
	const newSquadRdy = newArmyRdy();
	const blockier = calcOurBlock(false, false);
	const healthier = health * Math.pow(1.01, game.jobs.Geneticist.owned - game.global.lastLowGen);
	const maxHealthier = maxHealth * Math.pow(1.01, game.jobs.Geneticist.owned - game.global.lastLowGen);
	const harm2 = _directDamage(blockier, pierce, healthier, minDamage, critPower) + _challengeDamage(maxHealthier, minDamage, maxDamage, 0, blockier, pierce, critPower);

	return newSquadRdy && notSpire && healthier > harm2;
}

function unlockedStances() {
	const stances = ['X'];
	if (!game.upgrades.Formations.done) return stances;

	stances.push('H');
	if (game.upgrades.Dominance.done) stances.push('D');
	if (game.upgrades.Barrier.done) stances.push('B');
	if (getHighestLevelCleared() >= 180) stances.push('S');
	if (game.global.uberNature === 'Wind') stances.push('W');

	return stances;
}

function getBaseStats() {
	const bionicTalent = _getBionicTalent();
	const antiBonus = _getAnticipationBonus();
	const antiBonusCurr = _getAnticipationBonus(undefined, true);

	const antiRatio = antiBonusCurr / antiBonus;
	const dailyRampageMult = _getRampageBonus();
	const totalRatio = antiRatio * dailyRampageMult;

	let stats = {
		minDamage: calcOurDmg('min', 'X', false, undefined, 'never', bionicTalent, true) * totalRatio,
		avgDamage: calcOurDmg('avg', 'X', false, undefined, 'maybe', bionicTalent, true) * totalRatio,
		maxDamage: calcOurDmg('max', 'X', false, undefined, 'force', bionicTalent, true) * totalRatio,
		health: calcOurHealth(false, false, true),
		block: calcOurBlock(false)
	};

	return stats;
}

function shouldWindOverScryer(baseStats = getBaseStats(), currentEnemy = getCurrentEnemy()) {
	const currentStacks = game.empowerments.Wind.currentDebuffPower;
	const stackCap = 300;
	const stacksPerHit = 2 * Fluffy.isRewardActive('plaguebrought') ? 2 : 1;
	if (currentStacks + stacksPerHit >= stackCap) return true;

	if (baseStats.maxDamage / 2 < currentEnemy.health) return true;

	return false;
}

function autoStance() {
	if (!game.upgrades.Formations.done) return;

	const availableStances = unlockedStances();
	const baseStats = getBaseStats();
	const currentEnemy = getCurrentEnemy();

	if (availableStances.includes('S')) {
		if (voidMapScryer(availableStances, baseStats, currentEnemy)) return;
		if (autoLevelStance(availableStances, baseStats, currentEnemy)) return;
	}

	const settingAffix = trimpStats.isC3 ? 'C2' : trimpStats.isDaily ? 'Daily' : '';
	if (game.global.spireActive && !game.global.mapsActive && availableStances.includes('D') && getPageSetting(`spireDominanceStance${settingAffix}`)) {
		safeSetStance(2);
		return;
	}

	const windStance = shouldWindStance(availableStances, baseStats, currentEnemy);
	if (windStance) {
		safeSetStance(windStance);
		return;
	}

	if (availableStances.includes('S') && shouldScryerStance(availableStances, baseStats, currentEnemy)) return;

	const autoStance = getPageSetting('autoStance');
	if (autoStance === 1) autoStanceAdvanced(availableStances, baseStats, currentEnemy);
	if (autoStance === 2 && availableStances.includes('D')) safeSetStance(2);
}

function voidMapScryer(availableStances = unlockedStances(), baseStats = getBaseStats(), currentEnemy = getCurrentEnemy()) {
	const settingAffix = trimpStats.isDaily ? 'Daily' : '';
	if (game.global.voidBuff && masteryPurchased('scry2') && getPageSetting(`scryerVoidMaps${settingAffix}`)) {
		const useWindStance = availableStances.includes('W') && (getEmpowerment() !== 'Wind' || shouldWindOverScryer(baseStats, currentEnemy));
		safeSetStance(useWindStance ? 'W' : 'S');
		return true;
	}

	return false;
}

function autoLevelStance(availableStances = unlockedStances(), baseStats = getBaseStats(), currentEnemy = getCurrentEnemy()) {
	if ((game.global.mapsActive || game.global.preMapsActive) && !game.global.voidBuff && mapSettings.mapName && getPageSetting('autoMaps') && getPageSetting('autoLevelScryer')) {
		const mapName = mapSettings.mapName;
		const ignoreSettings = new Set(['Void Map', 'Prestige Climb', 'Prestige Raiding', 'Bionic Raiding']);
		if (!ignoreSettings.has(mapName)) {
			const speedSettings = ['Map Bonus', 'Experience'];

			if (['HD Farm', 'Hits Survived'].includes(mapName) && game.global.mapBonus !== 10 && getPageSetting('mapBonusLevelType')) {
				const mapBonusLevel = game.global.universe === 1 ? -game.portal.Siphonology.level || 0 : 0;
				const mapObj = game.global.mapsActive ? getCurrentMapObject() : { level: mapSettings.mapLevel };
				const mapBonusMinSetting = getPageSetting('mapBonusMinLevel');
				const aboveMinMapLevel = mapBonusMinSetting <= 0 || mapObj.level - game.global.world > -mapBonusMinSetting - Math.abs(mapBonusLevel);

				if (aboveMinMapLevel && hdStats.autoLevelLoot < mapObj.level - game.global.world) {
					if (mapName === 'HD Farm') speedSettings.push('HD Farm');
					else if (mapName === 'Hits Survived' && game.global.mapBonus < getPageSetting('mapBonusHealth')) speedSettings.push('Hits Survived');
				}
			}

			const speedSettingsSet = new Set(speedSettings);
			const checkSpeed = speedSettingsSet.has(mapName);
			const autoLevelData = hdStats.autoLevelData[checkSpeed ? 'speed' : 'loot'];

			if (['S', 'W'].includes(autoLevelData.stance)) {
				const stance = availableStances.includes('W') && ((autoLevelData.stance === 'W' && getEmpowerment() !== 'Wind') || shouldWindOverScryer(baseStats, currentEnemy)) ? 'W' : 'S';
				safeSetStance(stance);
				return true;
			}
		}
	}

	return false;
}

function shouldWindStance(availableStances = unlockedStances(), baseStats = getBaseStats(), currentEnemy = getCurrentEnemy()) {
	if (game.global.mapsActive || !availableStances.includes('W') || getUberEmpowerment() !== 'Wind' || getEmpowerment() !== 'Wind') return false;

	const settingAffix = trimpStats.isDaily ? 'Daily' : '';
	if (!getPageSetting('autoStanceWind' + settingAffix)) return false;
	if (liquifiedZone() && getPageSetting('windStackingLiq' + settingAffix)) return 'W';

	const windStackRatio = getPageSetting('windStackingRatio' + settingAffix);
	if ((hdStats.hdRatio < windStackRatio || windStackRatio <= 0) && game.global.world >= getPageSetting('windStackingZone' + settingAffix)) {
		if (currentEnemy.level !== 100 && (!currentEnemy.mutation || currentEnemy.mutation === 'Magma')) {
			const overkillCells = oneShotPower('S', 0, true, 'world', baseStats.maxDamage / 2);

			let power;
			for (power = 1; power <= overkillCells; power++) {
				const enemy = getCurrentEnemy(power);
				if (!enemy || enemy.level === 100 || ['Corruption', 'Healthy'].includes(enemy.mutation)) {
					return 'W';
				}
			}

			return 'S';
		}

		return 'W';
	}

	return false;
}

function shouldScryerStance(availableStances = unlockedStances(), baseStats = getBaseStats(), currentEnemy = getCurrentEnemy()) {
	if (game.global.preMapsActive || !getPageSetting('autoStanceScryer')) return false;

	const mapsActive = game.global.mapsActive;

	if (!mapsActive && getPageSetting('scryerEssenceOnly') && countRemainingEssenceDrops() < 1) return false;

	const empowerment = getEmpowerment();
	const useWindStance = availableStances.includes('W') && empowerment !== 'Wind';
	const scryStance = useWindStance ? 'W' : 'S';
	const scrySettings = _getScrySettings();
	const aboveMaxZone = scrySettings.MaxZone > 0 && game.global.world >= scrySettings.MaxZone;

	if (aboveMaxZone && scrySettings.MinMaxWorld === 1) return false;

	const mapObject = mapsActive ? getCurrentMapObject() : null;
	const nextEnemy = getCurrentEnemy(2);
	const [transitionRequired, never_scry] = scryNever(scrySettings, mapObject, currentEnemy, nextEnemy, aboveMaxZone);

	if (never_scry) return false;
	if (scryForce(scrySettings, mapObject, currentEnemy, scryStance)) return true;
	if (!readyToSwitch(scryStance, baseStats)) return false;
	if (scryTransition(scryStance, scrySettings, baseStats, availableStances, transitionRequired, currentEnemy)) return true;

	return false;
}

function _getScrySettings() {
	return Object.entries(autoTrimpSettings)
		.filter(([key]) => key.startsWith('scryer'))
		.reduce((obj, [key, { value }]) => {
			obj[key.replace('scryer', '')] = value;
			return obj;
		}, {});
}

function scryNever(scrySettings = _getScrySettings(), mapObject = getCurrentMapObject(), currentEnemy = getCurrentEnemy(1), nextEnemy = getCurrentEnemy(2), aboveMaxZone = false) {
	const mapsActive = game.global.mapsActive;
	let never_scry = false;
	let transitionRequired = false;

	if (mapsActive) {
		never_scry |= scrySettings.Maps === 0 && mapObject.location !== 'Void' && mapObject.location !== 'Bionic';
	} else {
		never_scry |= game.global.spireActive && scrySettings.Spire === 0;
	}

	//See if current OR next enemy is corrupted.
	/* corrupt enemy checks */
	const willOverkill = !game.global.mapsActive ? oneShotPower('S', 0, true) : false;

	if (!mapsActive) {
		const isntCorrupt = currentEnemy && currentEnemy.mutation !== 'Corruption' && currentEnemy.mutation !== 'Healthy';
		const nextIsntCorrupt = nextEnemy && nextEnemy.mutation !== 'Corruption' && nextEnemy.mutation !== 'Healthy';
		//If current isn't corrupted AND we need to transition OR we can one shot the current enemy with full overkill, then we can scry current.
		const scryNext = nextIsntCorrupt && willOverkill;
		const skipOnMaxZone = scrySettings.MinMaxWorld === 1 && scrySettings.World !== 1 && aboveMaxZone;
		const skipWorld = scrySettings.World === 0;

		if ((skipWorld || skipOnMaxZone) && isntCorrupt) {
			transitionRequired = true;
			never_scry |= !scryNext;
		}

		const isCorrupt = currentEnemy && currentEnemy.mutation === 'Corruption';
		const nextIsCorrupt = nextEnemy && nextEnemy.mutation === 'Corruption';
		//If next isn't corrupted AND we need to transition OR we can one shot the next enemy with full overkill, then we can scry next.
		const scryNextCorrupt = !nextIsCorrupt && willOverkill;
		const skipOnMaxZoneCorrupt = scrySettings.MinMaxWorld === 2 && scrySettings.Corrupted !== 1 && aboveMaxZone;

		const skipCorrupted = scrySettings.Corrupted === 0;
		//If we are fighting a corrupted cell and we are not allowed to scry corrupted cells, then we can't scry.
		if ((skipCorrupted || skipOnMaxZoneCorrupt) && isCorrupt) {
			transitionRequired = true;
			never_scry |= !scryNextCorrupt;
		}
	}

	//check Healthy never -- TODO
	const isHealthy = currentEnemy && currentEnemy.mutation === 'Healthy';
	const nextIsHealthy = nextEnemy && nextEnemy.mutation === 'Healthy';
	const scryNextHealthy = !nextIsHealthy && willOverkill;
	const skipOnMaxZoneHealthy = scrySettings.MinMaxWorld === 3 && scrySettings.Healthy !== 1 && aboveMaxZone;
	const skipHealthy = scrySettings.Healthy === 0;
	if ((skipHealthy || skipOnMaxZoneHealthy) && isHealthy) {
		transitionRequired = true;
		never_scry |= !scryNextHealthy;
	}

	if (never_scry) {
		return [transitionRequired, true];
	}

	return [transitionRequired, false];
}

function scryForce(scrySettings = _getScrySettings(), mapObject = getCurrentMapObject(), currentEnemy = getCurrentEnemy(1), scryStance = 'S') {
	let force_scry = false;

	if (game.global.mapsActive) {
		force_scry |= scrySettings.Maps === 1 && mapObject.location !== 'Bionic' && mapObject.location !== 'Void';
	} else {
		force_scry |= game.global.spireActive && scrySettings.Spire === 1;
	}

	const isntMutated = currentEnemy && currentEnemy.mutation !== 'Corruption' && currentEnemy.mutation !== 'Healthy' && scrySettings.World === 1;
	const isCorrupt = currentEnemy && currentEnemy.mutation === 'Corruption' && scrySettings.Corrupted === 1;
	const isHealthy = currentEnemy && currentEnemy.mutation === 'Healthy' && scrySettings.Healthy === 1;

	if (force_scry || (!game.global.mapsActive && (isntMutated || isHealthy || isCorrupt))) {
		safeSetStance(scryStance);
		return true;
	}

	return false;
}

function readyToSwitch(stance = 'S', baseStats = getBaseStats()) {
	const essenceLeft = !game.global.mapsActive && (!getPageSetting('scryerEssenceOnly') || countRemainingEssenceDrops() >= 1);

	const dieZone = getPageSetting('scryerDieZone');
	let die = dieZone !== -1 && game.global.world >= dieZone && essenceLeft;
	const willSuicide = dieZone;

	//Check if we are allowed to suicide in our current cell and zone
	if (die && willSuicide >= 0) {
		let [dieZ, dieC] = willSuicide.toString().split('.');
		if (dieC && dieC.length === 1) {
			dieC = dieC + '0';
		}
		die = game.global.world >= dieZ && (!dieC || game.global.lastClearedCell + 1 >= dieC);
	}

	return die || wouldSurvive(stance, 2, baseStats);
}

function scryTransition(scryStance = 'S', scrySettings = _getScrySettings(), baseStats = getBaseStats(), availableStances = unlockedStances(), transitionRequired = false, currentEnemy = getCurrentEnemy(1)) {
	const min_zone = scrySettings.MinZone;
	const max_zone = scrySettings.MaxZone;
	const valid_min = game.global.world >= min_zone && game.global.world > 60;
	const valid_max = max_zone < 1 || (max_zone > 0 && game.global.world < max_zone);
	const validMinMax = valid_min && valid_max && (!game.global.mapsActive || scrySettings.MinMaxWorld === 0);

	if (validMinMax) {
		//Smooth transition to S before killing the target
		if (transitionRequired) {
			const xStance = availableStances.includes('W') && (getEmpowerment() !== 'Wind' || shouldWindOverScryer(baseStats, currentEnemy)) ? 5 : 0;
			const stances = [
				{ stance: 'X', value: xStance },
				{ stance: 'H', value: 1 }
			];

			if (availableStances.includes('B')) {
				stances.unshift({ stance: 'B', value: 3 }, { stance: 'XB', value: xStance });
			}

			if (availableStances.includes('D')) {
				stances.unshift({ stance: 'D', value: 2 });
			}

			const oneShotPowers = {};
			const critSources = getCritPower(currentEnemy);

			for (let critPower = 2; critPower >= -2; critPower--) {
				if (critPower === 2 && (!critSources.regular || !critSources.challenge)) continue;
				if (critPower === 1 && !critSources.regular && !critSources.challenge) continue;
				if (critPower === 0 && !critSources.explosive) continue;
				if (critPower === -1 && !critSources.reflect) continue;

				for (let { stance, value } of stances) {
					if (!oneShotPowers[stance]) {
						oneShotPowers[stance] = oneShotPower(stance, 0, true);
					}

					if (wouldSurvive(stance, critPower, baseStats) && !oneShotPowers[stance]) {
						safeSetStance(value);
						return true;
					}
				}
			}
		}

		const maxHits = getPageSetting('scryerMaxHits');
		if (maxHits > 0) {
			const avgDmg = baseStats.avgDamage / 2 + addPoison(true);
			const hitsToKill = currentEnemy.maxHealth / avgDmg;
			const hitsToKillCurrent = currentEnemy.health / avgDmg;

			if (maxHits > hitsToKill && hitsToKillCurrent > 1) {
				return false;
			}
		}

		//Set to scry if it won't kill us, or we are willing to die for it
		if (scryStance === 'S' && availableStances.includes('W') && shouldWindOverScryer(baseStats, currentEnemy)) {
			scryStance = 'W';
		}
		safeSetStance(scryStance);
		return true;
	}
}

function autoStanceAdvanced(availableStances = unlockedStances(), baseStats = getBaseStats(), currentEnemy = getCurrentEnemy()) {
	if (game.global.gridArray.length === 0 || typeof currentEnemy === 'undefined') return;

	const critSources = getCritPower(currentEnemy);
	const checkWind = availableStances.includes('W') && (getEmpowerment() !== 'Wind' || shouldWindOverScryer(baseStats, currentEnemy));
	let prefferedStance = availableStances.includes('D') ? 'D' : 'X';

	if (availableStances.includes('S')) {
		const oneShotDomination = oneShotPower(prefferedStance, 0, false);

		if (oneShotDomination > 0) {
			const stanceToCheck = checkWind ? 'W' : 'S';
			const overkillRange = !game.global.mapsActive && liquifiedZone() ? 1 : maxOneShotPower();
			if (oneShotPower(stanceToCheck, 0, false) >= overkillRange) {
				prefferedStance = stanceToCheck;
			}
		}
	}

	const stances = [
		{ stance: 'X', value: checkWind && prefferedStance !== 'W' ? 5 : 0 },
		{ stance: 'H', value: 1 }
	];

	if (availableStances.includes('B')) {
		stances.unshift({ stance: 'B', value: 3 }, { stance: 'XB', value: 0 });
	}

	if (availableStances.includes('D')) {
		stances.unshift({ stance: 'D', value: 2 });
	}

	if (!['X', 'D'].includes(prefferedStance) && availableStances.includes(prefferedStance)) {
		stances.unshift({ stance: prefferedStance, value: prefferedStance });
	}

	for (let critPower = 2; critPower >= -2; critPower--) {
		// If no formation can survive a mega crit, it ignores it, and recalculates for a regular crit, then no crit
		// If even that is not enough, then it ignore Explosive Daily, and finally it ignores Reflect Daily
		if (critPower === 2 && (!critSources.regular || !critSources.challenge)) continue;
		if (critPower === 1 && !critSources.regular && !critSources.challenge) continue;
		if (critPower === 0 && !critSources.explosive) continue;
		if (critPower === -1 && !critSources.reflect) continue;

		for (let { stance, value } of stances) {
			if (wouldSurvive(stance, critPower, baseStats)) {
				safeSetStance(value);
				return true;
			}
		}
	}

	// If it cannot survive the worst case scenario on any formation, attempt its luck on H stance
	safeSetStance(1);
}
