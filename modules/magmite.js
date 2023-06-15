MODULES["magmite"] = {};
MODULES["magmite"].algorithm = 2;

const dgPriceIncreases = {
	Efficiency: 8,
	Capacity: 32,
	Supply: 64,
	Overclocker: 32
};

function calcMiSpent(upgrade) {
	var total = 0;
	if (game.generatorUpgrades[upgrade].cost() <= game.generatorUpgrades[upgrade].baseCost || game.generatorUpgrades[upgrade].upgrades <= 0) return 0;
	else {
		total = game.generatorUpgrades[upgrade].upgrades * (game.generatorUpgrades[upgrade].baseCost + (dgPriceIncreases[upgrade] / 2) * (game.generatorUpgrades[upgrade].upgrades - 1));
		return total;
	}
}

function miRatio() {

	//Find Mi Ratio
	var eff, cap, sup, oc, effRatio, capRatio, supRatio, ocRatio, effSpend, effSpendRatio, capSpend, capSpendRatio, supSpend, supSpendRatio, ocSpend, ocSpendRatio;

	eff = calcMiSpent('Efficiency');
	cap = calcMiSpent('Capacity');
	sup = calcMiSpent('Supply');
	oc = calcMiSpent('Overclocker');

	var total = (eff + cap + sup + oc);

	effRatio = (eff > 0) ? ((eff / total) * 100) : 1;
	capRatio = (cap > 0) ? ((cap / total) * 100) : 1;
	supRatio = (sup > 0) ? ((sup / total) * 100) : 1;
	ocRatio = (oc > 0) ? ((oc / total) * 100) : 1;

	//Find Player ratio
	effSpend = (getPageSetting('effratio', 1) > 0) ? getPageSetting('effratio', 1) : 0;
	capSpend = (getPageSetting('capratio', 1) > 0) ? getPageSetting('capratio', 1) : 0;
	supSpend = (getPageSetting('supratio', 1) > 0) ? getPageSetting('supratio', 1) : 0;
	ocSpend = (getPageSetting('ocratio', 1) > 0) ? getPageSetting('ocratio', 1) : 0;

	var totalSpend = (effSpend + capSpend + supSpend + ocSpend);

	effSpendRatio = (effSpend > 0) ? ((effSpend / totalSpend) * 100) : 0;
	capSpendRatio = (capSpend > 0) ? ((capSpend / totalSpend) * 100) : 0;
	supSpendRatio = (supSpend > 0) ? ((supSpend / totalSpend) * 100) : 0;
	ocSpendRatio = (ocSpend > 0) ? ((ocSpend / totalSpend) * 100) : 0;

	//Find Next Spend
	var efffinal = effSpendRatio - effRatio;
	var capfinal = capSpendRatio - capRatio;
	var supfinal = supSpendRatio - supRatio;
	var ocfinal = ocSpendRatio - ocRatio;

	var ratios = [];
	if (efffinal !== -1)
		ratios.push(efffinal);
	if (capfinal !== -1)
		ratios.push(capfinal);
	if (supfinal !== -1)
		ratios.push(supfinal);
	if (ocfinal !== -1)
		ratios.push(ocfinal);

	ratios.sort(function (a, b) { return b - a; });

	//Return Next Spend
	if (ratios[0] === efffinal)
		return "Efficiency";
	if (ratios[0] === capfinal)
		return "Capacity";
	if (ratios[0] === supfinal)
		return "Supply";
	if (ratios[0] === ocfinal)
		return "Overclocker";
}

function autoMagmiteSpender() {
	if (game.global.universe !== 1) return;
	if (getPageSetting('ratiospend', 1)) {
		var toSpend = miRatio();
		var upgrader = game.generatorUpgrades[toSpend];
		if (game.global.magmite >= upgrader.cost()) {
			debug("Auto Spending " + upgrader.cost() + " Magmite on: " + toSpend + " #" + (game.generatorUpgrades[toSpend].upgrades + 1), "magmite");
			buyGeneratorUpgrade(toSpend);
		}
	} else {
		try {
			var didSpend = false;
			var permanames = ["Slowburn", "Shielding", "Storage", "Hybridization", "Supervision", "Simulacrum"];
			for (var i = 0; i < permanames.length; i++) {
				var item = permanames[i];
				var upgrade = game.permanentGeneratorUpgrades[item];
				if (typeof upgrade === 'undefined')
					return;
				if (upgrade.owned)
					continue;
				var cost = upgrade.cost;
				if (game.global.magmite >= cost) {
					buyPermanentGeneratorUpgrade(item);
					debug("Auto Spending " + cost + " Magmite on: " + item, "magmite");
					didSpend = true;
				}
			}
			var hasOv = game.permanentGeneratorUpgrades.Hybridization.owned && game.permanentGeneratorUpgrades.Storage.owned;
			var ovclock = game.generatorUpgrades.Overclocker;
			if (hasOv && ((getPageSetting('spendmagmitesetting', 1) === 0 || getPageSetting('spendmagmitesetting', 1) === 3) || !ovclock.upgrades) && (game.global.magmite >= ovclock.cost())) {
				debug("Auto Spending " + ovclock.cost() + " Magmite on: Overclocker" + (ovclock.upgrades ? " #" + (ovclock.upgrades + 1) : ""), "magmite");
				buyGeneratorUpgrade('Overclocker');
			}

			var repeat = (getPageSetting('spendmagmitesetting', 1) === 0 || getPageSetting('spendmagmitesetting', 1) === 1);
			while (repeat) {
				if (MODULES["magmite"].algorithm === 2) {
					var eff = game.generatorUpgrades["Efficiency"];
					var cap = game.generatorUpgrades["Capacity"];
					var sup = game.generatorUpgrades["Supply"];
					if ((typeof eff === 'undefined') || (typeof cap === 'undefined') || (typeof sup === 'undefined'))
						return;
					var EffObj = {};
					EffObj.name = "Efficiency";
					EffObj.lvl = eff.upgrades + 1;
					EffObj.cost = eff.cost();
					EffObj.benefit = EffObj.lvl * 0.1;
					EffObj.effInc = (((1 + EffObj.benefit) / (1 + ((EffObj.lvl - 1) * 0.1)) - 1) * 100);
					EffObj.miCostPerPct = EffObj.cost / EffObj.effInc;
					var CapObj = {};
					CapObj.name = "Capacity";
					CapObj.lvl = cap.upgrades + 1;
					CapObj.cost = cap.cost();
					CapObj.totalCap = 3 + (0.4 * CapObj.lvl);
					CapObj.benefit = Math.sqrt(CapObj.totalCap);
					CapObj.effInc = ((CapObj.benefit / Math.sqrt(3 + (0.4 * (CapObj.lvl - 1))) - 1) * 100);
					CapObj.miCostPerPct = CapObj.cost / CapObj.effInc;
					var upgrade, item;
					if (EffObj.miCostPerPct <= CapObj.miCostPerPct)
						item = EffObj.name;
					else {
						const supCost = sup.cost();
						var wall = getPageSetting('SupplyWall');
						if (!wall)
							item = (CapObj.cost <= supCost) ?
								CapObj.name : "Supply";
						else if (wall === 1)
							item = "Capacity";
						else if (wall < 0)
							item = (supCost <= (CapObj.cost * -wall)) ?
								"Supply" : "Capacity";
						else
							item = (CapObj.cost <= (supCost * wall)) ?
								"Capacity" : "Supply";
					}
					upgrade = game.generatorUpgrades[item];
					if (game.global.magmite >= upgrade.cost()) {
						debug("Auto Spending " + upgrade.cost() + " Magmite on: " + item + " #" + (game.generatorUpgrades[item].upgrades + 1), "magmite");
						buyGeneratorUpgrade(item);
						didSpend = true;
					} else
						repeat = false;
				}

			}
		} catch (err) {
			debug("AutoSpendMagmite Error encountered: " + err.message, "magmite");
		}
		if (didSpend)
			debug("Leftover magmite: " + game.global.magmite, "magmite");
	}
}

function autoGenerator() {
	if (!getPageSetting('UseAutoGen')) return;
	//Dimensional Generator locked
	if (game.global.world < 230) return;

	//Saves the user configuration
	var beforeFuelState = getPageSetting("beforegen");
	var afterFuelState = getPageSetting("defaultgen");

	//Daily
	if (hdStats.isDaily && getPageSetting("AutoGenDC") !== 0) {
		changeGeneratorState(getPageSetting("AutoGenDC"));
		return;
	}

	//C2
	if (hdStats.isC3 && getPageSetting("AutoGenC2") !== 0) {
		changeGeneratorState(getPageSetting("AutoGenC2"));
		return;
	}

	//Before Fuel
	if (getPageSetting("fuellater") <= 0 || game.global.world < getPageSetting("fuellater")) {
		//Pseudo-Hybrid. It fuels until full, then goes into Mi mode
		if (getPageSetting("beforegen") === 2 && !game.permanentGeneratorUpgrades.Hybridization.owned) {
			beforeFuelState = game.global.generatorMode;
			if (game.global.world === 230 && game.global.lastClearedCell < 14) beforeFuelState = 1;
			if (game.global.magmaFuel === getGeneratorFuelCap(false, true)) beforeFuelState = 0;
		}
		changeGeneratorState(beforeFuelState);
	}

	//Fuel
	else if (getPageSetting("fuelend") > 0 && game.global.world < getPageSetting("fuelend"))
		changeGeneratorState(1);

	//After Fuel
	else {
		//Pseudo-Hybrid. It fuels until full, then goes into Mi mode
		if (getPageSetting("defaultgen") === 2 && !game.permanentGeneratorUpgrades.Hybridization.owned) {
			afterFuelState = game.global.generatorMode;
			if (game.global.world === 230 && game.global.lastClearedCell < 14) afterFuelState = 1;
			if (game.global.magmaFuel === getGeneratorFuelCap(false, true)) afterFuelState = 0;
		}
		changeGeneratorState(afterFuelState);
	}
}
