var selectedMutPreset = 0;

function presetMutTab(tabNum) {
	if (selectedMutPreset === tabNum) return;
	swapClass('btn btn-lg btn-', 'btn btn-lg btn-info', document.getElementById('u2MutSave'));
	swapClass('btn btn-lg btn-', 'btn btn-lg btn-info', document.getElementById('u2MutLoad'));

	//Enabling load/save buttons if a preset is selected
	if (selectedMutPreset === 0) {
		swapClass('disabled', 'active', document.getElementById('u2MutSave'));
		swapClass('disabled', 'active', document.getElementById('u2MutLoad'));
	}

	//Highlighting the selected tab
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
			what = headingName;

			var storedSave = localStorage.mutatorPresets === undefined ? {} : JSON.parse(localStorage.mutatorPresets);
			var preset = {};
			if (!isObjectEmpty(storedSave) && !isObjectEmpty(storedSave['preset' + textString])) preset = storedSave['preset' + textString];

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
	if (localStorage.mutatorPresets === undefined) localStorage.mutatorPresets = JSON.stringify({});

	var storedSave = JSON.parse(localStorage.mutatorPresets);
	var saveData = {};
	saveData.purchaseCount = u2Mutations.purchaseCount;
	//Looping through all the mutators and saving the ones that are purchased
	for (var item in u2Mutations.tree) {
		saveData[item] = u2Mutations.tree[item].purchased;
	}
	storedSave['preset' + selectedMutPreset] = saveData;
	localStorage.mutatorPresets = JSON.stringify(storedSave);
}

function loadMutations(preset) {

	var preset = !preset ? selectedMutPreset : preset;
	if (preset === 0) return;

	var storedSave = JSON.parse(localStorage.mutatorPresets);
	if (storedSave['preset' + preset].length === 0) return;
	const outerRing = [];

	var saveData = storedSave['preset' + preset];
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

//Runs this every 100ms
setInterval(presetMutations, 100);