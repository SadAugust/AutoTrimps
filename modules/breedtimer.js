MODULES["breedtimer"] = {};

var DecimalBreed = Decimal.clone({ precision: 30, rounding: 4 });
var missingTrimps = new DecimalBreed(0);

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
	var breeding = new DecimalBreed(trimps.owned).minus(trimpsEffectivelyEmployed());

	//Gets the modifier, then: 1.1x format -> 0.1 format -> 1.0 x breeding
	return potencyMod().minus(1).mul(10).mul(breeding);
}

function potencyMod() {
	//Init
	var trimps = game.resources.trimps;
	var potencyMod = new DecimalBreed(trimps.potency);

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
	if (game.global.voidBuff == "slowBreed")
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
	//Gene Attack
	if (game.global.universe == 2 && u2Mutations.tree.GeneAttack.purchased) potencyMod = potencyMod.div(50);
	//Gene Health
	if (game.global.universe == 2 && u2Mutations.tree.GeneHealth.purchased) potencyMod = potencyMod.div(50);

	return potencyMod.div(10).add(1);
}

function breedTotalTime() {
	//Init
	var trimps = game.resources.trimps;
	var trimpsMax = trimps.realMax();

	//Calc
	var maxBreedable = new DecimalBreed(trimpsMax).minus(trimpsEffectivelyEmployed());
	var breeding = maxBreedable.minus(trimps.getCurrentSend());

	return DecimalBreed.log10(maxBreedable.div(breeding)).div(DecimalBreed.log10(potencyMod())).div(10);
}

function breedTimeRemaining() {
	//Init
	var trimps = game.resources.trimps;
	var trimpsMax = trimps.realMax();

	//Calc
	var maxBreedable = new DecimalBreed(trimpsMax).minus(trimpsEffectivelyEmployed());
	var breeding = new DecimalBreed(trimps.owned).minus(trimpsEffectivelyEmployed());
	return DecimalBreed.log10(maxBreedable.div(breeding)).div(DecimalBreed.log10(potencyMod())).div(10);
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

	var runningHard = challengeActive('Electricity') || challengeActive('Toxicity') || challengeActive('Nom');
	if (challengeActive('Daily'))
		runningHard = (typeof game.global.dailyChallenge.bogged !== 'undefined' || typeof game.global.dailyChallenge.plague !== 'undefined');


	if (getPageSetting('geneAssistTimer') > 0)
		target = new Decimal(getPageSetting('geneAssistTimer'));

	if (getPageSetting('geneAssistZoneBefore') > 0 && getPageSetting('geneAssistTimerBefore') > 0 && game.global.world < getPageSetting('geneAssistZoneBefore'))
		target = new Decimal(getPageSetting('geneAssistTimerBefore'));
	if (getPageSetting('geneAssistZoneAfter') > 0 && getPageSetting('geneAssistTimerAfter') > 0 && game.global.world >= getPageSetting('geneAssistZoneAfter'))
		target = new Decimal(getPageSetting('geneAssistTimerAfter'));

	if (game.global.runningChallengeSquared && !runningHard && getPageSetting('geneAssistTimerC2') > 0)
		target = new Decimal(getPageSetting('geneAssistTimerC2'));
	if (game.global.runningChallengeSquared && runningHard && getPageSetting('geneAssistTimerC2Hard') > 0)
		target = new Decimal(getPageSetting('geneAssistTimerC2Hard'));

	if (getPageSetting('geneAssistTimerDaily') > 0 && challengeActive('Daily'))
		target = new Decimal(getPageSetting('geneAssistTimerDaily'));
	if (getPageSetting('geneAssistTimerDailyHard') > 0 && challengeActive('Daily') && runningHard)
		target = new Decimal(getPageSetting('geneAssistTimerDailyHard'));
	var settingPrefix = challengeActive('Daily') && getPageSetting('geneAssistTimerSpireDaily') > 0 ? 'Daily' : '';
	if (getPageSetting('geneAssistTimerSpire' + settingPrefix) > 0 && isDoingSpire())
		target = new Decimal(getPageSetting('geneAssistTimerSpire' + settingPrefix));

	var now = new Date().getTime();
	var thresh = new DecimalBreed(totalTime.mul(0.02));
	var compareTime;
	if (timeRemaining.cmp(1) > 0 && timeRemaining.cmp(target.add(1)) > 0) {
		compareTime = new DecimalBreed(timeRemaining.add(-1));
	}
	else {
		compareTime = new DecimalBreed(totalTime);
	}
	if (!thresh.isFinite()) thresh = new Decimal(0);
	if (!compareTime.isFinite()) compareTime = new Decimal(999);
	var genDif = new DecimalBreed(Decimal.log10(target.div(compareTime)).div(Decimal.log10(1.02))).ceil();

	if (compareTime.cmp(target) < 0) {
		if (game.resources.food.owned * (getPageSetting('geneAssistPercent') / 100) < getNextGeneticistCost()) { return; }
		else if (timeRemaining.cmp(1) < 0 || target.minus((now - game.global.lastSoldierSentAt) / 1000).cmp(timeRemaining) > 0) {
			if (genDif.cmp(0) > 0) {
				if (genDif.cmp(10) > 0) genDif = new Decimal(10);
				addGeneticist(genDif.toNumber());
			}
		}
	}
	else if (compareTime.add(thresh.mul(-1)).cmp(target) > 0 || (potencyMod().cmp(1) == 0)) {
		if (!genDif.isFinite()) genDif = new Decimal(-1);
		if (genDif.cmp(0) < 0 && game.options.menu.gaFire.enabled != 2) {
			if (genDif.cmp(-10) < 0) genDif = new Decimal(-10);
			removeGeneticist(genDif.abs().toNumber());
		}
	}
}

function forceAbandonTrimps() {
	if (!getPageSetting('ForceAbandon')) return;
	if (!getPageSetting('autoMaps')) return;
	if (!game.global.mapsUnlocked) return;
	if (game.global.preMapsActive) return;
	//Exit and restart the map. If we are in the world, enter the world again.
	if (game.global.mapsActive) {
		mapsClicked(true);
		runMap();
	}
	else {
		mapsClicked(true);
		mapsClicked(true);
	}
}