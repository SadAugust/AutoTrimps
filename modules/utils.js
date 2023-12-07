window.onerror = function catchErrors(msg, url, lineNo, columnNo, error) {
    var message = [
        'Message: ' + msg,
        'URL: ' + url,
        'Line: ' + lineNo,
        'Column: ' + columnNo,
        'Error object: ' + JSON.stringify(error)
    ].join(' - ');
    if (lineNo != 0) console.log('AT logged error: ' + message);
};

//Loads setting data from localstorage into object
function loadPageVariables() {
    const tmp = JSON.parse(localStorage.getItem('atSettings'));
    if (tmp !== null && tmp['ATversion'] !== undefined) autoTrimpSettings = tmp;
}

//Saves AT settings to localstorage
function safeSetItems(storageName, storageSetting) {
    try {
        localStorage.setItem(storageName, storageSetting);
    } catch (c) {
        22 === c.code &&
            debug(
                'Error: LocalStorage is full, or error. Attempt to delete some portals from your graph or restart browser.',
                'other'
            );
    }
}

//Saves AT settings to localstorage
function saveSettings() {
    safeSetItems('atSettings', serializeSettings());
}

function serializeSettings() {
    const settingString = JSON.stringify(
        Object.keys(autoTrimpSettings).reduce((v, item) => {
            const setting = autoTrimpSettings[item];
            var newSetting = {};
            switch (setting.type) {
                case 'action':
                case 'infoclick':
                    newSetting.id = v[item];
                    return (v[item] = newSetting), v;
                case 'boolean':
                    newSetting.id = v[item];
                    newSetting.enabled = setting.enabled;
                    newSetting.enabledU2 = setting.enabledU2;
                    return (v[item] = newSetting), v;
                case 'value':
                case 'multiValue':
                case 'textValue':
                case 'multiTextValue':
                case 'valueNegative':
                case 'multitoggle':
                case 'mazArray':
                case 'mazDefaultArray':
                    newSetting.id = v[item];
                    newSetting.value = setting.value;
                    newSetting.valueU2 = setting.valueU2;
                    return (v[item] = newSetting), v;
                case 'dropdown':
                    newSetting.id = v[item];
                    newSetting.selected = setting.selected;
                    newSetting.selectedU2 = setting.selectedU2;
                    return (v[item] = newSetting), v;
            }
            return (v[item] = setting), v;
        }, {})
    );

    return settingString;
}

function dailyModifiersOutput() {
    var daily = game.global.dailyChallenge;
    var dailyMods = dailyModifiers;
    if (!daily) return '';
    var returnText = '';
    for (var item in daily) {
        if (item === 'seed') continue;
        returnText += dailyMods[item].description(daily[item].strength) + '<br>';
    }
    return returnText;
}

//Process data to google forms to update stats spreadsheet
function pushSpreadsheetData() {
    if (!portalWindowOpen) return;
    if (!gameUserCheck(true)) return;
    const graphData = JSON.parse(localStorage.getItem('portalDataCurrent'))[getportalID()];

    const fluffy_EvoLevel = {
        cap: game.portal.Capable.level,
        prestige: Number(game.global.fluffyPrestige),
        potential: function () {
            return Number(Math.log((0.003 * game.global.fluffyExp) / Math.pow(5, this.prestige) + 1) / Math.log(4));
        },
        level: function () {
            return Number(Math.min(Math.floor(this.potential()), this.cap));
        },
        progress: function () {
            return this.level() === this.cap ? 0 : Number((4 ** (this.potential() - this.level()) - 1) / 3).toFixed(2);
        },
        fluffy: function () {
            return 'E' + this.prestige + 'L' + (this.level() + this.progress());
        }
    };

    const scruffy_Level = {
        firstLevel: 1000,
        growth: 4,
        currentExp: [],
        getExp: function () {
            this.calculateExp();
            return this.currentExp;
        },
        getCurrentExp: function () {
            return game.global.fluffyExp2;
        },
        currentLevel: function () {
            return Math.floor(
                log10((this.getCurrentExp() / this.firstLevel) * (this.growth - 1) + 1) / log10(this.growth)
            );
        },
        calculateExp: function () {
            var level = this.currentLevel();
            var experience = this.getCurrentExp();
            var removeExp = 0;
            if (level > 0) {
                removeExp = Math.floor(this.firstLevel * ((Math.pow(this.growth, level) - 1) / (this.growth - 1)));
            }
            var totalNeeded = Math.floor(
                this.firstLevel * ((Math.pow(this.growth, level + 1) - 1) / (this.growth - 1))
            );
            experience -= removeExp;
            totalNeeded -= removeExp;
            this.currentExp = [level, experience, totalNeeded];
        }
    };

    var heliumGained = game.global.universe === 2 ? game.resources.radon.owned : game.resources.helium.owned;
    var heliumHr = game.stats.heliumHour.value();

    var dailyMods = ' ';
    var dailyPercent = 0;
    if (MODULES['portal'].currentChallenge === 'Daily' && !challengeActive('Daily')) {
        dailyMods = MODULES.portal.dailyMods;
        dailyPercent = MODULES.portal.dailyPercent;
    } else if (challengeActive('Daily')) {
        if (typeof greenworks === 'undefined' || (typeof greenworks !== 'undefined' && process.version > 'v10.10.0'))
            dailyMods = dailyModifiersOutput().replaceAll('<br>', '|').slice(0, -1);
        dailyPercent = Number(prettify(getDailyHeliumValue(countDailyWeight(game.global.dailyChallenge)))) / 100;
        heliumGained *= 1 + dailyPercent;
        heliumHr *= 1 + dailyPercent;
    }

    const mapCount =
        graphData !== undefined
            ? Object.keys(graphData.perZoneData.mapCount)
                  .filter((k) => graphData.perZoneData.mapCount[k] !== null)
                  .reduce(
                      (a, k) => ({
                          ...a,
                          [k]: graphData.perZoneData.mapCount[k]
                      }),
                      {}
                  )
            : 0;
    const mapTotal =
        graphData !== undefined
            ? Object.keys(mapCount).reduce(function (m, k) {
                  return mapCount[k] > m ? mapCount[k] : m;
              }, -Infinity)
            : 0;
    const mapZone =
        graphData !== undefined ? Number(Object.keys(mapCount).find((key) => mapCount[key] === mapTotal)) : 0;

    var obj = {
        user: autoTrimpSettings.gameUser.value,
        date: new Date().toISOString(),
        portals: game.global.totalPortals,
        portals_U2: game.global.totalRadPortals,
        helium: game.global.totalHeliumEarned,
        radon: game.global.totalRadonEarned,
        radonBest: game.global.bestRadon,
        hZE: game.stats.highestLevel.valueTotal(),
        hZE_U2: game.stats.highestRadLevel.valueTotal(),
        fluffy: fluffy_EvoLevel.fluffy(),
        scruffy: Number(
            (scruffy_Level.currentLevel() + scruffy_Level.getExp()[1] / scruffy_Level.getExp()[2]).toFixed(3)
        ),
        achievement: game.global.achievementBonus,
        nullifium: game.global.nullifium,
        antenna: game.buildings.Antenna.purchased,
        spire_Assault_Level: autoBattle.maxEnemyLevel,
        spire_Assault_Radon: autoBattle.bonuses.Radon.level,
        spire_Assault_Stats: autoBattle.bonuses.Stats.level,
        spire_Assault_Scaffolding: autoBattle.bonuses.Scaffolding.level,
        frigid: game.global.frigidCompletions,
        mayhem: game.global.mayhemCompletions,
        pandemonium: game.global.pandCompletions,
        desolation: game.global.desoCompletions,
        c2: countChallengeSquaredReward(false, false, true)[0],
        c3: countChallengeSquaredReward(false, false, true)[1],
        cinf: game.global.totalSquaredReward,
        challenge: graphData !== undefined ? graphData.challenge : 'None',
        runtime: formatTimeForDescriptions((getGameTime() - game.global.portalTime) / 1000),
        runtimeMilliseconds: getGameTime() - game.global.portalTime,
        zone: game.global.world,
        voidZone: game.global.universe === 2 ? game.stats.highestVoidMap2.value : game.stats.highestVoidMap.value,
        mapZone: mapZone,
        mapCount: mapTotal,
        voidsCompleted: game.stats.totalVoidMaps.value,
        smithy:
            game.global.universe === 1
                ? 'N/A'
                : !game.mapUnlocks.SmithFree.canRunOnce && autoBattle.oneTimers.Smithriffic.owned
                ? game.buildings.Smithy.owned - 2 + ' + 2'
                : !game.mapUnlocks.SmithFree.canRunOnce
                ? game.buildings.Smithy.owned - 1 + ' + 1'
                : game.buildings.Smithy.owned,
        meteorologist: game.global.universe === 1 ? 'N/A' : game.jobs.Meteorologist.owned,
        heliumGained: heliumGained,
        heliumHr: heliumHr,
        fluffyXP: game.stats.bestFluffyExp2.value,
        fluffyHr: game.stats.fluffyExpHour.value(),
        fluffyBest: game.stats.bestFluffyExp2.valueTotal,
        dailyMods: dailyMods,
        dailyPercent: dailyPercent,
        universe: game.global.universe,
        sharpTrimps: game.singleRunBonuses.sharpTrimps.owned,
        goldenMaps: game.singleRunBonuses.goldMaps.owned,
        heliumy: game.singleRunBonuses.heliumy.owned,
        runningChallengeSquared: game.global.runningChallengeSquared,
        mutatedSeeds: game.stats.mutatedSeeds.valueTotal,
        mutatedSeedsLeftover: game.global.mutatedSeeds,
        mutatedSeedsGained: game.stats.mutatedSeeds.value,
        patch: game.global.stringVersion,
        bones: game.global.b
    };

    for (var chall in game.c2) {
        if (!game.challenges[chall].allowU2) {
            obj[chall + '_zone'] = game.c2[chall];
            obj[chall + '_bonus'] = getIndividualSquaredReward(chall);
        } else {
            obj[chall + '_zone'] = game.c2[chall];
            obj[chall + '_bonus'] = getIndividualSquaredReward(chall);
        }
    }

    //Replaces any commas with semicolons to avoid breaking how the spreadsheet parses data.
    for (var item in obj) {
        if (typeof greenworks !== 'undefined' && process.version === 'v10.10.0') continue;
        if (typeof obj[item] === 'string') obj[item] = obj[item].replaceAll(',', ';');
    }

    setTimeout(function () {
        //Data entry ID can easily be found in the URL of the form after setting up a pre-filled link.
        //Haven't found a way to get it from the form itself or a way to automate it so pushing the data as an object instead.
        var data = {
            'entry.1850071841': obj.user, //User
            'entry.815135863': JSON.stringify(obj) //Object
            //'entry.1864995783': new Date().toISOString(), //Timestamp
        };

        var formSuccess = true;
        var formId = '1FAIpQLScTqY2ti8WUwIKK_WOh_X_Oky704HOs_Lt07sCTG2sHCc3quA';
        var queryString = '/formResponse';
        var url = 'https://docs.google.com/forms/d/e/' + formId + queryString;
        //Can't use the form's action URL because it's not a valid URL for CORS requests.
        //Google doesn't allow CORS requests to their forms by the looks of it
        //Using dataType "jsonp" instead of "json" to get around this issue.

        if (formSuccess) {
            // Send request
            $.ajax({
                url: url,
                type: 'POST',
                crossDomain: true,
                header: {
                    'Content-type': 'application/javascript; charset=utf-8'
                },
                data: data,
                dataType: 'jsonp'
            });
        }
    }, 300);
    debug('Spreadsheet update complete.', 'other');
}

//It gets the value of a setting from autoTrimpSettings. If universe isn't set it will return the value relevant for the current universe we're in.
//If universe is set it will return the value from that universe.
//If the setting is not found it will return false.
function getPageSetting(setting, universe = game.global.universe) {
    if (!autoTrimpSettings.hasOwnProperty(setting)) return false;
    const settingType = autoTrimpSettings[setting].type;
    const u2Setting =
        autoTrimpSettings[setting].universe.indexOf(0) === -1 && setting !== 'universeSetting' && universe === 2;
    const enabled = 'enabled' + (u2Setting ? 'U2' : '');
    const selected = 'selected' + (u2Setting ? 'U2' : '');
    const value = 'value' + (u2Setting ? 'U2' : '');

    if (settingType === 'boolean') return autoTrimpSettings[setting][enabled];
    else if (settingType === 'multiValue')
        return Array.from(autoTrimpSettings[setting][value]).map((x) => parseFloat(x));
    else if (settingType === 'multiTextValue')
        return Array.from(autoTrimpSettings[setting][value]).map((x) => String(x));
    else if (settingType === 'textValue' || settingType === 'mazArray' || settingType === 'mazDefaultArray')
        return autoTrimpSettings[setting][value];
    else if (settingType === 'value' || autoTrimpSettings[setting].type === 'valueNegative')
        return parseFloat(autoTrimpSettings[setting][value]);
    else if (settingType === 'multitoggle') return parseInt(autoTrimpSettings[setting][value]);
    else if (settingType === 'dropdown') return autoTrimpSettings[setting][selected];
}

//It sets the value of a setting, and then saves the settings.
function setPageSetting(setting, newValue, universe = portalUniverse) {
    if (autoTrimpSettings.hasOwnProperty(setting) === false) return false;

    const settingType = autoTrimpSettings[setting].type;
    const u2Setting = setting !== 'universeSetting' && universe === 2;
    const enabled = 'enabled' + (u2Setting ? 'U2' : '');
    const selected = 'selected' + (u2Setting ? 'U2' : '');
    const value = 'value' + (u2Setting ? 'U2' : '');

    var enabledIndex = ['boolean'];
    var valueIndex = [
        'value',
        'valueNegative',
        'textValue',
        'multiTextValue',
        'mazArray',
        'mazDefaultArray',
        'multiValue',
        'multitoggle'
    ];
    var selectedIndex = ['dropdown'];

    if (enabledIndex.indexOf(settingType) !== -1) autoTrimpSettings[setting][enabled] = newValue;
    else if (valueIndex.indexOf(settingType) !== -1) autoTrimpSettings[setting][value] = newValue;
    else if (selectedIndex.indexOf(settingType) !== -1) autoTrimpSettings[setting][selected] = newValue;

    //Update button values if necessary
    if (settingType !== 'mazArray' && settingType !== 'mazDefaultArray') updateCustomButtons(true);
    saveSettings();
}

//Looks at the spamMessages setting and if the message is enabled, it will print it to the message log & console.
function debug(message, messageType, icon) {
    if (!atSettings.initialise.loaded) return;
    const settingArray = getPageSetting('spamMessages');
    var sendMessage = true;

    if (messageType in settingArray) sendMessage = settingArray[messageType];

    if (sendMessage) {
        console.log(timeStamp() + ' ' + message);
        message2(message, 'AutoTrimps', icon, messageType);
    }
}

function timeStamp() {
    for (var a = new Date(), b = [a.getHours(), a.getMinutes(), a.getSeconds()], c = 1; 3 > c; c++)
        10 > b[c] && (b[c] = '0' + b[c]);
    return b.join(':');
}

function setTitle() {
    document.title = '(' + game.global.world + ') Trimps ' + document.getElementById('versionNumber').innerHTML;
}

var lastmessagecount = 1;

function message2(message, b, icon, d) {
    var e = document.getElementById('log'),
        f = e.scrollTop + 10 > e.scrollHeight - e.clientHeight,
        g = ATmessageLogTabVisible ? 'block' : 'none',
        h = '';
    icon && '*' === icon.charAt(0)
        ? ((icon = icon.replace('*', '')), (h = 'icomoon icon-'))
        : (h = 'glyphicon glyphicon-'),
        game.options.menu.timestamps.enabled &&
            (message =
                (1 === game.options.menu.timestamps.enabled ? getCurrentTime() : updatePortalTimer(!0)) +
                ' ' +
                message),
        icon && (message = '<span class="' + h + icon + '"></span> ' + message),
        (message = '<span class="glyphicon glyphicon-superscript"></span> ' + message),
        (message = '<span class="icomoon icon-text-color"></span>' + message);
    var i = "<span class='" + b + 'Message message ' + d + "' style='display: " + g + "'>" + message + '</span>',
        j = document.getElementsByClassName(b + 'Message');
    if (1 < j.length && -1 < j[j.length - 1].innerHTML.indexOf(message)) {
        var k = j[j.length - 1].innerHTML;
        lastmessagecount++;
        var l = k.lastIndexOf(' x');
        -1 !== l && (j[j.length - 1].innerHTML = k.slice(0, l)), (j[j.length - 1].innerHTML += ' x' + lastmessagecount);
    } else (lastmessagecount = 1), (e.innerHTML += i);
    f && (e.scrollTop = e.scrollHeight), trimMessages(b);
}

function filterMessage2(a) {
    var b = document.getElementById('log');
    var displayed = !ATmessageLogTabVisible;
    ATmessageLogTabVisible = displayed;
    var c = document.getElementsByClassName(a + 'Message');
    var e = document.getElementById(a + 'Filter');

    (e.className = ''), (e.className = getTabClass(displayed)), (displayed = displayed ? 'block' : 'none');
    for (var f = 0; f < c.length; f++) {
        c[f].style.display = displayed;
        b.scrollTop = b.scrollHeight;
    }
}

//DO NOT RUN CODE BELOW THIS LINE -- PURELY FOR TESTING PURPOSES

//Will activate a 24 hour timewarp.
function testTimeWarp(hours) {
    var timeWarpHours = 0;
    try {
        timeWarpHours = parseNum(document.getElementById('setSettingsNameTooltip').value.replace(/[\n\r]/gm, ''));
        if (timeWarpHours === null || timeWarpHours === undefined || timeWarpHours === 0) {
            debug('Time Warp input is invalid. Defaulting to 24 hours.', 'test');
            timeWarpHours = 24;
        }
    } catch (err) {
        if (!hours) {
            debug('Time Warp input is invalid. Defaulting to 24 hours.', 'test');
            timeWarpHours = 24;
        }
    }

    if (hours) timeWarpHours = hours;
    var timeToRun = timeWarpHours * 3600000;

    game.global.lastOnline -= timeToRun;
    game.global.portalTime -= timeToRun;
    game.global.zoneStarted -= timeToRun;
    game.global.lastSoldierSentAt -= timeToRun;
    game.global.lastSkeletimp -= timeToRun;
    game.permaBoneBonuses.boosts.lastChargeAt -= timeToRun;

    offlineProgress.start();
    return;
}

function testSpeedX(interval) {
    //Game uses 100ms for 1 second, so 5ms is 20x speed;
    if (game.options.menu.pauseGame.enabled) {
        setTimeout(testSpeedX, interval, interval);
        return;
    }
    var date = new Date();
    var now = date.getTime();
    game.global.lastOnline = now;
    game.global.start = now;

    var tick = 100;
    game.global.zoneStarted -= tick;
    game.global.portalTime -= tick;
    game.global.lastSoldierSentAt -= tick;
    game.global.lastSkeletimp -= tick;
    game.permaBoneBonuses.boosts.lastChargeAt -= tick;
    if (game.global.mapsActive) game.global.mapStarted -= tick;

    mainLoop();
    gameLoop(null, now);
    setTimeout(testSpeedX, interval, interval);

    if (date.getSeconds() % 3 === 0) updateLabels();
}

function testChallenge() {
    //read the name in from tooltip
    try {
        var challengeName = document.getElementById('setSettingsNameTooltip').value.replace(/[\n\r]/gm, '');
        if (challengeName === null || game.challenges[challengeName] === undefined) {
            debug("Challenge name didn't match one ingame..", 'test');
            return;
        }
    } catch (err) {
        debug("Challenge name didn't match one ingame..", 'test');
        return;
    }
    debug('Setting challenge to ' + challengeName, 'test');
    game.global.challengeActive = challengeName;
}

function testRunningCinf() {
    game.global.runningChallengeSquared = !game.global.runningChallengeSquared;
}

function testMetalIncome() {
    var secondsPerMap = (trimpStats.hyperspeed2 ? 6 : 8) / maxOneShotPower(true);
    var mapsPerHour = 3600 / secondsPerMap;
    var mapsPerDay = mapsPerHour * 24;
    //Factors in large cache + chronoimp
    var mapTimer = mapsPerDay * 25;
    //Adding avg jestimps into mapTimer calculation
    if (mapsPerDay > 4) mapTimer += Math.floor(mapsPerDay / 5) * 45;
    var mapLevel = game.global.mapsActive ? getCurrentMapObject().level - game.global.world : 0;
    var resourcesGained = scaleToCurrentMap_AT(simpleSeconds_AT('metal', mapTimer, '0,0,1'), false, true, mapLevel);
    debug('Metal gained from 1 day ' + prettify(resourcesGained), 'test');
}

function testEquipmentMetalSpent() {
    var equipMult = getEquipPriceMult();
    var levelCost = 0;
    var prestigeCost = 0;

    function getTotalPrestigeCost(what, prestigeCount) {
        var actualCost = 0;
        for (var i = 1; i <= prestigeCount; i++) {
            var equipment = game.equipment[what];
            var prestigeMod;
            var nextPrestigeCount = i + 1;
            if (nextPrestigeCount >= 4) prestigeMod = (nextPrestigeCount - 3) * 0.85 + 2;
            else prestigeMod = nextPrestigeCount - 1;
            var prestigeCost =
                Math.round(equipment.oc * Math.pow(1.069, prestigeMod * game.global.prestige.cost + 1)) * equipMult;
            actualCost += prestigeCost;

            //Calculate cost of current equip levels
            if (prestigeCount === i && equipment.level > 1) {
                finalCost = prestigeCost;

                for (var j = 2; j <= equipment.level; j++) {
                    levelCost += finalCost * Math.pow(1.2, j - 1);
                }
            }
        }

        return actualCost;
    }

    for (var i in MODULES.equipment) {
        if (game.equipment[i].locked) continue;
        prestigeCost += getTotalPrestigeCost(i, game.equipment[i].prestige - 1);
    }

    debug('Cost of all prestiges: ' + prettify(prestigeCost), 'test');
    debug('Cost of all equip levels: ' + prettify(levelCost), 'test');
    debug('Cost of all equipment: ' + prettify(prestigeCost + levelCost), 'test');
}

function testMaxMapBonus() {
    game.global.mapBonus = 10;
}

function testMaxTenacity() {
    game.global.zoneStarted -= 7.2e6;
}

function testWorldCell() {
    if (!game.global.mapsActive && !game.global.preMapsActive) {
        game.global.lastClearedCell = game.global.gridArray.length - 2;
        game.global.gridArray[game.global.lastClearedCell + 1].health = 0;
        game.global.gridArray[game.global.gridArray.length - 1].health = 0;
    }
}

function testMapCell() {
    if (game.global.mapsActive) {
        game.global.lastClearedMapCell = getCurrentMapObject().size - 2;
        game.global.mapGridArray[game.global.lastClearedMapCell + 1].health = 0;
        game.global.mapGridArray[getCurrentMapObject().size - 2].health = 0;
    }
}

function testTrimpStats() {
    game.global.soldierCurrentAttack *= 1e100;
    game.global.soldierHealth *= 1e100;
    game.global.soldierHealthMax *= 1e100;
}

function getAncientTreasureName() {
    return game.global.universe === 2 ? 'Atlantrimp' : 'Trimple Of Doom';
}
