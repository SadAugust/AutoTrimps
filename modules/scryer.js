var wantToScry = false;
var transitionRequired = false;

function scryingCorruption() {
	//Defines if it should be scrying vs corrupted enemies at this moment
	var minZoneOK = game.global.world >= getPageSetting('ScryerMinZone');
	var maxZoneOK = game.global.world < getPageSetting('ScryerMaxZone') || getPageSetting('ScryerMaxZone') < 1;
	var scryZone = minZoneOK && maxZoneOK || getPageSetting('onlyminmaxworld') >= 2;
	var scryCorrupt = scryZone && getPageSetting('ScryerSkipCorrupteds2') !== 0 || getPageSetting('ScryerSkipCorrupteds2') === 1;
	var essenceLeft = getPageSetting('screwessence') === false || countRemainingEssenceDrops() >= 1;
	var die = getPageSetting('ScryerDieZ') !== -1 && game.global.world >= getPageSetting('ScryerDieZ');
	return (die || scryCorrupt) && essenceLeft && getPageSetting('UseScryerStance') === true;
}

function readyToSwitch(stance = "S") {
	//Suicide to Scry
	var essenceLeft = !getPageSetting('screwessence') || countRemainingEssenceDrops() >= 1;

	var die = getPageSetting('ScryerDieZ') !== -1 && game.global.world >= getPageSetting('ScryerDieZ') && essenceLeft;
	var willSuicide = getPageSetting('ScryerDieZ');

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

	if (game.global.uberNature === "Wind" && getEmpowerment() !== "Wind") {
		scry = 5;
		scryF = 'W';
		x = 5;
	}

	var AutoStance = getPageSetting('AutoStance');

	function autoStanceFunctionScryer() {
		if (AutoStance === 3 || (getPageSetting('use3daily') && hdStats.isDaily)) windStance();
		else if (AutoStance === 1) autoStance();
		else if (AutoStance === 2) autoStanceD();
	}

	var aboveMaxZone = getPageSetting('ScryerMaxZone') > 0 && game.global.world >= getPageSetting('ScryerMaxZone');
	var useScryer = getPageSetting('UseScryerStance');
	var mapsActive = game.global.mapsActive;
	var mapObject = mapsActive ? getCurrentMapObject() : null;
	var skipCorrupted = getPageSetting('ScryerSkipCorrupteds2') === 0;
	var settingPrefix = hdStats.isDaily ? 'd' : '';

	var never_scry = game.global.preMapsActive || game.global.gridArray.length === 0 || game.global.world <= 60 || game.stats.highestLevel.valueTotal() < 180;

	//Never scryer if any of these return true.

	//Maps Skip
	//Voids, BWs, and plus maps are excluded from this check.
	never_scry |= useScryer && mapsActive && getPageSetting('ScryerUseinMaps2') === 0 && mapObject.location !== "Void" && mapObject.location !== "Bionic" && mapObject.level <= game.global.world;
	//Plus Level Skip
	//BW is excluded from this check.
	never_scry |= useScryer && mapsActive && getPageSetting('ScryerUseinPMaps') === 0 && mapObject.level > game.global.world && mapObject.location !== "Void" && mapObject.location !== "Bionic";
	//Void Skip
	never_scry |= useScryer && mapsActive && mapObject.location === "Void" && getPageSetting('ScryerUseinVoidMaps2') === 0;
	//Bionic Skip
	never_scry |= useScryer && mapsActive && mapObject.location === "Bionic" && getPageSetting('ScryerUseinBW') === 0;
	//Spire Skip
	//Use base game check for spire active to ensure it works as described
	never_scry |= useScryer && !mapsActive && game.global.spireActive && getPageSetting('ScryerUseinSpire2') === 0;
	//Boss Skip
	never_scry |= useScryer && !mapsActive && getPageSetting('ScryerSkipBoss2') === 0 && game.global.lastClearedCell + 2 === 100;
	//Empowerment Skip
	//Check if we are in one of the empowerment bands and if we are check against the setting for that band.
	//0 is disabled, -1 is maybe, any value higher than 0 is the zone you would like to not run Scryer in that empowerment band.
	never_scry |= useScryer && !mapsActive && (
		(getEmpowerment() === "Poison" && (getPageSetting('ScryUseinPoison') === 0 || (getPageSetting('ScryUseinPoison') > 0 && game.global.world >= getPageSetting('ScryUseinPoison')))) ||
		(getEmpowerment() === "Wind" && (getPageSetting('ScryUseinWind') === 0 || (getPageSetting('ScryUseinWind') > 0 && game.global.world >= getPageSetting('ScryUseinWind')))) ||
		(getEmpowerment() === "Ice" && (getPageSetting('ScryUseinIce') === 0 || (getPageSetting('ScryUseinIce') > 0 && game.global.world >= getPageSetting('ScryUseinIce'))))
	);

	//Check Corrupted Never
	//See if current OR next enemy is corrupted.
	var isCorrupt = getCurrentEnemy(1) && getCurrentEnemy(1).mutation === "Corruption";
	var nextIsCorrupt = getCurrentEnemy(2) && getCurrentEnemy(2).mutation === "Corruption";
	//If next isn't corrupted AND we need to transition OR we can one shot the next enemy with full overkill, then we can scry next.
	var scryNext = !nextIsCorrupt && (transitionRequired || oneShotPower("S", 0, true));
	var skipOnMaxZone = getPageSetting('onlyminmaxworld') === 2 && getPageSetting('ScryerSkipCorrupteds2') !== 1 && aboveMaxZone;

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
	if (mapsActive && mapObject.location === "Void") {
		if (!game.global.runningChallengeSquared && getPageSetting(settingPrefix + 'scryvoidmaps')) never_scry = 0;
	}

	if (never_scry || (useScryer && !game.global.mapsActive && (isHealthy && getPageSetting('ScryerSkipHealthy') === 0))) {
		autoStanceFunctionScryer();
		wantToScry = false;
		return;
	}

	//Force scryer on if any of these return true.

	//Maps Force
	var force_scry = useScryer && mapsActive && getPageSetting('ScryerUseinMaps2') === 1;
	//Plus Level Force
	force_scry |= mapsActive && useScryer && mapObject.level > game.global.world && getPageSetting('ScryerUseinPMaps') === 1 && mapObject.location !== "Bionic";
	//Void Force
	force_scry |= mapsActive && mapObject.location === "Void" &&
		((getPageSetting('ScryerUseinVoidMaps2') === 1) || getPageSetting(settingPrefix + 'scryvoidmaps'));
	//Bionic Force
	force_scry |= mapsActive && useScryer && mapObject.location === "Bionic" && getPageSetting('ScryerUseinBW') === 1;
	//Spire Force
	force_scry |= !mapsActive && useScryer && isDoingSpire() && getPageSetting('ScryerUseinSpire2') === 1;
	//Empowerment Force
	force_scry |= !mapsActive && useScryer && (
		(getEmpowerment() === "Poison" && getPageSetting('ScryUseinPoison') > 0 && game.global.world < getPageSetting('ScryUseinPoison')) ||
		(getEmpowerment() === "Wind" && getPageSetting('ScryUseinWind') > 0 && game.global.world < getPageSetting('ScryUseinWind')) ||
		(getEmpowerment() === "Ice" && getPageSetting('ScryUseinIce') > 0 && game.global.world < getPageSetting('ScryUseinIce'))
	);

	//Farm easy maps on scryer
	if (mapsActive) {
		var overkillSpread = 0.005 * game.portal.Overkill.level;
		var mapRatio = calcHDRatio(mapObject.level, "map") <= (maxOneShotPower() > 1 ? Math.pow(overkillSpread, maxOneShotPower() - 1) * 3 : 3);
		force_scry |= mapObject.location !== "Void" && mapRatio;
	}

	//check Corrupted Force
	if ((isCorrupt && getPageSetting('ScryerSkipCorrupteds2') === 1 && useScryer === true) || (force_scry)) {
		safeSetStance(scry);
		wantToScry = true;
		return;
	}
	//check healthy force
	if ((isHealthy && getPageSetting('ScryerSkipHealthy') === 1 && useScryer) || (force_scry)) {
		safeSetStance(scry);
		wantToScry = true;
		return;
	}

	//Calc Damage
	if (AutoStance >= 1) calcBaseDamageInX();

	//Checks if Overkill is allowed
	var useOverkill = useScryer && getPageSetting('ScryerUseWhenOverkill');
	useOverkill &= !(getPageSetting('ScryerUseinSpire2') === 0 && !mapsActive && isDoingSpire());

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
	if (useScryer && !mapsActive && getPageSetting('screwessence') && countRemainingEssenceDrops() < 1) {
		autoStanceFunctionScryer();
		wantToScry = false;
		return;
	}

	//Default
	var min_zone = getPageSetting('ScryerMinZone');
	var max_zone = getPageSetting('ScryerMaxZone');
	var valid_min = game.global.world >= min_zone && game.global.world > 60;
	var valid_max = max_zone <= 0 || game.global.world < max_zone;
	if (useScryer && valid_min && valid_max && (!mapsActive || getPageSetting('onlyminmaxworld') === 0) && readyToSwitch()) {
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