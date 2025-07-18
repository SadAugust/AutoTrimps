if (typeof atData === 'undefined') atData = {};
atData.heirloomCalc = { GUI: {} };
atData.autoHeirlooms = {};

if (typeof $$ !== 'function') {
	$$ = function (a) {
		return document.querySelector(a);
	};
	$$$ = function (a) {
		return [].slice.apply(document.querySelectorAll(a));
	};
}

function masteryPurchased(name) {
	if (!game.talents[name]) throw `unknown mastery: ${name}`;
	return game.talents[name].purchased;
}

function legalizeInput(settingID) {
	if (!settingID) return;
	const element = document.getElementById(settingID);
	const { placeholder: defaultValue, min: minValue, max: maxValue } = element;

	let value = parseFloat(element.value);
	value = isNaN(value) ? defaultValue : value;
	value = minValue !== null && value < minValue ? minValue : value;
	value = maxValue !== null && value > maxValue ? maxValue : value;

	element.value = value;
}

if (typeof elementExists !== 'function') {
	function elementExists(element) {
		return document.getElementById(element).style.display !== 'none';
	}
}

if (typeof elementVisible !== 'function') {
	function elementVisible(element) {
		let visible = document.getElementById(element).style.visibility !== 'hidden';
		return elementExists(element) && visible;
	}
}

function runHeirlooms() {
	const selectedLoom = game.global.selectedHeirloom;
	if (selectedLoom.length === 0) return;

	const heirlooms = calculate(true);
	const newLoomData = heirlooms.newLoom;

	let startingHeirloom;
	if (selectedLoom[1].includes('Equipped')) startingHeirloom = game.global[selectedLoom[1]];
	else startingHeirloom = game.global[selectedLoom[1]][selectedLoom[0]];

	const heirloomCost = getTotalHeirloomRefundValue(startingHeirloom, true);
	const newLoomCost = getTotalHeirloomRefundValue(newLoomData, true);
	const spendableNu = newLoomData.type === 'Core' ? playerSpire.spirestones : Math.floor(game.global.nullifium * getNuSpendMult());

	if (heirloomCost !== newLoomCost && newLoomCost > spendableNu) {
		tooltip(`Heirloom Allocation Issue`, 'customText', 'lock', `There has been an issue with the heirloom calculator, you don't have enough Nullifium to do the recommended upgrades for this heirloom. You would need ${prettify(newLoomCost)} Nullifium, but you only have ${prettify(spendableNu)} available.<br><br>Please report this error and send your save (and AutoTrimps settings too if applicable) to me in the <b>#trimps_tools</b> channel of the <b>Trimps</b> discord.`, false, 'center');
		return;
	}

	startingHeirloom.mods = newLoomData.mods;

	displaySelectedHeirloom(undefined, undefined, undefined, undefined, undefined, undefined, true);
	setupHeirloomHelpBtn();
	updateModContainer('heirloomHelpBtn', newLoomData);
	recalculateHeirloomBonuses();
	return;
}

function updateHeirloomBtnWidths() {
	const btnInputs = document.querySelectorAll('.heirloomCalcInput');
	btnInputs.forEach((btnInput) => {
		const prefixText = btnInput.previousElementSibling;
		const btnDiv = btnInput.parentElement;

		if (prefixText && btnDiv) {
			const prefixWidth = prefixText.offsetWidth;
			const btnDivWidth = btnDiv.offsetWidth;
			const prefixPercentage = (prefixWidth / btnDivWidth) * 100;
			const inputPercentage = 100 - prefixPercentage - 8;
			btnInput.style.width = `${inputPercentage}%`;
		}
	});
}

function setupHeirloomUI() {
	createInput = function (btnLine, id, inputObj, savedValue, row) {
		if (!id || document.getElementById(`${id}Div`) !== null) {
			console.log("You most likely have a setup error in your inputBoxes. It will be trying to access a input box that doesn't exist.");
			return;
		}

		const onchange = `legalizeInput(this.id); saveHeirloomSettings(); calculate();`;

		const btnDiv = document.createElement('DIV');
		btnDiv.id = `${id}Div`;
		btnDiv.style.display = 'flex';
		btnDiv.style.alignItems = 'center';

		const firstInputObj = inputBoxes[row][Object.keys(inputBoxes[row])[0]] === inputObj;
		const lastInputObj = inputBoxes[row][Object.keys(inputBoxes[row]).slice(-1)[0]] === inputObj;
		if (id === 'VMWeight') {
			btnDiv.style.marginRight = 'auto';
		} else if ((lastInputObj && !firstInputObj) || id === 'XPWeight' || id === 'equalityTarget') {
			btnDiv.style.marginLeft = 'auto';
		} else if (firstInputObj) {
			btnDiv.style.marginRight = 'auto';
		}

		const inputBoxSpan = document.createElement('span');
		inputBoxSpan.className = 'textbox';
		inputBoxSpan.onmouseover = () => tooltip(inputObj.name, 'customText', event, inputObj.description);
		inputBoxSpan.onmouseout = () => tooltip('hide');
		inputBoxSpan.style.cssText = `text-align: left; height: 1.5vw; border: 1px solid #777;`;

		const prefixText = document.createElement('span');
		prefixText.id = `${id}Prefix`;
		prefixText.textContent = `${inputObj.name}: `;

		const btnInput = document.createElement('input');
		btnInput.id = id;
		btnInput.type = 'number';
		btnInput.step = '0.0001';
		btnInput.value = savedValue || inputObj.defaultValue;
		btnInput.min = inputObj.minValue;
		btnInput.max = inputObj.maxValue;
		btnInput.placeholder = inputObj.defaultValue;
		btnInput.setAttribute('onchange', onchange);
		btnInput.style.cssText = `color: white;`;
		btnInput.classList = 'heirloomCalcInput';
		btnInput.style.width = '1vw';

		inputBoxSpan.addEventListener('click', () => {
			btnInput.focus();
		});

		inputBoxSpan.appendChild(prefixText);
		inputBoxSpan.appendChild(btnInput);
		btnDiv.appendChild(inputBoxSpan);
		btnLine.appendChild(btnDiv);
	};

	removeGUI = function () {
		Object.keys(atData.heirloomCalc.GUI).forEach((key) => {
			const elem = atData.heirloomCalc.GUI[key];
			if (elem && elem.parentNode) {
				elem.parentNode.removeChild(elem);
				delete atData.heirloomCalc.GUI[key];
			}
		});
	};

	displayGUI = function () {
		const settingInputs = JSON.parse(localStorage.getItem('heirloomInputs'));
		if (atData.heirloomCalc.GUI && Object.keys(atData.heirloomCalc.GUI).length !== 0) removeGUI();

		atData.heirloomCalc.GUI = {};
		const hcGUI = atData.heirloomCalc.GUI;
		hcGUI.$ratiosLine = {};
		hcGUI.inputs = [];

		hcGUI.$heirloomRatios = document.createElement('DIV');
		hcGUI.$heirloomRatios.id = 'heirloomRatios';
		hcGUI.$heirloomRatios.setAttribute('style', 'width: 100%; display: none;');

		for (let x = 0; x < Object.keys(inputBoxes).length; x++) {
			let row = Object.keys(inputBoxes)[x];
			hcGUI.$ratiosLine[row] = document.createElement('DIV');
			hcGUI.$ratiosLine[row].classList.add('customRatios');
			hcGUI.$ratiosLine[row].setAttribute('id', `heirloomRatios${x}`);
			if (x === 0) hcGUI.$ratiosLine[row].style.marginTop = '0.2vw';
			for (let item in inputBoxes[row]) {
				createInput(hcGUI.$ratiosLine[row], item, inputBoxes[row][item], settingInputs && settingInputs[item] !== null ? settingInputs[item] : undefined, row);
				hcGUI.inputs.push(item);
			}
			hcGUI.$heirloomRatios.appendChild(hcGUI.$ratiosLine[row]);
		}

		const $portalWrapper = document.getElementById('selectedHeirloom').parentNode;
		$portalWrapper.appendChild(hcGUI.$heirloomRatios);

		hcGUI.$allocatorBtnParent = document.createElement('DIV');
		hcGUI.$allocatorBtnParent.id = 'heirloomAllocatorBtnParent';
		hcGUI.$allocatorBtnParent.style.display = 'flex';
		hcGUI.$allocatorBtnParent.style.alignItems = 'center';

		hcGUI.$allocatorBtn = document.createElement('DIV');
		hcGUI.$allocatorBtn.id = 'heirloomAllocatorBtn';
		hcGUI.$allocatorBtn.setAttribute('class', 'btn');
		hcGUI.$allocatorBtn.setAttribute('onclick', 'runHeirlooms()');
		hcGUI.$allocatorBtn.style.cssText = `height: 1.5vw; background-color: #3b0076; border: 1px solid #777; border-radius: 1px; padding: 0; width: 13.5vw; font-size: 0.8vw; line-height: 1.3vw;`;
		hcGUI.$allocatorBtn.textContent = 'Allocate Nullifium';
		hcGUI.$allocatorBtn.onmouseover = function () {
			this.style.color = 'grey';
			tooltip('Auto Allocate', 'customText', undefined, 'Buys the shown optimal levels in each modifier when pressed.');
		};
		hcGUI.$allocatorBtn.onmouseout = function () {
			this.style.color = 'white';
			tooltip('hide');
		};

		hcGUI.$allocatorBtnParent.appendChild(hcGUI.$allocatorBtn);
		hcGUI.$ratiosLine.row1.insertBefore(hcGUI.$allocatorBtnParent, document.getElementById('XPWeightDiv'));

		hcGUI.$customRatioBtn = document.createElement('DIV');
		hcGUI.$customRatioBtn.id = 'heirloomCustomRatioBtn';
		hcGUI.$customRatioBtn.setAttribute('class', 'btn settingBtnfalse');
		hcGUI.$customRatioBtn.setAttribute('onclick', 'toggleCustomRatio(atData.heirloomCalc.GUI.$customRatioBtn.id, "Ratio")');
		hcGUI.$customRatioBtn.setAttribute('onmouseover', 'tooltip("Custom Ratio", "customText", event, "Enabling this allows you to set custom weight inputs for this specific heirloom that won\'t impact the global weight inputs that heirlooms would normally use.")');
		hcGUI.$customRatioBtn.setAttribute('onmouseout', 'tooltip("hide")');
		hcGUI.$customRatioBtn.style.cssText = `height: 1.5vw; float:left; border: 1px solid #777; border-radius: 1px; padding: 0; width: 13.5vw; font-size: 0.8vw; line-height: 1.3vw; margin-right: auto;`;
		hcGUI.$customRatioBtn.textContent = 'Use Custom Ratios';
		hcGUI.$ratiosLine.row2.insertBefore(hcGUI.$customRatioBtn, document.getElementById('equalityTargetDiv'));

		['Farmer', 'Lumberjack', 'Miner', 'Scientist', 'Parity', 'Dragimp', 'Explorer', 'Breed'].forEach((button) => {
			const efficiencyName = `${button} ${button === 'Breed' ? 'Speed' : button === 'Parity' ? 'Power' : 'Efficiency'}`;
			const btn = document.createElement('DIV');
			btn.id = `heirloomCustom${button}Btn`;
			btn.setAttribute('class', `btn settingBtn${['Miner', 'Parity'].includes(button) ? 'true' : 'false'} customEfficiencyBtn`);
			let clickTimer = null;
			btn.addEventListener('click', (event) => {
				if (clickTimer) clearTimeout(clickTimer);
				clickTimer = setTimeout(() => {
					if (event.ctrlKey || event.metaKey) {
						heirloomResourceSettingTooltip(button);
					} else {
						toggleCustomRatio(btn.id, button);
					}
					clickTimer = null;
				}, 250);
			});
			btn.addEventListener('dblclick', (event) => {
				if (clickTimer) clearTimeout(clickTimer);
				heirloomResourceSettingTooltip(button);
			});

			btn.setAttribute('onmouseover', `tooltip("${efficiencyName}", "customText", event, '<p>Enabling this will allow the script to assign Nullifium to the <b>${efficiencyName}</b> modifier on this heirloom.</p><p><i>You can set <b>custom spending percentages</b> by <b>double clicking</b> or holding <b>control</b> and clicking.</i></p>')`);
			btn.setAttribute('onmouseout', 'tooltip("hide")');
			btn.textContent = button[0].toUpperCase();
			hcGUI.$ratiosLine.row2.insertBefore(btn, document.getElementById('equalityTargetDiv'));
		});

		if (!settingInputs) {
			saveHeirloomSettings();
		}
	};

	const petName = game.global.universe === 2 ? 'Scruffy' : 'Fluffy';
	const inputBoxes = {
		row1: {
			equipLevels: {
				name: 'Efficiency Mods Weight',
				description: "<p>The weight you want to use for efficiency modifiers, the lower you put this value the higher the script will weight the efficiency modifiers.</p><p>You can modify the percentage spent on efficiency modifiers using the buttons below <b>Allocate Nullifium</b>.</p><p>If you set this to 0, the script won't spend any Nullifium on Efficiency modifiers.</p>",
				minValue: 0,
				maxValue: null,
				defaultValue: 90
			},
			VMWeight: {
				name: 'Void Maps Weight',
				description: '<p><b>Weight: Void Maps</b> is a multiplier to the value of the <b>Void Map Drop Chance</b> modifier. So if your next Void Map Drop Chance upgrade were to increase your value by 0.5%, the default weight (12) will multiply it by 12 so it will be calculated as if it were to increase your value by 6%.</p><p>The default weight (12) is used to provide a good balance between damage, survivability and helium gain.',
				minValue: 0,
				maxValue: null,
				defaultValue: 12
			},
			XPWeight: {
				name: 'Pet Exp Weight',
				description: `<p><b>Pet Exp Weight</b> is a multiplier to the value of the <b>Pet (${petName}) Exp</b> modifier. 
				So if your next Pet (${petName}) Exp upgrade were to increase your value by 0.5%, the default weight (12) will multiply it by 12 so it will be calculated as if it were to increase your value by 6%.</p><p>The default weight (12) is used to provide a good balance between efficiency modifiers and Pet (${petName}) Exp gain.</p><p>If you set this to 0, the script won't spend any Nullifium on Pet (${petName}) Exp.</p>`,
				minValue: 0,
				maxValue: null,
				defaultValue: 12
			},
			HPWeight: {
				name: 'Health Weight',
				description: `<p><b>Weight: HP</b> is a multiplier to the value of the <b>Trimp Health</b>${
					game.global.universe === 2 ? ', <b>Prismatic Shield</b>, ' : ' '
				}and <b>Breed Speed</b> modifiers. So if your next Trimp Health upgrade were to increase your value by 0.5%, the default weight (1) will multiply it by 1 so it will be calculated as if it were to increase your value by 0.5%.</p><p>The default weight (1) is used to provide a good balance between damage, survivability and helium gain.`,
				minValue: 0,
				maxValue: null,
				defaultValue: 1
			}
		},
		row2: {
			equalityTarget: {
				name: 'Equality Weight',
				description: `<p><b>Weight: Equality</b> is a multiplier for the <b>Inequality</b> modifier, the calculation uses an exponential function. The value of the <b>Inequality</b> modifier is raised to the power of the target Equality. For example, if your next Inequality upgrade were to increase your <b>Inequality</b> value by 1%, the default weight (100) will increase its value to 270%.</p>
				<p>Ideally your input should be the amount of equality used for the hardest zones in your runs.</p>`,
				minValue: 0,
				maxValue: null,
				defaultValue: 100,
				get weighable() {
					return !game.global.universe === 2;
				}
			},
			seedDrop: {
				name: 'Seed Drop Weight',
				description: '<p><b>Seed Drop Weight</b> is a multiplier to the value of the <b>Seed Drop Rate</b> modifier. So if your next Seed Drop Rate upgrade were to increase your value by 0.5%, the default weight (2) will multiply it by 2 so it will be calculated as if it were to increase your value by 1%.</p>',
				minValue: 0,
				maxValue: null,
				defaultValue: 100,
				get weighable() {
					return !game.global.universe === 2;
				}
			}
		}
	};

	displayGUI();
}

function setupHeirloomHelpBtn() {
	if (document.getElementById('heirloomHelpBtn') !== null) return;

	const heirloomHelpBtn = document.createElement('DIV');
	heirloomHelpBtn.setAttribute('id', 'heirloomHelpBtn');
	heirloomHelpBtn.setAttribute('class', 'glyphicon glyphicon-question-sign');
	heirloomHelpBtn.setAttribute('style', 'position:absolute; top:1vw; right:2vw;');
	heirloomHelpBtn.setAttribute('onmouseout', 'tooltip("hide")');
	document.getElementById('selectedHeirloom').children[0].children[0].appendChild(heirloomHelpBtn);
}

function setupSelectedHeirloom(heirloomType = 'Staff') {
	if (heirloomType === 'Staff') {
		return {
			Farmer: { enabled: false, weight: 100 },
			Lumberjack: { enabled: false, weight: 100 },
			Scientist: { enabled: false, weight: 100 },
			Miner: { enabled: true, weight: 100 },
			Dragimp: { enabled: true, weight: 1 },
			Explorer: { enabled: true, weight: 1 },
			Parity: { enabled: true, weight: 100 }
		};
	} else if (heirloomType === 'Shield') {
		return {
			Breed: { enabled: false, weight: game.global.universe === 2 ? 10 : 100 }
		};
	}
}

function toggleCustomRatio(elemName, btnType = 'Ratio') {
	const heirloomInputs = JSON.parse(localStorage.getItem('heirloomInputs'));
	const selectedHeirloom = _getSelectedHeirloom();
	const heirloomID = selectedHeirloom.id;
	const ratioBtn = document.getElementById(elemName);
	const currentClass = ratioBtn.className.split(' ')[1];
	const newClass = currentClass === 'settingBtntrue' ? 'settingBtnfalse' : 'settingBtntrue';
	const classList = btnType === 'Ratio' ? `btn ${newClass}` : `btn ${newClass} customEfficiencyBtn`;
	ratioBtn.setAttribute('class', classList);

	if (!heirloomInputs[heirloomID] || typeof heirloomInputs[heirloomID][btnType] === 'undefined') {
		heirloomInputs[heirloomID] = setupSelectedHeirloom(selectedHeirloom.type);
	}

	const heirloomSettings = heirloomInputs[heirloomID];
	if (typeof heirloomSettings[btnType] === 'boolean') {
		heirloomSettings[btnType] = { enabled: newClass !== 'settingBtntrue', weight: 100 };
	}

	if (btnType === 'Ratio') {
		if (newClass !== 'settingBtntrue') {
			delete heirloomSettings[btnType];
			localStorage.setItem('heirloomInputs', JSON.stringify(heirloomInputs));
		}

		newClass === 'settingBtntrue' ? saveHeirloomSettings() : loadHeirloomSettings();
	} else {
		heirloomSettings[btnType].enabled = newClass === 'settingBtntrue';
		localStorage.setItem('heirloomInputs', JSON.stringify(heirloomInputs));
	}

	calculate();
}

function heirloomResourceSettingEnter(event, resource) {
	const isEnterKey = event.which === 13 || event.keyCode === 13;
	if (isEnterKey) {
		heirloomResourceSettingSave(resource);
	}
}

function heirloomResourceSettingTooltip(resource) {
	const heirloomInputs = JSON.parse(localStorage.getItem('heirloomInputs'));
	const selectedHeirloom = _getSelectedHeirloom();
	const heirloomID = selectedHeirloom.id;
	const heirloomSettings = heirloomInputs[heirloomID];

	if (!heirloomSettings || typeof heirloomInputs[heirloomID][resource] === 'undefined') {
		heirloomInputs[heirloomID] = setupSelectedHeirloom(selectedHeirloom.type);
	}

	if (typeof heirloomInputs[heirloomID][resource] === 'boolean') {
		heirloomInputs[heirloomID][resource] = { enabled: heirloomInputs[heirloomID][resource], weight: 100 };
	}

	const efficiencyName = `${resource} ${resource !== 'Parity' ? 'Efficiency' : 'Power'}`;
	const tooltipDiv = document.getElementById('tooltipDiv');
	const tooltipText = `The percentage you would like ${efficiencyName} to use on your heirloom. The value must be between 0 and 100.<br/><br/><input id="customNumberBox" style="width: 100%" onkeypress="heirloomResourceSettingEnter(event, '${resource}')" value="${heirloomInputs[heirloomID][resource].weight}"></input>`;
	const costText = `<div class="maxCenter"><div class="btn btn-info" onclick="heirloomResourceSettingSave('${resource}')">Apply</div><div class="btn btn-info" onclick="cancelTooltip()">Cancel</div></div>`;

	game.global.lockTooltip = true;
	tooltipDiv.style.left = '32.5%';
	tooltipDiv.style.top = '25%';
	document.getElementById('tipTitle').textContent = `${efficiencyName} Weight`;
	document.getElementById('tipText').innerHTML = tooltipText;
	document.getElementById('tipCost').innerHTML = costText;
	tooltipDiv.style.display = 'block';

	const customNumberBox = document.getElementById('customNumberBox');
	try {
		customNumberBox.setSelectionRange(0, box.value.length);
	} catch (e) {
		customNumberBox.select();
	}
	customNumberBox.focus();
}

function heirloomResourceSettingSave(resource) {
	const numBox = document.getElementById('customNumberBox').value;
	if (!numBox) return;
	unlockTooltip();
	tooltip('hide');

	let value = Number(numBox);
	if (value > 100 || value < 0 || isNaN(value)) value = 100;

	const heirloomInputs = JSON.parse(localStorage.getItem('heirloomInputs'));
	const selectedHeirloom = _getSelectedHeirloom().id;
	heirloomInputs[selectedHeirloom][resource].weight = value;
	localStorage.setItem('heirloomInputs', JSON.stringify(heirloomInputs));
	calculate();
}

function _getSelectedHeirloom() {
	if (['heirloomsCarried', 'heirloomsExtra'].includes(game.global.selectedHeirloom[1])) {
		return game.global[game.global.selectedHeirloom[1]][game.global.selectedHeirloom[0]];
	}

	return game.global[game.global.selectedHeirloom[1]];
}

function saveHeirloomSettings() {
	let heirloomInputs = JSON.parse(localStorage.getItem('heirloomInputs'));
	if (heirloomInputs === null) heirloomInputs = {};
	let update = heirloomInputs;

	heirloomInputs.VMWeight = heirloomInputs.VMWeight || 12;
	heirloomInputs.XPWeight = heirloomInputs.XPWeight || 11.25;
	heirloomInputs.HPWeight = heirloomInputs.HPWeight || 1;
	heirloomInputs.equipLevels = heirloomInputs.equipLevels || 90;
	heirloomInputs.equalityTarget = heirloomInputs.equalityTarget || 100;
	heirloomInputs.seedDrop = heirloomInputs.seedDrop || 2;

	const selectedHeirloom = _getSelectedHeirloom() && _getSelectedHeirloom().id;
	const customRatio = JSON.parse(document.getElementById('heirloomCustomRatioBtn').className.split(' ')[1].slice(10));
	if (customRatio && selectedHeirloom) {
		if (!heirloomInputs[selectedHeirloom]) heirloomInputs[selectedHeirloom] = {};
		if (!heirloomInputs[selectedHeirloom].Ratio) heirloomInputs[selectedHeirloom].Ratio = {};
		update = heirloomInputs[selectedHeirloom].Ratio;
	}

	update.VMWeight = $$('#VMWeight').value;
	update.XPWeight = $$('#XPWeight').value;
	update.HPWeight = $$('#HPWeight').value;
	update.equipLevels = $$('#equipLevels').value;
	update.equalityTarget = $$('#equalityTarget').value;
	update.seedDrop = $$('#seedDrop').value;

	localStorage.setItem('heirloomInputs', JSON.stringify(heirloomInputs));
	if (typeof autoTrimpSettings !== 'undefined' && typeof autoTrimpSettings.ATversion !== 'undefined' && autoTrimpSettings.ATversion.includes('SadAugust')) {
		autoTrimpSettings['autoHeirloomStorage'].value = JSON.stringify(heirloomInputs);
		saveSettings();
	}
}

function loadHeirloomSettings() {
	let heirloomInputs = JSON.parse(localStorage.getItem('heirloomInputs'));
	const selectedHeirloom = _getSelectedHeirloom().id;
	const heirloomSettings = heirloomInputs[selectedHeirloom];
	if (heirloomSettings && heirloomSettings.Ratio) heirloomInputs = heirloomSettings.Ratio;

	const resourceSettings = ['Ratio', 'Farmer', 'Lumberjack', 'Miner', 'Scientist', 'Parity', 'Dragimp', 'Explorer', 'Breed'];
	resourceSettings.forEach((setting) => {
		const enabledArray = ['Miner', 'Parity', 'Dragimp', 'Explorer'];
		let isEnabled = enabledArray.includes(setting);
		if (heirloomSettings) {
			isEnabled = (heirloomSettings[setting] && heirloomSettings[setting].enabled) || (typeof heirloomSettings[setting] === 'undefined' && enabledArray.includes(setting));
		}

		document.getElementById(`heirloomCustom${setting}Btn`).setAttribute('class', `btn settingBtn${isEnabled ? 'true' : 'false'} customEfficiencyBtn`);
	});

	document.getElementById('heirloomCustomRatioBtn').setAttribute('class', `btn settingBtn${heirloomSettings && heirloomSettings.Ratio ? 'true' : 'false'}`);

	$$('#VMWeight').value = heirloomInputs.VMWeight || 12;
	$$('#XPWeight').value = heirloomInputs.XPWeight || 11.25;
	$$('#HPWeight').value = heirloomInputs.HPWeight || 1;
	$$('#equipLevels').value = heirloomInputs.equipLevels || 90;
	$$('#equalityTarget').value = heirloomInputs.equalityTarget || Math.min(game.portal.Equality.radLevel, 100);
	$$('#seedDrop').value = heirloomInputs.seedDrop || 2;
}

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function roundFloatingPointErrors(n) {
	return Number(parseFloat(n.toFixed(2)));
}

class Heirloom {
	constructor(heirloom) {
		Object.assign(this, heirloom);
		/* add custom info we need */
		if (!this.isEmpty()) {
			const basePrices = [5, 10, 15, 25, 75, 150, 400, 1000, 2500, 7500, 50000, 375000, 2.75e6];
			const coreBasePrices = [20, 200, 2000, 20000, 200000, 2000000, 20000000, 200000000, 2000000000, 20000000000, 200000000000, 2000000000000, 2000000000000];
			const priceIncreases = [1.5, 1.5, 1.25, 1.19, 1.15, 1.12, 1.1, 1.06, 1.04, 1.03, 1.02, 1.015, 1.013];
			const settings = JSON.parse(localStorage.getItem('heirloomInputs'));
			const heirloomSettings = settings && settings[this.id] ? settings[this.id] : settings;
			const runningAT = typeof atConfig !== 'undefined';
			const source = heirloomSettings && heirloomSettings.Ratio ? heirloomSettings.Ratio : settings;

			this.inputs = {};
			for (const [key, value] of Object.entries(source)) {
				this.inputs[key] = Number(value);
			}

			const defaultKeys = {
				equipLevels: 90,
				VMWeight: 12,
				XPWeight: 11.25,
				HPWeight: 1,
				equalityTarget: Math.min(game.portal.Equality.radLevel, 100),
				seedDrop: 2
			};

			for (const key in defaultKeys) {
				if (typeof this.inputs[key] === 'undefined') {
					this.inputs[key] = defaultKeys[key];
				}
			}

			this.isCore = this.type === 'Core';

			this.basePrice = this.isCore ? coreBasePrices[this.rarity] : basePrices[this.rarity];
			this.priceIncrease = priceIncreases[this.rarity];

			this.breedHeirloom = runningAT && this.type === 'Shield' && this.name === getPageSetting('heirloomBreed');

			this.heirloomObj = {};
			['Farmer', 'Lumberjack', 'Miner', 'Scientist', 'Parity', 'Dragimp', 'Explorer', 'Breed'].forEach((item) => {
				const weakWeights = ['Dragimp', 'Explorer'].includes(item);
				let enabled = typeof heirloomSettings !== 'undefined' && typeof heirloomSettings[item] !== 'undefined' && heirloomSettings[item].enabled;
				const percent = enabled && typeof heirloomSettings[item].weight !== 'undefined' ? heirloomSettings[item].weight / 100 : weakWeights ? 0.01 : 1;
				if (weakWeights && typeof heirloomSettings !== 'undefined' && typeof heirloomSettings[item] === 'undefined') {
					enabled = true;
				}
				this.heirloomObj[item] = {
					enabled,
					percent
				};
			});

			this.fluffyRewards = {
				critChance: Fluffy.isRewardActive('critChance'),
				megaCrit: Fluffy.isRewardActive('megaCrit'),
				heirloopy: Fluffy.isRewardActive('heirloopy'),
				prism: Fluffy.isRewardActive('prism'),
				doubleCrit: Fluffy.isRewardActive('doubleCrit')
			};

			this.masteries = {
				crit: masteryPurchased('crit')
			};

			this.u2Spire = {
				critChance: u2SpireBonuses.critChance()
			};

			this.stepAmounts = {};
			this.softCaps = {};
			this.hardCaps = {};

			for (const mod of this.mods) {
				if (mod[0] === 'empty') continue;

				this.stepAmounts[mod[0]] = this.getStepAmount(mod[0], this.rarity);
				this.softCaps[mod[0]] = this.getSoftCap(mod[0], this.rarity);

				if (this.heirloomInfo[mod[0]].hardCaps !== undefined) {
					this.hardCaps[mod[0]] = this.getHardCap(mod[0], this.rarity);
				}
			}
		}
	}

	getStepAmount(type, rarity) {
		const modData = this.heirloomInfo[type];
		if (game.global.universe === 1 || modData.immutable || modData.noScaleU2) return modData.stepAmounts[rarity];

		if (!(modData.heirloopy && this.fluffyRewards.heirloopy)) return modData.stepAmounts[rarity] / 10;

		return modData.stepAmounts[rarity];
	}

	getSoftCap(type, rarity) {
		const modData = this.heirloomInfo[type];
		if (game.global.universe === 1 || modData.immutable || modData.noScaleU2) return modData.softCaps[rarity];

		if (!(modData.heirloopy && this.fluffyRewards.heirloopy)) return modData.softCaps[rarity] / 10;

		return modData.softCaps[rarity];
	}

	getHardCap(type, rarity) {
		const modData = this.heirloomInfo[type];
		if (game.global.universe === 1 || modData.immutable || modData.noScaleU2) return modData.hardCaps[rarity];

		if (!(modData.heirloopy && this.fluffyRewards.heirloopy)) return modData.hardCaps[rarity] / 10;

		return modData.hardCaps[rarity];
	}

	getCritStats() {
		const relentlessness = game.global.universe === 2 ? 0 : game.portal.Relentlessness.level;
		const criticality = game.global.universe === 2 ? game.portal.Criticality.radLevel : 0;
		const critMastery = this.masteries.crit;
		const critMod = this.getModValue('critDamage');
		const critChanceMod = this.getModValue('critChance');

		let critChance = relentlessness * 5;
		let critDamage = 100 + 230 * Math.min(relentlessness, 1) + 30 * Math.max(Math.min(relentlessness, 10) - 1, 0) + criticality * 10;
		let megaCritMult = 5;

		if (isNumeric(critMod)) {
			critDamage += critMod;
		}

		if (critMastery) {
			critChance += critChanceMod * 1.5;
			megaCritMult += 1;
		} else {
			critChance += critChanceMod;
		}

		if (this.fluffyRewards.critChance) {
			critChance += 50 * this.fluffyRewards.critChance;
		}

		if (this.fluffyRewards.megaCrit) {
			megaCritMult += 2;
		}

		if (this.u2Spire.critChance) {
			critChance += this.u2Spire.critChance * 100;
		}

		const dblCritChance = this.getModValue('doubleCrit') / 100 + (this.fluffyRewards.doubleCrit ? 0.2 : 0);

		return { critChance, critDamage, megaCritMult, dblCritChance };
	}

	normalizedCrit(critChance, critDamage, megaCrits, megaCritMult) {
		if (megaCrits === 0) {
			return critDamage * critChance + (1 - critChance) * 100;
		}

		const lowCrit = 1 - critChance;
		return critDamage * Math.pow(megaCritMult, megaCrits - 1) * (lowCrit + critChance * megaCritMult);
	}

	normalizedDoubleCrit(critChance, critDamage, megaCritMult, dblCritChance) {
		let critMult = 1;
		critChance /= 100;

		if (critChance < 0) {
			critMult = 1 + critChance - critChance / 5;
		} else if (critChance < 1) {
			const noCritNoDouble = (1 - critChance) * (1 - dblCritChance);
			const critNoDouble = critChance * (1 - dblCritChance) * critDamage;
			const noCritDouble = (1 - critChance) * dblCritChance * critDamage;
			const critDouble = critChance * dblCritChance * critDamage * critDamage;
			critMult = noCritNoDouble + critNoDouble + noCritDouble + critDouble;
		} else if (critChance < 2) {
			const megaCritDmg = Math.pow(megaCritMult, 1);
			const noCritNoDouble = (2 - critChance) * (1 - dblCritChance) * critDamage;
			const critNoDouble = (critChance - 1) * (1 - dblCritChance) * megaCritDmg * critDamage;
			const noCritDouble = (2 - critChance) * dblCritChance * megaCritDmg * critDamage;
			const critDouble = (critChance - 1) * dblCritChance * Math.pow(megaCritMult, 2) * critDamage;
			critMult = noCritNoDouble + critNoDouble + noCritDouble + critDouble;
		} else if (critChance >= 2) {
			let highTierChance = critChance - Math.floor(critChance);
			const lowTierMulti = Math.pow(megaCritMult, Math.floor(critChance) - 1);
			const highTierMulti = Math.pow(megaCritMult, Math.ceil(critChance) - 1);

			const doubleTierMulti = Math.pow(megaCritMult, Math.ceil(critChance) + 1);
			const noCritNoDouble = (1 - highTierChance) * (1 - dblCritChance) * lowTierMulti;
			const critNoDouble = highTierChance * (1 - dblCritChance) * highTierMulti;
			const noCritDouble = (1 - highTierChance) * dblCritChance * highTierMulti;
			const critDouble = highTierChance * dblCritChance * doubleTierMulti;
			critMult = (noCritNoDouble + critNoDouble + noCritDouble + critDouble) * critDamage;
		}

		return critMult;
	}

	get innate() {
		return this.getInnate(this.getTotalSpent());
	}

	// custom methods for ease of use
	isEmpty() {
		if (this.type === undefined) return true;

		return false;
	}

	hasUpgradableMods() {
		if (this.isEmpty()) return false;

		for (const mod of this.mods) {
			if (this.getModEfficiency(mod[0]) > 1) return true;
		}

		return false;
	}

	getModValue(type) {
		for (const mod of this.mods) {
			if (mod[0] === type) {
				const modData = this.heirloomInfo[type];
				if (game.global.universe === 1 || modData.immutable || modData.noScaleU2) return mod[1];

				if (!(modData.heirloopy && this.fluffyRewards.heirloopy)) return mod[1] / 10;

				return mod[1];
			}
		}

		return 0;
	}

	getModDefaultValue(type) {
		for (const mod of this.mods) {
			if (mod[0] === type) {
				return mod[1];
			}
		}

		return 0;
	}

	getModGain(type) {
		const value = this.getModValue(type);
		const stepAmount = this.stepAmounts[type];

		if (this.hardCaps[type] && value >= this.hardCaps[type]) {
			return 1;
		}

		if (type.includes('all') || type === 'ParityPower') {
			const modMapping = {
				allMetal: 'MinerSpeed',
				allWood: 'LumberjackSpeed',
				allFood: 'FarmerSpeed',
				ParityPower: 'ParitySpeed'
			};

			if (modMapping[type]) {
				type = modMapping[type];
			}
		}

		if (type === 'trimpAttack') {
			return (value + 100 + stepAmount) / (value + 100);
		}

		if (type === 'trimpHealth') {
			return (value + 100 + stepAmount * this.inputs.HPWeight) / (value + 100);
		}

		if (type === 'breedSpeed') {
			if (this.breedHeirloom) return 1e300;
			const breedSettings = this.heirloomObj.breed;
			if (typeof breedSettings !== 'undefined' && breedSettings.enabled) {
				if (breedSettings.percent === 0) return 0;

				/* magic number is log(1.01) / log(1 / 0.98) */
				const baseValue = (100 * Math.pow(value + stepAmount * this.inputs.HPWeight, 0.492524625)) / (100 * Math.pow(value, 0.492524625));
				const adjustedValue = (baseValue - 1) * breedSettings.percent + 1;

				return adjustedValue;
			}
		}

		if (type === 'prismatic') {
			/* 50 base, 50 from prismatic palace */
			let shieldPercent = 100;
			shieldPercent += game.portal.Prismal.radLevel;
			if (this.fluffyRewards.prism) shieldPercent += 25;

			return (value + shieldPercent + 100 + stepAmount * this.inputs.HPWeight) / (value + shieldPercent + 100);
		}

		if (type === 'critDamage') {
			const relentlessness = game.global.universe === 2 ? 0 : game.portal.Relentlessness.level;
			const criticality = game.global.universe === 2 ? game.portal.Criticality.radLevel : 0;
			let critChance = relentlessness * 5;
			let megaCritMult = 5;

			critChance += this.getModValue('critChance') * (this.masteries.crit ? 1.5 : 1);
			if (this.fluffyRewards.critChance) critChance += 50 * this.fluffyRewards.critChance;
			if (this.u2Spire.critChance) critChance += this.u2Spire.critChance * 100;
			if (critChance === 0) return 1;

			if (this.fluffyRewards.megaCrit) megaCritMult += 2;
			if (this.masteries.crit) megaCritMult += 1;

			const megaCrits = Math.floor(critChance / 100);
			critChance = Math.min(critChance - megaCrits * 100, 100) / 100;
			const critDamage = value + 230 * Math.min(relentlessness, 1) + 30 * Math.max(Math.min(relentlessness, 10) - 1, 0) + criticality * 10;
			const critDmgNormalizedBefore = this.normalizedCrit(critChance, critDamage, megaCrits, megaCritMult);
			const critDmgNormalizedAfter = this.normalizedCrit(critChance, critDamage + stepAmount, megaCrits, megaCritMult);

			return critDmgNormalizedAfter / critDmgNormalizedBefore;
		}

		if (type === 'critChance') {
			const { critChance, critDamage, megaCritMult } = this.getCritStats();
			const stepIncrease = this.masteries.crit ? stepAmount * 1.5 : stepAmount;

			const megaCritsBefore = Math.floor(critChance / 100);
			const megaCritsAfter = Math.floor((critChance + stepIncrease) / 100);

			const critChanceAfter = Math.min(critChance + stepIncrease - megaCritsAfter * 100, 100) / 100;
			const critChanceBefore = Math.min(critChance - megaCritsBefore * 100, 100) / 100;

			const critDmgNormalizedBefore = this.normalizedCrit(critChanceBefore, critDamage, megaCritsBefore, megaCritMult);
			const critDmgNormalizedAfter = this.normalizedCrit(critChanceAfter, critDamage, megaCritsAfter, megaCritMult);

			return critDmgNormalizedAfter / critDmgNormalizedBefore;
		}

		if (type === 'doubleCrit') {
			const { critChance, critDamage, megaCritMult, dblCritChance } = this.getCritStats();
			const stepIncrease = stepAmount / 100;

			const critDmgNormalizedBefore = this.normalizedDoubleCrit(critChance, critDamage, megaCritMult, dblCritChance);
			const critDmgNormalizedAfter = this.normalizedDoubleCrit(critChance, critDamage, megaCritMult, dblCritChance + stepIncrease);

			return critDmgNormalizedAfter / critDmgNormalizedBefore;
		}

		if (type === 'voidMaps') {
			if (this.inputs.VMWeight === 0) return 0;
			const divider = game.global.universe === 2 ? 10 : 1;
			return (value + stepAmount * (this.inputs.VMWeight / divider)) / value;
		}

		if (type === 'gammaBurst') {
			return ((value + stepAmount) / 100 + 1) / 5 / ((value / 100 + 1) / 5);
		}

		if (type === 'FluffyExp') {
			if (this.inputs.XPWeight === 0) return 0;
			return (value + 100 + stepAmount * this.inputs.XPWeight) / (value + 100);
		}

		if (type === 'SeedDrop') {
			if (this.inputs.seedDrop === 0) return 0;
			return (value + 100 + stepAmount * this.inputs.seedDrop) / (value + 100);
		}

		if (type === 'plaguebringer') {
			return (value + 100 + stepAmount) / (value + 100);
		}

		const typeSplit = type.split('Speed');
		if (type.includes('Speed') && typeof this.heirloomObj[typeSplit[0]] !== 'undefined' && this.heirloomObj[typeSplit[0]].enabled) {
			if (this.heirloomObj[typeSplit[0]].percent === 0) return 0;
			const addedValue = typeSplit[0] === 'Parity' ? 1 : 100;
			const baseValue = Math.log(((value + addedValue + stepAmount) / (value + addedValue)) * (Math.pow(1.2, this.inputs.equipLevels) - 1) + 1) / Math.log(1.2) / this.inputs.equipLevels;
			const adjustedValue = (baseValue - 1) * this.heirloomObj[typeSplit[0]].percent + 1;

			return adjustedValue;
		}

		if (type === 'inequality') {
			const currentValue = value / 10;
			const stepAmt = stepAmount / 10;
			const newValue = Math.pow((1 - 0.1 * (1 - (currentValue + stepAmt) / 100)) / 0.9, this.inputs.equalityTarget);
			const oldValue = Math.pow((1 - 0.1 * (1 - currentValue / 100)) / 0.9, this.inputs.equalityTarget);

			return newValue / oldValue;
		}

		if (this.isCore) {
			loadCore(this);
			const before = getMaxEnemyHP();
			const beforeRS = estimatedMaxDifficulty(before).runestones;
			loadCore(this, type, value + stepAmount);
			const after = getMaxEnemyHP();
			const afterRS = estimatedMaxDifficulty(after).runestones;
			/* 0.971 is the andrew constant, thanks andrew
			also ghostfrog, pls pm me to tell me how I did this wrong again */
			if (type === 'runestones') {
				return (afterRS / beforeRS - 1) * 0.971 + 1;
			}

			return after / before;
		}

		return 0;
	}

	getModEfficiency(type) {
		if (type === 'empty') {
			return 1;
		}

		if (this.heirloomInfo[type].weighable) {
			const modCost = this.getModCost(type);
			if (modCost >= 1e150) {
				return 0;
			}

			return (this.getModGain(type) - 1) / (modCost / this.basePrice) + 1;
		}

		return 1;
	}

	/* add arrays for max normal values, if below or equal to, return normal price, else divide the amount over the normal value by the step to get amount and calculate the price with the amount */
	getModCost(type) {
		if (type === 'empty') {
			return 1e100;
		}

		const value = this.getModValue(type);
		if (value <= this.softCaps[type] || !isNumeric(value)) {
			return this.basePrice;
		}

		const amount = (value - this.softCaps[type]) / this.stepAmounts[type];
		if (this.hardCaps[type]) {
			return value >= this.hardCaps[type] ? 1e100 : Math.floor(this.basePrice * Math.pow(this.priceIncrease, amount));
		}

		return Math.floor(this.basePrice * Math.pow(this.priceIncrease, amount));
	}

	getModSpent(type) {
		let cost = 0;
		if (type === 'empty') {
			return cost;
		}

		const dummyHeirloom = new Heirloom(deepClone(this));
		for (const mod of dummyHeirloom.mods) {
			if (mod[0] === type) {
				const stepAmount = this.heirloomInfo[type].stepAmounts[this.rarity];
				const name = type;
				const targetValue = mod[1];
				mod[1] -= mod[3] * stepAmount;
				while (mod[1] < targetValue) {
					cost += dummyHeirloom.getModCost(name);
					mod[1] += stepAmount;
					mod[1] = roundFloatingPointErrors(mod[1]);
				}
			}
		}

		return cost;
	}

	getTotalSpent() {
		if (this.isEmpty()) {
			return 0;
		}

		let cost = 0;
		if (this.replaceSpent) {
			cost += this.replaceSpent;
		}

		for (const mod of this.mods) {
			if (mod[0] !== 'empty') cost += this.getModSpent(mod[0]);
		}

		if (this.isCore) {
			return cost;
		}

		return cost;
	}

	getDamageMult() {
		let trimpAttackMult = 1 + this.getModValue('trimpAttack') / 100;
		trimpAttackMult *= Math.pow((1 - 0.1 * (1 - this.getModValue('inequality') / 100)) / 0.9, this.inputs.equalityTarget);
		const relentlessness = game.global.universe === 2 ? 0 : game.portal.Relentlessness.level;
		const criticality = game.global.universe === 2 ? game.portal.Criticality.radLevel : 0;
		let critChance = relentlessness * 5;
		let megaCritMult = 5;

		if (this.masteries.crit) {
			critChance += this.getModValue('critChance') * 1.5;
			megaCritMult += 1;
		} else {
			critChance += this.getModValue('critChance');
		}

		if (this.fluffyRewards.critChance) critChance += 50 * this.fluffyRewards.critChance;
		if (this.fluffyRewards.megaCrit) megaCritMult += 2;
		const megaCrits = Math.floor(critChance / 100);
		critChance = Math.min(critChance - megaCrits * 100, 100) / 100;
		const critDamage = this.getModValue('critDamage') + 230 * Math.min(relentlessness, 1) + 30 * Math.max(Math.min(relentlessness, 10) - 1, 0) + criticality * 10;
		const critDmgNormalized = this.normalizedCrit(critChance, critDamage, megaCrits, megaCritMult);

		return (trimpAttackMult * critDmgNormalized) / 100;
	}

	forceCritBreakpoint() {
		if (this.isEmpty()) {
			return new Heirloom();
		}

		const heirloom = new Heirloom(deepClone(this));
		const critMult = this.masteries.crit ? 1.5 : 1;
		let critModValue = heirloom.getModValue('critChance');
		let currency = Math.floor(game.global.nullifium * getNuSpendMult()) - this.getTotalSpent();
		let efficiency = 1;
		let paid = 0;
		let cost = 0;
		let name = '';
		let index = -1;
		const purchases = [0, 0, 0, 0, 0, 0, 0];
		const relentlessness = game.global.universe === 2 ? 0 : game.portal.Relentlessness.level;
		let critChance = relentlessness * 5;
		if (this.fluffyRewards.critChance) critChance += 50 * this.fluffyRewards.critChance;
		const megaCrits = Math.floor((critChance + critModValue * critMult) / 100);

		while (true) {
			while (Math.floor((critChance + critModValue * critMult) / 100) === megaCrits) {
				cost = heirloom.getModCost('critChance');
				index = heirloom.mods.indexOf(heirloom.mods.filter((mod) => mod[0] === 'critChance')[0]);
				if (currency >= cost) {
					heirloom.mods[index][1] += this.heirloomInfo.critChance.stepAmounts[heirloom.rarity];
					heirloom.mods[index][3] += 1;
					purchases[index] += 1;
					currency -= cost;
					paid += cost;
					critModValue = heirloom.getModValue('critChance');
				} else {
					break;
				}
			}

			efficiency = 1;
			for (const mod of heirloom.mods) {
				const modEfficiency = heirloom.getModEfficiency(mod[0]);
				if (modEfficiency > efficiency) {
					efficiency = modEfficiency;
					cost = heirloom.getModCost(mod[0]);
					name = mod[0];
					index = heirloom.mods.indexOf(mod);
				}
			}

			if (name === '' || efficiency <= 1) {
				break;
			}

			if (currency >= cost) {
				heirloom.mods[index][1] += this.heirloomInfo[name].stepAmounts[heirloom.rarity];
				heirloom.mods[index][1] = roundFloatingPointErrors(heirloom.mods[index][1]);
				heirloom.mods[index][3] += 1;
				purchases[index] += 1;
				currency -= cost;
				paid += cost;
			} else {
				break;
			}
		}

		const nextCost = Math.floor((cost - (Math.floor(game.global.nullifium * getNuSpendMult()) - heirloom.getTotalSpent())) / getNuSpendMult());
		heirloom.paid = paid;
		heirloom.next = { name, cost: nextCost };
		heirloom.purchases = purchases;
		heirloom.successful = Math.floor((critChance + critModValue * critMult) / 100) > megaCrits;
		return heirloom;
	}

	calculatePurchases() {
		if (this.isEmpty()) {
			return new Heirloom();
		}

		const heirloom = new Heirloom(deepClone(this));
		let currency = this.isCore ? playerSpire.spirestones - this.getTotalSpent() : Math.floor(game.global.nullifium * getNuSpendMult()) - this.getTotalSpent();
		let efficiency = 1;
		let paid = 0;
		let cost = 0;
		let name = '';
		let index = -1;
		const purchases = [0, 0, 0, 0, 0, 0, 0];

		while (true) {
			efficiency = 1;
			for (const mod of heirloom.mods) {
				let modEff = heirloom.getModEfficiency(mod[0]);
				if (modEff > efficiency) {
					efficiency = modEff;
					cost = heirloom.getModCost(mod[0]);
					name = mod[0];
					index = heirloom.mods.indexOf(mod);
				}
			}

			if (name === '' || efficiency <= 1) {
				break;
			}

			if (currency >= cost) {
				heirloom.mods[index][1] += this.heirloomInfo[name].stepAmounts[heirloom.rarity];
				/* fp errors can lead to fractional purchases */
				heirloom.mods[index][1] = roundFloatingPointErrors(heirloom.mods[index][1]);
				heirloom.mods[index][3] += 1;
				purchases[index] += 1;
				currency -= cost;
				paid += cost;
			} else {
				break;
			}
		}

		if (heirloom.type === 'Shield') {
			const forcedCritHeirloom = this.forceCritBreakpoint();
			if (forcedCritHeirloom.getDamageMult() > heirloom.getDamageMult() && forcedCritHeirloom.successful) {
				return forcedCritHeirloom;
			}
		}

		const nextCost = heirloom.isCore ? Math.floor(cost - (playerSpire.spirestones - heirloom.getTotalSpent())) : Math.floor((cost - (Math.floor(game.global.nullifium * getNuSpendMult()) - heirloom.getTotalSpent())) / getNuSpendMult());
		heirloom.paid = paid;
		heirloom.next = { name, cost: nextCost };
		heirloom.purchases = purchases;

		/* fix any floating point errors that may have occured */
		for (const mod of heirloom.mods) {
			name = mod[0];
			if (name === 'empty') {
				continue;
			}

			if (game.global.universe === 1 || heirloom.heirloomInfo[name].immutable || heirloom.heirloomInfo[name].noScaleU2) {
			} else if (!(heirloom.heirloomInfo[name].heirloopy && heirloom.fluffyRewards.heirloopy)) {
				if (this.hardCaps[name]) this.hardCaps[name] *= 10;
			}

			index = heirloom.mods.indexOf(mod);
			if (this.hardCaps[name] && heirloom.mods[index][1] > this.hardCaps[name]) {
				heirloom.mods[index][1] = this.hardCaps[name];
			}
		}

		return heirloom;
	}

	getInnate(spent) {
		if (this.type === 'Staff') {
			const parityPower = game.global.StaffEquipped.mods.filter((mod) => mod[0] === 'ParityPower');
			let mult = Math.log10(spent + 1e6) / 5;

			if (parityPower.length > 0) {
				mult *= 1 + parityPower[0][1] / 1000;
			}

			return (mult - 1) * 100;
		}

		let mult = Math.log10(spent + 1e6) * (this.rarity === 11 ? 10000 : 4000);
		return game.global.universe === 2 ? mult / 10 : mult;
	}

	getInnateGain(type) {
		if (this.rarity < 10 || this.inputs.equipLevels === 0) {
			return 1;
		}

		const value = this.getInnate(this.getTotalSpent());
		const stepAmount = this.getInnate(this.getTotalSpent() + this.getModCost(type)) - value;

		let gain;
		if (this.type === 'Staff') {
			gain = Math.log(((value + 100 + stepAmount) / (value + 100)) * (Math.pow(1.2, this.inputs.equipLevels) - 1) + 1) / Math.log(1.2) / this.inputs.equipLevels;
		} else if (this.type === 'Shield') {
			gain = ((value + stepAmount) / 100 + 1) / 5 / ((value / 100 + 1) / 5);
		}

		return gain;
	}

	getInnateEfficiency(type) {
		if (this.rarity < 10) return 0;
		return (this.getInnateGain(type) - 1) / (this.getModCost(type) / this.basePrice);
	}
}

function updateModContainer(divName = 'heirloomHelpBtn', heirloom) {
	function humanify(num, places) {
		return Number(num)
			.toFixed(places)
			.replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/u, '$1');
	}

	let infoText = `Below is a list of the calulated costs, gains, and efficiency of each weighted<br>upgrade, taken from the stats displayed on this heirloom.<br><br>`;
	let infoValueText = '';

	const heirloomData = heirloomInfo(heirloom.type);
	const heirloomValue = heirloom.getTotalSpent();
	let bestEfficiency = 1;

	for (const mod of heirloom.mods) {
		const modEfficiency = heirloom.getModEfficiency(mod[0]);
		if (modEfficiency > bestEfficiency) {
			bestEfficiency = modEfficiency;
		}

		const cost = heirloom.getModSpent(mod[0]);
		if (mod[0] !== 'empty' && cost > 0) {
			infoValueText += `<br>&nbsp&nbsp&nbsp•&nbsp&nbsp<b>${heirloomData[mod[0]].name}</b>: +${prettify(cost)} (${humanify((cost / heirloomValue) * 100, 2)}%)`;
		}
	}

	for (let i = 0; i < 7; i++) {
		const mod = heirloom.mods[i];
		if (mod) {
			if (heirloom.getModEfficiency(mod[0]) > 1) {
				const modCost = heirloom.getModCost(mod[0]);
				const modGain = heirloom.getModGain(mod[0]);
				const modInnateGain = heirloom.getInnateGain(mod[0]);
				const modEfficiency = heirloom.getModEfficiency(mod[0]);

				infoText += `<b>${heirloomData[mod[0]].name}</b>:<br>`;
				infoText += `&nbsp&nbsp&nbsp<b>•&nbsp&nbspCost</b>: ${modCost === 1e100 ? '∞' : prettify(modCost)}`;
				infoText += `&nbsp&nbsp&nbsp<b>•&nbsp&nbspGain</b>: ${humanify((modGain + modInnateGain - 2) * 100, 3)}%`;
				infoText += `&nbsp&nbsp&nbsp<b>•&nbsp&nbspEfficiency</b>: ${humanify(((modEfficiency - 1) / (bestEfficiency - 1)) * 100, 2)}%</span>`;
				infoText += `<br>`;
			}
		}
	}

	infoText += `<b>${heirloom.isCore ? 'Spirestone' : 'Nullifium'} Value</b>:`;
	infoText += `${heirloom.replaceSpent ? `<br>&nbsp&nbsp&nbsp•&nbsp&nbsp<b>Mod changes</b>: ${prettify(heirloom.replaceSpent)} (${humanify((heirloom.replaceSpent / heirloomValue) * 100, 2)}%)` : ''}`;
	infoText += ` ${infoValueText}`;
	infoText += `<br>&nbsp&nbsp&nbsp•&nbsp&nbsp<b>Total</b>: ${prettify(heirloomValue)}<br>`;

	if (heirloom.type.includes('Core')) {
		const enemyMaxHealth = getMaxEnemyHP();
		const estimatedDifficulty = estimatedMaxDifficulty(enemyMaxHealth);
		infoText += `<br>Your spire deals <span style='color: #fff59d'>${prettify(Math.round(enemyMaxHealth))}</span> damage with this core, and averages`;
		infoText += ` <b><span style='color: #9fa8da'>${prettify(Math.round(estimatedDifficulty.runestones))}</span></b> runestones per enemy,`;
		infoText += ` while managing a threat of <b><span style='color: #ef9a9a;'>${Math.round(estimatedDifficulty.difficulty)}</span></b>.`;
	}

	const tooltipText = `tooltip("Heirloom Modifier Information", "customText", event, "${infoText}")`;
	document.getElementById(`${divName}`).setAttribute('onmouseover', tooltipText);
}

function deepClone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function calculate(autoUpgrade) {
	const selectedLoom = game.global.selectedHeirloom;
	if (selectedLoom.length === 0) return;

	const startingHeirloom = selectedLoom[1].includes('Equipped') ? game.global[selectedLoom[1]] : game.global[selectedLoom[1]][selectedLoom[0]];
	const allocateName = startingHeirloom.type.includes('Core') ? 'Allocate Spirestones' : 'Allocate Nullifium';
	const allocatorButton = document.getElementById('heirloomAllocatorBtn');
	if (allocatorButton.innerHTML !== allocateName) allocatorButton.innerHTML = allocateName;

	const elemList = ['heirloomRatios0', 'VMWeight', 'HPWeight', 'equalityTarget', 'equipLevels', 'XPWeight', 'seedDrop', 'heirloomCustomRatioBtn'];
	const displayList = ['heirloomRatios0']; /* heirloomRatios0 is needed to display the UI */

	if (startingHeirloom.type.includes('Shield')) {
		displayList.push('VMWeight', 'HPWeight', 'equalityTarget', 'heirloomCustomRatioBtn');
	} else if (startingHeirloom.type.includes('Staff')) {
		displayList.push('equipLevels', 'XPWeight', 'heirloomCustomRatioBtn', 'seedDrop');
	} else if (startingHeirloom.type.includes('Core')) {
		startTDCalc();
	}

	const resourceObj = {
		Farmer: ['FarmerSpeed', 'allFood'],
		Lumberjack: ['LumberjackSpeed', 'allWood'],
		Miner: ['MinerSpeed', 'allMetal'],
		Scientist: ['ScientistSpeed'],
		Parity: ['ParityPower'],
		Dragimp: ['DragimpSpeed'],
		Explorer: ['ExplorerSpeed'],
		Breed: ['breedSpeed']
	};

	const modList = [];
	for (const item in startingHeirloom.mods) {
		modList.push(startingHeirloom.mods[item][0]);
	}

	elemList.forEach((id) => setElemDisplay(id, displayList.includes(id) ? (id === 'heirloomRatios0' ? 'inline-block' : 'flex') : 'none', true));
	Object.keys(resourceObj).forEach((id) => {
		const showBtn = resourceObj[id].some((mod) => modList.includes(mod));
		setElemDisplay(`heirloomCustom${id}Btn`, showBtn ? 'flex' : 'none', false);
	});

	if (startingHeirloom.type.includes('Shield')) {
		setElemDisplay('equalityTargetDiv', startingHeirloom.rarity < 11 ? 'hidden' : 'visible', false, 'visibility');
	}

	const resourceListDisplay = startingHeirloom.type.includes('Staff');
	if (resourceListDisplay) {
		setElemDisplay('XPWeightDiv', game.global.spiresCompleted < 2 ? 'hidden' : 'visible', false, 'visibility');
		setElemDisplay('heirloomCustomParityBtn', startingHeirloom.rarity >= 11 ? 'flex' : 'none', false);
		setElemDisplay('seedDropDiv', startingHeirloom.rarity < 12 ? 'hidden' : 'visible', false, 'visibility');
	}

	const heirloomData = heirloomInfo(startingHeirloom.type);
	startingHeirloom.heirloomInfo = heirloomData;
	const startingHeirloomAdj = new Heirloom(startingHeirloom);
	const newHeirloom = new Heirloom(startingHeirloomAdj).calculatePurchases();

	if (autoUpgrade) {
		return {
			oldLoom: selectedLoom,
			newLoom: newHeirloom
		};
	}

	if (newHeirloom) {
		const precision = 3;
		const factor = Math.pow(10, precision);
		const heirloopy = Fluffy.isRewardActive('heirloopy');

		function precisionRoundMod(number, precision = 3, factor = Math.pow(10, 3)) {
			const n = precision < 0 ? number : 0.01 / factor + number;
			return Math.round(n * factor) / factor;
		}

		function getModValue(mod) {
			const modData = heirloomData[mod[0]];

			if (game.global.universe === 1 || modData.immutable || modData.noScaleU2) return mod[1];

			if (!(modData.heirloopy && heirloopy)) return mod[1] / 10;

			return mod[1];
		}

		for (let y = 0; y < newHeirloom.mods.length; y++) {
			const elem = document.getElementsByClassName('heirloomMod')[y];
			let modDetails = elem.innerHTML.split('(')[0];

			if (elem.innerHTML.includes('Pet')) {
				modDetails = `${modDetails} (${elem.innerHTML.split('(')[1]}`;
			}

			if (newHeirloom.purchases[y] === 0) {
				if (elem.innerHTML !== `${modDetails}`) {
					elem.innerHTML = `${modDetails}`;
				}
				continue;
			}

			const modValue = prettify(precisionRoundMod(getModValue(newHeirloom.mods[y]), precision, factor));
			elem.innerHTML = `${modDetails} (${modValue}% +${newHeirloom.purchases[y]})`;
		}
	}

	setupHeirloomHelpBtn();
	updateModContainer('heirloomHelpBtn', startingHeirloomAdj);
}

function setElemDisplay(id, value, isParent = false, type = 'display') {
	let element = document.getElementById(id);

	if (isParent) {
		element = element.parentNode;
		if (id !== 'heirloomCustomRatioBtn' && id !== 'heirloomRatios0') element = element.parentNode;
	}

	if (element && element.style[type] !== value) {
		element.style[type] = value;
	}
}

function autoUpgradeHeirlooms() {
	if (!getPageSetting('autoHeirlooms')) return;

	for (let i = 0; i < game.global.heirloomsCarried.length; i++) {
		if (getTotalHeirloomRefundValue(game.global.heirloomsCarried[i], true) > 0) {
			game.global.selectedHeirloom = [i, 'heirloomsCarried'];
			runHeirlooms();
		}
	}

	const heirloomTypes = ['ShieldEquipped', 'StaffEquipped', 'CoreEquipped'];
	heirloomTypes.forEach((type) => {
		if (!isObjectEmpty(game.global[type]) && Object.keys(game.global[type]).length !== 1 && getTotalHeirloomRefundValue(game.global[type], true) > 0) {
			game.global.selectedHeirloom = [-1, type];
			runHeirlooms();
		}
	});
}

/* spireTD core calculations */
function startTDCalc() {
	if (playerSpire.layout === null) return;

	atData.autoHeirlooms.strengthLocations = [];
	atData.autoHeirlooms.lightColStacks = [0, 0, 0, 0, 0];
	atData.autoHeirlooms.selectedTrap = null;
	atData.autoHeirlooms.finalToxicity = 0;

	atData.autoHeirlooms.detailed = [{}];
	for (let x = 0; x < 5 * playerSpire.rowsAllowed; x++) {
		if (atData.autoHeirlooms.detailed[x] === undefined) {
			atData.autoHeirlooms.detailed[x] = {};
		}
	}

	const index = playerSpire.layout.length;
	for (let x = 0; index > x; x++) {
		atData.autoHeirlooms.selectedTrap = playerSpire.layout[x].trap.name;
		setTrap(x);
	}

	for (const trap in playerSpireTraps) {
		updateTrapDamage(trap.toLowerCase(), playerSpireTraps[trap].level, true);
	}

	runInformation();
}

function runInformation() {
	imAnEnemy();
	imAnEnemy(getMaxEnemyHP());
}

function loadCore(core, overwrite, overwriteValue) {
	if (!core.isEmpty()) {
		// reset data
		traps.fire.coreMult = 1;
		traps.poison.coreMult = 1;
		traps.lightning.coreMult = 1;
		traps.strength.coreMult = 1;
		traps.condenser.coreMult = 1;
		traps.runestones.coreMult = 1;

		const modNamesToTraps = {
			fireTrap: 'fire',
			poisonTrap: 'poison',
			lightningTrap: 'lightning',
			strengthEffect: 'strength',
			condenserEffect: 'condenser',
			runestones: 'runestones'
		};

		for (const mod of core.mods) {
			const bonus = mod[1];
			traps[modNamesToTraps[mod[0]]].coreMult = 1 + bonus / 100;
		}

		// overwrite lets you overwrite one of the core values, to make it easier to calc upg gain
		if (overwrite !== undefined) {
			traps[modNamesToTraps[overwrite]].coreMult = 1 + overwriteValue / 100;
		}
	}
}

function insertSelection(loc) {
	if (loc >= playerSpire.layout.length || loc < 0) return;

	const insertType = atData.autoHeirlooms.selectedTrap;
	atData.autoHeirlooms.selectedTrap = 'Empty';
	let first = 0;
	let last = -1;
	const newTraps = [];

	for (let i = 0; i < playerSpire.layout.length; i++) {
		if (atData.autoHeirlooms.detailed[i].selected === undefined || atData.autoHeirlooms.detailed[i].selected === false) {
			if (first > last) {
				first++;
			} else {
				newTraps[newTraps.length] = null;
			}
		} else {
			last = i;
			newTraps[newTraps.length] = atData.autoHeirlooms.detailed[i].type;

			if (insertType === 'Move') {
				setTrap(i);
			}
		}
	}

	if (last !== -1) {
		for (let e = 0; e < newTraps.length && e + loc < playerSpire.layout.length && e <= last - first; e++) {
			if (newTraps[e] !== null) {
				/* empty all cells first to clear any Strength towers */
				setTrap(e + loc);
			}
		}

		imAnEnemy();

		for (let n = 0; n < newTraps.length && n + loc < playerSpire.layout.length && n <= last - first; n++) {
			atData.autoHeirlooms.selectedTrap = newTraps[n];
			setTrap(n + loc);
		}
	}

	runInformation();
}

function setTrap(number) {
	if (atData.autoHeirlooms.selectedTrap === null || atData.autoHeirlooms.selectedTrap === atData.autoHeirlooms.detailed[number].type) return false;

	const row = Math.floor(number / 5);
	if (atData.autoHeirlooms.strengthLocations[row] === true && atData.autoHeirlooms.selectedTrap === 'Strength') {
		for (s = row * 5; s < (row + 1) * 5; s++) {
			if (atData.autoHeirlooms.detailed[s].type === 'Strength') {
				atData.autoHeirlooms.selectedTrap = 'Empty';
				setTrap(s);
				atData.autoHeirlooms.selectedTrap = 'Strength';
				break;
			}
		}
	}

	switch (atData.autoHeirlooms.selectedTrap) {
		case 'Strength':
			atData.autoHeirlooms.strengthLocations[row] = true;
			break;
		case 'Lightning':
			atData.autoHeirlooms.lightColStacks[number % 5]++;
		default:
			if (atData.autoHeirlooms.detailed[number].type === 'Strength') {
				atData.autoHeirlooms.strengthLocations[row] = false;
			}
			break;
	}

	if (atData.autoHeirlooms.detailed[number].type === 'Lightning' && atData.autoHeirlooms.lightColStacks[number % 5] > 0) {
		atData.autoHeirlooms.lightColStacks[number % 5]--;
	}

	atData.autoHeirlooms.detailed[number].selected = false;
	atData.autoHeirlooms.detailed[number].type = atData.autoHeirlooms.selectedTrap;
	return true;
}

function imAnEnemy(health = 0) {
	// hey you're an enemy cool
	atData.autoHeirlooms.ticks = 0;

	// damage you've taken
	let damageTaken = 0;
	// chilled by Frost Trap
	let chilledFor = 0;
	// frozen by knowledge
	let frozenFor = 0;
	// current Poison Stack you have, will take damage at end of turn
	let poisonStack = 0;
	let shockedFor = 0;
	let addDamage = 0;
	let addStack = 0;
	let instaKill = false;

	let toxy;
	let condensed;

	for (let p = 0; p < playerSpire.layout.length; p++) {
		atData.autoHeirlooms.detailed[p].row = Math.floor(p / 5);
		atData.autoHeirlooms.detailed[p].killCount = 0;
		if (atData.autoHeirlooms.detailed[p].type === undefined) {
			atData.autoHeirlooms.detailed[p].type = playerSpire.layout[p].trap.name;
		}
		if (chilledFor > 0 && frozenFor === 0) {
			atData.autoHeirlooms.detailed[p].chilled = true;
			chilledFor -= 1;
		} else {
			atData.autoHeirlooms.detailed[p].chilled = false;
		}
		if (frozenFor > 0 && chilledFor === 0) {
			atData.autoHeirlooms.detailed[p].frozen = true;
			frozenFor -= 1;
		} else {
			atData.autoHeirlooms.detailed[p].frozen = false;
		}
		if (atData.autoHeirlooms.strengthLocations[atData.autoHeirlooms.detailed[p].row]) {
			atData.autoHeirlooms.detailed[p].strengthed = true;
		} else {
			atData.autoHeirlooms.detailed[p].strengthed = false;
		}
		if (shockedFor > 0) {
			atData.autoHeirlooms.detailed[p].shocked = true;
		} else {
			atData.autoHeirlooms.detailed[p].shocked = false;
		}

		switch (atData.autoHeirlooms.detailed[p].type) {
			case 'Empty':
				break;
			case 'Fire':
				addDamage = calcFire(p, shockedFor);
				break;
			case 'Frost':
				addDamage = calcFrost(p);
				chilledFor = traps.frost.slow;
				if (atData.autoHeirlooms.detailed[p].shocked) chilledFor *= traps.lightning.effect;
				if (atData.autoHeirlooms.detailed[p].frozen) {
					frozenFor = 0;
					atData.autoHeirlooms.detailed[p].frozen = false;
				}
				break;
			case 'Poison':
				toxy = calcPoison(p, shockedFor, health, damageTaken);
				addStack = toxy.stack;
				addDamage = toxy.damage;
				break;
			case 'Lightning':
				shockedFor = traps.lightning.length;
				addDamage = calcLightning(p);
				break;
			case 'Strength':
				atData.autoHeirlooms.strengthLocations[atData.autoHeirlooms.detailed[p].row] = true;
				addDamage = calcStrength(p, shockedFor);
				break;
			case 'Condenser':
				condensed = calcCondenser(p, shockedFor);
				addDamage += poisonStack * condensed.damageFactor;
				poisonStack *= condensed.poisonMult;
				break;
			case 'Knowledge':
				if (atData.autoHeirlooms.detailed[p].chilled) {
					chilledFor = 0;
					frozenFor = traps.knowledge.slow;
					if (atData.autoHeirlooms.detailed[p].shocked) frozenFor *= traps.lightning.effect;
				}
				break;
		}

		if (health !== 0 && atData.autoHeirlooms.detailed[p].type === 'Fire' && traps.fire.level >= 4 && damageTaken + addDamage > health * 0.8 && !instaKill) {
			addDamage += health * 0.2;
			instaKill = true;
		} else if (atData.autoHeirlooms.detailed[p].type !== 'Condenser') {
			/* condenser poison stack damage is complicated and is handled in the case statement above */
			addDamage += poisonStack * multipleDamage(atData.autoHeirlooms.detailed[p], 'poisonDamage');
		}

		atData.autoHeirlooms.detailed[p].addedPoison = addStack;
		atData.autoHeirlooms.detailed[p].poisonStacks = poisonStack;
		atData.autoHeirlooms.detailed[p].damageTaken = addDamage;
		atData.autoHeirlooms.detailed[p].allDamageTaken = damageTaken + addDamage;
		// turn new stacks into old stacks
		poisonStack += addStack;
		addStack = 0;
		atData.autoHeirlooms.ticks += 1;

		// add additional ticks if needed to account for runestone buffs
		if (atData.autoHeirlooms.detailed[p].chilled && atData.autoHeirlooms.detailed[p].type !== 'Knowledge' && atData.autoHeirlooms.detailed[p].type !== 'Frost') atData.autoHeirlooms.ticks += 1;
		if (atData.autoHeirlooms.detailed[p].frozen && atData.autoHeirlooms.detailed[p].type !== 'Frost') atData.autoHeirlooms.ticks += 2;

		// damage
		damageTaken += addDamage;
		addDamage = 0;

		shockedFor -= subtractShocks(p, shockedFor);
	}

	atData.autoHeirlooms.finalToxicity = poisonStack;

	if (health !== 0) {
		estimatedMaxDifficulty(health);
	} else if (damageTaken === 0) {
		estimatedMaxDifficulty(0);
	}

	// turn new damage into old damage;
	return damageTaken;
}

function getMaxEnemyHP() {
	let lowerBound = 0;
	let testHP = imAnEnemy();
	while (testHP < damageByHealth(testHP)) {
		lowerBound = testHP;
		testHP *= 10;
	}

	let upperBound = testHP;
	while ((upperBound - lowerBound) / lowerBound > 0.0001 && upperBound > lowerBound + 1) {
		const midPoint = lowerBound + (upperBound - lowerBound) / 2;
		const newDamage = damageByHealth(midPoint);
		if (newDamage > midPoint) {
			lowerBound = midPoint;
		} else {
			upperBound = midPoint;
		}
	}

	return Math.floor(lowerBound);
}

function damageByHealth(hp, tally = false) {
	let damageDealt = 0;
	// chilled by Frost Trap
	let chilledFor = 0;
	// frozen by knowledge
	let frozenFor = 0;
	// current Poison Stack you have, will take damage at end of turn
	let poisonStack = 0;
	let shockedFor = 0;
	let addDamage = 0;
	let addStack = 0;

	let slowsOnKill = 0;
	let deadEnemy = false;

	let toxy;
	let condensed;

	for (let p = 0; p < playerSpire.layout.length; p++) {
		if (!tally) {
			atData.autoHeirlooms.detailed[p].killCount = 0;
		}
		if (chilledFor > 0 && frozenFor === 0) {
			chilledFor -= 1;
		}
		if (frozenFor > 0 && chilledFor === 0) {
			frozenFor -= 1;
		}

		switch (atData.autoHeirlooms.detailed[p].type) {
			case 'Fire':
				addDamage = calcFire(p, shockedFor);
				break;
			case 'Frost':
				addDamage = calcFrost(p);
				chilledFor = traps.frost.slow;
				if (atData.autoHeirlooms.detailed[p].shocked) chilledFor = traps.frost.slow * traps.lightning.effect;
				if (atData.autoHeirlooms.detailed[p].frozen) {
					frozenFor = 0;
				}
				break;
			case 'Poison':
				toxy = calcPoison(p, shockedFor, hp, damageDealt);
				addStack = toxy.stack;
				addDamage = toxy.damage;
				break;
			case 'Lightning':
				shockedFor = traps.lightning.length;
				addDamage = calcLightning(p);
				break;
			case 'Strength':
				addDamage = calcStrength(p, shockedFor);
				break;
			case 'Condenser':
				condensed = calcCondenser(p, shockedFor);
				addDamage += poisonStack * condensed.damageFactor;
				poisonStack *= condensed.poisonMult;
				break;
			case 'Knowledge':
				if (atData.autoHeirlooms.detailed[p].chilled) {
					chilledFor = 0;
					frozenFor = traps.knowledge.slow;
					if (atData.autoHeirlooms.detailed[p].shocked) frozenFor *= traps.lightning.effect;
				}
				break;
		}

		if (hp !== 0 && atData.autoHeirlooms.detailed[p].type === 'Fire' && traps.fire.level >= 4 && damageDealt + addDamage > hp * 0.8) {
			addDamage += hp * 0.2;
		} else if (atData.autoHeirlooms.detailed[p].type !== 'Condenser') {
			/* condenser poison stack damage is complicated and is handled in the case statement above */
			addDamage += poisonStack * multipleDamage(atData.autoHeirlooms.detailed[p], 'poisonDamage');
		}

		shockedFor -= subtractShocks(p, shockedFor);

		// turn new stacks into old stacks
		poisonStack += addStack;
		addStack = 0;

		// damage
		damageDealt += addDamage;
		addDamage = 0;

		if (tally) {
			if (hp > damageDealt) {
				if (atData.autoHeirlooms.detailed[p].type !== 'Frost') {
					if (atData.autoHeirlooms.detailed[p].chilled && atData.autoHeirlooms.detailed[p].type !== 'Knowledge') {
						slowsOnKill++;
					} else if (atData.autoHeirlooms.detailed[p].frozen) {
						slowsOnKill += 2;
					}
				}
			} else if (!deadEnemy) {
				deadEnemy = true;
				atData.autoHeirlooms.detailed[p].killCount++;
			}
		}
	}

	return damageDealt;
}

function calcFire(c, shocked) {
	const thisFireDamage = traps.fire.damage * traps.fire.coreMult * lightColMult(c);
	let thisAddDamage = thisFireDamage;

	if (atData.autoHeirlooms.detailed[c].shocked) {
		thisAddDamage = thisFireDamage * traps.lightning.damageBuff * traps.lightning.coreMult;
	}

	if (atData.autoHeirlooms.detailed[c].chilled || atData.autoHeirlooms.detailed[c].frozen) {
		thisAddDamage += thisFireDamage * getLightningMultiplier(shocked, 1);
	}

	if (atData.autoHeirlooms.detailed[c].frozen) {
		thisAddDamage += thisFireDamage * getLightningMultiplier(shocked, 2);
	}

	if (atData.autoHeirlooms.strengthLocations[atData.autoHeirlooms.detailed[c].row]) {
		thisAddDamage *= traps.strength.effect * traps.strength.coreMult;
	}

	if (atData.autoHeirlooms.detailed[c].chilled && traps.frost.level >= 3) {
		thisAddDamage *= traps.frost.fireIncrease;
	}

	return thisAddDamage;
}

function calcFrost(c) {
	if (atData.autoHeirlooms.detailed[c].shocked) {
		return traps.frost.damage * traps.lightning.damageBuff * traps.lightning.coreMult;
	}

	return traps.frost.damage;
}

function calcPoison(c, shocked, hp, dmg) {
	const output = {};
	const lastCell = c === playerSpire.layout.length - 1;
	let baseStack = traps.poison.defaultStack * lightColMult(c) * traps.poison.coreMult;

	if (traps.poison.level >= 3) {
		if (c > 0) {
			if (atData.autoHeirlooms.detailed[c - 1].type === 'Poison') {
				baseStack *= 3;
			}
		}

		if (!lastCell) {
			if (atData.autoHeirlooms.detailed[c + 1].type === 'Poison') {
				baseStack *= 3;
			}
		}

		if (hp !== 0 && traps.poison.level >= 5 && dmg > 0.25 * hp) {
			baseStack *= 5;
		}
	}

	if (!lastCell) {
		if (traps.frost.level >= 4 && atData.autoHeirlooms.detailed[c + 1].type === 'Frost') {
			baseStack *= 4;
		}
	}

	output.stack = baseStack;
	if (atData.autoHeirlooms.detailed[c].shocked) {
		output.stack *= traps.lightning.damageBuff * traps.lightning.coreMult;
	}

	output.damage = output.stack;
	if (atData.autoHeirlooms.detailed[c].chilled || atData.autoHeirlooms.detailed[c].frozen) {
		output.stack += baseStack * getLightningMultiplier(shocked, 1);
		output.damage += output.stack;
	}

	if (atData.autoHeirlooms.detailed[c].frozen) {
		output.stack += baseStack * getLightningMultiplier(shocked, 2);
		output.damage += output.stack;
	}

	return output;
}

function calcLightning(c) {
	const baseDamage = traps.lightning.damage * traps.lightning.coreMult;
	const shockMult = traps.lightning.damageBuff * traps.lightning.coreMult;
	let thisAddDamage = baseDamage;
	if (atData.autoHeirlooms.detailed[c].shocked) {
		thisAddDamage *= shockMult;
	}

	if (atData.autoHeirlooms.detailed[c].chilled || atData.autoHeirlooms.detailed[c].frozen) {
		thisAddDamage += baseDamage * shockMult;
	}

	if (atData.autoHeirlooms.detailed[c].frozen) {
		thisAddDamage += baseDamage * shockMult;
	}

	return thisAddDamage;
}

function calcStrength(c, shocked) {
	const strengthDamage = getStrengthDamage(atData.autoHeirlooms.detailed[c]);
	let thisAddDamage = strengthDamage;
	if (atData.autoHeirlooms.detailed[c].shocked) {
		thisAddDamage = strengthDamage * traps.lightning.damageBuff * traps.lightning.coreMult;
	}
	if (atData.autoHeirlooms.detailed[c].chilled || atData.autoHeirlooms.detailed[c].frozen) {
		thisAddDamage += strengthDamage * getLightningMultiplier(shocked, 1);
	}
	if (atData.autoHeirlooms.detailed[c].frozen) {
		thisAddDamage += strengthDamage * getLightningMultiplier(shocked, 2);
	}

	return thisAddDamage;
}

function calcCondenser(c, shocked) {
	const output = {};
	const thisBaseEffect = traps.condenser.effect * traps.condenser.coreMult;
	output.poisonMult = 1;

	if (atData.autoHeirlooms.detailed[c].shocked) {
		output.poisonMult *= traps.lightning.effect * thisBaseEffect + 1;
	} else {
		output.poisonMult *= thisBaseEffect + 1;
	}

	output.damageFactor = output.poisonMult;
	if (atData.autoHeirlooms.detailed[c].chilled || atData.autoHeirlooms.detailed[c].frozen) {
		output.poisonMult *= thisBaseEffect * getLightningMultiplier(shocked, 1, 'condenser') + 1;
		output.damageFactor += output.poisonMult;
	}

	if (atData.autoHeirlooms.detailed[c].frozen) {
		output.poisonMult *= thisBaseEffect * getLightningMultiplier(shocked, 2, 'condenser') + 1;
		output.damageFactor += output.poisonMult;
	}

	return output;
}

function subtractShocks(c, shocked) {
	let adjust = shocked < 0 ? shocked : 0;
	if (shocked > 0 && atData.autoHeirlooms.detailed[c].type !== 'Lightning') {
		if (atData.autoHeirlooms.detailed[c].type !== 'Frost') {
			if (atData.autoHeirlooms.detailed[c].chilled && atData.autoHeirlooms.detailed[c].type !== 'Knowledge') {
				adjust = 2;
			} else if (atData.autoHeirlooms.detailed[c].frozen) {
				adjust = 3;
			} else {
				adjust = 1;
			}
		} else {
			adjust = 1;
		}
	}

	return adjust;
}

function multipleDamage(index, type) {
	let returnN = 0;
	if (index.type !== 'Frost') {
		if (index.frozen) {
			returnN += traps.knowledge.effect;
		} else if (index.chilled && index.type !== 'Knowledge') {
			returnN += traps.frost.effect;
		}
	}

	if (index.shocked && type !== 'poisonDamage') {
		returnN += traps.lightning.effect;
	}

	if (returnN === 0) {
		returnN = 1;
	}

	return returnN;
}

function getStrengthDamage(data) {
	const rowStart = data.row * 5;
	let returnDamage = traps.fire.damage * traps.fire.coreMult * traps.strength.effect * traps.strength.coreMult;
	let amountOfFire = 0;
	for (let x = rowStart; x < rowStart + 5; x++) {
		if (playerSpire.layout[x].trap.name === 'Fire') {
			amountOfFire += lightColMult(x);
		}
	}
	if (data.chilled && traps.frost.level >= 3) returnDamage *= traps.frost.fireIncrease;
	return returnDamage * amountOfFire;
}

// developed with trial and error and curve fitting
// Maximum known error of ~15% (e.g. 29.6% vs 25.8% around 2,300 damage)
function escapePercent(damage) {
	let est = 0;
	if (damage < 1460) {
		est = 1 / 3;
	} else if (damage < 6880) {
		est = 0.96 - 0.086 * Math.log(damage);
	} else if (damage < 10000) {
		est = 0.2;
	} else {
		est = 1 / (Math.log(damage * 10) / Math.log(10));
	}
	return est;
}

function getHealthWith(difficulty, killPct) {
	const scaledMod = Math.pow(1.012, difficulty);
	let health = 10 + difficulty * 4 + scaledMod;
	let difPct = 0.00053 * difficulty;
	if (difPct > 0.85) difPct = 0.85;
	if (difPct < 0.15) difPct = 0.15;
	// the (2/3) here an estimate for Math.random()
	health = health * (1 - difPct) + killPct * difPct * health;
	return Math.floor(health);
}

function estimatedMaxDifficulty(maxHealth) {
	const damage = maxHealth;
	const killPct = 1 - escapePercent(maxHealth);
	let difficulty = 1;
	let min = 1;
	let max = 5000;

	while (true) {
		if (damage === 0 || damage === null || damage === undefined) {
			break;
		}

		check = (max + min) / 2;
		const health = getHealthWith(check, killPct);

		if (damage > health) {
			min = check;
		} else {
			max = check;
		}

		if ((health <= damage && damage - health <= 1) || max - min <= 1) {
			difficulty = check;
			break;
		}
	}

	let avgReward = 0;
	const steps = 1000;
	for (let h = 0; h < steps; h++) {
		if (h / steps < killPct) {
			avgReward += getRsReward(getHealthWith(difficulty, h / steps), difficulty);
		} else if (traps.poison.level >= 6) {
			/* poison leaking bonus for escaped enemies */
			avgReward += atData.autoHeirlooms.finalToxicity * 0.1;
		}
	}

	avgReward /= steps;
	avgReward *= traps.runestones.coreMult;

	return { difficulty, runestones: avgReward };
}

function getRsReward(health, threat) {
	let reward = Math.ceil(health / 600);
	reward += threat / 20;
	reward *= Math.pow(1.00116, threat);
	if (atData.autoHeirlooms.detailed[playerSpire.layout.length - 1].type === 'Fire' && traps.fire.level >= 7) {
		if (traps.fire.level >= 9) reward *= 1.5;
		else reward *= 1.2;
	}
	if (traps.frost.level >= 5) reward *= 1 + (atData.autoHeirlooms.ticks - playerSpire.layout.length) * traps.frost.runestones[traps.frost.level];
	return reward;
}

function getRows(difficulty) {
	const maxRows = Math.min(Math.floor(difficulty / 100), 20);
	return maxRows;
}

function updateTrapDamage(type, level, noEnemy) {
	const upgradeableTraps = ['fire', 'frost', 'poison', 'lightning'];
	if (!upgradeableTraps.includes(type)) return;
	traps[type].level = level;
	if (type === 'fire') {
		traps.fire.damage = traps.fire.dmgs[level];
	}
	if (type === 'frost') {
		traps.frost.damage = traps.frost.dmgs[level];
		traps.frost.slow = traps.frost.slows[level];
	}
	if (type === 'poison') {
		traps.poison.defaultStack = traps.poison.stacks[level];
	}
	if (type === 'lightning') {
		traps.lightning.damage = traps.lightning.dmgs[level];
		traps.lightning.damageBuff = traps.lightning.dmgbuffs[level];
		traps.lightning.length = traps.lightning.lengths[level];
	}
	if (noEnemy !== true) {
		runInformation();
	}
}

function getLightningMultiplier(length, times, type) {
	if (length - times === 0 || length - times < 0) {
		return 1;
	}

	if (length - times >= 1) {
		if (type === 'condenser') {
			return traps.lightning.effect;
		}
		return traps.lightning.damageBuff * traps.lightning.coreMult;
	}

	return 1;
}

function lightColMult(cell) {
	return traps.lightning.level >= 4 ? 1 + (traps.lightning.level >= 7 ? 0.2 : 0.1) * atData.autoHeirlooms.lightColStacks[cell % 5] * traps.lightning.coreMult : 1;
}

// Lists name of all mods and their step amounts, soft caps, and hard caps.
function heirloomInfo(type) {
	if (type === 'Shield')
		return {
			playerEfficiency: {
				name: 'Player Efficiency',
				type: 'Shield',
				weighable: false,
				stepAmounts: [1, 1, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 0],
				softCaps: [16, 16, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 0]
			},
			trainerEfficiency: {
				name: 'Trainer Efficiency',
				type: 'Shield',
				weighable: false,
				stepAmounts: [1, 1, 1, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0],
				softCaps: [20, 20, 20, 40, 60, 80, 100, 120, 140, 0, 0, 0, 0]
			},
			storageSize: {
				name: 'Storage Size',
				type: 'Shield',
				weighable: false,
				stepAmounts: [4, 4, 4, 4, 8, 16, 16, 16, 16, 0, 0, 0, 0],
				softCaps: [64, 64, 64, 128, 256, 512, 768, 1024, 1280, 0, 0, 0, 0]
			},
			breedSpeed: {
				name: 'Breed Speed',
				type: 'Shield',
				get weighable() {
					return game.global.universe !== 3;
				},
				stepAmounts: [1, 1, 1, 1, 3, 3, 3, 3, 3, 5, 10, 10, 15],
				softCaps: [10, 10, 10, 20, 100, 130, 160, 190, 220, 280, 360, 400, 550]
			},
			trimpHealth: {
				name: 'Trimp Health',
				type: 'Shield',
				weighable: true,
				stepAmounts: [2, 2, 2, 2, 5, 5, 5, 6, 8, 10, 10, 20, 25],
				softCaps: [20, 20, 20, 40, 100, 150, 200, 260, 356, 460, 750, 1100, 1600]
			},
			trimpAttack: {
				name: 'Trimp Attack',
				type: 'Shield',
				weighable: true,
				stepAmounts: [2, 2, 2, 2, 5, 5, 5, 6, 8, 10, 10, 20, 25],
				softCaps: [20, 20, 20, 40, 100, 150, 200, 260, 356, 460, 750, 1100, 1600]
			},
			trimpBlock: {
				name: 'Trimp Block',
				type: 'Shield',
				weighable: false,
				stepAmounts: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
				softCaps: [7, 7, 7, 10, 40, 60, 80, 100, 120, 0, 0, 0, 0]
			},
			critDamage: {
				name: 'Crit Damage',
				type: 'Shield',
				weighable: true,
				stepAmounts: [5, 5, 5, 5, 10, 10, 10, 10, 15, 20, 25, 50, 75],
				softCaps: [60, 60, 60, 100, 200, 300, 400, 500, 650, 850, 1100, 1700, 2450]
			},
			critChance: {
				name: 'Crit Chance',
				type: 'Shield',
				weighable: true,
				stepAmounts: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3, 0.5, 0.5, 0.25, 0.3, 0.4],
				softCaps: [2.6, 2.6, 2.6, 5, 7.4, 9.8, 12.2, 15.9, 30, 50, 80, 95, 115],
				hardCaps: [30, 30, 30, 30, 30, 30, 30, 30, 100, 125, 200, 260, 335],
				heirloopy: true
			},
			voidMaps: {
				name: 'Void Map Drop Chance',
				type: 'Shield',
				weighable: true,
				stepAmounts: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.25, 0.25, 0.1, 0.1, 0.1],
				softCaps: [7, 7, 7, 11, 16, 22, 30, 38, 50, 60, 7, 12, 17],
				hardCaps: [50, 50, 50, 50, 50, 50, 50, 50, 80, 99, 40, 50, 60],
				heirloopy: true
			},
			plaguebringer: {
				name: 'Plaguebringer',
				type: 'Shield',
				weighable: true,
				stepAmounts: [0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5, 0.5],
				softCaps: [0, 0, 0, 0, 0, 0, 0, 0, 15, 30, 45, 50, 55],
				hardCaps: [0, 0, 0, 0, 0, 0, 0, 0, 75, 100, 125, 150, 175],
				heirloopy: true
			},
			prismatic: {
				name: 'Prismatic Shield',
				type: 'Shield',
				get weighable() {
					return game.global.universe === 2;
				},
				noScaleU2: true,
				stepAmounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2],
				softCaps: [0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 40, 60, 90],
				hardCaps: [0, 0, 0, 0, 0, 0, 0, 0, 0, 250, 500, 750, 1000],
				immutable: true
			},
			gammaBurst: {
				name: 'Gamma Burst',
				type: 'Shield',
				weighable: true,
				stepAmounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0],
				softCaps: [0, 0, 0, 0, 0, 0, 0, 0, 0, 2000, 0, 0, 0]
			},
			inequality: {
				name: 'Inequality',
				type: 'Shield',
				get weighable() {
					return game.global.universe === 2;
				},
				stepAmounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.25, 0.3],
				softCaps: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 300],
				hardCaps: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 400, 600]
			},
			doubleCrit: {
				name: 'Double Crit',
				type: 'Shield',
				weighable: true,
				noScaleU2: true,
				stepAmounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.02],
				softCaps: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.3],
				hardCaps: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25],
				immutable: true
			}
		};
	else if (type === 'Staff')
		return {
			DragimpSpeed: {
				name: 'Dragimp Efficiency',
				type: 'Staff',
				weighable: true,
				stepAmounts: [1, 1, 1, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
				softCaps: [6, 6, 6, 12, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240]
			},
			ExplorerSpeed: {
				name: 'Explorer Efficiency',
				type: 'Staff',
				weighable: true,
				stepAmounts: [1, 1, 1, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
				softCaps: [6, 6, 6, 12, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240]
			},
			FarmerSpeed: {
				name: 'Farmer Efficiency',
				type: 'Staff',
				weighable: true,
				stepAmounts: [1, 1, 1, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
				softCaps: [6, 6, 6, 12, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240]
			},
			LumberjackSpeed: {
				name: 'Lumberjack Efficiency',
				type: 'Staff',
				weighable: true,
				stepAmounts: [1, 1, 1, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
				softCaps: [6, 6, 6, 12, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240]
			},
			MinerSpeed: {
				name: 'Miner Efficiency',
				type: 'Staff',
				weighable: true,
				stepAmounts: [1, 1, 1, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
				softCaps: [6, 6, 6, 12, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240]
			},
			ScientistSpeed: {
				name: 'Scientist Efficiency',
				type: 'Staff',
				weighable: true,
				stepAmounts: [1, 1, 1, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
				softCaps: [6, 6, 6, 12, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240]
			},
			allMetal: {
				name: 'Metal Drop and Efficiency',
				type: 'Staff',
				weighable: true,
				stepAmounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 512],
				softCaps: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10240]
			},
			allFood: {
				name: 'Food Drop and Efficiency',
				type: 'Staff',
				weighable: true,
				stepAmounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 512],
				softCaps: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10240]
			},
			allWood: {
				name: 'Wood Drop and Efficiency',
				type: 'Staff',
				weighable: true,
				stepAmounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 512],
				softCaps: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10240]
			},
			foodDrop: {
				name: 'Food Drop Rate',
				type: 'Staff',
				weighable: false,
				stepAmounts: [1, 1, 1, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
				softCaps: [6, 6, 6, 12, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240]
			},
			fragmentsDrop: {
				name: 'Fragment Drop Rate',
				type: 'Staff',
				weighable: false,
				stepAmounts: [1, 1, 1, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
				softCaps: [6, 6, 6, 12, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240]
			},
			gemsDrop: {
				name: 'Gem Drop Rate',
				type: 'Staff',
				weighable: false,
				stepAmounts: [1, 1, 1, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
				softCaps: [6, 6, 6, 12, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240]
			},
			metalDrop: {
				name: 'Metal Drop Rate',
				type: 'Staff',
				weighable: false,
				stepAmounts: [1, 1, 1, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
				softCaps: [6, 6, 6, 12, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240]
			},
			woodDrop: {
				name: 'Wood Drop Rate',
				type: 'Staff',
				weighable: false,
				stepAmounts: [1, 1, 1, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
				softCaps: [6, 6, 6, 12, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240]
			},
			FluffyExp: {
				name: 'Pet Exp',
				type: 'Staff',
				weighable: true,
				stepAmounts: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1.2, 1.5],
				softCaps: [0, 0, 0, 0, 0, 0, 0, 0, 50, 100, 200, 400, 600],
				heirloopy: true
			},
			ParityPower: {
				name: 'Parity Power',
				type: 'Staff',
				weighable: true,
				stepAmounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 15],
				softCaps: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 700]
			},
			SeedDrop: {
				name: 'Seed Drop Rate',
				type: 'Staff',
				get weighable() {
					return game.global.universe === 2;
				},
				stepAmounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
				softCaps: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2000]
			}
		};
	else if (type === 'Core')
		return {
			fireTrap: {
				name: 'Fire Trap Damage',
				type: 'Core',
				weighable: true,
				stepAmounts: [1, 1, 1, 1, 2, 3, 4],
				softCaps: [25, 25, 25, 50, 100, 199, 400],
				immutable: true
			},
			poisonTrap: {
				name: 'Poison Trap Damage',
				type: 'Core',
				weighable: true,
				stepAmounts: [1, 1, 1, 1, 2, 3, 4],
				softCaps: [25, 25, 25, 50, 100, 199, 400],
				immutable: true
			},
			lightningTrap: {
				name: 'Lightning Trap Power',
				type: 'Core',
				weighable: true,
				stepAmounts: [0, 0, 1, 1, 2, 2, 3],
				softCaps: [0, 0, 10, 20, 50, 100, 199],
				immutable: true
			},
			strengthEffect: {
				name: 'Strength Tower Effect',
				type: 'Core',
				weighable: true,
				stepAmounts: [1, 1, 1, 1, 2, 2, 3],
				softCaps: [10, 10, 10, 20, 50, 100, 199],
				immutable: true
			},
			condenserEffect: {
				name: 'Condenser Effect',
				type: 'Core',
				weighable: true,
				stepAmounts: [0, 0.25, 0.25, 0.25, 0.5, 0.5, 0.5],
				softCaps: [0, 5, 5, 10, 15, 20, 30],
				hardCaps: [0, 10, 10, 15, 25, 35, 50],
				immutable: true
			},
			runestones: {
				name: 'Runestone Drop Rate',
				type: 'Core',
				weighable: true,
				stepAmounts: [1, 1, 1, 1, 2, 3, 4],
				softCaps: [25, 25, 25, 50, 100, 199, 400],
				immutable: true
			},
			empty: {
				name: 'Empty',
				weighable: false
			}
		};
}

const traps = {
	fire: {
		locked: false,
		damage: 50,
		level: 1,
		maxLevel: 10,
		dmgs: [0, 50, 500, 2500, 5e3, 10e3, 10e4, 10e5, 10e7, 10e9, 10e11],
		coreMult: 1
	},
	frost: {
		locked: false,
		damage: 10,
		slow: 3,
		effect: 2,
		level: 1,
		maxLevel: 8,
		fireIncrease: 1.25,
		dmgs: [0, 10, 50, 500, 2500, 5000, 25000, 50000, 10000],
		slows: [0, 3, 4, 4, 4, 4, 5, 5, 5],
		runestones: [0, 0, 0, 0, 0, 0.02, 0.02, 0.04, 0.06]
	},
	poison: {
		locked: true,
		defaultStack: 5,
		level: 1,
		maxLevel: 9,
		stacks: [0, 5, 10, 10, 20, 40, 80, 160, 480, 1920],
		coreMult: 1
	},
	lightning: {
		locked: true,
		damage: 50,
		effect: 2,
		length: 1,
		damageBuff: 2,
		level: 1,
		maxLevel: 7,
		dmgs: [0, 50, 500, 5000, 5000, 5e4, 5e5, 5e5],
		dmgbuffs: [0, 2, 2, 4, 4, 4, 8, 8],
		lengths: [0, 1, 2, 2, 2, 3, 3, 3],
		coreMult: 1
	},
	strength: {
		locked: true,
		effect: 2,
		level: 1,
		maxLevel: 1,
		coreMult: 1
	},
	condenser: {
		locked: true,
		effect: 0.25,
		level: 1,
		maxLevel: 1,
		coreMult: 1
	},
	knowledge: {
		locked: true,
		slow: 5,
		effect: 3,
		level: 1,
		maxLevel: 1
	},
	runestones: {
		coreMult: 1
	}
};

/* on selecting an heirloom load */
if (typeof originalSelectHeirloom !== 'function') {
	var originalSelectHeirloom = selectHeirloom;
	selectHeirloom = function (...args) {
		originalSelectHeirloom(...args);
		if (!heirloomsShown) return;

		try {
			loadHeirloomSettings();
			calculate();
			updateHeirloomBtnWidths();
		} catch (e) {
			console.log('Heirloom issue:', e, 'other');
		}
	};
}

/* on selecting an heirloom mod load */
if (typeof originalselectMod !== 'function') {
	var originalselectMod = selectMod;
	selectMod = function () {
		originalselectMod(...arguments);
		try {
			calculate();
		} catch (e) {
			console.log('Heirloom issue: ' + e, 'other');
		}
	};
}

/* when unselecting any heirlooms hide ratios */
if (typeof originalpopulateHeirloomWindow !== 'function') {
	var originalpopulateHeirloomWindow = populateHeirloomWindow;
	populateHeirloomWindow = function () {
		originalpopulateHeirloomWindow(...arguments);
		try {
			if (elementExists('heirloomRatios')) document.getElementById('heirloomRatios').style.display = 'none';
		} catch (e) {
			console.log('Heirloom issue: ' + e, 'other');
		}
	};
}

/* on changing an heirloom icon load */
if (typeof saveHeirloomIconHeirloomCalc !== 'function') {
	var saveHeirloomIconHeirloomCalc = saveHeirloomIcon;
	saveHeirloomIcon = function (...args) {
		saveHeirloomIconHeirloomCalc(...args);
		if (!heirloomsShown) return;

		try {
			const [number, location] = game.global.selectedHeirloom;
			selectHeirloom(number, location);
		} catch (e) {
			console.log('Heirloom issue:', e, 'other');
		}
	};
}

setupHeirloomUI();

/* If using standalone version then inform user it has loaded. */
if (typeof autoTrimpSettings === 'undefined' || (typeof autoTrimpSettings !== 'undefined' && typeof autoTrimpSettings.ATversion !== 'undefined' && !autoTrimpSettings.ATversion.includes('SadAugust'))) {
	let basepathFarmCalc = 'https://sadaugust.github.io/AutoTrimps/';
	if (typeof localVersion !== 'undefined') basepathFarmCalc = 'https://localhost:8887/AutoTrimps_Local/';

	const linkStylesheet = document.createElement('link');
	linkStylesheet.rel = 'stylesheet';
	linkStylesheet.type = 'text/css';
	linkStylesheet.href = `${basepathFarmCalc}css/heirloomCalc.css?${Date.now()}`;
	document.head.appendChild(linkStylesheet);

	console.log('The Heirloom Calculator mod has finished loading.');
	message('The Heirloom Calculator mod has finished loading.', 'Loot');
}
