function MAZLookalike(titleText, varPrefix, event) {
	if (document.getElementById('tooltipDiv').classList.value !== '' && !document.getElementById('tooltipDiv').classList[0].includes('tooltipWindow')) cancelTooltip();
	var titleText = !titleText ? 'undefined' : titleText;
	var varPrefix = !varPrefix ? 'undefined' : varPrefix;

	if (titleText === 'undefined' || varPrefix === 'undefined')
		return;

	var elem = document.getElementById("tooltipDiv");
	if (event !== 'MAZ') {
		swapClass("tooltipExtra", "tooltipExtraNone", elem);
	}
	document.getElementById('tipText').className = "";
	MODULES.popups.mazWindowOpen = true;

	var tooltipText;
	var costText = "";
	var titleText;

	var ondisplay = null; // if non-null, called after the tooltip is displayed

	//AutoJobs
	if (event === 'AutoJobs') {

		const ratio = "<p>The left side of this window is dedicated to jobs that are limited more by workspaces than resources. 1:1:1 will purchase all 3 of these ratio-based jobs evenly, and the ratio refers to the amount of workspaces you wish to dedicate to each job. Any number that's 0 or below will stop AT hiring any workers for that job. Scientists will be hired based on a ratio that is determined by how far you are into the game, the further you get the less Scientists will be hired.</p>";
		const percent = "<p>The right side of this window is dedicated to jobs limited more by resources than workspaces. Set the percentage of resources that you'd like to be spent on each job.</p>";
		const magmamancer = "<p><b>Magmamancers:</b> These will only be hired when they'll do something! So once the time spent on the zone is enough to activate the first metal boost.</p>";
		const farmersUntil = "<p><b>Farmers Until:</b> Stops buying Farmers from this zone. The Tribute & Worshipper farm settings override this setting and hire farmers during them.</p>";
		const lumberjackMP = "<p><b>No Lumberjacks Post MP:</b> Stops buying Lumberjacks after Melting Point has been run. The Smithy Farm setting will override this setting.</p>";

		var autoRatios = "<p><b>AutoRatios\</b>\
		<br><b>Running " + (portalUniverse === 2 ? "Transmute" : "Metal") + " will override these values and use 4/5/0.</b>\
		<br><b>1/1/1</b> Up until 300k trimps.\
		<br><b>3/3/5</b> Up until 3mil trimps. \
		<br><b>3/1/4</b> When above 3 mil trimps. \
		<br><b>1/1/10</b> When above 1000 tributes. \
		<br><b>1/2/22</b> When above 1500 tributes. \
		<br><b>1/7/12</b> When above 3000 tributes and at or above z230.\
		<br><b>1/1/98</b> When at or above z300.";
		if (game.global.universe === 2) autoRatios += "<br><b>1/1/1</b> When using a Hazardous or better heirloom.\</p>";
		autoRatios += "</p>";
		tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Auto Job Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'>\ ";

		tooltipText += `${ratio}`;
		tooltipText += `${percent}`;
		if (game.global.universe === 1 && game.stats.highestLevel.valueTotal() >= 230) tooltipText += `${magmamancer}`;
		if (game.global.universe === 2) tooltipText += `${farmersUntil}`;
		if (game.global.universe === 2) tooltipText += `${lumberjackMP}`;
		tooltipText += `${autoRatios}`;
		tooltipText += "</div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";
		var percentJobs = ["Explorer"];
		if (game.global.universe === 1) percentJobs.push("Trainer");
		if (game.global.universe === 1 && game.stats.highestLevel.valueTotal() >= 230) percentJobs.push("Magmamancer");
		if (game.global.universe === 2 && game.stats.highestRadLevel.valueTotal() >= 30) percentJobs.push("Meteorologist");
		if (game.global.universe === 2 && game.stats.highestRadLevel.valueTotal() >= 50) percentJobs.push("Worshipper");
		var ratioJobs = ["Farmer", "Lumberjack", "Miner"];
		var settingGroup = getPageSetting('jobSettingsArray');
		for (var x = 0; x < ratioJobs.length; x++) {
			tooltipText += "<tr>";
			var item = ratioJobs[x];
			var setting = settingGroup[item];
			var max;
			var checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', (setting && setting.enabled));
			tooltipText += "<td style='width: 40%'><div class='row'><div class='col-xs-6' style='padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + item + "</span></div><div class='col-xs-6 lowPad' style='text-align: right'>Ratio: <input class='jobConfigQuantity' id='autoJobQuant" + item + "' type='number' value='" + ((setting && setting.ratio >= 0) ? setting.ratio : 0) + "' /></div></div>";
			tooltipText += "</td>";
			if (percentJobs.length > x) {
				item = percentJobs[x];
				setting = settingGroup[item];
				max = ((setting && setting.buyMax) ? setting.buyMax : 0);
				if (max > 1e4) max = max.toExponential().replace('+', '');
				checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', (setting && setting.enabled));
				tooltipText += "<td style='width: 60%'><div class='row'><div class='col-xs-6' style='padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + item + "</span></div><div class='col-xs-6 lowPad' style='text-align: right'>Percent: <input class='jobConfigQuantity' id='autoJobQuant" + item + "' type='number' value='" + ((setting && setting.percent) ? setting.percent : 100) + "' /></div></div>";
			}
			if (game.global.universe === 2) {
				if (x === ratioJobs.length - 1) tooltipText += "<tr><td style='width: 40%'><div class='row'><div class='col-xs-6' style='padding-right: 5px'>" + buildNiceCheckbox('autoJobCheckboxFarmersUntil', 'autoCheckbox', (settingGroup.FarmersUntil.enabled)) + "&nbsp;&nbsp;<span>" + "Farmers Until</span></div><div class='col-xs-6 lowPad' style='text-align: right'>Zone: <input class='jobConfigQuantity' id='FarmersUntilZone' type='number' value='" + ((settingGroup.FarmersUntil.zone) ? settingGroup.FarmersUntil.zone : 999) + "' /></div></div></td>";
				if (x === ratioJobs.length - 1) tooltipText += "<td style='width: 60%'><div class='row'><div class='col-xs-6' style='padding-right: 1px'>" + buildNiceCheckbox('autoJobCheckboxNoLumberjacks', 'autoCheckbox', (settingGroup.NoLumberjacks.enabled)) + "&nbsp;&nbsp;<span>" + "No Lumberjacks Post MP</span></div></td></tr>";
			}
		}
		var values = ['AutoJobs Off', 'Auto Ratios', 'Manual Ratios'];
		tooltipText += "<tr><td style='width: 40%'><div class='col-xs-6' style='padding-right: 5px'>Setting on Portal:</div><div class='col-xs-6 lowPad' style='text-align: right'><select style='width: 100%' id='autoJobSelfGather'><option value='0'>No change</option>";
		for (var x = 0; x < values.length; x++) {
			tooltipText += "<option" + ((settingGroup.portalOption && settingGroup.portalOption === values[x].toLowerCase()) ? " selected='selected'" : "") + " value='" + values[x].toLowerCase() + "'>" + values[x] + "</option>";
		}

		tooltipText += "</div></td></tr>";
		tooltipText += "</tbody></table>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn-lg btn btn-info' onclick='saveATAutoJobsConfig()'>Apply</div><div class='btn btn-lg btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";

		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		ondisplay = function () {
			verticalCenterTooltip(true);
		};
	}

	//AutoStructure
	else if (event === "AutoStructure") {

		const baseText = "<p>Here you can choose which structures will be automatically purchased when AutoStructure is toggled on. Check a box to enable the automatic purchasing of that structure, the 'Perc:' box specifies the cost-to-resource % that the structure should be purchased below, and set the 'Up To:' box to the maximum number of that structure you'd like purchased <b>(0&nbsp;for&nbsp;no&nbsp;limit)</b>. For example, setting the 'Perc:' box to 10 and the 'Up To:' box to 50 for 'House' will cause a House to be automatically purchased whenever the costs of the next house are less than 10% of your Food, Metal, and Wood, as long as you have less than 50 houses.</p>";
		const nursery = "<p><b>Nursery:</b> Acts the same as the other settings but also has a 'From' input which will cause nurseries to only be built from that zone onwards. Spire nursery settings within AT will ignore this start zone if needed for them to work. If 'Advanced Nurseries' is enabled and 'Up To' is set to 0 it will override buying max available and instead respect the input.</p>";
		const warpstation = "<p><b>Warpstation:</b> Settings for this type of building can be found in the AutoTrimp settings building tab!</p>";
		const safeGateway = "<p><b>Safe Gateway:</b> Will stop purchasing Gateways when your owned fragments are lower than the cost of the amount of maps you input in the 'Maps' field times by what a Perfect +10 LMC map would cost up to the zone specified in 'Till Z:', if that value is 0 it'll assume z999.</p>";

		tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Auto Structure Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'>";
		tooltipText += `${baseText}`;
		if (game.global.universe === 1 && game.stats.highestLevel.valueTotal() >= 230) tooltipText += `${nursery}`;
		if (game.global.universe === 1 && game.stats.highestLevel.valueTotal() >= 60) tooltipText += `${warpstation}`;
		if (game.global.universe === 2) tooltipText += `${safeGateway}`;
		tooltipText += "</div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";

		var count = 0;
		var setting, checkbox;
		var settingGroup = getPageSetting('buildingSettingsArray');
		for (var item in game.buildings) {
			var building = game.buildings[item];
			if (building.blockU2 && game.global.universe === 2) continue;
			if (building.blockU1 && game.global.universe === 1) continue;
			if (item === 'Warpstation') continue;
			if (item === 'Laboratory' && game.stats.highestRadLevel.valueTotal() < 130) continue;
			if (item === 'Antenna' && game.buildings[item].locked) continue;
			if (!building.AP && item !== 'Antenna') continue;
			if (count !== 0 && count % 2 === 0) tooltipText += "</tr><tr>";
			setting = settingGroup[item];
			checkbox = buildNiceCheckbox('structConfig' + item, 'autoCheckbox', (setting && setting.enabled));

			//Start
			tooltipText += "<td><div class='row'>"
			//Checkbox & name
			tooltipText += "<div class='col-xs-3' style='width: 34%; padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + item + "</span></div>";
			//Percent options
			tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>Perc: <input class='structConfigPercent' id='structPercent" + item + "' type='number' value='" + ((setting && setting.percent) ? setting.percent : 100) + "' /></div>";
			//Max options
			tooltipText += "<div class='col-xs-5' style='width: 33%; padding-left: 5px; text-align: right'>Up to: <input class='structConfigQuantity' id='structMax" + item + "' type='number' value='" + ((setting && setting.buyMax) ? setting.buyMax : 0) + "' /></div>";
			//Finish
			tooltipText += "</div></td>";
			count++;
		}
		tooltipText += "</tr><tr>";

		//Nursery Start Zone setting after reaching Magma
		if (game.global.universe === 1 && game.stats.highestLevel.valueTotal() >= 230) {
			//Start
			tooltipText += "<td><div class='row'>"
			//Checkbox & name
			tooltipText += "<div class='col-xs-3' style='width: 34%; padding-right: 5px'>" + "&nbsp;&nbsp;<span>" + 'Nursery (cont)' + "</span></div>";
			tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>From: <input class='structConfigQuantity' id='nurseryFromZ" + "' type='number' value='" + ((settingGroup.Nursery && settingGroup.Nursery.fromZ) ? settingGroup.Nursery.fromZ : 0) + "' /></div>";

		}
		//Safe Gateway setting for u2
		if (game.global.universe === 2) {
			tooltipText += "<td><div class='row'><div class='col-xs-3' style='width: 34%; style='padding-right: 5px'>" + buildNiceCheckbox('structConfigSafeGateway', 'autoCheckbox', (typeof (settingGroup.SafeGateway) === 'undefined' ? false : settingGroup.SafeGateway.enabled)) + "&nbsp;&nbsp;<span>" + "Safe Gateway" + "</span></div>";
			tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>Maps: <input class='structConfigQuantity' id='structMapCountSafeGateway" + "' type='number' value='" + ((settingGroup.SafeGateway && settingGroup.SafeGateway.mapCount) ? settingGroup.SafeGateway.mapCount : 0) + "' /></div>";
			tooltipText += "<div class='col-xs-5' style='width: 33%; padding-left: 5px; text-align: right'>Till Z: <input class='structConfigPercent' id='structMax" + item + "' type='number' value='" + ((settingGroup.SafeGateway && settingGroup.SafeGateway.zone) ? settingGroup.SafeGateway.zone : 0) + "' /></div>";
			tooltipText += "</div></td>";
		}
		//On Portal Settings
		var values = ['Off', 'On'];
		tooltipText += "<td><div class='row'><div class='col-xs-3' style='width: 34%; style=' padding-right: 5px'> Setting on Portal:" + "</span></div>";
		tooltipText += "<div class='col-xs-5 style=' width: 33%; padding-left: 5px; text-align: right'><select style='width: 70%' id='autoJobSelfGather'><option value='0'>No change</option>";
		for (var x = 0; x < values.length; x++) {
			tooltipText += "<option" + ((settingGroup.portalOption && settingGroup.portalOption === values[x].toLowerCase()) ? " selected='selected'" : "") + " value='" + values[x].toLowerCase() + "'>" + values[x] + "</option>";
		}

		tooltipText += "</tr><tr>";
		tooltipText += "</tr></tbody></table > ";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info btn-lg' onclick='saveATAutoStructureConfig()'>Apply</div><div class='btn-lg btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
		game.global.lockTooltip = true;
		ondisplay = function () {
			verticalCenterTooltip(false, true);
		};
	}

	//Map tab - Special Maps!
	else if (event === "UniqueMaps") {
		const baseText = "<p>Here you can choose which special maps you'd like to run throughout your runs. Each special map will have a Zone & Cell box to identify where you would like to run the map on the specified zone. If the map isn't run on your specified zone it will be run on any zone after the one you input. If there's a map you don't own and you want to run that drops in maps then the script will now run one to obtain it.</p>";
		const smithy = "<p>The right side of this window is dedicated to running Melting Point when you've reached a certain Smithy value. As each runtype of vastly different there's different inputs for each type of run that you can do! Certain challenges have overrides for this, once unlocked they can be found in the C3 tab.</p>";

		tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Unique Map Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'>";
		tooltipText += `${baseText}`;
		if (currSettingUniverse === 2 && game.stats.highestRadLevel.valueTotal() >= 50) tooltipText += `${smithy}`;
		tooltipText += "</div><table id='autoPurchaseConfigTable' style='font-size: 1.1vw;'><tbody>";

		var count = 0;
		var setting, checkbox;
		var settingGroup = getPageSetting('uniqueMapSettingsArray', currSettingUniverse);

		var smithySettings = [];

		if (currSettingUniverse === 1) {
			var mapUnlocks = [
				'The Block', 'The Wall', 'Dimension of Anger'
			]
			if (game.stats.highestLevel.valueTotal() >= 33) mapUnlocks.push("Trimple Of Doom");
			if (game.stats.highestLevel.valueTotal() >= 80) mapUnlocks.push("The Prison");
			if (game.stats.highestLevel.valueTotal() >= 170) mapUnlocks.push("Imploding Star");
		}

		if (currSettingUniverse === 2) {
			//Adding in the U2 Unique Maps if they've been unlocked.
			var mapUnlocks = [
				'Big Wall', 'Dimension of Rage', 'Prismatic Palace'
			]

			if (game.stats.highestRadLevel.valueTotal() >= 33) mapUnlocks.push("Atlantrimp");
			if (game.stats.highestRadLevel.valueTotal() >= 50) mapUnlocks.push("Melting Point");
			if (game.stats.highestRadLevel.valueTotal() >= 175) mapUnlocks.push("Frozen Castle");


			//Adding in Smithy Settings if in u2
			if (game.stats.highestRadLevel.valueTotal() >= 50) smithySettings.push("MP Smithy");
			if (game.stats.highestRadLevel.valueTotal() >= 50) smithySettings.push("MP Smithy_Daily");
			if (game.stats.highestRadLevel.valueTotal() >= 50) smithySettings.push("MP Smithy_C3");
		}

		for (var x = 0; x < mapUnlocks.length; x++) {
			tooltipText += "<tr>";
			var item = mapUnlocks[x];
			var setting = settingGroup[item];
			//U1
			if (item === 'Trimple Of Doom' && game.stats.highestLevel.valueTotal() < 33) continue;
			if (item === 'The Prison' && game.stats.highestLevel.valueTotal() < 80) continue;
			if (item === 'Imploding Star' && game.stats.highestLevel.valueTotal() < 170) continue;
			//U2
			if (item === 'Atlantrimp' && game.stats.highestRadLevel.valueTotal() < 33) continue;
			if (item === 'Melting Point' && game.stats.highestRadLevel.valueTotal() < 50) continue;
			if (item.includes('Smithy') && game.stats.highestRadLevel.valueTotal() < 50) continue;
			var max;
			var checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', (setting && setting.enabled));

			item = mapUnlocks[x];
			setting = settingGroup[item];
			max = ((setting && setting.buyMax) ? setting.buyMax : 0);
			if (max > 1e4) max = max.toExponential().replace('+', '');

			//Checkbox
			checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', (setting && setting.enabled));

			//Start
			tooltipText += "<td><div class='row'>"
			//Checkbox & name
			tooltipText += "<div class='col-xs-3' style='width: 34%; padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + item.replace(/_/g, '&nbsp;<span>') + "</span></div>";
			//Zone options
			tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>Zone: <input class='structConfigZone' id='structPercent" + item + "' type='number'  value='" + ((setting && setting.zone) ? setting.zone : 999) + "'/></div>";
			//Cell options
			tooltipText += "<div class='col-xs-5' style='width: 33%; padding-left: 5px; text-align: right'>Cell: <input class='structConfigCell' id='structMax" + item + "' type='number'  value='" + ((setting && setting.cell) ? setting.cell : 0) + "'/></div>";
			//Finish
			tooltipText += "</div></td>";

			if (smithySettings.length > x) {
				item = smithySettings[x];
				setting = settingGroup[item];
				checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', (setting && setting.enabled));
				tooltipText += "<td style='width: 40%'><div class='row'><div class='col-xs-6' style='padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + item.replace(/_/g, '&nbsp;<span>') + "</span></div><div class='col-xs-6 lowPad' style='text-align: right'>Value: <input class='jobConfigQuantity' id='uniqueMapValue" + item + "' type='number'  value='" + ((setting && setting.value) ? setting.value : 1) + "'/></div></div>";
			}
			else {
				tooltipText += "<tr>";
			}
		}

		tooltipText += "</tr><tr>";
		tooltipText += "</tr></tbody></table>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info btn-lg' onclick='saveATUniqueMapsConfig(\"" + event + "\")'>Apply</div><div class='btn-lg btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
		game.global.lockTooltip = true;
		ondisplay = function () {
			verticalCenterTooltip((smithySettings.length > 0 ? false : true), (smithySettings.length > 0 ? true : false));
		};
	}

	else if (event === "MessageConfig") {
		tooltipText = "<div id='messageConfig'>Here you can finely tune your message settings. Mouse over the name of a filter for more info.</div>";
		var value = 'value';
		if (game.global.universe === 2) value += 'U2';

		var settingGroup = {
			general: false,
			fragment: false,
			upgrades: false,
			equipment: false,
			maps: false,
			map_Details: false,
			map_Destacking: false,
			map_Skip: false,
			other: false,
			buildings: false,
			jobs: false,
			zone: false,
			exotic: false,
			gather: false,
			stance: false,
			run_Stats: false,
			nature: false,
		};

		var msgs = autoTrimpSettings.spamMessages.value;

		tooltipText += "<div class='row'>";
		for (var x = 0; x < 1; x++) {
			tooltipText += "<div class='col-xs-4'></span><br/>";
			for (var item in settingGroup) {
				if (item === 'enabled') continue;
				var realName = item.charAt(0).toUpperCase() + item.substr(1);
				realName = realName.replace(/_/g, ' ');
				tooltipText += "<span class='messageConfigContainer'><span class='messageCheckboxHolder'>" + buildNiceCheckbox(item, 'messageConfigCheckbox', (msgs[item])) + "</span><span onmouseover='messageConfigHoverAT(\"" + item + "\", event)' onmouseout='tooltip(\"hide\")' class='messageNameHolderAT'> - " + realName + "</span></span><br/>";
			}
			tooltipText += "</div>";
		}
		tooltipText += "</div>";
		ondisplay = function () { verticalCenterTooltip(); };
		game.global.lockTooltip = true;
		elem.style.top = "25%";
		elem.style.left = "35%";
		swapClass('tooltipExtra', 'tooltipLg', elem);
		costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip();configMessagesAT();'>Confirm</div> <div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
	}

	//Daily Auto Portal
	else if (event === "DailyAutoPortal") {

		const baseText = "<p>Here you can choose different portal zones depending on specific modifiers that the daily you're running has. For example if your Daily has a resource empower modifier and you have '-3' input in that box then it will set both your void map zone and daily portal zone to 3 zones lower than your settings. Will only ever use the lowest value that is listed so you can't do a combination of -6 for dailies that have both Empower and Famine by doing a -3 in each box.</p>";

		const reflect = "<p><b>Reflect:</b> % damage reflect damage modifier</p>";
		const empower = "<p><b>Empower:</b> Empower modifier</p>";
		const mutimp = "<p><b>Mutimp:</b> % chance to turn enemies into Mutimps</p>";
		const bloodthirst = "<p><b>Bloodthirst:</b> Enemies gaining the bloodthirst buff on kills</p>";
		const famine = "<p><b>Famine:</b> Gives % less resources</p>";
		const large = "<p><b>Large:</b> Gives % less housing</p>";
		const weakness = "<p><b>Weakness:</b> Gives % less attack when trimps attack</p>";
		const empoweredVoid = "<p><b>Empowered Void:</b> Enemies gain a % health & damage increase inside void maps</p>";
		const heirlost = "<p><b>Heirlost:</b> % bonus reduction on your heirlooms</p>";

		tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Daily Auto Portal Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'>";
		tooltipText += `${baseText}`;

		if (currSettingUniverse === 1) tooltipText += `${reflect}`;
		tooltipText += `${empower}`;
		tooltipText += `${mutimp}`;
		tooltipText += `${bloodthirst}`;
		tooltipText += `${famine}`;
		tooltipText += `${large}`;
		tooltipText += `${weakness}`;
		if (currSettingUniverse === 2) tooltipText += `${empoweredVoid}`;
		if (currSettingUniverse === 2) tooltipText += `${heirlost}`;

		tooltipText += "</p></div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";

		var count = 0;
		var setting, checkbox;
		var setting_AT = getPageSetting('dailyPortalSettingsArray', currSettingUniverse);

		var settingGroup = {
			Reflect: {},
			Empower: {},
			Mutimp: {},
			Bloodthirst: {},
			Famine: {},
			Large: {},
			Weakness: {},
			Empowered_Void: {},
			Heirlost: {},
		};

		//Skip Lines to seperate
		tooltipText += "<td><div class='row'><div class='col-xs-3' style='width: 100%; padding-right: 5px'>" + "" + "&nbsp;&nbsp;<span>" + "<u>Modifier ± Zones</u>" + "</span></div></div>";
		tooltipText += "</td></tr><tr>";

		//Plus&Minus Portal&Void zone settings.
		for (var item in settingGroup) {
			if (currSettingUniverse === 1 && item === 'Empowered_Void') continue;
			if (currSettingUniverse === 1 && item === 'Heirlost') continue;
			if (currSettingUniverse === 2 && item === 'Reflect') continue;
			if (count !== 0 && count % 2 === 0) tooltipText += "</tr><tr>";
			setting = setting_AT[item];
			checkbox = buildNiceCheckbox('structConfig' + item, 'autoCheckbox', (setting && setting.enabled));
			var itemName = item.charAt(0).toUpperCase() + item.substr(1);
			itemName = itemName.replace(/_/g, ' ');
			//Start
			tooltipText += "<td><div class='row'>"
			//Checkbox & name
			tooltipText += "<div class='col-xs-6' style='width: 52%; padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + itemName + "</span></div>";
			//Zone options
			tooltipText += "<div class='col-xs-6' style='width: 48%; text-align: right'>± Zone: <input class='structConfigPercent' id='structZone" + item + "' type='number'  value='" + ((setting && setting.zone) ? setting.zone : 0) + "'/></div>";
			//Finish
			tooltipText += "</div></td>";
			count++;
		}
		tooltipText += "</tr>";
		tooltipText += "</div></td></tr>";
		tooltipText += "</tbody></table>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn-lg btn btn-info' onclick='saveATDailyAutoPortalConfig()'>Apply</div><div class='btn btn-lg btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		ondisplay = function () {
			verticalCenterTooltip(true);
		};
	}

	//C2/C3 Runner settings
	else if (event === "c2Runner") {
		const baseText = "Here you can enable the challenges you would like " + cinf() + " runner to complete and the zone you'd like the respective challenge to finish at and it will start them on the next auto portal if necessary.";
		const fusedText = autoTrimpSettings['c2Fused'].universe.indexOf(currSettingUniverse) !== -1 ? " If the 'Fused " + cinf() + "s' setting is enabled it will show Fused challenges and prioritise running them over their regular counterparts." : "";

		tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to " + cinf() + " Runner Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp(); document.getElementById(\"tooltipDiv\").style.top = \"25%\";'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'>";
		tooltipText += `<p>${baseText}${fusedText}</p>`;
		tooltipText += "</div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";

		//Skip Lines to seperate
		tooltipText += "</td></tr><tr>";
		//Setup challenges that will be displayed
		var count = 0;
		var setting, checkbox;
		var settingGroup = {};
		var fusedChallenges = {};

		if (currSettingUniverse === 1) {
			var highestZone = game.stats.highestLevel.valueTotal();
			if (getTotalPerkResource(true) >= 30) settingGroup.Discipline = {};
			if (highestZone >= 25) settingGroup.Metal = {};
			if (highestZone >= 35) settingGroup.Size = {};
			if (highestZone >= 40) settingGroup.Balance = {};
			if (highestZone >= 45) settingGroup.Meditate = {};
			if (highestZone >= 60) settingGroup.Trimp = {};
			if (highestZone >= 70) settingGroup.Trapper = {};
			if (game.global.prisonClear >= 1) settingGroup.Electricity = {};
			if (highestZone >= 120) settingGroup.Coordinate = {};
			if (highestZone >= 130) settingGroup.Slow = {};
			if (highestZone >= 145) settingGroup.Nom = {};
			if (highestZone >= 150) settingGroup.Mapology = {};
			if (highestZone >= 165) settingGroup.Toxicity = {};
			if (highestZone >= 180) settingGroup.Watch = {};
			if (highestZone >= 180) settingGroup.Lead = {};
			if (highestZone >= 425) settingGroup.Obliterated = {};
			if (game.global.totalSquaredReward >= 4500) settingGroup.Eradicated = {};
			//Fused C2s
			if (getPageSetting('c2Fused', currSettingUniverse)) {
				if (highestZone >= 45) fusedChallenges.Enlightened = {};
				if (highestZone >= 180) fusedChallenges.Waze = {};
				if (highestZone >= 180) fusedChallenges.Toxad = {};
				if (highestZone >= 130) fusedChallenges.Paralysis = {};
				if (highestZone >= 145) fusedChallenges.Nometal = {};
				if (highestZone >= 150) fusedChallenges.Topology = {};
			}
		}
		else if (currSettingUniverse === 2) {
			var highestZone = game.stats.highestRadLevel.valueTotal();
			if (highestZone >= 15) settingGroup.Unlucky = {};
			if (highestZone >= 20) settingGroup.Downsize = {};
			if (highestZone >= 25) settingGroup.Transmute = {};
			if (highestZone >= 35) settingGroup.Unbalance = {};
			if (highestZone >= 45) settingGroup.Duel = {};
			if (highestZone >= 60) settingGroup.Trappapalooza = {};
			if (highestZone >= 70) settingGroup.Wither = {};
			if (highestZone >= 85) settingGroup.Quest = {};
			if (highestZone >= 105) settingGroup.Storm = {};
			if (highestZone >= 115) settingGroup.Berserk = {};
			if (highestZone >= 175) settingGroup.Glass = {};
			if (highestZone >= 201) settingGroup.Smithless = {};
		}

		const headerNames = ['Challenge', 'Current Zone', 'End Zone'];

		for (var y = 0; y < 2; y++) {
			tooltipText += "<td><div class='row'>";
			tooltipText += "<div class='col-xs-3' style='width: 33%; padding-right: 5px;  white-space: nowrap'>" + "<span>" + "<u>" + headerNames[0] + "</u>" + "</span></div>";
			tooltipText += "<div class='col-xs-3' style='width: 33%; padding-right: 5px;text-align: center; white-space: nowrap'>" + "<span>" + "<u>" + headerNames[1] + "</u>" + "</span></div>";
			tooltipText += "<div class='col-xs-5' style='width: 34%; padding-left: 5px; text-align: right; white-space: nowrap'>" + "<span>" + "<u>" + headerNames[2] + "</u>" + "&nbsp;&nbsp;</span></div>";
			tooltipText += "</div></td>";
		}

		tooltipText += "</tr><tr>";
		for (var item in settingGroup) {
			if (count !== 0 && count % 2 === 0) tooltipText += "</tr><tr>";
			setting = getPageSetting('c2RunnerSettings', currSettingUniverse)[item] !== 'undefined' ?
				getPageSetting('c2RunnerSettings', currSettingUniverse)[item] :
				setting = (item = { enabled: false, zone: 0 });
			checkbox = buildNiceCheckbox('structConfig' + item, 'autoCheckbox', (setting && setting.enabled));
			var itemName = item;
			//Start
			tooltipText += "<td><div class='row'>";

			//Checkbox & name
			tooltipText += "<div class='col-xs-3' style='width: 33%; padding-right: 5px; white-space: nowrap'>" + checkbox + "&nbsp;&nbsp;<span>" + itemName + "</span></div>";
			//Challenges current zone
			tooltipText += "<div class='col-xs-3' style='width: 33%; padding-right: 5px;text-align: center;  white-space: nowrap'>" + game.c2[itemName] + "</span></div>";
			//Zone input
			tooltipText += "<div class='col-xs-5' style='width: 34%; padding-left: 5px; text-align: right; white-space: nowrap'><input class='structConfigPercent' id='structZone" + item + "' type='number'  value='" + ((setting && setting.zone) ? setting.zone : 0) + "'/></div>";
			//Finish
			tooltipText += "</div></td>";
			count++;
		}
		tooltipText += "</tr>";

		if (Object.keys(fusedChallenges).length !== 0) {
			count = 0;
			tooltipText += "<td><div class='row'><div class='col-xs-5' style='width: 100%; padding-right: 5px'>" + "" + "&nbsp;&nbsp;<span>" + "<u>Fused " + cinf() + "s</u>" + "</span></div></div>";
			tooltipText += "</td></tr><tr>";
			//Plus&Minus Portal&Void zone settings.
			for (var item in fusedChallenges) {
				if (count !== 0 && count % 2 === 0) tooltipText += "</tr><tr>";
				setting = getPageSetting('c2RunnerSettings', currSettingUniverse)[item] !== 'undefined' ?
					getPageSetting('c2RunnerSettings', currSettingUniverse)[item] :
					setting = (item = { enabled: false, zone: 0 });
				checkbox = buildNiceCheckbox('structConfig' + item, 'autoCheckbox', (setting && setting.enabled));

				var challenge = game.challenges[item];
				var challengeLevel = 0;
				var challengeList = challenge.multiChallenge;

				for (var y = 0; y < challengeList.length; y++) {
					if (challengeLevel > 0) challengeLevel = Math.min(challengeLevel, game.c2[challengeList[y]]);
					else challengeLevel += game.c2[challengeList[y]];
				}

				var itemName = item;
				//Start
				tooltipText += "<td><div class='row'>"
				//Checkbox & name
				tooltipText += "<div class='col-xs-3' style='width: 33%; padding-right: 5px; white-space: nowrap'>" + checkbox + "&nbsp;&nbsp;<span>" + itemName + "</span></div>";
				//Challenges current zone
				tooltipText += "<div class='col-xs-3' style='width: 33%; padding-right: 5px; text-align: center; white-space: nowrap'>" + challengeLevel + "</span></div>";
				//Zone input
				tooltipText += "<div class='col-xs-5' style='width: 34%; padding-left: 5px; text-align: right; white-space: nowrap'><input class='structConfigPercent' id='structZone" + item + "' type='number'  value='" + ((setting && setting.zone) ? setting.zone : 0) + "'/></div>";
				//Finish
				tooltipText += "</div></td>";
				count++;
			}
			tooltipText += "</tr>";
		}

		tooltipText += "</div></td></tr>";
		tooltipText += "</tbody></table>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn-lg btn btn-info' onclick='saveC2RunnerSettings()'>Apply</div><div class='btn btn-lg btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
		game.global.lockTooltip = true;
		ondisplay = function () {
			verticalCenterTooltip(false, false);
			elem.style.width = '45%';
			elem.style.left = "30.5%";
			elem.style.top = "25%";
			//swapClass('tooltipExtra', 'tooltipWindow45', tipElem);
		};
	}

	//Farming Settings
	else if (event === 'MAZ') {

		//If you're adding a new setting here make sure to add it to the mazSettings variable at the start of mainLoop() in AutoTrimps2.js
		//If you don't it'll instantly get resized to a super small version of itself when you open the setting.
		var mapFarm = titleText.includes('Map Farm');
		var mapBonus = titleText.includes('Map Bonus');
		var voidMap = titleText.includes('Void Map');
		var hdFarm = titleText.includes('HD Farm');
		var raiding = titleText.includes('Raiding');
		var bionic = titleText.includes('Bionic');

		var balance = titleText.includes('Balance Destack'.toLowerCase());
		var toxicity = titleText.includes('Toxicity Farm');

		var boneShrine = titleText.includes('Bone Shrine');
		var golden = titleText.includes('Golden');

		var tributeFarm = titleText.includes('Tribute Farm');
		var smithyFarm = titleText.includes('Smithy Farm');
		var worshipperFarm = titleText.includes('Worshipper Farm');

		var quagmire = titleText.includes('Quagmire');
		var insanity = titleText.includes('Insanity Farm');
		var alchemy = titleText.includes('Alchemy Farm');
		var hypothermia = titleText.includes('Hypothermia Farm');
		var desolation = titleText.includes('Desolation');

		var universe = currSettingUniverse;
		var settingName = varPrefix.charAt(0).toLowerCase() + varPrefix.slice(1);
		if (varPrefix === 'HDFarm') settingName = settingName.charAt(0) + settingName.charAt(1).toLowerCase() + settingName.slice(2);
		var trimple = currSettingUniverse === 1 ? 'Trimple' : 'Atlantrimp';

		var windowWidth = '50%';
		if (golden) windowWidth = '40%';
		else if (quagmire) windowWidth = '45%';
		else if (raiding) windowWidth = '75%';
		else if (balance) windowWidth = '50%';
		else if (toxicity) windowWidth = '50%';
		else if (bionic) windowWidth = '70%';
		else if (insanity) windowWidth = '55%';
		else if (alchemy) windowWidth = '75%';
		else if (hypothermia) windowWidth = '45%';
		else if (desolation) windowWidth = '50%';
		else if (voidMap) windowWidth = '70%';
		else if (worshipperFarm) windowWidth = '70%';
		else if (smithyFarm) windowWidth = '70%';
		else if (boneShrine) windowWidth = '65%';
		else if (hdFarm) windowWidth = '70%';
		else if (mapBonus) windowWidth = '75%';
		else if (mapFarm) windowWidth = '80%';
		else if (tributeFarm) windowWidth = '80%';

		const originalSetting = getPageSetting(settingName + 'Settings', currSettingUniverse);
		var maxSettings = 30;
		var overflow = false;

		//Setting up the Help onclick setting.
		var mazHelp = mazPopulateHelpWindow(titleText, trimple);

		tooltipText = "";
		//Setting up default values section
		if (!golden) {
			//Header
			tooltipText += "\
				<div id = 'windowContainer' style = 'display: block' > <div id='windowError'></div>\
				<div class='row windowRow titles' style='border: 0px; margin-top: -0.5vw;'>\
				<div class='windowActive" + varPrefix + "\'>Enabled</div>";
			if (worshipperFarm) {
				tooltipText += "<div class='windowWorshipperSkip'>Enable<br />Skip</div>";
				tooltipText += "<div class='windowWorshipper'>Skip<br />Value</div>";
			}
			if (boneShrine) {
				tooltipText += "<div class='windowAutoBoneShrine'>Auto Spend Charges</div>";
				tooltipText += "<div class='windowBoneDefault'>Auto Spend<br>At X Charges</div>";
				tooltipText += "<div class='windowBoneDefault'>Auto Spend<br>From Z</div>";
				tooltipText += "<div class='windowBoneDefault'>Auto Spend<br>Gather</div>";
				tooltipText += "<div class='windowBoneDefault'>Auto Spend<br>Job Ratio</div>";
			}
			if (mapBonus || hdFarm) tooltipText += "<div class='windowJobRatio" + varPrefix + "\'>Job<br>Ratio</div>";

			if (mapBonus) {
				tooltipText += "<div class='windowSpecial" + varPrefix + "\'>Special</div>";
			}
			if (raiding && !bionic) {
				tooltipText += "<div class='windowRecycle'>Recycle<br>Maps</div>";
			}
			if (alchemy) tooltipText += "<div class='windowStorage'>Void<br>Purchase</div>";
			if (voidMap) {
				tooltipText += "<div class='windowDefaultVoidMap'>Max<br>Map Bonus</div>";
				if (game.permaBoneBonuses.boosts.owned > 0) tooltipText += "<div class='windowDefaultVoidMap'>Use Bone<br>Charge</div>";
				tooltipText += "<div class='windowDefaultVoidMap'>Pre Void<br>Farm</div>";

				tooltipText += "<div class='windowDefaultVoidMap'>Void Farm<br>Hits Survived</div>";
				tooltipText += "<div class='windowDefaultVoidMap'>Void Farm<br>HD Ratio</div>";
				tooltipText += "<div class='windowDefaultVoidMap'>Void Farm<br>Job Ratio</div>";
				tooltipText += "<div class='windowDefaultVoidMap'>Void Farm<br>Map Cap</div>";
			}
			if (hypothermia) {
				tooltipText += "<div class='windowFrozenCastle'>Frozen<br>Castle</div>";
				tooltipText += "<div class='windowStorage'>Auto<br>Storage</div>";
				tooltipText += "<div class='windowPackrat'>Packrat</div>";
			}
			if (hdFarm) tooltipText += "<div class='windowCell" + varPrefix + "\'>Map<br>Cap</div>";

			tooltipText += "</div>";

			var defaultVals = {
				special: '0',
				gather: 'food',
				mapType: 'Absolute',
			}

			var style = "";

			const defaultSetting = originalSetting[0];

			//Reading info from each setting and setting up the default values object with necessary data
			defaultVals.active = defaultSetting.active ? defaultSetting.active : false;
			if (!boneShrine && !desolation) defaultVals.cell = defaultSetting.cell ? defaultSetting.cell : 81;

			if (boneShrine) {
				defaultVals.autoBone = defaultSetting.autoBone ? defaultSetting.autoBone : false;
				defaultVals.bonebelow = defaultSetting.bonebelow ? defaultSetting.bonebelow : 0;
				defaultVals.world = defaultSetting.world ? defaultSetting.world : 0;
				defaultVals.gather = defaultSetting.gather ? defaultSetting.gather : 'food';
			}

			if (mapBonus || voidMap || boneShrine || hdFarm)
				defaultVals.jobratio = defaultSetting.jobratio ? defaultSetting.jobratio : '1,1,1,1';

			if (mapBonus) {
				defaultVals.special = defaultSetting.special ? defaultSetting.special : '0';
				defaultVals.gather = defaultSetting.gather ? defaultSetting.gather : 'food';
			}

			if (worshipperFarm) {
				defaultVals.worshipper = defaultSetting.worshipper ? defaultSetting.worshipper : 50;
				defaultVals.shipSkipEnabled = defaultSetting.shipSkipEnabled ? defaultSetting.shipSkipEnabled : false;
				defaultVals.shipskip = defaultSetting.shipskip ? defaultSetting.shipskip : 10;
			}

			if (alchemy)
				defaultVals.voidPurchase = defaultSetting.voidPurchase ? defaultSetting.voidPurchase : false;

			if (voidMap) {
				defaultVals.maxTenacity = defaultSetting.maxTenacity ? defaultSetting.maxTenacity : false;
				if (game.permaBoneBonuses.boosts.owned > 0)
					defaultVals.boneCharge = defaultSetting.boneCharge ? defaultSetting.boneCharge : false;
				defaultVals.voidFarm = defaultSetting.voidFarm ? defaultSetting.voidFarm : false;

				defaultVals.hitsSurvived = defaultSetting.hitsSurvived ? defaultSetting.hitsSurvived : 0;
				defaultVals.hdRatio = defaultSetting.hdRatio ? defaultSetting.hdRatio : 0;
				defaultVals.mapCap = defaultSetting.mapCap ? defaultSetting.mapCap : 100;
			}

			if (hypothermia) {
				defaultVals.frozencastle = defaultSetting.frozencastle ? defaultSetting.frozencastle : [200, 99];
				defaultVals.autostorage = defaultSetting.autostorage ? defaultSetting.autostorage : false;
				defaultVals.packrat = defaultSetting.packrat ? defaultSetting.packrat : false;
			}

			if (tributeFarm || smithyFarm || alchemy)
				defaultVals.mapType = defaultSetting.mapType ? defaultSetting.mapType : 'Absolute';

			if (mapFarm)
				defaultVals.mapType = defaultSetting.mapType ? defaultSetting.mapType : 'Map Count';

			if (raiding && !bionic)
				defaultVals.recycle = defaultSetting.recycle ? defaultSetting.recycle : false;

			if (hdFarm)
				defaultVals.mapCap = typeof (defaultSetting.mapCap) === 'undefined' ? 100 : defaultSetting.mapCap ? defaultSetting.mapCap : 100;

			var defaultDropdowns = displayDropdowns(universe, defaultVals, varPrefix);
			var defaultGatherDropdown = defaultDropdowns.gather;
			var defaultSpecialsDropdown = defaultDropdowns.special;


			//Gather dropdown. Only shows if Huge or Large cache specials are selected. Displays "Gather" text to show user what it's for.
			//Adding a class to check if we should display the gather setting if special is set to huge cache or large cache
			var className = (defaultVals.special === 'hc' || defaultVals.special === 'lc') ? " windowGatherOn" : " windowGatherOff";

			const defaultTooltip = true;
			//Setting up the tooltip for base settings
			if (defaultTooltip) {
				;
				tooltipText += "<div id='windowRow' class='row windowRow " + className + "'>";
				tooltipText += "<div class='windowActive" + varPrefix + "\' style='text-align: center;'>" + buildNiceCheckbox("windowActiveDefault", null, defaultVals.active) + "</div>";
				if (worshipperFarm) {
					tooltipText += "<div class='windowWorshipperSkip' style='text-align: center;'>" + buildNiceCheckbox("windowSkipShipEnabled", null, defaultVals.shipSkipEnabled) + "</div>";

					tooltipText += "<div class='windowWorshipper'><input value='" + defaultVals.shipskip + "' type='number' id='windowRepeatDefault'/></div>";
				}
				if (boneShrine) {
					tooltipText += "<div class='windowAuto" + varPrefix + "\' style='text-align: center;'>" + buildNiceCheckbox("windowAutoBone", null, defaultVals.autoBone) + "</div>";
					tooltipText += "<div class='windowBoneDefault'><input value='" + defaultVals.bonebelow + "' type='number' id='windowBoneBelowDefault'/></div>";
					tooltipText += "<div class='windowBoneDefault'><input value='" + defaultVals.world + "' type='number' id='windowBoneWorld'/></div>";
					tooltipText += "<div class='windowBoneDefault'><select value='" + defaultVals.gather + "' id='windowBoneGatherDefault'>" + defaultGatherDropdown + "</select></div>";
					tooltipText += "<div class='windowBoneDefault'><input value='" + defaultVals.jobratio + "' type='text' id='windowJobRatioDefault'/></div>";
				}
				if (mapBonus || hdFarm)
					tooltipText += "<div class='windowJobRatio" + varPrefix + "\'><input value='" + defaultVals.jobratio + "' type='text' id='windowJobRatioDefault'/></div>";
				if (mapBonus) {
					tooltipText += "<div class='windowSpecial" + varPrefix + "\'  onchange='updateWindowPreset()'><select value='" + defaultVals.special + "' id='windowSpecial'>" + defaultSpecialsDropdown + "</select></div>";
					tooltipText += "<div class='windowGather'>\<div style='text-align: center; font-size: 0.6vw;'>Gather</div>\<onchange='updateWindowPreset()'>\<select value='" + defaultVals.gather + "' id='windowGather'>" + defaultGatherDropdown + "</select></div>";
				}

				if (hypothermia) {
					tooltipText += "<div class='windowFrozenCastle'><input value='" + defaultVals.frozencastle + "' type='text' id='windowFrozenCastleDefault'/></div>";

					tooltipText += "<div class='windowStorage' style='text-align: center;'>" + buildNiceCheckbox("windowStorageDefault", null, defaultVals.autostorage) + "</div>";

					tooltipText += "<div class='windowPackrat' style='text-align: center;'>" + buildNiceCheckbox("windowPackratDefault", null, defaultVals.packrat) + "</div>";
				}

				if (raiding && !bionic)
					tooltipText += "<div class='windowRecycle' style='text-align: center;'>" + buildNiceCheckbox("windowRecycleDefault", null, defaultVals.recycle) + "</div>";
				if (alchemy)
					tooltipText += "<div class='windowStorage' style='text-align: center;'>" + buildNiceCheckbox("windowVoidPurchase", null, defaultVals.voidPurchase) + "</div>";
				if (voidMap) {
					tooltipText += "<div class='windowDefaultVoidMap' style='text-align: center;'>" + buildNiceCheckbox("windowMaxTenacity", null, defaultVals.maxTenacity) + "</div>";
					if (game.permaBoneBonuses.boosts.owned > 0)
						tooltipText += "<div class='windowDefaultVoidMap' style='text-align: center;'>" + buildNiceCheckbox("windowBoneCharge", null, defaultVals.boneCharge) + "</div>";
					tooltipText += "<div class='windowDefaultVoidMap' style='text-align: center;'>" + buildNiceCheckbox("windowVoidFarm", null, defaultVals.voidFarm) + "</div>";

					tooltipText += "<div class='windowDefaultVoidMap'><input value='" + defaultVals.hitsSurvived + "' type='number' id='windowHitsSurvived'/></div>";

					tooltipText += "<div class='windowDefaultVoidMap'><input value='" + defaultVals.hdRatio + "' type='number' id='windowHDRatio'/></div>";
					tooltipText += "<div class='windowDefaultVoidMap'><input value='" + defaultVals.jobratio + "' type='text' id='windowJobRatioDefault'/></div>";
					tooltipText += "<div class='windowDefaultVoidMap'><input value='" + defaultVals.mapCap + "' type='text' id='windowMapCap'/></div>";
				}
				if (hdFarm)
					tooltipText += "<div class='windowCell" + varPrefix + "\'><input value='" + defaultVals.mapCap + "' type='number' id='mapCap'/></div>";

				tooltipText += "</div>";
			}
		}

		//Setting up rows for each setting
		tooltipText += "\
		<div id='windowContainer' style='display: block'><div id='windowError'></div>\
		<div class='row windowRow titles'>";
		if (!golden) tooltipText += "<div class='windowActive" + varPrefix + "\'>Active?</div>";
		if (golden) tooltipText += "<div class='windowActiveAutoGolden'>Active?</div>";
		tooltipText += "<div class='windowPriority" + varPrefix + "\'>Priority</div>";
		if (!voidMap && !golden && !boneShrine) tooltipText += "<div class='windowWorld" + varPrefix + "\'>Start<br/>Zone</div>";
		if (boneShrine) tooltipText += "<div class='windowWorld" + varPrefix + "\'>Zone</div>";
		if (mapFarm || tributeFarm || worshipperFarm || hdFarm || raiding || mapBonus || smithyFarm || desolation || toxicity || alchemy) tooltipText += "<div class='windowEndZone" + varPrefix + "\'>End<br/>Zone</div>";
		if (golden) tooltipText += "<div class='windowAmtAutoGolden'>Amount</div>";
		if (voidMap) tooltipText += "<div class='windowWorld" + varPrefix + "\'>Min Zone</div>";
		if (voidMap) tooltipText += "<div class='windowMaxVoidZone'>Max Zone</div>";
		if (raiding && bionic) tooltipText += "<div class='windowRaidingZone" + varPrefix + "\'>Raiding<br/>Zone</div>";
		if (raiding && !bionic) tooltipText += "<div class='windowRaidingZone" + varPrefix + "\'>Map<br/>Level</div>";
		if (!golden && !desolation) tooltipText += "<div class='windowCell" + varPrefix + "\'>Cell</div>";
		if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || hdFarm || toxicity) tooltipText += "<div class='windowAutoLevel" + varPrefix + "\'>Auto<br/>Level</div>";
		if (!quagmire && !boneShrine && !raiding && !voidMap && !golden && !desolation) tooltipText += "<div class='windowLevel" + varPrefix + "\'>Map<br/>Level</div>";
		if (tributeFarm || smithyFarm || mapFarm || alchemy) tooltipText += "<div class='windowMapTypeDropdown" + varPrefix + "\'>Farm Type</div>";
		if (tributeFarm) tooltipText += "<div class='windowTributes'>Tributes</div>";
		if (tributeFarm) tooltipText += "<div class='windowMets'>Mets</div>";

		if (mapFarm) tooltipText += "<div class='windowRepeat" + varPrefix + "\'>Map<br/>Repeats</div>";
		if (toxicity) tooltipText += "<div class='windowRepeat" + varPrefix + "\'>Toxic<br/>Stacks</div>";
		if (mapFarm || mapBonus) tooltipText += "<div class='windowHDRatio" + varPrefix + "\'>Above X<br/>HD Ratio</div>";

		if (mapBonus) tooltipText += "<div class='windowMapStacks'>Map<br/>Stacks</div>";
		if (quagmire) tooltipText += "<div class='windowBogs'>Bogs</div>";
		if (insanity) tooltipText += "<div class='windowInsanity'>Insanity</div>";
		if (alchemy) tooltipText += "<div class='windowPotionType'>Potion Type</div>";
		if (golden) tooltipText += "<div class='windowTypeAutoGolden'>Golden Type</div>";
		if (alchemy) tooltipText += "<div class='windowPotionNumber'>Potion Number</div>";
		if (hypothermia) tooltipText += "<div class='windowBonfire'>Bonfires</div>";

		if (boneShrine) tooltipText += "<div class='windowBoneAmount'>To use</div>";
		if (boneShrine) tooltipText += "<div class='windowBoneBelow'>Use below</div>";
		if (worshipperFarm) tooltipText += "<div class='windowWorshipper'>Worshippers</div>";
		if (smithyFarm) tooltipText += "<div class='windowSmithies'>Smithies</div>";

		if (hdFarm) {
			tooltipText += "<div class='windowHDBase'>HD Base</div>";
			tooltipText += "<div class='windowHDMult'>HD Mult</div>";
			tooltipText += "<div class='windowHDType'>HD<br/>Type</div>";
			tooltipText += "<div class='windowMapCap'>Map<br/>Cap</div>";
		}

		if (voidMap) {
			tooltipText += "<div class='windowHDTypeVoidMap'>Dropdown<br/>#1</div>";
			tooltipText += "<div class='windowVoidHDRatio'>Option<br/>#1</div>";
			tooltipText += "<div class='windowHDTypeVoidMap'>Dropdown<br/>#2</div>";
			tooltipText += "<div class='windowVoidHDRatio'>Option<br/>#2</div>";
		}
		if (!raiding && !smithyFarm && !golden) tooltipText += "<div class='windowJobRatio" + varPrefix + "\'>Job<br/>Ratio</div>";
		if (mapFarm || tributeFarm || worshipperFarm || raiding || smithyFarm || desolation || toxicity || alchemy) tooltipText += "<div class='windowRepeatEvery" + varPrefix + "\'>Repeat<br/>Every</div>";
		if (boneShrine) tooltipText += "<div class='windowBoneGather'>Gather</div>";
		if (mapFarm || alchemy || mapBonus || insanity || desolation || toxicity) tooltipText += "<div class='windowSpecial" + varPrefix + "\'>Special</div>";
		if (raiding && !bionic) tooltipText += "<div class='windowRaidingDropdown'>Frag Type</div>";
		if (mapFarm || tributeFarm || boneShrine) tooltipText += "<div class='windowAtlantrimp'>Run<br/>" + trimple + "</div>";
		if (smithyFarm) tooltipText += "<div class='windowMeltingPoint'>Run<br/>MP</div>";
		if (insanity) tooltipText += "<div class='windowBuildings'>Destack</div>";
		if (tributeFarm) tooltipText += "<div class='windowBuildings'>Buy<br/>Buildings</div>";
		if (raiding || desolation) tooltipText += "<div class='windowPrestigeGoal" + varPrefix + "\'>Prestige<br/>Goal</div>";
		if (raiding && !bionic) tooltipText += "<div class='windowIncrementMaps'>Increment<br>Maps</div>";
		if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden) tooltipText += "<div class='windowRunType" + varPrefix + "\'>Run&nbsp;Type</div>";
		if (voidMap) tooltipText += "<div class='windowPortalAfter'>Portal<br/>After</div>";
		tooltipText += "</div>";

		//As position 0 in the array stores base setting we need to take that out of the array before we start looping through rows
		var currSetting = originalSetting.slice(1, originalSetting.length);
		if (golden) currSetting = originalSetting;

		for (var x = 0; x < maxSettings; x++) {
			var style = "";

			vals = {
				active: true,
				priority: (x + 1),
				check: true,
				world: -2,
				cell: -1,
				level: -1,
				special: '0',
				repeat: 1,
				hdRatio: 0,
				gather: 'food',
				tributes: 0,
				mets: 0,
				bogs: 0,
				insanity: 0,
				potions: 0,
				bonfires: 5,
				boneamount: 1,
				bonebelow: 0,
				runType: 'All',
				prestigeGoal: 'All',
				raidingDropdown: 0,
				jobratio: '1,1,1,1',
				worshipper: 50,
				hdRatio: 0,
				voidHDRatio: 0,
				buildings: true,
				atlantrimp: false,
				meltingPoint: false,
				portalAfter: false,
				raidingzone: 6,
				maxvoidzone: -1,
				mapType: 'Absolute',
				autoLevel: true,
				endzone: 999,
				repeatevery: 0,
				challenge: 'All',
				challenge3: 'All',
				hdBase: 1,
				hdMult: 1,
				goldenType: 'v',
				hdType: 'world',
				hdType2: 'hitsSurvived',
				goldenNumber: -2,
				destack: false,
				mapCap: 100,
				incrementMaps: false,
			}
			//Taking data from the current setting and overriding the default values
			if (currSetting.length - 1 >= x) {
				vals.active = currSetting[x].active;
				vals.priority = currSetting[x].priority ? currSetting[x].priority : (x + 1);
				vals.world = currSetting[x].world;

				vals.cell = currSetting[x].cell ? currSetting[x].cell : 81;
				//Map Level
				if (!quagmire && !boneShrine && !raiding && !voidMap)
					vals.level = currSetting[x].level ? currSetting[x].level : 0;
				//Auto Level
				if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || hdFarm || toxicity)
					vals.autoLevel = typeof (currSetting[x].autoLevel) !== 'undefined' ? currSetting[x].autoLevel : true;
				//Repeat
				if (mapFarm || smithyFarm || mapBonus || toxicity)
					vals.repeat = currSetting[x].repeat ? currSetting[x].repeat : 1;
				//Repeat Every
				if (mapFarm || tributeFarm || worshipperFarm || raiding || smithyFarm || desolation || toxicity || alchemy)
					vals.repeatevery = currSetting[x].repeatevery ? currSetting[x].repeatevery : 0;
				//End Zone
				if (mapFarm || tributeFarm || worshipperFarm || hdFarm || raiding || mapBonus || smithyFarm || desolation || toxicity || alchemy)
					vals.endzone = currSetting[x].endzone ? currSetting[x].endzone : 999;
				//Trimple/Atlantrimp
				if (mapFarm || tributeFarm || boneShrine)
					vals.atlantrimp = currSetting[x].atlantrimp ? currSetting[x].atlantrimp : false;
				//Special
				if (mapFarm || alchemy || mapBonus || insanity || desolation || toxicity)
					vals.special = currSetting[x].special ? currSetting[x].special : '0';
				//Job Ratio
				if (!raiding && !smithyFarm)
					vals.jobratio = currSetting[x].jobratio ? currSetting[x].jobratio : '1,1,1,1';
				//Gather
				if (mapFarm || alchemy || boneShrine || mapBonus || desolation || toxicity)
					vals.gather = currSetting[x].gather ? currSetting[x].gather : 'food';
				//Run Type
				if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden)
					vals.runType = currSetting[x].runType ? currSetting[x].runType : 'All';
				//Challenge 
				if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden)
					vals.challenge = currSetting[x].challenge ? currSetting[x].challenge : 'All';
				//C2/C3
				if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden)
					vals.challenge3 = currSetting[x].challenge3 ? currSetting[x].challenge3 : 'All';
				//HD Ratio
				if (mapFarm || mapBonus) {
					vals.hdRatio = currSetting[x].hdRatio ? currSetting[x].hdRatio : 0;
				}
				//Map Farm
				if (mapFarm) {
					vals.mapType = currSetting[x].mapType ? currSetting[x].mapType : 'Map Count';
				}
				//HD Farm
				if (hdFarm) {
					vals.hdType = currSetting[x].hdType ? currSetting[x].hdType : 'world';
					vals.hdBase = (currSetting[x].hdBase || currSetting[x].hdBase === 0) ? currSetting[x].hdBase : 1;
					vals.hdMult = currSetting[x].hdMult ? currSetting[x].hdMult : 1;
					vals.mapCap = currSetting[x].mapCap ? currSetting[x].mapCap : 100;
				}
				//Void Maps
				if (voidMap) {
					vals.hdType = currSetting[x].hdType ? currSetting[x].hdType : 'world';
					vals.hdType2 = currSetting[x].hdType2 ? currSetting[x].hdType2 : 'hitsSurvived';
					vals.maxvoidzone = currSetting[x].maxvoidzone ? currSetting[x].maxvoidzone : 1;
					vals.hdRatio = currSetting[x].hdRatio ? currSetting[x].hdRatio : 0;
					vals.voidHDRatio = currSetting[x].voidHDRatio ? currSetting[x].voidHDRatio : 0;
					vals.portalAfter = currSetting[x].portalAfter ? currSetting[x].portalAfter : false;
				}
				//Raiding
				if (raiding) {
					vals.raidingzone = currSetting[x].raidingzone ? currSetting[x].raidingzone : 1;
					vals.prestigeGoal = currSetting[x].prestigeGoal ? currSetting[x].prestigeGoal : 'All';
					if (!bionic) {
						vals.raidingDropdown = currSetting[x].raidingDropdown ? currSetting[x].raidingDropdown : 1;
						vals.incrementMaps = currSetting[x].incrementMaps ? currSetting[x].incrementMaps : false;
					}
				}
				//Bone Shrine
				if (boneShrine) {
					vals.boneamount = currSetting[x].boneamount ? currSetting[x].boneamount : 0;
					vals.bonebelow = currSetting[x].bonebelow ? currSetting[x].bonebelow : 0;
				}
				//Golden Upgrades
				if (golden) {
					vals.goldenType = typeof (currSetting[x].golden) !== 'undefined' ? currSetting[x].golden[0] : 'v';
					vals.goldenNumber = typeof (currSetting[x].golden) !== 'undefined' ? currSetting[x].golden.toString().replace(/[^\d,:-]/g, '') : -2;
				}
				//Smithy Farm
				if (smithyFarm)
					vals.meltingPoint = currSetting[x].meltingPoint ? currSetting[x].meltingPoint : false;

				if (tributeFarm || smithyFarm || alchemy)
					vals.mapType = currSetting[x].mapType ? currSetting[x].mapType : 'Absolute';
				//Tribute Farm
				if (tributeFarm) {
					vals.tributes = currSetting[x].tributes ? currSetting[x].tributes : 0;
					vals.mets = currSetting[x].mets ? currSetting[x].mets : 0;
					vals.buildings = currSetting[x].buildings ? currSetting[x].buildings : true;
				}
				//Worshipper Farm
				if (worshipperFarm) {
					vals.worshipper = currSetting[x].worshipper ? currSetting[x].worshipper : 50;
				}
				//Quagmire
				if (quagmire) {
					vals.bogs = currSetting[x].bogs ? currSetting[x].bogs : 0;
				}
				//Insanity
				if (insanity) {
					vals.insanity = currSetting[x].insanity ? currSetting[x].insanity : 0;
					vals.destack = currSetting[x].destack ? currSetting[x].destack : false;
				}
				//Alchemy
				if (alchemy) {
					vals.potionstype = currSetting[x].potion[0] ? currSetting[x].potion[0] : 0;
					vals.potionsnumber = currSetting[x].potion.toString().replace(/[^\d,:-]/g, '') ? currSetting[x].potion.toString().replace(/[^\d,:-]/g, '') : 0;
				}
				//Hypothermia
				if (hypothermia) {
					vals.bonfires = currSetting[x].bonfire ? currSetting[x].bonfire : 0;
				}
				//Desolation
				if (desolation) {
					vals.prestigeGoal = currSetting[x].prestigeGoal ? currSetting[x].prestigeGoal : 'All';
				}

				if (x >= 10) overflow = true;
			}
			//Hide row if the line isn't in use.
			else {
				style = " style='display: none' ";
				if (x < 10) overflow = false;
			}

			var backgroundStyle = "";
			//Set Nature colours if zone input is above Nature start zone.
			if (currSettingUniverse === 1 && !golden) {
				var natureStyle = ['unset', 'rgba(50, 150, 50, 0.75)', 'rgba(60, 75, 130, 0.75)', 'rgba(50, 50, 200, 0.75)'];
				var natureList = ['None', 'Poison', 'Wind', 'Ice'];
				var index = natureList.indexOf(getZoneEmpowerment(vals.world));
				backgroundStyle = " 'background:" + natureStyle[index] + "\'";
			}

			//Sort out the dropdowns sections for settings
			var mazDropdowns = displayDropdowns(universe, vals, varPrefix);
			//Map Level options
			var mapLevelDropdown = mazDropdowns.mapLevel;
			//Gather Selection options
			var gatherDropdown = mazDropdowns.gather;
			//Specials dropdown with conditions for each unlock to only appear when the user can run them.
			var specialsDropdown = mazDropdowns.special;
			//Filler Challenges
			var challengeDropdown = mazDropdowns.challenge;
			//C3 Challenges
			var challenge3Dropdown = mazDropdowns.c2;
			//Prestige Goal
			var prestigeGoalDropdown = mazDropdowns.prestigeGoal;
			//Run Type
			var runTypeDropdown = mazDropdowns.runType;
			//Golden
			var goldenDropdown = mazDropdowns.goldenType;
			//HD Type
			var hdTypeDropdown = mazDropdowns.hdType;
			//HD Type
			var hdTypeDropdown2 = displayDropdowns(universe, vals, varPrefix, 'hdType2').hdType;
			//Map Type
			var mapTypeDropdown = mazDropdowns.mapType;

			var potionDropdown = "<option value='h'" + ((vals.potionstype === 'h') ? " selected='selected'" : "") + ">Herby Brew</option>\
			<option value='g'" + ((vals.potionstype === 'g') ? " selected='selected'" : "") + ">Gaseous Brew</option>\
			<option value='f'" + ((vals.potionstype === 'f') ? " selected='selected'" : "") + ">Potion of Finding</option>\
			<option value='v'" + ((vals.potionstype === 'v') ? " selected='selected'" : "") + ">Potion of the Void</option>\
			<option value='s'" + ((vals.potionstype === 's') ? " selected='selected'" : "") + ">Potion of Strength</option>"

			var raidingDropdown = "<option value='0'" + ((vals.raidingDropdown === '0') ? " selected='selected'" : "") + ">Frag</option>\
			<option value='1'" + ((vals.raidingDropdown === '1') ? " selected='selected'" : "") + ">Frag Min</option>\
			<option value='2'" + ((vals.raidingDropdown === '2') ? " selected='selected'" : "") + ">Frag Max</option>"

			//Adding a class to check if we should display the gather setting if special is set to huge cache or large cache
			var className = (vals.special === 'hc' || vals.special === 'lc') ? " windowGatherOn" : " windowGatherOff";
			//Adding a class for if we have auto level enabled or not. Allows us to change the opacity of the button & make it unclickable.
			className += (!vals.autoLevel) ? " windowLevelOn" : " windowLevelOff";

			//Adding the class for if we have C2/C3 challenge selected or not.
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden)
				className += (vals.runType === 'C3') ?
					" windowChallenge3On" + varPrefix + "" : " windowChallenge3Off" + varPrefix + "";

			//Adding the class for if we have filler challenge selected or not.
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden)
				className += (vals.runType === 'Filler') ?
					" windowChallengeOn" + varPrefix + "" : " windowChallengeOff" + varPrefix + "";
			//Adding the class for if we want to run to map level or not.
			if (hdFarm)
				className += (vals.hdType === 'maplevel') ?
					" windowMapLevelOff" : " windowMapLevelOn";

			//Adding the class for if the line is currently active or not.
			className += (x <= currSetting.length - 1) ? " active" : " disabled";

			//Opening the row div. Will parse all the settings we want shown in the row.
			tooltipText += "<div id='windowRow" + x + "' class='row windowRow " + className + "'" + style + ">";

			//Delete the row button
			if (!golden) tooltipText += "<div class='windowDelete" + varPrefix + "\' onclick='removeRow(\"" + x + "\",\"" + titleText + "\", true)'><span class='icomoon icon-cross'></span></div>";

			//Button to delete the row for golden settings
			if (golden) tooltipText += "<div class='windowDeleteAutoGolden' onclick='removeRow(\"" + x + "\",\"" + titleText + "\", true)'><span class='icomoon icon-cross'></span></div>";

			//Active checkbox
			if (!golden) tooltipText += "<div class='windowActive" + varPrefix + "\' style='text-align: center;'>" + buildNiceCheckbox("windowActive" + x, null, vals.active) + "</div>";

			//Active checkbox for golden settings
			if (golden) tooltipText += "<div class='windowActiveAutoGolden' style='text-align: center;'>" + buildNiceCheckbox("windowActive" + x, null, vals.active) + "</div>";

			//Priority input
			tooltipText += "<div class='windowPriority" + varPrefix + "\'><input value='" + vals.priority + "' type='number' id='windowPriority" + x + "'/></div>";

			//World input
			if (!golden)
				tooltipText += "<div class='windowWorld" + varPrefix + "\' style = " + backgroundStyle + "\' oninput='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><input value='" + vals.world + "' type='number' id='windowWorld" + x + "'/></div>";

			//End Zone input
			if (mapFarm || tributeFarm || worshipperFarm || hdFarm || raiding || mapBonus || smithyFarm || desolation || toxicity || alchemy)
				tooltipText += "<div class='windowEndZone" + varPrefix + "\'><input value='" + vals.endzone + "' type='number' id='windowEndZone" + x + "'/></div>";

			//Highest Void Zone input - SHOULD BE CONVERTED TO USE END ZONE INSTEAD!
			if (voidMap)
				tooltipText += "<div class='windowMaxVoidZone'><input value='" + vals.maxvoidzone + "' type='number' id='windowMaxVoidZone" + x + "'/></div>";

			//Raiding Zone input
			if (raiding && bionic)
				tooltipText += "<div class='windowRaidingZone" + varPrefix + "\'><input value='" + vals.raidingzone + "' type='number' id='windowRaidingZone" + x + "'/></div>";
			//Map Level Dropdown for Raiding
			if (raiding && !bionic)
				tooltipText += "<div class='windowRaidingZone" + varPrefix + "\'><select value='" + vals.raidingzone + "' id='windowRaidingZone" + x + "'>" + mapLevelDropdown + "</select></div>";

			//Cell input
			if (!golden && !desolation)
				tooltipText += "<div class='windowCell" + varPrefix + "\'><input value='" + vals.cell + "' type='number' id='windowCell" + x + "'/></div>";

			//Auto level checkbox
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || hdFarm || toxicity)
				tooltipText += "<div class='windowAutoLevel" + varPrefix + "\' style='text-align: center; padding-left: 5px;'>" + buildNiceCheckboxAutoLevel("windowAutoLevel" + x, null, vals.autoLevel, x, varPrefix) + "</div>";

			//Level input
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || hdFarm || toxicity)
				tooltipText += "<div class='windowLevel" + varPrefix + "\'><input value='" + vals.level + "' type='number' id='windowLevel" + x + "'/></div>";

			//Map Type dropdown
			if (tributeFarm || smithyFarm || mapFarm || alchemy)
				tooltipText += "<div class='windowMapTypeDropdown" + varPrefix + "\' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.mapType + "' id='windowMapTypeDropdown" + x + "'>" + mapTypeDropdown + "</select></div>";

			//World input
			if (worshipperFarm)
				tooltipText += "<div class='windowWorshipper'><input value='" + vals.worshipper + "' type='number' id='windowWorshipper" + x + "'/></div>";

			//Repeat input (Map Farm);
			if (mapFarm || toxicity)
				tooltipText += "<div class='windowRepeat" + varPrefix + "\'><input value='" + vals.repeat + "' type='value' id='windowRepeat" + x + "'/></div>";

			//HD Ratio to farm when above
			if (mapFarm || mapBonus)
				tooltipText += "<div class='windowHDRatio" + varPrefix + "\'><input value='" + vals.hdRatio + "' type='value' id='windowHDRatio" + x + "'/></div>";

			//Map Bonus to farm when below
			if (mapBonus)
				tooltipText += "<div class='windowMapStacks'><input value='" + vals.repeat + "' type='number' id='windowRepeat" + x + "'/></div>";

			//Smithies to farm for
			if (smithyFarm)
				tooltipText += "<div class='windowSmithies'><input value='" + vals.repeat + "' type='number' id='windowRepeat" + x + "'/></div>";

			if (hdFarm) {
				//HD Base value
				tooltipText += "<div class='windowHDBase'>\<div style='text-align: center; font-size: 0.6vw;'>" + (vals.hdType === 'maplevel' ? "Map Level" : "") + "</div>\<input value='" + vals.hdBase + "' type='number' id='windowRepeat" + x + "'/></div>";
				//HD Mult value
				tooltipText += "<div class='windowHDMult'><input value='" + vals.hdMult + "' type='number' id='windowHDMult" + x + "'/></div>";
				//HD Type dropdown
				tooltipText += "<div class='windowHDType' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.hdType + "' id='windowHDType" + x + "'>" + hdTypeDropdown + "</select></div>";
				//Map Cap 
				tooltipText += "<div class='windowMapCap'><input value='" + vals.mapCap + "' type='number' id='windowMapCap" + x + "'/></div>";
			}
			//Tributes to farm for
			if (tributeFarm)
				tooltipText += "<div class='windowTributes'><input value='" + vals.tributes + "' type='number' id='windowTributes" + x + "'/></div>";

			//Meteorologists to farm for
			if (tributeFarm)
				tooltipText += "<div class='windowMets'><input value='" + vals.mets + "' type='number' id='windowMets" + x + "'/></div>";

			//Black bogs to run
			if (quagmire)
				tooltipText += "<div class='windowBogs'><input value='" + vals.bogs + "' type='number' id='windowBogs" + x + "'/></div>";

			//Insanity stacks to farm for
			if (insanity)
				tooltipText += "<div class='windowInsanity'><input value='" + vals.insanity + "' type='number' id='windowInsanity" + x + "'/></div>";

			//Alchemy potion type dropdown
			if (alchemy)
				tooltipText += "<div class='windowPotionType' onchange='updateWindowPreset(" + x + ")'><select value='" + vals.potionstype + "' id='windowPotionType" + x + "'>" + potionDropdown + "</select></div>";

			//Alchemy potion input
			if (alchemy)
				tooltipText += "<div class='windowPotionNumber'><input value='" + vals.potionsnumber + "' type='number' id='windowPotionNumber" + x + "'/></div>";

			//Hypothermia bonfire goal
			if (hypothermia)
				tooltipText += "<div class='windowBonfire'><input value='" + vals.bonfires + "' type='number' id='windowBonfire" + x + "'/></div>";

			//Bone Shrine - Charges to use
			if (boneShrine)
				tooltipText += "<div class='windowBoneAmount'><input value='" + vals.boneamount + "' type='number' id='windowBoneAmount" + x + "'/></div>";

			//Bone Shrine - Use charges when below this amount
			if (boneShrine)
				tooltipText += "<div class='windowBoneBelow'><input value='" + vals.bonebelow + "' type='number' id='windowBoneBelow" + x + "'/></div>";

			//Void HD Dropdown #1
			if (voidMap)
				tooltipText += "<div class='windowHDTypeVoidMap onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.hdType + "' id='windowHDTypeVoidMap" + x + "'>" + hdTypeDropdown + "</select></div>";

			//Run void maps when HD Ratio is above this value
			if (voidMap)
				tooltipText += "<div class='windowVoidHDRatio'><input value='" + vals.hdRatio + "' type='number' id='windowHDRatio" + x + "'/></div>";

			//Void HD Dropdown #2
			if (voidMap)
				tooltipText += "<div class='windowHDTypeVoidMap onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.hdType2 + "' id='windowHDTypeVoidMap2" + x + "'>" + hdTypeDropdown2 + "</select></div>";

			//Run void maps when Void HD Ratio is above this value
			if (voidMap)
				tooltipText += "<div class='windowVoidHDRatio'><input value='" + vals.voidHDRatio + "' type='number' id='windowVoidHDRatio" + x + "'/></div>";

			//Job ratio input
			if (!raiding && !smithyFarm && !golden)
				tooltipText += "<div class='windowJobRatio" + varPrefix + "\'><input value='" + vals.jobratio + "' type='value' id='windowJobRatio" + x + "'/></div>";

			//Repeat every X zones
			if (mapFarm || tributeFarm || worshipperFarm || raiding || smithyFarm || desolation || toxicity || alchemy)
				tooltipText += "<div class='windowRepeatEvery" + varPrefix + "\'><input value='" + vals.repeatevery + "' type='number' id='windowRepeatEvery" + x + "'/></div>";

			//Gather type dropdown for bone shrines
			if (boneShrine)
				tooltipText += "<div class='windowBoneGather'><select value='" + vals.gather + "' id='windowBoneGather" + x + "'>" + gatherDropdown + "</select></div>";

			//Raiding type dropdown
			if (raiding && !bionic) tooltipText += "<div class='windowRaidingDropdown' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.raidingDropdown + "' id='windowRaidingDropdown" + x + "'>" + raidingDropdown + "</select></div>";

			//Special cache to use dropdown
			if (mapFarm || alchemy || mapBonus || insanity || desolation || toxicity)
				tooltipText += "<div class='windowSpecial" + varPrefix + "\'  onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.special + "' id='windowSpecial" + x + "'>" + specialsDropdown + "</select></div>";

			//Gather dropdown. Only shows if Huge or Large cache specials are selected. Displays "Gather" text to show user what it's for.
			if (mapFarm || alchemy || mapBonus || insanity || desolation || toxicity)
				tooltipText += "<div class='windowGather'>\<div style='text-align: center; font-size: 0.6vw;'>Gather</div>\<onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'>\<select value='" + vals.gather + "' id='windowGather" + x + "'>" + gatherDropdown + "</select></div>";

			//Trimple/Atlantrimp checkbox
			if (mapFarm || tributeFarm || boneShrine)
				tooltipText += "<div class='windowAtlantrimp' style='text-align: center;'>" + buildNiceCheckbox("windowAtlantrimp" + x, null, vals.atlantrimp) + "</div>";

			//Melting point checkbox
			if (smithyFarm)
				tooltipText += "<div class='windowMeltingPoint' style='text-align: center;'>" + buildNiceCheckbox("windowMeltingPoint" + x, null, vals.meltingPoint) + "</div>";

			//Buy buildings checkbox
			if (tributeFarm)
				tooltipText += "<div class='windowBuildings' style='text-align: center;'>" + buildNiceCheckbox("windowBuildings" + x, null, vals.buildings) + "</div>";

			//Buy buildings checkbox
			if (insanity)
				tooltipText += "<div class='windowBuildings' style='text-align: center;'>" + buildNiceCheckbox("windowBuildings" + x, null, vals.destack) + "</div>";

			//Prestige Goal dropdown
			if (raiding || desolation)
				tooltipText += "<div class='windowPrestigeGoal" + varPrefix + "\' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.prestigeGoal + "' id='windowPrestigeGoal" + x + "'>" + prestigeGoalDropdown + "</select></div>";

			//Increment Maps checkbox
			if (raiding && !bionic)
				tooltipText += "<div class='windowIncrementMaps' style='text-align: center;'>" + buildNiceCheckbox("windowIncrementMapsDefault" + x, null, vals.incrementMaps) + "</div>";

			//Auto Golden input
			if (golden)
				tooltipText += "<div class='windowAmtAutoGolden'><input value='" + vals.goldenNumber + "' type='number' id='windowWorld" + x + "'/></div>";

			//Type of golden dropdown
			if (golden)
				tooltipText += "<div class='windowTypeAutoGolden' onchange='updateWindowPreset(" + x + ")'><select value='" + vals.goldentype + "' id='windowGoldenType" + x + "'>" + goldenDropdown + "</select></div>";

			//Run Type dropdown
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden)
				tooltipText += "<div class='windowRunType" + varPrefix + "\' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.runType + "' id='windowRunType" + x + "'>" + runTypeDropdown + "</select></div>";

			//Filler challenges dropdown
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden)
				tooltipText += "<div class='windowChallenge" + varPrefix + "\'>\<div style='text-align: center; font-size: 0.6vw;'>Challenge</div>\<select value='" + vals.challenge + "' id='windowChallenge" + x + "'>" + challengeDropdown + "</select></div>";

			//C2/C3 challenges dropdown
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden)
				tooltipText += "<div class='windowChallenge3" + varPrefix + "\'>\<div style='text-align: center; font-size: 0.6vw;'>Challenge" + (universe + 1) + "</div>\<select value='" + vals.challenge3 + "' id='windowChallenge3" + x + "'>" + challenge3Dropdown + "</select></div>";

			//Portal After Void Maps checkbox
			if (voidMap)
				tooltipText += "<div class='windowPortalAfter' style='text-align: center;'>" + buildNiceCheckbox("windowPortalAfter" + x, null, vals.portalAfter) + "</div>";

			tooltipText += "</div>";
		}

		tooltipText += "<div id='windowAddRowBtn' style='display: " + ((currSetting.length < maxSettings) ? "inline-block" : "none") + "' class='btn btn-success btn-md' onclick='addRow(\"" + varPrefix + "\",\"" + titleText + "\")'>+ Add Row</div>";
		tooltipText += "</div></div><div style='display: none' id='mazHelpContainer'>" + mazHelp + "</div>";
		costText = "<div class='maxCenter'><span class='btn btn-success btn-md' id='confirmTooltipBtn' onclick='settingsWindowSave(\"" + titleText + "\",\"" + settingName + "\")'>Save and Close</span><span class='btn btn-danger btn-md' onclick='cancelTooltip(true)'>Cancel</span><span class='btn btn-primary btn-md' id='confirmTooltipBtn' onclick='settingsWindowSave(\"" + titleText + "\",\"" + settingName + "\", true)'>Save</span><span class='btn btn-info btn-md' onclick='windowToggleHelp(\"" + windowWidth + "\")'>Help</span></div>";

		game.global.lockTooltip = true;
		elem.style.top = "10%";
		elem.style.left = "1%";
		elem.style.height = 'auto';
		elem.style.maxHeight = window.innerHeight * .85 + 'px';
		elem.style.width = windowWidth;
		if (overflow) elem.style.overflowY = 'scroll';
		if (!overflow) elem.style.overflowY = '';
	}

	titleText = (titleText) ? titleText : titleText;

	if (titleText === 'C2 Runner' && currSettingUniverse === 2) titleText = cinf() + ' Runner';
	document.getElementById("tipTitle").innerHTML = titleText;
	document.getElementById("tipText").innerHTML = tooltipText;
	document.getElementById("tipCost").innerHTML = costText;
	elem.style.display = "block";
	if (ondisplay !== null)
		ondisplay();
}

function buildNiceCheckboxAutoLevel(id, extraClass, enabled, index, varPrefix) {
	var html = (enabled) ? "icomoon icon-checkbox-checked' data-checked='true' " : "icomoon icon-checkbox-unchecked' data-checked='false' ";
	var defaultClasses = " niceCheckbox noselect";
	var title = enabled ? "Checked" : "Not Checked";
	extraClass = (extraClass) ? extraClass + defaultClasses : defaultClasses;
	html = "class='" + extraClass + " " + html;
	html = "<span title='" + title + "' id='" + id + "' " + html + onchange + " onclick='swapNiceCheckbox(this); updateWindowPreset(\"" + index + "\",\"" + varPrefix + "\");'></span>";
	if (document.getElementById('tooltipDiv').classList.contains('tooltipExtraLg') === true && (document.getElementById('tooltipDiv').children.tipTitle.innerText.includes('Farm') || document.getElementById('tooltipDiv').children.tipTitle.innerText.includes('Map Bonus'))) {
		updateWindowPreset(index, varPrefix)
	}
	return html;
}

function messageConfigHoverAT(what, event) {
	var text = "";
	var title = "";
	switch (what) {
		case 'general':
			text = "Notification Messages, Auto He/Hr.";
			title = "General";
			break;
		case 'fragment':
			text = "Log the amount of fragments each created map cost.";
			title = "Fragment";
			break;
		case 'upgrades':
			text = "Log all the upgrades that AT has purchased.";
			title = "Upgrades";
			break;
		case 'equipment':
			text = "Log the equipment & prestiges that AT buys.";
			title = "Equipment";
			break;
		case 'maps':
			text = "Log the maps that AT decides to pick, buy, run, or recycle.";
			title = "Maps";
			break;
		case 'map_Details':
			text = "Logs run time & map count when AT decides to farm.";
			title = "Map Details";
			break;
		case 'map_Destacking':
			text = "Logs run time & map count when AT does any map based destacking.";
			title = "Map Destacking";
			break;
		case 'map_Skip':
			text = "Logs when AT skips Worshipper Farm, HD Farm & Hits Survived.";
			title = "Map Skip";
			break;
		case 'other':
			text = "Log Better Auto Fight, Trimpicide & AutoBreed/Gene Timer changes, etc - a catch all.";
			title = "Other";
			break;
		case 'buildings':
			text = "Log the buildings that AT purchases.";
			title = "Buildings";
			break;
		case 'jobs':
			text = "Log the jobs that AT purchases.";
			title = "Jobs";
			break;
		case 'zone':
			text = "Log when you start a new zone.";
			title = "Zone";
			break;
		case 'exotic':
			text = "Log the amount of world exotics you start a zone with.";
			title = "Exotic";
			break;
		case 'gather':
			text = "Log the action that AT tries to gather.";
			title = "Gather";
			break;
		case 'stance':
			text = "Logs when AT decides to change stance and what it changes to.";
			title = "Stance";
			break;
		case 'nature':
			text = "Logs when the script spends nature tokens.";
			title = "Nature";
			break;
		case 'run_Stats':
			text = "Logs the total trimps you have and how many resources you'd gain from a bone charge when entering a new zone.";
			title = "Run Stats";
			break;
		default: return;
	}
	document.getElementById('messageConfig').innerHTML = "<b>" + title + "</b> - " + text;
	tooltip(title, 'customText', event, text);
}

function configMessagesAT() {

	var setting = getPageSetting('spamMessages', currPortalUniverse);
	var checkboxes = document.getElementsByClassName('messageConfigCheckbox');

	for (var x = 0; x < checkboxes.length; x++) {
		var name = checkboxes[x].id;
		var checked = (checkboxes[x].dataset.checked === 'true');
		setting[name] = checked;
	}

	setPageSetting('spamMessages', setting);
	cancelTooltip();
	saveSettings();
}

function settingsWindowSave(titleText, varPrefix, reopen) {

	var setting = [];
	var error = "";
	var errorMessage = false;
	var maxSettings = 30;

	var mapFarm = titleText.includes('Map Farm');
	var mapBonus = titleText.includes('Map Bonus');
	var voidMap = titleText.includes('Void Map');
	var hdFarm = titleText.includes('HD Farm');
	var raiding = titleText.includes('Raiding');
	var bionic = titleText.includes('Bionic');

	var balance = titleText.includes('Balance Destack'.toLowerCase());
	var toxicity = titleText.includes('Toxicity Farm');

	var quagmire = titleText.includes('Quagmire');
	var insanity = titleText.includes('Insanity Farm');
	var alchemy = titleText.includes('Alchemy Farm');
	var hypothermia = titleText.includes('Hypothermia Farm');
	var desolation = titleText.includes('Desolation');
	var boneShrine = titleText.includes('Bone Shrine');
	var golden = titleText.includes('Golden');
	var tributeFarm = titleText.includes('Tribute Farm');
	var smithyFarm = titleText.includes('Smithy Farm');
	var worshipperFarm = titleText.includes('Worshipper Farm');

	var defaultSetting = {
	}

	if (!golden) {
		defaultSetting.active = readNiceCheckbox(document.getElementById('windowActiveDefault'));
		if (worshipperFarm) {
			defaultSetting.shipSkipEnabled = readNiceCheckbox(document.getElementById('windowSkipShipEnabled'));
			defaultSetting.shipskip = parseInt(document.getElementById('windowRepeatDefault').value, 10);
		}
		if (mapBonus) {
			defaultSetting.special = document.getElementById('windowSpecial').value;

			if (defaultSetting.special === 'hc' || defaultSetting.special === 'lc')
				defaultSetting.gather = document.getElementById('windowGather').value;
			else
				defaultSetting.gather = null;
		}

		if (boneShrine) {
			defaultSetting.autoBone = readNiceCheckbox(document.getElementById('windowAutoBone'));
			defaultSetting.bonebelow = parseInt(document.getElementById('windowBoneBelowDefault').value, 10);
			defaultSetting.gather = document.getElementById('windowBoneGatherDefault').value;
			defaultSetting.world = parseInt(document.getElementById('windowBoneWorld').value, 10);
		}

		if (mapBonus || voidMap || boneShrine || hdFarm) defaultSetting.jobratio = document.getElementById('windowJobRatioDefault').value;
		if (alchemy) defaultSetting.voidPurchase = readNiceCheckbox(document.getElementById('windowVoidPurchase'));
		if (voidMap) {
			defaultSetting.maxTenacity = readNiceCheckbox(document.getElementById('windowMaxTenacity'));
			if (game.permaBoneBonuses.boosts.owned > 0) defaultSetting.boneCharge = readNiceCheckbox(document.getElementById('windowBoneCharge'));
			defaultSetting.voidFarm = readNiceCheckbox(document.getElementById('windowVoidFarm'));
			defaultSetting.hitsSurvived = document.getElementById('windowHitsSurvived').value;
			defaultSetting.hdRatio = document.getElementById('windowHDRatio').value;
			defaultSetting.mapCap = parseFloat(document.getElementById('windowMapCap').value, 10);
		}
		if (hypothermia) {
			defaultSetting.frozencastle = document.getElementById('windowFrozenCastleDefault').value.split(',');
			defaultSetting.autostorage = readNiceCheckbox(document.getElementById('windowStorageDefault'));
			defaultSetting.packrat = readNiceCheckbox(document.getElementById('windowPackratDefault'));
		}
		if (raiding && !bionic) {
			defaultSetting.recycle = readNiceCheckbox(document.getElementById('windowRecycleDefault'));
		}
		if (hdFarm) defaultSetting.mapCap = parseFloat(document.getElementById('mapCap').value, 10);

		if (defaultSetting.cell < 1) defaultSetting.cell = 1;
		if (defaultSetting.cell > 100) defaultSetting.cell = 100;

		if (defaultSetting.repeat < 0) defaultSetting.repeat = 0;
	}

	for (var x = 0; x < maxSettings; x++) {

		var thisSetting = {
		};

		var world = document.getElementById('windowWorld' + x);
		if (!world || world.value === "-2") {
			continue;
		};

		thisSetting.active = readNiceCheckbox(document.getElementById('windowActive' + x));
		thisSetting.priority = parseInt(document.getElementById('windowPriority' + x).value, 10);
		thisSetting.row = (x + 1);
		if (!golden) {
			thisSetting.world = parseInt(document.getElementById('windowWorld' + x).value, 10);
			if (!desolation) thisSetting.cell = parseInt(document.getElementById('windowCell' + x).value, 10);
		}
		if (!quagmire && !boneShrine && !raiding && !voidMap && !golden && !desolation) thisSetting.level = parseInt(document.getElementById('windowLevel' + x).value, 10);
		if (smithyFarm || mapBonus) thisSetting.repeat = parseInt(document.getElementById('windowRepeat' + x).value, 10);
		if (hdFarm) {
			thisSetting.hdBase = parseFloat(document.getElementById('windowRepeat' + x).value, 10);
			thisSetting.hdMult = parseFloat(document.getElementById('windowHDMult' + x).value, 10);
			thisSetting.hdType = document.getElementById('windowHDType' + x).value;
			thisSetting.mapCap = parseInt(document.getElementById('windowMapCap' + x).value, 10);
		}
		if (mapFarm || tributeFarm || worshipperFarm || raiding || smithyFarm || desolation || toxicity || alchemy) thisSetting.repeatevery = parseInt(document.getElementById('windowRepeatEvery' + x).value, 10);
		if (mapFarm || tributeFarm || worshipperFarm || hdFarm || raiding || mapBonus || smithyFarm || desolation || toxicity || alchemy) thisSetting.endzone = parseInt(document.getElementById('windowEndZone' + x).value, 10);
		if (raiding && bionic) thisSetting.raidingzone = parseInt(document.getElementById('windowRaidingZone' + x).value, 10);
		if (raiding && !bionic) thisSetting.raidingzone = document.getElementById('windowRaidingZone' + x).value;

		if (mapFarm || alchemy || mapBonus || insanity || desolation || toxicity) {
			thisSetting.special = document.getElementById('windowSpecial' + x).value;
			if (thisSetting.special === 'hc' || thisSetting.special === 'lc')
				thisSetting.gather = document.getElementById('windowGather' + x).value;
			else
				thisSetting.gather = null;
		}
		if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || hdFarm || toxicity) thisSetting.autoLevel = readNiceCheckbox(document.getElementById('windowAutoLevel' + x));
		if (tributeFarm || smithyFarm || mapFarm || alchemy) thisSetting.mapType = document.getElementById('windowMapTypeDropdown' + x).value;
		if (mapFarm && thisSetting.mapType === 'Map Count') thisSetting.repeat = parseFloat(document.getElementById('windowRepeat' + x).value, 10);
		if (mapFarm && thisSetting.mapType !== 'Map Count') thisSetting.repeat = document.getElementById('windowRepeat' + x).value;
		if (toxicity) thisSetting.repeat = document.getElementById('windowRepeat' + x).value;
		if (mapFarm || mapBonus) thisSetting.hdRatio = document.getElementById('windowHDRatio' + x).value;
		if (tributeFarm) thisSetting.tributes = parseInt(document.getElementById('windowTributes' + x).value, 10);
		if (tributeFarm) thisSetting.mets = parseInt(document.getElementById('windowMets' + x).value, 10);
		if (quagmire) thisSetting.bogs = parseInt(document.getElementById('windowBogs' + x).value, 10);
		if (golden) {
			thisSetting.golden = document.getElementById('windowGoldenType' + x).value;
			thisSetting.golden += parseInt(document.getElementById('windowWorld' + x).value, 10);
		}
		if (alchemy) {
			thisSetting.potion = document.getElementById('windowPotionType' + x).value;
			thisSetting.potion += parseInt(document.getElementById('windowPotionNumber' + x).value, 10);
		}
		if (hypothermia) thisSetting.bonfire = parseInt(document.getElementById('windowBonfire' + x).value, 10);
		if (boneShrine) {
			thisSetting.boneamount = parseInt(document.getElementById('windowBoneAmount' + x).value, 10);
			thisSetting.bonebelow = parseInt(document.getElementById('windowBoneBelow' + x).value, 10);
			thisSetting.gather = document.getElementById('windowBoneGather' + x).value;
		}
		if (worshipperFarm) thisSetting.worshipper = parseInt(document.getElementById('windowWorshipper' + x).value, 10);
		if (voidMap) {
			thisSetting.maxvoidzone = parseInt(document.getElementById('windowMaxVoidZone' + x).value, 10);
			thisSetting.hdRatio = parseFloat(document.getElementById('windowHDRatio' + x).value, 10);
			thisSetting.voidHDRatio = parseFloat(document.getElementById('windowVoidHDRatio' + x).value, 10);
			thisSetting.portalAfter = readNiceCheckbox(document.getElementById('windowPortalAfter' + x));

			thisSetting.hdType = document.getElementById('windowHDTypeVoidMap' + x).value;
			thisSetting.hdType2 = document.getElementById('windowHDTypeVoidMap2' + x).value;
		}
		if (tributeFarm) thisSetting.buildings = readNiceCheckbox(document.getElementById('windowBuildings' + x));
		if (mapFarm || tributeFarm || boneShrine) thisSetting.atlantrimp = readNiceCheckbox(document.getElementById('windowAtlantrimp' + x));
		if (smithyFarm) thisSetting.meltingPoint = readNiceCheckbox(document.getElementById('windowMeltingPoint' + x));
		if (!raiding && !smithyFarm && !golden) thisSetting.jobratio = document.getElementById('windowJobRatio' + x).value;
		if (raiding || desolation) {
			thisSetting.prestigeGoal = document.getElementById('windowPrestigeGoal' + x).value;
			if (!bionic && !desolation) thisSetting.raidingDropdown = document.getElementById('windowRaidingDropdown' + x).value;
		}
		if (raiding && !bionic) thisSetting.incrementMaps = readNiceCheckbox(document.getElementById('windowIncrementMapsDefault' + x));

		if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden) thisSetting.runType = document.getElementById('windowRunType' + x).value;

		if (insanity) {
			thisSetting.destack = readNiceCheckbox(document.getElementById('windowBuildings' + x));
			thisSetting.insanity = parseInt(document.getElementById('windowInsanity' + x).value, 10);
		}
		if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden) {
			thisSetting.challenge = thisSetting.runType === 'Filler' ? document.getElementById('windowChallenge' + x).value : null;
			thisSetting.challenge3 = thisSetting.runType === 'C3' ? document.getElementById('windowChallenge3' + x).value : null;
		}

		if (!golden && (isNaN(thisSetting.world) || thisSetting.world < 6)) {
			error += " Preset " + (x + 1) + " needs a value for Start Zone that's greater than 5.<br>";
			errorMessage = true;
		}
		else if (!golden && thisSetting.world > 1000) {
			error += " Preset " + (x + 1) + " needs a value for Start Zone that's less than 1000.<br>";
			errorMessage = true;
		}
		if (!golden && (thisSetting.world + thisSetting.level < 6) && !thisSetting.autoLevel) {
			error += " Preset " + (x + 1) + " can\'t have a zone and map combination below zone 6.<br>";
			errorMessage = true;
		}
		if (mapBonus && (thisSetting.level < (currSettingUniverse === 1 ? 0 - game.portal.Siphonology.level : 0))) {
			error += " Preset " + (x + 1) + " can\'t have a map level below " + ((game.global.universe === 1 && game.portal.Siphonology.level > 0) ? (0 - game.portal.Siphonology.level) : "world level") + " as you won\'t be able to get any map stacks.<br>";
			errorMessage = true;
		}
		if (mapBonus && thisSetting.repeat < 1) {
			error += " Preset " + (x + 1) + " can\'t have a map bonus value lower than 1 as you won\'t be able to get any map stacks.<br>";
			errorMessage = true;
		}
		if (mapFarm && thisSetting.repeat < 1 && thisSetting.repeat !== -1) {
			error += " Preset " + (x + 1) + " can\'t have a repeat value lower than 1 as you won\'t run any maps when this line runs.<br>";
			errorMessage = true;
		}
		if (insanity) {
			if (thisSetting.level === 0 && !thisSetting.autoLevel && thisSetting.destack === false) {
				error += " Preset " + (x + 1) + " can\'t have a map level of 0 as you won\'t gain any Insanity stacks running this map.<br>";
				errorMessage = true;
			}
			if (thisSetting.level < 0 && thisSetting.destack === false && !thisSetting.autoLevel) {
				error += " Preset " + (x + 1) + " can\'t have a map level below world level as you will lose Insanity stacks running this map. To change this toggle the 'Destack' option.<br>";
				errorMessage = true;
			}
			if (thisSetting.level >= 0 && thisSetting.destack === true && !thisSetting.autoLevel) {
				error += " Preset " + (x + 1) + " can\'t have a map level at or above world level as you won't be able to lose Insanity stacks running this map. To change this toggle the 'Destack' option.<br>";
				errorMessage = true;
			}
			if (thisSetting.insanity < 0) {
				error += " Preset " + (x + 1) + " can\'t have a insanity value below 0.<br>";
				errorMessage = true;
			}
		}
		if (errorMessage === true)
			continue;
		if (thisSetting.level > 10) thisSetting.level = 10;
		if (thisSetting.endzone < thisSetting.world) thisSetting.endzone = thisSetting.world;
		if (thisSetting.cell < 1) thisSetting.cell = 1;
		if (thisSetting.cell > 100) thisSetting.cell = 100;
		if (thisSetting.worshipper > game.jobs.Worshipper.max) worshipper = game.jobs.Worshipper.max;
		if (thisSetting.hdRatio < 0) thisSetting.hdRatio = 0;
		if (thisSetting.voidHDRatio < 0) thisSetting.voidHDRatio = 0;
		if (thisSetting.hdRatio < 0) thisSetting.hdRatio = 0;
		if (thisSetting.maxvoidzone < thisSetting.world) thisSetting.maxvoidzone = thisSetting.world;

		if (thisSetting.repeat < 0 && thisSetting.repeat !== -1) thisSetting.repeat = 0;
		if (raiding && !bionic && (thisSetting.raidingzone - thisSetting.world > 10)) thisSetting.raidingzone = thisSetting.world + 10;

		setting.push(thisSetting);
	}
	if (golden) {
		setting.sort(function (a, b) {
			if (a.priority === b.priority) return 1; return (a.priority > b.priority) ? 1 : -1;
		});
	}
	else {
		setting.sort(function (a, b) {
			if (a.priority === b.priority) return (a.world === b.world) ? ((a.cell > b.cell) ? 1 : -1) : ((a.world > b.world) ? 1 : -1); return (a.priority > b.priority) ? 1 : -1;
		});
		//To ensure we always have base settings in position 0 of the array we want to unshift it after sorting.
		setting.unshift(defaultSetting);
	}

	if (error) {
		var elem = document.getElementById('windowError');
		if (elem) elem.innerHTML = error;
		return;
	}
	var value = currSettingUniverse === 2 ? 'valueU2' : 'value';

	//Set settings inside AT
	setPageSetting(varPrefix + 'Settings', setting, currSettingUniverse);
	if (!golden) {
		//Set the amount of rows into the save file so that we can mark settings as done properly
		var obj = [];
		for (var x = 0; x < 30; x++) {
			obj[x] = {};
			obj[x].done = '';
		}

		if (typeof game.global.addonUser !== 'object') setupAddonUser(true);
		if (typeof game.global.addonUser[varPrefix + 'Settings'] === 'undefined') setupAddonUser(true);
		game.global.addonUser[varPrefix + 'Settings'][value] = obj;
	}

	var elem = document.getElementById("tooltipDiv");
	swapClass(document.getElementById('tooltipDiv').classList[0], "tooltipExtraNone", elem);
	cancelTooltip(true);
	if (reopen) {
		var settingName = varPrefix.charAt(0).toUpperCase() + varPrefix.slice(1);
		if (varPrefix.toLowerCase().includes('hdfarm')) settingName = settingName.charAt(0) + settingName.charAt(1).toUpperCase() + settingName.slice(2);
		MAZLookalike(titleText, settingName, 'MAZ');
	}

	saveSettings();
	if (!golden) {
		if (!getPageSetting(varPrefix + 'Settings', currSettingUniverse)[0].active)
			debug(titleText + " has been saved but is disabled. To enable it tick the 'Active' box in the top left of the window.", "mazSettings");
	}
	document.getElementById('tooltipDiv').style.overflowY = '';

	//Disable Void Map global variables when saving Void Map settings to ensure we aren't running voids at the wrong zone after updating.
	if (voidMap) {
		MODULES.mapFunctions.hasVoidFarmed = '';
		delete mapSettings.boneChargeUsed;
		delete mapSettings.voidHDIndex;
		delete mapSettings.dropdown;
		delete mapSettings.dropdown2;
		delete mapSettings.voidTrigger;
		delete mapSettings.portalAfterVoids;
	}
	else if (smithyFarm) {
		delete mapSettings.smithyTarget;
	}
	else if (tributeFarm) {
		delete mapSettings.tribute;
		delete mapSettings.meteorologist;
	}
	else if (alchemy) {
		delete mapSettings.potionTarget;
	}

	//Disables Atlantrimp for 1 second and recalculates mapSettings variable.
	//This is to prevent the issue of Atlantrimp being run when you're saving settings.
	settingChangedTimeout = true;
	farmingDecision();

	setTimeout(
		function () { settingChangedTimeout = false },
		100)
}

function mazPopulateHelpWindow(titleText, trimple) {
	//Setting up the Help onclick setting.
	var mazHelp = "Welcome to <b>" + titleText + "</b> settings!";

	var mapFarm = titleText.includes('Map Farm');
	var mapBonus = titleText.includes('Map Bonus');
	var voidMap = titleText.includes('Void Map');
	var hdFarm = titleText.includes('HD Farm');
	var raiding = titleText.includes('Raiding');
	var bionic = titleText.includes('Bionic');

	var balance = titleText.includes('Balance Destack'.toLowerCase());
	var toxicity = titleText.includes('Toxicity Farm');

	var tributeFarm = titleText.includes('Tribute Farm');
	var smithyFarm = titleText.includes('Smithy Farm');
	var worshipperFarm = titleText.includes('Worshipper Farm');

	var quagmire = titleText.includes('Quagmire');
	var insanity = titleText.includes('Insanity Farm');
	var alchemy = titleText.includes('Alchemy Farm');
	var hypothermia = titleText.includes('Hypothermia Farm');
	var desolation = titleText.includes('Desolation');
	var boneShrine = titleText.includes('Bone Shrine');
	var golden = titleText.includes('Golden');

	var radonSetting = currSettingUniverse === 2;


	if (!golden) mazHelp += " This is a powerful automation tool that allows you to set when maps should be automatically run. Here's a quick overview of what everything does:";
	else if (golden) {
		mazHelp += " This is a powerful automation tool that allows you to set the order of golden upgrade purchases and how many of each type you'd like to have. Here's a quick overview of what everything does:";
	}

	//Brief overview of what the setting does as it's kinda different from other settings.
	if (desolation) {
		mazHelp += "<p>This setting is sligtly different from others. It abuses a bug in the game where you can scum prestiges through a <b>Blacksmithery 3</b> bug. <b>This definitely shouldn't exist so be aware this is exploiting unintentional game mechanics.</b></p>";
		mazHelp += "<li class=\"indent\">By exploiting this bug we get the prestiges from <b>Blacksmithery 3</b> when entering the zone and then the prestiges from the equivalent of doing a +10 map to get those prestiges significantly easier than we should be able to.</li>";
		mazHelp += "<li class=\"indent\">For a more detailed explanation of how this setting works please see the <a href='https://discord.com/channels/371177798305447938/1075840564534202398/1087668293797679194' target='_blank'>guide in the <b>[Guide] Desolation</b> channel on the Trimps Discord.</a></li>";
		mazHelp += "<li class=\"indent\">It will create a +1 map on cell 100 of the zone <b>PRIOR</b> to the start zone you set when the improbability is less than 5 gamma bursts from death.</li>";
		mazHelp += "<li class=\"indent\">It then clears 3 cells before going back into the world and finishing off the improbability and clearing the map on the next zone to take advantage of the bug.</li>";
	}

	//Map Bonus Information to detail how it functions since it's unclear compared to every other setting
	if (mapBonus) mazHelp += "<br><br><b>Map Bonus</b> works by using the last active line that's greater or equal to your current world zone and then using those settings for every zone that follows on from it.";
	if (voidMap) {
		mazHelp += "<br><br>Void Map works by using Min Zone</b> as the lower bound zone to run voids on and <b>Max Zone</b> as the upper bound.";

		mazHelp += "<li class=\"indent\">Additionally it has dropdown inputs which can give you the ability to add more fine-tuning for when a line should be run.";
		mazHelp += "<li class=\"indent\">If you reach the <b>Max Zone</b> zone input of a line it will run regardless of dropdown inputs.";
	}
	if (smithyFarm) mazHelp += "<br><br><b>Smithy Farm</b> will farm resources in the following order <b>Metal > Wood > Gems</b>. This cannot be changed.";

	//Default Value settings
	if (!golden) {
		mazHelp += "<br><br>The top row section consists of toggles/inputs which add extra functions to the setting itself.<br></br><ul>";
		mazHelp += "<li><b>Enabled</b> - A toggle to disable/enable the entire setting.</li>";
		if (raiding && !bionic) {
			mazHelp += "<li><b>Recycle Maps</b> - A toggle to recycle maps after raiding has finished.</li>";
			mazHelp += "<li><b>Increment Maps</b> - A toggle to swap between just running the 1 target zone map and gradually running different maps from lowest map you can obtain a prestige to the highest which can help if you're not strong enough to raid your target zone immediately.</li>";
		}
		if (mapBonus) {
			mazHelp += "<li><b>Job Ratio</b> - The job ratio to use when Map Bonus is set to run from <b>Map Bonus Ratio</b> or <b>Max Map Bonus for Spire</b> settings. If set to <b>-1</b> it will use your world job ratios.</li>"
			mazHelp += "<li class=\"indent\">Input should look like '1,1,1,1' (Farmers, Lumberjacks, Miners, Scientists). If you don't want Farmers, Miners or Scientists you can input '0,1' for this setting.</li>";
			mazHelp += "<li><b>Special</b> - The type of cache you'd like to run when Map Bonus is set to run from <b>Map Bonus Ratio</b> or <b>Max Map Bonus for Spire</b> settings.</li>";
		}
		if (voidMap) {
			mazHelp += "<li><b>Max Map Bonus</b> - Will assume you have 10 map bonus stacks";
			if (radonSetting && !game.portal.Tenacity.radLocked) mazHelp += " and max tenacity";
			mazHelp += " when void maps HD Ratio calcs are being set.</li>";

			if (game.permaBoneBonuses.boosts.owned > 0) mazHelp += "<li><b>Bone Charge</b> - The first time a line starts running Void Maps in each portal it will use a single Bone Charge.</li>";

			mazHelp += "<li><b>Void Farm</b> - Will farm before running void maps if your void hits survived is below the input in <b>Void Farm Hits Survived</b> or your void hd ratio is below the input in <b>Void Farm Void HD Ratio</b>. Farms until you have reached the map cap set in the <b>HD Farm</b> settings.</li>";

			mazHelp += "<li><b>Void Farm Hits Survived</b> - Will farm to this void hits survived value before running void maps. Must be set above 0 to be used otherwise will be ignored.</li>";

			mazHelp += "<li><b>Void Farm HD Ratio</b> - Will farm to this void HD ratio survived value before running void maps. Must be set above 0 to be used otherwise will be ignored.</li>";

			mazHelp += "<li><b>Void Farm Job Ratio</b> - The job ratio to use when farming stats before running void maps.</li>";
			mazHelp += "<li class=\"indent\">Input should look like '1,1,1,1' (Farmers, Lumberjacks, Miners, Scientists). If you don't want Farmers, Miners or Scientists you can input '0,1' for this setting.</li>";
			mazHelp += "<li><b>Map Cap</b> - The maximum amount of maps you would like to run during this farm. If set to -1 it will repeat an Infinite amount of times and you'll have to manually stop farming, would only recommend this if you're confident you'll be able to get enough stats to finish the farm.</li>";
		}
		if (boneShrine) {
			mazHelp += "<li><b>Auto Spend Charges</b> - Enables the ability to automatically spend bone charges when above a certain value.</li>";
			mazHelp += "<li><b>Auto Spend At X Charges</b> - The amount of bone charges you have to reach before one will automatically be spent. Disable this by setting this to a value at or below 0 or above 10.</li>";
			mazHelp += "<li><b>Auto Spend From Z</b> - Will only auto spend bone charges when at or above this zone.</li>";
			mazHelp += "<li><b>Auto Spend Gather</b> - The gather type to use when auto spending bone charges.</li>";
			mazHelp += "<li><b>Auto Spend Job Ratio</b> - The job ratio to use when auto spending bone charges.</li>";
			mazHelp += "<li class=\"indent\">Input should look like '1,1,1,1' (Farmers, Lumberjacks, Miners, Scientists). If you don't want Farmers, Miners or Scientists you can input '0,1' for this setting.</li>";
		}
		if (hdFarm) {
			mazHelp += "<li><b>Job Ratio</b> - The job ratio to use when Map Bonus is set to run from the <b>Hits Survived</b> setting. If set to <b>-1</b> it will use your world job ratios.</li>"
			mazHelp += "<li><b>Map Cap</b> - The maximum amount of maps you would like to run during this farm. If set to -1 it will repeat an Infinite amount of times and you'll have to manually stop farming, would only recommend this if you're confident you'll be able to get enough stats to finish the farm.</li>";
		}
		if (worshipperFarm) {
			mazHelp += "<li><b>Enabled Skip</b> - A toggle to enable the skip value setting.</li>";
			mazHelp += "<li><b>Skip Value</b> - How many worshippers a small/large (dependant on what you have unlocked) savoury cache must provide for you to run your Worshipper Farming.</li>";
		}
		if (alchemy) {
			mazHelp += "<li><b>Void Purchase</b> - Will purchase as many void and strength potions as you can currently afford when you go into a void map. Would recommend only disabling this setting when going for the Alchemy achievement.</li>";
		}
		if (hypothermia) {
			mazHelp += "<li><b>Frozen Castle</b> - The zone,cell combination that you'd like Frozen Castle to be run at. The input style is '200,99' and if you don't input it properly it'll default to zone 200 cell 99.</li>";
			mazHelp += "<li><b>AutoStorage</b> - Disables AutoStorage until the first Bonfire farm zone that you reach during the challenge.</li>";
			mazHelp += "<li><b>Packrat</b> - Will purchase as many levels of packrat as possible once the Hypothermia challenge ends with leftover radon and additionally when portaling it reset the packrat level to 3 so that you don't accidentally trigger a 5th bonfire at the start of the run.</li>";
		}
	}

	if (golden) mazHelp += "<br>";

	//Row Settings
	mazHelp += "</ul></br> The settings for each row that is added:<ul>";

	//All Settings
	mazHelp += "<li><span style='padding-left: 0.3%' class='mazDelete'><span class='icomoon icon-cross'></span></span> - Remove this line completely</li>";
	//Active
	mazHelp += "<li><b>Active</b> - A toggle to disable/enable this line.</li>";
	//Priority
	mazHelp += "<li><b>Priority</b> - If this setting has two or more lines set to trigger at the same cell on the same Zone, the line with the lowest priority will run first. This also determines sort order of lines in the UI.</li>";
	//Zone
	if (!voidMap && !golden) mazHelp += "<li><b>Zone</b> - The Zone that this line should run. Must be between 6 and 1000.</li>";
	//Cell
	if (!golden && !desolation) {
		mazHelp += "<li><b>Cell</b> - The cell number between 1 and 100 where this line should trigger. 1 is the first cell of the Zone, 100 is the final cell.</li>";
		mazHelp += "<li class=\"indent\"><b>Runs on the cell you have input or after if you have already gone past that cell on your zone.</b></li>";
		mazHelp += "<li class=\"indent\"><b>Doesn't take overkill into account so for example if you overkill past c100 with a c100 line it will be skipped.</b></li>";
	}
	//AutoLevel
	if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || hdFarm || toxicity)
		mazHelp += "<li><b>Auto Level</b> - Will automatically identify the best map level for your farming needs by looking at highest affordable map level and then calculating if you can one shot enemies with Titimp buff. " + (radonSetting ? "Highly recommended to use 'Auto Equality: Advanced' with this setting as it'll speed up map runs by a significant amount." : "") + "</li>";
	//Map Level
	if (mapFarm || tributeFarm || smithyFarm || worshipperFarm || hdFarm || insanity || alchemy || hypothermia || toxicity)
		mazHelp += "<li><b>Map Level</b> - The map level you'd like this line to run. Can input a positive or negative number for this so input could be '-5', '0', or '3'. " + ((radonSetting && !(insanity || alchemy || hypothermia)) ? "Will override inputs above -1 during the Wither challenge." : "") + "</li>";
	//Map Level for Map Bonus!
	if (mapBonus)
		mazHelp += "<li><b>Map Level</b> - The map level you'd like this line to run. Can only input a value for a map level you'd be able to gain map stacks from.</li>";

	if (!raiding && !smithyFarm && !hdFarm && !golden) {
		mazHelp += "<li><b>Job Ratio</b> - The job ratio you want to use for this line. If set to <b>-1</b> it will use your world job ratios.</li>";
		mazHelp += "<li class=\"indent\">Input should look like '1,1,1,1' (Farmers, Lumberjacks, Miners, Scientists). If you don't want Farmers, Miners or Scientists you can input '0,1' for this setting.</li>";
	}
	if (mapFarm || mapBonus || insanity || alchemy || desolation || toxicity)
		mazHelp += "<li><b>Special</b> - The type of cache you'd like to run during this map. Will override metal cache inputs with wooden caches during the Transmute challenge.</li>";



	//Setting specific inputs
	//Row Settings
	mazHelp += "</ul></br><b>These inputs are specific to this setting and can be quite important for how you try to set this up:</b><ul><br>";

	if (voidMap) {
		//Min Run Zone
		mazHelp += "<li><b>Min Zone</b> - The lower bound zone to run voids maps on.</li>";
		//Max Run Zone
		mazHelp += "<li><b>Max Zone</b> - The upper bound zone to run voids maps on.</li>";

		//Dropdown
		mazHelp += "<li><b>Dropdowns</b> - Will only run the line when one or more of the dropdown options aren't met OR you are at the <b>End Zone</b> input for that line. The information relating to each of the dropdowns can be found in the Auto Maps status tooltip.</li>";

		mazHelp += "<li class=\"indent\">If you have selected a <b>HD Ratio</b> and that type of <b>HD Ratio</b> is greater than the value input OR if you've selected one of Auto Level, Hits Survived, Hits Survived Void it will check if the value is lower than it and skip if it is.<br></li>";

		mazHelp += "<li><b>Portal After</b> - Will run AutoPortal immediately after this line has run. Won't do anything if AutoPortal is disabled!</b></li>";
	}

	if (mapFarm) {
		//Repeat Count

		mazHelp += "<li><b>Farm Type</b> The different ways that the script can determine how many maps are run.</li>";
		mazHelp += "<li class=\"indent\"><b>Map Count</b> - Will run maps until it has reached the specified repeat counter.</li>";
		mazHelp += "<li class=\"indent\"><b>Zone Time</b> - Uses DD:HH:MM:SS format and will run maps until the zone time surpasses the time set in repeat counter.</li>";
		mazHelp += "<li class=\"indent\"><b>Portal Time</b> - Uses DD:HH:MM:SS format and will run maps until the portal time surpasses the time set in repeat counter.</li>";
		mazHelp += "<li class=\"indent\"><b>Daily Reset</b> - Uses DD:HH:MM:SS format and will run maps until the daily reset time is below the time set in repeat counter.</li>";
		mazHelp += "<li class=\"indent\"><b>Skele Spawn</b> - Uses DD:HH:MM:SS format and will run maps until the time since your last Skeletimp kill was this amount of time or greater.</li>";

		mazHelp += "<li><b>Map Repeats</b> - How many maps you'd like to run during this line. If set to -1 it will repeat an Infinite amount of times and you'll have to manually stop farming, would only recommend this if you're confident you'll be back to manually take over the run.</li>";
		//Run when HD Ratio above X value
		mazHelp += "<li><b>Above X HD Ratio</b> - Will only run this line when your world HD Ratio (can be seen in Auto Maps status tooltip) is above this value (and above 0).<br>";
		//Trimple Map Farm
		mazHelp += "<li><b>Run " + trimple + "</b> - Will run " + trimple + " once this line has been completed.</li>";
		mazHelp += "<li class=\"indent\">Whilst farming for this line the script will stop purchasing equips until " + trimple + " has been run so that there are no wasted resources.</li>";
		mazHelp += "<li class=\"indent\">If " + trimple + " has been run then any line with this enabled won't be run." + "</li>";
	}

	if (mapBonus) {
		mazHelp += "<li><b>Map Stacks</b> - How many stacks the script should aim for when running this line.</li>";
		//Run when HD Ratio above X value
		mazHelp += "<li><b>Above X HD Ratio</b> - Will only run this line when your world HD Ratio (can be seen in Auto Maps status tooltip) is above this value (and above 0).<br>";
	}

	if (raiding) {
		//Raiding Zone
		var raidingZone = bionic ? 'Raiding Zone' : 'Map Level';
		mazHelp += "<li><b>" + raidingZone + "</b> - The " + raidingZone.split(' ')[1].toLowerCase() + " you'd like to raid when this line is run. If <b>Repeat Every X</b> is set to a value above 0 then it will also raise the " + raidingZone.toLowerCase() + " by that value everytime this line runs.</li>";
		if (!bionic) mazHelp += "<li><b>Frag Type</b> - The choices how for aggresively the script will spend fragments on maps.</li>";
		if (!bionic) mazHelp += "<li class=\"indent\"><b>Frag</b>: General all purpose setting. Will set sliders to max and reduce when necessary to afford the maps you're trying to purchase.</li>";
		if (!bionic) mazHelp += "<li class=\"indent\"><b>Frag Min</b>: Used for absolute minimum frag costs. Will set everything but the map size to minimum and gradually reduce that if necessary to purchase maps.</li>";
		if (!bionic) mazHelp += "<li class=\"indent\"><b>Frag Max</b>: This option will make sure that the map has perfect sliders and uses the prestegious special if available.</li>";

		mazHelp += "<li><b>Prestige Goal</b> - The script will identify if the prestige selected here is available in the raiding zone you have input and if so will run maps to get the highest available level of that prestige.</li>";
	}

	if (hdFarm) {
		mazHelp += "<li><b>HD Base</b> - What H:D you'd like to reach.</li>";
		mazHelp += "<li><b>HD Mult</b> - Starting from the zone above the lines initial zone, this setting will multiply the H:D you have set in HD Base. So if your initial zone was 100, HD Base was 10, HD Mult was 1.2, at z101 your H:D target will be 12, then at z102 it will be 14.4 and so on. This way you can account for the zones getting stronger and you will not waste Map Farming for a really low H:D.'</li>";

		mazHelp += "<li><b>HD Type</b> - The type of HD you'd like to target.</li>";
		mazHelp += "<li class=\"indent\">If <b>Map Level</b> has been selected it will farm until auto level reaches that level.</li>";
		mazHelp += "<li class=\"indent\">Will only run Void Map lines if you have void maps in your map chamber.</li>";
		mazHelp += "<li><b>Map Cap</b> - The maximum amount of maps you would like to run during this line. If set to -1 it will repeat an Infinite amount of times and you'll have to manually stop farming, would only recommend this if you're confident you'll be able to get enough stats to finish the farm.</li>";
	}

	if (boneShrine) {
		//To use
		mazHelp += "<li><b>To use</b> - How many bone charges to use on this line.</li>";
		//Use Below
		mazHelp += "<li><b>Use below</b> - This value will stop bone charges being spent when you're at or below this value.</li>";
		//Trimple Bone Shrine
		mazHelp += "<li><b>Run " + trimple + "</b> - Will run " + trimple + " during this line. After using the bone shrine charges specified for this line it will stop AT purchasing equips until " + trimple + " has been run so that there is no wasted resources. <b>Will run " + trimple + " and use the charges after cell 95.</b></li>";
		//Gather setting
		mazHelp += "<li><b>Gather</b> - Which resource you'd like to gather when popping a Bone Shrine charge to make use of Turkimp resource bonus.</li>";
	}

	if (tributeFarm) {
		//Farm Type
		mazHelp += "<li><b>Farm Type</b> - The way in which Tribute Farming will operate. Either by using absolute values for what you'd like to farm e.g. 2700 Tributes and 37 Meteorologists or by having the script identify how many of each you can farm in X maps and then farming until you reach those values.</li>";
		//Tributes
		mazHelp += "<li><b>Tributes</b> - The amount of Tributes that should be farmed up to on this zone. If the value is greater than your Tribute Cap setting then it'll adjust it to the Tribute input whilst doing this farm.</li>";
		//Meteorologists
		mazHelp += "<li><b>Meteorologist</b> - The amount of Meteorologist that should be farmed up to on this zone.</li>";
		//Buy Buildings
		mazHelp += "<li><b>Buy Buildings</b> - If you'd like to buy buildings during this farming line to reduce the amount of maps it takes to farm your specified Tribute or Meteorologist inputs. When unselected it will automatically disable vanilla AutoStructure if it's enabled to remove the possibility of resources being spent there too.</li>";
		//Trimple Tribute Farm
		mazHelp += "<li><b>Run " + trimple + "</b> - Will run " + trimple + " during this line. Autoamtically calculates when it would be more efficient to run " + trimple + " or continue farming Savory Cache maps to reach your target in the fastest time possible.</b></li>";
	}

	if (smithyFarm) {
		//Smithy Count
		mazHelp += "<li><b>Smithies</b> - Smithy count you'd like to reach during this line. If you currently own 18 and want to reach 21 you'd enter 21 into this field.</li>";
		//Farm Type
		mazHelp += "<li><b>Farm Type</b> - The way in which Smithy Farming will operate. Either by using absolute values for what you'd like to farm e.g. 27 Smithies or by having the script identify how many you can farm in X maps and then farming until you reach that value.</li>";
		//Runs MP after the line
		mazHelp += "<li><b>Run MP</b> - Will run Melting Point after this line has been run.</b></li>";
	}

	if (worshipperFarm) {
		//Worshipper Count
		mazHelp += "<li><b>Ship</b> - How many worshippers you'd like to farm up to during this line. Max input is 50 and it'll default to that value if you input anything higher.</li>";
	}

	if (toxicity) {
		//Toxicity Stacks
		mazHelp += "<li><b>Toxic Stacks</b> - How many Toxic Stacks you'd like to farm up to during this line.</li>";
	}

	if (quagmire) {
		//Black Bogs
		mazHelp += "<li><b>Bogs</b> - How many Black Bog maps you'd like to run during this line.</li>";
	}

	if (insanity) {
		//Insanity Stacks
		mazHelp += "<li><b>Insanity</b> - How many Insanity stack you'd like to farm up to during this line.</li>";
		//Destack toggle setting
		mazHelp += "<li><b>Destack</b> - Toggle to allow you to run maps that are lower than world level during Insanity.</li>";
		mazHelp += "<li class=\"indent\">When enabled Insanity Farm will assume you're destacking and it will aim to reduce your max Insanity to the value in the Insanity field.</li>";
	}

	if (alchemy) {
		//Farm Type
		mazHelp += "<li><b>Farm Type</b> - The way in which Alchemy Farm will operate. Either by using absolute values for what you'd like to farm e.g. 5 Potions of Strength or by having the script identify how many you can farm in X maps and then farming until you reach that value.</li>";
		//Potion Type
		mazHelp += "<li><b>Potion Type</b> - The type of potion you want to farm during this line.</li>";
		//Potion Number
		mazHelp += "<li><b>Potion Number</b> - How many of the potion specified in 'Potion Type' you'd like to farm for.</li>";
	}

	if (hypothermia) {
		mazHelp += "<li><b>Bonfires</b> - How many Bonfires should be farmed on this zone. Uses max bonfires built rather than a specific amount to farm for so if you have already built 14 so far during your run and want another 8 then you'd input 22.</li>";
	}

	if (desolation) {
		mazHelp += "<li><b>Prestige Goal</b> - The script will identify if the prestige selected here is available in the zone you have input and if so will run a map to get that prestige.</li>";
	}

	//Repeat Every
	if (mapFarm || tributeFarm || worshipperFarm || smithyFarm || toxicity || desolation || alchemy)
		mazHelp += "<li><b>Repeat Every</b> - Line can be repeated every zone, or set to a custom number depending on need.</li>";
	//End Zone
	if (mapFarm || tributeFarm || worshipperFarm || hdFarm || raiding || mapBonus || smithyFarm || toxicity || desolation || alchemy)
		mazHelp += "<li><b>End Zone</b> - Only matters if you're planning on having this line repeat. If so, the line will stop repeating at this zone. Must be between 6 and 1000.</li>";
	//Run Type
	if (boneShrine || voidMap || mapFarm || tributeFarm || worshipperFarm || hdFarm || raiding || mapBonus || smithyFarm || golden)
		mazHelp += "<li><b>Run Type</b> - What type of run you'd like this line to be run.</li>";

	if (golden) {
		//Amount of golden upgrades to get
		mazHelp += "<li><b>Amount</b> - The amount of golden upgrades to purchase before moving onto the next line.</li>";
		mazHelp += "<li class=\"indent\">Setting this input to <b>-1</b> will purchase this golden type infinitely.</li>";
		//Golden Type
		mazHelp += "<li><b>Golden Type</b> - The type of Golden upgrade that you'd like to get during this line.</li>";

		mazHelp += "<br>";
		var heliumType = currSettingUniverse === 2 ? 'Radon' : 'Helium';
		mazHelp += `You are able to have multiple lines of the same type. For example 8 Void, 12 Battle, 10 ${heliumType}, 8 Battle would end with 8 Golden Voids, 20 Golden Battle, and 10 Golden ${heliumType} upgrades. Requests to buy Golden Void will be skipped if it would put you above 72%.`;
	}

	return mazHelp;
}

function windowToggleHelp(windowWidth) {
	var mazContainer = document.getElementById('windowContainer');
	var helpContainer = document.getElementById('mazHelpContainer');
	var parentWindow = document.getElementById("tooltipDiv");
	//Changing window size depending on setting being opened.
	if (!mazContainer || !helpContainer) return;
	if (mazContainer.style.display === 'block') {
		mazContainer.style.display = 'none';
		helpContainer.style.display = 'block';
		parentWindow.style.overflowY = '';
	}
	else {
		mazContainer.style.display = 'block';
		helpContainer.style.display = 'none';
		parentWindow.style.overflowY = '';
	}
	verticalCenterTooltip();
	parentWindow.style.top = "10%";
	parentWindow.style.left = "1%";
	parentWindow.style.width = windowWidth;
	parentWindow.style.height = 'auto';
	parentWindow.style.maxHeight = window.innerHeight * .85 + 'px';

	if (document.querySelectorAll('#mazHelpContainer li').length > 13) {
		parentWindow.style.overflowY = 'scroll';
	}
}

function saveATAutoJobsConfig() {
	var error = "";
	var errorMessage = false;

	var setting = {};
	var checkboxes = document.getElementsByClassName('autoCheckbox');
	var quantboxes = document.getElementsByClassName('jobConfigQuantity');
	var ratios = ["Farmer", "Lumberjack", "Miner"];
	for (var x = 0; x < checkboxes.length; x++) {
		var name = checkboxes[x].id.split('autoJobCheckbox')[1];
		var checked = checkboxes[x].dataset.checked === 'true';
		if (!setting[name]) setting[name] = {};
		setting[name].enabled = checked;

		if (game.global.universe === 2) {
			if (name === 'NoLumberjacks')
				continue;
			if (name === 'FarmersUntil') {
				setting[name].zone = (quantboxes[x].value);
				continue;
			}
		}

		if (ratios.indexOf(name) !== -1) {
			setting[name].ratio = parseFloat(quantboxes[x].value);
			//Error checking
			if (setting[name].ratio < 0 || isNaN(setting[name].ratio)) {
				error += "Your ratio for " + name + "s needs to be above a valid number of 0 or above.<br>";
				errorMessage = true;
			}
			continue;
		}
		var jobquant = document.getElementById('autoJobQuant' + name).value;
		setting[name].percent = parseFloat(jobquant);

		//Error checking
		if (setting[name].percent < 0 || isNaN(setting[name].percent)) {
			error += "Your spending percentage for " + name + "s needs to be above a valid number of 0 or above.<br>";
			errorMessage = true;
		}
	}
	var portalElem = document.getElementById('autoJobSelfGather');
	if (portalElem) {
		if (portalElem.value) setting.portalOption = portalElem.value;
	}

	if (errorMessage) {
		var elem = document.getElementById('autoJobsError');
		if (elem) elem.innerHTML = error;
		verticalCenterTooltip(true);
		return;
	}

	setPageSetting('jobSettingsArray', setting);

	//Adding in jobs that are locked so that there won't be any issues later on
	if (game.global.universe === 1) {
		//Magmamancer
		if (game.stats.highestLevel.valueTotal() < 230) {
			autoTrimpSettings.jobSettingsArray.value.Magmamancer = {};
			autoTrimpSettings.jobSettingsArray.value.Magmamancer.enabled = true;
			autoTrimpSettings.jobSettingsArray.value.Magmamancer.percent = 100;
		}
	}
	if (game.global.universe === 2) {
		//Meteorologist
		if (game.stats.highestRadLevel.valueTotal() < 30) {
			autoTrimpSettings.jobSettingsArray.valueU2.Meteorologist = {};
			autoTrimpSettings.jobSettingsArray.valueU2.Meteorologist.enabled = true;
			autoTrimpSettings.jobSettingsArray.valueU2.Meteorologist.percent = 100;
		}
		//Worshipper
		if (game.stats.highestRadLevel.valueTotal() < 50) {
			autoTrimpSettings.jobSettingsArray.valueU2.Worshipper = {};
			autoTrimpSettings.jobSettingsArray.valueU2.Worshipper.enabled = true;
			autoTrimpSettings.jobSettingsArray.valueU2.Worshipper.percent = 20;
		}
	}

	cancelTooltip();
	saveSettings();
}

function saveATAutoStructureConfig() {
	var error = "";
	var errorMessage = false;
	var setting = {};
	var checkboxes = document.getElementsByClassName('autoCheckbox');
	var percentboxes = document.getElementsByClassName('structConfigPercent');
	var quantboxes = document.getElementsByClassName('structConfigQuantity');
	for (var x = 0; x < checkboxes.length; x++) {
		var name = checkboxes[x].id.split('structConfig')[1];
		var checked = (checkboxes[x].dataset.checked === 'true');
		if (!setting[name]) setting[name] = {};
		setting[name].enabled = checked;
		if (game.global.universe === 2 && name === 'SafeGateway') {
			var count = parseInt(quantboxes[x].value, 10);
			if (count > 10000) count = 10000;
			count = (isNumberBad(count)) ? 3 : count;
			setting[name].mapCount = count;

			var zone = parseInt(percentboxes[x].value, 10);
			if (zone > 999) zone = 999;
			zone = (isNumberBad(zone)) ? 3 : zone;
			setting[name].zone = zone;

			continue;
		}

		var perc = parseFloat(percentboxes[x].value, 10);
		if (perc > 100) perc = 100;
		setting[name].percent = perc;

		//Error checking
		if (setting[name].percent < 0 || isNaN(setting[name].percent)) {
			error += "Your spending percentage for " + name + "s needs to be above a valid number of 0 or above.<br>";
			errorMessage = true;
		}

		var max = parseInt(quantboxes[x].value, 10);
		if (max > 10000) max = 10000;
		setting[name].buyMax = max;

		//Error checking
		if (setting[name].buyMax < 0 || isNaN(setting[name].buyMax)) {
			error += "Your spending percentage for " + name + "s needs to be above a valid number of 0 or above.<br>";
			errorMessage = true;
		}

		if (name === 'Nursery') {
			if (game.stats.highestLevel.valueTotal() < 230) {
				setting[name].fromZ = 0;
			}
			else {
				var fromZ = parseInt(document.getElementById('nurseryFromZ').value, 10);
				if (fromZ > 999) fromZ = 999;
				fromZ = (isNumberBad(fromZ)) ? 999 : fromZ;
				setting[name].fromZ = fromZ;

				//Error checking
				if (setting[name].fromZ < 0 || isNaN(setting[name].fromZ)) {
					error += "Your zone input for " + name + "s needs to be above a valid number of 0 or above.<br>";
					errorMessage = true;
				}
			}
		}
	}

	var portalElem = document.getElementById('autoJobSelfGather');
	if (portalElem) {
		if (portalElem.value) setting.portalOption = portalElem.value;
	}

	if (errorMessage) {
		var elem = document.getElementById('autoJobsError');
		if (elem) elem.innerHTML = error;
		verticalCenterTooltip(false, true);
		return;
	}

	setPageSetting('buildingSettingsArray', setting);

	//Adding in buildings that are locked so that there won't be any issues later on
	if (game.global.universe === 2 && game.stats.highestRadLevel.valueTotal() < 130) {
		autoTrimpSettings.buildingSettingsArray.valueU2.Laboratory = {};
		autoTrimpSettings.buildingSettingsArray.valueU2.Laboratory.enabled = true;
		autoTrimpSettings.buildingSettingsArray.valueU2.Laboratory.percent = 100;
		autoTrimpSettings.buildingSettingsArray.valueU2.Laboratory.buyMax = 0;
	}
	if (game.global.universe === 2 && game.buildings.Antenna.locked) {
		autoTrimpSettings.buildingSettingsArray.valueU2.Antenna = {};
		autoTrimpSettings.buildingSettingsArray.valueU2.Antenna.enabled = true;
		autoTrimpSettings.buildingSettingsArray.valueU2.Antenna.percent = 100;
		autoTrimpSettings.buildingSettingsArray.valueU2.Antenna.buyMax = 0;
	}

	cancelTooltip();
	saveSettings();
}

function saveATUniqueMapsConfig(setting) {

	var error = "";
	var errorMessage = false;
	var ATsetting = getPageSetting('uniqueMapSettingsArray', currSettingUniverse);
	var setting = ATsetting;
	var checkboxes = document.getElementsByClassName('autoCheckbox');
	var zoneBoxes = document.getElementsByClassName('structConfigZone');
	var cellBoxes = document.getElementsByClassName('structConfigCell');
	var y = 0;
	var z = 0;
	for (var x = 0; x < checkboxes.length; x++) {
		var name = checkboxes[x].id.split('autoJobCheckbox')[1];
		var checked = (checkboxes[x].dataset.checked === 'true');
		//if (!checked && !setting[name]) continue;
		if (!setting[name]) setting[name] = {};
		setting[name].enabled = checked;

		if (name.includes('MP Smithy')) {
			var valueBoxes = document.getElementsByClassName('jobConfigQuantity');

			var value = parseInt(valueBoxes[z].value, 10);
			if (value > 10000) value = 10000;
			value = (isNumberBad(value)) ? 999 : value;
			setting[name].value = value;
			z++;
			continue;
		}

		var zone = parseInt(zoneBoxes[y].value, 10);
		if (zone > 999) zone = 999;
		if (zone < 0) zone = 0;
		zone = (isNumberBad(zone)) ? 0 : zone;

		setting[name].zone = zone;

		var cell = parseInt(cellBoxes[y].value, 10);
		if (cell > 100) cell = 100;
		if (cell < 1) cell = 1;
		cell = (isNumberBad(cell)) ? 0 : cell;
		setting[name].cell = cell;

		//Error checking
		/* if (name.includes('Big Wall') && zone < 7)
			error += " Big Wall can't be run below zone 7.<br>";
		if (name.includes('The Block') && zone < 11)
			error += " The Block can't be run below zone 11.<br>";
		if (name.includes('The Wall') && zone < 15)
			error += " The Wall can't be run below zone 15.<br>";
		if (name.includes('Dimension of Anger') && zone < 21)
			error += " Dimension of Anger can't be run below zone 21.<br>";
		if (name.includes('Dimension of Rage') && zone < 16)
			error += " Dimension of Rage can't be run below zone 16.<br>";
		if (name.includes('Prismatic Palace') && zone < 21)
			error += " Prismatic Palace can't be run below zone 21.<br>";
		if ((name.includes('Atlantrimp') || name.includes('Trimple Of Doom')) && (zone < 33 || (zone === 33 && cell < 50)))
			error += " " + name + " can't be run below zone 33 cell 50.<br>";
		if (name.includes('Melting Point') && (zone < 50 || (zone === 50 && cell < 56)))
			error += " Melting Point can't be run below zone 50 cell 56.<br>";
		if (name.includes('The Prison') && zone < 80)
			error += " The Prison can't be run below zone 80.<br>";
		if (name.includes('Imploding Star') && zone < 170)
			error += " Imploding Star can't be run below zone 170.<br>";
		if (name.includes('Frozen Castle') && zone < 175)
			error += " Frozen Castle can't be run below zone 175.<br>";
		if (error !== '') errorMessage = true; */

		y++;
	}

	if (errorMessage) {
		var elem = document.getElementById('autoJobsError');
		if (elem) elem.innerHTML = error;
		return;
	}

	setPageSetting('uniqueMapSettingsArray', setting, currSettingUniverse);
	cancelTooltip();
	saveSettings();
}

function saveATDailyAutoPortalConfig() {
	var setting = getPageSetting('dailyPortalSettingsArray', currSettingUniverse);
	var checkboxes = document.getElementsByClassName('autoCheckbox');
	var percentboxes = document.getElementsByClassName('structConfigPercent');

	for (var x = 0; x < checkboxes.length; x++) {
		var name = checkboxes[x].id.split('structConfig')[1];
		var checked = (checkboxes[x].dataset.checked === 'true');
		if (!setting[name]) setting[name] = {};
		setting[name].enabled = checked;

		var zone = parseInt(percentboxes[x].value, 10);
		if (zone > 100) zone = 100;
		zone = (Number.isInteger(zone)) ? zone : 0;
		setting[name].zone = zone;
	}

	setPageSetting('dailyPortalSettingsArray', setting, currSettingUniverse);
	cancelTooltip();
	saveSettings();
}

function saveC2RunnerSettings() {

	var setting = getPageSetting('c2RunnerSettings', currSettingUniverse);
	var checkboxes = document.getElementsByClassName('autoCheckbox');
	var percentboxes = document.getElementsByClassName('structConfigPercent');

	for (var x = 0; x < checkboxes.length; x++) {
		var name = checkboxes[x].id.split('structConfig')[1];
		var checked = (checkboxes[x].dataset.checked === 'true');
		//if (!checked && !setting[name]) continue;
		if (!setting[name]) setting[name] = {};
		setting[name].enabled = checked;

		var zone = parseInt(percentboxes[x].value, 10);
		if (zone > 810) zone = 810;
		zone = (Number.isInteger(zone)) ? zone : 0;
		setting[name].zone = zone;
	}

	setPageSetting('c2RunnerSettings', setting, currSettingUniverse);
	cancelTooltip();
	saveSettings();
}

function addRow(varPrefix, titleText) {
	var settingName = varPrefix.charAt(0).toLowerCase() + varPrefix.slice(1);
	//Special case for HD Farm settings
	if (varPrefix === 'HDFarm') settingName = settingName.charAt(0) + settingName.charAt(1).toLowerCase() + settingName.slice(2);

	for (var x = 0; x < 30; x++) {
		var elem = document.getElementById('windowWorld' + x);
		if (!elem) continue;

		if (elem.value === "-2") {
			var parent = document.getElementById('windowRow' + x);
			if (parent) {
				parent.style.display = 'block';
				if (!titleText.includes('Golden') && !titleText.includes('Desolation')) elem.value = game.global.world < 6 ? 6 : game.global.world;

				if (currSettingUniverse === 1) {
					//Changing rows to use the colour of the Nature type that the world input will be run on.
					var natureStyle = ['unset', 'rgba(50, 150, 50, 0.75)', 'rgba(60, 75, 130, 0.75)', 'rgba(50, 50, 200, 0.75)'];
					var natureList = ['None', 'Poison', 'Wind', 'Ice'];
					var index = natureList.indexOf(getZoneEmpowerment(elem.value));
					elem.parentNode.style.background = natureStyle[index];
				}

				if ((!titleText.includes('Smithy') && !titleText.includes('Worshipper Farm') && !titleText.includes('HD Farm')) && document.getElementById('windowRepeat' + x) !== null)
					document.getElementById('windowRepeat' + x).value = 0;
				if ((titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Worshipper Farm') || titleText.includes('Raiding') || titleText.includes('Smithy Farm') || titleText.includes('Alchemy Farm')) && document.getElementById('windowRepeatEvery' + x) !== null)
					document.getElementById('windowRepeatEvery' + x).value = 0;
				if ((titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Worshipper Farm') || titleText.includes('HD Farm') || titleText.includes('Raiding') || titleText.includes('Map Bonus') || titleText.includes('Smithy Farm') || titleText.includes('Desolation') || titleText.includes('Alchemy Farm') || titleText.includes('Toxicity Farm')) && document.getElementById('windowEndZone' + x) !== null)
					document.getElementById('windowEndZone' + x).value = 999;
				if (titleText.includes('Void Map') && document.getElementById('windowMaxVoidZone' + x) !== null)
					document.getElementById('windowMaxVoidZone' + x).value = game.global.world < 6 ? 6 : game.global.world;
				if (document.getElementById('windowRaidingZone' + x) !== null)
					document.getElementById('windowRaidingZone' + x).value = elem.value;
				if (document.getElementById('windowBoneGather' + x) !== null)
					document.getElementById('windowBoneGather' + x).value = 'food';
				if (document.getElementById('windowBuildings' + x) !== null) {
					if (titleText.includes('Insanity')) document.getElementById('windowBuildings' + x).value = false;
					else document.getElementById('windowBuildings' + x).value = true;
				}
				if (document.getElementById('windowChallenge' + x) !== null)
					document.getElementById('windowChallenge' + x).value = 'All';
				if (document.getElementById('windowChallenge3' + x) !== null)
					document.getElementById('windowChallenge3' + x).value = 'All';
				if (document.getElementById('windowAtlantrimp' + x) !== null)
					document.getElementById('windowAtlantrimp' + x).value = false;
				if (document.getElementById('windowMeltingPoint' + x) !== null)
					document.getElementById('windowMeltingPoint' + x).value = false;
				if (document.getElementById('windowPortalAfter' + x) !== null)
					document.getElementById('windowPortalAfter' + x).value = false;
				if (document.getElementById('windowAutoLevel' + x) !== null)
					document.getElementById('windowAutoLevel' + x).value = true;
				if (document.getElementById('windowMapCap' + x) !== null && typeof (getPageSetting(settingName + 'Settings', currSettingUniverse)[0].mapCap) !== 'undefined')
					document.getElementById('windowMapCap' + x).value = getPageSetting(settingName + 'Settings', currSettingUniverse)[0].mapCap;

				if (titleText.includes('Map Bonus') && document.getElementById('windowLevel' + x) !== null)
					document.getElementById('windowLevel' + x).value = 0;
				updateWindowPreset(x, varPrefix);
				swapClass('disabled', 'active', parent);
			}
		}

		if (titleText.includes('Golden') || titleText.includes('Desolation')) {
			var elemWorld = document.getElementById('windowWorld' + x);
			if (!elemWorld) continue;
			if (elemWorld.value === "-2") {
				var parent2 = document.getElementById('windowRow' + x);
				if (parent2) {
					parent2.style.display = 'block';
					if (titleText.includes('Desolation')) elem.value = game.global.world < 6 ? 6 : game.global.world;
					else elemWorld.value = 0;
					updateWindowPreset(x, varPrefix);
					break;
				}
			}
		} else {
			var elemCell = document.getElementById('windowCell' + x);
			if (!elemCell) continue;
			if (elemCell.value === "-1") {
				var parent2 = document.getElementById('windowRow' + x);
				if (parent2) {
					parent2.style.display = 'block';
					elemCell.value = 1;
					updateWindowPreset(x, varPrefix);
					break;
				}
			}
		}
	}

	var elem = document.getElementById("tooltipDiv");
	elem.style.top = "10%";
	elem.style.left = "1%";
	elem.style.height = 'auto';
	elem.style.maxHeight = window.innerHeight * .85 + 'px';
	if (document.getElementById('windowContainer') !== null && document.getElementById('windowContainer').style.display === 'block' && document.querySelectorAll('#windowContainer .active').length > 10) elem.style.overflowY = 'scroll';
	else elem.style.overflowY = 'none';

	var btnElem = document.getElementById('windowAddRowBtn');
	for (var y = 0; y < 30; y++) {
		var elem = document.getElementById('windowWorld' + y);
		if (elem && elem.value === "-2") {
			btnElem.style.display = 'inline-block';
			return;
		}
		var elemCell = document.getElementById('windowCell' + y);
		if (elemCell && elem.value === "-1") {
			btnElem.style.display = 'inline-block';
			return;
		}
	}
	btnElem.style.display = 'none';
}

function removeRow(index, titleText) {

	var mapFarm = titleText.includes('Map Farm');
	var mapBonus = titleText.includes('Map Bonus');
	var voidMap = titleText.includes('Void Map');
	var hdFarm = titleText.includes('HD Farm');
	var raiding = titleText.includes('Raiding');
	var bionic = titleText.includes('Bionic');

	var balance = titleText.includes('Balance Destack'.toLowerCase());
	var toxicity = titleText.includes('Toxicity Farm');

	var quagmire = titleText.includes('Quagmire');
	var insanity = titleText.includes('Insanity Farm');
	var alchemy = titleText.includes('Alchemy Farm');
	var hypothermia = titleText.includes('Hypothermia Farm');
	var desolation = titleText.includes('Desolation');
	var boneShrine = titleText.includes('Bone Shrine');
	var golden = titleText.includes('Golden');

	var tributeFarm = titleText.includes('Tribute Farm');
	var smithyFarm = titleText.includes('Smithy Farm');
	var worshipperFarm = titleText.includes('Worshipper Farm');

	var elem = document.getElementById('windowRow' + index);
	var checkBox;
	if (!elem) return;
	document.getElementById('windowWorld' + index).value = -2;
	if (!golden && !desolation) document.getElementById('windowCell' + index).value = -1;
	if (!quagmire && !boneShrine && !raiding && !voidMap && !golden && !desolation) document.getElementById('windowLevel' + index).value = 0;
	if (mapFarm || alchemy || insanity || mapBonus || desolation || toxicity) document.getElementById('windowSpecial' + index).value = '0';
	if (mapFarm || alchemy || mapBonus || insanity || toxicity) document.getElementById('windowGather' + index).value = 'food';
	if (mapFarm || smithyFarm || mapBonus || hdFarm || toxicity) document.getElementById('windowRepeat' + index).value = 0;
	if (hdFarm) document.getElementById('windowHDMult' + index).value = 0;
	if (mapFarm || tributeFarm || worshipperFarm || raiding || smithyFarm || desolation || toxicity || alchemy) document.getElementById('windowRepeatEvery' + index).value = 0;
	if (mapFarm || tributeFarm || worshipperFarm || hdFarm || raiding || mapBonus || smithyFarm || desolation || toxicity || alchemy) document.getElementById('windowEndZone' + index).value = 0;
	if (tributeFarm) document.getElementById('windowTributes' + index).value = 0;
	if (tributeFarm) document.getElementById('windowMets' + index).value = 0;
	if (quagmire) document.getElementById('windowBogs' + index).value = 0;
	if (insanity) document.getElementById('windowInsanity' + index).value = 0;
	if (hdFarm) document.getElementById('windowHDType' + index).value = 'world';
	if (golden) document.getElementById('windowGoldenType' + index).value = 'h';
	if (hypothermia) document.getElementById('windowBonfire' + index).value = 0;
	if (boneShrine) document.getElementById('windowBoneAmount' + index).value = 0;
	if (boneShrine) document.getElementById('windowBoneBelow' + index).value = 0;
	if (worshipperFarm) document.getElementById('windowWorshipper' + index).value = 50;
	if (voidMap || mapFarm) document.getElementById('windowHDRatio' + index).value = 0;
	if (voidMap) document.getElementById('windowVoidHDRatio' + index).value = 0;
	if (mapFarm || tributeFarm || boneShrine) {
		checkBox = document.getElementById('windowAtlantrimp' + index);
		swapClass("icon-", "icon-checkbox-unchecked", checkBox);
		checkBox.setAttribute('data-checked', false);
	}
	if (smithyFarm) {
		checkBox = document.getElementById('windowMeltingPoint' + index);
		swapClass("icon-", "icon-checkbox-unchecked", checkBox);
		checkBox.setAttribute('data-checked', false);
	}
	if (voidMap) {
		checkBox = document.getElementById('windowPortalAfter' + index);
		swapClass("icon-", "icon-checkbox-unchecked", checkBox);
		checkBox.setAttribute('data-checked', false);
	}
	if (tributeFarm) {
		checkBox = document.getElementById('windowBuildings' + index);
		swapClass("icon-", "icon-checkbox-checked", checkBox);
		checkBox.setAttribute('data-checked', true);
	}
	if (insanity) {
		checkBox = document.getElementById('windowBuildings' + index);
		swapClass("icon-checkbox-checked", "icon-", checkBox);
		checkBox.setAttribute('data-checked', false);
	}
	if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || hdFarm || toxicity) {
		var checkBox = document.getElementById('windowAutoLevel' + index);
		swapClass("icon-", "icon-checkbox-checked", checkBox);
		checkBox.setAttribute('data-checked', true);
	}
	if (!raiding && !smithyFarm && !golden) document.getElementById('windowJobRatio' + index).value = '1,1,1,1';
	if (raiding || desolation) document.getElementById('windowPrestigeGoal' + index).value = 'All';
	if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden) document.getElementById('windowRunType' + index).value = 'All';
	if (raiding && !bionic) document.getElementById('windowRaidingDropdown' + index).value = 0;
	if (tributeFarm || smithyFarm || alchemy) document.getElementById('windowMapTypeDropdown' + index).value = 'Absolute';
	if (mapFarm) document.getElementById('windowMapTypeDropdown' + index).value = 'Map Count';
	if (boneShrine) document.getElementById('windowBoneGather' + index).value = 'metal';

	elem.style.display = 'none';
	var btnElem = document.getElementById('windowAddRowBtn');
	btnElem.style.display = 'inline-block';
	swapClass('active', 'disabled', elem);

	var elem = document.getElementById("tooltipDiv");
	elem.style.top = "10%";
	elem.style.left = "1%";
	elem.style.height = 'auto';
	elem.style.maxHeight = window.innerHeight * .85 + 'px';
	if (document.getElementById('windowContainer') !== null && document.getElementById('windowContainer').style.display === 'block' && document.querySelectorAll('#windowContainer .active').length > 10) elem.style.overflowY = 'scroll';
	else elem.style.overflowY = 'none';
}

function updateWindowPreset(index, varPrefix) {
	varPrefix = !varPrefix ? document.getElementById('tipTitle').innerHTML.replace(/ /g, '') : varPrefix;
	if (!index) index = '';
	var row = document.getElementById('windowRow' + index);

	var mapFarm = varPrefix.includes('MapFarm');
	var mapBonus = varPrefix.includes('MapBonus');
	var voidMap = varPrefix.includes('VoidMap');
	var hdFarm = varPrefix.includes('HDFarm');
	var raiding = varPrefix.includes('Raiding');
	var bionic = varPrefix.includes('Bionic');

	var balance = varPrefix.includes('Balance'.toLowerCase());
	var toxicity = varPrefix.includes('Toxicity');

	var quagmire = varPrefix.includes('Quagmire');
	var insanity = varPrefix.includes('Insanity');
	var alchemy = varPrefix.includes('Alchemy');
	var hypothermia = varPrefix.includes('Hypothermia');
	var desolation = varPrefix.includes('Desolation');

	var boneShrine = varPrefix.includes('BoneShrine');
	var golden = varPrefix.includes('Golden');
	var tributeFarm = varPrefix.includes('Tribute');
	var smithyFarm = varPrefix.includes('Smithy');
	var worshipperFarm = varPrefix.includes('Worshipper');

	if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding || golden) {
		if (index !== '') {
			var runType = document.getElementById('windowRunType' + index).value;

			if ((runType !== 'Filler' && row.classList.contains('windowChallengeOn' + varPrefix)) ||
				(runType === 'Filler' && row.classList.contains('windowChallengeOff' + varPrefix))) {
				newClass = runType === 'Filler' ? "windowChallengeOn" + varPrefix + "" : "windowChallengeOff" + varPrefix + "";
				newClass2 = runType !== 'Filler' ? "windowChallengeOn" + varPrefix + "" : "windowChallengeOff" + varPrefix + "";
				swapClass(newClass2, newClass, row);
			}

			if ((runType !== 'C3' && row.classList.contains('windowChallenge3On' + varPrefix)) ||
				(runType === 'C3' && row.classList.contains('windowChallenge3Off' + varPrefix))) {
				newClass = runType === 'C3' ? "windowChallenge3On" + varPrefix + "" : "windowChallenge3Off" + varPrefix + "";
				newClass2 = runType !== 'C3' ? "windowChallenge3On" + varPrefix + "" : "windowChallenge3Off" + varPrefix + "";
				swapClass(newClass2, newClass, row);
			}
		}
	}

	if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || toxicity) {
		if (index !== '') {
			var autoLevel = document.getElementById('windowAutoLevel' + index).dataset.checked === 'true' ? 'windowLevelOff' : 'windowLevelOn';
			swapClass('windowLevel', autoLevel, row);
			document.getElementById('windowLevel' + index).disabled = document.getElementById('windowAutoLevel' + index).dataset.checked === 'true' ? true : false;
		}
	}

	if (mapFarm || alchemy || mapBonus || insanity || desolation || toxicity) {
		if (index !== '' || mapBonus) {
			var special = document.getElementById('windowSpecial' + index).value;
			newClass = (special === 'hc' || special === 'lc') ? 'windowGatherOn' : 'windowGatherOff';
			swapClass('windowGather', newClass, row);
		}
	}

	if (hdFarm) {
		if (index !== '') {
			var special = document.getElementById('windowHDType' + index).value;

			newClass = (special === 'maplevel') ? 'windowMapLevelOff' : 'windowMapLevelOn';
			swapClass('windowMapLevel', newClass, row);
			if (special === 'maplevel') {
				document.getElementById('windowRepeat' + index).parentNode.children[0].innerHTML = 'Map Level';
			} else {
				document.getElementById('windowRepeat' + index).parentNode.children[0].innerHTML = '';
			}
		}
	}

	if (currSettingUniverse === 1 && index !== '') {
		//Changing rows to use the colour of the Nature type that the world input will be run on.
		var world = document.getElementById('windowWorld' + index);
		var natureStyle = ['unset', 'rgba(50, 150, 50, 0.75)', 'rgba(60, 75, 130, 0.75)', 'rgba(50, 50, 200, 0.75)'];
		var natureList = ['None', 'Poison', 'Wind', 'Ice'];
		var index = natureList.indexOf(getZoneEmpowerment(world.value));
		world.parentNode.style.background = natureStyle[index];
	}
}

function dailyModifiersOutput() {
	var daily = game.global.dailyChallenge;
	var dailyMods = dailyModifiers;
	if (!daily) return "";
	var returnText = "";
	for (var item in daily) {
		if (item === 'seed') continue;
		returnText += dailyMods[item].description(daily[item].strength) + "<br>";
	}
	return returnText
}

function displayDropdowns(universe, vals, varPrefix, hdType) {

	if (!universe) universe = game.global.universe;
	if (!vals) return "Issue with establishing values for dropdowns";

	var dropdown = {

	};
	var highestZone = universe === 1 ? game.stats.highestLevel.valueTotal() : game.stats.highestRadLevel.valueTotal();

	if (!hdType) hdType = "hdType";
	else hdType = hdType;
	//Gather dropdown
	dropdown.gather = "<option value='food'" + ((vals.gather === 'food') ? " selected='selected'" : "") + ">Food</option>\
		<option value='wood'" + ((vals.gather === 'wood') ? " selected = 'selected'" : "") + " > Wood</option>\
		<option value='metal'" + ((vals.gather === 'metal') ? " selected = 'selected'" : "") + " > Metal</option>\
		<option value='science'" + ((vals.gather === 'science') ? " selected = 'selected'" : "") + " > Science</option> "

	//HD Type dropdown
	dropdown.hdType = "<option value='world'" + ((vals[hdType] === 'world') ? " selected='selected'" : "") + ">World HD Ratio</option>\
		<option value='map'" + ((vals[hdType] === 'map') ? " selected = 'selected'" : "") + " >Map HD Ratio</option>\
		<option value='void'" + ((vals[hdType] === 'void') ? " selected = 'selected'" : "") + " >Void HD Ratio</option>\
		<option value='maplevel'" + ((vals[hdType] === 'maplevel') ? " selected = 'selected'" : "") + " >Map Level</option>\
		<option value='hitsSurvived'" + ((vals[hdType] === 'hitsSurvived') ? " selected = 'selected'" : "") + " >Hits Survived</option>\
		<option value='hitsSurvivedVoid'" + ((vals[hdType] === 'hitsSurvivedVoid') ? " selected = 'selected'" : "") + " >Void Hits Survived</option>"

	//Map Type dropdown
	dropdown.mapType = '';
	if (varPrefix !== 'MapFarm')
		dropdown.mapType += "<option value='Absolute'" + ((vals.mapType === 'Absolute') ? " selected='selected'" : "") + ">Absolute</option>";
	dropdown.mapType += "<option value='Map Count'" + ((vals.mapType === 'Map Count') ? " selected='selected'" : "") + ">Map Count</option>";
	if (varPrefix === 'MapFarm') {
		dropdown.mapType += "<option value='Zone Time'" + ((vals.mapType === 'Zone Time') ? " selected='selected'" : "") + ">Zone Time</option>";
		dropdown.mapType += "<option value='Portal Time'" + ((vals.mapType === 'Portal Time') ? " selected='selected'" : "") + ">Portal Time</option>";
		dropdown.mapType += "<option value='Daily Reset'" + ((vals.mapType === 'Daily Reset') ? " selected='selected'" : "") + ">Daily Reset</option>";
		dropdown.mapType += "<option value='Skele Spawn'" + ((vals.mapType === 'Skele Spawn') ? " selected='selected'" : "") + ">Skele Spawn</option>";
	}

	//Map Numbers 0-10;

	dropdown.mapLevel = "<option value='0'" + ((vals.raidingzone === '0') ? " selected='selected'" : "") + ">0</option>";
	if (trimpStats.plusLevels) {
		dropdown.mapLevel += "<option value='1'" + ((vals.raidingzone === '1') ? " selected='selected'" : "") + ">+1</option>\
		<option value='2'" + ((vals.raidingzone === '2') ? " selected='selected'" : "") + ">+2</option>\
		<option value='3'" + ((vals.raidingzone === '3') ? " selected='selected'" : "") + ">+3</option>\
		<option value='4'" + ((vals.raidingzone === '4') ? " selected='selected'" : "") + ">+4</option>\
		<option value='5'" + ((vals.raidingzone === '5') ? " selected='selected'" : "") + ">+5</option>\
		<option value='6'" + ((vals.raidingzone === '6') ? " selected='selected'" : "") + ">+6</option>\
		<option value='7'" + ((vals.raidingzone === '7') ? " selected='selected'" : "") + ">+7</option>\
		<option value='8'" + ((vals.raidingzone === '8') ? " selected='selected'" : "") + ">+8</option>\
		<option value='9'" + ((vals.raidingzone === '9') ? " selected='selected'" : "") + ">+9</option>\
		<option value='10'" + ((vals.raidingzone === '10') ? " selected='selected'" : "") + ">+10</option>";
	}


	//Prestige Goal dropdown
	dropdown.prestigeGoal = "<option value='All'" + ((vals.prestigeGoal === 'All') ? " selected='selected'" : "") + ">All</option>\
		<option value='Shield'" + ((vals.prestigeGoal === 'Shield') ? " selected='selected'" : "") + ">Shield</option>\
		<option value='Dagger'" + ((vals.prestigeGoal === 'Dagger') ? " selected='selected'" : "") + ">Dagger</option>\
		<option value='Boots'" + ((vals.prestigeGoal === 'Boots') ? " selected = 'selected'" : "") + " > Boots</option>\
		<option value='Mace'" + ((vals.prestigeGoal === 'Mace') ? " selected = 'selected'" : "") + " > Mace</option>\
		<option value='Helmet'" + ((vals.prestigeGoal === 'Helmet') ? " selected = 'selected'" : "") + " > Helmet</option>\
		<option value='Polearm'" + ((vals.prestigeGoal === 'Polearm') ? " selected = 'selected'" : "") + " > Polearm</option>\
		<option value='Pants'" + ((vals.prestigeGoal === 'Pants') ? " selected = 'selected'" : "") + " > Pants</option>\
		<option value='Battleaxe'" + ((vals.prestigeGoal === 'Battleaxe') ? " selected = 'selected'" : "") + " > Battleaxe</option>\
		<option value='Shoulderguards'" + ((vals.prestigeGoal === 'Shoulderguards') ? " selected = 'selected'" : "") + " > Shoulderguards</option>\
		<option value='Greatsword'" + ((vals.prestigeGoal === 'Greatsword') ? " selected = 'selected'" : "") + " > Greatsword</option>\
		<option value='Breastplate'" + ((vals.prestigeGoal === 'Breastplate') ? " selected = 'selected'" : "") + " > Breastplate</option>";
	if (game.global.slowDone) dropdown.prestigeGoal += "<option value='Arbalest'" + ((vals.prestigeGoal === 'Arbalest') ? " selected='selected'" : "") + ">Arbalest</option>";
	if (game.global.slowDone) dropdown.prestigeGoal += "<option value='Gambeson'" + ((vals.prestigeGoal === 'Gambeson') ? " selected='selected'" : "") + ">Gambeson</option>";

	if (universe === 1) {
		//Specials dropdown with conditions for each unlock to only appear when the user can run them.
		dropdown.special = "<option value='0'" + ((vals.special === '0') ? " selected='selected'" : "") + ">No Modifier</option>";
		if (highestZone >= 60) dropdown.special += "<option value='fa'" + ((vals.special === 'fa') ? " selected='selected'" : "") + ">Fast Attack</option>\<option value='lc'" + ((vals.special === 'lc') ? " selected='selected'" : "") + ">Large Cache</option>";
		if (highestZone >= 85) dropdown.special += "<option value = 'ssc'" + ((vals.special === 'ssc') ? " selected = 'selected'" : "") + " > Small Savory Cache</option>\
				<option value='swc'" + ((vals.special === 'swc') ? " selected = 'selected'" : "") + " > Small Wooden Cache</option>\
				<option value='smc'" + ((vals.special === 'smc') ? " selected = 'selected'" : "") + " > Small Metal Cache</option> ";
		if (highestZone >= 135) dropdown.special += "<option value='p'" + ((vals.special === 'p') ? " selected='selected'" : "") + ">Prestigious</option>";
		if (highestZone >= 160) dropdown.special += "<option value='hc'" + ((vals.special === 'hc') ? " selected='selected'" : "") + ">Huge Cache</option>";
		if (highestZone >= 185) dropdown.special += "<option value='lsc'" + ((vals.special === 'lsc') ? " selected='selected'" : "") + ">Large Savory Cache</option>\
				<option value='lwc'" + ((vals.special === 'lwc') ? " selected='selected'" : "") + ">Large Wooden Cache</option>\
				<option value='lmc'" + ((vals.special === 'lmc') ? " selected='selected'" : "") + ">Large Metal Cache</option>";

		//Challenge dropdown with conditions for each unlock to only appear when the user can run them.
		dropdown.challenge = "<option value='All'" + ((vals.challenge === 'All') ? " selected='selected'" : "") + ">All</option>";
		dropdown.challenge += "<option value='No Challenge'" + ((vals.challenge === 'No Challenge') ? " selected='selected'" : "") + ">No Challenge</option>";
		if (highestZone >= 40) dropdown.challenge += "<option value='Balance'" + ((vals.challenge === 'Balance') ? " selected='selected'" : "") + ">Balance</option>";
		if (highestZone >= 55) dropdown.challenge += "<option value = 'Decay'" + ((vals.challenge === 'Decay') ? " selected = 'selected'" : "") + " >Decay</option>";
		if (game.global.prisonClear >= 1) dropdown.challenge += "<option value='Electricity'" + ((vals.challenge === 'Electricity') ? " selected='selected'" : "") + ">Electricity</option>";
		if (highestZone >= 110) dropdown.challenge += "<option value='Life'" + ((vals.challenge === 'Life') ? " selected='selected'" : "") + ">Life</option>";
		if (highestZone >= 125) dropdown.challenge += "<option value='Crushed'" + ((vals.challenge === 'Crushed') ? " selected='selected'" : "") + ">Crushed</option>";
		if (highestZone >= 145) dropdown.challenge += "<option value='Nom'" + ((vals.challenge === 'Nom') ? " selected='selected'" : "") + ">Nom</option>";
		if (highestZone >= 165) dropdown.challenge += "<option value='Toxicity'" + ((vals.challenge === 'Toxicity') ? " selected='selected'" : "") + ">Toxicity</option>";
		if (highestZone >= 180) dropdown.challenge += "<option value='Watch'" + ((vals.challenge === 'Watch') ? " selected='selected'" : "") + ">Watch</option>";
		if (highestZone >= 180) dropdown.challenge += "<option value='Lead'" + ((vals.challenge === 'Lead') ? " selected='selected'" : "") + ">Lead</option>";
		if (highestZone >= 190) dropdown.challenge += "<option value='Corrupted'" + ((vals.challenge === 'Corrupted') ? " selected='selected'" : "") + ">Corrupted</option>";
		if (highestZone >= 215) dropdown.challenge += "<option value='Domination'" + ((vals.challenge === 'Domination') ? " selected='selected'" : "") + ">Domination</option>";

		//C2 dropdown with conditions for each unlock to only appear when the user can run them.
		dropdown.c2 = "<option value='All'" + ((vals.challenge3 === 'All') ? " selected='selected'" : "") + ">All</option>";
		if (getTotalPerkResource(true) >= 30) dropdown.c2 += "<option value='Discipline'" + ((vals.challenge3 === 'Discipline') ? " selected='selected'" : "") + ">Discipline</option>";
		if (highestZone >= 25) dropdown.c2 += "<option value='Metal'" + ((vals.challenge3 === 'Metal') ? " selected='selected'" : "") + ">Metal</option>";
		if (highestZone >= 35) dropdown.c2 += "<option value='Size'" + ((vals.challenge3 === 'Size') ? " selected='selected'" : "") + ">Size</option>";
		if (highestZone >= 40) dropdown.c2 += "<option value = 'Balance'" + ((vals.challenge3 === 'Balance') ? " selected = 'selected'" : "") + " > Balance</option>";
		if (highestZone >= 45) dropdown.c2 += "<option value='Meditate'" + ((vals.challenge3 === 'Meditate') ? " selected='selected'" : "") + ">Meditate</option>";
		if (highestZone >= 60) dropdown.c2 += "<option value='Trimp'" + ((vals.challenge3 === 'Trimp') ? " selected='selected'" : "") + ">Trimp</option>";
		if (highestZone >= 70) dropdown.c2 += "<option value='Trapper'" + ((vals.challenge3 === 'Trapper') ? " selected='selected'" : "") + ">Trapper</option>";
		if (game.global.prisonClear >= 1) dropdown.c2 += "<option value='Electricity'" + ((vals.challenge3 === 'Electricity') ? " selected='selected'" : "") + ">Electricity</option>";
		if (highestZone >= 120) dropdown.c2 += "<option value='Coordinate'" + ((vals.challenge3 === 'Coordinate') ? " selected='selected'" : "") + ">Coordinate</option>";
		if (highestZone >= 130) dropdown.c2 += "<option value='Slow'" + ((vals.challenge3 === 'Slow') ? " selected='selected'" : "") + ">Slow</option>";
		if (highestZone >= 145) dropdown.c2 += "<option value='Nom'" + ((vals.challenge3 === 'Nom') ? " selected='selected'" : "") + ">Nom</option>";
		if (highestZone >= 150) dropdown.c2 += "<option value='Mapology'" + ((vals.challenge3 === 'Mapology') ? " selected='selected'" : "") + ">Mapology</option>";
		if (highestZone >= 165) dropdown.c2 += "<option value='Toxicity'" + ((vals.challenge3 === 'Toxicity') ? " selected='selected'" : "") + ">Toxicity</option>";
		if (highestZone >= 180) dropdown.c2 += "<option value='Watch'" + ((vals.challenge3 === 'Watch') ? " selected='selected'" : "") + ">Watch</option>";
		if (highestZone >= 180) dropdown.c2 += "<option value='Lead'" + ((vals.challenge3 === 'Lead') ? " selected='selected'" : "") + ">Lead</option>";
		if (highestZone >= 425) dropdown.c2 += "<option value='Obliterated'" + ((vals.challenge3 === 'Obliterated') ? " selected='selected'" : "") + ">Obliterated</option>";
		if (highestZone >= 460) dropdown.c2 += "<option value='Frigid'" + ((vals.challenge3 === 'Frigid') ? " selected='selected'" : "") + ">Frigid</option>";
		if (game.global.totalSquaredReward >= 4500) dropdown.c2 += "<option value='Eradicated'" + ((vals.challenge3 === 'Eradicated') ? " selected='selected'" : "") + ">Eradicated</option>";
		if (highestZone >= 600) dropdown.c2 += "<option value='Experience'" + ((vals.challenge3 === 'Experience') ? " selected='selected'" : "") + ">Experience</option>";
	}

	if (universe === 2) {
		//Specials dropdown with conditions for each unlock to only appear when the user can run them.
		dropdown.special = "<option value='0'" + ((vals.special === '0') ? " selected='selected'" : "") + ">No Modifier</option>"
		if (highestZone >= 15) dropdown.special += "<option value='fa'" + ((vals.special === 'fa') ? " selected='selected'" : "") + ">Fast Attack</option>\<option value='lc'" + ((vals.special === 'lc') ? " selected='selected'" : "") + ">Large Cache</option>"
		if (highestZone >= 25) dropdown.special += "<option value = 'ssc'" + ((vals.special === 'ssc') ? " selected = 'selected'" : "") + " > Small Savory Cache</option>\
				<option value='swc'" + ((vals.special === 'swc') ? " selected = 'selected'" : "") + " > Small Wooden Cache</option>\
				<option value='smc'" + ((vals.special === 'smc') ? " selected = 'selected'" : "") + " > Small Metal Cache</option> "
		if (game.global.ArchaeologyDone) dropdown.special += "<option value='src'" + ((vals.special === 'src') ? " selected='selected'" : "") + ">Small Research Cache</option>"
		if (highestZone >= 55) dropdown.special += "<option value='p'" + ((vals.special === 'p') ? " selected='selected'" : "") + ">Prestigious</option>"
		if (highestZone >= 65) dropdown.special += "<option value='hc'" + ((vals.special === 'hc') ? " selected='selected'" : "") + ">Huge Cache</option>"
		if (highestZone >= 85) dropdown.special += "<option value='lsc'" + ((vals.special === 'lsc') ? " selected='selected'" : "") + ">Large Savory Cache</option>\
				<option value='lwc'" + ((vals.special === 'lwc') ? " selected='selected'" : "") + ">Large Wooden Cache</option>\
				<option value='lmc'" + ((vals.special === 'lmc') ? " selected='selected'" : "") + ">Large Metal Cache</option>"
		if (game.global.ArchaeologyDone) dropdown.special += "<option value='lrc'" + ((vals.special === 'lrc') ? " selected='selected'" : "") + ">Large Research Cache</option>"

		//Filler challenge dropdowns with conditions for each unlock to only appear when the user can run them.
		dropdown.challenge = "<option value='All'" + ((vals.challenge === 'All') ? " selected='selected'" : "") + ">All</option>";
		dropdown.challenge += "<option value='No Challenge'" + ((vals.challenge === 'No Challenge') ? " selected='selected'" : "") + ">No Challenge</option>";
		if (highestZone >= 40) dropdown.challenge += "<option value='Bublé'" + ((vals.challenge === 'Bublé') ? " selected='selected'" : "") + ">Bublé</option>";
		if (highestZone >= 55) dropdown.challenge += "<option value = 'Melt'" + ((vals.challenge === 'Melt') ? " selected = 'selected'" : "") + " > Melt</option>";
		if (highestZone >= 70) dropdown.challenge += "<option value='Quagmire'" + ((vals.challenge === 'Quagmire') ? " selected='selected'" : "") + ">Quagmire</option>";
		if (highestZone >= 85) dropdown.challenge += "<option value='Quest'" + ((vals.challenge === 'Quest') ? " selected='selected'" : "") + ">Quest</option>";
		if (highestZone >= 90) dropdown.challenge += "<option value='Archaeology'" + ((vals.challenge === 'Archaeology') ? " selected='selected'" : "") + ">Archaeology</option>";
		if (highestZone >= 110) dropdown.challenge += "<option value='Insanity'" + ((vals.challenge === 'Insanity') ? " selected='selected'" : "") + ">Insanity</option>";
		if (highestZone >= 135) dropdown.challenge += "<option value='Nurture'" + ((vals.challenge === 'Nurture') ? " selected='selected'" : "") + ">Nurture</option>";
		if (highestZone >= 155) dropdown.challenge += "<option value='Alchemy'" + ((vals.challenge === 'Alchemy') ? " selected='selected'" : "") + ">Alchemy</option>";
		if (highestZone >= 175) dropdown.challenge += "<option value='Hypothermia'" + ((vals.challenge === 'Hypothermia') ? " selected='selected'" : "") + ">Hypothermia</option>";

		//C3 options dropdown with conditions for each unlock to only appear when the user can run them.
		dropdown.c2 = "<option value='All'" + ((vals.challenge3 === 'All') ? " selected='selected'" : "") + ">All</option>";
		if (highestZone >= 15) dropdown.c2 += "<option value='Unlucky'" + ((vals.challenge3 === 'Unlucky') ? " selected='selected'" : "") + ">Unlucky</option>";
		if (highestZone >= 20) dropdown.c2 += "<option value='Downsize'" + ((vals.challenge3 === 'Downsize') ? " selected='selected'" : "") + ">Downsize</option>";
		if (highestZone >= 25) dropdown.c2 += "<option value='Transmute'" + ((vals.challenge3 === 'Transmute') ? " selected='selected'" : "") + ">Transmute</option>";
		if (highestZone >= 35) dropdown.c2 += "<option value = 'Unbalance'" + ((vals.challenge3 === 'Unbalance') ? " selected = 'selected'" : "") + " > Unbalance</option>";
		if (highestZone >= 45) dropdown.c2 += "<option value='Duel'" + ((vals.challenge3 === 'Duel') ? " selected='selected'" : "") + ">Duel</option>";
		if (highestZone >= 60) dropdown.c2 += "<option value='Trappapalooza'" + ((vals.challenge3 === 'Trappapalooza') ? " selected='selected'" : "") + ">Trappa</option>";
		if (highestZone >= 70) dropdown.c2 += "<option value='Wither'" + ((vals.challenge3 === 'Wither') ? " selected='selected'" : "") + ">Wither</option>";
		if (highestZone >= 85) dropdown.c2 += "<option value='Quest'" + ((vals.challenge3 === 'Quest') ? " selected='selected'" : "") + ">Quest</option>";
		if (highestZone >= 100) dropdown.c2 += "<option value='Mayhem'" + ((vals.challenge3 === 'Mayhem') ? " selected='selected'" : "") + ">Mayhem</option>";
		if (highestZone >= 105) dropdown.c2 += "<option value='Storm'" + ((vals.challenge3 === 'Storm') ? " selected='selected'" : "") + ">Storm</option>";
		if (highestZone >= 115) dropdown.c2 += "<option value='Berserk'" + ((vals.challenge3 === 'Berserk') ? " selected='selected'" : "") + ">Berserk</option>";
		if (highestZone >= 150) dropdown.c2 += "<option value='Pandemonium'" + ((vals.challenge3 === 'Pandemonium') ? " selected='selected'" : "") + ">Pandemonium</option>";
		if (highestZone >= 175) dropdown.c2 += "<option value='Glass'" + ((vals.challenge3 === 'Glass') ? " selected='selected'" : "") + ">Glass</option>";
		if (highestZone >= 200) dropdown.c2 += "<option value='Desolation'" + ((vals.challenge3 === 'Desolation') ? " selected='selected'" : "") + ">Desolation</option>";
		if (highestZone >= 201) dropdown.c2 += "<option value='Smithless'" + ((vals.challenge3 === 'Smithless') ? " selected='selected'" : "") + ">Smithless</option>";
	}

	//Run Type options
	dropdown.runType = "<option value='All'" + ((vals.runType === 'All') ? " selected='selected'" : "") + ">All</option>"
	dropdown.runType += "<option value='Filler'" + ((vals.runType === 'Filler') ? " selected = 'selected'" : "") + " > Filler</option>"
	dropdown.runType += " <option value='Daily'" + ((vals.runType === 'Daily') ? " selected='selected'" : "") + ">Daily</option>"
	if (universe === 1) dropdown.runType += "<option value='C3'" + ((vals.runType === 'C3') ? " selected='selected'" : "") + ">C2</option>"
	if (universe === 2) dropdown.runType += "<option value='C3'" + ((vals.runType === 'C3') ? " selected='selected'" : "") + ">C3</option>"

	//Golden dropdown options
	if (universe === 1 && !varPrefix.includes('C3')) dropdown.goldenType = "<option value='h'" + ((vals.goldenType === 'h') ? " selected='selected'" : "") + ">Helium</option>"
	if (universe === 2 && !varPrefix.includes('C3')) dropdown.goldenType = "<option value='r'" + ((vals.goldenType === 'r') ? " selected='selected'" : "") + ">Radon</option>"
	dropdown.goldenType += "<option value='b'" + ((vals.goldenType === 'b') ? " selected = 'selected'" : "") + " >Battle</option>"
	dropdown.goldenType += "<option value='v'" + ((vals.goldenType === 'v') ? " selected = 'selected'" : "") + " >Void</option>"

	return dropdown;
}