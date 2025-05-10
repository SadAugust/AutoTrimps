class TrimpStats {
	constructor() {
		const { global, stats, talents, unlocks } = game;
		const { highestRadLevel, highestLevel } = stats;
		const { world, universe, runningChallengeSquared } = global;
		const { purchased: liquification3Purchased } = talents.liquification3;
		const { purchased: hyperspeed2Purchased } = talents.hyperspeed2;
		const { imps } = unlocks;
		const runningRevenge = challengeActive('Revenge') && game.challenges.Revenge.stacks === 19;

		this.isDaily = challengeActive('Daily');
		this.isC3 = runningChallengeSquared || ['Frigid', 'Mayhem', 'Pandemonium', 'Desolation'].some((challenge) => challengeActive(challenge)) || (challengeActive('Experience') && getPageSetting('experience') && getPageSetting('experienceC2'));
		this.isOneOff = !runningChallengeSquared && autoPortalChallenges('oneOff', universe).slice(1).includes(game.global.challengeActive);
		this.isFiller = !(this.isDaily || this.isC3 || this.isOneOff);
		this.currChallenge = game.global.challengeActive;
		this.shieldBreak = challengeActive('Bublé') || getCurrentQuest() === 8 || runningRevenge;

		this.hze = universe === 2 ? highestRadLevel.valueTotal() : highestLevel.valueTotal();
		this.hypPct = liquification3Purchased ? 75 : hyperspeed2Purchased ? 50 : 0;
		this.hyperspeed2 = global.world <= Math.floor(this.hze * (this.hypPct / 100));
		this.fluffyRewards = updateFluffyRewards();
		this.resourcesPS = getPsValues();

		this.autoMaps = getPageSetting('autoMaps') > 0;

		this.mapSize = talents.mapLoot2.purchased ? 20 : 25;
		this.mapDifficulty = 0.75;
		this.perfectMaps = this.hze >= (universe === 2 ? 30 : 110);
		this.plusLevels = this.hze >= (universe === 2 ? 50 : 210);
		this.mapSpecial = getAvailableSpecials('lmc');
		this.mapBiome = getBiome();
		this.voidMapData = _getVoidPercent(world, universe);
		this.mountainPriority = !(imps.Chronoimp || imps.Jestimp || ['lmc', 'smc'].includes(getAvailableSpecials('lmc', true)));
	}
}

class HDStats {
	constructor() {
		this.autoLevelInitial = hdStats.autoLevelInitial;
		this.autoLevelMaxFragments = hdStats.autoLevelMaxFragments;
		this.autoLevelZone = hdStats.autoLevelZone;
		this.autoLevelZoneDeso = hdStats.autoLevelZoneDeso;
		this.autoLevelDesolation = hdStats.autoLevelDesolation;
		this.autoLevelData = hdStats.autoLevelData;
		this.autoLevelLoot = hdStats.autoLevelLoot;
		this.autoLevelSpeed = hdStats.autoLevelSpeed;

		const world = game.global.world;
		const checkAutoLevel = this.autoLevelInitial === undefined || (usingRealTimeOffline ? atConfig.intervals.thirtySecond : atConfig.intervals.fiveSecond);
		const mapDifficulty = game.global.mapsActive && MODULES.maps.lastMapWeWereIn.location === 'Bionic' ? 2.6 : 0.75;
		const voidMapSettings = getPageSetting('voidMapSettings')[0];
		const voidMaxBonuses = { mapBonus: voidMapSettings.maxMapBonus, maxTenacity: voidMapSettings.maxTenacity };

		this.hdRatio = calcHDRatio(world, 'world', false, 1);
		this.hdRatioMap = calcHDRatio(world, 'map', false, mapDifficulty);
		this.hdRatioVoid = calcHDRatio(world, 'void', false, trimpStats.voidMapData.difficulty);

		this.vhdRatio = voidMaxBonuses.mapBonus || voidMaxBonuses.maxTenacity ? calcHDRatio(world, 'world', voidMaxBonuses, 1) : this.hdRatio;
		this.vhdRatioVoid = voidMaxBonuses.mapBonus || voidMaxBonuses.maxTenacity ? calcHDRatio(world, 'void', voidMaxBonuses, trimpStats.voidMapData.difficulty) : this.hdRatioVoid;

		this.hdRatioHeirloom = calcHDRatio(world, 'world', false, 1, false);

		this.hitsSurvived = calcHitsSurvived(world, 'world', 1);
		this.hitsSurvivedMap = calcHitsSurvived(world, 'map', mapDifficulty);
		this.hitsSurvivedVoid = calcHitsSurvived(world, 'void', trimpStats.voidMapData.difficulty);

		/* U1 specific checks */
		const worldType = _getTargetWorldType();
		const hitsBefore = worldType === 'void' ? this.hitsSurvivedVoid : this.hitsSurvived;
		this.shieldGymEff = shieldGymEfficiency(hitsBefore);
		this.biomeEff = biomeEfficiency(undefined, hitsBefore, undefined, this.shieldGymEff);
		if (checkAutoLevel) {
			this.autoLevelInitial = stats();
			this.autoLevelMaxFragments = getPageSetting('autoMapsReroll') ? stats(undefined, false) : undefined;
			this.autoLevelZone = world;
			this.autoLevelData = get_best(this.autoLevelInitial, true);

			this.autoLevelZoneDeso = world;
			this.autoLevelDesolation = challengeActive('Desolation') ? stats(lootDestack) : this.autoLevelInitial;

			const findResult = Object.entries(this.autoLevelInitial[0]).find(([key, data]) => data.mapLevel === 0);
			const worldMap = findResult ? findResult[1] : undefined;
			const { loot, speed } = this.autoLevelData;

			if (worldMap && worldMap[loot.stance] && worldMap[speed.stance]) {
				loot.mapLevel = loot.mapLevel === -1 && loot.value === worldMap[loot.stance].value ? 0 : loot.mapLevel;
				speed.mapLevel = speed.mapLevel === -1 && speed.killSpeed === worldMap[speed.stance].killSpeed ? 0 : speed.mapLevel;
			}

			this.autoLevelLoot = loot.mapLevel;
			this.autoLevelSpeed = speed.mapLevel;
		}
	}
}

class ExtraItem {
	constructor(name, extraLevels, shouldPrestige) {
		this.name = name;
		this.extraLevels = extraLevels;
		this.shouldPrestige = shouldPrestige;
	}
}

function _getVoidMapsObjects() {
	return game.global.mapsOwnedArray.filter((map) => map.location === 'Void');
}

function _getVoidPercent(world = game.global.world, universe = game.global.universe) {
	const ownedVoidMaps = _getVoidMapsObjects();
	const voidDetails = {
		difficulty: 1,
		critMap: true
	};

	if (ownedVoidMaps.length) {
		voidDetails.difficulty = ownedVoidMaps.reduce((worstDiff, currentMap) => Math.max(worstDiff, currentMap.difficulty), 0);
		voidDetails.critMap = ownedVoidMaps.some((map) => map.voidBuff === 'getCrit');
	} else {
		let voidPercent = 4.5;
		if (world <= 59) {
			voidPercent -= 2;
			if (universe === 1) voidPercent /= 2;
		} else if (universe === 1 && world <= 199) {
			voidPercent -= 1;
		}

		if (challengeActive('Mapocalypse')) voidPercent += 3;

		voidDetails.difficulty = voidPercent;
	}

	return voidDetails;
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

function _getTargetWorldType() {
	return mapSettings.voidTrigger || game.global.voidBuff ? 'void' : 'world';
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

function calcEquipment(equipType = 'attack', extraItem = new ExtraItem()) {
	let bonus = 0;
	let equipmentList;

	if (equipType === 'attack') equipmentList = ['Dagger', 'Mace', 'Polearm', 'Battleaxe', 'Greatsword', 'Arbalest'];
	else equipmentList = ['Shield', 'Boots', 'Helmet', 'Pants', 'Shoulderguards', 'Breastplate', 'Gambeson'];

	for (let name of equipmentList) {
		const equip = game.equipment[name];
		if (equip.locked || equip.blockNow) continue;

		if (name === extraItem.name) {
			const level = extraItem.extraLevels + (extraItem.shouldPrestige ? 1 : equip.level);
			const prestigeLevel = equip.prestige + (extraItem.shouldPrestige ? 0 : -1);
			const newStatsPerLevel = prestigeLevel ? Math.round(equip[equipType] * Math.pow(1.19, prestigeLevel * game.global.prestige[equipType] + 1)) : equip[equipType];
			bonus += level * newStatsPerLevel;
			continue;
		}

		bonus += equip[equipType + 'Calculated'] * equip.level;
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
		const settingAffix = trimpStats.isC3 ? 'C2' : trimpStats.isDaily ? 'Daily' : '';
		const exitCell = typeof atConfig !== 'undefined' ? getPageSetting('spireExitCell' + settingAffix) : 100;
		cell = isDoingSpire() && exitCell >= 0 && exitCell <= 100 ? exitCell : 100;
	}

	if (checkCell) return cell;

	const spireStart = game.global.universe === 2 ? 300 : 200;
	const spireNum = Math.floor((game.global.world - (spireStart - 100)) / 100);
	const gridCell = game.global.gridArray[Math.max(cell - 1, 0)];
	const enemy = name ? name : gridCell.name;
	let base = what === 'attack' ? calcEnemyBaseAttack('world', game.global.world, 100, 'Chimp') : 2 * calcEnemyBaseHealth('world', game.global.world, 100, 'Chimp');
	if (gridCell && gridCell.u2Mutation && gridCell.u2Mutation.length) base = what === 'attack' ? u2Mutations.getAttack(gridCell) : u2Mutations.getHealth(gridCell);
	let mod = what === 'attack' ? 1.17 : 1.14;

	if (spireNum > 1) {
		let modRaiser = (spireNum - 1) / 100;
		modRaiser *= what === 'attack' ? 8 : 2;
		mod += modRaiser;
	}

	base *= game.global.universe === 2 ? Math.pow(200, game.global.spireLevel + 1) : Math.pow(mod, cell);
	base *= game.global.universe === 2 ? 1 : game.badGuys[enemy][what];

	if (cell !== 100 && challengeActive('Domination')) base /= what === 'attack' ? 25 : 75;

	return base;
}

function getTrimpHealth(realHealth, worldType = _getWorldType(), extraItem = new ExtraItem()) {
	if (realHealth) return game.global.soldierHealthMax;

	const heirloomToCheck = typeof atConfig !== 'undefined' ? heirloomShieldToEquip(worldType) : null;
	const heirloom = heirloomToCheck ? calcHeirloomBonus_AT('Shield', 'trimpHealth', 1, false, heirloomToCheck) : calcHeirloomBonus('Shield', 'trimpHealth', 1, false);
	let health = (50 + calcEquipment('health', extraItem)) * game.resources.trimps.maxSoldiers;
	if (game.global.universe === 1) health *= mutations.Magma.getTrimpDecay();

	const healthMultipliers = {
		toughness: () => (getPerkLevel('Toughness') > 0 ? 1 + getPerkLevel('Toughness') * getPerkModifier('Toughness') : 1),
		resilience: () => (getPerkLevel('Resilience') > 0 ? Math.pow(getPerkModifier('Resilience') + 1, getPerkLevel('Resilience')) : 1),
		goldenBattle: () => 1 + game.goldenUpgrades.Battle.currentBonus,
		heirloom: () => heirloom,
		challengeSquared: () => 1 + game.global.totalSquaredReward / 100,
		mapHealth: () => (worldType !== 'world' && masteryPurchased('mapHealth') ? 2 : 1),
		voidPower: () => (worldType === 'void' && masteryPurchased('voidPower') ? 1 + game.talents.voidPower.getTotalVP() / 100 : 1),
		mayhem: () => game.challenges.Mayhem.getTrimpMult(),
		pandemonium: () => game.challenges.Pandemonium.getTrimpMult(),
		desolation: () => game.challenges.Desolation.getTrimpMult()
	};
	health = applyMultipliers(healthMultipliers, health);

	if (game.global.universe === 1) {
		const healthMultipliers = {
			formation: () => (game.global.formation !== 0 && game.global.formation !== 5 ? (game.global.formation === 1 ? 4 : 0.5) : 1),
			geneticist: () => Math.pow(1.01, game.global.lastLowGen),
			amalgamator: () => game.jobs.Amalgamator.getHealthMult(),
			toughness_II: () => (getPerkLevel('Toughness_II') > 0 ? 1 + getPerkModifier('Toughness_II') * getPerkLevel('Toughness_II') : 1),
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
			geneHealth: () => (u2Mutations.tree.GeneHealth.purchased ? 10 : 1),
			spireBasics: () => u2SpireBonuses.basics(),
			fluffyHealth: () => (Fluffy.isRewardActive('scaledHealth') ? Fluffy.rewardConfig.scaledHealth.mult() : 1)
		};
		health = applyMultipliers(healthMultipliers, health);

		const challengeMultipliers = {
			Wither: () => (game.challenges.Wither.trimpStacks > 0 ? game.challenges.Wither.getTrimpHealthMult() : 1),
			/* Revenge: () => (game.challenges.Revenge.stacks > 0 ? game.challenges.Revenge.getMult() : 1), */
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

function calcOurHealth(stance = false, worldType = _getWorldType(), realHealth = false, fullGeneticist = false, extraItem = new ExtraItem()) {
	let health = getTrimpHealth(realHealth, worldType, extraItem);

	if (game.global.universe === 1) {
		if (![0, 5].includes(game.global.formation)) health /= game.global.formation === 1 ? 4 : 0.5;

		const formationLetter = ['X', 'H', 'D', 'B', 'S', 'W'];
		if (typeof stance === 'number') {
			stance = formationLetter[Math.floor(stance)];
		}

		if (stance) {
			const stanceMultipliers = {
				X: 1,
				H: 4,
				D: 0.5,
				B: 0.5,
				S: 0.5,
				W: 1
			};

			health *= stanceMultipliers[stance] || 1;
		}

		const geneticist = game.jobs.Geneticist;
		if (fullGeneticist && geneticist.owned > 0) health *= Math.pow(1.01, geneticist.owned - game.global.lastLowGen);
	}

	if (game.global.universe === 2) {
		let shield = typeof atConfig !== 'undefined' ? getEnergyShieldMult_AT(worldType) : getEnergyShieldMult();
		shield = health * (1 + shield * (1 + Fluffy.isRewardActive('shieldlayer'))) - health;
		if (stance) return shield;
		else health += shield;
	}

	return health;
}

function calcOurBlock(stance = false, realBlock = false, worldType = _getWorldType(), extraGyms = 0, extraItem = new ExtraItem()) {
	if (game.global.universe === 2) return 0;

	let block = 0;

	if (realBlock) {
		block = game.global.soldierCurrentBlock;
		if (block === null) return 0;
		if (stance || game.global.formation === 0) return block;
		if (game.global.formation === 3) return block / 4;
		return block * 2;
	}

	const heirloomToCheck = typeof atConfig !== 'undefined' ? heirloomShieldToEquip(worldType) : null;

	const gym = game.buildings.Gym;
	const owned = gym.owned + extraGyms;

	const Gymystic = game.upgrades.Gymystic;
	const gymysticFactor = Gymystic.done ? Gymystic.modifier + 0.01 * (Gymystic.done - 1) : 1;
	const increaseBy = gym.increase.by * Math.pow(gymysticFactor, extraGyms);

	if (owned > 0) block += owned * increaseBy;

	const shield = game.equipment.Shield;

	if (shield.blockNow) {
		if (extraItem.name === 'Shield') {
			const level = extraItem.extraLevels + (extraItem.shouldPrestige ? 1 : shield.level);
			const prestigeLevel = shield.prestige + (extraItem.shouldPrestige ? 0 : -1);
			const newStatsPerLevel = Math.round(shield.block * Math.pow(1.19, prestigeLevel * game.global.prestige['block'] + 1));
			block += level * newStatsPerLevel;
		} else block += shield.level * shield.blockCalculated;
	}

	const trainer = game.jobs.Trainer;
	if (trainer.owned > 0) {
		const trainerStrength = trainer.owned * (trainer.modifier / 100);
		const trainerHeirloom = heirloomToCheck ? calcHeirloomBonus_AT('Shield', 'trainerEfficiency', 1, false, heirloomToCheck) : calcHeirloomBonus('Shield', 'trainerEfficiency', 1, false);
		block *= 1 + trainerStrength * trainerHeirloom;
	}

	/* GS has this for some reason and it was impacting block calcs a tiny bit */
	block = Math.floor(block);

	const formationLetter = ['X', 'H', 'D', 'B', 'S', 'W'];
	if (typeof stance === 'number') stance = formationLetter[Math.floor(stance)];

	if (stance) {
		const stanceMultipliers = {
			X: 1,
			H: 0.5,
			D: 0.5,
			B: 4,
			S: 0.5,
			W: 1
		};

		block *= stanceMultipliers[stance] || 1;
	}

	const heirloomBonus = heirloomToCheck ? calcHeirloomBonus_AT('Shield', 'trimpBlock', 1, false, heirloomToCheck) : calcHeirloomBonus('Shield', 'trimpBlock', 1, false);
	block *= heirloomBonus;
	block *= game.resources.trimps.maxSoldiers;

	return block;
}

function _getAnticipationBonus(stacks = game.global.antiStacks, currentBonus = false, breedtimer = false) {
	let maxStacks = masteryPurchased('patience') ? 45 : 30;
	if (breedtimer) maxStacks = Math.min(breedtimer, maxStacks);
	const perkMult = getPerkLevel('Anticipation') * getPerkModifier('Anticipation');
	const stacks45 = typeof autoTrimpSettings === 'undefined' ? maxStacks : currentBonus ? false : getPageSetting('45stacks');

	return stacks45 ? 1 + maxStacks * perkMult : 1 + stacks * perkMult;
}

function _getRampageBonus(maxStacks = false) {
	if (!challengeActive('Daily') || typeof game.global.dailyChallenge.rampage === 'undefined') return 1;

	const { strength, stacks } = game.global.dailyChallenge.rampage;

	if (maxStacks) {
		return dailyModifiers.rampage.getMult(strength, dailyModifiers.rampage.getMaxStacks(strength));
	}

	return dailyModifiers.rampage.getMult(strength, stacks);
}

function _getTrimpIceMult(realDamage) {
	if (getEmpowerment() !== 'Ice') return 1;

	if (realDamage || (typeof atConfig !== 'undefined' && !getPageSetting('fullIce'))) {
		return 1 + game.empowerments.Ice.getDamageModifier();
	} else {
		const afterTransfer = 1 + Math.ceil(game.empowerments.Ice.currentDebuffPower * getRetainModifier('Ice'));
		let mod = 1 - Math.pow(game.empowerments.Ice.getModifier(), afterTransfer);
		if (Fluffy.isRewardActive('naturesWrath')) mod *= 2;
		return 1 + mod;
	}
}

function _getQuagmireStatMult(worldType = _getWorldType(), stacks = game.challenges.Quagmire.exhaustedStacks) {
	const exhaustedStacks = stacks;
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
	if (typeof atConfig !== 'undefined' && getPageSetting('addPoison')) return game.empowerments.Poison.getDamage() * getRetainModifier('Poison');
	return 0;
}

function getCritMulti(crit, customShield) {
	const doubleCrit = typeof atConfig !== 'undefined' ? getPlayerDoubleCritChance_AT(customShield) : getPlayerDoubleCritChance();
	const critD = typeof atConfig !== 'undefined' ? getPlayerCritDamageMult_AT(customShield) : getPlayerCritDamageMult();
	let critChance = typeof atConfig !== 'undefined' ? getPlayerCritChance_AT(customShield) : getPlayerCritChance();

	if (crit === 'never') critChance = Math.floor(critChance);
	if (crit === 'force') critChance = Math.ceil(critChance + (doubleCrit > 0 ? 1 : 0));

	let critMult = 1;
	if (critChance < 0) {
		critMult = 1 + critChance - critChance / 5;
	} else if (critChance < 1) {
		if (doubleCrit > 0 && !['never', 'force'].includes(crit)) {
			const noCritNoDouble = (1 - critChance) * (1 - doubleCrit);
			const critNoDouble = critChance * (1 - doubleCrit) * critD;
			const noCritDouble = (1 - critChance) * doubleCrit * critD;
			const critDouble = critChance * doubleCrit * critD * critD;
			critMult = noCritNoDouble + critNoDouble + noCritDouble + critDouble;
		} else {
			critMult = 1 - critChance + critChance * critD;
		}
	} else if (critChance < 2) {
		const megaCritDmg = getMegaCritDamageMult(2);
		if (doubleCrit > 0 && !['never', 'force'].includes(crit)) {
			const noCritNoDouble = (2 - critChance) * (1 - doubleCrit) * critD;
			const critNoDouble = (critChance - 1) * (1 - doubleCrit) * megaCritDmg * critD;
			const noCritDouble = (2 - critChance) * doubleCrit * megaCritDmg * critD;
			const critDouble = (critChance - 1) * doubleCrit * getMegaCritDamageMult(3) * critD;
			critMult = noCritNoDouble + critNoDouble + noCritDouble + critDouble;
		} else {
			critMult = (critChance - 1) * megaCritDmg * critD + (2 - critChance) * critD;
		}
	} else if (critChance >= 2 && ['never', 'force'].includes(crit)) {
		critMult = getMegaCritDamageMult(Math.floor(critChance)) * critD;
	} else if (critChance >= 2) {
		let highTierChance = critChance - Math.floor(critChance);
		const lowTierMulti = getMegaCritDamageMult(Math.floor(critChance));
		const highTierMulti = getMegaCritDamageMult(Math.ceil(critChance));

		if (doubleCrit > 0) {
			const doubleTierMulti = getMegaCritDamageMult(Math.ceil(critChance) + 1);
			const noCritNoDouble = (1 - highTierChance) * (1 - doubleCrit) * lowTierMulti;
			const critNoDouble = highTierChance * (1 - doubleCrit) * highTierMulti;
			const noCritDouble = (1 - highTierChance) * doubleCrit * highTierMulti;
			const critDouble = highTierChance * doubleCrit * doubleTierMulti;
			critMult = (noCritNoDouble + critNoDouble + noCritDouble + critDouble) * critD;
		} else {
			critMult = ((1 - highTierChance) * lowTierMulti + highTierChance * highTierMulti) * critD;
		}
	}

	return critMult;
}

function getTenacityTime(worldType = _getWorldType()) {
	if (game.global.spireActive && worldType === 'world') return 60;
	let minutes = getZoneMinutes();
	let lastZone = game.portal.Tenacity.timeLastZone;

	if (lastZone == -1) lastZone = 0;
	if (lastZone > 120) lastZone = 120;
	minutes += lastZone * game.portal.Tenacity.getCarryoverMult();
	if (minutes > 120) minutes = 120;

	return minutes;
}

function getTenacityBonus(worldType = _getWorldType()) {
	let time = getTenacityTime(worldType);
	if (time <= 60) {
		time *= 10 / 6;
	} else {
		time -= 60;
		time *= 2 / 6;
		time += 100;
	}

	return 1.1 + Math.floor(time / 4) * 0.01;
}

function getTenacityMult(worldType = _getWorldType()) {
	const bonusAmount = getTenacityBonus(worldType);
	return Math.pow(Math.max(1.1, bonusAmount), getPerkLevel('Tenacity') + getPerkLevel('Masterfulness'));
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
	const runningAutoTrimps = typeof atConfig !== 'undefined';
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
		mapBonus: () => (worldType !== 'world' ? 1 : masteryPurchased('mapBattery') && game.global.mapBonus === 10 ? 5 : 1 + game.global.mapBonus * 0.2),
		herbalist: () => (masteryPurchased('herbalist') ? game.talents.herbalist.getBonus() : 1),
		bionic2: () => (worldType === 'map' && masteryPurchased('bionic2') && mapLevel > 0 ? 1.5 : 1),
		voidPower: () => (worldType === 'void' && masteryPurchased('voidPower') ? 1 + game.talents.voidPower.getTotalVP() / 100 : 1),
		voidMastery: () => (worldType === 'void' && masteryPurchased('voidMastery') ? 5 : 1),
		fluffy: () => (game.global.spiresCompleted >= 2 ? Fluffy.getDamageModifier() : 1),
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
			magmamancer: () => (masteryPurchased('magmamancer') ? game.jobs.Magmamancer.getBonusPercent() : 1),
			stillRowing: () => (masteryPurchased('stillRowing2') ? game.global.spireRows * 0.06 + 1 : 1),
			kerfluffle: () => (masteryPurchased('kerfluffle') ? game.talents.kerfluffle.mult() : 1),
			strengthInHealth: () => (masteryPurchased('healthStrength') && mutations.Healthy.active() ? 0.15 * mutations.Healthy.cellCount() + 1 : 1),
			voidSipon: () => (Fluffy.isRewardActive('voidSiphon') && game.stats.totalVoidMaps.value ? 1 + game.stats.totalVoidMaps.value * 0.05 : 1),
			amalgamator: () => game.jobs.Amalgamator.getDamageMult(),
			poisionEmpowerment: () => (getUberEmpowerment() === 'Poison' ? 3 : 1),
			frigid: () => game.challenges.Frigid.getTrimpMult(),
			scryhard: () => (fightingCorrupted && masteryPurchased('scry') && ((!specificStance && game.global.formation === 4) || ['S', 'W'].includes(specificStance)) ? 2 : 1),
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
			tenacity: () => getTenacityMult(worldType),
			spireStats: () => autoBattle.bonuses.Stats.getMult(),
			championism: () => game.portal.Championism.getMult(),
			frenzy: () => (getPerkLevel('Frenzy') > 0 && !challengeActive('Berserk') && (autoBattle.oneTimers.Mass_Hysteria.owned || !runningAutoTrimps || getPageSetting('frenzyCalc')) ? 1 + 0.5 * getPerkLevel('Frenzy') : 1),
			observation: () => game.portal.Observation.getMult(),
			mutatorAttack: () => (u2Mutations.tree.Attack.purchased ? 1.5 : 1),
			geneAttack: () => (u2Mutations.tree.GeneAttack.purchased ? 10 : 1),
			brainsToBrawn: () => (u2Mutations.tree.Brains.purchased ? u2Mutations.tree.Brains.getBonus() : 1),
			novaStacks: () => (worldType === 'world' && game.global.novaMutStacks > 0 ? u2Mutations.types.Nova.trimpAttackMult() : 1),
			spireDaily: () => (Fluffy.isRewardActive('SADailies') && challengeActive('Daily') ? Fluffy.rewardConfig.SADailies.attackMod() : 1),
			spireBasics: () => u2SpireBonuses.basics(),
			spireAttackMult: () => (game.global.spireActive && game.global.spireMutStacks > 0 && !game.global.mapsActive ? u2Mutations.types.Spire1.trimpAttackMult() : 1)
		};

		attack = applyMultipliers(damageModifiers, attack);

		const challengeMultipliers = {
			Unbalance: () => game.challenges.Unbalance.getAttackMult(),
			Duel: () => (game.challenges.Duel.trimpStacks > 50 ? 3 : 1),
			Melt: () => 5 * Math.pow(0.99, game.challenges.Melt.stacks),
			Quagmire: () => _getQuagmireStatMult(worldType),
			Revenge: () => game.challenges.Revenge.getMult(),
			Quest: () => game.challenges.Quest.getAttackMult(),
			Archaeology: () => game.challenges.Archaeology.getStatMult('attack'),
			Storm: () => (worldType !== 'world' ? Math.pow(0.9995, game.challenges.Storm.beta) : 1),
			Berserk: () => game.challenges.Berserk.getAttackMult(),
			Nurture: () => game.challenges.Nurture.getStatBoost(),
			Alchemy: () => alchObj.getPotionEffect('Potion of Strength'),
			Desolation: () => game.challenges.Desolation.trimpAttackMult(),
			Smithless: () => (game.challenges.Smithless.fakeSmithies > 0 ? Math.pow(1.25, game.challenges.Smithless.fakeSmithies) : 1)
		};
		attack = applyMultipliers(challengeMultipliers, attack, true, true);

		const equalityLevel = getPerkLevel('Equality');
		if (equalityLevel > 0 && universeSetting > 0) {
			const equalityMult = runningAutoTrimps ? getPlayerEqualityMult_AT(heirloomToCheck) : game.portal.Equality.getModifier(true);
			attack *= Math.pow(equalityMult, universeSetting);
		}
	}

	if (challengeActive('Daily')) {
		if (masteryPurchased('daily')) attack *= 1.5;

		const worldLevel = game.global.world + (worldType !== 'map' ? mapLevel : 0);

		minFluct -= applyDailyMultipliers('minDamage', 0);
		maxFluct += applyDailyMultipliers('maxDamage', 0);
		if (worldLevel % 2 === 1) attack *= applyDailyMultipliers('oddTrimpNerf', 1);
		if (worldLevel % 2 === 0) attack *= applyDailyMultipliers('evenTrimpBuff', 1);
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
	const ignoreCrits = typeof atConfig !== 'undefined' && game.global.universe === 1 ? getPageSetting('ignoreCrits') || 0 : 0;
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
	const ignoreCrits = typeof atConfig !== 'undefined' && game.global.universe === 1 ? getPageSetting('ignoreCrits') || 0 : 0;
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
		attack *= 0.35;
		attack = attack * 0.2 + attack * 0.75 * (cell / 100);
	} else if (zone === 2) {
		attack *= 0.5;
		attack = attack * 0.32 + attack * 0.68 * (cell / 100);
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
			const enemy = game.global.gridArray[cell - 1];
			const improbability = name === 'Improbability' || name === 'Omnipotrimp';
			if (game.global.spireActive) {
				attack = calcSpire('attack', cell, name);
			} else if (gridInitialised && mutations.Corruption.active() && (enemy.mutation || enemy.empowerment || improbability)) {
				if (enemy.mutation !== 'Magma' || improbability) attack = corruptionBaseStats(cell - 1, zone, 'attack', true, name);

				if (enemy.empowerment) attack *= 1.2;
				if (enemy.corrupted === 'corruptStrong') attack *= 2;
				else if (enemy.corrupted === 'healthyStrong') attack *= 2.5;
			}
		} else {
			const corruptionScale = calcCorruptionScale(game.global.world, 3);
			if (mutations.Magma.active()) attack *= corruptionScale / (worldType === 'void' ? 1 : 2);
			else if (worldType === 'void' && mutations.Corruption.active()) attack *= corruptionScale / 2;
		}
	} else if (game.global.universe === 2) {
		if (worldType === 'world') {
			if (game.global.spireActive) {
				attack = calcSpire('attack', cell, name);
			} else if (gridInitialised && game.global.world > 200 && game.global.gridArray[cell - 1].u2Mutation.length > 0) {
				attack = mutationBaseStats(cell - 1, zone, 'attack');
			}
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
			Domination: () => ((worldType === 'world' && cell === 100) || worldType !== 'world' ? 2.5 : 1),
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
			Storm: () => (worldType === 'world' ? game.challenges.Storm.getAttackMult() : 1),
			Berserk: () => 1.5,
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
		if (worldType === 'world' && game.global.spireActive && game.global.spireMutStacks > 0) attack *= u2Mutations.types.Spire1.enemyAttackMult();
		if (equality && equality > 0) attack *= Math.pow(game.portal.Equality.getModifier(), equality);
	}

	if (challengeActive('Daily')) {
		attack *= applyDailyMultipliers('badStrength', 1);
		if (worldType === 'world') attack *= applyDailyMultipliers('empower', 1);
		if (worldType !== 'world') attack *= applyDailyMultipliers('badMapStrength', 1);
		if (worldType === 'void') attack *= applyDailyMultipliers('empoweredVoid', 1);

		const dailyChallenge = game.global.dailyChallenge;
		if (typeof dailyChallenge.bloodthirst !== 'undefined' && typeof atConfig !== 'undefined') {
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
		if (cell === 100 || worldType !== 'world') {
			if (worldType === 'world' && game.global.usingShriek && zone === game.global.world) attack *= game.mapUnlocks.roboTrimp.getShriekValue();
		} else {
			attack /= 10;
		}
	}

	if (typeof atConfig !== 'undefined' && getEmpowerment() === 'Ice' && getPageSetting('fullIce')) {
		const afterTransfer = 1 + Math.ceil(game.empowerments.Ice.currentDebuffPower * getRetainModifier('Ice'));
		attack *= Math.pow(game.empowerments.Ice.getModifier(), afterTransfer);
	}

	return minOrMax ? Math.floor(attack) : Math.ceil(attack);
}

function calcSpecificEnemyAttack(critPower = 2, customBlock, customHealth, customAttack) {
	const enemy = getCurrentEnemy();
	if (!enemy) return -1;

	const corrupt = enemy.corrupted && enemy.corrupted !== 'none';
	let attack = calcEnemyAttackCore(undefined, undefined, enemy.level, enemy.name);
	attack *= badGuyCritMult(enemy, critPower, customBlock, customHealth);

	if (game.global.mapsActive && !customAttack) attack *= getCurrentMapObject().difficulty;
	if (challengeActive('Nom') && typeof enemy.nomStacks !== 'undefined') attack *= Math.pow(1.25, enemy.nomStacks);
	if (challengeActive('Lead')) attack *= 1 + 0.04 * game.challenges.Lead.stacks;

	if (game.global.universe === 1 && !game.global.mapsActive && (corrupt || (enemy.level === 100 && mutations.Corruption.active()))) {
		if (enemy.level === 100) {
			if (!game.global.spireActive) attack *= calcCorruptionScale(game.global.world, 3);
			if (game.global.usingShriek) attack *= game.mapUnlocks.roboTrimp.getShriekValue();
		}
		if (game.global.spireActive) {
			if (enemy.corrupted === 'corruptStrong') attack *= 2;
			if (enemy.corrupted === 'healthyStrong') attack *= 2.5;
		}
	}

	if (game.global.universe === 1 && getEmpowerment() === 'Ice') attack *= game.empowerments.Ice.getCombatModifier();
	if (game.global.universe === 2) attack *= game.portal.Equality.getMult(false);

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
		health *= 0.6;
		health = health * 0.25 + health * 0.72 * (cell / 100);
	} else if (zone < 60) {
		health *= 0.4 * (1 + cell / 110);
	} else {
		health = health * 0.5 + health * 0.8 * (cell / 100);
		health *= Math.pow(1.1, zone - 59);
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

	return Math.floor(health);
}

function calcEnemyHealthCore(worldType = _getWorldType(), zone = _getZone(worldType), cell = _getCell(), name = _getEnemyName('Turtlimp'), customHealth) {
	let health = calcEnemyBaseHealth(worldType, zone, cell, name);
	const gridInitialised = game.global.gridArray && game.global.gridArray.length > 0;

	if (customHealth) {
		health = customHealth;
	} else if (game.global.universe === 1) {
		if (worldType === 'world') {
			const enemy = game.global.gridArray[cell - 1];
			const improbability = name === 'Improbability' || name === 'Omnipotrimp';
			if (game.global.spireActive) {
				health = calcSpire('health', cell, name);
			} else if (gridInitialised && mutations.Corruption.active() && (enemy.mutation || enemy.empowerment || improbability)) {
				if (enemy.mutation !== 'Magma' || improbability) health = corruptionBaseStats(cell - 1, zone, 'health', true, name);

				if (enemy.empowerment) health *= 4;
				if (enemy.corrupted === 'corruptTough') health *= 5;
				else if (enemy.corrupted === 'healthyTough') health *= 7.5;
			}
		} else {
			const corruptionScale = calcCorruptionScale(game.global.world, 10);
			if (mutations.Magma.active()) health *= corruptionScale / (worldType === 'void' ? 1 : 2);
			else if (worldType === 'void' && mutations.Corruption.active()) health *= corruptionScale / 2;
		}
	} else if (game.global.universe === 2) {
		if (worldType === 'world') {
			if (game.global.spireActive) {
				attack = calcSpire('attack', cell, name);
			} else if (gridInitialised && game.global.world > 200 && game.global.gridArray[cell - 1].u2Mutation.length > 0) {
				health = mutationBaseStats(cell - 1, zone, 'health');
			}
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
			Berserk: () => 1.5,
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

	if (challengeActive('Domination')) {
		if (cell === 100 || worldType !== 'world') health *= 7.5;
		else health /= 10;
	}

	if (challengeActive('Lead')) {
		health *= zone % 2 === 0 ? 5 : 1 + 0.04 * game.challenges.Lead.stacks;
	}

	return health;
}

function calcSpecificEnemyHealth(worldType = _getWorldType(), zone = _getZone(worldType), cell = _getCell(), forcedName) {
	const enemy = worldType === 'world' ? game.global.gridArray[cell - 1] : game.global.mapGridArray[cell - 1];
	if (!enemy) return -1;

	const corrupt = enemy.corrupted && enemy.corrupted !== 'none';
	const name = corrupt && !game.global.spireActive ? 'Chimp' : forcedName ? forcedName : enemy.name;
	let health = calcEnemyHealthCore(worldType, zone, cell, name);

	if (challengeActive('Lead')) health *= 1 + 0.04 * game.challenges.Lead.stacks;
	if (challengeActive('Domination')) {
		const lastCell = worldType === 'world' ? 100 : game.global.mapGridArray.length;
		if (cell < lastCell) health /= 10;
		else health *= 7.5;
	}

	if (worldType !== 'world') {
		health *= getCurrentMapObject().difficulty;
	} else if (game.global.universe === 1 && (corrupt || (cell === 100 && mutations.Corruption.active()))) {
		if (cell === 100 && !game.global.spireActive) health *= calcCorruptionScale(game.global.world, 10);

		if (game.global.spireActive) {
			if (enemy.corrupted === 'corruptTough') health *= 5;
			if (enemy.corrupted === 'healthyTough') health *= 7.5;
		}
	}

	return health;
}

function calcHDRatio(targetZone = game.global.world, worldType = 'world', voidMaxBonuses = { mapBonus: false, maxTenacity: false }, difficulty = 1, hdCheck = true, checkOutputs) {
	const heirloomToUse = heirloomShieldToEquip(worldType, false, hdCheck);
	let enemyHealth = 0;
	let universeSetting;

	const leadCheck = worldType !== 'map' && targetZone % 2 === 1 && challengeActive('Lead');
	if (leadCheck) targetZone++;

	if (worldType === 'world') {
		let enemyName = 'Turtlimp';
		if (liquifiedZone()) enemyName = 'Liquimp';
		else if (game.global.universe === 1 && targetZone > 229) enemyName = 'Omnipotrimp';
		else if ((game.global.universe === 2 && targetZone >= 20) || targetZone >= 59) enemyName = 'Improbability';
		else if (targetZone === 5 || targetZone === 10 || (targetZone >= 15 && targetZone <= 58)) enemyName = 'Blimp';

		let customHealth;
		let cell = enemyName === 'Liquimp' ? 1 : 100;

		if (game.global.universe === 1) {
			if (game.global.spireActive) customHealth = calcSpire('health');
			else if (isCorruptionActive(targetZone)) customHealth = calcCorruptedStats(targetZone, 'health');
		} else if (game.global.universe === 2) {
			if (game.global.spireActive) customHealth = calcSpire('health');
			else if (targetZone > 200) customHealth = calcMutationStats(targetZone, 'health');
		}

		enemyHealth = calcEnemyHealth(worldType, targetZone, cell, enemyName, customHealth) * difficulty;
		universeSetting = game.global.universe === 2 ? equalityQuery(enemyName, targetZone, cell, worldType, difficulty, 'gamma', false, 1, true) : 'X';
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

	if (voidMaxBonuses.mapBonus && worldType === 'world' && game.global.mapBonus !== 10) {
		ourBaseDamage /= 1 + 0.2 * game.global.mapBonus;
		ourBaseDamage *= masteryPurchased('mapBattery') ? 5 : 3;
	}

	if (voidMaxBonuses.maxTenacity) {
		const tenacityLevel = getPerkLevel('Tenacity');
		if (tenacityLevel > 0) {
			const tenacityMult = game.portal.Tenacity.getMult();
			const tenacityMaxMult = Math.pow(1.4000000000000001, tenacityLevel + getPerkLevel('Masterfulness'));

			if (tenacityMult !== tenacityMaxMult) {
				ourBaseDamage /= tenacityMult;
				ourBaseDamage *= tenacityMaxMult;
			}
		}
	}

	const maxGammaStacks = gammaMaxStacks(false, true, worldType) - 1;

	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.weakness !== 'undefined' && maxGammaStacks !== Infinity) {
			ourBaseDamage *= 1 - (Math.max(1, maxGammaStacks) * game.global.dailyChallenge.weakness.strength) / 100;
		}

		if (worldType === 'map' && typeof game.global.dailyChallenge.rampage !== 'undefined') {
			ourBaseDamage *= _getRampageBonus(true);
		}
	}

	if ((worldType !== 'map' && game.global.universe === 2 && universeSetting < getPerkLevel('Equality') - 14) || game.global.universe === 1) ourBaseDamage *= MODULES.heirlooms.gammaBurstPct;
	if (worldType !== 'map' && challengeActive('Storm') && game.challenges.Storm.mutations > 0) ourBaseDamage *= game.challenges.Storm.getGammaMult();

	if (checkOutputs) _calcHDRatioDebug(ourBaseDamage, enemyHealth, universeSetting, worldType);
	let hdRatio = enemyHealth / ourBaseDamage;
	if (hdRatio > 1 && challengeActive('Domination')) {
		const dStance = game.upgrades.Dominance.done;
		if (dStance && hdRatio > 80) hdRatio = Infinity;
		else if (!dStance && hdRatio > 20) hdRatio = Infinity;
		else hdRatio = (enemyHealth + enemyHealth * 0.05) / ourBaseDamage;
	}

	return hdRatio;
}

function calcHitsSurvived(targetZone = _getZone(), worldType = _getWorldType(), difficulty = 1, extraGyms = 0, extraItem = new ExtraItem(), checkOutputs) {
	const availableStances = unlockedStances();
	const formationMod = availableStances.includes('D') || (worldType === 'void' && availableStances.includes('S') && whichScryVoidMaps()) ? 2 : 1;
	const ignoreCrits = game.global.universe !== 1 ? 2 : getPageSetting('ignoreCrits');

	if (worldType !== 'map' && targetZone % 2 === 1 && challengeActive('Lead')) targetZone++;

	const customAttack = _calcHitsSurvivedAttack(worldType, targetZone);
	let enemyName = worldType === 'void' ? 'Voidsnimp' : 'Snimp';

	if (worldType === 'world') {
		if (liquifiedZone()) enemyName = 'Liquimp';
		else if (game.global.universe === 1 && targetZone > 229) enemyName = 'Omnipotrimp';
		else if ((game.global.universe === 2 && targetZone >= 20) || targetZone >= 59) enemyName = 'Improbability';
		else if (targetZone === 5 || targetZone === 10 || (targetZone >= 15 && targetZone <= 58)) enemyName = 'Blimp';
	}

	let cell = enemyName === 'Liquimp' ? 1 : 100;
	let hitsToSurvive = targetHitsSurvived(false, worldType);
	if (hitsToSurvive === 0) hitsToSurvive = 1;

	const health = calcOurHealth(false, worldType, false, true, extraItem) / formationMod;
	const block = calcOurBlock(false, false, worldType, extraGyms, extraItem) / formationMod;
	const equality = equalityQuery(enemyName, targetZone, cell, worldType, difficulty, 'gamma', null, hitsToSurvive);
	let damageMult = 1;

	if (ignoreCrits !== 2) {
		const dailyCrit = challengeActive('Daily') && typeof game.global.dailyChallenge.crits !== 'undefined';

		if (dailyCrit) damageMult = dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
		else if (challengeActive('Crushed') && health > block) damageMult = 3;

		if (atConfig.initialise.loaded && ignoreCrits !== 1 && worldType === 'void') damageMult *= 4;
	}

	const worldDamage = calcEnemyAttack(worldType, targetZone, cell, enemyName, undefined, customAttack, equality) * difficulty;
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
	} else if (universe === 2) {
		if (spireActive) customAttack = calcSpire('attack');
		else if (targetZone > 200) customAttack = calcMutationStats(targetZone, 'attack');
	}

	return customAttack;
}

function corruptionBaseStats(cell = game.global.lastClearedCell + 1, targetZone = game.global.world, type = 'attack', ignoreMultiplier = false, name = 'Chimp') {
	cell = game.global.gridArray[cell];
	const typeFunction = type === 'attack' ? calcEnemyBaseAttack : calcEnemyBaseHealth;
	if (name !== 'Improbability' && name !== 'Omnipotrimp') name = 'Chimp';
	let baseStats = typeFunction('world', targetZone, cell.level, name, true);

	if (type === 'attack') {
		if (!ignoreMultiplier) {
			if (cell.corrupted === 'corruptStrong') baseStats *= 2;
			else if (cell.corrupted === 'healthyStrong') baseStats *= 2.5;
		}
		baseStats *= cell.mutation === 'Healthy' ? calcCorruptionScale(targetZone, 5) : calcCorruptionScale(targetZone, 3);
	} else if (type === 'health') {
		if (!ignoreMultiplier) {
			if (cell.corrupted === 'corruptTough') baseStats *= 5;
			else if (cell.corrupted === 'healthyTough') baseStats *= 7.5;
		}
		baseStats *= cell.mutation === 'Healthy' ? calcCorruptionScale(targetZone, 14) : calcCorruptionScale(targetZone, 10);
	}

	return baseStats;
}

function calcCorruptedStats(targetZone = game.global.world, type = 'attack') {
	if (game.global.universe !== 1 || !isCorruptionActive(targetZone)) return;

	const gridArray = game.global.gridArray;
	let stat;

	gridArray.forEach((grid, i) => {
		if (grid.mutation || grid.name === 'Improbability' || grid.name === 'Omnipotrimp') {
			const enemyStat = corruptionBaseStats(i, targetZone, type, undefined, grid.name);
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
			if (game.global.spireActive && game.global.spireMutStacks > 0) attack *= u2Mutations.types.Spire1.enemyAttackMult();
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
	if (typeof atConfig !== 'undefined') {
		if (heirloomShieldToEquip(worldType) && getHeirloomBonus_AT('Shield', 'gammaBurst', heirloomShieldToEquip(worldType)) <= 1) return Infinity;
		if (actualCheck && MODULES.heirlooms.gammaBurstPct === 1) return 1;
		if (specialChall && game.global.mapsActive) return Infinity;
	}

	let gammaMaxStacks = 5;
	if (autoBattle.oneTimers.Burstier.owned) gammaMaxStacks--;
	if (Fluffy.isRewardActive('scruffBurst')) gammaMaxStacks--;
	return gammaMaxStacks;
}

function coordinateCanOneShot() {
	const enemy = getCurrentEnemy();
	if (!enemy) return false;

	const enemyHealth = enemy.health;
	const worldType = _getWorldType();
	const targetZone = _getZone(worldType);
	const formationLetter = ['X', 'H', 'D', 'B', 'S', 'W'];
	const formation = formationLetter[game.global.formation];
	let ourBaseDamage = calcOurDmg('min', formation, true, worldType, 'never', targetZone - game.global.world, game.global.titimpLeft > 0);
	if (getEmpowerment() === 'Poison') ourBaseDamage += game.empowerments.Poison.getDamage();

	return ourBaseDamage >= enemyHealth;
}

function equalityQuery(enemyName = 'Snimp', zone = game.global.world, currentCell, worldType = 'world', difficulty = 1, farmType = 'gamma', forceOK, hits, hdCheck) {
	if (Object.keys(game.global.gridArray).length === 0 || getPerkLevel('Equality') === 0) return 0;
	if (!currentCell) currentCell = worldType === 'world' || worldType === 'void' ? 98 : 20;
	const runningAT = typeof atConfig !== 'undefined';

	const bionicTalent = zone - game.global.world;
	const checkMutations = worldType === 'world' && zone > 200;
	const titimp = worldType !== 'world' && farmType === 'oneShot' ? 'force' : false;
	const dailyEmpowerToggle = runningAT && getPageSetting('empowerAutoEquality');
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

	if (dailyCrit || dailyExplosive) {
		if (dailyExplosive) enemyDmg *= 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength);
		if (dailyCrit && (worldType === 'map' || dailyEmpowerToggle)) enemyDmg *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
	} else if (hits || (worldType === 'world' && dailyEmpower && (dailyCrit || dailyExplosive))) {
		if (dailyCrit) enemyDmg *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
	}

	if (challengeActive('Duel')) {
		enemyDmg *= 10;
		if (game.challenges.Duel.trimpStacks >= 50) enemyDmg *= 3;
	}

	let dmgType = runningUnlucky ? 'max' : 'avg';
	if (forceOK && runningUnlucky && zone - game.global.world > 0) dmgType = 'min';

	let ourHealth = calcOurHealth(shieldBreak, worldType);
	let ourDmg = calcOurDmg(dmgType, 0, false, worldType, critType, bionicTalent, titimp);
	const unluckyDmg = runningUnlucky ? Number(calcOurDmg('min', 0, false, worldType, 'never', bionicTalent, titimp)) : 2;
	const gammaToTrigger = gammaMaxStacks(false, false, worldType);

	if (checkMutations) {
		enemyDmg = calcEnemyAttack(worldType, zone, currentCell, enemyName, false, calcMutationStats(zone, 'attack'), 0);
		enemyHealth = calcEnemyHealth(worldType, zone, currentCell, enemyName, calcMutationStats(zone, 'health'));
	}

	if (forceOK) enemyHealth *= 1 * overkillCount;
	if (!hits) hits = 1;
	enemyDmg *= hits;
	if (challengeActive('Duel') && runningAT) ourDmg *= MODULES.heirlooms.gammaBurstPct;

	if (isDaily) {
		if (typeof game.global.dailyChallenge.weakness !== 'undefined') {
			ourDmg *= 1 - ((worldType === 'map' ? 9 : gammaToTrigger) * game.global.dailyChallenge.weakness.strength) / 100;
		}

		if (worldType === 'map' && typeof game.global.dailyChallenge.rampage !== 'undefined') {
			ourDmg *= _getRampageBonus(true);
		}
	}

	let ourDmgEquality = 0;
	let enemyDmgEquality = 0;
	let unluckyDmgEquality = 0;
	const ourEqualityModifier = runningAT ? getPlayerEqualityMult_AT(heirloomShieldToEquip(worldType)) : game.portal.Equality.getModifier(true);
	const enemyEqualityModifier = game.portal.Equality.getModifier();

	//Accounting for enemies hitting multiple times per gamma burst
	if (hdCheck && worldType !== 'map' && gammaToTrigger !== Infinity) {
		const enemyDmgMaxEq = enemyDmg * Math.pow(enemyEqualityModifier, maxEquality);
		ourHealth -= enemyDmgMaxEq * (gammaToTrigger - 1);
	}

	for (let i = 0; i <= maxEquality; i++) {
		enemyDmgEquality = enemyDmg * Math.pow(enemyEqualityModifier, i);
		ourDmgEquality = ourDmg * Math.pow(ourEqualityModifier, i);

		if (runningUnlucky) {
			unluckyDmgEquality = unluckyDmg * Math.pow(ourEqualityModifier, i);
			if (unluckyDmgEquality.toString()[0] % 2 === 1 && i !== maxEquality) continue;
		}

		if (farmType === 'gamma' && ourHealth >= enemyDmgEquality) {
			return i;
		} else if (farmType.includes('oneShot') && ourDmgEquality > enemyHealth && ourHealth > enemyDmgEquality) {
			return i;
		} else if (i === maxEquality) {
			return i;
		}
	}
}

function remainingHealth(shieldBreak = false, angelic = false, worldType = 'world', forceMax = false) {
	const heirloomToCheck = heirloomShieldToEquip(worldType);
	const correctHeirloom = heirloomToCheck !== undefined ? getPageSetting(heirloomToCheck) === game.global.ShieldEquipped.name : true;
	const currentShield = calcHeirloomBonus_AT('Shield', 'trimpHealth', 1, true) / 100;
	const newShield = calcHeirloomBonus_AT('Shield', 'trimpHealth', 1, true, heirloomToCheck) / 100;

	let soldierHealthMax = game.global.soldierHealthMax;
	let soldierHealth = forceMax ? soldierHealthMax : game.global.soldierHealth;
	let shieldHealth = 0;

	if (!correctHeirloom) {
		soldierHealth = (soldierHealth / (1 + currentShield)) * (1 + newShield);
		soldierHealthMax = (soldierHealthMax / (1 + currentShield)) * (1 + newShield);
	}

	if (game.global.universe === 2) {
		const maxLayers = Fluffy.isRewardActive('shieldlayer');
		const layers = maxLayers - game.global.shieldLayersUsed;
		let shieldMax = game.global.soldierEnergyShieldMax;
		let shieldCurr = forceMax ? shieldMax : game.global.soldierEnergyShield;

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

function enoughHealth(map, minAvgMax = 'max') {
	const { name, location, level, size, difficulty } = map;
	const health = calcOurHealth(false, 'map', false, true);
	const block = calcOurBlock(false, false);
	const totalHealth = health + block;

	const enemyName = name === 'Imploding Star' ? 'Neutrimp' : location === 'Void' ? 'Voidsnimp' : 'Snimp';
	const cell = name === 'Imploding Star' ? 100 : 99;
	const worldType = location === 'Void' ? 'void' : 'map';
	const mapLevel = name === 'The Black Bog' ? game.global.world : level;
	const equalityAmt = game.global.universe === 2 ? equalityQuery(enemyName, mapLevel, size, 'map', difficulty, 'gamma') : 0;
	const fluctuation = game.global.universe === 2 ? 1.5 : 1.2;

	let enemyDmg = calcEnemyAttackCore(worldType, mapLevel, size, enemyName, false, false, equalityAmt) * difficulty;
	if (minAvgMax !== 'max') {
		enemyDmg /= fluctuation * (minAvgMax === 'min' ? fluctuation : 1);
	}

	return totalHealth > enemyDmg;
}
