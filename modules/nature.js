function autoNatureTokens() {
	if (!getPageSetting('AutoNatureTokens') || !mutations.Magma.active()) return;
	const tokenThreshold = getPageSetting('tokenthresh');
	if (tokenThreshold <= 0) return;
	let spentTokens = false;

	for (let nature in game.empowerments) {
		const empowerment = game.empowerments[nature];
		let setting = getPageSetting('Auto' + nature);
		if (!setting || setting === 'Off') continue;

		if (setting === 'Empowerment') {
			let cost = getNextNatureCost(nature);
			let natureLevel = game.empowerments[nature].level;
			//Skips if not enough tokens to upgrade & maintain threshold
			if (empowerment.tokens < cost + tokenThreshold) continue;
			empowerment.tokens -= cost;
			empowerment.level++;
			spentTokens = true;
			if (natureLevel !== game.empowerments[nature].level) debug(`Upgraded Empowerment of ${nature}`, 'nature');
		} else if (setting === 'Transfer') {
			//Skips if at max transfer rate
			if (empowerment.retainLevel >= 80) continue;
			let cost = getNextNatureCost(nature, true);
			//Skips if not enough tokens to upgrade & maintain threshold
			if (empowerment.tokens < cost + tokenThreshold) continue;
			empowerment.tokens -= cost;
			empowerment.retainLevel++;
			spentTokens = true;
			debug(`Upgraded ${nature} transfer rate`, 'nature');
		} else {
			//Skips if not enough tokens to transfer & maintain threshold
			if (setting.slice(0, 7) !== 'Convert') continue;
			if (empowerment.tokens < 10 + tokenThreshold) continue;
			let targetNature = ['Poison', 'Wind', 'Ice'];
			targetNature = targetNature.filter((element) => element !== nature);
			if (setting.slice(11) !== 'Both') targetNature = targetNature.filter((element) => element === nature);

			for (let item in targetNature) {
				if (!game.empowerments[targetNature[item]]) continue;
				empowerment.tokens -= 10;
				const convertRate = game.talents.nature.purchased ? 8 : 5;
				game.empowerments[targetNature[item]].tokens += convertRate;
				spentTokens = true;
				debug(`Converted ${nature} tokens to ${targetNature[item]}`, 'nature');
			}
		}
	}

	if (spentTokens) updateNatureInfoSpans();
}

function purchaseEnlight(nature) {
	if (game.global.uberNature !== '' || game.empowerments[nature].getLevel() < 50) return;

	naturePurchase('uberEmpower', nature);
	cancelTooltip();
	debug(`Purchased ${nature} englightenment`, 'nature');
}

function autoEnlight() {
	if (!getPageSetting('autoenlight') || !mutations.Magma.active() || game.global.uberNature) return;
	let natureToActivate = 'None';

	const affix = trimpStats.isC3 ? 'C2' : trimpStats.isDaily ? 'Daily' : '';
	for (let nature in game.empowerments) {
		const natureSetting = getPageSetting(nature.toLowerCase() + 'Enlight' + affix);
		if (natureSetting <= 0) continue;
		const empowerment = game.empowerments[nature];
		if (natureSetting < empowerment.nextUberCost) continue;
		if (empowerment.nextUberCost <= empowerment.tokens) {
			natureToActivate = nature;
			break;
		}
	}

	if (natureToActivate !== 'None') {
		purchaseEnlight(natureToActivate);
	}
}
