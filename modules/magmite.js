MODULES["magmite"] = {};
MODULES["magmite"].algorithm = 2;

var priceIncreases = {
	Efficiency: 8,
	Capacity: 32,
	Supply: 64,
	Overclocker: 32
};

function calcMiSpent(upgrade) {
	var total = 0;
	if (game.generatorUpgrades[upgrade].cost() <= game.generatorUpgrades[upgrade].baseCost || game.generatorUpgrades[upgrade].upgrades <= 0) return 0;
	else {
		total = game.generatorUpgrades[upgrade].upgrades * (game.generatorUpgrades[upgrade].baseCost + (priceIncreases[upgrade] / 2) * (game.generatorUpgrades[upgrade].upgrades - 1));
		return total;
	}
}

function miRatio() {

	//Find Mi Ratio
	var eff, cap, sup, oc, effr, capr, supr, ocr, effspend, effspendr, capspend, capspendr, supspend, supspendr, ocspend, ocspendr;

	eff = calcMiSpent('Efficiency');
	cap = calcMiSpent('Capacity');
	sup = calcMiSpent('Supply');
	oc = calcMiSpent('Overclocker');

	var total = (eff + cap + sup + oc);

	effr = (eff > 0) ? ((eff / total) * 100) : 1;
	capr = (cap > 0) ? ((cap / total) * 100) : 1;
	supr = (sup > 0) ? ((sup / total) * 100) : 1;
	ocr = (oc > 0) ? ((oc / total) * 100) : 1;

	//Find Player ratio
	effspend = (getPageSetting('effratio') > 0) ? getPageSetting('effratio') : 0;
	capspend = (getPageSetting('capratio') > 0) ? getPageSetting('capratio') : 0;
	supspend = (getPageSetting('supratio') > 0) ? getPageSetting('supratio') : 0;
	ocspend = (getPageSetting('ocratio') > 0) ? getPageSetting('ocratio') : 0;

	var totalspend = (effspend + capspend + supspend + ocspend);

	effspendr = (effspend > 0) ? ((totalspend / effspend) * 100) : 0;
	capspendr = (capspend > 0) ? ((totalspend / capspend) * 100) : 0;
	supspendr = (supspend > 0) ? ((totalspend / supspend) * 100) : 0;
	ocspendr = (ocspend > 0) ? ((totalspend / ocspend) * 100) : 0;

	//Find Next Spend
	var efffinal = effspendr - effr;
	var capfinal = capspendr - capr;
	var supfinal = supspendr - supr;
	var ocfinal = ocspendr - ocr;

	var ratios = [];
	if (efffinal != -1)
		ratios.push(efffinal);
	if (capfinal != -1)
		ratios.push(capfinal);
	if (supfinal != -1)
		ratios.push(supfinal);
	if (ocfinal != -1)
		ratios.push(ocfinal);

	ratios.sort(function (a, b) { return b - a; });

	//Return Next Spend
	if (ratios[0] == efffinal)
		return "Efficiency";
	if (ratios[0] == capfinal)
		return "Capacity";
	if (ratios[0] == supfinal)
		return "Supply";
	if (ratios[0] == ocfinal)
		return "Overclocker";
}

function autoMagmiteSpender() {
	if (game.global.universe !== 1) return;
	if (getPageSetting('ratiospend') == true) {
		var tospend = miRatio();
		var upgrader = game.generatorUpgrades[tospend];
		if (game.global.magmite >= upgrader.cost()) {
			debug("Auto Spending " + upgrader.cost() + " Magmite on: " + tospend + " #" + (game.generatorUpgrades[tospend].upgrades + 1), "magmite");
			buyGeneratorUpgrade(tospend);
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
			if (hasOv && ((getPageSetting('spendmagmitesetting') == 0 || getPageSetting('spendmagmitesetting') == 3) || !ovclock.upgrades) && (game.global.magmite >= ovclock.cost())) {
				debug("Auto Spending " + ovclock.cost() + " Magmite on: Overclocker" + (ovclock.upgrades ? " #" + (ovclock.upgrades + 1) : ""), "magmite");
				buyGeneratorUpgrade('Overclocker');
			}

			var repeat = (getPageSetting('spendmagmitesetting') == 0 || getPageSetting('spendmagmitesetting') == 1);
			while (repeat) {
				if (MODULES["magmite"].algorithm == 2) {
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
						else if (wall == 1)
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
	if (game.global.world < 230) return;
	var defaultgenstate = getPageSetting('defaultgen');
	var beforefuelstate = getPageSetting('beforegen');
	if (game.global.dailyChallenge.seed && getPageSetting('AutoGenDC') == 1 && game.global.generatorMode != 1)
		changeGeneratorState(1);
	if (game.global.dailyChallenge.seed && getPageSetting('AutoGenDC') == 1 && game.global.generatorMode == 1)
		return;
	if (game.global.dailyChallenge.seed && getPageSetting('AutoGenDC') == 2 && game.global.generatorMode != 2)
		changeGeneratorState(2);
	if (game.global.dailyChallenge.seed && getPageSetting('AutoGenDC') == 2 && game.global.generatorMode == 2)
		return;
	if (hdStats.isC3 && getPageSetting('AutoGenC2') == 1 && game.global.generatorMode != 1)
		changeGeneratorState(1);
	if (hdStats.isC3 && getPageSetting('AutoGenC2') == 1 && game.global.generatorMode == 1)
		return;
	if (hdStats.isC3 && getPageSetting('AutoGenC2') == 2 && game.global.generatorMode != 2)
		changeGeneratorState(2);
	if (hdStats.isC3 && getPageSetting('AutoGenC2') == 2 && game.global.generatorMode == 2)
		return;
	if (getPageSetting('fuellater') < 1 && game.global.generatorMode != beforefuelstate)
		changeGeneratorState(beforefuelstate);
	if (getPageSetting('fuellater') < 1 && game.global.generatorMode == beforefuelstate)
		return;
	if (getPageSetting('fuellater') >= 1 && game.global.world < getPageSetting('fuellater') && game.global.generatorMode != beforefuelstate)
		changeGeneratorState(beforefuelstate);
	if (getPageSetting('fuellater') >= 1 && game.global.world < getPageSetting('fuellater') && game.global.generatorMode == beforefuelstate)
		return;
	if (getPageSetting('fuellater') >= 1 && game.global.world >= getPageSetting('fuellater') && game.global.world < getPageSetting('fuelend') && game.global.generatorMode != 1)
		changeGeneratorState(1);
	if (getPageSetting('fuellater') >= 1 && game.global.world >= getPageSetting('fuellater') && game.global.world < getPageSetting('fuelend') && game.global.generatorMode == 1)
		return;
	if (getPageSetting('fuelend') < 1 && game.global.world >= getPageSetting('fuellater') && game.global.generatorMode != 1)
		changeGeneratorState(1);
	if (getPageSetting('fuelend') < 1 && game.global.world >= getPageSetting('fuellater') && game.global.generatorMode == 1)
		return;
	if (getPageSetting('fuelend') >= 1 && game.global.world >= getPageSetting('fuelend') && game.global.generatorMode != defaultgenstate)
		changeGeneratorState(defaultgenstate);
	if (getPageSetting('fuelend') >= 1 && game.global.world >= getPageSetting('fuelend') && game.global.generatorMode == defaultgenstate)
		return;
}
