class TrimpStats {
	constructor(newZone) {
		this.isDaily = undefined;
		this.isC3 = undefined;
		this.isOneOff = undefined;
		this.isFiller = undefined;
		this.currChallenge = undefined;

		this.hze = undefined;
		this.hypPct = undefined;
		this.hyperspeed = undefined;
		this.autoMaps = undefined;

		this.perfectMaps = undefined;
		this.mapSize = undefined;
		this.mapDifficulty = undefined;
		this.mountainPriority = undefined;
		this.mapSpecial = undefined;
		this.mapBiome = undefined;
		this.shieldBreak = undefined;

		this.isDaily = challengeActive('Daily');
		this.isC3 = game.global.runningChallengeSquared || challengeActive('Frigid') || challengeActive('Experience') || challengeActive('Mayhem') || challengeActive('Pandemonium') || challengeActive('Desolation');
		this.isOneOff = !game.global.runningChallengeSquared && autoPortalChallenges('oneOff', game.global.universe).slice(1).indexOf(game.global.challengeActive) > 0;
		this.isFiller = !this.isDaily && !this.isC3 && !this.isOneOff;
		this.currChallenge = game.global.challengeActive;
		this.shieldBreak = challengeActive('Bublé') || getCurrentQuest() === 8;

		this.hze = game.global.universe === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();
		this.hypPct = game.talents.liquification3.purchased ? 75 : game.talents.hyperspeed2.purchased ? 50 : 0;
		this.hyperspeed2 = game.global.world <= Math.floor(this.hze * (this.hypPct / 100));
		this.autoMaps = getPageSetting('autoMaps') > 0;

		this.mapSize = game.talents.mapLoot2.purchased ? 20 : 25;
		this.mapDifficulty = 0.75;
		this.perfectMaps = game.global.universe === 2 ? game.stats.highestRadLevel.valueTotal() >= 30 : game.stats.highestLevel.valueTotal() >= 110;
		this.plusLevels = game.global.universe === 2 ? game.stats.highestRadLevel.valueTotal() >= 50 : game.stats.highestLevel.valueTotal() >= 210;
		this.mapSpecial = getAvailableSpecials('lmc');
		this.mapBiome = getBiome();

		this.mountainPriority = !(game.unlocks.imps.Chronoimp || game.unlocks.imps.Jestimp || getAvailableSpecials('lmc', true) === 'lmc' || getAvailableSpecials('lmc', true) === 'smc');
	}
}

class HDStats {
	constructor() {
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
		this.autoLevelZone = hdStats.autoLevelZone;
		this.autoLevelData = hdStats.autoLevelData;
		this.autoLevelLoot = hdStats.autoLevelLoot;
		this.autoLevelSpeed = hdStats.autoLevelSpeed;

		const z = game.global.world;

		const checkAutoLevel = this.autoLevelInitial === undefined ? true : usingRealTimeOffline ? atSettings.intervals.thirtySecond : atSettings.intervals.fiveSecond;

		let voidPercent = 4.5;
		if (game.global.world <= 59) {
			//-3 difficulty in U1, -2 difficulty in u2
			voidPercent -= 2;
			if (game.global.universe === 1) voidPercent /= 2;
		} else if (game.global.universe === 1 && game.global.world <= 199) {
			//u2 up to full difficulty, u1 at -1
			voidPercent -= 1;
		}

		const mapDifficulty = game.global.mapsActive && getCurrentMapObject().location === 'Bionic' ? getCurrentMapObject().difficulty : 0.75;
		if (challengeActive('Mapocalypse')) voidPercent += 3;
		//Calculating HD values for current zone.
		this.hdRatio = calcHDRatio(z, 'world', false, 1);
		this.hdRatioMap = calcHDRatio(z, 'map', false, mapDifficulty);
		this.hdRatioVoid = calcHDRatio(z, 'void', false, voidPercent);
		//Calculating HD values for the next zone.
		this.hdRatioPlus = calcHDRatio(z + 1, 'world', false, 1);
		this.hdRatioMapPlus = calcHDRatio(z + 1, 'map', false, mapDifficulty);
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
		this.hitsSurvivedMap = calcHitsSurvived(z, 'map', mapDifficulty);
		this.hitsSurvivedVoid = calcHitsSurvived(z, 'void', voidPercent);
		//Calculating Auto Level values.
		this.autoLevel = autoMapLevel();
		//Only run this code if we are updating the initial autoLevel data.
		if (checkAutoLevel) {
			this.autoLevelInitial = stats();
			this.autoLevelZone = z;
			this.autoLevelData = get_best(this.autoLevelInitial, true);

			const worldMap = Object.entries(this.autoLevelInitial[0])
				.filter((data) => data[1].mapLevel === 0)
				.map((data) => {
					return this.autoLevelInitial[0][data[0]];
				})[0];
			var lootLevel = this.autoLevelData.loot.mapLevel;
			var speedLevel = this.autoLevelData.speed.mapLevel;
			if (worldMap !== undefined && worldMap[this.autoLevelData.loot.stance] && worldMap[this.autoLevelData.speed.stance]) {
				if (lootLevel === -1 && this.autoLevelData.loot.value === worldMap[this.autoLevelData.loot.stance].value) lootLevel = 0;
				if (speedLevel === -1 && this.autoLevelData.speed.killSpeed === worldMap[this.autoLevelData.speed.stance].killSpeed) speedLevel = 0;
			}

			this.autoLevelLoot = lootLevel;
			this.autoLevelSpeed = speedLevel;
		}
	}
}

function getCurrentWorldCell() {
	let cell = { level: 1 };
	if (game.global.gridArray.length > 0) cell = game.global.gridArray[game.global.lastClearedCell + 1];
	return cell;
}

function debugCalc() {
	const mapping = game.global.mapsActive ? true : false;
	const mapType = !mapping ? 'world' : getCurrentMapObject().location === 'Void' ? 'void' : 'map';
	const zone = mapType === 'world' ? game.global.world : getCurrentMapObject().level;
	const cell = mapType === 'world' ? getCurrentWorldCell().level : getCurrentMapCell() ? getCurrentMapCell().level : 1;
	const difficulty = mapping ? getCurrentMapObject().difficulty : 1;
	const name = getCurrentEnemy() ? getCurrentEnemy().name : 'Chimp';
	const equality = game.global.universe === 2 ? Math.pow(game.portal.Equality.getModifier(), game.portal.Equality.disabledStackCount) : 1;
	const enemyMin = calcEnemyAttackCore(mapType, zone, cell, name, true, false, 0) * difficulty;
	const enemyMax = calcEnemyAttackCore(mapType, zone, cell, name, false, false, 0) * difficulty;
	const mapLevel = mapping && game.talents.bionic2.purchased ? zone - game.global.world : 0;
	const universeSetting = game.global.universe === 2 ? game.portal.Equality.disabledStackCount : false;
	const universeSetting2 = game.global.universe === 2 ? false : true;

	const displayedMin = calcOurDmg('min', universeSetting, true, mapType, 'never', mapLevel, true);
	const displayedMax = calcOurDmg('max', universeSetting, true, mapType, 'never', mapLevel, true);

	debug(`Our Stats`, 'other');
	debug(`Our attack: ${displayedMin.toExponential(2)} - ${displayedMax.toExponential(2)}`);
	debug(`Our crit: ${100 * getPlayerCritChance().toExponential(2)} % for ${getPlayerCritDamageMult().toFixed(1)}x damage. Average of ${getCritMulti('maybe').toFixed(2)}x`);
	if (game.global.universe === 1) debug(`Our block: ${calcOurBlock(true, true).toExponential(2)}`);
	if (game.global.universe === 2) debug(`Our equality: ${game.portal.Equality.disabledStackCount}`);
	debug(`Our Health: ${calcOurHealth(universeSetting2, mapType).toExponential(2)}`);

	debug(`Enemy Stats`, 'other');
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
	//This is actual damage of the army in combat ATM, without considering items bought, but not yet in use
	if (realDamage) return game.global.soldierCurrentAttack;

	let dmg = (6 + calcEquipment('attack')) * game.resources.trimps.maxSoldiers;
	if (mutations.Magma.active()) dmg *= mutations.Magma.getTrimpDecay();
	if (getPerkLevel('Power') > 0) dmg *= 1 + getPerkLevel('Power') * getPerkModifier('Power');
	if (getPerkLevel('Power_II') > 0) dmg *= 1 + getPerkModifier('Power_II') * getPerkLevel('Power_II');
	if (game.global.universe === 1 && game.global.formation !== 0 && game.global.formation !== 5) dmg *= game.global.formation === 2 ? 4 : 0.5;

	return dmg;
}

function getTrimpHealth(realHealth, mapType) {
	//This is the actual health of the army ATM, without considering items bought, but not yet in use
	if (realHealth) return game.global.soldierHealthMax;
	const heirloomToCheck = typeof atSettings !== 'undefined' ? heirloomShieldToEquip(mapType) : null;

	//Health from equipments and coordination
	let health = (50 + calcEquipment('health')) * game.resources.trimps.maxSoldiers;
	//Amalgamator
	if (game.jobs.Amalgamator.owned > 0) health *= game.jobs.Amalgamator.getHealthMult();
	//Magma
	if (mutations.Magma.active()) health *= mutations.Magma.getTrimpDecay();
	//Smithies
	health *= game.buildings.Smithy.owned > 0 ? game.buildings.Smithy.getMult() : 1;
	//Antenna Array
	health *= game.global.universe === 2 && game.buildings.Antenna.owned >= 10 ? game.jobs.Meteorologist.getExtraMult() : 1;
	//Toughness
	health *= getPerkLevel('Toughness') > 0 ? 1 + getPerkLevel('Toughness') * getPerkModifier('Toughness') : 1;
	//Toughness II
	health *= getPerkLevel('Toughness_II') > 0 ? 1 + getPerkLevel('Toughness_II') * getPerkModifier('Toughness_II') : 1;
	//Resilience
	health *= getPerkLevel('Resilience') > 0 ? Math.pow(getPerkModifier('Resilience') + 1, getPerkLevel('Resilience')) : 1;
	//Scruffy is Life
	health *= Fluffy.isRewardActive('healthy') ? 1.5 : 1;
	//Geneticists
	health *= game.jobs.Geneticist.owned > 0 ? Math.pow(1.01, game.global.lastLowGen) : 1;
	//Observation
	health *= game.global.universe === 2 && game.portal.Observation.trinkets > 0 ? game.portal.Observation.getMult() : 1;
	//Formation -- X and W stance both have full HP.
	health *= game.global.universe === 1 && game.global.formation !== 0 && game.global.formation !== 5 ? (game.global.formation === 1 ? 4 : 0.5) : 1;
	//Frigid Completions
	health *= game.global.frigidCompletions > 0 && game.global.universe === 1 ? game.challenges.Frigid.getTrimpMult() : 1;
	//Mayhem Completions
	health *= game.global.mayhemCompletions > 0 ? game.challenges.Mayhem.getTrimpMult() : 1;
	//Pandemonium Completions
	health *= game.global.pandCompletions > 0 ? game.challenges.Pandemonium.getTrimpMult() : 1;
	//Desolation Completions
	health *= game.global.desoCompletions > 0 ? game.challenges.Desolation.getTrimpMult() : 1;
	//AutoBattle
	health *= game.global.universe === 2 ? autoBattle.bonuses.Stats.getMult() : 1;
	//Shield (Heirloom)
	const heirloomHealth = typeof atSettings !== 'undefined' ? calcHeirloomBonus_AT('Shield', 'trimpHealth', 1, true, heirloomToCheck) : calcHeirloomBonus('Shield', 'trimpHealth', 1, true);
	health *= heirloomHealth > 1 ? 1 + heirloomHealth / 100 : 1;
	//Void Map Talents
	health *= mapType === 'void' && game.talents.voidPower.purchased ? 1 + game.talents.voidPower.getTotalVP() / 100 : 1;
	//Championism
	health *= game.global.universe === 2 ? game.portal.Championism.getMult() : 1;
	//Golden Battle
	health *= game.goldenUpgrades.Battle.currentBonus > 0 ? 1 + game.goldenUpgrades.Battle.currentBonus : 1;
	//Safe Mapping
	health *= mapType !== 'world' && game.talents.mapHealth.purchased ? 2 : 1;
	//Cinf
	health *= game.global.totalSquaredReward > 0 ? 1 + game.global.totalSquaredReward / 100 : 1;
	//Health (mutator)
	health *= game.global.universe === 2 && u2Mutations.tree.Health.purchased ? 1.5 : 1;
	//Gene Health (mutator)
	health *= game.global.universe === 2 && u2Mutations.tree.GeneHealth.purchased ? 10 : 1;
	//Pressure (Dailies)
	health *= typeof game.global.dailyChallenge.pressure !== 'undefined' ? dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks) : 1;
	//Challenges
	if (game.global.universe === 1) {
		health *= challengeActive('Life') ? game.challenges.Life.getHealthMult() : 1;
		health *= challengeActive('Balance') ? game.challenges.Balance.getHealthMult() : 1;
	}
	if (game.global.universe === 2) {
		health *= challengeActive('Revenge') && game.challenges.Revenge.stacks > 0 ? game.challenges.Revenge.getMult() : 1;
		health *= challengeActive('Wither') && game.challenges.Wither.trimpStacks > 0 ? game.challenges.Wither.getTrimpHealthMult() : 1;
		health *= challengeActive('Insanity') ? game.challenges.Insanity.getHealthMult() : 1;
		health *= challengeActive('Berserk') && game.challenges.Berserk.frenzyStacks > 0 ? game.challenges.Berserk.getHealthMult() : 1;
		health *= challengeActive('Berserk') && game.challenges.Berserk.frenzyStacks <= 0 ? game.challenges.Berserk.getHealthMult(true) : 1;
		health *= game.challenges.Nurture.boostsActive() ? game.challenges.Nurture.getStatBoost() : 1;
		health *= challengeActive('Alchemy') ? alchObj.getPotionEffect('Potion of Strength') : 1;
		health *= challengeActive('Desolation') ? game.challenges.Desolation.trimpHealthMult() : 1;
		health *= challengeActive('Smithless') && game.challenges.Smithless.fakeSmithies > 0 ? Math.pow(1.25, game.challenges.Smithless.fakeSmithies) : 1;
	}

	return health;
}

function calcOurHealth(stance = false, mapType, realHealth = false, fullGeneticist) {
	if (!mapType) mapType = !game.global.mapsActive ? 'world' : game.global.voidBuff ? 'void' : 'map';

	let health = getTrimpHealth(realHealth, mapType);
	if (game.global.universe === 1) {
		//Formation
		if (!stance && game.global.formation !== 0 && game.global.formation !== 5) health /= game.global.formation === 1 ? 4 : 0.5;

		//Geneticists
		const geneticist = game.jobs.Geneticist;
		if (fullGeneticist && geneticist.owned > 0) health *= Math.pow(1.01, geneticist.owned - game.global.lastLowGen);
	}
	if (game.global.universe === 2) {
		let shield = typeof atSettings !== 'undefined' ? getEnergyShieldMult_AT(mapType) : getEnergyShieldMult();
		//Prismatic Shield + Shield Layer. Scales with multiple Scruffy shield layers
		//Subtract health from shield total to give accurate result
		shield = health * (1 + shield * (1 + Fluffy.isRewardActive('shieldlayer'))) - health;
		if (stance) return shield;
		else health += shield;
	}

	return health;
}

function calcOurBlock(stance, realBlock) {
	if (game.global.universe === 2) return 0;

	let block = 0;

	//Ignores block gyms/shield that have been brought, but not yet deployed
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

	function checkResults() {
		debug(`Target Zone: ${targetZone}`, `debug`);
		debug(`Damage Mult: ${damageMult}`, `debug`);
		debug(`World Damage: ${worldDamage}`, `debug`);
		debug(`Equality: ${equality}`, `debug`);
		debug(`Block: ${block}`, `debug`);
		debug(`Pierce: ${pierce}`, `debug`);
		debug(`Health: ${health}`, `debug`);
		debug(`Hits to Survive: ${hitsToSurvive}`, `debug`);
		debug(`finalDmg: ${finalDmg}`, `debug`);
	}

	if (type !== 'map' && targetZone % 2 === 1 && challengeActive('Lead')) targetZone++;

	let customAttack = undefined;
	if (type === 'world') {
		if (game.global.universe === 1) {
			if (game.global.spireActive) {
				customAttack = calcSpire('attack');
				if (exitSpireCell(true) === 100 && game.global.usingShriek) customAttack *= game.mapUnlocks.roboTrimp.getShriekValue();
			} else if (isCorruptionActive(targetZone)) customAttack = calcCorruptedAttack(targetZone);
		} else if (game.global.universe === 2 && targetZone > 200) customAttack = calcMutationAttack(targetZone);
	}

	const enemyName = type === 'void' ? 'Cthulimp' : targetZone >= 59 ? 'Improbability' : 'Snimp';

	let hitsToSurvive = targetHitsSurvived(false, type);
	if (hitsToSurvive === 0) hitsToSurvive = 1;
	const health = calcOurHealth(false, type, false, true) / formationMod;
	const block = calcOurBlock(false) / formationMod;
	const equality = equalityQuery(enemyName, targetZone, 100, type, difficulty, 'gamma', null, hitsToSurvive);
	let damageMult = 1;

	if (game.global.universe === 1 && ((getPageSetting('IgnoreCrits') === 1 && type !== 'void') || getPageSetting('IgnoreCrits') === 0)) {
		const dailyCrit = challengeActive('Daily') && typeof game.global.dailyChallenge.crits !== 'undefined';
		const crushed = challengeActive('Crushed');
		if (dailyCrit) damageMult = dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
		else if (crushed && health > block) damageMult = 3;
	}

	const worldDamage = calcEnemyAttack(type, targetZone, 100, enemyName, undefined, customAttack, equality) * difficulty;
	const pierce = (game.global.universe === 1 && game.global.brokenPlanet && type === 'world' ? getPierceAmt() : 0) * (game.global.formation === 3 ? 2 : 1);

	const finalDmg = Math.max(damageMult * worldDamage - block, worldDamage * pierce, 0);

	if (checkOutputs) checkResults();
	return health / finalDmg;
}

function targetHitsSurvived(skipHDCheck, mapType) {
	const hitsSurvived = !skipHDCheck && mapSettings.mapName === 'Hits Survived' ? mapSettings.hdRatio : mapType === 'void' ? Number(getPageSetting('voidMapSettings')[0].hitsSurvived) : isDoingSpire() ? getPageSetting('hitsSurvivedSpire') : getPageSetting('hitsSurvived');
	return hitsSurvived;
}

function whichHitsSurvived() {
	let hitsSurvived = hdStats.hitsSurvived;
	const mapType = game.global.mapsActive ? getCurrentMapObject().location : { location: 'world' };
	if (mapType.location === 'Void' || (mapSettings.voidHitsSurvived && trimpStats.autoMaps)) hitsSurvived = hdStats.hitsSurvivedVoid;
	else if (mapType.location === 'Bionic' || (mapSettings.mapName === 'Bionic Raiding' && trimpStats.autoMaps)) hitsSurvived = hdStats.hitsSurvivedMap;
	return hitsSurvived;
}

function addPoison(realDamage, zone = game.global.world) {
	//Poison is inactive
	if (getEmpowerment(zone) !== 'Poison') return 0;
	//Real amount to be added in the next attack
	if (realDamage) return game.empowerments.Poison.getDamage();
	//Dynamically determines how much we are benefiting from poison based on Current Amount * Transfer Rate
	if (getPageSetting('addpoison')) return game.empowerments.Poison.getDamage() * getRetainModifier('Poison');
	return 0;
}

function getCritMulti(crit, customShield) {
	let critChance = typeof atSettings !== 'undefined' ? getPlayerCritChance_AT(customShield) : getPlayerCritChance();
	const critD = typeof atSettings !== 'undefined' ? getPlayerCritDamageMult_AT(customShield) : getPlayerCritDamageMult();
	let critDHModifier;

	if (crit === 'never') critChance = Math.floor(critChance);
	else if (crit === 'force') critChance = Math.ceil(critChance);
	const dmgMulti = getMegaCritDamageMult(Math.floor(critChance));
	const lowTierMulti = getMegaCritDamageMult(Math.floor(critChance));
	const highTierMulti = getMegaCritDamageMult(Math.ceil(critChance));
	const highTierChance = critChance - Math.floor(critChance);

	if (critChance < 0) critDHModifier = 1 + critChance - critChance / 5;
	else if (critChance < 1) critDHModifier = 1 - critChance + critChance * critD;
	else if (critChance < 2) critDHModifier = (critChance - 1) * getMegaCritDamageMult(2) * critD + (2 - critChance) * critD;
	else if (critChance >= 2 && (crit === 'never' || crit === 'force')) critDHModifier = dmgMulti * critD;
	else if (critChance >= 2) critDHModifier = ((1 - highTierChance) * lowTierMulti + highTierChance * highTierMulti) * critD;
	else critDHModifier = (critChance - 2) * Math.pow(getMegaCritDamageMult(critChance), 2) * critD + (3 - critChance) * getMegaCritDamageMult(critChance) * critD;

	return critDHModifier;
}

function getAnticipationBonus(stacks) {
	if (stacks === undefined) stacks = game.global.antiStacks;

	const maxStacks = game.talents.patience.purchased ? 45 : 30;
	const perkMult = getPerkLevel('Anticipation') * getPerkModifier('Anticipation');
	const stacks45 = typeof autoTrimpSettings === 'undefined' ? maxStacks : getPageSetting('45stacks');

	//Regular anticipation
	if (!stacks45) return 1 + stacks * perkMult;
	return 1 + maxStacks * perkMult;
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

	attack *= 1 + Math.max(0, game.global.achievementBonus) / 100;
	attack *= mapType !== 'world' ? 1 : game.talents.mapBattery.purchased && game.global.mapBonus === 10 ? 5 : 1 + game.global.mapBonus * 0.2;
	attack *= mapType !== 'world' && useTitimp === 'force' ? 2 : mapType !== 'world' && mapType !== '' && useTitimp && game.global.titimpLeft > 0 ? 2 : 1;
	attack *= 1 + 0.2 * game.global.roboTrimpLevel;
	attack *= game.challenges.Mayhem.getTrimpMult();
	attack *= game.challenges.Pandemonium.getTrimpMult();
	attack *= game.challenges.Desolation.getTrimpMult();
	// Heirloom (Shield)
	const heirloomAttack = typeof atSettings !== 'undefined' ? calcHeirloomBonus_AT('Shield', 'trimpAttack', 1, true, heirloomToCheck) : calcHeirloomBonus('Shield', 'trimpAttack', 1, true);
	attack *= heirloomAttack > 1 ? 1 + heirloomAttack / 100 : 1;
	// Golden Upgrade
	attack *= 1 + game.goldenUpgrades.Battle.currentBonus;
	// Herbalist Mastery
	attack *= game.talents.herbalist.purchased ? game.talents.herbalist.getBonus() : 1;
	//Void Power
	if (game.talents.voidPower.purchased && mapType === 'void') {
		attack *= game.talents.voidPower2.purchased ? (game.talents.voidPower3.purchased ? 1.65 : 1.35) : 1.15;
		attack *= game.talents.voidMastery.purchased ? 5 : 1;
	}

	if (game.global.universe === 1) {
		attack *= game.challenges.Frigid.getTrimpMult();
		//Anticipation
		attack *= game.global.antiStacks > 0 ? getAnticipationBonus() : 1;
		//Formation
		if (specificStance && game.global.formation !== 0 && game.global.formation !== 5) attack /= game.global.formation === 2 ? 4 : 0.5;
		if (specificStance && specificStance !== 'X' && specificStance !== 'W') attack *= specificStance === 'D' ? 4 : 0.5;
		//Scryhard I - MAKE SURE THIS WORKS!
		var fightingCorrupted = (getCurrentEnemy() && getCurrentEnemy().corrupted) || (!realDamage && (mutations.Healthy.active() || mutations.Corruption.active()));
		if (game.talents.scry.purchased && fightingCorrupted && ((!specificStance && game.global.formation === 4) || specificStance === 'S' || specificStance === 'W')) attack *= 2;
		//Magmamancery
		if (game.talents.magmamancer.purchased) attack *= game.jobs.Magmamancer.getBonusPercent();
		//Still Rowing 2
		if (game.talents.stillRowing2.purchased) attack *= game.global.spireRows * 0.06 + 1;
		//Strength in Health
		if (game.talents.healthStrength.purchased && mutations.Healthy.active()) attack *= 0.15 * mutations.Healthy.cellCount() + 1;

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
		//Poison Empowerment
		attack *= game.global.uberNature === 'Poison' ? 3 : 1;

		//Challenges
		if (challengeActive('Life')) attack *= game.challenges.Life.getHealthMult();
		if (challengeActive('Lead') && game.global.world % 2 === 1) attack *= 1.5;
		if (challengeActive('Decay')) attack *= 5 * Math.pow(0.995, game.challenges.Decay.stacks);
	}

	if (game.global.universe === 2) {
		attack *= game.buildings.Smithy.getMult();
		attack *= game.portal.Hunger.getMult();
		attack *= autoBattle.bonuses.Stats.getMult();
		attack *= game.portal.Championism.getMult();
		attack *= game.portal.Tenacity.getMult();
		attack *= getPerkLevel('Frenzy') > 0 && !challengeActive('Berserk') && (autoBattle.oneTimers.Mass_Hysteria.owned || (typeof atSettings !== 'undefined' && getPageSetting('frenzyCalc'))) ? 1 + 0.5 * getPerkLevel('Frenzy') : 1;
		attack *= game.portal.Observation.trinkets > 0 ? game.portal.Observation.getMult() : 1;

		attack *= challengeActive('Desolation') ? game.challenges.Desolation.trimpAttackMult() : 1;
		attack *= u2Mutations.tree.Attack.purchased ? 1.5 : 1;
		attack *= u2Mutations.tree.GeneAttack.purchased ? 10 : 1;
		attack *= u2Mutations.tree.Brains.purchased ? u2Mutations.tree.Brains.getBonus() : 1;

		if (challengeActive('Quagmire')) {
			const exhaustedStacks = game.challenges.Quagmire.exhaustedStacks;
			const mod = mapType !== 'world' ? 0.05 : mapType === 'world' ? 0.1 : game.global.mapsActive ? 0.05 : 0.1;
			if (exhaustedStacks === 0) attack *= 1;
			else if (exhaustedStacks < 0) attack *= Math.pow(1 + mod, Math.abs(exhaustedStacks));
			else attack *= Math.pow(1 - mod, exhaustedStacks);
		}

		const challengeFunctions = {
			Unbalance: () => game.challenges.Unbalance.getAttackMult(),
			Duel: () => (game.challenges.Duel.trimpStacks > 50 ? 3 : 1),
			Melt: () => game.challenges.Melt.getAttackMult(),
			Revenge: () => game.challenges.Revenge.getMult(),
			Quest: () => game.challenges.Quest.getAttackMult(),
			Archaeology: () => game.challenges.Archaeology.getStatMult('attack'),
			Storm: () => (game.global.mapsActive ? Math.pow(0.9995, game.challenges.Storm.beta) : 1),
			Berserk: () => game.challenges.Berserk.getAttackMult(),
			Nurture: () => (game.challenges.Nurture.boostsActive() ? game.challenges.Nurture.getStatBoost() : 1),
			Alchemy: () => alchObj.getPotionEffect('Potion of Strength'),
			Smithless: () => (game.challenges.Smithless.fakeSmithies > 0 ? Math.pow(1.25, game.challenges.Smithless.fakeSmithies) : 1)
		};

		Object.keys(challengeFunctions).forEach((challenge) => {
			attack *= challengeActive(challenge) ? challengeFunctions[challenge]() : 1;
		});

		attack *= mapType === 'world' && game.global.novaMutStacks > 0 ? u2Mutations.types.Nova.trimpAttackMult() : 1;
	}

	attack *= mapType === 'map' && game.talents.bionic2.purchased && mapLevel > 0 ? 1.5 : 1;
	attack *= game.global.sugarRush ? sugarRush.getAttackStrength() : 1;
	attack *= 1 + Math.max(0, game.global.totalSquaredReward) / 100;
	if (Fluffy.isActive()) {
		attack *= Fluffy.getDamageModifier();
		if (Fluffy.isRewardActive('voidSiphon') && game.stats.totalVoidMaps.value) attack *= 1 + game.stats.totalVoidMaps.value * 0.05;
		if (game.global.universe === 1 && game.talents.kerfluffle.purchased) attack *= game.talents.kerfluffle.mult();
	}
	attack *= 1 + playerSpireTraps.Strength.getWorldBonus() / 100;
	attack *= game.singleRunBonuses.sharpTrimps.owned ? 1.5 : 1;

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

	// Equality
	if (game.global.universe === 2 && getPerkLevel('Equality') > 0) {
		const equalityMult = typeof atSettings !== 'undefined' ? getPlayerEqualityMult_AT(heirloomToCheck) : game.portal.Equality.getMult(true);
		if (!isNaN(parseInt(equality))) {
			attack *= Math.pow(equalityMult, equality);
			if (equality > getPerkLevel('Equality')) console.log(`You don't have this many levels in Equality. ${equality}/${getPerkLevel('Equality')} equality used. Player Dmg. `);
		} else if (atSettings.intervals.tenSecond) console.log(`Equality is not a number. ${equality} equality used. Player Dmg. `);
	}

	//Override for if the user wants to for some reason floor their crit chance
	if (typeof atSettings !== 'undefined' && getPageSetting('floorCritCalc')) critMode = 'never';

	//If we have critMode defined there's no point in calculating it 3 different times
	//If not defined then get an accurate value for all 3
	var min, max, avg;
	if (critMode) {
		min = attack * getCritMulti(critMode, heirloomToCheck);
		avg = min;
		max = min;
	} else {
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
		if (isDoingSpire() && exitCell > 0 && exitCell <= 100) cell = exitCell;
		else cell = 100;
	}

	if (checkCell) return cell;

	//Enemy on the Target Cell
	var enemy = name ? name : game.global.gridArray[cell - 1].name;
	var base = what === 'attack' ? calcEnemyBaseAttack('world', game.global.world, 100, enemy) : 2 * calcEnemyBaseHealth('world', game.global.world, 100, enemy);
	var mod = what === 'attack' ? 1.17 : 1.14;

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
	if (challengeActive('Domination') && cell !== 100) base /= what === 'attack' ? 25 : 75;

	return base;
}

function badGuyCritMult(enemy = getCurrentEnemy(), critPower = 2, block = game.global.soldierCurrentBlock, health = game.global.soldierHealth) {
	if (getPageSetting('IgnoreCrits') === 2) return 1;
	if (!enemy) enemy = getCurrentEnemy();
	if (critPower <= 0) return 1;

	let regular = 1;
	let challenge = 1;

	//Non-challenge crits
	if (enemy.corrupted === 'corruptCrit') regular = 5;
	else if (enemy.corrupted === 'healthyCrit') regular = 7;
	else if (game.global.voidBuff === 'getCrit' && getPageSetting('IgnoreCrits') !== 1) regular = 5;

	//Challenge crits
	const crushed = challengeActive('Crushed');
	const critDaily = challengeActive('Daily') && typeof game.global.dailyChallenge.crits !== 'undefined';

	//Challenge multiplier
	if (critDaily) challenge = dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
	else if (crushed && health > block) challenge = 5;

	//Result -- Yep. Crits may crit! Yey!
	if (critPower === 2) return regular * challenge;
	else return Math.max(regular, challenge);
}

function calcCorruptionScale(zone, base) {
	const startPoint = challengeActive('Corrupted') || challengeActive('Eradicated') ? 1 : 150;
	const scales = Math.floor((zone - startPoint) / 6);
	const realValue = base * Math.pow(1.05, scales);
	return realValue;
}

function calcEnemyBaseAttack(type, zone, cell, name, query = false) {
	//Pre-Init
	if (!type) type = !game.global.mapsActive ? 'world' : getCurrentMapObject().location === 'Void' ? 'void' : 'map';
	if (!zone) zone = type === 'world' || !game.global.mapsActive ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = type === 'world' || !game.global.mapsActive ? getCurrentWorldCell().level : getCurrentMapCell() ? getCurrentMapCell().level : 1;
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : 'Snimp';

	const mapGrid = type === 'world' ? 'gridArray' : 'mapGridArray';

	if (!query && zone >= 200 && cell !== 100 && type === 'world' && game.global.universe === 2 && game.global[mapGrid][cell].u2Mutation) {
		if (cell !== 100 && type === 'world' && game.global[mapGrid][cell].u2Mutation) {
			return u2Mutations.getAttack(game.global[mapGrid][cell - 1]);
		}
	}

	const attackBase = game.global.universe === 2 ? 750 : 50;
	let attack = attackBase * Math.sqrt(zone) * Math.pow(3.27, zone / 2) - 10;

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
	else if (zone < 60) attack = 0.375 * attack + 0.7 * attack * (cell / 100);
	//After Breaking the Planet
	else {
		attack = 0.4 * attack + 0.9 * attack * (cell / 100);
		attack *= Math.pow(1.15, zone - 59);
	}

	//Flat Attack reduction for before Z60.
	if (zone < 60) attack *= 0.85;

	//Maps
	if (zone > 6 && type !== 'world') attack *= 1.1;

	//Specific Imp
	if (name) attack *= game.badGuys[name].attack;

	//U2 zone adjustment
	if (game.global.universe === 2) {
		let part1 = zone > 40 ? 40 : zone;
		let part2 = zone > 60 ? 20 : zone - 40;
		let part3 = zone - 60;
		let part4 = zone - 300;
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
	if (!type) type = !game.global.mapsActive ? 'world' : getCurrentMapObject().location === 'Void' ? 'void' : 'map';
	if (!zone) zone = type === 'world' || !game.global.mapsActive ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = type === 'world' || !game.global.mapsActive ? getCurrentWorldCell().level : getCurrentMapCell() ? getCurrentMapCell().level : 1;
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : 'Snimp';
	if (!minOrMax) minOrMax = false;

	var attack = calcEnemyBaseAttack(type, zone, cell, name);
	var fluctuation = game.global.universe === 2 ? 0.5 : 0.2;
	if (game.global.universe === 1) {
		//Spire - Overrides the base attack number
		if (type === 'world') {
			if (game.global.spireActive) {
				attack = calcSpire('attack', cell, name);
			} else if (mutations.Corruption.active()) {
				if (game.global.gridArray && game.global.gridArray.length > 0 && game.global.gridArray[cell - 1].mutation) {
					attack = corruptionBaseAttack(cell - 1, zone);
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
			if (game.global.gridArray && game.global.gridArray.length > 0 && game.global.gridArray[cell - 1].u2Mutation && game.global.gridArray[cell - 1].u2Mutation.length !== 0) {
				attack = mutationBaseAttack(cell - 1, zone);
			}
		}
	}

	//Use custom values instead
	if (customAttack) attack = customAttack;

	//WARNING! Check every challenge!
	if (game.global.universe === 1) {
		if (challengeActive('Balance')) attack *= type === 'world' ? 1.17 : 2.35;
		if (challengeActive('Meditate')) attack *= 1.5;
		if (challengeActive('Life')) attack *= 6;
		if (challengeActive('Toxicity')) attack *= 5;
		if (challengeActive('Lead')) attack *= zone % 2 === 0 ? 5.08 : 1 + 0.04 * game.challenges.Lead.stacks;
		if (challengeActive('Watch')) attack *= 1.25;
		if (challengeActive('Corrupted')) attack *= 3;
		if (challengeActive('Domination')) attack *= 2.5;
		if (challengeActive('Scientist') && getScientistLevel() === 5) attack *= 10;
		if (challengeActive('Frigid')) attack *= game.challenges.Frigid.getEnemyMult();
		if (challengeActive('Experience')) attack *= game.challenges.Experience.getEnemyMult();

		if (challengeActive('Coordinate')) {
			let amt = 1;
			for (let i = 1; i < zone; i++) amt = Math.ceil(amt * 1.25);
			attack *= amt;
		}

		if (challengeActive('Obliterated') || challengeActive('Eradicated')) {
			let oblitMult = challengeActive('Eradicated') ? game.challenges.Eradicated.scaleModifier : 1e12;
			const zoneModifier = Math.floor(game.global.world / game.challenges[game.global.challengeActive].zoneScaleFreq);
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
		if (challengeActive('Alchemy')) attack *= alchObj.getEnemyStats(type !== 'world', type === 'void') + 1;
		if (challengeActive('Hypothermia')) attack *= game.challenges.Hypothermia.getEnemyMult();
		if (challengeActive('Glass')) attack *= game.challenges.Glass.attackMult();

		if (type === 'world' && game.global.novaMutStacks > 0) attack *= u2Mutations.types.Nova.enemyAttackMult();

		if (equality) {
			if (!isNaN(parseInt(equality))) {
				attack *= Math.pow(game.portal.Equality.getModifier(), equality);
				if (equality > getPerkLevel('Equality')) debug(`You don't have this many levels in Equality. - Enemy Dmg. ${equality}/${getPerkLevel('Equality')} equality used.`);
			} else if (atSettings.intervals.tenSecond) {
				debug(`Equality is not a number. - Enemy Dmg. ${equality} equality used.`);
			}
		}
	}

	//Dailies
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
	var attack = calcEnemyAttackCore(type, zone, cell, name, minOrMax, customAttack, equality);

	//Challenges
	if (challengeActive('Nom')) {
		if (type === 'world') {
			if (typeof getCurrentWorldCell() !== 'undefined' && typeof getCurrentWorldCell().nomStacks !== 'undefined') attack *= Math.pow(1.25, getCurrentWorldCell().nomStacks);
		} else if (game.global.mapsActive && typeof getCurrentEnemy() !== 'undefined' && typeof getCurrentEnemy().nomStacks !== 'undefined') attack *= Math.pow(1.25, getCurrentEnemy().nomStacks);
	}

	//Dmg + Magneto Shriek during Domination
	if (challengeActive('Domination')) {
		attack *= 2.5;
		if (type === 'world' && game.global.usingShriek) attack *= game.mapUnlocks.roboTrimp.getShriekValue();
	}

	//Ice - Experimental
	if (getEmpowerment() === 'Ice' && getPageSetting('fullice')) {
		var afterTransfer = 1 + Math.ceil(game.empowerments.Ice.currentDebuffPower * getRetainModifier('Ice'));
		attack *= Math.pow(game.empowerments.Ice.getModifier(), afterTransfer);
	}

	return minOrMax ? Math.floor(attack) : Math.ceil(attack);
}

function calcSpecificEnemyAttack(critPower = 2, customBlock, customHealth) {
	var enemy = getCurrentEnemy();
	if (!enemy) return 1;

	var attack = calcEnemyAttackCore();
	attack *= badGuyCritMult(enemy, critPower, customBlock, customHealth);

	//Challenges - considers the actual scenario for this enemy
	if (challengeActive('Nom') && typeof enemy.nomStacks !== 'undefined') attack *= Math.pow(1.25, enemy.nomStacks);
	if (challengeActive('Lead')) attack *= 1 + 0.04 * game.challenges.Lead.stacks;

	//Magneto Shriek
	if (game.global.usingShriek) attack *= game.mapUnlocks.roboTrimp.getShriekValue();

	//Ice
	if (getEmpowerment() === 'Ice') attack *= game.empowerments.Ice.getCombatModifier();

	return Math.ceil(attack);
}

function calcEnemyBaseHealth(mapType, zone, cell, name, ignoreCompressed) {
	//Pre-Init
	if (!mapType) mapType = !game.global.mapsActive ? 'world' : getCurrentMapObject().location === 'Void' ? 'void' : 'map';
	if (!zone) zone = mapType === 'world' || !game.global.mapsActive ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = mapType === 'world' || !game.global.mapsActive ? getCurrentWorldCell().level : getCurrentMapCell() ? getCurrentMapCell().level : 1;
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : 'Turtlimp';

	if (!ignoreCompressed && mapType === 'world' && game.global.universe === 2 && game.global.world > 200 && typeof game.global.gridArray[cell - 1].u2Mutation !== 'undefined') {
		const extraCells = u2Mutations.types.Compression.repeats() - 1;
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
	//Pre-Init
	if (!type) type = !game.global.mapsActive ? 'world' : getCurrentMapObject().location === 'Void' ? 'void' : 'map';
	if (!zone) zone = type === 'world' || !game.global.mapsActive ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = type === 'world' || !game.global.mapsActive ? getCurrentWorldCell().level : getCurrentMapCell() ? getCurrentMapCell().level : 1;
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : 'Turtlimp';

	var health = calcEnemyBaseHealth(type, zone, cell, name);

	//Curr zone Mutation HP
	if (game.global.universe === 2 && type === 'world' && game.global.world > 200) {
		if (game.global.gridArray && game.global.gridArray.length > 0 && game.global.gridArray[cell - 1].u2Mutation && game.global.gridArray[cell - 1].u2Mutation.length !== 0) {
			health = mutationBaseHealth(cell - 1, zone);
		}
	}

	//Spire - Overrides the base health number
	if (type === 'world' && game.global.spireActive) health = calcSpire('health');

	//Map and Void Corruption
	if (type !== 'world') {
		//Corruption in maps
		if (mutations.Magma.active()) health *= calcCorruptionScale(game.global.world, 10) / (type === 'void' ? 1 : 2);
	}

	//Use a custom value instead
	if (customHealth) health = customHealth;

	//Challenges
	//U1
	if (game.global.universe === 1) {
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
		//Obliterated + Eradicated
		if (challengeActive('Obliterated') || challengeActive('Eradicated')) {
			let oblitMult = challengeActive('Eradicated') ? game.challenges.Eradicated.scaleModifier : 1e12;
			const zoneModifier = Math.floor(game.global.world / game.challenges[game.global.challengeActive].zoneScaleFreq);
			oblitMult *= Math.pow(game.challenges[game.global.challengeActive].zoneScaling, zoneModifier);
			health *= oblitMult;
		}
	}

	//U2
	if (game.global.universe === 2) {
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
	}

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

	return health;
}

function calcEnemyHealth(type, zone, cell = 99, name = 'Turtlimp', customHealth) {
	var health = calcEnemyHealthCore(type, zone, cell, name, customHealth);

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
		} else if (game.global.universe === 2) if (targetZone > 200) customHealth = calcMutationHealth(targetZone);
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
			if (highest > attack) worstCell = i;
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
			for (var y = i + 1; y < i + u2Mutations.types.Compression.cellCount(); y++) {
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
	cell = game.global.gridArray[cell];
	let baseHealth = calcEnemyBaseHealth('world', targetZone, cell.cs || cell.level, cell.name, true);
	let addHealth = cell.cc ? u2Mutations.types.Compression.health(cell, baseHealth) : 0;

	if (cell.u2Mutation.includes('NVA')) baseHealth *= 0.01;
	else if (cell.u2Mutation.includes('NVX')) baseHealth *= 0.1;

	baseHealth += addHealth;
	baseHealth *= 2;
	baseHealth *= Math.pow(1.02, targetZone - 201);
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
	const heirloomToCheck = heirloomShieldToEquip('world');
	var compressedSwap = getPageSetting('heirloomCompressedSwap');
	var compressedSwapValue = getPageSetting('heirloomSwapHDCompressed');

	for (var i = 0; i < game.global.gridArray.length; i++) {
		cell = i;
		if (gridArray[cell].u2Mutation && gridArray[cell].u2Mutation.length) {
			var enemyHealth = mutationBaseHealth(cell, targetZone);
			if (gridArray[cell].u2Mutation.includes('CMP') && compressedSwap && compressedSwapValue > 0) {
				if (heirloomToCheck !== 'heirloomInitial' || hdStats.hdRatioHeirloom >= compressedSwapValue || MODULES.heirlooms.compressedCalc) enemyHealth *= 0.7;
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
	let attack = 1;

	//All U1
	attack *= challengeActive('Balance') ? 2.35 : 1;
	attack *= challengeActive('Meditate') ? 1.5 : 1;
	attack *= challengeActive('Life') ? 6 : 1;
	attack *= challengeActive('Toxicity') ? 5 : 1;
	attack *= challengeActive('Lead') ? 1 + 0.04 * game.challenges.Lead.stacks : 1;
	attack *= challengeActive('Corrupted') ? 3 : 1;
	//Obliterated and Eradicated
	if (challengeActive('Obliterated') || challengeActive('Eradicated')) {
		var oblitMult = challengeActive('Eradicated') ? game.challenges.Eradicated.scaleModifier : 1e12;
		const zoneModifier = Math.floor(game.global.world / game.challenges[game.global.challengeActive].zoneScaleFreq);
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

	if (game.global.world > 200 && typeof game.global.gridArray[game.global.lastClearedCell + 1].u2Mutation !== 'undefined') {
		if (!game.global.mapsActive) {
			if (game.global.gridArray[game.global.lastClearedCell + 1].u2Mutation.length > 0) {
				var cell = game.global.gridArray[game.global.lastClearedCell + 1];
				if (cell.u2Mutation.indexOf('RGE') !== -1 || (cell.cc && cell.cc[3] > 0)) attack *= u2Mutations.types.Rage.enemyAttackMult();
			}
			attack *= game.global.novaMutStacks > 0 ? u2Mutations.types.Nova.enemyAttackMult() : 1;
		}
	}

	return attack;
}

function getTotalHealthMod() {
	var healthMulti = 1;
	//Smithies
	healthMulti *= game.buildings.Smithy.owned > 0 ? game.buildings.Smithy.getMult() : 1;
	//Antenna Array
	healthMulti *= game.global.universe === 2 && game.buildings.Antenna.owned >= 10 ? game.jobs.Meteorologist.getExtraMult() : 1;
	//Toughness add
	healthMulti *= getPerkLevel('Toughness') > 0 ? 1 + getPerkLevel('Toughness') * getPerkModifier('Toughness') : 1;
	//Resilience
	healthMulti *= getPerkLevel('Resilience') > 0 ? Math.pow(getPerkModifier('Resilience') + 1, getPerkLevel('Resilience')) : 1;
	//Scruffy is Life
	healthMulti *= Fluffy.isRewardActive('healthy') ? 1.5 : 1;
	//Observation
	healthMulti *= game.global.universe === 2 && game.portal.Observation.trinkets > 0 ? game.portal.Observation.getMult() : 1;
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
	healthMulti *= game.global.totalSquaredReward > 0 ? 1 + game.global.totalSquaredReward / 100 : 1;
	//Mutator
	healthMulti *= game.global.universe === 2 && u2Mutations.tree.Health.purchased ? 1.5 : 1;
	// Challenge Multis
	healthMulti *= challengeActive('Revenge') && game.challenges.Revenge.stacks > 0 ? game.challenges.Revenge.getMult() : 1;
	healthMulti *= challengeActive('Wither') && game.challenges.Wither.trimpStacks > 0 ? game.challenges.Wither.getTrimpHealthMult() : 1;
	healthMulti *= challengeActive('Insanity') ? game.challenges.Insanity.getHealthMult() : 1;
	healthMulti *= challengeActive('Berserk') && game.challenges.Berserk.frenzyStacks > 0 ? game.challenges.Berserk.getHealthMult() : 1;
	healthMulti *= challengeActive('Berserk') && game.challenges.Berserk.frenzyStacks <= 0 ? game.challenges.Berserk.getHealthMult(true) : 1;
	healthMulti *= game.challenges.Nurture.boostsActive() ? game.challenges.Nurture.getStatBoost() : 1;
	healthMulti *= challengeActive('Alchemy') ? alchObj.getPotionEffect('Potion of Strength') : 1;
	healthMulti *= challengeActive('Smithless') && game.challenges.Smithless.fakeSmithies > 0 ? Math.pow(1.25, game.challenges.Smithless.fakeSmithies) : 1;
	// Daily mod
	healthMulti *= typeof game.global.dailyChallenge.pressure !== 'undefined' ? dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks) : 1;
	// Prismatic
	healthMulti *= 1 + getEnergyShieldMult();
	// Shield layer
	healthMulti *= Fluffy.isRewardActive('shieldlayer') ? 1 + Fluffy.isRewardActive('shieldlayer') : 1;
	return healthMulti;
}

function gammaMaxStacks(specialChall, actualCheck = true, mapType = 'world') {
	if (heirloomShieldToEquip(mapType) && getHeirloomBonus_AT('Shield', 'gammaBurst', heirloomShieldToEquip(mapType)) <= 1) return Infinity;
	var gammaMaxStacks = 5;
	if (autoBattle.oneTimers.Burstier.owned) gammaMaxStacks--;
	if (Fluffy.isRewardActive('scruffBurst')) gammaMaxStacks--;
	if (actualCheck && MODULES.heirlooms.gammaBurstPct === 1) return 1;
	if (typeof atSettings !== 'undefined' && specialChall && game.global.mapsActive) gammaMaxStacks = Infinity;
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

	var soldierHealthMax = game.global.soldierHealthMax;
	var soldierHealth = game.global.soldierHealth;
	var shieldHealth = 0;

	//Fix our health to the correct new value if we are changing heirlooms
	if (!correctHeirloom) {
		soldierHealth /= 1 + currentShield;
		soldierHealth *= 1 + newShield;
		soldierHealthMax /= 1 + currentShield;
		soldierHealthMax *= 1 + newShield;
	}
	//Work out what our shield percentage is.
	if (game.global.universe === 2) {
		var maxLayers = Fluffy.isRewardActive('shieldlayer');
		var layers = maxLayers - game.global.shieldLayersUsed;
		var shieldMax = game.global.soldierEnergyShieldMax;
		var shieldCurr = game.global.soldierEnergyShield;

		//Fix our shield to the correct new value if we are changing heirlooms
		if (!correctHeirloom) {
			const energyShieldMult = getEnergyShieldMult_AT(mapType, true);
			const newShieldMult = getHeirloomBonus_AT('Shield', 'prismatic', heirloomToCheck) / 100;
			const shieldPrismatic = newShieldMult > 0 ? energyShieldMult + newShieldMult : energyShieldMult;
			const currShieldPrismatic = energyShieldMult + getHeirloomBonus('Shield', 'prismatic') / 100;

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
				if (layers !== maxLayers && i > layers) continue;
				if (i === maxLayers - layers) shieldHealth += shieldMax;
				else shieldHealth += shieldCurr;
			}
		} else {
			shieldHealth = shieldCurr;
		}
		shieldHealth = shieldHealth < 0 ? 0 : shieldHealth;
	}
	//Subtracting Plauge daily mod from health
	if (typeof game.global.dailyChallenge.plague !== 'undefined') soldierHealth -= soldierHealthMax * dailyModifiers.plague.getMult(game.global.dailyChallenge.plague.strength, game.global.dailyChallenge.plague.stacks);
	//If already dead or need to die due to plague debuff then return 0
	if (soldierHealth <= 0) return 0;

	if (angelic) soldierHealth *= 0.33;
	if (shieldBreak) return shieldHealth;
	return shieldHealth + soldierHealth;
}

//Make the gametime checks factor in how long you've been paused for
function getGameTime() {
	const startTime = game.global.start;
	if (game.options.menu.pauseGame.enabled) return startTime + (game.options.menu.pauseGame.timeAtPause - startTime) + game.global.time;
	return startTime + game.global.time;
}

//Checks to see if we have enough health to survive against the max attack of the worst enemy cell inside of a map.
function enoughHealth(map) {
	const health = calcOurHealth(false, 'map', false, true);
	const block = calcOurBlock(false, false);
	const totalHealth = health + block;

	const enemyName = map.name === 'Imploding Star' ? 'Neutrimp' : map.location === 'Void' ? 'Cthulimp' : 'Snimp';
	const mapType = map.location === 'Void' ? 'void' : 'map';
	const level = map.name === 'The Black Bog' ? game.global.world : map.level;
	const equalityAmt = game.global.universe === 2 ? equalityQuery(enemyName, level, map.size, 'map', map.difficulty, 'gamma') : 0;
	const enemyDmg = calcEnemyAttackCore(mapType, level, map.size, enemyName, false, false, equalityAmt) * map.difficulty;

	return totalHealth > enemyDmg;
}
