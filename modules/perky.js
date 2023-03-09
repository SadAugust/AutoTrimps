var AutoPerks = {};

function runPerky() {
	if (portalUniverse !== 1) return;
	read_save();
	display(optimize(parse_inputs()));
	allocatePerky();
}

function allocatePerky() {
	tooltip('Import Perks', null, 'update');
	document.getElementById('perkImportBox').value = ($("#perkstring").value)
	importPerks();
	cancelTooltip();
}

function read_save() {
	//localStorage.zone || ($("#zone").value = game.stats.highestVoidMap.valueTotal || game.global.highestLevelCleared);
	var a = input("zone");
	localStorage.preset ||
		($$("#preset > *").forEach(function (a) {
			a.selected = parseInt(a.innerHTML.replace("z", "")) < game.global.highestLevelCleared;
		}),
			update_preset());
	var b = portalWindowOpen ? game.global.heliumLeftover : 0;
	for (var c in game.portal) b += game.portal[c].heliumSpent || 0;
	var d = Object.keys(game.portal).filter(function (a) {
		return !game.portal[a].locked && void 0 !== game.portal[a].level;
	});
	(game.global.canRespecPerks) ||
		(d = d.map(function (a) {
			return a + ">" + (game.portal[a].level || 0);
		}));
	var e = mastery("turkimp2") ? 1 : mastery("turkimp") ? 0.4 : 0.25,
		f = 1 + e,
		g = 1 + 0.333 * e,
		h = Math.min(Math.floor((a - 101) / 100), game.global.spiresCompleted);
	g *= 100 > a ? 0.7 : 1 + (mastery("stillRowing") ? 0.3 : 0.2) * h;
	for (var i = 27 * game.unlocks.imps.Jestimp + 15 * game.unlocks.imps.Chronoimp, j = 60 > a ? 0 : 85 > a ? 7 : 160 > a ? 10 : 185 > a ? 14 : 20, k = 0, l = game.global.StaffEquipped.mods || []; k < l.length; k++) {
		var m = l[k];
		"MinerSpeed" === m[0] ? (f *= 1 + 0.01 * m[1]) : "metalDrop" === m[0] && (g *= 1 + 0.01 * m[1]);
	}
	jobless ? (f = 0) : (i += (mastery("mapLoot2") ? 5 : 4) * j),
		update_dg(),
		($("#helium").value = b + (!game.global.canRespecPerks || !portalWindowOpen ? 0 : game.resources.helium.owned)),
		($("#unlocks").value = d.join(",")),
		($("#whipimp").checked = game.unlocks.imps.Whipimp),
		($("#magnimp").checked = game.unlocks.imps.Magnimp),
		($("#tauntimp").checked = game.unlocks.imps.Tauntimp),
		($("#venimp").checked = game.unlocks.imps.Venimp),
		($("#chronojest").value = prettify(i)),
		($("#prod").value = prettify(f)),
		($("#loot").value = prettify(g)),
		($("#breed-timer").value = prettify(mastery("patience") ? 45 : 30));
}

function input(a) {
	return parse_suffixes($("#" + a).value);
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

function update_dg() {
	function a(a) {
		(m += a * c * Math.sqrt(Math.min(d, n))), (n = Math.max(0, n - h));
	}
	var b = (game.global.highestLevelCleared + 1) / 2 + 115,
		c = 5e8 + 5e7 * game.generatorUpgrades.Efficiency.upgrades,
		d = 3 + 0.4 * game.generatorUpgrades.Capacity.upgrades,
		e = game.permanentGeneratorUpgrades.Storage.owned ? 1.5 * d : d,
		f = 230 + 2 * game.generatorUpgrades.Supply.upgrades,
		g = game.generatorUpgrades.Overclocker.upgrades;
	g = g && 1 - 0.5 * Math.pow(0.99, g - 1);
	var h = game.permanentGeneratorUpgrades.Slowburn.owned ? 0.4 : 0.5,
		i = mastery("magmaFlow") ? 18 : 16,
		j = mastery("quickGen") ? 1.03 : 1.02,
		k = mastery("hyperspeed2") ? (game.global.highestLevelCleared + 1) / 2 : 0,
		l = 0.5 * mastery("blacksmith") + 0.25 * mastery("blacksmith2") + 0.15 * mastery("blacksmith3");
	l *= game.global.highestLevelCleared + 1;
	for (var m = 0, n = 0, o = 0, p = 230; b >= p; ++p) {
		n += i * (0.01 * Math.min(p, f) - 2.1);
		var q = Math.ceil(60 / Math.pow(j, Math.floor((p - 230) / 3)));
		for (o += p > l ? 28 : p > k ? 20 : 15; o >= q;) (o -= q), a(1);
		for (; n > e;) a(g);
		m *= 1.009;
	}
	for (; n >= h;) a(1);
	return Number(m);
}

function parse_inputs() {
	read_save();
	var a = $("#preset").value;
	savePerkySettings();
	var b = {
		total_he: game.global.totalHeliumEarned - (!portalWindowOpen ? game.resources.helium.owned : 0),
		zone: game.global.highestLevelCleared + 1,
		perks: parse_perks('', $("#unlocks").value),
		weight: {
			helium: input("weight-he"),
			attack: input("weight-atk"),
			health: input("weight-hp"),
			xp: input("weight-xp"),
			trimps: input("weight-trimps"),
			income: 0
		},
		fluffy: {
			xp: game.global.fluffyExp,
			prestige: game.global.fluffyPrestige
		},
		mod: {
			storage: 0.125,
			soldiers: 0,
			dg: "nerfed" == a ? 0 : Number(update_dg()),
			tent_city: "tent" == a,
			whip: game.unlocks.imps.Whipimp,
			magn: game.unlocks.imps.Magnimp,
			taunt: game.unlocks.imps.Tauntimp,
			ven: game.unlocks.imps.Venimp,
			chronojest: input("chronojest"),
			prod: input("prod"),
			loot: input("loot"),
			breed_timer: input("breed-timer"),
		},
	};
	"nerfed" == a && ((b.total_he = 9999e4), (b.zone = 200), (b.mod.dg = 0)),
		"trapper" == a && ((b.mod.soldiers = game.resources.trimps.owned), (b.mod.prod = 0), (b.perks.Pheromones.max_level = 0), (b.perks.Anticipation.max_level = 0)),
		"spire" == a && ((b.mod.prod = b.mod.loot = 0), (b.perks.Overkill.max_level = 0), game && (b.zone = game.global.world)),
		"carp" == a && ((b.mod.prod = b.mod.loot = 0), (b.weight.trimps = 1e6)),
		"metal" == a && (b.mod.prod = 0),
		"trimp" == a && (b.mod.soldiers = 1),
		"nerfed" == a && (b.perks.Overkill.max_level = 1),
		"scientist" == a && (b.perks.Coordinated.max_level = 0),
		"income" == a && (b.weight = { income: 3, trimps: 3, attack: 1, helium: 0, health: 0, xp: 0 }),
		"unesscented" == a && ((b.total_he = 0), (b.zone = 181)),
		"nerfeder" == a && ((b.total_he = 9999e5), (b.zone = 300));
	return (
		b
	);
}

function parse_perks(a, b) {
	var c = function (a) {
		return function (b) {
			return 1 + 0.01 * a * b;
		};
	},
		d = function (a) {
			return function (b) {
				return Math.pow(1 + 0.01 * a, b);
			};
		},
		e = {
			Looting_II: new Perk(1e5, 1e4, c(0.25)),
			Carpentry_II: new Perk(1e5, 1e4, c(0.25)),
			Motivation_II: new Perk(5e4, 1e3, c(1)),
			Power_II: new Perk(2e4, 500, c(1)),
			Toughness_II: new Perk(2e4, 500, c(1)),
			Capable: new Perk(
				1e8,
				0,
				function (a) {
					return 1;
				},
				10,
				10
			),
			Cunning: new Perk(1e11, 0, c(25)),
			Curious: new Perk(1e14, 0, c(160)),
			Classy: new Perk(1e17, 0, d(4.5678375), 75),
			Overkill: new Perk(1e6, 0, c(500), 30),
			Resourceful: new Perk(5e4, 0, d(-5)),
			Coordinated: new Perk(15e4, 0, d(-2)),
			Siphonology: new Perk(
				1e5,
				0,
				function (a) {
					return Math.pow(1 + a, 0.1);
				},
				3
			),
			Anticipation: new Perk(1e3, 0, c(6), 10),
			Resilience: new Perk(100, 0, d(10)),
			Meditation: new Perk(75, 0, c(1), 7),
			Relentlessness: new Perk(
				75,
				0,
				function (a) {
					return 1 + 0.05 * a * (1 + 0.3 * a);
				},
				10
			),
			Carpentry: new Perk(25, 0, d(10)),
			Artisanistry: new Perk(15, 0, d(-5)),
			Range: new Perk(1, 0, c(1), 10),
			Agility: new Perk(4, 0, d(-5), 20),
			Bait: new Perk(4, 0, c(100)),
			Trumps: new Perk(3, 0, c(20)),
			Pheromones: new Perk(3, 0, c(10)),
			Packrat: new Perk(3, 0, c(20)),
			Motivation: new Perk(2, 0, c(5)),
			Power: new Perk(1, 0, c(5)),
			Toughness: new Perk(1, 0, c(5)),
			Looting: new Perk(1, 0, c(5)),
		};
	"*" == b && (b = Object.keys(e).join(",")), b.match(/>/) || (b = b.replace(/(?=,|$)/g, ">0"));
	for (
		var f = function (a) {
			var b = a.match(/(\S+) *([<=>])=?(.*)/);
			if (!b) throw "Enter a list of perk levels, such as “power=42, toughness=51”.";
			var c = b[1].match(/2$|II$/i),
				d = b[1]
					.replace(/[ _]?(2|II)/i, "")
					.replace(/^OK/i, "O")
					.replace(/^Looty/i, "L"),
				f = new RegExp("^" + d + "[a-z]*" + (c ? "_II" : "") + "$", "i"),
				g = Object.keys(e).filter(function (a) {
					return a.match(f);
				});
			if (g.length > 1) throw "Ambiguous perk abbreviation: " + b[1] + ".";
			if (g.length < 1) throw "Unknown perk: " + b[1] + ".";
			var h = parse_suffixes(b[3]);
			if (!isFinite(h)) throw "Invalid number: " + b[3] + ".";
			(e[g[0]].locked = !1), ">" != b[2] && (e[g[0]].max_level = h), "<" != b[2] && (e[g[0]].min_level = h);
		},
		g = 0,
		h = (b + "," + a).split(/,/).filter(function (a) {
			return a;
		});
		g < h.length;
		g++
	) {
		var i = h[g];
		f(i);
	}
	return e;
}

function set_hze(a) {
	+localStorage.hze > a || (localStorage.hze = a);
}

var Perk = (function () {
	function a(a, b, c, d, e) {
		void 0 === d && (d = 1 / 0),
			void 0 === e && (e = 1.3),
			(this.base_cost = a),
			(this.cost_increment = b),
			(this.scaling = c),
			(this.max_level = d),
			(this.cost_exponent = e),
			(this.locked = !0),
			(this.level = 0),
			(this.min_level = 0),
			(this.cost = 0),
			(this.gain = 0),
			(this.bonus = 1),
			(this.cost = this.base_cost);
	}
	return (
		(a.prototype.levellable = function (a) {
			return !this.locked && this.level < this.max_level && this.cost * Math.max(1, Math.floor(this.level / 1e12)) <= a;
		}),
		(a.prototype.level_up = function (a) {
			if (((this.level += a), (this.bonus = this.scaling(this.level)), this.cost_increment)) {
				var b = a * (this.cost + (this.cost_increment * (a - 1)) / 2);
				return (this.cost += a * this.cost_increment), b;
			}
			var b = this.cost;
			return (this.cost = Math.ceil(this.level / 2 + this.base_cost * Math.pow(this.cost_exponent, this.level))), b;
		}),
		(a.prototype.spent = function (a) {
			if ((void 0 === a && (a = !1), this.cost_increment)) return (this.level * (this.base_cost + this.cost - this.cost_increment)) / 2;
			for (var b = 0, c = 0; c < this.level; ++c) b += Math.ceil(c / 2 + this.base_cost * Math.pow(this.cost_exponent, c));
			return b;
		}),
		(a.prototype.log_ratio = function () {
			return this.cost_increment ? (this.scaling(1) - this.scaling(0)) / this.bonus : Math.log(this.scaling(this.level + 1) / this.bonus);
		}),
		a
	);
})(),
	presets = {
		early: ["5", "4", "3"],
		broken: ["7", "3", "1"],
		mid: ["16", "5", "1"],
		corruption: ["25", "7", "1"],
		magma: ["35", "4", "3"],
		z280: ["42", "6", "1"],
		z400: ["88", "10", "1"],
		z450: ["500", "50", "1"],
		spire: ["0", "1", "1"],
		nerfed: ["0", "4", "3"],
		tent: ["5", "4", "3"],
		scientist: ["0", "1", "3"],
		carp: ["0", "0", "0"],
		trapper: ["0", "7", "1"],
		coord: ["0", "40", "1"],
		trimp: ["0", "99", "1"],
		metal: ["0", "7", "1"],
		c2: ["0", "7", "1"],
		income: ["0", "0", "0"],
		unesscented: ["0", "1", "0"],
		nerfeder: ["0", "1", "0"],
	};

presets = {
	early: ["5", "4", "3"],
	broken: ["7", "3", "1"],
	mid: ["16", "5", "1"],
	corruption: ["25", "7", "1"],
	magma: ["35", "4", "3"],
	z280: ["42", "6", "1"],
	z400: ["88", "10", "1"],
	z450: ["500", "50", "1"],
	spire: ["0", "1", "1"],
	nerfed: ["0", "4", "3"],
	tent: ["5", "4", "3"],
	scientist: ["0", "1", "3"],
	carp: ["0", "0", "0"],
	trapper: ["0", "7", "1"],
	coord: ["0", "40", "1"],
	trimp: ["0", "99", "1"],
	metal: ["0", "7", "1"],
	c2: ["0", "7", "1"],
	income: ["0", "0", "0"],
	unesscented: ["0", "1", "0"],
	nerfeder: ["0", "1", "0"],
};

function update_preset() {
	var a = presets[$("#preset").value],
		b = a[0],
		c = a[1],
		d = a[2],
		e = Math.floor((+b + +c + +d) / 5).toString();
	($("#weight-he").value = localStorage["weight-he"] || b),
		($("#weight-atk").value = localStorage["weight-atk"] || c),
		($("#weight-hp").value = localStorage["weight-hp"] || d),
		($("#weight-xp").value = localStorage["weight-xp"] || e);
}

function savePerkySettings() {

	const perkyInputs = {
		preset: $('#preset').value,
		weight_he: $('#weight-he').value,
		weight_atk: $('#weight-atk').value,
		weight_hp: $('#weight-hp').value,
		weight_xp: $('#weight-xp').value
	}
	localStorage.setItem("perkyInputs", JSON.stringify(perkyInputs));
}

function loadPerkySettings() {

	let perkyInputs = JSON.parse(localStorage.getItem("perkyInputs"));
	if (perkyInputs === null) return;
	$('#preset').value = perkyInputs.preset;
	$('#weight-he').value = perkyInputs.weight_he;
	$('#weight-atk').value = perkyInputs.weight_atk
	$('#weight-hp').value = perkyInputs.weight_hp;
	$('#weight-xp').value = perkyInputs.weight_xp;
}

function display(a) {
	var b = a[0],
		c = a[1],
		d = game ? game.options.menu.smallPerks.enabled : 0,
		e = $("#perks");
	var f = e > $("#test-text") ? "Level: " : "";
	($("#perks").innerHTML = Object.keys(c)
		.filter(function (a) {
			return !c[a].locked;
		})
		.map(function (a) {
			var b = c[a],
				e = b.level,
				g = b.max_level,
				h = game ? e - game.portal[a].level : 0,
				i = h ? " (" + (h > 0 ? "+" : "-") + prettify(Math.abs(h)) + ")" : "",
				j = h > 0 ? "adding" : 0 > h ? "remove" : e >= g ? "capped" : "";
			return (
				(j += [" large", " small", " tiny"][d]),
				"<div class='perk " +
				" " +
				"'>" +
				("<b>" + a.replace("_", " ") + "</b>") +
				("<b>" + prettify(e) + i + "</b>") + "</span></div>"
			);
		})
		.join(""));
	for (var g in c) c[g] = c[g].level;
	$("#perkstring").value = LZString.compressToBase64(JSON.stringify(c));
}

function optimize(a) {
	function b() {
		return 1 + +(S.bonus > 0.9) + Math.ceil(10 * S.bonus);
	}
	function c() {
		return X.bonus * A.bonus * N.bonus;
	}
	function d() {
		var a = c() * w.whip,
			b = ma() * w.magn * 0.75 * 0.8,
			d = (w.chronojest * a * b) / 30;
		return a + b + d;
	}
	function e(a) {
		var d = (w.storage * I.bonus) / W.bonus,
			e = (ma() * w.magn) / b(),
			f = a ? 0 : c() * w.prod,
			g = 0.1 * w.chronojest * f * e;
		return ha * (f + e * w.loot + g) * (1 - d) * na();
	}
	function f(a) {
		var b = la[a] * Q.bonus,
			c = 1.136,
			d = Math.log(1 + e() / b) / Math.log(ka.cost);
		return d > ja + 0.45 && ((c = Math.log(1 + 0.2 * Math.pow(ka.cost, d - ja)) / Math.log(1.2)), (d = ja)), c * Math.pow(ka[a], d);
	}
	function g(a, b) {
		return (a *= 4 * I.bonus), Math.log(1 + (e(!0) * (b - 1)) / a) / Math.log(b);
	}
	function h() {
		return Math.max(s - 229, 0);
	}
	function i() {
		var a = g(2e6, 1.06) / (1 + 0.1 * Math.min(h(), 20)),
			b = 0.0085 * (s >= 60 ? 0.1 : 1) * Math.pow(1.1, Math.floor(s / 5));
		return b * Math.pow(1.01, a) * V.bonus * w.ven;
	}
	function j() {
		var a = 1 + 0.25 * J.bonus,
			b = (w.soldiers || na()) / 3;
		w.soldiers > 1 && (b += 36e3 * T.bonus);
		var c = Math.max(0, Math.log(oa[J.level] / b) / Math.log(a));
		return oa[0] * Math.pow(1.25, -c);
	}
	function k() {
		if (230 > s || w.soldiers > 1 || jobless) return 0;
		var a = Math.log(na() / oa[J.level]) / Math.log(10);
		return Math.max(0, (a - 7 + Math.floor((s - 215) / 100)) / 3);
	}
	function l() {
		var a = (0.15 + f("attack")) * Math.pow(0.8, h());
		return (a *= Y.bonus * B.bonus * O.bonus), (a *= K.bonus * R.bonus * L.bonus), (a *= t.attack[D.level]), (a *= game && mastery("amalg") ? Math.pow(1.5, k()) : 1 + 0.5 * k()), j() * a;
	}
	function m() {
		var a = (0.6 + f("health")) * Math.pow(0.8, h());
		a *= Z.bonus * C.bonus * M.bonus;
		var c = g(400, 1.185),
			d = jobless ? 0 : (c * Math.log(1.185) - Math.log(1 + c)) / Math.log(1.1) + 25 - fa,
			e = 0.04 * c * Math.pow(1 + fa / 100, c) * (1 + ga * d),
			l = 60;
		if (70 > s || jobless) {
			var m = Math.log(1 + (j() * i()) / T.bonus) / Math.log(1 + i());
			l = m / b();
		} else {
			var n = Math.min(oa[J.level] / na(), 1 / 3),
				o = n > 1e-9 ? 10 * (Math.pow(0.5 / (0.5 - n), 0.1 / w.breed_timer) - 1) : n / w.breed_timer,
				p = Math.log(i() / o) / -Math.log(0.98);
			(a *= Math.pow(1.01, p)), (a *= Math.pow(1.332, k()));
		}
		return (a /= l), 60 > s ? (e += f("block")) : (e = Math.min(e, 4 * a)), j() * (e + a);
	}
	function n() {
		var a = 0;
		for (var b in v)
			if (v[b]) {
				var c = ya[b]();
				if (!isFinite(c)) throw Error(b + " is " + c);
				a += v[b] * Math.log(c);
			}
		return a;
	}
	function o() {
		var a = n();
		for (var b in u) {
			var c = u[b];
			!c.cost_increment && c.levellable(x) && (c.level_up(1), (c.gain = n() - a), c.level_up(-1));
		}
		for (var d = 0, e = ["Looting", "Carpentry", "Motivation", "Power", "Toughness"]; d < e.length; d++) {
			var f = e[d];
			u[f + "_II"].gain = (u[f].gain * u[f + "_II"].log_ratio()) / u[f].log_ratio();
		}
	}
	function p(a, b, c) {
		var d = b * b - 4 * a * c;
		return (-b + Math.sqrt(d)) / (2 * a);
	}
	function q(a, b) {
		if (((a.gain /= a.log_ratio()), a.cost_increment)) {
			var c = (1 + a.level) / (1e3 + y.level + z.level + A.level + B.level + C.level);
			b *= 0.5 * Math.pow(c, 2);
			var d = p(a.cost_increment / 2, a.cost - a.cost_increment / 2, -b);
			x -= a.level_up(Math.floor(Math.max(Math.min(d, a.max_level - a.level), 1, a.level / 1e12)));
		} else {
			b = Math.pow(b, 0.5);
			do x -= a.level_up(1);
			while (a.cost < b && a.level < a.max_level);
		}
		a.gain *= a.log_ratio();
	}
	for (
		var r = a.total_he,
		s = a.zone,
		t = a.fluffy,
		u = a.perks,
		v = a.weight,
		w = a.mod,
		x = r,
		y = u.Looting_II,
		z = u.Carpentry_II,
		A = u.Motivation_II,
		B = u.Power_II,
		C = u.Toughness_II,
		D = u.Capable,
		E = u.Cunning,
		F = u.Curious,
		G = u.Classy,
		H = u.Overkill,
		I = u.Resourceful,
		J = u.Coordinated,
		K = u.Siphonology,
		L = u.Anticipation,
		M = u.Resilience,
		N = u.Meditation,
		O = u.Relentlessness,
		P = u.Carpentry,
		Q = u.Artisanistry,
		R = u.Range,
		S = u.Agility,
		T = u.Bait,
		U = u.Trumps,
		V = u.Pheromones,
		W = u.Packrat,
		X = u.Motivation,
		Y = u.Power,
		Z = u.Toughness,
		$ = u.Looting,
		_ = 0,
		aa = [game.unlocks.imps.Whipimp, game.unlocks.imps.Magnimp, game.unlocks.imps.Tauntimp, game.unlocks.imps.Venimp];
		_ < aa.length;
		_++
	) {
		var ba = aa[_];
		w[ba] = Math.pow(1.003, 99 * s * 0.03 * w[ba]);
	}
	for (
		var ca = Math.pow(1.25, s) * Math.pow(s > 100 ? 1.28 : 1.2, Math.max(s - 59, 0)),
		da = Math.max(0, Math.min(s - 60, s / 2 - 25, s / 3 - 12, s / 5, s / 10 + 17, 39)),
		ea = Math.pow(1.25, 5 + Math.min(s / 2, 30) + da),
		fa = s >= 25 ? Math.floor(Math.min(s / 5, 9 + s / 25, 15)) : 0,
		ga = (20 + s - (s % 5)) / 100,
		ha = 600 * w.whip * ca,
		ia = Math.pow(s - 19, 2),
		ja = s / 5 + +(5 > (s - 1) % 10),
		ka = { cost: Math.pow(1.069, 0.85 * (60 > s ? 57 : 53)), attack: Math.pow(1.19, 13), health: Math.pow(1.19, 14), block: Math.pow(1.19, 10) },
		la = { attack: (211 * (v.attack + v.health)) / v.attack, health: (248 * (v.attack + v.health)) / v.health, block: (5 * (v.attack + v.health)) / v.health },
		ma = function () {
			return $.bonus * y.bonus;
		},
		na = w.tent_city
			? function () {
				var a = P.bonus * z.bonus,
					b = U.bonus;
				return 10 * (w.taunt + b * (w.taunt - 1) * 111) * a;
			}
			: function () {
				var a = P.bonus * z.bonus,
					b = 3 + Math.log((ea * d()) / I.bonus) / Math.log(1.4),
					c = U.bonus * s;
				return 10 * (ea * b + c) * a * w.taunt + w.dg * a;
			},
		oa = [],
		pa = 0;
		pa <= Math.log(1 + x / 5e5) / Math.log(1.3);
		++pa
	) {
		for (var qa = 1 + 0.25 * Math.pow(0.98, pa), ra = s - 1 + (h() ? 100 : 0), sa = 1, ta = 0; ra > ta; ++ta) sa = Math.ceil(sa * qa);
		oa[pa] = sa;
	}
	var ua = function () {
		return E.bonus * F.bonus * G.bonus;
	},
		va = function () {
			return 1 / S.bonus;
		},
		wa = function () {
			return ia * ma() + 45;
		},
		xa = function () {
			return H.bonus;
		},
		ya = { agility: va, helium: wa, xp: ua, attack: l, health: m, overkill: xa, trimps: na, income: e };
	(w.loot *= 20.8), (v.agility = (v.helium + v.attack) / 2), (v.overkill = 0.25 * v.attack * (2 - Math.pow(0.9, v.helium / v.attack))), s > 90 && w.soldiers <= 1 && 0 == T.min_level && (T.max_level = 0), (t.attack = []);
	for (var za = Math.log((0.003 * t.xp) / Math.pow(5, t.prestige) + 1) / Math.log(4), Aa = 0; 10 >= Aa; ++Aa) {
		var Ba = Math.min(Math.floor(za), Aa),
			Ca = Ba == Aa ? 0 : (Math.pow(4, za - Ba) - 1) / 3;
		t.attack[Aa] = 1 + 0.1 * Math.pow(5, t.prestige) * (Ba / 2 + Ca) * (Ba + 1);
	}
	for (var Da in u) {
		var Ea = u[Da];
		if (Ea.cost_increment) x -= Ea.level_up(Ea.min_level);
		else for (; Ea.level < Ea.min_level;) x -= Ea.level_up(1);
	}
	for (var Fa = 0.25; D.levellable(x * Fa);) (x -= D.level_up(1)), (Fa = D.level <= Math.floor(za) && s > 300 && v.xp > 0 ? 0.25 : 0.01);
	if (300 >= s || za >= D.level) v.xp = 0;
	for (
		var Ga = Object.keys(u)
			.map(function (a) {
				return u[a];
			})
			.filter(function (a) {
				return a.levellable(x);
			}),
		Ha = x,
		Ia = 0.999;
		Ia > 1e-12;
		Ia *= Ia
	) {
		var Ja = Ha * Ia;
		for (
			o(),
			Ga.sort(function (a, b) {
				return b.gain / b.cost - a.gain / a.cost;
			});
			x > Ja && Ga.length;

		) {
			var Ka = Ga.shift();
			if (Ka.levellable(x)) {
				q(Ka, x - Ja);
				for (var ta = 0; Ga[ta] && Ga[ta].gain / Ga[ta].cost > Ka.gain / Ka.cost;) ta++;
				Ga.splice(ta, 0, Ka);
			}
		}
	}
	return r / 1e12 > x + 1 && C.level > 0 && (--C.level, (x += C.cost)), [x, u];
}

var jobless = !1,
	$ = function (a) {
		return document.querySelector(a);
	},
	$$ = function (a) {
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

function select_preset(a, b) {
	void 0 === b && (b = !0),
		delete localStorage["preset"],
		delete localStorage["weight-he"],
		delete localStorage["weight-atk"],
		delete localStorage["weight-hp"],
		delete localStorage["weight-xp"],
		(c = presets[a]),
		($("#weight-he").value = c[0]),
		($("#weight-atk").value = c[1]),
		($("#weight-hp").value = c[2]),
		($("#weight-xp").value = Math.floor((+presets[a][0] + +presets[a][1] + +presets[a][2]) / 5).toString());
	var c;
	savePerkySettings();
}

var showingPerky = false;

function setupPerkyUI() {

	if (portalUniverse !== 1) return;
	AutoPerks = {};

	var presetListHtml =
		"<select id=\"preset\" onchange=\"select_preset(this.value)\" data-saved>\
			\
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
			var $elem = AutoPerks.GUI[key];
			if (!$elem) {
				console.log("error in: " + key);
				return;
			}
			if ($elem.parentNode) {
				$elem.parentNode.removeChild($elem);
				delete $elem;
			}
		});
		showingPerky = false;
	}

	AutoPerks.displayGUI = function () {
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
		var listratiosTitle2 = ["Weight: Population", "Production Mod", "Loot Mod", "Breed Timer"];
		var listratiosLine2 = ["weight-trimps", "prod", "loot", "breed-timer"];
		for (var i in listratiosLine2)
			AutoPerks.createInput(listratiosLine2[i], apGUI.$ratiosLine2, listratiosTitle2[i]);

		//Hide these elements - Line 3
		apGUI.$ratiosLine3 = document.createElement("DIV");
		apGUI.$ratiosLine3.setAttribute('style', 'display: none; text-align: left; width: 100%');
		var listratiosLine3 = ['zone', "fixed", "helium", "unlocks", "whipimp", "magnimp", "tauntimp", "venimp", "chronojest", 'test-text', 'results', 'info', 'he-left', 'perks', 'perkstring'];
		for (var i in listratiosLine3)
			AutoPerks.createInput(listratiosLine3[i], apGUI.$ratiosLine3, false);

		apGUI.$presetLabel = document.createElement("Label");
		apGUI.$presetLabel.id = 'Ratio Preset Label';
		apGUI.$presetLabel.innerHTML = "&nbsp;&nbsp;&nbsp;Preset:";
		apGUI.$presetLabel.setAttribute('style', 'margin-right: 0.5vw; color: white; font-size: 0.9vw;');
		apGUI.$preset = document.createElement("select");
		apGUI.$preset.id = 'preset';
		apGUI.$preset.setAttribute('onchange', 'select_preset(this.value)');
		oldstyle = 'text-align: center; width: 8vw; font-size: 0.8vw; font-weight: lighter; ';
		if (game.options.menu.darkTheme.enabled != 2) apGUI.$preset.setAttribute("style", oldstyle + " color: black;");
		else apGUI.$preset.setAttribute('style', oldstyle);
		apGUI.$preset.innerHTML = presetListHtml;
		var loadLastPreset = (JSON.parse(localStorage.getItem("perkyInputs")) !== null) ? JSON.parse(localStorage.getItem("perkyInputs")).preset : null;
		var setID;
		if (loadLastPreset != null) {
			if (loadLastPreset == 15 && !localStorage.getItem('preset'))
				loadLastPreset = 11;
			if (localStorage.getItem('AutoperkSelectedpresetName') == "customPreset")
				loadLastPreset = 11;
			setID = loadLastPreset;
		}
		else
			setID = 0;
		apGUI.$preset.selectedIndex = setID;
		apGUI.$ratiosLine1.appendChild(apGUI.$presetLabel);
		apGUI.$ratiosLine1.appendChild(apGUI.$preset);
		apGUI.$customRatios.appendChild(apGUI.$ratiosLine2);
		apGUI.$customRatios.appendChild(apGUI.$ratiosLine3);
		var $portalWrapper = document.getElementById("portalWrapper")
		$portalWrapper.appendChild(apGUI.$customRatios);
		loadPerkySettings();
		showingPerky = true;
	}

	AutoPerks.displayGUI();
}