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
	var mapping = game.global.mapsActive ? true : false;
	var mapType = (!mapping) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	var zone = (mapType == "world") ? game.global.world : getCurrentMapObject().level;
	var cell = (mapType == "world") ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
	var difficulty = mapping ? getCurrentMapObject().difficulty : 1;
	var name = getCurrentEnemy() ? getCurrentEnemy().name : "Chimp";
	var equality = game.global.universe === 2 ? Math.pow(game.portal.Equality.getModifier(), game.portal.Equality.disabledStackCount) : 1;
	var enemyMin = calcEnemyAttackCore(mapType, zone, cell, name, true, false, 0) * difficulty;
	var enemyMax = calcEnemyAttackCore(mapType, zone, cell, name, false, false, 0) * difficulty;
	var mapLevel = mapping && game.talents.bionic2.purchased ? zone - game.global.world : 0;
	var universeSetting = game.global.universe === 2 ? game.portal.Equality.disabledStackCount : false;
	var universeSetting2 = game.global.universe === 2 ? false : true;

	//Init
	var displayedMin = calcOurDmg("min", universeSetting, true, mapType, 'never', mapLevel, true);
	var displayedMax = calcOurDmg("max", universeSetting, true, mapType, 'never', mapLevel, true);

	//Trimp Stats
	debug("Our Stats");
	debug("Our attack: " + displayedMin.toExponential(2) + "-" + displayedMax.toExponential(2));
	debug("Our crit: " + 100 * getPlayerCritChance() + "% for " + getPlayerCritDamageMult().toFixed(1) + "x Damage. Average of " + getCritMulti(false, "maybe").toFixed(2) + "x");
	if (game.global.universe === 1) debug("Our block: " + calcOurBlock(true, true).toExponential(2));
	if (game.global.universe === 2) debug("Our equality: " + game.portal.Equality.disabledStackCount);
	debug("Our Health: " + (calcOurHealth(universeSetting2, mapType)).toExponential(2));

	//Enemy stats
	debug("Enemy Stats");
	debug("Enemy Attack: " + (enemyMin * equality).toExponential(2) + "-" + (enemyMax * equality).toExponential(2));
	debug("Enemy Health: " + (calcEnemyHealthCore(mapType, zone, cell, name) * difficulty).toExponential(2));

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
	const perkLevel = game.global.universe === 2 ? 'radLevel' : 'level';

	//Magma
	if (mutations.Magma.active()) dmg *= mutations.Magma.getTrimpDecay();

	//Power I
	if (game.portal.Power[perkLevel] > 0) dmg += (dmg * game.portal.Power[perkLevel] * game.portal.Power.modifier);

	//Power II
	if (game.portal.Power_II[perkLevel] > 0) dmg *= (1 + (game.portal.Power_II.modifier * game.portal.Power_II[perkLevel]));

	//Formation
	if (game.global.universe === 1 && (game.global.formation != 0 && game.global.formation != 5)) dmg *= (game.global.formation == 2) ? 4 : 0.5;

	return dmg;
}

function getTrimpHealth(realHealth, mapType) {
	//This is the actual health of the army ATM, without considering items bought, but not yet in use
	if (realHealth) return game.global.soldierHealthMax;
	const perkLevel = game.global.universe === 2 ? 'radLevel' : 'level';

	//Health from equipments and coordination
	var health = (50 + calcEquipment("health")) * game.resources.trimps.maxSoldiers;
	//Amalgamator
	if (game.jobs.Amalgamator.owned > 0) health *= game.jobs.Amalgamator.getHealthMult();
	//Magma
	if (mutations.Magma.active()) health *= mutations.Magma.getTrimpDecay();
	//Smithies
	health *= game.buildings.Smithy.owned > 0 ? game.buildings.Smithy.getMult() : 1;
	//Antenna Array
	health *= game.global.universe === 2 && game.buildings.Antenna.owned >= 10 ? game.jobs.Meteorologist.getExtraMult() : 1;
	//Toughness
	health *= game.portal.Toughness[perkLevel] > 0 ? 1 + (game.portal.Toughness[perkLevel] * game.portal.Toughness.modifier) : 1;
	//Toughness II
	health *= game.portal.Toughness_II[perkLevel] > 0 ? 1 + game.portal.Toughness_II[perkLevel] * game.portal.Toughness_II.modifier : 1;
	//Resilience
	health *= game.portal.Resilience[perkLevel] > 0 ? Math.pow(game.portal.Resilience.modifier + 1, game.portal.Resilience[perkLevel]) : 1;
	//Scruffy is Life
	health *= Fluffy.isRewardActive('healthy') ? 1.5 : 1;
	//Geneticists
	health *= game.jobs.Geneticist.owned > 0 ? Math.pow(1.01, game.global.lastLowGen) : 1;
	//Observation
	health *= game.portal.Observation[perkLevel] > 0 ? game.portal.Observation.getMult() : 1;
	//Formation -- X and W stance both have full HP.
	health *= game.global.universe === 1 && game.global.formation !== 0 && game.global.formation !== 5 ? ((game.global.formation == 1) ? 4 : 0.5) : 1;
	//Mayhem Completions
	health *= game.global.mayhemCompletions > 0 ? game.challenges.Mayhem.getTrimpMult() : 1;
	//Pandemonium Completions
	health *= game.global.pandCompletions > 0 ? game.challenges.Pandemonium.getTrimpMult() : 1;
	//Desolation Completions
	health *= game.global.desoCompletions > 0 ? game.challenges.Desolation.getTrimpMult() : 1;
	health *= game.global.frigidCompletions > 0 && game.global.universe === 1 ? game.challenges.Frigid.getTrimpMult() : 1;
	health *= challengeActive('Desolation') ? game.challenges.Desolation.trimpHealthMult() : 1;
	health *= game.global.universe === 2 && u2Mutations.tree.GeneHealth.purchased ? 10 : 1;
	//AutoBattle
	health *= game.global.universe === 2 ? autoBattle.bonuses.Stats.getMult() : 1;
	//Shield (Heirloom)
	health = calcHeirloomBonus('Shield', 'trimpHealth', health);
	//Void Map Talents
	health *= (game.talents.voidPower.purchased && mapType === 'void') ? (1 + (game.talents.voidPower.getTotalVP() / 100)) : 1;
	//Championism
	health *= game.global.universe === 2 ? game.portal.Championism.getMult() : 1;
	//Golden Battle
	health *= game.goldenUpgrades.Battle.currentBonus > 0 ? 1 + game.goldenUpgrades.Battle.currentBonus : 1;
	//Safe Mapping
	health *= game.talents.mapHealth.purchased && mapType !== 'world' ? 2 : 1;
	//Cinf
	health *= game.global.totalSquaredReward > 0 ? 1 + (game.global.totalSquaredReward / 100) : 1;
	//Mutator
	health *= game.global.universe === 2 && u2Mutations.tree.Health.purchased ? 1.5 : 1;

	//Pressure (Dailies)
	health *= typeof game.global.dailyChallenge.pressure !== 'undefined' ? dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks) : 1;

	//Challenges
	if (challengeActive('Life') && !realHealth) health *= game.challenges.Life.getHealthMult();
	else if (challengeActive('Balance') && !realHealth) health *= game.challenges.Balance.getHealthMult();

	//Alchemy Mult
	health *= challengeActive('Alchemy') ? alchObj.getPotionEffect('Potion of Strength') : 1;
	//Duel Mult
	//health *= challengeActive('Duel') && game.challenges.Duel.trimpStacks < 20 ? game.challenges.Duel.healthMult : 1;
	health *= challengeActive('Revenge') && game.challenges.Revenge.stacks > 0 ? game.challenges.Revenge.getMult() : 1;
	health *= challengeActive('Wither') && game.challenges.Wither.trimpStacks > 0 ? game.challenges.Wither.getTrimpHealthMult() : 1;
	health *= challengeActive('Insanity') ? game.challenges.Insanity.getHealthMult() : 1;
	health *= challengeActive('Berserk') && game.challenges.Berserk.frenzyStacks > 0 ? game.challenges.Berserk.getHealthMult() : 1;
	health *= challengeActive('Berserk') && game.challenges.Berserk.frenzyStacks <= 0 ? game.challenges.Berserk.getHealthMult(true) : 1;
	health *= game.challenges.Nurture.boostsActive() ? game.challenges.Nurture.getStatBoost() : 1;
	health *= challengeActive('Smithless') && game.challenges.Smithless.fakeSmithies > 0 ? Math.pow(1.25, game.challenges.Smithless.fakeSmithies) : 1;

	return health;
}

function calcOurHealth(stance, mapType, realHealth, fullGeneticist) {
	if (!mapType) mapType = (!game.global.mapsActive) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	if (!realHealth) realHealth = false;
	if (!stance) stance = false;

	var health = getTrimpHealth(realHealth, mapType);
	if (game.global.universe === 1) {
		//Formation
		if (!stance && game.global.formation !== 0 && game.global.formation !== 5) health /= (game.global.formation == 1) ? 4 : 0.5;

		//Geneticists
		var geneticist = game.jobs.Geneticist;
		if (fullGeneticist && geneticist.owned > 0) health *= Math.pow(1.01, geneticist.owned - game.global.lastLowGen);
	}
	if (game.global.universe === 2) {
		var shield = 0;
		var onlyShield = stance;
		//Prismatic Shield and Shield Layer, scales with multiple Scruffy shield layers
		shield = (health * (Fluffy.isRewardActive('shieldlayer') ? 1 + (getEnergyShieldMult() * (1 + Fluffy.isRewardActive('shieldlayer'))) : 1 + getEnergyShieldMult())) - health;
		if (onlyShield)
			return shield;
		else
			health += shield;
	}

	return health;
}

function calcHitsSurvived(targetZone, type) {
	//Init
	if (!targetZone) targetZone = game.global.world;
	if (!type) type = 'world';
	var damageMult = 1;
	var voidDamage = 0;
	const formationMod = (game.upgrades.Dominance.done) ? 2 : 1;

	//Our Health and Block
	var health = calcOurHealth(false, type, false, true) / formationMod;
	var block = calcOurBlock(false) / formationMod;

	//Calc for maps
	if (type === "map") {
		return health / Math.max(calcEnemyAttack("map", targetZone) - block, 0);
	}

	//Lead farms one zone ahead
	if (challengeActive('Lead') && type === "world" && game.global.world % 2 === 1) {
		targetZone++;
	}

	//Explosive Daily and Crushed
	if (health > block && getPageSetting('IgnoreCrits') !== 2) {
		const dailyExplosive = challengeActive('Daily') && typeof game.global.dailyChallenge.explosive !== "undefined";
		const crushed = challengeActive('Crushed');
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
	var pierce = (game.global.brokenPlanet) ? getPierceAmt() : 0;

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

function getCritMulti(high, crit) {
	var critChance = getPlayerCritChance();
	var critD = getPlayerCritDamageMult();
	var critDHModifier;

	if (crit == "never") critChance = Math.floor(critChance);
	else if (crit == "force") critChance = Math.ceil(critChance);
	var dmgMulti = getMegaCritDamageMult(Math.floor(critChance));
	var lowTierMulti = getMegaCritDamageMult(Math.floor(critChance));
	var highTierMulti = getMegaCritDamageMult(Math.ceil(critChance));
	var highTierChance = critChance - Math.floor(critChance)

	if (critChance < 0) critDHModifier = (1 + critChance - critChance / 5);
	else if (critChance < 1) critDHModifier = (1 - critChance + critChance * critD);
	else if (critChance < 2) critDHModifier = ((critChance - 1) * getMegaCritDamageMult(2) * critD + (2 - critChance) * critD);
	else if (critChance >= 2 && (crit === 'never' || crit === 'force')) critDHModifier = dmgMulti * critD
	else if (critChance >= 2) critDHModifier = ((1 - highTierChance) * lowTierMulti + highTierChance * highTierMulti) * critD
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
	if (!stacks45) return 1 + (stacks * perkMult);

	//45 stacks (??)
	return 1 + (45 * perkMult);
}

function calcOurDmg(minMaxAvg = "avg", equality, realDamage, mapType, critMode, mapLevel, useTitimp) {

	if (!mapType) mapType = (!game.global.mapsActive) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	if (!mapLevel) mapLevel = 0;
	if (!useTitimp) useTitimp = false;
	if (!critMode) floorCrit = false;
	if (!realDamage) realDamage = false;
	var specificStance = game.global.universe === 1 ? equality : false;

	const perkLevel = game.global.universe === 2 ? 'radLevel' : 'level';

	//Init
	var attack = getTrimpAttack(realDamage);
	var minFluct = 0.8;
	var maxFluct = 1.2;
	//Range
	if (game.portal.Range.level > 0) minFluct += 0.02 * game.portal.Range.level;

	// Smithies
	attack *= game.buildings.Smithy.owned > 0 ? Math.pow(game.buildings.Smithy.getBaseMult(), game.buildings.Smithy.owned) : 1;
	// Achievement bonus
	attack *= game.global.achievementBonus > 0 ? 1 + (game.global.achievementBonus / 100) : 1;
	//Anticipation
	attack *= game.global.antiStacks > 0 ? getAnticipationBonus() : 1;
	//Formation
	if (specificStance && game.global.formation != 0 && game.global.formation != 5) attack /= (game.global.formation === 2) ? 4 : 0.5;
	if (specificStance && specificStance != "X" && specificStance != "W") attack *= (specificStance === "D") ? 4 : 0.5;
	// Map Bonus
	attack *= mapType !== 'world' ? 1 : game.talents.mapBattery.purchased && game.global.mapBonus == 10 ? 5 : 1 + (game.global.mapBonus * .2);
	// Tenacity
	attack *= game.portal.Tenacity.getMult();
	// Hunger
	attack *= game.portal.Hunger.getMult();
	// Observation
	attack *= game.global.universe === 2 ? game.portal.Observation.getMult() : 1;
	//Titimp
	attack *= mapType !== 'world' && useTitimp === 'force' ? 2 : mapType !== 'world' && useTitimp && game.global.titimpLeft > 0 ? 2 : 1;
	// Robotrimp
	attack *= 1 + (0.2 * game.global.roboTrimpLevel);
	// Mayhem Completions
	attack *= game.challenges.Mayhem.getTrimpMult();
	// Pandemonium Completions
	attack *= game.challenges.Pandemonium.getTrimpMult();
	//Desolation Completions
	attack *= game.global.desoCompletions > 0 ? game.challenges.Desolation.getTrimpMult() : 1;
	attack *= game.global.frigidCompletions > 0 && game.global.universe === 1 ? game.challenges.Frigid.getTrimpMult() : 1;
	attack *= challengeActive('Desolation') ? game.challenges.Desolation.trimpAttackMult() : 1;
	attack *= game.global.universe === 2 && u2Mutations.tree.GeneAttack.purchased ? 10 : 1;
	attack *= game.global.universe === 2 && u2Mutations.tree.Brains.purchased ? u2Mutations.tree.Brains.getBonus() : 1;

	//AutoBattle
	attack *= game.global.universe === 2 ? autoBattle.bonuses.Stats.getMult() : 1;
	// Heirloom (Shield)
	attack *= 1 + calcHeirloomBonus('Shield', 'trimpAttack', 1, true) / 100;
	// Frenzy perk
	attack *= game.global.universe === 2 && !challengeActive('Berserk') && (getPageSetting('frenzyCalc') || autoBattle.oneTimers.Mass_Hysteria.owned) ? 1 + (0.5 * game.portal.Frenzy[perkLevel]) : 1;
	//Championism
	attack *= game.global.universe === 2 ? game.portal.Championism.getMult() : 1;
	// Golden Upgrade
	attack *= 1 + game.goldenUpgrades.Battle.currentBonus;
	// Herbalist Mastery
	attack *= game.talents.herbalist.purchased ? game.talents.herbalist.getBonus() : 1;
	//Void Power
	if (game.talents.voidPower.purchased && mapType === 'void') {
		attack *= (game.talents.voidPower2.purchased) ? ((game.talents.voidPower3.purchased) ? 1.65 : 1.35) : 1.15;
		attack *= (game.talents.voidMastery.purchased) ? 5 : 1;
	}
	if (game.global.universe === 1) {
		//Scryhard I - MAKE SURE THIS WORKS!
		var fightingCorrupted = getCurrentEnemy() && getCurrentEnemy().corrupted || !realDamage && (mutations.Healthy.active() || mutations.Corruption.active());
		if (game.talents.scry.purchased && fightingCorrupted && ((!specificStance && game.global.formation == 4) || (specificStance === 'S' || specificStance === 'W')))
			attack *= 2;
		//Magmamancery
		if (game.talents.magmamancer.purchased) attack *= game.jobs.Magmamancer.getBonusPercent();
		//Still Rowing 2
		if (game.talents.stillRowing2.purchased) attack *= ((game.global.spireRows * 0.06) + 1);
		//Strength in Health
		if (game.talents.healthStrength.purchased && mutations.Healthy.active()) attack *= ((0.15 * mutations.Healthy.cellCount()) + 1);
	}
	// Bionic Magnet Mastery
	attack *= mapType !== 'world' && game.talents.bionic2.purchased && mapLevel > 0 ? 1.5 : 1;
	// Sugar rush event bonus
	attack *= game.global.sugarRush ? sugarRush.getAttackStrength() : 1;
	// Challenge 2 or 3 reward
	attack *= 1 + (game.global.totalSquaredReward / 100);
	//Fluffy
	if (Fluffy.isActive()) {
		attack *= Fluffy.getDamageModifier();
		if (Fluffy.isRewardActive('voidSiphon') && game.stats.totalVoidMaps.value) attack *= (1 + (game.stats.totalVoidMaps.value * 0.05));
		if (game.global.universe === 1 && game.talents.kerfluffle.purchased) attack *= game.talents.kerfluffle.mult();
	}

	//Empowerments - Ice (Experimental)
	if (getEmpowerment() === "Ice") {
		//Uses the actual number in some places like Stances
		if (!getPageSetting('fullice') || realDamage) attack *= 1 + game.empowerments.Ice.getDamageModifier();

		//Otherwise, use the number we would have after a transfer
		else {
			var afterTransfer = 1 + Math.ceil(game.empowerments["Ice"].currentDebuffPower * getRetainModifier("Ice"));
			var mod = 1 - Math.pow(game.empowerments.Ice.getModifier(), afterTransfer);
			if (Fluffy.isRewardActive('naturesWrath')) mod *= 2;
			attack *= 1 + mod;
		}
	}
	//Amalgamator
	attack *= game.jobs.Amalgamator.owned > 0 ? game.jobs.Amalgamator.getDamageMult() : 1;
	// Pspire Strength Towers
	attack *= 1 + (playerSpireTraps.Strength.getWorldBonus() / 100);
	//Poison Empowerment
	attack *= game.global.uberNature == "Poison" ? 3 : 1;
	// Sharp Trimps
	attack *= game.singleRunBonuses.sharpTrimps.owned ? 1.5 : 1;
	//Mutator
	attack *= game.global.universe === 2 && u2Mutations.tree.Attack.purchased ? 1.5 : 1;

	//Challenges
	if (challengeActive('Life')) attack *= game.challenges.Life.getHealthMult();
	if (challengeActive('Lead') && (game.global.world % 2) == 1) attack *= 1.5;

	//Decay
	if (challengeActive('Decay')) {
		attack *= 5;
		attack *= Math.pow(0.995, game.challenges.Decay.stacks);
	}

	// Challenges
	attack *= challengeActive('Unbalance') ? game.challenges.Unbalance.getAttackMult() : 1;
	attack *= challengeActive('Duel') && game.challenges.Duel.trimpStacks > 50 ? 3 : 1;
	attack *= challengeActive('Melt') ? 5 * Math.pow(0.99, game.challenges.Melt.stacks) : 1;
	if (challengeActive('Quagmire')) {
		var exhaustedStacks = game.challenges.Quagmire.exhaustedStacks;
		var mod = mapType !== 'world' ? 0.05 : mapType === 'world' ? 0.1 : (game.global.mapsActive) ? 0.05 : 0.1;
		if (exhaustedStacks == 0) attack *= 1;
		else if (exhaustedStacks < 0) attack *= Math.pow((1 + mod), Math.abs(exhaustedStacks));
		else attack *= Math.pow((1 - mod), exhaustedStacks);
	}
	attack *= challengeActive('Revenge') ? game.challenges.Revenge.getMult() : 1;
	attack *= challengeActive('Quest') ? game.challenges.Quest.getAttackMult() : 1;
	attack *= challengeActive('Archaeology') ? game.challenges.Archaeology.getStatMult('attack') : 1;
	attack *= challengeActive('Storm') && game.global.mapsActive ? Math.pow(0.9995, game.challenges.Storm.beta) : 1;
	attack *= challengeActive('Berserk') ? game.challenges.Berserk.getAttackMult() : 1;
	attack *= game.challenges.Nurture.boostsActive() ? game.challenges.Nurture.getStatBoost() : 1;
	attack *= challengeActive('Alchemy') ? alchObj.getPotionEffect('Potion of Strength') : 1;
	attack *= challengeActive('Smithless') && game.challenges.Smithless.fakeSmithies > 0 ? Math.pow(1.25, game.challenges.Smithless.fakeSmithies) : 1;

	//Nova mutation
	attack *= mapType === 'world' && game.global.novaMutStacks > 0 ? u2Mutations.types.Nova.trimpAttackMult() : 1;

	//Discipline / Unlucky
	if (challengeActive('Discipline') || challengeActive('Unlucky')) {
		minFluct = 0.005;
		maxFluct = 1.995;
	}

	// Dailies
	var minDailyMod = 1;
	var maxDailyMod = 1;
	if (challengeActive('Daily')) {
		if (game.talents.daily.purchased) attack *= 1.5;
		//Scruffy Level 20 - Dailies
		attack *= Fluffy.isRewardActive('SADailies') ? Fluffy.rewardConfig.SADailies.attackMod() : 1;

		//Rampage in maps only
		if (typeof game.global.dailyChallenge.rampage !== 'undefined' && mapType === 'map') attack *= dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, dailyModifiers.rampage.getMaxStacks(game.global.dailyChallenge.rampage.strength));

		//Range Dailies
		if (typeof game.global.dailyChallenge.minDamage !== "undefined") minFluct = (1 - dailyModifiers.minDamage.getMult(game.global.dailyChallenge.minDamage.strength));
		if (typeof game.global.dailyChallenge.maxDamage !== "undefined") maxFluct = dailyModifiers.maxDamage.getMult(game.global.dailyChallenge.maxDamage.strength);

		// Min damage reduced (additive)
		minDailyMod -= typeof game.global.dailyChallenge.minDamage !== 'undefined' ? dailyModifiers.minDamage.getMult(game.global.dailyChallenge.minDamage.strength) : 0;
		// Max damage increased (additive)
		maxDailyMod += typeof game.global.dailyChallenge.maxDamage !== 'undefined' ? dailyModifiers.maxDamage.getMult(game.global.dailyChallenge.maxDamage.strength) : 0;

		//Even-Odd Dailies
		attack *= typeof game.global.dailyChallenge.oddTrimpNerf !== 'undefined' && ((game.global.world % 2) == 1) ? dailyModifiers.oddTrimpNerf.getMult(game.global.dailyChallenge.oddTrimpNerf.strength) : 1;
		attack *= typeof game.global.dailyChallenge.evenTrimpBuff !== 'undefined' && ((game.global.world % 2) == 0) ? dailyModifiers.evenTrimpBuff.getMult(game.global.dailyChallenge.evenTrimpBuff.strength) : 1;

		attack *= maxDailyMod;
		attack *= minDailyMod;
	}

	// Equality
	if (game.global.universe === 2 && game.portal.Equality[perkLevel] > 0) {
		if (!isNaN(parseInt((equality)))) {
			if (equality > game.portal.Equality[perkLevel])
				debug('You don\'t have this many levels in Equality. - Player Dmg. ' + equality + " equality used.")
			attack *= Math.pow(game.portal.Equality.getModifier(1), equality)
		} else if (isNaN(parseInt((equality)))) {
			if (getPageSetting('equalityCalc') == 1 && getPageSetting('equalityManagement') === 1 && !equality)
				attack *= Math.pow(game.portal.Equality.getModifier(1), game.portal.Equality.scalingCount);
			else if (getPageSetting('equalityCalc') == 0 && !equality)
				attack *= game.portal.Equality.getMult(1);
			else
				attack *= game.portal.Equality.getMult(1);
		}
	}

	//Init Damage Variation (Crit)
	var min = attack * getCritMulti(false, (critMode) ? critMode : "never");
	var avg = attack * getCritMulti(false, (critMode) ? critMode : "maybe");
	var max = attack * getCritMulti(false, (critMode) ? critMode : "force");

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
	var base = (what == "attack") ? calcEnemyBaseAttack(game.global.world, cell, enemy, "world") : 2 * calcEnemyBaseHealth("world", game.global.world, cell, enemy);
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
	if (challengeActive('Domination') && cell != 100) base /= (what == "attack") ? 25 : 75;

	return base;
}

function badGuyChallengeMult() {
	var number = 1;

	//WARNING! Something is afoot!
	//A few challenges
	if (challengeActive('Meditate')) number *= 1.5;
	else if (challengeActive('Watch')) number *= 1.25;
	else if (challengeActive('Corrupted')) number *= 3;
	else if (challengeActive('Domination')) number *= 2.5;
	else if (challengeActive('Coordinate')) number *= getBadCoordLevel();
	else if (challengeActive('Scientist') && getScientistLevel() == 5) number *= 10;
	else if (challengeActive('Experience')) number *= game.challenges.Experience.getEnemyMult();

	//Obliterated and Eradicated
	else if (challengeActive('Obliterated') || challengeActive('Eradicated')) {
		var oblitMult = (challengeActive('Eradicated')) ? game.challenges.Eradicated.scaleModifier : 1e12;
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
	var crushed = challengeActive('Crushed');
	var critDaily = challengeActive('Daily') && typeof game.global.dailyChallenge.crits !== 'undefined';

	//Challenge multiplier
	if (critDaily) challenge = dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
	else if (crushed && health > block) challenge = 5;

	//Result -- Yep. Crits may crit! Yey!
	if (critPower == 2) return regular * challenge;
	else return Math.max(regular, challenge);
}

function calcCorruptionScale(zone, base) {
	var startPoint = (challengeActive('Corrupted') || challengeActive('Eradicated')) ? 1 : 150;
	var scales = Math.floor((zone - startPoint) / 6);
	var realValue = base * Math.pow(1.05, scales);
	return parseFloat(prettify(realValue));
}

function calcEnemyBaseAttack(zone, cell, name, type, query) {
	//Pre-Init
	if (!type) type = !game.global.mapsActive ? "world" : getCurrentMapObject().location == "Void" ? "void" : "map";
	if (!zone) zone = type == "world" || !game.global.mapsActive ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = type == "world" || !game.global.mapsActive ? getCurrentWorldCell().level : getCurrentMapCell() ? getCurrentMapCell().level : 1;
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : "Snimp";
	if (!query) query = false;
	var mapGrid = type === "world" ? "gridArray" : "mapGridArray";

	if (!query && game.global.universe === 2 && zone >= 200 && cell !== 100 && type === "world" && game.global[mapGrid][cell].u2Mutation) {
		if (cell !== 100 && type === "world" && game.global[mapGrid][cell].u2Mutation) {
			attack = u2Mutations.getAttack(game.global[mapGrid][cell - 1]);
			return attack;
		}
	}

	//Init
	var attackBase = game.global.universe == 2 ? 750 : 50;
	var attack = attackBase * Math.sqrt(zone) * Math.pow(3.27, zone / 2) - 10;

	//Zone 1
	if (zone == 1) {
		attack *= 0.35;
		attack = 0.2 * attack + 0.75 * attack * (cell / 100);
	}

	//Zone 2
	else if (zone == 2) {
		attack *= 0.5;
		attack = 0.32 * attack + 0.68 * attack * (cell / 100);
	}

	//Before Breaking the Planet
	else if (zone < 60) {
		attack = 0.375 * attack + 0.7 * attack * (cell / 100);
	}

	//After Breaking the Planet
	else {
		attack = 0.4 * attack + 0.9 * attack * (cell / 100);
		attack *= Math.pow(1.15, zone - 59);
	}

	//Flat Attack reduction for before Z60.
	if (zone < 60) {
		attack *= 0.85;
	}

	//Maps
	if (zone > 6 && type != "world") attack *= 1.1;

	//Specific Imp
	if (name) attack *= game.badGuys[name].attack;

	//U2
	if (game.global.universe == 2) {
		var part1 = zone > 40 ? 40 : zone;
		var part2 = zone > 60 ? 20 : zone - 40;
		var part3 = zone - 60;
		var part4 = (zone - 300);
		if (part2 < 0) part2 = 0;
		if (part3 < 0) part3 = 0;
		if (part4 < 0) part4 = 0;
		attack *= Math.pow(1.5, part1);
		attack *= Math.pow(1.4, part2);
		attack *= Math.pow(1.32, part3);
		attack *= Math.pow(1.15, part4);
	}
	return Math.floor(attack);
}

function calcEnemyAttackCore(type, zone, cell, name, minOrMax, customAttack, equality, checkMutations) {
	//Pre-Init
	if (!type) type = (!game.global.mapsActive) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	if (!zone) zone = (type == "world" || !game.global.mapsActive) ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = (type == "world" || !game.global.mapsActive) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : "Snimp";
	if (!minOrMax) minOrMax = false;

	//Init
	var attack = calcEnemyBaseAttack(zone, cell, name, type);
	var fluctuation = game.global.universe === 2 ? 0.5 : 0.2;
	if (game.global.universe === 1) {
		//Spire - Overrides the base attack number
		if (type == "world" && game.global.spireActive) attack = calcSpire("attack");

		//Map and Void Corruption
		if (type != "world") {
			//Corruption
			var corruptionScale = calcCorruptionScale(game.global.world, 3);
			if (mutations.Magma.active()) attack *= corruptionScale / (type == "void" ? 1 : 2);
			else if (type == "void" && mutations.Corruption.active()) attack *= corruptionScale / 2;
		}
	}

	//Curr zone Mutation Attack
	if (game.global.universe === 2 && type === 'world' && game.global.world > 200) {
		if (game.global.gridArray[cell - 1].u2Mutation && game.global.gridArray[cell - 1].u2Mutation.length !== 0) {
			attack = mutationBaseAttack(cell - 1, zone)
		}
	}

	//Use custom values instead
	if (customAttack) attack = customAttack;

	//WARNING! Check every challenge!
	//A few challenges
	if (challengeActive('Meditate')) attack *= 1.5;
	else if (challengeActive('Watch')) attack *= 1.25;
	else if (challengeActive('Corrupted')) attack *= 3;
	else if (challengeActive('Scientist') && getScientistLevel() == 5) attack *= 10;
	else if (challengeActive('Experience')) attack *= game.challenges.Experience.getEnemyMult();
	else if (challengeActive('Frigid')) attack *= game.challenges.Frigid.getEnemyMult();

	//u2 challenges
	else if (challengeActive('Unbalance')) attack *= 1.5;
	else if (challengeActive('Duel') && game.challenges.Duel.trimpStacks < 50) attack *= 3;
	else if (challengeActive('Wither') && game.challenges.Wither.enemyStacks > 0) attack *= game.challenges.Wither.getEnemyAttackMult();
	else if (challengeActive('Archaeology')) attack *= game.challenges.Archaeology.getStatMult('enemyAttack');
	else if (challengeActive('Mayhem')) {
		if (type === 'world') attack *= game.challenges.Mayhem.getBossMult();
		attack *= game.challenges.Mayhem.getEnemyMult();
	}
	//Purposefully don't put Storm in here.
	else if (challengeActive('Storm') && !game.global.mapsActive) attack *= game.challenges.Storm.getAttackMult();
	else if (challengeActive('Exterminate')) attack *= game.challenges.Exterminate.getSwarmMult();
	else if (challengeActive('Nurture')) {
		attack *= 2;
		attack *= game.buildings.Laboratory.getEnemyMult();
	}
	else if (challengeActive('Pandemonium') && type === 'world') attack *= game.challenges.Pandemonium.getBossMult();
	else if (challengeActive('Pandemonium') && type !== 'world') attack *= game.challenges.Pandemonium.getPandMult();
	else if (challengeActive('Desolation')) attack *= game.challenges.Desolation.getEnemyMult();
	else if (challengeActive('Alchemy')) attack *= (alchObj.getEnemyStats(type !== 'world', type === 'void')) + 1;
	else if (challengeActive('Hypothermia')) attack *= game.challenges.Hypothermia.getEnemyMult();
	else if (challengeActive('Glass')) attack *= game.challenges.Glass.attackMult();

	if (type === 'world' && game.global.novaMutStacks > 0) attack *= u2Mutations.types.Nova.enemyAttackMult();

	//Coordinate
	if (challengeActive('Coordinate')) {
		var amt = 1;
		for (var i = 1; i < zone; i++) amt = Math.ceil(amt * 1.25);
		attack *= amt;
	}

	//Dailies
	if (challengeActive('Daily')) {
		//Bad Strength
		if (typeof game.global.dailyChallenge.badStrength !== 'undefined')
			attack *= dailyModifiers.badStrength.getMult(game.global.dailyChallenge.badStrength.strength);

		//Bad Map Strength
		if (typeof game.global.dailyChallenge.badMapStrength !== 'undefined' && type !== 'world')
			attack *= dailyModifiers.badMapStrength.getMult(game.global.dailyChallenge.badMapStrength.strength);

		//Bloodthirsty
		if (typeof game.global.dailyChallenge.bloodthirst !== 'undefined')
			attack *= dailyModifiers.bloodthirst.getMult(game.global.dailyChallenge.bloodthirst.strength, game.global.dailyChallenge.bloodthirst.stacks);

		//Empower
		if (typeof game.global.dailyChallenge.empower !== 'undefined' && type === 'world')
			attack *= dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks);

		//Empower voids
		if (typeof game.global.dailyChallenge.empoweredVoid !== 'undefined' && type === 'void')
			attack *= dailyModifiers.empoweredVoid.getMult(game.global.dailyChallenge.empoweredVoid.strength);
	}

	//Obliterated and Eradicated
	else if (challengeActive('Obliterated') || challengeActive('Eradicated')) {
		var oblitMult = (challengeActive('Eradicated')) ? game.challenges.Eradicated.scaleModifier : 1e12;
		var zoneModifier = Math.floor(game.global.world / game.challenges[game.global.challengeActive].zoneScaleFreq);
		oblitMult *= Math.pow(game.challenges[game.global.challengeActive].zoneScaling, zoneModifier);
		attack *= oblitMult;
	}

	if (game.global.universe === 2 && equality) {
		if (!isNaN(parseInt((equality)))) {
			if (equality > game.portal.Equality.radLevel)
				debug('You don\'t have this many levels in Equality. - Enemy Dmg')
			attack *= Math.pow(game.portal.Equality.getModifier(), equality);
		} else {
			attack *= game.portal.Equality.radLevel > 0 && getPageSetting('equalityCalc') == 0 && !equality ? game.portal.Equality.getMult() : 1;
			attack *= game.portal.Equality.radLevel > 0 && getPageSetting('equalityCalc') >= 1 && game.portal.Equality.scalingCount > 0 && !equality ? Math.pow(game.portal.Equality.modifier, game.portal.Equality.scalingCount) : 1;
		}
	}

	return minOrMax ? (1 - fluctuation) * attack : (1 + fluctuation) * attack;
}

function calcEnemyAttack(type, zone, cell = 99, name = "Snimp", minOrMax) {
	//Init
	var attack = calcEnemyAttackCore(type, zone, cell, name, minOrMax);
	var corrupt = zone >= mutations.Corruption.start();
	var healthy = mutations.Healthy.active();

	//Challenges
	if (challengeActive('Balance')) attack *= (type == "world") ? 1.17 : 2.35;
	else if (challengeActive('Life')) attack *= 6;
	else if (challengeActive('Toxicity')) attack *= 5;
	else if (challengeActive('Lead')) attack *= (zone % 2 == 0) ? 5.08 : (1 + 0.04 * game.challenges.Lead.stacks);
	else if (challengeActive('Domination')) attack *= 2.5;

	//Dailies
	else if (challengeActive('Daily')) {
		//Crits
		if (typeof game.global.dailyChallenge.crits !== "undefined")
			attack *= 0.75 + 0.25 * dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
	}

	//Magneto Shriek during Domination
	if (challengeActive('Domination') && game.global.usingShriek)
		attack *= game.mapUnlocks.roboTrimp.getShriekValue();

	//Void Map Difficulty (implicit 100% difficulty on regular maps)
	if (type == "void") attack *= (zone >= 60) ? 4.5 : 2.5;


	if (type == "world" && corrupt && !game.global.spireActive) {
		if (healthy) attack *= calcCorruptionScale(zone, 5);
		else if (corrupt) attack *= calcCorruptionScale(zone, 3);
	}

	//Ice - Experimental
	if (getEmpowerment() == "Ice" && getPageSetting('fullice')) {
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
	var attack = calcEnemyAttackCore();
	attack *= badGuyCritMult(enemy, critPower, customBlock, customHealth);

	//Challenges - considers the actual scenario for this enemy
	if (challengeActive('Nom') && typeof enemy.nomStacks !== 'undefined') attack *= Math.pow(1.25, enemy.nomStacks)
	if (challengeActive('Lead')) attack *= 1 + (0.04 * game.challenges.Lead.stacks);

	//Magneto Shriek
	if (game.global.usingShriek) attack *= game.mapUnlocks.roboTrimp.getShriekValue();

	//Ice
	if (getEmpowerment() == "Ice") attack *= game.empowerments.Ice.getCombatModifier();

	return Math.ceil(attack);
}

function calcEnemyBaseHealth(mapType, zone, cell, name) {
	//Pre-Init
	if (!mapType) mapType = (!game.global.mapsActive) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	if (!zone) zone = (mapType == "world" || !game.global.mapsActive) ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = (mapType == "world" || !game.global.mapsActive) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : "Turtlimp";

	//Init
	var base = (game.global.universe == 2) ? 10e7 : 130;
	var health = (base * Math.sqrt(zone) * Math.pow(3.265, zone / 2)) - 110;

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
	}

	//After Breaking the Planet
	else {
		health = (health * 0.5) + ((health * 0.8) * (cell / 100));
		health *= Math.pow(1.1, zone - 59);
	}

	//Flat HP reduction for before Z60.
	if (zone < 60) {
		health *= 0.75;
	}

	//Maps
	if (zone > 5 && mapType != "world") health *= 1.1;

	//U2 Settings
	if (game.global.universe == 2) {
		var part1 = (zone > 60) ? 60 : zone;
		var part2 = (zone - 60);
		var part3 = (zone - 300);
		if (part2 < 0) part2 = 0;
		if (part3 < 0) part3 = 0;
		health *= Math.pow(1.4, part1);
		health *= Math.pow(1.32, part2);
		health *= Math.pow(1.15, part3);
	}
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

	//Curr zone Mutation HP
	if (game.global.universe === 2 && type === 'world' && game.global.world > 200) {
		if (game.global.gridArray[cell - 1].u2Mutation && game.global.gridArray[cell - 1].u2Mutation.length !== 0) {
			health = mutationBaseHealth(cell - 1, zone)
		}
	}

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
	//U1
	health *= challengeActive('Balance') ? 2 : 1;
	health *= challengeActive('Meditate') ? 2 : 1;
	health *= challengeActive('Toxicity') ? 2 : 1;
	health *= challengeActive('Life') ? 10 : 1;
	health *= challengeActive('Experience') ? game.challenges.Experience.getEnemyMult() : 1;
	if (challengeActive('Frigid')) health *= game.challenges.Frigid.getEnemyMult();
	if (challengeActive('Coordinate')) {
		var amt = 1;
		for (var i = 1; i < zone; i++) amt = Math.ceil(amt * 1.25);
		health *= amt;
	}

	//U2
	health *= challengeActive('Unbalance') && type !== 'world' ? 2 : challengeActive('Unbalance') ? 3 : 1;
	//health *= challengeActive('Duel') && game.challenges.Duel.enemyStacks < 20 ? game.challenges.Duel.healthMult : 1;
	health *= challengeActive('Quest') ? game.challenges.Quest.getHealthMult() : 1;
	health *= challengeActive('Revenge') && game.global.world % 2 == 0 ? 10 : 1;

	if (challengeActive('Mayhem')) {
		if (type === 'world') health *= game.challenges.Mayhem.getBossMult();
		health *= game.challenges.Mayhem.getEnemyMult();
	}
	health *= challengeActive('Storm') && type === 'world' ? game.challenges.Storm.getHealthMult() : 1;
	//health *= challengeActive('Berserk') ? 1.5 : 1;
	health *= challengeActive('Exterminate') ? game.challenges.Exterminate.getSwarmMult() : 1;
	if (challengeActive('Nurture')) {
		health *= type === 'world' ? 2 : 10;
		health *= game.buildings.Laboratory.owned > 0 ? game.buildings.Laboratory.getEnemyMult() : 1;
	}
	if (challengeActive('Pandemonium')) health *= type === 'world' ? game.challenges.Pandemonium.getBossMult() : type !== 'world' ? game.challenges.Pandemonium.getPandMult() : 1;
	if (challengeActive('Desolation')) health *= game.challenges.Desolation.getEnemyMult();
	health *= challengeActive('Alchemy') ? ((alchObj.getEnemyStats(false, false)) + 1) : 1;
	health *= challengeActive('Hypothermia') ? game.challenges.Hypothermia.getEnemyMult() : 1;
	health *= challengeActive('Glass') ? game.challenges.Glass.healthMult() : 1;

	//Dailies
	if (challengeActive('Daily')) {
		//Empower
		health *= typeof game.global.dailyChallenge.empower !== 'undefined' && type === 'world' ? dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks) : 1;
		//Bad Health
		health *= typeof game.global.dailyChallenge.badHealth !== 'undefined' ? dailyModifiers.badHealth.getMult(game.global.dailyChallenge.badHealth.strength, game.global.dailyChallenge.badHealth.stacks) : 1;
		//Bad Map Health
		health *= typeof game.global.dailyChallenge.badMapHealth !== 'undefined' && type !== 'world' ? dailyModifiers.badMapHealth.getMult(game.global.dailyChallenge.badMapHealth.strength, game.global.dailyChallenge.badMapHealth.stacks) : 1;
		//Empower voids
		if (typeof game.global.dailyChallenge.empoweredVoid !== 'undefined' && type === 'void')
			health *= dailyModifiers.empoweredVoid.getMult(game.global.dailyChallenge.empoweredVoid.strength);
	}

	//Obliterated + Eradicated
	if (challengeActive('Obliterated') || challengeActive('Eradicated')) {
		var oblitMult = (challengeActive('Eradicated')) ? game.challenges.Eradicated.scaleModifier : 1e12;
		var zoneModifier = Math.floor(game.global.world / game.challenges[game.global.challengeActive].zoneScaleFreq);
		oblitMult *= Math.pow(game.challenges[game.global.challengeActive].zoneScaling, zoneModifier);
		health *= oblitMult;
	}

	return health;
}

function calcEnemyHealth(type, zone, cell = 99, name = "Turtlimp", customHealth) {
	//Init
	var health = calcEnemyHealthCore(type, zone, cell, name, customHealth);
	var corrupt = zone >= mutations.Corruption.start();
	var healthy = mutations.Healthy.active();

	//Challenges - worst case for Lead and Domination
	if (challengeActive('Domination')) health *= 7.5;
	if (challengeActive('Lead')) health *= (zone % 2 == 0) ? 5.08 : (1 + 0.04 * game.challenges.Lead.stacks);

	//Void Map Difficulty (implicit 100% difficulty on regular maps)
	if (type == "void") health *= (game.global.universe === 2 || zone >= 60) ? 4.5 : 2.5;

	if (type == "world" && corrupt && !game.global.spireActive) {
		if (healthy) health *= calcCorruptionScale(zone, 14);
		else if (corrupt) health *= calcCorruptionScale(zone, 10);
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
	if (challengeActive('Lead')) health *= 1 + (0.04 * game.challenges.Lead.stacks);
	if (challengeActive('Domination')) {
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
	if (!targetZone) targetZone = game.global.world;
	if (!type) type = "world"
	//Init
	if (type === 'world') {
		var enemyName = 'Turtlimp';
		var cell = 99;
		if (challengeActive('Mayhem') || challengeActive('Pandemonium')) {
			enemyName = 'Improbability';
			cell = 100;
		}
		var mutationsActive = game.global.universe === 2 && game.global.world > 200;
		var enemyHealth = calcEnemyHealth(type, targetZone, cell, enemyName, (mutationsActive ? calcMutationHealth(game.global.world) : null));
		var universeSetting = game.global.universe === 2 ? equalityQuery(enemyName, targetZone, cell, 'world', 1, 'gamma') : 'X';
	}
	if (type === 'map') {
		var enemyHealth = calcEnemyHealth(type, targetZone);
		var universeSetting = game.global.universe === 2 ? equalityQuery('Snimp', targetZone, 20, 'map', 0.75, 'gamma', true) : 'X';
	}
	if (type === 'void') {
		var enemyHealth = calcEnemyHealth(type, targetZone, 100, 'Cthulimp');
		var universeSetting = game.global.universe === 2 ? equalityQuery('Cthulimp', targetZone, 100, 'void', 4, 'gamma') : 'X';
	}

	var gammaBurstDmg = getPageSetting('gammaBurstCalc') ? gammaBurstPct : 1;
	var runningUnlucky = challengeActive('Unlucky');
	var ourBaseDamage = calcOurDmg(runningUnlucky ? 'max' : 'avg', universeSetting, false, type, 'maybe', targetZone - game.global.world);

	//Lead Challenge
	if (challengeActive('Lead') && targetZone % 2 == 1 && type != "map") {
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

	//Adding gammaBurstDmg to calc
	if (type !== 'map' && (game.global.universe === 2 && universeSetting < (game.portal.Equality.radLevel - 14)) || game.global.universe === 1)
		ourBaseDamage *= gammaBurstDmg

	//Return H:D for a regular, sane, not f-ing Lead zone (sorry, Lead just took a lot of me)
	return enemyHealth / (ourBaseDamage + addPoison());
}

function calcCurrentStance() {
	if (game.global.uberNature == "Wind" && getEmpowerment() == "Wind" && !game.global.mapsActive &&
		(
			((!challengeActive('Daily') && HDratio < getPageSetting('WindStackingMinHD'))
				|| (challengeActive('Daily') && HDRatio < getPageSetting('dWindStackingMinHD')))
			&&
			((!challengeActive('Daily') && game.global.world >= getPageSetting('WindStackingMin'))
				|| (challengeActive('Daily') && game.global.world >= getPageSetting('dWindStackingMin')))
		)
		|| (game.global.uberNature == "Wind" && getEmpowerment() == "Wind" && !game.global.mapsActive && checkIfLiquidZone() && getPageSetting('liqstack') == true))
		return 15;
}

//Radon
function mutationBaseAttack(cell, targetZone) {
	if (!targetZone) targetZone = game.global.world;

	var baseAttack;
	var addAttack = 0;
	cell = game.global.gridArray[cell];
	if (cell.cs) {
		baseAttack = calcEnemyBaseAttack(targetZone, cell.cs, cell.name, 'world', true);
	} else {
		baseAttack = calcEnemyBaseAttack(targetZone, cell.level, cell.name, 'world', true);
	}
	if (cell.cc) addAttack = u2Mutations.types.Compression.attack(cell, baseAttack);
	if (cell.u2Mutation.indexOf('NVA') != -1) baseAttack *= 0.01;
	else if (cell.u2Mutation.indexOf('NVX') != -1) baseAttack *= 10;
	baseAttack += addAttack;
	baseAttack *= Math.pow(1.01, (targetZone - 201));
	return baseAttack;
}

function calcMutationAttack(targetZone) {
	if (targetZone < 201) return;
	if (!targetZone) targetZone = game.global.world;
	var attack;
	var highest = 1;
	var worstCell = 0;
	var gridArray = game.global.gridArray

	for (var i = 0; i < gridArray.length; i++) {
		var hasRage = gridArray[i].u2Mutation.includes('RGE');
		if (gridArray[i].u2Mutation.includes('CMP') && !gridArray[i].u2Mutation.includes('RGE')) {
			for (var y = i + 1; y < i + u2Mutations.types.Compression.cellCount(); y++) {
				if (gridArray[y].u2Mutation.includes('RGE')) {
					hasRage = true;
					break;
				}
			}
		}
		var cell = i;
		if (gridArray[cell].u2Mutation && gridArray[cell].u2Mutation.length) {
			if (mutationBaseAttack(cell, targetZone) > highest) worstCell = i;
			highest = Math.max(mutationBaseAttack(cell, targetZone) * (hasRage ? (u2Mutations.tree.Unrage.purchased ? 4 : 5) : 1), highest);
			attack = highest;
		}
	}

	return attack;
}

function mutationBaseHealth(cell, targetZone) {
	var baseHealth;
	var addHealth = 0;
	var cell = game.global.gridArray[cell];

	baseHealth = calcEnemyBaseHealth('world', targetZone, cell.level, cell.name);

	if (cell.cc) addHealth = u2Mutations.types.Compression.health(cell, baseHealth);
	if (cell.u2Mutation.indexOf('NVA') != -1) baseHealth *= 0.01;
	else if (cell.u2Mutation.indexOf('NVX') != -1) baseHealth *= 0.1;
	baseHealth += addHealth;
	baseHealth *= 2;
	baseHealth *= Math.pow(1.02, (targetZone - 201));
	return baseHealth;
}

function calcMutationHealth(targetZone) {
	if (!targetZone) targetZone = game.global.world;

	var highest = 1;
	var worstCell = 0;
	var gridArray = game.global.gridArray
	for (var i = 0; i < game.global.gridArray.length; i++) {
		var cell = i;
		if (gridArray[cell].u2Mutation && gridArray[cell].u2Mutation.length) {
			if (mutationBaseHealth(cell, targetZone) > highest) worstCell = i;
			highest = Math.max(mutationBaseHealth(cell, targetZone), highest);
			mute = true;
			var health = highest;
		}
	}
	return health;
}

function totalDamageMod() {
	dmg = 1;
	dmg *= challengeActive('Duel') && game.challenges.Duel.trimpStacks < 50 ? 3 : 1;
	dmg *= challengeActive('Wither') && game.challenges.Wither.enemyStacks > 0 ? game.challenges.Wither.getEnemyAttackMult() : 1;
	dmg *= challengeActive('Archaeology') ? game.challenges.Archaeology.getStatMult('enemyAttack') : 1;
	dmg *= challengeActive('Mayhem') && !game.global.mapsActive && !game.global.preMapsActive && game.global.lastClearedCell + 2 == 100 ? game.challenges.Mayhem.getBossMult() : 1;
	dmg *= challengeActive('Mayhem') ? game.challenges.Mayhem.getEnemyMult() : 1;
	dmg *= challengeActive('Storm') && !game.global.mapsActive ? game.challenges.Storm.getAttackMult() : 1;
	dmg *= challengeActive('Nurture') ? 2 : 1;
	dmg *= challengeActive('Nurture') && game.buildings.Laboratory.owned > 0 ? game.buildings.Laboratory.getEnemyMult() : 1;
	dmg *= challengeActive('Pandemonium') && !game.global.mapsActive && game.global.lastClearedCell + 2 == 100 ? game.challenges.Pandemonium.getBossMult() : 1;
	dmg *= challengeActive('Pandemonium') && !(!game.global.mapsActive && game.global.lastClearedCell + 2 == 100) ? game.challenges.Pandemonium.getPandMult() : 1;
	dmg *= challengeActive('Glass') ? game.challenges.Glass.attackMult() : 1;
	if (challengeActive('Daily')) {
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

function getTotalHealthMod() {
	var healthMulti = 1;
	const perkLevel = game.global.universe === 2 ? 'radLevel' : 'level';
	//Smithies
	healthMulti *= game.buildings.Smithy.owned > 0 ? game.buildings.Smithy.getMult() : 1;
	//Antenna Array
	healthMulti *= game.global.universe === 2 && game.buildings.Antenna.owned >= 10 ? game.jobs.Meteorologist.getExtraMult() : 1;
	//Toughness add
	healthMulti *= game.portal.Toughness[perkLevel] > 0 ? 1 + (game.portal.Toughness[perkLevel] * game.portal.Toughness.modifier) : 1;
	//Resilience
	healthMulti *= game.portal.Resilience[perkLevel] > 0 ? Math.pow(game.portal.Resilience.modifier + 1, game.portal.Resilience[perkLevel]) : 1;
	//Scruffy is Life
	healthMulti *= Fluffy.isRewardActive('healthy') ? 1.5 : 1;
	//Observation
	healthMulti *= game.portal.Observation[perkLevel] > 0 ? game.portal.Observation.getMult() : 1;
	//Mayhem Completions
	healthMulti *= game.global.mayhemCompletions > 0 ? game.challenges.Mayhem.getTrimpMult() : 1;
	//Pandemonium Completions
	healthMulti *= game.global.pandCompletions > 0 ? game.challenges.Pandemonium.getTrimpMult() : 1;
	//Desolation Completions
	healthMulti *= game.global.frigidCompletions > 0 && game.global.universe === 1 ? game.challenges.Frigid.getTrimpMult() : 1;
	healthMulti *= game.global.desoCompletions > 0 ? game.challenges.Desolation.getTrimpMult() : 1;
	healthMulti *= challengeActive('Desolation') ? game.challenges.Desolation.trimpHealthMult() : 1;
	healthMulti *= game.global.universe === 2 && u2Mutations.tree.GeneHealth.purchased ? 10 : 1;
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
	healthMulti *= challengeActive('Revenge') && game.challenges.Revenge.stacks > 0 ? game.challenges.Revenge.getMult() : 1;
	healthMulti *= challengeActive('Wither') && game.challenges.Wither.trimpStacks > 0 ? game.challenges.Wither.getTrimpHealthMult() : 1;
	healthMulti *= challengeActive('Insanity') ? game.challenges.Insanity.getHealthMult() : 1;
	healthMulti *= challengeActive('Berserk') && game.challenges.Berserk.frenzyStacks > 0 ? game.challenges.Berserk.getHealthMult() : 1;
	healthMulti *= challengeActive('Berserk') && game.challenges.Berserk.frenzyStacks <= 0 ? game.challenges.Berserk.getHealthMult(true) : 1;
	healthMulti *= game.challenges.Nurture.boostsActive() ? game.challenges.Nurture.getStatBoost() : 1;
	healthMulti *= challengeActive('Alchemy') ? alchObj.getPotionEffect("Potion of Strength") : 1;
	healthMulti *= challengeActive('Smithless') && game.challenges.Smithless.fakeSmithies > 0 ? Math.pow(1.25, game.challenges.Smithless.fakeSmithies) : 1;
	// Daily mod
	healthMulti *= typeof game.global.dailyChallenge.pressure !== 'undefined' ? dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks) : 1;
	// Prismatic
	healthMulti *= 1 + getEnergyShieldMult();
	// Shield layer
	healthMulti *= (Fluffy.isRewardActive('shieldlayer') ? 1 + Fluffy.isRewardActive('shieldlayer') : 1);
	return healthMulti;
}

function gammaMaxStacks(specialChall) {
	var gammaMaxStacks = 5
	if (autoBattle.oneTimers.Burstier.owned) gammaMaxStacks--;
	if (Fluffy.isRewardActive("scruffBurst")) gammaMaxStacks--;

	if (gammaBurstPct === 1 || (specialChall && game.global.mapsActive)) gammaMaxStacks = Infinity;
	return gammaMaxStacks;
}


function simpleSecondsLocal(what, seconds, event, workerRatio) {
	var event = !event ? null : event;
	var workerRatio = !workerRatio ? null : workerRatio;

	if (typeof workerRatio !== 'undefined' && workerRatio !== null) {
		var desiredRatios = Array.from(workerRatio.split(','))
		desiredRatios = [desiredRatios[0] !== undefined ? Number(desiredRatios[0]) : 0,
		desiredRatios[1] !== undefined ? Number(desiredRatios[1]) : 0,
		desiredRatios[2] !== undefined ? Number(desiredRatios[2]) : 0,
		desiredRatios[3] !== undefined ? Number(desiredRatios[3]) : 0]
		var totalFraction = desiredRatios.reduce((a, b) => { return a + b; });
	}

	//Come home to the impossible flavour of balanced resource gain. Come home, to simple seconds.
	var jobName;
	var pos;
	switch (what) {
		case "food":
			jobName = "Farmer";
			pos = 0
			break;
		case "wood":
			jobName = "Lumberjack";
			pos = 1
			break;
		case "metal":
			jobName = "Miner";
			pos = 2
			break;
		case "gems":
			jobName = "Dragimp";
			break;
		case "fragments":
			jobName = "Explorer";
			break;
		case "science":
			jobName = "Scientist";
			pos = 3
			break;
	}
	var heirloom = !jobName ? null :
		jobName == "Miner" && challengeActive('Pandemonium') && getPageSetting("pandemoniumStaff") !== 'undefined' ? "pandemoniumStaff" :
			jobName == "Farmer" && getPageSetting('heirloomStaffFood') != 'undefined' ? ('heirloomStaffFood') :
				jobName == "Lumberjack" && getPageSetting('heirloomStaffWood') != 'undefined' ? ('heirloomStaffWood') :
					jobName == "Miner" && getPageSetting('heirloomStaffMetal') != 'undefined' ? ('heirloomStaffMetal') :
						getPageSetting('heirloomStaffMap') != 'undefined' ? ('heirloomStaffMap') :
							getPageSetting('heirloomStaffWorld') != 'undefined' ? ('heirloomStaffWorld') :
								null;
	var job = game.jobs[jobName];
	var trimpworkers = ((game.resources.trimps.realMax() / 2) - game.jobs.Explorer.owned - game.jobs.Meteorologist.owned - game.jobs.Worshipper.owned);
	if (challengeActive('Trappapalooza')) trimpworkers = game.resources.trimps.owned;
	var workers = workerRatio !== null ? Math.floor(trimpworkers * desiredRatios[pos] / totalFraction) :
		currentMap === 'Worshipper Farm' ? trimpworkers :
			job.owned;

	var amt = workers * job.modifier * seconds;
	amt += (amt * getPerkLevel("Motivation") * game.portal.Motivation.modifier);
	if (what != "gems" && game.permaBoneBonuses.multitasking.owned > 0)
		amt *= (1 + game.permaBoneBonuses.multitasking.mult());
	if (what != "science" && what != "fragments" && challengeActive('Alchemy'))
		amt *= alchObj.getPotionEffect("Potion of Finding");
	if (challengeActive("Frigid"))
		amt *= game.challenges.Frigid.getShatteredMult();
	if (game.global.pandCompletions && game.global.universe == 2 && what != "fragments")
		amt *= game.challenges.Pandemonium.getTrimpMult();
	if (game.global.desoCompletions && game.global.universe == 2 && what != "fragments")
		amt *= game.challenges.Desolation.getTrimpMult();
	if (getPerkLevel("Observation") > 0 && game.portal.Observation.trinkets > 0)
		amt *= game.portal.Observation.getMult();

	if (what == "food" || what == "wood" || what == "metal") {
		if (workerRatio) {
			amt *= calculateParityBonusAT(desiredRatios, HeirloomSearch(heirloom));
		}
		else amt *= getParityBonus();
		if (autoBattle.oneTimers.Gathermate.owned)
			amt *= autoBattle.oneTimers.Gathermate.getMult();
	}
	if (((what == "food" || (what == "wood")) && game.buildings.Antenna.owned >= 5) || (what == "metal" && game.buildings.Antenna.owned >= 15))
		amt *= game.jobs.Meteorologist.getExtraMult();
	if (Fluffy.isRewardActive('gatherer'))
		amt *= 2;
	if (what == "wood" && challengeActive('Hypothermia') && game.challenges.Hypothermia.bonfires > 0)
		amt *= game.challenges.Hypothermia.getWoodMult();
	if (challengeActive('Unbalance'))
		amt *= game.challenges.Unbalance.getGatherMult();

	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.famine !== 'undefined' && what != "fragments" && what != "science")
			amt *= dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
		if (typeof game.global.dailyChallenge.dedication !== 'undefined')
			amt *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
	}
	if (challengeActive('Melt')) {
		amt *= 10;
		amt *= Math.pow(game.challenges.Melt.decayValue, game.challenges.Melt.stacks);
	}

	if (challengeActive('Desolation'))
		amt *= game.challenges.Desolation.trimpResourceMult();
	if (game.challenges.Nurture.boostsActive())
		amt *= game.challenges.Nurture.getResourceBoost();

	//Calculating heirloom bonus
	amt = calcHeirloomBonusLocal(HeirloomModSearch(heirloom, jobName + "Speed"), amt);

	var turkimpBonus = game.talents.turkimp2.purchased ? 2 : game.talents.turkimp2.purchased ? 1.75 : 1.5;

	if ((game.talents.turkimp2.purchased || game.global.turkimpTimer > 0) && (what == "food" || what == "metal" || what == "wood")) {
		amt *= turkimpBonus;
		amt += getPlayerModifier() * seconds;
	}
	return amt;
}

function scaleToCurrentMapLocal(amt, ignoreBonuses, ignoreScry, map) {
	if (map) map = game.global.world + map;
	if (!map) map = game.global.mapsActive ? getCurrentMapObject().level :
		challengeActive('Pandemonium') ? game.global.world - 1 :
			game.global.world;
	game.global.world + map;
	var compare = game.global.world;
	if (map > compare && map.location != "Bionic") {
		amt *= Math.pow(1.1, (map - compare));
	} else {
		if (game.talents.mapLoot.purchased)
			compare--;
		if (map < compare) {
			//-20% loot compounding for each level below world
			amt *= Math.pow(0.8, (compare - map));
		}
	}
	var maploot = game.global.farmlandsUnlocked && game.singleRunBonuses.goldMaps.owned ? 3.6 : game.global.decayDone && game.singleRunBonuses.goldMaps.owned ? 2.85 : game.global.farmlandsUnlocked ? 2.6 : game.global.decayDone ? 1.85 : 1.6;
	//Add map loot bonus
	amt = Math.round(amt * maploot);
	if (ignoreBonuses) return amt;
	amt = scaleLootBonuses(amt, ignoreScry);
	return amt;
}

function calculateParityBonusAT(workerRatio, heirloom) {
	if (!game.global.StaffEquipped || game.global.StaffEquipped.rarity < 10) {
		game.global.parityBonus = 1;
		return 1;
	}
	var allowed = ["Farmer", "Lumberjack", "Miner"];
	var totalWorkers = 0;
	var numWorkers = [];
	if (!workerRatio) {
		for (var x = 0; x < allowed.length; x++) {
			var thisWorkers = game.jobs[allowed[x]].owned;
			totalWorkers += thisWorkers;
			numWorkers[x] = thisWorkers;
		}
		var workerRatios = [];
		for (var x = 0; x < numWorkers.length; x++) {
			workerRatios.push(numWorkers[x] / totalWorkers);
		}
	} else {
		var freeWorkers = Math.ceil(Math.min(game.resources.trimps.realMax() / 2), game.resources.trimps.owned) - (game.resources.trimps.employed - game.jobs.Explorer.owned - game.jobs.Meteorologist.owned - game.jobs.Worshipper.owned);
		var workerRatios = workerRatio;
		var ratio = workerRatios.reduce((a, b) => a + b, 0)
		var freeWorkerDivided = freeWorkers / ratio;

		for (var x = 0; x < allowed.length; x++) {
			var thisWorkers = freeWorkerDivided * workerRatios[x];
			totalWorkers += thisWorkers;
			numWorkers[x] = thisWorkers;
		}
	}
	var resourcePop = totalWorkers;
	resourcePop = Math.log(resourcePop) / Math.log(3);
	var largestWorker = Math.log(Math.max(...numWorkers)) / Math.log(3);
	var spreadFactor = resourcePop - largestWorker;
	var preLoomBonus = (spreadFactor * spreadFactor);
	var finalWithParity = (1 + preLoomBonus) * getHazardParityMult(heirloom);
	game.global.parityBonus = finalWithParity;
	return finalWithParity;
}

function calcHeirloomBonusLocal(mod, number) {
	var mod = mod;
	if (challengeActive('Daily') && typeof game.global.dailyChallenge.heirlost !== 'undefined')
		mod *= dailyModifiers.heirlost.getMult(game.global.dailyChallenge.heirlost.strength);
	if (!mod) return;

	return (number * ((mod / 100) + 1));
}

function calculateMaxAffordLocal(itemObj, isBuilding, isEquipment, isJob, forceMax, forceRatio, resources) {
	if (!itemObj.cost) return 1;
	var forcedMax = 0;
	var mostAfford = -1;
	if (Number.isInteger(forceMax)) forcedMax = forceMax;
	//if (!forceMax) var forceMax = false;
	var forceMax = Number.isInteger(forceMax) ? forceMax : false;
	var currentOwned = (itemObj.purchased) ? itemObj.purchased : ((itemObj.level) ? itemObj.level : itemObj.owned);
	if (!currentOwned) currentOwned = 0;
	if (isJob && game.global.firing && !forceRatio) return Math.floor(currentOwned * game.global.maxSplit);
	//if (itemObj == game.equipment.Shield) console.log(currentOwned);
	for (var item in itemObj.cost) {
		var price = itemObj.cost[item];
		var toBuy;
		var resource = game.resources[item];
		var resourcesAvailable = !resources ? resource.owned : resources;
		if (resourcesAvailable < 0) resourcesAvailable = 0;
		if (game.global.maxSplit != 1 && !forceMax && !forceRatio) resourcesAvailable = Math.floor(resourcesAvailable * game.global.maxSplit);
		else if (forceRatio) resourcesAvailable = Math.floor(resourcesAvailable * forceRatio);

		if (item === 'fragments' && game.global.universe === 2) {
			var buildingSetting = getPageSetting('buildingSettingsArray');
			resourcesAvailable = buildingSetting.SafeGateway.zone !== 0 && game.global.world >= buildingSetting.SafeGateway.zone ? resourcesAvailable :
				buildingSetting.SafeGateway.enabled && resourcesAvailable > resource.owned - (perfectMapCost_Actual(10, 'lmc') * buildingSetting.SafeGateway.mapCount) ? resource.owned - (perfectMapCost_Actual(10, 'lmc') * buildingSetting.SafeGateway.mapCount) :
					resourcesAvailable;
		}
		if (!resource || typeof resourcesAvailable === 'undefined') {
			console.log("resource " + item + " not found");
			return 1;
		}
		if (typeof price[1] !== 'undefined') {
			var start = price[0];
			if (isEquipment) {
				var artMult = getEquipPriceMult();
				start = Math.ceil(start * artMult);
			}
			if (isBuilding && getPerkLevel("Resourceful")) start = start * (Math.pow(1 - game.portal.Resourceful.modifier, getPerkLevel("Resourceful")));
			toBuy = Math.floor(log10(((resourcesAvailable / (start * Math.pow(price[1], currentOwned))) * (price[1] - 1)) + 1) / log10(price[1]));

		}
		else if (typeof price === 'function') {
			return 1;
		}
		else {
			if (isBuilding && getPerkLevel("Resourceful")) price = Math.ceil(price * (Math.pow(1 - game.portal.Resourceful.modifier, getPerkLevel("Resourceful"))));
			toBuy = Math.floor(resourcesAvailable / price);
		}
		if (mostAfford == -1 || mostAfford > toBuy) mostAfford = toBuy;
	}
	if (forceRatio && (mostAfford <= 0 || isNaN(mostAfford))) return 0;
	if (isBuilding && mostAfford > 1000000000) return 1000000000;
	if (mostAfford <= 0) return 1;
	if (forceMax !== false && mostAfford > forceMax) return forceMax;
	if (isJob && itemObj.max && itemObj.owned + mostAfford > itemObj.max) return (itemObj.max - itemObj.owned);
	return mostAfford;
}