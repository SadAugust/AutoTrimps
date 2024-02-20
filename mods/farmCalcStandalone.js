function getPerkModifier(what) {
	return game.portal[what].modifier || 0;
}

function getCurrentEnemy(cell = 1) {
	if (game.global.gridArray.length <= 0) return {};

	const mapping = game.global.mapsActive;
	const currentCell = mapping ? game.global.lastClearedMapCell + cell : game.global.lastClearedCell + cell;
	const mapGrid = mapping ? 'mapGridArray' : 'gridArray';

	if (typeof game.global[mapGrid][currentCell] === 'undefined') return game.global[mapGrid][game.global[mapGrid].length - 1];

	return game.global[mapGrid][currentCell];
}

function noBreedChallenge() {
	return challengeActive('Trapper') || challengeActive('Trappapalooza');
}

function canU2OverkillAT(targetZone) {
	if (!u2Mutations.tree.Overkill1.purchased) return false;

	if (!targetZone) targetZone = game.global.world;
	let allowed = 0.3;
	if (u2Mutations.tree.Overkill2.purchased) allowed += 0.1;
	if (u2Mutations.tree.Overkill3.purchased) allowed += 0.1;
	if (u2Mutations.tree.Liq3.purchased) {
		allowed += 0.1;
		if (u2Mutations.tree.Liq2.purchased) allowed += 0.1;
	}
	if (targetZone <= game.stats.highestRadLevel.valueTotal() * allowed) return true;
	return false;
}

function maxOneShotPower(planToMap, targetZone) {
	var power = 2;
	if (!targetZone) targetZone = game.global.world;

	if (game.global.universe === 1) {
		//No overkill perk
		if (game.portal.Overkill.level === 0) return 1;
		//Mastery
		if (game.talents.overkill.purchased) power++;
		//Fluffy
		if (Fluffy.isRewardActive('overkiller')) power += Fluffy.isRewardActive('overkiller');
		//Ice
		if (getUberEmpowerment() === 'Ice') power += 2;
		if (getEmpowerment() === 'Ice' && game.empowerments.Ice.getLevel() >= 50) power++;
		if (getEmpowerment() === 'Ice' && game.empowerments.Ice.getLevel() >= 100) power++;
	} else if (game.global.universe === 2) {
		if (!canU2OverkillAT(targetZone) && planToMap && u2Mutations.tree.MadMap.purchased) return power;
		if (!canU2OverkillAT(targetZone)) return 1;

		if (u2Mutations.tree.MaxOverkill.purchased) power++;
	}

	return power;
}

function getAvailableSpecials(special, skipCaches) {
	if (!special) return '0';

	const specialToMods = {
		lsc: ['lsc', 'hc', 'ssc', 'lc'],
		lwc: ['lwc', 'hc', 'swc', 'lc'],
		lmc: ['lmc', 'hc', 'smc', 'lc'],
		lrc: ['lrc', 'src', 'fa'],
		p: ['p', 'fa']
	};

	const cacheMods = specialToMods[special] || [special];
	const hze = getHighestLevelCleared() + 1;
	const unlocksAt = game.global.universe === 2 ? 'unlocksAt2' : 'unlocksAt';

	let bestMod;
	for (let mod of cacheMods) {
		if (typeof mapSpecialModifierConfig[mod] === 'undefined') continue;
		if ((mod === 'lmc' || mod === 'smc') && (challengeActive('Metal') || challengeActive('Transmute'))) mod = mod.charAt(0) + 'wc';
		if (skipCaches && mod === 'hc') continue;

		let unlock = mapSpecialModifierConfig[mod].name.includes('Research') ? mapSpecialModifierConfig[mod].unlocksAt2() : mapSpecialModifierConfig[mod][unlocksAt];
		if (unlock && unlock <= hze) {
			bestMod = mod;
			break;
		}
	}

	if (!bestMod || (bestMod === 'fa' && trimpStats.hyperspeed2)) bestMod = '0';
	return bestMod;
}

//I have no idea where loot > drops, hopefully somebody can tell me one day :)
function getBiome(mapGoal, resourceGoal) {
	const dropBased = (challengeActive('Trapper') && game.stats.highestLevel.valueTotal() < 800) || (challengeActive('Trappapalooza') && game.stats.highestRadLevel.valueTotal() < 220) || challengeActive('Metal');
	if (dropBased && !resourceGoal && challengeActive('Metal')) resourceGoal = 'Mountain';

	let biome;
	if (resourceGoal && dropBased) biome = game.global.farmlandsUnlocked && getFarmlandsResType() === game.mapConfig.locations[resourceGoal].resourceType ? 'Farmlands' : resourceGoal;
	else if (mapGoal === 'fragments' || mapGoal === 'gems') biome = 'Depths';
	else if (mapGoal === 'fragConservation') biome = 'Random';
	else if (game.global.universe === 2 && game.global.farmlandsUnlocked) biome = 'Farmlands';
	else if (game.global.decayDone) biome = 'Plentiful';
	else biome = 'Mountain';

	return biome;
}

function mapCost(plusLevel = 0, specialModifier = getAvailableSpecials('lmc'), biome = getBiome(), sliders = [9, 9, 9], perfect = true) {
	const mapLevel = Math.max(game.global.world + plusLevel, 6);
	let baseCost = sliders[0] + sliders[1] + sliders[2];
	baseCost *= game.global.world >= 60 ? 0.74 : 1;

	if (perfect && sliders.reduce((a, b) => a + b) === 27) baseCost += 6;
	if (plusLevel > 0) baseCost += plusLevel * 10;
	if (specialModifier !== '0') baseCost += mapSpecialModifierConfig[specialModifier].costIncrease;

	baseCost += mapLevel;
	baseCost = Math.floor((baseCost / 150) * Math.pow(1.14, baseCost - 1) * mapLevel * 2 * Math.pow(1.03 + mapLevel / 50000, mapLevel));
	baseCost *= biome !== 'Random' ? 2 : 1;

	return baseCost;
}

function getCurrentQuest() {
	if (!challengeActive('Quest')) return 0;
	if (game.global.world < game.challenges.Quest.getQuestStartZone()) return 0;
	const questProgress = game.challenges.Quest.getQuestProgress();
	const questDescription = game.challenges.Quest.getQuestDescription();
	if (questProgress === 'Failed!' || questProgress === 'Quest Complete!') return 0;
	//Resource multipliers
	else if (questDescription.includes('food')) return 1;
	else if (questDescription.includes('wood')) return 2;
	else if (questDescription.includes('metal')) return 3;
	else if (questDescription.includes('gems')) return 4;
	else if (questDescription.includes('science')) return 5;
	//Everything else
	else if (questDescription === 'Complete 5 Maps at Zone level') return 6;
	else if (questDescription === 'One-shot 5 world enemies') return 7;
	else if (questDescription === "Don't let your shield break before Cell 100") return 8;
	else if (questDescription === "Don't run a map before Cell 100") return 9;
	else if (questDescription === 'Buy a Smithy') return 10;
	else return 0;
}

//AutoLevel information
function makeAdditionalInfo() {
	if (!game.global.mapsUnlocked) return (description += `AL: Maps not unlocked!`);
	const initialInfo = get_best(stats(), true);
	const u2 = game.global.universe === 2;
	const extraType = u2 ? 'equality' : 'stance';
	const showExtraType = (u2 && getPerkLevel('Equality') > 0) || (!u2 && game.upgrades.Formations.done);

	const displayOutputs = (type) => {
		type = initialInfo[type];
		const plusMinus = type.mapLevel > 0 ? '+' : type.mapLevel < 0 ? '-' : '';

		if (showExtraType) return `${plusMinus}${type.mapLevel} (${u2 ? type.equality + 'eq' : type.stance})`;
		return `${plusMinus}${type.mapLevel}`;
	};

	return `Auto Level: ${displayOutputs('loot')}`;
}

function makeAdditionalInfoTooltip(mouseover) {
	var tooltipText = '';

	if (mouseover) {
		tooltipText = 'tooltip(' + "'Additional Info', " + "'customText', " + 'event, ' + "'";
	}

	tooltipText += `<p><b>Auto Level</b><br>\
    The level that the script recommends using whilst farming. The map level outputs assume you are running ${getBiome() === 'Plentiful' ? 'Garden' : getBiome()} biome and ${getAvailableSpecials('lmc') !== '0' ? mapSpecialModifierConfig[getAvailableSpecials('lmc')].name : 'no'} special maps with the best map sliders available and are updated every 5 seconds.</p>`;
	if (game.global.universe === 1) tooltipText += `<p>Each map type is affixed with the stance that will give you the best results in the map.</p>`;
	if (game.global.universe === 2) tooltipText += `<p>Each map type is affixed with the equality level that you should use for that map level as it is one that allows you to survive against the worst enemy in the map.</p>`;
	tooltipText += `<p>Loot: The ideal map level for resource farming.</p>`;
	tooltipText += `<p>Speed: The ideal map level for a mixture of speed and loot gains. This should be the value you use for actions like map bonus stack farming if the level is high enough.</p>`;

	if (mouseover) {
		tooltipText += "')";
		return tooltipText;
	} else {
		tooltip('Additional Info Tooltip', 'customText', 'lock', tooltipText, false, 'center');
		verticalCenterTooltip(true);
	}
}

const autoLevelContainer = document.createElement('DIV');
autoLevelContainer.setAttribute('style', 'display: block; font-size: 0.9vw; text-align: centre; background-color: rgba(0, 0, 0, 0.3);');
const autoLevelText = document.createElement('SPAN');
autoLevelContainer.setAttribute('onmouseover', makeAdditionalInfoTooltip(true));
autoLevelContainer.setAttribute('onmouseout', 'tooltip("hide")');
autoLevelText.id = 'additionalInfo';
autoLevelContainer.appendChild(autoLevelText);
document.getElementById('trimps').appendChild(autoLevelContainer);
if (typeof remainingHealth === 'function') updateAdditionalInfo();
