function getPerSecBeforeManual(a) { var b = 0, c = game.jobs[a].increase; if ("custom" == c) return 0; if (0 < game.jobs[a].owned) { if (b = game.jobs[a].owned * game.jobs[a].modifier, 0 < game.portal.Motivation.level && (b += b * game.portal.Motivation.level * game.portal.Motivation.modifier), 0 < game.portal.Motivation_II.level && (b *= 1 + game.portal.Motivation_II.level * game.portal.Motivation_II.modifier), 0 < game.portal.Meditation.level && (b *= (1 + 0.01 * game.portal.Meditation.getBonusPercent()).toFixed(2)), 0 < game.jobs.Magmamancer.owned && "metal" == c && (b *= game.jobs.Magmamancer.getBonusPercent()), "Meditate" == game.global.challengeActive ? b *= 1.25 : "Size" == game.global.challengeActive && (b *= 1.5), "Toxicity" == game.global.challengeActive) { var d = game.challenges.Toxicity.lootMult * game.challenges.Toxicity.stacks / 100; b *= 1 + d } "Balance" == game.global.challengeActive && (b *= game.challenges.Balance.getGatherMult()), "Decay" == game.global.challengeActive && (b *= 10, b *= Math.pow(0.995, game.challenges.Decay.stacks)), "Daily" == game.global.challengeActive && ("undefined" != typeof game.global.dailyChallenge.dedication && (b *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength)), "undefined" != typeof game.global.dailyChallenge.famine && "fragments" != c && "science" != c && (b *= dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength))), "Watch" == game.global.challengeActive && (b /= 2), "Lead" == game.global.challengeActive && 1 == game.global.world % 2 && (b *= 2), b = calcHeirloomBonus("Staff", a + "Speed", b) } return b }
function checkJobPercentageCost(a, b) { var c = "food", d = game.jobs[a], e = d.cost[c], f = 0; b || (b = game.global.buyAmt), f = "undefined" == typeof e[1] ? e * b : Math.floor(e[0] * Math.pow(e[1], d.owned) * ((Math.pow(e[1], b) - 1) / (e[1] - 1))); var g; if (game.resources[c].owned < f) { var h = getPsString(c, !0); return 0 < h && (g = calculateTimeToMax(null, h, f - game.resources[c].owned)), [!1, g] } return g = 0 < game.resources[c].owned ? (100 * (f / game.resources[c].owned)).toFixed(1) : 0, [!0, g] }
function getScienceCostToUpgrade(a) { var b = game.upgrades[a]; return void 0 !== b.cost.resources.science && void 0 !== b.cost.resources.science[0] ? Math.floor(b.cost.resources.science[0] * Math.pow(b.cost.resources.science[1], b.done)) : void 0 !== b.cost.resources.science && void 0 == b.cost.resources.science[0] ? b.cost.resources.science : 0 }
function getEnemyMaxAttack(a, b, c, d, e) { var f = 0; return f += 50 * Math.sqrt(a) * Math.pow(3.27, a / 2), f -= 10, 1 == a ? (f *= 0.35, f = 0.2 * f + 0.75 * f * (b / 100)) : 2 == a ? (f *= 0.5, f = 0.32 * f + 0.68 * f * (b / 100)) : 60 > a ? f = 0.375 * f + 0.7 * f * (b / 100) : (f = 0.4 * f + 0.9 * f * (b / 100), f *= Math.pow(1.15, a - 59)), 60 > a && (f *= 0.85), d && (f *= d), f *= e ? getCorruptScale("attack") : game.badGuys[c].attack, Math.floor(f) }
function getEnemyMaxHealth(a, b, c) { b || (b = 30); var d = 0; return d += 130 * Math.sqrt(a) * Math.pow(3.265, a / 2), d -= 110, 1 == a || 2 == a && 10 > b ? (d *= 0.6, d = 0.25 * d + 0.72 * d * (b / 100)) : 60 > a ? d = 0.4 * d + 0.4 * d * (b / 110) : (d = 0.5 * d + 0.8 * d * (b / 100), d *= Math.pow(1.1, a - 59)), 60 > a && (d *= 0.75), d *= c ? getCorruptScale("health") : game.badGuys.Grimp.health, Math.floor(d) }
function getCurrentEnemy(a) { a || (a = 1); var b; return game.global.mapsActive || game.global.preMapsActive ? game.global.mapsActive && !game.global.preMapsActive && ('undefined' == typeof game.global.mapGridArray[game.global.lastClearedMapCell + a] ? b = game.global.mapGridArray[game.global.gridArray.length - 1] : b = game.global.mapGridArray[game.global.lastClearedMapCell + a]) : 'undefined' == typeof game.global.gridArray[game.global.lastClearedCell + a] ? b = game.global.gridArray[game.global.gridArray.length - 1] : b = game.global.gridArray[game.global.lastClearedCell + a], b }
function getCorruptedCellsNum() { for (var a, b = 0, c = 0; c < game.global.gridArray.length - 1; c++)a = game.global.gridArray[c], "Corruption" == a.mutation && b++; return b }
function getCorruptScale(a) { return "attack" === a ? mutations.Corruption.statScale(3) : "health" === a ? mutations.Corruption.statScale(10) : void 0 }
//function getPotencyMod(a){var b=game.resources.trimps.potency;return 0<game.upgrades.Potency.done&&(b*=Math.pow(1.1,game.upgrades.Potency.done)),0<game.buildings.Nursery.owned&&(b*=Math.pow(1.01,game.buildings.Nursery.owned)),0<game.unlocks.impCount.Venimp&&(b*=Math.pow(1.003,game.unlocks.impCount.Venimp)),game.global.brokenPlanet&&(b/=10),b*=1+game.portal.Pheromones.level*game.portal.Pheromones.modifier,a||(a=0),0<game.jobs.Geneticist.owned&&(b*=Math.pow(.98,game.jobs.Geneticist.owned+a)),game.unlocks.quickTrimps&&(b*=2),'Daily'==game.global.challengeActive&&('undefined'!=typeof game.global.dailyChallenge.dysfunctional&&(b*=dailyModifiers.dysfunctional.getMult(game.global.dailyChallenge.dysfunctional.strength)),'undefined'!=typeof game.global.dailyChallenge.toxic&&(b*=dailyModifiers.toxic.getMult(game.global.dailyChallenge.toxic.strength,game.global.dailyChallenge.toxic.stacks))),'Toxicity'==game.global.challengeActive&&0<game.challenges.Toxicity.stacks&&(b*=Math.pow(game.challenges.Toxicity.stackMult,game.challenges.Toxicity.stacks)),'slowBreed'==game.global.voidBuff&&(b*=0.2),b=calcHeirloomBonus('Shield','breedSpeed',b),b}
//function getBreedTime(a,b){var c=game.resources.trimps,d=c.realMax(),e=getPotencyMod(b);e=1+e/10;var f=log10((d-c.employed)/(c.owned-c.employed))/log10(e);if(f/=10,a)return parseFloat(f.toFixed(1));var g=game.portal.Coordinated.level?game.portal.Coordinated.currentSend:c.maxSoldiers,h=log10((d-c.employed)/(d-g-c.employed))/log10(e);return h/=10,parseFloat(h.toFixed(1))}
function isBuildingInQueue(a) { for (var c in game.global.buildingsQueue) if (game.global.buildingsQueue[c].includes(a)) return !0 }
//function getArmyTime(){var a=game.resources.trimps.owned-game.resources.trimps.employed,b=game.resources.trimps.realMax()<=game.resources.trimps.owned+1,c=game.portal.Coordinated.level?game.portal.Coordinated.currentSend:game.resources.trimps.maxSoldiers,d=getPotencyMod();return c/(a*d)}
function setScienceNeeded() { for (var a in scienceNeeded = 0, upgradeList) if (a = upgradeList[a], game.upgrades[a].allowed > game.upgrades[a].done) { if (1 == game.global.world && 1e3 >= game.global.totalHeliumEarned && a.startsWith("Speed")) continue; scienceNeeded += getScienceCostToUpgrade(a) } needGymystic && (scienceNeeded += getScienceCostToUpgrade("Gymystic")) }
function RsetScienceNeeded() { for (var a in RscienceNeeded = 0, RupgradeList) if (a = RupgradeList[a], game.upgrades[a].allowed > game.upgrades[a].done) { if (1 == game.global.world && 1e3 >= game.global.totalRadonEarned && a.startsWith("Speed")) continue; RscienceNeeded += getScienceCostToUpgrade(a) } }
/* function RgetEnemyAvgAttack(world, level, name, type) {
	//Pre-Init
	if (!type) type = (!game.global.mapsActive) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	if (!world) world = (type == "world" || !game.global.mapsActive) ? game.global.world : getCurrentMapObject().level;
	if (!level) level = (type == "world" || !game.global.mapsActive) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : "Snimp";

	var amt = 0;
	var attackBase = (game.global.universe == 2) ? 750 : 50;
	//var amt = (game.global.universe == 2) ? 750 : 50 * Math.sqrt(zone) * Math.pow(3.27, zone/2) - 10;
	amt += attackBase * Math.sqrt(world) * Math.pow(3.27, world / 2);
	amt -= 10;
	if (world == 1){
		amt *= 0.35;
		amt = (amt * 0.20) + ((amt * 0.75) * (level / 100));
	}
	else if (world == 2){
		amt *= 0.5;
		amt = (amt * 0.32) + ((amt * 0.68) * (level / 100));
	}	
	else if (world < 60)
		amt = (amt * 0.375) + ((amt * 0.7) * (level / 100));
	else{
		amt = (amt * 0.4) + ((amt * 0.9) * (level / 100));
		amt *= Math.pow(1.15, world - 59);
	}
	if (world < 60) amt *= 0.85;
	if (world > 6 && type != 'world') amt *= 1.1;
	if (name) amt *= game.badGuys[name].attack;
	if (game.global.universe == 2){
		var part1 = (world > 40) ? 40 : world;
		var part2 = (world > 60) ? 20 : world - 40;
		var part3 = (world - 60);
		if (part2 < 0) part2 = 0;
		if (part3 < 0) part3 = 0;
		amt *= Math.pow(1.5, part1);
		amt *= Math.pow(1.4, part2);
		amt *= Math.pow(1.32, part3);
	}
	return Math.floor(amt);
} */

function RgetEnemyAvgAttack(zone, cell, name, type) {
	//Pre-Init
	if (!type) type = (!game.global.mapsActive) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	if (!zone) zone = (type == "world" || !game.global.mapsActive) ? game.global.world : getCurrentMapObject().level;
	if (!cell) cell = (type == "world" || !game.global.mapsActive) ? getCurrentWorldCell().level : (getCurrentMapCell() ? getCurrentMapCell().level : 1);
	if (!name) name = getCurrentEnemy() ? getCurrentEnemy().name : "Snimp";
	//Init
	var attackBase = (game.global.universe == 2) ? 750 : 50;
	var attack = attackBase * Math.sqrt(zone) * Math.pow(3.27, zone / 2) - 10;

	//Zone 1
	if (zone == 1) {
		attack *= 0.35;
		attack = (0.2 * attack) + (0.75 * attack * (cell / 100));
	}

	//Zone 2
	else if (zone == 2) {
		attack *= 0.5;
		attack = (0.32 * attack) + (0.68 * attack * (cell / 100));
	}

	//Before Breaking the Planet
	else if (zone < 60) {
		attack = (0.375 * attack) + (0.7 * attack * (cell / 100));
		attack *= 0.85;
	}

	//After Breaking the Planet
	else {
		attack = (0.4 * attack) + (0.9 * attack * (cell / 100));
		attack *= Math.pow(1.15, zone - 59);
	}

	//Maps
	if (zone > 6 && type != "world") attack *= 1.1;

	//Specific Imp
	if (name) attack *= game.badGuys[name].attack;
	if (name == 'Hulting_Mutimp') debug(name);

	//U2
	if (game.global.universe == 2) {
		var part1 = (zone > 40) ? 40 : zone;
		var part2 = (zone > 60) ? 20 : zone - 40;
		var part3 = (zone - 60);
		if (part2 < 0) part2 = 0;
		if (part3 < 0) part3 = 0;
		attack *= Math.pow(1.5, part1);
		attack *= Math.pow(1.4, part2);
		attack *= Math.pow(1.32, part3);
	}

	return Math.floor(attack);
}

function RgetEnemyMaxHealth(world, level, name) {
	var name = !name ? 'Grimp' : name;
	if (!level)
		level = 30;
	var amt = 0;
	var healthBase = (game.global.universe == 2) ? 10e7 : 130;
	amt += healthBase * Math.sqrt(world) * Math.pow(3.265, world / 2);
	amt -= 110;
	if (world == 1 || world == 2 && level < 10) {
		amt *= 0.6;
		amt = (amt * 0.25) + ((amt * 0.72) * (level / 100));
	}
	else if (world < 60)
		amt = (amt * 0.4) + ((amt * 0.4) * (level / 110));
	else {
		amt = (amt * 0.5) + ((amt * 0.8) * (level / 100));
		amt *= Math.pow(1.1, world - 59);
	}
	if (world < 60) amt *= 0.75;
	if (world > 5 && game.global.mapsActive) amt *= 1.1;
	amt *= game.badGuys[name].health;
	if (game.global.universe == 2) {
		var part1 = (world > 60) ? 60 : world;
		var part2 = (world - 60);
		if (part2 < 0) part2 = 0;
		amt *= Math.pow(1.4, part1);
		amt *= Math.pow(1.32, part2);
	}
	return Math.floor(amt);
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
	potencyMod *= 1 + (game.portal.Pheromones.level * game.portal.Pheromones.modifier);
	//Geneticist
	if (!howManyMoreGenes) howManyMoreGenes = 0;
	if (game.jobs.Geneticist.owned > 0) potencyMod *= Math.pow(.98, game.jobs.Geneticist.owned + howManyMoreGenes);
	//Quick Trimps
	if (game.unlocks.quickTrimps) potencyMod *= 2;
	//Daily mods
	if (game.global.challengeActive == "Daily") {
		if (typeof game.global.dailyChallenge.dysfunctional !== 'undefined') {
			potencyMod *= dailyModifiers.dysfunctional.getMult(game.global.dailyChallenge.dysfunctional.strength);
		}
		if (typeof game.global.dailyChallenge.toxic !== 'undefined') {
			potencyMod *= dailyModifiers.toxic.getMult(game.global.dailyChallenge.toxic.strength, game.global.dailyChallenge.toxic.stacks);
		}
	}
	if (game.global.challengeActive == "Toxicity" && game.challenges.Toxicity.stacks > 0) {
		potencyMod *= Math.pow(game.challenges.Toxicity.stackMult, game.challenges.Toxicity.stacks);
	}
	if (game.global.voidBuff == "slowBreed") {
		potencyMod *= 0.2;
	}
	potencyMod = calcHeirloomBonus("Shield", "breedSpeed", potencyMod);
	return potencyMod;
}

function getArmyTime() {
	var breeding = (game.resources.trimps.owned - game.resources.trimps.employed);
	var newSquadRdy = game.resources.trimps.realMax() <= game.resources.trimps.owned + 1;
	var adjustedMax = (game.portal.Coordinated.level) ? game.portal.Coordinated.currentSend : game.resources.trimps.maxSoldiers;
	var potencyMod = getPotencyMod();
	var tps = breeding * potencyMod;
	var addTime = adjustedMax / tps;
	return addTime;
}
