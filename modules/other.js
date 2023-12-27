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

//Checks to see if we should inform the user of any new challenge unlocks.
function _challengeUnlockCheck() {
    if (atSettings.initialise.basepath === 'https://localhost:8887/AutoTrimps_Local/') return;

    function isChallengeUnlocked(challenge) {
        return (MODULES.u1unlocks && MODULES.u1unlocks.includes(challenge)) || (MODULES.u2unlocks && MODULES.u2unlocks.includes(challenge));
    }

    function isSpecialChallenge(challenge) {
        const specialChallenges = ['Frigid', 'Experience', 'Mayhem', 'Pandemonium', 'Desolation'];
        return specialChallenges.includes(challenge);
    }

    function challengeUnlock(challenge, setting, c2) {
        if (isChallengeUnlocked(challenge)) return '';

        const c2Msg = game.global.universe === 2 ? '3' : '2';
        let msg = `You have unlocked the ${challenge} challenge. It has now been added to ${c2 ? 'Challenge ' + c2Msg + ' Auto Portal setting' : 'Auto Portal'}`;
        msg += setting ? ` & there's settings for it in the scripts ${c2 ? '"C' + c2Msg + '"' : '"Challenges"'} tab.` : '.';
        if (isSpecialChallenge(challenge)) {
            msg += `<br><br><b>This is a special challenge and will use ${cinf()} settings when run.</b>`;
        }
        return msg;
    }

    let message = '';
    let unlockedChallenges = [];

    if (game.global.universe === 1) {
        const hze = game.stats.highestLevel.valueTotal();

        const challengeLevels = [
            { level: 10, name: 'Discipline', condition: () => getTotalPerkResource(true) >= 30, c2: true },
            { level: 25, name: 'Metal', c2: true },
            { level: 35, name: 'Size', c2: true },
            { level: 40, name: 'Balance', setting: true },
            { level: 45, name: 'Meditate', c2: true },
            { level: 55, name: 'Decay', setting: true },
            { level: 60, name: 'Warpstation', message: "Upon unlocking Warpstations's the script has a new settings tab available called 'Buildings'. Here you will find a variety of settings that will help with this new feature." },
            { level: 60, name: 'Trimp' },
            { level: 70, name: 'Trapper', c2: true },
            { level: 80, name: 'Electricity', condition: () => game.global.prisonClear >= 1, c2: true },
            { level: 100, name: 'Daily', message: 'You can now access the Daily tab within the the scripts settings. Here you will find a variety of settings that will help optimise your dailies.' },
            { level: 110, name: 'Life', setting: true },
            { level: 120, name: 'Coordinate', c2: true },
            { level: 125, name: 'Crushed' },
            { level: 130, name: 'Slow', setting: true, c2: true },
            { level: 145, name: 'Nom', setting: true, c2: true },
            { level: 150, name: 'Mapology', setting: true, c2: true },
            { level: 165, name: 'Toxicity', setting: true, c2: true },
            { level: 180, name: 'Watch', setting: true, c2: true },
            { level: 180, name: 'Lead', setting: true, c2: true },
            { level: 215, name: 'Domination', setting: true, c2: true },
            {
                level: 230,
                name: 'Dimensional Generator',
                message: "Upon unlocking the Dimensional Generator building the script has a new settings tab available called 'Magma'. Here you will find a variety of settings that will help optimise your generator. Additionally there's a new setting in the 'Buildings' tab called 'Advanced Nurseries' that will potentially be of help with the Nursery destruction mechanic."
            },
            { level: 236, name: 'Nature', message: "Upon unlocking Nature, AutoTrimps has a new settings tab available called <b>Nature</b>'. Here you will find a variety of settings that will help with this new feature." },
            { level: 425, name: 'Obliterated', setting: true, c2: true },
            { level: 10, name: 'Eradicated', condition: () => game.global.totalSquaredReward >= 4500, setting: true, c2: true },
            { level: 460, name: 'Frigid', setting: true, c2: true },
            { level: 600, name: 'Experience', setting: true, c2: true },
            { level: 65, name: 'Challenge 2', message: "Due to unlocking Challenge 2's there is now a Challenge 2 option under Auto Portal to be able to auto portal into them. Also you can now access the C2 tab within the the scripts settings." }
        ];

        unlockedChallenges = challengeLevels.filter((challenge) => hze >= challenge.level && (!challenge.condition || challenge.condition()) && !MODULES.u1unlocks.includes(challenge.name));
        const unlockedChallengeArray = unlockedChallenges.map((challenge) => challenge.name);

        if (Object.keys(MODULES.u1unlocks).length === 0) {
            MODULES.u1unlocks = unlockedChallengeArray;
            return;
        }

        MODULES.u1unlocks = unlockedChallengeArray;
    } else if (game.global.universe === 2) {
        const hze = game.stats.highestRadLevel.valueTotal();

        const challengeLevels = [
            { level: 25, name: 'Transmute', message: 'You have unlocked the Transmute challenge. Any metal related settings will be converted to wood instead while running this challenge.' },
            { level: 30, name: 'Daily', message: 'You can now access the Daily tab within the the scripts settings. Here you will find a variety of settings that will help optimise your dailies.' },
            { level: 35, name: 'Unbalance', setting: true, c2: true },
            { level: 45, name: 'Duel', setting: true, c2: true },
            { level: 40, name: 'Bublé' },
            { level: 50, name: 'Melt', c3: true, worshippers: true },
            { level: 60, name: 'Trappapalooza', setting: true, c2: true },
            { level: 70, name: 'Quagmire', setting: true, c2: false },
            { level: 70, name: 'Wither', setting: true, c2: true },
            { level: 85, name: 'Quest', setting: true, c2: true },
            { level: 90, name: 'Archaeology', setting: true, c2: false },
            { level: 100, name: 'Mayhem', setting: true, c2: true },
            { level: 105, name: 'Storm', setting: true, c2: true },
            { level: 110, name: 'Insanity', setting: true, c2: false },
            { level: 115, name: 'Berserk' },
            { level: 135, name: 'Nurture', setting: false, c2: false, lab: true },
            { level: 150, name: 'Pandemonium', setting: true, c2: true },
            { level: 155, name: 'Alchemy', setting: true, c2: false },
            { level: 175, name: 'Hypothermia', setting: true, c2: false, glass: true },
            { level: 200, name: 'Desolation', setting: true, c2: true },
            { level: 201, name: 'Smithless', setting: true, c2: true }
        ];

        unlockedChallenges = challengeLevels.filter((challenge) => hze >= challenge.level && (!challenge.condition || challenge.condition()) && !MODULES.u2unlocks.includes(challenge.name));
        const unlockedChallengeArray = unlockedChallenges.map((challenge) => challenge.name);

        if (Object.keys(MODULES.u2unlocks).length === 0) {
            MODULES.u2unlocks = unlockedChallengeArray;
            return;
        }

        MODULES.u2unlocks = unlockedChallengeArray;
    }

    for (const challenge of unlockedChallenges) {
        if (challenge.message) {
            message = challenge.message;
        } else {
            message = challengeUnlock(challenge.name, challenge.setting, challenge.c2);
        }

        if (challenge.c3) {
            message += "<br><br>Due to unlocking Challenge 3's there is now a Challenge 3 option under Auto Portal to be able to auto portal into them. Also you can now access the " + cinf() + ' tab within the the scripts settings.';
        }

        if (challenge.worshippers) {
            message += "<br><br>You can now use the Worshipper Farm setting. This can be found in the the scripts 'Maps' tab.";
        }

        if (challenge.lab) {
            message += " There is also setting for Laboratory's that has been added to the AutoStructure setting.";
        }

        if (challenge.glass) {
            message += '<br><br>' + challengeUnlock('Glass', true, true);
        }

        break;
    }

    if (message !== '') {
        message += '<br><br><b>To disable this popup, click confirm!<b>';
        hzeMessage = message;
        MODULES.popups.challenge = true;
        tooltip('confirm', null, 'update', hzeMessage, 'MODULES.popups.challenge = false, delete hzeMessage', 'AutoTrimps New Unlock!');
    }
}
