function autoRoboTrimp() {
	if (game.global.roboTrimpLevel === 0 || game.global.roboTrimpCooldown !== 0) return;
	const autoRoboTrimpSetting = getPageSetting('AutoRoboTrimp');
	if (autoRoboTrimpSetting <= 0) return;

	const shouldShriek = game.global.world >= autoRoboTrimpSetting && (game.global.world - parseInt(autoRoboTrimpSetting)) % 5 === 0;
	if (shouldShriek && !game.global.useShriek) debug(`Activated Robotrimp MagnetoShriek Ability at zone ${game.global.world}`, 'other', '*podcast');
	if (game.global.useShriek !== shouldShriek) magnetoShriek();
}

function isCorruptionActive(targetZone) {
	if (game.global.universe === 2) return 9999;
	if (challengeActive('Eradicated')) return 1;
	if (challengeActive('Corrupted')) return 60;
	return targetZone >= (game.talents.headstart.purchased && !game.global.runningChallengeSquared ? (game.talents.headstart2.purchased ? (game.talents.headstart3.purchased ? 151 : 166) : 176) : 181);
}

function isDoingSpire() {
	if (!game.global.spireActive) return false;

	const settingPrefix = trimpStats.isC3 ? 'c2' : trimpStats.isDaily ? 'd' : '';
	const spireNo = getPageSetting(settingPrefix + 'IgnoreSpiresUntil');
	if (spireNo <= 0) return true;
	const spireZone = (1 + spireNo) * 100;

	return game.global.world >= spireZone;
}

function exitSpireCell(checkCell) {
	if (!game.global.spireActive) return;

	const settingPrefix = trimpStats.isC3 ? 'c2' : trimpStats.isDaily ? 'd' : '';
	const exitCell = getPageSetting(settingPrefix + 'ExitSpireCell');
	const isSpireActive = isDoingSpire();
	const cell = isSpireActive && exitCell > 0 && exitCell <= 100 ? exitCell : 100;

	if (checkCell) return cell;
	if (cell <= 0) return;

	if (isSpireActive && game.global.lastClearedCell + 1 > cell) {
		endSpire();
		debug(`Exiting Spire ${game.global.spiresCompleted + 1} at cell ${exitCell}`);
	}
}

function getZoneEmpowerment(zone) {
	if (!zone) return 'None';

	const natureStartingZone = game.global.universe === 1 ? getNatureStartZone() : 236;
	if (zone < natureStartingZone) return 'None';

	const activeEmpowerments = ['Poison', 'Wind', 'Ice'];
	zone = Math.floor((zone - natureStartingZone) / 5);
	zone = zone % activeEmpowerments.length;

	return activeEmpowerments[zone];
}

function fluffyEvolution() {
	if (game.global.universe !== 1 || Fluffy.currentLevel !== 10 || game.global.fluffyPrestige === 10 || !getPageSetting('fluffyEvolve')) return;
	if (game.global.world < getPageSetting('fluffyMinZone')) return;
	if (game.global.world > getPageSetting('fluffyMaxZone')) return;
	//Only evolve if you can afford all the bone portals that you want to purchase at the start of your next evolution
	let bpsToUse = getPageSetting('fluffyBP');
	if (bpsToUse > 0 && game.global.b % 100 < bpsToUse) return;

	let shouldRespecPerks = false;
	if (getPageSetting('fluffyRespec') && getPageSetting('autoPerks') && !game.portal.Cunning.locked) {
		const perkLevels = getPerkLevel('Cunning') + getPerkLevel('Curious') + getPerkLevel('Classy');
		if (perkLevels <= 0) {
			if (!game.global.canRespecPerks) return;
			shouldRespecPerks = true;
		}
	}

	const liquified = liquifiedZone();
	if (!liquified && getCurrentWorldCell().level + Math.max(0, maxOneShotPower(true) - 1) < 100) return;

	Fluffy.prestige();

	for (let i = 0; i < bpsToUse; i++) {
		purchaseMisc('helium');
	}

	hideBones();

	if (shouldRespecPerks) {
		viewPortalUpgrades();
		fireAllWorkers();
		runPerky();
		activateClicked();
	}
}

function archaeologyAutomator() {
	if (!challengeActive('Archaeology') || !getPageSetting('archaeology')) return;

	const string1 = getPageSetting('archaeologyString1');
	const string2 = getPageSetting('archaeologyString2');
	const string3 = getPageSetting('archaeologyString3');
	let string;

	if (mapSettings.relicString && getPageSetting('autoMaps')) {
		string = mapSettings.relicString;
	} else if (string3[0] !== 'undefined' && string3[0] <= game.global.world) {
		string = string3.slice(1).toString();
	} else if (string2[0] !== 'undefined' && string2[0] <= game.global.world) {
		string = string2.slice(1).toString();
	} else if (string1[0] !== 'undefined') {
		string = string1.toString();
	}

	if (string && string !== game.global.archString) game.global.archString = string;
}

function challengesUnlockedObj(universe = currSettingUniverse, excludeSpecial, excludeFused) {
	let obj = {};
	const hze = universe === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();

	if (universe === 1) {
		obj = {
			Discipline: {
				unlockZone: 20,
				unlockCondition: function () {
					return getTotalPerkResource(true) >= 30;
				},
				unlockedIn: ['c2', 'oneOff']
			},
			Metal: { unlockZone: 25, unlockedIn: ['c2', 'oneOff'] },
			Size: { unlockZone: 35, unlockedIn: ['c2', 'oneOff'] },
			Scientist: { unlockZone: 40, unlockedIn: ['oneOff'] },
			Balance: { unlockZone: 40, unlockedIn: ['c2', 'heHr', 'autoPortal'] },
			Decay: { unlockZone: 55, unlockedIn: ['autoPortal', 'heHr', 'oneOff'] },
			Meditate: { unlockZone: 45, unlockedIn: ['c2', 'oneOff'] },
			Trimp: { unlockZone: 60, unlockedIn: ['c2', 'oneOff'] },
			Trapper: { unlockZone: 70, unlockedIn: ['c2', 'oneOff'] },
			Electricity: {
				unlockZone: 80,
				unlockCondition: function () {
					return game.global.prisonClear >= 1;
				},
				unlockedIn: ['c2', 'heHr', 'autoPortal']
			},
			Life: { unlockZone: 110, unlockedIn: ['autoPortal', 'heHr'] },
			Crushed: { unlockZone: 125, unlockedIn: ['autoPortal', 'heHr'] },
			Frugal: { unlockZone: 100, unlockedIn: ['oneOff'] },
			Coordinate: { unlockZone: 120, unlockedIn: ['c2', 'oneOff'] },
			Slow: { unlockZone: 130, unlockedIn: ['c2', 'oneOff'] },
			Mapocalypse: { unlockZone: 115, unlockedIn: ['oneOff'] },
			Nom: { unlockZone: 145, unlockedIn: ['c2', 'heHr', 'autoPortal'] },
			Mapology: { unlockZone: 150, unlockedIn: ['c2', 'oneOff'] },
			Toxicity: { unlockZone: 165, unlockedIn: ['c2', 'heHr', 'autoPortal'] },
			Watch: { unlockZone: 180, unlockedIn: ['c2', 'heHr', 'autoPortal'] },
			Lead: { unlockZone: 180, unlockedIn: ['c2', 'heHr', 'autoPortal'] },
			Corrupted: { unlockZone: 190, unlockedIn: ['heHr', 'autoPortal'] },
			Domination: { unlockZone: 215, unlockedIn: ['heHr', 'autoPortal'] },
			Obliterated: { unlockZone: 425, unlockedIn: ['c2', 'oneOff'] },
			Eradicated: {
				unlockZone: 450,
				unlockCondition: function () {
					return game.global.totalSquaredReward >= 4500;
				},
				unlockedIn: ['c2']
			},
			Frigid: { unlockZone: 460, unlockedIn: ['c2', 'autoPortal'] },
			Experience: { unlockZone: 600, unlockedIn: ['c2', 'heHr', 'autoPortal'] },
			//Fused Challenges - These need to go in reverse order of when they unlock.
			Toxad: {
				unlockZone: game.stats.highestLevel.valueTotal(),
				unlockCondition: function () {
					return game.stats.highestLevel.valueTotal() >= 180;
				},
				unlockedIn: ['c2']
			},
			Waze: {
				unlockZone: game.stats.highestLevel.valueTotal(),
				unlockCondition: function () {
					return game.stats.highestLevel.valueTotal() >= 180;
				},
				unlockedIn: ['c2']
			},
			Topology: {
				unlockZone: game.stats.highestLevel.valueTotal(),
				unlockCondition: function () {
					return game.stats.highestLevel.valueTotal() >= 150;
				},
				unlockedIn: ['c2']
			},
			Nometal: {
				unlockZone: game.stats.highestLevel.valueTotal(),
				unlockCondition: function () {
					return game.stats.highestLevel.valueTotal() >= 145;
				},
				unlockedIn: ['c2']
			},
			Paralysis: {
				unlockZone: game.stats.highestLevel.valueTotal(),
				unlockCondition: function () {
					return game.stats.highestLevel.valueTotal() >= 130;
				},
				unlockedIn: ['c2']
			},
			Enlightened: {
				unlockZone: game.stats.highestLevel.valueTotal(),
				unlockCondition: function () {
					return game.stats.highestLevel.valueTotal() >= 45;
				},
				unlockedIn: ['c2']
			}
		};
	}

	if (universe === 2) {
		obj = {
			Unlucky: { unlockZone: 15, unlockedIn: ['c2', 'oneOff'] },
			Downsize: { unlockZone: 20, unlockedIn: ['c2', 'oneOff'] },
			Transmute: { unlockZone: 25, unlockedIn: ['c2', 'oneOff'] },
			Unbalance: { unlockZone: 35, unlockedIn: ['c2', 'oneOff'] },
			Bublé: { unlockZone: 40, unlockedIn: ['heHr', 'autoPortal'] },
			Duel: { unlockZone: 45, unlockedIn: ['c2', 'oneOff'] },
			Melt: { unlockZone: 50, unlockedIn: ['heHr', 'autoPortal'] },
			Trappapalooza: { unlockZone: 60, unlockedIn: ['c2', 'oneOff'] },
			Quagmire: { unlockZone: 70, unlockedIn: ['heHr', 'autoPortal'] },
			Wither: { unlockZone: 70, unlockedIn: ['c2', 'oneOff'] },
			Revenge: { unlockZone: 80, unlockedIn: ['oneOff'] },
			Quest: { unlockZone: 85, unlockedIn: ['c2', 'oneOff', 'autoPortal'] },
			Archaeology: { unlockZone: 90, unlockedIn: ['heHr', 'autoPortal'] },
			Mayhem: { unlockZone: 100, unlockedIn: ['c2', 'autoPortal'] },
			Storm: { unlockZone: 105, unlockedIn: ['c2', 'oneOff'] },
			Insanity: { unlockZone: 110, unlockedIn: ['heHr', 'autoPortal'] },
			Berserk: { unlockZone: 115, unlockedIn: ['c2', 'oneOff'] },
			Exterminate: { unlockZone: 120, unlockedIn: ['oneOff'] },
			Nurture: { unlockZone: 130, unlockedIn: ['heHr', 'autoPortal'] },
			Pandemonium: { unlockZone: 150, unlockedIn: ['c2', 'autoPortal'] },
			Alchemy: { unlockZone: 155, unlockedIn: ['heHr', 'autoPortal'] },
			Hypothermia: { unlockZone: 175, unlockedIn: ['heHr', 'autoPortal'] },
			Glass: { unlockZone: 175, unlockedIn: ['c2', 'oneOff'] },
			Desolation: { unlockZone: 200, unlockedIn: ['c2', 'autoPortal'] },
			Smithless: { unlockZone: 201, unlockedIn: ['c2', 'oneOff'] }
		};
	}

	//Filter out the challenges that aren't unlocked yet.
	const dualC2s = ['Enlightened', 'Paralysis', 'Nometal', 'Topology', 'Waze', 'Toxad'];
	const specialChallenges = ['Frigid', 'Experience', 'Mayhem', 'Pandemonium', 'Desolation'];

	obj = Object.entries(obj).reduce((newObj, [key, val]) => {
		if (hze >= val.unlockZone && (typeof val.unlockCondition !== 'function' || val.unlockCondition())) {
			if (!excludeSpecial && specialChallenges.includes(key)) {
				newObj[key] = val;
			} else if (!excludeFused && dualC2s.includes(key)) {
				newObj[key] = val;
			} else if (!specialChallenges.includes(key) && !dualC2s.includes(key)) {
				newObj[key] = val;
			}
		}
		return newObj;
	}, {});

	return obj;
}

function filterAndSortChallenges(obj, runType) {
	return Object.entries(obj)
		.filter(([key, val]) => val.unlockedIn.includes(runType))
		.sort((a, b) => b[1].unlockZone - a[1].unlockZone)
		.map(([key]) => key)
		.reverse();
}

function autoPortalChallenges(runType = 'autoPortal', universe = currSettingUniverse) {
	let challenge = ['None'];
	if (universe === 0) universe = autoTrimpSettings.universeSetting.value + 1;
	if (universe === 1 && runType === 'autoPortal') challenge = ['Off', 'Helium Per Hour'];
	if (universe === 2 && runType === 'autoPortal') challenge = ['Off', 'Radon Per Hour'];

	let obj = challengesUnlockedObj(universe);
	obj = filterAndSortChallenges(obj, runType);
	//obj = obj.reverse();
	challenge = [...challenge, ...obj];

	if (runType === 'autoPortal') {
		challenge.push('Custom');
		challenge.push('One Off Challenges');
	}

	if (runType === 'autoPortal' || runType === 'heHr') {
		const hze = universe === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();
		if (universe === 2 && hze >= 50) challenge.push('Challenge 3');
		if (universe === 1 && hze >= 65) challenge.push('Challenge 2');
	}

	return challenge;
}

function _autoHeirloomMods(heirloomType) {
	const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
	const heirloomRarity = rarities.indexOf(getPageSetting('heirloomAutoRareToKeep', currSettingUniverse));
	const heirloomModsArray = ['Any'];

	if (typeof heirloomInfo !== 'function') {
		return heirloomModsArray;
	}

	const heirloomData = heirloomInfo(heirloomType);
	const heirlooms = game.heirlooms[heirloomType];

	for (let item in heirlooms) {
		if (_shouldSkipHeirloom(item, heirlooms, heirloomRarity)) continue;
		if (typeof heirloomData[item] === 'undefined') continue;

		heirloomModsArray.push(heirloomData[item].name);
	}

	return heirloomModsArray;
}

function _shouldSkipHeirloom(item, heirlooms, heirloomRarity) {
	const heirloom = heirlooms[item];

	return item === 'empty' || (heirloom.filter && !heirloom.filter()) || (heirloom.steps && heirloom.steps[heirloomRarity] === -1);
}

function checkLiqZoneCount(universe) {
	if (game.options.menu.liquification.enabled === 0) return 0;

	if (universe === 2) {
		if (!u2Mutations.tree.Liq1.purchased) return 0;
		let amt = 0.1;
		if (u2Mutations.tree.Liq2.purchased) amt = 0.2;
		return (getHighestLevelCleared(false, true) + 1) * amt;
	}

	let spireCount = game.global.spiresCompleted;
	if (game.talents.liquification.purchased) spireCount++;
	if (game.talents.liquification2.purchased) spireCount++;
	if (game.talents.liquification3.purchased) spireCount += 2;
	spireCount += Fluffy.isRewardActive('liquid') * 0.5;
	const liquidAmount = spireCount / 20;

	return game.stats.highestLevel.valueTotal() * liquidAmount;
}

function updateChangelogButton() {
	if (autoTrimpSettings.ATversionChangelog === atSettings.initialise.version) return;
	let changeLogBtn = document.getElementById('atChangelog');
	if (!changeLogBtn) return;

	const classSwap = changeLogBtn.classList.contains('btn-changelogNew') ? 'btn-primary' : 'btn-changelogNew';
	swapClass(changeLogBtn.classList[1], classSwap, changeLogBtn);

	changeLogBtn.innerHTML = changeLogBtn.innerHTML.replace(" | What's New", '');
	autoTrimpSettings.ATversionChangelog = atSettings.initialise.version;
	saveSettings();
}

function remakeTooltip() {
	if (!MODULES.popups.challenge && !MODULES.popups.respecAncientTreasure && !MODULES.popups.portal) {
		if (!MODULES.popups.challenge) delete hzeMessage;
		return;
	}

	if (game.global.lockTooltip) {
		if (MODULES.popups.respecAncientTreasure || MODULES.popups.portal) {
			const action = MODULES.popups.respecAncientTreasure ? 'Auto-Respeccing' : 'Auto-Portaling';
			document.getElementById('tipTitle').innerHTML = `<b>NOTICE: ${action} in ${(MODULES.popups.remainingTime / 1000).toFixed(1)} seconds....</b>`;
		}
		return;
	}

	if (MODULES.popups.respecAncientTreasure) {
		let respecName = !trimpStats.isC3 ? 'Radon ' : '' + 'Combat Respec';
		if (game.global.universe === 1) respecName = 'Spire';
		const description = `<p><b>Respeccing into the ${respecName} preset.</b></p>`;
		tooltip('confirm', null, 'update', description + '<p>Hit <b>Disable Respec</b> to stop this.</p>', 'MODULES.popups.respecAncientTreasure = false', `<b>NOTICE: Auto-Respeccing in ${MODULES.popups.remainingTime} seconds....</b>`, 'Disable Respec');
	} else if (MODULES.popups.challenge) {
		tooltip('confirm', null, 'update', hzeMessage, 'MODULES.popups.challenge = false, delete hzeMessage', 'AutoTrimps New Unlock!');
	} else {
		tooltip('confirm', null, 'update', '<b>Auto Portaling Now!</b><p>Hit Delay Portal to delay this by 1 more zone.', 'MODULES.portal.zonePostpone+=1; MODULES.popups.portal = false', `<b>NOTICE: Auto-Portaling in ${MODULES.popups.remainingTime} seconds....</b>`, 'Delay Portal');
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

function _timeWarpSave() {
	const timeRun = new Date().getTime() - offlineProgress.startTime;
	const reduceBy = offlineProgress.totalOfflineTime + timeRun - offlineProgress.ticksProcessed * 100;
	const keys = ['lastOnline', 'portalTime', 'zoneStarted', 'lastSoldierSentAt', 'lastSkeletimp'];

	_adjustGlobalTimers(keys, -reduceBy);
	save(false, true);
	_adjustGlobalTimers(keys, reduceBy);

	debug(`Game Saved! ${formatTimeForDescriptions(reduceBy / 1000)} of offline progress left to process.`, `offline`);
}

function _timeWarpAutoSaveSetting() {
	atSettings.autoSave = game.options.menu.autoSave.enabled;
	atSettings.loops.atTimeLapseFastLoop = true;
	if (game.options.menu.autoSave.enabled) toggleSetting('autoSave');
}

function _timeWarpUpdateUIDisplay() {
	if (!usingRealTimeOffline || !getPageSetting('timeWarpDisplay')) return;

	usingRealTimeOffline = false;
	const enemy = getCurrentEnemy();
	updateGoodBar();
	updateBadBar(enemy);

	const goodGuyHealthElem = document.getElementById('goodGuyHealth');
	const goodGuyHealth = prettify(game.global.soldierHealth);
	if (goodGuyHealthElem.innerHTML != goodGuyHealth) goodGuyHealthElem.innerHTML = goodGuyHealth;

	const badGuyHealthElem = document.getElementById('badGuyHealth');
	const badGuyHealth = prettify(enemy.health);
	if (badGuyHealthElem.innerHTML != badGuyHealth) badGuyHealthElem.innerHTML = badGuyHealth;

	let blockDisplay = prettify(game.global.soldierCurrentBlock);
	if (game.global.universe === 2) {
		let esMax = game.global.soldierEnergyShieldMax;
		let esMult = getEnergyShieldMult();
		const layers = Fluffy.isRewardActive('shieldlayer');

		if (layers > 0) {
			let layerFactor = layers + 1;
			esMax *= layerFactor;
			esMult *= layerFactor;
		}

		blockDisplay = `${prettify(esMax)} (${Math.round(esMult * 100)}%)`;
	}

	const goodGuyBlock = document.getElementById('goodGuyBlock');
	if (goodGuyBlock.innerHTML !== blockDisplay) goodGuyBlock.innerHTML = blockDisplay;

	const goodGuyAttackElem = document.getElementById('goodGuyAttack');
	const goodGuyAttack = calculateDamage(game.global.soldierCurrentAttack, true, true);
	if (goodGuyAttackElem.innerHTML !== goodGuyAttack) goodGuyAttackElem.innerHTML = goodGuyAttack;

	const badAttackElem = document.getElementById('badGuyAttack');
	const badAttack = calculateDamage(enemy.attack, true, false, false, enemy);
	if (badAttackElem.innerHTML !== badAttack) badAttackElem.innerHTML = badAttack;

	updateLabels(true);
	displayMostEfficientBuilding(true);
	displayMostEfficientEquipment(true);
	usingRealTimeOffline = true;
}

function _timeWarpUpdateEquipment() {
	for (let equipName in game.equipment) {
		const upgradeName = MODULES.equipment[equipName].upgrade;
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
	if (loops % 1000 === 0) autoMapsStatus();
	if (game.global.universe === 1) checkStanceSetting();
	if (game.global.universe === 2) equalityManagement();
	guiLoop();
}

function _handleMazWindow() {
	const mazSettings = ['Map Farm', 'Map Bonus', 'Void Map', 'HD Farm', 'Raiding', 'Bionic Raiding', 'Balance Destack', 'Toxicity', 'Quagmire', 'Archaeology', 'Insanity', 'Alchemy', 'Hypothermia', 'Bone Shrine', 'Auto Golden', 'Tribute Farm', 'Smithy Farm', 'Worshipper Farm', 'Desolation Gear Scumming', 'C2 Runner', 'C3 Runner'];
	const tooltipDiv = document.getElementById('tooltipDiv');

	if (mazSettings.indexOf(tooltipDiv.children.tipTitle.innerText) === -1) {
		tooltipDiv.style.overflowY = '';
		tooltipDiv.style.maxHeight = '';
		tooltipDiv.style.width = '';
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
	if (MODULES.popups.remainingTime !== MODULES.portal.timeout) return;

	MODULES.popups.remainingTime -= 0.0001;
	MODULES.popups.intervalID = setInterval(function () {
		if (MODULES.popups.remainingTime === Infinity) clearInterval(MODULES.popups.intervalID);
		MODULES.popups.remainingTime = Math.max(MODULES.popups.remainingTime - 100, 0);
	}, 100);
}

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
			msg += `<br><br><b>This is a special challenge and will use ${_getChallenge2Info()} settings when run.</b>`;
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
			message += `<br><br>Due to unlocking Challenge 3's there is now a Challenge 3 option under Auto Portal to be able to auto portal into them. Also, you can now access the ${_getChallenge2Info()} tab within the scripts settings.`;
		}

		if (challenge.worshippers) {
			message += `<br><br>You can now use the Worshipper Farm setting. This can be found in the the scripts 'Maps' tab.`;
		}

		if (challenge.lab) {
			message += ` There is also a setting for Laboratories that has been added to the AutoStructure setting.`;
		}

		if (challenge.glass) {
			message += `<br><br>${challengeUnlock('Glass', true, true)}`;
		}

		break;
	}

	if (message) {
		message += '<br><br><b>To disable this popup, click confirm!<b>';
		hzeMessage = message;
		MODULES.popups.challenge = true;
		tooltip('confirm', null, 'update', hzeMessage, 'MODULES.popups.challenge = false, delete hzeMessage', 'AutoTrimps New Unlock!');
	}
}

function introMessage() {
	const description = `
		<p>Welcome to the SadAugust fork of AutoTrimps!</p>
		<p><b>For those who are new to this fork here's some useful information on how to set it up.</b></p><br>
		<p>One of the most important things is where the settings are stored. The vast majority of settings can be accessed by pressing the <b>AutoTrimps</b> button at the bottom of your Trimps window.</p><br>
		<p>There are some setting that aren't located in the <b>AutoTrimps settings menu</b>, 2 of which are in the Trimps buy container (<b>AT AutoStructure & AutoJobs</b>), I recommend mousing over their tooltips and looking at what they do.</p>
		<p>The last one placed elsewhere is the <b>AT Messages</b> button at the top right of your Trimps window. This will enabling this will allow the script to output messages into the message log window. You can control what gets printed to it by pressing the cogwheel to the right of it.</p>
		<br><p>By default everything should be disabled but every setting has a detailed description and recommendation of how it should be setup. To start with I'd highly recommend looking through the settings in the <b>Core</b>, <b>Maps</b> and <b>Combat</b> tabs to identify which parts of the script you would like to use and go through the other tabs afterwards.</p>
		<br><p>If you've previously used somebody elses AutoTrimps version you'll need to set everything up again as this isn't compatible with other forks. The settings are stored differently so you can easily go back and forth between other forks.</p>
	`;

	tooltip('Introduction Message', 'customText', 'lock', description, false, 'center');
	if (typeof _verticalCenterTooltip === 'function') _verticalCenterTooltip(true);
	else verticalCenterTooltip(true);
}

function updateATVersion() {
	//Setting Conversion!
	if (autoTrimpSettings['ATversion'] !== undefined && autoTrimpSettings['ATversion'].includes('SadAugust') && autoTrimpSettings['ATversion'] === atSettings.initialise.version) return;
	if (typeof autoTrimpSettings === 'undefined') return;
	var changelog = [];

	//Prints the new user message if it's the first time loading the script.
	if (autoTrimpSettings['ATversion'] === undefined || !autoTrimpSettings['ATversion'].includes('SadAugust')) {
		autoTrimpSettings['ATversion'] = atSettings.initialise.version;
		saveSettings();
		if (atSettings.initialise.basepath === 'https://localhost:8887/AutoTrimps_Local/') return;
		introMessage();
		return;
	}

	if (autoTrimpSettings['ATversion'] !== undefined && autoTrimpSettings['ATversion'].includes('SadAugust') && autoTrimpSettings['ATversion'] !== atSettings.initialise.version) {
		//On the offchance anybody is using a super old version of AT then they need their localStorage setting converted
		if (JSON.parse(localStorage.getItem('atSettings')) === null) saveSettings();
		const tempSettings = JSON.parse(localStorage.getItem('atSettings'));
		const versionNumber = autoTrimpSettings['ATversion'].split('v')[1];

		if (versionNumber < '6.2.5') {
			if (tempSettings.presetMutations !== undefined) {
				var mutatorObj = {
					preset1: {},
					preset2: {},
					preset3: {}
				};
				if (tempSettings.presetMutations.value.preset1 !== '') mutatorObj.preset1 = JSON.parse(tempSettings.presetMutations.value.preset1);
				if (tempSettings.presetMutations.value.preset2 !== '') mutatorObj.preset2 = JSON.parse(tempSettings.presetMutations.value.preset2);
				if (tempSettings.presetMutations.value.preset3 !== '') mutatorObj.preset3 = JSON.parse(tempSettings.presetMutations.value.preset3);

				autoTrimpSettings['mutatorPresets'].valueU2 = JSON.stringify(mutatorObj);
				localStorage['mutatorPresets'] = JSON.stringify(mutatorObj);
			}
		}

		if (versionNumber < '6.2.95') {
			var settings_List = ['mapFarmSettings'];
			var values = ['value', 'valueU2'];
			for (var x = 0; x < settings_List.length; x++) {
				for (var z = 0; z < values.length; z++) {
					if (typeof autoTrimpSettings[settings_List[x]][values[z]][0] !== 'undefined') {
						for (var y = 0; y < autoTrimpSettings[settings_List[x]][values[z]].length; y++) {
							autoTrimpSettings[settings_List[x]][values[z]][y].hdRatio = 0;
						}
					}
					saveSettings();
				}
			}
		}

		if (versionNumber < '6.3.001') {
			var settings_List = ['mapBonusSettings'];
			var values = ['value', 'valueU2'];
			for (var x = 0; x < settings_List.length; x++) {
				for (var z = 0; z < values.length; z++) {
					if (typeof autoTrimpSettings[settings_List[x]][values[z]][0] !== 'undefined') {
						for (var y = 0; y < autoTrimpSettings[settings_List[x]][values[z]].length; y++) {
							autoTrimpSettings[settings_List[x]][values[z]][y].hdRatio = 0;
						}
					}
					saveSettings();
				}
			}
		}

		if (versionNumber < '6.3.14') {
			var settings_List = ['voidMapSettings'];
			var values = ['value', 'valueU2'];
			for (var x = 0; x < settings_List.length; x++) {
				for (var z = 0; z < values.length; z++) {
					if (typeof autoTrimpSettings[settings_List[x]][values[z]][0] !== 'undefined') {
						for (var y = 0; y < autoTrimpSettings[settings_List[x]][values[z]].length; y++) {
							autoTrimpSettings[settings_List[x]][values[z]][y].hdType = 'world';
							autoTrimpSettings[settings_List[x]][values[z]][y].hdType2 = 'void';
						}
					}
					saveSettings();
				}
			}
		}

		if (versionNumber < '6.3.17') {
			if (typeof tempSettings['presetSwap'] !== 'undefined') {
				autoTrimpSettings.presetSwap.enabled = false;
			}
			if (typeof tempSettings['autoCombatRespec'] !== 'undefined') {
				autoTrimpSettings.presetCombatRespec.value = 0;
				autoTrimpSettings.presetCombatRespec.valueU2 = autoTrimpSettings['autoCombatRespec'].valueU2;
			}
		}

		if (versionNumber < '6.3.18') {
			if (typeof tempSettings['bloodthirstDestack'] !== 'undefined') {
				autoTrimpSettings.bloodthirstDestack.enabled = false;
			}
			if (typeof tempSettings['bloodthirstVoidMax'] !== 'undefined') {
				autoTrimpSettings.bloodthirstVoidMax.enabled = false;
			}
			changelog.push(
				"AutoTrimps now has an actual changelog! You can find it right next to the AutoTrimps button.<br>\
				You will now only be shown this popup if there's an update and you're in Time Warp as you would be unable to see the changelog otherwise."
			);
		}

		if (versionNumber < '6.3.21') {
			if (typeof tempSettings['IgnoreCrits'] !== 'undefined') {
				autoTrimpSettings.IgnoreCrits.valueU2 = 0;
			}
		}

		//Scryer stance changes
		if (versionNumber < '6.3.24') {
			if (typeof tempSettings['UseScryerStance'] !== 'undefined') {
				autoTrimpSettings.AutoStanceScryer.enabled = tempSettings.UseScryerStance.enabled;
			}
			if (typeof tempSettings['screwessence'] !== 'undefined') {
				autoTrimpSettings.scryerEssenceOnly.enabled = tempSettings.screwessence.enabled;
			}
			if (typeof tempSettings['ScryerUseWhenOverkill'] !== 'undefined') {
				autoTrimpSettings.scryerOverkill.enabled = tempSettings.ScryerUseWhenOverkill.enabled;
			}
			if (typeof tempSettings['use3daily'] !== 'undefined') {
				autoTrimpSettings.dAutoStanceWind.enabled = tempSettings.use3daily.enabled;
			}
			if (typeof tempSettings['liqstack'] !== 'undefined') {
				autoTrimpSettings.dWindStackingLiq.enabled = tempSettings.liqstack.enabled;
			}
			if (typeof tempSettings['AutoStance'] !== 'undefined') {
				if (tempSettings.AutoStance.value > 2) {
					autoTrimpSettings.AutoStance.value = 2;
					autoTrimpSettings.AutoStanceWind.enabled = true;
				}
			}

			const originalSettings = ['ScryerUseinMaps2', 'ScryerUseinVoidMaps2', 'ScryerUseinPMaps', 'ScryerUseinBW', 'ScryerUseinSpire2', 'ScryerSkipBoss2', 'ScryUseinPoison', 'ScryUseinWind', 'ScryUseinIce', 'ScryerSkipCorrupteds2', 'ScryerSkipHealthy', 'ScryerDieZ', 'ScryerMaxZone', 'ScryerMinZone', 'onlyminmaxworld', 'dWindStackingMinHD', 'WindStackingMinHD', 'WindStackingMin', 'dWindStackingMin'];
			const newSettings = ['scryerMaps', 'scryerVoidMaps', 'scryerPlusMaps', 'scryerBW', 'scryerSpire', 'scryerSkipBoss', 'scryerPoison', 'scryerWind', 'scryerIce', 'scryerCorrupted', 'scryerHealthy', 'scryerDieZone', 'scryerMaxZone', 'scryerMinZone', 'scryerMinMaxWorld', 'dWindStackingRatio', 'WindStackingRatio', 'WindStackingZone', 'dWindStackingZone'];
			for (var item in originalSettings) {
				if (typeof tempSettings[originalSettings[item]] !== 'undefined') {
					autoTrimpSettings[newSettings[item]].value = tempSettings[originalSettings[item]].value;
				}
			}
		}

		if (versionNumber < '6.3.25') {
			if (typeof tempSettings['radonsettings'] !== 'undefined') {
				autoTrimpSettings.universeSetting.value = tempSettings.radonsettings.value;
			}
		}

		if (versionNumber < '6.3.26') {
			if (typeof tempSettings['PrestigeSkip1_2'] !== 'undefined') {
				autoTrimpSettings.PrestigeSkip.enabled = tempSettings.PrestigeSkip1_2.value > 0;
			}
		}

		if (versionNumber < '6.3.29') {
			const u1Settings = ['hdFarm', 'voidMap', 'boneShrine', 'mapBonus', 'mapFarm', 'raiding', 'bionicRaiding', 'toxicity'];

			const u2Settings = ['hdFarm', 'voidMap', 'boneShrine', 'mapBonus', 'mapFarm', 'raiding', 'worshipperFarm', 'tributeFarm', 'smithyFarm', 'quagmire', 'insanity', 'alchemy', 'hypothermia', 'desolation'];

			for (var item in u1Settings) {
				if (typeof tempSettings[u1Settings[item] + 'DefaultSettings'] !== 'undefined') {
					autoTrimpSettings[u1Settings[item] + 'Settings'].value.unshift(tempSettings[u1Settings[item] + 'DefaultSettings'].value);
				}
			}

			for (var item in u2Settings) {
				if (typeof tempSettings[u2Settings[item] + 'DefaultSettings'] !== 'undefined') {
					autoTrimpSettings[u2Settings[item] + 'Settings'].valueU2.unshift(tempSettings[u2Settings[item] + 'DefaultSettings'].valueU2);
				}
			}
		}

		if (versionNumber < '6.3.36') {
			if (typeof tempSettings['uniqueMapSettingsArray'] !== 'undefined') {
				autoTrimpSettings.uniqueMapSettingsArray.valueU2['Big_Wall'] = {
					enabled: false,
					zone: 100,
					cell: 0
				};
			}
		}

		//Converting addonUser saves variable to object and storing farming settings .done stuff in it
		if (versionNumber < '6.3.37') {
			var obj = [];
			for (var x = 0; x < 30; x++) {
				obj[x] = {};
				obj[x].done = '';
			}

			if (typeof game.global.addonUser !== 'object') game.global.addonUser = {};

			const u1Settings = ['hdFarm', 'voidMap', 'boneShrine', 'mapBonus', 'mapFarm', 'raiding', 'bionicRaiding', 'toxicity'];

			const u2Settings = ['hdFarm', 'voidMap', 'boneShrine', 'mapBonus', 'mapFarm', 'raiding', 'worshipperFarm', 'tributeFarm', 'smithyFarm', 'quagmire', 'insanity', 'alchemy', 'hypothermia', 'desolation'];

			for (var item in u1Settings) {
				if (typeof game.global.addonUser[u1Settings[item] + 'Settings'] === 'undefined') game.global.addonUser[u1Settings[item] + 'Settings'] = {};

				var obj = [];
				for (var x = 0; x < 30; x++) {
					obj[x] = {};
					obj[x].done = '';
				}
				game.global.addonUser[u1Settings[item] + 'Settings'].value = obj;

				if (typeof autoTrimpSettings[u1Settings[item] + 'Settings'].value[0] !== 'undefined') {
					for (var y = 0; y < autoTrimpSettings[u1Settings[item] + 'Settings'].value.length; y++) {
						autoTrimpSettings[u1Settings[item] + 'Settings'].value[y].row = y;
					}
				}
			}

			for (var item in u2Settings) {
				if (typeof game.global.addonUser[u2Settings[item] + 'Settings'] === 'undefined') game.global.addonUser[u2Settings[item] + 'Settings'] = {};
				var obj = [];
				for (var x = 0; x < 30; x++) {
					obj[x] = {};
					obj[x].done = '';
				}
				game.global.addonUser[u2Settings[item] + 'Settings'].value = obj;

				if (typeof autoTrimpSettings[u2Settings[item] + 'Settings'].valueU2[0] !== 'undefined') {
					for (var y = 0; y < autoTrimpSettings[u2Settings[item] + 'Settings'].valueU2.length; y++) {
						autoTrimpSettings[u2Settings[item] + 'Settings'].valueU2[y].row = y;
					}
				}
			}
		}
		if (versionNumber < '6.3.38') {
			setupAddonUser();
		}

		if (versionNumber < '6.4.09') {
			if (typeof tempSettings['heHrDontPortalBefore'] !== 'undefined') {
				autoTrimpSettings.heliumHrDontPortalBefore.value = tempSettings.heHrDontPortalBefore.value;
				autoTrimpSettings.heliumHrDontPortalBefore.valueU2 = tempSettings.heHrDontPortalBefore.valueU2;
			}
		}

		if (versionNumber < '6.4.20') {
			if (typeof tempSettings['buildingSettingsArray'] !== 'undefined') {
				autoTrimpSettings.buildingSettingsArray.valueU2.Antenna = {};
				autoTrimpSettings.buildingSettingsArray.valueU2.Antenna.enabled = false;
				autoTrimpSettings.buildingSettingsArray.valueU2.Antenna.percent = 100;
				autoTrimpSettings.buildingSettingsArray.valueU2.Antenna.buyMax = 0;
			}
		}

		if (versionNumber < '6.5.06') {
			if (typeof autoTrimpSettings.alchemySettings['valueU2'][1] !== 'undefined') {
				for (var y = 1; y < autoTrimpSettings.alchemySettings['valueU2'].length; y++) {
					autoTrimpSettings.alchemySettings['valueU2'][y].repeatevery = 0;
					autoTrimpSettings.alchemySettings['valueU2'][y].endzone = 999;
				}
				saveSettings();
			}
		}

		if (versionNumber < '6.5.09') {
			if (typeof tempSettings['autoAbandon'] !== 'undefined') {
				autoTrimpSettings.autoAbandon.value = tempSettings.autoAbandon.enabled ? 2 : 0;
				autoTrimpSettings.autoAbandon.valueU2 = tempSettings.autoAbandon.enabledU2 ? 2 : 0;
			}
		}

		if (versionNumber < '6.5.13') {
			const values = ['value', 'valueU2'];
			for (var z = 0; z < values.length; z++) {
				const incrementMaps = tempSettings['raidingSettings'][values[z]][0].incrementMaps;
				if (typeof tempSettings['raidingSettings'][values[z]][0] !== 'undefined') {
					for (let y = 1; y < tempSettings['raidingSettings'][values[z]].length; y++) {
						const currSetting = tempSettings['raidingSettings'][values[z]][y];
						autoTrimpSettings['raidingSettings'][values[z]][y].incrementMaps = incrementMaps;
						autoTrimpSettings['raidingSettings'][values[z]][y].raidingzone = (currSetting.raidingzone - currSetting.world).toString();
					}
				}
			}
			saveSettings();
		}

		if (versionNumber < '6.5.15') {
			if (typeof tempSettings['uniqueMapSettingsArray'] !== 'undefined') {
				const currTrimple = tempSettings['uniqueMapSettingsArray'].value['Trimple_of_Doom'];
				delete tempSettings['uniqueMapSettingsArray'].value['Trimple_of_Doom'];
				autoTrimpSettings.uniqueMapSettingsArray.value['Trimple_Of_Doom'] = currTrimple;
				delete autoTrimpSettings.uniqueMapSettingsArray.value['Trimple_of_Doom'];
				if (autoTrimpSettings.uniqueMapSettingsArray.value['Trimple_Of_Doom'] === undefined)
					autoTrimpSettings.uniqueMapSettingsArray.value['Trimple_Of_Doom'] = {
						enabled: false,
						zone: 999,
						cell: 1
					};
			}
		}

		if (versionNumber < '6.5.20') {
			if (typeof tempSettings['experienceStaff'] !== 'undefined') {
				if (autoTrimpSettings.experienceStaff.value === undefined || typeof autoTrimpSettings.experienceStaff.value !== 'string') autoTrimpSettings.experienceStaff.value === 'undefined';
			}
		}
		//Rename object names in "uniqueMapSettingsArray" to remove underscores from them.
		if (versionNumber < '6.5.22') {
			if (typeof tempSettings['uniqueMapSettingsArray'] !== 'undefined') {
				var obj = {};
				for (var item in tempSettings.uniqueMapSettingsArray.value) {
					obj[item.replace(/_/g, ' ')] = tempSettings.uniqueMapSettingsArray.value[item];
				}
				autoTrimpSettings.uniqueMapSettingsArray.value = obj;
				var obj = {};
				for (var item in tempSettings.uniqueMapSettingsArray.valueU2) {
					obj[item.replace(/_/g, ' ')] = tempSettings.uniqueMapSettingsArray.valueU2[item];
				}
				autoTrimpSettings.uniqueMapSettingsArray.valueU2 = obj;
			}
		}

		if (versionNumber < '6.5.24') {
			if (typeof tempSettings['voidMapSettings'] !== 'undefined') {
				if (autoTrimpSettings.voidMapSettings.value[0].hitsSurvived === undefined) autoTrimpSettings.voidMapSettings.value[0].hitsSurvived = 1;
				if (autoTrimpSettings.voidMapSettings.valueU2[0].hitsSurvived === undefined) autoTrimpSettings.voidMapSettings.valueU2[0].hitsSurvived = 1;
			}
		}

		if (versionNumber < '6.5.26') {
			if (typeof tempSettings['portalVoidIncrement'] !== 'undefined') {
				autoTrimpSettings.portalVoidIncrement.enabledU2 = tempSettings.portalVoidIncrement.enabled;
			}
		}

		if (versionNumber < '6.5.27') {
			if (typeof tempSettings['autGigaDeltaFactor'] !== 'undefined') {
				autoTrimpSettings.autoGigaDeltaFactor.value = tempSettings.autGigaDeltaFactor.value;
			}
		}

		if (versionNumber < '6.5.28') {
			if (typeof tempSettings['unbalance'] !== 'undefined') autoTrimpSettings.balance.enabledU2 = tempSettings.unbalance.enabledU2;
			if (typeof tempSettings['unbalanceZone'] !== 'undefined') autoTrimpSettings.balanceZone.valueU2 = tempSettings.unbalanceZone.valueU2;
			if (typeof tempSettings['unbalanceStacks'] !== 'undefined') autoTrimpSettings.balanceStacks.valueU2 = tempSettings.unbalanceStacks.valueU2;
			if (typeof tempSettings['unbalanceImprobDestack'] !== 'undefined') autoTrimpSettings.balanceImprobDestack.enabledU2 = tempSettings.unbalanceImprobDestack.enabledU2;

			if (typeof tempSettings['trappapalooza'] !== 'undefined') autoTrimpSettings.trapper.enabledU2 = tempSettings.trappapalooza.enabledU2;
			if (typeof tempSettings['trappapaloozaCoords'] !== 'undefined') autoTrimpSettings.trapperCoords.valueU2 = tempSettings.trappapaloozaCoords.valueU2;
			if (typeof tempSettings['trappapaloozaTrap'] !== 'undefined') autoTrimpSettings.trapperTrap.enabledU2 = tempSettings.trappapaloozaTrap.enabledU2;
			if (typeof tempSettings['trappapaloozaArmyPct'] !== 'undefined') autoTrimpSettings.trapperArmyPct.valueU2 = tempSettings.trappapaloozaArmyPct.valueU2;

			autoTrimpSettings.decay.enabledU2 = false;
			autoTrimpSettings.decayStacksToPush.valueU2 = -1;
			autoTrimpSettings.decayStacksToAbandon.valueU2 = -1;
		}

		if (versionNumber < '6.5.30') {
			if (typeof tempSettings['uniqueMapSettingsArray'] !== 'undefined') {
				autoTrimpSettings.uniqueMapSettingsArray.valueU2['MP Smithy One Off'] = {
					enabled: false,
					value: 100
				};
			}
		}

		if (versionNumber < '6.5.33') {
			if (typeof tempSettings['testMapScummingValue'] !== 'undefined') {
				if (!gameUserCheck()) autoTrimpSettings.testMapScummingValue.value = -1;
				else if (typeof tempSettings['testMapScummingValue'].value === 'object' && tempSettings['testMapScummingValue'].valueU2) autoTrimpSettings.testMapScummingValue.value = tempSettings['testMapScummingValue'].valueU2;
				else autoTrimpSettings.testMapScummingValue.value = -1;
			}
		}

		if (versionNumber < '6.5.36') {
			if (typeof game.global.addonUser['archaeologySettings'] === 'undefined') game.global.addonUser['archaeologySettings'] = {};
			if (typeof game.global.addonUser['archaeologySettings']['valueU2'] === 'undefined') {
				var obj = [];
				for (var x = 0; x < 30; x++) {
					obj[x] = {};
					obj[x].done = '';
				}
				game.global.addonUser['archaeologySettings'].valueU2 = obj;
			}
		}

		if (versionNumber < '6.5.39') {
			if (typeof tempSettings['heirloomStaffResource'] !== 'undefined') {
				autoTrimpSettings.heirloomStaffScience.valueU2 = tempSettings.heirloomStaffResource.valueU2;
			}
		}

		if (versionNumber < '6.5.43') {
			if (typeof tempSettings['Prestige'] !== 'undefined') {
				autoTrimpSettings.prestigeClimb.selected = tempSettings.Prestige.selected;
				autoTrimpSettings.prestigeClimb.selectedU2 = tempSettings.Prestige.selectedU2;
			}
			if (typeof tempSettings['PrestigeSkip'] !== 'undefined') {
				autoTrimpSettings.prestigeClimbSkip.enabled = tempSettings.PrestigeSkip.enabled;
				autoTrimpSettings.prestigeClimbSkip.enabledU2 = tempSettings.PrestigeSkip.enabledU2;
			}
			if (typeof tempSettings['ForcePresZ'] !== 'undefined') {
				autoTrimpSettings.prestigeClimbZone.value = tempSettings.ForcePresZ.value;
				autoTrimpSettings.prestigeClimbZone.valueU2 = tempSettings.ForcePresZ.valueU2;
			}
		}

		if (versionNumber < '6.5.49') {
			autoTrimpSettings.spamMessages.value.show = true;
		}

		if (versionNumber < '6.5.50') {
			if (typeof autoTrimpSettings.voidMapSettings['value'][1] !== 'undefined') {
				for (var y = 1; y < autoTrimpSettings.voidMapSettings['value'].length; y++) {
					autoTrimpSettings.voidMapSettings['value'][y].repeatevery = 1;
				}
			}
			if (typeof autoTrimpSettings.voidMapSettings['valueU2'][1] !== 'undefined') {
				for (var y = 1; y < autoTrimpSettings.voidMapSettings['valueU2'].length; y++) {
					autoTrimpSettings.voidMapSettings['valueU2'][y].repeatevery = 1;
				}
			}
			if (typeof autoTrimpSettings.hdFarmSettings['value'][1] !== 'undefined') {
				for (var y = 1; y < autoTrimpSettings.hdFarmSettings['value'].length; y++) {
					autoTrimpSettings.hdFarmSettings['value'][y].repeatevery = 1;
				}
			}
			if (typeof autoTrimpSettings.hdFarmSettings['valueU2'][1] !== 'undefined') {
				for (var y = 1; y < autoTrimpSettings.hdFarmSettings['valueU2'].length; y++) {
					autoTrimpSettings.hdFarmSettings['valueU2'][y].repeatevery = 1;
				}
			}
		}

		if (versionNumber < '6.5.55') {
			const tempSettings = JSON.parse(localStorage.getItem('atSettings'));
			const settingName = 'voidMapSettings';
			const values = ['value', 'valueU2'];
			for (let z = 0; z < values.length; z++) {
				if (typeof tempSettings[settingName][values[z]][0] !== 'undefined') {
					for (var y = 1; y < tempSettings[settingName][values[z]].length; y++) {
						let currSetting = tempSettings[settingName][values[z]][y];
						autoTrimpSettings[settingName][values[z]][y].endzone = currSetting.maxvoidzone;
					}
				}
			}
			saveSettings();
		}
	}

	//Print link to changelog if the user is in TW when they first load the update so that they can look at any relevant notes.
	//No other way to access it in TW currently.
	if (usingRealTimeOffline) {
		var changelogURL = `${atSettings.initialise.basepath}updates.html`;
		changelog.push('There has been an AutoTrimps update. <a href="' + changelogURL + "\" 'updates.html target='_blank'><u>Click here</u></a> to view the changelog.");
	}

	autoTrimpSettings['ATversion'] = atSettings.initialise.version;
	if (changelog.length !== 0) {
		printChangelog(changelog);
		if (typeof _verticalCenterTooltip === 'function') _verticalCenterTooltip(false, true);
		else verticalCenterTooltip(false, true);
	}
	updateAutoTrimpSettings(true);
	saveSettings();
}
