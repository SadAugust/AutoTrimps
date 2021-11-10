//Helium

var upgradeList = ['Miners', 'Scientists', 'Coordination', 'Speedminer', 'Speedlumber', 'Speedfarming', 'Speedscience', 'Speedexplorer', 'Megaminer', 'Megalumber', 'Megafarming', 'Megascience', 'Efficiency', 'TrainTacular', 'Trainers', 'Explorers', 'Blockmaster', 'Battle', 'Bloodlust', 'Bounty', 'Egg', 'Anger', 'Formations', 'Dominance', 'Barrier', 'UberHut', 'UberHouse', 'UberMansion', 'UberHotel', 'UberResort', 'Trapstorm', 'Gigastation', 'Shieldblock', 'Potency', 'Magmamancers'];

function buyUpgrades() {

    for (var upgrade in upgradeList) {
        upgrade = upgradeList[upgrade];
        var gameUpgrade = game.upgrades[upgrade];
        var available = (gameUpgrade.allowed > gameUpgrade.done && canAffordTwoLevel(gameUpgrade));
	var fuckbuildinggiga = (bwRewardUnlocked("AutoStructure") == true && game.talents.deciBuild.purchased && getPageSetting('hidebuildings')==true && getPageSetting('BuyBuildingsNew')==0);
		
	//Coord & Amals
	if (upgrade == 'Coordination' && (getPageSetting('BuyUpgradesNew') == 2 || !canAffordCoordinationTrimps())) continue;
	if (upgrade == 'Coordination' && getPageSetting('amalcoord')==true && getPageSetting('amalcoordhd') > 0 && calcHDratio() < getPageSetting('amalcoordhd') && ((getPageSetting('amalcoordt') < 0 && (game.global.world < getPageSetting('amalcoordz') || getPageSetting('amalcoordz') < 0)) || (getPageSetting('amalcoordt') > 0 && getPageSetting('amalcoordt') > game.jobs.Amalgamator.owned && (game.resources.trimps.realMax() / game.resources.trimps.getCurrentSend()) > 2000))) continue;
	
	//WS
	if (
	    upgrade == 'Coordination' && getEmpowerment() == "Wind" && 
	    (
		(getPageSetting('AutoStance') == 3 && game.global.challengeActive != "Daily" && getPageSetting('WindStackingMin') > 0 && game.global.world >= getPageSetting('WindStackingMin') && calcHDratio() < 5) || 
		(getPageSetting('use3daily') == true && game.global.challengeActive == "Daily" && getPageSetting('dWindStackingMin') > 0 && game.global.world >= getPageSetting('dWindStackingMin') && calcHDratio() < 5)
	    )
	) continue;
	
	if (
	    upgrade == 'Coordination' && 
	    (
		(getPageSetting('AutoStance') == 3 && game.global.challengeActive != "Daily" && getPageSetting('wsmax') > 0 && getPageSetting('wsmaxhd') > 0 && game.global.world >= getPageSetting('wsmax') && calcHDratio() < getPageSetting('wsmaxhd')) || 
		(getPageSetting('use3daily') == true && game.global.challengeActive == "Daily" && getPageSetting('dwsmax') > 0 && getPageSetting('dwsmaxhd') > 0 && game.global.world >= getPageSetting('dwsmax') && calcHDratio() < getPageSetting('dwsmaxhd'))
	    )
	) continue;

	//Other
        if (upgrade == 'Shieldblock' && !getPageSetting('BuyShieldblock')) continue;
        if (upgrade == 'Gigastation' && !fuckbuildinggiga && (game.global.lastWarp ? game.buildings.Warpstation.owned < (Math.floor(game.upgrades.Gigastation.done * getPageSetting('DeltaGigastation')) + getPageSetting('FirstGigastation')) : game.buildings.Warpstation.owned < getPageSetting('FirstGigastation'))) continue;
        if (upgrade == 'Bloodlust' && game.global.challengeActive == 'Scientist' && getPageSetting('BetterAutoFight')) continue;

        if (!available) continue;
        if (game.upgrades.Scientists.done < game.upgrades.Scientists.allowed && upgrade != 'Scientists') continue;
        buyUpgrade(upgrade, true, true);
        debug('Upgraded ' + upgrade, "upgrades", "*upload2");
    }
}

//Radon

var RupgradeList = ['Miners', 'Scientists', 'Coordination', 'Speedminer', 'Speedlumber', 'Speedfarming', 'Speedscience', 'Speedexplorer', 'Megaminer', 'Megalumber', 'Megafarming', 'Megascience', 'Efficiency', 'Explorers', 'Battle', 'Bloodlust', 'Bounty', 'Egg', 'Rage', 'Prismatic', 'Prismalicious', 'Formations', 'Dominance', 'UberHut', 'UberHouse', 'UberMansion', 'UberHotel', 'UberResort', 'Trapstorm', 'Potency'];

function RbuyUpgrades() {

    for (var upgrade in RupgradeList) {
        upgrade = RupgradeList[upgrade];
        var gameUpgrade = game.upgrades[upgrade];
        var available = (gameUpgrade.allowed > gameUpgrade.done && canAffordTwoLevel(gameUpgrade));
			
        //Coord
        if (upgrade == 'Coordination' && (getPageSetting('RBuyUpgradesNew') == 2 || !canAffordCoordinationTrimps())) continue;

        //Other
        if (!available) continue;
        if (game.upgrades.Scientists.done < game.upgrades.Scientists.allowed && upgrade != 'Scientists') continue;
        buyUpgrade(upgrade, true, true);
        debug('Upgraded ' + upgrade, "upgrades", "*upload2");
    }
}

function RautoGoldenUpgradesAT(setting) {
    var num = getAvailableGoldenUpgrades();
    var setting2;
    if (num == 0) return;
    if (setting == "Radon")
	setting2 = "Helium";
    if ((!game.global.dailyChallenge.seed && !game.global.runningChallengeSquared && autoTrimpSettings.RAutoGoldenUpgrades.selected == "Radon" && getPageSetting('Rradonbattle') > 0 && game.goldenUpgrades.Helium.purchasedAt.length >= getPageSetting('Rradonbattle')) || (game.global.dailyChallenge.seed && autoTrimpSettings.RdAutoGoldenUpgrades.selected == "Radon" && getPageSetting('Rdradonbattle') > 0 && game.goldenUpgrades.Helium.purchasedAt.length >= getPageSetting('Rdradonbattle')))
	setting2 = "Battle";
    if (setting == "Battle")
	setting2 = "Battle";
    if ((!game.global.dailyChallenge.seed && !game.global.runningChallengeSquared && autoTrimpSettings.RAutoGoldenUpgrades.selected == "Battle" && getPageSetting('Rbattleradon') > 0 && game.goldenUpgrades.Battle.purchasedAt.length >= getPageSetting('Rbattleradon')) || (game.global.dailyChallenge.seed && autoTrimpSettings.RdAutoGoldenUpgrades.selected == "Battle" && getPageSetting('Rdbattleradon') > 0 && game.goldenUpgrades.Battle.purchasedAt.length >= getPageSetting('Rdbattleradon')))
	setting2 = "Helium";
    if (setting == "Void" || setting == "Void + Battle")
        setting2 = "Void";
    if (game.global.challengeActive == "Mayhem" || game.global.challengeActive == "Pandemonium" ) 
        setting2 = "Battle";
    
    var success = buyGoldenUpgrade(setting2);
    if (!success && setting2 == "Void") {
        num = getAvailableGoldenUpgrades();
        if (num == 0) return;
	if ((autoTrimpSettings.RAutoGoldenUpgrades.selected == "Void" && !game.global.dailyChallenge.seed && !game.global.runningChallengeSquared) || (autoTrimpSettings.RdAutoGoldenUpgrades.selected == "Void" && game.global.dailyChallenge.seed))
	setting2 = "Helium";
	if (((autoTrimpSettings.RAutoGoldenUpgrades.selected == "Void" && getPageSetting('Rvoidheliumbattle') > 0 && game.global.world >= getPageSetting('Rvoidheliumbattle')) || (autoTrimpSettings.RdAutoGoldenUpgrades.selected == "Void" && getPageSetting('Rdvoidheliumbattle') > 0 && game.global.world >= getPageSetting('Rdvoidheliumbattle'))) || ((autoTrimpSettings.RAutoGoldenUpgrades.selected == "Void + Battle" && !game.global.dailyChallenge.seed && !game.global.runningChallengeSquared) || (autoTrimpSettings.RdAutoGoldenUpgrades.selected == "Void + Battle" && game.global.dailyChallenge.seed) || (autoTrimpSettings.RcAutoGoldenUpgrades.selected == "Void + Battle" && game.global.runningChallengeSquared)))
        setting2 = "Battle";
	buyGoldenUpgrade(setting2);
    }
}
