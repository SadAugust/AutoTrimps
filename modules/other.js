MODULES['other'] = {};

function isCorruptionActive(targetZone) {
    if (game.global.universe == 2) return 9999;
    if (challengeActive('Eradicated')) return 1;
    if (challengeActive('Corrupted')) return 60;
    return targetZone >= (game.talents.headstart.purchased && !game.global.runningChallengeSquared ? (game.talents.headstart2.purchased ? (game.talents.headstart3.purchased ? 151 : 166) : 176) : 181);
}

function autoRoboTrimp() {
    if (game.global.roboTrimpLevel === 0) return;
    if (game.global.roboTrimpCooldown !== 0) return;
    if (getPageSetting('AutoRoboTrimp') > game.global.world || getPageSetting('AutoRoboTrimp') <= 0) return;

    var shouldShriek = (game.global.world - parseInt(getPageSetting('AutoRoboTrimp'))) % 5 === 0;
    if (shouldShriek) {
        if (!game.global.useShriek) {
            magnetoShriek();
            debug('Activated Robotrimp MagnetoShriek Ability @ z' + game.global.world, 'zone', '*podcast');
        }
    } else if (game.global.useShriek) magnetoShriek();
}

function getZoneEmpowerment(zone) {
    if (!zone) return 'None';
    var natureStartingZone = game.global.universe === 1 ? getNatureStartZone() : 236;
    if (zone < natureStartingZone) return 'None';
    var activeEmpowerments = ['Poison', 'Wind', 'Ice'];
    zone = Math.floor((zone - natureStartingZone) / 5);
    zone = zone % activeEmpowerments.length;
    return activeEmpowerments[zone];
}

function fluffyEvolution() {
    if (game.global.universe !== 1) return;
    if (Fluffy.currentLevel !== 10) return;
    if (game.global.fluffyPrestige === 10) return;
    if (!getPageSetting('fluffyEvolve')) return;
    if (game.global.world < getPageSetting('fluffyMinZone')) return;
    if (game.global.world > getPageSetting('fluffyMaxZone')) return;
    //Only evolve if you can afford all the bone portals that you want to purchase at the start of your next evolution
    var bpsToUse = getPageSetting('fluffyBP');
    if (bpsToUse > 0 && game.global.b % 100 < bpsToUse) return;

    var perkRespec = false;
    if (getPageSetting('fluffyRespec') && getPageSetting('autoPerks') && !game.portal.Cunning.locked) {
        const perkLevels = getPerkLevel('Cunning') + getPerkLevel('Curious') + getPerkLevel('Classy');
        if (perkLevels <= 0) {
            if (!game.global.canRespecPerks) return;
            perkRespec = true;
        }
    }

    //Only evolve when you're either in a liquification zone or you're x-overkill cells away from the end of the zone
    const liquified = game.global.gridArray && game.global.gridArray[0] && game.global.gridArray[0].name === 'Liquimp';
    if (!liquified && getCurrentWorldCell().level + Math.max(0, maxOneShotPower(true) - 1) < 100) return;

    Fluffy.prestige();

    while (bpsToUse > 0) {
        purchaseMisc('helium');
        bpsToUse--;
    }
    hideBones();

    if (perkRespec) {
        viewPortalUpgrades();
        fireAllWorkers();
        runPerky();
        activateClicked();
    }
    return;
}

//Remakes challenge/setting popup if the user doesn't click confirm and it's not showing.
function remakeTooltip() {
    if (!MODULES.popups.challenge && !MODULES.popups.respecAtlantrimp && !MODULES.popups.portal) {
        if (!MODULES.popups.challenge) delete hzeMessage;
        return;
    }

    if (!game.global.lockTooltip) {
        if (MODULES.popups.respecAtlantrimp) {
            var respecName = !trimpStats.isC3 ? 'Radon ' : '' + 'Combat Respec';
            if (game.global.universe === 1) respecName = 'Spire';
            var description = '<p><b>Respeccing into the ' + respecName + ' preset.</b></p>';
            tooltip('confirm', null, 'update', description + '<p>Hit <b>Disable Respec</b> to stop this.</p>', 'MODULES.popups.respecAtlantrimp = false', '<b>NOTICE: Auto-Respeccing in ' + MODULES.popups.remainingTime + ' seconds....</b>', 'Disable Respec');
        } else if (MODULES.popups.challenge) {
            tooltip('confirm', null, 'update', hzeMessage, 'MODULES.popups.challenge = false, delete hzeMessage', 'AutoTrimps New Unlock!');
        } else {
            tooltip('confirm', null, 'update', '<b>Auto Portaling NOW!</b><p>Hit Delay Portal to WAIT 1 more zone.', 'MODULES.portal.zonePostpone+=1; MODULES.popups.portal = false', '<b>NOTICE: Auto-Portaling in ' + MODULES.popups.remainingTime + ' seconds....</b>', 'Delay Portal');
        }
    } else if (MODULES.popups.respecAtlantrimp) {
        document.getElementById('tipTitle').innerHTML = '<b>NOTICE: Auto-Respeccing in ' + (MODULES.popups.remainingTime / 1000).toFixed(1) + ' seconds....</b>';
    } else if (MODULES.popups.portal) {
        document.getElementById('tipTitle').innerHTML = '<b>NOTICE: Auto-Portaling in ' + (MODULES.popups.remainingTime / 1000).toFixed(1) + ' seconds....</b>';
    }
}

function saveToSteam(saveData) {
    if (typeof greenworks === 'undefined') return;
    greenworks.saveTextToFile('TrimpsSave.sav', saveData, cloudSaveCallback, cloudSaveErrorCallback);
}

function loadFromSteam() {
    if (typeof greenworks === 'undefined') return;
    greenworks.readTextFromFile('TrimpsSave.sav', loadFromSteamCallback, loadFromSteamErrorCallback);
}

function cloudSaveCallback(data) {}

//Runs a map WITHOUT resetting the mapRunCounter variable so that we can have an accurate count of how many maps we've run
//Check and update each patch!
function runMap_AT() {
    if (game.options.menu.pauseGame.enabled) return;
    if (game.global.lookingAtMap === '') return;
    if (challengeActive('Mapology') && !game.global.currentMapId) {
        if (game.challenges.Mapology.credits < 1) {
            message('You are all out of Map Credits! Clear some more Zones to earn some more.', 'Notices');
            return;
        }
        game.challenges.Mapology.credits--;
        if (game.challenges.Mapology.credits <= 0) game.challenges.Mapology.credits = 0;
        updateMapCredits();
        messageMapCredits();
    }
    if (game.achievements.mapless.earnable) {
        game.achievements.mapless.earnable = false;
        game.achievements.mapless.lastZone = game.global.world;
    }
    if (challengeActive('Quest') && game.challenges.Quest.questId === 5 && !game.challenges.Quest.questComplete) {
        game.challenges.Quest.questProgress++;
        if (game.challenges.Quest.questProgress === 1) game.challenges.Quest.failQuest();
    }
    var mapId = game.global.lookingAtMap;
    game.global.preMapsActive = false;
    game.global.mapsActive = true;
    game.global.currentMapId = mapId;
    mapsSwitch(true);
    var mapObj = getCurrentMapObject();
    if (mapObj.bonus) {
        game.global.mapExtraBonus = mapObj.bonus;
    }
    if (game.global.lastClearedMapCell === -1) {
        buildMapGrid(mapId);
        drawGrid(true);

        if (mapObj.location === 'Void') {
            game.global.voidDeaths = 0;
            game.global.voidBuff = mapObj.voidBuff;
            setVoidBuffTooltip();
        }
    }
    if (challengeActive('Insanity')) game.challenges.Insanity.drawStacks();
    if (challengeActive('Pandemonium')) game.challenges.Pandemonium.drawStacks();
}

//Check and update each patch!
function suicideTrimps() {
    //Throw this in so that if GS updates anything in there it won't cause AT to fuck with it till I can check it out
    //Check out mapsClicked(confirmed) && mapsSwitch(updateOnly, fromRecycle) patch notes for any changes to this section!
    if (game.global.stringVersion > '5.9.5') {
        mapsClicked();
        return;
    }

    if (game.resources.trimps.soldiers > 0) {
        game.global.soldierHealth = 0;
        game.stats.trimpsKilled.value += game.resources.trimps.soldiers;
        game.stats.battlesLost.value++;
        game.resources.trimps.soldiers = 0;
    }

    if (challengeActive('Berserk')) game.challenges.Berserk.trimpDied();
    if (challengeActive('Exterminate')) game.challenges.Exterminate.trimpDied();
    if (getPerkLevel('Frenzy')) game.portal.Frenzy.trimpDied();
    if (challengeActive('Storm')) {
        game.challenges.Storm.alpha = 0;
        game.challenges.Storm.drawStacks();
    }
    if (game.global.novaMutStacks > 0) u2Mutations.types.Nova.drawStacks();
    if (challengeActive('Smithless')) game.challenges.Smithless.drawStacks();

    game.global.mapCounterGoal = 0;
    game.global.titimpLeft = 0;
    game.global.fighting = false;
    game.global.switchToMaps = false;
    game.global.switchToWorld = false;
    game.global.mapsActive = false;
    updateGammaStacks(true);
    resetEmpowerStacks();
}

//Check and update each patch!
function drawAllBuildings(force) {
    if (usingRealTimeOffline && !force) return;
    var elem = document.getElementById('buildingsHere');
    var building;
    elem.innerHTML = '';
    for (var item in game.buildings) {
        building = game.buildings[item];
        if (building.locked === 1) continue;
        drawBuilding(item, elem);
        if (building.alert && game.options.menu.showAlerts.enabled) {
            document.getElementById('buildingsAlert').innerHTML = '!';
            if (document.getElementById(item + 'Alert')) document.getElementById(item + 'Alert').innerHTML = '!';
        }
    }
    updateGeneratorInfo();
}

//Check and update each patch!
function drawAllUpgrades(force) {
    if (usingRealTimeOffline && !force) return;
    var elem = document.getElementById('upgradesHere');
    elem.innerHTML = '';
    for (var item in game.upgrades) {
        if (game.upgrades[item].locked == 1) continue;
        drawUpgrade(item, elem);
        if (game.upgrades[item].alert && game.options.menu.showAlerts.enabled) {
            document.getElementById('upgradesAlert').innerHTML = '!';
            if (document.getElementById(item + 'Alert')) document.getElementById(item + 'Alert').innerHTML = '!';
        }
    }
    goldenUpgradesShown = false;
    displayGoldenUpgrades();
}

//Check and update each patch!
function drawAllEquipment(force) {
    if (usingRealTimeOffline && !force) return;
    var elem = document.getElementById('equipmentHere');
    elem.innerHTML = '';
    for (var item in game.equipment) {
        if (game.equipment[item].locked == 1) continue;
        drawEquipment(item, elem);
    }
    displayEfficientEquipment();
}

//Check and update each patch!
function drawAllJobs(force) {
    if (usingRealTimeOffline && !force) return;
    var elem = document.getElementById('jobsHere');
    elem.innerHTML = '';
    for (var item in game.jobs) {
        if (game.jobs[item].locked == 1) continue;
        if (item == 'Geneticist' && game.global.Geneticistassist) {
            drawGeneticistassist(elem);
        } else drawJob(item, elem);
        if (game.jobs[item].alert && game.options.menu.showAlerts.enabled) {
            document.getElementById('jobsAlert').innerHTML = '!';
            if (document.getElementById(item + 'Alert')) document.getElementById(item + 'Alert').innerHTML = '!';
        }
    }
}

//Check and update each patch!
function updateLabels(force) {
    //Tried just updating as something changes, but seems to be better to do all at once all the time
    if (usingRealTimeOffline && !force) return;
    var toUpdate;
    //Resources (food, wood, metal, trimps, science). Per second will be handled in separate function, and called from job loop.
    for (var item in game.resources) {
        toUpdate = game.resources[item];
        if (!(toUpdate.owned > 0)) {
            toUpdate.owned = parseFloat(toUpdate.owned);
            if (!(toUpdate.owned > 0)) toUpdate.owned = 0;
        }
        if (item == 'radon') continue;
        if (item == 'helium' && game.global.universe == 2) toUpdate = game.resources.radon;
        document.getElementById(item + 'Owned').innerHTML = prettify(Math.floor(toUpdate.owned));
        if (toUpdate.max == -1 || document.getElementById(item + 'Max') === null) continue;
        var newMax = toUpdate.max;
        if (item != 'trimps') newMax = calcHeirloomBonus('Shield', 'storageSize', newMax * (game.portal.Packrat.modifier * getPerkLevel('Packrat') + 1));
        else if (item == 'trimps') newMax = toUpdate.realMax();
        document.getElementById(item + 'Max').innerHTML = prettify(newMax);
        var bar = document.getElementById(item + 'Bar');
        if (game.options.menu.progressBars.enabled) {
            var percentToMax = (toUpdate.owned / newMax) * 100;
            swapClass('percentColor', getBarColorClass(100 - percentToMax), bar);
            bar.style.width = percentToMax + '%';
        }
    }
    updateSideTrimps();
    //Buildings, trap is the only unique building, needs to be displayed in trimp area as well
    for (var itemA in game.buildings) {
        toUpdate = game.buildings[itemA];
        if (toUpdate.locked == 1) continue;
        var elem = document.getElementById(itemA + 'Owned');
        if (elem === null) {
            unlockBuilding(itemA);
            elem = document.getElementById(itemA + 'Owned');
        }
        if (elem === null) continue;
        elem.innerHTML = game.options.menu.menuFormatting.enabled ? prettify(toUpdate.owned) : toUpdate.owned;
        if (itemA == 'Trap') {
            var trap1 = document.getElementById('trimpTrapText');
            if (trap1) trap1.innerHTML = prettify(toUpdate.owned);
            var trap2 = document.getElementById('trimpTrapText2');
            if (trap2) trap2.innerHTML = prettify(toUpdate.owned);
        }
    }
    //Jobs, check PS here and stuff. Trimps per second is handled by breed() function
    for (var itemB in game.jobs) {
        toUpdate = game.jobs[itemB];
        if (toUpdate.locked == 1 && toUpdate.increase == 'custom') continue;
        if (toUpdate.locked == 1) {
            if (game.resources[toUpdate.increase].owned > 0) updatePs(toUpdate, false, itemB);
            continue;
        }
        if (document.getElementById(itemB) === null) {
            unlockJob(itemB);
            drawAllJobs(true);
        }
        document.getElementById(itemB + 'Owned').innerHTML = game.options.menu.menuFormatting.enabled ? prettify(toUpdate.owned) : toUpdate.owned;
        var perSec = toUpdate.owned * toUpdate.modifier;
        updatePs(toUpdate, false, itemB);
    }
    //Upgrades, owned will only exist if 'allowed' exists on object
    for (var itemC in game.upgrades) {
        toUpdate = game.upgrades[itemC];
        if (toUpdate.allowed - toUpdate.done >= 1) toUpdate.locked = 0;
        if (toUpdate.locked == 1) continue;
        if (document.getElementById(itemC) === null) unlockUpgrade(itemC, true);
    }
    //Equipment
    checkAndDisplayEquipment();
}

//Check and update each patch!
function updateButtonColor(what, canAfford, isJob) {
    if (atSettings.initialise.loaded) {
        if (usingRealTimeOffline && !getPageSetting('timeWarpDisplay')) return;
    } else {
        if (usingRealTimeOffline) return;
    }
    if (what == 'Amalgamator') return;
    var elem = document.getElementById(what);
    if (elem === null) {
        return;
    }
    if (game.options.menu.lockOnUnlock.enabled == 1 && new Date().getTime() - 1000 <= game.global.lastUnlock) canAfford = false;
    if (game.global.challengeActive == 'Archaeology' && game.upgrades[what] && game.upgrades[what].isRelic) {
        var className = 'thingColor' + (canAfford ? 'CanAfford' : 'CanNotAfford');
        var nextAuto = game.challenges.Archaeology.checkAutomator();
        if (nextAuto == 'off') className += 'RelicOff';
        else if (nextAuto == 'satisfied') className += 'RelicSatisfied';
        else if (nextAuto == what + 'Cost') className += 'RelicNextWaiting';
        else if (nextAuto + 'Relic' == what) className += 'RelicBuying';
        swapClass('thingColor', className, elem);
        return;
    }
    if (isJob && game.global.firing === true) {
        if (game.jobs[what].owned >= 1) {
            //note for future self:
            //if you need to add more states here, change these to use the swapClass func -grabz
            //with 'thingColor' as first param
            swapClass('thingColor', 'thingColorFiringJob', elem);
        } else {
            swapClass('thingColor', 'thingColorCanNotAfford', elem);
        }
        return;
    }
    if (what == 'Warpstation') {
        if (canAfford) elem.style.backgroundColor = getWarpstationColor();
        else elem.style.backgroundColor = '';
    }

    if (canAfford) {
        if (what == 'Gigastation' && (ctrlPressed || game.options.menu.ctrlGigas.enabled)) swapClass('thingColor', 'thingColorCtrl', elem);
        else swapClass('thingColor', 'thingColorCanAfford', elem);
    } else swapClass('thingColor', 'thingColorCanNotAfford', elem);
}

function trustworthyTrimps_AT(noTip, forceTime, negative) {
    if (!game.global.lastOnline) return;
    var rightNow = new Date().getTime();
    var dif = 0;
    if (forceTime) {
        dif = forceTime;
    } else {
        if (game.global.lastOfflineProgress > rightNow) {
            game.global.lastOfflineProgress = rightNow;
            return;
        }
        game.global.lastOfflineProgress = rightNow;
        dif = rightNow - game.global.lastOnline;
        dif = Math.floor(dif / 1000);
    }
    //if (dif < 60) return;
    var storageBought = [];
    var compatible = ['Farmer', 'Lumberjack', 'Miner', 'Dragimp', 'Explorer'];
    var storages = ['Barn', 'Shed', 'Forge'];
    for (var x = 0; x < compatible.length; x++) {
        var job = game.jobs[compatible[x]];
        var resName = job.increase;
        var resource = game.resources[resName];
        var amt = job.owned * job.modifier;
        amt += amt * getPerkLevel('Motivation') * game.portal.Motivation.modifier;
        if (getPerkLevel('Motivation_II') > 0) amt *= 1 + getPerkLevel('Motivation_II') * game.portal.Motivation_II.modifier;
        if (resName != 'gems' && game.permaBoneBonuses.multitasking.owned > 0 && game.resources.trimps.owned >= game.resources.trimps.realMax()) amt *= 1 + game.permaBoneBonuses.multitasking.mult();
        if (job != 'Explorer') {
            if (game.global.challengeActive == 'Alchemy') amt *= alchObj.getPotionEffect('Potion of Finding');
            amt *= alchObj.getPotionEffect('Elixir of Finding');
        }
        if (game.global.challengeActive == 'Frigid') amt *= game.challenges.Frigid.getShatteredMult();
        if (game.global.pandCompletions && job != 'Explorer') amt *= game.challenges.Pandemonium.getTrimpMult();
        if (game.global.desoCompletions && job != 'Explorer') amt *= game.challenges.Desolation.getTrimpMult();
        if (!game.portal.Observation.radLocked && game.global.universe == 2 && game.portal.Observation.trinkets > 0) amt *= game.portal.Observation.getMult();
        if (resName == 'food' || resName == 'wood' || resName == 'metal') {
            amt *= getParityBonus();
            if (autoBattle.oneTimers.Gathermate.owned && game.global.universe == 2) amt *= autoBattle.oneTimers.Gathermate.getMult();
        }
        if (Fluffy.isRewardActive('gatherer')) amt *= 2;
        if (getPerkLevel('Meditation') > 0 || (game.jobs.Magmamancer.owned > 0 && resName == 'metal')) {
            var medLevel = getPerkLevel('Meditation');
            var toAlter;
            var originalAmt = amt;
            //Find how many stacks of 10 minutes were already stacked before logging out
            var timeAtLastOnline = Math.floor((game.global.lastOnline - game.global.zoneStarted) / 600000);
            //Figure out what percentage of the total time offline one 10 minute chunk is. This will be used to modify amt to the proper amount in 10 minute chunks in order to mimic stacks
            var chunkPercent = 60000 / dif;
            //Start at 100% untouched
            var remaining = 100;
            //if a 10 minute chunk is larger than the time offline, no need to scale in chunks, skip to the end.
            var loops = 6;
            if (game.jobs.Magmamancer.owned && resName == 'metal') loops = 12;
            if (timeAtLastOnline < loops && chunkPercent < 100) {
                //Start from however many stacks were held before logging out. End at 5 stacks, the 6th will be all time remaining rather than chunks and handled at the end
                for (var z = timeAtLastOnline; z < loops; z++) {
                    //If no full chunks left, let the final calculation handle it
                    if (remaining < chunkPercent) break;
                    //Remove a chunk from remaining, as it is about to be calculated
                    remaining -= chunkPercent;
                    //Check for z == 0 after removing chunkPercent, that way however much time was left before the first stack doesn't get calculated as having a stack
                    if (z == 0) continue;
                    //Find out exactly how much of amt needs to be modified to make up for this chunk
                    toAlter = (originalAmt * chunkPercent) / 100;
                    //Remove it from toAlter
                    amt -= toAlter;
                    //Modify and add back
                    if (medLevel && z < 6) amt += toAlter * (1 + z * 0.01 * medLevel);
                    //loops will only set to 72 if the current resource is metal and the player has Magmamancers
                    if (loops == 12) amt += toAlter * game.jobs.Magmamancer.getBonusPercent(false, z);
                }
            }
            if (remaining) {
                //Check again how much needs to be altered
                toAlter = originalAmt * (remaining / 100);
                //Remove
                amt -= toAlter;
                //Modify and add back the final amount
                if (medLevel) amt += toAlter * (1 + game.portal.Meditation.getBonusPercent() * 0.01);
                if (loops == 12) amt += toAlter * game.jobs.Magmamancer.getBonusPercent();
            }
        }
        if (game.global.challengeActive == 'Decay' || game.global.challengeActive == 'Melt') {
            var challenge = game.challenges[game.global.challengeActive];
            amt *= 10;
            amt *= Math.pow(challenge.decayValue, challenge.stacks);
        }
        if (challengeActive('Meditate')) amt *= 1.25;
        if (challengeActive('Balance')) amt *= game.challenges.Balance.getGatherMult();
        if (game.global.challengeActive == 'Unbalance') amt *= game.challenges.Unbalance.getGatherMult();
        if (game.global.challengeActive == 'Archaeology' && resource != 'fragments') amt *= game.challenges.Archaeology.getStatMult('science');
        if (game.global.challengeActive == 'Insanity' && resource != 'fragments') amt *= game.challenges.Insanity.getLootMult();
        if (game.challenges.Nurture.boostsActive() && resource != 'fragments') amt *= game.challenges.Nurture.getResourceBoost();
        if (game.global.challengeActive == 'Desolation' && resource != 'fragments') amt *= game.challenges.Desolation.trimpResourceMult();
        if (game.global.challengeActive == 'Daily') {
            if (typeof game.global.dailyChallenge.famine !== 'undefined' && x < 4) {
                amt *= dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
            }
            if (typeof game.global.dailyChallenge.dedication !== 'undefined') {
                amt *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
            }
        }
        amt = calcHeirloomBonus('Staff', compatible[x] + 'Speed', amt);
        amt *= dif;
        if (x < 3) {
            var newMax = resource.max + resource.max * game.portal.Packrat.modifier * getPerkLevel('Packrat');
            newMax = calcHeirloomBonus('Shield', 'storageSize', newMax);
            var allowed = newMax - resource.owned;
            if (amt > allowed) {
                if (!game.global.autoStorage) {
                    amt = allowed;
                } else {
                    var storageBuilding = game.buildings[storages[x]];
                    var count;
                    for (count = 1; count < 300; count++) {
                        amt -= storageBuilding.cost[resName]();
                        storageBuilding.owned++;
                        storageBuilding.purchased++;
                        resource.max *= 2;
                        newMax = resource.max + resource.max * game.portal.Packrat.modifier * getPerkLevel('Packrat');
                        newMax = calcHeirloomBonus('Shield', 'storageSize', newMax);
                        if (newMax > resource.owned + amt) break;
                    }
                    var s = count > 1 ? 's' : '';
                    storageBought.push(count + ' ' + storages[x] + s + ', ');
                }
            }
        }
        if (amt > 0) {
            if (negative) amt = -amt;
            resource.owned += amt;
            if (resName == 'gems') game.stats.gemsCollected.value += amt;
        }
    }

    if (playerSpire.initialized && playerSpire.lootAvg.average) {
        var avg = playerSpire.getRsPs();
        if (!isNumberBad(avg)) {
            var rsCap = dif;
            if (rsCap > 604800) rsCap = 604800;
            var rsReward = rsCap * 0.75 * avg;
            if (negative) rsReward = -rsReward;
            playerSpire.runestones += rsReward;
        }
    }
}

function removeTrustworthyTrimps() {
    cancelTooltip();
    var dif = Math.floor(offlineProgress.totalOfflineTime / 100);
    var ticks = dif > offlineProgress.maxTicks ? offlineProgress.maxTicks : dif;
    var unusedTicks = dif - ticks;
    if (unusedTicks > 0) trustworthyTrimps_AT(false, unusedTicks / 10, true);
}

//Make AT button visible on timewarp screen if already in TW when loading AT
if (usingRealTimeOffline) {
    setupTimeWarpAT();
    if (game.options.menu.offlineProgress.enabled === 1) removeTrustworthyTrimps();
    cancelTooltip();
}

//Hacky way to allow the SA popup button to work within TW.
autoBattle.originalpopup = autoBattle.popup;
autoBattle.popup = function () {
    var offlineMode = false;
    if (usingRealTimeOffline) {
        offlineMode = true;
        usingRealTimeOffline = false;
    }
    autoBattle.originalpopup(...arguments);
    if (offlineMode) usingRealTimeOffline = true;
};

//Attach AT related buttons to the main TW UI.
//Will attach AutoMaps, AutoMaps Status, AutoTrimps Settings, AutoJobs, AutoStructure
offlineProgress.originalStart = offlineProgress.start;
offlineProgress.start = function () {
    const trustWorthy = game.options.menu.offlineProgress.enabled;
    if (game.options.menu.offlineProgress.enabled === 1) game.options.menu.offlineProgress.enabled = 2;
    offlineProgress.originalStart(...arguments);
    while (game.options.menu.offlineProgress.enabled !== trustWorthy) toggleSetting('offlineProgress');
    try {
        setupTimeWarpAT();
    } catch (e) {
        console.log('Loading Time Warp failed ' + e, 'other');
    }
};

//Try to restart TW once it finishes to ensure we don't miss out on time spent running TW.
offlineProgress.originalFinish = offlineProgress.finish;
offlineProgress.finish = function () {
    //Time we have run TW in seconds
    var timeRun = (new Date().getTime() - offlineProgress.startTime) / 1000;
    //Add on any extra time if your Time Warp was over 24 hours long.
    var offlineTime = offlineProgress.totalOfflineTime / 1000 - 86400;
    timeRun += Math.max(0, offlineTime);
    //if (timeRun > 86400) offlineProgress.maxTicks = timeRun * 1000;
    if (game.options.menu.autoSave.enabled !== atSettings.autoSave) toggleSetting('autoSave');
    offlineProgress.originalFinish(...arguments);
    try {
        //Rerun TW if it took over 30 seconds to complete
        if (timeRun > 30) {
            debug(`Running Time Warp again for ${offlineProgress.formatTime(Math.min(timeRun, offlineProgress.maxTicks / 10))} to catchup on the time you missed whilst running it.`);
            //Convert time to milliseconds and subtract it from the variables that TW uses to calculate offline progress so we don't have tons of time related issues.
            timeRun *= 1000;
            game.global.lastOnline -= timeRun;
            game.global.portalTime -= timeRun;
            game.global.zoneStarted -= timeRun;
            game.global.lastSoldierSentAt -= timeRun;
            game.global.lastSkeletimp -= timeRun;
            game.permaBoneBonuses.boosts.lastChargeAt -= timeRun;
            offlineProgress.start();
        } else if (game.options.menu.autoSave.enabled !== atSettings.autoSave) toggleSetting('autoSave');
    } catch (e) {
        console.log('Failed to restart Time Warp to finish it off. ' + e, 'other');
    }
};

function _verticalCenterTooltip(makeLarge, makeSuperLarge) {
    var tipElem = document.getElementById('tooltipDiv');
    if (makeLarge) {
        swapClass('tooltipExtra', 'tooltipExtraLg', tipElem);
        tipElem.style.left = '25%';
    }
    if (makeSuperLarge) {
        swapClass('tooltipExtra', 'tooltipExtraSuperLg', tipElem);
        tipElem.style.left = '17.5%';
    }
    var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var tipHeight = Math.max(tipElem.clientHeight, tipElem.innerHeight || 0);
    if (makeLarge && tipHeight / height > 0.95) {
        document.getElementById('tipText').className = 'tinyTextTip';
        tipHeight = Math.max(tipElem.clientHeight, tipElem.innerHeight || 0);
    }
    var dif = height - tipHeight;
    tipElem.style.top = dif > 0 ? dif / 2 + 'px' : '0';
}

function archaeologyAutomator() {
    if (!challengeActive('Archaeology') || !getPageSetting('archaeology')) return;
    const string1 = getPageSetting('archaeologyString1'),
        string2 = getPageSetting('archaeologyString2'),
        string3 = getPageSetting('archaeologyString3');

    if (string3[0] !== 'undefined' && string3[0] <= game.global.world) {
        let string = string3.slice(1).toString();
        if (string !== game.global.archString) game.global.archString = string;
    } else if (string2[0] !== 'undefined' && string2[0] <= game.global.world) {
        let string = string2.slice(1).toString();
        if (string !== game.global.archString) game.global.archString = string;
    } else if (string1[0] !== 'undefined') {
        let string = string1.slice(1).toString();
        if (string !== game.global.archString) game.global.archString = string;
    }
}
