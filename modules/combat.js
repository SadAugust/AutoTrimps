function callBetterAutoFight() {
	avoidEmpower();
	trimpicide();
	const autoFightSetting = getPageSetting('autoFight');
	if (autoFightSetting === 0) return;
	else if (autoFightSetting === 1) betterAutoFight();
	else if (autoFightSetting === 2) betterAutoFightVanilla();
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

function betterAutoFight() {
	if (game.global.autoBattle && !game.global.pauseFight) pauseFight();
	if (game.global.gridArray.length === 0 || game.global.preMapsActive || !game.upgrades.Battle.done || MODULES.maps.lifeActive) return;
	if (!game.global.fighting && (game.global.soldierHealth > 0 || newArmyRdy())) battle(true);
}

function betterAutoFightVanilla() {
	if (game.global.autoBattle && game.global.pauseFight && !game.global.spireActive) pauseFight();
	if (game.global.gridArray.length === 0 || !game.upgrades.Battle.done || game.global.fighting) return;
	if (game.global.world === 1 && !game.global.fighting && !game.upgrades.Bloodlust.allowed) battle(true);
}

//Suicides trimps if we don't have max anticipation stacks and sending a new army would give us max stacks.
//Doesn't do this inside of void maps OR spires.
function trimpicide() {
	if (game.global.universe !== 1) return;
	if (game.portal.Anticipation.level === 0) return;
	if (!game.global.fighting) return;
	if (!getPageSetting('ForceAbandon')) return;
	const mapsActive = game.global.mapsActive;
	if (!mapsActive && game.global.spireActive) return;
	if (mapsActive && !newArmyRdy()) return;
	const antistacklimit = game.talents.patience.purchased ? 45 : 30;
	if (game.global.antiStacks >= antistacklimit) return;
	//Calculates Anticipation stacks based on time since last breed.
	const baseCheck = (game.jobs.Amalgamator.owned > 0 ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) >= antistacklimit;

	if (baseCheck) forceAbandonTrimps();
}

//Abandons trimps to get max anticipation stacks.
function forceAbandonTrimps() {
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

//Check if we would die from the next enemy attack - Only used in U1
function armyDeath() {
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

	if (runningDaily && !game.global.mapsActive && typeof dailyChallenge.empower !== 'undefined') {
		if (typeof dailyChallenge.empower !== 'undefined') enemyAttack *= dailyModifiers.empower.getMult(dailyChallenge.empower.strength, dailyChallenge.empower.stacks);
	}

	const pierce = !game.global.mapsActive ? getPierceAmt() : 0;
	let attackMinusBlock = enemyAttack - game.global.soldierCurrentBlock;
	if (pierce > 0) {
		const atkPierce = pierce * enemyAttack;
		if (attackMinusBlock < atkPierce) attackMinusBlock = atkPierce;
	}
	if (attackMinusBlock <= 0) attackMinusBlock = 0;
	enemyAttack = attackMinusBlock;

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

	ourHealth -= enemyAttack;

	return ourHealth <= 0;
}

//Suicides army to avoid empower stacks if the next enemy attack would kill us.
function avoidEmpower() {
	if (!armyDeath()) return;

	if (game.global.mapsActive && !game.global.voidBuff) {
		mapsClicked(true);
		runMap_AT();
	} else if (!game.global.mapsActive) {
		mapsClicked(true);
		mapsClicked(true);
	}
	debug(`Abandoning Trimps to avoid Empower stacks.`, `other`);
}

function setEquality(equality) {
	if (game.portal.Equality.disabledStackCount === equality) return;
	game.portal.Equality.disabledStackCount = equality;
	manageEqualityStacks();
	updateEqualityScaling();
}

function equalityManagementBasic() {
	if (game.global.preMapsActive) return;
	if (game.global.gridArray.length <= 0) return;

	if (challengeActive('Desolation') && mapSettings.equality && getPageSetting('autoMaps')) {
		game.portal.Equality.scalingActive = false;
		setEquality(game.portal.Equality.radLevel);
		return;
	}

	//Looking to see if the enemy that's currently being fought is fast.
	const fastEnemy = MODULES.fightinfo.fastImps.includes(getCurrentEnemy().name);
	//Checking if the map that's active is a Deadly voice map which always has first attack.
	const voidDoubleAttack = game.global.mapsActive && getCurrentMapObject().location === 'Void' && getCurrentMapObject().voidBuff === 'doubleAttack';
	//Checking if the Frenzy buff is active.
	const noFrenzy = game.portal.Frenzy.radLevel > 0 && game.portal.Frenzy.frenzyStarted === -1 && !autoBattle.oneTimers.Mass_Hysteria.owned;
	//Checking if the experience buff is active during Exterminate.
	const experienced = challengeActive('Exterminate') && game.challenges.Exterminate.experienced;
	//Checking to see if the Glass challenge is being run where all enemies are fast.
	const runningGlass = challengeActive('Glass');
	const runningDesolation = challengeActive('Desolation');

	//Toggles equality scaling on
	if ((fastEnemy && !experienced) || voidDoubleAttack || noFrenzy || runningGlass || runningDesolation) {
		if (!game.portal.Equality.scalingActive) {
			game.portal.Equality.scalingActive = true;
			manageEqualityStacks();
			updateEqualityScaling();
		}
		//Toggles equality scaling off and sets equality stacks to 0
	} else {
		if (game.portal.Equality.scalingActive) {
			game.portal.Equality.scalingActive = false;
			setEquality(0);
		}
	}
}

function equalityManagement() {
	if (game.portal.Equality.radLevel === 0) return;
	if (game.global.preMapsActive || game.global.gridArray.length <= 0) return;
	const equalitySetting = getPageSetting('equalityManagement');
	if (equalitySetting === 0) return;
	if (equalitySetting === 1) return equalityManagementBasic();

	//Turning off equality scaling and setting always abandon to on so that it can suicide armies
	game.portal.Equality.scalingActive = false;
	game.options.menu.alwaysAbandon.enabled = 1;

	//Misc vars
	const debugStats = getPageSetting('debugEqualityStats');
	const mapping = game.global.mapsActive;
	const mapObject = mapping ? getCurrentMapObject() : null;
	const currentCell = mapping ? game.global.lastClearedMapCell + 1 : game.global.lastClearedCell + 1;
	const mapGrid = mapping ? 'mapGridArray' : 'gridArray';
	const type = !mapping ? 'world' : mapObject.location === 'Void' ? 'void' : 'map';
	const zone = type === 'world' || !mapping ? game.global.world : mapObject.level;
	const bionicTalent = mapping && game.talents.bionic2.purchased && zone > game.global.world ? zone : 0;
	const difficulty = mapping ? mapObject.difficulty : 1;
	const armyReady = newArmyRdy();
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
	const shieldBreak = challengeActive('Bublé') || _getCurrentQuest() === 8; //Shield break quest
	const runningRevenge = challengeActive('Revenge');
	const runningArchaeology = challengeActive('Archaeology');
	const runningMayhem = challengeActive('Mayhem');
	const enemyCanPoison = runningMayhem && (mapping || currentCell === 99);
	const runningBerserk = challengeActive('Berserk') && game.challenges.Berserk.weakened !== 20;
	const runningExperienced = challengeActive('Exterminate') && game.challenges.Exterminate.experienced;
	const runningGlass = challengeActive('Glass');
	const runningDesolation = challengeActive('Desolation');
	const runningSmithless = challengeActive('Smithless') && !mapping && game.global.world % 25 === 0 && game.global.lastClearedCell === -1 && game.global.gridArray[0].ubersmith; //If UberSmith is active and not in a map

	//Override for max equality when we ONLY want to destack during Aesolation.
	if (runningDesolation && mapSettings.equality && game.global.world >= getPageSetting('destackOnlyZone') && getPageSetting('autoMaps')) {
		setEquality(game.portal.Equality.radLevel);
		return;
	}

	//Perk/Talent conditions
	const noFrenzy = game.portal.Frenzy.radLevel > 0 && !autoBattle.oneTimers.Mass_Hysteria.owned;
	const angelicOwned = game.talents.angelic.purchased;
	//Challenges/conditions where it's important to keep armies alive through angelic.
	const angelicDance = angelicOwned && (runningTrappa || runningRevenge || runningBerserk || noFrenzy || (dailyEmpower && !mapping));

	//Gamma burst info
	let gammaMaxStacksCheck = gammaMaxStacks(false, false, type);
	const gammaDmg = MODULES.heirlooms.gammaBurstPct;
	if (gammaDmg === 1) gammaMaxStacksCheck = 0;
	const gammaToTrigger = gammaMaxStacksCheck - game.heirlooms.Shield.gammaBurst.stacks;
	const smithlessGamma = runningSmithless && 10 - game.challenges.Smithless.uberAttacks > gammaToTrigger;

	//Initialising Stat variables
	//Our stats
	const dmgType = runningUnlucky ? 'max' : 'avg';
	const critType = challengeActive('Wither') || challengeActive('Glass') ? 'never' : 'maybe';

	//Returns only shield if running a shieldBraek challenge/quest
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

	//Enemy stats
	const enemy = getCurrentEnemy();
	const enemyName = game.global[mapGrid][currentCell].name;
	const enemyHealth = game.global[mapGrid][currentCell].health;
	let enemyDmg = enemy.attack * enemyDamageModifiers() * 1.5;
	const enemyEqualityModifier = game.portal.Equality.getModifier();
	let enemyDmgMax = enemyDmg * Math.pow(enemyEqualityModifier, maxEquality);
	if (runningMayhem) enemyDmg /= game.challenges.Mayhem.getEnemyMult();

	//Void Map Modifiers
	if (game.global.voidBuff === 'doubleAttack') enemyDamageMult += 2;
	if (game.global.voidBuff === 'getCrit' && (gammaToTrigger > 1 || runningBerserk || runningTrappa || runningArchaeology || shieldBreak)) enemyDamageMult += 5;
	//Daily Modifiers
	//Empower related modifiers in world
	if ((dailyEmpowerToggle && !mapping) || MODULES.maps.slowScumming) {
		if (dailyCrit) enemyDamageMult += 1 + dailyModifiers.crits.getMult(dailyChallenge.crits.strength);
		if (dailyExplosive || MODULES.maps.slowScumming) ourDmgMax = maxDmg * gammaDmg;
	}
	//Empower modifiers in maps.
	if (type === 'map' && (dailyExplosive || dailyCrit) && !MODULES.maps.slowScumming) {
		if (dailyEmpowerToggle && dailyCrit) enemyDamageMult += 1 + dailyModifiers.crits.getMult(dailyChallenge.crits.strength);
		if (dailyExplosive) enemyDamageMult += explosiveMult;
	}
	if (dailyCrit && !dailyEmpower && (type === 'world' || type === 'void') && gammaToTrigger > 1) enemyDamageMult += 1 + dailyModifiers.crits.getMult(dailyChallenge.crits.strength);
	//Mayhem poison
	if (enemyCanPoison) enemyDamageMult += 1.2;

	enemyDmg *= enemyDamageMult;

	//Fast Enemy conditions
	let fastEnemy = !game.global.preMapsActive && (runningDesolation && mapping ? !MODULES.fightinfo.exoticImps.includes(enemyName) : MODULES.fightinfo.fastImps.includes(enemyName));
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
		setEquality(0);
		return;
	}

	//Suiciding to get max bloodthirst stacks if our avg attacks to kill is greater than the attacks to proc a bloodthirst stack.
	if (dailyBloodthirst && mapping && fastEnemy && getPageSetting('bloodthirstMaxStacks')) {
		const bloodthirst = dailyChallenge.bloodthirst;
		const maxStacks = dailyModifiers.bloodthirst.getMaxStacks(bloodthirst.strength);
		const freq = dailyModifiers.bloodthirst.getFreq(bloodthirst.strength);
		const stacksToProc = freq - (bloodthirst.currStacks % freq);
		const avgTrimpAttack = ourDmg * Math.pow(ourEqualityModifier, equalityQuery(enemyName, zone, currentCell, type, difficulty, 'gamma')) * gammaDmg;
		const timeToKill = enemyHealth / avgTrimpAttack;

		if (bloodthirst.currStacks !== maxStacks && stacksToProc < timeToKill) {
			setEquality(0);
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
			setEquality(0);
			return;
		}
		ourHealth = remainingHealth(shieldBreak, angelicDance, type);
	}

	const calculateDamageEquality = (damage, equalityModifier, equalityLevel) => {
		return damage * Math.pow(equalityModifier, equalityLevel);
	};

	const checkEnemyDamage = (enemyDmg, enemyDmgEquality, ourHealth, enemyDamageMult, disableDamageAmps) => {
		if (enemyDmgEquality > ourHealth && enemyDamageMult !== 0 && !disableDamageAmps) {
			return { reset: true, disableDamageAmps: true, enemyDmg: enemyDmg / enemyDamageMult };
		}
		return { reset: false, disableDamageAmps, enemyDmg };
	};

	const isOddValue = (number) => number.toString()[0] % 2 === 1;

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
				enemyDmgEquality = calculateDamageEquality(enemyDmg, enemyEqualityModifier, i);
				const { reset, disableDamageAmps: newDisableDamageAmps, enemyDmg: newEnemyDmg } = checkEnemyDamage(enemyDmg, enemyDmgEquality, ourHealth, enemyDamageMult, disableDamageAmps);
				if (reset) {
					enemyDmg = newEnemyDmg;
					i = 0;
					disableDamageAmps = newDisableDamageAmps;
				} else {
					equality = maxEquality;
					break;
				}
			}

			while (shouldPlagueSwap && maxEquality > i && calculateDamageEquality(maxDmg, ourEqualityModifier, i) > enemyHealth) {
				i++;
			}

			while (runningUnlucky && maxEquality > i) {
				const unluckyDmgEquality = calculateDamageEquality(unluckyDmg, ourEqualityModifier, i);
				if (!isOddValue(unluckyDmgEquality)) break;
				i++;
			}

			enemyDmgEquality = calculateDamageEquality(enemyDmg, enemyEqualityModifier, i);
			ourDmgEquality = calculateDamageEquality(ourDmg, ourEqualityModifier, i);

			if (runningMayhem) enemyDmgEquality += game.challenges.Mayhem.poison;

			if (ourDmgMax > 0) {
				//Check to see if we kill the enemy with max damage on empower dailies with explosive mod. If so mult enemy dmg by explosive to stop gaining empower stacks.
				if (!disableDamageAmps && !MODULES.maps.slowScumming && calculateDamageEquality(ourDmgMax, ourEqualityModifier, i) > enemyHealth && enemyDmgEquality * explosiveMult > ourHealth) enemyDmgEquality *= explosiveMult;
				//Make sure that we don't kill slow enemies to ensure maximum plaguebringer transfer damage.
				if (MODULES.maps.slowScumming && mapping && currentCell % 2 !== 0 && calculateDamageEquality(ourDmgMax, ourEqualityModifier, i + 1) > enemyHealth) {
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

		setEquality(equality);

		if (debugStats) queryAutoEqualityStats(ourDmgEquality, ourHealth, enemyDmgEquality, enemyHealth, equality);
	}
}
