var critCC = 1;
var critDD = 1;
var trimpAA = 1;

//Helium

function getTrimpAttack() {
	var dmg = 6;
	var equipmentList = ["Dagger", "Mace", "Polearm", "Battleaxe", "Greatsword", "Arbalest"];
	for (var i = 0; i < equipmentList.length; i++) {
		if (game.equipment[equipmentList[i]].locked !== 0) continue;
		var attackBonus = game.equipment[equipmentList[i]].attackCalculated;
		var level = game.equipment[equipmentList[i]].level;
		dmg += attackBonus * level;
	}
	if (mutations.Magma.active()) {
		dmg *= mutations.Magma.getTrimpDecay();
	}
	dmg *= game.resources.trimps.maxSoldiers;
	if (game.portal.Power.level > 0) {
		dmg += (dmg * game.portal.Power.level * game.portal.Power.modifier);
	}
	if (game.portal.Power_II.level > 0) {
		dmg *= (1 + (game.portal.Power_II.modifier * game.portal.Power_II.level));
	}
	if (game.global.formation !== 0) {
		dmg *= (game.global.formation == 2) ? 4 : 0.5;
	}
	return dmg;
}

function calcOurHealth(stance) {
	var health = 50;

	if (game.resources.trimps.maxSoldiers > 0) {
		var equipmentList = ["Shield", "Boots", "Helmet", "Pants", "Shoulderguards", "Breastplate", "Gambeson"];
		for (var i = 0; i < equipmentList.length; i++) {
			if (game.equipment[equipmentList[i]].locked !== 0) continue;
			var healthBonus = game.equipment[equipmentList[i]].healthCalculated;
			var level = game.equipment[equipmentList[i]].level;
			health += healthBonus * level;
		}
	}
	health *= game.resources.trimps.maxSoldiers;
	if (game.goldenUpgrades.Battle.currentBonus > 0) {
		health *= game.goldenUpgrades.Battle.currentBonus + 1;
	}
	if (game.portal.Toughness.level > 0) {
		health *= ((game.portal.Toughness.level * game.portal.Toughness.modifier) + 1);
	}
	if (game.portal.Toughness_II.level > 0) {
		health *= ((game.portal.Toughness_II.level * game.portal.Toughness_II.modifier) + 1);
	}
	if (game.portal.Resilience.level > 0) {
		health *= (Math.pow(game.portal.Resilience.modifier + 1, game.portal.Resilience.level));
	}
	var geneticist = game.jobs.Geneticist;
	if (geneticist.owned > 0) {
		health *= (Math.pow(1.01, game.global.lastLowGen));
	}
	if (stance && game.global.formation > 0) {
		var formStrength = 0.5;
		if (game.global.formation == 1) formStrength = 4;
		health *= formStrength;
	}
	if (game.global.challengeActive == "Life") {
		health *= game.challenges.Life.getHealthMult();
	} else if (game.global.challengeActive == "Balance") {
		health *= game.challenges.Balance.getHealthMult();
	} else if (typeof game.global.dailyChallenge.pressure !== 'undefined') {
		health *= (dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks));
	}
	if (mutations.Magma.active()) {
		var mult = mutations.Magma.getTrimpDecay();
		var lvls = game.global.world - mutations.Magma.start() + 1;
		health *= mult;
	}
	var heirloomBonus = calcHeirloomBonus("Shield", "trimpHealth", 0, true);
	if (heirloomBonus > 0) {
		health *= ((heirloomBonus / 100) + 1);
	}
	if (game.global.radioStacks > 0) {
		health *= (1 - (game.global.radioStacks * 0.1));
	}
	if (game.global.totalSquaredReward > 0) {
		health *= (1 + (game.global.totalSquaredReward / 100));
	}
	if (game.jobs.Amalgamator.owned > 0) {
		health *= game.jobs.Amalgamator.getHealthMult();
	}
	if (game.talents.voidPower.purchased && game.global.voidBuff) {
		var amt = (game.talents.voidPower2.purchased) ? ((game.talents.voidPower3.purchased) ? 65 : 35) : 15;
		health *= (1 + (amt / 100));
	}
	return health;
}

function highDamageShield() {
	if (game.global.challengeActive != "Daily" && game.global.ShieldEquipped.name == getPageSetting('highdmg')) {
		critCC = getPlayerCritChance();
		critDD = getPlayerCritDamageMult();
		trimpAA = (calcHeirloomBonus("Shield", "trimpAttack", 1, true) / 100);
	}
	if (game.global.challengeActive == "Daily" && game.global.ShieldEquipped.name == getPageSetting('dhighdmg')) {
		critCC = getPlayerCritChance();
		critDD = getPlayerCritDamageMult();
		trimpAA = (calcHeirloomBonus("Shield", "trimpAttack", 1, true) / 100);
	}
}

function getCritMulti(high) {

	var critChance = getPlayerCritChance();
	var CritD = getPlayerCritDamageMult();

	if (
		high &&
		(getPageSetting('AutoStance') == 3 && getPageSetting('highdmg') != undefined && game.global.challengeActive != "Daily") ||
		(getPageSetting('use3daily') == true && getPageSetting('dhighdmg') != undefined && game.global.challengeActive == "Daily")
	) {
		highDamageShield();
		critChance = critCC;
		CritD = critDD;
	}

	var lowTierMulti = getMegaCritDamageMult(Math.floor(critChance));
	var highTierMulti = getMegaCritDamageMult(Math.ceil(critChance));
	var highTierChance = critChance - Math.floor(critChance)

	return ((1 - highTierChance) * lowTierMulti + highTierChance * highTierMulti) * CritD
}

function calcOurBlock(stance) {
	var block = 0;
	var gym = game.buildings.Gym;
	if (gym.owned > 0) {
		var gymStrength = gym.owned * gym.increase.by;
		block += gymStrength;
	}
	var shield = game.equipment.Shield;
	if (shield.blockNow && shield.level > 0) {
		var shieldStrength = shield.level * shield.blockCalculated;
		block += shieldStrength;
	}
	var trainer = game.jobs.Trainer;
	if (trainer.owned > 0) {
		var trainerStrength = trainer.owned * (trainer.modifier / 100);
		trainerStrength = calcHeirloomBonus("Shield", "trainerEfficiency", trainerStrength);
		block *= (trainerStrength + 1);
	}
	block *= game.resources.trimps.maxSoldiers;
	if (stance && game.global.formation == 3) {
		block *= 4;
	}
	var heirloomBonus = calcHeirloomBonus("Shield", "trimpBlock", 0, true);
	if (heirloomBonus > 0) {
		block *= ((heirloomBonus / 100) + 1);
	}
	if (game.global.radioStacks > 0) {
		block *= (1 - (game.global.radioStacks * 0.1));
	}
	return block;
}

function calcOurDmg(minMaxAvg, incStance, incFlucts) {
	var number = getTrimpAttack();
	var fluctuation = .2;
	var maxFluct = -1;
	var minFluct = -1;
	if (game.jobs.Amalgamator.owned > 0) {
		number *= game.jobs.Amalgamator.getDamageMult();
	}
	if (game.challenges.Electricity.stacks > 0) {
		number *= (1 - (game.challenges.Electricity.stacks * 0.1));
	}
	if (getPageSetting('45stacks') == false && game.global.antiStacks > 0) {
		number *= ((game.global.antiStacks * game.portal.Anticipation.level * game.portal.Anticipation.modifier) + 1);
	}
	if (getPageSetting('45stacks') == true && game.global.antiStacks > 0) {
		number *= ((45 * game.portal.Anticipation.level * game.portal.Anticipation.modifier) + 1);
	}
	if (game.global.mapBonus > 0) {
		var mapBonus = game.global.mapBonus;
		if (game.talents.mapBattery.purchased && mapBonus == 10) mapBonus *= 2;
		number *= ((mapBonus * .2) + 1);
	}
	if (game.global.achievementBonus > 0) {
		number *= (1 + (game.global.achievementBonus / 100));
	}
	if (game.global.challengeActive == "Discipline") {
		fluctuation = .995;
	}
	else if (game.portal.Range.level > 0) {
		minFluct = fluctuation - (.02 * game.portal.Range.level);
	}
	if (game.global.challengeActive == "Decay") {
		number *= 5;
		number *= Math.pow(0.995, game.challenges.Decay.stacks);
	}
	if (game.global.roboTrimpLevel > 0) {
		number *= ((0.2 * game.global.roboTrimpLevel) + 1);
	}
	if (game.global.challengeActive == "Lead" && ((game.global.world % 2) == 1)) {
		number *= 1.5;
	}
	if (game.goldenUpgrades.Battle.currentBonus > 0) {
		number *= game.goldenUpgrades.Battle.currentBonus + 1;
	}
	if (game.talents.voidPower.purchased && game.global.voidBuff) {
		var vpAmt = (game.talents.voidPower2.purchased) ? ((game.talents.voidPower3.purchased) ? 65 : 35) : 15;
		number *= ((vpAmt / 100) + 1);
	}
	if (game.global.totalSquaredReward > 0) {
		number *= ((game.global.totalSquaredReward / 100) + 1);
	}
	if (getPageSetting('fullice') == true && getEmpowerment() == "Ice") {
		number *= (Fluffy.isRewardActive('naturesWrath') ? 3 : 2);
	}
	if (getPageSetting('fullice') == false && getEmpowerment() == "Ice") {
		number *= (game.empowerments.Ice.getDamageModifier() + 1);
	}
	if (getEmpowerment() == "Poison" && getPageSetting('addpoison') == true) {
		number *= (1 + game.empowerments.Poison.getModifier());
		number *= 4;
	}
	if (game.talents.magmamancer.purchased) {
		number *= game.jobs.Magmamancer.getBonusPercent();
	}
	if (game.talents.stillRowing2.purchased) {
		number *= ((game.global.spireRows * 0.06) + 1);
	}
	if (game.global.voidBuff && game.talents.voidMastery.purchased) {
		number *= 5;
	}
	if (game.talents.healthStrength.purchased && mutations.Healthy.active()) {
		number *= ((0.15 * mutations.Healthy.cellCount()) + 1);
	}
	if (game.talents.herbalist.purchased) {
		number *= game.talents.herbalist.getBonus();
	}
	if (game.global.sugarRush > 0) {
		number *= sugarRush.getAttackStrength();
	}
	if (playerSpireTraps.Strength.owned) {
		var strBonus = playerSpireTraps.Strength.getWorldBonus();
		number *= (1 + (strBonus / 100));
	}
	if (Fluffy.isRewardActive('voidSiphon') && game.stats.totalVoidMaps.value) {
		number *= (1 + (game.stats.totalVoidMaps.value * 0.05));
	}
	if (game.global.challengeActive == "Life") {
		number *= game.challenges.Life.getHealthMult();
	}
	if (game.singleRunBonuses.sharpTrimps.owned) {
		number *= 1.5;
	}
	if (game.global.uberNature == "Poison") {
		number *= 3;
	}
	if (incStance && game.talents.scry.purchased && game.global.formation == 4 && (mutations.Healthy.active() || mutations.Corruption.active())) {
		number *= 2;
	}
	if (game.global.challengeActive == "Daily" && game.talents.daily.purchased) {
		number *= 1.5;
	}
	if (game.global.challengeActive == 'Lead' && game.global.world % 2 == 1 && game.global.world != 179) {
		number /= 1.5;
	}
	if (game.global.challengeActive == "Daily") {
		if (typeof game.global.dailyChallenge.minDamage !== 'undefined') {
			if (minFluct == -1) minFluct = fluctuation;
			minFluct += dailyModifiers.minDamage.getMult(game.global.dailyChallenge.minDamage.strength);
		}
		if (typeof game.global.dailyChallenge.maxDamage !== 'undefined') {
			if (maxFluct == -1) maxFluct = fluctuation;
			maxFluct += dailyModifiers.maxDamage.getMult(game.global.dailyChallenge.maxDamage.strength);
		}
		if (typeof game.global.dailyChallenge.oddTrimpNerf !== 'undefined' && ((game.global.world % 2) == 1)) {
			number *= dailyModifiers.oddTrimpNerf.getMult(game.global.dailyChallenge.oddTrimpNerf.strength);
		}
		if (typeof game.global.dailyChallenge.evenTrimpBuff !== 'undefined' && ((game.global.world % 2) == 0)) {
			number *= dailyModifiers.evenTrimpBuff.getMult(game.global.dailyChallenge.evenTrimpBuff.strength);
		}
		if (typeof game.global.dailyChallenge.rampage !== 'undefined') {
			number *= dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, game.global.dailyChallenge.rampage.stacks);
		}
	}
	number = calcHeirloomBonus("Shield", "trimpAttack", number)
	if (Fluffy.isActive()) {
		number *= Fluffy.getDamageModifier();
	}
	if (gammaBurstPct > 0 && (calcOurHealth() / (calcBadGuyDmg(null, getEnemyMaxAttack(game.global.world, 50, 'Snimp', 1.0))) >= 5)) {
		number *= (gammaBurstPct + 1) / 5;
	}


	if (!incStance && game.global.formation != 0) {
		number /= (game.global.formation == 2) ? 4 : 0.5;
	}

	var min = number;
	var max = number;
	var avg = number;

	min *= (getCritMulti(false) * 0.8);
	avg *= getCritMulti(false);
	max *= (getCritMulti(false) * 1.2);

	if (incFlucts) {
		if (minFluct > 1) minFluct = 1;
		if (maxFluct == -1) maxFluct = fluctuation;
		if (minFluct == -1) minFluct = fluctuation;

		min *= (1 - minFluct);
		max *= (1 + maxFluct);
		avg *= 1 + (maxFluct - minFluct) / 2;
	}

	if (minMaxAvg == "min") return min;
	else if (minMaxAvg == "max") return max;
	else if (minMaxAvg == "avg") return avg;
}

function calcDailyAttackMod(number) {
	if (game.global.challengeActive == "Daily") {
		if (typeof game.global.dailyChallenge.badStrength !== 'undefined') {
			number *= dailyModifiers.badStrength.getMult(game.global.dailyChallenge.badStrength.strength);
		}
		if (typeof game.global.dailyChallenge.badMapStrength !== 'undefined' && game.global.mapsActive) {
			number *= dailyModifiers.badMapStrength.getMult(game.global.dailyChallenge.badMapStrength.strength);
		}
		if (typeof game.global.dailyChallenge.bloodthirst !== 'undefined') {
			number *= dailyModifiers.bloodthirst.getMult(game.global.dailyChallenge.bloodthirst.strength, game.global.dailyChallenge.bloodthirst.stacks);
		}
	}
	return number;
}

function calcSpire(cell, name, what) {
	var exitCell = cell;
	if (game.global.challengeActive != "Daily" && isActiveSpireAT() && getPageSetting('ExitSpireCell') > 0 && getPageSetting('ExitSpireCell') <= 100)
		exitCell = (getPageSetting('ExitSpireCell') - 1);
	if (game.global.challengeActive == "Daily" && disActiveSpireAT() && getPageSetting('dExitSpireCell') > 0 && getPageSetting('dExitSpireCell') <= 100)
		exitCell = (getPageSetting('dExitSpireCell') - 1);
	var enemy = cell == 99 ? (exitCell == 99 ? game.global.gridArray[99].name : "Snimp") : name;
	var base = (what == "attack") ? game.global.getEnemyAttack(exitCell, enemy, false) : (calcEnemyBaseHealth(game.global.world, exitCell, enemy) * 2);
	var mod = (what == "attack") ? 1.17 : 1.14;
	var spireNum = Math.floor((game.global.world - 100) / 100);
	if (spireNum > 1) {
		var modRaiser = 0;
		modRaiser += ((spireNum - 1) / 100);
		if (what == "attack") modRaiser *= 8;
		if (what == "health") modRaiser *= 2;
		mod += modRaiser;
	}
	base *= Math.pow(mod, exitCell);
	base *= game.badGuys[enemy][what];
	return base;
}

function calcBadGuyDmg(enemy, attack, daily, maxormin, disableFlucts) {
	var number;
	if (enemy)
		number = enemy.attack;
	else
		number = attack;
	var fluctuation = .2;
	var maxFluct = -1;
	var minFluct = -1;

	if (!enemy && game.global.challengeActive) {
		if (game.global.challengeActive == "Coordinate") {
			number *= getBadCoordLevel();
		}
		else if (game.global.challengeActive == "Meditate") {
			number *= 1.5;
		}
		else if (enemy && game.global.challengeActive == "Nom" && typeof enemy.nomStacks !== 'undefined') {
			number *= Math.pow(1.25, enemy.nomStacks);
		}
		else if (game.global.challengeActive == "Watch") {
			number *= 1.25;
		}
		else if (game.global.challengeActive == "Lead") {
			number *= (1 + (game.challenges.Lead.stacks * 0.04));
		}
		else if (game.global.challengeActive == "Scientist" && getScientistLevel() == 5) {
			number *= 10;
		}
		else if (game.global.challengeActive == "Corrupted") {
			number *= 3;
		}
		else if (game.global.challengeActive == "Domination") {
			if (game.global.lastClearedCell == 98) {
				number *= 2.5;
			}
			else number *= 0.1;
		}
		else if (game.global.challengeActive == "Obliterated" || game.global.challengeActive == "Eradicated") {
			var oblitMult = (game.global.challengeActive == "Eradicated") ? game.challenges.Eradicated.scaleModifier : 1e12;
			var zoneModifier = Math.floor(game.global.world / game.challenges[game.global.challengeActive].zoneScaleFreq);
			oblitMult *= Math.pow(game.challenges[game.global.challengeActive].zoneScaling, zoneModifier);
			number *= oblitMult;
		}
		if (daily)
			number = calcDailyAttackMod(number);
	}
	if (!enemy && game.global.usingShriek) {
		number *= game.mapUnlocks.roboTrimp.getShriekValue();
	}

	if (!disableFlucts) {
		if (minFluct > 1) minFluct = 1;
		if (maxFluct == -1) maxFluct = fluctuation;
		if (minFluct == -1) minFluct = fluctuation;
		var min = Math.floor(number * (1 - minFluct));
		var max = Math.ceil(number + (number * maxFluct));
		return maxormin ? max : min;
	}
	else
		return number;
}

function calcEnemyBaseHealth(zone, level, name) {
	var health = 0;
	health += 130 * Math.sqrt(zone) * Math.pow(3.265, zone / 2);
	health -= 110;
	if (zone == 1 || zone == 2 && level < 10) {
		health *= 0.6;
		health = (health * 0.25) + ((health * 0.72) * (level / 100));
	}
	else if (zone < 60)
		health = (health * 0.4) + ((health * 0.4) * (level / 110));
	else {
		health = (health * 0.5) + ((health * 0.8) * (level / 100));
		health *= Math.pow(1.1, zone - 59);
	}
	if (zone < 60) {
		health *= 0.75;
		health *= game.badGuys[name].health;
	}
	return health;
}

function calcEnemyHealth(world, map) {
	world = !world ? game.global.world : world;
	var health = calcEnemyBaseHealth(world, 50, "Snimp");
	var corrupt = mutations.Corruption.active();
	var healthy = mutations.Healthy.active();
	if (map) {
		corrupt = false;
		healthy = false;
		if (game.global.universe == 1) {
			health *= 0.5;
		}
	}
	if (corrupt && !healthy) {
		var cptnum = getCorruptedCellsNum();
		var cpthlth = getCorruptScale("health");
		var cptpct = cptnum / 100;
		var hlthprop = cptpct * cpthlth;
		if (hlthprop >= 1)
			health *= hlthprop;
	}
	if (healthy) {
		var scales = Math.floor((game.global.world - 150) / 6);
		health *= 14 * Math.pow(1.05, scales);
		health *= 1.15;
	}
	if (game.global.challengeActive == "Obliterated" || game.global.challengeActive == "Eradicated") {
		var oblitMult = (game.global.challengeActive == "Eradicated") ? game.challenges.Eradicated.scaleModifier : 1e12;
		var zoneModifier = Math.floor(game.global.world / game.challenges[game.global.challengeActive].zoneScaleFreq);
		oblitMult *= Math.pow(game.challenges[game.global.challengeActive].zoneScaling, zoneModifier);
		health *= oblitMult;
	}
	if (game.global.challengeActive == "Coordinate") {
		health *= getBadCoordLevel();
	}
	if (game.global.challengeActive == "Toxicity") {
		health *= 2;
	}
	if (game.global.challengeActive == 'Lead') {
		health *= (1 + (game.challenges.Lead.stacks * 0.04));
	}
	if (game.global.challengeActive == 'Balance') {
		health *= 2;
	}
	if (game.global.challengeActive == 'Meditate') {
		health *= 2;
	}
	if (game.global.challengeActive == 'Life') {
		health *= 10;
	}
	if (game.global.challengeActive == "Domination") {
		if (game.global.lastClearedCell == 98) {
			health *= 7.5;
		} else health *= 0.1;
	}
	if (game.global.spireActive) {
		health = calcSpire(99, game.global.gridArray[99].name, 'health');
	}
	return health;
}

function calcHDratio(map) {
	var ratio = 0;
	var ourBaseDamage = calcOurDmg("avg", false, true);

	//Shield
	highDamageShield();
	if (getPageSetting('AutoStance') == 3 && getPageSetting('highdmg') != undefined && game.global.challengeActive != "Daily" && game.global.ShieldEquipped.name != getPageSetting('highdmg')) {
		ourBaseDamage /= getCritMulti(false);
		ourBaseDamage *= trimpAA;
		ourBaseDamage *= getCritMulti(true);
	}
	if (getPageSetting('use3daily') == true && getPageSetting('dhighdmg') != undefined && game.global.challengeActive == "Daily" && game.global.ShieldEquipped.name != getPageSetting('dhighdmg')) {
		ourBaseDamage /= getCritMulti(false);
		ourBaseDamage *= trimpAA;
		ourBaseDamage *= getCritMulti(true);
	}
	if (!map || map < 1) {
		ratio = calcEnemyHealth() / ourBaseDamage;
	}
	if (map || map >= 1)
		ratio = calcEnemyHealth(map, true) / ourBaseDamage;
	return ratio;
}

function calcCurrentStance() {
	if (game.global.uberNature == "Wind" && getEmpowerment() == "Wind" && !game.global.mapsActive &&
		(
			(
				(game.global.challengeActive != "Daily" && calcHDratio() < getPageSetting('WindStackingMinHD')) ||
				(game.global.challengeActive == "Daily" && calcHDratio() < getPageSetting('dWindStackingMinHD'))
			) &&
			(
				(game.global.challengeActive != "Daily" && game.global.world >= getPageSetting('WindStackingMin')) ||
				(game.global.challengeActive == "Daily" && game.global.world >= getPageSetting('dWindStackingMin')))
		) ||
		(game.global.uberNature == "Wind" && getEmpowerment() == "Wind" && !game.global.mapsActive && checkIfLiquidZone() && getPageSetting('liqstack') == true)
	) {
		return 15;
	}
	else {

		//Base Calc
		var ehealth = 1;
		if (game.global.fighting) {
			ehealth = (getCurrentEnemy().maxHealth - getCurrentEnemy().health);
		}
		var attacklow = calcOurDmg("max", false, true);
		var attackhigh = calcOurDmg("max", false, true);

		//Heirloom Calc
		highDamageShield();
		if (getPageSetting('AutoStance') == 3 && getPageSetting('highdmg') != undefined && game.global.challengeActive != "Daily" && game.global.ShieldEquipped.name != getPageSetting('highdmg')) {
			attackhigh *= trimpAA;
			attackhigh *= getCritMulti(true);
		}
		if (getPageSetting('use3daily') == true && getPageSetting('dhighdmg') != undefined && game.global.challengeActive == "Daily" && game.global.ShieldEquipped.name != getPageSetting('dhighdmg')) {
			attackhigh *= trimpAA;
			attackhigh *= getCritMulti(true);
		}

		//Heirloom Switch
		if (ehealth > 0) {
			var hitslow = (ehealth / attacklow);
			var hitshigh = (ehealth / attackhigh);
			var stacks = 190;
			var usehigh = false;
			var stacksleft = 1;

			if (game.global.challengeActive != "Daily" && getPageSetting('WindStackingMax') > 0) {
				stacks = getPageSetting('WindStackingMax');
			}
			if (game.global.challengeActive == "Daily" && getPageSetting('dWindStackingMax') > 0) {
				stacks = getPageSetting('dWindStackingMax');
			}
			if (game.global.uberNature == "Wind") {
				stacks += 100;
			}
			if (getEmpowerment() == "Wind") {
				stacksleft = (stacks - game.empowerments.Wind.currentDebuffPower);
			}

			//Use High
			if (
				(getEmpowerment() != "Wind") ||
				(game.empowerments.Wind.currentDebuffPower >= stacks) ||
				(hitshigh >= stacksleft) ||
				(game.global.mapsActive) ||
				(game.global.challengeActive != "Daily" && game.global.world < getPageSetting('WindStackingMin')) ||
				(game.global.challengeActive == "Daily" && game.global.world < getPageSetting('dWindStackingMin'))
			) {
				usehigh = true;
			}
			if (
				(getPageSetting('wsmax') > 0 && game.global.world >= getPageSetting('wsmax') && !game.global.mapsActive && getEmpowerment() == "Wind" && game.global.challengeActive != "Daily" && getPageSetting('wsmaxhd') > 0 && calcHDratio() < getPageSetting('wsmaxhd')) ||
				(getPageSetting('dwsmax') > 0 && game.global.world >= getPageSetting('dwsmax') && !game.global.mapsActive && getEmpowerment() == "Wind" && game.global.challengeActive == "Daily" && getPageSetting('dwsmaxhd') > 0 && calcHDratio() < getPageSetting('dwsmaxhd'))
			) {
				usehigh = false;
			}

			//Low
			if (!usehigh) {
				if (
					(game.empowerments.Wind.currentDebuffPower >= stacks) ||
					((hitslow * 4) > stacksleft)
				) {
					return 2;
				}
				else if ((hitslow) > stacksleft) {
					return 0;
				}
				else {
					return 1;
				}

				//High
			} else if (usehigh) {
				if (
					(getEmpowerment() != "Wind") ||
					(game.empowerments.Wind.currentDebuffPower >= stacks) ||
					((hitshigh * 4) > stacksleft) ||
					(game.global.mapsActive) ||
					(game.global.challengeActive != "Daily" && game.global.world < getPageSetting('WindStackingMin')) ||
					(game.global.challengeActive == "Daily" && game.global.world < getPageSetting('dWindStackingMin'))
				) {
					return 12;
				}
				else if ((hitshigh) > stacksleft) {
					return 10;
				}
				else {
					return 11;
				}
			}
		}
	}
}

//Radon

function debugCalc() {
	//Pre-Init
	var mapping = game.global.mapsActive ? true : false;
	var type = (!mapping) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	var zone = (type == "world" || !mapping) ? game.global.world : getCurrentMapObject().level;
	var cell = (type == "world" || !mapping) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
	var difficulty = mapping ? getCurrentMapObject().difficulty : 1;
	var name = getCurrentEnemy() ? getCurrentEnemy().name : "Chimp";
	var equality = Math.pow(game.portal.Equality.getModifier(), game.portal.Equality.disabledStackCount)
	var attack = RcalcBadGuyDmg(null, RgetEnemyAvgAttack(zone, cell, name), 0) * difficulty
	var safeMapping = mapping && game.talents.mapHealth.purchased ? 2 : 1;
	var bionic = mapping && game.talents.bionic2.purchased && zone > game.global.world ? 1.5 : 1;
	var runningUnlucky = game.global.challengeActive == 'Unlucky'

	//Init
	var displayedMin = RcalcOurDmg("min", game.portal.Equality.disabledStackCount, mapping, true, true, runningUnlucky, true) * bionic;
	var displayedMax = RcalcOurDmg("max", game.portal.Equality.disabledStackCount, mapping, true, true, runningUnlucky, true) * bionic * (runningUnlucky ? 399 : 1);

	//Trimp Stats
	debug("Our Stats");
	debug("Our attack: " + displayedMin.toExponential(2) + "-" + displayedMax.toExponential(2));
	debug("Our crit: " + 100 * getPlayerCritChance() + "% for " + getPlayerCritDamageMult().toFixed(1) + "x Damage. Average of " + RgetCritMulti(true, true).toFixed(2) + "x");
	debug("Our Health: " + (RcalcOurHealth() * safeMapping).toExponential(2));

	//Enemy stats
	debug("Enemy Stats");
	debug("Enemy Attack: " + (attack * 0.5 * equality).toExponential(2) + "-" + (attack * 1.5 * equality).toExponential(2));
	debug("Enemy Health: " + RcalcEnemyHealthMod(zone, cell, name, type).toExponential(2));
}


function RgetCritMulti(floorCrit, mult) {
	var mult = (!mult) ? false : true;

	var critChance = getPlayerCritChance();
	var critD = getPlayerCritDamageMult();

	if (floorCrit) critChance = Math.floor(getPlayerCritChance());
	var lowTierMulti = getMegaCritDamageMult(Math.floor(critChance));
	var highTierMulti = getMegaCritDamageMult(Math.ceil(critChance));
	var highTierChance = critChance - Math.floor(critChance)

	if (mult) return ((critChance - 2) * Math.pow(getMegaCritDamageMult(2), 2) * critD + (3 - critChance) * getMegaCritDamageMult(2) * critD);
	if (game.global.challengeActive == 'Duel') {
		if (highTierChance == 0)
			return 1;
		else
			return 1 + (highTierChance * critD)
	}
	else
		return ((1 - highTierChance) * lowTierMulti + highTierChance * highTierMulti) * critD
}

function RcalcOurDmg(minMaxAvg, equality, ignoreMapBonus, ignoreGammaBurst, useTitimp, runningUnlucky, floorCrit) {

	useTitimp = useTitimp ? true : false;
	runningUnlucky = !runningUnlucky ? false : true;
	floorCrit = !floorCrit ? false : true;
	// Base + equipment
	var number = 6;
	var equipmentList = ["Dagger", "Mace", "Polearm", "Battleaxe", "Greatsword", "Arbalest"];
	for (var i = 0; i < equipmentList.length; i++) {
		if (game.equipment[equipmentList[i]].locked !== 0) continue;
		var attackBonus = game.equipment[equipmentList[i]].attackCalculated;
		var level = game.equipment[equipmentList[i]].level;
		number += attackBonus * level;
	}

	// Soldiers
	number *= game.resources.trimps.maxSoldiers;
	// Smithies
	number *= game.buildings.Smithy.owned > 0 ? Math.pow((game.global.stringVersion >= '5.8.0' ? game.buildings.Smithy.getBaseMult() : 1.25), game.buildings.Smithy.owned) : 1;
	// Achievement bonus
	number *= game.global.achievementBonus > 0 ? 1 + (game.global.achievementBonus / 100) : 1;
	// Power
	number += (number * game.portal.Power.radLevel * game.portal.Power.modifier);
	// Map Bonus
	number *= ignoreMapBonus ? 1 : game.talents.mapBattery.purchased && game.global.mapBonus == 10 ? 5 : 1 + (game.global.mapBonus * .2);
	// Tenacity
	number *= game.portal.Tenacity.getMult();
	// Hunger
	number *= game.portal.Hunger.getMult();
	// Observation
	number *= game.portal.Observation.getMult();
	//Titimp
	number *= useTitimp && game.global.titimpLeft > 0 ? 2 : 1;
	// Robotrimp
	number *= 1 + (0.2 * game.global.roboTrimpLevel);
	// Mayhem Completions
	number *= game.challenges.Mayhem.getTrimpMult();
	// Pandemonium Completions
	number *= game.challenges.Pandemonium.getTrimpMult();
	//AutoBattle
	number *= autoBattle.bonuses.Stats.getMult();
	// Heirloom (Shield)
	number *= 1 + calcHeirloomBonus('Shield', 'trimpAttack', 1, true) / 100;
	// Frenzy perk
	number *= game.global.challengeActive !== 'Berserk' && (getPageSetting('Rcalcfrenzy') || autoBattle.oneTimers.Mass_Hysteria.owned) ? 1 + (0.5 * game.portal.Frenzy.radLevel) : 1;
	//Championism
	number *= game.portal.Championism.getMult();
	// Golden Upgrade
	number *= 1 + game.goldenUpgrades.Battle.currentBonus;
	// Herbalist Mastery
	number *= game.talents.herbalist.purchased ? game.talents.herbalist.getBonus() : 1;
	// Challenge 2 or 3 reward
	number *= 1 + (game.global.totalSquaredReward / 100);
	// Fluffy Modifier
	number *= Fluffy.getDamageModifier();
	// Pspire Strength Towers
	number *= 1 + (playerSpireTraps.Strength.getWorldBonus() / 100);
	// Sharp Trimps
	number *= game.singleRunBonuses.sharpTrimps.owned ? 1.5 : 1;
	//Mutator
	number *= game.global.stringVersion >= '5.8.0' && u2Mutations.tree.Attack.purchased ? 1.5 : 1;
	// Sugar rush event bonus
	number *= game.global.sugarRush ? sugarRush.getAttackStrength() : 1;
	// Challenges
	number *= game.global.challengeActive == 'Unbalance' ? game.challenges.Unbalance.getAttackMult() : 1;
	number *= game.global.challengeActive == 'Duel' && game.challenges.Duel.trimpStacks > 50 ? 3 : 1;
	number *= game.global.challengeActive == 'Melt' ? 5 * Math.pow(0.99, game.challenges.Melt.stacks) : 1;
	number *= game.global.challengeActive == 'Quagmire' ? game.challenges.Quagmire.getExhaustMult() : 1;
	number *= game.global.challengeActive == 'Revenge' ? game.challenges.Revenge.getMult() : 1;
	number *= game.global.challengeActive == 'Quest' ? game.challenges.Quest.getAttackMult() : 1;
	number *= game.global.challengeActive == 'Archaeology' ? game.challenges.Archaeology.getStatMult('attack') : 1;
	number *= game.global.challengeActive == 'Storm' && game.global.mapsActive ? Math.pow(0.9995, game.challenges.Storm.beta) : 1;
	number *= game.global.challengeActive == 'Berserk' ? game.challenges.Berserk.getAttackMult() : 1;
	number *= game.global.challengeActive == 'Nurture' && game.challenges.Nurture.boostsActive() ? game.challenges.Nurture.getStatBoost() : 1;
	number *= game.global.challengeActive == 'Alchemy' ? alchObj.getPotionEffect('Potion of Strength') : 1;
	if (game.global.stringVersion >= '5.8.0') {
		number *= !game.global.mapsActive && game.global.novaMutStacks > 0 ? u2Mutations.types.Nova.trimpAttackMult() : 1;
		//Smithies (smithless challenge)
		number *= game.global.challengeActive === 'Smithless' && game.challenges.Smithless.fakeSmithies > 0 ? Math.pow(1.25, game.challenges.Smithless.fakeSmithies) : 1;
	}

	// Dailies
	var minDailyMod = 1;
	var maxDailyMod = 1;
	if (game.global.challengeActive == "Daily") {
		// Legs for Days mastery
		number *= game.talents.daily.purchased ? 1.5 : 1;
		//Scruffy Level 20 - Dailies
		number *= Fluffy.isRewardActive('SADailies') && game.global.challengeActive == "Daily" ? Fluffy.rewardConfig.SADailies.attackMod() : 1;
		// Min damage reduced (additive)
		minDailyMod -= typeof game.global.dailyChallenge.minDamage !== 'undefined' ? dailyModifiers.minDamage.getMult(game.global.dailyChallenge.minDamage.strength) : 0;
		// Max damage increased (additive)
		maxDailyMod += typeof game.global.dailyChallenge.maxDamage !== 'undefined' ? dailyModifiers.maxDamage.getMult(game.global.dailyChallenge.maxDamage.strength) : 0;
		// Minus attack on odd zones
		number += typeof game.global.dailyChallenge.oddTrimpNerf !== 'undefined' && ((game.global.world % 2) == 1) ? dailyModifiers.oddTrimpNerf.getMult(game.global.dailyChallenge.oddTrimpNerf.strength) : 0;
		// Bonus attack on even zones
		number -= typeof game.global.dailyChallenge.evenTrimpBuff !== 'undefined' && ((game.global.world % 2) == 0) ? dailyModifiers.evenTrimpBuff.getMult(game.global.dailyChallenge.evenTrimpBuff.strength) : 0;
		// Rampage Daily mod
		number -= typeof game.global.dailyChallenge.rampage !== 'undefined' ? dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, game.global.dailyChallenge.rampage.stacks) : 0;
	}

	if (game.talents.voidPower.purchased && game.global.voidBuff !== '') {
		number *= (game.talents.voidPower2.purchased) ? ((game.talents.voidPower3.purchased) ? 1.65 : 1.35) : 1.15;
		number *= (game.talents.voidMastery.purchased) ? 5 : 1;
	}

	number *= (game.global.challengeActive == 'Unlucky' || floorCrit) ? RgetCritMulti(true) : RgetCritMulti();

	// Equality
	if (!isNaN(parseInt((equality)))) {
		if (equality > game.portal.Equality.radLevel)
			debug('You don\'t have this many levels in Equality.')
		number *= Math.pow(game.portal.Equality.getModifier(1), equality)
	} else if (isNaN(parseInt((equality)))) {
		if (getPageSetting('Rcalcmaxequality') == 1 && getPageSetting('Rmanageequality') && !equality)
			number *= Math.pow(game.portal.Equality.getModifier(1), game.portal.Equality.scalingCount);
		else if (getPageSetting('Rcalcmaxequality') == 0 && !equality)
			number *= game.portal.Equality.getMult(1);
		else
			number *= game.portal.Equality.getMult(1);
	}

	if (game.global.challengeActive == 'Unlucky') {
		number *= 0.005
		if (runningUnlucky)
			return number;
		if (Number(number.toString()[0] % 2 == 0))
			number *= 399
		number /= RgetCritMulti(true);
		number *= RgetCritMulti(floorCrit);
	}

	// Gamma Burst
	number *= ignoreGammaBurst ? 1 : gammaBurstPct;

	switch (minMaxAvg) {
		case 'min':
			return game.global.challengeActive == 'Unlucky' ? number : number * (game.portal.Range.radLevel * 0.02 + 0.8) * minDailyMod;
		case 'max':
			return game.global.challengeActive == 'Unlucky' ? number : number * 1.2 * maxDailyMod;
		case 'avg':
			return number;
	}
	return number;
}

function RcalcOurHealth(onlyShield) {
	//Initiatising health
	var onlyShield = !onlyShield ? false : onlyShield;
	var health = 50;
	var shield = 0;
	if (game.resources.trimps.maxSoldiers > 0) {
		var equipmentList = ["Shield", "Boots", "Helmet", "Pants", "Shoulderguards", "Breastplate", "Gambeson"];
		for (var i = 0; i < equipmentList.length; i++) {
			if (game.equipment[equipmentList[i]].locked !== 0) continue;
			var healthBonus = game.equipment[equipmentList[i]].healthCalculated;
			var level = game.equipment[equipmentList[i]].level;
			health += healthBonus * level;
		}
	}
	//Soldier Mult
	health *= game.resources.trimps.maxSoldiers
	//Smithies
	health *= game.buildings.Smithy.owned > 0 ? game.buildings.Smithy.getMult() : 1;
	//Antenna Array
	health *= game.buildings.Antenna.owned >= 10 ? game.jobs.Meteorologist.getExtraMult() : 1;
	//Toughness add
	health *= game.portal.Toughness.radLevel > 0 ? 1 + (game.portal.Toughness.radLevel * game.portal.Toughness.modifier) : 1;
	//Resilience
	health *= game.portal.Resilience.radLevel > 0 ? Math.pow(game.portal.Resilience.modifier + 1, game.portal.Resilience.radLevel) : 1;
	//Scruffy is Life
	health *= Fluffy.isRewardActive('healthy') ? 1.5 : 1;
	//Observation
	health *= game.portal.Observation.radLevel > 0 ? game.portal.Observation.getMult() : 1;
	//Mayhem Completions
	health *= game.global.mayhemCompletions > 0 ? game.challenges.Mayhem.getTrimpMult() : 1;
	//Pandemonium Completions
	health *= game.global.pandCompletions > 0 ? game.challenges.Pandemonium.getTrimpMult() : 1;
	//AutoBattle
	health *= autoBattle.bonuses.Stats.getMult();
	//Shield (Heirloom)
	health = calcHeirloomBonus('Shield', 'trimpHealth', health);
	//Championism
	health *= game.portal.Championism.getMult();
	//Golden Battle
	health *= game.goldenUpgrades.Battle.currentBonus > 0 ? 1 + game.goldenUpgrades.Battle.currentBonus : 1;
	//Safe Mapping - Don't think it's worthwhile implementing, would mess up a lot of calcs. Just multiply health by 2 when meant to be mapping
	//health *= game.talents.mapHealth.purchased && game.global.mapsActive ? 2 : 1;
	//Cinf
	health *= game.global.totalSquaredReward > 0 ? 1 + (game.global.totalSquaredReward / 100) : 1;
	//Mutator
	health *= game.global.stringVersion >= '5.8.0' && u2Mutations.tree.Health.purchased ? 1.5 : 1;
	//Duel Mult
	health *= game.global.challengeActive == 'Duel' && game.challenges.Duel.trimpStacks < 20 ? game.challenges.Duel.healthMult : 1;
	//Revenge Mult
	health *= game.global.challengeActive == 'Revenge' && game.challenges.Revenge.stacks > 0 ? game.challenges.Revenge.getMult() : 1;
	//Wither Mult
	health *= game.global.challengeActive == 'Wither' && game.challenges.Wither.trimpStacks > 0 ? game.challenges.Wither.getTrimpHealthMult() : 1;
	//Insanity Mult
	health *= game.global.challengeActive == 'Insanity' ? game.challenges.Insanity.getHealthMult() : 1;
	//Berserk Mult
	health *= game.global.challengeActive == 'Berserk' && game.challenges.Berserk.frenzyStacks > 0 ? game.challenges.Berserk.getHealthMult() : 1;
	health *= game.global.challengeActive == 'Berserk' && game.challenges.Berserk.frenzyStacks <= 0 ? game.challenges.Berserk.getHealthMult(true) : 1;
	//Nurture Mult
	health *= game.challenges.Nurture.boostsActive() ? game.challenges.Nurture.getStatBoost() : 1;
	//Alchemy Mult
	health *= alchObj.getPotionEffect('Potion of Strength');
	//Smithies (smithless challenge)
	health *= game.global.challengeActive === 'Smithless' && game.challenges.Smithless.fakeSmithies > 0 ? Math.pow(1.25, game.challenges.Smithless.fakeSmithies) : 1;
	//Pressure (Dailies)
	health *= typeof game.global.dailyChallenge.pressure !== 'undefined' ? dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks) : 1;
	//Void Map Talents
	health *= (game.talents.voidPower.purchased && game.global.voidBuff) ? (1 + (game.talents.voidPower.getTotalVP() / 100)) : 1;

	//Prismatic Shield and Shield Layer, scales with multiple Scruffy shield layers
	shield = (health * (Fluffy.isRewardActive('shieldlayer') ? 1 + (getEnergyShieldMult() * (1 + Fluffy.isRewardActive('shieldlayer'))) : 1 + getEnergyShieldMult())) - health;

	if (!onlyShield)
		health += shield;
	else
		health = shield;

	return health;
}

function RcalcDailyAttackMod(number) {
	if (game.global.challengeActive == 'Daily') {
		number *= typeof game.global.dailyChallenge.badStrength !== 'undefined' ? dailyModifiers.badStrength.getMult(game.global.dailyChallenge.badStrength.strength) : 1;
		number *= typeof game.global.dailyChallenge.badMapStrength !== 'undefined' && game.global.mapsActive ? dailyModifiers.badMapStrength.getMult(game.global.dailyChallenge.badMapStrength.strength) : 1;
		number *= typeof game.global.dailyChallenge.bloodthirst !== 'undefined' ? dailyModifiers.bloodthirst.getMult(game.global.dailyChallenge.bloodthirst.strength, game.global.dailyChallenge.bloodthirst.stacks) : 1;
		number *= typeof game.global.dailyChallenge.empower !== 'undefined' && !game.global.mapsActive ? dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks) : 1;
	}
	return number;
}

function RcalcBadGuyDmg(enemy, attack, equality, query, mapType) { //Works out avg dmg. For max dmg * 1.5.
	var number = enemy ? enemy.attack : attack;
	var query = !query ? false : query;
	var mapType = !mapType ? false : mapType;
	number = game.global.challengeActive == 'Exterminate' && getPageSetting('Rexterminateon') && getPageSetting('Rexterminatecalc') ? RgetEnemyAvgAttack(game.global.world, 90, 'Mantimp') : number;
	if (!isNaN(parseInt((equality)))) {
		if (equality > game.portal.Equality.radLevel)
			debug('You don\'t have this many levels in Equality.')
		number *= Math.pow(game.portal.Equality.getModifier(), equality)
	} else if (isNaN(parseInt((equality)))) {
		number *= game.portal.Equality.radLevel > 0 && getPageSetting('Rcalcmaxequality') == 0 && !equality ? game.portal.Equality.getMult() : 1;
		number *= game.portal.Equality.radLevel > 0 && getPageSetting('Rcalcmaxequality') == 0 && !equality ? game.portal.Equality.getMult() : 1;
		number *= game.portal.Equality.radLevel > 0 && getPageSetting('Rcalcmaxequality') >= 1 && game.portal.Equality.scalingCount > 0 && !equality ? Math.pow(game.portal.Equality.modifier, game.portal.Equality.scalingCount) : 1;
	}
	if (game.global.challengeActive == "Daily") {
		if (typeof game.global.dailyChallenge.badStrength !== 'undefined')
			number *= dailyModifiers.badStrength.getMult(game.global.dailyChallenge.badStrength.strength);

		if (typeof game.global.dailyChallenge.badMapStrength !== 'undefined' && (game.global.mapsActive || (mapType !== false && mapType === 'map')))
			number *= dailyModifiers.badMapStrength.getMult(game.global.dailyChallenge.badMapStrength.strength);

		if (typeof game.global.dailyChallenge.bloodthirst !== 'undefined')
			number *= dailyModifiers.bloodthirst.getMult(game.global.dailyChallenge.bloodthirst.strength, game.global.dailyChallenge.bloodthirst.stacks)

		if (typeof game.global.dailyChallenge.empower !== 'undefined' && (!game.global.mapsActive || (mapType !== false && mapType === 'world')))
			number *= dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks);
	}
	number *= game.global.challengeActive == 'Unbalance' ? 1.5 : 1;
	number *= game.global.challengeActive == 'Duel' && game.challenges.Duel.trimpStacks < 50 ? 3 : 1;
	number *= game.global.challengeActive == 'Wither' && game.challenges.Wither.enemyStacks > 0 ? game.challenges.Wither.getEnemyAttackMult() : 1;
	number *= game.global.challengeActive == 'Archaeology' ? game.challenges.Archaeology.getStatMult('enemyAttack') : 1;
	number *= game.global.challengeActive == 'Mayhem' && !game.global.mapsActive && game.global.lastClearedCell + 2 == 100 ? game.challenges.Mayhem.getBossMult() : 1;
	//Purposefully don't put Storm in here.
	number *= game.global.challengeActive == 'Storm' && !game.global.mapsActive ? game.challenges.Storm.getAttackMult() : 1;
	//number *= game.global.challengeActive == 'Berserk' ? 1.5 : 1;
	number *= game.global.challengeActive == 'Exterminate' ? game.challenges.Exterminate.getSwarmMult() : 1;
	number *= game.global.challengeActive == 'Nurture' ? 2 : 1;
	number *= game.global.challengeActive == 'Nurture' && game.buildings.Laboratory.owned > 0 ? game.buildings.Laboratory.getEnemyMult() : 1;
	number *= game.global.challengeActive == 'Pandemonium' && !game.global.mapsActive && game.global.lastClearedCell + 2 == 100 ? game.challenges.Pandemonium.getBossMult() : 1;
	number *= game.global.challengeActive == 'Pandemonium' && !(!game.global.mapsActive && game.global.lastClearedCell + 2 == 100) ? game.challenges.Pandemonium.getPandMult() : 1;
	number *= game.global.challengeActive == 'Alchemy' ? ((alchObj.getEnemyStats(false, false)) + 1) : 1;
	number *= game.global.challengeActive == 'Hypothermia' ? game.challenges.Hypothermia.getEnemyMult() : 1;
	number *= game.global.challengeActive == 'Glass' ? game.challenges.Glass.attackMult() : 1;
	if (game.global.stringVersion >= '5.8.0' && game.global.world > 200 && game.global.universe === 2) {
		if (game.global.world > 200 && game.global.universe === 2 && !game.global.mapsActive) {
			if (!query && typeof (game.global.gridArray[game.global.lastClearedCell + 1].u2Mutation) !== 'undefined' && game.global.gridArray[game.global.lastClearedCell + 1].u2Mutation.length > 0) {
				var cell = game.global.gridArray[game.global.lastClearedCell + 1]
				/* if (cell.u2Mutation.indexOf('CMP') == -1) {
					if (cell.u2Mutation.indexOf('NVA') != -1) number *= 0.01;
					else if (cell.u2Mutation.indexOf('NVX') != -1) number *= 10;
				} */
				number *= (1.01, game.global.world - 201)
				if (cell.u2Mutation.indexOf('RGE') != -1 || (cell.cc && cell.cc[3] > 0)) number *= u2Mutations.types.Rage.enemyAttackMult();
			}
			number *= game.global.novaMutStacks > 0 ? u2Mutations.types.Nova.enemyAttackMult() : 1;
		}
	}
	return number;
}

function RcalcBadGuyDmgMod(forceMaps) {
	forceMaps = !forceMaps ? false : forceMaps;
	number = 1;
	number *= game.global.challengeActive == 'Duel' && game.challenges.Duel.trimpStacks < 50 ? 3 : 1;
	number *= game.global.challengeActive == 'Wither' && game.challenges.Wither.enemyStacks > 0 ? game.challenges.Wither.getEnemyAttackMult() : 1;
	number *= game.global.challengeActive == 'Archaeology' ? game.challenges.Archaeology.getStatMult('enemyAttack') : 1;
	number *= game.global.challengeActive == 'Mayhem' && !game.global.mapsActive && game.global.lastClearedCell + 2 == 100 ? game.challenges.Mayhem.getBossMult() : 1;
	number *= game.global.challengeActive == 'Storm' && !game.global.mapsActive ? game.challenges.Storm.getAttackMult() : 1;
	number *= game.global.challengeActive == 'Pandemonium' && !game.global.mapsActive && game.global.lastClearedCell + 2 == 100 ? game.challenges.Pandemonium.getBossMult() : 1;
	number *= game.global.challengeActive == 'Pandemonium' && !(!game.global.mapsActive && game.global.lastClearedCell + 2 == 100) ? game.challenges.Pandemonium.getPandMult() : 1;
	number *= game.global.challengeActive == 'Glass' ? game.challenges.Glass.attackMult() : 1;
	if (game.global.challengeActive == "Daily") {
		number *= typeof game.global.dailyChallenge.badStrength !== 'undefined' ? dailyModifiers.badStrength.getMult(game.global.dailyChallenge.badStrength.strength) : 1;
		number *= typeof game.global.dailyChallenge.badMapStrength !== 'undefined' && (game.global.mapsActive || forceMaps) ? dailyModifiers.badMapStrength.getMult(game.global.dailyChallenge.badMapStrength.strength) : 1;
		number *= typeof game.global.dailyChallenge.bloodthirst !== 'undefined' ? dailyModifiers.bloodthirst.getMult(game.global.dailyChallenge.bloodthirst.strength, game.global.dailyChallenge.bloodthirst.stacks) : 1;
		number *= typeof game.global.dailyChallenge.empower !== 'undefined' && !game.global.mapsActive && !forceMaps ? dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks) : 1;
	}
	if (game.global.stringVersion >= '5.8.0' && game.global.world > 200 && game.global.universe === 2 && typeof (game.global.gridArray[game.global.lastClearedCell + 1].u2Mutation) !== 'undefined') {
		if (game.global.world > 200 && game.global.universe === 2 && !game.global.mapsActive) {
			if (game.global.gridArray[game.global.lastClearedCell + 1].u2Mutation.length > 0) {
				var cell = game.global.gridArray[game.global.lastClearedCell + 1]
				/* if (cell.u2Mutation.indexOf('CMP') == -1) {
					if (cell.u2Mutation.indexOf('NVA') != -1) number *= 0.01;
					else if (cell.u2Mutation.indexOf('NVX') != -1) number *= 10;
				} */
				if (cell.u2Mutation.indexOf('RGE') != -1 || (cell.cc && cell.cc[3] > 0)) number *= u2Mutations.types.Rage.enemyAttackMult();
			}
			number *= game.global.novaMutStacks > 0 ? u2Mutations.types.Nova.enemyAttackMult() : 1;
		}
	}
	return number;
}

function RcalcEnemyBaseHealth(type, zone, cell, name, query) {
	//Pre-Init
	if (!type) type = (!game.global.mapsActive) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	if (!zone) zone = (type == "world" || !game.global.mapsActive) ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = (type == "world" || !game.global.mapsActive) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : "Turtlimp";

	//Init
	var base = (game.global.universe == 2) ? 10e7 : 130;
	var health = base * Math.sqrt(zone) * Math.pow(3.265, zone / 2) - 110;

	if (!query && game.global.stringVersion >= '5.8.0' && game.global.world > 200 && game.global.universe === 2 && type === 'world' && typeof (game.global.gridArray[cell - 1].u2Mutation) !== 'undefined') {
		if (game.global.world > 200 && game.global.universe === 2 && type === 'world') {
			if (game.global.gridArray[cell - 1].u2Mutation.length > 0 && (game.global.gridArray[cell].u2Mutation.indexOf('CSX') != -1 || game.global.gridArray[cell].u2Mutation.indexOf('CSP') != -1)) {
				cell = cell - 1
				var grid = game.global.gridArray
				var go = false;
				var row = 0;
				var currRow = Number(String(cell)[0]) * 10;
				if (!go && game.global.gridArray[cell].u2Mutation.indexOf('CSX') != -1) {
					for (i = 5; 9 >= i; i++) {
						if (grid[i * 10].u2Mutation.indexOf('CSP') != -1) {
							row = (i * 10);
							go = true;
						}
					}
					cell += (row - currRow);
				}
				if (!go && game.global.gridArray[cell].u2Mutation.indexOf('CSP') != -1) {
					for (i = 0; 5 >= i; i++) {
						if (grid[i * 10].u2Mutation.indexOf('CSX') != -1) {
							row = (i * 10);
							go = true;
						}
					}
					cell -= (currRow - row);
				}
			}
		}
	}
	//First Two Zones
	if (zone == 1 || zone == 2 && cell < 10) {
		health *= 0.6;
		health = (health * 0.25) + ((health * 0.72) * (cell / 100));
	}

	//Before Breaking the Planet
	else if (zone < 60) {
		health = (health * 0.4) + ((health * 0.4) * (cell / 110));
		health *= 0.75;
	}

	//After Breaking the Planet
	else {
		health = (health * 0.5) + ((health * 0.8) * (cell / 100));
		health *= Math.pow(1.1, zone - 59);
	}

	//Maps
	if (zone > 5 && type != "world") health *= 1.1;

	//U2 Settings
	if (game.global.universe == 2) {
		var part1 = (zone > 60) ? 60 : zone;
		var part2 = (zone - 60);
		if (part2 < 0) part2 = 0;
		health *= Math.pow(1.4, part1);
		health *= Math.pow(1.32, part2);
	}
	//Specific Imp
	if (name) health *= game.badGuys[name].health;

	return Math.floor(health);
}

function RcalcEnemyHealth(world) {
	//Initialising variables
	world = !world ? game.global.world : world;
	var health = RcalcEnemyBaseHealth("world", world, 67, 'Gorillimp');

	//Challenges
	health *= game.global.challengeActive == 'Unbalance' ? 2 : 1;
	health *= game.global.challengeActive == 'Quest' ? game.challenges.Quest.getHealthMult() : 1;
	health *= game.global.challengeActive == 'Revenge' && game.global.world % 2 == 0 ? 10 : 1;
	health *= game.global.challengeActive == 'Mayhem' ? game.challenges.Mayhem.getEnemyMult() : 1;
	health *= game.global.challengeActive == 'Mayhem' ? game.challenges.Mayhem.getBossMult() : 1;
	health *= game.global.challengeActive == 'Storm' && !game.global.mapsActive ? game.challenges.Storm.getHealthMult() : 1;
	//health *= game.global.challengeActive == 'Berserk' ? 1.5 : 1;
	health *= game.global.challengeActive == 'Exterminate' ? game.challenges.Exterminate.getSwarmMult() : 1;
	health *= game.global.challengeActive == 'Nurture' ? 2 : 1;
	health *= game.global.challengeActive == 'Nurture' && game.buildings.Laboratory.owned > 0 ? game.buildings.Laboratory.getEnemyMult() : 1;
	health *= game.global.challengeActive == 'Pandemonium' ? game.challenges.Pandemonium.getBossMult() : 1;
	health *= game.global.challengeActive == 'Alchemy' ? ((alchObj.getEnemyStats(false, false)) + 1) : 1;
	health *= game.global.challengeActive == 'Hypothermia' ? game.challenges.Hypothermia.getEnemyMult() : 1;
	health *= game.global.challengeActive == 'Glass' ? game.challenges.Glass.healthMult() : 1;

	//Dailies
	if (game.global.challengeActive == 'Daily') {
		health *= typeof game.global.dailyChallenge.badHealth !== 'undefined' ? dailyModifiers.badHealth.getMult(game.global.dailyChallenge.badHealth.strength, game.global.dailyChallenge.badHealth.stacks) : 1;
		health *= typeof game.global.dailyChallenge.badMapHealth !== 'undefined' && game.global.mapsActive ? dailyModifiers.badMapHealth.getMult(game.global.dailyChallenge.badMapHealth.strength, game.global.dailyChallenge.badMapHealth.stacks) : 1;
		health *= typeof game.global.dailyChallenge.empower !== 'undefined' && !game.global.mapsActive ? dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks) : 1;
	}

	return health;
}

function RcalcEnemyHealthMod(world, cell, name, type, query) {
	//Initialising variables
	var type = !type ? 'world' : type;
	var world = !world ? game.global.world : world;
	var health = RcalcEnemyBaseHealth(type, world, cell, name, query);

	var mapGrid = type === 'world' ? 'gridArray' : 'mapGridArray';
	if (!query && game.global.stringVersion >= '5.8.0' && game.global.world > 200 && game.global.universe === 2 && type === 'world' && typeof (game.global.gridArray[game.global.lastClearedCell + 1].u2Mutation) !== 'undefined') {
		if (game.global[mapGrid][cell].u2Mutation) {
			health = u2Mutations.getHealth(game.global[mapGrid][cell - 1])
		}
	}
	//Fix this later to add in queryable health calcs
	/* if (query && game.global.stringVersion >= '5.8.0' && game.global.world > 200 && game.global.universe === 2 && type === 'world' && typeof (game.global.gridArray[game.global.lastClearedCell + 1].u2Mutation) !== 'undefined') {
		if (game.global[mapGrid][cell].u2Mutation) {
			health = u2Mutations.getHealth(game.global[mapGrid][cell - 1])
		}
	} */

	//Challenges
	//This is bugged! Value for Unbalance bonus should be swapped, for some reason it's 
	health *= game.global.challengeActive == 'Unbalance' && game.global.mapsActive ? 2 : game.global.challengeActive == 'Unbalance' ? 3 : 1;
	health *= game.global.challengeActive == 'Quest' ? game.challenges.Quest.getHealthMult() : 1;
	health *= game.global.challengeActive == 'Revenge' && game.global.world % 2 == 0 ? 10 : 1;
	health *= game.global.challengeActive == 'Mayhem' ? game.challenges.Mayhem.getEnemyMult() : 1;
	health *= game.global.challengeActive == 'Mayhem' ? game.challenges.Mayhem.getBossMult() : 1;
	health *= game.global.challengeActive == 'Storm' && !game.global.mapsActive ? game.challenges.Storm.getHealthMult() : 1;
	//health *= game.global.challengeActive == 'Berserk' ? 1.5 : 1;
	health *= game.global.challengeActive == 'Exterminate' ? game.challenges.Exterminate.getSwarmMult() : 1;
	health *= game.global.challengeActive == 'Nurture' ? 2 : 1;
	health *= game.global.challengeActive == 'Nurture' && game.buildings.Laboratory.owned > 0 ? game.buildings.Laboratory.getEnemyMult() : 1;
	health *= game.global.challengeActive == 'Pandemonium' ? game.challenges.Pandemonium.getBossMult() : 1;
	health *= game.global.challengeActive == 'Alchemy' ? ((alchObj.getEnemyStats(false, false)) + 1) : 1;
	health *= game.global.challengeActive == 'Hypothermia' ? game.challenges.Hypothermia.getEnemyMult() : 1;
	health *= game.global.challengeActive == 'Glass' ? game.challenges.Glass.healthMult() : 1;

	//Dailies
	if (game.global.challengeActive == 'Daily') {
		health *= typeof game.global.dailyChallenge.badHealth !== 'undefined' ? dailyModifiers.badHealth.getMult(game.global.dailyChallenge.badHealth.strength, game.global.dailyChallenge.badHealth.stacks) : 1;
		health *= typeof game.global.dailyChallenge.badMapHealthHealth !== 'undefined' && game.global.mapsActive ? dailyModifiers.badMapHealth.getMult(game.global.dailyChallenge.badMapHealth.strength, game.global.dailyChallenge.badMapHealth.stacks) : 1;
		health *= typeof game.global.dailyChallenge.empower !== 'undefined' && !game.global.mapsActive ? dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks) : 1;
	}

	if (!query && type !== 'world' && game.global.mapsActive) health *= getCurrentMapObject().difficulty;
	return health;
}

function RcalcHDratio() {
	var ratio = 0;
	if (game.global.gridArray.length > 0) {
		if (getPageSetting('rManageEquality') == 2) {
			var zone = game.global.world;
			var enemyName = zone >= 59 ? 'Improbability' : 'Blimp'
			var ourDamage = RcalcOurDmg('avg', equalityQuery(true, true, 'Snimp', game.global.world, 99, 'world', 1), false, true, false) * gammaBurstPct;
			var enemyHealth = RcalcEnemyHealthMod(game.global.world, 99, 'Turtlimp', 'world', true);
			ratio = enemyHealth / ourDamage;
		}
		else {
			var ourBaseDamage = RcalcOurDmg("avg", false, false, true, false);
			ratio = RcalcEnemyHealth(game.global.world) / ourBaseDamage;
		}
	}
	return ratio;
}

function getTotalHealthMod() {
	var healthMulti = 1;
	// Smithies
	healthMulti *= game.buildings.Smithy.getMult();
	// Antenna Array
	healthMulti *= (game.buildings.Antenna.owned >= 10 ? game.jobs.Meteorologist.getExtraMult() : 1);
	// Perks
	healthMulti *= 1 + (game.portal.Toughness.radLevel * game.portal.Toughness.modifier);
	healthMulti *= Math.pow(1 + game.portal.Resilience.modifier, game.portal.Resilience.radLevel);
	healthMulti *= game.portal.Observation.getMult();
	// Scruffy's +50% health bonus
	healthMulti *= (Fluffy.isRewardActive("healthy") ? 1.5 : 1);
	// Mayhem
	healthMulti *= game.challenges.Mayhem.getTrimpMult();
	// Pandemonium
	healthMulti *= game.challenges.Pandemonium.getTrimpMult();
	//AutoBattle
	healthMulti *= autoBattle.bonuses.Stats.getMult();
	// Heirloom Health bonus
	healthMulti *= 1 + calcHeirloomBonus('Shield', 'trimpHealth', 1, true) / 100;
	// Championism
	healthMulti *= game.portal.Championism.getMult();
	// Golden Upgrades
	healthMulti *= 1 + game.goldenUpgrades.Battle.currentBonus;
	// Cinf
	healthMulti *= 1 + game.global.totalSquaredReward / 100;
	// Challenge Multis
	healthMulti *= game.global.challengeActive == 'Revenge' ? game.challenges.Revenge.getMult() : 1;
	healthMulti *= game.global.challengeActive == 'Wither' ? game.challenges.Wither.getTrimpHealthMult() : 1;
	healthMulti *= game.global.challengeActive == 'Insanity' ? game.challenges.Insanity.getHealthMult() : 1;
	healthMulti *= game.global.challengeActive == 'Berserk' ? (game.challenges.Berserk.frenzyStacks > 0) ? 0.5 : game.challenges.Berserk.getHealthMult(true) : 1;
	healthMulti *= game.challenges.Nurture.boostsActive() ? game.challenges.Nurture.getStatBoost() : 1;
	healthMulti *= game.global.challengeActive == 'Alchemy' ? alchObj.getPotionEffect("Potion of Strength") : 1;
	// Daily mod
	healthMulti *= typeof game.global.dailyChallenge.pressure !== 'undefined' ? dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks) : 1;
	// Prismatic
	healthMulti *= 1 + getEnergyShieldMult();
	// Shield layer
	healthMulti *= (Fluffy.isRewardActive('shieldlayer') ? 2 : 1);
	return healthMulti;
}

function stormdynamicHD() {
	var stormzone = 0;
	var stormHD = 0;
	var stormmult = 0;
	var stormHDzone = 0;
	var stormHDmult = 1;
	if (getPageSetting('Rstormon') == true && game.global.world > 5 && (game.global.challengeActive == "Storm" && getPageSetting('Rstormzone') > 0 && getPageSetting('RstormHD') > 0 && getPageSetting('Rstormmult') > 0)) {
		stormzone = getPageSetting('Rstormzone');
		stormHD = getPageSetting('RstormHD');
		stormmult = getPageSetting('Rstormmult');
		stormHDzone = (game.global.world - stormzone);
		stormHDmult = (stormHDzone == 0) ? stormHD : Math.pow(stormmult, stormHDzone) * stormHD;
	}
	return stormHDmult;
}
