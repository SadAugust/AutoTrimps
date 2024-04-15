function boneShrine(lineCheck) {
	const settingName = 'boneShrineSettings';
	const baseSettings = getPageSetting(settingName);
	const defaultSetting = baseSettings ? baseSettings[0] : null;
	if (challengeActive('Pandemonium') | (defaultSetting === null) | !defaultSetting.active) return;

	const setting = _getBoneShrineSetting(baseSettings, defaultSetting);
	if (setting === undefined) return;
	if (lineCheck) return setting;

	const shrineCharges = _getBoneShrineCharges(setting);
	const boneShrineGather = _getBoneShrineGather(setting);

	const boneShrineAncientTreasure = game.mapUnlocks.AncientTreasure.canRunOnce ? setting.atlantrimp : false;
	const ancientTreasure = getAncientTreasureName();
	if (boneShrineAncientTreasure) _runUniqueMap(ancientTreasure);

	const map = getCurrentMapObject();

	if (!boneShrineAncientTreasure || (game.global.mapsActive && map.name === ancientTreasure && game.global.lastClearedMapCell >= map.size - 30)) {
		const gatherStaff = 'heirloomStaff' + boneShrineGather[0].toUpperCase() + boneShrineGather.slice(1);
		if (getPageSetting(gatherStaff) !== 'undefined') heirloomEquip(gatherStaff, 'Staff');
		else heirloomEquip('heirloomStaffMap', 'Staff');

		if (getPageSetting('jobType') > 0) buyJobs(setting.jobratio);
		safeSetGather(boneShrineGather);

		for (let i = 0; i < shrineCharges; i++) {
			game.permaBoneBonuses.boosts.consume();
		}

		debug(`Consumed ${shrineCharges} bone shrine charge${shrineCharges === 1 ? '' : 's'} on zone ${game.global.world} and gained ${boneShrineOutput(shrineCharges)}`);

		if (setting && settingName && setting.row) {
			const value = game.global.universe === 2 ? 'valueU2' : 'value';
			game.global.addonUser[settingName][value][setting.row].done = getTotalPortals() + '_' + game.global.world;
		}
	}
}

function _getBoneShrineSetting(baseSettings, defaultSetting) {
	const boneCharges = game.permaBoneBonuses.boosts.charges;

	if (defaultSetting.autoBone && boneCharges >= defaultSetting.bonebelow && game.global.world >= defaultSetting.world) {
		if (defaultSetting.bonebelow <= 0) defaultSetting.bonebelow = 999;
		defaultSetting.atlantrimp = false;
		defaultSetting.boneamount = 1;
		defaultSetting.priority = 0;
		return defaultSetting;
	}

	for (let i = 1; i < baseSettings.length; i++) {
		const currSetting = baseSettings[i];
		const world = currSetting.world;
		if (!settingShouldRun(currSetting, world, 0, 'boneShrineSettings')) continue;
		return baseSettings[i];
	}
}

function _getBoneShrineGather(setting) {
	if (setting.gather === 'metal' && challengeActive('Transmute')) return 'wood';
	return setting.gather;
}

function _getBoneShrineCharges(setting) {
	const boneShrineSpendBelow = setting.bonebelow === -1 ? 0 : setting.bonebelow;
	const boneCharges = game.permaBoneBonuses.boosts.charges;
	if (!setting.autoBone && setting.boneamount > boneCharges - boneShrineSpendBelow) return boneCharges - boneShrineSpendBelow;
	return setting.boneamount;
}

function boneShrineOutput(charges) {
	const resourceMaps = { food: 'Barn', wood: 'Shed', metal: 'Forge' };
	const resources = Object.keys(resourceMaps).map(_calcResource(charges));
	let totals = Object.entries(resourceMaps).map((resourceMap, i) => _findTotal(resourceMap, resources[i]));
	totals = totals.map((x) => prettify(x));
	return `${totals[0]} Food, ${totals[1]} Wood, and ${totals[2]} Metal.`;
}

function _calcResource(charges) {
	return function (name) {
		const seconds = game.permaBoneBonuses.boosts.timeGranted() * 60;
		let loot = simpleSeconds(name, seconds);
		loot = scaleLootBonuses(loot, true) * charges;
		return { max: game.resources[name].max, owned: game.resources[name].owned, loot: loot };
	};
}

function _findTotal(resourceMap, resource) {
	let tempMax = resource['max'];
	let total = resource['owned'] + resource['loot'];
	const packMod = getPerkLevel('Packrat') * getPerkModifier('Packrat');

	while (total > calcHeirloomBonus('Shield', 'storageSize', tempMax + tempMax * packMod)) {
		const nextCost = calculatePercentageBuildingCost(resourceMap[1], resourceMap[0], 0.25, tempMax);
		if (total < nextCost) break;
		total -= nextCost;
		tempMax *= 2;
	}

	return total - resource['owned'];
}

function purchaseBonus(bonusName, cost, settingName, debugMessage) {
	if (!game.singleRunBonuses[bonusName].owned && game.global.b >= cost && getPageSetting(settingName)) {
		purchaseSingleRunBonus(bonusName);
		debug(debugMessage, 'bones');
	}
}

function buySingleRunBonuses() {
	if (trimpStats.isC3) {
		purchaseBonus('goldMaps', 20, 'c2GoldenMaps', 'Purchased Golden Maps for 20 bones.');
		purchaseBonus('sharpTrimps', 25, 'c2SharpTrimps', 'Purchased Sharp Trimps for 25 bones.');
	}

	if (!trimpStats.isDaily || game.singleRunBonuses.heliumy.owned || game.global.b < 100) return;
	const heliumySetting = getPageSetting('heliumyPercent', game.global.universe);
	if (heliumySetting <= 0 || getDailyHeliumValue(countDailyWeight()) < heliumySetting) return;

	purchaseSingleRunBonus('heliumy');
	const bonusName = game.global.universe === 2 ? 'Radonculous' : 'Heliumy';
	debug(`Purchased ${bonusName} for 100 bones on this ${heliumySetting}% daily.`, 'bones');
}
