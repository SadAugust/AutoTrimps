function boneShrine() {
	const settingName = 'boneShrineSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSettings = baseSettings ? baseSettings[0] : null;
	if (challengeActive('Pandemonium')) return;
	if (defaultSettings === null) return;
	if (!defaultSettings.active) return;

	//Setting up variables
	var settingIndex = null;

	var boneCharges = game.permaBoneBonuses.boosts.charges;

	//If we have enough bone charges then spend them automatically to stop from capping
	if (defaultSettings.autoBone && boneCharges >= defaultSettings.bonebelow && game.global.world >= defaultSettings.world)
		settingIndex = true;

	const totalPortals = getTotalPortals();
	for (var y = 0; y < baseSettings.length; y++) {
		if (y === 0) continue;
		const currSetting = baseSettings[y];
		var world = currSetting.world;
		if (!settingShouldRun(currSetting, world, 0, settingName)) continue;
		settingIndex = y;
		break;

	}
	if (settingIndex !== null) {

		var setting;

		if (settingIndex === true) {
			setting = defaultSettings;
			if (setting.bonebelow <= 0) setting.bonebelow = 999;
		} else {
			setting = baseSettings[settingIndex];
		}
		var boneShrineCharges = setting.boneamount;
		var boneShrineGather = setting.gather;
		if (challengeActive('Transmute') && boneShrineGather === 'metal') boneShrineGather = 'wood';
		var boneShrineSpendBelow = setting.bonebelow === -1 ? 0 : setting.bonebelow;
		var boneShrineAtlantrimp = !game.mapUnlocks.AncientTreasure.canRunOnce || settingIndex === true ? false : setting.atlantrimp;
		var boneShrineDoubler = game.global.universe === 2 ? 'Atlantrimp' : 'Trimple Of Doom';

		if (boneShrineCharges > boneCharges - boneShrineSpendBelow)
			boneShrineCharges = boneCharges - boneShrineSpendBelow;

		if (settingIndex === true) boneShrineCharges = 1;

		//Equip staff for the gather type the user is using
		if (getPageSetting('heirloomStaff')) {
			if (getPageSetting('heirloomStaff' + boneShrineGather[0].toUpperCase() + boneShrineGather.slice(1)) !== 'undefined')
				heirloomEquipStaff('heirloomStaff' + boneShrineGather[0].toUpperCase() + boneShrineGather.slice(1));
			else if (getPageSetting('heirloomStaffMap') !== 'undefined')
				heirloomEquipStaff('heirloomStaffMap');
		}
		if (boneShrineAtlantrimp) {
			runUniqueMap(boneShrineDoubler);
		}
		if (!boneShrineAtlantrimp || (boneShrineAtlantrimp && game.global.mapsActive && getCurrentMapObject().name === boneShrineDoubler && game.global.lastClearedMapCell >= getCurrentMapObject().size - 30)) {
			for (var x = 0; x < boneShrineCharges; x++) {
				if (getPageSetting('jobType') > 0) {
					buyJobs(setting.jobratio);
				}
				safeSetGather(boneShrineGather);
				game.permaBoneBonuses.boosts.consume();
			}
			debug('Consumed ' + boneShrineCharges + ' bone shrine ' + (boneShrineCharges === 1 ? 'charge on zone ' : 'charges on zone ') + game.global.world + ' and gained ' + boneShrineOutput(boneShrineCharges), 'bones');

			if (setting && settingName && setting.row) {
				var value = game.global.universe === 2 ? 'valueU2' : 'value';
				game.global.addonUser[settingName][value][setting.row].done = (totalPortals + "_" + game.global.world);
			}
			saveSettings();
		}
	}
}

function boneShrineOutput(charges) {
	if (!charges) charges = 1;
	var eligible = ['food', 'wood', 'metal'];
	var storage = ['Barn', 'Shed', 'Forge'];
	var rewarded = [0, 0, 0];
	var packMod = getPerkLevel('Packrat') * game.portal.Packrat.modifier;
	for (var x = 0; x < eligible.length; x++) {
		var resName = eligible[x];
		var resObj = game.resources[resName];
		var amt = simpleSeconds(resName, (game.permaBoneBonuses.boosts.timeGranted() * 60));
		amt = scaleLootBonuses(amt, true);
		amt *= charges
		var tempMax = resObj.max;
		var newTotal = resObj.owned + amt;
		while (newTotal > calcHeirloomBonus('Shield', 'storageSize', tempMax + (tempMax * packMod))) {
			var nextCost = calculatePercentageBuildingCost(storage[x], resName, 0.25, tempMax);
			if (newTotal < nextCost) break;
			newTotal -= nextCost;
			amt -= nextCost;
			tempMax *= 2;
		}
		rewarded[x] = amt;
	}

	return prettify(rewarded[0]) + ' Food, ' + prettify(rewarded[1]) + ' Wood, and ' + prettify(rewarded[2]) + ' Metal.';
}

function buySingleRunBonuses() {
	//Purchases Golden Maps and Sharp Trimps if we have enough bones and running C2/C3s
	if (trimpStats.isC3) {
		if (!game.singleRunBonuses.goldMaps.owned && game.global.b >= 20 && getPageSetting('c2GoldenMaps')) {
			purchaseSingleRunBonus('goldMaps');
			debug('Purchased Golden Maps for 20 bones.', 'bones');
		}
		if (!game.singleRunBonuses.sharpTrimps.owned && game.global.b >= 25 && getPageSetting('c2SharpTrimps')) {
			purchaseSingleRunBonus('sharpTrimps');
			debug('Purchased Sharp Trimps for 25 bones.', 'bones');
		}
	}

	//Purchase Radonculous/Heliumy if we have enough bones and running Dailies
	if (challengeActive('Daily') && !game.singleRunBonuses.heliumy.owned && getPageSetting('buyheliumy', portalUniverse) > 0 && getDailyHeliumValue(countDailyWeight()) >= getPageSetting('buyheliumy', portalUniverse) && game.global.b >= 100) {
		purchaseSingleRunBonus('heliumy');
		debug('Purchased ' + (currSettingUniverse === 2 ? 'Radonculous' : 'Heliumy') + '  for 100 bones on this ' + getPageSetting('buyheliumy', portalUniverse) + '% daily.', 'bones');
	}
}