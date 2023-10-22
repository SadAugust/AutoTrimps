//Setup for non-AT users
if (typeof MODULES === 'undefined') {
	MODULES = {};

	function mastery(name) {
		if (!game.talents[name])
			throw "unknown mastery: " + name;
		return game.talents[name].purchased;
	}
}

if (typeof $$ !== 'function') {
	$$ = function (a) {
		return document.querySelector(a);
	}
	$$$ = function (a) {
		return [].slice.apply(document.querySelectorAll(a));
	};
}

function callAutoMapLevel(currentMap, currentAutoLevel, special, maxLevel, minLevel) {
	if (currentMap === '' || currentAutoLevel === Infinity) {
		if (currentAutoLevel === Infinity) currentAutoLevel = autoMapLevel(special, maxLevel, minLevel);
		if (currentAutoLevel !== Infinity && atSettings.intervals.twoSecond) currentAutoLevel = autoMapLevel(special, maxLevel, minLevel);
	}

	//Increasing Map Level
	if (atSettings.intervals.sixSecond && currentMap !== '' && (autoMapLevel(special, maxLevel, minLevel) > currentAutoLevel)) {
		currentAutoLevel = autoMapLevel(special, maxLevel, minLevel);
	}

	//Decreasing Map Level
	if (atSettings.intervals.sixSecond && currentMap !== '' && (autoMapLevel(special, maxLevel, minLevel, true) < currentAutoLevel)) {
		currentAutoLevel = autoMapLevel(special, maxLevel, minLevel, true);
	}
	return currentAutoLevel
}

function autoMapLevel(special, maxLevel, minLevel, statCheck) {
	if (!game.global.mapsUnlocked) return 0;
	if (maxLevel > 10) maxLevel = 10;
	if (!statCheck) statCheck = false;
	const z = game.global.world;
	if (z + maxLevel < 6) maxLevel = 0 - (z + 6);

	if (challengeActive('Wither') && maxLevel >= 0 && minLevel !== 0) maxLevel = -1;
	if (challengeActive('Insanity') && maxLevel >= 0 && minLevel !== 0) minLevel = 0;

	const isDaily = challengeActive('Daily');
	const hze = getHighestLevelCleared();
	const extraMapLevelsAvailable = game.global.universe === 2 ? hze >= 49 : hze >= 209;
	const haveMapReducer = game.talents.mapLoot.purchased;

	const biome = getBiome();
	const query = !special ? true : false;
	var universeSetting = (z >= 60 && hze >= 180) ? 'S' : game.upgrades.Dominance.done ? 'D' : 'X';
	const cell = game.talents.mapLoot2.purchased ? 20 : 25;
	if (!special) special = getAvailableSpecials('lmc');
	const difficulty = game.global.universe === 2 ? (hze >= 29 ? 0.75 : 1) : (hze > 209 ? 0.75 : hze > 120 ? 0.84 : 1.2);
	var enemyName = 'Snimp';

	var maxLevel = typeof (maxLevel) === 'undefined' || maxLevel === null ? 10 : maxLevel;
	if (maxLevel > 0 && !extraMapLevelsAvailable) maxLevel = 0;
	var minLevel = typeof (minLevel) === 'undefined' || minLevel === null ? 0 - z + 6 : minLevel;
	if (minLevel < (-(game.global.world - 6))) minLevel = -(game.global.world - 6);
	const runningQuest = challengeActive('Quest') && currQuest() === 8;
	const runningUnlucky = challengeActive('Unlucky');
	const runningInsanity = challengeActive('Insanity');
	var ourHealth = calcOurHealth((game.global.universe === 2 ? runningQuest : universeSetting), 'map');
	const ourBlock = game.global.universe === 1 ? calcOurBlock(universeSetting, 'map') : 0;
	const dailyCrit = challengeActive('Daily') && typeof game.global.dailyChallenge.crits !== 'undefined';
	const dailyExplosive = isDaily && typeof game.global.dailyChallenge.explosive !== 'undefined' //Explosive

	if (challengeActive('Insanity') && game.challenges.Insanity.insanity !== game.challenges.Insanity.maxInsanity) {
		ourHealth /= game.challenges.Insanity.getHealthMult();
		ourHealth *= Math.pow(0.99, Math.min(game.challenges.Insanity.insanity + 70, game.challenges.Insanity.maxInsanity));
	}

	var dmgType = runningUnlucky ? 'max' : 'avg';
	var critType = 'maybe';
	var critChance = getPlayerCritChance_AT('map');
	critChance = critChance - Math.floor(critChance);
	if (challengeActive('Wither') || challengeActive('Glass') || challengeActive('Duel') || critChance < 0.1) critType = 'never';

	for (var y = maxLevel; y >= minLevel; y--) {
		var mapLevel = y;
		if (!runningUnlucky) dmgType = mapLevel > 0 ? 'min' : 'avg';
		if (runningInsanity && mapLevel > 0) enemyName = 'Horrimp';
		if (y === minLevel) {
			return minLevel;
		}
		if (!statCheck && getPageSetting('onlyPerfectMaps') && game.resources.fragments.owned < mapCost(mapLevel, special, biome))
			continue;
		if (!statCheck && !getPageSetting('onlyPerfectMaps') && game.resources.fragments.owned < minMapFrag(mapLevel, special, biome))
			continue;

		if (game.global.universe === 2) universeSetting = equalityQuery(enemyName, z + mapLevel, cell, 'map', difficulty, 'oneShot', true);
		var ourDmg = calcOurDmg(dmgType, universeSetting, false, 'map', critType, y, 'force');
		if (challengeActive('Duel')) ourDmg *= MODULES.heirlooms.gammaBurstPct;
		if (challengeActive('Daily') && typeof game.global.dailyChallenge.weakness !== 'undefined') ourDmg *= (1 - (9 * game.global.dailyChallenge.weakness.strength) / 100)
		var enemyHealth = calcEnemyHealthCore('map', z + mapLevel, cell, 'Turtlimp') * difficulty;

		if (maxOneShotPower(true) > 1) {
			enemyHealth *= (maxOneShotPower(true));
			if (game.global.universe === 1) ourDmg *= (0.005 * game.portal.Overkill.level);
			if (game.global.universe === 2 && !u2Mutations.tree.MadMap.purchased) ourDmg *= 0.005;
		}
		var enemyDmg = calcEnemyAttackCore('map', z + mapLevel, cell, enemyName, false, false, universeSetting) * difficulty;

		if (dailyExplosive) enemyDmg *= 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength);
		if (dailyCrit && getPageSetting('IgnoreCrits') === 0) enemyDmg *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);

		if (challengeActive('Duel')) {
			enemyDmg *= 10;
			if (game.challenges.Duel.trimpStacks >= 50) enemyDmg *= 3;
		}

		/* if (y === -6) {
			console.log("universeSetting = " + universeSetting + " y = " + y + " difficulty = " + difficulty + " cell = " + cell + " dmgType = " + dmgType + " critType = " + critType);
			console.log("trimpHP = " + ourHealth + " trimpDmg = " + ourDmg + " trimpBlock = " + ourBlock);
			console.log("enemyHP = " + enemyHealth + " enemyDmg = " + enemyDmg);
		} */
		if (enemyHealth <= ourDmg && enemyDmg <= (ourHealth + ourBlock)) {
			if (!query && mapLevel === 0 && minLevel < 0 && game.global.mapBonus === 10 && haveMapReducer && !challengeActive('Glass') && !challengeActive('Insanity') && !challengeActive('Mayhem'))
				mapLevel = -1;
			return mapLevel;
		}
	}
	return 0;
}

MODULES.zFarm = {};

function populateZFarmData() {
	var imps = 0;
	for (var imp of ['Chronoimp', 'Jestimp', 'Titimp', 'Flutimp', 'Goblimp'])
		imps += game.unlocks.imps[imp];
	//Randimp
	if (game.talents.magimp.purchased) imps++;

	//Misc Run Info
	var zone = game.global.world;
	var nature = game.empowerments[['Poison', 'Wind', 'Ice'][Math.ceil(zone / 5) % 3]];
	var natureStart = 236;
	var diplomacy = mastery('nature2') ? 5 : 0;
	const hze = getHighestLevelCleared() + 1;

	var speed = 10 * 0.95 ** getPerkLevel("Agility");
	if (mastery('hyperspeed')) --speed;
	if (mastery('hyperspeed2') && zone <= Math.ceil(hze / 2)) --speed;
	if (challengeActive('Quagmire')) speed += (game.challenges.Quagmire.getSpeedPenalty() / 100);

	const extraMapLevelsAvailable = game.global.universe === 2 ? hze >= 50 : hze >= 210;
	const haveMapReducer = game.talents.mapLoot.purchased;

	//Challenge Checks
	const runningQuest = challengeActive('Quest') && currQuest() === 8;
	const runningUnlucky = challengeActive('Unlucky');

	//Map Modifiers (for the map we're on)
	const biome = getBiome();
	const perfectMaps = game.global.universe === 2 ? game.stats.highestRadLevel.valueTotal() >= 30 : game.stats.highestLevel.valueTotal() >= 110;

	//Stance & Equality (might need to put this later)
	var stances = 'X';
	if (game.global.universe === 1) {
		if (game.upgrades.Dominance.done) stances = 'D';
		if (hze >= 181 && game.upgrades.Formations.done) stances += 'S';
		//Both D and S stance (the only ones we'd use in maps for farming) have a 50% health penalty. 
		if (stances !== 'X') {
			trimpHealth /= 2;
			trimpBlock /= 2;
		}
	}
	var universeSetting = game.global.universe === 1 ? stances : 0;

	//Trimps Stats
	var dmgType = runningUnlucky ? 'max' : 'min';
	var trimpAttack = calcOurDmg(dmgType, universeSetting, false, 'map', 'never', 0, 'never');
	var trimpHealth = calcOurHealth((game.global.universe === 2 ? runningQuest : 'X'), 'map');
	var trimpBlock = game.global.universe === 1 ? calcOurBlock('X', 'map') : 0;
	var trimpShield = game.global.universe === 2 ? calcOurHealth(true, 'map') : 0;
	trimpHealth -= trimpShield;

	//Gamma Burst
	var gammaMult = MODULES.heirlooms.gammaBurstPct;
	var gammaCharges = gammaMaxStacks();

	//Heirloom + Crit Chance
	const customShield = heirloomShieldToEquip('map');
	var critChance = getPlayerCritChance_AT(customShield);
	var critDamage = getPlayerCritDamageMult_AT(customShield) - 1;

	//Base crit multiplier
	var megaCD = 5;
	if (Fluffy.isRewardActive('megaCrit')) megaCD += 2;
	if (mastery('crit')) megaCD += 1;

	//Trimp max & min damage ranges
	var minFluct = 0.8 + (0.02 * game.portal.Range.level);
	var maxFluct = 1.2;

	//Enemy Stats
	var enemyHealth = 1;
	var enemyAttack = 1;

	//Overkill stuff - Accounts for Mad Mapper in U2.
	var overkillRange = Math.max(0, maxOneShotPower(true) - 1);
	var overkillDamage = game.portal.Overkill.level * 0.005;
	if (game.global.universe === 2) {
		if (u2Mutations.tree.MadMap.purchased) overkillDamage = 1;
		else if (canU2OverkillAT(zone)) overkillDamage = 0.005;
		else overkillDamage = 0;
	}

	if (challengeActive('Insanity') && game.challenges.Insanity.insanity !== game.challenges.Insanity.maxInsanity) {
		trimpHealth /= game.challenges.Insanity.getHealthMult();
		trimpHealth *= Math.pow(0.99, Math.min(game.challenges.Insanity.insanity + 70, game.challenges.Insanity.maxInsanity));
	}

	//Check if we have a fast enemy
	//Fast Enemy conditions
	var fastEnemy = challengeActive('Desolation');
	if (runningQuest) fastEnemy = true;
	else if (challengeActive('Archaeology')) fastEnemy = true;
	else if (challengeActive('Trappapalooza')) fastEnemy = true;
	else if (challengeActive('Exterminate')) fastEnemy = false;
	else if (challengeActive('Glass')) fastEnemy = true;
	else if (challengeActive('Berserk') && game.challenges.Berserk.weakened !== 20) fastEnemy = true;
	else if (challengeActive('Duel') && game.challenges.Duel.enemyStacks < 10) fastEnemy = true;
	else if (challengeActive('Revenge')) fastEnemy = true;

	death_stuff = {
		max_hp: trimpHealth,
		block: trimpBlock,
		challenge_attack: 1,
		enemy_cd: 1,
		breed_timer: breedTotalTime().toNumber(),
		weakness: 0,
		plague: 0,
		bleed: 0,
		explosion: 0,
		nom: challengeActive('Nom'),
		fastEnemies: fastEnemy,
		magma: game.global.universe === 1 && zone >= 230,
	}
	if (game.global.universe === 1) {
		if (challengeActive('Discipline')) {
			minFluct = 0.005;
			maxFluct = 1.995;
		}
		if (challengeActive('Balance')) {
			enemyHealth *= 2;
			enemyAttack *= 2.35;
		}
		if (challengeActive('Meditate')) {
			enemyHealth *= 2;
			enemyAttack *= 1.5;
		}
		if (challengeActive('Electricity')) {
			death_stuff.weakness = 0.1;
			death_stuff.plague = 0.1;
		}
		if (challengeActive('Daily')) {
			var daily = (mod) => game.global.dailyChallenge[mod] ? game.global.dailyChallenge[mod].strength : 0;
			minFluct -= daily('minDamage') ? 0.09 + 0.01 * daily('minDamage') : 0;
			maxFluct += daily('maxDamage');

			death_stuff.plague = 0.01 * daily('plague');
			death_stuff.bleed = 0.01 * daily('bogged');
			death_stuff.weakness = 0.01 * daily('weakness');
			death_stuff.enemy_cd = 1 + 0.5 * daily('crits');
			death_stuff.explosion = daily('explosive');
		}
		if (challengeActive('Life')) {
			enemyHealth *= 11;
			enemyAttack *= 6;
			trimpAttack *= 1 + (0.1 * game.challenges.Life.stacks);
			death_stuff.max_hp *= 1 + (0.1 * game.challenges.Life.stacks);
		}
		if (challengeActive('Crushed') && death_stuff.max_hp < death_stuff.block) {
			death_stuff.enemy_cd = 5;
		}
		if (challengeActive('Nom')) {
			death_stuff.bleed = 0.05;
		}
		if (challengeActive('Toxicity')) {
			enemyHealth *= 2;
			enemyAttack *= 5;
			death_stuff.bleed = 0.05;
		}
		if (challengeActive('Watch')) {
			enemyAttack *= 1.25;
		}
		if (challengeActive('Lead')) {
			enemyHealth *= 1 + 0.04 * game.challenges.Lead.stacks;
			enemyAttack *= 1 + 0.04 * game.challenges.Lead.stacks;
			death_stuff.bleed = Math.min(game.challenges.Lead.stacks, 200) * 0.0003;
		}
		if (challengeActive('Corrupted')) {
			// Corruption scaling doesn’t apply to normal maps below Corrupted’s endpoint
			enemyAttack *= 3;
		}
		if (challengeActive('Obliterated')) {
			enemyHealth *= 1e12 * 10 ** Math.floor(zone / 10);
			enemyAttack *= 1e12 * 10 ** Math.floor(zone / 10);
		}
		if (challengeActive('Eradicated')) {
			enemyHealth *= 1e20 * 3 ** Math.floor(zone / 2);
			enemyAttack *= 1e20 * 3 ** Math.floor(zone / 2);
			natureStart = 1;
			death_stuff.magma = true;
		}
		if (challengeActive('Frigid')) {
			enemyHealth *= game.challenges.Frigid.getEnemyMult();
			enemyAttack *= game.challenges.Frigid.getEnemyMult();
		}
		if (challengeActive('Experience')) {
			enemyHealth *= game.challenges.Experience.getEnemyMult();
			enemyAttack *= game.challenges.Experience.getEnemyMult();
		}
	}

	if (game.global.universe === 2) {
		natureStart = 9990;
		if (challengeActive('Unlucky')) {
			minFluct = 0.005;
			maxFluct = 1.995;
		}
		if (challengeActive('Unbalance')) {
			enemyHealth *= 2;
			enemyAttack *= 1.5
		}
		if (challengeActive('Duel')) {
			death_stuff.enemy_cd = 10;
		}
		if (challengeActive('Wither')) {
			enemyHealth *= game.challenges.Wither.getTrimpHealthMult();
			enemyAttack *= game.challenges.Wither.getEnemyAttackMult();
		}
		if (challengeActive('Quest')) {
			enemyHealth *= game.challenges.Quest.getHealthMult();
		}
		if (challengeActive('Quagmire')) {
			var exhaustedStacks = game.challenges.Quagmire.exhaustedStacks;
			var mod = 0.05;
			if (exhaustedStacks === 0) enemyAttack *= 1;
			else if (exhaustedStacks < 0) enemyAttack *= Math.pow((1 + mod), Math.abs(exhaustedStacks));
			else enemyAttack *= Math.pow((1 - mod), exhaustedStacks);
		}
		if (challengeActive('Revenge')) {
			if (game.global.world % 2 === 0) enemyHealth *= 10;
		}
		if (challengeActive('Archaeology')) {
			enemyAttack *= game.challenges.Archaeology.getStatMult('enemyAttack');
		}
		if (challengeActive('Mayhem')) {
			enemyHealth *= game.challenges.Mayhem.getEnemyMult();
			enemyAttack *= game.challenges.Mayhem.getEnemyMult();
		}
		if (challengeActive('Berserk')) {
			enemyHealth *= 1.5;
			enemyAttack *= 1.5;
		}
		if (challengeActive('Exterminate')) {
			enemyHealth *= game.challenges.Exterminate.getSwarmMult();
		}
		if (challengeActive('Nurture')) {
			enemyHealth *= 10;
			enemyHealth *= game.buildings.Laboratory.getEnemyMult();
			enemyAttack *= 2
			enemyAttack *= game.buildings.Laboratory.getEnemyMult();
		}
		if (challengeActive('Pandemonium')) {
			enemyHealth *= game.challenges.Pandemonium.getPandMult();
			enemyAttack *= game.challenges.Pandemonium.getPandMult();
		}
		if (challengeActive('Desolation')) {
			enemyHealth *= game.challenges.Desolation.getEnemyMult();
			enemyAttack *= game.challenges.Desolation.getEnemyMult();
		}
		if (challengeActive('Alchemy')) {
			enemyHealth *= alchObj.getEnemyStats(false, false) + 1;
		}
		if (challengeActive('Hypothermia')) {
			enemyHealth *= game.challenges.Hypothermia.getEnemyMult();
			enemyAttack *= game.challenges.Hypothermia.getEnemyMult();
		}
		if (challengeActive('Glass')) {
			enemyHealth *= game.challenges.Glass.healthMult();
			//Attack mult factored in later in the simulation function
		}
	}

	// Handle megacrits
	critDamage = critChance >= 1 ? (megaCD - 1) * 100 : critDamage;

	var exoticChance = 3;
	if (Fluffy.isRewardActive("exotic")) exoticChance += 0.5;
	if (game.permaBoneBonuses.exotic.owned > 0) exoticChance += game.permaBoneBonuses.exotic.addChance();
	exoticChance /= 100;

	natureTransfer = (zone >= natureStart ? nature.retainLevel + diplomacy : 0) / 100;
	nature = zone >= natureStart ? nature.level + diplomacy : 0;
	death_stuff.challenge_attack = enemyAttack;

	return {
		//Base Info
		hze: hze,
		speed: speed,
		zone: zone,

		//Extra Map Info
		extraMapLevelsAvailable: extraMapLevelsAvailable,
		reducer: haveMapReducer,
		perfectMaps: perfectMaps,
		biome: MODULES.zFarm.biomes.All.concat(MODULES.zFarm.biomes[biome]()),
		fragments: game.resources.fragments.owned,

		difficulty: prettify((perfectMaps ? 75 : 80) + (challengeActive('Mapocalypse') ? 300 : 0)) / 100,
		size: mastery('mapLoot2') ? 20 : perfectMaps ? 25 : 27,

		//Nature
		poison: 0, wind: 0, ice: 0,
		[['poison', 'wind', 'ice'][Math.ceil(zone / 5) % 3]]: nature / 100,

		//Trimp Stats
		dmgType: dmgType,
		attack: trimpAttack,
		trimpHealth: trimpHealth,
		trimpBlock: trimpBlock,
		trimpShield: trimpShield,

		//Misc Trimp Stats
		critChance: critChance % 1,
		critDamage: critDamage,
		gammaCharges: gammaCharges,
		gammaMult: gammaMult,
		range: maxFluct / minFluct,
		rangeMin: minFluct,
		rangeMax: maxFluct,
		plaguebringer: getHeirloomBonus_AT('Shield', 'plaguebringer', customShield) * 0.01,
		equalityMult: getPlayerEqualityMult_AT(customShield),

		//Enemy Stats
		challenge: enemyHealth,
		enemyAttack: enemyAttack,
		fluctuation: game.global.universe === 2 ? 1.5 : 1.2,

		//Misc
		imports: imps,
		import_percent: exoticChance,
		import_chance: imps * exoticChance,
		transfer: natureTransfer,
		ok_spread: overkillRange,
		overkill: overkillDamage,
		stances: stances,
		titimp: game.unlocks.imps.Titimp,
		coordinate: challengeActive('Coordinate'),
		challenge_health: enemyHealth,
		challenge_attack: enemyAttack,
		mapPerfect: getPageSetting('onlyPerfectMaps'),
		mapSpecial: getAvailableSpecials('lmc'),
		mapBiome: biome,

		//Death Info
		...death_stuff
	}
}

// Return a list of efficiency stats for all sensible zones
function stats() {

	var saveData = populateZFarmData();

	var stats = [];
	extra = 0;
	if (saveData.extraMapLevelsAvailable)
		extra = 10;
	extra = extra || -saveData.reducer;
	mapsCanAfford = 0;
	for (var mapLevel = saveData.zone + extra; mapLevel >= 6; --mapLevel) {
		if (saveData.coordinate) {
			var coords = 1;
			for (var z = 1; z < mapLevel; ++z)
				coords = Math.ceil(1.25 * coords);
			saveData.challenge_health = coords;
			saveData.challenge_attack = coords;
		}
		var tmp = zone_stats(mapLevel, saveData.stances, saveData);
		if (tmp.value < 1 && mapLevel >= saveData.zone) {
			continue;
		}
		if (tmp.canAfford)
			mapsCanAfford++;

		//Want to guarantee at least 6 results here so that we don't accidentally miss a good map to farm on
		if (stats.length && mapsCanAfford >= 6 && tmp.value < 0.804 * stats[0].value && mapLevel < saveData.zone - 3) {
			break;
		}
		stats.unshift(tmp);
		if (tmp.zone === 'z6') break;
	}

	return [stats, saveData.stances];
}

// Return efficiency stats for the given zone
function zone_stats(zone, stances, saveData) {
	var result = {
		mapLevel: zone - saveData.zone,
		zone: 'z' + zone,
		value: 0,
		stance: '',
		loot: 100 * (zone < saveData.zone ? 0.8 ** (saveData.zone - saveData.reducer - zone) : 1.1 ** (zone - saveData.zone)),
		canAfford: true,
	};

	if (!findMap(zone - saveData.zone, saveData.mapSpecial, saveData.mapBiome)) {
		if (saveData.mapPerfect)
			result.canAfford = saveData.fragments >= mapCost(zone - saveData.zone, saveData.mapSpecial, saveData.mapBiome, [9, 9, 9]);
		else
			result.canAfford = saveData.fragments >= minMapFrag(zone - saveData.zone, saveData.mapSpecial, saveData.mapBiome, [9, 9, 9]);
	}
	stanceCheck = stances;
	if (!stances) stances = 'X';
	for (var stance of stances) {
		saveData.atk = saveData.attack * (stance == 'D' ? 4 : stance == 'X' ? 1 : 0.5);
		if (mastery('bionic2') && zone > saveData.zone)
			saveData.atk *= 1.5;
		var simulationResults = simulate(saveData, zone, stance);
		var speed = simulationResults.speed;
		var value = speed * result.loot * (stance == 'S' ? 2 : 1);
		var equality = simulationResults.equality;
		result[stance] = {
			speed,
			value,
			equality
		};

		if (value > result.value) {
			result.value = value;
			result.stance = stance;
			result.equality = equality;
		}
	}

	return result;
}

// Simulate farming at the given zone for a fixed time, and return the number cells cleared.
function simulate(saveData, zone) {
	var trimp_hp = saveData.trimpHealth;
	var debuff_stacks = 0;
	var titimp = 0;
	var cell = 0;
	var loot = 0;
	var last_group_sent = 0;
	var ticks = 0;
	var plague_damage = 0;
	var ok_damage = 0, ok_spread = 0;
	var poison = 0, wind = 0, ice = 0;
	var gammaStacks = 0;
	var energyShieldMax = saveData.trimpShield;
	var energyShield = energyShieldMax;
	var mayhemPoison = 0;
	var glassStacks = game.challenges.Glass.shards;
	var trimpOverkill = 0;
	var duelPoints = game.challenges.Duel.trimpStacks;

	var oneShot = true;
	const angelic = mastery('angelic');
	const runningDevastation = challengeActive('Devastation') || challengeActive('Revenge');
	const runningDomination = challengeActive('Domination');
	const runningFrigid = challengeActive('Frigid');

	const runningUnlucky = challengeActive('Unlucky');
	const runningDuel = challengeActive('Duel');
	const runningWither = challengeActive('Wither');
	var hasWithered = false;
	const runningMayhem = challengeActive('Mayhem');
	const runningBerserk = challengeActive('Berserk');
	const runningGlass = challengeActive('Glass');
	const runningDesolation = challengeActive('Desolation');

	/* MUST SETUP LIST
	Duel - Check if health calcs automatically apply the x10 HP when below 20 stacks. If it does then divide health and shield by 10 if we go intho this with 20 or less stacks
	All other challenges done
	Now to set this up inside AT
	*/

	var equality = 1;
	if (game.global.universe === 2) {
		var enemyName = 'Snimp';
		if (challengeActive('Insanity')) enemyName = 'Horrimp';
		equality = equalityQuery(enemyName, zone, saveData.size, 'map', saveData.difficulty);
	}
	var biomeImps = saveData.biome;
	const max_ticks = atSettings.loops.atTimeLapseFastLoop ? 21600 : 86400; // Six hours simulation inside of TW and a day
	var hp_array = []
	var atk_array = [];
	for (var i = 0; i < saveData.size; ++i) {
		var hp = calcEnemyBaseHealth('map', zone, (cell + 1), 'Chimp');
		if (saveData.magma)
			hp *= calcCorruptionScale(saveData.zone, 10) / 2;

		var atk = calcEnemyBaseAttack('map', zone, (cell + 1), 'Chimp');
		if (saveData.magma)
			atk *= calcCorruptionScale(zone, 3) / 2;

		cell++;
		if (runningDomination) {
			if (cell === saveData.size) {
				atk *= 2.5;
				hp *= 7.5;
			} else {
				atk *= 0.1;
				hp *= 0.1;
			}
		}
		atk_array.push(saveData.difficulty * saveData.challenge_attack * atk);
		hp_array.push(saveData.difficulty * saveData.challenge_health * hp);
	}

	function reduceTrimpHealth(amt, directHit) {
		if (runningMayhem) mayhemPoison += (amt * .2);
		if (!directHit && game.global.universe === 2) {
			var initialShield = energyShield;
			energyShield -= amt;
			if (energyShield > 0) return;
			else amt -= initialShield;
		}
		if (!directHit && game.global.universe === 1) {
			amt -= saveData.block;
		}

		if (runningFrigid && amt >= (saveData.trimpHealth / 5)) {
			amt = saveData.trimpHealth;
		}

		trimp_hp -= Math.max(0, amt);
	}

	function enemy_hit(atk) {
		var damage = atk;
		//Damage fluctations
		damage *= (saveData.fluctuation * rng());
		//Enemy crit chance
		var enemyCC = 0.25;
		if (runningDuel) {
			enemyCC = duelPoints / 100;
			if (duelPoints < 50) damage *= 3;
		}
		if (rng() < enemyCC) {
			damage *= saveData.enemy_cd;
			enemyCrit = true;
		}
		//Ice modifier
		damage *= 0.366 ** (ice * saveData.ice);
		damage *= Math.pow(0.9, equality);
		reduceTrimpHealth(damage);
		++debuff_stacks;
	}

	cell = 0;
	while (ticks < max_ticks) {
		var imp = rng();
		var imp_stats = imp < saveData.import_chance ? [1, 1, false] : biomeImps[Math.floor(rng() * biomeImps.length)];
		var atk = imp_stats[0] * atk_array[cell];
		var hp = imp_stats[1] * hp_array[cell];
		var enemy_max_hp = hp;
		var fast = saveData.fastEnemies || (imp_stats[2] && !saveData.nom) || runningDesolation;
		var trimpCrit = false;
		var enemyCrit = false;
		trimpOverkill = 0;
		//Add in the mult from glass stacks as they need to be adjusted every enemy
		if (runningGlass)
			atk *= Math.pow(2, Math.floor(glassStacks / 100)) * (100 + glassStacks);

		if (ok_spread !== 0) {
			hp -= ok_damage;
			--ok_spread;
		}
		hp = Math.min(hp, Math.max(enemy_max_hp * 0.05, hp - plague_damage));
		plague_damage = 0;
		energyShield = energyShieldMax;
		var turns = 0;
		if (runningDuel && duelPoints > 80) {
			hp *= 10;
		}
		while (hp >= 1 && ticks < max_ticks) {
			++turns;
			trimpCrit = false
			enemyCrit = false;
			//Check for if we didn't kill the enemy last turn
			if (hp !== enemy_max_hp) {
				oneShot = false;
				if (runningWither) {
					hp = Math.max(enemy_max_hp, hp + (enemy_max_hp * .25));
					if (hp === enemy_max_hp) {
						hasWithered = true;
						trimp_hp = 0;
					}
				}
				if (runningGlass) {
					atk /= Math.pow(2, Math.floor(glassStacks / 100)) * (100 + glassStacks);
					glassStacks++;
					atk *= Math.pow(2, Math.floor(glassStacks / 100)) * (100 + glassStacks);
				}
			}
			else {
				oneShot = true;
			}

			if (angelic && !runningBerserk) {
				trimp_hp += (saveData.trimpHealth / 2);
				if (trimp_hp > saveData.trimpHealth) trimp_hp = saveData.trimpHealth;
			}
			// Fast enemy attack
			if (fast)
				enemy_hit(atk);

			// Trimp attack
			if (trimp_hp >= 1) {
				ok_spread = saveData.ok_spread;
				var damage = saveData.atk;
				if (!runningUnlucky) damage *= (1 + saveData.range * rng())
				if (runningDuel) {
					saveData.critChance = 1 - (duelPoints / 100);
					if (duelPoints > 50) damage *= 3;
				}
				if (rng() < saveData.critChance) {
					damage *= saveData.critDamage;
					trimpCrit = true;
				}
				damage *= titimp > ticks ? 2 : 1;
				damage *= 2 - 0.366 ** (ice * saveData.ice);
				damage *= 1 - saveData.weakness * Math.min(debuff_stacks, 9);
				damage *= Math.pow(saveData.equalityMult, equality);
				hp -= damage + poison * saveData.poison;
				poison += damage;
				++ice;
				if (saveData.plaguebringer && hp >= 1)
					plague_damage += damage * saveData.plaguebringer;
			}

			// Slow enemy attack
			if (!fast && hp >= 1 && trimp_hp >= 1)
				enemy_hit(atk);

			// Mayhem poison
			if (runningMayhem && mayhemPoison >= 1)
				trimp_hp -= mayhemPoison;

			if (hp >= 1) {
				if (runningGlass) glassStacks++;
				// Gamma Burst
				if (trimp_hp >= 1 && saveData.gammaMult > 1) {
					gammaStacks++;
					if (gammaStacks >= saveData.gammaCharges) {
						gammaStacks = 0;
						burstDamage = damage * saveData.gammaMult;
						hp -= burstDamage;
						if (saveData.plaguebringer && hp >= 1)
							plague_damage += (burstDamage * saveData.plaguebringer);
					}
				}
			}

			// Bleeds
			trimp_hp -= saveData.bleed * saveData.max_hp;
			trimp_hp -= debuff_stacks * saveData.plague * saveData.max_hp;

			//+1 point for crits, +2 points for killing, +5 for oneshots
			if (runningDuel) {
				if (enemyCrit) duelPoints--;
				if (trimpCrit) duelPoints++;
				//Trimps
				if (trimp_hp < 1) {
					if (turns === 1) duelPoints -= 5;
					else duelPoints -= 2;
				} //Enemy
				if (hp < 1) {
					if (oneShot) duelPoints += 5;
					else duelPoints += 2;
				}
				duelPoints = Math.min(duelPoints, 100);
				duelPoints = Math.max(duelPoints, 0);
			}

			// Trimp death
			if (trimp_hp < 1) {
				ticks += Math.ceil(turns * saveData.speed);
				ticks = Math.max(ticks, last_group_sent + saveData.breed_timer);
				last_group_sent = ticks;
				trimpOverkill = Math.abs(trimp_hp);
				trimp_hp = saveData.max_hp;
				energyShield = energyShieldMax;
				mayhemPoison = 0;

				if (runningDevastation) reduceTrimpHealth(trimpOverkill * 7.5);
				if (runningWither && hasWithered) trimp_hp *= 0.5;
				if (runningDuel && 100 - duelPoints < 20) {
					trimp_hp *= 10;
					energyShield *= 10;
				}
				ticks += 1;
				turns = 1;
				debuff_stacks = 0;
				gammaStacks = 0;

				if (saveData.nom) {
					atk *= 1.25;
					hp = Math.min(hp + 0.05 * enemy_max_hp, enemy_max_hp);
				}
			}
		}
		if (saveData.explosion && (saveData.explosion <= 15 || saveData.block >= saveData.max_hp))
			trimp_hp -= Math.max(0, saveData.explosion * atk - saveData.block);

		wind = Math.min(wind + turns, 200);
		loot += 1 + wind * saveData.wind;
		if (saveData.ok_spread > 0) ok_damage = -hp * saveData.overkill;
		ticks += +(turns > 0) + +(saveData.speed > 9) + Math.ceil(turns * saveData.speed);
		if (saveData.titimp && imp < 0.03)
			titimp = Math.min(Math.max(ticks, titimp) + 300, ticks + 450);

		poison = Math.ceil(saveData.transfer * poison + plague_damage) + 1;
		wind = Math.ceil(saveData.transfer * wind) + 1 + Math.ceil((turns - 1) * saveData.plaguebringer);
		ice = Math.ceil(saveData.transfer * ice) + 1 + Math.ceil((turns - 1) * saveData.plaguebringer);

		if (runningGlass && zone >= saveData.zone) glassStacks -= 2;
		if (angelic && !runningBerserk) { //Angelic talent heal
			trimp_hp += (saveData.trimpHealth / 2);
			if (trimp_hp > saveData.trimpHealth) trimp_hp = saveData.trimpHealth;
		}
		if (runningBerserk) { //1% heal onkill
			trimp_hp += (saveData.trimpHealth / 100);
			if (trimp_hp > saveData.trimpHealth) trimp_hp = saveData.trimpHealth;
		}
		++cell;
		if (cell == saveData.size) {
			cell = 0;
			plague_damage = 0;
			ok_damage = 0;
			energyShield = energyShieldMax;
		}
	}
	return {
		speed: loot * 10 / max_ticks,
		equality: equality,
	}
}

// Return info about the best zone for each stance
function get_best(results, fragmentCheck) {
	var best = { overall: { mapLevel: 0, }, ratio: 0, speed: { mapLevel: 0, value: 0, speed: 0, } }
	if (!game.global.mapsUnlocked) return best;

	var [stats, stances] = results;
	stats.slice();

	if (fragmentCheck) {
		for (var i = stats.length - 1; i >= 0; i--) {
			if (stats[i].canAfford) continue;
			stats.pop();
		}
	}
	var statsSpeed = stats;
	if (stats.length === 0) return best;
	best.stances = {};
	best.stancesSpeed = {};
	if (!stances) stances = 'X';
	for (var stance of stances) {
		//Find the best zone for each stance
		stats.sort((a, b) => b[stance].value - a[stance].value);
		best.stances[stance] = stats[0].zone;

		//Find the fastest zone for each stance - Useful for map bonus etc
		statsSpeed.sort((a, b) => b[stance].speed - a[stance].speed);
		best.stancesSpeed[stance] = statsSpeed[0].zone;
		if (statsSpeed[0][stance].speed >= best.speed.speed && statsSpeed[0][stance].value >= best.speed.value) {
			best.speed = {
				mapLevel: statsSpeed[0].mapLevel,
				zone: statsSpeed[0].zone,
				value: statsSpeed[0][statsSpeed[0].stance].value,
				speed: statsSpeed[0][statsSpeed[0].stance].speed,
			}
			if (game.global.universe === 1) best.speed.stance = statsSpeed[0].stance;
			if (game.global.universe === 2) best.speed.equality = statsSpeed[0].equality;
		}
	}

	stats.sort((a, b) => b.value - a.value);
	//Best zone to farm on for loot
	best.overall = {
		mapLevel: stats[0].mapLevel,
		zone: stats[0].zone,
		value: stats[0][stats[0].stance].value,
		speed: stats[0][stats[0].stance].speed,
	};
	if (game.global.universe === 1) best.overall.stance = stats[0].stance;
	if (game.global.universe === 2) best.overall.equality = stats[0].equality;
	//Second best zone to farm on for loot
	if (stats[1]) {
		best.second = {
			mapLevel: stats[1].mapLevel,
			zone: stats[1].zone,
			value: stats[1][stats[1].stance].value,
			speed: stats[1][stats[1].stance].speed,
		};
		if (game.global.universe === 1) best.second.stance = stats[1].stance;
		if (game.global.universe === 2) best.second.equality = stats[1].equality;
		best.ratio = stats[0].value / stats[1].value;
	}

	return best;
}

MODULES.zFarm.biomes = {
	All: [
		[0.8, 0.7, true],
		[0.9, 1.3, false],
		[0.9, 1.3, false],
		[1, 1, false],
		[1.1, 0.7, false],
		[1.05, 0.8, true],
		[0.9, 1.1, true],
	],
	Plentiful: function () {
		return [
			[1.3, 0.95, false],
			[0.95, 0.95, true],
			[0.8, 1, false],
			[1.05, 0.8, false],
			[0.6, 1.3, true],
			[1, 1.1, false],
			[0.8, 1.4, false],
		]
	}
	,
	Sea: function () {
		return [
			[0.8, 0.9, true],
			[0.8, 1.1, true],
			[1.4, 1.1, false],
		]
	},
	Mountain: function () {
		return [
			[0.5, 2, false],
			[0.8, 1.4, false],
			[1.15, 1.4, false],
			[1, 0.85, true],
		]
	},
	Forest: function () {
		return [
			[0.75, 1.2, true],
			[1, 0.85, true],
			[1.1, 1.5, false],
		]
	},
	Depths: function () {
		return [
			[1.2, 1.4, false],
			[0.9, 1, true],
			[1.2, 0.7, false],
			[1, 0.8, true],
		]
	},
	Farmlands: function () {
		const biome = getFarmlandsResType() === "Metal" ? "Mountain" :
			getFarmlandsResType() === "Wood" ? "Forest" :
				getFarmlandsResType() === "Food" ? "Sea" :
					getFarmlandsResType() === "Gems" ? "Depths" :
						getFarmlandsResType() === "Any" ? "Plentiful" :
							"All";
		return MODULES.zFarm.biomes[biome]();
	}
};

MODULES.zFarm.seed = 42;
MODULES.zFarm.rand_mult = 2 ** -31;

function rng() {
	MODULES.zFarm.seed ^= MODULES.zFarm.seed >> 11;
	MODULES.zFarm.seed ^= MODULES.zFarm.seed << 8;
	MODULES.zFarm.seed ^= MODULES.zFarm.seed >> 19;
	return MODULES.zFarm.seed * MODULES.zFarm.rand_mult;
}