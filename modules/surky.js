var AutoPerks = {};
var perks = {};
var props = {};

var showingSurky = false;

function runSurky() {
	if (portalUniverse !== 2) return;
	initialLoad();
	getPerkEfficiencies();
	if (!game.global.canRespecPerks)
		autobuyPerks();
	else
		clearAndAutobuyPerks();
}

function setupSurkyUI() {

	if (portalUniverse !== 2) return;
	//return;
	AutoPerks = {};

	var presetListHtml =
		"<select id=\"presetElem\" onchange=\"fillPreset()\" data-saved>\
			\
			<option disabled>— Select a Preset —</option>\
			<option value=\"ezfarm\">Easy Radon challenge</option>\
			<option value=\"tufarm\">Difficult Radon challenge</option>\
			<option value=\"push\">Push/C^3/Mayhem</option>\
			<option disabled>— Special-purpose presets —</option>\
			<option value=\"downsize\">Downsize</option>\
			<option value=\"duel\">Duel</option>\
			<option value=\"berserk\">Berserk</option>\
			<option value=\"alchemy\">Alchemy</option>\
			<option value=\"smithless\">Smithless</option>\
			<option value=\"combat\">Combat-only respec</option>\
		</select>";

	AutoPerks.createInput = function (perkname, div, id) {
		var perk1input = document.createElement("Input");
		perk1input.id = perkname;
		var oldstyle = 'text-align: center; width: calc(100vw/36); font-size: 1.0vw; ';
		if (game.options.menu.darkTheme.enabled != 2) perk1input.setAttribute("style", oldstyle + " color: black;");
		else perk1input.setAttribute('style', oldstyle);
		perk1input.setAttribute('class', 'perkRatios');
		perk1input.setAttribute('onchange', '');
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
		showingSurky = false;
	}

	AutoPerks.displayGUI = function () {
		var apGUI = AutoPerks.GUI;
		var $buttonbar = document.getElementById("portalBtnContainer");
		apGUI.$allocatorBtn1 = document.createElement("DIV");
		apGUI.$allocatorBtn1.id = 'allocatorBtn1';
		apGUI.$allocatorBtn1.setAttribute('class', 'btn inPortalBtn settingsBtn settingBtntrue');
		apGUI.$allocatorBtn1.setAttribute('onclick', 'runSurky()');
		apGUI.$allocatorBtn1.textContent = 'Allocate Perks';
		$buttonbar.appendChild(apGUI.$allocatorBtn1);
		$buttonbar.setAttribute('style', 'margin-bottom: 0.8vw;');
		apGUI.$customRatios = document.createElement("DIV");
		apGUI.$customRatios.id = 'customRatios';
		//Line 1 of the UI
		apGUI.$ratiosLine1 = document.createElement("DIV");
		apGUI.$ratiosLine1.setAttribute('style', 'display: inline-block; text-align: center; width: 100%');
		apGUI.$ratiosLine1.setAttribute('onchange', 'saveSurkySettings()');
		var listratiosTitle1 = ["Weight: Attack", "Weight: Health", "Weight: Radon"];
		var listratiosLine1 = ["clearWeight", "survivalWeight", "radonWeight"];
		for (var i in listratiosLine1)
			AutoPerks.createInput(listratiosLine1[i], apGUI.$ratiosLine1, listratiosTitle1[i]);
		apGUI.$customRatios.appendChild(apGUI.$ratiosLine1);

		//Hide these elements - Line 2
		apGUI.$ratiosLine2 = document.createElement("DIV");
		apGUI.$ratiosLine2.setAttribute('style', 'display: inline-block; text-align: center; width: 100%');
		apGUI.$ratiosLine2.setAttribute('onchange', 'saveSurkySettings()');
		var listratiosTitle2 = ["Target Zone", "Coord Limited (0-1)", "Weapon Levels", "Armor Levels"];
		var listratiosLine2 = ["targetZone", "coordLimited", "weaponLevels", "armorLevels"];
		for (var i in listratiosLine2)
			AutoPerks.createInput(listratiosLine2[i], apGUI.$ratiosLine2, listratiosTitle2[i]);

		//Hide these elements - Line 3
		apGUI.$ratiosLine3 = document.createElement("DIV");
		apGUI.$ratiosLine3.setAttribute('style', 'display: none; text-align: center; width: 100%');
		apGUI.$ratiosLine3.setAttribute('onchange', 'saveSurkySettings()');
		var listratiosTitle3 = ["Tributes purchased", "Meteorologists", "Collector count", "Smithy count", "Rn Gain per Farming Run"];
		var listratiosLine3 = ['tributes', "meteorologists", "housingCount", "smithyCount", "radonPerRun"];
		for (var i in listratiosLine3)
			AutoPerks.createInput(listratiosLine3[i], apGUI.$ratiosLine3, listratiosTitle3[i]);

		apGUI.$presetLabel = document.createElement("Label");
		apGUI.$presetLabel.id = 'Ratio Preset Label';
		apGUI.$presetLabel.innerHTML = "&nbsp;&nbsp;&nbsp;Preset:";
		apGUI.$presetLabel.setAttribute('style', 'margin-right: 0.5vw; color: white; font-size: 0.9vw;');
		apGUI.$preset = document.createElement("select");
		apGUI.$preset.id = 'presetElem';
		apGUI.$preset.setAttribute('onchange', 'fillPreset()');
		oldstyle = 'text-align: center; width: 8vw; font-size: 0.8vw; font-weight: lighter; ';
		if (game.options.menu.darkTheme.enabled != 2) apGUI.$preset.setAttribute("style", oldstyle + " color: black;");
		else apGUI.$preset.setAttribute('style', oldstyle);
		apGUI.$preset.innerHTML = presetListHtml;
		var loadLastPreset = (JSON.parse(localStorage.getItem("surkyInputs")) !== null) ? JSON.parse(localStorage.getItem("surkyInputs")).preset : null;
		var setID;
		if (loadLastPreset != null) {
			if (loadLastPreset == 15 && !JSON.parse(localStorage.getItem("surkyInputs")).preset)
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
		loadSurkySettings();
		initialLoad();
		showingSurky = true;
	}

	AutoPerks.displayGUI();
}

function saveSurkySettings(initial) {
	if (!initial) {
		initPerks();
		readInputs();
	}
	const surkyInputs = {
		preset: $$('#presetElem').value,
		radonWeight: $$('#radonWeight').value === '' ? 1 : $$('#radonWeight').value,
		clearWeight: $$('#clearWeight').value === '' ? 1 : $$('#clearWeight').value,
		survivalWeight: $$('#survivalWeight').value === '' ? 1 : $$('#survivalWeight').value,
		targetZone: $$('#targetZone').value,
		radonPerRun: $$('#radonPerRun').value,
		coordLimited: $$('#coordLimited').value === '' ? 0 : $$('#coordLimited').value,
		weaponLevels: $$('#weaponLevels').value,
		armorLevels: $$('#armorLevels').value,
		tributes: $$('#tributes').value,
		meteorologists: $$('#meteorologists').value,
		housingCount: $$('#housingCount').value,
		smithyCount: $$('#smithyCount').value,
		ezWeights: props.ezWeights,
		tuWeights: props.tuWeights,
		pushWeights: props.pushWeights,
		alchWeights: props.alchWeights,
	}

	localStorage.setItem("surkyInputs", JSON.stringify(surkyInputs));
}

function loadSurkySettings() {
	let surkyInputs = JSON.parse(localStorage.getItem("surkyInputs"));
	if (surkyInputs === null) {
		saveSurkySettings(true);
		loadSurkySettings();
		return;
	}
	//Top Row
	if (surkyInputs.preset !== null && surkyInputs.preset !== undefined)
		$$('#presetElem').value = surkyInputs.preset
	if (surkyInputs.radonWeight !== null && surkyInputs.radonWeight !== undefined)
		$$('#radonWeight').value = surkyInputs.radonWeight
	if (surkyInputs.clearWeight !== null && surkyInputs.clearWeight !== undefined)
		$$('#clearWeight').value = surkyInputs.clearWeight
	if (surkyInputs.survivalWeight !== null && surkyInputs.survivalWeight !== undefined)
		$$('#survivalWeight').value = surkyInputs.survivalWeight
	if (surkyInputs.targetZone !== null && surkyInputs.targetZone !== undefined)
		$$('#targetZone').value = surkyInputs.targetZone
	//Second Row
	if (surkyInputs.radonPerRun !== null && surkyInputs.radonPerRun !== undefined)
		$$('#radonPerRun').value = surkyInputs.radonPerRun
	if (surkyInputs.coordLimited !== null && surkyInputs.coordLimited !== undefined)
		$$('#coordLimited').value = surkyInputs.coordLimited
	if (surkyInputs.weaponLevels !== null && surkyInputs.weaponLevels !== undefined)
		$$('#weaponLevels').value = surkyInputs.weaponLevels
	if (surkyInputs.armorLevels !== null && surkyInputs.armorLevels !== undefined)
		$$('#armorLevels').value = surkyInputs.armorLevels
	//Third Row
	if (surkyInputs.tributes !== null && surkyInputs.tributes !== undefined)
		$$('#tributes').value = surkyInputs.tributes
	if (surkyInputs.meteorologists !== null && surkyInputs.meteorologists !== undefined)
		$$('#meteorologists').value = surkyInputs.meteorologists
	if (surkyInputs.housingCount !== null && surkyInputs.housingCount !== undefined)
		$$('#housingCount').value = surkyInputs.housingCount
	if (surkyInputs.smithyCount !== null && surkyInputs.smithyCount !== undefined)
		$$('#smithyCount').value = surkyInputs.smithyCount
}

const equipScalingPrestige = {
	attack: Math.pow(Math.pow(1.19, 13), 1 / Math.log(Math.pow(1.069, (57 * 0.85)))),
	health: Math.pow(Math.pow(1.19, 14), 1 / Math.log(Math.pow(1.069, (57 * 0.85)))),
}
// Zone scaling after 60 (always used, just means we're a bit conservative at lower zones)
//  HP: sqrt(zone) * (3.265^(1/2) * 1.1 * 1.32)^zone
// ATK: sqrt(zone) * (3.27^(1/2) * 1.15 * 1.32)^zone 
// Note that sqrt(zone) is accounted for in the props after getting a target zone from the user.
const logEnemyHealthScaling = Math.log(Math.sqrt(3.265) * 1.1 * 1.32);
const logEnemyAttackScaling = Math.log(Math.sqrt(3.27) * 1.15 * 1.32);
// Quick and dirty hack: estimate about 60% Rn from VMs for VS1.
// This can and should be a user input if and when we make such things hide-able.
const vmRadFrac = 0.6;

// exponentially weighted moving average parameters for Rn/run
const rnAlpha = 0.3;
const rnTerms = 10;
var rnMAWeights = new Array(rnTerms);
rnMAWeights[0] = rnAlpha;
var rnMAWeightSum = rnAlpha;
for (var i = 1; i < rnTerms; i++) {
	rnMAWeights[i] = rnMAWeights[i - 1] * (1 - rnAlpha);
	rnMAWeightSum += rnMAWeights[i];
}
// correct weights to sum to 1 with limited # of terms
for (var i = 0; i < rnTerms; i++) {
	rnMAWeights[i] /= rnMAWeightSum;
}

// initialize perks object to default values
function initPerks() {
	var surkyInputs = JSON.parse(localStorage.getItem("surkyInputs"));
	//if (surkyInputs === null) return;

	props = {
		portalRadon: 0,
		// total radon available to use on the current portal
		earnedRadon: 0,
		// total radon, including that earned this run
		perksRadon: 0,
		// total radon available for perks in this optimization run
		perksRadonFromSave: 0,
		radonSpent: 0,
		// radon spent on perks so far
		radonPerRun: 0,
		// radon per farming run (needed to value trinket gains)
		radonPerTrinket: 0,
		// the Rn-equivalent value of a marginal trinket
		trinketRadonPerRun: 0,
		// baseline total radon value of expected trinkets gained per run at current perks
		baselineTrinketsNext: 0,
		// end of next run expected trinket count at current Observation
		//shieldCC: 0, // TONOTDO: strictly, this matters. sort of. if it's <100% it affects the value of criticality. also in Duel. but we can ignore this for a start.
		shieldCD: 0,
		shieldPrismal: 0,
		healthDerate: 1,
		// inequality makes raw health boosts less useful, so we derate health weight by this factor (based on inequality from equipped shield)
		smithyScaling: 50,
		tributes: 0,
		trinkets: game.portal.Observation.trinkets,
		imperzone: 0,
		expanding: false,
		actualTaunts: 0,
		housingCount: 0,
		hubEnabled: 0,
		collectHubs: 1,
		meteorologists: 0,
		tenacityTime: 10,
		// minutes of tenacity to optimize for (hardcoded to 10mins - this is not relevant for long and the input box added clutter and resulted in a lot of questions)
		coordLimited: 0,
		// 0-1 value of "how coord limited" we are
		trapHrs: 5,
		// hours of trapping
		findPots: 0,
		// finding potions purchased in alchemy
		shinyTable: [0],
		// memoization table for trinket drops
		clearWeight: $$('#clearWeight').value !== '' ? Number($$('#clearWeight').value) : (surkyInputs !== null) ? Number(surkyInputs.clearWeight) : 1,
		survivalWeight: $$('#survivalWeight').value !== '' ? Number($$('#survivalWeight').value) : (surkyInputs !== null) ? Number(surkyInputs.survivalWeight) : 1,
		radonWeight: $$('#radonWeight').value !== '' ? Number($$('#radonWeight').value) : (surkyInputs !== null) ? Number(surkyInputs.radonWeight) : 1,
		scruffyLevel: 0,
		weaponLevels: 1,
		armorLevels: 1,
		coefC: 0,
		// tauntimp correction parameter
		termR: 0,
		// tauntimp correction parameter
		hazzie: false,
		// hazardous shield? (if so take golden void if Rn weight > 0)
		bestPerk: "",
		// 
		hideUnused: false,
		hideLocked: true,
		showLevelLocks: false,
		darkMode: false,
		ezWeights: (surkyInputs !== null && surkyInputs.ezWeights !== undefined && surkyInputs.ezWeights !== null) ? (surkyInputs.ezWeights) : null,
		tuWeights: (surkyInputs !== null && surkyInputs.tuWeights !== undefined && surkyInputs.tuWeights !== null) ? (surkyInputs.tuWeights) : null,
		alchWeights: (surkyInputs !== null && surkyInputs.tuWeights !== undefined && surkyInputs.alchWeights !== null) ? (surkyInputs.alchWeights) : null,
		pushWeights: (surkyInputs !== null && surkyInputs.tuWeights !== undefined && surkyInputs.pushWeights !== null) ? (surkyInputs.pushWeights) : null,
		gbAfterpush: false,
		// is GB used in the afterpush?
		s3Rn: true,
		// should S3 (and VS1) be counted as boosting Rn? (selectable by user, could un-select if the next run will be non-farming)
		glassDone: false,
		// do we have the glass reward?
		glassRadon: false,
		// ...and does it get us more radon for more pushing power? (i.e. can we increase our VM zone within the current challenge)
		scaffoldingBonus: 0,
		// scaffolding, SA reward that increases population
		permaFrenzy: false,
		// Mass Hysteria, SA reward that makes frenzy permanent
		baitDump: false,
		// secret setting to dump remaining Rn into bait after all other perks
		autoFill: false,
		// fill the perk string on autobuy (but don't copy it)
		specialChallenge: null,
		// does the dropdown specify a special challenge?
		trappaStartPop: 1,
		// avoid NaNs before calculating perks
		potency: 0.0085,
		// breed speed base
		maxTrimps: 0,
		// max trimps BEFORE carp bonus in current save
		coordsBought: 0,
		// coords bought in current save
		isTrappa: false,
		// is the imported save in trappa right now?
		isDownsize: false,
		// is the imported save in downsize right now?
		armySize: 0,
		// army size in current save
		currentWorld: 0,
		// world zone of current save
		carpNeeded: 0,
		// carp levels needed to afford all coords at target zone (based on current save)
		// scaling^log(resource boost) = atk or hp boost
		equipScaling: {
			attack: equipScalingPrestige.attack,
			health: equipScalingPrestige.health,
		},
		logEnemyScaling: (logEnemyAttackScaling + logEnemyHealthScaling),
	};
	perks = {
		Agility: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 4,
			priceFact: 1.3,
			max: 20,
		},
		Artisanistry: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 15,
			priceFact: 1.3,
			effect: 1 / 0.95,
			efficiency: 0,
		},
		Bait: {
			optimize: false,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 4,
			priceFact: 1.3,
		},
		Carpentry: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 25,
			priceFact: 1.3,
			effect: 1.1,
			efficiency: 0,
		},
		Criticality: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 100,
			priceFact: 1.3,
			effect: 0.1,
			efficiency: 0,
		},
		Equality: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 1,
			priceFact: 1.5,
			effect: 1 / 0.9,
			efficiency: 0,
		},
		Championism: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 1e9,
			priceFact: 5,
			effect: 0,
			// defined on save-load based on SA progress
			efficiency: 0,
		},
		Frenzy: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 1000000000000000,
			priceFact: 1.3,
			effect: 0.5,
			procEffect: 0.001,
			timeEffect: 5,
			efficiency: 0,
		},
		Greed: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 10000000000,
			priceFact: 1.3,
			effect: 0,
			// based on tributes
			max: 40,
			efficiency: 0,
		},
		Hunger: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 1000000,
			priceFact: 1.3,
			max: 30,
		},
		Looting: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 1,
			priceFact: 1.3,
			effect: 0.05,
			efficiency: 0,
		},
		Motivation: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 2,
			priceFact: 1.3,
			effect: 0.05,
			efficiency: 0,
		},
		Observation: {
			optimize: true,
			locked: true,
			levLocked: false,
			canDisable: true,
			level: 0,
			priceBase: 5000000000000000000,
			priceFact: 2,
			max: 50,
			efficiency: 0,
			efficiency2: 0,
			// we check for buying 2 obs levels as this may be super-extra-efficient for the extra guaranteed Rt drops
		},
		Packrat: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 3,
			priceFact: 1.3,
			effect: 0.2,
			efficiency: 0,
		},
		Pheromones: {
			optimize: false,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 3,
			priceFact: 1.3,
			effect: 0.1,
			efficiency: 0,
		},
		Power: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 1,
			priceFact: 1.3,
			effect: 0.05,
			efficiency: 0,
		},
		Prismal: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 1,
			priceFact: 1.3,
			effect: 0.01,
			max: 100,
			efficiency: 0,
		},
		Range: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 1,
			priceFact: 1.3,
			max: 10,
		},
		Resilience: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 100,
			priceFact: 1.3,
			effect: 1.1,
			efficiency: 0,
		},
		Masterfulness: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 100e21,
			priceFact: 50,
			max: 10,
			effect: 1,
			efficiency: 0,
		},
		Tenacity: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 50000000,
			priceFact: 1.3,
			effect: 0,
			// based on tenacityTime
			max: 40,
			efficiency: 0,
		},
		Toughness: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 1,
			priceFact: 1.3,
			effect: 0.05,
			efficiency: 0,
		},
		Trumps: {
			optimize: false,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 3,
			priceFact: 1.3,
		},
		Smithology: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 100e21,
			priceFact: 4,
			effect: 1,
			efficiency: 0,
		},
		Expansion: {
			optimize: true,
			locked: true,
			levLocked: false,
			level: 0,
			priceBase: 100e21,
			priceFact: 3,
			effect: 1,
			efficiency: 0,
		},
	};
}

// the key is a value name from the props object used to hold various optimization properties
//  under each key is an object with "input" and "checkbox" properties holding references to the DOM objects for the input box and it's locking checkbox
var auxInputs = {};

// set aux input only if not locked
function setAuxInput(key, value) {
	$$('#' + key).value = value;
}

// fill preset weights from the dropdown menu and set special challenge
function fillPreset(specificPreset) {
	if (specificPreset) $$('#presetElem').value = specificPreset
	initPerks();
	var preset = $$('#presetElem').value;
	var weights = [0, 0, 0];
	if (preset == 'ezfarm') {
		weights = (props.ezWeights === null) ? [0, 0, 1] : props.ezWeights;
	} else if (preset == 'tufarm') {
		weights = (props.tuWeights === null) ? [1, 0.5, 15] : props.tuWeights;
		// with GU recommendations, we want a big Rn weight
	} else if (preset == 'push') {
		weights = (props.pushWeights === null) ? [1, 1, 0] : props.pushWeights;
	} else if (preset == 'alchemy') {
		weights = (props.alchWeights === null) ? [1, 0.01, 10] : props.alchWeights;
	} else if (preset == 'trappa') {
		weights = [1, 1.5, 0];
	} else if (preset == 'downsize') {
		weights = [1, 1, 0];
	} else if (preset == 'duel') {
		weights = [1, 0.2, 0];
	} else if (preset == 'berserk') {
		weights = [1, 0.5, 0];
	} else if (preset == 'smithless') {
		weights = [1, 0.5, 0];
	} else if (preset == 'combat') {
		weights = [1, 0.1, 0];
	}
	presetSpecialOpt();
	// set special optimizations
	$$('#clearWeight').value = weights[0];
	$$('#survivalWeight').value = weights[1];
	$$('#radonWeight').value = weights[2];
	saveSurkySettings();
	//evaluatePerks();
}

function presetSpecialOpt() {
	var preset = presetElem.value;
	if (preset == 'alchemy') {
		props.specialChallenge = 'alchemy';
	}
	if (preset == 'trappacarp') {
		props.specialChallenge = 'trappacarp';
	}
	if (preset == 'trappa') {
		props.specialChallenge = 'trappa';
		perks.Bait.optimize = true;
		perks.Pheromones.optimize = false;
	} else {
		perks.Bait.optimize = false;
		if (game != null && game.stats.highestRadLevel.valueTotal() >= 60)
			perks.Pheromones.optimize = true;
	}
	if (preset == 'downsize') {
		props.specialChallenge = 'downsize';
		perks.Trumps.optimize = true;
	} else {
		perks.Trumps.optimize = false;
	}
	if (preset == 'berserk') {
		props.specialChallenge = 'berserk';
		perks.Frenzy.optimize = false;
	} else {
		perks.Frenzy.optimize = true;
	}
	if (preset == 'smithless') {
		props.specialChallenge = 'smithless';
		perks.Smithology.optimize = false;
	} else {
		perks.Smithology.optimize = true;
	}
	if (preset == 'equip') {
		props.specialChallenge = 'equip';
	}
	if (preset == 'combat') {
		props.specialChallenge = 'combat';
		if (props.isTrappa) {
			perks.Bait.optimize = false;
			perks.Pheromones.optimize = false;
		}
	}
	if (preset == 'resplus') {
		props.specialChallenge = 'resplus';
	}
	if (preset == 'resminus') {
		props.specialChallenge = 'resminus';
	}
}

function initialLoad() {

	initPerks();
	var portal = game.portal;

	// set perk object to default values
	var bdTmp = props.baitDump;
	var afTmp = props.autoFill;
	var ezTmp = props.ezWeights;
	var tuTmp = props.tuWeights;
	var alTmp = props.alchWeights;
	var puTmp = props.pushWeights;
	props.baitDump = bdTmp;
	props.autoFill = afTmp;
	props.ezWeights = ezTmp;
	props.tuWeights = tuTmp;
	props.alchWeights = alTmp;
	props.pushWeights = puTmp;
	props.darkMode = false;

	// read save into input perk fields
	// enable perks (in input fields and perks object) based on locked status from save
	// DO NOT update perk object levels yet
	for (var [key, value] of Object.entries(perks)) {
		if (typeof (value) !== "object" || !value.hasOwnProperty("optimize"))
			continue;
		// iterating over the perks, ignoring aux values
		if (portal.hasOwnProperty(key)) {
			var portalPerk = portal[key];
			var calcPerk = perks[key];
			calcPerk.locked = portalPerk.radLocked;
		} else {
			perks[key].level = 0;
		}
	}

	// needs to be after perks since it looks at perk values
	presetSpecialOpt();

	// set aux inputs from game variables, unless any given field is locked (handled by setAuxInput function)

	// "red" fields should only be overwritten if loading a U2 save (values will be garbage in U1) -- Surky is gonna break if portal Universe isn't set to 2 here!
	let surkyInputs = JSON.parse(localStorage.getItem("surkyInputs"));
	// target zone to CLEAR is 1 zone before the portal zone by default
	var currentZone = Math.max(1, game.global.world - 1);
	$$('#targetZone').value = Math.max(currentZone, surkyInputs.targetZone);
	props.targetZone = Number($$('#targetZone').value);

	// weapon/armor levels taken from dagger/boots (most likely to be leveled highest)
	var weaponLevels = (game.equipment.Dagger.level || 1);
	$$('#weaponLevels').value = Math.min(weaponLevels, surkyInputs.weaponLevels);
	props.weaponLevels = Number($$('#weaponLevels').value);

	var armorLevels = (game.equipment.Boots.level || 1);
	$$('#armorLevels').value = Math.min(armorLevels, surkyInputs.armorLevels);
	props.armorLevels = Number($$('#armorLevels').value);

	// get current purchased tributes, mets, etc
	var tributeCount = (game.buildings.Tribute.owned || 0);
	$$('#tributes').value = Math.max(tributeCount, surkyInputs.tributes);
	props.tributes = Number($$('#tributes').value);

	var metCount = (game.jobs.Meteorologist.owned || 0);
	$$('#meteorologists').value = Math.max(metCount, surkyInputs.meteorologists);
	props.meteorologists = Number($$('#meteorologists').value);

	var smithyCount = (game.buildings.Smithy.owned || 0);
	$$('#smithyCount').value = Math.max(smithyCount, surkyInputs.smithyCount);
	props.smithyCount = Number($$('#smithyCount').value);

	var rnPerRun = (game.resources.radon.owned || 0);
	$$('#radonPerRun').value = Math.max(rnPerRun, surkyInputs.radonPerRun);
	props.radonPerRun = Number($$('#radonPerRun').value);

	// get count of best housing building (don't bother optimizing lower than gateways, the 2nd-order adjustments won't matter enough to bother)
	var housingCount = (game.buildings.Collector.owned || 0);
	$$('#housingCount').value = Math.max(housingCount, surkyInputs.housingCount)
	props.housingCount = Number($$('#housingCount').value);


	props.vmZone = Math.max(15, (props.targetZone - 1));
	var rawRnRun = game.resources.radon.owned;
	props.radonPerRun = Number($$('#radonPerRun').value);
	// if Rn/run is locked, believe it, and force the old history (lets the user manually correct an error)
	// also for easier testing (and to prevent long term problems with bad user input), assume an input greater than lifetime radon is not something the user wants semi-permanently locked 
	if (rawRnRun > parseFloat($$('#radonPerRun').value) / 20 || parseFloat($$('#radonPerRun').value) >= game.global.totalRadonEarned && rawRnRun > game.global.totalRadonEarned / 1e6) {
		var history = new Array(rnTerms);
		// maintain a history of the last 10 farming runs' Rn gain, and evaluate an exponentially weighted moving average over this history
		if (window.localStorage.getItem("rPrHistory")) {
			history = JSON.parse(window.localStorage.getItem("rPrHistory"));
		}
		for (var i = rnTerms - 1; i >= 0; i--) {
			// any uninitialized value just gets the current Rn/run (should only happen once per user's localStorage)
			if (!(history[i] > 0))
				history[i] = rawRnRun;
		}
		for (var i = rnTerms - 1; i > 0; i--) {
			history[i] = history[i - 1];
			// shift all history entries one run older
		}
		history[0] = rawRnRun;
		var ewma = 0;
		for (var i = 0; i < rnTerms; i++) {
			ewma += history[i] * rnMAWeights[i];
		}
		window.localStorage.setItem("rPrHistory", JSON.stringify(history));
		$$('#radonPerRun').value = ewma;
		props.radonPerRun = Number($$('#radonPerRun').value);
	}
	if (parseFloat($$('#radonPerRun').value) < game.global.totalRadonEarned / 1e6) {
		// if a new user of the calculator happens to be starting from a battle spec or U1 save, give them a not completely stupid Rn/run value
		//  -> This is likely to be inaccurate and give shitty results for a few runs, but it's better than accepting some comparatively minuscule value incorrectly.
		rawRnRun = game.global.bestRadon / 5;
		if (!(rawRnRun > 30))
			rawRnRun = 30;
		$$('#radonPerRun').value = rawRnRun;
		props.radonPerRun = Number($$('#radonPerRun').value);
	}

	// scaffolding increases population (relevant for Combat Respec and Trappa)
	var scaffolds = autoBattle.bonuses.Scaffolding.level;
	props.scaffoldingBonus = 1 + (scaffolds * Math.pow(1.1, scaffolds - 1));

	// Expanding Tauntimps are a flat multiplier to pop instead of adding one by one to trimps.max
	props.expanding = game.global.expandingTauntimp;
	props.actualTaunts = game.unlocks.impCount.Tauntimp;

	// initially used only for combat respec preset which REQUIRES an import at the point of respec, and not displayed anywhere
	props.maxTrimps = game.resources.trimps.max * props.scaffoldingBonus;
	props.coordsBought = game.upgrades.Coordination.done;
	props.armySize = game.resources.trimps.maxSoldiers;
	props.currentWorld = game.global.world;

	// remaining fields are "safe" to load from a U1 save because they are persistent regardless of universe

	props.hubEnabled = game.global.exterminateDone;
	props.antennae = game.buildings.Antenna.owned;
	props.canGUString = game.global.canGuString;

	// More Imports bone bonus
	props.moreImps = game.permaBoneBonuses.exotic.owned;

	// Glass reward determines whether additional VM zones increase radon above 175
	props.glassDone = game.global.glassDone || false;

	// Mass Hysteria grants permanent Frenzy
	props.permaFrenzy = autoBattle.oneTimers.Mass_Hysteria.owned;

	// used for combat respec to apply special optimizations for trappa (no gain from health, full gain from equality)
	props.isTrappa = game.global.challengeActive == "Trappapalooza";

	// used for combat reset to avoid reducing Carp, as the game uses a special calculation for Downsize population not accessible in the save object
	props.isDownsize = game.global.challengeActive == "Downsize";

	// SA cleared level
	var SAlevel = (autoBattle.maxEnemyLevel - 1) || 0;

	// Championism effect is 1% plus 0.5% per SA level cleared
	perks.Championism.effect = 1.01 + 0.005 * SAlevel;

	// property will not be defined in the save if not owned, convert undefined to false
	var haveCollectology = autoBattle.oneTimers.Collectology.owned || false;
	props.collectHubs = !haveCollectology ? 1 : (2 + Math.floor(SAlevel / 30));

	// calculate Scruffy level (adapted from Fluffy.getLevel() in the game source code)
	props.scruffyLevel = Math.floor(Math.log(((game.global.fluffyExp2 / 1000) * 3) + 1) / Math.log(4));

	var shield = null;
	if (game.global.universe == 2 && Object.keys(game.global.ShieldEquipped).length !== 0)
		shield = game.global.ShieldEquipped;
	else if (game.global.lastHeirlooms.u2 && game.global.lastHeirlooms.u2.Shield) {
		if (game.global.lastHeirlooms.u2.Shield == game.global.ShieldEquipped.id) {
			shield = game.global.ShieldEquipped;
		} else {
			shield = game.global.heirloomsCarried.find(function (s) {
				return s.id == game.global.lastHeirlooms.u2.Shield;
			});
		}
	}
	if (shield) {
		var critDamageMod = shield.mods.find(function (el) {
			return el[0] == "critDamage";
		});
		var prismalMod = shield.mods.find(function (el) {
			return el[0] == "prismatic";
		});
		var ineqMod = shield.mods.find(function (el) {
			return el[0] == "inequality";
		});

		if (critDamageMod) {
			props.shieldCD = Math.round(critDamageMod[1] / 10);
		} else {
			props.shieldCD = 0;
		}
		if (prismalMod) {
			props.shieldPrismal = Math.round(prismalMod[1]);
		} else {
			props.shieldPrismal = 0;
		}
		if (ineqMod) {
			props.healthDerate = Math.log(0.9 + ineqMod[1] / 10000) / Math.log(0.9)
		} else {
			props.healthDerate = 1;
		}
		props.hazzie = shield.rarity >= 10;
	}

	// Suprism gives 3% prismal shield per SA level
	var haveSuprism = autoBattle.oneTimers.Suprism.owned;
	if (haveSuprism)
		props.shieldPrismal += 3 * SAlevel;

	// read and process all input fields
	inputs = perks;
	readInputs();

	props.portalRadon = game.global.totalRadonEarned - game.resources.radon.owned;
	props.earnedRadon = game.global.totalRadonEarned;
	switchTotalRadon();
}

function getPerkCost(whichPerk, numLevels, fromZero = false) {
	if (numLevels === 0)
		return 0;
	var perk = perks[whichPerk];
	if (!perk.hasOwnProperty("optimize"))
		console.log("ERROR getting perk cost: " + whichPerk + " is not a known perk.");
	var level = fromZero ? 0 : perk.level;
	// if the perk can't be leveled, return infinite cost to naturally avoid buying the perk
	if (perk.locked || perk.hasOwnProperty("max") && (level + numLevels > perk.max))
		return Infinity;
	var cost = 0;
	for (var i = 0; i < numLevels; i++) {
		cost += Math.ceil(level / 2 + perk.priceBase * Math.pow(perk.priceFact, level));
		level++;
	}
	return cost;
}

function couldBuyPerk(whichPerk, actuallyBuy = false, numLevels = 1) {
	var perk = perks[whichPerk];
	if (perk.hasOwnProperty("max")) {
		if (perk.level > perk.max)
			console.log("ERROR: perk " + whichPerk + " exceeded max level!");
		if (perk.level + numLevels > perk.max)
			return false;
	}
	var cost = getPerkCost(whichPerk, numLevels);
	if (cost + props.radonSpent > props.perksRadon)
		return false;
	if (actuallyBuy) {
		props.radonSpent += cost;
		perk.level += numLevels;
	}
	return true;
}

function buyPerk(whichPerk, numLevels = 1) {
	return couldBuyPerk(whichPerk, true, numLevels);
}

function getGreedEffect(tribs) {
	if (tribs > 1250)
		tribs = 1250;
	tribs -= 600;
	var mod = 1.025;
	if (tribs > 0) {
		mod += (0.00015 * tribs);
		//+0.015% per tribute above 600
		mod += (Math.floor(tribs / 25) * 0.0035);
		//+0.35% per 25 tributes above 600
	}
	return mod;
}

// get the first-order feedback from Greed of a given boost to resources via more tributes
function getGreedResourceFeedback(resBoost, tribs) {
	if (tribs >= 1250)
		return [1, tribs];
	var tribsGained = Math.log(resBoost) / Math.log(1.05);
	if (tribs + tribsGained < 600)
		return [1, tribs];
	if (tribs + tribsGained > 1250)
		tribsGained = 1250 - tribs;
	if (tribs < 600)
		tribsGained = tribs + tribsGained - 600;
	// don't go by specific breakpoints which we'd be foolish to tie to a specific resource gain, just smooth the every-25 bonus out evenly per tribute
	var baseGreed = getGreedEffect(tribs);
	var greedGain = (baseGreed + 0.00029 * tribsGained) / baseGreed;
	return [Math.pow(greedGain, perks.Greed.level), tribs + tribsGained];
}

function getTenacityEffect(time) {
	if (time <= 60) {
		time *= (10 / 6)
	} else {
		time -= 60;
		time *= (2 / 6);
		time += 100;
	}
	return (1.1 + (Math.floor(time / 4) * 0.01));
}

function legalizeInput(val, backup) {
	if (isNaN(val))
		return backup;
	return val;
}

function readInputs() {
	// get perk levels and locked/unlocked status, and calculate total Rn cost
	for (var [perkName, perkObj] of Object.entries(perks)) {
		if (typeof (perkObj) !== "object" || !perkObj.hasOwnProperty("optimize"))
			continue;
		// iterating over the perks, ignoring aux values
		//perkObj.locked = !inputs[perkName + "-enabled"].checked;
		//perkObj.levLocked = inputs[perkName + "-noopt"].checked;
		perkObj.level = parseInt(inputs[perkName].level) || 0;
		if (perkObj.hasOwnProperty("max") && perkObj.level > perkObj.max) {
			perkObj.level = perkObj.max;
			inputs[perkName].level = perkObj.max;
		}
	}
	props.radonSpent = getTotalPerksCost();

	// reset the memoization results for the shinyTable, in case the target zone changed
	props.shinyTable = [0];
	// 0 obs = 0 trinkets (won't occur when obs is unlocked since there's 1 free level)

	// is GB used in the afterpush from farming?
	//props.gbAfterpush = inputs['gb-afterpush'].checked;

	// should S3 & VS1 be counted for Rn gains? (i.e. are we chain farming?)
	// -> note at Obs 0 this will be assumed by the value calculation regardless of checked or not if clear weight is 0, else
	//      pushing perks would get no value whatsoever.
	//props.s3Rn = inputs['s3-rn'].checked;

	// Accuracy doesn't matter prior to Obs, but 0 will give no value to radon gains so >0 is needed.
	props.radonPerRun = Math.max(1, props.radonPerRun);

	// final enemy HP/ATK scaling including the sqrt(zone) component:
	//   (note we don't divide by 2, because we're adding the two log sqrt components together)
	props.logEnemyScaling = logEnemyHealthScaling + logEnemyAttackScaling + Math.log(1 + 1 / props.targetZone);
	if (props.targetZone >= 300)
		props.logEnemyScaling += 2 * Math.log(1.15);

	// calculate equipment resource scaling for atk/hp based on weaponl/armor levels
	var wLevScaling = Math.pow((props.weaponLevels + 1) / (props.weaponLevels), 1 / Math.log(1.2));
	props.equipScaling.attack = Math.min(wLevScaling, equipScalingPrestige.attack);
	var aLevScaling = Math.pow((props.armorLevels + 1) / (props.armorLevels), 1 / Math.log(1.2));
	props.equipScaling.health = Math.min(aLevScaling, equipScalingPrestige.health);

	// calculate greed effect from tribute count
	perks.Greed.effect = getGreedEffect(props.tributes);

	// use tenacity time to calculate tenacity effect
	//   -> for any radon weight we presume we don't have high tenacity time (and radon will dominate for MF regardless)
	//   -> for no radon weight we presume we're pushing and care about tenacity more
	if (props.radonWeight > 0) {
		if (props.vmZone > 200) {
			props.tenacityTime = 40;
			// might matter a tiny bit for masterfulness in the post-Hypo meta :shrug:
		} else {
			props.tenacityTime = 10;
		}
	} else {
		props.tenacityTime = 120;
	}
	perks.Tenacity.effect = getTenacityEffect(props.tenacityTime);

	// triple-checking that coordlimited is not less than 0
	props.coordLimited = Number($$('#coordLimited').value);
	if (props.coordLimited < 0)
		props.coordLimited = 0;
	// let the user set coordLimited > 1 if they like to give extra population weight, despite saying they can't ;p
	//if (props.coordLimited > 1) props.coordLimited = 1;

	// S15 is a reduction in smithy cost scaling
	if (props.scruffyLevel >= 14)
		props.smithyScaling = 40;
	else
		props.smithyScaling = 50;

	// approximate number of imp-orts of a given type per zone
	// FIXME someday: this isn't actually how randimps work.
	props.imperzone = (props.scruffyLevel >= 9 ? 3.5 : 3) + props.moreImps * 0.05 + 3.0 / 5;

	// get potency mod from target zone (div by 10 to get per-tick potency which is what's actually used in-game)
	props.potency = 0.00085 * Math.pow(1.1, Math.floor(props.targetZone / 5)) * Math.pow(1.003, props.targetZone * props.imperzone);

	// is our VM zone in the range for Hypo? then Glass can help us get more radon
	// TODO: expand this to any future radon challenges
	props.glassRadon = props.glassDone && (props.vmZone > 174 && props.vmZone < 200 || props.vmZone > 200);

	var preset = presetElem.value;
	if (preset == 'alchemy') {
		props.specialChallenge = 'alchemy';
	} else if (preset == 'trappacarp') {
		props.specialChallenge = 'trappacarp';
	} else if (preset == 'trappa') {
		props.specialChallenge = 'trappa';
	} else if (preset == 'downsize') {
		props.specialChallenge = 'downsize';
	} else if (preset == 'duel') {
		props.specialChallenge = 'duel';
	} else if (preset == 'berserk') {
		props.specialChallenge = 'berserk';
	} else if (preset == 'smithless') {
		props.specialChallenge = 'smithless';
	} else if (preset == 'equip') {
		props.specialChallenge = 'equip';
	} else if (preset == 'combat') {
		props.specialChallenge = 'combat';
	} else if (preset == 'resplus') {
		props.specialChallenge = 'resplus';
	} else if (preset == 'resminus') {
		props.specialChallenge = 'resminus';
	} else
		props.specialChallenge = null;

	// store weights under the current preset for Rn/Push weights
	if (preset == 'ezfarm') {
		props.ezWeights = [props.clearWeight, props.survivalWeight, props.radonWeight];
	} else if (preset == 'tufarm') {
		props.tuWeights = [props.clearWeight, props.survivalWeight, props.radonWeight];
	} else if (preset == 'push') {
		props.pushWeights = [props.clearWeight, props.survivalWeight, props.radonWeight];
	} else if (preset == 'alchemy') {
		props.alchWeights = [props.clearWeight, props.survivalWeight, props.radonWeight];
	}

	// calculate coefficients for tauntimp housing correction
	var housingTypes = {
		collector: [50, 1.12],
	}
	if (props.hubEnabled || props.specialChallenge == 'downsize') {
		housingTypes.hut = [1, 1.24];
		housingTypes.house = [1, 1.22];
		housingTypes.mansion = [9, 1.20];
		housingTypes.hotel = [15, 1.18];
		housingTypes.resort = [26, 1.16];
		housingTypes.gateway = [31, 1.14];
	}
	var coefC = 0;
	var termR = 0;
	var typeCount = 0;
	for (var [key, [startZone, scaling]] of Object.entries(housingTypes)) {
		var tauntRate = Math.pow(1.003, props.imperzone);
		var scaleZones = props.targetZone - startZone;
		var houseRate = Math.log(1.25) / Math.log(scaling);
		var taunTemp = Math.pow(tauntRate, scaleZones);
		var tauntRm1 = tauntRate - 1;
		var factor = (key == "collector") ? props.collectHubs : 1;
		coefC += factor * (taunTemp - 1) / tauntRm1;
		termR += factor * tauntRate * houseRate * (taunTemp * (scaleZones * tauntRm1 - 1) + 1) / (tauntRm1 * tauntRm1);
		typeCount++;
	}
	props.coefC = coefC / typeCount;
	props.termR = termR / typeCount;
	// to a good approximation for zones substantially past the last housing unlock, total population (scaled by best housing base pop) is:
	//   <best housing count> * coefC - termR
	// So we can use these values to estimate the actual marginal gain in tauntimp-adjusted population.
}

function getTotalPerksCost() {
	var cost = 0;
	for (var [perkName, perkObj] of Object.entries(perks)) {
		if (typeof (perkObj) !== "object" || !perkObj.hasOwnProperty("optimize"))
			continue;
		// iterating over the perks, ignoring aux values
		cost += getPerkCost(perkName, perkObj.level, true);
	}
	return cost;
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
function getTrinketValues(motivCost, powCost, toughCost) {
	// trinket gain from pushing power will be 0 when Obs level is 0, so go ahead and calculate
	//   the value of trinket growth based on 1 Obs level to help evaluate the value of the first Obs
	//   level itself.
	var obsLevel = Math.max(1, 1 + perks.Observation.level);

	// Get the expected Rt at the end of the next run with the current Obs level.
	var shinies = 0;
	var shinies = props.trinkets + shinyCollect(perks.Observation.level + 1);
	if (props.trinkets == 0) {
		shinies += 10;
		// first Obs level gives 10 trinkets
	}
	shinies = Math.min(shinies, obsLevel * 1000);

	var cappedBaseTrinkets = Math.min(props.trinkets, obsLevel * 1000);

	// marginal shine gain per run (for baseline perks)
	var marginalShinePerRun = (100 + shinies * obsLevel) / (100 + cappedBaseTrinkets * obsLevel);
	// marginal shine gain of one additional trinket
	var marginalShinePerTrinket = 1 + obsLevel / (100 + shinies * obsLevel);

	var res = [];
	for (var marginalShine of [marginalShinePerRun, marginalShinePerTrinket]) {
		// For each of Mot/Pow/Tough, presuming those levels are efficient, calculate the Rn cost of getting 
		//   the equivalent boost the marginal shine.
		// Total cost of N levels for a compounding price factor of F and next level cost of C:
		//   C/(F-1) * (F^N - 1)
		// Starting from a level of L, the gain factor of N more levels of any of these perks is:
		//   G = (100 + (L+N)*5)/(100 + L*5)
		// So solving for N we get:
		//   N = (G-1)*(20+L)
		var motF = perks.Motivation.priceFact;
		var motN = (marginalShine - 1) * (20 + perks.Motivation.level);
		var motShineCost = motivCost / (motF - 1) * (Math.pow(motF, motN) - 1);
		var powF = perks.Power.priceFact;
		var powN = (marginalShine - 1) * (20 + perks.Power.level);
		var powShineCost = powCost / (powF - 1) * (Math.pow(powF, powN) - 1);
		var touF = perks.Toughness.priceFact;
		var touN = (marginalShine - 1) * (20 + perks.Toughness.level);
		var touShineCost = toughCost / (touF - 1) * (Math.pow(touF, touN) - 1);
		// sum up all the costs of the powerlevel perks
		var totShineCost = motShineCost + powShineCost + touShineCost;
		res.push(totShineCost);
	}
	res.push(shinies);
	// also return the expected trinket count next run at baseline Obs

	// no longer relevant with a baseline effective perk level of 1
	// zero out per-run stats if at 0 Obs (these were used to help calculate the per-trinket gain for valuing the 1st level of Obs)
	//if (perks.Observation.level == 0) {
	//    res[0] = 0;
	//    res[2] = 0;
	//}

	return res;
}

// Observation has a direct gain component (powering up each trinket), and a growth component (due to marginal trinket
//   droprate). This function returns the direct power gain (calculated based on the expected trinkets after the next run)
//   and the increase in trinkets gained next run specifically due to the droprate increase.
// Note this can calculate for any number of increased Obs levels, though we expect to use just +1 and +2.
//   +2 is useful because free trinkets at even levels are a major growth driver, so +2 levels may actually end up being
//   more cost efficient than +1 level at times.
function getObservationGains(levels) {
	var obsLevel = 1 + perks.Observation.level;
	// this gets referred to a lot, shortening the reference

	// Get expected trinket count at end of next run with the old Obs level
	var currentCollect = shinyCollect(obsLevel);
	var shinies = props.trinkets + currentCollect;
	shinies = Math.min(shinies, obsLevel * 1000);
	// still need to re-bound in case we dropped an Obs level and have super-capped trinkets.

	// Get expected trinket count at end of next run with the new Obs level
	var nextCollect = shinyCollect(obsLevel + levels);
	var shiniesNext = props.trinkets + nextCollect;
	if (props.trinkets == 0)
		shiniesNext += 10;
	// 10 free trinkets for first Obs level
	shiniesNext = Math.min(shiniesNext, (obsLevel + levels) * 1000);

	// Calculate the direct gain in powerlevel at end of next run. Note this is the total powerlevel gain
	//   INCLUDING power immediately gained due to marginal trinket drops. This is because the Rn-like value
	//   of trinkets is valued as if those trinkets had no effect until the subsequent run (as true Rn
	//   gains on the next run would not have an effect within the same run).
	var directGain = (100 + shiniesNext * (obsLevel + levels)) / (100 + shinies * obsLevel);
	// upper bound on direct gain at re-capped trinkets:
	//   Obs value WITH droprate included can never exceed this value WITHOUT droprate included, if we're approaching
	//   our current trinket cap. No limit to droprate value if we are not approaching our cap.
	var maxDirectGain = Infinity;
	if (shinies >= obsLevel * 1000) {
		maxDirectGain = (100 + (obsLevel + levels) * (obsLevel + levels) * 1000) / (100 + obsLevel * shinies);
	}

	// Calculate the marginal gain in trinket power next run specifically due to the increased drop rate.
	//   We must consider ONLY the actual increase in trinkets on the save caused by the new Obs level(s).
	//   e.g. if you're at 12.5k and obs 12, we should only count the actual trinkets dropped next run at Obs 13,
	//   not the 500 trinkets that you already have on your save that only become unlocked this run (which is already
	//   accounted in the direct gain and does NOT represent an increase in drops).
	var moreTrinkets;
	if (props.trinkets >= (obsLevel + levels) * 1000) {
		// Case 1: we're already capped even at the new obs level. No drop value.
		moreTrinkets = 0;
	} else if (props.trinkets >= obsLevel * 1000) {
		// Case 2: we're already capped at the old obs level. Drop value is the actual drops gained this run.
		moreTrinkets = Math.max(0, shiniesNext - props.trinkets);
	} else {
		// Case 3: we're not already capped. Drop value is the actual difference in gains between the two considered Obs levels.
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
function iterateValueFeedback(valueArray) {
	var [Va, Vh, Vm, Vf, Vres, Vrad, Vp, Ve,
		tribs, collectors, hubEnabled, mets,
		trinketRate, trinkets, obsLevel,
		Vpushed = 1, VmDone = 1, VfDone = 1, VresDone = 1, VpDone = 1] = valueArray;


	// when tribute count is < 1250, resource->resource/radon feedback is strong via Greed
	if (tribs < 1250) {
		var [greedback, tribs] = getGreedResourceFeedback(Vf * Vres / (VfDone * VresDone), tribs);
		Vres *= greedback;
		Vrad *= greedback;
	}

	// more resources buy more housing, which feeds back to more resources and population
	//  -> Don't bother with this small correction below Collectors, especially since Gateways don't scale with F/M/L.
	//     Frags do scale with "some" resource boosts, but approximating them as non-scaling as a general rule is pretty close to correct.
	var moreHousing = Math.log(Vf * Vres / (VfDone * VresDone)) / Math.log(1.12); // Collectors scale with food (no other basic resources needed)
	var baseHousing = collectors;
	// for downsize we make the same adjustments as for hubs, just saying "all housing buildings have the same value"
	if (hubEnabled || props.specialChallenge == 'downsize') {
		moreHousing *= props.collectHubs;
		moreHousing += 5 * Math.log(Vres / VresDone) / Math.log(1.2); // 5 housing types below Gateway need wood, roughly 1.2 avg scaling (Gateway doesn't scale)
		baseHousing *= 6 + props.collectHubs; // estimate all housing types have the same number as Collectors (close enough for gain factor w.r.t. the small feedback effects here)
	}
	// if the user doesn't have collectors yet, don't bother with housing corrections (yes this will exclude O.G. downsize, tough)
	//   (tauntimp correction uses coefC & termR calculated in readInput(), based on target zone)
	var tauntCorrectedHousingBase = baseHousing * props.coefC - props.termR;
	var tauntCorrectedHousingNext = (baseHousing + moreHousing) * props.coefC - props.termR;
	var housingGain = tauntCorrectedHousingNext / tauntCorrectedHousingBase;
	if (!(housingGain > 1) || tauntCorrectedHousingBase <= 0) housingGain = 1;
	if (props.specialChallenge == 'downsize') {
		// 2 territory bonuses per zone, each bonus is 5 + trumps level
		var trumPop = 2 * props.targetZone * (5 + perks.Trumps.level);
		// actual gain: (housing * housingGain + trumpop) / (housing + trumpop)
		housingGain = 1 + (housingGain - 1) * baseHousing / (baseHousing + trumPop);
	}
	Vres *= housingGain;
	Vp *= ((props.specialChallenge == 'trappa') || (props.specialChallenge == 'combat'))
		? 1 : housingGain; // Trappa housing doesn't help buy more coords. Combat respec assumes we're done buying housing.
	collectors += housingGain;

	// use equip scaling to convert resource value to atk/hp value
	var VmAdjusted = Vm * Vres / (VmDone * VresDone);
	// combat spec assumes no more equipment buying
	if (!(props.specialChallenge == 'combat')) {
		Va *= Math.pow(props.equipScaling.attack, Math.log(VmAdjusted));
		Vh *= Math.pow(props.equipScaling.health, Math.log(VmAdjusted));
	}

	// account for smithies: 1.25x atk/hp per 50x resources (40x with S14)
	var smithyGain = Math.pow(1.25, Math.log(Vres / VresDone) / Math.log(props.smithyScaling));
	// combat spec assumes no more smithy buying
	if (!(props.specialChallenge == 'combat') && !(props.specialChallenge == 'smithless')) {
		Va *= smithyGain;
		Vh *= smithyGain;
	}

	// if coord limited, account for population gain to coords
	var coordAdjust = props.coordLimited;
	if (props.specialChallenge == 'downsize') {
		// assume coord limited in downsize (allowing the user to weight further toward pop if desired)
		coordAdjust = Math.max(coordAdjust, 1);
	} else if (props.specialChallenge == 'trappa' || props.specialChallenge == 'combat' && props.isTrappa) {
		// Trappa is always coord limited, and the input field is hidden (replaced by the trapping hours field)
		coordAdjust = 1;
	} else if (props.specialChallenge == 'combat') {
		// combat respec reads the actual population/coordinations from the save to determine how many levels of Carp are needed
		coordAdjust = (perks.Carpentry.level < props.carpNeeded) ? 1 : 0;
	}
	var coordGain = Math.pow(1.25, Math.log(Vp / VpDone) / Math.log(1.25) * coordAdjust);
	Va *= coordGain;
	Vh *= coordGain;

	// more food buys more Mets, which have various effects depending on antennas
	var moreMets = Math.log(Vf * Vres / (VfDone * VresDone)) / Math.log(5);
	var metEff = 0.01 + 0.0005 * props.antennae;
	var metRes = 0.5 + 0.25 * (props.antennae >= 20 ? (Math.floor(props.antennae / 5) - 3) : 0);
	var metProd = mets * metEff;
	var metProdNext = (mets + moreMets) * metEff;
	var metRadGain = (1 + metProdNext) / (1 + metProd);
	var metFoodGain = props.antennae >= 5 ? (1 + metProdNext * metRes) / (1 + metProd * metRes) : 1;
	var metHPGain = props.antennae >= 10 ? (1 + metProdNext * metRes) / (1 + metProd * metRes) : 1;
	var metMineGain = props.antennae >= 15 ? (1 + metProdNext * metRes) / (1 + metProd * metRes) : 1;
	Vrad *= metRadGain;
	Vf *= metFoodGain;
	if (!(props.specialChallenge == 'combat')) Vh *= metHPGain;
	Vm *= metMineGain;
	mets += moreMets;

	// Feedback from pushing power (final trappa respec: health won't be applied after last army send, so don't count health)
	var pushPower = Va * ((props.specialChallenge == 'combat' && props.isTrappa) ? 1 : Vh) / Vpushed;
	var pushZones = Math.log(pushPower) / props.logEnemyScaling;
	// speedbooks give 25% resources per zone
	if (props.specialChallenge == 'resplus') {
		// when collecting resources from +maps, we only get 10% resource gain per map
		Vres *= Math.pow(1.1, pushZones);
	} else {
		Vres *= Math.pow(1.25, pushZones);
	}
	// coords give 25% atk/hp per zone IF NOT COORD LIMITED
	Va *= Math.pow(1.25, pushZones * (1 - Math.min(1, coordAdjust)));
	Vh *= Math.pow(1.25, pushZones * (1 - Math.min(1, coordAdjust)));

	// Glass reward gives 10% radon per extra completion if we can increase our VM zone (determined in readInputs())
	if (props.clearWeight >= 0 && props.glassRadon) {
		Vrad *= Math.pow(1.1, pushZones);
	}

	// count S3 for Rn weighting if selected by the user, or if at Obs 0 with no clear weight (which would give no value to pushing perks at all without S3/VS1)
	//   -> or no clear weight and trinkets capped
	var s3RnFinal = props.s3Rn || (props.clearWeight == 0 && (perks.Observation.level == 0 || props.trinkets >= ((1 + perks.Observation.level) * 1000)));
	// Scruffy level 3 gives compounding 3% Rn per additional zone
	if (props.scruffyLevel >= 3 && s3RnFinal) {
		Vrad *= Math.pow(1.03, pushZones);
	}
	// VS1 gives additive 0.25% VM Rn per additional zone
	// TODO: vmRadFrac is a hacky constant for now, should probably be a user input after we clean up the volume of user inputs
	if (s3RnFinal) {
		Vrad *= 1 + vmRadFrac * pushZones / (400 + props.targetZone);
	}
	// trinket gain: use a fixed drop rate based on target zone, which should be fine assuming the user has entered
	//   a sensible value and we're only optimizing at the margins of a fractional zone (or maybe 1-2 zones)
	moreTrinkets = pushZones * trinketRate;
	var trinketMax = 1000 * obsLevel;
	if (moreTrinkets + trinkets > trinketMax) moreTrinkets = trinketMax - trinkets;
	if (moreTrinkets < 0) throw ("Unexpectedly tried to value more trinkets than our trinket max!: " + trinkets);
	trinketGain = 1 + moreTrinkets * obsLevel / (100 + trinkets * obsLevel);
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
	valueArray[15] = Va * ((props.specialChallenge == 'combat' && props.isTrappa) ? 1 : Vh);
	valueArray[16] = Vm;
	valueArray[17] = Vf;
	valueArray[18] = Vres;
	valueArray[19] = Vp;
}

const iterateValueLoops = 3;
// Inputs: gain values for atk, hp, equip discount (or metal), radon, equality, pop
//         moreTrinkets: increased count of trinkets on next run from Obs droprate increase
function getLogWeightedValue(Va, Vh, Vgear, Vres, Vrad, Ve = 1, Vp = 1, moreTrinkets = 0, extraObs = 0) {

	var Wa = props.clearWeight; // attack weight
	// health is useless in final trappa respec after sending last army, since new perks won't be applied to current army's health
	var Wh = (props.specialChallenge == 'combat' && props.isTrappa) ? 0 : props.clearWeight * props.healthDerate + props.survivalWeight; // health weight
	var We = Math.max(1e-100, props.survivalWeight); // equality weight: force >0 to use equality as a dump perk if the user sets 0 weight
	var Wr = props.radonWeight; // radon weight

	// from iterateValueFeedback:
	//   [Va,Vh,Vm,Vf,Vres,Vrad,Vp,Ve,
	//    tribs,collectors,hubEnabled,mets,
	//    trinketRate,trinkets,obsLevel,
	//    Vpushed=1,VmDone=1,VfDone=1,VresDone=1,VpDone=1] = valueArray;

	// add Obs levels if we're evaluating Observation
	var obsLevel = 1 + perks.Observation.level + extraObs;

	var valueArray = [Va, Vh, Vgear, 1, Vres, Vrad, Vp, Ve,
		props.tributes, props.housingCount, props.hubEnabled, props.meteorologists,
		obsDropRate(obsLevel, props.targetZone) / 100, props.baselineTrinketsNext, obsLevel,
		1, 1, 1, 1, 1,
	];

	for (var i = 0; i < iterateValueLoops; i++) iterateValueFeedback(valueArray);

	Va = valueArray[0];
	Vh = valueArray[1];
	Vm = valueArray[2];
	Vres = valueArray[4];
	Vrad = valueArray[5];
	Ve = valueArray[7];
	Vtrink = valueArray[13];

	// only count actual new trinket drops, not extra "apparent" trinkets from cap increase!
	moreTrinkets += Math.max(0, Vtrink - Math.max(props.baselineTrinketsNext, props.trinkets));

	// calculate unified Rn-like growth gain:
	var Vgrowth = (Vrad * props.radonPerRun + props.trinketRadonPerRun
		+ props.radonPerTrinket * moreTrinkets
	) / (props.radonPerRun + props.trinketRadonPerRun);

	if (props.specialChallenge == 'combat') Vgrowth = 1; // ignore radon weight for combat spec

	// A perk's total weighted value is:
	//   Va^Wa * Vh^Wh * Ve^We * Vrad^Wr.
	// For cost-efficiency between perks with wildly different costs & effects we use the log of this value, which simplifies to:
	//   Wa*log(A) + Wh*log(H) + We*log(E) + Wr*log(R)

	var res = Wa * Math.log(Va) + Wh * Math.log(Vh) + We * Math.log(Ve) + Wr * Math.log(Vgrowth);
	if (props.specialChallenge == 'resplus' || props.specialChallenge == 'resminus') {
		res = Math.log(Vres) + (1e-100) * Math.log(Ve); // hack to still use equality as a primary dump perk
	}
	if (props.specialChallenge == 'equip') {
		res = Math.log(Vres * Vm) + (1e-100) * Math.log(Ve); // for equip farming, Artisanistry also counts
	}
	if (isNaN(res)) {
		console.log("ERROR: NaN result!")
	}
	return res;
}

function obsDropRate(level, zone) {
	if (zone < 101)
		return 0;
	if (zone > 200)
		zone = 200;
	var base = ((1 + ((level - 1) / 2)) * Math.pow(1.03, (zone - 100)));
	var res;
	if (props.specialChallenge == 'alchemy' && zone <= 156) {
		res = 100 - (100 - base) * Math.pow(0.99, props.findPots);
	} else
		res = base;
	return res;
}

// how many trinkets do we expect to get by clearing the target zone?
function shinyCollectLoop(level, zone) {
	var shinies = 0;
	// the game checks for the drop after advancing the zone counter, so go to zone+1.
	for (var i = 101; i <= zone + 1; i++) {
		shinies += obsDropRate(level, i) / 100;
		if (i % 25 == 0) {
			// level-1 since the "level" includes the free +1 obs level, but even levels for guaranteed trinket drops do not include this free +1 level
			var free = Math.floor((level - 1) / 2);
			if (free > 0)
				shinies += free;
		}
	}
	return shinies;
}

// zone == targetZone, memoized by a lookup table calculated by shinyCollectLoop
function shinyCollect(level) {
	if (typeof props.shinyTable[level] == 'undefined') {
		props.shinyTable[level] = shinyCollectLoop(level, props.targetZone);
	}
	return props.shinyTable[level];
}

// deprecated, used prior to alchemy and finding potions
/*
function shinyCollectOld(level,zone) {
var shinies = 0;
if (zone < 100) return 0;
var excess = 0;
if (zone > 199) {
excess = zone - 199;
scalingZones = 100;
} else {
scalingZones = zone+1-100;
}
var scalingShinies = (1 + (level - 1)/2) * ((Math.pow(1.03,scalingZones+1) - 1)/0.03 - 1) / 100;
var excessShinies = (1 + (level - 1)/2) * Math.pow(1.03,100) / 100 * excess;
var freeShinies = Math.floor((zone+1-100)/25) * Math.floor(level/2);
return scalingShinies + excessShinies + freeShinies;
}
*/

// Calculate avg atk with frenzy, accounting for uptime.
//   Optimizing for a given hit count (in practice maybe just 5 and 100, where 100 gives a pretty good approximation of deathless)
function getFrenzyAvgAtk(level, frenzyHits) {
	var frenzyDeathTime = 0.4 + 0.258 * frenzyHits
	// get off N hits then die, optimizing for Hyperspeed 1
	var frenzyHitTime = frenzyDeathTime / frenzyHits;
	// get off N hits then die
	var frenzyProcChance = perks.Frenzy.procEffect * level;
	// wait time in seconds
	var frenzyProcWaitTime = frenzyHitTime / frenzyProcChance;
	// frenzy uptime for each proc
	var frenzyUptimePerProc = frenzyDeathTime * Math.log(perks.Frenzy.timeEffect * level / frenzyDeathTime + 1) / Math.log(2);
	// uptime fraction for weighting the attack bonus
	var frenzyUptimeFrac = frenzyUptimePerProc / (frenzyProcWaitTime + frenzyUptimePerProc);
	// Mass Hysteria means frenzy is always up
	if (props.permaFrenzy) {
		frenzyUptimeFrac = 1;
	}
	// average attack per hit accounting for uptime fraction
	var frenzyAvgAtk = 1 + frenzyUptimeFrac * perks.Frenzy.effect * level;
	return frenzyAvgAtk;
}

// flag the most efficient perk
function efficiencyFlag(eList = [], pList = []) {
	var bestEff = 0;
	var bestAffordableEff = 0;
	props.bestPerk = "";
	// don't flag a perk if we don't find an affordable one!
	for (var [perkName, perkObj] of Object.entries(perks)) {
		if (typeof (perkObj) !== "object" || !perkObj.hasOwnProperty("optimize") || !perkObj.optimize)
			continue;
		// iterating over the perks, ignoring aux values
		eList.push(perkObj.efficiency);
		pList.push(perkName);
		if (perkObj.efficiency > bestEff) {
			bestEff = perkObj.efficiency;
		}
		if (perkObj.levLocked)
			continue;
		// don't buy level-locked perks
		if (couldBuyPerk(perkName, false) && perkObj.efficiency > bestAffordableEff) {
			bestAffordableEff = perkObj.efficiency;
			props.bestPerk = perkName;
		}
		if (perkObj.hasOwnProperty("efficiency2")) {
			if (perkObj.efficiency2 > bestEff) {
				bestEff = perkObj.efficiency2;
			}
			if (couldBuyPerk(perkName, false, 2) && perkObj.efficiency2 > bestAffordableEff) {
				bestAffordableEff = perkObj.efficiency2;
				props.bestPerk = perkName;
			}
		}
	}
	return bestEff;
}

var switchTotalRadon = function () {
	if (game.global.canRespecPerks && portalWindowOpen) {
		props.perksRadonFromSave = props.earnedRadon;
	} else {
		props.perksRadonFromSave = props.portalRadon;
	}

	props.perksRadon = props.perksRadonFromSave;

	evaluatePerks();
}

// get perk efficiencies at current levels and color code them accordingly
var evaluatePerks = function (debug = false) {

	readInputs();

	// calculate the efficiency of each perk
	getPerkEfficiencies();
}

function getPerkEfficiencies() {
	// TODO: most perks don't change other perks' efficiencies (given our assumptions of local flatness)
	//  So move the efficiency calculations to functions owned by each perk, and only update efficiency when actually
	//  buying a perk. Notable exception for Observation (and carefully look for other exceptions), which will require
	//  some exception mechanism to update interdependent perks' efficiencies.
	// Now that we're doing a complex feedback iteration process for each perk efficiency, this is going to become necessary
	//  to avoid exploding computation time.

	// used for combat respec to determine exactly how much carp is needed to afford all coords (given we require an appropriate save for this preset)
	//   -> max army size before buying final coord is 1/3 of population
	var moreCoordsNeeded = Math.max(0, props.targetZone - props.coordsBought);
	var popNeededForCoords = 3 * Math.pow(1.25, moreCoordsNeeded) * props.armySize;
	var tauntBase = 1.003 + 0.0001 * perks.Expansion.level;
	var tauntMult = props.expanding ? Math.pow(tauntBase, props.actualTaunts) : 1;
	// expanding tauntimps mean taunt pop is not in maxTrimps, it's a flat multiplier
	var tauntCorrectedMaxTrimps = tauntMult * props.maxTrimps * Math.pow(tauntBase, props.imperzone * (props.targetZone - props.currentWorld));
	props.carpNeeded = Math.log(popNeededForCoords / tauntCorrectedMaxTrimps) / Math.log(1.1);

	// Get various gain factors needed to calculate the value of trinkets (and also used to value their respective perks).
	//  Motivation
	var motiv = 1 + perks.Motivation.level * perks.Motivation.effect;
	var motivGain = (motiv + perks.Motivation.effect) / motiv;
	// trappa is heavily drop-based prior to 160, and mostly gathering based after 170
	if (props.specialChallenge == 'trappa') {
		if (props.targetZone < 162) {
			motivGain = Math.pow(motivGain, 0.0001);
			// derate motivation in trappa (don't want to zero it out but it doesn't increase F/M/L meaningfully)
		} else if (props.targetZone < 172) {
			motivGain = Math.pow(motivGain, 0.5);
		}
	}
	var motivCost = getPerkCost("Motivation", 1);
	// Power
	var pow = 1 + perks.Power.level * perks.Power.effect;
	var powGain = (pow + perks.Power.effect) / pow;
	var powCost = getPerkCost("Power", 1);
	// Toughness
	var tough = 1 + perks.Toughness.level * perks.Toughness.effect;
	var toughGain = (tough + perks.Toughness.effect) / tough;
	var toughCost = getPerkCost("Toughness", 1);

	// Get the absolute Rn values for trinkets expected at baseline Observation and per marginal trinket,
	//   and the expected count of trinkets at the end of this run at baseline Observation.
	[props.trinketRadonPerRun, props.radonPerTrinket, props.baselineTrinketsNext] = getTrinketValues(motivCost, powCost, toughCost);

	// Artisanistry:
	//   resource gain for equipment only
	perks.Artisanistry.efficiency = getLogWeightedValue(1, 1, perks.Artisanistry.effect, 1, 1, 1) / getPerkCost("Artisanistry", 1);

	// Bait:
	//   population in Trappa, but derate resource gains like for Motivation
	if ((props.specialChallenge == 'trappa' && props.isTrappa) && !perks.Bait.levLocked) {
		// 3600 seconds per hr, 10 ticks per second, 10x base trimps per tick (S0 ability)
		var baitTime = 3600 * 10 * 10 * props.trapHrs;
		var totalBaitPopBase = baitTime * (1 + perks.Bait.level);
		var totalBaitPopNext = baitTime * (2 + perks.Bait.level);
		var baitPop = (totalBaitPopNext + props.trappaStartPop) / (totalBaitPopBase + props.trappaStartPop);
		perks.Bait.efficiency = getLogWeightedValue(1, 1, 1, Math.pow(baitPop, 0.0001), 1, 1, baitPop) / getPerkCost("Bait", 1);
	}

	// Expansion
	//   Assume Expanding Tauntimps, so all expected Tauntimps for target zone are applied
	var expandotaunts = props.targetZone * props.imperzone;
	var expandobase = 1 + 1 / (10030 + perks.Expansion.level);
	var expandogain = Math.pow(expandobase, expandotaunts);

	// Carpentry:
	//   population gain, also gives resources
	var carpPop = perks.Carpentry.effect;
	if (props.specialChallenge == 'trappa' || props.specialChallenge == 'combat' && props.isTrappa) {
		// In Trappa, carp gives more housing which gives more drops, but does not increase available Trimps
		perks.Carpentry.efficiency = getLogWeightedValue(1, 1, 1, carpPop, 1, 1, 1) / getPerkCost("Carpentry", 1);
		perks.Expansion.efficiency = getLogWeightedValue(1, 1, 1, expandogain, 1, 1, 1) / getPerkCost("Expansion", 1);
	} else {
		perks.Carpentry.efficiency = getLogWeightedValue(1, 1, 1, carpPop, 1, 1, carpPop) / getPerkCost("Carpentry", 1);
		perks.Expansion.efficiency = getLogWeightedValue(1, 1, 1, expandogain, 1, 1, expandogain) / getPerkCost("Expansion", 1);
	}

	// Trumps:
	//   population in downsize
	if (props.specialChallenge == 'downsize' && !perks.Trumps.levLocked) {
		// estimate same number of each housing building, should be "good enough"
		var buildPop = (props.hubEnabled ? (13 + props.collectHubs) : 7) * props.housingCount;
		// 2 territory bonuses per zone, each bonus is 5 + trumps level
		var baseTrumPop = 2 * props.targetZone * (5 + perks.Trumps.level);
		var trumPop = (buildPop + baseTrumPop + 2 * props.targetZone) / (buildPop + baseTrumPop);
		perks.Trumps.efficiency = getLogWeightedValue(1, 1, 1, trumPop, 1, 1, trumPop) / getPerkCost("Trumps", 1);
	}

	// Criticality:
	//   attack gain from crits
	var CD = 1 + props.shieldCD / 100 + perks.Criticality.level * perks.Criticality.effect;
	var CC = (props.specialChallenge == 'duel') ? 0.5 : 1;
	// derate crit chance for duel
	var critGain = ((1 - CC) + CC * (CD + perks.Criticality.effect)) / ((1 - CC) + CC * CD);
	perks.Criticality.efficiency = getLogWeightedValue(critGain, 1, 1, 1, 1, 1) / getPerkCost("Criticality", 1);

	// Equality:
	perks.Equality.efficiency = getLogWeightedValue(1, 1, 1, 1, 1, perks.Equality.effect) / getPerkCost("Equality", 1);

	// Championism:
	perks.Championism.efficiency = getLogWeightedValue(perks.Championism.effect, perks.Championism.effect, 1, 1, 1, 1) / getPerkCost("Championism", 1);

	// Frenzy
	//   attack boost when frenzy is active
	// Frenzy should be based on 5-hit deaths iff relying on GB for at least one zone of the run is good.
	//    We presume this is always true if you have any pushing weight.
	//    With no pushing weight, we presume it's FALSE (optimizing for 300 hits instead) unless a 3-minute zone would yield enough radon/trinket gains to be good, which roughly corresponds to when GB is useful.
	if (props.specialChallenge != 'berserk') {
		var frenzyHits = 300;
		var isDeathless = props.specialChallenge == 'resplus' || props.specialChallenge == 'resminus' || props.specialChallenge == 'trappa' || props.specialChallenge == 'combat' && props.isTrappa;
		if (!isDeathless && props.clearWeight > 0 || props.gbAfterpush) {
			frenzyHits = 5;
		}
		var frenzyAvgAtk = getFrenzyAvgAtk(perks.Frenzy.level, frenzyHits);
		var frenzyAvgAtkNext = getFrenzyAvgAtk(perks.Frenzy.level + 1, frenzyHits);
		var frenzyGain = frenzyAvgAtkNext / frenzyAvgAtk;
		perks.Frenzy.efficiency = getLogWeightedValue(frenzyGain, 1, 1, 1, 1, 1) / getPerkCost("Frenzy", 1);
	}

	// Greed:
	//   all-resource and radon gain
	var greedGain = perks.Greed.effect;
	perks.Greed.efficiency = getLogWeightedValue(1, 1, 1, greedGain, greedGain, 1) / getPerkCost("Greed", 1);

	// Looting:
	//   all-resource and radon gain
	var loot = 1 + perks.Looting.level * perks.Looting.effect;
	var lootGain = (loot + perks.Looting.effect) / loot;
	var lootCost = getPerkCost("Looting", 1);
	perks.Looting.efficiency = getLogWeightedValue(1, 1, 1, lootGain, lootGain, 1) / lootCost;

	// Motivation:
	//   all-resource gain (no radon)
	// Note motivGain is already derated for Trappa above
	perks.Motivation.efficiency = getLogWeightedValue(1, 1, 1, motivGain, 1, 1) / motivCost;

	// Packrat:
	//   all-resource gain from decreased storage costs (no radon)
	// Note: 0.125 because you only pay taxes on the half of your last storage that you filled before buying it
	// Note: / 2 because we might guess you spend as many resources as you can store after your last storage building
	var storeTax = 0.125 / (1 + perks.Packrat.level * perks.Packrat.effect) / 2;
	var storeTaxNext = 0.125 / (1 + (perks.Packrat.level + 1) * perks.Packrat.effect) / 2;
	var ratGain = (1 - storeTaxNext) / (1 - storeTax);
	perks.Packrat.efficiency = getLogWeightedValue(1, 1, 1, ratGain, 1, 1) / getPerkCost("Packrat", 1);

	// Pheromones
	//   Count 3-tick breeding as 100% uptime, and weight for comparative uptime at target zone
	if (props.specialChallenge == 'trappa' || props.specialChallenge == 'combat' && props.isTrappa) {
		// no breeding is the challenge.
		perks.Pheromones.efficiency = 0;
	} else {
		var breedSpeed = 1 + props.potency * (1 + perks.Pheromones.level * perks.Pheromones.effect);
		var breedUptime = 3 / Math.max(3, Math.log(2) / Math.log(breedSpeed));
		var breedSpeedNext = 1 + props.potency * (1 + (perks.Pheromones.level + 1) * perks.Pheromones.effect);
		var breedUptimeNext = 3.001 / Math.max(3, Math.log(2) / Math.log(breedSpeedNext));
		var breedGain = breedUptimeNext / breedUptime;
		perks.Pheromones.efficiency = getLogWeightedValue(breedGain, 1, 1, 1, 1, 1) / getPerkCost("Pheromones", 1);
	}

	// Power:
	//   attack gain
	perks.Power.efficiency = getLogWeightedValue(powGain, 1, 1, 1, 1, 1) / powCost;

	// Prismal:
	//   health gain from increased shielding
	var prismLayers = 1;
	var basePrismal = props.shieldPrismal + 100;
	if (props.scruffyLevel >= 1)
		basePrismal += 25;
	if (props.scruffyLevel >= 10)
		prismLayers = 2;
	if (props.scruffyLevel >= 16)
		prismLayers = 3;
	var prismHP = 1 + (basePrismal / 100 + perks.Prismal.level * perks.Prismal.effect) * prismLayers;
	var prismGain = (prismHP + perks.Prismal.effect * prismLayers) / prismHP;
	// hack for trappa final respec: prismal DOES matter even though raw health doesn't, so pretend it's attack
	perks.Prismal.efficiency = getLogWeightedValue(((props.specialChallenge == 'combat' && props.isTrappa) ? prismGain : 1), prismGain, 1, 1, 1, 1) / getPerkCost("Prismal", 1);

	// Resilience:
	//   health gain (compounding)
	perks.Resilience.efficiency = getLogWeightedValue(1, perks.Resilience.effect, 1, 1, 1, 1) / getPerkCost("Resilience", 1);

	// Tenacity:
	//   attack gain (compounding, pre-calculated into the effect field)
	perks.Tenacity.efficiency = getLogWeightedValue(perks.Tenacity.effect, 1, 1, 1, 1, 1) / getPerkCost("Tenacity", 1);

	// Toughness:
	//   health gain
	perks.Toughness.efficiency = getLogWeightedValue(1, toughGain, 1, 1, 1, 1) / toughCost;

	// Observation:
	//  See getObservationGains for more details on valuation.
	// NOTE we check for +1 and +2 levels, as +2 levels can be more efficient due to the extra free trinket drop.  
	// Max possible gain is what you'd get from instantly trinket-capping the new Obs level, so upper bound by that.
	var [obsDirectGain, obsMoreTrinkets, obsMaxDirectGain] = getObservationGains(1);
	perks.Observation.efficiency = Math.min(getLogWeightedValue(obsDirectGain, obsDirectGain, 1, obsDirectGain, 1, 1, 1, obsMoreTrinkets, 1), obsMaxDirectGain < Infinity ? getLogWeightedValue(obsMaxDirectGain, obsMaxDirectGain, 1, obsMaxDirectGain, 1, 1, 1, 0, 1) : Infinity) / getPerkCost("Observation", 1);

	// No point checking for 2-level efficiency if we can't afford 2 levels.
	// (And more to the point, it breaks the way we flag the best perk if we give non-zero efficiency for the 2-level version....)
	if (couldBuyPerk("Observation", false, 2)) {
		var [obsDirectGain2, obsMoreTrinkets2, obsMaxDirectGain2] = getObservationGains(2);
		perks.Observation.efficiency2 = Math.min(getLogWeightedValue(obsDirectGain2, obsDirectGain2, 1, obsDirectGain2, 1, 1, 1, obsMoreTrinkets2, 2), obsMaxDirectGain2 < Infinity ? getLogWeightedValue(obsMaxDirectGain2, obsMaxDirectGain2, 1, obsMaxDirectGain2, 1, 1, 1, 0, 2) : Infinity) / getPerkCost("Observation", 2);
	} else {
		perks.Observation.efficiency2 = 0;
	}

	// Masterfulness:
	//   Simple: +1 greed +1 tenacity. The extremely harsh cost scaling means it's not very pointful to consider other than a default tenacity time.
	perks.Masterfulness.efficiency = getLogWeightedValue(perks.Tenacity.effect, 1, 1, greedGain, greedGain, 1) / getPerkCost("Masterfulness", 1);

	// Smithology
	//   Grow attack and health based on # of smithies (1.25x base, +0.01 per level in Smithology, raised to the # of smithies)
	var smithobase = 1 + 1 / (125 + perks.Smithology.level);
	var smithogain = Math.pow(smithobase, props.smithyCount);
	perks.Smithology.efficiency = getLogWeightedValue(smithogain, smithogain, 1, 1, 1) / getPerkCost("Smithology", 1);

	// Fuck it.
	// Agility: 5% atk, 5% hp, 5% resources, 5% radon per level. No this isn't accurate. No I don't care.
	perks.Agility.efficiency = getLogWeightedValue(1.05, 1.05, 1, 1.05, 1.05, 1) / getPerkCost("Agility", 1);
	// Range: 1% atk per level. Not accurate, don't care.
	perks.Range.efficiency = getLogWeightedValue(1.01, 1, 1, 1, 1, 1) / getPerkCost("Range", 1);
	// Hunger: 3% atk per level. Not accurate, don't care.
	perks.Hunger.efficiency = getLogWeightedValue(1.03, 1, 1, 1, 1, 1) / getPerkCost("Hunger", 1);

}

var inputs = [];

function exportPerkString() {
	var exportedPerks = {};

	for (var [key, value] of Object.entries(perks)) {
		if (typeof (value) !== "object" || !value.hasOwnProperty("optimize"))
			continue;
		// iterating over the perks, ignoring aux values
		exportedPerks[key] = value.level;
	}

	exportedPerks = JSON.stringify(exportedPerks);
	exportedPerks = LZString.compressToBase64(exportedPerks);
	return exportedPerks;
}

function allocateSurky() {
	tooltip('Import Perks', null, 'update');
	document.getElementById('perkImportBox').value = exportPerkString();
	importPerks();
	cancelTooltip();
}

// zero out perk inputs and autobuy
function clearAndAutobuyPerks() {
	var eList = [];
	var pList = [];
	efficiencyFlag(eList, pList);
	if (props.perksRadon > 0) {
		perks.Pheromones.optimize = (game.stats.highestRadLevel.valueTotal() >= 60) && (props.specialChallenge != 'trappa');
		var origCarp = perks.Carpentry.level;
		var origExpand = perks.Expansion.level;
		for (var [key, value] of Object.entries(perks)) {
			if (typeof (value) !== "object" || !value.hasOwnProperty("optimize") || !value.optimize || value.levLocked)
				continue;
			// iterating over the perks, ignoring aux values and non-optimized perks
			inputs[key].value = 0;
		}
		if (props.isDownsize && props.specialChallenge == 'combat') {
			// impractical to know actual housing in downsize, just don't reduce Carp or Expansion level
			perks.Carpentry.level = origCarp;
			inputs['Carpentry'].level = perks.Carpentry.level;
			perks.Expansion.level = origExpand;
			inputs['Expansion'].level = perks.Expansion.level;
		} else if (!perks.Carpentry.levLocked && props.specialChallenge == 'combat') {
			// keep expansion level, all else is madness (TODO: or could consider dropping it by 1 and "somehow" making a smart decision on +1 expand vs +X carp)
			perks.Expansion.level = origExpand;
			inputs['Expansion'].level = perks.Expansion.level;
			// must have enough carp to sustain current coordination - or very conservatively for trappa, 10 more coords after final army send (should still be negligible Rn spent on carp)
			var wantedArmySize = (props.isTrappa ? Math.pow(1.25, 10) : 1) * props.armySize;
			var tauntBase = 1.003 + 0.0001 * perks.Expansion.level;
			var tauntMult = props.expanding ? Math.pow(tauntBase, props.actualTaunts) : 1;
			perks.Carpentry.level = Math.max(0, Math.ceil(Math.log(2.4 * wantedArmySize / (tauntMult * props.maxTrimps)) / Math.log(1.1)));
			inputs['Carpentry'].level = perks.Carpentry.level;
		}
		// zero out bait after Trappa unlock, unless in trappa preset
		if (game.stats.highestRadLevel.valueTotal() >= 60 && !perks.Bait.levLocked)
			inputs["Bait"].level = 0;
		if (game.stats.highestRadLevel.valueTotal() >= 60 && !perks.Pheromones.levLocked)
			inputs["Pheromones"].level = 0;
		if (!perks.Trumps.levLocked)
			inputs['Trumps'].level = 0;
		// zero out trumps, it will be used as a dump perk even outside of downsize
		if (props.specialChallenge == 'berserk' && !perks.Frenzy.levLocked)
			inputs["Frenzy"].level = 0;
		if (props.specialChallenge == 'smithless' && !perks.Smithology.levLocked)
			inputs["Smithology"].level = 0;
		readInputs();
		// get correct available radon for cleared perks
		// for max carp, just max out carp!
		if (props.specialChallenge == 'trappacarp') {
			while (buyPerk('Carpentry', 1))
				;
			inputs['Carpentry'].level = perks.Carpentry.level;
			evaluatePerks();
			allocateSurky();
		} else {
			autobuyPerks();
		}
	}
}

// autobuy from current input perk levels

function autobuyPerks() {
	var eList = [];
	var pList = [];
	efficiencyFlag(eList, pList);
	evaluatePerks();
	// this function is not used for max pop starting spec for trappa
	if (props.specialChallenge == 'trappacarp' && game.global.canRespecPerks) {
		clearAndAutobuyPerks();
		return;
	}
	// optimize Bait for Trappa
	perks.Bait.optimize = (props.specialChallenge == 'trappa' || props.specialChallenge == 'combat' && props.isTrappa);
	perks.Pheromones.optimize = (game.stats.highestRadLevel.valueTotal() >= 60) && (props.specialChallenge != 'trappa') && !(props.specialChallenge == 'combat' && props.isTrappa);
	if (!perks.Carpentry.levLocked && (props.specialChallenge == 'trappa' || props.specialChallenge == 'combat' && props.isTrappa)) {
		var maxCarpLevels = Math.log(props.perksRadon / perks.Carpentry.priceBase * (perks.Carpentry.priceFact - 1) + 1) / Math.log(perks.Carpentry.priceFact);
		props.trappaStartPop = 10 * Math.pow(1.1, maxCarpLevels) * props.scaffoldingBonus;
	}
	// optimize Trumps for Downsize
	perks.Trumps.optimize = (props.specialChallenge == 'downsize');
	while (props.bestPerk !== "") {
		var bestName = props.bestPerk;
		var bestObj = perks[bestName];
		var buy2 = bestObj.hasOwnProperty("efficiency2") && bestObj.efficiency2 > bestObj.efficiency;
		if (buy2) {
			if (!buyPerk(bestName, 2) || bestObj.efficiency2 < 0) {
				throw ("ERROR: a perk was flagged to buy 2 levels at once, but it was unaffordable or had a negative efficiency: " + bestName);
			}
		} else if (!buyPerk(bestName) || bestObj.efficiency < 0) {
			throw ("ERROR: a maxed, unaffordable, or inefficient perk was flagged as best: " + bestName);
			return;
		}
		inputs[bestName].level = bestObj.level;
		getPerkEfficiencies();
		efficiencyFlag();
	}
	// use trumps as dump perk
	if (!perks.Trumps.levLocked && !(props.specialChallenge == 'combat')) {
		while (buyPerk("Trumps", 1))
			;
		inputs['Trumps'].level = perks.Trumps.level;
	}
	// and Pheromones! (but not in Trappa, for minimum confusion, and not before Trappa unlock)
	if (!perks.Pheromones.levLocked && props.specialChallenge != 'trappa' && !(props.specialChallenge == 'combat' && props.isTrappa) && game.stats.highestRadLevel.valueTotal() >= 60) {
		while (buyPerk("Pheromones", 1))
			;
		inputs['Pheromones'].level = perks.Pheromones.level;
	}
	// secret setting to dump remaining Rn into bait for feeeeeee
	if (props.baitDump) {
		while (buyPerk("Bait", 1))
			;
		inputs['Bait'].level = perks.Bait.level;
	}

	evaluatePerks();
	allocateSurky();
	debug("Surky - Total Radon for perks: " + prettify(props.perksRadon) + ", Total Radon Spent: " + prettify(props.radonSpent), 'portal');
}