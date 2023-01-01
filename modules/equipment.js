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
	}
};
var mapresourcetojob = { "food": "Farmer", "wood": "Lumberjack", "metal": "Miner", "science": "Scientist" };
function equipEffect(a, b) {

	if (b.Equip) return a[b.Stat + 'Calculated'];

	var c = a.increase.by * a.owned, d = game.upgrades.Gymystic.done ?
		game.upgrades.Gymystic.modifier + 0.01 * (game.upgrades.Gymystic.done - 1) :
		1, e = a.increase.by * (a.owned + 1) * d;
	return e - c
}
function equipCost(a, b) {
	var c = parseFloat(getBuildingItemPrice(a, b.Resource, b.Equip, 1));
	return c = b.Equip ?
		Math.ceil(c * Math.pow(1 - game.portal.Artisanistry.modifier, game.portal.Artisanistry.level)) :
		Math.ceil(c * Math.pow(1 - game.portal.Resourceful.modifier, game.portal.Resourceful.level)), c
}

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
			if ((challengeActive('Scientist') && getScientistLevel() > 2) || (!BuyWeaponUpgrades && !BuyArmorUpgrades))
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
	if (game.jobs[mapresourcetojob[equip.Resource]].locked && (!challengeActive('Metal'))) {
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

function equipsToGet(targetZone, targetPrestige) {

	const prestigeList = ['Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP'];
	if (!targetPrestige) targetPrestige = 'GambesOP';

	//Figure out how many equips to farm for
	let mapsToRun = 0;
	let prestigeToFarmFor = 0;
	let mapLevel = 0;

	const divideBy = (game.global.sLevel <= 3 || challengeActive('Mapology')) ? 5 : 10;

	for (const p of prestigeList) {
		if (game.equipment[game.upgrades[p].prestiges].locked) continue;
		const prestigeUnlock = game.mapUnlocks[p];
		const pMapLevel = prestigeUnlock.last + 5;
		if ((game.upgrades[p].allowed || prestigeUnlock.last <= 5) && prestigeUnlock && pMapLevel <= targetZone) {
			mapsToRun += Math.max(1, Math.ceil((targetZone - pMapLevel) / divideBy));
			prestigeToFarmFor += Math.floor((targetZone - (pMapLevel - 5)) / 5);
		}
		if (p === targetPrestige) break;
	}

	return [prestigeToFarmFor, mapsToRun, mapLevel];
}

function Rgetequips(map, special) {
	var specialCount = 0;
	var unlocksObj;
	var world;
	unlocksObj = game.mapUnlocks;

	world = map;
	for (var item in unlocksObj) {
		var special = unlocksObj[item];
		if (!special.prestige) continue;
		if (special.locked) continue;
		if (challengeActive('Pandemonium') && game.challenges.Pandemonium.isEquipBlocked(game.upgrades[item].prestiges)) continue;
		if (special.last <= (world - 5)) {
			specialCount += Math.floor((world - special.last) / 5);
			continue;
		}
	}
	return specialCount;
}

//Working out cheapestt Equips & Prestiges
function CheapestEquipmentCost() {
	//Looping through each piece of equipment

	var mapAutoLevel = Infinity;
	var equipmentName = null;
	var prestigeName = null;
	//Initialising Variables
	nextLevelEquipmentCost = null;
	nextEquipmentCost = null;
	nextLevelPrestigeCost = null;
	nextPrestigeCost = null;
	jestMetalTotal = null;
	var prestigeUpgradeName = "";
	var allUpgradeNames = Object.getOwnPropertyNames(game.upgrades);

	for (var equipName in game.equipment) {
		if (!game.equipment[equipName].locked) {
			//Checking cost of next equipment level. Blocks unavailable ones.
			if (game.challenges.Pandemonium.isEquipBlocked(equipName) || RequipmentList[equipName].Resource == 'wood') continue;
			nextLevelEquipmentCost = game.equipment[equipName].cost[RequipmentList[equipName].Resource][0] * Math.pow(game.equipment[equipName].cost[RequipmentList[equipName].Resource][1], game.equipment[equipName].level) * getEquipPriceMult();
			//Sets nextEquipmentCost to the price of an equip if it costs less than the current value of nextEquipCost
			if (nextLevelEquipmentCost < nextEquipmentCost || nextEquipmentCost == null) {
				equipmentName = equipName;
				nextEquipmentCost = nextLevelEquipmentCost;
			}
			//Checking cost of prestiges if any are available to purchase
			for (var upgrade of allUpgradeNames) {
				if (game.upgrades[upgrade].prestiges === equipName) {
					prestigeUpgradeName = upgrade;
					//Checking if prestiges are purchasable
					if (game.challenges.Pandemonium.isEquipBlocked(game.upgrades[upgrade].prestiges) || game.upgrades[prestigeUpgradeName].locked) continue;
					nextLevelPrestigeCost = getNextPrestigeCost(prestigeUpgradeName) * getEquipPriceMult();
					//Sets nextPrestigeCost to the price of an equip if it costs less than the current value of nextEquipCost
					if (nextLevelPrestigeCost < nextPrestigeCost || nextPrestigeCost == null) {
						prestigeName = prestigeUpgradeName
						nextPrestigeCost = nextLevelPrestigeCost;
					}
				}
			}
		}
	}
	return [equipmentName, nextEquipmentCost, prestigeName, nextLevelPrestigeCost]
}

//Shol Territory

function mostEfficientEquipment(resourceMaxPercent, zoneGo, ignoreShield, skipForLevels, showAllEquips, fakeLevels = {}, ignorePrestiges) {
	const prefix = game.global.universe === 1 ? 'H' : 'R';
	const prefix_Lower = game.global.universe === 1 ? 'h' : 'r';

	for (var i in RequipmentList) {
		if (typeof fakeLevels[i] === 'undefined') {
			fakeLevels[i] = 0;
		}
	}
	if (!ignorePrestiges) ignorePrestiges = false;
	if (!ignoreShield) ignoreShield = getPageSetting('rEquipNoShields');
	if (!skipForLevels) skipForLevels = false;
	if (!showAllEquips) showAllEquips = false;
	var rEquipZone = getPageSetting(prefix + 'equipzone');
	if (!zoneGo) zoneGo = currentMap === 'Wither' || (HDRatio >= getPageSetting(prefix + 'dmgcuntoff')) || (rEquipZone.length > 0 && ((rEquipZone.includes(game.global.world)) || (game.global.world >= rEquipZone[rEquipZone.length - 1])));
	if (!resourceMaxPercent) resourceMaxPercent = zoneGo ? 1 : getPageSetting(prefix + 'equippercent') < 0 ? 1 : getPageSetting(prefix + 'equippercent') / 100;
	var resourceMaxPercentBackup = resourceMaxPercent;

	if (challengeActive('Scientist')) {
		skipForLevels = Infinity;
	}


	var metalShred = !showAllEquips && challengeActive('Daily') && typeof game.global.dailyChallenge.hemmorrhage !== 'undefined' && dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('metal');

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
	var metalTotal = 0;

	var workerRatio = '0,0,1';
	if ((MODULES.mapFunctions.workerRatio !== null && rShouldBoneShrine) || rMapSettings.jobRatio !== undefined) {
		if (MODULES.mapFunctions.workerRatio !== null) workerRatio = MODULES.mapFunctions.workerRatio;
		else workerRatio = rMapSettings.jobRatio;
	}

	if (metalShred) {
		metalTotal = metalShred && (currentMap === 'Map Farm' || currentMap === 'Map Bonus') ? scaleToCurrentMapLocal(simpleSecondsLocal("metal", 16, true, workerRatio), false, true, rMapSettings.mapLevel) : game.resources.metal.owned;
		if (game.resources.metal.owned > metalTotal) metalTotal = game.resources.metal.owned;
	}

	for (var i in RequipmentList) {
		if (game.equipment[i].locked) continue;
		var isAttack = (RequipmentList[i].Stat === 'attack' ? 0 : 1);
		var skipForLevels = !skipForLevels && isAttack == 0 ? getPageSetting(prefix + 'equipcapattack') :
			!skipForLevels && isAttack == 1 ? getPageSetting(prefix + 'equipcaphealth') :
				skipForLevels
		var nextLevelCost = game.equipment[i].cost[RequipmentList[i].Resource][0] * Math.pow(game.equipment[i].cost[RequipmentList[i].Resource][1], game.equipment[i].level + fakeLevels[i]) * getEquipPriceMult();
		var prestige = false;
		var ignorePrestiges_temp = ignorePrestiges;
		//Skipping gyms when not in u1
		if (//game.global.universe !== 1 &&
			i === 'Gym') continue;
		//Skipping gyms when can buy Gymystic
		if (game.global.univere === 1 && (i === 'Shield' || i === 'Gym') && needGymystic()) continue;
		//Setting weapon equips to 100% spending during Smithless farm.
		if (challengeActive('Smithless') && currentMap === 'Smithless Farm') {
			if (isAttack === 0) {
				skipForLevels = Infinity;
				resourceMaxPercent = 1;
			}
			if (isAttack === 1) resourceMaxPercent = resourceMaxPercentBackup;
		}
		//Skips if we have the required number of that item and below zoneGo
		if (!buyPrestigeMaybe(i, resourceMaxPercent) && Number.isInteger(skipForLevels) && game.equipment[i].level >= skipForLevels) continue;
		//Skips if ignoreShield variable is true.
		if (game.global.universe === 2 && ignoreShield && i == 'Shield') continue;
		//Skipping if on reflect daily and our dmg is too high
		if (game.global.universe === 2 && reflectShouldBuyEquips() && isAttack === 0 && !showAllEquips) continue;
		//Skips looping through equips if they're blocked during Pandemonium.
		if (challengeActive('Pandemonium') && game.challenges.Pandemonium.isEquipBlocked(i)) continue;
		//Skips buying shields when you can afford bonfires on Hypothermia.
		if (challengeActive('Hypothermia') && game.resources.wood.owned > game.challenges.Hypothermia.bonfirePrice() && i == 'Shield') continue;
		//Skips through equips if they cost more than your Requippercent setting value.
		if (RequipmentList[i].Resource == 'metal' && !zoneGo && !canAffordBuilding(i, null, null, true, false, 1, resourceMaxPercent * 100) && !buyPrestigeMaybe(i, resourceMaxPercent)[0]) continue;
		//Skips through equips if they don't cost metal and you don't have enough resources for them.
		if (RequipmentList[i].Resource != 'metal' && !canAffordBuilding(i, null, null, true, false, 1, resourceMaxPercent * 100) && !buyPrestigeMaybe(i, resourceMaxPercent)[0]) continue;
		//Skips through equips if you're on a metal shred daily and you don't have enough resources for them.
		if (!showAllEquips && RequipmentList[i].Resource === 'metal' && metalShred && !canAffordBuilding(i, null, null, true, false, 1, resourceMaxPercent * 100) && !buyPrestigeMaybe(i, resourceMaxPercent)[0]) continue;

		var nextLevelValue = game.equipment[i][RequipmentList[i].Stat + "Calculated"];
		var isAttack = (RequipmentList[i].Stat === 'attack' ? 0 : 1);
		var safeRatio = nextLevelCost / nextLevelValue;

		if (!ignorePrestiges && getPageSetting(prefix + 'equipprestige') === 0 && game.equipment[i].level < 6 && game.resources.metal.owned * 0.2 < buyPrestigeMaybe(i, resourceMaxPercent)[2]) ignorePrestiges_temp = true;
		if ((getPageSetting(prefix + 'equipprestige') === 1 && !game.mapUnlocks.AncientTreasure.canRunOnce && game.resources.metal.owned * 0.08 < buyPrestigeMaybe(i, resourceMaxPercent)[2])) ignorePrestiges_temp = true;

		if (!ignorePrestiges_temp && (buyPrestigeMaybe(i, resourceMaxPercent)[0] && (buyPrestigeMaybe(i, resourceMaxPercent)[1] > mostEfficient[isAttack].statPerResource || buyPrestigeMaybe(i, resourceMaxPercent)[3])) && !(metalShred && metalTotal < buyPrestigeMaybe(i, resourceMaxPercent)[2])) {
			safeRatio = buyPrestigeMaybe(i, resourceMaxPercent)[1];
			nextLevelCost = buyPrestigeMaybe(i, resourceMaxPercent)[2]
			prestige = true;
		}

		if (!ignorePrestiges_temp && getPageSetting(prefix_Lower + 'EquipHighestPrestige')) {
			for (var item in game.equipment) {
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

function buyPrestigeMaybe(equipName, resourceSpendingPct) {

	if (challengeActive('Pandemonium') && game.challenges.Pandemonium.isEquipBlocked(equipName)) return false;
	if (challengeActive('Scientist')) return false;

	var prestigeUpgradeName = "";
	var prestigeDone = false;
	var allUpgradeNames = Object.getOwnPropertyNames(game.upgrades);
	for (var upgrade of allUpgradeNames) {
		if (game.upgrades[upgrade].prestiges === equipName) {
			prestigeUpgradeName = upgrade;
			if (game.upgrades[upgrade].allowed === game.upgrades[upgrade].done) prestigeDone = true;
			break;
		}
	}

	if (prestigeDone) return false;

	if (!resourceSpendingPct) resourceSpendingPct = 1;

	var equipment = game.equipment[equipName];
	var resource = (equipName == "Shield") ? 'wood' : 'metal'
	var equipStat = (typeof equipment.attack !== 'undefined') ? 'attack' : 'health';

	if (game.upgrades[prestigeUpgradeName].locked || (prestigeUpgradeName == 'Supershield' && getNextPrestigeCost(prestigeUpgradeName) * getEquipPriceMult() > game.resources.wood.owned * resourceSpendingPct)) return false;

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
	var newLevel = Math.floor(getMaxAffordable(levelOnePrestige * 1.2, (game.resources[resource].owned * resourceSpendingPct), 1.2, true)) + 1;
	var newStatValue = (newLevel) * Math.round(equipment[equipStat] * Math.pow(1.19, ((equipment.prestige) * game.global.prestige[equipStat]) + 1));
	var currentStatValue = equipment.level * equipment[equipStat + 'Calculated'];
	var statPerResource = levelOnePrestige / newStatValue;

	return [newStatValue > currentStatValue, statPerResource, levelOnePrestige, !prestigeDone];
}

function autoEquip() {
	const prefix = game.global.universe === 1 ? 'H' : 'R';

	if (
		!getPageSetting(prefix + 'equipon') ||
		([2, 3].indexOf(currQuest()) >= 0 && game.global.lastClearedCell < 90) ||
		(currentMap === 'Smithy Farm') ||
		(game.mapUnlocks.AncientTreasure.canRunOnce &&
			(rBSRunningAtlantrimp || rMapSettings.runAtlantrimp ||
				(game.global.mapsActive && (getCurrentMapObject().name === 'Atlantrimp' || getCurrentMapObject().name === 'Trimple Of Doom'))
			)
		)
	)
		return;

	if (game.global.universe === 1 && needGymystic() && canAffordTwoLevel('Gymystic')) {
		buyUpgrade('Gymystic', true, true);
		debug('Upgrading Gymystic', "equips", '*upload');
	}
	var rEquipZone = getPageSetting(prefix + 'equipzone');
	var zoneGo = currentMap === 'Wither' || (HDRatio >= getPageSetting(prefix + 'dmgcuntoff')) || (rEquipZone.length > 0 && ((rEquipZone.includes(game.global.world)) || (game.global.world >= rEquipZone[rEquipZone.length - 1])));

	if (getPageSetting(prefix + 'equipprestige') == 2 && !zoneGo) {
		var prestigeLeft = false;
		do {
			prestigeLeft = false;
			for (var equipName in game.equipment) {
				if (buyPrestigeMaybe(equipName)[0]) {
					if (!game.equipment[equipName].locked) {
						var isAttack = (RequipmentList[equipName].Stat === 'attack' ? 0 : 1);
						//Skipping if on reflect daily and our dmg is too high
						if (reflectShouldBuyEquips() && isAttack === 0) continue;
						if (game.global.universe === 2 && getPageSetting('rEquipNoShields') && equipName == 'Shield') continue;
						if ((getPageSetting(prefix + 'equipprestige') === 2 || mostEfficientEquipment()[isAttack + 4]) && buyUpgrade(RequipmentList[equipName].Upgrade, true, true))
							prestigeLeft = true;
					}
				}
			}
		} while (prestigeLeft)
	}

	//Initialise settings for later user
	var alwaysLvl2 = getPageSetting(prefix + 'equip2');
	var alwaysPandemonium = getPageSetting('RPandemoniumAutoEquip') > 0;
	var metalShred = challengeActive('Daily') && typeof game.global.dailyChallenge.hemmorrhage !== 'undefined' && dailyModifiers.hemmorrhage.getResources(game.global.dailyChallenge.hemmorrhage.strength).includes('metal')
	// always2 / alwaysPrestige / alwaysPandemonium
	if (alwaysLvl2 || (alwaysPandemonium && challengeActive('Pandemonium')) || metalShred) {
		for (var equip in game.equipment) {
			if (!game.equipment[equip].locked) {
				if (alwaysLvl2 && game.equipment[equip].level < 2) {
					if (game.global.universe === 2 && reflectShouldBuyEquips() && typeof (item.attack) === 'undefined') continue;
					buyEquipment(equip, null, true, 1);
					debug('Upgrading ' + '1' + ' ' + equip, "equips", '*upload3');
				}
				if (metalShred && game.global.hemmTimer <= 3) {
					if (equip === 'Shield') continue;
					if (reflectShouldBuyEquips() && typeof (item.attack) === 'undefined') continue;
					buyEquipment(equip, null, true, 1);
					debug('Upgrading ' + '1' + ' ' + equip, "equips", '*upload3');
				}
				if (alwaysPandemonium && challengeActive('Pandemonium')) {
					if (game.challenges.Pandemonium.isEquipBlocked(equip)) continue;
					buyEquipment(equip, null, true, 1);
					debug('Upgrading ' + '1' + ' ' + equip, "equips", '*upload3');
				}
			}
		}
	}

	var attackEquipCap = (getPageSetting(prefix + 'equipcapattack') <= 0 || currentMap === 'Smithless Farm' ? Infinity : getPageSetting(prefix + 'equipcapattack'));
	var healthEquipCap = (getPageSetting(prefix + 'equipcaphealth') <= 0 || currentMap === 'Smithless Farm' ? Infinity : getPageSetting(prefix + 'equipcaphealth'));
	var maxCanAfford = 0;

	if (challengeActive('Scientist')) {
		attackEquipCap = Infinity;
		healthEquipCap = Infinity;
	}

	//Buy as many shields as possible when running Melting Point
	if (game.global.universe === 2 && !getPageSetting('rEquipNoShields') && autoTrimpSettings.rJobSettingsArray.value.NoLumberjacks.enabled && game.global.mapsActive && getCurrentMapObject().name == 'Melting Point')
		buyEquipment('Shield', null, true, 999)

	var ignoreShields = game.global.universe === 2 && getPageSetting('rEquipNoShields');
	// Loop through actually getting equips
	var keepBuying = false;
	do {
		keepBuying = false;
		var resourceSpendingPct = zoneGo ? 1 : getPageSetting(prefix + 'equippercent') < 0 ? 1 : getPageSetting(prefix + 'equippercent') / 100;
		var bestBuys = mostEfficientEquipment(resourceSpendingPct, zoneGo, ignoreShields, false, false);
		// Set up for both Attack and Health depending on which is cheaper to purchase
		var equipType = (bestBuys[6] < bestBuys[7]) ? 'attack' : 'health';
		var equipName = (equipType == 'attack') ? bestBuys[0] : bestBuys[1];
		var equipCost = (equipType == 'attack') ? bestBuys[6] : bestBuys[7];
		var equipPrestige = (equipType == 'attack') ? bestBuys[4] : bestBuys[5];
		var equipCap = (equipType == 'attack') ? attackEquipCap : healthEquipCap;
		var resourceUsed = (equipName == 'Shield') ? 'wood' : 'metal';

		zoneGo = (HDRatio >= getPageSetting(prefix + 'dmgcuntoff')) || (rEquipZone.length > 0 && ((rEquipZone.includes(game.global.world)) || (game.global.world >= rEquipZone[rEquipZone.length - 1])));



		for (var i = 0; i < 2; i++) {
			//Setting weapon equips to 100% spending during Smithless farm.
			if (challengeActive('Smithless') && currentMap === 'Smithless Farm') {
				if (equipType === 'attack') {
					resourceSpendingPct = 1;
					zoneGo = true;
				}
			}
			if (!equipPrestige && canAffordBuilding(equipName, null, null, true, false, 1) || (equipPrestige && game.resources[resourceUsed].owned > equipCost)) {
				if (game.equipment[equipName].level < equipCap || equipPrestige || zoneGo) {
					if (!equipPrestige) {
						maxCanAfford = getMaxAffordable(equipCost, (game.resources[resourceUsed].owned * 0.001), 1.2, true);
						if (maxCanAfford === 0)
							maxCanAfford = 1;
						if (maxCanAfford >= (equipCap - game.equipment[equipName].level))
							maxCanAfford = equipCap - game.equipment[equipName].level;
					}

					// Check any of the overrides
					if (equipCost <= resourceSpendingPct * game.resources[resourceUsed].owned) {
						if (!game.equipment[equipName].locked) {
							if (equipPrestige) {
								buyUpgrade(RequipmentList[equipName].Upgrade, true, true)
								debug('Upgrading ' + equipName + " - Prestige " + game.equipment[equipName].prestige, "equips", '*upload');
							}
							else if (maxCanAfford > 0) {
								buyEquipment(equipName, null, true, maxCanAfford)
								debug('Upgrading ' + maxCanAfford + ' ' + equipName + (maxCanAfford > 1 && equipName !== 'Boots' && equipName !== 'Pants' && equipName !== 'Shoulderguards' ? 's' : ''), "equips", '*upload3');
								keepBuying = true;
							}
							HDRatio = calcHDRatio(game.global.world, 'world');
						}
					}
				}
			}

			//Iterating to second set of equips. Will go through the opposite equipType from the first loop.
			equipType = (equipType != 'attack') ? 'attack' : 'health';
			equipName = (equipType == 'attack') ? bestBuys[0] : bestBuys[1];
			equipCost = (equipType == 'attack') ? bestBuys[6] : bestBuys[7];
			equipPrestige = (equipType == 'attack') ? bestBuys[4] : bestBuys[5];
			resourceUsed = (equipName == 'Shield') ? 'wood' : 'metal';
			equipCap = (equipType === 'attack') ? attackEquipCap : healthEquipCap;
			zoneGo = (HDRatio >= getPageSetting(prefix + 'dmgcuntoff')) || (rEquipZone.length > 0 && ((rEquipZone.includes(game.global.world)) || (game.global.world >= rEquipZone[rEquipZone.length - 1])));
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

function equipfarmdynamicHD(rEFIndex) {
	var HDFSettingsBase = game.global.universe === 1 ? autoTrimpSettings.hHDFarmSettings.value : autoTrimpSettings.rHDFarmSettings.value
	var HDFSettings = HDFSettingsBase[rEFIndex]
	var equipfarmHD = 0;
	var equipfarmHDmult = 1;
	var HDFMult = HDFSettings.hdMult;
	var HDFZone = HDFSettings.world
	equipfarmHD = HDFSettings.hdBase;
	HDFZone = (game.global.world - HDFZone);
	equipfarmHDmult = (HDFZone == 0) ? equipfarmHD : Math.pow(HDFMult, HDFZone) * equipfarmHD;
	return equipfarmHDmult;
}

function estimateEquipsForZone(rEFIndex) {
	var MAX_EQUIP_DELTA = 1000;
	var checkMutations = game.global.world > 200 && getPageSetting('rMutationCalc')

	// calculate stats needed pass zone
	var gammaBurstDmg = getPageSetting('rCalcGammaBurst') ? gammaBurstPct : 1;
	var ourHealth = calcOurHealth(false, 'world');
	var ourDmg = calcOurDmg('avg', 0, false, 'world', 'maybe', 0, false) * gammaBurstDmg;
	var enemyHealth = calcEnemyHealthCore('world', game.global.world, 99, 'Turtlimp');
	var enemyDamageBeforeEquality = calcEnemyAttackCore('world', game.global.world, 99, 'Snimp', false, false, 0);

	var healthNeededMulti = enemyDamageBeforeEquality / ourHealth; // The multiplier we need to apply to our health to survive

	// Get a fake ratio pretending that we don't have any equality in.
	var fakeHDRatio = enemyHealth / ourDmg;
	var attackNeededMulti = fakeHDRatio / (equipfarmdynamicHD(rEFIndex));

	// Something something figure out equality vs health farming
	var tempEqualityUse = 0;
	while (
		(healthNeededMulti > 1 || attackNeededMulti > 1)  // If it's below 1 we don't actually need more
		&&
		(healthNeededMulti * game.portal.Equality.getModifier() > attackNeededMulti / game.portal.Equality.getModifier(true)) // Need more health proportionally
		&&
		tempEqualityUse < game.portal.Equality.radLevel
	) {
		tempEqualityUse++;
		healthNeededMulti *= game.portal.Equality.getModifier();
		attackNeededMulti /= game.portal.Equality.getModifier(true);
		enemyDamageBeforeEquality *= game.portal.Equality.getModifier();
	}

	//debug("E = " + tempEqualityUse + " HPmult = " + healthNeededMulti + " Atkmult = " + attackNeededMulti)

	if (healthNeededMulti < 1 && attackNeededMulti < 1 || ((healthNeededMulti + attackNeededMulti) / 2 < 1)) { return [0, {}] };

	var ourAttack = 6;
	for (var i in RequipmentList) {
		if (game.equipment[i].locked !== 0) continue;
		var attackBonus = game.equipment[i].attackCalculated;
		var level = game.equipment[i].level;
		ourAttack += (attackBonus !== undefined ? attackBonus : 0) * level;
	}

	// Amount of stats needed directly from equipment
	var attackNeeded = ourAttack * attackNeededMulti;
	var healthNeeded = ourHealth * healthNeededMulti / (getTotalHealthMod() * game.resources.trimps.maxSoldiers);

	var bonusLevels = {}; // How many levels you'll be getting in each shield-gambeson armor slots


	while (healthNeeded > 0) {
		var bestArmor = mostEfficientEquipment(1, true, true, false, true, bonusLevels, true)[1];
		healthNeeded -= game.equipment[bestArmor][RequipmentList[bestArmor].Stat + "Calculated"];
		if (typeof bonusLevels[bestArmor] === 'undefined') {
			bonusLevels[bestArmor] = 0;
		}
		if (bonusLevels[bestArmor]++ > MAX_EQUIP_DELTA) {
			return [Infinity, bonusLevels];
		}
	}
	while (attackNeeded > 0) {
		var bestWeapon = mostEfficientEquipment(1, true, true, false, true, bonusLevels, true)[0];
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
		totalCost += getTotalMultiCost((equipCost[0]), bonusLevels[equip], equipCost[1], true) * getEquipPriceMult();
	}

	return [totalCost, bonusLevels];
}

function mapLevelHasPrestiges(level) {
	for (const eq of Object.values(equipmentList)) {
		if (!eq.Equip) {
			continue;
		}
		const prestigeUnlock = game.mapUnlocks[eq.Upgrade];
		const pMapLevel = prestigeUnlock.last + 5;
		if (game.upgrades[eq.Upgrade].allowed && prestigeUnlock && pMapLevel <= level) {
			return true;
		}
	}
	return false;
}