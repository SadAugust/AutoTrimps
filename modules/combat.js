function callBetterAutoFight() {
	_avoidEmpower();
	_trimpicide();
	const autoFightSetting = getPageSetting('autoFight');

	if (autoFightSetting === 0) return;
	if (autoFightSetting === 1) _betterAutoFight();
	else if (autoFightSetting === 2) _betterAutoFightVanilla();
}

function newArmyRdy() {
	const { trimps } = game.resources;
	const challenges = ['Trapper', 'Trappapalooza'];

	if (challenges.includes(trimpStats.currChallenge) && getPageSetting('trapper')) {
		let popSetting = getPageSetting('trapperArmyPct');
		popSetting = Math.min(popSetting, 100);
		if (popSetting <= 0) return true;
		return trimps.owned > trimps.getCurrentSend() * popSetting;
	}

	return trimps.realMax() <= trimps.owned;
}

function _betterAutoFight() {
	if (game.global.autoBattle && !game.global.pauseFight) pauseFight();
	if (game.global.gridArray.length === 0 || game.global.preMapsActive || !game.upgrades.Battle.done || MODULES.maps.lifeActive) return;
	if (!game.global.fighting && (game.global.soldierHealth > 0 || newArmyRdy())) battle(true);
}

function _betterAutoFightVanilla() {
	if (game.global.autoBattle && game.global.pauseFight && !game.global.spireActive) pauseFight();
	if (game.global.gridArray.length === 0 || !game.upgrades.Battle.done || game.global.fighting) return;
	if (game.global.world === 1 && !game.global.fighting && game.resources.trimps.owned === game.resources.trimps.realMax()) battle(true);
}

/* 	Suicides trimps if we don't have max anticipation stacks and sending a new army would give us max stacks.
	Doesn't do this inside of void maps OR spires. */
function _trimpicide() {
	if (game.global.universe !== 1 || game.portal.Anticipation.level === 0) return;
	if (!game.global.fighting || !getPageSetting('forceAbandon')) return;

	const antistacklimit = masteryPurchased('patience') ? 45 : 30;
	if (game.global.antiStacks >= antistacklimit) return;

	const mapsActive = game.global.mapsActive;
	if (!mapsActive && game.global.spireActive) return;
	if (!newArmyRdy()) return;

	const amalgsOwned = game.jobs.Amalgamator.owned > 0;
	const lastTimeSent = Math.floor((getGameTime() - game.global.lastSoldierSentAt) / 1000);
	const breedTime = Math.floor(game.global.lastBreedTime / 1000);
	const baseCheck = (amalgsOwned ? lastTimeSent : breedTime) >= antistacklimit;

	if (baseCheck) {
		_forceAbandonTrimps();
	}
}

// Abandons trimps to get max anticipation stacks.
function _forceAbandonTrimps() {
	if (!getPageSetting('forceAbandon') || !getPageSetting('autoMaps')) return;
	if (!game.global.mapsUnlocked || game.global.preMapsActive) return;

	if (game.global.mapsActive) {
		mapsClicked(true);
		runMap();
	} else {
		mapsClicked(true);
		mapsClicked(true);
	}

	debug(`Abandoning Trimps to resend army with max Anticipation stacks.`, 'other');
}

// Check if we would die from the next enemy attack - Only used in U1
function _armyDeath() {
	if (game.global.universe !== 1 || game.global.mapsActive || game.global.soldierHealth <= 0 || !getPageSetting('avoidEmpower')) return false;

	const enemy = getCurrentEnemy();
	const fluctuation = game.global.universe === 2 ? 1.5 : 1.2;
	const runningDaily = challengeActive('Daily');
	const dailyChallenge = game.global.dailyChallenge;

	if (!runningDaily || (runningDaily && typeof dailyChallenge.empower === 'undefined')) return false;

	let ourHealth = game.global.soldierHealth;
	let block = game.global.soldierCurrentBlock;
	if (game.global.formation !== 0) block = game.global.formation === 3 ? (block /= 4) : (block *= 2);
	enemyAttack = enemy.attack * fluctuation;

	if (getEmpowerment() === 'Ice') enemyAttack *= game.empowerments.Ice.getCombatModifier();

	if (runningDaily && typeof dailyChallenge.empower !== 'undefined') {
		enemyAttack *= dailyModifiers.empower.getMult(dailyChallenge.empower.strength, dailyChallenge.empower.stacks);
	}

	const pierce = getPierceAmt();
	enemyAttack -= game.global.soldierCurrentBlock;
	if (pierce > 0) {
		const atkPierce = pierce * enemyAttack;
		if (enemyAttack < atkPierce) enemyAttack = atkPierce;
	}
	if (enemyAttack <= 0) enemyAttack = 0;

	if (runningDaily) {
		if (typeof dailyChallenge.crits !== 'undefined') enemyAttack *= dailyModifiers.crits.getMult(dailyChallenge.crits.strength);
		if (typeof dailyChallenge.bogged !== 'undefined') ourHealth -= game.global.soldierHealthMax * dailyModifiers.bogged.getMult(dailyChallenge.bogged.strength);
		if (typeof dailyChallenge.plague !== 'undefined') ourHealth -= game.global.soldierHealthMax * dailyModifiers.plague.getMult(dailyChallenge.plague.strength, dailyChallenge.plague.stacks);
	}

	if (enemy.corrupted) {
		if (enemy.corrupted === 'corruptCrit') enemyAttack *= 5;
		else if (enemy.corrupted === 'healthyCrit') enemyAttack *= 7;
		else if (enemy.corrupted === 'corruptBleed') ourHealth *= 0.8;
		else if (enemy.corrupted === 'healthyBleed') ourHealth *= 0.7;
	}

	return ourHealth - enemyAttack <= 0;
}

function _avoidEmpower() {
	if (!_armyDeath()) return;

	if (game.global.mapsActive && !game.global.voidBuff) {
		mapsClicked(true);
		runMap(false);
	} else if (!game.global.mapsActive) {
		mapsClicked(true);
		mapsClicked(true);
	}

	debug(`Abandoning Trimps to avoid Empower stacks.`, `other`);
}

function _setEquality(equality) {
	const eqSetting = game.portal.Equality.settings[game.global.spireActive ? 'spire' : 'reg'];
	if (eqSetting.disabledStackCount === equality) return;

	eqSetting.disabledStackCount = equality;
	manageEqualityStacks();
	updateEqualityScaling();
}

function _equalityManagementBasic() {
	if (game.global.preMapsActive || game.global.gridArray.length <= 0) return;
	const eqSetting = game.portal.Equality.settings[game.global.spireActive ? 'spire' : 'reg'];

	const runningDesolation = challengeActive('Desolation');

	if (runningDesolation && mapSettings.equality && getPageSetting('autoMaps')) {
		eqSetting.scalingActive = false;
		_setEquality(game.portal.Equality.radLevel);
		return;
	}

	const experienced = challengeActive('Exterminate') && game.challenges.Exterminate.experienced;
	const fastEnemy = atData.fightInfo.fastImps.includes(getCurrentEnemy().name) || experienced;
	const voidDoubleAttack = game.global.mapsActive && getCurrentMapObject().location === 'Void' && getCurrentMapObject().voidBuff === 'doubleAttack';
	const noFrenzy = game.portal.Frenzy.radLevel > 0 && game.portal.Frenzy.frenzyStarted === -1 && !autoBattle.oneTimers.Mass_Hysteria.owned;
	const runningGlass = challengeActive('Glass');

	if (fastEnemy || voidDoubleAttack || noFrenzy || runningGlass || runningDesolation) {
		if (!eqSetting.scalingActive) {
			eqSetting.scalingActive = true;
			manageEqualityStacks();
			updateEqualityScaling();
		}
	} else {
		if (eqSetting.scalingActive) {
			eqSetting.scalingActive = false;
			manageEqualityStacks();
			updateEqualityScaling();
		}
	}
}

function _calculateDamageEquality(damage, equalityModifier, equalityLevel) {
	return damage * Math.pow(equalityModifier, equalityLevel);
}

function _checkEnemyDamage(enemyDmg, enemyDmgEquality, ourHealth, enemyDamageMult, disableDamageAmps) {
	if (enemyDmgEquality > ourHealth && enemyDamageMult !== 0 && !disableDamageAmps) {
		return { reset: true, disableDamageAmps: true, enemyDmg: enemyDmg / enemyDamageMult };
	}

	return { reset: false, disableDamageAmps, enemyDmg };
}

function _isOddValue(number) {
	return number.toString()[0] % 2 === 1;
}

function _checkDesoDestack() {
	const runningDesolation = challengeActive('Desolation');
	const destackZone = game.global.world >= getPageSetting('destackOnlyZone');
	const autoMapsEnabled = getPageSetting('autoMaps');

	if (runningDesolation && mapSettings.equality && destackZone && autoMapsEnabled) {
		_setEquality(getPerkLevel('Equality'));
		return true;
	}

	return false;
}

function _getGammaMaxStacks(worldType) {
	const gammaDmg = MODULES.heirlooms.gammaBurstPct;
	if (gammaDmg === 1) return 0;

	const maxStacks = gammaMaxStacks(false, false, worldType);
	return maxStacks;
}

function _getOurHealth(mapping, worldType, forceMax = false) {
	const angelicOwned = masteryPurchased('angelic');
	const runningTrappa = challengeActive('Trappapalooza');
	const runningRevenge = challengeActive('Revenge') && game.challenges.Revenge.stacks === 19;
	const runningBerserk = challengeActive('Berserk') && game.challenges.Berserk.weakened !== 20;
	const frenzyCanExpire = getPerkLevel('Frenzy') > 0 && !autoBattle.oneTimers.Mass_Hysteria.owned && game.portal.Frenzy.frenzyActive();
	const isDaily = challengeActive('Daily');
	const dailyChallenge = game.global.dailyChallenge;
	const dailyEmpower = isDaily && !mapping && typeof dailyChallenge.empower !== 'undefined';
	const angelicDance = angelicOwned && (runningTrappa || runningRevenge || runningBerserk || frenzyCanExpire || dailyEmpower);
	const shieldBreak = challengeActive('Bublé') || getCurrentQuest() === 8 || runningRevenge || (game.global.spireActive && worldType === 'world');

	return remainingHealth(shieldBreak, angelicDance, worldType, forceMax);
}

function _adjustFrenzyDamage(damage) {
	const frenzyMult = 1 + 0.5 * getPerkLevel('Frenzy');
	const frenzyCalcSetting = getPageSetting('frenzyCalc');

	return frenzyCalcSetting ? damage / frenzyMult : damage * frenzyMult;
}

function _getBionicTalent() {
	if (!game.global.mapsActive) return 0;

	const purchased = masteryPurchased('bionic2');
	const mapObject = getCurrentMapObject();
	const mapLevel = mapObject.level;
	const bionicTalent = purchased && mapLevel > game.global.world ? mapLevel : 0;

	return bionicTalent;
}

function _getOurDmg(worldType, enemy) {
	let fastEnemy = checkFastEnemy(enemy);

	const bionicTalent = _getBionicTalent();
	const critType = challengeActive('Wither') || challengeActive('Glass') ? 'never' : 'maybe';
	const runningUnlucky = challengeActive('Unlucky');
	const runningDaily = challengeActive('Daily');
	const dailyChallenge = game.global.dailyChallenge;
	const dmgType = runningUnlucky ? 'max' : 'avg';

	let ourDmg = calcOurDmg(dmgType, 0, false, worldType, critType, bionicTalent, true) * _getRampageBonus();
	let unluckyDmg = runningUnlucky ? calcOurDmg('min', 0, false, worldType, 'never', bionicTalent, true) : 2;

	const frenzyCanExpire = getPerkLevel('Frenzy') > 0 && !autoBattle.oneTimers.Mass_Hysteria.owned;
	const frenzyActive = game.portal.Frenzy.frenzyActive();

	if (frenzyCanExpire) {
		const frenzySetting = getPageSetting('frenzyCalc');
		const shouldAdjustDamage = frenzySetting !== frenzyActive;

		if (shouldAdjustDamage) {
			ourDmg = _adjustFrenzyDamage(ourDmg);
			if (runningUnlucky) unluckyDmg = _adjustFrenzyDamage(unluckyDmg);
		}
	}

	if (frenzyCanExpire && (frenzyActive || enemy.health / ourDmg > 10)) fastEnemy = true;

	const dailyWeakness = runningDaily && typeof dailyChallenge.weakness !== 'undefined';
	if (dailyWeakness) ourDmg *= 1 - ((dailyChallenge.weakness.stacks + (fastEnemy ? 1 : 0)) * dailyChallenge.weakness.strength) / 100;

	return { ourDmg, unluckyDmg, fastEnemy };
}

function _checkDuelSuicide(worldType, fastEnemy, ourHealth) {
	if (!challengeActive('Duel') || game.global.armyAttackCount !== 0) return false;

	const healthBuffActive = calcOurHealth(false, worldType) * 9 < ourHealth;
	if (healthBuffActive) return false;

	const gammaMaxStacksCheck = _getGammaMaxStacks(worldType);
	const gammaToTrigger = gammaMaxStacksCheck - game.heirlooms.Shield.gammaBurst.stacks;
	const gammaCheck = gammaToTrigger === gammaMaxStacksCheck;
	const duelSetting = getPageSetting('duel') && getPageSetting('duelHealth');

	if (fastEnemy && duelSetting && gammaCheck) {
		_setEquality(0);
		return true;
	}

	return false;
}

function _checkBloodthirst(mapping, fastEnemy, ourDmg, enemy, worldType) {
	const runnningDaily = challengeActive('Daily');
	const dailyChallenge = game.global.dailyChallenge;
	const dailyBloodthirst = runnningDaily && typeof dailyChallenge.bloodthirst !== 'undefined';
	const maxStacksSetting = getPageSetting('bloodthirstMaxStacks');

	if (!dailyBloodthirst || !mapping || !fastEnemy || !maxStacksSetting) return false;

	const bloodthirst = dailyChallenge.bloodthirst;
	const maxStacks = dailyModifiers.bloodthirst.getMaxStacks(bloodthirst.strength);
	const freq = dailyModifiers.bloodthirst.getFreq(bloodthirst.strength);
	const stacksToProc = freq - (bloodthirst.currStacks % freq);

	const mapObject = mapping ? getCurrentMapObject() : { level: game.global.world, difficulty: 1 };
	const ourEqualityModifier = game.portal.Equality.getModifier(1);
	const currentCell = mapping ? game.global.lastClearedMapCell + 1 : game.global.lastClearedCell + 1;
	const gammaDmg = MODULES.heirlooms.gammaBurstPct;
	const avgTrimpAttack = ourDmg * Math.pow(ourEqualityModifier, equalityQuery(enemy.name, mapObject.level, currentCell, worldType, mapObject.difficulty, 'gamma')) * gammaDmg;
	const timeToKill = enemy.health / avgTrimpAttack;

	if (bloodthirst.currStacks !== maxStacks && stacksToProc < timeToKill) {
		_setEquality(0);
		return true;
	}

	return false;
}

function _checkSuicideArmy(worldType, mapping, ourHealth, enemy, enemyDmgMax, enemyDmgMult, armyReady) {
	const runningTrappa = challengeActive('Trappapalooza');
	const runningArchaeology = challengeActive('Archaeology');
	const runningBerserk = challengeActive('Berserk') && game.challenges.Berserk.weakened !== 20;
	const runningRevenge = challengeActive('Revenge') && game.challenges.Revenge.stacks === 19;

	if (runningTrappa || runningArchaeology || runningBerserk) {
		if (!game.global.fighting) ourHealth = _getOurHealth(mapping, worldType, true);
		return { ourHealth, enemyDmgMult };
	}

	const isDaily = challengeActive('Daily');
	const dailyChallenge = game.global.dailyChallenge;
	const dailyEmpower = isDaily && !mapping && typeof dailyChallenge.empower !== 'undefined';
	const shieldBreak = challengeActive('Bublé') || getCurrentQuest() === 8 || runningRevenge || (game.global.spireActive && worldType === 'world');
	let shouldSuicide = ourHealth === 0 || armyReady || dailyEmpower || shieldBreak;

	const gammaMaxStacksCheck = gammaMaxStacks(false, false, worldType);
	const gammaToTrigger = gammaMaxStacksCheck - game.heirlooms.Shield.gammaBurst.stacks;
	if (gammaToTrigger !== gammaMaxStacksCheck) shouldSuicide = false;

	const ourShield = remainingHealth(true, false, worldType);
	const ourShieldMax = calcOurHealth(true, worldType);
	if (ourShield > ourShieldMax * 0.75) shouldSuicide = false;

	let enemyDmgMin = enemyDmgMax / 3;
	if (enemyDmgMin >= ourHealth && enemyDmgMult > 1) {
		const ourHealthMax = calcOurHealth(false, worldType, true);

		if (enemyDmgMin >= ourHealthMax) {
			enemyDmgMax /= enemyDmgMult;
			enemyDmgMin = enemyDmgMax / 3;
			enemyDmgMult = 1;
		}
	}

	if (enemyDmgMin >= ourHealth) shouldSuicide = true;

	if ((shieldBreak || dailyEmpower) && enemyDmgMax >= ourHealth) shouldSuicide = true;
	if (game.global.armyAttackCount === 0) shouldSuicide = false;
	if (!shouldSuicide) return { ourHealth, enemyDmgMult };

	const mapObject = mapping ? getCurrentMapObject() : null;
	const poisonDebuff = challengeActive('Mayhem') && game.challenges.Mayhem.poison > 0; /* Poison debuff only resets on army death */
	const notMapping = game.global.mapsUnlocked && !mapping && !game.global.spireActive && !poisonDebuff;
	const mappingButDieAnyway = mapping && enemy.level > 1 && !game.global.voidBuff && mapObject.location !== 'Darkness' && game.global.titimpLeft === 0;

	if (notMapping || mappingButDieAnyway) {
		suicideTrimps(true);
		mappingButDieAnyway ? runMap(false) : suicideTrimps(true);

		ourHealth = _getOurHealth(mapping, worldType, true);
		return { ourHealth, enemyDmgMult };
	}

	if (shieldBreak) {
		return { ourHealth, enemyDmgMult };
	}

	_setEquality(0);
	return { useEquality: false, enemyDmgMult };
}

function _shouldPBSwap(mapping, enemy, fastEnemy) {
	const plagueShield = MODULES.heirlooms.plagueSwap || MODULES.maps.slowScumming ? getHeirloomBonus('Shield', 'plaguebringer') > 0 : false;
	if (!plagueShield) return false;

	const nextEnemy = getCurrentEnemy(2);
	const checkPlagueSwap = plagueShield && enemy.level < nextEnemy.level;
	const plaguebringerDamage = checkPlagueSwap ? nextEnemy.plaguebringer : 0;
	const mapSize = mapping ? game.global['mapGridArray'].length : game.global['gridArray'].length;

	return checkPlagueSwap && ((mapping && !fastEnemy) || !mapping) && enemy.level !== mapSize - 2 && (typeof plaguebringerDamage === 'undefined' || plaguebringerDamage < enemy.maxHealth) && enemy.maxHealth * 0.05 < enemy.health;
}

function _getEnemyDmg(mapping, worldType, fastEnemy) {
	const enemy = getCurrentEnemy();
	const damageMult = _getEnemyDmgMultiplier(mapping, worldType, enemy, fastEnemy);
	const damage = enemy.attack * enemyDamageModifiers() * 1.5 * damageMult;

	const maxEquality = getPerkLevel('Equality');
	const equalityModifier = game.portal.Equality.getModifier();
	const damageMax = damage * Math.pow(equalityModifier, maxEquality);

	return { enemyDmg: damage, enemyDmgMax: damageMax, enemyDmgMult: damageMult };
}

function _getEnemyDmgMultiplier(mapping, worldType, enemy, fastEnemy) {
	let damageMult = 1;
	if (game.global.voidBuff === 'doubleAttack') damageMult += 2;
	const ignoreCrits = getPageSetting('ignoreCrits');

	const gammaMaxStacksCheck = _getGammaMaxStacks(worldType);
	const gammaToTrigger = gammaMaxStacksCheck - game.heirlooms.Shield.gammaBurst.stacks;
	const runningBerserk = challengeActive('Berserk') && game.challenges.Berserk.weakened !== 20;
	const runningTrappa = challengeActive('Trappapalooza');
	const runningArch = challengeActive('Archaeology');
	const runningRevenge = challengeActive('Revenge') && game.challenges.Revenge.stacks === 19;
	const shieldBreak = challengeActive('Bublé') || getCurrentQuest() === 8 || runningRevenge || (game.global.spireActive && worldType === 'world');
	if (game.global.voidBuff === 'getCrit' && ignoreCrits === 0 && (fastEnemy || gammaToTrigger > 1 || runningBerserk || runningTrappa || runningArch || shieldBreak)) damageMult += 5;

	if (challengeActive('Daily')) {
		const dailyChallenge = game.global.dailyChallenge;
		const dailyEmpower = typeof dailyChallenge.empower !== 'undefined';
		const dailyEmpowerCheck = dailyEmpower && getPageSetting('empowerAutoEquality');
		const dailyCrit = typeof dailyChallenge.crits !== 'undefined' && ignoreCrits !== 2;
		const dailyExplosive = typeof dailyChallenge.explosive !== 'undefined';

		if (dailyCrit && ((dailyEmpowerCheck && !mapping) || MODULES.maps.slowScumming)) {
			damageMult += 1 + dailyModifiers.crits.getMult(dailyChallenge.crits.strength);
		}

		if (worldType === 'map' && dailyEmpowerCheck && dailyCrit && !MODULES.maps.slowScumming) {
			damageMult += 1 + dailyModifiers.crits.getMult(dailyChallenge.crits.strength);
		}

		if (dailyCrit && !dailyEmpower && (worldType === 'world' || worldType === 'void') && gammaToTrigger > 1) damageMult += 1 + dailyModifiers.crits.getMult(dailyChallenge.crits.strength);
	}

	const runningMayhem = challengeActive('Mayhem');
	const enemyCanPoison = runningMayhem && (mapping || enemy.level === 100);
	if (enemyCanPoison) damageMult += 1.2;

	return damageMult;
}

function _calculateEquality(mapping, worldType, enemy, enemyDmg, enemyDmgMult, fastEnemy, ourHealth, ourDmg, unluckyDmg, armyReady) {
	/* 
	setup plaguebringer shield swapping. Will force us to kill the enemy slower for maximum plaguebringer transfer damage.
	checking if we are at max plaguebringer damage. If not then skip to next equality stack if current attack will kill the enemy. 
    */

	const bionicTalent = _getBionicTalent();
	const maxDmg = calcOurDmg('max', 0, false, worldType, 'force', bionicTalent, true) * _getRampageBonus();
	const maxEquality = getPerkLevel('Equality');
	const shouldPlagueSwap = _shouldPBSwap(mapping, enemy, fastEnemy);

	const gammaDmg = MODULES.heirlooms.gammaBurstPct;
	const gammaMaxStacksCheck = _getGammaMaxStacks(worldType);
	const gammaToTrigger = gammaMaxStacksCheck - game.heirlooms.Shield.gammaBurst.stacks;
	let disableDamageAmps = false;
	let enemyDmgEquality = 0;
	let ourDmgEquality = 0;
	const enemyEqualityModifier = game.portal.Equality.getModifier();
	const ourEqualityModifier = game.portal.Equality.getModifier(1);
	const runningUnlucky = challengeActive('Unlucky');
	const runningMayhem = challengeActive('Mayhem') && game.challenges.Mayhem.poison > 0;
	const enemyCanPoison = runningMayhem && (mapping || enemy.level === 100);

	const runningSmithless = challengeActive('Smithless') && !mapping && game.global.world % 25 === 0 && game.global.lastClearedCell === -1 && game.global.gridArray[0].ubersmith;
	const smithlessGamma = runningSmithless && 10 - game.challenges.Smithless.uberAttacks > gammaToTrigger;

	const runningDeso = challengeActive('Desolation') && !game.global.mapsActive;

	let ourDmgMax = 0;
	const isDaily = challengeActive('Daily');
	const dailyChallenge = game.global.dailyChallenge;
	const dailyEmpower = isDaily && typeof dailyChallenge.empower !== 'undefined';
	const dailyEmpowerToggle = dailyEmpower && getPageSetting('empowerAutoEquality');
	const dailyExplosive = isDaily && typeof dailyChallenge.explosive !== 'undefined';
	const explosiveMult = dailyExplosive ? 1 + dailyModifiers.explosive.getMult(dailyChallenge.explosive.strength) : runningDeso ? 6 : 1;

	if ((dailyEmpowerToggle && dailyExplosive) || MODULES.maps.slowScumming || (runningDeso && !armyReady)) {
		const checkGamma = gammaToTrigger <= 1 ? gammaDmg : 1;
		ourDmgMax = maxDmg * checkGamma;
	}

	function getEquality() {
		let equality = 0;

		for (let i = 0; i <= maxEquality; i++) {
			if (i === maxEquality) {
				enemyDmgEquality = _calculateDamageEquality(enemyDmg, enemyEqualityModifier, i);
				const { reset, disableDamageAmps: newDisableDamageAmps, enemyDmg: newEnemyDmg } = _checkEnemyDamage(enemyDmg, enemyDmgEquality, ourHealth, enemyDmgMult, disableDamageAmps);
				if (reset) {
					enemyDmg = newEnemyDmg;
					i = 0;
					disableDamageAmps = newDisableDamageAmps;
				} else {
					equality = maxEquality;
					break;
				}
			}

			while (shouldPlagueSwap && maxEquality > i && (maxDmg, ourEqualityModifier, i) > enemy.health) {
				i++;
			}

			while (runningUnlucky && maxEquality > i) {
				const unluckyDmgEquality = _calculateDamageEquality(unluckyDmg, ourEqualityModifier, i);
				if (!_isOddValue(unluckyDmgEquality)) break;
				i++;
			}

			enemyDmgEquality = _calculateDamageEquality(enemyDmg, enemyEqualityModifier, i);
			ourDmgEquality = _calculateDamageEquality(ourDmg, ourEqualityModifier, i);

			if (runningMayhem) enemyDmgEquality += game.challenges.Mayhem.poison;

			if (ourDmgMax > 0) {
				// Check to see if we kill the enemy with max damage on empower dailies with explosive mod. If so mult enemy dmg by explosive to stop gaining empower stacks.
				const enoughEQ = _calculateDamageEquality(ourDmgMax, ourEqualityModifier, i) > enemy.health;
				const wouldDie = enemyDmgEquality * explosiveMult > ourHealth;
				if (!disableDamageAmps && !MODULES.maps.slowScumming && enoughEQ && wouldDie) enemyDmgEquality *= explosiveMult;
				// Make sure that we don't kill slow enemies to ensure maximum plaguebringer transfer damage.
				if (MODULES.maps.slowScumming && mapping && (enemy.level - 1) % 2 !== 0 && _calculateDamageEquality(ourDmgMax, ourEqualityModifier, i + 1) > enemy.health) {
					continue;
				}
			}

			const wouldDie = enemyDmgEquality > ourHealth;
			const wouldDieMayhem = runningMayhem && enemyDmgEquality > game.global.soldierHealth * 6 + game.challenges.Mayhem.poison;
			if (fastEnemy && (wouldDie || wouldDieMayhem)) {
				equality = i;
				continue;
			}

			const willSurviveForever = ourHealth > enemyDmg * 100;
			if (willSurviveForever) {
				equality = i;
				break;
			}

			const shouldGamma = gammaToTrigger > 1 && enemy.health > ourDmgEquality * gammaDmg;
			if (shouldGamma) {
				equality = maxEquality;
				break;
			}

			const willSurviveOneHit = ourHealth > enemyDmgEquality;
			if (willSurviveOneHit && (ourDmgEquality > enemy.health || gammaToTrigger <= 1)) {
				equality = i;
				break;
			}

			const willSurviveToGamma = ourHealth > enemyDmgEquality * gammaToTrigger;
			if (!smithlessGamma && !enemyCanPoison && willSurviveToGamma) {
				equality = i;
				break;
			}

			equality = maxEquality;
		}

		return equality;
	}

	let equality = getEquality();

	if (explosiveMult > 1) {
		let maxTrimpDmg = maxDmg * (gammaToTrigger <= 1 ? gammaDmg : 1);
		maxTrimpDmg = _calculateDamageEquality(maxTrimpDmg, ourEqualityModifier, equality);
		if (maxTrimpDmg >= enemy.health) {
			const explosiveDmg = _calculateDamageEquality(enemyDmg, enemyEqualityModifier, equality) * explosiveMult;
			if (enemyDmgMult > 1) enemyDmg /= enemyDmgMult;
			enemyDmgMult += explosiveMult - 1;
			enemyDmg *= enemyDmgMult;
			if (explosiveDmg > ourHealth && !disableDamageAmps) {
				equality = getEquality();
			}
		}
	}

	enemyDmgEquality = _calculateDamageEquality(enemyDmg, enemyEqualityModifier, equality);
	ourDmgEquality = _calculateDamageEquality(ourDmg, ourEqualityModifier, equality);

	/* Check to see if we will kill a slow enemy faster with 0 equality or by gamma bursting it */
	if (!fastEnemy && equality > 0 && !(game.global.spireActive && !game.global.mapsActive)) {
		const gammaDmgCheck = gammaToTrigger <= 1 && ourDmgEquality * gammaDmg < ourDmg;
		const hitsToKill = Math.ceil(enemy.health / ourDmg);
		const wontNeedGamma = hitsToKill <= gammaToTrigger;

		if (gammaDmgCheck || wontNeedGamma) {
			const breedTime = !armyReady ? _breedTimeRemaining() : 0;
			const atkSpeed = combatSpeed() / 100;

			if (breedTime < atkSpeed && (hitsToKill <= 2 || atkSpeed > _breedTotalTime())) {
				equality = 0;

				if (runningUnlucky) {
					while (_isOddValue(unluckyDmg * Math.pow(ourEqualityModifier, equality)) && equality !== maxEquality) equality++;
				}
			}
		}
	}

	_setEquality(equality);

	const debugStats = getPageSetting('debugEqualityStats');
	if (debugStats) queryAutoEqualityStats(ourDmgEquality, ourHealth, enemyDmgEquality, enemy.health, equality);
}

function _equalityManagementAdvanced() {
	if (game.global.preMapsActive || game.global.gridArray.length <= 0) return;

	const eqSetting = game.portal.Equality.settings[game.global.spireActive ? 'spire' : 'reg'];
	eqSetting.scalingActive = false;
	game.options.menu.alwaysAbandon.enabled = 1;

	if (_checkDesoDestack()) return;

	const mapping = game.global.mapsActive;
	const worldType = !mapping ? 'world' : game.global.voidBuff ? 'void' : 'map';
	const enemy = getCurrentEnemy();

	let ourHealth = _getOurHealth(mapping, worldType);

	const { ourDmg, unluckyDmg, fastEnemy } = _getOurDmg(worldType, enemy);

	if (_checkDuelSuicide(worldType, fastEnemy, ourHealth)) return;

	if (_checkBloodthirst(mapping, fastEnemy, ourDmg, enemy, worldType)) return;

	let { enemyDmg, enemyDmgMax, enemyDmgMult } = _getEnemyDmg(mapping, worldType, fastEnemy);
	const armyReady = newArmyRdy() || getPageSetting('heirloomBreed') !== 'undefined';

	let enemyMult = 1;
	({ ourHealth, enemyMult } = _checkSuicideArmy(worldType, mapping, ourHealth, enemy, enemyDmgMax, enemyDmgMult, armyReady));

	if (enemyMult === 1) {
		enemyDmg /= enemyDmgMult;
		enemyDmgMax /= enemyDmgMult;
		enemyDmgMult = 1;
	}

	if (!ourHealth || enemy.health <= 0) return;
	_calculateEquality(mapping, worldType, enemy, enemyDmg, enemyDmgMult, fastEnemy, ourHealth, ourDmg, unluckyDmg, armyReady);
}

function equalityManagement() {
	if (getPerkLevel('Equality') === 0) return;

	const equalitySetting = getPageSetting('equalityManagement');
	if (equalitySetting === 0) return;

	if (equalitySetting === 1) _equalityManagementBasic();
	else if (equalitySetting === 2) _equalityManagementAdvanced();
}
