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

function archaeologyAutomator() {
    if (!challengeActive('Archaeology') || !getPageSetting('archaeology')) return;
    const string1 = getPageSetting('archaeologyString1'),
        string2 = getPageSetting('archaeologyString2'),
        string3 = getPageSetting('archaeologyString3');
    let string;
    if (mapSettings.relicString && getPageSetting('autoMaps')) {
        string = mapSettings.relicString;
        if (string !== game.global.archString) game.global.archString = string;
    } else if (string3[0] !== 'undefined' && string3[0] <= game.global.world) {
        string = string3.slice(1).toString();
        if (string !== game.global.archString) game.global.archString = string;
    } else if (string2[0] !== 'undefined' && string2[0] <= game.global.world) {
        string = string2.slice(1).toString();
        if (string !== game.global.archString) game.global.archString = string;
    } else if (string1[0] !== 'undefined') {
        string = string1.toString();
        if (string !== game.global.archString) game.global.archString = string;
    }
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
/* 
raspberry pi related setting changes
Swaps base settings to improve performance & so that I can't accidentally pause.
Shouldn't impact anybody else that uses AT as they'll never set the gameUser setting to SadAugust. 
*/
function _raspberryPiSettings() {
    if (autoTrimpSettings.gameUser.value !== 'SadAugust') return;
    if (navigator.oscpu === 'Linux armv7l') {
        game.options.menu.hotkeys.enabled = 0;
        game.options.menu.progressBars.enabled = 0;
        game.options.menu.showHeirloomAnimations.enabled = 0;
    } else {
        game.options.menu.hotkeys.enabled = 1;
        game.options.menu.progressBars.enabled = 2;
        game.options.menu.showHeirloomAnimations.enabled = 1;
    }
}

function _adjustGlobalTimers(keys, adjustment) {
    keys.forEach((key) => {
        if (key === 'lastChargeAt') game.permaBoneBonuses.boosts[keys] += adjustment;
        else game.global[key] += adjustment;
    });
}

function _timeWarpSave() {
    const reduceBy = offlineProgress.totalOfflineTime - offlineProgress.ticksProcessed * 100;
    const keys = ['lastOnline', 'portalTime', 'zoneStarted', 'lastSoldierSentAt', 'lastSkeletimp'];

    _adjustGlobalTimers(keys, -reduceBy);

    save(false, true);

    _adjustGlobalTimers(keys, reduceBy);

    debug(`Game Saved! ${formatTimeForDescriptions(reduceBy / 1000)} hours of offline progress left to process.`, `offline`);
}

function _timeWarpAutoSaveSetting() {
    atSettings.autoSave = game.options.menu.autoSave.enabled;
    atSettings.loops.atTimeLapseFastLoop = true;
    if (game.options.menu.autoSave.enabled) toggleSetting('autoSave');
}

function _timeWarpUpdateUIDisplay() {
    if (!usingRealTimeOffline || !getPageSetting('timeWarpDisplay')) return;
    usingRealTimeOffline = false;
    var enemy = getCurrentEnemy();
    updateGoodBar();
    updateBadBar(enemy);
    document.getElementById('goodGuyHealthMax').innerHTML = prettify(game.global.soldierHealthMax);
    document.getElementById('badGuyHealthMax').innerHTML = prettify(enemy.maxHealth);

    var blockDisplay = '';
    //Prismatic Shield for U2
    if (game.global.universe == 2) {
        var esMax = game.global.soldierEnergyShieldMax;
        var esMult = getEnergyShieldMult();
        var layers = Fluffy.isRewardActive('shieldlayer');
        if (layers > 0) {
            esMax *= layers + 1;
            esMult *= layers + 1;
        }
        blockDisplay = prettify(esMax) + ' (' + Math.round(esMult * 100) + '%)';
    }
    //Block for U1
    else blockDisplay = prettify(game.global.soldierCurrentBlock);
    document.getElementById('goodGuyBlock').innerHTML = blockDisplay;
    document.getElementById('goodGuyAttack').innerHTML = calculateDamage(game.global.soldierCurrentAttack, true, true);
    var badAttackElem = document.getElementById('badGuyAttack');
    badAttackElem.innerHTML = calculateDamage(getCurrentEnemy().attack, true, false, false, getCurrentEnemy());

    updateLabels(true);
    displayMostEfficientEquipment();
    usingRealTimeOffline = true;
}

function _timeWarpUpdateEquipment() {
    for (var equipName in game.equipment) {
        var upgradeName = MODULES.equipment[equipName].upgrade;
        if (game.upgrades[upgradeName].locked === 1) continue;
        if (document.getElementById(upgradeName) === null) {
            drawUpgrade(upgradeName, document.getElementById('upgradesHere'));
        }
    }
}

function _timeWarpATFunctions() {
    //Running a few functions everytime the game loop runs to ensure we aren't missing out on any mapping that needs to be done.
    farmingDecision();
    autoMaps();
    callBetterAutoFight();
    autoPortalCheck();
    if (loops % 10 === 0 || atSettings.portal.aWholeNewWorld) autoMapsStatus();
    if (game.global.universe === 1) checkStanceSetting();
    if (game.global.universe === 2) equalityManagement();
    guiLoop();
}

function _handleMazWindow() {
    const mazSettings = ['Map Farm', 'Map Bonus', 'Void Map', 'HD Farm', 'Raiding', 'Bionic Raiding', 'Balance Destack', 'Toxicity', 'Quagmire', 'Archaeology', 'Insanity', 'Alchemy', 'Hypothermia', 'Bone Shrine', 'Auto Golden', 'Tribute Farm', 'Smithy Farm', 'Worshipper Farm', 'Desolation Gear Scumming', 'C2 Runner', 'C3 Runner'];
    var tipElem = document.getElementById('tooltipDiv');

    if (mazSettings.indexOf(tipElem.children.tipTitle.innerText) === -1) {
        tipElem.style.overflowY = '';
        tipElem.style.maxHeight = '';
        tipElem.style.width = '';
        MODULES.popups.mazWindowOpen = false;
    }
}

function _handleIntervals() {
    if (atSettings.intervals.tenMinute) atVersionChecker();
    if (atSettings.intervals.oneSecond) {
        trimpStats = new TrimpStats();
        hdStats = new HDStats();
    }
}

function _handleSlowScumming() {
    if (MODULES.maps.slowScumming && game.global.mapRunCounter !== 0) {
        if (game.global.mapBonus === 10) MODULES.maps.slowScumming = false;
        else {
            slowScum();
            return true;
        }
    }
    return false;
}

function _handlePopupTimer() {
    if (MODULES.popups.remainingTime === 5000) {
        MODULES.popups.remainingTime -= 0.0001;
        MODULES.popups.intervalID = setInterval(function () {
            if (MODULES.popups.remainingTime === Infinity) clearInterval(MODULES.popups.intervalID);
            MODULES.popups.remainingTime -= 100;
            if (MODULES.popups.remainingTime <= 0) MODULES.popups.remainingTime = 0;
        }, 100);
    }
}
