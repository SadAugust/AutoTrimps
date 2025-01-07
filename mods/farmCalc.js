/* setup for non-AT users */
if (typeof atData === 'undefined') atData = {};

function masteryPurchased(name) {
	if (!game.talents[name]) throw `unknown mastery: ${name}`;
	return game.talents[name].purchased;
}

function combatSpeed(hze = getHighestLevelCleared() + 1) {
	let speed = 10 * 0.95 ** getPerkLevel('Agility');
	if (masteryPurchased('hyperspeed')) --speed;
	if (masteryPurchased('hyperspeed2') && game.global.world <= Math.ceil(hze / 2)) --speed;
	if (challengeActive('Quagmire')) speed += game.challenges.Quagmire.getSpeedPenalty() / 100;

	return speed;
}

function populateFarmCalcData() {
	const runningAutoTrimps = typeof atConfig !== 'undefined';

	const exoticNames = ['Chronoimp', 'Jestimp', 'Titimp', 'Flutimp', 'Goblimp'];
	const imps = exoticNames.reduce((total, imp) => total + game.unlocks.imps[imp], 0) + +masteryPurchased('magimp');

	let exoticChance = 3;
	if (Fluffy.isRewardActive('exotic')) exoticChance += 0.5;
	if (game.permaBoneBonuses.exotic.owned > 0) exoticChance += game.permaBoneBonuses.exotic.addChance();
	exoticChance /= 100;

	const hze = getHighestLevelCleared() + 1;
	const speed = combatSpeed(hze);
	const breedTimer = _breedTotalTime();

	const basicData = {
		maxTicks: runningAutoTrimps && atConfig.loops.atTimeLapseFastLoop ? 21600 : 21600 /* Six hours simulation inside of TW and a day (testing 6 hours in both scenarios for now) outside of it. */,
		hze,
		universe: game.global.universe,
		zone: game.global.world,
		speed,
		deathPhase: speed <= 9 ? 0 : 0.1,
		customShield: runningAutoTrimps ? heirloomShieldToEquip('map') : null
	};

	const challengesActive = {
		discipline: challengeActive('Discipline'),
		daily: challengeActive('Daily'),
		trapper: noBreedChallenge(),
		coordinate: challengeActive('Coordinate'),
		crushed: challengeActive('Crushed'),
		nom: challengeActive('Nom'),
		devastation: challengeActive('Devastation') || challengeActive('Revenge'),
		domination: challengeActive('Domination'),
		frigid: challengeActive('Frigid'),
		eradicated: challengeActive('Eradicated'),
		unlucky: challengeActive('Unlucky'),
		duel: challengeActive('Duel'),
		trappapalooza: challengeActive('Trappapalooza'),
		wither: challengeActive('Wither'),
		revenge: challengeActive('Revenge'),
		shieldBreak: challengeActive('Bublé') || getCurrentQuest() === 8,
		archaeology: challengeActive('Archaeology'),
		mayhem: challengeActive('Mayhem'),
		insanity: challengeActive('Insanity'),
		berserk: challengeActive('Berserk'),
		exterminate: challengeActive('Exterminate'),
		glass: challengeActive('Glass'),
		desolation: challengeActive('Desolation')
	};

	const uberNature = getUberEmpowerment();
	const empowerment = getEmpowerment();
	const natureData = game.empowerments[empowerment];
	const natureStart = basicData.universe !== 1 ? 9999 : challengesActive.eradicated ? 1 : 236;
	const diplomacy = masteryPurchased('nature2') ? 5 : 0;
	const plaguebrought = Fluffy.isRewardActive('plaguebrought') ? 2 : 1;
	const natureLevel = basicData.zone >= natureStart ? natureData.level + diplomacy : 0;

	const nature = {
		poison: 0,
		wind: 0,
		ice: 0,
		[['poison', 'wind', 'ice'][Math.ceil(basicData.zone / 5) % 3]]: natureLevel / 100,

		uberNature,
		empowerment,
		plaguebrought,
		natureIncrease: 1 * (uberNature === empowerment && game.global.uberNature !== 'Poison' ? 2 : 1) * plaguebrought,
		transfer: (basicData.zone >= natureStart ? natureData.retainLevel + natureData.getRetainBonus() : 0) / 100,
		windCap: uberNature === 'Wind' ? 300 : 200
	};

	const special = getAvailableSpecials('lmc');
	const biome = getBiome();

	const mapInfo = {
		fragments: game.resources.fragments.owned,
		perfectMaps: basicData.universe === 2 ? hze >= 30 : hze >= 110,
		extraMapLevelsAvailable: basicData.universe === 2 ? hze >= 50 : hze >= 210,
		mapReducer: masteryPurchased('mapLoot'),
		biome: _getBiomeEnemyStats(biome),
		mapBiome: biome,
		special,
		specialTime: getSpecialTime(special),
		import_chance: imps * exoticChance,
		titimp: game.unlocks.imps.Titimp,
		titimpReduction: 1 - speed / 10
	};

	const trimpBlock = basicData.universe === 1 ? calcOurBlock('X', false, 'map') : 0;
	const trimpShield = basicData.universe === 2 ? calcOurHealth(true, 'map') : 0;
	const dmgType = challengesActive.unlucky || challengeActive.discipline ? 'max' : 'min';
	let trimpAttack = calcOurDmg(dmgType, basicData.universe === 1 ? 'X' : 0, false, 'map', 'never', 0);
	let trimpHealth = calcOurHealth(basicData.universe === 2 ? challengesActive.shieldBreak : 'X', 'map');
	trimpHealth -= trimpShield;

	const antiTime = game.jobs.Amalgamator.owned > 0 ? (masteryPurchased('patience') ? 45 : 30) : breedTimer;
	const antiBonus = _getAnticipationBonus();
	const antiBonusCurr = _getAnticipationBonus(undefined, false, antiTime);

	if (antiBonus !== antiBonusCurr) {
		const ratio = antiBonusCurr / antiBonus;
		trimpAttack *= ratio;
	}

	const frenzyLevel = getPerkLevel('Frenzy');
	const permaFrenzy = autoBattle.oneTimers.Mass_Hysteria.owned;
	const checkFrenzy = frenzyLevel > 0 && !permaFrenzy && !challengesActive.berserk;
	const frenzyMult = 1 + 0.5 * frenzyLevel;
	const frenzyDuration = permaFrenzy ? Infinity : 5 * frenzyLevel;
	const frenzyChance = frenzyLevel;

	if (checkFrenzy && (!runningAutoTrimps || getPageSetting('frenzyCalc'))) {
		trimpAttack /= frenzyMult;
	}

	/* stances */
	let stances = 'X';
	if (basicData.universe === 1 && game.upgrades.Formations.done) {
		if (game.upgrades.Dominance.done) stances = 'D';

		if (runningAutoTrimps ? getPageSetting('autoLevelScryer') : true) {
			if (game.global.uberNature === 'Wind' && nature.empowerment !== 'Wind') stances += 'W';
			else if (hze >= 181) stances += 'S';
		}
	}

	/* crit */
	let megaCD = 5;
	if (Fluffy.isRewardActive('megaCrit')) megaCD += 2;
	if (masteryPurchased('crit')) megaCD += 1;
	const critChance = runningAutoTrimps ? getPlayerCritChance_AT(basicData.customShield) : getPlayerCritChance();
	const critDamage = critChance >= 1 ? megaCD : runningAutoTrimps ? getPlayerCritDamageMult_AT(basicData.customShield) - 1 : getPlayerCritDamageMult() - 1;

	/* fast enemy conditions */
	let fastEnemy = challengesActive.desolation;
	if (challengesActive.shieldBreak) fastEnemy = true;
	else if (challengesActive.revenge) fastEnemy = true;
	else if (challengesActive.trappapalooza) fastEnemy = true;
	else if (challengesActive.archaeology) fastEnemy = true;
	else if (challengesActive.berserk && game.challenges.Berserk.weakened !== 20) fastEnemy = true;
	else if (challengesActive.exterminate) fastEnemy = false;
	else if (challengesActive.glass) fastEnemy = true;
	else if (checkFrenzy) fastEnemy = true;

	const death_stuff = {
		enemy_cd: 1,
		breedTimer,
		weakness: 0,
		plague: 0,
		bleed: 0,
		explosion: 0,
		rampage: 1,
		fastEnemy,
		magma: challengesActive.eradicated || (basicData.universe === 1 && basicData.zone >= 230),
		berserkFrenzy: challengesActive.berserk && game.challenges.Berserk.weakened !== 20
	};

	/* Overkill - Accounts for Mad Mapper in U2. */
	const overkillRange = Math.max(0, maxOneShotPower(true) - 1);
	let overkillDamage = getPerkLevel('Overkill') * 0.005;
	if (basicData.universe === 2) {
		if (u2Mutations.tree.MadMap.purchased) overkillDamage = 1;
		else if (canU2OverkillAT(basicData.zone)) overkillDamage = 0.005;
		else overkillDamage = 0;
	}

	/* Enemy stat multipliers & trimp damage ranges */
	let enemyHealthMult = 1;
	let enemyAttackMult = 1;
	let minFluct = 0.8 + 0.02 * getPerkLevel('Range');
	let maxFluct = 1.2;

	const challengeEffects = {
		Discipline: () => {
			minFluct = 0.005;
			maxFluct = 1.995;
		},
		Balance: () => {
			enemyHealthMult *= 2;
			enemyAttackMult *= 2.35;

			/* Unsure this is the best solution. Might be better just removing each stack during the mapping process one by one to a cap of X? */
			if (!game.global.mapsActive && !game.global.preMapsActive) {
				const balance = game.challenges.Balance;
				if (balance.balanceStacks < 250) {
					const timer = runningAutoTrimps && atConfig.loops.atTimeLapseFastLoop ? 30 : runningAutoTrimps ? 5 : 10;
					const cellsCleared = Math.floor(overkillRange / (Math.ceil(speed) / 10)) * timer;

					const healthMult = Math.pow(0.99, Math.min(250, balance.balanceStacks + cellsCleared));
					trimpHealth /= balance.getHealthMult();
					trimpHealth *= healthMult;
				}
			}
		},
		Meditate: () => {
			enemyHealthMult *= 2;
			enemyAttackMult *= 1.5;
		},
		Electricity: () => {
			death_stuff.weakness = 0.1;
			death_stuff.plague = 0.1;
		},
		Life: () => {
			enemyHealthMult *= 11;
			enemyAttackMult *= 6;
			trimpAttack *= 1 + 0.1 * game.challenges.Life.stacks;
			trimpHealth *= 1 + 0.1 * game.challenges.Life.stacks;
		},
		Crushed: () => {
			if (trimpHealth < trimpBlock) death_stuff.enemy_cd = 5;
		},
		Nom: () => {
			death_stuff.bleed += 0.05;
		},
		Toxicity: () => {
			enemyHealthMult *= 2;
			enemyAttackMult *= 5;
			death_stuff.bleed += 0.05;
		},
		Watch: () => {
			enemyAttackMult *= 1.25;
		},
		Lead: () => {
			enemyHealthMult *= 1 + 0.04 * game.challenges.Lead.stacks;
			enemyAttackMult *= 1 + 0.04 * game.challenges.Lead.stacks;
			death_stuff.bleed += Math.min(game.challenges.Lead.stacks, 200) * 0.0003;
		},
		Corrupted: () => {
			enemyAttackMult *= 3;
		},
		Obliterated: () => {
			enemyHealthMult *= 1e12 * 10 ** Math.floor(basicData.zone / 10);
			enemyAttackMult *= 1e12 * 10 ** Math.floor(basicData.zone / 10);
		},
		Eradicated: () => {
			enemyHealthMult *= 1e20 * 3 ** Math.floor(basicData.zone / 2);
			enemyAttackMult *= 1e20 * 3 ** Math.floor(basicData.zone / 2);
		},
		Frigid: () => {
			enemyHealthMult *= game.challenges.Frigid.getEnemyMult();
			enemyAttackMult *= game.challenges.Frigid.getEnemyMult();
		},
		Experience: () => {
			enemyHealthMult *= game.challenges.Experience.getEnemyMult();
			enemyAttackMult *= game.challenges.Experience.getEnemyMult();
		}
	};

	if (basicData.universe === 1) {
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
			enemyHealthMult *= 2;
			enemyAttackMult *= 1.5;

			/* Unsure this is the best solution. Might be better just removing each stack during the mapping process one by one to a cap of X? */
			if (!game.global.mapsActive && !game.global.preMapsActive) {
				const balance = game.challenges.Unbalance;
				if (balance.balanceStacks < 250) {
					const timer = runningAutoTrimps && atConfig.loops.atTimeLapseFastLoop ? 30 : runningAutoTrimps ? 5 : 10;
					const cellsCleared = Math.floor(overkillRange / (Math.ceil(speed) / 10)) * timer;

					const attackMult = Math.pow(0.99, Math.min(250, balance.balanceStacks + cellsCleared));
					trimpAttack /= balance.getAttackMult();
					trimpAttack *= attackMult;
				}
			}
		},
		Duel: () => {
			death_stuff.enemy_cd = 10;
			if (game.challenges.Duel.trimpStacks > 50) trimpAttack /= 3;
		},
		Wither: () => {
			enemyHealthMult *= game.challenges.Wither.getTrimpHealthMult();
			enemyAttackMult *= game.challenges.Wither.getEnemyAttackMult();
		},
		Quest: () => {
			enemyHealthMult *= game.challenges.Quest.getHealthMult();
		},
		Revenge: () => {
			if (game.global.world % 2 === 0) enemyHealthMult *= 10;
		},
		Archaeology: () => {
			enemyAttackMult *= game.challenges.Archaeology.getStatMult('enemyAttack');
		},
		Mayhem: () => {
			enemyHealthMult *= game.challenges.Mayhem.getEnemyMult();
			enemyAttackMult *= game.challenges.Mayhem.getEnemyMult();
		},
		Insanity: () => {},
		Berserk: () => {
			enemyHealthMult *= 1.5;
			enemyAttackMult *= 1.5;
		},
		Exterminate: () => {
			enemyHealthMult *= game.challenges.Exterminate.getSwarmMult();
		},
		Nurture: () => {
			enemyHealthMult *= 10;
			enemyHealthMult *= game.buildings.Laboratory.getEnemyMult();
			enemyAttackMult *= 2;
			enemyAttackMult *= game.buildings.Laboratory.getEnemyMult();
		},
		Pandemonium: () => {
			enemyHealthMult *= game.challenges.Pandemonium.getPandMult();
			enemyAttackMult *= game.challenges.Pandemonium.getPandMult();
		},
		Desolation: () => {
			enemyHealthMult *= game.challenges.Desolation.getEnemyMult();
			enemyAttackMult *= game.challenges.Desolation.getEnemyMult();
		},
		Alchemy: () => {
			enemyHealthMult *= alchObj.getEnemyStats(true) + 1;
			enemyAttackMult *= alchObj.getEnemyStats(true) + 1;
		},
		Hypothermia: () => {
			enemyHealthMult *= game.challenges.Hypothermia.getEnemyMult();
			enemyAttackMult *= game.challenges.Hypothermia.getEnemyMult();
		},
		Glass: () => {
			enemyHealthMult *= game.challenges.Glass.healthMult();
		}
	};

	if (basicData.universe === 2) {
		Object.keys(challengeEffectsU2).forEach((challenge) => {
			if (challengeActive(challenge)) {
				challengeEffectsU2[challenge]();
			}
		});
	}

	if (challengesActive.daily) {
		const daily = (mod) => (game.global.dailyChallenge[mod] ? game.global.dailyChallenge[mod].strength : 0);
		minFluct -= daily('minDamage') ? 0.09 + 0.01 * daily('minDamage') : 0;
		maxFluct += daily('maxDamage');

		death_stuff.plague += 0.01 * daily('plague');
		death_stuff.bleed += 0.01 * daily('bogged');
		death_stuff.weakness += 0.01 * daily('weakness');
		death_stuff.enemy_cd = 1 + 0.5 * daily('crits');
		death_stuff.explosion += daily('explosive');

		enemyHealthMult *= 1 + 0.2 * daily('badHealth');
		enemyHealthMult *= 1 + 0.3 * daily('badMapHealth');
		enemyAttackMult *= 1 + 0.2 * daily('badStrength');
		enemyAttackMult *= 1 + 0.3 * daily('badMapStrength');

		if (typeof game.global.dailyChallenge.rampage !== 'undefined' && (game.global.mapsActive || game.global.preMapsActive)) {
			death_stuff.rampage = _getRampageBonus();
			trimpAttack *= death_stuff.rampage;
		}
	}

	const miscCombatStats = {
		fluctuation: basicData.universe === 2 ? 0.5 : 0.2,
		range: maxFluct / minFluct - 1,
		critChance: critChance % 1,
		critDamage,
		stances,
		ok_spread: overkillRange,
		overkill: overkillDamage,
		plaguebringer: (nature.plaguebrought === 2 ? 0.5 : 0) + (runningAutoTrimps ? getHeirloomBonus_AT('Shield', 'plaguebringer', basicData.customShield) * 0.01 : getHeirloomBonus('Shield', 'plaguebringer') * 0.01),
		angelic: masteryPurchased('angelic'),
		gammaCharges: gammaMaxStacks(false, false, 'map'),
		gammaMult: (runningAutoTrimps ? MODULES.heirlooms.gammaBurstPct : game.global.gammaMult) || 1,
		equalityMult: basicData.universe === 2 ? (runningAutoTrimps ? getPlayerEqualityMult_AT(basicData.customShield) : game.portal.Equality.getModifier(true)) : 1,
		checkFrenzy,
		frenzyDuration,
		frenzyMult,
		frenzyChance
	};

	return {
		...basicData,
		...mapInfo,
		...nature,
		attack: Math.floor(trimpAttack),
		trimpHealth: Math.floor(trimpHealth),
		trimpBlock: Math.floor(trimpBlock),
		trimpShield: Math.floor(trimpShield),
		enemyAttackMult,
		enemyHealthMult,
		...miscCombatStats,
		...challengesActive,
		...death_stuff
	};
}

function cellsPerSecond(saveData) {
	const cellsKilling = saveData.ok_spread + 1;
	const attacksPerMap = Math.ceil(saveData.size / cellsKilling);
	const ceiledKillingSpeed = Math.ceil(saveData.speed + 1);
	return (saveData.size / (attacksPerMap * ceiledKillingSpeed)) * 10;
}

function stats(lootFunction = lootDefault, checkFragments = true) {
	const saveData = populateFarmCalcData();
	const maxMaps = lootFunction === lootDestack ? 11 : 25;
	const stats = [];
	const extra = saveData.extraMapLevelsAvailable ? 10 : saveData.mapReducer && saveData.zone > 6 ? -1 : 0;
	let coords = 1;
	const stances = saveData.stances;
	const alwaysPerfect = typeof atConfig !== 'undefined' && getPageSetting('onlyPerfectMaps');

	if (saveData.coordinate) {
		for (let z = 1; z < saveData.zone + extra + 1; ++z) {
			coords = Math.ceil(1.25 * coords);
		}
	}

	for (let mapLevel = saveData.zone + extra; mapLevel >= 6; --mapLevel) {
		if (saveData.coordinate) {
			coords = Math.ceil(coords / 1.25);
			saveData.enemyAttackMult = coords;
			saveData.enemyHealthMult = coords;
		}

		let biomeLoot = saveData.mapBiome === 'Farmlands' && saveData.universe === 2 ? 1 : saveData.mapBiome === 'Plentiful' ? 0.25 : 0;
		if (game.singleRunBonuses.goldMaps.owned) biomeLoot += 1;

		const simulateMap = _simulateSliders(mapLevel, saveData.special, saveData.mapBiome, [9, 9, 9], saveData.perfectMaps, alwaysPerfect);
		let map;
		let mapOwned = findMap(mapLevel - game.global.world, saveData.special, saveData.mapBiome);
		if (!mapOwned) mapOwned = findMap(mapLevel - game.global.world, simulateMap.special, simulateMap.location, simulateMap.perfect);

		if (checkFragments) {
			if (mapOwned) {
				map = game.global.mapsOwnedArray[getMapIndex(mapOwned)];
				saveData.difficulty = Number(map.difficulty);
				saveData.size = Number(map.size);
				saveData.lootMult = Number(map.loot);
				saveData.specialData = map.bonus;
			} else {
				if (game.singleRunBonuses.goldMaps.owned) simulateMap.loot += 1;
				if (simulateMap.location === 'Farmlands' && saveData.universe === 2) simulateMap.loot += 1;
				if (simulateMap.location === 'Plentiful') simulateMap.loot += 0.25;

				saveData.specialData = simulateMap.special;
				saveData.difficulty = Number(simulateMap.difficulty);
				saveData.size = Number(simulateMap.size);
				saveData.lootMult = Number(simulateMap.loot);

				const { level, special, location, perfect, sliders } = simulateMap;
				const { difficulty, size, loot } = sliders;
				const fragCost = mapCost(level - game.global.world, special, location, [loot, size, difficulty], perfect);
				if (mapLevel !== 6 && fragCost > game.resources.fragments.owned) {
					continue;
				}
			}
		} else {
			saveData.specialData = saveData.special;
			saveData.difficulty = 0.75;
			saveData.size = saveData.mapReducer ? 20 : 25;
			saveData.lootMult = saveData.mapBiome === 'Farmlands' && saveData.universe === 2 ? 2.6 : saveData.mapBiome === 'Plentiful' ? 1.85 : 1.6;
			if (game.singleRunBonuses.goldMaps.owned) simulateMap.loot += 1;
			simulateMap.sliders = { loot: 9, size: 9, difficulty: 9 };
			simulateMap.location = saveData.mapBiome;
			simulateMap.perfect = true;
		}

		const { difficulty, size, lootMult } = saveData;
		const mapConfig = {
			mapOwned: !!mapOwned,
			name: map ? map.name : undefined,
			id: map ? map.id : undefined,
			level: mapLevel,
			plusLevel: mapLevel - game.global.world,
			special: saveData.specialData,
			biome: map ? map.location : simulateMap.location,
			difficulty,
			size,
			loot: lootMult,
			sliders: simulateMap.sliders,
			perfect: map ? difficulty === 0.75 && size === (saveData.reducer ? 20 : 25) && lootMult === 1.6 + biomeLoot : simulateMap.perfect
		};

		let tmp;
		if (!checkFragments && hdStats.autoLevelInitial) {
			const originalSimulations = hdStats.autoLevelInitial[0];
			const matchingMapLevel = originalSimulations.find((item) => item.mapLevel === mapLevel - game.global.world);
			if (matchingMapLevel) {
				function removeIgnoredProperties(obj) {
					const { mapOwned, name, id, ...rest } = obj;
					return rest;
				}

				const filteredMatchingMapConfig = removeIgnoredProperties(matchingMapLevel.mapConfig);
				const filteredMapConfig = removeIgnoredProperties(mapConfig);
				if (JSON.stringify(filteredMatchingMapConfig) === JSON.stringify(filteredMapConfig)) {
					tmp = matchingMapLevel;
				}
			}
		}

		if (!tmp) {
			tmp = zone_stats(mapLevel, saveData, lootFunction);
			tmp.mapConfig = mapConfig;
		}

		stats.unshift(tmp);

		if (mapLevel !== 6) {
			if (stats.length) {
				if (tmp.value === 0) {
					stats.shift();
					continue;
				}

				if (stats.length >= maxMaps) {
					break;
				}

				const currentBest = get_best([stats, saveData.stances], true);
				if (tmp.mapConfig.special === saveData.specialData || (currentBest.loot.value / saveData.specialTime) * getSpecialTime(currentBest.mapConfig.special) > tmp.value) {
					if (tmp.value < 0.6 * currentBest.loot.value && tmp.deathsPerSec < 0.1) {
						break;
					}

					const cPS = cellsPerSecond(saveData);
					for (const stance of saveData.stances) {
						if (tmp[stance] && tmp[stance].killSpeed + 0.1 >= cPS) {
							saveData.stances = saveData.stances.split(stance).join('');
						}
					}
				}

				if (saveData.stances.length === 0) {
					break;
				}
			}
		}
	}

	return [stats, stances];
}

function lootDefault(zone, saveData) {
	return 100 * (zone < saveData.zone ? 0.8 ** (saveData.zone - saveData.mapReducer - zone) : 1.1 ** (zone - saveData.zone));
}

function lootDestack(zone, saveData) {
	return zone < saveData.zone ? 0 : zone - saveData.zone + 1;
}

function zone_stats(zone, saveData, lootFunction = lootDefault) {
	const mapLevel = zone - saveData.zone;
	const bionic2Multiplier = masteryPurchased('bionic2') && zone > saveData.zone ? 1.5 : 1;
	const loot = lootFunction(zone, saveData);

	const result = {
		mapLevel,
		zone,
		equality: 0,
		value: 0,
		killSpeed: 0,
		stance: saveData.stances[0],
		loot
	};

	const [mapGrid, equality] = _simulateMapGrid(saveData, zone);
	saveData.mapGrid = mapGrid;
	saveData.equality = equality;

	const stances = saveData.stances;
	const enemyStats = mapGrid[mapGrid.length - 1];
	const enemyEqualityModifier = equality > 0 ? Math.pow(0.9, equality) : 1;
	const trimpEqualityModifier = equality > 0 ? Math.pow(saveData.equalityMult, equality) : 1;
	const minDmgChallenge = saveData.discipline || saveData.unlucky;
	const attackMult = minDmgChallenge ? 1000 : 10;

	/* loop through all stances to identify which stance is best for farming */
	for (const stance of stances) {
		result[stance] = {
			speed: 0,
			value: 0,
			equality: 0,
			killSpeed: 0
		};

		const attackMultiplier = stance === 'D' ? 4 : ['X', 'W'].includes(stance) ? 1 : 0.5;
		const lootMultiplier = ['S', 'W'].includes(stance) ? 2 : 1;
		saveData.block = ['X', 'W'].includes(stance) ? saveData.trimpBlock : saveData.trimpBlock / 2;
		saveData.health = ['X', 'W'].includes(stance) ? saveData.trimpHealth : saveData.trimpHealth / 2;
		saveData.atk = saveData.attack * attackMultiplier * bionic2Multiplier;
		if (saveData.crushed) saveData.enemy_cd = saveData.health < saveData.block ? 5 : 0;

		if (zone > game.global.world && saveData.insanity && game.challenges.Insanity.insanity !== game.challenges.Insanity.maxInsanity) {
			saveData.health /= game.challenges.Insanity.getHealthMult();
			saveData.health *= Math.pow(0.99, Math.min(game.challenges.Insanity.insanity + 70, game.challenges.Insanity.maxInsanity));
		}

		let enemyAttack = enemyStats.attack * (1 + saveData.fluctuation) * enemyEqualityModifier;
		enemyAttack -= saveData.universe === 2 ? saveData.trimpShield : saveData.block;
		if (enemyAttack > saveData.health) {
			continue;
		}

		const trimpAttack = saveData.atk * saveData.gammaMult * trimpEqualityModifier * saveData.critDamage;
		if (enemyStats.health > trimpAttack * attackMult) {
			continue;
		}

		const { speed, equality, killSpeed, debugResults } = simulate(saveData, zone, stance);
		const value = speed * loot * lootMultiplier;

		result[stance] = {
			speed,
			value,
			equality,
			killSpeed,
			debugResults
		};

		if (value > result.value) {
			result.equality = equality;
			result.stance = stance;
			result.value = value;
			result.killSpeed = killSpeed;
			result.stanceSpeed = stance;
			result.debugResults = debugResults;
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
		} else if (['Plentiful', 'Sea'].includes(mapBiome) || (mapBiome === 'Farmlands' && ['Plentiful', 'Sea'].includes(farmlandsType))) {
			enemyName = 'Flowimp';
		} else if (mapBiome === 'Depths' || (mapBiome === 'Farmlands' && farmlandsType === 'Any')) {
			enemyName = 'Moltimp';
		}

		equality = equalityQuery(enemyName, zone, size, 'map', difficulty);
	}

	const calculateEnemyStats = (zone, cell, enemyName, saveData) => {
		const enemyHealth = calcEnemyBaseHealth('map', zone, cell + 1, enemyName);
		const enemyAttack = calcEnemyBaseAttack('map', zone, cell + 1, enemyName);

		const domMod = saveData.domination ? (cell === size ? 2.5 : 0.1) : 1;

		return {
			attack: enemyAttack * difficulty * saveData.enemyAttackMult * domMod * corruptionScaleAttack,
			health: enemyHealth * difficulty * saveData.enemyHealthMult * domMod * corruptionScaleHealth
		};
	};

	return [Array.from({ length: size }, (_, cell) => calculateEnemyStats(zone, cell, 'Chimp', saveData)), equality];
}

/* simulate farming at the given zone for a fixed time, and return the number cells cleared. */
function simulate(saveData, zone, stance) {
	const { maxTicks, universe, mapGrid, biome, block, equality, size, specialData, lootMult, magma, checkFrenzy } = saveData;

	let cell = 0;
	let loot = 0;
	let ticks = 0;

	let ok_damage = 0,
		ok_spread = 0,
		shattered = false;

	let poison = 0,
		wind = 0,
		ice = 0;

	/* challenge variables */
	let nomStacks = 0;
	let duelPoints = game.challenges.Duel.trimpStacks;
	let hasWithered = false;
	let mayhemPoison = 0;
	let berserkStacks = game.challenges.Berserk.frenzyStacks;
	let berserkWeakened = game.challenges.Berserk.weakened;
	let glassStacks = game.challenges.Glass.shards;

	let gammaBursts = 0;
	let gammaStacks = 0;
	let frenzyRefresh = true;
	let frenzyLeft = 0;

	let trimpAttacks = 0;
	let trimpCrit = false;
	let trimpCrits = 0;

	let enemy_max_hp = 0;
	let enemyAttack = 0;
	let enemyAttacks = 0;
	let enemyCrit = false;
	let enemyCrits = 0;
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
	const autoEquality = typeof atConfig !== 'undefined' && getPageSetting('equalityManagement') === 2;
	const enemyEqualityMultMax = Math.pow(0.9, game.portal.Equality.radLevel);

	if (saveData.insanity && zone > game.global.world) biome.push([15, 60, true]);
	const specialTime = getSpecialTime(specialData);
	const cacheLoot = (27 * game.unlocks.imps.Jestimp + 15 * game.unlocks.imps.Chronoimp) * lootMult;

	let seed = Math.floor(Math.random(40, 50) * 100);
	const rand_mult = 4.656612873077393e-10;

	function rng() {
		seed ^= seed >> 11;
		seed ^= seed << 8;
		seed ^= seed >> 19;
		if (seed === 0) seed = Math.floor(Math.random(40, 50) * 100);
		return seed * rand_mult;
	}

	function enemy_hit(enemyAttack, rngRoll, dmgCheck = false) {
		enemyAttack *= 1 + saveData.fluctuation * (2 * rngRoll - 1);
		enemyAttacks++;

		if (saveData.duel) {
			enemyCC = 1 - duelPoints / 100;
			if (duelPoints < 50) enemyAttack *= 3;
		}

		rngCrit = enemyCC < 0.25 ? rng() : rngRoll;
		if (rngCrit < enemyCC) {
			enemyAttack *= saveData.enemy_cd;
			enemyCrit = true;
			enemyCrits++;
		}

		const iceValue = saveData.ice;
		if (iceValue > 0) enemyAttack *= 0.366 ** (ice * iceValue);
		if (universe === 2 && equality > 0) enemyAttack *= enemyEqualityMult;
		if (saveData.glass && glassStacks > 0) enemyAttack *= Math.pow(2, Math.floor(glassStacks / 100)) * (100 + glassStacks);

		if (!dmgCheck) {
			if (enemyAttack > 0) reduceTrimpHealth(enemyAttack);
			++debuff_stacks;

			return enemyAttack;
		}
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

		trimpHealth = Math.max(0, trimpHealth - amt);
	}

	function _handleDuelPoints(duelPoints, enemyCrit, trimpCrit, turns, oneShot, enemyHealth, trimpHealth) {
		/* +1 point for crits, +2 points for killing, +5 for oneshots */
		duelPoints -= enemyCrit;
		duelPoints += trimpCrit;

		if (trimpHealth < 1) duelPoints -= turns === 1 ? 5 : 2;
		if (enemyHealth < 1) duelPoints += oneShot ? 5 : 2;

		duelPoints = duelPoints > 100 ? 100 : duelPoints;
		duelPoints = duelPoints < 0 ? 0 : duelPoints;

		return duelPoints;
	}

	function _glassNotOneShot() {
		glassStacks++;

		if (glassStacks % 100 === 0) {
			const startHealth = enemy_max_hp;
			enemy_max_hp = enemy_max_hp * Math.pow(2, Math.floor(glassStacks / 100));
			const healthChange = enemy_max_hp - startHealth;
			if (healthChange > 0) enemyHealth += healthChange;
			if (enemyHealth > enemy_max_hp) enemyHealth = enemy_max_hp;
		}
	}

	function armyDead() {
		if (saveData.shieldBreak) return energyShield <= 0;
		return trimpHealth <= 0;
	}

	function deathVarsReset() {
		/* trimps death phase. 100ms + fighting phase timer */
		ticks += 1 + Math.ceil(turns * saveData.speed);
		ticks = Math.max(ticks, last_group_sent + saveData.breedTimer);
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

		turns = 0;
		debuff_stacks = 0;
		if (deaths === 0) saveData.atk /= saveData.rampage;
		gammaStacks = 0;
		frenzyLeft /= 2;
		frenzyRefresh = false;
		deaths++;

		if (saveData.shieldBreak || (saveData.berserkFrenzy && berserkStacks > 0) || (saveData.glass && glassStacks > 0 && glassStacks % 1000 === 0) || hasWithered || saveData.trapper) {
			loot = 0;
			kills = 0;
			ticks = maxTicks;
		}

		if (saveData.nom && nomStacks < 100) {
			enemyAttack *= 1.25;
			enemyHealth = Math.min(enemyHealth + 0.05 * enemy_max_hp, enemy_max_hp);
			nomStacks++;
		}
	}

	let turns = 0;
	let plague_damage = 0;
	let trimpOverkill = 0;
	let mapClears = 0;
	let rngCrit = rng();

	while (ticks < maxTicks) {
		rngRoll = rng();

		const imp = rngRoll;
		const imp_stats = imp < saveData.import_chance ? [1, 1, false] : biome[Math.floor(rngRoll * biome.length)];
		const fast = saveData.fastEnemy || (imp_stats[2] && !saveData.nom) || saveData.desolation || (saveData.duel && duelPoints > 90);

		enemyAttack = imp_stats[0] * mapGrid[cell].attack;
		enemyHealth = imp_stats[1] * mapGrid[cell].health;
		enemy_max_hp = enemyHealth;

		turns = 0;
		nomStacks = 0;
		let pbTurns = 0;
		let oneShot = true;
		let enemyAttackTemp = 0;

		if (ok_spread !== 0) {
			enemyHealth -= ok_damage;
			--ok_spread;
		}

		enemyHealth = Math.min(enemyHealth, Math.max(enemy_max_hp * 0.05, enemyHealth - plague_damage));
		plague_damage = 0;
		energyShield = energyShieldMax;

		if (saveData.duel && duelPoints > 80) enemyHealth *= 10;

		while (enemyHealth >= 1 && ticks < maxTicks) {
			++turns;
			rngRoll = rng();

			enemyAttackTemp = 0;
			let attacked = false;
			trimpAttack = 0;
			trimpCrit = false;
			enemyCrit = false;

			/* check if we didn't kill the enemy last turn for Wither & Glass checks */
			if (enemyHealth !== enemy_max_hp) {
				oneShot = false;

				if (saveData.wither) {
					enemyHealth = Math.max(enemy_max_hp, enemyHealth + enemy_max_hp * 0.25);
					if (enemyHealth === enemy_max_hp) {
						hasWithered = true;
						trimpHealth = 0;
					}
				}
			} else {
				oneShot = true;
			}

			if (saveData.angelic && !saveData.berserk) {
				trimpHealth += saveData.health / 2;
				if (trimpHealth > saveData.health) trimpHealth = saveData.health;
			}

			if (fast) {
				enemyAttackTemp = enemy_hit(enemyAttack, rngRoll);
			}

			/* trimp attack */
			if (!armyDead()) {
				attacked = true;
				trimpAttacks++;
				trimpAttack = saveData.atk;
				if (!saveData.unlucky) trimpAttack *= 1 + saveData.range * rngRoll;
				if (frenzyLeft > 0) trimpAttack *= saveData.frenzyMult;
				if (saveData.duel) {
					saveData.critChance = 1 - duelPoints / 100;
					if (duelPoints > 50) trimpAttack *= 3;
				}

				rngCrit = saveData.critChance < 0.25 ? rng() : rngRoll;
				if (rngCrit < saveData.critChance) {
					trimpAttack *= saveData.critDamage;
					trimpCrit = true;
					trimpCrits++;
				}

				trimpAttack *= titimp > ticks ? 2 : 1;
				if (saveData.ice > 0) trimpAttack *= 2 - 0.366 ** (ice * saveData.ice);
				if (saveData.weakness) trimpAttack *= 1 - saveData.weakness * Math.min(debuff_stacks, 9);
				if (universe === 2 && equality > 0) trimpAttack *= trimpEqualityMult;
				enemyHealth -= trimpAttack + poison * saveData.poison;
				if (saveData.poison) poison += trimpAttack * (saveData.uberNature === 'Poison' ? 2 : 1) * saveData.natureIncrease;
				if (saveData.plaguebringer && enemyHealth >= 1) plague_damage += trimpAttack * saveData.plaguebringer;
				if (enemyHealth > 0 && saveData.glass) _glassNotOneShot();
				pbTurns++;

				if (checkFrenzy && (frenzyLeft < 0 || (frenzyRefresh && frenzyLeft < saveData.frenzyDuration / 2))) {
					const roll = Math.floor(Math.random() * 1000);

					if (roll < saveData.frenzyChance) {
						frenzyLeft = saveData.frenzyDuration;
						frenzyRefresh = true;
					}
				}
			}

			if (!fast && enemyHealth >= 1 && !armyDead()) {
				enemyAttackTemp = enemy_hit(enemyAttack, rngRoll);
			}

			if (saveData.mayhem && mayhemPoison >= 1) trimpHealth -= mayhemPoison;

			if (enemyHealth >= 1) {
				if (saveData.glass) glassStacks++;

				if (!armyDead() && saveData.gammaMult > 1) {
					gammaStacks++;

					if (gammaStacks >= saveData.gammaCharges) {
						gammaBursts++;
						gammaStacks = 0;
						const burstDamage = trimpAttack * saveData.gammaMult;
						enemyHealth -= burstDamage;
						if (saveData.plaguebringer && enemyHealth >= 1) plague_damage += burstDamage * saveData.plaguebringer;
					}
				}
			}

			if (attacked && saveData.ice > 0) {
				ice += saveData.natureIncrease;
				if (saveData.uberNature === 'Ice' && ice > 20 && enemyHealth / enemy_max_hp < 0.5) {
					shattered = true;
					enemyHealth = 0;
				}
			}

			if (saveData.bleed) trimpHealth -= saveData.bleed * saveData.health;
			if (saveData.plague) trimpHealth -= debuff_stacks * saveData.plague * saveData.health;

			if (saveData.duel) {
				duelPoints = _handleDuelPoints(duelPoints, enemyCrit, trimpCrit, turns, oneShot, enemyHealth, trimpHealth);
			}

			if (armyDead()) {
				deathVarsReset();
			}

			/* safety precaution for if you can't kill the enemy fast enough and trimps don't die due to low enemy damage */
			if (enemyHealth < 0) ok_spread = saveData.ok_spread;
			if (turns >= 1000) {
				ticks = Infinity;
			}
			if (titimp > 0) titimp -= saveData.titimpReduction;
			frenzyLeft -= saveData.speed / 10;
		}

		if (saveData.explosion && (saveData.explosion <= 15 || (block >= saveData.health && universe !== 2))) {
			trimpHealth -= Math.max(0, saveData.explosion * Math.max(0, enemyAttackTemp) - block);

			if (armyDead()) {
				deathVarsReset();
			}
		}

		loot++;

		if (ok_spread > 0) {
			ok_damage = shattered ? Infinity : -enemyHealth * saveData.overkill;
			shattered = false;
		}

		/* +(turns>0) adds 1 to the counter when not overkilling which accounts for the extra 0.1s from the death phase */
		/* saveData.deathPhase is +0.1s then adding ticks from each turn */
		ticks += +(turns > 0) + saveData.deathPhase + Math.ceil(turns * saveData.speed);

		if (saveData.titimp && imp < 0.03) {
			const newTitimp = Math.max(titimp, ticks) + 300;
			titimp = Math.min(newTitimp, ticks + 450);
		}

		/* handles post death Nature effects. */
		if (magma) {
			const increasedBy = pbTurns * saveData.natureIncrease;
			/* u1 Nature */
			if (saveData.wind > 0) {
				wind = Math.min(wind + increasedBy, saveData.windCap);
				loot += wind * saveData.wind;
				wind = Math.ceil(saveData.transfer * wind) + saveData.natureIncrease + Math.ceil((pbTurns - 1) * increasedBy * saveData.plaguebringer);
				wind = Math.min(wind, saveData.windCap);
			}

			if (saveData.poison > 0) {
				poison = Math.ceil(saveData.transfer * poison + plague_damage) + 1;
			}

			if (saveData.ice > 0) {
				ice = Math.max(Math.ceil(saveData.transfer * ice) + increasedBy + Math.ceil((pbTurns - 1) * saveData.plaguebringer), 0);
			}
		}

		if (saveData.glass) {
			if (zone >= saveData.zone) glassStacks -= 2; /* overkill removes multiple stacks */
			glassStacks = Math.max(0, glassStacks);
		}

		++cell;
		++kills;

		if (saveData.berserkFrenzy && turns !== 0) {
			if (berserkStacks === 0) {
				if (rngRoll < 0.05) {
					berserkStacks++;
					saveData.atk *= 1.5;
					const oldBonus = 1 - berserkWeakened * 0.0499;
					const newBonus = 1 - berserkStacks * 0.02;
					saveData.health *= newBonus / oldBonus;

					if (trimpHealth > saveData.health) trimpHealth = saveData.health;
				}
			} else if (berserkStacks > 0 && berserkStacks < 25) {
				saveData.atk /= 1 + berserkStacks * 0.5;
				const oldBonus = 1 - berserkStacks * 0.02;
				berserkStacks++;
				saveData.atk *= 1 + berserkStacks * 0.5;
				const newBonus = 1 - berserkStacks * 0.02;
				saveData.health *= newBonus / oldBonus;
			}

			if (berserkStacks > 0) {
				trimpHealth += saveData.health / 100;
				if (trimpHealth > saveData.health) trimpHealth = saveData.health;
			}
		}

		if (cell >= size) {
			cell = 0;
			plague_damage = 0;
			ok_damage = 0;
			ok_spread = 0;
			energyShield = energyShieldMax;
			mapClears++;
			if (wind > 0) loot += wind * saveData.wind * cacheLoot;
			else loot += cacheLoot;
		}
	}

	if (mapClears > 0 && specialTime > 0) loot *= mapClears * specialTime;

	if (mapClears === 0 || ticks === Infinity) {
		loot = 0;
		kills = 0;
	}

	const debugResults = {
		zone,
		ticks,
		loot,
		maxTicks,
		mapClears,
		kills,
		deaths,
		enemyAttacks,
		enemy_max_hp,
		enemyHealth,
		enemyCrits,
		enemyCC,
		trimpAttack,
		trimpAttackOrig: saveData.atk,
		trimpAttacks,
		trimpCrits,
		trimpHealth,
		trimpAttack,
		trimpCC: saveData.critChance,
		stance,
		gammaBursts,
		equality,
		rngRoll
	};

	/* simulationDebug(debugResults); */

	return {
		speed: (loot * 10) / maxTicks,
		equality,
		killSpeed: kills / (ticks / 10),
		deaths,
		deathsPerSec: deaths / (ticks / 10),
		special: specialData,
		debugResults
	};
}

function simulationDebug(debugResults) {
	const { zone, ticks, loot, maxTicks, mapClears, kills, deaths, enemyAttacks, enemy_max_hp, enemyHealth, enemyCrits, enemyCC, trimpAttacks, trimpCrits, trimpHealth, trimpAttack, trimpAttackOrig, trimpCC, stance, gammaBursts, equality, rngRoll } = debugResults;

	console.log(`Zone: ${zone}
		Ticks: ${ticks}
		Loot: ${prettify(loot)} (value: ${prettify((loot * 10) / maxTicks)})
		Map Clears: ${mapClears}
		Kills: ${kills} (${(kills / (ticks / 10)).toFixed(3)} cps)
		Deaths: ${deaths} (${(deaths / (ticks / 10)).toFixed(3)} dps)
		Enemy Attacks: ${enemyAttacks}
		Enemy Max HP: ${prettify(enemy_max_hp)} Enemy Health: ${prettify(enemyHealth)}
		Enemy Crits: ${enemyCrits} (${((enemyCrits / enemyAttacks) * 100).toFixed(2)}% - Expected Crit Chance ${(enemyCC * 100).toFixed(2)}%)
		Trimp Attacks: ${trimpAttacks}
		Trimp Crits: ${trimpCrits} (${((trimpCrits / trimpAttacks) * 100).toFixed(2)}% - Expected Crit Chance ${(trimpCC * 100).toFixed(2)}%)
		Trimp Health: ${prettify(trimpHealth)}
		Trimp Attack: ${prettify(trimpAttack)} - (orig ${prettify(trimpAttackOrig)})
		Gamma Bursts: ${gammaBursts}
		Stance: ${stance}; Equality: ${equality}
		rngRoll: ${rngRoll}
	`);
}

//Return info about the best zone for each stance
function get_best(results, fragmentCheck, mapModifiers, popup = false) {
	const best = { loot: { mapLevel: 0 }, speed: { mapLevel: 0, value: 0, speed: 0, killSpeed: 0 } };
	if (!popup && !game.global.mapsUnlocked) return best;

	let [stats, stances] = results;
	stats = [...stats.slice()];
	stats.sort((a, b) => b.mapLevel - a.mapLevel);

	if (fragmentCheck) {
		if (!mapModifiers) {
			mapModifiers = {
				special: getAvailableSpecials('lmc'),
				biome: getBiome()
			};
		}

		const forcePerfect = typeof atConfig !== 'undefined' && getPageSetting('onlyPerfectMaps');
		const fragments = game.resources.fragments.owned;
		for (let i = 0; i <= stats.length - 1; i++) {
			if (forcePerfect && stats[i].zone !== 6) {
				if (findMap(stats[i].mapLevel, mapModifiers.special, mapModifiers.biome, forcePerfect)) continue;
				if (fragments >= mapCost(stats[i].mapLevel, mapModifiers.special, mapModifiers.mapBiome, [9, 9, 9])) break;

				if (stats.length > 1) {
					stats.splice(i, 1);
					i--;
				}
			}
		}
	}

	const statsLoot = [...stats];
	const statsSpeed = [...stats];

	for (const stance of stances) {
		statsLoot.sort((a, b) => {
			if (a[stance] && b[stance]) {
				return b[stance].value - a[stance].value;
			}

			return 0;
		});
		best.loot[stance] = statsLoot[0].zone;

		statsSpeed.sort((a, b) => {
			if (a[stance] && b[stance]) {
				return a[stance].killSpeed - b[stance].killSpeed;
			}

			return 0;
		});
		best.speed[stance] = statsSpeed[0].zone;
	}

	function getBestStats(stats, type) {
		const bestMapData = stats[0];
		const stanceData = bestMapData[bestMapData.stance];
		const bestStats = {
			...best[type],
			mapLevel: bestMapData.mapLevel,
			zone: bestMapData.zone,
			value: stanceData.value,
			speed: stanceData.speed,
			killSpeed: stanceData.killSpeed,
			stance: bestMapData.stance,
			mapConfig: bestMapData.mapConfig
		};

		if (game.global.universe === 2) bestStats.equality = bestMapData.equality;

		const backupMapData = stats[1];
		if (backupMapData) {
			const stanceData = backupMapData[backupMapData.stance];
			bestStats[`${type}Second`] = {
				mapLevel: backupMapData.mapLevel,
				zone: backupMapData.zone,
				value: stanceData.value,
				speed: stanceData.speed,
				killSpeed: stanceData.killSpeed,
				mapConfig: bestMapData.mapConfig
			};

			if (game.global.universe === 1) bestStats[`${type}Second`].stance = backupMapData.stance;
			if (game.global.universe === 2) bestStats[`${type}Second`].equality = backupMapData.equality;

			bestStats.ratio = bestMapData.value / backupMapData.value;
		} else {
			bestStats.ratio = 100;
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

function farmCalcSetMapSliders() {
	if (!game.global.preMapsActive) return;
	if (typeof hdStats !== 'object' || typeof hdStats.autoLevelData.loot.mapConfig === 'undefined') return;

	const { mapOwned, id, plusLevel, level, special, biome, sliders, perfect } = hdStats.autoLevelData.loot.mapConfig;

	if (mapOwned) {
		selectMap(id);
		return;
	}

	const currentLevel = Number(document.getElementById('mapLevelInput').value);
	document.getElementById('biomeAdvMapsSelect').value = biome;
	document.getElementById('advExtraLevelSelect').value = plusLevel > 0 ? plusLevel : 0;
	document.getElementById('advSpecialSelect').value = special;
	document.getElementById('lootAdvMapsRange').value = sliders.loot;
	document.getElementById('sizeAdvMapsRange').value = sliders.size;
	document.getElementById('difficultyAdvMapsRange').value = sliders.difficulty;
	document.getElementById('mapLevelInput').value = Math.min(level, game.global.world);

	if (plusLevel > 0 && currentLevel < game.global.world && getHighestLevelCleared() >= getUnlockZone('extra')) setAdvExtraZoneText();

	if (getHighestLevelCleared() >= getUnlockZone('perfect')) checkSlidersForPerfect();
	const perfectElem = document.getElementById('advPerfectCheckbox');
	if (String(perfectElem.dataset.checked) !== String(perfect)) {
		swapNiceCheckbox(perfectElem, perfect);
		updateMapNumbers();
	}

	updateMapCost();
}

function farmCalcGetMapDetails() {
	if (typeof hdStats !== 'object' || typeof hdStats.autoLevelData.loot.mapConfig === 'undefined') return;

	const { mapOwned, name, level, plusLevel, special, biome, difficulty, size, loot, sliders, perfect } = hdStats.autoLevelData.loot.mapConfig;
	const calcName = typeof atConfig !== 'undefined' ? 'Auto Level' : 'Farm Calc';
	const lootText = typeof atConfig !== 'undefined' ? 'loot' : '';

	let text = `<p>Details of the ${lootText} map you own that ${calcName} recommends you run:`;
	if (!mapOwned) text = `<p>Details for the ${lootText} map that ${calcName} is recommending you purchase to run:`;

	if (mapOwned) text += `<br><b>Map Name:</b> ${name}`;
	text += `<br><b>Map Level:</b> ${Math.min(level, game.global.world)}`;
	if (plusLevel > 0) text += ` (+${plusLevel})`;
	text += `<br><b>Special:</b> ${special !== undefined && special !== '0' ? mapSpecialModifierConfig[special].name : 'None'}`;
	text += `<br><b>Biome:</b> ${biome === 'Plentiful' ? 'Gardens' : biome}`;
	text += `<br><b>Difficulty:</b> ${Math.floor(difficulty * 100)}%`;
	if (!mapOwned) text += ` (slider: ${sliders.difficulty})`;
	text += `<br><b>Size:</b> ${size}`;
	if (!mapOwned) text += ` (slider: ${sliders.size})`;
	text += `<br><b>Loot:</b> ${Math.floor(loot * 100)}%`;
	if (!mapOwned) text += ` (slider: ${sliders.loot})`;
	if (!mapOwned) text += `<br><b>Perfect Sliders:</b> ${perfect.toString().charAt(0).toUpperCase() + perfect.toString().slice(1)}`;
	text += '</p>';

	return text;
}

/* if using standalone version then when loading farmCalc file also load CSS & breedtimer+calc+farmCalcStandalone files. */
if (typeof autoTrimpSettings === 'undefined' || (typeof autoTrimpSettings !== 'undefined' && typeof autoTrimpSettings.ATversion !== 'undefined' && !autoTrimpSettings.ATversion.includes('SadAugust'))) {
	if (typeof hdStats !== 'object') hdStats = {};
	function updateAdditionalInfo() {
		if (!usingRealTimeOffline) {
			const infoElem = document.getElementById('additionalInfo');
			const infoStatus = makeAdditionalInfo_Standalone();
			if (infoElem.innerHTML !== infoStatus) infoElem.innerHTML = infoStatus;
		}
	}

	(async function () {
		let basepathFarmCalc = 'https://sadaugust.github.io/AutoTrimps/';
		if (typeof localVersion !== 'undefined') basepathFarmCalc = 'https://localhost:8887/AutoTrimps_Local/';
		const mods = ['farmCalcStandalone'];
		const modules = ['breedtimer', 'calc', 'import-export'];

		const linkStylesheet = document.createElement('link');
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

			hdStats.counter = 0;
			updateAdditionalInfo();
			document.getElementById('additionalInfo').parentNode.setAttribute('onmouseover', makeAdditionalInfoTooltip_Standalone(true));

			setInterval(function () {
				if (game.options.menu.pauseGame.enabled) return;

				hdStats.counter++;
				document.getElementById('additionalInfo').parentNode.setAttribute('onmouseover', makeAdditionalInfoTooltip_Standalone(true));

				if (hdStats.counter % 10 === 0) updateAdditionalInfo();
			}, 1000);

			console.log('The farm calculator mod has finished loading.');
			message('The farm calculator mod has finished loading.', 'Loot');
		} catch (error) {
			console.error('Error loading script', error);
			message('Farm Calc has failed to load. Refresh your page and try again.', 'Loot');
			tooltip('Failed to load Farm Calc', 'customText', undefined, 'Farm Calc has failed to load. Refresh your page and try again.');
			verticalCenterTooltip(true);
		}
	})();
}
