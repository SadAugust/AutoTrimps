function autoNatureTokens() {
	if (!getPageSetting('autoNature') || !mutations.Magma.active()) return;
	const tokenThreshold = getPageSetting('autoNatureThreshold');
	if (tokenThreshold <= 0) return;
	let spentTokens = false;

	for (let nature in game.empowerments) {
		const empowerment = game.empowerments[nature];
		let setting = getPageSetting(`Auto${nature}`);
		if (!setting || setting === 'Off') continue;

		if (setting === 'Empowerment') {
			_autoNatureEmpowerment(nature, empowerment, tokenThreshold);
		} else if (setting === 'Transfer') {
			spentTokens = _autoNatureTransfer(nature, empowerment, tokenThreshold);
		} else {
			spentTokens = _autoNatureConversion(nature, empowerment, tokenThreshold, setting);
		}
	}

	if (spentTokens) updateNatureInfoSpans();
}

function _autoNatureEmpowerment(nature, empowerment, tokenThreshold) {
	const cost = getNextNatureCost(nature);
	if (empowerment.tokens < cost + tokenThreshold) return;

	empowerment.tokens -= cost;
	empowerment.level++;
	spentTokens = true;
	debug(`Upgraded Empowerment of ${nature}`, 'nature');
}

function _autoNatureTransfer(nature, empowerment, tokenThreshold) {
	if (empowerment.retainLevel >= 80) return false;
	const cost = getNextNatureCost(nature, true);
	if (empowerment.tokens < cost + tokenThreshold) return false;

	empowerment.tokens -= cost;
	empowerment.retainLevel++;
	debug(`Upgraded ${nature} transfer rate`, 'nature');
	return true;
}

function _autoNatureConversion(nature, empowerment, tokenThreshold, setting) {
	if (!setting.startsWith('Convert') || empowerment.tokens < 10 + tokenThreshold) return false;

	let spentTokens = false;
	let targetNature = ['Poison', 'Wind', 'Ice'];
	const convertToBoth = setting.endsWith('Both');
	targetNature = targetNature.filter((element) => (convertToBoth ? element !== nature : setting.endsWith(element)));

	for (let item in targetNature) {
		if (!game.empowerments[targetNature[item]]) continue;
		empowerment.tokens -= 10;
		const convertRate = game.talents.nature.purchased ? 8 : 5;
		game.empowerments[targetNature[item]].tokens += convertRate;
		debug(`Converted ${nature} tokens to ${targetNature[item]}`, 'nature');
		spentTokens = true;
	}

	return spentTokens;
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
