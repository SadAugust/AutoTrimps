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
		if (game.talents.overkill.purchased) power++;

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

function oneShotPower(specificStance = 'X', offset = 0, useMax = false, worldType = _getWorldType()) {
	const maxOrMin = useMax ? 'max' : 'min';
	const zone = _getZone(worldType);
	const overkillRange = worldType === 'world' && liquifiedZone() ? 1 : maxOneShotPower();
	const overkillMultiplier = 0.005 * getPerkLevel('Overkill');
	let damageLeft = calcOurDmg(maxOrMin, specificStance, true, worldType, 'never') + addPoison(true);
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
	let stats = {
		minDamage: calcOurDmg('min', 'X', false, false, 'never'),
		maxDamage: calcOurDmg('max', 'X', false, false, 'force'),
		health: calcOurHealth(false, false, true),
		block: calcOurBlock(false)
	};

	const antiBonus = _getAnticipationBonus();
	const antiBonusCurr = _getAnticipationBonus(undefined, true);

	if (antiBonus !== antiBonusCurr) {
		const ratio = antiBonusCurr / antiBonus;
		stats.minDamage *= ratio;
		stats.maxDamage *= ratio;
	}

	return stats;
}

function autoStance() {
	if (!game.upgrades.Formations.done) return;

	const availableStances = unlockedStances();

	if (availableStances.includes('S')) {
		if (voidMapScryer(availableStances)) return;
		if (autoLevelStance(availableStances)) return;
	}

	const settingPrefix = trimpStats.isDaily ? 'd' : '';
	const c2Prefix = trimpStats.isC3 ? 'c2' : settingPrefix;
	if (game.global.spireActive && !game.global.mapsActive && availableStances.includes('D') && getPageSetting(`${c2Prefix}AutoDStanceSpire`)) {
		safeSetStance(2);
		return;
	}

	if (availableStances.includes('W') && shouldWindStance()) {
		safeSetStance(5);
		return;
	}

	const baseStats = getBaseStats();

	if (availableStances.includes('S') && shouldScryerStance(baseStats, availableStances)) return;

	const autoStance = getPageSetting('AutoStance');
	if (autoStance === 1) autoStanceAdvanced(baseStats, availableStances);
	if (autoStance === 2 && availableStances.includes('D')) safeSetStance(2);
}

function voidMapScryer(availableStances = unlockedStances()) {
	const settingPrefix = trimpStats.isDaily ? 'd' : '';
	if (game.global.voidBuff && game.talents.scry2.purchased && getPageSetting(`${settingPrefix}scryvoidmaps`)) {
		const useWindStance = availableStances.includes('W') && getEmpowerment() !== 'Wind';
		safeSetStance(useWindStance ? 'W' : 'S');
		return true;
	}

	return false;
}

function autoLevelStance(availableStances = unlockedStances()) {
	if ((game.global.mapsActive || game.global.preMapsActive) && !game.global.voidBuff && mapSettings.mapName && getPageSetting('autoLevelTest') && getPageSetting('autoMaps') && getPageSetting('autoLevelScryer')) {
		const ignoreSettings = new Set(['Void Map', 'Prestige Climb', 'Prestige Raiding', 'Bionic Raiding']);
		if (!ignoreSettings.has(mapSettings.mapName)) {
			const speedSettingsSet = new Set(['Map Bonus', 'Experience']);
			const checkSpeed = speedSettingsSet.has(mapSettings.mapName);
			const autoLevelData = hdStats.autoLevelData[checkSpeed ? 'speed' : 'loot'];

			if (['S', 'W'].includes(autoLevelData.stance)) {
				const stance = autoLevelData.stance === 'W' && availableStances.includes('W') && getEmpowerment() !== 'Wind' ? 'W' : 'S';
				safeSetStance(stance);
				return true;
			}
		}
	}

	return false;
}

function shouldWindStance() {
	if (game.global.mapsActive || getUberEmpowerment() !== 'Wind' || getEmpowerment() !== 'Wind') return false;

	const settingPrefix = trimpStats.isDaily ? 'd' : '';
	if (!getPageSetting(settingPrefix + 'AutoStanceWind')) return false;
	if (liquifiedZone() && getPageSetting(settingPrefix + 'WindStackingLiq')) return true;

	const windStackRatio = getPageSetting(settingPrefix + 'WindStackingRatio');
	if ((hdStats.hdRatio < windStackRatio || windStackRatio <= 0) && game.global.world >= getPageSetting(settingPrefix + 'WindStackingZone')) return true;

	return false;
}

function shouldScryerStance(baseStats = getBaseStats(), availableStances = unlockedStances()) {
	if (game.global.preMapsActive || !getPageSetting('AutoStanceScryer')) return false;

	const mapsActive = game.global.mapsActive;

	if (!mapsActive && getPageSetting('scryerEssenceOnly') && countRemainingEssenceDrops() < 1) return false;

	const empowerment = getEmpowerment();
	const useWindStance = availableStances.includes('W') && empowerment !== 'Wind';
	const scryStance = useWindStance ? 'W' : 'S';
	const scrySettings = _getScrySettings();
	const aboveMaxZone = scrySettings.MaxZone > 0 && game.global.world >= scrySettings.MaxZone;

	if (aboveMaxZone && scrySettings.MinMaxWorld === 1) return false;

	const mapObject = mapsActive ? getCurrentMapObject() : null;
	const currentEnemy = getCurrentEnemy(1);
	const nextEnemy = getCurrentEnemy(2);

	const [transitionRequired, never_scry] = scryNever(scrySettings, mapObject, currentEnemy, nextEnemy, empowerment, aboveMaxZone);
	if (never_scry) return false;

	if (scryForce(scrySettings, mapObject, currentEnemy, empowerment, scryStance)) return true;

	if (!readyToSwitch(scryStance, baseStats)) return false;

	if (currentEnemy && scryOverkill(scrySettings, mapsActive, scryStance)) return true;

	if (scryTransition(scryStance, scrySettings, baseStats, availableStances, transitionRequired)) return true;

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

function scryNever(scrySettings = scrySettings(), mapObject = getCurrentMapObject(), currentEnemy = getCurrentEnemy(1), nextEnemy = getCurrentEnemy(2), empowerment = getEmpowerment(), aboveMaxZone = false) {
	const mapsActive = game.global.mapsActive;
	let never_scry = false;
	let transitionRequired = false;

	if (mapsActive) {
		never_scry |= scrySettings.Maps === 0 && mapObject.location !== 'Void' && mapObject.location !== 'Bionic' && mapObject.level <= game.global.world;
		never_scry |= scrySettings.PlusMaps === 0 && mapObject.level > game.global.world && mapObject.location !== 'Void' && mapObject.location !== 'Bionic';
		never_scry |= mapObject.location === 'Void' && scrySettings.VoidMaps === 0;
		never_scry |= mapObject.location === 'Bionic' && scrySettings.BW === 0;
	} else {
		never_scry |= game.global.spireActive && scrySettings.Spire === 0;
		never_scry |= scrySettings.SkipBoss === 0 && game.global.lastClearedCell + 2 === 100;
		//0 is disabled, -1 is maybe, any value higher than 0 is the zone you would like to not run Scryer in that empowerment band.
		never_scry |= empowerment && (scrySettings[empowerment] === 0 || (scrySettings[empowerment] > 0 && game.global.world >= scrySettings[empowerment]));
	}

	//See if current OR next enemy is corrupted.
	const isCorrupt = currentEnemy && currentEnemy.mutation === 'Corruption';
	const nextIsCorrupt = nextEnemy && nextEnemy.mutation === 'Corruption';
	//If next isn't corrupted AND we need to transition OR we can one shot the next enemy with full overkill, then we can scry next.
	const scryNext = !nextIsCorrupt && oneShotPower('S', 0, true);
	const skipOnMaxZone = scrySettings.MinMaxWorld === 2 && scrySettings.Corrupted !== 1 && aboveMaxZone;

	const skipCorrupted = scrySettings.Corrupted === 0;
	//If we are fighting a corrupted cell and we are not allowed to scry corrupted cells, then we can't scry.
	if (!mapsActive && (skipCorrupted || skipOnMaxZone) && isCorrupt) {
		transitionRequired = true;
		never_scry |= !scryNext;
	}

	//check Healthy never -- TODO
	const isHealthy = currentEnemy && currentEnemy.mutation === 'Healthy';

	if (never_scry || (isHealthy && scrySettings.Healthy === 0)) return [transitionRequired, true];

	return [transitionRequired, false];
}

function scryForce(scrySettings = scrySettings(), mapObject = getCurrentMapObject(), currentEnemy = getCurrentEnemy(1), empowerment = getEmpowerment(), scryStance = 'S') {
	const mapsActive = game.global.mapsActive;
	let force_scry = false;

	if (mapsActive) {
		force_scry |= scrySettings.Maps === 1 && mapObject.location !== 'Void' && mapObject.location !== 'Bionic' && mapObject.level <= game.global.world;
		force_scry |= mapObject.level > game.global.world && scrySettings.PlusMaps === 1 && mapObject.location !== 'Bionic';
		force_scry |= mapObject.location === 'Void' && scrySettings.VoidMaps === 1;
		force_scry |= mapObject.location === 'Bionic' && scrySettings.BW === 1;
	} else {
		force_scry |= game.global.spireActive && scrySettings.Spire === 1;
		force_scry |= empowerment && scrySettings[empowerment] > 0 && game.global.world <= scrySettings[empowerment];
	}

	const isCorrupt = currentEnemy && currentEnemy.mutation === 'Corruption' && scrySettings.Corrupted === 1;
	const isHealthy = currentEnemy && currentEnemy.mutation === 'Healthy' && scrySettings.Healthy === 1;

	if (force_scry || isHealthy || isCorrupt) {
		safeSetStance(scryStance);
		return true;
	}
}

function scryOverkill(scrySettings = scrySettings(), mapsActive = game.global.mapsActive, scryStance = 'S') {
	const useOverkill = getPageSetting('scryerOverkill') && !(scrySettings.Spire === 0 && !mapsActive && isDoingSpire());

	if (useOverkill) {
		//Switches to S/W if it has enough damage to secure an overkill
		const HS = oneShotPower(scryStance);
		const HSD = oneShotPower('D', 0, true);
		const HS_next = oneShotPower(scryStance, 1);
		const HSD_next = oneShotPower('D', 1, true);
		if (HS > 0 && HS >= HSD && (HS > 1 || (HS_next > 0 && HS_next >= HSD_next))) {
			safeSetStance(scryStance);
			return true;
		}
	}

	return false;
}

function scryTransition(scryStance = 'S', scrySettings = scrySettings(), baseStats = getBaseStats(), availableStances = unlockedStances(), transitionRequired = false) {
	const min_zone = scrySettings.MinZone;
	const max_zone = scrySettings.MaxZone;
	const valid_min = game.global.world >= min_zone && game.global.world > 60;
	const valid_max = max_zone < 1 || (max_zone > 0 && game.global.world < max_zone);

	if (valid_min && valid_max && (!game.global.mapsActive || scrySettings.MinMaxWorld === 0)) {
		//Smooth transition to S before killing the target
		if (transitionRequired) {
			const stances = [
				{ stance: 'X', value: scryStance },
				{ stance: 'H', value: 1 }
			];

			if (availableStances.includes('B')) {
				stances.unshift({ stance: 'B', value: 3 }, { stance: 'XB', value: scryStance });
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

		//Set to scry if it won't kill us, or we are willing to die for it
		safeSetStance(scryStance);
		return true;
	}
}

function readyToSwitch(stance = 'S', baseStats = getBaseStats()) {
	const essenceLeft = !getPageSetting('scryerEssenceOnly') || countRemainingEssenceDrops() >= 1;

	const dieZone = getPageSetting('scryerDieZone');
	let die = dieZone !== -1 && game.global.world >= dieZone && essenceLeft;
	const willSuicide = dieZone;

	//Check if we are allowed to suicide in our current cell and zone
	if (die && willSuicide >= 0) {
		let [dieZ, dieC] = willSuicide.toString().split('.');
		if (dieC && dieC.length === 1) dieC = dieC + '0';
		die = game.global.world >= dieZ && (!dieC || game.global.lastClearedCell + 1 >= dieC);
	}

	return die || wouldSurvive(stance, 2, baseStats);
}

function autoStanceAdvanced(baseStats = getBaseStats(), availableStances = unlockedStances()) {
	if (game.global.gridArray.length === 0) return;

	const currentEnemy = getCurrentEnemy();
	if (typeof currentEnemy === 'undefined') return;

	const critSources = getCritPower(currentEnemy);
	const checkWind = availableStances.includes('W') && !getEmpowerment('Wind');
	let prefferedStance = availableStances.includes('D') ? 'D' : 'X';

	if (availableStances.includes('S')) {
		const oneShotDomination = oneShotPower(prefferedStance, 0, false);

		if (oneShotDomination > 0) {
			if (checkWind && oneShotPower('W', 0, false) >= oneShotDomination) prefferedStance = 'W';
			else if (oneShotPower('S', 0, false) >= oneShotDomination) prefferedStance = 'S';
		}
	}

	const stances = [{ stance: 'H', value: 1 }];

	if (checkWind && stances[0].stance !== 'W') {
		stances.unshift({ stance: 'W', value: 5 });
	} else {
		stances.unshift({ stance: 'X', value: 0 });
	}

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
