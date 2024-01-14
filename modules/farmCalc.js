//Setup for non-AT users
if (typeof MODULES === 'undefined') {
	MODULES = {};
}

function mastery(name) {
	if (!game.talents[name]) throw 'unknown mastery: ' + name;
	return game.talents[name].purchased;
}

function callAutoMapLevel(mapName, special, maxLevel, minLevel) {
	if (getPageSetting('autoLevelTest')) return callAutoMapLevel_new(mapName, special);

	let mapLevel = mapSettings.levelCheck;
	if (mapLevel !== Infinity && challengeActive('Mapology')) return mapLevel;

	if (mapLevel === Infinity) {
		mapLevel = autoMapLevel(special, maxLevel, minLevel);
	} else if (mapName && atSettings.intervals.sixSecond) {
		const autoLevel = autoMapLevel(special, maxLevel, minLevel);
		if (autoLevel > mapLevel) mapLevel = autoLevel;
		const autoLevelIgnoreFragments = autoMapLevel(special, maxLevel, minLevel, true);
		if (autoLevelIgnoreFragments < mapLevel) mapLevel = autoLevelIgnoreFragments;
	}

	if (_getCurrentQuest() === 8 || challengeActive('Bublé')) return mapLevel;

	const mapBonusLevel = game.global.universe === 1 ? -game.portal.Siphonology.level : 0;
	const mapBonusConditions = [
		{ condition: mapName === 'Map Bonus', level: mapBonusLevel },
		{ condition: mapName === 'HD Farm' && game.global.mapBonus !== 10, level: mapBonusLevel },
		{ condition: mapName === 'Hits Survived' && game.global.mapBonus < getPageSetting('mapBonusHealth'), level: mapBonusLevel },
		{ condition: challengeActive('Wither') && mapName !== 'Map Bonus' && mapLevel >= 0, level: -1 },
		{ condition: mapName === 'Quest' && mapLevel < mapBonusLevel && [6, 7].includes(_getCurrentQuest()) && game.global.mapBonus !== 10, level: mapBonusLevel },
		{ condition: ['Insanity Farm', 'Pandemonium Destacking', 'Alchemy Farm', 'Glass', 'Desolation Destacking'].includes(mapName) && mapLevel <= 0, level: 1 },
		{ condition: mapName === 'Mayhem Destacking' && mapLevel < 0, level: getPageSetting('mayhemMapIncrease') > 0 ? getPageSetting('mayhemMapIncrease') : 0 },
		{ condition: mapName === 'Smithless Farm' && game.global.mapBonus !== 10 && mapLevel < mapBonusLevel, level: mapBonusLevel },
		{ condition: _insanityDisableUniqueMaps() && mapLevel < 0, level: 0 }
	];

	const matchingCondition = mapBonusConditions.find(({ condition }) => condition);
	if (matchingCondition) mapLevel = matchingCondition.level;

	return mapLevel;
}

function callAutoMapLevel_new(mapName, special) {
	const speedSettings = ['Map Bonus', 'Experience', 'Mayhem Destacking'];
	const mapType = speedSettings.includes(mapName) ? 'speed' : 'loot';
	const mapModifiers = {
		special: special || trimpStats.mapSpecial,
		biome: mapSettings.biome || trimpStats.mapBiome
	};
	const lootFunction = mapName === 'Desolation Destacking' ? lootDestack : lootDefault;

	if (hdStats.autoLevelZone !== game.global.world) {
		hdStats.autoLevelZone = game.global.world;
		hdStats.autoLevelInitial = stats(lootFunction);
	}

	let mapLevel = mapSettings.levelCheck;
	if (mapLevel !== Infinity && challengeActive('Mapology')) return mapLevel;

	if (mapLevel === Infinity) {
		mapLevel = get_best(hdStats.autoLevelInitial, true, mapModifiers)[mapType].mapLevel;
	} else if (mapName && atSettings.intervals.sixSecond) {
		const autoLevel = get_best(hdStats.autoLevelInitial, true, mapModifiers)[mapType].mapLevel;
		mapLevel = Math.max(mapLevel, autoLevel);
		const autoLevelIgnoreFragments = get_best(hdStats.autoLevelInitial)[mapType].mapLevel;
		mapLevel = Math.min(mapLevel, autoLevelIgnoreFragments);
	}

	if (_getCurrentQuest() === 8 || challengeActive('Bublé')) return mapLevel;

	const mapBonusLevel = game.global.universe === 1 ? -game.portal.Siphonology.level : 0;
	const mapBonusConditions = [
		{ condition: mapName === 'Map Bonus', level: mapBonusLevel },
		{ condition: mapName === 'HD Farm' && game.global.mapBonus !== 10, level: mapBonusLevel },
		{ condition: mapName === 'Hits Survived' && game.global.mapBonus < getPageSetting('mapBonusHealth'), level: mapBonusLevel },
		{ condition: challengeActive('Wither') && mapName !== 'Map Bonus' && mapLevel >= 0, level: -1 },
		{ condition: mapName === 'Quest' && mapLevel < mapBonusLevel && [6, 7].includes(_getCurrentQuest()) && game.global.mapBonus !== 10, level: mapBonusLevel },
		{ condition: ['Insanity Farm', 'Pandemonium Destacking', 'Alchemy Farm', 'Glass', 'Desolation Destacking'].includes(mapName) && mapLevel <= 0, level: 1 },
		{ condition: mapName === 'Mayhem Destacking' && mapLevel < 0, level: getPageSetting('mayhemMapIncrease') > 0 ? getPageSetting('mayhemMapIncrease') : 0 },
		{ condition: mapName === 'Smithless Farm' && game.global.mapBonus !== 10 && mapLevel < mapBonusLevel, level: mapBonusLevel },
		{ condition: _insanityDisableUniqueMaps() && mapLevel < 0, level: 0 }
	];

	const matchingCondition = mapBonusConditions.find(({ condition }) => condition);
	if (matchingCondition) mapLevel = matchingCondition.level;

	return mapLevel;
}

function autoMapLevel(special = getAvailableSpecials('lmc'), maxLevel, minLevel, statCheck = false) {
	if (!game.global.mapsUnlocked) return 0;
	if (maxLevel > 10) maxLevel = 10;
	const z = game.global.world;
	if (z + maxLevel < 6) maxLevel = 0 - (z + 6);

	if (challengeActive('Wither') && maxLevel >= 0 && minLevel !== 0) maxLevel = -1;
	if (_insanityDisableUniqueMaps() && maxLevel >= 0 && minLevel !== 0) minLevel = 0;

	const isDaily = challengeActive('Daily');
	const hze = getHighestLevelCleared();
	const extraMapLevelsAvailable = game.global.universe === 2 ? hze >= 49 : hze >= 209;
	const haveMapReducer = game.talents.mapLoot.purchased;

	const biome = getBiome();
	const query = !special ? true : false;
	let universeSetting = z >= 60 && hze >= 180 ? 'S' : game.upgrades.Dominance.done ? 'D' : 'X';
	const cell = game.talents.mapLoot2.purchased ? 20 : 25;
	const difficulty = game.global.universe === 2 ? (hze >= 29 ? 0.75 : 1) : hze > 209 ? 0.75 : hze > 120 ? 0.84 : 1.2;
	let enemyName = 'Snimp';

	maxLevel = maxLevel || 10;
	if (maxLevel > 0 && !extraMapLevelsAvailable) maxLevel = 0;
	minLevel = minLevel || 0 - z + 6;
	if (minLevel < -(z - 6)) minLevel = -(z - 6);
	const runningQuest = challengeActive('Quest') && _getCurrentQuest() === 8;
	const runningUnlucky = challengeActive('Unlucky');
	const runningInsanity = challengeActive('Insanity');
	const runningDuel = challengeActive('Duel');
	var ourHealth = calcOurHealth(game.global.universe === 2 ? runningQuest : universeSetting, 'map');
	const ourBlock = game.global.universe === 1 ? calcOurBlock(universeSetting, 'map') : 0;
	const dailyCrit = challengeActive('Daily') && typeof game.global.dailyChallenge.crits !== 'undefined';
	const dailyExplosive = isDaily && typeof game.global.dailyChallenge.explosive !== 'undefined'; //Explosive
	const dailyWeakness = isDaily && typeof game.global.dailyChallenge.weakness !== 'undefined'; //Weakness

	if (_insanityDisableUniqueMaps() && game.challenges.Insanity.insanity !== game.challenges.Insanity.maxInsanity) {
		ourHealth /= game.challenges.Insanity.getHealthMult();
		ourHealth *= Math.pow(0.99, Math.min(game.challenges.Insanity.insanity + 70, game.challenges.Insanity.maxInsanity));
	}

	let dmgType = runningUnlucky ? 'max' : 'avg';
	let critType = 'maybe';
	let critChance = getPlayerCritChance_AT('map');
	critChance = critChance - Math.floor(critChance);
	if (challengeActive('Wither') || challengeActive('Glass') || challengeActive('Duel') || critChance < 0.1) critType = 'never';
	const overkillRange = maxOneShotPower(true);

	const perfectMaps = typeof atSettings !== 'undefined' ? getPageSetting('onlyPerfectMaps') : true;

	for (let y = maxLevel; y >= minLevel; y--) {
		if (y === minLevel) return minLevel;
		let mapLevel = y;
		if (!runningUnlucky) dmgType = mapLevel > 0 ? 'min' : 'avg';
		if (runningInsanity && mapLevel > 0) enemyName = 'Horrimp';
		if (!statCheck && perfectMaps && game.resources.fragments.owned < mapCost(mapLevel, special, biome)) continue;
		if (!statCheck && !perfectMaps && game.resources.fragments.owned < minMapFrag(mapLevel, special, biome)) continue;

		if (game.global.universe === 2) universeSetting = equalityQuery(enemyName, z + mapLevel, cell, 'map', difficulty, 'oneShot', true);
		let ourDmg = calcOurDmg(dmgType, universeSetting, false, 'map', critType, y, 'force');
		if (runningDuel) ourDmg *= MODULES.heirlooms.gammaBurstPct;
		if (isDaily && dailyWeakness) ourDmg *= 1 - (9 * game.global.dailyChallenge.weakness.strength) / 100;
		let enemyHealth = calcEnemyHealthCore('map', z + mapLevel, cell, 'Turtlimp') * difficulty;

		if (overkillRange > 1) {
			enemyHealth *= overkillRange;
			if (game.global.universe === 1) ourDmg *= 0.005 * game.portal.Overkill.level;
			if (game.global.universe === 2 && !u2Mutations.tree.MadMap.purchased) ourDmg *= 0.005;
		}
		let enemyDmg = calcEnemyAttackCore('map', z + mapLevel, cell, enemyName, false, false, universeSetting) * difficulty;

		if (dailyExplosive) enemyDmg *= 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength);
		if (dailyCrit && getPageSetting('IgnoreCrits') === 0) enemyDmg *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);

		if (challengeActive('Duel')) {
			enemyDmg *= 10;
			if (game.challenges.Duel.trimpStacks >= 50) enemyDmg *= 3;
		}

		if (enemyHealth <= ourDmg && enemyDmg <= ourHealth + ourBlock) {
			if (!query && mapLevel === 0 && minLevel < 0 && game.global.mapBonus === 10 && haveMapReducer && !challengeActive('Glass') && !runningInsanity && !challengeActive('Mayhem')) mapLevel = -1;
			return mapLevel;
		}
	}
	return 0;
}

function populateFarmCalcData() {
	let imps = 0;
	for (let imp of ['Chronoimp', 'Jestimp', 'Titimp', 'Flutimp', 'Goblimp']) imps += game.unlocks.imps[imp];
	//Randimp
	if (game.talents.magimp.purchased) imps++;
	let exoticChance = 3;
	if (Fluffy.isRewardActive('exotic')) exoticChance += 0.5;
	if (game.permaBoneBonuses.exotic.owned > 0) exoticChance += game.permaBoneBonuses.exotic.addChance();
	exoticChance /= 100;

	//Misc Run Info
	const universe = game.global.universe;
	const zone = game.global.world;
	//Nature
	const hze = getHighestLevelCleared() + 1;
	let nature = game.empowerments[['Poison', 'Wind', 'Ice'][Math.ceil(zone / 5) % 3]];
	const natureStart = universe !== 1 ? 9999 : challengeActive('Eradicated') ? 1 : 236;
	const diplomacy = mastery('nature2') ? 5 : 0;
	const plaguebrought = Fluffy.isRewardActive('plaguebrought') ? 2 : 1;
	const natureTransfer = (zone >= natureStart ? nature.retainLevel + nature.getRetainBonus() : 0) / 100;
	nature = zone >= natureStart ? nature.level + diplomacy : 0;

	let speed = 10 * 0.95 ** getPerkLevel('Agility');
	if (mastery('hyperspeed')) --speed;
	if (mastery('hyperspeed2') && zone <= Math.ceil(hze / 2)) --speed;
	if (challengeActive('Quagmire')) speed += game.challenges.Quagmire.getSpeedPenalty() / 100;

	//Challenge Checks
	const runningUnlucky = challengeActive('Unlucky');
	const runningQuest = challengeActive('Bublé') || _getCurrentQuest() === 8;
	const runningDuel = challengeActive('Duel');

	//Map Modifiers (for the map we're on)
	const biome = getBiome();
	const perfectMapsUnlocked = typeof atSettings !== 'undefined' ? trimpStats.perfectMaps : universe === 2 ? game.stats.highestRadLevel.valueTotal() >= 30 : game.stats.highestLevel.valueTotal() >= 110;
	const extraMapLevelsAvailable = game.global.universe === 2 ? hze >= 50 : hze >= 210;
	const haveMapReducer = game.talents.mapLoot.purchased;
	// Six hours simulation inside of TW and a day outside of it.
	const maxTicks = typeof atSettings !== 'undefined' ? (atSettings.loops.atTimeLapseFastLoop ? 21600 : 86400) : 86400;

	//Stance & Equality
	let stances = 'X';
	let universeSetting = universe === 1 ? stances : 0;
	//Trimps Stats
	const dmgType = runningUnlucky ? 'max' : 'min';
	let trimpAttack = calcOurDmg(dmgType, universeSetting, false, 'map', 'never', 0, 'never');
	let trimpHealth = calcOurHealth(universe === 2 ? runningQuest : 'X', 'map');
	let trimpBlock = universe === 1 ? calcOurBlock('X', 'map') : 0;
	let trimpShield = universe === 2 ? calcOurHealth(true, 'map') : 0;
	trimpHealth -= trimpShield;

	if (universe === 1) {
		if (game.upgrades.Dominance.done) stances = 'D';
		if (hze >= 181 && game.upgrades.Formations.done) stances += 'S';
		//Both D and S stance (the only ones we'd use in maps for farming) have a 50% health penalty.
		if (stances !== 'X') {
			trimpHealth /= 2;
			trimpBlock /= 2;
		}
	}

	const gammaMult = typeof atSettings !== 'undefined' ? MODULES.heirlooms.gammaBurstPct : game.global.gammaMult;
	const gammaCharges = gammaMaxStacks(false, false, 'map');

	//Heirloom + Crit Chance
	const customShield = typeof atSettings !== 'undefined' ? heirloomShieldToEquip('map') : null;
	let critChance = typeof atSettings !== 'undefined' ? getPlayerCritChance_AT(customShield) : getPlayerCritChance();
	let critDamage = typeof atSettings !== 'undefined' ? getPlayerCritDamageMult_AT(customShield) - 1 : getPlayerCritDamageMult() - 1;

	//Base crit multiplier
	let megaCD = 5;
	if (Fluffy.isRewardActive('megaCrit')) megaCD += 2;
	if (mastery('crit')) megaCD += 1;
	// Handle megacrits
	critDamage = critChance >= 1 ? megaCD - 1 : critDamage;

	//Trimp max & min damage ranges
	let minFluct = 0.8 + 0.02 * game.portal.Range.level;
	let maxFluct = 1.2;

	//Overkill - Accounts for Mad Mapper in U2.
	const overkillRange = Math.max(0, maxOneShotPower(true) - 1);
	let overkillDamage = game.portal.Overkill.level * 0.005;
	if (universe === 2) {
		if (u2Mutations.tree.MadMap.purchased) overkillDamage = 1;
		else if (canU2OverkillAT(zone)) overkillDamage = 0.005;
		else overkillDamage = 0;
	}

	if (_insanityDisableUniqueMaps() && game.challenges.Insanity.insanity !== game.challenges.Insanity.maxInsanity) {
		trimpHealth /= game.challenges.Insanity.getHealthMult();
		trimpHealth *= Math.pow(0.99, Math.min(game.challenges.Insanity.insanity + 70, game.challenges.Insanity.maxInsanity));
	}

	//Check if we have a fast enemy
	//Fast Enemy conditions
	let fastEnemy = challengeActive('Desolation');
	if (runningQuest) fastEnemy = true;
	else if (challengeActive('Revenge')) fastEnemy = true;
	else if (challengeActive('Trappapalooza')) fastEnemy = true;
	else if (challengeActive('Archaeology')) fastEnemy = true;
	else if (challengeActive('Berserk') && game.challenges.Berserk.weakened !== 20) fastEnemy = true;
	else if (challengeActive('Exterminate')) fastEnemy = false;
	else if (challengeActive('Glass')) fastEnemy = true;
	else if (universe === 2 && game.portal.Frenzy.radLevel > 0 && !autoBattle.oneTimers.Mass_Hysteria.owned) fastEnemy = true;

	const death_stuff = {
		enemy_cd: 1,
		breed_timer: breedTotalTime().toNumber(),
		weakness: 0,
		plague: 0,
		bleed: 0,
		explosion: 0,
		nom: challengeActive('Nom'),
		fastEnemies: fastEnemy,
		magma: challengeActive('Eradicated') || (game.global.universe === 1 && zone >= 230)
	};

	//Enemy Stats
	let enemyHealth = 1;
	let enemyAttack = 1;

	//U1 Challenge modifiers
	const challengeEffects = {
		Discipline: () => {
			minFluct = 0.005;
			maxFluct = 1.995;
		},
		Balance: () => {
			enemyHealth *= 2;
			enemyAttack *= 2.35;
		},
		Meditate: () => {
			enemyHealth *= 2;
			enemyAttack *= 1.5;
		},
		Electricity: () => {
			death_stuff.weakness = 0.1;
			death_stuff.plague = 0.1;
		},
		Life: () => {
			enemyHealth *= 11;
			enemyAttack *= 6;
			trimpAttack *= 1 + 0.1 * game.challenges.Life.stacks;
			trimpHealth *= 1 + 0.1 * game.challenges.Life.stacks;
		},
		Crushed: () => {
			if (trimpHealth < trimpBlock) death_stuff.enemy_cd = 5;
		},
		Nom: () => {
			death_stuff.bleed = 0.05;
		},
		Toxicity: () => {
			enemyHealth *= 2;
			enemyAttack *= 5;
			death_stuff.bleed = 0.05;
		},
		Watch: () => {
			enemyAttack *= 1.25;
		},
		Lead: () => {
			enemyHealth *= 1 + 0.04 * game.challenges.Lead.stacks;
			enemyAttack *= 1 + 0.04 * game.challenges.Lead.stacks;
			death_stuff.bleed = Math.min(game.challenges.Lead.stacks, 200) * 0.0003;
		},
		Corrupted: () => {
			enemyAttack *= 3;
		},
		Obliterated: () => {
			enemyHealth *= 1e12 * 10 ** Math.floor(zone / 10);
			enemyAttack *= 1e12 * 10 ** Math.floor(zone / 10);
		},
		Eradicated: () => {
			enemyHealth *= 1e20 * 3 ** Math.floor(zone / 2);
			enemyAttack *= 1e20 * 3 ** Math.floor(zone / 2);
		},
		Frigid: () => {
			enemyHealth *= game.challenges.Frigid.getEnemyMult();
			enemyAttack *= game.challenges.Frigid.getEnemyMult();
		},
		Experience: () => {
			enemyHealth *= game.challenges.Experience.getEnemyMult();
			enemyAttack *= game.challenges.Experience.getEnemyMult();
		}
	};

	if (universe === 1) {
		Object.keys(challengeEffects).forEach((challenge) => {
			if (challengeActive(challenge)) {
				challengeEffects[challenge]();
			}
		});
	}

	//U2 Challenge modifiers
	const challengeEffectsU2 = {
		Unlucky: () => {
			minFluct = 0.005;
			maxFluct = 1.995;
		},
		Unbalance: () => {
			enemyHealth *= 2;
			enemyAttack *= 1.5;
		},
		Duel: () => {
			death_stuff.enemy_cd = 10;
			if (game.challenges.Duel.trimpStacks > 50) trimpAttack /= 3;
		},
		Wither: () => {
			enemyHealth *= game.challenges.Wither.getTrimpHealthMult();
			enemyAttack *= game.challenges.Wither.getEnemyAttackMult();
		},
		Quest: () => {
			enemyHealth *= game.challenges.Quest.getHealthMult();
		},
		Quagmire: () => {
			let exhaustedStacks = game.challenges.Quagmire.exhaustedStacks;
			let mod = 0.05;
			if (exhaustedStacks === 0) enemyAttack *= 1;
			else if (exhaustedStacks < 0) enemyAttack *= Math.pow(1 + mod, Math.abs(exhaustedStacks));
			else enemyAttack *= Math.pow(1 - mod, exhaustedStacks);
		},
		Revenge: () => {
			if (game.global.world % 2 === 0) enemyHealth *= 10;
		},
		Archaeology: () => {
			enemyAttack *= game.challenges.Archaeology.getStatMult('enemyAttack');
		},
		Mayhem: () => {
			enemyHealth *= game.challenges.Mayhem.getEnemyMult();
			enemyAttack *= game.challenges.Mayhem.getEnemyMult();
		},
		Berserk: () => {
			enemyHealth *= 1.5;
			enemyAttack *= 1.5;
		},
		Exterminate: () => {
			enemyHealth *= game.challenges.Exterminate.getSwarmMult();
		},
		Nurture: () => {
			enemyHealth *= 10;
			enemyHealth *= game.buildings.Laboratory.getEnemyMult();
			enemyAttack *= 2;
			enemyAttack *= game.buildings.Laboratory.getEnemyMult();
		},
		Pandemonium: () => {
			enemyHealth *= game.challenges.Pandemonium.getPandMult();
			enemyAttack *= game.challenges.Pandemonium.getPandMult();
		},
		Desolation: () => {
			enemyHealth *= game.challenges.Desolation.getEnemyMult();
			enemyAttack *= game.challenges.Desolation.getEnemyMult();
		},
		Alchemy: () => {
			enemyHealth *= alchObj.getEnemyStats(true) + 1;
			enemyAttack *= alchObj.getEnemyStats(true) + 1;
		},
		Hypothermia: () => {
			enemyHealth *= game.challenges.Hypothermia.getEnemyMult();
			enemyAttack *= game.challenges.Hypothermia.getEnemyMult();
		},
		Glass: () => {
			enemyHealth *= game.challenges.Glass.healthMult();
		}
	};

	if (universe === 2) {
		Object.keys(challengeEffectsU2).forEach((challenge) => {
			if (challengeActive(challenge)) {
				challengeEffectsU2[challenge]();
			}
		});
	}

	//Dailies
	if (challengeActive('Daily')) {
		const daily = (mod) => (game.global.dailyChallenge[mod] ? game.global.dailyChallenge[mod].strength : 0);
		minFluct -= daily('minDamage') ? 0.09 + 0.01 * daily('minDamage') : 0;
		maxFluct += daily('maxDamage');

		death_stuff.plague = 0.01 * daily('plague');
		death_stuff.bleed = 0.01 * daily('bogged');
		death_stuff.weakness = 0.01 * daily('weakness');
		death_stuff.enemy_cd = 1 + 0.5 * daily('crits');
		death_stuff.explosion = daily('explosive');

		enemyHealth *= 1 + 0.2 * daily('badHealth');
		enemyHealth *= 1 + 0.3 * daily('badMapHealth');
		enemyAttack *= 1 + 0.2 * daily('badStrength');
		enemyAttack *= 1 + 0.3 * daily('badMapStrength');
	}

	return {
		//Base Info
		universe: universe,
		speed: speed,
		zone: zone,
		maxTicks: maxTicks,
		//Extra Map Info
		extraMapLevelsAvailable: extraMapLevelsAvailable,
		reducer: haveMapReducer,
		perfectMaps: perfectMapsUnlocked,
		biome: _getBiomeEnemyStats(biome),
		fragments: game.resources.fragments.owned,
		mapSpecial: getAvailableSpecials('lmc'),
		mapBiome: biome,

		difficulty: ((perfectMapsUnlocked ? 75 : 80) + (challengeActive('Mapocalypse') ? 300 : 0)) / 100,
		size: mastery('mapLoot2') ? 20 : perfectMapsUnlocked ? 25 : 27,

		//Nature
		poison: 0,
		wind: 0,
		ice: 0,
		windCap: getUberEmpowerment() === 'Wind' ? 300 : 200,
		natureIncrease: 1 * (getUberEmpowerment() === getEmpowerment() && game.global.uberNature !== 'Poison' ? 2 : 1) * plaguebrought,
		[['poison', 'wind', 'ice'][Math.ceil(zone / 5) % 3]]: nature / 100,
		uberNature: getUberEmpowerment(),
		transfer: natureTransfer,
		//Trimp Stats
		attack: trimpAttack,
		trimpHealth: trimpHealth,
		trimpBlock: trimpBlock,
		trimpShield: trimpShield,
		//Misc Trimp Stats
		critChance: critChance % 1,
		critDamage: 1 + critDamage,
		gammaCharges: gammaCharges,
		gammaMult: gammaMult,
		range: maxFluct / minFluct,
		plaguebringer: (plaguebrought ? 0.5 : 0) + (typeof atSettings !== 'undefined' ? getHeirloomBonus_AT('Shield', 'plaguebringer', customShield) * 0.01 : getHeirloomBonus('Shield', 'plaguebringer') * 0.01),
		equalityMult: game.global.universe === 2 ? (typeof atSettings !== 'undefined' ? getPlayerEqualityMult_AT(customShield) : game.portal.Equality.getMult(true)) : 1,
		//Enemy Stats
		challenge_health: enemyHealth,
		challenge_attack: enemyAttack,
		fluctuation: game.global.universe === 2 ? 0.5 : 0.2,
		//Misc
		import_chance: imps * exoticChance,
		ok_spread: overkillRange,
		overkill: overkillDamage,
		stances: stances,
		titimp: game.unlocks.imps.Titimp,
		titimpReduction: 1 - speed / 10,
		//Challenge Conditions
		angelic: mastery('angelic'),
		trapper: noBreedChallenge(),
		coordinate: challengeActive('Coordinate'),
		devastation: challengeActive('Devastation') || challengeActive('Revenge'),
		domination: challengeActive('Domination'),
		frigid: challengeActive('Frigid'),
		unlucky: runningUnlucky,
		duel: runningDuel,
		wither: challengeActive('Wither'),
		quest: runningQuest,
		mayhem: challengeActive('Mayhem'),
		insanity: challengeActive('Insanity'),
		berserk: challengeActive('Berserk'),
		glass: challengeActive('Glass'),
		desolation: challengeActive('Desolation'),
		//Death Info
		...death_stuff
	};
}

//Return a list of efficiency stats for all sensible zones
function stats(lootFunction = lootDefault) {
	const saveData = populateFarmCalcData();
	let stats = [];
	let extra = 0;
	if (saveData.reducer) extra = -1;
	if (saveData.extraMapLevelsAvailable) extra = 10;
	let mapsCanAffordPerfect = 0;
	for (let mapLevel = saveData.zone + extra; mapLevel >= 6; --mapLevel) {
		if (saveData.coordinate) {
			let coords = 1;
			for (let z = 1; z < mapLevel; ++z) coords = Math.ceil(1.25 * coords);
			saveData.challenge_health = coords;
			saveData.challenge_attack = coords;
		}
		let tmp = zone_stats(mapLevel, saveData.stances, saveData, lootFunction);
		if (tmp.value < 1 && mapLevel >= saveData.zone) continue;

		//Check fragment cost of each map and remove them from the check if they can't be afforded.
		if (tmp.canAffordPerfect) mapsCanAffordPerfect++;
		//Want to guarantee at least 6 results here so that we don't accidentally miss a good map to farm on.
		//Cap maps at 30 so that we don't have to wait too long for the results. Also running a -19 map isn't gonna be efficient at all.
		if (stats.length && ((mapsCanAffordPerfect >= 6 && tmp.value < 0.804 * stats[0].value && mapLevel < saveData.zone - 3) || stats.length >= 30)) break;
		stats.unshift(tmp);
		if (tmp.zone === 'z6') break;
	}
	return [stats, saveData.stances];
}

function lootDefault(zone, saveData)
{
	return 100 * (zone < saveData.zone ? 0.8 ** (saveData.zone - saveData.reducer - zone) : 1.1 ** (zone - saveData.zone));
}

function lootDestack(zone, saveData)
{
	return zone <= saveData.zone ? 0 : zone - saveData.zone;
}

//Return efficiency stats for the given zone
function zone_stats(zone, stances = 'X', saveData, lootFunction) {
	const result = {
		mapLevel: zone - saveData.zone,
		zone: 'z' + zone,
		value: 0,
		killSpeed: 0,
		stance: 'X',
		loot: lootFunction(zone, saveData),
		canAffordPerfect: saveData.fragments >= mapCost(zone - saveData.zone, saveData.mapSpecial, saveData.mapBiome, [9, 9, 9])
	};

	//Loop through all stances to identify which stance is best for farming
	for (let stance of stances) {
		saveData.atk = saveData.attack * (stance == 'D' ? 4 : stance == 'X' ? 1 : 0.5);
		if (mastery('bionic2') && zone > saveData.zone) saveData.atk *= 1.5;
		const simulationResults = simulate(saveData, zone, stance);
		const speed = simulationResults.speed;
		const value = speed * result.loot * (stance == 'S' ? 2 : 1);
		const equality = simulationResults.equality;
		const killSpeed = simulationResults.killSpeed;
		result[stance] = {
			speed,
			value,
			equality,
			killSpeed
		};

		if (value > result.value) {
			result.equality = equality;
			result.stance = stance;
			result.value = value;
		}

		if (killSpeed > result.killSpeed) {
			result.killSpeed = killSpeed;
			result.stanceSpeed = stance;
		}
	}

	return result;
}

//Simulate farming at the given zone for a fixed time, and return the number cells cleared.
function simulate(saveData, zone) {
	let trimpHealth = saveData.trimpHealth;
	let debuff_stacks = 0;
	let titimp = 0;
	let cell = 0;
	let loot = 0;
	let last_group_sent = 0;
	let ticks = 0;
	let plague_damage = 0;
	let ok_damage = 0,
		ok_spread = 0;
	let poison = 0,
		wind = 0,
		ice = 0;
	let gammaStacks = 0,
		burstDamage = 0;
	let energyShieldMax = saveData.trimpShield,
		energyShield = energyShieldMax;
	let mayhemPoison = 0;
	let trimpOverkill = 0;
	let duelPoints = game.challenges.Duel.trimpStacks;
	let glassStacks = game.challenges.Glass.shards;
	let universe = saveData.universe;
	let magma = saveData.magma;
	let hasWithered = false;
	let equality = 1;
	let trimpCrit = false;
	let enemyCrit = false;

	let kills = 0;
	let deaths = 0;

	let seed = Math.floor(Math.random(40, 50) * 100);
	const rand_mult = 4.656612873077393e-10;

	function rng() {
		seed ^= seed >> 11;
		seed ^= seed << 8;
		seed ^= seed >> 19;
		return seed * rand_mult;
	}

	function armyDead() {
		if (saveData.quest) return energyShield <= 0;
		else return trimpHealth <= 0;
	}

	var biomeImps = saveData.biome;
	//Identify how much equality is needed to clear the worst enemy on the map
	if (universe === 2) {
		var enemyName = 'Snimp';
		if (saveData.insanity) {
			enemyName = 'Horrimp';
			biomeImps.push([15, 60, true]);
		}
		equality = equalityQuery(enemyName, zone, saveData.size, 'map', saveData.difficulty);
	}
	//Six hours of simulation inside of TW and a day outside of it.
	const max_ticks = saveData.maxTicks;
	//Create map array of enemy stats
	var hp_array = [];
	var atk_array = [];
	for (var i = 0; i < saveData.size; ++i) {
		var enemyHealth = calcEnemyBaseHealth('map', zone, cell + 1, 'Chimp');
		if (saveData.magma) enemyHealth *= calcCorruptionScale(saveData.zone, 10) / 2;

		var enemyAttack = calcEnemyBaseAttack('map', zone, cell + 1, 'Chimp');
		if (saveData.magma) enemyAttack *= calcCorruptionScale(zone, 3) / 2;

		cell++;
		//Domination has a stat bonus for final enemy and stat penalty for all others
		if (saveData.domination) {
			if (cell === saveData.size) {
				enemyAttack *= 2.5;
				enemyHealth *= 7.5;
			} else {
				enemyAttack *= 0.1;
				enemyHealth *= 0.1;
			}
		}
		atk_array.push(saveData.difficulty * saveData.challenge_attack * enemyAttack);
		hp_array.push(saveData.difficulty * saveData.challenge_health * enemyHealth);
	}

	function reduceTrimpHealth(amt, directHit) {
		if (saveData.mayhem) mayhemPoison += amt * 0.2;
		if (!directHit && universe === 2) {
			var initialShield = energyShield;
			energyShield -= amt;
			if (energyShield > 0) return;
			else amt -= initialShield;
		}
		//Reduce by block
		if (!directHit && universe === 1) amt -= saveData.trimpBlock;
		//Frigid shatter
		if (saveData.frigid && amt >= saveData.trimpHealth / 5) amt = saveData.trimpHealth;
		trimpHealth -= Math.max(0, amt);
	}

	function enemy_hit(enemyAttack) {
		//Damage fluctations
		var enemyAtk = enemyAttack;

		enemyAtk *= 1 + saveData.fluctuation * (2 * rng() - 1);
		//Enemy crit chance
		var enemyCC = 0.25;
		if (saveData.duel) {
			enemyCC = duelPoints / 100;
			if (duelPoints < 50) enemyAtk *= 3;
		}
		if (rng() < enemyCC) {
			enemyAtk *= saveData.enemy_cd;
			enemyCrit = true;
		}
		//Ice modifier
		if (saveData.ice > 0) enemyAtk *= 0.366 ** (ice * saveData.ice);
		//Equality mult
		if (universe === 2) enemyAtk *= Math.pow(0.9, equality);
		//Safety precaution for infinite Ice stacks
		enemyAtk = Math.max(0, enemyAtk);
		reduceTrimpHealth(enemyAtk);
		++debuff_stacks;
	}

	cell = 0;
	while (ticks < max_ticks) {
		var turns = 0;
		var pbTurns = 0;
		var imp = rng();
		var imp_stats = imp < saveData.import_chance ? [1, 1, false] : biomeImps[Math.floor(rng() * biomeImps.length)];
		var enemyAttack = imp_stats[0] * atk_array[cell];
		var enemyHealth = imp_stats[1] * hp_array[cell];

		var enemy_max_hp = enemyHealth;
		var fast = saveData.fastEnemies || (imp_stats[2] && !saveData.nom) || saveData.desolation || (saveData.duel && duelPoints > 90);
		var oneShot = true;
		trimpOverkill = 0;

		if (ok_spread !== 0) {
			enemyHealth -= ok_damage;
			--ok_spread;
		}
		enemyHealth = Math.min(enemyHealth, Math.max(enemy_max_hp * 0.05, enemyHealth - plague_damage));
		plague_damage = 0;
		energyShield = energyShieldMax;
		//Add in the mult from glass stacks as they need to be adjusted every enemy
		if (saveData.glass) enemyAttack *= Math.pow(2, Math.floor(glassStacks / 100)) * (100 + glassStacks);
		//Add in 10x hp mult from Duel if necessary
		if (saveData.duel && duelPoints > 80) enemyHealth *= 10;
		titimp = 0;

		while (enemyHealth >= 1 && ticks < max_ticks) {
			++turns;
			trimpCrit = false;
			enemyCrit = false;
			//Check if we didn't kill the enemy last turn for Wither & Glass checks
			if (enemyHealth !== enemy_max_hp) {
				oneShot = false;
				if (saveData.wither) {
					enemyHealth = Math.max(enemy_max_hp, enemyHealth + enemy_max_hp * 0.25);
					if (enemyHealth === enemy_max_hp) {
						hasWithered = true;
						trimpHealth = 0;
					}
				}
				if (saveData.glass) {
					enemyAttack /= Math.pow(2, Math.floor(glassStacks / 100)) * (100 + glassStacks);
					glassStacks++;
					enemyAttack *= Math.pow(2, Math.floor(glassStacks / 100)) * (100 + glassStacks);
				}
			} else oneShot = true;
			//Angelic talent heal
			if (saveData.angelic && !saveData.berserk) {
				trimpHealth += saveData.trimpHealth / 2;
				if (trimpHealth > saveData.trimpHealth) trimpHealth = saveData.trimpHealth;
			}

			// Fast enemy attack
			if (fast) enemy_hit(enemyAttack);

			// Trimp attack
			if (!armyDead()) {
				ok_spread = saveData.ok_spread;
				var trimpAttack = saveData.atk;
				if (!saveData.unlucky) trimpAttack *= 1 + saveData.range * rng();
				if (saveData.duel) {
					saveData.critChance = 1 - duelPoints / 100;
					if (duelPoints > 50) trimpAttack *= 3;
				}
				if (rng() < saveData.critChance) {
					trimpAttack *= saveData.critDamage;
					trimpCrit = true;
				}
				trimpAttack *= titimp > ticks ? 2 : 1;
				if (saveData.ice > 0) trimpAttack *= 2 - 0.366 ** (ice * saveData.ice);
				if (saveData.weakness) trimpAttack *= 1 - saveData.weakness * Math.min(debuff_stacks, 9);
				if (universe === 2) trimpAttack *= Math.pow(saveData.equalityMult, equality);
				enemyHealth -= trimpAttack + poison * saveData.poison;
				if (saveData.poison) poison += trimpAttack * (saveData.uberNature === 'Poison' ? 2 : 1) * saveData.natureIncrease;
				ice += saveData.natureIncrease;
				if (saveData.plaguebringer && enemyHealth >= 1) plague_damage += trimpAttack * saveData.plaguebringer;
				pbTurns++;
			}

			// Slow enemy attack
			if (!fast && enemyHealth >= 1 && !armyDead()) enemy_hit(enemyAttack);

			// Mayhem poison
			if (saveData.mayhem && mayhemPoison >= 1) trimpHealth -= mayhemPoison;

			if (enemyHealth >= 1) {
				if (saveData.glass) glassStacks++;
				// Gamma Burst
				if (!armyDead() && saveData.gammaMult > 1) {
					gammaStacks++;
					if (gammaStacks >= saveData.gammaCharges) {
						gammaStacks = 0;
						burstDamage = trimpAttack * saveData.gammaMult;
						enemyHealth -= burstDamage;
						if (saveData.plaguebringer && enemyHealth >= 1) plague_damage += burstDamage * saveData.plaguebringer;
					}
				}
			}

			// Bleeds
			if (saveData.bleed) trimpHealth -= saveData.bleed * saveData.trimpHealth;
			if (saveData.plague) trimpHealth -= debuff_stacks * saveData.plague * saveData.trimpHealth;

			//+1 point for crits, +2 points for killing, +5 for oneshots
			if (saveData.duel) {
				if (enemyCrit) duelPoints--;
				if (trimpCrit) duelPoints++;
				//Trimps
				if (trimpHealth < 1) {
					if (turns === 1) duelPoints -= 5;
					else duelPoints -= 2;
				} //Enemy
				if (enemyHealth < 1) {
					if (oneShot) duelPoints += 5;
					else duelPoints += 2;
				}
				duelPoints = Math.min(duelPoints, 100);
				duelPoints = Math.max(duelPoints, 0);
			}

			// Trimp death
			if (armyDead()) {
				ticks += Math.ceil(turns * saveData.speed);
				ticks = Math.max(ticks, last_group_sent + saveData.breed_timer);
				last_group_sent = ticks;
				trimpOverkill = Math.abs(trimpHealth);
				trimpHealth = saveData.trimpHealth;
				energyShield = energyShieldMax;
				mayhemPoison = 0;

				if (saveData.devastation) reduceTrimpHealth(trimpOverkill * 7.5);
				if (saveData.wither && hasWithered) trimpHealth *= 0.5;
				if (saveData.duel && 100 - duelPoints < 20) {
					trimpHealth *= 10;
					energyShield *= 10;
				}
				ticks += 1;
				turns = 1;
				debuff_stacks = 0;
				gammaStacks = 0;
				deaths++;

				//Stop it from getting Infinity glass stacks OR if you die on a shieldbreak challenge/quest
				if (saveData.quest || (saveData.glass && glassStacks >= 10000) || saveData.trapper) ticks = max_ticks;
				//Amp enemy dmg and health by 25% per stack
				if (saveData.nom) {
					enemyAttack *= 1.25;
					enemyHealth = Math.min(enemyHealth + 0.05 * enemy_max_hp, enemy_max_hp);
				}
			}

			//Safety precaution for if you can't kill the enemy fast enough and trimps don't die due to low enemy damage
			if (turns >= 1000) ticks = max_ticks;
			if (titimp > 0) titimp -= saveData.titimpReduction;
		}

		if (saveData.explosion && (saveData.explosion <= 15 || (saveData.trimpBlock >= saveData.trimpHealth && universe !== 2))) trimpHealth -= Math.max(0, saveData.explosion * enemyAttack - saveData.trimpBlock);
		loot++;
		if (saveData.ok_spread > 0) ok_damage = -enemyHealth * saveData.overkill;
		ticks += +(turns > 0) + +(saveData.speed > 9) + Math.ceil(turns * saveData.speed);
		if (saveData.titimp && imp < 0.03) {
			if (titimp < 0) titimp = 0;
			titimp = Math.max(titimp + 30, 45);
		}
		//Handles post death Nature effects.
		if (magma) {
			var increasedBy = pbTurns * saveData.natureIncrease;
			//Wind stacks
			if (saveData.wind > 0) {
				wind = Math.min(wind + increasedBy, saveData.windCap);
				loot += wind * saveData.wind;
				wind = Math.ceil(saveData.transfer * wind) + saveData.natureIncrease + Math.ceil((pbTurns - 1) * increasedBy * saveData.plaguebringer);
				wind = Math.min(wind, saveData.windCap);
			}
			//Poison damage
			if (saveData.poison > 0) poison = Math.ceil(saveData.transfer * poison + plague_damage) + 1;
			//Ice stacks
			if (saveData.ice > 0) ice = Math.ceil(saveData.transfer * ice) + increasedBy + Math.ceil((pbTurns - 1) * saveData.plaguebringer);
		}

		if (saveData.glass) {
			if (zone >= saveData.zone) glassStacks -= 2;
			glassStacks = Math.max(0, glassStacks);
		}
		if (saveData.berserk) {
			//1% heal onkill
			trimpHealth += saveData.trimpHealth / 100;
			if (trimpHealth > saveData.trimpHealth) trimpHealth = saveData.trimpHealth;
		}
		++cell;
		++kills;
		if (cell >= saveData.size) {
			cell = 0;
			plague_damage = 0;
			ok_damage = 0;
			energyShield = energyShieldMax;
		}
	}
	return {
		speed: (loot * 10) / max_ticks,
		equality: equality,
		killSpeed: kills / (max_ticks / 10),
		deaths: deaths
	};
}

//Return info about the best zone for each stance
function get_best(results, fragmentCheck, mapModifiers) {
	let best = { loot: { mapLevel: 0 }, speed: { mapLevel: 0, value: 0, speed: 0, killSpeed: 0 }, lootRatio: 0, speedRatio: 0 };
	if (!game.global.mapsUnlocked) return best;

	let [stats, stances] = results;
	stats = [...stats.slice()];
	//The array can sometimes have maps out of order so got to sort them into the right order at the start
	stats.sort((a, b) => b.mapLevel - a.mapLevel);
	//Check fragment cost of each map and remove them from the check if they can't be afforded.
	if (fragmentCheck) {
		if (!mapModifiers)
			mapModifiers = {
				special: getAvailableSpecials('lmc'),
				biome: getBiome()
			};
		const fragSetting = typeof atSettings !== 'undefined' ? getPageSetting('onlyPerfectMaps') : true;
		for (let i = 0; i <= stats.length - 1; i++) {
			if (fragSetting) {
				if (typeof atSettings !== 'undefined' && findMap(stats[i].mapLevel, mapModifiers.special, mapModifiers.biome, true)) continue;
				if (game.resources.fragments.owned >= mapCost(stats[i].mapLevel, mapModifiers.special, mapModifiers.mapBiome, [9, 9, 9])) break;
			}
			if (!fragSetting) {
				if (typeof atSettings !== 'undefined' && findMap(stats[i].mapLevel, mapModifiers.special, mapModifiers.biome)) continue;
				if (game.resources.fragments.owned >= minMapFrag(stats[i].mapLevel, mapModifiers.special, mapModifiers.mapBiome, [9, 9, 9])) break;
			}
			stats.splice(i, 1);
			i--;
		}
	}

	if (stats.length === 0) return best;
	let statsLoot = [...stats];
	let statsSpeed = [...stats];
	//Find the best speed/loot zone for each stance
	for (let stance of stances) {
		statsLoot.sort((a, b) => b[stance].value - a[stance].value);
		//Find the best speed zone for each stance
		statsSpeed.sort((a, b) => a[stance].killSpeed - b[stance].killSpeed);
	}

	function getBestStats(stats, type) {
		const bestStats = {
			mapLevel: stats[0].mapLevel,
			zone: stats[0].zone,
			value: stats[0][stats[0].stance].value,
			speed: stats[0][stats[0].stance].speed,
			killSpeed: stats[0][stats[0].stance].killSpeed,
			stance: stats[0].stance
		};

		if (game.global.universe === 1) bestStats.stance = stats[0].stance;
		if (game.global.universe === 2) bestStats.equality = stats[0].equality;

		if (stats[1]) {
			bestStats[type + 'Second'] = {
				mapLevel: stats[1].mapLevel,
				zone: stats[1].zone,
				value: stats[1][stats[1].stance].value,
				speed: stats[1][stats[1].stance].speed,
				killSpeed: stats[1][stats[1].stance].killSpeed
			};

			if (game.global.universe === 1) bestStats[type + 'Second'].stance = stats[1].stance;
			if (game.global.universe === 2) bestStats[type + 'Second'].equality = stats[1].equality;

			bestStats[type + 'Ratio'] = stats[0].value / stats[1].value;
		}

		return bestStats;
	}

	//Best zone to farm on for loot
	statsLoot.sort((a, b) => b.value - a.value);
	best.loot = getBestStats(statsLoot, 'loot');

	//Best zone to farm on for speed
	statsSpeed.sort((a, b) => b.killSpeed - a.killSpeed);
	best.speed = getBestStats(statsSpeed, 'speed');

	return best;
}

function _getBiomeEnemyStats(biome) {
	const biomes = {
		Plentiful: [
			[1.3, 0.95, false],
			[0.95, 0.95, true],
			[0.8, 1, false],
			[1.05, 0.8, false],
			[0.6, 1.3, true],
			[1, 1.1, false],
			[0.8, 1.4, false]
		],
		Sea: [
			[0.8, 0.9, true],
			[0.8, 1.1, true],
			[1.4, 1.1, false]
		],
		Mountain: [
			[0.5, 2, false],
			[0.8, 1.4, false],
			[1.15, 1.4, false],
			[1, 0.85, true]
		],
		Forest: [
			[0.75, 1.2, true],
			[1, 0.85, true],
			[1.1, 1.5, false]
		],
		Depths: [
			[1.2, 1.4, false],
			[0.9, 1, true],
			[1.2, 0.7, false],
			[1, 0.8, true]
		]
	};
	biomes.Farmlands = getFarmlandsResType() === 'Metal' ? biomes.Mountain : getFarmlandsResType() === 'Wood' ? biomes.Forest : getFarmlandsResType() === 'Food' ? biomes.Sea : getFarmlandsResType() === 'Gems' ? biomes.Depths : getFarmlandsResType() === 'Any' ? biomes.Plentiful : 'All';

	const baseEnemyBiome = [
		[0.8, 0.7, true],
		[0.9, 1.3, false],
		[0.9, 1.3, false],
		[1, 1, false],
		[1.1, 0.7, false],
		[1.05, 0.8, true],
		[0.9, 1.1, true]
	];
	const enemyBiome = [...baseEnemyBiome, ...biomes[biome]];
	return enemyBiome;
}

//If using standalone version then when loading farmCalc file also load CSS & breedtimer+calc+farmCalcStandalone files.
//After initial load everything should work perfectly.
if (typeof autoTrimpSettings === 'undefined' || (typeof autoTrimpSettings !== 'undefined' && typeof autoTrimpSettings.ATversion !== 'undefined' && !autoTrimpSettings.ATversion.includes('SadAugust'))) {
	let basepathFarmCalc = 'https://sadaugust.github.io/AutoTrimps/';
	//Load CSS so that the UI is visible
	let linkStylesheet = document.createElement('link');
	linkStylesheet.rel = 'stylesheet';
	linkStylesheet.type = 'text/css';
	linkStylesheet.href = basepathFarmCalc + 'css/tabsStandalone.css';
	document.head.appendChild(linkStylesheet);

	function injectScript(id, src) {
		let script = document.createElement('script');
		script.id = id;
		script.src = src;
		script.setAttribute('crossorigin', 'anonymous');
		document.head.appendChild(script);
	}

	injectScript('AutoTrimps-SadAugust_breedtimer', 'https://sadaugust.github.io/AutoTrimps/modules/breedtimer.js');
	injectScript('AutoTrimps-SadAugust_calc', 'https://sadaugust.github.io/AutoTrimps/modules/calc.js');
	injectScript('AutoTrimps-SadAugust_farmCalcStandalone', 'https://sadaugust.github.io/AutoTrimps/modules/farmCalcStandalone.js');

	function updateAdditionalInfo() {
		if (!usingRealTimeOffline) {
			let infoStatus = makeAdditionalInfo();
			if (document.getElementById('additionalInfo').innerHTML !== infoStatus) document.getElementById('additionalInfo').innerHTML = infoStatus;
			document.getElementById('additionalInfo').parentNode.setAttribute('onmouseover', makeAdditionalInfoTooltip(true));
		}
	}

	setInterval(function () {
		updateAdditionalInfo();
	}, 5000);
}
