MODULES["other"] = {};
MODULES["other"].enableRoboTrimpSpam = true;

function armydeath() {
	if (game.global.mapsActive) return !1;
	var e = game.global.lastClearedCell + 1,
		l = game.global.gridArray[e].attack * dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks),
		a = game.global.soldierHealth;
	"Ice" == getEmpowerment() && (l *= game.empowerments.Ice.getCombatModifier());
	var g = game.global.soldierCurrentBlock;
	return (
		3 == game.global.formation ? (g /= 4) : "0" != game.global.formation && (g *= 2),
		g > game.global.gridArray[e].attack ? (l *= getPierceAmt()) : (l -= g * (1 - getPierceAmt())),
		challengeActive('Daily') && void 0 !== game.global.dailyChallenge.crits && (l *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength)),
		void 0 !== game.global.dailyChallenge.bogged && (a -= game.global.soldierHealthMax * dailyModifiers.bogged.getMult(game.global.dailyChallenge.bogged.strength)),
		void 0 !== game.global.dailyChallenge.plague && (a -= game.global.soldierHealthMax * dailyModifiers.plague.getMult(game.global.dailyChallenge.plague.strength, game.global.dailyChallenge.plague.stacks)),
		challengeActive('Electricity') && (a -= game.global.soldierHealth -= game.global.soldierHealthMax * (0.1 * game.challenges.Electricity.stacks)),
		"corruptCrit" == game.global.gridArray[e].corrupted
			? (l *= 5)
			: "healthyCrit" == game.global.gridArray[e].corrupted
				? (l *= 7)
				: "corruptBleed" == game.global.gridArray[e].corrupted
					? (a *= 0.8)
					: "healthyBleed" == game.global.gridArray[e].corrupted && (a *= 0.7),
		(a -= l) <= 1e3
	);
}

function autoRoboTrimp() {
	if (game.global.roboTrimpLevel === 0) return;
	if (game.global.roboTrimpCooldown !== 0) return;
	if (getPageSetting("AutoRoboTrimp") > game.global.world) return;

	var shouldShriek = (game.global.world - parseInt(getPageSetting("AutoRoboTrimp"))) % 5 === 0;
	if (shouldShriek) {
		if (!game.global.useShriek) {
			magnetoShriek();
			debug("Activated Robotrimp MagnetoShriek Ability @ z" + game.global.world, "graphs", "*podcast");
		}
	}
	else
		if (game.global.useShriek) magnetoShriek();
}

function isActiveSpireAT() {
	return !challengeActive('Daily') && game.global.spireActive && game.global.world >= getPageSetting('IgnoreSpiresUntil')
}

function disActiveSpireAT() {
	return challengeActive('Daily') && game.global.spireActive && game.global.world >= getPageSetting('dIgnoreSpiresUntil')
}

function exitSpireCell() {
	isActiveSpireAT() && game.global.lastClearedCell >= getPageSetting('ExitSpireCell') - 1 && endSpire()
}

function dailyexitSpireCell() {
	disActiveSpireAT() && game.global.lastClearedCell >= getPageSetting('dExitSpireCell') - 1 && endSpire()
}

function findLastBionicWithItems(bionicPool) {

	if (game.global.world < 115 || !bionicPool)
		return;
	if (challengeActive('Mapology') && !getPageSetting('mapology')) return;
	const targetPrestige = challengeActive('Mapology') ? autoTrimpSettings['mapologyPrestige'].selected : 'GambesOP';

	if (bionicPool.length > 1) {
		bionicPool.sort(function (bionicA, bionicB) { return bionicA.level - bionicB.level });
		while (bionicPool.length > 1 && equipsToGet(bionicPool[0].level, targetPrestige)[0] === 0) {
			if (challengeActive('Experience') && game.global.world > 600 && bionicPool[0].level >= getPageSetting('experienceEndBW')) break;
			bionicPool.shift();
			if (equipsToGet(bionicPool[0].level, targetPrestige)[0] !== 0) break;
		}
	}

	return bionicPool[0];
}

//Helium

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

function getZoneEmpowerment(zone) {
	if (!zone) return 'None';
	var natureStartingZone = game.global.universe === 1 ? getNatureStartZone() : 236;
	if (zone < natureStartingZone) return 'None';
	var activeEmpowerments = ["Poison", "Wind", "Ice"];
	zone = Math.floor((zone - natureStartingZone) / 5);
	zone = zone % activeEmpowerments.length;
	return activeEmpowerments[zone];
}

//Radon
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

function heliumChallengesSetting() {
	var highestZone = game.global.highestLevelCleared + 1;
	var heliumChallenges = ["Off", "Helium Per Hour"];
	if (highestZone >= 40) heliumChallenges.push("Balance");
	if (highestZone >= 55) heliumChallenges.push("Decay");
	if (game.global.prisonClear >= 1) heliumChallenges.push("Electricity");
	if (highestZone > 110) heliumChallenges.push("Life");
	if (highestZone > 125) heliumChallenges.push("Crushed");
	if (highestZone >= 145) heliumChallenges.push("Nom");
	if (highestZone >= 165) heliumChallenges.push("Toxicity");
	if (highestZone >= 180) heliumChallenges.push("Watch");
	if (highestZone >= 180) heliumChallenges.push("Lead");
	if (highestZone >= 190) heliumChallenges.push("Corrupted");
	if (highestZone >= 215) heliumChallenges.push("Domination");
	if (highestZone >= 600) heliumChallenges.push("Experience");
	heliumChallenges.push("Custom");
	if (highestZone >= 65) heliumChallenges.push("Challenge 2");

	document.getElementById('AutoPortal').innerHTML = '';
	for (var item in heliumChallenges) {
		var option = document.createElement("option");
		option.value = heliumChallenges[item];
		option.text = heliumChallenges[item];
		document.getElementById('AutoPortal').appendChild(option);
	}

	var heliumHourChallenges = ["None"];
	if (highestZone >= 40) heliumHourChallenges.push("Balance");
	if (highestZone >= 55) heliumHourChallenges.push("Decay");
	if (game.global.prisonClear >= 1) heliumHourChallenges.push("Electricity");
	if (highestZone > 110) heliumHourChallenges.push("Life");
	if (highestZone > 125) heliumHourChallenges.push("Crushed");
	if (highestZone >= 145) heliumHourChallenges.push("Nom");
	if (highestZone >= 165) heliumHourChallenges.push("Toxicity");
	if (highestZone >= 180) heliumHourChallenges.push("Watch");
	if (highestZone >= 180) heliumHourChallenges.push("Lead");
	if (highestZone >= 190) heliumHourChallenges.push("Corrupted");
	if (highestZone >= 215) heliumHourChallenges.push("Domination");
	if (highestZone >= 215) heliumHourChallenges.push("Experience");

	document.getElementById('HeliumHourChallenge').innerHTML = '';

	for (var item in heliumHourChallenges) {
		var option = document.createElement("option");
		option.value = heliumHourChallenges[item];
		option.text = heliumHourChallenges[item];
		document.getElementById('HeliumHourChallenge').appendChild(option);
	}

	document.getElementById('dHeliumHourChallenge').innerHTML = document.getElementById('HeliumHourChallenge').innerHTML;

	if (highestZone >= 65) {
		var option = document.createElement("option");
		option.value = 'Challenge 2';
		option.text = 'Challenge 2';
		document.getElementById('dHeliumHourChallenge').appendChild(option);
	}

	var challenge2 = ["None"];
	if (getTotalPerkResource(true) >= 30) challenge2.push("Discipline");
	if (highestZone >= 25) challenge2.push("Metal");
	if (highestZone >= 35) challenge2.push("Size");
	if (highestZone >= 40) challenge2.push("Balance");
	if (highestZone >= 45) challenge2.push("Meditate");
	if (highestZone >= 60) challenge2.push("Trimp");
	if (highestZone >= 70) challenge2.push("Trapper");
	if (game.global.prisonClear >= 1) challenge2.push("Electricity");
	if (highestZone >= 120) challenge2.push("Coordinate");
	if (highestZone >= 130) challenge2.push("Slow");
	if (highestZone >= 145) challenge2.push("Nom");
	if (highestZone >= 150) challenge2.push("Mapology");
	if (highestZone >= 165) challenge2.push("Toxicity");
	if (highestZone >= 180) challenge2.push("Watch");
	if (highestZone >= 180) challenge2.push("Lead");
	if (highestZone >= 425) challenge2.push("Obliterated");
	if (game.global.totalSquaredReward >= 4500) challenge2.push("Eradicated");

	document.getElementById('HeliumC2Challenge').innerHTML = '';
	document.getElementById('dC2Challenge').innerHTML = '';
	for (var item in challenge2) {
		var option = document.createElement("option");
		option.value = challenge2[item];
		option.text = challenge2[item];
		document.getElementById('HeliumC2Challenge').appendChild(option);
	}

	document.getElementById('dC2Challenge').innerHTML = document.getElementById('HeliumC2Challenge').innerHTML;
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
	if (game.global.stringVersion >= '5.9.0') radonChallenges.push('Desolation')
	radonChallenges.push("Custom");
	if (radonHZE >= 50) radonChallenges.push("Challenge 3");

	document.getElementById('RAutoPortal').innerHTML = '';
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
	if (radonHZE >= 110) radonHourChallenges.push("Insanity");
	if (radonHZE >= 135) radonHourChallenges.push("Nurture");
	if (radonHZE >= 155) radonHourChallenges.push("Alchemy");
	if (radonHZE >= 175) radonHourChallenges.push("Hypothermia");

	document.getElementById('RadonHourChallenge').innerHTML = '';

	for (var item in radonHourChallenges) {
		var option = document.createElement("option");
		option.value = radonHourChallenges[item];
		option.text = radonHourChallenges[item];
		document.getElementById('RadonHourChallenge').appendChild(option);
	}
	document.getElementById('RdHeliumHourChallenge').innerHTML = document.getElementById('RadonHourChallenge').innerHTML;

	if (radonHZE >= 50) {
		var option = document.createElement("option");
		option.value = 'Challenge 3';
		option.text = 'Challenge 3';
		document.getElementById('RdHeliumHourChallenge').appendChild(option);
	}

	var radonChallenge3 = ["None"];
	if (radonHZE >= 15) radonChallenge3.push("Unlucky");
	if (radonHZE >= 20) radonChallenge3.push("Downsize");
	if (radonHZE >= 25) radonChallenge3.push("Transmute");
	if (radonHZE >= 35) radonChallenge3.push("Unbalance");
	if (radonHZE >= 45) radonChallenge3.push("Duel");
	if (radonHZE >= 60) radonChallenge3.push("Trappapalooza");
	if (radonHZE >= 70) radonChallenge3.push("Wither");
	if (radonHZE >= 85) radonChallenge3.push("Quest");
	if (radonHZE >= 105) radonChallenge3.push("Storm");
	if (radonHZE >= 115) radonChallenge3.push("Berserk");
	if (radonHZE >= 175) radonChallenge3.push("Glass");
	if (game.global.stringVersion >= '5.9.0') radonChallenge3.push('Desolation')
	if (radonHZE >= 201) radonChallenge3.push("Smithless");

	document.getElementById('RadonC3Challenge').innerHTML = '';
	for (var item in radonChallenge3) {
		var option = document.createElement("option");
		option.value = radonChallenge3[item];
		option.text = radonChallenge3[item];
		document.getElementById('RadonC3Challenge').appendChild(option);
	}
	document.getElementById('RdC2Challenge').innerHTML = document.getElementById('RadonC3Challenge').innerHTML;

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

function challengeListSetting() {
	var highestZone = game.global.highestRadonLevelCleared + 1;
	var challengeList = ["Off", "Radon Per Hour"];
	if (highestZone >= 40) challengeList.push("Bublé");
	if (highestZone >= 55) challengeList.push("Melt");
	if (highestZone >= 70) challengeList.push("Quagmire");
	if (highestZone >= 90) challengeList.push("Archaeology");
	if (highestZone >= 100) challengeList.push("Mayhem");
	if (highestZone >= 110) challengeList.push("Insanity");
	if (highestZone >= 135) challengeList.push("Nurture");
	if (highestZone >= 150) challengeList.push("Pandemonium");
	if (highestZone >= 155) challengeList.push("Alchemy");
	if (highestZone >= 175) challengeList.push("Hypothermia");
	challengeList.push("Custom");
	if (highestZone >= 50) challengeList.push("Challenge 3");

	document.getElementById('RAutoPortal').innerHTML = ''
	for (var item in challengeList) {
		var option = document.createElement("option");
		option.value = challengeList[item];
		option.text = challengeList[item];
		document.getElementById('RAutoPortal').appendChild(option);
	}

	var radonHourChallenges = ["None"];
	if (highestZone >= 40) radonHourChallenges.push("Bublé");
	if (highestZone >= 55) radonHourChallenges.push("Melt");
	if (highestZone >= 70) radonHourChallenges.push("Quagmire");
	if (highestZone >= 90) radonHourChallenges.push("Archaeology");
	if (highestZone >= 110) radonHourChallenges.push("Insanity");
	if (highestZone >= 135) radonHourChallenges.push("Nurture");
	if (highestZone >= 155) radonHourChallenges.push("Alchemy");
	if (highestZone >= 175) radonHourChallenges.push("Hypothermia");

	document.getElementById('RadonHourChallenge').innerHTML = ''
	for (var item in radonHourChallenges) {
		var option = document.createElement("option");
		option.value = radonHourChallenges[item];
		option.text = radonHourChallenges[item];
		document.getElementById('RadonHourChallenge').appendChild(option);
	}

	var challengeList = ["None"];
	if (highestZone >= 15) challengeList.push("Unlucky");
	if (highestZone >= 20) challengeList.push("Downsize");
	if (highestZone >= 25) challengeList.push("Transmute");
	if (highestZone >= 35) challengeList.push("Unbalance");
	if (highestZone >= 45) challengeList.push("Duel");
	if (highestZone >= 60) challengeList.push("Trappapalooza");
	if (highestZone >= 70) challengeList.push("Wither");
	if (highestZone >= 85) challengeList.push("Quest");
	if (highestZone >= 105) challengeList.push("Storm");
	if (highestZone >= 115) challengeList.push("Berserk");
	if (highestZone >= 175) challengeList.push("Glass");

	document.getElementById('RadonC3Challenge').innerHTML = ''
	for (var item in challengeList) {
		var option = document.createElement("option");
		option.value = challengeList[item];
		option.text = challengeList[item];
		document.getElementById('RadonC3Challenge').appendChild(option);
	}

	//if (highestZone === 15) debug("You have unlocked the Unlucky challenge.")
	if (highestZone === 5) debug("You can now use the Smithy Farm setting. This can be found in the AT 'Maps' tab.")
	if (highestZone === 25) debug("You have unlocked the Transmute challenge. Any metal related settings will be converted to food instead while running this challenge.")
	if (highestZone === 30) debug("You can now access the Daily tab within the AT settings. Here you will find a variety of settings that will help optimise your dailies.")
	if (highestZone === 35) debug("You have unlocked the Unbalance challenge. There's setting for it in the AT 'C3' tab.")
	if (highestZone === 40) debug("You have unlocked the Bublé challenge. It has now been added to AutoPortal setting.")
	//if (highestZone === 45) debug("Duel");
	if (highestZone === 50) debug("You can now use the Worshipper Farm setting. This can be found in the AT 'Maps' tab.")
	if (highestZone === 50) debug("You can now access the C3 tab within the AT settings. Here you will find a variety of settings that will help optimise your C3 runs.")
	if (highestZone === 50) debug("Due to unlocking Challenge 3's there is now a Challenge 3 option under AutoPortal to be able to auto portal into them.");
	if (highestZone === 50) debug("You have unlocked the Melt challenge. It has now been added to AutoPortal setting.")
	if (highestZone === 60) debug("You have unlocked the Trappapalooza challenge. It has now been added to Challenge 3 AutoPortal settings & there's a setting for it in the AT 'C3' tab.")
	if (highestZone === 70) debug("You have unlocked the Quagmire challenge. It has now been added to AutoPortal setting & there are settings for it in the AT 'Challenges' tab.")
	if (highestZone === 70) debug("You have unlocked the Wither challenge. It has now been added to Challenge 3 AutoPortal settings & any map level settings with the exception of Map Bonus will make the highest level map you run -1 to not obtain additional stacks.")
	if (highestZone === 85) debug("You have unlocked the Quest challenge. It has now been added to Challenge 3 AutoPortal settings & AT will automatically complete Quests if AutoMaps is enabled during this challenge.")
	if (highestZone === 90) debug("You have unlocked the Archaeology challenge. It has now been added to AutoPortal setting & there are settings for it in the AT 'Challenges' tab.")
	if (highestZone === 100) debug("You have unlocked the Mayhem challenge. It has now been added to AutoPortal setting & there's setting for it in the AT 'C3' tab.")
	if (highestZone === 105) debug("You have unlocked the Storm challenge. It has now been added to Challenge 3 AutoPortal setting & there's setting for it in the AT 'C3' tab.")
	if (highestZone === 110) debug("You have unlocked the Insanity challenge. It has now been added to AutoPortal setting & there are settings for it in the AT 'Challenges' tab.")
	if (highestZone === 115) debug("You have unlocked the Berserk challenge. It has now been added to Challenge 3 AutoPortal setting.")
	if (highestZone === 135) debug("You have unlocked the Nurture challenge. It has now been added to AutoPortal setting & there is a setting for Laboratory's that has been added to AT's AutoStructure setting.")
	if (highestZone === 150) debug("You have unlocked the Pandemonium challenge. It has now been added to AutoPortal setting & there's setting for it in the AT 'C3' tab.")
	if (highestZone === 155) debug("You have unlocked the Alchemy challenge. It has now been added to AutoPortal setting & there are settings for it in the AT 'Challenges' tab.")
	if (highestZone === 175) debug("You have unlocked the Hypothermia challenge. It has now been added to AutoPortal setting & there are settings for it in the AT 'Challenges' tab.")
	if (highestZone === 175) debug("You have unlocked the Glass challenge. It has now been added to Challenge 3 AutoPortal setting.")
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

function remainingHealth(forceMax) {
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
	var remainingHealth = shieldHealth + (!forceMax ? soldierHealth * .33 : soldierHealth);
	if ((challengeActive('Quest') && currQuest() == 8) || challengeActive('Bublé'))
		remainingHealth = shieldHealth;
	if (shieldHealth + soldierHealth == 0) {
		remainingHealth = game.global.soldierHealthMax + (game.global.soldierEnergyShieldMax * (maxLayers + 1))
		if ((challengeActive('Quest') && currQuest() == 8) || challengeActive('Bublé'))
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
		var experienced = challengeActive('Exterminate') && game.challenges.Exterminate.experienced;
		//Checking to see if the Glass challenge is being run where all enemies are fast.
		var runningGlass = challengeActive('Glass');

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

function callAutoMapLevel(currentMap, currentAutoLevel, special, maxLevel, minLevel, floorCrit) {
	if (currentMap === undefined || currentAutoLevel === Infinity) {
		if (currentAutoLevel === Infinity) currentAutoLevel = autoMapLevel(special, maxLevel, minLevel, floorCrit);
		if (currentAutoLevel !== Infinity && twoSecondInterval) currentAutoLevel = autoMapLevel(special, maxLevel, minLevel, floorCrit);
	}

	//Increasing Map Level
	if (sixSecondInterval && currentMap !== undefined && (autoMapLevel(special, maxLevel, minLevel, floorCrit) > currentAutoLevel)) {
		currentAutoLevel = autoMapLevel(special, maxLevel, minLevel, floorCrit);
	}

	//Decreasing Map Level
	if (sixSecondInterval && currentMap !== undefined && (autoMapLevel(special, maxLevel, minLevel, floorCrit, true) < currentAutoLevel)) {
		currentAutoLevel = autoMapLevel(special, maxLevel, minLevel, floorCrit, true);
	}
	return currentAutoLevel
}

function autoMapLevel(special, maxLevel, minLevel, floorCrit, statCheck) {
	if (!game.global.mapsUnlocked) return 0;
	if (maxLevel > 10) maxLevel = 10;
	if (game.global.universe === 1) return autoMapLevelU1(special, maxLevel, minLevel, floorCrit, statCheck);
	if (!statCheck) statCheck = false;
	if (game.global.world + maxLevel < 6) maxLevel = 0 - (game.global.world + 6);
	if (challengeActive('Wither') && maxLevel >= 0 && minLevel !== 0) maxLevel = -1;
	if (challengeActive('Insanity') && maxLevel >= 0 && minLevel !== 0) minLevel = 0;

	var maxLevel = typeof (maxLevel) === 'undefined' || maxLevel === null ? 10 : maxLevel;
	if (maxLevel > 0 && game.global.highestRadonLevelCleared + 1 < 50) maxLevel = 0;
	var minLevel = typeof (minLevel) === 'undefined' || minLevel === null ? 0 - game.global.world + 6 : minLevel;
	var special = !special ? (game.global.highestRadonLevelCleared > 83 ? 'lmc' : 'smc') : special;
	var biome = !biome ? (game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountain") : biome;
	var difficulty = 0.75;
	var runningQuest = challengeActive('Quest') && currQuest() == 8;
	var runningUnlucky = challengeActive('Unlucky')
	var ourHealth = calcOurHealth(runningQuest, 'map');
	var dmgType = runningUnlucky ? 'max' : 'avg'
	var dailyEmpowerToggle = getPageSetting('rAutoEqualityEmpower');
	var dailyCrit = challengeActive('Daily') && typeof game.global.dailyChallenge.crits !== 'undefined'; //Crit
	var critType = 'maybe'
	if (challengeActive('Wither') || challengeActive('Glass') || challengeActive('Duel')) critType = 'never'

	for (y = maxLevel; y >= minLevel; y--) {
		var mapLevel = y;
		if (y === minLevel) {
			return minLevel;
		}
		if (!statCheck && getPageSetting('ronlyPerfectMaps') && game.resources.fragments.owned < PerfectMapCost_Actual(mapLevel, special, biome))
			continue;
		if (!statCheck && !getPageSetting('ronlyPerfectMaps') && game.resources.fragments.owned < minMapFrag(mapLevel, special, biome))
			continue;

		var equalityAmt = equalityQuery('Snimp', game.global.world + mapLevel, 20, 'map', difficulty, 'oneShot');
		var ourDmg = calcOurDmg(dmgType, equalityAmt, false, 'map', critType, y, 'force');
		if (challengeActive('Daily') && typeof game.global.dailyChallenge.weakness !== 'undefined') ourDmg *= (1 - (9 * game.global.dailyChallenge.weakness.strength) / 100)
		var enemyHealth = calcEnemyHealthCore('map', game.global.world + mapLevel, 20, 'Turtlimp') * difficulty;
		var enemyDmg = calcEnemyAttackCore('map', game.global.world + mapLevel, 20, 'Snimp', false, false, equalityAmt) * difficulty;

		enemyDmg *= typeof game.global.dailyChallenge.explosive !== 'undefined' ? 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength) : 1
		enemyDmg *= dailyEmpowerToggle && dailyCrit ? dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength) : 1;

		if (challengeActive('Duel')) {
			enemyDmg *= 10;
			if (game.challenges.Duel.trimpStacks >= 50) enemyDmg *= 3;
		}
		if (enemyHealth <= ourDmg && enemyDmg <= ourHealth) {
			return mapLevel;
		}
	}
	return 0;
}

function autoMapLevelU1(special, maxLevel, minLevel, critType, statCheck) {

	var maxLevel = typeof (maxLevel) === 'undefined' || maxLevel === null ? 10 : maxLevel;
	var minLevel = typeof (minLevel) === 'undefined' || minLevel === null ? 0 - game.global.world + 6 : minLevel;

	const z = game.global.world;
	const hze = getHighestLevelCleared();
	const extraMapLevelsAvailable = hze >= 209;
	const haveMapReducer = game.talents.mapLoot.purchased;
	const biome = (game.global.farmlandsUnlocked && game.global.universe == 2 ? "Farmlands" : game.global.decayDone ? "Plentiful" : "Mountain");

	if (maxLevel > 0 && !extraMapLevelsAvailable) maxLevel = 0;
	if (!special) special = getAvailableSpecials('lmc');
	if (!critType) critType = 'maybe';

	for (y = maxLevel; y >= minLevel; y--) {
		var mapLevel = y;

		//Skip plus level maps if they're not available.
		if (!extraMapLevelsAvailable && y > 0) continue;

		if (y === minLevel) return minLevel;

		if (!statCheck && getPageSetting('onlyPerfectMaps') && game.resources.fragments.owned < PerfectMapCost_Actual(mapLevel, special, biome))
			continue;
		if (!statCheck && !getPageSetting('onlyPerfectMaps') && game.resources.fragments.owned < minMapFrag(mapLevel, special, biome))
			continue;

		// Calculate optimal map level
		let ratio = calcHDRatio(z + mapLevel, "map");
		if (game.unlocks.imps.Titimp) {
			ratio /= 2;
		}
		// Stance priority: Scryer > Dominance > X
		if (z >= 60 && hze >= 180) {
			ratio *= 2;
		} else if (game.upgrades.Dominance.done) {
			ratio /= 4;
		}
		// Stop increasing map level once HD ratio is too large
		if ((z <= 40 && ratio > 1.5) || ratio > 1.2) {
			continue;
		}

		if (mapLevel > 0) {
			const maxOneShotCells = maxOneShotPower();
			if (oneShotZone((z + mapLevel), "map", "S") >= maxOneShotCells) {
				return mapLevel;
			}
		}

		if (mapLevel === 0 && minLevel < 0 && haveMapReducer) return (mapLevel - 1);

		return mapLevel;
	}
	return mapLevel;
}

function equalityQuery(enemyName, zone, currentCell, mapType, difficulty, farmType, ourDmg) {

	if (!enemyName) enemyName = 'Snimp';
	if (!zone) zone = game.global.world;
	if (!mapType) mapType = 'world'
	if (!currentCell) mapType === 'world' ? 98 : 20;
	if (!difficulty) difficulty = 1;
	if (!farmType) farmType = 'gamma';

	if (game.portal.Equality.radLevel === 0)
		return 0;

	var mapping = mapType === 'world' ? false : true;
	var bionicTalent = zone - game.global.world;
	var checkMutations = mapType === 'world' && game.global.world > 200 && getPageSetting('rMutationCalc');
	var titimp = mapType !== 'world' && farmType === 'oneShot' ? 'force' : false;
	var dailyEmpowerToggle = getPageSetting('rAutoEqualityEmpower');
	var dailyCrit = challengeActive('Daily') && typeof game.global.dailyChallenge.crits !== 'undefined'; //Crit
	var dailyBloodthirst = challengeActive('Daily') && typeof game.global.dailyChallenge.bloodthirst !== 'undefined'; //Bloodthirst (enemy heal + atk)
	var maxEquality = game.portal.Equality.radLevel;

	var critType = 'maybe'
	if (challengeActive('Wither') || challengeActive('Glass') || challengeActive('Duel')) critType = 'never'

	//Challenge conditions
	var runningUnlucky = challengeActive('Unlucky');
	var runningDuel = challengeActive('Duel');
	var runningQuest = ((challengeActive('Quest') && currQuest() == 8) || challengeActive('Bublé')); //Shield break quest

	//Initialising name/health/dmg variables
	//Enemy stats
	if (enemyName === 'Improbability' && zone <= 58) enemyName = 'Blimp';
	var enemyHealth = calcEnemyHealthCore(mapType, zone, currentCell, enemyName) * difficulty;
	var enemyDmg = calcEnemyAttackCore(mapType, zone, currentCell, enemyName, false, false, 0) * difficulty;
	enemyDmg *= mapType === 'map' && typeof game.global.dailyChallenge.explosive !== 'undefined' ? 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength) : 1
	enemyDmg *= dailyEmpowerToggle && mapType === 'map' && dailyCrit ? dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength) : 1;

	if (challengeActive('Duel')) {
		enemyDmg *= 10;
		if (game.challenges.Duel.trimpStacks >= 50) enemyDmg *= 3;
	}
	//Our stats
	var dmgType = runningUnlucky ? 'max' : 'avg'
	var ourHealth = calcOurHealth(runningQuest, mapType);
	if (!ourDmg) var ourDmg = calcOurDmg(dmgType, 0, false, mapType, critType, bionicTalent, titimp);

	var unluckyDmg = runningUnlucky ? Number(calcOurDmg('min', 0, false, mapType, 'never', bionicTalent, titimp)) : 2;

	//Figuring out gamma to proc value
	var gammaToTrigger = gammaBurstPct === 1 ? 0 : autoBattle.oneTimers.Burstier.owned ? 4 : 5

	if (checkMutations) {
		enemyDmg = calcEnemyAttackCore(mapType, zone, currentCell, enemyName, false, calcMutationAttack(zone), 0);
		enemyHealth = calcEnemyHealthCore(mapType, zone, currentCell, enemyName, calcMutationHealth(zone));
	}

	if (challengeActive('Daily') && typeof game.global.dailyChallenge.weakness !== 'undefined') ourDmg *= (1 - ((mapType === 'map' ? 9 : gammaToTrigger) * game.global.dailyChallenge.weakness.strength) / 100)

	if (dailyBloodthirst && mapType === 'void' && getPageSetting('rBloodthirstVoidMax')) {
		var bloodThirstStrength = game.global.dailyChallenge.bloodthirst.strength;
		enemyDmg /= dailyModifiers.bloodthirst.getMult(bloodThirstStrength, game.global.dailyChallenge.bloodthirst.stacks);
		enemyDmg *= dailyModifiers.bloodthirst.getMult(bloodThirstStrength, dailyModifiers.bloodthirst.getMaxStacks(bloodThirstStrength));
	}

	var ourDmgEquality = 0;
	var enemyDmgEquality = 0;
	var unluckyDmgEquality = 0;

	if (enemyHealth !== 0) {
		for (var i = 0; i <= maxEquality; i++) {
			enemyDmgEquality = enemyDmg * Math.pow(game.portal.Equality.getModifier(), i)
			ourDmgEquality = ourDmg * Math.pow(game.portal.Equality.getModifier(1), i);
			if (runningUnlucky) {
				unluckyDmgEquality = unluckyDmg * Math.pow(game.portal.Equality.getModifier(1), i);
				if (unluckyDmgEquality.toString()[0] % 2 == 1 && i !== maxEquality) continue;
			}
			if (farmType === 'gamma' && ourHealth >= enemyDmgEquality) {
				return i;
			}
			else if (farmType === 'oneShot' && ourDmgEquality > enemyHealth && ourHealth > enemyDmgEquality) {
				return i;
			}
			else if (i === maxEquality) {
				return i;
			}
		}
	}
}

//Auto Equality
function equalityManagement() {

	if (game.global.preMapsActive || game.global.gridArray.length <= 0)
		return;

	if (game.portal.Equality.radLevel === 0)
		return;

	//Turning off equality scaling
	game.portal.Equality.scalingActive = false;
	game.options.menu.alwaysAbandon.enabled = 1;
	//Misc vars
	var debugStats = getPageSetting('debugEqualityStats');
	var dailyEmpowerToggle = getPageSetting('rAutoEqualityEmpower');
	voidPBSwap = false;
	var mapping = game.global.mapsActive ? true : false;
	var currentCell = mapping ? game.global.lastClearedMapCell + 1 : game.global.lastClearedCell + 1;
	var mapGrid = mapping ? 'mapGridArray' : 'gridArray';
	var type = (!mapping) ? "world" : (getCurrentMapObject().location == "Void" ? "void" : "map");
	var zone = (type == "world" || !mapping) ? game.global.world : getCurrentMapObject().level;
	var bionicTalent = mapping && game.talents.bionic2.purchased && (zone > game.global.world) ? zone : 0;
	var difficulty = mapping ? getCurrentMapObject().difficulty : 1;
	var maxEquality = game.portal.Equality.radLevel;
	if (type === 'void') {
		voidPBSwap = getPageSetting('RhsVoidSwap') && game.global.lastClearedMapCell !== getCurrentMapObject().size - 2 && fastimps.includes(game.global.mapGridArray[game.global.lastClearedMapCell + 2].name) && game.global.voidBuff !== 'doubleAttack';
		if (getPageSetting('RhsVoidSwap')) heirloomSwapping();
	}

	//Daily modifiers active
	var isDaily = challengeActive('Daily')
	var dailyEmpower = isDaily && typeof game.global.dailyChallenge.empower !== 'undefined' //Empower
	var dailyReflect = isDaily && typeof game.global.dailyChallenge.mirrored !== 'undefined'; //Reflect
	var dailyCrit = isDaily && typeof game.global.dailyChallenge.crits !== 'undefined'; //Crit
	var dailyExplosive = isDaily && typeof game.global.dailyChallenge.explosive !== 'undefined'; //Dmg on death
	var dailyWeakness = isDaily && typeof game.global.dailyChallenge.weakness !== 'undefined'; //% dmg reduction on hit
	var dailyBloodthirst = isDaily && typeof game.global.dailyChallenge.bloodthirst !== 'undefined'; //Bloodthirst (enemy heal + atk)
	var dailyRampage = isDaily && typeof game.global.dailyChallenge.rampage !== 'undefined'; //Rampage (trimp attack buff)

	//Challenge conditions
	var runningUnlucky = challengeActive('Unlucky');
	var runningDuel = challengeActive('Duel');
	var runningTrappa = challengeActive('Trappapalooza');
	var runningQuest = (challengeActive('Quest') && currQuest() == 8) || challengeActive('Bublé'); //Shield break quest
	var runningArchaeology = challengeActive('Archaeology');
	var runningMayhem = challengeActive('Mayhem');
	var runningBerserk = challengeActive('Berserk');
	var runningExperienced = challengeActive('Exterminate') && game.challenges.Exterminate.experienced;
	var runningGlass = challengeActive('Glass');
	var runningDesolation = challengeActive('Desolation') && mapping;
	var runningSmithless = challengeActive('Smithless') && !mapping && game.global.world % 25 === 0 && game.global.lastClearedCell == -1 && game.global.gridArray[0].ubersmith; //If UberSmith is active and not in a map

	//Perk conditions
	var noFrenzy = game.portal.Frenzy.radLevel > 0 && !autoBattle.oneTimers.Mass_Hysteria.owned;

	//Gamma burst info
	var gammaMaxStacks = gammaBurstPct === 1 ? 0 : autoBattle.oneTimers.Burstier.owned ? 4 : 5
	var gammaToTrigger = gammaMaxStacks - game.heirlooms.Shield.gammaBurst.stacks;
	var gammaDmg = gammaBurstPct;
	var fuckGamma = (dailyReflect || (runningSmithless && (10 - game.challenges.Smithless.uberAttacks) > gammaToTrigger));

	var critType = 'maybe'
	if (challengeActive('Wither') || challengeActive('Glass')) critType = 'never'

	//Initialising Stat variables
	//Our stats
	var dmgType = runningUnlucky ? 'max' : 'avg'
	var ourHealth = remainingHealth();
	var ourHealthMax = calcOurHealth(runningQuest, type)
	var ourDmg = calcOurDmg(dmgType, 0, false, type, critType, bionicTalent, true);

	var unluckyDmg = runningUnlucky ? Number(calcOurDmg('min', 0, false, type, 'never', bionicTalent, true)) : 2;

	if (noFrenzy) {
		if (getPageSetting('Rcalcfrenzy') && game.portal.Frenzy.frenzyStarted === -1) ourDmg /= 1 + (0.5 * game.portal.Frenzy.radLevel)
		if (!getPageSetting('Rcalcfrenzy') && game.portal.Frenzy.frenzyStarted !== -1) ourDmg *= 1 + (0.5 * game.portal.Frenzy.radLevel)
	}
	ourDmg *= dailyRampage ? dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, game.global.dailyChallenge.rampage.stacks) : 1;
	var ourDmgEquality = 0;
	var unluckyDmgEquality = 0;

	//Enemy stats
	var enemyName = game.global[mapGrid][currentCell].name;
	var enemyHealth = game.global[mapGrid][currentCell].health;
	var enemyDmg = getCurrentEnemy().attack * totalDamageMod() * 1.5;
	if (runningMayhem) enemyDmg /= game.challenges.Mayhem.getEnemyMult();
	enemyDmg *= game.global.voidBuff == 'doubleAttack' ? 2 : (game.global.voidBuff == 'getCrit' && (gammaToTrigger > 1 || runningBerserk || runningTrappa || runningArchaeology || runningQuest)) ? 5 : 1;
	enemyDmg *= dailyEmpowerToggle && !mapping && dailyEmpower && dailyCrit ? 1 + dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength) : 1;
	enemyDmg *= dailyEmpowerToggle && !mapping && dailyEmpower && dailyExplosive ? 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength) : 1;
	enemyDmg *= type === 'map' && mapping && dailyExplosive ? 1 + dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength) : 1
	enemyDmg *= (type === 'world' || type === 'void') && dailyCrit && gammaToTrigger > 1 ? 1 + dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength) : 1;
	enemyDmg *= runningMayhem && ((!mapping && currentCell === 99) || mapping) ? 1.2 : 1
	enemyDmg *= dailyEmpowerToggle && type === 'map' && dailyCrit ? dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength) : 1;
	var enemyDmgEquality = 0;

	//Misc dmg mult
	if (dailyWeakness) ourDmg *= (1 - ((game.global.dailyChallenge.weakness.stacks + (fastEnemy ? 1 : 0)) * game.global.dailyChallenge.weakness.strength) / 100)

	//Fast Enemy conditions
	var fastEnemy = !game.global.preMapsActive && fastimps.includes(enemyName);
	if (type === 'world' && game.global.world > 200 && game.global.gridArray[currentCell].u2Mutation.length > 0) fastEnemy = true;
	if (!mapping && (dailyEmpower || runningSmithless)) fastEnemy = true;
	if (type === 'map' && dailyExplosive) fastEnemy = true;
	if (type === 'world' && dailyExplosive) fastEnemy = true;
	if (game.global.voidBuff === 'doubleAttack') fastEnemy = true
	if (runningArchaeology) fastEnemy = true;
	if (noFrenzy) fastEnemy = true;
	if (runningTrappa) fastEnemy = true;
	if (runningDuel && !mapping) fastEnemy = true;
	if (runningQuest) fastEnemy = true;
	if (runningExperienced) fastEnemy = false;
	if (runningGlass) fastEnemy = true;
	if (runningBerserk) fastEnemy = true;
	if (runningDesolation) fastEnemy = true;
	if (runningDuel && game.challenges.Duel.enemyStacks < 10) fastEnemy = true;

	//Making sure we get the Duel health bonus by suiciding trimps with 0 equality
	if (runningDuel && fastEnemy && (calcOurHealth(false, type) * 10 * 0.9) > remainingHealth(true) && gammaToTrigger === gammaMaxStacks && game.global.armyAttackCount === 0) {
		game.portal.Equality.disabledStackCount = 0;
		if (parseNum(document.getElementById('equalityStacks').children[0].innerHTML.replace(/\D/g, '')) !== game.portal.Equality.disabledStackCount) manageEqualityStacks();
		updateEqualityScaling();
		return;
	}

	//Suiciding to get max bloodthirst stacks if our avg attacks to kill is greater than the attacks to proc a bloodthirst stack. 
	if (dailyBloodthirst && mapping && fastEnemy) {
		var maxStacks = dailyModifiers.bloodthirst.getMaxStacks(game.global.dailyChallenge.bloodthirst.strength);
		var currStacks = game.global.dailyChallenge.bloodthirst.stacks;
		var stacksToProc = dailyModifiers.bloodthirst.getFreq(game.global.dailyChallenge.bloodthirst.strength) - (game.global.dailyChallenge.bloodthirst.stacks % dailyModifiers.bloodthirst.getFreq(game.global.dailyChallenge.bloodthirst.strength));
		var avgTrimpAttack = (ourDmg * Math.pow(game.portal.Equality.getModifier(1),
			equalityQuery(enemyName, zone, currentCell, type, difficulty, 'gamma')) * gammaDmg)
		var timeToKill = enemyHealth / avgTrimpAttack;

		if (currStacks !== maxStacks && stacksToProc < timeToKill) {
			game.portal.Equality.disabledStackCount = 0;
			if (parseNum(document.getElementById('equalityStacks').children[0].innerHTML.replace(/\D/g, '')) !== game.portal.Equality.disabledStackCount) manageEqualityStacks();
			updateEqualityScaling();
			return;
		}
	}

	if (enemyHealth > 0) {
		for (var i = 0; i <= maxEquality; i++) {
			enemyDmgEquality = enemyDmg * Math.pow(game.portal.Equality.getModifier(), i);
			ourDmgEquality = ourDmg * Math.pow(game.portal.Equality.getModifier(1), i);

			if (runningMayhem) enemyDmgEquality += game.challenges.Mayhem.poison;

			if (runningUnlucky) {
				unluckyDmgEquality = unluckyDmg * Math.pow(game.portal.Equality.getModifier(1), i);
				if (unluckyDmgEquality.toString()[0] % 2 == 1 && i !== maxEquality) continue;
			}


			if (voidPBSwap && !fastEnemy && calcOurDmg('max', i, false, 'void', 'force', 0, true) > enemyHealth && (typeof (game.global.mapGridArray[game.global.lastClearedMapCell + 2].plaguebringer) === 'undefined' || game.global.mapGridArray[game.global.lastClearedMapCell + 2].plaguebringer < getCurrentEnemy().maxHealth) && (getCurrentEnemy().maxHealth * .05 < enemyHealth)) {
				game.portal.Equality.disabledStackCount = maxEquality;
				while (calcOurDmg('max', i, false, 'void', 'force', 0, true) > getCurrentEnemy().health && i < maxEquality) {
					i++;
				}
				continue;
			}
			if (!fastEnemy && !runningGlass && !runningBerserk && !runningArchaeology && !runningQuest) {
				game.portal.Equality.disabledStackCount = i;
				break;
			}
			else if ((ourHealth < (ourHealthMax * 0.65) || runningDuel && game.global.armyAttackCount !== 0) && gammaToTrigger == gammaMaxStacks && !runningTrappa && !runningArchaeology && !runningBerserk) {
				if (game.global.mapsUnlocked && !mapping && !runningMayhem) {
					mapsClicked();
					mapsClicked();
				}
				else if (game.global.mapsUnlocked && mapping && currentCell > 0 && type !== 'void' && (!runningQuest && game.global.titimpLeft === 0)) {
					mapsClicked();
					rRunMap();
				}
				else
					game.portal.Equality.disabledStackCount = 0;
				break;
			} else if (fastEnemy && enemyDmgEquality > ourHealth) {
				game.portal.Equality.disabledStackCount = maxEquality;
			} else if (runningMayhem && fastEnemy && enemyDmgEquality > ((game.global.soldierHealth * 6) + game.challenges.Mayhem.poison)) {
				continue;
			} else if ((ourDmgEquality * gammaDmg) < enemyHealth && (gammaToTrigger > 1 || (gammaToTrigger > 1 && fuckGamma))) {
				game.portal.Equality.disabledStackCount = maxEquality;
				break;
			} else if (ourHealth > enemyDmgEquality && gammaToTrigger <= 1) {
				game.portal.Equality.disabledStackCount = i;
				if (debugStats) queryAutoEqualityStats(ourDmgEquality, ourHealth, enemyDmgEquality, enemyHealth, i)
				break;
			} else if (ourHealth > enemyDmgEquality && ourDmgEquality > enemyHealth) {
				game.portal.Equality.disabledStackCount = i;
				break;
			} else if (ourHealth > (enemyDmgEquality * gammaToTrigger) && ourDmgEquality * gammaDmg > enemyHealth && !fuckGamma) {
				game.portal.Equality.disabledStackCount = i;
				break;
			} else if (ourHealth > (enemyDmgEquality * gammaToTrigger) && ourDmgEquality * gammaToTrigger > enemyHealth && !fuckGamma) {
				game.portal.Equality.disabledStackCount = i;
				break;
			} else if (ourHealth > (enemyDmgEquality * gammaToTrigger) && !fuckGamma) {
				game.portal.Equality.disabledStackCount = i;
				break;
			} else {
				game.portal.Equality.disabledStackCount = maxEquality;
			}
		}
		if (parseNum(document.getElementById('equalityStacks').children[0].innerHTML.replace(/\D/g, '')) !== game.portal.Equality.disabledStackCount) manageEqualityStacks();
		updateEqualityScaling();
	}
}

function queryAutoEqualityStats(ourDamage, ourHealth, enemyDmgEquality, enemyHealth, equalityStacks, dmgMult) {
	debug("Equality = " + equalityStacks)
	debug("Our dmg (min) = " + ourDamage.toFixed(4) + " | " + "Our health = " + ourHealth.toFixed(4))
	debug("Enemy dmg = " + enemyDmgEquality.toFixed(4) + " | " + "Enemy health = " + enemyHealth.toFixed(4))
	if (dmgMult) debug("Mult = " + dmgMult)
}

function reflectShouldBuyEquips() {
	if (challengeActive('Daily')) {
		if (typeof (game.global.dailyChallenge.mirrored) !== 'undefined') {
			var ourHealth = calcOurHealth(false, 'world');
			var ourDamage = calcOurDmg('max', (game.portal.Equality.radLevel - 15), false, 'world', 'force', 0, false)
			var gammaToTrigger = autoBattle.oneTimers.Burstier.owned ? 4 : 5;
			var reflectPct = dailyModifiers.mirrored.getMult(game.global.dailyChallenge.mirrored.strength);
			var critChance = (getPlayerCritChance() - Math.floor(getPlayerCritChance())) * 100
			if (!(game.portal.Tenacity.getMult() === Math.pow(1.4000000000000001, getPerkLevel("Tenacity") + getPerkLevel("Masterfulness")))) {
				ourDamage /= game.portal.Tenacity.getMult();
				ourDamage *= Math.pow(1.4000000000000001, getPerkLevel("Tenacity") + getPerkLevel("Masterfulness"));
			}
			if (ourDamage * (1 + (reflectPct * gammaToTrigger)) > ourHealth) {
				return true
			}

		}
	}
	return false;
}

function simpleSecondsLocal(what, seconds, event, ssWorkerRatio) {
	var event = !event ? null : event;
	var ssWorkerRatio = !ssWorkerRatio ? null : ssWorkerRatio;

	if (typeof ssWorkerRatio !== 'undefined' && ssWorkerRatio !== null) {
		var desiredRatios = Array.from(ssWorkerRatio.split(','))
		desiredRatios = [desiredRatios[0] !== undefined ? Number(desiredRatios[0]) : 0,
		desiredRatios[1] !== undefined ? Number(desiredRatios[1]) : 0,
		desiredRatios[2] !== undefined ? Number(desiredRatios[2]) : 0,
		desiredRatios[3] !== undefined ? Number(desiredRatios[3]) : 0]
		var totalFraction = desiredRatios.reduce((a, b) => { return a + b; });
	}
	heirloomPrefix = game.global.universe === 2 ? 'R' : 'H';
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
		jobName == "Miner" && challengeActive('Pandemonium') && getPageSetting("RhsPandStaff") !== 'undefined' ? "RhsPandStaff" :
			jobName == "Farmer" && getPageSetting(heirloomPrefix + "hsFoodStaff") != 'undefined' ? (heirloomPrefix + "hsFoodStaff") :
				jobName == "Lumberjack" && getPageSetting(heirloomPrefix + "hsWoodStaff") != 'undefined' ? (heirloomPrefix + "hsWoodStaff") :
					jobName == "Miner" && getPageSetting(heirloomPrefix + "hsMetalStaff") != 'undefined' ? (heirloomPrefix + "hsMetalStaff") :
						getPageSetting(heirloomPrefix + "hsMapStaff") != 'undefined' ? (heirloomPrefix + "hsMapStaff") :
							getPageSetting(heirloomPrefix + "hsWorldStaff") != 'undefined' ? (heirloomPrefix + "hsWorldStaff") :
								null;
	var job = game.jobs[jobName];
	var trimpworkers = ((game.resources.trimps.realMax() / 2) - game.jobs.Explorer.owned - game.jobs.Meteorologist.owned - game.jobs.Worshipper.owned);
	var workers = ssWorkerRatio !== null ? Math.floor(trimpworkers * desiredRatios[pos] / totalFraction) :
		currentMap === 'Worshipper Farm' ? trimpworkers :
			job.owned;

	var amt_local = workers * job.modifier * seconds;
	amt_local += (amt_local * getPerkLevel("Motivation") * game.portal.Motivation.modifier);
	if (what != "gems" && game.permaBoneBonuses.multitasking.owned > 0)
		amt_local *= (1 + game.permaBoneBonuses.multitasking.mult());
	if (what != "science" && what != "fragments" && challengeActive('Alchemy'))
		amt_local *= alchObj.getPotionEffect("Potion of Finding");

	if (game.global.pandCompletions && game.global.universe == 2 && what != "fragments")
		amt_local *= game.challenges.Pandemonium.getTrimpMult();
	if (getPerkLevel("Observation") > 0 && game.portal.Observation.trinkets > 0)
		amt_local *= game.portal.Observation.getMult();

	if (what == "food" || what == "wood" || what == "metal") {
		if (ssWorkerRatio) {
			amt_local *= calculateParityBonus(desiredRatios, HeirloomSearch(heirloom));
		}
		else amt_local *= getParityBonus();
		if (autoBattle.oneTimers.Gathermate.owned)
			amt_local *= autoBattle.oneTimers.Gathermate.getMult();
	}
	if ((what == "food" && game.buildings.Antenna.owned >= 5) || (what == "metal" && game.buildings.Antenna.owned >= 15))
		amt_local *= game.jobs.Meteorologist.getExtraMult();
	if (Fluffy.isRewardActive('gatherer'))
		amt_local *= 2;
	if (what == "wood" && challengeActive('Hypothermia') && game.challenges.Hypothermia.bonfires > 0)
		amt_local *= game.challenges.Hypothermia.getWoodMult();
	if (challengeActive('Unbalance'))
		amt_local *= game.challenges.Unbalance.getGatherMult();

	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.famine !== 'undefined' && what != "fragments" && what != "science")
			amt_local *= dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength);
		if (typeof game.global.dailyChallenge.dedication !== 'undefined')
			amt_local *= dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength);
	}
	if (challengeActive('Melt')) {
		amt_local *= 10;
		amt_local *= Math.pow(game.challenges.Melt.decayValue, game.challenges.Melt.stacks);
	}

	if (game.global.stringVersion >= '5.9.0' && challengeActive('Desolation'))
		amt *= game.challenges.Desolation.trimpResourceMult();
	if (game.challenges.Nurture.boostsActive())
		amt_local *= game.challenges.Nurture.getResourceBoost();

	//Calculating heirloom bonus
	amt_local = calcHeirloomBonusLocal(HeirloomModSearch(heirloom, jobName + "Speed"), amt_local);

	var turkimpBonus = game.talents.turkimp2.purchased ? 2 : game.talents.turkimp2.purchased ? 1.75 : 1.5;

	if ((game.talents.turkimp2.purchased || game.global.turkimpTimer > 0) && (what == "food" || what == "metal" || what == "wood")) {
		amt_local *= turkimpBonus;
		amt_local += getPlayerModifier() * seconds;
	}
	return amt_local;
}

function calculateParityBonus(workerRatio, heirloom) {
	if (!game.global.StaffEquipped || game.global.StaffEquipped.rarity < 10) {
		game.global.parityBonus = 1;
		return;
	}
	var allowed = ["Farmer", "Lumberjack", "Miner"];
	var totalWorkers = 0;
	var numWorkers = [];
	if (!workerRatio) {
		for (var x = 0; x < allowed.length; x++) {
			var thisWorkers = game.jobs[allowed[x]].owned;
			totalWorkers += thisWorkers;
			numWorkers[x] = thisWorkers;
		}
		var workerRatios = [];
		for (var x = 0; x < numWorkers.length; x++) {
			workerRatios.push(numWorkers[x] / totalWorkers);
		}
	} else {
		var freeWorkers = Math.ceil(Math.min(game.resources.trimps.realMax() / 2), game.resources.trimps.owned) - (game.resources.trimps.employed - game.jobs.Explorer.owned - game.jobs.Meteorologist.owned - game.jobs.Worshipper.owned);
		var workerRatios = workerRatio;
		var ratio = workerRatios.reduce((a, b) => a + b, 0)
		var freeWorkerDivided = freeWorkers / ratio;

		for (var x = 0; x < allowed.length; x++) {
			var thisWorkers = freeWorkerDivided * workerRatios[x];
			totalWorkers += thisWorkers;
			numWorkers[x] = thisWorkers;
		}
	}
	var resourcePop = totalWorkers;
	resourcePop = Math.log(resourcePop) / Math.log(3);
	var largestWorker = Math.log(Math.max(...numWorkers)) / Math.log(3);
	var spreadFactor = resourcePop - largestWorker;
	var preLoomBonus = (spreadFactor * spreadFactor);
	var finalWithParity = (1 + preLoomBonus) * getHazardParityMult(heirloom);
	game.global.parityBonus = finalWithParity;
	return finalWithParity;
}

function calcHeirloomBonusLocal(mod, number) {
	var mod = mod;
	if (game.global.stringVersion >= '5.9.0') {
		if (challengeActive('Daily') && typeof game.global.dailyChallenge.heirlost !== 'undefined')
			mod *= dailyModifiers.heirlost.getMult(game.global.dailyChallenge.heirlost.strength);
	}
	if (!mod) return;

	return (number * ((mod / 100) + 1));
}

function scaleToCurrentMapLocal(amt_local, ignoreBonuses, ignoreScry, map) {
	if (map) map = game.global.world + map;
	if (!map) map = game.global.mapsActive ? getCurrentMapObject().level :
		challengeActive('Pandemonium') ? game.global.world - 1 :
			game.global.world;
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
	var maploot = game.global.farmlandsUnlocked && game.singleRunBonuses.goldMaps.owned ? 3.6 : game.global.decayDone && game.singleRunBonuses.goldMaps.owned ? 2.85 : game.global.farmlandsUnlocked ? 2.6 : game.global.decayDone ? 1.85 : 1.6;
	//Add map loot bonus
	amt_local = Math.round(amt_local * maploot);
	if (ignoreBonuses) return amt_local;
	amt_local = scaleLootBonuses(amt_local, ignoreScry);
	return amt_local;
}

function formatTimeForDescriptions(number) {
	var timeTaken = '';
	var seconds = Math.floor((number) % 60);
	var minutes = Math.floor((number / 60) % 60);
	var hours = Math.floor((number / 60 / 60));
	if (hours > 0) timeTaken += (hours + "h");
	if (minutes > 0) timeTaken += (minutes + "m");
	timeTaken += (seconds + "s");

	return timeTaken;
}

function timeForFormatting(number) {
	return Math.floor((getGameTime() - number) / 1000);
}

function mappingDetails(mapName, mapLevel, mapSpecial, extra, extra2, extra3) {
	if (!getPageSetting('rMapRepeatCount')) return;
	if (!mapName) return;

	//Figuring out exact amount of maps run
	if (mapName !== 'Smithy Farm') {
		var mapProg = game.global.mapsActive ? ((getCurrentMapCell().level - 1) / getCurrentMapObject().size) : 0;
		var mappingLength = mapProg > 0 ? (game.global.mapRunCounter + mapProg).toFixed(2) : game.global.mapRunCounter;
	}
	//Setting special to current maps special if we're in a map.
	if (game.global.mapsActive) mapSpecial = getCurrentMapObject().bonus === undefined ? "no special" : getCurrentMapObject().bonus;

	var timeMapping = currTime > 0 ? currTime : getGameTime();
	var message = '';
	if (mapName !== 'Void Map' && mapName !== 'Quagmire Farm' && mapName !== 'Smithy Farm') {
		message += (mapName + " (Z" + game.global.world + ") took " + (mappingLength) + " (" + (mapLevel >= 0 ? "+" : "") + mapLevel + " " + mapSpecial + ")" + (mappingLength == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(timeMapping)) + ".");
	}
	else if (mapName === 'Smithy Farm') {
		message += (mapName + " (Z" + game.global.world + ") took " + MODULES.mapFunctions.smithyMapCount[0] + " food, " + MODULES.mapFunctions.smithyMapCount[1] + " wood, " + MODULES.mapFunctions.smithyMapCount[2] + " metal maps (" + (mapLevel >= 0 ? "+" : "") + mapLevel + ")" + " and " + formatTimeForDescriptions(timeForFormatting(timeMapping)) + ".");
	}
	else if (mapName === 'Quagmire Farm') {
		message += (mapName + " (Z" + game.global.world + ") took " + (mappingLength) + (mappingLength == 1 ? " map" : " maps") + " and " + formatTimeForDescriptions(timeForFormatting(timeMapping)) + ".");
	}
	else {
		message += (mapName + " (Z" + game.global.world + ") took " + formatTimeForDescriptions(timeForFormatting(timeMapping)) + ".");
	}

	if (mapName === 'Void Map') {
		message += " Started with " + MODULES.mapFunctions.rVoidVHDRatio.toFixed(2) + " and ended with a Void HD Ratio of " + voidHDRatio.toFixed(2) + ".";
	}

	if (mapName === 'Tribute Farm') {
		message += " Finished with (" + game.buildings.Tribute.purchased + "/" + extra + ") Tributes and (" + game.jobs.Meteorologist.owned + "/" + extra2 + ") Meteorologists.";
	}

	if (mapName === 'Smithy Farm') {
		message += " Finished with (" + game.buildings.Smithy.purchased + "/" + extra + ") Smithies.";
	}

	if (mapName === 'Insanity Farm') {
		message += " Finished with (" + game.challenges.Insanity.insanity + "/" + extra + ") stacks.";
	}

	if (mapName === 'Alchemy Farm') {
		message += " Finished with (" + extra + "/" + extra2 + ") " + extra3 + ".";
	}

	if (mapName === 'Hypothermia Farm') {
		message += " Finished with (" + prettify(game.resources.wood.owned) + "/" + extra.toFixed(2) + ") wood.";
	}

	if (mapName === 'Smithless Farm') {
		message += " Finished with enough damage to get (" + extra + "/3) stacks.";
	}

	if (mapName === 'HD Farm') {
		message += " Finished with a HD Ratio of (" + extra.toFixed(2) + "/" + extra2.toFixed(2) + ").";
	}

	debug(message);
}

function resetSettingsPortal() {

	const universePrefix = game.global.universe === 2 ? 'R' : '';
	const universePrefixAlt = game.global.universe === 2 ? 'R' : 'H';
	const universePrefixAltLower = universePrefixAlt.toLowerCase()

	//Enabling Auto Portal
	if (getPageSetting(universePrefix + 'automapsportal') && getPageSetting(universePrefix + 'AutoMaps') == 0) {
		autoTrimpSettings[universePrefix + "AutoMaps"].value = 1;
		document.getElementById(universePrefix + 'AutoMaps').setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings[universePrefix + 'AutoMaps'].enabled);
		document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + autoTrimpSettings[universePrefix + 'AutoMaps'].value);
	}
	//Enabling Auto Equip
	if (autoTrimpSettings[universePrefixAlt + 'autoequipportal'].enabled) {
		autoTrimpSettings[universePrefixAlt + 'equipon'].enabled = true;
		document.getElementById(universePrefixAlt + 'equipon').setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings[universePrefixAlt + 'equipon'].enabled);
		document.getElementById('autoEquipLabel').parentNode.setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings[universePrefixAlt + 'equipon'].enabled);
	}
	//Setting buildings to off
	if (typeof (autoTrimpSettings[universePrefixAltLower + 'BuildingSettingsArray'].value.portalOption) !== 'undefined' && autoTrimpSettings[universePrefixAltLower + 'BuildingSettingsArray'].value.portalOption === 'on') {
		autoTrimpSettings[universePrefix + 'BuyBuildingsNew'].enabled = true;
		document.getElementById(universePrefix + 'BuyBuildingsNew').setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings[universePrefix + 'BuyBuildingsNew'].enabled);
		document.getElementById('autoStructureLabel').parentNode.setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings[universePrefix + 'BuyBuildingsNew'].enabled);
	}
	//Setting buildings to off
	if (typeof (autoTrimpSettings[universePrefixAltLower + 'BuildingSettingsArray'].value.portalOption) !== 'undefined' && autoTrimpSettings[universePrefixAltLower + 'BuildingSettingsArray'].value.portalOption === 'off') {
		autoTrimpSettings[universePrefix + 'BuyBuildingsNew'].enabled = false;
		document.getElementById(universePrefix + 'BuyBuildingsNew').setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings[universePrefix + 'BuyBuildingsNew'].enabled);
		document.getElementById('autoStructureLabel').parentNode.setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoTrimpSettings[universePrefix + 'BuyBuildingsNew'].enabled);
	}
	//Setting jobs to off
	if (typeof (autoTrimpSettings[universePrefixAltLower + 'JobSettingsArray'].value.portalOption) !== 'undefined' && autoTrimpSettings[universePrefixAltLower + 'JobSettingsArray'].value.portalOption === 'autojobs off') {
		autoTrimpSettings[universePrefix + 'BuyJobsNew'].value = 0;
		document.getElementById(universePrefix + 'BuyJobsNew').setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + (autoTrimpSettings[universePrefix + 'BuyJobsNew'].value == 2 ? 3 : autoTrimpSettings[universePrefix + 'BuyJobsNew'].value));
		document.getElementById('autoJobLabel').parentNode.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + (autoTrimpSettings[universePrefix + 'BuyJobsNew'].value == 2 ? 3 : autoTrimpSettings[universePrefix + 'BuyJobsNew'].value));
	}
	if (typeof (autoTrimpSettings[universePrefixAltLower + 'JobSettingsArray'].value.portalOption) !== 'undefined' && autoTrimpSettings[universePrefixAltLower + 'JobSettingsArray'].value.portalOption === 'auto ratios') {
		autoTrimpSettings[universePrefix + 'BuyJobsNew'].value = 1;
		document.getElementById(universePrefix + 'BuyJobsNew').setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + (autoTrimpSettings[universePrefix + 'BuyJobsNew'].value == 2 ? 3 : autoTrimpSettings[universePrefix + 'BuyJobsNew'].value));
		document.getElementById('autoJobLabel').parentNode.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + (autoTrimpSettings[universePrefix + 'BuyJobsNew'].value == 2 ? 3 : autoTrimpSettings[universePrefix + 'BuyJobsNew'].value));
	}
	if (typeof (autoTrimpSettings[universePrefixAltLower + 'JobSettingsArray'].value.portalOption) !== 'undefined' && autoTrimpSettings[universePrefixAltLower + 'JobSettingsArray'].value.portalOption === 'manual ratios') {
		autoTrimpSettings[universePrefix + 'BuyJobsNew'].value = 2;
		document.getElementById(universePrefix + 'BuyJobsNew').setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + (autoTrimpSettings[universePrefix + 'BuyJobsNew'].value == 2 ? 3 : autoTrimpSettings[universePrefix + 'BuyJobsNew'].value));
		document.getElementById('autoJobLabel').parentNode.setAttribute('class', 'toggleConfigBtnLocal noselect settingsBtn settingBtn' + (autoTrimpSettings[universePrefix + 'BuyJobsNew'].value == 2 ? 3 : autoTrimpSettings[universePrefix + 'BuyJobsNew'].value));
	}
	updateButtonText()
	saveSettings();
}

function resetMapVars(setting) {
	const totalPortals = getTotalPortals();
	currentMap = undefined;
	rAutoLevel = Infinity;
	currTime = 0;
	mapRepeats = 0;
	game.global.mapRunCounter = 0;
	if (setting) setting.done = (totalPortals + "_" + game.global.world);
	saveSettings();
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

		if (item === 'fragments' && game.global.universe === 2) resourcesAvailable = autoTrimpSettings.rBuildingSettingsArray.value.SafeGateway.zone !== 0 && game.global.world >= autoTrimpSettings.rBuildingSettingsArray.value.SafeGateway.zone ? resourcesAvailable :
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

function minMapFrag(level, specialModifier, biome) {

	var sliders = [9, 9, 9];
	var perfect = true;
	if (game.resources.fragments.owned < PerfectMapCost_Actual(level, specialModifier, biome)) {
		perfect = false;

		while (sliders[0] > 0 && sliders[2] > 0 && PerfectMapCost_Actual(level, specialModifier, biome, sliders, perfect) > game.resources.fragments.owned) {
			sliders[0] -= 1;
			if (PerfectMapCost_Actual(level, specialModifier, biome, sliders, perfect) <= game.resources.fragments.owned) break;
			sliders[2] -= 1;
		}
	}

	return PerfectMapCost_Actual(level, specialModifier, biome, sliders, perfect);
}

function PerfectMapCost_Actual(plusLevel, specialModifier, biome, sliders = [9, 9, 9], perfect = true) {
	if (!specialModifier) return Infinity
	if (!plusLevel && plusLevel !== 0) return Infinity
	var specialModifier = specialModifier;
	var plusLevel = plusLevel;
	var baseCost = 0;
	//All sliders at 9
	baseCost += sliders[0];
	baseCost += sliders[1];
	baseCost += sliders[2];
	var mapLevel = game.global.world;
	if (plusLevel < 0)
		mapLevel = mapLevel + plusLevel;
	if (mapLevel < 6)
		mapLevel = 6;
	baseCost *= (game.global.world >= 60) ? 0.74 : 1;
	//Perfect checked
	if (perfect && sliders.reduce(function (a, b) { return a + b; }, 0) === 27) baseCost += 6;
	//Adding in plusLevels
	if (plusLevel > 0)
		baseCost += (plusLevel * 10)
	if (specialModifier != "0")
		baseCost += mapSpecialModifierConfig[specialModifier].costIncrease;
	baseCost += mapLevel;
	baseCost = Math.floor((((baseCost / 150) * (Math.pow(1.14, baseCost - 1))) * mapLevel * 2) * Math.pow((1.03 + (mapLevel / 50000)), mapLevel));
	baseCost *= biome !== 'Random' ? 2 : 1;
	return baseCost;
}

function runUnique(mapName, dontRecycle) {
	if (game.global.mapsActive && getCurrentMapObject().name === mapName) return;
	if (mapName === 'Atlantrimp' && game.global.universe === 1) mapName = 'Trimple Of Doom'
	var zone = game.global.world;
	var cell = game.global.lastClearedCell + 2;
	if (mapName === 'Melting Point' && (!game.mapUnlocks.SmithFree.canRunOnce || zone < 55 || (zone === 55 && cell < 56))) return
	if ((mapName === 'Atlantrimp' || mapName === 'Trimple Of Doom') && (!game.mapUnlocks.AncientTreasure.canRunOnce || zone < 33 || (zone === 33 && cell < 32))) return

	if (!game.global.preMapsActive && !game.global.mapsActive)
		mapsClicked();
	if (!dontRecycle && game.global.mapsActive && getCurrentMapObject().name !== mapName) {
		mapsClicked();
		recycleMap();
	}

	if (game.global.preMapsActive) {
		for (var map in game.global.mapsOwnedArray) {
			if (game.global.mapsOwnedArray[map].name === mapName) {
				selectMap(game.global.mapsOwnedArray[map].id)
				rRunMap();
				debug('Running ' + mapName + ' on zone ' + game.global.world + '.');
				if (mapName === 'Atlantrimp' || mapName === 'Trimple Of Doom') rBSRunningAtlantrimp = true;
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

function downloadSave() {
	const universePrefix = game.global.universe === 2 ? 'R' : ''
	if (!getPageSetting(universePrefix + 'downloadSaves')) return

	tooltip('Export', null, 'update');
	document.getElementById("downloadLink").click();
	cancelTooltip();
}

function hypoPackratReset(challenge) {

	if (challenge === 'Hypothermia' && autoTrimpSettings.rHypoDefaultSettings.value.packrat) {
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

function allocatePerks() {
	if (!game.global.portalActive) return;
	if (portalUniverse === 1 && getPageSetting('AutoAllocatePerks') !== 2) return;
	if (portalUniverse === 2 && getPageSetting('RAutoAllocatePerks') === 0) return;
	var allocatePerk = portalUniverse === 1 ? 'Looting_II' : getPageSetting('RAutoAllocatePerks') == 1 ? 'Looting' : getPageSetting('RAutoAllocatePerks') == 2 ? 'Greed' : getPageSetting('RAutoAllocatePerks') == 3 ? 'Motivation' : null;
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
	if (!challengeActive('Daily')) return 0;
	if (game.global.universe === 1) return 0;
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

	var highlightSetting = game.global.universe === 1 ? getPageSetting('hEquipEfficientEquipDisplay') : getPageSetting('rEquipEfficientEquipDisplay');

	if (!highlightSetting) return;

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

	for (var item in game.equipment) {
		if (game.equipment[item].locked) continue;
		if (item == "Shield") continue;
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

function getAvailableSpecials(special) {

	var cacheMods = [];
	var bestMod;

	if (special === 'lsc') cacheMods = ['lsc', 'hc', 'ssc', 'lc'];
	else if (special === 'lwc') cacheMods = ['lwc', 'hc', 'swc', 'lc'];
	else if (special === 'lmc') cacheMods = ['lmc', 'hc', 'smc', 'lc'];
	else if (special === 'p') cacheMods = ['p', 'fa'];
	else cacheMods = [special];

	var hze = getHighestLevelCleared();
	var unlocksAt = game.global.universe === 2 ? 'unlocksAt2' : 'unlocksAt';

	for (const mod of cacheMods) {
		if (mapSpecialModifierConfig[mod][unlocksAt] <= hze) {
			bestMod = mod;
			break;
		}
	}
	if (bestMod === undefined) bestMod = '0';
	return bestMod;
}

function displayDropdowns(universe, runType, MAZ, varPrefix) {

	if (!universe) universe = game.global.universe;
	if (!MAZ) MAZ = '';
	let dropdown;
	var highestZone = universe === 1 ? game.global.highestLevelCleared + 1 : game.global.highestRadonLevelCleared + 1;

	if (runType === 'Gather') {
		dropdown += "<option value='food'" + ((MAZ == 'food') ? " selected='selected'" : "") + ">Food</option >\
		<option value='wood'" + ((MAZ == 'wood') ? " selected = 'selected'" : "") + " > Wood</option >\
		<option value='metal'" + ((MAZ == 'metal') ? " selected = 'selected'" : "") + " > Metal</option >\
		<option value='science'" + ((MAZ == 'science') ? " selected = 'selected'" : "") + " > Science</option > "
	}

	if (runType === 'hdType') {
		dropdown += "<option value='world'" + ((MAZ == 'world') ? " selected='selected'" : "") + ">World</option >\
		<option value='map'" + ((MAZ == 'map') ? " selected = 'selected'" : "") + " > Map</option >\
		<option value='void'" + ((MAZ == 'void') ? " selected = 'selected'" : "") + " > Void</option >"
	}

	if (runType === 'prestigeGoal') {
		dropdown += "<option value='All'" + ((MAZ == 'All') ? " selected='selected'" : "") + ">All</option >\
		<option value='Shield'" + ((MAZ == 'Shield') ? " selected='selected'" : "") + ">Shield</option >\
		<option value='Dagger'" + ((MAZ == 'Dagger') ? " selected='selected'" : "") + ">Dagger</option >\
		<option value='Boots'" + ((MAZ == 'Boots') ? " selected = 'selected'" : "") + " > Boots</option >\
		<option value='Mace'" + ((MAZ == 'Mace') ? " selected = 'selected'" : "") + " > Mace</option >\
		<option value='Helmet'" + ((MAZ == 'Helmet') ? " selected = 'selected'" : "") + " > Helmet</option >\
		<option value='Polearm'" + ((MAZ == 'Polearm') ? " selected = 'selected'" : "") + " > Polearm</option >\
		<option value='Pants'" + ((MAZ == 'Pants') ? " selected = 'selected'" : "") + " > Pants</option >\
		<option value='Battleaxe'" + ((MAZ == 'Battleaxe') ? " selected = 'selected'" : "") + " > Battleaxe</option >\
		<option value='Shoulderguards'" + ((MAZ == 'Shoulderguards') ? " selected = 'selected'" : "") + " > Shoulderguards</option >\
		<option value='Greatsword'" + ((MAZ == 'Greatsword') ? " selected = 'selected'" : "") + " > Greatsword</option >\
		<option value='Breastplate'" + ((MAZ == 'Breastplate') ? " selected = 'selected'" : "") + " > Breastplate</option >"
		if (game.global.slowDone) dropdown += "<option value='Arbalest'" + ((MAZ == 'Arbalest') ? " selected='selected'" : "") + ">Arbalest</option>"
		if (game.global.slowDone) dropdown += "<option value='Gambeson'" + ((MAZ == 'Gambeson') ? " selected='selected'" : "") + ">Gambeson</option>"
	}

	if (universe === 1) {
		if (runType === 'Cache') {
			//Specials dropdown with conditions for each unlock to only appear when the user can run them.
			dropdown += "<option value='0'" + ((MAZ == '0') ? " selected='selected'" : "") + ">No Modifier</option>"
			if (highestZone >= 60) dropdown += "<option value='fa'" + ((MAZ == 'fa') ? " selected='selected'" : "") + ">Fast Attack</option>\<option value='lc'" + ((MAZ == 'lc') ? " selected='selected'" : "") + ">Large Cache</option>"
			if (highestZone >= 85) dropdown += "<option value = 'ssc'" + ((MAZ == 'ssc') ? " selected = 'selected'" : "") + " > Small Savory Cache</option >\
				<option value='swc'" + ((MAZ == 'swc') ? " selected = 'selected'" : "") + " > Small Wooden Cache</option >\
				<option value='smc'" + ((MAZ == 'smc') ? " selected = 'selected'" : "") + " > Small Metal Cache</option > "
			if (highestZone >= 135) dropdown += "<option value='p'" + ((MAZ == 'p') ? " selected='selected'" : "") + ">Prestigious</option>"
			if (highestZone >= 160) dropdown += "<option value='hc'" + ((MAZ == 'hc') ? " selected='selected'" : "") + ">Huge Cache</option>"
			if (highestZone >= 185) dropdown += "<option value='lsc'" + ((MAZ == 'lsc') ? " selected='selected'" : "") + ">Large Savory Cache</option>\
				<option value='lwc'" + ((MAZ == 'lwc') ? " selected='selected'" : "") + ">Large Wooden Cache</option>\
				<option value='lmc'" + ((MAZ == 'lmc') ? " selected='selected'" : "") + ">Large Metal Cache</option>"
		}
		if (runType === 'Filler') {
			dropdown += "<option value='All'" + ((MAZ == 'All') ? " selected='selected'" : "") + ">All</option>";
			if (highestZone >= 40) dropdown += "<option value='Balance'" + ((MAZ == 'Balance') ? " selected='selected'" : "") + ">Balance</option>";
			if (highestZone >= 55) dropdown += "<option value = 'Decay'" + ((MAZ == 'Decay') ? " selected = 'selected'" : "") + " >Decay</option >";
			if (game.global.prisonClear >= 1) dropdown += "<option value='Electricity'" + ((MAZ == 'Electricity') ? " selected='selected'" : "") + ">Electricity</option>";
			if (highestZone >= 110) dropdown += "<option value='Life'" + ((MAZ == 'Life') ? " selected='selected'" : "") + ">Life</option>";
			if (highestZone >= 125) dropdown += "<option value='Crushed'" + ((MAZ == 'Crushed') ? " selected='selected'" : "") + ">Crushed</option>";
			if (highestZone >= 145) dropdown += "<option value='Nom'" + ((MAZ == 'Nom') ? " selected='selected'" : "") + ">Nom</option>";
			if (highestZone >= 165) dropdown += "<option value='Toxicity'" + ((MAZ == 'Toxicity') ? " selected='selected'" : "") + ">Toxicity</option>";
			if (highestZone >= 180) dropdown += "<option value='Watch'" + ((MAZ == 'Watch') ? " selected='selected'" : "") + ">Watch</option>";
			if (highestZone >= 180) dropdown += "<option value='Lead'" + ((MAZ == 'Lead') ? " selected='selected'" : "") + ">Lead</option>";
			if (highestZone >= 190) dropdown += "<option value='Corrupted'" + ((MAZ == 'Corrupted') ? " selected='selected'" : "") + ">Corrupted</option>";
			if (highestZone >= 215) dropdown += "<option value='Domination'" + ((MAZ == 'Domination') ? " selected='selected'" : "") + ">Domination</option>";
			if (highestZone >= 600) dropdown += "<option value='Experience'" + ((MAZ == 'Experience') ? " selected='selected'" : "") + ">Experience</option>";
		}
		else if (runType === 'C3') {
			dropdown += "<option value='All'" + ((MAZ == 'All') ? " selected='selected'" : "") + ">All</option>";
			if (getTotalPerkResource(true) >= 30) dropdown += "<option value='Discipline'" + ((MAZ == 'Discipline') ? " selected='selected'" : "") + ">Discipline</option>";
			if (highestZone >= 25) dropdown += "<option value='Metal'" + ((MAZ == 'Metal') ? " selected='selected'" : "") + ">Metal</option>";
			if (highestZone >= 35) dropdown += "<option value='Size'" + ((MAZ == 'Size') ? " selected='selected'" : "") + ">Size</option>";
			if (highestZone >= 40) dropdown += "<option value = 'Balance'" + ((MAZ == 'Balance') ? " selected = 'selected'" : "") + " > Balance</option >";
			if (highestZone >= 45) dropdown += "<option value='Meditate'" + ((MAZ == 'Meditate') ? " selected='selected'" : "") + ">Meditate</option>";
			if (highestZone >= 60) dropdown += "<option value='Trimp'" + ((MAZ == 'Trimp') ? " selected='selected'" : "") + ">Trimp</option>";
			if (highestZone >= 70) dropdown += "<option value='Trapper'" + ((MAZ == 'Trapper') ? " selected='selected'" : "") + ">Trapper</option>";
			if (game.global.prisonClear >= 1) dropdown += "<option value='Electricity'" + ((MAZ == 'Electricity') ? " selected='selected'" : "") + ">Electricity</option>";
			if (highestZone >= 120) dropdown += "<option value='Coordinate'" + ((MAZ == 'Coordinate') ? " selected='selected'" : "") + ">Coordinate</option>";
			if (highestZone >= 130) dropdown += "<option value='Slow'" + ((MAZ == 'Slow') ? " selected='selected'" : "") + ">Slow</option>";
			if (highestZone >= 145) dropdown += "<option value='Nom'" + ((MAZ == 'Nom') ? " selected='selected'" : "") + ">Nom</option>";
			if (highestZone >= 150) dropdown += "<option value='Mapology'" + ((MAZ == 'Mapology') ? " selected='selected'" : "") + ">Mapology</option>";
			if (highestZone >= 165) dropdown += "<option value='Toxicity'" + ((MAZ == 'Toxicity') ? " selected='selected'" : "") + ">Toxicity</option>";
			if (highestZone >= 180) dropdown += "<option value='Watch'" + ((MAZ == 'Watch') ? " selected='selected'" : "") + ">Watch</option>";
			if (highestZone >= 180) dropdown += "<option value='Lead'" + ((MAZ == 'Lead') ? " selected='selected'" : "") + ">Lead</option>";
			if (highestZone >= 425) dropdown += "<option value='Obliterated'" + ((MAZ == 'Obliterated') ? " selected='selected'" : "") + ">Obliterated</option>";
			if (game.global.totalSquaredReward >= 4500) dropdown += "<option value='Eradicated'" + ((MAZ == 'Eradicated') ? " selected='selected'" : "") + ">Eradicated</option>";
		}
		else if (runType === 'runType') {
			dropdown += "<option value='All'" + ((MAZ == 'All') ? " selected='selected'" : "") + ">All</option>"
			dropdown += "<option value='Filler'" + ((MAZ == 'Filler') ? " selected = 'selected'" : "") + " > Filler</option >"
			dropdown += " <option value='Daily'" + ((MAZ == 'Daily') ? " selected='selected'" : "") + ">Daily</option>"
			dropdown += "<option value='C3'" + ((MAZ == 'C3') ? " selected='selected'" : "") + ">C2</option>"
		}
		else if (runType === 'goldenType') {
			if (!varPrefix.includes('C3')) dropdown += "<option value='h'" + ((MAZ == 'h') ? " selected='selected'" : "") + ">Helium</option >"
			dropdown += "<option value='b'" + ((MAZ == 'b') ? " selected = 'selected'" : "") + " >Battle</option >"
			dropdown += "<option value='v'" + ((MAZ == 'v') ? " selected = 'selected'" : "") + " >Void</option >"
		}
	}

	if (universe === 2) {
		if (runType === 'Cache') {
			//Specials dropdown with conditions for each unlock to only appear when the user can run them.
			dropdown += "<option value='0'" + ((MAZ == '0') ? " selected='selected'" : "") + ">No Modifier</option>"
			if (highestZone >= 15) dropdown += "<option value='fa'" + ((MAZ == 'fa') ? " selected='selected'" : "") + ">Fast Attack</option>\<option value='lc'" + ((MAZ == 'lc') ? " selected='selected'" : "") + ">Large Cache</option>"
			if (highestZone >= 25) dropdown += "<option value = 'ssc'" + ((MAZ == 'ssc') ? " selected = 'selected'" : "") + " > Small Savory Cache</option >\
				<option value='swc'" + ((MAZ == 'swc') ? " selected = 'selected'" : "") + " > Small Wooden Cache</option >\
				<option value='smc'" + ((MAZ == 'smc') ? " selected = 'selected'" : "") + " > Small Metal Cache</option > "
			if (game.global.ArchaeologyDone) dropdown += "<option value='src'" + ((MAZ == 'src') ? " selected='selected'" : "") + ">Small Research Cache</option>"
			if (highestZone >= 55) dropdown += "<option value='p'" + ((MAZ == 'p') ? " selected='selected'" : "") + ">Prestigious</option>"
			if (highestZone >= 65) dropdown += "<option value='hc'" + ((MAZ == 'hc') ? " selected='selected'" : "") + ">Huge Cache</option>"
			if (highestZone >= 85) dropdown += "<option value='lsc'" + ((MAZ == 'lsc') ? " selected='selected'" : "") + ">Large Savory Cache</option>\
				<option value='lwc'" + ((MAZ == 'lwc') ? " selected='selected'" : "") + ">Large Wooden Cache</option>\
				<option value='lmc'" + ((MAZ == 'lmc') ? " selected='selected'" : "") + ">Large Metal Cache</option>"
			if (game.global.ArchaeologyDone) dropdown += "<option value='lrc'" + ((MAZ == 'lrc') ? " selected='selected'" : "") + ">Large Research Cache</option>"
		}
		if (runType === 'Filler') {
			dropdown += "<option value='All'" + ((MAZ == 'All') ? " selected='selected'" : "") + ">All</option>";
			if (highestZone >= 40) dropdown += "<option value='Bublé'" + ((MAZ == 'Bublé') ? " selected='selected'" : "") + ">Bublé</option>";
			if (highestZone >= 55) dropdown += "<option value = 'Melt'" + ((MAZ == 'Melt') ? " selected = 'selected'" : "") + " > Melt</option >";
			if (highestZone >= 70) dropdown += "<option value='Quagmire'" + ((MAZ == 'Quagmire') ? " selected='selected'" : "") + ">Quagmire</option>";
			if (highestZone >= 90) dropdown += "<option value='Archaeology'" + ((MAZ == 'Archaeology') ? " selected='selected'" : "") + ">Archaeology</option>";
			if (highestZone >= 110) dropdown += "<option value='Insanity'" + ((MAZ == 'Insanity') ? " selected='selected'" : "") + ">Insanity</option>";
			if (highestZone >= 135) dropdown += "<option value='Nurture'" + ((MAZ == 'Nurture') ? " selected='selected'" : "") + ">Nurture</option>";
			if (highestZone >= 155) dropdown += "<option value='Alchemy'" + ((MAZ == 'Alchemy') ? " selected='selected'" : "") + ">Alchemy</option>";
			if (highestZone >= 175) dropdown += "<option value='Hypothermia'" + ((MAZ == 'Hypothermia') ? " selected='selected'" : "") + ">Hypothermia</option>";
		}
		else if (runType === 'C3') {
			dropdown += "<option value='All'" + ((MAZ == 'All') ? " selected='selected'" : "") + ">All</option>";
			if (highestZone >= 15) dropdown += "<option value='Unlucky'" + ((MAZ == 'Unlucky') ? " selected='selected'" : "") + ">Unlucky</option>";
			if (highestZone >= 20) dropdown += "<option value='Downsize'" + ((MAZ == 'Downsize') ? " selected='selected'" : "") + ">Downsize</option>";
			if (highestZone >= 25) dropdown += "<option value='Transmute'" + ((MAZ == 'Transmute') ? " selected='selected'" : "") + ">Transmute</option>";
			if (highestZone >= 35) dropdown += "<option value = 'Unbalance'" + ((MAZ == 'Unbalance') ? " selected = 'selected'" : "") + " > Unbalance</option >";
			if (highestZone >= 45) dropdown += "<option value='Duel'" + ((MAZ == 'Duel') ? " selected='selected'" : "") + ">Duel</option>";
			if (highestZone >= 60) dropdown += "<option value='Trappapalooza'" + ((MAZ == 'Trappapalooza') ? " selected='selected'" : "") + ">Trappa</option>";
			if (highestZone >= 70) dropdown += "<option value='Wither'" + ((MAZ == 'Wither') ? " selected='selected'" : "") + ">Wither</option>";
			if (highestZone >= 85) dropdown += "<option value='Quest'" + ((MAZ == 'Quest') ? " selected='selected'" : "") + ">Quest</option>";
			if (highestZone >= 100) dropdown += "<option value='Mayhem'" + ((MAZ == 'Mayhem') ? " selected='selected'" : "") + ">Mayhem</option>";
			if (highestZone >= 105) dropdown += "<option value='Storm'" + ((MAZ == 'Storm') ? " selected='selected'" : "") + ">Storm</option>";
			if (highestZone >= 115) dropdown += "<option value='Berserk'" + ((MAZ == 'Berserk') ? " selected='selected'" : "") + ">Berserk</option>";
			if (highestZone >= 150) dropdown += "<option value='Pandemonium'" + ((MAZ == 'Pandemonium') ? " selected='selected'" : "") + ">Pandemonium</option>";
			if (highestZone >= 175) dropdown += "<option value='Glass'" + ((MAZ == 'Glass') ? " selected='selected'" : "") + ">Glass</option>";
			if (game.global.stringVersion >= '5.9.0' && highestZone >= 200) dropdown += "<option value='Desolation'" + ((MAZ == 'Desolation') ? " selected='selected'" : "") + ">Desolation</option>";
			if (highestZone >= 201) dropdown += "<option value='Smithless'" + ((MAZ == 'Smithless') ? " selected='selected'" : "") + ">Smithless</option>";
		}
		else if (runType === 'runType') {
			dropdown += "<option value='All'" + ((MAZ == 'All') ? " selected='selected'" : "") + ">All</option>"
			dropdown += "<option value='Filler'" + ((MAZ == 'Filler') ? " selected = 'selected'" : "") + " > Filler</option >"
			dropdown += " <option value='Daily'" + ((MAZ == 'Daily') ? " selected='selected'" : "") + ">Daily</option>"
			dropdown += "<option value='C3'" + ((MAZ == 'C3') ? " selected='selected'" : "") + ">C3</option>"
		}
		else if (runType === 'goldenType') {
			if (!varPrefix.includes('C3')) dropdown += "<option value='r'" + ((MAZ == 'r') ? " selected='selected'" : "") + ">Radon</option >"
			dropdown += "<option value='b'" + ((MAZ == 'b') ? " selected = 'selected'" : "") + " >Battle</option >"
			dropdown += "<option value='v'" + ((MAZ == 'v') ? " selected = 'selected'" : "") + " >Void</option >"
		}
	}

	return dropdown;
}

function challengeActive(what) {
	if (game.global.stringVersion >= '5.9.0' && game.global.multiChallenge[what]) return true;
	else if (game.global.challengeActive == what) return true;
	else return false;
}

function getSpecialTime(special, maps, noImports) {
	if (!special) special = getAvailableSpecials('lmc');
	if (!maps) maps = 1;
	var specialTime = 0;

	//Figuring out loot time our selected cache gives us
	specialTime +=
		special[0] === 'l' && special.length === 3 ? 20 :
			special === 'hc' ? 10 :
				special[0] === 's' ? 10 :
					special === 'lc' ? 5 :
						0;

	specialTime *= maps;
	if (!noImports) {
		specialTime += game.unlocks.imps.Chronoimp ? (5 * maps) : 0;
		if (maps >= 4) specialTime += (Math.floor(maps / 4) * 45);
	}

	return (specialTime);
}

function getShredHtml() {
	var html = "";
	html += "<div class='boneShrineBtn generatorState' id='generatorWindow'>"
	html += "<div class='col-shred'><div id='shredTickContainer'> <div id='shredRadialContainer' class='radial-progress'> <div class='radial-progress-circle'> <div class='radial-progress-arrow static''></div></div><div " + "id='shredRadial' class='radial-progress-circle'> <div class='radial-progress-arrow mobile'></div> </div> <div id='clockKnob' class='radial-progress-knob'></div></div><span id='shredNextTick' style='pointer-events: none;'>0</span></div></div></div></div>";
	html += "</div>";
	return html;
}

var shredTime = 0;
function updateNextShredTickTime() {
	//update tick time
	var nextTickElem = document.getElementById('shredNextTick');
	if (!nextTickElem) return;

	/* var innerhtml = getShredHtml();
	innerhtml += $('#wood').innerHTML;
	$('#wood').innerHTML = innerhtml;
	updateNextShredTickTime() */

	var tickTime = game.global.stringVersion >= '5.9.0' ? 30 : 15;
	var nextTickIn = game.global.hemmTimer;
	var framesPerVisual = 10;
	nextTickIn /= 10;
	nextTickIn = (isNumberBad(nextTickIn)) ? 0 : nextTickIn;
	nextTickIn = Math.round(nextTickIn * 10) / 10;
	if (date.getMilliseconds() % 1 === 0) {
		shredTime = framesPerVisual - 1;
	}

	if (nextTickElem)
		nextTickElem.innerHTML = (prettify(Math.floor(nextTickIn)));
	var countingTick = Math.round((tickTime - nextTickIn) * 10) / 10;
	countingTick = Math.round(countingTick * 10) / 10;
	if (shredTime >= framesPerVisual - 1) {
		shredTime = 0;
		var timeRemaining = tickTime - countingTick;
		if (timeRemaining != 0 && timeRemaining <= framesPerVisual / 10) {
			timeRemaining -= 0.1;
			timeRemaining = Math.round(timeRemaining * 10) / 10;
			shredTime = framesPerVisual;
			framesPerVisual = timeRemaining * 10;
			shredTime -= framesPerVisual;
		}
		goRadial(document.getElementById('shredRadial'), countingTick, tickTime, 10 * framesPerVisual);
	}
	else shredTime++;
}