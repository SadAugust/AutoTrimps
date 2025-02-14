if (typeof MODULES !== 'object') {
	MODULES = {};
}

if (typeof atConfig === 'undefined') {
	MODULES.mutatorPreset = {
		selected: 0
	};
}

function tooltipAT(what, event, textString, headingName, use2 = '2') {
	let elem = document.getElementById(`tooltipDiv${use2}`);
	swapClass('tooltipExtra', 'tooltipExtraNone', elem);
	document.getElementById(`tipText${use2}`).className = '';
	let ondisplay = null;
	let tooltipText = '';
	let costText = '';
	let titleText = what;

	if (what === 'hide') {
		elem.style.display = 'none';
		return;
	} else if (what === 'Auto Heirloom Changes') {
		const [heirloomType, blacklist] = textString;
		titleText = 'Hold On!!';
		tooltipText = `You have unapplied changed to your current loadout. Do you wish to apply these changes?`;

		costText = `<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-success' onclick='cancelTooltip2(true); autoHeirloomsPresetSave("${heirloomType}", ${blacklist}); autoHeirloomsPresetSwap("${headingName}", true, "${heirloomType}", ${blacklist}); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Yes, apply!</div> `;
		costText += `<div class='btn btn-danger' onclick='cancelTooltip2(true); document.getElementById("tooltipDiv2").style.zIndex = 6; autoHeirloomsPresetSwap("${headingName}", true, "${heirloomType}", ${blacklist})'>No thanks, I'm good.</div> `;
		costText += `<div class='btn btn-warning' onclick='cancelTooltip2(true); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Go back.</div></div>`;

		elem.style.zIndex = 9;
		ondisplay = function () {
			_verticalCenterTooltip(true, undefined, '2');
		};
	} else if (what === 'Spire Assault Changes') {
		titleText = 'Hold On!!';
		tooltipText = `You have unapplied changed to your current loadout. Do you wish to apply these changes?`;

		costText = `<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-success' onclick='cancelTooltip2(true); spireAssaultPresetSave(); spireAssaultPresetSwap("${headingName}", true); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Yes, apply!</div> `;
		costText += `<div class='btn btn-danger' onclick='cancelTooltip2(true); document.getElementById("tooltipDiv2").style.zIndex = 6; spireAssaultPresetSwap("${headingName}", true)'>No thanks, I'm good.</div> `;
		costText += `<div class='btn btn-warning' onclick='cancelTooltip2(true); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Go back.</div></div>`;

		elem.style.zIndex = 9;
		ondisplay = function () {
			_verticalCenterTooltip(true, undefined, '2');
		};
	} else if (what === 'Spire Assault Import') {
		const ringMods = autoBattle.oneTimers.The_Ring.owned ? ' and ring modifiers' : '';
		tooltipText = `Are you sure you want to import your current items${ringMods} from the <b>${textString}</b> preset into Spire Assault?`;
		if (autoBattle.oneTimers.The_Ring.owned) tooltipText += `<br>Ring Modifiers will only be imported if you have selected enough for the max slots available.`;
		tooltipText += `<br><br><b>Warning:</b> This will use your saved version of this preset. If you have made changes to your items since saving, they won't be applied.`;

		costText = `<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip2(true); spireAssaultImport("${headingName}"); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Import</div><div class='btn btn-info' onclick='cancelTooltip2(true); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Cancel</div></div>`;

		elem.style.zIndex = 9;
		ondisplay = function () {
			_verticalCenterTooltip(true, undefined, '2');
		};
	} else if (what === 'Spire Assault Export') {
		const ringMods = autoBattle.oneTimers.The_Ring.owned ? ' and ring modifiers' : '';
		tooltipText = `Are you sure you want to import your current items${ringMods} from from Spire Assault into the <b>${textString}</b> preset?`;
		costText = `<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip2(true); spireAssaultExport("${headingName}"); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Import</div><div class='btn btn-info' onclick='cancelTooltip2(true); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Cancel</div></div>`;

		elem.style.zIndex = 9;
		ondisplay = function () {
			_verticalCenterTooltip(true, undefined, '2');
		};
	} else if (what === 'Spire Assault Spreadsheet') {
		const ringMods = autoBattle.oneTimers.The_Ring.owned ? ' and ring modifiers' : '';
		const spireAssaultLink = `<a href="https://docs.google.com/spreadsheets/d/17Z3dwnkeAmY2La-LWreybTs4Sm7BAck79EzVF_gkZzs" target="_blank">Spire Assault community sheet</a>`;
		tooltipText = `Import your Spire Assault build string to load those items${ringMods} into the <b>${textString}</b> preset.<br/>Builds can be found by copying the <b>Share Build</b> cell in the ${spireAssaultLink}<br/><textarea id='importBox' style='width: 100%' rows='3'></textarea>`;
		costText = `<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='spireAssaultImportSpreadsheet("${headingName}");'>Import</div><div class='btn btn-info' onclick='cancelTooltip2(true); document.getElementById("tooltipDiv2").style.zIndex = 6; '>Cancel</div></div>`;

		elem.style.left = '33.75%';
		elem.style.top = '25%';
		elem.style.zIndex = 9;
		ondisplay = function () {
			_verticalCenterTooltip();
			document.getElementById('importBox').focus();
		};
	} else if (what === 'Mutator Changes') {
		titleText = 'Hold On!!';
		tooltipText = `You have unapplied changed to your current loadout. Do you wish to apply these changes?`;

		costText = `<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-success' onclick='cancelTooltip2(true); _mutatorSavePreset(); _mutatorSwapPreset("${headingName}", true); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Yes, apply!</div> `;
		costText += `<div class='btn btn-danger' onclick='cancelTooltip2(true); document.getElementById("tooltipDiv2").style.zIndex = 6; _mutatorSwapPreset("${headingName}", true)'>No thanks, I'm good.</div> `;
		costText += `<div class='btn btn-warning' onclick='cancelTooltip2(true); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Go back.</div></div>`;

		elem.style.zIndex = 9;
		ondisplay = function () {
			_verticalCenterTooltip(true, undefined, '2');
		};
	} else if (what === 'Mutator Import') {
		tooltipText = `Are you sure you want to load your current mutators from the <b>${textString}</b> preset?`;
		tooltipText += `<br><br><b>Warning:</b> This will use your saved version of this preset. If you have made changes to your loadout since saving, they won't be applied.`;

		costText = `<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip2(true); _mutatorLoadPreset("${headingName}"); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Import</div><div class='btn btn-info' onclick='cancelTooltip2(true); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Cancel</div></div>`;

		elem.style.zIndex = 9;
		ondisplay = function () {
			_verticalCenterTooltip(true, undefined, '2');
		};
	} else if (what === 'Mutator Clear Preset') {
		tooltipText = `Are you sure you want to clear the <b>${textString}</b> preset?`;
		tooltipText += `<br><br><b>Warning:</b> This will also set the name back to ${headingName}.`;

		costText = `<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip2(true); _mutatorClearPreset("${headingName}"); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Import</div><div class='btn btn-info' onclick='cancelTooltip2(true); document.getElementById("tooltipDiv2").style.zIndex = 6;'>Cancel</div></div>`;

		elem.style.zIndex = 9;
		ondisplay = function () {
			_verticalCenterTooltip(true, undefined, '2');
		};
	}

	document.getElementById(`tipTitle${use2}`).innerHTML = titleText;
	document.getElementById(`tipText${use2}`).innerHTML = tooltipText;
	document.getElementById(`tipCost${use2}`).innerHTML = costText;
	elem.style.display = 'block';
	if (ondisplay !== null) ondisplay();
	if (event !== 'update' && !what.includes('Spire Assault') && !what.includes('Auto Heirloom') && !what.includes('Mutator')) positionTooltip(elem, event);
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

function _mutatorSavePreset() {
	const { preset, mutators } = _mutatorGetActiveList();

	const mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));
	mutatorObj[preset] = {
		mutators,
		purchaseCount: mutators.length,
		name: mutatorObj[preset].name
	};

	if (typeof autoTrimpSettings !== 'undefined' && autoTrimpSettings.ATversion.includes('SadAugust')) {
		autoTrimpSettings['mutatorPresets'].valueU2 = JSON.stringify(mutatorObj);
		saveSettings();
	}

	localStorage.setItem('mutatorPresets', JSON.stringify(mutatorObj));
}

function _mutatorRenamePreset() {
	const selectedPreset = $('.mutatorHeaderSelected')[0].innerText;
	const newName = prompt(`Enter a new name for preset ${selectedPreset}:`, selectedPreset);

	if (newName) {
		const activePreset = document.getElementsByClassName('mutatorHeaderSelected')[0].dataset.hiddenName;
		const mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));
		mutatorObj[activePreset].name = newName;

		const presetNumber = parseInt(activePreset.replace(/[^\d]/g, ''), 10) - 1;
		mutatorObj.titles[isNaN(presetNumber) ? 1 : presetNumber] = newName;

		if (typeof autoTrimpSettings !== 'undefined' && autoTrimpSettings.ATversion.includes('SadAugust')) {
			autoTrimpSettings['mutatorPresets'].valueU2 = JSON.stringify(mutatorObj);
			saveSettings();
		}

		localStorage.setItem('mutatorPresets', JSON.stringify(mutatorObj));
		$('.mutatorHeaderSelected')[0].innerText = newName;
	}
}

function _mutatorLoadPreset(preset) {
	const mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));
	if (!preset) preset = mutatorObj.selectedPreset;

	const mutatorList = mutatorObj[preset] ? mutatorObj[preset].mutators : [];
	const outerRing = [];
	if (mutatorList.length === 0) return;

	for (let item in u2Mutations.tree) {
		if (item.purchased) continue;
		if (mutatorList.includes(item)) {
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

function _mutatorClearPreset(preset) {
	const mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));
	if (!preset) preset = mutatorObj.selectedPreset;

	mutatorObj[preset] = _mutatorDefaultObj()[preset];
	if (typeof autoTrimpSettings !== 'undefined' && autoTrimpSettings.ATversion.includes('SadAugust')) {
		autoTrimpSettings['mutatorPresets'].valueU2 = JSON.stringify(mutatorObj);
		saveSettings();
	}

	localStorage.setItem('mutatorPresets', JSON.stringify(mutatorObj));
	importExportTooltip('mutatorPresets');
}

function _mutatorSwapPreset(preset, force = false) {
	if (!force) {
		const unappliedChanges = _mutatorCheckChanges();

		if (unappliedChanges) {
			tooltipAT('Mutator Changes', event, undefined, preset);
			return;
		}
	}

	const mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));
	mutatorObj.selectedPreset = preset;

	if (typeof autoTrimpSettings !== 'undefined' && autoTrimpSettings.ATversion.includes('SadAugust')) {
		autoTrimpSettings['mutatorPresets'].valueU2 = JSON.stringify(mutatorObj);
		saveSettings();
	}

	localStorage.setItem('mutatorPresets', JSON.stringify(mutatorObj));
	cancelTooltip();
	importExportTooltip('mutatorPresets');
}

function _mutatorSetupPresetBtn() {
	if (!u2Mutations.open || document.getElementById('u2MutPresetBtn1') !== null) return;

	if (typeof localStorage['mutatorPresets'] === 'undefined') {
		const runningAT = typeof autoTrimpSettings !== 'undefined' && autoTrimpSettings.ATversion.includes('SadAugust');
		let mutatorObj = runningAT ? JSON.parse(autoTrimpSettings['mutatorPresets'].valueU2) : _mutatorDefaultObj();
		localStorage.setItem('mutatorPresets', JSON.stringify(mutatorObj));
	}

	document.getElementById('swapToMasteryBtn').insertAdjacentHTML('afterend', '<br>');

	const u2MutContainer = document.createElement('SPAN');
	u2MutContainer.setAttribute('id', 'mutatorPresetsBtn');
	u2MutContainer.setAttribute('class', 'btn btn-lg btn-info');
	u2MutContainer.setAttribute('style', 'font-size: 1.1em; margin-top: 0.25em;');
	u2MutContainer.setAttribute('onClick', "importExportTooltip('mutatorPresets')");
	u2MutContainer.innerHTML = 'Presets';

	const u2MutColumn = document.getElementById('swapToMasteryBtn').parentNode;
	u2MutColumn.replaceChild(u2MutContainer, document.getElementById('swapToMasteryBtn').parentNode.children[3]);
	document.getElementById('swapToMasteryBtn').insertAdjacentHTML('afterend', '<br>');
}

function _mutatorPopulateTree(firstLoad = false) {
	const scale = Math.min(window.innerWidth, window.innerHeight) / 32;
	const mutLineWidth = 0.125;
	const arrowLength = 0.5;
	const arrowSize = 0.1;
	const boxScale = 2 * scale;

	const mutatorsContainer = document.getElementById('mutatorsContainer');
	let text = `<div id='mutatorPresetsTree' style='position: relative; transform: translate(0px, 0px) scale(0.5); top:${-10}px'>`;
	text += `<div id='mutatorPresetsRing1' style='position: absolute; width: ${40.8 * scale}px; height: ${33.0 * scale}px; top: ${-16.5 * scale}px; left: ${-20.4 * scale}px;'></div>`;

	const mutatorList = [];
	const mutatorListActive = [];
	if (firstLoad) {
		const mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));
		const presetData = mutatorObj.selectedPreset ? mutatorObj[mutatorObj.selectedPreset] : { mutators: [] };
		const mutators = presetData && presetData.mutators ? presetData.mutators : [];
		mutators.forEach((mutator) => mutatorList.push(mutator));
	} else {
		const { mutators } = _mutatorGetActiveList();
		mutators.forEach((mutator) => mutatorList.push(mutator));
	}

	let leftMost = 0;
	let rightMost = 0;
	for (let item in u2Mutations.tree) {
		const coords = u2Mutations.tree[item].pos;
		const itemObj = u2Mutations.tree[item];
		const bgColor = !_mutatorCheckRequirements(item, mutatorList) ? 'requirement' : mutatorList.includes(item) ? 'purchased' : 'available';
		if (bgColor === 'purchased') mutatorListActive.push(item);
		const displayName = itemObj.dn ? itemObj.dn : item;
		let description = itemObj.description;
		if (description.includes(', <b>')) description = description.split(', <b>')[0] + '.';

		let tooltip = `onmouseover="tooltip('${item}', 'Mutator', event)" onmouseout="tooltip('hide')"`;
		text += `<button aria-labelledby="${item}Name" 
				id="${item}MutatorPreset" 
				class="mutatorBox mutatorBox${bgColor}" 
				onclick="_mutatorToggleElem(this)" 
				${tooltip} 
				style="position: absolute; color: ${itemObj.color}; 
				width: ${boxScale}px; height: ${boxScale}px; 
				left: ${coords[0] * scale}px; top: ${coords[1] * scale}px; 
				font-size: ${scale * 1.5}px"  
				data-hidden-text="${item}" 
				title="${description}">`;
		text += '<span class="mutTreeName">' + displayName + '</span>';
		text += '<span class="icomoon icon-star"></span></button>';

		if (!itemObj.require) continue;
		const connect = itemObj.require;

		for (let x = 0; x < connect.length; x++) {
			const thisConnect = u2Mutations.tree[connect[x]].pos;
			const distanceX = thisConnect[0] - coords[0];
			const distanceY = thisConnect[1] - coords[1];
			const length = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
			const angle = (Math.atan2(distanceY, distanceX) * 180) / Math.PI;
			const left = coords[0] * scale + boxScale / 2 - (length * scale) / 2 + (distanceX / 2) * scale;
			if (left < leftMost) leftMost = left;
			if (left > rightMost) rightMost = left;
			const top = (coords[1] - mutLineWidth / 2) * scale + boxScale / 2 + (distanceY / 2) * scale;
			const width = length * scale;
			const color = itemObj.singleRequire ? 'grey' : 'white';
			const line = `<div class="mutLine mutLine${color}" 
							style="position: absolute; left: ${left}px; top: ${top}px; 
							height: ${mutLineWidth * scale}px; width: ${width}px; 
							transform: rotate(${angle}deg);">&nbsp;</div>`;
			text += line;

			const arrowMidpointX = (thisConnect[0] - distanceX / 2) * scale + boxScale / 2 - (arrowLength * scale) / 2;
			const arrowMidpointY = (thisConnect[1] - distanceY / 2) * scale + boxScale / 2 - (arrowLength * scale) / 2;
			text += `<div class="mutArrow mutArrow${color}" 
					style="position: absolute; border-left-width: ${arrowSize * scale}px; 
					border-top-width: ${arrowSize * scale}px; 
					width: ${arrowLength * scale}px; height: ${arrowLength * scale}px; 
					top: ${arrowMidpointY}px; left: ${arrowMidpointX}px; 
					transform: rotate(${angle - 45}deg);"></div>`;
		}
	}

	text += '</div>';

	mutatorsContainer.innerHTML = text;
	const mutTree = document.getElementById('mutatorPresetsTree');
	mutatorsContainer.style.height = `${mutTree.scrollHeight}px`;

	const totalWidth = boxScale + Math.max(Math.abs(leftMost), Math.abs(rightMost));
	const screenWidthPercent = (totalWidth / window.innerWidth) * 100;
	const roundedPercent = Math.max(40, Math.ceil(screenWidthPercent / 5) * 5);
	_verticalCenterTooltip(false, false, '', roundedPercent);

	if (mutatorListActive.length > 0) {
		const equippedElem = document.getElementById(`mutatorsPurchased`);
		equippedElem.innerHTML = mutatorListActive.length;

		if (mutatorListActive.length !== mutatorList.length) {
			_mutatorPopulateTree();
		} else if (mutatorListActive.some((item, index) => item !== mutatorList[index])) {
			_mutatorPopulateTree();
		} else {
			const changesMsg = document.getElementById('mutatorsChangesContainer');
			const unappliedChanges = _mutatorCheckChanges();
			changesMsg.style.visibility = unappliedChanges ? 'visible' : 'hidden';
		}
	}
}

function _mutatorCheckRequirements(what, mutatorList) {
	const itemObj = u2Mutations.tree[what];
	if (itemObj.ring && itemObj.ring > 0 && Number(document.getElementById('mutatorsPurchased').innerText) < u2Mutations.rings[itemObj.ring]) return false;
	if (!itemObj.require) return true;

	for (let y = 0; y < itemObj.require.length; y++) {
		if (!mutatorList.includes(itemObj.require[y])) {
			if (!itemObj.singleRequire) {
				return false;
			}
		} else if (itemObj.singleRequire) {
			return true;
		}
	}

	return itemObj.singleRequire ? false : true;
}

function _mutatorGetActiveList() {
	function getEquippedItems(selector) {
		return $(selector)
			.map((index, item) => $(item).data('hidden-text'))
			.get();
	}

	const purchasedMutators = getEquippedItems('.mutatorBoxpurchased');
	const activePreset = document.getElementsByClassName('mutatorHeaderSelected')[0].dataset.hiddenName;

	return {
		preset: activePreset,
		mutators: purchasedMutators
	};
}

function _mutatorCheckChanges() {
	const { preset, mutators } = _mutatorGetActiveList();

	const mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));
	const presetData = mutatorObj[preset];
	const mutatorData = presetData && presetData.mutators ? presetData.mutators : [];
	if (!mutatorData && mutators.length > 0) return true;
	if (mutatorData.length !== mutators.length) return true;
	if (mutatorData.some((item, index) => item !== mutators[index])) return true;

	return false;
}

function _mutatorToggleElem(element) {
	if (element.classList.contains('mutatorBoxrequirement')) return;

	const equippedElem = document.getElementById(`mutatorsPurchased`);
	if (equippedElem) {
		const maxMutators = Number(document.getElementById(`mutatorsMax`).innerText);
		const equippedMutators = Number(equippedElem.innerText);
		const errorElem = document.getElementById(`mutatorsError`);
		let removeItem = element.classList.contains(`mutatorBoxpurchased`);

		if (!removeItem && equippedMutators >= maxMutators) {
			const errorText = `Max Mutators selected`;
			if (errorElem.innerText !== errorText) errorElem.innerText = errorText;
			return;
		} else if (errorElem.innerText !== '') {
			errorElem.innerText = '';
		}
		equippedElem.innerHTML = removeItem ? equippedMutators - 1 : equippedMutators + 1;
	}

	element.classList.toggle(`mutatorBoxpurchased`);
	element.classList.toggle(`mutatorBoxavailable`);
	_mutatorPopulateTree();
}

function _mutatorDefaultObj() {
	const mutatorObj = {
		'Preset 1': { mutators: [], purchaseCount: 0, name: 'Preset 1' },
		'Preset 2': { mutators: [], purchaseCount: 0, name: 'Preset 2' },
		'Preset 3': { mutators: [], purchaseCount: 0, name: 'Preset 3' },
		'Preset 4': { mutators: [], purchaseCount: 0, name: 'Preset 4' },
		'Preset 5': { mutators: [], purchaseCount: 0, name: 'Preset 5' },
		selectedPreset: 'Preset 1',
		titles: ['Preset 1', 'Preset 2', 'Preset 3', 'Preset 4', 'Preset 5']
	};

	return mutatorObj;
}

function _displayMutatorPresets(tooltipDiv) {
	if (typeof localStorage['mutatorPresets'] === 'undefined') {
		const runningAT = typeof autoTrimpSettings !== 'undefined' && autoTrimpSettings.ATversion.includes('SadAugust');
		let mutatorObj = runningAT ? JSON.parse(autoTrimpSettings['mutatorPresets'].valueU2) : _mutatorDefaultObj();
		localStorage.setItem('mutatorPresets', JSON.stringify(mutatorObj));
	}

	const mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));
	const setting = mutatorObj;
	const selectedPreset = setting.selectedPreset || 'Preset 1';
	const presetName = setting[selectedPreset] ? setting[selectedPreset].name || 'Preset 1' : 'Preset 1';
	const runningAT = !(typeof autoTrimpSettings === 'undefined' || (typeof autoTrimpSettings !== 'undefined' && typeof autoTrimpSettings.ATversion !== 'undefined' && !autoTrimpSettings.ATversion.includes('SadAugust')));
	const headerTitles = {
		1: 'This preset will be loaded when portaling into Filler challenges with the Preset Swap Mutators setting enabled.',
		2: 'This preset will be loaded when portaling into Daily challenges with the Preset Swap Mutators setting enabled.',
		3: 'This preset will be loaded when portaling into C3 or special challenges (Mayhem, Pandemonium, Desolation) with the Preset Swap Mutators setting enabled.',
		4: '',
		5: ''
	};

	const preset = setting[selectedPreset] || { mutators: {}, purchaseCount: 0, name: presetName };
	const headerList = ['Preset 1', 'Preset 2', 'Preset 3', 'Preset 4', 'Preset 5'];

	const availableSeeds = game.global.mutatedSeeds + game.global.mutatedSeedsSpent;
	const maxMutators = Math.floor(Math.log2(availableSeeds / 300 + 1));

	function escapeHtmlAttribute(str) {
		return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	let tooltipText = '';
	tooltipText += `<div id='mutatorPresets' style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">`;
	for (const header of headerList) {
		const titleName = setting[header] ? setting[header].name || header : header;
		const headerClass = header === selectedPreset ? 'Selected' : 'NotSelected';
		const escapedTitleName = escapeHtmlAttribute(titleName);
		const titleText = runningAT ? headerTitles[Number(header.replace(/\D/g, ''))] : '';
		tooltipText += `<div style="display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;" class='mutatorHeader mutatorHeader${headerClass}' onclick='_mutatorSwapPreset("${header}")'  data-hidden-name="${header}" title="${titleText}"><b>${escapedTitleName}</b></div>`;
	}

	tooltipText += `</div>`;

	const mutatorsPurchased = preset.mutators || {};
	tooltipText += `<div id='mutatorItems'>`;

	tooltipText += `<div id='mutatorErrorRow' style="display: flex; justify-content: space-between; align-items: center; width: 100%;">`;

	tooltipText += `<div id='mutatorItemCounter' style='display: flex;'>`;
	tooltipText += `<span>&nbsp;Mutators (</span><span id='mutatorsPurchased'>${Object.keys(mutatorsPurchased).length}</span><span>/</span><span id='mutatorsMax'>${maxMutators}</span><span>)&nbsp;</span><span id='mutatorsError' style='color: red;'></span>`;
	tooltipText += `</div>`;

	tooltipText += `<div id='mutatorsChangesContainer' style='color: red; display: flex; justify-content: flex-end; align-items: center; display: flex; visibility: hidden;'>`;
	tooltipText += `<span style='margin-right: 0.3em;' class='glyphicon glyphicon-floppy-disk'></span><span style='padding-right: 1em;'>Unapplied Changes</span>`;
	tooltipText += `</div>`;

	tooltipText += `</div>`;

	tooltipText += `<div id='mutatorsContainer' style='display: flex; background-color: black; flex-wrap: wrap; justify-content: space-between; align-items: center; width: 100%;'></div>`;

	let costText = `
		<div class='maxCenter'>
			<span class='btn btn-success btn-md' id='confirmTooltipBtn' onclick='_mutatorSavePreset(); cancelTooltip()'>Save and Close</span>
			<span class='btn btn-danger btn-md' onclick='cancelTooltip(true)'>Close</span>
			<span class='btn btn-primary btn-md' id='confirmTooltipBtn' onclick='_mutatorSavePreset(); importExportTooltip("mutatorPresets")'>Save</span>
			<span class='btn btn-info btn-md' onclick='_mutatorRenamePreset(this)'>Rename Preset</span>
			<span class='btn btn-warning btn-md' onclick='tooltipAT("Mutator Import", event, "${escapeHtmlAttribute(presetName)}", "${selectedPreset}")'>Load Preset</span>
			<span class='btn btn-default btn-md' onclick='tooltipAT("Mutator Clear Preset", event, "${escapeHtmlAttribute(presetName)}", "${selectedPreset}")'>Clear Preset</span>
		`;

	costText += `</div> `;

	const ondisplay = function () {
		_mutatorPopulateTree(true);
		_verticalCenterTooltip(true);
		_mutatorPopulateTree();
	};

	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	return [tooltipDiv, tooltipText, costText, ondisplay];
}

if (typeof originalopenTree !== 'function') {
	u2Mutations.originalopenTree = u2Mutations.openTree;
	u2Mutations.openTree = function () {
		u2Mutations.originalopenTree(...arguments);
		try {
			_mutatorSetupPresetBtn();
		} catch (e) {
			console.log('Loading mutator presets failed ' + e, 'other');
		}
	};
}

/* If using standalone version then inform user it has loaded. */
if (typeof autoTrimpSettings === 'undefined' || (typeof autoTrimpSettings !== 'undefined' && typeof autoTrimpSettings.ATversion !== 'undefined' && !autoTrimpSettings.ATversion.includes('SadAugust'))) {
	console.log('The mutator preset mod has finished loading.');
	message('The mutator preset mod has finished loading.', 'Loot');

	(async function () {
		let basepathMutator = 'https://sadaugust.github.io/AutoTrimps/';
		if (typeof localVersion !== 'undefined') basepathMutator = 'https://localhost:8887/AutoTrimps_Local/';
		const modules = ['import-export'];
		const css = [`${basepathMutator}css/mutatorPreset.css`];
		const scripts = ['https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js'];

		function loadModules(fileName, prefix = '', retries = 3) {
			return new Promise((resolve, reject) => {
				const script = document.createElement('script');
				script.src = `${basepathMutator}${prefix}${fileName}.js`;
				script.id = `${fileName}_MODULE`;
				script.async = false;
				script.defer = true;

				script.addEventListener('load', () => {
					resolve();
				});

				script.addEventListener('error', () => {
					console.log(`Failed to load module: ${fileName} from path: ${prefix || ''}. Retries left: ${retries - 1}`);
					loadModules(fileName, prefix, retries - 1)
						.then(resolve)
						.catch(reject);
				});

				document.head.appendChild(script);
			});
		}

		function loadStylesheet(url, rel = 'stylesheet', type = 'text/css', retries = 3) {
			return new Promise((resolve, reject) => {
				if (retries < 1) {
					reject(`Failed to load stylesheet ${url} after 3 attempts`);
					return;
				}

				const link = document.createElement('link');
				link.href = url;
				link.rel = rel;
				link.type = type;

				link.onload = () => {
					resolve();
				};

				link.onerror = () => {
					console.log(`Failed to load stylesheet ${url}. Retries left: ${retries - 1}`);
					loadStylesheet(url, rel, type, retries - 1)
						.then(resolve)
						.catch(reject);
				};

				document.head.appendChild(link);
			});
		}

		function loadScript(url, type = 'text/javascript', retries = 3) {
			return new Promise((resolve, reject) => {
				if (retries < 1) {
					reject(`Failed to load script ${url} after 3 attempts`);
					return;
				}

				const script = document.createElement('script');
				script.src = url;
				script.type = type;

				script.onload = () => {
					resolve();
				};

				script.onerror = () => {
					console.log(`Failed to load script ${url}. Retries left: ${retries - 1}`);
					loadScript(url, type, retries - 1)
						.then(resolve)
						.catch(reject);
				};

				document.head.appendChild(script);
			});
		}

		try {
			for (const module of modules) {
				const path = modules.includes(module) ? 'modules/' : '';
				await loadModules(module, path);
			}

			for (const script of css) {
				await loadStylesheet(script);
			}

			for (const script of scripts) {
				await loadScript(script);
			}

			console.log('The Mutator Presets mod has finished loading.');
			message('The Mutator Presets mod has finished loading.', 'Loot');
			if (u2Mutations && u2Mutations.open) u2Mutations.openTree();

			const mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));
			if (!mutatorObj || !mutatorObj.titles) {
				const mutatorObj = _mutatorDefaultObj();
				localStorage.setItem('mutatorPresets', JSON.stringify(mutatorObj));
			}
		} catch (error) {
			console.error('Error loading script', error);
			message('The Mutator Presets mod failed to load. Refresh your page and try again.', 'Loot');
			tooltip('Failed to load the Mutator Presets mod', 'customText', undefined, 'The Mutator Presets mod failed to load. Refresh your page and try again.');
			verticalCenterTooltip(true);
		}
	})();
}

function handleResize() {
	if (document.getElementById('tipTitle').innerHTML === 'Mutator Presets') _mutatorPopulateTree();
}

window.addEventListener('resize', handleResize);
