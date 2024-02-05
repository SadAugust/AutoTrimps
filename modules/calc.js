class TrimpStats {
	constructor() {
		const { global, stats, talents, unlocks } = game;
		const { highestRadLevel, highestLevel } = stats;
		const { universe, runningChallengeSquared } = global;
		const { purchased: liquification3Purchased } = talents.liquification3;
		const { purchased: hyperspeed2Purchased } = talents.hyperspeed2;
		const { imps } = unlocks;

		this.isDaily = challengeActive('Daily');
		this.isC3 = runningChallengeSquared || ['Frigid', 'Experience', 'Mayhem', 'Pandemonium', 'Desolation'].some((challenge) => challengeActive(challenge));
		this.isOneOff = !runningChallengeSquared && autoPortalChallenges('oneOff', universe).slice(1).includes(game.global.challengeActive);
		this.isFiller = !(this.isDaily || this.isC3 || this.isOneOff);
		this.currChallenge = game.global.challengeActive;
		this.shieldBreak = challengeActive('Bublé') || getCurrentQuest() === 8;

		this.hze = universe === 2 ? highestRadLevel.valueTotal() : highestLevel.valueTotal();
		this.hypPct = liquification3Purchased ? 75 : hyperspeed2Purchased ? 50 : 0;
		this.hyperspeed2 = global.world <= Math.floor(this.hze * (this.hypPct / 100));
		this.autoMaps = getPageSetting('autoMaps') > 0;

		this.mapSize = talents.mapLoot2.purchased ? 20 : 25;
		this.mapDifficulty = 0.75;
		this.perfectMaps = this.hze >= universe === 2 ? 30 : 110;
		this.plusLevels = this.hze >= universe === 2 ? 50 : 210;
		this.mapSpecial = getAvailableSpecials('lmc');
		this.mapBiome = getBiome();

		this.mountainPriority = !(imps.Chronoimp || imps.Jestimp || ['lmc', 'smc'].includes(getAvailableSpecials('lmc', true)));
	}
}

class HDStats {
	constructor() {
		this.autoLevelInitial = hdStats.autoLevelInitial;
		this.autoLevelZone = hdStats.autoLevelZone;
		this.autoLevelData = hdStats.autoLevelData;
		this.autoLevelLoot = hdStats.autoLevelLoot;
		this.autoLevelSpeed = hdStats.autoLevelSpeed;

		const { world, universe } = game.global;

		const voidMaxTenacity = getPageSetting('voidMapSettings')[0].maxTenacity;

		let voidPercent = 4.5;
		if (world <= 59) {
			voidPercent -= 2;
			if (universe === 1) voidPercent /= 2;
		} else if (universe === 1 && world <= 199) {
			voidPercent -= 1;
		}

		const mapDifficulty = game.global.mapsActive && getCurrentMapObject().location === 'Bionic' ? 2.6 : 0.75;
		if (challengeActive('Mapocalypse')) voidPercent += 3;

		this.hdRatio = calcHDRatio(world, 'world', false, 1);
		this.hdRatioMap = calcHDRatio(world, 'map', false, mapDifficulty);
		this.hdRatioVoid = calcHDRatio(world, 'void', false, voidPercent);

		this.hdRatioPlus = calcHDRatio(world + 1, 'world', false, 1);
		this.hdRatioMapPlus = calcHDRatio(world + 1, 'map', false, mapDifficulty);
		this.hdRatioVoidPlus = calcHDRatio(world + 1, 'void', false, voidPercent);

		this.vhdRatio = voidMaxTenacity ? calcHDRatio(world, 'world', voidMaxTenacity, 1) : this.hdRatio;
		this.vhdRatioVoid = voidMaxTenacity ? calcHDRatio(world, 'void', voidMaxTenacity, voidPercent) : this.hdRatioVoid;
		this.vhdRatioVoidPlus = voidMaxTenacity ? calcHDRatio(world + 1, 'void', voidMaxTenacity, voidPercent) : this.hdRatioVoidPlus;

		this.hdRatioHeirloom = calcHDRatio(world, 'world', false, 1, false);

		this.hitsSurvived = calcHitsSurvived(world, 'world', 1);
		this.hitsSurvivedMap = calcHitsSurvived(world, 'map', mapDifficulty);
		this.hitsSurvivedVoid = calcHitsSurvived(world, 'void', voidPercent);

		this.autoLevel = autoMapLevel();

		const checkAutoLevel = this.autoLevelInitial === undefined ? true : usingRealTimeOffline ? atSettings.intervals.thirtySecond : atSettings.intervals.fiveSecond;

		if (checkAutoLevel) {
			this.autoLevelInitial = stats();
			this.autoLevelZone = world;
			this.autoLevelData = get_best(this.autoLevelInitial, true);

			const findResult = Object.entries(this.autoLevelInitial[0]).find(([key, data]) => data.mapLevel === 0);
			const worldMap = findResult ? findResult[1] : undefined;
			const { loot, speed } = this.autoLevelData;

			if (worldMap && worldMap[loot.stance] && worldMap[speed.stance]) {
				loot.mapLevel = loot.mapLevel === -1 && loot.value === worldMap[loot.stance].value ? 0 : loot.mapLevel;
				speed.mapLevel = speed.mapLevel === -1 && speed.killSpeed === worldMap[speed.stance].killSpeed ? 0 : speed.mapLevel;
			}

			this.autoLevelLoot = this.autoLevelData.loot.mapLevel;
			this.autoLevelSpeed = this.autoLevelData.speed.mapLevel;
		}
	}
}

function getCurrentWorldCell() {
	return game.global.gridArray.length > 0 ? game.global.gridArray[game.global.lastClearedCell + 1] : { level: 1 };
}

function debugCalc() {
	if (game.global.preMapsActive) return;

	const mapping = game.global.mapsActive;
	const mapObject = mapping ? getCurrentMapObject() : { level: game.global.world, difficulty: 1 };
	const currentCell = mapping ? getCurrentMapCell() : getCurrentWorldCell();
	const currentEnemy = getCurrentEnemy();

	const mapType = !mapping ? 'world' : mapObject.location === 'Void' ? 'void' : 'map';
	const zone = mapObject.level;
	const cell = currentCell ? currentCell.level : 1;
	const difficulty = mapObject.difficulty;

	const name = currentEnemy ? currentEnemy.name : 'Chimp';
	const equality = game.global.universe === 2 ? Math.pow(game.portal.Equality.getModifier(), game.portal.Equality.disabledStackCount) : 1;
	const enemyMin = calcEnemyAttackCore(mapType, zone, cell, name, true, false, 0) * difficulty;
	const enemyMax = calcEnemyAttackCore(mapType, zone, cell, name, false, false, 0) * difficulty;
	const mapLevel = mapping && game.talents.bionic2.purchased ? zone - game.global.world : 0;
	const equalityStackCount = game.global.universe === 2 ? game.portal.Equality.disabledStackCount : false;
	const isUniverse1 = game.global.universe !== 2;

	const displayedMin = calcOurDmg('min', equalityStackCount, true, mapType, 'never', mapLevel, true);
	const displayedMax = calcOurDmg('max', equalityStackCount, true, mapType, 'never', mapLevel, true);

	debug(`Our Stats`);
	debug(`Our Attack: ${displayedMin.toExponential(2)} - ${displayedMax.toExponential(2)}`);
	debug(`Our Health: ${calcOurHealth(isUniverse1, mapType).toExponential(2)}`);
	if (game.global.universe === 1) debug(`Our Block: ${calcOurBlock(true, true).toExponential(2)}`);
	if (game.global.universe === 2) debug(`Our Equality: ${game.portal.Equality.disabledStackCount}`);
	debug(`Our Crit: ${100 * getPlayerCritChance().toExponential(2)}% for ${getPlayerCritDamageMult().toFixed(2)}x damage. Average of ${getCritMulti('maybe').toFixed(2)}x`);

	debug(`Enemy Stats`);
	debug(`Enemy Attack: ${(enemyMin * equality).toExponential(2)} - ${(enemyMax * equality).toExponential(2)}`);
	debug(`Enemy Health: ${(calcEnemyHealthCore(mapType, zone, cell, name) * difficulty).toExponential(2)}`);
}

function calcEquipment(type = 'attack') {
	let bonus = 0;
	let equipmentList;

	if (type === 'attack') equipmentList = ['Dagger', 'Mace', 'Polearm', 'Battleaxe', 'Greatsword', 'Arbalest'];
	else equipmentList = ['Shield', 'Boots', 'Helmet', 'Pants', 'Shoulderguards', 'Breastplate', 'Gambeson'];

	for (let i = 0; i < equipmentList.length; i++) {
		let equip = game.equipment[equipmentList[i]];
		if (equip.locked !== 0) continue;
		bonus += equip.level * (type === 'attack' ? equip.attackCalculated : equip.healthCalculated);
	}

	return bonus;
}

function getTrimpAttack(realDamage) {
	if (realDamage) return game.global.soldierCurrentAttack;

	let dmg = (6 + calcEquipment('attack')) * game.resources.trimps.maxSoldiers;
	if (mutations.Magma.active()) dmg *= mutations.Magma.getTrimpDecay();
	if (getPerkLevel('Power') > 0) dmg *= 1 + getPerkLevel('Power') * getPerkModifier('Power');
	if (getPerkLevel('Power_II') > 0) dmg *= 1 + getPerkModifier('Power_II') * getPerkLevel('Power_II');
	if (game.global.universe === 1 && game.global.formation !== 0 && game.global.formation !== 5) dmg *= game.global.formation === 2 ? 4 : 0.5;

	return dmg;
}

function applyMultipliers(multipliers, stat, challenge, postChallengeCheck) {
	Object.keys(multipliers).forEach((key) => {
		if (challenge && postChallengeCheck && key === 'Nurture' && game.challenges.Nurture.boostsActive()) stat *= multipliers[key]();
		else if (challenge) stat *= challengeActive(key) ? multipliers[key]() : 1;
		else stat *= multipliers[key]();
	});
	return stat;
}

function getTrimpHealth(realHealth, mapType) {
	if (realHealth) return game.global.soldierHealthMax;

	const heirloomToCheck = typeof atSettings !== 'undefined' ? heirloomShieldToEquip(mapType) : null;

	let health = (50 + calcEquipment('health')) * game.resources.trimps.maxSoldiers;

	const healthMultipliers = {
		toughness: () => (getPerkLevel('Toughness') > 0 ? 1 + getPerkLevel('Toughness') * getPerkModifier('Toughness') : 1),
		resilience: () => (getPerkLevel('Resilience') > 0 ? Math.pow(getPerkModifier('Resilience') + 1, getPerkLevel('Resilience')) : 1),
		goldenBattle: () => 1 + game.goldenUpgrades.Battle.currentBonus,
		challengeSquared: () => 1 + game.global.totalSquaredReward / 100,
		mapHealth: () => (mapType !== 'world' && game.talents.mapHealth.purchased ? 2 : 1),
		voidPower: () => (mapType === 'void' && game.talents.voidPower.purchased ? 1 + game.talents.voidPower.getTotalVP() / 100 : 1),
		mayhem: () => game.challenges.Mayhem.getTrimpMult(),
		pandemonium: () => game.challenges.Pandemonium.getTrimpMult(),
		desolation: () => game.challenges.Desolation.getTrimpMult()
	};
	health = applyMultipliers(healthMultipliers, health);

	const heirloomHealth = typeof atSettings !== 'undefined' ? calcHeirloomBonus_AT('Shield', 'trimpHealth', 1, true, heirloomToCheck) : calcHeirloomBonus('Shield', 'trimpHealth', 1, true);
	health *= heirloomHealth > 1 ? 1 + heirloomHealth / 100 : 1;

	if (game.global.universe === 1) {
		const healthMultipliers = {
			formation: () => (game.global.formation !== 0 && game.global.formation !== 5 ? (game.global.formation === 1 ? 4 : 0.5) : 1),
			geneticist: () => (game.jobs.Geneticist.owned > 0 ? Math.pow(1.01, game.global.lastLowGen) : 1),
			amalgamator: () => game.jobs.Amalgamator.getHealthMult(),
			toughness_II: () => (getPerkLevel('Toughness_II') > 0 ? 1 + getPerkLevel('Toughness_II') * getPerkModifier('Toughness_II') : 1),
			magma: () => mutations.Magma.getTrimpDecay(),
			frigid: () => game.challenges.Frigid.getTrimpMult()
		};
		health = applyMultipliers(healthMultipliers, health);

		const challengeMultipliers = {
			Balance: () => game.challenges.Balance.getHealthMult(),
			Life: () => game.challenges.Life.getHealthMult()
		};
		health = applyMultipliers(challengeMultipliers, health, true);
	}

	if (game.global.universe === 2) {
		const healthMultipliers = {
			smithy: () => game.buildings.Smithy.getMult(),
			healthy: () => (Fluffy.isRewardActive('healthy') ? 1.5 : 1),
			spireStats: () => autoBattle.bonuses.Stats.getMult(),
			championism: () => game.portal.Championism.getMult(),
			antenna: () => (game.buildings.Antenna.owned >= 10 ? game.jobs.Meteorologist.getExtraMult() : 1),
			observation: () => game.portal.Observation.getMult(),
			mutatorHealth: () => (u2Mutations.tree.Health.purchased ? 1.5 : 1),
			geneHealth: () => (u2Mutations.tree.GeneHealth.purchased ? 10 : 1)
		};
		health = applyMultipliers(healthMultipliers, health);

		const challengeMultipliers = {
			Wither: () => (game.challenges.Wither.trimpStacks > 0 ? game.challenges.Wither.getTrimpHealthMult() : 1),
			Revenge: () => (game.challenges.Revenge.stacks > 0 ? game.challenges.Revenge.getMult() : 1),
			Insanity: () => game.challenges.Insanity.getHealthMult(),
			Berserk: () => game.challenges.Berserk.getHealthMult(game.challenges.Berserk.frenzyStacks <= 0),
			Nurture: () => game.challenges.Nurture.getStatBoost(),
			Alchemy: () => alchObj.getPotionEffect('Potion of Strength'),
			Desolation: () => game.challenges.Desolation.trimpHealthMult(),
			Smithless: () => (game.challenges.Smithless.fakeSmithies > 0 ? Math.pow(1.25, game.challenges.Smithless.fakeSmithies) : 1)
		};
		health = applyMultipliers(challengeMultipliers, health, true, true);
	}

	health *= typeof game.global.dailyChallenge.pressure !== 'undefined' ? dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks) : 1;

	return health;
}

function calcOurHealth(stance = false, mapType, realHealth = false, fullGeneticist) {
	if (!mapType) mapType = !game.global.mapsActive ? 'world' : game.global.voidBuff ? 'void' : 'map';

	let health = getTrimpHealth(realHealth, mapType);
	if (game.global.universe === 1) {
		if (!stance && game.global.formation !== 0 && game.global.formation !== 5) health /= game.global.formation === 1 ? 4 : 0.5;

		const geneticist = game.jobs.Geneticist;
		if (fullGeneticist && geneticist.owned > 0) health *= Math.pow(1.01, geneticist.owned - game.global.lastLowGen);
	}
	if (game.global.universe === 2) {
		let shield = typeof atSettings !== 'undefined' ? getEnergyShieldMult_AT(mapType) : getEnergyShieldMult();
		shield = health * (1 + shield * (1 + Fluffy.isRewardActive('shieldlayer'))) - health;
		if (stance) return shield;
		else health += shield;
	}

	return health;
}

function calcOurBlock(stance, realBlock) {
	if (game.global.universe === 2) return 0;

	let block = 0;

	if (realBlock) {
		block = game.global.soldierCurrentBlock;
		if (stance || game.global.formation === 0) return block;
		if (game.global.formation === 3) return block / 4;
		return block * 2;
	}

	const gym = game.buildings.Gym;
	if (gym.owned > 0) block += gym.owned * gym.increase.by;

	const shield = game.equipment.Shield;
	if (shield.blockNow && shield.level > 0) block += shield.level * shield.blockCalculated;

	const trainer = game.jobs.Trainer;
	if (trainer.owned > 0) {
		const trainerStrength = trainer.owned * (trainer.modifier / 100);
		block *= 1 + calcHeirloomBonus('Shield', 'trainerEfficiency', trainerStrength);
	}

	block *= game.resources.trimps.maxSoldiers;

	if (stance && game.global.formation !== 0) block *= game.global.formation === 3 ? 4 : 0.5;

	const heirloomBonus = calcHeirloomBonus('Shield', 'trimpBlock', 0, true);
	if (heirloomBonus > 0) block *= heirloomBonus / 100 + 1;

	return block;
}

function calcHitsSurvived(targetZone = game.global.world, type = 'world', difficulty = 1, checkOutputs) {
	const formationMod = game.upgrades.Dominance.done ? 2 : 1;
	const ignoreCrits = getPageSetting('IgnoreCrits');

	if (type !== 'map' && targetZone % 2 === 1 && challengeActive('Lead')) targetZone++;

	const customAttack = _calcHitsSurvivedAttack(type, targetZone);
	const enemyName = type === 'void' ? 'Cthulimp' : targetZone >= 59 ? 'Improbability' : 'Snimp';

	let hitsToSurvive = targetHitsSurvived(false, type);
	if (hitsToSurvive === 0) hitsToSurvive = 1;

	const health = calcOurHealth(false, type, false, true) / formationMod;
	const block = calcOurBlock(false) / formationMod;
	const equality = equalityQuery(enemyName, targetZone, 100, type, difficulty, 'gamma', null, hitsToSurvive);
	let damageMult = 1;

	if (game.global.universe === 1 && ((ignoreCrits === 1 && type !== 'void') || ignoreCrits === 0)) {
		const dailyCrit = challengeActive('Daily') && typeof game.global.dailyChallenge.crits !== 'undefined';
		const crushed = challengeActive('Crushed');
		if (dailyCrit) damageMult = dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
		else if (crushed && health > block) damageMult = 3;
	}

	const worldDamage = calcEnemyAttack(type, targetZone, 100, enemyName, undefined, customAttack, equality) * difficulty;
	const pierce = (game.global.universe === 1 && game.global.brokenPlanet && type === 'world' ? getPierceAmt() : 0) * (game.global.formation === 3 ? 2 : 1);
	const finalDmg = Math.max(damageMult * worldDamage - block, worldDamage * pierce, 0);

	if (checkOutputs) _calcHitsSurvivedDebug(targetZone, damageMult, worldDamage, equality, block, pierce, health, hitsToSurvive, finalDmg);

	return health / finalDmg;
}

function _calcHitsSurvivedAttack(type, targetZone) {
	if (type !== 'world') return undefined;

	const { universe, spireActive, usingShriek } = game.global;
	let customAttack;

	if (universe === 1) {
		if (spireActive) {
			customAttack = calcSpire('attack');
			if (exitSpireCell(true) === 100 && usingShriek) customAttack *= game.mapUnlocks.roboTrimp.getShriekValue();
		} else if (isCorruptionActive(targetZone)) customAttack = calcCorruptedAttack(targetZone);
	} else if (universe === 2 && targetZone > 200) {
		customAttack = calcMutationAttack(targetZone);
	}

	return customAttack;
}

function _calcHitsSurvivedDebug(targetZone, damageMult, worldDamage, equality, block, pierce, health, hitsToSurvive, finalDmg) {
	debug(`Target Zone: ${targetZone}`, `debug`);
	debug(`Damage Mult: ${damageMult}`, `debug`);
	debug(`World Damage: ${worldDamage}`, `debug`);
	if (game.global.universe === 1) debug(`Block: ${block}`, `debug`);
	if (game.global.universe === 1) debug(`Pierce: ${pierce}`, `debug`);
	if (game.global.universe === 2) debug(`Equality: ${equality}`, `debug`);
	debug(`Health: ${health}`, `debug`);
	debug(`Hits to Survive: ${hitsToSurvive}`, `debug`);
	debug(`finalDmg: ${finalDmg}`, `debug`);
}

function targetHitsSurvived(skipHDCheck, mapType) {
	if (!skipHDCheck && mapSettings.mapName === 'Hits Survived') return mapSettings.hdRatio;
	if (mapType === 'void') return Number(getPageSetting('voidMapSettings')[0].hitsSurvived);
	if (isDoingSpire()) return getPageSetting('hitsSurvivedSpire');
	return getPageSetting('hitsSurvived');
}

function whichHitsSurvived() {
	const mapType = game.global.mapsActive ? getCurrentMapObject().location : { location: 'world' };
	if (mapType.location === 'Void' || (mapSettings.voidHitsSurvived && trimpStats.autoMaps)) return hdStats.hitsSurvivedVoid;
	else if (mapType.location === 'Bionic' || (mapSettings.mapName === 'Bionic Raiding' && trimpStats.autoMaps)) return hdStats.hitsSurvivedMap;
	return hdStats.hitsSurvived;
}

function addPoison(realDamage, zone = game.global.world) {
	if (getEmpowerment(zone) !== 'Poison') return 0;
	if (realDamage) return game.empowerments.Poison.getDamage();
	//Dynamically determines how much we are benefiting from poison based on Current Amount * Transfer Rate
	if (getPageSetting('addpoison')) return game.empowerments.Poison.getDamage() * getRetainModifier('Poison');
	return 0;
}

function getCritMulti(crit, customShield) {
	const critD = typeof atSettings !== 'undefined' ? getPlayerCritDamageMult_AT(customShield) : getPlayerCritDamageMult();
	let critChance = typeof atSettings !== 'undefined' ? getPlayerCritChance_AT(customShield) : getPlayerCritChance();
	if (crit === 'never') critChance = Math.floor(critChance);
	else if (crit === 'force') critChance = Math.ceil(critChance);

	const lowTierMulti = getMegaCritDamageMult(Math.floor(critChance));
	const highTierMulti = getMegaCritDamageMult(Math.ceil(critChance));
	const highTierChance = critChance - Math.floor(critChance);

	let critDHModifier;
	if (critChance < 0) critDHModifier = 1 + critChance - critChance / 5;
	else if (critChance < 1) critDHModifier = 1 - critChance + critChance * critD;
	else if (critChance < 2) critDHModifier = (critChance - 1) * getMegaCritDamageMult(2) * critD + (2 - critChance) * critD;
	else if (critChance >= 2 && (crit === 'never' || crit === 'force')) critDHModifier = lowTierMulti * critD;
	else if (critChance >= 2) critDHModifier = ((1 - highTierChance) * lowTierMulti + highTierChance * highTierMulti) * critD;
	else critDHModifier = (critChance - 2) * Math.pow(getMegaCritDamageMult(critChance), 2) * critD + (3 - critChance) * getMegaCritDamageMult(critChance) * critD;

	return critDHModifier;
}

function getAnticipationBonus(stacks = game.global.antiStacks) {
	const maxStacks = game.talents.patience.purchased ? 45 : 30;
	const perkMult = getPerkLevel('Anticipation') * getPerkModifier('Anticipation');
	const stacks45 = typeof autoTrimpSettings === 'undefined' ? maxStacks : getPageSetting('45stacks');

	return stacks45 ? 1 + maxStacks * perkMult : 1 + stacks * perkMult;
}

function calcOurDmg(minMaxAvg = 'avg', equality, realDamage = false, mapType, critMode = 'maybe', mapLevel, useTitimp = false, specificHeirloom = false) {
	if (!mapType) mapType = !game.global.mapsActive ? 'world' : getCurrentMapObject().location === 'Void' ? 'void' : 'map';
	if (!mapLevel) mapLevel = mapType === 'world' || !game.global.mapsActive ? 0 : getCurrentMapObject().level - game.global.world;

	const specificStance = game.global.universe === 1 ? equality : false;
	heirloomToCheck = typeof autoTrimpSettings === 'undefined' ? null : !specificHeirloom ? heirloomShieldToEquip(mapType) : specificHeirloom;

	let attack = getTrimpAttack(realDamage);
	const fluctChallenge = challengeActive('Discipline') || challengeActive('Unlucky');
	let minFluct = fluctChallenge ? 0.005 : 0.8;
	let maxFluct = fluctChallenge ? 1.995 : 1.2;
	if (!fluctChallenge && getPerkLevel('Range') > 0) minFluct += 0.02 * getPerkLevel('Range');

	const damageModifiers = {
		achievementBonus: () => 1 + game.global.achievementBonus / 100,
		goldenBattle: () => 1 + game.goldenUpgrades.Battle.currentBonus,
		challengeSquared: () => 1 + game.global.totalSquaredReward / 100,
		titimp: () => (mapType !== 'world' && useTitimp === 'force' ? 2 : mapType !== 'world' && mapType !== '' && useTitimp && game.global.titimpLeft > 0 ? 2 : 1),
		roboTrimp: () => 1 + 0.2 * game.global.roboTrimpLevel,
		mapBattery: () => (mapType !== 'world' ? 1 : game.talents.mapBattery.purchased && game.global.mapBonus === 10 ? 5 : 1 + game.global.mapBonus * 0.2),
		herbalist: () => (game.talents.herbalist.purchased ? game.talents.herbalist.getBonus() : 1),
		bionic2: () => (mapType === 'map' && game.talents.bionic2.purchased && mapLevel > 0 ? 1.5 : 1),
		voidPower: () => (mapType === 'void' && game.talents.voidPower.purchased ? 1 + game.talents.voidPower.getTotalVP() / 100 : 1),
		voidMastery: () => (mapType === 'void' && game.talents.voidMastery.purchased ? 5 : 1),
		fluffy: () => Fluffy.getDamageModifier(),
		mayhem: () => game.challenges.Mayhem.getTrimpMult(),
		pandemonium: () => game.challenges.Pandemonium.getTrimpMult(),
		desolation: () => game.challenges.Desolation.getTrimpMult(),
		sugarRush: () => (game.global.sugarRush ? sugarRush.getAttackStrength() : 1),
		strengthTowers: () => 1 + playerSpireTraps.Strength.getWorldBonus() / 100,
		sharpTrimps: () => (game.singleRunBonuses.sharpTrimps.owned ? 1.5 : 1)
	};
	attack = applyMultipliers(damageModifiers, attack);

	const heirloomAttack = typeof atSettings !== 'undefined' ? calcHeirloomBonus_AT('Shield', 'trimpAttack', 1, true, heirloomToCheck) : calcHeirloomBonus('Shield', 'trimpAttack', 1, true);
	attack *= heirloomAttack > 1 ? 1 + heirloomAttack / 100 : 1;

	if (game.global.universe === 1) {
		const damageModifiers = {
			anticipation: () => (game.global.antiStacks > 0 ? getAnticipationBonus() : 1),
			magmamancer: () => (game.talents.magmamancer.purchased ? game.jobs.Magmamancer.getBonusPercent() : 1),
			stillRowing: () => (game.talents.stillRowing2.purchased ? game.global.spireRows * 0.06 + 1 : 1),
			kerfluffle: () => (game.talents.kerfluffle.purchased ? game.talents.kerfluffle.mult() : 1),
			strengthInHealth: () => (game.talents.healthStrength.purchased && mutations.Healthy.active() ? 0.15 * mutations.Healthy.cellCount() + 1 : 1),
			voidSipon: () => (Fluffy.isRewardActive('voidSiphon') && game.stats.totalVoidMaps.value ? 1 + game.stats.totalVoidMaps.value * 0.05 : 1),
			amalgamator: () => game.jobs.Amalgamator.getDamageMult(),
			poisionEmpowerment: () => (game.global.uberNature === 'Poison' ? 3 : 1),
			frigid: () => game.challenges.Frigid.getTrimpMult()
		};
		attack = applyMultipliers(damageModifiers, attack);

		const challengeMultipliers = {
			Decay: () => 5 * Math.pow(0.995, game.challenges.Decay.stacks),
			Life: () => game.challenges.Life.getHealthMult(),
			Lead: () => (game.global.world % 2 === 1 ? 1.5 : 1)
		};
		attack = applyMultipliers(challengeMultipliers, attack, true);

		if (specificStance && game.global.formation !== 0 && game.global.formation !== 5) attack /= game.global.formation === 2 ? 4 : 0.5;
		if (specificStance && specificStance !== 'X' && specificStance !== 'W') attack *= specificStance === 'D' ? 4 : 0.5;
		const fightingCorrupted = (getCurrentEnemy() && getCurrentEnemy().corrupted) || (!realDamage && (mutations.Healthy.active() || mutations.Corruption.active()));

		if (game.talents.scry.purchased && fightingCorrupted && ((!specificStance && game.global.formation === 4) || specificStance === 'S' || specificStance === 'W')) attack *= 2;

		if (getEmpowerment() === 'Ice') {
			if (realDamage || !getPageSetting('fullice')) attack *= 1 + game.empowerments.Ice.getDamageModifier();
			else {
				const afterTransfer = 1 + Math.ceil(game.empowerments.Ice.currentDebuffPower * getRetainModifier('Ice'));
				let mod = 1 - Math.pow(game.empowerments.Ice.getModifier(), afterTransfer);
				if (Fluffy.isRewardActive('naturesWrath')) mod *= 2;
				attack *= 1 + mod;
			}
		}
	}

	if (game.global.universe === 2) {
		const damageModifiers = {
			smithy: () => game.buildings.Smithy.getMult(),
			hunger: () => game.portal.Hunger.getMult(),
			tenacity: () => game.portal.Tenacity.getMult(),
			spireStats: () => autoBattle.bonuses.Stats.getMult(),
			championism: () => game.portal.Championism.getMult(),
			frenzy: () => (getPerkLevel('Frenzy') > 0 && !challengeActive('Berserk') && (autoBattle.oneTimers.Mass_Hysteria.owned || (typeof atSettings !== 'undefined' && getPageSetting('frenzyCalc'))) ? 1 + 0.5 * getPerkLevel('Frenzy') : 1),
			observation: () => game.portal.Observation.getMult(),
			mutatorAttack: () => (u2Mutations.tree.Attack.purchased ? 1.5 : 1),
			geneAttack: () => (u2Mutations.tree.GeneAttack.purchased ? 10 : 1),
			brainsToBrawn: () => (u2Mutations.tree.Brains.purchased ? u2Mutations.tree.Brains.getBonus() : 1),
			novaStacks: () => (mapType === 'world' && game.global.novaMutStacks > 0 ? u2Mutations.types.Nova.trimpAttackMult() : 1)
		};
		attack = applyMultipliers(damageModifiers, attack);

		if (challengeActive('Quagmire')) {
			const exhaustedStacks = game.challenges.Quagmire.exhaustedStacks;
			const mod = mapType !== 'world' ? 0.05 : mapType === 'world' ? 0.1 : game.global.mapsActive ? 0.05 : 0.1;
			if (exhaustedStacks === 0) attack *= 1;
			else if (exhaustedStacks < 0) attack *= Math.pow(1 + mod, Math.abs(exhaustedStacks));
			else attack *= Math.pow(1 - mod, exhaustedStacks);
		}

		const challengeMultipliers = {
			Unbalance: () => game.challenges.Unbalance.getAttackMult(),
			Duel: () => (game.challenges.Duel.trimpStacks > 50 ? 3 : 1),
			Melt: () => game.challenges.Melt.getAttackMult(),
			Revenge: () => game.challenges.Revenge.getMult(),
			Quest: () => game.challenges.Quest.getAttackMult(),
			Archaeology: () => game.challenges.Archaeology.getStatMult('attack'),
			Storm: () => (game.global.mapsActive ? Math.pow(0.9995, game.challenges.Storm.beta) : 1),
			Berserk: () => game.challenges.Berserk.getAttackMult(),
			Nurture: () => game.challenges.Nurture.getStatBoost(),
			Alchemy: () => alchObj.getPotionEffect('Potion of Strength'),
			Desolation: () => game.challenges.Desolation.trimpAttackMult(),
			Smithless: () => (game.challenges.Smithless.fakeSmithies > 0 ? Math.pow(1.25, game.challenges.Smithless.fakeSmithies) : 1)
		};
		attack = applyMultipliers(challengeMultipliers, attack, true, true);
	}

	if (challengeActive('Daily')) {
		var minDailyMod = 1;
		var maxDailyMod = 1;
		if (game.talents.daily.purchased) attack *= 1.5;
		//Scruffy Level 20 - Dailies
		attack *= Fluffy.isRewardActive('SADailies') ? Fluffy.rewardConfig.SADailies.attackMod() : 1;

		//Rampage in maps only
		if (typeof game.global.dailyChallenge.rampage !== 'undefined' && mapType === 'map') attack *= dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, dailyModifiers.rampage.getMaxStacks(game.global.dailyChallenge.rampage.strength));

		//Range Dailies
		if (typeof game.global.dailyChallenge.minDamage !== 'undefined') minFluct = 1 - dailyModifiers.minDamage.getMult(game.global.dailyChallenge.minDamage.strength);
		if (typeof game.global.dailyChallenge.maxDamage !== 'undefined') maxFluct = dailyModifiers.maxDamage.getMult(game.global.dailyChallenge.maxDamage.strength);

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

	const equalityLevel = getPerkLevel('Equality');
	if (game.global.universe === 2 && equalityLevel > 0) {
		const equalityMult = typeof atSettings !== 'undefined' ? getPlayerEqualityMult_AT(heirloomToCheck) : game.portal.Equality.getMult(true);
		attack *= Math.pow(equalityMult, equality);
	}

	if (typeof atSettings !== 'undefined' && getPageSetting('floorCritCalc')) critMode = 'never';

	let min, max, avg;
	if (critMode) {
		min = attack * getCritMulti(critMode, heirloomToCheck);
		avg = min;
		max = min;
	} else {
		min = attack * getCritMulti('never', heirloomToCheck);
		avg = attack * getCritMulti('maybe', heirloomToCheck);
		max = attack * getCritMulti('force', heirloomToCheck);
	}

	min *= minFluct;
	max *= maxFluct;
	avg *= (maxFluct + minFluct) / 2;

	if (minMaxAvg === 'min') return Math.floor(min);
	if (minMaxAvg === 'max') return Math.ceil(max);
	return avg;
}

function calcSpire(what, cell, name, checkCell) {
	if (!cell) {
		const settingPrefix = trimpStats.isC3 ? 'c2' : trimpStats.isDaily ? 'd' : '';
		const exitCell = getPageSetting(settingPrefix + 'ExitSpireCell');
		cell = cell || (isDoingSpire() && exitCell > 0 && exitCell <= 100) ? exitCell : 100;
	}

	if (checkCell) return cell;

	const spireNum = Math.floor((game.global.world - 100) / 100);
	const enemy = name ? name : game.global.gridArray[cell - 1].name;
	let base = what === 'attack' ? calcEnemyBaseAttack('world', game.global.world, 100, enemy) : 2 * calcEnemyBaseHealth('world', game.global.world, 100, enemy);
	let mod = what === 'attack' ? 1.17 : 1.14;

	if (spireNum > 1) {
		let modRaiser = (spireNum - 1) / 100;
		if (what === 'attack') modRaiser *= 8;
		if (what === 'health') modRaiser *= 2;
		mod += modRaiser;
	}

	base *= Math.pow(mod, cell);

	if (challengeActive('Domination') && cell !== 100) base /= what === 'attack' ? 25 : 75;

	return base;
}

function badGuyCritMult(enemy = getCurrentEnemy(), critPower = 2, block = game.global.soldierCurrentBlock, health = game.global.soldierHealth) {
	const ignoreCrits = getPageSetting('IgnoreCrits');
	if (critPower <= 0 || ignoreCrits === 2) return 1;

	let regular = 1;
	let challenge = 1;

	if (enemy.corrupted === 'corruptCrit') regular = 5;
	else if (enemy.corrupted === 'healthyCrit') regular = 7;
	else if (game.global.voidBuff === 'getCrit' && ignoreCrits !== 1) regular = 5;

	const crushed = challengeActive('Crushed');
	const critDaily = challengeActive('Daily') && typeof game.global.dailyChallenge.crits !== 'undefined';

	if (critDaily) challenge = dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
	else if (crushed && health > block) challenge = 5;

	if (critPower === 2) return regular * challenge;
	return Math.max(regular, challenge);
}

function calcCorruptionScale(zone, base) {
	const startPoint = challengeActive('Corrupted') || challengeActive('Eradicated') ? 1 : 150;
	const scales = Math.floor((zone - startPoint) / 6);
	return base * Math.pow(1.05, scales);
}

function calcEnemyBaseAttack(type, zone, cell, name, query = false) {
	if (!type) type = !game.global.mapsActive ? 'world' : getCurrentMapObject().location === 'Void' ? 'void' : 'map';
	if (!zone) zone = type === 'world' || !game.global.mapsActive ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = type === 'world' || !game.global.mapsActive ? getCurrentWorldCell().level : getCurrentMapCell() ? getCurrentMapCell().level : 1;
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : 'Snimp';

	const mapGrid = type === 'world' ? 'gridArray' : 'mapGridArray';

	if (!query && zone >= 200 && cell !== 100 && type === 'world' && game.global.universe === 2 && game.global[mapGrid][cell].u2Mutation) {
		return u2Mutations.getAttack(game.global[mapGrid][cell - 1]);
	}

	const attackBase = game.global.universe === 2 ? 750 : 50;
	let attack = attackBase * Math.sqrt(zone) * Math.pow(3.27, zone / 2) - 10;

	if (zone === 1) {
		attack *= 0.35 * (1 + 0.75 * (cell / 100));
	} else if (zone === 2) {
		attack *= 0.5 * (1 + 0.68 * (cell / 100));
	} else if (zone < 60) {
		attack = 0.375 * attack + 0.7 * attack * (cell / 100);
	} else {
		attack = 0.4 * attack + 0.9 * attack * (cell / 100);
		attack *= Math.pow(1.15, zone - 59);
	}

	if (zone < 60) attack *= 0.85;
	if (zone > 6 && type !== 'world') attack *= 1.1;

	if (game.global.universe === 2) {
		const part1 = Math.min(zone, 40);
		const part2 = Math.max(Math.min(zone - 40, 20), 0);
		const part3 = Math.max(zone - 60, 0);
		const part4 = Math.max(zone - 300, 0);

		attack *= Math.pow(1.5, part1);
		attack *= Math.pow(1.4, part2);
		attack *= Math.pow(1.32, part3);
		attack *= Math.pow(1.15, part4);
	}

	if (name) attack *= game.badGuys[name].attack;

	return Math.floor(attack);
}

function calcEnemyAttackCore(type, zone, cell, name, minOrMax = false, customAttack, equality) {
	if (!type) type = !game.global.mapsActive ? 'world' : getCurrentMapObject().location === 'Void' ? 'void' : 'map';
	if (!zone) zone = type === 'world' || !game.global.mapsActive ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = type === 'world' || !game.global.mapsActive ? getCurrentWorldCell().level : getCurrentMapCell() ? getCurrentMapCell().level : 1;
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : 'Snimp';

	let attack = calcEnemyBaseAttack(type, zone, cell, name);
	const fluctuation = game.global.universe === 2 ? 0.5 : 0.2;
	const gridInitialised = game.global.gridArray && game.global.gridArray.length > 0;

	if (customAttack) {
		attack = customAttack;
	} else if (game.global.universe === 1) {
		if (type === 'world') {
			if (game.global.spireActive) {
				attack = calcSpire('attack', cell, name);
			} else if (gridInitialised && mutations.Corruption.active() && game.global.gridArray[cell - 1].mutation) {
				attack = corruptionBaseAttack(cell - 1, zone);
			}
		} else {
			const corruptionScale = calcCorruptionScale(game.global.world, 3);
			if (mutations.Magma.active()) attack *= corruptionScale / (type === 'void' ? 1 : 2);
			else if (type === 'void' && mutations.Corruption.active()) attack *= corruptionScale / 2;
		}
	} else if (game.global.universe === 2) {
		if (gridInitialised && type === 'world' && game.global.world > 200 && game.global.gridArray[cell - 1].u2Mutation.length > 0) {
			attack = mutationBaseAttack(cell - 1, zone);
		}
	}

	if (game.global.universe === 1) {
		const challengeMultipliers = {
			Balance: () => (type === 'world' ? 1.17 : 2.35),
			Meditate: () => 1.5,
			Life: () => 6,
			Coordinate: () => Array.from({ length: zone - 1 }, () => 1.25).reduce((a, b) => Math.ceil(a * b), 1),
			Toxicity: () => 5,
			Lead: () => (zone % 2 === 0 ? 5.08 : 1 + 0.04 * game.challenges.Lead.stacks),
			Watch: () => 1.25,
			Corrupted: () => 3,
			Domination: () => 2.5,
			Scientist: () => (getScientistLevel() === 5 ? 10 : 1),
			Frigid: () => game.challenges.Frigid.getEnemyMult(),
			Experience: () => game.challenges.Experience.getEnemyMult(),
			Obliterated: () => oblitStatMultiplier('Obliterated'),
			Eradicated: () => oblitStatMultiplier('Eradicated')
		};
		attack = applyMultipliers(challengeMultipliers, attack, true);
	}

	if (game.global.universe === 2) {
		const challengeMultipliers = {
			Unbalance: () => 1.5,
			Duel: () => (game.challenges.Duel.trimpStacks < 50 ? 3 : 1),
			Wither: () => game.challenges.Wither.getEnemyAttackMult(),
			Archaeology: () => game.challenges.Archaeology.getStatMult('enemyAttack'),
			Mayhem: () => game.challenges.Mayhem.getEnemyMult() * (type === 'world' ? game.challenges.Mayhem.getBossMult() : 1),
			Storm: () => (!game.global.mapsActive ? game.challenges.Storm.getAttackMult() : 1),
			Exterminate: () => game.challenges.Exterminate.getSwarmMult(),
			Nurture: () => 2 * game.buildings.Laboratory.getEnemyMult(),
			Pandemonium: () => (type === 'world' ? game.challenges.Pandemonium.getBossMult() : game.challenges.Pandemonium.getPandMult()),
			Alchemy: () => alchObj.getEnemyStats(type !== 'world', type === 'void') + 1,
			Hypothermia: () => game.challenges.Hypothermia.getEnemyMult(),
			Glass: () => game.challenges.Glass.attackMult(),
			Desolation: () => game.challenges.Desolation.getEnemyMult()
		};
		attack = applyMultipliers(challengeMultipliers, attack, true);

		if (type === 'world' && game.global.novaMutStacks > 0) attack *= u2Mutations.types.Nova.enemyAttackMult();
		if (equality && !isNaN(parseInt(equality))) attack *= Math.pow(game.portal.Equality.getModifier(), equality);
	}

	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.badStrength !== 'undefined') attack *= dailyModifiers.badStrength.getMult(game.global.dailyChallenge.badStrength.strength);
		if (typeof game.global.dailyChallenge.badMapStrength !== 'undefined' && type !== 'world') attack *= dailyModifiers.badMapStrength.getMult(game.global.dailyChallenge.badMapStrength.strength);
		if (typeof game.global.dailyChallenge.bloodthirst !== 'undefined') {
			const bloodThirstStrength = game.global.dailyChallenge.bloodthirst.strength;
			if (type === 'void' && getPageSetting('bloodthirstVoidMax')) attack *= dailyModifiers.bloodthirst.getMult(bloodThirstStrength, dailyModifiers.bloodthirst.getMaxStacks(bloodThirstStrength));
			else if (!getPageSetting('bloodthirstDestack')) attack *= dailyModifiers.bloodthirst.getMult(bloodThirstStrength, game.global.dailyChallenge.bloodthirst.stacks);
		}
		if (typeof game.global.dailyChallenge.empower !== 'undefined' && type === 'world') attack *= dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks);
		if (typeof game.global.dailyChallenge.empoweredVoid !== 'undefined' && type === 'void') attack *= dailyModifiers.empoweredVoid.getMult(game.global.dailyChallenge.empoweredVoid.strength);
	}

	return minOrMax ? (1 - fluctuation) * attack : (1 + fluctuation) * attack;
}

function calcEnemyAttack(type = 'world', zone = game.global.world, cell = 100, name = 'Improbability', minOrMax, customAttack, equality) {
	let attack = calcEnemyAttackCore(type, zone, cell, name, minOrMax, customAttack, equality);

	if (challengeActive('Nom')) {
		if (type === 'world') {
			const currentWorldCell = getCurrentWorldCell();
			if (typeof currentWorldCell !== 'undefined' && typeof currentWorldCell.nomStacks !== 'undefined') attack *= Math.pow(1.25, currentWorldCell.nomStacks);
		} else if (game.global.mapsActive) {
			const currentEnemy = getCurrentEnemy();
			if (typeof currentEnemy !== 'undefined' && typeof currentEnemy.nomStacks !== 'undefined') attack *= Math.pow(1.25, currentEnemy.nomStacks);
		}
	}

	if (challengeActive('Domination')) {
		attack *= 2.5;
		if (type === 'world' && game.global.usingShriek) attack *= game.mapUnlocks.roboTrimp.getShriekValue();
	}

	if (getEmpowerment() === 'Ice' && getPageSetting('fullice')) {
		const afterTransfer = 1 + Math.ceil(game.empowerments.Ice.currentDebuffPower * getRetainModifier('Ice'));
		attack *= Math.pow(game.empowerments.Ice.getModifier(), afterTransfer);
	}

	return minOrMax ? Math.floor(attack) : Math.ceil(attack);
}

function calcSpecificEnemyAttack(critPower = 2, customBlock, customHealth) {
	const enemy = getCurrentEnemy();
	if (!enemy) return 1;

	let attack = calcEnemyAttackCore();
	attack *= badGuyCritMult(enemy, critPower, customBlock, customHealth);

	if (challengeActive('Nom') && typeof enemy.nomStacks !== 'undefined') attack *= Math.pow(1.25, enemy.nomStacks);
	if (challengeActive('Lead')) attack *= 1 + 0.04 * game.challenges.Lead.stacks;

	if (game.global.usingShriek) attack *= game.mapUnlocks.roboTrimp.getShriekValue();
	if (getEmpowerment() === 'Ice') attack *= game.empowerments.Ice.getCombatModifier();

	return Math.ceil(attack);
}

function calcEnemyBaseHealth(mapType, zone, cell, name, ignoreCompressed) {
	if (!mapType) mapType = !game.global.mapsActive ? 'world' : getCurrentMapObject().location === 'Void' ? 'void' : 'map';
	if (!zone) zone = mapType === 'world' || !game.global.mapsActive ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = mapType === 'world' || !game.global.mapsActive ? getCurrentWorldCell().level : getCurrentMapCell() ? getCurrentMapCell().level : 1;
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : 'Turtlimp';

	if (!ignoreCompressed && mapType === 'world' && game.global.universe === 2 && game.global.world > 200 && typeof game.global.gridArray[cell - 1].u2Mutation !== 'undefined') {
		/* const extraCells = u2Mutations.types.Compression.repeats() - 1; */
		const gridArray = game.global.gridArray;
		if (gridArray[cell - 1].u2Mutation.length > 0 && ['CSX', 'CSP'].some((mutation) => gridArray[cell].u2Mutation.includes(mutation))) {
			cell = cell - 1;
			let go = false;
			let row = 0;
			let currRow = Math.floor(cell / 10) * 10;

			if (gridArray[cell].u2Mutation.includes('CSX')) {
				for (let i = 5; 9 >= i; i++) {
					if (gridArray[i * 10].u2Mutation.includes('CSP')) {
						row = i * 10;
						go = true;
					}
				}
				cell += row - currRow;
			}
			if (!go && gridArray[cell].u2Mutation.includes('CSP')) {
				for (let i = 0; 5 >= i; i++) {
					if (gridArray[i * 10].u2Mutation.includes('CSX')) {
						row = i * 10;
						go = true;
					}
				}
				cell -= currRow - row;
			}
		}
	}

	const base = game.global.universe === 2 ? 10e7 : 130;
	let health = base * Math.sqrt(zone) * Math.pow(3.265, zone / 2) - 110;

	if (zone === 1 || (zone === 2 && cell < 10)) {
		health *= 0.6 * (0.25 + 0.72 * (cell / 100));
	} else if (zone < 60) {
		health *= 0.4 * (1 + cell / 110);
	} else {
		health *= 0.5 * (1 + 0.8 * (cell / 100)) * Math.pow(1.1, zone - 59);
	}

	if (zone < 60) health *= 0.75;
	if (zone > 5 && mapType !== 'world') health *= 1.1;

	if (game.global.universe === 2) {
		const part1 = Math.min(zone, 60);
		const part2 = Math.max(zone - 60, 0);
		const part3 = Math.max(zone - 300, 0);
		health *= Math.pow(1.4, part1) * Math.pow(1.32, part2) * Math.pow(1.15, part3);
	}

	if (name) health *= game.badGuys[name].health;

	return health;
}

function calcEnemyHealthCore(type, zone, cell, name, customHealth) {
	if (!type) type = !game.global.mapsActive ? 'world' : getCurrentMapObject().location === 'Void' ? 'void' : 'map';
	if (!zone) zone = type === 'world' || !game.global.mapsActive ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = type === 'world' || !game.global.mapsActive ? getCurrentWorldCell().level : getCurrentMapCell() ? getCurrentMapCell().level : 1;
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : 'Turtlimp';

	let health = calcEnemyBaseHealth(type, zone, cell, name);

	if (game.global.universe === 2 && type === 'world' && game.global.world > 200) {
		if (game.global.gridArray && game.global.gridArray.length > 0 && game.global.gridArray[cell - 1].u2Mutation && game.global.gridArray[cell - 1].u2Mutation.length !== 0) {
			health = mutationBaseHealth(cell - 1, zone);
		}
	}

	if (type === 'world' && game.global.spireActive) health = calcSpire('health');
	if (type !== 'world' && mutations.Magma.active()) health *= calcCorruptionScale(game.global.world, 10) / (type === 'void' ? 1 : 2);

	if (customHealth) health = customHealth;

	if (game.global.universe === 1) {
		const challengeMultipliers = {
			Balance: () => 2,
			Meditate: () => 2,
			Life: () => 10,
			Coordinate: () => Array.from({ length: zone - 1 }, () => 1.25).reduce((a, b) => Math.ceil(a * b), 1),
			Toxicity: () => 2,
			Frigid: () => game.challenges.Frigid.getEnemyMult(),
			Experience: () => game.challenges.Experience.getEnemyMult(),
			Obliterated: () => oblitStatMultiplier('Obliterated'),
			Eradicated: () => oblitStatMultiplier('Eradicated')
		};
		health = applyMultipliers(challengeMultipliers, health, true);
	}

	if (game.global.universe === 2) {
		const challengeMultipliers = {
			Unbalance: () => (type !== 'world' ? 2 : 3),
			Quest: () => game.challenges.Quest.getHealthMult(),
			Revenge: () => (game.global.world % 2 === 0 ? 10 : 1),
			Mayhem: () => game.challenges.Mayhem.getEnemyMult() * (type === 'world' ? game.challenges.Mayhem.getBossMult() : 1),
			Storm: () => (type === 'world' ? game.challenges.Storm.getHealthMult() : 1),
			Exterminate: () => game.challenges.Exterminate.getSwarmMult(),
			Nurture: () => game.buildings.Laboratory.getEnemyMult() * (type === 'world' ? 2 : 10),
			Pandemonium: () => (type === 'world' ? game.challenges.Pandemonium.getBossMult() : game.challenges.Pandemonium.getPandMult()),
			Alchemy: () => alchObj.getEnemyStats(type !== 'world', type === 'void') + 1,
			Hypothermia: () => game.challenges.Hypothermia.getEnemyMult(),
			Glass: () => game.challenges.Glass.healthMult(),
			Desolation: () => game.challenges.Desolation.getEnemyMult()
		};
		health = applyMultipliers(challengeMultipliers, health, true);
	}

	//Dailies
	if (challengeActive('Daily')) {
		health *= typeof game.global.dailyChallenge.empower !== 'undefined' && type === 'world' ? dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks) : 1;
		health *= typeof game.global.dailyChallenge.badHealth !== 'undefined' ? dailyModifiers.badHealth.getMult(game.global.dailyChallenge.badHealth.strength, game.global.dailyChallenge.badHealth.stacks) : 1;
		health *= typeof game.global.dailyChallenge.badMapHealth !== 'undefined' && type !== 'world' ? dailyModifiers.badMapHealth.getMult(game.global.dailyChallenge.badMapHealth.strength, game.global.dailyChallenge.badMapHealth.stacks) : 1;
		health *= typeof game.global.dailyChallenge.empoweredVoid !== 'undefined' && type === 'void' ? dailyModifiers.empoweredVoid.getMult(game.global.dailyChallenge.empoweredVoid.strength) : 1;
	}

	return health;
}

function oblitStatMultiplier(challenge) {
	const oblitMult = challenge === 'Eradicated' ? game.challenges.Eradicated.scaleModifier : 1e12;
	const zoneModifier = Math.floor(game.global.world / game.challenges[challenge].zoneScaleFreq);
	return oblitMult * Math.pow(game.challenges[challenge].zoneScaling, zoneModifier);
}

function calcEnemyHealth(type, zone, cell = 99, name = 'Turtlimp', customHealth) {
	let health = calcEnemyHealthCore(type, zone, cell, name, customHealth);

	//Challenges - worst case for Lead and Domination
	if (challengeActive('Domination')) health *= 7.5;
	//If on even zone assume 100 stacks. If it's an odd zone check current stacks.
	if (challengeActive('Lead')) health *= zone % 2 === 0 ? 5.08 : 1 + 0.04 * game.challenges.Lead.stacks;

	return health;
}

function calcSpecificEnemyHealth(type, zone, cell, forcedName) {
	//Pre-Init
	if (!type) type = !game.global.mapsActive ? 'world' : getCurrentMapObject().location === 'Void' ? 'void' : 'map';
	if (!zone) zone = type === 'world' || !game.global.mapsActive ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = type === 'world' || !game.global.mapsActive ? getCurrentWorldCell().level : getCurrentMapCell() ? getCurrentMapCell().level : 1;

	//Select our enemy
	var enemy = type === 'world' ? game.global.gridArray[cell - 1] : game.global.mapGridArray[cell - 1];
	if (!enemy) return -1;

	var corrupt = enemy.corrupted && enemy.corrupted !== 'none';
	var healthy = corrupt && enemy.corrupted.startsWith('healthy');
	var name = corrupt ? 'Chimp' : forcedName ? forcedName : enemy.name;
	var health = calcEnemyHealthCore(type, zone, cell, name);

	//Challenges - considers the actual scenario for this enemy
	if (challengeActive('Lead')) health *= 1 + 0.04 * game.challenges.Lead.stacks;
	if (challengeActive('Domination')) {
		var lastCell = type === 'world' ? 100 : game.global.mapGridArray.length;
		if (cell < lastCell) health /= 10;
		else health *= 7.5;
	}

	//Map and Void Difficulty
	if (type !== 'world') health *= getCurrentMapObject().difficulty;
	//Corruption
	else if (type === 'world' && !healthy && (corrupt || (mutations.Corruption.active() && cell === 100)) && !game.global.spireActive) {
		health *= calcCorruptionScale(zone, 10);
		if (enemy.corrupted === 'corruptTough') health *= 5;
	}

	//Healthy
	else if (type === 'world' && healthy) {
		health *= calcCorruptionScale(zone, 14);
		if (enemy.corrupted === 'healthyTough') health *= 7.5;
	}

	return health;
}

function calcHDRatio(targetZone = game.global.world, type = 'world', maxTenacity = false, difficulty = 1, hdCheck = true, checkOutputs) {
	const heirloomToUse = heirloomShieldToEquip(type, false, hdCheck);
	let enemyHealth = 0;
	let universeSetting;

	function checkResults() {
		debug(`ourBaseDamage: ${ourBaseDamage}`, `debug`);
		debug(`enemyHealth: ${enemyHealth}`, `debug`);
		debug(`universeSetting: ${universeSetting}`, `debug`);
		debug(`HD type: ${type}`, `debug`);
		debug(`HD value (H:D): ${enemyHealth / (ourBaseDamage + addPoison())}`, `debug`);
	}

	const leadCheck = type !== 'map' && targetZone % 2 === 1 && challengeActive('Lead');
	//Lead farms one zone ahead if on an Odd zone.
	if (leadCheck) targetZone++;

	if (type === 'world') {
		let customHealth = undefined;
		let enemyName = 'Turtlimp';
		if (targetZone === 5 || targetZone === 10 || (targetZone >= 15 && targetZone <= 58)) enemyName = 'Blimp';
		if (targetZone >= 59) enemyName = 'Improbability';
		if (game.global.universe === 1) {
			if (targetZone > 229) enemyName = 'Omnipotrimp';
			if (game.global.spireActive) customHealth = calcSpire('health');
			else if (isCorruptionActive(targetZone)) customHealth = calcCorruptedHealth(targetZone);
		} else if (game.global.universe === 2) {
			if (targetZone > 200) customHealth = calcMutationHealth(targetZone);
		}
		enemyHealth = calcEnemyHealth(type, targetZone, 100, enemyName, customHealth) * difficulty;
		universeSetting = game.global.universe === 2 ? equalityQuery(enemyName, targetZone, 100, type, difficulty, 'gamma', false, 1, true) : 'X';
	} else if (type === 'map') {
		enemyHealth = calcEnemyHealth(type, targetZone, 20, 'Turtlimp') * difficulty;
		universeSetting = game.global.universe === 2 ? equalityQuery('Snimp', targetZone, 20, type, difficulty, 'gamma', true) : 'X';
	} else if (type === 'void') {
		enemyHealth = calcEnemyHealth(type, targetZone, 100, 'Cthulimp') * difficulty;
		universeSetting = game.global.universe === 2 ? equalityQuery('Cthulimp', targetZone, 100, type, difficulty, 'gamma', false, 1, true) : 'X';
	}

	let ourBaseDamage = calcOurDmg(challengeActive('Unlucky') ? 'max' : 'avg', universeSetting, false, type, 'maybe', targetZone - game.global.world, null, heirloomToUse);

	//Lead Challenge Pt. 2
	if (leadCheck) ourBaseDamage /= 1.5;
	ourBaseDamage += addPoison(false, targetZone);
	//Checking ratio at max mapbonus/tenacity for Void Maps.
	if (maxTenacity) {
		if (type === 'world' && game.global.mapBonus !== 10) {
			ourBaseDamage /= 1 + 0.2 * game.global.mapBonus;
			ourBaseDamage *= game.talents.mapBattery.purchased ? 5 : 3;
		}
		if (game.global.universe === 2 && getPerkLevel('Tenacity') > 0 && !(game.portal.Tenacity.getMult() === Math.pow(1.4000000000000001, getPerkLevel('Tenacity') + getPerkLevel('Masterfulness')))) {
			ourBaseDamage /= game.portal.Tenacity.getMult();
			ourBaseDamage *= Math.pow(1.4000000000000001, getPerkLevel('Tenacity') + getPerkLevel('Masterfulness'));
		}
	}

	const maxGammaStacks = gammaMaxStacks(false, true, type) - 1;
	if (challengeActive('Daily') && typeof game.global.dailyChallenge.weakness !== 'undefined' && maxGammaStacks !== Infinity) ourBaseDamage *= 1 - (Math.max(1, maxGammaStacks) * game.global.dailyChallenge.weakness.strength) / 100;

	//Adding gammaBurstDmg to calc
	if ((type !== 'map' && game.global.universe === 2 && universeSetting < getPerkLevel('Equality') - 14) || game.global.universe === 1) ourBaseDamage *= MODULES.heirlooms.gammaBurstPct;

	if (checkOutputs) checkResults();
	//Return H:D for a regular scenario
	return enemyHealth / ourBaseDamage;
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

function calcCorruptedAttack(targetZone) {
	if (game.global.universe !== 1) return;
	if (!targetZone) targetZone = game.global.world;
	if (!isCorruptionActive(targetZone)) return;
	var attack;
	var cell;

	var highest = 1;
	var gridArray = game.global.gridArray;

	for (var i = 0; i < gridArray.length; i++) {
		cell = i;
		if (gridArray[cell].mutation) {
			highest = Math.max(corruptionBaseAttack(cell, targetZone), highest);
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

	var cell;
	var health = 0;

	var highest = 0;
	var gridArray = game.global.gridArray;

	for (var i = 0; i < game.global.gridArray.length; i++) {
		cell = i;
		if (gridArray[cell].mutation) {
			var enemyHealth = corruptionBaseHealth(cell, targetZone);

			highest = Math.max(enemyHealth, highest);
			health = highest;
		}
	}
	return health;
}

//Avg damage of mutated enemy
function mutationBaseAttack(cell, targetZone = game.global.world) {
	cell = game.global.gridArray[cell];
	let baseAttack = calcEnemyBaseAttack('world', targetZone, cell.cs || cell.level, cell.name, true);
	let addAttack = cell.cc ? u2Mutations.types.Compression.attack(cell, baseAttack) : 0;

	if (cell.u2Mutation.includes('NVA')) baseAttack *= 0.01;
	else if (cell.u2Mutation.includes('NVX')) baseAttack *= 10;

	baseAttack += addAttack;
	baseAttack *= Math.pow(1.01, targetZone - 201);
	return baseAttack;
}

function calcMutationAttack(targetZone = game.global.world) {
	if (game.global.universe !== 2 || targetZone < 201) return;

	let attack;
	let worstCell = 0;

	let highest = 1;
	const gridArray = game.global.gridArray;
	const heirloomToCheck = heirloomShieldToEquip('world');
	const compressedSwap = getPageSetting('heirloomCompressedSwap');
	const compressedSwapValue = getPageSetting('heirloomSwapHDCompressed');

	for (let i = 0; i < gridArray.length; i++) {
		let hasRage = gridArray[i].u2Mutation.includes('RGE');
		if (gridArray[i].u2Mutation.includes('CMP') && !hasRage) {
			for (let y = i + 1; y < i + u2Mutations.types.Compression.cellCount(); y++) {
				if (gridArray[y].u2Mutation.includes('RGE')) {
					hasRage = true;
					break;
				}
			}
		}
		if (gridArray[i].u2Mutation && gridArray[i].u2Mutation.length) {
			let ragingMult = hasRage ? (u2Mutations.tree.Unrage.purchased ? 4 : 5) : 1;
			if (gridArray[i].u2Mutation.includes('CMP') && compressedSwap && compressedSwapValue) {
				if (heirloomToCheck !== 'heirloomInitial' || hdStats.hdRatioHeirloom >= compressedSwapValue || MODULES.heirlooms.compressedCalc) ragingMult *= 0.7;
			}
			highest = Math.max(mutationBaseAttack(i, targetZone) * ragingMult, highest);
			if (highest > attack) worstCell = i;
			attack = highest;
		}
	}
	if (gridArray[worstCell].u2Mutation.includes('CMP')) {
		MODULES.heirlooms.compressedCalc = true;
	}
	return attack;
}

function mutationBaseHealth(cell, targetZone = game.global.world) {
	if (!cell) return 1;

	cell = game.global.gridArray[cell];
	let baseHealth = calcEnemyBaseHealth('world', targetZone, cell.cs || cell.level, cell.name, true);
	const addHealth = cell.cc ? u2Mutations.types.Compression.health(cell, baseHealth) : 0;

	if (cell.u2Mutation.includes('NVA')) baseHealth *= 0.01;
	else if (cell.u2Mutation.includes('NVX')) baseHealth *= 0.1;

	baseHealth += addHealth;
	baseHealth *= 2;
	baseHealth *= Math.pow(1.02, targetZone - 201);
	return baseHealth;
}

function calcMutationHealth(targetZone = game.global.world) {
	if (game.global.universe !== 2 || targetZone < 201) return;

	const gridArray = game.global.gridArray;
	const heirloomToCheck = heirloomShieldToEquip('world');
	const compressedSwap = getPageSetting('heirloomCompressedSwap');
	const compressedSwapValue = getPageSetting('heirloomSwapHDCompressed');

	let worstCell;
	let health;

	for (let i = 0; i < game.global.gridArray.length; i++) {
		if (gridArray[i].u2Mutation && gridArray[i].u2Mutation.length) {
			let enemyHealth = mutationBaseHealth(i, targetZone);
			if (gridArray[i].u2Mutation.includes('CMP') && compressedSwap && compressedSwapValue > 0) {
				if (heirloomToCheck !== 'heirloomInitial' || hdStats.hdRatioHeirloom >= compressedSwapValue || MODULES.heirlooms.compressedCalc) enemyHealth *= 0.7;
			}

			if (enemyHealth > health) worstCell = i;
			health = Math.max(enemyHealth, health || 0);
		}
	}

	if (worstCell && gridArray[worstCell].u2Mutation.includes('CMP')) {
		MODULES.heirlooms.compressedCalc = true;
	}

	return health;
}

function enemyDamageModifiers() {
	let attack = 1;

	if (game.global.universe === 1) {
		const challengeMultipliers = {
			Meditate: () => 1.5,
			Corrupted: () => 3,
			Obliterated: () => oblitStatMultiplier('Obliterated'),
			Eradicated: () => oblitStatMultiplier('Eradicated')
		};
		attack = applyMultipliers(challengeMultipliers, attack, true);
	}

	if (game.global.universe === 2) {
		const challengeMultipliers = {
			Duel: () => (game.challenges.Duel.trimpStacks < 50 ? 3 : 1),
			Wither: () => game.challenges.Wither.getEnemyAttackMult(),
			Archaeology: () => game.challenges.Archaeology.getStatMult('enemyAttack'),
			Mayhem: () => (!game.global.mapsActive && game.global.lastClearedCell + 2 === 100 ? game.challenges.Mayhem.getBossMult() : 1),
			Nurture: () => 2 * game.buildings.Laboratory.getEnemyMult(),
			Pandemonium: () => (!game.global.mapsActive && game.global.lastClearedCell + 2 === 100 ? game.challenges.Pandemonium.getBossMult() : game.challenges.Pandemonium.getPandMult()),
			Glass: () => game.challenges.Glass.attackMult()
		};
		attack = applyMultipliers(challengeMultipliers, attack, true);

		const cell = game.global.gridArray[game.global.lastClearedCell + 1];
		if (game.global.world > 200 && typeof cell.u2Mutation !== 'undefined' && !game.global.mapsActive) {
			if (cell.u2Mutation.length > 0 && (cell.u2Mutation.includes('RGE') || (cell.cc && cell.cc[3] > 0))) {
				attack *= u2Mutations.types.Rage.enemyAttackMult();
			}
			attack *= game.global.novaMutStacks > 0 ? u2Mutations.types.Nova.enemyAttackMult() : 1;
		}
	}

	if (challengeActive('Daily')) {
		attack *= typeof game.global.dailyChallenge.badStrength !== 'undefined' ? dailyModifiers.badStrength.getMult(game.global.dailyChallenge.badStrength.strength) : 1;
		attack *= typeof game.global.dailyChallenge.badMapStrength !== 'undefined' && game.global.mapsActive ? dailyModifiers.badMapStrength.getMult(game.global.dailyChallenge.badMapStrength.strength) : 1;
		attack *= typeof game.global.dailyChallenge.bloodthirst !== 'undefined' ? dailyModifiers.bloodthirst.getMult(game.global.dailyChallenge.bloodthirst.strength, game.global.dailyChallenge.bloodthirst.stacks) : 1;
		attack *= typeof game.global.dailyChallenge.empower !== 'undefined' && !game.global.mapsActive ? dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks) : 1;
	}

	return attack;
}

function gammaMaxStacks(specialChall, actualCheck = true, mapType = 'world') {
	if (heirloomShieldToEquip(mapType) && getHeirloomBonus_AT('Shield', 'gammaBurst', heirloomShieldToEquip(mapType)) <= 1) return Infinity;
	if (actualCheck && MODULES.heirlooms.gammaBurstPct === 1) return 1;
	if (typeof atSettings !== 'undefined' && specialChall && game.global.mapsActive) return Infinity;

	let gammaMaxStacks = 5;
	if (autoBattle.oneTimers.Burstier.owned) gammaMaxStacks--;
	if (Fluffy.isRewardActive('scruffBurst')) gammaMaxStacks--;
	return gammaMaxStacks;
}

function equalityQuery(enemyName = 'Snimp', zone = game.global.world, currentCell, mapType = 'world', difficulty = 1, farmType = 'gamma', forceOK, hits, hdCheck) {
	if (Object.keys(game.global.gridArray).length === 0 || getPerkLevel('Equality') === 0) return 0;

	if (!currentCell) currentCell = mapType === 'world' || mapType === 'void' ? 98 : 20;

	const bionicTalent = zone - game.global.world;
	const checkMutations = mapType === 'world' && zone > 200;
	const titimp = mapType !== 'world' && farmType === 'oneShot' ? 'force' : false;
	const dailyEmpowerToggle = typeof atSettings !== 'undefined' && getPageSetting('empowerAutoEquality');
	const isDaily = challengeActive('Daily');
	const dailyEmpower = isDaily && typeof game.global.dailyChallenge.empower !== 'undefined'; //Empower
	const dailyCrit = isDaily && typeof game.global.dailyChallenge.crits !== 'undefined'; //Crit
	const dailyExplosive = isDaily && typeof game.global.dailyChallenge.explosive !== 'undefined'; //Explosive
	const dailyBloodthirst = isDaily && typeof game.global.dailyChallenge.bloodthirst !== 'undefined'; //Bloodthirst (enemy heal + atk)
	const maxEquality = getPerkLevel('Equality');
	const overkillCount = maxOneShotPower(true);

	let critType = 'maybe';
	if (challengeActive('Wither') || challengeActive('Glass') || challengeActive('Duel')) critType = 'never';

	const runningUnlucky = challengeActive('Unlucky');
	const runningQuest = getCurrentQuest() === 8 || challengeActive('Bublé'); //Shield break quest

	//Enemy stats
	if (enemyName === 'Improbability' && zone <= 58) enemyName = 'Blimp';
	let enemyHealth = calcEnemyHealth(mapType, zone, currentCell, enemyName) * difficulty;
	let enemyDmg = calcEnemyAttack(mapType, zone, currentCell, enemyName, false, false, 0) * difficulty;

	if ((mapType === 'map' && dailyCrit) || dailyExplosive) {
		if (dailyExplosive) enemyDmg *= 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength);
		if (dailyEmpowerToggle && dailyCrit) enemyDmg *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
	} else if (mapType === 'world' && ((dailyEmpower && (dailyCrit || dailyExplosive)) || hits)) {
		//if (dailyExplosive) enemyDmg *= 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength);
		if (dailyCrit) enemyDmg *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
	} else if (hits) {
		if (dailyCrit) enemyDmg *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
	}

	if (challengeActive('Duel')) {
		enemyDmg *= 10;
		if (game.challenges.Duel.trimpStacks >= 50) enemyDmg *= 3;
	}
	//Our stats
	let dmgType = runningUnlucky ? 'max' : 'avg';
	let ourHealth = calcOurHealth(runningQuest, mapType);
	let ourDmg = calcOurDmg(dmgType, 0, false, mapType, critType, bionicTalent, titimp);

	let unluckyDmg = runningUnlucky ? Number(calcOurDmg('min', 0, false, mapType, 'never', bionicTalent, titimp)) : 2;

	//Figuring out gamma to proc value
	let gammaToTrigger = gammaMaxStacks(false, false, mapType);

	if (checkMutations) {
		enemyDmg = calcEnemyAttack(mapType, zone, currentCell, enemyName, false, calcMutationAttack(zone), 0);
		enemyHealth = calcEnemyHealth(mapType, zone, currentCell, enemyName, calcMutationHealth(zone));
	}
	if (!hits) hits = 1;
	enemyDmg *= hits;

	if (forceOK) {
		if (!runningUnlucky && zone - game.global.world > 0) dmgType = 'min';
		enemyHealth *= 1 * overkillCount;
	}
	if (challengeActive('Duel')) ourDmg *= MODULES.heirlooms.gammaBurstPct;

	if (isDaily && typeof game.global.dailyChallenge.weakness !== 'undefined') ourDmg *= 1 - ((mapType === 'map' ? 9 : gammaToTrigger) * game.global.dailyChallenge.weakness.strength) / 100;

	let ourDmgEquality = 0;
	let enemyDmgEquality = 0;
	let unluckyDmgEquality = 0;
	const ourEqualityModifier = typeof atSettings !== 'undefined' ? getPlayerEqualityMult_AT(heirloomShieldToEquip(mapType)) : game.portal.Equality.getMult(true);
	const enemyEqualityModifier = game.portal.Equality.getModifier();

	//Accounting for enemies hitting multiple times per gamma burst
	if (hdCheck && mapType !== 'map' && gammaToTrigger !== Infinity) {
		const enemyDmgMaxEq = enemyDmg * Math.pow(enemyEqualityModifier, maxEquality);
		ourHealth -= enemyDmgMaxEq * (gammaToTrigger - 1);
	}

	if (enemyHealth !== 0) {
		for (let i = 0; i <= maxEquality; i++) {
			enemyDmgEquality = enemyDmg * Math.pow(enemyEqualityModifier, i);
			ourDmgEquality = ourDmg * Math.pow(ourEqualityModifier, i);
			if (runningUnlucky) {
				unluckyDmgEquality = unluckyDmg * Math.pow(ourEqualityModifier, i);
				if (unluckyDmgEquality.toString()[0] % 2 === 1 && i !== maxEquality) continue;
			}
			if (farmType === 'gamma' && ourHealth >= enemyDmgEquality) {
				return i;
			} else if (farmType === 'oneShot' && ourDmgEquality > enemyHealth && ourHealth > enemyDmgEquality) {
				return i;
			} else if (i === maxEquality) {
				return i;
			}
		}
	}
}

function remainingHealth(shieldBreak = false, angelic = false, mapType = 'world') {
	const heirloomToCheck = heirloomShieldToEquip(mapType);
	const correctHeirloom = heirloomToCheck !== undefined ? getPageSetting(heirloomToCheck) === game.global.ShieldEquipped.name : true;
	const currentShield = calcHeirloomBonus_AT('Shield', 'trimpHealth', 1, true) / 100;
	const newShield = calcHeirloomBonus_AT('Shield', 'trimpHealth', 1, true, heirloomToCheck) / 100;

	let soldierHealthMax = game.global.soldierHealthMax;
	let soldierHealth = game.global.soldierHealth;
	let shieldHealth = 0;

	//Fix our health to the correct new value if we are changing heirlooms
	if (!correctHeirloom) {
		soldierHealth = (soldierHealth / (1 + currentShield)) * (1 + newShield);
		soldierHealthMax = (soldierHealthMax / (1 + currentShield)) * (1 + newShield);
	}
	//Work out what our shield percentage is.
	if (game.global.universe === 2) {
		const maxLayers = Fluffy.isRewardActive('shieldlayer');
		const layers = maxLayers - game.global.shieldLayersUsed;
		let shieldMax = game.global.soldierEnergyShieldMax;
		let shieldCurr = game.global.soldierEnergyShield;

		if (!correctHeirloom) {
			const energyShieldMult = getEnergyShieldMult_AT(mapType, true);
			const newShieldMult = getHeirloomBonus_AT('Shield', 'prismatic', heirloomToCheck) / 100;
			const shieldPrismatic = newShieldMult > 0 ? energyShieldMult + newShieldMult : energyShieldMult;
			const currShieldPrismatic = energyShieldMult + getHeirloomBonus('Shield', 'prismatic') / 100;

			if (currShieldPrismatic > 0) shieldMax /= currShieldPrismatic;
			shieldMax *= shieldPrismatic;
			if (currShieldPrismatic > 0) shieldCurr /= currShieldPrismatic;
			shieldCurr *= shieldPrismatic;
			shieldCurr = (shieldCurr / (1 + currentShield)) * (1 + newShield);
		}

		if (maxLayers > 0) {
			for (let i = 0; i <= maxLayers; i++) {
				if (layers !== maxLayers && i > layers) continue;
				if (i === maxLayers - layers) shieldHealth += shieldMax;
				else shieldHealth += shieldCurr;
			}
		} else {
			shieldHealth = shieldCurr;
		}

		shieldHealth = Math.max(0, shieldHealth);
	}

	if (typeof game.global.dailyChallenge.plague !== 'undefined') soldierHealth -= soldierHealthMax * dailyModifiers.plague.getMult(game.global.dailyChallenge.plague.strength, game.global.dailyChallenge.plague.stacks);

	if (soldierHealth <= 0) return 0;
	if (shieldBreak) return shieldHealth;

	if (angelic) soldierHealth *= 0.33;
	return shieldHealth + soldierHealth;
}

function enoughHealth(map) {
	const { name, location, level, size, difficulty } = map;
	const health = calcOurHealth(false, 'map', false, true);
	const block = calcOurBlock(false, false);
	const totalHealth = health + block;

	const enemyName = name === 'Imploding Star' ? 'Neutrimp' : location === 'Void' ? 'Cthulimp' : 'Snimp';
	const mapType = location === 'Void' ? 'void' : 'map';
	const mapLevel = name === 'The Black Bog' ? game.global.world : level;
	const equalityAmt = game.global.universe === 2 ? equalityQuery(enemyName, mapLevel, size, 'map', difficulty, 'gamma') : 0;
	const enemyDmg = calcEnemyAttackCore(mapType, mapLevel, size, enemyName, false, false, equalityAmt) * difficulty;

	return totalHealth > enemyDmg;
}
