var upgradeList = ['Miners', 'Scientists', 'Coordination', 'Speedminer', 'Speedlumber', 'Speedfarming', 'Speedscience', 'Speedexplorer', 'Efficiency', 'Explorers', 'Battle', 'Bloodlust', 'Bounty', 'Egg', 'UberHut', 'UberHouse', 'UberMansion', 'UberHotel', 'UberResort', 'Trapstorm', 'Potency',
	//U1 only
	'Megaminer', 'Megalumber', 'Megafarming', 'Megascience', 'TrainTacular', 'Trainers', 'Blockmaster', 'Anger', 'Formations', 'Dominance', 'Barrier', 'Gymystic', 'Gigastation', 'Shieldblock', 'Magmamancers',
	//U2 only
	'Rage', 'Prismatic', 'Prismalicious',
	//Equipment
	'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP', 'Supershield'
];

//Helium
MODULES["upgrades"] = {};
MODULES["upgrades"].targetFuelZone = true;
MODULES["upgrades"].customMetalRatio = 0.5; //Change the Custom Delta factor instead

function gigaTargetZone() {
	//Init
	var targetZone = 59;
	var daily = challengeActive('Daily');
	var runningC2 = game.global.runningChallengeSquared;
	var heliumChallengeActive = game.global.challengeActive && game.challenges[game.global.challengeActive].heliumThrough;

	//Try setting target zone to the zone we finished last portal on
	var lastPortalZone = game.global.lastPortal;
	var challengeZone = (heliumChallengeActive) ? game.challenges[game.global.challengeActive].heliumThrough : 0;

	//Also consider the zone we configured our portal to be used
	var portalZone = 0;
	if (autoTrimpSettings.autoPortal.selected === "Helium Per Hour") portalZone = (daily) ? getPageSetting('dailyDontPortalBefore', 1) : getPageSetting('heHrDontPortalBefore', 1);
	else if (autoTrimpSettings.autoPortal.selected === "Custom") portalZone = (daily) ? getPageSetting('dailyPortalZone') : getPageSetting('autoPortalZone', 1);

	//Finds a target zone for when doing c2
	var c2zone = 0;
	if (getPageSetting('c2RunnerStart') === true && getPageSetting("c2RunnerPortal") > 0) c2zone = getPageSetting("c2RunnerPortal");
	else if (getPageSetting("c2Finish") > 0) c2zone = getPageSetting("c2Finish");

	//Set targetZone
	if (!runningC2) targetZone = Math.max(targetZone, lastPortalZone, challengeZone, portalZone - 1);
	else targetZone = Math.max(targetZone, c2zone - 1);

	//Target Fuel Zone
	if (daily && getPageSetting("AutoGenDC") !== 0) targetZone = Math.min(targetZone, 230);
	if (runningC2 && getPageSetting("AutoGenC2") !== 0) targetZone = Math.min(targetZone, 230);
	if (MODULES.upgrades.targetFuelZone && (getPageSetting("fuellater") >= 1 || getPageSetting("beforegen") !== 0)) targetZone = Math.min(targetZone, Math.max(230, getPageSetting("fuellater")));

	//Failsafe
	if (targetZone < 60) {
		targetZone = Math.max(65, game.global.highestLevelCleared);
		debug("Auto Gigastation: Warning! Unable to find a proper targetZone. Using your HZE instead", "general", "*rocket");
	}

	return targetZone;
}

function autoGiga(targetZone, metalRatio = 0.5, slowDown = 10, customBase) {
	//Pre Init
	if (!targetZone || targetZone < 60) targetZone = gigaTargetZone();

	//Init
	var base = (customBase) ? customBase : getPageSetting('firstGigastation');
	var baseZone = game.global.world;
	var rawPop = game.resources.trimps.max - game.unlocks.impCount.TauntimpAdded;
	var gemsPS = getPerSecBeforeManual("Dragimp");
	var metalPS = getPerSecBeforeManual("Miner");
	var megabook = (game.global.frugalDone) ? 1.6 : 1.5;

	//Calculus
	var nGigas = Math.min(Math.floor(targetZone - 60), Math.floor(targetZone / 2 - 25), Math.floor(targetZone / 3 - 12), Math.floor(targetZone / 5), Math.floor(targetZone / 10 + 17), 39);
	var metalDiff = Math.max(0.1 * metalRatio * metalPS / gemsPS, 1);

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
	return +(Math.round(delta + "e+2") + "e-2");
}

function firstGiga() {
	//Build our first giga if: A) Has more than 2 Warps & B) Can't afford more Coords & C)* Lacking Health or Damage & D)* Has run at least 1 map stack or if forced to
	const s = !(getPageSetting('autGigaDeltaFactor') > 20);
	const a = game.buildings.Warpstation.owned >= 2;
	const b = !canAffordCoordinationTrimps() || game.global.spireActive || game.global.world >= 230 && !canAffordTwoLevel(game.upgrades.Coordination);
	const c = s || mapSettings.mapName === 'HD Farm' || mapSettings.mapName === 'Hits Survived';
	const d = s || game.global.mapBonus >= 1;
	if (!(a && b && c && d)) return false;

	//Define Base and Delta for this run
	const base = game.buildings.Warpstation.owned;
	const deltaZ = (getPageSetting('autoGigaTargetZone') >= 60) ? getPageSetting('autoGigaTargetZone') : undefined;
	const deltaM = (MODULES["upgrades"].customMetalRatio > 0) ? MODULES["upgrades"].customMetalRatio : undefined;
	const deltaS = (getPageSetting('autGigaDeltaFactor') >= 1) ? getPageSetting('autGigaDeltaFactor') : undefined;
	const delta = autoGiga(deltaZ, deltaM, deltaS);

	//Save settings
	var firstGiga = getPageSetting('firstGigastation');
	var deltaGiga = getPageSetting('deltaGigastation');
	if (firstGiga !== base) setPageSetting('firstGigastation', base);
	if (deltaGiga !== delta) setPageSetting('deltaGigastation', delta);

	//Log
	if (firstGiga !== base || deltaGiga !== delta) {
		debug("Auto Gigastation: Setting pattern to " + base + "+" + delta, "buildings", "*rocket");
	}
	return true;
}

function needGymystic() {
	return game.upgrades['Gymystic'].allowed - game.upgrades['Gymystic'].done > 0;
}

function buyUpgrades() {
	if (getPageSetting('upgradeType') === 0) return;

	for (var upgrade in upgradeList) {
		upgrade = upgradeList[upgrade];
		var gameUpgrade = game.upgrades[upgrade];
		if (gameUpgrade.prestiges) continue;
		var available = (gameUpgrade.allowed > gameUpgrade.done && canAffordTwoLevel(gameUpgrade));
		if (!available) continue;
		var fuckbuildinggiga = (bwRewardUnlocked("AutoStructure") && bwRewardUnlocked("DecaBuild") && getPageSetting('buildingsType') === 0);

		//Coord & Amals
		if (upgrade === 'Coordination' && (getPageSetting('upgradeType') === 2 || !canAffordCoordinationTrimps())) continue;
		//Skip coords if we have more than our designated cap otherwise buy jobs to ensure we fire enough workers for the coords we want to get.
		if (upgrade === 'Coordination' && challengeActive('Trappapalooza') && getPageSetting('trappapalooza')) {
			if (getPageSetting('trappapaloozaCoords') > 0 && game.upgrades.Coordination.done >= getPageSetting('trappapaloozaCoords')) continue;
			buyJobs();
		}
		//Gigastations
		if (upgrade === 'Gigastation' && !fuckbuildinggiga) {
			if (getPageSetting("autoGigas") && game.upgrades.Gigastation.done === 0 && !firstGiga()) continue;
			else if (game.buildings.Warpstation.owned < (Math.floor(game.upgrades.Gigastation.done * getPageSetting('deltaGigastation')) + getPageSetting('firstGigastation'))) continue;
		}

		if (upgrade === 'Gigastation' && !getPageSetting('buildingsType')) continue;
		//Other
		if (upgrade === 'Shieldblock' && !getPageSetting('equipShieldBlock')) continue;
		if (upgrade === 'Gigastation' && !fuckbuildinggiga && (game.global.lastWarp ? game.buildings.Warpstation.owned < (Math.floor(game.upgrades.Gigastation.done * getPageSetting('deltaGigastation')) + getPageSetting('firstGigastation')) : game.buildings.Warpstation.owned < getPageSetting('firstGigastation'))) continue;
		if (upgrade === 'Bloodlust' && challengeActive('Scientist') && getPageSetting('autoFight')) continue;
		if (upgrade !== 'Bloodlust' && upgrade !== 'Miners') {
			if (game.upgrades.Scientists.done < game.upgrades.Scientists.allowed && upgrade !== 'Scientists') continue;
			if (upgrade !== 'Scientists' && game.upgrades.Speedscience.done < game.upgrades.Speedscience.allowed && upgrade !== 'Speedscience') continue;
			if (upgrade !== 'Scientists' && game.upgrades.Megascience.done < game.upgrades.Megascience.allowed && upgrade !== 'Megascience' && upgrade !== 'Speedscience') continue;
		}
		buyUpgrade(upgrade, true, true);
		debug('Upgraded ' + upgrade, "upgrades", "*upload2");
	}
}

function getNextGoldenUpgrade() {

	const setting = hdStats.isC3 ? getPageSetting('autoGoldenC3Settings') : hdStats.isDaily ? getPageSetting('autoGoldenDailySettings') : getPageSetting('autoGoldenSettings');

	if (setting.length === 0) {
		return false;
	}

	var defs = archoGolden.getDefs();
	var done = {};

	for (var x = 0; x < setting.length; x++) {
		if (!setting[x].active) continue;
		if (setting[x].golden === undefined) continue;
		rule = setting[x].golden;
		var name = defs[rule.slice(0, 1)];
		var number = parseInt(rule.slice(1, rule.length), 10);
		if (number === -1) number = Infinity;
		var purchased = game.goldenUpgrades[name].purchasedAt.length;
		var old = done[name] ? done[name] : 0;
		if (name === "Void" && (parseFloat((game.goldenUpgrades.Void.currentBonus + game.goldenUpgrades.Void.nextAmt()).toFixed(2)) > 0.72)) {
			continue;
		}
		if (purchased < (number + old)) {
			return name;
		}
		if (done[name]) done[name] += number;
		else done[name] = number;
	}

	return false;
}

function autoGoldUpgrades() {
	if (!goldenUpgradesShown || getAvailableGoldenUpgrades() <= 0)
		return;
	var selected;
	selected = getNextGoldenUpgrade();
	if (!selected) return;
	buyGoldenUpgrade(selected);
}