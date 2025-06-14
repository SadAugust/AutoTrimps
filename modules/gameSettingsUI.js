/* auto structure */
function autoStructureDisplay(elem) {
	let tooltipText;

	const hze = game.global.universe === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();
	const baseText = `<p>Here you can choose which structures will be automatically purchased when Auto Structure is toggled on. Click on a buildings name to enable the automatic purchasing of that structure, the <b>Percent</b> input specifies the cost-to-resource % that the structure should be purchased below, and set the <b>Up To</b> box to the maximum number of that structure you'd like purchased <b>(0 for no limit)</b>.<br>

	For example, setting the <b>Percent</b> input to 10 and the <b>Up To</b> input to 50 for <b>House</b> will cause a House to be automatically purchased whenever the costs of the next house are less than 10% of your food, wood, and metal, as long as you have less than 50 houses.</p>`;
	const nursery = "<p><b>Nursery:</b> Acts the same as the other settings but also has a 'From' input which will cause nurseries to only be built from that zone onwards. Spire nursery settings within AT will ignore this start zone if needed for them to work. If 'Advanced Nurseries' is enabled and 'Up To' is set to 0 it will override buying max available and instead respect the input.</p>";
	const warpstation = '<p><b>Warpstation:</b> Settings for this type of building can be found in the AutoTrimp settings building tab!</p>';
	const safeGateway = '<p><b>Safe Gateway:</b> Reduces spending on Gateways to 0.1% when the cost of a perfect LMC (+<b>Map Level</b>) map multiplied by your <b>Map Count</b> input exceeds your current fragments, up to the zone specified in <b>Till Z</b>. If <b>Till Z</b> is 0, it assumes z999.</p>';
	const settingOnPortal = "<p><b>Setting On Portal:</b> Will either automatically toggle this setting on, off, or won't change its current state when you portal.</p>";

	tooltipText = "<p>Welcome to AT's Auto Structure Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp(); _verticalCenterTooltip(false, true);'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'>";
	tooltipText += `${baseText}`;
	if (game.global.universe === 1 && hze >= 230) tooltipText += `${nursery}`;
	if (game.global.universe === 1 && hze >= 60) tooltipText += `${warpstation}`;
	if (game.global.universe === 2) tooltipText += `${safeGateway}`;
	tooltipText += `${settingOnPortal}`;
	tooltipText += `</div>`;
	const settingGroup = getPageSetting('buildingSettingsArray');
	tooltipText += _autoStructureTable(settingGroup, hze);

	const costText = `
		<div class='maxCenter'>
			<div id='confirmTooltipBtn' class='btn btn-success btn-md' onclick='_autoStructureSave()'>Save and Close</div>
			<div class='btn btn-danger btn-md' onclick='cancelTooltip()'>Cancel</div>
			<div class='btn btn-primary btn-md' onclick='_autoStructureSave(); importExportTooltip("AutoStructure")'>Save</div>
			<div class='btn btn-warning btn-md' style='float: right;' onclick='tooltipAT("Auto Structure Reset", event, undefined);'>Reset To Default</div>
		</div>`;

	const ondisplay = () => {
		_verticalCenterTooltip(false, true);
		_setSelect2Dropdowns();
	};

	return [elem, tooltipText, costText, ondisplay];
}

function _autoStructureTable(settingGroup, hze) {
	let tooltipText = `<div id='autoStructure'>`;
	tooltipText += `<span class='messageConfigContainer' style='font-size: 1.3vw;'>&nbsp;Buildings</span><br>`;
	const elemWidth = 'calc((100% - 1.4em - 2px) / 5.1)';

	let rowData = '';
	let rows = 0;
	let total = 0;

	for (let item in game.buildings) {
		const building = game.buildings[item];
		if (building[`blockU${game.global.universe}`]) continue;
		if (item === 'Warpstation') continue;
		if (item === 'Laboratory' && hze < 130) continue;
		if (item === 'Antenna' && game.buildings[item].locked) continue;
		if (!building.AP && item !== 'Antenna') continue;

		if ((total > 0 && total % 2 === 0) || item === 'Nursery') {
			tooltipText += `<div id='row${rows}' style= 'display: flex;'>${rowData}</div>`;
			rowData = '';
			rows++;
		}

		const setting = settingGroup[item] !== 'undefined' ? settingGroup[item] : (setting = item = { enabled: false, percent: 100, buyMax: 0 });
		const equipClass = setting && setting.enabled ? 'Equipped' : 'NotEquipped';

		rowData += `
			<div id='${item}Btn' class='btnItem btnItem${equipClass}' style='height: 1.5vw; max-width: ${elemWidth}; min-width: ${elemWidth}; margin-right: 0.1em; margin-left: 0.1em; margin-top: 0.1em; margin-bottom: 0.2em;' onclick='_hideAutomationToggleElem(this)' data-hidden-text="${item}">
				<span>${item}</span>
			</div>&nbsp;`;

		rowData += `
		<div id ='${item}PercentDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
			<span id='${item}TextBox' class='textbox' style='text-align: left; height: 1.5vw; max-width: 9vw; min-width: 9vw; font-size: 0.7vw; margin-right: 0.4em;' onclick='document.getElementById("${item}Percent").focus()'>Percent:
			<input id='${item}Percent' type='number' step='1' value='${setting && setting.percent ? setting.percent : 0}' min='0' max='100' placeholder='0' style='color: white;' onfocus='this.select()'>
			</span>
		</div>`;

		rowData += `
		<div id ='${item}BuyMaxDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
			<span id='${item}TextBox' class='textbox' style='text-align: left; height: 1.5vw; max-width: 9vw; min-width: 9vw; font-size: 0.7vw; margin-right: ${item === 'Nursery' ? '0.4em' : '1.61vw;'}' onclick='document.getElementById("${item}BuyMax").focus()'>Up to:
			<input id='${item}BuyMax' type='number' step='1' value='${setting && setting.buyMax ? setting.buyMax : 0}' min='0' max='9999' placeholder='0' style='color: white;' onfocus='this.select()'>
			</span>
		</div>`;

		if (item === 'Nursery' && hze >= 230) {
			rowData += `
			<div id ='${item}FromZDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
				<span id='${item}TextBox' class='textbox' style='text-align: left; height: 1.5vw; max-width: 9vw; min-width: 9vw; font-size: 0.7vw; margin-right: 1.61vw;' onclick='document.getElementById("${item}FromZ").focus()'>From Z:
				<input id='${item}FromZ' type='number' step='1' value='${setting && setting.fromZ ? setting.fromZ : 0}' min='0' max='9999' placeholder='0' style='color: white;' onfocus='this.select()'>
				</span>
			</div>`;
		}

		total++;
	}

	tooltipText += `<div id='row${rows + 1}' style= 'display: flex;'>${rowData}</div>`;
	tooltipText += `</div>`;

	tooltipText += `<div id='autoStructureMisc'>`;
	tooltipText += `<span class='messageConfigContainer' style='font-size: 1.3vw;'>&nbsp;</span><br>`;
	rows = 0;
	rowData = '';

	if (game.global.universe === 2) {
		const setting = settingGroup.SafeGateway !== 'undefined' ? settingGroup.SafeGateway : (setting = item = { enabled: false, mapCount: 1, zone: 0, mapLevel: 0 });
		const equipClass = setting && setting.enabled ? 'Equipped' : 'NotEquipped';
		let item = 'SafeGateway';

		rowData += `
			<div id='${item}Btn' class='btnItem btnItem${equipClass}' style='height: 1.5vw; max-width: ${elemWidth}; min-width: ${elemWidth}; margin-right: 0.1em; margin-left: 0.1em; margin-top: 0.1em; margin-bottom: 0.2em;' onclick='_hideAutomationToggleElem(this)' data-hidden-text="${item}">
				<span>Safe Gateway</span>
			</div>&nbsp;`;

		rowData += `
		<div id ='${item}MapCountDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
			<span id='${item}TextBox' class='textbox' style='text-align: left; height: 1.5vw; max-width: 9vw; min-width: 9vw; font-size: 0.7vw; margin-right: 0.4em;' onclick='document.getElementById("${item}MapCount").focus()'>Map Count:
			<input id='${item}MapCount' type='number' step='1' value='${setting && setting.mapCount ? setting.mapCount : 0}' min='0' max='100' placeholder='0' style='color: white;' onfocus='this.select()'>
			</span>
		</div>`;

		rowData += `
		<div id ='${item}ZoneDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
			<span id='${item}TextBox' class='textbox' style='text-align: left; height: 1.5vw; max-width: 9vw; min-width: 9vw; font-size: 0.7vw; margin-right: 0.4em;' onclick='document.getElementById("${item}Zone").focus()'>Till Z:
			<input id='${item}Zone' type='number' step='1' value='${setting && setting.zone ? setting.zone : 0}' min='0' max='9999' placeholder='0' style='color: white;' onfocus='this.select()'>
			</span>
		</div>`;

		rowData += `
		<div id ='${item}MapLevelDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
			<select id='Map Level' class='select2 custom-style' style='color: white;'>
				<option value='0'>0</option>`;

		if (hze >= 50) {
			for (let i = 1; i <= 10; i++) {
				rowData += "<option value='" + i + "'" + (setting.mapLevel === i.toString() ? " selected='selected'" : '') + '>' + i + '</option>';
			}
		}

		rowData += '</select></span>';
		rowData += '</div>';

		tooltipText += `<div id='row${rows}' style= 'display: flex;'>${rowData}</div>`;
		rowData = '';
		rows++;
	}

	/* portal settings */
	const values = ['Off', 'On'];
	tooltipText += `
		<div id ='PortalSettingDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
			<select id='Setting On Portal' class='select2 custom-style' style='color: white;'>
				<option value='0'>No change</option>`;

	for (let x = 0; x < values.length; x++) {
		tooltipText += '<option' + (settingGroup.portalOption && settingGroup.portalOption === values[x].toLowerCase() ? " selected='selected'" : '') + " value='" + values[x].toLowerCase() + "'>" + values[x] + '</option>';
	}
	tooltipText += '</select></span>';
	tooltipText += '</div>';

	return tooltipText;
}

function _autoStructureSave() {
	const setting = {};
	const items = Array.from(document.getElementsByClassName('btnItem'));

	items.forEach((item) => {
		const name = item.dataset.hiddenText;
		setting[name] = setting[name] || {};
		setting[name].enabled = item.classList.contains('btnItemEquipped');

		if (game.global.universe === 2 && name.includes('SafeGateway')) {
			const valueElem = document.getElementById(name + 'MapCount');
			let value = parseInt(valueElem.value, 10);
			value = Number.isInteger(value) ? value : 0;
			if (value > 10000) value = 10000;
			value = isNumberBad(value) ? 3 : value;
			setting[name].mapCount = value;

			const zoneElem = document.getElementById(name + 'Zone');
			let zone = parseInt(zoneElem.value, 10);
			zone = Number.isInteger(zone) ? zone : 0;
			if (zone > 999) zone = 999;
			zone = isNumberBad(zone) ? 3 : zone;
			setting[name].zone = zone;

			setting[name].mapLevel = document.getElementById('SafeGatewayMapLevelDiv').children[0].value;
			return;
		}

		const percentElem = document.getElementById(name + 'Percent');
		let percent = parseInt(percentElem.value, 10);
		percent = isNumberBad(percent) ? 0 : Math.max(Math.min(percent, 100), 0);
		setting[name].percent = percent;

		const buyMaxElem = document.getElementById(name + 'BuyMax');
		let buyMax = parseInt(buyMaxElem.value, 10);
		buyMax = isNumberBad(buyMax) ? 0 : Math.max(Math.min(buyMax, 9999), 0);
		setting[name].buyMax = buyMax;

		if (name === 'Nursery') {
			if (game.stats.highestLevel.valueTotal() < 230) {
				setting[name].fromZ = 0;
			} else {
				const fromZElem = document.getElementById(name + 'FromZ');
				let fromZ = parseInt(fromZElem.value, 10);
				if (fromZ > 999) fromZ = 999;
				fromZ = isNumberBad(fromZ) ? 999 : fromZ;
				setting[name].fromZ = fromZ;
			}
		}
	});

	/* adding in buildings that are locked so that there won't be any issues later on */
	if (game.global.universe === 2) {
		if (!setting.Laboratory) {
			setting.Laboratory = {
				enabled: false,
				percent: 100,
				buyMax: 0
			};
		}
		if (!setting.Antenna) {
			setting.Antenna = {
				enabled: false,
				percent: 100,
				buyMax: 0
			};
		}
	}

	setting.portalOption = document.getElementById('PortalSettingDiv').children[0].value;

	setPageSetting('buildingSettingsArray', setting);
	cancelTooltip();
}

function _autoStructureReset() {
	const setting = {
		Hut: { enabled: true, percent: 80, buyMax: 200 },
		House: { enabled: true, percent: 80, buyMax: 200 },
		Mansion: { enabled: true, percent: 80, buyMax: 200 },
		Hotel: { enabled: true, percent: 80, buyMax: 200 },
		Wormhole: { enabled: false, percent: 1, buyMax: 1 },
		Resort: { enabled: true, percent: 80, buyMax: 200 },
		Gateway: { enabled: true, percent: 10, buyMax: 200 },
		Collector: { enabled: true, percent: 100, buyMax: 0 },
		Gym: { enabled: true, percent: 75, buyMax: 0 },
		Tribute: { enabled: true, percent: 20, buyMax: 0 },
		Nursery: { enabled: true, percent: 80, buyMax: 0, fromZ: 0 },
		Smithy: { enabled: true, percent: 100, buyMax: 0 },
		Laboratory: { enabled: false, percent: 80, buyMax: 0 },
		SafeGateway: { enabled: false, mapCount: 1, zone: 0, mapLevel: 0 }
	};

	setPageSetting('buildingSettingsArray', setting);
	cancelTooltip2();
	importExportTooltip('AutoStructure');
}

/* auto Jobs */
function autoJobsDisplay(elem) {
	const ratio = "<p>The ratio jobs are limited more by workspaces than resources. 1:1:1 will purchase all 3 of these ratio-based jobs evenly, and the ratio refers to the amount of workspaces you wish to dedicate to each job. Any number that's 0 or below will stop the script hiring any workers for that job. Scientists will be hired based on a ratio that is determined by how far you are into the game, the further you get, the less Scientists will be hired.</p>";
	const percent = "<p>The percent jobs are limited more by resources than workspaces. Set the percentage of resources that you'd like to be spent on each job.</p>";
	const magmamancer = "<p><b>Magmamancers:</b> These will only be hired when they'll do something! So once the time spent on the zone is enough to activate the first metal boost.</p>";
	const farmersUntil = '<p><b>Farmers Until:</b> Stops buying Farmers from this zone. Map setting job ratios override this setting.</p>';
	const lumberjackMP = '<p><b>No Lumberjacks After Melting Point:</b> Stops buying Lumberjacks after Melting Point has been run. The Smithy Farm setting will override this setting.</p>';

	let autoRatios = '<p><b>Auto Ratios</b> - Using ratios from top to bottom based on the following criteria:';
	autoRatios += '<br></b><b>4/5/0</b> - When running the <b>' + (portalUniverse === 2 ? 'Transmute' : 'Metal') + '</b> challenge.';

	if (game.global.universe === 1) {
		autoRatios += '<br><b>1/1/100</b> - When at or above z300 or running the <b>Eradicated</b> challenge.';
		autoRatios += '<br><b>1/7/12</b> - When at or above z230.';
		autoRatios += '<br><b>1/2/22</b> - When above 1500 tributes.';
		autoRatios += '<br><b>1/1/10</b> - When above 1000 tributes.';
	}

	if (game.global.universe === 2) {
		autoRatios += '<br><b>1/1/1</b> - When using a <b>Hazardous</b> or higher rarity heirloom.';
		autoRatios += '<br><b>1/2/4</b> - When above 1250 tributes.';
		autoRatios += '<br><b>2/1/4</b> - When at or above z110.';
	}

	autoRatios += `<br><b>3/1/4</b> - When above ${prettify(3e6)} trimps.`;
	autoRatios += `<br><b>3/3/5</b> - When above ${prettify(3e5)} trimps.`;
	autoRatios += `<br><b>1/1/2</b> - Used running a map until you reach ${prettify(3e6)} trimps.`;
	autoRatios += `<br><b>1/1/1</b> - Base ratio.`;
	autoRatios += '</p>';

	let tooltipText = "<p>Welcome to AT's Auto Job Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp(); _verticalCenterTooltip(false, true);'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'> ";
	tooltipText += `${ratio}`;
	tooltipText += `${percent}`;
	if (game.global.universe === 1 && game.stats.highestLevel.valueTotal() >= 230) tooltipText += `${magmamancer}`;
	if (game.global.universe === 2) tooltipText += `${farmersUntil}${lumberjackMP}`;
	tooltipText += `${autoRatios}`;

	const hze = game.global.universe === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();
	let percentJobs = ['Explorer'];
	if (game.global.universe === 1) {
		percentJobs.push('Trainer');
		if (hze >= 230) percentJobs.push('Magmamancer');
	}

	if (game.global.universe === 2) {
		if (hze >= 30) percentJobs.push('Meteorologist');
		if (hze >= 50) percentJobs.push('Worshipper');
	}

	const ratioJobs = ['Farmer', 'Lumberjack', 'Miner'];
	const settingGroup = getPageSetting('jobSettingsArray');
	tooltipText += `</div>`;
	tooltipText += _autoJobsTable(settingGroup, ratioJobs, percentJobs);

	const costText = `
		<div class='maxCenter'>
			<div id='confirmTooltipBtn' class='btn btn-success btn-md' onclick='_autoJobsSave()'>Save and Close</div>
			<div class='btn btn-danger btn-md' onclick='cancelTooltip()'>Cancel</div>
			<div class='btn btn-primary btn-md' onclick='_autoJobsSave(); importExportTooltip("AutoJobs")'>Save</div>
			<div class='btn btn-warning btn-md' style='float: right;' onclick='tooltipAT("Auto Jobs Reset", event, undefined);'>Reset To Default</div>
		</div>`;

	elem.style.left = '33.75%';
	elem.style.top = '25%';
	const ondisplay = () => {
		_verticalCenterTooltip(false, true);
		_setSelect2Dropdowns();
	};

	return [elem, tooltipText, costText, ondisplay];
}

function _autoJobsTable(settingGroup, ratioJobs, percentJobs) {
	let tooltipText = `<div id='autoStructure'>`;
	tooltipText += `<span class='messageConfigContainer' style='font-size: 1.3vw;'>&nbsp;Jobs</span><br>`;
	const elemWidth = 'calc((100% - 1.4em - 2px) / 5.4)';

	let rowData = '';
	let rows = 0;
	let total = 0;

	for (let item in ratioJobs) {
		item = ratioJobs[item];
		if (total > 0 && total % 3 === 0) {
			tooltipText += `<div id='row${rows}' style= 'display: flex;'>${rowData}</div>`;
			rowData = '';
			rows++;
		}

		const setting = settingGroup[item] !== 'undefined' ? settingGroup[item] : (setting = item = { enabled: false, ratio: 100 });
		const equipClass = setting && setting.enabled ? 'Equipped' : 'NotEquipped';

		rowData += `
			<div id='${item}Btn' class='btnItem btnItem${equipClass}' style='height: 1.5vw; max-width: ${elemWidth}; min-width: ${elemWidth}; margin-right: 0.1em; margin-left: 0.1em; margin-top: 0.1em; margin-bottom: 0.2em;' onclick='_hideAutomationToggleElem(this)' data-hidden-text="${item}">
				<span>${item}</span>
			</div>&nbsp;`;

		rowData += `
		<div id ='${item}RatioDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
			<span id='${item}TextBox' class='textbox' style='text-align: left; height: 1.5vw; max-width: 9vw; min-width: 9vw; font-size: 0.7vw; margin-right: 0.4em;' onclick='document.getElementById("${item}Ratio").focus()'>Ratio:&nbsp;&nbsp;&nbsp;&nbsp;
			<input id='${item}Ratio' type='number' step='1' value='${setting.ratio}' min='0' max='1000' placeholder='0' style='color: white;' onfocus='this.select()'>
			</span>
		</div>`;

		total++;
	}

	for (let item in percentJobs) {
		item = percentJobs[item];
		if (total > 0 && total % 3 === 0) {
			tooltipText += `<div id='row${rows}' style= 'display: flex;'>${rowData}</div>`;
			rowData = '';
			rows++;
		}

		const setting = settingGroup[item] !== 'undefined' ? settingGroup[item] : (setting = item = { enabled: false, percent: 100 });
		const equipClass = setting && setting.enabled ? 'Equipped' : 'NotEquipped';

		rowData += `
			<div id='${item}Btn' class='btnItem btnItem${equipClass}' style='height: 1.5vw; max-width: ${elemWidth}; min-width: ${elemWidth}; margin-right: 0.1em; margin-left: 0.1em; margin-top: 0.1em; margin-bottom: 0.2em;' onclick='_hideAutomationToggleElem(this)' data-hidden-text="${item}">
				<span>${item}</span>
			</div>&nbsp;`;

		rowData += `
		<div id ='${item}PercentDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
			<span id='${item}TextBox' class='textbox' style='text-align: left; height: 1.5vw; max-width: 9vw; min-width: 9vw; font-size: 0.7vw; margin-right: 0.4em;' onclick='document.getElementById("${item}Percent").focus()'>Percent:
			<input id='${item}Percent' type='number' step='1' value='${setting.percent}' min='0' max='100' placeholder='0' style='color: white;' onfocus='this.select()'>
			</span>
		</div>`;

		total++;
	}

	tooltipText += `<div id='row${rows + 1}' style= 'display: flex;'>${rowData}</div>`;
	tooltipText += `</div>`;

	tooltipText += `<div id='autoStructureMisc'>`;
	tooltipText += `<span class='messageConfigContainer' style='font-size: 1.3vw;'>&nbsp;</span><br>`;
	rows = 0;
	rowData = '';

	if (game.global.universe === 2) {
		const setting = settingGroup.FarmersUntil !== 'undefined' ? settingGroup.FarmersUntil : (setting = item = { enabled: false, zone: 0 });
		const equipClass = setting && setting.enabled ? 'Equipped' : 'NotEquipped';
		let item = 'FarmersUntil';

		rowData += `
			<div id='${item}Btn' class='btnItem btnItem${equipClass}' style='height: 1.5vw; max-width: ${elemWidth}; min-width: ${elemWidth}; margin-right: 0.1em; margin-left: 0.1em; margin-top: 0.1em; margin-bottom: 0.2em;' onclick='_hideAutomationToggleElem(this)' data-hidden-text="${item}">
				<span>Farmers Until</span>
			</div>&nbsp;`;

		rowData += `
		<div id ='${item}ZoneDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
			<span id='${item}TextBox' class='textbox' style='text-align: left; height: 1.5vw; max-width: 9vw; min-width: 9vw; font-size: 0.7vw; margin-right: 0.4em;' onclick='document.getElementById("${item}Zone").focus()'>Zone:
			<input id='${item}Zone' type='number' step='1' value='${setting && setting.zone ? setting.zone : 0}' min='0' max='9999' placeholder='0' style='color: white;' onfocus='this.select()'>
			</span>
		</div>`;
	}

	if (game.global.universe === 2) {
		const setting = settingGroup.NoLumberjacks !== 'undefined' ? settingGroup.NoLumberjacks : (setting = item = { enabled: false });
		const equipClass = setting && setting.enabled ? 'Equipped' : 'NotEquipped';
		let item = 'NoLumberjacks';

		rowData += `
			<div id='${item}Btn' class='btnItem btnItem${equipClass}' style='height: 1.5vw; max-width: ${elemWidth}; min-width: ${'calc((100% - 1.4em - 1px) / 3)'}; margin-right: 0.1em; margin-left: 0.1em; margin-top: 0.1em; margin-bottom: 0.2em;' onclick='_hideAutomationToggleElem(this)' data-hidden-text="${item}">
				<span style="margin-left: auto;">No Lumberjacks After Melting Point</span>
			</div>&nbsp;`;

		tooltipText += `<div id='row${rows}' style= 'display: flex;'>${rowData}</div>`;
		rowData = '';
		rows++;
	}

	/* portal settings */
	const portalOptions = ['Off', 'On', 'Manual'];
	tooltipText += `
		<div id ='PortalSettingDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;' title='AutoJobs'>
			<select id='Setting On Portal' class='select2 custom-style' style='color: white;'>
				<option value='0'>No change</option>`;

	for (let x = 0; x < portalOptions.length; x++) {
		tooltipText += '<option' + (settingGroup.portalOption && settingGroup.portalOption === `Auto Jobs: ${portalOptions[x]}` ? " selected='selected'" : '') + " value='" + portalOptions[x] + "'>" + portalOptions[x] + '</option>';
	}
	tooltipText += '</select></span>';
	tooltipText += '</div>';

	return tooltipText;
}

function _autoJobsSave() {
	const setting = {};
	const items = Array.from(document.getElementsByClassName('btnItem'));
	const ratioJobs = ['Farmer', 'Lumberjack', 'Miner'];

	items.forEach((item) => {
		const name = item.dataset.hiddenText;
		setting[name] = setting[name] || {};
		setting[name].enabled = item.classList.contains('btnItemEquipped');

		if (name === 'NoLumberjacks') return;
		if (name === 'FarmersUntil') {
			const zoneElem = document.getElementById(name + 'Zone');
			let zone = parseInt(zoneElem.value, 10);
			zone = isNumberBad(zone) ? 0 : Math.max(Math.min(zone, 999), 1);

			setting[name].zone = zone;
			return;
		}

		if (ratioJobs.includes(name)) {
			const ratioElem = document.getElementById(name + 'Ratio');
			let ratio = parseInt(ratioElem.value, 10);
			ratio = isNumberBad(ratio) ? 0 : Math.max(Math.min(ratio, 1000), 1);
			setting[name].ratio = ratio;

			return;
		}

		const percentElem = document.getElementById(name + 'Percent');
		let percent = parseInt(percentElem.value, 10);
		percent = isNumberBad(percent) ? 0 : Math.max(Math.min(percent, 100), 0);
		setting[name].percent = percent;
	});

	/* adding in jobs that are locked so that there won't be any issues later on */
	if (game.global.universe === 1) {
		if (!setting.Magmamancer) {
			setting.Magmamancer = {
				enabled: false,
				percent: 100
			};
		}
	}
	if (game.global.universe === 2) {
		if (!setting.Meteorologist) {
			setting.Meteorologist = {
				enabled: true,
				percent: 20
			};
		}
		if (!setting.Worshipper) {
			setting.Worshipper = {
				enabled: true,
				percent: 20
			};
		}
	}

	const portalSetting = document.getElementById('PortalSettingDiv').children[0].value;
	setting.portalOption = isNaN(Number(portalSetting)) ? `Auto Jobs: ${portalSetting}` : portalSetting;

	setPageSetting('jobSettingsArray', setting);
	cancelTooltip();
}

function _autoJobsReset() {
	const setting = {
		Farmer: { enabled: true, ratio: 1 },
		Lumberjack: { enabled: true, ratio: 1 },
		Miner: { enabled: true, ratio: 1 },
		Explorer: { enabled: true, percent: 10 },
		Trainer: { enabled: true, percent: 25 },
		Magmamancer: { enabled: true, percent: 100 },
		Meteorologist: { enabled: true, percent: 100 },
		Worshipper: { enabled: true, percent: 5 },
		FarmersUntil: { enabled: false, zone: 999 },
		NoLumberjacks: { enabled: false }
	};

	setPageSetting('jobSettingsArray', setting);
	cancelTooltip2();
	importExportTooltip('AutoJobs');
}

/* auto equip */
function autoEquipDisplay(elem) {
	MODULES.popups.mazWindowOpen = true;

	const baseText = `<p>Here you can choose which equipment will be automatically purchased when AT Auto Equip is toggled on. Click on a equipment name to enable the automatic purchasing of that equip, the <b>Percent</b> input specifies the cost-to-resource % that the equipment should be purchased below and set the <b>Up To</b> box to the maximum number of that equipment you'd like purchased <b>(0 for no limit)</b>.</p>

	<p>For example, setting the <b>Percent</b> input to 10 and the <b>Up To</b> input to 20 for <b>Pants</b> will cause a level to be purchased when the cost of the next level is less than 10% of your metal, as long as you have less than 20 levels of the equip.</p>

	<p>Equipment levels are capped at <b>9</b> when a prestige is available for that equip to ensure the script doesn't unnecessarily spend resources on them when prestiges would be more efficient.</p>
	
	<p>When your Hits Survived is below your <b>AE: HS Cut-off</b> setting <b>OR</b> when <b>Hits Survived</b> farming then your Percent and Up To inputs for health equips will be ignored and it will farm as many equips as possible with 100% resources spent until either condition is no longer met. Similarly, for attack equips, when your HD Ratio is above your <b>AE: HD Cut-off</b> setting <b>OR</b> when <b>HD Ratio</b> then those inputs are overwritten.</p>`;

	let tooltipText = `
		<p>Welcome to AT's Auto Equip Settings! 
		<span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp(); _verticalCenterTooltip();'>Help</span></p>
		<div id='autoTooltipHelpDiv' style='display: none'>
		<p>${baseText}</p>
		</div>
	`;

	const settingGroup = {};
	const settingsArray = getPageSetting('autoEquipSettingsArray');

	let obj = Object.keys(game.equipment);

	obj.forEach((setting) => {
		settingGroup[setting] = {};
	});

	tooltipText += `<div id='baseChallenges'>`;
	tooltipText += `<span class='messageConfigContainer' style='font-size: 1.3vw;'>&nbsp;Equipment</span><br>`;
	const elemWidth = `calc((100% - 1.4em - 2px) / 6.1)`;

	let rowData = '';
	let rows = 0;
	let total = 0;
	for (let item in settingGroup) {
		if (!game.global.slowDone && ['Arbalest', 'Gambeson'].includes(item)) {
			continue;
		}

		if (total > 0 && total % 2 === 0) {
			tooltipText += `<div id='row${rows}' style= 'display: flex;'>${rowData}</div>`;
			rowData = '';
			rows++;
		}

		const setting = settingsArray[item] !== 'undefined' ? settingsArray[item] : (setting = item = { enabled: true, percent: 100 });
		const equipClass = setting && setting.enabled ? 'Equipped' : 'NotEquipped';

		rowData += `
			<div id='${item}Btn' class='btnItem btnItem${equipClass}' style='height: 1.5vw; max-width: ${elemWidth}; min-width: ${elemWidth}; margin-right: 0.1em; margin-left: 0.1em; margin-top: 0.1em; margin-bottom: 0.2em;' onclick='_hideAutomationToggleElem(this)' data-hidden-text="${item}">
				<span>${item}</span>
			</div>&nbsp;`;

		rowData += `
		<div id ='${item}PercentDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
			<span id='${item}TextBox' class='textbox' style='text-align: left; height: 1.5vw; max-width: 9vw; min-width: 9vw; font-size: 0.7vw;' onclick='document.getElementById("${item}Percent").focus()'>Percent:
			<input id='${item}Percent' type='number' step='1' value='${setting && setting.percent ? setting.percent : 0}' min='0' max='100' placeholder='100' style='color: white;' onfocus='this.select()'>
			</span>
		</div>`;

		rowData += `
		<div id ='${item}BuyMaxDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
			<span id='${item}TextBox' class='textbox' style='text-align: left; height: 1.5vw; max-width: 9vw; min-width: 9vw; font-size: 0.7vw; margin-right: 1.61vw;' onclick='document.getElementById("${item}BuyMax").focus()'>Up to:
			<input id='${item}BuyMax' type='number' step='1' value='${setting && setting.buyMax ? setting.buyMax : 0}' min='0' max='9999' placeholder='0' style='color: white;' onfocus='this.select()'>
			</span>
		</div>`;

		total++;
	}

	tooltipText += `<div id='row${rows + 1}' style= 'display: flex;'>${rowData}</div>`;
	tooltipText += `</div>`;

	const costText = `
		<div class='maxCenter'>
			<div id='confirmTooltipBtn' class='btn btn-success btn-md' onclick='_autoEquipSave()'>Save and Close</div>
			<div class='btn btn-danger btn-md' onclick='cancelTooltip()'>Cancel</div>
			<div class='btn btn-primary btn-md' onclick='_autoEquipSave(); importExportTooltip("AutoEquip")'>Save</div>
			<div class='btn btn-warning btn-md' style='float: right;' onclick='tooltipAT("Auto Equip Reset", event, undefined);'>Reset To Default</div>
		</div>`;

	elem.style.left = '30.5%';
	elem.style.top = '25%';
	elem.classList = `tooltipExtraCustom60`;
	const ondisplay = () => _verticalCenterTooltip();

	return [elem, tooltipText, costText, ondisplay];
}

function _autoEquipSave() {
	const setting = {};
	const items = Array.from(document.getElementsByClassName('btnItem'));

	items.forEach((item) => {
		const name = item.dataset.hiddenText;
		setting[name] = setting[name] || {};
		setting[name].enabled = item.classList.contains('btnItemEquipped');

		const percentElem = document.getElementById(name + 'Percent');
		let percent = parseInt(percentElem.value, 10);
		percent = isNumberBad(percent) ? 0 : Math.max(Math.min(percent, 100), 0);
		setting[name].percent = percent;

		const buyMaxElem = document.getElementById(name + 'BuyMax');
		let buyMax = parseInt(buyMaxElem.value, 10);
		buyMax = isNumberBad(buyMax) ? 0 : Math.max(Math.min(buyMax, 9999), 0);
		setting[name].buyMax = buyMax;
	});

	/* adding in equips that are locked so that there won't be any issues later on */
	if (!game.global.slowDone) {
		if (!setting.Arbalest) {
			setting.Arbalest = {
				enabled: true,
				percent: 100
			};
		}
		if (!setting.Gambeson) {
			setting.Gambeson = {
				enabled: true,
				percent: 100
			};
		}
	}

	setPageSetting('autoEquipSettingsArray', setting);
	cancelTooltip();
}

function _autoEquipReset() {
	const setting = {
		Shield: { enabled: true, percent: 10, buyMax: 20 },
		Dagger: { enabled: true, percent: 5, buyMax: 20 },
		Boots: { enabled: true, percent: 5, buyMax: 20 },
		Mace: { enabled: true, percent: 5, buyMax: 20 },
		Helmet: { enabled: true, percent: 5, buyMax: 20 },
		Polearm: { enabled: true, percent: 10, buyMax: 20 },
		Pants: { enabled: true, percent: 10, buyMax: 20 },
		Battleaxe: { enabled: true, percent: 10, buyMax: 20 },
		Shoulderguards: { enabled: true, percent: 10, buyMax: 20 },
		Greatsword: { enabled: true, percent: 25, buyMax: 20 },
		Breastplate: { enabled: true, percent: 25, buyMax: 20 },
		Arbalest: { enabled: true, percent: 25, buyMax: 20 },
		Gambeson: { enabled: true, percent: 25, buyMax: 20 }
	};

	setPageSetting('autoEquipSettingsArray', setting);
	cancelTooltip2();
	importExportTooltip('AutoEquip');
}

/* unique maps */
function uniqueMapsDisplay(elem) {
	const hze = atConfig.settingUniverse === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();
	const baseText = `<p>Here you can choose which unique maps you'd like to run during your runs.<br>
	Each map has zone and cell input boxes for when they should run. If a map wasn't run on the zone set, it will be attempt to run every zone after it.<br>
	This setting will run maps of the approrpriate level to obtain unique maps that haven't been obtained yet.</p>`;
	const smithy = `<p>The <b>Smithy Melting Point</b> section is dedicated to running Melting Point when you've reached a certain amount of smithies.<br>
	As different types of runs have varying values you'll want to run Melting Point at there's one for each run type.<br>
	Certain challenges have overrides for this, once unlocked they can be found in the C3 tab.</p>`;
	const smithyDisplay = atConfig.settingUniverse === 2 && hze >= 50;

	const mapUnlocks = Object.keys(atData.uniqueMaps)
		.filter((mapName) => {
			const { universe, zone } = atData.uniqueMaps[mapName];
			return !['Bionic Wonderland', 'The Black Bog'].includes(mapName) && universe === atConfig.settingUniverse && zone <= hze;
		})
		.reduce((acc, mapName) => {
			acc[mapName] = atData.uniqueMaps[mapName];
			return acc;
		}, {});
	const smithySettings = smithyDisplay
		? ['MP Smithy', 'MP Smithy Daily', 'MP Smithy C3', 'MP Smithy One Off'].reduce((acc, setting) => {
				acc[setting] = setting;
				return acc;
		  }, {})
		: {};

	const settingGroup = getPageSetting('uniqueMapSettingsArray', atConfig.settingUniverse);

	let tooltipText = `
		<p>Welcome to AT's Unique Map Settings! 
		<span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp(); _verticalCenterTooltip();'>Help</span></p>
		<div id='autoTooltipHelpDiv' style='display: none'>
	`;
	tooltipText += `${baseText}${smithyDisplay ? smithy : ''}</div>`;
	tooltipText += _uniqueMapsTable(settingGroup, mapUnlocks, smithySettings);

	const costText = `
		<div class='maxCenter'>
			<div id='confirmTooltipBtn' class='btn btn-success btn-md' onclick='_uniqueMapsSave()'>Save and Close</div>
			<div class='btn btn-danger btn-md' onclick='cancelTooltip()'>Cancel</div>
			<div class='btn btn-primary btn-md' onclick='_uniqueMapsSave(); importExportTooltip("uniqueMaps")'>Save</div>
		</div>`;

	elem.classList = `tooltipExtraCustom60`;
	const ondisplay = () => _verticalCenterTooltip();
	return [elem, tooltipText, costText, ondisplay];
}

function _uniqueMapsTable(settingGroup, mapUnlocks, smithySettings) {
	let tooltipText = `<div id='uniqueMaps'>`;
	tooltipText += `<span class='messageConfigContainer' style='font-size: 1.3vw;'>&nbsp;Unique Maps</span><br>`;
	const elemWidth = 'calc((100% - 1.4em - 2px) / 6.1)';
	const obsidianZone = getObsidianStart();

	let rowData = '';
	let rows = 0;
	let total = 0;
	for (let item in mapUnlocks) {
		if (total > 0 && total % 2 === 0) {
			tooltipText += `<div id='row${rows}' style= 'display: flex;'>${rowData}</div>`;
			rowData = '';
			rows++;
		}

		const setting = settingGroup[item] !== 'undefined' ? settingGroup[item] : (setting = item = { enabled: false, zone: 6, cell: 1 });
		const equipClass = setting && setting.enabled ? 'Equipped' : 'NotEquipped';

		rowData += `
			<div id='${item}Btn' class='btnItem btnItem${equipClass}' style='height: 1.5vw; max-width: ${elemWidth}; min-width: ${elemWidth}; margin-right: 0.1em; margin-left: 0.1em; margin-top: 0.1em; margin-bottom: 0.2em;' onclick='_hideAutomationToggleElem(this)' data-hidden-text="${item}">
				<span>${item}</span>
			</div>&nbsp;`;

		rowData += `
		<div id ='${item}ZoneDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
			<span id='${item}TextBox' class='textbox' style='text-align: left; height: 1.5vw; max-width: 9vw; min-width: 9vw; font-size: 0.7vw; margin-right: 0.4em;' onclick='document.getElementById("${item}Zone").focus()'>Zone:
			<input id='${item}Zone' type='number' step='1' value='${setting && setting.zone ? setting.zone : 0}' min='0' max='${obsidianZone}' placeholder='0' style='color: white;' onfocus='this.select()'>
			</span>
		</div>`;

		rowData += `
		<div id ='${item}CellDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
			<span id='${item}TextBox' class='textbox' style='text-align: left; height: 1.5vw; max-width: 9vw; min-width: 9vw; font-size: 0.7vw; margin-right: 1.61vw;' onclick='document.getElementById("${item}Cell").focus()'>Cell:
			<input id='${item}Cell' type='number' step='1' value='${setting && setting.cell ? setting.cell : 1}' min='1' max='100' placeholder='1' style='color: white;' onfocus='this.select()'>
			</span>
		</div>`;

		total++;
	}

	tooltipText += `<div id='row${rows + 1}' style= 'display: flex;'>${rowData}</div>`;
	tooltipText += `</div>`;

	if (Object.keys(smithySettings).length > 0) {
		tooltipText += `<div id='smithyMaps'>`;
		tooltipText += `<span class='messageConfigContainer' style='font-size: 1.3vw;'>&nbsp;Smithy Melting Point</span><br>`;

		rowData = '';
		rows = 0;
		total = 0;
		for (let item in smithySettings) {
			if (total > 0 && total % 3 === 0) {
				tooltipText += `<div id='row${rows}' style= 'display: flex;'>${rowData}</div>`;
				rowData = '';
				rows++;
			}

			const name = smithySettings[item].split('MP Smithy')[1].replace(/ /g, '-');
			const setting = settingGroup[item] !== 'undefined' ? settingGroup[item] : (setting = item = { enabled: false, zone: 0 });
			const equipClass = setting && setting.enabled ? 'Equipped' : 'NotEquipped';

			rowData += `
				<div id='${item}Btn' class='btnItem btnItem${equipClass}' style='height: 1.5vw; max-width: ${elemWidth}; min-width: ${elemWidth}; margin-right: 0.1em; margin-left: 0.1em; margin-top: 0.1em; margin-bottom: 0.2em;' onclick='_hideAutomationToggleElem(this)' data-hidden-text="${item}">
					<span>${name ? name.substring(1) : 'Filler'} Challenges</span>
				</div>&nbsp;`;

			rowData += `
			<div id ='${item}ValueDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
				<span id='${item}TextBox' class='textbox' style='text-align: left; height: 1.5vw; max-width: 9vw; min-width: 9vw; font-size: 0.7vw;' onclick='document.getElementById("${item}Value").focus()'>Amount:
				<input id='${item}Value' type='number' step='1' value='${setting && setting.value ? setting.value : 0}' min='0' max='999' placeholder='0' style='color: white;' onfocus='this.select()'>
				</span>
			</div>`;

			total++;
		}

		tooltipText += `<div id='row${rows + 1}' style= 'display: flex;'>${rowData}</div>`;
		tooltipText += `</div>`;
	}

	return tooltipText;
}

function _uniqueMapsSave() {
	const setting = getPageSetting('uniqueMapSettingsArray', atConfig.settingUniverse);

	const items = Array.from(document.getElementsByClassName('btnItem'));

	items.forEach((item) => {
		const name = item.dataset.hiddenText;
		setting[name] = setting[name] || {};
		setting[name].enabled = item.classList.contains('btnItemEquipped');

		if (name.includes('Smithy')) {
			const valueElem = document.getElementById(name + 'Value');
			let value = parseInt(valueElem.value, 10);
			value = Number.isInteger(value) ? value : 0;
			setting[name].value = value;
			return;
		}

		const zoneElem = document.getElementById(name + 'Zone');
		let zone = parseInt(zoneElem.value, 10);
		zone = isNumberBad(zone) ? 0 : Math.max(Math.min(zone, 999), 0);
		setting[name].zone = zone;

		const cellElem = document.getElementById(name + 'Cell');
		let cell = parseInt(cellElem.value, 10);
		cell = isNumberBad(cell) ? 0 : Math.max(Math.min(cell, 100), 1);
		setting[name].cell = cell;
	});

	setPageSetting('uniqueMapSettingsArray', setting, atConfig.settingUniverse);
	cancelTooltip();
}

/* AT messages */
function messageDisplay(elem) {
	const msgs = getPageSetting('spamMessages');
	const keys = ['gather', 'buildings', 'jobs', 'equipment', 'upgrades', 'maps', 'map_Details', 'map_Destacking', 'map_Skip', 'golden_Upgrades', 'other', 'stance', 'magmite', 'nature', 'zone', 'run_Stats', 'exotic', 'challenge_Abandon', 'portal'];

	const settingGroup = keys.reduce((obj, key) => {
		obj[key] = false;
		return obj;
	}, {});

	let tooltipText = "<div id='messageConfig'>Here you can select the messages that the script will print into the message log.<br>Mouse over the name of a filter for more info.<br></div>";
	tooltipText += `<div id='baseGameItems'>`;

	let rowData = '';
	let rows = 0;
	let total = 0;
	for (let item in settingGroup) {
		if (item === 'enabled') continue;
		const realName = (item.charAt(0).toUpperCase() + item.substr(1)).replace(/_/g, ' ');
		if (typeof msgs[item] === 'undefined') msgs[item] = false;

		if ((total > 0 && total % 5 === 0) || item === 'zone') {
			tooltipText += `<div id='row${rows}'>${rowData}</div>`;
			rowData = '';
			rows++;
			if (item === 'zone') total++;
		}

		const equipClass = msgs[item] ? 'Equipped' : 'NotEquipped';

		rowData += `
			<div class='btnItem btnItem${equipClass}' onclick='_hideAutomationToggleElem(this)' data-hidden-text="${item}" <span onmouseover='_messageConfigHoverAT("${item}", event)' onmouseout='_messageConfigHoverAT("hide", event)'>
				<span>${realName}</span>
			</div>`;

		total++;
	}
	rows++;
	tooltipText += `<div id='row${rows}'>${rowData}</div>`;
	tooltipText += `</div>`;
	const ondisplay = () => _verticalCenterTooltip(true);

	elem.style.top = '25%';
	elem.style.left = '35%';

	const costText = `
		<div class='maxCenter'>
			<div id='confirmTooltipBtn' class='btn btn-success btn-md' onclick='_messageSave()'>Save and Close</div>
			<div class='btn btn-danger btn-md' onclick='cancelTooltip()'>Cancel</div>
			<div class='btn btn-primary btn-md' onclick='_messageSave(); importExportTooltip("messageConfig")'>Save</div>
		</div>`;

	return [elem, tooltipText, costText, ondisplay];
}

function _messageConfigHoverAT(what, event) {
	const messageConfigMap = {
		hide: { title: 'Hide', text: 'Here you can select the messages that the script will print into the message log.<br>Mouse over the name of a filter for more info.' },
		general: { title: 'General', text: 'Notification Messages, Auto He/Hr.' },
		buildings: { title: 'Buildings', text: 'Log buildings purchased.' },
		jobs: { title: 'Jobs', text: 'Log workers hired.' },
		equipment: { title: 'Equipment', text: 'Log equipment and prestiges purchases.' },
		upgrades: { title: 'Upgrades', text: 'Log upgrades purchased.' },
		golden_Upgrades: { title: 'Golden Upgrades', text: 'Log golden upgrades purchases.' },
		/*  */
		maps: { title: 'Maps', text: 'Log maps purchases and maps run.' },
		map_Details: { title: 'Map Details', text: 'Log the time and amount of maps it takes to finish mapping.' },
		map_Destacking: { title: 'Map Destacking', text: 'Log the time and amount of maps it takes to finish destacking through maps.' },
		map_Skip: { title: 'Map Skip', text: 'Log when the script skips any mapping settings.' },
		other: { title: 'Other', text: 'Log Trimpicide army suicides and Robotrimp activations.' },
		gather: { title: 'Gather', text: 'Log gather changes.' },
		stance: { title: 'Stance', text: 'Log stance changes.' },
		magmite: { title: 'Magmite', text: 'Log magmite spending.' },
		nature: { title: 'Nature', text: 'Log when the script spends nature tokens.' },
		/*  */
		zone: { title: 'Zone', text: 'Log when you start a new zone.' },
		run_Stats: { title: 'Run Stats', text: "Log your total trimps and how many resources you'd gain from a bone charge when starting a new zone." },
		exotic: { title: 'Exotic', text: 'Log your current world exotics when starting a new zone.' },
		challenge_Abandon: { title: 'Challenge Abandon', text: 'Log when challenges are abandoned through the scripts settings.' },
		portal: { title: 'Portal', text: 'Log challenges started by Auto Portal.' }
	};

	const config = messageConfigMap[what];
	if (!config) return;

	if (what === 'hide') document.getElementById('messageConfig').innerHTML = `${config.text}`;
	else document.getElementById('messageConfig').innerHTML = `<b>${config.title}</b><br>${config.text}`;
	tooltip(config.title, 'customText', event, config.text);
}

function _messageSave() {
	const setting = getPageSetting('spamMessages', portalUniverse);
	const items = Array.from(document.getElementsByClassName('btnItem'));

	items.forEach((item) => {
		setting[item.dataset.hiddenText] = item.classList.contains('btnItemEquipped');
	});

	setPageSetting('spamMessages', setting);
	cancelTooltip();
}

/* daily portal mods */
function dailyPortalModsDisplay(elem) {
	const baseText = `<p>This setting allows you to adjust the portal zones based on the modifiers of the daily challenge you're running.<br>
	For instance, if your daily has a resource empower modifier and you input '-3', both your void map zone and daily portal zone will be set to 3 zones lower than your current settings.<br>
	Please note that the lowest value will always be used. Therefore, if a daily challenge has both Empower and Famine modifiers, inputting '-3' in each box will not result in a combined adjustment of -6 zones.</p>`;

	const tooltips = {
		Reflect: `Enemies have a x% chance to reflect an attack, dealing y% of damage taken back to your Trimps (will not reflect damage done above the Enemy's max health).`,
		Empower: 'All enemies gain x stacks of Empower whenever your Trimps die in the World. Empower increases the attack and health of Bad Guys in the World by 0.2% per stack, can stack to 9999, and never resets.',
		Mutimp: '40% of Bad Guys in the first x rows of the World will be mutated into (Hulking) Mutimps.',
		Bloodthirst: 'Enemies gain a stack of Bloodthirst whenever Trimps die. Every x stacks, enemies will heal to full and gain an additive 50% attack. Stacks cap at y and reset after killing an enemy.',
		Famine: 'Gain x% less Metal, Food, Wood, and Gems from all sources.',
		Large: 'All housing can store x% fewer Trimps.',
		Weakness: 'Enemies stack a debuff with each attack, reducing Trimp attack by x% per stack. Stacks cap at 9 and reset on Trimp death.',
		Empowered_Void: 'Enemies in Void Maps have x% increased Attack and Health.',
		Heirlost: 'Heirloom combat and resource bonuses are reduced by x%.'
	};

	let tooltipText = `<p>Welcome to AT's Daily Auto Portal Settings! 
	<span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp(); _verticalCenterTooltip();'>Help</span></p>`;
	tooltipText += `<div id='autoTooltipHelpDiv' style='display: none'>${baseText}</p></div>`;

	const settingArray = getPageSetting('dailyPortalSettingsArray', atConfig.settingUniverse);
	const settings = ['Reflect', 'Empower', 'Mutimp', 'Bloodthirst', 'Famine', 'Large', 'Weakness', 'Empowered_Void', 'Heirlost'];
	const settingGroup = {};

	settings.forEach((setting) => {
		settingGroup[setting] = {};
	});

	tooltipText += `<div id='baseChallenges'>`;
	tooltipText += `<span class='messageConfigContainer' style='font-size: 1.3vw;'>&nbsp;Daily Modifiers</span><br>`;

	let rowData = '';
	let rows = 0;
	let total = 0;
	const elemWidth = 'calc((100% - 1.4em - 2px) / 6.1)';

	for (let item in settingGroup) {
		if (atConfig.settingUniverse === 1 && (item === 'Empowered_Void' || item === 'Heirlost')) continue;
		if (atConfig.settingUniverse === 2 && item === 'Reflect') continue;

		if (total > 0 && total % 3 === 0) {
			tooltipText += `<div id='row${rows}' style= 'display: flex;'>${rowData}</div>`;
			rowData = '';
			rows++;
		}

		const setting = settingArray[item] !== 'undefined' ? settingArray[item] : (setting = item = { enabled: false, zone: 0 });
		const equipClass = setting && setting.enabled ? 'Equipped' : 'NotEquipped';
		const itemName = (item.charAt(0).toUpperCase() + item.substr(1)).replace(/_/g, ' ');

		rowData += `
			<div id='${itemName}Btn' class='btnItem btnItem${equipClass}' style='height: 1.5vw; max-width: ${elemWidth}; min-width: ${elemWidth}; margin-right: 0.1em; margin-left: 0.1em; margin-top: 0.1em; margin-bottom: 0.2em;' onclick='_hideAutomationToggleElem(this)' data-hidden-text="${item}" title='${tooltips[item]}'>
				<span>${itemName}</span>
			</div>&nbsp;`;

		rowData += `
		<div id ='${itemName}ZoneDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
			<span id='${itemName}TextBox' class='textbox' style='text-align: left; height: 1.5vw; max-width: 9vw; min-width: 9vw; font-size: 0.7vw;' onclick='document.getElementById("${item}Zone").focus()'>± Zone:
			<input id='${item}Zone' type='number' step='1' value='${setting && setting.zone ? setting.zone : 0}' min='0' max='${810}' placeholder='0' style='color: white;' onfocus='this.select()'>
			</span>
		</div>`;

		total++;
	}

	rows++;
	tooltipText += `<div id='row${rows}' style= 'display: flex;'>${rowData}</div>`;
	tooltipText += `</div>`;
	const costText = `
		<div class='maxCenter'>
			<div id='confirmTooltipBtn' class='btn btn-success btn-md' onclick='_dailyPortalModsSave()'>Save and Close</div>
			<div class='btn btn-danger btn-md' onclick='cancelTooltip()'>Cancel</div>
			<div class='btn btn-primary btn-md' onclick='_dailyPortalModsSave(); importExportTooltip("dailyAutoPortal")'>Save</div>
		</div>`;

	elem.style.left = '33.5%';
	elem.style.top = '25%';
	elem.classList = `tooltipExtraCustom60`;
	const ondisplay = () => _verticalCenterTooltip();

	return [elem, tooltipText, costText, ondisplay];
}

function _dailyPortalModsSave() {
	const setting = getPageSetting('dailyPortalSettingsArray', atConfig.settingUniverse);
	const items = Array.from(document.getElementsByClassName('btnItem'));

	items.forEach((item) => {
		const name = item.dataset.hiddenText;
		setting[name] = setting[name] || {};
		setting[name].enabled = item.classList.contains('btnItemEquipped');

		const zoneElem = document.getElementById(name + 'Zone');
		let zone = parseInt(zoneElem.value, 10);
		zone = Number.isInteger(zone) ? zone : 0;
		setting[name].zone = zone;
	});

	setPageSetting('dailyPortalSettingsArray', setting, atConfig.settingUniverse);
	cancelTooltip();
}

/* c2 runner */
function c2RunnerDisplay(elem) {
	MODULES.popups.mazWindowOpen = true;

	const displayZone = getPageSetting('c2RunnerMode', atConfig.settingUniverse) === 1;
	let baseText = `Here you can select the challenges you would like ${_getChallenge2Info()} Runner to complete`;
	if (displayZone) baseText += ` and the zone you'd like the challenge to finish at.`;
	else baseText += `. It will only only run the ${_getChallenge2Info()}s when its HZE% is below what you have input into the <b>Below HZE%</b> input box and will run them until they reach the HZE% you have input into the <b>Finish HZE%</b> input box.`;

	const fusedText = `<br>Fused challenges are prioritised over their regular counterparts when starting challenges.`;

	let tooltipText = `
		<p>Welcome to ${_getChallenge2Info()} Runner Settings! 
		<span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp(); _verticalCenterTooltip();'>Help</span></p>
		<div id='autoTooltipHelpDiv' style='display: none'>
		<p>${baseText}${fusedText}</p>
		</div>
	`;

	let addedFusedHeader = false;
	const hze = atConfig.settingUniverse === 2 ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();
	const fusedC2s = ['Enlightened', 'Paralysis', 'Nometal', 'Topology', 'Waze', 'Toxad'];
	const settingGroup = {};
	const c2RunnerSettings = getPageSetting('c2RunnerSettings', atConfig.settingUniverse);
	const obsidianZone = displayZone ? getObsidianStart() : 100;

	let obj = challengesUnlockedObj(atConfig.settingUniverse, true, false);
	obj = filterAndSortChallenges(obj, 'c2');

	if (obj[0] === 'Eradicated') {
		const obliteratedIndex = obj.indexOf('Obliterated');
		if (obliteratedIndex !== -1) {
			obj.splice(0, 1);
			obj.splice(obliteratedIndex, 0, 'Eradicated');
		}
	}

	obj.forEach((setting) => {
		settingGroup[setting] = {};
	});

	tooltipText += `<div id='baseChallenges'>`;
	tooltipText += `<span class='messageConfigContainer' style='font-size: 1.3vw;'>&nbsp;Challenges</span><br>`;
	const elemWidth = `calc((100% - 1.4em - 2px) / 6.1)`;
	const displayType = displayZone ? 'zone' : 'zoneHZE';

	const itemsPerRow = !displayZone ? 2 : 3;
	let rowData = '';
	let rows = 0;
	let total = 0;
	for (let item in settingGroup) {
		if (fusedC2s.includes(item) && !addedFusedHeader) {
			count = 0;
			tooltipText += `<div id='row${rows}' style= 'display: flex;'>${rowData}</div>`;
			tooltipText += `</div>`;
			tooltipText += `<div id='fusedChallenges'>`;
			tooltipText += `<span class='messageConfigContainer' style='font-size: 1.3vw;'>&nbsp;Fused Challenges</span></span><br/>`;
			addedFusedHeader = true;
			total = 0;
			rows = 0;
			rowData = '';
		}

		if (total > 0 && total % itemsPerRow === 0) {
			tooltipText += `<div id='row${rows}' style= 'display: flex;'>${rowData}</div>`;
			rowData = '';
			rows++;
		}

		const setting = c2RunnerSettings[item] !== 'undefined' ? c2RunnerSettings[item] : (setting = item = { enabled: false, zone: 0 });
		const challenge = game.challenges[item];
		const challengeList = challenge.multiChallenge || [item];
		let challengeLevel = 0;

		for (let y = 0; y < challengeList.length; y++) {
			if (challengeLevel > 0) challengeLevel = Math.min(challengeLevel, game.c2[challengeList[y]]);
			else challengeLevel += game.c2[challengeList[y]];
		}

		const equipClass = setting && setting.enabled ? 'Equipped' : 'NotEquipped';

		rowData += `
			<div id='${item}Btn' class='btnItem btnItem${equipClass}' style='height: 1.5vw; max-width: ${elemWidth}; min-width: ${elemWidth}; margin-right: 0.1em; margin-left: 0.1em; margin-top: 0.1em; margin-bottom: 0.2em;' onclick='_hideAutomationToggleElem(this)' data-hidden-text="${item}">
				<span style="float: left;">${!displayZone && item === 'Trappapalooza' ? 'Trappa' : item}</span>
				<span style="float: right;">z${challengeLevel}${!displayZone ? ' (' + (100 * (challengeLevel / hze)).toFixed(2).replace(/\.00$/, '') + '%)' : ''}</span>
			</div>&nbsp;`;

		if (!displayZone) {
			rowData += `
			<div id ='${item}PercentDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
				<span id='${item}TextBox' class='textbox' style='text-align: left; height: 1.5vw; max-width: 9vw; min-width: 9vw; font-size: 0.7vw;' onclick='document.getElementById("${item}Percent").focus()'>Below HZE%:
				<input id='${item}Percent' type='number' step='1' value='${setting && Number.isInteger(setting.percent) ? setting.percent : 85}' min='0' max='100' placeholder='100' style='color: white;' onfocus='this.select()'>
				</span>
			</div>`;
		}

		rowData += `
			<div id ='${item}ZoneDiv' style='display: flex; align-items: center; margin-bottom: 0.1em;'>
				<span id='${item}TextBox' class='textbox' style='text-align: left; height: 1.5vw; max-width: 9vw; min-width: 9vw; font-size: 0.7vw;' onclick='document.getElementById("${item}Zone").focus()'>${displayZone ? 'Finish Zone:' : 'Finish HZE%:'}
				<input id='${item}Zone' type='number' step='1' value='${setting && Number.isInteger(setting[displayType]) ? setting[displayType] : displayZone ? 0 : 90}' min='0' max='${obsidianZone}' placeholder='0' style='color: white;' onfocus='this.select()'>
				</span>
			</div>`;

		total++;
	}

	tooltipText += `<div id='row${rows + 1}' style= 'display: flex;'>${rowData}</div>`;
	tooltipText += `</div>`;

	const costText = `
		<div class='maxCenter'>
			<div id='confirmTooltipBtn' class='btn btn-success btn-md' onclick='_c2RunnerSave()'>Save and Close</div>
			<div class='btn btn-danger btn-md' onclick='cancelTooltip()'>Cancel</div>
			<div class='btn btn-primary btn-md' onclick='_c2RunnerSave(); importExportTooltip("c2Runner")'>Save</div>
		</div>`;

	elem.style.left = '30.5%';
	elem.style.top = '25%';
	elem.classList = `tooltipExtraCustom60`;
	const ondisplay = () => _verticalCenterTooltip();

	return [elem, tooltipText, costText, ondisplay];
}

function _c2RunnerSave() {
	const setting = getPageSetting('c2RunnerSettings', atConfig.settingUniverse);
	const items = Array.from(document.getElementsByClassName('btnItem'));
	const checkZone = getPageSetting('c2RunnerMode', atConfig.settingUniverse) === 1;

	items.forEach((item) => {
		const name = item.dataset.hiddenText;
		setting[name] = setting[name] || {};
		setting[name].enabled = item.classList.contains('btnItemEquipped');

		const zoneElem = document.getElementById(name + 'Zone');
		const maxZone = checkZone ? getObsidianStart() : 100;
		let zone = parseInt(zoneElem.value, 10);
		if (zone > maxZone) zone = maxZone;
		if (zone < 0) zone = 0;
		zone = Number.isInteger(zone) ? zone : 0;

		if (!checkZone) {
			const percentElem = document.getElementById(name + 'Percent');
			let percent = parseInt(percentElem.value, 10);
			if (percent > 100) percent = 100;
			if (percent < 0) percent = 0;
			percent = Number.isInteger(percent) ? percent : 85;

			setting[name].percent = percent;
			setting[name].zone = setting[name].zone || 0;
			setting[name].zoneHZE = zone;
		} else {
			setting[name].percent = setting[name].percent || 85;
			setting[name].zone = zone;
			setting[name].zoneHZE = setting[name].zoneHZE || 0;
		}
	});

	setPageSetting('c2RunnerSettings', setting, atConfig.settingUniverse);
	cancelTooltip();

	if (getPageSetting('autoPortalTimeout')) {
		_settingTimeout('autoPortal');
	}
}

function hideAutomationDisplay(elem) {
	const msgs = getPageSetting('displayHideAutoButtons');
	const keys = ['fight', 'autoFight', 'trap', 'storage', 'structure', 'jobs', 'gold', 'upgrade', 'prestige', 'equip', 'recycleMaps'];
	const settingGroup = keys.reduce((obj, key) => {
		obj[key] = false;
		return obj;
	}, {});

	let tooltipText = "<div id='messageConfig'>Here you can select certain ingame (and AutoTrimps) buttons and messages you'd prefer to hide.<br>Mouse over the name of a filter for more info.</div>";

	tooltipText += `<div id='baseGameItems'>`;
	tooltipText += `<span class='messageConfigContainer' style='font-size: 1.3vw;'>&nbsp;Base Game Features</span></span><br/>`;

	let rowData = '';
	let rows = 0;
	let total = 0;
	for (let item in settingGroup) {
		if (item === 'enabled') continue;
		if (total > 0 && total % 5 === 0) {
			tooltipText += `<div id='row${rows}'>${rowData}</div>`;
			rowData = '';
			rows++;
		}

		const equipClass = msgs[item] ? 'Equipped' : 'NotEquipped';
		const addAuto = item.includes('ight') || item.includes('recycle') ? '' : 'Auto ';
		let realName = addAuto + (item.charAt(0).toUpperCase() + item.substr(1)).replace(/_/g, ' ');
		if (realName === 'AutoFight') realName = 'Auto Fight';
		if (realName === 'RecycleMaps') realName = 'Recycle Maps';

		rowData += `
			<div class='btnItem btnItem${equipClass}' onclick='_hideAutomationToggleElem(this)' data-hidden-text="${item}" <span onmouseover='_hideAutomationHover("${item}", event)' onmouseout='_hideAutomationHover("hide", event)'>
				<span>${realName}</span>
			</div>`;
		total++;
	}
	rows++;
	tooltipText += `<div id='row${rows}'>${rowData}</div>`;
	tooltipText += `</div>`;
	tooltipText += `</div>`;

	tooltipText += `<div id='autoTrimpsItems'>`;
	tooltipText += `<span class='messageConfigContainer' style='font-size: 1.3vw;'>&nbsp;AutoTrimps Features</span></span><br/>`;
	const atKeys = ['structure', 'jobs', 'equip', 'maps', 'status', 'heHr'];
	const atSettingGroup = atKeys.reduce((obj, key) => {
		obj[key] = false;
		return obj;
	}, {});

	rowData = '';
	rows = 0;
	total = 0;
	for (let item in atSettingGroup) {
		if (item === 'enabled') continue;
		if (total > 0 && total % 5 === 0) {
			tooltipText += `<div id='row${rows}'>${rowData}</div>`;
			rowData = '';
			rows++;
		}

		const equipClass = msgs[`AT${item}`] ? 'Equipped' : 'NotEquipped';
		let realName = 'Auto ' + (item.charAt(0).toUpperCase() + item.substr(1)).replace(/_/g, ' ');
		if (item === 'status') realName = 'Auto Maps Status';
		if (item === 'heHr') realName = `${heliumOrRadon()} Per Hour Status`;

		rowData += `
			<div class='btnItem btnItem${equipClass}' onclick='_hideAutomationToggleElem(this)' data-hidden-text="AT${item}" <span onmouseover='_hideAutomationHover("AT${item}", event)' onmouseout='_hideAutomationHover("hide", event)'>
				<span>${realName}</span>
			</div>`;
		total++;
	}
	rows++;
	tooltipText += `<div id='row${rows}'>${rowData}</div>`;
	tooltipText += `</div>`;
	tooltipText += `</div>`;

	const ondisplay = function () {
		_verticalCenterTooltip(true);
	};

	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	const costText = `
		<div class='maxCenter'>
			<div id='confirmTooltipBtn' class='btn btn-success btn-md' onclick='_hideAutomationSave()'>Save and Close</div>
			<div class='btn btn-danger btn-md' onclick='cancelTooltip()'>Cancel</div>
			<div class='btn btn-primary btn-md' onclick='_hideAutomationSave(); importExportTooltip("hideAutomation")'>Save</div>
		</div>`;

	return [elem, tooltipText, costText, ondisplay];
}

function _hideAutomationToggleElem(element) {
	const elemPrefix = `btnItem`;

	element.classList.toggle(`${elemPrefix}Equipped`);
	element.classList.toggle(`${elemPrefix}NotEquipped`);
}

function _hideAutomationHover(what, event, hide = false) {
	const tipTitle = document.getElementById('tipTitle');
	if (tipTitle.innerHTML !== 'Message Config') return;

	if (tipTitle === 'Hide') {
		cancelTooltip();
		return;
	}

	const messageConfigMap = {
		hide: { title: 'Hide', text: "Here you can finely tune ingame automation buttons  you'd prefer to hide. Mouse over the name of a filter for more info." },
		fight: { title: 'Fight', text: 'Hides the games Fight button.' },
		autoFight: { title: 'Auto Fight', text: 'Hides the games AutoFight button.' },
		trap: { title: 'Auto Traps', text: 'Hides the games AutoTraps button.' },
		storage: { title: 'Auto Storage', text: 'Hides the games AutoStorage button.' },
		structure: { title: 'Auto Structure', text: 'Hides the games AutoStructure button.' },
		jobs: { title: 'Auto Jobs', text: 'Hides the games AutoJobs button.' },
		gold: { title: 'Auto Gold', text: 'Hides the games AutoGold button.' },
		geneticistassist: { title: 'Geneticistassist', text: 'Hides the games Geneticistassist button.' },
		upgrade: { title: 'Auto Upgrade', text: 'Hides the games AutoUpgrade button.' },
		prestige: { title: 'Auto Prestige', text: 'Hides the games AutoPrestige button.' },
		equip: { title: 'Auto Equip', text: 'Hides the games AutoEquip button.' },
		recycleMaps: { title: 'Recycle Maps', text: 'Hides Recycle Maps messages in the message log.' },
		ATstructure: { title: 'Auto Structure', text: 'Hides the AT Auto Structure button.' },
		ATjobs: { title: 'Auto Jobs', text: 'Hides the AT Auto Jobs button.' },
		ATequip: { title: 'Auto Equip', text: 'Hides the AT Auto Equip button.' },
		ATmaps: { title: 'Auto Maps', text: 'Hides the Auto Maps button.' },
		ATstatus: { title: 'Auto Maps Status', text: 'Hides the AutoTrimps Map Status message.' },
		ATheHr: { title: `${heliumOrRadon()} Per Hour Status`, text: `Hides the ${heliumOrRadon()} Per Hour Status message.` }
	};

	const config = messageConfigMap[what];
	if (!config) return;

	if (what === 'hide') document.getElementById('messageConfig').innerHTML = `${config.text}`;
	else document.getElementById('messageConfig').innerHTML = `<b>${config.title}</b><br>${config.text}`;
	tooltip(config.title, 'customText', event, config.text);
}

function _hideAutomationSave() {
	const setting = getPageSetting('displayHideAutoButtons');
	const items = Array.from(document.getElementsByClassName('btnItem'));

	items.forEach((item) => {
		setting[item.dataset.hiddenText] = item.classList.contains('btnItemEquipped');
	});

	setPageSetting('displayHideAutoButtons', setting);
	saveSettings();
	cancelTooltip();

	_hideAutomationButtons();
}

function _hideAutomationButtons() {
	const setting = getPageSetting('displayHideAutoButtons');

	const automationUnlocked = {
		fight: game.upgrades.Battle.done,
		trap: game.upgrades.Trapstorm.done,
		storage: game.global.autoStorageAvailable,
		structure: bwRewardUnlocked('AutoStructure'),
		jobs: bwRewardUnlocked('AutoJobs'),
		geneticistassist: bwRewardUnlocked('Geneticistassist'),
		gold: game.stats.goldenUpgrades.valueTotal + game.stats.goldenUpgrades.value >= 77,
		upgrade: game.global.autoUpgradesAvailable,
		prestige: game.global.sLevel >= 4,
		equip: game.global.autoEquipUnlocked,
		recycleMaps: false,
		ATstructure: true,
		ATjobs: true,
		ATequip: true,
		ATmaps: true,
		ATstatus: true,
		ATheHr: true
	};

	for (let item in setting) {
		if (!automationUnlocked[item]) continue;

		if (item === 'fight') {
			_setFightButtons(setting);
			continue;
		}

		const itemName = `${item.charAt(0).toUpperCase() + item.substr(1)}${item === 'gold' ? 'en' : ''}`;
		let elemName = `auto${itemName}Btn`;

		if (item === 'ATmaps') elemName = 'autoMapBtn';
		else if (item === 'ATstatus') elemName = 'autoMapStatus';
		else if (item === 'ATheHr') elemName = 'heHrStatus';
		else if (item.includes('AT')) elemName = `auto${item.charAt(2).toUpperCase() + itemName.substr(3)}Parent`;

		const elem = document.getElementById(elemName);
		let elemVisible = setting[item] ? 'hidden' : '';

		if (['autoMapStatus', 'heHrStatus'].includes(elemName)) {
			elemVisible = !setting[item] ? 'block' : 'none';
			if (elem && elem.style.display !== elemVisible) elem.style.display = elemVisible;
		} else {
			if (elem && elem.style.visibility !== elemVisible) elem.style.visibility = elemVisible;
		}
	}
}
