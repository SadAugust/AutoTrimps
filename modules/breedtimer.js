MODULES["breedtimer"] = {};
MODULES["breedtimer"].voidCheckPercent = 95;

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

	//Arch
	if (challengeActive('Archaeology'))
		potencyMod = potencyMod.mul(game.challenges.Archaeology.getStatMult('breed'));

	if (game.global.challengeActive == "Quagmire") {
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

var DecimalBreed = Decimal.clone({ precision: 30, rounding: 4 });
var missingTrimps = new DecimalBreed(0);
function ATGA2() {
	if (!getPageSetting('ATGA2')) return;
	if (game.jobs.Geneticist.locked == false && getPageSetting('ATGA2') == true && getPageSetting('ATGA2timer') > 0 && !challengeActive('Trapper')) {
		var trimps = game.resources.trimps;
		var trimpsMax = trimps.realMax();
		var maxBreedable = new DecimalBreed(trimpsMax).minus(trimpsEffectivelyEmployed());
		var potencyMod = new DecimalBreed(trimps.potency);
		if (game.upgrades.Potency.done > 0) potencyMod = potencyMod.mul(Math.pow(1.1, game.upgrades.Potency.done));
		if (game.buildings.Nursery.owned > 0) potencyMod = potencyMod.mul(Math.pow(1.01, game.buildings.Nursery.owned));
		if (game.unlocks.impCount.Venimp > 0) potencyMod = potencyMod.mul(Math.pow(1.003, game.unlocks.impCount.Venimp));
		if (game.global.brokenPlanet) potencyMod = potencyMod.div(10);
		potencyMod = potencyMod.mul(1 + (game.portal.Pheromones.level * game.portal.Pheromones.modifier));
		if (game.singleRunBonuses.quickTrimps.owned) potencyMod = potencyMod.mul(2);
		if (challengeActive('Daily')) {
			if (typeof game.global.dailyChallenge.dysfunctional !== 'undefined') {
				potencyMod = potencyMod.mul(dailyModifiers.dysfunctional.getMult(game.global.dailyChallenge.dysfunctional.strength));
			}
			if (typeof game.global.dailyChallenge.toxic !== 'undefined') {
				potencyMod = potencyMod.mul(dailyModifiers.toxic.getMult(game.global.dailyChallenge.toxic.strength, game.global.dailyChallenge.toxic.stacks));
			}
		}
		if (challengeActive('Toxicity') && game.challenges.Toxicity.stacks > 0) {
			potencyMod = potencyMod.mul(Math.pow(game.challenges.Toxicity.stackMult, game.challenges.Toxicity.stacks));
		}
		if (game.global.voidBuff == "slowBreed") {
			potencyMod = potencyMod.mul(0.2);
		}
		potencyMod = calcHeirloomBonusDecimal("Shield", "breedSpeed", potencyMod);
		if (game.jobs.Geneticist.owned > 0) potencyMod = potencyMod.mul(Math.pow(.98, game.jobs.Geneticist.owned));
		potencyMod = potencyMod.div(10).add(1);
		var decimalOwned = missingTrimps.add(trimps.owned);
		var timeRemaining = DecimalBreed.log10(maxBreedable.div(decimalOwned.minus(trimpsEffectivelyEmployed()))).div(DecimalBreed.log10(potencyMod)).div(10);
		var currentSend = game.resources.trimps.getCurrentSend();
		var totalTime = DecimalBreed.log10(maxBreedable.div(maxBreedable.minus(currentSend))).div(DecimalBreed.log10(potencyMod)).div(10);

		var target;
		if (getPageSetting('ATGA2timer') > 0)
			target = new Decimal(getPageSetting('ATGA2timer'));

		if (getPageSetting('zATGA2timer') > 0 && getPageSetting('ztATGA2timer') > 0 && game.global.world < getPageSetting('zATGA2timer'))
			target = new Decimal(getPageSetting('ztATGA2timer'));
		if (getPageSetting('ATGA2timerz') > 0 && getPageSetting('ATGA2timerzt') > 0 && game.global.world >= getPageSetting('ATGA2timerz'))
			target = new Decimal(getPageSetting('ATGA2timerzt'));

		if (game.global.runningChallengeSquared && getPageSetting('cATGA2timer') > 0 && !challengeActive('Electricity') && !challengeActive('Toxicity') && !challengeActive('Nom'))
			target = new Decimal(getPageSetting('cATGA2timer'));
		if (game.global.runningChallengeSquared && getPageSetting('chATGA2timer') > 0 && (challengeActive('Electricity') || challengeActive('Toxicity') || challengeActive('Nom')))
			target = new Decimal(getPageSetting('chATGA2timer'));

		if (getPageSetting('dATGA2timer') > 0 && challengeActive('Daily'))
			target = new Decimal(getPageSetting('dATGA2timer'));
		if (getPageSetting('dhATGA2timer') > 0 && challengeActive('Daily') && (typeof game.global.dailyChallenge.bogged !== 'undefined' || typeof game.global.dailyChallenge.plague !== 'undefined' || typeof game.global.dailyChallenge.pressure !== 'undefined'))
			target = new Decimal(getPageSetting('dhATGA2timer'));

		if (!challengeActive('Daily') && getPageSetting('sATGA2timer') > 0 && isActiveSpireAT() == true)
			target = new Decimal(getPageSetting('sATGA2timer'));
		if (challengeActive('Daily') && getPageSetting('dsATGA2timer') > 0 && disActiveSpireAT() == true)
			target = new Decimal(getPageSetting('dsATGA2timer'));

		if (
			(getPageSetting('dATGA2Auto') == 2 ||
				(getPageSetting('dATGA2Auto') == 1 && disActiveSpireAT() && challengeActive('Daily'))
			)
			&& challengeActive('Daily') && (typeof game.global.dailyChallenge.bogged !== 'undefined' || typeof game.global.dailyChallenge.plague !== 'undefined')
		) {
			plagueDamagePerStack = (game.global.dailyChallenge.plague !== undefined) ? dailyModifiers.plague.getMult(game.global.dailyChallenge.plague.strength, 1) : 0;
			boggedDamage = (game.global.dailyChallenge.bogged !== undefined) ? dailyModifiers.bogged.getMult(game.global.dailyChallenge.bogged.strength) : 0;
			atl = Math.ceil((Math.sqrt((plagueDamagePerStack / 2 + boggedDamage) ** 2 - 2 * plagueDamagePerStack * (boggedDamage - 1)) - (plagueDamagePerStack / 2 + boggedDamage)) / plagueDamagePerStack);
			target = new Decimal(Math.ceil(isNaN(atl) ? target : atl / 1000 * (((game.portal.Agility.level) ? 1000 * Math.pow(1 - game.portal.Agility.modifier, game.portal.Agility.level) : 1000) + ((game.talents.hyperspeed2.purchased && (game.global.world <= Math.floor((game.global.highestLevelCleared + 1) * 0.5))) || (game.global.mapExtraBonus == "fa")) * -100 + (game.talents.hyperspeed.purchased) * -100)));
		}

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
			if (game.resources.food.owned * (getPageSetting('ATGA2gen') / 100) < getNextGeneticistCost()) { return; }
			else if (timeRemaining.cmp(1) < 0 || target.minus((now - game.global.lastSoldierSentAt) / 1000).cmp(timeRemaining) > 0) {
				if (genDif.cmp(0) > 0) {
					if (genDif.cmp(10) > 0) genDif = new Decimal(10);
					addGeneticist(genDif.toNumber());
				}
			}
		}
		else if (compareTime.add(thresh.mul(-1)).cmp(target) > 0 || (potencyMod.cmp(1) == 0)) {
			if (!genDif.isFinite()) genDif = new Decimal(-1);
			if (genDif.cmp(0) < 0 && game.options.menu.gaFire.enabled != 2) {
				if (genDif.cmp(-10) < 0) genDif = new Decimal(-10);
				removeGeneticist(genDif.abs().toNumber());
			}
		}
	}
}

var addbreedTimerInsideText;
function addBreedingBoxTimers() {
	if (document.getElementById('hiddenBreedTimer') === null) {
		var breedbarContainer = document.querySelector('#trimps > div.row').children[1];
		var addbreedTimerContainer = document.createElement("DIV");
		addbreedTimerContainer.setAttribute('id', "hiddenBreedTimer");
		addbreedTimerContainer.setAttribute('class', "col-xs-11");
		addbreedTimerContainer.setAttribute('style', 'padding-right: 0;');
		addbreedTimerContainer.setAttribute("onmouseover", 'tooltip("Hidden Next Group Breed Timer", "customText", event, "How long your next army has been breeding for, or how many anticipation stacks you will have if you send a new army now.")');
		addbreedTimerContainer.setAttribute("onmouseout", 'tooltip("hide")');
		var addbreedTimerInside = document.createElement("DIV");
		addbreedTimerInside.setAttribute('style', 'display: block;');
		var addbreedTimerInsideIcon = document.createElement("SPAN");
		addbreedTimerInsideIcon.setAttribute('class', "icomoon icon-clock");
		addbreedTimerInsideText = document.createElement("SPAN");
		addbreedTimerInsideText.id = 'hiddenBreedTimer';
		document.querySelector('#trimps').children[1].style.fontSize = '1.3vw'
		document.querySelector('#trimps').children[4].style.fontSize = '1.1vw'
		document.querySelector('#trimps').children[5].style.fontSize = '1.3vw'
		addbreedTimerInside.appendChild(addbreedTimerInsideIcon);
		addbreedTimerInside.appendChild(addbreedTimerInsideText);
		addbreedTimerContainer.appendChild(addbreedTimerInside);
		breedbarContainer.appendChild(addbreedTimerContainer);
	}
}
addBreedingBoxTimers();

function removeBreedingBoxTimer() {
	if (document.getElementById('hiddenBreedTimer') !== null) {
		document.getElementById('hiddenBreedTimer').remove()
	}
	document.querySelector('#trimps').children[1].style.fontSize = '1.3vw'
	document.querySelector('#trimps').children[4].style.fontSize = '1.1vw'
	document.querySelector('#trimps').children[5].style.fontSize = '1.3vw'
}
removeBreedingBoxTimer();

function addToolTipToArmyCount() { var a = document.getElementById("trimpsFighting"); "tooltipadded" != a.className && (a.setAttribute("onmouseover", "tooltip(\"Army Count\", \"customText\", event, \"To Fight now would add: \" + prettify(getArmyTime()) + \" seconds to the breed timer.\")"), a.setAttribute("onmouseout", "tooltip(\"hide\")"), a.setAttribute("class", "tooltipadded")) }

function abandonVoidMap() {
	var customVars = MODULES["breedtimer"];
	if (!getPageSetting('ForceAbandon')) return;
	if (game.global.mapsActive && getCurrentMapObject().location == "Void") {
		if (game.portal.Anticipation.level) {
			var antistacklimitv = 45;
			if (!game.talents.patience.purchased)
				antistacklimitv = 30;
			if (((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) >= antistacklimitv && game.global.antiStacks < antistacklimitv) {
				mapsClicked(true);
			}
			else if (game.global.antiStacks == antistacklimitv)
				mapsClicked(true);
		}
		else
			mapsClicked(true);
	}
	return;
}

function forceAbandonTrimps() {
	if (!getPageSetting('ForceAbandon')) return;
	if (!game.global.mapsUnlocked) return;
	if (game.global.mapsActive && getCurrentMapObject().location == "Void") return;
	if (game.global.preMapsActive) return;
	if (isActiveSpireAT() && disActiveSpireAT() && !game.global.mapsActive) return;
	if (getPageSetting('autoMaps')) {
		mapsClicked();
		if (game.global.switchToMaps || game.global.switchToWorld)
			mapsClicked();
	}
	else if (game.global.mapsActive) {
		mapsClicked();
		if (game.global.switchToMaps)
			mapsClicked();
		runMap();
	}
	else {
		mapsClicked();
		if (game.global.switchToMaps)
			mapsClicked();
		mapsClicked();
	}

}