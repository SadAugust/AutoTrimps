//Setup for non-AT users
if (typeof MODULES === 'undefined') {
	MODULES = {};
}

/* 
Changes to do to optimise for Balance

1) Health mult increase when not in maps. Assume that we are 1 shotting every cell and increase the health mult by 1% for every cell we clear (30s for TW otherwise 5s).
	- Does overkilling cells give a stack for each enemy killed?
2) Health mult decrease during maps in simulate section of code so that it accounts for harder initial start to the map but easier time the more that it clears it.
	- This could be problematic as it simulates 8/24 hours of map time and we're probably only going to be doing 1-20 maps so probably not worth implementing
3) Implement a enoughHealth check into autoMaps when selecting the appropriate map
	- Only do this for relevant challenges that have a health multiplier. Balance, Life, Wither, Berserk, maybe Alchemy?
	- This might be best getting implemented into the callAutoMapLevel function but not sure atm
	- Should it be min or max enemy dmg for maps?
	- Could be unnecessary with #1 being setup. Need to test
4) Have semi started a difficulty check already but if you can't survive the optimal map then it should probably force refresh autolevel2 calcs and try again 
	- This is super resource intensive so best to avoid if possible
*/

function mastery(name) {
	if (!game.talents[name]) throw 'unknown mastery: ' + name;
	return game.talents[name].purchased;
}

function populateFarmCalcData() {
	let imps = 0;
	for (let imp of ['Chronoimp', 'Jestimp', 'Titimp', 'Flutimp', 'Goblimp']) imps += game.unlocks.imps[imp];

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
	const shieldBreak = challengeActive('Bublé') || getCurrentQuest() === 8;
	const runningDuel = challengeActive('Duel');

	//Map Modifiers (for the map we're on)
	const biome = getBiome();
	const perfectMaps = typeof atSettings !== 'undefined' ? trimpStats.perfectMaps && getPageSetting('onlyPerfectMaps') : universe === 2 ? game.stats.highestRadLevel.valueTotal() >= 30 : game.stats.highestLevel.valueTotal() >= 110;
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
	let trimpHealth = calcOurHealth(universe === 2 ? shieldBreak : 'X', 'map');
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

	if (challengeActive('Insanity') && game.challenges.Insanity.insanity !== game.challenges.Insanity.maxInsanity) {
		trimpHealth /= game.challenges.Insanity.getHealthMult();
		trimpHealth *= Math.pow(0.99, Math.min(game.challenges.Insanity.insanity + 70, game.challenges.Insanity.maxInsanity));
	}

	//Check if we have a fast enemy
	//Fast Enemy conditions
	let fastEnemy = challengeActive('Desolation');
	if (shieldBreak) fastEnemy = true;
	else if (challengeActive('Revenge')) fastEnemy = true;
	else if (challengeActive('Trappapalooza')) fastEnemy = true;
	else if (challengeActive('Archaeology')) fastEnemy = true;
	else if (challengeActive('Berserk') && game.challenges.Berserk.weakened !== 20) fastEnemy = true;
	else if (challengeActive('Exterminate')) fastEnemy = false;
	else if (challengeActive('Glass')) fastEnemy = true;
	else if (universe === 2 && getPerkLevel('Frenzy') > 0 && !autoBattle.oneTimers.Mass_Hysteria.owned) fastEnemy = true;

	const death_stuff = {
		enemy_cd: 1,
		breed_timer: _breedTotalTime(),
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

			/* const balance = game.challenges.Balance;
			if (balance.balanceStacks < 250) {
				const healthMult = Math.pow(0.99, Math.min(250, balance.balanceStacks + 50));
				trimpHealth /= balance.getHealthMult();
				trimpHealth *= healthMult;
			} */
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

	const uberEmpowerment = getUberEmpowerment();
	const empowerment = getEmpowerment();

	return {
		//Base Info
		universe: universe,
		speed: speed,
		zone: zone,
		maxTicks: maxTicks,
		//Extra Map Info
		extraMapLevelsAvailable: extraMapLevelsAvailable,
		reducer: haveMapReducer,
		biome: _getBiomeEnemyStats(biome),
		fragments: game.resources.fragments.owned,
		mapSpecial: getAvailableSpecials('lmc'),
		mapBiome: biome,

		difficulty: game.resources.fragments.owned < mapCost() && game.jobs.Explorer.locked ? 1.1 : ((perfectMaps ? 75 : 84) + (challengeActive('Mapocalypse') ? 300 : 0)) / 100,
		size: mastery('mapLoot2') ? (perfectMaps ? 23 : 20) : perfectMaps ? 25 : 27,

		//Nature
		poison: 0,
		wind: 0,
		ice: 0,
		windCap: uberEmpowerment === 'Wind' ? 300 : 200,
		natureIncrease: 1 * (uberEmpowerment === empowerment && game.global.uberNature !== 'Poison' ? 2 : 1) * plaguebrought,
		[['poison', 'wind', 'ice'][Math.ceil(zone / 5) % 3]]: nature / 100,
		uberNature: uberEmpowerment,
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
		range: maxFluct / minFluct - 1,
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
		shieldBreak: shieldBreak,
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
	let extra = saveData.extraMapLevelsAvailable ? 10 : saveData.reducer ? -1 : 0;
	let mapsCanAffordPerfect = 0;
	let coords = 1;

	if (saveData.coordinate) {
		for (let z = 1; z < saveData.zone + extra + 1; ++z) {
			coords = Math.ceil(1.25 * coords);
		}
	}

	for (let mapLevel = saveData.zone + extra; mapLevel >= 6; --mapLevel) {
		if (saveData.coordinate) {
			coords = Math.ceil(coords / 1.25);
			saveData.challenge_health = coords;
			saveData.challenge_attack = coords;
		}

		let tmp = zone_stats(mapLevel, saveData.stances, saveData, lootFunction);
		if (tmp.zone !== 'z6') {
			if (tmp.value < 1 && mapLevel >= saveData.zone) continue;
			if (tmp.canAffordPerfect) mapsCanAffordPerfect++;
			if (stats.length && ((mapsCanAffordPerfect >= 6 && tmp.value < 0.804 * stats[0].value && mapLevel < saveData.zone - 3) || stats.length >= 25)) break;
		}
		stats.unshift(tmp);
		if (tmp.zone === 'z6') break;
	}

	return [stats, saveData.stances];
}

function lootDefault(zone, saveData) {
	return 100 * (zone < saveData.zone ? 0.8 ** (saveData.zone - saveData.reducer - zone) : 1.1 ** (zone - saveData.zone));
}

function lootDestack(zone, saveData) {
	return zone < saveData.zone ? 0 : zone - saveData.zone + 1;
}

//Return efficiency stats for the given zone
function zone_stats(zone, stances = 'X', saveData, lootFunction = lootDefault) {
	const mapLevel = zone - saveData.zone;
	const bionic2Multiplier = mastery('bionic2') && zone > saveData.zone ? 1.5 : 1;
	const loot = lootFunction(zone, saveData);
	const result = {
		mapLevel,
		zone: `z${zone}`,
		value: 0,
		killSpeed: 0,
		stance: 'X',
		loot,
		canAffordPerfect: saveData.fragments >= mapCost(mapLevel, saveData.mapSpecial, saveData.mapBiome, [9, 9, 9])
	};

	//Loop through all stances to identify which stance is best for farming
	for (let stance of stances) {
		const attackMultiplier = stance === 'D' ? 4 : stance === 'X' ? 1 : 0.5;
		const lootMultiplier = stance === 'S' ? 2 : 1;
		saveData.atk = saveData.attack * attackMultiplier * bionic2Multiplier;

		const { speed, equality, killSpeed } = simulate(saveData, zone);
		const value = speed * loot * lootMultiplier;
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
	let ok_damage = 0,
		ok_spread = 0;
	let poison = 0,
		wind = 0,
		ice = 0;
	let gammaStacks = 0,
		burstDamage = 0;
	const energyShieldMax = saveData.trimpShield;
	let mayhemPoison = 0;
	let duelPoints = game.challenges.Duel.trimpStacks;
	let glassStacks = game.challenges.Glass.shards;
	let universe = saveData.universe;
	let magma = saveData.magma;
	let hasWithered = false;
	let equality = 1;
	let trimpCrit = false;
	let enemyCrit = false;
	let enemyCC = 0.25;

	let kills = 0;
	let deaths = 0;
	let initialShield;

	let seed = Math.floor(Math.random(40, 50) * 100);
	const rand_mult = 4.656612873077393e-10;

	function rng() {
		seed ^= seed >> 11;
		seed ^= seed << 8;
		seed ^= seed >> 19;
		return seed * rand_mult;
	}

	let difficulty = saveData.difficulty;
	let mapSize = saveData.size;

	if (typeof atSettings !== 'undefined') {
		simulateMap = _simulateSliders(zone, saveData.special, saveData.mapBiome);
		mapOwned = findMap(zone, saveData.special, saveData.mapBiome);
		if (!mapOwned) mapOwned = findMap(zone, simulateMap.special, simulateMap.biome, simulateMap.perfect);
		if (mapOwned) {
			const map = game.global.mapsOwnedArray[getMapIndex(mapOwned)];
			difficulty = map.difficulty;
			mapSize = map.size;
		} else {
			difficulty = getMapMinMax('difficulty', simulateMap.sliders.difficulty)[1];
			mapSize = getMapMinMax('size', simulateMap.sliders.size)[1];
		}
	}

	function armyDead() {
		if (saveData.shieldBreak) return energyShield <= 0;
		return trimpHealth <= 0;
	}

	const biomeImps = saveData.biome;

	if (universe === 2) {
		const enemyName = saveData.insanity ? 'Horrimp' : 'Snimp';
		if (saveData.insanity) biomeImps.push([15, 60, true]);
		equality = equalityQuery(enemyName, zone, mapSize, 'map', difficulty);
	}
	const equalityPower = Math.pow(0.9, equality);

	//Six hours of simulation inside of TW and a day outside of it.
	const max_ticks = saveData.maxTicks;
	const corruptionScale = saveData.magma ? calcCorruptionScale(zone, 10) : 1;

	const calculateEnemyStats = (zone, cell, enemyType, saveData) => {
		let enemyHealth = calcEnemyBaseHealth('map', zone, cell + 1, enemyType);
		let enemyAttack = calcEnemyBaseAttack('map', zone, cell + 1, enemyType);

		if (saveData.magma) {
			enemyHealth *= corruptionScale / 2;
			enemyAttack *= corruptionScale / 2;
		}

		if (saveData.domination) {
			const modifier = cell === mapSize ? 2.5 : 0.1;
			enemyAttack *= modifier;
			enemyHealth *= modifier;
		}

		return {
			attack: difficulty * saveData.challenge_attack * enemyAttack,
			health: difficulty * saveData.challenge_health * enemyHealth
		};
	};

	const mapArray = Array.from({ length: mapSize }, (_, cell) => calculateEnemyStats(zone, cell, 'Chimp', saveData));

	function reduceTrimpHealth(amt, directHit) {
		if (saveData.mayhem) mayhemPoison += amt * 0.2;

		if (!directHit) {
			if (universe === 2) {
				initialShield = energyShield;
				energyShield = Math.max(0, energyShield - amt);
				amt = Math.max(0, amt - initialShield);
			} else if (universe === 1) {
				amt = Math.max(0, amt - saveData.trimpBlock);
			}
		}

		if (saveData.frigid && amt >= saveData.trimpHealth / 5) amt = saveData.trimpHealth;

		trimpHealth = Math.max(0, trimpHealth - amt);
	}

	function enemy_hit(enemyAttack, rngRoll) {
		enemyAttack *= 1 + saveData.fluctuation * (2 * rngRoll - 1);

		if (saveData.duel) {
			enemyCC = 1 - duelPoints / 100;
			if (duelPoints < 50) enemyAttack *= 3;
		}

		if (rngRoll < enemyCC) {
			enemyAttack *= saveData.enemy_cd;
			enemyCrit = true;
		}

		const iceValue = saveData.ice;
		if (iceValue > 0) enemyAttack *= 0.366 ** (ice * iceValue);
		if (universe === 2 && equality > 0) enemyAttack *= equalityPower;

		if (enemyAttack > 0) reduceTrimpHealth(Math.max(0, enemyAttack));
		++debuff_stacks;
	}

	cell = 0;
	while (ticks < max_ticks) {
		let rngRoll = rng();
		const imp = rngRoll;
		const imp_stats = imp < saveData.import_chance ? [1, 1, false] : biomeImps[Math.floor(rngRoll * biomeImps.length)];
		let enemyAttack = imp_stats[0] * mapArray[cell].attack;
		let enemyHealth = imp_stats[1] * mapArray[cell].health;
		const enemy_max_hp = enemyHealth;
		const fast = saveData.fastEnemies || (imp_stats[2] && !saveData.nom) || saveData.desolation || (saveData.duel && duelPoints > 90);

		let turns = 0;
		let pbTurns = 0;

		let oneShot = true;
		let trimpOverkill = 0;

		if (ok_spread !== 0) {
			enemyHealth -= ok_damage;
			--ok_spread;
		}

		let plague_damage = 0;
		enemyHealth = Math.min(enemyHealth, Math.max(enemy_max_hp * 0.05, enemyHealth - plague_damage));
		let energyShield = energyShieldMax;

		if (saveData.glass) enemyAttack *= Math.pow(2, Math.floor(glassStacks / 100)) * (100 + glassStacks);
		if (saveData.duel && duelPoints > 80) enemyHealth *= 10;

		while (enemyHealth >= 1 && ticks < max_ticks) {
			++turns;
			rngRoll = turns > 0 ? rng() : rngRoll;
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
			} else {
				oneShot = true;
			}

			if (saveData.angelic && !saveData.berserk) {
				trimpHealth += saveData.trimpHealth / 2;
				if (trimpHealth > saveData.trimpHealth) trimpHealth = saveData.trimpHealth;
			}

			if (fast) enemy_hit(enemyAttack, rngRoll);

			// Trimp attack
			if (!armyDead()) {
				ok_spread = saveData.ok_spread;
				var trimpAttack = saveData.atk;
				if (!saveData.unlucky) trimpAttack *= 1 + saveData.range * rngRoll;
				if (saveData.duel) {
					saveData.critChance = 1 - duelPoints / 100;
					if (duelPoints > 50) trimpAttack *= 3;
				}
				if (rngRoll < saveData.critChance) {
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

			if (!fast && enemyHealth >= 1 && !armyDead()) enemy_hit(enemyAttack);

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

			if (saveData.bleed) trimpHealth -= saveData.bleed * saveData.trimpHealth;
			if (saveData.plague) trimpHealth -= debuff_stacks * saveData.plague * saveData.trimpHealth;

			if (saveData.duel) {
				// +1 point for crits, +2 points for killing, +5 for oneshots
				duelPoints -= enemyCrit;
				duelPoints += trimpCrit;

				if (trimpHealth < 1) duelPoints -= turns === 1 ? 5 : 2;
				if (enemyHealth < 1) duelPoints += oneShot ? 5 : 2;

				duelPoints = duelPoints > 100 ? 100 : duelPoints;
				duelPoints = duelPoints < 0 ? 0 : duelPoints;
			}

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

				if (saveData.shieldBreak || (saveData.glass && glassStacks >= 10000) || saveData.trapper) ticks = max_ticks;
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
			const increasedBy = pbTurns * saveData.natureIncrease;
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
			trimpHealth += saveData.trimpHealth / 100;
			if (trimpHealth > saveData.trimpHealth) trimpHealth = saveData.trimpHealth;
		}
		++cell;
		++kills;
		if (cell >= mapSize) {
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
		if (!mapModifiers) {
			mapModifiers = {
				special: getAvailableSpecials('lmc'),
				biome: getBiome()
			};
		}

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
			bestStats[`${type}Second`] = {
				mapLevel: stats[1].mapLevel,
				zone: stats[1].zone,
				value: stats[1][stats[1].stance].value,
				speed: stats[1][stats[1].stance].speed,
				killSpeed: stats[1][stats[1].stance].killSpeed
			};

			if (game.global.universe === 1) bestStats[`${type}Second`].stance = stats[1].stance;
			if (game.global.universe === 2) bestStats[`${type}Second`].equality = stats[1].equality;

			bestStats.ratio = stats[0].value / stats[1].value;
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
		const script = document.createElement('script');
		script.id = id;
		script.src = src;
		script.setAttribute('crossorigin', 'anonymous');
		document.head.appendChild(script);
	}

	injectScript('AutoTrimps-SadAugust_breedtimer', 'https://sadaugust.github.io/AutoTrimps/modules/breedtimer.js');
	injectScript('AutoTrimps-SadAugust_calc', 'https://sadaugust.github.io/AutoTrimps/modules/calc.js');
	injectScript('AutoTrimps-SadAugust_farmCalcStandalone', 'https://sadaugust.github.io/AutoTrimps/mods/farmCalcStandalone.js');

	function updateAdditionalInfo() {
		if (!usingRealTimeOffline) {
			const infoElem = document.getElementById('additionalInfo');
			const infoStatus = makeAdditionalInfo();
			if (infoElem.innerHTML !== infoStatus) infoElem.innerHTML = infoStatus;
			infoElem.parentNode.setAttribute('onmouseover', makeAdditionalInfoTooltip(true));
		}
	}

	setInterval(function () {
		updateAdditionalInfo();
	}, 15000);
}
