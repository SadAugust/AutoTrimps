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
	if (game.portal.Anticipation.level > 0) {
		var antistacklimit = (game.talents.patience.purchased) ? 45 : 30;
		if (game.global.fighting && ((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) >= antistacklimit && (game.global.antiStacks < antistacklimit || antistacklimit == 0 && game.global.antiStacks >= 1) && !game.global.spireActive)
			forceAbandonTrimps();
		if (game.global.fighting && ((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) >= antistacklimit && game.global.antiStacks < antistacklimit && game.global.mapsActive) {
			if (getCurrentMapObject().location == "Void") {
				abandonVoidMap();
			}
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

trapIndexs = ["", "Fire", "Frost", "Poison", "Lightning", "Strength", "Condenser", "Knowledge"];

function tdStringCode2() {
	var thestring = document.getElementById('importBox').value.replace(/\s/g, '');
	var s = new String(thestring);
	var index = s.indexOf("+", 0);
	s = s.slice(0, index);
	var length = s.length;

	var saveLayout = [];
	for (var i = 0; i < length; i++) {
		saveLayout.push(trapIndexs[s.charAt(i)]);
	}
	playerSpire['savedLayout' + -1] = saveLayout;

	if ((playerSpire.runestones + playerSpire.getCurrentLayoutPrice()) < playerSpire.getSavedLayoutPrice(-1)) return false;
	playerSpire.resetTraps();
	for (var x = 0; x < saveLayout.length; x++) {
		if (!saveLayout[x]) continue;
		playerSpire.buildTrap(x, saveLayout[x]);
	}
}

var oldPlayerSpireDrawInfo = playerSpire.drawInfo;
playerSpire.drawInfo = function (arguments) {
	var ret = oldPlayerSpireDrawInfo.apply(this, arguments);
	var elem = document.getElementById('spireTrapsWindow');
	if (!elem) return arguments;
	var importBtn = "<div onclick='ImportExportTooltip(\"spireImport\")' class='spireControlBox'>Import</div>";
	elem.innerHTML = importBtn + elem.innerHTML;
	return arguments;
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

function rManageEquality() {
	if (!game.global.preMapsActive && game.global.gridArray.length > 0) {
		//Looking to see if the enemy that's currently being fought is fast.
		var fastEnemy = game.global.preMapsActive ? fastimps.includes(game.global.gridArray[game.global.lastClearedCell + 1].name) : fastimps.includes(getCurrentEnemy().name);
		//Checking if the map that's active is a Deadly voice map which always has first attack.
		var voidDoubleAttack = game.global.mapsActive && getCurrentMapObject().location == "Void" && getCurrentMapObject().voidBuff == 'doubleAttack';
		//Checking if the Frenzy buff is active.
		var noFrenzy = game.portal.Frenzy.frenzyStarted == "-1" && !autoBattle.oneTimers.Mass_Hysteria.owned && game.portal.Frenzy.radLevel > 0;
		//Checking if the experience buff is active during Exterminate.
		var experienced = challengeActive('Exterminate') && game.challenges.Exterminate.experienced;
		//Checking to see if the Glass challenge is being run where all enemies are fast.
		var runningGlass = challengeActive('Glass');

		//Toggles equality scaling on
		if ((fastEnemy && !experienced) || voidDoubleAttack || noFrenzy || runningGlass) {
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
		if (y === minLevel) {
			return minLevel;
		}
		if (!statCheck && getPageSetting('onlyPerfectMaps') && game.resources.fragments.owned < perfectMapCost_Actual(mapLevel, special, biome))
			continue;
		if (!statCheck && !getPageSetting('onlyPerfectMaps') && game.resources.fragments.owned < minMapFrag(mapLevel, special, biome))
			continue;

		var equalityAmt = equalityQuery('Snimp', game.global.world + mapLevel, 20, 'map', difficulty, 'oneShot', true);
		var ourDmg = calcOurDmg(dmgType, equalityAmt, false, 'map', critType, y, 'force');
		if (challengeActive('Daily') && typeof game.global.dailyChallenge.weakness !== 'undefined') ourDmg *= (1 - (9 * game.global.dailyChallenge.weakness.strength) / 100)
		var enemyHealth = calcEnemyHealthCore('map', game.global.world + mapLevel, 20, 'Turtlimp') * difficulty;
		enemyHealth *= (1 * maxOneShotPower(true));
		var enemyDmg = calcEnemyAttackCore('map', game.global.world + mapLevel, 20, 'Snimp', false, false, equalityAmt) * difficulty;

		enemyDmg *= typeof game.global.dailyChallenge.explosive !== 'undefined' ? 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength) : 1
		enemyDmg *= dailyEmpowerToggle && dailyCrit ? dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength) : 1;

		if (challengeActive('Duel')) {
			enemyDmg *= 10;
			if (game.challenges.Duel.trimpStacks >= 50) enemyDmg *= 3;
		}
		if (enemyHealth <= ourDmg && enemyDmg <= ourHealth) {
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
		let ratio = calcHDRatio(z + mapLevel, "map");
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

	var mapping = mapType === 'world' ? false : true;
	var bionicTalent = zone - game.global.world;
	var checkMutations = mapType === 'world' && game.global.world > 200;
	var titimp = mapType !== 'world' && farmType === 'oneShot' ? 'force' : false;
	var dailyEmpowerToggle = getPageSetting('empowerAutoEquality');
	var dailyCrit = challengeActive('Daily') && typeof game.global.dailyChallenge.crits !== 'undefined'; //Crit
	var dailyBloodthirst = challengeActive('Daily') && typeof game.global.dailyChallenge.bloodthirst !== 'undefined'; //Bloodthirst (enemy heal + atk)
	var maxEquality = game.portal.Equality.radLevel;

	var critType = 'maybe'
	if (challengeActive('Wither') || challengeActive('Glass') || challengeActive('Duel')) critType = 'never'

	//Challenge conditions
	var runningUnlucky = challengeActive('Unlucky');
	var runningDuel = challengeActive('Duel');
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
	var dmgType = runningUnlucky ? 'max' : 'avg'
	var ourHealth = calcOurHealth(runningQuest, mapType);
	var ourDmg = calcOurDmg(dmgType, 0, false, mapType, critType, bionicTalent, titimp);

	var unluckyDmg = runningUnlucky ? Number(calcOurDmg('min', 0, false, mapType, 'never', bionicTalent, titimp)) : 2;

	//Figuring out gamma to proc value
	var gammaToTrigger = gammaMaxStacks();

	if (checkMutations) {
		enemyDmg = calcEnemyAttackCore(mapType, zone, currentCell, enemyName, false, calcMutationAttack(zone), 0);
		enemyHealth = calcEnemyHealthCore(mapType, zone, currentCell, enemyName, calcMutationHealth(zone));
	}

	if (forceOK) enemyHealth *= (1 * maxOneShotPower(true));

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
	voidPBSwap = false;
	var mapping = game.global.mapsActive ? true : false;
	var currentCell = mapping ? game.global.lastClearedMapCell + 1 : game.global.lastClearedCell + 1;
	var mapGrid = mapping ? 'mapGridArray' : 'gridArray';
	var type = (!mapping) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	var zone = (type == "world" || !mapping) ? game.global.world : getCurrentMapObject().level;
	var bionicTalent = mapping && game.talents.bionic2.purchased && (zone > game.global.world) ? zone : 0;
	var difficulty = mapping ? getCurrentMapObject().difficulty : 1;
	var maxEquality = game.portal.Equality.radLevel;
	if (type === 'void') {
		voidPBSwap = getPageSetting('heirloomVoidSwap') && game.global.lastClearedMapCell !== getCurrentMapObject().size - 2 && fastimps.includes(game.global.mapGridArray[game.global.lastClearedMapCell + 2].name) && game.global.voidBuff !== 'doubleAttack';
		if (getPageSetting('heirloomVoidSwap')) heirloomSwapping();
	}

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
	var runningBerserk = challengeActive('Berserk');
	var runningExperienced = challengeActive('Exterminate') && game.challenges.Exterminate.experienced;
	var runningGlass = challengeActive('Glass');
	var runningDesolation = challengeActive('Desolation') && mapping;
	var runningSmithless = challengeActive('Smithless') && !mapping && game.global.world % 25 === 0 && game.global.lastClearedCell == -1 && game.global.gridArray[0].ubersmith; //If UberSmith is active and not in a map

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
		if (getPageSetting('frenzyCalc') && game.portal.Frenzy.frenzyStarted === -1) ourDmg /= 1 + (0.5 * game.portal.Frenzy.radLevel)
		if (!getPageSetting('frenzyCalc') && game.portal.Frenzy.frenzyStarted !== -1) ourDmg *= 1 + (0.5 * game.portal.Frenzy.radLevel)
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
	if (noFrenzy) fastEnemy = true;
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
			else if ((ourHealth < (ourHealthMax * 0.65) || runningDuel && game.global.armyAttackCount !== 0) && gammaToTrigger === gammaMaxStacksCheck && gammaMaxStacksCheck !== Infinity && !runningTrappa && !runningArchaeology && !runningBerserk) {
				if (game.global.mapsUnlocked && !mapping && !runningMayhem) {
					mapsClicked();
					mapsClicked();
				}
				else if (game.global.mapsUnlocked && mapping && currentCell > 0 && type !== 'void' && (!runningQuest && game.global.titimpLeft === 0)) {
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
			} else if (ourHealth > (enemyDmgEquality * gammaToTrigger) && ourDmgEquality * gammaDmg > enemyHealth && !fuckGamma) {
				game.portal.Equality.disabledStackCount = i;
				break;
			} else if (ourHealth > (enemyDmgEquality * gammaToTrigger) && ourDmgEquality * gammaToTrigger > enemyHealth && !fuckGamma) {
				game.portal.Equality.disabledStackCount = i;
				break;
			} else if (ourHealth > (enemyDmgEquality * gammaToTrigger) && !fuckGamma) {
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

function simpleSecondsLocal(what, seconds, event, ssWorkerRatio) {
	var event = !event ? null : event;
	var ssWorkerRatio = !ssWorkerRatio ? null : ssWorkerRatio;

	if (typeof ssWorkerRatio !== 'undefined' && ssWorkerRatio !== null) {
		var desiredRatios = Array.from(ssWorkerRatio.split(','))
		desiredRatios = [desiredRatios[0] !== undefined ? Number(desiredRatios[0]) : 0,
		desiredRatios[1] !== undefined ? Number(desiredRatios[1]) : 0,
		desiredRatios[2] !== undefined ? Number(desiredRatios[2]) : 0,
		desiredRatios[3] !== undefined ? Number(desiredRatios[3]) : 0]
		var totalFraction = desiredRatios.reduce((a, b) => { return a + b; });
	}

	//Come home to the impossible flavour of balanced resource gain. Come home, to simple seconds.
	var jobName;
	var pos;
	switch (what) {
		case "food":
			jobName = "Farmer";
			pos = 0
			break;
		case "wood":
			jobName = "Lumberjack";
			pos = 1
			break;
		case "metal":
			jobName = "Miner";
			pos = 2
			break;
		case "gems":
			jobName = "Dragimp";
			break;
		case "fragments":
			jobName = "Explorer";
			break;
		case "science":
			jobName = "Scientist";
			pos = 3
			break;
	}
	var heirloom = !jobName ? null :
		jobName == "Miner" && challengeActive('Pandemonium') && getPageSetting("pandemoniumStaff") !== 'undefined' ? "pandemoniumStaff" :
			jobName == "Farmer" && getPageSetting('heirloomStaffFood') != 'undefined' ? ('heirloomStaffFood') :
				jobName == "Lumberjack" && getPageSetting('heirloomStaffWood') != 'undefined' ? ('heirloomStaffWood') :
					jobName == "Miner" && getPageSetting('heirloomStaffMetal') != 'undefined' ? ('heirloomStaffMetal') :
						getPageSetting('heirloomStaffMap') != 'undefined' ? ('heirloomStaffMap') :
							getPageSetting('heirloomStaffWorld') != 'undefined' ? ('heirloomStaffWorld') :
								null;
	var job = game.jobs[jobName];
	var trimpworkers = ((game.resources.trimps.realMax() / 2) - game.jobs.Explorer.owned - game.jobs.Meteorologist.owned - game.jobs.Worshipper.owned);
	var workers = ssWorkerRatio !== null ? Math.floor(trimpworkers * desiredRatios[pos] / totalFraction) :
		currentMap === 'Worshipper Farm' ? trimpworkers :
			job.owned;

	var amt_local = workers * job.modifier * seconds;
	amt_local += (amt_local * getPerkLevel("Motivation") * game.portal.Motivation.modifier);
	if (what != "gems" && game.permaBoneBonuses.multitasking.owned > 0)
		amt_local *= (1 + game.permaBoneBonuses.multitasking.mult());
	if (what != "science" && what != "fragments" && challengeActive('Alchemy'))
		amt_local *= alchObj.getPotionEffect("Potion of Finding");
	if (challengeActive("Frigid"))
		amt_local *= game.challenges.Frigid.getShatteredMult();
	if (game.global.pandCompletions && game.global.universe == 2 && what != "fragments")
		amt_local *= game.challenges.Pandemonium.getTrimpMult();
	if (game.global.stringVersion >= '5.9.0' && game.global.desoCompletions && game.global.universe == 2 && what != "fragments")
		amt_local *= game.challenges.Desolation.getTrimpMult();
	if (getPerkLevel("Observation") > 0 && game.portal.Observation.trinkets > 0)
		amt_local *= game.portal.Observation.getMult();

	if (what == "food" || what == "wood" || what == "metal") {
		if (ssWorkerRatio) {
			amt_local *= calculateParityBonus_Local(desiredRatios, HeirloomSearch(heirloom));
		}
		else amt_local *= getParityBonus();
		if (autoBattle.oneTimers.Gathermate.owned)
			amt_local *= autoBattle.oneTimers.Gathermate.getMult();
	}
	if (((what == "food" || (what == "wood" && game.global.stringVersion >= '5.9.0')) && game.buildings.Antenna.owned >= 5) || (what == "metal" && game.buildings.Antenna.owned >= 15))
		amt_local *= game.jobs.Meteorologist.getExtraMult();
	if (Fluffy.isRewardActive('gatherer'))
		amt_local *= 2;
	if (what == "wood" && challengeActive('Hypothermia') && game.challenges.Hypothermia.bonfires > 0)
		amt_local *= game.challenges.Hypothermia.getWoodMult();
	if (challengeActive('Unbalance'))
		amt_local *= game.challenges.Unbalance.getGatherMult();

	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.famine !== 'undefined' && what != "fragments" && what != "science")
			amt_local *= dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
		if (typeof game.global.dailyChallenge.dedication !== 'undefined')
			amt_local *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
	}
	if (challengeActive('Melt')) {
		amt_local *= 10;
		amt_local *= Math.pow(game.challenges.Melt.decayValue, game.challenges.Melt.stacks);
	}

	if (game.global.stringVersion >= '5.9.0' && challengeActive('Desolation'))
		amt_local *= game.challenges.Desolation.trimpResourceMult();
	if (game.challenges.Nurture.boostsActive())
		amt_local *= game.challenges.Nurture.getResourceBoost();

	//Calculating heirloom bonus
	amt_local = calcHeirloomBonusLocal(HeirloomModSearch(heirloom, jobName + "Speed"), amt_local);

	var turkimpBonus = game.talents.turkimp2.purchased ? 2 : game.talents.turkimp2.purchased ? 1.75 : 1.5;

	if ((game.talents.turkimp2.purchased || game.global.turkimpTimer > 0) && (what == "food" || what == "metal" || what == "wood")) {
		amt_local *= turkimpBonus;
		amt_local += getPlayerModifier() * seconds;
	}
	return amt_local;
}

function calculateParityBonus_Local(workerRatio, heirloom) {
	if (!game.global.StaffEquipped || game.global.StaffEquipped.rarity < 10) {
		game.global.parityBonus = 1;
		return 1;
	}
	var allowed = ["Farmer", "Lumberjack", "Miner"];
	var totalWorkers = 0;
	var numWorkers = [];
	if (!workerRatio) {
		for (var x = 0; x < allowed.length; x++) {
			var thisWorkers = game.jobs[allowed[x]].owned;
			totalWorkers += thisWorkers;
			numWorkers[x] = thisWorkers;
		}
		var workerRatios = [];
		for (var x = 0; x < numWorkers.length; x++) {
			workerRatios.push(numWorkers[x] / totalWorkers);
		}
	} else {
		var freeWorkers = Math.ceil(Math.min(game.resources.trimps.realMax() / 2), game.resources.trimps.owned) - (game.resources.trimps.employed - game.jobs.Explorer.owned - game.jobs.Meteorologist.owned - game.jobs.Worshipper.owned);
		var workerRatios = workerRatio;
		var ratio = workerRatios.reduce((a, b) => a + b, 0)
		var freeWorkerDivided = freeWorkers / ratio;

		for (var x = 0; x < allowed.length; x++) {
			var thisWorkers = freeWorkerDivided * workerRatios[x];
			totalWorkers += thisWorkers;
			numWorkers[x] = thisWorkers;
		}
	}
	var resourcePop = totalWorkers;
	resourcePop = Math.log(resourcePop) / Math.log(3);
	var largestWorker = Math.log(Math.max(...numWorkers)) / Math.log(3);
	var spreadFactor = resourcePop - largestWorker;
	var preLoomBonus = (spreadFactor * spreadFactor);
	var finalWithParity = (1 + preLoomBonus) * getHazardParityMult(heirloom);
	game.global.parityBonus = finalWithParity;
	return finalWithParity;
}

function calcHeirloomBonusLocal(mod, number) {
	var mod = mod;
	if (game.global.stringVersion >= '5.9.0') {
		if (challengeActive('Daily') && typeof game.global.dailyChallenge.heirlost !== 'undefined')
			mod *= dailyModifiers.heirlost.getMult(game.global.dailyChallenge.heirlost.strength);
	}
	if (!mod) return;

	return (number * ((mod / 100) + 1));
}

function scaleToCurrentMapLocal(amt_local, ignoreBonuses, ignoreScry, map) {
	if (map) map = game.global.world + map;
	if (!map) map = game.global.mapsActive ? getCurrentMapObject().level :
		challengeActive('Pandemonium') ? game.global.world - 1 :
			game.global.world;
	game.global.world + map;
	var compare = game.global.world;
	if (map > compare && map.location != "Bionic") {
		amt_local *= Math.pow(1.1, (map - compare));
	} else {
		if (game.talents.mapLoot.purchased)
			compare--;
		if (map < compare) {
			//-20% loot compounding for each level below world
			amt_local *= Math.pow(0.8, (compare - map));
		}
	}
	var maploot = game.global.farmlandsUnlocked && game.singleRunBonuses.goldMaps.owned ? 3.6 : game.global.decayDone && game.singleRunBonuses.goldMaps.owned ? 2.85 : game.global.farmlandsUnlocked ? 2.6 : game.global.decayDone ? 1.85 : 1.6;
	//Add map loot bonus
	amt_local = Math.round(amt_local * maploot);
	if (ignoreBonuses) return amt_local;
	amt_local = scaleLootBonuses(amt_local, ignoreScry);
	return amt_local;
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

function mappingDetails(mapName, mapLevel, mapSpecial, extra, extra2, extra3) {
	if (!getPageSetting('spamMessages').map_Details) return;
	if (!mapName) return;

	//Figuring out exact amount of maps run
	if (mapName !== 'Smithy Farm') {
		var mapProg = game.global.mapsActive ? ((getCurrentMapCell().level - 1) / getCurrentMapObject().size) : 0;
		var mappingLength = mapProg > 0 ? (game.global.mapRunCounter + mapProg).toFixed(2) : game.global.mapRunCounter;
	}
	//Setting special to current maps special if we're in a map.
	if (game.global.mapsActive) mapSpecial = getCurrentMapObject().bonus === undefined ? "no special" : getCurrentMapObject().bonus;

	var timeMapping = mappingTime > 0 ? mappingTime : getGameTime();
	var message = '';
	if (mapName !== 'Void Map' && mapName !== 'Quagmire Farm' && mapName !== 'Smithy Farm') {
		message += (mapName + " (Z" + game.global.world + ") took " + (mappingLength) + " (" + (mapLevel >= 0 ? "+" : "") + mapLevel + " " + mapSpecial + ")" + (mappingLength == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(timeMapping)) + ".");
	}
	else if (mapName === 'Smithy Farm') {
		message += (mapName + " (Z" + game.global.world + ") took " + MODULES.mapFunctions.smithyMapCount[0] + " food, " + MODULES.mapFunctions.smithyMapCount[1] + " wood, " + MODULES.mapFunctions.smithyMapCount[2] + " metal maps (" + (mapLevel >= 0 ? "+" : "") + mapLevel + ")" + " and " + formatTimeForDescriptions(timeForFormatting(timeMapping)) + ".");
	}
	else if (mapName === 'Quagmire Farm') {
		message += (mapName + " (Z" + game.global.world + ") took " + (mappingLength) + (mappingLength == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(timeMapping)) + ".");
	}
	else {
		message += (mapName + " (Z" + game.global.world + ") took " + formatTimeForDescriptions(timeForFormatting(timeMapping)) + ".");
	}

	if (mapName === 'Void Map') {
		message += " Started with " + MODULES.mapFunctions.rVoidVHDRatio.toFixed(2) + " and ended with a Void HD Ratio of " + voidHDRatio.toFixed(2) + ".";
	}

	if (mapName === 'Tribute Farm') {
		message += " Finished with (" + game.buildings.Tribute.purchased + "/" + extra + ") Tributes and (" + game.jobs.Meteorologist.owned + "/" + extra2 + ") Meteorologists.";
	}

	if (mapName === 'Smithy Farm') {
		message += " Finished with (" + game.buildings.Smithy.purchased + "/" + extra + ") Smithies.";
	}

	if (mapName === 'Insanity Farm') {
		message += " Finished with (" + game.challenges.Insanity.insanity + "/" + extra + ") stacks.";
	}

	if (mapName === 'Alchemy Farm') {
		message += " Finished with (" + extra + "/" + extra2 + ") " + extra3 + ".";
	}

	if (mapName === 'Hypothermia Farm') {
		message += " Finished with (" + prettify(game.resources.wood.owned) + "/" + extra.toFixed(2) + ") wood.";
	}

	if (mapName === 'Smithless Farm') {
		message += " Finished with enough damage to get (" + extra + "/3) stacks.";
	}

	if (mapName === 'HD Farm') {
		message += " Finished with a HD Ratio of (" + extra.toFixed(2) + "/" + extra2.toFixed(2) + ").";
	}

	debug(message);
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
		autoTrimpSettings["equipOn"][value] = true;
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

function resetMapVars(setting) {
	const totalPortals = getTotalPortals();
	currentMap = undefined;
	rAutoLevel = Infinity;
	mappingTime = 0;
	mapRepeats = 0;
	game.global.mapRunCounter = 0;
	if (setting) setting.done = (totalPortals + "_" + game.global.world);
	saveSettings();
}

function calculateMaxAffordLocal(itemObj, isBuilding, isEquipment, isJob, forceMax, forceRatio, resources) {
	if (!itemObj.cost) return 1;
	var forcedMax = 0;
	var mostAfford = -1;
	if (Number.isInteger(forceMax)) forcedMax = forceMax;
	//if (!forceMax) var forceMax = false;
	var forceMax = Number.isInteger(forceMax) ? forceMax : false;
	var currentOwned = (itemObj.purchased) ? itemObj.purchased : ((itemObj.level) ? itemObj.level : itemObj.owned);
	if (!currentOwned) currentOwned = 0;
	if (isJob && game.global.firing && !forceRatio) return Math.floor(currentOwned * game.global.maxSplit);
	//if (itemObj == game.equipment.Shield) console.log(currentOwned);
	for (var item in itemObj.cost) {
		var price = itemObj.cost[item];
		var toBuy;
		var resource = game.resources[item];
		var resourcesAvailable = !resources ? resource.owned : resources;
		if (resourcesAvailable < 0) resourcesAvailable = 0;
		if (game.global.maxSplit != 1 && !forceMax && !forceRatio) resourcesAvailable = Math.floor(resourcesAvailable * game.global.maxSplit);
		else if (forceRatio) resourcesAvailable = Math.floor(resourcesAvailable * forceRatio);

		if (item === 'fragments' && game.global.universe === 2) {
			var buildingSetting = getPageSetting('buildingSettingsArray');
			resourcesAvailable = buildingSetting.SafeGateway.zone !== 0 && game.global.world >= buildingSetting.SafeGateway.zone ? resourcesAvailable :
				buildingSetting.SafeGateway.enabled && resourcesAvailable > resource.owned - (perfectMapCost_Actual(10, 'lmc') * buildingSetting.SafeGateway.mapCount) ? resource.owned - (perfectMapCost_Actual(10, 'lmc') * buildingSetting.SafeGateway.mapCount) :
					resourcesAvailable;
		}
		if (!resource || typeof resourcesAvailable === 'undefined') {
			console.log("resource " + item + " not found");
			return 1;
		}
		if (typeof price[1] !== 'undefined') {
			var start = price[0];
			if (isEquipment) {
				var artMult = getEquipPriceMult();
				start = Math.ceil(start * artMult);
			}
			if (isBuilding && getPerkLevel("Resourceful")) start = start * (Math.pow(1 - game.portal.Resourceful.modifier, getPerkLevel("Resourceful")));
			toBuy = Math.floor(log10(((resourcesAvailable / (start * Math.pow(price[1], currentOwned))) * (price[1] - 1)) + 1) / log10(price[1]));

		}
		else if (typeof price === 'function') {
			return 1;
		}
		else {
			if (isBuilding && getPerkLevel("Resourceful")) price = Math.ceil(price * (Math.pow(1 - game.portal.Resourceful.modifier, getPerkLevel("Resourceful"))));
			toBuy = Math.floor(resourcesAvailable / price);
		}
		if (mostAfford == -1 || mostAfford > toBuy) mostAfford = toBuy;
	}
	if (forceRatio && (mostAfford <= 0 || isNaN(mostAfford))) return 0;
	if (isBuilding && mostAfford > 1000000000) return 1000000000;
	if (mostAfford <= 0) return 1;
	if (forceMax !== false && mostAfford > forceMax) return forceMax;
	if (isJob && itemObj.max && itemObj.owned + mostAfford > itemObj.max) return (itemObj.max - itemObj.owned);
	return mostAfford;
}

function boneShrineOutput(charges) {

	charges = !charges ? 0 : charges;

	var eligible = ["food", "wood", "metal"];
	var storage = ["Barn", "Shed", "Forge"];
	var rewarded = [0, 0, 0];
	var hasNeg = false;
	for (var x = 0; x < eligible.length; x++) {
		var resName = eligible[x];
		var resObj = game.resources[resName];
		var amt = simpleSeconds(resName, (game.permaBoneBonuses.boosts.timeGranted() * 60));
		amt = scaleLootBonuses(amt, true);
		amt *= charges
		var tempMax = resObj.max;
		var packMod = getPerkLevel("Packrat") * game.portal.Packrat.modifier;
		var newTotal = resObj.owned + amt;
		while (newTotal > calcHeirloomBonus("Shield", "storageSize", tempMax + (tempMax * packMod))) {
			var nextCost = calculatePercentageBuildingCost(storage[x], resName, 0.25, tempMax);
			if (newTotal < nextCost) break;
			newTotal -= nextCost;
			amt -= nextCost;
			tempMax *= 2;
		}
		rewarded[x] = amt;
		if (amt < 0) hasNeg = true;
	}
	var text = prettify(rewarded[0]) + " Food, " + prettify(rewarded[1]) + " Wood, and " + prettify(rewarded[2]) + " Metal."

	return text;
}

function minMapFrag(level, specialModifier, biome) {

	var sliders = [9, 9, 9];
	var perfect = true;
	if (game.resources.fragments.owned < perfectMapCost_Actual(level, specialModifier, biome)) {
		perfect = false;

		while (sliders[0] > 0 && sliders[2] > 0 && perfectMapCost_Actual(level, specialModifier, biome, sliders, perfect) > game.resources.fragments.owned) {
			sliders[0] -= 1;
			if (perfectMapCost_Actual(level, specialModifier, biome, sliders, perfect) <= game.resources.fragments.owned) break;
			sliders[2] -= 1;
		}
	}

	return perfectMapCost_Actual(level, specialModifier, biome, sliders, perfect);
}

function ABItemSwap(items, ring) {
	items = !items ? false : items;
	ring = !ring ? false : ring;
	var changeitems = false;
	if (items) {
		if (changeitems = true) {
			for (var item in autoBattle.items) {
				if (autoBattle.items[item].equipped) {
					autoBattle.items[item].equipped = false;
					changeitems = false;
				}
			}
		}
		for (var item of items) {
			if (autoBattle.items[item].equipped == false) {
				changeitems = true;
				if (autoBattle.items[item].hidden)
					autoBattle.items[item].hidden = false;
				autoBattle.items[item].equipped = true;
			}
		}
	}

	if (ring) {
		autoBattle.rings.mods = ring;
	}
}

function automateSpireAssault() {

	if (autoBattle.enemyLevel === 121) {
		if (autoBattle.rings.level === 49 && autoBattle.shards >= autoBattle.getRingLevelCost()) {
			autoBattle.levelRing();
		}
	}

	if (autoBattle.rings.level === 50 && (autoBattle.items.Basket_of_Souls.level === 10 || autoBattle.items.Snimp__Fanged_Blade.level === 11)) {
		if (autoBattle.items.Basket_of_Souls.level === 10 && autoBattle.shards >= autoBattle.upgradeCost('Basket_of_Souls'))
			autoBattle.upgrade('Basket_of_Souls');
		if (autoBattle.items.Snimp__Fanged_Blade.level === 11 && autoBattle.shards >= autoBattle.upgradeCost('Snimp__Fanged_Blade'))
			autoBattle.upgrade('Snimp__Fanged_Blade');
	}

	if (autoBattle.rings.level >= 50) {
		if (autoBattle.enemyLevel == 130) { //Done
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'lifesteal']
		}
		if (autoBattle.enemyLevel == 131) { //Done
			var items = [['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Grounded_Crown'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'lifesteal']
		}
		if (autoBattle.enemyLevel === 132) { //Done
			var items = [['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Bloodstained_Gloves'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Grounded_Crown'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'lifesteal']
		}
		if (autoBattle.enemyLevel == 133) { //Done
			var items = [['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'lifesteal']
		}
		if (autoBattle.enemyLevel == 134) { //Done
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Grounded_Crown'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'lifesteal']
		}
		if (autoBattle.enemyLevel == 135) { //Done
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Wired_Wristguards'], ['Bloodstained_Gloves'], ['Eelimp_in_a_Bottle'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Grounded_Crown'], ['Fearsome_Piercer'], ['Doppelganger_Signet'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'lifesteal']
		}
		if (autoBattle.enemyLevel == 136) { //Done 2d10h
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 137) { //Done 18h47m
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 138) { //Done 1d20h
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 139) { //Done 1d6h
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 140) { //Done 3d6h
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'health']
		}
	}

	//Swapping Items
	if (autoBattle.sessionEnemiesKilled == 0 && autoBattle.enemy.baseHealth == autoBattle.enemy.health && autoBattle.maxEnemyLevel === autoBattle.enemyLevel) {
		ABItemSwap(items, ring);
		autoBattle.popup(true, false, true);
	}

	//Turning off autoLevel
	if (autoBattle.maxEnemyLevel >= 129 && autoBattle.rings.level < 50) {
		if (autoBattle.autoLevel) autoBattle.toggleAutoLevel();
		return;
	}

	if (!autoBattle.autoLevel)
		autoBattle.toggleAutoLevel();

}

function totalSAResources() {
	//total Dust!
	var dust = 0;
	var shards = 0;
	//Contracts
	var dustContracts = 0;
	var shardContracts = 0;
	for (var item in autoBattle.items) {
		if (item === 'Sword' || item === 'Menacing_Mask' || item === 'Armor' || item === 'Rusty_Dagger' || item === 'Fists_of_Goo' || item === 'Battery_Stick' || item === 'Pants') continue;
		if (typeof (autoBattle.items[item].dustType) === 'undefined') dustContracts += autoBattle.contractPrice(item);
		else shardContracts += autoBattle.contractPrice(item);
	}
	dust += dustContracts;
	shards += shardContracts;

	//Items
	var dustItems = 0;
	var shardItems = 0;
	for (var item in autoBattle.items) {
		//if (typeof (autoBattle.items[item].dustType) !== 'undefined' && autoBattle.items[item].dustType === 'shards') continue;
		var itemPrice = autoBattle.items[item].startPrice;
		var itemPriceMod = autoBattle.items[item].priceMod;
		if (typeof (autoBattle.items[item].startPrice) === 'undefined') itemPrice = 5;
		if (typeof (autoBattle.items[item].priceMod) === 'undefined') itemPriceMod = 3;
		for (var x = 0; x < autoBattle.items[item].level; x++) {
			if (typeof (autoBattle.items[item].dustType) === 'undefined') dustItems += (itemPrice * ((Math.pow(itemPriceMod, x)) / (itemPriceMod)))
			else shardItems += (itemPrice * ((Math.pow(itemPriceMod, x)) / (itemPriceMod)))
		}
	}
	dust += dustItems;
	shards += shardItems;

	//Bonuses
	var dustBonuses = 0;
	var shardBonuses = 0;
	for (var bonus in autoBattle.bonuses) {
		var bonusPrice = autoBattle.bonuses[bonus].price
		var bonusPriceMod = autoBattle.bonuses[bonus].priceMod;
		for (var x = 0; x < autoBattle.bonuses[bonus].level; x++) {
			if (bonus !== 'Scaffolding') dustBonuses += Math.ceil(bonusPrice * Math.pow(bonusPriceMod, x));
			else shardBonuses += Math.ceil(bonusPrice * Math.pow(bonusPriceMod, x));
		}
	}

	dust += dustBonuses
	shards += shardBonuses

	//One Timers
	var dustOneTimers = 0;
	var shardOneTimers = 0;
	for (var item in autoBattle.oneTimers) {
		if (typeof (autoBattle.oneTimers[item].useShards) === 'undefined') dustOneTimers += autoBattle.oneTimerPrice(item);
		else shardOneTimers += autoBattle.oneTimerPrice(item)
	}
	dust += dustOneTimers;
	shards += shardOneTimers;

	//Ring
	var ringCost = 0;
	if (autoBattle.oneTimers["The_Ring"].owned && autoBattle.rings.level > 1) {
		ringCost += Math.ceil(15 * Math.pow(2, autoBattle.rings.level) - 30); // Subtracting 30 for the first level or something.
	}
	shards += ringCost;

	return [dust, shards];
}

function PresetSwapping(preset) {
	if (!getPageSetting('presetSwap')) return

	var preset = !preset ? null :
		(preset != 1 && preset != 2 && preset != 3) ? null :
			preset;

	if (preset == null) {
		debug("Invalid input. Needs to be a value between 1 and 3.");
		return;
	}

	presetTab(preset);
	loadPerkPreset();
}

function downloadSave() {
	if (!getPageSetting('downloadSaves')) return

	tooltip('Export', null, 'update');
	document.getElementById("downloadLink").click();
	cancelTooltip();
}

function hypoPackratReset(challenge) {

	if (challenge === 'Hypothermia' && getPageSetting('hypothermiaDefaultSettings').packrat) {
		toggleRemovePerks();
		numTab(6, true);
		buyPortalUpgrade('Packrat');
		toggleRemovePerks();
		tooltip('Custom', null, 'update', true);
		document.getElementById('customNumberBox').value = 3;
		numTab(5, true)
		buyPortalUpgrade('Packrat');
	}
}

function allocatePerks() {
	if (!game.global.portalActive) return;
	if (portalUniverse === 1 && getPageSetting('autoPerks') !== 2) return;
	if (portalUniverse === 2 && getPageSetting('autoPerks') === 0) return;
	var allocatePerk = portalUniverse === 1 ? 'Looting_II' : getPageSetting('autoPerks') == 1 ? 'Looting' : getPageSetting('autoPerks') == 2 ? 'Greed' : getPageSetting('autoPerks') == 3 ? 'Motivation' : null;
	if (allocatePerk !== null) {
		numTab(6, true)
		buyPortalUpgrade(allocatePerk);
		debug('Bought Max ' + allocatePerk);
	}
}

function dailyModifiersOutput() {
	var daily = game.global.dailyChallenge;
	var dailyMods = dailyModifiers;
	if (!daily) return "";
	//var returnText = ''
	var returnText = "";
	for (var item in daily) {
		if (item === 'seed') continue;
		returnText += dailyMods[item].description(daily[item].strength) + "<br>";
	}
	return returnText
}

function dailyModiferReduction() {
	if (!challengeActive('Daily')) return 0;
	if (game.global.universe === 1) return 0;
	var dailyMods = dailyModifiersOutput().split('<br>');
	dailyMods.length = dailyMods.length - 1;
	var dailyReduction = 0;
	var settingsArray = getPageSetting('dailyPortalSettingsArray');

	for (var item in settingsArray) {
		if (item === 'portalZone' || item === 'portalChallenge') continue;
		if (!settingsArray[item].enabled) continue;
		var dailyReductionTemp = 0;
		var modifier = item;
		if (modifier.includes('Weakness')) modifier = 'Enemies stack a debuff with each attack, reducing Trimp attack by';
		if (modifier.includes('Famine')) modifier = 'less Metal, Food, Wood, and Gems from all sources';
		if (modifier.includes('Large')) modifier = 'All housing can store';

		for (var x = 0; x < dailyMods.length; x++) {
			if (dailyMods[x].includes(modifier)) {
				dailyReductionTemp = settingsArray[item].zone
			}
			if (dailyReduction > dailyReductionTemp) dailyReduction = dailyReductionTemp;
		}
	}
	return dailyReduction
}

function dailyOddOrEven() {
	var result = {
		odd: false,
		even: false,
		oddMult: 0,
		evenMult: 0,
		skipZone: false,
		skipNextZone: 0
	}
	if (!challengeActive('Daily')) return result;
	if (!getPageSetting('mapOddEvenIncrement')) return result;

	if (typeof game.global.dailyChallenge.oddTrimpNerf !== 'undefined') {
		result.oddMult += dailyModifiers.oddTrimpNerf.getMult(game.global.dailyChallenge.oddTrimpNerf.strength);
	}

	//Dodge Dailies
	if (typeof game.global.dailyChallenge.slippery !== "undefined") {
		var slipStr = game.global.dailyChallenge.slippery.strength / 100;
		if (slipStr > 0.15) result.evenMult += slipStr;
		else result.oddMult += slipStr
	}

	if (result.oddMult === 0 && result.evenMult === 0) return result;
	else if (result.oddMult !== 0 && result.evenMult !== 0) {
		if (Math.max(result.oddMult, result.evenMult) === result.oddMult) result.evenMult = 0;
		else result.oddMult = 0;
	}

	if (result.evenMult !== 0) {
		if (game.global.world % 2 === 0) result.skipZone = true;
		else result.skipNextZone = 1;
	}
	else if (result.oddMult !== 0) {
		if (game.global.world % 2 === 1) result.skipZone = true;
		else result.skipNextZone = 1;
	}

	return result;
}

function getAvailableSpecials(special, skipCaches) {

	var cacheMods = [];
	var bestMod;

	if (special === 'lsc') cacheMods = ['lsc', 'hc', 'ssc', 'lc'];
	else if (special === 'lwc') cacheMods = ['lwc', 'hc', 'swc', 'lc'];
	else if (special === 'lmc') cacheMods = ['lmc', 'hc', 'smc', 'lc'];
	else if (special === 'p') cacheMods = ['p', 'fa'];
	else cacheMods = [special];

	var hze = getHighestLevelCleared();
	var unlocksAt = game.global.universe === 2 ? 'unlocksAt2' : 'unlocksAt';

	for (const mod of cacheMods) {
		if (skipCaches && mod === 'hc') continue;
		if (mapSpecialModifierConfig[mod][unlocksAt] <= hze) {
			bestMod = mod;
			break;
		}
	}
	if (bestMod === undefined) bestMod = '0';
	return bestMod;
}

function displayDropdowns(universe, runType, MAZ, varPrefix) {

	if (!universe) universe = game.global.universe;
	if (!MAZ) MAZ = '';
	let dropdown;
	var highestZone = universe === 1 ? game.global.highestLevelCleared + 1 : game.global.highestRadonLevelCleared + 1;

	if (runType === 'Gather') {
		dropdown += "<option value='food'" + ((MAZ == 'food') ? " selected='selected'" : "") + ">Food</option >\
		<option value='wood'" + ((MAZ == 'wood') ? " selected = 'selected'" : "") + " > Wood</option >\
		<option value='metal'" + ((MAZ == 'metal') ? " selected = 'selected'" : "") + " > Metal</option >\
		<option value='science'" + ((MAZ == 'science') ? " selected = 'selected'" : "") + " > Science</option > "
	}

	if (runType === 'hdType') {
		dropdown += "<option value='world'" + ((MAZ == 'world') ? " selected='selected'" : "") + ">World</option >\
		<option value='map'" + ((MAZ == 'map') ? " selected = 'selected'" : "") + " > Map</option >\
		<option value='void'" + ((MAZ == 'void') ? " selected = 'selected'" : "") + " > Void</option >"
	}

	if (runType === 'prestigeGoal') {
		dropdown += "<option value='All'" + ((MAZ == 'All') ? " selected='selected'" : "") + ">All</option >\
		<option value='Shield'" + ((MAZ == 'Shield') ? " selected='selected'" : "") + ">Shield</option >\
		<option value='Dagger'" + ((MAZ == 'Dagger') ? " selected='selected'" : "") + ">Dagger</option >\
		<option value='Boots'" + ((MAZ == 'Boots') ? " selected = 'selected'" : "") + " > Boots</option >\
		<option value='Mace'" + ((MAZ == 'Mace') ? " selected = 'selected'" : "") + " > Mace</option >\
		<option value='Helmet'" + ((MAZ == 'Helmet') ? " selected = 'selected'" : "") + " > Helmet</option >\
		<option value='Polearm'" + ((MAZ == 'Polearm') ? " selected = 'selected'" : "") + " > Polearm</option >\
		<option value='Pants'" + ((MAZ == 'Pants') ? " selected = 'selected'" : "") + " > Pants</option >\
		<option value='Battleaxe'" + ((MAZ == 'Battleaxe') ? " selected = 'selected'" : "") + " > Battleaxe</option >\
		<option value='Shoulderguards'" + ((MAZ == 'Shoulderguards') ? " selected = 'selected'" : "") + " > Shoulderguards</option >\
		<option value='Greatsword'" + ((MAZ == 'Greatsword') ? " selected = 'selected'" : "") + " > Greatsword</option >\
		<option value='Breastplate'" + ((MAZ == 'Breastplate') ? " selected = 'selected'" : "") + " > Breastplate</option >"
		if (game.global.slowDone) dropdown += "<option value='Arbalest'" + ((MAZ == 'Arbalest') ? " selected='selected'" : "") + ">Arbalest</option>"
		if (game.global.slowDone) dropdown += "<option value='Gambeson'" + ((MAZ == 'Gambeson') ? " selected='selected'" : "") + ">Gambeson</option>"
	}

	if (universe === 1) {
		if (runType === 'Cache') {
			//Specials dropdown with conditions for each unlock to only appear when the user can run them.
			dropdown += "<option value='0'" + ((MAZ == '0') ? " selected='selected'" : "") + ">No Modifier</option>"
			if (highestZone >= 60) dropdown += "<option value='fa'" + ((MAZ == 'fa') ? " selected='selected'" : "") + ">Fast Attack</option>\<option value='lc'" + ((MAZ == 'lc') ? " selected='selected'" : "") + ">Large Cache</option>"
			if (highestZone >= 85) dropdown += "<option value = 'ssc'" + ((MAZ == 'ssc') ? " selected = 'selected'" : "") + " > Small Savory Cache</option >\
				<option value='swc'" + ((MAZ == 'swc') ? " selected = 'selected'" : "") + " > Small Wooden Cache</option >\
				<option value='smc'" + ((MAZ == 'smc') ? " selected = 'selected'" : "") + " > Small Metal Cache</option > "
			if (highestZone >= 135) dropdown += "<option value='p'" + ((MAZ == 'p') ? " selected='selected'" : "") + ">Prestigious</option>"
			if (highestZone >= 160) dropdown += "<option value='hc'" + ((MAZ == 'hc') ? " selected='selected'" : "") + ">Huge Cache</option>"
			if (highestZone >= 185) dropdown += "<option value='lsc'" + ((MAZ == 'lsc') ? " selected='selected'" : "") + ">Large Savory Cache</option>\
				<option value='lwc'" + ((MAZ == 'lwc') ? " selected='selected'" : "") + ">Large Wooden Cache</option>\
				<option value='lmc'" + ((MAZ == 'lmc') ? " selected='selected'" : "") + ">Large Metal Cache</option>"
		}
		if (runType === 'Filler') {
			dropdown += "<option value='All'" + ((MAZ == 'All') ? " selected='selected'" : "") + ">All</option>";
			if (highestZone >= 40) dropdown += "<option value='Balance'" + ((MAZ == 'Balance') ? " selected='selected'" : "") + ">Balance</option>";
			if (highestZone >= 55) dropdown += "<option value = 'Decay'" + ((MAZ == 'Decay') ? " selected = 'selected'" : "") + " >Decay</option >";
			if (game.global.prisonClear >= 1) dropdown += "<option value='Electricity'" + ((MAZ == 'Electricity') ? " selected='selected'" : "") + ">Electricity</option>";
			if (highestZone >= 110) dropdown += "<option value='Life'" + ((MAZ == 'Life') ? " selected='selected'" : "") + ">Life</option>";
			if (highestZone >= 125) dropdown += "<option value='Crushed'" + ((MAZ == 'Crushed') ? " selected='selected'" : "") + ">Crushed</option>";
			if (highestZone >= 145) dropdown += "<option value='Nom'" + ((MAZ == 'Nom') ? " selected='selected'" : "") + ">Nom</option>";
			if (highestZone >= 165) dropdown += "<option value='Toxicity'" + ((MAZ == 'Toxicity') ? " selected='selected'" : "") + ">Toxicity</option>";
			if (highestZone >= 180) dropdown += "<option value='Watch'" + ((MAZ == 'Watch') ? " selected='selected'" : "") + ">Watch</option>";
			if (highestZone >= 180) dropdown += "<option value='Lead'" + ((MAZ == 'Lead') ? " selected='selected'" : "") + ">Lead</option>";
			if (highestZone >= 190) dropdown += "<option value='Corrupted'" + ((MAZ == 'Corrupted') ? " selected='selected'" : "") + ">Corrupted</option>";
			if (highestZone >= 215) dropdown += "<option value='Domination'" + ((MAZ == 'Domination') ? " selected='selected'" : "") + ">Domination</option>";
			if (highestZone >= 600) dropdown += "<option value='Experience'" + ((MAZ == 'Experience') ? " selected='selected'" : "") + ">Experience</option>";
		}
		else if (runType === 'C3') {
			dropdown += "<option value='All'" + ((MAZ == 'All') ? " selected='selected'" : "") + ">All</option>";
			if (getTotalPerkResource(true) >= 30) dropdown += "<option value='Discipline'" + ((MAZ == 'Discipline') ? " selected='selected'" : "") + ">Discipline</option>";
			if (highestZone >= 25) dropdown += "<option value='Metal'" + ((MAZ == 'Metal') ? " selected='selected'" : "") + ">Metal</option>";
			if (highestZone >= 35) dropdown += "<option value='Size'" + ((MAZ == 'Size') ? " selected='selected'" : "") + ">Size</option>";
			if (highestZone >= 40) dropdown += "<option value = 'Balance'" + ((MAZ == 'Balance') ? " selected = 'selected'" : "") + " > Balance</option >";
			if (highestZone >= 45) dropdown += "<option value='Meditate'" + ((MAZ == 'Meditate') ? " selected='selected'" : "") + ">Meditate</option>";
			if (highestZone >= 60) dropdown += "<option value='Trimp'" + ((MAZ == 'Trimp') ? " selected='selected'" : "") + ">Trimp</option>";
			if (highestZone >= 70) dropdown += "<option value='Trapper'" + ((MAZ == 'Trapper') ? " selected='selected'" : "") + ">Trapper</option>";
			if (game.global.prisonClear >= 1) dropdown += "<option value='Electricity'" + ((MAZ == 'Electricity') ? " selected='selected'" : "") + ">Electricity</option>";
			if (highestZone >= 120) dropdown += "<option value='Coordinate'" + ((MAZ == 'Coordinate') ? " selected='selected'" : "") + ">Coordinate</option>";
			if (highestZone >= 130) dropdown += "<option value='Slow'" + ((MAZ == 'Slow') ? " selected='selected'" : "") + ">Slow</option>";
			if (highestZone >= 145) dropdown += "<option value='Nom'" + ((MAZ == 'Nom') ? " selected='selected'" : "") + ">Nom</option>";
			if (highestZone >= 150) dropdown += "<option value='Mapology'" + ((MAZ == 'Mapology') ? " selected='selected'" : "") + ">Mapology</option>";
			if (highestZone >= 165) dropdown += "<option value='Toxicity'" + ((MAZ == 'Toxicity') ? " selected='selected'" : "") + ">Toxicity</option>";
			if (highestZone >= 180) dropdown += "<option value='Watch'" + ((MAZ == 'Watch') ? " selected='selected'" : "") + ">Watch</option>";
			if (highestZone >= 180) dropdown += "<option value='Lead'" + ((MAZ == 'Lead') ? " selected='selected'" : "") + ">Lead</option>";
			if (highestZone >= 425) dropdown += "<option value='Obliterated'" + ((MAZ == 'Obliterated') ? " selected='selected'" : "") + ">Obliterated</option>";
			if (game.global.totalSquaredReward >= 4500) dropdown += "<option value='Eradicated'" + ((MAZ == 'Eradicated') ? " selected='selected'" : "") + ">Eradicated</option>";
		}
		else if (runType === 'runType') {
			dropdown += "<option value='All'" + ((MAZ == 'All') ? " selected='selected'" : "") + ">All</option>"
			dropdown += "<option value='Filler'" + ((MAZ == 'Filler') ? " selected = 'selected'" : "") + " > Filler</option >"
			dropdown += " <option value='Daily'" + ((MAZ == 'Daily') ? " selected='selected'" : "") + ">Daily</option>"
			dropdown += "<option value='C3'" + ((MAZ == 'C3') ? " selected='selected'" : "") + ">C2</option>"
		}
		else if (runType === 'goldenType') {
			if (!varPrefix.includes('C3')) dropdown += "<option value='h'" + ((MAZ == 'h') ? " selected='selected'" : "") + ">Helium</option >"
			dropdown += "<option value='b'" + ((MAZ == 'b') ? " selected = 'selected'" : "") + " >Battle</option >"
			dropdown += "<option value='v'" + ((MAZ == 'v') ? " selected = 'selected'" : "") + " >Void</option >"
		}
	}

	if (universe === 2) {
		if (runType === 'Cache') {
			//Specials dropdown with conditions for each unlock to only appear when the user can run them.
			dropdown += "<option value='0'" + ((MAZ == '0') ? " selected='selected'" : "") + ">No Modifier</option>"
			if (highestZone >= 15) dropdown += "<option value='fa'" + ((MAZ == 'fa') ? " selected='selected'" : "") + ">Fast Attack</option>\<option value='lc'" + ((MAZ == 'lc') ? " selected='selected'" : "") + ">Large Cache</option>"
			if (highestZone >= 25) dropdown += "<option value = 'ssc'" + ((MAZ == 'ssc') ? " selected = 'selected'" : "") + " > Small Savory Cache</option >\
				<option value='swc'" + ((MAZ == 'swc') ? " selected = 'selected'" : "") + " > Small Wooden Cache</option >\
				<option value='smc'" + ((MAZ == 'smc') ? " selected = 'selected'" : "") + " > Small Metal Cache</option > "
			if (game.global.ArchaeologyDone) dropdown += "<option value='src'" + ((MAZ == 'src') ? " selected='selected'" : "") + ">Small Research Cache</option>"
			if (highestZone >= 55) dropdown += "<option value='p'" + ((MAZ == 'p') ? " selected='selected'" : "") + ">Prestigious</option>"
			if (highestZone >= 65) dropdown += "<option value='hc'" + ((MAZ == 'hc') ? " selected='selected'" : "") + ">Huge Cache</option>"
			if (highestZone >= 85) dropdown += "<option value='lsc'" + ((MAZ == 'lsc') ? " selected='selected'" : "") + ">Large Savory Cache</option>\
				<option value='lwc'" + ((MAZ == 'lwc') ? " selected='selected'" : "") + ">Large Wooden Cache</option>\
				<option value='lmc'" + ((MAZ == 'lmc') ? " selected='selected'" : "") + ">Large Metal Cache</option>"
			if (game.global.ArchaeologyDone) dropdown += "<option value='lrc'" + ((MAZ == 'lrc') ? " selected='selected'" : "") + ">Large Research Cache</option>"
		}
		if (runType === 'Filler') {
			dropdown += "<option value='All'" + ((MAZ == 'All') ? " selected='selected'" : "") + ">All</option>";
			if (highestZone >= 40) dropdown += "<option value='Bublé'" + ((MAZ == 'Bublé') ? " selected='selected'" : "") + ">Bublé</option>";
			if (highestZone >= 55) dropdown += "<option value = 'Melt'" + ((MAZ == 'Melt') ? " selected = 'selected'" : "") + " > Melt</option >";
			if (highestZone >= 70) dropdown += "<option value='Quagmire'" + ((MAZ == 'Quagmire') ? " selected='selected'" : "") + ">Quagmire</option>";
			if (highestZone >= 85) dropdown += "<option value='Quest'" + ((MAZ == 'Quest') ? " selected='selected'" : "") + ">Quest</option>";
			if (highestZone >= 90) dropdown += "<option value='Archaeology'" + ((MAZ == 'Archaeology') ? " selected='selected'" : "") + ">Archaeology</option>";
			if (highestZone >= 110) dropdown += "<option value='Insanity'" + ((MAZ == 'Insanity') ? " selected='selected'" : "") + ">Insanity</option>";
			if (highestZone >= 135) dropdown += "<option value='Nurture'" + ((MAZ == 'Nurture') ? " selected='selected'" : "") + ">Nurture</option>";
			if (highestZone >= 155) dropdown += "<option value='Alchemy'" + ((MAZ == 'Alchemy') ? " selected='selected'" : "") + ">Alchemy</option>";
			if (highestZone >= 175) dropdown += "<option value='Hypothermia'" + ((MAZ == 'Hypothermia') ? " selected='selected'" : "") + ">Hypothermia</option>";
		}
		else if (runType === 'C3') {
			dropdown += "<option value='All'" + ((MAZ == 'All') ? " selected='selected'" : "") + ">All</option>";
			if (highestZone >= 15) dropdown += "<option value='Unlucky'" + ((MAZ == 'Unlucky') ? " selected='selected'" : "") + ">Unlucky</option>";
			if (highestZone >= 20) dropdown += "<option value='Downsize'" + ((MAZ == 'Downsize') ? " selected='selected'" : "") + ">Downsize</option>";
			if (highestZone >= 25) dropdown += "<option value='Transmute'" + ((MAZ == 'Transmute') ? " selected='selected'" : "") + ">Transmute</option>";
			if (highestZone >= 35) dropdown += "<option value = 'Unbalance'" + ((MAZ == 'Unbalance') ? " selected = 'selected'" : "") + " > Unbalance</option >";
			if (highestZone >= 45) dropdown += "<option value='Duel'" + ((MAZ == 'Duel') ? " selected='selected'" : "") + ">Duel</option>";
			if (highestZone >= 60) dropdown += "<option value='Trappapalooza'" + ((MAZ == 'Trappapalooza') ? " selected='selected'" : "") + ">Trappa</option>";
			if (highestZone >= 70) dropdown += "<option value='Wither'" + ((MAZ == 'Wither') ? " selected='selected'" : "") + ">Wither</option>";
			if (highestZone >= 85) dropdown += "<option value='Quest'" + ((MAZ == 'Quest') ? " selected='selected'" : "") + ">Quest</option>";
			if (highestZone >= 100) dropdown += "<option value='Mayhem'" + ((MAZ == 'Mayhem') ? " selected='selected'" : "") + ">Mayhem</option>";
			if (highestZone >= 105) dropdown += "<option value='Storm'" + ((MAZ == 'Storm') ? " selected='selected'" : "") + ">Storm</option>";
			if (highestZone >= 115) dropdown += "<option value='Berserk'" + ((MAZ == 'Berserk') ? " selected='selected'" : "") + ">Berserk</option>";
			if (highestZone >= 150) dropdown += "<option value='Pandemonium'" + ((MAZ == 'Pandemonium') ? " selected='selected'" : "") + ">Pandemonium</option>";
			if (highestZone >= 175) dropdown += "<option value='Glass'" + ((MAZ == 'Glass') ? " selected='selected'" : "") + ">Glass</option>";
			if (game.global.stringVersion >= '5.9.0' && highestZone >= 200) dropdown += "<option value='Desolation'" + ((MAZ == 'Desolation') ? " selected='selected'" : "") + ">Desolation</option>";
			if (highestZone >= 201) dropdown += "<option value='Smithless'" + ((MAZ == 'Smithless') ? " selected='selected'" : "") + ">Smithless</option>";
		}
		else if (runType === 'runType') {
			dropdown += "<option value='All'" + ((MAZ == 'All') ? " selected='selected'" : "") + ">All</option>"
			dropdown += "<option value='Filler'" + ((MAZ == 'Filler') ? " selected = 'selected'" : "") + " > Filler</option >"
			dropdown += " <option value='Daily'" + ((MAZ == 'Daily') ? " selected='selected'" : "") + ">Daily</option>"
			dropdown += "<option value='C3'" + ((MAZ == 'C3') ? " selected='selected'" : "") + ">C3</option>"
		}
		else if (runType === 'goldenType') {
			if (!varPrefix.includes('C3')) dropdown += "<option value='r'" + ((MAZ == 'r') ? " selected='selected'" : "") + ">Radon</option >"
			dropdown += "<option value='b'" + ((MAZ == 'b') ? " selected = 'selected'" : "") + " >Battle</option >"
			dropdown += "<option value='v'" + ((MAZ == 'v') ? " selected = 'selected'" : "") + " >Void</option >"
		}
	}

	return dropdown;
}

function challengeActive(what) {
	if (game.global.stringVersion >= '5.9.0' && game.global.multiChallenge[what]) return true;
	else if (game.global.challengeActive == what) return true;
	else return false;
}

function getSpecialTime(special, maps, noImports) {
	if (!special) special = getAvailableSpecials('lmc');
	if (!maps) maps = 1;
	var specialTime = 0;

	//Figuring out loot time our selected cache gives us
	specialTime +=
		special[0] === 'l' && special.length === 3 ? 20 :
			special === 'hc' ? 10 :
				special[0] === 's' ? 10 :
					special === 'lc' ? 5 :
						0;

	specialTime *= maps;
	if (!noImports) {
		specialTime += game.unlocks.imps.Chronoimp ? (5 * maps) : 0;
		if (maps >= 4) specialTime += (Math.floor(maps / 4) * 45);
	}

	return (specialTime);
}