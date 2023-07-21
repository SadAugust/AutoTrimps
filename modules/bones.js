function boneShrine() {

	const defaultSettings = getPageSetting('boneShrineDefaultSettings');
	if (!defaultSettings.active) return;

	//Setting up variables
	const boneShrineBaseSettings = getPageSetting('boneShrineSettings');
	var boneShrineIndex = null;
	var trimple = game.global.universe === 2 ? 'Atlantrimp' : 'Trimple Of Doom';

	var boneCharges = game.permaBoneBonuses.boosts.charges;

	//If we have enough bone charges then spend them automatically to stop from capping
	if (defaultSettings.autoBone && boneCharges >= defaultSettings.bonebelow && game.global.world >= defaultSettings.world)
		boneShrineIndex = true;

	const totalPortals = getTotalPortals();
	for (var y = 0; y < boneShrineBaseSettings.length; y++) {
		const currSetting = boneShrineBaseSettings[y];
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
		if (game.global.lastClearedCell + 2 >= currSetting.cell && boneCharges > currSetting.bonebelow) {
			boneShrineIndex = y;
			break;
		}
	}
	if (boneShrineIndex !== null) {

		var boneShrineSettings;

		if (boneShrineIndex === true) {
			boneShrineSettings = defaultSettings;
			if (boneShrineSettings.bonebelow <= 0) boneShrineSettings.bonebelow = 999;
		} else {
			boneShrineSettings = boneShrineBaseSettings[boneShrineIndex];
		}
		var boneShrineCharges = boneShrineSettings.boneamount;
		var boneShrineGather = boneShrineSettings.gather;
		if (challengeActive('Transmute') && boneShrineGather === 'metal') boneShrineGather = 'wood';
		var boneShrineSpendBelow = boneShrineSettings.bonebelow === -1 ? 0 : boneShrineSettings.bonebelow;
		var boneShrineAtlantrimp = !game.mapUnlocks.AncientTreasure.canRunOnce || boneShrineIndex === true ? false : boneShrineSettings.atlantrimp;
		var boneShrineDoubler = game.global.universe === 2 ? 'Atlantrimp' : 'Trimple Of Doom';

		if (boneShrineCharges > boneCharges - boneShrineSpendBelow)
			boneShrineCharges = boneCharges - boneShrineSpendBelow;

		if (boneShrineIndex === true) boneShrineCharges = 1;

		setGather(boneShrineGather);
		//Equip staff for the gather type the user is using
		if (getPageSetting('heirloomStaff')) {
			if (getPageSetting('heirloomStaff' + boneShrineGather[0].toUpperCase() + boneShrineGather.slice(1)) !== 'undefined')
				HeirloomEquipStaff('heirloomStaff' + boneShrineGather[0].toUpperCase() + boneShrineGather.slice(1));
			else if (getPageSetting('heirloomStaffMap') !== 'undefined')
				HeirloomEquipStaff('heirloomStaffMap');
		}
		if (boneShrineAtlantrimp) {
			runUniqueMap(boneShrineDoubler, false);
		}
		if (!boneShrineAtlantrimp || (boneShrineAtlantrimp && game.global.mapsActive && getCurrentMapObject().name === boneShrineDoubler && game.global.lastClearedMapCell >= getCurrentMapObject().size - 30)) {
			for (var x = 0; x < boneShrineCharges; x++) {
				if (getPageSetting('jobType') > 0) {
					buyJobs(boneShrineSettings.jobratio);
				}
				game.permaBoneBonuses.boosts.consume();
			}
			debug('Consumed ' + boneShrineCharges + " bone shrine " + (boneShrineCharges === 1 ? "charge on zone " : "charges on zone ") + game.global.world + " and gained " + boneShrineOutput(boneShrineCharges), "bones");
			boneShrineSettings.done = totalPortals + "_" + game.global.world;
			saveSettings();
		}
	}
}

function boneShrineOutput(charges) {

	charges = !charges ? 1 : charges;

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
	//Purchases Golden Maps and Sharp Trimps if we have enough bones and running C2/C3s
	if (hdStats.isC3) {
		if (!game.singleRunBonuses.goldMaps.owned && game.global.b >= 20 && getPageSetting('c2GoldenMaps')) {
			purchaseSingleRunBonus('goldMaps');
			debug("Purchased Golden Maps for 20 bones.", "bones");
		}
		if (!game.singleRunBonuses.sharpTrimps.owned && game.global.b >= 25 && getPageSetting('c2SharpTrimps')) {
			purchaseSingleRunBonus('sharpTrimps');
			debug("Purchased Sharp Trimps for 25 bones.", "bones");
		}
	}

	//Purchase Radonculous/Heliumy if we have enough bones and running Dailies
	if (challengeActive('Daily') && !game.singleRunBonuses.heliumy.owned && getPageSetting('buyheliumy', portalUniverse) >= 1 && getDailyHeliumValue(countDailyWeight()) >= getPageSetting('buyheliumy', portalUniverse) && game.global.b >= 100) {
		purchaseSingleRunBonus('heliumy');
		debug("Purchased " + (currSettingUniverse === 2 ? "Radonculous" : "Heliumy") + "  for 100 bones on this " + getPageSetting('buyheliumy', portalUniverse) + "% daily.", "bones");
	}
}