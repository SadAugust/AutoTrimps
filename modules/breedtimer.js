MODULES.breedtimer = {
	DecimalBreed: Decimal.clone({ precision: 30, rounding: 4 }),
	missingTrimps: new this.DecimalBreed(0)
};

function trimpsEffectivelyEmployed() {
	//Init
	var employedTrimps = game.resources.trimps.employed;

	//Multitasking
	if (game.permaBoneBonuses.multitasking.owned)
		employedTrimps *= (1 - game.permaBoneBonuses.multitasking.mult());

	return employedTrimps;
}

function breedingPS() {
	//Init
	var trimps = game.resources.trimps;
	var breeding = new MODULES.breedtimer.DecimalBreed(trimps.owned).minus(trimpsEffectivelyEmployed());

	//Gets the modifier, then: 1.1x format -> 0.1 format -> 1.0 x breeding
	return potencyMod().minus(1).mul(10).mul(breeding);
}

function potencyMod() {
	//Init
	var trimps = game.resources.trimps;
	var potencyMod = new MODULES.breedtimer.DecimalBreed(trimps.potency);

	//Potency, Nurseries, Venimp, Broken Planet
	if (game.upgrades.Potency.done > 0) potencyMod = potencyMod.mul(Math.pow(1.1, game.upgrades.Potency.done));
	if (game.buildings.Nursery.owned > 0) potencyMod = potencyMod.mul(Math.pow(1.01, game.buildings.Nursery.owned));
	if (game.unlocks.impCount.Venimp > 0) potencyMod = potencyMod.mul(Math.pow(1.003, game.unlocks.impCount.Venimp));
	if (game.global.brokenPlanet) potencyMod = potencyMod.div(10);

	//Pheromones
	potencyMod = potencyMod.mul(1 + (game.portal.Pheromones.level * game.portal.Pheromones.modifier));

	//Quick Trimps
	if (game.singleRunBonuses.quickTrimps.owned) potencyMod = potencyMod.mul(2);

	//Dailies
	if (challengeActive('Daily')) {
		//Dysfunctional
		if (typeof game.global.dailyChallenge.dysfunctional !== 'undefined')
			potencyMod = potencyMod.mul(dailyModifiers.dysfunctional.getMult(game.global.dailyChallenge.dysfunctional.strength));

		//Toxic
		if (typeof game.global.dailyChallenge.toxic !== 'undefined')
			potencyMod = potencyMod.mul(dailyModifiers.toxic.getMult(game.global.dailyChallenge.toxic.strength, game.global.dailyChallenge.toxic.stacks));
	}

	//Toxicity
	if (challengeActive('Toxicity') && game.challenges.Toxicity.stacks > 0)
		potencyMod = potencyMod.mul(Math.pow(game.challenges.Toxicity.stackMult, game.challenges.Toxicity.stacks));

	//Void Maps (Slow Breed)
	if (game.global.voidBuff === "slowBreed")
		potencyMod = potencyMod.mul(0.2);

	//Heirlooms
	potencyMod = calcHeirloomBonusDecimal("Shield", "breedSpeed", potencyMod);

	//Geneticists
	if (game.jobs.Geneticist.owned > 0)
		potencyMod = potencyMod.mul(Math.pow(.98, game.jobs.Geneticist.owned));

	//Archaeology
	if (challengeActive('Archaeology'))
		potencyMod = potencyMod.mul(game.challenges.Archaeology.getStatMult('breed'));

	//Quagmire
	if (challengeActive('Quagmire')) {
		potencyMod = potencyMod.mul(game.challenges.Quagmire.getExhaustMult());
	}
	//Mutators
	if (game.global.universe === 2) {
		//Gene Attack
		if (u2Mutations.tree.GeneAttack.purchased) potencyMod = potencyMod.div(50);
		//Gene Health
		if (u2Mutations.tree.GeneHealth.purchased) potencyMod = potencyMod.div(50);
	}
	return potencyMod.div(10).add(1);
}

function breedTotalTime() {
	//Init
	var trimps = game.resources.trimps;
	var trimpsMax = trimps.realMax();

	//Calc
	var maxBreedable = new MODULES.breedtimer.DecimalBreed(trimpsMax).minus(trimpsEffectivelyEmployed());
	var breeding = maxBreedable.minus(trimps.getCurrentSend());

	return MODULES.breedtimer.DecimalBreed.log10(maxBreedable.div(breeding)).div(MODULES.breedtimer.DecimalBreed.log10(potencyMod())).div(10);
}

function breedTimeRemaining() {
	//Init
	var trimps = game.resources.trimps;
	var trimpsMax = trimps.realMax();

	//Calc
	var maxBreedable = new MODULES.breedtimer.DecimalBreed(trimpsMax).minus(trimpsEffectivelyEmployed());
	var breeding = new MODULES.breedtimer.DecimalBreed(trimps.owned).minus(trimpsEffectivelyEmployed());
	return MODULES.breedtimer.DecimalBreed.log10(maxBreedable.div(breeding)).div(MODULES.breedtimer.DecimalBreed.log10(potencyMod())).div(10);
}

function geneAssist() {
	if (!getPageSetting('geneAssist')) return;
	if (game.jobs.Geneticist.locked) return;
	if (challengeActive('Trapper')) return;
	if (getPageSetting('geneAssistTimer') <= 0) return;
	if (getPageSetting('geneAssistPercent') <= 0) return;

	//Disables ingame setting if using AT setting.
	if (game.global.GeneticistassistSetting !== -1) {
		game.global.GeneticistassistSetting = -1;
		toggleGeneticistassist(true);
	}

	var timeRemaining = breedTimeRemaining();
	var totalTime = breedTotalTime();

	var target;

	const angelic = mastery('angelic');
	const runningElectricity = challengeActive('Electricity') || challengeActive('Mapocalypse');
	var runningHard;
	if (challengeActive('Daily'))
		runningHard = (!angelic && typeof game.global.dailyChallenge.bogged !== 'undefined') || typeof game.global.dailyChallenge.plague !== 'undefined';
	else
		runningHard = !angelic && (challengeActive('Nom') || challengeActive('Toxicity') || challengeActive('Lead'));

	const settingPrefix = trimpStats.isC3 && getPageSetting('geneAssistTimerSpireC2') > 0 ? 'C2' :
		trimpStats.isDaily && getPageSetting('geneAssistTimerSpireDaily') > 0 ? 'Daily' :
			'';

	//Priority system for which timer to use.
	//1. Hard Dailies
	if (getPageSetting('geneAssistTimerDailyHard') > 0 && trimpStats.isDaily && runningHard)
		target = new Decimal(getPageSetting('geneAssistTimerDailyHard'));
	//2. Hard Challenges
	else if (runningHard && getPageSetting('geneAssistTimerHard') > 0)
		target = new Decimal(getPageSetting('geneAssistTimerHard'));
	//3. Electricity
	else if (runningElectricity && getPageSetting('geneAssistTimerElectricity') > 0)
		target = new Decimal(getPageSetting('geneAssistTimerElectricity'));
	//4. Spire Timers
	else if (getPageSetting('geneAssistTimerSpire' + settingPrefix) > 0 && isDoingSpire())
		target = new Decimal(getPageSetting('geneAssistTimerSpire' + settingPrefix));
	//5. Daily Timers
	else if (getPageSetting('geneAssistTimerDaily') > 0 && trimpStats.isDaily)
		target = new Decimal(getPageSetting('geneAssistTimerDaily'));
	//6. C2 Timers
	else if (trimpStats.isC3 && !runningHard && getPageSetting('geneAssistTimerC2') > 0)
		target = new Decimal(getPageSetting('geneAssistTimerC2'));
	//7. After Zone Timer
	else if (getPageSetting('geneAssistZoneAfter') > 0 && getPageSetting('geneAssistTimerAfter') > 0 && game.global.world >= getPageSetting('geneAssistZoneAfter'))
		target = new Decimal(getPageSetting('geneAssistTimerAfter'));
	//8. Before Zone Timer
	else if (getPageSetting('geneAssistZoneBefore') > 0 && getPageSetting('geneAssistTimerBefore') > 0 && game.global.world < getPageSetting('geneAssistZoneBefore'))
		target = new Decimal(getPageSetting('geneAssistTimerBefore'));
	//9. Regular Timer
	else if (getPageSetting('geneAssistTimer') > 0)
		target = new Decimal(getPageSetting('geneAssistTimer'));
	//If no timer is set, return.
	else
		return;

	var now = new Date().getTime();
	var breedTime = (game.jobs.Amalgamator.owned > 0) ? (now - game.global.lastSoldierSentAt) / 1000 : game.global.lastBreedTime / 1000;
	var compareTime;
	if (timeRemaining.cmp(0.5) > 0) {
		compareTime = new MODULES.breedtimer.DecimalBreed(timeRemaining.add(breedTime));
	}
	else {
		compareTime = new MODULES.breedtimer.DecimalBreed(totalTime);
	}
	if (!compareTime.isFinite()) compareTime = new Decimal(999);
	var genDif = new MODULES.breedtimer.DecimalBreed(Decimal.log10(target.div(compareTime)).div(Decimal.log10(1.02))).ceil();

	if (compareTime.cmp(target) < 0) {
		if (game.resources.food.owned * (getPageSetting('geneAssistPercent') / 100) < getNextGeneticistCost()) return;
		if (genDif.cmp(0) > 0) {
			if (genDif.cmp(10) > 0) genDif = new Decimal(10);
			addGeneticist(genDif.toNumber());
		}
	}
	else if ((compareTime.mul(0.98).cmp(target) > 0 && timeRemaining.cmp(1) > 0) || (potencyMod().cmp(1) === 0)) {
		if (!genDif.isFinite()) genDif = new Decimal(-1);
		if (genDif.cmp(0) < 0 && game.options.menu.gaFire.enabled !== 2) {
			if (genDif.cmp(-10) < 0) genDif = new Decimal(-10);
			removeGeneticist(genDif.abs().toNumber());
		}
	}
}