function callBetterAutoFight() {
	_avoidEmpower();
	_trimpicide();
	const autoFightSetting = getPageSetting('autoFight');
	if (autoFightSetting === 0) return;
	else if (autoFightSetting === 1) _betterAutoFight();
	else if (autoFightSetting === 2) _betterAutoFightVanilla();
}

function newArmyRdy() {
	const { trimps } = game.resources;
	const challenges = ['Trapper', 'Trappapalooza'];

	if (challenges.includes(trimpStats.currChallenge) && getPageSetting('trapper')) {
		let popSetting = getPageSetting('trapperArmyPct');
		popSetting = Math.min(popSetting, 100);
		if (popSetting <= 0) return true;
		return trimps.owned > trimps.maxSoldiers * popSetting;
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

// Suicides trimps if we don't have max anticipation stacks and sending a new army would give us max stacks.
// Doesn't do this inside of void maps OR spires.
function _trimpicide() {
	if (game.global.universe !== 1) return;
	if (game.portal.Anticipation.level === 0) return;
	if (!game.global.fighting) return;
	if (!getPageSetting('ForceAbandon')) return;

	const mapsActive = game.global.mapsActive;
	if (!mapsActive && game.global.spireActive) return;
	if (mapsActive && !newArmyRdy()) return;

	const antistacklimit = game.talents.patience.purchased ? 45 : 30;
	if (game.global.antiStacks >= antistacklimit) return;

	// Calculates Anticipation stacks based on time since last breed.

	const amalgsOwned = game.jobs.Amalgamator.owned > 0;
	const lastTimeSent = Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000);
	const breedTime = Math.floor(game.global.lastBreedTime / 1000);

	const baseCheck = (amalgsOwned ? lastTimeSent : breedTime) >= antistacklimit;

	if (baseCheck) _forceAbandonTrimps();
}

// Abandons trimps to get max anticipation stacks.
function _forceAbandonTrimps() {
	if (!getPageSetting('ForceAbandon')) return;
	if (!getPageSetting('autoMaps')) return;
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
	if (game.global.universe !== 1) return false;

	const enemy = getCurrentEnemy();
	const fluctuation = game.global.universe === 2 ? 1.5 : 1.2;
	const runningDaily = challengeActive('Daily');
	const dailyChallenge = game.global.dailyChallenge;

	if (!runningDaily) return false;
	if (game.global.mapsActive) return false;
	if (runningDaily && typeof dailyChallenge.empower === 'undefined') return false;
	if (!getPageSetting('avoidEmpower')) return false;
	if (game.global.soldierHealth <= 0) return false;

	//Trimps Stats
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
		//Enemy crits
		if (typeof dailyChallenge.crits !== 'undefined') enemyAttack *= dailyModifiers.crits.getMult(dailyChallenge.crits.strength);
		//Bogged
		if (typeof dailyChallenge.bogged !== 'undefined') ourHealth -= game.global.soldierHealthMax * dailyModifiers.bogged.getMult(dailyChallenge.bogged.strength);
		//Plagued
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

// Suicides army to avoid empower stacks if the next enemy attack would kill us.
function _avoidEmpower() {
	if (!_armyDeath()) return;

	if (game.global.mapsActive && !game.global.voidBuff) {
		mapsClicked(true);
		runMap_AT();
	} else if (!game.global.mapsActive) {
		mapsClicked(true);
		mapsClicked(true);
	}
	debug(`Abandoning Trimps to avoid Empower stacks.`, `other`);
}

function _setEquality(equality) {
	if (game.portal.Equality.disabledStackCount === equality) return;
	game.portal.Equality.disabledStackCount = equality;
	manageEqualityStacks();
	updateEqualityScaling();
}

function _equalityManagementBasic() {
	if (game.global.preMapsActive) return;
	if (game.global.gridArray.length <= 0) return;

	const runningDesolation = challengeActive('Desolation');

	if (runningDesolation && mapSettings.equality && getPageSetting('autoMaps')) {
		game.portal.Equality.scalingActive = false;
		_setEquality(game.portal.Equality.radLevel);
		return;
	}

	const experienced = challengeActive('Exterminate') && game.challenges.Exterminate.experienced;
	const fastEnemy = MODULES.fightinfo.fastImps.includes(getCurrentEnemy().name) || experienced;
	const voidDoubleAttack = game.global.mapsActive && getCurrentMapObject().location === 'Void' && getCurrentMapObject().voidBuff === 'doubleAttack';
	const noFrenzy = game.portal.Frenzy.radLevel > 0 && game.portal.Frenzy.frenzyStarted === -1 && !autoBattle.oneTimers.Mass_Hysteria.owned;
	const runningGlass = challengeActive('Glass');

	// Toggles equality scaling on
	if (fastEnemy || voidDoubleAttack || noFrenzy || runningGlass || runningDesolation) {
		if (!game.portal.Equality.scalingActive) {
			game.portal.Equality.scalingActive = true;
			manageEqualityStacks();
			updateEqualityScaling();
		}
	} else {
		// Toggles equality scaling off and sets equality stacks to 0
		if (game.portal.Equality.scalingActive) {
			game.portal.Equality.scalingActive = false;
			_setEquality(0);
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

function equalityManagement2() {
	if (game.portal.Equality.radLevel === 0) return;
	if (game.global.preMapsActive || game.global.gridArray.length <= 0) return;

	const equalitySetting = getPageSetting('equalityManagement');
	if (equalitySetting === 0) return;
	if (equalitySetting === 1) return _equalityManagementBasic();

	game.portal.Equality.scalingActive = false;
	game.options.menu.alwaysAbandon.enabled = 1;

	const debugStats = getPageSetting('debugEqualityStats');
	const mapping = game.global.mapsActive;
	const mapObject = mapping ? getCurrentMapObject() : null;
	const currentCell = mapping ? game.global.lastClearedMapCell + 1 : game.global.lastClearedCell + 1;
	const mapGrid = mapping ? 'mapGridArray' : 'gridArray';
	const type = !mapping ? 'world' : mapObject.location === 'Void' ? 'void' : 'map';
	const zone = type === 'world' || !mapping ? game.global.world : mapObject.level;
	const bionicTalent = mapping && game.talents.bionic2.purchased && zone > game.global.world ? zone : 0;
	const difficulty = mapping ? mapObject.difficulty : 1;
	const armyReady = newArmyRdy() || getPageSetting('heirloomBreed') !== 'undefined';
	const maxEquality = game.portal.Equality.radLevel;
	let enemyDamageMult = 1;

	//Daily modifiers active
	const isDaily = challengeActive('Daily');
	const dailyChallenge = game.global.dailyChallenge;
	const dailyEmpower = isDaily && typeof dailyChallenge.empower !== 'undefined'; //Empower
	const dailyEmpowerToggle = dailyEmpower && getPageSetting('empowerAutoEquality');
	const dailyCrit = isDaily && typeof dailyChallenge.crits !== 'undefined'; //Crit
	const dailyExplosive = isDaily && typeof dailyChallenge.explosive !== 'undefined'; //Dmg on death
	const explosiveMult = dailyExplosive ? 1 + dailyModifiers.explosive.getMult(dailyChallenge.explosive.strength) : 1;
	const dailyWeakness = isDaily && typeof dailyChallenge.weakness !== 'undefined'; //% dmg reduction on hit
	const dailyBloodthirst = isDaily && typeof dailyChallenge.bloodthirst !== 'undefined'; //Bloodthirst (enemy heal + atk)
	const dailyRampage = isDaily && typeof dailyChallenge.rampage !== 'undefined'; //Rampage (trimp attack buff)

	//Challenge conditions
	const runningUnlucky = challengeActive('Unlucky');
	const runningDuel = challengeActive('Duel');
	const runningTrappa = challengeActive('Trappapalooza');
	const shieldBreak = challengeActive('Bublé') || getCurrentQuest() === 8;
	const runningRevenge = challengeActive('Revenge');
	const runningArchaeology = challengeActive('Archaeology');
	const runningMayhem = challengeActive('Mayhem');
	const enemyCanPoison = runningMayhem && (mapping || currentCell === 99);
	const runningBerserk = challengeActive('Berserk') && game.challenges.Berserk.weakened !== 20;
	const runningExperienced = challengeActive('Exterminate') && game.challenges.Exterminate.experienced;
	const runningGlass = challengeActive('Glass');
	const runningDesolation = challengeActive('Desolation');
	const runningSmithless = challengeActive('Smithless') && !mapping && game.global.world % 25 === 0 && game.global.lastClearedCell === -1 && game.global.gridArray[0].ubersmith;

	if (runningDesolation && mapSettings.equality && game.global.world >= getPageSetting('destackOnlyZone') && getPageSetting('autoMaps')) {
		_setEquality(game.portal.Equality.radLevel);
		return;
	}

	const noFrenzy = game.portal.Frenzy.radLevel > 0 && !autoBattle.oneTimers.Mass_Hysteria.owned;
	const angelicOwned = game.talents.angelic.purchased;
	const angelicDance = angelicOwned && (runningTrappa || runningRevenge || runningBerserk || noFrenzy || (dailyEmpower && !mapping));

	let gammaMaxStacksCheck = gammaMaxStacks(false, false, type);
	const gammaDmg = MODULES.heirlooms.gammaBurstPct;
	if (gammaDmg === 1) gammaMaxStacksCheck = 0;
	const gammaToTrigger = gammaMaxStacksCheck - game.heirlooms.Shield.gammaBurst.stacks;
	const smithlessGamma = runningSmithless && 10 - game.challenges.Smithless.uberAttacks > gammaToTrigger;

	const dmgType = runningUnlucky ? 'max' : 'avg';
	const critType = challengeActive('Wither') || challengeActive('Glass') ? 'never' : 'maybe';

	const ourShieldMax = calcOurHealth(true, type);
	const ourShield = remainingHealth(true, false, type);
	let ourHealth = remainingHealth(shieldBreak, angelicDance, type);

	let ourDmg = calcOurDmg(dmgType, 0, false, type, critType, bionicTalent, true);
	let ourDmgMax = 0;
	let unluckyDmg = runningUnlucky ? Number(calcOurDmg('min', 0, false, type, 'never', bionicTalent, true)) : 2;
	let maxDmg = calcOurDmg('max', 0, false, type, 'force', bionicTalent, true);
	const ourEqualityModifier = game.portal.Equality.getModifier(1);

	if (noFrenzy) {
		const frenzyMult = 1 + 0.5 * game.portal.Frenzy.radLevel;
		const frenzyCalcSetting = getPageSetting('frenzyCalc');
		const frenzyStarted = game.portal.Frenzy.frenzyStarted;
		const shouldAdjustDamage = (frenzyCalcSetting && frenzyStarted === -1) || (!frenzyCalcSetting && frenzyStarted !== -1);

		if (shouldAdjustDamage) {
			const adjustDamage = (damage) => (frenzyCalcSetting ? damage / frenzyMult : damage * frenzyMult);
			ourDmg = adjustDamage(ourDmg);
			if (runningUnlucky) unluckyDmg = adjustDamage(unluckyDmg);
		}
	}

	if (dailyRampage) ourDmg *= dailyModifiers.rampage.getMult(dailyChallenge.rampage.strength, dailyChallenge.rampage.stacks);

	const enemy = getCurrentEnemy();
	const enemyName = game.global[mapGrid][currentCell].name;
	const enemyHealth = game.global[mapGrid][currentCell].health;
	let enemyDmg = enemy.attack * enemyDamageModifiers() * 1.5;
	const enemyEqualityModifier = game.portal.Equality.getModifier();
	let enemyDmgMax = enemyDmg * Math.pow(enemyEqualityModifier, maxEquality);
	if (runningMayhem) enemyDmg /= game.challenges.Mayhem.getEnemyMult();

	if (game.global.voidBuff === 'doubleAttack') enemyDamageMult += 2;
	if (game.global.voidBuff === 'getCrit' && (gammaToTrigger > 1 || runningBerserk || runningTrappa || runningArchaeology || shieldBreak)) enemyDamageMult += 5;

	if ((dailyEmpowerToggle && !mapping) || MODULES.maps.slowScumming) {
		if (dailyCrit) enemyDamageMult += 1 + dailyModifiers.crits.getMult(dailyChallenge.crits.strength);
		if (dailyExplosive || MODULES.maps.slowScumming) ourDmgMax = maxDmg * gammaDmg;
	}
	if (type === 'map' && (dailyExplosive || dailyCrit) && !MODULES.maps.slowScumming) {
		if (dailyEmpowerToggle && dailyCrit) enemyDamageMult += 1 + dailyModifiers.crits.getMult(dailyChallenge.crits.strength);
		if (dailyExplosive) enemyDamageMult += explosiveMult;
	}
	if (dailyCrit && !dailyEmpower && (type === 'world' || type === 'void') && gammaToTrigger > 1) enemyDamageMult += 1 + dailyModifiers.crits.getMult(dailyChallenge.crits.strength);
	if (enemyCanPoison) enemyDamageMult += 1.2;

	enemyDmg *= enemyDamageMult;

	const exoticImp = MODULES.fightinfo.exoticImps.includes(enemyName);
	const fastImp = MODULES.fightinfo.fastImps.includes(enemyName);
	let fastEnemy = !game.global.preMapsActive && (runningDesolation && mapping ? !exoticImp : fastImp);
	if (!fastEnemy) {
		if (!mapping && (dailyEmpower || runningSmithless)) fastEnemy = true;
		else if (type === 'map' && dailyExplosive && !MODULES.maps.slowScumming) fastEnemy = true;
		else if (type === 'world' && dailyExplosive) fastEnemy = true;
		else if (game.global.voidBuff === 'doubleAttack') fastEnemy = true;
		else if (runningArchaeology) fastEnemy = true;
		else if (runningTrappa) fastEnemy = true;
		else if (runningDuel && !mapping) fastEnemy = true;
		else if (shieldBreak) fastEnemy = true;
		else if (runningExperienced) fastEnemy = false;
		else if (runningGlass) fastEnemy = true;
		else if (runningBerserk) fastEnemy = true;
		else if (runningDuel && game.challenges.Duel.enemyStacks < 10) fastEnemy = true;
		else if (runningRevenge) fastEnemy = true;
		else if (type === 'world' && game.global.world > 200 && game.global.gridArray[currentCell].u2Mutation.length > 0) fastEnemy = true;
		else if (noFrenzy && (game.portal.Frenzy.frenzyActive() || enemyHealth / ourDmg > 10)) fastEnemy = true;
	}

	if (dailyWeakness) ourDmg *= 1 - ((dailyChallenge.weakness.stacks + (fastEnemy ? 1 : 0)) * dailyChallenge.weakness.strength) / 100;

	//Making sure we get the Duel health bonus by suiciding trimps with 0 equality
	//Definitely need to add a check here for if we can die enough to get the bonus.
	if (runningDuel && getPageSetting('duel') && getPageSetting('duelHealth') && fastEnemy && calcOurHealth(false, type) * 10 * 0.9 > ourHealth && gammaToTrigger === gammaMaxStacksCheck && game.global.armyAttackCount === 0) {
		_setEquality(0);
		return;
	}

	if (dailyBloodthirst && mapping && fastEnemy && getPageSetting('bloodthirstMaxStacks')) {
		const bloodthirst = dailyChallenge.bloodthirst;
		const maxStacks = dailyModifiers.bloodthirst.getMaxStacks(bloodthirst.strength);
		const freq = dailyModifiers.bloodthirst.getFreq(bloodthirst.strength);
		const stacksToProc = freq - (bloodthirst.currStacks % freq);
		const avgTrimpAttack = ourDmg * Math.pow(ourEqualityModifier, equalityQuery(enemyName, zone, currentCell, type, difficulty, 'gamma')) * gammaDmg;
		const timeToKill = enemyHealth / avgTrimpAttack;

		if (bloodthirst.currStacks !== maxStacks && stacksToProc < timeToKill) {
			_setEquality(0);
			return;
		}
	}

	//Suicide army to reset health if it isn't efficient to keep it alive any longer.
	//Checks to see if health 0 OR new army is ready OR shieldbreak condition OR daily empower is active and not mapping
	//Our shield is at 75% or less of its max
	//Have the same gamma stacks as it takes to proc it (so have already gamma bursted OR cant gamma burst)
	//Won't suicide on trappa, arch, berserk challenges
	let shouldSuicide = ourHealth === 0 || armyReady || (dailyEmpower && !mapping) || shieldBreak;
	if (gammaToTrigger !== gammaMaxStacksCheck) shouldSuicide = false;
	if (ourShield > ourShieldMax * 0.75) shouldSuicide = false;
	if (runningTrappa || runningArchaeology || runningBerserk) shouldSuicide = false;
	//Override shouldSuicide if we can't survive an attack against enemies max dmg with our current health
	if ((shieldBreak || (dailyEmpower && !mapping)) && enemyDmgMax >= ourHealth) shouldSuicide = true;

	if (shouldSuicide) {
		const notMapping = game.global.mapsUnlocked && !mapping && !runningMayhem;
		const areMappingButDieAnyway = mapping && currentCell > 0 && type !== 'void' && mapObject.location !== 'Darkness' && game.global.titimpLeft === 0;
		if (notMapping) {
			suicideTrimps(true);
			suicideTrimps(true);
		} else if (areMappingButDieAnyway) {
			suicideTrimps(true);
			runMap_AT();
		} else {
			_setEquality(0);
			return;
		}
		ourHealth = remainingHealth(shieldBreak, angelicDance, type);
	}

	if (enemyHealth > 0) {
		let equality = 0;
		let disableDamageAmps = false;
		let enemyDmgEquality = 0;
		let ourDmgEquality = 0;

		/* 
        Setup plaguebringer shield swapping. Will force us to kill the enemy slower for maximum plaguebringer transfer damage.
		Now works with void maps AND in world. Setup MODULES.heirlooms.plagueSwap to true to enable.
		Checking if we are at max plaguebringer damage. If not then skip to next equality stack if current attack will kill the enemy. 
        */
		const plagueShield = MODULES.heirlooms.plagueSwap || MODULES.maps.slowScumming ? getHeirloomBonus('Shield', 'plaguebringer') > 0 : false;
		const nextCell = game.global[mapGrid][currentCell + 1];
		const checkPlagueSwap = plagueShield && nextCell;
		const plaguebringerDamage = checkPlagueSwap ? nextCell.plaguebringer : 0;
		const shouldPlagueSwap = checkPlagueSwap && ((mapping && !fastEnemy) || !mapping) && currentCell !== game.global[mapGrid].length - 3 && (typeof plaguebringerDamage === 'undefined' || plaguebringerDamage < enemy.maxHealth) && enemy.maxHealth * 0.05 < enemyHealth;

		for (let i = 0; i <= maxEquality; i++) {
			if (i === maxEquality) {
				enemyDmgEquality = _calculateDamageEquality(enemyDmg, enemyEqualityModifier, i);
				const { reset, disableDamageAmps: newDisableDamageAmps, enemyDmg: newEnemyDmg } = _checkEnemyDamage(enemyDmg, enemyDmgEquality, ourHealth, enemyDamageMult, disableDamageAmps);
				if (reset) {
					enemyDmg = newEnemyDmg;
					i = 0;
					disableDamageAmps = newDisableDamageAmps;
				} else {
					equality = maxEquality;
					break;
				}
			}

			while (shouldPlagueSwap && maxEquality > i && _calculateDamageEquality(maxDmg, ourEqualityModifier, i) > enemyHealth) {
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
				//Check to see if we kill the enemy with max damage on empower dailies with explosive mod. If so mult enemy dmg by explosive to stop gaining empower stacks.
				if (!disableDamageAmps && !MODULES.maps.slowScumming && _calculateDamageEquality(ourDmgMax, ourEqualityModifier, i) > enemyHealth && enemyDmgEquality * explosiveMult > ourHealth) enemyDmgEquality *= explosiveMult;
				//Make sure that we don't kill slow enemies to ensure maximum plaguebringer transfer damage.
				if (MODULES.maps.slowScumming && mapping && currentCell % 2 !== 0 && _calculateDamageEquality(ourDmgMax, ourEqualityModifier, i + 1) > enemyHealth) {
					continue;
				}
			}

			const wouldDie = enemyDmgEquality > ourHealth;
			const wouldDieMayhem = runningMayhem && enemyDmgEquality > game.global.soldierHealth * 6 + game.challenges.Mayhem.poison;
			if (fastEnemy && (wouldDie || wouldDieMayhem)) {
				equality = i;
				continue;
			}

			const shouldGamma = gammaToTrigger > 1 && enemyHealth > ourDmgEquality * gammaDmg;
			if (shouldGamma) {
				equality = maxEquality;
				break;
			}

			const willSurviveOneHit = ourHealth > enemyDmgEquality;
			if (willSurviveOneHit && (ourDmgEquality > enemyHealth || gammaToTrigger <= 1)) {
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

		//Check to see if we will kill a slow enemy faster with 0 equality or by gamma bursting it
		if (!fastEnemy) {
			const gammaDmgCheck = gammaToTrigger <= 1 && ourDmgEquality * gammaDmg < ourDmg;
			const wontNeedGamma = enemyHealth / ourDmg <= gammaToTrigger;

			if (gammaDmgCheck || wontNeedGamma) {
				equality = 0;
			}

			if (runningUnlucky) {
				while ((unluckyDmg * Math.pow(ourEqualityModifier, equality)).toString()[0] % 2 === 1 && equality !== maxEquality) equality++;
			}
		}

		_setEquality(equality);

		if (debugStats) queryAutoEqualityStats(ourDmgEquality, ourHealth, enemyDmgEquality, enemyHealth, equality);
	}
}

function _checkDesoDestack() {
	const runningDesolation = challengeActive('desolation');
	const destackZone = game.global.world >= getPageSetting('destackOnlyZone');
	const autoMapsEnabled = getPageSetting('autoMaps');
	if (runningDesolation && mapSettings.equality && destackZone && autoMapsEnabled) {
		_setEquality(game.portal.Equality.radLevel);
		return true;
	}
	return false;
}

function _getGammaMaxStacks(worldType) {
	let maxStacks = gammaMaxStacks(false, false, worldType);
	const gammaDmg = MODULES.heirlooms.gammaBurstPct;
	if (gammaDmg === 1) maxStacks = 0;
	return maxStacks;
}

function _getOurHealth(mapping, worldType) {
	const shieldBreak = challengeActive('Bublé') || getCurrentQuest() === 8;
	const angelicOwned = game.talents.angelic.purchased;
	const runningTrappa = challengeActive('Trappapalooza');
	const runningRevenge = challengeActive('Revenge');
	const runningBerserk = challengeActive('Berserk') && game.challenges.Berserk.weakened !== 20;
	const noFrenzy = game.portal.Frenzy.radLevel > 0 && !autoBattle.oneTimers.Mass_Hysteria.owned;
	const isDaily = challengeActive('Daily');
	const dailyChallenge = game.global.dailyChallenge;
	const dailyEmpower = isDaily && typeof dailyChallenge.empower !== 'undefined';
	const angelicDance = angelicOwned && (runningTrappa || runningRevenge || runningBerserk || noFrenzy || (dailyEmpower && !mapping));

	return remainingHealth(shieldBreak, angelicDance, worldType);
}

function _adjustFrenzyDamage(damage) {
	const frenzyMult = 1 + 0.5 * game.portal.Frenzy.radLevel;
	const frenzyCalcSetting = getPageSetting('frenzyCalc');

	return frenzyCalcSetting ? damage / frenzyMult : damage * frenzyMult;
}

function _getBionicTalent(worldType) {
	const mapping = game.global.mapsActive;
	const purchased = game.talents.bionic2.purchased;
	const mapObject = mapping ? getCurrentMapObject() : null;
	const zone = worldType === 'world' || !mapping ? game.global.world : mapObject.level;
	const bionicTalent = mapping && purchased && zone > game.global.world ? zone : 0;
	return bionicTalent;
}

function _getOurDmg(worldType, enemy) {
	let fastEnemy = checkFastEnemy(enemy);

	const bionicTalent = _getBionicTalent(worldType);

	const critType = challengeActive('Wither') || challengeActive('Glass') ? 'never' : 'maybe';
	const runningUnlucky = challengeActive('Unlucky');
	const runningDaily = challengeActive('Daily');
	const dailyChallenge = game.global.dailyChallenge;
	const dmgType = runningUnlucky ? 'max' : 'avg';

	let ourDmg = calcOurDmg(dmgType, 0, false, worldType, critType, bionicTalent, true);
	let unluckyDmg = runningUnlucky ? Number(calcOurDmg('min', 0, false, worldType, 'never', bionicTalent, true)) : 2;

	const noFrenzy = game.portal.Frenzy.radLevel > 0 && !autoBattle.oneTimers.Mass_Hysteria.owned;
	if (noFrenzy) {
		const frenzySetting = getPageSetting('frenzyCalc');
		const frenzyStarted = game.portal.Frenzy.frenzyStarted;
		const shouldAdjustDamage = (frenzySetting && frenzyStarted === -1) || (!frenzySetting && frenzyStarted !== -1);

		if (shouldAdjustDamage) {
			ourDmg = _adjustFrenzyDamage(ourDmg);
			if (runningUnlucky) unluckyDmg = _adjustFrenzyDamage(unluckyDmg);
		}
	}

	const dailyRampage = runningDaily && typeof dailyChallenge.rampage !== 'undefined';
	if (dailyRampage) ourDmg *= dailyModifiers.rampage.getMult(dailyChallenge.rampage.strength, dailyChallenge.rampage.stacks);

	if ((noFrenzy && game.portal.Frenzy.frenzyActive()) || enemy.health / ourDmg > 10) fastEnemy = true;

	const dailyWeakness = runningDaily && typeof dailyChallenge.weakness !== 'undefined';
	if (dailyWeakness) ourDmg *= 1 - ((dailyChallenge.weakness.stacks + (fastEnemy ? 1 : 0)) * dailyChallenge.weakness.strength) / 100;
	return { ourDmg: ourDmg, unluckyDmg: unluckyDmg, fastEnemy: fastEnemy };
}

function _checkDuelSuicide(worldType, fastEnemy, ourHealth) {
	// Making sure we get the Duel health bonus by suiciding trimps with 0 equality
	// Definitely need to add a check here for if we can die enough to get the bonus.

	const gammaMaxStacksCheck = _getGammaMaxStacks(worldType);
	const gammaToTrigger = gammaMaxStacksCheck - game.heirlooms.Shield.gammaBurst.stacks;
	const gammaCheck = gammaToTrigger === gammaMaxStacksCheck;
	const runningDuel = challengeActive('Duel');
	const duelSetting = getPageSetting('duel');
	const duelHealthSetting = getPageSetting('duelHealth');
	const healthCheck = calcOurHealth(false, worldType) * 10 * 0.9 > ourHealth;
	const noAttacks = game.global.armyAttackCount === 0;

	if (runningDuel && fastEnemy && duelSetting && duelHealthSetting && healthCheck && gammaCheck && noAttacks) {
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

	const zone = worldType === 'world' || !mapping ? game.global.world : mapObject.level;
	const ourEqualityModifier = game.portal.Equality.getModifier(1);
	const currentCell = mapping ? game.global.lastClearedMapCell + 1 : game.global.lastClearedCell + 1;
	const difficulty = mapping ? getCurrentMapObject().difficulty : 1;
	const gammaDmg = MODULES.heirlooms.gammaBurstPct;
	const avgTrimpAttack = ourDmg * Math.pow(ourEqualityModifier, equalityQuery(enemy.name, zone, currentCell, worldType, difficulty, 'gamma')) * gammaDmg;
	const timeToKill = enemy.health / avgTrimpAttack;

	if (bloodthirst.currStacks !== maxStacks && stacksToProc < timeToKill) {
		_setEquality(0);
		return true;
	}
	return false;
}

function _checkSuicideArmy(worldType, mapping, ourHealth, enemy, enemyDmgMax) {
	// Suicide army to reset health if it isn't efficient to keep it alive any longer.
	// Checks to see if health 0 OR new army is ready OR shieldbreak condition OR daily empower is active and not mapping
	// Our shield is at 75% or less of its max
	// Have the same gamma stacks as it takes to proc it (so have already gamma bursted OR cant gamma burst)
	// Won't suicide on trappa, arch, berserk challenges
	const armyReady = newArmyRdy() || getPageSetting('heirloomBreed') !== 'undefined';
	const isDaily = challengeActive('Daily');
	const dailyChallenge = game.global.dailyChallenge;
	const dailyEmpower = isDaily && typeof dailyChallenge.empower !== 'undefined';
	const shieldBreak = challengeActive('Bublé') || getCurrentQuest() === 8;
	let gammaMaxStacksCheck = gammaMaxStacks(false, false, worldType);
	const gammaToTrigger = gammaMaxStacksCheck - game.heirlooms.Shield.gammaBurst.stacks;

	let shouldSuicide = ourHealth === 0 || armyReady || (dailyEmpower && !mapping) || shieldBreak;

	if (gammaToTrigger !== gammaMaxStacksCheck) shouldSuicide = false;

	const ourShield = remainingHealth(true, false, worldType);
	const ourShieldMax = calcOurHealth(true, worldType);
	if (ourShield > ourShieldMax * 0.75) shouldSuicide = false;

	const runningTrappa = challengeActive('Trappapalooza');
	const runningArchaeology = challengeActive('Archaeology');
	const runningBerserk = challengeActive('Berserk') && game.challenges.Berserk.weakened !== 20;
	if (runningTrappa || runningArchaeology || runningBerserk) shouldSuicide = false;

	// Override shouldSuicide if we can't survive an attack against enemies max dmg with our current health
	if ((shieldBreak || (dailyEmpower && !mapping)) && enemyDmgMax >= ourHealth) shouldSuicide = true;
	if (!shouldSuicide) return ourHealth;

	const runningMayhem = challengeActive('Mayhem');
	const notMapping = game.global.mapsUnlocked && !mapping && !runningMayhem;
	const areMappingButDieAnyway = mapping && enemy.level > 0 && worldType !== 'void' && mapObject.location !== 'Darkness' && game.global.titimpLeft === 0;
	if (notMapping) {
		suicideTrimps(true);
		suicideTrimps(true);
	} else if (areMappingButDieAnyway) {
		suicideTrimps(true);
		runMap_AT();
	} else {
		_setEquality(0);
		return false;
	}

	const noFrenzy = game.portal.Frenzy.radLevel > 0 && !autoBattle.oneTimers.Mass_Hysteria.owned;
	const angelicOwned = game.talents.angelic.purchased;
	const runningRevenge = challengeActive('Revenge');
	const angelicDance = angelicOwned && (runningTrappa || runningRevenge || runningBerserk || noFrenzy || (dailyEmpower && !mapping));

	ourHealth = remainingHealth(shieldBreak, angelicDance, worldType);
	return ourHealth;
}

function _shouldPBSwap(mapping, enemy) {
	const plagueShield = MODULES.heirlooms.plagueSwap || MODULES.maps.slowScumming ? getHeirloomBonus('Shield', 'plaguebringer') > 0 : false;
	const nextEnemy = getCurrentEnemy(2);
	const checkPlagueSwap = plagueShield && enemy.level < nextEnemy.level;
	const plaguebringerDamage = checkPlagueSwap ? nextCell.plaguebringer : 0;
	const mapSize = mapping ? game.global['mapGridArray'].length : game.global['gridArray'];
	return checkPlagueSwap && ((mapping && !fastEnemy) || !mapping) && enemy.level !== mapSize - 3 && (typeof plaguebringerDamage === 'undefined' || plaguebringerDamage < enemy.maxHealth) && enemy.maxHealth * 0.05 < enemy.health;
}

function _getEnemyDmg(mapping, worldType) {
	const enemy = getCurrentEnemy();
	let damage = enemy.attack * enemyDamageModifiers() * 1.5;
	let damageMult = 1;

	if (challengeActive('Mayhem')) damage /= game.challenges.Mayhem.getEnemyMult();

	if (game.global.voidBuff === 'doubleAttack') damageMult += 2;

	const gammaMaxStacksCheck = _getGammaMaxStacks(worldType);
	const gammaToTrigger = gammaMaxStacksCheck - game.heirlooms.Shield.gammaBurst.stacks;
	const runningBerserk = challengeActive('Berserk') && game.challenges.Berserk.weakened !== 20;
	const runningTrappa = challengeActive('Trappapalooza');
	const runningArch = challengeActive('Archaeology');
	const shieldBreak = challengeActive('Bublé') || getCurrentQuest() === 8;
	if (game.global.voidBuff === 'getCrit' && (gammaToTrigger > 1 || runningBerserk || runningTrappa || runningArch || shieldBreak)) damageMult += 5;

	if (challengeActive('Daily')) {
		const dailyChallenge = game.global.dailyChallenge;
		const dailyEmpower = typeof dailyChallenge.empower !== 'undefined';
		const dailyEmpowerCheck = dailyEmpower && getPageSetting('empowerAutoEquality');
		const dailyCrit = typeof dailyChallenge.crits !== 'undefined';
		const dailyExplosive = typeof dailyChallenge.explosive !== 'undefined';

		if ((dailyEmpowerCheck && !mapping) || MODULES.maps.slowScumming) {
			if (dailyCrit) damageMult += 1 + dailyModifiers.crits.getMult(dailyChallenge.crits.strength);
		}
		if (worldType === 'map' && (dailyExplosive || dailyCrit) && !MODULES.maps.slowScumming) {
			const explosiveMult = dailyExplosive ? 1 + dailyModifiers.explosive.getMult(dailyChallenge.explosive.strength) : 1;
			if (dailyEmpowerCheck && dailyCrit) damageMult += 1 + dailyModifiers.crits.getMult(dailyChallenge.crits.strength);
			if (dailyExplosive) damageMult += explosiveMult;
		}
		if (dailyCrit && !dailyEmpower && (worldType === 'world' || worldType === 'void') && gammaToTrigger > 1) damageMult += 1 + dailyModifiers.crits.getMult(dailyChallenge.crits.strength);
	}

	const runningMayhem = challengeActive('Mayhem');
	const enemyCanPoison = runningMayhem && (mapping || enemy.level === 99);
	if (enemyCanPoison) damageMult += 1.2;

	damage *= damageMult;

	const equalityModifier = game.portal.Equality.getModifier();
	const maxEquality = game.portal.Equality.radLevel;
	const damageMax = damage * Math.pow(equalityModifier, maxEquality);

	return { enemyDmg: damage, enemyDmgMax: damageMax, enemyDmgMult: damageMult };
}

function _PBShieldSwapping(mapping, worldType, enemy, enemyDmg, enemyDmgMult, fastEnemy, ourHealth, ourDmg, unluckyDmg) {
	/* 
	Setup plaguebringer shield swapping. Will force us to kill the enemy slower for maximum plaguebringer transfer damage.
	Checking if we are at max plaguebringer damage. If not then skip to next equality stack if current attack will kill the enemy. 
    */
	const bionicTalent = _getBionicTalent(worldType);
	const maxDmg = calcOurDmg('max', 0, false, worldType, 'force', bionicTalent, true);
	const maxEquality = game.portal.Equality.radLevel;
	const shouldPlagueSwap = _shouldPBSwap(mapping, enemy);

	const gammaDmg = MODULES.heirlooms.gammaBurstPct;
	const gammaMaxStacksCheck = _getGammaMaxStacks(worldType);
	const gammaToTrigger = gammaMaxStacksCheck - game.heirlooms.Shield.gammaBurst.stacks;

	let equality = 0;
	let disableDamageAmps = false;
	let enemyDmgEquality = 0;
	let ourDmgEquality = 0;
	const enemyEqualityModifier = game.portal.Equality.getModifier();
	const ourEqualityModifier = game.portal.Equality.getModifier(1);
	const runningUnlucky = challengeActive('Unlucky');
	const runningMayhem = challengeActive('Mayhem');
	const runningSmithless = challengeActive('Smithless') && !mapping && game.global.world % 25 === 0 && game.global.lastClearedCell === -1 && game.global.gridArray[0].ubersmith;
	const smithlessGamma = runningSmithless && 10 - game.challenges.Smithless.uberAttacks > gammaToTrigger;
	const enemyCanPoison = runningMayhem && (mapping || enemy.level === 99);

	let ourDmgMax = 0;
	const isDaily = challengeActive('Daily');
	const dailyChallenge = game.global.dailyChallenge;
	const dailyEmpower = isDaily && typeof dailyChallenge.empower !== 'undefined';
	const dailyEmpowerToggle = dailyEmpower && getPageSetting('empowerAutoEquality');
	const dailyExplosive = isDaily && typeof dailyChallenge.explosive !== 'undefined';
	const explosiveMult = dailyExplosive ? 1 + dailyModifiers.explosive.getMult(dailyChallenge.explosive.strength) : 1;
	if ((dailyEmpowerToggle && !mapping && dailyExplosive) || MODULES.maps.slowScumming) {
		ourDmgMax = maxDmg * gammaDmg;
	}

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
			if (MODULES.maps.slowScumming && mapping && enemy.level % 2 !== 0 && _calculateDamageEquality(ourDmgMax, ourEqualityModifier, i + 1) > enemy.health) {
				continue;
			}
		}

		const wouldDie = enemyDmgEquality > ourHealth;
		const wouldDieMayhem = runningMayhem && enemyDmgEquality > game.global.soldierHealth * 6 + game.challenges.Mayhem.poison;
		if (fastEnemy && (wouldDie || wouldDieMayhem)) {
			equality = i;
			continue;
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

	// Check to see if we will kill a slow enemy faster with 0 equality or by gamma bursting it
	if (!fastEnemy) {
		const gammaDmgCheck = gammaToTrigger <= 1 && ourDmgEquality * gammaDmg < ourDmg;
		const wontNeedGamma = enemy.health / ourDmg <= gammaToTrigger;

		if (gammaDmgCheck || wontNeedGamma) {
			equality = 0;
		}

		if (runningUnlucky) {
			while (_isOddValue(unluckyDmg * Math.pow(ourEqualityModifier, equality)) && equality !== maxEquality) equality++;
		}
	}

	_setEquality(equality);

	const debugStats = getPageSetting('debugEqualityStats');
	if (debugStats) queryAutoEqualityStats(ourDmgEquality, ourHealth, enemyDmgEquality, enemy.health, equality);
}

function _equalityManagementAdvanced() {
	game.portal.Equality.scalingActive = false;
	game.options.menu.alwaysAbandon.enabled = 1;

	if (_checkDesoDestack()) return;

	const mapping = game.global.mapsActive;
	const mapObject = mapping ? getCurrentMapObject() : null;
	const worldType = !mapping ? 'world' : mapObject.location === 'Void' ? 'void' : 'map';
	const enemy = getCurrentEnemy();

	let ourHealth = _getOurHealth(mapping, worldType);

	const { ourDmg, unluckyDmg, fastEnemy } = _getOurDmg(worldType, enemy);

	if (_checkDuelSuicide(worldType, fastEnemy, ourHealth)) return;

	if (_checkBloodthirst(mapping, fastEnemy, ourDmg, enemy, worldType)) return;

	const { enemyDmg, enemyDmgMax, enemyDmgMult } = _getEnemyDmg(mapping, worldType);
	ourHealth = _checkSuicideArmy(worldType, mapping, ourHealth, enemyDmgMax);
	if (!ourHealth) return;

	if (enemy.health <= 0) return;

	_PBShieldSwapping(mapping, worldType, enemy, enemyDmg, enemyDmgMult, fastEnemy, ourHealth, ourDmg, unluckyDmg);
}

function equalityManagement() {
	if (game.portal.Equality.radLevel === 0) return;

	const equalitySetting = getPageSetting('equalityManagement');
	if (equalitySetting === 0) return;
	else if (equalitySetting === 1) _equalityManagementBasic();
	else if (equalitySetting == 2) _equalityManagementAdvanced();
}
