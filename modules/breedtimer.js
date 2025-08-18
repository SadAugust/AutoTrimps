atData.breedtimer = {
	DecimalBreed: Decimal.clone({ precision: 30, rounding: 4 }),
	missingTrimps: new this.DecimalBreed(0)
};

function trimpsEffectivelyEmployed(employedTrimps = game.resources.trimps.employed) {
	if (game.permaBoneBonuses.multitasking.owned) employedTrimps *= 1 - game.permaBoneBonuses.multitasking.mult();

	return employedTrimps;
}

function breedingPS() {
	const trimps = game.resources.trimps;
	const breeding = new atData.breedtimer.DecimalBreed(trimps.owned).minus(trimpsEffectivelyEmployed());

	return getPotencyMod().minus(1).mul(10).mul(breeding);
}

function _breedingPS() {
	const trimps = game.resources.trimps;
	const breeding = trimps.owned - trimpsEffectivelyEmployed();

	return (_getPotencyMod() - 1) * 10 * breeding;
}

function getPotencyMod() {
	const potency = game.resources.trimps.potency;
	let potencyMod = new atData.breedtimer.DecimalBreed(potency);

	/* potency, nurseries, venimp, broken planet */
	if (game.upgrades.Potency.done > 0) potencyMod = potencyMod.mul(Math.pow(1.1, game.upgrades.Potency.done));
	if (game.buildings.Nursery.owned > 0) potencyMod = potencyMod.mul(Math.pow(1.01, game.buildings.Nursery.owned));
	if (game.unlocks.impCount.Venimp > 0) potencyMod = potencyMod.mul(Math.pow(1.003, game.unlocks.impCount.Venimp));
	if (game.global.brokenPlanet) potencyMod = potencyMod.div(10);

	/* pheromones */
	potencyMod = potencyMod.mul(1 + getPerkLevel('Pheromones') * getPerkModifier('Pheromones'));

	/* quick trimps */
	if (game.singleRunBonuses.quickTrimps.owned) potencyMod = potencyMod.mul(2);

	/* dailies */
	if (challengeActive('Daily')) {
		/* dysfunctional */
		if (typeof game.global.dailyChallenge.dysfunctional !== 'undefined') potencyMod = potencyMod.mul(dailyModifiers.dysfunctional.getMult(game.global.dailyChallenge.dysfunctional.strength));

		/* toxic */
		if (typeof game.global.dailyChallenge.toxic !== 'undefined') potencyMod = potencyMod.mul(dailyModifiers.toxic.getMult(game.global.dailyChallenge.toxic.strength, game.global.dailyChallenge.toxic.stacks));
	}

	/* toxicity */
	if (challengeActive('Toxicity') && game.challenges.Toxicity.stacks > 0) potencyMod = potencyMod.mul(Math.pow(game.challenges.Toxicity.stackMult, game.challenges.Toxicity.stacks));

	/* void maps (slow breed) */
	if (game.global.voidBuff === 'slowBreed') potencyMod = potencyMod.mul(0.2);

	/* heirlooms */
	potencyMod = calcHeirloomBonusDecimal('Shield', 'breedSpeed', potencyMod);

	/* geneticists */
	if (game.jobs.Geneticist.owned > 0) potencyMod = potencyMod.mul(Math.pow(0.98, game.jobs.Geneticist.owned));

	if (game.global.universe === 2) {
		if (challengeActive('Archaeology')) potencyMod = potencyMod.mul(game.challenges.Archaeology.getStatMult('breed'));
		if (challengeActive('Quagmire')) potencyMod = potencyMod.mul(game.challenges.Quagmire.getExhaustMult());
		if (u2Mutations.tree.GeneAttack.purchased) potencyMod = potencyMod.div(50);
		if (u2Mutations.tree.GeneHealth.purchased) potencyMod = potencyMod.div(50);
	}

	return potencyMod.div(10).add(1);
}

function _getPotencyMod(extraNurseries = 0) {
	let potencyMod = game.resources.trimps.potency;

	if (game.upgrades.Potency.done > 0) potencyMod *= Math.pow(1.1, game.upgrades.Potency.done);
	if (game.buildings.Nursery.owned > 0) potencyMod *= Math.pow(1.01, game.buildings.Nursery.owned + extraNurseries);
	if (game.unlocks.impCount.Venimp > 0) potencyMod *= Math.pow(1.003, game.unlocks.impCount.Venimp);
	if (game.global.brokenPlanet) potencyMod /= 10;

	potencyMod *= 1 + getPerkLevel('Pheromones') * getPerkModifier('Pheromones');

	if (game.singleRunBonuses.quickTrimps.owned) potencyMod *= 2;

	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.dysfunctional !== 'undefined') potencyMod *= dailyModifiers.dysfunctional.getMult(game.global.dailyChallenge.dysfunctional.strength);

		if (typeof game.global.dailyChallenge.toxic !== 'undefined') potencyMod *= dailyModifiers.toxic.getMult(game.global.dailyChallenge.toxic.strength, game.global.dailyChallenge.toxic.stacks);
	}

	if (challengeActive('Toxicity') && game.challenges.Toxicity.stacks > 0) potencyMod *= Math.pow(game.challenges.Toxicity.stackMult, game.challenges.Toxicity.stacks);

	if (game.global.voidBuff === 'slowBreed') potencyMod *= 0.2;

	/* heirlooms */
	potencyMod = calcHeirloomBonus('Shield', 'breedSpeed', potencyMod);

	if (game.jobs.Geneticist.owned > 0) potencyMod *= Math.pow(0.98, game.jobs.Geneticist.owned);

	if (game.global.universe === 2) {
		if (challengeActive('Archaeology')) potencyMod *= game.challenges.Archaeology.getStatMult('breed');
		if (challengeActive('Quagmire')) potencyMod *= game.challenges.Quagmire.getExhaustMult();
		if (u2Mutations.tree.GeneAttack.purchased) potencyMod /= 50;
		if (u2Mutations.tree.GeneHealth.purchased) potencyMod /= 50;
	}

	return potencyMod / 10 + 1;
}

function breedTotalTime() {
	const trimps = game.resources.trimps;
	const trimpsMax = trimps.realMax();

	const maxBreedable = new atData.breedtimer.DecimalBreed(trimpsMax).minus(trimpsEffectivelyEmployed());
	const breeding = maxBreedable.minus(trimps.getCurrentSend());

	return atData.breedtimer.DecimalBreed.log10(maxBreedable.div(breeding)).div(atData.breedtimer.DecimalBreed.log10(getPotencyMod())).div(10);
}

function _breedTotalTime() {
	const trimps = game.resources.trimps;
	const trimpsMax = trimps.realMax();

	const maxBreedable = trimpsMax - trimpsEffectivelyEmployed();
	const breeding = maxBreedable - trimps.getCurrentSend();

	return Math.log10(maxBreedable / breeding) / Math.log10(_getPotencyMod()) / 10;
}

function breedTimeRemaining() {
	const trimps = game.resources.trimps;
	const trimpsMax = trimps.realMax();
	const trimpsEmployed = trimpsEffectivelyEmployed();

	const breeding = new atData.breedtimer.DecimalBreed(trimps.owned).minus(trimpsEmployed);
	if (breeding <= 0) return new DecimalBreed(Infinity);

	const maxBreedable = new atData.breedtimer.DecimalBreed(trimpsMax).minus(trimpsEmployed);
	return atData.breedtimer.DecimalBreed.log10(maxBreedable.div(breeding)).div(atData.breedtimer.DecimalBreed.log10(getPotencyMod())).div(10);
}

/* this version doesn't use decimal.js to calculate breedtimer for trap calculations */
function _breedTimeRemaining() {
	const trimps = game.resources.trimps;
	const trimpsMax = trimps.realMax();
	const trimpsEmployed = trimpsEffectivelyEmployed();

	const maxBreedable = trimpsMax - trimpsEmployed;
	const breeding = Math.floor(trimps.owned) - trimpsEmployed;
	if (maxBreedable <= 0 || breeding <= 0) return Infinity;

	const potencyMod = _getPotencyMod();
	if (potencyMod === 0) return Infinity;

	return Math.log10(maxBreedable / breeding) / Math.log10(potencyMod) / 10;
}

function geneAssist() {
	if (!_shouldRunGeneAssist()) return;

	/* disables ingame setting if using AT setting. */
	if (game.global.GeneticistassistSetting !== -1) {
		game.global.GeneticistassistSetting = -1;
		toggleGeneticistassist(true);
	}

	while (game.options.menu.gaFire.enabled !== 1) toggleSetting('gaFire');

	const timeRemaining = breedTimeRemaining();
	const compareTime = _getCompareTime(timeRemaining);
	const target = _getTargetTimer();
	if (!target) return;
	const genDif = _getGenDifference(compareTime, target);

	if ((compareTime.cmp(target) < 0) & _geneticistCost() & (genDif.cmp(0) > 0)) _hireGenes(genDif);
	else if ((compareTime.mul(0.98).cmp(target) > 0 && timeRemaining.cmp(1) > 0) || getPotencyMod().cmp(1) === 0) _fireGenes(genDif);
}

function _shouldRunGeneAssist() {
	if (game.jobs.Geneticist.locked | !getPageSetting('geneAssist') | challengeActive('Trapper') | (getPageSetting('geneAssistTimer') <= 0) | (getPageSetting('geneAssistPercent') <= 0)) return false;

	if (getPerkLevel('Anticipation') > 0 && usingBreedHeirloom() && getPageSetting('heirloomBreedAnticipation')) return false;

	return true;
}

function _getTargetTimer() {
	const angelic = masteryPurchased('angelic');
	const runningElectricity = challengeActive('Electricity') || challengeActive('Mapocalypse');
	let runningHard;
	let target;
	if (trimpStats.isDaily) runningHard = (!angelic && typeof game.global.dailyChallenge.bogged !== 'undefined') || typeof game.global.dailyChallenge.plague !== 'undefined';
	else runningHard = !angelic && (challengeActive('Nom') || challengeActive('Toxicity') || challengeActive('Lead'));

	const settingAffix = trimpStats.isOneOff && getPageSetting('geneAssistTimerSpireOneOff') > 0 ? 'OneOff' : trimpStats.isC3 && getPageSetting('geneAssistTimerSpireC2') > 0 ? 'C2' : trimpStats.isDaily && getPageSetting('geneAssistTimerSpireDaily') > 0 ? 'Daily' : '';

	/* priority system for which timer to use.
		1. Hard Dailies 
		2. Hard Challenges
		3. Electricity
		4. Void Bleed
		5. Spire Timers
		6. One Off Timers
		7. C2 Timers
		8. Daily Timers
		9. After Zone Timer
		10. Before Zone Timer
		11. Regular Timer
		12. Return false since no set timer
	*/

	if (getPageSetting('geneAssistTimerDailyHard') > 0 && trimpStats.isDaily && runningHard) target = getPageSetting('geneAssistTimerDailyHard');
	else if (runningHard && getPageSetting('geneAssistTimerHard') > 0) target = getPageSetting('geneAssistTimerHard');
	else if (runningElectricity && getPageSetting('geneAssistTimerElectricity') > 0) target = getPageSetting('geneAssistTimerElectricity');
	else if (game.global.voidBuff === 'bleed' && hdStats.hitsSurvivedVoid !== Infinity && getPageSetting('geneAssistTimerBleedVoids') > 0) target = getPageSetting('geneAssistTimerBleedVoids');
	else if (getPageSetting('geneAssistTimerSpire' + settingAffix) > 0 && isDoingSpire()) target = getPageSetting('geneAssistTimerSpire' + settingAffix);
	else if (trimpStats.isOneOff && !runningHard && getPageSetting('geneAssistTimerOneOff') > 0) target = getPageSetting('geneAssistTimerOneOff');
	else if (trimpStats.isC3 && !runningHard && getPageSetting('geneAssistTimerC2') > 0) target = getPageSetting('geneAssistTimerC2');
	else if (getPageSetting('geneAssistTimerDaily') > 0 && trimpStats.isDaily) target = getPageSetting('geneAssistTimerDaily');
	else if (getPageSetting('geneAssistZoneAfter') > 0 && getPageSetting('geneAssistTimerAfter') > 0 && game.global.world >= getPageSetting('geneAssistZoneAfter')) target = getPageSetting('geneAssistTimerAfter');
	else if (getPageSetting('geneAssistZoneBefore') > 0 && getPageSetting('geneAssistTimerBefore') > 0 && game.global.world < getPageSetting('geneAssistZoneBefore')) target = getPageSetting('geneAssistTimerBefore');
	else if (getPageSetting('geneAssistTimer') > 0) target = getPageSetting('geneAssistTimer');
	else return false;

	return new Decimal(target);
}

function _getCompareTime(timeRemaining) {
	const totalTime = breedTotalTime();
	const now = new Date().getTime();
	const breedTime = game.jobs.Amalgamator.owned > 0 ? (now - game.global.lastSoldierSentAt) / 1000 : game.global.lastBreedTime / 1000;

	let compareTime;
	if (timeRemaining.cmp(0.5) > 0) compareTime = timeRemaining.add(breedTime);
	else compareTime = totalTime.cmp(0) === 0 ? new Decimal(Infinity) : totalTime;

	if (!compareTime.isFinite()) return new Decimal(999);
	return new atData.breedtimer.DecimalBreed(compareTime);
}

function _getGenDifference(compareTime, target) {
	const breed = Decimal.log10(target.div(compareTime)).div(Decimal.log10(1.02));
	return new atData.breedtimer.DecimalBreed(breed).ceil();
}

function _geneticistCost(amount = 1) {
	const spendingPct = getPageSetting('geneAssistPercent') / 100;
	const geneticist = game.jobs.Geneticist;
	return game.resources.food.owned * spendingPct > resolvePow(geneticist.cost.food, geneticist, amount);
}

function _hireGenes(genDif) {
	const genesToBuyOptions = [Math.max(genDif.abs().toNumber()), 500, 100, 50, 10, 5, 1];
	const genesToBuy = genesToBuyOptions.find((gene) => _geneticistCost(gene));

	if (genesToBuy) {
		debug(`Hiring ${prettify(genesToBuy)} Geneticist${addAnS(genesToBuy)}`, 'jobs', '*users');
		addGeneticist(genesToBuy);
	}
}

function _fireGenes(genDif) {
	if (!genDif.isFinite()) genDif = new Decimal(-1);
	if (genDif.cmp(0) < 0) {
		const genesToFire = Math.max(Math.floor(genDif.abs().toNumber() * 0.8), 1);
		debug(`Firing ${prettify(genesToFire)} Geneticist${addAnS(genesToFire)}`, 'jobs', '*users');
		removeGeneticist(genesToFire);
	}
}
