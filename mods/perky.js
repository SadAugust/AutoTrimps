/* setup for non-AT users */
if (typeof atData === 'undefined') atData = {};

if (typeof $$ !== 'function') {
	$$ = function (a) {
		return document.querySelector(a);
	};
	$$$ = function (a) {
		return [].slice.apply(document.querySelectorAll(a));
	};
}

function masteryPurchased(name) {
	if (!game.talents[name]) throw `unknown mastery: ${name}`;
	return game.talents[name].purchased;
}

function legalizeInput(settingID) {
	if (!settingID) return;
	const element = document.getElementById(settingID);
	const { placeholder: defaultValue, min: minValue, max: maxValue } = element;

	let value = parseFloat(element.value);
	value = isNaN(value) ? defaultValue : value;
	value = minValue !== null && value < minValue ? minValue : value;
	value = maxValue !== null && value > maxValue ? maxValue : value;

	element.value = value;
}

function runPerky() {
	if (portalUniverse !== 1) return;
	allocatePerky();
}

function allocatePerky(showTooltips = true) {
	const xpDivStyle = document.querySelector('#weight-xpDiv').style;
	if (game.global.spiresCompleted >= 2 && xpDivStyle.display !== 'inline') xpDivStyle.display = 'inline';

	if (showTooltips) {
		const preset = $$('#preset').value;
		if (preset === 'trapper' && game.global.selectedChallenge !== 'Trapper' && !challengeActive('Trapper')) {
			tooltip('Trapper²', 'customText', 'lock', 'This preset is designed for the Trapper² challenge. Start a new run using “Trapper² (initial)” and try again.', false, `center`);
			return;
		}

		if (preset === 'spire') {
			tooltip('Spire Respec', 'customText', 'lock', 'This preset is meant to be used mid-run, when you’re done farming for the Spire.', false, `center`);
		}
	}

	const perks = optimize();
	for (let name in perks) perks[name] = perks[name].level;
	const perkString = LZString.compressToBase64(JSON.stringify(perks));

	tooltip('Import Perks', null, 'update');
	document.getElementById('perkImportBox').value = perkString;
	importPerks();
	cancelTooltip();
}

const Perk = /** @class */ (function () {
	function Perk(perkName, scaling, lockLevel = false) {
		const { priceBase, additive, additiveInc, max, specialGrowth, locked, level, levelTemp } = game.portal[perkName];
		const fixedLevel = level + (levelTemp ? levelTemp : 0);

		this.name = perkName;
		this.base_cost = priceBase;
		this.cost_increment = additive ? additiveInc : 0;
		this.scaling = scaling;
		this.max_level = lockLevel ? fixedLevel : max ? max : Infinity;
		this.cost_exponent = specialGrowth ? specialGrowth : 1.3;
		this.locked = locked;
		this.level = 0;
		this.min_level = lockLevel ? fixedLevel : !game.global.canRespecPerks || (game.global.viewingUpgrades && !game.global.respecActive) ? level : 0;
		this.cost = 0;
		this.gain = 0;
		this.bonus = 1;
		this.cost = this.base_cost;

		this.fixed = lockLevel;
		this.fixedLevel = fixedLevel;
		this.fixedCost = 0;

		if (lockLevel) {
			const spent = this.level_up(fixedLevel, true);
			this.fixedCost = spent;
			this.level_up(-fixedLevel, true);
			atData.autoPerks.fixedCost += spent;
		}
	}

	Perk.prototype.levellable = function (he_left) {
		return !this.locked && this.level < this.max_level && this.cost * Math.max(1, Math.floor(this.level / 1e12)) <= he_left;
	};

	Perk.prototype.level_up = function (amount, ignoreFixed = false) {
		this.level += amount;
		this.bonus = this.scaling(this.level);
		let spent = this.cost;

		if (this.cost_increment) {
			spent = amount * (this.cost + (this.cost_increment * (amount - 1)) / 2);
			this.cost += amount * this.cost_increment;
		} else {
			this.cost = Math.ceil(this.level / 2 + this.base_cost * Math.pow(this.cost_exponent, this.level));
		}

		if (this.fixed && !ignoreFixed) {
			atData.autoPerks.fixedCost += amount > 0 ? -spent : amount < 0 ? spent : 0;
		}

		return spent;
	};

	Perk.prototype.spent = function () {
		if (this.cost_increment) {
			return (this.level * (this.base_cost + this.cost - this.cost_increment)) / 2;
		}

		let total = 0;
		for (let x = 0; x < this.level; ++x) {
			total += Math.ceil(x / 2 + this.base_cost * Math.pow(this.cost_exponent, x));
		}

		return total;
	};

	Perk.prototype.log_ratio = function () {
		if (this.cost_increment) return (this.scaling(1) - this.scaling(0)) / this.bonus;
		return Math.log(this.scaling(this.level + 1) / this.bonus);
	};

	return Perk;
})();

function initPresetPerky() {
	const settingInputs = JSON.parse(localStorage.getItem('perkyInputs'));

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
		heliumWeight: +$$('#weight-he').value,
		attackWeight: +$$('#weight-atk').value,
		healthWeight: +$$('#weight-hp').value,
		xpWeight: +$$('#weight-xp').value,
		trimpsWeight: +$$('#weight-trimps').value,
		...presets,
		lockedPerks: settingInputs.lockedPerks || undefined
	};
}

function fillPresetPerky(specificPreset, forceDefault) {
	if (specificPreset) $$('#preset').value = specificPreset;

	const defaultWeights = {
		early: [5, 4, 3, 2.4],
		broken: [7, 3, 1, 2.2],
		mid: [16, 5, 1, 4.4],
		corruption: [25, 7, 1, 6.6],
		magma: [35, 4, 3, 8],
		z280: [42, 6, 1, 10],
		z400: [88, 10, 1, 20],
		z450: [500, 50, 1, 110],
		spire: [0, 1, 1, 0],
		nerfed: [0, 4, 3, 0],
		tent: [5, 4, 3, 0],
		scientist: [0, 1, 3, 0],
		carp: [0, 0, 0, 0],
		trapper: [0, 7, 1, 0],
		coord: [0, 40, 1, 0],
		trimp: [0, 99, 1, 0],
		metal: [0, 7, 1, 0],
		c2: [0, 7, 1, 1],
		income: [0, 0, 0, 0],
		unessenceted: [0, 1, 0, 0],
		nerfeder: [0, 1, 0, 0],
		experience: [1, 50, 1, 500]
	};

	const localData = initPresetPerky();
	const preset = $$('#preset').value;
	const weights = localData[preset] === null || localData[preset] === undefined || forceDefault ? defaultWeights[preset] : localData[preset];

	const ids = ['weight-he', 'weight-atk', 'weight-hp', 'weight-xp', 'weight-trimps'];
	ids.forEach((id, index) => {
		document.querySelector(`#${id}`).value = +weights[index] || 0;
	});

	savePerkySettings();
}

function savePerkySettings() {
	const saveData = initPresetPerky();
	const settingInputs = { preset: document.querySelector('#preset').value };
	settingInputs.lockedPerks = saveData.lockedPerks || undefined;

	atData.autoPerks.GUI.inputs.forEach((item) => {
		settingInputs[item] = document.querySelector(`#${item}`).value;
	});

	const presetNames = Array.from(document.querySelectorAll('#preset > *'));
	if (Object.keys(saveData).length !== 0) {
		for (let item of presetNames) {
			const value = item.value;
			if (value.includes('— ')) continue;
			if (settingInputs.preset === value) settingInputs[value] = [settingInputs['weight-he'], settingInputs['weight-atk'], settingInputs['weight-hp'], settingInputs['weight-xp'], settingInputs['weight-trimps']];
			else settingInputs[value] = saveData[value];
		}
	}

	localStorage.setItem('perkyInputs', JSON.stringify(settingInputs));
	if (typeof autoTrimpSettings !== 'undefined' && typeof autoTrimpSettings.ATversion !== 'undefined' && autoTrimpSettings.ATversion.includes('SadAugust')) {
		autoTrimpSettings['autoAllocatePresets'].value = JSON.stringify(settingInputs);
		saveSettings();
	}
}

function calculateDgPopGain() {
	const { Efficiency, Capacity, Supply, Overclocker } = game.generatorUpgrades;
	const { Storage, Slowburn } = game.permanentGeneratorUpgrades;

	const maxZone = game.stats.highestLevel.valueTotal() / 2 + 115;
	const efficiency = 5e8 + 5e7 * Efficiency.upgrades;
	const capacity = 3 + 0.4 * Capacity.upgrades;
	const maxFuel = Storage.owned ? capacity * 1.5 : capacity;
	const supply = 230 + 2 * Supply.upgrades;
	const overclock = Overclocker.upgrades && 1 - 0.5 * Math.pow(0.99, Overclocker.upgrades - 1);
	const burnRate = Slowburn.owned ? 0.4 : 0.5;
	const cells = masteryPurchased('magmaFlow') ? 18 : 16;
	const acceleration = masteryPurchased('quickGen') ? 1.03 : 1.02;
	const hyperspeed2 = masteryPurchased('hyperspeed2') ? game.stats.highestLevel.valueTotal() / 2 : 0;
	const blacksmith = 0.5 * masteryPurchased('blacksmith') + 0.25 * masteryPurchased('blacksmith2') + 0.15 * masteryPurchased('blacksmith3');
	const blacksmithTotal = blacksmith * game.stats.highestLevel.valueTotal();
	let housing = 0;
	let fuel = 0;
	let time = 0;

	for (let zone = 230; zone <= maxZone; ++zone) {
		fuel += cells * (0.01 * Math.min(zone, supply) - 2.1);
		const tickTime = Math.ceil(60 / Math.pow(acceleration, Math.floor((zone - 230) / 3)));
		time += zone > blacksmithTotal ? 28 : zone > hyperspeed2 ? 20 : 15;

		while (time >= tickTime) {
			time -= tickTime;
			housing += efficiency * Math.sqrt(Math.min(capacity, fuel));
			fuel = Math.max(0, fuel - burnRate);
		}

		while (fuel > maxFuel) {
			housing += overclock * efficiency * Math.sqrt(Math.min(capacity, fuel));
			fuel = Math.max(0, fuel - burnRate);
		}

		housing *= 1.009;
	}

	while (fuel >= burnRate) {
		housing += efficiency * Math.sqrt(Math.min(capacity, fuel));
		fuel = Math.max(0, fuel - burnRate);
	}

	return Math.floor(housing);
}

function populatePerkyData() {
	const zone = Math.min(+$$('#targetZone').value, getObsidianStart());
	const hze = game.stats.highestLevel.valueTotal();

	const spires = Math.min(Math.floor((zone - 101) / 100), game.global.spiresCompleted);
	const turkimpTimer = masteryPurchased('turkimp2') ? 1 : masteryPurchased('turkimp') ? 0.4 : 0.25;
	const cache = hze < 60 ? 0 : hze < 85 ? 7 : hze < 160 ? 10 : hze < 185 ? 14 : 20;
	let prod = 1 + turkimpTimer;
	let loot = 1 + 0.333 * turkimpTimer;
	loot *= hze < 100 ? 0.7 : 1 + (masteryPurchased('stillRowing') ? 0.3 : 0.2) * spires;

	let chronojest = 27 * game.unlocks.imps.Jestimp + 15 * game.unlocks.imps.Chronoimp;

	for (let mod of game.global.StaffEquipped.mods || []) {
		if (mod[0] === 'MinerSpeed') prod *= 1 + 0.01 * mod[1];
		else if (mod[0] === 'metalDrop') loot *= 1 + 0.01 * mod[1];
	}

	chronojest += (masteryPurchased('mapLoot2') ? 5 : 4) * cache;

	const preset = $$('#preset').value;
	const result = {
		total_he: countHeliumSpent(false, true) + game.global.heliumLeftover + (portalWindowOpen ? game.resources.helium.owned : 0),
		zone,
		perks: parse_perks(),
		weight: {
			helium: +$$('#weight-he').value,
			attack: +$$('#weight-atk').value,
			health: +$$('#weight-hp').value,
			xp: +$$('#weight-xp').value,
			trimps: +$$('#weight-trimps').value,
			income: 0
		},
		fluffy: {
			xp: game.global.fluffyExp,
			prestige: game.global.fluffyPrestige
		},
		mod: {
			storage: 0.125,
			soldiers: 0,
			dg: +calculateDgPopGain(),
			tent_city: preset === 'tent',
			whip: game.unlocks.imps.Whipimp,
			magn: game.unlocks.imps.Magnimp,
			taunt: game.unlocks.imps.Tauntimp,
			ven: game.unlocks.imps.Venimp,
			chronojest,
			prod,
			loot,
			breed_timer: masteryPurchased('patience') ? 45 : 30,
			army_mod: game.resources.trimps.maxMod
		}
	};

	if (preset === 'nerfed') {
		result.total_he = 1e8 - 1e4;
		result.zone = 200;
		result.mod.dg = 0;
	}

	if (preset === 'trapper') {
		result.mod.soldiers = game.resources.trimps.owned;
		result.mod.prod = 0;
		result.perks.Pheromones.max_level = 0;
		result.perks.Anticipation.max_level = 0;
	}

	if (preset === 'spire') {
		result.mod.prod = 0;
		result.mod.loot = 0;
		result.perks.Overkill.max_level = 0;
		result.zone = game.global.world;
	}

	if (preset === 'carp') {
		result.mod.prod = 0;
		result.mod.loot = 0;
		result.weight.trimps = 1e6;
	}

	if (preset === 'metal') result.mod.prod = 0;
	if (preset === 'trimp') result.mod.soldiers = 1;
	if (preset === 'nerfed') result.perks.Overkill.max_level = 1;
	if (preset === 'scientist') result.perks.Coordinated.max_level = 0;
	if (preset === 'income') result.weight = { income: 3, trimps: 3, attack: 1, helium: 0, health: 0, xp: 0 };

	if (preset === 'unessenceted') {
		result.total_he = 0;
		result.zone = 181;
	}

	if (preset === 'nerfeder') {
		result.total_he = 1e9 - 1e5;
		result.zone = 300;
	}

	return result;
}

function parse_perks() {
	const add = (x) => (level) => 1 + x * 0.01 * level;
	const mult = (x) => (level) => Math.pow(1 + x * 0.01, level);

	const perkData = {
		Looting_II: add(0.25),
		Carpentry_II: add(0.25),
		Motivation_II: add(1),
		Power_II: add(1),
		Toughness_II: add(1),
		Capable: () => 1,
		Cunning: add(25),
		Curious: add(160),
		Classy: mult(4.5678375),
		Overkill: add(500),
		Resourceful: mult(-5),
		Coordinated: mult(-2),
		Siphonology: (level) => Math.pow(1 + level, 0.1),
		Anticipation: add(6),
		Resilience: mult(10),
		Meditation: add(1),
		Relentlessness: (level) => 1 + 0.05 * level * (1 + 0.3 * level),
		Carpentry: mult(10),
		Artisanistry: mult(-5),
		Range: add(1),
		Agility: mult(-5),
		Bait: add(100),
		Trumps: add(20),
		Pheromones: add(10),
		Packrat: add(20),
		Motivation: add(5),
		Power: add(5),
		Toughness: add(5),
		Looting: add(5)
	};

	const perks = {};

	const calcNames = { 1: 'Perky', 2: 'Surky' };
	const calcName = calcNames[portalUniverse];
	let perkLocks = JSON.parse(localStorage.getItem(`${calcName.toLowerCase()}Inputs`));
	atData.autoPerks.fixedCost = 0;

	for (const [name, func] of Object.entries(perkData)) {
		perks[name] = new Perk(name, func, perkLocks.lockedPerks ? perkLocks.lockedPerks[name] : false);
	}

	return perks;
}

function optimize() {
	const params = populatePerkyData();
	const { total_he, zone, fluffy, perks, weight, mod } = params;

	const { Looting_II, Carpentry_II, Motivation_II, Power_II, Toughness_II, Capable, Cunning, Curious, Classy, Overkill, Resourceful, Coordinated, Siphonology, Anticipation, Resilience, Meditation, Relentlessness, Carpentry, Artisanistry, Range, Agility, Bait, Trumps, Pheromones, Packrat, Motivation, Power, Toughness, Looting } = perks;

	const impNames = ['whip', 'magn', 'taunt', 'ven'];
	impNames.forEach((name) => (mod[name] = Math.pow(1.003, zone * 99 * 0.03 * mod[name])));

	const books = Math.pow(1.25, zone) * Math.pow(zone > 100 ? 1.28 : 1.2, Math.max(zone - 59, 0));
	const gigas = Math.max(0, Math.min(zone - 60, zone / 2 - 25, zone / 3 - 12, zone / 5, zone / 10 + 17, 39));
	const base_housing = Math.pow(1.25, 5 + Math.min(zone / 2, 30) + gigas);
	const mystic = zone >= 25 ? Math.floor(Math.min(zone / 5, 9 + zone / 25, 15)) : 0;
	const tacular = (20 + zone - (zone % 5)) / 100;
	const base_income = 600 * mod.whip * books;
	const base_helium = Math.pow(zone - 19, 2);
	const max_tiers = zone / 5 + +((zone - 1) % 10 < 5);

	const exponents = {
		cost: Math.pow(1.069, 0.85 * (zone < 60 ? 57 : 53)),
		attack: Math.pow(1.19, 13),
		health: Math.pow(1.19, 14),
		block: Math.pow(1.19, 10)
	};

	const weightSum = weight.attack + weight.health;
	const equip_cost = {
		attack: (211 * weightSum) / weight.attack,
		health: (248 * weightSum) / weight.health,
		block: (5 * weightSum) / weight.health
	};

	let he_left = total_he;

	function ticks() {
		return 1 + +(Agility.bonus > 0.9) + Math.ceil(10 * Agility.bonus);
	}

	function moti() {
		return Motivation.bonus * Motivation_II.bonus * Meditation.bonus;
	}

	const looting = function () {
		return Looting.bonus * Looting_II.bonus;
	};

	function gem_income() {
		const drag = moti() * mod.whip;
		const loot = looting() * mod.magn * 0.75 * 0.8;
		const chronojest = (mod.chronojest * drag * loot) / 30;
		return drag + loot + chronojest;
	}

	const trimps = mod.tent_city
		? function () {
				const carp = Carpentry.bonus * Carpentry_II.bonus;
				const territory = Trumps.bonus;
				return 10 * (mod.taunt + territory * (mod.taunt - 1) * 111) * carp;
		  }
		: function () {
				const carp = Carpentry.bonus * Carpentry_II.bonus;
				const bonus = 3 + Math.log((base_housing * gem_income()) / Resourceful.bonus) / Math.log(1.4);
				const territory = Trumps.bonus * zone;
				return 10 * (base_housing * bonus + territory) * carp * mod.taunt + mod.dg * carp;
		  };

	function income(ignore_prod) {
		const storage = (mod.storage * Resourceful.bonus) / Packrat.bonus;
		const loot = (looting() * mod.magn) / ticks();
		const prod = ignore_prod ? 0 : moti() * mod.prod;
		const chronojest = mod.chronojest * 0.1 * prod * loot;
		return base_income * (prod + loot * mod.loot + chronojest) * (1 - storage) * trimps();
	}

	function equip(stat) {
		const cost = equip_cost[stat] * Artisanistry.bonus;
		let levels = 1.136;
		let tiers = Math.log(1 + income() / cost) / Math.log(exponents.cost);
		if (tiers > max_tiers + 0.45) {
			levels = Math.log(1 + Math.pow(exponents.cost, tiers - max_tiers) * 0.2) / Math.log(1.2);
			tiers = max_tiers;
		}
		return levels * Math.pow(exponents[stat], tiers);
	}

	/* Number of buildings of a given kind that can be built with the current income.
		cost: base cost of the buildings
		exp: cost increase for each new level of the building 
	*/
	function building(cost, exp) {
		cost *= 4 * Resourceful.bonus;
		return Math.log(1 + (income(true) * (exp - 1)) / cost) / Math.log(exp);
	}

	function magma() {
		return Math.max(zone - 229, 0);
	}

	function breed() {
		const nurseries = building(2e6, 1.06) / (1 + 0.1 * Math.min(magma(), 20));
		const potency = 0.0085 * (zone >= 60 ? 0.1 : 1) * Math.pow(1.1, Math.floor(zone / 5));
		return potency * Math.pow(1.01, nurseries) * Pheromones.bonus * mod.ven;
	}

	const group_size = [];
	for (let coord = 0; coord <= Math.log(1 + he_left / 5e5) / Math.log(1.3); ++coord) {
		const ratio_1 = 1 + 0.25 * Math.pow(0.98, coord);
		const available_coords = zone - 1 + (magma() ? 100 : 0);
		let result = 1;
		for (let i = 0; i < available_coords; ++i) result = Math.ceil(result * ratio_1);
		group_size[coord] = result;
	}

	function soldiers() {
		const ratio = 1 + 0.25 * Coordinated.bonus;
		let pop = (mod.soldiers || trimps()) / 3;
		if (game.global.viewingUpgrades) pop *= mod.army_mod;
		if (mod.soldiers > 1) pop += 36000 * Bait.bonus;
		const unbought_coords = Math.max(0, Math.log(group_size[Coordinated.level] / pop) / Math.log(ratio));
		return group_size[0] * Math.pow(1.25, -unbought_coords);
	}

	function gators() {
		if (zone < 230 || mod.soldiers > 1) return 0;
		const ooms = Math.log(trimps() / group_size[Coordinated.level]) / Math.log(10);
		return Math.max(0, (ooms - 7 + Math.floor((zone - 215) / 100)) / 3);
	}

	function attack() {
		const gatorCount = gators();
		let attack = (0.15 + equip('attack')) * Math.pow(0.8, magma());
		attack *= Power.bonus * Power_II.bonus * Relentlessness.bonus;
		attack *= Siphonology.bonus * Range.bonus * Anticipation.bonus;
		attack *= fluffy.attack[Capable.level];
		attack *= masteryPurchased('amalg') ? Math.pow(1.5, gatorCount) : 1 + 0.5 * gatorCount;
		return soldiers() * attack;
	}

	/* total survivability (accounts for health and block) */
	function health() {
		let health = (0.6 + equip('health')) * Math.pow(0.8, magma());
		health *= Toughness.bonus * Toughness_II.bonus * Resilience.bonus;
		/* block */
		const gyms = building(400, 1.185);
		const trainers = (gyms * Math.log(1.185) - Math.log(1 + gyms)) / Math.log(1.1) + 25 - mystic;
		let block = 0.04 * gyms * Math.pow(1 + mystic / 100, gyms) * (1 + tacular * trainers);
		/* target number of attacks to survive */
		let attacks = 60;
		const breedTimer = breed();
		const soldier = soldiers();
		if (zone < 70) {
			/* no geneticists */
			/* number of ticks needed to repopulate an army */
			const timer = Math.log(1 + (soldier * breedTimer) / Bait.bonus) / Math.log(1 + breedTimer);
			attacks = timer / ticks();
		} else {
			/* geneticists */
			const fighting = Math.min(group_size[Coordinated.level] / trimps(), 1 / 3);
			const target_speed = fighting > 1e-9 ? (Math.pow(0.5 / (0.5 - fighting), 0.1 / mod.breed_timer) - 1) * 10 : fighting / mod.breed_timer;
			const geneticists = Math.log(breedTimer / target_speed) / -Math.log(0.98);
			health *= Math.pow(1.01, geneticists);
			health *= Math.pow(1.332, gators());
		}
		health /= attacks;

		if (zone < 60) block += equip('block');
		else block = Math.min(block, 4 * health);
		return soldier * (block + health);
	}

	const xp = function () {
		return Cunning.bonus * Curious.bonus * Classy.bonus;
	};

	const agility = function () {
		return 1 / Agility.bonus;
	};

	const helium = function () {
		return base_helium * looting() + 45;
	};

	const overkill = function () {
		return Overkill.bonus;
	};

	const stats = { agility, helium, xp, attack, health, overkill, trimps, income };

	function score() {
		let result = 0;

		for (let i in weight) {
			if (!weight[i]) continue;
			const stat = stats[i]();
			if (!isFinite(stat)) throw Error(i + ' is ' + stat);
			result += weight[i] * Math.log(stat);
		}

		return result;
	}

	function recompute_marginal_efficiencies() {
		const baseline = score();

		for (let name in perks) {
			let perk = perks[name];
			if (perk.cost_increment || !perk.levellable(he_left)) continue;
			perk.level_up(1);
			perk.gain = score() - baseline;
			perk.level_up(-1);
		}

		const perkNames = ['Looting', 'Carpentry', 'Motivation', 'Power', 'Toughness'];
		for (let name of perkNames) {
			const perk = perks[name];
			let resetGain = false;

			if (perk.gain === 0) {
				perk.level_up(1);
				perk.gain = score() - baseline;
				perk.level_up(-1);
				resetGain = true;
			}

			const perkII = perks[`${name}_II`];
			perkII.gain = (perk.gain * perkII.log_ratio()) / perk.log_ratio();

			if (resetGain) {
				perk.gain = 0;
			}
		}
	}

	function solve_quadratic_equation(a, b, c) {
		const delta = b * b - 4 * a * c;
		return (-b + Math.sqrt(delta)) / (2 * a);
	}

	function spend_he(perk, budget) {
		perk.gain /= perk.log_ratio();

		if (perk.cost_increment) {
			const ratio_2 = (1 + perk.level) / (1000 + Looting_II.level + Carpentry_II.level + Motivation_II.level + Power_II.level + Toughness_II.level);
			budget *= 0.5 * Math.pow(ratio_2, 2);
			const x = solve_quadratic_equation(perk.cost_increment / 2, perk.cost - perk.cost_increment / 2, -budget);
			const levelsToBuy = Math.floor(Math.max(Math.min(x, perk.max_level - perk.level), 1, perk.level / 1e12));
			he_left -= perk.level_up(levelsToBuy);
		} else {
			budget = Math.pow(budget, 0.5);
			do he_left -= perk.level_up(1);
			while (perk.cost < budget && perk.level < perk.max_level);
		}

		perk.gain *= perk.log_ratio();
	}

	mod.loot *= 20.8;
	weight.agility = (weight.helium + weight.attack) / 2;
	weight.overkill = 0.25 * weight.attack * (2 - Math.pow(0.9, weight.helium / weight.attack));

	if (zone > 90 && mod.soldiers <= 1 && Bait.min_level === 0) {
		Bait.max_level = 0;
	}

	if (game.portal.Carpentry.locked) {
		Bait.min_level = 1;
		if ($$('#preset').value !== 'trapper') Pheromones.min_level = 1;
	}

	if (game.global.viewingUpgrades) {
		Coordinated.min_level = game.portal.Coordinated.level;
	}

	fluffy.attack = [];
	const potential = Math.log((0.003 * fluffy.xp) / Math.pow(5, fluffy.prestige) + 1) / Math.log(4);
	for (let cap = 0; cap <= 10; ++cap) {
		const level = Math.min(Math.floor(potential), cap);
		const progress = level === cap ? 0 : (Math.pow(4, potential - level) - 1) / 3;
		fluffy.attack[cap] = 1 + Math.pow(5, fluffy.prestige) * 0.1 * (level / 2 + progress) * (level + 1);
	}

	for (let name in perks) {
		const perk = perks[name];
		if (perk.cost_increment) he_left -= perk.level_up(perk.min_level);
		else while (perk.level < perk.min_level) he_left -= perk.level_up(1);
	}

	let ratio = 0.25;
	while (Capable.levellable(he_left * ratio)) {
		he_left -= Capable.level_up(1);
		ratio = Capable.level <= Math.floor(potential) && zone > 300 && weight.xp > 0 ? 0.25 : 0.01;
	}

	if (zone <= 300 || potential >= Capable.level) weight.xp = 0;

	/* main loop */
	const sorted_perks = Object.keys(perks)
		.map(function (name) {
			return perks[name];
		})
		.filter(function (perk) {
			return perk.levellable(he_left);
		});

	const reference_he = he_left;
	for (let x = 0.999; x > 1e-12; x *= x) {
		const he_target = reference_he * x;
		recompute_marginal_efficiencies();
		sorted_perks.sort(function (a, b) {
			return b.gain / b.cost - a.gain / a.cost;
		});

		let brokenLoop = false;
		while (he_left > he_target && sorted_perks.length) {
			const best = sorted_perks.shift();
			if (!best.levellable(he_left)) continue;
			spend_he(best, he_left - he_target);

			let i = 0;
			while (sorted_perks[i] && sorted_perks[i].gain / sorted_perks[i].cost > best.gain / best.cost) {
				i++;
			}

			sorted_perks.splice(i, 0, best);
		}

		if (brokenLoop) {
			continue;
		}
	}

	if (he_left + 1 < total_he / 1e12 && Toughness_II.level > 0) {
		--Toughness_II.level;
		he_left += Toughness_II.cost;
	}

	return perks;
}

function toggleSettingInputProperty(propertyName, elemName) {
	const ratioBtn = document.getElementById(elemName);
	const className = ['settingBtnfalse', 'settingBtntrue'];
	className.splice(className.indexOf(ratioBtn.className.split(' ')[2]), 1);
	ratioBtn.setAttribute('class', 'btn settingsBtn ' + className[0]);

	const settingName = portalUniverse === 1 ? 'perky' : 'surky';
	const settingInputs = JSON.parse(localStorage.getItem(`${settingName}Inputs`));

	settingInputs[propertyName] = !settingInputs[propertyName];
	localStorage.setItem(`${settingName}Inputs`, JSON.stringify(settingInputs));
}

function updateInputFields() {
	const settingName = portalUniverse === 1 ? 'perky' : 'surky';
	const settingInputs = JSON.parse(localStorage.getItem(`${settingName}Inputs`));
	if (settingInputs && !settingInputs.updateInputs) return;
	const universe = game.global.universe;

	if (portalUniverse === 1) {
		const currentZone = Math.max(1, universe === 1 ? game.global.world : settingInputs.targetZone);
		settingInputs.targetZone = currentZone;
		$$('#targetZone').value = settingInputs.targetZone;
	}

	if (portalUniverse === 2) {
		const currentZone = Math.max(1, universe === 2 ? game.global.world : settingInputs.targetZone);
		settingInputs.targetZone = Math.max(currentZone, settingInputs.targetZone);
		$$('#targetZone').value = settingInputs.targetZone;

		const tributeCount = universe === 2 ? game.buildings.Tribute.owned : 0;
		settingInputs.tributes = Math.max(tributeCount, settingInputs.tributes);
		$$('#tributes').value = settingInputs.tributes;

		const metCount = universe === 2 ? game.jobs.Meteorologist.owned : 0;
		settingInputs.meteorologists = Math.max(metCount, settingInputs.meteorologists);
		$$('#meteorologists').value = settingInputs.meteorologists;

		const smithyCount = universe === 2 ? game.buildings.Smithy.owned : 0;
		settingInputs.smithyCount = Math.max(smithyCount, settingInputs.smithyCount);
		$$('#smithyCount').value = settingInputs.smithyCount;

		const rnPerRun = game.resources.radon.owned || 0;
		settingInputs.radonPerRun = Math.max(rnPerRun, settingInputs.radonPerRun);
		$$('#radonPerRun').value = settingInputs.radonPerRun;

		const housingCount = universe === 2 ? game.buildings.Collector.owned : 0;
		settingInputs.housingCount = Math.max(housingCount, settingInputs.housingCount);
		$$('#housingCount').value = settingInputs.housingCount;

		settingInputs.findPots = Math.max(game.resources.trimps.owned, settingInputs.findPots);
		$$('#findPots').value = settingInputs.findPots;
	}
}

function togglePerkLock(id, calcName) {
	let settingInputs = JSON.parse(localStorage.getItem(`${calcName.toLowerCase()}Inputs`));
	if (!settingInputs) return;

	if (!settingInputs['lockedPerks']) settingInputs['lockedPerks'] = {};
	if (!settingInputs['lockedPerks'][id]) settingInputs['lockedPerks'][id] = false;

	settingInputs['lockedPerks'][id] = !settingInputs['lockedPerks'][id];
	localStorage.setItem(`${calcName.toLowerCase()}Inputs`, JSON.stringify(settingInputs));
	document.getElementById(`lock${id}`).classList = `icomoon ${settingInputs['lockedPerks'][id] ? 'icon-locked' : 'icon-unlocked'}`;
}

function _setSelect2PerkyDropdowns() {
	if (typeof $ === 'undefined' || typeof $.fn.select2 === 'undefined') {
		setTimeout(_setSelect2PerkyDropdowns, 100);
		return;
	}

	$(document).ready(function () {
		$('.select2Perky').select2({
			templateSelection: _setSelect2PerkyPrefix,
			escapeMarkup: function (m) {
				return m;
			},
			templateResult: function (data) {
				if ($(data.element).data('hidden')) {
					return null;
				}
				if ($(data.element).data('visible')) {
					const $result = $('<span>').text(data.text).css({
						'text-align': 'left',
						display: 'block'
					});
					return $result;
				}

				return data.text;
			}
		});

		$('.select2Perky').each(function () {
			const $select = $(this);
			const $container = $select.next('.select2-container');
			$container.css({
				'margin-bottom': '0vw',
				'min-height': '1.5vw'
			});
		});
	});

	const presetElem = document.getElementById('preset');
	if (!presetElem || !presetElem.classList.contains('select2-hidden-accessible')) {
		setTimeout(_setSelect2PerkyDropdowns, 100);
		return;
	}
}

function _setSelect2PerkyPrefix(dropdownSetting) {
	const prefixName = 'Preset:';
	const text = dropdownSetting.text;

	return `<font color='#888'>${prefixName}</font> <float='right'>${text}</float>`;
}

atData.autoPerks = {
	createInput: function (perkLine, id, inputObj, savedValue, settingName) {
		if (!id || document.getElementById(`${id}Div`) !== null) {
			console.log("You most likely have a setup error in your inputBoxes. It will be trying to access a input box that doesn't exist.");
			return;
		}

		const onchange = `legalizeInput(this.id); save${settingName}Settings();`;

		const perkDiv = document.createElement('DIV');
		perkDiv.id = `${id}Div`;
		perkDiv.style.display = 'flex';
		perkDiv.style.alignItems = 'center';

		const inputBoxSpan = document.createElement('span');
		inputBoxSpan.className = 'textbox';
		inputBoxSpan.onmouseover = () => tooltip(inputObj.name, 'customText', event, inputObj.description);
		inputBoxSpan.onmouseout = () => tooltip('hide');
		inputBoxSpan.style.cssText = `text-align: left; height: 1.5vw;`;

		const prefixText = document.createElement('span');
		prefixText.id = `${id}Prefix`;
		prefixText.textContent = `${inputObj.name}: `;

		const perkInput = document.createElement('input');
		perkInput.type = 'number';
		perkInput.id = id;
		perkInput.value = savedValue || inputObj.defaultValue;
		perkInput.min = inputObj.minValue;
		perkInput.max = inputObj.maxValue;
		perkInput.placeholder = inputObj.defaultValue;
		perkInput.setAttribute('onchange', onchange);
		perkInput.style.cssText = `color: white;`;

		inputBoxSpan.addEventListener('click', () => {
			perkInput.focus();
		});

		inputBoxSpan.appendChild(prefixText);
		inputBoxSpan.appendChild(perkInput);
		perkDiv.appendChild(inputBoxSpan);
		perkLine.appendChild(perkDiv);

		requestAnimationFrame(() => {
			const prefixWidth = prefixText.offsetWidth;
			const perkDivWidth = perkDiv.offsetWidth;
			const prefixPercentage = (prefixWidth / perkDivWidth) * 100;
			const inputPercentage = 100 - prefixPercentage - 6.5;
			perkInput.style.width = `${inputPercentage}%`;
		});
	},

	removeGUI: function () {
		Object.keys(atData.autoPerks.GUI).forEach((key) => {
			const elem = atData.autoPerks.GUI[key];
			if (elem && elem.parentNode) {
				elem.parentNode.removeChild(elem);
				delete atData.autoPerks.GUI[key];
			}
		});
	},

	displayGUI: function (universe = portalUniverse, forceRefresh = false) {
		if (portalUniverse === -1) universe = portalUniverse = game.global.universe;

		const calcNames = { 1: 'Perky', 2: 'Surky' };
		const calcName = calcNames[universe] || universe;
		const presets = atData.autoPerks[`presets${calcName}`];

		const targetZoneElem = document.getElementById('targetZone');
		if (atData.autoPerks.loaded === calcName && targetZoneElem) {
			const widthValue = parseFloat(targetZoneElem.style.width);
			if (isNaN(widthValue) || widthValue > 85) {
				forceRefresh = true;
			}
		}

		if (game.global.viewingUpgrades || portalWindowOpen) {
			let $portalUpgradesHere = document.getElementById('portalUpgradesHere');

			if ($portalUpgradesHere) {
				const lockPerksText = 'When locked the current perk levels are not changed when you allocate perks.';
				const perkLocks = JSON.parse(localStorage.getItem(`${calcName.toLowerCase()}Inputs`));
				const $perkIcons = $portalUpgradesHere.children;

				for (let i = 0; i < $perkIcons.length; i++) {
					const $perkIcon = $perkIcons[i];
					if ($perkIcon.id === 'equalityScaling') continue;

					const tempDiv = document.createElement('div');
					tempDiv.id = `lock${$perkIcon.id}`;
					if (document.getElementById(tempDiv.id)) continue;

					$perkIcon.style.position = 'relative';
					const iconOffsetRight = game.options.menu.detailedPerks.enabled ? 5.3 : 7;
					const iconOffsetBottom = game.options.menu.detailedPerks.enabled ? 11 : 5;
					const iconScale = game.options.menu.detailedPerks.enabled ? 1.05 : 0.65;
					tempDiv.style = `display: block; position: absolute; bottom: ${iconOffsetBottom}px; right: ${iconOffsetRight}px; width: 10%; background: none; transform: scale(${iconScale});`;
					tempDiv.classList = `icomoon ${perkLocks && perkLocks['lockedPerks'] && perkLocks['lockedPerks'][$perkIcon.id] ? 'icon-locked' : 'icon-unlocked'}`;

					tempDiv.addEventListener('click', (event) => {
						event.stopPropagation();
						togglePerkLock($perkIcon.id, calcName);
					});

					tempDiv.addEventListener('mouseover', (event) => {
						event.stopPropagation();
						tooltip('Lock Perk', 'customText', event, lockPerksText);
					});
					tempDiv.setAttribute('onmouseout', 'tooltip("hide")');

					$perkIcon.insertBefore(tempDiv, $perkIcon.firstChild);
				}
			}
		}

		function createOption(value, text, title, disabled = false, require = false, visible = false) {
			const option = document.createElement('option');
			option.value = value;
			option.textContent = text;
			option.title = title;
			if (!visible && !disabled) option.setAttribute('data-hidden', 'true');
			if (visible && !require) option.setAttribute('data-visible', 'true');
			option.disabled = disabled || (visible && !require);
			return option;
		}

		function addSection(selectElement, sectionTitle, presets) {
			const sectionTitleOption = createOption('', sectionTitle, '', true, false, false);
			selectElement.appendChild(sectionTitleOption);

			let x = 0;
			for (let item in presets) {
				const preset = presets[item];
				const visible = typeof preset.visible === 'function' ? preset.visible() : true;
				const require = typeof preset.require === 'function' ? preset.require() : true;
				selectElement.appendChild(createOption(item, preset.name, preset.description, false, require, visible));
				if (visible) x++;
			}

			if (x === 0) selectElement.removeChild(sectionTitleOption);
		}

		function compareAttributes(attributes1, attributes2) {
			const filterAttributes = (attributes) =>
				Array.from(attributes)
					.filter((attr) => attr.name !== 'data-select2-id')
					.reduce((acc, attr) => {
						acc[attr.name] = attr.value;
						return acc;
					}, {});

			const attrs1 = filterAttributes(attributes1);
			const attrs2 = filterAttributes(attributes2);

			const keys1 = Object.keys(attrs1);
			const keys2 = Object.keys(attrs2);

			if (keys1.length !== keys2.length) {
				return false;
			}

			return keys1.every((key) => attrs1[key] === attrs2[key]);
		}

		function compareSelectOptions(select1, select2) {
			return Array.from(select1.options).every((option1, index) => {
				const option2 = select2.options[index];
				return option1.value === option2.value && option1.text === option2.text && compareAttributes(option1.attributes, option2.attributes);
			});
		}

		const selectElement = document.createElement('select');
		selectElement.id = 'preset';
		selectElement.onchange = () => window[`fillPreset${calcName}`]();
		selectElement.classList.add('select2Perky');
		selectElement.style.cssText = `text-align: center; font-weight: lighter; color: white;`;

		addSection(selectElement, 'Zone Progression', presets.regular);
		addSection(selectElement, 'Challenge Presets', presets.challenges);
		addSection(selectElement, 'Special Purpose Presets', presets.special);
		if (calcName === 'Perky') addSection(selectElement, 'Feat Presets', presets.feats);

		/* compare current state of the preset dropdown and refresh UI if it doesn't match */
		/* used to update challenges that are now visible or clickable */
		if (!forceRefresh && atData.autoPerks.GUI && atData.autoPerks.GUI && atData.autoPerks.GUI.$preset && !compareSelectOptions(selectElement, atData.autoPerks.GUI.$preset)) {
			forceRefresh = true;
		}

		if (!forceRefresh && atData.autoPerks.loaded === calcName) return;

		const inputBoxes = atData.autoPerks[`inputBoxes${calcName}`];
		let settingInputs = JSON.parse(localStorage.getItem(`${calcName.toLowerCase()}Inputs`));
		/* as a safety measure we should remove the GUI if it already exists. */
		if (atData.autoPerks.GUI && Object.keys(atData.autoPerks.GUI).length !== 0) atData.autoPerks.removeGUI();

		atData.autoPerks.GUI = {};
		atData.autoPerks.GUI.inputs = [];
		atData.autoPerks.loaded = calcName;
		const apGUI = atData.autoPerks.GUI;
		apGUI.$ratiosLine = {};

		/* auto Allocate button */
		let allocateText = 'Clears all perks and buys optimal levels in each perk.';
		allocateText += '<br>';
		allocateText += 'When in the <b>View Perks</b> window it will only use your respec if you press the <b>Respec</b> button.';
		if (calcName === 'Surky') allocateText = '<br>Sets your target zone, tribute, meteorologist, collector & smithy values to your current run values if they are higher than your inputs.<br><br>' + allocateText;

		apGUI.$allocatorBtn = document.createElement('DIV');
		apGUI.$allocatorBtn.id = 'allocatorBtn';
		apGUI.$allocatorBtn.setAttribute('class', 'btn inPortalBtn settingsBtn settingBtntrue');
		apGUI.$allocatorBtn.setAttribute('onclick', 'run' + calcName + '()');
		apGUI.$allocatorBtn.setAttribute('onmouseover', `tooltip("Auto Allocate", "customText", event, \`${allocateText}\`)`);
		apGUI.$allocatorBtn.setAttribute('onmouseout', 'tooltip("hide")');
		apGUI.$allocatorBtn.textContent = 'Allocate Perks';

		/* preset dropdown */
		apGUI.$presetDiv = document.createElement('DIV');
		apGUI.$presetDiv.id = 'presetDiv';
		apGUI.$presetDiv.style.cssText = 'display: flex; width: align-items: center; calc(100vw/34);';
		apGUI.$preset = selectElement;
		apGUI.$presetDiv.appendChild(apGUI.$preset);

		const $buttonbar = document.getElementById('portalBtnContainer');
		if (!document.getElementById(apGUI.$allocatorBtn.id)) $buttonbar.appendChild(apGUI.$allocatorBtn);
		$buttonbar.setAttribute('style', 'margin-bottom: 0.3vw;');
		apGUI.$customRatios = document.createElement('DIV');
		apGUI.$customRatios.id = 'customRatios';

		for (let x = 0; x < Object.keys(inputBoxes).length; x++) {
			let row = Object.keys(inputBoxes)[x];
			apGUI.$ratiosLine[row] = document.createElement('DIV');
			apGUI.$ratiosLine[row].setAttribute('id', `customRatios${x}`);
			apGUI.$ratiosLine[row].classList.add('customRatios');
			if (x !== 0) apGUI.$ratiosLine[row].style.marginLeft = '0.35vw';
			apGUI.$ratiosLine[row].style.marginLeft = x !== 0 ? '0.35vw' : '0vw';
			const inputContainer = document.createElement('div');
			inputContainer.classList.add('customRatiosContainer');

			for (let item in inputBoxes[row]) {
				atData.autoPerks.createInput(inputContainer, item, inputBoxes[row][item], settingInputs && settingInputs[item] !== null ? settingInputs[item] : 1, calcName);
				atData.autoPerks.GUI.inputs.push(item);
			}

			if (x === 0) inputContainer.appendChild(apGUI.$presetDiv);
			apGUI.$ratiosLine[row].appendChild(inputContainer);
			apGUI.$customRatios.appendChild(apGUI.$ratiosLine[row]);
		}

		apGUI.$ratiosLine[3] = document.createElement('DIV');
		apGUI.$ratiosLine[3].id = 'customRatios3';
		apGUI.$ratiosLine[3].classList.add('customRatios');
		apGUI.$ratiosLine[3].setAttribute('style', 'margin-left: 0vw; line-height: 1.5vw;');
		apGUI.$ratiosLine[3].setAttribute('id', `customRatios${3}`);
		apGUI.$customRatios.appendChild(apGUI.$ratiosLine[3]);
		let resetWeightsText = 'Clears your current input values for this preset and resets them to their default values.';

		apGUI.$resetWeightsBtn = document.createElement('DIV');
		apGUI.$resetWeightsBtn.id = 'resetWeightsBtn';
		apGUI.$resetWeightsBtn.setAttribute('class', 'noselect challengeThing thing settingBtnfalse');
		apGUI.$resetWeightsBtn.setAttribute('onclick', `importExportTooltip("resetPerkPreset", "${calcName}");`);
		apGUI.$resetWeightsBtn.setAttribute('onmouseover', `tooltip("Reset Preset Weights", "customText", event, \`${resetWeightsText}\`)`);
		apGUI.$resetWeightsBtn.setAttribute('onmouseout', 'tooltip("hide")');
		apGUI.$resetWeightsBtn.style.cssText = `height: 1.5vw; font-size: 0.8vw; width: 13.7vw; ${game.options.menu.darkTheme.enabled !== 2 ? 'color: black;' : ''}  vertical-align: middle; line-height: 1.3vw;`;
		apGUI.$resetWeightsBtn.textContent = 'Reset Preset Weights';
		if (document.getElementById(apGUI.$resetWeightsBtn.id) === null) apGUI.$ratiosLine[3].appendChild(apGUI.$resetWeightsBtn);

		let $portalWrapper = document.getElementById('portalWrapper');
		$portalWrapper.appendChild(apGUI.$customRatios);

		if (calcName === 'Perky') {
			if (!settingInputs) {
				document.querySelector('#targetZone').value = Math.max(20, game.stats.highestVoidMap.valueTotal || game.global.highestLevelCleared);
				let presetToUse;
				Array.from(document.querySelectorAll('#preset > *')).forEach((option) => {
					if (parseInt(option.innerHTML.toLowerCase().replace(/[z+]/g, '').split('-')[0]) < game.global.highestLevelCleared) {
						presetToUse = option.value;
					}
				});

				fillPresetPerky(presetToUse);
				settingInputs = JSON.parse(localStorage.getItem(`${calcName.toLowerCase()}Inputs`));
			}
			document.querySelector('#preset').value = settingInputs.preset;
			if (game.global.spiresCompleted < 2) document.querySelector('#weight-xpDiv').style.display = 'none';
		} else if (calcName === 'Surky') {
			if (!settingInputs) {
				saveSurkySettings(true);
				fillPresetSurky('ezfarm', true);
				settingInputs = JSON.parse(localStorage.getItem(calcName.toLowerCase() + 'Inputs'));
			}

			const preset = settingInputs.preset || 'ezfarm';
			document.querySelector('#preset').value = preset;
			document.querySelector('#radonPerRunDiv').style.display = 'none';
			document.querySelector('#findPotsDiv').style.display = preset === 'alchemy' ? 'inline' : 'none';
			document.querySelector('#trapHrsDiv').style.display = preset === 'trappa' ? 'inline' : 'none';

			apGUI.$goldenUpgradeBtn = document.createElement('DIV');
			apGUI.$goldenUpgradeBtn.id = 'showGoldenUpgradesBtn';
			const settingBtnClass = settingInputs.showGU ? 'settingBtntrue' : 'settingBtnfalse';
			apGUI.$goldenUpgradeBtn.setAttribute('class', `btn settingsBtn ${settingBtnClass}`);
			apGUI.$goldenUpgradeBtn.setAttribute('onclick', 'toggleSettingInputProperty("showGU", "showGoldenUpgradesBtn")');
			apGUI.$goldenUpgradeBtn.setAttribute('onmouseover', 'tooltip("Recommend Golden Upgrades", "customText", event, "When enabled will display the recommended golden upgrade path to take on your run when you allocate perks.")');
			apGUI.$goldenUpgradeBtn.setAttribute('onmouseout', 'tooltip("hide")');
			apGUI.$goldenUpgradeBtn.style.cssText = `height: 1.5vw; font-size: 0.8vw; width: 13.7vw; ${game.options.menu.darkTheme.enabled !== 2 ? 'color: black;' : ''} vertical-align: middle; line-height: 1.3vw; margin-left: 0.5vw; border: 0.1vw solid #777; border-radius: 0px; padding: 0px`;
			apGUI.$goldenUpgradeBtn.textContent = 'Recommend Golden Upgrades';
			if (document.getElementById(apGUI.$goldenUpgradeBtn.id) === null) apGUI.$ratiosLine[3].appendChild(apGUI.$goldenUpgradeBtn);
			initialLoad();
		}

		apGUI.$updateInputsBtn = document.createElement('DIV');
		apGUI.$updateInputsBtn.id = 'updateInputsBtn';
		const settingBtnClass = settingInputs.updateInputs ? 'settingBtntrue' : 'settingBtnfalse';
		apGUI.$updateInputsBtn.setAttribute('class', `btn settingsBtn ${settingBtnClass}`);
		apGUI.$updateInputsBtn.setAttribute('onclick', 'toggleSettingInputProperty("updateInputs", "updateInputsBtn")');
		apGUI.$updateInputsBtn.setAttribute('onmouseover', 'tooltip("Update Input Fields", "customText", event, "When enabled will update input fields with your current runs data when you open the perks or portal window.")');
		apGUI.$updateInputsBtn.setAttribute('onmouseout', 'tooltip("hide")');
		apGUI.$updateInputsBtn.style.cssText = `height: 1.5vw; font-size: 0.8vw; width: 13.7vw; ${game.options.menu.darkTheme.enabled !== 2 ? 'color: black;' : ''} vertical-align: middle; line-height: 1.3vw; margin-left: 0.5vw; border: 0.1vw solid #777; border-radius: 0px; padding: 0px`;
		apGUI.$updateInputsBtn.textContent = 'Update Input Fields';
		if (document.getElementById(apGUI.$updateInputsBtn.id) === null) apGUI.$ratiosLine[3].appendChild(apGUI.$updateInputsBtn);

		_setSelect2PerkyDropdowns();
	},

	presetsPerky: {
		regular: {
			early: {
				name: 'Z1-59',
				description: "Use this setting for the when you're progressing through the first 60 zones.",
				require: () => true,
				visible: () => true
			},
			broken: {
				name: 'Z60-99',
				description: 'Use this setting for zones 60-99.',
				require: () => getHighestLevelCleared(true) >= 59,
				visible: () => true
			},
			mid: {
				name: 'Z100-180',
				description: 'Use this setting for zones 100-180.',
				require: () => getHighestLevelCleared(true) >= 99,
				visible: () => getHighestLevelCleared(true) >= 59
			},
			corruption: {
				name: 'Z181-229',
				description: 'Use this setting for zones 181-229.',
				require: () => getHighestLevelCleared(true) >= 179,
				visible: () => getHighestLevelCleared(true) >= 99
			},
			magma: {
				name: 'Z230-280',
				description: 'Use this setting for zones 230-280.',
				require: () => getHighestLevelCleared(true) >= 229,
				visible: () => getHighestLevelCleared(true) >= 179
			},
			z280: {
				name: 'Z280-400',
				description: 'Use this setting for zones 280-400.',
				require: () => getHighestLevelCleared(true) >= 279,
				visible: () => getHighestLevelCleared(true) >= 229
			},
			z400: {
				name: 'Z400-450',
				description: 'Use this setting for zones 400-450.',
				require: () => getHighestLevelCleared(true) >= 399,
				visible: () => getHighestLevelCleared(true) >= 279
			},
			z450: {
				name: 'Z450+',
				description: 'Use this setting for zones 450+.',
				require: () => getHighestLevelCleared(true) >= 449,
				visible: () => getHighestLevelCleared(true) >= 399
			}
		},
		challenges: {
			metal: {
				name: 'Metal²',
				description: 'Use this setting to respec for the Metal² challenge.',
				require: () => getHighestLevelCleared(true) >= 24,
				visible: () => true
			},
			scientist: {
				name: 'Scientist',
				description: 'Use this setting to respec for the Scientist challenge.',
				require: () => getHighestLevelCleared(true) >= 39,
				visible: () => getHighestLevelCleared(true) >= 34
			},
			trimp: {
				name: 'Trimp²',
				description: 'Use this setting to respec for the Trimp² challenge.',
				require: () => getHighestLevelCleared(true) >= 59,
				visible: () => getHighestLevelCleared(true) >= 54
			},
			carp: {
				name: 'Trapper² (initial)',
				description: 'Use this setting to respec for the Trapper² challenge.',
				require: () => getHighestLevelCleared(true) >= 69,
				visible: () => getHighestLevelCleared(true) >= 59
			},
			trapper: {
				name: 'Trapper² (respec)',
				description: 'Use this setting to respec for the Trapper² challenge.',
				require: () => getHighestLevelCleared(true) >= 69,
				visible: () => getHighestLevelCleared(true) >= 59
			},
			coord: {
				name: 'Coordinate²',
				description: 'Use this setting to respec for the Coordinate² challenge.',
				require: () => getHighestLevelCleared(true) >= 119,
				visible: () => getHighestLevelCleared(true) >= 114
			},
			experience: {
				name: 'Experience',
				description: 'Use this setting to respec for the Experience challenge.',
				require: () => getHighestLevelCleared(true) >= 599,
				visible: () => getHighestLevelCleared(true) >= 459
			},
			c2: {
				name: 'Other c²',
				description: 'Use this setting to respec for the other c² challenges.',
				require: () => getHighestLevelCleared(true) >= 64,
				visible: () => getHighestLevelCleared(true) >= 59
			}
		},
		special: {
			spire: {
				name: 'Spire respec',
				description: 'Use this setting to respec for the Spire.',
				require: () => getHighestLevelCleared(true) >= 199,
				visible: () => getHighestLevelCleared(true) >= 169
			},
			income: {
				name: 'Income',
				description: 'Use this setting to respec for Income.',
				require: () => getHighestLevelCleared(true) >= 199,
				visible: () => getHighestLevelCleared(true) >= 169
			}
		},
		feats: {
			tent: {
				name: 'Tent City',
				description: 'Use this setting to respec for the Tent City feat.',
				require: () => getHighestLevelCleared(true) >= 74,
				visible: () => getHighestLevelCleared(true) >= 74
			},
			nerfed: {
				name: 'Nerfed',
				description: 'Use this setting to respec for the Nerfed feat.',
				require: () => getHighestLevelCleared(true) >= 199,
				visible: () => getHighestLevelCleared(true) >= 199
			},
			nerfeder: {
				name: 'Nerfeder',
				description: 'Use this setting to respec for the Nerfeder feat.',
				require: () => getHighestLevelCleared(true) >= 299,
				visible: () => getHighestLevelCleared(true) >= 299
			},
			unessenceted: {
				name: 'Unessenceted',
				description: 'Use this setting to respec for the Unessenceted feat.',
				require: () => getHighestLevelCleared(true) >= 179,
				visible: () => getHighestLevelCleared(true) >= 179
			}
		}
	},
	inputBoxesPerky: {
		row1: {
			'weight-he': {
				name: 'Helium Weight',
				description: 'Weight for how much you value 1% more helium .',
				minValue: 0,
				maxValue: null,
				defaultValue: 1
			},
			'weight-atk': {
				name: 'Attack Weight',
				description: 'Weight for how much you value 1% more attack.',
				minValue: 0,
				maxValue: null,
				defaultValue: 1
			},
			'weight-hp': {
				name: 'Health Weight',
				description: 'Weight for how much you value 1% more health.',
				minValue: 0,
				maxValue: null,
				defaultValue: 1
			}
		},
		row2: {
			targetZone: {
				name: 'Target Zone',
				description: 'Target last zone to clear. Always use your final cleared zone for the current challenge (afterpush zone for radon challenges, xx9 for c^3s, 100 for Mayhem, etc).',
				minValue: 1,
				maxValue: null,
				defaultValue: game.global.highestLevelCleared || 1
			},
			'weight-xp': {
				name: 'Fluffy Weight',
				description: 'Weight for how much you value 1% more Fluffy xp.',
				minValue: 0,
				maxValue: null,
				defaultValue: 1
			},
			'weight-trimps': {
				name: 'Population Weight',
				description: 'How much you value +1% population.<br><b>WARNING</b>: the effects of population on attack/health are already counted.<br>Default value is <b>0</b>.',
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			}
		}
	},
	presetsSurky: {
		regular: {
			ezfarm: {
				name: 'Easy Radon Challenge',
				description: 'Use if you can easily complete your radon challenge quickly at the minimum requirements with no golden battle. Pushing perks will still be valued for gains to scruffy level 3 and other growth mechanisms.',
				require: () => true,
				visible: () => true
			},
			tufarm: {
				name: 'Difficult Radon Challenge',
				description: 'Use if you need some extra pushing power to complete your radon challenge, especially if you still want golden battle. This will almost always be the right setting when you first start a new radon challenge.'
			},
			push: {
				name: 'Push/C³/Mayhem',
				description: 'Use when doing any pushing runs. Aim is to maximise pushing power so should almost always be used with golden battle upgrades.'
			}
		},
		challenges: {
			downsize: {
				name: 'Downsize³',
				description: 'This setting optimizes for each housing building giving only 1 Trimp. coordLimited=1 is assumed as the minimum (but a larger value to overweight population will be respected).\nIf it has been set then this will use your Push/C^3/Mayhem preset weights when selected.',
				require: () => getHighestLevelCleared(true) >= 19,
				visible: () => getHighestLevelCleared(true) >= true
			},
			duel: {
				name: 'Duel³',
				description: "This setting optimizes for less than 100% CC in Duel. It's a very minor effect that only matters for Criticality so feel free to skip this setting if you like.\nIf it has been set then this will use your Push/C^3/Mayhem preset weights when selected.",
				require: () => getHighestLevelCleared(true) >= 44,
				visible: () => getHighestLevelCleared(true) >= 39
			},
			trappacarp: {
				name: 'Trappa Carp',
				description: 'Use this setting to max Carpentry when portalling into Trappa, if you can get enough starting population this way to be significant compared to how much you can trap.',
				require: () => getHighestLevelCleared(true) >= 49,
				visible: () => getHighestLevelCleared(true) >= 44
			},
			trappa: {
				name: 'Trappa³',
				description: "Be sure to enter an 'Hours of trapping' value below to help value Bait! Use this setting either when portalling into Trappa, or after portalling with the Max Carpentry setting. coordLimited=1 is assumed.",
				require: () => getHighestLevelCleared(true) >= 49,
				visible: () => getHighestLevelCleared(true) >= 44
			},
			berserk: {
				name: 'Berserk³',
				description: 'This setting will stop Frenzy being purchased.\nIf it has been set then this will use your Push/C^3/Mayhem preset weights when selected.',
				require: () => getHighestLevelCleared(true) >= 114,
				visible: () => getHighestLevelCleared(true) >= 109
			},
			alchemy: {
				name: 'Alchemy',
				description: "Use this setting to optimize for trinket drop rate with finding potions. If you won't buy finding potions or don't care about trinket drops you can use a basic preset instead.\nIf it has been set then this will use your Easy Radon Challenge preset weights when selected.",
				require: () => getHighestLevelCleared(true) >= 154,
				visible: () => getHighestLevelCleared(true) >= 134
			},
			smithless: {
				name: 'Smithless³',
				description: 'This setting will stop Smithology being purchased and make Smithies hold no value.\nIf it has been set then this will use your Push/C^3/Mayhem preset weights when selected.',
				require: () => getHighestLevelCleared(true) >= 199,
				visible: () => getHighestLevelCleared(true) >= 174
			}
		},
		special: {
			combat: {
				name: 'Combat Respec',
				description:
					"As a respec ONLY, optimize for maximum combat stats given current equipment and population. Radon weight is ignored, but atk / hp vs.equality weights are respected. Coord Limited value is ignored and instead uses your save to determine how much housing perk levels are needed to buy your current coord amount. If you are in Trappa, the optimization assumes you have sent your last army so that health perks won't be applied - DO NOT USE in Trappa until after you send your last army."
			},
			combatRadon: {
				name: 'Radon Combat Respec',
				description: "As a respec ONLY, optimize for maximum combat stats given current equipment and population. Coord Limited value is ignored and instead uses your save to determine how much housing perk levels are needed to buy your current coord amount. If you are in Trappa, the optimization assumes you have sent your last army so that health perks won't be applied - DO NOT USE in Trappa until after you send your last army."
			},
			equip: {
				name: 'Equipment farming',
				description: 'Optimize purely for equipment purchasing power, including zone progression to get more speedbooks. Useful as an initial spec to maximize prestiges that can be afforded before respeccing to Combat spec. All entered weights are ignored, but the Coord-limited setting is respected.'
			},

			resminus: {
				name: 'Resources (-maps)',
				description: 'Optimize for max resource gains from below world level maps. Only use this if you are farming maps below your current zone and care ONLY about total resource gains. All user entered weights are ignored in favor of resource gains. Pushing perks are still valued for increasing the level of map you can farm.'
			},
			resplus: {
				name: 'Resources (+maps)',
				description: 'Optimize for max resource gains from +maps. Only use this if you are farming maps above your current zone and care ONLY about total resource gains. All user entered weights are ignored in favor of resource gains. Pushing perks are still valued for increasing the level of map you can farm.'
			}
		}
	},
	inputBoxesSurky: {
		row1: {
			clearWeight: {
				name: 'Attack Weight',
				description: `<p>If you are farming and it's trivial to complete your radon challenge, set this to 0! It will still be valued for the effect of pushing power on radon gains (from Scruffy level 3, for example).</p>
				<p>Set above 0 if you need more pushing power to complete your current challenge in a reasonable amount of time.</p>
				<p>This is the weight for how much you value attack * health, which determines clear speed at less than max equality.</p>`,
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			},
			survivalWeight: {
				name: 'Health Weight',
				description: `<p>Weight placed on equality (and additional weight placed on health), for maximum survivability against high enemy attack at max equality.</p>
				<p>This helps determine how far you can push (perhaps very slowly) before you get stuck on fast enemies that can one-shot you every hit.</p>
				<p>This can be set to 0 and equality will still be used as a dump perk.</p>
				<p>If you need a little more equality than that, then small weights like 0.001 will still give a meaningful boost to Equality levels.</p>`,
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			},
			radonWeight: {
				name: 'Radon Weight',
				description: `<p>Weight for how much you value growth from radon (and trinkets).</p>
				<p>If you are purely farming and can easily complete your radon challenge, this is the only weight you need, other than a tiny bit of additional health/equality weight (like 0.0001) to get some equality.</p>`,
				minValue: 0,
				maxValue: null,
				defaultValue: 1
			}
		},
		row2: {
			targetZone: {
				name: 'Target Zone',
				description: `<p>Target last zone to clear.</p>
				<p>Always use your final cleared zone for the current challenge (afterpush zone for radon challenges, xx9 for c^3s, 100 for Mayhem, etc).</p>`,
				minValue: 1,
				maxValue: null,
				defaultValue: game.global.highestRadonLevelCleared || 20
			},
			coordLimited: {
				name: 'Coord Limited',
				description: `Enter '0' if you can easily buy all coords with your population.</p>
				<p>Enter '1' if you definitely can't buy all coords.</p>
				<p>Enter something in between if you only need a bit more population to buy all coords.</p>
				<p>You can also increase this value (even above 1) if you just want to weight population gain more highly for some reason.</p>`,
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			},
			weaponLevels: {
				name: 'Weapon Levels',
				description: '<p>Dagger levels purchased at target zone.</p>',
				minValue: 0,
				maxValue: null,
				defaultValue: 1
			},
			armorLevels: {
				name: 'Armor Levels',
				description: '<p>Boots levels purchased at target zone.</p>',
				minValue: 0,
				maxValue: null,
				defaultValue: 1
			}
		},
		row3: {
			tributes: {
				name: 'Tributes',
				description: '<p>Number of purchased tributes to consider for Greed.</p>',
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			},
			meteorologists: {
				name: 'Meteorologists',
				description: '<p>Number of meteorologists to optimize for. Affects the value of food gains.</p>',
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			},
			housingCount: {
				name: 'Collector count',
				description: `<p>How many collectors do you get in your runs? Affects the value of more resources for increasing population.</p>
				<p>If you don't have collectors unlocked you can enter 0.</p>`,
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			},
			smithyCount: {
				name: 'Smithies',
				description: '<p>How many Smithies do you get in your runs? Affects the value of Smithology.</p>',
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			},
			radonPerRun: {
				name: 'Radon per run',
				description: `<p>Typical Radon gains in a farming run.</p>
				<p>Needed for Observation (until your trinkets are capped).</p>
				<p>Can be extracted from your save if you paste a save from the end of a U2 farming run.</p>
				<p>Doesn't need to be exact but a pretty good estimate is recommended.</p>
				<p>Only used when Radon Weight is above 0.</p>`,
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			},
			trapHrs: {
				name: 'Hours of trapping',
				description: `<p>Roughly how many hours of trapping do you plan to do in this run? Affects the value of Bait.</p>
				<p>Decimal values like '0.5' and '3.7' are allowed.</p>
				<p>Entering '0' will place no value on Bait.`,
				minValue: 0,
				maxValue: null,
				defaultValue: 5
			},
			findPots: {
				name: 'Finding potions',
				description: `<p>How many finding potions will you buy? For simplicity we assume these are all purchased by zone 100.</p>`,
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			}
		}
	}
};

function perkCalcPreset() {
	return document.querySelector('#preset').value;
}

if (typeof originalSwapPortalUniverse !== 'function') {
	var originalSwapPortalUniverse = swapPortalUniverse;
	swapPortalUniverse = function () {
		originalSwapPortalUniverse(...arguments);
		atData.autoPerks.displayGUI();
		updateInputFields();
		_setSelect2PerkyDropdowns();
	};
}

if (typeof originalViewPortalUpgrades !== 'function') {
	var originalViewPortalUpgrades = viewPortalUpgrades;
	viewPortalUpgrades = function () {
		originalViewPortalUpgrades(...arguments);
		atData.autoPerks.displayGUI();
		updateInputFields();
		_setSelect2PerkyDropdowns();
	};
}

if (typeof originalPortalClicked !== 'function') {
	var originalPortalClicked = portalClicked;
	portalClicked = function () {
		originalPortalClicked(...arguments);
		atData.autoPerks.displayGUI();
		updateInputFields();
		_setSelect2PerkyDropdowns();
	};
}

if (typeof originalDisplayPortalUpgrades !== 'function') {
	var originalDisplayPortalUpgrades = displayPortalUpgrades;
	displayPortalUpgrades = function () {
		originalDisplayPortalUpgrades(...arguments);
		atData.autoPerks.displayGUI();
	};
}

/* If using standalone version then when load Surky and CSS files. */
if (typeof autoTrimpSettings === 'undefined' || (typeof autoTrimpSettings !== 'undefined' && typeof autoTrimpSettings.ATversion !== 'undefined' && !autoTrimpSettings.ATversion.includes('SadAugust'))) {
	function updateAdditionalInfo() {
		if (!usingRealTimeOffline) {
			const infoElem = document.getElementById('additionalInfo');
			const infoStatus = makeAdditionalInfo_Standalone();
			if (infoElem.innerHTML !== infoStatus) infoElem.innerHTML = infoStatus;
			infoElem.parentNode.setAttribute('onmouseover', makeAdditionalInfoTooltip_Standalone(true));
		}
	}

	(async function () {
		let basepathPerkCalc = 'https://sadaugust.github.io/AutoTrimps/';
		if (typeof localVersion !== 'undefined') basepathPerkCalc = 'https://localhost:8887/AutoTrimps_Local/';
		const mods = ['surky'];
		const modules = ['import-export', 'MAZ'];
		const css = ['https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', `${basepathPerkCalc}css/perky.css`];
		const scripts = ['https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js'];

		function loadModules(fileName, prefix = '', retries = 3) {
			return new Promise((resolve, reject) => {
				const script = document.createElement('script');
				script.src = `${basepathPerkCalc}${prefix}${fileName}.js`;
				script.id = `${fileName}_MODULE`;
				script.async = false;
				script.defer = true;

				script.addEventListener('load', () => {
					resolve();
				});

				script.addEventListener('error', () => {
					console.log(`Failed to load module: ${fileName} from path: ${prefix || ''}. Retries left: ${retries - 1}`);
					loadModules(fileName, prefix, retries - 1)
						.then(resolve)
						.catch(reject);
				});

				document.head.appendChild(script);
			});
		}

		function loadStylesheet(url, rel = 'stylesheet', type = 'text/css', retries = 3) {
			return new Promise((resolve, reject) => {
				if (retries < 1) {
					reject(`Failed to load stylesheet ${url} after 3 attempts`);
					return;
				}

				const link = document.createElement('link');
				link.href = url;
				link.rel = rel;
				link.type = type;

				link.onload = () => {
					resolve();
				};

				link.onerror = () => {
					console.log(`Failed to load stylesheet ${url}. Retries left: ${retries - 1}`);
					loadStylesheet(url, rel, type, retries - 1)
						.then(resolve)
						.catch(reject);
				};

				document.head.appendChild(link);
			});
		}

		function loadScript(url, type = 'text/javascript', retries = 3) {
			return new Promise((resolve, reject) => {
				if (retries < 1) {
					reject(`Failed to load script ${url} after 3 attempts`);
					return;
				}

				const script = document.createElement('script');
				script.src = url;
				script.type = type;

				script.onload = () => {
					resolve();
				};

				script.onerror = () => {
					console.log(`Failed to load script ${url}. Retries left: ${retries - 1}`);
					loadScript(url, type, retries - 1)
						.then(resolve)
						.catch(reject);
				};

				document.head.appendChild(script);
			});
		}

		try {
			const toLoad = [...mods, ...modules];

			for (const module of toLoad) {
				const path = mods.includes(module) ? 'mods/' : modules.includes(module) ? 'modules/' : '';
				await loadModules(module, path);
			}

			for (const script of css) {
				await loadStylesheet(script);
			}

			for (const script of scripts) {
				await loadScript(script);
			}

			atData.autoPerks.displayGUI();
			console.log('The surky & perky mods have finished loading.');
			message('The surky & perky mods have finished loading.', 'Loot');
		} catch (error) {
			console.error('Error loading script', error);
			message('Surky & Perky have failed to load. Refresh your page and try again.', 'Loot');
			tooltip('Failed to load Surky & Perky', 'customText', undefined, 'Surky & Perky have failed to load. Refresh your page and try again.');
			verticalCenterTooltip(true);
		}
	})();
}
