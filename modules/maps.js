//Mapping Variables
MODULES.maps = {
    fragmentFarming: false,
    lifeActive: false,
    lifeCell: 0,
    slowScumming: false,
    mapRepeats: 0,
    mapRepeatsSmithy: [0, 0, 0],
    mapTimer: 0,
    lastMapWeWereIn: null,
    fragmentCost: Infinity
};

function updateAutoMapsStatus(get) {
    let status = '';
    //Setting up status
    if (!game.global.mapsUnlocked) status = 'Maps not unlocked!';
    else if (game.global.mapsActive && getCurrentMapObject().noRecycle && getCurrentMapObject().location !== 'Bionic' && getCurrentMapObject().location !== 'Void' && mapSettings.mapName !== 'Quagmire Farm' && getCurrentMapObject().location !== 'Darkness') status = getCurrentMapObject().name;
    else if (challengeActive('Mapology') && game.challenges.Mapology.credits < 1) status = 'Out of Map Credits';
    else if (mapSettings.mapName !== '') status = mapSettings.status;
    //Advancing
    else status = 'Advancing';

    if (getPageSetting('autoMaps') === 0) status = '[Auto Maps Off] ' + status;

    if (usingRealTimeOffline && getPageSetting('timeWarpDisplay')) {
        let ticks = offlineProgress.ticksProcessed;
        let maxTicks = offlineProgress.progressMax;
        let barWidth = ((ticks / maxTicks) * 100).toFixed(1) + '%';

        status = 'Time Warp - ' + barWidth + '<br>' + status;
    }

    let resourceType = game.global.universe === 1 ? 'Helium' : 'Radon';
    let resourceShortened = game.global.universe === 1 ? 'He' : 'Rn';
    let getPercent = (game.stats.heliumHour.value() / (game.global['total' + resourceType + 'Earned'] - game.resources[resourceType.toLowerCase()].owned)) * 100;
    let lifetime = (game.resources[resourceType.toLowerCase()].owned / (game.global['total' + resourceType + 'Earned'] - game.resources[resourceType.toLowerCase()].owned)) * 100;
    let hiderStatus = resourceShortened + '/hr: ' + (getPercent > 0 ? getPercent.toFixed(3) : 0) + '%<br>&nbsp;&nbsp;&nbsp;' + resourceShortened + ': ' + (lifetime > 0 ? lifetime.toFixed(3) : 0) + '%';

    if (get) {
        return [status, getPercent, lifetime];
    }
    //Set auto maps status when inside of TW
    if (usingRealTimeOffline && !getPageSetting('timeWarpDisplay') && document.getElementById('autoMapStatusTW') !== null) {
        //Add in a header for the status to let the user know what it is
        let statusMsg = '<h9>Auto Maps Status</h9><br>' + status;
        let id = game.global.mapsActive ? 'autoMapStatusMapsTW' : 'autoMapStatusTW';
        if (document.getElementById(id).innerHTML !== status) document.getElementById(id).innerHTML = statusMsg;
        document.getElementById(id).setAttribute('onmouseover', makeAutomapStatusTooltip(true));
    }
    //Set auto maps status when outside of TW
    if ((!usingRealTimeOffline || getPageSetting('timeWarpDisplay')) && document.getElementById('autoMapStatus') !== null) {
        if (document.getElementById('autoMapStatus').innerHTML !== status) document.getElementById('autoMapStatus').innerHTML = status;
        document.getElementById('autoMapStatus').setAttribute('onmouseover', makeAutomapStatusTooltip(true));
    }
    //Set hider (he/hr) status when outside of TW
    if ((!usingRealTimeOffline || getPageSetting('timeWarpDisplay')) && document.getElementById('hiderStatus') !== null) {
        if (document.getElementById('hiderStatus').innerHTML !== hiderStatus) document.getElementById('hiderStatus').innerHTML = hiderStatus;
        document.getElementById('hiderStatus').setAttribute('onmouseover', makeResourceTooltip(true));
    }
    //Additional Info tooltip
    if ((!usingRealTimeOffline || getPageSetting('timeWarpDisplay')) && document.getElementById('additionalInfo') !== null) {
        let infoStatus = makeAdditionalInfo();
        if (document.getElementById('additionalInfo').innerHTML !== infoStatus) document.getElementById('additionalInfo').innerHTML = infoStatus;
        document.getElementById('additionalInfo').parentNode.setAttribute('onmouseover', makeAdditionalInfoTooltip(true));
    }
}

function makeAutomapStatusTooltip(mouseover) {
    const mapStacksText = `Will run maps to get up to <i>${getPageSetting('mapBonusStacks')}</i> stacks when World HD Ratio is greater than <i>${prettify(getPageSetting('mapBonusRatio'))}</i>.`;
    const hdRatioText = 'HD Ratio is enemyHealth to yourDamage ratio, effectively hits to kill an enemy. The enemy health check is based on the highest health enemy in the map/zone.';
    let hitsSurvivedText = `Hits Survived is the ratio of hits you can survive against the highest damaging enemy in the map/zone${game.global.universe === 1 ? ' (subtracts Trimp block from that value)' : ''}.`;
    const hitsSurvived = prettify(hdStats.hitsSurvived);
    const hitsSurvivedVoid = prettify(hdStats.hitsSurvivedVoid);
    const hitsSurvivedSetting = targetHitsSurvived();
    const hitsSurvivedValue = hitsSurvivedSetting > 0 ? hitsSurvivedSetting : '∞';
    let tooltipText = '';

    if (mouseover) {
        tooltipText = 'tooltip(' + '"Automaps Status", ' + '"customText", ' + 'event, ' + '"';
    }
    tooltipText += 'Variables that control the current state and target of Automaps.<br>' + 'Values in <b>bold</b> are dynamically calculated based on current zone and activity.<br>' + 'Values in <i>italics</i> are controlled via AT settings (you can change them).<br>';
    if (game.global.universe === 2) {
        if (!game.portal.Equality.radLocked)
            tooltipText += `<br>\
		If you have the Auto Equality setting set to <b>Auto Equality: Advanced</b> then all calculations will factor expected equality value into them.<br>`;
    }
    //Hits Survived
    tooltipText += `<br>` + `<b> Hits Survived info</b > <br>` + `${hitsSurvivedText}<br>` + `Hits Survived: <b>${hitsSurvived}</b> / <i>${hitsSurvivedValue}</i><br>` + `Void Hits Survived: <b>${hitsSurvivedVoid}</b><br>`;

    //Map Setting Info
    tooltipText += `<br>` + `<b>Mapping info</b><br>`;
    if (mapSettings.shouldRun) {
        tooltipText += `Farming Setting: <b>${mapSettings.mapName}</b><br>`;
        tooltipText += `Map level: <b>${mapSettings.mapLevel}</b><br>`;
        tooltipText += `Auto level: <b>${mapSettings.autoLevel}</b><br>`;
        if (mapSettings.settingIndex) tooltipText += `Line run: <b>${mapSettings.settingIndex}</b>${mapSettings.priority ? ` Priority: <b>${mapSettings.priority}</b>` : ``}<br>`;
        tooltipText += `Special: <b>${mapSettings.special !== undefined && mapSettings.special !== '0' ? mapSpecialModifierConfig[mapSettings.special].name : 'None'}</b > <br>`;
        tooltipText += `Wants to run: ${mapSettings.shouldRun}<br>`;
        tooltipText += `Repeat: ${mapSettings.repeat}<br>`;
    } else {
        tooltipText += `Not running<br>`;
    }

    //HD Ratios
    tooltipText +=
        '<br>' +
        `<b>HD Ratio Info</b><br>` +
        `${hdRatioText}<br>` +
        `World HD Ratio ${game.global.universe === 1 ? '(in X formation)' : ''} <b>${prettify(hdStats.hdRatio)}</b><br>` +
        `Map HD Ratio ${game.global.universe === 1 ? '(in X formation)' : ''} <b>${prettify(hdStats.hdRatioMap)}</b><br>` +
        `Void HD Ratio ${game.global.universe === 1 ? '(in X formation)' : ''} <b>${prettify(hdStats.hdRatioVoid)}</b><br>` +
        `${mapStacksText}<br>`;

    if (mouseover) {
        tooltipText += '")';
        return tooltipText;
    } else {
        tooltip('Auto Maps Status', 'customText', 'lock', tooltipText, false, 'center');
        _verticalCenterTooltip(true);
    }
}

function makeResourceTooltip(mouseover) {
    const resource = game.global.universe === 2 ? 'Radon' : 'Helium';
    const resourceHr = game.global.universe === 2 ? 'Rn' : 'He';

    let getPercent = (game.stats.heliumHour.value() / (game.global['total' + resource + 'Earned'] - game.resources[resource.toLowerCase()].owned)) * 100;
    let lifetime = (game.resources[resource.toLowerCase()].owned / (game.global['total' + resource + 'Earned'] - game.resources[resource.toLowerCase()].owned)) * 100;
    const resourceHrMsg = getPercent > 0 ? getPercent.toFixed(3) : 0;
    const lifeTimeMsg = (lifetime > 0 ? lifetime.toFixed(3) : 0) + '%';

    let tooltipText = '';

    if (mouseover) {
        tooltipText = 'tooltip(' + `\"${resource} per hour Info\",` + '"customText", ' + 'event, ' + '"';
    }
    tooltipText += `<b>${resource} per hour</b>: ${resourceHrMsg}<br>` + `Current ${resource} per hour % out of Lifetime ${resourceHr} (not including current+unspent).<br> 0.5% is an ideal peak target. This can tell you when to portal... <br>` + `<b>${resource}</b>: ${lifeTimeMsg}<br>` + `Current run total ${resource} / earned / lifetime ${resourceHr} (not including current)<br>`;

    if (trimpStats.isDaily) {
        let helium = game.stats.heliumHour.value() / (game.global['total' + resource + 'Earned'] - (game.global[resource.toLowerCase() + 'Leftover'] + game.resources[resource.toLowerCase()].owned));
        helium *= 100 + getDailyHeliumValue(countDailyWeight());
        tooltipText += `<b>After Daily ${resource} per hour</b>: ${helium.toFixed(3)}%`;
    }

    if (mouseover) {
        tooltipText += '")';
        return tooltipText;
    } else {
        tooltip(`${resource} per hour info`, 'customText', 'lock', tooltipText, false, 'center');
        _verticalCenterTooltip(true);
    }
}

function makeAdditionalInfoTooltip(mouseover) {
    let tooltipText = '';

    if (mouseover) {
        tooltipText = 'tooltip(' + '"Additional Info", ' + '"customText", ' + 'event, ' + '"';
    }

    if (game.permaBoneBonuses.voidMaps.owned > 0) {
        tooltipText += `<p><b>Void</b><br>`;
        tooltipText += `The progress you have towards the <b>Void Maps</b> permanent bone upgrade counter.</p>`;
    }
    tooltipText += `<p><b>AL (Auto Level)</b><br>`;
    tooltipText += `The level that the script recommends using whilst farming.</p>`;

    tooltipText += `<p><b>AL2 (Auto Level New)</b> The level that the script recommends using whilst farming. This map level output assumes you are running ${trimpStats.mapBiome === 'Plentiful' ? 'Gardens' : trimpStats.mapBiome} and ${trimpStats.mapSpecial !== '0' ? mapSpecialModifierConfig[trimpStats.mapSpecial].name : 'no special'} maps.<br>`;
    tooltipText += `L: The ideal map level for loot gains.<br>`;
    tooltipText += `S: The ideal map level for a mixture of speed and loot gains. Auto Maps will use this when gaining Map Bonus stacks.</p>`;

    if (game.global.universe === 1 && game.jobs.Amalgamator.owned > 0) {
        tooltipText += `<p><b>Breed Timer (B)</b><br>`;
        tooltipText += `The breeding time of your trimps, used to identify how long your <b>Anticipation</b> timer will be if you were to send an army to fight.</p>`;
    }
    //Tenacity timer when you have tenacity
    else if (game.global.universe === 2 && getPerkLevel('Tenacity') > 0) {
        tooltipText += `<p><b>Tenacity Timer (T)</b><br>`;
        tooltipText += `Your current tenacity timer in minutes.</p>`;
    }

    if (mouseover) {
        tooltipText += '")';
        return tooltipText;
    } else {
        tooltip('Additional Info Tooltip', 'customText', 'lock', tooltipText, false, 'center');
        _verticalCenterTooltip(true);
    }
}

function makeAutoPortalHelpTooltip() {
    let tooltipText = '';

    tooltipText += `<p>Auto Portal has a priority as to what it will portal into and if that isn't possible it'll try to portal into the next and so forth.</p>`;
    //C2/C3s
    tooltipText += `<p>To start with if the <b>${cinf()} Runner</b> setting is enabled it will check and see if all of your ${cinf()}'s are up to date according to your settings.</p>`;
    //Dailies
    tooltipText += `<p>Afterwards if the <b>Auto Start Daily</b> setting is enabled then it will portal into a Daily if there are any available to run.</p>`;
    //Fillers
    tooltipText += `<p>If neither of the options above are run then it will portal into the challenge that you have selected in the <b>Auto Portal</b> setting. If that is disabled then it will portal into a challengeless run.</p>`;

    tooltip('Auto Portal Info', 'customText', 'lock', tooltipText, false, 'center');
    _verticalCenterTooltip(true);
}

function makeFarmingDecisionHelpTooltip() {
    let tooltipText = '';

    tooltipText += `<p>Mapping has a priority as to what it will try to run and in what order. This is a static list and can't be modified with the exception of challenge settings only allowing certain settings to be run.</p>`;
    tooltipText += `<p>First it will check to see if you're running a setting and if you are then it will continue until that settings farming has been completed. Afterwards it will go through all of the settings (<b>challenge specific settings will only be shown when running that challenge</b>) in this order:</p>`;
    if (game.global.universe === 1) {
        if (challengeActive('Balance')) tooltipText += `<p><b>Balance Destacking</b></p>`;
        if (challengeActive('Daily')) tooltipText += `<p><b>Daily Bloodthirst Destacking</b></p>`;
        if (!challengeActive('Frugal')) tooltipText += `<p><b>Prestige Climb</b></p>`;
        tooltipText += `<p>Prestige Raiding</p>`;
        if (game.stats.highestLevel.valueTotal() >= 125) tooltipText += `<p>Bionic Raiding</p>`;
        tooltipText += `<p>Map Farm</p>`;
        tooltipText += `<p>HD Farm</p>`;
        tooltipText += `<p>Void Maps</p>`;
        if (challengeActive('Experience')) tooltipText += `<p><b><i>Experience Farm</b></i></p>`;
        tooltipText += `<p>Map Bonus</p>`;
        if (challengeActive('Toxicity')) tooltipText += `<p><b><i>Toxicity Farm</b></i></p>`;
    }

    if (game.global.universe === 2) {
        if (challengeActive('Unbalance')) tooltipText += `<p><b>Unbalance Destacking</b></p>`;
        if (challengeActive('Daily')) tooltipText += `<p><b>Daily Bloodthirst Destacking</b></p>`;
        if (challengeActive('Quest')) tooltipText += `<p><b>Quest Farm</b></p>`;
        if (challengeActive('Storm')) tooltipText += `<p><b>Storm Destacking</b></p>`;
        if (challengeActive('Pandemonium')) tooltipText += `<p><b>Pandemonium Destacking</b></p>`;
        if (challengeActive('Pandemonium')) tooltipText += `<p><b>Pandemonium Equipment Farming</b></p>`;
        if (challengeActive('Desolation')) tooltipText += `<p><b>Desolation Gear Scumming</b></p>`;
        if (challengeActive('Desolation')) tooltipText += `<p><b>Desolation Destacking</b></p>`;
        tooltipText += `<p><b>Prestige Climb</b></p>`;
        tooltipText += `<p>Prestige Raiding</p>`;
        tooltipText += `<p>Smithy Farm</p>`;
        tooltipText += `<p>Map Farm</p>`;
        tooltipText += `<p>Tribute Farm</p>`;
        tooltipText += `<p>Worshipper Farm</p>`;
        if (challengeActive('Quagmire')) tooltipText += `<p>Quagmire Farm</p>`;
        if (challengeActive('Insanity')) tooltipText += `<p>Insanity Farm</p>`;
        if (challengeActive('Alchemy')) tooltipText += `<p>Alchemy Farm</p>`;
        if (challengeActive('Hypothermia')) tooltipText += `<p>Hypothermia Farm</p>`;
        tooltipText += `<p>HD Farm (and Hit Survived)</p>`;
        tooltipText += `<p>Void Maps</p>`;
        tooltipText += `<p>Map Bonus</p>`;
        if (challengeActive('Wither')) tooltipText += `<p><b><i>Wither Farm</b></i></p>`;
        if (challengeActive('Mayhem')) tooltipText += `<p><b><i>Mayhem Destacking</b></i></p>`;
        if (challengeActive('Glass')) tooltipText += `<p><b><i>Glass Destacking</b></i></p>`;
        if (challengeActive('Smithless')) tooltipText += `<p><b><i>Smithless Farm</b></i></p>`;
    }

    tooltip('Auto Maps Priority', 'customText', 'lock', tooltipText, false, 'center');
    _verticalCenterTooltip(true);
}

function makeFragmentDecisionHelpTooltip() {
    let tooltipText = '';

    tooltip('Fragment Decision Info', 'customText', 'lock', tooltipText, false, 'center');
    _verticalCenterTooltip(true);
}

function makeAdditionalInfo() {
    //Void, AutoLevel, Breed Timer, Tenacity information

    let lineBreak = ` | `;

    let description = ``;
    //Free void tracker
    if (game.permaBoneBonuses.voidMaps.owned > 0) {
        let voidValue = game.permaBoneBonuses.voidMaps.owned === 10 ? Math.floor(game.permaBoneBonuses.voidMaps.tracker / 10) : game.permaBoneBonuses.voidMaps.tracker / 10;
        description += `V ${voidValue}/10`;
        description += lineBreak;
    }
    //Mapping auto level
    description += `AL: ${hdStats.autoLevel}`;
    description += lineBreak;
    description += `AL2 (L:${hdStats.autoLevelLoot} S:${hdStats.autoLevelSpeed})`;
    //Breed timer when you have an amalgamator
    if (game.global.universe === 1 && game.jobs.Amalgamator.owned > 0) {
        let breedTimer = Math.floor(new Date().getTime());
        if (game.options.menu.pauseGame.enabled) {
            let dif = breedTimer - game.options.menu.pauseGame.timeAtPause;
            breedTimer -= dif;
        }
        breedTimer -= game.global.lastSoldierSentAt;
        breedTimer /= 1000;

        description += lineBreak;
        description += `B: ${breedTimer.toFixed(0)}s`;
    }
    //Tenacity timer when you have tenacity
    else if (game.global.universe === 2 && getPerkLevel('Tenacity') > 0) {
        description += lineBreak;
        description += `T: ${Math.floor(game.portal.Tenacity.getTime())}m`;
    }

    return description;
}

function findMap(level, special, biome, perfect = false) {
    //Pre-Init
    if (!level) level = 0;
    if (!special) special = getAvailableSpecials('lmc');
    if (!biome) biome = getBiome();

    let mapLoot = biome === 'Farmlands' ? 2.6 : biome === 'Plentiful' ? 1.85 : 1.6;
    if (game.singleRunBonuses.goldMaps.owned) mapLoot += 1;

    for (let mapping in game.global.mapsOwnedArray) {
        let map = game.global.mapsOwnedArray[mapping];
        if (perfect) {
            if (map.size > trimpStats.mapSize) continue;
            if (map.difficulty > trimpStats.mapDifficulty) continue;
            if (map.loot > mapLoot) continue;
            if (map.location !== biome && biome !== 'Random') continue;
        }
        if (game.global.world + level !== map.level) continue;
        if (map.bonus !== special && special !== '0') continue;
        if (map.noRecycle) continue;
        return map.id;
    }

    return false;
}

//Looks to see if we currently have a map that matches the criteria we want to run if not tells us to create a new one
function shouldFarmMapCreation(level, special, biome) {
    const mapCheck = findMap(level, special, biome);
    if (mapCheck) return mapCheck;
    else return 'create';
}

//Decide whether or not to abandon trimps for mapping
function shouldAbandon(zoneCheck = true) {
    const setting = getPageSetting('autoAbandon');
    //If set to smart abandon then only abandon when
    //A) Not fighting OR B) army is dead OR C) you have a new army ready to send out OR D) you can potentially overkill to/past cell 100 (assuming infinity attack)
    if (setting === 2 && (!game.global.fighting || game.global.soldierHealth <= 0 || newArmyRdy() || (zoneCheck && mapSettings.mapName !== 'Map Bonus' && getCurrentWorldCell().level + Math.max(0, maxOneShotPower(true) - 1) >= 100))) return true;
    //If set to always abandon or never abandon and either not fighting or army is dead then abandon and send to maps
    if (setting === 1 || !game.global.fighting || game.global.soldierHealth <= 0) return true;
    //Otherwise don't abandon and keep pushing in world
    return false;
}

function autoMaps() {
    if (!getPageSetting('autoMaps') || !game.global.mapsUnlocked) return;

    if (_checkSitInMaps()) return;

    //Override to disable mapping when we are the world and currently fighting
    //if (game.challenges.Berserk.frenzyStacks > 0 && !game.global.mapsActive && !game.global.preMapsActive && challengeActive('Berserk') && getPageSetting('berserk')) return;

    if (_checkWaitForFrags()) return;

    //Disable maps IF soldier attack is negative OR we're running no maps quest OR running Mapology and no credits available
    if (game.global.soldierCurrentAttack < 0 || currQuest() === 9 || (challengeActive('Mapology') && game.challenges.Mapology.credits < 1)) {
        if (game.global.preMapsActive) mapsClicked();
        return;
    }

    //Stop maps from running if frag farming
    if (MODULES.maps.fragmentFarming) {
        fragmentFarm();
        return;
    }

    if (_lifeMapping()) return;

    if (_vanillaMAZ()) return;

    _mappingDefaults();

    const runUniques = getPageSetting('autoMaps') === 1 && !_insanityDisableUniqueMaps();
    const bionicPool = [];
    let highestMap = null;
    let lowestMap = null;
    let optimalMap = null;
    let voidMap = null;
    let selectedMap = 'world';

    const perfSize = game.talents.mapLoot2.purchased ? 20 : 25;
    const perfMapLoot = game.global.farmlandsUnlocked && game.singleRunBonuses.goldMaps.owned ? 3.6 : game.global.decayDone && game.singleRunBonuses.goldMaps.owned ? 2.85 : game.global.farmlandsUnlocked ? 2.6 : game.global.decayDone ? 1.85 : 1.6;
    const mapBiome = mapSettings.biome !== undefined ? mapSettings.biome : getBiome();
    const uniqueMapsOwned = [];
    //Check to see if the cell is liquified and if so we can replace the cell condition with it
    let runUnique = false;

    //Looping through all of our maps to find the highest, lowest and optimal map.
    for (const map of game.global.mapsOwnedArray) {
        if (!map.noRecycle) {
            if (!highestMap || map.level > highestMap.level) highestMap = map;
            if (!optimalMap) {
                if (mapSettings.mapLevel + game.global.world === map.level && mapSettings.special === map.bonus && map.size === perfSize && map.difficulty === 0.75 && map.loot === perfMapLoot && map.location === mapBiome) {
                    optimalMap = map;
                }
            }
            if (!lowestMap || map.level < lowestMap.level) lowestMap = map;
        } else if (map.noRecycle) {
            if (map.location !== 'Void') uniqueMapsOwned.push(map.name);
            if (runUniques && shouldRunUniqueMap(map)) {
                runUnique = true;
                selectedMap = map.id;
                break;
            }
            if (map.location === 'Bionic') bionicPool.push(map);
            if (map.location === 'Void' && mapSettings.shouldRun && mapSettings.mapName === 'Void Map') {
                voidMap = selectEasierVoidMap(voidMap, map);
            }
        }
    }

    _searchForUniqueMaps(uniqueMapsOwned, runUnique);

    selectedMap = _setSelectedMap(selectedMap, voidMap, optimalMap);

    //Map Repeat
    if (game.global.mapsActive) {
        _setMapRepeat();
        //Going to map chamber. Overrides default 'Auto Abandon' setting.
    } else if (!game.global.preMapsActive && !game.global.mapsActive) {
        if (selectedMap !== 'world') {
            if (!game.global.switchToMaps && shouldAbandon()) mapsClicked();
            if (game.global.switchToMaps) mapsClicked();
        }
        //Creating Maps
    } else if (game.global.preMapsActive) {
        //Recycling maps below world level if 95 or more are owned as the cap is 100.
        if (game.global.mapsOwnedArray.length >= 95) recycleBelow(true);
        if (selectedMap === 'world') {
            mapsClicked();
        } else if (selectedMap === 'prestigeRaid') {
            runPrestigeRaiding();
        } else if (selectedMap === 'bionicRaid') {
            runBionicRaiding(bionicPool);
        } else if (selectedMap === 'create') {
            _abandonMapCheck(runUnique);
            if (mapSettings.shouldRun && mapSettings.mapName !== '') {
                setMapSliders(mapSettings.mapLevel, mapSettings.special, mapBiome, mapSettings.mapSliders, getPageSetting('onlyPerfectMaps'));
            }
            if (updateMapCost(true) > game.resources.fragments.owned) {
                if (_fragmentCheck(highestMap, runUnique)) return;
            } else {
                _purchaseMap(lowestMap);
            }
            //Running unique maps or void maps
        } else {
            runSelectedMap(selectedMap, runUnique);
        }
    }

    _slowScumCheck();
}

function prettifyMap(map) {
    if (!map) return 'none';
    let descriptor;
    if (!map.noRecycle) {
        // a crafted map
        const bonus = map.hasOwnProperty('bonus') ? mapSpecialModifierConfig[map.bonus].name : 'no bonus';
        descriptor = `Level ${map.level} (${bonus}) map`;
    } else if (map.location === 'Void') {
        descriptor = `(void map)`;
    } else {
        descriptor = `(unique map)`;
    }
    return `[${map.id}] ${map.name} ${descriptor}`;
}

function _fragmentCheck(highestMap, runUnique) {
    const mapLevel = parseInt(document.getElementById('mapLevelInput').value) + parseInt(document.getElementById('advExtraLevelSelect').value);
    const mapSpecial = document.getElementById('advSpecialSelect').value === '0' ? 'no special' : document.getElementById('advSpecialSelect').value;
    debug(`Can't afford the designed map (level ${mapLevel} ${mapSpecial})`, 'maps', 'th-large');
    //Runs fragment farming if Explorers are unlocked and can afford a max loot+size sliders map
    if (!game.jobs.Explorer.locked && mapCost(game.talents.mapLoot.purchased ? -1 : 0, getAvailableSpecials('fa'), 'Depths', [9, 9, 0], false) <= game.resources.fragments.owned) fragmentFarm();
    //Disable mapping if we don't have a map and can't afford the one that we want to make.
    else if (highestMap === null) {
        MODULES.maps.fragmentCost = updateMapCost(true);
        mapsClicked();
        debug(`Disabling mapping until we reach ${prettify(MODULES.maps.fragmentCost)} fragments as we don't have any maps to run.`);
        return true;
    }
    //Runs highest map we have available to farm fragments with
    else runSelectedMap(highestMap.id, runUnique);
}

function _setMapRepeat() {
    const mapObj = getCurrentMapObject();
    if ((!mapObj.noRecycle && mapSettings.shouldRun) || mapSettings.mapName === 'Bionic Raiding') {
        //Starting with repeat on
        if (!game.global.repeatMap) repeatClicked();
        //Changing repeat setting to Repeat For Items if Presitge or Bionic Raiding, otherwise set to Repeat Forever
        if (mapSettings.shouldRun && ((mapSettings.mapName === 'Prestige Raiding' && !mapSettings.prestigeFragMapBought) || mapSettings.mapName === 'Bionic Raiding')) {
            if (game.options.menu.repeatUntil.enabled !== 2) {
                game.options.menu.repeatUntil.enabled = 2;
                toggleSetting('repeatUntil', null, false, true);
            }
        } else if (game.options.menu.repeatUntil.enabled !== 0) {
            game.options.menu.repeatUntil.enabled = 0;
            toggleSetting('repeatUntil', null, false, true);
        }
        //Disabling repeat if we shouldn't map
        if (!mapSettings.shouldRun) repeatClicked();
        //Disabling repeat if we'll beat Experience from the BW we're clearing.
        if (game.global.repeatMap && challengeActive('Experience') && mapObj.location === 'Bionic' && game.global.world > 600 && mapObj.level >= 605) {
            repeatClicked();
        }
        if (mapSettings.prestigeFragMapBought && game.global.repeatMap) {
            runPrestigeRaiding();
        }
        if (game.global.repeatMap && !mapSettings.prestigeFragMapBought) {
            if (mapSettings.mapName === 'Prestige Raiding' || mapSettings.mapName === 'Bionic Raiding') {
                if (!mapSettings.repeat) repeatClicked();
            }
            //Disabling repeat if the map isn't the right level or special
            else {
                const mapLevel = typeof mapSettings.mapLevel !== 'undefined' ? mapObj.level - game.global.world : mapSettings.mapLevel;
                const mapSpecial = typeof mapSettings.special !== 'undefined' && mapSettings.special !== '0' ? mapObj.bonus : mapSettings.special;
                if (!mapSettings.repeat || mapLevel !== mapSettings.mapLevel || mapSpecial !== mapSettings.special) repeatClicked();
            }
        }
    } else if (game.global.repeatMap) repeatClicked();
}

function _purchaseMap(lowestMap) {
    let result = buyMap();
    if (result === -2) {
        recycleMap(game.global.mapsOwnedArray.indexOf(lowestMap));
        result = buyMap();
        if (result === -2) debug('AutoMaps unable to recycle to buy map!', 'maps');
    }
    if (result === 1) {
        const mapCost = updateMapCost(true);
        debug(`Bought ${prettifyMap(game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1])}. Spent ${prettify(mapCost)}/${prettify(game.resources.fragments.owned + mapCost)} (${((mapCost / game.resources.fragments.owned) * 100).toFixed(2)}%) fragments.`, 'maps', 'th-large');
        runMap();
        MODULES.maps.lastMapWeWereIn = getCurrentMapObject();
    }
}

function runSelectedMap(mapId, runUnique) {
    _abandonMapCheck(runUnique);
    selectMap(mapId);
    runMap();
    const mapObj = game.global.mapsOwnedArray[getMapIndex(mapId)];
    if (MODULES.maps.lastMapWeWereIn !== mapObj) {
        debug(`Running ${prettifyMap(mapObj)}`, 'maps', 'th-large');
        MODULES.maps.lastMapWeWereIn = mapObj;
    }
}

function _vanillaMAZ() {
    if (!game.options.menu.mapAtZone.enabled || !game.global.canMapAtZone) return false;
    const nextCell = game.global.lastClearedCell + 2;
    const totalPortals = getTotalPortals();
    const setZone = game.options.menu.mapAtZone.getSetZone();
    for (let x = 0; x < setZone.length; x++) {
        if (!setZone[x].on) continue;
        if (game.global.world < setZone[x].world || game.global.world > setZone[x].through) continue;
        if (game.global.preMapsActive && setZone[x].done === totalPortals + '_' + game.global.world + '_' + nextCell) continue;
        if (setZone[x].times === -1 && game.global.world !== setZone[x].world) continue;
        if (setZone[x].times > 0 && (game.global.world - setZone[x].world) % setZone[x].times !== 0) continue;
        if (setZone[x].cell === nextCell) {
            if (setZone[x].until === 6) game.global.mapCounterGoal = 25;
            else if (setZone[x].until === 7) game.global.mapCounterGoal = 50;
            else if (setZone[x].until === 8) game.global.mapCounterGoal = 100;
            else if (setZone[x].until === 9) game.global.mapCounterGoal = setZone[x].rx;
            //Toggle void repeat on if it's disabled and stop Auto Maps from running any further.
            if (game.options.menu.repeatVoids.enabled !== 1) toggleSetting('repeatVoids');
            return true;
        }
    }
    return false;
}

function _checkSitInMaps() {
    if (getPageSetting('sitInMaps') && game.global.world === getPageSetting('sitInMaps_Zone') && game.global.lastClearedCell + 2 >= getPageSetting('sitInMaps_Cell')) {
        if (!game.global.preMapsActive) {
            mapsClicked(true);
            debug('AutoMaps. Sitting in maps. Disable the setting to allow manual gameplay.', 'other');
        }
        return true;
    }
}

//Way to fix an issue with having no maps available to run and no fragments to purchase them
function _checkWaitForFrags() {
    if (MODULES.maps.fragmentCost === Infinity) return;
    if (MODULES.maps.fragmentCost > game.resources.fragments.owned) return true;
    MODULES.maps.fragmentCost = Infinity;
}

//When running Life will go to map chamber to suicide army then go back into the world without fighting until the cell we're on is Living.
//Has a time override as there's a certain cell that will always be unliving so can bypass it this way
function _lifeMapping() {
    if (game.global.mapsActive || challengeActive('Life') || !getPageSetting('life')) return;

    const lifeZone = getPageSetting('lifeZone');
    const lifeStacks = getPageSetting('lifeStacks');
    const currCell = game.global.world + '_' + (game.global.lastClearedCell + 1);
    if (lifeZone > 0 && lifeStacks > 0 && game.global.world >= lifeZone && game.challenges.Life.stacks <= lifeStacks) {
        if (!game.global.fighting && timeForFormatting(game.global.lastSoldierSentAt) >= 40) MODULES.maps.lifeCell = currCell;
        if (MODULES.maps.lifeCell !== currCell && game.global.gridArray[game.global.lastClearedCell + 1].health !== 0 && game.global.gridArray[game.global.lastClearedCell + 1].mutation === 'Living') {
            MODULES.maps.livingActive = true;
            if (game.global.fighting || game.global.preMapsActive) mapsClicked();
            return true;
        }
    }
    MODULES.maps.livingActive = false;
}

function _mappingDefaults() {
    while ([1, 2, 3].includes(game.options.menu.repeatUntil.enabled) && !game.global.mapsActive && !game.global.preMapsActive) toggleSetting('repeatUntil');
    if (game.options.menu.exitTo.enabled) toggleSetting('exitTo');
    if (game.options.menu.repeatVoids.enabled) toggleSetting('repeatVoids');

    //Reset to defaults when on world grid
    if (!game.global.mapsActive && !game.global.preMapsActive) {
        game.global.mapRunCounter = 0;
        MODULES.maps.mapTimer = 0;
    }
}

function _searchForUniqueMaps(mapsOwned, runUnique = true) {
    const uniqueMapSetting = getPageSetting('uniqueMapSettingsArray');
    const liquified = game.global.gridArray && game.global.gridArray[0] && game.global.gridArray[0].name === 'Liquimp';

    //Filter unique maps that we want to run and aren't available to be run.
    let uniqueMapsToGet = Object.keys(uniqueMapSetting)
        .filter((mapName) => !mapName.includes('MP Smithy'))
        .filter((mapName) => uniqueMapSetting[mapName].enabled)
        .filter((mapName) => uniqueMapSetting[mapName].zone <= game.global.world)
        .filter((mapName) => liquified || uniqueMapSetting[mapName].cell <= game.global.lastClearedCell + 2)
        .filter((mapName) => !mapsOwned.includes(mapName))
        .filter((mapName) => MODULES.mapFunctions.uniqueMaps[mapName].universe === game.global.universe)
        .filter((mapName) => MODULES.mapFunctions.uniqueMaps[mapName].mapUnlock)
        .filter((mapName) => MODULES.mapFunctions.uniqueMaps[mapName].zone <= game.global.world + (trimpStats.plusLevels ? 10 : 0));

    //Loop through unique map settings and obtain any unique maps that are to be run but aren't currently owned.
    if (!runUnique && uniqueMapsToGet.length > 0) mapSettings = obtainUniqueMap(uniqueMapsToGet.sort((a, b) => MODULES.mapFunctions.uniqueMaps[b].zone - MODULES.mapFunctions.uniqueMaps[a].zone)[0]);
}

//Telling AT to create a map or setting void map as map to be run.
function _setSelectedMap(selectedMap, voidMap, optimalMap) {
    const mapBiome = mapSettings.biome !== undefined ? mapSettings.biome : getBiome();
    if (selectedMap === 'world' && mapSettings.mapName !== '' && mapSettings.shouldRun) {
        if (voidMap) selectedMap = voidMap.id;
        else if (mapSettings.mapName === 'Prestige Raiding') selectedMap = 'prestigeRaid';
        else if (mapSettings.mapName === 'Bionic Raiding') selectedMap = 'bionicRaid';
        else if (optimalMap) selectedMap = optimalMap.id;
        else selectedMap = shouldFarmMapCreation(mapSettings.mapLevel, mapSettings.special, mapBiome);
        if (MODULES.maps.mapTimer === 0) MODULES.maps.mapTimer = getZoneSeconds();
    }

    return selectedMap;
}

//Before we create a map check if we are currently in a map and if it doesn't match our farming type then recycle it.
function _abandonMapCheck(runUnique) {
    if (mapSettings.mapName === 'Desolation Gear Scum' && game.global.lastClearedCell + 2 === 1) return;
    if (game.global.currentMapId !== '') {
        //If we don't have info on the previous map then set it.
        if (MODULES.maps.lastMapWeWereIn === null) MODULES.maps.lastMapWeWereIn = game.global.mapsOwnedArray[getMapIndex(game.global.currentMapId)];

        //Ensure the map has the correct biome, if not then recycle it.
        if (mapSettings.biome && MODULES.maps.lastMapWeWereIn.location !== mapSettings.biome) recycleMap();
        //If the selected map is the wrong level then recycle it.
        if (MODULES.maps.lastMapWeWereIn.level !== mapSettings.mapLevel + game.global.world) recycleMap();
        //If the selected map is the wrong special then recycle it.
        //Since the game doesn't track bonus if it doesn't exist we need to check if the last map we were in had a bonus or not.
        if (MODULES.maps.lastMapWeWereIn.bonus === undefined) {
            if (mapSettings.special !== '0') recycleMap();
        } else if (MODULES.maps.lastMapWeWereIn.bonus !== mapSettings.special) recycleMap();
        if (runUnique && game.global.currentMapId !== selectedMap) recycleMap();
    }
}

function _slowScumCheck() {
    if (MODULES.maps.slowScumming || !game.global.mapsActive || game.global.universe !== 2) return;
    if (getPageSetting('testMapScummingValue') <= 0 || hdStats.hdRatioMap < getPageSetting('testMapScummingValue')) return;
    let canSlowScum = ['Map Bonus', 'Prestige Raiding', 'Mayhem Destacking', 'Pandemonium Destacking', 'Desolation Gear Scum'].indexOf(mapSettings.mapName) !== -1;
    if (!canSlowScum) return;
    const mapObj = getCurrentMapObject();
    if (mapObj.noRecycle || mapObj.size !== 20) return;
    if (game.global.mapRunCounter !== 0 || !MODULES.maps.slowScumming) slowScum();
}
