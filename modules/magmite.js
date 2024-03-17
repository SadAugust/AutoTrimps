function miRatio() {
	if (MODULES.magmite && MODULES.magmite.upgradeToPurchase !== '' && MODULES.magmite.upgradeToPurchase !== undefined) return;

	MODULES.magmite = {
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
		finalResult: [],
		upgradeToPurchase: ''
	};

	const fuelStart = Math.max(230, getPageSetting('fuellater', 1));
	const fuelEnd = Math.min(810, getPageSetting('fuelend', 1));

	MODULES.magmiteSettings = {
		//runstats
		fuelStart: {
			value: fuelStart,
			update: function (value = this.value) {
				const { fuelEnd, runEnd, fuelZones } = MODULES.magmiteSettings;
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
				const { fuelStart, runEnd, fuelZones } = MODULES.magmiteSettings;
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
				const { fuelStart, fuelEnd } = MODULES.magmiteSettings;
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
		randimp: { value: game.talents.magimp.purchased },
		magmaFlow: { value: game.talents.magmaFlow.purchased ? 18 : 16 },
		expertGen: { value: game.talents.quickGen.purchased ? 1 : 0 },
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
	MODULES.magmite.upgradeToPurchase = checkDGUpgrades();
}

function calculateMagmaZones(refresh = false) {
	if (game.global.universe !== 1 || !getPageSetting('magmiteAutoFuel')) return;
	if (!refresh) miRatio();
	const myFuelZones = getPageSetting('magmiteFuelZones', 1);
	let bestAmals = MODULES.magmite.maxAmals;
	MODULES.magmiteSettings.fuelStart.update(230);
	let bestPop = 0;
	let myFuelStart = 230;

	for (let f = 230; f <= MODULES.magmiteSettings.runEnd.value - myFuelZones; f++) {
		MODULES.magmiteSettings.fuelStart.update(f);
		MODULES.magmiteSettings.fuelZones.update(myFuelZones);
		if (MODULES.magmite.totalPop > bestPop && MODULES.magmite.maxAmals >= bestAmals) {
			bestPop = MODULES.magmite.totalPop;
			myFuelStart = f;
			bestAmals = Math.max(MODULES.magmite.maxAmals, bestAmals); // max pop is not always max gators
		}
	}

	MODULES.magmiteSettings.fuelStart.update(myFuelStart);
	MODULES.magmiteSettings.fuelZones.update(myFuelZones);
	MODULES.magmiteSettings.fuelEnd.update();

	setPageSetting('fuellater', MODULES.magmiteSettings.fuelStart.value, 1);
	setPageSetting('fuelend', MODULES.magmiteSettings.fuelEnd.value, 1);
}

function minimize() {
	const settings = MODULES.magmiteSettings;
	const magmite = MODULES.magmite;
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
		while (MODULES.magmite.finalAmals > 0 && MODULES.magmite.finalAmals >= bestAmals && settings.fuelZones.value > 0) {
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
		if (maxedAmals && MODULES.magmite.finalAmals < bestAmals) break;
	}

	// if ratios are dropping per zone, fuel a little extra for safety's sake
	if (amalRatio[finalAmalZone] > amalRatio[finalAmalZone + 1]) {
		bestJ += Math.ceil(bestJ * 0.1);
	}

	// handwaving a less useless value here
	if (MODULES.magmite.finalAmals === 0) {
		bestJ = Math.min(10, settings.runEnd.value - 230);
	}

	setPageSetting('magmiteFuelZones', bestJ, 1);
	settings.fuelZones.update(bestJ);

	calculateMagmaZones(true);
}

function calculateCoordIncrease() {
	const coordIncrease = 25 * Math.pow(0.98, MODULES.magmiteSettings.coord.value);
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
	const zonesOfMI = MODULES.magmiteSettings.runEnd.value - 230 - MODULES.magmiteSettings.fuelZones.value;

	const magmaPerZone = MODULES.magmiteSettings.magmaFlow.value === 18 ? 18 : 16;
	const voidMagma = 10 * MODULES.magmiteSettings.voids.value * MODULES.magmiteSettings.expertGen.value;
	MODULES.magmite.totalMI = zonesOfMI * magmaPerZone + voidMagma;
	/* Not sure why this line existed. Leaving it here for now. */
	if (game.global.magmite > MODULES.magmite.totalMI) MODULES.magmite.totalMI = game.global.magmite;
}

function calculateCarpMod() {
	const { carp, carp2, scaffolding } = MODULES.magmiteSettings;
	const carpMult = Math.pow(1.1, carp.value);
	const carp2Mult = 1 + carp2.value * 0.0025;
	MODULES.magmite.carpMod = MODULES.magmite.minTick * carpMult * carp2Mult * scaffolding.value;
}

function calculateMinTick() {
	MODULES.magmite.minTick = Math.sqrt(MODULES.magmiteSettings.slowburn.value) * 5e8 * (1 + 0.1 * MODULES.magmiteSettings.efficiency.value);
	MODULES.magmite.tickRatio = MODULES.magmite.maxTick / MODULES.magmite.minTick;
	calculateCarpMod();
}

function calculateMaxTick() {
	MODULES.magmite.maxTick = Math.sqrt(MODULES.magmiteSettings.capacity.maxCapacity) * 5e8 * (1 + 0.1 * MODULES.magmiteSettings.efficiency.value);
	if (MODULES.magmite.minTick > 0) MODULES.magmite.tickRatio = MODULES.magmite.maxTick / MODULES.magmite.minTick;
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

	let myHze = MODULES.magmiteSettings.runEnd.value;
	if (MODULES.magmiteSettings.hze.value > myHze) myHze = MODULES.magmiteSettings.hze.value;

	let tauntimpFrequency = 2.97;
	if (MODULES.magmiteSettings.randimp.value) tauntimpFrequency += 0.396;
	if (MODULES.magmiteSettings.moreImports.value) tauntimpFrequency += (MODULES.magmiteSettings.moreImports.value * 0.05 * 99) / 100; // inc chance * possible import cells / world cells

	// base CI on end zone
	const confInterval = 1 - 1.91 / Math.sqrt((MODULES.magmiteSettings.runEnd.value - MODULES.magmiteSettings.fuelStart.value) * tauntimpFrequency);

	//calc fuel gain
	for (let i = 0; i <= myHze - 200; i++) {
		if (i === 0) fuelThisZone[0] = 0.2;
		else fuelThisZone[i] = Math.min(fuelThisZone[i - 1] + 0.01, MODULES.magmiteSettings.supply.maxSupply);

		if (i + 230 >= MODULES.magmiteSettings.fuelStart.value && i + 230 <= MODULES.magmiteSettings.fuelEnd.value) {
			if (i === 0) totalFuel[0] = 0.2;
			else totalFuel[i] = MODULES.magmiteSettings.magmaFlow.value * fuelThisZone[i] + totalFuel[i - 1];
		} else {
			totalFuel[i] = 0;
		}

		//calc generated pop
		overclockTicks[i] = Math.max((totalFuel[i] - MODULES.magmiteSettings.storage.value * MODULES.magmiteSettings.capacity.maxCapacity) / MODULES.magmiteSettings.slowburn.value, 0);
		overclockPop[i] = Math.floor(overclockTicks[i]) * (MODULES.magmite.carpMod * MODULES.magmite.tickRatio) * MODULES.magmiteSettings.overclocker.bonus;
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
			const ar = Math.max(arValues[arIndex], MODULES.magmite.finalAmalRatio);

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

	MODULES.magmite.totalPop = popWithTauntimp[MODULES.magmiteSettings.runEnd.value - 230];
	MODULES.magmite.finalAmals = currentAmals[MODULES.magmiteSettings.runEnd.value - 230];
	MODULES.magmite.maxAmals = 0;

	for (let i = 0; i <= MODULES.magmiteSettings.runEnd.value - 230; i++) {
		if (currentAmals[i] > MODULES.magmite.maxAmals) {
			MODULES.magmite.maxAmals = currentAmals[i];
			MODULES.magmite.finalAmalZone = i + 230;
		}
	}

	MODULES.magmite.neededPop = coordPop[MODULES.magmiteSettings.runEnd.value - 230] / 3;
	MODULES.magmite.finalArmySize = MODULES.magmite.neededPop * Math.pow(1000, MODULES.magmite.finalAmals);
	MODULES.magmite.yourFinalRatio = MODULES.magmite.totalPop / MODULES.magmite.finalArmySize;
	MODULES.magmite.amalRatio = amalRatio;
}

function checkDGUpgrades() {
	const settings = MODULES.magmiteSettings;
	const myStart = settings.fuelStart.value;
	const myEnd = settings.fuelEnd.value;
	const myRunEnd = settings.runEnd.value;
	const { totalPop, totalMI } = MODULES.magmite;

	const upgradesNames = ['efficiency', 'capacity', 'supply', 'overclocker'];
	const totalRuns = 10;
	const baseCost = [8, 32, 64, 32];
	const hzeValue = settings.hze.value > 0 ? settings.hze.value : settings.runEnd.value;
	const magmiteDecay = settings.decay.value;

	settings.fuelStart.update(230);
	if (settings.hze.value > 0) settings.runEnd.update(hzeValue);
	settings.fuelEnd.update(hzeValue);

	const efficiencyVariables = upgradesNames.map((upgrade) => {
		settings[upgrade].update(settings[upgrade].value + 1);
		const efficiency = MODULES.magmite.totalPop - totalPop;
		settings[upgrade].update(settings[upgrade].value - 1);
		return efficiency;
	});

	let totalMi = totalMI;
	let checkMi = totalMI;
	let runsNeeded = 2;

	while (totalRuns > runsNeeded) {
		checkMi *= magmiteDecay;
		checkMi += totalMI;
		if (checkMi > totalMi) totalMi = checkMi;
		runsNeeded++;
	}

	upgradesNames.forEach((upgrade, i) => {
		let cost = settings[upgrade].cost;

		if (cost > totalMI * 4.9) {
			settings[upgrade].cost = -1;
		} else if (cost * 2 + baseCost[i] <= totalMI) {
			return;
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
		settings[upgrade].efficiency = totalMi > cost ? efficiencyVariables[i] / efficiencyVariables[0] : 0;
	});

	MODULES.magmite.finalResult = upgradesNames.map((upgradesNames) => settings[upgradesNames].efficiency);

	const upgradeIndex = MODULES.magmite.finalResult.indexOf(Math.max(...MODULES.magmite.finalResult));
	settings.runEnd.update(myRunEnd);
	settings.fuelStart.update(myStart);
	settings.fuelEnd.update(myEnd);

	return ['Efficiency', 'Capacity', 'Supply', 'Overclocker'][upgradeIndex];
}

function autoMagmiteSpender(portal) {
	if (game.global.universe !== 1) return;
	//Set Fuel zones when portaling
	if (portalWindowOpen) calculateMagmaZones();

	const magmiteSetting = getPageSetting('spendmagmite', 1);
	if (portal && (magmiteSetting !== 1 || !portalWindowOpen)) return;

	let boughtUpgrade = false;
	if (getPageSetting('ratiospend', 1)) {
		do {
			boughtUpgrade = _autoMagmiteCalc();
		} while (boughtUpgrade);
	} else {
		try {
			const permanames = ['Slowburn', 'Shielding', 'Storage', 'Hybridization', 'Supervision', 'Simulacrum'];

			for (let i = 0; i < permanames.length; i++) {
				const item = permanames[i];
				const upgrade = game.permanentGeneratorUpgrades[item];
				if (typeof upgrade === 'undefined') return;
				if (upgrade.owned) continue;
				const cost = upgrade.cost;

				if (game.global.magmite >= cost) {
					buyPermanentGeneratorUpgrade(item);
					debug(`Auto Spending ${cost} magmite on: ${item}`, 'magmite');
					boughtUpgrade = true;
				}
			}

			const hasOv = game.permanentGeneratorUpgrades.Hybridization.owned && game.permanentGeneratorUpgrades.Storage.owned;
			const ovclock = game.generatorUpgrades.Overclocker;

			if (hasOv && (getPageSetting('spendmagmitesetting', 1) === 0 || getPageSetting('spendmagmitesetting', 1) === 3 || !ovclock.upgrades) && game.global.magmite >= ovclock.cost()) {
				debug(`Auto Spending ${ovclock.cost()} Magmite on: Overclocker${ovclock.upgrades ? ` #${ovclock.upgrades + 1}` : ''}`, 'magmite');
				buyGeneratorUpgrade('Overclocker');
			}

			let repeat = getPageSetting('spendmagmitesetting', 1) === 0 || getPageSetting('spendmagmitesetting', 1) === 1;
			while (repeat) {
				const eff = game.generatorUpgrades['Efficiency'];
				const cap = game.generatorUpgrades['Capacity'];
				const sup = game.generatorUpgrades['Supply'];
				if (typeof eff === 'undefined' || typeof cap === 'undefined' || typeof sup === 'undefined') return;

				const EffObj = {};
				EffObj.name = 'Efficiency';
				EffObj.lvl = eff.upgrades + 1;
				EffObj.cost = eff.cost();
				EffObj.benefit = EffObj.lvl * 0.1;
				EffObj.effInc = ((1 + EffObj.benefit) / (1 + (EffObj.lvl - 1) * 0.1) - 1) * 100;
				EffObj.miCostPerPct = EffObj.cost / EffObj.effInc;

				const CapObj = {};
				CapObj.name = 'Capacity';
				CapObj.lvl = cap.upgrades + 1;
				CapObj.cost = cap.cost();
				CapObj.totalCap = 3 + 0.4 * CapObj.lvl;
				CapObj.benefit = Math.sqrt(CapObj.totalCap);
				CapObj.effInc = (CapObj.benefit / Math.sqrt(3 + 0.4 * (CapObj.lvl - 1)) - 1) * 100;
				CapObj.miCostPerPct = CapObj.cost / CapObj.effInc;
				let upgrade, item;

				if (EffObj.miCostPerPct <= CapObj.miCostPerPct) {
					item = EffObj.name;
				} else {
					const supCost = sup.cost();
					const wall = getPageSetting('SupplyWall', 1);
					if (!wall) item = CapObj.cost <= supCost ? CapObj.name : 'Supply';
					else if (wall === 1) item = 'Capacity';
					else if (wall < 0) item = supCost <= CapObj.cost * -wall ? 'Supply' : 'Capacity';
					else item = CapObj.cost <= supCost * wall ? 'Capacity' : 'Supply';
				}

				upgrade = game.generatorUpgrades[item];

				if (game.global.magmite >= upgrade.cost()) {
					debug(`Auto Spending ${upgrade.cost()} Magmite on: ${item} #${game.generatorUpgrades[item].upgrades + 1}`, 'magmite');
					buyGeneratorUpgrade(item);
					boughtUpgrade = true;
				} else {
					repeat = false;
				}
			}
		} catch (err) {
			debug(`AutoSpendMagmite Error encountered: ${err.message}`, 'magmite');
		}
	}
	if (boughtUpgrade) debug(`Leftover magmite: ${game.global.magmite}`, 'magmite');
}

function _autoMagmiteCalc() {
	miRatio();
	const toSpend = MODULES.magmite.upgradeToPurchase;
	if (toSpend === '') return false;

	const upgrader = game.generatorUpgrades[toSpend];
	if (upgrader === undefined || game.global.magmite < upgrader.cost()) return false;

	debug(`Spending ${upgrader.cost()} Magmite on: ${toSpend} #${game.generatorUpgrades[toSpend].upgrades + 1}`, 'magmite');
	buyGeneratorUpgrade(toSpend);
	MODULES.magmite.upgradeToPurchase = '';
	return true;
}

function autoGenerator() {
	if (!getPageSetting('UseAutoGen', 1) || game.global.world < 230) return;

	const dailySetting = getPageSetting('AutoGenDC');
	if (trimpStats.isDaily && dailySetting !== 0) {
		if (game.global.generatorMode !== dailySetting) changeGeneratorState(dailySetting);
		return;
	}

	const c2Setting = getPageSetting('AutoGenC2');
	if (trimpStats.isC3 && c2Setting !== 0) {
		if (game.global.generatorMode !== c2Setting) changeGeneratorState(c2Setting);
		return;
	}

	const beforeFuelState = getPageSetting('beforegen');
	const afterFuelState = getPageSetting('defaultgen');
	const fuelLater = getPageSetting('fuellater');
	const fuelEnd = getPageSetting('fuelend');
	let fuelState = 1;

	if (fuelLater < 0 || game.global.world < fuelLater) {
		//Pseudo-Hybrid. It fuels until full, then goes into Mi mode
		fuelState = beforeFuelState;
		if (beforeFuelState === 2 && !game.permanentGeneratorUpgrades.Hybridization.owned) {
			fuelState = game.global.generatorMode;
			if (game.global.world === 230 && game.global.lastClearedCell < 14) fuelState = 1;
			if (game.global.magmaFuel >= getGeneratorFuelCap(false, true)) fuelState = 0;
		}
	}
	//Fuel
	else if (fuelEnd < 0 || game.global.world < fuelEnd) {
		if (game.generatorUpgrades.Overclocker.upgrades === 0) {
			if (game.permanentGeneratorUpgrades.Hybridization.owned) fuelState = 2;
			else {
				if (game.global.magmaFuel === getGeneratorFuelCap(false, true)) fuelState = 0;
			}
		}
	}
	//After Fuel
	else {
		//Pseudo-Hybrid. It fuels until full, then goes into Mi mode
		fuelState = afterFuelState;
		if (afterFuelState === 2 && !game.permanentGeneratorUpgrades.Hybridization.owned) {
			fuelState = game.global.generatorMode;
			if (game.global.world === 230 && game.global.lastClearedCell < 14) fuelState = 1;
			if (game.global.magmaFuel === getGeneratorFuelCap(false, true)) fuelState = 0;
		}
	}

	if (game.global.generatorMode !== fuelState) changeGeneratorState(fuelState);
}
