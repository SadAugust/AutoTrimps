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

MODULES.zFarm = {};

// Return a timer for your current breedtime. 
//Doesn't displays decimals (yet). Need to implement that.
function compute_breed_timer() {
	var potency = game.resources.trimps.potency;
	potency *= 1.1 ** game.upgrades.Potency.done;
	potency *= 1.01 ** game.buildings.Nursery.owned;
	potency *= 1.003 ** game.unlocks.impCount.Venimp;

	if (game.global.brokenPlanet) potency *= 0.1;
	potency *= 1 + (game.portal.Pheromones.level * game.portal.Pheromones.modifier);
	if (game.singleRunBonuses.quickTrimps.owned) potency *= 2;

	//Dailies
	if (challengeActive('Daily')) {
		//Dysfunctional
		if (typeof game.global.dailyChallenge.dysfunctional !== 'undefined')
			potency *= dailyModifiers.dysfunctional.getMult(game.global.dailyChallenge.dysfunctional.strength);

		//Toxic
		if (typeof game.global.dailyChallenge.toxic !== 'undefined')
			potency *= dailyModifiers.toxic.getMult(game.global.dailyChallenge.toxic.strength, game.global.dailyChallenge.toxic.stacks);
	}


	if (challengeActive('Toxicity') && game.challenges.Toxicity.stacks > 0)
		potency *= Math.pow(game.challenges.Toxicity.stackMult, game.challenges.Toxicity.stacks);

	//TO ADD THIS!
	//Heirlooms
	/* potency = calcHeirloomBonusDecimal("Shield", "breedSpeed", potency); */

	potency *= 0.98 ** game.jobs.Geneticist.owned;

	//Mutators
	if (game.global.universe === 2) {
		//Archaeology
		if (challengeActive('Archaeology'))
			potency *= game.challenges.Archaeology.getStatMult('breed');

		//Quagmire
		if (challengeActive('Quagmire')) {
			potency *= game.challenges.Quagmire.getExhaustMult();
		}
		//Gene Attack
		if (u2Mutations.tree.GeneAttack.purchased) potency /= 50;
		//Gene Health
		if (u2Mutations.tree.GeneHealth.purchased) potency /= 50;
	}

	var army_size = game.resources.trimps.getCurrentSend();

	var breeders = game.resources.trimps.realMax();
	breeders -= trimpsEffectivelyEmployed();

	return Math.ceil(Math.log(breeders / (breeders - army_size)) / Math.log(1 + potency));
}

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
		breed_timer: compute_breed_timer(),
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
		} else if (challengeActive('Balance')) {
			enemyHealth *= 2;
			enemyAttack *= 2.35;
		} else if (challengeActive('Meditate')) {
			enemyHealth *= 2;
			enemyAttack *= 1.5;
		} else if (challengeActive('Electricity')) {
			death_stuff.weakness = 0.1;
			death_stuff.plague = 0.1;
		} else if (challengeActive('Daily')) {
			var daily = (mod) => game.global.dailyChallenge[mod] ? game.global.dailyChallenge[mod].strength : 0;
			minFluct -= daily('minDamage') ? 0.09 + 0.01 * daily('minDamage') : 0;
			maxFluct += daily('maxDamage');

			death_stuff.plague = 0.01 * daily('plague');
			death_stuff.bleed = 0.01 * daily('bogged');
			death_stuff.weakness = 0.01 * daily('weakness');
			death_stuff.enemy_cd = 1 + 0.5 * daily('crits');
			death_stuff.explosion = daily('explosive');
		} else if (challengeActive('Life')) {
			enemyHealth *= 11;
			enemyAttack *= 6;
			trimpAttack *= 1 + (0.1 * game.challenges.Life.stacks);
			death_stuff.max_hp *= 1 + (0.1 * game.challenges.Life.stacks);
		} else if (challengeActive('Crushed') && death_stuff.max_hp < death_stuff.block) {
			death_stuff.enemy_cd = 5;
		} else if (challengeActive('Nom')) {
			death_stuff.bleed = 0.05;
		} else if (challengeActive('Toxicity')) {
			enemyHealth *= 2;
			enemyAttack *= 5;
			death_stuff.bleed = 0.05;
		} else if (challengeActive('Watch')) {
			enemyAttack *= 1.25;
		} else if (challengeActive('Lead')) {
			enemyHealth *= 1 + 0.04 * game.challenges.Lead.stacks;
			enemyAttack *= 1 + 0.04 * game.challenges.Lead.stacks;
			death_stuff.bleed = Math.min(game.challenges.Lead.stacks, 200) * 0.0003;
		} else if (challengeActive('Corrupted')) {
			// Corruption scaling doesn’t apply to normal maps below Corrupted’s endpoint
			enemyAttack *= 3;
		} else if (challengeActive('Obliterated')) {
			enemyHealth *= 1e12 * 10 ** floor(zone / 10);
			enemyAttack *= 1e12 * 10 ** floor(zone / 10);
		} else if (challengeActive('Eradicated')) {
			enemyHealth *= 1e20 * 3 ** floor(zone / 2);
			enemyAttack *= 1e20 * 3 ** floor(zone / 2);
			natureStart = 1;
			death_stuff.magma = true;
		}
		//TO ADD - No crit + %hp means death
		else if (challengeActive('Frigid')) {
			enemyHealth *= game.challenges.Frigid.getEnemyMult();
			enemyAttack *= game.challenges.Frigid.getEnemyMult();
		}
		else if (challengeActive('Experience')) {
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
		else if (challengeActive('Unbalance')) {
			enemyHealth *= 2;
			enemyAttack *= 1.5
		}
		//DUEL
		else if (challengeActive('Duel')) {
			death_stuff.enemy_cd = 10;
		}
		else if (challengeActive('Wither')) {
			enemyHealth *= game.challenges.Wither.getTrimpHealthMult();
			enemyAttack *= game.challenges.Wither.getEnemyAttackMult();
		} else if (challengeActive('Quest')) {
			enemyHealth *= game.challenges.Quest.getHealthMult();
		} else if (challengeActive('Quagmire')) {
			var exhaustedStacks = game.challenges.Quagmire.exhaustedStacks;
			var mod = 0.05;
			if (exhaustedStacks === 0) enemyAttack *= 1;
			else if (exhaustedStacks < 0) enemyAttack *= Math.pow((1 + mod), Math.abs(exhaustedStacks));
			else enemyAttack *= Math.pow((1 - mod), exhaustedStacks);
		} else if (challengeActive('Revenge')) {
			if (game.global.world % 2 === 0) enemyHealth *= 10;
		} else if (challengeActive('Archaeology')) {
			enemyAttack *= game.challenges.Archaeology.getStatMult('enemyAttack');
		} else if (challengeActive('Mayhem')) {
			enemyHealth *= game.challenges.Mayhem.getEnemyMult();
			enemyAttack *= game.challenges.Mayhem.getEnemyMult();
		} else if (challengeActive('Berserk')) {
			enemyHealth *= 1.5;
			enemyAttack *= 1.5;
		} else if (challengeActive('Exterminate')) {
			enemyHealth *= game.challenges.Exterminate.getSwarmMult();
		} else if (challengeActive('Nurture')) {
			enemyHealth *= 10;
			enemyHealth *= game.buildings.Laboratory.getEnemyMult();
			enemyAttack *= 2
			enemyAttack *= game.buildings.Laboratory.getEnemyMult();
		} else if (challengeActive('Pandemonium')) {
			enemyHealth *= game.challenges.Pandemonium.getPandMult();
			enemyAttack *= game.challenges.Pandemonium.getPandMult();
		} else if (challengeActive('Desolation')) {
			enemyHealth *= game.challenges.Desolation.getEnemyMult();
			enemyAttack *= game.challenges.Desolation.getEnemyMult();
		} else if (challengeActive('Alchemy')) {
			enemyHealth *= alchObj.getEnemyStats(false, false) + 1;
		} else if (challengeActive('Hypothermia')) {
			enemyHealth *= game.challenges.Hypothermia.getEnemyMult();
			enemyAttack *= game.challenges.Hypothermia.getEnemyMult();
		} else if (challengeActive('Glass')) {
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
		range: (maxFluct / minFluct) - 1,
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

		//Death Info
		...death_stuff
	}
}

// Return a list of efficiency stats for all sensible zones
function stats() {

	var saveData = populateZFarmData();

	var stats = [];
	extra = 0;
	if (game.global.universe === 2 ? saveData.hze >= 50 : saveData.hze >= 210)
		while (extra < 10 && saveData.fragments > perfectMapCost_Actual(extra, getAvailableSpecials('lmc'), saveData.biome)) {
			++extra;
		}
	extra = extra || -saveData.reducer;

	for (var mapLevel = saveData.zone + extra; mapLevel >= 6; --mapLevel) {
		if (saveData.coordinate) {
			var coords = 1;
			for (var z = 1; z < mapLevel; ++z)
				coords = Math.ceil(1.25 * coords);
			saveData.challenge_health = coords;
			saveData.challenge_attack = coords;
		}
		var tmp = zone_stats(mapLevel, saveData.stances, saveData);
		if (tmp.value < 1 && mapLevel >= saveData.zone)
			continue;
		if (stats.length && tmp.value < 0.804 * stats[0].value)
			break;
		stats.unshift(tmp);
	}

	return [stats, saveData.stances];
}

// Return efficiency stats for the given zone
function zone_stats(zone, stances, g) {
	var result = {
		mapLevel: zone - g.zone,
		zone: 'z' + zone,
		value: 0,
		stance: '',
		loot: 100 * (zone < g.zone ? 0.8 ** (g.zone - g.reducer - zone) : 1.1 ** (zone - g.zone)),
	};

	//Bionic 1.5x dmg Talent
	if (mastery('bionic2') && zone > g.zone)
		g.atk *= 1.5;

	stanceCheck = stances;
	if (!stances) stances = 'X';
	for (var stance of stances) {
		g.atk = g.attack * (stance == 'D' ? 4 : stance == 'X' ? 1 : 0.5);
		var simulationResults = simulate(g, zone, stance);
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
function simulate(g, zone) {
	var trimp_hp = g.trimpHealth;
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
	var energyShieldMax = g.trimpShield;
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
		equality = equalityQuery(enemyName, zone, g.size, 'map', g.difficulty);
	}
	var biomeImps = g.biome;
	const max_ticks = 86400; // One day
	//const max_ticks = 3600; // One hour
	var hp_array = []
	var atk_array = [];
	for (var i = 0; i < g.size; ++i) {
		var hp = calcEnemyBaseHealth('map', zone, (cell + 1), 'Chimp');
		if (g.magma)
			hp *= calcCorruptionScale(g.zone, 10) / 2;

		var atk = calcEnemyBaseAttack('map', zone, (cell + 1), 'Chimp');
		if (g.magma)
			atk *= calcCorruptionScale(zone, 3) / 2;

		cell++;
		if (runningDomination) {
			if (cell === g.size) {
				atk *= 2.5;
				hp *= 7.5;
			} else {
				atk *= 0.1;
				hp *= 0.1;
			}
		}
		atk_array.push(g.difficulty * g.challenge_attack * atk);
		hp_array.push(g.difficulty * g.challenge_health * hp);
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
			amt -= g.block;
		}

		if (runningFrigid && amt >= (g.trimpHealth / 5)) {
			amt = g.trimpHealth;
		}

		trimp_hp -= Math.max(0, amt);
	}

	function enemy_hit(atk) {
		var damage = atk;
		//Damage fluctations
		damage *= (g.fluctuation * rng());
		//Enemy crit chance
		var enemyCC = 0.25;
		if (runningDuel) {
			enemyCC = duelPoints / 100;
			if (duelPoints < 50) damage *= 3;
		}
		if (rng() < enemyCC) {
			damage *= g.enemy_cd;
			enemyCrit = true;
		}
		//Ice modifier
		damage *= 0.366 ** (ice * g.ice);
		damage *= Math.pow(0.9, equality);
		reduceTrimpHealth(damage);
		++debuff_stacks;
	}

	cell = 0;
	while (ticks < max_ticks) {
		var imp = rng();
		var imp_stats = imp < g.import_chance ? [1, 1, false] : biomeImps[Math.floor(rng() * biomeImps.length)];
		var atk = imp_stats[0] * atk_array[cell];
		var hp = imp_stats[1] * hp_array[cell];
		var enemy_max_hp = hp;
		var fast = g.fastEnemies || (imp_stats[2] && !g.nom) || runningDesolation;
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
				trimp_hp += (g.trimpHealth / 2);
				if (trimp_hp > g.trimpHealth) trimp_hp = g.trimpHealth;
			}
			// Fast enemy attack
			if (fast)
				enemy_hit(atk);

			// Trimp attack
			if (trimp_hp >= 1) {
				ok_spread = g.ok_spread;
				var damage = g.atk * (1 + g.range * rng());
				if (runningDuel) {
					g.critChance = 1 - (duelPoints / 100);
					if (duelPoints > 50) damage *= 3;
				} if (rng() < g.critChance) {
					damage *= g.critDamage;
					trimpCrit = true;
				}
				damage *= titimp > ticks ? 2 : 1;
				damage *= 2 - 0.366 ** (ice * g.ice);
				damage *= 1 - g.weakness * Math.min(debuff_stacks, 9);
				damage *= Math.pow(g.equalityMult, equality);
				hp -= damage + poison * g.poison;
				poison += damage;
				++ice;
				if (g.plaguebringer && hp >= 1)
					plague_damage += damage * g.plaguebringer;
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
				if (trimp_hp >= 1 && g.gammaMult > 1) {
					gammaStacks++;
					if (gammaStacks >= g.gammaCharges) {
						gammaStacks = 0;
						burstDamage = damage * g.gammaMult;
						hp -= burstDamage;
						if (g.plaguebringer && hp >= 1)
							plague_damage += (burstDamage * g.plaguebringer);
					}
				}
			}

			// Bleeds
			trimp_hp -= g.bleed * g.max_hp;
			trimp_hp -= debuff_stacks * g.plague * g.max_hp;

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
				ticks += Math.ceil(turns * g.speed);
				ticks = Math.max(ticks, last_group_sent + g.breed_timer);
				last_group_sent = ticks;
				trimpOverkill = Math.abs(trimp_hp);
				trimp_hp = g.max_hp;
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

				if (g.nom) {
					atk *= 1.25;
					hp = Math.min(hp + 0.05 * enemy_max_hp, enemy_max_hp);
				}
			}
		}
		if (g.explosion && (g.explosion <= 15 || g.block >= g.max_hp))
			trimp_hp -= Math.max(0, g.explosion * atk - g.block);

		wind = Math.min(wind + turns, 200);
		loot += 1 + wind * g.wind;
		if (g.ok_spread > 0) ok_damage = -hp * g.overkill;
		ticks += +(turns > 0) + +(g.speed > 9) + Math.ceil(turns * g.speed);
		if (g.titimp && imp < 0.03)
			titimp = Math.min(Math.max(ticks, titimp) + 300, ticks + 450);

		poison = Math.ceil(g.transfer * poison + plague_damage) + 1;
		wind = Math.ceil(g.transfer * wind) + 1 + Math.ceil((turns - 1) * g.plaguebringer);
		ice = Math.ceil(g.transfer * ice) + 1 + Math.ceil((turns - 1) * g.plaguebringer);

		if (runningGlass && zone >= g.zone) glassStacks -= 2;
		if (angelic && !runningBerserk) { //Angelic talent heal
			trimp_hp += (g.trimpHealth / 2);
			if (trimp_hp > g.trimpHealth) trimp_hp = g.trimpHealth;
		}
		if (runningBerserk) { //1% heal onkill
			trimp_hp += (g.trimpHealth / 100);
			if (trimp_hp > g.trimpHealth) trimp_hp = g.trimpHealth;
		}
		++cell;
		if (cell == g.size) {
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
function get_best(results) {
	if (!game.global.mapsUnlocked) return { overall: { mapLevel: 0 } };

	let [stats, stances] = results;
	stats.slice();

	if (stats.length === 0) return { overall: { mapLevel: 0 } };
	var best = { overall: "", second: "", ratio: 0 };
	best.stances = {};
	if (!stances) stances = 'X';
	/* jshint loopfunc:true */
	for (var stance of stances) {
		stats.sort((a, b) => b[stance].value - a[stance].value);
		best.stances[stance] = stats[0].zone;
	}

	stats.sort((a, b) => b.value - a.value);
	best.overall = {};
	best.overall.mapLevel = stats[0].mapLevel;
	best.overall.zone = stats[0].zone;
	if (game.global.universe === 1) best.overall.stance = stats[0].stance;
	if (game.global.universe === 2) best.overall.equality = stats[0].equality;
	if (stats[1]) {
		best.second = {};
		best.second.mapLevel = stats[1].mapLevel;
		best.second.zone = stats[1].zone;
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