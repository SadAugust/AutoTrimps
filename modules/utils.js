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
	var tmp = JSON.parse(localStorage.getItem('autoTrimpSettings'));
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
	spreadsheet += (game.global.highestRadonLevelCleared + 1 + "\n");
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

function getPageSetting(setting, universe) {
	if (autoTrimpSettings.hasOwnProperty(setting) === false) {
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
	safeSetItems('autoTrimpSettings', serializeSettings())
}

function debug(a, b, c) {
	var settingArray = atFinishedLoading && getPageSetting('spamMessages'),
		p = !0;

	switch (b) {
		case null:
			break;
		case 'general':
			p = settingArray.general;
			break;
		case 'upgrades':
			p = settingArray.upgrades;
			break;
		case 'equips':
			p = settingArray.equipment;
			break;
		case 'buildings':
			p = settingArray.buildings;
			break;
		case 'jobs':
			p = settingArray.jobs;
			break;
		case 'maps':
			p = settingArray.maps;
			break;
		case 'fragment':
			p = settingArray.fragment;
			break;
		case 'mapDetails':
			p = settingArray.map_Details;
			break;
		case 'other':
			p = settingArray.other;
			break;
		case 'zone':
			p = settingArray.zone;
			break;
		case 'exotic':
			p = settingArray.exotic;
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
	game.global.time += tick;

	mainLoop();
	gameLoop(null, now);
	if (game.global.time > runPortalTime) runPortalTime = game.global.time;
	if (runPortalTime > game.global.time) game.global.time = runPortalTime;
	runIntervalGame = setTimeout(cheatSpeedX, interval, interval);

	if ((date.getSeconds() % 1) === 0) updateLabels();
}

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
		game.global.lastClearedCell = game.global.gridArray[game.global.gridArray.length - 1];
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