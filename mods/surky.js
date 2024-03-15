function runSurky() {
	if (portalUniverse !== 2) return;
	clearAndAutobuyPerks();
}

function allocateSurky(perks) {
	if (portalUniverse !== 2) return;
	//Can't respec perks when running Hypothermia so don't try as it causes errors
	if (challengeActive('Hypothermia')) return;

	const perk = {};
	for (let [key, value] of Object.entries(perks)) {
		if (typeof value !== 'object' || !value.hasOwnProperty('optimize')) continue;
		perk[key] = value.level;
	}
	const perkString = LZString.compressToBase64(JSON.stringify(perk));

	tooltip('Import Perks', null, 'update');
	document.getElementById('perkImportBox').value = perkString;
	importPerks();
	cancelTooltip();
}

function initPresetSurky() {
	const settingInputs = JSON.parse(localStorage.getItem('surkyInputs'));

	//Initial setup if we don't already have a save file setup
	if (settingInputs === null || Object.keys(settingInputs).length === 0) {
		return {};
	}

	const presetNames = Array.from(document.querySelectorAll('#preset > *'));
	const presets = {};
	for (let item of presetNames) {
		const value = item.value;
		if (value.includes('— ')) continue;
		presets[value] = settingInputs[value] || null;
	}

	return {
		clearWeight: +$$('#clearWeight').value,
		survivalWeight: +$$('#survivalWeight').value,
		radonWeight: +$$('#radonWeight').value,
		...presets
	};
}

function saveSurkySettings() {
	const saveData = initPresetSurky();
	//Initial setup and saving preset value
	const settingInputs = { preset: document.querySelector('#preset').value };

	MODULES.autoPerks.GUI.inputs.forEach((item) => {
		settingInputs[item] = document.querySelector(`#${item}`).value;
	});
	//Save inputs for all the presets that users can select.
	//Overrides data for current preset otherwises saves any already saved data for the others.
	const presetNames = Array.from(document.querySelectorAll('#preset > *'));
	for (let item in presetNames) {
		item = presetNames[item].value;
		if (item.includes('— ')) continue;
		if (settingInputs.preset === item) settingInputs[item] = [settingInputs['clearWeight'], settingInputs['survivalWeight'], settingInputs['radonWeight']];
		else settingInputs[item] = saveData[item];
	}

	localStorage.setItem('surkyInputs', JSON.stringify(settingInputs));
	if (typeof autoTrimpSettings !== 'undefined' && typeof autoTrimpSettings.ATversion !== 'undefined' && !autoTrimpSettings.ATversion.includes('SadAugust')) {
		autoTrimpSettings['autoAllocatePresets'].valueU2 = JSON.stringify(settingInputs);
		saveSettings();
	}
}

// fill preset weights from the dropdown menu and set special challenge
function fillPresetSurky(specificPreset) {
	if (specificPreset) $$('#preset').value = specificPreset;

	const defaultWeights = {
		ezfarm: [0, 0, 1],
		tufarm: [1, 0.5, 15],
		push: [1, 1, 0],
		alchemy: [1, 0.01, 10],
		trappa: [1, 1.5, 0],
		downsize: [1, 1, 0],
		duel: [1, 0.2, 0],
		berserk: [1, 0.5, 0],
		smithless: [1, 0.5, 0],
		combat: [1, 0.1, 0],
		combatRadon: [1, 0.5, 15],
		equip: [1, 0, 0],
		resminus: [1, 0, 0],
		resplus: [1, 0, 0],
		trappacarp: [1, 0, 0]
	};
	const localData = initPresetSurky();
	const preset = $$('#preset').value;
	const weights = localData[preset] === null || localData[preset] === undefined ? defaultWeights[preset] : localData[preset];
	$$('#clearWeight').value = weights[0];
	$$('#survivalWeight').value = weights[1];
	$$('#radonWeight').value = weights[2];
	saveSurkySettings();

	$$('#radonPerRunDiv').style.display = 'none';
	$$('#findPotsDiv').style.display = preset === 'alchemy' ? 'inline' : 'none';
	$$('#trapHrsDiv').style.display = preset === 'trappa' ? 'inline' : 'none';
}

// initialise perks object to default values
function initPerks() {
	const props = {
		radonSpent: 0,
		radonPerRun: 0,
		radonPerTrinket: 0,
		trinketRadonPerRun: 0,
		baselineTrinketsNext: 0,
		collectHubs: !autoBattle.oneTimers.Collectology.owned ? 1 : autoBattle.oneTimers.Collectology.getHubs(),
		tenacityTime: 10,
		trapHrs: 5,
		shinyTable: [0],
		clearWeight: Number($$('#clearWeight').value),
		survivalWeight: Number($$('#survivalWeight').value),
		radonWeight: Number($$('#radonWeight').value),
		coefC: 0,
		termR: 0,
		specialChallenge: null,
		runningTrappa: challengeActive('Trappapalooza'),
		trappaStartPop: 1,
		scaffMult: autoBattle.bonuses.Scaffolding.getMult(),
		hubsEnabled: game.global.exterminateDone,
		potency: 0.0085,
		carpNeeded: 0,
		bestPerk: ''
	};

	const preset = $$('#preset').value;
	const definePerk = (effect) => ({ optimize: true, level: 0, ...(effect !== undefined && { effect }) });

	const perks = {
		Agility: definePerk(),
		Artisanistry: definePerk(1 / 0.95),
		Bait: definePerk(),
		Carpentry: definePerk(1.1),
		Championism: definePerk(0),
		Criticality: definePerk(0.1),
		Equality: definePerk(1 / 0.9),
		Expansion: definePerk(1),
		Frenzy: definePerk(0.5),
		Greed: definePerk(0),
		Hunger: definePerk(),
		Looting: definePerk(0.05),
		Masterfulness: definePerk(1),
		Motivation: definePerk(0.05),
		Observation: definePerk(),
		Packrat: definePerk(0.2),
		Pheromones: definePerk(0.1),
		Power: definePerk(0.05),
		Prismal: definePerk(0.01),
		Range: definePerk(),
		Resilience: definePerk(1.1),
		Smithology: definePerk(1),
		Tenacity: definePerk(0),
		Toughness: definePerk(0.05),
		Trumps: definePerk()
	};

	const efficiencyPerks = ['Artisanistry', 'Carpentry', 'Criticality', 'Equality', 'Frenzy', 'Greed', 'Hunger', 'Looting', 'Motivation', 'Observation', 'Packrat', 'Pheromones', 'Power', 'Prismal', 'Resilience', 'Smithology', 'Toughness', 'Trumps'];

	Object.keys(perks).forEach((perkName) => {
		const perkData = game.portal[perkName];
		if (perkData) {
			const perk = perks[perkName];
			perk.locked = perkData.radLocked;
			perk.priceBase = perkData.priceBase;
			perk.priceFact = perkData.specialGrowth ? perkData.specialGrowth : 1.3;
			if (perkData.max) perk.max = perkData.max;
			if (efficiencyPerks.includes(perkName)) perk.efficiency = 0;

			if (perkName === 'Observation') perk.efficiency2 = 0;
			if (perkName === 'Frenzy') {
				perk.procEffect = 0.001;
				perk.timeEffect = 5;
			}
		}
	});

	if (preset === 'berserk') perks.Frenzy.optimize = false;
	if (preset === 'smithless') perks.Smithology.optimize = false;
	if (preset === 'trappa') perks.Pheromones.optimize = false;
	perks.Bait.optimize = preset === 'trappa';
	perks.Pheromones.optimize = preset !== 'trappa' && game.stats.highestRadLevel.valueTotal() >= 60;
	perks.Trumps.optimize = preset === 'downsize';

	if (props.runningTrappa && (preset === 'combat' || preset === 'combatRadon')) {
		perks.Bait.optimize = false;
		perks.Pheromones.optimize = false;
	}

	return [props, perks];
}

function surkyResetPerkLevels(perks, skipLevel = false) {
	// read save into input perk fields
	// enable perks (in input fields and perks object) based on locked status from save
	// DO NOT update perk object levels yet
	const portal = game.portal;
	for (let [key, value] of Object.entries(perks)) {
		if (typeof value !== 'object' || !value.hasOwnProperty('optimize')) continue;
		// iterating over the perks, ignoring aux values
		if (portal.hasOwnProperty(key)) {
			const portalPerk = portal[key];
			const calcPerk = perks[key];
			if (!skipLevel) calcPerk.level = portalPerk.radLevel + (portalPerk.levelTemp ? portalPerk.levelTemp : 0);
		} else {
			perks[key].level = 0;
		}
	}
	return perks;
}

function initialLoad(skipLevels = false) {
	const universe = game.global.universe;
	const surkyInputs = JSON.parse(localStorage.getItem('surkyInputs'));
	let [props, perks] = initPerks();
	perks = surkyResetPerkLevels(perks, skipLevels);
	props.specialChallenge = $$('#preset').value;

	// target zone to CLEAR is 1 zone before the portal zone by default
	const currentZone = Math.max(1, universe === 2 ? game.global.world : surkyInputs.targetZone);
	$$('#targetZone').value = Math.max(currentZone, surkyInputs.targetZone);
	props.targetZone = Number($$('#targetZone').value);

	// weapon/armor levels taken from dagger/boots (most likely to be leveled highest)
	$$('#weaponLevels').value = surkyInputs.weaponLevels;
	props.weaponLevels = Number($$('#weaponLevels').value);

	$$('#armorLevels').value = surkyInputs.armorLevels;
	props.armorLevels = Number($$('#armorLevels').value);

	const tributeCount = universe === 2 ? game.buildings.Tribute.owned : 0;
	$$('#tributes').value = Math.max(tributeCount, surkyInputs.tributes);
	props.tributes = Number($$('#tributes').value);

	const metCount = universe === 2 ? game.jobs.Meteorologist.owned : 0;
	$$('#meteorologists').value = Math.max(metCount, surkyInputs.meteorologists);
	props.meteorologists = Number($$('#meteorologists').value);

	const smithyCount = universe === 2 ? game.buildings.Smithy.owned : 0;
	$$('#smithyCount').value = Math.max(smithyCount, surkyInputs.smithyCount);
	props.smithyCount = Number($$('#smithyCount').value);

	const rnPerRun = game.resources.radon.owned || 0;
	props.radonPerRun = Math.max(rnPerRun, Number(surkyInputs.radonPerRun));
	$$('#radonPerRun').value = props.radonPerRun;

	const housingCount = universe === 2 ? game.buildings.Collector.owned : 0;
	$$('#housingCount').value = Math.max(housingCount, surkyInputs.housingCount);
	props.housingCount = Number($$('#housingCount').value);

	$$('#trapHrs').value = surkyInputs.trapHrs;
	props.trapHrs = Number($$('#trapHrs').value);

	$$('#findPots').value = Math.max(alchObj.potionsOwned[2], surkyInputs.findPots);

	props.vmZone = Math.max(15, props.targetZone - 1);
	let rawRnRun = game.resources.radon.owned;
	props.radonPerRun = Number($$('#radonPerRun').value);

	// if Rn/run is locked, believe it, and force the old history (lets the user manually correct an error)
	// also for easier testing (and to prevent long term problems with bad user input), assume an input greater than lifetime radon is not something the user wants semi-permanently locked
	if (rawRnRun > parseFloat(props.radonPerRun) / 20 || (props.radonPerRun >= game.global.totalRadonEarned && rawRnRun > game.global.totalRadonEarned / 1e6)) {
		// Quick and dirty hack: estimate about 60% Rn from VMs for VS1.
		// exponentially weighted moving average parameters for Rn/run
		const rnTerms = 10;
		const rnMAWeights = Array.from({ length: rnTerms }, (_, i) => 0.3 * 0.7 ** i);
		const rnMAWeightsum = rnMAWeights.reduce((a, b) => a + b, 0);
		rnMAWeights.forEach((_, index) => (rnMAWeights[index] /= rnMAWeightsum));

		let history = JSON.parse(window.localStorage.getItem('rPrHistory')) || Array(rnTerms).fill(rawRnRun);
		history.unshift(rawRnRun);
		history.pop();
		history = history.map((value) => (value > 0 ? value : rawRnRun));

		const ewma = history.reduce((sum, value, index) => sum + value * rnMAWeights[index], 0);
		window.localStorage.setItem('rPrHistory', JSON.stringify(history));
		$$('#radonPerRun').value = ewma;
		props.radonPerRun = $$('#radonPerRun').value;
	}
	if (parseFloat($$('#radonPerRun').value) < game.global.totalRadonEarned / 1e6) {
		// if a new user of the calculator happens to be starting from a battle spec or U1 save, give them a not completely stupid Rn/run value
		//  -> This is likely to be inaccurate and give shitty results for a few runs, but it's better than accepting some comparatively minuscule value incorrectly.
		rawRnRun = game.global.bestRadon / 5;
		if (!(rawRnRun > 30)) rawRnRun = 30;
		$$('#radonPerRun').value = rawRnRun;
		props.radonPerRun = $$('#radonPerRun').value;
	}

	// calculate Scruffy level (adapted from Fluffy.getLevel() in the game source code)
	props.scruffyLevel = Math.floor(Math.log((game.global.fluffyExp2 / 1000) * 3 + 1) / Math.log(4));

	let shield = null;
	if (game.global.universe === 2 && Object.keys(game.global.ShieldEquipped).length !== 0) {
		shield = game.global.ShieldEquipped;
	} else {
		const u2Shield = game.global.lastHeirlooms.u2.Shield;
		if (game.global.ShieldEquipped.id === u2Shield) {
			shield = game.global.ShieldEquipped;
		} else {
			shield = game.global.heirloomsCarried.find(function (s) {
				return s.id === u2Shield;
			});
		}
	}

	if (shield && Object.keys(shield).length !== 1) {
		function findMod(modName) {
			return shield.mods.find((el) => el[0] === modName);
		}

		const critDamageMod = findMod('critDamage');
		props.shieldCD = critDamageMod ? Math.round(critDamageMod[1] / 10) : 0;

		const prismalMod = findMod('prismatic');
		props.shieldPrismal = prismalMod ? Math.round(prismalMod[1]) : 0;

		const ineqMod = findMod('inequality');
		props.healthDerate = ineqMod ? Math.log(0.9 + ineqMod[1] / 10000) / Math.log(0.9) : 1;
	}

	// Suprism gives 3% prismal shield per SA level
	if (autoBattle.oneTimers.Suprism.owned) props.shieldPrismal += 3 * (autoBattle.maxEnemyLevel - 1);

	// reset the memoization results for the shinyTable, in case the target zone changed
	props.shinyTable = [0];
	// 0 obs = 0 trinkets (won't occur when obs is unlocked since there's 1 free level)?

	// Accuracy doesn't matter prior to Obs, but 0 will give no value to radon gains so >0 is needed.
	props.radonPerRun = Math.max(1, props.radonPerRun);

	let logEnemyHealthScaling = Math.log(Math.sqrt(3.265) * 1.1 * 1.32);
	let logEnemyAttackScaling = Math.log(Math.sqrt(3.27) * 1.15 * 1.32);
	// final enemy HP/ATK scaling including the sqrt(zone) component:
	//   (note we don't divide by 2, because we're adding the two log sqrt components together)
	props.logEnemyScaling = logEnemyHealthScaling + logEnemyAttackScaling + Math.log(1 + 1 / props.targetZone);
	if (props.targetZone >= 300) props.logEnemyScaling += 2 * Math.log(1.15);

	// calculate equipment resource scaling for atk/hp based on weaponl/armor levels
	const wLevScaling = Math.pow((props.weaponLevels + 1) / props.weaponLevels, 1 / Math.log(1.2));
	const aLevScaling = Math.pow((props.armorLevels + 1) / props.armorLevels, 1 / Math.log(1.2));
	props.equipScaling = {
		attack: Math.min(wLevScaling, Math.pow(Math.pow(1.19, 13), 1 / Math.log(Math.pow(1.069, 57 * 0.85)))),
		health: Math.min(aLevScaling, Math.pow(Math.pow(1.19, 14), 1 / Math.log(Math.pow(1.069, 57 * 0.85))))
	};

	// use tenacity time to calculate tenacity effect
	//   -> for any radon weight we presume we don't have high tenacity time (and radon will dominate for MF regardless)
	//   -> for no radon weight we presume we're pushing and care about tenacity more
	if (props.radonWeight > 0) {
		if (props.vmZone > 200) props.tenacityTime = 40;
		else props.tenacityTime = 10;
	} else {
		props.tenacityTime = 120;
	}

	function getTenacityEffect(time) {
		if (time <= 60) {
			time *= 10 / 6;
		} else {
			time -= 60;
			time *= 2 / 6;
			time += 100;
		}
		return 1.1 + Math.floor(time / 4) * 0.01;
	}

	perks.Tenacity.effect = getTenacityEffect(props.tenacityTime);

	props.coordLimited = Number($$('#coordLimited').value);
	if (props.coordLimited < 0) props.coordLimited = 0;

	// approximate number of imp-orts of a given type per zone
	props.imperzone = (props.scruffyLevel >= 9 ? 3.5 : 3) + game.permaBoneBonuses.exotic.owned * 0.05 + 3.0 / 5;

	// get potency mod from target zone (div by 10 to get per-tick potency which is what's actually used in-game)
	props.potency = 0.00085 * Math.pow(1.1, Math.floor(props.targetZone / 5)) * Math.pow(1.003, props.targetZone * props.imperzone);
	props.glassRadon = game.global.glassDone && props.vmZone > 175;

	// to a good approximation for zones substantially past the last housing unlock, total population (scaled by best housing base pop) is:
	//   <best housing count> * coefC - termR
	// So we can use these values to estimate the actual marginal gain in tauntimp-adjusted population.

	// calculate coefficients for tauntimp housing correction
	const housingTypes = {
		collector: [50, 1.12]
	};

	if (props.hubsEnabled || props.specialChallenge === 'downsize') {
		housingTypes.hut = [1, 1.24];
		housingTypes.house = [1, 1.22];
		housingTypes.mansion = [9, 1.2];
		housingTypes.hotel = [15, 1.18];
		housingTypes.resort = [26, 1.16];
		housingTypes.gateway = [31, 1.14];
	}

	let coefC = 0;
	let termR = 0;
	let typeCount = 0;
	const tauntRate = Math.pow(1.003, props.imperzone);
	for (let [key, [startZone, scaling]] of Object.entries(housingTypes)) {
		const scaleZones = props.targetZone - startZone;
		const houseRate = Math.log(1.25) / Math.log(scaling);
		const taunTemp = Math.pow(tauntRate, scaleZones);
		const tauntRm1 = tauntRate - 1;
		const factor = key === 'collector' ? props.collectHubs : 1;
		coefC += (factor * (taunTemp - 1)) / tauntRm1;
		termR += (factor * tauntRate * houseRate * (taunTemp * (scaleZones * tauntRm1 - 1) + 1)) / (tauntRm1 * tauntRm1);
		typeCount++;
	}
	props.coefC = coefC / typeCount;
	props.termR = termR / typeCount;

	props.perksRadon = countHeliumSpent(false, true) + game.global.radonLeftover + (portalWindowOpen ? game.resources.radon.owned : 0);
	props.radonSpent = getTotalPerksCost(perks);

	return [props, perks];
}

function getTotalPerksCost(perks) {
	let cost = 0;
	for (let [perkName, perkObj] of Object.entries(perks)) {
		cost += getPerkCost(perkName, perkObj.level, true, perks);
	}
	return cost;
}

function getPerkCost(whichPerk, numLevels, fromZero = false, perks) {
	if (numLevels === 0) return 0;
	const perk = perks[whichPerk];
	let level = fromZero ? 0 : perk.level;
	// if the perk can't be leveled, return infinite cost to naturally avoid buying the perk
	if (perk.locked || (perk.hasOwnProperty('max') && level + numLevels > perk.max)) return Infinity;
	let cost = 0;
	for (let i = 0; i < numLevels; i++) {
		cost += Math.ceil(level / 2 + perk.priceBase * Math.pow(perk.priceFact, level));
		level++;
	}
	return cost;
}

//This needs to increment props+perks to the next level, and return the cost of doing so
//That means we need to return this info to whatever calls it, and then that needs to update the props+perks
function couldBuyPerk(whichPerk, actuallyBuy = false, numLevels = 1, props, perks) {
	const perk = perks[whichPerk];
	const canBuy = !perk.hasOwnProperty('max') || perk.level + numLevels <= perk.max;
	const cost = canBuy ? getPerkCost(whichPerk, numLevels, false, perks) : Infinity;
	const affordable = cost + props.radonSpent <= props.perksRadon;

	if (canBuy && affordable && actuallyBuy) {
		props.radonSpent += cost;
		perks[whichPerk].level += numLevels;
	}

	return [canBuy && affordable, props, perks];
}

function buyPerk(whichPerk, numLevels = 1, props, perks) {
	const perkResult = couldBuyPerk(whichPerk, true, numLevels, props, perks);
	return perkResult;
}

function getGreedEffect(tribs) {
	tribs = Math.min(tribs, 1250) - 600;

	let mod = 1.025;
	if (tribs > 0) {
		mod += 0.00015 * tribs;
		mod += Math.floor(tribs / 25) * 0.0035;
	}

	return mod;
}

// get the first-order feedback from Greed of a given boost to resources via more tributes
function getGreedResourceFeedback(resBoost, tribs, perks) {
	if (tribs >= 1250) return [1, tribs];
	let tribsGained = Math.log(resBoost) / Math.log(1.05);
	if (tribs + tribsGained < 600) return [1, tribs];
	if (tribs + tribsGained > 1250) tribsGained = 1250 - tribs;
	if (tribs < 600) tribsGained = tribs + tribsGained - 600;

	const baseGreed = getGreedEffect(tribs);
	const greedGain = (baseGreed + 0.00029 * tribsGained) / baseGreed;
	return [Math.pow(greedGain, perks.Greed.level), tribs + tribsGained];
}

// Calculate the absolute Rn-equivalent value of gaining trinkets (RIP to relativism :<<<)
//    This is just the Rn cost of buying enough Mot/Pow/Tough to get the same boost to power stats as
//    a trinket would give you. The baseline above which we're measuring is whatever trinkets we'd expect
//    to have after next run if we didn't gain any marginal trinkets.
// We return 3 values:
//    1. The Rn value of all expected trinkets gained in a run at baseline perks.
//    2. The additional Rn value of a marginal trinket above those gained at baseline perks.
//    3. The baseline number of trinkets we expect to have at the end of the next run at current Obs.
// INPUTS:
//    gain factor at current level and cost for each of the basic powerlevel gain perks (Mot/Pow/Tough)
// NOTE that this weight does NOT capture the direct powerlevel gain value of more trinkets, which is captured elsewhere,
//   including feedback mechanisms via more resources and further pushing that aren't appropriate to use for "Radon-like"
//   growth weight. This is only capturing the long term growth value of additional trinket drops.
function getTrinketValues(motivCost, powCost, toughCost, props, perks) {
	// trinket gain from pushing power will be 0 when Obs level is 0, so go ahead and calculate
	//   the value of trinket growth based on 1 Obs level to help evaluate the value of the first Obs
	//   level itself.
	const obsLevel = Math.max(1, 1 + perks.Observation.level);

	// Get the expected Rt at the end of the next run with the current Obs level.
	let shinies = game.portal.Observation.trinkets + shinyCollect(perks.Observation.level + 1, props);
	if (game.portal.Observation.trinkets === 0) {
		shinies += 10;
		// first Obs level gives 10 trinkets
	}
	shinies = Math.min(shinies, obsLevel * 1000);

	const cappedBaseTrinkets = Math.min(game.portal.Observation.trinkets, obsLevel * 1000);

	// marginal shine gain per run (for baseline perks)
	const marginalShinePerRun = (100 + shinies * obsLevel) / (100 + cappedBaseTrinkets * obsLevel);
	// marginal shine gain of one additional trinket
	const marginalShinePerTrinket = 1 + obsLevel / (100 + shinies * obsLevel);

	let res = [];
	for (let marginalShine of [marginalShinePerRun, marginalShinePerTrinket]) {
		// For each of Mot/Pow/Tough, presuming those levels are efficient, calculate the Rn cost of getting
		//   the equivalent boost the marginal shine.
		// Total cost of N levels for a compounding price factor of F and next level cost of C:
		//   C/(F-1) * (F^N - 1)
		// Starting from a level of L, the gain factor of N more levels of any of these perks is:
		//   G = (100 + (L+N)*5)/(100 + L*5)
		// So solving for N we get:
		//   N = (G-1)*(20+L)
		const motF = perks.Motivation.priceFact;
		const motN = (marginalShine - 1) * (20 + perks.Motivation.level);
		const motShineCost = (motivCost / (motF - 1)) * (Math.pow(motF, motN) - 1);
		const powF = perks.Power.priceFact;
		const powN = (marginalShine - 1) * (20 + perks.Power.level);
		const powShineCost = (powCost / (powF - 1)) * (Math.pow(powF, powN) - 1);
		const touF = perks.Toughness.priceFact;
		const touN = (marginalShine - 1) * (20 + perks.Toughness.level);
		const touShineCost = (toughCost / (touF - 1)) * (Math.pow(touF, touN) - 1);
		// sum up all the costs of the powerlevel perks
		const totShineCost = motShineCost + powShineCost + touShineCost;
		res.push(totShineCost);
	}
	res.push(shinies);
	// also return the expected trinket count next run at baseline Obs level
	return res;
}

// Observation has a direct gain component (powering up each trinket), and a growth component (due to marginal trinket
//   droprate). This function returns the direct power gain (calculated based on the expected trinkets after the next run)
//   and the increase in trinkets gained next run specifically due to the droprate increase.
// Note this can calculate for any number of increased Obs levels, though we expect to use just +1 and +2.
//   +2 is useful because free trinkets at even levels are a major growth driver, so +2 levels may actually end up being
//   more cost efficient than +1 level at times.
function getObservationGains(levels, props, perks) {
	const obsLevel = 1 + perks.Observation.level;
	// this gets referred to a lot, shortening the reference

	// Get expected trinket count at end of next run with the old Obs level
	const currentCollect = shinyCollect(obsLevel, props);
	let shinies = game.portal.Observation.trinkets + currentCollect;
	shinies = Math.min(shinies, obsLevel * 1000);
	// still need to re-bound in case we dropped an Obs level and have super-capped trinkets.

	// Get expected trinket count at end of next run with the new Obs level
	const nextCollect = shinyCollect(obsLevel + levels, props);
	let shiniesNext = game.portal.Observation.trinkets + nextCollect;
	if (game.portal.Observation.trinkets === 0) shiniesNext += 10;
	// 10 free trinkets for first Obs level
	shiniesNext = Math.min(shiniesNext, (obsLevel + levels) * 1000);

	// Calculate the direct gain in powerlevel at end of next run. Note this is the total powerlevel gain
	//   INCLUDING power immediately gained due to marginal trinket drops. This is because the Rn-like value
	//   of trinkets is valued as if those trinkets had no effect until the subsequent run (as true Rn
	//   gains on the next run would not have an effect within the same run).
	const directGain = (100 + shiniesNext * (obsLevel + levels)) / (100 + shinies * obsLevel);
	// upper bound on direct gain at re-capped trinkets:
	//   Obs value WITH droprate included can never exceed this value WITHOUT droprate included, if we're approaching
	//   our current trinket cap. No limit to droprate value if we are not approaching our cap.
	let maxDirectGain = Infinity;
	if (shinies >= obsLevel * 1000) {
		maxDirectGain = (100 + (obsLevel + levels) * (obsLevel + levels) * 1000) / (100 + obsLevel * shinies);
	}

	// Calculate the marginal gain in trinket power next run specifically due to the increased drop rate.
	//   We must consider ONLY the actual increase in trinkets on the save caused by the new Obs level(s).
	//   e.g. if you're at 12.5k and obs 12, we should only count the actual trinkets dropped next run at Obs 13,
	//   not the 500 trinkets that you already have on your save that only become unlocked this run (which is already
	//   accounted in the direct gain and does NOT represent an increase in drops).
	let moreTrinkets;
	if (game.portal.Observation.trinkets >= (obsLevel + levels) * 1000) {
		moreTrinkets = 0;
	} else if (game.portal.Observation.trinkets >= obsLevel * 1000) {
		moreTrinkets = Math.max(0, shiniesNext - game.portal.Observation.trinkets);
	} else {
		moreTrinkets = shiniesNext - shinies;
	}

	return [directGain, moreTrinkets, maxDirectGain];
}

// Do one iteration step of applying all gain feedback mechanisms in some semblance of a smart priority order
// INPUTS (also the output):
// values as gain factors: attack, health, metal, food, F/M/L, radon/growth, population, equality
// key values driving gain feedback to avoid endless positive feedback:
//   tribute count (for greed), collector count, are hubs enabled?, meteorologist count
// trinket droprate and trinket count (increase in trinket count must be converted to a value outside this function),
//   as well as the Obs level to consider for this valuation (in case we're evaluating Obs)
// also need to keep track of what gains have already been applied (and should not be continuously re-applied):
//   Vpushed = Va * Vh already applied
//   V<x>Done = V<x> already applied
// Everything from increased trinket count and onwards is optional, and defaults to values that should be passed at the
//   start of the iteration process (0 trinkets gained, all other gain values at 1 i.e. no gain)
// NOTE: "metal" includes gear discount here. if someday metal gain is a primary determinant of some
//   important mechanic other than equipment, there would need to be a separate gear discount input.
// NOTE: metal/food are MUTLIPLICATIVE gain over and above the unified F/M/L gain.
function iterateValueFeedback(valueArray, props, perks) {
	var [Va, Vh, Vm, Vf, Vres, Vrad, Vp, Ve, tribs, collectors, hubEnabled, mets, trinketRate, trinkets, obsLevel, Vpushed = 1, VmDone = 1, VfDone = 1, VresDone = 1, VpDone = 1] = valueArray;

	// when tribute count is < 1250, resource->resource/radon feedback is strong via Greed
	if (tribs < 1250) {
		var [greedback, tribs] = getGreedResourceFeedback((Vf * Vres) / (VfDone * VresDone), tribs, perks);
		Vres *= greedback;
		Vrad *= greedback;
	}

	// more resources buy more housing, which feeds back to more resources and population
	//  -> Don't bother with this small correction below Collectors, especially since Gateways don't scale with F/M/L.
	//     Frags do scale with "some" resource boosts, but approximating them as non-scaling as a general rule is pretty close to correct.
	let moreHousing = Math.log((Vf * Vres) / (VfDone * VresDone)) / Math.log(1.12); // Collectors scale with food (no other basic resources needed)
	let baseHousing = collectors;
	// for downsize we make the same adjustments as for hubs, just saying "all housing buildings have the same value"
	if (props.hubsEnabled || props.specialChallenge === 'downsize') {
		moreHousing *= props.collectHubs;
		moreHousing += (5 * Math.log(Vres / VresDone)) / Math.log(1.2); // 5 housing types below Gateway need wood, roughly 1.2 avg scaling (Gateway doesn't scale)
		baseHousing *= 6 + props.collectHubs;
		// estimate all housing types have the same number as Collectors (close enough for gain factor w.r.t. the small feedback effects here)
	}
	// if the user doesn't have collectors yet, don't bother with housing corrections (yes this will exclude O.G. downsize, tough)
	//   (tauntimp correction uses coefC & termR calculated in readInput(), based on target zone)
	const tauntCorrectedHousingBase = baseHousing * props.coefC - props.termR;
	const tauntCorrectedHousingNext = (baseHousing + moreHousing) * props.coefC - props.termR;
	let housingGain = tauntCorrectedHousingNext / tauntCorrectedHousingBase;
	if (!(housingGain > 1) || tauntCorrectedHousingBase <= 0) housingGain = 1;
	if (props.specialChallenge === 'downsize') {
		// 2 territory bonuses per zone, each bonus is 5 + trumps level
		const trumPop = 2 * props.targetZone * (5 + perks.Trumps.level);
		// actual gain: (housing * housingGain + trumpop) / (housing + trumpop)
		housingGain = 1 + ((housingGain - 1) * baseHousing) / (baseHousing + trumPop);
	}
	Vres *= housingGain;
	Vp *= props.specialChallenge === 'trappa' || props.specialChallenge === 'combat' || props.specialChallenge === 'combatRadon' ? 1 : housingGain; // Trappa housing doesn't help buy more coords. Combat respec assumes we're done buying housing.
	collectors += housingGain;

	// combat spec assumes no more equipment buying
	if (!['combat', 'combatRadon'].includes(props.specialChallenge)) {
		// use equip scaling to convert resource value to atk/hp value
		const VmAdjusted = (Vm * Vres) / (VmDone * VresDone);
		Va *= Math.pow(props.equipScaling.attack, Math.log(VmAdjusted));
		Vh *= Math.pow(props.equipScaling.health, Math.log(VmAdjusted));

		// combat spec assumes no more smithy buying
		if (props.specialChallenge !== 'smithless') {
			// account for smithies: 1.25x atk/hp per 50x resources (40x with S14)
			const smithyGain = Math.pow(1.25, Math.log(Vres / VresDone) / Math.log(props.scruffyLevel >= 14 ? 40 : 50));
			Va *= smithyGain;
			Vh *= smithyGain;
		}
	}

	// if coord limited, account for population gain to coords
	let coordAdjust = props.coordLimited;
	if (props.specialChallenge === 'downsize') {
		// assume coord limited in downsize (allowing the user to weight further toward pop if desired)
		coordAdjust = Math.max(coordAdjust, 1);
	} else if (props.specialChallenge === 'trappa' || (props.specialChallenge === 'combat' && props.runningTrappa)) {
		// Trappa is always coord limited, and the input field is hidden (replaced by the trapping hours field)
		coordAdjust = 1;
	} else if (props.specialChallenge === 'combat' || props.specialChallenge === 'combatRadon') {
		// combat respec reads the actual population/coordinations from the save to determine how many levels of Carp are needed
		coordAdjust = perks.Carpentry.level < props.carpNeeded ? 1 : 0;
	}
	const coordGain = Math.pow(1.25, (Math.log(Vp / VpDone) / Math.log(1.25)) * coordAdjust);
	Va *= coordGain;
	Vh *= coordGain;

	// more food buys more Mets, which have various effects depending on antennas
	const moreMets = Math.log((Vf * Vres) / (VfDone * VresDone)) / Math.log(5);
	const metEff = 0.01 + 0.0005 * game.buildings.Antenna.owned;
	const metRes = 0.5 + 0.25 * (game.buildings.Antenna.owned >= 20 ? Math.floor(game.buildings.Antenna.owned / 5) - 3 : 0);
	const metProd = mets * metEff;
	const metProdNext = (mets + moreMets) * metEff;
	const metRadGain = (1 + metProdNext) / (1 + metProd);
	const metFoodGain = game.buildings.Antenna.owned >= 5 ? (1 + metProdNext * metRes) / (1 + metProd * metRes) : 1;
	const metHPGain = game.buildings.Antenna.owned >= 10 ? (1 + metProdNext * metRes) / (1 + metProd * metRes) : 1;
	const metMineGain = game.buildings.Antenna.owned >= 15 ? (1 + metProdNext * metRes) / (1 + metProd * metRes) : 1;
	Vrad *= metRadGain;
	Vf *= metFoodGain;
	if (!(props.specialChallenge === 'combat') && !(props.specialChallenge === 'combatRadon')) Vh *= metHPGain;
	Vm *= metMineGain;
	mets += moreMets;

	// Feedback from pushing power (final trappa respec: health won't be applied after last army send, so don't count health)
	const pushPower = (Va * (props.specialChallenge === 'combat' && props.runningTrappa ? 1 : Vh)) / Vpushed;
	const pushZones = Math.log(pushPower) / props.logEnemyScaling;
	// speedbooks give 25% resources per zone
	if (props.specialChallenge === 'resplus') {
		// when collecting resources from +maps, we only get 10% resource gain per map
		Vres *= Math.pow(1.1, pushZones);
	} else {
		Vres *= Math.pow(1.25, pushZones);
	}
	// coords give 25% atk/hp per zone IF NOT COORD LIMITED
	Va *= Math.pow(1.25, pushZones * (1 - Math.min(1, coordAdjust)));
	Vh *= Math.pow(1.25, pushZones * (1 - Math.min(1, coordAdjust)));

	// Glass reward gives 10% radon per extra completion if we can increase our VM zone
	if (props.clearWeight >= 0 && props.glassRadon) {
		Vrad *= Math.pow(1.1, pushZones);
	}

	// count S3 for Rn weighting if selected by the user, or if at Obs 0 with no clear weight (which would give no value to pushing perks at all without S3/VS1)
	//   -> or no clear weight and trinkets capped
	const s3RnFinal = props.scruffyLevel >= 3;
	// Scruffy level 3 gives compounding 3% Rn per additional zone
	if (s3RnFinal) {
		Vrad *= Math.pow(1.03, pushZones);
		// VS1 gives additive 0.25% VM Rn per additional zone
		// TODO: vmRadFrac is a hacky constant for now, should probably be a user input after we clean up the volume of user inputs
		Vrad *= 1 + (0.6 * pushZones) / (400 + props.targetZone);
	}
	// trinket gain: use a fixed drop rate based on target zone, which should be fine assuming the user has entered
	//   a sensible value and we're only optimizing at the margins of a fractional zone (or maybe 1-2 zones)
	moreTrinkets = pushZones * trinketRate;
	const trinketMax = 1000 * obsLevel;
	if (moreTrinkets + trinkets > trinketMax) moreTrinkets = trinketMax - trinkets;
	if (moreTrinkets < 0) throw 'Unexpectedly tried to value more trinkets than our trinket max!: ' + trinkets;
	const trinketGain = 1 + (moreTrinkets * obsLevel) / (100 + trinkets * obsLevel);
	Va *= trinketGain;
	Vh *= trinketGain;
	Vres *= trinketGain;
	trinkets += moreTrinkets;

	// copy the values back into the same array reference rather than creating a new array
	// WARNING: If any of these positions change, we also must update getLogWeightedValue appropriately
	valueArray[0] = Va;
	valueArray[1] = Vh;
	valueArray[2] = Vm;
	valueArray[3] = Vf;
	valueArray[4] = Vres;
	valueArray[5] = Vrad;
	valueArray[6] = Vp;
	valueArray[7] = Ve;
	valueArray[8] = tribs;
	valueArray[9] = collectors;
	//valueArray[10] = hubEnabled;
	valueArray[11] = mets;
	//valueArray[12] = trinketRate;
	valueArray[13] = trinkets;
	//valueArray[14] = obsLevel;
	valueArray[15] = Va * (props.specialChallenge === 'combat' && props.runningTrappa ? 1 : Vh);
	valueArray[16] = Vm;
	valueArray[17] = Vf;
	valueArray[18] = Vres;
	valueArray[19] = Vp;
}

// Inputs: gain values for atk, hp, equip discount (or metal), radon, equality, pop
//         moreTrinkets: increased count of trinkets on next run from Obs droprate increase
function getLogWeightedValue(props, perks, Va, Vh, Vgear, Vres, Vrad, Ve = 1, Vp = 1, moreTrinkets = 0, extraObs = 0) {
	const iterateValueLoops = 3;
	const Wa = props.clearWeight; // attack weight
	// health is useless in final trappa respec after sending last army, since new perks won't be applied to current army's health
	const Wh = props.specialChallenge === 'combat' && props.runningTrappa ? 0 : props.clearWeight * props.healthDerate + props.survivalWeight; // health weight
	const We = Math.max(1e-100, props.survivalWeight); // equality weight: force >0 to use equality as a dump perk if the user sets 0 weight
	const Wr = props.radonWeight; // radon weight

	// from iterateValueFeedback:
	//   [Va,Vh,Vm,Vf,Vres,Vrad,Vp,Ve,
	//    tribs,collectors,hubEnabled,mets,
	//    trinketRate,trinkets,obsLevel,
	//    Vpushed=1,VmDone=1,VfDone=1,VresDone=1,VpDone=1] = valueArray;

	// add Obs levels if we're evaluating Observation
	const obsLevel = 1 + perks.Observation.level + extraObs;

	const valueArray = [Va, Vh, Vgear, 1, Vres, Vrad, Vp, Ve, props.tributes, props.housingCount, props.hubsEnabled, props.meteorologists, obsDropRate(obsLevel, props.targetZone, props) / 100, props.baselineTrinketsNext, obsLevel, 1, 1, 1, 1, 1];

	for (let i = 0; i < iterateValueLoops; i++) iterateValueFeedback(valueArray, props, perks);

	Va = valueArray[0];
	Vh = valueArray[1];
	Vm = valueArray[2];
	Vres = valueArray[4];
	Vrad = valueArray[5];
	Ve = valueArray[7];
	Vtrink = valueArray[13];

	// only count actual new trinket drops, not extra "apparent" trinkets from cap increase!
	moreTrinkets += Math.max(0, Vtrink - Math.max(props.baselineTrinketsNext, game.portal.Observation.trinkets));

	// calculate unified Rn-like growth gain:
	let Vgrowth = (Vrad * props.radonPerRun + props.trinketRadonPerRun + props.radonPerTrinket * moreTrinkets) / (props.radonPerRun + props.trinketRadonPerRun);

	if (props.specialChallenge === 'combat') Vgrowth = 1; // ignore radon weight for combat spec

	// A perk's total weighted value is:
	//   Va^Wa * Vh^Wh * Ve^We * Vrad^Wr.
	// For cost-efficiency between perks with wildly different costs & effects we use the log of this value, which simplifies to:
	//   Wa*log(A) + Wh*log(H) + We*log(E) + Wr*log(R)

	let res = Wa * Math.log(Va) + Wh * Math.log(Vh) + We * Math.log(Ve) + Wr * Math.log(Vgrowth);
	if (props.specialChallenge === 'resplus' || props.specialChallenge === 'resminus') {
		res = Math.log(Vres) + 1e-100 * Math.log(Ve); // hack to still use equality as a primary dump perk
	}
	if (props.specialChallenge === 'equip') {
		res = Math.log(Vres * Vm) + 1e-100 * Math.log(Ve); // for equip farming, Artisanistry also counts
	}

	if (isNaN(res)) {
		console.log('ERROR: NaN result!');
	}

	return res;
}

function obsDropRate(level, zone, props) {
	if (zone < 101) return 0;
	if (zone > 200) zone = 200;
	const base = (1 + (level - 1) / 2) * Math.pow(1.03, zone - 100);

	if (props.specialChallenge === 'alchemy' && zone <= 156) {
		return 100 - (100 - base) * Math.pow(0.99, +$$('#findPots').value);
	}
	return base;
}

// how many trinkets do we expect to get by clearing the target zone?
function shinyCollectLoop(level, props) {
	let shinies = 0;
	// the game checks for the drop after advancing the zone counter, so go to zone+1.
	for (let i = 101; i <= props.zone + 1; i++) {
		shinies += obsDropRate(level, i, props) / 100;
		if (i % 25 === 0) {
			// level-1 since the "level" includes the free +1 obs level, but even levels for guaranteed trinket drops do not include this free +1 level
			const free = Math.floor((level - 1) / 2);
			if (free > 0) shinies += free;
		}
	}
	return shinies;
}

// zone === targetZone, memoized by a lookup table calculated by shinyCollectLoop
function shinyCollect(level, props) {
	if (typeof props.shinyTable[level] === 'undefined') {
		props.shinyTable[level] = shinyCollectLoop(level, props);
	}

	return props.shinyTable[level];
}

// Calculate avg atk with frenzy, accounting for uptime.
//   Optimizing for a given hit count (in practice maybe just 5 and 100, where 100 gives a pretty good approximation of deathless)
function getFrenzyAvgAtk(level, frenzyHits, perks) {
	const frenzyDeathTime = 0.4 + 0.258 * frenzyHits;
	// get off N hits then die, optimizing for Hyperspeed 1
	const frenzyHitTime = frenzyDeathTime / frenzyHits;
	// get off N hits then die
	const frenzyProcChance = perks.Frenzy.procEffect * level;
	// wait time in seconds
	const frenzyProcWaitTime = frenzyHitTime / frenzyProcChance;
	// frenzy uptime for each proc
	const frenzyUptimePerProc = (frenzyDeathTime * Math.log((perks.Frenzy.timeEffect * level) / frenzyDeathTime + 1)) / Math.log(2);
	// uptime fraction for weighting the attack bonus
	let frenzyUptimeFrac = frenzyUptimePerProc / (frenzyProcWaitTime + frenzyUptimePerProc);
	// Mass Hysteria means frenzy is always up
	if (autoBattle.oneTimers.Mass_Hysteria.owned) {
		frenzyUptimeFrac = 1;
	}
	// average attack per hit accounting for uptime fraction
	const frenzyAvgAtk = 1 + frenzyUptimeFrac * perks.Frenzy.effect * level;
	return frenzyAvgAtk;
}

// flag the most efficient perk
function efficiencyFlag(props, perks) {
	const eList = [];
	const pList = [];
	let bestEff = 0;
	let bestAffordableEff = 0;
	props.bestPerk = '';
	// don't flag a perk if we don't find an affordable one!
	for (let [perkName, perkObj] of Object.entries(perks)) {
		if (typeof perkObj !== 'object' || !perkObj.hasOwnProperty('optimize') || !perkObj.optimize) {
			continue;
		}
		// iterating over the perks, ignoring aux values
		eList.push(perkObj.efficiency);
		pList.push(perkName);
		if (perkObj.efficiency > bestEff) {
			bestEff = perkObj.efficiency;
		}
		// don't buy level-locked perks
		if (couldBuyPerk(perkName, false, 1, props, perks)[0] && perkObj.efficiency > bestAffordableEff) {
			bestAffordableEff = perkObj.efficiency;
			props.bestPerk = perkName;
		}
		if (perkObj.hasOwnProperty('efficiency2')) {
			if (perkObj.efficiency2 > bestEff) {
				bestEff = perkObj.efficiency2;
			}
			if (couldBuyPerk(perkName, false, 2, props, perks)[0] && perkObj.efficiency2 > bestAffordableEff) {
				bestAffordableEff = perkObj.efficiency2;
				props.bestPerk = perkName;
			}
		}
	}
	return props;
}

function getPerkEfficiencies(props, perks) {
	// TODO: most perks don't change other perks' efficiencies (given our assumptions of local flatness)
	//  So move the efficiency calculations to functions owned by each perk, and only update efficiency when actually
	//  buying a perk. Notable exception for Observation (and carefully look for other exceptions), which will require
	//  some exception mechanism to update interdependent perks' efficiencies.
	// Now that we're doing a complex feedback iteration process for each perk efficiency, this is going to become necessary
	//  to avoid exploding computation time.

	// used for combat respec to determine exactly how much carp is needed to afford all coords (given we require an appropriate save for this preset)
	//   -> max army size before buying final coord is 1/3 of population
	const moreCoordsNeeded = Math.max(0, props.targetZone - game.upgrades.Coordination.done);
	const popNeededForCoords = 3 * Math.pow(1.25, moreCoordsNeeded) * game.resources.trimps.maxSoldiers;
	const tauntBase = 1.003 + 0.0001 * perks.Expansion.level;
	const tauntMult = game.global.expandingTauntimp ? Math.pow(tauntBase, game.unlocks.impCount.Tauntimp) : 1;
	// expanding tauntimps mean taunt pop is not in maxTrimps, it's a flat multiplier
	const tauntCorrectedMaxTrimps = tauntMult * (game.resources.trimps.max * game.resources.trimps.maxMod * props.scaffMult) * Math.pow(tauntBase, props.imperzone * (props.targetZone - game.global.world));
	props.carpNeeded = Math.log(popNeededForCoords / tauntCorrectedMaxTrimps) / Math.log(1.1);

	// Get various gain factors needed to calculate the value of trinkets (and also used to value their respective perks).
	//  Motivation
	const motiv = 1 + perks.Motivation.level * perks.Motivation.effect;
	let motivGain = (motiv + perks.Motivation.effect) / motiv;
	// trappa is heavily drop-based prior to 160, and mostly gathering based after 170
	if (props.specialChallenge === 'trappa') {
		if (props.targetZone < 162) {
			motivGain = Math.pow(motivGain, 0.0001);
			// derate motivation in trappa (don't want to zero it out but it doesn't increase F/M/L meaningfully)
		} else if (props.targetZone < 172) {
			motivGain = Math.pow(motivGain, 0.5);
		}
	}

	const motivCost = getPerkCost('Motivation', 1, false, perks);
	// Power
	const pow = 1 + perks.Power.level * perks.Power.effect;
	const powGain = (pow + perks.Power.effect) / pow;
	const powCost = getPerkCost('Power', 1, false, perks);
	// Toughness
	const tough = 1 + perks.Toughness.level * perks.Toughness.effect;
	const toughGain = (tough + perks.Toughness.effect) / tough;
	const toughCost = getPerkCost('Toughness', 1, false, perks);

	// Get the absolute Rn values for trinkets expected at baseline Observation and per marginal trinket,
	//   and the expected count of trinkets at the end of this run at baseline Observation.

	const trinketValues = getTrinketValues(motivCost, powCost, toughCost, props, perks);
	[props.trinketRadonPerRun, props.radonPerTrinket, props.baselineTrinketsNext] = trinketValues;

	// Artisanistry:
	//   resource gain for equipment only
	perks.Artisanistry.efficiency = getLogWeightedValue(props, perks, 1, 1, perks.Artisanistry.effect, 1, 1, 1) / getPerkCost('Artisanistry', 1, false, perks);

	// Bait:
	//   population in Trappa, but derate resource gains like for Motivation
	if (props.specialChallenge === 'trappa' && props.runningTrappa) {
		// 3600 seconds per hr, 10 ticks per second, 10x base trimps per tick (S0 ability)
		const baitTime = 3600 * 10 * 10 * props.trapHrs;
		const totalBaitPopBase = baitTime * (1 + perks.Bait.level);
		const totalBaitPopNext = baitTime * (2 + perks.Bait.level);
		const baitPop = (totalBaitPopNext + props.trappaStartPop) / (totalBaitPopBase + props.trappaStartPop);
		perks.Bait.efficiency = getLogWeightedValue(props, perks, 1, 1, 1, Math.pow(baitPop, 0.0001), 1, 1, baitPop) / getPerkCost('Bait', 1, false, perks);
	}

	// Expansion
	//   Assume Expanding Tauntimps, so all expected Tauntimps for target zone are applied
	const expandotaunts = props.targetZone * props.imperzone;
	const expandobase = 1 + 1 / (10030 + perks.Expansion.level);
	const expandogain = Math.pow(expandobase, expandotaunts);

	// Carpentry:
	//   population gain, also gives resources
	const carpPop = perks.Carpentry.effect;
	if (props.specialChallenge === 'trappa' || (props.specialChallenge === 'combat' && props.runningTrappa)) {
		// In Trappa, carp gives more housing which gives more drops, but does not increase available Trimps
		perks.Carpentry.efficiency = getLogWeightedValue(props, perks, 1, 1, 1, carpPop, 1, 1, 1) / getPerkCost('Carpentry', 1, false, perks);
		perks.Expansion.efficiency = getLogWeightedValue(props, perks, 1, 1, 1, expandogain, 1, 1, 1) / getPerkCost('Expansion', 1, false, perks);
	} else {
		perks.Carpentry.efficiency = getLogWeightedValue(props, perks, 1, 1, 1, carpPop, 1, 1, carpPop) / getPerkCost('Carpentry', 1, false, perks);
		perks.Expansion.efficiency = getLogWeightedValue(props, perks, 1, 1, 1, expandogain, 1, 1, expandogain) / getPerkCost('Expansion', 1, false, perks);
	}

	// Trumps:
	//   population in downsize
	if (props.specialChallenge === 'downsize') {
		// estimate same number of each housing building, should be "good enough"
		const buildPop = (props.hubsEnabled ? 13 + props.collectHubs : 7) * props.housingCount;
		// 2 territory bonuses per zone, each bonus is 5 + trumps level
		const baseTrumPop = 2 * props.targetZone * (5 + perks.Trumps.level);
		const trumPop = (buildPop + baseTrumPop + 2 * props.targetZone) / (buildPop + baseTrumPop);
		perks.Trumps.efficiency = getLogWeightedValue(props, perks, 1, 1, 1, trumPop, 1, 1, trumPop) / getPerkCost('Trumps', 1, false, perks);
	}

	// Criticality:
	//   attack gain from crits
	const CD = 1 + props.shieldCD / 100 + perks.Criticality.level * perks.Criticality.effect;
	const CC = props.specialChallenge === 'duel' ? 0.5 : 1;
	// derate crit chance for duel
	const critGain = (1 - CC + CC * (CD + perks.Criticality.effect)) / (1 - CC + CC * CD);
	perks.Criticality.efficiency = getLogWeightedValue(props, perks, critGain, 1, 1, 1, 1, 1) / getPerkCost('Criticality', 1, false, perks);

	// Equality:
	perks.Equality.efficiency = getLogWeightedValue(props, perks, 1, 1, 1, 1, 1, perks.Equality.effect) / getPerkCost('Equality', 1, false, perks);

	// Championism:
	perks.Championism.efficiency = getLogWeightedValue(props, perks, 1.01 + 0.005 * (autoBattle.maxEnemyLevel - 1), 1.01 + 0.005 * (autoBattle.maxEnemyLevel - 1), 1, 1, 1, 1) / getPerkCost('Championism', 1, false, perks);

	// Frenzy
	//   attack boost when frenzy is active
	// Frenzy should be based on 5-hit deaths iff relying on GB for at least one zone of the run is good.
	//    We presume this is always true if you have any pushing weight.
	//    With no pushing weight, we presume it's FALSE (optimizing for 300 hits instead) unless a 3-minute zone would yield enough radon/trinket gains to be good, which roughly corresponds to when GB is useful.
	if (props.specialChallenge !== 'berserk') {
		let frenzyHits = 300;
		const isDeathless = props.specialChallenge === 'resplus' || props.specialChallenge === 'resminus' || props.specialChallenge === 'trappa' || (props.specialChallenge === 'combat' && props.runningTrappa);
		if (!isDeathless && props.clearWeight > 0) {
			frenzyHits = 5;
		}
		const frenzyAvgAtk = getFrenzyAvgAtk(perks.Frenzy.level, frenzyHits, perks);
		const frenzyAvgAtkNext = getFrenzyAvgAtk(perks.Frenzy.level + 1, frenzyHits, perks);
		const frenzyGain = frenzyAvgAtkNext / frenzyAvgAtk;
		perks.Frenzy.efficiency = getLogWeightedValue(props, perks, frenzyGain, 1, 1, 1, 1, 1) / getPerkCost('Frenzy', 1, false, perks);
	}

	// Greed:
	//   all-resource and radon gain
	const greedGain = getGreedEffect(props.tributes);
	perks.Greed.efficiency = getLogWeightedValue(props, perks, 1, 1, 1, greedGain, greedGain, 1) / getPerkCost('Greed', 1, false, perks);

	// Looting:
	//   all-resource and radon gain
	const loot = 1 + perks.Looting.level * perks.Looting.effect;
	const lootGain = (loot + perks.Looting.effect) / loot;
	const lootCost = getPerkCost('Looting', 1, false, perks);
	perks.Looting.efficiency = getLogWeightedValue(props, perks, 1, 1, 1, lootGain, lootGain, 1) / lootCost;

	// Motivation:
	//   all-resource gain (no radon)
	// Note motivGain is already derated for Trappa above
	perks.Motivation.efficiency = getLogWeightedValue(props, perks, 1, 1, 1, motivGain, 1, 1) / motivCost;

	// Packrat:
	//   all-resource gain from decreased storage costs (no radon)
	// Note: 0.125 because you only pay taxes on the half of your last storage that you filled before buying it
	// Note: / 2 because we might guess you spend as many resources as you can store after your last storage building
	const storeTax = 0.125 / (1 + perks.Packrat.level * perks.Packrat.effect) / 2;
	const storeTaxNext = 0.125 / (1 + (perks.Packrat.level + 1) * perks.Packrat.effect) / 2;
	const ratGain = (1 - storeTaxNext) / (1 - storeTax);
	perks.Packrat.efficiency = getLogWeightedValue(props, perks, 1, 1, 1, ratGain, 1, 1) / getPerkCost('Packrat', 1, false, perks);

	// Pheromones
	//   Count 3-tick breeding as 100% uptime, and weight for comparative uptime at target zone
	if (props.specialChallenge === 'trappa' || (props.specialChallenge === 'combat' && props.runningTrappa)) {
		// no breeding is the challenge.
		perks.Pheromones.efficiency = 0;
	} else {
		const breedSpeed = 1 + props.potency * (1 + perks.Pheromones.level * perks.Pheromones.effect);
		const breedUptime = 3 / Math.max(3, Math.log(2) / Math.log(breedSpeed));
		const breedSpeedNext = 1 + props.potency * (1 + (perks.Pheromones.level + 1) * perks.Pheromones.effect);
		const breedUptimeNext = 3.001 / Math.max(3, Math.log(2) / Math.log(breedSpeedNext));
		const breedGain = breedUptimeNext / breedUptime;
		perks.Pheromones.efficiency = getLogWeightedValue(props, perks, breedGain, 1, 1, 1, 1, 1) / getPerkCost('Pheromones', 1, false, perks);
	}

	// Power:
	//   attack gain
	perks.Power.efficiency = getLogWeightedValue(props, perks, powGain, 1, 1, 1, 1, 1) / powCost;

	// Prismal:
	//   health gain from increased shielding
	let prismLayers = 1;
	let basePrismal = props.shieldPrismal + 100;
	if (props.scruffyLevel >= 1) basePrismal += 25;
	if (props.scruffyLevel >= 10) prismLayers = 2;
	if (props.scruffyLevel >= 16) prismLayers = 3;
	const prismHP = 1 + (basePrismal / 100 + perks.Prismal.level * perks.Prismal.effect) * prismLayers;
	const prismGain = (prismHP + perks.Prismal.effect * prismLayers) / prismHP;
	// hack for trappa final respec: prismal DOES matter even though raw health doesn't, so pretend it's attack
	perks.Prismal.efficiency = getLogWeightedValue(props, perks, props.specialChallenge === 'combat' && props.runningTrappa ? prismGain : 1, prismGain, 1, 1, 1, 1) / getPerkCost('Prismal', 1, false, perks);

	// Resilience:
	//   health gain (compounding)
	perks.Resilience.efficiency = getLogWeightedValue(props, perks, 1, perks.Resilience.effect, 1, 1, 1, 1) / getPerkCost('Resilience', 1, false, perks);

	// Tenacity:
	//   attack gain (compounding, pre-calculated into the effect field)
	perks.Tenacity.efficiency = getLogWeightedValue(props, perks, perks.Tenacity.effect, 1, 1, 1, 1, 1) / getPerkCost('Tenacity', 1, false, perks);

	// Toughness:
	//   health gain
	perks.Toughness.efficiency = getLogWeightedValue(props, perks, 1, toughGain, 1, 1, 1, 1) / toughCost;

	// Observation:
	//  See getObservationGains for more details on valuation.
	// NOTE we check for +1 and +2 levels, as +2 levels can be more efficient due to the extra free trinket drop.
	// Max possible gain is what you'd get from instantly trinket-capping the new Obs level, so upper bound by that.
	const [obsDirectGain, obsMoreTrinkets, obsMaxDirectGain] = getObservationGains(1, props, perks);
	perks.Observation.efficiency = Math.min(getLogWeightedValue(props, perks, obsDirectGain, obsDirectGain, 1, obsDirectGain, 1, 1, 1, obsMoreTrinkets, 1), obsMaxDirectGain < Infinity ? getLogWeightedValue(props, perks, obsMaxDirectGain, obsMaxDirectGain, 1, obsMaxDirectGain, 1, 1, 1, 0, 1) : Infinity) / getPerkCost('Observation', 1, false, perks);

	// No point checking for 2-level efficiency if we can't afford 2 levels.
	// (And more to the point, it breaks the way we flag the best perk if we give non-zero efficiency for the 2-level version....)
	if (couldBuyPerk('Observation', false, 2, props, perks)[0]) {
		const [obsDirectGain2, obsMoreTrinkets2, obsMaxDirectGain2] = getObservationGains(2, props, perks);
		perks.Observation.efficiency2 = Math.min(getLogWeightedValue(props, perks, obsDirectGain2, obsDirectGain2, 1, obsDirectGain2, 1, 1, 1, obsMoreTrinkets2, 2), obsMaxDirectGain2 < Infinity ? getLogWeightedValue(props, perks, obsMaxDirectGain2, obsMaxDirectGain2, 1, obsMaxDirectGain2, 1, 1, 1, 0, 2) : Infinity) / getPerkCost('Observation', 2, false, perks);
	} else {
		perks.Observation.efficiency2 = 0;
	}

	// Masterfulness:
	//   Simple: +1 greed +1 tenacity. The extremely harsh cost scaling means it's not very pointful to consider other than a default tenacity time.
	perks.Masterfulness.efficiency = getLogWeightedValue(props, perks, perks.Tenacity.effect, 1, 1, greedGain, greedGain, 1) / getPerkCost('Masterfulness', 1, false, perks);

	// Smithology
	//   Grow attack and health based on # of smithies (1.25x base, +0.01 per level in Smithology, raised to the # of smithies)
	const smithobase = 1 + 1 / (125 + perks.Smithology.level);
	const smithogain = Math.pow(smithobase, props.smithyCount);
	perks.Smithology.efficiency = getLogWeightedValue(props, perks, smithogain, smithogain, 1, 1, 1) / getPerkCost('Smithology', 1, false, perks);

	// Fuck it.
	// Agility: 5% atk, 5% hp, 5% resources, 5% radon per level. No this isn't accurate. No I don't care.
	perks.Agility.efficiency = getLogWeightedValue(props, perks, 1.05, 1.05, 1, 1.05, 1.05, 1) / getPerkCost('Agility', 1, false, perks);
	// Range: 1% atk per level. Not accurate, don't care.
	perks.Range.efficiency = getLogWeightedValue(props, perks, 1.01, 1, 1, 1, 1, 1) / getPerkCost('Range', 1, false, perks);
	// Hunger: 3% atk per level. Not accurate, don't care.
	perks.Hunger.efficiency = getLogWeightedValue(props, perks, 1.03, 1, 1, 1, 1, 1) / getPerkCost('Hunger', 1, false, perks);

	return [props, perks];
}

// zero out perk inputs and autobuy
function clearAndAutobuyPerks() {
	let [props, perks] = initialLoad();
	let continueBuying = true;
	//Run this if we don't have a respec available as we won't be able to clear perks
	if (!game.global.canRespecPerks) {
		autobuyPerks(props, perks);
		return;
	}

	if (props.perksRadon > 0) {
		const origCarp = game.portal.Carpentry.radLevel;
		const origExpand = game.portal.Expansion.radLevel;
		let carpWanted = 0;

		if (challengeActive('Downsize') && props.specialChallenge === 'combat') {
			//Impractical to know actual housing in downsize, just don't reduce Carp or Expansion level
			perks.Carpentry.level = origCarp;
			perks.Expansion.level = origExpand;
		} else if (props.specialChallenge === 'combat' || props.specialChallenge === 'combatRadon') {
			game.unlocks.impCount.Tauntimp = game.unlocks.impCount.Tauntimp;
			//Must have enough carp to sustain current coordination - or very conservatively for trappa, 10 more coords after final army send (should still be negligible radon spent on carp)
			const wantedArmySize = (props.runningTrappa ? Math.pow(1.25, 10) : 1) * game.resources.trimps.maxSoldiers;
			const tauntBase = 1.003 + 0.0001 * origExpand;
			const tauntMult = game.global.expandingTauntimp ? Math.pow(tauntBase, game.unlocks.impCount.Tauntimp) : 1;
			carpWanted = Math.max(0, Math.ceil(Math.log((2.4 * wantedArmySize) / (tauntMult * (game.resources.trimps.max * game.resources.trimps.maxMod * props.scaffMult))) / Math.log(1.1)));
		}
		//Setting this here since initial load clears variables and perk levels which is important for carp calculations
		[props, perks] = initialLoad(true);
		perks.Carpentry.level = carpWanted;
		// get correct available radon for cleared perks
		// for max carp, just max out carp!
		if (props.specialChallenge === 'trappacarp') {
			perks.Carpentry.level = 0;
			while (continueBuying) [continueBuying, props, perks] = buyPerk('Carpentry', 1, props, perks);
			props.radonSpent = getTotalPerksCost(perks);
			[props, perks] = getPerkEfficiencies(props, perks);
			allocateSurky(perks);
		} else {
			autobuyPerks(props, perks);
		}
	}
}

// autobuy from current input perk levels
function autobuyPerks(props, perks) {
	props = efficiencyFlag(props, perks);
	props.radonSpent = getTotalPerksCost(perks);
	[props, perks] = getPerkEfficiencies(props, perks);

	let continueBuying = true;
	// optimize Bait for Trappa
	perks.Bait.optimize = props.specialChallenge === 'trappa' || (props.specialChallenge === 'combat' && props.runningTrappa);
	perks.Pheromones.optimize = game.stats.highestRadLevel.valueTotal() >= 60 && props.specialChallenge !== 'trappa' && !(props.specialChallenge === 'combat' && props.runningTrappa);
	if (props.specialChallenge === 'trappa' || (props.specialChallenge === 'combat' && props.runningTrappa)) {
		const maxCarpLevels = Math.log((props.perksRadon / perks.Carpentry.priceBase) * (perks.Carpentry.priceFact - 1) + 1) / Math.log(perks.Carpentry.priceFact);
		props.trappaStartPop = 10 * Math.pow(1.1, maxCarpLevels) * props.scaffMult;
	}
	// optimize Trumps for Downsize
	perks.Trumps.optimize = props.specialChallenge === 'downsize';
	props = efficiencyFlag(props, perks);
	while (props.bestPerk !== '') {
		bestName = props.bestPerk;
		const bestObj = perks[bestName];
		const buy2 = bestObj.hasOwnProperty('efficiency2') && bestObj.efficiency2 > bestObj.efficiency;
		const perkResult = buyPerk(bestName, buy2 ? 2 : 1, props, perks);
		props = perkResult[1];
		perks = perkResult[2];
		props.radonSpent = getTotalPerksCost(perks);
		[props, perks] = getPerkEfficiencies(props, perks);
		props = efficiencyFlag(props, perks);
	}
	// use trumps as dump perk
	if (!(props.specialChallenge === 'combat') && !(props.specialChallenge === 'combatRadon')) {
		while (continueBuying) [continueBuying, props, perks] = buyPerk('Trumps', 1, props, perks);
	}
	continueBuying = true;
	// and Pheromones! (but not in Trappa, for minimum confusion, and not before Trappa unlock)
	if (props.specialChallenge !== 'trappa' && !(props.specialChallenge === 'combat' && props.runningTrappa)) {
		while (continueBuying) [continueBuying, props, perks] = buyPerk('Pheromones', 1, props, perks);
	}
	continueBuying = true;
	// secret setting to dump remaining Rn into bait for feeeeeee
	while (continueBuying) [continueBuying, props, perks] = buyPerk('Bait', 1, props, perks);

	allocateSurky(perks);
	console.log('Surky - Total Radon for perks: ' + prettify(props.perksRadon) + ', Total Radon Spent: ' + prettify(props.radonSpent), 'portal');
}
