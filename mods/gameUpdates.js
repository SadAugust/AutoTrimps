function startSpire(confirmed) {
	const spireNum = checkIfSpireWorld(true);

	if (!confirmed) {
		game.global.spireDeaths = 0;
		game.global.spireActive = true;

		if (game.global.universe === 2) {
			game.global.spireLevel = Math.floor(game.global.u2SpireCellsBest / 100) + 1;
			if (game.global.spireLevel > 10) game.global.spireLevel = 10;
			if (game.portal.Equality.settings.spire.scalingActive) game.portal.Equality.scalingCount = game.portal.Equality.settings.spire.disabledStackCount;
			if (game.portal.Equality.scalingCount === -1) game.portal.Equality.scalingCount = game.portal.Equality.radLevel;
			manageEqualityStacks();
		}

		setNonMapBox();
		const spireSetting = game.options.menu.mapsOnSpire.enabled;
		if (spireSetting && !checkMapAtZoneWorld()) {
			let highestSpire;
			if (game.global.universe === 1) {
				highestSpire = Math.floor((getHighestLevelCleared() - 99) / 100);
			} else {
				highestSpire = Math.min(1, Math.floor((getHighestLevelCleared() - 225) / 75));
			}

			if (spireSetting === 1 || (spireSetting === 2 && spireNum >= highestSpire - 1) || (spireSetting === 3 && spireNum >= highestSpire)) {
				game.global.fighting = false;
				mapsSwitch();
				if (challengeActive('Berserk')) game.challenges.Berserk.trimpDied();
			} else {
				handleExitSpireBtn();
			}
		} else {
			handleExitSpireBtn();
		}

		if (spireNum === 1) {
			const uStart = game.global.universe === 2 ? 300 : 200;
			const showTooltip = getHighestLevelCleared() <= uStart + 19;

			if (game.options.menu.bigPopups.enabled || showTooltip) {
				cancelTooltip();
				const uSpire = game.global.universe === 2 ? "Stuffy's Spire" : 'The Spire';
				tooltip(uSpire, null, 'update');
			}
		}

		return;
	}

	cancelTooltip();
}

function autoTrap() {
	const buildingsPerSecond = bwRewardUnlocked('DecaBuild') ? 10 : bwRewardUnlocked('DoubleBuild') ? 2 : 1;
	const trapsCanAfford = Math.min(Math.floor(game.resources.food.owned / 10), Math.floor(game.resources.wood.owned / 10));
	const trapsToBuy = Math.min(trapsCanAfford, buildingsPerSecond);

	if (trapsToBuy > 0 && game.resources.food.owned >= 10 * trapsToBuy && game.resources.wood.owned >= 10 * trapsToBuy) {
		game.resources.food.owned -= 10 * trapsToBuy;
		game.resources.wood.owned -= 10 * trapsToBuy;
		game.buildings.Trap.purchased += trapsToBuy;

		const trapPurchase = game.global.buildingsQueue[0] && game.global.buildingsQueue[0].split('.');
		if (trapPurchase && trapPurchase[0] === `Trap` && Number(trapPurchase[1]) <= buildingsPerSecond) {
			setNewCraftItem();
			return;
		}
		startQueue('Trap', trapsToBuy);
	}
}

function simpleSeconds(what, seconds) {
	/* come home to the impossible flavour of balanced resource gain. Come home, to simple seconds. */
	var jobName;
	switch (what) {
		case 'food':
			jobName = 'Farmer';
			break;
		case 'wood':
			jobName = 'Lumberjack';
			break;
		case 'metal':
			jobName = 'Miner';
			break;
		case 'gems':
			jobName = 'Dragimp';
			break;
		case 'fragments':
			jobName = 'Explorer';
			break;
		case 'science':
			jobName = 'Scientist';
			break;
	}
	var job = game.jobs[jobName];
	var amt = job.owned * job.modifier * seconds;
	amt += amt * getPerkLevel('Motivation') * game.portal.Motivation.modifier;
	if (getPerkLevel('Motivation_II') > 0) amt *= 1 + getPerkLevel('Motivation_II') * game.portal.Motivation_II.modifier;
	if (what != 'gems' && game.permaBoneBonuses.multitasking.owned > 0 && game.resources.trimps.owned >= game.resources.trimps.realMax()) amt *= 1 + game.permaBoneBonuses.multitasking.mult();
	if (what != 'science' && what != 'fragments') {
		if (game.global.challengeActive == 'Alchemy') amt *= alchObj.getPotionEffect('Potion of Finding');
		amt *= alchObj.getPotionEffect('Elixir of Finding');
	}
	if (game.global.pandCompletions && what != 'fragments') amt *= game.challenges.Pandemonium.getTrimpMult();
	if (game.global.desoCompletions && what != 'fragments') amt *= game.challenges.Desolation.getTrimpMult();
	if (!game.portal.Observation.radLocked && game.global.universe == 2 && game.portal.Observation.trinkets > 0) amt *= game.portal.Observation.getMult();
	if (getPerkLevel('Meditation') > 0) amt *= 1 + game.portal.Meditation.getBonusPercent() * 0.01;
	if (what == 'food' || what == 'wood' || what == 'metal') {
		amt *= getParityBonus();
		if (autoBattle.oneTimers.Gathermate.owned && game.global.universe == 2) amt *= autoBattle.oneTimers.Gathermate.getMult();
	}
	if (((what == 'food' || what == 'wood') && game.buildings.Antenna.owned >= 5) || (what == 'metal' && game.buildings.Antenna.owned >= 15)) amt *= game.jobs.Meteorologist.getExtraMult();
	if (Fluffy.isRewardActive('gatherer')) amt *= 2;
	if (game.jobs.Magmamancer.owned > 0 && what == 'metal') amt *= game.jobs.Magmamancer.getBonusPercent();
	if (game.global.challengeActive == 'Frigid') amt *= game.challenges.Frigid.getShatteredMult();
	if (challengeActive('Meditate')) amt *= 1.25;
	else if (challengeActive('Size') && (what == 'food' || what == 'wood' || what == 'metal')) amt *= 1.5;
	if (challengeActive('Downsize')) amt *= 5;
	if (challengeActive('Toxicity')) {
		var toxMult = (game.challenges.Toxicity.lootMult * game.challenges.Toxicity.stacks) / 100;
		amt *= 1 + toxMult;
	}
	if (challengeActive('Watch')) amt /= 2;
	if (challengeActive('Lead') && game.global.world % 2 == 1) amt *= 2;
	if (challengeActive('Balance')) {
		amt *= game.challenges.Balance.getGatherMult();
	}
	if (what == 'wood' && game.global.challengeActive == 'Hypothermia') amt *= game.challenges.Hypothermia.getWoodMult();
	if (game.global.challengeActive == 'Unbalance') {
		amt *= game.challenges.Unbalance.getGatherMult();
	}
	if (game.global.challengeActive == 'Daily') {
		if (typeof game.global.dailyChallenge.famine !== 'undefined' && what != 'fragments' && what != 'science') {
			amt *= dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
		}
		if (typeof game.global.dailyChallenge.dedication !== 'undefined') {
			amt *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
		}
	}
	if (game.global.challengeActive == 'Decay' || game.global.challengeActive == 'Melt') {
		var challenge = game.challenges[game.global.challengeActive];
		amt *= 10;
		amt *= Math.pow(challenge.decayValue, challenge.stacks);
	}
	if (game.global.challengeActive == 'Desolation' && what != 'fragments') amt *= game.challenges.Desolation.trimpResourceMult();
	if (game.challenges.Nurture.boostsActive()) amt *= game.challenges.Nurture.getResourceBoost();
	if (getEmpowerment() == 'Wind') {
		amt *= 1 + game.empowerments.Wind.getCombatModifier();
	}
	amt = calcHeirloomBonus('Staff', jobName + 'Speed', amt);
	if (game.global.playerGathering == what) {
		if ((game.talents.turkimp2.purchased || game.global.turkimpTimer > 0) && (what == 'food' || what == 'metal' || what == 'wood')) {
			var tBonus = 1.5;
			if (game.talents.turkimp2.purchased) tBonus = 2;
			else if (game.talents.turkimp2.purchased) tBonus = 1.75;
			amt *= tBonus;
		}
		amt += getPlayerModifier() * seconds;
	}
	return amt;
}
