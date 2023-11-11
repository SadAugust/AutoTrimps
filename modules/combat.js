function callBetterAutoFight() {
	avoidEmpower();
	trimpcide();
	if (getPageSetting('autoFight') === 0) return;
	else if (getPageSetting('autoFight') === 1) betterAutoFight();
	else if (getPageSetting('autoFight') === 2) betterAutoFightVanilla();
}

function newArmyRdy() {
	if (['Trapper', 'Trappapalooza'].indexOf(trimpStats.currChallenge) > -1 && getPageSetting(trimpStats.currChallenge.toLowerCase())) {
		var popSetting = getPageSetting(trimpStats.currChallenge.toLowerCase() + 'ArmyPct');
		if (popSetting > 100) popSetting = 100;
		if (popSetting <= 0) return true;
		return (game.resources.trimps.owned > (game.resources.trimps.maxSoldiers * popSetting));
	}
	return game.resources.trimps.realMax() <= game.resources.trimps.owned;
}

function betterAutoFight() {
	if (game.global.autoBattle && !game.global.pauseFight)
		pauseFight();
	if (game.global.gridArray.length === 0 || game.global.preMapsActive || !game.upgrades.Battle.done || MODULES.maps.livingActive)
		return;
	if (!game.global.fighting && (game.global.soldierHealth > 0 || newArmyRdy()))
		battle(true);
}

function betterAutoFightVanilla() {
	if (game.global.autoBattle && game.global.pauseFight && !game.global.spireActive)
		pauseFight();
	if (game.global.gridArray.length === 0 || !game.upgrades.Battle.done || game.global.fighting)
		return;
	if (game.global.world === 1 && !game.global.fighting && game.global.lastClearedCell === -1) {
		battle(true);
	}
}

//Suicides trimps if we don't have max anticipation stacks and sending a new army would give us max stacks.
//Doesn't do this inside of void maps OR spires.
function trimpcide() {
	if (game.global.universe !== 1) return;
	if (game.portal.Anticipation.level === 0) return;
	if (!game.global.fighting) return;
	if (!getPageSetting('ForceAbandon')) return;
	const mapsActive = game.global.mapsActive;
	if (!mapsActive && game.global.spireActive) return;
	if (mapsActive && !newArmyRdy()) return;
	var antistacklimit = (game.talents.patience.purchased) ? 45 : 30;
	if (game.global.antiStacks >= antistacklimit) return;
	//Calculates Anticipation stacks based on time since last breed.
	var baseCheck = ((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) >= antistacklimit;

	if (baseCheck) {
		forceAbandonTrimps();
	}
}

//Abandons trimps to get max anticipation stacks.
function forceAbandonTrimps() {
	if (!getPageSetting('ForceAbandon')) return;
	if (!getPageSetting('autoMaps')) return;
	if (!game.global.mapsUnlocked) return;
	if (game.global.preMapsActive) return;
	//Exit and restart the map. If we are in the world, enter the world again.
	if (game.global.mapsActive) {
		mapsClicked(true);
		runMap();
	}
	else {
		mapsClicked(true);
		mapsClicked(true);
	}
	debug("Abandoning Trimps to resend army with max Anticipation stacks.", "other");
}

//Check if we would die from the next enemy attack
//Only used in U1
function armyDeath() {
	if (game.global.universe !== 1) return false;
	//Misc Stats
	const enemy = getCurrentEnemy();
	const fluctuation = game.global.universe === 2 ? 1.5 : 1.2;
	const runningDaily = challengeActive('Daily');
	//const runningElectricity = challengeActive('Electricity') || challengeActive('Mapocalypse');
	if (!runningDaily) return false;
	if (game.global.mapsActive) return false;
	if (runningDaily && typeof game.global.dailyChallenge.empower === 'undefined') return false;
	if (!getPageSetting('avoidEmpower')) return false;

	//Trimps Stats
	var ourHealth = game.global.soldierHealth;
	var block = game.global.soldierCurrentBlock;
	if (game.global.formation !== 0) block = game.global.formation === 3 ? block /= 4 : block *= 2;
	//Enemy Stats
	enemyAttack = enemy.attack * fluctuation;
	//Ice Empowerment
	if (getEmpowerment() === 'Ice') enemyAttack *= game.empowerments.Ice.getCombatModifier();
	//Empower mod
	if (runningDaily && !game.global.mapsActive && typeof game.global.dailyChallenge.empower !== 'undefined') {
		if (typeof game.global.dailyChallenge.empower !== 'undefined')
			enemyAttack *= dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks)
	}
	var originalEnemyAttack = enemyAttack;
	//Block Pierce calc
	var pierce = !game.global.mapsActive ? getPierceAmt() : 0;
	var attackMinusBlock = (enemyAttack - game.global.soldierCurrentBlock);
	if (pierce > 0) {
		var atkPierce = pierce * enemyAttack;
		if (attackMinusBlock < atkPierce) attackMinusBlock = atkPierce;
	}
	if (attackMinusBlock <= 0) attackMinusBlock = 0;
	enemyAttack = attackMinusBlock;

	if (runningDaily) {
		//Enemy crits
		if (typeof game.global.dailyChallenge.crits !== 'undefined')
			enemyAttack *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
		//Bogged
		if (typeof game.global.dailyChallenge.bogged !== 'undefined')
			ourHealth -= game.global.soldierHealthMax * dailyModifiers.bogged.getMult(game.global.dailyChallenge.bogged.strength)
		//Plagued
		if (typeof game.global.dailyChallenge.plague !== 'undefined')
			ourHealth -= game.global.soldierHealthMax * dailyModifiers.plague.getMult(game.global.dailyChallenge.plague.strength, game.global.dailyChallenge.plague.stacks);
	}
	//Doesn't currently do anything in the Electricity challenge but should be implemented.
	/* if (runningElectricity) {
		ourHealth -= game.global.soldierHealthMax * (0.1 * game.challenges.Electricity.stacks)
	} */

	if (enemy.corrupted) {
		if (enemy.corrupted === 'corruptCrit') enemyAttack *= 5;
		else if (enemy.corrupted === 'healthyCrit') enemyAttack *= 7;
		else if (enemy.corrupted === 'corruptBleed') ourHealth *= 0.8;
		else if (enemy.corrupted === 'healthyBleed') ourHealth *= 0.7;
	}

	ourHealth -= enemyAttack;

	//Explosive code would go here. Not sure it's worth implementing as the original version doesn't include this.
	/* if (runningDaily && typeof game.global.dailyChallenge.explosive !== 'undefined' && game.global.soldierHealthMax > block && pierce > 0) {
		var explodeDamage = originalEnemyAttack * dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength);
		var explodeAndBlock = explodeDamage - game.global.soldierCurrentBlock;
		if (explodeAndBlock < 0) explodeAndBlock = 0;
		if (pierce > 0) {
			var explodePierce = pierce * explodeDamage;
			if (explodeAndBlock < explodePierce) explodeAndBlock = explodePierce;
		}
		ourHealth -= explodeAndBlock;
	} */

	return ourHealth <= 0;
}

//Suicides army to avoid empower stacks if the next enemy attack would kill us.
function avoidEmpower() {
	if (!armyDeath()) return;

	if (game.global.mapsActive && game.global.voidBuff === '') {
		mapsClicked(true);
		runMap_AT();
	}
	else if (!game.global.mapsActive) {
		mapsClicked(true);
		mapsClicked(true);
	}
	debug('Abandoning Trimps to avoid Empower stacks.', 'other');
	return;
}

function equalityManagementBasic() {
	if (game.global.preMapsActive) return;
	if (game.global.gridArray.length <= 0) return;

	if (challengeActive('Desolation') && mapSettings.equality && getPageSetting('autoMaps')) {
		game.portal.Equality.scalingActive = false;
		game.portal.Equality.disabledStackCount = game.portal.Equality.radLevel;
		manageEqualityStacks();
		updateEqualityScaling();
		return;
	}

	//Looking to see if the enemy that's currently being fought is fast.
	var fastEnemy = MODULES.fightinfo.fastImps.includes(getCurrentEnemy().name);
	//Checking if the map that's active is a Deadly voice map which always has first attack.
	var voidDoubleAttack = game.global.mapsActive && getCurrentMapObject().location === "Void" && getCurrentMapObject().voidBuff === 'doubleAttack';
	//Checking if the Frenzy buff is active.
	var noFrenzy = game.portal.Frenzy.frenzyStarted === "-1" && !autoBattle.oneTimers.Mass_Hysteria.owned && game.portal.Frenzy.radLevel > 0;
	//Checking if the experience buff is active during Exterminate.
	var experienced = challengeActive('Exterminate') && game.challenges.Exterminate.experienced;
	//Checking to see if the Glass challenge is being run where all enemies are fast.
	var runningGlass = challengeActive('Glass');
	var runningDesolation = challengeActive('Desolation');

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
			game.portal.Equality.disabledStackCount = "0";
			manageEqualityStacks();
			updateEqualityScaling();
		}
	}
}

function equalityManagement() {
	if (game.portal.Equality.radLevel === 0) return;
	if (game.global.preMapsActive || game.global.gridArray.length <= 0) return;
	const equalitySetting = getPageSetting('equalityManagement');
	if (equalitySetting === 0) return;
	if (equalitySetting === 1) return equalityManagementBasic();

	//Turning off equality scaling
	game.portal.Equality.scalingActive = false;
	game.options.menu.alwaysAbandon.enabled = 1;
	//Misc vars
	var debugStats = getPageSetting('debugEqualityStats');
	var mapping = game.global.mapsActive ? true : false;
	var mapObject = mapping ? getCurrentMapObject() : null;
	var currentCell = mapping ? game.global.lastClearedMapCell + 1 : game.global.lastClearedCell + 1;
	var mapGrid = mapping ? 'mapGridArray' : 'gridArray';
	var type = (!mapping) ? "world" : (mapObject.location === "Void" ? "void" : "map");
	var zone = (type === "world" || !mapping) ? game.global.world : mapObject.level;
	var bionicTalent = mapping && game.talents.bionic2.purchased && (zone > game.global.world) ? zone : 0;
	var difficulty = mapping ? mapObject.difficulty : 1;
	var maxEquality = game.portal.Equality.radLevel;
	var equality = 0;
	var armyReady = newArmyRdy();
	var disableDamageAmps = false;
	var enemyDamageMult = 0;

	//Daily modifiers active
	var isDaily = challengeActive('Daily')
	var dailyEmpower = isDaily && typeof game.global.dailyChallenge.empower !== 'undefined'; //Empower
	var dailyEmpowerToggle = (dailyEmpower && getPageSetting('empowerAutoEquality'));
	var dailyCrit = isDaily && typeof game.global.dailyChallenge.crits !== 'undefined'; //Crit
	var dailyExplosive = isDaily && typeof game.global.dailyChallenge.explosive !== 'undefined'; //Dmg on death
	var dailyWeakness = isDaily && typeof game.global.dailyChallenge.weakness !== 'undefined'; //% dmg reduction on hit
	var dailyBloodthirst = isDaily && typeof game.global.dailyChallenge.bloodthirst !== 'undefined'; //Bloodthirst (enemy heal + atk)
	var dailyRampage = isDaily && typeof game.global.dailyChallenge.rampage !== 'undefined'; //Rampage (trimp attack buff)

	//Challenge conditions
	var runningUnlucky = challengeActive('Unlucky');
	var runningDuel = challengeActive('Duel');
	var runningTrappa = challengeActive('Trappapalooza');
	var runningQuest = (challengeActive('Quest') && currQuest() === 8) || challengeActive('Bublé'); //Shield break quest
	var runningRevenge = challengeActive('Revenge');
	var runningArchaeology = challengeActive('Archaeology');
	var runningMayhem = challengeActive('Mayhem');
	var enemyCanPoison = runningMayhem && (mapping || currentCell === 99);
	var runningBerserk = challengeActive('Berserk') && game.challenges.Berserk.weakened !== 20;
	var runningExperienced = challengeActive('Exterminate') && game.challenges.Exterminate.experienced;
	var runningGlass = challengeActive('Glass');
	var runningDesolation = challengeActive('Desolation');
	var runningSmithless = challengeActive('Smithless') && !mapping && game.global.world % 25 === 0 && game.global.lastClearedCell === -1 && game.global.gridArray[0].ubersmith; //If UberSmith is active and not in a map

	//Perk/Talent conditions
	var noFrenzy = game.portal.Frenzy.radLevel > 0 && !autoBattle.oneTimers.Mass_Hysteria.owned;
	var angelicOwned = game.talents.angelic.purchased;
	var angelicDance = angelicOwned && (runningTrappa || runningQuest || runningArchaeology || runningBerserk || noFrenzy);

	if (runningDesolation && mapSettings.equality && game.global.world >= getPageSetting('destackOnlyZone') &&
		getPageSetting('autoMaps')) {
		game.portal.Equality.disabledStackCount = game.portal.Equality.radLevel;
		manageEqualityStacks();
		updateEqualityScaling();
		return;
	}

	//Gamma burst info
	var gammaMaxStacksCheck = gammaMaxStacks();
	var gammaDmg = MODULES.heirlooms.gammaBurstPct;
	if (gammaDmg === 1) gammaMaxStacksCheck = 0;
	var gammaToTrigger = gammaMaxStacksCheck - game.heirlooms.Shield.gammaBurst.stacks;
	var fuckGamma = (runningSmithless && (10 - game.challenges.Smithless.uberAttacks) > gammaToTrigger);

	var critType = 'maybe';
	if (challengeActive('Wither') || challengeActive('Glass')) critType = 'never';

	//Initialising Stat variables
	//Our stats
	var dmgType = runningUnlucky ? 'max' : 'avg';
	var ourHealth = remainingHealth(angelicDance, type);
	if (dailyEmpower) ourHealth *= 0.98;
	var ourHealthMax = calcOurHealth(runningQuest, type);
	var ourDmg = calcOurDmg(dmgType, 0, false, type, critType, bionicTalent, true);
	var ourDmgMax = 0;
	var plagueShield = getHeirloomBonus('Shield', 'plaguebringer') > 0;

	var unluckyDmg = runningUnlucky ? Number(calcOurDmg('min', 0, false, type, 'never', bionicTalent, true)) : 2;

	if (noFrenzy) {
		if (getPageSetting('frenzyCalc') && game.portal.Frenzy.frenzyStarted === -1) {
			ourDmg /= 1 + (0.5 * game.portal.Frenzy.radLevel);
			unluckyDmg /= 1 + (0.5 * game.portal.Frenzy.radLevel);
		}
		if (!getPageSetting('frenzyCalc') && game.portal.Frenzy.frenzyStarted !== -1) {
			ourDmg *= 1 + (0.5 * game.portal.Frenzy.radLevel);
			unluckyDmg *= 1 + (0.5 * game.portal.Frenzy.radLevel);
		}
	}
	ourDmg *= dailyRampage ? dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, game.global.dailyChallenge.rampage.stacks) : 1;
	var ourDmgEquality = 0;
	var unluckyDmgEquality = 0;

	//Enemy stats
	var enemyName = game.global[mapGrid][currentCell].name;
	var enemyHealth = game.global[mapGrid][currentCell].health;
	var enemyDmg = getCurrentEnemy().attack * enemyDamageModifiers() * 1.5;
	if (runningMayhem) enemyDmg /= game.challenges.Mayhem.getEnemyMult();
	enemyDamageMult += game.global.voidBuff === 'doubleAttack' ? 2 : (game.global.voidBuff === 'getCrit' && (gammaToTrigger > 1 || runningBerserk || runningTrappa || runningArchaeology || runningQuest)) ? 5 : 1;

	//Empower related modifiers in world
	if ((dailyEmpowerToggle && !mapping && dailyEmpower) || MODULES.maps.slowScumming) {
		if (dailyCrit) enemyDamageMult += 1 + dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
		if (dailyExplosive || MODULES.maps.slowScumming) ourDmgMax = calcOurDmg('max', 0, false, type, 'force', bionicTalent, true) * gammaDmg;
	}
	//Empower modifiers in maps.
	if (type === 'map' && (dailyExplosive || dailyCrit) && !MODULES.maps.slowScumming) {
		if (dailyEmpowerToggle && dailyCrit) enemyDamageMult += 1 + dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
		if (dailyExplosive) enemyDamageMult += 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength);
	}
	enemyDamageMult += !dailyEmpower && (type === 'world' || type === 'void') && dailyCrit && gammaToTrigger > 1 ? 1 + dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength) : 1;

	enemyDamageMult += runningMayhem && ((!mapping && currentCell === 99) || mapping) ? 1.2 : 1
	var enemyDmgEquality = 0;
	//Misc dmg mult
	if (dailyWeakness) ourDmg *= (1 - ((game.global.dailyChallenge.weakness.stacks + (fastEnemy ? 1 : 0)) * game.global.dailyChallenge.weakness.strength) / 100);

	if (enemyDamageMult !== 0) enemyDmg *= enemyDamageMult;
	//Fast Enemy conditions
	var fastEnemy = !game.global.preMapsActive && (runningDesolation && mapping ? !MODULES.fightinfo.exoticImps.includes(enemyName) : MODULES.fightinfo.fastImps.includes(enemyName));
	if (type === 'world' && game.global.world > 200 && game.global.gridArray[currentCell].u2Mutation.length > 0) fastEnemy = true;
	else if (!mapping && (dailyEmpower || runningSmithless)) fastEnemy = true;
	else if (type === 'map' && dailyExplosive && !MODULES.maps.slowScumming) fastEnemy = true;
	else if (type === 'world' && dailyExplosive) fastEnemy = true;
	else if (game.global.voidBuff === 'doubleAttack') fastEnemy = true;
	else if (runningArchaeology) fastEnemy = true;
	else if (noFrenzy && (game.portal.Frenzy.frenzyActive() || (enemyHealth / ourDmg) > 10)) fastEnemy = true;
	else if (runningTrappa) fastEnemy = true;
	else if (runningDuel && !mapping) fastEnemy = true;
	else if (runningQuest) fastEnemy = true;
	else if (runningExperienced) fastEnemy = false;
	else if (runningGlass) fastEnemy = true;
	else if (runningBerserk) fastEnemy = true;
	else if (runningDuel && game.challenges.Duel.enemyStacks < 10) fastEnemy = true;
	else if (runningRevenge) fastEnemy = true;

	//Making sure we get the Duel health bonus by suiciding trimps with 0 equality
	if (runningDuel && getPageSetting('duel') && getPageSetting('duelHealth') && fastEnemy && (calcOurHealth(false, type) * 10 * 0.9) > ourHealth && gammaToTrigger === gammaMaxStacksCheck && game.global.armyAttackCount === 0) {
		game.portal.Equality.disabledStackCount = 0;
		if (parseNum(document.getElementById('equalityStacks').children[0].innerHTML.replace(/\D/g, '')) !== game.portal.Equality.disabledStackCount) manageEqualityStacks();
		updateEqualityScaling();
		return;
	}

	//Suiciding to get max bloodthirst stacks if our avg attacks to kill is greater than the attacks to proc a bloodthirst stack. 
	if (dailyBloodthirst && mapping && fastEnemy && getPageSetting('bloodthirstMaxStacks')) {
		var maxStacks = dailyModifiers.bloodthirst.getMaxStacks(game.global.dailyChallenge.bloodthirst.strength);
		var currStacks = game.global.dailyChallenge.bloodthirst.stacks;
		var stacksToProc = dailyModifiers.bloodthirst.getFreq(game.global.dailyChallenge.bloodthirst.strength) - (game.global.dailyChallenge.bloodthirst.stacks % dailyModifiers.bloodthirst.getFreq(game.global.dailyChallenge.bloodthirst.strength));
		var avgTrimpAttack = (ourDmg * Math.pow(game.portal.Equality.getModifier(1),
			equalityQuery(enemyName, zone, currentCell, type, difficulty, 'gamma')) * gammaDmg);
		var timeToKill = enemyHealth / avgTrimpAttack;

		if (currStacks !== maxStacks && stacksToProc < timeToKill) {
			game.portal.Equality.disabledStackCount = 0;
			if (parseNum(document.getElementById('equalityStacks').children[0].innerHTML.replace(/\D/g, '')) !== game.portal.Equality.disabledStackCount) {
				manageEqualityStacks();
				updateEqualityScaling();
			}
			return;
		}
	}

	const ourEqualityModifier = game.portal.Equality.getModifier(1);
	const enemyEqualityModifier = game.portal.Equality.getModifier();

	if (enemyHealth > 0) {
		for (var i = 0; i <= maxEquality; i++) {
			enemyDmgEquality = enemyDmg * Math.pow(enemyEqualityModifier, i);
			ourDmgEquality = ourDmg * Math.pow(ourEqualityModifier, i);

			//Since double attack enemies hit once before and once after need to check if we can survive both hits before halving enemy damage.
			if (i === maxEquality && enemyDmgEquality > ourHealth && enemyDamageMult !== 0 && !disableDamageAmps) {
				enemyDmg /= enemyDamageMult;
				i = 0;
				disableDamageAmps = true;
			}

			if (runningMayhem) enemyDmgEquality += game.challenges.Mayhem.poison;

			//Skips if we are running unlucky and our damage is odd.
			if (runningUnlucky) {
				unluckyDmgEquality = unluckyDmg * Math.pow(ourEqualityModifier, i);
				if (unluckyDmgEquality.toString()[0] % 2 === 1 && i !== maxEquality) continue;
			}
			//Check to see if we kill the enemy with our max damage on empower dailies with explosive mod. If we can then mult enemy dmg by explosive mod value to stop us gaining empower stacks.
			if (ourDmgMax > 0) {
				var ourMaxDmg = ourDmgMax * Math.pow(ourEqualityModifier, i);
				if (ourMaxDmg > enemyHealth && !MODULES.maps.slowScumming && (enemyDmgEquality * (1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength)) > ourHealth))
					enemyDmgEquality *= 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength);
				//Make sure that we don't kill slow enemyies with our max damage. This is to stop us overkilling the next cell and getting less plaguebringer damage.
				if (MODULES.maps.slowScumming && mapping && currentCell % 2 !== 0) {
					if (ourMaxDmg * Math.pow(ourEqualityModifier, i + 1) > enemyHealth) {
						continue;
					}
				}
			}

			//Setup plaguebringer shield swapping. Will force us to kill the enemy slower for maximum plaguebringer transfer damage.
			//Now works with void maps AND in world. Setup MODULES.heirlooms.plagueSwap to true to enable.
			if (plagueShield && (MODULES.heirlooms.plagueSwap || MODULES.maps.slowScumming)) {
				var nextCell = game.global[mapGrid][currentCell + 1];
				if (nextCell) {
					var plaguebringerDamage = nextCell.plaguebringer;
					var shouldSkip = calcOurDmg('max', i, false, type, 'force', bionicTalent, true) > enemyHealth
					//Checking if we are at max plaguebringer damage. If not then skip to next equality stack if current attack will kill the enemy.
					if (((mapping && !fastEnemy) || !mapping)
						&& shouldSkip && currentCell !== (game.global[mapGrid].length - 3) && (typeof (plaguebringerDamage) === 'undefined' || plaguebringerDamage < getCurrentEnemy().maxHealth) &&
						(getCurrentEnemy().maxHealth * .05 < enemyHealth)
					) {
						while (calcOurDmg('max', i, false, type, 'force', bionicTalent, true) > getCurrentEnemy().health && i < maxEquality) {
							i++;
						}
					}
				}
			}
			//Suiciding our army to reset health as it isn't efficient to keep it alive.
			if (ourHealth === 0 || (armyReady || (dailyEmpower && !mapping)) && (ourHealth < (ourHealthMax * (dailyEmpowerToggle ? 0.90 : 0.65))) && gammaToTrigger === gammaMaxStacksCheck && gammaMaxStacksCheck !== Infinity && !runningTrappa && !runningArchaeology && !runningBerserk) {
				if (game.global.mapsUnlocked && !mapping && !runningMayhem) {
					suicideTrimps(true);
					suicideTrimps(true);
				}
				else if (mapping && currentCell > 0 && type !== 'void' && getCurrentMapObject().location !== 'Darkness' && (!runningQuest && game.global.titimpLeft === 0)) {
					suicideTrimps(true);
					runMap_AT();
				}
				else {
					equality = 0;
				}
				break;
			} else if (fastEnemy && enemyDmgEquality > ourHealth) {
				equality = i;
				continue;
			} else if (runningMayhem && fastEnemy && enemyDmgEquality > ((game.global.soldierHealth * 6) + game.challenges.Mayhem.poison)) {
				equality = i;
				continue;
			} else if ((ourDmgEquality * gammaDmg) < enemyHealth && gammaToTrigger > 1) {
				equality = maxEquality;
				break;
			} else if (ourHealth > enemyDmgEquality && gammaToTrigger <= 1) {
				equality = i;
				break;
			} else if (ourHealth > enemyDmgEquality && ourDmgEquality > enemyHealth) {
				equality = i;
				break;
			} else if (ourHealth > (enemyDmgEquality * gammaToTrigger) && ourDmgEquality * gammaDmg > enemyHealth && !fuckGamma && !enemyCanPoison) {
				equality = i;
				break;
			} else if (ourHealth > (enemyDmgEquality * gammaToTrigger) && ourDmgEquality * gammaToTrigger > enemyHealth && !fuckGamma && !enemyCanPoison) {
				equality = i;
				break;
			} else if (ourHealth > (enemyDmgEquality * gammaToTrigger) && !fuckGamma && !enemyCanPoison) {
				equality = i;
				break;
			} else {
				equality = maxEquality;
			}
		}

		//Check to see if we will kill a slow enemy faster with 0 equality or by gamma bursting it
		if (!fastEnemy) {
			if (gammaToTrigger <= 1 && ourDmgEquality * gammaDmg < ourDmg) {
				equality = 0;
			}
			else if (enemyHealth / ourDmg <= gammaToTrigger) {
				equality = 0;
			}

			if (runningUnlucky) {
				while ((unluckyDmg * Math.pow(ourEqualityModifier, equality)).toString()[0] % 2 === 1 && equality !== maxEquality)
					equality++;
			}
		}
		game.portal.Equality.disabledStackCount = equality;
		if (parseNum(document.getElementById('equalityStacks').children[0].innerHTML.replace(/\D/g, '')) !== game.portal.Equality.disabledStackCount) manageEqualityStacks();
		updateEqualityScaling();
		if (debugStats) queryAutoEqualityStats(ourDmgEquality, ourHealth, enemyDmgEquality, enemyHealth, i);
	}
}