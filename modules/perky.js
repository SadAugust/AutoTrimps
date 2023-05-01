var AutoPerks = {};

function runPerky() {
	if (portalUniverse !== 1) return;
	if (JSON.parse(localStorage.getItem("perkyInputs")) === null) return;
	read_save();
	display(optimize(parse_inputs()));
	allocatePerky();
}

function allocatePerky() {
	tooltip('Import Perks', null, 'update');
	document.getElementById('perkImportBox').value = ($$("#perkstring").value)
	importPerks();
	cancelTooltip();
}

function input(a) {
	return parse_suffixes($$("#" + a).value);
}

function parse_suffixes(a) {
	a = a.replace(/\*.*|[^--9+a-z]/gi, "");
	for (var b = notations["3" === localStorage.notation ? 3 : 1], c = b.length; c > 0; --c) a = a.replace(new RegExp(b[c - 1] + "$", "i"), "E" + 3 * c);
	return +a;
}

function mastery(a) {
	if (!game.talents[a]) throw "unknown mastery: " + a;
	return game.talents[a].purchased;
}

var Perk = /** @class */ (function () {
	function Perk(base_cost, cost_increment, scaling, max_level, cost_exponent) {
		if (max_level === void 0) { max_level = Infinity; }
		if (cost_exponent === void 0) { cost_exponent = 1.3; }
		this.base_cost = base_cost;
		this.cost_increment = cost_increment;
		this.scaling = scaling;
		this.max_level = max_level;
		this.cost_exponent = cost_exponent;
		this.locked = true;
		this.level = 0;
		this.min_level = 0;
		this.cost = 0;
		this.gain = 0;
		this.bonus = 1;
		this.cost = this.base_cost;
	}
	Perk.prototype.levellable = function (he_left) {
		return !this.locked &&
			this.level < this.max_level &&
			this.cost * Math.max(1, Math.floor(this.level / 1e12)) <= he_left;
	};
	Perk.prototype.level_up = function (amount) {
		this.level += amount;
		this.bonus = this.scaling(this.level);
		if (this.cost_increment) {
			var spent = amount * (this.cost + this.cost_increment * (amount - 1) / 2);
			this.cost += amount * this.cost_increment;
			return spent;
		}
		else {
			var spent = this.cost;
			this.cost = Math.ceil(this.level / 2 + this.base_cost * Math.pow(this.cost_exponent, this.level));
			return spent;
		}
	};
	Perk.prototype.spent = function (log) {
		if (log === void 0) { log = false; }
		if (this.cost_increment)
			return this.level * (this.base_cost + this.cost - this.cost_increment) / 2;
		var total = 0;
		for (var x = 0; x < this.level; ++x)
			total += Math.ceil(x / 2 + this.base_cost * Math.pow(this.cost_exponent, x));
		return total;
	};
	Perk.prototype.log_ratio = function () {
		return this.cost_increment ? (this.scaling(1) - this.scaling(0)) / this.bonus
			: Math.log(this.scaling(this.level + 1) / this.bonus);
	};
	return Perk;
}());

var presets = {
	early: ['5', '4', '3'],
	broken: ['7', '3', '1'],
	mid: ['16', '5', '1'],
	corruption: ['25', '7', '1'],
	magma: ['35', '4', '3'],
	z280: ['42', '6', '1'],
	z400: ['88', '10', '1'],
	z450: ['500', '50', '1'],
	spire: ['0', '1', '1'],
	nerfed: ['0', '4', '3'],
	tent: ['5', '4', '3'],
	scientist: ['0', '1', '3'],
	carp: ['0', '0', '0'],
	trapper: ['0', '7', '1'],
	coord: ['0', '40', '1'],
	trimp: ['0', '99', '1'],
	metal: ['0', '7', '1'],
	c2: ['0', '7', '1'],
	income: ['0', '0', '0'],
	unesscented: ['0', '1', '0'],
	nerfeder: ['0', '1', '0'],
};

function select_preset(name, manually) {
	var _a;
	if (manually === void 0) { manually = true; }
	delete localStorage['weight-he'];
	delete localStorage['weight-atk'];
	delete localStorage['weight-hp'];
	delete localStorage['weight-xp'];
	_a = presets[name],
		$$('#weight-he').value = _a[0],
		$$('#weight-atk').value = _a[1],
		$$('#weight-hp').value = _a[2];
	$$('#weight-xp').value = Math.floor((+presets[name][0] + +presets[name][1] + +presets[name][2]) / 5).toString();
	savePerkySettings();
}

function auto_preset() {
	var perkyInputs = JSON.parse(localStorage.getItem("perkyInputs"));

	var _a = presets[$$('#preset').value], he = _a[0], atk = _a[1], hp = _a[2];
	var xp = floor((+he + +atk + +hp) / 5).toString();
	$$('#weight-he').value = perkyInputs['weight-he'] || he;
	$$('#weight-atk').value = perkyInputs['weight-atk'] || atk;
	$$('#weight-hp').value = perkyInputs['weight-hp'] || hp;
	$$('#weight-xp').value = perkyInputs['weight-xp'] || xp;
}

function update_dg() {
	var max_zone = (game.stats.highestLevel.valueTotal()) / 2 + 115;
	var eff = 500e6 + 50e6 * game.generatorUpgrades.Efficiency.upgrades;
	var capa = 3 + 0.4 * game.generatorUpgrades.Capacity.upgrades;
	var max_fuel = game.permanentGeneratorUpgrades.Storage.owned ? capa * 1.5 : capa;
	var supply = 230 + 2 * game.generatorUpgrades.Supply.upgrades;
	var overclock = game.generatorUpgrades.Overclocker.upgrades;
	overclock = overclock && (1 - 0.5 * Math.pow(0.99, overclock - 1));
	var burn = game.permanentGeneratorUpgrades.Slowburn.owned ? 0.4 : 0.5;
	var cells = mastery('magmaFlow') ? 18 : 16;
	var accel = mastery('quickGen') ? 1.03 : 1.02;
	var hs2 = mastery('hyperspeed2') ? (game.stats.highestLevel.valueTotal()) / 2 : 0;
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

		while (fuel > max_fuel)
			tick(overclock)

		housing *= 1.009;
	}

	while (fuel >= burn)
		tick(1);

	return housing;
}

function read_save() {
	var settings = JSON.parse(localStorage.getItem("perkyInputs"));
	var zone = game.stats.highestVoidMap.valueTotal || game.global.highestLevelCleared;

	if (!settings.preset) {
		$$$('#preset > *').forEach(function (option) {
			option.selected = parseInt(option.innerHTML.replace('z', '')) < game.global.highestLevelCleared;
		});
		auto_preset();
	}

	// He / unlocks
	var helium = game.global.heliumLeftover;
	for (var perk in game.portal)
		helium += (game.portal[perk].heliumSpent || 0);

	var unlocks = Object.keys(game.portal).filter(perk => !game.portal[perk].locked && game.portal[perk].level !== undefined);
	if (!game.global.canRespecPerks)
		unlocks = unlocks.map(perk => perk + '>' + (game.portal[perk].level || 0));

	// Income
	var tt = mastery('turkimp2') ? 1 : mastery('turkimp') ? 0.4 : 0.25;
	var prod = 1 + tt;
	var loot = 1 + 0.333 * tt;
	var spires = Math.min(Math.floor((zone - 101) / 100), game.global.spiresCompleted);
	loot *= zone < 100 ? 0.7 : 1 + (mastery('stillRowing') ? 0.3 : 0.2) * spires;
	loot *= zone < 100 ? 0.7 : 1 + (mastery('stillRowing') ? 0.3 : 0.2) * spires;

	var chronojest = 27 * game.unlocks.imps.Jestimp + 15 * game.unlocks.imps.Chronoimp;
	var cache = zone < 60 ? 0 : zone < 85 ? 7 : zone < 160 ? 10 : zone < 185 ? 14 : 20;

	for (var mod of (game.global.StaffEquipped.mods || [])) {
		if (mod[0] === 'MinerSpeed')
			prod *= 1 + 0.01 * mod[1];
		else if (mod[0] === 'metalDrop')
			loot *= 1 + 0.01 * mod[1];
	}

	chronojest += (mastery('mapLoot2') ? 5 : 4) * cache;

	// Fill the fields
	update_dg();
	$$('#unlocks').value = unlocks.join(',');
	$$('#chronojest').value = chronojest;
	$$('#prod').value = prod;
	$$('#loot').value = loot;
}

function parse_inputs() {

	read_save();
	var preset = $$('#preset').value;
	savePerkySettings();
	if (preset == 'trapper' && (!game || game.global.challengeActive != 'Trapper'))
		throw 'This preset requires a save currently running Trapper². Start a new run using “Trapper² (initial)”, export, and try again.';
	var result = {
		total_he: (countHeliumSpent() + game.global.heliumLeftover + game.resources.helium.owned) - (!portalWindowOpen ? game.resources.helium.owned : 0),
		zone: game.stats.highestLevel.valueTotal(),
		perks: parse_perks('', $$('#unlocks').value),
		weight: {
			helium: Number(input("weight-he")),
			attack: Number(input("weight-atk")),
			health: Number(input("weight-hp")),
			xp: Number(input("weight-xp")),
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
			dg: preset == 'nerfed' ? 0 : Number(update_dg()),
			tent_city: preset == 'tent',
			whip: game.unlocks.imps.Whipimp,
			magn: game.unlocks.imps.Magnimp,
			taunt: game.unlocks.imps.Tauntimp,
			ven: game.unlocks.imps.Venimp,
			chronojest: input('chronojest'),
			prod: input('prod'),
			loot: input('loot'),
			breed_timer: (mastery('patience') ? 45 : 30),
		}
	};
	if (preset == 'nerfed') {
		result.total_he = 99990000;
		result.zone = 200;
		result.mod.dg = 0;
	}
	if (preset == 'trapper') {
		result.mod.soldiers = game.resources.trimps.owned;
		result.mod.prod = 0;
		result.perks.Pheromones.max_level = 0;
		result.perks.Anticipation.max_level = 0;
	}
	if (preset == 'spire') {
		result.mod.prod = result.mod.loot = 0;
		result.perks.Overkill.max_level = 0;
		if (game)
			result.zone = game.global.world;
	}
	if (preset == 'carp') {
		result.mod.prod = result.mod.loot = 0;
		result.weight.trimps = 1e6;
	}
	if (preset == 'metal')
		result.mod.prod = 0;
	if (preset == 'trimp')
		result.mod.soldiers = 1;
	if (preset == 'nerfed')
		result.perks.Overkill.max_level = 1;
	if (preset == 'scientist')
		result.perks.Coordinated.max_level = 0;
	if (preset == 'income')
		result.weight = { income: 3, trimps: 3, attack: 1, helium: 0, health: 0, xp: 0 };
	if (preset == 'unesscented') {
		result.total_he = 0;
		result.zone = 181;
	}
	if (preset == 'nerfeder') {
		result.total_he = 999900000;
		result.zone = 300;
	}
	return result;
}

function parse_perks(fixed, unlocks) {
	var add = function (x) { return function (level) { return 1 + x * 0.01 * level; }; };
	var mult = function (x) { return function (level) { return Math.pow(1 + x * 0.01, level); }; };
	var perks = {
		Looting_II: new Perk(100e3, 10e3, add(0.25)),
		Carpentry_II: new Perk(100e3, 10e3, add(0.25)),
		Motivation_II: new Perk(50e3, 1e3, add(1)),
		Power_II: new Perk(20e3, 500, add(1)),
		Toughness_II: new Perk(20e3, 500, add(1)),
		Capable: new Perk(1e8, 0, function (l) { return 1; }, 10, 10),
		Cunning: new Perk(1e11, 0, add(25)),
		Curious: new Perk(1e14, 0, add(160)),
		Classy: new Perk(1e17, 0, mult(4.5678375), 75),
		Overkill: new Perk(1e6, 0, add(500), 30),
		Resourceful: new Perk(50e3, 0, mult(-5)),
		Coordinated: new Perk(150e3, 0, mult(-2)),
		Siphonology: new Perk(100e3, 0, function (l) { return Math.pow(1 + l, 0.1); }, 3),
		Anticipation: new Perk(1000, 0, add(6), 10),
		Resilience: new Perk(100, 0, mult(10)),
		Meditation: new Perk(75, 0, add(1), 7),
		Relentlessness: new Perk(75, 0, function (l) { return 1 + 0.05 * l * (1 + 0.3 * l); }, 10),
		Carpentry: new Perk(25, 0, mult(10)),
		Artisanistry: new Perk(15, 0, mult(-5)),
		Range: new Perk(1, 0, add(1), 10),
		Agility: new Perk(4, 0, mult(-5), 20),
		Bait: new Perk(4, 0, add(100)),
		Trumps: new Perk(3, 0, add(20)),
		Pheromones: new Perk(3, 0, add(10)),
		Packrat: new Perk(3, 0, add(20)),
		Motivation: new Perk(2, 0, add(5)),
		Power: new Perk(1, 0, add(5)),
		Toughness: new Perk(1, 0, add(5)),
		Looting: new Perk(1, 0, add(5)),
	};
	if (unlocks == '*')
		unlocks = Object.keys(perks).join(',');
	if (!unlocks.match(/>/))
		unlocks = unlocks.replace(/(?=,|$)/g, '>0');
	var _loop_1 = function (item) {
		var m = item.match(/(\S+) *([<=>])=?(.*)/);
		if (!m)
			throw 'Enter a list of perk levels, such as “power=42, toughness=51”.';
		var tier2 = m[1].match(/2$|II$/i);
		var name = m[1].replace(/[ _]?(2|II)/i, '').replace(/^OK/i, 'O').replace(/^Looty/i, 'L');
		var regex = new RegExp("^".concat(name, "[a-z]*").concat(tier2 ? '_II' : '', "$"), 'i');
		var matches = Object.keys(perks).filter(function (p) { return p.match(regex); });
		if (matches.length > 1)
			throw "Ambiguous perk abbreviation: ".concat(m[1], ".");
		if (matches.length < 1)
			throw "Unknown perk: ".concat(m[1], ".");
		var level = parse_suffixes(m[3]);
		if (!isFinite(level))
			throw "Invalid number: ".concat(m[3], ".");
		perks[matches[0]].locked = false;
		if (m[2] != '>')
			perks[matches[0]].max_level = level;
		if (m[2] != '<')
			perks[matches[0]].min_level = level;
	};
	for (var _i = 0, _a = (unlocks + ',' + fixed).split(/,/).filter(function (x) { return x; }); _i < _a.length; _i++) {
		var item = _a[_i];
		_loop_1(item);
	}
	return perks;
}

function loadPerkySettings() {

	var perkyInputs = JSON.parse(localStorage.getItem("perkyInputs"));
	if (perkyInputs === null) {
		if (typeof (autoTrimpSettings) !== 'undefined') {
			var atSetting = JSON.parse(autoTrimpSettings['autoAllocatePresets'].value);
			if (atSetting !== '{"":""}') {
				perkyInputs = atSetting;
				localStorage.setItem("perkyInputs", JSON.stringify(perkyInputs));
			}
		}
		if (surkyInputs === null) {
			return;
		}
	}
	$$('#preset').value = perkyInputs.preset;
	$$('#weight-he').value = Number(perkyInputs['weight-he']);
	$$('#weight-atk').value = Number(perkyInputs['weight-atk']);
	$$('#weight-hp').value = Number(perkyInputs['weight-hp']);
	$$('#weight-xp').value = Number(perkyInputs['weight-xp']);
}

function savePerkySettings() {

	const perkyInputs = {
		preset: $$('#preset').value,
		'weight-he': $$('#weight-he').value,
		'weight-atk': $$('#weight-atk').value,
		'weight-hp': $$('#weight-hp').value,
		'weight-xp': $$('#weight-xp').value
	}
	localStorage.setItem("perkyInputs", JSON.stringify(perkyInputs));
	if (typeof (autoTrimpSettings) !== 'undefined') {
		autoTrimpSettings['autoAllocatePresets'].valueU2 = JSON.stringify(perkyInputs);
		saveSettings();
	}
}

function display(results) {
	var perks = results[1];
	for (var name in perks)
		perks[name] = perks[name].level;
	$$('#perkstring').value = LZString.compressToBase64(JSON.stringify(perks));
}

function optimize(params) {
	var total_he = params.total_he, zone = params.zone, fluffy = params.fluffy, perks = params.perks, weight = params.weight, mod = params.mod;
	var he_left = total_he;
	var Looting_II = perks.Looting_II, Carpentry_II = perks.Carpentry_II, Motivation_II = perks.Motivation_II, Power_II = perks.Power_II, Toughness_II = perks.Toughness_II, Capable = perks.Capable, Cunning = perks.Cunning, Curious = perks.Curious, Classy = perks.Classy, Overkill = perks.Overkill, Resourceful = perks.Resourceful, Coordinated = perks.Coordinated, Siphonology = perks.Siphonology, Anticipation = perks.Anticipation, Resilience = perks.Resilience, Meditation = perks.Meditation, Relentlessness = perks.Relentlessness, Carpentry = perks.Carpentry, Artisanistry = perks.Artisanistry, Range = perks.Range, Agility = perks.Agility, Bait = perks.Bait, Trumps = perks.Trumps, Pheromones = perks.Pheromones, Packrat = perks.Packrat, Motivation = perks.Motivation, Power = perks.Power, Toughness = perks.Toughness, Looting = perks.Looting;
	for (var _i = 0, _a = ['whip', 'magn', 'taunt', 'ven']; _i < _a.length; _i++) {
		var name = _a[_i];
		mod[name] = Math.pow(1.003, zone * 99 * 0.03 * mod[name]);
	}
	var books = Math.pow(1.25, zone) * Math.pow(zone > 100 ? 1.28 : 1.2, Math.max(zone - 59, 0));
	var gigas = Math.max(0, Math.min(zone - 60, zone / 2 - 25, zone / 3 - 12, zone / 5, zone / 10 + 17, 39));
	var base_housing = Math.pow(1.25, 5 + Math.min(zone / 2, 30) + gigas);
	var mystic = zone >= 25 ? Math.floor(Math.min(zone / 5, 9 + zone / 25, 15)) : 0;
	var tacular = (20 + zone - zone % 5) / 100;
	var base_income = 600 * mod.whip * books;
	var base_helium = Math.pow(zone - 19, 2);
	var max_tiers = zone / 5 + +((zone - 1) % 10 < 5);
	var exponents = {
		cost: Math.pow(1.069, 0.85 * (zone < 60 ? 57 : 53)),
		attack: Math.pow(1.19, 13),
		health: Math.pow(1.19, 14),
		block: Math.pow(1.19, 10),
	};
	var equip_cost = {
		attack: 211 * (weight.attack + weight.health) / weight.attack,
		health: 248 * (weight.attack + weight.health) / weight.health,
		block: 5 * (weight.attack + weight.health) / weight.health,
	};
	// Number of ticks it takes to one-shot an enemy.
	function ticks() {
		return 1 + +(Agility.bonus > 0.9) + Math.ceil(10 * Agility.bonus);
	}
	function moti() {
		return Motivation.bonus * Motivation_II.bonus * Meditation.bonus;
	}
	var looting = function () { return Looting.bonus * Looting_II.bonus; };
	function gem_income() {
		var drag = moti() * mod.whip;
		var loot = looting() * mod.magn * 0.75 * 0.8;
		var chronojest = mod.chronojest * drag * loot / 30;
		return drag + loot + chronojest;
	}
	// Max population
	var trimps = mod.tent_city ? function () {
		var carp = Carpentry.bonus * Carpentry_II.bonus;
		var territory = Trumps.bonus;
		return 10 * (mod.taunt + territory * (mod.taunt - 1) * 111) * carp;
	} : function () {
		var carp = Carpentry.bonus * Carpentry_II.bonus;
		var bonus = 3 + Math.log(base_housing * gem_income() / Resourceful.bonus) / Math.log(1.4);
		var territory = Trumps.bonus * zone;
		return 10 * (base_housing * bonus + territory) * carp * mod.taunt + mod.dg * carp;
	};
	function income(ignore_prod) {
		var storage = mod.storage * Resourceful.bonus / Packrat.bonus;
		var loot = looting() * mod.magn / ticks();
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
		return Math.log(1 + income(true) * (exp - 1) / cost) / Math.log(exp);
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
		for (var i = 0; i < available_coords; ++i)
			result = Math.ceil(result * ratio_1);
		group_size[coord] = result;
	}
	// Strength multiplier from coordinations
	function soldiers() {
		var ratio = 1 + 0.25 * Coordinated.bonus;
		var pop = (mod.soldiers || trimps()) / 3;
		if (mod.soldiers > 1)
			pop += 36000 * Bait.bonus;
		var unbought_coords = Math.max(0, Math.log(group_size[Coordinated.level] / pop) / Math.log(ratio));
		return group_size[0] * Math.pow(1.25, -unbought_coords);
	}
	// Fracional number of Amalgamators expected
	function gators() {
		if (zone < 230 || mod.soldiers > 1)
			return 0;
		var ooms = Math.log(trimps() / group_size[Coordinated.level]) / Math.log(10);
		return Math.max(0, (ooms - 7 + Math.floor((zone - 215) / 100)) / 3);
	}
	// Total attack
	function attack() {
		var attack = (0.15 + equip('attack')) * Math.pow(0.8, magma());
		attack *= Power.bonus * Power_II.bonus * Relentlessness.bonus;
		attack *= Siphonology.bonus * Range.bonus * Anticipation.bonus;
		attack *= fluffy.attack[Capable.level];
		attack *= (game && mastery('amalg')) ? Math.pow(1.5, gators()) : 1 + 0.5 * gators();
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
		if (zone < 70) { // no geneticists
			// number of ticks needed to repopulate an army
			var timer = Math.log(1 + soldiers() * breed() / Bait.bonus) / Math.log(1 + breed());
			attacks = timer / ticks();
		}
		else { // geneticists
			var fighting = Math.min(group_size[Coordinated.level] / trimps(), 1 / 3);
			var target_speed = fighting > 1e-9 ?
				(Math.pow(0.5 / (0.5 - fighting), 0.1 / mod.breed_timer) - 1) * 10 :
				fighting / mod.breed_timer;
			var geneticists = Math.log(breed() / target_speed) / -Math.log(0.98);
			health *= Math.pow(1.01, geneticists);
			health *= Math.pow(1.332, gators());
		}
		health /= attacks;
		if (zone < 60)
			block += equip('block');
		else
			block = Math.min(block, 4 * health);
		return soldiers() * (block + health);
	}
	var xp = function () { return Cunning.bonus * Curious.bonus * Classy.bonus; };
	var agility = function () { return 1 / Agility.bonus; };
	var helium = function () { return base_helium * looting() + 45; };
	var overkill = function () { return Overkill.bonus; };
	var stats = { agility: agility, helium: helium, xp: xp, attack: attack, health: health, overkill: overkill, trimps: trimps, income: income };
	function score() {
		var result = 0;
		for (var i in weight) {
			if (!weight[i])
				continue;
			var stat = stats[i]();
			if (!isFinite(stat))
				throw Error(i + ' is ' + stat);
			result += weight[i] * Math.log(stat);
		}
		return result;
	}
	function recompute_marginal_efficiencies() {
		var baseline = score();
		for (var name in perks) {
			var perk = perks[name];
			if (perk.cost_increment || !perk.levellable(he_left))
				continue;
			perk.level_up(1);
			perk.gain = score() - baseline;
			perk.level_up(-1);
		}
		for (var _i = 0, _a = ['Looting', 'Carpentry', 'Motivation', 'Power', 'Toughness']; _i < _a.length; _i++) {
			var name = _a[_i];
			perks[name + '_II'].gain = perks[name].gain * perks[name + '_II'].log_ratio() / perks[name].log_ratio();
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
		}
		else {
			budget = Math.pow(budget, 0.5);
			do
				he_left -= perk.level_up(1);
			while (perk.cost < budget && perk.level < perk.max_level);
		}
		perk.gain *= perk.log_ratio();
	}
	mod.loot *= 20.8; // TODO: check that this is correct
	weight.agility = (weight.helium + weight.attack) / 2;
	weight.overkill = 0.25 * weight.attack * (2 - Math.pow(0.9, weight.helium / weight.attack));
	if (zone > 90 && mod.soldiers <= 1 && Bait.min_level == 0)
		Bait.max_level = 0;
	// Fluffy
	fluffy.attack = [];
	var potential = Math.log(0.003 * fluffy.xp / Math.pow(5, fluffy.prestige) + 1) / Math.log(4);
	for (var cap = 0; cap <= 10; ++cap) {
		var level = Math.min(Math.floor(potential), cap);
		var progress = level == cap ? 0 : (Math.pow(4, potential - level) - 1) / 3;
		fluffy.attack[cap] = 1 + Math.pow(5, fluffy.prestige) * 0.1 * (level / 2 + progress) * (level + 1);
	}
	// Minimum levels on perks
	for (var name in perks) {
		var perk = perks[name];
		if (perk.cost_increment)
			he_left -= perk.level_up(perk.min_level);
		else
			while (perk.level < perk.min_level)
				he_left -= perk.level_up(1);
	}
	var ratio = 0.25;
	while (Capable.levellable(he_left * ratio)) {
		he_left -= Capable.level_up(1);
		ratio = Capable.level <= Math.floor(potential) && zone > 300 && weight.xp > 0 ? 0.25 : 0.01;
	}
	if (zone <= 300 || potential >= Capable.level)
		weight.xp = 0;
	if (he_left < 0)
		throw (game && game.global.canRespecPerks) ?
			"You don’t have enough Helium to afford your Fixed Perks." :
			"You don’t have a respec available.";
	// Main loop
	var sorted_perks = Object.keys(perks).map(function (name) { return perks[name]; }).filter(function (perk) { return perk.levellable(he_left); });
	var reference_he = he_left;
	for (var x = 0.999; x > 1e-12; x *= x) {
		var he_target = reference_he * x;
		recompute_marginal_efficiencies();
		sorted_perks.sort(function (a, b) { return b.gain / b.cost - a.gain / a.cost; });
		while (he_left > he_target && sorted_perks.length) {
			var best = sorted_perks.shift();
			if (!best.levellable(he_left))
				continue;
			spend_he(best, he_left - he_target);
			// sorted_perks.splice(sorted_perks.findIndex(p => p.gain / p.cost > best.gain / best.cost), 0, best);
			var i = 0;
			while (sorted_perks[i] && sorted_perks[i].gain / sorted_perks[i].cost > best.gain / best.cost)
				i++;
			sorted_perks.splice(i, 0, best);
		}
	}
	if (he_left + 1 < total_he / 1e12 && Toughness_II.level > 0) {
		--Toughness_II.level;
		he_left += Toughness_II.cost;
	}
	return [he_left, perks];
}


$$ = function (a) {
	return document.querySelector(a);
}
$$$ = function (a) {
	return [].slice.apply(document.querySelectorAll(a));
};


var notations = [
	[],
	"KMBTQaQiSxSpOcNoDcUdDdTdQadQidSxdSpdOdNdVUvDvTvQavQivSxvSpvOvNvTgUtgDtgTtgQatgQitgSxtgSptgOtgNtgQaaUqaDqaTqaQaqaQiqaSxqaSpqaOqaNqaQiaUqiDqiTqiQaqiQiqiSxqiSpqiOqiNqiSxaUsxDsxTsxQasxQisxSxsxSpsxOsxNsxSpaUspDspTspQaspQispSxspSpspOspNspOgUogDogTogQaogQiogSxogSpogOogNogNaUnDnTnQanQinSxnSpnOnNnCtUc".split(
		/(?=[A-Z])/
	),
	[],
	"a b c d e f g h i j k l m n o p q r s t u v w x y z aa ab ac ad ae af ag ah ai aj ak al am an ao ap aq ar as at au av aw ax ay az ba bb bc bd be bf bg bh bi bj bk bl bm bn bo bp bq br bs bt bu bv bw bx by bz ca cb cc cd ce cf cg ch ci cj ck cl cm cn co cp cq cr cs ct cu cv cw cx".split(
		" "
	),
	"KMBTQaQiSxSpOcNoDcUdDdTdQadQidSxdSpdOdNdVUvDvTvQavQivSxvSpvOvNvTg".split(/(?=[A-Z])/),
	[],
];

var showingPerky = false;

function setupPerkyUI() {

	if (portalUniverse !== 1) return;
	AutoPerks = {};

	var presetListHtml =
		"<select id=\"preset\" onchange=\"select_preset(this.value)\" data-saved>\
			\
			<option disabled>— Select a Preset —</option>\
			<option value=\"early\">z1–59</option>\
			<option value=\"broken\">z60–99</option>\
			<option value=\"mid\">z100–180</option>\
			<option value=\"corruption\">z181–229</option>\
			<option value=\"magma\">z230–280</option>\
			<option value=\"z280\">z280–400</option>\
			<option value=\"z400\">z400–450</option>\
			<option value=\"z450\">z450+</option>\
			<option disabled>— Special-purpose presets —</option>\
			<option value=\"spire\" data-hide=\"200\">Spire respec</option>\
			<option value=\"nerfed\">Nerfed feat</option>\
			<option value=\"tent\">Tent City feat</option>\
			<option value=\"scientist\">Scientist challenge</option>\
			<option value=\"carp\" data-hide=\"65\">Trapper² (initial)</option>\
			<option value=\"trapper\" data-hide=\"65\">Trapper² (respec)</option>\
			<option value=\"coord\" data-hide=\"65\">Coordinate²</option>\
			<option value=\"trimp\" data-hide=\"65\">Trimp²</option>\
			<option value=\"metal\" data-hide=\"65\">Metal²</option>\
			<option value=\"c2\" data-hide=\"65\">Other c²</option>\
			<option value=\"income\">Income</option>\
			<option value=\"unesscented\">Unesscented</option>\
			<option value=\"nerfeder\">Nerfeder</option>\
		</select>";

	AutoPerks.createInput = function (perkname, div, id) {
		var perk1input = document.createElement("Input");
		perk1input.id = perkname;
		var oldstyle = 'text-align: center; width: calc(100vw/36); font-size: 1.0vw; ';
		if (game.options.menu.darkTheme.enabled != 2) perk1input.setAttribute("style", oldstyle + " color: black;");
		else perk1input.setAttribute('style', oldstyle);
		perk1input.setAttribute('class', 'perkRatios');
		perk1input.setAttribute('onchange', 'parse_inputs()');
		var perk1label = document.createElement("Label");
		if (!id) perk1label.id = perkname + 'Label';
		else perk1label.id = id;
		perk1label.innerHTML = perkname;
		if (!id) perk1label.innerHTML = perkname;
		else perk1label.innerHTML = id;
		perk1label.setAttribute('style', 'margin-right: 0.7vw; width: calc(100vw/12); color: white; font-size: 0.9vw; font-weight: lighter; margin-left: 0.3vw; ');
		div.appendChild(perk1label);
		div.appendChild(perk1input);
	}

	AutoPerks.GUI = {};

	AutoPerks.removeGUI = function () {
		Object.keys(AutoPerks.GUI).forEach(function (key) {
			var $$elem = AutoPerks.GUI[key];
			if (!$$elem) {
				console.log("error in: " + key);
				return;
			}
			if ($$elem.parentNode) {
				$$elem.parentNode.removeChild($$elem);
				delete $elem;
			}
		});
		showingPerky = false;
	}

	AutoPerks.displayGUI = function () {

		var perkyInputs = JSON.parse(localStorage.getItem("perkyInputs"));
		if (perkyInputs === null && typeof (autoTrimpSettings) !== 'undefined') {
			var atSetting = JSON.parse(autoTrimpSettings['autoAllocatePresets'].value);
			if (atSetting !== '{"":""}') {
				perkyInputs = atSetting;
				localStorage.setItem("perkyInputs", JSON.stringify(perkyInputs));
			}
		}

		var apGUI = AutoPerks.GUI;
		var $buttonbar = document.getElementById("portalBtnContainer");
		apGUI.$allocatorBtn1 = document.createElement("DIV");
		apGUI.$allocatorBtn1.id = 'allocatorBtn1';
		apGUI.$allocatorBtn1.setAttribute('class', 'btn inPortalBtn settingsBtn settingBtntrue');
		apGUI.$allocatorBtn1.setAttribute('onclick', 'runPerky()');
		apGUI.$allocatorBtn1.textContent = 'Allocate Perks';
		$buttonbar.appendChild(apGUI.$allocatorBtn1);
		$buttonbar.setAttribute('style', 'margin-bottom: 0.8vw;');
		apGUI.$customRatios = document.createElement("DIV");
		apGUI.$customRatios.id = 'customRatios';
		//Line 1 of the UI
		apGUI.$ratiosLine1 = document.createElement("DIV");
		apGUI.$ratiosLine1.setAttribute('style', 'display: inline-block; text-align: center; width: 100%');
		var listratiosTitle1 = ["Weight: Helium", "Weight: Attack", "Weight: Health", "Weight: Fluffy"];
		var listratiosLine1 = ["weight-he", "weight-atk", "weight-hp", "weight-xp"];
		for (var i in listratiosLine1)
			AutoPerks.createInput(listratiosLine1[i], apGUI.$ratiosLine1, listratiosTitle1[i]);
		apGUI.$customRatios.appendChild(apGUI.$ratiosLine1);

		//Hide these elements - Line 2
		apGUI.$ratiosLine2 = document.createElement("DIV");
		apGUI.$ratiosLine2.setAttribute('style', 'display: none; text-align: left; width: 100%');
		var listratiosTitle2 = ["Production Mod", "Loot Mod"];
		var listratiosLine2 = ["prod", "loot", "unlocks", "chronojest", 'perkstring'];
		for (var i in listratiosLine2)
			AutoPerks.createInput(listratiosLine2[i], apGUI.$ratiosLine2, listratiosTitle2[i]);

		apGUI.$presetLabel = document.createElement("Label");
		apGUI.$presetLabel.id = 'Ratio Preset Label';
		apGUI.$presetLabel.innerHTML = "&nbsp;&nbsp;&nbsp;Preset:";
		apGUI.$presetLabel.setAttribute('style', 'margin-right: 0.5vw; color: white; font-size: 0.9vw;');
		apGUI.$preset = document.createElement("select");
		apGUI.$preset.id = 'preset';
		apGUI.$preset.setAttribute('onchange', 'select_preset(this.value)');
		var oldstyle = 'text-align: center; width: 8vw; font-size: 0.8vw; font-weight: lighter; ';
		if (game.options.menu.darkTheme.enabled != 2) apGUI.$preset.setAttribute("style", oldstyle + " color: black;");
		else apGUI.$preset.setAttribute('style', oldstyle);
		apGUI.$preset.innerHTML = presetListHtml;

		apGUI.$ratiosLine1.appendChild(apGUI.$presetLabel);
		apGUI.$ratiosLine1.appendChild(apGUI.$preset);
		apGUI.$customRatios.appendChild(apGUI.$ratiosLine2);
		var $portalWrapper = document.getElementById("portalWrapper")
		$portalWrapper.appendChild(apGUI.$customRatios);
		loadPerkySettings();
		showingPerky = true;
	}

	AutoPerks.displayGUI();
}