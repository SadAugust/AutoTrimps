function safeSetStance(stance) {
	if (!stance && stance !== 0) return;
	if (game.global.formation === stance) return;
	const currFormation = game.global.formation;
	const formationLetter = ['X', 'H', 'D', 'B', 'S', 'W'];
	if (typeof stance === 'string') stance = formationLetter.indexOf(stance);

	if (game.global.formation !== stance) {
		debug(`Setting stance from ${formationLetter[currFormation]} to ${formationLetter[stance]}.`, 'stance');
		setFormation(stance.toString());
	}
}

function currentStance(stance) {
	if (!stance) stance = game.global.formation;
	const formationLetter = stance === 5 ? 'W' : stance === 4 ? 'S' : stance === 3 ? 'B' : stance === 2 ? 'D' : stance === 1 ? 'H' : 'X';

	return formationLetter;
}

function calcBaseDamageInX() {
	MODULES.stats.baseMinDamage = calcOurDmg('min', 'X', false, false, 'never');
	MODULES.stats.baseMaxDamage = calcOurDmg('max', 'X', false, false, 'force');
	MODULES.stats.baseDamage = calcOurDmg('avg', 'X');
	MODULES.stats.baseHealth = calcOurHealth(false, false, true);
	MODULES.stats.baseBlock = calcOurBlock(false);
}

function debugStance(maxPower, ignoreArmy) {
	//Returns what stance we should be using right now, or false if none grants survival
	for (let critPower = 2; critPower >= -2; critPower--) {
		if (survive('D', critPower, ignoreArmy)) {
			return 'D' + critPower;
		} else if (survive('XB', critPower, ignoreArmy)) {
			return 'XB' + critPower;
		} else if (survive('B', critPower, ignoreArmy)) {
			return 'B' + critPower;
		} else if (survive('X', critPower, ignoreArmy)) {
			return 'X' + critPower;
		} else if (survive('H', critPower, ignoreArmy)) {
			return 'H' + critPower;
		} else if (maxPower) break;
	}
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

	return targetZone <= game.stats.highestRadLevel.valueTotal() * allowed;
}

function maxOneShotPower(planToMap, targetZone = game.global.world) {
	let power = 2;

	if (game.global.universe === 1) {
		//No overkill perk
		if (game.portal.Overkill.level === 0) return 1;
		//Mastery
		if (game.talents.overkill.purchased) power++;
		//Fluffy
		const overkiller = Fluffy.isRewardActive('overkiller');
		if (overkiller) power += overkiller;
		//Ice
		const uberEmpowerment = getUberEmpowerment();
		if (uberEmpowerment === 'Ice') power += 2;
		const empowerment = getEmpowerment();
		const iceLevel = game.empowerments.Ice.getLevel();
		if (empowerment === 'Ice' && iceLevel >= 50) power++;
		if (empowerment === 'Ice' && iceLevel >= 100) power++;
	} else if (game.global.universe === 2) {
		const overkill = canU2OverkillAT(targetZone);
		if (!overkill && planToMap && u2Mutations.tree.MadMap.purchased) return power;
		if (!overkill) return 1;

		if (u2Mutations.tree.MaxOverkill.purchased) power++;
	}

	return power;
}

function oneShotPower(specificStance, offset = 0, maxOrMin) {
	//Calculates our minimum damage
	const baseDamage = calcOurDmg(maxOrMin ? 'max' : 'min', specificStance, true, false, 'never');
	let damageLeft = baseDamage + addPoison(true);

	//Calculates how many enemies we can one shot + overkill
	const overkill = maxOneShotPower();
	for (var power = 1; power <= overkill; power++) {
		//No enemy to overkill (usually this happens at the last cell)
		const currentEnemy = getCurrentEnemy(power + offset);
		if (!currentEnemy) return power + offset - 1;

		//Enemy Health: current enemy or his neighbours
		if (power + offset > 1) damageLeft -= calcSpecificEnemyHealth(undefined, undefined, currentEnemy.level);
		else damageLeft -= getCurrentEnemy().health;

		//Check if we can one shot the next enemy
		if (damageLeft < 0) return power - 1;

		//Calculates our minimum 'left over' damage, which will be used by the Overkill
		damageLeft *= 0.005 * game.portal.Overkill.level;
	}

	return power - 1;
}

function challengeDamage(maxHealth = calcOurHealth(), minDamage, maxDamage, missingHealth, block = calcOurBlock(false), pierce, critPower = 2, formation) {
	if (!minDamage) minDamage = calcOurDmg('min', formation) + addPoison(true);
	if (!maxDamage) maxDamage = calcOurDmg('max', formation) + addPoison(true);
	if (!missingHealth) missingHealth = game.global.soldierHealthMax - game.global.soldierHealth;
	if (!pierce) pierce = game.global.brokenPlanet && !game.global.mapsActive ? getPierceAmt() : 0;

	//Enemy
	const enemy = getCurrentEnemy();
	const enemyHealth = enemy.health;
	const enemyDamage = calcSpecificEnemyAttack(critPower);

	//Active Challenges
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

	//Electricity Lead - Tox/Nom
	if (electricityChallenge) challengeDamage = game.challenges.Electricity.stacks * 0.1;
	else if (drainChallenge) challengeDamage = 0.05;

	//Plague & Bogged (Daily)
	if (dailyPlague) challengeDamage = dailyModifiers.plague.getMult(game.global.dailyChallenge.plague.strength, 1 + game.global.dailyChallenge.plague.stacks);
	if (dailyBogged) challengeDamage = dailyModifiers.bogged.getMult(game.global.dailyChallenge.bogged.strength);

	//Lead - Only takes damage if the enemy doesn't die
	if (leadChallenge && minDamage < enemyHealth) harm += maxHealth * game.challenges.Lead.stacks * 0.0003;

	//Adds Drain Damage -- % of max health
	harm += maxHealth * challengeDamage;

	//Adds Bleed Damage -- % of current health
	if (game.global.voidBuff === 'bleed' || enemy.corrupted === 'corruptBleed' || enemy.corrupted === 'healthyBleed') {
		challengeDamage = enemy.corrupted === 'healthyBleed' ? 0.3 : 0.2;
		harm += (maxHealth - missingHealth) * challengeDamage;
	}

	//Explosive Daily
	if (dailyExplosive && critPower >= 0) {
		const explosionDmg = enemyDamage * dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength);
		if (maxDamage >= enemyHealth && maxHealth > block) harm += Math.max(explosionDmg - block, explosionDmg * pierce);
	}

	//Mirrored (Daily) -- Unblockable, unpredictable
	if (dailyMirrored && critPower >= -1) harm += Math.min(maxDamage - addPoison(true), enemyHealth) * dailyModifiers.mirrored.getMult(game.global.dailyChallenge.mirrored.strength);

	return harm;
}

function directDamage(block = calcOurBlock(true, true), pierce, currentHealth, minDamage, critPower = 2, stance = 'X') {
	if (!pierce) pierce = game.global.brokenPlanet && !game.global.mapsActive ? getPierceAmt() : 0;
	if (!currentHealth) currentHealth = calcOurHealth(true, false, true) - (game.global.soldierHealthMax - game.global.soldierHealth);
	if (!minDamage) minDamage = calcOurDmg('min', stance, true, false, 'never') * (game.global.titimpLeft > 0 ? 2 : 1) + addPoison(true);

	const enemy = getCurrentEnemy();
	const enemyHealth = enemy.health;
	const enemyDamage = calcSpecificEnemyAttack(critPower, block, currentHealth);

	// Applies pierce
	let harm = Math.max(enemyDamage - block, pierce * enemyDamage, 0);

	const isDoubleAttack = game.global.voidBuff === 'doubleAttack' || enemy.corrupted === 'corruptDbl' || enemy.corrupted === 'healthyDbl';
	const enemyFast = isDoubleAttack || challengeActive('Slow') || ((game.badGuys[enemy.name].fast || enemy.mutation === 'Corruption') && !challengeActive('Coordinate') && !challengeActive('Nom'));

	// Dodge dailies
	if (challengeActive('Daily') && typeof game.global.dailyChallenge.slippery !== 'undefined') {
		const slipStr = game.global.dailyChallenge.slippery.strength;
		var dodgeDaily = (slipStr > 15 && game.global.world % 2 === 0) || (slipStr <= 15 && game.global.world % 2 === 1);
	}

	// Double attack and one shot situations
	if (isDoubleAttack && minDamage < enemyHealth) harm *= 2;
	if (!enemyFast && !dodgeDaily && minDamage > enemyHealth) harm = 0;

	return harm;
}

function survive(formation = 'S', critPower = 2, ignoreArmy) {
	//Check if the formation is valid
	if (formation === 'D' && !game.upgrades.Dominance.done) return false;
	if (formation === 'XB' && !game.upgrades.Barrier.done) return false;
	if (formation === 'B' && !game.upgrades.Barrier.done) return false;
	if (formation === 'H' && !game.upgrades.Formations.done) return false;
	if (formation === 'S' && (game.global.world < 60 || game.stats.highestLevel.valueTotal() < 180)) return false;

	//Base stats
	let health = MODULES.stats.baseHealth;
	let block = MODULES.stats.baseBlock;
	let missingHealth = game.global.soldierHealthMax - game.global.soldierHealth;

	//More stats
	let minDamage = MODULES.stats.baseMinDamage;
	let maxDamage = MODULES.stats.baseMaxDamage;
	let newSquadRdy = !ignoreArmy && newArmyRdy();

	//Applies the formation modifiers
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

	//Max health for XB formation
	let maxHealth = health * (formation === 'XB' ? 2 : 1);

	//Empowerments - Poison
	const poisonDmg = addPoison(true);
	minDamage += poisonDmg;
	maxDamage += poisonDmg;

	//Pierce
	let pierce = game.global.brokenPlanet && !game.global.mapsActive ? getPierceAmt() : 0;
	if (formation !== 'B' && game.global.formation === 3) pierce *= 2;

	let notSpire = game.global.mapsActive || !game.global.spireActive;
	//Decides if the trimps can survive in this formation
	let harm = directDamage(block, pierce, health - missingHealth, minDamage, critPower, formation) + challengeDamage(maxHealth, minDamage, maxDamage, missingHealth, block, pierce, critPower, formation);

	//Updated Genes and Block
	let blockier = calcOurBlock(false, false);
	let healthier = health * Math.pow(1.01, game.jobs.Geneticist.owned - game.global.lastLowGen);
	let maxHealthier = maxHealth * Math.pow(1.01, game.jobs.Geneticist.owned - game.global.lastLowGen);
	let harm2 = directDamage(blockier, pierce, healthier, minDamage, critPower, formation) + challengeDamage(maxHealthier, minDamage, maxDamage, 0, blockier, pierce, critPower, formation);

	return (newSquadRdy && notSpire && healthier > harm2) || health - missingHealth > harm;
}

function checkStanceSetting() {
	if (!game.upgrades.Formations.done) return;

	if (game.global.mapsActive && getPageSetting('autoLevelTest') && getPageSetting('autoMaps')) {
		const ignoreSettings = new Set(['Void Maps', 'Prestige Climb', 'Prestige Raiding', 'Bionic Raiding']);
		if (!ignoreSettings.has(mapSettings.mapName)) {
			const speedSettingsSet = new Set(['Map Bonus', 'Experience']);
			const checkSpeed = speedSettingsSet.has(mapSettings.mapName);
			const autoLevelData = hdStats.autoLevelData[checkSpeed ? 'speed' : 'loot'];

			if (autoLevelData.stance === 'S') {
				safeSetStance(autoLevelData.stance);
				return;
			}

			/* const mapLevel = MODULES.maps.lastMapWeWereIn.level - game.global.world;
			if (mapLevel === autoLevelData.mapLevel) {
			safeSetStance(autoLevelData.stance);
			return;
			} */
		}
	}

	const settingPrefix = trimpStats.isDaily ? 'd' : '';
	if (game.global.spireActive && getPageSetting((trimpStats.isC3 ? 'c2' : settingPrefix) + 'AutoDStanceSpire')) autoStanceD(true);
	else if (getPageSetting('AutoStanceScryer')) useScryerStance();
	else if (game.global.mapsActive && game.global.voidBuff && game.talents.scry2.purchased && getPageSetting(settingPrefix + 'scryvoidmaps')) useScryerStance();
	else {
		const AutoStance = getPageSetting('AutoStance');
		if (getPageSetting(settingPrefix + 'AutoStanceWind')) autoStanceWind();
		else if (AutoStance === 1) autoStance();
		else if (AutoStance === 2) autoStanceD();
	}
}

function autoStance(force) {
	calcBaseDamageInX();
	const autoStanceSetting = force ? 1 : getPageSetting('AutoStance');
	if (autoStanceSetting !== 1) return;
	//Invalid Map - Dead Soldiers - Auto Stance Disabled - Formations Unavailable - No Enemy
	if (game.global.soldierHealth <= 0 || game.global.gridArray.length === 0 || !game.upgrades.Dominance.done) return;
	const currentEnemy = getCurrentEnemy();
	if (typeof currentEnemy === 'undefined') return;
	//Keep on D vs the Domination bosses
	if (challengeActive('Domination') && (game.global.lastClearedCell === 98 || (currentEnemy && currentEnemy.name === 'Cthulimp'))) {
		autoStanceD(true);
		return;
	}

	//If no formation can survive a mega crit, it ignores it, and recalculates for a regular crit, then no crit
	//If even that is not enough, then it ignore Explosive Daily, and finally it ignores Reflect Daily
	let critPower;
	const critSources = getCritPower(currentEnemy);
	for (critPower = 2; critPower >= -2; critPower--) {
		if (critPower === 2 && (!critSources.regular || !critSources.challenge)) continue;
		if (critPower === 1 && !critSources.regular && !critSources.challenge) continue;
		if (critPower === 0 && !critSources.explosive) continue;
		if (critPower === -1 && !critSources.reflect) continue;

		if (survive('D', critPower)) {
			safeSetStance(2);
			break;
		} else if (survive('XB', critPower)) {
			safeSetStance(0);
			break;
		} else if (survive('B', critPower)) {
			safeSetStance(3);
			break;
		} else if (survive('X', critPower)) {
			safeSetStance(0);
			break;
		} else if (survive('H', critPower)) {
			safeSetStance(1);
			break;
		}
	}

	//If it cannot survive the worst case scenario on any formation, attempt it's luck on H, if available, or X
	if (critPower < -2) {
		safeSetStance(1);
	}
}

function autoStanceD(force) {
	if (!game.upgrades.Dominance.done || game.global.soldierHealth <= 0) return;
	if (!force && getPageSetting('AutoStance') !== 2) return;

	safeSetStance(2);
}

function autoStanceWind() {
	//Fail safes
	if (game.global.gridArray.length === 0 || !game.upgrades.Formations.done || game.global.soldierHealth <= 0) return;
	const currentStance = useWindStance();
	//If we should use Wind Stance, and the checks in useWindStance don't return false then use it
	if (currentStance) {
		safeSetStance(5);
	}
	//Otherwise use your AutoStance setting.
	else {
		const autoStanceSetting = getPageSetting('AutoStance');
		if (autoStanceSetting === 1) autoStance(true);
		if (autoStanceSetting === 2) autoStanceD(true);
	}
}

function useWindStance() {
	if (game.global.mapsActive || getUberEmpowerment() !== 'Wind' || getEmpowerment() !== 'Wind') return false;

	const settingPrefix = trimpStats.isDaily ? 'd' : '';
	if (!getPageSetting(settingPrefix + 'AutoStanceWind')) return false;

	if (liquifiedZone() && getPageSetting(settingPrefix + 'WindStackingLiq')) return true;

	const windStackRatio = getPageSetting(settingPrefix + 'WindStackingRatio');
	if ((hdStats.hdRatio < windStackRatio || windStackRatio <= 0) && game.global.world >= getPageSetting(settingPrefix + 'WindStackingZone')) return true;

	return false;
}
