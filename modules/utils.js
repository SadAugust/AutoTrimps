if (!String.prototype.includes) {
	String.prototype.includes = function (search, start) {
		'use strict';
		if (typeof start !== 'number') {
			start = 0;
		}
		if (start + search.length > this.length) {
			return false;
		} else {
			return this.indexOf(search, start) !== -1;
		}
	};
}

function loadPageVariables() {
	var tmp = JSON.parse(localStorage.getItem('atSettings'));
	if (tmp === null)
		tmp = JSON.parse(localStorage.getItem('autoTrimpSettings'));

	if (tmp !== null && tmp['ATversion'] != undefined) {
		autoTrimpSettings = tmp;
	}
}

function safeSetItems(a, b) { try { localStorage.setItem(a, b) } catch (c) { 22 == c.code && debug("Error: LocalStorage is full, or error. Attempt to delete some portals from your graph or restart browser.") } }

function serializeSettings() {
	return JSON.stringify(Object.keys(autoTrimpSettings).reduce((v, item) => {
		const setting = autoTrimpSettings[item];
		switch (setting.type) {
			case 'action':
			case 'infoclick':
				var newSetting = {};
				newSetting.id = v[item];
				return v[item] = newSetting, v;
			case 'boolean':
				var newSetting = {};
				newSetting.id = v[item];
				newSetting.enabled = setting.enabled
				newSetting.enabledU2 = setting.enabledU2
				return v[item] = newSetting, v;
			case 'value':
			case 'multiValue':
			case 'textValue':
			case 'valueNegative':
			case 'multitoggle':
			case 'mazArray':
			case 'mazDefaultArray':
				var newSetting = {};
				newSetting.id = v[item];
				newSetting.value = setting.value
				newSetting.valueU2 = setting.valueU2
				return v[item] = newSetting, v;
			case 'dropdown':
				var newSetting = {};
				newSetting.id = v[item];
				newSetting.selected = setting.selected
				newSetting.selectedU2 = setting.selectedU2
				return v[item] = newSetting, v;
		}
		return v[item] = setting, v;
	}, {}));
}

function spreadsheetDownload() {
	var spreadsheet = '';
	//C3s
	for (var chall in game.c2) {
		if (!game.challenges[chall].allowU2) continue;
		spreadsheet += ((getIndividualSquaredReward(chall)) + "\n")
	}
	//Radon, Scruffy, HZE, Achieve bonus, Antenna count
	spreadsheet += (game.global.totalRadonEarned + "\n");
	spreadsheet += ((Fluffy.currentLevel + Fluffy.getExp()[1] / Fluffy.getExp()[2]).toFixed(3) + "\n");
	spreadsheet += (game.stats.highestRadLevel.valueTotal() + "\n");
	spreadsheet += (game.global.achievementBonus + "\n");
	spreadsheet += (game.buildings.Antenna.purchased + "\n");
	//Spire Assault
	spreadsheet += (autoBattle.maxEnemyLevel + "\n");
	spreadsheet += (autoBattle.bonuses.Radon.level + "\n");
	spreadsheet += (autoBattle.bonuses.Stats.level + "\n");
	spreadsheet += (autoBattle.bonuses.Scaffolding.level + "\n");
	//Mayhem Style Challenges
	spreadsheet += (game.global.desoCompletions + "\n");
	return (spreadsheet);
}

// Process data to google forms to update stats spreadsheet
function pushSpreadsheetData() {

	var user = autoTrimpSettings.gameUser.value;
	if (user === 'undefined' || user === 'Test') return;
	const graphData = JSON.parse(localStorage.getItem("portalDataCurrent"))[getportalID()];

	const fluffy_EvoLevel = {
		cap: game.portal.Capable.level,
		prestige: Number(game.global.fluffyPrestige),
		potential: function () {
			return Number(Math.log(0.003 * game.global.fluffyExp / Math.pow(5, this.prestige) + 1) / Math.log(4));
		},
		level: function () {
			return Number(Math.min(Math.floor(this.potential()), this.cap));
		},
		progress: function () {
			return this.level() == this.cap ? 0 : Number((4 ** (this.potential() - this.level()) - 1) / 3).toFixed(2)
		},
		fluffy: function () {
			return "E" + this.prestige + "L" + (this.level() + this.progress())
		}
	}

	const scruffy_Level = {
		firstLevel: 1000,
		growth: 4,
		currentExp: [],
		getExp: function () {
			this.calculateExp()
			return this.currentExp;
		},
		getCurrentExp: function () {
			return game.global.fluffyExp2;
		},
		currentLevel: function () {
			return Math.floor(log10(((this.getCurrentExp() / this.firstLevel) * (this.growth - 1)) + 1) / log10(this.growth));
		},
		calculateExp: function () {
			var level = this.currentLevel();
			var experience = this.getCurrentExp();
			var removeExp = 0;
			if (level > 0) {
				removeExp = Math.floor(this.firstLevel * ((Math.pow(this.growth, level) - 1) / (this.growth - 1)));
			}
			var totalNeeded = Math.floor(this.firstLevel * ((Math.pow(this.growth, level + 1) - 1) / (this.growth - 1)));
			experience -= removeExp;
			totalNeeded -= removeExp;
			this.currentExp = [level, experience, totalNeeded];
		}
	}

	var dailyMods = " ";
	if (challengeActive("Daily")) {
		dailyMods = dailyModifiersOutput().replaceAll('<br>', '|').slice(0, -1);
	}

	const mapCount = Object.keys(graphData.perZoneData.mapCount)
		.filter((k) => graphData.perZoneData.mapCount[k] != null)
		.reduce((a, k) => ({ ...a, [k]: graphData.perZoneData.mapCount[k] }), {});
	const mapTotal = Object.keys(mapCount).reduce(function (m, k) { return mapCount[k] > m ? mapCount[k] : m }, -Infinity);
	const mapZone = Number(Object.keys(mapCount).find(key => mapCount[key] === mapTotal));

	const obj = {
		user: autoTrimpSettings.gameUser.value,
		date: new Date().toISOString(),
		portals: game.global.totalPortals,
		portals_U2: game.global.totalRadPortals,
		helium: game.global.totalHeliumEarned,
		radon: game.global.totalRadonEarned,
		hZE: game.stats.highestLevel.valueTotal(),
		hZE_U2: game.stats.highestRadLevel.valueTotal(),
		fluffy: fluffy_EvoLevel.fluffy(),
		scruffy: Number((scruffy_Level.currentLevel() + scruffy_Level.getExp()[1] / scruffy_Level.getExp()[2]).toFixed(3)),
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
		challenge: graphData !== null ? graphData.challenge : 'None',
		runtime: formatTimeForDescriptions((getGameTime() - game.global.portalTime) / 1000),
		runtimeMilliseconds: (getGameTime() - game.global.portalTime),
		zone: game.global.world,
		dailyMods: dailyMods,
		voidZone: game.global.universe === 2 ? game.stats.highestVoidMap2.value : game.stats.highestVoidMap.value,
		mapZone: mapZone,
		mapCount: mapTotal,
		voidsCompleted: game.stats.totalVoidMaps.value,
		smithy: (game.global.universe == 1 ? "N/A" :
			!game.mapUnlocks.SmithFree.canRunOnce && autoBattle.oneTimers.Smithriffic.owned ?
				(game.buildings.Smithy.owned - 2 + " + 2") : !game.mapUnlocks.SmithFree.canRunOnce ?
					(game.buildings.Smithy.owned - 1 + " + 1") : (game.buildings.Smithy.owned)),
		meteorologist: (game.global.universe == 1 ? "N/A" : game.jobs.Meteorologist.owned),
		heliumGained: game.global.universe === 2 ? game.resources.radon.owned : game.resources.helium.owned,
		heliumHr: game.stats.heliumHour.value(),
		fluffyXP: game.stats.bestFluffyExp2.value,
		fluffyHr: game.stats.fluffyExpHour.value(),
		universe: game.global.universe,
		sharpTrimps: game.singleRunBonuses.sharpTrimps.owned,
		goldenMaps: game.singleRunBonuses.goldMaps.owned,
		heliumy: game.singleRunBonuses.heliumy.owned,
		runningChallengeSquared: game.global.runningChallengeSquared,
		patch: game.global.stringVersion,
	}

	for (var chall in game.c2) {
		if (!game.challenges[chall].allowU2) {
			obj[chall + "_zone"] = game.c2[chall];
			obj[chall + "_bonus"] = (getIndividualSquaredReward(chall));
		}
		else {
			obj[chall + "_zone"] = game.c2[chall];
			obj[chall + "_bonus"] = (getIndividualSquaredReward(chall));
		}
	}

	setTimeout(function () {
		//Data entry ID can easily be found in the URL of the form after setting up a pre-filled link.
		//Haven't found a way to get it from the form itself or a way to automate it so pushing the data as an object instead.
		var data = {
			'entry.1850071841': obj.user, //User
			'entry.815135863': JSON.stringify(obj), //Object
			//'entry.1864995783': new Date().toISOString(), //Timestamp
		};

		var formSuccess = true;

		var formId = '1FAIpQLScTqY2ti8WUwIKK_WOh_X_Oky704HOs_Lt07sCTG2sHCc3quA'
		var queryString = '/formResponse'
		var url = 'https://docs.google.com/forms/d/e/' + formId + queryString
		//Can't use the form's action URL because it's not a valid URL for CORS requests.
		//Google doesn't allow CORS requests to their forms by the looks of it
		//Using dataType "jsonp" instead of "json" to get around this issue.

		if (formSuccess) {
			// Send request
			$.ajax({
				url: url,
				type: 'POST',
				crossDomain: true,
				header: { 'Content-type': 'application/javascript; charset=utf-8' },
				data: data,
				dataType: "jsonp",
			});
		}
	}, 300);
	debug("Spreadsheet update complete.")
};

function getPageSetting(setting, universe) {
	if (!autoTrimpSettings.hasOwnProperty(setting)) {
		return false;
	}
	const settingType = autoTrimpSettings[setting].type;
	var enabled = 'enabled'
	var selected = 'selected'
	var value = 'value'

	if (!universe) universe = game.global.universe;

	if (autoTrimpSettings[setting].universe.indexOf(0) === -1 && universe === 2) {
		if (universe === 2) enabled += 'U2';
		if (universe === 2) selected += 'U2';
		if (universe === 2) value += 'U2';
	}

	if (settingType == 'boolean') {
		return autoTrimpSettings[setting][enabled];
	} else if (settingType == 'multiValue') {
		return Array.from(autoTrimpSettings[setting][value])
			.map(x => parseInt(x));
	} else if (settingType == 'textValue' || settingType == 'mazArray' || settingType == 'mazDefaultArray') {
		return autoTrimpSettings[setting][value];
	} else if (settingType == 'value' || autoTrimpSettings[setting].type == 'valueNegative') {
		return parseFloat(autoTrimpSettings[setting][value]);
	} else if (settingType == 'multitoggle') {
		return parseInt(autoTrimpSettings[setting][value]);
	} else if (settingType == 'dropdown') {
		return autoTrimpSettings[setting][selected];
	}
}

function setPageSetting(setting, newValue, universe) {
	if (autoTrimpSettings.hasOwnProperty(setting) == false) {
		return false;
	}

	const settingType = autoTrimpSettings[setting].type;

	var enabled = 'enabled'
	var selected = 'selected'
	var value = 'value'

	if (!universe) universe = portalUniverse;

	if (setting !== 'radonsettings' && (universe === 2)) {
		if (universe === 2) enabled += 'U2';
		if (universe === 2) selected += 'U2';
		if (universe === 2) value += 'U2';
	}

	var buttonIndex = ['boolean'];
	var valueIndex = ['value', 'valueNegative', 'textValue', 'mazArray', 'mazDefaultArray', 'multiValue', 'multitoggle'];
	var selectedIndex = ['dropdown'];

	if (buttonIndex.indexOf(settingType) !== -1) {
		autoTrimpSettings[setting][enabled] = newValue;
		document.getElementById(setting).setAttribute('class', 'noselect settingsBtn settingBtn' + autoTrimpSettings[setting][enabled]);
	} else if (valueIndex.indexOf(settingType) !== -1) {
		autoTrimpSettings[setting][value] = newValue;
		if (selectedIndex === 'multitoggle') document.getElementById(setting).setAttribute('class', 'noselect settingsBtn settingBtn' + autoTrimpSettings[setting][value]);
	} else if (buttonIndex.indexOf(settingType) !== -1) {
		autoTrimpSettings[setting][selected] = newValue;
	}
}

function shouldSpeedRun(achievement) {
	//Returns false if we can't any new speed runs, unless it's the first tier
	var minutesThisRun = Math.floor((new Date().getTime() - game.global.portalTime) / 1000 / 60);
	if (achievement.finished == achievement.tiers.length) return false;
	return minutesThisRun < achievement.breakpoints[achievement.finished];
}

function saveSettings() {
	var storageName = 'atSettings';
	safeSetItems(storageName, serializeSettings())
}

function debug(a, b, c) {
	var settingArray = atFinishedLoading && getPageSetting('spamMessages'),
		p = !0;

	switch (b) {
		case null:
			break;
		case 'general':
			p = settingArray[b];
			break;
		case 'upgrades':
			p = settingArray[b];
			break;
		case 'equips':
			p = settingArray[b];
			break;
		case 'buildings':
			p = settingArray[b];
			break;
		case 'jobs':
			p = settingArray[b];
			break;
		case 'maps':
			p = settingArray[b];
			break;
		case 'fragment':
			p = settingArray[b];
			break;
		case 'map_Details':
			p = settingArray[b];
			break;
		case 'map_Destacking':
			p = settingArray[b];
			break;
		case 'other':
			p = settingArray[b];
			break;
		case 'zone':
			p = settingArray[b];
			break;
		case 'exotic':
			p = settingArray[b];
			break;
		case 'gather':
			p = settingArray[b];
			break;
	}
	p && (console.log(timeStamp() + ' ' + a), message2(a, 'AutoTrimps', c, b))
}

function timeStamp() {
	for (var a = new Date,
		b = [
			a.getHours(),
			a.getMinutes(),
			a.getSeconds()
		],
		c = 1;
		3 > c;
		c++)10 > b[c] &&
			(b[c] = "0" + b[c]);
	return b.join(":")
}

function setTitle() { aWholeNewWorld && (document.title = '(' + game.global.world + ') Trimps ' + document.getElementById('versionNumber').innerHTML) }
var lastmessagecount = 1;

function message2(a, b, c, d) {
	var e = document.getElementById("log"),
		f = e.scrollTop + 10 > e.scrollHeight - e.clientHeight,
		g = ATmessageLogTabVisible ? "block" : "none",
		h = ""; c && "*" == c.charAt(0) ?
			(c = c.replace("*", ""), h = "icomoon icon-") :
			h = "glyphicon glyphicon-", game.options.menu.timestamps.enabled && (a = (1 == game.options.menu.timestamps.enabled ? getCurrentTime() : updatePortalTimer(!0)) + " " + a), c && (a = "<span class=\"" + h + c + "\"></span> " + a), a = "<span class=\"glyphicon glyphicon-superscript\"></span> " + a,
			a = "<span class=\"icomoon icon-text-color\"></span>" + a;
	var i = "<span class='" + b + "Message message " + d + "' style='display: " + g + "'>" + a + "</span>",
		j = document.getElementsByClassName(b + "Message"); if (1 < j.length && -1 < j[j.length - 1].innerHTML.indexOf(a)) {
			var k = j[j.length - 1].innerHTML; lastmessagecount++;
			var l = k.lastIndexOf(" x"); -1 != l && (j[j.length - 1].innerHTML = k.slice(0, l)), j[j.length - 1].innerHTML += " x" + lastmessagecount
		} else lastmessagecount = 1, e.innerHTML += i; f && (e.scrollTop = e.scrollHeight), trimMessages(b)
}

function filterMessage2(a) {
	var b = document.getElementById("log");
	displayed = !ATmessageLogTabVisible;
	ATmessageLogTabVisible = displayed;
	var c = document.getElementsByClassName(a + "Message")
	var e = document.getElementById(a + "Filter");

	e.className = "", e.className = getTabClass(displayed),
		displayed = displayed ? "block" : "none";
	for (var f = 0; f < c.length; f++) {
		c[f].style.display = displayed; b.scrollTop = b.scrollHeight
	}
}

function formatMinutesForDescriptions(number) {
	var text;
	var seconds = Math.floor((number * 60) % 60);
	var minutes = Math.floor(number % 60);
	var hours = Math.floor(number / 60);
	if (hours == 0)
		text = minutes + " minutes " + seconds + " seconds";
	else if (minutes > 0) {
		if (minutes < 10) minutes = "0" + minutes;
		if (seconds < 10) seconds = "0" + seconds;
		text = hours + ":" + minutes + ":" + seconds;
	}
	else {
		var hs = (hours > 1) ? "s" : "";
		var ms = (minutes > 1) ? "s" : "";
		var ss = (seconds > 1) ? "s" : "";
		text = hours + " hour" + hs + " " + minutes + " minute" + ms + " " + seconds + " second" + ss;
	}
	return text;
}

window.onerror = function (b, c, d, e, f) {
	var g = ['Message: ' + b, 'URL: ' + c, 'Line: ' + d, 'Column: ' + e, 'Error object: ' + JSON.stringify(f)].join(' - '); 0 != d && console.log('AT logged error: ' + g)
};
function throwErrorfromModule() { throw new Error("We have successfully read the thrown error message out of a module") }


function prettifyMap(map) {
	if (!map) {
		return 'none'
	}
	var descriptor;
	if (!map.noRecycle) {
		// a crafted map
		const bonus = (map.hasOwnProperty('bonus') ? mapSpecialModifierConfig[map.bonus].name : 'no bonus');
		descriptor = `, Level ${map.level} (${bonus})`;
	} else if (map.location === 'Void') {
		descriptor = ' (Void)';
	} else {
		descriptor = ' (Unique)';
	}
	return `[${map.id}] ${map.name}${descriptor} `;
}

function debugPrettifyMap(map) {
	if (!map) {
		return 'none'
	}
	if (['world', 'create'].includes(map)) {
		return map;
	}
	var descriptor;
	if (!map.noRecycle) {
		// a crafted map
		const bonus = (map.hasOwnProperty('bonus') ? `+${map.bonus}` : '');
		descriptor = `L${map.level}${bonus}`;
	} else if (map.location === 'Void') {
		descriptor = `V(${map.name})`;
	} else {
		descriptor = `U(${map.name})`;
	}
	return `[${map.id}]${descriptor}`;
}

//DO NOT RUN CODE BELOW THIS LINE -- PURELY FOR TESTING PURPOSES
function cheatSpeedX(interval) {
	//Game uses 100ms for 1 second, so 5ms is 20x speed;
	if (game.options.menu.pauseGame.enabled) {
		runIntervalGame = setTimeout(cheatSpeedX, interval, interval);
		return;
	}
	var date = new Date();
	var now = date.getTime();
	game.global.lastOnline = now;
	game.global.start = now;

	var tick = 100;
	//game.global.time += tick;
	game.global.zoneStarted -= tick;
	game.global.portalTime -= tick;
	game.global.lastSoldierSentAt -= tick;
	game.global.lastSkeletimp -= tick;
	game.permaBoneBonuses.boosts.lastChargeAt -= tick;
	if (game.global.mapsActive) game.global.mapStarted -= tick;
	if (mappingTime !== 0) mappingTime -= tick;

	mainLoop();
	gameLoop(null, now);
	if (game.global.time > runPortalTime) runPortalTime = game.global.time;
	if (runPortalTime > game.global.time) game.global.time = runPortalTime;
	runIntervalGame = setTimeout(cheatSpeedX, interval, interval);

	if ((date.getSeconds() % 3) === 0) updateLabels();
}

/* function checkAndDisplayEquipment() {
	for (var itemD in game.equipment) {
		var toUpdate = game.equipment[itemD];
		if (toUpdate.locked == 1) continue;
		if (document.getElementById(itemD) === null) drawAllEquipment();
		if (document.getElementById(itemD + "Owned").innerHTML !== toUpdate.level) document.getElementById(itemD + "Owned").innerHTML = toUpdate.level;
	}
} */

function cheatSpeedNormal() {
	clearTimeout(runIntervalGame);
	var now = new Date().getTime();
	game.global.time = 0;
	game.global.start = now;
}

//called by ImportExportTooltip('NameSettingsProfiles')
function cheatChallenge() {
	//read the name in from tooltip
	try {
		var challengeName = document.getElementById("setSettingsNameTooltip").value.replace(/[\n\r]/gm, "");
		if (challengeName == null || game.challenges[challengeName] === undefined) {
			debug("Challenge name didn't match one ingame..", "test");
			return;
		}
	} catch (err) {
		debug("Challenge name didn't match one ingame..", "test");
		return;
	}
	debug("Setting challenge to " + challengeName, "test");
	game.global.challengeActive = challengeName;
}

function cheatRunningCinf() {
	game.global.runningChallengeSquared = !game.global.runningChallengeSquared;
}

function cheatMaxMapBonus() {
	game.global.mapBonus = 10;
}

function cheatMaxTenacity() {
	game.global.zoneStarted -= 7.2e+6;
}

function cheatWorldCell() {
	if (!game.global.mapsActive && !game.global.preMapsActive) {
		game.global.lastClearedCell = game.global.gridArray.length - 2;
		game.global.gridArray[game.global.lastClearedCell + 1].health = 0;
		game.global.gridArray[game.global.gridArray.length - 1].health = 0;
	}
}

function cheatMapCell() {
	if (game.global.mapsActive) {
		game.global.lastClearedMapCell = getCurrentMapObject().size - 2;
		game.global.mapGridArray[game.global.lastClearedMapCell + 1].health = 0;
		game.global.mapGridArray[getCurrentMapObject().size - 2].health = 0;
	}
}

function cheatTrimpStats() {
	game.global.soldierCurrentAttack *= 1e100;
	game.global.soldierHealth *= 1e100;
	game.global.soldierHealthMax *= 1e100;
}