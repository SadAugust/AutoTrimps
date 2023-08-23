if (typeof MODULES !== 'object') MODULES = {};
MODULES.autoPerks = {};
MODULES.perky = {};
MODULES.perky.props = {};
MODULES.perky.showing = false;

function runPerky() {
	if (portalUniverse !== 1) return;
	//If Perky hasn't been run before, finds the closest zone to your target zone that you have already completed and sets your weight to be the same as that zone range.
	if (JSON.parse(localStorage.getItem("perkyInputs")) === null) selectPerkyPreset();
	allocatePerky();
}

function allocatePerky() {

	//Enable Fluffy xp input when it's not active.
	if (game.global.spiresCompleted >= 2) {
		$$('#weight-xpDiv').style.display = 'inline';
	}

	tooltip('Import Perks', null, 'update');
	document.getElementById('perkImportBox').value = display(optimize(parse_inputs(read_save())));
	importPerks();
	cancelTooltip();
}

function input(a) {
	return parse_suffixes($$("#" + a).value);
}

function parse_suffixes(a) {
	a = a.replace(/\*.*|[^--9+a-z]/gi, "");
	for (var b = MODULES.perky.notations["3" === localStorage.notation ? 3 : 1], c = b.length; c > 0; --c) a = a.replace(new RegExp(b[c - 1] + "$", "i"), "E" + 3 * c);
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

// initialize perks object to default values
function initPresetPerky() {
	var perkyInputs = JSON.parse(localStorage.getItem("perkyInputs"));

	function presetData(preset, perkyInputs) {
		if (perkyInputs === null) return null;
		if (perkyInputs[preset] === null || perkyInputs[preset] === undefined) return null;
		return perkyInputs[preset];
	}

	MODULES.perky.props = {
		// memoization table for trinket drops
		heliumWeight: Number($$('#weight-he').value),
		attackWeight: Number($$('#weight-atk').value),
		healthWeight: Number($$('#weight-hp').value),
		xpWeight: Number($$('#weight-xp').value),

		early: presetData('early', perkyInputs),
		broken: presetData('broken', perkyInputs),
		mid: presetData('mid', perkyInputs),
		corruption: presetData('corruption', perkyInputs),

		magma: presetData('magma', perkyInputs),
		z280: presetData('z280', perkyInputs),
		z400: presetData('z400', perkyInputs),
		z450: presetData('z450', perkyInputs),

		spire: presetData('spire', perkyInputs),
		trapper: presetData('trapper', perkyInputs),
		coord: presetData('coord', perkyInputs),
		trimp: presetData('trimp', perkyInputs),
		metal: presetData('metal', perkyInputs),
		c2: presetData('c2', perkyInputs),
	};
	var newSave = false;
	if (perkyInputs === null) {
		perkyInputs = {};
	}

	if (perkyInputs['weight-he'] === null || isNaN(perkyInputs['weight-he'])) {
		perkyInputs['weight-he'] = 1;
	} if (perkyInputs['weight-atk'] === null || isNaN(perkyInputs['weight-atk'])) {
		perkyInputs['weight-atk'] = 1;
	} if (perkyInputs['weight-hp'] === null || isNaN(perkyInputs['weight-hp'])) {
		perkyInputs['weight-hp'] = 1;
	} if (perkyInputs['weight-xp'] === null || isNaN(perkyInputs['weight-xp'])) {
		perkyInputs['weight-xp'] = 1;
	}

	if (newSave) {
		localStorage.setItem("perkyInputs", JSON.stringify(perkyInputs));
	}
}

// fill preset weights from the dropdown menu
function fillPresetPerky(specificPreset) {
	if (specificPreset) $$('#presetElem').value = specificPreset

	initPresetPerky();

	var preset = $$('#presetElem').value;
	var weights = [0, 0, 0];
	if (preset === 'early') {
		weights = (MODULES.perky.props.early === null) ? [5, 4, 3, 2.4] : MODULES.perky.props.early;
	} else if (preset === 'broken') {
		weights = (MODULES.perky.props.broken === null) ? [7, 3, 1, 2.2] : MODULES.perky.props.broken;
		// with GU recommendations, we want a big Rn weight
	} else if (preset === 'mid') {
		weights = (MODULES.perky.props.mid === null) ? [16, 5, 1, 4.4] : MODULES.perky.props.mid;
	} else if (preset === 'corruption') {
		weights = (MODULES.perky.props.corruption === null) ? [25, 7, 1, 6.6] : MODULES.perky.props.corruption;
	} else if (preset === 'magma') {
		weights = (MODULES.perky.props.magma === null) ? [35, 4, 3, 8] : MODULES.perky.props.magma;
	} else if (preset === 'z280') {
		weights = (MODULES.perky.props.z280 === null) ? [42, 6, 1, 10] : MODULES.perky.props.z280;
	} else if (preset === 'z400') {
		weights = (MODULES.perky.props.z400 === null) ? [88, 10, 1, 20] : MODULES.perky.props.z400;
	} else if (preset === 'z450') {
		weights = (MODULES.perky.props.z450 === null) ? [500, 50, 1, 110] : MODULES.perky.props.z450;
	} else if (preset === 'spire') {
		weights = (MODULES.perky.props.spire === null) ? [0, 1, 1, 0] : MODULES.perky.props.spire;
	} else if (preset === 'nerfed') {
		weights = [0, 4, 3, 0];
	} else if (preset === 'tent') {
		weights = [5, 4, 3, 0];
	} else if (preset === 'scientist') {
		weights = [0, 1, 3, 0];
	} else if (preset === 'carp') {
		weights = [0, 0, 0, 0];
	} else if (preset === 'trapper') {
		weights = (MODULES.perky.props.trapper === null) ? [0, 7, 1, 0] : MODULES.perky.props.trapper;
	} else if (preset === 'coord') {
		weights = (MODULES.perky.props.coord === null) ? [0, 40, 1, 0] : MODULES.perky.props.coord;
	} else if (preset === 'trimp') {
		weights = (MODULES.perky.props.trimp === null) ? [0, 99, 1, 0] : MODULES.perky.props.trimp;
	} else if (preset === 'metal') {
		weights = (MODULES.perky.props.metal === null) ? [0, 7, 1, 0] : MODULES.perky.props.metal;
	} else if (preset === 'c2') {
		weights = (MODULES.perky.props.c2 === null) ? [0, 7, 1, 0] : MODULES.perky.props.c2;
	} else if (preset === 'income') {
		weights = [0, 0, 0, 0];
	} else if (preset === 'unesscented') {
		weights = [0, 1, 0, 0];
	} else if (preset === 'nerfeder') {
		weights = [0, 1, 0, 0];
	}

	// set special optimizations
	$$('#weight-he').value = weights[0];
	$$('#weight-atk').value = weights[1];
	$$('#weight-hp').value = weights[2];
	$$('#weight-xp').value = weights[3];
	savePerkySettings();
	initialPresetLoad();
}

function initialPresetLoad() {
	var preset = $$('#presetElem').value;

	if (preset === 'early') {
		MODULES.perky.props.early = [MODULES.perky.props.heliumWeight, MODULES.perky.props.attackWeight, MODULES.perky.props.healthWeight, MODULES.perky.props.xpWeight];
	} else if (preset === 'broken') {
		MODULES.perky.props.broken = [MODULES.perky.props.heliumWeight, MODULES.perky.props.attackWeight, MODULES.perky.props.healthWeight, MODULES.perky.props.xpWeight];
	} else if (preset === 'mid') {
		MODULES.perky.props.mid = [MODULES.perky.props.heliumWeight, MODULES.perky.props.attackWeight, MODULES.perky.props.healthWeight, MODULES.perky.props.xpWeight];
	} else if (preset === 'corruption') {
		MODULES.perky.props.corruption = [MODULES.perky.props.heliumWeight, MODULES.perky.props.attackWeight, MODULES.perky.props.healthWeight, MODULES.perky.props.xpWeight];
	}

	else if (preset === 'magma') {
		MODULES.perky.props.magma = [MODULES.perky.props.heliumWeight, MODULES.perky.props.attackWeight, MODULES.perky.props.healthWeight, MODULES.perky.props.xpWeight];
	} else if (preset === 'z280') {
		MODULES.perky.props.z280 = [MODULES.perky.props.heliumWeight, MODULES.perky.props.attackWeight, MODULES.perky.props.healthWeight, MODULES.perky.props.xpWeight];
	} else if (preset === 'z400') {
		MODULES.perky.props.z400 = [MODULES.perky.props.heliumWeight, MODULES.perky.props.attackWeight, MODULES.perky.props.healthWeight, MODULES.perky.props.xpWeight];
	} else if (preset === 'z450') {
		MODULES.perky.props.z450 = [MODULES.perky.props.heliumWeight, MODULES.perky.props.attackWeight, MODULES.perky.props.healthWeight, MODULES.perky.props.xpWeight];
	}

	else if (preset === 'spire') {
		MODULES.perky.props.spire = [MODULES.perky.props.heliumWeight, MODULES.perky.props.attackWeight, MODULES.perky.props.healthWeight, MODULES.perky.props.xpWeight];
	} else if (preset === 'trapper') {
		MODULES.perky.props.trapper = [MODULES.perky.props.heliumWeight, MODULES.perky.props.attackWeight, MODULES.perky.props.healthWeight, MODULES.perky.props.xpWeight];
	} else if (preset === 'coord') {
		MODULES.perky.props.coord = [MODULES.perky.props.heliumWeight, MODULES.perky.props.attackWeight, MODULES.perky.props.healthWeight, MODULES.perky.props.xpWeight];
	} else if (preset === 'trimp') {
		MODULES.perky.props.trimp = [MODULES.perky.props.heliumWeight, MODULES.perky.props.attackWeight, MODULES.perky.props.healthWeight, MODULES.perky.props.xpWeight];
	} else if (preset === 'metal') {
		MODULES.perky.props.metal = [MODULES.perky.props.heliumWeight, MODULES.perky.props.attackWeight, MODULES.perky.props.healthWeight, MODULES.perky.props.xpWeight];
	} else if (preset === 'c2') {
		MODULES.perky.props.c2 = [MODULES.perky.props.heliumWeight, MODULES.perky.props.attackWeight, MODULES.perky.props.healthWeight, MODULES.perky.props.xpWeight];
	}
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

function selectPerkyPreset() {
	$$$('#presetElem > *').forEach(function (option) {
		if (parseInt(option.innerHTML.toLowerCase().replace(/[z+]/g, '').split('-')[0]) < game.global.highestLevelCleared)
			fillPresetPerky(option.value);
	});
}

function read_save() {
	var settings = JSON.parse(localStorage.getItem("perkyInputs"));
	var zone = 0;

	if (!settings.preset) {
		$$('#targetZone').value = game.stats.highestVoidMap.valueTotal || game.global.highestLevelCleared;
		selectPerkyPreset();
	}
	var zone = $$('#targetZone').value;

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

	const data = {
		unlocks: unlocks.join(','),
		chronojest: chronojest,
		prod: prod,
		loot: loot,
	}

	return data;
}

function parse_inputs(data) {

	var preset = $$('#presetElem').value;
	savePerkySettings();
	if (preset === 'trapper' && (!game || game.global.challengeActive !== 'Trapper'))
		throw 'This preset requires a save currently running Trapper². Start a new run using “Trapper² (initial)”, export, and try again.';
	result = {
		total_he: (countHeliumSpent(false, true) + game.global.heliumLeftover) + (portalWindowOpen ? game.resources.helium.owned : 0),
		zone: game.stats.highestLevel.valueTotal(),
		perks: parse_perks('', data.unlocks),
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
			dg: preset === 'nerfed' ? 0 : Number(update_dg()),
			tent_city: preset === 'tent',
			whip: game.unlocks.imps.Whipimp,
			magn: game.unlocks.imps.Magnimp,
			taunt: game.unlocks.imps.Tauntimp,
			ven: game.unlocks.imps.Venimp,
			chronojest: data.chronojest,
			prod: data.prod,
			loot: data.loot,
			breed_timer: (mastery('patience') ? 45 : 30),
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
		if (game)
			result.zone = game.global.world;
	}
	if (preset === 'carp') {
		result.mod.prod = result.mod.loot = 0;
		result.weight.trimps = 1e6;
	}
	if (preset === 'metal')
		result.mod.prod = 0;
	if (preset === 'trimp')
		result.mod.soldiers = 1;
	if (preset === 'nerfed')
		result.perks.Overkill.max_level = 1;
	if (preset === 'scientist')
		result.perks.Coordinated.max_level = 0;
	if (preset === 'income')
		result.weight = { income: 3, trimps: 3, attack: 1, helium: 0, health: 0, xp: 0 };
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
	if (unlocks === '*')
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
		if (m[2] !== '>')
			perks[matches[0]].max_level = level;
		if (m[2] !== '<')
			perks[matches[0]].min_level = level;
	};
	for (var _i = 0, _a = (unlocks + ',' + fixed).split(/,/).filter(function (x) { return x; }); _i < _a.length; _i++) {
		var item = _a[_i];
		_loop_1(item);
	}
	return perks;
}

function savePerkySettings(initial) {

	if (!MODULES.perky.showing) {
		console.log("Perky is not showing")
		return;
	}
	if (!initial) {
		initPresetPerky();
		initialPresetLoad();
	}
	const perkyInputs = {
		preset: $$('#presetElem').value,
		targetZone: $$('#targetZone').value,
		'weight-he': $$('#weight-he').value,
		'weight-atk': $$('#weight-atk').value,
		'weight-hp': $$('#weight-hp').value,
		'weight-xp': $$('#weight-xp').value,
	}

	//Save all of the presets that we might want to adjust
	perkyInputs.early = MODULES.perky.props.early;
	perkyInputs.broken = MODULES.perky.props.broken;
	perkyInputs.mid = MODULES.perky.props.mid;
	perkyInputs.corruption = MODULES.perky.props.corruption;

	perkyInputs.magma = MODULES.perky.props.magma;
	perkyInputs.z280 = MODULES.perky.props.z280;
	perkyInputs.z400 = MODULES.perky.props.z400;
	perkyInputs.z450 = MODULES.perky.props.z450;
	perkyInputs.spire = MODULES.perky.props.spire;

	perkyInputs.trapper = MODULES.perky.props.trapper;
	perkyInputs.coord = MODULES.perky.props.coord;
	perkyInputs.trimp = MODULES.perky.props.trimp;
	perkyInputs.metal = MODULES.perky.props.metal;
	perkyInputs.c2 = MODULES.perky.props.c2;

	localStorage.setItem("perkyInputs", JSON.stringify(perkyInputs));
	if (typeof (autoTrimpSettings) !== 'undefined' && typeof (autoTrimpSettings.ATversion) !== 'undefined' && !autoTrimpSettings.ATversion.includes('SadAugust')) {
		autoTrimpSettings['autoAllocatePresets'].value = JSON.stringify(perkyInputs);
		saveSettings();
	}
}

function display(results) {
	var perks = results[1];
	for (var name in perks)
		perks[name] = perks[name].level;
	return LZString.compressToBase64(JSON.stringify(perks));
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
	if (zone > 90 && mod.soldiers <= 1 && Bait.min_level === 0)
		Bait.max_level = 0;
	// Fluffy
	fluffy.attack = [];
	var potential = Math.log(0.003 * fluffy.xp / Math.pow(5, fluffy.prestige) + 1) / Math.log(4);
	for (var cap = 0; cap <= 10; ++cap) {
		var level = Math.min(Math.floor(potential), cap);
		var progress = level === cap ? 0 : (Math.pow(4, potential - level) - 1) / 3;
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


MODULES.perky.notations = [
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

function setupPerkyUI() {

	if (portalUniverse !== 1) return;
	MODULES.autoPerks = {};

	//Setting up data of id, names, and descriptions for each preset.
	const presets = {
		regular: {
			early: {
				name: "Z1-59",
				description: "Use this setting for the when you're progressing through the first 60 zones.",
			},
			broken: {
				name: "Z60-99",
				description: "Use this setting for zones 60-99.",
			},
			mid: {
				name: "Z100-180",
				description: "Use this setting for zones 100-180.",
			},
			corruption: {
				name: "Z181-229",
				description: "Use this setting for zones 181-229.",
			},
			magma: {
				name: "Z230-280",
				description: "Use this setting for zones 230-280.",
			},
			z280: {
				name: "Z280-400",
				description: "Use this setting for zones 280-400.",
			},
			z400: {
				name: "Z400-450",
				description: "Use this setting for zones 400-450.",
			},
			z450: {
				name: "Z450+",
				description: "Use this setting for zones 450+.",
			},
		},
		special: {
			spire: {
				name: "Spire respec",
				description: "Use this setting to respec for the Spire.",
			},
			nerfed: {
				name: "Nerfed feat",
				description: "Use this setting to respec for the Nerfed feat.",
			},
			tent: {
				name: "Tent City feat",
				description: "Use this setting to respec for the Tent City feat.",
			},
			scientist: {
				name: "Scientist challenge",
				description: "Use this setting to respec for the Scientist challenge.",
			},
			carp: {
				name: "Trapper² (initial)",
				description: "Use this setting to respec for the Trapper² feat.",
			},
			trapper: {
				name: "Trapper² (respec)",
				description: "Use this setting to respec for the Trapper² feat.",
			},
			coord: {
				name: "Coordinate²",
				description: "Use this setting to respec for the Coordinate² feat.",
			},
			trimp: {
				name: "Trimp²",
				description: "Use this setting to respec for the Trimp² feat.",
			},
			metal: {
				name: "Metal²",
				description: "Use this setting to respec for the Metal² feat.",
			},
			c2: {
				name: "Other c²",
				description: "Use this setting to respec for the other c² feats.",
			},
			income: {
				name: "Income",
				description: "Use this setting to respec for the Income feat.",
			},
			unesscented: {
				name: "Unesscented",
				description: "Use this setting to respec for the Unesscented feat.",
			},
			nerfeder: {
				name: "Nerfeder",
				description: "Use this setting to respec for the Nerfeder feat.",
			},
		}
	}

	//Setting up data of id, names, and descriptions for each input.
	const inputBoxes = {
		//Top Row
		row1: {
			'weight-he': {
				name: "Weight: Helium",
				description: "Weight for how much you value 1% more helium .",
				minValue: 0,
				maxValue: null,
				defaultValue: 1,
			},
			'weight-atk': {
				name: "Weight: Attack",
				description: "Weight for how much you value 1% more attack.",
				minValue: 0,
				maxValue: null,
				defaultValue: 1,
			},
			'weight-hp': {
				name: "Weight: Health",
				description: "Weight for how much you value 1% more health.",
				minValue: 0,
				maxValue: null,
				defaultValue: 1,
			},
		},
		//Second Row
		row2: {
			targetZone: {
				name: "Target Zone",
				description: "Target last zone to clear. Always use your final cleared zone for the current challenge (afterpush zone for radon challenges, xx9 for c^3s, 100 for Mayhem, etc).",
				minValue: 1,
				maxValue: null,
				defaultValue: (game.global.highestLevelCleared || 1),
			},
			'weight-xp': {
				name: "Weight: Fluffy",
				description: "Weight for how much you value 1% more Fluffy xp.",
				minValue: 0,
				maxValue: null,
				defaultValue: 1,
			},
		},
	}

	var presetListHtml = "<select id=\"presetElem\" onchange=\"fillPresetPerky()\" data-saved>"
	presetListHtml += "<option disabled>— Zone Progression —</option>"
	for (var item in presets.regular) {
		presetListHtml += "<option value=\"" + item + "\" title =\"" + presets.regular[item].description + "\">" + presets.regular[item].name + "</option>"
	}
	presetListHtml += "<option disabled>— Special-purpose presets —</option>"
	for (var item in presets.special) {
		presetListHtml += "<option value=\"" + item + "\" title =\"" + presets.special[item].description + "\">" + presets.special[item].name + "</option>"
	}
	presetListHtml += "</select >";

	MODULES.autoPerks.createInput = function (perkLine, id, inputObj, savedValue) {
		if (!id) return;
		if (document.getElementById(id + 'Div') !== null) {
			console.log("You most likely have a setup error in your inputBoxes. It will be trying to access a input box that doesn't exist.")
			return;
		}
		//Creating container for both the label and the input.
		var perkDiv = document.createElement("DIV");
		perkDiv.id = id + 'Div';
		perkDiv.setAttribute("style", "display: inline;");

		//Creating input box for users to enter their own ratios/stats.
		var perkInput = document.createElement("Input");
		perkInput.setAttribute("type", "number");
		perkInput.id = id;
		var perkInputStyle = 'text-align: center; width: calc(100vw/22); font-size: 1vw;';
		if (game.options.menu.darkTheme.enabled !== 2) perkInputStyle += (" color: black;");
		perkInput.setAttribute('style', perkInputStyle);
		perkInput.setAttribute('value', (savedValue || inputObj.defaultValue));
		perkInput.setAttribute('min', inputObj.minValue);
		perkInput.setAttribute('max', inputObj.maxValue);
		perkInput.setAttribute('placeholder', inputObj.defaultValue);
		perkInput.setAttribute('onchange', 'legalizeInput(this.id); savePerkySettings();');
		perkInput.setAttribute('onmouseover', 'tooltip(\"' + inputObj.name + '\", \"customText\", event, \"' + inputObj.description + '\")');
		perkInput.setAttribute('onmouseout', 'tooltip("hide")');

		var perkText = document.createElement("Label");
		perkText.id = id + "Text";
		perkText.innerHTML = inputObj.name;
		perkText.setAttribute('style', 'margin-right: 0.7vw; width: calc(100vw/12); color: white; font-size: 0.9vw; font-weight: lighter; margin-left: 0.3vw; ');
		//Combining the input and the label into the container. Then attaching the container to the main div.
		perkDiv.appendChild(perkText);
		perkDiv.appendChild(perkInput);
		perkLine.appendChild(perkDiv);
	}

	MODULES.autoPerks.GUI = {};

	MODULES.autoPerks.removeGUI = function () {
		Object.keys(MODULES.autoPerks.GUI).forEach(function (key) {
			var $$elem = MODULES.autoPerks.GUI[key];
			if (!$$elem) {
				console.log("error in: " + key);
				return;
			}
			if ($$elem.parentNode) {
				$$elem.parentNode.removeChild($$elem);
				delete $elem;
			}
		});
		MODULES.perky.showing = false;
	}

	MODULES.autoPerks.displayGUI = function () {

		var setupNeeded = false;
		var perkyInputs = JSON.parse(localStorage.getItem("perkyInputs"));
		if (perkyInputs === null && typeof (autoTrimpSettings) !== 'undefined' && typeof (autoTrimpSettings.ATversion) !== 'undefined' && !autoTrimpSettings.ATversion.includes('SadAugust')) {
			var atSetting = autoTrimpSettings['autoAllocatePresets'].value;
			if (atSetting !== '{"":""}') {
				perkyInputs = JSON.parse(atSetting);
				localStorage.setItem("perkyInputs", JSON.stringify(perkyInputs));
			}
		}
		if (perkyInputs === null) {
			setupNeeded = true;
			perkyInputs = {};
		}

		var apGUI = MODULES.autoPerks.GUI;
		//Setup Auto Allocate button
		apGUI.$allocatorBtn1 = document.createElement("DIV");
		apGUI.$allocatorBtn1.id = 'allocatorBtn1';
		apGUI.$allocatorBtn1.setAttribute('class', 'btn inPortalBtn settingsBtn settingBtntrue');
		apGUI.$allocatorBtn1.setAttribute('onclick', 'runPerky()');
		apGUI.$allocatorBtn1.setAttribute('onmouseover', 'tooltip(\"Auto Allocate\", \"customText\", event, \"Clears all perks and buy optimal levels in each perk.\")');
		apGUI.$allocatorBtn1.setAttribute('onmouseout', 'tooltip("hide")');
		apGUI.$allocatorBtn1.textContent = 'Allocate Perks';
		//Distance from Portal/Cancel/Respec buttons
		var $buttonbar = document.getElementById("portalBtnContainer");
		if (document.getElementById(apGUI.$allocatorBtn1.id) === null)
			$buttonbar.appendChild(apGUI.$allocatorBtn1);
		$buttonbar.setAttribute('style', 'margin-bottom: 0.2vw;');
		apGUI.$customRatios = document.createElement("DIV");
		apGUI.$customRatios.id = 'customRatios';

		//Line 1 of the UI
		apGUI.$ratiosLine1 = document.createElement("DIV");
		apGUI.$ratiosLine1.setAttribute('style', 'display: inline-block; text-align: center; width: 100%; margin-bottom: 0.1vw;');
		for (var item in inputBoxes.row1) {
			MODULES.autoPerks.createInput(apGUI.$ratiosLine1, item, inputBoxes.row1[item], perkyInputs[item]);
		}
		apGUI.$customRatios.appendChild(apGUI.$ratiosLine1);

		//Line 2
		apGUI.$ratiosLine2 = document.createElement("DIV");
		apGUI.$ratiosLine2.setAttribute('style', 'display: inline-block; text-align: center; width: 100%; margin-bottom: 0.1vw;');
		for (var item in inputBoxes.row2) {
			MODULES.autoPerks.createInput(apGUI.$ratiosLine2, item, inputBoxes.row2[item], perkyInputs[item]);
		}
		apGUI.$customRatios.appendChild(apGUI.$ratiosLine2);

		//Creating container for both the label and the input.
		apGUI.$presetDiv = document.createElement("DIV");
		apGUI.$presetDiv.id = "Preset Div";
		apGUI.$presetDiv.setAttribute("style", "display: inline; width: calc(100vw/34;");

		//Setting up preset label
		apGUI.$presetLabel = document.createElement("Label");
		apGUI.$presetLabel.id = 'PresetText';
		apGUI.$presetLabel.innerHTML = "&nbsp;&nbsp;&nbsp;Preset:";
		apGUI.$presetLabel.setAttribute('style', 'margin-right: 0.5vw; color: white; font-size: 0.9vw; font-weight: lighter;');

		//Setting up preset dropdown
		apGUI.$preset = document.createElement("select");
		apGUI.$preset.id = 'presetElem';
		apGUI.$preset.setAttribute('onchange', 'fillPresetPerky();');
		var oldstyle = 'text-align: center; width: 9.8vw; font-size: 0.9vw; font-weight: lighter; ';
		if (game.options.menu.darkTheme.enabled !== 2) oldstyle += " color: black;";
		apGUI.$preset.setAttribute('style', oldstyle);
		apGUI.$preset.innerHTML = presetListHtml;

		apGUI.$presetDiv.appendChild(apGUI.$presetLabel);
		apGUI.$presetDiv.appendChild(apGUI.$preset);
		if (document.getElementById(apGUI.$presetDiv.id) === null)
			apGUI.$ratiosLine2.appendChild(apGUI.$presetDiv);
		var $portalWrapper = document.getElementById("portalWrapper");
		$portalWrapper.appendChild(apGUI.$customRatios);

		$$('#presetElem').value = (perkyInputs.preset === undefined ? 'early' : perkyInputs.preset);
		if (setupNeeded) savePerkySettings();
		MODULES.perky.showing = true;

		//Disable Fluffy xp input when it's not active.
		if (game.global.spiresCompleted < 2) {
			$$('#weight-xpDiv').style.display = 'none';
		}
	}

	MODULES.autoPerks.displayGUI();
}