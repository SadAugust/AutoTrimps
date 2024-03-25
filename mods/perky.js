//Setup for non-AT users
if (typeof MODULES === 'undefined') MODULES = {};

if (typeof $$ !== 'function') {
	$$ = function (a) {
		return document.querySelector(a);
	};
	$$$ = function (a) {
		return [].slice.apply(document.querySelectorAll(a));
	};
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

function allocatePerky() {
	//Enable Fluffy xp input when it's not active.
	const xpDivStyle = document.querySelector('#weight-xpDiv').style;
	if (game.global.spiresCompleted >= 2 && xpDivStyle.display !== 'inline') xpDivStyle.display = 'inline';

	//Generate perk string
	const perks = optimize();
	for (let name in perks) perks[name] = perks[name].level;
	const perkString = LZString.compressToBase64(JSON.stringify(perks));

	//Bring up import window if it's not already up and import perk string.
	tooltip('Import Perks', null, 'update');
	document.getElementById('perkImportBox').value = perkString;
	importPerks();
	cancelTooltip();
}

function mastery(name) {
	if (!game.talents[name]) throw 'unknown mastery: ' + name;
	return game.talents[name].purchased;
}

var Perk = /** @class */ (function () {
	function Perk(perkName, scaling) {
		this.base_cost = game.portal[perkName].priceBase;
		this.cost_increment = game.portal[perkName].additive ? game.portal[perkName].additiveInc : 0;
		this.scaling = scaling;
		this.max_level = game.portal[perkName].max ? game.portal[perkName].max : Infinity;
		this.cost_exponent = game.portal[perkName].specialGrowth ? game.portal[perkName].specialGrowth : 1.3;
		this.locked = game.portal[perkName].locked;
		this.level = 0;
		this.min_level = !game.global.canRespecPerks ? game.portal[perkName].level : 0;
		this.cost = 0;
		this.gain = 0;
		this.bonus = 1;
		this.cost = this.base_cost;
	}

	Perk.prototype.levellable = function (he_left) {
		return !this.locked && this.level < this.max_level && this.cost * Math.max(1, Math.floor(this.level / 1e12)) <= he_left;
	};

	Perk.prototype.level_up = function (amount) {
		this.level += amount;
		this.bonus = this.scaling(this.level);
		let spent = this.cost;

		if (this.cost_increment) {
			spent = amount * (this.cost + (this.cost_increment * (amount - 1)) / 2);
			this.cost += amount * this.cost_increment;
		} else {
			this.cost = Math.ceil(this.level / 2 + this.base_cost * Math.pow(this.cost_exponent, this.level));
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
		return this.cost_increment ? (this.scaling(1) - this.scaling(0)) / this.bonus : Math.log(this.scaling(this.level + 1) / this.bonus);
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
		...presets
	};
}

function fillPresetPerky(specificPreset) {
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
		c2: [0, 7, 1, 0],
		income: [0, 0, 0, 0],
		unesscented: [0, 1, 0, 0],
		nerfeder: [0, 1, 0, 0],
		experience: [1, 50, 1, 500]
	};

	const localData = initPresetPerky();
	const preset = $$('#preset').value;
	const weights = localData[preset] === null || localData[preset] === undefined ? defaultWeights[preset] : localData[preset];

	const ids = ['weight-he', 'weight-atk', 'weight-hp', 'weight-xp'];
	ids.forEach((id, index) => {
		document.querySelector(`#${id}`).value = +weights[index];
	});
	savePerkySettings();
}

function savePerkySettings() {
	const saveData = initPresetPerky();
	const settingInputs = { preset: document.querySelector('#preset').value };

	MODULES.autoPerks.GUI.inputs.forEach((item) => {
		settingInputs[item] = document.querySelector(`#${item}`).value;
	});

	const presetNames = Array.from(document.querySelectorAll('#preset > *'));
	if (Object.keys(saveData).length !== 0) {
		for (let item of presetNames) {
			const value = item.value;
			if (value.includes('— ')) continue;
			if (settingInputs.preset === value) settingInputs[value] = [settingInputs['weight-he'], settingInputs['weight-atk'], settingInputs['weight-hp'], settingInputs['weight-xp']];
			else settingInputs[value] = saveData[value];
		}
	}

	localStorage.setItem('perkyInputs', JSON.stringify(settingInputs));
	if (typeof autoTrimpSettings !== 'undefined' && typeof autoTrimpSettings.ATversion !== 'undefined' && !autoTrimpSettings.ATversion.includes('SadAugust')) {
		autoTrimpSettings['autoAllocatePresets'].value = JSON.stringify(settingInputs);
		saveSettings();
	}
}

function calculateDgPopGain() {
	const maxZone = game.stats.highestLevel.valueTotal() / 2 + 115;
	const efficiency = 5e8 + 5e7 * game.generatorUpgrades.Efficiency.upgrades;
	const capacity = 3 + 0.4 * game.generatorUpgrades.Capacity.upgrades;
	const maxFuel = game.permanentGeneratorUpgrades.Storage.owned ? capacity * 1.5 : capacity;
	const supply = 230 + 2 * game.generatorUpgrades.Supply.upgrades;
	const overclock = game.generatorUpgrades.Overclocker.upgrades && 1 - 0.5 * Math.pow(0.99, game.generatorUpgrades.Overclocker.upgrades - 1);
	const burnRate = game.permanentGeneratorUpgrades.Slowburn.owned ? 0.4 : 0.5;
	const cells = mastery('magmaFlow') ? 18 : 16;
	const acceleration = mastery('quickGen') ? 1.03 : 1.02;
	const hyperspeed2 = mastery('hyperspeed2') ? game.stats.highestLevel.valueTotal() / 2 : 0;
	const blacksmith = 0.5 * mastery('blacksmith') + 0.25 * mastery('blacksmith2') + 0.15 * mastery('blacksmith3');
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

	return housing;
}

function populatePerkyData() {
	const zone = Math.min(+$$('#targetZone').value, getObsidianStart());
	const hze = game.stats.highestLevel.valueTotal();

	// Income
	const spires = Math.min(Math.floor((zone - 101) / 100), game.global.spiresCompleted);
	const turkimpTimer = mastery('turkimp2') ? 1 : mastery('turkimp') ? 0.4 : 0.25;
	const cache = hze < 60 ? 0 : hze < 85 ? 7 : hze < 160 ? 10 : hze < 185 ? 14 : 20;
	let prod = 1 + turkimpTimer;
	let loot = 1 + 0.333 * turkimpTimer;
	loot *= hze < 100 ? 0.7 : 1 + (mastery('stillRowing') ? 0.3 : 0.2) * spires;

	let chronojest = 27 * game.unlocks.imps.Jestimp + 15 * game.unlocks.imps.Chronoimp;

	for (let mod of game.global.StaffEquipped.mods || []) {
		if (mod[0] === 'MinerSpeed') prod *= 1 + 0.01 * mod[1];
		else if (mod[0] === 'metalDrop') loot *= 1 + 0.01 * mod[1];
	}

	chronojest += (mastery('mapLoot2') ? 5 : 4) * cache;

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
			trimps: 0,
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
			chronojest: chronojest,
			prod: prod,
			loot: loot,
			breed_timer: mastery('patience') ? 45 : 30
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
		result.mod.prod = result.mod.loot = 0;
		result.perks.Overkill.max_level = 0;
		result.zone = game.global.world;
	}

	if (preset === 'carp') {
		result.mod.prod = result.mod.loot = 0;
		result.weight.trimps = 1e6;
	}

	if (preset === 'metal') result.mod.prod = 0;
	if (preset === 'trimp') result.mod.soldiers = 1;
	if (preset === 'nerfed') result.perks.Overkill.max_level = 1;
	if (preset === 'scientist') result.perks.Coordinated.max_level = 0;
	if (preset === 'income') result.weight = { income: 3, trimps: 3, attack: 1, helium: 0, health: 0, xp: 0 };

	if (preset === 'unesscented') {
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

	for (const [name, func] of Object.entries(perkData)) {
		perks[name] = new Perk(name, func);
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
	// Number of ticks it takes to one-shot an enemy.

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

	// Max population
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

	// Number of buildings of a given kind that can be built with the current income.
	// cost: base cost of the buildings
	// exp: cost increase for each new level of the building
	function building(cost, exp) {
		cost *= 4 * Resourceful.bonus;
		return Math.log(1 + (income(true) * (exp - 1)) / cost) / Math.log(exp);
	}

	// Number of zones spent in the Magma
	function magma() {
		return Math.max(zone - 229, 0);
	}

	// Breed speed
	function breed() {
		const nurseries = building(2e6, 1.06) / (1 + 0.1 * Math.min(magma(), 20));
		const potency = 0.0085 * (zone >= 60 ? 0.1 : 1) * Math.pow(1.1, Math.floor(zone / 5));
		return potency * Math.pow(1.01, nurseries) * Pheromones.bonus * mod.ven;
	}

	// Number of Trimps sent at a time, pre-gators
	const group_size = [];
	for (let coord = 0; coord <= Math.log(1 + he_left / 5e5) / Math.log(1.3); ++coord) {
		const ratio_1 = 1 + 0.25 * Math.pow(0.98, coord);
		const available_coords = zone - 1 + (magma() ? 100 : 0);
		let result = 1;
		for (let i = 0; i < available_coords; ++i) result = Math.ceil(result * ratio_1);
		group_size[coord] = result;
	}

	// Strength multiplier from coordinations
	function soldiers() {
		const ratio = 1 + 0.25 * Coordinated.bonus;
		let pop = (mod.soldiers || trimps()) / 3;
		if (mod.soldiers > 1) pop += 36000 * Bait.bonus;
		const unbought_coords = Math.max(0, Math.log(group_size[Coordinated.level] / pop) / Math.log(ratio));
		return group_size[0] * Math.pow(1.25, -unbought_coords);
	}

	// Fracional number of Amalgamators expected
	function gators() {
		if (zone < 230 || mod.soldiers > 1) return 0;
		const ooms = Math.log(trimps() / group_size[Coordinated.level]) / Math.log(10);
		return Math.max(0, (ooms - 7 + Math.floor((zone - 215) / 100)) / 3);
	}

	// Total attack
	function attack() {
		let attack = (0.15 + equip('attack')) * Math.pow(0.8, magma());
		attack *= Power.bonus * Power_II.bonus * Relentlessness.bonus;
		attack *= Siphonology.bonus * Range.bonus * Anticipation.bonus;
		attack *= fluffy.attack[Capable.level];
		attack *= mastery('amalg') ? Math.pow(1.5, gators()) : 1 + 0.5 * gators();
		return soldiers() * attack;
	}

	// Total survivability (accounts for health and block)
	function health() {
		let health = (0.6 + equip('health')) * Math.pow(0.8, magma());
		health *= Toughness.bonus * Toughness_II.bonus * Resilience.bonus;
		// block
		const gyms = building(400, 1.185);
		const trainers = (gyms * Math.log(1.185) - Math.log(1 + gyms)) / Math.log(1.1) + 25 - mystic;
		let block = 0.04 * gyms * Math.pow(1 + mystic / 100, gyms) * (1 + tacular * trainers);
		// target number of attacks to survive
		let attacks = 60;
		if (zone < 70) {
			// no geneticists
			// number of ticks needed to repopulate an army
			const timer = Math.log(1 + (soldiers() * breed()) / Bait.bonus) / Math.log(1 + breed());
			attacks = timer / ticks();
		} else {
			// geneticists
			const fighting = Math.min(group_size[Coordinated.level] / trimps(), 1 / 3);
			const target_speed = fighting > 1e-9 ? (Math.pow(0.5 / (0.5 - fighting), 0.1 / mod.breed_timer) - 1) * 10 : fighting / mod.breed_timer;
			const geneticists = Math.log(breed() / target_speed) / -Math.log(0.98);
			health *= Math.pow(1.01, geneticists);
			health *= Math.pow(1.332, gators());
		}
		health /= attacks;
		if (zone < 60) block += equip('block');
		else block = Math.min(block, 4 * health);
		return soldiers() * (block + health);
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

	const stats = { agility: agility, helium: helium, xp: xp, attack: attack, health: health, overkill: overkill, trimps: trimps, income: income };

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
			perks[name + '_II'].gain = (perks[name].gain * perks[name + '_II'].log_ratio()) / perks[name].log_ratio();
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
			he_left -= perk.level_up(Math.floor(Math.max(Math.min(x, perk.max_level - perk.level), 1, perk.level / 1e12)));
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
	if (zone > 90 && mod.soldiers <= 1 && Bait.min_level === 0) Bait.max_level = 0;
	if (game.portal.Carpentry.locked) {
		Bait.min_level = 1;
		if ($$('#preset').value !== 'trapper') Pheromones.min_level = 1;
	}
	// Fluffy
	fluffy.attack = [];
	const potential = Math.log((0.003 * fluffy.xp) / Math.pow(5, fluffy.prestige) + 1) / Math.log(4);
	for (let cap = 0; cap <= 10; ++cap) {
		const level = Math.min(Math.floor(potential), cap);
		const progress = level === cap ? 0 : (Math.pow(4, potential - level) - 1) / 3;
		fluffy.attack[cap] = 1 + Math.pow(5, fluffy.prestige) * 0.1 * (level / 2 + progress) * (level + 1);
	}
	// Minimum levels on perks
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
	// Main loop
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
		while (he_left > he_target && sorted_perks.length) {
			const best = sorted_perks.shift();
			if (!best.levellable(he_left)) continue;
			spend_he(best, he_left - he_target);
			let i = 0;
			while (sorted_perks[i] && sorted_perks[i].gain / sorted_perks[i].cost > best.gain / best.cost) i++;
			sorted_perks.splice(i, 0, best);
		}
	}
	if (he_left + 1 < total_he / 1e12 && Toughness_II.level > 0) {
		--Toughness_II.level;
		he_left += Toughness_II.cost;
	}
	return perks;
}

MODULES.autoPerks = {
	createInput: function (perkLine, id, inputObj, savedValue, settingName) {
		if (!id || document.getElementById(id + 'Div') !== null) {
			console.log("You most likely have a setup error in your inputBoxes. It will be trying to access a input box that doesn't exist.");
			return;
		}
		const onchange = `legalizeInput(this.id); save${settingName}Settings();`;
		//Creating container for both the label and the input.
		const perkDiv = document.createElement('DIV');
		perkDiv.id = `${id}Div`;
		perkDiv.style.display = 'inline';

		//Creating input box for users to enter their own ratios/stats.
		const perkInput = document.createElement('Input');
		perkInput.type = 'number';
		perkInput.id = id;
		perkInput.style.cssText = `text-align: center; width: calc(100vw/22); font-size: 1vw; ${game.options.menu.darkTheme.enabled !== 2 ? 'color: black;' : ''}`;
		perkInput.value = savedValue || inputObj.defaultValue;
		perkInput.min = inputObj.minValue;
		perkInput.max = inputObj.maxValue;
		perkInput.placeholder = inputObj.defaultValue;
		perkInput.setAttribute('onchange', onchange);
		perkInput.onmouseover = () => tooltip(inputObj.name, 'customText', event, inputObj.description);
		perkInput.onmouseout = () => tooltip('hide');

		const perkText = document.createElement('span');
		perkText.id = `${id}Text`;
		perkText.innerHTML = inputObj.name;
		perkText.style.cssText = 'margin-right: 0.7vw; width: calc(100vw/12); color: white; font-size: 0.9vw; font-weight: lighter; margin-left: 0.3vw;';

		perkDiv.appendChild(perkText);
		perkDiv.appendChild(perkInput);
		perkLine.appendChild(perkDiv);
	},

	removeGUI: function () {
		Object.keys(MODULES.autoPerks.GUI).forEach((key) => {
			const elem = MODULES.autoPerks.GUI[key];
			if (elem && elem.parentNode) {
				elem.parentNode.removeChild(elem);
				delete MODULES.autoPerks.GUI[key];
			}
		});
	},

	displayGUI: function (universe) {
		universe = universe === 1 ? 'Perky' : universe === 2 ? 'Surky' : universe;
		const presets = MODULES.autoPerks[`presets${universe}`];
		const inputBoxes = MODULES.autoPerks[`inputBoxes${universe}`];
		let settingInputs = JSON.parse(localStorage.getItem(`${universe.toLowerCase()}Inputs`));

		//As a safety measure we should remove the GUI if it already exists.
		if (MODULES.autoPerks.GUI && Object.keys(MODULES.autoPerks.GUI).length !== 0) MODULES.autoPerks.removeGUI();

		MODULES.autoPerks.GUI = {};
		MODULES.autoPerks.GUI.inputs = [];
		const apGUI = MODULES.autoPerks.GUI;

		//Setup Auto Allocate button
		apGUI.$allocatorBtn1 = document.createElement('DIV');
		apGUI.$allocatorBtn1.id = 'allocatorBtn1';
		apGUI.$allocatorBtn1.setAttribute('class', 'btn inPortalBtn settingsBtn settingBtntrue');
		apGUI.$allocatorBtn1.setAttribute('onclick', 'run' + universe + '()');
		apGUI.$allocatorBtn1.setAttribute('onmouseover', 'tooltip("Auto Allocate", "customText", event, "Clears all perks and buy optimal levels in each perk.")');
		apGUI.$allocatorBtn1.setAttribute('onmouseout', 'tooltip("hide")');
		apGUI.$allocatorBtn1.textContent = 'Allocate Perks';
		//Distance from Portal/Cancel/Respec buttons
		let $buttonbar = document.getElementById('portalBtnContainer');
		if (!document.getElementById(apGUI.$allocatorBtn1.id)) $buttonbar.appendChild(apGUI.$allocatorBtn1);
		$buttonbar.setAttribute('style', 'margin-bottom: 0.2vw;');
		apGUI.$customRatios = document.createElement('DIV');
		apGUI.$customRatios.id = 'customRatios';

		apGUI.$ratiosLine = {};

		//Setup inputs boxes for the UI.
		for (let x = 0; x < Object.keys(inputBoxes).length; x++) {
			let row = Object.keys(inputBoxes)[x];
			apGUI.$ratiosLine[row] = document.createElement('DIV');
			apGUI.$ratiosLine[row].setAttribute('style', 'display: inline-block; text-align: center; width: 100%; margin-bottom: 0.1vw;');
			for (let item in inputBoxes[row]) {
				MODULES.autoPerks.createInput(apGUI.$ratiosLine[row], item, inputBoxes[row][item], settingInputs && settingInputs[item] !== null ? settingInputs[item] : 1, universe);
				MODULES.autoPerks.GUI.inputs.push(item);
			}
			apGUI.$customRatios.appendChild(apGUI.$ratiosLine[row]);
		}

		//Creating container for both the label and the input.
		apGUI.$presetDiv = document.createElement('DIV');
		apGUI.$presetDiv.id = 'Preset Div';
		apGUI.$presetDiv.style.cssText = 'display: inline; width: calc(100vw/34);';

		//Setting up preset label
		apGUI.$presetLabel = document.createElement('span');
		apGUI.$presetLabel.id = 'PresetText';
		apGUI.$presetLabel.innerHTML = '&nbsp;&nbsp;&nbsp;Preset:';
		apGUI.$presetLabel.style.cssText = 'margin-right: 0.5vw; color: white; font-size: 0.9vw; font-weight: lighter;';

		//Setup preset list
		let presetListHtml = `<select id="preset" onchange="fillPreset${universe}()" data-saved>
   		<option disabled>— Zone Progression —</option>`;
		for (let item in presets.regular) presetListHtml += `<option value="${item}" title="${presets.regular[item].description}">${presets.regular[item].name}</option>`;
		presetListHtml += `<option disabled>— Special Purpose Presets —</option>`;
		for (let item in presets.special) presetListHtml += `<option value="${item}" title="${presets.special[item].description}">${presets.special[item].name}</option>`;
		presetListHtml += `</select>`;

		//Setting up preset dropdown
		apGUI.$preset = document.createElement('select');
		apGUI.$preset.id = 'preset';
		apGUI.$preset.onchange = () => window[`fillPreset${universe}`]();
		apGUI.$preset.style.cssText = `text-align: center; width: 9.8vw; font-size: 0.9vw; font-weight: lighter; ${game.options.menu.darkTheme.enabled !== 2 ? 'color: black;' : ''}`;
		apGUI.$preset.innerHTML = presetListHtml;

		apGUI.$presetDiv.appendChild(apGUI.$presetLabel);
		apGUI.$presetDiv.appendChild(apGUI.$preset);
		if (document.getElementById(apGUI.$presetDiv.id) === null) apGUI.$ratiosLine.row1.appendChild(apGUI.$presetDiv);
		let $portalWrapper = document.getElementById('portalWrapper');
		$portalWrapper.appendChild(apGUI.$customRatios);

		if (universe === 'Perky') {
			if (!settingInputs) {
				document.querySelector('#targetZone').value = Math.max(20, game.stats.highestVoidMap.valueTotal || game.global.highestLevelCleared);
				let presetToUse;
				Array.from(document.querySelectorAll('#preset > *')).forEach((option) => {
					if (parseInt(option.innerHTML.toLowerCase().replace(/[z+]/g, '').split('-')[0]) < game.global.highestLevelCleared) {
						presetToUse = option.value;
					}
				});

				fillPresetPerky(presetToUse);
				settingInputs = JSON.parse(localStorage.getItem(`${universe.toLowerCase()}Inputs`));
			}
			document.querySelector('#preset').value = settingInputs.preset;
			if (game.global.spiresCompleted < 2) document.querySelector('#weight-xpDiv').style.display = 'none';
		} else if (universe === 'Surky') {
			if (!settingInputs) {
				saveSurkySettings(true);
				settingInputs = JSON.parse(localStorage.getItem(universe.toLowerCase() + 'Inputs'));
			}
			const preset = settingInputs.preset || 'ezfarm';
			document.querySelector('#preset').value = preset;
			document.querySelector('#radonPerRunDiv').style.display = 'none';
			document.querySelector('#findPotsDiv').style.display = preset === 'alchemy' ? 'inline' : 'none';
			document.querySelector('#trapHrsDiv').style.display = preset === 'trappa' ? 'inline' : 'none';
			initialLoad();
		}
	},

	presetsPerky: {
		regular: {
			early: {
				name: 'Z1-59',
				description: "Use this setting for the when you're progressing through the first 60 zones."
			},
			broken: {
				name: 'Z60-99',
				description: 'Use this setting for zones 60-99.'
			},
			mid: {
				name: 'Z100-180',
				description: 'Use this setting for zones 100-180.'
			},
			corruption: {
				name: 'Z181-229',
				description: 'Use this setting for zones 181-229.'
			},
			magma: {
				name: 'Z230-280',
				description: 'Use this setting for zones 230-280.'
			},
			z280: {
				name: 'Z280-400',
				description: 'Use this setting for zones 280-400.'
			},
			z400: {
				name: 'Z400-450',
				description: 'Use this setting for zones 400-450.'
			},
			z450: {
				name: 'Z450+',
				description: 'Use this setting for zones 450+.'
			}
		},
		special: {
			spire: {
				name: 'Spire respec',
				description: 'Use this setting to respec for the Spire.'
			},
			nerfed: {
				name: 'Nerfed feat',
				description: 'Use this setting to respec for the Nerfed feat.'
			},
			tent: {
				name: 'Tent City feat',
				description: 'Use this setting to respec for the Tent City feat.'
			},
			scientist: {
				name: 'Scientist challenge',
				description: 'Use this setting to respec for the Scientist challenge.'
			},
			carp: {
				name: 'Trapper² (initial)',
				description: 'Use this setting to respec for the Trapper² challenge.'
			},
			trapper: {
				name: 'Trapper² (respec)',
				description: 'Use this setting to respec for the Trapper² challenge.'
			},
			coord: {
				name: 'Coordinate²',
				description: 'Use this setting to respec for the Coordinate² challenge.'
			},
			trimp: {
				name: 'Trimp²',
				description: 'Use this setting to respec for the Trimp² challenge.'
			},
			metal: {
				name: 'Metal²',
				description: 'Use this setting to respec for the Metal² challenge.'
			},
			c2: {
				name: 'Other c²',
				description: 'Use this setting to respec for the other c² challenges.'
			},
			income: {
				name: 'Income',
				description: 'Use this setting to respec for the Income feat.'
			},
			unesscented: {
				name: 'Unesscented',
				description: 'Use this setting to respec for the Unesscented feat.'
			},
			nerfeder: {
				name: 'Nerfeder',
				description: 'Use this setting to respec for the Nerfeder feat.'
			},
			experience: {
				name: 'Experience',
				description: 'Use this setting to respec for the Experience challenge.'
			}
		}
	},
	inputBoxesPerky: {
		//Top Row
		row1: {
			'weight-he': {
				name: 'Weight: Helium',
				description: 'Weight for how much you value 1% more helium .',
				minValue: 0,
				maxValue: null,
				defaultValue: 1
			},
			'weight-atk': {
				name: 'Weight: Attack',
				description: 'Weight for how much you value 1% more attack.',
				minValue: 0,
				maxValue: null,
				defaultValue: 1
			},
			'weight-hp': {
				name: 'Weight: Health',
				description: 'Weight for how much you value 1% more health.',
				minValue: 0,
				maxValue: null,
				defaultValue: 1
			}
		},
		//Second Row
		row2: {
			targetZone: {
				name: 'Target Zone',
				description: 'Target last zone to clear. Always use your final cleared zone for the current challenge (afterpush zone for radon challenges, xx9 for c^3s, 100 for Mayhem, etc).',
				minValue: 1,
				maxValue: null,
				defaultValue: game.global.highestLevelCleared || 1
			},
			'weight-xp': {
				name: 'Weight: Fluffy',
				description: 'Weight for how much you value 1% more Fluffy xp.',
				minValue: 0,
				maxValue: null,
				defaultValue: 1
			}
		}
	},
	presetsSurky: {
		regular: {
			ezfarm: {
				name: 'Easy Radon Challenge',
				description: 'Use if you can easily complete your radon challenge quickly at the minimum requirements with no golden battle. Pushing perks will still be valued for gains to scruffy level 3 and other growth mechanisms.'
			},
			tufarm: {
				name: 'Difficult Radon Challenge',
				description: 'Use if you need some extra pushing power to complete your radon challenge, especially if you still want golden battle. This will almost always be the right setting when you first start a new radon challenge.'
			},
			push: {
				name: 'Push/C^3/Mayhem',
				description: 'Use when doing any pushing runs. Aim is to maximise pushing power so should almost always be used with golden battle upgrades.'
			}
		},
		special: {
			alchemy: {
				name: 'Alchemy',
				description: "Use this setting to optimize for trinket drop rate with finding potions. If you won't buy finding potions or don't care about trinket drops you can use a basic preset instead.\nIf it has been set then this will use your Easy Radon Challenge preset weights when selected."
			},
			trappa: {
				name: 'Trappa/^3',
				description: "Be sure to enter an 'Hours of trapping' value below to help value Bait! Use this setting either when portalling into Trappa, or after portalling with the Max Carpentry setting. coordLimited=1 is assumed."
			},
			downsize: {
				name: 'Downsize/^3',
				description: 'This setting optimizes for each housing building giving only 1 Trimp. coordLimited=1 is assumed as the minimum (but a larger value to overweight population will be respected).\nIf it has been set then this will use your Push/C^3/Mayhem preset weights when selected.'
			},
			berserk: {
				name: 'Berserk/^3',
				description: 'This setting will stop Frenzy being purchased.\nIf it has been set then this will use your Push/C^3/Mayhem preset weights when selected.'
			},
			smithless: {
				name: 'Smithless/^3',
				description: 'This setting will stop Smithology being purchased and make Smithies hold no value.\nIf it has been set then this will use your Push/C^3/Mayhem preset weights when selected.'
			},
			duel: {
				name: 'Duel/^3',
				description: "This setting optimizes for less than 100% CC in Duel. It's a very minor effect that only matters for Criticality so feel free to skip this setting if you like.\nIf it has been set then this will use your Push/C^3/Mayhem preset weights when selected."
			},
			equip: {
				name: 'Equipment farming',
				description: 'Optimize purely for equipment purchasing power, including zone progression to get more speedbooks. Useful as an initial spec to maximize prestiges that can be afforded before respeccing to Combat spec. All entered weights are ignored, but the Coord-limited setting is respected.'
			},
			combat: {
				name: 'Combat Respec',
				description:
					"As a respec ONLY, optimize for maximum combat stats given current equipment and population. Radon weight is ignored, but atk / hp vs.equality weights are respected. Coord Limited value is ignored and instead uses your save to determine how much housing perk levels are needed to buy your current coord amount. If you are in Trappa, the optimization assumes you have sent your last army so that health perks won't be applied - DO NOT USE in Trappa until after you send your last army."
			},
			combatRadon: {
				name: 'Radon Combat Respec',
				description: "As a respec ONLY, optimize for maximum combat stats given current equipment and population. Coord Limited value is ignored and instead uses your save to determine how much housing perk levels are needed to buy your current coord amount. If you are in Trappa, the optimization assumes you have sent your last army so that health perks won't be applied - DO NOT USE in Trappa until after you send your last army."
			},
			resminus: {
				name: 'Resources (-maps)',
				description: 'Optimize for max resource gains from below world level maps. Only use this if you are farming maps below your current zone and care ONLY about total resource gains. All user entered weights are ignored in favor of resource gains. Pushing perks are still valued for increasing the level of map you can farm.'
			},
			resplus: {
				name: 'Resources (+maps)',
				description: 'Optimize for max resource gains from +maps. Only use this if you are farming maps above your current zone and care ONLY about total resource gains. All user entered weights are ignored in favor of resource gains. Pushing perks are still valued for increasing the level of map you can farm.'
			},
			trappacarp: {
				name: 'Trappa Carp',
				description: 'Use this setting to max Carpentry when portalling into Trappa, if you can get enough starting population this way to be significant compared to how much you can trap.'
			}
		}
	},
	inputBoxesSurky: {
		//Top Row
		row1: {
			clearWeight: {
				name: 'Weight: Attack',
				description:
					"If you are farming and it's trivial to complete your radon challenge, set this to 0! It will still be valued for the effect of pushing power on radon gains (from Scruffy level 3, for example). Set >0 if you need more pushing power to complete your current challenge in a reasonable amount of time. This is the weight for how much you value attack * health, which determines clear speed at less than max equality. If you are used to Attack Weight and Health Weight, this is equivalent to Attack weight. This weight is not used for Equality at all.",
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			},
			survivalWeight: {
				name: 'Weight: Health',
				description:
					"Weight placed on equality (and additional weight placed on health), for maximum survivability against high enemy attack at max equality. This helps determine how far you can push (perhaps very slowly) before you get stuck on fast enemies that can one-shot you every hit. This can be set to 0 and equality will still be used as a dump perk. If you need a little more equality than that small weights like 0.001 will still give a meaningful boost to Equality levels. If you're used to separate attack & health weights, set this to your old Health Weight minus Attack Weight.",
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			},
			radonWeight: {
				name: 'Weight: Radon',
				description: 'Weight for how much you value growth from radon (and trinkets). If you are purely farming and can easily complete your radon challenge, this is the only weight you need, other than a tiny bit of additional health/equality weight (like 0.0001) to get some equality.',
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
				defaultValue: game.global.highestRadonLevelCleared || 20
			},
			coordLimited: {
				name: 'Coord Limited',
				description: "Enter '0' if you can easily buy all coords with your population. Enter '1' if you definitely can't buy all coords. Enter something in between if you only need a bit more population to buy all coords. You can also increase this value (even above 1) if you just want to weight population gain more highly for some reason.",
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			},
			weaponLevels: {
				name: 'Weapon Levels',
				description: 'Dagger levels purchased at target zone.',
				minValue: 0,
				maxValue: null,
				defaultValue: 1
			},
			armorLevels: {
				name: 'Armor Levels',
				description: 'Boots levels purchased at target zone.',
				minValue: 0,
				maxValue: null,
				defaultValue: 1
			}
		},
		row3: {
			tributes: {
				name: 'Tributes',
				description: 'Number of purchased tributes to consider for Greed.',
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			},
			meteorologists: {
				name: 'Meteorologists',
				description: 'Number of meteorologists to optimize for. Affects the value of food gains.',
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			},
			housingCount: {
				name: 'Collector count',
				description: "How many collectors do you get in your runs? Affects the value of more resources for increasing population. If you don't have collectors unlocked you can enter 0.",
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			},
			smithyCount: {
				name: 'Smithies',
				description: 'How many Smithies do you get in your runs? Affects the value of Smithology.',
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			},
			radonPerRun: {
				name: 'Radon per run',
				description: "Typical Radon gains in a farming run. Needed for Observation (until your trinkets are capped). Can be extracted from your save if you paste a save from the end of a U2 farming run. Doesn't need to be exact but a pretty good estimate is recommended. Only used when Rn weight > 0.",
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			},
			trapHrs: {
				name: 'Hours of trapping',
				description: "Roughly how many hours of trapping do you plan to do in this run? Affects the value of Bait. Decimal values like '0.5' and '3.7' are allowed. Entering '0' will place no value on Bait.",
				minValue: 0,
				maxValue: null,
				defaultValue: 5
			},
			findPots: {
				name: 'Finding potions',
				description: 'How many finding potions will you buy? For simplicity we assume these are all purchased by z100.',
				minValue: 0,
				maxValue: null,
				defaultValue: 0
			}
		}
	}
};

if (typeof autoTrimpSettings === 'undefined') {
	//On swapping portal universes load either Perky or Surky.
	var originalswapPortalUniverse = swapPortalUniverse;
	swapPortalUniverse = function () {
		originalswapPortalUniverse(...arguments);
		try {
			MODULES.autoPerks.displayGUI(portalUniverse);
		} catch (e) {
			console.log('Universe Swap - Failed to swap UI: ' + e, 'other');
		}
	};
}

//If using standalone version then when loading Surky file also load CSS & Perky then load portal UI.
//After initial load everything should work perfectly.
if (typeof autoTrimpSettings === 'undefined' || (typeof autoTrimpSettings !== 'undefined' && typeof autoTrimpSettings.ATversion !== 'undefined' && !autoTrimpSettings.ATversion.includes('SadAugust'))) {
	//Load CSS so that the UI is visible
	const linkStylesheet = document.createElement('link');
	linkStylesheet.rel = 'stylesheet';
	linkStylesheet.type = 'text/css';
	linkStylesheet.href = 'https://sadaugust.github.io/AutoTrimps/css/tabsStandalone.css';
	document.head.appendChild(linkStylesheet);

	function injectScript(id, src) {
		const script = document.createElement('script');
		script.id = id;
		script.src = src;
		script.setAttribute('crossorigin', 'anonymous');
		document.head.appendChild(script);
	}

	injectScript('AutoTrimps-SadAugust_Surky', 'https://sadaugust.github.io/AutoTrimps/mods/surky.js');

	//Load the portal UI
	setTimeout(function () {
		MODULES.autoPerks.displayGUI(portalUniverse);
		console.log('Surky & Perky loaded.');
	}, 3000);
}
