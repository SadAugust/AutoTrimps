//Setup for non-AT users
if (typeof MODULES === 'undefined') {
	MODULES = {};
}

function mastery(name) {
	if (!game.talents[name]) throw 'unknown mastery: ' + name;
	return game.talents[name].purchased;
}

function combatSpeed(hze = getHighestLevelCleared() + 1) {
	let speed = 10 * 0.95 ** getPerkLevel('Agility');
	if (mastery('hyperspeed')) --speed;
	if (mastery('hyperspeed2') && game.global.world <= Math.ceil(hze / 2)) --speed;
	if (challengeActive('Quagmire')) speed += game.challenges.Quagmire.getSpeedPenalty() / 100;

	return speed;
}

function populateFarmCalcData() {
	const runningAutoTrimps = typeof atSettings !== 'undefined';

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

	const uberEmpowerment = getUberEmpowerment();
	const empowerment = getEmpowerment();

	let speed = combatSpeed(hze);

	//Challenge Checks
	const runningUnlucky = challengeActive('Unlucky');
	const shieldBreak = challengeActive('Bublé') || getCurrentQuest() === 8;
	const runningDuel = challengeActive('Duel');

	//Map Modifiers (for the map we're on)
	const biome = getBiome();
	const perfectMaps = runningAutoTrimps ? trimpStats.perfectMaps && getPageSetting('onlyPerfectMaps') : universe === 2 ? game.stats.highestRadLevel.valueTotal() >= 30 : game.stats.highestLevel.valueTotal() >= 110;
	const extraMapLevelsAvailable = game.global.universe === 2 ? hze >= 50 : hze >= 210;
	const haveMapReducer = game.talents.mapLoot.purchased;
	// Six hours simulation inside of TW and a day outside of it.
	const maxTicks = runningAutoTrimps && atSettings.loops.atTimeLapseFastLoop ? 21600 : 86400;

	//Stance & Equality
	let stances = 'X';
	let universeSetting = universe === 1 ? stances : 0;
	//Trimps Stats
	const dmgType = runningUnlucky ? 'max' : 'min';

	let trimpAttack = calcOurDmg(dmgType, universeSetting, false, 'map', 'never', 0);
	let trimpHealth = calcOurHealth(universe === 2 ? shieldBreak : 'X', 'map');
	let trimpBlock = universe === 1 ? calcOurBlock('X', false, 'map') : 0;
	let trimpShield = universe === 2 ? calcOurHealth(true, 'map') : 0;
	trimpHealth -= trimpShield;

	if (universe === 1 && game.upgrades.Formations.done) {
		if (game.upgrades.Dominance.done) stances = 'D';

		if (runningAutoTrimps ? getPageSetting('autoLevelScryer') : true) {
			if (game.global.uberNature === 'Wind' && empowerment !== 'Wind') stances += 'W';
			else if (hze >= 181) stances += 'S';
		}
	}

	const gammaMult = runningAutoTrimps ? MODULES.heirlooms.gammaBurstPct : game.global.gammaMult || 1;
	const gammaCharges = gammaMaxStacks(false, false, 'map');

	//Heirloom + Crit Chance
	const customShield = runningAutoTrimps ? heirloomShieldToEquip('map') : null;
	let critChance = runningAutoTrimps ? getPlayerCritChance_AT(customShield) : getPlayerCritChance();
	let critDamage = runningAutoTrimps ? getPlayerCritDamageMult_AT(customShield) - 1 : getPlayerCritDamageMult() - 1;

	//Base crit multiplier
	let megaCD = 5;
	if (Fluffy.isRewardActive('megaCrit')) megaCD += 2;
	if (mastery('crit')) megaCD += 1;
	// Handle megacrits
	critDamage = critChance >= 1 ? megaCD : critDamage;

	//Trimp max & min damage ranges
	let minFluct = 0.8 + 0.02 * getPerkLevel('Range');
	let maxFluct = 1.2;

	//Overkill - Accounts for Mad Mapper in U2.
	const overkillRange = Math.max(0, maxOneShotPower(true) - 1);
	let overkillDamage = getPerkLevel('Overkill') * 0.005;
	if (universe === 2) {
		if (u2Mutations.tree.MadMap.purchased) overkillDamage = 1;
		else if (canU2OverkillAT(zone)) overkillDamage = 0.005;
		else overkillDamage = 0;
	}

	if (challengeActive('Insanity') && game.challenges.Insanity.insanity !== game.challenges.Insanity.maxInsanity) {
		trimpHealth /= game.challenges.Insanity.getHealthMult();
		trimpHealth *= Math.pow(0.99, Math.min(game.challenges.Insanity.insanity + 70, game.challenges.Insanity.maxInsanity));
	}

	const frenzyLevel = getPerkLevel('Frenzy');
	const permaFrenzy = autoBattle.oneTimers.Mass_Hysteria.owned;
	const checkFrenzy = frenzyLevel > 0 && !permaFrenzy && !challengeActive('Berserk');
	const frenzyMult = 1 + 0.5 * frenzyLevel;
	const frenzyDuration = permaFrenzy ? Infinity : 5 * frenzyLevel;
	const frenzyChance = frenzyLevel;
	if (checkFrenzy && runningAutoTrimps && getPageSetting('frenzyCalc')) trimpAttack /= frenzyMult;

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
	else if (checkFrenzy) fastEnemy = true;

	const death_stuff = {
		enemy_cd: 1,
		breed_timer: _breedTotalTime(),
		weakness: 0,
		plague: 0,
		bleed: 0,
		explosion: 0,
		rampage: 1,
		nom: challengeActive('Nom'),
		fastEnemies: fastEnemy,
		magma: challengeActive('Eradicated') || (game.global.universe === 1 && zone >= 230)
	};

	const antiTime = game.jobs.Amalgamator.owned > 0 ? (game.talents.patience.purchased ? 45 : 30) : death_stuff.breed_timer;
	const antiBonus = _getAnticipationBonus();
	const antiBonusCurr = _getAnticipationBonus(undefined, false, antiTime);

	if (antiBonus !== antiBonusCurr) {
		const ratio = antiBonusCurr / antiBonus;
		trimpAttack *= ratio;
	}

	let enemyHealth = 1;
	let enemyAttack = 1;

	const challengeEffects = {
		Discipline: () => {
			minFluct = 0.005;
			maxFluct = 1.995;
		},
		Balance: () => {
			enemyHealth *= 2;
			enemyAttack *= 2.35;

			if (!game.global.mapsActive && !game.global.preMapsActive && runningAutoTrimps) {
				const balance = game.challenges.Balance;
				if (balance.balanceStacks < 250) {
					const timer = atSettings.loops.atTimeLapseFastLoop ? 30 : 5;
					const cellsCleared = Math.floor(overkillRange / (Math.ceil(speed) / 10)) * timer;

					const healthMult = Math.pow(0.99, Math.min(250, balance.balanceStacks + cellsCleared));
					trimpHealth /= balance.getHealthMult();
					trimpHealth *= healthMult;
				}
			}
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

		if (typeof game.global.dailyChallenge.rampage !== 'undefined' && (game.global.mapsActive || game.global.preMapsActive)) {
			death_stuff.rampage = _getRampageBonus();
			trimpAttack *= death_stuff.rampage;
		}
	}

	const special = getAvailableSpecials('lmc');
	const specialTime = getSpecialTime(special);

	return {
		//Base Info
		universe,
		speed,
		zone,
		maxTicks,
		//Map Info
		extraMapLevelsAvailable,
		reducer: haveMapReducer,
		biome: _getBiomeEnemyStats(biome),
		fragments: game.resources.fragments.owned,
		special,
		specialTime,
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
		//Frenzy
		checkFrenzy,
		frenzyDuration,
		frenzyMult,
		frenzyChance,
		//Trimp Stats
		attack: Math.floor(trimpAttack),
		trimpHealth: Math.floor(trimpHealth),
		trimpBlock: Math.floor(trimpBlock),
		trimpShield: Math.floor(trimpShield),
		//Misc Trimp Stats
		critChance: critChance % 1,
		critDamage: critDamage,
		gammaCharges: gammaCharges,
		gammaMult,
		range: maxFluct / minFluct - 1,
		plaguebringer: (plaguebrought === 2 ? 0.5 : 0) + (runningAutoTrimps ? getHeirloomBonus_AT('Shield', 'plaguebringer', customShield) * 0.01 : getHeirloomBonus('Shield', 'plaguebringer') * 0.01),
		equalityMult: game.global.universe === 2 ? (runningAutoTrimps ? getPlayerEqualityMult_AT(customShield) : game.portal.Equality.getModifier(true)) : 1,
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

		...death_stuff
	};
}

//Return a list of efficiency stats for all sensible zones
function stats(lootFunction = lootDefault) {
	const saveData = populateFarmCalcData();
	const maxMaps = lootFunction === lootDestack ? 11 : 25;
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

		const simulateMap = _simulateSliders(mapLevel, saveData.special, saveData.mapBiome);
		let mapOwned = findMap(mapLevel - game.global.world, saveData.special, saveData.mapBiome);
		if (!mapOwned) mapOwned = findMap(mapLevel - game.global.world, simulateMap.special, simulateMap.location, simulateMap.perfect);

		if (mapOwned) {
			const map = game.global.mapsOwnedArray[getMapIndex(mapOwned)];
			saveData.difficulty = Number(map.difficulty);
			saveData.size = Number(map.size);
			saveData.lootMult = Number(map.loot);
		} else {
			saveData.difficulty = Number(simulateMap.difficulty);
			saveData.size = Number(simulateMap.size);
			saveData.lootMult = Number(simulateMap.loot);
			saveData.special = simulateMap.special;

			const { level, special, location, perfect, sliders } = simulateMap;
			const { difficulty, size, loot } = sliders;
			const fragCost = mapCost(level - game.global.world, special, location, [loot, size, difficulty], perfect);
			if (fragCost > game.resources.fragments.owned) continue;
		}

		let tmp = zone_stats(mapLevel, saveData, lootFunction);

		if (mapLevel !== 6) {
			if (tmp.value < 1 && mapLevel >= saveData.zone) continue;
			if (tmp.canAffordPerfect) mapsCanAffordPerfect++;
			if (stats.length && ((mapsCanAffordPerfect >= 6 && tmp.value < 0.804 * stats[0].value && mapLevel < saveData.zone - 3) || stats.length >= maxMaps)) {
				break;
			}
		}

		stats.unshift(tmp);
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
function zone_stats(zone, saveData, lootFunction = lootDefault) {
	const mapLevel = zone - saveData.zone;
	const bionic2Multiplier = mastery('bionic2') && zone > saveData.zone ? 1.5 : 1;
	let loot = lootFunction(zone, saveData);

	const result = {
		mapLevel,
		zone: `z${zone}`,
		value: 0,
		killSpeed: 0,
		stance: 'X',
		loot,
		canAffordPerfect: saveData.fragments >= mapCost(mapLevel, saveData.special, saveData.mapBiome, [9, 9, 9])
	};

	const [mapGrid, equality] = _simulateMapGrid(saveData, zone);
	saveData.mapGrid = mapGrid;
	saveData.equality = equality;

	const stances = saveData.stances;
	const enemyStats = mapGrid[mapGrid.length - 1];
	const enemyEqualityModifier = equality > 0 ? Math.pow(0.9, equality) : 1;

	//Loop through all stances to identify which stance is best for farming
	for (let stance of stances) {
		const attackMultiplier = stance === 'D' ? 4 : ['X', 'W'].includes(stance) ? 1 : 0.5;
		const lootMultiplier = ['S', 'W'].includes(stance) ? 2 : 1;
		saveData.block = ['X', 'W'].includes(stance) ? saveData.trimpBlock : saveData.trimpBlock / 2;
		saveData.health = ['X', 'W'].includes(stance) ? saveData.trimpHealth : saveData.trimpHealth / 2;
		saveData.atk = saveData.attack * attackMultiplier * bionic2Multiplier;

		let enemyAttack = enemyStats.attack * (1 + saveData.fluctuation) * enemyEqualityModifier;

		if (saveData.universe === 2) {
			enemyAttack = enemyAttack - saveData.trimpShield;
		} else if (saveData.universe === 1) {
			enemyAttack = enemyAttack - saveData.block;
		}

		if (enemyAttack > saveData.health) return result;

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

function _simulateMapGrid(saveData = populateFarmCalcData(), zone = game.global.world) {
	const { size, difficulty, mapBiome } = saveData;
	const corruptionScaleAttack = saveData.magma ? calcCorruptionScale(zone, 3) / 2 : 1;
	const corruptionScaleHealth = saveData.magma ? calcCorruptionScale(zone, 10) / 2 : 1;
	let equality = 0;

	if (saveData.universe === 2) {
		const farmlandsType = getFarmlandsResType();
		let enemyName = 'Penguimp';

		if (saveData.insanity && zone > game.global.world) {
			enemyName = 'Horrimp';
		} else if (['Gardens', 'Sea'].includes(mapBiome) || (mapBiome === 'Farmlands' && ['Gardens', 'Sea'].includes(farmlandsType))) {
			enemyName = 'Flowimp';
		} else if (mapBiome === 'Depths' || (mapBiome === 'Farmlands' && farmlandsType === 'Any')) {
			enemyName = 'Moltimp';
		}

		equality = equalityQuery(enemyName, zone, size, 'map', difficulty);
	}

	const calculateEnemyStats = (zone, cell, enemyName, saveData) => {
		let enemyHealth = calcEnemyBaseHealth('map', zone, cell + 1, enemyName);
		let enemyAttack = calcEnemyBaseAttack('map', zone, cell + 1, enemyName);

		const domMod = saveData.domination ? (cell === size ? 2.5 : 0.1) : 1;

		return {
			attack: enemyAttack * difficulty * saveData.challenge_attack * domMod * corruptionScaleAttack,
			health: enemyHealth * difficulty * saveData.challenge_health * domMod * corruptionScaleHealth
		};
	};

	return [Array.from({ length: size }, (_, cell) => calculateEnemyStats(zone, cell, 'Chimp', saveData)), equality];
}

//Simulate farming at the given zone for a fixed time, and return the number cells cleared.
function simulate(saveData, zone) {
	const { maxTicks, universe, mapGrid, biome, block, equality, size, special, lootMult, magma, checkFrenzy } = saveData;

	let cell = 0;
	let loot = 0;
	let ticks = 0;

	let ok_damage = 0,
		ok_spread = 0,
		shattered = false;

	let poison = 0,
		wind = 0,
		ice = 0;

	/* Challenge Variables */
	let duelPoints = game.challenges.Duel.trimpStacks;
	let hasWithered = false;
	let mayhemPoison = 0;
	let glassStacks = game.challenges.Glass.shards;

	let gammaStacks = 0;
	let frenzyRefresh = true;
	let frenzyLeft = 0;

	let trimpCrit = false;
	let enemyCrit = false;
	let enemyCC = 0.25;

	let kills = 0;
	let deaths = 0;
	let last_group_sent = 0;
	let debuff_stacks = 0;
	let titimp = 0;

	let trimpAttack = 0;
	let trimpHealth = saveData.health;
	const energyShieldMax = saveData.trimpShield;
	let energyShield = energyShieldMax;

	const trimpEqualityMult = Math.pow(saveData.equalityMult, equality);
	const enemyEqualityMult = Math.pow(0.9, equality);

	if (saveData.insanity && zone > game.global.world) biome.push([15, 60, true]);
	const specialTime = getSpecialTime(special);
	let cacheLoot = (27 * game.unlocks.imps.Jestimp + 15 * game.unlocks.imps.Chronoimp + 1 * specialTime) * lootMult;

	let seed = Math.floor(Math.random(40, 50) * 100);
	const rand_mult = 4.656612873077393e-10;

	function rng() {
		seed ^= seed >> 11;
		seed ^= seed << 8;
		seed ^= seed >> 19;
		if (seed === 0) seed = Math.floor(Math.random(40, 50) * 100);
		return seed * rand_mult;
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
		if (universe === 2 && equality > 0) enemyAttack *= enemyEqualityMult;

		if (enemyAttack > 0) reduceTrimpHealth(enemyAttack);
		++debuff_stacks;
	}

	function reduceTrimpHealth(amt) {
		if (saveData.mayhem) mayhemPoison += amt * 0.2;

		if (universe === 2) {
			const initialShield = energyShield;
			energyShield = Math.max(0, energyShield - amt);
			amt = Math.max(0, amt - initialShield);
		} else if (universe === 1) {
			amt = Math.max(0, amt - block);
		}

		if (saveData.frigid && amt >= saveData.health / 5) amt = saveData.health;
		trimpHealth = Math.max(0, trimpHealth - amt);
	}

	function armyDead() {
		if (saveData.shieldBreak) return energyShield <= 0;
		return trimpHealth <= 0;
	}

	while (ticks < maxTicks) {
		rngRoll = rng();
		const imp = rngRoll;
		const imp_stats = imp < saveData.import_chance ? [1, 1, false] : biome[Math.floor(rngRoll * biome.length)];
		const fast = saveData.fastEnemies || (imp_stats[2] && !saveData.nom) || saveData.desolation || (saveData.duel && duelPoints > 90);

		enemyAttack = imp_stats[0] * mapGrid[cell].attack;
		enemyHealth = imp_stats[1] * mapGrid[cell].health;
		let enemy_max_hp = enemyHealth;

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
		energyShield = energyShieldMax;

		if (saveData.glass) enemyAttack *= Math.pow(2, Math.floor(glassStacks / 100)) * (100 + glassStacks);
		if (saveData.duel && duelPoints > 80) enemyHealth *= 10;

		while (enemyHealth >= 1 && ticks < maxTicks) {
			++turns;
			rngRoll = turns > 0 ? rng() : rngRoll;
			let attacked = false;
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
				trimpHealth += saveData.health / 2;
				if (trimpHealth > saveData.health) trimpHealth = saveData.health;
			}

			if (fast) enemy_hit(enemyAttack, rngRoll);

			// trimp attack
			if (!armyDead()) {
				attacked = true;
				ok_spread = saveData.ok_spread;
				trimpAttack = saveData.atk;
				if (!saveData.unlucky) trimpAttack *= 1 + saveData.range * rngRoll;
				if (frenzyLeft > 0) trimpAttack *= saveData.frenzyMult;
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
				if (universe === 2 && equality > 0) trimpAttack *= trimpEqualityMult;
				enemyHealth -= trimpAttack + poison * saveData.poison;
				if (saveData.poison) poison += trimpAttack * (saveData.uberNature === 'Poison' ? 2 : 1) * saveData.natureIncrease;
				if (saveData.plaguebringer && enemyHealth >= 1) plague_damage += trimpAttack * saveData.plaguebringer;
				pbTurns++;

				if (checkFrenzy && (frenzyLeft < 0 || (frenzyRefresh && frenzyLeft < saveData.frenzyDuration / 2))) {
					const roll = Math.floor(Math.random() * 1000);

					if (roll < saveData.frenzyChance) {
						frenzyLeft = saveData.frenzyDuration;
						frenzyRefresh = true;
					}
				}
			}

			if (!fast && enemyHealth >= 1 && !armyDead()) enemy_hit(enemyAttack, rngRoll);

			if (saveData.mayhem && mayhemPoison >= 1) trimpHealth -= mayhemPoison;

			if (enemyHealth >= 1) {
				if (saveData.glass) glassStacks++;

				if (!armyDead() && saveData.gammaMult > 1) {
					gammaStacks++;

					if (gammaStacks >= saveData.gammaCharges) {
						gammaStacks = 0;
						const burstDamage = trimpAttack * saveData.gammaMult;
						enemyHealth -= burstDamage;
						if (saveData.plaguebringer && enemyHealth >= 1) plague_damage += burstDamage * saveData.plaguebringer;
					}
				}
			}

			if (attacked) {
				ice += saveData.natureIncrease;
				if (saveData.uberNature === 'Ice' && saveData.ice > 0 && ice > 20 && enemyHealth / enemy_max_hp < 0.5) {
					shattered = true;
					enemyHealth = 0;
				}
			}

			if (saveData.bleed) trimpHealth -= saveData.bleed * saveData.health;
			if (saveData.plague) trimpHealth -= debuff_stacks * saveData.plague * saveData.health;

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
				trimpHealth = saveData.health;
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
				if (deaths === 0) saveData.atk /= saveData.rampage;
				gammaStacks = 0;
				frenzyLeft /= 2;
				frenzyRefresh = false;
				deaths++;

				if (saveData.shieldBreak || (saveData.glass && glassStacks >= 10000) || saveData.trapper) ticks = maxTicks;
				//Amp enemy dmg and health by 25% per stack
				if (saveData.nom) {
					enemyAttack *= 1.25;
					enemyHealth = Math.min(enemyHealth + 0.05 * enemy_max_hp, enemy_max_hp);
				}
			}

			//Safety precaution for if you can't kill the enemy fast enough and trimps don't die due to low enemy damage
			if (turns >= 1000) ticks = maxTicks;
			if (titimp > 0) titimp -= saveData.titimpReduction;
			frenzyLeft -= saveData.speed / 10;
		}

		if (saveData.explosion && (saveData.explosion <= 15 || (block >= saveData.health && universe !== 2))) {
			trimpHealth -= Math.max(0, saveData.explosion * enemyAttack - block);

			if (armyDead()) {
				ticks += Math.ceil(turns * saveData.speed);
				ticks = Math.max(ticks, last_group_sent + saveData.breed_timer);
				last_group_sent = ticks;
				trimpOverkill = Math.abs(trimpHealth);
				trimpHealth = saveData.health;
				energyShield = energyShieldMax;

				ticks += 1;
				turns = 1;
				debuff_stacks = 0;
				if (deaths === 0) saveData.atk /= saveData.rampage;
				gammaStacks = 0;
				frenzyLeft /= 2;
				frenzyRefresh = false;
				deaths++;

				if (saveData.shieldBreak || (saveData.glass && glassStacks >= 10000) || saveData.trapper) ticks = maxTicks;
				//Amp enemy dmg and health by 25% per stack
				if (saveData.nom) {
					enemyAttack *= 1.25;
					enemyHealth = Math.min(enemyHealth + 0.05 * enemy_max_hp, enemy_max_hp);
				}
			}
		}

		loot++;
		if (saveData.ok_spread > 0) {
			ok_damage = -enemyHealth * saveData.overkill;
			if (shattered) ok_damage = Infinity;
			shattered = false;
		}

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
			trimpHealth += saveData.health / 100;
			if (trimpHealth > saveData.health) trimpHealth = saveData.health;
		}

		++cell;
		++kills;

		if (cell >= size) {
			cell = 0;
			plague_damage = 0;
			ok_damage = 0;
			energyShield = energyShieldMax;
			if (wind > 0) loot += wind * saveData.wind * cacheLoot;
			else loot += cacheLoot;
		}
	}

	return {
		speed: (loot * 10) / maxTicks,
		equality,
		killSpeed: kills / (maxTicks / 10),
		deaths,
		special
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

		const forcePerfect = typeof atSettings !== 'undefined' && getPageSetting('onlyPerfectMaps');
		const fragments = game.resources.fragments.owned;
		for (let i = 0; i <= stats.length - 1; i++) {
			if (findMap(stats[i].mapLevel, mapModifiers.special, mapModifiers.biome, forcePerfect)) continue;

			if (forcePerfect) {
				if (fragments >= mapCost(stats[i].mapLevel, mapModifiers.special, mapModifiers.mapBiome, [9, 9, 9])) break;
			} else {
				const simulatedSliders = _simulateSliders(stats[i].mapLevel + game.global.world, mapModifiers.special, mapModifiers.biome);
				const { loot, size, difficulty } = simulatedSliders.sliders;
				if (fragments >= mapCost(simulatedSliders.mapLevel, simulatedSliders.special, simulatedSliders.location, [loot, size, difficulty], simulatedSliders.perfect)) break;
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
		const bestMapData = stats[0];
		const bestStats = {
			mapLevel: bestMapData.mapLevel,
			zone: bestMapData.zone,
			value: bestMapData[bestMapData.stance].value,
			speed: bestMapData[bestMapData.stance].speed,
			killSpeed: bestMapData[bestMapData.stance].killSpeed,
			stance: bestMapData.stance
		};

		if (game.global.universe === 2) bestStats.equality = bestMapData.equality;

		const backupMapData = stats[1];
		if (backupMapData) {
			bestStats[`${type}Second`] = {
				mapLevel: backupMapData.mapLevel,
				zone: backupMapData.zone,
				value: backupMapData[backupMapData.stance].value,
				speed: backupMapData[backupMapData.stance].speed,
				killSpeed: backupMapData[backupMapData.stance].killSpeed
			};

			if (game.global.universe === 1) bestStats[`${type}Second`].stance = backupMapData.stance;
			if (game.global.universe === 2) bestStats[`${type}Second`].equality = backupMapData.equality;

			bestStats.ratio = bestMapData.value / backupMapData.value;
		}

		return bestStats;
	}

	statsLoot.sort((a, b) => b.value - a.value);
	best.loot = getBestStats(statsLoot, 'loot');

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

/* If using standalone version then when loading farmCalc file also load CSS & breedtimer+calc+farmCalcStandalone files. */
if (typeof autoTrimpSettings === 'undefined' || (typeof autoTrimpSettings !== 'undefined' && typeof autoTrimpSettings.ATversion !== 'undefined' && !autoTrimpSettings.ATversion.includes('SadAugust'))) {
	function updateAdditionalInfo() {
		if (!usingRealTimeOffline) {
			const infoElem = document.getElementById('additionalInfo');
			const infoStatus = makeAdditionalInfo_Standalone();
			if (infoElem.innerHTML !== infoStatus) infoElem.innerHTML = infoStatus;
			infoElem.parentNode.setAttribute('onmouseover', makeAdditionalInfoTooltip_Standalone(true));
		}
	}

	(async function () {
		let basepathFarmCalc = 'https://sadaugust.github.io/AutoTrimps/';
		/* basepathFarmCalc = 'https://localhost:8887/AutoTrimps_Local/'; */
		const mods = ['farmCalcStandalone'];
		const modules = ['breedtimer', 'calc'];

		let linkStylesheet = document.createElement('link');
		linkStylesheet.rel = 'stylesheet';
		linkStylesheet.type = 'text/css';
		linkStylesheet.href = basepathFarmCalc + 'css/farmCalc.css';
		document.head.appendChild(linkStylesheet);

		function loadModules(basepathFarmCalc, fileName, prefix = '', retries = 3) {
			return new Promise((resolve, reject) => {
				const script = document.createElement('script');
				script.src = `${basepathFarmCalc}${prefix}${fileName}.js`;
				script.id = `${fileName}_MODULE`;
				script.async = false;
				script.defer = true;

				script.addEventListener('load', () => {
					resolve();
				});

				script.addEventListener('error', () => {
					console.log(`Failed to load module: ${fileName} from path: ${prefix || ''}. Retries left: ${retries - 1}`);
					loadModules(fileName, prefix, retries - 1)
						.then(resolve)
						.catch(reject);
				});

				document.head.appendChild(script);
			});
		}

		try {
			const toLoad = [...mods, ...modules];

			for (const module of toLoad) {
				const path = mods.includes(module) ? 'mods/' : modules.includes(module) ? 'modules/' : '';
				await loadModules(basepathFarmCalc, module, path);
			}

			updateAdditionalInfo();
			console.log('The farm calculator mod has finished loading.');
			message('The farm calculator mod has finished loading.', 'Loot');

			setInterval(function () {
				updateAdditionalInfo();
			}, 10000);
		} catch (error) {
			console.error('Error loading script', error);
			message('Farm Calc has failed to load. Refresh your page and try again.', 'Loot');
			tooltip('Failed to load Farm Calc', 'customText', undefined, 'Farm Calc has failed to load. Refresh your page and try again.');
			verticalCenterTooltip(true);
		}
	})();
}
