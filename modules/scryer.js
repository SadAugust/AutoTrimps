var wantToScry = false;
var transitionRequired = false;

function scryingCorruption() {
	//Defines if it should be scrying vs corrupted enemies at this moment
	const minZoneOK = game.global.world >= getPageSetting('scryerMinZone');
	const maxZoneOK = game.global.world < getPageSetting('scryerMaxZone') || getPageSetting('scryerMaxZone') < 1;
	const scryZone = (minZoneOK && maxZoneOK) || getPageSetting('scryerMinMaxWorld') >= 2;
	const scryCorrupt = (scryZone && getPageSetting('scryerCorrupted') !== 0) || getPageSetting('scryerCorrupted') === 1;
	const essenceLeft = getPageSetting('scryerEssenceOnly') === false || countRemainingEssenceDrops() >= 1;
	const die = getPageSetting('scryerDieZone') !== -1 && game.global.world >= getPageSetting('scryerDieZone');
	return (die || scryCorrupt) && essenceLeft && getPageSetting('AutoStanceScryer');
}

function readyToSwitch(stance = 'S') {
	//Suicide to Scry
	const essenceLeft = !getPageSetting('scryerEssenceOnly') || countRemainingEssenceDrops() >= 1;

	const dieZone = getPageSetting('scryerDieZone');
	let die = dieZone !== -1 && game.global.world >= dieZone && essenceLeft;
	const willSuicide = dieZone;

	//Check if we are allowed to suicide in our current cell and zone
	if (die && willSuicide >= 0) {
		let [dieZ, dieC] = willSuicide.toString().split('.');
		if (dieC && dieC.length === 1) dieC = dieC + '0';
		die = game.global.world >= dieZ && (!dieC || game.global.lastClearedCell + 1 >= dieC);
	}

	return die || survive(stance, 2);
}

function useScryerStance() {
	const AutoStance = getPageSetting('AutoStance');
	const settingPrefix = trimpStats.isDaily ? 'd' : '';

	const uberEmpowerment = getUberEmpowerment();
	const empowerment = getEmpowerment();
	const shouldWindStance = uberEmpowerment === 'Wind' && (empowerment !== 'Wind' || useWindStance());

	const scry = shouldWindStance ? 5 : 4;
	const scryF = shouldWindStance ? 'W' : 'S';

	function autoStanceFunctionScryer() {
		if (uberEmpowerment === 'Wind' && getPageSetting(settingPrefix + 'AutoStanceWind')) autoStanceWind();
		else if (AutoStance === 1) autoStance();
		else if (AutoStance === 2) autoStanceD();
	}

	//If Scryer stance hasn't been unlocked then don't use this code
	if (game.global.preMapsActive || game.global.gridArray.length === 0 || game.global.world <= 60 || getHighestLevelCleared() < 180) return autoStanceFunctionScryer();

	const scrySettings = Object.entries(autoTrimpSettings)
		.filter(([key]) => key.startsWith('scryer'))
		.reduce((obj, [key, { value }]) => {
			obj[key.replace('scryer', '')] = value;
			return obj;
		}, {});
	const aboveMaxZone = scrySettings.MaxZone > 0 && game.global.world >= scrySettings.MaxZone;
	//If scryerMinMaxWorld === 1 then we are only allowed to scry in the min/max zone range in world so we need to check if we are in that range.
	if (aboveMaxZone && scrySettings.MinMaxWorld === 1) return autoStanceFunctionScryer();

	const useScryer = getPageSetting('AutoStanceScryer');

	const mapsActive = game.global.mapsActive;
	const isMapActive = useScryer && mapsActive;
	const isWorldActive = useScryer && !mapsActive;
	const mapObject = mapsActive ? getCurrentMapObject() : null;
	const skipCorrupted = scrySettings.Corrupted === 0;

	const currentEnemy = getCurrentEnemy(1);
	const nextEnemy = getCurrentEnemy(2);

	let never_scry = false;
	//Never scryer if any of these return true.
	if (isMapActive) {
		never_scry |= scrySettings.Maps === 0 && mapObject.location !== 'Void' && mapObject.location !== 'Bionic' && mapObject.level <= game.global.world;
		never_scry |= scrySettings.PlusMaps === 0 && mapObject.level > game.global.world && mapObject.location !== 'Void' && mapObject.location !== 'Bionic';
		never_scry |= mapObject.location === 'Void' && scrySettings.VoidMaps === 0;
		never_scry |= mapObject.location === 'Bionic' && scrySettings.BW === 0;
	} else if (isWorldActive) {
		never_scry |= game.global.spireActive && scrySettings.Spire === 0;
		never_scry |= scrySettings.SkipBoss === 0 && game.global.lastClearedCell + 2 === 100;
		//Empowerment Skip
		//0 is disabled, -1 is maybe, any value higher than 0 is the zone you would like to not run Scryer in that empowerment band.
		never_scry |= empowerment && (scrySettings[empowerment] === 0 || (scrySettings[empowerment] > 0 && game.global.world >= scrySettings[empowerment]));
	}

	//Check Corrupted Never
	//See if current OR next enemy is corrupted.
	const isCorrupt = currentEnemy && currentEnemy.mutation === 'Corruption';
	const nextIsCorrupt = nextEnemy && nextEnemy.mutation === 'Corruption';
	//If next isn't corrupted AND we need to transition OR we can one shot the next enemy with full overkill, then we can scry next.
	const scryNext = !nextIsCorrupt && (transitionRequired || oneShotPower('S', 0, true));
	const skipOnMaxZone = scrySettings.MinMaxWorld === 2 && scrySettings.Corrupted !== 1 && aboveMaxZone;

	//If we are fighting a corrupted cell and we are not allowed to scry corrupted cells, then we can't scry.
	if (isWorldActive && (skipCorrupted || skipOnMaxZone) && isCorrupt) {
		transitionRequired = scryNext;
		never_scry |= !scryNext;
	} else {
		transitionRequired = false;
	}

	//check Healthy never -- TODO
	const isHealthy = currentEnemy && currentEnemy.mutation === 'Healthy';

	//Override never scry if in voids with scryvoid setting enabled.
	if (mapsActive && mapObject.location === 'Void' && scrySettings.VoidMaps === 0) {
		if (!game.global.runningChallengeSquared && game.talents.scry2.purchased && getPageSetting(settingPrefix + 'scryvoidmaps')) never_scry = 0;
	}

	if (never_scry || (useScryer && !game.global.mapsActive && isHealthy && scrySettings.Healthy === 0)) {
		autoStanceFunctionScryer();
		wantToScry = false;
		return;
	}

	let force_scry = false;
	//Force scryer on if any of these return true.
	if (isMapActive) {
		force_scry |= scrySettings.Maps === 1 && mapObject.location !== 'Void' && mapObject.location !== 'Bionic' && mapObject.level <= game.global.world;
		force_scry |= mapObject.level > game.global.world && scrySettings.PlusMaps === 1 && mapObject.location !== 'Bionic';
		force_scry |= mapObject.location === 'Void' && scrySettings.VoidMaps === 1;
		force_scry |= mapObject.location === 'Bionic' && scrySettings.BW === 1;
	} else if (isWorldActive) {
		//Spire Force
		force_scry |= game.global.spireActive && scrySettings.Spire === 1;
		//Empowerment Skip
		force_scry |= empowerment && scrySettings[empowerment] > 0 && game.global.world <= scrySettings[empowerment];
	}

	if (!force_scry && mapObject && mapObject.location === 'Void' && !game.global.runningChallengeSquared && game.talents.scry2.purchased && getPageSetting(settingPrefix + 'scryvoidmaps')) force_scry = true;

	if (mapsActive && mapObject.location !== 'Void') {
		//Farm easy maps on scryer
		let overkillSpread = 0.005 * game.portal.Overkill.level;
		const overkillCells = maxOneShotPower();
		let mapRatio = calcHDRatio(mapObject.level, 'map') <= (overkillCells > 1 ? Math.pow(overkillSpread, overkillCells - 1) * 3 : 3);
		force_scry |= mapRatio;
	}

	//check Corrupted/Healthy Force
	if ((((isHealthy && scrySettings.Healthy === 1) || (isCorrupt && scrySettings.Corrupted === 1)) && useScryer) || force_scry) {
		safeSetStance(scry);
		wantToScry = true;
		return;
	}

	//Calc Damage
	if (AutoStance >= 1) calcBaseDamageInX();

	//Checks if Overkill is allowed
	let useOverkill = useScryer && getPageSetting('scryerOverkill');
	useOverkill &= !(scrySettings.Spire === 0 && !mapsActive && isDoingSpire());
	let canSwitch;
	//Overkill
	if (useOverkill && currentEnemy) {
		//Switches to S/W if it has enough damage to secure an overkill
		let HS = oneShotPower(scryF);
		let HSD = oneShotPower('D', 0, true);
		let HS_next = oneShotPower(scryF, 1);
		let HSD_next = oneShotPower('D', 1, true);
		canSwitch = readyToSwitch(scryF);
		if (canSwitch && HS > 0 && HS >= HSD && (HS > 1 || (HS_next > 0 && HS_next >= HSD_next))) {
			safeSetStance(scry);
			return;
		}
	}

	//No Essence
	if (isWorldActive && getPageSetting('scryerEssenceOnly') && countRemainingEssenceDrops() < 1) {
		autoStanceFunctionScryer();
		wantToScry = false;
		return;
	}

	//Default
	let min_zone = scrySettings.MinZone;
	let max_zone = scrySettings.MaxZone;
	let valid_min = game.global.world >= min_zone && game.global.world > 60;
	let valid_max = max_zone < 1 || (max_zone > 0 && game.global.world < max_zone);
	if (!canSwitch) canSwitch = readyToSwitch(scryF);

	if (useScryer && valid_min && valid_max && (!mapsActive || scrySettings.MinMaxWorld === 0) && canSwitch) {
		//Smooth transition to S before killing the target
		if (transitionRequired) {
			const stances = [
				{ stance: 'D', value: 2 },
				{ stance: 'XB', value: scry },
				{ stance: 'B', value: 3 },
				{ stance: 'X', value: scry },
				{ stance: 'H', value: 1 }
			];
			const oneShotPowers = {};
			const critSources = getCritPower(currentEnemy);

			for (let critPower = 2; critPower >= -2; critPower--) {
				if (critPower === 2 && (!critSources.regular || !critSources.challenge)) continue;
				if (critPower === 1 && !critSources.regular && !critSources.challenge) continue;
				if (critPower === 0 && !critSources.explosive) continue;
				if (critPower === -1 && !critSources.reflect) continue;

				for (let { stance, value } of stances) {
					if (!oneShotPowers[stance]) {
						oneShotPowers[stance] = oneShotPower(stance, 0, true);
					}

					if (survive(stance, critPower) && !oneShotPowers[stance]) {
						safeSetStance(value);
						return;
					}
				}
			}
		}

		//Set to scry if it won't kill us, or we are willing to die for it
		safeSetStance(scry);
		wantToScry = true;
		return;
	}

	//No reason to Scry
	wantToScry = false;
}
