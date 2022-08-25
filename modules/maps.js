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
	else if (game.global.mapsActive && getCurrentMapObject().level > game.global.world && getCurrentMapObject().location == "Bionic") status = 'BW' + getCurrentMapObject().level + " Cell " + getCurrentMapCell().level + ". " + offlineProgress.countMapItems(getCurrentMapObject().level) + " items remaining.";

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

	voidMapLevelSettingCell = game.global.challengeActive == "Daily" && getPageSetting('dvoidscell') > 0 ? getPageSetting('dvoidscell') : game.global.challengeActive != "Daily" && getPageSetting('voidscell') > 0 ? getPageSetting('voidscell') : 70
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

	needToVoid = (voidMapLevelSetting > 0 && game.global.totalVoidMaps > 0 && game.global.lastClearedCell + 2 >= voidMapLevelSettingCell &&
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
		if (!game.global.mapsActive && game.global.gridArray[game.global.lastClearedCell + 2].nomStacks >= customVars.NomFarmStacksCutoff[2]) {
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
			if (option.world == game.global.world && option.cell == game.global.lastClearedCell + 2) vanillaMapatZone = true;
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
MODULES.maps.RshouldFarmCell = 69;
MODULES.maps.RSkipNumUnboughtPrestiges = 2;
MODULES.maps.RUnearnedPrestigesRequired = 2;
MODULES.maps.PandemoniumFarmLevel = -1;

//General
var RshouldDoMaps = false;
var RlastMapWeWereIn = null;
var RdoMaxMapBonus = false;
var RvanillaMapatZone = false;
var rShouldMaxMapBonus = false;
var rMBCurrentMap = undefined;
var rVMCurrentMap = undefined;
var rC3EndZoneSetting = -1;
currTime = 0;
var currentFarmingType = undefined;
var rCurrentMap = undefined;
//Void Maps
var RdoVoids = false;
var RneedToVoid = false;
//Equip Farm
var Requipfarm = !1;
var rShouldEquipFarm = !1;
var Requipminusglobal = -1;
//Time Farm
rShouldTimeFarm = false;
var rTFCurrentMap = undefined;
var rTFMapRepeats = 0;
//Tribute Farm
rTributeFarming = false;
rShouldTributeFarm = false;
rShouldMetFarm = false;
var rTrFCurrentMap = undefined;
//Unbalance
var rShouldUnbalance = false;
//Storm
var rShouldStorm = false;
//Worshipper
var rShouldWorshipperFarm = false;
var rFragmentFarming = false;
var rFragmentMapID = undefined;
var rInitialFragmentMapID = undefined;
var rFragMapBought = false;
var worshipperdebug = 0;
var rWorshipperCurrentMap = undefined;
//Quagmire
var Rshoulddobogs = false;
var rBlackBogCurrentMap = undefined;
//Quest
var rShouldQuest = 0;
var rHasQuested = false;
var RquestSmithyWarning = -1;
var RquestSmithyWarning_Setting = -1;
//Mayhem
var rShouldMayhem = false;
//Storm
var Rstormfarm = false;
var Rshouldstormfarm = false;
//Insanity
var rShouldInsanityFarm = false;
var rFragmentFarming = false;
var rFragmentMapID = undefined;
var rInitialFragmentMapID = undefined;
var rFragMapBought = false;
var rInsanityCurrentMap = undefined;
//Pandemonium
var rShouldPandemoniumDestack = false;
var rShouldPandemoniumFarm = false;
var rShouldPandemoniumJestimpFarm = false;
var savefile = null;
var jestFarmMap = false;
var rPandemoniumCurrentMap = undefined;
//Alchemy
var Rshouldalchfarm = false;
var rAlchSpecialError = 0;
var rAlchemyCurrentMap = undefined;
//Hypothermia
var rHypoFarm = false;
var rHFSaveWood = false;
var rShouldHypoFarm = false;
var rHFCurrentMap = undefined;
var rHFBonfireCostTotal = 0;
var rHypoRespecced = null;
var rHypoBuyPackrat = false;
//Prestige
var rShouldPrestigeRaid = false;
var RAMPfragmappy = undefined;
var RAMPprefragmappy = undefined;
var RAMPpMap = new Array(5);
var RAMPrepMap = new Array(5);
var RAMPmapbought = [[false], [false], [false], [false], [false]];
RAMPmapbought.fill(false); //Unsure if necessary - Need to test
var RAMPfragmappybought = false;
var RAMPfragfarming = false;
var runningPrestigeMaps = false;
//Smithy Farming
rShouldSmithyFarm = false;
var rShouldSmithyGemFarm = false;
var rShouldSmithyWoodFarm = false;
var rShouldSmithyMetalFarm = false;
var rSFCurrentMap = undefined;
var smithyMapCount = [0, 0, 0];
//Daily Shred Variables
var shredActive = false;
var rShouldSmithless = false;

//Auto Level variables
var rTFautoLevel = Infinity;
var rTrFautoLevel = Infinity;
var rSFautoLevel = Infinity;
var rMBautoLevel = Infinity;
var rSmithlessautoLevel = Infinity;
var enemyDamage = 1;
var HDRatio = 0;

if (typeof (autoTrimpSettings.rAutoStructureSetting.value) !== 'undefined' && autoTrimpSettings.rAutoStructureSetting.value === true)
	document.getElementById('autoStructureBtn').classList.add("enabled")

function RupdateAutoMapsStatus(get) {

	var status;

	//Fail Safes
	if (getPageSetting('RAutoMaps') == 0) status = 'Off';
	//Setting up status
	else if (!game.global.mapsUnlocked) status = 'Maps not unlocked!';
	//Time, Tribute, Equip, Ship Farming, Prestige Raiding, Map bonus, void maps
	else if (RdoVoids) {
		var stackedMaps = Fluffy.isRewardActive('void') ? countStackedVoidMaps() : 0;
		status = 'Void Maps: ' + game.global.totalVoidMaps + ((stackedMaps) ? " (" + stackedMaps + " stacked)" : "") + ' remaining';
	}
	else if (rFragmentFarming) status = 'Fragment Farming to: an amount (TBI)';
	else if (rShouldPrestigeRaid) status = 'Prestige Raiding: ' + Rgetequips(raidzones, false) + ' items remaining';
	else if (Rshouldalchfarm) status = 'Alchemy Farming ' + alchObj.potionNames[potion] + " (" + alchObj.potionsOwned[potion] + "/" + alchpotions.toString().replace(/[^\d:-]/g, '') + ")";
	else if (rShouldHypoFarm) status = 'Hypo Farming to ' + prettify(rHFBonfireCostTotal) + ' wood';
	else if (game.global.mapsActive && getCurrentMapObject().name == 'Melting Point') status = 'Melting Point';
	else if (game.global.mapsActive && getCurrentMapObject().name == 'Atlantrimp') status = 'Atlantrimp';
	else if (game.global.mapsActive && getCurrentMapObject().name == 'Frozen Castle') status = 'Frozen Castle';
	else if (rShouldTimeFarm) status = 'Time Farming: ' + game.global.mapRunCounter + "/" + rTFRepeatCounter;
	else if (rShouldTributeFarm && rTrFTributes > game.buildings.Tribute.owned) status = 'Tribute Farming: ' + game.buildings.Tribute.owned + "/" + rTrFTributes;
	else if (rShouldMetFarm && rTrFMeteorologists > game.jobs.Meteorologist.owned) status = 'Meteorologist Farming: ' + game.jobs.Meteorologist.owned + "/" + rTrFMeteorologists;
	else if (rShouldSmithyFarm) status = 'Smithy Farming for ' + rSFGoal;
	else if (rShouldUnbalance || (game.global.mapsActive && getCurrentMapObject().level == 6 && game.challenges.Unbalance.balanceStacks > 0)) status = 'Destacking: ' + game.challenges.Unbalance.balanceStacks + " remaining";
	else if (rShouldStorm || (game.global.mapsActive && getCurrentMapObject().level == 6 && game.challenges.Storm.beta > 0)) status = 'Destacking: ' + game.challenges.Storm.beta + " remaining";
	else if (rShouldWorshipperFarm) status = 'Ship Farming: ' + game.jobs.Worshipper.owned + "/" + shipfarmamount;
	else if (rShouldEquipFarm) status = 'Equip Farming to ' + equipfarmdynamicHD().toFixed(2) + " and " + estimateEquipsForZone()[2] + " Equality";
	else if (rShouldMaxMapBonus) status = 'Map Bonus: ' + game.global.mapBonus + "/" + rMBRepeatCounter;
	else if (rShouldSmithless) status = 'Smithless Map Bonus: ' + game.global.mapBonus + "/10";
	//Challenges
	else if (Rshoulddobogs) status = 'Black Bogs: ' + (stacksum - game.global.mapRunCounter) + " remaining";
	else if (rShouldQuest) status = 'Questing: ' + game.challenges.Quest.getQuestProgress();
	else if (rShouldMayhem) status = 'Mayhem Destacking: ' + game.challenges.Mayhem.stacks + " remaining";
	else if (Rshouldstormfarm) status = 'Storm Farming to ' + stormdynamicHD().toFixed(2);
	else if (rShouldInsanityFarm) status = 'Insanity Farming: ' + game.challenges.Insanity.insanity + "/" + rIFStacks;
	else if (rShouldPandemoniumDestack) status = 'Pandemonium Destacking: ' + game.challenges.Pandemonium.pandemonium + " remaining";
	else if (rShouldPandemoniumFarm) status = 'Pandemonium Farming Equips below ' + prettify(scaleToCurrentMapLocal(amt_cache, false, true, getPageSetting('PandemoniumFarmLevel')));
	else if (rShouldPandemoniumJestimpFarm) status = 'Pandemonium Farming Equips below ' + prettify(jestMetalTotal);
	else if (RvanillaMapatZone) status = 'Vanilla MAZ';
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

	//Interval code
	var date = new Date();
	var sixSecondInterval = ((date.getSeconds() % 6) === 0 && (date.getMilliseconds() < 100));
	var twoSecondInterval = ((date.getSeconds() % 2) === 0 && (date.getMilliseconds() < 100));
	var oneSecondInterval = ((date.getSeconds() % 1) === 0 && (date.getMilliseconds() < 100));

	//Quest
	var Rquestfarming = false;
	rShouldQuest = 0;
	Rquestfarming = (game.global.world > 5 && game.global.challengeActive == "Quest" && questcheck() > 0 && game.challenges.Quest.getQuestProgress != 'Quest Complete!');

	if (Rquestfarming) {
		var time = ((new Date().getTime() - game.global.zoneStarted) / 1000 / 60)
		//Setting fallback to 0 might cause a repeat issue later on, need to test and debug
		rShouldQuest = questcheck() == 1 ? 1 :
			questcheck() == 2 ? 2 :
				questcheck() == 3 ? 3 :
					questcheck() == 4 ? 4 :
						questcheck() == 5 ? 5 :
							questcheck() == 6 ? 6 :
								questcheck() == 7 && (RcalcOurDmg('min', 0, false, true) < game.global.gridArray[50].maxHealth) && !(game.portal.Tenacity.getMult() === Math.pow(1.4000000000000001, getPerkLevel("Tenacity") + getPerkLevel("Masterfulness"))) ? 7 :
									questcheck() == 8 ? 8 :
										questcheck() == 9 ? 9 :
											questcheck() == 10 && game.mapUnlocks.SmithFree.canRunOnce && !canAffordBuilding('Smithy') ? 10 :
												0
	}

	//Failsafes
	if (!game.global.mapsUnlocked || RcalcOurDmg("avg", false, false, true) <= 0 || rShouldQuest == 9 || rShouldQuest == 8) {
		RvanillaMapatZone = false;
		RenoughDamage = true;
		RenoughHealth = true;
		RshouldFarm = false;
		RshouldDoMaps = false;
		RupdateAutoMapsStatus();
		if (game.global.preMapsActive)
			mapsClicked();
		return;
	}

	if (rShouldQuest == 0 && rHasQuested) {
		if (game.global.mapsActive)
			mapsClicked();
		if (game.global.preMapsActive)
			recycleMap();
		rHasQuested = false;
	}

	//Vars
	var mapenoughdamagecutoff = getPageSetting("Rmapcuntoff");
	var customVars = MODULES["maps"];
	if ((game.options.menu.repeatUntil.enabled == 1 || game.options.menu.repeatUntil.enabled == 2 || game.options.menu.repeatUntil.enabled == 3) && !game.global.mapsActive && !game.global.preMapsActive) toggleSetting('repeatUntil');
	if (game.options.menu.exitTo.enabled != 0) toggleSetting('exitTo');
	if (RvanillaMapatZone && game.options.menu.repeatVoids.enabled != 1) toggleSetting('repeatVoids');
	if (!RvanillaMapatZone && game.options.menu.repeatVoids.enabled != 0) toggleSetting('repeatVoids');
	var hitsSurvived = getPageSetting("Rhitssurvived") > 0 ? getPageSetting("Rhitssurvived") : 5;
	if (oneSecondInterval) HDRatio = RcalcHDratio();

	//Calc
	var ourBaseDamage = RcalcOurDmg("avg", false, false, true);
	if (getPageSetting('rManageEquality') === 2 && oneSecondInterval) {
		enemyDamage = RcalcBadGuyDmg(null, RgetEnemyAvgAttack(game.global.world, 100, 'Improbability', 'world', true), equalityQuery(true, true, 'Snimp', game.global.world, 99, 'world', 1), true);
	}
	else if (getPageSetting('rManageEquality') !== 2) {
		enemyDamage = RcalcBadGuyDmg(null, RgetEnemyAvgAttack(game.global.world, 99, 'Improbability', 'world', true));
	}

	if (getPageSetting('RDisableFarm') > 0) {
		RshouldFarm = (HDRatio >= getPageSetting('RDisableFarm'));
		if (game.options.menu.repeatUntil.enabled == 1 && RshouldFarm)
			toggleSetting('repeatUntil');
	}
	RenoughHealth = (RcalcOurHealth() > (hitsSurvived * enemyDamage));
	RenoughDamage = (HDRatio <= mapenoughdamagecutoff || game.global.mapBonus === 10);
	RupdateAutoMapsStatus();

	//Farming & resetting variables.
	var selectedMap = "world";
	RshouldDoMaps = false;
	rShouldTimeFarm = false;
	rShouldTributeFarm = false;
	rShouldMetFarm = false;
	rShouldUnbalance = false;
	rShouldStorm = false;
	rShouldInsanityFarm = false;
	Rshouldstormfarm = false;
	rShouldEquipFarm = false;
	rShouldWorshipperFarm = false;
	rShouldMayhem = false;
	rShouldPandemoniumDestack = false;
	rShouldPandemoniumFarm = false;
	rShouldPandemoniumJestimpFarm = false;
	Rshouldalchfarm = false;
	rShouldHypoFarm = false;
	rShouldMaxMapBonus = false;
	rShouldSmithless = false;
	RvanillaMapatZone = false;
	workerRatio = null;
	rTributeFarming = false;
	rTrFTributes = 0;
	rTrFMeteorologists = 0;
	RneedToVoid = false;
	//Daily Shred
	shredActive = false;

	//Smithy Farming
	rShouldSmithyFarm = false;
	rShouldSmithyGemFarm = false;
	rShouldSmithyWoodFarm = false;
	rShouldSmithyMetalFarm = false;

	var rRunningC3 = game.global.runningChallengeSquared || game.global.challengeActive == 'Mayhem' || game.global.challengeActive == 'Pandemonium';
	var rRunningDaily = game.global.challengeActive == "Daily";
	var rRunningRegular = game.global.challengeActive != "Daily" && game.global.challengeActive != "Mayhem" && game.global.challengeActive != "Pandemonium" && !game.global.runningChallengeSquared;
	var hyperspeed2 = game.talents.liquification3.purchased ? 75 : game.talents.hyperspeed2.purchased ? 50 : 0;
	var totalPortals = getTotalPortals();

	if (ourBaseDamage > 0) {
		RshouldDoMaps = (!RenoughDamage || RshouldFarm);
	}
	var shouldDoHealthMaps = false;


	//Reset to defaults when on world grid
	if (!game.global.mapsActive && !game.global.preMapsActive) {
		game.global.mapRunCounter = 0;
		rTFMapRepeats = 0;
		currTime = 0;
		rTFAtlantrimp = false;
		if (game.global.repeatMap) repeatClicked();
		if (game.global.selectedMapPreset >= 4) game.global.selectedMapPreset = 1;
		if (document.getElementById('advExtraLevelSelect').value > 0)
			document.getElementById('advExtraLevelSelect').value = "0";
		runningPrestigeMaps = false;
	}

	if (!rFragmentFarming) {
		rFragmentMapID = undefined;
		rInitialFragmentMapID = undefined;
		rFragMapBought = false;
	}

	//Daily Shred variables
	if (game.global.challengeActive === 'Daily' && typeof (game.global.dailyChallenge.hemmorrhage) !== 'undefined') {
		shredActive = true;
		var foodShred = dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('food');
		var woodShred = dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('wood');
		var metalShred = dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('metal');
	}

	//U2 (Radon) Map at Zone (MAZ)
	if (game.options.menu.mapAtZone.enabled && game.global.canMapAtZone) {
		var MaZPreset = game.options.menu.mapAtZone.U2Mode == "b" ? game.options.menu.mapAtZone.setZoneU2B :
			game.options.menu.mapAtZone.setZoneU2;
		for (var x = 0; x < MaZPreset.length; x++) {
			var option = MaZPreset[x];
			var world = game.global.world;
			var validRange = world >= option.world && world <= option.through;
			var mazZone = validRange && (world == option.world && option.times == -1 || (world - option.world) % option.times == 0);
			if (!game.global.preMapsActive && mazZone && option.cell == game.global.lastClearedCell + 2) RvanillaMapatZone = true;
		}
		if (RvanillaMapatZone) {
			RupdateAutoMapsStatus();
			return;
		}
	}

	//Void Maps
	if ((rRunningRegular && autoTrimpSettings.rVoidMapDefaultSettings.value.active) || (rRunningDaily && autoTrimpSettings.rdVoidMapDefaultSettings.value.active) || (rRunningC3 && autoTrimpSettings.rc3VoidMapDefaultSettings.value.active) && rShouldQuest === 0) {
		//Setting up variables and checking if we should use daily settings instead of regular Map Bonus settings
		rVMZone = rRunningC3 ? getPageSetting('rc3VoidMapZone') : rRunningDaily ? getPageSetting('rdVoidMapZone') : getPageSetting('rVoidMapZone');
		var rVMBaseSettings = rRunningC3 ? autoTrimpSettings.rc3VoidMapSettings.value : rRunningDaily ? autoTrimpSettings.rdVoidMapSettings.value : autoTrimpSettings.rVoidMapSettings.value;
		rVMIndex = null;
		for (var y = 0; y < rVMZone.length; y++) {
			if (((rVMZone[y] + (rRunningDaily ? dailyModiferReduction() : 0)) + rVMBaseSettings[y].voidMod) - game.global.world >= 0 && game.global.world >= (rVMZone[y] + (rRunningDaily ? dailyModiferReduction() : 0)) && rVMBaseSettings[y].active)
				rVMIndex = rVMZone.indexOf(rVMZone[y]);
			else
				continue;
		}
		if (rVMIndex !== null && rVMIndex >= 0) {
			var rVMSettings = rVMBaseSettings[rVMIndex];
			rVMRepeatCounter = rVMSettings.repeat;
			if (rVMSettings.active) {
				var rVMCell = rVMSettings.cell;
				if (game.global.lastClearedCell + 2 >= rVMCell) {
					var rVMJobRatio = rVMSettings.jobratio
					if (rVMCurrentMap != undefined && game.global.totalVoidMaps === 0) {
						if (getPageSetting('rMapRepeatCount')) debug("Void Maps took " + formatTimeForDescriptions(timeForFormatting(currTime)) + " to complete on zone " + game.global.world + ".")
						currTime = 0
						rVMCurrentMap = undefined;
						RdoVoids = false;
					}
					if (game.global.totalVoidMaps > 0)
						RneedToVoid = true;
				}
			}
		}
		if (game.global.totalVoidMaps <= 0 || !RneedToVoid)
			RdoVoids = false;
	}

	//Map Bonus
	if ((rRunningRegular && autoTrimpSettings.rMapBonusDefaultSettings.value.active) || (rRunningDaily && autoTrimpSettings.rdMapBonusDefaultSettings.value.active) || (rRunningC3 && autoTrimpSettings.rc3MapBonusDefaultSettings.value.active) && rShouldQuest === 0) {
		//Setting up variables and checking if we should use daily settings instead of regular Map Bonus settings
		rMBZone = rRunningC3 ? getPageSetting('rc3MapBonusZone') : rRunningDaily ? getPageSetting('rdMapBonusZone') : getPageSetting('rMapBonusZone');
		var rMBBaseSettings = rRunningC3 ? autoTrimpSettings.rc3MapBonusSettings.value : rRunningDaily ? autoTrimpSettings.rdMapBonusSettings.value : autoTrimpSettings.rMapBonusSettings.value;
		rMBIndex = null;
		for (var y = 0; y < rMBZone.length; y++) {
			if (game.global.world - rMBZone[y] >= 0 && rMBBaseSettings[y].active)
				rMBIndex = rMBZone.indexOf(rMBZone[y]);
			else
				continue;
		}

		if (rMBIndex !== null && rMBIndex >= 0) {
			var rMBSettings = rMBBaseSettings[rMBIndex];
			rMBRepeatCounter = rMBSettings.repeat;
			if (rMBSettings.active && game.global.mapBonus < rMBRepeatCounter) {
				var rMBCell = rMBSettings.cell;
				if (game.global.lastClearedCell + 2 >= rMBCell) {
					rMBMapLevel = rMBSettings.level;
					var rMBSpecial = rMBSettings.special;
					var rMBJobRatio = rMBSettings.jobratio;

					if (rMBSettings.autoLevel) {
						if (rMBCurrentMap === undefined) {
							if (rMBautoLevel === Infinity) rMBautoLevel = autoMapLevel(10, 0, true);
							if (rMBautoLevel !== Infinity && twoSecondInterval) rMBautoLevel = autoMapLevel(10, 0, true);
						}
						if (sixSecondInterval && (autoMapLevel(10, 0, true) > rMBautoLevel)) {
							rMBautoLevel = autoMapLevel(10, 0, true);
						}
						if (rMBautoLevel !== Infinity) {
							rMBMapLevel = rMBautoLevel;
						}
					}
					//If you're running Transmute and the rMBSpecial variable is either LMC or SMC it changes it to LSC/SSC.
					if (game.global.challengeActive == 'Transmute' && rMBSpecial.includes('mc'))
						rMBSpecial = rMBSpecial.charAt(0) + "sc";
					if (game.global.mapBonus >= rMBRepeatCounter && rMBCurrentMap != undefined) {
						rMBCurrentMap = undefined;
						if (getPageSetting('rMapRepeatCount')) debug("Map Bonus took " + (game.global.mapRunCounter) + " (" + (rMBMapLevel >= 0 ? "+" : "") + rMBMapLevel + " " + rMBSpecial + ")" + (game.global.mapRunCounter == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime)) + " to complete on zone " + game.global.world + ".")
						if (rMBautoLevel !== Infinity) rMBautoLevel = Infinity;
						currTime = 0
					}
					if (rMBRepeatCounter > game.global.mapBonus)
						rShouldMaxMapBonus = true;
					else if (game.global.mapBonus < getPageSetting('RMaxMapBonushealth') && !RenoughHealth) {
						RshouldDoMaps = true;
						shouldDoHealthMaps = true;
					}
				}
			}
		}
	}

	//Time Farm
	if ((rRunningRegular && autoTrimpSettings.rTimeFarmDefaultSettings.value.active) || (rRunningDaily && autoTrimpSettings.rdTimeFarmDefaultSettings.value.active) || (rRunningC3 && autoTrimpSettings.rc3TimeFarmDefaultSettings.value.active) && rShouldQuest === 0) {
		//Setting up variables and checking if we should use daily settings instead of regular Time Farm settings
		var rTFBaseSetting = rRunningC3 ? autoTrimpSettings.rc3TimeFarmSettings.value : rRunningDaily ? autoTrimpSettings.rdTimeFarmSettings.value : autoTrimpSettings.rTimeFarmSettings.value;

		if (rBSRunningAtlantrimp && !(game.global.mapsActive && getCurrentMapObject().name === 'Atlantrimp'))
			rTFAtlantrimp = false;
		rTFZone = rRunningC3 ? getPageSetting('rc3TimeFarmZone') : rRunningDaily ? getPageSetting('rdTimeFarmZone') : getPageSetting('rTimeFarmZone');
		var rTFIndex;
		for (var y = 0; y < rTFZone.length; y++) {
			if (rTFBaseSetting[y].done === totalPortals + "_" + game.global.world || !rTFBaseSetting[y].active) {
				continue;
			}
			if (game.global.world === rTFZone[y]) {
				rTFIndex = y;
				break;
			}
		}

		if (rTFIndex >= 0) {
			//Figuring out how many maps to run at your current zone
			var rTFSettings = rTFBaseSetting[rTFIndex];
			var rTFCell = rTFSettings.cell;
			if (rTFSettings.active && game.global.lastClearedCell + 2 >= rTFCell) {
				rTFMapLevel = rTFSettings.level
				var rTFSpecial = rTFSettings.special
				rTFRepeatCounter = rTFSettings.repeat
				var rTFJobRatio = rTFSettings.jobratio
				rTFAtlantrimp = !game.mapUnlocks.AncientTreasure.canRunOnce ? false : rTFSettings.atlantrimp

				if (shredActive) {
					if (foodShred && mapSpecialModifierConfig[rTFSpecial].name.includes('Savory')) {
						if (rTFRepeatCounter > 50) rTFRepeatCounter = 50;
						rTFAtlantrimp = false;
					}
					if (woodShred && mapSpecialModifierConfig[rTFSpecial].name.includes('Wooden')) {
						if (rTFRepeatCounter > 50) rTFRepeatCounter = 50;
						rTFAtlantrimp = false;
					}
					if (metalShred && mapSpecialModifierConfig[rTFSpecial].name.includes('Metal')) {
						if (rTFRepeatCounter > 50) rTFRepeatCounter = 50;
						rTFAtlantrimp = false;
					}

				}
				if (game.global.mapRunCounter === 0 && rTFMapRepeats !== 0) {
					game.global.mapRunCounter = rTFMapRepeats
					rTFMapRepeats = 0;
				}
				if (rTFSettings.autoLevel) {
					if (rTFCurrentMap === undefined) {
						if (rTFautoLevel === Infinity) rTFautoLevel = autoMapLevel();
						if (rTFautoLevel !== Infinity && twoSecondInterval) rTFautoLevel = autoMapLevel();
					}

					//This bit needs a proper map repeat implementation, not sure how to do it!
					if (sixSecondInterval && (autoMapLevel() > rTFautoLevel)) {
						rTFautoLevel = autoMapLevel();
						rTFMapRepeats = rTFMapRepeats + game.global.mapRunCounter + 1;
					}
					if (rTFautoLevel !== Infinity) {
						rTFMapLevel = rTFautoLevel;
					}
				}

				//When running Wither make sure map level is lower than 0 so that we don't accumulate extra stacks.
				if (game.global.challengeActive == "Wither" && rTFMapLevel >= 0)
					rTFMapLevel = -1;
				//If you're running Transmute and the rTFSpecial variable is either LMC or SMC it changes it to LSC/SSC.
				if (game.global.challengeActive == 'Transmute' && rTFSpecial.includes('mc'))
					rTFSpecial = rTFSpecial.charAt(0) + "sc";
				if (game.global.mapRunCounter >= rTFRepeatCounter && rTFCurrentMap != undefined) {
					rTFSettings.done = totalPortals + "_" + game.global.world;
					rTFCurrentMap = undefined;
					rTFMapRepeats = 0;
					if (getPageSetting('rMapRepeatCount')) debug("Time Farm took " + (game.global.mapRunCounter) + " (" + (rTFMapLevel >= 0 ? "+" : "") + rTFMapLevel + " " + rTFSpecial + ")" + (game.global.mapRunCounter == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime)) + " to complete on zone " + game.global.world + ".")
					if (rTFautoLevel !== Infinity) rTFautoLevel = Infinity;
					currTime = 0
					rTFMapRepeats = 0;
					if (rTFAtlantrimp) runAtlantrimp()
					saveSettings();
				}
				if (rTFRepeatCounter > game.global.mapRunCounter)
					rShouldTimeFarm = true;
			}
		}
	}

	//Tribute Farm
	if ((rRunningRegular && autoTrimpSettings.rTributeFarmDefaultSettings.value.active) || (rRunningDaily && autoTrimpSettings.rdTributeFarmDefaultSettings.value.active) || (rRunningC3 && autoTrimpSettings.rc3TributeFarmDefaultSettings.value.active) && rShouldQuest === 0) {
		//Setting up variables and checking if we should use daily settings instead of regular Tribute Farm settings
		var rTrFZone = rRunningC3 ? getPageSetting('rc3TributeFarmZone') : rRunningDaily ? getPageSetting('rdTributeFarmZone') : getPageSetting('rTributeFarmZone');
		if (rTrFZone.includes(game.global.world)) {
			var rTrFIndex = rTrFZone.indexOf(game.global.world);
			var rTrFSettings = rRunningC3 ? autoTrimpSettings.rc3TributeFarmSettings.value[rTrFIndex] : rRunningDaily ? autoTrimpSettings.rdTributeFarmSettings.value[rTrFIndex] : autoTrimpSettings.rTributeFarmSettings.value[rTrFIndex];
			if (rTrFSettings.active && rTrFSettings.done !== totalPortals + "_" + game.global.world && game.global.lastClearedCell + 2 >= rTrFSettings.cell) {

				var rTrFMapLevel = rTrFSettings.level
				rTrFTributes = game.buildings.Tribute.locked == 1 ? 0 : rTrFSettings.tributes;
				rTrFMeteorologists = game.jobs.Meteorologist.locked == 1 ? 0 : rTrFSettings.mets;
				//Figuring out how many Tributes or Meteorologists to farm at your current zone
				var rTrFSpecial = game.global.highestRadonLevelCleared > 83 ? "lsc" : "ssc";
				var rTrFJobRatio = rTrFSettings.jobratio;
				rTrFbuyBuildings = typeof (rTrFSettings.buildings) === 'undefined' ? true : rTrFSettings.buildings;
				rTrFAtlantrimp = typeof (rTrFSettings.atlantrimp) === 'undefined' || !game.mapUnlocks.AncientTreasure.canRunOnce ? false : rTrFSettings.atlantrimp;

				if (rRunningDaily && !(typeof game.global.dailyChallenge.hemmorrhage !== 'undefined' && dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('food'))) rTrFAtlantrimp = false;

				totalTrFCost = 0;
				var tributeCost = 0;
				var metCost = 0;

				if (rTrFSettings.autoLevel) {
					if (rTrFCurrentMap === undefined) {
						if (rTrFautoLevel === Infinity) rTrFautoLevel = autoMapLevel();
						if (rTrFautoLevel !== Infinity && twoSecondInterval) rTrFautoLevel = autoMapLevel();
					}
					if (sixSecondInterval && (autoMapLevel() > rTrFautoLevel)) {
						rTrFautoLevel = autoMapLevel();
					}
					if (rTrFautoLevel !== Infinity) {
						rTrFMapLevel = rTrFautoLevel;
					}
				}

				if (rTrFSettings.mapType === 'Map Count' && rTrFCurrentMap === undefined) {
					var tributeMaps = rTrFTributes;
					var meteorologistMaps = rTrFMeteorologists;
					var tributeTime = tributeMaps * 25
					if (tributeMaps > 4) tributeTime += (Math.floor(tributeMaps / 5) * 45)
					var foodEarneTributes = scaleToCurrentMapLocal(simpleSecondsLocal("food", tributeTime, true, '1'), false, true, rTrFMapLevel);
					rTrFTributesMapCount = game.buildings.Tribute.purchased + calculateMaxAffordLocal(game.buildings.Tribute, true, false, false, false, 1, foodEarneTributes);

					var meteorologistMaps = rTrFMeteorologists;
					var meteorologistTime = meteorologistMaps * 25
					if (meteorologistMaps > 4) meteorologistTime += (Math.floor(meteorologistMaps / 5) * 45)
					var foodEarnedMets = scaleToCurrentMapLocal(simpleSecondsLocal("food", meteorologistTime, true, '1'), false, true, rTrFMapLevel);
					rTrFMeteorologistsMapCount = game.jobs.Meteorologist.owned + calculateMaxAffordLocal(game.jobs.Meteorologist, false, false, true, false, 1, foodEarnedMets);
				}

				if (typeof (rTrFTributesMapCount) !== 'undefined' && rTrFTributesMapCount !== 0) {
					rTrFTributes = rTrFTributesMapCount
				}
				if (typeof (rTrFMeteorologistsMapCount) !== 'undefined' && rTrFMeteorologistsMapCount !== 0) {
					rTrFMeteorologists = rTrFMeteorologistsMapCount
				}
				if (typeof (rTrFMeteorologistsMapCount) !== 'undefined' && rTrFautoLevel !== Infinity) {
					rTrFMapLevel = rTrFautoLevel
				}

				//Identifying how much food you'd get from the amount of jestimps you want to farm on the map level you've selected for them
				if (rRunningDaily && typeof game.global.dailyChallenge.hemmorrhage !== 'undefined' && dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('food')) {
					var foodTotal = null;
					var jestDrop = scaleToCurrentMapLocal(simpleSecondsLocal("food", 45, true, '1'), false, true, rTrFMapLevel);
					var shred = 1 - (dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength)[0] / 100);
					var maps = 10;
					foodTotal = jestDrop;
					//For loop for adding the food from subsequent jestimp kills to the base total
					for (i = 1; i < maps; i++) {
						foodTotal += (jestDrop * (Math.pow(shred, i)));
					}
					tributeShredAmt = game.buildings.Tribute.purchased + calculateMaxAffordLocal(game.buildings.Tribute, true, false, false, false, 1, foodTotal);
					metShredAmt = game.jobs.Meteorologist.owned + calculateMaxAffordLocal(game.jobs.Meteorologist, false, false, true, false, 1, foodTotal);
					if ((foodTotal != null && (rTrFMeteorologists > metShredAmt || rTrFTributes > tributeShredAmt))) {
						if (rTrFMeteorologists > metShredAmt) rTrFMeteorologists = metShredAmt
						if (rTrFTributes > tributeShredAmt) rTrFTributes = tributeShredAmt
					}
				}
				if (rTrFTributes > game.buildings.Tribute.purchased) {
					for (x = 0; x < rTrFTributes - game.buildings.Tribute.purchased; x++) {
						tributeCost += Math.pow(1.05, game.buildings.Tribute.purchased) * 10000
					}
				}
				if (rTrFMeteorologists > game.jobs.Meteorologist.owned) {
					for (x = 0; x < rTrFMeteorologists - game.jobs.Meteorologist.owned; x++) {
						metCost += Math.pow(game.jobs.Meteorologist.cost.food[1], game.jobs.Meteorologist.owned + x) * game.jobs.Meteorologist.cost.food[0]
					}
				}

				totalTrFCost = tributeCost + metCost;

				if (game.global.challengeActive == "Wither" && rTrFMapLevel >= 0)
					rTrFMapLevel = -1;
				if (rTrFTributes > game.buildings.Tribute.purchased || rTrFMeteorologists > game.jobs.Meteorologist.owned) {
					if (rTrFTributes > game.buildings.Tribute.purchased)
						rShouldTributeFarm = true;
					if (rTrFMeteorologists > game.jobs.Meteorologist.owned)
						rShouldMetFarm = true;
				}
				if (!rShouldTimeFarm && totalTrFCost > game.resources.food.owned && game.global.world > 34 && game.mapUnlocks.AncientTreasure.canRunOnce && rTrFAtlantrimp && (rShouldTributeFarm || rShouldMetFarm)) {
					var barnCost = 0;
					//Seconds is 165 due to avg of 5x caches (20s per), 4x chronoimps (5s per), 1x jestimp (45s)
					var resourceFarmed = scaleToCurrentMapLocal(simpleSecondsLocal("food", 165, true, rTrFJobRatio), false, true, rTrFMapLevel);
					if (totalTrFCost > (game.resources.food.max * (1 + (game.portal.Packrat.modifier * game.portal.Packrat.radLevel))))
						barnCost += game.buildings.Barn.cost.food()
					totalTrFCost += barnCost;

					if ((totalTrFCost > game.resources.food.owned - barnCost + resourceFarmed) && game.resources.food.owned > totalTrFCost / 2) {
						if (game.global.mapsActive && getCurrentMapObject().name !== 'Atlantrimp') {
							mapsClicked();
							recycleMap();
						}
						if (game.global.preMapsActive) {
							for (var map in game.global.mapsOwnedArray) {
								if (game.global.mapsOwnedArray[map].name == 'Atlantrimp') {
									selectMap(game.global.mapsOwnedArray[map].id)
									rRunMap();
									debug('Running Atlamtrimp');
								}
							}
						}
					}
				}
				//Recycles map if we don't need to finish it for meeting the tribute/meteorologist requirements
				if (!rShouldTributeFarm && !rShouldMetFarm && rTrFCurrentMap != undefined) {
					var mapProg = game.global.mapsActive ? ((getCurrentMapCell().level - 1) / getCurrentMapObject().size) : 0;
					if (getPageSetting('rMapRepeatCount')) {
						debug("Tribute Farm took " + (game.global.mapRunCounter + mapProg) + " (" + (rTrFMapLevel >= 0 ? "+" : "") + rTrFMapLevel + " " + rTrFSpecial + ")" + (game.global.mapRunCounter == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime)) + " to complete on zone " + game.global.world + ". You ended it with " + game.buildings.Tribute.purchased + " tributes and " + game.jobs.Meteorologist.owned + " meteorologists.")
					}
					currTime = 0
					if (typeof (rTrFTributesMapCount) !== 'undefined' && rTrFTributesMapCount !== 0) rTrFTributesMapCount = 0;
					if (typeof (rTrFMeteorologistsMapCount) !== 'undefined' && rTrFMeteorologistsMapCount !== 0) rTrFMeteorologistsMapCount = 0;
					if (typeof (rTrFautoLevel) !== 'undefined' && rTrFautoLevel !== Infinity) rTrFautoLevel = Infinity;
					rTrFSettings.done = totalPortals + "_" + game.global.world;
					if (game.global.mapsActive) {
						mapsClicked();
						recycleMap();
					}
					rTrFCurrentMap = undefined;
					if (document.getElementById('autoStructureBtn').classList.contains("enabled") && !getAutoStructureSetting().enabled)
						toggleAutoStructure();
				}
			}
		}
	}

	//Smithy Farming
	if (game.buildings.Smithy.locked == 0 && game.global.challengeActive !== 'Transmute' && ((rRunningRegular && autoTrimpSettings.rSmithyFarmDefaultSettings.value.active && game.global.challengeActive !== 'Quest') || (rRunningDaily && autoTrimpSettings.rdSmithyFarmDefaultSettings.value.active) || (rRunningC3 && autoTrimpSettings.rc3SmithyFarmDefaultSettings.value.active && game.global.challengeActive !== 'Quest') || (game.global.challengeActive === 'Quest' && rShouldQuest === 10))) {
		//Setting up variables and checking if we should use daily settings instead of regular Tribute Farm settings
		var rSFZone = game.global.challengeActive == 'Quest' ? [game.global.world] : rRunningC3 ? getPageSetting('rc3SmithyFarmZone') : rRunningDaily ? getPageSetting('rdSmithyFarmZone') : getPageSetting('rSmithyFarmZone');
		if (rSFZone.includes(game.global.world)) {
			var rSFIndex = rSFZone.indexOf(game.global.world);
			var rSFSettings = rRunningC3 ? autoTrimpSettings.rc3SmithyFarmSettings.value[rSFIndex] : rRunningDaily ? autoTrimpSettings.rdSmithyFarmSettings.value[rSFIndex] : autoTrimpSettings.rSmithyFarmSettings.value[rSFIndex];
			var rSFCell = game.global.challengeActive == 'Quest' ? 81 : rSFSettings.cell
			if (rSFSettings.active && game.global.lastClearedCell + 2 >= rSFCell) {
				var rSFMapLevel = game.global.challengeActive == 'Quest' ? -1 : rSFSettings.level
				if (rSFSettings.autoLevel && rSFCurrentMap === undefined) rSFMapLevel = autoMapLevel();
				rSFSmithies = game.buildings.Smithy.locked == 1 ? 0 : game.global.challengeActive == 'Quest' ? game.buildings.Smithy.purchased + 1 : rSFSettings.repeat;

				if (rSFSettings.autoLevel) {
					if (rSFCurrentMap === undefined) {
						if (rSFautoLevel === Infinity) rSFautoLevel = autoMapLevel();
						if (rSFautoLevel !== Infinity && twoSecondInterval) rSFautoLevel = autoMapLevel();
					}
					if (sixSecondInterval && (autoMapLevel() > rSFautoLevel)) {
						rSFautoLevel = autoMapLevel();
					}
					if (rSFautoLevel !== Infinity) {
						rSFMapLevel = rSFautoLevel;
					}
				}
				//Checking for daily resource shred
				if (typeof game.global.dailyChallenge.hemmorrhage !== 'undefined' && (dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('wood') || dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('metal'))) {
					var rSFSpecialTime = game.global.highestRadonLevelCleared > 83 ? 20 : 10;

					if (dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('wood') && dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('metal')) {
						var woodGain = Infinity
						var metalGain = scaleToCurrentMapLocal(simpleSecondsLocal("metal", rSFSpecialTime, true, '0,0,1,0'), false, true, rSFMapLevel)
					}
					else if (dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('wood')) {
						var woodGain = scaleToCurrentMapLocal(simpleSecondsLocal("wood", (rSFSpecialTime * 2) + 45, true, '0,1,0,0'), false, true, rSFMapLevel)
						var metalGain = Infinity;
					}
					else if (dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('metal')) {
						var woodGain = Infinity;
						var metalGain = scaleToCurrentMapLocal(simpleSecondsLocal("metal", (rSFSpecialTime * 2) + 45, true, '0,0,1,0'), false, true, rSFMapLevel)
					}
					var smithy_pet = game.buildings.Smithy.cost.gems[1];
					var smithycost = [getMaxAffordable(Math.pow((smithy_pet), game.buildings.Smithy.owned) * game.buildings.Smithy.cost.gems[0], (Infinity), (smithy_pet), true),
					getMaxAffordable(Math.pow((smithy_pet), game.buildings.Smithy.owned) * game.buildings.Smithy.cost.metal[0], (woodGain), (smithy_pet), true),
					getMaxAffordable(Math.pow((smithy_pet), game.buildings.Smithy.owned) * game.buildings.Smithy.cost.wood[0], (metalGain), (smithy_pet), true)]
					var smithyAmt = game.buildings.Smithy.purchased + Math.min(smithycost[0], smithycost[1], smithycost[2])
					rSFSmithies = smithyAmt > 0 && rSFSmithies > smithyAmt ? smithyAmt : rSFSmithies;
				}

				var rSFSpecial = game.global.highestRadonLevelCleared > 63 ? "hc" : "lc";
				var rSFJobRatio = '1,1,1,0';
				rSFGoal = 0;

				var smithyGemCost = getBuildingItemPrice(game.buildings.Smithy, 'gems', false, rSFSmithies - game.buildings.Smithy.purchased);
				var smithyWoodCost = getBuildingItemPrice(game.buildings.Smithy, 'wood', false, rSFSmithies - game.buildings.Smithy.purchased);
				var smithyMetalCost = getBuildingItemPrice(game.buildings.Smithy, 'metal', false, rSFSmithies - game.buildings.Smithy.purchased);

				if (game.global.challengeActive == "Wither" && rSFMapLevel >= 0)
					rSFMapLevel = -1;

				if (rSFSmithies > game.buildings.Smithy.purchased) {
					if (smithyGemCost > game.resources.gems.owned) {
						rShouldSmithyGemFarm = true;
						rSFSpecial = game.global.highestRadonLevelCleared > 83 ? "lsc" : "ssc";
						rSFJobRatio = '1,0,0,0';
						rSFGoal = smithyGemCost.toExponential(2) + ' gems.'
					}
					else if (smithyWoodCost > game.resources.wood.owned) {
						rShouldSmithyWoodFarm = true;
						rSFSpecial = game.global.highestRadonLevelCleared > 83 ? "lwc" : "swc";
						rSFJobRatio = '0,1,0,0';
						rSFGoal = smithyWoodCost.toExponential(2) + ' wood.'
					}
					else if (smithyMetalCost > game.resources.metal.owned) {
						rShouldSmithyMetalFarm = true;
						rSFSpecial = game.global.highestRadonLevelCleared > 83 ? "lmc" : "smc";
						rSFJobRatio = '0,0,1,0';
						rSFGoal = smithyMetalCost.toExponential(2) + ' metal.'
					}
					rShouldSmithyFarm = true;
				}

				if (rShouldSmithyFarm && !rShouldTimeFarm && !rShouldTributeFarm && !rShouldMetFarm && game.global.mapsActive && getCurrentMapObject().bonus !== undefined) {
					if ((!rShouldSmithyGemFarm && getCurrentMapObject().bonus.includes('sc')) || (!rShouldSmithyWoodFarm && getCurrentMapObject().bonus.includes('wc')) || (!rShouldSmithyMetalFarm && getCurrentMapObject().bonus.includes('mc'))) {
						if (getCurrentMapObject().bonus === 'lsc' || getCurrentMapObject().bonus === 'ssc') smithyMapCount[0] = game.global.mapRunCounter + (game.global.mapsActive ? (getCurrentMapCell().level - 1) / getCurrentMapObject().size : 0);
						else if (getCurrentMapObject().bonus === 'lwc' || getCurrentMapObject().bonus === 'swc') smithyMapCount[1] = game.global.mapRunCounter + (game.global.mapsActive ? (getCurrentMapCell().level - 1) / getCurrentMapObject().size : 0);
						else if (getCurrentMapObject().bonus === 'lmc' || getCurrentMapObject().bonus === 'smc') smithyMapCount[2] = game.global.mapRunCounter + (game.global.mapsActive ? (getCurrentMapCell().level - 1) / getCurrentMapObject().size : 0);
						mapsClicked();
						recycleMap();
					}
				}

				//Recycles map if we don't need to finish it for meeting the tribute/meteorologist requirements
				if (!rShouldTributeFarm && !rShouldMetFarm && !rShouldSmithyFarm && rSFCurrentMap != undefined) {
					if (game.global.mapsActive) {
						if (getCurrentMapObject().bonus === 'lsc' || getCurrentMapObject().bonus === 'ssc') smithyMapCount[0] = game.global.mapRunCounter + (game.global.mapsActive ? (getCurrentMapCell().level - 1) / getCurrentMapObject().size : 0);
						else if (getCurrentMapObject().bonus === 'lwc' || getCurrentMapObject().bonus === 'swc') smithyMapCount[1] = game.global.mapRunCounter + (game.global.mapsActive ? (getCurrentMapCell().level - 1) / getCurrentMapObject().size : 0);
						else if (getCurrentMapObject().bonus === 'lmc' || getCurrentMapObject().bonus === 'smc') smithyMapCount[2] = game.global.mapRunCounter + (game.global.mapsActive ? (getCurrentMapCell().level - 1) / getCurrentMapObject().size : 0);
						mapsClicked();
						recycleMap();
					}
					if (getPageSetting('rMapRepeatCount'))
						debug("Smithy Farm took " + smithyMapCount[0] + " food map" + (smithyMapCount[0] === 1 ? ", " : "s, ") + smithyMapCount[1] + " wood map" + (smithyMapCount[1] === 1 ? ", " : "s, ") + smithyMapCount[2] + " metal map" + (smithyMapCount[2] === 1 ? " " : "s ") + " (" + (rSFMapLevel >= 0 ? "+" : "") + rSFMapLevel + ")" + " and " + formatTimeForDescriptions(timeForFormatting(currTime)) + " to complete on z" + game.global.world + ". You ended it with " + game.buildings.Smithy.purchased + " smithies.")
					currTime = 0
					rSFCurrentMap = undefined;
					if (typeof (rSFautoLevel) !== 'undefined' && rSFautoLevel !== Infinity) rSFautoLevel = Infinity;
					if (document.getElementById('autoStructureBtn').classList.contains("enabled") && !getAutoStructureSetting().enabled)
						toggleAutoStructure();
					smithyMapCount = [0, 0, 0]
				}
			}
		}
	}

	//Unbalance & Storm Destacking
	if ((getPageSetting('rUnbalance') && game.global.challengeActive == "Unbalance") || (getPageSetting('Rstormon') && game.global.challengeActive == "Storm")) {
		//Setting up variables
		var rUnbalanceZone = getPageSetting('rUnbalanceZone') > 0 ? getPageSetting('rUnbalanceZone') : Infinity;
		var rUnbalanceStacks = getPageSetting('rUnbalanceStacks') > 0 ? getPageSetting('rUnbalanceStacks') : Infinity;
		var rStormZone = getPageSetting('rStormZone') > 0 ? getPageSetting('rStormZone') : Infinity;
		var rStormStacks = getPageSetting('rStormStacks') > 0 ? getPageSetting('rStormStacks') : Infinity;
		if (game.global.challengeActive == "Unbalance") rShouldUnbalance = (game.global.world >= rUnbalanceZone && (game.challenges.Unbalance.balanceStacks >= rUnbalanceStacks || (getPageSetting('rUnbalanceImprobDestack') && game.global.lastClearedCell + 2 == 100 && game.challenges.Unbalance.balanceStacks != 0)));
		if (game.global.challengeActive == "Storm") rShouldStorm = (game.global.world >= rStormZone && (game.challenges.Storm.beta >= rStormStacks && game.challenges.Storm.beta != 0));
		//Recycles the map we're running if you have 0 stacks of balance and the map is level 6 as that's the only time we should be running a map at this level.
		if (((game.global.challengeActive == "Unbalance" && !rShouldUnbalance && game.challenges.Unbalance.balanceStacks == 0) || (game.global.challengeActive == "Storm" && !rShouldStorm && game.challenges.Storm.beta == 0)) && game.global.mapsActive && getCurrentMapObject().level == 6) {
			mapsClicked();
			recycleMap();
		}
	}

	//Smithless
	if ((game.global.challengeActive == "Smithless")) {
		//Setting up variables
		if (game.global.world % 25 === 0 && game.global.lastClearedCell == -1 && game.global.gridArray[0].ubersmith) {
			var name = game.global.gridArray[0].name
			var equalityAmt = equalityQuery(true, true, name, game.global.world, 1, 'world', 1, false, true)
			var ourDmg = (RcalcOurDmg('min', equalityAmt, false, true, false, false, true));
			var enemyHealth = RcalcEnemyHealthMod(game.global.world, 1, name, 'world', true);
			enemyHealth *= 3e15;
			var stacksRemaining = 10 - game.challenges.Smithless.uberAttacks;
			var gammaDmg = gammaBurstPct;

			if ((ourDmg * 2 + (ourDmg * gammaDmg * 2)) < enemyHealth) {
				if (game.global.mapBonus != 10)
					rShouldSmithless = true;
				else if (!(game.portal.Tenacity.getMult() === Math.pow(1.4000000000000001, getPerkLevel("Tenacity") + getPerkLevel("Masterfulness"))))
					rShouldSmithless = true;
			}

			if (rShouldSmithless) {
				if (rSmithlessautoLevel === Infinity) rSmithlessautoLevel = game.global.mapBonus != 10 ? autoMapLevel(10, 0, true) : autoMapLevel();
			}
			if (sixSecondInterval && (game.global.mapBonus != 10 ? autoMapLevel(10, 0, true) : autoMapLevel() > rSmithlessautoLevel)) {
				rSmithlessautoLevel = game.global.mapBonus != 10 ? autoMapLevel(10, 0, true) : autoMapLevel();
			}
			if (rSmithlessautoLevel !== Infinity) {
				rSmithlessMapLevel = rSmithlessautoLevel;
			}
		}
	}

	//Prestige Raiding
	if ((rRunningRegular && autoTrimpSettings.rRaidingDefaultSettings.value.active) || (rRunningDaily && autoTrimpSettings.rdRaidingDefaultSettings.value.active) || (rRunningC3 && autoTrimpSettings.rc3RaidingDefaultSettings.value.active) && rShouldQuest === 0) {

		//if (getPageSetting('RAMPraid') && (game.global.challengeActive != "Daily") || (getPageSetting('RAMPdraid') && game.global.challengeActive == "Daily")) {
		var rRaidingZone = rRunningC3 ? getPageSetting('rc3RaidingZone') : rRunningDaily ? getPageSetting('rdRaidingZone') : getPageSetting('rRaidingZone');
		if (rRaidingZone.includes(game.global.world)) {
			rShouldPrestigeRaid = false;
			//Setting up variables and checking if we should use daily settings instead of normal Prestige Farm settings
			var rRaidingIndex = rRaidingZone.indexOf(game.global.world);
			var rRaidingSettings = rRunningC3 ? autoTrimpSettings.rc3RaidingSettings.value[rRaidingIndex] : rRunningDaily ? autoTrimpSettings.rdRaidingSettings.value[rRaidingIndex] : autoTrimpSettings.rRaidingSettings.value[rRaidingIndex];
			if (rRaidingSettings.active) {
				var rRaidingDefaultSettings = rRunningC3 ? autoTrimpSettings.rc3RaidingDefaultSettings.value : rRunningDaily ? autoTrimpSettings.rdRaidingDefaultSettings.value : autoTrimpSettings.rRaidingDefaultSettings.value;
				var rPRCell = rRaidingSettings.cell;
				raidzones = rRaidingSettings.raidingzone;
				var rPRRecycle = rRaidingDefaultSettings.recycle;
				var rPRFragFarm = rRaidingSettings.raidingDropdown;

				if (game.global.lastClearedCell + 2 >= rPRCell && Rgetequips(raidzones, false) > 0) {
					rShouldPrestigeRaid = true;
				}
			}
			//Resetting variables and recycling the maps used
			if (!rShouldPrestigeRaid && (RAMPrepMap[0] != undefined || RAMPrepMap[1] != undefined || RAMPrepMap[2] != undefined || RAMPrepMap[3] != undefined || RAMPrepMap[4] != undefined)) {
				RAMPfragmappy = undefined;
				RAMPprefragmappy = undefined;
				RAMPfragmappybought = false;
				for (var x = 0; x < 5; x++) {
					RAMPpMap[x] = undefined;
					RAMPmapbought[x] = undefined;

					if (RAMPrepMap[x] != undefined) {
						if (rPRRecycle) {
							recycleMap(getMapIndex(RAMPrepMap[x]));
						}
						RAMPrepMap[x] = undefined;
					}
				}
			}
		}
	}

	//Worshipper Farm -- Think there's an issue with variable setup here
	if (game.jobs.Worshipper.locked == 0 && autoTrimpSettings.rShipFarmDefaultSettings.value.active && rShouldQuest === 0) {
		var shipfarmzone = getPageSetting('rShipFarmZone');
		if (shipfarmzone.includes(game.global.world) && game.jobs.Worshipper.owned != 50) {
			var shipamountfarmindex = shipfarmzone.indexOf(game.global.world);
			var rShipFarmSettings = autoTrimpSettings.rShipFarmSettings.value[shipamountfarmindex];
			var shipfarmcell = rShipFarmSettings.cell
			if (rShipFarmSettings.active && game.global.lastClearedCell + 2 >= shipfarmcell) {
				var ships = game.jobs.Worshipper.owned;
				shipfarmamount = rShipFarmSettings.worshipper;
				var shippluslevel = rShipFarmSettings.level;
				var rShipJobRatio = rShipFarmSettings.jobratio;
				if (game.global.challengeActive == "Wither" && shippluslevel >= 0)
					shippluslevel = -1;
				var shipspecial = game.global.highestRadonLevelCleared > 83 ? "lsc" : "ssc";
				if (game.jobs.Worshipper.owned != 50 && game.stats.zonesCleared.value != worshipperdebug && (scaleToCurrentMapLocal(simpleSecondsLocal("food", 20, true, rShipJobRatio), false, true, shippluslevel) <= (game.jobs.Worshipper.getCost() * 10))) {
					debug("Skipping Worshipper farming on zone " + game.global.world + " as it costs more than a " + shipspecial + " map, evaluate your map settings to correct this")
					worshipperdebug = game.stats.zonesCleared.value;
				}
				if (shipfarmamount > ships && (scaleToCurrentMapLocal(simpleSecondsLocal("food", 20, true,), false, true, shippluslevel) >= (game.jobs.Worshipper.getCost() * 10)))
					rShouldWorshipperFarm = true;

				if (rWorshipperCurrentMap != undefined && !rShouldWorshipperFarm) {
					rWorshipperCurrentMap = undefined;
					if (getPageSetting('rMapRepeatCount')) debug("Worshipper Farm took " + (game.global.mapRunCounter) + (game.global.mapRunCounter == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime)) + " to complete on zone " + game.global.world + ".")
					currTime = 0
				}
			}
		}
	}

	//Quagmire - Black Bogs
	if (game.global.challengeActive == "Quagmire" && autoTrimpSettings.rQuagDefaultSettings.value.active) {
		Rshoulddobogs = false;
		var bogzone = getPageSetting('rQuagZone');
		if (bogzone.includes(game.global.world)) {
			var bogindex = bogzone.indexOf(game.global.world);
			var rQuagSettings = autoTrimpSettings.rQuagSettings.value[bogindex];
			var bogcell = rQuagSettings.cell;
			var bogamount = rQuagSettings.bogs;
			stacksum = 0;

			for (var i = 0; i < (bogindex + 1); i++) {
				stacksum += parseInt(bogamount[i]);
			}

			var totalstacks = 100 - stacksum;

			if (rQuagSettings.active && game.global.lastClearedCell + 2 >= bogcell) {
				if ((game.challenges.Quagmire.motivatedStacks > totalstacks))
					Rshoulddobogs = true;

				if (rBlackBogCurrentMap != undefined && !Rshoulddobogs) {
					rBlackBogCurrentMap = undefined;
					if (getPageSetting('rMapRepeatCount')) debug("Black Bog Farm took " + (game.global.mapRunCounter) + (game.global.mapRunCounter == 1 ? " map" : " maps") + " to complete on zone " + game.global.world + ".")
				}
			}
		}
	}

	//Mayhem -- Have altered it, needs tested on a proper save!
	if (game.global.challengeActive == "Mayhem" && getPageSetting('rMayhem')) {
		var destackHits = getPageSetting('rMayhemDestack') > 0 ? getPageSetting('rMayhemDestack') : Infinity;
		var destackZone = getPageSetting('rMayhemZone') > 0 ? getPageSetting('rMayhemZone') : Infinity;
		if (game.challenges.Mayhem.stacks > 0 && (HDRatio * 4 > destackHits || game.global.world >= destackZone))
			rShouldMayhem = true;

		if (rShouldMayhem) {
			rMayhemSpecial = (Math.floor(game.global.highestRadonLevelCleared + 1) * (hyperspeed2 / 100) >= game.global.world ? "lmc" : "fa");
			rMayhemMapLevel = autoMapLevel(10, 0, true, rMayhemSpecial);
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

			if (game.global.world >= stormzone && HDRatio > stormHDmult) Rshouldstormfarm = true;
		}
	}

	//Insanity Farm
	if (game.global.challengeActive == "Insanity" && autoTrimpSettings.rInsanityDefaultSettings.value.active) {
		var rIFZone = getPageSetting('rInsanityZone');

		if (rIFZone.includes(game.global.world)) {
			var rIFIndex = rIFZone.indexOf(game.global.world);
			var rIFSettings = autoTrimpSettings.rInsanitySettings.value[rIFIndex];
			var rIFCell = rIFSettings.cell;

			if (rIFSettings.active && game.global.lastClearedCell + 2 >= rIFCell) {
				var rIFMapLevel = rIFSettings.level;
				var rIFSpecial = rIFSettings.special;
				rIFStacks = rIFSettings.insanity;
				var rIFJobRatio = rIFSettings.jobratio;

				if (rIFStacks > game.challenges.Insanity.maxInsanity)
					rIFStacks = game.challenges.Insanity.maxInsanity;
				if (rIFStacks >= game.challenges.Insanity.insanity)
					rShouldInsanityFarm = true;

				if (rInsanityCurrentMap != undefined && !rShouldInsanityFarm) {
					rInsanityCurrentMap = undefined;
					if (getPageSetting('rMapRepeatCount')) debug("Insanity Farm took " + (game.global.mapRunCounter) + (game.global.mapRunCounter == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime)) + " to complete on zone " + game.global.world + ".")
					currTime = 0
				}
			}
		}
	}

	//Pandemonium
	if (game.global.challengeActive == "Pandemonium" && getPageSetting('RPandemoniumOn')) {
		rShouldPandemoniumDestack = false;
		rShouldPandemoniumFarm = false;
		rShouldPandemoniumJestimpFarm = false;
		if (game.challenges.Pandemonium.pandemonium > 0 && game.global.world >= getPageSetting('RPandemoniumZone') && getPageSetting('RPandemoniumMaps')) {
			rShouldPandemoniumDestack = true;
		}
		//Pandemonium destacking settings
		if (rShouldPandemoniumDestack && getPageSetting('RPandemoniumMaps')) {
			pandspecial = (Math.floor(game.global.highestRadonLevelCleared + 1) * (hyperspeed2 / 100) >= game.global.world ? "lmc" : game.challenges.Pandemonium.pandemonium > 7 ? "fa" : "lmc");
			gammaburstmult = getPageSetting('RPandemoniumHits') < 5 && (RcalcOurHealth() / RcalcBadGuyDmg(null, RgetEnemyAvgAttack(game.global.world, 20, 'Snimp'))) >= 5 ? (1 + (gammaBurstPct)) : 1;
			hitsmap = getPageSetting('RPandemoniumHits') > 0 ? getPageSetting('RPandemoniumHits') : 10;
			hitssurv = getPageSetting('RPandemoniumHits') < 5 ? getPageSetting('RPandemoniumHits') : 5;
			go = false;

			for (var i = 10; 0 < i; i--) {
				if (!go) {
					mlevels = i;
					if ((game.resources.fragments.owned >= PerfectMapCost(mlevels, pandspecial)) && ((RcalcEnemyBaseHealth("map", game.global.world + mlevels, 20, 'Turtlimp') * game.challenges.Pandemonium.getPandMult() * 0.75) <= ((RcalcOurDmg("avg", false, true, true) / gammaburstmult) * 1.5 * hitsmap))
						&& (((((RcalcBadGuyDmg(null, RgetEnemyAvgAttack((game.global.world + mlevels), 20, 'Snimp')) * 1.5)) * (hitssurv)) <= (RcalcOurHealth() * 2)))) {
						if (i > game.challenges.Pandemonium.pandemonium) {
							rPandemoniumMapLevel = game.challenges.Pandemonium.pandemonium;
						} else {
							rPandemoniumMapLevel = mlevels;
						}
						go = true;
					}
				}
				if (!go && i == 1) {
					mlevels = 1;
					rPandemoniumMapLevel = mlevels;
					go = true;
				}
			}
		}

		//AutoEquip settings for Pandemonium.
		if (!rShouldPandemoniumDestack && getPageSetting('RPandemoniumAutoEquip') > 1 && game.global.lastClearedCell + 2 >= 91 && getPageSetting('RPandemoniumAEZone') > 5 && game.global.world >= getPageSetting('RPandemoniumAEZone') && game.global.world != 150) {
			//Initialising Variables
			nextLevelEquipmentCost = null;
			nextEquipmentCost = null;
			nextLevelPrestigeCost = null;
			nextPrestigeCost = null;
			jestMetalTotal = null;
			var prestigeUpgradeName = "";
			var allUpgradeNames = Object.getOwnPropertyNames(game.upgrades);
			//Setting up artisanitry modifier
			var artBoost = Math.pow(1 - game.portal.Artisanistry.modifier, game.portal.Artisanistry.radLevel);
			artBoost *= autoBattle.oneTimers.Artisan.owned ? autoBattle.oneTimers.Artisan.getMult() : 1;
			artBoost *= game.challenges.Pandemonium.getEnemyMult();
			//Working out how much metal a large metal cache or jestimp proc provides.
			amt_cache = getPageSetting('RPandemoniumAutoEquip') > 2 && game.global.world >= getPageSetting('RPandemoniumAEZone') ? simpleSecondsLocal("metal", 40, true, '0.1,0.1,0.1,0.001') :
				simpleSecondsLocal("metal", 20, true, '0.1,0.1,0.1,0.001');
			//Looping through each piece of equipment
			for (var equipName in game.equipment) {
				if (!game.equipment[equipName].locked) {
					//Checking cost of next equipment level. Blocks unavailable ones.
					if (game.challenges.Pandemonium.isEquipBlocked(equipName) || RequipmentList[equipName].Resource == 'wood') continue;
					nextLevelEquipmentCost = game.equipment[equipName].cost[RequipmentList[equipName].Resource][0] * Math.pow(game.equipment[equipName].cost[RequipmentList[equipName].Resource][1], game.equipment[equipName].level) * artBoost;
					//Sets nextEquipmentCost to the price of an equip if it costs less than the current value of nextEquipCost
					if (nextLevelEquipmentCost < nextEquipmentCost || nextEquipmentCost == null)
						nextEquipmentCost = nextLevelEquipmentCost;
					//Checking cost of prestiges if any are available to purchase
					for (var upgrade of allUpgradeNames) {
						if (game.upgrades[upgrade].prestiges === equipName) {
							prestigeUpgradeName = upgrade;
							//Checking if prestiges are purchasable
							if (game.challenges.Pandemonium.isEquipBlocked(game.upgrades[upgrade].prestiges) || game.upgrades[prestigeUpgradeName].locked) continue;
							nextLevelPrestigeCost = getNextPrestigeCost(prestigeUpgradeName) * artBoost;
							//Sets nextPrestigeCost to the price of an equip if it costs less than the current value of nextEquipCost
							if (nextLevelPrestigeCost < nextPrestigeCost || nextPrestigeCost == null)
								nextPrestigeCost = nextLevelPrestigeCost;
						}
					}
				}
			}

			//Identifying how much metal you'd get from the amount of jestimps you want to farm on the map level you've selected for them
			if (getPageSetting('RPandemoniumAutoEquip') > 3 && !rShouldPandemoniumFarm && game.global.world >= getPageSetting('RPandemoniumJestZone')) {
				var jestMapLevel = getPageSetting('PandemoniumJestFarmLevel');
				var jestDrop = scaleToCurrentMapLocal(simpleSecondsLocal("metal", 45, true, '10,10,100,1'), false, true, jestMapLevel);
				var shred = 1 - (0.75 - (jestMapLevel * 0.05));
				var kills = getPageSetting('PandemoniumJestFarmKills');
				jestMetalTotal = jestDrop;
				//For loop for adding the metal from subsequent jestimp kills to the base total
				for (i = 1; i < kills; i++) {
					jestMetalTotal += (jestDrop * (Math.pow(shred, i)));
				}
				jestMetalTotal = (jestMetalTotal / 100) * 99
				if ((jestMetalTotal != null && (jestMetalTotal > nextEquipmentCost)) || jestFarmMap == true) {
					rShouldPandemoniumJestimpFarm = true;
					jestFarmMap = true;
					if (!game.global.messages.Loot.exotic)
						game.global.messages.Loot.exotic = true;
				}
			}

			//Switching to Huge Cache maps if LMC maps don't give enough metal for equip levels.
			pandfarmspecial = nextEquipmentCost > scaleToCurrentMapLocal(simpleSecondsLocal("metal", 20, true, '0.1,0.1,0.1,0.001'), false, true, getPageSetting('PandemoniumFarmLevel')) ? "hc" : "lmc";
			//Checking if an equipment level costs less than a cache or a prestige level costs less than a jestimp and if so starts farming.
			if (!rShouldPandemoniumJestimpFarm && nextEquipmentCost < scaleToCurrentMapLocal(amt_cache, false, true, getPageSetting('PandemoniumFarmLevel')))
				rShouldPandemoniumFarm = true;

			if (rPandemoniumCurrentMap != undefined && !rShouldPandemoniumFarm) {
				rPandemoniumCurrentMap = undefined;
				if (getPageSetting('rMapRepeatCount')) debug("Pandemonium Farm took " + (game.global.mapRunCounter) + (game.global.mapRunCounter == 1 ? " map" : " maps") + " to complete on zone " + game.global.world + ".")
			}
		}

		//Pandemonium Jestimp Farm
		if (rShouldPandemoniumJestimpFarm) {
			reloadDelay = false;
			//Saves your savefile to a variable when that variable is null and frenzy is active
			if (game.global.mapsActive && game.global.mapGridArray[0].name == "Jestimp" && ((savefile == null && game.portal.Frenzy.frenzyStarted != -1) || (autoBattle.oneTimers.Mass_Hysteria.owned && game.global.soldierHealth == game.global.soldierHealthMax && game.global.mapGridArray[0].health > 0)))
				savefile = save(true);
			//Makes it take another copy of the save if you lose frenzy before killing the Jestimp.
			if (autoBattle.oneTimers.Mass_Hysteria.owned == false && game.global.mapsActive && game.global.lastClearedMapCell == -1 && game.global.mapGridArray[0].name == "Jestimp" && savefile != null && game.portal.Frenzy.frenzyStarted == -1)
				savefile = null;

			//If the last item in the message log doesn't include the word metal it loads your save to reroll for a metal jestimp drop.
			if (game.global.mapsActive && game.global.lastClearedMapCell != -1) {
				if (document.getElementById("log").lastChild != null) {
					if (!document.getElementById("log").lastChild.innerHTML.includes("metal") && savefile != null) {
						tooltip('Import', null, 'update');
						document.getElementById('importBox').value = savefile;
						cancelTooltip();
						load(true);
						reloadDelay = true;
					}
				}
			}

			if (!game.global.mapsActive || (game.global.mapsActive && (game.global.mapGridArray[0].name != "Jestimp" || game.global.lastClearedMapCell != -1))) {
				//Recycles your map if you are past the first cell
				if (game.global.mapsActive && game.global.lastClearedMapCell != -1) {
					mapsClicked();
					recycleMap();
				}
			}
			//Purchases a perfect map with your Jestimp farming level setting, resets savefile variable to null and runs the map
			if (game.global.preMapsActive) {
				PerfectMapCost(getPageSetting('PandemoniumJestFarmLevel'), 0);
				buyMap();
				savefile = null;
				runMap();
			}
			//Repeats the process of exiting and re-entering maps until the first cell is a Jestimp
			for (i = 0; i < 10000; i++) {
				if (game.global.mapsActive) {
					if (game.global.mapGridArray[game.global.lastClearedMapCell + 1].name != "Jestimp") {
						mapsClicked();
						runMap();
					} else if (game.global.mapGridArray[game.global.lastClearedMapCell + 1].name == "Jestimp")
						break
				}
			}

			//Used to abandon current map once the Jestimp farming on your current zone has finished.
			if (jestMetalTotal != null && jestMetalTotal < nextEquipmentCost && jestFarmMap == true) {
				mapsClicked();
				recycleMap();
				jestFarmMap = false;
			}
		}
	}

	//Alchemy Farm
	if (game.global.challengeActive == "Alchemy" && autoTrimpSettings.rAlchDefaultSettings.value.active) {
		alchfarmzone = getPageSetting('rAlchZone');
		if (alchfarmzone.includes(game.global.world)) {
			var alchfarmindex = alchfarmzone.indexOf(game.global.world);
			var rAlchSettings = autoTrimpSettings.rAlchSettings.value[alchfarmindex];
			var alchfarmcell = rAlchSettings.cell;

			if (rAlchSettings.active && game.global.lastClearedCell + 2 >= alchfarmcell) {
				var alchmaplevel = rAlchSettings.level;
				var alchspecial = rAlchSettings.special;
				var rAlchJobRatio = rAlchSettings.jobratio;
				alchpotions = rAlchSettings.potion;

				if (alchpotions != undefined) {
					//Working out which potion the input corresponds to.
					potion = alchpotions.charAt('0') == 'h' ? 0 :
						alchpotions.charAt('0') == 'g' ? 1 :
							alchpotions.charAt('0') == 'f' ? 2 :
								alchpotions.charAt('0') == 'v' ? 3 :
									alchpotions.charAt('0') == 's' ? 4 :
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
					herbtotal = game.herbs[alchObj.potions[potion].cost[0][0]].cowned + (alchObj.getDropRate(game.global.world + alchmaplevel) * alchmult);
					//Looping through each potion level and working out their cost to calc total cost
					for (x = potionscurrent; x < (alchpotions.toString().replace(/[^\d,:-]/g, '')); x++) {
						var potioncost = Math.pow(alchObj.potions[potion].cost[0][2], x) * alchObj.potions[potion].cost[0][1];
						//Checking if the potion being farmed is a Potion and if so factors in compounding cost scaling from other potions owned
						if (!alchObj.potions[potion].enemyMult) {
							var potionsowned = 0;
							//Calculating total level of potions that aren't being farmed
							for (var y = 0; y < alchObj.potionsOwned.length; y++) {
								if (alchObj.potions[y].challenge != (game.global.challengeActive == "Alchemy")) continue;
								if (y != alchObj.potionNames.indexOf(alchObj.potionNames[potion]) && !alchObj.potions[y].enemyMult) potionsowned += alchObj.potionsOwned[y];
							}
							potioncost *= Math.pow(alchObj.allPotionGrowth, potionsowned);
						}
						//Summing cost of potion levels
						potioncosttotal += potioncost;
					}
					if (potion == undefined)
						debug('You have an incorrect value in AF: Potions, each input needs to start with h, g, f, v, or s.');
					else {
						if (alchpotions.toString().replace(/[^\d:-]/g, '') > potionscurrent) {
							if (alchObj.canAffordPotion(alchObj.potionNames[potion])) {
								for (z = potionscurrent; z < alchpotions.toString().replace(/[^\d:-]/g, ''); z++) {
									alchObj.craftPotion(alchObj.potionNames[potion]);
								}
							}
						}
						if (alchpotions.toString().replace(/[^\d,:-]/g, '') > alchObj.potionsOwned[potion])
							Rshouldalchfarm = true;
					}
					if (rAlchemyCurrentMap != undefined && !Rshouldalchfarm) {
						rAlchemyCurrentMap = undefined;
						if (getPageSetting('rMapRepeatCount')) debug("Alchemy Farm took " + (game.global.mapRunCounter) + (game.global.mapRunCounter == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime)) + " to complete on zone " + game.global.world + ".")
						currTime = 0
					}
				}
			}
		}
		if (RdoVoids && game.global.mapsActive) {
			if (getCurrentMapObject().location == "Void" && (alchObj.canAffordPotion('Potion of the Void') || alchObj.canAffordPotion('Potion of Strength'))) {
				alchObj.craftPotion('Potion of the Void');
				alchObj.craftPotion('Potion of Strength');
			}
		}
	}

	//Hypothermia Farm
	if ((game.global.challengeActive == 'Hypothermia' || (autoTrimpSettings.rHypoDefaultSettings.value.packrat && rHypoBuyPackrat)) && autoTrimpSettings.rHypoDefaultSettings.value.active) {
		if (autoTrimpSettings.rHypoDefaultSettings.value.packrat) {
			if (!rHypoBuyPackrat && game.global.challengeActive == 'Hypothermia')
				rHypoBuyPackrat = true;
			if (rHypoBuyPackrat && game.global.challengeActive == '') {
				viewPortalUpgrades();
				numTab(6, true);
				buyPortalUpgrade('Packrat');
				rHypoBuyPackrat = null;
				activateClicked();
			}
		}
		rHFBonfireCostTotal = 0;

		rHFZone = getPageSetting('rHypoZone');
		if (rHFZone.includes(game.global.world)) {
			rHFIndex = rHFZone.indexOf(game.global.world);
			var rHypoSettings = autoTrimpSettings.rHypoSettings.value[rHFIndex];
			var rHFCell = rHypoSettings.cell;

			if (rHypoSettings.active && game.global.lastClearedCell + 2 >= rHFCell) {
				rHFBonfire = rHypoSettings.bonfire;
				rHFSpecial = "lwc";
				var rHFMapLevel = rHypoSettings.level;
				var rHypoJobRatio = rHypoSettings.jobratio;
				rHFBonfiresBuilt = game.challenges.Hypothermia.totalBonfires;
				rHFCurrentCost = 1e8 * (Math.pow(100, game.challenges.Hypothermia.totalBonfires));
				var shedCost = 0;
				//Looping through each bonfire level and working out their cost to calc total cost
				for (x = rHFBonfiresBuilt; x < rHFBonfire; x++) {
					rHFBonfireCost = 1e10 * Math.pow(100, x);
					rHFBonfireCostTotal += rHFBonfireCost;
				}
				if (rHFBonfireCostTotal > (game.resources.wood.max * (1 + (game.portal.Packrat.modifier * game.portal.Packrat.radLevel))))
					shedCost += game.buildings.Shed.cost.wood()
				rHFBonfireCostTotal += shedCost;


				if (rHFBonfireCostTotal > game.resources.wood.owned && rHFBonfire > game.challenges.Hypothermia.totalBonfires) {
					rShouldHypoFarm = true;
				}
				if (rHFCurrentMap != undefined && !rShouldHypoFarm) {
					rHFCurrentMap = undefined;
					if (getPageSetting('rMapRepeatCount')) debug("Hypothermia took " + (game.global.mapRunCounter) + (game.global.mapRunCounter == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(currTime)) + " to complete on zone " + game.global.world + ".")
					currTime = 0
				}
			}
		}
	}

	//Equip Farming
	if (getPageSetting('Requipfarmon') && rShouldQuest === 0) {
		Requipfarm = (getPageSetting('Requipfarmon') == true && (getPageSetting('Requipfarmzone') > 0 && getPageSetting('RequipfarmHD') > 0 && getPageSetting('Requipfarmmult') > 0));
		if (Requipfarm) {
			var equipfarmzone = getPageSetting('Requipfarmzone');
			var metal = game.resources.metal.owned
			var metalneeded = estimateEquipsForZone()[0];
			if (game.global.world >= equipfarmzone && metal < metalneeded) rShouldEquipFarm = true;
		}

		var equipminus = 0;
		if (rShouldEquipFarm) {
			equipminus = 0;
			var hits = (getPageSetting('Requipfarmhits') > 0) ? getPageSetting('Requipfarmhits') : 10;
			var hitssurv = (getPageSetting('Rhitssurvived') > 0) ? getPageSetting('Rhitssurvived') : 1;
			var mlevels = 0;
			var go = false;

			for (var i = -1; -7 < i; i--) {
				if (!go) {
					mlevels = i;
					if (
						((RcalcEnemyHealth(game.global.world + mlevels)) <= (RcalcOurDmg("avg", false, false, true) * hits)) &&
						((((RcalcBadGuyDmg(null, RgetEnemyAvgAttack((game.global.world + mlevels), 20, 'Snimp'))) * 0.8) * (hitssurv)) <= (RcalcOurHealth() * 2))
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
				rBlackBogCurrentMap = 'rBlackBog';
				break;
			} else if (runUniques && theMap.noRecycle && game.global.challengeActive != "Insanity" && !rShouldTimeFarm && !Rshouldalchfarm && !rShouldHypoFarm) {
				if (theMap.name == 'Big Wall' && !game.upgrades.Bounty.allowed && !game.upgrades.Bounty.done && game.global.highestRadonLevelCleared < 40) {
					if (game.global.world < 8 && (HDRatio > 4 || game.achievements.bigWallTimed.finished == 4)) continue;
					selectedMap = theMap.id;
					break;
				}
				if (theMap.name == 'Dimension of Rage' && document.getElementById("portalBtn").style.display == "none" && game.upgrades.Rage.done == 1) {
					if (game.global.challenge != "Unlucky" && (game.global.world < 16 || HDRatio < 2)) continue;
					selectedMap = theMap.id;
					break;
				}
				//Prismatic Palace
				if (getPageSetting('Rprispalace') && theMap.name == 'Prismatic Palace' && game.mapUnlocks.Prismalicious.canRunOnce) {
					if (game.global.world < 21 || HDRatio > 25) continue;
					selectedMap = theMap.id;
					break;
				}
				//Atlantrimp
				if (theMap.name == 'Atlantrimp' && game.mapUnlocks.AncientTreasure.canRunOnce) {
					var atlantrimp = getPageSetting('RAtlantrimp')[0] > 0 && getPageSetting('RAtlantrimp')[1] >= 0 ? getPageSetting('RAtlantrimp') : [1000, 1000];
					if ((game.global.world >= atlantrimp[0] && ((game.global.lastClearedCell + 2) >= atlantrimp[1]))) {
						selectedMap = theMap.id;
						break;
					}
				}
				//Melting Point
				if (theMap.name == 'Melting Point' && game.mapUnlocks.SmithFree.canRunOnce) {
					var meltingpoint = getPageSetting('RMeltingPoint')[0] > 0 && getPageSetting('RMeltingPoint')[1] >= 0 ? getPageSetting('RMeltingPoint') : [1000, 1000];
					//Checking if we should run melting point for smithies at any point
					var meltsmithy =
						game.global.challengeActive == "Pandemonium" && getPageSetting('RPandemoniumMP') > 0 ? getPageSetting('RPandemoniumMP') :
							rRunningC3 && getPageSetting('c3meltingpoint') > 0 ? getPageSetting('c3meltingpoint') :
								rRunningDaily && getPageSetting('Rdmeltsmithy') > 0 ? getPageSetting('Rdmeltsmithy') :
									rRunningRegular && getPageSetting('Rmeltsmithy') > 0 ? getPageSetting('Rmeltsmithy') :
										0


					if (shredActive && (woodShred || metalShred) && getPageSetting('rdMeltSmithyShred') > 0) getPageSetting('rdMeltSmithyShred');

					if ((game.global.world >= meltingpoint[0] && ((game.global.lastClearedCell + 2) >= meltingpoint[1]) && !game.global.runningChallengeSquared) || (meltsmithy > 0 && meltsmithy <= game.buildings.Smithy.owned)) {
						selectedMap = theMap.id;
						if (rShouldPrestigeRaid && game.global.preMapsActive) debug('Running Melting Point')
						break;
					}
				}
				//Frozen Castle
				if (theMap.name == 'Frozen Castle') {
					var frozencastle = !game.global.challengeActive != 'Hypothermia' && game.global.world >= getPageSetting('rFrozenCastle')[0] && game.global.lastClearedCell + 2 >= getPageSetting('rFrozenCastle')[1];
					var hypothermia = game.global.challengeActive === 'Hypothermia' &&
						game.global.world >= (autoTrimpSettings.rHypoDefaultSettings.value.frozencastle[0] !== undefined ? parseInt(autoTrimpSettings.rHypoDefaultSettings.value.frozencastle[0]) : 200) &&
						game.global.lastClearedCell + 2 >= (autoTrimpSettings.rHypoDefaultSettings.value.frozencastle[1] !== undefined ? parseInt(autoTrimpSettings.rHypoDefaultSettings.value.frozencastle[1]) : 99);

					if (frozencastle || hypothermia) {
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

		if (!Rshouldalchfarm && !rShouldHypoFarm) {
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
			selectedMap = theMap.id;
			break;
		}
		if (RdoVoids && game.global.mapsActive && getCurrentMapObject().location === 'Void') workerRatio = rVMJobRatio;
		rVMCurrentMap = 'Void Map'
		if (currTime === 0) currTime = getGameTime();
	}

	//Automaps

	//Raiding
	if (rShouldPrestigeRaid) {
		if (selectedMap == "world") {
			selectedMap = "createp";
		}
	}

	//Everything else
	if (!rShouldPrestigeRaid && (RdoVoids || RshouldDoMaps || rShouldTimeFarm || rShouldTributeFarm || rShouldMetFarm || rShouldSmithyFarm || rShouldWorshipperFarm || rShouldUnbalance || rShouldStorm || rShouldMayhem || rShouldInsanityFarm || rShouldPandemoniumDestack || rShouldPandemoniumFarm || rShouldPandemoniumJestimpFarm || Rshouldalchfarm || rShouldHypoFarm || rFragmentFarming || rShouldMaxMapBonus || rShouldSmithless || rShouldEquipFarm || rShouldQuest || Rshouldstormfarm)) {
		if (selectedMap == "world") {
			if (!rShouldPrestigeRaid && (rShouldQuest || rShouldTimeFarm || rShouldTributeFarm || rShouldMetFarm || rShouldSmithyFarm || rShouldWorshipperFarm || rShouldUnbalance || rShouldStorm || rShouldMayhem || rShouldInsanityFarm || rShouldPandemoniumDestack || rShouldPandemoniumFarm || rShouldPandemoniumJestimpFarm || Rshouldalchfarm || rShouldHypoFarm || rFragmentFarming || rShouldMaxMapBonus || rShouldSmithless || rShouldEquipFarm)) {
				//Checking hyperspeed 2 percentage
				if (game.global.challengeActive == "Alchemy" && typeof (alchmaplevel) != 'undefined') {
					var alchspecial_alt = (Math.floor((game.global.highestRadonLevelCleared + 1) * (hyperspeed2 / 100)) >= game.global.world && alchspecial.includes('l') && alchspecial.length === 3 && PerfectMapCost(alchmaplevel, alchspecial) >= game.resources.fragments.owned) ? "ssc" :
						alchspecial;
				}
				if (rShouldQuest && rShouldQuest !== 10) {
					questSpecial = rShouldQuest == 1 || rShouldQuest == 4 ? 'lsc' : rShouldQuest == 2 ? 'lwc' : rShouldQuest == 3 || rShouldQuest == 7 ? 'lmc' : 'fa';
					selectedMap = RShouldFarmMapCreation((rShouldQuest !== 6 ? autoMapLevel() : (autoMapLevel() >= 0 ? autoMapLevel() : 0)), questSpecial);
					rHasQuested = true;
				} else if (rShouldTimeFarm) {
					selectedMap = RShouldFarmMapCreation(rTFMapLevel, rTFSpecial);
					rTFCurrentMap = 'rTimeFarm';
					workerRatio = rTFJobRatio;
					if (currTime === 0) currTime = getGameTime();
				} else if (rShouldTributeFarm || rShouldMetFarm) {
					selectedMap = RShouldFarmMapCreation(rTrFMapLevel, rTrFSpecial);
					workerRatio = rTrFJobRatio;
					rTributeFarming = true;
					rTrFCurrentMap = 'rTributeFarm'
					if (currTime === 0) currTime = getGameTime();
				} else if (rShouldSmithyFarm || rShouldQuest === 10) {
					selectedMap = RShouldFarmMapCreation(rSFMapLevel, rSFSpecial);
					workerRatio = rSFJobRatio;
					rSmithyFarming = true;
					rSFCurrentMap = 'rSmithyFarm'
					if (currTime === 0) currTime = getGameTime();
				} else if (rShouldWorshipperFarm) {
					selectedMap = RShouldFarmMapCreation(shippluslevel, shipspecial);
					rWorshipperCurrentMap = "rWorshipperMap";
					workerRatio = rShipJobRatio;
					if (currTime === 0) currTime = getGameTime();
				} else if (rShouldUnbalance || rShouldStorm) {
					selectedMap = RShouldFarmMapCreation(-(game.global.world - 6), "fa");
				} else if (rShouldMayhem) {
					selectedMap = RShouldFarmMapCreation(rMayhemMapLevel, rMayhemSpecial);
				} else if (rShouldInsanityFarm) {
					selectedMap = RShouldFarmMapCreation(rIFMapLevel, rIFSpecial);
					rInsanityCurrentMap = "rInsanity";
					workerRatio = rIFJobRatio;
					if (currTime === 0) currTime = getGameTime();
				} else if (rShouldPandemoniumDestack) {
					selectedMap = RShouldFarmMapCreation(rPandemoniumMapLevel, pandspecial);
				} else if (rShouldPandemoniumFarm) {
					selectedMap = RShouldFarmMapCreation(rPandemoniumMapLevel, pandfarmspecial);
				} else if (rShouldPandemoniumJestimpFarm) {
					selectedMap = RShouldFarmMapCreation(getPageSetting('PandemoniumJestFarmLevel'), '0');
				} else if (Rshouldalchfarm) {
					if ((game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].bonus == alchspecial_alt || game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].bonus == "ssc") && game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].level == game.global.world + alchmaplevel)
						alchspecial_alt = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].bonus;
					if (alchspecial_alt == "ssc" && (game.stats.zonesCleared.value != rAlchSpecialError)) {
						debug("The cost of a perfect LSC map for zone " + game.global.world + " is " + prettify(RShouldFarmMapCost(alchmaplevel, "lsc", alchfarmzone, alchbiome)) + " fragments, you were short by " + (prettify((RShouldFarmMapCost(alchmaplevel, "lsc", alchfarmzone, alchbiome) - game.resources.fragments.owned)) + " fragments."));
						rAlchSpecialError = game.stats.zonesCleared.value;
					}
					selectedMap = RShouldFarmMapCreation(alchmaplevel, alchspecial_alt, alchbiome);
					rAlchemyCurrentMap = "rAlchemy";
					workerRatio = rAlchJobRatio;
					if (currTime === 0) currTime = getGameTime();
				} else if (rShouldHypoFarm) {
					selectedMap = RShouldFarmMapCreation(rHFMapLevel, rHFSpecial);
					rHFCurrentMap = "rHypoFarm";
					workerRatio = rHypoJobRatio;
					if (currTime === 0) currTime = getGameTime();
				} else if (rFragmentFarming) {
					selectedMap = RShouldFarmMapCreation(-1, "fa");
				} else if (rShouldMaxMapBonus) {
					selectedMap = RShouldFarmMapCreation(rMBMapLevel, rMBSpecial);
					rMBCurrentMap = "rMapBonus";
					workerRatio = rMBJobRatio;
					if (currTime === 0) currTime = getGameTime();
				} else if (rShouldSmithless) {
					selectedMap = RShouldFarmMapCreation(rSmithlessMapLevel, 'lmc');
				} else if (rShouldEquipFarm) {
					selectedMap = RShouldFarmMapCreation(equipminus, 'lmc');
					if (currTime === 0) currTime = getGameTime();
				}
				if (getPageSetting('RBuyJobsNew') > 0 && oneSecondInterval)
					RbuyJobs()
			}
			else {
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

	//Setting up map repeat
	if (!game.global.preMapsActive && game.global.mapsActive) {
		if (runningPrestigeMaps && game.global.challengeActive !== 'Trappapalooza' && game.global.challengeActive !== 'Berserk' && game.global.mapsActive && String(getCurrentMapObject().level).slice(-1) === '1' && Rgetequips(getCurrentMapObject().level) === 1 && getCurrentMapObject().bonus !== 'lmc' && game.resources.fragments.owned > PerfectMapCost(getCurrentMapObject().level - game.global.world, 'lmc')) {
			var maplevel = getCurrentMapObject().level
			mapsClicked();
			recycleMap();
			PerfectMapCost(maplevel - game.global.world, "lmc");
			buyMap();
			rRunMap();
			debug("Running LMC map due to only having 1 equip remaining on this map.")
		}
		if ((rShouldPrestigeRaid || (rShouldPrestigeRaid && RAMPfragfarming)) || (rFragmentFarming && (rShouldWorshipperFarm || rShouldInsanityFarm)) ||
			(selectedMap == game.global.currentMapId || (Rshoulddobogs || (!getCurrentMapObject().noRecycle && (RvanillaMapatZone || RdoMaxMapBonus ||
				RshouldFarm || RneedToVoid || rShouldTimeFarm || rShouldTributeFarm || rShouldMetFarm || rShouldSmithyFarm || rShouldPrestigeRaid || rShouldWorshipperFarm || rShouldEquipFarm || rShouldMaxMapBonus || rShouldSmithless || rShouldUnbalance || rShouldStorm || rShouldQuest > 0 || rShouldMayhem > 0 || Rshouldstormfarm || rShouldInsanityFarm || rShouldPandemoniumDestack || rShouldPandemoniumFarm || rShouldPandemoniumJestimpFarm || Rshouldalchfarm || rShouldHypoFarm || rShouldSmithless))))) {
			//Starting with repeat on
			if (!game.global.repeatMap)
				repeatClicked();
			if (rShouldPrestigeRaid && !RAMPfragfarming) {
				if (game.options.menu.repeatUntil.enabled != 2)
					game.options.menu.repeatUntil.enabled = 2;
			} else if (game.options.menu.repeatUntil.enabled != 0) {
				game.options.menu.repeatUntil.enabled = 0;
			}
			if (!rShouldPrestigeRaid && !RAMPfragfarming && !rShouldInsanityFarm && !rFragmentFarming && !Rshoulddobogs && !RshouldDoMaps && !rShouldUnbalance && !rShouldStorm && !rShouldTributeFarm && !rShouldMetFarm && !rShouldSmithyFarm && !rShouldTimeFarm && rShouldQuest <= 0 && rShouldMayhem <= 0 && !Rshouldstormfarm && !rShouldEquipFarm && !rShouldWorshipperFarm && !rFragmentFarming && !rShouldPandemoniumDestack && !rShouldPandemoniumFarm && !rShouldPandemoniumJestimpFarm && !Rshouldalchfarm && !rShouldHypoFarm && !rShouldMaxMapBonus && !RvanillaMapatZone && !rShouldSmithless)
				repeatClicked();
			if (shouldDoHealthMaps && game.global.mapBonus >= getPageSetting('RMaxMapBonushealth') && !rShouldPrestigeRaid) {
				repeatClicked();
				shouldDoHealthMaps = false;
			}
			if (game.global.repeatMap && !rShouldPrestigeRaid) {
				var currentLevel = getCurrentMapObject().level - game.global.world;
				//Void Maps
				if (RneedToVoid && getCurrentMapObject().location !== 'Void')
					repeatClicked();
				//Prestige Raiding
				else if (rShouldPrestigeRaid && RAMPfragfarming && RAMPfrag(raidzones, rPRFragFarm) == true)
					repeatClicked();
				//Quest Farming
				else if (rShouldQuest == 6 && game.global.mapBonus >= 4)
					repeatClicked();
				//Time Farm
				else if (rShouldTimeFarm && (game.global.mapRunCounter + 1 == rTFRepeatCounter || currentLevel !== rTFMapLevel || getCurrentMapObject().bonus !== rTFSpecial)) {
					if (game.global.mapRunCounter + 1 !== rTFRepeatCounter) rTFMapRepeats = game.global.mapRunCounter + 1;
					repeatClicked();
				}
				//Tribute Farm
				else if ((rShouldTributeFarm || rShouldMetFarm) && (currentLevel !== rTrFMapLevel || getCurrentMapObject().bonus !== rTrFSpecial))
					repeatClicked();
				//Smithy Farm
				else if (rShouldSmithyFarm && (currentLevel !== rSFMapLevel || getCurrentMapObject().bonus !== rSFSpecial))
					repeatClicked();
				//Worshipper Farm
				else if (rShouldWorshipperFarm && rFragmentFarming && fragmapcost())
					repeatClicked();
				//Worshipper Farm
				else if (rShouldWorshipperFarm && !rFragmentFarming && (currentLevel !== shippluslevel || getCurrentMapObject().bonus !== shipspecial))
					repeatClicked();
				//Unbalance Destacking
				else if (rShouldUnbalance && ((getCurrentMapObject().size - getCurrentMapCell().level) > game.challenges.Unbalance.balanceStacks || currentLevel !== -(game.global.world - 6) || getCurrentMapObject().bonus !== "fa"))
					repeatClicked();
				//Quagmire
				else if (Rshoulddobogs && (game.global.mapRunCounter + 1 == stacksum || getCurrentMapObject().name !== 'The Black Bog'))
					repeatClicked();
				//Storm Destacking
				else if (rShouldStorm && ((getCurrentMapObject().size - getCurrentMapCell().level) > game.challenges.Storm.beta || currentLevel !== -(game.global.world - 6) || getCurrentMapObject().bonus !== "fa"))
					repeatClicked();
				//Mayhem Destacking
				else if (rShouldMayhem && (currentLevel != rMayhemMapLevel || getCurrentMapObject().bonus !== rMayhemSpecial || (game.challenges.Mayhem.stacks <= rMayhemMapLevel + 1)))
					repeatClicked();
				//Insanity Frag Farm
				else if (rShouldInsanityFarm && rFragmentFarming && game.resources.fragments.owned >= PerfectMapCost(rIFMapLevel, rIFSpecial))
					repeatClicked();
				//Insanity Farm
				else if (rShouldInsanityFarm && (rIFStacks <= game.challenges.Insanity.insanity || currentLevel !== rIFMapLevel || getCurrentMapObject().bonus !== rIFSpecial))
					repeatClicked();
				//Pandemonium Destacking
				else if (rShouldPandemoniumDestack && (currentLevel != rPandemoniumMapLevel || ((game.challenges.Pandemonium.pandemonium - rPandemoniumMapLevel) < rPandemoniumMapLevel)))
					repeatClicked();
				//Pandemonium Farming
				else if (rShouldPandemoniumFarm && ((nextEquipmentCost >= scaleToCurrentMapLocal(amt_cache, false, true, getPageSetting('PandemoniumFarmLevel'))) || currentLevel !== getPageSetting('PandemoniumFarmLevel') || getCurrentMapObject().bonus != pandfarmspecial))
					repeatClicked();
				//Pandemonium Jestimp Farming
				else if (rShouldPandemoniumJestimpFarm && nextEquipmentCost >= jestMetalTotal)
					repeatClicked();
				//Alch
				else if (Rshouldalchfarm && (herbtotal >= potioncosttotal || currentLevel !== alchmaplevel || getCurrentMapObject().bonus !== alchspecial))
					repeatClicked();
				//Hypo
				else if (rShouldHypoFarm && (game.resources.wood.owned > game.challenges.Hypothermia.bonfirePrice || scaleToCurrentMapLocal(simpleSecondsLocal("wood", 20), false, true, rHFMapLevel) + game.resources.wood.owned > rHFBonfireCostTotal || currentLevel !== rHFMapLevel || getCurrentMapObject().bonus !== rHFSpecial))
					repeatClicked();
				//Map Bonus
				else if (rShouldMaxMapBonus && (game.global.mapBonus >= (rMBRepeatCounter - 1) || currentLevel !== rMBMapLevel || getCurrentMapObject().bonus !== rMBSpecial))
					repeatClicked();
				//Smithless Map Bonus
				else if (rShouldSmithless && (currentLevel !== rSmithlessMapLevel || getCurrentMapObject().bonus !== 'lmc'))
					repeatClicked();
				//Equip Farm Bonus
				else if (rShouldEquipFarm && (currentLevel !== equipminus || getCurrentMapObject().bonus !== 'lmc'))
					repeatClicked();
			}
		} else {
			if (game.global.repeatMap) {
				repeatClicked();
			}
		}
	} else if (!game.global.preMapsActive && !game.global.mapsActive) {
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
		document.getElementById("mapLevelInput").value = game.global.world;
		if (selectedMap == "world") {
			mapsClicked();
		} else if (selectedMap == "createp") {
			//Prestige Farming
			var RAMPfragcheck = true;
			if (rPRFragFarm > 0) {
				if (RAMPfrag(raidzones, rPRFragFarm) == true) {
					RAMPfragcheck = true;
					RAMPfragfarming = false;
				} else if (RAMPfrag(raidzones, rPRFragFarm) == false && !RAMPmapbought[0] && !RAMPmapbought[1] && !RAMPmapbought[2] && !RAMPmapbought[3] && !RAMPmapbought[4] && rShouldPrestigeRaid) {
					RAMPfragfarming = true;
					RAMPfragcheck = false;
					if (!RAMPfragcheck && RAMPfragmappy == undefined && !RAMPfragmappybought && game.global.preMapsActive && rShouldPrestigeRaid) {
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
					if (!RAMPfragcheck && game.global.preMapsActive && !game.global.mapsActive && RAMPfragmappybought && RAMPfragmappy != undefined && rShouldPrestigeRaid) {
						debug("Running frag map");
						selectedMap = RAMPfragmappy;
						selectMap(RAMPfragmappy);
						runMap();
						RlastMapWeWereIn = getCurrentMapObject();
						RAMPprefragmappy = RAMPfragmappy;
						RAMPfragmappy = undefined;
					}
					if (!RAMPfragcheck && game.global.mapsActive && RAMPfragmappybought && RAMPprefragmappy != undefined && rShouldPrestigeRaid) {
						if (RAMPfrag(raidzones, rPRFragFarm) == false) {
							if (!game.global.repeatMap) {
								repeatClicked();
							}
						} else if (RAMPfrag(raidzones, rPRFragFarm) == true) {
							if (game.global.repeatMap) {
								repeatClicked();
								mapsClicked();
							}
							if (game.global.preMapsActive && RAMPfragmappybought && RAMPprefragmappy != undefined && rShouldPrestigeRaid) {
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
				raiding = rPRFragFarm == 2 ? RAMPplusPresfragmax : rPRFragFarm == 1 ? RAMPplusPresfragmin : RAMPplusPres
				for (var x = 0; x < 5; x++) {
					if (RAMPfragcheck && RAMPpMap[x] == undefined && !RAMPmapbought[x] && game.global.preMapsActive && rShouldPrestigeRaid && RAMPshouldrunmap(x, raidzones)) {
						raiding(x, raidzones);
						if ((updateMapCost(true) <= game.resources.fragments.owned)) {
							buyMap();
							RAMPmapbought[x] = true;
							if (RAMPmapbought[x]) {
								RAMPpMap[x] = (game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id);
								RAMPMapsRun = x;
								debug("Map " + [(x + 1)] + " bought");
							}
						}
					}
				}

				if (RAMPfragcheck && !RAMPmapbought[0] && !RAMPmapbought[1] && !RAMPmapbought[2] && !RAMPmapbought[3] && !RAMPmapbought[4]) {
					RAMPpMap.fill(undefined);
					debug("Failed to Prestige Raid. Looks like you can't afford to or have no equips to get!");
					rShouldPrestigeRaid = false;
					autoTrimpSettings["RAutoMaps"].value = 0;
				}
				for (var x = RAMPMapsRun; x > -1; x--) {
					if (RAMPfragcheck && game.global.preMapsActive && !game.global.mapsActive && RAMPmapbought[x] && RAMPpMap[x] != undefined && rShouldPrestigeRaid) {
						debug("Running map " + [(RAMPMapsRun - x + 1)]);
						selectedMap = RAMPpMap[x];
						selectMap(RAMPpMap[x]);
						runMap();
						RlastMapWeWereIn = getCurrentMapObject();
						RAMPrepMap[x] = RAMPpMap[x];
						RAMPpMap[x] = undefined;
						runningPrestigeMaps = true;
					}
				}
			}

			if (game.global.preMapsActive && runningPrestigeMaps) runMap()
		} else if (selectedMap == "create") {
			var $mapLevelInput = document.getElementById("mapLevelInput");
			$mapLevelInput.value = game.global.world;
			document.getElementById("advExtraLevelSelect").value = 0;
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
			advSpecialSelect.value = autoTrimpSettings.rMapSpecial.selected;
			if (game.global.challengeActive == 'Transmute' && autoTrimpSettings.rMapSpecial.selected.includes('mc'))
				advSpecialSelect.value = autoTrimpSettings.rMapSpecial.selected.charAt(0) + "sc";
			document.getElementById("advSpecialSelect").value
			updateMapCost();
			if (RshouldFarm || game.global.challengeActive == 'Transmute') {
				biomeAdvMapsSelect.value = game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Sea";
				updateMapCost();
			}

			//Fragment Farming
			//Insanity
			if (rShouldInsanityFarm && getPageSetting('Rinsanityfarmfrag'))
				rFragmentFarm('insanity', rIFMapLevel, "fa");
			//Worshipper
			if (rShouldWorshipperFarm && getPageSetting('Rshipfarmfrag') && game.resources.fragments.owned <= PerfectMapCost(shippluslevel, shipspecial))
				rFragmentFarm('ship', shippluslevel, shipspecial);

			//Map settings for challenges and farming.
			if ((rShouldQuest || rShouldTimeFarm || rShouldTributeFarm || rShouldMetFarm || rShouldSmithyFarm || rShouldWorshipperFarm || rShouldUnbalance || rShouldStorm || rShouldMayhem || rShouldInsanityFarm || rShouldPandemoniumDestack || rShouldPandemoniumFarm || rShouldPandemoniumJestimpFarm || Rshouldalchfarm || rShouldHypoFarm || rShouldMaxMapBonus || rShouldSmithless || rShouldEquipFarm)) {
				biome = game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountain";
				//Any maps
				if (rShouldQuest > 0 && rShouldQuest !== 10) {
					questSpecial = rShouldQuest == 1 || rShouldQuest == 4 ? 'lsc' : rShouldQuest == 2 ? 'lwc' : rShouldQuest == 3 || rShouldQuest == 7 ? 'lmc' : 'fa';
					PerfectMapCost((rShouldQuest !== 6 ? autoMapLevel() : (autoMapLevel() >= 0 ? autoMapLevel() : 0)), questSpecial);
				}
				else if (rShouldTimeFarm) RShouldFarmMapCost(rTFMapLevel, rTFSpecial, rTFZone, biome);
				else if (rShouldTributeFarm || rShouldMetFarm) RShouldFarmMapCost(rTrFMapLevel, rTrFSpecial, rTrFZone, biome);
				else if (rShouldSmithyFarm) RShouldFarmMapCost(rSFMapLevel, rSFSpecial, rSFZone, biome);
				else if (rShouldWorshipperFarm && game.resources.fragments.owned >= RShouldFarmMapCost(shippluslevel, shipspecial)) RShouldFarmMapCost(shippluslevel, shipspecial);
				else if (rShouldUnbalance || rShouldStorm) RShouldFarmMapCost(-(game.global.world - 6), "fa");
				else if (rShouldMayhem) PerfectMapCost(rMayhemMapLevel, rMayhemSpecial, biome);
				else if (rShouldInsanityFarm) PerfectMapCost(rIFMapLevel, rIFSpecial);
				else if (rShouldPandemoniumDestack && getPageSetting('RPandemoniumMaps')) PerfectMapCost(rPandemoniumMapLevel, pandspecial, "Mountain");
				else if (rShouldPandemoniumFarm) PerfectMapCost(getPageSetting('PandemoniumFarmLevel'), pandfarmspecial);
				else if (rShouldPandemoniumJestimpFarm) PerfectMapCost(getPageSetting('PandemoniumJestFarmLevel'), 0)
				else if (Rshouldalchfarm) {
					if ((game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].bonus == alchspecial_alt || game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].bonus == "ssc") && game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].level == game.global.world + alchmaplevel)
						alchspecial_alt = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].bonus;
					RShouldFarmMapCost(alchmaplevel, alchspecial_alt, alchfarmzone, alchbiome);
				}
				else if (rShouldHypoFarm) RShouldFarmMapCost(rHFMapLevel, rHFSpecial, rHFZone, biome);
				else if (rShouldMaxMapBonus) PerfectMapCost(rMBMapLevel, rMBSpecial);
				else if (rShouldSmithless) PerfectMapCost(rSmithlessMapLevel, 'lmc');
				else if (rShouldEquipFarm) PerfectMapCost(equipminus, "lmc");
			}
			if (updateMapCost(true) > game.resources.fragments.owned) {
				if (!RenoughDamage && !rFragmentFarming) decrement.push('diff');
				if (RshouldFarm) decrement.push('size');
			}
			while (!rFragmentFarming && decrement.indexOf('loot') > -1 && lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				lootAdvMapsRange.value -= 1;
			}
			while (!rFragmentFarming && decrement.indexOf('diff') > -1 && difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				difficultyAdvMapsRange.value -= 1;
			}
			while (!rFragmentFarming && decrement.indexOf('size') > -1 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				sizeAdvMapsRange.value -= 1;
			}
			while (!rFragmentFarming && lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				lootAdvMapsRange.value -= 1;
			}
			while (!rFragmentFarming && difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				difficultyAdvMapsRange.value -= 1;
			}
			while (!rFragmentFarming && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
				sizeAdvMapsRange.value -= 1;
			}
			if (advPerfectCheckbox.dataset.checked === 'true' && (sizeAdvMapsRange.value !== '9' || difficultyAdvMapsRange.value !== '9' || lootAdvMapsRange.value !== '9'))
				document.getElementById("advPerfectCheckbox").dataset.checked = false
			var maplvlpicked = parseInt(document.getElementById("mapLevelInput").value);

			if (updateMapCost(true) > game.resources.fragments.owned) {
				selectMap(game.global.mapsOwnedArray[highestMap].id);
				debug("Can't afford the map we designed, #" + maplvlpicked, "maps", '*crying2');
				debug("...selected our highest map instead # " + game.global.mapsOwnedArray[highestMap].id + " Level: " + game.global.mapsOwnedArray[highestMap].level, "maps", '*happy2');
				runMap();
				RlastMapWeWereIn = getCurrentMapObject();
			} else {

				debug("Buying a Map, level: #" + maplvlpicked, "maps", 'th-large');
				if (getPageSetting('SpamFragments') && game.global.preMapsActive) {
					updateMapCost(true)
					debug("Spent " + prettify(updateMapCost(true)) + "/" + prettify(game.resources.fragments.owned) + " (" + ((prettify(updateMapCost(true)) / prettify(game.resources.fragments.owned) * 100).toFixed(2)) + "%) fragments on a " + (advExtraLevelSelect.value >= 0 ? "+" : "") + advExtraLevelSelect.value + " " + (advPerfectCheckbox.dataset.checked === 'true' ? "Perfect " : ("(" + lootAdvMapsRange.value + "," + sizeAdvMapsRange.value + "," + difficultyAdvMapsRange.value + ") ")) + advSpecialSelect.value + " map.")
				}
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
