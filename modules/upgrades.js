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

	if (trimpStats.isDaily && getPageSetting('autoGenModeDaily') !== 0) targetZone = Math.min(targetZone, 230);
	if (trimpStats.isC3 && getPageSetting('autoGenModeC2') !== 0) targetZone = Math.min(targetZone, 230);
	if (getPageSetting('autoGenFuelStart') >= 1 || getPageSetting('autoGenModeBefore') !== 0) targetZone = Math.min(targetZone, Math.max(230, getPageSetting('autoGenFuelStart')));

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
	const gemsPS = trimpStats.resourcesPS['gems'].normal;
	const metalPS = trimpStats.resourcesPS['metal'].normal;
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
	return shouldSaveForSpeedUpgrade(game.upgrades.Gymystic, 0.125, 0.125, 0.125, 0.75);
}

function trapperHoldCoords(jobChange = false) {
	if (!noBreedChallenge() || !getPageSetting('trapper')) return false;

	const trappaCoordToggle = getPageSetting('trapperCoordStyle');
	if (trappaCoordToggle === 0) {
		let coordTarget = getPageSetting('trapperCoords');
		if (coordTarget > 0) coordTarget--;
		if (!game.global.runningChallengeSquared && coordTarget <= 0) coordTarget = trimps.currChallenge === 'Trapper' ? 32 : 49;
		return coordTarget > 0 && game.upgrades.Coordination.done >= coordTarget;
	}

	if (trappaCoordToggle === 1) {
		const armyTarget = getPageSetting('trapperArmySize');
		const coordinated = getPerkLevel('Coordinated');
		const coordinatedMult = coordinated > 0 ? 0.25 * Math.pow(game.portal.Coordinated.modifier, coordinated) + 1 : 1;
		return game.resources.trimps.getCurrentSend() * 1.25 > armyTarget;
	}

	if (jobChange) buyJobs();
	return false;
}

function shouldSaveForSpeedUpgrade(upgradeObj, foodRequired = 0.25, woodRequired = 0.25, metalRequired = 0.25, scienceRequired = 0.5) {
	const resources = ['food', 'wood', 'metal', 'science'];
	const resourceRequired = [foodRequired, woodRequired, metalRequired, scienceRequired];
	const resourceOwned = resources.map((r) => game.resources[r].owned);

	if (challengeActive('Scientist') || upgradeObj.done >= upgradeObj.allowed) return false;
	if (upgradeObj === game.upgrades.Coordination && (!canAffordCoordinationTrimps() || trapperHoldCoords())) return false;

	for (let i = 0; i < resources.length; i++) {
		const cost = upgradeObj.cost.resources[resources[i]];
		const resourceCost = cost ? resourceRequired[i] * (cost[1] !== undefined ? resolvePow(cost, upgradeObj) : cost) : 0;

		if (resourceOwned[i] < resourceCost) return false;
	}

	return true;
}

function sciUpgrades() {
	if (!challengeActive('Scientist')) return [];
	const upgradeList = [];
	const upgrades = game.upgrades;
	const sLevel = game.global.sLevel;

	const addUpgrade = (upgrade, condition = true, amt = 0) => {
		if (condition && upgrades[upgrade].done <= amt) {
			upgradeList.push(upgrade);
		}
	};

	addUpgrade('Battle');
	addUpgrade('Miners');

	//Scientist I - 11500 Science + Scientist II - 8000 Science
	if (sLevel <= 1) {
		const coordLevel = sLevel === 0 ? 8 : 7;
		addUpgrade('Bloodlust');
		addUpgrade('Coordination', upgrades.Coordination.done <= coordLevel, coordLevel);
		addUpgrade('Bestplate');
		addUpgrade('Megamace', sLevel === 0);
	}
	//Scientist III + V - 1500 Science.
	else if (sLevel === 2 || sLevel >= 4) {
		const coordLevel = 2;
		addUpgrade('Coordination', upgrades.Coordination.done <= coordLevel, coordLevel);
		addUpgrade('Speedminer');
		addUpgrade('Speedlumber');
		addUpgrade('Egg', sLevel >= 4);
	}

	return upgradeList;
}

function populateUpgradeList() {
	if (challengeActive('Scientist')) return sciUpgrades();

	const upgradeList = ['Miners', 'Scientists', 'Efficiency', 'Coordination', 'Speedminer', 'Speedlumber', 'Speedfarming', 'Speedscience', 'Speedexplorer', 'Explorers', 'Battle', 'Bloodlust', 'Bounty', 'Egg', 'UberHut', 'UberHouse', 'UberMansion', 'UberHotel', 'UberResort', 'Trapstorm', 'Potency'];

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

	const needScientists = game.upgrades.Scientists.done < game.upgrades.Scientists.allowed;
	const needBounty = !game.upgrades.Bounty.done && game.upgrades.Bounty.allowed;
	const needEff = game.upgrades.Efficiency.done < game.upgrades.Efficiency.allowed;
	const needMega = game.upgrades.Megascience.done < game.upgrades.Megascience.allowed;
	const needSpeed = game.upgrades.Speedscience.done < game.upgrades.Speedscience.allowed;
	const effRelevance = game.global.world >= 60 ? (game.global.frugalDone ? 1.5 : 1) : 1 / 3;
	const scientistsAreRelevant = !isPlayerRelevant('science', false, 2);
	const researchIsRelevant = isPlayerRelevant('science', false, effRelevance);
	const saveForEff = shouldSaveForSpeedUpgrade(game.upgrades['Efficiency']);

	const upgradeList = populateUpgradeList();
	const scientistChallenge = challengeActive('Scientist');

	for (let upgrade in upgradeList) {
		upgrade = upgradeList[upgrade];
		const gameUpgrade = game.upgrades[upgrade];
		const available = gameUpgrade.allowed > gameUpgrade.done && canAffordTwoLevel(gameUpgrade);
		if (!available) continue;

		if (upgrade === 'Coordination') {
			if (upgradeSetting === 2 || !canAffordCoordinationTrimps() || trapperHoldCoords(true)) continue;
		} else if (upgrade === 'Gigastation') {
			if (!getPageSetting('buildingsType') || !getPageSetting('warpstation')) continue;

			if (getPageSetting('autoGigas') && game.upgrades.Gigastation.done === 0 && !firstGiga()) {
				continue;
			} else if (game.global.lastWarp && game.buildings.Warpstation.owned < Math.floor(game.upgrades.Gigastation.done * getPageSetting('deltaGigastation')) + getPageSetting('firstGigastation')) {
				continue;
			} else if (game.buildings.Warpstation.owned < getPageSetting('firstGigastation')) {
				continue;
			}
		} else if (upgrade === 'Bloodlust') {
			if (game.global.world === 1) continue;
			const needMiner = !challengeActive('Metal') && !game.upgrades.Miners.done;
			const needScientists = !scientistChallenge && !game.upgrades.Scientists.done;
			if (needScientists && game.resources.science.owned < 160 && game.resources.food.owned < 450) continue;
			if (needMiner && needScientists && game.resources.science.owned < 220) continue;
			if (needMiner && game.resources.science.owned < 120) continue;
		} else if (upgrade === 'Shieldblock' && !getPageSetting('equipShieldBlock')) {
			continue;
		}

		//TODO Maybe rework this priority system
		//Prioritise Science/scientist upgrades
		if (upgrade !== 'Bloodlust' && upgrade !== 'Miners' && upgrade !== 'Scientists' && !atSettings.portal.aWholeNewWorld && !scientistChallenge) {
			if (needScientists) continue;
			if (needBounty && upgrade !== 'Bounty') continue;
			if (!needBounty && needEff && researchIsRelevant && saveForEff && upgrade !== 'Efficiency') continue;

			if ((!needBounty && !needEff) || (!needBounty && !researchIsRelevant) || (upgrade !== 'Efficiency' && upgrade !== 'Bounty')) {
				if (needSpeed && scientistsAreRelevant && upgrade !== 'Speedscience') continue;
				if (needMega && scientistsAreRelevant && !['Speedscience', 'Megascience'].includes(upgrade)) continue;
			}
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
	if (selected) {
		const heName = heliumOrRadon();
		const guName = selected === 'Helium' ? heName : selected;
		buyGoldenUpgrade(selected);
		debug(`Purchased Golden ${guName} #${game.goldenUpgrades[selected].purchasedAt.length}`, 'golden_Upgrades', '*upload2');
	}
}
