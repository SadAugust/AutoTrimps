//Resetting variables
rShouldBoneShrine = false;
rBSRunningAtlantrimp = false;

function BoneShrine() {
	if (rBSRunningAtlantrimp && !(game.global.mapsActive && getCurrentMapObject().name === 'Atlantrimp'))
		rBSRunningAtlantrimp = false;

	if (!autoTrimpSettings.rBoneShrineDefaultSettings.value.active) return;


	var rRunningC3 = game.global.runningChallengeSquared || game.global.challengeActive == 'Mayhem' || game.global.challengeActive == 'Pandemonium';
	var rRunningDaily = game.global.challengeActive == "Daily";
	var rRunningRegular = game.global.challengeActive != "Daily" && game.global.challengeActive != "Mayhem" && game.global.challengeActive != "Pandemonium" && !game.global.runningChallengeSquared;

	//Setting up variables
	var rBoneShrineZone = getPageSetting('rBoneShrineZone');

	if (rBoneShrineZone.includes(game.global.world)) {
		var rBoneShrineBaseSettings = autoTrimpSettings.rBoneShrineSettings.value
		var rBoneShrineRunType = getPageSetting('rBoneShrineRunType')
		let indexes = [...finder(getPageSetting('rBoneShrineZone'), game.global.world)];
		var rBSIndex;
		var totalPortals = getTotalPortals();
		for (var y = 0; y < indexes.length; y++) {
			if (rBoneShrineBaseSettings[indexes[y]].done === totalPortals + "_" + game.global.world || !rBoneShrineBaseSettings[indexes[y]].active) {
				continue;
			}
			if (rBoneShrineRunType[indexes[y]] == 'All') {
				rBSIndex = indexes[y];
				break;
			}
			else if (rBoneShrineRunType[indexes[y]] == 'Fillers' && rRunningRegular) {
				rBSIndex = indexes[y];
				break;
			}
			else if (rBoneShrineRunType[indexes[y]] == 'Daily' && rRunningDaily) {
				rBSIndex = indexes[y];
				break;
			}
			else if (rBoneShrineRunType[indexes[y]] == 'C3' && rRunningC3) {
				rBSIndex = indexes[y];
				break;
			}
		}
		//var rBoneShrineRunType = rBoneShrineSettings.boneruntype;
		var rBoneShrineRunType = getPageSetting('rBoneShrineRunType')[rBSIndex];
		var runType = rBoneShrineRunType == 'Fillers' && rRunningRegular ? true :
			rBoneShrineRunType == 'Daily' && rRunningDaily ? true :
				rBoneShrineRunType == 'C3' && rRunningC3 ? true :
					rBoneShrineRunType == 'All' ? true :
						false;
		if (runType && autoTrimpSettings.rBoneShrineDefaultSettings.value.active) {
			var rBoneShrineSettings = autoTrimpSettings.rBoneShrineSettings.value[rBSIndex]
			var rBoneShrineCell = rBoneShrineSettings.cell
			var rBoneShrineCharges = rBoneShrineSettings.boneamount
			var rBoneShrineGather = rBoneShrineSettings.gather
			var rBoneShrineSpendBelow = rBoneShrineSettings.bonebelow === -1 ? 0 : rBoneShrineSettings.bonebelow;
			var rBoneShrineAtlantrimp = !game.mapUnlocks.AncientTreasure.canRunOnce ? false : rBoneShrineSettings.atlantrimp
			if (rBoneShrineAtlantrimp && rRunningDaily && typeof (game.global.dailyChallenge.hemmorrhage) !== 'undefined') {
				if (dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('food') && rBoneShrineGather === 'food') rBoneShrineAtlantrimp = false;
				if (dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('wood') && rBoneShrineGather === 'wood') rBoneShrineAtlantrimp = false;
				if (dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('metal') && rBoneShrineGather === 'metal') rBoneShrineAtlantrimp = false;
			}
			rShouldBoneShrine = (game.global.lastClearedCell + 2 >= rBoneShrineCell && game.permaBoneBonuses.boosts.charges > rBoneShrineSpendBelow);

			if (rBoneShrineCharges > game.permaBoneBonuses.boosts.charges - rBoneShrineSpendBelow)
				rBoneShrineCharges = game.permaBoneBonuses.boosts.charges - rBoneShrineSpendBelow;

			if (rShouldBoneShrine) {
				setGather(rBoneShrineGather);
				if (getPageSetting('Rhs' + rBoneShrineGather[0].toUpperCase() + rBoneShrineGather.slice(1) + 'Staff') !== 'undefined')
					HeirloomEquipStaff('Rhs' + rBoneShrineGather[0].toUpperCase() + rBoneShrineGather.slice(1) + 'Staff');
				else if (getPageSetting('RhsMapStaff') !== 'undefined')
					HeirloomEquipStaff('RhsMapStaff');
				if (rBoneShrineAtlantrimp) {
					runAtlantrimp()
				}
				for (var x = 0; x < rBoneShrineCharges; x++) {
					if (getPageSetting('RBuyJobsNew') > 0) {
						workerRatio = rBoneShrineSettings.jobratio;
						RbuyJobs()
					}
					game.permaBoneBonuses.boosts.consume()
				}
				debug('Consumed ' + rBoneShrineCharges + " bone shrine " + (rBoneShrineCharges == 1 ? "charge on zone " : "charges on zone ") + game.global.world + " and gained " + boneShrineOutput(rBoneShrineCharges));
				rBoneShrineSettings.done = totalPortals + "_" + game.global.world;
				saveSettings();
			}
		}
	}
}

function BuySingleRunBonuses() {
	if (!game.singleRunBonuses.goldMaps.owned && game.global.b >= 20 && (getPageSetting('c3GM_ST') == 1 || getPageSetting('c3GM_ST') == 3))
		purchaseSingleRunBonus('goldMaps');
	if (!game.singleRunBonuses.sharpTrimps.owned && game.global.b >= 25 && (getPageSetting('c3GM_ST') == 2 || getPageSetting('c3GM_ST') == 3))
		purchaseSingleRunBonus('sharpTrimps');
}

function PurchasePerkRespec() {
	//Obtains a respec if one isn't available by buying a bone portal. Be warned will use 100 bones to do so
	if (!game.global.canRespecPerks && game.global.b >= 100) {
		showBones();
		tooltip('Confirm Purchase', null, 'update', 'You are about to purchase one Instant Portal for 100 bones. Your new helium will appear in the View Perks menu at the bottom of the screen. Is this what you wanted to do?', 'purchaseMisc(\'helium\')', 100);
		hideBones();
		debug("Bone portal respec purchased");
	}
}

function PandemoniumPerkRespec() {
	//Setting up pandGoal variable.
	pandGoal = typeof (pandGoal) == 'undefined' && getPageSetting('rPandRespecZone') == -1 ? "NEG" :
		typeof (pandGoal) == 'undefined' && game.global.world < getPageSetting('rPandRespecZone') ? 0 :
			typeof (pandGoal) == 'undefined' && game.challenges.Pandemonium.pandemonium > 0 ? "destacking" :
				typeof (pandGoal) == 'undefined' && game.challenges.Pandemonium.pandemonium == 0 && game.upgrades.Speedminer.done == game.global.world ? "jestFarm" :
					typeof (pandGoal) == 'undefined' ? 0 :
						pandGoal;

	if (getPageSetting('rPandRespecZone') != -1 && getPageSetting('rPandRespecZone') <= game.global.world && getPageSetting('RPandemoniumAutoEquip') > 1 &&
		getPageSetting('RhsPandStaff') != "undefined" && (game.global.StaffEquipped.name == getPageSetting('RhsPandStaff') || HeirloomSearch('RhsPandStaff') != undefined) &&
		(getPageSetting('RPandemoniumAEZone') > 5 && game.global.world >= getPageSetting('RPandemoniumAEZone')) &&
		(getPageSetting('RPandemoniumZone') > 5 && game.global.world >= getPageSetting('RPandemoniumZone'))) {
		//Purchases a respec if one isn't currently available.
		if (!game.global.canRespecPerks && game.global.world < 150) {
			PurchasePerkRespec();
		}

		//Respecs to preset 2 if you're currently destacking.
		if (rShouldPandemoniumDestack) {
			if (pandGoal != "destacking") {
				PerkRespec(2)
				pandGoal = "destacking";
			}
		}

		//Respecs to preset 3 if you should equip farm.
		if (game.challenges.Pandemonium.pandemonium == 0 && game.upgrades.Speedminer.done == game.global.world) {
			if (pandGoal != "jestFarm") {
				PerkRespec(3)
				pandGoal = "jestFarm";
				savefile = null;
			}
		}
	}
}
