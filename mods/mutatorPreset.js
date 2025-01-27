if (typeof MODULES !== 'object') {
	MODULES = {};
}

if (typeof atConfig === 'undefined') {
	MODULES.mutatorPreset = {
		selected: 0
	};

	function checkLiqZoneCount(universe = game.global.universe, getAmount = false) {
		if (game.options.menu.liquification.enabled === 0 && universe === 1) return 0;

		if (universe === 2) {
			if (!u2Mutations.tree.Liq1.purchased) return 0;

			let amt = 0.1;
			if (u2Mutations.tree.Liq2.purchased) amt = 0.2;

			if (getAmount) return amt;
			return (getHighestLevelCleared(false, true) + 1) * amt;
		}

		let spireCount = game.global.spiresCompleted;
		if (masteryPurchased('liquification')) spireCount++;
		if (masteryPurchased('liquification2')) spireCount++;
		if (masteryPurchased('liquification3')) spireCount += 2;
		spireCount += Fluffy.isRewardActive('liquid') * 0.5;
		const liquidAmount = spireCount / 20;

		if (getAmount) return liquidAmount;
		return game.stats.highestLevel.valueTotal() * liquidAmount;
	}
}

function presetMutTab(tabNum) {
	if (MODULES.mutatorPreset.selected === tabNum) return;

	const buttons = ['u2MutSave', 'u2MutLoad', 'u2MutRename', 'u2MutReset'];
	buttons.forEach((button) => {
		swapClass('btn btn-lg btn-', 'btn btn-lg btn-info', document.getElementById(button));
		if (MODULES.mutatorPreset.selected === 0) {
			swapClass('disabled', 'active', document.getElementById(button));
		}
	});

	swapClass('btn btn-lg btn-', 'btn btn-lg btn-success', document.getElementById('u2MutPresetBtn' + tabNum));
	if (MODULES.mutatorPreset.selected > 0) {
		swapClass('btn btn-lg btn-', 'btn btn-lg btn-info', document.getElementById('u2MutPresetBtn' + MODULES.mutatorPreset.selected));
	}
	MODULES.mutatorPreset.selected = tabNum;
}

function tooltipAT(what, event, textString, headingName) {
	let elem = document.getElementById('tooltipDiv2');
	swapClass('tooltipExtra', 'tooltipExtraNone', elem);
	document.getElementById('tipText').className = '';
	let ondisplay = null;
	let tooltipText = '';
	let costText = '';
	let titleText = what;

	if (what === 'hide') {
		elem.style.display = 'none';
		return;
	}

	if (what === 'Mutator Preset') {
		if (headingName === 'Save') {
			what = 'Save Mutation Preset';
			tooltipText = 'Click to save your current mutation loadout to the selected preset';
		} else if (headingName === 'Rename') {
			what = 'Rename Mutator Preset';
			tooltipText = 'Click to set a name for your currently selected mutator preset';
		} else if (headingName === 'Load') {
			what = 'Load Mutation Preset';
			tooltipText = "Click to load your currently selected mutation preset. Be warned if you have any mutators purchased that differ from your loadout then it won't be 100% accurate.";
		} else if (headingName === 'Reset') {
			what = 'Reset Mutation Preset';
			tooltipText = 'Click to reset your currently selected mutation preset. This will remove all mutators from the preset and set it to empty so when portaling you could end up with no mutators active.';
		} else if (textString > 0 && textString <= 3) {
			const mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));
			const preset = mutatorObj['preset' + textString];

			if (typeof autoTrimpSettings !== 'undefined' && autoTrimpSettings.ATversion.includes('SadAugust')) {
				const presetMessages = {
					1: 'This preset will be loaded when portaling into <b>Filler</b> challenges with the <b>Preset Swap Mutators</b> setting enabled.',
					2: 'This preset will be loaded when portaling into <b>Daily</b> challenges with the <b>Preset Swap Mutators</b> setting enabled.',
					3: 'This preset will be loaded when portaling into <b>C3 or special challenges (Mayhem, Pandemonium, Desolation)</b> with the <b>Preset Swap Mutators</b> setting enabled.'
				};

				tooltipText += `<p>${presetMessages[textString] || ''}</p>`;
			}

			what = headingName;
			if (isObjectEmpty(preset) || Object.keys(preset).length <= 1) {
				tooltipText += "<span class='red'>This preset slot is empty!</span> Select this slot and then click 'Save' to save your current Mutator configuration to this slot.";
			} else {
				tooltipText += "<p style='font-weight: bold'>This preset holds " + preset.purchaseCount + ' mutators:</p>';
				let count = 0;
				const colorMapping = {
					Scruffy: 'Yellow',
					Overkill: 'Green',
					Health: 'Purple',
					Mazzy: 'Blue'
				};

				for (let item in preset) {
					if (['name', 'purchaseCount'].includes(item) || !preset[item]) continue;
					const mutName = u2Mutations.tree[item].dn ? u2Mutations.tree[item].dn : item;

					if (colorMapping[mutName]) {
						if (count > 0) tooltipText += '<br><br>';
						tooltipText += `<b>${colorMapping[mutName]}</b><br>`;
					} else {
						tooltipText += count > 0 ? ', ' : '';
					}
					tooltipText += mutName;
					count++;
				}
			}
		}
	} else if (what === 'Rename Preset') {
		const presetGroup = JSON.parse(localStorage.getItem('mutatorPresets'));
		const preset = presetGroup['preset' + MODULES.mutatorPreset.selected];
		const oldName = preset && preset.name ? preset.name : '';
		tooltipText = `Type a name below for your Mutator Preset! This name will show up on the Preset bar and make it easy to identify which Preset is which.
		<br/><br/><input id='renamePresetBox' maxlength='25' style='width: 50%' value='${oldName}' />`;
		costText = `<div class='maxCenter'>
		<div id='confirmTooltipBtn' class='btn btn-info' onclick='renameMutations()'>Apply</div>
		<div class='btn btn-info' onclick='cancelTooltipAT(true); unlockTooltip();'>Cancel </div>
		</div>`;

		game.global.lockTooltip = true;
		elem.style.left = '33.75%';
		elem.style.top = '25%';

		ondisplay = function () {
			const box = document.getElementById('renamePresetBox');
			try {
				box.setSelectionRange(0, box.value.length);
			} catch (e) {
				box.select();
			}
			box.focus();
		};
	} else if (what === 'Mastery Info') {
		let text = `<p><b>Mastery Data for Universe ${game.global.universe}</b></p>`;

		const bsOwned = game.talents.blacksmith3.purchased ? 'blacksmith3' : game.talents.blacksmith2.purchaseCount ? 'blacksmith2' : game.talents.blacksmith.purchaseCount ? 'blacksmith' : false;
		if (bsOwned) {
			text += `<p><b>${game.talents[bsOwned].name}</b>`;
			text += `<br>${game.talents[bsOwned].description}</p>`;
		}

		const hyperspeedOwned = game.talents.hyperspeed2.purchased ? 'hyperspeed2' : game.talents.hyperspeed.purchased ? 'hyperspeed' : false;

		if (hyperspeedOwned) {
			text += `<p><b>${game.talents[hyperspeedOwned].name}</b>`;
			text += `<br>${game.talents[hyperspeedOwned].description}</p>`;
		}

		text += `<p><b>${'Liquification Amount'}</b>`;
		text += `<br>Each cleared Zone through Z${Math.floor(checkLiqZoneCount())} (${checkLiqZoneCount(undefined, true) * 100}% of your highest Zone reached) will be liquified.</p>`;

		tooltipText = text;
	} else if (what === 'Spire Assault Import') {
		const ringMods = autoBattle.oneTimers.The_Ring.owned ? ' and ring modifiers' : '';
		tooltipText = `Are you sure you want to import your current items${ringMods} the <b>${textString}</b> preset into Spire Assault?`;
		if (autoBattle.oneTimers.The_Ring.owned) tooltipText += `<br>Ring Modifiers will only be imported if you have selected enough for the max slots available.`;
		tooltipText += `<br><br><b>Warning:</b> This will use your saved version of this preset. If you have made changes to your items since saving, they will be overwritten.`;

		costText = `<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip2(true); spireAssaultImport("${headingName}"); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Import</div><div class='btn btn-info' onclick='cancelTooltip2(true); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Cancel</div></div>`;

		document.getElementById('tooltipDiv2').style.zIndex = 9;
		ondisplay = function () {
			_verticalCenterTooltip(true, undefined, '2');
		};
	} else if (what === 'Spire Assault Export') {
		const ringMods = autoBattle.oneTimers.The_Ring.owned ? ' and ring modifiers' : '';
		tooltipText = `Are you sure you want to import your current items${ringMods} from Spire Assault into the <b>${textString}</b> preset?`;
		costText = `<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip2(true); spireAssaultExport("${headingName}"); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Import</div><div class='btn btn-info' onclick='cancelTooltip2(true); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Cancel</div></div>`;

		document.getElementById('tooltipDiv2').style.zIndex = 9;
		ondisplay = function () {
			_verticalCenterTooltip(true, undefined, '2');
		};
	}

	document.getElementById('tipTitle2').innerHTML = titleText;
	document.getElementById('tipText2').innerHTML = tooltipText;
	document.getElementById('tipCost2').innerHTML = costText;
	elem.style.display = 'block';
	if (ondisplay !== null) ondisplay();
	if (event !== 'update' && !what.includes('Spire Assault')) positionTooltip(elem, event);
}

// Correct function to call to cancel the current tooltip
function cancelTooltip2(ignore1) {
	tooltipAT('hide');

	if (!ignore1) {
		document.getElementById('tooltipDiv').style.display = 'none';
	}

	document.getElementById('tipCost2').innerHTML = '';
	document.getElementById('tipText2').className = '';
}

function saveMutations() {
	if (MODULES.mutatorPreset.selected === 0) return;

	u2Mutations.save();
	u2Mutations.load();

	const mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));
	const saveData = {
		...game.global.u2MutationData,
		purchaseCount: u2Mutations.purchaseCount,
		name: document.getElementById('u2MutPresetBtn' + MODULES.mutatorPreset.selected).innerHTML.split('Preset: ')[1]
	};

	mutatorObj['preset' + MODULES.mutatorPreset.selected] = saveData;

	if (typeof autoTrimpSettings !== 'undefined' && autoTrimpSettings.ATversion.includes('SadAugust')) {
		autoTrimpSettings['mutatorPresets'].valueU2 = JSON.stringify(mutatorObj);
		saveSettings();
	}

	localStorage.setItem('mutatorPresets', JSON.stringify(mutatorObj));
}

function loadMutations(preset = MODULES.mutatorPreset.selected) {
	if (preset === 0) return;
	const mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));

	const saveData = mutatorObj['preset' + preset];
	delete saveData.name;
	delete saveData.purchaseCount;

	if (Object.keys(saveData).length === 0) return;
	const outerRing = [];

	for (let item in u2Mutations.tree) {
		if (item.purchased) continue;
		if (saveData[item] === true) {
			if (!u2Mutations.checkRequirements(item)) outerRing.push(item);
			else u2Mutations.purchase(item);
		}
	}

	while (outerRing.length > 0 && game.global.mutatedSeeds > u2Mutations.nextCost()) {
		if (!u2Mutations.checkRequirements(outerRing[0])) outerRing.push(outerRing.shift());
		const mutName = outerRing[0];
		if (u2Mutations.checkRequirements(mutName)) {
			u2Mutations.purchase(mutName);
			outerRing.shift();
		}
	}

	u2Mutations.save();
	u2Mutations.load();
}

function renameMutations(needTooltip) {
	if (MODULES.mutatorPreset.selected === 0) return;
	let mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));
	let presetGroup = mutatorObj['preset' + MODULES.mutatorPreset.selected];

	if (needTooltip) {
		tooltipAT('Rename Preset', 'update');
		return;
	}

	const elem = document.getElementById('renamePresetBox');
	if (!elem || !elem.value) return;
	presetGroup.name = htmlEncode(elem.value.substring(0, 25));
	cancelTooltip();

	document.getElementById('u2MutPresetBtn' + MODULES.mutatorPreset.selected).innerHTML = presetGroup.name ? 'Preset: ' + presetGroup.name : 'Preset: ' + MODULES.mutatorPreset.selected;
	mutatorObj['preset' + MODULES.mutatorPreset.selected] = presetGroup;
	if (typeof autoTrimpSettings !== 'undefined' && autoTrimpSettings.ATversion.includes('SadAugust')) {
		autoTrimpSettings['mutatorPresets'].valueU2 = JSON.stringify(mutatorObj);
		saveSettings();
	}

	localStorage.setItem('mutatorPresets', JSON.stringify(mutatorObj));
}

function resetMutations() {
	if (MODULES.mutatorPreset.selected === 0) return;

	let mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));
	let mutatorObjPreset = mutatorObj['preset' + MODULES.mutatorPreset.selected];
	let presetName = mutatorObjPreset.name ? mutatorObjPreset.name : MODULES.mutatorPreset.selected;
	mutatorObj['preset' + MODULES.mutatorPreset.selected] = {
		name: presetName
	};

	if (typeof autoTrimpSettings !== 'undefined' && autoTrimpSettings.ATversion.includes('SadAugust')) {
		autoTrimpSettings['mutatorPresets'].valueU2 = JSON.stringify(mutatorObj);
		saveSettings();
	}

	localStorage.setItem('mutatorPresets', JSON.stringify(mutatorObj));
}

function presetMutations() {
	if (!u2Mutations.open) return;
	if (document.getElementById('u2MutPresetBtn1') !== null) return;

	//Initial setup of localStorage if it doesn't exist
	if (typeof localStorage['mutatorPresets'] === 'undefined') {
		let mutatorObj = {
			preset1: { name: 1 },
			preset2: { name: 2 },
			preset3: { name: 3 }
		};
		if (typeof autoTrimpSettings !== 'undefined' && autoTrimpSettings.ATversion.includes('SadAugust')) {
			mutatorObj = JSON.parse(autoTrimpSettings['mutatorPresets'].valueU2);
			saveSettings();
		}
		localStorage.setItem('mutatorPresets', JSON.stringify(mutatorObj));
	}

	//Setting up initial variables that will be called later during for loop
	const containerID = ['u2MutPresetBtn1', 'u2MutPresetBtn2', 'u2MutPresetBtn3', 'u2MutSave', 'u2MutLoad', 'u2MutRename', 'u2MutReset'];
	const containerText = ['1', '2', '3', 'Save', 'Load', 'Rename', 'Reset'];
	const onClick = ['presetMutTab(1)', 'presetMutTab(2)', 'presetMutTab(3)', 'saveMutations()', 'loadMutations(MODULES.mutatorPreset.selected)', 'renameMutations(true)', 'resetMutations()'];

	//If there are presets saved, then we will use those names instead of the default ones
	//This will also allow for the user to change the names of the presets
	const mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));

	for (let x = 1; x <= 3; x++) {
		if (mutatorObj['preset' + x].name) containerText[x - 1] = mutatorObj['preset' + x].name;
	}

	document.getElementById('swapToMasteryBtn').insertAdjacentHTML('afterend', '<br>');
	for (let x = containerID.length; x > 0; x--) {
		//Insert break to replace later
		document.getElementById('swapToMasteryBtn').insertAdjacentHTML('afterend', '<br>');

		const u2MutContainer = document.createElement('SPAN');
		u2MutContainer.setAttribute('style', 'font-size: 1.1em; margin-top: 0.25em;');
		u2MutContainer.setAttribute('id', containerID[x - 1]);
		//Disable save/load buttons if no preset is selected
		if (x > 3 && MODULES.mutatorPreset.selected === 0) u2MutContainer.setAttribute('class', 'btn btn-lg btn-default disabled');
		//Set button class based on selected preset
		else if (x === MODULES.mutatorPreset.selected) u2MutContainer.setAttribute('class', 'btn btn-lg btn-success');
		else u2MutContainer.setAttribute('class', 'btn btn-lg btn-info');
		const presetText = x <= 3 ? 'Preset: ' : '';
		u2MutContainer.setAttribute('onmouseover', 'tooltipAT("Mutator Preset", event, ' + x + ', "' + presetText + containerText[x - 1] + '")');
		u2MutContainer.setAttribute('onmouseout', 'tooltipAT("hide")');
		u2MutContainer.innerHTML = presetText + containerText[x - 1];
		u2MutContainer.setAttribute('onClick', onClick[x - 1]);

		const u2MutColumn = document.getElementById('swapToMasteryBtn').parentNode;
		//Replace earlier line break with setup element & then inserting another one
		u2MutColumn.replaceChild(u2MutContainer, document.getElementById('swapToMasteryBtn').parentNode.children[3]);
		document.getElementById('swapToMasteryBtn').insertAdjacentHTML('afterend', '<br>');
	}
}

function presetMasteryIcon() {
	if (!u2Mutations.open) return;
	if (document.getElementById('mutMasteryIcon') !== null) return;

	//insert break to replace later
	document.getElementById('mutZoomOut').insertAdjacentHTML('afterend', '<br>');
	document.getElementById('mutZoomButtons').style.left = '89vw';
	const u2IconContainer = document.createElement('DIV');
	u2IconContainer.setAttribute('id', 'mutMasteryIcon');
	u2IconContainer.setAttribute('onmouseover', 'tooltipAT("Mastery Info", event)');
	u2IconContainer.setAttribute('onmouseout', 'tooltipAT("hide")');
	u2IconContainer.setAttribute('style', 'margin-right: 1vw;');

	const u2Icon = document.createElement('SPAN');
	u2Icon.setAttribute('class', 'icomoon icon-cloud3');

	u2IconContainer.appendChild(u2Icon);

	const u2MutColumn = document.getElementById('mutZoomOut').parentNode;
	u2MutColumn.insertBefore(u2IconContainer, u2MutColumn.firstChild);
}

if (typeof originalopenTree !== 'function') {
	u2Mutations.originalopenTree = u2Mutations.openTree;
	u2Mutations.openTree = function () {
		u2Mutations.originalopenTree(...arguments);
		try {
			presetMutations();
			if (game.global.stringVersion === '5.9.2') presetMasteryIcon();
		} catch (e) {
			console.log('Loading mutator presets failed ' + e, 'other');
		}
	};
}

/* If using standalone version then inform user it has loaded. */
if (typeof autoTrimpSettings === 'undefined' || (typeof autoTrimpSettings !== 'undefined' && typeof autoTrimpSettings.ATversion !== 'undefined' && !autoTrimpSettings.ATversion.includes('SadAugust'))) {
	console.log('The mutator preset mod has finished loading.');
	message('The mutator preset mod has finished loading.', 'Loot');
}
