class TrimpStats {
	constructor(newZone) {
		this.isDaily = undefined;
		this.isC3 = undefined;
		this.isFiller = undefined;
		this.currChallenge = undefined;

		this.hze = undefined;
		this.hypPct = undefined;
		this.hyperspeed = undefined;

		//Mapping Data
		this.perfectMaps = undefined;
		this.mapSize = undefined;
		this.mapDifficulty = undefined;
		this.mountainPriority = undefined;

		const z = game.global.world;

		this.isDaily = challengeActive('Daily');
		this.isC3 = game.global.runningChallengeSquared || challengeActive('Frigid') || challengeActive('Experience') || challengeActive('Mayhem') || challengeActive('Pandemonium') || challengeActive('Desolation');
		this.isFiller = !this.isDaily && !this.isC3;
		this.currChallenge = game.global.challengeActive;

		this.hze = game.global.universe === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();
		this.hypPct = game.talents.liquification3.purchased ? 75 : game.talents.hyperspeed2.purchased ? 50 : 0;
		this.hyperspeed = game.global.world <= Math.floor(this.hze * (this.hypPct / 100));

		this.mapSize = game.talents.mapLoot2.purchased ? 20 : 25;
		this.mapDifficulty = 0.75;
		this.perfectMaps = game.global.universe === 2 ? game.stats.highestRadLevel.valueTotal() >= 30 : game.stats.highestLevel.valueTotal() >= 110;
		this.plusLevels = game.global.universe === 2 ? game.stats.highestRadLevel.valueTotal() >= 50 : game.stats.highestLevel.valueTotal() >= 210;

		this.mountainPriority = !(game.unlocks.imps.Chronoimp || game.unlocks.imps.Jestimp || getAvailableSpecials('lmc', true) === 'lmc' || getAvailableSpecials('lmc', true) === 'smc');
	}
}

class HDStats {
	constructor(newZone) {

		this.hdRatio = undefined;
		this.hdRatioMap = undefined;
		this.hdRatioVoid = undefined;

		this.hdRatioPlus = undefined;
		this.hdRatioMapPlus = undefined;
		this.hdRatioVoidPlus = undefined;

		this.vhdRatio = undefined;
		this.vhdRatioVoid = undefined;
		this.vhdRatioVoidPlus = undefined;
		this.hdRatioHeirloom = undefined;

		this.hitsSurvived = undefined;
		this.hitsSurvivedVoid = undefined;
		this.autoLevel = undefined;
		this.autoLevelInitial = hdStats.autoLevelInitial;
		this.autoLevelData = hdStats.autoLevelData;
		this.autoLevelDataFrag = hdStats.autoLevelDataFrag;
		this.autoLevelNew = undefined;
		this.autoLevelSpeed = undefined;

		const z = game.global.world;

		const checkAutoLevel = newZone ? true : usingRealTimeOffline ? atSettings.intervals.thirtySecond : atSettings.intervals.fiveSecond;

		var voidPercent = 4.5;
		if (game.global.world <= 59) {
			//-3 difficulty in U1, -2 difficulty in u2
			voidPercent -= 2;
			if (game.global.universe === 1) voidPercent /= 2;
		}
		else if (game.global.universe === 1 && game.global.world <= 199) {
			//u2 up to full difficulty, u1 at -1
			voidPercent -= 1;
		}
		if (challengeActive('Mapocalypse')) voidPercent += 3;

		//Calculating HD values for current zone.
		this.hdRatio = calcHDRatio(z, 'world', false, 1);
		this.hdRatioMap = calcHDRatio(z, 'map', false, 0.75);
		this.hdRatioVoid = calcHDRatio(z, 'void', false, voidPercent);
		//Calculating HD values for the next zone.
		this.hdRatioPlus = calcHDRatio(z + 1, 'world', false, 1);
		this.hdRatioMapPlus = calcHDRatio(z + 1, 'map', false, 0.75);
		this.hdRatioVoidPlus = calcHDRatio(z + 1, 'void', false, voidPercent);
		//Calculating void HD values so that we don't need to generate them everytime when looking at VoidMaps function.
		const voidMaxTenacity = getPageSetting('voidMapSettings')[0].maxTenacity;
		this.vhdRatio = voidMaxTenacity ? calcHDRatio(z, 'world', voidMaxTenacity, 1) : this.hdRatio;
		this.vhdRatioVoid = voidMaxTenacity ? calcHDRatio(z, 'void', voidMaxTenacity, voidPercent) : this.hdRatioVoid;
		this.vhdRatioVoidPlus = voidMaxTenacity ? calcHDRatio(z + 1, 'void', voidMaxTenacity, voidPercent) : this.hdRatioVoidPlus;
		//Check to see what our HD Ratio is with the original heirloom
		this.hdRatioHeirloom = calcHDRatio(z, 'world', false, 1, false);
		//Calculating Hits Survived values for current zone.
		this.hitsSurvived = calcHitsSurvived(z, 'world', 1);
		this.hitsSurvivedVoid = calcHitsSurvived(z, 'void', voidPercent);
		//Calculating Auto Level values.
		this.autoLevel = autoMapLevel();
		this.autoLevelInitial = checkAutoLevel ? stats() : this.autoLevelInitial;
		this.autoLevelData = checkAutoLevel ? get_best(this.autoLevelInitial) : this.autoLevelData;
		this.autoLevelDataFrag = checkAutoLevel ? get_best(this.autoLevelInitial, true) : this.autoLevelDataFrag;
		this.autoLevelNew = this.autoLevelDataFrag.overall.mapLevel;
		this.autoLevelSpeed = this.autoLevelDataFrag.speed.mapLevel;
		//this.autoLevelSpeedMapBonus = this.autoLevelDataFrag.speedBonus.mapLevel;
	}
}

function getCurrentWorldCell() {
	var cell = { level: 1 };
	if (game.global.gridArray.length > 0) cell = game.global.gridArray[game.global.lastClearedCell + 1];
	return cell;
}

function debugCalc() {
	//Pre-Init
	var mapping = game.global.mapsActive ? true : false;
	var mapType = (!mapping) ? 'world' : (getCurrentMapObject().location === 'Void' ? 'void' : 'map');
	var zone = (mapType === 'world') ? game.global.world : getCurrentMapObject().level;
	var cell = (mapType === 'world') ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
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
	debug(`Our Stats`, "other");
	debug(`Our attack: ${displayedMin.toExponential(2)} - ${displayedMax.toExponential(2)}`);
	debug(`Our crit: ${100 * getPlayerCritChance().toExponential(2)} % for ${getPlayerCritDamageMult().toFixed(1)}x damage. Average of ${getCritMulti("maybe").toFixed(2)}x`);
	if (game.global.universe === 1) debug(`Our block: ${calcOurBlock(true, true).toExponential(2)}`);
	if (game.global.universe === 2) debug(`Our equality: ${game.portal.Equality.disabledStackCount}`);
	debug(`Our Health: ${calcOurHealth(universeSetting2, mapType).toExponential(2)}`);

	//Enemy stats
	debug(`Enemy Stats`);
	debug(`Enemy Attack: ${(enemyMin * equality).toExponential(2)} - ${(enemyMax * equality).toExponential(2)}`);
	debug(`Enemy Health: ${(calcEnemyHealthCore(mapType, zone, cell, name) * difficulty).toExponential(2)}`);
}

function calcOurBlock(stance, realBlock) {
	var block = 0;

	if (game.global.universe === 2) return 0;
	//Ignores block gyms/shield that have been brought, but not yet deployed
	if (realBlock) {
		block = game.global.soldierCurrentBlock;
		if (stance || game.global.formation === 0) return block;
		if (game.global.formation === 3) return block / 4;
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
	if (stance && game.global.formation !== 0) block *= game.global.formation === 3 ? 4 : 0.5;

	//Heirloom
	var heirloomBonus = calcHeirloomBonus("Shield", "trimpBlock", 0, true);
	if (heirloomBonus > 0) block *= (heirloomBonus / 100) + 1;

	return block;
}

function calcEquipment(type = 'attack') {
	//Init
	var bonus = 0;
	var equipmentList;

	//Equipment names
	if (type === 'attack') equipmentList = ["Dagger", "Mace", "Polearm", "Battleaxe", "Greatsword", "Arbalest"];
	else equipmentList = ["Shield", "Boots", "Helmet", "Pants", "Shoulderguards", "Breastplate", "Gambeson"];

	//For each equipment
	for (var i = 0; i < equipmentList.length; i++) {
		//Check if it's unlocked
		var equip = game.equipment[equipmentList[i]];
		if (equip.locked !== 0) continue;

		//Get the bonus
		bonus += equip.level * (type === 'attack' ? equip.attackCalculated : equip.healthCalculated);
	}

	return bonus;
}

function getTrimpAttack(realDamage) {
	//This is actual damage of the army in combat ATM, without considering items bought, but not yet in use
	if (realDamage) return game.global.soldierCurrentAttack;

	//Damage from equipments and Coordinations
	var dmg = (6 + calcEquipment('attack')) * game.resources.trimps.maxSoldiers;
	const perkLevel = game.global.universe === 2 ? 'radLevel' : 'level';

	//Magma
	if (mutations.Magma.active()) dmg *= mutations.Magma.getTrimpDecay();

	//Power I
	if (game.portal.Power[perkLevel] > 0) dmg += (dmg * game.portal.Power[perkLevel] * game.portal.Power.modifier);

	//Power II
	if (game.portal.Power_II[perkLevel] > 0) dmg *= (1 + (game.portal.Power_II.modifier * game.portal.Power_II[perkLevel]));

	//Formation
	if (game.global.universe === 1 && (game.global.formation !== 0 && game.global.formation !== 5)) dmg *= (game.global.formation === 2) ? 4 : 0.5;

	return dmg;
}

function getTrimpHealth(realHealth, mapType) {
	//This is the actual health of the army ATM, without considering items bought, but not yet in use
	if (realHealth) return game.global.soldierHealthMax;
	const perkLevel = game.global.universe === 2 ? 'radLevel' : 'level';
	var heirloomToCheck = heirloomShieldToEquip(mapType);

	//Health from equipments and coordination
	var health = (50 + calcEquipment('health')) * game.resources.trimps.maxSoldiers;
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
	health *= game.global.universe === 1 && game.global.formation !== 0 && game.global.formation !== 5 ? ((game.global.formation === 1) ? 4 : 0.5) : 1;
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
	const heirloomHealth = calcHeirloomBonus_AT('Shield', 'trimpHealth', 1, true, heirloomToCheck);
	health *= heirloomHealth > 1 ? (1 + (heirloomHealth / 100)) : 1;
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
	health *= challengeActive('Life') ? game.challenges.Life.getHealthMult() : 1;
	health *= challengeActive('Balance') ? game.challenges.Balance.getHealthMult() : 1;

	health *= challengeActive('Revenge') && game.challenges.Revenge.stacks > 0 ? game.challenges.Revenge.getMult() : 1;
	health *= challengeActive('Wither') && game.challenges.Wither.trimpStacks > 0 ? game.challenges.Wither.getTrimpHealthMult() : 1;
	health *= challengeActive('Insanity') ? game.challenges.Insanity.getHealthMult() : 1;
	health *= challengeActive('Berserk') && game.challenges.Berserk.frenzyStacks > 0 ? game.challenges.Berserk.getHealthMult() : 1;
	health *= challengeActive('Berserk') && game.challenges.Berserk.frenzyStacks <= 0 ? game.challenges.Berserk.getHealthMult(true) : 1;
	health *= game.challenges.Nurture.boostsActive() ? game.challenges.Nurture.getStatBoost() : 1;
	health *= challengeActive('Alchemy') ? alchObj.getPotionEffect('Potion of Strength') : 1;
	health *= challengeActive('Smithless') && game.challenges.Smithless.fakeSmithies > 0 ? Math.pow(1.25, game.challenges.Smithless.fakeSmithies) : 1;

	return health;
}

function calcOurHealth(stance, mapType, realHealth, fullGeneticist) {
	if (!mapType) mapType = (!game.global.mapsActive) ? 'world' : (getCurrentMapObject().location === 'Void' ? 'void' : 'map');
	if (!realHealth) realHealth = false;
	if (!stance) stance = false;

	var health = getTrimpHealth(realHealth, mapType);
	if (game.global.universe === 1) {
		//Formation
		if (!stance && game.global.formation !== 0 && game.global.formation !== 5) health /= (game.global.formation === 1) ? 4 : 0.5;

		//Geneticists
		var geneticist = game.jobs.Geneticist;
		if (fullGeneticist && geneticist.owned > 0) health *= Math.pow(1.01, geneticist.owned - game.global.lastLowGen);
	}
	if (game.global.universe === 2) {
		var shield = 0;
		var shield = getEnergyShieldMult_AT(mapType);
		//Prismatic Shield + Shield Layer. Scales with multiple Scruffy shield layers
		//Subtract health from shield total to give accurate result
		shield = (health * (1 + (shield * (1 + Fluffy.isRewardActive('shieldlayer'))))) - health;
		if (stance)
			return shield;
		else
			health += shield;
	}

	return health;
}

function calcHitsSurvived(targetZone, type, difficulty, checkResults) {
	//Init
	if (!targetZone) targetZone = game.global.world;
	if (!type) type = 'world';
	var damageMult = 1;
	const formationMod = (game.upgrades.Dominance.done) ? 2 : 1;

	var customAttack = undefined;
	if (type === 'world') {
		if (game.global.universe === 1) {
			if (game.global.spireActive) {
				customAttack = calcSpire('attack');
				if (exitSpireCell(true) === 100 && game.global.usingShriek) customAttack *= game.mapUnlocks.roboTrimp.getShriekValue();
			} else if (isCorruptionActive(targetZone)) customAttack = calcCorruptedAttack(targetZone);
		} else if (game.global.universe === 2 && targetZone > 200) customAttack = calcMutationAttack(targetZone);

	}

	var enemyName = 'Improbability';
	if (type === 'void') enemyName = 'Cthulimp';

	var hitsToSurvive = targetHitsSurvived();
	if (hitsToSurvive === 0) hitsToSurvive = 1;
	var health = calcOurHealth(false, type, false, true) / formationMod;
	var block = calcOurBlock(false) / formationMod;
	var equality = equalityQuery(enemyName, targetZone, 100, type, difficulty, 'gamma', null, hitsToSurvive);

	//Lead farms one zone ahead
	if (type === 'world' && challengeActive('Lead') && game.global.world % 2 === 1) {
		targetZone++;
	}

	//Crit Daily and Crushed
	if (game.global.universe === 1 && ((getPageSetting('IgnoreCrits') === 1 && type !== 'void') || getPageSetting('IgnoreCrits') === 0)) {
		const dailyCrit = challengeActive('Daily') && typeof game.global.dailyChallenge.crits !== "undefined";
		const crushed = challengeActive('Crushed');
		if (dailyCrit) {
			damageMult = dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
		} else if (crushed && health > block) {
			damageMult = 3;
		}
	}

	//Enemy Damage
	var worldDamage = calcEnemyAttack(type, targetZone, 100, enemyName, undefined, customAttack, equality) * difficulty;
	//Pierce & Voids
	var pierce = (game.global.universe === 1 && game.global.brokenPlanet && type === 'world') ? getPierceAmt() : 0;

	//Cancel the influence of the Barrier Formation
	if (game.global.formation === 3) {
		pierce *= 2;
	}
	//The Resulting Ratio
	var finalDmg = Math.max(damageMult * worldDamage - block, worldDamage * pierce, 0);

	if (checkResults) {
		debug(`Target Zone: ${targetZone}`);
		debug(`Damage Mult: ${damageMult}`);
		debug(`World Damage: ${worldDamage}`);
		debug(`Equality: ${equality}`);
		debug(`Block: ${block}`);
		debug(`Pierce: ${pierce}`);
		debug(`Health: ${health}`);
		debug(`Hits to Survive: ${hitsToSurvive}`);
		debug(`finalDmg: ${finalDmg}`);
	}

	return health / finalDmg;
}

function targetHitsSurvived(skipHDCheck) {
	const hitsSurvived = !skipHDCheck && mapSettings.mapName === 'Hits Survived' ? mapSettings.hdRatio :
		isDoingSpire() ? getPageSetting('hitsSurvivedSpire') :
			getPageSetting('hitsSurvived');
	return hitsSurvived;
}

function whichHitsSurvived() {
	const hitsSurvived = mapSettings.voidHitsSurvived ? hdStats.hitsSurvivedVoid : hdStats.hitsSurvived;
	return hitsSurvived;
}

function addPoison(realDamage, zone) {
	//Init
	if (!zone) zone = game.global.world;

	//Poison is inactive
	if (getEmpowerment(zone) !== 'Poison') return 0;

	//Real amount to be added in the next attack
	if (realDamage) return game.empowerments.Poison.getDamage();

	//Dynamically determines how much we are benefiting from poison based on Current Amount * Transfer Rate
	if (getPageSetting('addpoison')) return game.empowerments.Poison.getDamage() * getRetainModifier('Poison');

	return 0;
}

function getCritMulti(crit, customShield) {
	var critChance = getPlayerCritChance_AT(customShield);
	var critD = getPlayerCritDamageMult_AT(customShield);
	var critDHModifier;

	if (crit === 'never') critChance = Math.floor(critChance);
	else if (crit === 'force') critChance = Math.ceil(critChance);
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
	if (stacks === undefined) stacks = game.global.antiStacks;

	//Init
	var perkMult = game.portal.Anticipation.level * game.portal.Anticipation.modifier;
	var stacks45 = getPageSetting('45stacks');

	//Regular anticipation
	if (!stacks45) return 1 + (stacks * perkMult);

	//Look at max stacks you can use and calculate the bonus from that
	var maxStacks = game.talents.patience.purchased ? 45 : 30;
	return 1 + (maxStacks * perkMult);
}

function calcOurDmg(minMaxAvg = 'avg', equality, realDamage, mapType, critMode, mapLevel, useTitimp, specificHeirloom = false) {
	if (!mapType) mapType = !game.global.mapsActive ? 'world' : (getCurrentMapObject().location === 'Void' ? 'void' : 'map');
	if (!mapLevel) mapLevel = mapType === 'world' || !game.global.mapsActive ? 0 : getCurrentMapObject().level - game.global.world;
	if (!useTitimp) useTitimp = false;
	if (!critMode) critMode = 'maybe';
	if (!realDamage) realDamage = false;
	var specificStance = game.global.universe === 1 ? equality : false;
	var heirloomToCheck = !specificHeirloom ? heirloomShieldToEquip(mapType) : specificHeirloom;

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
	if (specificStance && game.global.formation !== 0 && game.global.formation !== 5) attack /= (game.global.formation === 2) ? 4 : 0.5;
	if (specificStance && specificStance !== "X" && specificStance !== "W") attack *= (specificStance === "D") ? 4 : 0.5;
	// Map Bonus
	attack *= mapType !== 'world' ? 1 : game.talents.mapBattery.purchased && game.global.mapBonus === 10 ? 5 : 1 + (game.global.mapBonus * .2);
	// Tenacity
	attack *= game.portal.Tenacity.getMult();
	// Hunger
	attack *= game.portal.Hunger.getMult();
	// Observation
	attack *= game.global.universe === 2 ? game.portal.Observation.getMult() : 1;
	//Titimp
	attack *= mapType !== 'world' && useTitimp === 'force' ? 2 : mapType !== 'world' && mapType !== '' && useTitimp && game.global.titimpLeft > 0 ? 2 : 1;
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
	const heirloomAttack = calcHeirloomBonus_AT('Shield', 'trimpAttack', 1, true, heirloomToCheck);
	attack *= heirloomAttack > 1 ? (1 + (heirloomAttack / 100)) : 1;
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
		if (game.talents.scry.purchased && fightingCorrupted && ((!specificStance && game.global.formation === 4) || (specificStance === 'S' || specificStance === 'W')))
			attack *= 2;
		//Magmamancery
		if (game.talents.magmamancer.purchased) attack *= game.jobs.Magmamancer.getBonusPercent();
		//Still Rowing 2
		if (game.talents.stillRowing2.purchased) attack *= (game.global.spireRows * 0.06) + 1;
		//Strength in Health
		if (game.talents.healthStrength.purchased && mutations.Healthy.active()) attack *= ((0.15 * mutations.Healthy.cellCount()) + 1);
	}
	// Bionic Magnet Mastery
	attack *= mapType === 'map' && game.talents.bionic2.purchased && mapLevel > 0 ? 1.5 : 1;
	// Sugar rush event bonus
	attack *= game.global.sugarRush ? sugarRush.getAttackStrength() : 1;
	// Challenge 2 or 3 reward
	attack *= 1 + (game.global.totalSquaredReward / 100);
	//Fluffy
	if (Fluffy.isActive()) {
		attack *= Fluffy.getDamageModifier();
		if (Fluffy.isRewardActive('voidSiphon') && game.stats.totalVoidMaps.value) attack *= 1 + (game.stats.totalVoidMaps.value * 0.05);
		if (game.global.universe === 1 && game.talents.kerfluffle.purchased) attack *= game.talents.kerfluffle.mult();
	}

	//Empowerments - Ice (Experimental)
	if (getEmpowerment() === 'Ice') {
		//Uses the actual number in some places like Stances
		if (!getPageSetting('fullice') || realDamage) attack *= 1 + game.empowerments.Ice.getDamageModifier();

		//Otherwise, use the number we would have after a transfer
		else {
			var afterTransfer = 1 + Math.ceil(game.empowerments.Ice.currentDebuffPower * getRetainModifier('Ice'));
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
	attack *= game.global.uberNature === "Poison" ? 3 : 1;
	// Sharp Trimps
	attack *= game.singleRunBonuses.sharpTrimps.owned ? 1.5 : 1;
	//Mutator
	attack *= game.global.universe === 2 && u2Mutations.tree.Attack.purchased ? 1.5 : 1;

	//Challenges
	if (challengeActive('Life')) attack *= game.challenges.Life.getHealthMult();
	if (challengeActive('Lead') && (game.global.world % 2) === 1) attack *= 1.5;

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
		if (exhaustedStacks === 0) attack *= 1;
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
	if (challengeActive('Daily')) {
		var minDailyMod = 1;
		var maxDailyMod = 1;
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
		if (typeof game.global.dailyChallenge.oddTrimpNerf !== 'undefined') {
			if ((game.global.world + (mapType !== 'map' ? mapLevel : 0)) % 2 === 1) attack *= dailyModifiers.oddTrimpNerf.getMult(game.global.dailyChallenge.oddTrimpNerf.strength);
		}
		if (typeof game.global.dailyChallenge.evenTrimpBuff !== 'undefined') {
			if ((game.global.world + (mapType !== 'map' ? mapLevel : 0)) % 2 === 0) attack *= dailyModifiers.evenTrimpBuff.getMult(game.global.dailyChallenge.evenTrimpBuff.strength);
		}

		attack *= maxDailyMod;
		attack *= minDailyMod;
	}

	// Equality
	if (game.global.universe === 2 && game.portal.Equality[perkLevel] > 0) {
		if (!isNaN(parseInt((equality)))) {
			attack *= Math.pow(getPlayerEqualityMult_AT(heirloomToCheck), equality);
			if (equality > game.portal.Equality[perkLevel])
				debug(`You don't have this many levels in Equality. - Player Dmg. ${equality} / ${game.portal.Equality.radLevel} equality used.`);
		} else if (atSettings.intervals.tenSecond)
			debug(`Equality is not a number. - Player Dmg. ${equality} equality used.`);
	}

	//Override for if the user wants to for some reason floor their crit chance
	if (getPageSetting('floorCritCalc')) critMode = 'never';

	//Init Damage Variation (Crit)
	//If we have critMode defined there's no point in calculating it 3 different times
	//If not defined then get an accurate value for all 3
	var min, max, avg;
	if (critMode) {
		min = attack * getCritMulti(critMode, heirloomToCheck);
		avg = min;
		max = min;
	}
	else {
		min = attack * getCritMulti('never', heirloomToCheck);
		avg = attack * getCritMulti('maybe', heirloomToCheck);
		max = attack * getCritMulti('force', heirloomToCheck);
	}

	//Damage Fluctuation
	min *= minFluct;
	max *= maxFluct;
	avg *= (maxFluct + minFluct) / 2;

	//Well, finally, huh?
	if (minMaxAvg === 'min') return Math.floor(min);
	else if (minMaxAvg === 'max') return Math.ceil(max);
	else return avg;
}

function calcSpire(what, cell, name, checkCell) {
	//Target Cell
	if (!cell) {
		const settingPrefix = trimpStats.isC3 ? 'c2' : trimpStats.isDaily ? 'd' : '';
		const exitCell = getPageSetting(settingPrefix + 'ExitSpireCell');
		if (isDoingSpire() && exitCell > 0 && exitCell <= 100)
			cell = exitCell;
		else cell = 100;
	}

	if (checkCell) return cell;

	//Enemy on the Target Cell
	var enemy = (name) ? name : game.global.gridArray[cell - 1].name;
	var base = (what === 'attack') ? calcEnemyBaseAttack('world', game.global.world, 100, enemy) : 2 * calcEnemyBaseHealth('world', game.global.world, 100, enemy);
	var mod = (what === 'attack') ? 1.17 : 1.14;

	//Spire Num
	var spireNum = Math.floor((game.global.world - 100) / 100);
	if (spireNum > 1) {
		var modRaiser = 0;
		modRaiser += (spireNum - 1) / 100;
		if (what === 'attack') modRaiser *= 8;
		if (what === 'health') modRaiser *= 2;
		mod += modRaiser;
	}

	//Math
	base *= Math.pow(mod, cell);

	//Compensations for Domination
	if (challengeActive('Domination') && cell !== 100) base /= (what === 'attack') ? 25 : 75;

	return base;
}

function badGuyCritMult(enemy, critPower = 2, block, health) {
	//Pre-Init
	if (getPageSetting('IgnoreCrits') === 2) return 1;
	if (!enemy) enemy = getCurrentEnemy();
	if (!enemy || critPower <= 0) return 1;
	if (!block) block = game.global.soldierCurrentBlock;
	if (!health) health = game.global.soldierHealth;

	//Init
	var regular = 1, challenge = 1;

	//Non-challenge crits
	if (enemy.corrupted === 'corruptCrit') regular = 5;
	else if (enemy.corrupted === 'healthyCrit') regular = 7;
	else if (game.global.voidBuff === 'getCrit' && getPageSetting('IgnoreCrits') !== 1) regular = 5;

	//Challenge crits
	var crushed = challengeActive('Crushed');
	var critDaily = challengeActive('Daily') && typeof game.global.dailyChallenge.crits !== 'undefined';

	//Challenge multiplier
	if (critDaily) challenge = dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
	else if (crushed && health > block) challenge = 5;

	//Result -- Yep. Crits may crit! Yey!
	if (critPower === 2) return regular * challenge;
	else return Math.max(regular, challenge);
}

function calcCorruptionScale(zone, base) {
	var startPoint = (challengeActive('Corrupted') || challengeActive('Eradicated')) ? 1 : 150;
	var scales = Math.floor((zone - startPoint) / 6);
	var realValue = base * Math.pow(1.05, scales);
	return parseFloat(realValue);
}

function calcEnemyBaseAttack(type, zone, cell, name, query) {
	//Pre-Init
	if (!type) type = !game.global.mapsActive ? 'world' : getCurrentMapObject().location === 'Void' ? 'void' : 'map';
	if (!zone) zone = type === 'world' || !game.global.mapsActive ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = type === 'world' || !game.global.mapsActive ? getCurrentWorldCell().level : getCurrentMapCell() ? getCurrentMapCell().level : 1;
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : 'Snimp';
	if (!query) query = false;
	var mapGrid = type === 'world' ? 'gridArray' : 'mapGridArray';

	if (!query && zone >= 200 && cell !== 100 && type === 'world' && game.global.universe === 2 && game.global[mapGrid][cell].u2Mutation) {
		if (cell !== 100 && type === 'world' && game.global[mapGrid][cell].u2Mutation) {
			attack = u2Mutations.getAttack(game.global[mapGrid][cell - 1]);
			return attack;
		}
	}

	//Init
	var attackBase = game.global.universe === 2 ? 750 : 50;
	var attack = attackBase * Math.sqrt(zone) * Math.pow(3.27, zone / 2) - 10;

	//Zone 1
	if (zone === 1) {
		attack *= 0.35;
		attack = 0.2 * attack + 0.75 * attack * (cell / 100);
	}

	//Zone 2
	else if (zone === 2) {
		attack *= 0.5;
		attack = 0.32 * attack + 0.68 * attack * (cell / 100);
	}

	//Before Breaking the Planet
	else if (zone < 60)
		attack = 0.375 * attack + 0.7 * attack * (cell / 100);

	//After Breaking the Planet
	else {
		attack = 0.4 * attack + 0.9 * attack * (cell / 100);
		attack *= Math.pow(1.15, zone - 59);
	}

	//Flat Attack reduction for before Z60.
	if (zone < 60)
		attack *= 0.85;

	//Maps
	if (zone > 6 && type !== 'world')
		attack *= 1.1;

	//Specific Imp
	if (name)
		attack *= game.badGuys[name].attack;

	//U2 zone adjustment
	if (game.global.universe === 2) {
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

function calcEnemyAttackCore(type, zone, cell, name, minOrMax, customAttack, equality) {
	//Pre-Init
	if (!type) type = (!game.global.mapsActive) ? 'world' : (getCurrentMapObject().location === 'Void' ? 'void' : 'map');
	if (!zone) zone = (type === 'world' || !game.global.mapsActive) ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = (type === 'world' || !game.global.mapsActive) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : 'Snimp';
	if (!minOrMax) minOrMax = false;

	//Init
	var attack = calcEnemyBaseAttack(type, zone, cell, name);
	var fluctuation = game.global.universe === 2 ? 0.5 : 0.2;
	if (game.global.universe === 1) {
		//Spire - Overrides the base attack number
		if (type === 'world') {
			if (game.global.spireActive) {
				attack = calcSpire('attack', cell, name);
			} else if (mutations.Corruption.active()) {
				if (game.global.gridArray[cell - 1].mutation) {
					attack = corruptionBaseAttack(cell - 1, zone)
				}
			}
		}
		//Map and Void Corruption
		else {
			//Corruption
			var corruptionScale = calcCorruptionScale(game.global.world, 3);
			if (mutations.Magma.active()) attack *= corruptionScale / (type === 'void' ? 1 : 2);
			else if (type === 'void' && mutations.Corruption.active()) attack *= corruptionScale / 2;
		}
	}

	//Curr zone Mutation Attack
	else if (game.global.universe === 2) {
		if (type === 'world' && game.global.world > 200) {
			if (game.global.gridArray[cell - 1].u2Mutation && game.global.gridArray[cell - 1].u2Mutation.length !== 0) {
				attack = mutationBaseAttack(cell - 1, zone)
			}
		}
	}

	//Use custom values instead
	if (customAttack) attack = customAttack;

	//WARNING! Check every challenge!
	if (game.global.universe === 1) {
		if (challengeActive('Balance')) attack *= (type === 'world') ? 1.17 : 2.35;
		if (challengeActive('Meditate')) attack *= 1.5;
		if (challengeActive('Life')) attack *= 6;
		if (challengeActive('Toxicity')) attack *= 5;
		if (challengeActive('Lead')) attack *= (zone % 2 === 0) ? 5.08 : (1 + 0.04 * game.challenges.Lead.stacks);
		if (challengeActive('Watch')) attack *= 1.25;
		if (challengeActive('Corrupted')) attack *= 3;
		if (challengeActive('Domination')) attack *= 2.5;
		if (challengeActive('Scientist') && getScientistLevel() === 5) attack *= 10;
		if (challengeActive('Frigid')) attack *= game.challenges.Frigid.getEnemyMult();
		if (challengeActive('Experience')) attack *= game.challenges.Experience.getEnemyMult();

		//Coordinate
		if (challengeActive('Coordinate')) {
			var amt = 1;
			for (var i = 1; i < zone; i++) amt = Math.ceil(amt * 1.25);
			attack *= amt;
		}

		//Obliterated and Eradicated
		if (challengeActive('Obliterated') || challengeActive('Eradicated')) {
			var oblitMult = (challengeActive('Eradicated')) ? game.challenges.Eradicated.scaleModifier : 1e12;
			var zoneModifier = Math.floor(game.global.world / game.challenges[game.global.challengeActive].zoneScaleFreq);
			oblitMult *= Math.pow(game.challenges[game.global.challengeActive].zoneScaling, zoneModifier);
			attack *= oblitMult;
		}
	}
	//u2 challenges
	if (game.global.universe === 2) {
		if (challengeActive('Unbalance')) attack *= 1.5;
		if (challengeActive('Duel') && game.challenges.Duel.trimpStacks < 50) attack *= 3;
		if (challengeActive('Wither') && game.challenges.Wither.enemyStacks > 0) attack *= game.challenges.Wither.getEnemyAttackMult();
		if (challengeActive('Archaeology')) attack *= game.challenges.Archaeology.getStatMult('enemyAttack');
		if (challengeActive('Mayhem')) {
			if (type === 'world') attack *= game.challenges.Mayhem.getBossMult();
			attack *= game.challenges.Mayhem.getEnemyMult();
		}
		//Purposefully don't put Storm in here.
		if (challengeActive('Storm') && !game.global.mapsActive) attack *= game.challenges.Storm.getAttackMult();
		if (challengeActive('Exterminate')) attack *= game.challenges.Exterminate.getSwarmMult();
		if (challengeActive('Nurture')) {
			attack *= 2;
			attack *= game.buildings.Laboratory.getEnemyMult();
		}
		if (challengeActive('Pandemonium') && type === 'world') attack *= game.challenges.Pandemonium.getBossMult();
		if (challengeActive('Pandemonium') && type !== 'world') attack *= game.challenges.Pandemonium.getPandMult();
		if (challengeActive('Desolation')) attack *= game.challenges.Desolation.getEnemyMult();
		if (challengeActive('Alchemy')) attack *= (alchObj.getEnemyStats(type !== 'world', type === 'void')) + 1;
		if (challengeActive('Hypothermia')) attack *= game.challenges.Hypothermia.getEnemyMult();
		if (challengeActive('Glass')) attack *= game.challenges.Glass.attackMult();

		if (type === 'world' && game.global.novaMutStacks > 0) attack *= u2Mutations.types.Nova.enemyAttackMult();

		if (equality) {
			if (!isNaN(parseInt((equality)))) {
				attack *= Math.pow(game.portal.Equality.getModifier(), equality);
				if (equality > game.portal.Equality.radLevel)
					debug(`You don't have this many levels in Equality. - Enemy Dmg. ${equality} / ${game.portal.Equality.radLevel} equality used.`);
			} else if (atSettings.intervals.tenSecond) {
				debug(`Equality is not a number. - Enemy Dmg. ${equality} equality used.`);
			}
		}
	}

	//Dailies
	if (challengeActive('Daily')) {
		//Bad Strength
		if (typeof game.global.dailyChallenge.badStrength !== 'undefined')
			attack *= dailyModifiers.badStrength.getMult(game.global.dailyChallenge.badStrength.strength);

		//Bad Map Strength
		if (typeof game.global.dailyChallenge.badMapStrength !== 'undefined' && type !== 'world')
			attack *= dailyModifiers.badMapStrength.getMult(game.global.dailyChallenge.badMapStrength.strength);

		//Bloodthirst
		if (typeof game.global.dailyChallenge.bloodthirst !== 'undefined') {
			var bloodThirstStrength = game.global.dailyChallenge.bloodthirst.strength;
			if (type === 'void' && getPageSetting('bloodthirstVoidMax'))
				attack *= dailyModifiers.bloodthirst.getMult(bloodThirstStrength, dailyModifiers.bloodthirst.getMaxStacks(bloodThirstStrength));
			else if (!getPageSetting('bloodthirstDestack')) attack *= dailyModifiers.bloodthirst.getMult(game.global.dailyChallenge.bloodthirst.strength, game.global.dailyChallenge.bloodthirst.stacks);
		}

		//Empower
		if (typeof game.global.dailyChallenge.empower !== 'undefined' && type === 'world')
			attack *= dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks);

		//Empower voids
		if (typeof game.global.dailyChallenge.empoweredVoid !== 'undefined' && type === 'void')
			attack *= dailyModifiers.empoweredVoid.getMult(game.global.dailyChallenge.empoweredVoid.strength);
	}

	return minOrMax ? (1 - fluctuation) * attack : (1 + fluctuation) * attack;
}

function calcEnemyAttack(type = 'world', zone = game.global.world, cell = 100, name = 'Improbability', minOrMax, customAttack, equality) {
	//Init
	var attack = calcEnemyAttackCore(type, zone, cell, name, minOrMax, customAttack, equality);
	var corrupt = zone >= mutations.Corruption.start();
	var healthy = mutations.Healthy.active();

	//Challenges
	if (challengeActive('Nom')) {
		if (type === 'world') {
			if (typeof getCurrentWorldCell() !== 'undefined' && typeof getCurrentWorldCell().nomStacks !== 'undefined')
				attack *= Math.pow(1.25, getCurrentWorldCell().nomStacks)
		}
		else if (game.global.mapsActive && typeof getCurrentEnemy() !== 'undefined' && typeof getCurrentEnemy().nomStacks !== 'undefined')
			attack *= Math.pow(1.25, getCurrentEnemy().nomStacks);
	}

	//Dmg + Magneto Shriek during Domination
	if (challengeActive('Domination')) {
		attack *= 2.5;
		if (type === 'world' && game.global.usingShriek)
			attack *= game.mapUnlocks.roboTrimp.getShriekValue();
	}

	//Ice - Experimental
	if (getEmpowerment() === 'Ice' && getPageSetting('fullice')) {
		var afterTransfer = 1 + Math.ceil(game.empowerments.Ice.currentDebuffPower * getRetainModifier('Ice'));
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
	if (challengeActive('Nom') && typeof enemy.nomStacks !== 'undefined') attack *= Math.pow(1.25, enemy.nomStacks);
	if (challengeActive('Lead')) attack *= 1 + (0.04 * game.challenges.Lead.stacks);

	//Magneto Shriek
	if (game.global.usingShriek) attack *= game.mapUnlocks.roboTrimp.getShriekValue();

	//Ice
	if (getEmpowerment() === 'Ice') attack *= game.empowerments.Ice.getCombatModifier();

	return Math.ceil(attack);
}

function calcEnemyBaseHealth(mapType, zone, cell, name, ignoreCompressed) {
	//Pre-Init
	if (!mapType) mapType = (!game.global.mapsActive) ? 'world' : (getCurrentMapObject().location === 'Void' ? 'void' : 'map');
	if (!zone) zone = (mapType === 'world' || !game.global.mapsActive) ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = (mapType === 'world' || !game.global.mapsActive) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : "Turtlimp";

	//Init
	var base = (game.global.universe === 2) ? 10e7 : 130;
	var health = (base * Math.sqrt(zone) * Math.pow(3.265, zone / 2)) - 110;

	if (!ignoreCompressed && mapType === 'world' && game.global.universe === 2 && game.global.world > 200 && typeof (game.global.gridArray[cell - 1].u2Mutation) !== 'undefined') {
		if (game.global.gridArray[cell - 1].u2Mutation.length > 0 && (game.global.gridArray[cell].u2Mutation.indexOf('CSX') !== -1 || game.global.gridArray[cell].u2Mutation.indexOf('CSP') !== -1)) {
			cell = cell - 1
			var grid = game.global.gridArray
			var go = false;
			var row = 0;
			var currRow = Number(String(cell)[0]) * 10;
			if (!go && game.global.gridArray[cell].u2Mutation.indexOf('CSX') !== -1) {
				for (var i = 5; 9 >= i; i++) {
					if (grid[i * 10].u2Mutation.indexOf('CSP') !== -1) {
						row = (i * 10);
						go = true;
					}
				}
				cell += (row - currRow);
			}
			if (!go && game.global.gridArray[cell].u2Mutation.indexOf('CSP') !== -1) {
				for (var i = 0; 5 >= i; i++) {
					if (grid[i * 10].u2Mutation.indexOf('CSX') !== -1) {
						row = (i * 10);
						go = true;
					}
				}
				cell -= (currRow - row);
			}

		}
	}
	//First Two Zones
	if (zone === 1 || (zone === 2 && cell < 10)) {
		health *= 0.6;
		health = (health * 0.25) + ((health * 0.72) * (cell / 100));
	}

	//Before Breaking the Planet
	else if (zone < 60)
		health = (health * 0.4) + ((health * 0.4) * (cell / 110));

	//After Breaking the Planet
	else {
		health = (health * 0.5) + ((health * 0.8) * (cell / 100));
		health *= Math.pow(1.1, zone - 59);
	}

	//Flat HP reduction for before Z60.
	if (zone < 60)
		health *= 0.75;

	//Maps
	if (zone > 5 && mapType !== 'world')
		health *= 1.1;

	//U2 Settings
	if (game.global.universe === 2) {
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
	if (!type) type = (!game.global.mapsActive) ? 'world' : (getCurrentMapObject().location === 'Void' ? 'void' : 'map');
	if (!zone) zone = (type === 'world' || !game.global.mapsActive) ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = (type === 'world' || !game.global.mapsActive) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
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
	if (type === 'world' && game.global.spireActive) health = calcSpire('health');

	//Map and Void Corruption
	if (type !== 'world') {
		//Corruption in maps
		if (mutations.Magma.active())
			health *= calcCorruptionScale(game.global.world, 10) / (type === 'void' ? 1 : 2);
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
	health *= challengeActive('Frigid') ? game.challenges.Frigid.getEnemyMult() : 1;
	if (challengeActive('Coordinate')) {
		var amt = 1;
		for (var i = 1; i < zone; i++) amt = Math.ceil(amt * 1.25);
		health *= amt;
	}

	//U2
	health *= challengeActive('Unbalance') && type !== 'world' ? 2 : challengeActive('Unbalance') ? 3 : 1;
	health *= challengeActive('Quest') ? game.challenges.Quest.getHealthMult() : 1;
	health *= challengeActive('Revenge') && game.global.world % 2 === 0 ? 10 : 1;

	if (challengeActive('Mayhem')) {
		if (type === 'world') health *= game.challenges.Mayhem.getBossMult();
		health *= game.challenges.Mayhem.getEnemyMult();
	}
	health *= challengeActive('Storm') && type === 'world' ? game.challenges.Storm.getHealthMult() : 1;
	//health *= challengeActive('Berserk') ? 1.5 : 1; ????? WHY IS THIS COMMENTED OUT! TEST THIS!¬
	health *= challengeActive('Exterminate') ? game.challenges.Exterminate.getSwarmMult() : 1;
	if (challengeActive('Nurture')) {
		health *= type === 'world' ? 2 : 10;
		health *= game.buildings.Laboratory.owned > 0 ? game.buildings.Laboratory.getEnemyMult() : 1;
	}
	if (challengeActive('Pandemonium')) health *= type === 'world' ? game.challenges.Pandemonium.getBossMult() : type !== 'world' ? game.challenges.Pandemonium.getPandMult() : 1;
	if (challengeActive('Desolation')) health *= game.challenges.Desolation.getEnemyMult();
	health *= challengeActive('Alchemy') ? alchObj.getEnemyStats(false, false) + 1 : 1;
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
		health *= typeof game.global.dailyChallenge.empoweredVoid !== 'undefined' && type === 'void' ? dailyModifiers.empoweredVoid.getMult(game.global.dailyChallenge.empoweredVoid.strength) : 1;
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
	if (challengeActive('Lead')) health *= (zone % 2 === 0) ? 5.08 : (1 + 0.04 * game.challenges.Lead.stacks);

	//Shouldn't be needed as there's enemy health calcs in calcEnemyHealthCore for corrupted/healthy enemies
	/* if (type === 'world' && corrupt && !game.global.spireActive) {
		if (healthy) health *= calcCorruptionScale(zone, 14);
		else if (corrupt) health *= calcCorruptionScale(zone, 10);
	} */

	return health;
}

function calcSpecificEnemyHealth(type, zone, cell, forcedName) {
	//Pre-Init
	if (!type) type = (!game.global.mapsActive) ? 'world' : (getCurrentMapObject().location === 'Void' ? 'void' : 'map');
	if (!zone) zone = (type === 'world' || !game.global.mapsActive) ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = (type === 'world' || !game.global.mapsActive) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);

	//Select our enemy
	var enemy = (type === 'world') ? game.global.gridArray[cell - 1] : game.global.mapGridArray[cell - 1];
	if (!enemy) return -1;

	//Init
	var corrupt = enemy.corrupted && enemy.corrupted !== "none";
	var healthy = corrupt && enemy.corrupted.startsWith("healthy");
	var name = corrupt ? "Chimp" : (forcedName) ? forcedName : enemy.name;
	var health = calcEnemyHealthCore(type, zone, cell, name);

	//Challenges - considers the actual scenario for this enemy
	if (challengeActive('Lead')) health *= 1 + (0.04 * game.challenges.Lead.stacks);
	if (challengeActive('Domination')) {
		var lastCell = (type === 'world') ? 100 : game.global.mapGridArray.length;
		if (cell < lastCell) health /= 10;
		else health *= 7.5;
	}

	//Map and Void Difficulty
	if (type !== 'world') health *= getCurrentMapObject().difficulty;

	//Corruption
	else if (type === 'world' && !healthy && (corrupt || mutations.Corruption.active() && cell === 100) && !game.global.spireActive) {
		health *= calcCorruptionScale(zone, 10);
		if (enemy.corrupted === "corruptTough") health *= 5;
	}

	//Healthy
	else if (type === 'world' && healthy) {
		health *= calcCorruptionScale(zone, 14);
		if (enemy.corrupted === "healthyTough") health *= 7.5;
	}

	return health;
}

function calcHDRatio(targetZone, type, maxTenacity, difficulty, hdCheck = true, checkOutputs) {
	if (!targetZone) targetZone = game.global.world;
	if (!type) type = 'world';
	if (!maxTenacity) maxTenacity = false;
	if (!difficulty) difficulty = 1;
	//Init
	var enemyHealth;
	var universeSetting;

	if (type === 'world') {
		var customHealth = undefined;
		if (game.global.universe === 1) {
			if (game.global.spireActive) customHealth = calcSpire('health');
			else if (isCorruptionActive(targetZone)) customHealth = calcCorruptedHealth(targetZone);
		}
		if (game.global.universe === 2)
			if (targetZone > 200) customHealth = calcMutationHealth(targetZone);
		enemyHealth = calcEnemyHealth(type, targetZone, 100, 'Improbability', customHealth) * difficulty;
		universeSetting = game.global.universe === 2 ? equalityQuery('Improbability', targetZone, 100, type, difficulty, 'gamma', false, 1, true) : 'X';
	}
	if (type === 'map') {
		enemyHealth = calcEnemyHealth(type, targetZone, 20, 'Turtlimp') * difficulty;
		universeSetting = game.global.universe === 2 ? equalityQuery('Snimp', targetZone, 20, type, difficulty, 'gamma', true) : 'X';
	}
	if (type === 'void') {
		enemyHealth = calcEnemyHealth(type, targetZone, 100, 'Cthulimp') * difficulty;
		universeSetting = game.global.universe === 2 ? equalityQuery('Cthulimp', targetZone, 100, type, difficulty, 'gamma', false, 1, true) : 'X';
	}

	var heirloomToUse = heirloomShieldToEquip(type, false, hdCheck);
	var gammaBurstDmg = getPageSetting('gammaBurstCalc') ? MODULES.heirlooms.gammaBurstPct : 1;
	var ourBaseDamage = calcOurDmg(challengeActive('Unlucky') ? 'max' : 'avg', universeSetting, false, type, 'maybe', targetZone - game.global.world, null, heirloomToUse);

	//Checking ratio at max mapbonus/tenacity for Void Maps.
	if (maxTenacity) {
		if (type === 'world' && game.global.mapBonus !== 10) {
			ourBaseDamage /= 1 + 0.2 * game.global.mapBonus;
			ourBaseDamage *= game.talents.mapBattery.purchased ? 5 : 3;
		}
		if (game.global.universe === 2 && game.portal.Tenacity.radLevel > 0 && !(game.portal.Tenacity.getMult() === Math.pow(1.4000000000000001, getPerkLevel("Tenacity") + getPerkLevel("Masterfulness")))) {
			ourBaseDamage /= game.portal.Tenacity.getMult();
			ourBaseDamage *= Math.pow(1.4000000000000001, getPerkLevel("Tenacity") + getPerkLevel("Masterfulness"));
		}
	}
	//Lead Challenge
	if (challengeActive('Lead') && targetZone % 2 === 1 && type !== 'map') {
		//Stats for void maps
		var voidDamage = ourBaseDamage;
		var voidHealth = type === 'void' ? calcEnemyHealth(type, targetZone) * difficulty : 0;

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
		return Math.max(voidHealth / voidDamage, calcEnemyHealth('world', targetZone) / ourBaseDamage);
	}
	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.weakness !== 'undefined') ourBaseDamage *= (1 - ((Math.max(1, gammaMaxStacks(false, true) - 1)) * game.global.dailyChallenge.weakness.strength) / 100)
	}

	//Adding gammaBurstDmg to calc
	if (type !== 'map' && (game.global.universe === 2 && universeSetting < (game.portal.Equality.radLevel - 14)) || game.global.universe === 1)
		ourBaseDamage *= gammaBurstDmg

	if (checkOutputs) {
		debug(`ourBaseDamage: ${ourBaseDamage}`);
		debug(`enemyHealth: ${enemyHealth}`);
		debug(`universeSetting: ${universeSetting}`);
		debug(`HD type: ${type}`);
		debug(`HD value (H:D): ${enemyHealth / (ourBaseDamage + addPoison())}`);
	}

	//Return H:D for a regular, sane, not f-ing Lead zone (sorry, Lead just took a lot of me)
	return enemyHealth / (ourBaseDamage + addPoison());
}

//Avg damage of corrupted enemy
function corruptionBaseAttack(cell, targetZone) {
	if (!targetZone) targetZone = game.global.world;

	var baseAttack;
	var cell = game.global.gridArray[cell];

	baseAttack = calcEnemyBaseAttack('world', targetZone, cell.level, 'Chimp', true);

	if (cell.corrupted === 'corruptStrong') baseAttack *= 2;
	else if (cell.corrupted === 'healthyStrong') baseAttack *= 2.5;
	baseAttack *= cell.mutation === 'Healthy' ? calcCorruptionScale(targetZone, 5) : calcCorruptionScale(targetZone, 3);
	return baseAttack;
}

//Need to add a isCorrupted check for zone checking
function calcCorruptedAttack(targetZone) {
	if (game.global.universe !== 1) return;
	if (!targetZone) targetZone = game.global.world;
	if (!isCorruptionActive(targetZone)) return;
	var attack;
	var worstCell = 0;
	var cell;

	var highest = 1;
	var gridArray = game.global.gridArray;

	for (var i = 0; i < gridArray.length; i++) {
		cell = i;
		if (gridArray[cell].mutation) {
			highest = Math.max(corruptionBaseAttack(cell, targetZone), highest);
			if (highest > attack) worstCell = i
			attack = highest;
		}
	}
	return attack;
}

function corruptionBaseHealth(cell, targetZone) {
	if (!targetZone) targetZone = game.global.world;
	var baseHealth;
	cell = game.global.gridArray[cell];

	baseHealth = calcEnemyBaseHealth('world', targetZone, cell.level, 'Chimp', true);
	if (cell.corrupted === 'corruptTough') baseHealth *= 5;
	else if (cell.corrupted === 'healthyTough') baseHealth *= 7.5;

	baseHealth *= cell.mutation === 'Healthy' ? calcCorruptionScale(targetZone, 14) : calcCorruptionScale(targetZone, 10);

	return baseHealth;
}

function calcCorruptedHealth(targetZone) {
	if (game.global.universe !== 1) return;
	if (!targetZone) targetZone = game.global.world;
	if (!isCorruptionActive(targetZone)) return;

	var worstCell = 0;
	var cell;
	var health = 0;

	var highest = 0;
	var gridArray = game.global.gridArray;

	for (var i = 0; i < game.global.gridArray.length; i++) {
		cell = i;
		if (gridArray[cell].mutation) {
			var enemyHealth = corruptionBaseHealth(cell, targetZone);

			if (enemyHealth > highest) worstCell = i;
			highest = Math.max(enemyHealth, highest);
			health = highest;
		}
	}
	return health;
}

//Avg damage of mutated enemy
function mutationBaseAttack(cell, targetZone) {
	if (!targetZone) targetZone = game.global.world;

	var baseAttack;
	var addAttack = 0;
	var cell = game.global.gridArray[cell];
	if (cell.cs) {
		baseAttack = calcEnemyBaseAttack('world', targetZone, cell.cs, cell.name, true);
	} else {
		baseAttack = calcEnemyBaseAttack('world', targetZone, cell.level, cell.name, true);
	}
	if (cell.cc) addAttack = u2Mutations.types.Compression.attack(cell, baseAttack);
	if (cell.u2Mutation.indexOf('NVA') !== -1) baseAttack *= 0.01;
	else if (cell.u2Mutation.indexOf('NVX') !== -1) baseAttack *= 10;
	baseAttack += addAttack;
	baseAttack *= Math.pow(1.01, (targetZone - 201));
	return baseAttack;
}

function calcMutationAttack(targetZone) {
	if (game.global.universe !== 2) return;
	if (!targetZone) targetZone = game.global.world;
	if (targetZone < 201) return;
	var attack;
	var hasRage = false;
	var worstCell = 0;
	var cell;

	var highest = 1;
	var gridArray = game.global.gridArray;
	var heirloomToCheck = heirloomShieldToEquip('world');
	var compressedSwap = getPageSetting('heirloomCompressedSwap');
	var compressedSwapValue = getPageSetting('heirloomSwapHDCompressed');

	for (var i = 0; i < gridArray.length; i++) {
		hasRage = gridArray[i].u2Mutation.includes('RGE');
		if (gridArray[i].u2Mutation.includes('CMP') && !gridArray[i].u2Mutation.includes('RGE')) {
			for (var y = i + 1; y < i + u2Mutations.types.Compression.cellCount(); y++) {
				if (gridArray[y].u2Mutation.includes('RGE')) {
					hasRage = true;
					break;
				}
			}
		}
		cell = i;
		if (gridArray[cell].u2Mutation && gridArray[cell].u2Mutation.length) {
			var ragingMult = hasRage ? (u2Mutations.tree.Unrage.purchased ? 4 : 5) : 1;
			if (gridArray[cell].u2Mutation.includes('CMP') && compressedSwap && compressedSwapValue) {
				if (heirloomToCheck !== 'heirloomInitial' || hdStats.hdRatioHeirloom >= compressedSwapValue || MODULES.heirlooms.compressedCalc)
					ragingMult = 2.8
			}
			highest = Math.max(mutationBaseAttack(cell, targetZone) * ragingMult, highest);
			if (highest > attack) worstCell = i
			attack = highest;
		}
	}
	if (gridArray[worstCell].u2Mutation.includes('CMP')) {
		MODULES.heirlooms.compressedCalc = true;
	}
	return attack;
}

function mutationBaseHealth(cell, targetZone) {
	if (!targetZone) targetZone = game.global.world;
	var baseHealth;
	var addHealth = 0;
	var cell = game.global.gridArray[cell];

	if (cell.cs) {
		baseHealth = calcEnemyBaseHealth('world', targetZone, cell.cs, cell.name, true);
	}
	else {
		baseHealth = calcEnemyBaseHealth('world', targetZone, cell.level, cell.name, true);
	}
	if (cell.cc) addHealth = u2Mutations.types.Compression.health(cell, baseHealth);
	if (cell.u2Mutation.indexOf('NVA') !== -1) baseHealth *= 0.01;
	else if (cell.u2Mutation.indexOf('NVX') !== -1) baseHealth *= 0.1;
	baseHealth += addHealth;
	baseHealth *= 2;
	baseHealth *= Math.pow(1.02, (targetZone - 201));
	return baseHealth;
}

function calcMutationHealth(targetZone) {
	if (game.global.universe !== 2) return;
	if (!targetZone) targetZone = game.global.world;
	if (targetZone < 201) return;
	var worstCell = 0;
	var cell;
	var health = 0;

	var highest = 0;
	var gridArray = game.global.gridArray;
	var heirloomToCheck = heirloomShieldToEquip('world');
	var compressedSwap = getPageSetting('heirloomCompressedSwap');
	var compressedSwapValue = getPageSetting('heirloomSwapHDCompressed');

	for (var i = 0; i < game.global.gridArray.length; i++) {
		cell = i;
		if (gridArray[cell].u2Mutation && gridArray[cell].u2Mutation.length) {

			var enemyHealth = mutationBaseHealth(cell, targetZone);
			if (gridArray[cell].u2Mutation.includes('CMP') && compressedSwap && compressedSwapValue > 0) {
				if (heirloomToCheck !== 'heirloomInitial' || hdStats.hdRatioHeirloom >= compressedSwapValue || MODULES.heirlooms.compressedCalc)
					enemyHealth *= 0.7;
			}

			if (enemyHealth > highest) worstCell = i;
			highest = Math.max(enemyHealth, highest);
			health = highest;
		}
	}
	if (gridArray[worstCell].u2Mutation.includes('CMP')) {
		MODULES.heirlooms.compressedCalc = true;
	}
	return health;
}

function enemyDamageModifiers() {
	var attack = 1;

	//All U1
	attack *= challengeActive('Balance') ? 2.35 : 1;
	attack *= challengeActive('Meditate') ? 1.5 : 1;
	attack *= challengeActive('Life') ? 6 : 1;
	attack *= challengeActive('Lead') ? 5 : 1;
	attack *= challengeActive('Toxicity') ? 1 + 0.04 * game.challenges.Lead.stacks : 1;
	attack *= challengeActive('Corrupted') ? 3 : 1;
	//Obliterated and Eradicated
	if (challengeActive('Obliterated') || challengeActive('Eradicated')) {
		var oblitMult = (challengeActive('Eradicated')) ? game.challenges.Eradicated.scaleModifier : 1e12;
		var zoneModifier = Math.floor(game.global.world / game.challenges[game.global.challengeActive].zoneScaleFreq);
		oblitMult *= Math.pow(game.challenges[game.global.challengeActive].zoneScaling, zoneModifier);
		attack *= oblitMult;
	}

	if (challengeActive('Daily')) {
		attack *= typeof game.global.dailyChallenge.badStrength !== 'undefined' ? dailyModifiers.badStrength.getMult(game.global.dailyChallenge.badStrength.strength) : 1;
		attack *= typeof game.global.dailyChallenge.badMapStrength !== 'undefined' && game.global.mapsActive ? dailyModifiers.badMapStrength.getMult(game.global.dailyChallenge.badMapStrength.strength) : 1;
		attack *= typeof game.global.dailyChallenge.bloodthirst !== 'undefined' ? dailyModifiers.bloodthirst.getMult(game.global.dailyChallenge.bloodthirst.strength, game.global.dailyChallenge.bloodthirst.stacks) : 1;
		attack *= typeof game.global.dailyChallenge.empower !== 'undefined' && !game.global.mapsActive ? dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks) : 1;
	}

	//All U2
	attack *= challengeActive('Duel') && game.challenges.Duel.trimpStacks < 50 ? 3 : 1;
	attack *= challengeActive('Wither') && game.challenges.Wither.enemyStacks > 0 ? game.challenges.Wither.getEnemyAttackMult() : 1;
	attack *= challengeActive('Archaeology') ? game.challenges.Archaeology.getStatMult('enemyAttack') : 1;
	attack *= challengeActive('Mayhem') && !game.global.mapsActive && !game.global.preMapsActive && game.global.lastClearedCell + 2 === 100 ? game.challenges.Mayhem.getBossMult() : 1;
	attack *= challengeActive('Mayhem') ? game.challenges.Mayhem.getEnemyMult() : 1;
	attack *= challengeActive('Storm') && !game.global.mapsActive ? game.challenges.Storm.getAttackMult() : 1;
	attack *= challengeActive('Nurture') ? 2 : 1;
	attack *= challengeActive('Nurture') && game.buildings.Laboratory.owned > 0 ? game.buildings.Laboratory.getEnemyMult() : 1;
	attack *= challengeActive('Pandemonium') && !game.global.mapsActive && game.global.lastClearedCell + 2 === 100 ? game.challenges.Pandemonium.getBossMult() : 1;
	attack *= challengeActive('Pandemonium') && !(!game.global.mapsActive && game.global.lastClearedCell + 2 === 100) ? game.challenges.Pandemonium.getPandMult() : 1;
	attack *= challengeActive('Glass') ? game.challenges.Glass.attackMult() : 1;

	if (game.global.world > 200 && typeof (game.global.gridArray[game.global.lastClearedCell + 1].u2Mutation) !== 'undefined') {
		if (!game.global.mapsActive) {
			if (game.global.gridArray[game.global.lastClearedCell + 1].u2Mutation.length > 0) {
				var cell = game.global.gridArray[game.global.lastClearedCell + 1]
				if (cell.u2Mutation.indexOf('RGE') !== -1 || (cell.cc && cell.cc[3] > 0)) attack *= u2Mutations.types.Rage.enemyAttackMult();
			}
			attack *= game.global.novaMutStacks > 0 ? u2Mutations.types.Nova.enemyAttackMult() : 1;
		}
	}
	return attack;
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
	healthMulti *= game.global.universe === 2 && u2Mutations.tree.Health.purchased ? 1.5 : 1;
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

function gammaMaxStacks(specialChall, actualCheck) {
	var gammaMaxStacks = 5
	if (autoBattle.oneTimers.Burstier.owned) gammaMaxStacks--;
	if (Fluffy.isRewardActive("scruffBurst")) gammaMaxStacks--;
	if (actualCheck && MODULES.heirlooms.gammaBurstPct === 1) return 1;
	if (MODULES.heirlooms.gammaBurstPct === 1 || (specialChall && game.global.mapsActive)) gammaMaxStacks = Infinity;
	return gammaMaxStacks;
}

//Check and update each patch!
function simpleSeconds_AT(what, seconds, workerRatio) {
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
		case 'food':
			jobName = 'Farmer';
			pos = 0
			break;
		case 'wood':
			jobName = 'Lumberjack';
			pos = 1
			break;
		case 'metal':
			jobName = 'Miner';
			pos = 2
			break;
		case 'gems':
			jobName = 'Dragimp';
			break;
		case 'fragments':
			jobName = 'Explorer';
			break;
		case 'science':
			jobName = 'Scientist';
			pos = 3
			break;
	}
	var heirloom = !jobName ? null :
		jobName === 'Miner' && challengeActive('Pandemonium') && getPageSetting('pandemoniumStaff') !== 'undefined' ? 'pandemoniumStaff' :
			jobName === 'Farmer' && getPageSetting('heirloomStaffFood') !== 'undefined' ? ('heirloomStaffFood') :
				jobName === 'Lumberjack' && getPageSetting('heirloomStaffWood') !== 'undefined' ? ('heirloomStaffWood') :
					jobName === 'Miner' && getPageSetting('heirloomStaffMetal') !== 'undefined' ? ('heirloomStaffMetal') :
						getPageSetting('heirloomStaffMap') !== 'undefined' ? ('heirloomStaffMap') :
							getPageSetting('heirloomStaffWorld') !== 'undefined' ? ('heirloomStaffWorld') :
								null;
	if (game.global.StaffEquipped.name !== heirloom && heirloomSearch(heirloom) === undefined) heirloom = null;
	var job = game.jobs[jobName];
	var trimpworkers = (game.resources.trimps.realMax() / 2) - game.jobs.Explorer.owned - game.jobs.Meteorologist.owned - game.jobs.Worshipper.owned;
	if (challengeActive('Trappapalooza')) trimpworkers = game.resources.trimps.owned;
	var workers = workerRatio !== null ? Math.floor(trimpworkers * desiredRatios[pos] / totalFraction) :
		mapSettings.mapName === 'Worshipper Farm' ? trimpworkers :
			job.owned;

	var amt = workers * job.modifier * seconds;
	amt += amt * getPerkLevel('Motivation') * game.portal.Motivation.modifier;
	if (what !== 'gems' && game.permaBoneBonuses.multitasking.owned > 0)
		amt *= 1 + game.permaBoneBonuses.multitasking.mult();
	if (what !== 'science' && what !== 'fragments' && challengeActive('Alchemy'))
		amt *= alchObj.getPotionEffect('Potion of Finding');
	if (challengeActive('Frigid'))
		amt *= game.challenges.Frigid.getShatteredMult();
	if (game.global.pandCompletions && game.global.universe === 2 && what !== 'fragments')
		amt *= game.challenges.Pandemonium.getTrimpMult();
	if (game.global.desoCompletions && game.global.universe === 2 && what !== 'fragments')
		amt *= game.challenges.Desolation.getTrimpMult();
	if (getPerkLevel('Observation') > 0 && game.portal.Observation.trinkets > 0)
		amt *= game.portal.Observation.getMult();

	if (what === 'food' || what === 'wood' || what === 'metal') {
		if (workerRatio)
			amt *= calculateParityBonus_AT(desiredRatios, heirloomSearch(heirloom));
		else
			amt *= getParityBonus();
		if (autoBattle.oneTimers.Gathermate.owned)
			amt *= autoBattle.oneTimers.Gathermate.getMult();
	}
	if (((what === 'food' || (what === 'wood')) && game.buildings.Antenna.owned >= 5) || (what === 'metal' && game.buildings.Antenna.owned >= 15))
		amt *= game.jobs.Meteorologist.getExtraMult();
	if (Fluffy.isRewardActive('gatherer'))
		amt *= 2;
	if (challengeActive('Unbalance'))
		amt *= game.challenges.Unbalance.getGatherMult();

	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.famine !== 'undefined' && what !== 'fragments' && what !== 'science')
			amt *= dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
		if (typeof game.global.dailyChallenge.dedication !== 'undefined')
			amt *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
	}
	if (challengeActive('Melt')) {
		amt *= 10;
		amt *= Math.pow(game.challenges.Melt.decayValue, game.challenges.Melt.stacks);
	}

	if (game.challenges.Nurture.boostsActive())
		amt *= game.challenges.Nurture.getResourceBoost();

	if (what === 'wood' && challengeActive('Hypothermia') && game.challenges.Hypothermia.bonfires > 0)
		amt *= game.challenges.Hypothermia.getWoodMult();

	if (challengeActive('Desolation'))
		amt *= game.challenges.Desolation.trimpResourceMult();
	//Calculating heirloom bonus
	if (heirloom === null)
		amt = calcHeirloomBonus("Staff", jobName + "Speed", amt);
	else
		amt = calcHeirloomBonus_AT('Staff', jobName + "Speed", amt, false, heirloom);

	var turkimpBonus = game.talents.turkimp2.purchased ? 2 : game.talents.turkimp2.purchased ? 1.75 : 1.5;

	if ((game.talents.turkimp2.purchased || game.global.turkimpTimer > 0) && (what === 'food' || what === 'metal' || what === 'wood')) {
		amt *= turkimpBonus;
		amt += getPlayerModifier() * seconds;
	}
	return amt;
}

//Check and update each patch!
function scaleToCurrentMap_AT(amt, ignoreBonuses, ignoreScry, map) {
	if (map) map = game.global.world + map;
	if (!map) map = game.global.mapsActive ? getCurrentMapObject().level :
		challengeActive('Pandemonium') ? game.global.world - 1 :
			game.global.world;
	game.global.world + map;
	var compare = game.global.world;
	if (map > compare && map.location !== "Bionic") {
		amt *= Math.pow(1.1, (map - compare));
	} else {
		if (game.talents.mapLoot.purchased)
			compare--;
		if (map < compare) {
			//-20% loot compounding for each level below world
			amt *= Math.pow(0.8, (compare - map));
		}
	}
	if (ignoreBonuses) return amt;
	//Add map loot bonus
	var maploot = game.global.farmlandsUnlocked && game.singleRunBonuses.goldMaps.owned ? 3.6 : game.global.decayDone && game.singleRunBonuses.goldMaps.owned ? 2.85 : game.global.farmlandsUnlocked ? 2.6 : game.global.decayDone ? 1.85 : 1.6;
	amt = Math.round(amt * maploot);
	amt = scaleLootBonuses(amt, ignoreScry);
	return amt;
}

//Check and update each patch!
function calculateParityBonus_AT(workerRatio, heirloom) {
	if (!game.global.StaffEquipped || game.global.StaffEquipped.rarity < 10) {
		game.global.parityBonus = 1;
		return 1;
	}
	var allowed = ['Farmer', 'Lumberjack', 'Miner'];
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
		var freeWorkerDivided = Math.max(1, (freeWorkers / ratio));

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
	return finalWithParity;
}

//Check and update each patch!
function calculateMaxAfford_AT(itemObj, isBuilding, isEquipment, isJob, forceMax, forceRatio, resources) {
	if (!itemObj.cost) return 1;
	var mostAfford = -1;
	if (Number.isInteger(forceMax)) forceMax = forceMax;
	//if (!forceMax) var forceMax = false;
	var forceMax = Number.isInteger(forceMax) ? forceMax : false;
	var currentOwned = (itemObj.purchased) ? itemObj.purchased : ((itemObj.level) ? itemObj.level : itemObj.owned);
	if (!currentOwned) currentOwned = 0;
	if (isJob && game.global.firing && !forceRatio) return Math.floor(currentOwned * game.global.maxSplit);
	for (var item in itemObj.cost) {
		var price = itemObj.cost[item];
		var toBuy;
		var resource = game.resources[item];
		var resourcesAvailable = !resources ? resource.owned : resources;
		if (resourcesAvailable < 0) resourcesAvailable = 0;
		if (game.global.maxSplit !== 1 && !forceMax && !forceRatio) resourcesAvailable = Math.floor(resourcesAvailable * game.global.maxSplit);
		else if (forceRatio) resourcesAvailable = Math.floor(resourcesAvailable * forceRatio);

		if (item === 'fragments' && game.global.universe === 2) {
			var buildingSetting = getPageSetting('buildingSettingsArray');
			resourcesAvailable = buildingSetting.SafeGateway && buildingSetting.SafeGateway.zone !== 0 && game.global.world >= buildingSetting.SafeGateway.zone ? resourcesAvailable :
				buildingSetting.SafeGateway.enabled && resourcesAvailable > resource.owned - (mapCost(10, 'lmc') * buildingSetting.SafeGateway.mapCount) ? resource.owned - (mapCost(10, 'lmc') * buildingSetting.SafeGateway.mapCount) :
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
		if (mostAfford === -1 || mostAfford > toBuy) mostAfford = toBuy;
	}
	if (forceRatio && (mostAfford <= 0 || isNaN(mostAfford))) return 0;
	if (isBuilding && mostAfford > 1000000000) return 1000000000;
	if (mostAfford <= 0) return 1;
	if (forceMax !== false && mostAfford > forceMax) return forceMax;
	if (isJob && itemObj.max && itemObj.owned + mostAfford > itemObj.max) return (itemObj.max - itemObj.owned);
	return mostAfford;
}

function equalityQuery(enemyName, zone, currentCell, mapType, difficulty, farmType, forceOK, hits, hdCheck) {

	if (Object.keys(game.global.gridArray).length === 0) return 0;
	if (game.portal.Equality.radLevel === 0 || game.global.universe === 1) return 0;

	if (!enemyName) enemyName = 'Snimp';
	if (!zone) zone = game.global.world;
	if (!mapType) mapType = 'world'
	if (!currentCell) currentCell = mapType === 'world' || mapType === 'void' ? 98 : 20;
	if (!difficulty) difficulty = 1;
	if (!farmType) farmType = 'gamma';

	const bionicTalent = zone - game.global.world;
	const checkMutations = mapType === 'world' && zone > 200;
	const titimp = mapType !== 'world' && farmType === 'oneShot' ? 'force' : false;
	const dailyEmpowerToggle = getPageSetting('empowerAutoEquality');
	const isDaily = challengeActive('Daily');
	const dailyEmpower = isDaily && typeof game.global.dailyChallenge.empower !== 'undefined'; //Empower
	const dailyCrit = isDaily && typeof game.global.dailyChallenge.crits !== 'undefined'; //Crit
	const dailyExplosive = isDaily && typeof game.global.dailyChallenge.explosive !== 'undefined' //Explosive
	const dailyBloodthirst = isDaily && typeof game.global.dailyChallenge.bloodthirst !== 'undefined'; //Bloodthirst (enemy heal + atk)
	const maxEquality = game.portal.Equality.radLevel;
	const overkillCount = maxOneShotPower(true);

	var critType = 'maybe';
	if (challengeActive('Wither') || challengeActive('Glass') || challengeActive('Duel')) critType = 'never';

	//Challenge conditions
	var runningUnlucky = challengeActive('Unlucky');
	var runningQuest = ((challengeActive('Quest') && currQuest() === 8) || challengeActive('Bublé')); //Shield break quest

	//Initialising name/health/dmg variables
	//Enemy stats
	if (enemyName === 'Improbability' && zone <= 58) enemyName = 'Blimp';
	var enemyHealth = calcEnemyHealth(mapType, zone, currentCell, enemyName) * difficulty;
	var enemyDmg = calcEnemyAttack(mapType, zone, currentCell, enemyName, false, false, 0) * difficulty;

	if (mapType === 'map' && dailyCrit || dailyExplosive) {
		if (dailyExplosive) enemyDmg *= 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength);
		if (dailyEmpowerToggle && dailyCrit) enemyDmg *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
	}
	else if (mapType === 'world' && (dailyEmpower && (dailyCrit || dailyExplosive) || hits)) {
		//if (dailyExplosive) enemyDmg *= 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength);
		if (dailyCrit) enemyDmg *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
	}
	else if (hits) {
		if (dailyCrit) enemyDmg *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
	}

	if (challengeActive('Duel')) {
		enemyDmg *= 10;
		if (game.challenges.Duel.trimpStacks >= 50) enemyDmg *= 3;
	}
	//Our stats
	var dmgType = runningUnlucky ? 'max' : 'avg';
	var ourHealth = calcOurHealth(runningQuest, mapType);
	var ourDmg = calcOurDmg(dmgType, 0, false, mapType, critType, bionicTalent, titimp);

	var unluckyDmg = runningUnlucky ? Number(calcOurDmg('min', 0, false, mapType, 'never', bionicTalent, titimp)) : 2;

	//Figuring out gamma to proc value
	var gammaToTrigger = gammaMaxStacks();

	if (checkMutations) {
		enemyDmg = calcEnemyAttack(mapType, zone, currentCell, enemyName, false, calcMutationAttack(zone), 0);
		enemyHealth = calcEnemyHealth(mapType, zone, currentCell, enemyName, calcMutationHealth(zone));
	}
	if (!hits) hits = 1;
	enemyDmg *= hits;

	if (forceOK) {
		if (!runningUnlucky && (zone - game.global.world) > 0) dmgType = 'min';
		enemyHealth *= (1 * overkillCount);
	}
	if (challengeActive('Duel')) ourDmg *= MODULES.heirlooms.gammaBurstPct;

	if (isDaily && typeof game.global.dailyChallenge.weakness !== 'undefined') ourDmg *= (1 - ((mapType === 'map' ? 9 : gammaToTrigger) * game.global.dailyChallenge.weakness.strength) / 100);

	var ourDmgEquality = 0;
	var enemyDmgEquality = 0;
	var unluckyDmgEquality = 0;
	const ourEqualityModifier = getPlayerEqualityMult_AT(heirloomShieldToEquip(mapType));
	const enemyEqualityModifier = game.portal.Equality.getModifier();

	//Accounting for enemies hitting multiple times per gamma burst
	if (hdCheck && mapType !== 'map') {
		const enemyDmgMaxEq = enemyDmg * Math.pow(enemyEqualityModifier, maxEquality);
		ourHealth -= (enemyDmgMaxEq * (gammaMaxStacks() - 1));
	}

	if (enemyHealth !== 0) {
		for (var i = 0; i <= maxEquality; i++) {
			enemyDmgEquality = enemyDmg * Math.pow(enemyEqualityModifier, i);
			ourDmgEquality = ourDmg * Math.pow(ourEqualityModifier, i);
			if (runningUnlucky) {
				unluckyDmgEquality = unluckyDmg * Math.pow(ourEqualityModifier, i);
				if (unluckyDmgEquality.toString()[0] % 2 === 1 && i !== maxEquality) continue;
			}
			if (farmType === 'gamma' && ourHealth >= enemyDmgEquality) {
				return i;
			}
			else if (farmType === 'oneShot' && ourDmgEquality > enemyHealth && ourHealth > enemyDmgEquality) {
				return i;
			}
			else if (i === maxEquality) {
				return i;
			}
		}
	}
}

function remainingHealth(forceAngelic, mapType) {
	if (!forceAngelic) forceAngelic = false;
	if (!mapType) mapType = 'world';
	var heirloomToCheck = heirloomShieldToEquip(mapType);

	const correctHeirloom = heirloomToCheck !== undefined ? getPageSetting(heirloomToCheck) === game.global.ShieldEquipped.name : true;
	const currentShield = calcHeirloomBonus_AT('Shield', 'trimpHealth', 1, true) / 100;
	const newShield = calcHeirloomBonus_AT('Shield', 'trimpHealth', 1, true, heirloomToCheck) / 100;

	var soldierHealth = game.global.soldierHealth;
	var soldierHealthMax = game.global.soldierHealthMax;
	var shieldHealth = 0;

	//Fix our health to the correct new value if we are changing heirlooms
	if (!correctHeirloom) {
		soldierHealth /= 1 + currentShield;
		soldierHealth *= 1 + newShield;
		soldierHealthMax /= 1 + currentShield;
		soldierHealthMax *= 1 + newShield;
	}

	if (game.global.universe === 2) {
		var maxLayers = Fluffy.isRewardActive('shieldlayer');
		var layers = maxLayers - game.global.shieldLayersUsed;

		var shieldMax = game.global.soldierEnergyShieldMax;
		var shieldCurr = game.global.soldierEnergyShield;

		//Fix our shield to the correct new value if we are changing heirlooms
		if (!correctHeirloom) {
			energyShieldMult = getEnergyShieldMult_AT(mapType, true);
			const newShieldMult = getHeirloomBonus_AT('Shield', 'prismatic', heirloomToCheck) / 100;
			const shieldPrismatic = newShieldMult > 0 ? energyShieldMult + newShieldMult : energyShieldMult;
			currShieldPrismatic = energyShieldMult + getHeirloomBonus("Shield", "prismatic") / 100;

			if (currShieldPrismatic > 0) shieldMax /= currShieldPrismatic;
			shieldMax *= shieldPrismatic;
			if (currShieldPrismatic > 0) shieldCurr /= currShieldPrismatic;
			shieldCurr *= shieldPrismatic;
			shieldCurr /= 1 + currentShield;
			shieldCurr *= 1 + newShield;
		}

		if (maxLayers > 0) {
			var i;
			for (i = 0; i <= maxLayers; i++) {
				if (layers !== maxLayers && i > layers) {
					continue;
				}
				if (i === maxLayers - layers) {
					shieldHealth += shieldMax;
				}
				else
					shieldHealth += shieldCurr;
			}
		}
		else {
			shieldHealth = shieldCurr;
		}
		shieldHealth = shieldHealth < 0 ? 0 : shieldHealth;
	}
	//Subtracting Plauge daily mod from health
	if (typeof game.global.dailyChallenge.plague !== 'undefined')
		soldierHealth -= soldierHealthMax * dailyModifiers.plague.getMult(game.global.dailyChallenge.plague.strength, game.global.dailyChallenge.plague.stacks);

	var remainingHealth = shieldHealth + (forceAngelic ? soldierHealth * .33 : soldierHealth);
	if ((challengeActive('Quest') && currQuest() === 8) || challengeActive('Bublé'))
		remainingHealth = shieldHealth;
	if (shieldHealth + soldierHealth === 0) {
		remainingHealth = soldierHealthMax + (shieldMax * (maxLayers + 1))
		if ((challengeActive('Quest') && currQuest() === 8) || challengeActive('Bublé'))
			remainingHealth = shieldMax * (maxLayers + 1);
	}

	if (soldierHealth <= 0) return 0;
	return (remainingHealth)
}