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



var selectedMutPreset = 0;

function presetMutTab(tabNum) {
	if (selectedMutPreset === tabNum) return;
	swapClass('btn btn-lg btn-', 'btn btn-lg btn-info', document.getElementById('u2MutSave'));
	swapClass('btn btn-lg btn-', 'btn btn-lg btn-info', document.getElementById('u2MutLoad'));

	if (selectedMutPreset === 0) {
		swapClass('disabled', 'active', document.getElementById('u2MutSave'));
		swapClass('disabled', 'active', document.getElementById('u2MutLoad'));
	}

	swapClass('btn btn-lg btn-', 'btn btn-lg btn-success', document.getElementById('u2MutPresetBtn' + tabNum));
	if (selectedMutPreset > 0) swapClass('btn btn-lg btn-', 'btn btn-lg btn-info', document.getElementById('u2MutPresetBtn' + selectedMutPreset));
	selectedMutPreset = tabNum;
}


function tooltipAT(what, isItIn, event, textString, headingName) {
	checkAlert(what, isItIn);
	if (game.global.lockTooltip && event != 'update') return;
	if (game.global.lockTooltip && isItIn && event == 'update') return;
	var elem = document.getElementById("tooltipDiv");
	swapClass("tooltipExtra", "tooltipExtraNone", elem);
	document.getElementById('tipText').className = "";
	var ondisplay = null; // if non-null, called after the tooltip is displayed
	openTooltip = null;

	var tooltipText;
	var costText = "";
	var titleText;

	if (what == "Perk Preset") {
		if (headingName == "Save") {
			what = "Save Mutation Preset";
			tooltipText = "Click to save your current mutation loadout to the selected preset";
		}
		else if (headingName == "Load") {
			what = "Load Mutation Preset";
			tooltipText = "Click to load your currently selected mutation preset. Be warned if you have any mutators purchased that differ from your loadout then it won't be 100% accurate.";
		}
		else if (textString > 0 && textString <= 3) {
			var preset = {};
			if (autoTrimpSettings['presetMutations'].value['preset' + textString].length !== 0)
				preset = JSON.parse(autoTrimpSettings['presetMutations'].value['preset' + textString]);
			what = headingName;
			if (isObjectEmpty(preset)) {
				tooltipText = "<span class='red'>This Preset slot is empty!</span> Select this slot and then click 'Save' to save your current Mutator configuration to this slot.";
			}
			else {
				tooltipText = "<p style='font-weight: bold'>This Preset holds " + preset.purchaseCount + " mutators:</p>";
				var count = 0;
				for (var item in preset) {
					if (item == "Name") continue;
					if (item === 'purchaseCount') continue;
					if (preset[item] === false) continue;
					let mutName = item;
					if (u2Mutations.tree[item].dn) mutName = u2Mutations.tree[item].dn;

					if (count > 0 && mutName === 'Scruffy' || mutName === 'Overkill' || mutName === 'Health' || mutName === 'Mazzy') tooltipText += "<br><br>";
					if (mutName === 'Scruffy') tooltipText += '<b>Yellow</b><br>'
					else if (mutName === 'Overkill') tooltipText += '<b>Green</b><br>'
					else if (mutName === 'Health') tooltipText += '<b>Purple</b><br>'
					else if (mutName === 'Mazzy') tooltipText += '<b>Blue</b><br>'

					else tooltipText += (count > 0) ? ", " : "";
					tooltipText += mutName;
					count++;
				}
			}
		}
	}

	titleText = titleText ? titleText : what;
	lastTooltipTitle = titleText;

	document.getElementById("tipTitle").innerHTML = titleText;
	document.getElementById("tipText").innerHTML = tooltipText;
	document.getElementById("tipCost").innerHTML = costText;
	elem.style.display = "block";
	if (ondisplay !== null)
		ondisplay();
	if (event != "update") positionTooltip(elem, event);
}

function saveMutations() {
	if (selectedMutPreset === 0) return;
	var saveData = {};
	saveData.purchaseCount = u2Mutations.purchaseCount;
	for (var item in u2Mutations.tree) {
		saveData[item] = u2Mutations.tree[item].purchased;
	}
	autoTrimpSettings['presetMutations'].value['preset' + selectedMutPreset] = JSON.stringify(saveData);
	saveSettings();
}

function loadMutations(preset) {

	var preset = !preset ? selectedMutPreset : preset;
	if (preset === 0) return;
	if (autoTrimpSettings['presetMutations'].value['preset' + preset].length === 0) return;
	const outerRing = [];

	var saveData = JSON.parse(autoTrimpSettings['presetMutations'].value['preset' + preset]);
	delete saveData.purchaseCount;
	for (var item in u2Mutations.tree) {
		if (item.purchased) continue;
		if (saveData[item] === true) {
			if (!u2Mutations.checkRequirements(item)) outerRing.push(item);
			else u2Mutations.purchase(item);
		}
	}

	while (outerRing.length > 0 && game.global.mutatedSeeds > u2Mutations.nextCost()) {
		if (!u2Mutations.checkRequirements(outerRing[0])) outerRing.push(outerRing.shift());
		let mutName = outerRing[0];
		if (u2Mutations.checkRequirements(mutName)) {
			u2Mutations.purchase(mutName);
			outerRing.shift();
		}
	}

	u2Mutations.save();
	u2Mutations.load();
}

function presetMutations() {

	if (!u2Mutations.open) return;
	if (document.getElementById('u2MutPresetBtn1') !== null) return;

	//Setting up initial variables that will be called later during for loop
	const containerID = ['u2MutPresetBtn1', 'u2MutPresetBtn2', 'u2MutPresetBtn3', 'u2MutSave', 'u2MutLoad'];
	const containerText = ['Filler Preset', 'Daily Preset', 'C3 Preset', 'Save', 'Load'];
	const onClick = ['presetMutTab(1)', 'presetMutTab(2)', 'presetMutTab(3)', 'saveMutations()', 'loadMutations(selectedMutPreset)'];

	document.getElementById('swapToMasteryBtn').insertAdjacentHTML('afterend', '<br>');
	for (var x = 5; x > 0; x--) {
		//Insert break to replace later
		document.getElementById('swapToMasteryBtn').insertAdjacentHTML('afterend', '<br>');

		var u2MutContainer = document.createElement("SPAN");
		u2MutContainer.setAttribute("style", "font-size: 1.1em; margin-top: 0.25em;");
		u2MutContainer.setAttribute("id", containerID[x - 1]);
		//Disable save/load buttons if no preset is selected
		if (x > 3 && selectedMutPreset === 0)
			u2MutContainer.setAttribute('class', 'btn btn-lg btn-default disabled');
		//Set button class based on selected preset
		else if (x === selectedMutPreset)
			u2MutContainer.setAttribute('class', 'btn btn-lg btn-success');
		else
			u2MutContainer.setAttribute('class', 'btn btn-lg btn-info');
		u2MutContainer.setAttribute("onmouseover", 'tooltipAT("Perk Preset", null, event, ' + x + ', "' + containerText[x - 1] + '\")');
		u2MutContainer.setAttribute("onmouseout", 'tooltip("hide")');
		u2MutContainer.innerHTML = containerText[x - 1];
		u2MutContainer.setAttribute("onClick", onClick[x - 1]);

		var u2MutColumn = document.getElementById("swapToMasteryBtn").parentNode;
		//Replace earlier line break with setup element & then inserting another one
		u2MutColumn.replaceChild(u2MutContainer, document.getElementById("swapToMasteryBtn").parentNode.children[3]);
		document.getElementById('swapToMasteryBtn').insertAdjacentHTML('afterend', '<br>');
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
	return;
	if (!getPageSetting('automateSpireAssault')) return;
	if (autoBattle.enemyLevel === 121) {
		if (autoBattle.rings.level === 49 && autoBattle.shards >= autoBattle.getRingLevelCost()) {
			autoBattle.levelRing();
		}
	}

	if (autoBattle.rings.level === 50 && (autoBattle.items.Basket_of_Souls.level === 10 || autoBattle.items.Snimp__Fanged_Blade.level === 11)) {
		if (autoBattle.items.Basket_of_Souls.level === 10 && autoBattle.shards >= autoBattle.upgradeCost('Basket_of_Souls'))
			autoBattle.upgrade('Basket_of_Souls');
		if (autoBattle.items.Snimp__Fanged_Blade.level === 11 && autoBattle.shards >= autoBattle.upgradeCost('Snimp__Fanged_Blade'))
			autoBattle.upgrade('Snimp__Fanged_Blade');
	}

	if (autoBattle.rings.level >= 50) {
		if (autoBattle.enemyLevel == 130) { //Done
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'lifesteal']
		}
		if (autoBattle.enemyLevel == 131) { //Done
			var items = [['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Grounded_Crown'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'lifesteal']
		}
		if (autoBattle.enemyLevel === 132) { //Done
			var items = [['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Bloodstained_Gloves'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Grounded_Crown'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'lifesteal']
		}
		if (autoBattle.enemyLevel == 133) { //Done
			var items = [['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'lifesteal']
		}
		if (autoBattle.enemyLevel == 134) { //Done
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Grounded_Crown'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'lifesteal']
		}
		if (autoBattle.enemyLevel == 135) { //Done
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Lifegiving_Gem'], ['Spiked_Gloves'], ['Wired_Wristguards'], ['Bloodstained_Gloves'], ['Eelimp_in_a_Bottle'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Grounded_Crown'], ['Fearsome_Piercer'], ['Doppelganger_Signet'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'lifesteal']
		}
		if (autoBattle.enemyLevel == 136) { //Done 2d10h
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 137) { //Done 18h47m
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 138) { //Done 1d20h
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 139) { //Done 1d6h
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'health']
		}
		if (autoBattle.enemyLevel == 140) { //Done 3d6h
			var items = [['Menacing_Mask'], ['Battery_Stick'], ['Spiked_Gloves'], ['Tame_Snimp'], ['Wired_Wristguards'], ['Big_Cleaver'], ['Sacrificial_Shank'], ['Fearsome_Piercer'], ['Bag_of_Nails'], ['Snimp__Fanged_Blade'], ['Doppelganger_Signet'], ['Basket_of_Souls'], ['Omni_Enhancer'], ['Stormbringer'], ['Nullifium_Armor'], ['Haunted_Harpoon']]
			var ring = ['attack', 'health']
		}
	}

	//Swapping Items
	if (autoBattle.sessionEnemiesKilled == 0 && autoBattle.enemy.baseHealth == autoBattle.enemy.health && autoBattle.maxEnemyLevel === autoBattle.enemyLevel) {
		ABItemSwap(items, ring);
		autoBattle.popup(true, false, true);
	}

	//Turning off autoLevel
	if (autoBattle.maxEnemyLevel >= 129 && autoBattle.rings.level < 50) {
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