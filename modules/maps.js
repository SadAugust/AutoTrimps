//Helium

MODULES.maps = {};
MODULES.maps.numHitsSurvived = 8;
MODULES.maps.LeadfarmingCutoff = 10;
MODULES.maps.NomfarmingCutoff = 10;
MODULES.maps.NomFarmStacksCutoff = [7, 30, 100];
MODULES.maps.MapTierZone = [72, 47, 16];
MODULES.maps.MapTier0Sliders = [9, 9, 9, "Mountain"];
MODULES.maps.MapTier1Sliders = [9, 9, 9, "Depths"];
MODULES.maps.MapTier2Sliders = [9, 9, 9, "Random"];
MODULES.maps.MapTier3Sliders = [9, 9, 9, "Random"];
MODULES.maps.preferGardens = !getPageSetting("PreferMetal");
MODULES.maps.SpireFarm199Maps = !0;
MODULES.maps.shouldFarmCell = 59;
MODULES.maps.SkipNumUnboughtPrestiges = 2;
MODULES.maps.UnearnedPrestigesRequired = 2;

var doVoids = !1;
var needToVoid = !1;
var needPrestige = !1;
var skippedPrestige = !1;
var scryerStuck = !1;
var shouldDoMaps = !1;
var mapTimeEstimate = 0;
var lastMapWeWereIn = null;
var preSpireFarming = !1;
var spireMapBonusFarming = !1;
var spireTime = 0;
var doMaxMapBonus = !1;
var vanillaMapatZone = !1;
var additionalCritMulti = 2 < getPlayerCritChance() ? 25 : 5;

function updateAutoMapsStatus(get) {

	var status;
	var minSp = getPageSetting('MinutestoFarmBeforeSpire');

	//Fail Safes
	if (getPageSetting('AutoMaps') == 0) status = 'Off';
	else if (game.global.challengeActive == "Mapology" && game.challenges.Mapology.credits < 1) status = 'Out of Map Credits';

	//Raiding
	else if (game.global.mapsActive && getCurrentMapObject().level > game.global.world && getCurrentMapObject().location != "Void" && getCurrentMapObject().location != "Bionic") status = 'Prestige Raiding';
	else if (game.global.mapsActive && getCurrentMapObject().level > game.global.world && getCurrentMapObject().location == "Bionic") status = 'BW Raiding';

	//Spire
	else if (preSpireFarming) {
		var secs = Math.floor(60 - (spireTime * 60) % 60).toFixed(0);
		var mins = Math.floor(minSp - spireTime).toFixed(0);
		var hours = ((minSp - spireTime) / 60).toFixed(2);
		var spiretimeStr = (minSp - spireTime >= 60) ?
			(hours + 'h') : (mins + 'm:' + (secs >= 10 ? secs : ('0' + secs)) + 's');
		status = 'Farming for Spire ' + spiretimeStr + ' left';
	}

	else if (spireMapBonusFarming) status = 'Getting Spire Map Bonus';
	else if (getPageSetting('SkipSpires') == 1 && ((game.global.challengeActive != 'Daily' && isActiveSpireAT()) || (game.global.challengeActive == 'Daily' && disActiveSpireAT()))) status = 'Skipping Spire';
	else if (doMaxMapBonus) status = 'Max Map Bonus After Zone';
	else if (!game.global.mapsUnlocked) status = '&nbsp;';
	else if (needPrestige && !doVoids) status = 'Prestige';
	else if (doVoids) {
		var stackedMaps = Fluffy.isRewardActive('void') ? countStackedVoidMaps() : 0;
		status = 'Void Maps: ' + game.global.totalVoidMaps + ((stackedMaps) ? " (" + stackedMaps + " stacked)" : "") + ' remaining';
	}
	else if (shouldFarm && !doVoids) status = 'Farming: ' + calcHDratio().toFixed(4) + 'x';
	else if (!enoughHealth && !enoughDamage) status = 'Want Health & Damage';
	else if (!enoughDamage) status = 'Want ' + calcHDratio().toFixed(4) + 'x &nbspmore damage';
	else if (!enoughHealth) status = 'Want more health';
	else if (enoughHealth && enoughDamage) status = 'Advancing';

	if (skippedPrestige)
		status += '<br><b style="font-size:.8em;color:pink;margin-top:0.2vw">Prestige Skipped</b>';

	//hider he/hr% status
	var getPercent = (game.stats.heliumHour.value() / (game.global.totalHeliumEarned - (game.global.heliumLeftover + game.resources.helium.owned))) * 100;
	var lifetime = (game.resources.helium.owned / (game.global.totalHeliumEarned - game.resources.helium.owned)) * 100;
	var hiderStatus = 'He/hr: ' + getPercent.toFixed(3) + '%<br>&nbsp;&nbsp;&nbsp;He: ' + lifetime.toFixed(3) + '%';

	if (get) {
		return [status, getPercent, lifetime];
	} else {
		document.getElementById('autoMapStatus').innerHTML = status;
		document.getElementById('hiderStatus').innerHTML = hiderStatus;
	}
}

MODULES["maps"].advSpecialMapMod_numZones = 3;
var advExtraMapLevels = 0;
function testMapSpecialModController() {
	var a = [];
	if (Object.keys(mapSpecialModifierConfig).forEach(function (o) {
		var p = mapSpecialModifierConfig[o];
		game.global.highestLevelCleared + 1 >= p.unlocksAt && a.push(p.abv.toLowerCase());
	}), !(1 > a.length)) {
		var c = document.getElementById("advSpecialSelect");
		if (c) {
			if (59 <= game.global.highestLevelCleared) {
				if (needPrestige && a.includes("p")) {
					c.value = "p";
				} else if (shouldFarm || !enoughHealth || preSpireFarming) {
					c.value = a.includes("lmc") ? "lmc" : a.includes("hc") ? "hc" : a.includes("smc") ? "smc" : "lc";
				} else c.value = "fa";
				for (var d = updateMapCost(!0), e = game.resources.fragments.owned, f = 100 * (d / e); 0 < c.selectedIndex && d > e;) {
					c.selectedIndex -= 1;
					"0" != c.value && console.log("Could not afford " + mapSpecialModifierConfig[c.value].name);
				}
				var d = updateMapCost(!0),
					e = game.resources.fragments.owned;
				"0" != c.value && debug("Set the map special modifier to: " + mapSpecialModifierConfig[c.value].name + ". Cost: " + (100 * (d / e)).toFixed(2) + "% of your fragments.");
			}
			var g = getSpecialModifierSetting(),
				h = 109 <= game.global.highestLevelCleared,
				i = checkPerfectChecked(),
				j = document.getElementById("advPerfectCheckbox"),
				k = getPageSetting("AdvMapSpecialModifier") ? getExtraMapLevels() : 0,
				l = 209 <= game.global.highestLevelCleared;
			if (l) {
				var m = document.getElementById("advExtraMapLevelselect");
				if (!m)
					return;
				var n = document.getElementById("mapLevelInput").value;
				for (m.selectedIndex = n == game.global.world ? MODULES.maps.advSpecialMapMod_numZones : 0; 0 < m.selectedIndex && updateMapCost(!0) > game.resources.fragments.owned;)
					m.selectedIndex -= 1;
			}
		}
	}
}

function autoMap() {

	//Failsafes
	if (!game.global.mapsUnlocked || calcOurDmg("avg", false, true) <= 0) {
		enoughDamage = true;
		enoughHealth = true;
		shouldFarm = false;
		updateAutoMapsStatus();
		return;
	}
	if (game.global.challengeActive == "Mapology" && game.challenges.Mapology.credits < 1) {
		updateAutoMapsStatus();
		return;
	}

	//WS
	var mapenoughdamagecutoff = getPageSetting("mapcuntoff");
	if (getEmpowerment() == 'Wind' && game.global.challengeActive != "Daily" && !game.global.runningChallengeSquared && getPageSetting("AutoStance") == 3 && getPageSetting("WindStackingMin") > 0 && game.global.world >= getPageSetting("WindStackingMin") && getPageSetting("windcutoffmap") > 0)
		mapenoughdamagecutoff = getPageSetting("windcutoffmap");
	if (getEmpowerment() == 'Wind' && game.global.challengeActive == "Daily" && !game.global.runningChallengeSquared && (getPageSetting("AutoStance") == 3 || getPageSetting("use3daily") == true) && getPageSetting("dWindStackingMin") > 0 && game.global.world >= getPageSetting("dWindStackingMin") && getPageSetting("dwindcutoffmap") > 0)
		mapenoughdamagecutoff = getPageSetting("dwindcutoffmap");
	if (getPageSetting("mapc2hd") > 0 && game.global.challengeActive == "Mapology")
		mapenoughdamagecutoff = getPageSetting("mapc2hd");

	//Vars
	var customVars = MODULES["maps"];
	var prestige = autoTrimpSettings.Prestige.selected;
	if (prestige != "Off" && game.options.menu.mapLoot.enabled != 1) toggleSetting('mapLoot');
	if (game.global.repeatMap == true && !game.global.mapsActive && !game.global.preMapsActive) repeatClicked();
	if ((game.options.menu.repeatUntil.enabled == 1 || game.options.menu.repeatUntil.enabled == 2 || game.options.menu.repeatUntil.enabled == 3) && !game.global.mapsActive && !game.global.preMapsActive) toggleSetting('repeatUntil');
	if (game.options.menu.exitTo.enabled != 0) toggleSetting('exitTo');
	if (game.options.menu.repeatVoids.enabled != 0) toggleSetting('repeatVoids');
	var challSQ = game.global.runningChallengeSquared;
	var extraMapLevels = getPageSetting('AdvMapSpecialModifier') ? getExtraMapLevels() : 0;

	//Void Vars
	var voidMapLevelSetting = 0;
	var voidMapLevelSettingCell;
	var voidMapLevelPlus = 0;
	
	voidMapLevelSettingCell = game.global.challengeActive == "Daily" && getPageSetting('dvoidscell') > 0 ? getPageSetting('dvoidscell'): game.global.challengeActive != "Daily" &&  getPageSetting('voidscell') > 0 ? getPageSetting('voidscell') : 70
	if (game.global.challengeActive != "Daily" && getPageSetting('VoidMaps') > 0) {
		voidMapLevelSetting = getPageSetting('VoidMaps');
	}
	if (game.global.challengeActive == "Daily" && getPageSetting('DailyVoidMod') >= 1) {
		voidMapLevelSetting = getPageSetting('DailyVoidMod');
	}
	if (getPageSetting('RunNewVoidsUntilNew') != 0 && game.global.challengeActive != "Daily") {
		voidMapLevelPlus = getPageSetting('RunNewVoidsUntilNew');
	}
	if (getPageSetting('dRunNewVoidsUntilNew') != 0 && game.global.challengeActive == "Daily") {
		voidMapLevelPlus = getPageSetting('dRunNewVoidsUntilNew');
	}

	needToVoid = (voidMapLevelSetting > 0 && game.global.totalVoidMaps > 0 && game.global.lastClearedCell + 1 >= voidMapLevelSettingCell &&
		(
			(game.global.world == voidMapLevelSetting) ||
			(voidMapLevelPlus < 0 && game.global.world >= voidMapLevelSetting &&
				(game.global.universe == 1 &&
					(
						(getPageSetting('runnewvoidspoison') == false && game.global.challengeActive != "Daily") ||
						(getPageSetting('drunnewvoidspoison') == false && game.global.challengeActive == "Daily")
					) ||
					(
						(getPageSetting('runnewvoidspoison') == true && getEmpowerment() == 'Poison' && game.global.challengeActive != "Daily") ||
						(getPageSetting('drunnewvoidspoison') == true && getEmpowerment() == 'Poison' && game.global.challengeActive == "Daily")
					)
				) ||
				(voidMapLevelPlus > 0 && game.global.world >= voidMapLevelSetting && game.global.world <= (voidMapLevelSetting + voidMapLevelPlus) &&
					(game.global.universe == 1 &&
						(
							(getPageSetting('runnewvoidspoison') == false && game.global.challengeActive != "Daily") ||
							(getPageSetting('drunnewvoidspoison') == false && game.global.challengeActive == "Daily")
						) ||
						(
							(getPageSetting('runnewvoidspoison') == true && getEmpowerment() == 'Poison' && game.global.challengeActive != "Daily") ||
							(getPageSetting('drunnewvoidspoison') == true && getEmpowerment() == 'Poison' && game.global.challengeActive == "Daily")
						)
					)
				)
			)
		)
	);

	var voidArrayDoneS = [];
	if (game.global.challengeActive != "Daily" && getPageSetting('onlystackedvoids') == true) {
		for (var mapz in game.global.mapsOwnedArray) {
			var theMapz = game.global.mapsOwnedArray[mapz];
			if (theMapz.location == 'Void' && theMapz.stacked > 0) {
				voidArrayDoneS.push(theMapz);
			}
		}
	}

	if (
		(game.global.totalVoidMaps <= 0) ||
		(!needToVoid) ||
		(getPageSetting('novmsc2') == true && game.global.runningChallengeSquared) ||
		(game.global.challengeActive != "Daily" && game.global.totalVoidMaps > 0 && getPageSetting('onlystackedvoids') == true && voidArrayDoneS.length < 1)
	) {
		doVoids = false;
	}

	//Prestige
	if ((getPageSetting('ForcePresZ') >= 0) && ((game.global.world + extraMapLevels) >= getPageSetting('ForcePresZ'))) {
		const prestigeList = ['Supershield', 'Dagadder', 'Megamace', 'Polierarm', 'Axeidic', 'Greatersword', 'Harmbalest', 'Bootboost', 'Hellishmet', 'Pantastic', 'Smoldershoulder', 'Bestplate', 'GambesOP'];
		needPrestige = (offlineProgress.countMapItems(game.global.world) !== 0);
	} else
		needPrestige = prestige != "Off" && game.mapUnlocks[prestige] && game.mapUnlocks[prestige].last <= (game.global.world + extraMapLevels) - 5 && game.global.challengeActive != "Frugal";

	skippedPrestige = false;
	if (needPrestige && (getPageSetting('PrestigeSkip1_2') == 1 || getPageSetting('PrestigeSkip1_2') == 2)) {
		var prestigeList = ['Dagadder', 'Megamace', 'Polierarm', 'Axeidic', 'Greatersword', 'Harmbalest', 'Bootboost', 'Hellishmet', 'Pantastic', 'Smoldershoulder', 'Bestplate', 'GambesOP'];
		var numUnbought = 0;
		for (var i in prestigeList) {
			var p = prestigeList[i];
			if (game.upgrades[p].allowed - game.upgrades[p].done > 0)
				numUnbought++;
		}
		if (numUnbought >= customVars.SkipNumUnboughtPrestiges) {
			needPrestige = false;
			skippedPrestige = true;
		}
	}

	if ((needPrestige || skippedPrestige) && (getPageSetting('PrestigeSkip1_2') == 1 || getPageSetting('PrestigeSkip1_2') == 3)) {
		const prestigeList = ['Dagadder', 'Megamace', 'Polierarm', 'Axeidic', 'Greatersword', 'Harmbalest'];
		const numLeft = prestigeList.filter(prestige => game.mapUnlocks[prestige].last <= (game.global.world + extraMapLevels) - 5);
		const shouldSkip = numLeft <= customVars.UnearnedPrestigesRequired;
		if (shouldSkip != skippedPrestige) {
			needPrestige = !needPrestige;
			skippedPrestige = !skippedPrestige;
		}
	}

	//Calc
	var ourBaseDamage = calcOurDmg("avg", false, true);
	var enemyDamage = calcBadGuyDmg(null, getEnemyMaxAttack(game.global.world + 1, 50, 'Snimp', 1.0), true, true);
	var enemyHealth = calcEnemyHealth();

	if (getPageSetting('DisableFarm') > 0) {
		shouldFarm = (calcHDratio() >= getPageSetting('DisableFarm'));
		if (game.options.menu.repeatUntil.enabled == 1 && shouldFarm)
			toggleSetting('repeatUntil');
	}
	if (game.global.spireActive) {
		enemyDamage = calcSpire(99, game.global.gridArray[99].name, 'attack');
	}
	highDamageShield();
	if (getPageSetting('loomswap') > 0 && game.global.challengeActive != "Daily" && game.global.ShieldEquipped.name != getPageSetting('highdmg'))
		ourBaseDamage *= trimpAA;
	if (getPageSetting('dloomswap') > 0 && game.global.challengeActive == "Daily" && game.global.ShieldEquipped.name != getPageSetting('dhighdmg'))
		ourBaseDamage *= trimpAA;
	var mapbonusmulti = game.talents.mapBattery.purchased && game.global.mapBonus == 10 ? 5 : 1 + (game.global.mapBonus * .2);
	var ourBaseDamage2 = ourBaseDamage;
	ourBaseDamage2 /= mapbonusmulti;
	var pierceMod = (game.global.brokenPlanet) ? getPierceAmt() : 0;
	const FORMATION_MOD_1 = game.upgrades.Dominance.done ? 2 : 1;
	enoughHealth = (calcOurHealth() / FORMATION_MOD_1 > customVars.numHitsSurvived * (enemyDamage - calcOurBlock() / FORMATION_MOD_1 > 0 ? enemyDamage - calcOurBlock() / FORMATION_MOD_1 : enemyDamage * pierceMod));
	enoughDamage = (ourBaseDamage * mapenoughdamagecutoff > enemyHealth);
	updateAutoMapsStatus();

	//Farming
	var selectedMap = "world";
	var shouldFarmLowerZone = false;
	shouldDoMaps = false;
	if (ourBaseDamage > 0) {
		shouldDoMaps = (!enoughDamage || shouldFarm || scryerStuck);
	}
	var shouldDoHealthMaps = false;
	if (game.global.mapBonus >= getPageSetting('MaxMapBonuslimit') && !shouldFarm)
		shouldDoMaps = false;
	else if (game.global.mapBonus >= getPageSetting('MaxMapBonuslimit') && shouldFarm)
		shouldFarmLowerZone = getPageSetting('LowerFarmingZone');
	else if (game.global.mapBonus < getPageSetting('MaxMapBonushealth') && !enoughHealth && !shouldDoMaps && !needPrestige) {
		shouldDoMaps = true;
		shouldDoHealthMaps = true;
	}
	var restartVoidMap = false;
	if (game.global.challengeActive == 'Nom' && getPageSetting('FarmWhenNomStacks7')) {
		if (game.global.gridArray[99].nomStacks > customVars.NomFarmStacksCutoff[0]) {
			if (game.global.mapBonus != getPageSetting('MaxMapBonuslimit'))
				shouldDoMaps = true;
		}
		if (game.global.gridArray[99].nomStacks == customVars.NomFarmStacksCutoff[1]) {
			shouldFarm = (calcHDratio() > customVars.NomfarmingCutoff);
			shouldDoMaps = true;
		}
		if (!game.global.mapsActive && game.global.gridArray[game.global.lastClearedCell + 1].nomStacks >= customVars.NomFarmStacksCutoff[2]) {
			shouldFarm = (calcHDratio() > customVars.NomfarmingCutoff);
			shouldDoMaps = true;
		}
		if (game.global.mapsActive && game.global.mapGridArray[game.global.lastClearedMapCell + 1].nomStacks >= customVars.NomFarmStacksCutoff[2]) {
			shouldFarm = (calcHDratio() > customVars.NomfarmingCutoff);
			shouldDoMaps = true;
			restartVoidMap = true;
		}
	}

	//Prestige
	if (shouldFarm && !needPrestige) {
		var capped = areWeAttackLevelCapped();
		var prestigeitemsleft;
		if (game.global.mapsActive) {
			prestigeitemsleft = addSpecials(true, true, getCurrentMapObject());
		} else if (lastMapWeWereIn) {
			prestigeitemsleft = addSpecials(true, true, lastMapWeWereIn);
		}
		const prestigeList = ['Dagadder', 'Megamace', 'Polierarm', 'Axeidic', 'Greatersword', 'Harmbalest'];
		var numUnbought = 0;
		for (var i = 0, len = prestigeList.length; i < len; i++) {
			var p = prestigeList[i];
			if (game.upgrades[p].allowed - game.upgrades[p].done > 0)
				numUnbought++;
		}
		if (capped && prestigeitemsleft == 0 && numUnbought == 0) {
			shouldFarm = false;
			if (game.global.mapBonus >= getPageSetting('MaxMapBonuslimit') && !shouldFarm)
				shouldDoMaps = false;
		}
	}

	//Spire
	var shouldDoSpireMaps = false;
	preSpireFarming = (isActiveSpireAT() || disActiveSpireAT()) && (spireTime = (new Date().getTime() - game.global.zoneStarted) / 1000 / 60) < getPageSetting('MinutestoFarmBeforeSpire');
	spireMapBonusFarming = getPageSetting('MaxStacksForSpire') && (isActiveSpireAT() || disActiveSpireAT()) && game.global.mapBonus < 10;
	if (preSpireFarming || spireMapBonusFarming) {
		shouldDoMaps = true;
		shouldDoSpireMaps = true;
	}

	//Map Bonus
	var maxMapBonusZ = getPageSetting('MaxMapBonusAfterZone');
	doMaxMapBonus = (maxMapBonusZ >= 0 && game.global.mapBonus < getPageSetting("MaxMapBonuslimit") && game.global.world >= maxMapBonusZ);
	if (doMaxMapBonus)
		shouldDoMaps = true;

    //Map at Zone (MAZ)
    vanillaMapatZone = false;
    if (game.options.menu.mapAtZone.enabled && game.global.canMapAtZone && !isActiveSpireAT() && !disActiveSpireAT()) {
        for (var x = 0; x < game.options.menu.mapAtZone.setZone.length; x++) {
            var option = game.options.menu.mapAtZone.setZone[x];
            if (option.world == game.global.world && option.cell == game.global.lastClearedCell+2) vanillaMapatZone = true;
        }
        if (vanillaMapatZone) {
            updateAutoMapsStatus();
            return;
        }
    }

	var siphlvl = shouldFarmLowerZone ? game.global.world - 10 : game.global.world - game.portal.Siphonology.level;
	var maxlvl = game.talents.mapLoot.purchased ? game.global.world - 1 : game.global.world;
	maxlvl += extraMapLevels;
	if (getPageSetting('DynamicSiphonology') || shouldFarmLowerZone) {
		for (siphlvl; siphlvl < maxlvl; siphlvl++) {
			var maphp = getEnemyMaxHealth(siphlvl) * 1.1;
			var cpthlth = getCorruptScale("health") / 2;
			if (mutations.Magma.active())
				maphp *= cpthlth;
			var mapdmg = ourBaseDamage2;
			if (game.upgrades.Dominance.done)
				mapdmg *= 4;
			if (mapdmg < maphp) {
				break;
			}
		}
	}
	var obj = {};
	var siphonMap = -1;
	for (var map in game.global.mapsOwnedArray) {
		if (!game.global.mapsOwnedArray[map].noRecycle) {
			obj[map] = game.global.mapsOwnedArray[map].level;
			if (game.global.mapsOwnedArray[map].level == siphlvl)
				siphonMap = map;
		}
	}
	var keysSorted = Object.keys(obj).sort(function (a, b) {
		return obj[b] - obj[a];
	});
	var highestMap;
	var lowestMap;
	if (keysSorted[0]) {
		highestMap = keysSorted[0];
		lowestMap = keysSorted[keysSorted.length - 1];
	} else
		selectedMap = "create";

	//Uniques
	var runUniques = (getPageSetting('AutoMaps') == 1);
	if (runUniques) {
		for (var map in game.global.mapsOwnedArray) {
			var theMap = game.global.mapsOwnedArray[map];
			if (theMap.noRecycle) {
				if (theMap.name == 'The Wall' && game.upgrades.Bounty.allowed == 0 && !game.talents.bounty.purchased) {
					var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
					if (game.global.world < 15 + theMapDifficulty) continue;
					selectedMap = theMap.id;
					break;
				}
				if (theMap.name == 'Dimension of Anger' && document.getElementById("portalBtn").style.display == "none" && !game.talents.portal.purchased) {
					var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
					if (game.global.world < 20 + theMapDifficulty) continue;
					selectedMap = theMap.id;
					break;
				}
				var runningC2 = game.global.runningChallengeSquared;
				if (theMap.name == 'The Block' && !game.upgrades.Shieldblock.allowed && ((game.global.challengeActive == "Scientist" || game.global.challengeActive == "Trimp") && !runningC2 || getPageSetting('BuyShieldblock'))) {
					var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
					if (game.global.world < 11 + theMapDifficulty) continue;
					selectedMap = theMap.id;
					break;
				}
				var treasure = getPageSetting('TrimpleZ');
				if (theMap.name == 'Trimple Of Doom' && (!runningC2 && game.mapUnlocks.AncientTreasure.canRunOnce && game.global.world >= treasure)) {
					var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
					if ((game.global.world < 33 + theMapDifficulty) || treasure > -33 && treasure < 33) continue;
					selectedMap = theMap.id;
					if (treasure < 0)
						setPageSetting('TrimpleZ', 0);
					break;
				}
				if (!runningC2) {
					if (theMap.name == 'The Prison' && (game.global.challengeActive == "Electricity" || game.global.challengeActive == "Mapocalypse")) {
						var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
						if (game.global.world < 80 + theMapDifficulty) continue;
						selectedMap = theMap.id;
						break;
					}
					if (theMap.name == 'Bionic Wonderland' && game.global.challengeActive == "Crushed") {
						var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
						if (game.global.world < 125 + theMapDifficulty) continue;
						selectedMap = theMap.id;
						break;
					}
				}
			}
		}
	}

	//Voids
	if (needToVoid) {
		var voidArray = [];
		var prefixlist = {
			'Deadly': 10,
			'Heinous': 11,
			'Poisonous': 20,
			'Destructive': 30
		};
		var prefixkeys = Object.keys(prefixlist);
		var suffixlist = {
			'Descent': 7.077,
			'Void': 8.822,
			'Nightmare': 9.436,
			'Pit': 10.6
		};
		var suffixkeys = Object.keys(suffixlist);

		if (game.global.challengeActive != "Daily" && getPageSetting('onlystackedvoids') == true) {
			for (var map in game.global.mapsOwnedArray) {
				var theMap = game.global.mapsOwnedArray[map];
				if (theMap.location == 'Void' && theMap.stacked > 0) {
					for (var pre in prefixkeys) {
						if (theMap.name.includes(prefixkeys[pre]))
							theMap.sortByDiff = 1 * prefixlist[prefixkeys[pre]];
					}
					for (var suf in suffixkeys) {
						if (theMap.name.includes(suffixkeys[suf]))
							theMap.sortByDiff += 1 * suffixlist[suffixkeys[suf]];
					}
					voidArray.push(theMap);
				}
			}
		} else {
			for (var map in game.global.mapsOwnedArray) {
				var theMap = game.global.mapsOwnedArray[map];
				if (theMap.location == 'Void') {
					for (var pre in prefixkeys) {
						if (theMap.name.includes(prefixkeys[pre]))
							theMap.sortByDiff = 1 * prefixlist[prefixkeys[pre]];
					}
					for (var suf in suffixkeys) {
						if (theMap.name.includes(suffixkeys[suf]))
							theMap.sortByDiff += 1 * suffixlist[suffixkeys[suf]];
					}
					voidArray.push(theMap);
				}
			}
		}

		var voidArraySorted = voidArray.sort(function (a, b) {
			return a.sortByDiff - b.sortByDiff;
		});
		for (var map in voidArraySorted) {
			var theMap = voidArraySorted[map];
			doVoids = true;
			var eAttack = getEnemyMaxAttack(game.global.world, theMap.size, 'Voidsnimp', theMap.difficulty);
			if (game.global.world >= 181 || (game.global.challengeActive == "Corrupted" && game.global.world >= 60))
				eAttack *= (getCorruptScale("attack") / 2).toFixed(1);
			if (game.global.challengeActive == 'Balance') {
				eAttack *= 2;
			}
			if (game.global.challengeActive == 'Toxicity') {
				eAttack *= 5;
			}
			if (getPageSetting('DisableFarm') <= 0)
				shouldFarm = shouldFarm || false;
			if (!restartVoidMap)
				selectedMap = theMap.id;
			if (game.global.mapsActive && getCurrentMapObject().location == "Void" && game.global.challengeActive == "Nom" && getPageSetting('FarmWhenNomStacks7')) {
				if (game.global.mapGridArray[theMap.size - 1].nomStacks >= customVars.NomFarmStacksCutoff[2]) {
					mapsClicked(true);
				}
			}
			break;
		}
	}

	//Skip Spires
	if (!preSpireFarming && getPageSetting('SkipSpires') == 1 && ((game.global.challengeActive != 'Daily' && isActiveSpireAT()) || (game.global.challengeActive == 'Daily' && disActiveSpireAT()))) {
		enoughDamage = true;
		enoughHealth = true;
		shouldFarm = false;
		shouldDoMaps = false;
	}

	//Automaps
	if (shouldDoMaps || doVoids || needPrestige) {
		if (selectedMap == "world") {
			if (preSpireFarming) {
				var spiremaplvl = (game.talents.mapLoot.purchased && MODULES["maps"].SpireFarm199Maps) ? game.global.world - 1 : game.global.world;
				selectedMap = "create";
				for (i = 0; i < keysSorted.length; i++) {
					if (game.global.mapsOwnedArray[keysSorted[i]].level >= spiremaplvl &&
						game.global.mapsOwnedArray[keysSorted[i]].location == ((customVars.preferGardens && game.global.decayDone) ? 'Plentiful' : 'Mountain')) {
						selectedMap = game.global.mapsOwnedArray[keysSorted[i]].id;
						break;
					}
				}
			} else if (needPrestige || (extraMapLevels > 0)) {
				if ((game.global.world + extraMapLevels) <= game.global.mapsOwnedArray[highestMap].level)
					selectedMap = game.global.mapsOwnedArray[highestMap].id;
				else
					selectedMap = "create";
			} else if (siphonMap != -1)
				selectedMap = game.global.mapsOwnedArray[siphonMap].id;
			else
				selectedMap = "create";
		}
	}
	if ((game.global.challengeActive == 'Lead' && !challSQ) && !doVoids && (game.global.world % 2 == 0 || game.global.lastClearedCell < customVars.shouldFarmCell)) {
		if (game.global.preMapsActive)
			mapsClicked();
		return;
	}
	if (!game.global.preMapsActive && game.global.mapsActive) {
		var doDefaultMapBonus = game.global.mapBonus < getPageSetting('MaxMapBonuslimit') - 1;
		if (selectedMap == game.global.currentMapId && (!getCurrentMapObject().noRecycle && (doDefaultMapBonus || vanillaMapatZone || doMaxMapBonus || shouldFarm || needPrestige || shouldDoSpireMaps))) {
			var targetPrestige = autoTrimpSettings.Prestige.selected;
			if (!game.global.repeatMap) {
				repeatClicked();
			}
			if (!shouldDoMaps && (game.global.mapGridArray[game.global.mapGridArray.length - 1].special == targetPrestige && game.mapUnlocks[targetPrestige].last >= (game.global.world + extraMapLevels - 9))) {
				repeatClicked();
			}
			if (shouldDoHealthMaps && game.global.mapBonus >= getPageSetting('MaxMapBonushealth') - 1) {
				repeatClicked();
				shouldDoHealthMaps = false;
			}
			if (doMaxMapBonus && game.global.mapBonus >= getPageSetting('MaxMapBonuslimit') - 1) {
				repeatClicked();
				doMaxMapBonus = false;
			}
		} else {
			if (game.global.repeatMap) {
				repeatClicked();
			}
			if (restartVoidMap) {
				mapsClicked(true);
			}
		}
	} else if (!game.global.preMapsActive && !game.global.mapsActive) {
		if (selectedMap != "world") {
			if (!game.global.switchToMaps) {
				mapsClicked();
			}
			if ((!getPageSetting('PowerSaving') || (getPageSetting('PowerSaving') == 2) && doVoids) && game.global.switchToMaps &&
				(needPrestige || doVoids ||
					((game.global.challengeActive == 'Lead' && !challSQ) && game.global.world % 2 == 1) ||
					(!enoughDamage && enoughHealth && game.global.lastClearedCell < 9) ||
					(shouldFarm && game.global.lastClearedCell >= customVars.shouldFarmCell) ||
					(scryerStuck)) &&
				(
					(game.resources.trimps.realMax() <= game.resources.trimps.owned + 1) ||
					((game.global.challengeActive == 'Lead' && !challSQ) && game.global.lastClearedCell > 93) ||
					(doVoids && game.global.lastClearedCell > 70)
				)
			) {
				if (scryerStuck) {
					debug("Got perma-stuck on cell " + (game.global.lastClearedCell + 2) + " during scryer stance. Are your scryer settings correct? Entering map to farm to fix it.");
				}
				mapsClicked();
			}
		}
	} else if (game.global.preMapsActive) {
		if (selectedMap == "world") {
			mapsClicked();
		} else if (selectedMap == "create") {
			var $mapLevelInput = document.getElementById("mapLevelInput");
			$mapLevelInput.value = needPrestige ? game.global.world : siphlvl;
			if (preSpireFarming && MODULES["maps"].SpireFarm199Maps)
				$mapLevelInput.value = game.talents.mapLoot.purchased ? game.global.world - 1 : game.global.world;
			var decrement;
			var tier;
			if (game.global.world >= customVars.MapTierZone[0]) {
				tier = customVars.MapTier0Sliders;
				decrement = [];
			} else if (game.global.world >= customVars.MapTierZone[1]) {
				tier = customVars.MapTier1Sliders;
				decrement = ['loot'];
			} else if (game.global.world >= customVars.MapTierZone[2]) {
				tier = customVars.MapTier2Sliders;
				decrement = ['loot'];
			} else {
				tier = customVars.MapTier3Sliders;
				decrement = ['diff', 'loot'];
			}
			sizeAdvMapsRange.value = tier[0];
			adjustMap('size', tier[0]);
			difficultyAdvMapsRange.value = tier[1];
			adjustMap('difficulty', tier[1]);
			lootAdvMapsRange.value = tier[2];
			adjustMap('loot', tier[2]);
			biomeAdvMapsSelect.value = autoTrimpSettings.mapselection.selected == "Gardens" ? "Plentiful" : autoTrimpSettings.mapselection.selected;
			updateMapCost();
			if (shouldFarm || game.global.challengeActive == 'Metal') {
				biomeAdvMapsSelect.value = game.global.decayDone ? "Plentiful" : "Mountain";
				updateMapCost();
			}
			if (updateMapCost(true) > game.resources.fragments.owned) {
				if (needPrestige && !enoughDamage) decrement.push('diff');
				if (shouldFarm) decrement.push('size');
			}
			while (decrement.indexOf('loot') > -1 && lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				lootAdvMapsRange.value -= 1;
			}
			while (decrement.indexOf('diff') > -1 && difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				difficultyAdvMapsRange.value -= 1;
			}
			while (decrement.indexOf('size') > -1 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				sizeAdvMapsRange.value -= 1;
			}
			while (lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				lootAdvMapsRange.value -= 1;
			}
			while (difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				difficultyAdvMapsRange.value -= 1;
			}
			while (sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				sizeAdvMapsRange.value -= 1;
			}
			if (getPageSetting('AdvMapSpecialModifier'))
				testMapSpecialModController();
			var maplvlpicked = parseInt($mapLevelInput.value) + (getPageSetting('AdvMapSpecialModifier') ? getExtraMapLevels() : 0);
			if (updateMapCost(true) > game.resources.fragments.owned) {
				selectMap(game.global.mapsOwnedArray[highestMap].id);
				debug("Can't afford the map we designed, #" + maplvlpicked, "maps", '*crying2');
				debug("...selected our highest map instead # " + game.global.mapsOwnedArray[highestMap].id + " Level: " + game.global.mapsOwnedArray[highestMap].level, "maps", '*happy2');
				runMap();
				lastMapWeWereIn = getCurrentMapObject();
			} else {
				debug("Buying a Map, level: #" + maplvlpicked, "maps", 'th-large');
				var result = buyMap();
				if (result == -2) {
					debug("Too many maps, recycling now: ", "maps", 'th-large');
					recycleBelow(true);
					debug("Retrying, Buying a Map, level: #" + maplvlpicked, "maps", 'th-large');
					result = buyMap();
					if (result == -2) {
						recycleMap(lowestMap);
						result = buyMap();
						if (result == -2)
							debug("AutoMaps unable to recycle to buy map!");
						else
							debug("Retrying map buy after recycling lowest level map");
					}
				}
			}
		} else {
			selectMap(selectedMap);
			var themapobj = game.global.mapsOwnedArray[getMapIndex(selectedMap)];
			var levelText = " Level: " + themapobj.level;
			var voidorLevelText = themapobj.location == "Void" ? " Void: " : levelText;
			debug("Running selected " + selectedMap + voidorLevelText + " Name: " + themapobj.name, "maps", 'th-large');
			runMap();
			lastMapWeWereIn = getCurrentMapObject();
		}
	}
}

//Radon
//Resetting variables
MODULES.maps.RMapTierZone = [72, 47, 16];
MODULES.maps.RMapTier0Sliders = [9, 9, 9, "Mountain"];
MODULES.maps.RMapTier1Sliders = [9, 9, 9, "Depths"];
MODULES.maps.RMapTier2Sliders = [9, 9, 9, "Random"];
MODULES.maps.RMapTier3Sliders = [9, 9, 9, "Random"];
MODULES.maps.RshouldFarmCell = 59;
MODULES.maps.RSkipNumUnboughtPrestiges = 2;
MODULES.maps.RUnearnedPrestigesRequired = 2;

//General
var RshouldDoMaps = !1;
var RlastMapWeWereIn = null;
var RdoMaxMapBonus = !1;
var RvanillaMapatZone = !1;
//Void Maps
var RdoVoids = !1;
var RneedToVoid = !1;
var Rdovoids = false;
//Time Farm
var Rshouldtimefarm = !1;
var Rtimefarm = !1;
var timefarmmap = undefined;
var Rzonecleared = 0;
//Tribute Farm
var Rshouldtributefarm = !1;
var Rtributefarm = !1;
var Tributefarmmap = undefined;
//Worshipper
var Rshipfarm = !1;
var Rshouldshipfarm = !1;
var Rshipfragfarming = false;
var shipfragmappy = undefined;
var shipprefragmappy = undefined;
var shipfragmappybought = false;
//Quagmire
var Rshoulddobogs = false;
//Quest
var Rshoulddoquest = false;
var Rquestequalityscale = false;
var Rquestshieldzone = 0;
//Mayhem
var Rshouldmayhem = 0;
//Storm
var Rstormfarm = !1;
var Rshouldstormfarm = !1;
//Insanity
var Rinsanityfarm = !1;
var Rshouldinsanityfarm = !1;
var Rinsanityfragfarming  = false;
var insanityfragmappy = undefined;
var insanityprefragmappy = undefined;
var insanityfragmappybought = false;
//Equip Farm
var Requipfarm = !1;
var Rshouldequipfarm = !1;
var Requipminusglobal = -1;
//Pandemonium
var Rshouldpandemonium = false;
var Rshouldpandemoniumfarm = false;
//Alchemy
var Rshouldalchfarm = !1;
var RAlchFarm = !1;
//Prestige
var Rshoulddopraid = false;
var RAMPfragmappy = undefined;
var RAMPprefragmappy = undefined;
var RAMPpMap = new Array(5);
var RAMPrepMap = new Array(5);
var RAMPmapbought = [[false],[false],[false],[false],[false]];
RAMPmapbought.fill(false); //Unsure if necessary - Need to test
var RAMPfragmappybought = false;
var RAMPfragfarming = false;

function RupdateAutoMapsStatus(get) {

	var status;

	//Fail Safes
	if (getPageSetting('RAutoMaps') == 0) status = 'Off';
	//Setting up status
	else if (!game.global.mapsUnlocked) status = '&nbsp;';
	//Time, Tribute, Equip, Ship Farming, Prestige Raiding, Map bonus, void maps
	else if (Rshouldtimefarm) status = 'Time Farming: ' + game.global.mapRunCounter + "/" + timezones + " maps run";
	else if (Rshouldtributefarm && tributezones > game.buildings.Tribute.owned) status = 'Tribute Farming: ' + game.buildings.Tribute.owned + "/" + tributezones;
	else if (Rshouldtributefarm && metzones > game.jobs.Meteorologist.owned) status = 'Meteorologist Farming: ' + game.jobs.Meteorologist.owned + "/" + metzones;
	else if (Rshouldshipfarm) status = 'Ship Farming: ' + game.jobs.Worshipper.owned + "/" + shipamountzones;
	else if (Rshouldequipfarm) status = 'Equip Farming to ' + equipfarmdynamicHD().toFixed(2) + " and " + estimateEquipsForZone()[2] + " Equality";
	else if (Rshoulddopraid) status = 'Prestige Raiding: ' + Rgetequips(raidzones, false) + ' items remaining';
	else if (RdoMaxMapBonus) status = 'Map Bonus: ' + game.global.mapBonus + "/" + maxMapBonusLimit;
	else if (RdoVoids) status = 'Void Maps: ' + game.global.totalVoidMaps + ' remaining';
	//Challenges
	else if (Rshoulddobogs) status = 'Black Bogs: ' + (stacksum - game.global.mapRunCounter) + " remaining";
	else if (Rshoulddoquest) status = 'Questing: ' + game.challenges.Quest.getQuestProgress();
	else if (Rshouldmayhem == 1 || Rshouldmayhem == 2) status = 'Mayhem Destacking: ' + game.challenges.Mayhem.stacks + " remaining";
	else if (Rshouldstormfarm) status = 'Storm Farming to ' + stormdynamicHD().toFixed(2);
	else if (Rshouldinsanityfarm) status = 'Insanity Farming: '+ game.challenges.Insanity.insanity + "/" + insanitystackszones;
	else if (Rshouldpandemonium) status = 'Pandemonium Destacking: ' + game.challenges.Pandemonium.pandemonium + " stacks remaining";
	else if (Rshouldpandemoniumfarm) status = 'Pandemonium Farming';
	else if (Rshouldalchfarm) status = 'Alchemy Farming ' + alchObj.potionNames[potion] + " (" + alchObj.potionsOwned[potion] + "/" + alchstackszones.toString().replace(/[^\d:-]/g, '') + ")";
	//Farming or Wants stats
	else if (RshouldFarm && !RdoVoids) status = 'Farming: ' + RcalcHDratio().toFixed(4) + 'x';
	else if (!RenoughHealth && !RenoughDamage) status = 'Want Health & Damage';
	else if (!RenoughDamage) status = 'Want ' + RcalcHDratio().toFixed(4) + 'x &nbspmore damage';
	else if (!RenoughHealth) status = 'Want more health';
	//Advancing
	else if (RenoughHealth && RenoughDamage) status = 'Advancing';

	var getPercent = (game.stats.heliumHour.value() / (game.global.totalRadonEarned - (game.global.radonLeftover + game.resources.radon.owned))) * 100;
	var lifetime = (game.resources.radon.owned / (game.global.totalRadonEarned - game.resources.radon.owned)) * 100;
	var hiderStatus = 'Rn/hr: ' + getPercent.toFixed(3) + '%<br>&nbsp;&nbsp;&nbsp;Rn: ' + lifetime.toFixed(3) + '%';

	if (get) {
		return [status, getPercent, lifetime];
	} else {
		document.getElementById('autoMapStatus').innerHTML = status;
		document.getElementById('hiderStatus').innerHTML = hiderStatus;
	}
}

function RautoMap() {

	//Quest
	var Rquestfarming = false;
	Rshoulddoquest = false;
	Rquestfarming = (game.global.world > 5 && game.global.challengeActive == "Quest" && questcheck() > 0 && game.challenges.Quest.getQuestProgress != 'Quest Complete!');

	if (Rquestfarming) {
		//Setting fallback to 0 might cause a repeat issue later on, need to test and debug
		Rshoulddoquest = 	questcheck() == 1 ? 1 : 
							questcheck() == 2 ? 2 : 
							questcheck() == 3 ? 3 : 
							questcheck() == 4 ? 4 : 
							questcheck() == 5 ? 5 : 
							questcheck() == 6 ? 6 : 
							questcheck() == 7 && (RcalcHDratio() > 0.95 && (((new Date().getTime() - game.global.zoneStarted) / 1000 / 60) < 121) || !(RcalcOurDmg("min",true,false) > RcalcEnemyBaseHealth("world",game.global.world,99,'Turtlimp') * game.challenges.Quest.getHealthMult())) ? 7 : 
							questcheck() == 9 ? 9 : 
							questcheck() == 10 && !canAffordBuilding('Smithy') ? 10 : 
							0
	}

	//Failsafes
	if (!game.global.mapsUnlocked || RcalcOurDmg("avg", false, false) <= 0 || Rshoulddoquest == 9) {
		RenoughDamage = true;
		RenoughHealth = true;
		RshouldFarm = false;
		RupdateAutoMapsStatus();
		return;
	}

	//Vars
	var mapenoughdamagecutoff = getPageSetting("Rmapcuntoff");
	var customVars = MODULES["maps"];
	if (game.global.repeatMap == true && !game.global.mapsActive && !game.global.preMapsActive) repeatClicked();
	if ((game.options.menu.repeatUntil.enabled == 1 || game.options.menu.repeatUntil.enabled == 2 || game.options.menu.repeatUntil.enabled == 3) && !game.global.mapsActive && !game.global.preMapsActive) toggleSetting('repeatUntil');
	if (game.options.menu.exitTo.enabled != 0) toggleSetting('exitTo');
	if (game.options.menu.repeatVoids.enabled != 0) toggleSetting('repeatVoids');
	var hitsSurvived = getPageSetting("Rhitssurvived") > 0 ? getPageSetting("Rhitssurvived") : 10;

	//Void Vars -- Checks whether you're ina  daily and uses those settings if you are
	voidMapLevelSettingCell = 	game.global.challengeActive == 'Daily' && getPageSetting('Rdvoidscell') > 0 ? getPageSetting('Rdvoidscell') : 
								getPageSetting('Rvoidscell') > 0 ? getPageSetting('Rvoidscell') :
								70;
	voidMapLevelSetting = 		game.global.challengeActive == 'Daily' && getPageSetting('RDailyVoidMod') >= 1 ? getPageSetting('RDailyVoidMod') : 
								getPageSetting('RVoidMaps') >= 1 ? getPageSetting('RVoidMaps') : 
								0;
	voidMapLevelPlus = 			game.global.challengeActive == 'Daily' && getPageSetting('RdRunNewVoidsUntilNew') != 0 ? getPageSetting('RdRunNewVoidsUntilNew') : 
								getPageSetting('RRunNewVoidsUntilNew') != 0 ? getPageSetting('RRunNewVoidsUntilNew') : 
								0;

	RneedToVoid = (voidMapLevelSetting > 0 && game.global.totalVoidMaps > 0 && game.global.lastClearedCell + 1 >= voidMapLevelSettingCell &&
		((game.global.world == voidMapLevelSetting) ||
		(voidMapLevelPlus < 0 && game.global.world >= voidMapLevelSetting) ||
		(voidMapLevelPlus > 0 && game.global.world >= voidMapLevelSetting && game.global.world <= (voidMapLevelSetting + voidMapLevelPlus)))
	);

	if (game.global.totalVoidMaps <= 0 || !RneedToVoid) RdoVoids = false;

	//Calc
	var ourBaseDamage = RcalcOurDmg("avg", false, false);
	var enemyDamage = RcalcBadGuyDmg(null, RgetEnemyMaxAttack(game.global.world, 50, 'Snimp', 1.0));
	var enemyHealth = RcalcEnemyHealth(game.global.world);

	if (getPageSetting('RDisableFarm') > 0) {
		RshouldFarm = (RcalcHDratio() >= getPageSetting('RDisableFarm'));
		if (game.options.menu.repeatUntil.enabled == 1 && RshouldFarm)
			toggleSetting('repeatUntil');
	}
	RenoughHealth = (RcalcOurHealth() > (hitsSurvived * enemyDamage));
	RenoughDamage = (RcalcHDratio() <= mapenoughdamagecutoff);
	RupdateAutoMapsStatus();

	//Quest Shield
	if (game.global.world < 6 && (Rquestshieldzone != 0 || Rquestequalityscale != false)) {
		Rquestshieldzone = 0;
		Rquestequalityscale = false;
	}
	if (Rquestfarming && questcheck() == 8 && ((game.global.soldierEnergyShieldMax / enemyDamage) < RcalcHDratio()) && game.portal.Equality.scalingActive && !game.global.mapsActive) {
		toggleEqualityScale();
		Rquestshieldzone = game.global.world;
		Rquestequalityscale = true;
	}
	if (game.global.world > 5 && game.global.challengeActive == "Quest" && Rquestshieldzone > 0 && !game.portal.Equality.scalingActive && game.global.world > Rquestshieldzone && Rquestequalityscale) {
		toggleEqualityScale();
		Rquestequalityscale = false;
	}

	//Farming & resetting variables. Is this necessary?
	var selectedMap = "world";
	RshouldDoMaps = false;
	Rshouldtimefarm = false;
	Rshouldtributefarm = false;
	Rshouldinsanityfarm = false;
	Rshouldstormfarm = false;
	Rshouldequipfarm = false;
	Rshouldshipfarm = false;
	Rshouldalchfarm = false;
	Rshouldpandemoniumfarm = false;
	if (ourBaseDamage > 0) {
		RshouldDoMaps = (!RenoughDamage || RshouldFarm);
	}
	var shouldDoHealthMaps = false;
	//Map Bonus zone and amount -- Checks if in a daily or c3 and uses those settings if you are
	var maxMapBonusZ = 	game.global.runningChallengeSquared ? getPageSetting('c3mapbonuszone') : 
						game.global.challengeActive == 'Daily' ? getPageSetting('RdMaxMapBonusAfterZone') : 
						getPageSetting('RMaxMapBonusAfterZone');
	maxMapBonusLimit = 	game.global.runningChallengeSquared ? getPageSetting('c3mapbonuslimit') : 
						game.global.challengeActive == 'Daily' ? getPageSetting('RdMaxMapBonuslimit') : 
						getPageSetting("RMaxMapBonuslimit");

	if (game.global.mapBonus >= maxMapBonusLimit && !RshouldFarm)
		RshouldDoMaps = false;
	else if (game.global.mapBonus < getPageSetting('RMaxMapBonushealth') && !RenoughHealth && !RshouldDoMaps) {
		RshouldDoMaps = true;
		shouldDoHealthMaps = true;
	}
	var restartVoidMap = false;
	RdoMaxMapBonus = (maxMapBonusZ >= 0 && game.global.mapBonus < maxMapBonusLimit && game.global.world >= maxMapBonusZ);
	if (RdoMaxMapBonus) RshouldDoMaps = true;
	else RdoMaxMapBonus = false;

    //Map at Zone (MAZ) -- Kicks you out after one map? Might need to check if fixable. Looks like the repeat toggle isn't functioning properly
    RvanillaMapatZone = false;
    if (game.options.menu.mapAtZone.enabled && game.global.canMapAtZone) {
        for (var x = 0; x < game.options.menu.mapAtZone.setZone.length; x++) {
            var option = game.options.menu.mapAtZone.setZone[x];
            if (option.world == game.global.world && option.cell == game.global.lastClearedCell+2) RvanillaMapatZone = true;
        }
        if (RvanillaMapatZone) {
            updateAutoMapsStatus();
            return;
        }
    }

	//Time Farm
	if (getPageSetting('Rtimefarm') && game.global.challengeActive != "Mayhem" && game.global.challengeActive != "Pandemonium" && (game.global.challengeActive != "Daily" && !game.global.runningChallengeSquared) || (getPageSetting('Rdtimefarmzone') && game.global.challengeActive == "Daily") || (game.global.runningChallengeSquared || game.global.challengeActive == 'Mayhem' || game.global.challengeActive == 'Pandemonium') && getPageSetting('Rc3timefarm')) {
		//Setting up variables and checking if we should use daily settings instead of regular Time Farm settings
		var runningc3 = game.global.runningChallengeSquared || game.global.challengeActive == 'Mayhem' || game.global.challengeActive == 'Pandemonium';
		var timefarmcell = 	runningc3 && getPageSetting('Rc3timefarmcell') > 0 ? getPageSetting('Rc3timefarmcell') : 
							game.global.challengeActive == "Daily" && getPageSetting('Rdtimefarmcell') > 0 ? getPageSetting('Rdtimefarmcell') : 
							game.global.challengeActive != "Daily" && getPageSetting('Rtimefarmcell') > 0 ? getPageSetting('Rtimefarmcell') : 
							71;
		var timefarmzone = runningc3 ? getPageSetting('Rc3timefarmzone') : game.global.challengeActive == "Daily" ? getPageSetting('Rdtimefarmzone') : getPageSetting('Rtimefarmzone');
		var timefarmtime = runningc3 ? getPageSetting('Rc3timefarmtime') : game.global.challengeActive == "Daily" ? getPageSetting('Rdtimefarmtime') : getPageSetting('Rtimefarmtime');
		var timefarmspecial = runningc3 ? autoTrimpSettings.Rc3timespecialselection.selected : game.global.challengeActive == "Daily" ? autoTrimpSettings.Rdtimespecialselection.selected : autoTrimpSettings.Rtimespecialselection.selected;
		var timefarmmaplevel = runningc3 ? getPageSetting('Rc3timemaplevel') : game.global.challengeActive == "Daily" ? getPageSetting('Rdtimemaplevel') : getPageSetting('Rtimemaplevel');
		Rtimefarm = (((timefarmcell <= 1) || (timefarmcell > 1 && (game.global.lastClearedCell + 1) >= timefarmcell)) && (timefarmzone[0] > 0 && timefarmtime[0] > 0));
		if (Rtimefarm && (game.stats.zonesCleared.value != Rzonecleared)) {
			//Figuring out how many maps to run at your current zone
			var timefarmindex = timefarmzone.indexOf(game.global.world);
			timezones = timefarmtime[timefarmindex];
			timefarmpluslevel = timefarmmaplevel[timefarmindex];
			if (game.global.mapRunCounter == timezones && timefarmmap != undefined) {
				Rzonecleared = game.stats.zonesCleared.value;
				timefarmmap == undefined;
			}
			if (timefarmzone.includes(game.global.world) && (timezones > game.global.mapRunCounter)) Rshouldtimefarm = true;
		}
	}
	
	//Tribute Farm
	if (getPageSetting('Rtributefarm') && game.global.challengeActive != "Mayhem" && game.global.challengeActive != "Pandemonium" && (game.global.challengeActive != "Daily" && !game.global.runningChallengeSquared) || (getPageSetting('Rdtributefarm') && game.global.challengeActive == "Daily") || (game.global.runningChallengeSquared || game.global.challengeActive == 'Mayhem' || game.global.challengeActive == 'Pandemonium') && getPageSetting('Rc3tributefarm')) {
		//Setting up variables and checking if we should use daily settings instead of regular Tribute Farm settings
		var runningc3 = game.global.runningChallengeSquared || game.global.challengeActive == 'Mayhem' || game.global.challengeActive == 'Pandemonium';
		var tributefarmcell = 	runningc3 && getPageSetting('Rc3tributefarmcell') > 0 ? getPageSetting('Rc3tributefarmcell') : 
								game.global.challengeActive == "Daily" && getPageSetting('Rdtributefarmcell') > 0 ? getPageSetting('Rdtributefarmcell') : 
								game.global.challengeActive != "Daily" && getPageSetting('Rtributefarmcell') > 0 ? getPageSetting('Rtributefarmcell') : 
								81;
		var tributefarmzone = runningc3 ? getPageSetting('Rc3tributefarmzone') : game.global.challengeActive == "Daily" ? getPageSetting('Rdtributefarmzone') : getPageSetting('Rtributefarmzone');
		var tributefarmvalue = runningc3 ? 0 : game.global.challengeActive == "Daily" ? getPageSetting('Rdtributefarmvalue') : getPageSetting('Rtributefarmvalue');
		var metsfarmvalue = runningc3 ? getPageSetting('Rc3tributefarmmets') : game.global.challengeActive == "Daily" ? getPageSetting('Rdtributefarmmets') : getPageSetting('Rtributefarmmets');
		var tributefarmmaplevel =  runningc3 ? getPageSetting('Rdtributemaplevel') : game.global.challengeActive == "Daily" ? getPageSetting('Rdtributemaplevel') : getPageSetting('Rtributemaplevel');
		
		Rtributefarm = (((tributefarmcell <= 1) || (tributefarmcell > 1 && (game.global.lastClearedCell + 1) >= tributefarmcell)) && (tributefarmzone[0] > 0 && (tributefarmvalue[0] > 0 || metsfarmvalue [0] > 0)));
		if (Rtributefarm) {
			//Figuring out how many Tributes or Meteorologists to farm at your current zone
			var tributefarmindex = tributefarmzone.indexOf(game.global.world);
			tributezones = tributefarmvalue[tributefarmindex];
			metzones = metsfarmvalue[tributefarmindex];
			var tributefarmpluslevel = tributefarmmaplevel[tributefarmindex];
			var tributefarmspecial = game.global.highestRadonLevelCleared > 83 ? "lsc" : "ssc";

			if (tributefarmzone.includes(game.global.world) && (tributezones > game.buildings.Tribute.owned || metzones > game.jobs.Meteorologist.owned)) {
				Rshouldtributefarm = true;
				Tributefarmmap = getCurrentMapObject();
			}
			//Recycles map if we don't need to finish it for meeting the tribute/meteorologist requirements
			if (!Rshouldtributefarm && Tributefarmmap != undefined) {
				mapsClicked();
				recycleMap(getMapIndex(Tributefarmmap));
				Tributefarmmap = undefined;
			}
		}
	}

	//Prestige Raiding
	if (getPageSetting('RAMPraid') && (game.global.challengeActive != "Daily" && !game.global.runningChallengeSquared) || (getPageSetting('RAMPdraid') && game.global.challengeActive == "Daily")) {
		var Rdopraid = false;
		Rshoulddopraid = false;
		//Setting up variables and checking if we should use daily settings instead of normal Prestige Farm settings
		var cell = 	game.global.challengeActive == "Daily" && getPageSetting('RAMPdraidcell') > 0 ? getPageSetting('RAMPdraidcell') : 
					game.global.challengeActive != "Daily" && getPageSetting('RAMPraidcell') > 0 ? getPageSetting('RAMPraidcell') : 
					50;
		var praid = game.global.challengeActive == "Daily" ? getPageSetting('RAMPdraid') : getPageSetting('RAMPraid');
		var praidzone = game.global.challengeActive == "Daily" ? getPageSetting('RAMPdraidzone') : getPageSetting('RAMPraidzone');
		var raidzone = game.global.challengeActive == "Daily" ? getPageSetting('RAMPdraidraid') : getPageSetting('RAMPraidraid');
		var praidrecycle = game.global.challengeActive == "Daily" ? getPageSetting('RAMPdraidrecycle') : getPageSetting('RAMPraidrecycle');
		var praidfrag = game.global.challengeActive == "Daily" ? getPageSetting('RAMPdraidfrag') : getPageSetting('RAMPraidfrag');
		
		Rdopraid = (game.global.world > 5 && (praid == true && praidzone[0] > 0 && praidzone[0] > 0));
		if (Rdopraid) {
			var praidindex = praidzone.indexOf(game.global.world);
			raidzones = raidzone[praidindex];
			if (praidzone.includes(game.global.world) && ((cell <= 1) || (cell > 1 && (game.global.lastClearedCell + 1) >= cell)) && Rgetequips(raidzones, false) > 0) {
				Rshoulddopraid = true;
			}
		}
		//Resetting variables and recycling the maps used
		if (!Rshoulddopraid && (RAMPrepMap[0] != undefined || RAMPrepMap[1] != undefined || RAMPrepMap[2] != undefined || RAMPrepMap[3] != undefined || RAMPrepMap[4] != undefined)) {
			RAMPfragmappy = undefined;
			RAMPprefragmappy = undefined;
			RAMPfragmappybought = false;
			for (var x = 0; x < 5; x++) {
				RAMPpMap[x] = undefined;
				RAMPmapbought[x] = false;
				RAMPpMap[x] = undefined;
				RAMPmapbought[x] = undefined;
				
				if (RAMPrepMap[x] != undefined) {
					if (praidrecycle == true) {
						recycleMap(getMapIndex(RAMPrepMap[x]));
					}
					RAMPrepMap[x] = undefined;
				}
			}
		}
	}

	//Worshipper Farm -- Think there's an issue with variable setup here
	if (game.jobs.Worshipper.locked == 0 && getPageSetting('Rshipfarmon')) {
		var shipfarmcell = ((getPageSetting('Rshipfarmcell') > 0) ? getPageSetting('Rshipfarmcell') : 1);
		Rshipfarm = (((shipfarmcell <= 1) || (shipfarmcell > 1 && (game.global.lastClearedCell + 1) >= shipfarmcell)) && (getPageSetting('Rshipfarmzone')[0] > 0 && getPageSetting('Rshipfarmamount')[0] > 0));
		if (Rshipfarm) {
			var ships = game.jobs.Worshipper.owned
			var shipfarmzone = getPageSetting('Rshipfarmzone');
			var shipmaplevel = getPageSetting('Rshipfarmlevel');
			var shipfarmamount = getPageSetting('Rshipfarmamount');
			var shipamountfarmindex = shipfarmzone.indexOf(game.global.world);
			shipamountzones = getPageSetting('Rshipfarmamount')[1] == 'undefined' && getPageSetting('Rshipfarmamount')[0] > 0 ? getPageSetting('Rshipfarmamount') : shipfarmamount[shipamountfarmindex];
			var shippluslevel = shipmaplevel[shipamountfarmindex];
			var shipspecial = game.global.highestRadonLevelCleared > 83 ? "lsc" : "ssc";
			
			if (shipfarmzone.includes(game.global.world) && shipamountzones > ships) {
				Rshouldshipfarm = true;
			}
		}

		if (!Rshouldshipfarm) {
			shipfragmappy = undefined;
			shipprefragmappy = undefined;
			shipfragmappybought = false;
		}
	}

	//Quagmire - Black Bogs
	if (game.global.challengeActive == "Quagmire" && getPageSetting('Rblackbog')) {
		var Rdobogs = false;
		Rshoulddobogs = false;
		Rdobogs = (getPageSetting('Rblackbogzone')[0] > 0 && getPageSetting('Rblackbogamount')[0] > 0);
		if (Rdobogs) {
			var bogzone = getPageSetting('Rblackbogzone');
			var bogamount = getPageSetting('Rblackbogamount');
			var bogindex = bogzone.indexOf(game.global.world);
			stacksum = 0;

			for (var i = 0; i < (bogindex + 1); i++) {
				stacksum += parseInt(bogamount[i]);
			}

			var totalstacks = 100 - stacksum;

			if (bogzone.includes(game.global.world) && game.challenges.Quagmire.motivatedStacks > totalstacks) Rshoulddobogs = true;
		}
	}
	
	//Mayhem -- Check this code works properly. Probably need to implement Gamma Burst variables and change RcalcEnemyHealth to RcalcEnemyHealth_New
	if (game.global.challengeActive == "Mayhem" && getPageSetting('Rmayhemon')) {
		Rshouldmayhem = 0;
		Rdomayhem = (getPageSetting('Rmayhemhealth') || getPageSetting('Rmayhemattack'));
		if (Rdomayhem) {
			var hits = (getPageSetting('Rmayhemacut') > 0) ? getPageSetting('Rmayhemabcut') : 100;
			var hitssurv = (getPageSetting('Rmayhemhcut') > 0) ? getPageSetting('Rmayhemhcut') : 1;
			if (game.challenges.Mayhem.stacks > 0 && getPageSetting('Rmayhemattack')&& (RcalcHDratio() > hits)) Rshouldmayhem = 1;
			if (game.challenges.Mayhem.stacks > 0 && getPageSetting('Rmayhemhealth') && (RcalcOurHealth() < (hitssurv * enemyDamage))) Rshouldmayhem = 2;
		}

		if (Rshouldmayhem > 0 && getPageSetting('Rmayhemmap') == 2) {
			mayhemextra = 0;
			var hitsmap = getPageSetting('Rmayhemamcut') > 0 ? getPageSetting('Rmayhemamcut') : 10;
			var hitssurv = getPageSetting('Rmayhemhcut') > 0 ? getPageSetting('Rmayhemhcut') : 1;
			var go = false;
			
			for (var i = 10; 0 < i; i--) {
				if (!go) {
					mlevels = i;
					if 	((((RcalcEnemyHealth(game.global.world + mlevels) / game.challenges.Mayhem.getBossMult())) <= (RcalcOurDmg("avg", false, false) * (hitsmap * (mlevels + 1)))) &&
						((((RcalcBadGuyDmg(null, RgetEnemyMaxAttack((game.global.world + mlevels), 20, 'Snimp', 1))) / game.challenges.Mayhem.getBossMult() * 1.125) * (hitssurv)) <= (RcalcOurHealth() * 2)))
					{
						mayhemextra = mlevels;
						go = true;
					}
				}
				
				if (!go && i == 0) {
					mayhemextra = 0;
					go = true;
				}
			}
		}
	}

	//Storm
	if (game.global.challengeActive == "Storm" && getPageSetting('Rstormon')) {
		Rstormfarm = (getPageSetting('Rstormzone') > 0 && getPageSetting('RstormHD') > 0 && getPageSetting('Rstormmult') > 0);
		if (Rstormfarm) {
			var stormzone = getPageSetting('Rstormzone');
			var stormHD = getPageSetting('RstormHD');
			var stormmult = getPageSetting('Rstormmult');
			var stormHDzone = (game.global.world - stormzone);
			var stormHDmult = (stormHDzone == 0) ? stormHD : Math.pow(stormmult, stormHDzone) * stormHD;
			
			if (game.global.world >= stormzone && RcalcHDratio() > stormHDmult) Rshouldstormfarm = true;
		}
	}
	
	//Insanity Farm
	if (game.global.challengeActive == "Insanity" && getPageSetting('Rinsanityon')) {
		var insanityfarmcell = getPageSetting('Rinsanityfarmcell') > 0 ? getPageSetting('Rinsanityfarmcell') : 1;
		Rinsanityfarm = (game.global.lastClearedCell+1 >= insanityfarmcell && getPageSetting('Rinsanityfarmzone')[0] > 0 && getPageSetting('Rinsanityfarmstack')[0] > 0);
		if (Rinsanityfarm) {
			var insanitymaplevel = getPageSetting('Rinsanityfarmlevel');
			var insanityfarmzone = getPageSetting('Rinsanityfarmzone');
			var insanityfarmstacks = getPageSetting('Rinsanityfarmstack');
			var insanitystacksfarmindex = insanityfarmzone.indexOf(game.global.world);
			insanitystackszones = insanityfarmstacks[insanitystacksfarmindex];
			var insanitypluslevel = insanitymaplevel[insanitystacksfarmindex];
			if (insanitystackszones > game.challenges.Insanity.maxInsanity) insanitystackszones = game.challenges.Insanity.maxInsanity;
			if (insanityfarmzone.includes(game.global.world) && insanitystackszones != game.challenges.Insanity.insanity) Rshouldinsanityfarm = true;
		}
		//Resetting variables after farming
		if (!Rshouldinsanityfarm) {
			insanityfragmappy = undefined;
			insanityprefragmappy = undefined;
			insanityfragmappybought = false;
		}
	}
	
	//Pandemonium
	if (game.global.challengeActive == "Pandemonium" && getPageSetting('RPandemoniumOn')) {
		Rshouldpandemonium = false;
		Rshouldpandemoniumfarm = 0;
		Rdopandemonium = (game.global.world >= getPageSetting('RPandemoniumZone') && game.global.challengeActive == "Pandemonium" && getPageSetting('RPandemoniumOn'));
		if (Rdopandemonium) {
			if (game.challenges.Pandemonium.pandemonium > 0 && getPageSetting('RPandemoniumMaps')) {
				Rshouldpandemonium = true;
			}
		}
		//Pandemonium destacking settings
		if (Rshouldpandemonium && getPageSetting('RPandemoniumMaps')) {
			hyp2pct = game.talents.liquification3.purchased ? 75 : game.talents.hyperspeed2.purchased ? 50 : 0;
			pandspecial = (Math.floor(game.global.highestRadonLevelCleared + 1) * (hyp2pct / 100) >= game.global.world ? "lmc" : game.challenges.Pandemonium.pandemonium > 7 ? "fa" : "lmc");
			gammaburstmult = getPageSetting('RPandemoniumHits') < 5 && (RcalcOurHealth() / RcalcBadGuyDmg(null, RgetEnemyMaxAttack(game.global.world, 20, 'Snimp', 1))) >= 5 ? (1 + (getHeirloomBonus("Shield", "gammaBurst")) / 500) : 1;
			hitsmap = getPageSetting('RPandemoniumHits') > 0 ? getPageSetting('RPandemoniumHits') : 10;
			hitssurv = getPageSetting('RPandemoniumHits') < 5 ? getPageSetting('RPandemoniumHits') : 5;
			go = false;
			
			for (var i = 10; 0 < i; i--) {
				if (!go) {
				mlevels = i;
					if ((game.resources.fragments.owned >= PerfectMapCost(mlevels,pandspecial)) && ((RcalcEnemyBaseHealth("map",game.global.world + mlevels,20,'Turtlimp') * game.challenges.Pandemonium.getPandMult() * 0.75) <= ((RcalcOurDmg("avg", false, true) / gammaburstmult) * 1.5 * hitsmap))
					&& ((((((RcalcBadGuyDmg(null, RgetEnemyMaxAttack((game.global.world + mlevels), 20, 'Snimp', 1)) * 1.125) / game.challenges.Pandemonium.getBossMult()) * game.challenges.Pandemonium.getPandMult()) * (hitssurv)) <= (RcalcOurHealth() * 2)))) {
						if (i > game.challenges.Pandemonium.pandemonium) {
							pandemoniumextra = game.challenges.Pandemonium.pandemonium;
						} else {
						pandemoniumextra = mlevels;
						}
						go = true;
					}
				}
				if (!go && i == 1) {
					mlevels = 1;
					pandemoniumextra = mlevels;
					go = true;
				}
			}
		}
		
		//AutoEquip settings for Pandemonium.
		if (!Rshouldpandemonium && getPageSetting('RPandemoniumAutoEquip') > 0 && game.global.lastClearedCell > 60 && game.global.StaffEquipped.name == getPageSetting('RPandemoniumAEStaff') && getPageSetting('RPandemoniumAEZone') > 5 && game.global.world >= getPageSetting('RPandemoniumAEZone')) {
			//Initialising Variables
			nextLevelCostEquipment = null;
			nextLevelCostPrestige = null;
			var prestigeUpgradeName = "";
			var allUpgradeNames = Object.getOwnPropertyNames(game.upgrades);
			//Setting up artisanitry modifier
			var artBoost = Math.pow(1 - game.portal.Artisanistry.modifier, game.portal.Artisanistry.radLevel);
			artBoost *= autoBattle.oneTimers.Artisan.owned ? autoBattle.oneTimers.Artisan.getMult() : 1;
			artBoost *= game.challenges.Pandemonium.getEnemyMult();
			
			//Looping through each piece of equipment
			for (var equipName in game.equipment) {
				if (!game.equipment[equipName].locked) {
					//Checking cost of next equipment level. Blocks unavailable ones.
					if (game.challenges.Pandemonium.isEquipBlocked(equipName) || RequipmentList[equipName].Resource == 'wood') continue;
					var nextLevelCostEquipment = game.equipment[equipName].cost[RequipmentList[equipName].Resource][0] * Math.pow(game.equipment[equipName].cost[RequipmentList[equipName].Resource][1], game.equipment[equipName].level) * artBoost;
					//Checking cost of prestiges if any are available to purchase
					for (var upgrade of allUpgradeNames) {
						if (game.upgrades[upgrade].prestiges === equipName) {
							prestigeUpgradeName = upgrade;
							//Checking if prestiges are purchasable
							if (game.challenges.Pandemonium.isEquipBlocked(game.upgrades[upgrade].prestiges) || game.upgrades[prestigeUpgradeName].locked) continue;
							nextLevelCostPrestige = getNextPrestigeCost(prestigeUpgradeName) * artBoost;
							break;
						}
					}
				}
			}

			//Working out how much metal a large metal cache or jestimp proc provides.
			var amt_cache = getPageSetting('RPandemoniumAutoEquip') > 3 && game.global.world >= getPageSetting('RPandemoniumAEJestimpZone') ? simpleSecondsLocal("metal", 45) : 
							getPageSetting('RPandemoniumAutoEquip') > 2 && game.global.world >= getPageSetting('RPandemoniumAEZone') ? simpleSecondsLocal("metal", 40) : 
							simpleSecondsLocal("metal", 20);
			var amt_jestimp = simpleSecondsLocal("metal", 45);
			//Switching to Huge Cache maps if LMC maps don't give enough metal for equip levels. Should only proc during Jestimp farming.
			var pandfarmspecial = nextLevelCostEquipment > scaleToCurrentMapLocal(simpleSecondsLocal("metal", 20)) ? "hc" : "lmc";
			//Checking if an equipment level costs less than a cache or a prestige level costs less than a jestimp and if so starts farming.
			if (nextLevelCostEquipment < scaleToCurrentMapLocal(amt_cache) || (nextLevelCostPrestige != null && nextLevelCostPrestige < scaleToCurrentMapLocal(amt_jestimp))) Rshouldpandemoniumfarm = true;
		}
	}
	
    //Alchemy Farm
	if (game.global.challengeActive == "Alchemy" && getPageSetting('RAlchOn')) {
		alchfarmcell = ((getPageSetting('RAlchCell') > 0) ? getPageSetting('RAlchCell') : 81);
		Ralchfarm = (((game.global.lastClearedCell + 1) >= alchfarmcell) && getPageSetting('RAlchZone')[0] > 0 && getPageSetting('Ralchfarmstack').length > 0);
		if (Ralchfarm) {
			alchfarmzone = getPageSetting('RAlchZone');
			alchmaplevel = getPageSetting('RAlchMapLevel');
			alchfarmstacks = getPageSetting('Ralchfarmstack').split(',');
			alchfarmindex = alchfarmzone.indexOf(game.global.world);
			alchstackszones = alchfarmstacks[alchfarmindex];
			alchpluslevel = alchmaplevel[alchfarmindex];
			if (alchstackszones != undefined) {
				//Working out which potion the input corresponds to.
				potion = 	alchstackszones[0] == 'h' ? 0 : 
							alchstackszones[0] == 'g' ? 1 : 
							alchstackszones[0] == 'f' ? 2 : 
							alchstackszones[0] == 'v' ? 3 : 
							alchstackszones[0] == 's' ? 4 : 
							undefined;

				//Alchemy biome selection, will select Farmlands if it's unlocked and appropriate otherwise it'll use the default map type for that herb.
				alchbiome = alchObj.potionNames[potion] == alchObj.potionNames[0] ? game.global.farmlandsUnlocked && getFarmlandsResType() == "Metal" ? "Farmlands" : "Mountain" : 
								alchObj.potionNames[potion] == alchObj.potionNames[1] ? game.global.farmlandsUnlocked && getFarmlandsResType() == "Wood" ? "Farmlands" : "Forest" : 
								alchObj.potionNames[potion] == alchObj.potionNames[2] ? game.global.farmlandsUnlocked && getFarmlandsResType() == "Food" ? "Farmlands" : "Sea" : 
								alchObj.potionNames[potion] == alchObj.potionNames[3] ? game.global.farmlandsUnlocked && getFarmlandsResType() == "Gems" ? "Farmlands" : "Depths" : 
								alchObj.potionNames[potion] == alchObj.potionNames[4] ? game.global.farmlandsUnlocked && getFarmlandsResType() == "Any" ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Random" : 
								game.global.farmlandsUnlocked && getFarmlandsResType() == "Any" ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Random";

				//Doing calcs to identify the total cost of all the Brews/Potions that are being farmed
				//Initialising vars
				var alchmult = alchbiome == "Farmlands" ? 1.5 : 1;
				var potioncost = 0;
				potioncosttotal = 0;
				var potionscurrent = alchObj.potionsOwned[potion];
				//Identifying current herbs + ones that we'll get from the map we should run
				herbtotal = game.herbs[alchObj.potions[potion].cost[0][0]].cowned + (alchObj.getDropRate(game.global.world+alchpluslevel) * alchmult);
				//Looping through each potion level and working out their cost to calc total cost
				for (x = potionscurrent; x < (alchstackszones.toString().replace(/[^\d,:-]/g, '')); x++) {
					var potioncost = Math.pow(alchObj.potions[potion].cost[0][2], x)*alchObj.potions[potion].cost[0][1];
					//Checking if the potion being farmed is a Potion and if so factors in compounding cost scaling from other potions owned
					if (!alchObj.potions[potion].enemyMult) {
						var potionsowned = 0;
						//Calculating total level of potions that aren't being farmed
						for (var y = 0; y < alchObj.potionsOwned.length; y++){
							if (alchObj.potions[y].challenge != (game.global.challengeActive == "Alchemy")) continue;
							if (y != alchObj.potionNames.indexOf(alchObj.potionNames[potion]) && !alchObj.potions[y].enemyMult) potionsowned += alchObj.potionsOwned[y];
						}
						potioncost *= Math.pow(alchObj.allPotionGrowth, potionsowned);
					}
					//Summing cost of potion levels
					potioncosttotal += potioncost;
				}

				if (potion == undefined) debug('You have an incorrect value in AF: Potions, each input needs to start with h, g, f, v, or s.');
				else {
					if (alchstackszones.toString().replace(/[^\d:-]/g, '') > potionscurrent) {
						if (alchObj.canAffordPotion(alchObj.potionNames[potion])) {
							for (z = potionscurrent; z < alchstackszones.toString().replace(/[^\d:-]/g, ''); z++) {
								alchObj.craftPotion(alchObj.potionNames[potion]);
							}
						}
					}
					if (alchfarmzone.includes(game.global.world) && alchstackszones.toString().replace(/[^\d,:-]/g, '') > alchObj.potionsOwned[potion])
						Rshouldalchfarm = true;
				}
			}
		}
		if (RdoVoids && game.global.mapsActive && getPageSetting('RAlchVoids')) {
			if (getCurrentMapObject().location == "Void" && (alchObj.canAffordPotion('Potion of the Void') || alchObj.canAffordPotion('Potion of Strength'))) {
				alchObj.craftPotion('Potion of the Void');
				alchObj.craftPotion('Potion of Strength');
			}
		}
	}

	//Equip Farming
	Requipfarm = (getPageSetting('Requipfarmon') == true && (getPageSetting('Requipfarmzone') > 0 && getPageSetting('RequipfarmHD') > 0 && getPageSetting('Requipfarmmult') > 0));
	if (Requipfarm) {
		var equipfarmzone = getPageSetting('Requipfarmzone');
		var metal = game.resources.metal.owned
		var metalneeded = estimateEquipsForZone()[0];
		if (game.global.world >= equipfarmzone && metal < metalneeded) Rshouldequipfarm = true;
	}

	var equipminus = 0;
	if (Rshouldequipfarm) {
		equipminus = 0;
		var hits = (getPageSetting('Requipfarmhits') > 0) ? getPageSetting('Requipfarmhits') : 10;
		var hitssurv = (getPageSetting('Rhitssurvived') > 0) ? getPageSetting('Rhitssurvived') : 1;
		var mlevels = 0;
		var go = false;

		for (var i = -1; -7 < i; i--) {
			if (!go) {
			mlevels = i;
				if (
					((RcalcEnemyHealth(game.global.world + mlevels)) <= (RcalcOurDmg("avg", false, false) * hits)) &&
					((((RcalcBadGuyDmg(null, RgetEnemyMaxAttack((game.global.world + mlevels), 20, 'Snimp', 1.0))) * 0.8) * (hitssurv)) <= (RcalcOurHealth() * 2))
				) {
					equipminus = mlevels;
					go = true;
				}
			}
			if (!go && i == -6) {
				mlevels = i;
				equipminus = mlevels;
				go = true;
			}
		}
	}

	//Map Selection
	var obj = {};
	for (var map in game.global.mapsOwnedArray) {
		if (!game.global.mapsOwnedArray[map].noRecycle) {
			obj[map] = game.global.mapsOwnedArray[map].level;
		}
	}
	var keysSorted = Object.keys(obj).sort(function (a, b) {
		return obj[b] - obj[a];
	});
	var highestMap;
	var lowestMap;
	if (keysSorted[0]) {
		highestMap = keysSorted[0];
		lowestMap = keysSorted[keysSorted.length - 1];
	} else
		selectedMap = "create";

	//Uniques -- Does this still run Big Wall straight away? If so needs to be fixed.
	var runUniques = (getPageSetting('RAutoMaps') == 1);
	if (runUniques || Rshoulddobogs) {
		for (var map in game.global.mapsOwnedArray) {
			var theMap = game.global.mapsOwnedArray[map];
			if (Rshoulddobogs && theMap.name == 'The Black Bog') {
				selectedMap = theMap.id;
				break;
			} else if (runUniques && theMap.noRecycle && game.global.challengeActive != "Insanity" && !Rshouldtimefarm && !Rshouldalchfarm) {
				if (theMap.name == 'Big Wall' && !game.upgrades.Bounty.allowed && !game.upgrades.Bounty.done) {
					if (game.global.world < 8 && (RcalcHDratio() > 4 || game.achievements.bigWallTimed.finished == 4)) continue;
					selectedMap = theMap.id;
					break;
				}
				if (theMap.name == 'Dimension of Rage' && document.getElementById("portalBtn").style.display == "none" && game.upgrades.Rage.done == 1) {
					if (game.global.challenge != "Unlucky" && (game.global.world < 16 || RcalcHDratio() < 2)) continue;
					selectedMap = theMap.id;
					break;
				}
				//Prismatic Palace
				if (getPageSetting('Rprispalace') && theMap.name == 'Prismatic Palace' && game.mapUnlocks.Prismalicious.canRunOnce) {
					if (game.global.world < 21 || RcalcHDratio() > 25) continue;
					selectedMap = theMap.id;
					break;
				}
				//Atlantrimp
				if (theMap.name == 'Atlantrimp' && game.mapUnlocks.AncientTreasure.canRunOnce) {
					var atlantrimp = getPageSetting('RAtlantrimp')[0] > 0 && getPageSetting('RAtlantrimp')[1] >= 0 ? getPageSetting('RAtlantrimp') : [1000,1000];
					if ((game.global.world >= atlantrimp[0] && ((game.global.lastClearedCell + 1) >= atlantrimp[1]))) {
							selectedMap = theMap.id;
							break;
					}
				}
				//Melting Point
				if (theMap.name == 'Melting Point' && game.mapUnlocks.SmithFree.canRunOnce) {
					var meltingpoint = getPageSetting('RMeltingPoint')[0] > 0 && getPageSetting('RMeltingPoint')[1] >= 0 ? getPageSetting('RMeltingPoint') : [1000,1000];
					//Checking if we should run melting point for smithies at any point
					var meltsmithy = 	game.global.runningChallengeSquared && getPageSetting('c3meltingpoint') > 0 ? getPageSetting('c3meltingpoint') : 
										game.global.challengeActive == "Pandemonium" && getPageSetting('RPandemoniumMP') > 0 ? getPageSetting('RPandemoniumMP') : 
										game.global.challengeActive == "Daily" && getPageSetting('Rdmeltsmithy') > 0 ? getPageSetting('Rdmeltsmithy') : 
										getPageSetting('Rmeltsmithy');
					if ((game.global.world >= meltingpoint[0] && ((game.global.lastClearedCell + 1) >= meltingpoint[1])) || (meltsmithy > 0 && meltsmithy <= game.buildings.Smithy.owned)) {
						selectedMap = theMap.id;
						break;
					}
				}
			}
		}
	}

	//Voids
	if (RneedToVoid) {
		var voidArray = [];
		var prefixlist = {
			'Poisonous': 10,
			'Destructive': 11,
			'Deadly': 20,
			'Heinous': 30
		};
		var prefixkeys = Object.keys(prefixlist);
		var suffixlist = {
			'Descent': 7.077,
			'Void': 8.822,
			'Nightmare': 9.436,
			'Pit': 10.6
		};
		var suffixkeys = Object.keys(suffixlist);

		if (!Rshouldalchfarm) {
			for (var map in game.global.mapsOwnedArray) {
				var theMap = game.global.mapsOwnedArray[map];
				if (theMap.location == 'Void') {
					for (var pre in prefixkeys) {
						if (theMap.name.includes(prefixkeys[pre]))
							theMap.sortByDiff = 1 * prefixlist[prefixkeys[pre]];
					}
					for (var suf in suffixkeys) {
						if (theMap.name.includes(suffixkeys[suf]))
							theMap.sortByDiff += 1 * suffixlist[suffixkeys[suf]];
					}
					voidArray.push(theMap);
				}
			}
		}

		var voidArraySorted = voidArray.sort(function (a, b) {
			return a.sortByDiff - b.sortByDiff;
		});
		for (var map in voidArraySorted) {
			var theMap = voidArraySorted[map];
			RdoVoids = true;
			if (getPageSetting('RDisableFarm') <= 0)
				RshouldFarm = RshouldFarm || false;
			if (!restartVoidMap)
				selectedMap = theMap.id;
			break;
		}
	}

	//Automaps

	//Raiding
	if (Rshoulddopraid) {
		if (selectedMap == "world") {
			selectedMap = "createp";
		}
	}

	//Everything else
	if (!Rshoulddopraid && (RshouldDoMaps || RdoVoids || Rshouldtimefarm || Rshouldtributefarm || Rshoulddoquest > 0 || Rshouldmayhem > 0 || Rshouldinsanityfarm || Rshouldstormfarm || Rshouldequipfarm || Rshouldshipfarm || Rshouldpandemonium || Rshouldpandemoniumfarm || Rshouldalchfarm)) {
		if (selectedMap == "world") {
			if (Rshouldmayhem > 0 && !Rshouldpandemonium && !Rshouldtributefarm && !Rshouldtimefarm && !Rshouldinsanityfarm && !Rshouldequipfarm && !Rshouldshipfarm && !Rshouldalchfarm) {
				if (getPageSetting('Rmayhemmap') == 2) {
					for (var map in game.global.mapsOwnedArray) {
						if (!game.global.mapsOwnedArray[map].noRecycle && mayhemextra >= 0 && ((game.global.world + mayhemextra) == game.global.mapsOwnedArray[map].level)) {
							selectedMap = game.global.mapsOwnedArray[map].id;
							break;
						} else {
							selectedMap = "create";
						}
					}
				} else {
					for (var map in game.global.mapsOwnedArray) {
						if (!game.global.mapsOwnedArray[map].noRecycle && game.global.world == game.global.mapsOwnedArray[map].level) {
							selectedMap = game.global.mapsOwnedArray[map].id;
				break;
						} else {
							selectedMap = "create";
						}
					}
				}
			} else if (Rshouldpandemonium && !Rshouldalchfarm && !Rshouldtimefarm && !Rshouldtributefarm && !Rshouldinsanityfarm && !Rshouldequipfarm && !Rshouldshipfarm && !Rshoulddopraid) {
				if (game.global.challengeActive == "Pandemonium" && getPageSetting('RPandemoniumMaps')) {
					for (var map in game.global.mapsOwnedArray) {
						if (!game.global.mapsOwnedArray[map].noRecycle && pandemoniumextra >= 0 && ((game.global.world + pandemoniumextra) == game.global.mapsOwnedArray[map].level)) {
							selectedMap = game.global.mapsOwnedArray[map].id;
							break;
						} else {
							selectedMap = "create";
						}
					}
				}
			} else if (Rshouldpandemoniumfarm && !Rshouldpandemonium && !Rshouldalchfarm && !Rshouldtimefarm && !Rshouldtributefarm && !Rshouldinsanityfarm && !Rshouldequipfarm && !Rshouldshipfarm && !Rshoulddopraid) {
				if (game.global.challengeActive == "Pandemonium") {
					loot = game.global.farmlandsUnlocked && game.singleRunBonuses.goldMaps.owned ? 3.6 : game.global.farmlandsUnlocked ? 2.6 : game.singleRunBonuses.goldMaps.owned ? 2.85 : 1.85;
					for (var map in game.global.mapsOwnedArray) {
						if (!game.global.mapsOwnedArray[map].noRecycle && ((game.global.world - 1) == game.global.mapsOwnedArray[map].level) && game.global.mapsOwnedArray[map].bonus == pandfarmspecial && game.global.mapsOwnedArray[map].size == 20 && game.global.mapsOwnedArray[map].loot == loot && game.global.mapsOwnedArray[map].difficulty == 0.75) {
							selectedMap = game.global.mapsOwnedArray[map].id;
							break;
						} else {
							selectedMap = "create";
						}
					}
				}
			//Priority system for challenges. If Alchemy isn't at the top it'll break the recycling function I think
			} else if ((Rshouldalchfarm || Rshouldinsanityfarm || Rshouldtimefarm || Rshouldtributefarm || Rshouldshipfarm) && !Rshouldequipfarm && !Rshoulddopraid) {
				//Checking hyperspeed 2 percentage
				var hyp2pct = game.talents.liquification3.purchased ? 75 : game.talents.hyperspeed2.purchased ? 50 : 0
				var alchspecial = (Math.floor((game.global.highestRadonLevelCleared + 1) * (hyp2pct / 100)) >= game.global.world) ? autoTrimpSettings.RAlchSpecial.selected : "fa";
				if (Rshouldalchfarm) {
					selectedMap = RShouldFarmMapCreation(alchpluslevel, alchspecial, alchbiome);
				} 
				else if (Rshouldinsanityfarm) {
					selectedMap = RShouldFarmMapCreation(insanitypluslevel, "fa");  
				} 
				else if (Rshouldshipfarm) {
					selectedMap = RShouldFarmMapCreation(shippluslevel, shipspecial); 
				} 
				else if (Rshouldtimefarm) {
					selectedMap = RShouldFarmMapCreation(timefarmpluslevel, timefarmspecial);
					timefarmmap = "timefarming";
				} else if (Rshouldtributefarm) { 
					selectedMap = RShouldFarmMapCreation(tributefarmpluslevel, tributefarmspecial); 
				}
			} else if (Rshouldequipfarm) {
				for (var map in game.global.mapsOwnedArray) {
					if (!game.global.mapsOwnedArray[map].noRecycle && equipminus <= 0 && ((game.global.world + equipminus) == game.global.mapsOwnedArray[map].level)) {
						selectedMap = game.global.mapsOwnedArray[map].id;
						break;
					} else {
						selectedMap = "create";
					}
				}
			} else {
				for (var map in game.global.mapsOwnedArray) {
					if (!game.global.mapsOwnedArray[map].noRecycle && game.global.world == game.global.mapsOwnedArray[map].level) {
						selectedMap = game.global.mapsOwnedArray[map].id;
						break;
					} else {
						selectedMap = "create";
					}
				}
			}
		}
	}

	//Getting to Map Creation and Repeat
	if (!game.global.preMapsActive && game.global.mapsActive) {
		var doDefaultMapBonus = game.global.mapBonus < maxMapBonusLimit - 1;
		if ((Rshoulddopraid || (Rshoulddopraid && RAMPfragfarming)) || (Rshouldinsanityfarm || (Rshouldinsanityfarm && Rinsanityfragfarming)) || (selectedMap == game.global.currentMapId && (Rshoulddobogs || (!getCurrentMapObject().noRecycle && (doDefaultMapBonus || RvanillaMapatZone || RdoMaxMapBonus || RshouldFarm || Rshouldtimefarm || Rshouldtributefarm || Rshoulddoquest > 0 || Rshouldmayhem > 0 || Rshouldstormfarm || Rshouldequipfarm || (Rshouldshipfarm || (Rshouldshipfarm && Rshipfragfarming)) || Rshouldpandemonium || Rshouldalchfarm))))) {
			//Starting with repeat on
			if (!game.global.repeatMap) {
				repeatClicked();
			}
			if (Rshoulddopraid && !RAMPfragfarming) {
				if (game.options.menu.repeatUntil.enabled != 2) {
					game.options.menu.repeatUntil.enabled = 2;
				}
			} else if ((Rshoulddopraid && RAMPfragfarming) || (Rshouldinsanityfarm && Rinsanityfragfarming) || (Rshouldshipfarm && Rshipfragfarming)) {
				if (game.options.menu.repeatUntil.enabled != 0) game.options.menu.repeatUntil.enabled = 0;
			}
			if (!Rshoulddopraid && !RAMPfragfarming && !Rshouldinsanityfarm && !Rinsanityfragfarming && !Rshoulddobogs && !RshouldDoMaps && !Rshouldtributefarm && !Rshouldtimefarm && Rshoulddoquest <= 0 && Rshouldmayhem <= 0 && !Rshouldstormfarm && !Rshouldequipfarm && !Rshouldshipfarm && !Rshipfragfarming && !Rshouldpandemonium && !Rshouldalchfarm) {
				repeatClicked();
			}
			if (shouldDoHealthMaps && game.global.mapBonus >= getPageSetting('RMaxMapBonushealth')) {
				repeatClicked();
				shouldDoHealthMaps = false;
			}
			if (RdoMaxMapBonus && game.global.mapBonus >= (maxMapBonusLimit - 1)) {
				repeatClicked();
			}
			if (game.global.repeatMap && Rshoulddoquest == 6 && game.global.mapBonus >= 4) {
				repeatClicked();
			}
			if (game.global.repeatMap && Rshoulddopraid && RAMPfragfarming && RAMPfrag() == true) {
				repeatClicked();
			}
			if (game.global.repeatMap && Rshouldinsanityfarm && Rinsanityfragfarming && fragmapcost()) {
				repeatClicked();
			}
			if (game.global.repeatMap && Rshouldshipfarm && Rshipfragfarming && fragmapcost()) {
				repeatClicked();
			}
			if (game.global.repeatMap && Rshouldtimefarm && game.global.mapRunCounter + 1 == timezones) {
				repeatClicked();
			}
			if (game.global.repeatMap && Rshoulddobogs && game.global.mapRunCounter + 1 == stacksum) {
				repeatClicked();
			}
			if (game.global.repeatMap && Rshouldpandemonium && ((getCurrentMapObject().level - game.global.world) >= game.challenges.Pandemonium.pandemonium || (pandemoniumextra - game.challenges.Pandemonium.pandemonium) < pandemoniumextra)) {
				repeatClicked();
			}
			if (game.global.repeatMap && Rshouldalchfarm && herbtotal >= potioncosttotal) {
				repeatClicked();
			}

		} else {
			if (game.global.repeatMap) {
				repeatClicked();
			}
			if (restartVoidMap) {
				mapsClicked(true);
			}
		}
	} else if (!game.global.preMapsActive && !game.global.mapsActive) {
		game.global.mapRunCounter=0
		if (selectedMap != "world") {
			if (!game.global.switchToMaps) {
				mapsClicked();
			}
			if (RdoVoids && game.global.switchToMaps &&
				(RdoVoids ||
					(!RenoughDamage && RenoughHealth && game.global.lastClearedCell < 9) ||
					(RshouldFarm && game.global.lastClearedCell >= customVars.RshouldFarmCell)) &&
				(
					(game.resources.trimps.realMax() <= game.resources.trimps.owned + 1) ||
					(RdoVoids && game.global.lastClearedCell > 70)
				)
			) {
				mapsClicked();
			}
		}

	//Creating Map
	} else if (game.global.preMapsActive) {
		if (selectedMap == "world") {
			mapsClicked();
		} else if (selectedMap == "createp") {
			var RAMPfragcheck = true;
			if (praidfrag > 0) {
				if (RAMPfrag() == true) {
					RAMPfragcheck = true;
					RAMPfragfarming = false;
				} else if (RAMPfrag() == false && !RAMPmapbought[0] && !RAMPmapbought[1] && !RAMPmapbought[2] && !RAMPmapbought[3] && !RAMPmapbought[4] && Rshoulddopraid) {
					RAMPfragfarming = true;
					RAMPfragcheck = false;
					if (!RAMPfragcheck && RAMPfragmappy == undefined && !RAMPfragmappybought && game.global.preMapsActive && Rshoulddopraid) {
						debug("Check complete for frag map");
						fragmap();
						if ((updateMapCost(true) <= game.resources.fragments.owned)) {
							buyMap();
							RAMPfragmappybought = true;
							if (RAMPfragmappybought) {
								RAMPfragmappy = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
								debug("Frag map bought");
							}
						}
					}
					if (!RAMPfragcheck && game.global.preMapsActive && !game.global.mapsActive && RAMPfragmappybought && RAMPfragmappy != undefined && Rshoulddopraid) {
						debug("Running frag map");
						selectedMap = RAMPfragmappy;
						selectMap(RAMPfragmappy);
						runMap();
						RlastMapWeWereIn = getCurrentMapObject();
						RAMPprefragmappy = RAMPfragmappy;
						RAMPfragmappy = undefined;
					}
					if (!RAMPfragcheck && game.global.mapsActive && RAMPfragmappybought && RAMPprefragmappy != undefined && Rshoulddopraid) {
						if (RAMPfrag() == false) {
							if (!game.global.repeatMap) {
								repeatClicked();
							}
						} else if (RAMPfrag() == true) {
							if (game.global.repeatMap) {
								repeatClicked();
								mapsClicked();
							}
							if (game.global.preMapsActive && RAMPfragmappybought && RAMPprefragmappy != undefined && Rshoulddopraid) {
								RAMPfragmappybought = false;
							}
							if (RAMPprefragmappy != undefined) {
								recycleMap(getMapIndex(RAMPprefragmappy));
								RAMPprefragmappy = undefined;
							}
							RAMPfragcheck = true;
							RAMPfragfarming = false;
						}
					}
				} else {
					RAMPfragcheck = true;
					RAMPfragfarming = false;
				}
			}
			if (RAMPfragcheck) {
				raiding = praidfrag == 2 ? RAMPplusPresfragmax : praidfrag == 1 ? RAMPplusPresfragmin : RAMPplusPres
				for (var x = 0; x < 5; x++) {
					if (RAMPfragcheck && RAMPpMap[x] == undefined && !RAMPmapbought[x] && game.global.preMapsActive && Rshoulddopraid && RAMPshouldrunmap(x)) {
						raiding(x);
						if ((updateMapCost(true) <= game.resources.fragments.owned)) {
							buyMap();
							RAMPmapbought[x] = true;
							if (RAMPmapbought[x]) {
								RAMPpMap[x] = (game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id);
								debug("Map "+[(x+1)]+" bought");
							}
						}
					}
				}
				
				if (RAMPfragcheck && !RAMPmapbought[0] && !RAMPmapbought[1] && !RAMPmapbought[2] && !RAMPmapbought[3] && !RAMPmapbought[4]) {
					RAMPpMap[0] = undefined;
					RAMPpMap[1] = undefined;
					RAMPpMap[2] = undefined;
					RAMPpMap[3] = undefined;
					RAMPpMap[4] = undefined;
					debug("Failed to Prestige Raid. Looks like you can't afford to or have no equips to get!");
					Rshoulddopraid = false;
					autoTrimpSettings["RAutoMaps"].value = 0;
				}
				
				for (var x = 4; x > -1; x--) {
					if (RAMPfragcheck && game.global.preMapsActive && !game.global.mapsActive && RAMPmapbought[x] && RAMPpMap[x] != undefined && Rshoulddopraid) {
						debug("Running map "+[(5-x)]);
						selectedMap = RAMPpMap[x];
						selectMap(RAMPpMap[x]);
						runMap();
						RlastMapWeWereIn = getCurrentMapObject();
						RAMPrepMap[x] = RAMPpMap[x];
						RAMPpMap[x] = undefined;
					}
				}
			}
		} else if (selectedMap == "create") {
			var $mapLevelInput = document.getElementById("mapLevelInput");
			$mapLevelInput.value = game.global.world;
			var decrement;
			var tier;
			if (game.global.world >= customVars.RMapTierZone[0]) {
				tier = customVars.RMapTier0Sliders;
				decrement = [];
			} else if (game.global.world >= customVars.RMapTierZone[1]) {
				tier = customVars.RMapTier1Sliders;
				decrement = ['loot'];
			} else if (game.global.world >= customVars.RMapTierZone[2]) {
				tier = customVars.RMapTier2Sliders;
				decrement = ['loot'];
			} else {
				tier = customVars.RMapTier3Sliders;
				decrement = ['diff', 'loot'];
			}
			sizeAdvMapsRange.value = tier[0];
			adjustMap('size', tier[0]);
			difficultyAdvMapsRange.value = tier[1];
			adjustMap('difficulty', tier[1]);
			lootAdvMapsRange.value = tier[2];
			adjustMap('loot', tier[2]);
			biomeAdvMapsSelect.value = autoTrimpSettings.Rmapselection.selected == "Gardens" ? "Plentiful" : autoTrimpSettings.Rmapselection.selected;
			updateMapCost();
			if (RshouldFarm || game.global.challengeActive == 'Transmute') {
				biomeAdvMapsSelect.value = game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Sea";
				updateMapCost();
			}
			if (Rshouldinsanityfarm && !Rshouldtributefarm && !Rshouldtimefarm && !Rshoulddoquest && !Rshouldequipfarm && !Rshouldshipfarm && !Rshouldalchfarm) {
				var insanityfragcheck = true;
				if (getPageSetting('Rinsanityfarmfrag') == true) {
					if (fragmapcost() == true) {
						insanityfragcheck = true;
						Rinsanityfragfarming = false;
					} else if (fragmapcost() == false && Rshouldinsanityfarm) {
						Rinsanityfragfarming = true;
						insanityfragcheck = false;
						if (!insanityfragcheck && insanityfragmappy == undefined && !insanityfragmappybought && game.global.preMapsActive && insanityfragmappybought) {
							debug("Check complete for frag map");
							fragmap();
							if ((updateMapCost(true) <= game.resources.fragments.owned)) {
								buyMap();
								insanityfragmappybought = true;
								if (insanityfragmappybought) {
									insanityfragmappy = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
									debug("Frag map bought");
								}
							}
						}
						if (!insanityfragcheck && game.global.preMapsActive && !game.global.mapsActive && insanityfragmappybought && insanityfragmappy != undefined && insanityfragmappybought) {
							debug("Running frag map");
							selectedMap = insanityfragmappy;
							selectMap(insanityfragmappy);
							runMap();
							RlastMapWeWereIn = getCurrentMapObject();
							insanityprefragmappy = insanityfragmappy;
							insanityfragmappy = undefined;
						}
						if (!insanityfragcheck && game.global.mapsActive && insanityfragmappybought && insanityprefragmappy != undefined && insanityfragmappybought) {
							if (fragmapcost() == false) {
								if (!game.global.repeatMap) {
									repeatClicked();
								}
							} else if (fragmapcost() == true) {
								if (game.global.repeatMap) {
									repeatClicked();
									mapsClicked();
								}
								if (game.global.preMapsActive && insanityfragmappybought && insanityprefragmappy != undefined && Rshouldinsanityfarm) {
									insanityfragmappybought = false;
								}
								if (insanityprefragmappy != undefined) {
									recycleMap(getMapIndex(insanityprefragmappy));
									insanityprefragmappy = undefined;
								}
								insanityfragcheck = true;
								Rinsanityfragfarming = false;
							}
						}
					} else {
						insanityfragcheck = true;
						Rinsanityfragfarming = false;
					}
				}

				if (insanityfragcheck) {
					if (insanityfarmzone.includes(game.global.world)) {
						insanitymaplevel = insanitypluslevel < 0 ? game.global.world + insanitypluslevel : game.global.world;
						document.getElementById("biomeAdvMapsSelect").value = game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Random";
						document.getElementById("mapLevelInput").value = insanitymaplevel;
						if (insanitypluslevel > 0) document.getElementById("advExtraLevelSelect").value = insanitypluslevel;
					}
				}
				updateMapCost();
            }
			
			//Worshipper farming
			if (Rshouldshipfarm && !Rshouldtributefarm && !Rshouldtimefarm && !Rshoulddoquest && !Rshouldequipfarm && !Rshouldalchfarm) {
			var shipfragcheck = true;
				if (getPageSetting('Rshipfarmfrag') == true) {
					if (fragmapcost() == true) {
						shipfragcheck = true;
						Rshipfragfarming = false;
					} else if (fragmapcost() == false && Rshouldshipfarm) {
						Rshipfragfarming = true;
						shipfragcheck = false;
						if (!shipfragcheck && shipfragmappy == undefined && !shipfragmappybought && game.global.preMapsActive && Rshouldshipfarm) {
							debug("Check complete for ship frag map");
							fragmap();
							if ((updateMapCost(true) <= game.resources.fragments.owned)) {
								buyMap();
								shipfragmappybought = true;
								if (shipfragmappybought) {
									shipfragmappy = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
									debug("ship frag map bought");
								}
							}
						}
						if (!shipfragcheck && game.global.preMapsActive && !game.global.mapsActive && shipfragmappybought && shipfragmappy != undefined && Rshouldshipfarm) {
							debug("Running ship frag map");
							selectedMap = shipfragmappy;
							selectMap(shipfragmappy);
							runMap();
							RlastMapWeWereIn = getCurrentMapObject();
							shipprefragmappy = shipfragmappy;
							shipfragmappy = undefined;
						}
						if (!shipfragcheck && game.global.mapsActive && shipfragmappybought && shipprefragmappy != undefined && Rshouldshipfarm) {
							if (fragmapcost() == false) {
								if (!game.global.repeatMap) {
									repeatClicked();
								}
							} else if (fragmapcost() == true) {
								if (game.global.repeatMap) {
									repeatClicked();
									mapsClicked();
								}
								if (game.global.preMapsActive && shipfragmappybought && shipprefragmappy != undefined && Rshouldshipfarm) {
									shipfragmappybought = false;
								}
								if (shipprefragmappy != undefined) {
									recycleMap(getMapIndex(shipprefragmappy));
									shipprefragmappy = undefined;
								}
								shipfragcheck = true;
								Rshipfragfarming = false;
							}
						}
					} else {
						shipfragcheck = true;
						Rshipfragfarming = false;
					}
				}

				if (shipfragcheck) {
					if (shipfarmzone.includes(game.global.world)) {
						shipmaplevel = shippluslevel < 0 ? game.global.world + shippluslevel : game.global.world;
						document.getElementById("biomeAdvMapsSelect").value = game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Sea";
						document.getElementById("mapLevelInput").value = shipmaplevel;
						if (shippluslevel > 0) document.getElementById("advExtraLevelSelect").value = shippluslevel;
						document.getElementById("advSpecialSelect").value = shipspecial;
					}
				}
				updateMapCost();
			}
			
			//Map settings for Alchemy Farming, Time Farming and Tribute Farming.
			if ((Rshouldalchfarm || Rshouldtimefarm || Rshouldtributefarm) && !Rshoulddoquest) {
				biome = game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountain";

				if (Rshouldalchfarm) RShouldFarmMapCost(alchpluslevel, alchspecial, alchfarmzone, alchbiome);
				else if (Rshouldtimefarm) RShouldFarmMapCost(timefarmpluslevel, timefarmspecial, timefarmzone, biome);
				else if (Rshouldtributefarm) RShouldFarmMapCost(tributefarmpluslevel, tributefarmspecial, tributefarmzone, biome);
			}
			
			//Map settings for Quest Farming -- Need to test and debug if this works properly but it should be fine. Might be an issue with Rshoulddoquest (6) in the map creation settings if statement
			if (Rshoulddoquest) {
				hyp2pct = game.talents.liquification3.purchased ? 75 : game.talents.hyperspeed2.purchased ? 50 : 0
				questfastattack = ((Math.floor(game.global.highestRadonLevelCleared + 1) * (hyp2pct / 100) >= game.global.world) ? "0" : "fa");
				biomeAdvMapsSelect.value = game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountain";
				questspecial = 	Rshoulddoquest == 1 ? ['lsc','ssc',questfastattack] : 
								Rshoulddoquest == 2 ? ['lwc','swc',questfastattack] : 
								Rshoulddoquest == 3 || Rshoulddoquest == 7 ? ['lmc','smc',questfastattack] : 
								//Unsure if needed - Probably gives too much science
								//Rshoulddoquest == 5 ? ['lrc','src',questfastattack] :
								Rshoulddoquest == 10 ? ['hc','hc',questfastattack] : 
								[questfastattack,questfastattack,questfastattack];

				if (Rshoulddoquest == 1 || Rshoulddoquest == 2 || Rshoulddoquest == 3 || Rshoulddoquest == 4 || Rshoulddoquest == 5 || Rshoulddoquest == 6 || Rshoulddoquest == 7 || Rshoulddoquest == 10) {
					document.getElementById("advSpecialSelect").value = questspecial[0];
					updateMapCost();
					if (updateMapCost(true) > game.resources.fragments.owned) {
						document.getElementById("advSpecialSelect").value = questspecial[1];
						updateMapCost();
						if (updateMapCost(true) > game.resources.fragments.owned) {
							document.getElementById("advSpecialSelect").value = questspecial[2];
							updateMapCost();
							if (updateMapCost(true) > game.resources.fragments.owned) {
								document.getElementById("advSpecialSelect").value = 0;
								updateMapCost();
							}
						}
					}
				}
				if (updateMapCost(true) > game.resources.fragments.owned) {
					biomeAdvMapsSelect.value = "Random";
					updateMapCost();
				}
			}
			//Mayhem farming
			if (Rshouldmayhem > 0 && getPageSetting('Rmayhemmap') == 2 && !Rshouldtributefarm && !Rshouldtimefarm) {
				hyp2pct = game.talents.liquification3.purchased ? 75 : game.talents.hyperspeed2.purchased ? 50 : 0
				special = (Math.floor(game.global.highestRadonLevelCleared + 1) * (hyp2pct / 100) >= game.global.world ? "lmc" : "fa");
				PerfectMapCost(mayhemextra,special);
				document.getElementById("advSpecialSelect").value = ((Math.floor(game.global.highestRadonLevelCleared + 1) * (hyp2pct / 100) >= game.global.world) ? "lmc" : "fa");
				mapLevelInput.value = game.global.world;
				biomeAdvMapsSelect.value = game.global.farmlandsUnlocked ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountains";
				document.getElementById("advSpecialSelect").value = ((Math.floor(game.global.highestRadonLevelCleared + 1) * (hyp2pct / 100) >= game.global.world) ? "lmc" : "fa");
				document.getElementById("advExtraLevelSelect").value = mayhemextra;
				updateMapCost();
				if (updateMapCost(true) > game.resources.fragments.owned) {
					console.log("You can't afford to run a +" + mayhemextra+" map");
				}
			}
			//Pandemonium Destacking
			if (Rshouldpandemonium && getPageSetting('RPandemoniumMaps') && !Rshouldtimefarm) {
				PerfectMapCost(pandemoniumextra,pandspecial);
			}
			//Pandemonium Equip farm
			if (Rshouldpandemoniumfarm) {
				PerfectMapCost(-1,pandfarmspecial);
			}
			//Equip farming -- Testing if perfectmapcost works properly with equipminus, should be fine
			if (Rshouldequipfarm) {
				PerfectMapCost(equipminus,"lmc");
			}
			if (updateMapCost(true) > game.resources.fragments.owned) {
				if (!RenoughDamage) decrement.push('diff');
				if (RshouldFarm) decrement.push('size');
			}
			while (decrement.indexOf('loot') > -1 && lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				lootAdvMapsRange.value -= 1;
			}
			while (decrement.indexOf('diff') > -1 && difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				difficultyAdvMapsRange.value -= 1;
			}
			while (decrement.indexOf('size') > -1 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				sizeAdvMapsRange.value -= 1;
			}
			while (lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				lootAdvMapsRange.value -= 1;
			}
			while (difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				difficultyAdvMapsRange.value -= 1;
			}
			while (sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				sizeAdvMapsRange.value -= 1;
			}
			var maplvlpicked = parseInt(document.getElementById("mapLevelInput").value);
			if (updateMapCost(true) > game.resources.fragments.owned) {
				selectMap(game.global.mapsOwnedArray[highestMap].id);
				debug("Can't afford the map we designed, #" + maplvlpicked, "maps", '*crying2');
				debug("...selected our highest map instead # " + game.global.mapsOwnedArray[highestMap].id + " Level: " + game.global.mapsOwnedArray[highestMap].level, "maps", '*happy2');
				runMap();
				RlastMapWeWereIn = getCurrentMapObject();
			} else {
				debug("Buying a Map, level: #" + maplvlpicked, "maps", 'th-large');
				var result = buyMap();
				if (result == -2) {
					debug("Too many maps, recycling now: ", "maps", 'th-large');
					recycleBelow(true);
					debug("Retrying, Buying a Map, level: #" + maplvlpicked, "maps", 'th-large');
					result = buyMap();
					if (result == -2) {
						recycleMap(lowestMap);
						result = buyMap();
						if (result == -2)
							debug("AutoMaps unable to recycle to buy map!");
						else
							debug("Retrying map buy after recycling lowest level map");
					}
				}
			}
		} else {
			selectMap(selectedMap);
			var themapobj = game.global.mapsOwnedArray[getMapIndex(selectedMap)];
			var levelText;
			if (themapobj.level > 0) {
				levelText = " Level: " + themapobj.level;
			} else {
				levelText = " Level: " + game.global.world;
			}
			var voidorLevelText = themapobj.location == "Void" ? " Void: " : levelText;
			debug("Running selected " + selectedMap + voidorLevelText + " Name: " + themapobj.name, "maps", 'th-large');
			runMap();
			RlastMapWeWereIn = getCurrentMapObject();
		}
	}
}
