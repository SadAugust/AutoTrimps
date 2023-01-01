function autoNatureTokens() {
	var changed = false;
	var thresh = 0;
	if (getPageSetting('tokenthresh') > 0) {
		thresh = getPageSetting('tokenthresh');
	}
	for (var nature in game.empowerments) {
		var empowerment = game.empowerments[nature];
		var setting = getPageSetting('Auto' + nature);
		if (!setting || setting == 'Off') continue;

		if (setting == 'Empowerment') {
			var cost = getNextNatureCost(nature);
			if (empowerment.tokens < cost + thresh || empowerment.tokens < thresh)
				continue;
			empowerment.tokens -= cost;
			empowerment.level++;
			changed = true;
			debug('Upgraded Empowerment of ' + nature, 'nature');
		}
		else if (setting == 'Transfer') {
			if (empowerment.retainLevel >= 80 + thresh || empowerment.tokens < thresh)
				continue;
			var cost = getNextNatureCost(nature, true);
			if (empowerment.tokens < cost) continue;
			empowerment.tokens -= cost;
			empowerment.retainLevel++;
			changed = true;
			debug('Upgraded ' + nature + ' transfer rate', 'nature');
		}
		else if (setting == 'Convert to Both') {
			if (empowerment.tokens < 20 + thresh || empowerment.tokens < thresh) continue;
			for (var targetNature in game.empowerments) {
				if (targetNature == nature) continue;
				empowerment.tokens -= 10;
				var convertRate = (game.talents.nature.purchased) ? ((game.talents.nature2.purchased) ? 8 : 6) : 5;
				game.empowerments[targetNature].tokens += convertRate;
				changed = true;
				debug('Converted ' + nature + ' tokens to ' + targetNature, 'nature');
			}
		}
		else {
			if (empowerment.tokens < 10 + thresh || empowerment.tokens < thresh)
				continue;
			var match = setting.match(/Convert to (\w+)/);
			var targetNature = match ? match[1] : null;
			if (!targetNature || targetNature === nature || !game.empowerments[targetNature]) continue;
			empowerment.tokens -= 10;
			var convertRate = (game.talents.nature.purchased) ? ((game.talents.nature2.purchased) ? 8 : 6) : 5;
			game.empowerments[targetNature].tokens += convertRate;
			changed = true;
			debug('Converted ' + nature + ' tokens to ' + targetNature, 'nature');
		}
	}
	if (changed)
		updateNatureInfoSpans();
}

function purchaseEnlight(nature) {
	if (game.global.uberNature == false && game.empowerments[nature].nextUberCost <= game.empowerments[nature].tokens) {
		naturePurchase('uberEmpower', nature);
	}
}

function autoEnlight() {
	var nature = "None", dnature = "None", cnature = "None";
	var fillernature = [], poison, poisondiff, wind, winddiff, ice, icediff, dailynature = [], dpoison, dpoisondiff, dwind, dwinddiff, dice, dicediff, c2nature = [], cpoison, cpoisondiff, cwind, cwinddiff, cice, cicediff;

	//FILLER
	if (!challengeActive('Daily') && !game.global.runningChallengeSquared) {
		if (getPageSetting('pfillerenlightthresh') >= 0) {
			poison = (game.empowerments.Poison.nextUberCost <= getPageSetting('pfillerenlightthresh') && game.empowerments.Poison.nextUberCost <= game.empowerments.Poison.tokens);
			if (poison) {
				poisondiff = (getPageSetting('pfillerenlightthresh') - game.empowerments.Poison.nextUberCost);
			}
			else poisondiff = -999999;
		}
		else poisondiff = -999999;

		if (getPageSetting('wfillerenlightthresh') >= 0) {
			wind = (game.empowerments.Wind.nextUberCost <= getPageSetting('wfillerenlightthresh') && game.empowerments.Wind.nextUberCost <= game.empowerments.Wind.tokens);
			if (wind) {
				winddiff = (getPageSetting('wfillerenlightthresh') - game.empowerments.Wind.nextUberCost);
			}
			else winddiff = -999999;
		}
		else winddiff = -999999;

		if (getPageSetting('ifillerenlightthresh') >= 0) {
			ice = (game.empowerments.Ice.nextUberCost <= getPageSetting('ifillerenlightthresh') && game.empowerments.Ice.nextUberCost <= game.empowerments.Ice.tokens);
			if (ice) {
				icediff = (getPageSetting('ifillerenlightthresh') - game.empowerments.Ice.nextUberCost);
			}
			else icediff = -999999;
		}
		else icediff = -999999;

		fillernature = [{ nature: 'Poison', cost: poisondiff }, { nature: 'Wind', cost: winddiff }, { nature: 'Ice', cost: icediff }].sort(function (a, b) { return a.cost > b.cost ? -1 : a.cost < b.cost ? 1 : 0; });

		if (fillernature[0].cost > 0) {
			nature = fillernature[0].nature;
		}
		else { nature = "None"; }

		if (fillernature.length > 0 && !challengeActive('Daily') && !game.global.runningChallengeSquared && nature != "None") {
			purchaseEnlight(nature);
		}
	}

	//DAILY
	if (challengeActive('Daily')) {
		if (getPageSetting('pdailyenlightthresh') >= 0) {
			dpoison = (game.empowerments.Poison.nextUberCost <= getPageSetting('pdailyenlightthresh') && game.empowerments.Poison.nextUberCost <= game.empowerments.Poison.tokens);
			if (dpoison) {
				dpoisondiff = (getPageSetting('pdailyenlightthresh') - game.empowerments.Poison.nextUberCost);
			}
			else dpoisondiff = -999999;
		}
		else dpoisondiff = -999999;

		if (getPageSetting('wdailyenlightthresh') >= 0) {
			dwind = (game.empowerments.Wind.nextUberCost <= getPageSetting('wdailyenlightthresh') && game.empowerments.Wind.nextUberCost <= game.empowerments.Wind.tokens);
			if (dwind) {
				dwinddiff = (getPageSetting('wdailyenlightthresh') - game.empowerments.Wind.nextUberCost);
			}
			else dwinddiff = -999999;
		}
		else dwinddiff = -999999;

		if (getPageSetting('idailyenlightthresh') >= 0) {
			dice = (game.empowerments.Ice.nextUberCost <= getPageSetting('idailyenlightthresh') && game.empowerments.Ice.nextUberCost <= game.empowerments.Ice.tokens);
			if (dice) {
				dicediff = (getPageSetting('idailyenlightthresh') - game.empowerments.Ice.nextUberCost);
			}
			else dicediff = -999999;
		}
		else dicediff = -999999;

		dailynature = [{ nature: 'Poison', cost: dpoisondiff }, { nature: 'Wind', cost: dwinddiff }, { nature: 'Ice', cost: dicediff }].sort(function (a, b) { return a.cost > b.cost ? -1 : a.cost < b.cost ? 1 : 0; });

		if (dailynature[0].cost > 0) {
			dnature = dailynature[0].nature;
		}
		else { dnature = "None"; }

		if (dailynature.length > 0 && challengeActive('Daily') && dnature != "None") {
			purchaseEnlight(dnature);
		}
	}

	//C2
	if (game.global.runningChallengeSquared) {
		if (getPageSetting('pc2enlightthresh') >= 0) {
			cpoison = (game.empowerments.Poison.nextUberCost <= getPageSetting('pc2enlightthresh') && game.empowerments.Poison.nextUberCost <= game.empowerments.Poison.tokens);
			if (cpoison) {
				cpoisondiff = (getPageSetting('pc2enlightthresh') - game.empowerments.Poison.nextUberCost);
			}
			else cpoisondiff = -999999;
		}
		else cpoisondiff = -999999;

		if (getPageSetting('wc2enlightthresh') >= 0) {
			cwind = (game.empowerments.Wind.nextUberCost <= getPageSetting('wc2enlightthresh') && game.empowerments.Wind.nextUberCost <= game.empowerments.Wind.tokens);
			if (cwind) {
				cwinddiff = (getPageSetting('wc2enlightthresh') - game.empowerments.Wind.nextUberCost);
			}
			else cwinddiff = -999999;
		}
		else cwinddiff = -999999;

		if (getPageSetting('ic2enlightthresh') >= 0) {
			cice = (game.empowerments.Ice.nextUberCost <= getPageSetting('ic2enlightthresh') && game.empowerments.Ice.nextUberCost <= game.empowerments.Ice.tokens);
			if (cice) {
				cicediff = (getPageSetting('ic2enlightthresh') - game.empowerments.Ice.nextUberCost);
			}
			else cicediff = -999999;
		}
		else cicediff = -999999;

		c2nature = [{ nature: 'Poison', cost: cpoisondiff }, { nature: 'Wind', cost: cwinddiff }, { nature: 'Ice', cost: cicediff }].sort(function (a, b) { return a.cost > b.cost ? -1 : a.cost < b.cost ? 1 : 0; });

		if (c2nature[0].cost > 0) {
			cnature = c2nature[0].nature;
		}
		else { cnature = "None"; }

		if (c2nature.length > 0 && game.global.runningChallengeSquared && cnature != "None") {
			purchaseEnlight(cnature);
		}
	}
}
