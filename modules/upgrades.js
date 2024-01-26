function gigaTargetZone() {
	let targetZone = 59;
	const heliumChallengeActive = game.global.challengeActive && game.challenges[game.global.challengeActive].heliumThrough;
	const lastPortalZone = game.global.lastPortal;
	const challengeZone = heliumChallengeActive ? game.challenges[game.global.challengeActive].heliumThrough : 0;
	const c2zone = c2FinishZone();
	let portalZone = 0;

	if (autoTrimpSettings.autoPortal.selected === 'Helium Per Hour') portalZone = trimpStats.isDaily ? getPageSetting('dailyDontPortalBefore', 1) : getPageSetting('heHrDontPortalBefore', 1);
	else if (autoTrimpSettings.autoPortal.selected === 'Custom') portalZone = trimpStats.isDaily ? getPageSetting('dailyPortalZone') : getPageSetting('autoPortalZone', 1);

	if (!trimpStats.isC3) targetZone = Math.max(targetZone, lastPortalZone, challengeZone, portalZone - 1);
	else targetZone = Math.max(targetZone, c2zone - 1);

	if (trimpStats.isDaily && getPageSetting('AutoGenDC') !== 0) targetZone = Math.min(targetZone, 230);
	if (trimpStats.isC3 && getPageSetting('AutoGenC2') !== 0) targetZone = Math.min(targetZone, 230);
	if (getPageSetting('fuellater') >= 1 || getPageSetting('beforegen') !== 0) targetZone = Math.min(targetZone, Math.max(230, getPageSetting('fuellater')));

	if (targetZone < 60) {
		targetZone = Math.max(65, game.global.highestLevelCleared);
		debug(`Auto Gigastation: Warning! Unable to find a proper targetZone. Using your HZE instead`, 'general', '*rocket');
	}

	return targetZone;
}

function autoGiga(targetZone, metalRatio = 0.5, slowDown = 10, customBase) {
	if (!targetZone || targetZone < 60) targetZone = gigaTargetZone();

	const base = customBase ? customBase : getPageSetting('firstGigastation');
	const baseZone = game.global.world;
	const rawPop = game.resources.trimps.max - game.unlocks.impCount.TauntimpAdded;
	const gemsPS = getPsString_AT('gems', true);
	const metalPS = getPsString_AT('metal', true);
	const megabook = game.global.frugalDone ? 1.6 : 1.5;

	//Calculus
	const nGigas = Math.min(Math.floor(targetZone - 60), Math.floor(targetZone / 2 - 25), Math.floor(targetZone / 3 - 12), Math.floor(targetZone / 5), Math.floor(targetZone / 10 + 17), 39);
	const metalDiff = Math.max((0.1 * metalRatio * metalPS) / gemsPS, 1);

	let delta = 3;
	for (let i = 0; i < 10; i++) {
		//Population guess
		let pop = 6 * Math.pow(1.2, nGigas) * 10000;
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
	const c = s || ['HD Farm', 'Hits Survived'].includes(mapSettings.mapName);
	const d = s || game.global.mapBonus >= 1;
	if (!(a && b && c && d)) return false;

	//Define Base and Delta for this run
	const base = game.buildings.Warpstation.owned;
	const deltaZ = getPageSetting('autoGigaTargetZone') >= 60 ? getPageSetting('autoGigaTargetZone') : undefined;
	const deltaS = getPageSetting('autoGigaDeltaFactor') >= 1 ? getPageSetting('autoGigaDeltaFactor') : undefined;
	const delta = autoGiga(deltaZ, 0.5, deltaS);

	const firstGiga = getPageSetting('firstGigastation');
	const deltaGiga = getPageSetting('deltaGigastation');
	if (firstGiga !== base) setPageSetting('firstGigastation', base);
	if (deltaGiga !== delta) setPageSetting('deltaGigastation', delta);

	//Log
	if (firstGiga !== base || deltaGiga !== delta) {
		debug(`Auto Gigastation: Setting pattern to ${base} + ${delta}`, 'buildings', '*rocket');
	}
	return true;
}

function needGymystic() {
	return game.upgrades['Gymystic'].allowed > game.upgrades['Gymystic'].done;
}

function sciUpgrades() {
	if (!challengeActive('Scientist')) return [];
	const upgradeList = [];
	const upgrades = game.upgrades;
	const sLevel = game.global.sLevel;

	const addUpgrade = (upgrade, condition = true) => {
		if (condition && upgrades[upgrade].done === 0) {
			upgradeList.push(upgrade);
		}
	};

	addUpgrade('Battle');
	addUpgrade('Miners');

	//Scientist I - 11500 Science + Scientist II - 8000 Science
	if (sLevel <= 1) {
		addUpgrade('Bloodlust');
		addUpgrade('Coordination', upgrades.Coordination.done <= (sLevel === 0 ? 8 : 7));
		addUpgrade('Bestplate');
		addUpgrade('Megamace', sLevel === 0);
	}
	//Scientist III + V - 1500 Science.
	else if (sLevel === 2 || sLevel >= 4) {
		addUpgrade('Coordination', upgrades.Coordination.done <= 2);
		addUpgrade('Speedminer');
		addUpgrade('Speedlumber');
		addUpgrade('Egg', sLevel >= 4);
	}

	return upgradeList;
}

function populateUpgradeList() {
	if (challengeActive('Scientist')) return sciUpgrades();

	const upgradeList = ['Miners', 'Scientists', 'Coordination', 'Speedminer', 'Speedlumber', 'Speedfarming', 'Speedscience', 'Speedexplorer', 'Efficiency', 'Explorers', 'Battle', 'Bloodlust', 'Bounty', 'Egg', 'UberHut', 'UberHouse', 'UberMansion', 'UberHotel', 'UberResort', 'Trapstorm', 'Potency'];

	if (game.global.universe === 1) {
		upgradeList.push('Megaminer', 'Megalumber', 'Megafarming', 'Megascience', 'TrainTacular', 'Trainers', 'Blockmaster', 'Anger', 'Formations', 'Dominance', 'Barrier', 'Gymystic', 'Gigastation', 'Shieldblock', 'Magmamancers');
	}

	if (game.global.universe === 2) {
		upgradeList.push('Rage', 'Prismatic', 'Prismalicious');
	}

	return upgradeList;
}

function buyUpgrades() {
	const upgradeSetting = getPageSetting('upgradeType');
	if (upgradeSetting === 0) return;

	const upgradeList = populateUpgradeList();

	for (let upgrade in upgradeList) {
		upgrade = upgradeList[upgrade];
		const gameUpgrade = game.upgrades[upgrade];
		const available = gameUpgrade.allowed > gameUpgrade.done && canAffordTwoLevel(gameUpgrade);
		if (!available) continue;
		if (upgrade === 'Coordination') {
			if (upgradeSetting === 2 || !canAffordCoordinationTrimps()) continue;
			//Skip coords if we have more than our designated cap otherwise buy jobs to ensure we fire enough workers for the coords we want to get.
			if (challengeActive('Trappapalooza') || (challengeActive('Trapper') && getPageSetting('trapper'))) {
				const trappaCoordToggle = 1; //getPageSetting('trapperCoordsToggle');
				let coordTarget = getPageSetting('trapperCoords');
				if (trappaCoordToggle === 1) {
					if (coordTarget > 0) coordTarget--;
					if (!game.global.runningChallengeSquared && coordTarget <= 0) coordTarget = trimps.currChallenge === 'Trapper' ? 32 : 49;
					if (coordTarget > 0 && gameUpgrade.done >= coordTarget) continue;
				}
				if (trappaCoordToggle === 2) {
					if (game.resources.trimps.maxSoldiers * 1.25 > coordTarget) continue;
				}
				buyJobs();
			}
		} else if (upgrade === 'Gigastation') {
			if (!getPageSetting('buildingsType') || !getPageSetting('warpstation')) continue;
			if (!bwRewardUnlocked('DecaBuild')) {
				if (getPageSetting('autoGigas') && game.upgrades.Gigastation.done === 0 && !firstGiga()) continue;
				else if (game.global.lastWarp ? game.buildings.Warpstation.owned < Math.floor(game.upgrades.Gigastation.done * getPageSetting('deltaGigastation')) + getPageSetting('firstGigastation') : game.buildings.Warpstation.owned < getPageSetting('firstGigastation')) continue;
			}
		} else if (upgrade === 'Bloodlust') {
			if (game.global.world === 1) continue;
			const needMiner = !challengeActive('Metal') && !game.upgrades.Miners.done;
			const needScientists = !challengeActive('Scientist') && !game.upgrades.Scientists.done;
			if (needScientists && game.resources.science.owned < 160 && game.resources.food.owned < 450) continue;
			if (needMiner && needScientists && game.resources.science.owned < 220) continue;
			if (needMiner && game.resources.science.owned < 120) continue;
		} else if (upgrade === 'Shieldblock' && !getPageSetting('equipShieldBlock')) continue;
		//Prioritise Science/scientist upgrades
		if (upgrade !== 'Bloodlust' && upgrade !== 'Miners' && upgrade !== 'Scientists' && !atSettings.portal.aWholeNewWorld) {
			if (game.upgrades.Scientists.done < game.upgrades.Scientists.allowed) continue;
			if (game.upgrades.Speedscience.done < game.upgrades.Speedscience.allowed && upgrade !== 'Speedscience') continue;
			if (game.upgrades.Megascience.done < game.upgrades.Megascience.allowed && upgrade !== 'Megascience' && upgrade !== 'Speedscience') continue;
		}

		buyUpgrade(upgrade, true, true);
		debug(`Upgraded ${upgrade}`, 'upgrades', '*upload2');
	}
}

function getNextGoldenUpgrade() {
	const setting = getPageSetting('autoGoldenSettings');
	if (setting.length === 0) return false;

	const defs = archoGolden.getDefs();
	let done = {};

	for (let x = 0; x < setting.length; x++) {
		const currSetting = setting[x];
		if (!currSetting.active || currSetting.golden === undefined) continue;
		if (!goldenUpgradeRunType(currSetting)) continue;

		let rule = currSetting.golden;
		let name = defs[rule.slice(0, 1)];
		let number = parseInt(rule.slice(1, rule.length), 10);
		if (number === -1) number = Infinity;
		let purchased = game.goldenUpgrades[name].purchasedAt.length;
		let old = done[name] ? done[name] : 0;

		if (name === 'Void' && parseFloat((game.goldenUpgrades.Void.currentBonus + game.goldenUpgrades.Void.nextAmt()).toFixed(2)) > 0.72) continue;

		if (purchased < number + old) return name;
		if (done[name]) done[name] += number;
		else done[name] = number;
	}

	return false;
}

function goldenUpgradeRunType(currSetting) {
	if (typeof currSetting.runType !== 'undefined' && currSetting.runType !== 'All') {
		if (trimpStats.isDaily) {
			if (currSetting.runType !== 'Daily') return false;
		} else if (trimpStats.isC3) {
			if (currSetting.runType !== 'C3' || (currSetting.challenge3 !== 'All' && !challengeActive(currSetting.challenge3))) return false;
		} else if (trimpStats.isOneOff) {
			if (currSetting.runType !== 'One Off' || (currSetting.challengeOneOff !== 'All' && !challengeActive(currSetting.challengeOneOff))) return false;
		} else {
			if (currSetting.runType === 'Filler') {
				let currChallenge = currSetting.challenge === 'No Challenge' ? '' : currSetting.challenge;
				if (currSetting.challenge !== 'All' && !challengeActive(currChallenge)) return false;
			} else return false;
		}
	}
	return true;
}

function autoGoldUpgrades() {
	if (!goldenUpgradesShown || getAvailableGoldenUpgrades() <= 0) return;
	const selected = getNextGoldenUpgrade();
	if (selected) buyGoldenUpgrade(selected);
}
