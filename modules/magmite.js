function miRatio() {
	if (MODULES.magmite && MODULES.magmite.upgradeToPurchase !== '' && MODULES.magmite.upgradeToPurchase !== undefined) return;
	MODULES.magmite = {};
	MODULES.magmite.carpMod = 0;
	MODULES.magmite.minTick = 0;
	MODULES.magmite.maxTick = 0;
	MODULES.magmite.tickRatio = 0;

	MODULES.magmite.totalPop = 0;
	MODULES.magmite.finalAmals = 0;
	MODULES.magmite.maxAmals = 0;
	MODULES.magmite.finalAmalZone = 0;
	MODULES.magmite.neededPop = 0;
	MODULES.magmite.finalArmySize = 0;
	MODULES.magmite.finalAmalRatio = 0;
	MODULES.magmite.yourFinalRatio = 0;
	MODULES.magmite.totalMI = 0;
	MODULES.magmite.finalResult = [];
	MODULES.magmite.upgradeToPurchase = '';
	MODULES.magmiteSettings = {};

	const fuelStart = Math.max(230, getPageSetting('fuellater', 1));
	const fuelEnd = Math.min(810, getPageSetting('fuelend', 1));
	MODULES.magmiteSettings = {
		//runstats
		fuelStart: {
			value: fuelStart,
			update: function (value = this.value) {
				this.value = parseInt(value);
				if (this.value < 230) this.value = 230;
				if (this.value > MODULES.magmiteSettings.fuelEnd.value) MODULES.magmiteSettings.fuelEnd.value = this.value;
				if (this.value > MODULES.magmiteSettings.runEnd.value) MODULES.magmiteSettings.runEnd.value = this.value;
				MODULES.magmiteSettings.fuelZones.update(MODULES.magmiteSettings.fuelEnd.value - this.value);
				calculateCurrentPop();
			}
		},
		fuelEnd: {
			value: fuelEnd,
			update: function (value = this.value) {
				this.value = parseInt(value);
				if (this.value < MODULES.magmiteSettings.fuelStart.value) MODULES.magmiteSettings.fuelStart.value = this.value;
				if (this.value > MODULES.magmiteSettings.runEnd.value) MODULES.magmiteSettings.runEnd.value = this.value;
				if (MODULES.magmiteSettings.fuelZones.value !== this.value - MODULES.magmiteSettings.fuelStart.value) MODULES.magmiteSettings.fuelZones.update(this.value - MODULES.magmiteSettings.fuelStart.value);
				calculateCurrentPop();
			}
		},
		fuelZones: {
			value: fuelEnd - fuelStart,
			update: function (value = this.value) {
				this.value = parseInt(value);
				if (MODULES.magmiteSettings.fuelEnd.value !== MODULES.magmiteSettings.fuelStart.value + this.value) MODULES.magmiteSettings.fuelEnd.update(MODULES.magmiteSettings.fuelStart.value + this.value);
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
				this.value = value < 231 ? 231 : value;
			}
		}
	};

	calculateMagma();
	calculateMaxTick();
	calculateMinTick();
	calculateCurrentPop();
	MODULES.magmite.upgradeToPurchase = checkDGUpgrades();
}

function calculateMagmaZones() {
	if (game.global.universe !== 1) return;
	if (!getPageSetting('magmiteAutoFuel')) return;
	miRatio();
	var myFuelZones = getPageSetting('magmiteFuelZones', 1);
	var bestAmals = MODULES.magmite.maxAmals;
	MODULES.magmiteSettings.fuelStart.update(230, false);
	var bestPop = 0;
	var myFuelStart = 230;
	for (f = 230; f <= MODULES.magmiteSettings.runEnd.value - myFuelZones; f++) {
		MODULES.magmiteSettings.fuelStart.update(f, false);
		MODULES.magmiteSettings.fuelZones.update(myFuelZones, false);
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

function calculateCoordIncrease() {
	var coordIncrease = 25 * Math.pow(0.98, MODULES.magmiteSettings.coord.value);
	var coordinations = [];
	coordinations[0] = 3;
	var c = 0;
	for (i = 1; i <= 328; i++) {
		c = Math.ceil((coordinations[i - 1] / 3) * (1 + coordIncrease / 100));
		c *= 3;
		coordinations[i] = c;
	}
	return [coordIncrease, coordinations];
}

function calculateMagma() {
	const zonesOfMI = MODULES.magmiteSettings.runEnd.value - 230 - MODULES.magmiteSettings.fuelZones.value;
	if (MODULES.magmiteSettings.magmaFlow.value === 18) MODULES.magmite.totalMI = zonesOfMI * 18;
	else MODULES.magmite.totalMI = zonesOfMI * 16;
	MODULES.magmite.totalMI += 10 * MODULES.magmiteSettings.voids.value * MODULES.magmiteSettings.expertGen.value;

	if (game.global.magmite > MODULES.magmite.totalMI) MODULES.magmite.totalMI = game.global.magmite;
}

function calculateCarpMod() {
	MODULES.magmite.carpMod = MODULES.magmite.minTick * Math.pow(1.1, MODULES.magmiteSettings.carp.value) * (1 + MODULES.magmiteSettings.carp2.value * 0.0025) * (MODULES.magmiteSettings.scaffolding.value * Math.pow(1.1, MODULES.magmiteSettings.scaffolding.value - 1));
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
	var sum = [];
	var ar1 = 1e10;
	var ar2 = game.global.spiresCompleted >= 2 ? 1e9 : ar1;
	var ar3 = game.global.spiresCompleted >= 3 ? 1e8 : ar2;
	var ar4 = game.global.spiresCompleted >= 4 ? 1e7 : ar3;
	var ar5 = game.global.spiresCompleted >= 5 ? 1e6 : ar4;

	let uncoords = 0,
		uncoordsZone = -1,
		uncoordsGoal = 1;
	let fuelThisZone = [],
		totalFuel = [],
		overclockTicks = [],
		overclockPop = [],
		overclockPopThisZone = [];
	let popWithTauntimp = [],
		popFromTauntimp = [],
		percentFromTauntimp = [],
		tauntimpThisZone = [];
	let coordPop = [],
		amalRatio = [],
		adjustedRatio = [],
		currentAmals = [];
	let [coordIncrease, coordinations] = calculateCoordIncrease();

	let myHze = MODULES.magmiteSettings.runEnd.value;
	if (MODULES.magmiteSettings.hze.value > myHze) myHze = MODULES.magmiteSettings.hze.value;
	let tauntimpFrequency = 2.97;
	if (MODULES.magmiteSettings.randimp.value) tauntimpFrequency += 0.396;
	if (MODULES.magmiteSettings.moreImports.value) tauntimpFrequency += (MODULES.magmiteSettings.moreImports.value * 0.05 * 99) / 100; // inc chance * possible import cells / world cells

	// base CI on end zone
	let confInterval = 1 - 1.91 / Math.sqrt((MODULES.magmiteSettings.runEnd.value - MODULES.magmiteSettings.fuelStart.value) * tauntimpFrequency);
	let useConf = true;
	let skippedCoords = 0;
	let goalReached = false;
	for (let i = 0; i <= myHze - 200; i++) {
		//calc an extra 30 zones because why not
		// i = zone offset from z230

		//calc fuel gain
		if (i === 0) fuelThisZone[0] = 0.2;
		else fuelThisZone[i] = Math.min(fuelThisZone[i - 1] + 0.01, MODULES.magmiteSettings.supply.maxSupply);
		if (i + 230 >= MODULES.magmiteSettings.fuelStart.value && i + 230 <= MODULES.magmiteSettings.fuelEnd.value) {
			if (i === 0) totalFuel[0] = 0.2;
			else totalFuel[i] = MODULES.magmiteSettings.magmaFlow.value * fuelThisZone[i] + totalFuel[i - 1];
		} else totalFuel[i] = 0;

		//calc generated pop
		overclockTicks[i] = Math.max((totalFuel[i] - MODULES.magmiteSettings.storage.value * MODULES.magmiteSettings.capacity.maxCapacity) / MODULES.magmiteSettings.slowburn.value, 0);
		overclockPop[i] = Math.floor(overclockTicks[i]) * (MODULES.magmite.carpMod * MODULES.magmite.tickRatio) * MODULES.magmiteSettings.overclocker.bonus;
		if (i === 0) overclockPopThisZone[0] = Math.max(overclockPop[0], 0);
		else overclockPopThisZone[i] = Math.max(overclockPop[i] - overclockPop[i - 1], 0);

		//calc tauntimp pop
		if (i === 0) popWithTauntimp[0] = Math.floor(overclockPopThisZone[0] * Math.pow(1.003, tauntimpFrequency));
		else if (useConf) popWithTauntimp[i] = Math.floor((overclockPopThisZone[i] + popWithTauntimp[i - 1]) * Math.pow(1.003, tauntimpFrequency * confInterval));
		else popWithTauntimp[i] = Math.floor((overclockPopThisZone[i] + popWithTauntimp[i - 1]) * Math.pow(1.003, tauntimpFrequency));

		//calc pop stats
		if (i === 0) sum[0] = overclockPopThisZone[0];
		else sum[i] = overclockPopThisZone[i] + sum[i - 1];
		popFromTauntimp[i] = popWithTauntimp[i] - sum[i];
		if (popWithTauntimp[i] > 0) percentFromTauntimp[i] = popFromTauntimp[i] / popWithTauntimp[i];
		else percentFromTauntimp[i] = 0;
		if (i === 0) tauntimpThisZone[0] = 0;
		else tauntimpThisZone[i] = popFromTauntimp[i] - popFromTauntimp[i - 1];

		//calc army size
		if (i === 0) coordPop[0] = Math.ceil((coordinations[coordinations.length - (1 + uncoords)] / 3) * (1 + coordIncrease / 100)) * 3;
		else if (uncoordsZone === -1) {
			coordPop[i] = Math.ceil((coordPop[i - 1] / 3) * (1 + coordIncrease / 100)) * 3;
		} else {
			if (i + 230 > uncoordsZone && currentAmals[i - 1] < uncoordsGoal && !goalReached) {
				coordPop[i] = coordPop[i - 1];
				skippedCoords++;
			} else if (i + 230 > uncoordsZone && currentAmals[i - 1] >= uncoordsGoal && !goalReached) {
				var tempCoordPop = coordPop[i - 1];
				for (skipped = 0; skipped <= skippedCoords; skipped++) {
					tempCoordPop = Math.ceil((tempCoordPop / 3) * (1 + coordIncrease / 100)) * 3;
				}
				goalReached = true;
				coordPop[i] = tempCoordPop;
			} else coordPop[i] = Math.ceil((coordPop[i - 1] / 3) * (1 + coordIncrease / 100)) * 3;
		}

		//calc gators
		amalRatio[i] = popWithTauntimp[i] / (coordPop[i] / 3);
		if (i === 0) currentAmals[0] = 0;
		else if ((i - 1) % 5 !== 0 || (i - 71) % 100 === 0) {
			currentAmals[i] = currentAmals[i - 1];

			//TODO There has to be a less repetive way to write this
		} else if (i <= 70) {
			if (adjustedRatio[i - 1] > Math.max(ar1, MODULES.magmite.finalAmalRatio)) currentAmals[i] = currentAmals[i - 1] + 1;
			else if (adjustedRatio[i - 1] < 1000) currentAmals[i] = currentAmals[i - 1] - 1;
			else currentAmals[i] = currentAmals[i - 1];
		} else if (i <= 170) {
			if (adjustedRatio[i - 1] > Math.max(ar2, MODULES.magmite.finalAmalRatio)) currentAmals[i] = currentAmals[i - 1] + 1;
			else if (adjustedRatio[i - 1] < 1000) currentAmals[i] = currentAmals[i - 1] - 1;
			else currentAmals[i] = currentAmals[i - 1];
		} else if (i <= 270) {
			if (adjustedRatio[i - 1] > Math.max(ar3, MODULES.magmite.finalAmalRatio)) currentAmals[i] = currentAmals[i - 1] + 1;
			else if (adjustedRatio[i - 1] < 1000) currentAmals[i] = currentAmals[i - 1] - 1;
			else currentAmals[i] = currentAmals[i - 1];
		} else if (i <= 370) {
			if (adjustedRatio[i - 1] > Math.max(ar4, MODULES.magmite.finalAmalRatio)) currentAmals[i] = currentAmals[i - 1] + 1;
			else if (adjustedRatio[i - 1] < 1000) currentAmals[i] = currentAmals[i - 1] - 1;
			else currentAmals[i] = currentAmals[i - 1];
		} else {
			if (adjustedRatio[i - 1] > Math.max(ar5, MODULES.magmite.finalAmalRatio)) currentAmals[i] = currentAmals[i - 1] + 1;
			else if (adjustedRatio[i - 1] < 1000) currentAmals[i] = currentAmals[i - 1] - 1;
			else currentAmals[i] = currentAmals[i - 1];
		}
		if (currentAmals[i] < 0) currentAmals[i] = 0;
		adjustedRatio[i] = amalRatio[i] / Math.pow(1000, currentAmals[i]);
	}

	MODULES.magmite.totalPop = popWithTauntimp[MODULES.magmiteSettings.runEnd.value - 230];
	MODULES.magmite.finalAmals = currentAmals[MODULES.magmiteSettings.runEnd.value - 230];
	MODULES.magmite.maxAmals = 0;
	for (i = 0; i <= MODULES.magmiteSettings.runEnd.value - 230; i++) {
		if (currentAmals[i] > MODULES.magmite.maxAmals) {
			MODULES.magmite.maxAmals = currentAmals[i];
			MODULES.magmite.finalAmalZone = i + 230;
		}
	}
	MODULES.magmite.neededPop = coordPop[MODULES.magmiteSettings.runEnd.value - 230] / 3;
	MODULES.magmite.finalArmySize = MODULES.magmite.neededPop * Math.pow(1000, MODULES.magmite.finalAmals);
	MODULES.magmite.yourFinalRatio = MODULES.magmite.totalPop / MODULES.magmite.finalArmySize;
}

function checkDGUpgrades() {
	var myStart = MODULES.magmiteSettings.fuelStart.value;
	var myEnd = MODULES.magmiteSettings.fuelEnd.value;
	var myRunEnd = MODULES.magmiteSettings.runEnd.value;
	var myPop = MODULES.magmite.totalPop;
	var myMI = MODULES.magmite.totalMI;
	MODULES.magmiteSettings.fuelStart.update(230);
	if (MODULES.magmiteSettings.hze.value > 0) {
		MODULES.magmiteSettings.runEnd.update(MODULES.magmiteSettings.hze.value);
		MODULES.magmiteSettings.fuelEnd.update(MODULES.magmiteSettings.hze.value);
	} else {
		MODULES.magmiteSettings.fuelEnd.update(MODULES.magmiteSettings.runEnd.value);
	}

	MODULES.magmiteSettings.efficiency.update(MODULES.magmiteSettings.efficiency.value + 1);
	var efficiencyEfficiency = MODULES.magmite.totalPop - myPop;
	MODULES.magmiteSettings.efficiency.update(MODULES.magmiteSettings.efficiency.value - 1);
	MODULES.magmiteSettings.capacity.update(MODULES.magmiteSettings.capacity.value + 1);
	var capacityEfficiency = MODULES.magmite.totalPop - myPop;
	MODULES.magmiteSettings.capacity.update(MODULES.magmiteSettings.capacity.value - 1);
	MODULES.magmiteSettings.supply.update(MODULES.magmiteSettings.supply.value + 1);
	var supplyEfficiency = MODULES.magmite.totalPop - myPop;
	MODULES.magmiteSettings.supply.update(MODULES.magmiteSettings.supply.value - 1);
	MODULES.magmiteSettings.overclocker.update(MODULES.magmiteSettings.overclocker.value + 1);
	var overclockerEfficiency = MODULES.magmite.totalPop - myPop;
	MODULES.magmiteSettings.overclocker.update(MODULES.magmiteSettings.overclocker.value - 1);
	const magmiteDecay = MODULES.magmiteSettings.decay.value;

	var eCost = MODULES.magmiteSettings.efficiency.cost;
	var cCost = MODULES.magmiteSettings.capacity.cost;
	var sCost = MODULES.magmiteSettings.supply.cost;
	var oCost = MODULES.magmiteSettings.overclocker.cost;
	const totalRuns = 10;
	let totalMi = myMI;
	let checkMi = myMI;
	var runsNeeded = 2;
	while (totalRuns > runsNeeded) {
		checkMi *= magmiteDecay;
		checkMi += myMI;
		if (checkMi > totalMi) {
			totalMi = checkMi;
		}
		runsNeeded++;
	}
	// MI decay calcs
	if (eCost > myMI * 4.9) MODULES.magmiteSettings.efficiency.cost = -1;
	else if (eCost * 2 + 8 <= myMI);
	else if (eCost <= myMI) {
		MODULES.magmiteSettings.efficiency.cost += (myMI - eCost) * 0.2;
	} else {
		var runsNeeded = 1;
		while (eCost > myMI) {
			MODULES.magmiteSettings.efficiency.cost += myMI;
			eCost -= myMI * Math.pow(magmiteDecay, runsNeeded);
			runsNeeded++;
			if (runsNeeded > totalRuns) {
				break;
			}
		}
		MODULES.magmiteSettings.efficiency.cost += (myMI - eCost) * 0.2;
	}
	if (cCost > myMI * 4.9) MODULES.magmiteSettings.capacity.cost = -1;
	else if (cCost * 2 + 32 <= myMI);
	else if (cCost <= myMI) {
		MODULES.magmiteSettings.capacity.cost += (myMI - cCost) * 0.2;
	} else {
		var runsNeeded = 1;
		while (cCost > myMI) {
			MODULES.magmiteSettings.capacity.cost += myMI;
			cCost -= myMI * Math.pow(magmiteDecay, runsNeeded);
			runsNeeded++;
			if (runsNeeded > totalRuns) {
				break;
			}
		}
		MODULES.magmiteSettings.capacity.cost += (myMI - cCost) * 0.2;
	}
	if (sCost > myMI * 4.9) MODULES.magmiteSettings.supply.cost = -1;
	else if (sCost * 2 + 64 <= myMI);
	else if (sCost <= myMI) {
		MODULES.magmiteSettings.supply.cost += (myMI - sCost) * 0.2;
	} else {
		var runsNeeded = 1;
		while (sCost > myMI) {
			MODULES.magmiteSettings.supply.cost += myMI;
			sCost -= myMI * Math.pow(magmiteDecay, runsNeeded);
			runsNeeded++;
			if (runsNeeded > totalRuns) {
				break;
			}
		}
		MODULES.magmiteSettings.supply.cost += (myMI - sCost) * 0.2;
	}
	if (oCost > myMI * 4.9) MODULES.magmiteSettings.overclocker.cost = -1;
	else if (oCost * 2 + 32 <= myMI);
	else if (oCost <= myMI) {
		MODULES.magmiteSettings.overclocker.cost += (myMI - oCost) * 0.2;
	} else {
		var runsNeeded = 1;
		while (oCost > myMI) {
			MODULES.magmiteSettings.overclocker.cost += myMI;
			oCost -= myMI * Math.pow(magmiteDecay, runsNeeded);
			runsNeeded++;
			if (runsNeeded > totalRuns) {
				break;
			}
		}
		MODULES.magmiteSettings.overclocker.cost += (myMI - oCost) * 0.2;
	}

	efficiencyEfficiency /= MODULES.magmiteSettings.efficiency.cost;
	capacityEfficiency /= MODULES.magmiteSettings.capacity.cost;
	supplyEfficiency /= MODULES.magmiteSettings.supply.cost;
	overclockerEfficiency /= MODULES.magmiteSettings.overclocker.cost;

	[eCost, cCost, sCost, oCost] = [eCost, cCost, sCost, oCost].map((cost) => (totalMi > cost ? cost : Infinity));
	MODULES.magmiteSettings.efficiency.efficiency = eCost === Infinity ? 0 : 1;
	MODULES.magmiteSettings.capacity.efficiency = cCost === Infinity ? 0 : capacityEfficiency / efficiencyEfficiency;
	MODULES.magmiteSettings.supply.efficiency = sCost === Infinity ? 0 : supplyEfficiency / efficiencyEfficiency;
	MODULES.magmiteSettings.overclocker.efficiency = oCost === Infinity ? 0 : overclockerEfficiency / efficiencyEfficiency;

	MODULES.magmite.finalResult = [];
	const upgradeNames = ['Efficiency', 'Capacity', 'Supply', 'Overclocker'];
	for (var i = 0; i < upgradeNames.length; i++) {
		MODULES.magmite.finalResult.push(+MODULES.magmiteSettings[upgradeNames[i].toLowerCase()].efficiency);
	}
	const upgradeIndex = MODULES.magmite.finalResult.indexOf(Math.max(...MODULES.magmite.finalResult));
	MODULES.magmiteSettings.runEnd.update(myRunEnd, false);
	MODULES.magmiteSettings.fuelStart.update(myStart, false);
	MODULES.magmiteSettings.fuelEnd.update(myEnd, false);
	return upgradeNames[upgradeIndex];
}

function autoMagmiteSpender(portal) {
	if (game.global.universe !== 1) return;
	//Set Fuel zones when portaling
	if (portalWindowOpen) calculateMagmaZones();

	const magmiteSetting = getPageSetting('spendmagmite', 1);
	if (portal && (magmiteSetting !== 1 || !portalWindowOpen)) return;
	if (getPageSetting('ratiospend', 1)) {
		let boughtUpgrade = false;
		do {
			boughtUpgrade = _autoMagmiteCalc();
		} while (boughtUpgrade);
	} else {
		try {
			var didSpend = false;
			var permanames = ['Slowburn', 'Shielding', 'Storage', 'Hybridization', 'Supervision', 'Simulacrum'];
			for (var i = 0; i < permanames.length; i++) {
				var item = permanames[i];
				var upgrade = game.permanentGeneratorUpgrades[item];
				if (typeof upgrade === 'undefined') return;
				if (upgrade.owned) continue;
				var cost = upgrade.cost;
				if (game.global.magmite >= cost) {
					buyPermanentGeneratorUpgrade(item);
					debug(`Auto Spending ${cost} magmite on: ${item}`, 'magmite');
					didSpend = true;
				}
			}
			var hasOv = game.permanentGeneratorUpgrades.Hybridization.owned && game.permanentGeneratorUpgrades.Storage.owned;
			var ovclock = game.generatorUpgrades.Overclocker;
			if (hasOv && (getPageSetting('spendmagmitesetting', 1) === 0 || getPageSetting('spendmagmitesetting', 1) === 3 || !ovclock.upgrades) && game.global.magmite >= ovclock.cost()) {
				debug(`Auto Spending ${ovclock.cost()} Magmite on: Overclocker${ovclock.upgrades ? ` #${ovclock.upgrades + 1}` : ''}`, 'magmite');
				buyGeneratorUpgrade('Overclocker');
			}

			var repeat = getPageSetting('spendmagmitesetting', 1) === 0 || getPageSetting('spendmagmitesetting', 1) === 1;
			while (repeat) {
				var eff = game.generatorUpgrades['Efficiency'];
				var cap = game.generatorUpgrades['Capacity'];
				var sup = game.generatorUpgrades['Supply'];
				if (typeof eff === 'undefined' || typeof cap === 'undefined' || typeof sup === 'undefined') return;
				var EffObj = {};
				EffObj.name = 'Efficiency';
				EffObj.lvl = eff.upgrades + 1;
				EffObj.cost = eff.cost();
				EffObj.benefit = EffObj.lvl * 0.1;
				EffObj.effInc = ((1 + EffObj.benefit) / (1 + (EffObj.lvl - 1) * 0.1) - 1) * 100;
				EffObj.miCostPerPct = EffObj.cost / EffObj.effInc;
				var CapObj = {};
				CapObj.name = 'Capacity';
				CapObj.lvl = cap.upgrades + 1;
				CapObj.cost = cap.cost();
				CapObj.totalCap = 3 + 0.4 * CapObj.lvl;
				CapObj.benefit = Math.sqrt(CapObj.totalCap);
				CapObj.effInc = (CapObj.benefit / Math.sqrt(3 + 0.4 * (CapObj.lvl - 1)) - 1) * 100;
				CapObj.miCostPerPct = CapObj.cost / CapObj.effInc;
				var upgrade, item;
				if (EffObj.miCostPerPct <= CapObj.miCostPerPct) item = EffObj.name;
				else {
					const supCost = sup.cost();
					var wall = getPageSetting('SupplyWall', 1);
					if (!wall) item = CapObj.cost <= supCost ? CapObj.name : 'Supply';
					else if (wall === 1) item = 'Capacity';
					else if (wall < 0) item = supCost <= CapObj.cost * -wall ? 'Supply' : 'Capacity';
					else item = CapObj.cost <= supCost * wall ? 'Capacity' : 'Supply';
				}
				upgrade = game.generatorUpgrades[item];
				if (game.global.magmite >= upgrade.cost()) {
					debug(`Auto Spending ${upgrade.cost()} Magmite on: ${item} #${game.generatorUpgrades[item].upgrades + 1}`, 'magmite');
					buyGeneratorUpgrade(item);
					didSpend = true;
				} else repeat = false;
			}
		} catch (err) {
			debug(`AutoSpendMagmite Error encountered: ${err.message}`, 'magmite');
		}
		if (didSpend) debug(`Leftover magmite: ${game.global.magmite}`, 'magmite');
	}
}

function _autoMagmiteCalc() {
	miRatio();
	var toSpend = MODULES.magmite.upgradeToPurchase;
	if (toSpend === '') return;
	var upgrader = game.generatorUpgrades[toSpend];
	if (upgrader === undefined) return;
	if (game.global.magmite >= upgrader.cost()) {
		debug(`Auto Spending ${upgrader.cost()} Magmite on: ${toSpend} #${game.generatorUpgrades[toSpend].upgrades + 1}`, 'magmite');
		buyGeneratorUpgrade(toSpend);
		MODULES.magmite.upgradeToPurchase = '';
		return true;
	}
}

function autoGenerator() {
	if (!getPageSetting('UseAutoGen', 1) || game.global.world < 230) return;

	//Saves the user configuration
	let beforeFuelState = getPageSetting('beforegen');
	let afterFuelState = getPageSetting('defaultgen');

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

	//Before Fuel
	if (getPageSetting('fuellater') < 0 || game.global.world < getPageSetting('fuellater')) {
		//Pseudo-Hybrid. It fuels until full, then goes into Mi mode
		if (getPageSetting('beforegen') === 2 && !game.permanentGeneratorUpgrades.Hybridization.owned) {
			beforeFuelState = game.global.generatorMode;
			if (game.global.world === 230 && game.global.lastClearedCell < 14) beforeFuelState = 1;
			if (game.global.magmaFuel >= getGeneratorFuelCap(false, true)) beforeFuelState = 0;
		}
		if (game.global.generatorMode !== beforeFuelState) changeGeneratorState(beforeFuelState);
	}
	//Fuel
	else if (getPageSetting('fuelend') < 0 || game.global.world < getPageSetting('fuelend')) {
		var fuelState = 1;
		if (game.generatorUpgrades.Overclocker.upgrades === 0) {
			if (game.permanentGeneratorUpgrades.Hybridization.owned) fuelState = 2;
			else {
				if (game.global.magmaFuel === getGeneratorFuelCap(false, true)) fuelState = 0;
			}
		}
		if (game.global.generatorMode !== fuelState) changeGeneratorState(fuelState);
	}
	//After Fuel
	else {
		//Pseudo-Hybrid. It fuels until full, then goes into Mi mode
		if (getPageSetting('defaultgen') === 2 && !game.permanentGeneratorUpgrades.Hybridization.owned) {
			afterFuelState = game.global.generatorMode;
			if (game.global.world === 230 && game.global.lastClearedCell < 14) afterFuelState = 1;
			if (game.global.magmaFuel === getGeneratorFuelCap(false, true)) afterFuelState = 0;
		}
		if (game.global.generatorMode !== afterFuelState) changeGeneratorState(afterFuelState);
	}
}
