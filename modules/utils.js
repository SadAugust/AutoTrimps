window.onerror = function catchErrors(msg, url, lineNo, columnNo, error) {
	if (lineNo === 0) return;

	const message = `Message: ${msg} - URL: ${url} - Line: ${lineNo} - Column: ${columnNo} - Error object: ${JSON.stringify(error)}`;
	console.log(`AT logged error: ${message}`);
};

function escapeHtmlAttribute(string, quoteName = '#39') {
	return string.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, `&${quoteName};`).replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

//Loads setting data from localstorage into object
function _loadAutoTrimpsSettings() {
	const settings = JSON.parse(localStorage.getItem('atSettings'));
	if (settings !== null && settings['ATversion'] !== undefined) autoTrimpSettings = settings;
}

//Saves AT settings to localstorage
function safeSetItems(storageName, storageSetting) {
	try {
		localStorage.setItem(storageName, storageSetting);
	} catch (error) {
		if (error.code === 22) debug(`Error: LocalStorage is full, or error. Attempt to delete some portals from your graph or restart browser.`, 'error');
	}
}

//Saves AT settings to localstorage
function saveSettings() {
	safeSetItems('atSettings', serializeSettings());
}

function serializeSettings() {
	const settingProperties = {
		boolean: ['enabled', 'enabledU2'],
		value: ['value', 'valueU2'],
		multiValue: ['value', 'valueU2'],
		textValue: ['value', 'valueU2'],
		multiTextValue: ['value', 'valueU2'],
		valueNegative: ['value', 'valueU2'],
		multitoggle: ['value', 'valueU2'],
		mazArray: ['value', 'valueU2'],
		mazDefaultArray: ['value', 'valueU2'],
		dropdown: ['selected', 'selectedU2'],
		dropdownMulti: ['selected', 'selectedU2']
	};

	const settingString = JSON.stringify(
		Object.keys(autoTrimpSettings).reduce((v, item) => {
			const setting = autoTrimpSettings[item];
			let newSetting = { id: v[item] };

			const properties = settingProperties[setting.type];
			if (properties) {
				properties.forEach((property) => (newSetting[property] = setting[property]));
			} else if (setting.type !== 'action' && setting.type !== 'infoclick') {
				newSetting = setting;
			}

			v[item] = newSetting;
			return v;
		}, {})
	);

	return settingString;
}

function dailyModifiersOutput() {
	const daily = game.global.dailyChallenge;
	if (Object.keys(daily).length === 0) return '';

	const dailyMods = dailyModifiers;
	let returnText = '';

	for (let item in daily) {
		if (item === 'seed') continue;
		returnText += `${dailyMods[item].description(daily[item].strength)} <br>`;
	}

	return returnText;
}

//It gets the value of a setting from autoTrimpSettings. If universe isn't set it will return the value relevant for the current universe we're in.
//If universe is set it will return the value from that universe.
//If the setting is not found it will return false.
function getPageSetting(setting, universe = game.global.universe) {
	if (!autoTrimpSettings.hasOwnProperty(setting)) return false;
	const u2Setting = autoTrimpSettings[setting].universe.indexOf(0) === -1 && setting !== 'universeSetting' && universe === 2;
	const suffix = u2Setting ? 'U2' : '';
	const [enabled, selected, value] = ['enabled', 'selected', 'value'].map((prop) => prop + suffix);

	const settingType = autoTrimpSettings[setting].type;
	if (settingType === 'boolean') return autoTrimpSettings[setting][enabled];
	if (settingType === 'multiValue') return Array.from(autoTrimpSettings[setting][value]).map((x) => parseFloat(x));
	if (settingType === 'multiTextValue') return Array.from(autoTrimpSettings[setting][value]).map((x) => String(x));
	if (settingType === 'textValue' || settingType === 'mazArray' || settingType === 'mazDefaultArray') return autoTrimpSettings[setting][value];
	if (settingType === 'value' || settingType === 'valueNegative') return parseFloat(autoTrimpSettings[setting][value]);
	if (settingType === 'multitoggle') return parseInt(autoTrimpSettings[setting][value]);
	if (settingType.includes('dropdown')) return autoTrimpSettings[setting][selected];
}

//It sets the value of a setting, and then saves the settings.
function setPageSetting(setting, newValue, universe = game.global.universe) {
	if (!autoTrimpSettings.hasOwnProperty(setting)) return false;

	const u2Setting = autoTrimpSettings[setting].universe.indexOf(0) === -1 && setting !== 'universeSetting' && universe === 2;
	const suffix = u2Setting ? 'U2' : '';
	const [enabled, selected, value] = ['enabled', 'selected', 'value'].map((prop) => prop + suffix);

	const enabledIndex = ['boolean'];
	const valueIndex = ['value', 'valueNegative', 'textValue', 'multiTextValue', 'mazArray', 'mazDefaultArray', 'multiValue', 'multitoggle'];
	const selectedIndex = ['dropdown', 'dropdownMulti'];

	const settingType = autoTrimpSettings[setting].type;
	if (enabledIndex.indexOf(settingType) !== -1) autoTrimpSettings[setting][enabled] = newValue;
	else if (valueIndex.indexOf(settingType) !== -1) autoTrimpSettings[setting][value] = newValue;
	else if (selectedIndex.indexOf(settingType) !== -1) autoTrimpSettings[setting][selected] = newValue;

	//Update button values if necessary
	if (settingType !== 'mazArray' && settingType !== 'mazDefaultArray') updateAutoTrimpSettings(true);
	saveSettings();
}

//Looks at the spamMessages setting and if the message is enabled, it will print it to the message log & console.
function debug(message, messageType, icon) {
	if (!atConfig.initialise.loaded) return;
	const alwaysAllow = ['offline', 'debugStats', 'test', 'heirlooms', 'profile', 'error', 'mazSettings'];

	const settingArray = getPageSetting('spamMessages');
	const canRunTW = [...alwaysAllow, 'maps', 'map_Destacking', 'map_Details', 'map_Skip', 'challenge'].includes(messageType);
	const sendMessage = messageType in settingArray ? settingArray[messageType] : [...alwaysAllow, 'challenge'].includes(messageType);

	if (sendMessage || !messageType) {
		console.log(`${timeStamp()} ${updatePortalTimer(true)} ${message}`);
		if (!usingRealTimeOffline || canRunTW) message_AT(message, messageType, icon);
	}
}

function timeStamp() {
	const date = new Date();
	return date.toTimeString().split(' ')[0];
}

function setTitle() {
	const world = game.global.world;
	const versionNumber = document.getElementById('versionNumber').innerHTML;
	document.title = `(${world}) Trimps ${versionNumber}`;
}

function message_AT(message, messageType, icon) {
	const log = document.getElementById('log');
	const needsScroll = log.scrollTop + 10 > log.scrollHeight - log.clientHeight;
	const showMessages = getPageSetting('spamMessages').show;
	const displayType = showMessages || typeof showMessages === 'undefined' ? 'block' : 'none';

	const iconPrefix = icon && icon.charAt(0) === '*' ? 'icomoon icon-' : 'glyphicon glyphicon-';
	icon = icon ? icon.replace('*', '') : icon;

	if (game.options.menu.timestamps.enabled) {
		message = `${game.options.menu.timestamps.enabled === 1 ? getCurrentTime() : updatePortalTimer(true)} ${message}`;
	}

	if (icon) message = `<span class="${iconPrefix}${icon}"></span> ${message}`;

	message = `<span class="glyphicon glyphicon-superscript"></span> ${message}`;
	message = `<span class="icomoon icon-text-color"></span>${message}`;

	const messageHTML = `<span class="AutoTrimpsMessage message ${messageType}" style="display: ${displayType}">${message}</span>`;
	const messages = document.getElementsByClassName(`AutoTrimpsMessage`);
	const lastMessageElement = messages.length > 1 ? messages[messages.length - 1] : null;

	if (lastMessageElement && lastMessageElement.innerHTML.includes(message)) {
		const lastMessage = lastMessageElement.innerHTML;
		const countIndex = lastMessage.lastIndexOf(' x');
		const lastMessageWithoutCount = countIndex !== -1 ? lastMessage.slice(0, countIndex) : lastMessage;
		const lastMessageCount = countIndex !== -1 ? parseInt(lastMessage.slice(countIndex + 2)) : 1;
		lastMessageElement.innerHTML = `${lastMessageWithoutCount} x${lastMessageCount + 1}`;
	} else {
		log.innerHTML += messageHTML;
	}

	// Scroll the log if needed
	if (needsScroll) log.scrollTop = log.scrollHeight;

	trimMessages('AutoTrimps');
}

function filterMessage_AT() {
	const logElement = document.getElementById('log');
	const messageElements = document.getElementsByClassName(`AutoTrimpsMessage`);
	const filterElement = document.getElementById(`AutoTrimpsFilter`);
	const messageSetting = getPageSetting('spamMessages');
	const isDisplayed = !getPageSetting('spamMessages').show;
	const displayStyle = isDisplayed ? 'block' : 'none';
	messageSetting.show = isDisplayed;
	saveSettings();
	filterElement.className = getTabClass(isDisplayed);

	Array.from(messageElements).forEach((messageElement) => {
		messageElement.style.display = displayStyle;
	});
	logElement.scrollTop = logElement.scrollHeight;
}

function addAnS(num) {
	return num === 1 ? '' : 's';
}

//Check if the gameUser setting has been set to a valid user.
function gameUserCheck(skipTest) {
	const user = autoTrimpSettings.gameUser.value.trim().toLowerCase();
	const allowedUsers = ['sadaugust', 'kyotie', 'charles'];
	if (!skipTest) allowedUsers.push('test');

	return allowedUsers.includes(user);
}

// DO NOT RUN CODE BELOW THIS LINE -- PURELY FOR TESTING PURPOSES

// Will activate timewarp.
function _getTimeWarpHours(inputHours) {
	let timeWarpHours = 24; // default value

	if (inputHours) {
		timeWarpHours = inputHours;
	} else {
		try {
			timeWarpHours = parseNum(document.getElementById('importBox').value.replace(/[\n\r]/gm, ''));
			if (!timeWarpHours) {
				debug(`Time Warp input is invalid. Defaulting to 24 hours.`, 'offline');
			}
		} catch (err) {
			debug(`Time Warp input is invalid. Defaulting to 24 hours.`, 'offline');
		}
	}

	return timeWarpHours;
}

function _adjustGlobalTimers(keys, adjustment, testing = false) {
	keys.forEach((key) => {
		if (key === 'lastChargeAt') game.permaBoneBonuses.boosts[key] += adjustment;
		else game.global[key] += adjustment;
	});
}

function testTimeWarp(hours) {
	const timeWarpHours = _getTimeWarpHours(hours);
	const timeToRun = timeWarpHours * 3600000;

	const keys = ['lastOnline', 'portalTime', 'zoneStarted', 'lastSoldierSentAt', 'lastSkeletimp', 'lastBonePresimpt', 'lastChargeAt'];
	_adjustGlobalTimers(keys, -timeToRun, true);
	offlineProgress.start();
}

function testChallenge() {
	//read the name in from tooltip
	const challengeName = document.getElementById('importBox').value.replace(/[\n\r]/gm, '');

	try {
		if (challengeName === null || game.challenges[challengeName] === undefined) {
			debug(`Challenge name didn't match one ingame.`, 'test');
			return;
		}
	} catch (err) {
		debug(`Challenge name didn't match one ingame.`, 'test');
		return;
	}

	debug(`Setting challenge to ${challengeName}`, 'test');
	game.global.challengeActive = challengeName;
}

function testRunningC2() {
	game.global.runningChallengeSquared = !game.global.runningChallengeSquared;
}

function testMetalIncome() {
	const map = getCurrentMapObject();
	const mapLevel = game.global.mapsActive ? map.level - game.global.world : 0;

	const secondsPerMap = (trimpStats.hyperspeed2 ? 6 : 8) / maxOneShotPower(true);
	const mapsPerHour = 3600 / secondsPerMap;
	const mapsPerDay = mapsPerHour * 24;

	const resourcesGained = _getResourcesFromMap('metal', getAvailableSpecials('lmc'), '0,0,1', mapLevel, mapsPerDay);
	const decayMult = decayLootMult(mapsPerDay);

	debug(`Metal gained from 1 day ${prettify(resourcesGained * decayMult)}`, 'test');
}

function testEquipmentMetalSpent() {
	const equipMult = getEquipPriceMult();
	let levelCost = 0;
	let prestigeCost = 0;

	function getTotalPrestigeCost(what, prestigeCount) {
		let actualCost = 0;

		for (let i = 1; i <= prestigeCount; i++) {
			const equipment = game.equipment[what];
			let prestigeMod;
			const nextPrestigeCount = i + 1;
			if (nextPrestigeCount >= 4) prestigeMod = (nextPrestigeCount - 3) * 0.85 + 2;
			else prestigeMod = nextPrestigeCount - 1;
			let prestigeCost = Math.round(equipment.oc * Math.pow(1.069, prestigeMod * game.global.prestige.cost + 1)) * equipMult;
			actualCost += prestigeCost;

			//Calculate cost of current equip levels
			if (prestigeCount === i && equipment.level > 1) {
				for (let j = 2; j <= equipment.level; j++) {
					levelCost += prestigeCost * Math.pow(1.2, j - 1);
				}
			}
		}

		return actualCost;
	}

	for (let i in atData.equipment) {
		if (game.equipment[i].locked) continue;
		prestigeCost += getTotalPrestigeCost(i, game.equipment[i].prestige - 1);
	}

	debug(`Cost of all prestiges: ${prettify(prestigeCost)}`, 'test');
	debug(`Cost of all equip levels: ${prettify(levelCost)}`, 'test');
	debug(`Cost of all equipment: ${prettify(prestigeCost + levelCost)}`, 'test');
}

function testMaxMapBonus() {
	game.global.mapBonus = 10;
}

function testMaxTenacity() {
	game.global.zoneStarted -= 7.2e6;
}

function testWorldCell() {
	if (game.global.mapsActive || game.global.preMapsActive) return;

	game.global.lastClearedCell = game.global.gridArray.length - 2;
	game.global.gridArray[game.global.lastClearedCell + 1].health = 0;
	game.global.gridArray[game.global.gridArray.length - 1].health = 0;
}

function testMapCell() {
	if (!game.global.mapsActive) return;
	const mapObject = getCurrentMapObject();

	game.global.lastClearedMapCell = mapObject.size - 2;
	game.global.mapGridArray[game.global.lastClearedMapCell + 1].health = 0;
	game.global.mapGridArray[mapObject.size - 2].health = 0;
}

function testTrimpStats() {
	game.global.soldierCurrentAttack *= 1e100;
	game.global.soldierHealth *= 1e100;
	game.global.soldierHealthMax *= 1e100;
}

function getAncientTreasureName() {
	return game.global.universe === 2 ? 'Atlantrimp' : 'Trimple Of Doom';
}

function _getAverageExotics(mapClears = 1, mapCells = trimpStats.mapSize) {
	const exoticChance = getExoticChance();
	const cells = mapClears * mapCells;

	let expectedExotics = cells * (exoticChance / 100);
	expectedExotics += (cells * 0.02) / (5 / game.badGuys.Magimp.lootCount());
	expectedExotics = Math.floor(expectedExotics);

	return expectedExotics;
}

function _getMapTimer(mapsClears = 1, special = getAvailableSpecials('lmc')) {
	const cacheTimer = getSpecialTime(special);
	let mapTimer = mapsClears * cacheTimer;

	const exoticCount = _getAverageExotics(mapsClears);
	if (game.unlocks.imps.Chronoimp) mapTimer += exoticCount * 5;
	if (game.unlocks.imps.Jestimp) mapTimer += (exoticCount * 45) / 4;

	return mapTimer;
}

function _getResourcesFromMap(resource = 'metal', cache = getAvailableSpecials('lmc'), jobRatio = '0,0,1', mapLevel = 0, mapCount = 1) {
	if (Number(jobRatio) === -1) jobRatio = _getAutoJobRatio();
	if (typeof jobRatio === 'object') jobRatio = jobRatio.join(',');

	const mapTime = _getMapTimer(mapCount, cache);
	const baseLoot = simpleSeconds_AT(resource, mapTime, jobRatio);
	const scaledLoot = scaleToCurrentMap_AT(baseLoot, false, true, mapLevel);

	return scaledLoot;
}

// Factor in the resource reduction from spending time farming during Decay or Melt
function decayLootMult(mapCount) {
	const challengeName = game.global.universe === 2 ? 'Melt' : 'Decay';
	if (!challengeActive(challengeName)) return 1;

	const mapClearTime = (trimpStats.hyperspeed2 ? 6 : 8) / maxOneShotPower(true);
	const stackCap = game.challenges[challengeName].maxStacks;
	let lootMult = 1;
	let decayStacks = game.challenges[challengeName].stacks;

	for (let x = 0; x < mapCount; x++) {
		lootMult /= Math.pow(game.challenges[challengeName].decayValue, Math.floor(decayStacks));
		decayStacks = Math.min(decayStacks + mapClearTime, stackCap);
		lootMult *= Math.pow(game.challenges[challengeName].decayValue, Math.floor(decayStacks));
	}

	return lootMult;
}

function hypothermiaBonfireCost() {
	if (!challengeActive('Hypothermia')) return 0;

	let cost = game.challenges.Hypothermia.bonfirePrice();
	if (cost > game.resources.wood.owned) return 0;

	let bonfiresOwned = game.challenges.Hypothermia.totalBonfires;

	while (game.resources.wood.owned > cost + Math.pow(100, bonfiresOwned + 1) * 1e10) {
		bonfiresOwned++;
		cost += Math.pow(100, bonfiresOwned) * 1e10;
	}

	return cost;
}

function hypothermiaEndZone() {
	if (!challengeActive('Hypothermia')) return Infinity;

	const hypoDefaultSettings = getPageSetting('hypothermiaSettings')[0];
	if (!hypoDefaultSettings) return Infinity;

	const hypoEndZone = hypoDefaultSettings.frozencastle;
	if (!hypoEndZone) return Infinity;

	return parseInt(hypoEndZone[0]);
}

function _priorityChallengeCheck(challenge) {
	if (game.global.multiChallenge[what]) return true;
	else if (game.global.challengeActive === what) return true;
	return false;
}

function getPriorityOrder(showDisabled = false) {
	let order = [];
	let settingsList = [];

	if (game.global.universe === 1) settingsList = ['Prestige Raiding', 'Bionic Raiding', 'Map Farm', 'Void Maps', 'Map Bonus', 'HD Farm', 'Toxicity'];
	if (game.global.universe === 2) settingsList = ['Desolation Gear Scum', 'Prestige Raiding', 'Smithy Farm', 'Map Farm', 'Tribute Farm', 'Worshipper Farm', 'Quagmire', 'Insanity', 'Alchemy', 'Hypothermia', 'Void Maps', 'Map Bonus', 'HD Farm'];

	const settingNames = {
		'Prestige Raiding': { settingName: 'raiding' },
		'Bionic Raiding': { settingName: 'bionicRaiding' },
		'Map Farm': { settingName: 'mapFarm' },
		'Void Maps': { settingName: 'voidMap' },
		'HD Farm': { settingName: 'hdFarm' },
		'Map Bonus': { settingName: 'mapBonus' },
		Toxicity: { settingName: 'toxicity', challenge: 'Toxicity' },
		'Desolation Gear Scum': { settingName: 'desolation', challenge: 'Desolation' },
		'Smithy Farm': { settingName: 'smithyFarm' },
		'Tribute Farm': { settingName: 'tributeFarm' },
		'Worshipper Farm': { settingName: 'worshipperFarm' },
		Quagmire: { settingName: 'quagmire', challenge: 'Quagmire' },
		Insanity: { settingName: 'insanity', challenge: 'Insanity' },
		Alchemy: { settingName: 'alchemy', challenge: 'Alchemy' },
		Hypothermia: { settingName: 'hypothermia', challenge: 'Hypothermia' }
	};

	for (let i = 0; i < settingsList.length; i++) {
		const setting = settingNames[settingsList[i]];
		const settingName = setting.settingName + 'Settings';
		//Skip settings that have a challenge and the challenge isn't active
		if (setting.challenge && !challengeActive(setting.challenge)) continue;
		const settingData = getPageSetting(settingName);

		for (let y = 1; y < settingData.length; y++) {
			if (!showDisabled && !settingData[y].active) continue;
			if (typeof settingData[y].runType !== 'undefined' && settingData[y].runType !== 'All') {
				if (trimpStats.isDaily) {
					if (settingData[y].runType !== 'Daily') continue;
				} else if (trimpStats.isC3) {
					if (settingData[y].runType !== 'C3') continue;
					else if (settingData[y].challenge3 !== 'All' && !challengeActive(settingData[y].challenge3)) continue;
				} else if (trimpStats.isOneOff) {
					if (settingData[y].runType !== 'One Off') continue;
					else if (settingData[y].challengeOneOff !== 'All' && !challengeActive(settingData[y].challengeOneOff)) continue;
				} else {
					if (settingData[y].runType === 'Filler') {
						const currChallenge = settingData[y].challenge === 'No Challenge' ? '' : settingData[y].challenge;
						if (settingData[y].challenge !== 'All' && !challengeActive(currChallenge)) continue;
					} else continue;
				}
			}

			settingData[y].name = settingsList[i];
			settingData[y].index = i;
			order.push(settingData[y]);
		}
	}

	order.sort(function (a, b) {
		if (a.priority === b.priority) return a.index === b.index ? (a.world === b.world ? (a.cell > b.cell ? 1 : -1) : a.world > b.world ? 1 : -1) : a.index > b.index ? 1 : -1;
		return a.priority > b.priority ? 1 : -1;
	});

	return order;
}

function getPerkModifier(what) {
	return game.portal[what].modifier || 0;
}

function noBreedChallenge(mapping = false) {
	if (mapping && (game.global.preMapsActive || game.global.mapsActive || game.global.soldierHealth <= 0)) return false;
	return challengeActive('Trapper') || challengeActive('Trappapalooza');
}

function downloadSave(portal) {
	if (!getPageSetting('downloadSaves')) return;
	if (portal && !portalWindowOpen) return;

	importExportTooltip(null, 'downloadSave');
}

function _assembleChangelog(changes) {
	return changes.map((change) => `<br>${change}`).join('');
}

function _assembleChangelogFooter() {
	return `
		<br><b>SadAugust fork</b> - <u>Report any bugs/problems please</u>!
		<br>Talk with the other Trimpers: <a target="Trimps" href="https://discord.gg/trimps">Trimps Discord Server</a>
		<br>Check <a target="#" href="https://github.com/SadAugust/AutoTrimps/commits/gh-pages" target="#">the commit history</a> (if you want).`;
}

function printChangelog(changes) {
	const body = _assembleChangelog(changes);
	const footer = _assembleChangelogFooter();
	const action = 'cancelTooltip()';
	const title = `Script Update Notice<br>${atConfig.initialise.version}`;
	const acceptBtnText = 'Thank you for playing with AutoTrimps.';
	const hideCancel = true;

	tooltip('confirm', null, 'update', body + footer, action, title, acceptBtnText, null, hideCancel);
	if (typeof _verticalCenterTooltip === 'function') _verticalCenterTooltip(true);
	else verticalCenterTooltip(true);
}

function updateFluffyRewards() {
	let calculatedPrestige = Fluffy.getCurrentPrestige();
	if (masteryPurchased('fluffyAbility')) calculatedPrestige++;

	const rewardsList = Fluffy.getRewardList();
	const prestigeRewardsList = Fluffy.getPrestigeRewardList();

	const combinedList = [...rewardsList, ...prestigeRewardsList];

	const fluffyLevelPlusPrestige = Fluffy.currentLevel + calculatedPrestige;

	const fluffyRewards = combinedList.reduce((acc, reward, index) => {
		if (fluffyLevelPlusPrestige > index) {
			acc[reward] = (acc[reward] || 0) + 1;
		} else if (!acc[reward]) {
			acc[reward] = 0;
		}
		return acc;
	}, {});

	fluffyRewards.universe = game.global.universe;
	fluffyRewards.level = fluffyLevelPlusPrestige;

	const totalRewards = [...Fluffy.prestigeRewards, ...Fluffy.rewards, ...Fluffy.rewardsU2];
	totalRewards.forEach((reward) => {
		fluffyRewards[reward] = fluffyRewards[reward] || 0;
	});

	fluffyRewards.reincarnate = fluffyRewards.reincarnate || 0;

	return fluffyRewards;
}

function setupMODULES() {
	Object.assign(MODULES, game.global.addonUser);
	MODULES = new Proxy(MODULES, {
		set(target, property, value) {
			target[property] = value;
			if (game.global.addonUser) {
				game.global.addonUser[property] = value;
			}
			return true;
		}
	});
}

function setupAddonUser(force) {
	if (typeof game.global.addonUser === 'object' && !force) return false;

	game.global.addonUser = { mapData: {} };

	const settings = {
		value: ['hdFarm', 'voidMap', 'boneShrine', 'mapBonus', 'mapFarm', 'raiding', 'bionicRaiding', 'toxicity'],
		valueU2: ['hdFarm', 'voidMap', 'boneShrine', 'mapBonus', 'mapFarm', 'raiding', 'worshipperFarm', 'tributeFarm', 'smithyFarm', 'quagmire', 'archaeology', 'insanity', 'alchemy', 'hypothermia', 'desolation']
	};

	const maxSettings = _mapSettingsGetActive().maxSettings + 1;
	const createObjArray = () => Array.from({ length: maxSettings }, () => ({ done: '' }));

	Object.entries(settings).forEach(([valueKey, settingNames]) => {
		settingNames.forEach((item) => {
			const settingKey = `${item}Settings`;
			game.global.addonUser.mapData[settingKey] = game.global.addonUser.mapData[settingKey] || {};
			game.global.addonUser.mapData[settingKey][valueKey] = game.global.addonUser.mapData[settingKey][valueKey] || createObjArray();
		});
	});

	const mapItems = {
		fragmentFarming: false,
		lifeActive: false,
		lifeCell: 0,
		slowScumming: false,
		mapRepeats: 0,
		mapRepeatsSmithy: [0, 0, 0],
		mapTimer: 0,
		lastMapWeWereIn: { id: 0 },
		fragmentCost: Infinity
	};

	const mapFunctionItems = {
		afterVoids: false,
		isHealthFarming: '',
		hasHealthFarmed: '',
		hasVoidFarmed: '',
		runUniqueMap: '',
		questRun: false,
		hypoPackrat: false,
		desoGearScum: false
	};

	const portal = {
		timeout: 4000,
		bufferExceedFactor: 5,
		heHrTimeout: null,
		portalForVoid: false,
		afterVoids: false,
		afterPoisonVoids: false,
		portalUniverse: Infinity,
		forcePortal: false,
		currentChallenge: 'None',
		dontPushData: false,
		dailyMods: '',
		dailyPercent: 0,
		zonePostpone: 0,
		disableAutoRespec: 0
	};

	const popups = {
		challenge: false,
		respecAncientTreasure: false,
		remainingTime: Infinity,
		intervalID: null,
		portal: false,
		mazWindowOpen: false
	};

	const updateGamma = getPageSetting('gammaBurstCalc');
	const gammaValue = updateGamma ? getHeirloomBonus('Shield', 'gammaBurst') / 100 : 0;

	const heirlooms = {
		plagueSwap: false,
		compressedCalc: false,
		gammaBurstPct: gammaValue > 0 ? gammaValue : 1,
		shieldEquipped: game.global.ShieldEquipped.id,
		breedHeirloom: usingBreedHeirloom()
	};

	game.global.addonUser = {
		buildings: { betaHouseEfficiency: false },
		gather: { coordBuffering: false },
		heirlooms: { ...heirlooms },
		...game.global.addonUser,
		mapFunctions: { ...mapFunctionItems },
		maps: { ...mapItems },
		mutatorPreset: { selected: 0 },
		popups: { ...popups },
		portal: { ...portal },
		u1unlocks: [],
		u2unlocks: []
	};

	setupMODULES();
}

function getMaxAffordable(baseCost, totalResource, costScaling, isCompounding) {
	if (!isCompounding) {
		return Math.floor((costScaling - 2 * baseCost + Math.sqrt(Math.pow(2 * baseCost - costScaling, 2) + 8 * costScaling * totalResource)) / 2);
	}

	return Math.floor(Math.log(1 - ((1 - costScaling) * totalResource) / baseCost) / Math.log(costScaling));
}

function getResourcefulMult() {
	const resourcefulLevel = getPerkLevel('Resourceful');
	return resourcefulLevel > 0 ? Math.pow(1 - getPerkModifier('Resourceful'), resourcefulLevel) : 1;
}

function maybePrettify(value, pretty) {
	return pretty && value && value !== Infinity ? prettify(value) : value;
}

function nurseryHousingEfficiency(pretty = false) {
	if (game.global.universe !== 1) return { mostEfficient: 'Housing' };

	const trimps = game.resources.trimps;
	const trimpsMax = trimps.realMax();

	const maxWorkers = (extraTrimps) => employableWorkers(trimpsMax + extraTrimps, trimpsMax + extraTrimps);
	const maxBreedable = (extraTrimps) => trimpsMax + extraTrimps - trimpsEffectivelyEmployed(maxWorkers(extraTrimps));
	const maxBreeding = (extraTrimps) => maxBreedable(extraTrimps) - trimps.getCurrentSend();
	const breedingRatio = (extraTrimps) => maxBreedable(0) / maxBreeding(extraTrimps);

	const name = mostEfficientHousing_beta('gems', true);
	const popBonus = name ? getHousingBonus(name, true) : 0;
	let gemCost = name ? getBuildingItemPrice(game.buildings[name], 'gems', false, 1) : 0;
	let breedingImpact = breedingRatio(0) / breedingRatio(popBonus) - 1;
	let efficiency = name ? gemCost / breedingImpact : Infinity;

	const housingEfficiency = efficiency;

	const housing = {
		name: name,
		efficiency: maybePrettify(efficiency, pretty),
		gemCost: maybePrettify(gemCost, pretty),
		breedingImpact: maybePrettify(breedingImpact, pretty),
		popBonus: maybePrettify(popBonus, pretty)
	};

	const potencyMod = _getPotencyMod();
	const newPotencyMod = 1 + 1.01 * (potencyMod - 1);
	gemCost = getBuildingItemPrice(game.buildings.Nursery, 'gems', false, 1);
	breedingImpact = Math.log10(newPotencyMod) / Math.log10(potencyMod) - 1;
	efficiency = gemCost / breedingImpact;

	const nursery = {
		name: 'Nursery',
		efficiency: maybePrettify(efficiency, pretty),
		gemCost: maybePrettify(gemCost, pretty),
		breedingImpact: maybePrettify(breedingImpact, pretty)
	};

	return {
		mostEfficient: efficiency < housingEfficiency ? 'Nursery' : 'Housing',
		housing,
		nursery
	};
}

function _calcHSImpact(equipName, worldType = _getTargetWorldType(), difficulty = 1, prestigeInfo, hitsBefore) {
	const extraAmount = prestigeInfo.shouldPrestige ? prestigeInfo.minNewLevel - 1 : 1;
	const extraItem = new ExtraItem(equipName, extraAmount, prestigeInfo.shouldPrestige);
	return hitsBefore === Infinity ? Infinity : calcHitsSurvived(game.global.world, worldType, difficulty, 0, extraItem, false) - hitsBefore;
}

function shieldGymEfficiency(hitsBefore = _getTargetWorldType() === 'void' ? hdStats.hitsSurvivedVoid : hdStats.hitsSurvived, pretty = false) {
	if (game.global.universe !== 1 || game.global.soldierCurrentBlock === null) return { mostEfficient: 'Shield' };

	const shieldBlock = game.equipment.Shield.blockNow;
	const mapObj = game.global.mapsActive && !game.global.voidBuff ? getCurrentMapObject() : { level: game.global.world, location: undefined };
	const zone = Math.max(game.global.world, mapObj.level);
	const worldType = mapObj.location === 'Bionic' ? 'map' : _getTargetWorldType();
	const difficulty = worldType === 'void' ? _getVoidPercent().difficulty : mapObj.location === 'Bionic' ? 2.6 : 1;

	const itemData = game.equipment.Shield;
	const stat = shieldBlock ? 'block' : 'health';
	const zoneGo = zoneGoCheck(undefined, 'health', { location: worldType }).active;
	const resourceSpendingPct = calculateResourceSpendingPct(zoneGo, 'health');
	const prestige = buyPrestigeMaybe('Shield', resourceSpendingPct, itemData.level);
	const shieldIncrease = _calcHSImpact('Shield', worldType, difficulty, prestige, hitsBefore);

	const prestigeCost = () => (prestige.prestigeCost * (1 - Math.pow(1.2, prestige.minNewLevel))) / (1 - 1.2);
	const levelCost = () => getBuildingItemPrice(itemData, 'wood', true, 1) * getEquipPriceMult();

	const cantPrestige = !prestige.prestigeAvailable || !game.resources.gems.owned;
	const equipCap = calculateEquipCap(stat, zoneGo);
	const aboveEquipCap = itemData.level >= (prestige.prestigeAvailable ? Math.min(equipCap, 9) : equipCap);

	let cost = prestige.shouldPrestige ? prestigeCost() : levelCost();
	let hsImpact = shieldIncrease;
	let efficiency = cantPrestige && aboveEquipCap ? Infinity : cost / shieldIncrease;

	const prestigeNumeral = romanNumeral(itemData.prestige + (prestige.shouldPrestige ? 1 : 0));
	const prestigeName = `Prestige ${prestigeNumeral} + Level ${prestige.minNewLevel}`;
	const levelName = `${prestigeNumeral} Level ${itemData.level + 1}`;

	const shieldEfficiency = efficiency;

	const Shield = {
		name: 'Shield ' + (prestige.shouldPrestige ? prestigeName : levelName),
		efficiency: maybePrettify(efficiency, pretty),
		cost: maybePrettify(cost, pretty),
		hsImpact: maybePrettify(hsImpact, pretty),
		shouldPrestige: prestige.shouldPrestige
	};

	const gymCost = getBuildingItemPrice(game.buildings.Gym, 'wood', false, 1) * getResourcefulMult();
	const gymAmount = Math.ceil(cost / gymCost);
	const gymXCost = getBuildingItemPrice(game.buildings.Gym, 'wood', false, gymAmount) * getResourcefulMult();

	let gymIncrease, gymIncreaseAfterX, hitsAfter, hitsAfterX, efficiencyX;

	hitsAfter = calcHitsSurvived(zone, worldType, difficulty, 1);
	gymIncrease = hitsAfter === Infinity || hitsAfter === 0 ? Infinity : hitsAfter - hitsBefore;
	efficiency = gymCost / gymIncrease;

	let onlyOneGym = hitsAfter === Infinity || gymAmount <= 1;

	if (!onlyOneGym) {
		hitsAfterX = onlyOneGym ? hitsAfter : calcHitsSurvived(game.global.world, worldType, difficulty, gymAmount);
		gymIncreaseAfterX = hitsAfterX === Infinity ? Infinity : hitsAfterX === 0 ? Infinity : hitsAfterX - hitsBefore;
		efficiencyX = gymXCost / gymIncreaseAfterX;
		onlyOneGym |= efficiency <= efficiencyX;
	}

	cost = onlyOneGym ? gymCost : gymXCost;
	hsImpact = onlyOneGym ? gymIncrease : gymIncreaseAfterX;
	efficiency = onlyOneGym ? efficiency : efficiencyX;

	const Gym = {
		name: 'Gym x' + (onlyOneGym ? 1 : gymAmount),
		efficiency: maybePrettify(efficiency, pretty),
		cost: maybePrettify(cost, pretty),
		hsImpact: maybePrettify(hsImpact, pretty)
	};

	return {
		mostEfficient: efficiency <= 0 && shieldEfficiency <= 0 ? 'None' : efficiency > shieldEfficiency ? 'Shield' : 'Gym',
		Shield,
		Gym
	};
}

function biomeEfficiency(pretty = false, hitsBefore = _getTargetWorldType() === 'void' ? hdStats.hitsSurvivedVoid : hdStats.hitsSurvived, mostEffEquip = mostEfficientEquipment(undefined, undefined, true), shieldGymEff = shieldGymEfficiency()) {
	if (game.global.universe !== 1 || game.global.decayDone || shieldGymEff.mostEfficient === 'None' || mapSettings.mapName === 'HD Farm') return { biome: 'Mountain' };

	const worldType = _getTargetWorldType();
	let mostEff = mostEffEquip.health.name;
	let name = mostEff;
	let cost, hsImpact, efficiency;

	if (mostEff) {
		const difficulty = worldType === 'void' ? _getVoidPercent().difficulty : 1;
		const zoneGo = zoneGoCheck(undefined, 'health', { location: worldType }).active;
		const resourceSpendingPct = calculateResourceSpendingPct(zoneGo, 'health');

		const obj = game.equipment[mostEff];
		const prestige = buyPrestigeMaybe(mostEff, resourceSpendingPct, obj.level);

		const prestigeCost = (prestige.prestigeCost * (1 - Math.pow(1.2, prestige.minNewLevel))) / (1 - 1.2);
		const levelCost = getBuildingItemPrice(obj, 'metal', true, 1) * getEquipPriceMult();

		cost = prestige.shouldPrestige ? prestigeCost : levelCost;
		hsImpact = _calcHSImpact(mostEff, worldType, difficulty, prestige, hitsBefore);
		efficiency = cost / hsImpact;
	}

	const metalEquipEfficiency = efficiency;

	const metalEquip = {
		name: name,
		efficiency: maybePrettify(efficiency, pretty),
		cost: maybePrettify(cost, pretty),
		hsImpact: maybePrettify(hsImpact, pretty)
	};

	mostEff = shieldGymEff.mostEfficient;
	name = shieldGymEff[mostEff].name;
	cost = shieldGymEff[mostEff].cost;
	hsImpact = shieldGymEff[mostEff].hsImpact;
	efficiency = shieldGymEff[mostEff].efficiency;

	const ShieldGym = {
		name: name,
		efficiency: maybePrettify(efficiency, pretty),
		cost: maybePrettify(cost, pretty),
		hsImpact: maybePrettify(hsImpact, pretty)
	};

	let hdCurrent = worldType === 'void' ? hdStats.hdRatioVoid : hdStats.hdRatio;
	if (!hdCurrent) {
		const difficulty = worldType === 'void' ? _getVoidPercent(game.global.world, game.global.universe).difficulty : 1;
		hdCurrent = calcHDRatio(game.global.world, worldType, false, difficulty);
	}

	const hdTargetRatio = mapSettings.mapName === 'HD Farm' ? mapSettings.hdRatio : getPageSetting('mapBonusRatio');
	const hdToTargetRatio = hdCurrent / hdTargetRatio;
	const hsTargetRatio = targetHitsSurvived(false, worldType);
	const hsToTargetRatio = hitsBefore / hsTargetRatio;

	// TODO Maybe this value should consider hsToTargetRatio too, and maybe AE: HS and AE: HD too
	let metalEffRatio = hdToTargetRatio > 1 ? 2.5 : 1;

	// TODO Refactor this after considering the TODOs below
	if (!metalEquip.name) {
		if (hsToTargetRatio === Infinity) metalEffRatio = 1; /* don't need health */
		else if (!mostEffEquip.attack.name) metalEffRatio = 0;
		else if (hdToTargetRatio > 1 && hsToTargetRatio < 1) metalEffRatio = Infinity; /* Need both - TODO compare ShieldGym hsEfficiency vs metalEquip hdEfficiency instead */
		else if (hdToTargetRatio > 1) metalEffRatio = Infinity; /* Need damage */
		else if (hsToTargetRatio < 1) metalEffRatio = 0; /* Need health */
		else metalEffRatio = Infinity; /* Need nothing - TODO Maybe compare AE: HS target vs AE: HD target at this point? */
	}

	const mostEfficient = efficiency * metalEffRatio < metalEquipEfficiency || !metalEffRatio ? ShieldGym.name : metalEquip.name || mostEffEquip.attack.name || 'attack';
	const biome = mostEfficient === ShieldGym.name ? 'Forest' : 'Mountain';

	return {
		biome,
		mostEfficient,
		metalEquip,
		ShieldGymEff: ShieldGym,
		metalEffRatio
	};
}

function ceilToNearestMultipleOf(number, multipleOf, offSet) {
	const n = number - offSet;
	const roundedUp = Math.ceil(n / multipleOf) * multipleOf;
	return roundedUp + offSet;
}

function argSort(array, reverseStability = false) {
	return array
		.map((value, index) => [value, index])
		.sort((a1, a2) => {
			let diff = a1[0] - a2[0];
			return diff ? diff : reverseStability ? a2[1] - a1[1] : a1[1] - a2[1];
		})
		.map((a) => a[1]);
}

function elementExists(element) {
	return document.getElementById(element).style.display !== 'none';
}

function elementVisible(element) {
	let visible = document.getElementById(element).style.visibility !== 'hidden';
	return elementExists(element) && visible;
}

function getCurrentQuest() {
	if (!challengeActive('Quest') || !getPageSetting('quest')) return 0;
	if (game.global.world < game.challenges.Quest.getQuestStartZone()) return 0;

	const questProgress = game.challenges.Quest.getQuestProgress();
	if (questProgress === 'Failed!' || questProgress === 'Quest Complete!') return 0;

	const questDescription = game.challenges.Quest.getQuestDescription();
	const resourceMultipliers = ['food', 'wood', 'metal', 'gems', 'science'];
	const resourceIndex = resourceMultipliers.findIndex((resource) => questDescription.includes(resource));
	if (resourceIndex !== -1) return resourceIndex + 1;

	const otherQuests = ['Complete 5 Maps at Zone level', 'One-shot 5 world enemies', "Don't let your shield break before Cell 100", "Don't run a map before Cell 100", 'Buy a Smithy'];
	const otherIndex = otherQuests.findIndex((quest) => questDescription === quest);

	return otherIndex !== -1 ? otherIndex + 6 : 0;
}

function displayMostEfficientBuilding(forceUpdate = false) {
	if (!atConfig.intervals.oneSecond && !forceUpdate) return;
	if (!game.buildings.Hub.locked || !getPageSetting('buildingMostEfficientDisplay')) return;

	const foodHousing = ['Hut', 'House'];
	const gemHousing = ['Mansion', 'Hotel', 'Resort', 'Gateway', 'Collector', 'Warpstation'];

	bestFoodHousing = mostEfficientHousing_beta('food', true);
	bestGemHousing = mostEfficientHousing_beta('gems', true);

	gemHousing
		.map((name) => ({ mostEff: name === bestGemHousing, elem: document.getElementById(name) }))
		.filter((house) => house.elem)
		.forEach((house) => _updateMostEfficientDisplay(house.elem, house.mostEff));

	foodHousing
		.map((name) => ({ mostEff: name === bestFoodHousing, elem: document.getElementById(name) }))
		.filter((house) => house.elem)
		.forEach((house) => _updateMostEfficientDisplay(house.elem, house.mostEff));
}

function displayShieldGymEfficiency(forceUpdate = false) {
	if (!atConfig.intervals.oneSecond && !forceUpdate) return;
	if (game.equipment.Shield.locked) return;
	if (!getPageSetting('shieldGymMostEfficientDisplay')) return;

	const shieldGymResults = hdStats.shieldGymEff;
	const shieldOrGym = shieldGymResults.mostEfficient;

	const prestigeElement = document.getElementById('Supershield');
	let shieldElement = document.getElementById('Shield');
	let gymElement = document.getElementById('Gym');

	if (game.upgrades.Supershield.locked === 0 && prestigeElement) _updateMostEfficientDisplay(prestigeElement, shieldOrGym === 'Shield' && shieldGymResults.Shield.shouldPrestige);
	if (shieldElement) _updateMostEfficientDisplay(shieldElement, shieldOrGym === 'Shield' && !shieldGymResults.Shield.shouldPrestige);
	if (!game.buildings.Gym.locked && gymElement) _updateMostEfficientDisplay(gymElement, shieldOrGym === 'Gym');
}

function _updateMostEfficientDisplay(element, mostEfficient) {
	if (!element.classList.contains('efficient')) element.classList.add('efficient');
	if (element.classList.contains('efficientNo') && mostEfficient) return swapClass('efficient', 'efficientYes', element);
	if (element.classList.contains('efficientYes') && !mostEfficient) return swapClass('efficient', 'efficientNo', element);
	swapClass('efficient', mostEfficient ? 'efficientYes' : 'efficientNo', element);
}

function togglePercentHealth() {
	const setting = getPageSetting('displayPercentHealth');

	const goodGuyHealth = document.getElementById('goodGuyHealth');
	const goodGuyHealthMax = document.getElementById('goodGuyHealthMax');
	const badGuyHealth = document.getElementById('badGuyHealth');
	const badGuyHealthMax = document.getElementById('badGuyHealthMax');

	const healthDisplay = setting ? 'block' : '';
	const healthMaxDisplay = setting ? 'hidden' : '';

	goodGuyHealth.style.display = healthDisplay;
	badGuyHealth.style.display = healthDisplay;
	goodGuyHealthMax.style.display = healthMaxDisplay;
	badGuyHealthMax.style.display = healthMaxDisplay;

	if (setting) {
		if (goodGuyHealthMax.parentNode.childNodes[2].data === '/') {
			goodGuyHealthMax.parentNode.removeChild(goodGuyHealthMax.parentNode.childNodes[2]);
		}

		if (badGuyHealthMax.parentNode.childNodes[2].data === '/') {
			badGuyHealthMax.parentNode.removeChild(badGuyHealthMax.parentNode.childNodes[2]);
		}
	} else {
		if (goodGuyHealthMax.parentNode.childNodes[2].data !== '/') {
			goodGuyHealthMax.parentNode.insertBefore(document.createTextNode('/'), goodGuyHealthMax.parentNode.childNodes[2]);
		}
		if (badGuyHealthMax.parentNode.childNodes[2].data !== '/') {
			badGuyHealthMax.parentNode.insertBefore(document.createTextNode('/'), badGuyHealthMax.parentNode.childNodes[2]);
		}
	}

	updateAllBattleNumbers(true);
}

function loadRuneTrinketCounter() {
	if (document.getElementById('runetrinketCounter') !== null) return;

	const containerRunetrinketCounter = document.createElement('DIV');
	const standard_colours = ' color: rgb(0,0,0); background-color: rgb(255,255,255);';
	const darkmode_colours = ' color: rgb(0,0,0); background-color: rgb(93,93,93);';

	let chosen_colours = standard_colours;
	if (game.options.menu.darkTheme.enabled === 2) {
		chosen_colours = darkmode_colours;
	}

	containerRunetrinketCounter.id = 'runetrinketCounter';
	containerRunetrinketCounter.setAttribute('class', 'noselect');
	containerRunetrinketCounter.setAttribute('style', 'display: block; position: absolute; top: 0; right: 0; width: 30%; font-size: 0.58em; text-align: center;' + chosen_colours);
	containerRunetrinketCounter.setAttribute('onmouseover', RTC_populateRunetrinketCounterTooltip(true));
	containerRunetrinketCounter.setAttribute('onmouseout', 'tooltip("hide")');

	const target_area = document.getElementById('wood');
	target_area.insertBefore(containerRunetrinketCounter, target_area.children[0]);

	RTC_populateRunetrinketCounterInfo();
}

function RTC_getRunetrinketMaxFromGame() {
	let trinkets_max = (game.portal.Observation.radLevel + 1) * game.portal.Observation.trinketsPerLevel;

	if (typeof game.global.u2MutationData === 'object' && Object.keys(game.global.u2MutationData).length > 0 && game.global.u2MutationData.Runed) {
		trinkets_max = trinkets_max * 1.5;
	}

	return trinkets_max;
}

function RTC_getRunetrinketEffect() {
	const trinkets = Math.min(game.portal.Observation.trinkets, RTC_getRunetrinketMaxFromGame());
	const effectiveness_per = game.portal.Observation.radLevel + 1;
	const effectiveness = trinkets * effectiveness_per;

	return prettify(effectiveness);
}

function RTC_getRunetrinketGuaranteedRate() {
	const perklevels = game.portal.Observation.radLevel;
	const halved = Math.floor(perklevels / 2);

	return prettify(halved);
}

function RTC_makeStringForDisplay() {
	if (game.global.universe !== 2) {
		return '';
	}

	const runeTrinkets = game.portal.Observation.trinkets;
	const runeTrinketsMax = RTC_getRunetrinketMaxFromGame();
	if (runeTrinkets >= runeTrinketsMax) {
		return '';
	}

	const runeTrinketString = `${runeTrinkets}<span style="display: block; border-bottom: 1px solid black; margin: 5px;"></span>${runeTrinketsMax}`;
	return runeTrinketString;
}

function RTC_populateRunetrinketCounterTooltip() {
	if (usingRealTimeOffline) {
		return '';
	}

	let tooltipstring = '';
	tooltipstring = "tooltip('Runetrinket Summary', 'customText', event, '";
	tooltipstring += `<p>Runetrinkets give 1% per runetrinket per perk level, for a current boost of `;
	tooltipstring += `${prettify(game.portal.Observation.trinkets)} &times; ${game.portal.Observation.radLevel + 1}`;
	tooltipstring += ` = ` + `<b>+${RTC_getRunetrinketEffect()}%</b>.</p>`;

	tooltipstring += `<p>${game.portal.Observation.getChanceText()}`;
	tooltipstring += ` Also, you are getting a guaranteed <b>${RTC_getRunetrinketGuaranteedRate()}</b> every 25 zones past z100.</p>`;
	tooltipstring += "')";
	return tooltipstring;
}

function RTC_populateRunetrinketCounterInfo() {
	if (usingRealTimeOffline || game.portal.Observation.radLocked) {
		return;
	}

	const target_element = document.getElementById('runetrinketCounter');
	const the_information = RTC_makeStringForDisplay();

	if (target_element.innerHTML !== the_information) target_element.innerHTML = the_information;
	if (the_information !== '') target_element.parentNode.setAttribute('onmouseover', RTC_populateRunetrinketCounterTooltip());
}

function VMC_makeStringForDisplay() {
	if (game.global.totalPortals < 1) {
		// we have never yet portalled
		return '???';
	}
	if (game.global.universe == 2 && game.global.totalRadPortals < 1) {
		// we have reached u2, but haven't portalled there
		return 'N/A';
	}

	if (game.stats.totalVoidMaps.valueTotal + game.stats.totalVoidMaps.value < 1) {
		// have not cleared any void maps
		if (game.global.lastVoidMap >= 100 * game.global.world) {
			// AND we haven't seen a map drop yet this run
			return `${game.global.lastVoidMap}<span style="display: block; border-bottom: 1px solid black; margin: 5px;"></span>${'???'}`; // then we should have no idea how long they take to drop
		}
	}

	const voidmapstring = `${game.global.lastVoidMap}<span style="display: block; border-bottom: 1px solid black; margin: 5px;"></span>${VMC_getCurrentExpectedVMWait()}`;
	return voidmapstring;
}

function updateAllInnerHtmlFrames() {
	if (mutations.Magma.active()) updateGeneratorInfo();
	updateTurkimpTime(true);

	if (challengeActive('Balance') || challengeActive('Unbalance')) updateBalanceStacks();
	if (challengeActive('Electricity') || challengeActive('Mapocalypse')) updateElectricityStacks();
	if (challengeActive('Life')) updateLivingStacks();
	if (challengeActive('Nom')) updateNomStacks();
	if (challengeActive('Toxicity')) updateToxicityStacks();
	if (challengeActive('Lead')) manageLeadStacks();

	if (game.global.antiStacks > 0) updateAntiStacks();
	updateTitimp();
	if (getHeirloomBonus('Shield', 'gammaBurst') > 0) updateGammaStacks();
	setEmpowerTab();
	handlePoisonDebuff();
	handleIceDebuff();
	handleWindDebuff();

	if (!usingRealTimeOffline) {
		updateSideTrimps();
		gather();
		breed();
		updateAllBattleNumbers();
		setVoidCorruptionIcon();

		if (!game.global.preMapsActive && game.global.mapBonus > 0) {
			let innerText = game.global.mapBonus;
			if (game.talents.mapBattery.purchased && game.global.mapBonus === 10) innerText = "<span class='mapBonus10'>" + innerText + '</span>';
			const mapBtnElem = document.getElementById('mapsBtnText');
			const mapBtnText = `Maps (${innerText})`;
			if (mapBtnElem.innerHTML !== mapBtnText) mapBtnElem.innerHTML = mapBtnText;
		}
	}

	let cell, cellNum;
	if (game.global.mapsActive) {
		cellNum = game.global.lastClearedMapCell + 1;
		cell = game.global.mapGridArray[cellNum];
	} else {
		cellNum = game.global.lastClearedCell + 1;
		cell = game.global.gridArray[cellNum];
	}

	if (!cell) return;

	const badAttackElem = document.getElementById('badGuyAttack');
	const badAttackText = calculateDamage(cell.attack, true, false, false, cell);
	if (badAttackElem.innerHTML != badAttackText) badAttackElem.innerHTML = badAttackText;

	const goodAttackElem = document.getElementById('goodGuyAttack');
	const goodAttackText = calculateDamage(game.global.soldierCurrentAttack, true, true);
	if (goodAttackElem.innerHTML != goodAttackText) goodAttackElem.innerHTML = goodAttackText;
}
