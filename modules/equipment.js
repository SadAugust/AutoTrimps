//Helium

MODULES["equipment"] = {};
MODULES["equipment"].numHitsSurvived = 10;
MODULES["equipment"].numHitsSurvivedScry = 80;
MODULES["equipment"].capDivisor = 10;
MODULES["equipment"].alwaysLvl2 = getPageSetting('always2');
MODULES["equipment"].waitTill60 = true;
MODULES["equipment"].equipHealthDebugMessage = false;
var equipmentList = {
    'Dagger': {
        Upgrade: 'Dagadder',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Mace': {
        Upgrade: 'Megamace',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Polearm': {
        Upgrade: 'Polierarm',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Battleaxe': {
        Upgrade: 'Axeidic',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Greatsword': {
        Upgrade: 'Greatersword',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Boots': {
        Upgrade: 'Bootboost',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Helmet': {
        Upgrade: 'Hellishmet',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Pants': {
        Upgrade: 'Pantastic',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Shoulderguards': {
        Upgrade: 'Smoldershoulder',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Breastplate': {
        Upgrade: 'Bestplate',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Arbalest': {
        Upgrade: 'Harmbalest',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Gambeson': {
        Upgrade: 'GambesOP',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Shield': {
        Upgrade: 'Supershield',
        Stat: 'health',
        Resource: 'wood',
        Equip: true
    },
    'Gym': {
        Upgrade: 'Gymystic',
        Stat: 'block',
        Resource: 'wood',
        Equip: false
    }
};
var mapresourcetojob = {"food": "Farmer", "wood": "Lumberjack", "metal": "Miner", "science": "Scientist"}; 
function equipEffect(a,b){if(b.Equip)return a[b.Stat+'Calculated'];var c=a.increase.by*a.owned,d=game.upgrades.Gymystic.done?game.upgrades.Gymystic.modifier+0.01*(game.upgrades.Gymystic.done-1):1,e=a.increase.by*(a.owned+1)*d;return e-c}
function equipCost(a,b){var c=parseFloat(getBuildingItemPrice(a,b.Resource,b.Equip,1));return c=b.Equip?Math.ceil(c*Math.pow(1-game.portal.Artisanistry.modifier,game.portal.Artisanistry.level)):Math.ceil(c*Math.pow(1-game.portal.Resourceful.modifier,game.portal.Resourceful.level)),c}
function PrestigeValue(a){var b=game.upgrades[a].prestiges,c=game.equipment[b],d;d=c.blockNow?"block":"undefined"==typeof c.health?"attack":"health";var e=Math.round(c[d]*Math.pow(1.19,c.prestige*game.global.prestige[d]+1));return e}

function evaluateEquipmentEfficiency(equipName) {
    var equip = equipmentList[equipName];
    var gameResource = equip.Equip ? game.equipment[equipName] : game.buildings[equipName];
    if (equipName == 'Shield')
		equip.Stat = gameResource.blockNow ? "block" : "health";

    var Effect = equipEffect(gameResource, equip);
    var Cost = equipCost(gameResource, equip);
    var Factor = Effect / Cost;
    var StatusBorder = 'white';
    var Wall = false;

    var BuyWeaponUpgrades = ((getPageSetting('BuyWeaponsNew') == 1) || (getPageSetting('BuyWeaponsNew') == 2));
    var BuyArmorUpgrades = ((getPageSetting('BuyArmorNew') == 1) || (getPageSetting('BuyArmorNew') == 2));
    if (!game.upgrades[equip.Upgrade].locked) {
        var CanAfford = canAffordTwoLevel(game.upgrades[equip.Upgrade]);
        if (equip.Equip) {
            var NextEffect = PrestigeValue(equip.Upgrade);
            if ((game.global.challengeActive == "Scientist" && getScientistLevel() > 2) || (!BuyWeaponUpgrades && !BuyArmorUpgrades))
                var NextCost = Infinity;
            else
                var NextCost = Math.ceil(getNextPrestigeCost(equip.Upgrade) * Math.pow(1 - game.portal.Artisanistry.modifier, game.portal.Artisanistry.level));
            Wall = (NextEffect / NextCost > Factor);
        }


        if (!CanAfford) {
            StatusBorder = 'yellow';
        } else {
            if (!equip.Equip) {

                StatusBorder = 'red';
            } else {
                var CurrEffect = gameResource.level * Effect;
                var NeedLevel = Math.ceil(CurrEffect / NextEffect);
                var Ratio = gameResource.cost[equip.Resource][1];
                var NeedResource = NextCost * (Math.pow(Ratio, NeedLevel) - 1) / (Ratio - 1);
                if (game.resources[equip.Resource].owned > NeedResource) {
                    StatusBorder = 'red';
                } else {
                    StatusBorder = 'orange';
                }
            }
        }
    }
    if (game.jobs[mapresourcetojob[equip.Resource]].locked && (game.global.challengeActive != 'Metal')) {

        Factor = 0;
        Wall = true;
    }

    var isLiquified = (game.options.menu.liquification.enabled && game.talents.liquification.purchased && !game.global.mapsActive && game.global.gridArray && game.global.gridArray[0] && game.global.gridArray[0].name == "Liquimp");
    var cap = 100;
    if (equipmentList[equipName].Stat == 'health') cap = getPageSetting('CapEquiparm');
    if (equipmentList[equipName].Stat == 'attack') cap = getPageSetting('CapEquip2');
    if ((isLiquified) && cap > 0 && gameResource.level >= (cap / MODULES["equipment"].capDivisor)) {
        Factor = 0;
        Wall = true;
    } else if (cap > 0 && gameResource.level >= cap) {
        Factor = 0;
        Wall = true;
    }
    if (equipName != 'Gym' && game.global.world < 60 && game.global.world >= 58 && MODULES["equipment"].waitTill60) {
        Wall = true;
    }
    if (gameResource.level < 2 && getPageSetting('always2') == true) {
        Factor = 999 - gameResource.prestige;
    }
    if (equipName == 'Shield' && gameResource.blockNow &&
        game.upgrades['Gymystic'].allowed - game.upgrades['Gymystic'].done > 0) {
        needGymystic = true;
        Factor = 0;
        Wall = true;
        StatusBorder = 'orange';
    }
    return {
        Stat: equip.Stat,
        Factor: Factor,
        StatusBorder: StatusBorder,
        Wall: Wall,
        Cost: Cost
    };
}

var resourcesNeeded;
var Best;

function orangewindstack(){(9<game.equipment.Dagger.level&&0==game.upgrades.Dagadder.locked&&buyUpgrade('Dagadder',!0,!0),9<game.equipment.Mace.level&&0==game.upgrades.Megamace.locked&&buyUpgrade('Megamace',!0,!0),9<game.equipment.Polearm.level&&0==game.upgrades.Polierarm.locked&&buyUpgrade('Polierarm',!0,!0),9<game.equipment.Battleaxe.level&&0==game.upgrades.Axeidic.locked&&buyUpgrade('Axeidic',!0,!0),9<game.equipment.Greatsword.level&&0==game.upgrades.Greatersword.locked&&buyUpgrade('Greatersword',!0,!0),9<game.equipment.Arbalest.level&&0==game.upgrades.Harmbalest.locked&&buyUpgrade('Harmbalest',!0,!0),0==game.upgrades.Bootboost.locked&&buyUpgrade('Bootboost',!0,!0),0==game.upgrades.Hellishmet.locked&&buyUpgrade('Hellishmet',!0,!0),0==game.upgrades.Pantastic.locked&&buyUpgrade('Pantastic',!0,!0),0==game.upgrades.Smoldershoulder.locked&&buyUpgrade('Smoldershoulder',!0,!0),0==game.upgrades.Bestplate.locked&&buyUpgrade('Bestplate',!0,!0),0==game.upgrades.GambesOP.locked&&buyUpgrade('GambesOP',!0,!0),0==game.upgrades.Supershield.locked&&buyUpgrade('Supershield',!0,!0))}
function dorangewindstack(){(9<game.equipment.Dagger.level&&0==game.upgrades.Dagadder.locked&&buyUpgrade('Dagadder',!0,!0),9<game.equipment.Mace.level&&0==game.upgrades.Megamace.locked&&buyUpgrade('Megamace',!0,!0),9<game.equipment.Polearm.level&&0==game.upgrades.Polierarm.locked&&buyUpgrade('Polierarm',!0,!0),9<game.equipment.Battleaxe.level&&0==game.upgrades.Axeidic.locked&&buyUpgrade('Axeidic',!0,!0),9<game.equipment.Greatsword.level&&0==game.upgrades.Greatersword.locked&&buyUpgrade('Greatersword',!0,!0),9<game.equipment.Arbalest.level&&0==game.upgrades.Harmbalest.locked&&buyUpgrade('Harmbalest',!0,!0),0==game.upgrades.Bootboost.locked&&buyUpgrade('Bootboost',!0,!0),0==game.upgrades.Hellishmet.locked&&buyUpgrade('Hellishmet',!0,!0),0==game.upgrades.Pantastic.locked&&buyUpgrade('Pantastic',!0,!0),0==game.upgrades.Smoldershoulder.locked&&buyUpgrade('Smoldershoulder',!0,!0),0==game.upgrades.Bestplate.locked&&buyUpgrade('Bestplate',!0,!0),0==game.upgrades.GambesOP.locked&&buyUpgrade('GambesOP',!0,!0),0==game.upgrades.Supershield.locked&&buyUpgrade('Supershield',!0,!0))}

function windstackingprestige() {
    if (
		(game.global.challengeActive != "Daily" && getEmpowerment() == "Wind" && getPageSetting('WindStackingMin') > 0 && game.global.world >= getPageSetting('WindStackingMin') && calcHDratio() < 5) || 
		(game.global.challengeActive == "Daily" && getEmpowerment() == "Wind" && getPageSetting('dWindStackingMin') > 0 && game.global.world >= getPageSetting('dWindStackingMin') && calcHDratio() < 5) || 
		(game.global.challengeActive != "Daily" && getPageSetting('wsmax') > 0 && getPageSetting('wsmaxhd') > 0 && game.global.world >= getPageSetting('wsmax') && calcHDratio() < getPageSetting('wsmaxhd')) || 
		(game.global.challengeActive == "Daily" && getPageSetting('dwsmax') > 0 && getPageSetting('dwsmaxhd') > 0 && game.global.world >= getPageSetting('dwsmax') && calcHDratio() < getPageSetting('dwsmaxhd'))
	) {
	if (game.global.challengeActive != "Daily") orangewindstack();
	if (game.global.challengeActive == "Daily") dorangewindstack();
        return false;
    }
    else return true;
}

var preBuyAmt2=1;
var preBuyFiring2=1;
var preBuyTooltip2=false;
var preBuymaxSplit2=1;
var preBuyCustomFirst2=1;
var preBuyCustomLast2=1;

function preBuy3() {
    preBuyAmt2 = game.global.buyAmt;
    preBuyFiring2 = game.global.firing;
    preBuyTooltip2 = game.global.lockTooltip;
    preBuymaxSplit2 = game.global.maxSplit;
    preBuyCustomFirst2 = game.global.firstCustomAmt;
    preBuyCustomLast2 = game.global.lastCustomAmt;
}

function postBuy3() {
    game.global.buyAmt = preBuyAmt2;
    game.global.firing = preBuyFiring2;
    game.global.lockTooltip = preBuyTooltip2;
    game.global.maxSplit = preBuymaxSplit2;
    game.global.firstCustomAmt = preBuyCustomFirst2;
    game.global.lastCustomAmt = preBuyCustomLast2;
}

function autoLevelEquipment() {

    var gearamounttobuy = (getPageSetting('gearamounttobuy') > 0) ? getPageSetting('gearamounttobuy') : 1;

    //WS
    var enoughDamageCutoff = getPageSetting("dmgcuntoff");
    if (getEmpowerment() == 'Wind' && game.global.challengeActive != "Daily" && !game.global.runningChallengeSquared && getPageSetting("AutoStance") == 3 && getPageSetting("WindStackingMin") > 0 && game.global.world >= getPageSetting("WindStackingMin") && getPageSetting("windcutoff") > 0)
        enoughDamageCutoff = getPageSetting("windcutoff");
    if (getEmpowerment() == 'Wind' && game.global.challengeActive == "Daily" && !game.global.runningChallengeSquared && (getPageSetting("AutoStance") == 3 || getPageSetting("use3daily") == true) && getPageSetting("dWindStackingMin") > 0 && game.global.world >= getPageSetting("dWindStackingMin") && getPageSetting("dwindcutoff") > 0)
        enoughDamageCutoff = getPageSetting("dwindcutoff");

    if (calcOurDmg("avg", false, true) <= 0) return;
    resourcesNeeded = {
        "food": 0,
        "wood": 0,
        "metal": 0,
        "science": 0,
        "gems": 0
    };
    Best = {};
    var keys = ['healthwood', 'healthmetal', 'attackmetal', 'blockwood'];
    for (var i = 0; i < keys.length; i++) {
        Best[keys[i]] = {
            Factor: 0,
            Name: '',
            Wall: false,
            StatusBorder: 'white',
            Cost: 0
        };
    }
    var ourDamage = calcOurDmg("avg", false, true);
    var mapbonusmulti = 1 + (0.20 * game.global.mapBonus);
    if (game.global.mapBonus > 0) {
        ourDamage *= mapbonusmulti;
    }
    if (game.global.challengeActive == 'Lead') {
        if (game.global.world % 2 == 1 && game.global.world != 179) {
            ourDamage /= 1.5;
        }
    }
    //Shield
    highDamageShield();
    if (getPageSetting('loomswap') > 0 && game.global.challengeActive != "Daily" && game.global.ShieldEquipped.name != getPageSetting('highdmg'))
	ourDamage *= trimpAA;
    if (getPageSetting('dloomswap') > 0 && game.global.challengeActive == "Daily" && game.global.ShieldEquipped.name != getPageSetting('dhighdmg'))
	ourDamage *= trimpAA;


    var enemyDamage = calcBadGuyDmg(null, getEnemyMaxAttack(game.global.world + 1, 50, 'Snimp', 1.0), true, true);
    var enemyHealth = calcEnemyHealth();
    var pierceMod = (game.global.brokenPlanet && !game.global.mapsActive) ? getPierceAmt() : 0;
    var numHits = MODULES["equipment"].numHitsSurvived;
    var enoughHealthE = (calcOurHealth(true) > numHits * (enemyDamage - calcOurBlock(true) > 0 ? enemyDamage - calcOurBlock(true) : enemyDamage * pierceMod));
    var enoughDamageE = (ourDamage * enoughDamageCutoff > enemyHealth);

    for (var equipName in equipmentList) {
        var equip = equipmentList[equipName];
        var gameResource = equip.Equip ? game.equipment[equipName] : game.buildings[equipName];
        if (!gameResource.locked) {
            var $equipName = document.getElementById(equipName);
            $equipName.style.color = 'white';
            var evaluation = evaluateEquipmentEfficiency(equipName);
            var BKey = equip.Stat + equip.Resource;

            if (Best[BKey].Factor === 0 || Best[BKey].Factor < evaluation.Factor) {
                Best[BKey].Factor = evaluation.Factor;
                Best[BKey].Name = equipName;
                Best[BKey].Wall = evaluation.Wall;
                Best[BKey].StatusBorder = evaluation.StatusBorder;
            }
            Best[BKey].Cost = evaluation.Cost;
            resourcesNeeded[equip.Resource] += Best[BKey].Cost;

            if (evaluation.Wall)
                $equipName.style.color = 'yellow';
            $equipName.style.border = '1px solid ' + evaluation.StatusBorder;

            var $equipUpgrade = document.getElementById(equip.Upgrade);
            if (evaluation.StatusBorder != 'white' && evaluation.StatusBorder != 'yellow' && $equipUpgrade)
                $equipUpgrade.style.color = evaluation.StatusBorder;
            if (evaluation.StatusBorder == 'yellow' && $equipUpgrade)
                $equipUpgrade.style.color = 'white';
            if (equipName == 'Gym' && needGymystic) {
                $equipName.style.color = 'white';
                $equipName.style.border = '1px solid white';
                if ($equipUpgrade) {
                    $equipUpgrade.style.color = 'red';
                    $equipUpgrade.style.border = '2px solid red';
                }
            }

            if (evaluation.StatusBorder == 'red' && windstackingprestige() && !(game.global.world < 60 && game.global.world >= 58 && MODULES["equipment"].waitTill60)) {
                var BuyWeaponUpgrades = ((getPageSetting('BuyWeaponsNew') == 1) || (getPageSetting('BuyWeaponsNew') == 2));
                var BuyArmorUpgrades = ((getPageSetting('BuyArmorNew') == 1) || (getPageSetting('BuyArmorNew') == 2));
                var DelayArmorWhenNeeded = getPageSetting('DelayArmorWhenNeeded');

                if (
                    (BuyWeaponUpgrades && equipmentList[equipName].Stat == 'attack') ||
                    (BuyWeaponUpgrades && equipmentList[equipName].Stat == 'block') ||
                    (BuyArmorUpgrades && equipmentList[equipName].Stat == 'health' &&
                        (
                            (DelayArmorWhenNeeded && !shouldFarm) ||
                            (DelayArmorWhenNeeded && enoughDamageE) ||
                            (DelayArmorWhenNeeded && !enoughDamageE && !enoughHealthE) ||
                            (DelayArmorWhenNeeded && equipmentList[equipName].Resource == 'wood') ||
                            (!DelayArmorWhenNeeded)
                        )
                    )
                )

                {
                    var upgrade = equipmentList[equipName].Upgrade;
                    if (upgrade != "Gymystic")
                        debug('Upgrading ' + upgrade + " - Prestige " + game.equipment[equipName].prestige, "equips", '*upload');
                    else
                        debug('Upgrading ' + upgrade + " # " + game.upgrades[upgrade].allowed, "equips", '*upload');
                    buyUpgrade(upgrade, true, true);
                } else {
                    $equipName.style.color = 'orange';
                    $equipName.style.border = '2px solid orange';
                }
            }
        }
    }

    var BuyWeaponLevels = ((getPageSetting('BuyWeaponsNew') == 1) || (getPageSetting('BuyWeaponsNew') == 3));
    var BuyArmorLevels = ((getPageSetting('BuyArmorNew') == 1) || (getPageSetting('BuyArmorNew') == 3));
    preBuy3();
    for (var stat in Best) {
        var eqName = Best[stat].Name;
        if (eqName !== '') {
            var $eqName = document.getElementById(eqName);
            var DaThing = equipmentList[eqName];
            if (eqName == 'Gym' && needGymystic) {
                $eqName.style.color = 'white';
                $eqName.style.border = '1px solid white';
                continue;
            } else {
                $eqName.style.color = Best[stat].Wall ? 'orange' : 'red';
                $eqName.style.border = '2px solid red';
            }
            var maxmap = getPageSetting('MaxMapBonusAfterZone') && doMaxMapBonus;
            if (BuyArmorLevels && (DaThing.Stat == 'health' || DaThing.Stat == 'block') && (!enoughHealthE || maxmap)) {
                game.global.buyAmt = gearamounttobuy;
                if (DaThing.Equip && !Best[stat].Wall && canAffordBuilding(eqName, null, null, true)) {
                    debug('Leveling equipment ' + eqName, "equips", '*upload3');
                    buyEquipment(eqName, null, true);
                }
            }
            var aalvl2 = getPageSetting('always2');
            if (BuyArmorLevels && (DaThing.Stat == 'health') && aalvl2 && game.equipment[eqName].level < 2) {
                game.global.buyAmt = 1;
                if (DaThing.Equip && !Best[stat].Wall && canAffordBuilding(eqName, null, null, true)) {
                    debug('Leveling equipment ' + eqName + " (AlwaysLvl2)", "equips", '*upload3');
                    buyEquipment(eqName, null, true);
                }
            }
            if (windstackingprestige() && BuyWeaponLevels && DaThing.Stat == 'attack' && (!enoughDamageE || enoughHealthE || maxmap)) {
                game.global.buyAmt = gearamounttobuy;
                if (DaThing.Equip && !Best[stat].Wall && canAffordBuilding(eqName, null, null, true)) {
                    debug('Leveling equipment ' + eqName, "equips", '*upload3');
                    buyEquipment(eqName, null, true);
                }
            }
        }
    }
    postBuy3();
}
function areWeAttackLevelCapped(){var a=[];for(var b in equipmentList){var c=equipmentList[b],d=c.Equip?game.equipment[b]:game.buildings[b];if(!d.locked){var e=evaluateEquipmentEfficiency(b);"attack"==e.Stat&&a.push(e)}}return a.every(f=>0==f.Factor&&!0==f.Wall)}

//Radon
var RequipmentList = {
    'Dagger': {
        Upgrade: 'Dagadder',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Mace': {
        Upgrade: 'Megamace',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Polearm': {
        Upgrade: 'Polierarm',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Battleaxe': {
        Upgrade: 'Axeidic',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Greatsword': {
        Upgrade: 'Greatersword',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Boots': {
        Upgrade: 'Bootboost',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Helmet': {
        Upgrade: 'Hellishmet',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Pants': {
        Upgrade: 'Pantastic',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Shoulderguards': {
        Upgrade: 'Smoldershoulder',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Breastplate': {
        Upgrade: 'Bestplate',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Arbalest': {
        Upgrade: 'Harmbalest',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Gambeson': {
        Upgrade: 'GambesOP',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Shield': {
        Upgrade: 'Supershield',
        Stat: 'health',
        Resource: 'wood',
        Equip: true
    }
};

function Rgetequips(map, special) { //(level, p b or false)
    var specialCount = 0;
    var unlocksObj;
    var world;
    var prestigeArray = [];
    var hasPrestigious = false;
    unlocksObj = game.mapUnlocks;
    if (special == 'p') hasPrestigious = true;
    var Rlocation;
    if (special == 'p' || special == false) Rlocation = "Plentiful";
    world = map;
    var canLast = 1;
    var prestigeItemsAvailable = [];
    for (var item in unlocksObj) {
        var special = unlocksObj[item];
	if (!special.prestige) continue;
        if (special.locked) continue;
        if (game.global.universe == 2 && special.blockU2) continue;
        if (game.global.universe == 1 && special.blockU1) continue;
		if (game.global.challengeActive == "Pandemonium" && upgradeToUnlock.prestige && game.challenges.Pandemonium.isEquipBlocked(game.upgrades[toUnlock[x]].prestiges)) continue;	
        if (special.brokenPlanet && ((special.brokenPlanet == 1 && !game.global.brokenPlanet) || special.brokenPlanet == -1 && game.global.brokenPlanet)) continue;
        if (special.startAt < 0) continue;
        if (special.lastAt < game.global.world) continue;
        if ((special.filterUpgrade)) {
            var mapConfigLoc = game.mapConfig.locations[Rlocation];
            if (typeof mapConfigLoc.upgrade === 'object') {
                var usable = false;
                for (var x = 0; x < mapConfigLoc.upgrade.length; x++) {
                    if (mapConfigLoc.upgrade[x] != item) continue;
                    usable = true;
                    break;
                }
                if (!usable) continue;
            } else if (mapConfigLoc.upgrade != item) continue;
        }
        if ((special.level == "last" && canLast > 0 && special.world <= world && (special.canRunOnce || special.canRunWhenever))) {
            if (canLast == 2 && !special.prestige) continue;
            if (typeof special.specialFilter !== 'undefined') {
                if (!special.specialFilter(world)) continue;
            }
            if (special.startAt > world) continue;
            specialCount++;
            continue;
            if (hasPrestigious && canLast == 1 && item == "roboTrimp")
                canLast = 3;
            else
                canLast = 0;
            continue;
        }

        if (special.world != world && special.world > 0) continue;
        if ((special.world == -2) && ((world % 2) !== 0)) continue;
        if ((special.world == -3) && ((world % 2) != 1)) continue;
        if ((special.world == -5) && ((world % 5) !== 0)) continue;
        if ((special.world == -33) && ((world % 3) !== 0)) continue;
        if ((special.world == -10) && ((world % 10) !== 0)) continue;
        if ((special.world == -20) && ((world % 20) !== 0)) continue;
        if ((special.world == -25) && ((world % 25) !== 0)) continue;
        if (typeof special.specialFilter !== 'undefined') {
            if (!special.specialFilter(world)) continue;
        }
        if ((typeof special.startAt !== 'undefined') && (special.startAt > world)) continue;
        if (typeof special.canRunOnce === 'undefined' && (special.level == "last") && canLast > 0 && (special.last <= (world - 5))) {
            specialCount += Math.floor((world - special.last) / 5);
            continue;
        }
        if (special.level == "last") continue;
        if (special.canRunOnce === true) {
            specialCount++;
            continue;
        } else if (special.addToCount) specialCount++;
    }
    return specialCount;
}

//Shol Territory

function mostEfficientEquipment(resourceMaxPercent, zoneGo, ignoreShield, skipForLevels, fakeLevels = {}) {

    for (var i in RequipmentList) {
        if (typeof fakeLevels[i] === 'undefined') {
            fakeLevels[i] = 0;
        }
    }

    var rEquipZone = game.global.challengeActive == "Daily" && getPageSetting('Rdequipon') ? getPageSetting('Rdequipzone') : getPageSetting('Requipzone');
    var zoneGo =    !zoneGo && (rEquipZone[0] > 0 && (rEquipZone.includes(game.global.world)) || game.global.world >= rEquipZone[rEquipZone.length-1]) ? true :
                    zoneGo;
    var resourceMaxPercent =    !resourceMaxPercent && zoneGo ? 100 :
                                !resourceMaxPercent && getPageSetting('Requippercent') < 0 ? 100 : 
                                !resourceMaxPercent ? getPageSetting('Requippercent') :
                                resourceMaxPercent
    var ignoreShield = !ignoreShield ? false : true;
    var mostEfficient = [
    {
        name: "",
        statPerResource: Infinity,
        prestige: false,
        cost: 0,
    },
    {
        name: "",
        statPerResource: Infinity,
        prestige: false,
        cost: 0,
    }
    ];
	
	var highestPrestige = 0;

    for (var i in RequipmentList) {
        var isAttack = (RequipmentList[i].Stat === 'attack' ? 0 : 1);
        var skipForLevels = !skipForLevels && isAttack == 0 ? getPageSetting('Requipcapattack') :
                            !skipForLevels && isAttack == 1 ? getPageSetting('Requipcaphealth') :
                            skipForLevels
        var nextLevelCost = game.equipment[i].cost[RequipmentList[i].Resource][0] * Math.pow(game.equipment[i].cost[RequipmentList[i].Resource][1], game.equipment[i].level + fakeLevels[i]) * getEquipPriceMult();
        var prestige = false;

        //Skips if we have the required number of that item and below zoneGo
        if (!zoneGo && !buyPrestigeMaybe(i) && Number.isInteger(skipForLevels) && game.equipment[i].level >= skipForLevels) continue;
        //Skips if ignoreShield variable is true.
        if (ignoreShield && i == 'Shield') continue;
		//Skips looping through equips if they're blocked during Pandemonium.
        if (game.global.challengeActive == "Pandemonium" && game.challenges.Pandemonium.isEquipBlocked(i)) continue;
        //Skips buying shields when you can afford bonfires on Hypothermia.
        if (game.global.challengeActive == 'Hypothermia' && game.resources.wood.owned > game.challenges.Hypothermia.bonfirePrice() && i == 'Shield') continue;
        //Skips through equips if they cost more than your Requippercent setting value.
        if (!zoneGo && !canAffordBuilding(i,null,null,true,false,1,resourceMaxPercent)) continue;
        //Skips through equips if they don't cost metal and you don't have enough resources for them.
        if (RequipmentList[i].Resource != 'metal' && !canAffordBuilding(i, null, null, true, false, 1,resourceMaxPercent)) continue;

        var nextLevelValue = game.equipment[i][RequipmentList[i].Stat + "Calculated"];
        var isAttack = (RequipmentList[i].Stat === 'attack' ? 0 : 1);
        var safeRatio = nextLevelCost / nextLevelValue;

        if (buyPrestigeMaybe(i)[0] && mostEfficient[isAttack].statPerResource > buyPrestigeMaybe(i)[1]) {
            safeRatio = buyPrestigeMaybe(i)[1];
            nextLevelCost = buyPrestigeMaybe(i)[2]
            prestige = true;
        }
		if (getPageSetting('rEquipHighestPrestige')) {
            for (var item in game.equipment) { 
                if (item == "Shield") continue;
    			var equip = game.equipment[item];
    			if (equip.prestige > highestPrestige) highestPrestige = equip.prestige;
		    }
            if (game.equipment[i].prestige < highestPrestige && prestige == false) continue;
        }

        if (mostEfficient[isAttack].statPerResource > safeRatio && mostEfficient[isAttack].statPerResource != '') {
            mostEfficient[isAttack].name = i;
            mostEfficient[isAttack].statPerResource = safeRatio;
            mostEfficient[isAttack].prestige = prestige;
            mostEfficient[isAttack].cost = nextLevelCost;
        }
    }

    return [mostEfficient[0].name, mostEfficient[1].name, mostEfficient[0].statPerResource, mostEfficient[1].statPerResource, mostEfficient[0].prestige, mostEfficient[1].prestige, mostEfficient[0].cost, mostEfficient[1].cost];
}

function getMaxAffordable(baseCost, totalResource, costScaling, isCompounding) {
    if (!isCompounding) {
        return Math.floor(
            (costScaling - (2 * baseCost) + Math.sqrt(Math.pow(2 * baseCost - costScaling, 2) + (8 * costScaling * totalResource))) / 2
        );
    } else {
        return Math.floor(Math.log(1 - (1 - costScaling) * totalResource / baseCost) / Math.log(costScaling));
    }
}

function buyPrestigeMaybe(equipName) {
	
	if (game.global.challengeActive == "Pandemonium" && game.challenges.Pandemonium.isEquipBlocked(equipName)) return false;
    var equipment = game.equipment[equipName];
    var resource = (equipName == "Shield") ? 'wood' : 'metal'
    var equipStat = (typeof equipment.attack !== 'undefined') ? 'attack' : 'health';
	
    var prestigeUpgradeName = "";
    var allUpgradeNames = Object.getOwnPropertyNames(game.upgrades);
    for (var upgrade of allUpgradeNames) {
        if (game.upgrades[upgrade].prestiges === equipName) {
            prestigeUpgradeName = upgrade;
            break;
        }
    }

    if (game.upgrades[prestigeUpgradeName].locked || (prestigeUpgradeName == 'Supershield' && getNextPrestigeCost(prestigeUpgradeName) * getEquipPriceMult() > game.resources.wood.owned)) return false;

    if (game.upgrades[prestigeUpgradeName].cost.resources.science[0] *
        Math.pow(game.upgrades[prestigeUpgradeName].cost.resources.science[1], game.equipment[equipName].prestige - 1)
        > game.resources.science.owned) {
            return false;
    }

    if (game.upgrades[prestigeUpgradeName].cost.resources.gems[0] *
        Math.pow(game.upgrades[prestigeUpgradeName].cost.resources.gems[1], game.equipment[equipName].prestige - 1)
        > game.resources.gems.owned) {
            return false;
    }

    var levelOnePrestige = getNextPrestigeCost(prestigeUpgradeName) * getEquipPriceMult();
    var newLevel = Math.floor(getMaxAffordable(levelOnePrestige * 1.2,game.resources[resource].owned,1.2,true)) + 1;

    var newStatValue = (newLevel) * Math.round(equipment[equipStat] * Math.pow(1.19, ((equipment.prestige) * game.global.prestige[equipStat]) + 1));
    var currentStatValue = equipment.level * equipment[equipStat + 'Calculated'];

    var statPerResource = levelOnePrestige / newStatValue;
    
    return [newStatValue > currentStatValue, statPerResource, levelOnePrestige];
}

function RautoEquip() {

    if (!getPageSetting('Requipon')) 
        return;
    
    var prestigeLeft = false;
    do {
        prestigeLeft = false;
        for (var equipName in game.equipment) {
            if (buyPrestigeMaybe(equipName)[0]) {
                if(!game.equipment[equipName].locked) {
                    var isAttack = (RequipmentList[equipName].Stat === 'attack' ? 0 : 1);
                    if (mostEfficientEquipment()[isAttack+4] && buyUpgrade(RequipmentList[equipName].Upgrade, true, true)) {
                        prestigeLeft = true;
                    }
                    if (getPageSetting('Requipprestige') && buyUpgrade(RequipmentList[equipName].Upgrade, true, true)) prestigeLeft = true;
                }
            }
        }
    } while (prestigeLeft)

    //Initialise settings for later user
	var alwaysLvl2 = getPageSetting('Requip2');
	var alwaysPandemonium = getPageSetting('RPandemoniumAutoEquip') > 0;
    var alwaysPrestige = getPageSetting('Requipprestige')
    var canBuyPrestige = false;

    // always2 / alwaysPrestige / alwaysPandemonium
    if (alwaysLvl2 || alwaysPrestige || (alwaysPandemonium && game.global.challengeActive == 'Pandemonium')) {
        for (var equip in game.equipment) {
            if (!game.equipment[equip].locked) {
                if (alwaysLvl2 && game.equipment[equip].level < 2)
                    buyEquipment(equip, null, true, 1);
                if (alwaysPrestige && buyPrestigeMaybe(equip)[0] && equip != 'Shield')
                    canBuyPrestige = true;
                if (game.challenges.Pandemonium.isEquipBlocked(equip)) 
                    continue;
			    if (alwaysPandemonium && game.global.challengeActive == 'Pandemonium')
                    buyEquipment(equip, null, true, 1);
            }
        }
    }

	var attackEquipCap = ((getPageSetting('Requipcapattack') <= 0) ? Infinity : getPageSetting('Requipcapattack'));
	var healthEquipCap = ((getPageSetting('Requipcaphealth') <= 0) ? Infinity : getPageSetting('Requipcaphealth'));
    var rEquipZone = game.global.challengeActive == "Daily" && getPageSetting('Rdequipon') ? getPageSetting('Rdequipzone') : getPageSetting('Requipzone');
	var zoneGo = (rEquipZone[0] > 0 && ((rEquipZone.includes(game.global.world)) || (game.global.world >= rEquipZone[rEquipZone.length-1])));
    var resourceSpendingPct = zoneGo ? 1 : getPageSetting('Requippercent') < 0 ? 1 : getPageSetting('Requippercent') / 100;
  

    //Buy as many shields as possible when running Melting Point
    if (getPageSetting("NoLumberjackMP") && game.global.mapsActive && getCurrentMapObject().name == 'Melting Point')
        buyEquipment('Shield', null, true, 999)

    // Loop through actually getting equips
    var keepBuying = false;
    do {
        keepBuying = false;
        var bestBuys = mostEfficientEquipment();

        // Set up for both Attack and Health depending on which is more efficient to purchase
        var equipType = (bestBuys[6] < bestBuys[7]) ? 'attack' : 'health';
        var equipName = (equipType == 'attack') ? bestBuys[0] : bestBuys[1];  
        var equipCost = (equipType == 'attack') ? bestBuys[6] : bestBuys[7];    
        var resourceUsed = resourceUsed = (equipName == 'Shield') ? 'wood' : 'metal';
        var equipCap = (equipType == 'attack') ? attackEquipCap : healthEquipCap;
        var underStats = (equipType == 'attack') ? RcalcHDratio() >= getPageSetting('Rdmgcuntoff') : RcalcOurHealth(true) < getPageSetting('Rhitssurvived') * RcalcBadGuyDmg(null, RgetEnemyAvgAttack(game.global.world, 100, 'Improbability'));
        for (var i = 0; i < 2; i++) {
            if (canAffordBuilding(equipName, null, null, true, false, 1)) {
                if (smithylogic(equipName,resourceUsed,true)) {
                    if (game.equipment[equipName].level < equipCap) {
                        // Check any of the overrides
                        if (
                            underStats ||
                            Rgetequipcost(equipName, resourceUsed, 1) <= resourceSpendingPct * game.resources[resourceUsed].owned 
                        ) {
                            if (!game.equipment[equipName].locked) {
                                var eTypeNo = (equipType == 'attack') ? 4 : 5;
                                if (bestBuys[eTypeNo]) 
                                    continue; 
                                if (buyEquipment(equipName, null, true, 1))
                                    keepBuying = true;
                            }
                        }
                    }
                }
            }

            //Iterating to second set of equips. Will go through the opposite equipType from the first loop.
            equipType = equipType != 'attack' ? 'attack' : 'health';
            equipName = (equipType == 'attack') ? bestBuys[0] : bestBuys[1];
            equipCost = (equipType == 'attack') ? bestBuys[6] : bestBuys[7];    
            resourceUsed = resourceUsed = (equipName == 'Shield') ? 'wood' : 'metal';
            equipCap = (equipType == 'attack') ? attackEquipCap : healthEquipCap;
            underStats = (equipType == 'attack') ? RcalcHDratio() >= getPageSetting('Rdmgcuntoff') : RcalcOurHealth(true) < getPageSetting('Rhitssurvived') * RcalcBadGuyDmg(null, RgetEnemyAvgAttack(game.global.world, 100, 'Improbability'));
        }

    } while (keepBuying)

}

function getTotalMultiCost(baseCost, multiBuyCount, costScaling, isCompounding) {
    if (!isCompounding) {
        return multiBuyCount * (multiBuyCount * costScaling - costScaling + 2 * baseCost) / 2;
    } else {
        return baseCost * ((1 - Math.pow(costScaling, multiBuyCount)) / (1 - costScaling));
    }
}

function equipfarmdynamicHD() {
    var equipfarmzone = 0;
    var equipfarmHD = 0;
    var equipfarmmult = 0;
    var equipfarmHDzone = 0;
    var equipfarmHDmult = RcalcHDratio() - 1;
    if (getPageSetting('Requipfarmon') == true && game.global.world > 5 && game.global.world >= (getPageSetting('Requipfarmzone') && getPageSetting('RequipfarmHD') > 0 && getPageSetting('Requipfarmmult') > 0)) {
        equipfarmzone = getPageSetting('Requipfarmzone');
        equipfarmHD = getPageSetting('RequipfarmHD');
        equipfarmmult = getPageSetting('Requipfarmmult');
	equipfarmHDzone = (game.global.world - equipfarmzone);
	equipfarmHDmult = (equipfarmHDzone == 0) ? equipfarmHD : Math.pow(equipfarmmult, equipfarmHDzone) * equipfarmHD;
    }
    return equipfarmHDmult;
}
	
function estimateEquipsForZone() {
    var MAX_EQUIP_DELTA = 700;

    // calculate stats needed pass zone
    var enemyDamageBeforeEquality = RcalcBadGuyDmg(null, RgetEnemyAvgAttack(game.global.world, 100, 'Improbability'), true); //game.global.getEnemyAttack(100, 'Snimp', true);
    var ourHealth = RcalcOurHealth();
    var hits = (getPageSetting("Rhitssurvived") > 0) ? getPageSetting("Rhitssurvived") : 1;

    var healthNeededMulti = (enemyDamageBeforeEquality * hits) / ourHealth; // The multiplier we need to apply to our health to survive

    // Get a fake ratio pretending that we don't have any equality in.
    var fakeHDRatio = RgetEnemyMaxHealth(game.global.world, 100) / (RcalcOurDmg('avg', true)); // game.global.getEnemyHealth(100, 'Snimp', true)
    var attackNeededMulti = fakeHDRatio / (game.global.mapBonus < 10 ? (equipfarmdynamicHD() * 5) : equipfarmdynamicHD());

    // Something something figure out equality vs health farming
    var tempEqualityUse = 0;
    while (
        (healthNeededMulti > 1 || attackNeededMulti > 1)  // If it's below 1 we don't actually need more
            &&
        (healthNeededMulti * game.portal.Equality.modifier > attackNeededMulti / game.portal.Equality.modifier) // Need more health proportionally
            &&
        tempEqualityUse < game.portal.Equality.radLevel
    ) {
        tempEqualityUse++;
        healthNeededMulti *= game.portal.Equality.modifier;
        attackNeededMulti /= game.portal.Equality.modifier;
    }

    if (healthNeededMulti < 1 && attackNeededMulti < 1) {return [0, {}]};

    var ourAttack = 6;
    for(var i in RequipmentList){
        if(game.equipment[i].locked !== 0) continue;
        var attackBonus = game.equipment[i].attackCalculated;
        var level       = game.equipment[i].level;
        ourAttack += (attackBonus !== undefined ? attackBonus : 0)*level;
    }

    // Amount of stats needed directly from equipment
    var attackNeeded = ourAttack * attackNeededMulti;
    var healthNeeded = ourHealth * healthNeededMulti / (getTotalHealthMod() * game.resources.trimps.maxSoldiers);

    var bonusLevels = {}; // How many levels you'll be getting in each shield-gambeson armor slots
    
    while (healthNeeded > 0) {
        var bestArmor = mostEfficientEquipment(bonusLevels)[1];
        healthNeeded -= game.equipment[bestArmor][RequipmentList[bestArmor].Stat + "Calculated"];
        if (typeof bonusLevels[bestArmor] === 'undefined') {
            bonusLevels[bestArmor] = 0;
        }
    }
    while (attackNeeded > 0) {
        var bestWeapon = mostEfficientEquipment(bonusLevels)[0];
        attackNeeded -= game.equipment[bestWeapon][RequipmentList[bestWeapon].Stat + "Calculated"];
        if (typeof bonusLevels[bestWeapon] === 'undefined') {
            bonusLevels[bestWeapon] = 0;
        }
        if (bonusLevels[bestWeapon]++ >= MAX_EQUIP_DELTA) {
            return [Infinity, bonusLevels];
        }
    }

    var totalCost = 0;
    for (var equip in bonusLevels) {
        var equipCost = game.equipment[equip].cost[RequipmentList[equip].Resource];
        totalCost += getTotalMultiCost(equipCost[0],bonusLevels[equip],equipCost[1],true) * getEquipPriceMult();
    }

    return [totalCost, bonusLevels, tempEqualityUse];
}
