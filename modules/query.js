function getPerSecBeforeManual(a) {
	var b = 0,
		c = game.jobs[a].increase;
	if ("custom" == c) return 0;
	if (0 < game.jobs[a].owned) {
		if (
			((b = game.jobs[a].owned * game.jobs[a].modifier),
				0 < game.portal.Motivation.level && (b += b * game.portal.Motivation.level * game.portal.Motivation.modifier),
				game.global.universe === 1 && 0 < game.portal.Motivation_II.level && (b *= 1 + game.portal.Motivation_II.level * game.portal.Motivation_II.modifier),
				game.global.universe === 1 && 0 < game.portal.Meditation.level && (b *= (1 + 0.01 * game.portal.Meditation.getBonusPercent()).toFixed(2)),
				game.global.universe === 1 && 0 < game.jobs.Magmamancer.owned && "metal" == c && (b *= game.jobs.Magmamancer.getBonusPercent()),
				challengeActive('Meditate') ? (b *= 1.25) : challengeActive('Size') && (b *= 1.5),
				challengeActive('Toxicity'))
		) {
			var d = (game.challenges.Toxicity.lootMult * game.challenges.Toxicity.stacks) / 100;
			b *= 1 + d;
		}
		challengeActive('Balance') && (b *= game.challenges.Balance.getGatherMult()),
			challengeActive('Decay') && ((b *= 10), (b *= Math.pow(0.995, game.challenges.Decay.stacks))),
			challengeActive('Daily') &&
			("undefined" != typeof game.global.dailyChallenge.dedication && (b *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength)),
				"undefined" != typeof game.global.dailyChallenge.famine && "fragments" != c && "science" != c && (b *= dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength))),
			challengeActive('Watch') && (b /= 2),
			challengeActive('Lead') && 1 == game.global.world % 2 && (b *= 2),
			(b = calcHeirloomBonus("Staff", a + "Speed", b));
	}
	return b;
}

function getCurrentEnemy(a) {
	a || (a = 1);
	var b;
	return (
		game.global.mapsActive || game.global.preMapsActive
			? game.global.mapsActive &&
			!game.global.preMapsActive &&
			("undefined" == typeof game.global.mapGridArray[game.global.lastClearedMapCell + a] ? (b = game.global.mapGridArray[game.global.gridArray.length - 1]) : (b = game.global.mapGridArray[game.global.lastClearedMapCell + a]))
			: "undefined" == typeof game.global.gridArray[game.global.lastClearedCell + a]
				? (b = game.global.gridArray[game.global.gridArray.length - 1])
				: (b = game.global.gridArray[game.global.lastClearedCell + a]),
		b
	);
}

function getCorruptedCellsNum() {
	for (var a, b = 0, c = 0; c < game.global.gridArray.length - 1; c++) (a = game.global.gridArray[c]), "Corruption" == a.mutation && b++;
	return b;
}

function getCorruptScale(a) {
	return "attack" === a ? mutations.Corruption.statScale(3) : "health" === a ? mutations.Corruption.statScale(10) : void 0;
}

function isBuildingInQueue(a) {
	for (var c in game.global.buildingsQueue) if (game.global.buildingsQueue[c].includes(a)) return !0;
}

function getScienceCostToUpgrade(a) {
	var b = game.upgrades[a];
	return void 0 !== b.cost.resources.science && void 0 !== b.cost.resources.science[0]
		? Math.floor(b.cost.resources.science[0] * Math.pow(b.cost.resources.science[1], b.done))
		: void 0 !== b.cost.resources.science && void 0 == b.cost.resources.science[0]
			? b.cost.resources.science
			: 0;
}

function setScienceNeeded() {
	for (var a in ((scienceNeeded = 0), upgradeList))
		if (((a = upgradeList[a]), game.upgrades[a].allowed > game.upgrades[a].done)) {
			if (game.global.world === 1 && 1e3 >= (game.global.universe === 1 ? game.global.totalHeliumEarned : game.global.totalRadonEarned) && a.startsWith("Speed")) continue;
			scienceNeeded += getScienceCostToUpgrade(a);
		}
	if (game.global.universe === 1) needGymystic() && (scienceNeeded += getScienceCostToUpgrade("Gymystic"));
}

function getPotencyMod(howManyMoreGenes) {
	var potencyMod = game.resources.trimps.potency;
	//Add potency (book)
	if (game.upgrades.Potency.done > 0) potencyMod *= Math.pow(1.1, game.upgrades.Potency.done);
	//Add Nurseries
	if (game.buildings.Nursery.owned > 0) potencyMod *= Math.pow(1.01, game.buildings.Nursery.owned);
	//Add Venimp
	if (game.unlocks.impCount.Venimp > 0) potencyMod *= Math.pow(1.003, game.unlocks.impCount.Venimp);
	//Broken Planet
	if (game.global.brokenPlanet) potencyMod /= 10;
	//Pheromones
	potencyMod *= 1 + game.portal.Pheromones.level * game.portal.Pheromones.modifier;
	//Geneticist
	if (!howManyMoreGenes) howManyMoreGenes = 0;
	if (game.jobs.Geneticist.owned > 0) potencyMod *= Math.pow(0.98, game.jobs.Geneticist.owned + howManyMoreGenes);
	//Quick Trimps
	if (game.unlocks.quickTrimps) potencyMod *= 2;
	//Daily mods
	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.dysfunctional !== "undefined") {
			potencyMod *= dailyModifiers.dysfunctional.getMult(game.global.dailyChallenge.dysfunctional.strength);
		}
		if (typeof game.global.dailyChallenge.toxic !== "undefined") {
			potencyMod *= dailyModifiers.toxic.getMult(game.global.dailyChallenge.toxic.strength, game.global.dailyChallenge.toxic.stacks);
		}
	}
	if (challengeActive('Toxicity') && game.challenges.Toxicity.stacks > 0) {
		potencyMod *= Math.pow(game.challenges.Toxicity.stackMult, game.challenges.Toxicity.stacks);
	}
	if (game.global.voidBuff == "slowBreed") {
		potencyMod *= 0.2;
	}
	potencyMod = calcHeirloomBonus("Shield", "breedSpeed", potencyMod);
	return potencyMod;
}

function getArmyTime() {
	var breeding = game.resources.trimps.owned - game.resources.trimps.employed;
	var newSquadRdy = game.resources.trimps.realMax() <= game.resources.trimps.owned + 1;
	var adjustedMax = game.portal.Coordinated.level ? game.portal.Coordinated.currentSend : game.resources.trimps.maxSoldiers;
	var potencyMod = getPotencyMod();
	var tps = breeding * potencyMod;
	var addTime = adjustedMax / tps;
	return addTime;
}
