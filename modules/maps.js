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
	else if (getPageSetting('SkipSpires') == 1 && ((game.global.challengeActive != 'Daily' && isActiveSpireAT()) || (game.global.challengeActive === 'Daily' && disActiveSpireAT()))) status = 'Skipping Spire';
	else if (doMaxMapBonus) status = 'Max Map Bonus After Zone';
	else if (!game.global.mapsUnlocked) status = 'Maps not unlocked!';
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
		game.global.universe === 1 ? document.getElementById('freeVoidMap').innerHTML = "Free void: " + (game.permaBoneBonuses.voidMaps.owned === 10 ? Math.floor(game.permaBoneBonuses.voidMaps.tracker / 10) : game.permaBoneBonuses.voidMaps.tracker / 10) + "/10" : ""
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
	if (game.global.challengeActive === 'Nom' && getPageSetting('FarmWhenNomStacks7')) {
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
			if (game.global.challengeActive === 'Balance') {
				eAttack *= 2;
			}
			if (game.global.challengeActive === 'Toxicity') {
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
	if (!preSpireFarming && getPageSetting('SkipSpires') == 1 && ((game.global.challengeActive != 'Daily' && isActiveSpireAT()) || (game.global.challengeActive === 'Daily' && disActiveSpireAT()))) {
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
	if ((game.global.challengeActive === 'Lead' && !challSQ) && !doVoids && (game.global.world % 2 == 0 || game.global.lastClearedCell < customVars.shouldFarmCell)) {
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
					((game.global.challengeActive === 'Lead' && !challSQ) && game.global.world % 2 == 1) ||
					(!enoughDamage && enoughHealth && game.global.lastClearedCell < 9) ||
					(shouldFarm && game.global.lastClearedCell >= customVars.shouldFarmCell) ||
					(scryerStuck)) &&
				(
					(game.resources.trimps.realMax() <= game.resources.trimps.owned + 1) ||
					((game.global.challengeActive === 'Lead' && !challSQ) && game.global.lastClearedCell > 93) ||
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
			if (shouldFarm || game.global.challengeActive === 'Metal') {
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

//General
var RlastMapWeWereIn = null;
var rVanillaMAZ = false;
var currTime = 0;
//Fragment Farming
var rFragmentFarming = false;

//Prestige
var RAMPfragfarming = false;
var runningPrestigeMaps = false;

//Map Repeats! - Can prolly be consolidated into 1 setting???????
var rMFMapRepeats = 0;
var rTrFMapRepeats = 0;
var rSFMapRepeats = [0, 0, 0];
var smithyMapCount = [0, 0, 0];
var rWFMapRepeats = 0;
var rMBMapRepeats = 0;
var rMayhemMapRepeats = 0;
var rIFMapRepeats = 0;
var rPandemoniumMapRepeats = 0;
var rAFMapRepeats = 0;
var rHFMapRepeats = 0;
var rSmithlessMapRepeats = 0;
var rHDFMapRepeats = 0;

if (getAutoStructureSetting().enabled) {
	document.getElementById('autoStructureBtn').classList.add("enabled")
}

function RupdateAutoMapsStatus(get) {

	var status;

	//Fail Safes 
	if (getPageSetting('RAutoMaps') == 0) status = 'Off';
	//Setting up status
	else if (!game.global.mapsUnlocked) status = 'Maps not unlocked!';
	else if (rVanillaMAZ) status = 'Vanilla MAZ';
	else if (game.global.mapsActive && getCurrentMapObject().name == 'Melting Point') status = 'Melting Point';
	else if (game.global.mapsActive && getCurrentMapObject().name == 'Atlantrimp') status = 'Atlantrimp';
	else if (game.global.mapsActive && getCurrentMapObject().name == 'Frozen Castle') status = 'Frozen Castle';
	else if (rCurrentMap !== '') status = rMapSettings.status;
	//Advancing
	else status = 'Advancing';

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
	//Stops maps from running while doing Atlantrimp.
	if (!game.mapUnlocks.AncientTreasure.canRunOnce) {
		rBSRunningAtlantrimp = false;
		rMFAtlantrimp = false;
		rTrFAtlantrimp = false;
	}

	if (game.global.mapsActive && (getCurrentMapObject().name == 'Atlantrimp' || getCurrentMapObject().name == 'Melting Point' || getCurrentMapObject().name == 'Frozen Castle')) {
		if (game.global.repeatMap) repeatClicked();
		return;
	}

	//Vanilla Map at Zone
	rVanillaMAZ = false;
	if (game.options.menu.mapAtZone.enabled && game.global.canMapAtZone) {
		var nextCell = game.global.lastClearedCell;
		if (nextCell == -1) nextCell = 1;
		else nextCell += 2;
		var totalPortals = getTotalPortals();
		let setZone = game.options.menu.mapAtZone.getSetZone();
		for (var x = 0; x < setZone.length; x++) {
			if (!setZone[x].on) continue;
			if (game.global.world < setZone[x].world || game.global.world > setZone[x].through) continue;
			if (game.global.preMapsActive && setZone[x].done == totalPortals + "_" + game.global.world + "_" + nextCell) continue;
			if (setZone[x].times === -1 && game.global.world !== setZone[x].world) continue;
			if (setZone[x].times > 0 && (game.global.world - setZone[x].world) % setZone[x].times !== 0) continue;
			if (setZone[x].cell === game.global.lastClearedCell + 2) {
				rVanillaMAZ = true;
				if (setZone[x].until == 6) game.global.mapCounterGoal = 25;
				if (setZone[x].until == 7) game.global.mapCounterGoal = 50;
				if (setZone[x].until == 8) game.global.mapCounterGoal = 100;
				if (setZone[x].until == 9) game.global.mapCounterGoal = setZone[x].rx;
				break;
			}
		}

		//Toggle void repeat on if it's disabled.
		if (rVanillaMAZ) {
			if (game.options.menu.repeatVoids.enabled != 1) toggleSetting('repeatVoids');
			return;
		}
	}

	//Failsafes
	if (!game.global.mapsUnlocked || RcalcOurDmg("avg", 0, 'world') <= 0 || questcheck() === 8 || questcheck() === 9) {
		if (game.global.preMapsActive)
			mapsClicked();
		return;
	}

	//New Mapping Organisation!
	rShouldMap = rMapSettings.shouldRun;
	rCurrentMap = rMapSettings.mapName;
	rCurrentSetting = rMapSettings;
	rAutoLevel = rMapSettings.autoLevel ? rMapSettings.mapLevel : Infinity;

	//Vars
	var customVars = MODULES["maps"];
	if ((game.options.menu.repeatUntil.enabled == 1 || game.options.menu.repeatUntil.enabled == 2 || game.options.menu.repeatUntil.enabled == 3) && !game.global.mapsActive && !game.global.preMapsActive) toggleSetting('repeatUntil');
	if (game.options.menu.exitTo.enabled != 0) toggleSetting('exitTo');
	if (game.options.menu.repeatVoids.enabled != 0) toggleSetting('repeatVoids');

	//Farming & resetting variables.
	var selectedMap = "world";
	workerRatio = null;

	var dontRecycleMaps = game.global.challengeActive === 'Trappapalooza' || game.global.challengeActive === 'Archaeology' || game.global.challengeActive === 'Berserk' || game.portal.Frenzy.frenzyStarted !== -1;

	//Reset to defaults when on world grid
	if (!game.global.mapsActive && !game.global.preMapsActive) {
		game.global.mapRunCounter = 0;
		currTime = 0;
		rMFAtlantrimp = false;
		if (game.global.repeatMap) repeatClicked();
		if (game.global.selectedMapPreset >= 4) game.global.selectedMapPreset = 1;
		if (document.getElementById('advExtraLevelSelect').value > 0)
			document.getElementById('advExtraLevelSelect').value = "0";
		runningPrestigeMaps = false;
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

	const runUniques = getPageSetting('RAutoMaps') === 1;
	let voidMap = null;

	for (const map of game.global.mapsOwnedArray) {
		if (map.noRecycle && game.global.challengeActive != "Insanity") {
			if (runUniques && shouldRunUniqueMap(map)) {
				selectedMap = map.id;
				break;
			}
			if (map.location === 'Void' && rShouldMap && rCurrentMap === 'rVoidMap') {
				voidMap = selectEasierVoidMap(voidMap, map);
			}
		}
	}

	//Voids
	if (voidMap && selectedMap === 'world') {
		selectedMap = voidMap.id;
		if (game.global.mapsActive && getCurrentMapObject().location === 'Void') workerRatio = rMapSettings.jobRatio;
		if (currTime === 0) currTime = getGameTime();
	}

	//Map Creation!
	if (selectedMap === "world" && rShouldMap) {
		if (rCurrentMap !== '') {
			if (rCurrentMap === 'rPrestige') selectedMap = "createp";
			else selectedMap = RShouldFarmMapCreation(rMapSettings.mapLevel, rMapSettings.special);
			workerRatio = rMapSettings.jobRatio;
			if (currTime === 0) currTime = getGameTime();
		}
		if (getPageSetting('RBuyJobsNew') > 0 && oneSecondInterval)
			RbuyJobs()

	}

	//Map Repeat -- NEEDS REWRITTEN
	if (!game.global.preMapsActive && game.global.mapsActive) {
		if (rShouldMap && rCurrentMap === 'rPrestige' && !dontRecycleMaps && game.global.mapsActive && String(getCurrentMapObject().level).slice(-1) === '1' && Rgetequips(getCurrentMapObject().level) === 1 && getCurrentMapObject().bonus !== 'lmc' && game.resources.fragments.owned > PerfectMapCost(getCurrentMapObject().level - game.global.world, 'lmc')) {
			var maplevel = getCurrentMapObject().level
			mapsClicked();
			recycleMap();
			PerfectMapCost(maplevel - game.global.world, "lmc");
			buyMap();
			rRunMap();
			debug("Running LMC map due to only having 1 equip remaining on this map.")
		}
		if ((selectedMap == game.global.currentMapId || (!getCurrentMapObject().noRecycle && rShouldMap))) {
			//Starting with repeat on
			if (!game.global.repeatMap)
				repeatClicked();
			if (rShouldMap && rCurrentMap === 'rPrestige' && !RAMPfragfarming) {
				if (game.options.menu.repeatUntil.enabled != 2)
					game.options.menu.repeatUntil.enabled = 2;
			} else if (game.options.menu.repeatUntil.enabled != 0) {
				game.options.menu.repeatUntil.enabled = 0;
			}
			if (rCurrentMap !== 'rPrestige' && !RAMPfragfarming && !rShouldMap)
				repeatClicked();
			if (game.global.repeatMap && rCurrentMap !== 'rPrestige') {
				if (rCurrentMap !== '') {
					if (!rMapSettings.repeat) repeatClicked();
				}
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
		}
		//Creating Maps
	} else if (game.global.preMapsActive) {
		document.getElementById("mapLevelInput").value = game.global.world;
		if (selectedMap == "world") {
			mapsClicked();
		} else if (selectedMap == "createp") {
			rRunRaid();
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
			if (game.global.challengeActive === 'Transmute' && autoTrimpSettings.rMapSpecial.selected.includes('mc'))
				advSpecialSelect.value = autoTrimpSettings.rMapSpecial.selected.charAt(0) + "sc";
			document.getElementById("advSpecialSelect").value
			updateMapCost();
			if (game.global.challengeActive === 'Transmute') {
				biomeAdvMapsSelect.value = game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Sea";
				updateMapCost();
			}
			//Setting sliders appropriately. --- ITS ALREADY PRESTIGE RAIDING HERE
			if (rShouldMap) {
				mapBiome = FarmingDecision().biome !== undefined ? FarmingDecision().biome : game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountain";
				if (rCurrentMap !== '') {
					if (rMapSettings.autoLevel) PerfectMapCost(rMapSettings.mapLevel, rMapSettings.special, mapBiome);
					else RShouldFarmMapCost(rMapSettings.mapLevel, rMapSettings.special, mapBiome);
				}
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

			if (highestMap !== undefined && updateMapCost(true) > game.resources.fragments.owned) {
				selectMap(game.global.mapsOwnedArray[highestMap].id);
				debug("Can't afford the map we designed, #" + maplvlpicked, "maps", '*crying2');
				debug("...selected our highest map instead # " + game.global.mapsOwnedArray[highestMap].id + " Level: " + game.global.mapsOwnedArray[highestMap].level, "maps", '*happy2');
				runMap();
				RlastMapWeWereIn = getCurrentMapObject();
			} else {
				debug("Buying a Map, level: #" + maplvlpicked, "maps", 'th-large');
				if (getPageSetting('SpamFragments') && game.global.preMapsActive) {
					updateMapCost(true)
					debug("Spent " + prettify(updateMapCost(true)) + "/" + prettify(game.resources.fragments.owned) + " (" + ((updateMapCost(true) / game.resources.fragments.owned * 100).toFixed(2)) + "%) fragments on a " + (advExtraLevelSelect.value >= 0 ? "+" : "") + advExtraLevelSelect.value + " " + (advPerfectCheckbox.dataset.checked === 'true' ? "Perfect " : ("(" + lootAdvMapsRange.value + "," + sizeAdvMapsRange.value + "," + difficultyAdvMapsRange.value + ") ")) + advSpecialSelect.value + " map.")
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
