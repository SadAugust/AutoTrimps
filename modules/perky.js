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
	settingID = document.getElementById(settingID);
	var defaultValue = settingID.placeholder;
	var minValue = settingID.min;
	var maxValue = settingID.max;
	var val = 0;

	val = parseFloat(settingID.value);
	var badNum = isNaN(val);
	if (badNum) val = defaultValue;
	if (minValue !== null && val < minValue) settingID.value = minValue;
	else if (maxValue !== null && val > maxValue) settingID.value = maxValue;
	else settingID.value = val;
}

function runPerky() {
	if (portalUniverse !== 1) return;
	allocatePerky();
}

function allocatePerky() {
	//Enable Fluffy xp input when it's not active.
	if (game.global.spiresCompleted >= 2 && $$('#weight-xpDiv').style.display !== 'inline') $$('#weight-xpDiv').style.display = 'inline';
	//Generate perk string
	const perks = optimize();
	for (var name in perks) perks[name] = perks[name].level;
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
		if (this.cost_increment) {
			var spent = amount * (this.cost + (this.cost_increment * (amount - 1)) / 2);
			this.cost += amount * this.cost_increment;
			return spent;
		} else {
			var spent = this.cost;
			this.cost = Math.ceil(this.level / 2 + this.base_cost * Math.pow(this.cost_exponent, this.level));
			return spent;
		}
	};
	Perk.prototype.spent = function (log) {
		if (log === void 0) {
			log = false;
		}
		if (this.cost_increment) return (this.level * (this.base_cost + this.cost - this.cost_increment)) / 2;
		var total = 0;
		for (var x = 0; x < this.level; ++x) total += Math.ceil(x / 2 + this.base_cost * Math.pow(this.cost_exponent, x));
		return total;
	};
	Perk.prototype.log_ratio = function () {
		return this.cost_increment ? (this.scaling(1) - this.scaling(0)) / this.bonus : Math.log(this.scaling(this.level + 1) / this.bonus);
	};
	return Perk;
})();

// initialise perks object to default values
function initPresetPerky() {
	var settingInputs = JSON.parse(localStorage.getItem('perkyInputs'));

	//Initial setup if we don't already have a save file setup
	if (settingInputs === null || Object.keys(settingInputs).length === 0) {
		settingInputs = {};
		return settingInputs;
	}

	function presetData(preset) {
		if (settingInputs === null) return null;
		if (settingInputs[preset] === null || settingInputs[preset] === undefined) return null;
		return settingInputs[preset];
	}

	const presetNames = [].slice.apply(document.querySelectorAll('#preset > *'));
	const presets = {};
	for (var item in presetNames) {
		item = presetNames[item].value;
		if (item.includes('— ')) continue;
		presets[item] = presetData(item);
	}

	return {
		heliumWeight: +$$('#weight-he').value,
		attackWeight: +$$('#weight-atk').value,
		healthWeight: +$$('#weight-hp').value,
		xpWeight: +$$('#weight-xp').value,
		...presets
	};
}

//Fill preset weights from the dropdown menu
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

	//If we're changing the preset that's being used then we need to update the inputs that the user sees
	$$('#weight-he').value = +weights[0];
	$$('#weight-atk').value = +weights[1];
	$$('#weight-hp').value = +weights[2];
	$$('#weight-xp').value = +weights[3];
	savePerkySettings();
}

function savePerkySettings() {
	const saveData = initPresetPerky();
	//Initial setup and saving preset value
	const settingInputs = { preset: $$('#preset').value };
	//Saving the values of the inputs for the weights
	for (var item in MODULES.autoPerks.GUI.inputs) {
		item = MODULES.autoPerks.GUI.inputs[item];
		settingInputs[item] = $$('#' + item).value;
	}
	//Save inputs for all the presets that users can select.
	//Overrides data for current preset otherwises saves any already saved data for the others.
	const presetNames = [].slice.apply(document.querySelectorAll('#preset > *'));
	if (Object.keys(saveData).length !== 0) {
		for (var item in presetNames) {
			item = presetNames[item].value;
			if (item.includes('— ')) continue;
			if (settingInputs.preset === item) settingInputs[item] = [settingInputs['weight-he'], settingInputs['weight-atk'], settingInputs['weight-hp'], settingInputs['weight-xp']];
			else settingInputs[item] = saveData[item];
		}
	}

	localStorage.setItem('perkyInputs', JSON.stringify(settingInputs));
	if (typeof autoTrimpSettings !== 'undefined' && typeof autoTrimpSettings.ATversion !== 'undefined' && !autoTrimpSettings.ATversion.includes('SadAugust')) {
		autoTrimpSettings['autoAllocatePresets'].value = JSON.stringify(settingInputs);
		saveSettings();
	}
}

function dgPopGain() {
	var max_zone = game.stats.highestLevel.valueTotal() / 2 + 115;
	var eff = 500e6 + 50e6 * game.generatorUpgrades.Efficiency.upgrades;
	var capa = 3 + 0.4 * game.generatorUpgrades.Capacity.upgrades;
	var max_fuel = game.permanentGeneratorUpgrades.Storage.owned ? capa * 1.5 : capa;
	var supply = 230 + 2 * game.generatorUpgrades.Supply.upgrades;
	var overclock = game.generatorUpgrades.Overclocker.upgrades;
	overclock = overclock && 1 - 0.5 * Math.pow(0.99, overclock - 1);
	var burn = game.permanentGeneratorUpgrades.Slowburn.owned ? 0.4 : 0.5;
	var cells = mastery('magmaFlow') ? 18 : 16;
	var accel = mastery('quickGen') ? 1.03 : 1.02;
	var hs2 = mastery('hyperspeed2') ? game.stats.highestLevel.valueTotal() / 2 : 0;
	var bs = 0.5 * mastery('blacksmith') + 0.25 * mastery('blacksmith2') + 0.15 * mastery('blacksmith3');
	bs *= game.stats.highestLevel.valueTotal();
	var housing = 0;
	var fuel = 0;
	var time = 0;

	function tick(mult) {
		housing += mult * eff * Math.sqrt(Math.min(capa, fuel));
		fuel = Math.max(0, fuel - burn);
	}

	for (var zone = 230; zone <= max_zone; ++zone) {
		fuel += cells * (0.01 * Math.min(zone, supply) - 2.1);

		var tick_time = Math.ceil(60 / Math.pow(accel, Math.floor((zone - 230) / 3)));
		time += zone > bs ? 28 : zone > hs2 ? 20 : 15;
		while (time >= tick_time) {
			time -= tick_time;
			tick(1);
		}

		while (fuel > max_fuel) tick(overclock);

		housing *= 1.009;
	}

	while (fuel >= burn) tick(1);

	return housing;
}

function populatePerkyData() {
	var zone = $$('#targetZone').value;

	// Income
	var tt = mastery('turkimp2') ? 1 : mastery('turkimp') ? 0.4 : 0.25;
	var prod = 1 + tt;
	var loot = 1 + 0.333 * tt;
	var spires = Math.min(Math.floor((zone - 101) / 100), game.global.spiresCompleted);
	loot *= zone < 100 ? 0.7 : 1 + (mastery('stillRowing') ? 0.3 : 0.2) * spires;
	loot *= zone < 100 ? 0.7 : 1 + (mastery('stillRowing') ? 0.3 : 0.2) * spires;

	var chronojest = 27 * game.unlocks.imps.Jestimp + 15 * game.unlocks.imps.Chronoimp;
	var cache = zone < 60 ? 0 : zone < 85 ? 7 : zone < 160 ? 10 : zone < 185 ? 14 : 20;

	for (var mod of game.global.StaffEquipped.mods || []) {
		if (mod[0] === 'MinerSpeed') prod *= 1 + 0.01 * mod[1];
		else if (mod[0] === 'metalDrop') loot *= 1 + 0.01 * mod[1];
	}

	chronojest += (mastery('mapLoot2') ? 5 : 4) * cache;

	var preset = $$('#preset').value;
	if (preset === 'trapper' && (!game || game.global.challengeActive !== 'Trapper')) throw 'This preset requires a save currently running Trapper². Start a new run using “Trapper² (initial)”, export, and try again.';
	result = {
		total_he: countHeliumSpent(false, true) + game.global.heliumLeftover + (portalWindowOpen ? game.resources.helium.owned : 0),
		zone: zone,
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
			dg: +dgPopGain(),
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
		result.total_he = 99990000;
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
		result.total_he = 999900000;
		result.zone = 300;
	}
	return result;
}

function parse_perks() {
	var add = function (x) {
		return function (level) {
			return 1 + x * 0.01 * level;
		};
	};
	var mult = function (x) {
		return function (level) {
			return Math.pow(1 + x * 0.01, level);
		};
	};

	const perks = {
		//Perk(base_cost, scaling)
		Looting_II: new Perk('Looting_II', add(0.25)),
		Carpentry_II: new Perk('Carpentry_II', add(0.25)),
		Motivation_II: new Perk('Motivation_II', add(1)),
		Power_II: new Perk('Power_II', add(1)),
		Toughness_II: new Perk('Toughness_II', add(1)),
		Capable: new Perk('Capable', function (l) {
			return 1;
		}),
		Cunning: new Perk('Cunning', add(25)),
		Curious: new Perk('Curious', add(160)),
		Classy: new Perk('Classy', mult(4.5678375)),
		Overkill: new Perk('Overkill', add(500)),
		Resourceful: new Perk('Resourceful', mult(-5)),
		Coordinated: new Perk('Coordinated', mult(-2)),
		Siphonology: new Perk('Siphonology', function (l) {
			return Math.pow(1 + l, 0.1);
		}),
		Anticipation: new Perk('Anticipation', add(6)),
		Resilience: new Perk('Resilience', mult(10)),
		Meditation: new Perk('Meditation', add(1)),
		Relentlessness: new Perk('Relentlessness', function (l) {
			return 1 + 0.05 * l * (1 + 0.3 * l);
		}),
		Carpentry: new Perk('Carpentry', mult(10)),
		Artisanistry: new Perk('Artisanistry', mult(-5)),
		Range: new Perk('Range', add(1)),
		Agility: new Perk('Agility', mult(-5)),
		Bait: new Perk('Bait', add(100)),
		Trumps: new Perk('Trumps', add(20)),
		Pheromones: new Perk('Pheromones', add(10)),
		Packrat: new Perk('Packrat', add(20)),
		Motivation: new Perk('Motivation', add(5)),
		Power: new Perk('Power', add(5)),
		Toughness: new Perk('Toughness', add(5)),
		Looting: new Perk('Looting', add(5))
	};

	return perks;
}

function optimize() {
	const params = populatePerkyData();
	var total_he = params.total_he,
		zone = params.zone,
		fluffy = params.fluffy,
		perks = params.perks,
		weight = params.weight,
		mod = params.mod;
	var he_left = total_he;
	var Looting_II = perks.Looting_II,
		Carpentry_II = perks.Carpentry_II,
		Motivation_II = perks.Motivation_II,
		Power_II = perks.Power_II,
		Toughness_II = perks.Toughness_II,
		Capable = perks.Capable,
		Cunning = perks.Cunning,
		Curious = perks.Curious,
		Classy = perks.Classy,
		Overkill = perks.Overkill,
		Resourceful = perks.Resourceful,
		Coordinated = perks.Coordinated,
		Siphonology = perks.Siphonology,
		Anticipation = perks.Anticipation,
		Resilience = perks.Resilience,
		Meditation = perks.Meditation,
		Relentlessness = perks.Relentlessness,
		Carpentry = perks.Carpentry,
		Artisanistry = perks.Artisanistry,
		Range = perks.Range,
		Agility = perks.Agility,
		Bait = perks.Bait,
		Trumps = perks.Trumps,
		Pheromones = perks.Pheromones,
		Packrat = perks.Packrat,
		Motivation = perks.Motivation,
		Power = perks.Power,
		Toughness = perks.Toughness,
		Looting = perks.Looting;
	for (var _i = 0, _a = ['whip', 'magn', 'taunt', 'ven']; _i < _a.length; _i++) {
		var name = _a[_i];
		mod[name] = Math.pow(1.003, zone * 99 * 0.03 * mod[name]);
	}
	var books = Math.pow(1.25, zone) * Math.pow(zone > 100 ? 1.28 : 1.2, Math.max(zone - 59, 0));
	var gigas = Math.max(0, Math.min(zone - 60, zone / 2 - 25, zone / 3 - 12, zone / 5, zone / 10 + 17, 39));
	var base_housing = Math.pow(1.25, 5 + Math.min(zone / 2, 30) + gigas);
	var mystic = zone >= 25 ? Math.floor(Math.min(zone / 5, 9 + zone / 25, 15)) : 0;
	var tacular = (20 + zone - (zone % 5)) / 100;
	var base_income = 600 * mod.whip * books;
	var base_helium = Math.pow(zone - 19, 2);
	var max_tiers = zone / 5 + +((zone - 1) % 10 < 5);
	var exponents = {
		cost: Math.pow(1.069, 0.85 * (zone < 60 ? 57 : 53)),
		attack: Math.pow(1.19, 13),
		health: Math.pow(1.19, 14),
		block: Math.pow(1.19, 10)
	};
	var equip_cost = {
		attack: (211 * (weight.attack + weight.health)) / weight.attack,
		health: (248 * (weight.attack + weight.health)) / weight.health,
		block: (5 * (weight.attack + weight.health)) / weight.health
	};
	// Number of ticks it takes to one-shot an enemy.
	function ticks() {
		return 1 + +(Agility.bonus > 0.9) + Math.ceil(10 * Agility.bonus);
	}
	function moti() {
		return Motivation.bonus * Motivation_II.bonus * Meditation.bonus;
	}
	var looting = function () {
		return Looting.bonus * Looting_II.bonus;
	};
	function gem_income() {
		var drag = moti() * mod.whip;
		var loot = looting() * mod.magn * 0.75 * 0.8;
		var chronojest = (mod.chronojest * drag * loot) / 30;
		return drag + loot + chronojest;
	}
	// Max population
	var trimps = mod.tent_city
		? function () {
				var carp = Carpentry.bonus * Carpentry_II.bonus;
				var territory = Trumps.bonus;
				return 10 * (mod.taunt + territory * (mod.taunt - 1) * 111) * carp;
		  }
		: function () {
				var carp = Carpentry.bonus * Carpentry_II.bonus;
				var bonus = 3 + Math.log((base_housing * gem_income()) / Resourceful.bonus) / Math.log(1.4);
				var territory = Trumps.bonus * zone;
				return 10 * (base_housing * bonus + territory) * carp * mod.taunt + mod.dg * carp;
		  };
	function income(ignore_prod) {
		var storage = (mod.storage * Resourceful.bonus) / Packrat.bonus;
		var loot = (looting() * mod.magn) / ticks();
		var prod = ignore_prod ? 0 : moti() * mod.prod;
		var chronojest = mod.chronojest * 0.1 * prod * loot;
		return base_income * (prod + loot * mod.loot + chronojest) * (1 - storage) * trimps();
	}
	function equip(stat) {
		var cost = equip_cost[stat] * Artisanistry.bonus;
		var levels = 1.136;
		var tiers = Math.log(1 + income() / cost) / Math.log(exponents.cost);
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
		var nurseries = building(2e6, 1.06) / (1 + 0.1 * Math.min(magma(), 20));
		var potency = 0.0085 * (zone >= 60 ? 0.1 : 1) * Math.pow(1.1, Math.floor(zone / 5));
		return potency * Math.pow(1.01, nurseries) * Pheromones.bonus * mod.ven;
	}
	// Number of Trimps sent at a time, pre-gators
	var group_size = [];
	for (var coord = 0; coord <= Math.log(1 + he_left / 500e3) / Math.log(1.3); ++coord) {
		var ratio_1 = 1 + 0.25 * Math.pow(0.98, coord);
		var available_coords = zone - 1 + (magma() ? 100 : 0);
		var result = 1;
		for (var i = 0; i < available_coords; ++i) result = Math.ceil(result * ratio_1);
		group_size[coord] = result;
	}
	// Strength multiplier from coordinations
	function soldiers() {
		var ratio = 1 + 0.25 * Coordinated.bonus;
		var pop = (mod.soldiers || trimps()) / 3;
		if (mod.soldiers > 1) pop += 36000 * Bait.bonus;
		var unbought_coords = Math.max(0, Math.log(group_size[Coordinated.level] / pop) / Math.log(ratio));
		return group_size[0] * Math.pow(1.25, -unbought_coords);
	}
	// Fracional number of Amalgamators expected
	function gators() {
		if (zone < 230 || mod.soldiers > 1) return 0;
		var ooms = Math.log(trimps() / group_size[Coordinated.level]) / Math.log(10);
		return Math.max(0, (ooms - 7 + Math.floor((zone - 215) / 100)) / 3);
	}
	// Total attack
	function attack() {
		var attack = (0.15 + equip('attack')) * Math.pow(0.8, magma());
		attack *= Power.bonus * Power_II.bonus * Relentlessness.bonus;
		attack *= Siphonology.bonus * Range.bonus * Anticipation.bonus;
		attack *= fluffy.attack[Capable.level];
		attack *= mastery('amalg') ? Math.pow(1.5, gators()) : 1 + 0.5 * gators();
		return soldiers() * attack;
	}
	// Total survivability (accounts for health and block)
	function health() {
		var health = (0.6 + equip('health')) * Math.pow(0.8, magma());
		health *= Toughness.bonus * Toughness_II.bonus * Resilience.bonus;
		// block
		var gyms = building(400, 1.185);
		var trainers = (gyms * Math.log(1.185) - Math.log(1 + gyms)) / Math.log(1.1) + 25 - mystic;
		var block = 0.04 * gyms * Math.pow(1 + mystic / 100, gyms) * (1 + tacular * trainers);
		// target number of attacks to survive
		var attacks = 60;
		if (zone < 70) {
			// no geneticists
			// number of ticks needed to repopulate an army
			var timer = Math.log(1 + (soldiers() * breed()) / Bait.bonus) / Math.log(1 + breed());
			attacks = timer / ticks();
		} else {
			// geneticists
			var fighting = Math.min(group_size[Coordinated.level] / trimps(), 1 / 3);
			var target_speed = fighting > 1e-9 ? (Math.pow(0.5 / (0.5 - fighting), 0.1 / mod.breed_timer) - 1) * 10 : fighting / mod.breed_timer;
			var geneticists = Math.log(breed() / target_speed) / -Math.log(0.98);
			health *= Math.pow(1.01, geneticists);
			health *= Math.pow(1.332, gators());
		}
		health /= attacks;
		if (zone < 60) block += equip('block');
		else block = Math.min(block, 4 * health);
		return soldiers() * (block + health);
	}
	var xp = function () {
		return Cunning.bonus * Curious.bonus * Classy.bonus;
	};
	var agility = function () {
		return 1 / Agility.bonus;
	};
	var helium = function () {
		return base_helium * looting() + 45;
	};
	var overkill = function () {
		return Overkill.bonus;
	};
	var stats = { agility: agility, helium: helium, xp: xp, attack: attack, health: health, overkill: overkill, trimps: trimps, income: income };
	function score() {
		var result = 0;
		for (var i in weight) {
			if (!weight[i]) continue;
			var stat = stats[i]();
			if (!isFinite(stat)) throw Error(i + ' is ' + stat);
			result += weight[i] * Math.log(stat);
		}
		return result;
	}
	function recompute_marginal_efficiencies() {
		var baseline = score();
		for (var name in perks) {
			var perk = perks[name];
			if (perk.cost_increment || !perk.levellable(he_left)) continue;
			perk.level_up(1);
			perk.gain = score() - baseline;
			perk.level_up(-1);
		}
		for (var _i = 0, _a = ['Looting', 'Carpentry', 'Motivation', 'Power', 'Toughness']; _i < _a.length; _i++) {
			var name = _a[_i];
			perks[name + '_II'].gain = (perks[name].gain * perks[name + '_II'].log_ratio()) / perks[name].log_ratio();
		}
	}
	function solve_quadratic_equation(a, b, c) {
		var delta = b * b - 4 * a * c;
		return (-b + Math.sqrt(delta)) / (2 * a);
	}
	function spend_he(perk, budget) {
		perk.gain /= perk.log_ratio();
		if (perk.cost_increment) {
			var ratio_2 = (1 + perk.level) / (1000 + Looting_II.level + Carpentry_II.level + Motivation_II.level + Power_II.level + Toughness_II.level);
			budget *= 0.5 * Math.pow(ratio_2, 2);
			var x = solve_quadratic_equation(perk.cost_increment / 2, perk.cost - perk.cost_increment / 2, -budget);
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
	// Fluffy
	fluffy.attack = [];
	var potential = Math.log((0.003 * fluffy.xp) / Math.pow(5, fluffy.prestige) + 1) / Math.log(4);
	for (var cap = 0; cap <= 10; ++cap) {
		var level = Math.min(Math.floor(potential), cap);
		var progress = level === cap ? 0 : (Math.pow(4, potential - level) - 1) / 3;
		fluffy.attack[cap] = 1 + Math.pow(5, fluffy.prestige) * 0.1 * (level / 2 + progress) * (level + 1);
	}
	// Minimum levels on perks
	for (var name in perks) {
		var perk = perks[name];
		if (perk.cost_increment) he_left -= perk.level_up(perk.min_level);
		else while (perk.level < perk.min_level) he_left -= perk.level_up(1);
	}
	var ratio = 0.25;
	while (Capable.levellable(he_left * ratio)) {
		he_left -= Capable.level_up(1);
		ratio = Capable.level <= Math.floor(potential) && zone > 300 && weight.xp > 0 ? 0.25 : 0.01;
	}
	if (zone <= 300 || potential >= Capable.level) weight.xp = 0;
	// Main loop
	var sorted_perks = Object.keys(perks)
		.map(function (name) {
			return perks[name];
		})
		.filter(function (perk) {
			return perk.levellable(he_left);
		});
	var reference_he = he_left;
	for (var x = 0.999; x > 1e-12; x *= x) {
		var he_target = reference_he * x;
		recompute_marginal_efficiencies();
		sorted_perks.sort(function (a, b) {
			return b.gain / b.cost - a.gain / a.cost;
		});
		while (he_left > he_target && sorted_perks.length) {
			var best = sorted_perks.shift();
			if (!best.levellable(he_left)) continue;
			spend_he(best, he_left - he_target);
			var i = 0;
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
	createInput: function (perkLine, id, inputObj, savedValue, onchange) {
		if (!id) return;
		if (document.getElementById(id + 'Div') !== null) {
			console.log("You most likely have a setup error in your inputBoxes. It will be trying to access a input box that doesn't exist.");
			return;
		}
		if (onchange === 'Surky') onchange = 'legalizeInput(this.id); saveSurkySettings();';
		if (onchange === 'Perky') onchange = 'legalizeInput(this.id); savePerkySettings();';
		//Creating container for both the label and the input.
		var perkDiv = document.createElement('DIV');
		perkDiv.id = id + 'Div';
		perkDiv.setAttribute('style', 'display: inline;');

		//Creating input box for users to enter their own ratios/stats.
		var perkInput = document.createElement('Input');
		perkInput.setAttribute('type', 'number');
		perkInput.id = id;
		var perkInputStyle = 'text-align: center; width: calc(100vw/22); font-size: 1vw;';
		if (game.options.menu.darkTheme.enabled !== 2) perkInputStyle += ' color: black;';
		perkInput.setAttribute('style', perkInputStyle);
		perkInput.setAttribute('value', savedValue || inputObj.defaultValue);
		perkInput.setAttribute('min', inputObj.minValue);
		perkInput.setAttribute('max', inputObj.maxValue);
		perkInput.setAttribute('placeholder', inputObj.defaultValue);
		perkInput.setAttribute('onchange', onchange);
		perkInput.setAttribute('onmouseover', 'tooltip("' + inputObj.name + '", "customText", event, "' + inputObj.description + '")');
		perkInput.setAttribute('onmouseout', 'tooltip("hide")');

		var perkText = document.createElement('Label');
		perkText.id = id + 'Text';
		perkText.innerHTML = inputObj.name;
		perkText.setAttribute('style', 'margin-right: 0.7vw; width: calc(100vw/12); color: white; font-size: 0.9vw; font-weight: lighter; margin-left: 0.3vw; ');
		//Combining the input and the label into the container. Then attaching the container to the main div.
		perkDiv.appendChild(perkText);
		perkDiv.appendChild(perkInput);
		perkLine.appendChild(perkDiv);
	},

	removeGUI: function () {
		Object.keys(MODULES.autoPerks.GUI).forEach(function (key) {
			var $$elem = MODULES.autoPerks.GUI[key];
			if (!$$elem) {
				console.log('error in: ' + key);
				return;
			}
			if ($$elem.parentNode) {
				$$elem.parentNode.removeChild($$elem);
				delete $elem;
			}
		});
	},
	displayGUI: function (universe) {
		if (universe === 1) universe = 'Perky';
		else if (universe === 2) universe = 'Surky';
		const presets = MODULES.autoPerks['presets' + universe];
		const inputBoxes = MODULES.autoPerks['inputBoxes' + universe];
		var settingInputs = JSON.parse(localStorage.getItem(universe.toLowerCase() + 'Inputs'));

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
		var $buttonbar = document.getElementById('portalBtnContainer');
		if (document.getElementById(apGUI.$allocatorBtn1.id) === null) $buttonbar.appendChild(apGUI.$allocatorBtn1);
		$buttonbar.setAttribute('style', 'margin-bottom: 0.2vw;');
		apGUI.$customRatios = document.createElement('DIV');
		apGUI.$customRatios.id = 'customRatios';

		apGUI.$ratiosLine = {};
		//Setup inputs boxes for the UI.
		for (var x = 0; x < Object.keys(inputBoxes).length; x++) {
			var row = Object.keys(inputBoxes)[x];
			apGUI.$ratiosLine[row] = document.createElement('DIV');
			apGUI.$ratiosLine[row].setAttribute('style', 'display: inline-block; text-align: center; width: 100%; margin-bottom: 0.1vw;');
			for (var item in inputBoxes[row]) {
				MODULES.autoPerks.createInput(apGUI.$ratiosLine[row], item, inputBoxes[row][item], settingInputs && settingInputs[item] !== null ? settingInputs[item] : 1, universe);
				MODULES.autoPerks.GUI.inputs.push(item);
			}
			apGUI.$customRatios.appendChild(apGUI.$ratiosLine[row]);
		}

		//Creating container for both the label and the input.
		apGUI.$presetDiv = document.createElement('DIV');
		apGUI.$presetDiv.id = 'Preset Div';
		apGUI.$presetDiv.setAttribute('style', 'display: inline; width: calc(100vw/34;');

		//Setting up preset label
		apGUI.$presetLabel = document.createElement('Label');
		apGUI.$presetLabel.id = 'PresetText';
		apGUI.$presetLabel.innerHTML = '&nbsp;&nbsp;&nbsp;Preset:';
		apGUI.$presetLabel.setAttribute('style', 'margin-right: 0.5vw; color: white; font-size: 0.9vw; font-weight: lighter;');

		//Setup preset list
		var presetListHtml = '<select id="preset" onchange="fillPreset' + universe + '()" data-saved>';
		presetListHtml += '<option disabled>— Zone Progression —</option>';
		for (var item in presets.regular) presetListHtml += '<option value="' + item + '" title ="' + presets.regular[item].description + '">' + presets.regular[item].name + '</option>';
		presetListHtml += '<option disabled>— Special Purpose Presets —</option>';
		for (var item in presets.special) presetListHtml += '<option value="' + item + '" title ="' + presets.special[item].description + '">' + presets.special[item].name + '</option>';
		presetListHtml += '</select >';

		//Setting up preset dropdown
		apGUI.$preset = document.createElement('select');
		apGUI.$preset.id = 'preset';
		apGUI.$preset.setAttribute('onchange', 'fillPreset' + universe + '();');
		var oldstyle = 'text-align: center; width: 9.8vw; font-size: 0.9vw; font-weight: lighter; ';
		if (game.options.menu.darkTheme.enabled !== 2) oldstyle += ' color: black;';
		apGUI.$preset.setAttribute('style', oldstyle);
		apGUI.$preset.innerHTML = presetListHtml;

		apGUI.$presetDiv.appendChild(apGUI.$presetLabel);
		apGUI.$presetDiv.appendChild(apGUI.$preset);
		if (document.getElementById(apGUI.$presetDiv.id) === null) apGUI.$ratiosLine.row1.appendChild(apGUI.$presetDiv);
		var $portalWrapper = document.getElementById('portalWrapper');
		$portalWrapper.appendChild(apGUI.$customRatios);

		if (universe === 'Perky') {
			//If Perky hasn't been run before, finds the closest zone to your target zone that you have already completed and sets your weight to be the same as that zone range.
			if (settingInputs === null) {
				$$('#targetZone').value = Math.max(20, game.stats.highestVoidMap.valueTotal || game.global.highestLevelCleared);
				var presetToUse;
				[].slice.apply(document.querySelectorAll('#preset > *')).forEach(function (option) {
					if (parseInt(option.innerHTML.toLowerCase().replace(/[z+]/g, '').split('-')[0]) < game.global.highestLevelCleared) presetToUse = option.value;
				});
				fillPresetPerky(presetToUse);
				settingInputs = JSON.parse(localStorage.getItem(universe.toLowerCase() + 'Inputs'));
			}
			$$('#preset').value = settingInputs.preset;
			//Disable Fluffy xp input when it's not active.
			if (game.global.spiresCompleted < 2) $$('#weight-xpDiv').style.display = 'none';
		} else if (universe === 'Surky') {
			if (settingInputs === null) {
				saveSurkySettings(true);
				settingInputs = JSON.parse(localStorage.getItem(universe.toLowerCase() + 'Inputs'));
			}
			const preset = settingInputs.preset === null || settingInputs.preset === undefined ? 'ezfarm' : settingInputs.preset;
			$$('#preset').value = preset;
			$$('#radonPerRunDiv').style.display = 'none';
			$$('#findPotsDiv').style.display = preset === 'alchemy' ? 'inline' : 'none';
			$$('#trapHrsDiv').style.display = preset === 'trappa' ? 'inline' : 'none';
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
				description:
					"As a respec ONLY, optimize for maximum combat stats given current equipment and population. Coord Limited value is ignored and instead uses your save to determine how much housing perk levels are needed to buy your current coord amount. If you are in Trappa, the optimization assumes you have sent your last army so that health perks won't be applied - DO NOT USE in Trappa until after you send your last army."
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
	var linkStylesheet = document.createElement('link');
	linkStylesheet.rel = 'stylesheet';
	linkStylesheet.type = 'text/css';
	linkStylesheet.href = 'https://sadaugust.github.io/AutoTrimps/css/tabsStandalone.css';
	document.head.appendChild(linkStylesheet);

	function injectScript(id, src) {
		var script = document.createElement('script');
		script.id = id;
		script.src = src;
		script.setAttribute('crossorigin', 'anonymous');
		document.head.appendChild(script);
	}

	injectScript('AutoTrimps-SadAugust_Surky', 'https://sadaugust.github.io/AutoTrimps/modules/surky.js');

	//Load the portal UI
	setTimeout(function () {
		MODULES.autoPerks.displayGUI(portalUniverse);
		console.log('Surky & Perky loaded.');
	}, 3000);
}
