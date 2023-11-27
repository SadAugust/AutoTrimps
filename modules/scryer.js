var wantToScry = false;
var transitionRequired = false;

function scryingCorruption() {
	//Defines if it should be scrying vs corrupted enemies at this moment
	var minZoneOK = game.global.world >= getPageSetting('scryerMinZone');
	var maxZoneOK = game.global.world < getPageSetting('scryerMaxZone') || getPageSetting('scryerMaxZone') < 1;
	var scryZone = minZoneOK && maxZoneOK || getPageSetting('scryerMinMaxWorld') >= 2;
	var scryCorrupt = scryZone && getPageSetting('scryerCorrupted') !== 0 || getPageSetting('scryerCorrupted') === 1;
	var essenceLeft = getPageSetting('scryerEssenceOnly') === false || countRemainingEssenceDrops() >= 1;
	var die = getPageSetting('scryerDieZone') !== -1 && game.global.world >= getPageSetting('scryerDieZone');
	return (die || scryCorrupt) && essenceLeft && getPageSetting('AutoStanceScryer') === true;
}

function readyToSwitch(stance = "S") {
	//Suicide to Scry
	var essenceLeft = !getPageSetting('scryerEssenceOnly') || countRemainingEssenceDrops() >= 1;

	var die = getPageSetting('scryerDieZone') !== -1 && game.global.world >= getPageSetting('scryerDieZone') && essenceLeft;
	var willSuicide = getPageSetting('scryerDieZone');

	//Check if we are allowed to suicide in our current cell and zone
	if (die && willSuicide >= 0) {
		var [dieZ, dieC] = willSuicide.toString().split(".");
		if (dieC && dieC.length === 1) dieC = dieC + "0";
		die = game.global.world >= dieZ && (!dieC || (game.global.lastClearedCell + 1 >= dieC));
	}

	return die || survive(stance, 2);
}

function useScryerStance() {
	var scry = 4;
	var scryF = 'S';
	var x = 4;

	if (game.global.uberNature === "Wind" && (getEmpowerment() !== "Wind" || useWindStance())) {
		scry = 5;
		scryF = 'W';
		x = 5;
	}

	var AutoStance = getPageSetting('AutoStance');

	function autoStanceFunctionScryer() {
		var settingPrefix = trimpStats.isDaily ? 'd' : '';
		if (getPageSetting(settingPrefix + 'AutoStanceWind')) autoStanceWind();
		else if (AutoStance === 1) autoStance();
		else if (AutoStance === 2) autoStanceD();
	}
	//If Scryer stance hasn't been unlocked then don't use this code
	if (getHighestLevelCleared() < 180) return autoStanceFunctionScryer();

	var aboveMaxZone = getPageSetting('scryerMaxZone') > 0 && game.global.world >= getPageSetting('scryerMaxZone');
	var useScryer = getPageSetting('AutoStanceScryer');
	var mapsActive = game.global.mapsActive;
	var mapObject = mapsActive ? getCurrentMapObject() : null;
	var skipCorrupted = getPageSetting('scryerCorrupted') === 0;
	var settingPrefix = trimpStats.isDaily ? 'd' : '';

	var never_scry = game.global.preMapsActive || game.global.gridArray.length === 0 || game.global.world <= 60 || game.stats.highestLevel.valueTotal() < 180;

	//Never scryer if any of these return true.

	//Maps Skip
	//Voids, BWs, and plus maps are excluded from this check.
	never_scry |= useScryer && mapsActive && getPageSetting('scryerMaps') === 0 && mapObject.location !== "Void" && mapObject.location !== "Bionic" && mapObject.level <= game.global.world;
	//Plus Level Skip
	//BW is excluded from this check.
	never_scry |= useScryer && mapsActive && getPageSetting('scryerPlusMaps') === 0 && mapObject.level > game.global.world && mapObject.location !== "Void" && mapObject.location !== "Bionic";
	//Void Skip
	never_scry |= useScryer && mapsActive && mapObject.location === "Void" && getPageSetting('scryerVoidMaps') === 0;
	//Bionic Skip
	never_scry |= useScryer && mapsActive && mapObject.location === "Bionic" && getPageSetting('scryerBW') === 0;
	//Spire Skip
	//Use base game check for spire active to ensure it works as described
	never_scry |= useScryer && !mapsActive && game.global.spireActive && getPageSetting('scryerSpire') === 0;
	//Boss Skip
	never_scry |= useScryer && !mapsActive && getPageSetting('scryerSkipBoss') === 0 && game.global.lastClearedCell + 2 === 100;
	//Empowerment Skip
	//Check if we are in one of the empowerment bands and if we are check against the setting for that band.
	//0 is disabled, -1 is maybe, any value higher than 0 is the zone you would like to not run Scryer in that empowerment band.
	never_scry |= useScryer && !mapsActive && (
		(getEmpowerment() === "Poison" && (getPageSetting('scryerPoison') === 0 || (getPageSetting('scryerPoison') > 0 && game.global.world >= getPageSetting('scryerPoison')))) ||
		(getEmpowerment() === "Wind" && (getPageSetting('scryerWind') === 0 || (getPageSetting('scryerWind') > 0 && game.global.world >= getPageSetting('scryerWind')))) ||
		(getEmpowerment() === "Ice" && (getPageSetting('scryerIce') === 0 || (getPageSetting('scryerIce') > 0 && game.global.world >= getPageSetting('scryerIce'))))
	);

	//Check Corrupted Never
	//See if current OR next enemy is corrupted.
	var isCorrupt = getCurrentEnemy(1) && getCurrentEnemy(1).mutation === "Corruption";
	var nextIsCorrupt = getCurrentEnemy(2) && getCurrentEnemy(2).mutation === "Corruption";
	//If next isn't corrupted AND we need to transition OR we can one shot the next enemy with full overkill, then we can scry next.
	var scryNext = !nextIsCorrupt && (transitionRequired || oneShotPower("S", 0, true));
	var skipOnMaxZone = getPageSetting('scryerMinMaxWorld') === 2 && getPageSetting('scryerCorrupted') !== 1 && aboveMaxZone;

	//If we are fighting a corrupted cell and we are not allowed to scry corrupted cells, then we can't scry.
	if (useScryer && !mapsActive && (skipCorrupted || skipOnMaxZone) && isCorrupt) {
		transitionRequired = scryNext;
		never_scry |= !scryNext;
	}
	else transitionRequired = false;

	//check Healthy never -- TODO
	var curEnemyHealth = getCurrentEnemy(1);
	var isHealthy = curEnemyHealth && curEnemyHealth.mutation === "Healthy";

	//Override never scry if in voids with scryvoid setting enabled.
	if (mapsActive && mapObject.location === "Void" && getPageSetting('scryerVoidMaps') === 0) {
		if (!game.global.runningChallengeSquared && game.talents.scry2.purchased && getPageSetting(settingPrefix + 'scryvoidmaps')) never_scry = 0;
	}

	if (never_scry || (useScryer && !game.global.mapsActive && (isHealthy && getPageSetting('scryerHealthy') === 0))) {
		autoStanceFunctionScryer();
		wantToScry = false;
		return;
	}
	//Force scryer on if any of these return true.

	//Maps Force
	var force_scry = useScryer && mapsActive && getPageSetting('scryerMaps') === 1;
	//Plus Level Force
	force_scry |= mapsActive && useScryer && mapObject.level > game.global.world && getPageSetting('scryerPlusMaps') === 1 && mapObject.location !== "Bionic";
	//Void Force
	force_scry |= mapsActive && mapObject.location === "Void" && (getPageSetting('scryerVoidMaps') === 1 ||
		(!game.global.runningChallengeSquared && game.talents.scry2.purchased && getPageSetting(settingPrefix + 'scryvoidmaps')));
	//Bionic Force
	force_scry |= mapsActive && useScryer && mapObject.location === "Bionic" && getPageSetting('scryerBW') === 1;
	//Spire Force
	force_scry |= !mapsActive && useScryer && isDoingSpire() && getPageSetting('scryerSpire') === 1;
	//Empowerment Force
	force_scry |= !mapsActive && useScryer && (
		(getEmpowerment() === "Poison" && getPageSetting('scryerPoison') > 0 && game.global.world < getPageSetting('scryerPoison')) ||
		(getEmpowerment() === "Wind" && getPageSetting('scryerWind') > 0 && game.global.world < getPageSetting('scryerWind')) ||
		(getEmpowerment() === "Ice" && getPageSetting('scryerIce') > 0 && game.global.world < getPageSetting('scryerIce'))
	);

	//Farm easy maps on scryer
	if (mapsActive) {
		var overkillSpread = 0.005 * game.portal.Overkill.level;
		var mapRatio = calcHDRatio(mapObject.level, "map") <= (maxOneShotPower() > 1 ? Math.pow(overkillSpread, maxOneShotPower() - 1) * 3 : 3);
		force_scry |= mapObject.location !== "Void" && mapRatio;
	}

	//check Corrupted Force
	if ((isCorrupt && getPageSetting('scryerCorrupted') === 1 && useScryer === true) || (force_scry)) {
		safeSetStance(scry);
		wantToScry = true;
		return;
	}
	//check healthy force
	if ((isHealthy && getPageSetting('scryerHealthy') === 1 && useScryer) || (force_scry)) {
		safeSetStance(scry);
		wantToScry = true;
		return;
	}

	//Calc Damage
	if (AutoStance >= 1) calcBaseDamageInX();

	//Checks if Overkill is allowed
	var useOverkill = useScryer && getPageSetting('scryerOverkill');
	useOverkill &= !(getPageSetting('scryerSpire') === 0 && !mapsActive && isDoingSpire());

	//Overkill
	if (useOverkill && getCurrentEnemy()) {
		//Switches to S/W if it has enough damage to secure an overkill
		var HS = oneShotPower(scryF);
		var HSD = oneShotPower("D", 0, true);
		var HS_next = oneShotPower(scryF, 1);
		var HSD_next = oneShotPower("D", 1, true);
		if (readyToSwitch() && HS > 0 && HS >= HSD && (HS > 1 || HS_next > 0 && HS_next >= HSD_next)) {
			safeSetStance(scry);
			return;
		}
	}

	//No Essence
	if (useScryer && !mapsActive && getPageSetting('scryerEssenceOnly') && countRemainingEssenceDrops() < 1) {
		autoStanceFunctionScryer();
		wantToScry = false;
		return;
	}

	//Default
	var min_zone = getPageSetting('scryerMinZone');
	var max_zone = getPageSetting('scryerMaxZone');
	var valid_min = game.global.world >= min_zone && game.global.world > 60;
	var valid_max = max_zone < 1 || (max_zone > 0 && game.global.world < max_zone);
	if (useScryer && valid_min && valid_max && (!mapsActive || getPageSetting('scryerMinMaxWorld') === 0) && readyToSwitch(scryF)) {
		//Smooth transition to S before killing the target
		if (transitionRequired) {
			for (critPower = 2; critPower >= -2; critPower--) {
				if (survive("D", critPower) && !oneShotPower("D", 0, true)) {
					safeSetStance(2); return;
				}
				else if (survive("XB", critPower) && !oneShotPower("X", 0, true)) {
					safeSetStance(x); return;
				}
				else if (survive("B", critPower) && !oneShotPower("B", 0, true)) {
					safeSetStance(3); return;
				}
				else if (survive("X", critPower) && !oneShotPower("X", 0, true)) {
					safeSetStance(x); return;
				}
				else if (survive("H", critPower) && !oneShotPower("H", 0, true)) {
					safeSetStance(1); return;
				}
			}
		}

		//Set to scry if it won't kill us, or we are willing to die for it
		safeSetStance(scry);
		wantToScry = true;
		return;
	}

	//No reason to Scry
	autoStanceFunctionScryer();
	wantToScry = false;
}