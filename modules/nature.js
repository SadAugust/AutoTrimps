function autoNatureTokens() {
	if (!getPageSetting('AutoNatureTokens')) return;
	if (!mutations.Magma.active()) return;
	var tokenThreshold = getPageSetting('tokenthresh');
	if (tokenThreshold <= 0) return;
	var spentTokens = false;

	for (var nature in game.empowerments) {
		var empowerment = game.empowerments[nature];
		var setting = getPageSetting('Auto' + nature);
		if (!setting || setting === 'Off') continue;

		if (setting === 'Empowerment') {
			var cost = getNextNatureCost(nature);
			var natureLevel = game.empowerments[nature].level;
			//Skips if not enough tokens to upgrade & maintain threshold
			if (empowerment.tokens < (cost + tokenThreshold))
				continue;
			empowerment.tokens -= cost;
			empowerment.level++;
			spentTokens = true;
			if (natureLevel !== game.empowerments[nature].level) debug('Upgraded Empowerment of ' + nature, 'nature');
		}
		else if (setting === 'Transfer') {
			//Skips if at max transfer rate
			if (empowerment.retainLevel >= 80) continue;
			var cost = getNextNatureCost(nature, true);
			//Skips if not enough tokens to upgrade & maintain threshold
			if (empowerment.tokens < (cost + tokenThreshold)) continue;
			empowerment.tokens -= cost;
			empowerment.retainLevel++;
			spentTokens = true;
			debug('Upgraded ' + nature + ' transfer rate', 'nature');
		}
		else {
			//Skips if not enough tokens to transfer & maintain threshold
			if (empowerment.tokens < (10 + tokenThreshold)) continue;
			var targetNature = setting.slice(11);
			if (!targetNature || targetNature === nature || !game.empowerments[targetNature]) continue;
			empowerment.tokens -= 10;
			var convertRate = game.talents.nature.purchased ? 8 : 5;
			game.empowerments[targetNature].tokens += convertRate;
			spentTokens = true;
			debug('Converted ' + nature + ' tokens to ' + targetNature, 'nature');
		}
	}
	if (spentTokens) updateNatureInfoSpans();
}

function purchaseEnlight(nature) {
	if (game.global.uberNature !== '') return;
	if (game.empowerments[nature].getLevel() < 50) return;
	naturePurchase('uberEmpower', nature);
	cancelTooltip();
	debug('Purchased ' + nature + " englightenment", 'nature');
}

function autoEnlight() {
	if (!getPageSetting('autoenlight')) return;
	if (!mutations.Magma.active()) return;
	if (game.global.uberNature) return;
	var natureToActivate = "None";

	const affix = trimpStats.isC3 ? 'C2' : trimpStats.isDaily ? 'Daily' : '';
	for (var nature in game.empowerments) {
		let natureSetting = getPageSetting(nature.toLowerCase() + "Enlight" + affix);
		if (natureSetting <= 0) continue;
		let empowerment = game.empowerments[nature];
		if (natureSetting < empowerment.nextUberCost) continue;
		if (empowerment.nextUberCost <= empowerment.tokens) {
			natureToActivate = nature;
			break;
		}
	}
	if (natureToActivate !== "None") {
		purchaseEnlight(natureToActivate);
	}
}