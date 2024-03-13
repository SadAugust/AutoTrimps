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

		this.resourcesPS = getPsValues();

		this.mountainPriority = !(imps.Chronoimp || imps.Jestimp || ['lmc', 'smc'].includes(getAvailableSpecials('lmc', true)));
	}
}

class HDStats {
	constructor() {
		this.autoLevel = hdStats.autoLevel;
		this.autoLevelInitial = hdStats.autoLevelInitial;
		this.autoLevelZone = hdStats.autoLevelZone;
		this.autoLevelData = hdStats.autoLevelData;
		this.autoLevelLoot = hdStats.autoLevelLoot;
		this.autoLevelSpeed = hdStats.autoLevelSpeed;

		const { world, universe } = game.global;

		const voidMaxTenacity = getPageSetting('voidMapSettings')[0].maxTenacity;
		const autoLevel = whichAutoLevel();

		let voidPercent = _getVoidPercent(world, universe);

		const mapDifficulty = game.global.mapsActive && getCurrentMapObject().location === 'Bionic' ? 2.6 : 0.75;

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

		if (autoLevel === 'original') this.autoLevel = autoMapLevel();
		else {
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
}

function _getVoidMapsObjects() {
	return game.global.mapsOwnedArray.filter(map => map.location === 'Void');
}

function _getVoidPercent(world = game.global.world, universe = game.global.universe) {
	const ownedVoidMaps = _getVoidMapsObjects();

	if (ownedVoidMaps.length)
		return ownedVoidMaps.reduce((worstDiff, currentMap) => Math.max(worstDiff, currentMap.difficulty), 0);

	let voidPercent = 4.5;
	if (world <= 59) {
		voidPercent -= 2;
		if (universe === 1) voidPercent /= 2;
	} else if (universe === 1 && world <= 199) {
		voidPercent -= 1;
	}

	if (challengeActive('Mapocalypse')) voidPercent += 3;

	return voidPercent;
}

function applyMultipliers(multipliers, stat, challenge, postChallengeCheck) {
	Object.keys(multipliers).forEach((key) => {
		if (challenge && postChallengeCheck && key === 'Nurture' && game.challenges.Nurture.boostsActive()) stat *= multipliers[key]();
		else if (challenge) stat *= challengeActive(key) ? multipliers[key]() : 1;
		else stat *= multipliers[key]();
	});

	return stat;
}

function applyDailyMultipliers(modifier, value = 1) {
	const dailyChallenge = game.global.dailyChallenge;
	if (typeof dailyChallenge[modifier] === 'undefined') return value;
	return dailyModifiers[modifier].getMult(dailyChallenge[modifier].strength, dailyChallenge[modifier].stacks);
}

function getCurrentWorldCell() {
	const { gridArray, lastClearedCell } = game.global;
	return gridArray[lastClearedCell + 1] || { level: 1 };
}

function _getWorldType() {
	return !game.global.mapsActive ? 'world' : game.global.voidBuff ? 'void' : 'map';
}

function _getZone(worldType = _getWorldType()) {
	return ['world', 'void'].includes(worldType) || !game.global.mapsActive ? game.global.world : getCurrentMapObject().level;
}

function _getCell() {
	return getCurrentEnemy().level || 1;
}

function _getEnemyName(name = 'Chimp') {
	return getCurrentEnemy().name || { name };
}

function calcEquipment(equipType = 'attack') {
	let bonus = 0;
	let equipmentList;

	if (equipType === 'attack') equipmentList = ['Dagger', 'Mace', 'Polearm', 'Battleaxe', 'Greatsword', 'Arbalest'];
	else equipmentList = ['Shield', 'Boots', 'Helmet', 'Pants', 'Shoulderguards', 'Breastplate', 'Gambeson'];

	for (let i = 0; i < equipmentList.length; i++) {
		const equip = game.equipment[equipmentList[i]];
		if (equip.locked) continue;
		bonus += equip.level * equip[equipType + 'Calculated'];
	}

	return bonus;
}

function calcCorruptionScale(zone = game.global.world, base = 10) {
	const startPoint = challengeActive('Corrupted') || challengeActive('Eradicated') ? 1 : 150;
	const scales = Math.floor((zone - startPoint) / 6);
	return base * Math.pow(1.05, scales);
}

function calcSpire(what = 'attack', cell, name, checkCell) {
	if (!cell) {
		const settingPrefix = trimpStats.isC3 ? 'c2' : trimpStats.isDaily ? 'd' : '';
		const exitCell = typeof atSettings !== 'undefined' ? getPageSetting(settingPrefix + 'ExitSpireCell') : 100;
		cell = isDoingSpire() && exitCell > 0 && exitCell <= 100 ? exitCell : 100;
	}

	if (checkCell) return cell;

	const spireNum = Math.floor((game.global.world - 100) / 100);
	const enemy = name ? name : game.global.gridArray[cell - 1].name;
	let base = what === 'attack' ? calcEnemyBaseAttack('world', game.global.world, 100, enemy) : 2 * calcEnemyBaseHealth('world', game.global.world, 100, enemy);
	let mod = what === 'attack' ? 1.17 : 1.14;

	if (spireNum > 1) {
		let modRaiser = (spireNum - 1) / 100;
		modRaiser *= what === 'attack' ? 8 : 2;
		mod += modRaiser;
	}

	base *= Math.pow(mod, cell);

	if (cell !== 100 && challengeActive('Domination')) base /= what === 'attack' ? 25 : 75;

	return base;
}

function getTrimpHealth(realHealth, worldType = _getWorldType()) {
	if (realHealth) return game.global.soldierHealthMax;

	const heirloomToCheck = typeof atSettings !== 'undefined' ? heirloomShieldToEquip(worldType) : null;
	const heirloom = heirloomToCheck ? calcHeirloomBonus_AT('Shield', 'trimpHealth', 1, false, heirloomToCheck) : calcHeirloomBonus('Shield', 'trimpHealth', 1, false);
	let health = (50 + calcEquipment('health')) * game.resources.trimps.maxSoldiers;

	const healthMultipliers = {
		toughness: () => (getPerkLevel('Toughness') > 0 ? 1 + getPerkLevel('Toughness') * getPerkModifier('Toughness') : 1),
		resilience: () => (getPerkLevel('Resilience') > 0 ? Math.pow(getPerkModifier('Resilience') + 1, getPerkLevel('Resilience')) : 1),
		goldenBattle: () => 1 + game.goldenUpgrades.Battle.currentBonus,
		heirloom: () => heirloom,
		challengeSquared: () => 1 + game.global.totalSquaredReward / 100,
		mapHealth: () => (worldType !== 'world' && game.talents.mapHealth.purchased ? 2 : 1),
		voidPower: () => (worldType === 'void' && game.talents.voidPower.purchased ? 1 + game.talents.voidPower.getTotalVP() / 100 : 1),
		mayhem: () => game.challenges.Mayhem.getTrimpMult(),
		pandemonium: () => game.challenges.Pandemonium.getTrimpMult(),
		desolation: () => game.challenges.Desolation.getTrimpMult()
	};
	health = applyMultipliers(healthMultipliers, health);

	if (game.global.universe === 1) {
		const healthMultipliers = {
			formation: () => (game.global.formation !== 0 && game.global.formation !== 5 ? (game.global.formation === 1 ? 4 : 0.5) : 1),
			geneticist: () => (game.global.lowestGen >= 0 > 0 ? Math.pow(1.01, game.global.lastLowGen) : 1),
			amalgamator: () => game.jobs.Amalgamator.getHealthMult(),
			toughness_II: () => (getPerkLevel('Toughness_II') > 0 ? 1 + getPerkModifier('Toughness_II') * getPerkLevel('Toughness_II') : 1),
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

	health *= applyDailyMultipliers('pressure', 1);

	return health;
}

function calcOurHealth(stance = false, worldType = _getWorldType(), realHealth = false, fullGeneticist) {
	let health = getTrimpHealth(realHealth, worldType);

	if (game.global.universe === 1) {
		if (!stance && game.global.formation !== 0 && game.global.formation !== 5) health /= game.global.formation === 1 ? 4 : 0.5;

		const geneticist = game.jobs.Geneticist;
		if (fullGeneticist && geneticist.owned > 0) health *= Math.pow(1.01, geneticist.owned - game.global.lastLowGen);
	}

	if (game.global.universe === 2) {
		let shield = typeof atSettings !== 'undefined' ? getEnergyShieldMult_AT(worldType) : getEnergyShieldMult();
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

function _getAnticipationBonus(stacks = game.global.antiStacks) {
	const maxStacks = game.talents.patience.purchased ? 45 : 30;
	const perkMult = getPerkLevel('Anticipation') * getPerkModifier('Anticipation');
	const stacks45 = typeof autoTrimpSettings === 'undefined' ? maxStacks : getPageSetting('45stacks');

	return stacks45 ? 1 + maxStacks * perkMult : 1 + stacks * perkMult;
}

function _getTrimpIceMult(realDamage) {
	if (getEmpowerment() !== 'Ice') return 1;

	if (realDamage || (typeof atSettings !== 'undefined' && !getPageSetting('fullice'))) {
		return 1 + game.empowerments.Ice.getDamageModifier();
	} else {
		const afterTransfer = 1 + Math.ceil(game.empowerments.Ice.currentDebuffPower * getRetainModifier('Ice'));
		let mod = 1 - Math.pow(game.empowerments.Ice.getModifier(), afterTransfer);
		if (Fluffy.isRewardActive('naturesWrath')) mod *= 2;
		return 1 + mod;
	}
}

function _getQuagmireAttackMult(worldType = _getWorldType()) {
	const exhaustedStacks = game.challenges.Quagmire.exhaustedStacks;
	const mod = worldType !== 'world' ? 0.05 : 0.1;
	if (exhaustedStacks === 0) return 1;
	if (exhaustedStacks < 0) return Math.pow(1 + mod, Math.abs(exhaustedStacks));
	return Math.pow(1 - mod, exhaustedStacks);
}

function _getObliteratedStatMultiplier(challenge) {
	const oblitMult = challenge === 'Eradicated' ? game.challenges.Eradicated.scaleModifier : 1e12;
	const zoneModifier = Math.floor(game.global.world / game.challenges[challenge].zoneScaleFreq);
	return oblitMult * Math.pow(game.challenges[challenge].zoneScaling, zoneModifier);
}

function addPoison(realDamage, zone = game.global.world) {
	if (getEmpowerment(zone) !== 'Poison') return 0;
	if (realDamage) return game.empowerments.Poison.getDamage();
	//Dynamically determines how much we are benefiting from poison based on Current Amount * Transfer Rate
	if (typeof atSettings !== 'undefined' && getPageSetting('addpoison')) return game.empowerments.Poison.getDamage() * getRetainModifier('Poison');
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

	if (critChance < 0) return 1 + critChance - critChance / 5;
	if (critChance < 1) return 1 - critChance + critChance * critD;
	if (critChance < 2) return (critChance - 1) * getMegaCritDamageMult(2) * critD + (2 - critChance) * critD;
	if (critChance >= 2 && ['never', 'force'].includes(crit)) return lowTierMulti * critD;
	if (critChance >= 2) return ((1 - highTierChance) * lowTierMulti + highTierChance * highTierMulti) * critD;
	return (critChance - 2) * Math.pow(getMegaCritDamageMult(critChance), 2) * critD + (3 - critChance) * getMegaCritDamageMult(critChance) * critD;
}

function getTrimpAttack(realDamage) {
	if (realDamage) return game.global.soldierCurrentAttack;

	let attack = (6 + calcEquipment('attack')) * game.resources.trimps.maxSoldiers;
	if (mutations.Magma.active()) attack *= mutations.Magma.getTrimpDecay();
	if (getPerkLevel('Power') > 0) attack *= 1 + getPerkLevel('Power') * getPerkModifier('Power');
	if (getPerkLevel('Power_II') > 0) attack *= 1 + getPerkModifier('Power_II') * getPerkLevel('Power_II');
	if (game.global.universe === 1 && ![0, 5].includes(game.global.formation)) attack *= game.global.formation === 2 ? 4 : 0.5;

	return attack;
}

function calcOurDmg(minMaxAvg = 'avg', universeSetting, realDamage = false, worldType = _getWorldType(), critMode, mapLevel = _getZone(worldType) - game.global.world, useTitimp = false, specificHeirloom = false) {
	const runningAutoTrimps = typeof atSettings !== 'undefined';
	const heirloomToCheck = !runningAutoTrimps ? null : !specificHeirloom ? heirloomShieldToEquip(worldType) : specificHeirloom;
	const heirloom = heirloomToCheck ? calcHeirloomBonus_AT('Shield', 'trimpAttack', 1, false, heirloomToCheck) : calcHeirloomBonus('Shield', 'trimpAttack', 1, false);
	const specificStance = game.global.universe === 1 ? universeSetting : false;
	const fluctChallenge = challengeActive('Discipline') || challengeActive('Unlucky');

	let attack = getTrimpAttack(realDamage);
	let minFluct = fluctChallenge ? 0.005 : 0.8;
	let maxFluct = fluctChallenge ? 1.995 : 1.2;
	if (!fluctChallenge && getPerkLevel('Range') > 0) minFluct += 0.02 * getPerkLevel('Range');

	const damageModifiers = {
		achievementBonus: () => 1 + game.global.achievementBonus / 100,
		goldenBattle: () => 1 + game.goldenUpgrades.Battle.currentBonus,
		heirloom: () => heirloom,
		challengeSquared: () => 1 + game.global.totalSquaredReward / 100,
		titimp: () => (game.unlocks.imps.Titimp && worldType !== 'world' && useTitimp === 'force' ? 2 : worldType !== 'world' && worldType !== '' && useTitimp && game.global.titimpLeft > 0 ? 2 : 1),
		roboTrimp: () => 1 + 0.2 * game.global.roboTrimpLevel,
		mapBonus: () => (worldType !== 'world' ? 1 : game.talents.mapBattery.purchased && game.global.mapBonus === 10 ? 5 : 1 + game.global.mapBonus * 0.2),
		herbalist: () => (game.talents.herbalist.purchased ? game.talents.herbalist.getBonus() : 1),
		bionic2: () => (worldType === 'map' && game.talents.bionic2.purchased && mapLevel > 0 ? 1.5 : 1),
		voidPower: () => (worldType === 'void' && game.talents.voidPower.purchased ? 1 + game.talents.voidPower.getTotalVP() / 100 : 1),
		voidMastery: () => (worldType === 'void' && game.talents.voidMastery.purchased ? 5 : 1),
		fluffy: () => Fluffy.getDamageModifier(),
		mayhem: () => game.challenges.Mayhem.getTrimpMult(),
		pandemonium: () => game.challenges.Pandemonium.getTrimpMult(),
		desolation: () => game.challenges.Desolation.getTrimpMult(),
		sugarRush: () => (game.global.sugarRush ? sugarRush.getAttackStrength() : 1),
		strengthTowers: () => 1 + playerSpireTraps.Strength.getWorldBonus() / 100,
		sharpTrimps: () => (game.singleRunBonuses.sharpTrimps.owned ? 1.5 : 1)
	};
	attack = applyMultipliers(damageModifiers, attack);

	if (game.global.universe === 1) {
		const currentEnemy = getCurrentEnemy();
		const isEnemyCorrupted = realDamage && currentEnemy && currentEnemy.corrupted;
		const isMutationActive = !realDamage && (mutations.Healthy.active() || mutations.Corruption.active());
		const fightingCorrupted = worldType === 'world' && (isEnemyCorrupted || isMutationActive);

		if (specificStance && ![0, 5].includes(game.global.formation)) attack /= game.global.formation === 2 ? 4 : 0.5;

		const damageModifiers = {
			anticipation: () => (game.global.antiStacks > 0 ? _getAnticipationBonus() : 1),
			magmamancer: () => (game.talents.magmamancer.purchased ? game.jobs.Magmamancer.getBonusPercent() : 1),
			stillRowing: () => (game.talents.stillRowing2.purchased ? game.global.spireRows * 0.06 + 1 : 1),
			kerfluffle: () => (game.talents.kerfluffle.purchased ? game.talents.kerfluffle.mult() : 1),
			strengthInHealth: () => (game.talents.healthStrength.purchased && mutations.Healthy.active() ? 0.15 * mutations.Healthy.cellCount() + 1 : 1),
			voidSipon: () => (Fluffy.isRewardActive('voidSiphon') && game.stats.totalVoidMaps.value ? 1 + game.stats.totalVoidMaps.value * 0.05 : 1),
			amalgamator: () => game.jobs.Amalgamator.getDamageMult(),
			poisionEmpowerment: () => (getUberEmpowerment() === 'Poison' ? 3 : 1),
			frigid: () => game.challenges.Frigid.getTrimpMult(),
			scryhard: () => (fightingCorrupted && game.talents.scry.purchased && ((!specificStance && game.global.formation === 4) || ['S', 'W'].includes(specificStance)) ? 2 : 1),
			iceEmpowerment: () => _getTrimpIceMult(realDamage),
			stance: () => (specificStance && !['X', 'W'].includes(specificStance) ? (specificStance === 'D' ? 4 : 0.5) : 1)
		};
		attack = applyMultipliers(damageModifiers, attack);

		const challengeMultipliers = {
			Decay: () => 5 * Math.pow(0.995, game.challenges.Decay.stacks),
			Life: () => game.challenges.Life.getHealthMult(),
			Lead: () => (game.global.world % 2 === 1 ? 1.5 : 1)
		};
		attack = applyMultipliers(challengeMultipliers, attack, true);
	}

	if (game.global.universe === 2) {
		const damageModifiers = {
			smithy: () => game.buildings.Smithy.getMult(),
			hunger: () => game.portal.Hunger.getMult(),
			tenacity: () => game.portal.Tenacity.getMult(),
			spireStats: () => autoBattle.bonuses.Stats.getMult(),
			championism: () => game.portal.Championism.getMult(),
			frenzy: () => (getPerkLevel('Frenzy') > 0 && !challengeActive('Berserk') && (autoBattle.oneTimers.Mass_Hysteria.owned || (runningAutoTrimps && getPageSetting('frenzyCalc'))) ? 1 + 0.5 * getPerkLevel('Frenzy') : 1),
			observation: () => game.portal.Observation.getMult(),
			mutatorAttack: () => (u2Mutations.tree.Attack.purchased ? 1.5 : 1),
			geneAttack: () => (u2Mutations.tree.GeneAttack.purchased ? 10 : 1),
			brainsToBrawn: () => (u2Mutations.tree.Brains.purchased ? u2Mutations.tree.Brains.getBonus() : 1),
			novaStacks: () => (worldType === 'world' && game.global.novaMutStacks > 0 ? u2Mutations.types.Nova.trimpAttackMult() : 1),
			spireDaily: () => (Fluffy.isRewardActive('SADailies') && challengeActive('Daily') ? Fluffy.rewardConfig.SADailies.attackMod() : 1)
		};
		attack = applyMultipliers(damageModifiers, attack);

		const challengeMultipliers = {
			Unbalance: () => game.challenges.Unbalance.getAttackMult(),
			Duel: () => (game.challenges.Duel.trimpStacks > 50 ? 3 : 1),
			Melt: () => 5 * Math.pow(0.99, game.challenges.Melt.stacks),
			Quagmire: () => _getQuagmireAttackMult(worldType),
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

		const equalityLevel = getPerkLevel('Equality');
		if (equalityLevel > 0 && universeSetting > 0) {
			const equalityMult = runningAutoTrimps ? getPlayerEqualityMult_AT(heirloomToCheck) : game.portal.Equality.getMult(true);
			attack *= Math.pow(equalityMult, universeSetting);
		}
	}

	if (challengeActive('Daily')) {
		if (game.talents.daily.purchased) attack *= 1.5;

		const dailyChallenge = game.global.dailyChallenge;
		const worldLevel = game.global.world + (worldType !== 'map' ? mapLevel : 0);

		minFluct -= applyDailyMultipliers('minDamage', 0);
		maxFluct += applyDailyMultipliers('maxDamage', 0);
		if (worldLevel % 2 === 1) attack *= applyDailyMultipliers('oddTrimpNerf', 1);
		if (worldLevel % 2 === 0) attack *= applyDailyMultipliers('evenTrimpBuff', 1);
		if (worldType === 'map' && typeof game.global.dailyChallenge.rampage !== 'undefined') attack *= dailyModifiers.rampage.getMult(dailyChallenge.rampage.strength, dailyModifiers.rampage.getMaxStacks(dailyChallenge.rampage.strength));
	}

	critMode = runningAutoTrimps && getPageSetting('floorCritCalc') ? 'never' : critMode || 'never';
	const min = attack * getCritMulti(critMode, heirloomToCheck);
	const avg = critMode ? min : attack * getCritMulti('maybe', heirloomToCheck);
	const max = critMode ? min : attack * getCritMulti('force', heirloomToCheck);

	if (minMaxAvg === 'min') return Math.floor(min * minFluct);
	if (minMaxAvg === 'max') return Math.ceil(max * maxFluct);
	return avg * ((maxFluct + minFluct) / 2);
}

function getCritPower(enemy = getCurrentEnemy(), block = game.global.soldierCurrentBlock, health = game.global.soldierHealth) {
	const ignoreCrits = typeof atSettings !== 'undefined' ? getPageSetting('IgnoreCrits') : 0;
	if (ignoreCrits === 2) return 0;

	const outputs = {
		regular: false,
		challenge: false,
		explosive: false,
		mirrored: false
	};

	if (enemy.corrupted === 'corruptCrit') outputs.regular = true;
	else if (enemy.corrupted === 'healthyCrit') outputs.regular = true;
	else if (game.global.voidBuff === 'getCrit' && ignoreCrits !== 1) outputs.regular = true;

	const daily = challengeActive('Daily');
	const critDaily = daily && typeof game.global.dailyChallenge.crits !== 'undefined';

	if (critDaily) outputs.challenge = true;
	else if (challengeActive('Crushed') && health > block) outputs.challenge = true;

	const dailyExplosive = daily && typeof game.global.dailyChallenge.explosive !== 'undefined';
	if (dailyExplosive) outputs.explosive = true;

	const dailyMirrored = daily && typeof game.global.dailyChallenge.mirrored !== 'undefined';
	if (dailyMirrored) outputs.mirrored = true;

	return outputs;
}

function badGuyCritMult(enemy = getCurrentEnemy(), critPower = 2, block = game.global.soldierCurrentBlock, health = game.global.soldierHealth) {
	if (critPower <= 0) return 1;
	const ignoreCrits = typeof atSettings !== 'undefined' ? getPageSetting('IgnoreCrits') : 0;
	if (ignoreCrits === 2) return 1;

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

function calcEnemyBaseAttack(worldType = _getWorldType(), zone = _getZone(worldType), cell = _getCell(), name = _getEnemyName('Chimp'), query = false) {
	const mapGrid = worldType === 'world' ? 'gridArray' : 'mapGridArray';

	if (!query && zone >= 200 && cell !== 100 && worldType === 'world' && game.global.universe === 2 && game.global[mapGrid][cell].u2Mutation) {
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
	if (zone > 6 && worldType !== 'world') attack *= 1.1;

	if (game.global.universe === 2) {
		const part1 = Math.min(zone, 40);
		const part2 = Math.max(Math.min(zone - 40, 20), 0);
		const part3 = Math.max(zone - 60, 0);
		const part4 = Math.max(zone - 300, 0);
		attack *= Math.pow(1.5, part1) * Math.pow(1.4, part2) * Math.pow(1.32, part3) * Math.pow(1.15, part4);
	}

	if (name) attack *= game.badGuys[name].attack;

	return Math.floor(attack);
}

function calcEnemyAttackCore(worldType = _getWorldType(), zone = _getZone(worldType), cell = _getCell(), name = _getEnemyName('Snimp'), minOrMax = false, customAttack, equality) {
	let attack = calcEnemyBaseAttack(worldType, zone, cell, name);
	const fluctuation = game.global.universe === 2 ? 0.5 : 0.2;
	const gridInitialised = game.global.gridArray && game.global.gridArray.length > 0;

	if (customAttack) {
		attack = customAttack;
	} else if (game.global.universe === 1) {
		if (worldType === 'world') {
			if (game.global.spireActive) {
				attack = calcSpire('attack', cell, name);
			} else if (gridInitialised && mutations.Corruption.active() && game.global.gridArray[cell - 1].mutation) {
				attack = corruptionBaseStats(cell - 1, zone, 'attack');
			}
		} else {
			const corruptionScale = calcCorruptionScale(game.global.world, 3);
			if (mutations.Magma.active()) attack *= corruptionScale / (worldType === 'void' ? 1 : 2);
			else if (worldType === 'void' && mutations.Corruption.active()) attack *= corruptionScale / 2;
		}
	} else if (game.global.universe === 2) {
		if (gridInitialised && worldType === 'world' && game.global.world > 200 && game.global.gridArray[cell - 1].u2Mutation.length > 0) {
			attack = mutationBaseStats(cell - 1, zone, 'attack');
		}
	}

	if (game.global.universe === 1) {
		const challengeMultipliers = {
			Balance: () => (worldType === 'world' ? 1.17 : 2.35),
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
			Obliterated: () => _getObliteratedStatMultiplier('Obliterated'),
			Eradicated: () => _getObliteratedStatMultiplier('Eradicated')
		};
		attack = applyMultipliers(challengeMultipliers, attack, true);
	}

	if (game.global.universe === 2) {
		const challengeMultipliers = {
			Unbalance: () => 1.5,
			Duel: () => (game.challenges.Duel.trimpStacks < 50 ? 3 : 1),
			Wither: () => game.challenges.Wither.getEnemyAttackMult(),
			Archaeology: () => game.challenges.Archaeology.getStatMult('enemyAttack'),
			Mayhem: () => game.challenges.Mayhem.getEnemyMult() * (worldType === 'world' ? game.challenges.Mayhem.getBossMult() : 1),
			Storm: () => (!game.global.mapsActive ? game.challenges.Storm.getAttackMult() : 1),
			Exterminate: () => game.challenges.Exterminate.getSwarmMult(),
			Nurture: () => 2 * game.buildings.Laboratory.getEnemyMult(),
			Pandemonium: () => (worldType === 'world' ? game.challenges.Pandemonium.getBossMult() : game.challenges.Pandemonium.getPandMult()),
			Alchemy: () => alchObj.getEnemyStats(worldType !== 'world', worldType === 'void') + 1,
			Hypothermia: () => game.challenges.Hypothermia.getEnemyMult(),
			Glass: () => game.challenges.Glass.attackMult(),
			Desolation: () => game.challenges.Desolation.getEnemyMult()
		};
		attack = applyMultipliers(challengeMultipliers, attack, true);

		if (worldType === 'world' && game.global.novaMutStacks > 0) attack *= u2Mutations.types.Nova.enemyAttackMult();
		if (equality && equality > 0) attack *= Math.pow(game.portal.Equality.getModifier(), equality);
	}

	if (challengeActive('Daily')) {
		attack *= applyDailyMultipliers('badStrength', 1);
		if (worldType === 'world') attack *= applyDailyMultipliers('empower', 1);
		if (worldType !== 'world') attack *= applyDailyMultipliers('badMapStrength', 1);
		if (worldType === 'void') attack *= applyDailyMultipliers('empoweredVoid', 1);

		const dailyChallenge = game.global.dailyChallenge;
		if (typeof dailyChallenge.bloodthirst !== 'undefined' && typeof atSettings !== 'undefined') {
			const bloodThirstStrength = dailyChallenge.bloodthirst.strength;

			if (worldType === 'void' && getPageSetting('bloodthirstVoidMax')) {
				attack *= dailyModifiers.bloodthirst.getMult(bloodThirstStrength, dailyModifiers.bloodthirst.getMaxStacks(bloodThirstStrength));
			} else if (!getPageSetting('bloodthirstDestack')) {
				attack *= dailyModifiers.bloodthirst.getMult(bloodThirstStrength, dailyChallenge.bloodthirst.stacks);
			}
		}
	}

	return minOrMax ? (1 - fluctuation) * attack : (1 + fluctuation) * attack;
}

function calcEnemyAttack(worldType = _getWorldType(), zone = _getZone(worldType), cell = _getCell(), name = _getEnemyName('Snimp'), minOrMax, customAttack, equality) {
	let attack = calcEnemyAttackCore(worldType, zone, cell, name, minOrMax, customAttack, equality);

	if (challengeActive('Nom') && (worldType === 'world' || game.global.mapsActive)) {
		const enemy = worldType === 'world' ? getCurrentWorldCell() : getCurrentEnemy();
		if (enemy && typeof enemy.nomStacks !== 'undefined') attack *= Math.pow(1.25, enemy.nomStacks);
	}

	if (challengeActive('Domination')) {
		attack *= 2.5;
		if (worldType === 'world' && game.global.usingShriek) attack *= game.mapUnlocks.roboTrimp.getShriekValue();
	}

	if (typeof atSettings !== 'undefined' && getEmpowerment() === 'Ice' && getPageSetting('fullice')) {
		const afterTransfer = 1 + Math.ceil(game.empowerments.Ice.currentDebuffPower * getRetainModifier('Ice'));
		attack *= Math.pow(game.empowerments.Ice.getModifier(), afterTransfer);
	}

	return minOrMax ? Math.floor(attack) : Math.ceil(attack);
}

function calcSpecificEnemyAttack(critPower = 2, customBlock, customHealth, customAttack) {
	const enemy = getCurrentEnemy();
	let attack = calcEnemyAttackCore();
	attack *= badGuyCritMult(enemy, critPower, customBlock, customHealth);

	if (game.global.mapsActive && !customAttack) attack *= getCurrentMapObject().difficulty;
	if (challengeActive('Nom') && typeof enemy.nomStacks !== 'undefined') attack *= Math.pow(1.25, enemy.nomStacks);
	if (challengeActive('Lead')) attack *= 1 + 0.04 * game.challenges.Lead.stacks;

	if (game.global.usingShriek && !game.global.mapsActive && enemy.level === 100) attack *= game.mapUnlocks.roboTrimp.getShriekValue();
	if (getEmpowerment() === 'Ice') attack *= game.empowerments.Ice.getCombatModifier();

	return Math.ceil(attack);
}

function calcEnemyBaseHealth(worldType = _getWorldType(), zone = _getZone(worldType), cell = _getCell(), name = _getEnemyName('Turtlimp'), ignoreMutation) {
	if (!ignoreMutation && worldType === 'world' && game.global.universe === 2 && game.global.world > 200 && typeof game.global.gridArray[cell - 1].u2Mutation !== 'undefined') {
		if (game.global.gridArray[cell - 1].u2Mutation.length > 0 && ['CSX', 'CSP'].some((mutation) => game.global.gridArray[cell - 1].u2Mutation.includes(mutation))) {
			cell = game.global.gridArray[cell - 1].cs;
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
	if (zone > 5 && worldType !== 'world') health *= 1.1;

	if (game.global.universe === 2) {
		const part1 = Math.min(zone, 60);
		const part2 = Math.max(zone - 60, 0);
		const part3 = Math.max(zone - 300, 0);
		health *= Math.pow(1.4, part1) * Math.pow(1.32, part2) * Math.pow(1.15, part3);
	}

	if (name) health *= game.badGuys[name].health;

	return health;
}

function calcEnemyHealthCore(worldType = _getWorldType(), zone = _getZone(worldType), cell = _getCell(), name = _getEnemyName('Turtlimp'), customHealth) {
	let health = calcEnemyBaseHealth(worldType, zone, cell, name);
	const gridInitialised = game.global.gridArray && game.global.gridArray.length > 0;

	if (customHealth) {
		health = customHealth;
	} else if (game.global.universe === 1) {
		if (worldType === 'world') {
			if (game.global.spireActive) {
				health = calcSpire('health', cell, name);
			} else if (gridInitialised && mutations.Corruption.active() && game.global.gridArray[cell - 1].mutation) {
				health = corruptionBaseStats(cell - 1, zone, 'health');
			}
		} else {
			const corruptionScale = calcCorruptionScale(game.global.world, 10);
			if (mutations.Magma.active()) health *= corruptionScale / (worldType === 'void' ? 1 : 2);
			else if (worldType === 'void' && mutations.Corruption.active()) health *= corruptionScale / 2;
		}
	} else if (game.global.universe === 2) {
		if (gridInitialised && worldType === 'world' && game.global.world > 200 && game.global.gridArray[cell - 1].u2Mutation.length > 0) {
			health = mutationBaseStats(cell - 1, zone, 'health');
		}
	}

	if (game.global.universe === 1) {
		const challengeMultipliers = {
			Balance: () => 2,
			Meditate: () => 2,
			Life: () => 10,
			Coordinate: () => Array.from({ length: zone - 1 }, () => 1.25).reduce((a, b) => Math.ceil(a * b), 1),
			Toxicity: () => 2,
			Frigid: () => game.challenges.Frigid.getEnemyMult(),
			Experience: () => game.challenges.Experience.getEnemyMult(),
			Obliterated: () => _getObliteratedStatMultiplier('Obliterated'),
			Eradicated: () => _getObliteratedStatMultiplier('Eradicated')
		};
		health = applyMultipliers(challengeMultipliers, health, true);
	}

	if (game.global.universe === 2) {
		const challengeMultipliers = {
			Unbalance: () => (worldType !== 'world' ? 2 : 3),
			Quest: () => game.challenges.Quest.getHealthMult(),
			Revenge: () => (game.global.world % 2 === 0 ? 10 : 1),
			Mayhem: () => game.challenges.Mayhem.getEnemyMult() * (worldType === 'world' ? game.challenges.Mayhem.getBossMult() : 1),
			Storm: () => (worldType === 'world' ? game.challenges.Storm.getHealthMult() : 1),
			Exterminate: () => game.challenges.Exterminate.getSwarmMult(),
			Nurture: () => game.buildings.Laboratory.getEnemyMult() * (worldType === 'world' ? 2 : 10),
			Pandemonium: () => (worldType === 'world' ? game.challenges.Pandemonium.getBossMult() : game.challenges.Pandemonium.getPandMult()),
			Alchemy: () => alchObj.getEnemyStats(worldType !== 'world', worldType === 'void') + 1,
			Hypothermia: () => game.challenges.Hypothermia.getEnemyMult(),
			Glass: () => game.challenges.Glass.healthMult(),
			Desolation: () => game.challenges.Desolation.getEnemyMult()
		};
		health = applyMultipliers(challengeMultipliers, health, true);
	}

	if (challengeActive('Daily')) {
		health *= applyDailyMultipliers('badHealth', 1);
		if (worldType === 'world') health *= applyDailyMultipliers('empower', 1);
		if (worldType !== 'world') health *= applyDailyMultipliers('badMapHealth', 1);
		if (worldType === 'void') health *= applyDailyMultipliers('empoweredVoid', 1);
	}

	return health;
}

function calcEnemyHealth(worldType = _getWorldType(), zone = _getZone(worldType), cell = _getCell(), name = _getEnemyName('Turtlimp'), customHealth) {
	let health = calcEnemyHealthCore(worldType, zone, cell, name, customHealth);

	if (challengeActive('Domination')) health *= 7.5;
	if (challengeActive('Lead')) health *= zone % 2 === 0 ? 5 : 1 + 0.04 * game.challenges.Lead.stacks;

	return health;
}

function calcSpecificEnemyHealth(worldType = _getWorldType(), zone = _getZone(worldType), cell = _getCell(), forcedName) {
	const enemy = worldType === 'world' ? game.global.gridArray[cell - 1] : game.global.mapGridArray[cell - 1];
	if (!enemy) return -1;

	const corrupt = enemy.corrupted && enemy.corrupted !== 'none';
	const healthy = corrupt && enemy.corrupted.startsWith('healthy');
	const name = corrupt ? 'Chimp' : forcedName ? forcedName : enemy.name;
	let health = calcEnemyHealthCore(worldType, zone, cell, name);

	if (challengeActive('Lead')) health *= 1 + 0.04 * game.challenges.Lead.stacks;
	if (challengeActive('Domination')) {
		const lastCell = worldType === 'world' ? 100 : game.global.mapGridArray.length;
		if (cell < lastCell) health /= 10;
		else health *= 7.5;
	}

	if (worldType !== 'world') {
		health *= getCurrentMapObject().difficulty;
	} else if (worldType === 'world' && !healthy && (corrupt || (mutations.Corruption.active() && cell === 100))) {
		health *= calcCorruptionScale(zone, 10);
		if (enemy.corrupted === 'corruptTough') health *= 5;
	} else if (worldType === 'world' && healthy) {
		health *= calcCorruptionScale(zone, 14);
		if (enemy.corrupted === 'healthyTough') health *= 7.5;
	}

	return health;
}

function calcHDRatio(targetZone = game.global.world, worldType = 'world', maxTenacity = false, difficulty = 1, hdCheck = true, checkOutputs) {
	const heirloomToUse = heirloomShieldToEquip(worldType, false, hdCheck);
	let enemyHealth = 0;
	let universeSetting;

	const leadCheck = worldType !== 'map' && targetZone % 2 === 1 && challengeActive('Lead');
	if (leadCheck) targetZone++;

	if (worldType === 'world') {
		let customHealth;
		let enemyName = 'Turtlimp';
		//TODO Test
		// if (targetZone === 5 || targetZone === 10 || (targetZone >= 15 && targetZone <= 58)) enemyName = 'Blimp';
		// if (targetZone >= 59) enemyName = 'Improbability';
		if (game.global.universe === 1) {
			// if (targetZone > 229) enemyName = 'Omnipotrimp';
			if (game.global.spireActive) customHealth = calcSpire('health');
			else if (isCorruptionActive(targetZone)) customHealth = calcCorruptedStats(targetZone, 'health');
		} else if (game.global.universe === 2) {
			if (targetZone > 200) customHealth = calcMutationStats(targetZone, 'health');
		}
		enemyHealth = calcEnemyHealth(worldType, targetZone, 99, enemyName, customHealth) * difficulty;
		universeSetting = game.global.universe === 2 ? equalityQuery(enemyName, targetZone, 99, worldType, difficulty, 'gamma', false, 1, true) : 'X';
	} else if (worldType === 'map') {
		enemyHealth = calcEnemyHealth(worldType, targetZone, 20, 'Turtlimp') * difficulty;
		universeSetting = game.global.universe === 2 ? equalityQuery('Snimp', targetZone, 20, worldType, difficulty, 'gamma', true) : 'X';
	} else if (worldType === 'void') {
		enemyHealth = calcEnemyHealth(worldType, targetZone, 99, 'Shadimp') * difficulty;
		universeSetting = game.global.universe === 2 ? equalityQuery('Voidsnimp', targetZone, 99, worldType, difficulty, 'gamma', false, 1, true) : 'X';
	}

	let ourBaseDamage = calcOurDmg(challengeActive('Unlucky') ? 'max' : 'avg', universeSetting, false, worldType, 'maybe', targetZone - game.global.world, null, heirloomToUse);

	if (leadCheck) ourBaseDamage /= 1.5;
	ourBaseDamage += addPoison(false, targetZone);

	if (maxTenacity) {
		if (worldType === 'world' && game.global.mapBonus !== 10) {
			ourBaseDamage /= 1 + 0.2 * game.global.mapBonus;
			ourBaseDamage *= game.talents.mapBattery.purchased ? 5 : 3;
		}
		if (game.global.universe === 2 && getPerkLevel('Tenacity') > 0 && !(game.portal.Tenacity.getMult() === Math.pow(1.4000000000000001, getPerkLevel('Tenacity') + getPerkLevel('Masterfulness')))) {
			ourBaseDamage /= game.portal.Tenacity.getMult();
			ourBaseDamage *= Math.pow(1.4000000000000001, getPerkLevel('Tenacity') + getPerkLevel('Masterfulness'));
		}
	}

	const maxGammaStacks = gammaMaxStacks(false, true, worldType) - 1;

	if (challengeActive('Daily') && typeof game.global.dailyChallenge.weakness !== 'undefined' && maxGammaStacks !== Infinity) ourBaseDamage *= 1 - (Math.max(1, maxGammaStacks) * game.global.dailyChallenge.weakness.strength) / 100;

	if ((worldType !== 'map' && game.global.universe === 2 && universeSetting < getPerkLevel('Equality') - 14) || game.global.universe === 1) ourBaseDamage *= MODULES.heirlooms.gammaBurstPct;

	if (checkOutputs) _calcHDRatioDebug(ourBaseDamage, enemyHealth, universeSetting, worldType);

	return enemyHealth / ourBaseDamage;
}

function calcHitsSurvived(targetZone = game.global.world, worldType = 'world', difficulty = 1, checkOutputs) {
	const formationMod = game.upgrades.Dominance.done ? 2 : 1;
	const ignoreCrits = getPageSetting('IgnoreCrits');

	if (worldType !== 'map' && targetZone % 2 === 1 && challengeActive('Lead')) targetZone++;

	const customAttack = _calcHitsSurvivedAttack(worldType, targetZone);
	//Test
	const enemyName = worldType === 'void' ? 'Voidsnimp' : 'Snimp';

	let hitsToSurvive = targetHitsSurvived(false, worldType);
	if (hitsToSurvive === 0) hitsToSurvive = 1;

	const health = calcOurHealth(false, worldType, false, true) / formationMod;
	const block = calcOurBlock(false) / formationMod;
	const equality = equalityQuery(enemyName, targetZone, 99, worldType, difficulty, 'gamma', null, hitsToSurvive);
	let damageMult = 1;

	if (game.global.universe === 1 && ((ignoreCrits === 1 && worldType !== 'void') || ignoreCrits === 0)) {
		const dailyCrit = challengeActive('Daily') && typeof game.global.dailyChallenge.crits !== 'undefined';
		const crushed = challengeActive('Crushed');
		if (dailyCrit) damageMult = dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
		else if (crushed && health > block) damageMult = 3;
	}

	const worldDamage = calcEnemyAttack(worldType, targetZone, 99, enemyName, undefined, customAttack, equality) * difficulty;
	const pierce = (game.global.universe === 1 && game.global.brokenPlanet && worldType === 'world' ? getPierceAmt() : 0) * (game.global.formation === 3 ? 2 : 1);
	const finalDmg = Math.max(damageMult * worldDamage - block, worldDamage * pierce, 0);

	if (checkOutputs) _calcHitsSurvivedDebug(targetZone, damageMult, worldDamage, equality, block, pierce, health, hitsToSurvive, finalDmg);

	return health / finalDmg;
}

function _calcHitsSurvivedAttack(worldType, targetZone) {
	if (worldType !== 'world') return undefined;

	const { universe, spireActive, usingShriek } = game.global;
	let customAttack;

	if (universe === 1) {
		if (spireActive) {
			customAttack = calcSpire('attack');
			if (exitSpireCell(true) === 100 && usingShriek) customAttack *= game.mapUnlocks.roboTrimp.getShriekValue();
		} else if (isCorruptionActive(targetZone)) customAttack = calcCorruptedStats(targetZone, 'attack');
	} else if (universe === 2 && targetZone > 200) {
		customAttack = calcMutationStats(targetZone, 'attack');
	}

	return customAttack;
}

function corruptionBaseStats(cell = game.global.lastClearedCell + 1, targetZone = game.global.world, type = 'attack') {
	cell = game.global.gridArray[cell];
	const typeFunction = type === 'attack' ? calcEnemyBaseAttack : calcEnemyBaseHealth;
	let baseStats = typeFunction('world', targetZone, cell.level, 'Chimp', true);

	if (type === 'attack') {
		if (cell.corrupted === 'healthyStrong') baseStats *= 2;
		else if (cell.corrupted === 'corruptStrong') baseStats *= 2.5;
		baseStats *= cell.mutation === 'Healthy' ? calcCorruptionScale(targetZone, 5) : calcCorruptionScale(targetZone, 3);
	} else if (type === 'health') {
		if (cell.corrupted === 'corruptTough') baseStats *= 5;
		else if (cell.corrupted === 'healthyTough') baseStats *= 7.5;
		baseStats *= cell.mutation === 'Healthy' ? calcCorruptionScale(targetZone, 14) : calcCorruptionScale(targetZone, 10);
	}

	return baseStats;
}

function calcCorruptedStats(targetZone = game.global.world, type = 'attack') {
	if (game.global.universe !== 1 || !isCorruptionActive(targetZone)) return;

	const gridArray = game.global.gridArray;
	let stat;

	gridArray.forEach((grid, i) => {
		if (grid.mutation) {
			const enemyStat = corruptionBaseStats(i, targetZone, type, i);
			stat = Math.max(enemyStat, stat || 0);
		}
	});

	return stat;
}

function mutationBaseStats(cell = game.global.lastClearedCell + 1, targetZone = game.global.world, type = 'attack') {
	cell = game.global.gridArray[cell];
	const typeFunction = type === 'attack' ? calcEnemyBaseAttack : calcEnemyBaseHealth;
	let baseStats = typeFunction('world', targetZone, cell.cs || cell.level, cell.name, true);
	const addStats = cell.cc ? u2Mutations.types.Compression[type](cell, baseStats) : 0;
	const statMult = type === 'attack' ? 1.01 : 1.02;

	if (cell.u2Mutation.includes('NVA')) baseStats *= 0.01;
	else if (cell.u2Mutation.includes('NVX')) baseStats *= type === 'attack' ? 10 : 0.1;

	baseStats += addStats;
	if (type === 'health') baseStats *= 2;
	baseStats *= Math.pow(statMult, targetZone - 201);
	return baseStats;
}

function calcMutationStats(targetZone = game.global.world, type = 'attack') {
	if (game.global.universe !== 2 || targetZone < 201) return;

	const gridArray = game.global.gridArray;
	const ragingMult = u2Mutations.tree.Unrage.purchased ? 4 : 5;
	const heirloomToCheck = heirloomShieldToEquip('world');
	const compressedSwap = getPageSetting('heirloomCompressedSwap');
	const compressedSwapValue = getPageSetting('heirloomSwapHDCompressed');

	let stat;
	let worstCell = 0;

	for (let i = 0; i < gridArray.length; i++) {
		const mutation = gridArray[i].u2Mutation;

		let hasRage = type === 'attack' && mutation.includes('RGE');
		if (type === 'attack' && !hasRage && mutation.includes('CMP')) {
			hasRage = gridArray.slice(i + 1, i + u2Mutations.types.Compression.cellCount()).some((cell) => cell.u2Mutation.includes('RGE'));
		}

		if (mutation && mutation.length) {
			let enemyStats = mutationBaseStats(i, targetZone, type);
			if (mutation.includes('CMP') && compressedSwap && compressedSwapValue > 0) {
				/* TO DO - Fix this as it's always going to multiply by 0.7 if it's a compressed cell */
				if (heirloomToCheck !== 'heirloomInitial' || hdStats.hdRatioHeirloom >= compressedSwapValue || MODULES.heirlooms.compressedCalc) enemyStats *= 0.7;
			}
			if (hasRage) enemyStats *= ragingMult;
			if (enemyStats > (stat || 0)) worstCell = i;
			stat = Math.max(enemyStats, stat || 0);
		}
	}

	if (gridArray[worstCell].u2Mutation.includes('CMP')) {
		MODULES.heirlooms.compressedCalc = true;
	}
	return stat;
}

function enemyDamageModifiers() {
	let attack = 1;

	if (game.global.universe === 1) {
		const enemy = getCurrentEnemy();
		const challengeMultipliers = {
			Scientist: () => (getScientistLevel() === 5 ? 10 : 1),
			Meditate: () => 1.5,
			Coordinate: () => getBadCoordLevel(),
			Nom: () => (enemy && typeof enemy.nomStacks !== 'undefined' ? Math.pow(1.25, enemy.nomStacks) : 1),
			Watch: () => 1.25,
			Lead: () => 1 + game.challenges.Lead.stacks * 0.04,
			Corrupted: () => 3
		};
		attack = applyMultipliers(challengeMultipliers, attack, true);

		if (game.global.usingShriek) attack *= game.mapUnlocks.roboTrimp.getShriekValue();
		if (getEmpowerment() === 'Ice') attack *= game.empowerments.Ice.getCombatModifier();
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
		if (game.global.world > 200 && !game.global.mapsActive) {
			if (cell.u2Mutation && cell.u2Mutation.length > 0 && (cell.u2Mutation.includes('RGE') || (cell.cc && cell.cc[3] > 0))) {
				attack *= u2Mutations.types.Rage.enemyAttackMult();
			}
			attack *= game.global.novaMutStacks > 0 ? u2Mutations.types.Nova.enemyAttackMult() : 1;
		}
	}

	if (challengeActive('Daily')) {
		attack *= applyDailyMultipliers('bloodthirst', 1);
		attack *= applyDailyMultipliers('badStrength', 1);
		if (game.global.mapsActive) attack *= applyDailyMultipliers('badMapStrength', 1);
		if (!game.global.mapsActive) attack *= applyDailyMultipliers('empower', 1);
	}

	if (!game.global.mapsActive && game.global.world >= getObsidianStart()) attack = Infinity;

	return attack;
}

function gammaMaxStacks(specialChall, actualCheck = true, worldType = 'world') {
	if (typeof atSettings !== 'undefined') {
		if (heirloomShieldToEquip(worldType) && getHeirloomBonus_AT('Shield', 'gammaBurst', heirloomShieldToEquip(worldType)) <= 1) return Infinity;
		if (actualCheck && MODULES.heirlooms.gammaBurstPct === 1) return 1;
		if (specialChall && game.global.mapsActive) return Infinity;
	}

	let gammaMaxStacks = 5;
	if (autoBattle.oneTimers.Burstier.owned) gammaMaxStacks--;
	if (Fluffy.isRewardActive('scruffBurst')) gammaMaxStacks--;
	return gammaMaxStacks;
}

function equalityQuery(enemyName = 'Snimp', zone = game.global.world, currentCell, worldType = 'world', difficulty = 1, farmType = 'gamma', forceOK, hits, hdCheck) {
	if (Object.keys(game.global.gridArray).length === 0 || getPerkLevel('Equality') === 0) return 0;
	if (!currentCell) currentCell = worldType === 'world' || worldType === 'void' ? 98 : 20;

	const bionicTalent = zone - game.global.world;
	const checkMutations = worldType === 'world' && zone > 200;
	const titimp = worldType !== 'world' && farmType === 'oneShot' ? 'force' : false;
	const dailyEmpowerToggle = typeof atSettings !== 'undefined' && getPageSetting('empowerAutoEquality');
	const isDaily = challengeActive('Daily');
	const dailyEmpower = isDaily && typeof game.global.dailyChallenge.empower !== 'undefined';
	const dailyCrit = isDaily && typeof game.global.dailyChallenge.crits !== 'undefined';
	const dailyExplosive = isDaily && typeof game.global.dailyChallenge.explosive !== 'undefined';
	const maxEquality = getPerkLevel('Equality');
	const overkillCount = maxOneShotPower(true);
	const critType = challengeActive('Wither') || challengeActive('Glass') || challengeActive('Duel') ? 'never' : 'maybe';
	const runningUnlucky = challengeActive('Unlucky');
	const shieldBreak = getCurrentQuest() === 8 || challengeActive('Bublé');

	if (enemyName === 'Improbability' && zone <= 58) enemyName = 'Blimp';
	let enemyHealth = calcEnemyHealth(worldType, zone, currentCell, enemyName) * difficulty;
	let enemyDmg = calcEnemyAttack(worldType, zone, currentCell, enemyName, false, false, 0) * difficulty;

	if ((worldType === 'map' && dailyCrit) || dailyExplosive) {
		if (dailyExplosive) enemyDmg *= 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength);
		if (dailyEmpowerToggle && dailyCrit) enemyDmg *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
	} else if (hits || (worldType === 'world' && dailyEmpower && (dailyCrit || dailyExplosive))) {
		if (dailyCrit) enemyDmg *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
	}

	if (challengeActive('Duel')) {
		enemyDmg *= 10;
		if (game.challenges.Duel.trimpStacks >= 50) enemyDmg *= 3;
	}

	let dmgType = runningUnlucky ? 'max' : 'avg';
	let ourHealth = calcOurHealth(shieldBreak, worldType);
	let ourDmg = calcOurDmg(dmgType, 0, false, worldType, critType, bionicTalent, titimp);
	const unluckyDmg = runningUnlucky ? Number(calcOurDmg('min', 0, false, worldType, 'never', bionicTalent, titimp)) : 2;
	const gammaToTrigger = gammaMaxStacks(false, false, worldType);

	if (checkMutations) {
		enemyDmg = calcEnemyAttack(worldType, zone, currentCell, enemyName, false, calcMutationStats(zone, 'attack'), 0);
		enemyHealth = calcEnemyHealth(worldType, zone, currentCell, enemyName, calcMutationStats(zone, 'health'));
	}
	if (!hits) hits = 1;
	enemyDmg *= hits;

	if (forceOK) {
		if (!runningUnlucky && zone - game.global.world > 0) dmgType = 'min';
		enemyHealth *= 1 * overkillCount;
	}
	if (challengeActive('Duel')) ourDmg *= MODULES.heirlooms.gammaBurstPct;

	if (isDaily && typeof game.global.dailyChallenge.weakness !== 'undefined') ourDmg *= 1 - ((worldType === 'map' ? 9 : gammaToTrigger) * game.global.dailyChallenge.weakness.strength) / 100;

	let ourDmgEquality = 0;
	let enemyDmgEquality = 0;
	let unluckyDmgEquality = 0;
	const ourEqualityModifier = typeof atSettings !== 'undefined' ? getPlayerEqualityMult_AT(heirloomShieldToEquip(worldType)) : game.portal.Equality.getMult(true);
	const enemyEqualityModifier = game.portal.Equality.getModifier();

	//Accounting for enemies hitting multiple times per gamma burst
	if (hdCheck && worldType !== 'map' && gammaToTrigger !== Infinity) {
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

function remainingHealth(shieldBreak = false, angelic = false, worldType = 'world') {
	const heirloomToCheck = heirloomShieldToEquip(worldType);
	const correctHeirloom = heirloomToCheck !== undefined ? getPageSetting(heirloomToCheck) === game.global.ShieldEquipped.name : true;
	const currentShield = calcHeirloomBonus_AT('Shield', 'trimpHealth', 1, true) / 100;
	const newShield = calcHeirloomBonus_AT('Shield', 'trimpHealth', 1, true, heirloomToCheck) / 100;

	let soldierHealthMax = game.global.soldierHealthMax;
	let soldierHealth = game.global.soldierHealth;
	let shieldHealth = 0;

	if (!correctHeirloom) {
		soldierHealth = (soldierHealth / (1 + currentShield)) * (1 + newShield);
		soldierHealthMax = (soldierHealthMax / (1 + currentShield)) * (1 + newShield);
	}

	if (game.global.universe === 2) {
		const maxLayers = Fluffy.isRewardActive('shieldlayer');
		const layers = maxLayers - game.global.shieldLayersUsed;
		let shieldMax = game.global.soldierEnergyShieldMax;
		let shieldCurr = game.global.soldierEnergyShield;

		if (!correctHeirloom) {
			const energyShieldMult = getEnergyShieldMult_AT(worldType, true);
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

	const enemyName = name === 'Imploding Star' ? 'Neutrimp' : location === 'Void' ? 'Voidsnimp' : 'Snimp';
	const cell = name === 'Imploding Star' ? 100 : 99;
	const worldType = location === 'Void' ? 'void' : 'map';
	const mapLevel = name === 'The Black Bog' ? game.global.world : level;
	const equalityAmt = game.global.universe === 2 ? equalityQuery(enemyName, mapLevel, size, 'map', difficulty, 'gamma') : 0;
	const enemyDmg = calcEnemyAttackCore(worldType, mapLevel, size, enemyName, false, false, equalityAmt) * difficulty;

	return totalHealth > enemyDmg;
}
