MODULES["other"] = {};
MODULES["other"].enableRoboTrimpSpam = true;
var prestraid = !1, dprestraid = !1, failpraid = !1, dfailpraid = !1, bwraided = !1, dbwraided = !1, failbwraid = !1, dfailbwraid = !1, perked = !1, prestraidon = !1, dprestraidon = !1, mapbought = !1, dmapbought = !1, bwraidon = !1, dbwraidon = !1, presteps = null, minMaxMapCost, fMap, pMap, shouldFarmFrags = !1, praidDone = !1;
function armydeath() { if (game.global.mapsActive) return !1; var e = game.global.lastClearedCell + 1, l = game.global.gridArray[e].attack * dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks) * game.portal.Equality.getMult(), a = game.global.soldierHealth + game.global.soldierEnergyShield * (Fluffy.isRewardActive('shieldlayer') ? ((1 + Fluffy.isRewardActive('shieldlayer'))) : 1); "Ice" == getEmpowerment() && (l *= game.empowerments.Ice.getCombatModifier()); var g = game.global.soldierCurrentBlock; return 3 == game.global.formation ? g /= 4 : "0" != game.global.formation && (g *= 2), g > game.global.gridArray[e].attack ? l *= getPierceAmt() : l -= g * (1 - getPierceAmt()), "Daily" == game.global.challengeActive && void 0 !== game.global.dailyChallenge.crits && (l *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength)), void 0 !== game.global.dailyChallenge.bogged && (a -= game.global.soldierHealthMax * dailyModifiers.bogged.getMult(game.global.dailyChallenge.bogged.strength)), void 0 !== game.global.dailyChallenge.plague && (a -= game.global.soldierHealthMax * dailyModifiers.plague.getMult(game.global.dailyChallenge.plague.strength, game.global.dailyChallenge.plague.stacks)), "Electricity" == game.global.challengeActive && (a -= game.global.soldierHealth -= game.global.soldierHealthMax * (.1 * game.challenges.Electricity.stacks)), "corruptCrit" == game.global.gridArray[e].corrupted ? l *= 5 : "healthyCrit" == game.global.gridArray[e].corrupted ? l *= 7 : "corruptBleed" == game.global.gridArray[e].corrupted ? a *= .8 : "healthyBleed" == game.global.gridArray[e].corrupted && (a *= .7), (a -= l) <= 1e3 }
function autoRoboTrimp() { if (!(0 < game.global.roboTrimpCooldown) && game.global.roboTrimpLevel) { var a = parseInt(getPageSetting("AutoRoboTrimp")); 0 == a || game.global.world >= a && !game.global.useShriek && (magnetoShriek(), MODULES.other.enableRoboTrimpSpam && debug("Activated Robotrimp MagnetoShriek Ability @ z" + game.global.world, "graphs", "*podcast")) } }
function isBelowThreshold(a) { return a != game.global.world }
function buyWeps() { if (!((getPageSetting('BuyWeaponsNew') == 1) || (getPageSetting('BuyWeaponsNew') == 3))) return; preBuy(), game.global.buyAmt = getPageSetting('gearamounttobuy'), game.equipment.Dagger.level < getPageSetting('CapEquip2') && canAffordBuilding('Dagger', null, null, !0) && buyEquipment('Dagger', !0, !0), game.equipment.Mace.level < getPageSetting('CapEquip2') && canAffordBuilding('Mace', null, null, !0) && buyEquipment('Mace', !0, !0), game.equipment.Polearm.level < getPageSetting('CapEquip2') && canAffordBuilding('Polearm', null, null, !0) && buyEquipment('Polearm', !0, !0), game.equipment.Battleaxe.level < getPageSetting('CapEquip2') && canAffordBuilding('Battleaxe', null, null, !0) && buyEquipment('Battleaxe', !0, !0), game.equipment.Greatsword.level < getPageSetting('CapEquip2') && canAffordBuilding('Greatsword', null, null, !0) && buyEquipment('Greatsword', !0, !0), !game.equipment.Arbalest.locked && game.equipment.Arbalest.level < getPageSetting('CapEquip2') && canAffordBuilding('Arbalest', null, null, !0) && buyEquipment('Arbalest', !0, !0), postBuy() }
function buyArms() { if (!((getPageSetting('BuyArmorNew') == 1) || (getPageSetting('BuyArmorNew') == 3))) return; preBuy(), game.global.buyAmt = 10, game.equipment.Shield.level < getPageSetting('CapEquiparm') && canAffordBuilding('Shield', null, null, !0) && buyEquipment('Shield', !0, !0), game.equipment.Boots.level < getPageSetting('CapEquiparm') && canAffordBuilding('Boots', null, null, !0) && buyEquipment('Boots', !0, !0), game.equipment.Helmet.level < getPageSetting('CapEquiparm') && canAffordBuilding('Helmet', null, null, !0) && buyEquipment('Helmet', !0, !0), game.equipment.Pants.level < getPageSetting('CapEquiparm') && canAffordBuilding('Pants', null, null, !0) && buyEquipment('Pants', !0, !0), game.equipment.Shoulderguards.level < getPageSetting('CapEquiparm') && canAffordBuilding('Shoulderguards', null, null, !0) && buyEquipment('Shoulderguards', !0, !0), game.equipment.Breastplate.level < getPageSetting('CapEquiparm') && canAffordBuilding('Breastplate', null, null, !0) && buyEquipment('Breastplate', !0, !0), !game.equipment.Gambeson.locked && game.equipment.Gambeson.level < getPageSetting('CapEquiparm') && canAffordBuilding('Gambeson', null, null, !0) && buyEquipment('Gambeson', !0, !0), postBuy() }
function isActiveSpireAT() { return game.global.challengeActive != 'Daily' && game.global.spireActive && game.global.world >= getPageSetting('IgnoreSpiresUntil') }
function disActiveSpireAT() { return game.global.challengeActive == 'Daily' && game.global.spireActive && game.global.world >= getPageSetting('dIgnoreSpiresUntil') }
function exitSpireCell() { isActiveSpireAT() && game.global.lastClearedCell >= getPageSetting('ExitSpireCell') - 1 && endSpire() }
function dailyexitSpireCell() { disActiveSpireAT() && game.global.lastClearedCell >= getPageSetting('dExitSpireCell') - 1 && endSpire() }
function plusPres() { document.getElementById("biomeAdvMapsSelect").value = "Random", document.getElementById("advExtraLevelSelect").value = plusMapToRun(game.global.world), document.getElementById("advSpecialSelect").value = "p", document.getElementById("lootAdvMapsRange").value = 0, document.getElementById("difficultyAdvMapsRange").value = 9, document.getElementById("sizeAdvMapsRange").value = 9, document.getElementById("advPerfectCheckbox").dataset.checked = !1, document.getElementById("mapLevelInput").value = game.global.world, updateMapCost() }
function plusMapToRun(a) { return 9 == a % 10 ? 6 : 5 > a % 10 ? 5 - a % 10 : 11 - a % 10 }
function findLastBionic() { for (var a = game.global.mapsOwnedArray.length - 1; 0 <= a; a--)if ("Bionic" === game.global.mapsOwnedArray[a].location) return game.global.mapsOwnedArray[a] }
function helptrimpsnotdie() { if (!game.global.preMapsActive && !game.global.fighting) buyArms(); }
function usedaily3() { !0 != getPageSetting('use3daily') || 'Daily' != game.global.challengeActive || daily3 || (daily3 = !0), !1 == getPageSetting('use3daily') && 'Daily' != game.global.challengeActive && daily3 && (daily3 = !1), !0 == getPageSetting('use3daily') && 'Daily' != game.global.challengeActive && daily3 && (daily3 = !1) }
function buyshitspire() { !0 == getPageSetting('spireshitbuy') && game.global.spireActive && game.global.world >= getPageSetting('IgnoreSpiresUntil') && (buyWeps(), buyArms()) }

//Helium

function autoGoldenUpgradesAT(setting) {
	var num = getAvailableGoldenUpgrades();
	var setting2;
	if (num == 0) return;
	if (setting == "Helium")
		setting2 = "Helium";
	if ((!game.global.dailyChallenge.seed && !game.global.runningChallengeSquared && autoTrimpSettings.AutoGoldenUpgrades.selected == "Helium" && getPageSetting('radonbattle') > 0 && game.goldenUpgrades.Helium.purchasedAt.length >= getPageSetting('radonbattle')) || (game.global.dailyChallenge.seed && autoTrimpSettings.dAutoGoldenUpgrades.selected == "Helium" && getPageSetting('dradonbattle') > 0 && game.goldenUpgrades.Helium.purchasedAt.length >= getPageSetting('dradonbattle')))
		setting2 = "Battle";
	if (setting == "Battle")
		setting2 = "Battle";
	if ((!game.global.dailyChallenge.seed && !game.global.runningChallengeSquared && autoTrimpSettings.AutoGoldenUpgrades.selected == "Battle" && getPageSetting('battleradon') > 0 && game.goldenUpgrades.Battle.purchasedAt.length >= getPageSetting('battleradon')) || (game.global.dailyChallenge.seed && autoTrimpSettings.dAutoGoldenUpgrades.selected == "Battle" && getPageSetting('dbattleradon') > 0 && game.goldenUpgrades.Battle.purchasedAt.length >= getPageSetting('dbattleradon')))
		setting2 = "Helium";
	if (setting == "Void" || setting == "Void + Battle")
		setting2 = "Void";
	var success = buyGoldenUpgrade(setting2);
	if (!success && setting2 == "Void") {
		num = getAvailableGoldenUpgrades();
		if (num == 0) return;
		if ((autoTrimpSettings.AutoGoldenUpgrades.selected == "Void" && !game.global.dailyChallenge.seed && !game.global.runningChallengeSquared) || (autoTrimpSettings.dAutoGoldenUpgrades.selected == "Void" && game.global.dailyChallenge.seed))
			setting2 = "Helium";
		if (((autoTrimpSettings.AutoGoldenUpgrades.selected == "Void" && getPageSetting('voidheliumbattle') > 0 && game.global.world >= getPageSetting('voidheliumbattle')) || (autoTrimpSettings.dAutoGoldenUpgrades.selected == "Void" && getPageSetting('dvoidheliumbattle') > 0 && game.global.world >= getPageSetting('dvoidheliumbattle'))) || ((autoTrimpSettings.AutoGoldenUpgrades.selected == "Void + Battle" && !game.global.dailyChallenge.seed && !game.global.runningChallengeSquared) || (autoTrimpSettings.dAutoGoldenUpgrades.selected == "Void + Battle" && game.global.dailyChallenge.seed) || (autoTrimpSettings.cAutoGoldenUpgrades.selected == "Void + Battle" && game.global.runningChallengeSquared)))
			setting2 = "Battle";
		buyGoldenUpgrade(setting2);
	}
}

//Praiding

function plusMapToRun1() {
	var map = 1;
	if (game.global.world % 10 == 5)
		map = 6;
	if (game.global.world % 10 == 6)
		map = 5;
	if (game.global.world % 10 == 7)
		map = 4;
	if (game.global.world % 10 == 8)
		map = 3;
	if (game.global.world % 10 == 9)
		map = 2;
	return map;
}

function plusMapToRun2() {
	var map = 2;
	if (game.global.world % 10 == 4)
		map = 7;
	if (game.global.world % 10 == 5)
		map = 7;
	if (game.global.world % 10 == 6)
		map = 6;
	if (game.global.world % 10 == 7)
		map = 5;
	if (game.global.world % 10 == 8)
		map = 4;
	if (game.global.world % 10 == 9)
		map = 3;
	return map;
}

function plusMapToRun3() {
	var map = 3;
	if (game.global.world % 10 == 3)
		map = 8;
	if (game.global.world % 10 == 4)
		map = 8;
	if (game.global.world % 10 == 5)
		map = 8;
	if (game.global.world % 10 == 6)
		map = 7;
	if (game.global.world % 10 == 7)
		map = 6;
	if (game.global.world % 10 == 8)
		map = 5;
	if (game.global.world % 10 == 9)
		map = 4;
	return map;
}

function plusMapToRun4() {
	var map = 4;
	if (game.global.world % 10 == 2)
		map = 9;
	if (game.global.world % 10 == 3)
		map = 9;
	if (game.global.world % 10 == 4)
		map = 9;
	if (game.global.world % 10 == 5)
		map = 9;
	if (game.global.world % 10 == 6)
		map = 8;
	if (game.global.world % 10 == 7)
		map = 7;
	if (game.global.world % 10 == 8)
		map = 6;
	if (game.global.world % 10 == 9)
		map = 5;
	return map;
}

function plusMapToRun5() {
	var map = 5;
	if (game.global.world % 10 == 1)
		map = 10;
	if (game.global.world % 10 == 2)
		map = 10;
	if (game.global.world % 10 == 3)
		map = 10;
	if (game.global.world % 10 == 4)
		map = 10;
	if (game.global.world % 10 == 5)
		map = 10;
	if (game.global.world % 10 == 6)
		map = 9;
	if (game.global.world % 10 == 7)
		map = 8;
	if (game.global.world % 10 == 8)
		map = 7;
	if (game.global.world % 10 == 9)
		map = 6;
	return map;
}

function plusPres1() {
	document.getElementById("biomeAdvMapsSelect").value = "Depths";
	document.getElementById("advExtraLevelSelect").value = plusMapToRun1();
	document.getElementById("advSpecialSelect").value = "p";
	document.getElementById("lootAdvMapsRange").value = 0;
	document.getElementById("difficultyAdvMapsRange").value = 9;
	document.getElementById("sizeAdvMapsRange").value = 9;
	document.getElementById("advPerfectCheckbox").dataset.checked = true;
	document.getElementById("mapLevelInput").value = game.global.world;
	updateMapCost();

	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("biomeAdvMapsSelect").value = "Random";
		updateMapCost();
	}
	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("advPerfectCheckbox").dataset.checked = false;
		updateMapCost();
	}

	while (difficultyAdvMapsRange.value > 0 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
		difficultyAdvMapsRange.value -= 1;
		if (updateMapCost(true) <= game.resources.fragments.owned) break;
		sizeAdvMapsRange.value -= 1;
	}
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);

	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("advSpecialSelect").value = 0;
		updateMapCost();
	}
}

function plusPres2() {
	document.getElementById("biomeAdvMapsSelect").value = "Depths";
	document.getElementById("advExtraLevelSelect").value = plusMapToRun2();
	document.getElementById("advSpecialSelect").value = "p";
	document.getElementById("lootAdvMapsRange").value = 0;
	document.getElementById("difficultyAdvMapsRange").value = 9;
	document.getElementById("sizeAdvMapsRange").value = 9;
	document.getElementById("advPerfectCheckbox").dataset.checked = true;
	document.getElementById("mapLevelInput").value = game.global.world;
	updateMapCost();

	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("biomeAdvMapsSelect").value = "Random";
		updateMapCost();
	}
	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("advPerfectCheckbox").dataset.checked = false;
		updateMapCost();
	}

	while (difficultyAdvMapsRange.value > 0 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
		difficultyAdvMapsRange.value -= 1;
		if (updateMapCost(true) <= game.resources.fragments.owned) break;
		sizeAdvMapsRange.value -= 1;
	}
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);

	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("advSpecialSelect").value = 0;
		updateMapCost();
	}
}

function plusPres3() {
	document.getElementById("biomeAdvMapsSelect").value = "Depths";
	document.getElementById("advExtraLevelSelect").value = plusMapToRun3();
	document.getElementById("advSpecialSelect").value = "p";
	document.getElementById("lootAdvMapsRange").value = 0;
	document.getElementById("difficultyAdvMapsRange").value = 9;
	document.getElementById("sizeAdvMapsRange").value = 9;
	document.getElementById("advPerfectCheckbox").dataset.checked = true;
	document.getElementById("mapLevelInput").value = game.global.world;
	updateMapCost();

	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("biomeAdvMapsSelect").value = "Random";
		updateMapCost();
	}
	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("advPerfectCheckbox").dataset.checked = false;
		updateMapCost();
	}

	while (difficultyAdvMapsRange.value > 0 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
		difficultyAdvMapsRange.value -= 1;
		if (updateMapCost(true) <= game.resources.fragments.owned) break;
		sizeAdvMapsRange.value -= 1;
	}
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);

	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("advSpecialSelect").value = 0;
		updateMapCost();
	}
}

function plusPres4() {
	document.getElementById("biomeAdvMapsSelect").value = "Depths";
	document.getElementById("advExtraLevelSelect").value = plusMapToRun4();
	document.getElementById("advSpecialSelect").value = "p";
	document.getElementById("lootAdvMapsRange").value = 0;
	document.getElementById("difficultyAdvMapsRange").value = 9;
	document.getElementById("sizeAdvMapsRange").value = 9;
	document.getElementById("advPerfectCheckbox").dataset.checked = true;
	document.getElementById("mapLevelInput").value = game.global.world;
	updateMapCost();

	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("biomeAdvMapsSelect").value = "Random";
		updateMapCost();
	}
	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("advPerfectCheckbox").dataset.checked = false;
		updateMapCost();
	}

	while (difficultyAdvMapsRange.value > 0 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
		difficultyAdvMapsRange.value -= 1;
		if (updateMapCost(true) <= game.resources.fragments.owned) break;
		sizeAdvMapsRange.value -= 1;
	}
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);

	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("advSpecialSelect").value = 0;
		updateMapCost();
	}
}

function plusPres5() {
	document.getElementById("biomeAdvMapsSelect").value = "Depths";
	document.getElementById("advExtraLevelSelect").value = plusMapToRun5();
	document.getElementById("advSpecialSelect").value = "p";
	document.getElementById("lootAdvMapsRange").value = 0;
	document.getElementById("difficultyAdvMapsRange").value = 9;
	document.getElementById("sizeAdvMapsRange").value = 9;
	document.getElementById("advPerfectCheckbox").dataset.checked = true;
	document.getElementById("mapLevelInput").value = game.global.world;
	updateMapCost();

	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("biomeAdvMapsSelect").value = "Random";
		updateMapCost();
	}
	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("advPerfectCheckbox").dataset.checked = false;
		updateMapCost();
	}

	while (difficultyAdvMapsRange.value > 0 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
		difficultyAdvMapsRange.value -= 1;
		if (updateMapCost(true) <= game.resources.fragments.owned) break;
		sizeAdvMapsRange.value -= 1;
	}
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);

	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("advSpecialSelect").value = 0;
		updateMapCost();
	}
}

function pcheck1() {
	var HD;
	var P;
	var I;

	if (game.global.challengeActive != "Daily") {
		HD = getPageSetting('PraidingHD');
		P = (getPageSetting('PraidingP') > 0 ? getPageSetting('PraidingP') : 0);
		I = (getPageSetting('PraidingI') > 0 ? getPageSetting('PraidingI') : 0);
	}
	if (game.global.challengeActive == "Daily") {
		HD = getPageSetting('dPraidingHD');
		P = (getPageSetting('dPraidingP') > 0 ? getPageSetting('dPraidingP') : 0);
		I = (getPageSetting('dPraidingI') > 0 ? getPageSetting('dPraidingI') : 0);
	}

	var go = false;

	if (HD <= 0) {
		go = true;
	}
	else if (HD > 0) {
		go = (HD >= calcHDratio(game.global.world + plusMapToRun1()));
	}
	if (P > 0 && getEmpowerment() == "Poison") {
		go = (P >= plusMapToRun1());
	}
	if (I > 0 && getEmpowerment() == "Ice") {
		go = (I >= plusMapToRun1());
	}
	return go;
}

function pcheck2() {
	var HD;
	var P;
	var I;

	if (game.global.challengeActive != "Daily") {
		HD = getPageSetting('PraidingHD');
		P = (getPageSetting('PraidingP') > 0 ? getPageSetting('PraidingP') : 0);
		I = (getPageSetting('PraidingI') > 0 ? getPageSetting('PraidingI') : 0);
	}
	if (game.global.challengeActive == "Daily") {
		HD = getPageSetting('dPraidingHD');
		P = (getPageSetting('dPraidingP') > 0 ? getPageSetting('dPraidingP') : 0);
		I = (getPageSetting('dPraidingI') > 0 ? getPageSetting('dPraidingI') : 0);
	}

	var go = false;

	if (HD <= 0) {
		go = true;
	}
	else if (HD > 0) {
		go = (HD >= calcHDratio(game.global.world + plusMapToRun2()));
	}
	if (P > 0 && getEmpowerment() == "Poison") {
		go = (P >= plusMapToRun2());
	}
	if (I > 0 && getEmpowerment() == "Ice") {
		go = (I >= plusMapToRun2());
	}
	return go;
}

function pcheck3() {
	var HD;
	var P;
	var I;

	if (game.global.challengeActive != "Daily") {
		HD = getPageSetting('PraidingHD');
		P = (getPageSetting('PraidingP') > 0 ? getPageSetting('PraidingP') : 0);
		I = (getPageSetting('PraidingI') > 0 ? getPageSetting('PraidingI') : 0);
	}
	if (game.global.challengeActive == "Daily") {
		HD = getPageSetting('dPraidingHD');
		P = (getPageSetting('dPraidingP') > 0 ? getPageSetting('dPraidingP') : 0);
		I = (getPageSetting('dPraidingI') > 0 ? getPageSetting('dPraidingI') : 0);
	}

	var go = false;

	if (HD <= 0) {
		go = true;
	}
	else if (HD > 0) {
		go = (HD >= calcHDratio(game.global.world + plusMapToRun3()));
	}
	if (P > 0 && getEmpowerment() == "Poison") {
		go = (P >= plusMapToRun3());
	}
	if (I > 0 && getEmpowerment() == "Ice") {
		go = (I >= plusMapToRun3());
	}
	return go;
}

function pcheck4() {
	var HD;
	var P;
	var I;

	if (game.global.challengeActive != "Daily") {
		HD = getPageSetting('PraidingHD');
		P = (getPageSetting('PraidingP') > 0 ? getPageSetting('PraidingP') : 0);
		I = (getPageSetting('PraidingI') > 0 ? getPageSetting('PraidingI') : 0);
	}
	if (game.global.challengeActive == "Daily") {
		HD = getPageSetting('dPraidingHD');
		P = (getPageSetting('dPraidingP') > 0 ? getPageSetting('dPraidingP') : 0);
		I = (getPageSetting('dPraidingI') > 0 ? getPageSetting('dPraidingI') : 0);
	}

	var go = false;

	if (HD <= 0) {
		go = true;
	}
	else if (HD > 0) {
		go = (HD >= calcHDratio(game.global.world + plusMapToRun4()));
	}
	if (P > 0 && getEmpowerment() == "Poison") {
		go = (P >= plusMapToRun4());
	}
	if (I > 0 && getEmpowerment() == "Ice") {
		go = (I >= plusMapToRun4());
	}
	return go;
}

function pcheck5() {
	var HD;
	var P;
	var I;

	if (game.global.challengeActive != "Daily") {
		HD = getPageSetting('PraidingHD');
		P = (getPageSetting('PraidingP') > 0 ? getPageSetting('PraidingP') : 0);
		I = (getPageSetting('PraidingI') > 0 ? getPageSetting('PraidingI') : 0);
	}
	if (game.global.challengeActive == "Daily") {
		HD = getPageSetting('dPraidingHD');
		P = (getPageSetting('dPraidingP') > 0 ? getPageSetting('dPraidingP') : 0);
		I = (getPageSetting('dPraidingI') > 0 ? getPageSetting('dPraidingI') : 0);
	}

	var go = false;

	if (HD <= 0) {
		go = true;
	}
	else if (HD > 0) {
		go = (HD >= calcHDratio(game.global.world + plusMapToRun5()));
	}
	if (P > 0 && getEmpowerment() == "Poison") {
		go = (P >= plusMapToRun5());
	}
	if (I > 0 && getEmpowerment() == "Ice") {
		go = (I >= plusMapToRun5());
	}
	return go;
}

function pcheckmap1() {
	var go = false;
	if (game.global.world % 10 == 0 && plusMapToRun1() == 1) {
		go = true;
	}
	if (game.global.world % 10 == 1 && (plusMapToRun1() == 1 || plusMapToRun1() == 10)) {
		go = true;
	}
	if (game.global.world % 10 == 2 && (plusMapToRun1() == 1 || plusMapToRun1() >= 9)) {
		go = true;
	}
	if (game.global.world % 10 == 3 && (plusMapToRun1() == 1 || plusMapToRun1() >= 8)) {
		go = true;
	}
	if (game.global.world % 10 == 4 && (plusMapToRun1() == 1 || plusMapToRun1() >= 7)) {
		go = true;
	}
	if (game.global.world % 10 == 5 && plusMapToRun1() >= 6) {
		go = true;
	}
	if (game.global.world % 10 == 6 && plusMapToRun1() >= 5) {
		go = true;
	}
	if (game.global.world % 10 == 7 && plusMapToRun1() >= 4) {
		go = true;
	}
	if (game.global.world % 10 == 8 && plusMapToRun1() >= 3) {
		go = true;
	}
	if (game.global.world % 10 == 9 && plusMapToRun1() >= 2) {
		go = true;
	}
	return go;
}

function pcheckmap2() {
	var go = false;
	if (game.global.world % 10 == 0 && plusMapToRun2() == 2) {
		go = true;
	}
	if (game.global.world % 10 == 1 && (plusMapToRun2() == 2 || plusMapToRun2() == 10)) {
		go = true;
	}
	if (game.global.world % 10 == 2 && (plusMapToRun2() == 2 || plusMapToRun2() >= 9)) {
		go = true;
	}
	if (game.global.world % 10 == 3 && (plusMapToRun2() == 2 || plusMapToRun2() >= 8)) {
		go = true;
	}
	if (game.global.world % 10 == 4 && plusMapToRun2() >= 7) {
		go = true;
	}
	if (game.global.world % 10 == 5 && plusMapToRun2() >= 6) {
		go = true;
	}
	if (game.global.world % 10 == 6 && plusMapToRun2() >= 6) {
		go = true;
	}
	if (game.global.world % 10 == 7 && plusMapToRun2() >= 5) {
		go = true;
	}
	if (game.global.world % 10 == 8 && plusMapToRun2() >= 4) {
		go = true;
	}
	if (game.global.world % 10 == 9 && plusMapToRun2() >= 3) {
		go = true;
	}
	return go;
}

function pcheckmap3() {
	var go = false;
	if (game.global.world % 10 == 0 && plusMapToRun3() == 3) {
		go = true;
	}
	if (game.global.world % 10 == 1 && (plusMapToRun3() == 3 || plusMapToRun3() == 10)) {
		go = true;
	}
	if (game.global.world % 10 == 2 && (plusMapToRun3() == 3 || plusMapToRun3() >= 9)) {
		go = true;
	}
	if (game.global.world % 10 == 3 && plusMapToRun3() >= 8) {
		go = true;
	}
	if (game.global.world % 10 == 4 && plusMapToRun3() >= 8) {
		go = true;
	}
	if (game.global.world % 10 == 5 && plusMapToRun3() >= 8) {
		go = true;
	}
	if (game.global.world % 10 == 6 && plusMapToRun3() >= 7) {
		go = true;
	}
	if (game.global.world % 10 == 7 && plusMapToRun3() >= 6) {
		go = true;
	}
	if (game.global.world % 10 == 8 && plusMapToRun3() >= 5) {
		go = true;
	}
	if (game.global.world % 10 == 9 && plusMapToRun3() >= 4) {
		go = true;
	}
	return go;
}

function pcheckmap4() {
	var go = false;
	if (game.global.world % 10 == 0 && plusMapToRun4() == 4) {
		go = true;
	}
	if (game.global.world % 10 == 1 && (plusMapToRun4() == 4 || plusMapToRun4() == 10)) {
		go = true;
	}
	if (game.global.world % 10 == 2 && plusMapToRun4() >= 9) {
		go = true;
	}
	if (game.global.world % 10 == 3 && plusMapToRun4() >= 8) {
		go = true;
	}
	if (game.global.world % 10 == 4 && plusMapToRun4() >= 7) {
		go = true;
	}
	if (game.global.world % 10 == 5 && plusMapToRun4() >= 6) {
		go = true;
	}
	if (game.global.world % 10 == 6 && plusMapToRun4() >= 5) {
		go = true;
	}
	if (game.global.world % 10 == 7 && plusMapToRun4() >= 4) {
		go = true;
	}
	if (game.global.world % 10 == 8 && plusMapToRun4() >= 3) {
		go = true;
	}
	if (game.global.world % 10 == 9 && plusMapToRun4() >= 2) {
		go = true;
	}
	return go;
}

function pcheckmap5() {
	var go = false;
	if (game.global.world % 10 == 0 && plusMapToRun5() == 5) {
		go = true;
	}
	if (game.global.world % 10 == 1 && (plusMapToRun5() == 4 || plusMapToRun5() == 10)) {
		go = true;
	}
	if (game.global.world % 10 == 2 && (plusMapToRun5() == 3 || plusMapToRun5() >= 9)) {
		go = true;
	}
	if (game.global.world % 10 == 3 && (plusMapToRun5() == 2 || plusMapToRun5() >= 8)) {
		go = true;
	}
	if (game.global.world % 10 == 4 && (plusMapToRun5() == 1 || plusMapToRun5() >= 7)) {
		go = true;
	}
	if (game.global.world % 10 == 5 && plusMapToRun5() >= 6) {
		go = true;
	}
	if (game.global.world % 10 == 6 && plusMapToRun5() >= 5) {
		go = true;
	}
	if (game.global.world % 10 == 7 && plusMapToRun5() >= 4) {
		go = true;
	}
	if (game.global.world % 10 == 8 && plusMapToRun5() >= 3) {
		go = true;
	}
	if (game.global.world % 10 == 9 && plusMapToRun5() >= 2) {
		go = true;
	}
	return go;
}

var pMap1 = undefined;
var pMap2 = undefined;
var pMap3 = undefined;
var pMap4 = undefined;
var pMap5 = undefined;
var repMap1 = undefined;
var repMap2 = undefined;
var repMap3 = undefined;
var repMap4 = undefined;
var repMap5 = undefined;
var mapbought1 = false;
var mapbought2 = false;
var mapbought3 = false;
var mapbought4 = false;
var mapbought5 = false;

function Praiding() {
	var cell;
	cell = ((getPageSetting('Praidingcell') > 0) ? getPageSetting('Praidingcell') : 0);
	if (getPageSetting('Praidingzone').length) {
		if (getPageSetting('Praidingzone').includes(game.global.world) && ((cell <= 1) || (cell > 1 && (game.global.lastClearedCell + 1) >= cell)) && !prestraid && !failpraid) {
			prestraidon = true;
			if (getPageSetting('AutoMaps') == 1 && !prestraid && !failpraid) {
				autoTrimpSettings["AutoMaps"].value = 0;
			}
			if (!game.global.preMapsActive && !game.global.mapsActive && !prestraid) {
				mapsClicked();
				if (!game.global.preMapsActive) {
					mapsClicked();
				}
				debug("Beginning Prestige Raiding...");
			}
			if (game.options.menu.repeatUntil.enabled != 2 && !prestraid) {
				game.options.menu.repeatUntil.enabled = 2;
			}
			if (game.global.preMapsActive && !game.global.mapsActive && !prestraid) {
				debug("Map Loop");
				if (pcheckmap5() == true && pcheck5() == true && pMap5 == undefined && !mapbought5 && game.global.preMapsActive && !prestraid) {
					debug("Check complete for 5th map");
					plusPres5();
					if ((updateMapCost(true) <= game.resources.fragments.owned)) {
						buyMap();
						mapbought5 = true;
						if (mapbought5) {
							pMap5 = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
							debug("5th map bought");
						}
					}
				}
				if (pcheckmap4() == true && pcheck4() == true && pMap4 == undefined && !mapbought4 && game.global.preMapsActive && !prestraid) {
					debug("Check complete for 4th map");
					plusPres4();
					if ((updateMapCost(true) <= game.resources.fragments.owned)) {
						buyMap();
						mapbought4 = true;
						if (mapbought4) {
							pMap4 = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
							debug("4th map bought");
						}
					}
				}
				if (pcheckmap3() == true && pcheck3() == true && pMap3 == undefined && !mapbought3 && game.global.preMapsActive && !prestraid) {
					debug("Check complete for 3rd map");
					plusPres3();
					if ((updateMapCost(true) <= game.resources.fragments.owned)) {
						buyMap();
						mapbought3 = true;
						if (mapbought3) {
							pMap3 = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
							debug("3rd map bought");
						}
					}
				}
				if (pcheckmap2() == true && pcheck2() == true && pMap2 == undefined && !mapbought2 && game.global.preMapsActive && !prestraid) {
					debug("Check complete for 2nd map");
					plusPres2();
					if ((updateMapCost(true) <= game.resources.fragments.owned)) {
						buyMap();
						mapbought2 = true;
						if (mapbought2) {
							pMap2 = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
							debug("2nd map bought");
						}
					}
				}
				if (pcheckmap1() == true && pcheck1() == true && pMap1 == undefined && !mapbought1 && game.global.preMapsActive && !prestraid) {
					debug("Check complete for 1st map");
					plusPres1();
					if ((updateMapCost(true) <= game.resources.fragments.owned)) {
						buyMap();
						mapbought1 = true;
						if (mapbought1) {
							pMap1 = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
							debug("1st map bought");
						}
					}
				}
				if (!mapbought1 && !mapbought2 && !mapbought3 && !mapbought4 && !mapbought5) {
					if (getPageSetting('AutoMaps') == 0 && !prestraid) {
						autoTrimpSettings["AutoMaps"].value = 1;
						game.options.menu.repeatUntil.enabled = 0;
						prestraidon = false;
						failpraid = true;
						praidDone = true;
						pMap1 = undefined;
						pMap2 = undefined;
						pMap3 = undefined;
						pMap4 = undefined;
						pMap5 = undefined;
						debug("Failed to Prestige Raid. Looks like you can't afford to or you are too weak or you have limited yourself in a P/I zone. ");
					}
					return;
				}
			}
			if (game.global.preMapsActive && !game.global.mapsActive && mapbought1 && pMap1 != undefined && !prestraid) {
				debug("running map 1");
				selectMap(pMap1);
				runMap();
				repMap1 = pMap1;
				pMap1 = undefined;
			}
			if (game.global.preMapsActive && !game.global.mapsActive && mapbought2 && pMap2 != undefined && !prestraid) {
				debug("running map 2");
				selectMap(pMap2);
				runMap();
				repMap2 = pMap2;
				pMap2 = undefined;
			}
			if (game.global.preMapsActive && !game.global.mapsActive && mapbought3 && pMap3 != undefined && !prestraid) {
				debug("running map 3");
				selectMap(pMap3);
				runMap();
				repMap3 = pMap3;
				pMap3 = undefined;
			}
			if (game.global.preMapsActive && !game.global.mapsActive && mapbought4 && pMap4 != undefined && !prestraid) {
				debug("running map 4");
				selectMap(pMap4);
				runMap();
				repMap4 = pMap4;
				pMap4 = undefined;
			}
			if (game.global.preMapsActive && !game.global.mapsActive && mapbought5 && pMap5 != undefined && !prestraid) {
				debug("running map 5");
				selectMap(pMap5);
				runMap();
				repMap5 = pMap5;
				pMap5 = undefined;
			}
			if (!prestraid && !game.global.repeatMap) {
				repeatClicked();
			}
		}
	}
	if (game.global.preMapsActive && (mapbought1 || mapbought2 || mapbought3 || mapbought4 || mapbought5) && pMap1 == undefined && pMap2 == undefined && pMap3 == undefined && pMap4 == undefined && pMap5 == undefined && !prestraid && !failpraid) {
		prestraid = true;
		failpraid = false;
		mapbought1 = false;
		mapbought2 = false;
		mapbought3 = false;
		mapbought4 = false;
		mapbought5 = false;
	}
	if (getPageSetting('AutoMaps') == 0 && game.global.preMapsActive && prestraid && !failpraid && prestraidon) {
		praidDone = true;
		prestraidon = false;
		if (repMap1 != undefined) {
			recycleMap(getMapIndex(repMap1));
			repMap1 = undefined;
		}
		if (repMap2 != undefined) {
			recycleMap(getMapIndex(repMap2));
			repMap2 = undefined;
		}
		if (repMap3 != undefined) {
			recycleMap(getMapIndex(repMap3));
			repMap3 = undefined;
		}
		if (repMap4 != undefined) {
			recycleMap(getMapIndex(repMap4));
			repMap4 = undefined;
		}
		if (repMap5 != undefined) {
			recycleMap(getMapIndex(repMap5));
			repMap5 = undefined;
		}
		autoTrimpSettings["AutoMaps"].value = 1;
		game.options.menu.repeatUntil.enabled = 0;
		pMap1 = undefined;
		pMap2 = undefined;
		pMap3 = undefined;
		pMap4 = undefined;
		pMap5 = undefined;
		debug("Prestige raiding successful!");
		debug("Turning AutoMaps back on");
	}
	if (getPageSetting('Praidingzone').every(isBelowThreshold)) {
		prestraid = false;
		failpraid = false;
		prestraidon = false;
		mapbought1 = false;
		mapbought2 = false;
		mapbought3 = false;
		mapbought4 = false;
		mapbought5 = false;
		pMap1 = undefined;
		pMap2 = undefined;
		pMap3 = undefined;
		pMap4 = undefined;
		pMap5 = undefined;
		repMap1 = undefined;
		repMap2 = undefined;
		repMap3 = undefined;
		repMap4 = undefined;
		repMap5 = undefined;
		praidDone = false;
	}
}

function PraidHarder() {
	var maxPlusZones;
	var mapModifiers = ["p", "fa", "0"];
	var farmFragments;
	var praidBeforeFarm;
	var pRaidIndex;
	var maxPraidZSetting;
	var cell;

	// Determine whether to use daily or normal run settings
	if (game.global.challengeActive == "Daily") {
		praidSetting = 'dPraidingzone';
		maxPraidZSetting = 'dMaxPraidZone';
		farmFragments = getPageSetting('dPraidFarmFragsZ').includes(game.global.world);
		praidBeforeFarm = getPageSetting('dPraidBeforeFarmZ').includes(game.global.world);
		cell = ((getPageSetting('dPraidingcell') > 0) ? getPageSetting('dPraidingcell') : 0);
	} else {
		praidSetting = 'Praidingzone';
		maxPraidZSetting = 'MaxPraidZone';
		farmFragments = getPageSetting('PraidFarmFragsZ').includes(game.global.world);
		praidBeforeFarm = getPageSetting('PraidBeforeFarmZ').includes(game.global.world);
		cell = ((getPageSetting('Praidingcell') > 0) ? getPageSetting('Praidingcell') : 0);
	}

	pRaidIndex = getPageSetting(praidSetting).indexOf(game.global.world);
	if (pRaidIndex == -1 || typeof (getPageSetting(maxPraidZSetting)[pRaidIndex]) === "undefined") maxPlusZones = plusMapToRun(game.global.world);
	else maxPlusZones = getPageSetting(maxPraidZSetting)[pRaidIndex] - game.global.world;

	// Check we have a valid number for maxPlusZones
	maxPlusZones = maxPlusZones > 10 ? 10 : (maxPlusZones < 0 ? 10 : maxPlusZones);

	// Work out the max number of +map zones it's worth farming for prestige.
	if ((game.global.world + maxPlusZones) % 10 > 5)
		maxPlusZones = Math.max(maxPlusZones + (5 - (game.global.world + maxPlusZones) % 10), 0);
	else if ((game.global.world + maxPlusZones) % 10 == 0)
		maxPlusZones = Math.min(5, maxPlusZones);

	// If we have any Praiding zones defined...
	if (getPageSetting(praidSetting).length) {
		if (getPageSetting(praidSetting).includes(game.global.world) && ((game.global.lastClearedCell + 1) >= cell) && !prestraid && !failpraid && !shouldFarmFrags) {
			debug('Beginning Praiding');
			// Initialise shouldFarmFrags to false
			shouldFarmFrags = false;
			// Mark that we are prestige raiding and turn off automaps to stop it interfering
			prestraidon = true;
			autoTrimpSettings["AutoMaps"].value = 0;
			// Get into the preMaps screen
			if (!game.global.preMapsActive && !game.global.mapsActive) {
				mapsClicked();
				if (!game.global.preMapsActive) {
					mapsClicked();
				}
			}
			// Set repeat for items
			game.options.menu.repeatUntil.enabled = 2;
			toggleSetting("repeatUntil", null, false, true);
			// if we can farm for fragments, work out the minimum number we need to get all available prestiges
			if (farmFragments) {
				plusPres();
				document.getElementById('advExtraLevelSelect').value = maxPlusZones;
				document.getElementById('sizeAdvMapsRange').value = 0;
				document.getElementById('difficultyAdvMapsRange').value = 0;
				document.getElementById('advSpecialSelect').value = "0";
				minMaxMapCost = updateMapCost(true);
				// If we are not Praiding before farming, and cannot afford a max plus map, set flags for farming
				if (!praidBeforeFarm && game.resources.fragments.owned < minMaxMapCost) {
					prestraid = true;
					failpraid = false;
					shouldFarmFrags = true;
				}
			}
			// Set map settings to the best map for Praiding (even if we can't afford it)
			plusPres();
			document.getElementById('advExtraLevelSelect').value = maxPlusZones;
			// Iterate down through plusMaps setting until we find one we can afford
			for (var curPlusZones = maxPlusZones; curPlusZones >= 0; curPlusZones--) {
				// If the current targeted zone has no prestiges, decrement the number of plusZones and continue
				if ((game.global.world + curPlusZones) % 10 == 0 || (game.global.world + curPlusZones) % 10 > 5) continue;
				// Otherwise check to see if we can afford a map at the current plusZones setting
				document.getElementById('advExtraLevelSelect').value = curPlusZones;
				// If we find a map we can afford, break out of the loop
				if (relaxMapReqs(mapModifiers)) break;
				// conserve fragments if going to farm after by selecting only maps with no special modifier
				else if (farmFragments) mapModifiers = ["0"];
			}
			// If the map is not at the highest level with prestiges possible, set shouldFarmFrags to true
			if (maxPlusZones > curPlusZones) shouldFarmFrags = true;

			// If we found a suitable map...
			if (curPlusZones >= 0 && (praidBeforeFarm || shouldFarmFrags == false)) {
				// ...buy it
				buyMap();
				pMap = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
				selectMap(pMap);
				// Set flags to avoid rerunning this step
				prestraid = true;
				// prestraidon = false;
				failpraid = false;
				// Set repeat on and run the map
				game.global.repeatMap = true;
				runMap();
				repeatClicked(true);
			}
			// If we can't afford a map, and can't farm fragments, fail and turn automaps back on
			else if (!farmFragments) {
				failpraid = true;
				prestraidon = false;
				praidDone = true;
				debug("Failed to prestige raid. Looks like you can't afford to.");
			} else {
				debug("Turning AutoMaps back on");
				autoTrimpSettings['AutoMaps'].value = 1;
				game.options.menu.repeatUntil.enabled = 0;
			}
			return;
		}
	}

	if (farmFragments && shouldFarmFrags && game.global.preMapsActive && prestraid && !fMap) {
		if (pMap) recycleMap(getMapIndex(pMap));
		pMap = null;
		// Choose a fragment farming map
		document.getElementById("biomeAdvMapsSelect").value = "Depths";
		document.getElementById('advExtraLevelSelect').value = 0;
		document.getElementById('advSpecialSelect').value = "fa";
		document.getElementById("lootAdvMapsRange").value = 9;
		document.getElementById("difficultyAdvMapsRange").value = 9;
		document.getElementById("sizeAdvMapsRange").value = 9;
		document.getElementById('advPerfectCheckbox').dataset.checked = true;
		document.getElementById("mapLevelInput").value = game.global.world - 1;
		game.options.menu.repeatUntil.enabled = 0;
		toggleSetting("repeatUntil", null, false, true);
		if (updateMapCost(true) <= game.resources.fragments.owned) {
			debug("Buying perfect sliders fragment farming map");
			buyMap();
			fMap = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
			selectMap(fMap);
			game.global.repeatMap = true;
			runMap();
			repeatClicked(true);
		} else {
			document.getElementById('advPerfectCheckbox').dataset.checked = false;
			if (updateMapCost(true) <= game.resources.fragments.owned) {
				debug("Buying imperfect sliders fragment farming map");
				buyMap();
				fMap = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
				selectMap(fMap);
				game.global.repeatMap = true;
				runMap();
				repeatClicked(true);
			}
			// if we can't buy a map, wait until the next main loop iteration and try again
			else debug("Can't afford fragment farming map yet");
		}
	}

	if ((game.global.mapsActive || game.global.preMapsActive) && minMaxMapCost <= game.resources.fragments.owned && shouldFarmFrags) {
		game.global.repeatMap = false;
		repeatClicked(true);
		if (game.global.preMapsActive) {
			minMaxMapCost = null;
			shouldFarmFrags = false;
			prestraid = false;
			failpraid = false;
		}
	}
	if (game.global.preMapsActive && prestraid && !failpraid && !shouldFarmFrags && prestraidon) {
		prestraidon = false;
		praidDone = true;
		debug("Prestige raiding successful! - recycling Praid map");
		if (pMap) recycleMap(getMapIndex(pMap));
		if (fMap) recycleMap(getMapIndex(fMap));
		pMap = null;
		fMap = null;
		debug("Turning AutoMaps back on");
		game.options.menu.repeatUntil.enabled = 0;
		autoTrimpSettings['AutoMaps'].value = 1;
	}

	if (!getPageSetting(praidSetting).includes(game.global.world)) {
		prestraid = false;
		failpraid = false;
		prestraidon = false;
		shouldFarmFrags = false;
		praidDone = false;
	}
}

function relaxMapReqs(mapModifiers) {
	for (var j = 0; j < mapModifiers.length; j++) {
		document.getElementById('sizeAdvMapsRange').value = 9;
		document.getElementById('advSpecialSelect').value = mapModifiers[j];
		for (var i = 9; i >= 0; i--) {
			document.getElementById('difficultyAdvMapsRange').value = i;
			if (updateMapCost(true) <= game.resources.fragments.owned) return true;
		}
		for (i = 9; i >= 0; i--) {
			document.getElementById('sizeAdvMapsRange').value = i;
			if (updateMapCost(true) <= game.resources.fragments.owned) return true;
		}
	}
	return false;
}

function BWraiding() {
	var bwraidZ;
	var bwraidSetting;
	var bwraidMax;
	var isBWRaidZ;
	var targetBW;
	var bwIndex;
	var cell;

	if (game.global.challengeActive == "Daily") {
		bwraidZ = 'dBWraidingz';
		bwraidSetting = 'Dailybwraid';
		bwraidMax = 'dBWraidingmax';
		cell = ((getPageSetting('dbwraidcell') > 0) ? getPageSetting('dbwraidcell') : 1);
	} else {
		bwraidZ = 'BWraidingz';
		bwraidSetting = 'BWraid';
		bwraidMax = 'BWraidingmax';
		cell = ((getPageSetting('bwraidcell') > 0) ? getPageSetting('bwraidcell') : 1);
	}

	isBWRaidZ = getPageSetting(bwraidZ).includes(game.global.world) && ((game.global.lastClearedCell + 1) >= cell);
	bwIndex = getPageSetting(bwraidZ).indexOf(game.global.world);
	if (bwIndex == -1 || typeof (getPageSetting(bwraidMax)[bwIndex]) === "undefined") targetBW = -1;
	else targetBW = getPageSetting(bwraidMax)[bwIndex];

	if (isBWRaidZ && !bwraided && !failbwraid && getPageSetting(bwraidSetting)) {
		if (getPageSetting('AutoMaps') == 1 && !bwraided && !failbwraid) {
			autoTrimpSettings["AutoMaps"].value = 0;
		}

		while (!game.global.preMapsActive && !bwraidon) mapsClicked();

		if (game.options.menu.repeatUntil.enabled != 2 && !bwraided && !failbwraid) {
			game.options.menu.repeatUntil.enabled = 2;
		}

		if (game.global.preMapsActive && !bwraided && !failbwraid && findLastBionic()) {
			selectMap(findLastBionic().id);
			failbwraid = false;
			debug("Beginning BW Raiding...");
		} else if (game.global.preMapsActive && !bwraided && !failbwraid) {
			if (getPageSetting('AutoMaps') == 0 && isBWRaidZ && !bwraided) {
				autoTrimpSettings["AutoMaps"].value = 1;
				failbwraid = true;
				debug("Failed to BW raid. Looks like you don't have a BW to raid...");
			}
		}

		if (findLastBionic().level <= targetBW && !bwraided && !failbwraid && game.global.preMapsActive) {
			runMap();
			bwraidon = true;
		}

		if (!game.global.repeatMap && !bwraided && !failbwraid && game.global.mapsActive) {
			repeatClicked();
		}

		if (findLastBionic().level > targetBW && !bwraided && !failbwraid) {
			bwraided = true;
			failbwraid = false;
			bwraidon = false;
			debug("...Successfully BW raided!");
		}
	}

	if (getPageSetting('AutoMaps') == 0 && game.global.preMapsActive && bwraided && !failbwraid) {
		autoTrimpSettings["AutoMaps"].value = 1;
		debug("Turning AutoMaps back on");
	}

	if (!isBWRaidZ) {
		bwraided = false;
		failbwraid = false;
		bwraidon = false;
	}
}

var dpMap1 = undefined;
var dpMap2 = undefined;
var dpMap3 = undefined;
var dpMap4 = undefined;
var dpMap5 = undefined;
var drepMap1 = undefined;
var drepMap2 = undefined;
var drepMap3 = undefined;
var drepMap4 = undefined;
var drepMap5 = undefined;
var dmapbought1 = false;
var dmapbought2 = false;
var dmapbought3 = false;
var dmapbought4 = false;
var dmapbought5 = false;
var dpraidDone = false;

function dailyPraiding() {
	var cell;
	cell = ((getPageSetting('dPraidingcell') > 0) ? getPageSetting('dPraidingcell') : 0);
	if (getPageSetting('dPraidingzone').length) {
		if (getPageSetting('dPraidingzone').includes(game.global.world) && ((cell <= 1) || (cell > 1 && (game.global.lastClearedCell + 1) >= cell)) && !dprestraid && !dfailpraid) {
			dprestraidon = true;
			if (getPageSetting('AutoMaps') == 1 && !dprestraid && !dfailpraid) {
				autoTrimpSettings["AutoMaps"].value = 0;
			}
			if (!game.global.preMapsActive && !game.global.mapsActive && !dprestraid) {
				mapsClicked();
				if (!game.global.preMapsActive) {
					mapsClicked();
				}
				debug("Beginning Prestige Raiding...");
			}
			if (game.options.menu.repeatUntil.enabled != 2 && !dprestraid) {
				game.options.menu.repeatUntil.enabled = 2;
			}
			if (game.global.preMapsActive && !game.global.mapsActive && !dprestraid) {
				debug("Map Loop");
				if (pcheckmap5() == true && pcheck5() == true && dpMap5 == undefined && !dmapbought5 && game.global.preMapsActive && !dprestraid) {
					debug("Check complete for 5th map");
					plusPres5();
					if ((updateMapCost(true) <= game.resources.fragments.owned)) {
						buyMap();
						dmapbought5 = true;
						if (dmapbought5) {
							dpMap5 = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
							debug("5th map bought");
						}
					}
				}
				if (pcheckmap4() == true && pcheck4() == true && dpMap4 == undefined && !dmapbought4 && game.global.preMapsActive && !dprestraid) {
					debug("Check complete for 4th map");
					plusPres4();
					if ((updateMapCost(true) <= game.resources.fragments.owned)) {
						buyMap();
						dmapbought4 = true;
						if (dmapbought4) {
							dpMap4 = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
							debug("4th map bought");
						}
					}
				}
				if (pcheckmap3() == true && pcheck3() == true && dpMap3 == undefined && !dmapbought3 && game.global.preMapsActive && !dprestraid) {
					debug("Check complete for 3rd map");
					plusPres3();
					if ((updateMapCost(true) <= game.resources.fragments.owned)) {
						buyMap();
						dmapbought3 = true;
						if (dmapbought3) {
							dpMap3 = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
							debug("3rd map bought");
						}
					}
				}
				if (pcheckmap2() == true && pcheck2() == true && dpMap2 == undefined && !dmapbought2 && game.global.preMapsActive && !dprestraid) {
					debug("Check complete for 2nd map");
					plusPres2();
					if ((updateMapCost(true) <= game.resources.fragments.owned)) {
						buyMap();
						dmapbought2 = true;
						if (dmapbought2) {
							dpMap2 = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
							debug("2nd map bought");
						}
					}
				}
				if (pcheckmap1() == true && pcheck1() == true && dpMap1 == undefined && !dmapbought1 && game.global.preMapsActive && !dprestraid) {
					debug("Check complete for 1st map");
					plusPres1();
					if ((updateMapCost(true) <= game.resources.fragments.owned)) {
						buyMap();
						dmapbought1 = true;
						if (dmapbought1) {
							dpMap1 = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
							debug("1st map bought");
						}
					}
				}
				if (!dmapbought1 && !dmapbought2 && !dmapbought3 && !dmapbought4 && !dmapbought5) {
					if (getPageSetting('AutoMaps') == 0 && !dprestraid) {
						autoTrimpSettings["AutoMaps"].value = 1;
						game.options.menu.repeatUntil.enabled = 0;
						dprestraidon = false;
						dfailpraid = true;
						dpraidDone = true;
						dpMap1 = undefined;
						dpMap2 = undefined;
						dpMap3 = undefined;
						dpMap4 = undefined;
						dpMap5 = undefined;
						debug("Failed to Prestige Raid. Looks like you can't afford to or you are too weak or you have limited yourself in a P/I zone. ");
					}
					return;
				}
			}
			if (game.global.preMapsActive && !game.global.mapsActive && dmapbought1 && dpMap1 != undefined && !dprestraid) {
				debug("running map 1");
				selectMap(dpMap1);
				runMap();
				drepMap1 = dpMap1;
				dpMap1 = undefined;
			}
			if (game.global.preMapsActive && !game.global.mapsActive && dmapbought2 && dpMap2 != undefined && !dprestraid) {
				debug("running map 2");
				selectMap(dpMap2);
				runMap();
				drepMap2 = dpMap2;
				dpMap2 = undefined;
			}
			if (game.global.preMapsActive && !game.global.mapsActive && dmapbought3 && dpMap3 != undefined && !dprestraid) {
				debug("running map 3");
				selectMap(dpMap3);
				runMap();
				drepMap3 = dpMap3;
				dpMap3 = undefined;
			}
			if (game.global.preMapsActive && !game.global.mapsActive && dmapbought4 && dpMap4 != undefined && !dprestraid) {
				debug("running map 4");
				selectMap(dpMap4);
				runMap();
				drepMap4 = dpMap4;
				dpMap4 = undefined;
			}
			if (game.global.preMapsActive && !game.global.mapsActive && dmapbought5 && dpMap5 != undefined && !dprestraid) {
				debug("running map 5");
				selectMap(dpMap5);
				runMap();
				drepMap5 = dpMap5;
				dpMap5 = undefined;
			}
			if (!dprestraid && !game.global.repeatMap) {
				repeatClicked();
			}
		}
	}
	if (game.global.preMapsActive && (dmapbought1 || dmapbought2 || dmapbought3 || dmapbought4 || dmapbought5) && pMap1 == undefined && dpMap2 == undefined && dpMap3 == undefined && dpMap4 == undefined && dpMap5 == undefined && !dprestraid && !dfailpraid) {
		dprestraid = true;
		dfailpraid = false;
		dmapbought1 = false;
		dmapbought2 = false;
		dmapbought3 = false;
		dmapbought4 = false;
		dmapbought5 = false;
	}
	if (getPageSetting('AutoMaps') == 0 && game.global.preMapsActive && dprestraid && !dfailpraid && dprestraidon) {
		dpraidDone = true;
		dprestraidon = false;
		if (drepMap1 != undefined) {
			recycleMap(getMapIndex(drepMap1));
			drepMap1 = undefined;
		}
		if (drepMap2 != undefined) {
			recycleMap(getMapIndex(drepMap2));
			drepMap2 = undefined;
		}
		if (drepMap3 != undefined) {
			recycleMap(getMapIndex(drepMap3));
			drepMap3 = undefined;
		}
		if (drepMap4 != undefined) {
			recycleMap(getMapIndex(drepMap4));
			drepMap4 = undefined;
		}
		if (drepMap5 != undefined) {
			recycleMap(getMapIndex(drepMap5));
			drepMap5 = undefined;
		}
		autoTrimpSettings["AutoMaps"].value = 1;
		game.options.menu.repeatUntil.enabled = 0;
		pMap1 = undefined;
		dpMap2 = undefined;
		dpMap3 = undefined;
		dpMap4 = undefined;
		dpMap5 = undefined;
		debug("Prestige raiding successful!");
		debug("Turning AutoMaps back on");
	}
	if (getPageSetting('dPraidingzone').every(isBelowThreshold)) {
		dprestraid = false;
		dfailpraid = false;
		dprestraidon = false;
		dmapbought1 = false;
		dmapbought2 = false;
		dmapbought3 = false;
		dmapbought4 = false;
		dmapbought5 = false;
		pMap1 = undefined;
		dpMap2 = undefined;
		dpMap3 = undefined;
		dpMap4 = undefined;
		dpMap5 = undefined;
		repMap1 = undefined;
		repMap2 = undefined;
		repMap3 = undefined;
		repMap4 = undefined;
		repMap5 = undefined;
		dpraidDone = false;
	}
}

function dailyBWraiding() {
	var cell;
	cell = ((getPageSetting('dbwraidcell') > 0) ? getPageSetting('dbwraidcell') : 1);
	if (!dprestraidon && game.global.world == getPageSetting('dBWraidingz') && ((game.global.lastClearedCell + 1) >= cell) && !dbwraided && !dfailbwraid && getPageSetting('Dailybwraid')) {
		if (getPageSetting('AutoMaps') == 1 && !dbwraided && !dfailbwraid) {
			autoTrimpSettings["AutoMaps"].value = 0;
		}
		if (!game.global.preMapsActive && !game.global.mapsActive && !dbwraided && !dfailbwraid) {
			mapsClicked();
			if (!game.global.preMapsActive) {
				mapsClicked();
			}
		}
		if (game.options.menu.repeatUntil.enabled != 2 && !dbwraided && !dfailbwraid) {
			game.options.menu.repeatUntil.enabled = 2;
		}
		if (game.global.preMapsActive && !dbwraided && !dfailbwraid) {
			selectMap(findLastBionic().id);
			dfailbwraid = false;
			debug("Beginning Daily BW Raiding...");
		} else if (game.global.preMapsActive && !dbwraided && !dfailbwraid) {
			if (getPageSetting('AutoMaps') == 0 && game.global.world == getPageSetting('dBWraidingz') && !dbwraided) {
				autoTrimpSettings["AutoMaps"].value = 1;
				dfailbwraid = true;
				debug("Failed to Daily BW raid. Looks like you don't have a BW to raid...");
			}
		}
		if (findLastBionic().level <= getPageSetting('dBWraidingmax') && !dbwraided && !dfailbwraid && game.global.preMapsActive) {
			runMap();
			dbwraidon = true;
		}
		if (!game.global.repeatMap && !dbwraided && !dfailbwraid && game.global.mapsActive) {

		}
		if (findLastBionic().level > getPageSetting('dBWraidingmax') && !dbwraided && !dfailbwraid) {
			dbwraided = true;
			dfailbwraid = false;
			dbwraidon = false;
			debug("...Successfully Daily BW raided!");
		}
		if (getPageSetting('AutoMaps') == 0 && game.global.preMapsActive && game.global.world == getPageSetting('dBWraidingz') && dbwraided && !dfailbwraid) {
			autoTrimpSettings["AutoMaps"].value = 1;
			debug("Turning AutoMaps back on");
		}
	}
	if (getPageSetting('AutoMaps') == 0 && game.global.preMapsActive && dbwraided && !dfailbwraid) {
		autoTrimpSettings["AutoMaps"].value = 1;
		debug("Turning AutoMaps back on");
	}
	if (dbwraided && !dfailbwraid && game.global.world !== getPageSetting('dBWraidingz')) {
		dbwraided = false;
		dfailbwraid = false;
		dbwraidon = false;
	}
}

function trimpcide() {
	if (game.portal.Anticipation.level > 0) {
		var antistacklimit = (game.talents.patience.purchased) ? 45 : 30;
		if (game.global.fighting && ((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) >= antistacklimit && (game.global.antiStacks < antistacklimit || antistacklimit == 0 && game.global.antiStacks >= 1) && !game.global.spireActive)
			forceAbandonTrimps();
		if (game.global.fighting && ((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) >= antistacklimit && game.global.antiStacks < antistacklimit && game.global.mapsActive) {
			if (getCurrentMapObject().location == "Void") {
				abandonVoidMap();
			}
		}
	}
}

function avoidempower() {
	if (game.global.universe == 1 && armydeath()) {
		if (typeof game.global.dailyChallenge.bogged === 'undefined' && typeof game.global.dailyChallenge.plague === 'undefined') {
			mapsClicked(true);
			return;
		}
	}
}

var spirebreeding = false;
function ATspirebreed() {
	if (!spirebreeding && getPageSetting('SpireBreedTimer') > 0 && getPageSetting('IgnoreSpiresUntil') <= game.global.world && game.global.spireActive)
		var prespiretimer = game.global.GeneticistassistSetting;
	if (getPageSetting('SpireBreedTimer') > 0 && getPageSetting('IgnoreSpiresUntil') <= game.global.world && game.global.spireActive && game.global.GeneticistassistSetting != getPageSetting('SpireBreedTimer')) {
		spirebreeding = true;
		if (game.global.GeneticistassistSetting != getPageSetting('SpireBreedTimer'))
			game.global.GeneticistassistSetting = getPageSetting('SpireBreedTimer');
	}
	if (getPageSetting('SpireBreedTimer') > 0 && getPageSetting('IgnoreSpiresUntil') <= game.global.world && !game.global.spireActive && game.global.GeneticistassistSetting == getPageSetting('SpireBreedTimer')) {
		spirebreeding = false;
		if (game.global.GeneticistassistSetting == getPageSetting('SpireBreedTimer')) {
			game.global.GeneticistassistSetting = prespiretimer;
			toggleGeneticistassist();
			toggleGeneticistassist();
			toggleGeneticistassist();
			toggleGeneticistassist();
		}
	}
}

function fightalways() {
	if (game.global.gridArray.length === 0 || game.global.preMapsActive || !game.upgrades.Battle.done || game.global.fighting || (game.global.spireActive && game.global.world >= getPageSetting('IgnoreSpiresUntil')))
		return;
	if (!game.global.fighting)
		fightManual();
}

function armormagic() {
	var armormagicworld = Math.floor((game.global.highestLevelCleared + 1) * 0.8);
	if (((getPageSetting('carmormagic') == 1 || getPageSetting('darmormagic') == 1) && game.global.world >= armormagicworld && (game.global.soldierHealth <= game.global.soldierHealthMax * 0.4)) || ((getPageSetting('carmormagic') == 2 || getPageSetting('darmormagic') == 2) && calcHDratio() >= MODULES["maps"].enoughDamageCutoff && (game.global.soldierHealth <= game.global.soldierHealthMax * 0.4)) || ((getPageSetting('carmormagic') == 3 || getPageSetting('darmormagic') == 3) && (game.global.soldierHealth <= game.global.soldierHealthMax * 0.4)))
		buyArms();
}

trapIndexs = ["", "Fire", "Frost", "Poison", "Lightning", "Strength", "Condenser", "Knowledge"];

function tdStringCode2() {
	var thestring = document.getElementById('importBox').value.replace(/\s/g, '');
	var s = new String(thestring);
	var index = s.indexOf("+", 0);
	s = s.slice(0, index);
	var length = s.length;

	var saveLayout = [];
	for (var i = 0; i < length; i++) {
		saveLayout.push(trapIndexs[s.charAt(i)]);
	}
	playerSpire['savedLayout' + -1] = saveLayout;

	if ((playerSpire.runestones + playerSpire.getCurrentLayoutPrice()) < playerSpire.getSavedLayoutPrice(-1)) return false;
	playerSpire.resetTraps();
	for (var x = 0; x < saveLayout.length; x++) {
		if (!saveLayout[x]) continue;
		playerSpire.buildTrap(x, saveLayout[x]);
	}
}

var oldPlayerSpireDrawInfo = playerSpire.drawInfo;
playerSpire.drawInfo = function (arguments) {
	var ret = oldPlayerSpireDrawInfo.apply(this, arguments);
	var elem = document.getElementById('spireTrapsWindow');
	if (!elem) return arguments;
	var importBtn = "<div onclick='ImportExportTooltip(\"spireImport\")' class='spireControlBox'>Import</div>";
	elem.innerHTML = importBtn + elem.innerHTML;
	return arguments;
}

//Radon
function questcheck() {
	if (game.global.challengeActive !== 'Quest')
		return 0;
	if (game.global.world < game.challenges.Quest.getQuestStartZone()) {
		return 0;
	}
	var questnotcomplete = game.challenges.Quest.getQuestProgress() != "Quest Complete!";
	if (game.challenges.Quest.getQuestProgress() == "Failed!") return 0;
	//Resource multipliers
	else if (game.challenges.Quest.getQuestDescription().includes("food") && questnotcomplete) return 1;
	else if (game.challenges.Quest.getQuestDescription().includes("wood") && questnotcomplete) return 2;
	else if (game.challenges.Quest.getQuestDescription().includes("metal") && questnotcomplete) return 3;
	else if (game.challenges.Quest.getQuestDescription().includes("gems") && questnotcomplete) return 4;
	else if (game.challenges.Quest.getQuestDescription().includes("science") && questnotcomplete) return 5;
	//Everything else
	else if (game.challenges.Quest.getQuestDescription() == "Complete 5 Maps at Zone level" && questnotcomplete) return 6;
	else if (game.challenges.Quest.getQuestDescription() == "One-shot 5 world enemies" && questnotcomplete) return 7;
	else if (game.challenges.Quest.getQuestDescription() == "Don't let your shield break before Cell 100" && questnotcomplete) return 8;
	else if (game.challenges.Quest.getQuestDescription() == "Don't run a map before Cell 100") return 9;
	else if (game.challenges.Quest.getQuestDescription() == "Buy a Smithy" && questnotcomplete) return 10;
	else return 0;
}

function archstring() {
	if (!getPageSetting('Rarchon')) return;
	if (getPageSetting('Rarchstring1') != "undefined" && getPageSetting('Rarchstring2') != "undefined" && getPageSetting('Rarchstring3') != "undefined") {
		var string1 = getPageSetting('Rarchstring1'), string2 = getPageSetting('Rarchstring2'), string3 = getPageSetting('Rarchstring3');
		var string1z = string1.split(',')[0], string2z = string2.split(',')[0];
		var string1split = string1.split(',').slice(1).toString(), string2split = string2.split(',').slice(1).toString();
		if (game.global.world <= string1z && game.global.archString != string1split) game.global.archString = string1split;
		if (game.global.world > string1z && game.global.world <= string2z && game.global.archString != string2split) game.global.archString = string2split;
		if (game.global.world > string2z && game.global.archString != string3) game.global.archString = string3;
	}
}

//RAMP - Prestige Raiding
function RAMPplusMapToRun(number, raidzones) {
	var map;
	if (rShouldPrestigeRaid) {

		map = (raidzones - game.global.world - number);

		if ((raidzones - number).toString().slice(-1) == 0) map = map - 5
		if ((raidzones - number).toString().slice(-1) == 9) map = map - 5
		if ((raidzones - number).toString().slice(-1) == 8) map = map - 5
		if ((raidzones - number).toString().slice(-1) == 7) map = map - 5
		if ((raidzones - number).toString().slice(-1) == 6) map = map - 5
		return map;
	}
}

function RAMPshouldrunmap(number, raidzones) {
	var go = false;
	if (rShouldPrestigeRaid) {
		var actualraidzone = (raidzones - number);

		if (Rgetequips(actualraidzone, false) > 0) go = true;
	}
	return go;
}

function RAMPplusPres(number, raidzones) {
	document.getElementById("biomeAdvMapsSelect").value = game.global.farmlandsUnlocked ? "Farmlands" : "Plentiful";
	document.getElementById("mapLevelInput").value = game.global.world;
	document.getElementById("advExtraLevelSelect").value = RAMPplusMapToRun(number, raidzones);
	document.getElementById("advSpecialSelect").value = "p";
	document.getElementById("lootAdvMapsRange").value = 9;
	document.getElementById("difficultyAdvMapsRange").value = 9;
	document.getElementById("sizeAdvMapsRange").value = 9;
	document.getElementById("advPerfectCheckbox").dataset.checked = true;
	updateMapCost();
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);
	document.getElementById("advPerfectCheckbox").dataset.checked = false;
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);
	document.getElementById("biomeAdvMapsSelect").value = "Random";
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);

	while (lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
		lootAdvMapsRange.value -= 1;
	}
	while (difficultyAdvMapsRange.value > 0 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
		difficultyAdvMapsRange.value -= 1;
		if (updateMapCost(true) <= game.resources.fragments.owned) break;
		sizeAdvMapsRange.value -= 1;
	}
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);
	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("advSpecialSelect").value = "0";
		updateMapCost();
	}
	if (document.getElementById("advSpecialSelect").value == "0") return updateMapCost(true);
}

function RAMPplusPresfragmax(number, raidzones) {
	document.getElementById("biomeAdvMapsSelect").value = game.global.farmlandsUnlocked ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountains";
	document.getElementById("mapLevelInput").value = game.global.world;
	document.getElementById("advExtraLevelSelect").value = RAMPplusMapToRun(number, raidzones);
	document.getElementById("advSpecialSelect").value = "p";
	document.getElementById("lootAdvMapsRange").value = 9;
	document.getElementById("difficultyAdvMapsRange").value = 9;
	document.getElementById("sizeAdvMapsRange").value = 9;
	document.getElementById("advPerfectCheckbox").dataset.checked = true;
	updateMapCost();
	return updateMapCost(true);
}

function RAMPplusPresfragmin(number, raidzones) {
	document.getElementById("biomeAdvMapsSelect").value = game.global.farmlandsUnlocked ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountains";
	document.getElementById("mapLevelInput").value = game.global.world;
	document.getElementById("advExtraLevelSelect").value = RAMPplusMapToRun(number, raidzones);
	document.getElementById("advSpecialSelect").value = "p";
	document.getElementById("lootAdvMapsRange").value = 0;
	document.getElementById("difficultyAdvMapsRange").value = 9;
	document.getElementById("sizeAdvMapsRange").value = 9;
	document.getElementById("advPerfectCheckbox").dataset.checked = false;
	updateMapCost();
	if (updateMapCost(true) <= game.resources.fragments.owned) {
		return updateMapCost(true);
	}
	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("biomeAdvMapsSelect").value = "Random";
		updateMapCost();
	}
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);

	while (difficultyAdvMapsRange.value > 0 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
		difficultyAdvMapsRange.value -= 1;
		if (updateMapCost(true) <= game.resources.fragments.owned) break;
		sizeAdvMapsRange.value -= 1;
	}
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);

	document.getElementById("advSpecialSelect").value = "fa";
	updateMapCost();

	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);

	document.getElementById("advSpecialSelect").value = "0";
	updateMapCost();
	return updateMapCost(true);
}

function RAMPfrag(raidzones, fragtype) {
	var cost = 0;
	if (rShouldPrestigeRaid) {

		if (Rgetequips(raidzones, false)) {
			if (fragtype == 1) cost += RAMPplusPresfragmin(0);
			else if (fragtype == 2) cost += RAMPplusPresfragmax(0);
		}
		if (Rgetequips((raidzones - 1), false)) {
			if (fragtype == 1) cost += RAMPplusPresfragmin(1);
			else if (fragtype == 2) cost += RAMPplusPresfragmax(1);
		}
		if (Rgetequips((raidzones - 2), false)) {
			if (fragtype == 1) cost += RAMPplusPresfragmin(2);
			else if (fragtype == 2) cost += RAMPplusPresfragmax(2);
		}
		if (Rgetequips((raidzones - 3), false)) {
			if (fragtype == 1) cost += RAMPplusPresfragmin(3);
			else if (fragtype == 2) cost += RAMPplusPresfragmax(3);
		}
		if (Rgetequips((raidzones - 4), false)) {
			if (fragtype == 1) cost += RAMPplusPresfragmin(4);
			else if (fragtype == 2) cost += RAMPplusPresfragmax(4);
		}

		if (game.resources.fragments.owned >= cost) return true;
		else return false;
	}
}

function fragmap() {
	document.getElementById("biomeAdvMapsSelect").value = game.global.farmlandsUnlocked ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountains";
	document.getElementById("advExtraLevelSelect").value = 0;
	document.getElementById("advSpecialSelect").value = "fa";
	document.getElementById("lootAdvMapsRange").value = 9;
	document.getElementById("difficultyAdvMapsRange").value = 9;
	document.getElementById("sizeAdvMapsRange").value = 9;
	document.getElementById("advPerfectCheckbox").dataset.checked = true;
	document.getElementById("mapLevelInput").value = game.global.world;
	updateMapCost();

	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("biomeAdvMapsSelect").value = "Random";
		updateMapCost();
	}
	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("advPerfectCheckbox").dataset.checked = false;
		updateMapCost();
	}

	while (difficultyAdvMapsRange.value > 0 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
		difficultyAdvMapsRange.value -= 1;
		if (updateMapCost(true) <= game.resources.fragments.owned) break;
		sizeAdvMapsRange.value -= 1;
	}
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);

	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("advSpecialSelect").value = 0;
		updateMapCost();
	}
}

function fragmin(number) {
	document.getElementById("biomeAdvMapsSelect").value = game.global.farmlandsUnlocked ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountains";
	document.getElementById("advExtraLevelSelect").value = number;
	document.getElementById("advSpecialSelect").value = "fa";
	document.getElementById("lootAdvMapsRange").value = 9;
	document.getElementById("difficultyAdvMapsRange").value = 9;
	document.getElementById("sizeAdvMapsRange").value = 9;
	document.getElementById("advPerfectCheckbox").dataset.checked = true;
	document.getElementById("mapLevelInput").value = game.global.world;
	updateMapCost();

	if (updateMapCost(true) <= game.resources.fragments.owned) {
		return updateMapCost(true);
	}
	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("biomeAdvMapsSelect").value = "Random";
		updateMapCost();
		if (updateMapCost(true) <= game.resources.fragments.owned) {
			return updateMapCost(true);
		}
	}
	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("advPerfectCheckbox").dataset.checked = false;
		updateMapCost();
		if (updateMapCost(true) <= game.resources.fragments.owned) {
			return updateMapCost(true);
		}
	}
	if (updateMapCost(true) > game.resources.fragments.owned) {
		document.getElementById("lootAdvMapsRange").value = 8;
		updateMapCost();
		if (updateMapCost(true) <= game.resources.fragments.owned) {
			return updateMapCost(true);
		}
	}

	while (difficultyAdvMapsRange.value > 0 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
		difficultyAdvMapsRange.value -= 1;
		if (updateMapCost(true) <= game.resources.fragments.owned) break;
		sizeAdvMapsRange.value -= 1;
	}
	if (updateMapCost(true) <= game.resources.fragments.owned) return updateMapCost(true);
	if (document.getElementById("sizeAdvMapsRange").value == 0) {
		return updateMapCost(true);
	}
}

function fragmapcost() {
	var cost = 0;

	if (rShouldInsanityFarm) {
		var insanityfarmzone = getPageSetting('Rinsanityfarmzone');
		var insanityfarmlevel = getPageSetting('Rinsanityfarmlevel');
		var insanityfarmlevelindex = insanityfarmzone.indexOf(game.global.world);
		var insanitylevelzones = insanityfarmlevel[insanityfarmlevelindex];

		if (getPageSetting('Rinsanityfarmfrag')) cost = PerfectMapCost(insanitylevelzones, 'fa');
	}
	else if (rShouldWorshipperFarm) {
		var shipfarmzone = getPageSetting('Rshipfarmzone');
		var shipfarmlevel = getPageSetting('Rshipfarmlevel');
		var shipfarmlevelindex = shipfarmzone.indexOf(game.global.world);
		var shiplevelzones = shipfarmlevel[shipfarmlevelindex];

		if (getPageSetting('Rshipfarmfrag'))
			cost = fragmin(shiplevelzones);
	}
	else
		cost = 0;

	if (game.resources.fragments.owned >= cost)
		return true;
	else
		return false;
}

function rFragmentFarm(type, level, special, perfect) {

	var perfect = !perfect ? null : perfect;

	//Worshipper farming
	var rFragCheck = true;
	if (getPageSetting('R' + type + 'farmfrag')) {
		if (fragmapcost() == true) {
			rFragCheck = true;
			rFragmentFarming = false;
		} else if (fragmapcost() == false) {
			rFragmentFarming = true;
			rFragCheck = false;
			if (!rFragCheck && rInitialFragmentMapID == undefined && !rFragMapBought && game.global.preMapsActive) {
				debug("Check complete for fragment farming map");
				fragmap();
				if ((updateMapCost(true) <= game.resources.fragments.owned)) {
					buyMap();
					rFragMapBought = true;
					if (rFragMapBought) {
						rInitialFragmentMapID = game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id;
						debug("Fragment farming map purchased");
					}
				}
			}
			if (!rFragCheck && game.global.preMapsActive && !game.global.mapsActive && rFragMapBought && rInitialFragmentMapID != undefined) {
				debug("Running fragment farming map");
				selectedMap = rInitialFragmentMapID;
				selectMap(rInitialFragmentMapID);
				runMap();
				RlastMapWeWereIn = getCurrentMapObject();
				rFragmentMapID = rInitialFragmentMapID;
				rInitialFragmentMapID = undefined;
			}
			if (!rFragCheck && game.resources.fragments.owned >= PerfectMapCost(level, special) && game.global.mapsActive && rFragMapBought && rFragmentMapID != undefined) {
				if (fragmapcost() == false) {
					if (!game.global.repeatMap) {
						repeatClicked();
					}
				} else if (fragmapcost() == true) {
					if (game.global.repeatMap) {
						repeatClicked();
						//mapsClicked();
					}
					if (game.global.preMapsActive && rFragMapBought && rFragmentMapID != undefined) {
						rFragMapBought = false;
					}
					rFragCheck = true;
					rFragmentFarming = false;
				}
			}
		} else {
			rFragCheck = true;
			rFragmentFarming = false;
		}
	}

	if (rFragCheck) {
		if (type == 'insanity')
			PerfectMapCost(level, special);
		if (type == 'ship')
			RShouldFarmMapCost(level, special);
	}
	updateMapCost();
}

function PerfectMapCost(pluslevel, special, biome) {
	maplevel = pluslevel < 0 ? game.global.world + pluslevel : game.global.world;
	if (!pluslevel || pluslevel < 0) pluslevel = 0;
	if (!special) special = '0';
	if (!biome) biome = game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Random";
	document.getElementById("biomeAdvMapsSelect").value = biome;
	document.getElementById("advExtraLevelSelect").value = pluslevel;
	document.getElementById("advSpecialSelect").value = special;
	document.getElementById("lootAdvMapsRange").value = 9;
	document.getElementById("difficultyAdvMapsRange").value = 9;
	document.getElementById("sizeAdvMapsRange").value = 9;
	document.getElementById("advPerfectCheckbox").dataset.checked = true;
	document.getElementById("mapLevelInput").value = maplevel;
	updateMapCost();

	return updateMapCost(true);
}

function RShouldFarmMapCost(pluslevel, special, biome) {
	//Pre-init
	maplevel = pluslevel < 0 ? game.global.world + pluslevel : game.global.world;
	if (!pluslevel || pluslevel < 0) pluslevel = 0;
	if (!special) special = game.global.highestRadonLevelCleared > 83 ? "lmc" : "smc";
	if (!biome) biome = game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountains";
	go = false;

	//Working out appropriate map settings
	document.getElementById("mapLevelInput").value = maplevel;
	document.getElementById("advExtraLevelSelect").value = pluslevel;
	document.getElementById("biomeAdvMapsSelect").value = biome;
	document.getElementById("advSpecialSelect").value = special;
	updateMapCost();
	return updateMapCost(true);
}

function RShouldFarmMapCreation(pluslevel, special, biome, difficulty, loot, size) {
	//Pre-Init
	if (!pluslevel) pluslevel = 0;
	if (!special) special = game.global.highestRadonLevelCleared > 83 ? "lmc" : "smc";
	if (!biome) biome = game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountains";
	if (!difficulty) difficulty = 0.75;
	if (!loot) loot = game.global.farmlandsUnlocked && game.singleRunBonuses.goldMaps.owned ? 3.6 : game.global.farmlandsUnlocked ? 2.6 : game.singleRunBonuses.goldMaps.owned ? 2.85 : 1.85;
	if (!size) size = 20;
	var create = false;
	go = false;

	for (var mapping in game.global.mapsOwnedArray) {
		if (!game.global.mapsOwnedArray[mapping].noRecycle && (
			(game.global.world + pluslevel) == game.global.mapsOwnedArray[mapping].level) &&
			(game.global.mapsOwnedArray[mapping].bonus == special || game.global.mapsOwnedArray[mapping].bonus === undefined && special === '0') &&
			game.global.mapsOwnedArray[mapping].location == biome/*  &&
			game.global.mapsOwnedArray[mapping].difficulty == difficulty &&
			game.global.mapsOwnedArray[mapping].loot == loot &&
			game.global.mapsOwnedArray[mapping].size == size */) {

			return (game.global.mapsOwnedArray[mapping].id);
			break;
		} else {
			create = true;
		}
	}
	if (create) {
		return ("create");
	}
}

function rRunMap() {
	if (game.options.menu.pauseGame.enabled) return;
	if (game.global.lookingAtMap === "") return;
	if (game.achievements.mapless.earnable) {
		game.achievements.mapless.earnable = false;
		game.achievements.mapless.lastZone = game.global.world;
	}
	if (game.global.challengeActive == "Quest" && game.challenges.Quest.questId == 5 && !game.challenges.Quest.questComplete) {
		game.challenges.Quest.questProgress++;
		if (game.challenges.Quest.questProgress == 1) game.challenges.Quest.failQuest();
	}
	var mapId = game.global.lookingAtMap;
	game.global.preMapsActive = false;
	game.global.mapsActive = true;
	game.global.currentMapId = mapId;
	mapsSwitch(true);
	var mapObj = getCurrentMapObject();
	if (mapObj.bonus) {
		game.global.mapExtraBonus = mapObj.bonus;
	}
	if (game.global.lastClearedMapCell == -1) {
		buildMapGrid(mapId);
		drawGrid(true);

		if (mapObj.location == "Void") {
			game.global.voidDeaths = 0;
			game.global.voidBuff = mapObj.voidBuff;
			setVoidBuffTooltip();
		}
	}
	if (game.global.challengeActive == "Insanity") game.challenges.Insanity.drawStacks();
	if (game.global.challengeActive == "Pandemonium") game.challenges.Pandemonium.drawStacks();
}

function radonChallengesSetting() {
	var radonHZE = game.global.highestRadonLevelCleared + 1;
	var radonChallenges = ["Off", "Radon Per Hour"];
	if (radonHZE >= 40) radonChallenges.push("Bublé");
	if (radonHZE >= 55) radonChallenges.push("Melt");
	if (radonHZE >= 70) radonChallenges.push("Quagmire");
	if (radonHZE >= 90) radonChallenges.push("Archaeology");
	if (radonHZE >= 100) radonChallenges.push("Mayhem");
	if (radonHZE >= 110) radonChallenges.push("Insanity");
	if (radonHZE >= 135) radonChallenges.push("Nurture");
	if (radonHZE >= 150) radonChallenges.push("Pandemonium");
	if (radonHZE >= 155) radonChallenges.push("Alchemy");
	if (radonHZE >= 175) radonChallenges.push("Hypothermia");
	radonChallenges.push("Custom");
	if (radonHZE >= 50) radonChallenges.push("Challenge 3");

	document.getElementById('RAutoPortal').innerHTML = ''
	for (var item in radonChallenges) {
		var option = document.createElement("option");
		option.value = radonChallenges[item];
		option.text = radonChallenges[item];
		document.getElementById('RAutoPortal').appendChild(option);
	}

	var radonHourChallenges = ["None"];
	if (radonHZE >= 40) radonHourChallenges.push("Bublé");
	if (radonHZE >= 55) radonHourChallenges.push("Melt");
	if (radonHZE >= 70) radonHourChallenges.push("Quagmire");
	if (radonHZE >= 90) radonHourChallenges.push("Archaeology");
	if (radonHZE >= 130) radonHourChallenges.push("Insanity");
	if (radonHZE >= 135) radonHourChallenges.push("Nurture");
	if (radonHZE >= 155) radonHourChallenges.push("Alchemy");
	if (radonHZE >= 175) radonHourChallenges.push("Hypothermia");

	document.getElementById('RadonHourChallenge').innerHTML = ''
	for (var item in radonHourChallenges) {
		var option = document.createElement("option");
		option.value = radonHourChallenges[item];
		option.text = radonHourChallenges[item];
		document.getElementById('RadonHourChallenge').appendChild(option);
	}

	var radonChallenge3 = ["None"];
	if (radonHZE >= 15) radonChallenge3.push("Unlucky");
	if (radonHZE >= 25) radonChallenge3.push("Transmute");
	if (radonHZE >= 35) radonChallenge3.push("Unbalance");
	if (radonHZE >= 45) radonChallenge3.push("Duel");
	if (radonHZE >= 60) radonChallenge3.push("Trappapalooza");
	if (radonHZE >= 70) radonChallenge3.push("Wither");
	if (radonHZE >= 85) radonChallenge3.push("Quest");
	if (radonHZE >= 105) radonChallenge3.push("Storm");
	if (radonHZE >= 115) radonChallenge3.push("Berserk");
	if (radonHZE >= 175) radonChallenge3.push("Glass");

	document.getElementById('RadonC3Challenge').innerHTML = ''
	for (var item in radonChallenge3) {
		var option = document.createElement("option");
		option.value = radonChallenge3[item];
		option.text = radonChallenge3[item];
		document.getElementById('RadonC3Challenge').appendChild(option);
	}

	//if (radonHZE === 15) debug("You have unlocked the Unlucky challenge.")
	if (radonHZE === 5) debug("You can now use the Smithy Farm setting. This can be found in the AT 'Maps' tab.")
	if (radonHZE === 25) debug("You have unlocked the Transmute challenge. Any metal related settings will be converted to food instead while running this challenge.")
	if (radonHZE === 30) debug("You can now access the Daily tab within the AT settings. Here you will find a variety of settings that will help optimise your dailies.")
	if (radonHZE === 35) debug("You have unlocked the Unbalance challenge. There's setting for it in the AT 'C3' tab.")
	if (radonHZE === 40) debug("You have unlocked the Bublé challenge. It has now been added to AutoPortal setting.")
	//if (radonHZE === 45) debug("Duel");
	if (radonHZE === 50) debug("You can now use the Worshipper Farm setting. This can be found in the AT 'Maps' tab.")
	if (radonHZE === 50) debug("You can now access the C3 tab within the AT settings. Here you will find a variety of settings that will help optimise your C3 runs.")
	if (radonHZE === 50) debug("Due to unlocking Challenge 3's there is now a Challenge 3 option under AutoPortal to be able to auto portal into them.");
	if (radonHZE === 50) debug("You have unlocked the Melt challenge. It has now been added to AutoPortal setting.")
	if (radonHZE === 60) debug("You have unlocked the Trappapalooza challenge. It has now been added to Challenge 3 AutoPortal settings & there's a setting for it in the AT 'C3' tab.")
	if (radonHZE === 70) debug("You have unlocked the Quagmire challenge. It has now been added to AutoPortal setting & there are settings for it in the AT 'Challenges' tab.")
	if (radonHZE === 70) debug("You have unlocked the Wither challenge. It has now been added to Challenge 3 AutoPortal settings & any map level settings with the exception of Map Bonus will make the highest level map you run -1 to not obtain additional stacks.")
	if (radonHZE === 85) debug("You have unlocked the Quest challenge. It has now been added to Challenge 3 AutoPortal settings & AT will automatically complete Quests if AutoMaps is enabled during this challenge.")
	if (radonHZE === 90) debug("You have unlocked the Archaeology challenge. It has now been added to AutoPortal setting & there are settings for it in the AT 'Challenges' tab.")
	if (radonHZE === 100) debug("You have unlocked the Mayhem challenge. It has now been added to AutoPortal setting & there's setting for it in the AT 'C3' tab.")
	if (radonHZE === 105) debug("You have unlocked the Storm challenge. It has now been added to Challenge 3 AutoPortal setting & there's setting for it in the AT 'C3' tab.")
	if (radonHZE === 110) debug("You have unlocked the Insanity challenge. It has now been added to AutoPortal setting & there are settings for it in the AT 'Challenges' tab.")
	if (radonHZE === 115) debug("You have unlocked the Berserk challenge. It has now been added to Challenge 3 AutoPortal setting.")
	if (radonHZE === 135) debug("You have unlocked the Nurture challenge. It has now been added to AutoPortal setting & there is a setting for Laboratory's that has been added to AT's AutoStructure setting.")
	if (radonHZE === 150) debug("You have unlocked the Pandemonium challenge. It has now been added to AutoPortal setting & there's setting for it in the AT 'C3' tab.")
	if (radonHZE === 155) debug("You have unlocked the Alchemy challenge. It has now been added to AutoPortal setting & there are settings for it in the AT 'Challenges' tab.")
	if (radonHZE === 175) debug("You have unlocked the Hypothermia challenge. It has now been added to AutoPortal setting & there are settings for it in the AT 'Challenges' tab.")
	if (radonHZE === 175) debug("You have unlocked the Glass challenge. It has now been added to Challenge 3 AutoPortal setting.")
}

var fastimps =
	[
		"Snimp",
		"Kittimp",
		"Gorillimp",
		"Squimp",
		"Shrimp",
		"Chickimp",
		"Frimp",
		"Slagimp",
		"Lavimp",
		"Kangarimp",
		"Entimp",
		"Fusimp",
		"Carbimp",
		"Ubersmith",
		"Shadimp",
		"Voidsnimp",
		"Prismimp",
		"Sweltimp",
		"Indianimp",
		"Improbability",
		"Neutrimp",
		"Cthulimp",
		"Omnipotrimp",
		"Mutimp",
		"Hulking_Mutimp",
		"Liquimp",
		"Poseidimp",
		"Darknimp",
		"Horrimp",
		"Arachnimp",
		"Beetlimp",
		"Mantimp",
		"Butterflimp",
		"Frosnimp"
	];

function remainingHealth() {
	var soldierHealth = game.global.soldierHealth
	if (game.global.universe == 2) {
		var maxLayers = Fluffy.isRewardActive('shieldlayer');
		var layers = maxLayers - game.global.shieldLayersUsed;
		var shieldHealth = 0;
		if (maxLayers > 0) {
			for (var i = 0; i <= maxLayers; i++) {
				if (layers != maxLayers && i > layers)
					continue;
				if (i == maxLayers - layers) {
					shieldHealth += game.global.soldierEnergyShieldMax;
				}
				else
					shieldHealth += game.global.soldierEnergyShield;
			}
		}
		else {
			shieldHealth = game.global.soldierEnergyShield;
		}
		shieldHealth = shieldHealth < 0 ? 0 : shieldHealth;
	}
	var remainingHealth = shieldHealth + (soldierHealth * .33);
	if (game.global.challengeActive == 'Quest' && questcheck() == 8)
		remainingHealth = shieldHealth;
	if (shieldHealth + soldierHealth == 0) {
		remainingHealth = game.global.soldierHealthMax + (game.global.soldierEnergyShieldMax * (maxLayers + 1))
		if (game.global.challengeActive == 'Quest' && questcheck() == 8)
			remainingHealth = game.global.soldierEnergyShieldMax * (maxLayers + 1);
	}

	return (remainingHealth)
}

function rManageEquality() {
	if (!game.global.preMapsActive && game.global.gridArray.length > 0) {

		//Looking to see if the enemy that's currently being fought is fast.
		var fastEnemy = game.global.preMapsActive ? fastimps.includes(game.global.gridArray[game.global.lastClearedCell + 1].name) : fastimps.includes(getCurrentEnemy().name);
		//Checking if the map that's active is a Deadly voice map which always has first attack.
		var voidDoubleAttack = game.global.mapsActive && getCurrentMapObject().location == "Void" && getCurrentMapObject().voidBuff == 'doubleAttack';
		//Checking if the Frenzy buff is active.
		var noFrenzy = game.portal.Frenzy.frenzyStarted == "-1" && !autoBattle.oneTimers.Mass_Hysteria.owned && game.portal.Frenzy.radLevel > 0;
		//Checking if the experience buff is active during Exterminate.
		var experienced = game.global.challengeActive == 'Exterminate' && game.challenges.Exterminate.experienced;
		//Checking to see if the Glass challenge is being run where all enemies are fast.
		var runningGlass = game.global.challengeActive == 'Glass';

		//Toggles equality scaling on
		if ((fastEnemy && !experienced) || voidDoubleAttack || noFrenzy || runningGlass) {
			if (!game.portal.Equality.scalingActive) {
				game.portal.Equality.scalingActive = true;
				manageEqualityStacks();
				updateEqualityScaling();
			}
			//Toggles equality scaling off and sets equality stacks to 0
		} else {
			if (game.portal.Equality.scalingActive) {
				game.portal.Equality.scalingActive = false;
				game.portal.Equality.disabledStackCount = "0";
				manageEqualityStacks();
				updateEqualityScaling();
			}
		}
	}
}

function autoMapLevel(special, maxLevel, minLevel, floorCrit) {
	if (game.global.universe === 1) return 0;
	if (maxLevel > 10) maxLevel = 10;
	if (game.global.world + maxLevel < 6) maxLevel = 0 - (game.global.world + 6);
	if (game.global.challengeActive === 'Wither' && maxLevel >= 0 && minLevel !== 0) maxLevel = -1;

	var maxLevel = typeof (maxLevel) === 'undefined' ? 10 : maxLevel;
	var minLevel = typeof (minLevel) === 'undefined' ? 0 - game.global.world + 6 : minLevel;
	var special = !special ? (game.global.highestRadonLevelCleared > 83 ? 'lmc' : 'smc') : special;
	var biome = !biome ? (game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountain") : biome;
	var floorCrit = !floorCrit ? false : floorCrit;
	var difficulty = 0.75;
	var runningQuest = game.global.challengeActive == 'Quest' && questcheck() == 8;
	var ourHealth = RcalcOurHealth(runningQuest) * 2;

	for (y = maxLevel; y >= minLevel; y--) {
		var mapLevel = y;
		var equalityAmt = equalityQuery(true, false, 'Snimp', game.global.world + mapLevel, 20, 'map', difficulty, true)
		var ourDmg = (RcalcOurDmg('min', equalityAmt, true, false, false, floorCrit, true)) * 2;
		if (game.global.challengeActive === 'Daily' && typeof game.global.dailyChallenge.weakness !== 'undefined') ourDmg *= (1 - (9 * game.global.dailyChallenge.weakness.strength) / 100)
		var enemyHealth = RcalcEnemyHealthMod(game.global.world + mapLevel, 20, 'Turtlimp', 'map', true) * difficulty;
		var enemyDmg = RcalcBadGuyDmg(null, RgetEnemyAvgAttack(game.global.world + mapLevel, 20, 'Snimp', 'map', true), equalityAmt, true, 'map', true) * 1.5 * difficulty;
		enemyDmg *= typeof game.global.dailyChallenge.explosive !== 'undefined' ? 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength) : 1
		//debug("Maplevel = " + y + " Equality = " + equalityAmt + " Our Damage = " + ourDmg);

		/* if (y === -2) {
			debug("Maplevel = " + y + " Equality = " + equalityAmt + " Our Damage = " + ourDmg);
			debug("Enemy dmg = " + enemyDmg + " + " + "Enemy health = " + enemyHealth)
		} */
		if ((game.resources.fragments.owned >= PerfectMapCost_Actual(mapLevel, special, biome) && enemyHealth <= ourDmg) && ((enemyDmg <= ourHealth))) {
			return mapLevel;
		}
		if (y === minLevel) {
			return minLevel;
		}
	}
}

function equalityQuery(query, forceGamma, name, zone, cell, mapType, difficulty, forceOneShot, floorCrit, checkMutations) {
	//Turning off equality scaling
	game.portal.Equality.scalingActive = false;
	//Misc vars

	var currentCell = !cell && mapping ? game.global.lastClearedMapCell : !cell ? game.global.lastClearedCell : cell - 2;
	var enemyName = !name ? game.global[mapGrid][currentCell + 1].name : name;

	var mapType = !mapType ? "world" : !mapType ? (getCurrentMapObject().location == "Void" ? "void" : "map") : mapType;
	var mapping = mapType === 'world' ? false : true;
	var zone = !zone && (mapType == "world" || !mapping) ? game.global.world : !zone ? getCurrentMapObject().level : zone;
	var mapGrid = game.global.mapsActive ? 'mapGridArray' : 'gridArray';
	var forceGamma = !forceGamma ? false : forceGamma;
	var forceOneShot = !forceOneShot ? false : forceOneShot;
	var query = !query ? false : query;
	var difficulty = !query && !difficulty && !mapping ? 1 : !query && !difficulty ? getCurrentMapObject().difficulty : difficulty ? difficulty : 1;

	//Challenge conditions
	var runningUnlucky = game.global.challengeActive == 'Unlucky';
	var runningTrappa = game.global.challengeActive === 'Trappapalooza' || game.global.challengeActive === 'Archaeology'
	var runningQuest = ((game.global.challengeActive == 'Quest' && questcheck() == 8) || game.global.challengeActive == 'Berserk');
	var runningGlass = game.global.challengeActive == 'Glass';
	var floorCrit = !floorCrit ? false : floorCrit;

	//Initialising name/health/dmg variables
	//Enemy stats
	var enemyName = !name ? game.global[mapGrid][currentCell + 1].name : name;
	if (enemyName === 'Improbability' && zone <= 58) enemyName = 'Blimp';
	var enemyHealth = !query ? game.global[mapGrid][currentCell + 1].health : RcalcEnemyHealthMod(zone, currentCell + 2, enemyName, mapType, true) * difficulty;
	var enemyAttack = !query && getCurrentEnemy() ? getCurrentEnemy().attack * RcalcBadGuyDmgMod(true) :
		RcalcBadGuyDmg(null, RgetEnemyAvgAttack(zone, currentCell + 2, enemyName, mapType, query), 0, query, mapType, mapping);
	var enemyDmg = RcalcBadGuyDmg(null, RgetEnemyAvgAttack(zone, currentCell + 2, enemyName, mapType, query), 0, query, mapType, mapping) * difficulty == enemyAttack ? RcalcBadGuyDmg(null, RgetEnemyAvgAttack(zone, currentCell + 2, enemyName, mapType, query), 0, query, mapType, mapping) * 1.5 * difficulty : enemyAttack * 1.5 * difficulty;
	var enemyDmg = query ? RcalcBadGuyDmg(null, RgetEnemyAvgAttack(zone, currentCell + 2, enemyName, mapType, query), 0, query, mapType, mapping) * difficulty * 1.5 : enemyDmg;
	enemyDmg *= mapType === 'map' && typeof game.global.dailyChallenge.explosive !== 'undefined' ? 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength) : 1
	if (!query || mapType === 'void') enemyDmg *= game.global.voidBuff == 'doubleAttack' ? 2 : game.global.voidBuff == 'getCrit' ? 4 : 1;
	var enemyDmgEquality = 0;
	var bionicTalent = mapping && game.talents.bionic2.purchased && zone > game.global.world ? 1.5 : 1;
	//Our stats
	var ourHealth = query ? RcalcOurHealth(runningQuest) : remainingHealth();
	var ourHealthMax = RcalcOurHealth(runningQuest)
	var ourDmg = RcalcOurDmg('min', 0, mapping, false, false, floorCrit, true) * bionicTalent;

	if (game.global.challengeActive === 'Daily' && typeof game.global.dailyChallenge.weakness !== 'undefined') ourDmg *= (1 - (9 * game.global.dailyChallenge.weakness.strength) / 100)

	if (forceOneShot) ourDmg *= 2;
	var ourDmgEquality = 0;
	//Figuring out gamma burst stacks to proc and dmg bonus
	var gammaToTrigger = forceGamma ? 0 : forceOneShot ? 999 : (autoBattle.oneTimers.Burstier.owned ? 4 : 5) - game.heirlooms.Shield.gammaBurst.stacks;
	var gammaDmg = gammaBurstPct;
	var fastEnemy = fastimps.includes(enemyName);
	if (!checkMutations && game.global.mapsActive && game.talents.mapHealth.purchased) ourHealthMax *= 2;
	if (query && mapType === 'map' && game.talents.mapHealth.purchased) ourHealth *= 2;


	if (checkMutations) {
		ourDmg = RcalcOurDmg('min', 0, false, false, false, false, false, true);
		enemyDmg = RcalcBadGuyDmg(null, RgetEnemyAvgAttack(game.global.world, currentCell + 2, enemyName, 'world', false), 0, true, 'world', false, true);
		enemyHealth = RcalcEnemyHealthMod(game.global.world, currentCell + 2, enemyName, null, false, true);
		fastEnemy = true;
	}

	if (enemyHealth !== 0 && enemyHealth !== -1) {
		for (var i = 0; i <= game.portal.Equality.radLevel; i++) {
			enemyDmgEquality = enemyDmg * Math.pow(game.portal.Equality.getModifier(), i) * (runningTrappa ? 1.25 : 1);
			ourDmgEquality = ourDmg * Math.pow(game.portal.Equality.getModifier(1), i);
			if (runningUnlucky) {
				var unluckyDmg = Number(RcalcOurDmg('min', i, mapping, false, true, floorCrit, true) * bionicTalent)
				ourDmgEquality = RcalcOurDmg('min', i, mapping, false, false, floorCrit, true) * bionicTalent;
				if (forceOneShot) ourDmgEquality *= 2;
				if (unluckyDmg.toString()[0] % 2 == 1) {
					/* debug(i) */
					continue;
				}
			}
			if (!fastEnemy && !runningGlass && !runningTrappa && game.global.voidBuff != 'doubleAttack' && !runningQuest) {
				return i;
			}
			else if (ourHealth >= enemyDmgEquality && gammaToTrigger <= 1) {
				if (query) {
					return i;
				}
				return i;
			}
			else if (ourDmgEquality > enemyHealth && ourHealth > enemyDmgEquality) {
				/* console.log("enemy dmg =" + enemyDmgEquality)
				console.log("enemy health =" + enemyHealth)
				console.log("our dmg =" + ourDmgEquality)
				console.log("our health =" + ourHealth)
				console.log(i); */
				return i;
			}
			else if (!forceOneShot && ourDmgEquality * gammaDmg > enemyHealth && ourHealth >= enemyDmgEquality * 2 && gammaToTrigger == 2) {
				return i;
			}
			else if (!forceOneShot && ourDmgEquality * 2 > enemyHealth && ourHealth >= enemyDmgEquality * 2) {
				return i;
			}
			else if (!forceOneShot && ourDmgEquality * gammaDmg > enemyHealth && ourHealth >= enemyDmgEquality * 3 && gammaToTrigger == 3) {
				return i;
			}
			else if (!forceOneShot && ourDmgEquality * 3 > enemyHealth && ourHealth >= enemyDmgEquality * 3) {
				return i;
			}
			else if (!forceOneShot && ourDmgEquality * gammaDmg > enemyHealth && ourHealth >= enemyDmgEquality * 4 && gammaToTrigger == 4) {
				return i;
			}
			else if (!forceOneShot && ourHealth >= enemyDmgEquality * 4 && gammaToTrigger == 4) {
				return i;
			}
			else if (!forceOneShot && ourHealth >= enemyDmgEquality * 3 && gammaToTrigger == 3) {
				return i;
			}
			else if (!forceOneShot && ourHealth >= enemyDmgEquality * 2 && gammaToTrigger == 2) {
				return i;
			}
			else if (!forceOneShot && ourHealth >= enemyDmgEquality && gammaToTrigger <= 1) {
				return i;
			}
			else if (!forceOneShot && ourHealth >= enemyDmgEquality && gammaToTrigger == 0) {
				return i;
			}
			else if (i === game.portal.Equality.radLevel) {
				return i;
			}
		}
	}
}

//Auto Equality
function equalityManagement() {
	if (!game.global.preMapsActive && game.global.gridArray.length > 0) {
		//Turning off equality scaling
		game.portal.Equality.scalingActive = false;
		//Misc vars
		var debugStats = false;
		var mapping = game.global.mapsActive ? true : false;
		var currentCell = mapping ? game.global.lastClearedMapCell + 1 : game.global.lastClearedCell + 1;
		var mapGrid = mapping ? 'mapGridArray' : 'gridArray';
		var type = (!mapping) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
		var zone = (type == "world" || !mapping) ? game.global.world : getCurrentMapObject().level;
		var bionicTalent = mapping && game.talents.bionic2.purchased && zone > game.global.world ? 1.5 : 1;

		//Daily modifiers active
		var dailyEmpower = game.global.challengeActive === 'Daily' && typeof game.global.dailyChallenge.empower !== 'undefined' //Empower
		var dailyReflect = game.global.challengeActive === 'Daily' && typeof game.global.dailyChallenge.mirrored !== 'undefined'; //Reflect
		var dailyCrit = game.global.challengeActive === 'Daily' && typeof game.global.dailyChallenge.crits !== 'undefined'; //Crit
		var dailyExplosive = game.global.challengeActive === 'Daily' && typeof game.global.dailyChallenge.explosive !== 'undefined'; //Dmg on death
		var dailyWeakness = game.global.challengeActive === 'Daily' && typeof game.global.dailyChallenge.weakness !== 'undefined'; //% dmg reduction on hit

		//Challenge conditions
		var runningUnlucky = game.global.challengeActive == 'Unlucky';
		var runningTrappa = game.global.challengeActive === 'Trappapalooza';
		var runningQuest = ((game.global.challengeActive == 'Quest' && questcheck() == 8)); //Shield break quest
		var runningArchaeology = game.global.challengeActive === 'Archaeology';
		var runningMayhem = game.global.challengeActive === 'Mayhem';
		var runningBerserk = game.global.challengeActive == 'Berserk';
		var runningExperienced = game.global.challengeActive == 'Exterminate' && game.challenges.Exterminate.experienced;
		var runningGlass = game.global.challengeActive == 'Glass';
		var runningSmithless = game.global.challengeActive == "Smithless" && !mapping && game.global.world % 25 === 0 && game.global.lastClearedCell == -1 && game.global.gridArray[0].ubersmith; //If UberSmith is active and not in a map

		//Perk conditions
		var noFrenzy = game.portal.Frenzy.radLevel > 0 && !autoBattle.oneTimers.Mass_Hysteria.owned && game.portal.Frenzy.frenzyStarted == "-1";

		//Gamma burst info
		var gammaMaxStacks = gammaBurstPct === 1 ? 0 : autoBattle.oneTimers.Burstier.owned ? 4 : 5
		var gammaToTrigger = gammaMaxStacks - game.heirlooms.Shield.gammaBurst.stacks;
		var gammaDmg = gammaBurstPct;
		var fuckGamma = (dailyReflect || (runningSmithless && (10 - game.challenges.Smithless.uberAttacks) > gammaToTrigger));

		//Initialising Stat variables
		//Our stats
		var ourHealth = remainingHealth();
		var ourHealthMax = RcalcOurHealth(runningQuest)
		if (game.global.mapsActive && game.talents.mapHealth.purchased) ourHealthMax *= 2;
		var ourDmg = RcalcOurDmg('min', 0, mapping, true, false, debugStats) * bionicTalent;
		var ourDmgEquality = 0;

		//Enemy stats
		var enemyName = game.global[mapGrid][currentCell].name;
		var enemyHealth = game.global[mapGrid][currentCell].health;
		var enemyDmg = getCurrentEnemy().attack * RcalcBadGuyDmgMod() * 1.5;
		enemyDmg *= game.global.voidBuff == 'doubleAttack' ? 2 : (game.global.voidBuff == 'getCrit' && (gammaToTrigger > 1 || runningBerserk || runningTrappa || runningArchaeology || runningQuest)) ? 4 : 1;
		enemyDmg *= !mapping && dailyCrit && dailyEmpower ? dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength) : 1;
		enemyDmg *= type === 'map' && mapping && dailyExplosive ? 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength) : 1
		enemyDmg *= (type === 'world' || type === 'void') && dailyCrit && gammaToTrigger > 1 ? 1 + dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength) : 1
		enemyDmg *= runningMayhem && ((!mapping && currentCell === 99) || mapping) ? 1.2 : 1
		var enemyDmgEquality = 0;

		//Fast Enemy conditions
		var fastEnemy = !game.global.preMapsActive && fastimps.includes(enemyName);
		if (type === 'world' && game.global.world > 200 && game.global.gridArray[currentCell].u2Mutation.length > 0) fastEnemy = true;
		if (!mapping && (dailyEmpower || runningSmithless)) fastEnemy = true;
		if (type === 'map' && dailyExplosive) fastEnemy = true;
		if (game.global.voidBuff === 'doubleAttack') fastEnemy = true
		if (runningArchaeology) fastEnemy = true;
		if (noFrenzy) fastEnemy = true;
		if (runningExperienced) fastEnemy = false;
		if (runningGlass) fastEnemy = true;

		//Misc dmg mult
		if (dailyWeakness) ourDmg *= (1 - ((game.global.dailyChallenge.weakness.stacks + (fastEnemy ? 1 : 0)) * game.global.dailyChallenge.weakness.strength) / 100)

		if (enemyHealth !== 0 && enemyHealth !== -1) {
			for (var i = 0; i <= game.portal.Equality.radLevel; i++) {
				enemyDmgEquality = enemyDmg * Math.pow(game.portal.Equality.getModifier(), i);
				ourDmgEquality = ourDmg * Math.pow(game.portal.Equality.getModifier(1), i);

				if (runningMayhem && fastEnemy) enemyDmgEquality += game.challenges.Mayhem.poison;

				if (runningUnlucky) {
					ourDmgEquality = RcalcOurDmg('min', i, mapping, true) * bionicTalent;
					if (Number(RcalcOurDmg('min', i, mapping, true, true, true) * bionicTalent).toString()[0] % 2 == 1)
						continue;
				}

				if (!fastEnemy && !runningGlass && !runningBerserk && !runningTrappa && !runningArchaeology && !runningQuest) {
					game.portal.Equality.disabledStackCount = i;
					if (!document.getElementById('equalityStacks').children[0].innerHTML.includes(game.portal.Equality.disabledStackCount)) manageEqualityStacks();
					updateEqualityScaling();
					break;
				}
				else if (ourHealth < (ourHealthMax * 0.75) && gammaToTrigger == gammaMaxStacks && !runningTrappa && !runningArchaeology && !runningBerserk) {
					if ((runningQuest) || !mapping) {
						mapsClicked();
						mapsClicked();
					}
					else if (mapping && currentCell > 0 && type !== 'void' && game.global.titimpLeft == 0) {
						mapsClicked();
						rRunMap();
					}
					else
						game.portal.Equality.disabledStackCount = 0;
					if (!document.getElementById('equalityStacks').children[0].innerHTML.includes(game.portal.Equality.disabledStackCount)) manageEqualityStacks();
					updateEqualityScaling();
					break;
				} else if (fastEnemy && enemyDmgEquality > ourHealth) {
					game.portal.Equality.disabledStackCount = game.portal.Equality.radLevel;
					if (!document.getElementById('equalityStacks').children[0].innerHTML.includes(game.portal.Equality.disabledStackCount)) manageEqualityStacks();
					updateEqualityScaling();
				} else if ((ourDmgEquality * gammaDmg) < enemyHealth && (gammaToTrigger > 1 || (gammaToTrigger > 1 && fuckGamma))) {
					game.portal.Equality.disabledStackCount = game.portal.Equality.radLevel;
					if (!document.getElementById('equalityStacks').children[0].innerHTML.includes(game.portal.Equality.disabledStackCount)) manageEqualityStacks();
					updateEqualityScaling();
					break;
				} else if (ourHealth > enemyDmgEquality && gammaToTrigger <= 1) {
					game.portal.Equality.disabledStackCount = i;
					if (debugStats) queryAutoEqualityStats(ourDmgEquality, ourHealth, enemyDmgEquality, enemyHealth, i)
					if (!document.getElementById('equalityStacks').children[0].innerHTML.includes(game.portal.Equality.disabledStackCount)) manageEqualityStacks();
					updateEqualityScaling();
					break;
				} else if (ourHealth > enemyDmgEquality && ourDmgEquality > enemyHealth) {
					game.portal.Equality.disabledStackCount = i;
					if (!document.getElementById('equalityStacks').children[0].innerHTML.includes(game.portal.Equality.disabledStackCount)) manageEqualityStacks();
					updateEqualityScaling();
					break;
				} else if (ourHealth > (enemyDmgEquality * gammaToTrigger) && ourDmgEquality * gammaDmg > enemyHealth && !fuckGamma) {
					game.portal.Equality.disabledStackCount = i;
					if (!document.getElementById('equalityStacks').children[0].innerHTML.includes(game.portal.Equality.disabledStackCount)) manageEqualityStacks();
					updateEqualityScaling();
					break;
				} else if (ourHealth > (enemyDmgEquality * gammaToTrigger) && ourDmgEquality * gammaToTrigger > enemyHealth && !fuckGamma) {
					game.portal.Equality.disabledStackCount = i;
					if (!document.getElementById('equalityStacks').children[0].innerHTML.includes(game.portal.Equality.disabledStackCount)) manageEqualityStacks();
					updateEqualityScaling();
					break;
				} else if (ourHealth > (enemyDmgEquality * gammaToTrigger) && !fuckGamma) {
					game.portal.Equality.disabledStackCount = i;
					if (!document.getElementById('equalityStacks').children[0].innerHTML.includes(game.portal.Equality.disabledStackCount)) manageEqualityStacks();
					updateEqualityScaling();
					break;
				} else {
					game.portal.Equality.disabledStackCount = game.portal.Equality.radLevel;
				}
			}
		}
	}
}

function queryAutoEqualityStats(ourDamage, ourHealth, enemyDmgEquality, enemyHealth, equalityStacks, dmgMult) {
	debug("Our dmg (min) = " + ourDamage)
	debug("Our dmg (min) * gammaDmg = " + ourDamage * gammaBurstPct)
	debug("Our health = " + ourHealth)
	debug("Enemy dmg = " + enemyDmgEquality)
	debug("Enemy health = " + enemyHealth)
	debug("Equality = " + equalityStacks)
	if (dmgMult) debug("Mult = " + dmgMult)
}

function reflectShouldBuyEquips() {
	//Daily Shred variables
	if (game.global.challengeActive === 'Daily') {
		if (typeof (game.global.dailyChallenge.mirrored) !== 'undefined') {
			var ourHealth = RcalcOurHealth();
			var ourDamage = RcalcOurDmg('max', game.portal.Equality.radLevel, false, false, false, true)
			var gammaToTrigger = autoBattle.oneTimers.Burstier.owned ? 4 : 5;
			var reflectPct = dailyModifiers.mirrored.getMult(game.global.dailyChallenge.mirrored.strength);
			var critChance = (getPlayerCritChance() - Math.floor(getPlayerCritChance())) * 100
			if (!(game.portal.Tenacity.getMult() === Math.pow(1.4000000000000001, getPerkLevel("Tenacity") + getPerkLevel("Masterfulness")))) {
				ourDamage /= game.portal.Tenacity.getMult();
				ourDamage *= Math.pow(1.4000000000000001, getPerkLevel("Tenacity") + getPerkLevel("Masterfulness"));
			}
			if (typeof game.global.dailyChallenge.empower !== 'undefined' || critChance > 30) {
				ourDamage /= RgetCritMulti(true);
				ourDamage *= RgetCritMulti(false, false, true);
			}
			if (ourDamage * ((1 + (reflectPct * gammaToTrigger))) > ourHealth) {
				return true
			}
			else {
				return false;
			}
		}
	}
}

function* finder(array, item) {
	let index = -1;
	while ((index = array.indexOf(item, index + 1)) > -1) {
		yield index;
	}
	return -1;
}

function simpleSecondsLocal(what, seconds, event, ssWorkerRatio) {
	var event = !event ? null : event;
	var ssWorkerRatio = !ssWorkerRatio ? null : ssWorkerRatio;

	if (typeof ssWorkerRatio !== 'undefined' && ssWorkerRatio !== null) {
		var desiredRatios = Array.from(ssWorkerRatio.split(','))
		desiredRatios = [desiredRatios[0] !== undefined ? parseInt(desiredRatios[0]) : 0,
		desiredRatios[1] !== undefined ? parseInt(desiredRatios[1]) : 0,
		desiredRatios[2] !== undefined ? parseInt(desiredRatios[2]) : 0,
		desiredRatios[3] !== undefined ? parseInt(desiredRatios[3]) : 0]
		var totalFraction = desiredRatios.reduce((a, b) => { return a + b; });
	}
	//Come home to the impossible flavour of balanced resource gain. Come home, to simple seconds.
	var jobName;
	var pos;
	switch (what) {
		case "food":
			jobName = "Farmer";
			pos = 0
			break;
		case "wood":
			jobName = "Lumberjack";
			pos = 1
			break;
		case "metal":
			jobName = "Miner";
			pos = 2
			break;
		case "gems":
			jobName = "Dragimp";
			break;
		case "fragments":
			jobName = "Explorer";
			break;
		case "science":
			jobName = "Scientist";
			pos = 3
			break;
	}
	var heirloom = !jobName ? null :
		jobName == "Miner" && game.challengeActive == "Pandemonium" && getPageSetting("RhsPandStaff") !== 'undefined' ? "RhsPandStaff" :
			jobName == "Farmer" && getPageSetting("RhsFoodStaff") != 'undefined' ? "RhsFoodStaff" :
				jobName == "Lumberjack" && getPageSetting("RhsWoodStaff") != 'undefined' ? "RhsWoodStaff" :
					jobName == "Miner" && getPageSetting("RhsMetalStaff") != 'undefined' ? "RhsMetalStaff" :
						getPageSetting("RhsMapStaff") != 'undefined' ? "RhsMapStaff" :
							getPageSetting("RhsWorldStaff") != 'undefined' ? "RhsWorldStaff" :
								null;
	var job = game.jobs[jobName];
	var trimpworkers = ((game.resources.trimps.realMax() / 2) - game.jobs.Explorer.owned - game.jobs.Meteorologist.owned - game.jobs.Worshipper.owned);
	var workers = game.global.challengeActive == "Pandemonium" && jobName == "Miner" ? (trimpworkers / 1000) * 997.90440075 :
		ssWorkerRatio !== null ? Math.floor(trimpworkers * desiredRatios[pos] / totalFraction) :
			rShouldWorshipperFarm ? trimpworkers :
				job.owned;

	var amt_local = workers * job.modifier * seconds;
	amt_local += (amt_local * getPerkLevel("Motivation") * game.portal.Motivation.modifier);
	if (what != "gems" && game.permaBoneBonuses.multitasking.owned > 0 && (game.resources.trimps.owned >= game.resources.trimps.realMax()))
		amt_local *= (1 + game.permaBoneBonuses.multitasking.mult());
	if (what != "science" && what != "fragments" && game.global.challengeActive == "Alchemy")
		amt_local *= alchObj.getPotionEffect("Potion of Finding");
	if (game.global.pandCompletions && game.global.universe == 2 && what != "fragments")
		amt_local *= game.challenges.Pandemonium.getTrimpMult();
	if (getPerkLevel("Observation") > 0 && game.portal.Observation.trinkets > 0)
		amt_local *= game.portal.Observation.getMult();

	if (what == "food" || what == "wood" || what == "metal") {
		amt_local *= getParityBonus();
		if (autoBattle.oneTimers.Gathermate.owned)
			amt_local *= autoBattle.oneTimers.Gathermate.getMult();
	}
	if ((what == "food" && game.buildings.Antenna.owned >= 5) || (what == "metal" && game.buildings.Antenna.owned >= 15))
		amt_local *= game.jobs.Meteorologist.getExtraMult();
	if (Fluffy.isRewardActive('gatherer'))
		amt_local *= 2;
	if (what == "wood" && game.global.challengeActive == "Hypothermia")
		amt_local *= game.challenges.Hypothermia.getWoodMult();
	if (game.global.challengeActive == "Unbalance")
		amt_local *= game.challenges.Unbalance.getGatherMult();

	if (game.global.challengeActive == "Daily") {
		if (typeof game.global.dailyChallenge.famine !== 'undefined' && what != "fragments" && what != "science")
			amt_local *= dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
		if (typeof game.global.dailyChallenge.dedication !== 'undefined')
			amt_local *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
	}
	if (game.global.challengeActive == "Melt") {
		amt_local *= 10;
		amt_local *= Math.pow(game.challenges.Melt.decayValue, game.challenges.Melt.stacks);
	}

	if (game.challenges.Nurture.boostsActive())
		amt_local *= game.challenges.Nurture.getResourceBoost();

	if (!getPageSetting('Rhs') || event == null || heirloom == null || game.global.StaffEquipped.name == autoTrimpSettings[heirloom].value) {
		amt_local = calcHeirloomBonus("Staff", jobName + "Speed", amt_local);
	}
	//Calculating proper value for the staff we should be using instead of equipped
	else if (event != null && game.global.StaffEquipped != getPageSetting(heirloom)) {
		if (what == "food" || what == "wood" || what == "metal") {
			amt_local /= getParityBonus();
			amt_local *= getHazardParityMult(HeirloomSearch(heirloom)) > 0 ? getHazardParityMult(HeirloomSearch(heirloom)) : 1
		}
		amt_local = calcHeirloomBonusLocal(HeirloomModSearch(heirloom, jobName + "Speed"), amt_local);
	}
	var turkimpBonus = game.talents.turkimp2.purchased ? 2 : game.talents.turkimp2.purchased ? 1.75 : 1.5;

	if ((game.talents.turkimp2.purchased || game.global.turkimpTimer > 0) && (what == "food" || what == "metal" || what == "wood")) {
		amt_local *= turkimpBonus;
		amt_local += getPlayerModifier() * seconds;
	}
	return amt_local;
}

function calcHeirloomBonusLocal(mod, number) {
	var mod = mod;
	if (!mod) return;

	return (number * ((mod / 100) + 1));
}

function scaleToCurrentMapLocal(amt_local, ignoreBonuses, ignoreScry, map) {
	var map = !map && game.global.challengeActive == "Pandemonium" ? game.global.world - 1 :
		!map ? game.global.world :
			game.global.world + map;
	var compare = game.global.world;
	if (map > compare && map.location != "Bionic") {
		amt_local *= Math.pow(1.1, (map - compare));
	} else {
		if (game.talents.mapLoot.purchased)
			compare--;
		if (map < compare) {
			//-20% loot compounding for each level below world
			amt_local *= Math.pow(0.8, (compare - map));
		}
	}
	var maploot = game.global.mapsActive ? getCurrentMapObject().loot : game.global.farmlandsUnlocked && game.singleRunBonuses.goldMaps.owned ? 3.6 : game.global.decayDone && game.singleRunBonuses.goldMaps.owned ? 2.85 : game.global.farmlandsUnlocked ? 2.6 : game.global.decayDone ? 1.85 : 1.6;
	//Add map loot bonus
	amt_local = Math.round(amt_local * maploot);
	if (ignoreBonuses) return amt_local;
	amt_local = scaleLootBonuses(amt_local, ignoreScry);
	return amt_local;
}

function formatTimeForDescriptions(number) {
	var text;
	var seconds = Math.floor((number) % 60);
	var minutes = Math.floor((number / 60) % 60);
	var hours = Math.floor((number / 60 / 60));
	if (minutes <= 0 && hours <= 0) text = seconds + " second" + ((seconds == 1) ? "" : "s");
	else if (hours == 0) text = minutes + " minute" + ((minutes == 1) ? " " : "s ") + seconds + " second" + ((seconds == 1) ? "" : "s");
	else {
		text = hours + " hour" + ((hours == 1) ? " " : "s ") + minutes + " minute" + ((minutes == 1) ? " " : "s ") + seconds + " second" + ((seconds == 1) ? "" : "s");
	}
	return text;
}

function timeForFormatting(number) {
	return Math.floor((getGameTime() - number) / 1000);
}

function calculateMaxAffordLocal(itemObj, isBuilding, isEquipment, isJob, forceMax, forceRatio, resources) {
	if (!itemObj.cost) return 1;
	var forcedMax = 0;
	var mostAfford = -1;
	if (Number.isInteger(forceMax)) forcedMax = forceMax;
	//if (!forceMax) var forceMax = false;
	var forceMax = Number.isInteger(forceMax) ? forceMax : false;
	var currentOwned = (itemObj.purchased) ? itemObj.purchased : ((itemObj.level) ? itemObj.level : itemObj.owned);
	if (!currentOwned) currentOwned = 0;
	if (isJob && game.global.firing && !forceRatio) return Math.floor(currentOwned * game.global.maxSplit);
	//if (itemObj == game.equipment.Shield) console.log(currentOwned);
	for (var item in itemObj.cost) {
		var price = itemObj.cost[item];
		var toBuy;
		var resource = game.resources[item];
		var resourcesAvailable = !resources ? resource.owned : resources;
		if (resourcesAvailable < 0) resourcesAvailable = 0;
		if (game.global.maxSplit != 1 && !forceMax && !forceRatio) resourcesAvailable = Math.floor(resourcesAvailable * game.global.maxSplit);
		else if (forceRatio) resourcesAvailable = Math.floor(resourcesAvailable * forceRatio);

		if (item === 'fragments') resourcesAvailable = autoTrimpSettings.rBuildingSettingsArray.value.SafeGateway.zone !== 0 && game.global.world >= autoTrimpSettings.rBuildingSettingsArray.value.SafeGateway.zone ? resourcesAvailable :
			autoTrimpSettings.rBuildingSettingsArray.value.SafeGateway.enabled && resourcesAvailable > resource.owned - (PerfectMapCost_Actual(10, 'lmc') * autoTrimpSettings.rBuildingSettingsArray.value.SafeGateway.mapCount) ? resource.owned - (PerfectMapCost_Actual(10, 'lmc') * autoTrimpSettings.rBuildingSettingsArray.value.SafeGateway.mapCount) :
				resourcesAvailable;
		if (!resource || typeof resourcesAvailable === 'undefined') {
			console.log("resource " + item + " not found");
			return 1;
		}
		if (typeof price[1] !== 'undefined') {
			var start = price[0];
			if (isEquipment) {
				var artMult = getEquipPriceMult();
				start = Math.ceil(start * artMult);
			}
			if (isBuilding && getPerkLevel("Resourceful")) start = start * (Math.pow(1 - game.portal.Resourceful.modifier, getPerkLevel("Resourceful")));
			toBuy = Math.floor(log10(((resourcesAvailable / (start * Math.pow(price[1], currentOwned))) * (price[1] - 1)) + 1) / log10(price[1]));

		}
		else if (typeof price === 'function') {
			return 1;
		}
		else {
			if (isBuilding && getPerkLevel("Resourceful")) price = Math.ceil(price * (Math.pow(1 - game.portal.Resourceful.modifier, getPerkLevel("Resourceful"))));
			toBuy = Math.floor(resourcesAvailable / price);
		}
		if (mostAfford == -1 || mostAfford > toBuy) mostAfford = toBuy;
	}
	if (forceRatio && (mostAfford <= 0 || isNaN(mostAfford))) return 0;
	if (isBuilding && mostAfford > 1000000000) return 1000000000;
	if (mostAfford <= 0) return 1;
	if (forceMax !== false && mostAfford > forceMax) return forceMax;
	if (isJob && itemObj.max && itemObj.owned + mostAfford > itemObj.max) return (itemObj.max - itemObj.owned);
	return mostAfford;
}

function boneShrineOutput(charges) {
	if (game.permaBoneBonuses.boosts.charges <= 0) return;

	charges = !charges ? 0 : charges;

	var eligible = ["food", "wood", "metal"];
	var storage = ["Barn", "Shed", "Forge"];
	var rewarded = [0, 0, 0];
	var hasNeg = false;
	for (var x = 0; x < eligible.length; x++) {
		var resName = eligible[x];
		var resObj = game.resources[resName];
		var amt = simpleSeconds(resName, (game.permaBoneBonuses.boosts.timeGranted() * 60));
		amt = scaleLootBonuses(amt, true);
		amt *= charges
		var tempMax = resObj.max;
		var packMod = getPerkLevel("Packrat") * game.portal.Packrat.modifier;
		var newTotal = resObj.owned + amt;
		while (newTotal > calcHeirloomBonus("Shield", "storageSize", tempMax + (tempMax * packMod))) {
			var nextCost = calculatePercentageBuildingCost(storage[x], resName, 0.25, tempMax);
			if (newTotal < nextCost) break;
			newTotal -= nextCost;
			amt -= nextCost;
			tempMax *= 2;
		}
		rewarded[x] = amt;
		if (amt < 0) hasNeg = true;
	}
	var text = prettify(rewarded[0]) + " Food, " + prettify(rewarded[1]) + " Wood, and " + prettify(rewarded[2]) + " Metal."

	return text;
}

function PerfectMapCost_Actual(plusLevel, specialModifier, biome) {
	if (!specialModifier) return Infinity
	if (!plusLevel) return Infinity
	var specialModifier = specialModifier;
	var plusLevel = plusLevel;
	var baseCost = 27;
	var mapLevel = game.global.world;
	if (plusLevel < 0)
		mapLevel = mapLevel - plusLevel;
	if (mapLevel < 6)
		mapLevel = 6;
	baseCost *= (game.global.world >= 60) ? 0.74 : 1;
	baseCost += 6
	if (plusLevel > 0)
		baseCost += (plusLevel * 10)
	if (specialModifier != "0")
		baseCost += 18
	baseCost += mapLevel;
	baseCost = Math.floor((((baseCost / 150) * (Math.pow(1.14, baseCost - 1))) * mapLevel * 2) * Math.pow((1.03 + (mapLevel / 50000)), mapLevel));
	baseCost *= biome !== 'Random' ? 2 : 1;
	return baseCost;
}

function runAtlantrimp() {
	if (!game.global.preMapsActive && !game.global.mapsActive)
		mapsClicked();
	if (game.global.mapsActive && getCurrentMapObject().name !== 'Atlantrimp') {
		mapsClicked();
		recycleMap();
	}
	if (game.global.preMapsActive) {
		for (var map in game.global.mapsOwnedArray) {
			if (game.global.mapsOwnedArray[map].name == 'Atlantrimp') {
				selectMap(game.global.mapsOwnedArray[map].id)
				rRunMap();
				debug('Running Atlantrimp');
				rBSRunningAtlantrimp = true;
			}
		}
	}
}

function ABItemSwap(items, ring) {
	items = !items ? false : items;
	ring = !ring ? false : ring;
	var changeitems = false;
	if (items) {
		if (changeitems = true) {
			for (var item in autoBattle.items) {
				if (autoBattle.items[item].equipped) {
					autoBattle.items[item].equipped = false;
					changeitems = false;
				}
			}
		}
		for (var item of items) {
			if (autoBattle.items[item].equipped == false) {
				changeitems = true;
				if (autoBattle.items[item].hidden)
					autoBattle.items[item].hidden = false;
				autoBattle.items[item].equipped = true;
			}
		}
	}

	if (ring) {
		autoBattle.rings.mods = ring;
	}
}

function automateSpireAssault() {

	if (autoBattle.maxEnemyLevel < 100 && autoBattle.items.Stormbringer.owned && autoBattle.items.Nullifium_Armor.owned && autoBattle.items.Haunted_Harpoon.owned) {
		if (autoBattle.items.Stormbringer.owned && autoBattle.items.Stormbringer.level < 5)
			autoBattle.upgrade('Stormbringer')
		if (autoBattle.items.Nullifium_Armor.owned && autoBattle.items.Nullifium_Armor.level < 4)
			autoBattle.upgrade('Nullifium_Armor')
		if (autoBattle.items.Haunted_Harpoon.owned && autoBattle.items.Haunted_Harpoon.level < 3)
			autoBattle.upgrade('Haunted_Harpoon')
	}
	if (autoBattle.enemyLevel === 109 && autoBattle.items.Haunted_Harpoon.level === 5 && autoBattle.rings.level === 36 && autoBattle.shards >= autoBattle.upgradeCost('Haunted_Harpoon'))
		autoBattle.upgrade('Haunted_Harpoon')

	if (autoBattle.enemyLevel === 117) {
		if (autoBattle.rings.level < 40 && autoBattle.shards >= autoBattle.getRingLevelCost()) {
			autoBattle.levelRing();
			if (autoBattle.rings.level === 40 && autoBattle.bonuses.Extra_Limbs.level === 11) {
				var items = [['Menacing_Mask'], ['Lifegiving_Gem'], ['Shock_and_Awl'], ['Spiked_Gloves'], ['Wired_Wristguards'], ['Sacrificial_Shank'], ['Grounded_Crown'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Blessed_Protector'], ['Doppelganger_Signet'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']];
				var ring = ['attack', 'lifesteal']
				ABItemSwap(items, ring);
				autoBattle.popup(true, false, true);
				autoBattle.resetCombat();
			}
		}
	}
	if (autoBattle.enemyLevel === 121) {
		if (autoBattle.rings.level === 45 && autoBattle.items.Omni_Enhancer.level === 10 && autoBattle.shards >= autoBattle.upgradeCost('Omni_Enhancer')) {
			autoBattle.upgrade('Omni_Enhancer');
		}
		if (autoBattle.rings.level === 45 && autoBattle.shards >= autoBattle.getRingLevelCost()) {
			autoBattle.levelRing();
		}
	}
	if (autoBattle.rings.level < 40) {
		if (autoBattle.enemyLevel == 92) { //6s kills - 2.14h cleartime
			var items = ['Rusty_Dagger', 'Bad_Medkit', 'Shock_and_Awl', 'Spiked_Gloves', 'Bloodstained_Gloves', 'Big_Cleaver', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 93) { //5.47s kills - 2h cleartime
			var items = ['Rusty_Dagger', 'Bad_Medkit', 'Shock_and_Awl', 'Spiked_Gloves', 'Bloodstained_Gloves', 'Fearsome_Piercer', 'Bag_of_Nails', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['lifesteal', 'health']
		}
		if (autoBattle.enemyLevel == 94) { //6.3s killtime - 2.3h cleartime
			var items = ['Rusty_Dagger', 'Shock_and_Awl', 'Spiked_Gloves', 'Wired_Wristguards', 'Aegis', 'Bloodstained_Gloves', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'lifesteal']
		}
		if (autoBattle.enemyLevel == 95) { //6.4s killtime - 2.4h cleartime
			var items = ['Rusty_Dagger', 'Bad_Medkit', 'Shock_and_Awl', 'Spiked_Gloves', 'Bloodstained_Gloves', 'Big_Cleaver', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 96) { //7.2s killtime - 2.7h cleartime
			var items = ['Rusty_Dagger', 'Shock_and_Awl', 'Spiked_Gloves', 'Wired_Wristguards', 'Aegis', 'Bloodstained_Gloves', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 97) { //6s killtime - 2.3h cleartime
			var items = ['Rusty_Dagger', 'Shock_and_Awl', 'Spiked_Gloves', 'Wired_Wristguards', 'Aegis', 'Bloodstained_Gloves', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 98) { //6.51s killtime - 2.5h cleartime
			var items = ['Rusty_Dagger', 'Bad_Medkit', 'Shock_and_Awl', 'Spiked_Gloves', 'Bloodstained_Gloves', 'Big_Cleaver', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 99) { //7.5s killtime - 2.9h cleartime
			var items = ['Lifegiving_Gem', 'Shock_and_Awl', 'Spiked_Gloves', 'Bloodstained_Gloves', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['lifesteal', 'dustMult']
		}

		if (autoBattle.enemyLevel == 100) { //7.5s killtime - 2.9h cleartime
			var items = ['Rusty_Dagger', 'Bad_Medkit', 'Shock_and_Awl', 'Wired_Wristguards', 'Aegis', 'Bloodstained_Gloves', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 101) { //5.7s killtime - 2.2h cleartime
			var items = ['Lifegiving_Gem', 'Shock_and_Awl', 'Spiked_Gloves', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Blessed_Protector', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['health', 'lifesteal']
		}
		if (autoBattle.enemyLevel == 102) { //5.7s killtime - 2.2h cleartime
			var items = ['Lifegiving_Gem', 'Shock_and_Awl', 'Spiked_Gloves', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Blessed_Protector', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['health', 'lifesteal']
		}
		if (autoBattle.enemyLevel == 103) { //7.74s killtime - 3.5h cleartime
			var items = ['Lifegiving_Gem', 'Shock_and_Awl', 'Spiked_Gloves', 'Bloodstained_Gloves', 'Fearsome_Piercer', 'Bag_of_Nails', 'The_Doomspring', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 104) { //7.2s killtime - 2.8h cleartime
			var items = ['Rusty_Dagger', 'Bad_Medkit', 'Shock_and_Awl', 'Spiked_Gloves', 'Bloodstained_Gloves', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 105) { //8.28s killtime - 3.4h cleartime
			var items = ['Rusty_Dagger', 'Bad_Medkit', 'Shock_and_Awl', 'Spiked_Gloves', 'Bloodstained_Gloves', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 106) { //9.04s killtime - 3.8h cleartime
			var items = ['Rusty_Dagger', 'Bad_Medkit', 'Shock_and_Awl', 'Spiked_Gloves', 'Bloodstained_Gloves', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 107) { //8.51s killtime - 3.6h cleartime
			var items = ['Rusty_Dagger', 'Bad_Medkit', 'Shock_and_Awl', 'Spiked_Gloves', 'Bloodstained_Gloves', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 108) { //12.56s killtime - 5.3h cleartime
			var items = ['Lifegiving_Gem', 'Shock_and_Awl', 'Spiked_Gloves', 'Bloodstained_Gloves', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'lifesteal']
		}
		if (autoBattle.enemyLevel == 109) { //9.9s killtime - 4.2h cleartime
			var items = ['Rusty_Dagger', 'Lifegiving_Gem', 'Shock_and_Awl', 'Spiked_Gloves', 'Fearsome_Piercer', 'Blessed_Protector', 'The_Doomspring', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'lifesteal']
		}
	}

	if (autoBattle.rings.level >= 35 && autoBattle.rings.level < 50) {
		if (autoBattle.enemyLevel == 110) {
			var items = ['Rusty_Dagger', 'Bad_Medkit', 'Shock_and_Awl', 'Spiked_Gloves', 'Bloodstained_Gloves', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 111) {
			var items = ['Bad_Medkit', 'Shock_and_Awl', 'Spiked_Gloves', 'Sacrificial_Shank', 'Grounded_Crown', 'Fearsome_Piercer', 'Bag_of_Nails', 'Blessed_Protector', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 112) {
			var items = ['Rusty_Dagger', 'Bad_Medkit', 'Shock_and_Awl', 'Spiked_Gloves', 'Bloodstained_Gloves', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 113) {
			var items = ['Rusty_Dagger', 'Shock_and_Awl', 'Spiked_Gloves', 'Bloodstained_Gloves', 'Sacrificial_Shank', 'Grounded_Crown', 'Fearsome_Piercer', 'Bag_of_Nails', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 114) {
			var items = ['Menacing_Mask', 'Bad_Medkit', 'Shock_and_Awl', 'Spiked_Gloves', 'Wired_Wristguards', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 115) {
			var items = ['Bad_Medkit', 'Shock_and_Awl', 'Spiked_Gloves', 'Wired_Wristguards', 'Bloodstained_Gloves', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 116) {
			var items = ['Rusty_Dagger', 'Bad_Medkit', 'Shock_and_Awl', 'Spiked_Gloves', 'Wired_Wristguards', 'Bloodstained_Gloves', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 117) {
			var items = ['Rusty_Dagger', 'Bad_Medkit', 'Lifegiving_Gem', 'Shock_and_Awl', 'Spiked_Gloves', 'Wired_Wristguards', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'lifesteal']
		}

		if (autoBattle.enemyLevel == 118) { //9s killtimes - 4h11m clear
			var items = ['Bad_Medkit', 'Shock_and_Awl', 'Spiked_Gloves', 'Bloodstained_Gloves', 'Big_Cleaver', 'Sacrificial_Shank', 'Grounded_Crown', 'Fearsome_Piercer', 'Bag_of_Nails', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 119) { //11.1s killtimes - 5h12m clear
			var items = ['Bad_Medkit', 'Shock_and_Awl', 'Spiked_Gloves', 'Bloodstained_Gloves', 'Big_Cleaver', 'Sacrificial_Shank', 'Grounded_Crown', 'Fearsome_Piercer', 'Bag_of_Nails', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 120) { //25.5s killtimes - 12h4m clear
			var items = ['Bad_Medkit', 'Shock_and_Awl', 'Spiked_Gloves', 'Bloodstained_Gloves', 'Big_Cleaver', 'Sacrificial_Shank', 'Grounded_Crown', 'Fearsome_Piercer', 'Bag_of_Nails', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 121) {
			var items = ['Bad_Medkit', 'Lifegiving_Gem', 'Shock_and_Awl', 'Spiked_Gloves', 'Big_Cleaver', 'Sacrificial_Shank', 'Grounded_Crown', 'Fearsome_Piercer', 'Bag_of_Nails', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'lifesteal']
		}
	}

	if (autoBattle.rings.level < 50) {
		if (autoBattle.enemyLevel == 122) {
			var items = ['Menacing_Mask', 'Battery_Stick', 'Lifegiving_Gem', 'Spiked_Gloves', 'Wired_Wristguards', 'Bloodstained_Gloves', 'Eelimp_in_a_Bottle', 'Big_Cleaver', 'Sacrificial_Shank', 'Grounded_Crown', 'Fearsome_Piercer', 'Doppelganger_Signet', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'lifesteal']
		}
		if (autoBattle.enemyLevel == 123) {
			var items = ['Menacing_Mask', 'Battery_Stick', 'Lifegiving_Gem', 'Spiked_Gloves', 'Wired_Wristguards', 'Bloodstained_Gloves', 'Eelimp_in_a_Bottle', 'Big_Cleaver', 'Sacrificial_Shank', 'Grounded_Crown', 'Fearsome_Piercer', 'Doppelganger_Signet', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'lifesteal']
		}
		if (autoBattle.enemyLevel == 124) {
			var items = ['Menacing_Mask', 'Battery_Stick', 'Lifegiving_Gem', 'Spiked_Gloves', 'Wired_Wristguards', 'Eelimp_in_a_Bottle', 'Big_Cleaver', 'Sacrificial_Shank', 'Grounded_Crown', 'Fearsome_Piercer', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'lifesteal']
		}
		if (autoBattle.enemyLevel == 125) {
			var items = ['Menacing_Mask', 'Battery_Stick', 'Spiked_Gloves', 'Tame_Snimp', 'Wired_Wristguards', 'Bloodstained_Gloves', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Snimp__Fanged_Blade', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 126) {
			var items = ['Menacing_Mask', 'Battery_Stick', 'Spiked_Gloves', 'Tame_Snimp', 'Wired_Wristguards', 'Big_Cleaver', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Snimp__Fanged_Blade', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 127) {
			var items = ['Menacing_Mask', 'Battery_Stick', 'Spiked_Gloves', 'Tame_Snimp', 'Wired_Wristguards', 'Big_Cleaver', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Snimp__Fanged_Blade', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 128) {
			var items = ['Menacing_Mask', 'Battery_Stick', 'Spiked_Gloves', 'Tame_Snimp', 'Wired_Wristguards', 'Big_Cleaver', 'Sacrificial_Shank', 'Fearsome_Piercer', 'Bag_of_Nails', 'Snimp__Fanged_Blade', 'Doppelganger_Signet', 'Basket_of_Souls', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 129) {
			autoBattle.enemyLevel = 121;
			var items = ['Menacing_Mask', 'Raincoat', 'Lifegiving_Gem', 'Shock_and_Awl', 'Spiked_Gloves', 'Wired_Wristguards', 'Big_Cleaver', 'Sacrificial_Shank', 'Grounded_Crown', 'Fearsome_Piercer', 'Bag_of_Nails', 'Doppelganger_Signet', 'Omni_Enhancer', 'Stormbringer', 'Nullifium_Armor', 'Haunted_Harpoon']
			var ring = ['attack', 'lifesteal']
			ABItemSwap(items, ring);
			autoBattle.popup(true, false, true);
			autoBattle.resetCombat();
		}
	}

	if (autoBattle.rings.level >= 50) {
		if (autoBattle.enemyLevel == 129) {
			var items = [['Menacing_Mask'], ['Shock_and_Awl'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 130) {
			var items = [['Menacing_Mask'], ['Shock_and_Awl'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 131) {
			var items = [['Menacing_Mask'], ['Bad_Medkit'], ['Lifegiving_Gem'], ['Shock_and_Awl'], ['Spiked_Gloves'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'lifesteal']
		}
	}

	//Swapping Items
	if (autoBattle.sessionEnemiesKilled == 0 && autoBattle.enemy.baseHealth == autoBattle.enemy.health && autoBattle.maxEnemyLevel === autoBattle.enemyLevel) {
		ABItemSwap(items, ring);
		autoBattle.popup(true, false, true);
	}

	//Turning off autoLevel
	if (autoBattle.maxEnemyLevel >= 99 && autoBattle.rings.level < 27 && autoBattle.items.Fearsome_Piercer.level < 11) {
		if (autoBattle.autoLevel) autoBattle.toggleAutoLevel();
		return;
	}

	if (autoBattle.maxEnemyLevel >= 102 && autoBattle.rings.level < 30) {
		if (autoBattle.autoLevel) autoBattle.toggleAutoLevel();
		return;
	}

	if (autoBattle.maxEnemyLevel >= 109 && (autoBattle.rings.level < 36 || autoBattle.items.Haunted_Harpoon.level < 6 || autoBattle.items.Nullifium_Armor.level < 6 || autoBattle.items.Stormbringer.level < 7 || autoBattle.items.Omni_Enhancer.level < 8 || autoBattle.items.Basket_of_Souls.level < 9)) {
		if (autoBattle.autoLevel) autoBattle.toggleAutoLevel();
		return;
	}

	if (autoBattle.maxEnemyLevel >= 117 && autoBattle.rings.level < 40) {
		if (autoBattle.autoLevel) autoBattle.toggleAutoLevel();
		return;
	}
	if (autoBattle.maxEnemyLevel >= 121 && (autoBattle.rings.level < 46 || autoBattle.items.Omni_Enhancer.level < 11)) {
		if (autoBattle.autoLevel) autoBattle.toggleAutoLevel();
		return;
	}
	if (autoBattle.maxEnemyLevel >= 129 && autoBattle.rings.level < 50) {
		if (autoBattle.autoLevel) autoBattle.toggleAutoLevel();
		return;
	}

	if (autoBattle.maxEnemyLevel >= 131) {
		if (autoBattle.autoLevel) autoBattle.toggleAutoLevel();
		return;
	}

	if (!autoBattle.autoLevel)
		autoBattle.toggleAutoLevel();

}

function totalSAResources() {
	//total Dust!
	var dust = 0;
	var shards = 0;
	//Contracts
	var dustContracts = 0;
	var shardContracts = 0;
	for (var item in autoBattle.items) {
		if (item === 'Sword' || item === 'Menacing_Mask' || item === 'Armor' || item === 'Rusty_Dagger' || item === 'Fists_of_Goo' || item === 'Battery_Stick' || item === 'Pants') continue;
		if (typeof (autoBattle.items[item].dustType) === 'undefined') dustContracts += autoBattle.contractPrice(item);
		else shardContracts += autoBattle.contractPrice(item);
	}
	dust += dustContracts;
	shards += shardContracts;

	//Items
	var dustItems = 0;
	var shardItems = 0;
	for (var item in autoBattle.items) {
		//if (typeof (autoBattle.items[item].dustType) !== 'undefined' && autoBattle.items[item].dustType === 'shards') continue;
		var itemPrice = autoBattle.items[item].startPrice;
		var itemPriceMod = autoBattle.items[item].priceMod;
		if (typeof (autoBattle.items[item].startPrice) === 'undefined') itemPrice = 5;
		if (typeof (autoBattle.items[item].priceMod) === 'undefined') itemPriceMod = 3;
		for (var x = 0; x < autoBattle.items[item].level; x++) {
			if (typeof (autoBattle.items[item].dustType) === 'undefined') dustItems += (itemPrice * ((Math.pow(itemPriceMod, x)) / (itemPriceMod)))
			else shardItems += (itemPrice * ((Math.pow(itemPriceMod, x)) / (itemPriceMod)))
		}
	}
	dust += dustItems;
	shards += shardItems;

	//Bonuses
	var dustBonuses = 0;
	var shardBonuses = 0;
	for (var bonus in autoBattle.bonuses) {
		var bonusPrice = autoBattle.bonuses[bonus].price
		var bonusPriceMod = autoBattle.bonuses[bonus].priceMod;
		for (var x = 0; x < autoBattle.bonuses[bonus].level; x++) {
			if (bonus !== 'Scaffolding') dustBonuses += Math.ceil(bonusPrice * Math.pow(bonusPriceMod, x));
			else shardBonuses += Math.ceil(bonusPrice * Math.pow(bonusPriceMod, x));
		}
	}

	dust += dustBonuses
	shards += shardBonuses

	//One Timers
	var dustOneTimers = 0;
	var shardOneTimers = 0;
	for (var item in autoBattle.oneTimers) {
		if (typeof (autoBattle.oneTimers[item].useShards) === 'undefined') dustOneTimers += autoBattle.oneTimerPrice(item);
		else shardOneTimers += autoBattle.oneTimerPrice(item)
	}
	dust += dustOneTimers;
	shards += shardOneTimers;

	//Ring
	var ringCost = 0;
	if (autoBattle.oneTimers["The_Ring"].owned && autoBattle.rings.level > 1) {
		ringCost += Math.ceil(15 * Math.pow(2, autoBattle.rings.level) - 30); // Subtracting 30 for the first level or something.
	}
	shards += ringCost;

	return [dust, shards];
}

function PresetSwapping(preset) {
	if (!getPageSetting('RPerkSwapping')) return

	var preset = !preset ? null :
		(preset != 1 && preset != 2 && preset != 3) ? null :
			preset;

	if (preset == null) {
		debug("Invalid input. Needs to be a value between 1 and 3.");
		return;
	}

	presetTab(preset);
	loadPerkPreset();
}

function hypoPackratReset(challenge) {

	if (challenge == 'Hypothermia' && autoTrimpSettings.rHypoDefaultSettings.value.packrat) {
		toggleRemovePerks();
		numTab(6, true);
		buyPortalUpgrade('Packrat');
		toggleRemovePerks();
		tooltip('Custom', null, 'update', true);
		document.getElementById('customNumberBox').value = 3;
		numTab(5, true)
		buyPortalUpgrade('Packrat');
	}
}

function AllocatePerks() {
	if (!game.global.portalActive) return;
	if (getPageSetting('RAutoAllocatePerks') === 0) return;
	var allocatePerk = getPageSetting('RAutoAllocatePerks') == 1 ? 'Looting' : getPageSetting('RAutoAllocatePerks') == 2 ? 'Greed' : getPageSetting('RAutoAllocatePerks') == 3 ? 'Motivation' : null;
	if (allocatePerk !== null) {
		numTab(6, true)
		buyPortalUpgrade(allocatePerk);
		debug('Bought Max ' + allocatePerk);
	}
}

function PerkRespec(preset) {
	//Swaps between presets depending on the input provided. Will only function if the input is between 1 and 3.
	var preset = !preset ? null :
		(preset != 1 && preset != 2 && preset != 3) ? null :
			preset;

	if (preset == null) {
		debug("Invalid input. Needs to be a value between 1 and 3.");
		return;
	}

	//Respecs to a different preset and fires all workers to ensure that decreases in carp levels won't impact its ability to respec
	if (game.global.canRespecPerks) {
		viewPortalUpgrades();
		respecPerks();
		presetTab(preset);
		loadPerkPreset();
		game.jobs.Miner.owned = 0;
		game.jobs.Farmer.owned = 0;
		game.jobs.Lumberjack.owned = 0;
		activateClicked();
		debug("Respecced to preset " + preset);
	} else
		debug("No respec available");
}

function AbandonChallengeRuns(zone) {
	//Abandons challenge runs when a certain zone has been reached.
	var zone = !zone ? (getPageSetting('c3finishrun') === -1 ? Infinity : getPageSetting('c3finishrun')) :
		zone;
	var hasPaused = false;

	if (zone === null) return
	if (game.global.world == zone && game.global.runningChallengeSquared) {
		if (game.options.menu.pauseGame.enabled && !hasPaused) {
			toggleSetting('pauseGame');
			hasPaused = true;
		}
		if (getPageSetting('RdownloadSaves')) {
			//Download save
			tooltip('Export', null, 'update');
			document.getElementById("downloadLink").click();
			cancelTooltip();
		}

		//Cancel out of c3
		confirmAbandonChallenge();
		abandonChallenge();
		cancelTooltip();
		if (hasPaused) {
			toggleSetting('pauseGame');
			hasPaused = false;
		}
	}
}

function dailyModifiersOutput() {
	var daily = game.global.dailyChallenge;
	if (!daily) return "";
	//var returnText = ''
	var returnText = "";
	for (var item in daily) {
		if (item == 'seed') continue;
		returnText += dailyModifiers[item].description(daily[item].strength) + "<br>";
	}
	return returnText
}

function dailyModiferReduction() {
	if (game.global.challengeActive !== 'Daily') return 0;
	var dailyMods = dailyModifiersOutput().split('<br>')
	dailyMods.length = dailyMods.length - 1;
	var dailyReduction = 0;

	for (var item in autoTrimpSettings.rDailyPortalSettingsArray.value) {
		if (item === 'portalZone' || item === 'portalChallenge') continue;
		if (!autoTrimpSettings.rDailyPortalSettingsArray.value[item].enabled) continue;
		var dailyReductionTemp = 0;
		var modifier = item;
		if (modifier.includes('Shred')) modifier = 'Every 15';
		if (modifier.includes('Weakness')) modifier = 'Enemies stack a debuff with each attack, reducing Trimp attack by';
		if (modifier.includes('Famine')) modifier = 'less Metal, Food, Wood, and Gems from all sources';
		if (modifier.includes('Large')) modifier = 'All housing can store';

		for (var x = 0; x < dailyMods.length; x++) {
			if (dailyMods[x].includes(modifier)) {
				if (modifier.includes('Every 15') && dailyMods[x].includes(item.split('Shred')[1]))
					dailyReductionTemp = autoTrimpSettings.rDailyPortalSettingsArray.value[item].zone
				else
					dailyReductionTemp = autoTrimpSettings.rDailyPortalSettingsArray.value[item].zone
			}
			if (dailyReduction > dailyReductionTemp) dailyReduction = dailyReductionTemp;
		}
	}
	return dailyReduction
}

function displayMostEfficientEquipment() {

	if (usingRealTimeOffline) return;
	var $eqNamePrestige = null;

	var highlightSetting = getPageSetting('rEquipEfficientEquipDisplay');
	if (!highlightSetting) {
		for (var item in game.equipment) {
			if (game.upgrades[RequipmentList[item].Upgrade].locked == 0) {
				$eqNamePrestige = document.getElementById(RequipmentList[item].Upgrade);
				if (document.getElementsByClassName(item).length == 0) {
					document.getElementById(RequipmentList[item].Upgrade).classList.add("efficient");
					document.getElementById(RequipmentList[item].Upgrade).classList.add(item);
				}
			}

			var $eqName = document.getElementById(item);
			if (!$eqName)
				continue;

			swapClass('efficient', 'efficientNo', $eqName)
			if ($eqNamePrestige != null)
				swapClass('efficient', 'efficientNo', $eqNamePrestige)
		}

	}
	if (!highlightSetting) return;

	for (var item in game.equipment) {
		if (game.equipment[item].locked) continue;
		if (item == "Shield") continue;
		var rEquipZone = game.global.challengeActive == "Daily" && getPageSetting('Rdequipon') ? getPageSetting('Rdequipzone') : getPageSetting('Requipzone');
		var zoneGo = !zoneGo && (rEquipZone[0] > 0 && (rEquipZone.includes(game.global.world)) || game.global.world >= rEquipZone[rEquipZone.length - 1]) ? true :
			zoneGo;
		var bestBuys = mostEfficientEquipment(1, true, true, false, true);
		var isAttack = (RequipmentList[item].Stat === 'attack' ? 0 : 1);
		var $eqNamePrestige = null;
		if (game.upgrades[RequipmentList[item].Upgrade].locked == 0) {
			$eqNamePrestige = document.getElementById(RequipmentList[item].Upgrade);
			if (document.getElementsByClassName(item).length == 0) {
				document.getElementById(RequipmentList[item].Upgrade).classList.add("efficient");
				document.getElementById(RequipmentList[item].Upgrade).classList.add(item);
			}
			if (document.getElementById(RequipmentList[item].Upgrade).classList.contains('efficientYes') && (item != bestBuys[isAttack] || (item == bestBuys[isAttack] && bestBuys[isAttack + 4] !== true)))
				swapClass('efficient', 'efficientNo', $eqNamePrestige)
		}
		if (item == bestBuys[isAttack] && bestBuys[isAttack + 4] === true) {
			bestBuys[isAttack] = RequipmentList[item].Upgrade;
			if (document.getElementById(item).classList.contains('efficientYes'))
				swapClass('efficient', 'efficientNo', document.getElementById(item))
			item = RequipmentList[item].Upgrade;
		}

		var $eqName = document.getElementById(item);
		if (!$eqName)
			continue;
		if (item == bestBuys[isAttack])
			swapClass('efficient', 'efficientYes', $eqName)
		else {
			swapClass('efficient', 'efficientNo', $eqName)
		}
	}
}
