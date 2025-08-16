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
	if (!u2Mutations.tree.Overkill1.purchased || challengeActive('Wither')) return false;

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
	let power = 2;
	if (!targetZone) targetZone = game.global.world;

	if (game.global.universe === 1) {
		if (game.portal.Overkill.level === 0) return 1;

		if (masteryPurchased('overkill')) power++;

		const overkiller = Fluffy.isRewardActive('overkiller');
		if (overkiller) power += overkiller;

		const empowerment = getEmpowerment() === 'Ice';
		const iceLevel = game.empowerments.Ice.getLevel();
		if (getUberEmpowerment() === 'Ice') power += 2;
		if (empowerment === 'Ice' && iceLevel >= 50) power++;
		if (empowerment === 'Ice' && iceLevel >= 100) power++;
	} else if (game.global.universe === 2) {
		const canOverkill = canU2OverkillAT(targetZone);
		if (!canOverkill && planToMap && u2Mutations.tree.MadMap.purchased) return power;
		if (!canOverkill) return 1;

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

	const hyp2Purchased = masteryPurchased('hyperspeed2');
	const hypPct = masteryPurchased('liquification3') ? 75 : hyp2Purchased ? 50 : 0;
	const hyp2 = game.global.world <= Math.floor(hze * (hypPct / 100));

	if (!bestMod || (bestMod === 'fa' && hyp2)) bestMod = '0';
	return bestMod;
}

function getSpecialTime(special, fullTime = false) {
	if (special === 'lmc') return 20;
	if (special === 'lc') return fullTime ? 40 : 14;
	if (special === 'smc') return 10;
	if (special === 'hc') return fullTime ? 20 : 7;

	return 0;
}

/* I have no idea where loot > drops, hopefully somebody can tell me one day :) */
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

function _simulateSliders(mapLevel, special = getAvailableSpecials('lmc'), biome = getBiome(), sliders = [9, 9, 9], perfect = true) {
	const fragmentsOwned = game.resources.fragments.owned;
	mapLevel = mapLevel - game.global.world;

	/* gradually reduce map sliders if not using frag max setting! */
	if (mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned) perfect = false;
	/* reduce map difficulty */
	while (sliders[2] > 0 && mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned) sliders[2] -= 1;
	/* reduce map loot */
	while (sliders[0] > 0 && mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned) sliders[0] -= 1;

	if (mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned && !challengeActive('Metal')) biome = 'Random';
	if (mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned && (special === '0' || !mapSpecialModifierConfig[special].name.includes('Cache'))) special = '0';

	/* reduce map size */
	while (sliders[1] > 0 && mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned) sliders[1] -= 1;

	if (special !== '0' && mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned) special = '0';
	if (biome !== 'Random' && mapCost(mapLevel, special, biome, sliders, perfect) > fragmentsOwned && !challengeActive('Metal')) {
		biome = 'Random';
	}

	const lootValues = Math.floor(getMapMinMax('loot', sliders[0])[perfect ? 1 : 0] * 100) / 100;
	const sizeValues = getMapMinMax('size', sliders[1])[perfect ? 0 : 1];
	let difficultyValues = Math.floor(getMapMinMax('difficulty', sliders[2])[perfect ? 0 : 1] * 100) / 100;
	if (challengeActive('Mapocalypse')) difficultyValues += 3;

	return {
		name: 'simulatedMap',
		level: mapLevel + game.global.world,
		mapLevel,
		special,
		location: biome,
		loot: lootValues,
		size: sizeValues,
		difficulty: difficultyValues,
		sliders: {
			loot: sliders[0],
			size: sliders[1],
			difficulty: sliders[2]
		},
		perfect,
		cost: mapCost(mapLevel, special, biome, sliders, perfect)
	};
}

function mapCost(plusLevel = 0, specialModifier = getAvailableSpecials('lmc'), biome = getBiome(), sliders = [9, 9, 9], perfect = true) {
	const mapLevel = Math.max(game.global.world, 6) + (plusLevel < 0 ? plusLevel : 0);
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

function findMap(level = 0, special = getAvailableSpecials('lmc'), biome = getBiome(), perfect = false, isTricky = false) {
	let sendTricky = false;
	let mapLoot = biome === 'Farmlands' ? 2.6 : biome === 'Plentiful' ? 1.85 : 1.6;
	if (game.singleRunBonuses.goldMaps.owned) mapLoot += 1;

	for (let mapping in game.global.mapsOwnedArray) {
		const map = game.global.mapsOwnedArray[mapping];
		let effectiveBiome = map.name === 'Tricky Paradise' && game.resources.fragments.owned < 600 ? 'Plentiful' : biome;
		if (map.location !== effectiveBiome && effectiveBiome !== 'Random') continue;
		if (perfect) {
			if (map.size > masteryPurchased('mapLoot2') ? 20 : 25) continue;
			if (map.difficulty > 0.75) continue;
			if (map.loot > mapLoot) continue;
		}
		if (game.global.world + level !== map.level) continue;
		if (map.bonus !== special && special !== '0') continue;
		if (map.noRecycle) continue;
		if (map.name === 'Tricky Paradise') sendTricky = map.id;
		else return map.id;
	}

	if (isTricky && sendTricky) return 'Tricky Paradise';
	return sendTricky;
}

function findOptimalMap(level = 0, special = getAvailableSpecials('lmc'), biome = getBiome(), perfect = false) {
	if (perfect) return undefined;

	const mapArray = [];
	const goldenMaps = Number(game.singleRunBonuses.goldMaps.owned);
	const minMapSize = masteryPurchased('mapLoot2') ? 20 : 25;
	let mapLoot = biome === 'Farmlands' && game.global.universe === 2 ? 2.6 : biome === 'Plentiful' ? 1.85 : 1.6;
	if (goldenMaps) mapLoot += 1;

	for (let mapping in game.global.mapsOwnedArray) {
		const map = game.global.mapsOwnedArray[mapping];

		if (game.global.world + level !== map.level) continue;
		if (map.noRecycle) continue;

		if (perfect) {
			if (map.size > minMapSize) continue;
			if (map.difficulty > 0.75) continue;
			if (map.loot > mapLoot) continue;
			if (map.bonus !== special && special !== '0') continue;
			if (map.location !== biome && biome !== 'Random') continue;

			return map;
		}

		mapArray.push(map);
	}

	if (mapArray.length === 0) return undefined;

	mapArray.sort((a, b) => {
		const getBiomeForMap = (map) => (map.name === 'Tricky Paradise' && game.resources.fragments.owned < 600 ? 'Plentiful' : biome);
		const aBiome = getBiomeForMap(a);
		const bBiome = getBiomeForMap(b);

		const aHasCorrectSpecial = a.bonus === special || special === undefined || special === '0';
		const aHasCorrectBiome = a.location === aBiome || biome === 'Random';
		const bHasCorrectSpecial = b.bonus === special || special === undefined || special === '0';
		const bHasCorrectBiome = b.location === bBiome || biome === 'Random';

		const getPriority = (hasSpecial, hasBiome) => (hasSpecial && hasBiome ? 3 : hasSpecial ? 2 : 1);
		const aPriority = getPriority(aHasCorrectSpecial, aHasCorrectBiome);
		const bPriority = getPriority(bHasCorrectSpecial, bHasCorrectBiome);

		return bPriority - aPriority;
	});

	const { Chronoimp, Jestimp, Whipimp, Magnimp } = game.unlocks.imps;
	const increaseSizeWeight = special !== '0' || ((Magnimp || Whipimp) && (Jestimp || Chronoimp));

	const biomeLoot = {
		Plentiful: 1.25,
		Farmlands: 2
	};

	const sliderWeights = {
		loot: 5,
		size: increaseSizeWeight ? 10 : 3,
		difficulty: 0.5
	};

	const highestRank = { rank: -Infinity, level: 0, special: undefined, loot: undefined, size: undefined, difficulty: undefined, location: undefined, name: '', id: undefined };

	for (let mapping in mapArray) {
		const map = mapArray[mapping];
		const baseLoot = (biomeLoot[map.location] || 1) + goldenMaps;

		if (highestRank.special === special && map.bonus !== special && special !== '0') {
			break;
		}

		let rank = 0;
		rank += Math.abs(map.loot - baseLoot) * sliderWeights.loot;
		rank += Math.abs(minMapSize + 50 - map.size) * sliderWeights.size;
		rank += Math.abs(Number(map.difficulty) - 1.65) * sliderWeights.difficulty;

		if (rank >= highestRank.rank) {
			highestRank.rank = rank;
			highestRank.level = map.level;
			highestRank.special = map.bonus || '0';
			highestRank.location = map.location;
			highestRank.loot = map.loot;
			highestRank.size = map.size;
			highestRank.difficulty = Number(map.difficulty);
			highestRank.name = map.name;
			highestRank.id = map.id;
		}
	}

	return highestRank;
}

function getCurrentQuest() {
	if (!challengeActive('Quest')) return 0;
	if (game.global.world < game.challenges.Quest.getQuestStartZone()) return 0;
	const questProgress = game.challenges.Quest.getQuestProgress();
	const questDescription = game.challenges.Quest.getQuestDescription();
	if (questProgress === 'Failed!' || questProgress === 'Quest Complete!') return 0;
	// resource multipliers
	else if (questDescription.includes('food')) return 1;
	else if (questDescription.includes('wood')) return 2;
	else if (questDescription.includes('metal')) return 3;
	else if (questDescription.includes('gems')) return 4;
	else if (questDescription.includes('science')) return 5;
	// everything else
	else if (questDescription === 'Complete 5 Maps at Zone level') return 6;
	else if (questDescription === 'One-shot 5 world enemies') return 7;
	else if (questDescription === "Don't let your shield break before Cell 100") return 8;
	else if (questDescription === "Don't run a map before Cell 100") return 9;
	else if (questDescription === 'Buy a Smithy') return 10;
	else return 0;
}

function makeAdditionalInfo_Standalone() {
	if (!game.global.mapsUnlocked) return `AL: Maps not unlocked!`;
	if (typeof hdStats !== 'object') hdStats = {};
	hdStats.autoLevelInitial = stats();
	hdStats.autoLevelData = get_best(hdStats.autoLevelInitial, true);
	hdStats.autoLevelLoot = hdStats.autoLevelData.loot.mapLevel;

	const initialInfo = hdStats.autoLevelData;
	const u2 = game.global.universe === 2;
	const showExtraType = (u2 && getPerkLevel('Equality') > 0) || (!u2 && game.upgrades.Formations.done);

	const displayOutputs = (type) => {
		type = initialInfo[type];
		const plusMinus = type.mapLevel > 0 ? '+' : '';

		if (showExtraType) return `${plusMinus}${type.mapLevel} (${u2 ? type.equality + 'eq' : type.stance})`;
		return `${plusMinus}${type.mapLevel}`;
	};

	return `Auto Level: ${displayOutputs('loot')}`;
}

function makeAdditionalInfoTooltip_Standalone(mouseover) {
	let tooltipText = '';

	if (mouseover) {
		tooltipText = 'tooltip(' + "'Auto Level Information', " + "'customText', " + 'event, ' + "'";
	}

	if (!game.global.mapsUnlocked || typeof hdStats.autoLevelData === 'undefined' || typeof hdStats.autoLevelData.loot.mapConfig === 'undefined') tooltipText += `<p>When maps have been unlocked you will see data here for which map you should purchase or run.</p>`;
	else {
		tooltipText += farmCalcGetMapDetails();
		if (game.global.universe === 1 && getHighestLevelCleared() + 1 >= 60) tooltipText += `<p>The map level is affixed with the stance that will give you the best results in the map.</p>`;
		if (game.global.universe === 2 && getPerkLevel('Equality') > 0) tooltipText += `<p>The map level is affixed with the equality level that you should use for that map level as it is one that allows you to survive against the highest attack enemy in the map.</p>`;
	}
	const remainingTime = Math.ceil(10 - (hdStats.counter % 10)) || 10;
	tooltipText += `<p>The data shown is updated every 10 seconds. <b>${remainingTime}s</b> until the next update.</p>`;
	tooltipText += `<p>Click this button while in the map chamber to either select your already purchased map or automatically set the inputs to the desired values.</p>`;
	tooltipText += `<p><i>You can view a table of the calculators simulation results by <b>double clicking</b> or holding <b>control</b> and clicking on this button.</i></p>`;

	if (mouseover) {
		tooltipText += "')";
		return tooltipText;
	} else {
		tooltip('Additional Info Tooltip', 'customText', 'lock', tooltipText, false, 'center');
		verticalCenterTooltip(true);
	}
}

if (typeof autoTrimpSettings === 'undefined' || (typeof autoTrimpSettings !== 'undefined' && typeof autoTrimpSettings.ATversion !== 'undefined' && !autoTrimpSettings.ATversion.includes('SadAugust'))) {
	if (document.getElementById('additionalInfo') === null) {
		const autoLevelContainer = document.createElement('DIV');
		autoLevelContainer.setAttribute('style', 'display: block; font-size: 0.9vw; text-align: centre; solid black; transform:translateY(-1.5vh); max-width: 95%; margin: 0 auto');
		autoLevelContainer.setAttribute('class', 'workBtn pointer noSelect');
		const autoLevelText = document.createElement('SPAN');
		autoLevelContainer.addEventListener('mouseover', () => makeAdditionalInfoTooltip_Standalone(true));

		let clickTimer = null;
		autoLevelContainer.addEventListener('click', (event) => {
			if (clickTimer) clearTimeout(clickTimer);
			clickTimer = setTimeout(() => {
				if (event.ctrlKey || event.metaKey) {
					importExportTooltip('display');
				} else {
					farmCalcSetMapSliders();
				}
				clickTimer = null;
			}, 250);
		});
		autoLevelContainer.addEventListener('dblclick', (event) => {
			if (clickTimer) clearTimeout(clickTimer);
			importExportTooltip('display');
		});

		autoLevelContainer.setAttribute('onmouseout', 'tooltip("hide")');
		autoLevelText.id = 'additionalInfo';
		autoLevelContainer.appendChild(autoLevelText);
		document.getElementById('trimps').appendChild(autoLevelContainer);
	}
}
