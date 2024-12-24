function miRatio() {
	if (atData.magmite && atData.magmite.upgradeToPurchase !== '' && atData.magmite.upgradeToPurchase !== undefined) return;

	atData.magmite = {
		carpMod: 0,
		minTick: 0,
		maxTick: 0,
		tickRatio: 0,
		totalPop: 0,
		finalAmals: 0,
		maxAmals: 0,
		finalAmalZone: 0,
		neededPop: 0,
		finalArmySize: 0,
		finalAmalRatio: 0,
		yourFinalRatio: 0,
		totalMI: 0,
		upgradeToPurchase: ''
	};

	const fuelStart = Math.max(230, getPageSetting('autoGenFuelStart', 1));
	const fuelEnd = Math.min(810, getPageSetting('autoGenFuelEnd', 1));

	atData.magmiteSettings = {
		//runstats
		fuelStart: {
			value: fuelStart,
			update: function (value = this.value) {
				const { fuelEnd, runEnd, fuelZones } = atData.magmiteSettings;
				this.value = Math.max(230, value);
				fuelEnd.value = Math.max(fuelEnd.value, this.value);
				runEnd.value = Math.max(runEnd.value, this.value);
				fuelZones.update(fuelEnd.value - this.value);
				calculateCurrentPop();
			}
		},
		fuelEnd: {
			value: fuelEnd,
			update: function (value = this.value) {
				const { fuelStart, runEnd, fuelZones } = atData.magmiteSettings;
				this.value = parseInt(value);
				fuelStart.value = Math.min(fuelStart.value, this.value);
				runEnd.value = Math.max(runEnd.value, this.value);
				const newFuelZonesValue = this.value - fuelStart.value;
				if (fuelZones.value !== newFuelZonesValue) fuelZones.update(newFuelZonesValue);
				calculateCurrentPop();
			}
		},
		fuelZones: {
			value: fuelEnd - fuelStart,
			update: function (value = this.value) {
				const { fuelStart, fuelEnd } = atData.magmiteSettings;
				this.value = parseInt(value);
				const newFuelEndValue = fuelStart.value + this.value;
				if (fuelEnd.value !== newFuelEndValue) fuelEnd.update(newFuelEndValue);
				calculateCurrentPop();
			}
		},
		runEnd: {
			value: Math.max(game.stats.highestLevel.valueTotal() * 0.9 < game.global.lastPortal ? game.global.lastPortal : game.stats.highestLevel.valueTotal(), 235),
			update: function (value = this.value) {
				this.value = parseInt(value);
				calculateCurrentPop();
			}
		},
		housingMod: { value: 1 },
		spiresCleared: { value: game.global.spiresCompleted },
		voids: { value: game.stats.totalVoidMaps.value + game.global.totalVoidMaps },
		hze: { value: game.global.highestLevelCleared + 1 },
		//perks
		carp: { value: game.portal.Carpentry.level },
		carp2: { value: game.portal.Carpentry_II.level },
		coord: { value: game.portal.Coordinated.level },
		//misc upgrades
		randimp: { value: masteryPurchased('magimp') },
		magmaFlow: { value: masteryPurchased('magmaFlow') ? 18 : 16 },
		expertGen: { value: masteryPurchased('quickGen') ? 1 : 0 },
		moreImports: { value: game.permaBoneBonuses.exotic.owned },
		scaffolding: { value: autoBattle.bonuses.Scaffolding.getMult() },
		//dg upgrades
		efficiency: {
			value: game.generatorUpgrades.Efficiency.upgrades,
			cost: game.generatorUpgrades.Efficiency.cost(),
			update: function (value = this.value) {
				this.value = parseInt(value);
				this.cost = (value + 1) * 8;
				calculateMinTick();
				calculateMaxTick();
				calculateCurrentPop();
			}
		},
		capacity: {
			value: game.generatorUpgrades.Capacity.upgrades,
			cost: game.generatorUpgrades.Capacity.cost(),
			maxCapacity: 3 + game.generatorUpgrades.Capacity.upgrades * 0.4,
			update: function (value = this.value) {
				this.value = parseInt(value);
				this.cost = (value + 1) * 32;
				this.maxCapacity = 3 + value * 0.4;
				calculateMaxTick();
				calculateCurrentPop();
			}
		},
		supply: {
			value: game.generatorUpgrades.Supply.upgrades,
			cost: game.generatorUpgrades.Supply.cost(),
			maxSupply: 0.2 + game.generatorUpgrades.Supply.upgrades * 0.02,
			update: function (value = this.value) {
				this.value = parseInt(value);
				this.maxSupply = 0.2 + value * 0.02;
				this.cost = (value + 1) * 64;
				calculateCurrentPop();
			}
		},
		overclocker: {
			value: game.generatorUpgrades.Overclocker.upgrades,
			cost: game.generatorUpgrades.Overclocker.cost(),
			bonus: game.generatorUpgrades.Overclocker.upgrades < 1 ? 1 : 1 - 0.5 * Math.pow(0.99, game.generatorUpgrades.Overclocker.upgrades - 1),
			update: function (value = this.value) {
				this.value = parseInt(value);
				this.bonus = this.value < 1 ? 1 : 1 - 0.5 * Math.pow(0.99, this.value - 1);
				this.cost = 512 + this.value * 32;
				calculateCurrentPop();
			}
		},
		//perm dg upgrades
		storage: { value: game.permanentGeneratorUpgrades.Storage.owned ? 2 : 1 },
		slowburn: { value: game.permanentGeneratorUpgrades.Slowburn.owned ? 0.4 : 0.5 },
		decay: { value: game.permanentGeneratorUpgrades.Shielding.owned ? 0.8 : 0.7 },
		//optimization targets
		minimizeZone: {
			value: 231,
			update: function (value = this.value) {
				this.value = Math.max(231, value);
			}
		}
	};

	calculateMagma();
	calculateMaxTick();
	calculateMinTick();
	calculateCurrentPop();
	atData.magmite.upgradeToPurchase = checkDGUpgrades();
}

function calculateFuelZones(refresh = false, fuelZones = getPageSetting('magmiteFuelZones', 1)) {
	if (game.global.universe !== 1 || !getPageSetting('magmiteAutoFuel')) return;
	if (!refresh) miRatio();
	let bestAmals = atData.magmite.maxAmals;
	atData.magmiteSettings.fuelStart.update(230);
	let bestPop = 0;
	let myFuelStart = 230;

	for (let f = 230; f <= atData.magmiteSettings.runEnd.value - fuelZones; f++) {
		atData.magmiteSettings.fuelStart.update(f);
		atData.magmiteSettings.fuelZones.update(fuelZones);
		if (atData.magmite.totalPop > bestPop && atData.magmite.maxAmals >= bestAmals) {
			bestPop = atData.magmite.totalPop;
			myFuelStart = f;
			bestAmals = Math.max(atData.magmite.maxAmals, bestAmals); // max pop is not always max gators
		}
	}

	atData.magmiteSettings.fuelStart.update(myFuelStart);
	atData.magmiteSettings.fuelZones.update(fuelZones);
	atData.magmiteSettings.fuelEnd.update();

	setPageSetting('autoGenFuelStart', atData.magmiteSettings.fuelStart.value, 1);
	setPageSetting('autoGenFuelEnd', atData.magmiteSettings.fuelEnd.value, 1);
	miRatio();

	if (!refresh && getPageSetting('magmiteMinimize')) minimizeFuelZones();
}

function minimizeFuelZones() {
	const settings = atData.magmiteSettings;
	const magmite = atData.magmite;
	settings.fuelStart.update(230);
	settings.fuelEnd.update(settings.runEnd.value);
	const finalAmals = magmite.finalAmals;
	const finalAmalZone = magmite.finalAmalZone;
	const bestAmals = finalAmals;
	const amalRatio = magmite.amalRatio;
	let bestJ = settings.fuelZones.value;
	let maxedAmals = false;

	settings.fuelStart.update(settings.runEnd.value);
	settings.fuelZones.update(0);

	while (settings.fuelStart.value >= 230) {
		while (atData.magmite.finalAmals > 0 && atData.magmite.finalAmals >= bestAmals && settings.fuelZones.value > 0) {
			// minimize capacity
			bestJ = settings.fuelZones.value;
			settings.fuelZones.value -= 1;
			settings.fuelZones.update(settings.fuelZones.value);
			maxedAmals = true;
		}

		settings.fuelZones.update(settings.fuelZones.value);
		settings.fuelStart.value -= 1;

		if (settings.fuelStart.value >= 230) {
			settings.fuelStart.update(settings.fuelStart.value);
		}

		settings.fuelZones.update(Math.min(settings.runEnd.value - settings.fuelStart.value, bestJ));
		if (maxedAmals && atData.magmite.finalAmals < bestAmals) break;
	}

	// if ratios are dropping per zone, fuel a little extra for safety's sake
	if (amalRatio[finalAmalZone] > amalRatio[finalAmalZone + 1]) {
		bestJ += Math.ceil(bestJ * 0.1);
	}

	// handwaving a less useless value here
	if (atData.magmite.finalAmals === 0) {
		bestJ = Math.min(10, settings.runEnd.value - 230);
	}

	setPageSetting('magmiteFuelZones', bestJ, 1);
	settings.fuelZones.update(bestJ);

	calculateFuelZones(true);
}

function calculateCoordIncrease() {
	const coordIncrease = 25 * Math.pow(0.98, atData.magmiteSettings.coord.value);
	const coordinations = [];
	coordinations[0] = 3;

	for (let i = 1; i <= 328; i++) {
		let c = Math.ceil((coordinations[i - 1] / 3) * (1 + coordIncrease / 100));
		c *= 3;
		coordinations[i] = c;
	}

	return [coordIncrease, coordinations];
}

function calculateMagma() {
	const zonesOfMI = atData.magmiteSettings.runEnd.value - 230 - atData.magmiteSettings.fuelZones.value;

	const magmaPerZone = atData.magmiteSettings.magmaFlow.value === 18 ? 18 : 16;
	const voidMagma = 10 * atData.magmiteSettings.voids.value * atData.magmiteSettings.expertGen.value;
	atData.magmite.totalMI = zonesOfMI * magmaPerZone + voidMagma;
	/* Not sure why this line existed. Leaving it here for now. */
	if (game.global.magmite > atData.magmite.totalMI) atData.magmite.totalMI = game.global.magmite;
}

function calculateCarpMod() {
	let { carp, carp2, scaffolding } = atData.magmiteSettings;
	carpMult = Math.pow(1.1, carp.value);
	carp2Mult = 1 + carp2.value * 0.0025;
	atData.magmite.carpMod = atData.magmite.minTick * carpMult * carp2Mult * scaffolding.value;
}

function calculateMinTick() {
	atData.magmite.minTick = Math.sqrt(atData.magmiteSettings.slowburn.value) * 5e8 * (1 + 0.1 * atData.magmiteSettings.efficiency.value);
	atData.magmite.tickRatio = atData.magmite.maxTick / atData.magmite.minTick;
	calculateCarpMod();
}

function calculateMaxTick() {
	atData.magmite.maxTick = Math.sqrt(atData.magmiteSettings.capacity.maxCapacity) * 5e8 * (1 + 0.1 * atData.magmiteSettings.efficiency.value);
	if (atData.magmite.minTick > 0) atData.magmite.tickRatio = atData.magmite.maxTick / atData.magmite.minTick;
}

function calculateCurrentPop() {
	const sum = [];
	const ar1 = 1e10;
	const ar2 = game.global.spiresCompleted >= 2 ? 1e9 : ar1;
	const ar3 = game.global.spiresCompleted >= 3 ? 1e8 : ar2;
	const ar4 = game.global.spiresCompleted >= 4 ? 1e7 : ar3;
	const ar5 = game.global.spiresCompleted >= 5 ? 1e6 : ar4;
	const arValues = [ar1, ar2, ar3, ar4, ar5];

	const fuelThisZone = [],
		totalFuel = [],
		overclockTicks = [],
		overclockPop = [],
		overclockPopThisZone = [];
	const popWithTauntimp = [],
		popFromTauntimp = [],
		percentFromTauntimp = [],
		tauntimpThisZone = [];
	const coordPop = [],
		amalRatio = [],
		adjustedRatio = [],
		currentAmals = [];
	const [coordIncrease, coordinations] = calculateCoordIncrease();

	let myHze = atData.magmiteSettings.runEnd.value;
	if (atData.magmiteSettings.hze.value > myHze) myHze = atData.magmiteSettings.hze.value;

	let tauntimpFrequency = 2.97;
	if (atData.magmiteSettings.randimp.value) tauntimpFrequency += 0.396;
	if (atData.magmiteSettings.moreImports.value) tauntimpFrequency += (atData.magmiteSettings.moreImports.value * 0.05 * 99) / 100; // inc chance * possible import cells / world cells

	// base CI on end zone
	const confInterval = 1 - 1.91 / Math.sqrt((atData.magmiteSettings.runEnd.value - atData.magmiteSettings.fuelStart.value) * tauntimpFrequency);

	//calc fuel gain
	for (let i = 0; i <= myHze - 200; i++) {
		if (i === 0) fuelThisZone[0] = 0.2;
		else fuelThisZone[i] = Math.min(fuelThisZone[i - 1] + 0.01, atData.magmiteSettings.supply.maxSupply);

		if (i + 230 >= atData.magmiteSettings.fuelStart.value && i + 230 <= atData.magmiteSettings.fuelEnd.value) {
			if (i === 0) totalFuel[0] = 0.2;
			else totalFuel[i] = atData.magmiteSettings.magmaFlow.value * fuelThisZone[i] + totalFuel[i - 1];
		} else {
			totalFuel[i] = 0;
		}

		//calc generated pop
		overclockTicks[i] = Math.max((totalFuel[i] - atData.magmiteSettings.storage.value * atData.magmiteSettings.capacity.maxCapacity) / atData.magmiteSettings.slowburn.value, 0);
		overclockPop[i] = Math.floor(overclockTicks[i]) * (atData.magmite.carpMod * atData.magmite.tickRatio) * atData.magmiteSettings.overclocker.bonus;
		if (i === 0) overclockPopThisZone[0] = Math.max(overclockPop[0], 0);
		else overclockPopThisZone[i] = Math.max(overclockPop[i] - overclockPop[i - 1], 0);

		//calc tauntimp pop
		if (i === 0) popWithTauntimp[0] = Math.floor(overclockPopThisZone[0] * Math.pow(1.003, tauntimpFrequency));
		else popWithTauntimp[i] = Math.floor((overclockPopThisZone[i] + popWithTauntimp[i - 1]) * Math.pow(1.003, tauntimpFrequency * confInterval));

		//calc pop stats
		if (i === 0) sum[0] = overclockPopThisZone[0];
		else sum[i] = overclockPopThisZone[i] + sum[i - 1];

		popFromTauntimp[i] = popWithTauntimp[i] - sum[i];
		if (popWithTauntimp[i] > 0) percentFromTauntimp[i] = popFromTauntimp[i] / popWithTauntimp[i];
		else percentFromTauntimp[i] = 0;

		if (i === 0) tauntimpThisZone[0] = 0;
		else tauntimpThisZone[i] = popFromTauntimp[i] - popFromTauntimp[i - 1];

		//calc army size
		if (i === 0) coordPop[0] = Math.ceil((coordinations[coordinations.length - 1] / 3) * (1 + coordIncrease / 100)) * 3;
		else coordPop[i] = Math.ceil((coordPop[i - 1] / 3) * (1 + coordIncrease / 100)) * 3;

		//calc gators
		amalRatio[i] = popWithTauntimp[i] / (coordPop[i] / 3);

		if (i === 0) {
			currentAmals[0] = 0;
		} else if ((i - 1) % 5 !== 0 || (i - 71) % 100 === 0) {
			currentAmals[i] = currentAmals[i - 1];
		} else {
			const arIndex = Math.min(Math.floor((i - 1) / 100), arValues.length - 1);
			const ar = Math.max(arValues[arIndex], atData.magmite.finalAmalRatio);

			if (adjustedRatio[i - 1] > ar) {
				currentAmals[i] = currentAmals[i - 1] + 1;
			} else if (adjustedRatio[i - 1] < 1000) {
				currentAmals[i] = currentAmals[i - 1] - 1;
			} else {
				currentAmals[i] = currentAmals[i - 1];
			}
		}

		if (currentAmals[i] < 0) currentAmals[i] = 0;
		adjustedRatio[i] = amalRatio[i] / Math.pow(1000, currentAmals[i]);
	}

	atData.magmite.totalPop = popWithTauntimp[atData.magmiteSettings.runEnd.value - 230];
	atData.magmite.finalAmals = currentAmals[atData.magmiteSettings.runEnd.value - 230];
	atData.magmite.maxAmals = 0;

	for (let i = 0; i <= atData.magmiteSettings.runEnd.value - 230; i++) {
		if (currentAmals[i] > atData.magmite.maxAmals) {
			atData.magmite.maxAmals = currentAmals[i];
			atData.magmite.finalAmalZone = i + 230;
		}
	}

	atData.magmite.neededPop = coordPop[atData.magmiteSettings.runEnd.value - 230] / 3;
	atData.magmite.finalArmySize = atData.magmite.neededPop * Math.pow(1000, atData.magmite.finalAmals);
	atData.magmite.yourFinalRatio = atData.magmite.totalPop / atData.magmite.finalArmySize;
	atData.magmite.amalRatio = amalRatio;
}

function checkDGUpgrades() {
	const settings = atData.magmiteSettings;
	const myStart = settings.fuelStart.value;
	const myEnd = settings.fuelEnd.value;
	const myRunEnd = settings.runEnd.value;
	let { totalPop, totalMI } = atData.magmite;

	const upgradesNames = ['efficiency', 'capacity', 'supply'];
	const overclockerUnlocked = game.permanentGeneratorUpgrades.Hybridization.owned && game.permanentGeneratorUpgrades.Storage.owned;
	if (overclockerUnlocked) upgradesNames.push('overclocker');

	const baseCost = [8, 32, 64, 32];
	const hzeValue = settings.hze.value > 0 ? settings.hze.value : settings.runEnd.value;
	const magmiteDecay = settings.decay.value;

	settings.fuelStart.update(230);
	if (settings.hze.value > 0) settings.runEnd.update(hzeValue);
	settings.fuelEnd.update(hzeValue);

	const efficiencyVariables = upgradesNames.map((upgrade) => {
		settings[upgrade].update(settings[upgrade].value + 1);
		const efficiency = atData.magmite.totalPop - totalPop;
		settings[upgrade].update(settings[upgrade].value - 1);
		return efficiency;
	});

	let runsNeeded = 2;
	let checkMi = totalMI;

	let oneTimersMi = totalMI;
	const oneTimers = ['Hybridization', 'Storage', 'Shielding', 'Slowburn', 'Simulacrum'];
	const oneTimerRuns = getPageSetting('magmiteOneTimerRuns', 1);

	while (oneTimerRuns > runsNeeded) {
		oneTimersMi *= magmiteDecay;
		oneTimersMi += totalMI;
		runsNeeded++;
	}

	const affordableUpgrades = oneTimers.filter((upgrade) => {
		const upgradeData = game.permanentGeneratorUpgrades[upgrade];
		if (upgrade === 'Hybridization' && !game.permanentGeneratorUpgrades.Storage.owned) return false;
		return !upgradeData.owned && upgradeData.cost <= oneTimersMi;
	});

	if (affordableUpgrades.length > 0) {
		settings.runEnd.update(myRunEnd);
		settings.fuelStart.update(myStart);
		settings.fuelEnd.update(myEnd);
		return affordableUpgrades[0];
	}

	const totalMi = totalMI;
	const totalRuns = getPageSetting('magmiteUpgradeRuns', 1);
	runsNeeded = 1;
	while (totalRuns > runsNeeded) {
		checkMi *= magmiteDecay;
		checkMi += totalMi;
		if (checkMi > totalMI) atData.magmite.totalMI = checkMi;
		runsNeeded++;
	}

	totalMI = atData.magmite.totalMI;

	upgradesNames.forEach((upgrade, i) => {
		let cost = settings[upgrade].cost;
		if (cost > totalMI * 4.9) {
			settings[upgrade].cost = -1;
		} else if (cost * 2 + baseCost[i] <= totalMI) {
		} else if (cost <= totalMI) {
			settings[upgrade].cost += (totalMI - cost) * 0.2;
		} else {
			let runsNeeded = 1;
			while (cost > totalMI) {
				settings[upgrade].cost += totalMI;
				cost -= totalMI * Math.pow(magmiteDecay, runsNeeded);
				runsNeeded++;
				if (runsNeeded > totalRuns) {
					break;
				}
			}
			settings[upgrade].cost += (totalMI - cost) * 0.2;
		}

		efficiencyVariables[i] /= settings[upgrade].cost;
	});

	upgradesNames.forEach((upgrade, i) => {
		const cost = settings[upgrade].cost;
		settings[upgrade].efficiency = totalMI > cost ? efficiencyVariables[i] / efficiencyVariables[0] : 0;
	});

	if (overclockerUnlocked && game.generatorUpgrades.Overclocker.upgrades === 0) {
		const cost = settings.overclocker.cost;
		if (totalMi >= cost) settings.overclocker.efficiency = Infinity;
	}

	const finalResult = upgradesNames.map((upgradesNames) => settings[upgradesNames].efficiency);

	const upgradeIndex = finalResult.indexOf(Math.max(...finalResult));
	settings.runEnd.update(myRunEnd);
	settings.fuelStart.update(myStart);
	settings.fuelEnd.update(myEnd);

	return ['Efficiency', 'Capacity', 'Supply', 'Overclocker'][upgradeIndex];
}

function _getMagmiteData() {
	const oneTimers = ['Hybridization', 'Storage', 'Shielding', 'Slowburn', 'Simulacrum'];
	const upgrades = ['Efficiency', 'Capacity', 'Supply', 'Overclocker'];
	const upgradeLocation = 'generatorUpgrades';
	const oneTimerLocation = 'permanentGeneratorUpgrades';

	const upgradeData = {
		oneTimers: {},
		upgrades: {}
	};

	oneTimers.forEach((item) => {
		upgradeData.oneTimers[item] = game[oneTimerLocation][item].owned;
	});

	upgrades.forEach((item) => {
		upgradeData.upgrades[item] = game[upgradeLocation][item].upgrades;
	});

	return upgradeData;
}

function autoMagmiteSpender(portal) {
	if (game.global.universe !== 1) return;

	if (portalWindowOpen || portal) calculateFuelZones(); /* set fuel zones when portaling */

	const magmiteSetting = getPageSetting('magmiteSpending', 1);
	if (portal && (magmiteSetting !== 1 || !portalWindowOpen)) return;

	const initialMagmite = game.global.magmite;
	const oneTimers = ['Hybridization', 'Storage', 'Shielding', 'Slowburn', 'Simulacrum'];
	const upgrades = ['Efficiency', 'Capacity', 'Supply', 'Overclocker'];
	const initiaUpgrades = _getMagmiteData();

	let boughtUpgrade = false;
	do {
		boughtUpgrade = _autoMagmiteCalc();
	} while (boughtUpgrade);

	if (initialMagmite !== game.global.magmite) {
		const newUpgrades = _getMagmiteData();

		const oneTimersChanged = oneTimers.some((item) => initiaUpgrades.oneTimers[item] !== newUpgrades.oneTimers[item]);
		const upgradesChanged = upgrades.some((item) => initiaUpgrades.upgrades[item] !== newUpgrades.upgrades[item]);

		if (oneTimersChanged || upgradesChanged) {
			const spentMagmite = initialMagmite - game.global.magmite;
			let purchasedText = `Spent ${spentMagmite} Magmite on `;
			if (oneTimersChanged) {
				const purchasedOneTimers = oneTimers.filter((item) => initiaUpgrades.oneTimers[item] !== newUpgrades.oneTimers[item]);
				purchasedText += `${purchasedOneTimers.join(', ')}`;
			}

			if (upgradesChanged) {
				const purchasedUpgrades = upgrades.filter((item) => initiaUpgrades.upgrades[item] !== newUpgrades.upgrades[item]).map((item) => `${item} (+${newUpgrades.upgrades[item] - initiaUpgrades.upgrades[item]})`);
				if (oneTimersChanged) purchasedText += ' and ';
				purchasedText += `${purchasedUpgrades.join(', ')}`;
			}

			purchasedText += '.';

			if (portal) return purchasedText;
			else debug(purchasedText, 'magmite');
		}
	}
}

function _autoMagmiteCalc() {
	miRatio();
	const toSpend = atData.magmite.upgradeToPurchase;
	if (toSpend === '') return false;

	const oneTimers = ['Hybridization', 'Storage', 'Shielding', 'Slowburn', 'Simulacrum'];
	const isOneTimeUpgrade = oneTimers.includes(toSpend);
	const upgradeLocation = isOneTimeUpgrade ? 'permanentGeneratorUpgrades' : 'generatorUpgrades';

	const upgrader = game[upgradeLocation][toSpend];
	if (!upgrader) return false;

	const cost = typeof upgrader.cost === 'function' ? upgrader.cost() : upgrader.cost;
	if (game.global.magmite < cost) return false;

	buyGeneratorUpgrade(toSpend);
	atData.magmite.upgradeToPurchase = '';
	return true;
}

function autoGenerator() {
	if (!getPageSetting('autoGen', 1) || game.global.world < 230) return;

	const dailySetting = getPageSetting('autoGenModeDaily');
	if (trimpStats.isDaily && dailySetting !== 0) {
		if (game.global.generatorMode !== dailySetting) changeGeneratorState(dailySetting);
		return;
	}

	const c2Setting = getPageSetting('autoGenModeC2');
	if (trimpStats.isC3 && c2Setting !== 0) {
		if (game.global.generatorMode !== c2Setting) changeGeneratorState(c2Setting);
		return;
	}

	const beforeFuelState = getPageSetting('autoGenModeBefore');
	const afterFuelState = getPageSetting('autoGenModeAfter');
	const fuelStart = getPageSetting('autoGenFuelStart');
	const fuelEnd = getPageSetting('autoGenFuelEnd');
	let fuelState = 1;

	if (fuelStart < 0 || game.global.world < fuelStart) {
		fuelState = beforeFuelState;
		if (beforeFuelState === 2 && !game.permanentGeneratorUpgrades.Hybridization.owned) {
			fuelState = game.global.generatorMode;
			if (game.global.world === 230 && game.global.lastClearedCell < 14) fuelState = 1;
			if (game.global.magmaFuel >= getGeneratorFuelCap(false, true)) fuelState = 0;
		}
	}
	// Fuel
	else if (fuelEnd < 0 || game.global.world < fuelEnd) {
		if (game.generatorUpgrades.Overclocker.upgrades === 0) {
			if (game.permanentGeneratorUpgrades.Hybridization.owned) fuelState = 2;
			else if (game.global.magmaFuel === getGeneratorFuelCap(false, true)) fuelState = 0;
		}
	}
	// After Fuel
	else {
		fuelState = afterFuelState;
		if (afterFuelState === 2 && !game.permanentGeneratorUpgrades.Hybridization.owned) {
			fuelState = game.global.generatorMode;
			if (game.global.world === 230 && game.global.lastClearedCell < 14) fuelState = 1;
			if (game.global.magmaFuel === getGeneratorFuelCap(false, true)) fuelState = 0;
		}
	}

	if (game.global.generatorMode !== fuelState) changeGeneratorState(fuelState);
}
