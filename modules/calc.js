var critCC = 1;
var critDD = 1;
var trimpAA = 1;

//Helium

class HDStats {
	constructor(vmStatus) {
		this.hdRatio = undefined;
		this.hitsSurvived = undefined;
		this.ourDamage = undefined;
		this.targetZoneType = undefined;

		const z = game.global.world;

		this.targetZoneType = (vmStatus.prepareForVoids ? "void" : "world");
		this.hdRatio = calcHDRatio(z, this.targetZoneType);
		this.hitsSurvived = calcHitsSurvived(z, this.targetZoneType);
		this.ourDamage = calcOurDmg();
	}
}

function debugCalc() {
	//Pre-Init
	var type = (!game.global.mapsActive) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	var zone = (type == "world" || !game.global.mapsActive) ? game.global.world : getCurrentMapObject().level;
	var cell = (type == "world" || !game.global.mapsActive) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
	var name = getCurrentEnemy() ? getCurrentEnemy().name : "Chimp";

	//Init
	var displayedMin = calcOurDmg("min", false, true, type != "world", "never") * (game.global.titimpLeft > 0 ? 2 : 1);
	var displayedMax = calcOurDmg("max", false, true, type != "world", "never") * (game.global.titimpLeft > 0 ? 2 : 1);

	//Trimp Stats
	debug("Our Stats");
	debug("Our attack: " + displayedMin.toExponential(2) + "-" + displayedMax.toExponential(2));
	debug("Our crit: " + 100 * getPlayerCritChance() + "% for " + getPlayerCritDamageMult().toFixed(1) + "x Damage. Average of " + getCritMulti(false, "maybe").toFixed(2) + "x");
	debug("Our block: " + calcOurBlock(true, true).toExponential(2));
	debug("Our Health: " + calcOurHealth(true, false, true).toExponential(2));

	//Enemy stats
	debug("Enemy Stats");
	debug("Enemy Attack: " + calcEnemyAttack(type, zone, cell, name, true).toExponential(2) + "-" + calcEnemyAttack(type, zone, cell, name).toExponential(2));
	debug("Enemy Health: " + calcEnemyHealth(type, zone, cell, name).toExponential(2));
	debug("Specific Enemy Attack: " + calcSpecificEnemyAttack().toExponential(2));
	debug("Specific Enemy Health: " + calcSpecificEnemyHealth().toExponential(2));
}

function calcOurBlock(stance, realBlock) {
	var block = 0;

	//Ignores block gyms/shield that have been brought, but not yet deployed
	if (realBlock) {
		block = game.global.soldierCurrentBlock;
		if (stance || game.global.formation == 0) return block;
		if (game.global.formation == 3) return block / 4;
		return block * 2;
	}

	//Gyms
	var gym = game.buildings.Gym;
	if (gym.owned > 0) block += gym.owned * gym.increase.by;

	//Shield Block
	var shield = game.equipment.Shield;
	if (shield.blockNow && shield.level > 0) block += shield.level * shield.blockCalculated;

	//Trainers
	var trainer = game.jobs.Trainer;
	if (trainer.owned > 0) {
		var trainerStrength = trainer.owned * (trainer.modifier / 100);
		block *= 1 + calcHeirloomBonus("Shield", "trainerEfficiency", trainerStrength);
	}

	//Coordination
	block *= game.resources.trimps.maxSoldiers;

	//Stances
	if (stance && game.global.formation != 0) block *= game.global.formation == 3 ? 4 : 0.5;

	//Heirloom
	var heirloomBonus = calcHeirloomBonus("Shield", "trimpBlock", 0, true);
	if (heirloomBonus > 0) block *= ((heirloomBonus / 100) + 1);

	return block;
}

function calcEquipment(type = "attack") {
	//Init
	var bonus = 0;
	var equipmentList;

	//Equipment names
	if (type == "attack") equipmentList = ["Dagger", "Mace", "Polearm", "Battleaxe", "Greatsword", "Arbalest"];
	else equipmentList = ["Shield", "Boots", "Helmet", "Pants", "Shoulderguards", "Breastplate", "Gambeson"];

	//For each equipment
	for (var i = 0; i < equipmentList.length; i++) {
		//Check if it's unlocked
		var equip = game.equipment[equipmentList[i]];
		if (equip.locked !== 0) continue;

		//Get the bonus
		bonus += equip.level * (type == "attack" ? equip.attackCalculated : equip.healthCalculated);
	}

	return bonus;
}

function getTrimpAttack(realDamage) {
	//This is actual damage of the army in combat ATM, without considering items bought, but not yet in use
	if (realDamage) return game.global.soldierCurrentAttack;

	//Damage from equipments and Coordinations
	var dmg = (6 + calcEquipment("attack")) * game.resources.trimps.maxSoldiers;

	//Magma
	if (mutations.Magma.active()) dmg *= mutations.Magma.getTrimpDecay();

	//Power I
	if (game.portal.Power.level > 0) dmg += (dmg * game.portal.Power.level * game.portal.Power.modifier);

	//Power II
	if (game.portal.Power_II.level > 0) dmg *= (1 + (game.portal.Power_II.modifier * game.portal.Power_II.level));

	//Formation
	if (game.global.formation != 0) dmg *= (game.global.formation == 2) ? 4 : 0.5;

	return dmg;
}

function getTrimpHealth(realHealth) {
	//This is the actual health of the army ATM, without considering items bought, but not yet in use
	if (realHealth) return game.global.soldierHealthMax;

	//Health from equipments and coordination
	var health = (50 + calcEquipment("health")) * game.resources.trimps.maxSoldiers;

	//Toughness
	if (game.portal.Toughness.level > 0)
		health *= 1 + game.portal.Toughness.level * game.portal.Toughness.modifier;

	//Toughness II
	if (game.portal.Toughness_II.level > 0)
		health *= 1 + game.portal.Toughness_II.level * game.portal.Toughness_II.modifier;

	//Resilience
	if (game.portal.Resilience.level > 0)
		health *= Math.pow(game.portal.Resilience.modifier + 1, game.portal.Resilience.level);

	//Geneticists
	var geneticist = game.jobs.Geneticist;
	if (geneticist.owned > 0) health *= Math.pow(1.01, game.global.lastLowGen);

	//Formation
	if (game.global.formation !== 0) health *= (game.global.formation == 1) ? 4 : 0.5;

	//Heirloom
	var heirloomBonus = calcHeirloomBonus("Shield", "trimpHealth", 0, true);
	if (heirloomBonus > 0) health *= 1 + heirloomBonus / 100;

	//Golden Battle
	if (game.goldenUpgrades.Battle.currentBonus > 0) health *= 1 + game.goldenUpgrades.Battle.currentBonus;

	//C2
	if (game.global.totalSquaredReward > 0) health *= 1 + game.global.totalSquaredReward / 100;

	return health;
}

function calcOurHealth(stance, fullGeneticist, realHealth) {
	var health = getTrimpHealth(realHealth);

	//Formation
	if (!stance && game.global.formation != 0) health /= (game.global.formation == 1) ? 4 : 0.5;

	//Geneticists
	var geneticist = game.jobs.Geneticist;
	if (fullGeneticist && geneticist.owned > 0) health *= Math.pow(1.01, geneticist.owned - game.global.lastLowGen);

	//Challenges
	if (game.global.challengeActive == "Life" && !realHealth) health *= game.challenges.Life.getHealthMult();
	else if (game.global.challengeActive == "Balance" && !realHealth) health *= game.challenges.Balance.getHealthMult();
	else if (typeof game.global.dailyChallenge.pressure !== 'undefined' && !realHealth)
		health *= dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks);

	//Magma
	if (mutations.Magma.active() && !realHealth) health *= mutations.Magma.getTrimpDecay();

	//Amalgamator
	if (game.jobs.Amalgamator.owned > 0 && !realHealth) health *= game.jobs.Amalgamator.getHealthMult();

	//Void Power
	if (game.talents.voidPower.purchased && game.global.voidBuff && !realHealth) {
		var amt = (game.talents.voidPower2.purchased) ? ((game.talents.voidPower3.purchased) ? 65 : 35) : 15;
		health *= (1 + (amt / 100));
	}

	//Masteries
	if (game.talents.mapHealth.purchased && game.global.mapsActive && !realHealth) health *= 2;

	return health;
}

function calcHitsSurvived(targetZone, type) {
	//Init
	let damageMult = 1;
	let voidDamage = 0;
	const formationMod = (game.upgrades.Dominance.done) ? 2 : 1;

	//Our Health and Block
	let health = calcOurHealth(false, true) / formationMod;
	let block = calcOurBlock(false) / formationMod;

	//Calc for maps
	if (type === "map") {
		return health / Math.max(calcEnemyAttack("map", targetZone) - block, 0);
	}

	//Lead farms one zone ahead
	if (game.global.challengeActive === "Lead" && type === "world" && game.global.world % 2 === 1) {
		targetZone++;
	}

	//Explosive Daily and Crushed
	if (health > block && getPageSetting('IgnoreCrits') !== 2) {
		const dailyExplosive = game.global.challengeActive === "Daily" && typeof game.global.dailyChallenge.explosive !== "undefined";
		const crushed = game.global.challengeActive === "Crushed";
		if (dailyExplosive) {
			damageMult = dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength);
		} else if (crushed) {
			damageMult = 3;
		}
	}

	//Enemy Damage
	const worldDamage = calcEnemyAttack("world", targetZone);

	//Enemy Damage on Void Maps
	if (type === "void") {
		//Void Damage may actually be lower than world damage, so it needs to be calculated here to be compared later
		voidDamage = damageMult * calcEnemyAttack("void", targetZone) - block;
		//Void Power compensation (it affects our health, so apply multipliers after block)
		if (!game.global.mapsActive || getCurrentMapObject().location !== "Void") {
			if (game.talents.voidPower3.purchased) voidDamage /= 1.15;
			else if (game.talents.voidPower2.purchased) voidDamage /= 1.35;
			else if (game.talents.voidPower.purchased) voidDamage /= 1.65;
		}
		//Map health compensation
		if (game.talents.mapHealth.purchased && type === "world") {
			voidDamage /= 2;
		}
	}

	//Pierce & Voids
	let pierce = (game.global.brokenPlanet) ? getPierceAmt() : 0;

	//Cancel the influence of the Barrier Formation
	if (game.global.formation === 3) {
		pierce *= 2;
	}

	//Cancel Map Health influence, even for void maps (they are set above)
	if (game.talents.mapHealth.purchased && game.global.mapsActive && type !== "map") {
		health /= 2;
	}

	//The Resulting Ratio
	const finalDmg = Math.max(damageMult * worldDamage - block, voidDamage, worldDamage * pierce, 0);
	return health / finalDmg;
}

function highDamageShield() {
	if (game.global.challengeActive != "Daily" && game.global.ShieldEquipped.name == getPageSetting("highdmg")) {
		critCC = getPlayerCritChance();
		critDD = getPlayerCritDamageMult();
		trimpAA = (calcHeirloomBonus("Shield", "trimpAttack", 1, true) / 100);
	}
	if (game.global.challengeActive == "Daily" && game.global.ShieldEquipped.name == getPageSetting("dhighdmg")) {
		critCC = getPlayerCritChance();
		critDD = getPlayerCritDamageMult();
		trimpAA = (calcHeirloomBonus("Shield", "trimpAttack", 1, true) / 100);
	}
}

function addPoison(realDamage, zone) {
	//Init
	if (!zone) zone = game.global.world;

	//Poison is inactive
	if (getEmpowerment(zone) != "Poison") return 0;

	//Real amount to be added in the next attack
	if (realDamage) return game.empowerments.Poison.getDamage();

	//Dynamically determines how much we are benefiting from poison based on Current Amount * Transfer Rate
	if (getPageSetting("addpoison")) return game.empowerments["Poison"].getDamage() * getRetainModifier("Poison");

	return 0;
}

//TODO - Very Important!
function newGetCritMulti(high) {

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

function RgetCritMulti(floorCrit, mult, ceilCrit) {
	var mult = (!mult) ? false : true;

	var critChance = getPlayerCritChance();
	var critD = getPlayerCritDamageMult();

	if (floorCrit) critChance = Math.floor(getPlayerCritChance());
	if (ceilCrit) critChance = Math.ceil(getPlayerCritChance());
	var lowTierMulti = getMegaCritDamageMult(Math.floor(critChance));
	var highTierMulti = getMegaCritDamageMult(Math.ceil(critChance));
	var highTierChance = critChance - Math.floor(critChance)

	if (mult) return ((critChance - 2) * Math.pow(getMegaCritDamageMult(2), 2) * critD + (3 - critChance) * getMegaCritDamageMult(2) * critD);
	else
		return ((1 - highTierChance) * lowTierMulti + highTierChance * highTierMulti) * critD
}

function getCritMulti(high, crit) {
	var critChance = getPlayerCritChance();
	var critD = getPlayerCritDamageMult();
	var critDHModifier;

	if (crit == "never") critChance = Math.floor(critChance);
	else if (crit == "force") critChance = Math.ceil(critChance);
	var dmgMulti = getMegaCritDamageMult(Math.floor(critChance));

	if (critChance < 0) critDHModifier = (1 + critChance - critChance / 5);
	else if (critChance < 1) critDHModifier = (1 - critChance + critChance * critD);
	else if (critChance < 2) critDHModifier = ((critChance - 1) * getMegaCritDamageMult(2) * critD + (2 - critChance) * critD);
	else if (critChance > 3) critDHModifier = dmgMulti * critD
	else critDHModifier = ((critChance - 2) * Math.pow(getMegaCritDamageMult(critChance), 2) * critD + (3 - critChance) * getMegaCritDamageMult(critChance) * critD);

	return critDHModifier;
}

function getAnticipationBonus(stacks) {
	//Pre-Init
	if (stacks == undefined) stacks = game.global.antiStacks;

	//Init
	var perkMult = game.portal.Anticipation.level * game.portal.Anticipation.modifier;
	var stacks45 = getPageSetting('45stacks') != false && getPageSetting('45stacks') != "false";

	//Regular anticipation
	if (!stacks45) return 1 + stacks * perkMult;

	//45 stacks (??)
	return 1 + 45 * perkMult;
}

function calcOurDmg(minMaxAvg = "avg", specificStance, realDamage, ignoreMapBonus, critMode) {
	//Init
	var number = getTrimpAttack(realDamage);
	var minFluct = 0.8;
	var maxFluct = 1.2;

	//Range
	if (game.portal.Range.level > 0) minFluct += 0.02 * game.portal.Range.level;

	//Achievements
	if (game.global.achievementBonus > 0) number *= 1 + game.global.achievementBonus / 100;

	//Anticipation
	if (game.global.antiStacks > 0) number *= getAnticipationBonus();

	//Formation
	if (specificStance && game.global.formation != 0) number /= (game.global.formation == 2) ? 4 : 0.5;
	if (specificStance && specificStance != "X") number *= (specificStance == "D") ? 4 : 0.5;

	//Map Bonus
	if (game.global.mapBonus > 0 && !ignoreMapBonus) {
		var mapBonus = game.global.mapBonus;
		if (game.talents.mapBattery.purchased && mapBonus == 10) mapBonus *= 2;
		number *= 1 + 0.2 * mapBonus;
	}

	//Robo Trimp
	if (game.global.roboTrimpLevel > 0) number *= 1 + (0.2 * game.global.roboTrimpLevel);

	// Mayhem Completions
	number *= game.challenges.Mayhem.getTrimpMult();
	// Pandemonium Completions
	number *= game.challenges.Pandemonium.getTrimpMult();
	//Heirlooms
	number = calcHeirloomBonus("Shield", "trimpAttack", number);
	//Herbalist
	if (game.talents.herbalist.purchased) number *= game.talents.herbalist.getBonus();
	//Magmamancery
	if (game.talents.magmamancer.purchased) number *= game.jobs.Magmamancer.getBonusPercent();
	//Still Rowing 2
	if (game.talents.stillRowing2.purchased) number *= ((game.global.spireRows * 0.06) + 1);
	//Strength in Health
	if (game.talents.healthStrength.purchased && mutations.Healthy.active()) number *= ((0.15 * mutations.Healthy.cellCount()) + 1);
	//Cinf
	if (game.global.totalSquaredReward > 0) number *= ((game.global.totalSquaredReward / 100) + 1);

	//Fluffy
	if (Fluffy.isActive()) {
		number *= Fluffy.getDamageModifier();
		if (game.talents.kerfluffle.purchased) number *= game.talents.kerfluffle.mult();
	}

	//Challenges
	if (game.global.challengeActive == "Life") number *= game.challenges.Life.getHealthMult();
	if (game.global.challengeActive == "Lead" && (game.global.world % 2) == 1) number *= 1.5;
	if (game.challenges.Electricity.stacks > 0) {
		var stacks = game.challenges.Electricity.stacks;
		if (!realDamage && minMaxAvg.toLowerCase() == "min") stacks = 0;
		if (!realDamage && minMaxAvg.toLowerCase() == "avg") stacks /= 2;
		number *= 1 - (stacks * 0.1);
	}

	//Decay
	if (game.global.challengeActive == "Decay") {
		number *= 5;
		number *= Math.pow(0.995, game.challenges.Decay.stacks);
	}

	//Discipline
	if (game.global.challengeActive == "Discipline") {
		minFluct = 0.005;
		maxFluct = 1.995;
	}

	//Daily
	if (game.global.challengeActive == "Daily") {
		//Range Dailies
		if (typeof game.global.dailyChallenge.minDamage !== "undefined") minFluct = dailyModifiers.minDamage.getMult(game.global.dailyChallenge.minDamage.strength);
		if (typeof game.global.dailyChallenge.maxDamage !== "undefined") maxFluct = dailyModifiers.maxDamage.getMult(game.global.dailyChallenge.maxDamage.strength);

		//Even-Odd Dailies
		if (typeof game.global.dailyChallenge.oddTrimpNerf !== "undefined" && ((game.global.world % 2) == 1))
			number *= dailyModifiers.oddTrimpNerf.getMult(game.global.dailyChallenge.oddTrimpNerf.strength);
		if (typeof game.global.dailyChallenge.evenTrimpBuff !== "undefined" && ((game.global.world % 2) == 0))
			number *= dailyModifiers.evenTrimpBuff.getMult(game.global.dailyChallenge.evenTrimpBuff.strength);

		//Rampage Dailies
		if (typeof game.global.dailyChallenge.rampage !== "undefined")
			number *= dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, game.global.dailyChallenge.rampage.stacks);

		//Weakness
		if (typeof game.global.dailyChallenge.weakness !== "undefined")
			number *= dailyModifiers.weakness.getMult(game.global.dailyChallenge.weakness.strength, game.global.dailyChallenge.weakness.stacks);
	}

	//Battle Goldens
	if (game.goldenUpgrades.Battle.currentBonus > 0) number *= game.goldenUpgrades.Battle.currentBonus + 1;

	//Masteries - Herbalist, Legs for Days, Magmamancer, Still Rowing II, Void Mastery, Health Strength, Sugar Rush
	if (game.global.challengeActive == "Daily" && game.talents.daily.purchased) number *= 1.5;
	if (game.global.sugarRush > 0) number *= sugarRush.getAttackStrength();

	//Void Power
	if (game.talents.voidPower.purchased && game.global.voidBuff) {
		var vpAmt = (game.talents.voidPower2.purchased) ? ((game.talents.voidPower3.purchased) ? 65 : 35) : 15;
		number *= ((vpAmt / 100) + 1);
		if (game.talents.voidMastery.purchased) number *= 5;
	}

	//Scryhard
	var fightingCorrupted = getCurrentEnemy() && getCurrentEnemy().corrupted || !realDamage && (mutations.Healthy.active() || mutations.Corruption.active());
	if (game.talents.scry.purchased && fightingCorrupted && !specificStance && game.global.formation == 4)
		number *= 2;

	//Amalgamator
	if (game.jobs.Amalgamator.owned > 0) {
		number *= game.jobs.Amalgamator.getDamageMult();
	}

	//Spire Strength Trap
	if (playerSpireTraps.Strength.owned) {
		var strBonus = playerSpireTraps.Strength.getWorldBonus();
		number *= (1 + (strBonus / 100));
	}

	//Fluffy + Sharp Trimps + Uber Poison + Challenge²
	if (Fluffy.isRewardActive('voidSiphon') && game.stats.totalVoidMaps.value) number *= (1 + (game.stats.totalVoidMaps.value * 0.05));
	if (game.singleRunBonuses.sharpTrimps.owned) number *= 1.5;
	if (game.global.uberNature == "Poison") number *= 3;

	//Empowerments - Ice (Experimental)
	if (getEmpowerment() == "Ice") {
		//Uses the actual number in some places like Stances
		if (!getPageSetting('fullice') || realDamage) number *= 1 + game.empowerments.Ice.getDamageModifier();

		//Otherwise, use the number we would have after a transfer
		else {
			var afterTransfer = 1 + Math.ceil(game.empowerments["Ice"].currentDebuffPower * getRetainModifier("Ice"));
			var mod = 1 - Math.pow(game.empowerments.Ice.getModifier(), afterTransfer);
			if (Fluffy.isRewardActive('naturesWrath')) mod *= 2;
			number *= 1 + mod;
		}
	}

	//Init Damage Variation (Crit)
	var min = number * getCritMulti(false, (critMode) ? critMode : "never");
	var avg = number * getCritMulti(false, (critMode) ? critMode : "maybe");
	var max = number * getCritMulti(false, (critMode) ? critMode : "force");

	//Damage Fluctuation
	min *= minFluct;
	max *= maxFluct;
	avg *= (maxFluct + minFluct) / 2;

	//Well, finally, huh?
	if (minMaxAvg == "min") return Math.floor(min);
	if (minMaxAvg == "max") return Math.ceil(max);

	return avg;
}

function calcSpire(what, cell, name) {
	//Target Cell
	if (!cell) {
		if (isActiveSpireAT() && getPageSetting('ExitSpireCell') > 0 && getPageSetting('ExitSpireCell') <= 100)
			cell = getPageSetting('ExitSpireCell');
		else if (disActiveSpireAT() && getPageSetting('dExitSpireCell') > 0 && getPageSetting('dExitSpireCell') <= 100)
			cell = getPageSetting('dExitSpireCell');
		else cell = 100;
	}

	//Enemy on the Target Cell
	var enemy = (name) ? name : game.global.gridArray[cell - 1].name;
	var base = (what == "attack") ? calcEnemyBaseAttack("world", game.global.world, cell, enemy) : 2 * calcEnemyBaseHealth("world", game.global.world, cell, enemy);
	var mod = (what == "attack") ? 1.17 : 1.14;

	//Spire Num
	var spireNum = Math.floor((game.global.world - 100) / 100);
	if (spireNum > 1) {
		var modRaiser = 0;
		modRaiser += ((spireNum - 1) / 100);
		if (what == "attack") modRaiser *= 8;
		if (what == "health") modRaiser *= 2;
		mod += modRaiser;
	}

	//Math
	base *= Math.pow(mod, cell);

	//Compensations for Domination
	if (game.global.challengeActive == "Domination" && cell != 100) base /= (what == "attack") ? 25 : 75;

	return base;
}

function badGuyChallengeMult() {
	var number = 1;

	//WARNING! Something is afoot!
	//A few challenges
	if (game.global.challengeActive == "Meditate") number *= 1.5;
	else if (game.global.challengeActive == "Watch") number *= 1.25;
	else if (game.global.challengeActive == "Corrupted") number *= 3;
	else if (game.global.challengeActive == "Domination") number *= 2.5;
	else if (game.global.challengeActive == "Coordinate") number *= getBadCoordLevel();
	else if (game.global.challengeActive == "Scientist" && getScientistLevel() == 5) number *= 10;

	//Obliterated and Eradicated
	else if (game.global.challengeActive == "Obliterated" || game.global.challengeActive == "Eradicated") {
		var oblitMult = (game.global.challengeActive == "Eradicated") ? game.challenges.Eradicated.scaleModifier : 1e12;
		var zoneModifier = Math.floor(game.global.world / game.challenges[game.global.challengeActive].zoneScaleFreq);
		oblitMult *= Math.pow(game.challenges[game.global.challengeActive].zoneScaling, zoneModifier);
		number *= oblitMult
	}

	return number;
}

function badGuyCritMult(enemy, critPower = 2, block, health) {
	//Pre-Init
	if (getPageSetting('IgnoreCrits') == 2) return 1;
	if (!enemy) enemy = getCurrentEnemy();
	if (!enemy || critPower <= 0) return 1;
	if (!block) block = game.global.soldierCurrentBlock;
	if (!health) health = game.global.soldierHealth;

	//Init
	var regular = 1, challenge = 1;

	//Non-challenge crits
	if (enemy.corrupted == 'corruptCrit') regular = 5;
	else if (enemy.corrupted == 'healthyCrit') regular = 7;
	else if (game.global.voidBuff == 'getCrit' && getPageSetting('IgnoreCrits') != 1) regular = 5;

	//Challenge crits
	var crushed = game.global.challengeActive == "Crushed";
	var critDaily = game.global.challengeActive == "Daily" && typeof game.global.dailyChallenge.crits !== 'undefined';

	//Challenge multiplier
	if (critDaily) challenge = dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
	else if (crushed && health > block) challenge = 5;

	//Result -- Yep. Crits may crit! Yey!
	if (critPower == 2) return regular * challenge;
	else return Math.max(regular, challenge);
}

function calcCorruptionScale(zone, base) {
	var startPoint = (game.global.challengeActive == "Corrupted" || game.global.challengeActive == "Eradicated") ? 1 : 150;
	var scales = Math.floor((zone - startPoint) / 6);
	var realValue = base * Math.pow(1.05, scales);
	return parseFloat(prettify(realValue));
}

function calcEnemyBaseAttack(type, zone, cell, name) {
	//Pre-Init
	if (!type) type = (!game.global.mapsActive) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	if (!zone) zone = (type == "world" || !game.global.mapsActive) ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = (type == "world" || !game.global.mapsActive) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : "Snimp";

	//Init
	var attack = 50 * Math.sqrt(zone) * Math.pow(3.27, zone / 2) - 10;

	//Zone 1
	if (zone == 1) {
		attack *= 0.35;
		attack = (0.2 * attack) + (0.75 * attack * (cell / 100));
	}

	//Zone 2
	else if (zone == 2) {
		attack *= 0.5;
		attack = (0.32 * attack) + (0.68 * attack * (cell / 100));
	}

	//Before Breaking the Planet
	else if (zone < 60) {
		attack = (0.375 * attack) + (0.7 * attack * (cell / 100));
		attack *= 0.85;
	}

	//After Breaking the Planet
	else {
		attack = (0.4 * attack) + (0.9 * attack * (cell / 100));
		attack *= Math.pow(1.15, zone - 59);
	}

	//Maps
	if (zone > 5 && type != "world") attack *= 1.1;

	//Specific Imp
	if (name) attack *= game.badGuys[name].attack;

	return Math.floor(attack);
}

function calcEnemyAttackCore(type, zone, cell, name, minOrMax, customAttack) {
	//Pre-Init
	if (!type) type = (!game.global.mapsActive) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	if (!zone) zone = (type == "world" || !game.global.mapsActive) ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = (type == "world" || !game.global.mapsActive) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : "Snimp";

	//Init
	var attack = calcEnemyBaseAttack(type, zone, cell, name);

	//Spire - Overrides the base attack number
	if (type == "world" && game.global.spireActive) attack = calcSpire("attack");

	//Map and Void Corruption
	if (type != "world") {
		//Corruption
		var corruptionScale = calcCorruptionScale(game.global.world, 3);
		if (mutations.Magma.active()) attack *= corruptionScale / (type == "void" ? 1 : 2);
		else if (type == "void" && mutations.Corruption.active()) attack *= corruptionScale / 2;
	}

	//Use custom values instead
	if (customAttack) attack = customAttack;

	//WARNING! Check every challenge!
	//A few challenges
	if (game.global.challengeActive == "Meditate") attack *= 1.5;
	else if (game.global.challengeActive == "Watch") attack *= 1.25;
	else if (game.global.challengeActive == "Corrupted") attack *= 3;
	else if (game.global.challengeActive == "Scientist" && getScientistLevel() == 5) attack *= 10;

	//Coordinate
	if (game.global.challengeActive == "Coordinate") {
		var amt = 1;
		for (var i = 1; i < zone; i++) amt = Math.ceil(amt * 1.25);
		attack *= amt;
	}

	//Dailies
	if (game.global.challengeActive == "Daily") {
		//Bad Strength
		if (typeof game.global.dailyChallenge.badStrength !== "undefined")
			attack *= dailyModifiers.badStrength.getMult(game.global.dailyChallenge.badStrength.strength);

		//Bad Map Strength
		if (typeof game.global.dailyChallenge.badMapStrength !== "undefined" && type != "world")
			attack *= dailyModifiers.badMapStrength.getMult(game.global.dailyChallenge.badMapStrength.strength);

		//Bloodthirsty
		if (typeof game.global.dailyChallenge.bloodthirst !== 'undefined')
			attack *= dailyModifiers.bloodthirst.getMult(game.global.dailyChallenge.bloodthirst.strength, game.global.dailyChallenge.bloodthirst.stacks);

		//Empower
		if (typeof game.global.dailyChallenge.empower !== "undefined")
			attack *= dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks);
	}

	//Obliterated and Eradicated
	else if (game.global.challengeActive == "Obliterated" || game.global.challengeActive == "Eradicated") {
		var oblitMult = (game.global.challengeActive == "Eradicated") ? game.challenges.Eradicated.scaleModifier : 1e12;
		var zoneModifier = Math.floor(game.global.world / game.challenges[game.global.challengeActive].zoneScaleFreq);
		oblitMult *= Math.pow(game.challenges[game.global.challengeActive].zoneScaling, zoneModifier);
		attack *= oblitMult;
	}

	return minOrMax ? 0.8 * attack : 1.2 * attack;
}

function calcEnemyAttack(type, zone, cell = 99, name = "Snimp", minOrMax) {
	//Init
	var attack = calcEnemyAttackCore(type, zone, cell, name, minOrMax);
	var corrupt = zone >= mutations.Corruption.start();
	var healthy = mutations.Healthy.active();

	//Challenges
	if (game.global.challengeActive == "Balance") attack *= (type == "world") ? 1.17 : 2.35;
	else if (game.global.challengeActive == "Life") attack *= 6;
	else if (game.global.challengeActive == "Toxicity") attack *= 5;
	else if (game.global.challengeActive == "Lead") attack *= (zone % 2 == 0) ? 5.08 : (1 + 0.04 * game.challenges.Lead.stacks);
	else if (game.global.challengeActive == "Domination") attack *= 2.5;

	//Dailies
	else if (game.global.challengeActive == "Daily") {
		//Crits
		if (typeof game.global.dailyChallenge.crits !== "undefined")
			attack *= 0.75 + 0.25 * dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
	}

	//Magneto Shriek during Domination
	if (game.global.challengeActive == "Domination" && game.global.usingShriek)
		attack *= game.mapUnlocks.roboTrimp.getShriekValue();

	//Void Map Difficulty (implicit 100% difficulty on regular maps)
	if (type == "void") attack *= (zone >= 60) ? 4.5 : 2.5;

	//Average corrupt impact on World times two - this is to compensate a bit for Corrupted buffs. Improbabilities count as 5.
	if (type == "world" && corrupt && !game.global.spireActive) {
		//Corruption during Domination
		if (game.global.challengeActive == "Domination") attack *= calcCorruptionScale(zone, 3);

		//Calculates the impact of the corruption on the average attack on that map. Improbabilities count as 5.
		else {
			//It uses the average times two for damage because otherwise trimps would be full pop half of the time, but dead in the other half
			var corruptionAmount = 2 * Math.min(52, 7 + ~~((zone - mutations.Corruption.start()) / 3)); //Integer division
			var corruptionWeight = (104 - corruptionAmount) + corruptionAmount * calcCorruptionScale(zone, 3);
			attack *= corruptionWeight / 104;
		}
	}

	//Healthy
	if (type == "world" && healthy && !game.global.spireActive) {
		//Calculates the impact of the Healthy on the average attack on that map.
		var healthyAmount = 2 * Math.min(50, 2 + ~~((zone - 300) / 15)); //Integer division
		var healthyWeight = (100 - healthyAmount) + healthyAmount * calcCorruptionScale(zone, 5) / calcCorruptionScale(zone, 3);
		attack *= healthyWeight / 100;
	}

	//Ice - Experimental
	if (getEmpowerment() == "Ice" && getPageSetting('fullice') == true) {
		var afterTransfer = 1 + Math.ceil(game.empowerments["Ice"].currentDebuffPower * getRetainModifier("Ice"));
		attack *= Math.pow(game.empowerments.Ice.getModifier(), afterTransfer);
	}

	return minOrMax ? Math.floor(attack) : Math.ceil(attack);
}

function calcSpecificEnemyAttack(critPower = 2, customBlock, customHealth) {
	//Init
	var enemy = getCurrentEnemy();
	if (!enemy) return 1;

	//Init
	var attack = calcEnemyAttackCore(undefined, undefined, undefined, undefined, undefined, enemy.attack);
	attack *= badGuyCritMult(enemy, critPower, customBlock, customHealth);

	//Challenges - considers the actual scenario for this enemy
	if (game.global.challengeActive == "Nom" && typeof enemy.nomStacks !== 'undefined') attack *= Math.pow(1.25, enemy.nomStacks)
	if (game.global.challengeActive == "Lead") attack *= 1 + (0.04 * game.challenges.Lead.stacks);

	//Magneto Shriek
	if (game.global.usingShriek) attack *= game.mapUnlocks.roboTrimp.getShriekValue();

	//Ice
	if (getEmpowerment() == "Ice") attack *= game.empowerments.Ice.getCombatModifier();

	return Math.ceil(attack);
}

function calcEnemyBaseHealth(type, zone, cell, name) {
	//Pre-Init
	if (!type) type = (!game.global.mapsActive) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	if (!zone) zone = (type == "world" || !game.global.mapsActive) ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = (type == "world" || !game.global.mapsActive) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : "Turtlimp";

	//Init
	var base = (game.global.universe == 2) ? 10e7 : 130;
	var health = base * Math.sqrt(zone) * Math.pow(3.265, zone / 2) - 110;

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

	//Specific Imp
	if (name) health *= game.badGuys[name].health;

	return Math.floor(health);
}

function calcEnemyHealthCore(type, zone, cell, name, customHealth) {
	//Pre-Init
	if (!type) type = (!game.global.mapsActive) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	if (!zone) zone = (type == "world" || !game.global.mapsActive) ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = (type == "world" || !game.global.mapsActive) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : "Turtlimp";

	//Init
	var health = calcEnemyBaseHealth(type, zone, cell, name);

	//Spire - Overrides the base health number
	if (type == "world" && game.global.spireActive) health = calcSpire("health");

	//Map and Void Corruption
	if (type != "world") {
		//Corruption
		var corruptionScale = calcCorruptionScale(game.global.world, 10);
		if (mutations.Magma.active()) health *= corruptionScale / (type == "void" ? 1 : 2);
		else if (type == "void" && mutations.Corruption.active()) health *= corruptionScale / 2;
	}

	//Use a custom value instead
	if (customHealth) health = customHealth;

	//Challenges
	if (game.global.challengeActive == "Balance") health *= 2;
	if (game.global.challengeActive == "Meditate") health *= 2;
	if (game.global.challengeActive == "Toxicity") health *= 2;
	if (game.global.challengeActive == "Life") health *= 11;

	//Coordinate
	if (game.global.challengeActive == "Coordinate") {
		var amt = 1;
		for (var i = 1; i < zone; i++) amt = Math.ceil(amt * 1.25);
		health *= amt;
	}

	//Dailies
	if (game.global.challengeActive == "Daily") {
		//Empower
		if (typeof game.global.dailyChallenge.empower !== "undefined")
			health *= dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks)

		//Bad Health
		if (typeof game.global.dailyChallenge.badHealth !== "undefined")
			health *= dailyModifiers.badHealth.getMult(game.global.dailyChallenge.badHealth.strength);

		//Bad Map Health
		if (typeof game.global.dailyChallenge.badMapHealth !== "undefined" && type != "world")
			health *= dailyModifiers.badMapHealth.getMult(game.global.dailyChallenge.badMapHealth.strength);
	}

	//Obliterated + Eradicated
	if (game.global.challengeActive == "Obliterated" || game.global.challengeActive == "Eradicated") {
		var oblitMult = (game.global.challengeActive == "Eradicated") ? game.challenges.Eradicated.scaleModifier : 1e12;
		var zoneModifier = Math.floor(game.global.world / game.challenges[game.global.challengeActive].zoneScaleFreq);
		oblitMult *= Math.pow(game.challenges[game.global.challengeActive].zoneScaling, zoneModifier);
		health *= oblitMult;
	}

	return health;
}

function calcEnemyHealth(type, zone, cell = 99, name = "Turtlimp") {
	//Init
	var health = calcEnemyHealthCore(type, zone, cell, name);
	var corrupt = zone >= mutations.Corruption.start();
	var healthy = mutations.Healthy.active();

	//Challenges - worst case for Lead and Domination
	if (game.global.challengeActive == "Domination") health *= 7.5;
	if (game.global.challengeActive == "Lead") health *= (zone % 2 == 0) ? 5.08 : (1 + 0.04 * game.challenges.Lead.stacks);

	//Void Map Difficulty (implicit 100% difficulty on regular maps)
	if (type == "void") health *= (zone >= 60) ? 4.5 : 2.5;

	//Average corrupt impact on World
	if (type == "world" && corrupt && !game.global.spireActive) {
		//Corruption during Domination
		if (game.global.challengeActive == "Domination") health *= calcCorruptionScale(zone, 10);

		//Calculates the impact of the corruption on the average health on that map times two. Improbabilities count as 5.
		else {
			var corruptionAmount = 2 * Math.min(52, 7 + ~~((zone - mutations.Corruption.start()) / 3)); //Integer division
			var corruptionWeight = (104 - corruptionAmount) + corruptionAmount * calcCorruptionScale(zone, 10);
			health *= corruptionWeight / 104;
		}
	}

	//Healthy
	if (type == "world" && healthy && !game.global.spireActive) {
		//Calculates the impact of the Healthy on the average attack on that map.
		var healthyAmount = 2 * Math.min(50, 2 + ~~((zone - 300) / 15)); //Integer division
		var healthyWeight = (100 - healthyAmount) + healthyAmount * calcCorruptionScale(zone, 14) / calcCorruptionScale(zone, 10);
		health *= healthyWeight / 100;
	}

	return health;
}

function calcSpecificEnemyHealth(type, zone, cell, forcedName) {
	//Pre-Init
	if (!type) type = (!game.global.mapsActive) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	if (!zone) zone = (type == "world" || !game.global.mapsActive) ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = (type == "world" || !game.global.mapsActive) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);

	//Select our enemy
	var enemy = (type == "world") ? game.global.gridArray[cell - 1] : game.global.mapGridArray[cell - 1];
	if (!enemy) return -1;

	//Init
	var corrupt = enemy.corrupted && enemy.corrupted != "none";
	var healthy = corrupt && enemy.corrupted.startsWith("healthy");
	var name = corrupt ? "Chimp" : (forcedName) ? forcedName : enemy.name;
	var health = calcEnemyHealthCore(type, zone, cell, name);

	//Challenges - considers the actual scenario for this enemy
	if (game.global.challengeActive == "Lead") health *= 1 + (0.04 * game.challenges.Lead.stacks);
	if (game.global.challengeActive == "Domination") {
		var lastCell = (type == "world") ? 100 : game.global.mapGridArray.length;
		if (cell < lastCell) health /= 10;
		else health *= 7.5;
	}

	//Map and Void Difficulty
	if (type != "world") health *= getCurrentMapObject().difficulty;

	//Corruption
	else if (type == "world" && !healthy && (corrupt || mutations.Corruption.active() && cell == 100) && !game.global.spireActive) {
		health *= calcCorruptionScale(zone, 10);
		if (enemy.corrupted == "corruptTough") health *= 5;
	}

	//Healthy
	else if (type == "world" && healthy) {
		health *= calcCorruptionScale(zone, 14);
		if (enemy.corrupted == "healthyTough") health *= 7.5;
	}

	return health;
}

function calcHDRatio(targetZone, type) {
	var ratio = Infinity;
	var gammaBurstDmg = getPageSetting('rCalcGammaBurst') ? gammaBurstPct : 1;
	//Init
	var ignoreMapBonus = type != "world" || (game.global.challengeActive == "Lead" && targetZone % 2 == 1);
	var ourBaseDamage = calcOurDmg("avg", "X", false, ignoreMapBonus);

	//Void Power compensation
	if (type == "void" && !(game.global.mapsActive && getCurrentMapObject().location != "Void")) {
		if (game.talents.voidPower3.purchased) ourBaseDamage *= 1.15;
		else if (game.talents.voidPower2.purchased) ourBaseDamage *= 1.35;
		else if (game.talents.voidPower.purchased) ourBaseDamage *= 1.65;
	}

	//Lead Challenge
	if (game.global.challengeActive == "Lead" && targetZone % 2 == 1 && type != "map") {
		//Stats for void maps
		var voidDamage = ourBaseDamage;
		var voidHealth = type == "void" ? calcEnemyHealth("void", targetZone) : 0;

		//Farms on odd zones, and ignores the odd zone attack buff
		targetZone++;
		ourBaseDamage /= 1.5;

		//Custom Anticipation Stacks
		var anti = (mutations.Corruption.active()) ? (scryingCorruption() ? 45 : 45) : 45;
		if (game.global.antiStacks > anti) {
			ourBaseDamage /= getAnticipationBonus(game.global.antiStacks);
			ourBaseDamage *= getAnticipationBonus(anti);
		}

		//Empowerments - Poison
		ourBaseDamage += addPoison(false, targetZone);
		voidDamage += addPoison();
		ourBaseDamage *= gammaBurstDmg

		//Return whatever gives the worst H:D ratio, an odd zone void map or farming for the next even zone
		return Math.max(voidHealth / voidDamage, calcEnemyHealth("world", targetZone) / ourBaseDamage);
	}
	//Return H:D for a regular, sane, not f-ing Lead zone (sorry, Lead just took a lot of me)
	return calcEnemyHealth(type, targetZone) / (ourBaseDamage + addPoison());
}

function calcCurrentStance() {
	if (game.global.uberNature == "Wind" && getEmpowerment() == "Wind" && !game.global.mapsActive &&
		(
			((game.global.challengeActive != "Daily" && HDratio < getPageSetting('WindStackingMinHD'))
				|| (game.global.challengeActive == "Daily" && HDRatio < getPageSetting('dWindStackingMinHD')))
			&&
			((game.global.challengeActive != "Daily" && game.global.world >= getPageSetting('WindStackingMin'))
				|| (game.global.challengeActive == "Daily" && game.global.world >= getPageSetting('dWindStackingMin')))
		)
		|| (game.global.uberNature == "Wind" && getEmpowerment() == "Wind" && !game.global.mapsActive && checkIfLiquidZone() && getPageSetting('liqstack') == true))
		return 15;
}

function calcVoidHDratio() {
	return calcHDRatio(game.global.world, 'void');
}

/* function calcCurrentStance() {
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
	} else {

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
				} else if ((hitslow) > stacksleft) {
					return 0;
				} else {
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
				} else if ((hitshigh) > stacksleft) {
					return 10;
				} else {
					return 11;
				}
			}
		}
	}
}

function calcBaseDamageInX() {
	baseMinDamage = calcOurDmg("min", false, false);
	baseMaxDamage = calcOurDmg("max", false, false);
	baseDamage = calcOurDmg("avg", false, false);
	baseHealth = calcOurHealth(false);
	baseBlock = calcOurBlock(false);
} */

//Radon

function debugCalc() {
	//Pre-Init
	var mapping = game.global.mapsActive ? true : false;
	var mapType = (!mapping) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	var zone = (mapType == "world" || !mapping) ? game.global.world : getCurrentMapObject().level;
	var cell = (mapType == "world" || !mapping) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
	var difficulty = mapping ? getCurrentMapObject().difficulty : 1;
	var name = getCurrentEnemy() ? getCurrentEnemy().name : "Chimp";
	var equality = Math.pow(game.portal.Equality.getModifier(), game.portal.Equality.disabledStackCount)
	var attack = RcalcBadGuyDmg(null, RgetEnemyAvgAttack(zone, cell, name, mapType, false), 0, mapType, false) * difficulty
	var safeMapping = mapping && game.talents.mapHealth.purchased ? 2 : 1;
	var bionic = mapping && game.talents.bionic2.purchased && zone > game.global.world ? 1.5 : 1;
	var runningUnlucky = game.global.challengeActive == 'Unlucky'

	//Init
	var displayedMin = RcalcOurDmg("min", game.portal.Equality.disabledStackCount, mapType, true, runningUnlucky, true) * bionic;
	var displayedMax = RcalcOurDmg("max", game.portal.Equality.disabledStackCount, mapType, true, runningUnlucky, true) * bionic * (runningUnlucky ? 399 : 1);

	//Trimp Stats
	debug("Our Stats");
	debug("Our attack: " + displayedMin.toExponential(2) + "-" + displayedMax.toExponential(2));
	debug("Our crit: " + 100 * getPlayerCritChance() + "% for " + getPlayerCritDamageMult().toFixed(1) + "x Damage. Average of " + RgetCritMulti(true, true).toFixed(2) + "x");
	debug("Our Health: " + (RcalcOurHealth(false, mapType) * safeMapping).toExponential(2));

	//Enemy stats
	debug("Enemy Stats");
	debug("Enemy Attack: " + (attack * 0.5 * equality).toExponential(2) + "-" + (attack * 1.5 * equality).toExponential(2));
	debug("Enemy Health: " + (RcalcEnemyHealthMod(zone, cell, name, mapType) * difficulty).toExponential(2));
}

function RgetCritMulti(floorCrit, mult, ceilCrit) {
	var mult = (!mult) ? false : true;

	var critChance = getPlayerCritChance();
	var critD = getPlayerCritDamageMult();

	if (floorCrit) critChance = Math.floor(getPlayerCritChance());
	if (ceilCrit) critChance = Math.ceil(getPlayerCritChance());
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

function RcalcOurDmg(minMaxAvg, equality, mapType, useTitimp, runningUnlucky, floorCrit, mapLevel) {

	if (!mapType) mapType = (!game.global.mapsActive) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	if (!useTitimp) useTitimp = false;
	if (!runningUnlucky) runningUnlucky = false;
	if (!floorCrit) floorCrit = false;

	// Base + equipment
	var attack = 6;
	var equipmentList = ["Dagger", "Mace", "Polearm", "Battleaxe", "Greatsword", "Arbalest"];
	for (var i = 0; i < equipmentList.length; i++) {
		if (game.equipment[equipmentList[i]].locked !== 0) continue;
		var attackBonus = game.equipment[equipmentList[i]].attackCalculated;
		var level = game.equipment[equipmentList[i]].level;
		attack += attackBonus * level;
	}

	// Soldiers
	attack *= game.resources.trimps.maxSoldiers;
	// Smithies
	attack *= game.buildings.Smithy.owned > 0 ? Math.pow((game.global.stringVersion >= '5.8.0' ? game.buildings.Smithy.getBaseMult() : 1.25), game.buildings.Smithy.owned) : 1;
	// Achievement bonus
	attack *= game.global.achievementBonus > 0 ? 1 + (game.global.achievementBonus / 100) : 1;
	// Power
	attack += (attack * game.portal.Power.radLevel * game.portal.Power.modifier);
	// Map Bonus
	attack *= mapType !== 'world' ? 1 : game.talents.mapBattery.purchased && game.global.mapBonus == 10 ? 5 : 1 + (game.global.mapBonus * .2);
	// Tenacity
	attack *= game.portal.Tenacity.getMult();
	// Hunger
	attack *= game.portal.Hunger.getMult();
	// Observation
	attack *= game.portal.Observation.getMult();
	//Titimp
	attack *= mapType !== 'world' && useTitimp === 'force' ? 2 : mapType !== 'world' && useTitimp && game.global.titimpLeft > 0 ? 2 : 1;
	// Robotrimp
	attack *= 1 + (0.2 * game.global.roboTrimpLevel);
	// Mayhem Completions
	attack *= game.challenges.Mayhem.getTrimpMult();
	// Pandemonium Completions
	attack *= game.challenges.Pandemonium.getTrimpMult();
	//AutoBattle
	attack *= autoBattle.bonuses.Stats.getMult();
	// Heirloom (Shield)
	attack *= 1 + calcHeirloomBonus('Shield', 'trimpAttack', 1, true) / 100;
	// Frenzy perk
	attack *= game.global.challengeActive !== 'Berserk' && (getPageSetting('Rcalcfrenzy') || autoBattle.oneTimers.Mass_Hysteria.owned) ? 1 + (0.5 * game.portal.Frenzy.radLevel) : 1;
	//Championism
	attack *= game.portal.Championism.getMult();
	// Golden Upgrade
	attack *= 1 + game.goldenUpgrades.Battle.currentBonus;
	// Herbalist Mastery
	attack *= game.talents.herbalist.purchased ? game.talents.herbalist.getBonus() : 1;
	// Bionic Magnet Mastery
	attack *= mapType !== 'world' && game.talents.bionic2.purchased && mapLevel > 0 ? 1.5 : 1;
	// Challenge 2 or 3 reward
	attack *= 1 + (game.global.totalSquaredReward / 100);
	// Fluffy Modifier
	attack *= Fluffy.getDamageModifier();
	// Pspire Strength Towers
	attack *= 1 + (playerSpireTraps.Strength.getWorldBonus() / 100);
	// Sharp Trimps
	attack *= game.singleRunBonuses.sharpTrimps.owned ? 1.5 : 1;
	//Mutator
	attack *= game.global.stringVersion >= '5.8.0' && u2Mutations.tree.Attack.purchased ? 1.5 : 1;
	// Sugar rush event bonus
	attack *= game.global.sugarRush ? sugarRush.getAttackStrength() : 1;
	// Challenges
	attack *= game.global.challengeActive == 'Unbalance' ? game.challenges.Unbalance.getAttackMult() : 1;
	attack *= game.global.challengeActive == 'Duel' && game.challenges.Duel.trimpStacks > 50 ? 3 : 1;
	attack *= game.global.challengeActive == 'Melt' ? 5 * Math.pow(0.99, game.challenges.Melt.stacks) : 1;
	attack *= game.global.challengeActive == 'Quagmire' ? game.challenges.Quagmire.getExhaustMult() : 1;
	attack *= game.global.challengeActive == 'Revenge' ? game.challenges.Revenge.getMult() : 1;
	attack *= game.global.challengeActive == 'Quest' ? game.challenges.Quest.getAttackMult() : 1;
	attack *= game.global.challengeActive == 'Archaeology' ? game.challenges.Archaeology.getStatMult('attack') : 1;
	attack *= game.global.challengeActive == 'Storm' && game.global.mapsActive ? Math.pow(0.9995, game.challenges.Storm.beta) : 1;
	attack *= game.global.challengeActive == 'Berserk' ? game.challenges.Berserk.getAttackMult() : 1;
	attack *= game.global.challengeActive == 'Nurture' && game.challenges.Nurture.boostsActive() ? game.challenges.Nurture.getStatBoost() : 1;
	attack *= game.global.challengeActive == 'Alchemy' ? alchObj.getPotionEffect('Potion of Strength') : 1;
	attack *= game.global.challengeActive === 'Smithless' && game.challenges.Smithless.fakeSmithies > 0 ? Math.pow(1.25, game.challenges.Smithless.fakeSmithies) : 1;
	attack *= mapType === 'world' && game.global.novaMutStacks > 0 ? u2Mutations.types.Nova.trimpAttackMult() : 1;

	// Dailies
	var minDailyMod = 1;
	var maxDailyMod = 1;
	if (game.global.challengeActive == "Daily") {
		// Legs for Days mastery
		attack *= game.talents.daily.purchased ? 1.5 : 1;
		//Scruffy Level 20 - Dailies
		attack *= Fluffy.isRewardActive('SADailies') && game.global.challengeActive == "Daily" ? Fluffy.rewardConfig.SADailies.attackMod() : 1;
		// Min damage reduced (additive)
		minDailyMod -= typeof game.global.dailyChallenge.minDamage !== 'undefined' ? dailyModifiers.minDamage.getMult(game.global.dailyChallenge.minDamage.strength) : 0;
		// Max damage increased (additive)
		maxDailyMod += typeof game.global.dailyChallenge.maxDamage !== 'undefined' ? dailyModifiers.maxDamage.getMult(game.global.dailyChallenge.maxDamage.strength) : 0;
		// Minus attack on odd zones
		attack *= typeof game.global.dailyChallenge.oddTrimpNerf !== 'undefined' && ((game.global.world % 2) == 1) ? dailyModifiers.oddTrimpNerf.getMult(game.global.dailyChallenge.oddTrimpNerf.strength) : 1;
		// Bonus attack on even zones
		attack *= typeof game.global.dailyChallenge.evenTrimpBuff !== 'undefined' && ((game.global.world % 2) == 0) ? dailyModifiers.evenTrimpBuff.getMult(game.global.dailyChallenge.evenTrimpBuff.strength) : 1;
		// Rampage Daily mod
		attack *= typeof game.global.dailyChallenge.rampage !== 'undefined' ? dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, game.global.dailyChallenge.rampage.stacks) : 1;
	}

	if (game.talents.voidPower.purchased && mapType === 'void') {
		attack *= (game.talents.voidPower2.purchased) ? ((game.talents.voidPower3.purchased) ? 1.65 : 1.35) : 1.15;
		attack *= (game.talents.voidMastery.purchased) ? 5 : 1;
	}

	attack *= (game.global.challengeActive == 'Unlucky' || floorCrit) ? RgetCritMulti(true) : RgetCritMulti();

	// Equality
	if (!isNaN(parseInt((equality)))) {
		if (equality > game.portal.Equality.radLevel)
			debug('You don\'t have this many levels in Equality. - Player Dmg. ' + equality + " equality used.")
		attack *= Math.pow(game.portal.Equality.getModifier(1), equality)
	} else if (isNaN(parseInt((equality)))) {
		if (getPageSetting('Rcalcmaxequality') == 1 && getPageSetting('Rmanageequality') && !equality)
			attack *= Math.pow(game.portal.Equality.getModifier(1), game.portal.Equality.scalingCount);
		else if (getPageSetting('Rcalcmaxequality') == 0 && !equality)
			attack *= game.portal.Equality.getMult(1);
		else
			attack *= game.portal.Equality.getMult(1);
	}

	if (game.global.challengeActive == 'Unlucky') {
		attack *= 0.005
		if (runningUnlucky)
			return attack;
		if (Number(attack.toString()[0] % 2 == 0))
			attack *= 399
		attack /= RgetCritMulti(true);
		attack *= RgetCritMulti(floorCrit);
	}

	switch (minMaxAvg) {
		case 'min':
			return game.global.challengeActive == 'Unlucky' ? attack : attack * (game.portal.Range.radLevel * 0.02 + 0.8) * minDailyMod;
		case 'max':
			return game.global.challengeActive == 'Unlucky' ? attack : attack * 1.2 * maxDailyMod;
		case 'avg':
			return attack;
	}
	return attack;
}

function RcalcOurHealth(onlyShield, mapType) {
	if (!mapType) mapType = (!game.global.mapsActive) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
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
	//health *= game.global.challengeActive == 'Duel' && game.challenges.Duel.trimpStacks < 20 ? game.challenges.Duel.healthMult : 1;
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
	health *= (game.talents.voidPower.purchased && mapType === 'void') ? (1 + (game.talents.voidPower.getTotalVP() / 100)) : 1;

	//Prismatic Shield and Shield Layer, scales with multiple Scruffy shield layers
	shield = (health * (Fluffy.isRewardActive('shieldlayer') ? 1 + (getEnergyShieldMult() * (1 + Fluffy.isRewardActive('shieldlayer'))) : 1 + getEnergyShieldMult())) - health;

	if (!onlyShield)
		health += shield;
	else
		health = shield;

	return health;
}

function rMutationAttack(cell) {
	var baseAttack;
	var addAttack = 0;
	if (cell.cs) {
		baseAttack = RgetEnemyAvgAttack(game.global.world, cell.level, cell.name, 'world', true);
	}
	else
		baseAttack = RgetEnemyAvgAttack(game.global.world, cell.level, cell.name, 'world', true);
	if (cell.cc) addAttack = u2Mutations.types.Compression.attack(cell, baseAttack);
	if (cell.u2Mutation.indexOf('NVA') != -1) baseAttack *= 0.01;
	else if (cell.u2Mutation.indexOf('NVX') != -1) baseAttack *= 10;
	baseAttack += addAttack;
	baseAttack *= Math.pow(1.01, (game.global.world - 201));
	return baseAttack;
}

function rCalcMutationAttack(muteCell) {
	var attack;
	var highest = 1;
	var worstCell = 0;

	for (var i = 0; i < game.global.gridArray.length; i++) {
		var hasRage = game.global.gridArray[i].u2Mutation.includes('RGE');
		if (game.global.gridArray[i].u2Mutation.includes('CMP') && !game.global.gridArray[i].u2Mutation.includes('RGE')) {
			for (var y = i + 1; y < i + u2Mutations.types.Compression.cellCount(); y++) {
				if (game.global.gridArray[y].u2Mutation.includes('RGE')) {
					hasRage = true;
					break;
				}
			}
		}
		var cell = game.global.gridArray[i];
		if (cell.u2Mutation && cell.u2Mutation.length) {
			if (rMutationAttack(cell) > highest) worstCell = i;
			highest = Math.max(rMutationAttack(cell) * (hasRage ? (u2Mutations.tree.Unrage.purchased ? 4 : 5) : 1), highest);
			attack = highest;
		}
	}
	//Showing which cell has the highest attack value
	if (muteCell) debug(worstCell)

	return attack;
}

function RcalcBadGuyDmg(enemy, attack, equality, mapType, checkMutations) { //Works out avg dmg. For max dmg * 1.5.
	var attack = enemy ? enemy.attack : attack;
	if (!mapType) mapType = (!game.global.mapsActive) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	attack = game.global.challengeActive == 'Exterminate' && getPageSetting('Rexterminateon') && getPageSetting('Rexterminatecalc') ? RgetEnemyAvgAttack(game.global.world, 90, 'Mantimp') : attack;

	if (enemy)
		attack = enemy.attack;
	else
		attack = attack;

	if (checkMutations && game.global.world > 200 && getPageSetting('rMutationCalc')) {
		attack = rCalcMutationAttack();
	}

	if (!isNaN(parseInt((equality)))) {
		if (equality > game.portal.Equality.radLevel)
			debug('You don\'t have this many levels in Equality. - Enemy Dmg')
		attack *= Math.pow(game.portal.Equality.getModifier(), equality)
	} else if (isNaN(parseInt((equality)))) {
		attack *= game.portal.Equality.radLevel > 0 && getPageSetting('Rcalcmaxequality') == 0 && !equality ? game.portal.Equality.getMult() : 1;
		attack *= game.portal.Equality.radLevel > 0 && getPageSetting('Rcalcmaxequality') == 0 && !equality ? game.portal.Equality.getMult() : 1;
		attack *= game.portal.Equality.radLevel > 0 && getPageSetting('Rcalcmaxequality') >= 1 && game.portal.Equality.scalingCount > 0 && !equality ? Math.pow(game.portal.Equality.modifier, game.portal.Equality.scalingCount) : 1;
	}

	if (game.global.challengeActive == "Daily") {
		if (typeof game.global.dailyChallenge.badStrength !== 'undefined')
			attack *= dailyModifiers.badStrength.getMult(game.global.dailyChallenge.badStrength.strength);

		if (typeof game.global.dailyChallenge.badMapStrength !== 'undefined' && mapType !== 'world')
			attack *= dailyModifiers.badMapStrength.getMult(game.global.dailyChallenge.badMapStrength.strength);

		if (typeof game.global.dailyChallenge.bloodthirst !== 'undefined')
			attack *= dailyModifiers.bloodthirst.getMult(game.global.dailyChallenge.bloodthirst.strength, game.global.dailyChallenge.bloodthirst.stacks)

		if (typeof game.global.dailyChallenge.empower !== 'undefined' && mapType === 'world')
			attack *= dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks);
	}

	attack *= game.global.challengeActive == 'Unbalance' ? 1.5 : 1;
	attack *= game.global.challengeActive == 'Duel' && game.challenges.Duel.trimpStacks < 50 ? 3 : 1;
	attack *= game.global.challengeActive == 'Wither' && game.challenges.Wither.enemyStacks > 0 ? game.challenges.Wither.getEnemyAttackMult() : 1;
	attack *= game.global.challengeActive == 'Archaeology' ? game.challenges.Archaeology.getStatMult('enemyAttack') : 1;
	attack *= game.global.challengeActive == 'Mayhem' && mapType === 'world' ? game.challenges.Mayhem.getBossMult() : 1;
	attack *= game.global.challengeActive == 'Mayhem' ? game.challenges.Mayhem.getEnemyMult() : 1;
	//Purposefully don't put Storm in here.
	attack *= game.global.challengeActive == 'Storm' && !game.global.mapsActive ? game.challenges.Storm.getAttackMult() : 1;
	attack *= game.global.challengeActive == 'Exterminate' ? game.challenges.Exterminate.getSwarmMult() : 1;
	attack *= game.global.challengeActive == 'Nurture' ? 2 : 1;
	attack *= game.global.challengeActive == 'Nurture' && game.buildings.Laboratory.owned > 0 ? game.buildings.Laboratory.getEnemyMult() : 1;
	if (game.global.challengeActive == 'Pandemonium') attack *= mapType === 'world' ? game.challenges.Pandemonium.getBossMult() : mapType !== 'world' ? game.challenges.Pandemonium.getPandMult() : 1;
	attack *= game.global.challengeActive == 'Alchemy' ? ((alchObj.getEnemyStats(false, false)) + 1) : 1;
	attack *= game.global.challengeActive == 'Hypothermia' ? game.challenges.Hypothermia.getEnemyMult() : 1;
	attack *= game.global.challengeActive == 'Glass' ? game.challenges.Glass.attackMult() : 1;
	attack *= mapType === 'world' && game.global.novaMutStacks > 0 ? u2Mutations.types.Nova.enemyAttackMult() : 1;
	return attack;
}

function RcalcBadGuyDmgMod() {
	dmg = 1;
	dmg *= game.global.challengeActive == 'Duel' && game.challenges.Duel.trimpStacks < 50 ? 3 : 1;
	dmg *= game.global.challengeActive == 'Wither' && game.challenges.Wither.enemyStacks > 0 ? game.challenges.Wither.getEnemyAttackMult() : 1;
	dmg *= game.global.challengeActive == 'Archaeology' ? game.challenges.Archaeology.getStatMult('enemyAttack') : 1;
	dmg *= game.global.challengeActive == 'Mayhem' && !game.global.mapsActive && game.global.lastClearedCell + 2 == 100 ? game.challenges.Mayhem.getBossMult() : 1;
	dmg *= game.global.challengeActive == 'Mayhem' ? game.challenges.Mayhem.getEnemyMult() : 1;
	dmg *= game.global.challengeActive == 'Storm' && !game.global.mapsActive ? game.challenges.Storm.getAttackMult() : 1;
	dmg *= game.global.challengeActive == 'Exterminate' ? game.challenges.Exterminate.getSwarmMult() : 1;
	dmg *= game.global.challengeActive == 'Nurture' ? 2 : 1;
	dmg *= game.global.challengeActive == 'Nurture' && game.buildings.Laboratory.owned > 0 ? game.buildings.Laboratory.getEnemyMult() : 1;
	dmg *= game.global.challengeActive == 'Pandemonium' && !game.global.mapsActive && game.global.lastClearedCell + 2 == 100 ? game.challenges.Pandemonium.getBossMult() : 1;
	dmg *= game.global.challengeActive == 'Pandemonium' && !(!game.global.mapsActive && game.global.lastClearedCell + 2 == 100) ? game.challenges.Pandemonium.getPandMult() : 1;
	dmg *= game.global.challengeActive == 'Glass' ? game.challenges.Glass.attackMult() : 1;
	if (game.global.challengeActive == "Daily") {
		dmg *= typeof game.global.dailyChallenge.badStrength !== 'undefined' ? dailyModifiers.badStrength.getMult(game.global.dailyChallenge.badStrength.strength) : 1;
		dmg *= typeof game.global.dailyChallenge.badMapStrength !== 'undefined' && game.global.mapsActive ? dailyModifiers.badMapStrength.getMult(game.global.dailyChallenge.badMapStrength.strength) : 1;
		dmg *= typeof game.global.dailyChallenge.bloodthirst !== 'undefined' ? dailyModifiers.bloodthirst.getMult(game.global.dailyChallenge.bloodthirst.strength, game.global.dailyChallenge.bloodthirst.stacks) : 1;
		dmg *= typeof game.global.dailyChallenge.empower !== 'undefined' && !game.global.mapsActive ? dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks) : 1;
	}
	if (game.global.world > 200 && typeof (game.global.gridArray[game.global.lastClearedCell + 1].u2Mutation) !== 'undefined') {
		if (!game.global.mapsActive) {
			if (game.global.gridArray[game.global.lastClearedCell + 1].u2Mutation.length > 0) {
				var cell = game.global.gridArray[game.global.lastClearedCell + 1]
				if (cell.u2Mutation.indexOf('RGE') != -1 || (cell.cc && cell.cc[3] > 0)) dmg *= u2Mutations.types.Rage.enemyAttackMult();
			}
			dmg *= game.global.novaMutStacks > 0 ? u2Mutations.types.Nova.enemyAttackMult() : 1;
		}
	}
	return dmg;
}

function RcalcEnemyBaseHealth(mapType, zone, cell, name) {
	//Pre-Init
	if (!mapType) mapType = (!game.global.mapsActive) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	if (!zone) zone = (mapType == "world" || !game.global.mapsActive) ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = (mapType == "world" || !game.global.mapsActive) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : "Turtlimp";

	//Init
	var base = (game.global.universe == 2) ? 10e7 : 130;
	var health = base * Math.sqrt(zone) * Math.pow(3.265, zone / 2) - 110;

	if (game.global.universe === 2 && game.global.world > 200 && mapType === 'world' && typeof (game.global.gridArray[cell - 1].u2Mutation) !== 'undefined') {
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
	if (zone > 5 && mapType != "world") health *= 1.1;

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

function rMutationHealth(cell) {
	var baseHealth;
	var addHealth = 0;

	baseHealth = RcalcEnemyBaseHealth('world', game.global.world, cell.level, cell.name);
	if (cell.cc) addHealth = u2Mutations.types.Compression.health(cell, baseHealth);
	if (cell.u2Mutation.indexOf('NVA') != -1) baseHealth *= 0.01;
	else if (cell.u2Mutation.indexOf('NVX') != -1) baseHealth *= 0.1;
	baseHealth += addHealth;
	baseHealth *= 2;
	baseHealth *= Math.pow(1.02, (game.global.world - 201));
	return baseHealth;
}

function rCalcMutationHealth(muteCell) {
	var health;
	var highest = 1;
	var mute = false;
	var worstCell = 0;
	if (game.global.world > 200 && getPageSetting('rMutationCalc')) {
		for (var i = 0; i < game.global.gridArray.length; i++) {
			var cell = game.global.gridArray[i];
			if (cell.u2Mutation && cell.u2Mutation.length) {
				if (rMutationHealth(cell) > highest) worstCell = i;
				highest = Math.max(rMutationHealth(cell), highest);
				mute = true;
				health = highest;
			}
		}
		//Showing which cell has the highest health value
		if (muteCell) debug(worstCell)
	}
	if (!mute) health = RcalcEnemyBaseHealth("world", game.global.world, 99, 'Gorillimp');

	return health;
}

function RcalcEnemyHealthMod(world, cell, name, mapType, checkMutations) {
	//Initialising variables
	var mapType = !mapType ? 'world' : mapType;
	var world = !world ? game.global.world : world;
	var health = RcalcEnemyBaseHealth(mapType, world, cell, name);

	if (game.global.universe === 2) {
		if (mapType === 'world' && checkMutations && game.global.world > 200 && getPageSetting('rMutationCalc')) {
			health = rCalcMutationHealth() > health ? rCalcMutationHealth() : health;
		} else if (game.global.world > 200 && mapType === 'world' && world === game.global.world) {
			if (game.global.gridArray[cell - 1].u2Mutation && game.global.gridArray[cell - 1].u2Mutation.length !== 0) {
				health = u2Mutations.getHealth(game.global.gridArray[cell - 1])
			}
		}
	}

	//Challenges
	health *= game.global.challengeActive == 'Unbalance' && mapType !== 'world' ? 2 : game.global.challengeActive == 'Unbalance' ? 3 : 1;
	//health *= game.global.challengeActive == 'Duel' && game.challenges.Duel.enemyStacks < 20 ? game.challenges.Duel.healthMult : 1;
	health *= game.global.challengeActive == 'Quest' ? game.challenges.Quest.getHealthMult() : 1;
	health *= game.global.challengeActive == 'Revenge' && game.global.world % 2 == 0 ? 10 : 1;
	health *= game.global.challengeActive == 'Mayhem' && mapType === 'world' ? game.challenges.Mayhem.getBossMult() : 1;
	health *= game.global.challengeActive == 'Mayhem' ? game.challenges.Mayhem.getEnemyMult() : 1;
	health *= game.global.challengeActive == 'Storm' && mapType === 'world' ? game.challenges.Storm.getHealthMult() : 1;
	//health *= game.global.challengeActive == 'Berserk' ? 1.5 : 1;
	health *= game.global.challengeActive == 'Exterminate' ? game.challenges.Exterminate.getSwarmMult() : 1;
	if (game.global.challengeActive == 'Nurture') {
		health *= mapType === 'world' ? 2 : mapType !== 'world' ? 10 : 1;
		health *= game.buildings.Laboratory.owned > 0 ? game.buildings.Laboratory.getEnemyMult() : 1;
	}
	if (game.global.challengeActive == 'Pandemonium') health *= mapType === 'world' ? game.challenges.Pandemonium.getBossMult() : mapType !== 'world' ? game.challenges.Pandemonium.getPandMult() : 1;
	health *= game.global.challengeActive == 'Alchemy' ? ((alchObj.getEnemyStats(false, false)) + 1) : 1;
	health *= game.global.challengeActive == 'Hypothermia' ? game.challenges.Hypothermia.getEnemyMult() : 1;
	health *= game.global.challengeActive == 'Glass' ? game.challenges.Glass.healthMult() : 1;

	//Dailies
	if (game.global.challengeActive == 'Daily') {
		health *= typeof game.global.dailyChallenge.badHealth !== 'undefined' ? dailyModifiers.badHealth.getMult(game.global.dailyChallenge.badHealth.strength, game.global.dailyChallenge.badHealth.stacks) : 1;
		health *= typeof game.global.dailyChallenge.badMapHealth !== 'undefined' && mapType !== 'world' ? dailyModifiers.badMapHealth.getMult(game.global.dailyChallenge.badMapHealth.strength, game.global.dailyChallenge.badMapHealth.stacks) : 1;
		health *= typeof game.global.dailyChallenge.empower !== 'undefined' && mapType === 'world' ? dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks) : 1;
	}

	return health;
}

function RcalcHDratio() {
	var ratio = Infinity;
	var checkMutations = game.global.world > 200 && getPageSetting('rMutationCalc')
	if (game.global.gridArray.length > 0) {
		var enemyHealth = RcalcEnemyHealthMod(game.global.world, 100, 'Improbability', 'world', checkMutations);
		var ourDamage = RcalcOurDmg("avg", 0, 'world');
		if (getPageSetting('rManageEquality') == 2) {
			var gammaBurstDmg = getPageSetting('rCalcGammaBurst') ? gammaBurstPct : 1;
			var equality = equalityQuery('Improbability', game.global.world, 100, 'world', 1, 'gamma');
			ourDamage = RcalcOurDmg('avg', equality, 'world') * gammaBurstDmg;
		}
		//debug("Eq - " + equality + " T_dmg - " + ourDamage.toExponential(2) + " E_hp - " + enemyHealth.toExponential(2))
		ratio = enemyHealth / ourDamage;
	}
	return ratio;
}

function rCalcVoidHDratio() {
	var ratio = Infinity;
	var gammaBurstDmg = getPageSetting('rCalcGammaBurst') ? gammaBurstPct : 1;
	if (game.global.gridArray.length > 0) {
		var enemyHealth = RcalcEnemyHealthMod(game.global.world, 100, 'Cthulimp', 'void') * 4;
		var equality = equalityQuery('Cthulimp', game.global.world, 100, 'void', 4, 'gamma');
		var ourDamage = RcalcOurDmg('avg', equality, 'void', false, false, false) * gammaBurstDmg;
		//debug("Eq - " + equality + " T_dmg - " + ourDamage.toExponential(2) + " E_hp - " + enemyHealth.toExponential(2))
		ratio = enemyHealth / ourDamage;
	}
	return ratio;
}

//This needs majorly updated!
function getTotalHealthMod() {
	var healthMulti = 1;
	//Smithies
	healthMulti *= game.buildings.Smithy.owned > 0 ? game.buildings.Smithy.getMult() : 1;
	//Antenna Array
	healthMulti *= game.buildings.Antenna.owned >= 10 ? game.jobs.Meteorologist.getExtraMult() : 1;
	//Toughness add
	healthMulti *= game.portal.Toughness.radLevel > 0 ? 1 + (game.portal.Toughness.radLevel * game.portal.Toughness.modifier) : 1;
	//Resilience
	healthMulti *= game.portal.Resilience.radLevel > 0 ? Math.pow(game.portal.Resilience.modifier + 1, game.portal.Resilience.radLevel) : 1;
	//Scruffy is Life
	healthMulti *= Fluffy.isRewardActive('healthy') ? 1.5 : 1;
	//Observation
	healthMulti *= game.portal.Observation.radLevel > 0 ? game.portal.Observation.getMult() : 1;
	//Mayhem Completions
	healthMulti *= game.global.mayhemCompletions > 0 ? game.challenges.Mayhem.getTrimpMult() : 1;
	//Pandemonium Completions
	healthMulti *= game.global.pandCompletions > 0 ? game.challenges.Pandemonium.getTrimpMult() : 1;
	//AutoBattle
	healthMulti *= autoBattle.bonuses.Stats.getMult();
	// Heirloom Health bonus
	healthMulti *= 1 + calcHeirloomBonus('Shield', 'trimpHealth', 1, true) / 100;
	//Championism
	healthMulti *= game.portal.Championism.getMult();
	//Golden Battle
	healthMulti *= game.goldenUpgrades.Battle.currentBonus > 0 ? 1 + game.goldenUpgrades.Battle.currentBonus : 1;
	// Cinf
	healthMulti *= game.global.totalSquaredReward > 0 ? 1 + (game.global.totalSquaredReward / 100) : 1;
	//Mutator
	healthMulti *= game.global.stringVersion >= '5.8.0' && u2Mutations.tree.Health.purchased ? 1.5 : 1;
	// Challenge Multis
	healthMulti *= game.global.challengeActive == 'Revenge' && game.challenges.Revenge.stacks > 0 ? game.challenges.Revenge.getMult() : 1;
	healthMulti *= game.global.challengeActive == 'Wither' && game.challenges.Wither.trimpStacks > 0 ? game.challenges.Wither.getTrimpHealthMult() : 1;
	healthMulti *= game.global.challengeActive == 'Insanity' ? game.challenges.Insanity.getHealthMult() : 1;
	healthMulti *= game.global.challengeActive == 'Berserk' && game.challenges.Berserk.frenzyStacks > 0 ? game.challenges.Berserk.getHealthMult() : 1;
	healthMulti *= game.global.challengeActive == 'Berserk' && game.challenges.Berserk.frenzyStacks <= 0 ? game.challenges.Berserk.getHealthMult(true) : 1;
	healthMulti *= game.challenges.Nurture.boostsActive() ? game.challenges.Nurture.getStatBoost() : 1;
	healthMulti *= game.global.challengeActive == 'Alchemy' ? alchObj.getPotionEffect("Potion of Strength") : 1;
	healthMulti *= game.global.challengeActive === 'Smithless' && game.challenges.Smithless.fakeSmithies > 0 ? Math.pow(1.25, game.challenges.Smithless.fakeSmithies) : 1;
	// Daily mod
	healthMulti *= typeof game.global.dailyChallenge.pressure !== 'undefined' ? dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks) : 1;
	// Prismatic
	healthMulti *= 1 + getEnergyShieldMult();
	// Shield layer
	healthMulti *= (Fluffy.isRewardActive('shieldlayer') ? 1 + Fluffy.isRewardActive('shieldlayer') : 1);
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
