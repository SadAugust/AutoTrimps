//Resetting variables
rBSRunningAtlantrimp = false;

function boneShrine(hdStats) {

	if (!getPageSetting('boneShrineDefaultSettings').active) return;

	//Setting up variables
	const rBoneShrineBaseSettings = getPageSetting('boneShrineSettings');
	var rBSIndex = null;
	const totalPortals = getTotalPortals();
	for (var y = 0; y < rBoneShrineBaseSettings.length; y++) {
		const currSetting = rBoneShrineBaseSettings[y];
		if (game.global.world !== currSetting.world || currSetting.done === totalPortals + "_" + game.global.world ||
			!currSetting.active) {
			continue;
		}
		if (currSetting.runType !== 'All') {
			if (!hdStats.isC3 && !hdStats.isDaily && (currSetting.runType !== 'Filler' ||
				(currSetting.runType === 'Filler' && (currSetting.challenge !== 'All' && currSetting.challenge !== hdStats.currChallenge)))) continue;
			if (hdStats.isDaily && currSetting.runType !== 'Daily') continue;
			if (hdStats.isC3 && (currSetting.runType !== 'C3' ||
				(currSetting.runType === 'C3' && (currSetting.challenge3 !== 'All' && currSetting.challenge3 !== hdStats.currChallenge)))) continue;
		}
		if (game.global.lastClearedCell + 2 >= currSetting.cell && game.permaBoneBonuses.boosts.charges > currSetting.bonebelow) {
			rBSIndex = y;
			break;
		}
	}
	if (rBSIndex !== null) {
		var rBoneShrineSettings = rBoneShrineBaseSettings[rBSIndex];
		var rBoneShrineCharges = rBoneShrineSettings.boneamount;
		var rBoneShrineGather = rBoneShrineSettings.gather;
		if (challengeActive('Transmute') && rBoneShrineGather === 'metal') rBoneShrineGather = 'wood';
		var rBoneShrineSpendBelow = rBoneShrineSettings.bonebelow === -1 ? 0 : rBoneShrineSettings.bonebelow;
		var rBoneShrineAtlantrimp = !game.mapUnlocks.AncientTreasure.canRunOnce ? false : rBoneShrineSettings.atlantrimp;
		var rBoneShrineDoubler = game.global.universe === 2 ? 'Atlantrimp' : 'Trimple Of Doom'

		if (rBoneShrineCharges > game.permaBoneBonuses.boosts.charges - rBoneShrineSpendBelow)
			rBoneShrineCharges = game.permaBoneBonuses.boosts.charges - rBoneShrineSpendBelow;

		setGather(rBoneShrineGather);
		if (getPageSetting('heirloomStaff')) {
			if (getPageSetting('heirloomStaff' + rBoneShrineGather[0].toUpperCase() + rBoneShrineGather.slice(1)) !== 'undefined')
				HeirloomEquipStaff('heirloomStaff' + rBoneShrineGather[0].toUpperCase() + rBoneShrineGather.slice(1));
			else if (getPageSetting('heirloomStaffMap') !== 'undefined')
				HeirloomEquipStaff('heirloomStaffMap');
		}
		if (rBoneShrineAtlantrimp) {
			if (!rBSRunningAtlantrimp) {
				runUniqueMap(rBoneShrineDoubler, false);
			}
		}
		if (!rBoneShrineAtlantrimp || (rBoneShrineAtlantrimp && game.global.mapsActive && getCurrentMapObject().name === rBoneShrineDoubler && game.global.lastClearedMapCell === getCurrentMapObject().size - 4)) {
			for (var x = 0; x < rBoneShrineCharges; x++) {
				if (getPageSetting('jobType') > 0) {
					MODULES.mapFunctions.workerRatio = rBoneShrineSettings.jobratio;
					buyJobs();
				}
				game.permaBoneBonuses.boosts.consume();
			}
			debug('Consumed ' + rBoneShrineCharges + " bone shrine " + (rBoneShrineCharges == 1 ? "charge on zone " : "charges on zone ") + game.global.world + " and gained " + boneShrineOutput(rBoneShrineCharges));
			rBoneShrineSettings.done = totalPortals + "_" + game.global.world;
			rBSRunningAtlantrimp = false;
			MODULES.mapFunctions.workerRatio = null;
			saveSettings();
		}
	}
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

function buySingleRunBonuses() {

	if (!game.singleRunBonuses.goldMaps.owned && game.global.b >= 20 && getPageSetting('c2GoldenMaps'))
		purchaseSingleRunBonus('goldMaps');
	if (!game.singleRunBonuses.sharpTrimps.owned && game.global.b >= 25 && getPageSetting('c2SharpTrimps'))
		purchaseSingleRunBonus('sharpTrimps');
}