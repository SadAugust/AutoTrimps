MODULES["other"] = {};
MODULES["other"].enableRoboTrimpSpam = true;

function armydeath() {
	if (game.global.mapsActive) return !1;
	var e = game.global.lastClearedCell + 1,
		l = game.global.gridArray[e].attack * dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks),
		a = game.global.soldierHealth;
	"Ice" == getEmpowerment() && (l *= game.empowerments.Ice.getCombatModifier());
	var g = game.global.soldierCurrentBlock;
	return (
		3 == game.global.formation ? (g /= 4) : "0" != game.global.formation && (g *= 2),
		g > game.global.gridArray[e].attack ? (l *= getPierceAmt()) : (l -= g * (1 - getPierceAmt())),
		challengeActive('Daily') && void 0 !== game.global.dailyChallenge.crits && (l *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength)),
		void 0 !== game.global.dailyChallenge.bogged && (a -= game.global.soldierHealthMax * dailyModifiers.bogged.getMult(game.global.dailyChallenge.bogged.strength)),
		void 0 !== game.global.dailyChallenge.plague && (a -= game.global.soldierHealthMax * dailyModifiers.plague.getMult(game.global.dailyChallenge.plague.strength, game.global.dailyChallenge.plague.stacks)),
		challengeActive('Electricity') && (a -= game.global.soldierHealth -= game.global.soldierHealthMax * (0.1 * game.challenges.Electricity.stacks)),
		"corruptCrit" == game.global.gridArray[e].corrupted
			? (l *= 5)
			: "healthyCrit" == game.global.gridArray[e].corrupted
				? (l *= 7)
				: "corruptBleed" == game.global.gridArray[e].corrupted
					? (a *= 0.8)
					: "healthyBleed" == game.global.gridArray[e].corrupted && (a *= 0.7),
		(a -= l) <= 1e3
	);
}

function autoRoboTrimp() {
	if (game.global.roboTrimpLevel === 0) return;
	if (game.global.roboTrimpCooldown !== 0) return;
	if (getPageSetting("AutoRoboTrimp") > game.global.world) return;

	var shouldShriek = (game.global.world - parseInt(getPageSetting("AutoRoboTrimp"))) % 5 === 0;
	if (shouldShriek) {
		if (!game.global.useShriek) {
			magnetoShriek();
			debug("Activated Robotrimp MagnetoShriek Ability @ z" + game.global.world, "zone", "*podcast");
		}
	}
	else
		if (game.global.useShriek) magnetoShriek();
}

function isActiveSpireAT() {
	return !challengeActive('Daily') && game.global.spireActive && game.global.world >= getPageSetting('IgnoreSpiresUntil')
}

function disActiveSpireAT() {
	return challengeActive('Daily') && game.global.spireActive && game.global.world >= getPageSetting('dIgnoreSpiresUntil')
}

function exitSpireCell() {
	isActiveSpireAT() && game.global.lastClearedCell >= getPageSetting('ExitSpireCell') - 1 && endSpire()
}

function dailyexitSpireCell() {
	disActiveSpireAT() && game.global.lastClearedCell >= getPageSetting('dExitSpireCell') - 1 && endSpire()
}

function findLastBionicWithItems(bionicPool) {

	if (game.global.world < 115 || !bionicPool)
		return;
	if (challengeActive('Mapology') && !getPageSetting('mapology')) return;
	const targetPrestige = challengeActive('Mapology') ? autoTrimpSettings['mapologyPrestige'].selected : 'GambesOP';

	if (bionicPool.length > 1) {
		bionicPool.sort(function (bionicA, bionicB) { return bionicA.level - bionicB.level });
		while (bionicPool.length > 1 && equipsToGet(bionicPool[0].level, targetPrestige)[0] === 0) {
			if (challengeActive('Experience') && game.global.world > 600 && bionicPool[0].level >= getPageSetting('experienceEndBW')) break;
			bionicPool.shift();
			if (equipsToGet(bionicPool[0].level, targetPrestige)[0] !== 0) break;
		}
	}

	return bionicPool[0];
}

//Helium

function trimpcide() {
	if (game.portal.Anticipation.level === 0) return;

	var antistacklimit = (game.talents.patience.purchased) ? 45 : 30;
	if (game.global.fighting && ((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) >= antistacklimit && (game.global.antiStacks < antistacklimit || antistacklimit == 0 && game.global.antiStacks >= 1) && !game.global.spireActive)
		forceAbandonTrimps();
	if (game.global.fighting && ((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) >= antistacklimit && game.global.antiStacks < antistacklimit && game.global.mapsActive) {
		if (getCurrentMapObject().location == "Void") {
			abandonVoidMap();
		}
	}
}

function avoidempower() {
	if (game.global.universe == 1 && armydeath()) {
		if (typeof game.global.dailyChallenge.bogged === 'undefined' && typeof game.global.dailyChallenge.plague === 'undefined') {
			mapsClicked(true);
			mapsClicked(true);
			return;
		}
	}
}

var spirebreeding = false;
function ATspirebreed() {
	if (!spirebreeding && getPageSetting('SpireBreedTimer') > 0 && getPageSetting('IgnoreSpiresUntil') <= game.global.world && game.global.spireActive)
		var prespiretimer = game.global.GeneticistassistSetting;
	if (getPageSetting('SpireBreedTimer') > 0 && getPageSetting('IgnoreSpiresUntil') <= game.global.world && game.global.spireActive && game.global.GeneticistassistSetting != getPageSetting('SpireBreedTimer')) {
		spirebreeding = true;
		if (game.global.GeneticistassistSetting != getPageSetting('SpireBreedTimer'))
			game.global.GeneticistassistSetting = getPageSetting('SpireBreedTimer');
	}
	if (getPageSetting('SpireBreedTimer') > 0 && getPageSetting('IgnoreSpiresUntil') <= game.global.world && !game.global.spireActive && game.global.GeneticistassistSetting == getPageSetting('SpireBreedTimer')) {
		spirebreeding = false;
		if (game.global.GeneticistassistSetting == getPageSetting('SpireBreedTimer')) {
			game.global.GeneticistassistSetting = prespiretimer;
			toggleGeneticistassist();
			toggleGeneticistassist();
			toggleGeneticistassist();
			toggleGeneticistassist();
		}
	}
}

function fightalways() {
	if (game.global.gridArray.length === 0 || game.global.preMapsActive || !game.upgrades.Battle.done || game.global.fighting || (game.global.spireActive && game.global.world >= getPageSetting('IgnoreSpiresUntil')))
		return;
	if (!game.global.fighting)
		fightManual();
}

function getZoneEmpowerment(zone) {
	if (!zone) return 'None';
	var natureStartingZone = game.global.universe === 1 ? getNatureStartZone() : 236;
	if (zone < natureStartingZone) return 'None';
	var activeEmpowerments = ["Poison", "Wind", "Ice"];
	zone = Math.floor((zone - natureStartingZone) / 5);
	zone = zone % activeEmpowerments.length;
	return activeEmpowerments[zone];
}

//Radon
function archstring() {
	if (!getPageSetting('archaeology')) return;
	if (getPageSetting('archaeologyString1') != "undefined" && getPageSetting('archaeologyString2') != "undefined" && getPageSetting('archaeologyString3') != "undefined") {
		var string1 = getPageSetting('archaeologyString1'), string2 = getPageSetting('archaeologyString2'), string3 = getPageSetting('archaeologyString3');
		var string1z = string1.split(',')[0], string2z = string2.split(',')[0];
		var string1split = string1.split(',').slice(1).toString(), string2split = string2.split(',').slice(1).toString();
		if (game.global.world <= string1z && game.global.archString != string1split) game.global.archString = string1split;
		if (game.global.world > string1z && game.global.world <= string2z && game.global.archString != string2split) game.global.archString = string2split;
		if (game.global.world > string2z && game.global.archString != string3) game.global.archString = string3;
	}
}

var fastimps =
	[
		"Snimp",
		"Kittimp",
		"Gorillimp",
		"Squimp",
		"Shrimp",
		"Chickimp",
		"Frimp",
		"Slagimp",
		"Lavimp",
		"Kangarimp",
		"Entimp",
		"Fusimp",
		"Carbimp",
		"Ubersmith",
		"Shadimp",
		"Voidsnimp",
		"Prismimp",
		"Sweltimp",
		"Indianimp",
		"Improbability",
		"Neutrimp",
		"Cthulimp",
		"Omnipotrimp",
		"Mutimp",
		"Hulking_Mutimp",
		"Liquimp",
		"Poseidimp",
		"Darknimp",
		"Horrimp",
		"Arachnimp",
		"Beetlimp",
		"Mantimp",
		"Butterflimp",
		"Frosnimp"
	];

function remainingHealth(forceMax) {
	var soldierHealth = game.global.soldierHealth
	if (game.global.universe == 2) {
		var maxLayers = Fluffy.isRewardActive('shieldlayer');
		var layers = maxLayers - game.global.shieldLayersUsed;
		var shieldHealth = 0;
		if (maxLayers > 0) {
			for (var i = 0; i <= maxLayers; i++) {
				if (layers != maxLayers && i > layers)
					continue;
				if (i == maxLayers - layers) {
					shieldHealth += game.global.soldierEnergyShieldMax;
				}
				else
					shieldHealth += game.global.soldierEnergyShield;
			}
		}
		else {
			shieldHealth = game.global.soldierEnergyShield;
		}
		shieldHealth = shieldHealth < 0 ? 0 : shieldHealth;
	}
	var remainingHealth = shieldHealth + (!forceMax ? soldierHealth * .33 : soldierHealth);
	if ((challengeActive('Quest') && currQuest() == 8) || challengeActive('Bublé'))
		remainingHealth = shieldHealth;
	if (shieldHealth + soldierHealth == 0) {
		remainingHealth = game.global.soldierHealthMax + (game.global.soldierEnergyShieldMax * (maxLayers + 1))
		if ((challengeActive('Quest') && currQuest() == 8) || challengeActive('Bublé'))
			remainingHealth = game.global.soldierEnergyShieldMax * (maxLayers + 1);
	}

	return (remainingHealth)
}

function equalityManagementBasic() {
	if (game.global.preMapsActive) return;
	if (game.global.gridArray.length <= 0) return;
	//Looking to see if the enemy that's currently being fought is fast.
	var fastEnemy = fastimps.includes(getCurrentEnemy().name);
	//Checking if the map that's active is a Deadly voice map which always has first attack.
	var voidDoubleAttack = game.global.mapsActive && getCurrentMapObject().location == "Void" && getCurrentMapObject().voidBuff == 'doubleAttack';
	//Checking if the Frenzy buff is active.
	var noFrenzy = game.portal.Frenzy.frenzyStarted == "-1" && !autoBattle.oneTimers.Mass_Hysteria.owned && game.portal.Frenzy.radLevel > 0;
	//Checking if the experience buff is active during Exterminate.
	var experienced = challengeActive('Exterminate') && game.challenges.Exterminate.experienced;
	//Checking to see if the Glass challenge is being run where all enemies are fast.
	var runningGlass = challengeActive('Glass');
	var runningDesolation = challengeActive('Desolation');

	//Toggles equality scaling on
	if ((fastEnemy && !experienced) || voidDoubleAttack || noFrenzy || runningGlass || runningDesolation) {
		if (!game.portal.Equality.scalingActive) {
			game.portal.Equality.scalingActive = true;
			manageEqualityStacks();
			updateEqualityScaling();
		}
		//Toggles equality scaling off and sets equality stacks to 0
	} else {
		if (game.portal.Equality.scalingActive) {
			game.portal.Equality.scalingActive = false;
			game.portal.Equality.disabledStackCount = "0";
			manageEqualityStacks();
			updateEqualityScaling();
		}
	}
}

function callAutoMapLevel(currentMap, currentAutoLevel, special, maxLevel, minLevel, floorCrit) {
	if (currentMap === undefined || currentAutoLevel === Infinity) {
		if (currentAutoLevel === Infinity) currentAutoLevel = autoMapLevel(special, maxLevel, minLevel, floorCrit);
		if (currentAutoLevel !== Infinity && twoSecondInterval) currentAutoLevel = autoMapLevel(special, maxLevel, minLevel, floorCrit);
	}

	//Increasing Map Level
	if (sixSecondInterval && currentMap !== undefined && (autoMapLevel(special, maxLevel, minLevel, floorCrit) > currentAutoLevel)) {
		currentAutoLevel = autoMapLevel(special, maxLevel, minLevel, floorCrit);
	}

	//Decreasing Map Level
	if (sixSecondInterval && currentMap !== undefined && (autoMapLevel(special, maxLevel, minLevel, floorCrit, true) < currentAutoLevel)) {
		currentAutoLevel = autoMapLevel(special, maxLevel, minLevel, floorCrit, true);
	}
	return currentAutoLevel
}

function autoMapLevel(special, maxLevel, minLevel, floorCrit, statCheck) {
	if (!game.global.mapsUnlocked) return 0;
	if (maxLevel > 10) maxLevel = 10;
	if (game.global.universe === 1) return autoMapLevelU1(special, maxLevel, minLevel, floorCrit, statCheck);
	if (!statCheck) statCheck = false;
	if (game.global.world + maxLevel < 6) maxLevel = 0 - (game.global.world + 6);
	if (challengeActive('Wither') && maxLevel >= 0 && minLevel !== 0) maxLevel = -1;
	if (challengeActive('Insanity') && maxLevel >= 0 && minLevel !== 0) minLevel = 0;

	var query = !special ? true : false;
	var maxLevel = typeof (maxLevel) === 'undefined' || maxLevel === null ? 10 : maxLevel;
	if (maxLevel > 0 && game.global.highestRadonLevelCleared + 1 < 50) maxLevel = 0;
	var minLevel = typeof (minLevel) === 'undefined' || minLevel === null ? 0 - game.global.world + 6 : minLevel;
	var special = !special ? (game.global.highestRadonLevelCleared > 83 ? 'lmc' : 'smc') : special;
	var biome = !biome ? (game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountain") : biome;
	var difficulty = 0.75;
	var runningQuest = challengeActive('Quest') && currQuest() == 8;
	var runningUnlucky = challengeActive('Unlucky')
	var ourHealth = calcOurHealth(runningQuest, 'map');
	var dmgType = runningUnlucky ? 'max' : 'avg'
	var dailyEmpowerToggle = getPageSetting('empowerAutoEquality');
	var dailyCrit = challengeActive('Daily') && typeof game.global.dailyChallenge.crits !== 'undefined'; //Crit
	var critType = 'maybe'
	if (challengeActive('Wither') || challengeActive('Glass') || challengeActive('Duel')) critType = 'never'

	for (y = maxLevel; y >= minLevel; y--) {
		var mapLevel = y;
		if (!runningUnlucky && mapLevel > 0) dmgType = 'min';
		if (y === minLevel) {
			return minLevel;
		}
		if (!statCheck && getPageSetting('onlyPerfectMaps') && game.resources.fragments.owned < perfectMapCost_Actual(mapLevel, special, biome))
			continue;
		if (!statCheck && !getPageSetting('onlyPerfectMaps') && game.resources.fragments.owned < minMapFrag(mapLevel, special, biome))
			continue;

		var equalityAmt = equalityQuery('Snimp', game.global.world + mapLevel, 20, 'map', difficulty, 'oneShot', true);
		var ourDmg = calcOurDmg(dmgType, equalityAmt, false, 'map', critType, y, 'force');
		if (challengeActive('Duel')) ourDmg *= gammaBurstPct;
		if (challengeActive('Daily') && typeof game.global.dailyChallenge.weakness !== 'undefined') ourDmg *= (1 - (9 * game.global.dailyChallenge.weakness.strength) / 100)
		var enemyHealth = calcEnemyHealthCore('map', game.global.world + mapLevel, 20, 'Turtlimp') * difficulty;
		enemyHealth *= (maxOneShotPower(true));
		var enemyDmg = calcEnemyAttackCore('map', game.global.world + mapLevel, 20, 'Snimp', false, false, equalityAmt) * difficulty;

		enemyDmg *= typeof game.global.dailyChallenge.explosive !== 'undefined' ? 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength) : 1
		enemyDmg *= dailyEmpowerToggle && dailyCrit ? dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength) : 1;

		if (challengeActive('Duel')) {
			enemyDmg *= 10;
			if (game.challenges.Duel.trimpStacks >= 50) enemyDmg *= 3;
		}
		if (enemyHealth <= ourDmg && enemyDmg <= ourHealth) {
			if (!query && mapLevel === 0 && minLevel < 0 && game.global.mapBonus === 10 && game.talents.mapLoot.purchased && !challengeActive('Glass') && !challengeActive('Insanity') && !challengeActive('Mayhem'))
				mapLevel = -1;
			return mapLevel;
		}
	}
	return 0;
}

function autoMapLevelU1(special, maxLevel, minLevel, critType, statCheck) {

	var maxLevel = typeof (maxLevel) === 'undefined' || maxLevel === null ? 10 : maxLevel;
	var minLevel = typeof (minLevel) === 'undefined' || minLevel === null ? 0 - game.global.world + 6 : minLevel;

	const z = game.global.world;
	const hze = getHighestLevelCleared();
	const extraMapLevelsAvailable = hze >= 209;
	const haveMapReducer = game.talents.mapLoot.purchased;
	const biome = (game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountain");

	if (maxLevel > 0 && !extraMapLevelsAvailable) maxLevel = 0;
	if (!special) special = getAvailableSpecials('lmc');
	if (!critType) critType = 'maybe';

	for (y = maxLevel; y >= minLevel; y--) {
		var mapLevel = y;

		//Skip plus level maps if they're not available.
		if (!extraMapLevelsAvailable && y > 0) continue;

		if (y === minLevel) return minLevel;

		if (!statCheck && getPageSetting('onlyPerfectMaps') && game.resources.fragments.owned < perfectMapCost_Actual(mapLevel, special, biome))
			continue;
		if (!statCheck && !getPageSetting('onlyPerfectMaps') && game.resources.fragments.owned < minMapFrag(mapLevel, special, biome))
			continue;

		// Calculate optimal map level
		var ratio = calcHDRatio(z + mapLevel, "map");
		if (game.unlocks.imps.Titimp) {
			ratio /= 2;
		}
		// Stance priority: Scryer > Dominance > X
		if (z >= 60 && hze >= 180) {
			ratio *= 2;
		} else if (game.upgrades.Dominance.done) {
			ratio /= 4;
		}
		// Stop increasing map level once HD ratio is too large
		if ((z <= 40 && ratio > 1.5) || ratio > 1.2) {
			continue;
		}

		if (mapLevel > 0) {
			const maxOneShotCells = maxOneShotPower();
			if (oneShotZone((z + mapLevel), "map", "S") >= maxOneShotCells) {
				return mapLevel;
			}
		}

		if (mapLevel === 0 && minLevel < 0 && haveMapReducer) return (mapLevel - 1);

		return mapLevel;
	}
	return mapLevel;
}

function equalityQuery(enemyName, zone, currentCell, mapType, difficulty, farmType, forceOK) {

	if (!enemyName) enemyName = 'Snimp';
	if (!zone) zone = game.global.world;
	if (!mapType) mapType = 'world'
	if (!currentCell) mapType === 'world' ? 98 : 20;
	if (!difficulty) difficulty = 1;
	if (!farmType) farmType = 'gamma';

	if (game.portal.Equality.radLevel === 0)
		return 0;

	var bionicTalent = zone - game.global.world;
	var checkMutations = mapType === 'world' && game.global.world > 200;
	var titimp = mapType !== 'world' && farmType === 'oneShot' ? 'force' : false;
	var dailyEmpowerToggle = getPageSetting('empowerAutoEquality');
	var dailyCrit = challengeActive('Daily') && typeof game.global.dailyChallenge.crits !== 'undefined'; //Crit
	var dailyBloodthirst = challengeActive('Daily') && typeof game.global.dailyChallenge.bloodthirst !== 'undefined'; //Bloodthirst (enemy heal + atk)
	var maxEquality = game.portal.Equality.radLevel;
	var overkillCount = maxOneShotPower(true);

	var critType = 'maybe'
	if (challengeActive('Wither') || challengeActive('Glass') || challengeActive('Duel')) critType = 'never'

	//Challenge conditions
	var runningUnlucky = challengeActive('Unlucky');
	var runningQuest = ((challengeActive('Quest') && currQuest() == 8) || challengeActive('Bublé')); //Shield break quest

	//Initialising name/health/dmg variables
	//Enemy stats
	if (enemyName === 'Improbability' && zone <= 58) enemyName = 'Blimp';
	var enemyHealth = calcEnemyHealthCore(mapType, zone, currentCell, enemyName) * difficulty;
	var enemyDmg = calcEnemyAttackCore(mapType, zone, currentCell, enemyName, false, false, 0) * difficulty;
	enemyDmg *= mapType === 'map' && typeof game.global.dailyChallenge.explosive !== 'undefined' ? 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength) : 1
	enemyDmg *= dailyEmpowerToggle && mapType === 'map' && dailyCrit ? dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength) : 1;

	if (challengeActive('Duel')) {
		enemyDmg *= 10;
		if (game.challenges.Duel.trimpStacks >= 50) enemyDmg *= 3;
	}
	//Our stats
	var dmgType = runningUnlucky ? 'max' : 'avg';
	var ourHealth = calcOurHealth(runningQuest, mapType);
	var ourDmg = calcOurDmg(dmgType, 0, false, mapType, critType, bionicTalent, titimp);

	var unluckyDmg = runningUnlucky ? Number(calcOurDmg('min', 0, false, mapType, 'never', bionicTalent, titimp)) : 2;

	//Figuring out gamma to proc value
	var gammaToTrigger = gammaMaxStacks();

	if (checkMutations) {
		enemyDmg = calcEnemyAttackCore(mapType, zone, currentCell, enemyName, false, calcMutationAttack(zone), 0);
		enemyHealth = calcEnemyHealthCore(mapType, zone, currentCell, enemyName, calcMutationHealth(zone));
	}

	if (forceOK) {
		if (!runningUnlucky && (zone - game.global.world) > 0) dmgType = 'min';
		enemyHealth *= (1 * overkillCount);
	}
	if (challengeActive('Duel')) ourDmg *= gammaBurstPct;

	if (challengeActive('Daily') && typeof game.global.dailyChallenge.weakness !== 'undefined') ourDmg *= (1 - ((mapType === 'map' ? 9 : gammaToTrigger) * game.global.dailyChallenge.weakness.strength) / 100)

	if (dailyBloodthirst && mapType === 'void' && getPageSetting('bloodthirstVoidMax')) {
		var bloodThirstStrength = game.global.dailyChallenge.bloodthirst.strength;
		enemyDmg /= dailyModifiers.bloodthirst.getMult(bloodThirstStrength, game.global.dailyChallenge.bloodthirst.stacks);
		enemyDmg *= dailyModifiers.bloodthirst.getMult(bloodThirstStrength, dailyModifiers.bloodthirst.getMaxStacks(bloodThirstStrength));
	}

	var ourDmgEquality = 0;
	var enemyDmgEquality = 0;
	var unluckyDmgEquality = 0;

	if (enemyHealth !== 0) {
		for (var i = 0; i <= maxEquality; i++) {
			enemyDmgEquality = enemyDmg * Math.pow(game.portal.Equality.getModifier(), i)
			ourDmgEquality = ourDmg * Math.pow(game.portal.Equality.getModifier(1), i);
			if (runningUnlucky) {
				unluckyDmgEquality = unluckyDmg * Math.pow(game.portal.Equality.getModifier(1), i);
				if (unluckyDmgEquality.toString()[0] % 2 == 1 && i !== maxEquality) continue;
			}
			if (farmType === 'gamma' && ourHealth >= enemyDmgEquality) {
				return i;
			}
			else if (farmType === 'oneShot' && ourDmgEquality > enemyHealth && ourHealth > enemyDmgEquality) {
				return i;
			}
			else if (i === maxEquality) {
				return i;
			}
		}
	}
}

//Auto Equality
function equalityManagement() {

	if (usingRealTimeOffline) {
		equalityManagementBasic();
		return;
	}
	if (game.global.preMapsActive || game.global.gridArray.length <= 0)
		return;

	if (game.portal.Equality.radLevel === 0)
		return;

	//Turning off equality scaling
	game.portal.Equality.scalingActive = false;
	game.options.menu.alwaysAbandon.enabled = 1;
	//Misc vars
	var debugStats = getPageSetting('debugEqualityStats');
	var dailyEmpowerToggle = getPageSetting('empowerAutoEquality');
	var mapping = game.global.mapsActive ? true : false;
	var currentCell = mapping ? game.global.lastClearedMapCell + 1 : game.global.lastClearedCell + 1;
	var mapGrid = mapping ? 'mapGridArray' : 'gridArray';
	var type = (!mapping) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	var zone = (type == "world" || !mapping) ? game.global.world : getCurrentMapObject().level;
	var bionicTalent = mapping && game.talents.bionic2.purchased && (zone > game.global.world) ? zone : 0;
	var difficulty = mapping ? getCurrentMapObject().difficulty : 1;
	var maxEquality = game.portal.Equality.radLevel;
	var armyReady = newArmyRdy();

	if (type === 'void' && getPageSetting('heirloomVoidSwap')) heirloomSwapping();

	//Daily modifiers active
	var isDaily = challengeActive('Daily')
	var dailyEmpower = isDaily && typeof game.global.dailyChallenge.empower !== 'undefined' //Empower
	var dailyCrit = isDaily && typeof game.global.dailyChallenge.crits !== 'undefined'; //Crit
	var dailyExplosive = isDaily && typeof game.global.dailyChallenge.explosive !== 'undefined'; //Dmg on death
	var dailyWeakness = isDaily && typeof game.global.dailyChallenge.weakness !== 'undefined'; //% dmg reduction on hit
	var dailyBloodthirst = isDaily && typeof game.global.dailyChallenge.bloodthirst !== 'undefined'; //Bloodthirst (enemy heal + atk)
	var dailyRampage = isDaily && typeof game.global.dailyChallenge.rampage !== 'undefined'; //Rampage (trimp attack buff)

	//Challenge conditions
	var runningUnlucky = challengeActive('Unlucky');
	var runningDuel = challengeActive('Duel');
	var runningTrappa = challengeActive('Trappapalooza');
	var runningQuest = (challengeActive('Quest') && currQuest() == 8) || challengeActive('Bublé'); //Shield break quest
	var runningRevenge = challengeActive('Revenge');
	var runningArchaeology = challengeActive('Archaeology');
	var runningMayhem = challengeActive('Mayhem');
	var enemyCanPoison = runningMayhem && (mapping || currentCell === 99)
	var runningBerserk = challengeActive('Berserk');
	var runningExperienced = challengeActive('Exterminate') && game.challenges.Exterminate.experienced;
	var runningGlass = challengeActive('Glass');
	var runningDesolation = challengeActive('Desolation') && mapping;
	var runningSmithless = challengeActive('Smithless') && !mapping && game.global.world % 25 === 0 && game.global.lastClearedCell == -1 && game.global.gridArray[0].ubersmith; //If UberSmith is active and not in a map

	if (runningDesolation && rMapSettings.equality) {
		game.portal.Equality.disabledStackCount = game.portal.Equality.radLevel;
		return;
	}

	//Perk conditions
	var noFrenzy = game.portal.Frenzy.radLevel > 0 && !autoBattle.oneTimers.Mass_Hysteria.owned;

	//Gamma burst info
	var gammaMaxStacksCheck = gammaMaxStacks();
	var gammaDmg = gammaBurstPct;
	if (gammaDmg === 1) gammaMaxStacksCheck = 0;
	var gammaToTrigger = gammaMaxStacksCheck - game.heirlooms.Shield.gammaBurst.stacks;
	var fuckGamma = (runningSmithless && (10 - game.challenges.Smithless.uberAttacks) > gammaToTrigger);

	var critType = 'maybe'
	if (challengeActive('Wither') || challengeActive('Glass')) critType = 'never'

	//Initialising Stat variables
	//Our stats
	var dmgType = runningUnlucky ? 'max' : 'avg'
	var ourHealth = remainingHealth();
	var ourHealthMax = calcOurHealth(runningQuest, type)
	var ourDmg = calcOurDmg(dmgType, 0, false, type, critType, bionicTalent, true);

	var unluckyDmg = runningUnlucky ? Number(calcOurDmg('min', 0, false, type, 'never', bionicTalent, true)) : 2;

	if (noFrenzy) {
		if (getPageSetting('frenzyCalc') && game.portal.Frenzy.frenzyStarted === -1) {
			ourDmg /= 1 + (0.5 * game.portal.Frenzy.radLevel)
			unluckyDmg /= 1 + (0.5 * game.portal.Frenzy.radLevel)
		}
		if (!getPageSetting('frenzyCalc') && game.portal.Frenzy.frenzyStarted !== -1) {
			ourDmg *= 1 + (0.5 * game.portal.Frenzy.radLevel)
			unluckyDmg *= 1 + (0.5 * game.portal.Frenzy.radLevel)
		}
	}
	ourDmg *= dailyRampage ? dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, game.global.dailyChallenge.rampage.stacks) : 1;
	var ourDmgEquality = 0;
	var unluckyDmgEquality = 0;

	//Enemy stats
	var enemyName = game.global[mapGrid][currentCell].name;
	var enemyHealth = game.global[mapGrid][currentCell].health;
	var enemyDmg = getCurrentEnemy().attack * totalDamageMod() * 1.5;
	if (runningMayhem) enemyDmg /= game.challenges.Mayhem.getEnemyMult();
	enemyDmg *= game.global.voidBuff == 'doubleAttack' ? 2 : (game.global.voidBuff == 'getCrit' && (gammaToTrigger > 1 || runningBerserk || runningTrappa || runningArchaeology || runningQuest)) ? 5 : 1;
	enemyDmg *= dailyEmpowerToggle && !mapping && dailyEmpower && dailyCrit ? 1 + dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength) : 1;
	enemyDmg *= dailyEmpowerToggle && !mapping && dailyEmpower && dailyExplosive ? 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength) : 1;
	enemyDmg *= type === 'map' && mapping && dailyExplosive ? 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength) : 1
	enemyDmg *= (type === 'world' || type === 'void') && dailyCrit && gammaToTrigger > 1 ? 1 + dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength) : 1;
	enemyDmg *= runningMayhem && ((!mapping && currentCell === 99) || mapping) ? 1.2 : 1
	enemyDmg *= dailyEmpowerToggle && type === 'map' && dailyCrit ? dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength) : 1;
	var enemyDmgEquality = 0;
	//Misc dmg mult
	if (dailyWeakness) ourDmg *= (1 - ((game.global.dailyChallenge.weakness.stacks + (fastEnemy ? 1 : 0)) * game.global.dailyChallenge.weakness.strength) / 100)

	//Fast Enemy conditions
	var fastEnemy = !game.global.preMapsActive && fastimps.includes(enemyName);
	if (type === 'world' && game.global.world > 200 && game.global.gridArray[currentCell].u2Mutation.length > 0) fastEnemy = true;
	if (!mapping && (dailyEmpower || runningSmithless)) fastEnemy = true;
	if (type === 'map' && dailyExplosive) fastEnemy = true;
	if (type === 'world' && dailyExplosive) fastEnemy = true;
	if (game.global.voidBuff === 'doubleAttack') fastEnemy = true
	if (runningArchaeology) fastEnemy = true;
	if (noFrenzy && game.portal.Frenzy.frenzyActive() || (enemyHealth / ourDmg) > 10) fastEnemy = true;
	if (runningTrappa) fastEnemy = true;
	if (runningDuel && !mapping) fastEnemy = true;
	if (runningQuest) fastEnemy = true;
	if (runningExperienced) fastEnemy = false;
	if (runningGlass) fastEnemy = true;
	if (runningBerserk) fastEnemy = true;
	if (runningDesolation) fastEnemy = true;
	if (runningDuel && game.challenges.Duel.enemyStacks < 10) fastEnemy = true;
	if (runningRevenge) fastEnemy = true;

	//Making sure we get the Duel health bonus by suiciding trimps with 0 equality
	if (runningDuel && fastEnemy && (calcOurHealth(false, type) * 10 * 0.9) > remainingHealth(true) && gammaToTrigger === gammaMaxStacksCheck && game.global.armyAttackCount === 0) {
		game.portal.Equality.disabledStackCount = 0;
		if (parseNum(document.getElementById('equalityStacks').children[0].innerHTML.replace(/\D/g, '')) !== game.portal.Equality.disabledStackCount) manageEqualityStacks();
		updateEqualityScaling();
		return;
	}

	//Suiciding to get max bloodthirst stacks if our avg attacks to kill is greater than the attacks to proc a bloodthirst stack. 
	if (dailyBloodthirst && mapping && fastEnemy) {
		var maxStacks = dailyModifiers.bloodthirst.getMaxStacks(game.global.dailyChallenge.bloodthirst.strength);
		var currStacks = game.global.dailyChallenge.bloodthirst.stacks;
		var stacksToProc = dailyModifiers.bloodthirst.getFreq(game.global.dailyChallenge.bloodthirst.strength) - (game.global.dailyChallenge.bloodthirst.stacks % dailyModifiers.bloodthirst.getFreq(game.global.dailyChallenge.bloodthirst.strength));
		var avgTrimpAttack = (ourDmg * Math.pow(game.portal.Equality.getModifier(1),
			equalityQuery(enemyName, zone, currentCell, type, difficulty, 'gamma')) * gammaDmg)
		var timeToKill = enemyHealth / avgTrimpAttack;

		if (currStacks !== maxStacks && stacksToProc < timeToKill) {
			game.portal.Equality.disabledStackCount = 0;
			if (parseNum(document.getElementById('equalityStacks').children[0].innerHTML.replace(/\D/g, '')) !== game.portal.Equality.disabledStackCount) manageEqualityStacks();
			updateEqualityScaling();
			return;
		}
	}

	if (enemyHealth > 0) {
		for (var i = 0; i <= maxEquality; i++) {
			enemyDmgEquality = enemyDmg * Math.pow(game.portal.Equality.getModifier(), i);
			ourDmgEquality = ourDmg * Math.pow(game.portal.Equality.getModifier(1), i);

			if (runningMayhem) enemyDmgEquality += game.challenges.Mayhem.poison;

			if (runningUnlucky) {
				unluckyDmgEquality = unluckyDmg * Math.pow(game.portal.Equality.getModifier(1), i);
				if (unluckyDmgEquality.toString()[0] % 2 == 1 && i !== maxEquality) continue;
			}

			if (voidPBSwap && !fastEnemy && calcOurDmg('max', i, false, 'void', 'force', 0, true) > enemyHealth && (typeof (game.global.mapGridArray[game.global.lastClearedMapCell + 2].plaguebringer) === 'undefined' || game.global.mapGridArray[game.global.lastClearedMapCell + 2].plaguebringer < getCurrentEnemy().maxHealth) && (getCurrentEnemy().maxHealth * .05 < enemyHealth)) {
				game.portal.Equality.disabledStackCount = maxEquality;
				while (calcOurDmg('max', i, false, 'void', 'force', 0, true) > getCurrentEnemy().health && i < maxEquality) {
					i++;
				}
				continue;
			}
			if (!fastEnemy && !runningGlass && !runningBerserk && !runningArchaeology && !runningQuest) {
				game.portal.Equality.disabledStackCount = i;
				break;
			}
			else if (armyReady && (ourHealth < (ourHealthMax * 0.65)) && gammaToTrigger === gammaMaxStacksCheck && gammaMaxStacksCheck !== Infinity && !runningTrappa && !runningArchaeology && !runningBerserk) {
				if (game.global.mapsUnlocked && !mapping && !runningMayhem) {
					mapsClicked();
					mapsClicked();
				}
				else if (game.global.mapsUnlocked && mapping && currentCell > 0 && type !== 'void' && getCurrentMapObject().location !== 'Darkness' && (!runningQuest && game.global.titimpLeft === 0)) {
					mapsClicked();
					rRunMap();
				}
				else
					game.portal.Equality.disabledStackCount = 0;
				break;
			} else if (fastEnemy && enemyDmgEquality > ourHealth) {
				game.portal.Equality.disabledStackCount = maxEquality;
			} else if (runningMayhem && fastEnemy && enemyDmgEquality > ((game.global.soldierHealth * 6) + game.challenges.Mayhem.poison)) {
				continue;
			} else if ((ourDmgEquality * gammaDmg) < enemyHealth && (gammaToTrigger > 1 || (gammaToTrigger > 1 && fuckGamma))) {
				game.portal.Equality.disabledStackCount = maxEquality;
				break;
			} else if (ourHealth > enemyDmgEquality && gammaToTrigger <= 1) {
				game.portal.Equality.disabledStackCount = i;
				if (debugStats) queryAutoEqualityStats(ourDmgEquality, ourHealth, enemyDmgEquality, enemyHealth, i)
				break;
			} else if (ourHealth > enemyDmgEquality && ourDmgEquality > enemyHealth) {
				game.portal.Equality.disabledStackCount = i;
				break;
			} else if (ourHealth > (enemyDmgEquality * gammaToTrigger) && ourDmgEquality * gammaDmg > enemyHealth && !fuckGamma && !enemyCanPoison) {
				game.portal.Equality.disabledStackCount = i;
				break;
			} else if (ourHealth > (enemyDmgEquality * gammaToTrigger) && ourDmgEquality * gammaToTrigger > enemyHealth && !fuckGamma && !enemyCanPoison) {
				game.portal.Equality.disabledStackCount = i;
				break;
			} else if (ourHealth > (enemyDmgEquality * gammaToTrigger) && !fuckGamma && !enemyCanPoison) {
				game.portal.Equality.disabledStackCount = i;
				break;
			} else {
				game.portal.Equality.disabledStackCount = maxEquality;
			}
		}
		if (parseNum(document.getElementById('equalityStacks').children[0].innerHTML.replace(/\D/g, '')) !== game.portal.Equality.disabledStackCount) manageEqualityStacks();
		updateEqualityScaling();
	}
}

function queryAutoEqualityStats(ourDamage, ourHealth, enemyDmgEquality, enemyHealth, equalityStacks, dmgMult) {
	debug("Equality = " + equalityStacks)
	debug("Our dmg (min) = " + ourDamage.toFixed(4) + " | " + "Our health = " + ourHealth.toFixed(4))
	debug("Enemy dmg = " + enemyDmgEquality.toFixed(4) + " | " + "Enemy health = " + enemyHealth.toFixed(4))
	if (dmgMult) debug("Mult = " + dmgMult)
}

function formatTimeForDescriptions(number) {
	var timeTaken = '';
	var seconds = Math.floor((number) % 60);
	var minutes = Math.floor((number / 60) % 60);
	var hours = Math.floor((number / 60 / 60));
	if (hours > 0) timeTaken += (hours + "h");
	if (minutes > 0) timeTaken += (minutes + "m");
	timeTaken += (seconds + "s");

	return timeTaken;
}

function timeForFormatting(number) {
	return Math.floor((getGameTime() - number) / 1000);
}

function resetSettingsPortal() {

	var value = 'value';
	if (game.global.universe === 2) value += 'U2';

	var enabled = 'enabled';
	if (game.global.universe === 2) enabled += 'U2';


	//Enabling Auto Portal
	if (getPageSetting('autoMapsPortal')) {
		autoTrimpSettings["autoMaps"][value] = 1;
		document.getElementById('autoMaps').setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings['autoMaps'][value]);
		document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + autoTrimpSettings['autoMaps'][value]);
	}
	//Enabling Auto Equip
	if (getPageSetting('equipPortal')) {
		autoTrimpSettings["equipOn"][enabled] = true;
		const autoEquip = getPageSetting('equipOn');
		document.getElementById('equipOn').setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoEquip);
		document.getElementById('autoEquipLabel').parentNode.setAttribute('class', 'pointer noselect autoUpgradeBtn settingBtn' + autoEquip);
	}

	//Setting buildings button up
	if (typeof (autoTrimpSettings['buildingSettingsArray'][value].portalOption) !== 'undefined') {
		if (autoTrimpSettings['buildingSettingsArray'][value].portalOption === 'on')
			autoTrimpSettings["buildingsType"][enabled] = true;
		if (autoTrimpSettings['buildingSettingsArray'][value].portalOption === 'off')
			autoTrimpSettings["buildingsType"][enabled] = false;

		document.getElementById('buildingsType').setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings['buildingsType'][enabled]);
		document.getElementById('autoStructureLabel').parentNode.setAttribute('class', 'toggleConfigBtn pointer noselect autoUpgradeBtn settingBtn' + autoTrimpSettings['buildingsType'][enabled]);
	}

	//Setting jobs button up
	if (typeof (autoTrimpSettings['jobSettingsArray'][value].portalOption) !== 'undefined') {
		if (autoTrimpSettings['jobSettingsArray'][value].portalOption === 'autojobs off')
			autoTrimpSettings['jobType'][value] = 0;
		if (autoTrimpSettings['jobSettingsArray'][value].portalOption === 'auto ratios')
			autoTrimpSettings['jobType'][value] = 1;
		if (autoTrimpSettings['jobSettingsArray'][value].portalOption === 'manual ratios')
			autoTrimpSettings['jobType'][value] = 2;

		const autoJobs = getPageSetting('jobType');

		document.getElementById('jobType').setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + (autoJobs === 2 ? 3 : autoJobs));
		document.getElementById('autoJobLabel').parentNode.setAttribute('class', 'toggleConfigBtn pointer noselect autoUpgradeBtn settingBtn' + (autoJobs === 2 ? 3 : autoJobs));
	}

	updateButtonText();
	saveSettings();
}

function prettifySubAT(number) {
	number = parseFloat(number);
	var floor = Math.floor(number);
	if (number === floor) // number is an integer, just show it as-is
		return number;

	var precision = 5 - floor.toString().length; // use the right number of digits

	return number.toFixed(5 - floor.toString().length);
}

function saveToSteam(saveData) {
	if (typeof greenworks == 'undefined') return;
	greenworks.saveTextToFile('TrimpsSave.sav', saveData, cloudSaveCallback, cloudSaveErrorCallback);
}

function loadFromSteam() {
	if (typeof greenworks == 'undefined') return;
	greenworks.readTextFromFile('TrimpsSave.sav', loadFromSteamCallback, loadFromSteamErrorCallback);
}

function cloudSaveCallback(data) {
}
