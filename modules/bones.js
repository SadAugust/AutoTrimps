function boneShrine() {
    const settingName = 'boneShrineSettings';
    const baseSettings = getPageSetting(settingName);
    const defaultSetting = baseSettings ? baseSettings[0] : null;
    if (challengeActive('Pandemonium') | (defaultSetting === null) | !defaultSetting.active) return;

    const setting = _getBoneShrineSetting(baseSettings, defaultSetting);
    if (setting === undefined) return;

    const shrineCharges = _getBoneShrineCharges(setting);
    const boneShrineGather = _getBoneShrineGather(setting);

    const boneShrineAncientTreasure = game.mapUnlocks.AncientTreasure.canRunOnce ? setting.atlantrimp : false;
    const ancientTreasure = getAncientTreasureName();
    if (boneShrineAncientTreasure) runUniqueMap(ancientTreasure);

    const map = getCurrentMapObject();
    if (!boneShrineAncientTreasure || (game.global.mapsActive && map.name === ancientTreasure && game.global.lastClearedMapCell >= map.size - 30)) {
        // Use bone charges
        // Equip staff for the gather type the user is using
        const gatherStaff = 'heirloomStaff' + boneShrineGather[0].toUpperCase() + boneShrineGather.slice(1);
        if (getPageSetting(gatherStaff) !== 'undefined') heirloomEquipStaff(gatherStaff);
        else heirloomEquipStaff('heirloomStaffMap');

        if (getPageSetting('jobType') > 0) buyJobs(setting.jobratio);
        safeSetGather(boneShrineGather);

        for (let i = 0; i < shrineCharges; i++) {
            game.permaBoneBonuses.boosts.consume();
        }
        debug(`Consumed ${shrineCharges} bone shrine charge${shrineCharges === 1 ? '' : 's'} on zone ${game.global.world} and gained ${boneShrineOutput(shrineCharges)} bones.`);

        if (setting && settingName && setting.row) {
            let value = game.global.universe === 2 ? 'valueU2' : 'value';
            game.global.addonUser[settingName][value][setting.row].done = getTotalPortals() + '_' + game.global.world;
        }
    }
}

function _getBoneShrineSetting(defaultSetting, baseSettings) {
    const boneCharges = game.permaBoneBonuses.boosts.charges;
    // If we have enough bone charges then spend them automatically to stop from capping
    if (defaultSetting.autoBone && boneCharges >= defaultSetting.bonebelow && game.global.world >= defaultSetting.world) {
        if (setting.bonebelow <= 0) setting.bonebelow = 999;
        defaultSetting.atlantrimp = false;
        defaultSetting.boneamount = 1;
        return defaultSetting;
    }

    for (let i = 1; i < baseSettings.length; i++) {
        const currSetting = baseSettings[i];
        const world = currSetting.world;
        if (!settingShouldRun(currSetting, world, 0, settingName)) continue;
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
    return totals[0] + ' Food, ' + totals[1] + ' Wood, and ' + totals[2] + ' Metal.';
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
    const packMod = getPerkLevel('Packrat') * game.portal.Packrat.modifier;

    while (total > calcHeirloomBonus('Shield', 'storageSize', tempMax + tempMax * packMod)) {
        const nextCost = calculatePercentageBuildingCost(resourceMap[1], resourceMap[0], 0.25, tempMax);
        if (total < nextCost) break;
        total -= nextCost;
        tempMax *= 2;
    }
    return total - resource['owned'];
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
    if (trimpStats.isDaily && !game.singleRunBonuses.heliumy.owned && getPageSetting('buyheliumy', portalUniverse) > 0 && getDailyHeliumValue(countDailyWeight()) >= getPageSetting('buyheliumy', portalUniverse) && game.global.b >= 100) {
        purchaseSingleRunBonus('heliumy');
        debug('Purchased ' + (currSettingUniverse === 2 ? 'Radonculous' : 'Heliumy') + '  for 100 bones on this ' + getPageSetting('buyheliumy', portalUniverse) + '% daily.', 'bones');
    }
}
