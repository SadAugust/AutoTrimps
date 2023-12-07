function gigaTargetZone() {
    //Init
    var targetZone = 59;
    var heliumChallengeActive = game.global.challengeActive && game.challenges[game.global.challengeActive].heliumThrough;

    //Try setting target zone to the zone we finished last portal on
    var lastPortalZone = game.global.lastPortal;
    var challengeZone = heliumChallengeActive ? game.challenges[game.global.challengeActive].heliumThrough : 0;

    //Also consider the zone we configured our portal to be used
    var portalZone = 0;
    if (autoTrimpSettings.autoPortal.selected === 'Helium Per Hour') portalZone = trimpStats.isDaily ? getPageSetting('dailyDontPortalBefore', 1) : getPageSetting('heHrDontPortalBefore', 1);
    else if (autoTrimpSettings.autoPortal.selected === 'Custom') portalZone = trimpStats.isDaily ? getPageSetting('dailyPortalZone') : getPageSetting('autoPortalZone', 1);

    //Finds a target zone for when doing c2
    var c2zone = c2FinishZone();

    //Set targetZone
    if (!trimpStats.isC3) targetZone = Math.max(targetZone, lastPortalZone, challengeZone, portalZone - 1);
    else targetZone = Math.max(targetZone, c2zone - 1);

    //Target Fuel Zone
    if (trimpStats.isDaily && getPageSetting('AutoGenDC') !== 0) targetZone = Math.min(targetZone, 230);
    if (trimpStats.isC3 && getPageSetting('AutoGenC2') !== 0) targetZone = Math.min(targetZone, 230);
    if (getPageSetting('fuellater') >= 1 || getPageSetting('beforegen') !== 0) targetZone = Math.min(targetZone, Math.max(230, getPageSetting('fuellater')));

    //Failsafe
    if (targetZone < 60) {
        targetZone = Math.max(65, game.global.highestLevelCleared);
        debug('Auto Gigastation: Warning! Unable to find a proper targetZone. Using your HZE instead', 'general', '*rocket');
    }

    return targetZone;
}

function autoGiga(targetZone, metalRatio = 0.5, slowDown = 10, customBase) {
    //Pre Init
    if (!targetZone || targetZone < 60) targetZone = gigaTargetZone();

    //Init
    var base = customBase ? customBase : getPageSetting('firstGigastation');
    var baseZone = game.global.world;
    var rawPop = game.resources.trimps.max - game.unlocks.impCount.TauntimpAdded;
    var gemsPS = getPerSecBeforeManual('Dragimp');
    var metalPS = getPerSecBeforeManual('Miner');
    var megabook = game.global.frugalDone ? 1.6 : 1.5;

    //Calculus
    var nGigas = Math.min(Math.floor(targetZone - 60), Math.floor(targetZone / 2 - 25), Math.floor(targetZone / 3 - 12), Math.floor(targetZone / 5), Math.floor(targetZone / 10 + 17), 39);
    var metalDiff = Math.max((0.1 * metalRatio * metalPS) / gemsPS, 1);

    var delta = 3;
    for (var i = 0; i < 10; i++) {
        //Population guess
        var pop = 6 * Math.pow(1.2, nGigas) * 10000;
        pop *= base * (1 - Math.pow(5 / 6, nGigas + 1)) + delta * (nGigas + 1 - 5 * (1 - Math.pow(5 / 6, nGigas + 1)));
        pop += rawPop - base * 10000;
        pop /= rawPop;

        //Delta
        delta = Math.pow(megabook, targetZone - baseZone);
        delta *= metalDiff * slowDown * pop;
        delta /= Math.pow(1.75, nGigas);
        delta = Math.log(delta);
        delta /= Math.log(1.4);
        delta /= nGigas;
    }

    //Returns a number in the x.yy format, and as a number, not a string
    return +(Math.round(delta + 'e+2') + 'e-2');
}

function firstGiga() {
    //Build our first giga if: A) Has more than 2 Warps & B) Can't afford more Coords & C)* Lacking Health or Damage & D)* Has run at least 1 map stack or if forced to
    const s = !(getPageSetting('autoGigaDeltaFactor') > 20);
    const a = game.buildings.Warpstation.owned >= 2;
    const b = !canAffordCoordinationTrimps() || game.global.spireActive || (game.global.world >= 230 && !canAffordTwoLevel(game.upgrades.Coordination));
    const c = s || mapSettings.mapName === 'HD Farm' || mapSettings.mapName === 'Hits Survived';
    const d = s || game.global.mapBonus >= 1;
    if (!(a && b && c && d)) return false;

    //Define Base and Delta for this run
    const base = game.buildings.Warpstation.owned;
    const deltaZ = getPageSetting('autoGigaTargetZone') >= 60 ? getPageSetting('autoGigaTargetZone') : undefined;
    const deltaM = 0.5;
    const deltaS = getPageSetting('autoGigaDeltaFactor') >= 1 ? getPageSetting('autoGigaDeltaFactor') : undefined;
    const delta = autoGiga(deltaZ, deltaM, deltaS);

    //Save settings
    var firstGiga = getPageSetting('firstGigastation');
    var deltaGiga = getPageSetting('deltaGigastation');
    if (firstGiga !== base) setPageSetting('firstGigastation', base);
    if (deltaGiga !== delta) setPageSetting('deltaGigastation', delta);

    //Log
    if (firstGiga !== base || deltaGiga !== delta) {
        debug('Auto Gigastation: Setting pattern to ' + base + '+' + delta, 'buildings', '*rocket');
    }
    return true;
}

function needGymystic() {
    return game.upgrades['Gymystic'].allowed - game.upgrades['Gymystic'].done > 0;
}

//Getting a list of the upgrades we need to purchase whilst running the Scientist challenge.
function sciUpgrades() {
    if (!challengeActive('Scientist')) return;
    var upgradeList = [];
    //Scientist I - 11500 Science
    if (game.global.sLevel === 0) {
        //Recommended list has Bloodlust but with AT that should be unnecessary so left with 129 Science, nothing else to spend it on so purchasing Bloodlust!
        //upgradeList = ['Battle', 'Miners', 'Coordination', 'Coordination', 'Coordination', 'Coordination', 'Coordination', 'Coordination', 'Coordination', 'Coordination', 'Coordination', 'Megamace', 'Bestplate'];
        if (game.upgrades.Battle.done === 0) upgradeList.push('Battle');
        if (game.upgrades.Bloodlust.done === 0) upgradeList.push('Bloodlust');
        if (game.upgrades.Miners.done === 0) upgradeList.push('Miners');
        if (game.upgrades.Coordination.done <= 8) upgradeList.push('Coordination');
        if (game.upgrades.Megamace.done === 0) upgradeList.push('Megamace');
        if (game.upgrades.Bestplate.done === 0) upgradeList.push('Bestplate');
    }
    //Scientist II - 8000 Science
    else if (game.global.sLevel === 1) {
        //Recommended list has Bloodlust but with AT that should be unnecessary so left with 68 Science, nothing else to spend it on so purchasing Bloodlust!
        //upgradeList = ['Battle', 'Miners', 'Coordination', 'Coordination', 'Coordination', 'Coordination', 'Coordination', 'Coordination', 'Coordination', 'Coordination', 'Bestplate',];
        if (game.upgrades.Battle.done === 0) upgradeList.push('Battle');
        if (game.upgrades.Bloodlust.done === 0) upgradeList.push('Bloodlust');
        if (game.upgrades.Miners.done === 0) upgradeList.push('Miners');
        if (game.upgrades.Coordination.done <= 7) upgradeList.push('Coordination');
        if (game.upgrades.Bestplate.done === 0) upgradeList.push('Bestplate');
    }
    //Scientist III - 1500 Science
    else if (game.global.sLevel === 2) {
        //Recommended list has Bloodlust but with AT that should be unnecessary so left with 233 Science. Speedlumber probably the best option here?
        //upgradeList = ['Battle', 'Miners', 'Coordination', 'Coordination', 'Coordination', 'Speedminer'];
        if (game.upgrades.Battle.done === 0) upgradeList.push('Battle');
        if (game.upgrades.Miners.done === 0) upgradeList.push('Miners');
        if (game.upgrades.Coordination.done <= 2) upgradeList.push('Coordination');
        if (game.upgrades.Speedminer.done === 0) upgradeList.push('Speedminer');
        if (game.upgrades.Speedlumber.done === 0) upgradeList.push('Speedlumber');
    }
    //Scientist IV - 70 Science so left with 10 Science and nothing to spend it on
    else if (game.global.sLevel === 3) {
        //upgradeList = ['Battle', 'Miners'];
        if (game.upgrades.Battle.done === 0) upgradeList.push('Battle');
        if (game.upgrades.Miners.done === 0) upgradeList.push('Miners');
    }
    //Scientist V - 1500 Science
    else if (game.global.sLevel >= 4) {
        //Recommended list has Bloodlust but with AT that should be unnecessary so left with 233 Science. Speedlumber probably the best option here?
        //Push Egg to the list even if it won't be used on the first run but will be for the AntiScience achievement run
        //upgradeList = ['Battle', 'Miners', 'Coordination', 'Coordination', 'Coordination', 'Speedminer'];
        if (game.upgrades.Battle.done === 0) upgradeList.push('Battle');
        if (game.upgrades.Miners.done === 0) upgradeList.push('Miners');
        if (game.upgrades.Coordination.done <= 2) upgradeList.push('Coordination');
        if (game.upgrades.Speedminer.done === 0) upgradeList.push('Speedminer');
        if (game.upgrades.Speedlumber.done === 0) upgradeList.push('Speedlumber');
        if (game.upgrades.Egg.done === 0) upgradeList.push('Egg');
    }
    return upgradeList;
}

function populateUpgradeList() {
    var upgradeList = [];

    if (challengeActive('Scientist')) upgradeList = sciUpgrades();
    else {
        upgradeList = [
            'Miners',
            'Scientists',
            'Coordination',
            'Speedminer',
            'Speedlumber',
            'Speedfarming',
            'Speedscience',
            'Speedexplorer',
            'Efficiency',
            'Explorers',
            'Battle',
            'Bloodlust',
            'Bounty',
            'Egg',
            'UberHut',
            'UberHouse',
            'UberMansion',
            'UberHotel',
            'UberResort',
            'Trapstorm',
            'Potency',
            //U1 only
            'Megaminer',
            'Megalumber',
            'Megafarming',
            'Megascience',
            'TrainTacular',
            'Trainers',
            'Blockmaster',
            'Anger',
            'Formations',
            'Dominance',
            'Barrier',
            'Gymystic',
            'Gigastation',
            'Shieldblock',
            'Magmamancers',
            //U2 only
            'Rage',
            'Prismatic',
            'Prismalicious'
            //Equipment Prestiges -- Excluded from the setResourceNeeded & buyUpgrade functions so don't need to be in the list
            //'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP', 'Supershield'
        ];
    }
    return upgradeList;
}

function buyUpgrades() {
    var upgradeSetting = getPageSetting('upgradeType');
    if (upgradeSetting === 0) return;

    const upgradeList = populateUpgradeList();
    for (var upgrade in upgradeList) {
        upgrade = upgradeList[upgrade];
        var gameUpgrade = game.upgrades[upgrade];
        var available = gameUpgrade.allowed > gameUpgrade.done && canAffordTwoLevel(gameUpgrade);
        if (!available) continue;
        if (upgrade === 'Coordination') {
            //Coord & Amals
            if (upgradeSetting === 2 || !canAffordCoordinationTrimps()) continue;
            //Skip coords if we have more than our designated cap otherwise buy jobs to ensure we fire enough workers for the coords we want to get.
            if (challengeActive('Trappapalooza') || (challengeActive('Trapper') && getPageSetting('trapper'))) {
                var coordTarget = getPageSetting('trapperCoords');
                if (coordTarget > 0) coordTarget--;
                if (!game.global.runningChallengeSquared && coordTarget <= 0) coordTarget = trimps.currChallenge === 'Trapper' ? 32 : 49;
                if (coordTarget > 0 && game.upgrades.Coordination.done >= coordTarget) continue;
                buyJobs();
            }
        }
        //Gigastations
        else if (upgrade === 'Gigastation') {
            if (!getPageSetting('buildingsType')) continue;
            if (!bwRewardUnlocked('DecaBuild')) {
                if (getPageSetting('autoGigas') && game.upgrades.Gigastation.done === 0 && !firstGiga()) continue;
                else if (game.global.lastWarp ? game.buildings.Warpstation.owned < Math.floor(game.upgrades.Gigastation.done * getPageSetting('deltaGigastation')) + getPageSetting('firstGigastation') : game.buildings.Warpstation.owned < getPageSetting('firstGigastation')) continue;
            }
        }
        //Other
        else if (upgrade === 'Shieldblock' && !getPageSetting('equipShieldBlock')) continue;
        //Prioritise Science/scientist upgrades
        if (upgrade !== 'Bloodlust' && upgrade !== 'Miners' && upgrade !== 'Scientists' && !atSettings.portal.aWholeNewWorld) {
            if (game.upgrades.Scientists.done < game.upgrades.Scientists.allowed) continue;
            if (game.upgrades.Speedscience.done < game.upgrades.Speedscience.allowed && upgrade !== 'Speedscience') continue;
            if (game.upgrades.Megascience.done < game.upgrades.Megascience.allowed && upgrade !== 'Megascience' && upgrade !== 'Speedscience') continue;
        }
        buyUpgrade(upgrade, true, true);
        debug('Upgraded ' + upgrade, 'upgrades', '*upload2');
    }
}

function getNextGoldenUpgrade() {
    const setting = getPageSetting('autoGoldenSettings');

    if (setting.length === 0) {
        return false;
    }

    var defs = archoGolden.getDefs();
    var done = {};
    var rule;

    for (var x = 0; x < setting.length; x++) {
        const currSetting = setting[x];
        if (!currSetting.active) continue;
        if (currSetting.golden === undefined) continue;

        //Skips if challenge type isn't set to the type we're currently running or if it's not the challenge that's being run.
        if (typeof currSetting.runType !== 'undefined' && currSetting.runType !== 'All') {
            //Dailies
            if (trimpStats.isDaily) {
                if (currSetting.runType !== 'Daily') continue;
            }
            //C2/C3 runs + special challenges
            else if (trimpStats.isC3) {
                if (currSetting.runType !== 'C3') continue;
                else if (currSetting.challenge3 !== 'All' && !challengeActive(currSetting.challenge3)) continue;
            } else if (trimpStats.isOneOff) {
                if (currSetting.runType !== 'One Off') continue;
                else if (currSetting.challengeOneOff !== 'All' && !challengeActive(currSetting.challengeOneOff)) continue;
            }
            //Fillers (non-daily/c2/c3) and One off challenges
            else {
                if (currSetting.runType === 'Filler') {
                    var currChallenge = currSetting.challenge === 'No Challenge' ? '' : currSetting.challenge;
                    if (currSetting.challenge !== 'All' && !challengeActive(currChallenge)) continue;
                } else continue;
            }
        }

        rule = currSetting.golden;
        var name = defs[rule.slice(0, 1)];
        var number = parseInt(rule.slice(1, rule.length), 10);
        if (number === -1) number = Infinity;
        var purchased = game.goldenUpgrades[name].purchasedAt.length;
        var old = done[name] ? done[name] : 0;
        if (name === 'Void' && parseFloat((game.goldenUpgrades.Void.currentBonus + game.goldenUpgrades.Void.nextAmt()).toFixed(2)) > 0.72) {
            continue;
        }
        if (purchased < number + old) {
            return name;
        }
        if (done[name]) done[name] += number;
        else done[name] = number;
    }

    return false;
}

function autoGoldUpgrades() {
    if (!goldenUpgradesShown || getAvailableGoldenUpgrades() <= 0) return;
    var selected;
    selected = getNextGoldenUpgrade();
    if (!selected) return;
    buyGoldenUpgrade(selected);
}
