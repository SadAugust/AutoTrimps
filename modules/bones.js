//Resetting variables
rShouldBoneShrine = false;
rBoneShrineUsedZone = 0;

function BoneShrine() {
	
	//Setting up variables
	var rBoneShrineRunType = getPageSetting('rBoneShrineRunType');
	var runType = rBoneShrineRunType = 1 && game.global.challengeActive != 'Daily' && !game.global.runningChallengeSquared ? true :
					rBoneShrineRunType = 2 && game.global.challengeActive == 'Daily' ? true : 
					rBoneShrineRunType = 3 && game.global.runningChallengeSquared ? true :
					rBoneShrineRunType = 4 ? true :
					false;

	if (runType && getPageSetting('rBoneShrine') && rBoneShrineUsedZone != game.global.world) {
		var rBoneShrineZone = getPageSetting('rBoneShrineZone');
		var rBoneShrineCell = getPageSetting('rBoneShrineCell') > 0 ? getPageSetting('rBoneShrineCell') : 81;
		var rBoneShrineCharges = getPageSetting('rBoneShrineAmount');
		var rBoneShrineSpendBelow = getPageSetting('rBoneShrineSpendBelow') === -1 ? 0 : getPageSetting('rBoneShrineSpendBelow');
        var count = 0;
        debug(rBoneShrineSpendBelow);
		var rBSIndex = rBoneShrineZone.indexOf(game.global.world);
		rShouldBoneShrine = (rBoneShrineZone[rBSIndex] == game.global.world  && game.global.lastClearedCell + 2 == rBoneShrineCell && game.permaBoneBonuses.boosts.charges > rBoneShrineSpendBelow);
        
		if (rShouldBoneShrine) {
			setGather(getPageSetting('rBoneShrineGather'));
			if (getPageSetting('Rhs' + getPageSetting('rBoneShrineGather')[0].toUpperCase() + getPageSetting('rBoneShrineGather').slice(1) + 'Staff') !== 'undefined')
				HeirloomEquipStaff('Rhs' + getPageSetting('rBoneShrineGather')[0].toUpperCase() + getPageSetting('rBoneShrineGather').slice(1) + 'Staff');
			else if (getPageSetting('RhsGeneralStaff') !== 'undefined')
				HeirloomEquipStaff('RhsGeneralStaff');

	        for (var x = 0; x < rBoneShrineCharges[rBSIndex]; x++) {
                if (getPageSetting('rBoneShrineAmount') >= game.permaBoneBonuses.boosts.charges) continue;
                count = x+1;
				game.permaBoneBonuses.boosts.consume()
			}
			debug('Consumed ' + count + " bone shrine " + (count == 1 ? "charge on zone " : "charges on zone ") + game.global.world);
			rBoneShrineUsedZone = game.global.world;
		}
	}
}

function BuySingleRunBonuses() {
	if (game.global.runningChallengeSquared || game.global.challengeActive == 'Mayhem' || game.global.challengeActive == 'Pandemonium') {
		if ((getPageSetting('c3GM_ST') == 1 || getPageSetting('c3GM_ST') == 3) && !game.singleRunBonuses.goldMaps.owned && game.global.b >=20) 
			purchaseSingleRunBonus('goldMaps');
		if ((getPageSetting('c3GM_ST') == 2 || getPageSetting('c3GM_ST') == 3)  && !game.singleRunBonuses.sharpTrimps.owned && game.global.b >=25) 
			purchaseSingleRunBonus('sharpTrimps');
	}
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
    pandGoal =  typeof(pandGoal) == 'undefined' && getPageSetting('rPandRespecZone') == -1 ? "NEG" : 
                typeof(pandGoal) == 'undefined' && game.global.world < getPageSetting('rPandRespecZone') ? 0 : 
                typeof(pandGoal) == 'undefined' && game.challenges.Pandemonium.pandemonium > 0 ? "destacking" : 
                typeof(pandGoal) == 'undefined' && game.challenges.Pandemonium.pandemonium == 0 && game.upgrades.Speedminer.done == game.global.world ? "jestFarm" : 
                typeof(pandGoal) == 'undefined' ? 0 :
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
