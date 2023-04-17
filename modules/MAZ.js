function MAZLookalike(titleText, varPrefix, event) {
	if (!document.getElementById('tooltipDiv').classList[0].includes('tooltipWindow')) cancelTooltip();
	var titleText = !titleText ? 'undefined' : titleText;
	var varPrefix = !varPrefix ? 'undefined' : varPrefix;

	if (titleText == 'undefined' || varPrefix == 'undefined')
		return;

	var elem = document.getElementById("tooltipDiv");
	if (event !== 'MAZ') {
		swapClass("tooltipExtra", "tooltipExtraNone", elem);
	}
	document.getElementById('tipText').className = "";

	var tooltipText;
	var costText = "";
	var titleText;

	var ondisplay = null; // if non-null, called after the tooltip is displayed

	//AutoJobs
	if (event == 'AutoJobs') {

		const ratio = "<p>The left side of this window is dedicated to jobs that are limited more by workspaces than resources. 1:1:1 will purchase all 3 of these ratio-based jobs evenly, and the ratio refers to the amount of workspaces you wish to dedicate to each job. Any number that's 0 or below will stop AT hiring any workers for that job.</p>";
		const percent = "<p>The right side of this window is dedicated to jobs limited more by resources than workspaces. Set the percentage of resources that you'd like to be spent on each job.</p>";
		const magmamancer = "<p><b>Magmamancers:</b> These will only be hired when they'll do something! So once the time spent on the zone is enough to activate the first metal boost.</p>";
		const farmersUntil = "<p><b>Farmers Until:</b> Stops buying Farmers from this zone. The Tribute & Worshipper farm settings override this setting and hire farmers during them.</p>";
		const lumberjackMP = "<p><b>No Lumberjacks Post MP:</b> Stops buying Lumberjacks after Melting Point has been run. The Smithy Farm setting will override this setting.</p>";

		tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Auto Job Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'>\ ";

		tooltipText += `${ratio}`
		tooltipText += `${percent}`
		if (game.global.universe === 1 && game.global.highestLevelCleared >= 229) tooltipText += `${magmamancer}`
		if (game.global.universe === 2) tooltipText += `${farmersUntil}`
		if (game.global.universe === 2) tooltipText += `${lumberjackMP}`
		tooltipText += "</div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";
		var percentJobs = ["Explorer"];
		if (game.global.universe == 1) percentJobs.push("Trainer");
		if (game.global.universe == 1 && game.global.highestLevelCleared >= 229) percentJobs.push("Magmamancer");
		if (game.global.universe == 2 && game.global.highestRadonLevelCleared > 29) percentJobs.push("Meteorologist");
		if (game.global.universe == 2 && game.global.highestRadonLevelCleared > 49) percentJobs.push("Worshipper");
		var ratioJobs = ["Farmer", "Lumberjack", "Miner"];
		var settingGroup = getPageSetting('jobSettingsArray');
		for (var x = 0; x < ratioJobs.length; x++) {
			tooltipText += "<tr>";
			var item = ratioJobs[x];
			var setting = settingGroup[item];
			var max;
			var checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', (setting && setting.enabled));
			tooltipText += "<td style='width: 40%'><div class='row'><div class='col-xs-6' style='padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + item + "</span></div><div class='col-xs-6 lowPad' style='text-align: right'>Ratio: <input class='jobConfigQuantity' id='autoJobQuant" + item + "' type='number'  value='" + ((setting && setting.ratio >= 0) ? setting.ratio : 0) + "'/></div></div>"
			tooltipText += "</td>";
			if (percentJobs.length > x) {
				item = percentJobs[x];
				setting = settingGroup[item];
				max = ((setting && setting.buyMax) ? setting.buyMax : 0);
				if (max > 1e4) max = max.toExponential().replace('+', '');
				checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', (setting && setting.enabled));
				tooltipText += "<td style='width: 60%'><div class='row'><div class='col-xs-6' style='padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + item + "</span></div><div class='col-xs-6 lowPad' style='text-align: right'>Percent: <input class='jobConfigQuantity' id='autoJobQuant" + item + "' type='number'  value='" + ((setting && setting.percent) ? setting.percent : 100) + "'/></div></div>"
			}
			if (game.global.universe === 2) {
				if (x == ratioJobs.length - 1) tooltipText += "<tr><td style='width: 40%'><div class='row'><div class='col-xs-6' style='padding-right: 5px'>" + buildNiceCheckbox('autoJobCheckboxFarmersUntil', 'autoCheckbox', (settingGroup.FarmersUntil.enabled)) + "&nbsp;&nbsp;<span>" + "Farmers Until</span></div><div class='col-xs-6 lowPad' style='text-align: right'>Zone: <input class='jobConfigQuantity' id='FarmersUntilZone' type='number'  value='" + ((settingGroup.FarmersUntil.zone) ? settingGroup.FarmersUntil.zone : 999) + "'/></div></div></td>";
				if (x == ratioJobs.length - 1) tooltipText += "<td style='width: 60%'><div class='row'><div class='col-xs-6' style='padding-right: 1px'>" + buildNiceCheckbox('autoJobCheckboxNoLumberjacks', 'autoCheckbox', (settingGroup.NoLumberjacks.enabled)) + "&nbsp;&nbsp;<span>" + "No Lumberjacks Post MP</span></div></td></tr>";
			}
		}
		var values = ['AutoJobs Off', 'Auto Ratios', 'Manual Ratios'];
		tooltipText += "<tr><td style='width: 40%'><div class='col-xs-6' style='padding-right: 5px'>Setting on Portal:</div><div class='col-xs-6 lowPad' style='text-align: right'><select style='width: 100%' id='autoJobSelfGather'><option value='0'>No change</option>";
		for (var x = 0; x < values.length; x++) {
			tooltipText += "<option" + ((settingGroup.portalOption && settingGroup.portalOption == values[x].toLowerCase()) ? " selected='selected'" : "") + " value='" + values[x].toLowerCase() + "'>" + values[x] + "</option>";
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
	else if (event == "AutoStructure") {

		const baseText = "<p>Here you can choose which structures will be automatically purchased when AutoStructure is toggled on. Check a box to enable the automatic purchasing of that structure, the 'Perc:' box specifies the cost-to-resource % that the structure should be purchased below, and set the 'Up To:' box to the maximum number of that structure you'd like purchased <b>(0&nbsp;for&nbsp;no&nbsp;limit)</b>. For example, setting the 'Perc:' box to 10 and the 'Up To:' box to 50 for 'House' will cause a House to be automatically purchased whenever the costs of the next house are less than 10% of your Food, Metal, and Wood, as long as you have less than 50 houses.</p>";
		const nursery = "<p><b>Nursery:</b> Acts the same as the other settings but also has a 'From' input which will cause nurseries to only be built from that zone onwards. Other nursery settings within AT will ignore this start zone if needed for them to work.</p>";
		const warpstation = "<p><b>Warpstation:</b> Settings for this type of building can be found in the AutoTrimp settings building tab!</p>";
		const safeGateway = "<p><b>Safe Gateway:</b> Will stop purchasing Gateways when your owned fragments are lower than the cost of the amount of maps you input in the 'Maps' field times by what a Perfect +10 LMC map would cost up to the zone specified in 'Till Z:', if that value is 0 it'll assume z999.</p>";

		tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Auto Structure Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'>";
		tooltipText += `${baseText}`
		if (game.global.universe === 1) tooltipText += `${nursery}`
		if (game.global.universe === 1 && game.global.highestLevelCleared >= 59) tooltipText += `${warpstation}`
		if (game.global.universe === 2) tooltipText += `${safeGateway}`
		tooltipText += "</div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";

		var count = 0;
		var setting, checkbox;
		var settingGroup = getPageSetting('buildingSettingsArray');
		for (var item in game.buildings) {
			var building = game.buildings[item];
			if (building.blockU2 && game.global.universe == 2) continue;
			if (building.blockU1 && game.global.universe == 1) continue;
			if (item === 'Warpstation') continue;
			if (item === 'Laboratory' && game.global.highestRadonLevelCleared < 129) continue;
			if (!building.AP) continue;
			if (count != 0 && count % 2 == 0) tooltipText += "</tr><tr>";
			setting = settingGroup[item];
			checkbox = buildNiceCheckbox('structConfig' + item, 'autoCheckbox', (setting && setting.enabled));

			//Start
			tooltipText += "<td><div class='row'>"
			//Checkbox & name
			tooltipText += "<div class='col-xs-3' style='width: 34%; padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + item + "</span></div>"
			//Percent options
			tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>Perc: <input class='structConfigPercent' id='structPercent" + item + "' type='number'  value='" + ((setting && setting.percent) ? setting.percent : 100) + "'/></div>";
			//Max options
			tooltipText += "<div class='col-xs-5' style='width: 33%; padding-left: 5px; text-align: right'>Up to: <input class='structConfigQuantity' id='structMax" + item + "' type='number'  value='" + ((setting && setting.buyMax) ? setting.buyMax : 0) + "'/></div>";
			//Finish
			tooltipText += "</div></td>";
			count++;
		}
		tooltipText += "</tr><tr>";
		//Nursery Start Zone setting
		if (game.global.universe === 1) {
			//Start
			tooltipText += "<td><div class='row'>"
			//Checkbox & name
			tooltipText += "<div class='col-xs-3' style='width: 34%; padding-right: 5px'>" + "&nbsp;&nbsp;<span>" + 'Nursery (cont)' + "</span></div>"
			tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>From: <input class='structConfigQuantity' id='nurseryFromZ" + "' type='number'  value='" + ((settingGroup.Nursery && settingGroup.Nursery.fromZ) ? settingGroup.Nursery.fromZ : 0) + "'/></div>";

		}
		//Safe Gateway setting for u2
		if (game.global.universe === 2) {
			tooltipText += "<td><div class='row'><div class='col-xs-3' style='width: 34%; style='padding-right: 5px'>" + buildNiceCheckbox('structConfigSafeGateway', 'autoCheckbox', (typeof (settingGroup.SafeGateway) === 'undefined' ? false : settingGroup.SafeGateway.enabled)) + "&nbsp;&nbsp;<span>" + "Safe Gateway" + "</span></div>";
			tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>Maps: <input class='structConfigQuantity' id='structMapCountSafeGateway" + "' type='number'  value='" + ((settingGroup.SafeGateway && settingGroup.SafeGateway.mapCount) ? settingGroup.SafeGateway.mapCount : 0) + "'/></div>";
			tooltipText += "<div class='col-xs-5' style='width: 33%; padding-left: 5px; text-align: right'>Till Z: <input class='structConfigPercent' id='structMax" + item + "' type='number'  value='" + ((settingGroup.SafeGateway && settingGroup.SafeGateway.zone) ? settingGroup.SafeGateway.zone : 0) + "'/></div>";
			tooltipText += "</div></td>";
		}
		//On Portal Settings
		var values = ['Off', 'On'];
		tooltipText += "<td><div class='row'><div class='col-xs-3' style='width: 34%; style='padding-right: 5px'> Setting on Portal:" + "</span></div>";
		tooltipText += "<div class='col-xs-5 style='width: 33%; padding-left: 5px; text-align: right'><select style='width: 70%' id='autoJobSelfGather'><option value='0'>No change</option>";
		for (var x = 0; x < values.length; x++) {
			tooltipText += "<option" + ((settingGroup.portalOption && settingGroup.portalOption == values[x].toLowerCase()) ? " selected='selected'" : "") + " value='" + values[x].toLowerCase() + "'>" + values[x] + "</option>";
		}

		tooltipText += "</tr><tr>";
		tooltipText += "</tr></tbody></table>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info btn-lg' onclick='saveATAutoStructureConfig()'>Apply</div><div class='btn-lg btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
		game.global.lockTooltip = true;
		ondisplay = function () {
			verticalCenterTooltip(false, true);
		};
	}

	//Map tab - Special Maps!
	else if (event == "UniqueMaps") {

		const baseText = "<p>Here you can choose which special maps you'd like to run throughout your runs. Each special map will have a Zone & Cell box to identify where you would like to run the map on the specified zone. If the map isn't run on your specified zone it will be run on any zone after the one you input.</p>";
		const smithy = "<p>The right side of this window is dedicated to running Melting Point when you've reached a certain Smithy value. As each runtype of vastly different there's different inputs for each type of run that you can do! Certain challenges have overrides for this, once unlocked they can be found in the C3 tab.</p>";

		tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Unique Map Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'>"
		tooltipText += `${baseText}`
		if (currSettingUniverse === 2 && game.global.highestRadonLevelCleared > 49) tooltipText += `${smithy}`
		tooltipText += "</div><table id='autoPurchaseConfigTable' style='font-size: 1.1vw;'><tbody>";

		var count = 0;
		var setting, checkbox;
		var settingGroup = getPageSetting('uniqueMapSettingsArray', currSettingUniverse);

		var smithySettings = [];

		if (currSettingUniverse === 1) {
			var mapUnlocks = [
				'The_Block', 'The_Wall', 'Dimension_of_Anger'
			]
			if (game.global.highestLevelCleared > 32) mapUnlocks.push("Trimple_of_Doom");
			if (game.global.highestLevelCleared > 79) mapUnlocks.push("The_Prison");
			if (game.global.highestLevelCleared > 169) mapUnlocks.push("Imploding_Star");
		}

		if (currSettingUniverse === 2) {
			//Adding in the U2 Unique Maps if they've been unlocked.
			var mapUnlocks = [
				'Dimension_of_Rage', 'Prismatic_Palace'
			]

			if (game.global.highestRadonLevelCleared > 32) mapUnlocks.push("Atlantrimp");
			if (game.global.highestRadonLevelCleared > 49) mapUnlocks.push("Melting_Point");
			if (game.global.highestRadonLevelCleared > 174) mapUnlocks.push("Frozen_Castle");


			//Adding in Smithy Settings if in u2
			if (game.global.highestRadonLevelCleared > 49) smithySettings.push("MP_Smithy");
			if (game.global.highestRadonLevelCleared > 49) smithySettings.push("MP_Smithy_Daily");
			if (game.global.highestRadonLevelCleared > 49) smithySettings.push("MP_Smithy_C3");
		}

		for (var x = 0; x < mapUnlocks.length; x++)
		//for (var item in game.buildings) 
		{
			tooltipText += "<tr>";
			var item = mapUnlocks[x];
			var setting = settingGroup[item];
			//U1
			if (item === 'Trimple_of_Doom' && game.global.highestLevelCleared < 33) continue;
			if (item === 'The_Prison' && game.global.highestLevelCleared < 79) continue;
			if (item === 'Imploding_Star' && game.global.highestLevelCleared < 169) continue;
			//U2
			if (item === 'Atlantrimp' && game.global.highestRadonLevelCleared < 33) continue;
			if (item === 'Melting_Point' && game.global.highestRadonLevelCleared < 49) continue;
			if (item.includes('Smithy') && game.global.highestRadonLevelCleared < 49) continue;
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
			tooltipText += "<div class='col-xs-3' style='width: 34%; padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + item.replace(/_/g, '&nbsp;<span>') + "</span></div>"
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
				tooltipText += "<td style='width: 40%'><div class='row'><div class='col-xs-6' style='padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + item.replace(/_/g, '&nbsp;<span>') + "</span></div><div class='col-xs-6 lowPad' style='text-align: right'>Value: <input class='jobConfigQuantity' id='uniqueMapValue" + item + "' type='number'  value='" + ((setting && setting.value) ? setting.value : 1) + "'/></div></div>"
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

	else if (event == "MessageConfig") {
		tooltipText = "<div id='messageConfig'>Here you can finely tune your message settings. Mouse over the name of a filter for more info.</div>";
		var value = 'value';
		if (game.global.universe === 2) value += 'U2';

		settingGroup = {
			general: false,
			fragment: false,
			upgrades: false,
			equipment: false,
			maps: false,
			map_Details: false,
			map_Destacking: false,
			other: false,
			buildings: false,
			jobs: false,
			zone: false,
			exotic: false,
			gather: false,
		};

		var msgs = autoTrimpSettings.spamMessages[value];

		tooltipText += "<div class='row'>";
		for (var x = 0; x < 1; x++) {
			tooltipText += "<div class='col-xs-4'></span><br/>";
			for (var item in settingGroup) {
				if (item == 'enabled') continue;
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
		costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip();configMessagesAT();'>Confirm</div> <div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>"
	}

	//Daily Auto Portal
	else if (event == "DailyAutoPortal") {

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

		tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Daily Auto Portal Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'>"
		tooltipText += `${baseText}`

		if (currSettingUniverse === 1) tooltipText += `${reflect}`
		tooltipText += `${empower}`
		tooltipText += `${mutimp}`
		tooltipText += `${bloodthirst}`
		tooltipText += `${famine}`
		tooltipText += `${large}`
		tooltipText += `${weakness}`
		if (currSettingUniverse === 2) tooltipText += `${empoweredVoid}`
		if (currSettingUniverse === 2) tooltipText += `${heirlost}`

		tooltipText += "</p></div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";

		var count = 0;
		var setting, checkbox;
		var setting_AT = getPageSetting('dailyPortalSettingsArray', currSettingUniverse);

		settingGroup = {
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
		tooltipText += "<td><div class='row'><div class='col-xs-3' style='width: 100%; padding-right: 5px'>" + "" + "&nbsp;&nbsp;<span>" + "<u>Modifier ± Zones</u>" + "</span></div></div>"
		tooltipText += "</td></tr><tr>";

		//Plus&Minus Portal&Void zone settings.
		for (var item in settingGroup) {
			if (currSettingUniverse === 1 && item === 'Empowered_Void') continue;
			if (currSettingUniverse === 1 && item === 'Heirlost') continue;
			if (currSettingUniverse === 2 && item === 'Reflect') continue;
			if (count != 0 && count % 2 == 0) tooltipText += "</tr><tr>";
			setting = setting_AT[item];
			checkbox = buildNiceCheckbox('structConfig' + item, 'autoCheckbox', (setting && setting.enabled));
			var itemName = item.charAt(0).toUpperCase() + item.substr(1);
			itemName = itemName.replace(/_/g, ' ');
			//Start
			tooltipText += "<td><div class='row'>"
			//Checkbox & name
			tooltipText += "<div class='col-xs-6' style='width: 52%; padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + itemName + "</span></div>"
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
	else if (event == "c2Runner") {
		const baseText = "Here you can enable the challenges you would like " + cinf() + " runner to complete and the zone you'd like the respective challenge to finish at and it will start them on the next auto portal if necessary.";
		const fusedText = autoTrimpSettings['c2Fused'].universe.indexOf(currSettingUniverse) !== -1 ? " If the 'Fused " + cinf() + "s' setting is enabled it will show Fused challenges and prioritise running them over their regular counterparts." : "";

		tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to " + cinf() + " Runner Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'>"
		tooltipText += `<p>${baseText}${fusedText}</p>`
		tooltipText += "</div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";

		var count = 0;
		var setting, checkbox;
		settingGroup = {};
		fusedChallenges = {}

		if (currSettingUniverse === 1) {
			var highestZone = game.global.highestLevelCleared + 1;
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
			var radonHZE = game.global.highestRadonLevelCleared + 1;
			if (radonHZE >= 15) settingGroup.Unlucky = {};
			if (radonHZE >= 20) settingGroup.Downsize = {};
			if (radonHZE >= 25) settingGroup.Transmute = {};
			if (radonHZE >= 35) settingGroup.Unbalance = {};
			if (radonHZE >= 45) settingGroup.Duel = {};
			if (radonHZE >= 60) settingGroup.Trappapalooza = {};
			if (radonHZE >= 70) settingGroup.Wither = {};
			if (radonHZE >= 85) settingGroup.Quest = {};
			if (radonHZE >= 105) settingGroup.Storm = {};
			if (radonHZE >= 115) settingGroup.Berserk = {};
			if (radonHZE >= 175) settingGroup.Glass = {};
			if (radonHZE >= 201) settingGroup.Smithless = {};
		}


		//Skip Lines to seperate
		tooltipText += "</td></tr><tr>";

		//Plus&Minus Portal&Void zone settings.
		for (var item in settingGroup) {
			if (count != 0 && count % 2 == 0) tooltipText += "</tr><tr>";
			setting = getPageSetting('c2RunnerSettings', currSettingUniverse)[item] !== 'undefined' ?
				getPageSetting('c2RunnerSettings', currSettingUniverse)[item] :
				setting = (item = { enabled: false, zone: 0 });
			checkbox = buildNiceCheckbox('structConfig' + item, 'autoCheckbox', (setting && setting.enabled));
			var itemName = item;
			//Start
			tooltipText += "<td><div class='row'>"
			//Checkbox & name


			//Checkbox & name
			tooltipText += "<div class='col-xs-3' style='width: 34%; padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + itemName + "</span></div>"
			//Challenges current zone
			tooltipText += "<div class='col-xs-3' style='width: 25%; padding-right: 5px'> Current Z:" + game.c2[itemName] + "</span></div>"
			//Zone input
			tooltipText += "<div class='col-xs-5' style='width: 41%; padding-left: 5px; text-align: right'>End Z: <input class='structConfigPercent' id='structZone" + item + "' type='number'  value='" + ((setting && setting.zone) ? setting.zone : 0) + "'/></div>";
			//Finish
			tooltipText += "</div></td>";
			count++;
		}
		tooltipText += "</tr>";

		if (Object.keys(fusedChallenges).length !== 0) {
			count = 0;
			tooltipText += "<td><div class='row'><div class='col-xs-3' style='width: 100%; padding-right: 5px'>" + "" + "&nbsp;&nbsp;<span>" + "<u>Fused " + cinf() + "s</u>" + "</span></div></div>"
			tooltipText += "</td></tr><tr>";
			//Plus&Minus Portal&Void zone settings.
			for (var item in fusedChallenges) {
				if (count != 0 && count % 2 == 0) tooltipText += "</tr><tr>";
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
				tooltipText += "<div class='col-xs-3' style='width: 34%; padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + itemName + "</span></div>"
				//Challenges current zone
				tooltipText += "<div class='col-xs-3' style='width: 25%; padding-right: 5px'> Current Z:" + challengeLevel + "</span></div>"
				//Zone input
				tooltipText += "<div class='col-xs-5' style='width: 41%; padding-left: 5px; text-align: right'>End Z: <input class='structConfigPercent' id='structZone" + item + "' type='number'  value='" + ((setting && setting.zone) ? setting.zone : 0) + "'/></div>";
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
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		ondisplay = function () {
			verticalCenterTooltip(false, true);
		};
	}

	//Farming Settings
	else if (event == 'MAZ') {

		var mapFarm = titleText.includes('Map Farm');
		var mapBonus = titleText.includes('Map Bonus');
		var voidMap = titleText.includes('Void Map');
		var hdFarm = titleText.includes('HD Farm');
		var raiding = titleText.includes('Raiding');
		var bionic = titleText.includes('Bionic');
		var quagmire = titleText.includes('Quagmire');
		var insanity = titleText.includes('Insanity Farm');
		var alchemy = titleText.includes('Alchemy Farm');
		var hypothermia = titleText.includes('Hypothermia Farm');
		var boneShrine = titleText.includes('Bone Shrine');
		var golden = titleText.includes('Golden');
		var tributeFarm = titleText.includes('Tribute Farm');
		var smithyFarm = titleText.includes('Smithy Farm');
		var worshipperFarm = titleText.includes('Worshipper Farm');

		var universe = currSettingUniverse;
		var settingName = varPrefix.charAt(0).toLowerCase() + varPrefix.slice(1);
		if (varPrefix === 'HDFarm') settingName = settingName.charAt(0) + settingName.charAt(1).toLowerCase() + settingName.slice(2);
		var trimple = currSettingUniverse === 1 ? 'Trimple' : 'Atlantrimp';
		var windowSize = 'tooltipWindow50';
		if (golden) windowSize = 'tooltipWindow20';
		else if (quagmire) windowSize = 'tooltipWindow45';
		else if (raiding) windowSize = 'tooltipWindow70';
		else if (bionic) windowSize = 'tooltipWindow70';
		else if (insanity) windowSize = 'tooltipWindow55';
		else if (alchemy) windowSize = 'tooltipWindow70';
		else if (hypothermia) windowSize = 'tooltipWindow45';
		else if (voidMap) windowSize = 'tooltipWindow60';
		else if (worshipperFarm) windowSize = 'tooltipWindow70';
		else if (smithyFarm) windowSize = 'tooltipWindow70';
		else if (boneShrine) windowSize = 'tooltipWindow65';
		else if (hdFarm) windowSize = 'tooltipWindow70';
		else if (mapBonus) windowSize = 'tooltipWindow70';
		else if (mapFarm) windowSize = 'tooltipWindow80';
		else if (tributeFarm) windowSize = 'tooltipWindow80';

		var maxSettings = 30;

		//Setting up the Help onclick setting.
		var mazHelp = mazPopulateHelpWindow(titleText, trimple);

		tooltipText = "";
		//Setting up default values section
		if (!golden) {
			//Header
			tooltipText += "\
				<div id = 'windowContainer' style = 'display: block' > <div id='windowError'></div>\
				<div class='row windowRow'>Default Values</div>\
				<div class='row windowRow titles'>\
				<div class='windowActive" + varPrefix + "\'>Active</div>\
				<div class='windowCell" + varPrefix + "\'>Cell</div>"
			if (mapFarm) tooltipText += "<div class='windowRepeat'>Repeat<br />Count</div>"
			if (worshipperFarm) tooltipText += "<div class='windowWorshipperSkip'>Enable<br />Skip</div>"
			if (worshipperFarm) tooltipText += "<div class='windowWorshipper'>Skip<br />Value</div>"
			if (mapBonus) tooltipText += "<div class='windowRepeat'>Map<br />Stacks</div>"
			if (boneShrine) tooltipText += "<div class='windowBoneBelow'>Use below</div>"
			if (worshipperFarm) tooltipText += "<div class='windowWorshipper'>Ships</div>"
			if (!raiding && !smithyFarm) tooltipText += "<div class='windowJobRatio" + varPrefix + "\'>Job<br />Ratio</div>"
			if (boneShrine) tooltipText += "<div class='windowBoneGather'>Gather</div>"
			if (mapFarm || alchemy || mapBonus || insanity) tooltipText += "<div class='windowSpecial" + varPrefix + "\'>Special</div>"
			if (tributeFarm || smithyFarm || mapFarm) tooltipText += "<div class='windowMapTypeDropdown" + varPrefix + "\'>Farm Type</div>"
			if (raiding && !bionic) tooltipText += "<div class='windowRecycle'>Recycle</div>"
			if (raiding && !bionic) tooltipText += "<div class='windowIncrementMaps'>Increment<br>Maps</div>"
			if (alchemy) tooltipText += "<div class='windowStorage'>Void<br>Purchase</div>"
			if (voidMap) tooltipText += "<div class='windowStorage'>Max<br>Map Bonus</div>"
			if (voidMap && game.permaBoneBonuses.boosts.owned > 0) tooltipText += "<div class='windowStorage'>Use Bone<br>Charge</div>"
			if (hypothermia) tooltipText += "<div class='windowFrozenCastle'>Frozen<br>Castle</div>"
			if (hypothermia) tooltipText += "<div class='windowStorage'>Auto<br>Storage</div>"
			if (hypothermia) tooltipText += "<div class='windowPackrat'>Packrat</div>"
			/* if (mapBonus) tooltipText += "<div class='windowJobRatio" + varPrefix + "\'>Health<br>Bonus</div>"
			if (mapBonus) tooltipText += "<div class='windowJobRatio" + varPrefix + "\'>Health<br>HD Ratio</div>" */
			if (hdFarm) tooltipText += "<div class='windowCell" + varPrefix + "\'>Map<br>Cap</div>"

			tooltipText += "</div>";

			var defaultVals = {
				active: true,
				cell: 1,
				special: '0',
				repeat: 1,
				shipSkipEnabled: false,
				shipskip: 10,
				gather: 0,
				bonebelow: 0,
				jobratio: '1,1,1,1',
				worshipper: 50,
				autostorage: false,
				packrat: false,
				frozencastle: [200, 99],
				mapType: 'Absolute',
				/* healthBonus: 10,
				healthHDRatio: 10, */
				recycle: false,
				incrementMaps: false,
				voidPurchase: true,
				maxTenacity: false,
				boneCharge: false,
				mapCap: 900
			}
			var style = "";

			const defaultSetting = getPageSetting(settingName + 'DefaultSettings', currSettingUniverse);
			setting123 = defaultSetting;

			//Reading info from each setting
			defaultVals.active = typeof (defaultSetting.active) === 'undefined' ? false : defaultSetting.active ? defaultSetting.active : false;
			defaultVals.cell = typeof (defaultSetting.cell) === 'undefined' ? 1 : defaultSetting.cell ? defaultSetting.cell : 81;
			if (boneShrine)
				defaultVals.bonebelow = defaultSetting.bonebelow ? defaultSetting.bonebelow : 1;
			if (boneShrine)
				defaultVals.worshipper = defaultSetting.worshipper ? defaultSetting.worshipper : 50;
			if (!raiding && !smithyFarm)
				defaultVals.jobratio = typeof (defaultSetting.jobratio) === 'undefined' ? '1,1,1,1' : defaultSetting.jobratio ? defaultSetting.jobratio : '1,1,1,1';
			if (mapFarm || alchemy || boneShrine || mapBonus)
				defaultVals.gather = defaultSetting.gather ? defaultSetting.gather : '0';
			if (mapFarm || alchemy || mapBonus || insanity)
				defaultVals.special = defaultSetting.special ? defaultSetting.special : '0';
			if (mapFarm || mapBonus) defaultVals.repeat = defaultSetting.repeat ? defaultSetting.repeat : '0';
			if (worshipperFarm)
				defaultVals.shipSkipEnabled = typeof (defaultSetting.shipSkipEnabled) === 'undefined' ? false : defaultSetting.shipSkipEnabled ? defaultSetting.shipSkipEnabled : false;
			if (worshipperFarm)
				defaultVals.shipskip = defaultSetting.shipskip ? defaultSetting.shipskip : '10';
			if (alchemy)
				defaultVals.voidPurchase = typeof (defaultSetting.voidPurchase) === 'undefined' ? true : defaultSetting.voidPurchase ? defaultSetting.voidPurchase : false;
			if (voidMap)
				defaultVals.maxTenacity = typeof (defaultSetting.maxTenacity) === 'undefined' ? false : defaultSetting.maxTenacity ? defaultSetting.maxTenacity : false;
			if (voidMap && game.permaBoneBonuses.boosts.owned > 0)
				defaultVals.boneCharge = typeof (defaultSetting.boneCharge) === 'undefined' ? false : defaultSetting.boneCharge ? defaultSetting.boneCharge : false;
			if (hypothermia)
				defaultVals.frozencastle = typeof (defaultSetting.frozencastle) === 'undefined' ? [200, 99] : defaultSetting.frozencastle ? defaultSetting.frozencastle : [200, 99];
			if (hypothermia)
				defaultVals.autostorage = typeof (defaultSetting.autostorage) === 'undefined' ? false : defaultSetting.autostorage ? defaultSetting.autostorage : false;
			if (hypothermia)
				defaultVals.packrat = typeof (defaultSetting.packrat) === 'undefined' ? false : defaultSetting.packrat ? defaultSetting.packrat : false;
			if (tributeFarm || smithyFarm)
				defaultVals.mapType = typeof (defaultSetting.mapType) === 'undefined' ? 'Absolute' : defaultSetting.mapType ? defaultSetting.mapType : 'Absolute';
			if (mapFarm)
				defaultVals.mapType = typeof (defaultSetting.mapType) === 'undefined' ? 'Map Count' : defaultSetting.mapType ? defaultSetting.mapType : 'Map Count';
			if (raiding && !bionic)
				defaultVals.recycle = typeof (defaultSetting.recycle) === 'undefined' ? false : defaultSetting.recycle ? defaultSetting.recycle : false;
			if (raiding && !bionic)
				defaultVals.incrementMaps = typeof (defaultSetting.incrementMaps) === 'undefined' ? false : defaultSetting.incrementMaps ? defaultSetting.incrementMaps : false;
			/* if (mapBonus)
				defaultVals.healthBonus = defaultSetting.healthBonus ? defaultSetting.healthBonus : 10;
			if (mapBonus)
				defaultVals.healthHDRatio = defaultSetting.healthHDRatio ? defaultSetting.healthHDRatio : 10; */
			if (hdFarm)
				defaultVals.mapCap = typeof (defaultSetting.mapCap) === 'undefined' ? 900 : defaultSetting.mapCap ? defaultSetting.mapCap : 900;

			var defaultGatherDropdown = displayDropdowns(universe, 'Gather', defaultVals.gather);
			var defaultSpecialsDropdown = displayDropdowns(universe, 'Cache', defaultVals.special);
			var defaultmapTypeDropdown = displayDropdowns(universe, 'mapType', defaultVals.mapType, varPrefix);

			tooltipText += "<div id='windowRow' class='row windowRow'>";
			tooltipText += "<div class='windowActive" + varPrefix + "\' style='text-align: center;'>" + buildNiceCheckbox("windowActiveDefault", null, defaultVals.active) + "</div>";
			tooltipText += "<div class='windowCell" + varPrefix + "\'><input value='" + defaultVals.cell + "' type='number' id='windowCellDefault'/></div>";
			if (mapFarm || mapBonus)
				tooltipText += "<div class='windowRepeat'><input value='" + defaultVals.repeat + "' type='number' id='windowRepeatDefault'/></div>";
			if (worshipperFarm)
				tooltipText += "<div class='windowWorshipperSkip' style='text-align: center;'>" + buildNiceCheckbox("windowSkipShipEnabled", null, defaultVals.shipSkipEnabled) + "</div>";
			if (worshipperFarm)
				tooltipText += "<div class='windowWorshipper'><input value='" + defaultVals.shipskip + "' type='number' id='windowRepeatDefault'/></div>";
			if (boneShrine)
				tooltipText += "<div class='windowBoneBelow'><input value='" + defaultVals.bonebelow + "' type='number' id='windowBoneBelowDefault'/></div>";
			if (worshipperFarm)
				tooltipText += "<div class='windowWorshipper'><input value='" + defaultVals.worshipper + "' type='number' id='windowWorshipperDefault'/></div>";
			if (!raiding && !smithyFarm)
				tooltipText += "<div class='windowJobRatio" + varPrefix + "\'><input value='" + defaultVals.jobratio + "' type='text' id='windowJobRatioDefault'/></div>";
			if (boneShrine)
				tooltipText += "<div class='windowBoneGather'><select value='" + defaultVals.gather + "' id='windowBoneGatherDefault'>" + defaultGatherDropdown + "</select></div>"
			if (mapFarm || alchemy || mapBonus || insanity)
				tooltipText += "<div class='windowSpecial" + varPrefix + "\'><select value='" + defaultVals.special + "' id='windowSpecialDefault'>" + defaultSpecialsDropdown + "</select></div>"
			if (hypothermia)
				tooltipText += "<div class='windowFrozenCastle'><input value='" + defaultVals.frozencastle + "' type='text' id='windowFrozenCastleDefault'/></div>";
			if (hypothermia)
				tooltipText += "<div class='windowStorage' style='text-align: center;'>" + buildNiceCheckbox("windowStorageDefault", null, defaultVals.autostorage) + "</div>";
			if (hypothermia)
				tooltipText += "<div class='windowPackrat' style='text-align: center;'>" + buildNiceCheckbox("windowPackratDefault", null, defaultVals.packrat) + "</div>";
			if (tributeFarm || smithyFarm)
				tooltipText += "<div class='windowMapTypeDropdown" + varPrefix + "\'><select value='" + defaultVals.mapType + "' id='windowMapTypeDropdownDefault'>" + defaultmapTypeDropdown + "</select></div>"
			if (mapFarm)
				tooltipText += "<div class='windowMapTypeDropdown" + varPrefix + "\'><select value='" + defaultVals.mapType + "' id='windowMapTypeDropdownDefault'>" + defaultmapTypeDropdown + "</select></div>"
			/* if (mapBonus)
				tooltipText += "<div class='windowJobRatio" + varPrefix + "\'><input value='" + defaultVals.healthBonus + "' type='number' id='healthBonus'/></div>";
			if (mapBonus)
				tooltipText += "<div class='windowJobRatio" + varPrefix + "\'><input value='" + defaultVals.healthHDRatio + "' type='number' id='healthHDRatio'/></div>"; */
			if (raiding && !bionic)
				tooltipText += "<div class='windowRecycle' style='text-align: center;'>" + buildNiceCheckbox("windowRecycleDefault", null, defaultVals.recycle) + "</div>";
			if (raiding && !bionic)
				tooltipText += "<div class='windowIncrementMaps' style='text-align: center;'>" + buildNiceCheckbox("windowIncrementMapsDefault", null, defaultVals.incrementMaps) + "</div>";
			if (alchemy)
				tooltipText += "<div class='windowStorage' style='text-align: center;'>" + buildNiceCheckbox("windowVoidPurchase", null, defaultVals.voidPurchase) + "</div>";
			if (voidMap)
				tooltipText += "<div class='windowStorage' style='text-align: center;'>" + buildNiceCheckbox("windowMaxTenacity", null, defaultVals.maxTenacity) + "</div>";
			if (voidMap && game.permaBoneBonuses.boosts.owned > 0)
				tooltipText += "<div class='windowStorage' style='text-align: center;'>" + buildNiceCheckbox("windowBoneCharge", null, defaultVals.boneCharge) + "</div>";
			if (hdFarm)
				tooltipText += "<div class='windowCell" + varPrefix + "\'><input value='" + defaultVals.mapCap + "' type='number' id='mapCap'/></div>";

			tooltipText += "</div>"

		}

		//Setting up rows for each setting
		tooltipText += "\
		<div id='windowContainer' style='display: block'><div id='windowError'></div>\
		<div class='row windowRow titles'>"
		if (!golden) tooltipText += "<div class='windowActive" + varPrefix + "\'>Active?</div>"
		if (!golden) tooltipText += "<div class='windowPriority" + varPrefix + "\'>Priority</div>"
		if (golden) tooltipText += "<div class='windowActiveAutoGolden'>Active?</div>"
		if (!voidMap && !golden) tooltipText += "<div class='windowWorld" + varPrefix + "\'>Start<br/>Zone</div>"
		if (mapFarm || tributeFarm || worshipperFarm || hdFarm || raiding || mapBonus || smithyFarm) tooltipText += "<div class='windowEndZone" + varPrefix + "\'>End<br/>Zone</div>"
		if (golden) tooltipText += "<div class='windowAmtAutoGolden'>Amount</div>"
		if (voidMap) tooltipText += "<div class='windowWorld" + varPrefix + "\'>Min Zone</div>"
		if (voidMap) tooltipText += "<div class='windowMaxVoidZone'>Max Zone</div>"
		if (raiding) tooltipText += "<div class='windowRaidingZone" + varPrefix + "\'>Raiding<br/>Zone</div>"
		if (!golden) tooltipText += "<div class='windowCell" + varPrefix + "\'>Cell</div>"
		if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || hdFarm) tooltipText += "<div class='windowAutoLevel" + varPrefix + "\'>Auto<br/>Level</div>"
		if (!quagmire && !boneShrine && !raiding && !voidMap && !golden) tooltipText += "<div class='windowLevel" + varPrefix + "\'>Map<br/>Level</div>"
		if (tributeFarm || smithyFarm || mapFarm) tooltipText += "<div class='windowMapTypeDropdown" + varPrefix + "\'>Farm Type</div>"
		if (tributeFarm) tooltipText += "<div class='windowTributes'>Tributes</div>"
		if (tributeFarm) tooltipText += "<div class='windowMets'>Mets</div>"
		if (mapFarm) tooltipText += "<div class='windowRepeat'>Repeat<br/>Count</div>"
		if (mapBonus) tooltipText += "<div class='windowMapStacks'>Map<br/>Stacks</div>"
		if (quagmire) tooltipText += "<div class='windowBogs'>Bogs</div>"
		if (insanity) tooltipText += "<div class='windowInsanity'>Insanity</div>"
		if (alchemy) tooltipText += "<div class='windowPotionType'>Potion Type</div>"
		if (golden) tooltipText += "<div class='windowTypeAutoGolden'>Golden Type</div>"
		if (alchemy) tooltipText += "<div class='windowPotionNumber'>Potion Number</div>"
		if (hypothermia) tooltipText += "<div class='windowBonfire'>Bonfires</div>"
		if (boneShrine) tooltipText += "<div class='windowBoneAmount'>To use</div>"
		if (boneShrine) tooltipText += "<div class='windowBoneBelow'>Use below</div>"
		if (worshipperFarm) tooltipText += "<div class='windowWorshipper'>Ships</div>"
		if (smithyFarm) tooltipText += "<div class='windowSmithies'>Smithies</div>"
		if (hdFarm) tooltipText += "<div class='windowHDBase'>HD Base</div>"
		if (hdFarm) tooltipText += "<div class='windowHDMult'>HD Mult</div>"
		if (hdFarm) tooltipText += "<div class='windowHDType'>HD<br/>Type</div>"
		if (voidMap) tooltipText += "<div class='windowVoidHDRatio'>HD<br/>Ratio</div>"
		if (voidMap) tooltipText += "<div class='windowVoidHDRatio'>Void HD<br/>Ratio</div>"
		if (!raiding && !smithyFarm && !golden) tooltipText += "<div class='windowJobRatio" + varPrefix + "\'>Job<br/>Ratio</div>"
		if (mapFarm || tributeFarm || worshipperFarm || raiding || smithyFarm) tooltipText += "<div class='windowRepeatEvery" + varPrefix + "\'>Repeat<br/>Every</div>"
		if (tributeFarm) tooltipText += "<div class='windowBuildings'>Buy<br/>Buildings</div>"
		if (boneShrine) tooltipText += "<div class='windowBoneGather'>Gather</div>"
		if (mapFarm || alchemy || mapBonus || insanity) tooltipText += "<div class='windowSpecial" + varPrefix + "\'>Special</div>"
		if (raiding && !bionic) tooltipText += "<div class='windowRaidingDropdown'>Frag Type</div>"
		if (mapFarm || tributeFarm || boneShrine) tooltipText += "<div class='windowAtlantrimp'>Run<br/>" + trimple + "</div>"
		if (smithyFarm) tooltipText += "<div class='windowMeltingPoint'>Run<br/>MP</div>"
		if (insanity) tooltipText += "<div class='windowBuildings'>Destack</div>"
		if (raiding) tooltipText += "<div class='windowPrestigeGoal" + varPrefix + "\'>Prestige<br/>Goal</div>"
		if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding) tooltipText += "<div class='windowRunType" + varPrefix + "\'>Run&nbsp;Type</div>"
		if (voidMap) tooltipText += "<div class='windowPortalAfter'>Portal<br/>After</div>"
		tooltipText += "</div>";

		var current = getPageSetting(settingName + 'Settings', currSettingUniverse);
		const currSetting = getPageSetting(settingName + 'Settings', currSettingUniverse);

		for (var x = 0; x < maxSettings; x++) {
			var vals = {
				active: true,
				priority: (x + 1),
				check: true,
				world: -1,
				cell: -1,
				level: -1,
				special: '0',
				repeat: 1,
				gather: 0,
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
				destack: false,
				goldenType: 'v',
				hdType: 'world',
				goldenNumber: -1
			}
			var style = "";
			if (current.length - 1 >= x) {
				vals.active = currSetting[x].active;
				vals.priority = currSetting[x].priority ? currSetting[x].priority : (x + 1);
				vals.world = currSetting[x].world;
				if (voidMap)
					vals.maxvoidzone = currSetting[x].maxvoidzone ? currSetting[x].maxvoidzone : 1;
				if (raiding)
					vals.raidingzone = currSetting[x].raidingzone ? currSetting[x].raidingzone : 1;
				vals.cell = currSetting[x].cell ? currSetting[x].cell : 81;
				if (!quagmire && !boneShrine && !raiding && !voidMap)
					vals.level = currSetting[x].level
				if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || hdFarm)
					vals.autoLevel = typeof (currSetting[x].autoLevel) !== 'undefined' ? currSetting[x].autoLevel : true;
				if (tributeFarm || smithyFarm)
					vals.mapType = currSetting[x].mapType ? currSetting[x].mapType : 'Absolute';
				if (mapFarm)
					vals.mapType = currSetting[x].mapType ? currSetting[x].mapType : 'Map Count';
				if (mapFarm || smithyFarm || mapBonus)
					vals.repeat = currSetting[x].repeat ? currSetting[x].repeat : 1;
				if (mapFarm || tributeFarm || worshipperFarm || raiding || smithyFarm)
					vals.repeatevery = currSetting[x].repeatevery ? currSetting[x].repeatevery : 0;
				if (mapFarm || tributeFarm || worshipperFarm || hdFarm || raiding || mapBonus || smithyFarm)
					vals.endzone = currSetting[x].endzone ? currSetting[x].endzone : 999;
				if (tributeFarm)
					vals.tributes = currSetting[x].tributes ? currSetting[x].tributes : 0;
				if (tributeFarm)
					vals.mets = currSetting[x].mets ? currSetting[x].mets : 0;
				if (tributeFarm)
					vals.buildings = typeof (currSetting[x].buildings) !== 'undefined' ? currSetting[x].buildings : true;
				if (mapFarm || tributeFarm || boneShrine)
					vals.atlantrimp = typeof (currSetting[x].atlantrimp) !== 'undefined' ? currSetting[x].atlantrimp : false;
				if (smithyFarm)
					vals.meltingPoint = typeof (currSetting[x].meltingPoint) !== 'undefined' ? currSetting[x].meltingPoint : false;
				if (voidMap)
					vals.portalAfter = typeof (currSetting[x].portalAfter) !== 'undefined' ? currSetting[x].portalAfter : false;
				if (quagmire)
					vals.bogs = currSetting[x].bogs ? currSetting[x].bogs : 0;
				if (insanity)
					vals.insanity = currSetting[x].insanity ? currSetting[x].insanity : 0;
				if (golden)
					vals.goldenType = typeof (currSetting[x].golden) !== 'undefined' ? currSetting[x].golden[0] : 0;
				if (hdFarm)
					vals.hdType = typeof (currSetting[x].hdType) !== 'undefined' ? currSetting[x].hdType : 'world';
				if (golden)
					vals.goldenNumber = typeof (currSetting[x].golden) !== 'undefined' ? currSetting[x].golden.toString().replace(/[^\d,:-]/g, '') : 'v';
				if (alchemy)
					vals.potionstype = currSetting[x].potion[0] ? currSetting[x].potion[0] : 0;
				if (alchemy)
					vals.potionsnumber = currSetting[x].potion.toString().replace(/[^\d,:-]/g, '') ? currSetting[x].potion.toString().replace(/[^\d,:-]/g, '') : 0;
				if (hypothermia)
					vals.bonfires = currSetting[x].bonfire ? currSetting[x].bonfire : 0;
				if (mapFarm || alchemy || mapBonus || insanity)
					vals.special = currSetting[x].special ? currSetting[x].special : -1;
				if (boneShrine)
					vals.boneamount = currSetting[x].boneamount ? currSetting[x].boneamount : 0;
				if (boneShrine)
					vals.bonebelow = currSetting[x].bonebelow ? currSetting[x].bonebelow : 0;
				if (worshipperFarm)
					vals.worshipper = currSetting[x].worshipper ? currSetting[x].worshipper : 50;
				if (voidMap)
					vals.hdRatio = currSetting[x].hdRatio ? currSetting[x].hdRatio : 0;
				if (voidMap)
					vals.voidHDRatio = currSetting[x].voidHDRatio ? currSetting[x].voidHDRatio : 0;
				if (!raiding && !smithyFarm)
					vals.jobratio = currSetting[x].jobratio ? currSetting[x].jobratio : '1,1,1,1';
				if (mapFarm || alchemy || boneShrine || mapBonus)
					vals.gather = currSetting[x].gather ? currSetting[x].gather : '0';
				if (raiding)
					vals.prestigeGoal = currSetting[x].prestigeGoal ? currSetting[x].prestigeGoal : 'All';
				if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding)
					vals.runType = currSetting[x].runType ? currSetting[x].runType : 'All';
				if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding)
					vals.challenge = currSetting[x].challenge ? currSetting[x].challenge : 'All';
				if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding)
					vals.challenge3 = currSetting[x].challenge3 ? currSetting[x].challenge3 : 'All';
				if (raiding && !bionic)
					vals.raidingDropdown = currSetting[x].raidingDropdown ? currSetting[x].raidingDropdown : 1;
				if (insanity)
					vals.destack = typeof (currSetting[x].destack) !== 'undefined' ? currSetting[x].destack : false;
				if (hdFarm)
					vals.hdBase = currSetting[x].hdBase ? currSetting[x].hdBase : 1;
				if (hdFarm)
					vals.hdMult = currSetting[x].hdMult ? currSetting[x].hdMult : 1;
			}

			else style = " style='display: none' ";

			var backgroundStyle = "";
			if (currSettingUniverse === 1) {
				var natureStyle = ['unset', 'rgba(50, 150, 50, 0.75)', 'rgba(60, 75, 130, 0.75)', 'rgba(50, 50, 200, 0.75)'];
				var natureList = ['None', 'Poison', 'Wind', 'Ice'];
				var index = natureList.indexOf(getZoneEmpowerment(vals.world));
				backgroundStyle = " 'background:" + natureStyle[index] + "\'";
			}

			var gatherDropdown = displayDropdowns(universe, 'Gather', vals.gather);
			//Specials dropdown with conditions for each unlock to only appear when the user can run them.
			var specialsDropdown = displayDropdowns(universe, 'Cache', vals.special);
			//Filler Challenges
			var challengeDropdown = displayDropdowns(universe, 'Filler', vals.challenge);
			//C3 Challenges
			var challenge3Dropdown = displayDropdowns(universe, 'C3', vals.challenge3);
			//PrestigeGoal
			var prestigeGoalDropdown = displayDropdowns(universe, 'prestigeGoal', vals.prestigeGoal);
			//RunType
			var runTypeDropdown = displayDropdowns(universe, 'runType', vals.runType);
			//Golden
			var goldenDropdown = displayDropdowns(universe, 'goldenType', vals.goldenType, varPrefix);
			//HDType
			var hdTypeDropdown = displayDropdowns(universe, 'hdType', vals.hdType, varPrefix);
			//MapType
			var mapTypeDropdown = displayDropdowns(universe, 'mapType', vals.mapType, varPrefix);

			var potionDropdown = "<option value='h'" + ((vals.potionstype == 'h') ? " selected='selected'" : "") + ">Herby Brew</option>\<option value='g'" + ((vals.potionstype == 'g') ? " selected='selected'" : "") + ">Gaseous Brew</option>\<option value='f'" + ((vals.potionstype == 'f') ? " selected='selected'" : "") + ">Potion of Finding</option>\<option value='v'" + ((vals.potionstype == 'v') ? " selected='selected'" : "") + ">Potion of the Void</option>\<option value='s'" + ((vals.potionstype == 's') ? " selected='selected'" : "") + ">Potion of Strength</option>"
			var raidingDropdown = "<option value='0'" + ((vals.raidingDropdown == '0') ? " selected='selected'" : "") + ">Frag</option>\<option value='1'" + ((vals.raidingDropdown == '1') ? " selected='selected'" : "") + ">Frag Min</option>\<option value='2'" + ((vals.raidingDropdown == '2') ? " selected='selected'" : "") + ">Frag Max</option>"

			var className = (vals.special == 'hc' || vals.special === 'lc') ? " windowGatherOn" : " windowGatherOff";
			className += (!vals.autoLevel) ? " windowLevelOn" : " windowLevelOff";
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding)
				className += (vals.runType === 'C3') ?
					" windowChallenge3On" + varPrefix + "" : " windowChallenge3Off" + varPrefix + "";
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding)
				className += (vals.runType === 'Filler') ?
					" windowChallengeOn" + varPrefix + "" : " windowChallengeOff" + varPrefix + "";
			if (hdFarm)
				className += (vals.hdType === 'maplevel') ?
					" windowMapLevelOff" + "" : " windowMapLevelOn" + "";
			className += (x <= current.length - 1) ? " active" : "  disabled";
			tooltipText += "<div id='windowRow" + x + "' class='row windowRow " + className + "'" + style + ">";
			if (!golden) tooltipText += "<div class='windowDelete" + varPrefix + "\' onclick='removeRow(\"" + x + "\",\"" + titleText + "\", true)'><span class='icomoon icon-cross'></span></div>";
			if (!golden) tooltipText += "<div class='windowActive" + varPrefix + "\' style='text-align: center;'>" + buildNiceCheckbox("windowActive" + x, null, vals.active) + "</div>";
			if (!golden)
				tooltipText += "<div class='windowPriority" + varPrefix + "\'><input value='" + vals.priority + "' type='number' id='windowPriority" + x + "'/></div>";

			if (golden) tooltipText += "<div class='windowDeleteAutoGolden' onclick='removeRow(\"" + x + "\",\"" + titleText + "\", true)'><span class='icomoon icon-cross'></span></div>";
			if (golden) tooltipText += "<div class='windowActiveAutoGolden' style='text-align: center;'>" + buildNiceCheckbox("windowActive" + x, null, vals.active) + "</div>";

			if (!golden)
				tooltipText += "<div class='windowWorld" + varPrefix + "\' style = " + backgroundStyle + "\' oninput='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><input value='" + vals.world + "' type='number' id='windowWorld" + x + "'/></div>";
			if (mapFarm || tributeFarm || worshipperFarm || hdFarm || raiding || mapBonus || smithyFarm)
				tooltipText += "<div class='windowEndZone" + varPrefix + "\'><input value='" + vals.endzone + "' type='number' id='windowEndZone" + x + "'/></div>";
			if (voidMap)
				tooltipText += "<div class='windowMaxVoidZone'><input value='" + vals.maxvoidzone + "' type='number' id='windowMaxVoidZone" + x + "'/></div>";
			if (raiding)
				tooltipText += "<div class='windowRaidingZone" + varPrefix + "\'><input value='" + vals.raidingzone + "' type='number' id='windowRaidingZone" + x + "'/></div>";
			if (!golden)
				tooltipText += "<div class='windowCell" + varPrefix + "\'><input value='" + vals.cell + "' type='number' id='windowCell" + x + "'/></div>";
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || hdFarm)
				tooltipText += "<div class='windowAutoLevel" + varPrefix + "\' style='text-align: center; padding-left: 5px;'>" + buildNiceCheckboxAutoLevel("windowAutoLevel" + x, null, vals.autoLevel, x, varPrefix) + "</div>";
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || hdFarm)
				tooltipText += "<div class='windowLevel" + varPrefix + "\'><input value='" + vals.level + "' type='number' id='windowLevel" + x + "'/></div>";
			if (tributeFarm || smithyFarm)
				tooltipText += "<div class='windowMapTypeDropdown" + varPrefix + "\' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.mapType + "' id='windowMapTypeDropdown" + x + "'>" + mapTypeDropdown + "</select></div>"
			if (mapFarm)
				tooltipText += "<div class='windowMapTypeDropdown" + varPrefix + "\' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.mapType + "' id='windowMapTypeDropdown" + x + "'>" + mapTypeDropdown + "</select></div>"
			if (worshipperFarm)
				tooltipText += "<div class='windowWorshipper'><input value='" + vals.worshipper + "' type='number' id='windowWorshipper" + x + "'/></div>";
			if (mapFarm)
				tooltipText += "<div class='windowRepeat'><input value='" + vals.repeat + "' type='value' id='windowRepeat" + x + "'/></div>";
			if (mapBonus)
				tooltipText += "<div class='windowMapStacks'><input value='" + vals.repeat + "' type='number' id='windowRepeat" + x + "'/></div>";
			if (smithyFarm)
				tooltipText += "<div class='windowSmithies'><input value='" + vals.repeat + "' type='number' id='windowRepeat" + x + "'/></div>";
			if (hdFarm)
				tooltipText += "<div class='windowHDBase'>\<div style='text-align: center; font-size: 0.6vw;'>" + (vals.hdType === 'maplevel' ? "Map Level" : "") + "</div>\<input value='" + vals.hdBase + "' type='number' id='windowRepeat" + x + "'/></div>";
			if (hdFarm)
				tooltipText += "<div class='windowHDMult'><input value='" + vals.hdMult + "' type='number' id='windowHDMult" + x + "'/></div>";
			if (tributeFarm)
				tooltipText += "<div class='windowTributes'><input value='" + vals.tributes + "' type='number' id='windowTributes" + x + "'/></div>";
			if (tributeFarm)
				tooltipText += "<div class='windowMets'><input value='" + vals.mets + "' type='number' id='windowMets" + x + "'/></div>";
			if (quagmire)
				tooltipText += "<div class='windowBogs'><input value='" + vals.bogs + "' type='number' id='windowBogs" + x + "'/></div>";
			if (insanity)
				tooltipText += "<div class='windowInsanity'><input value='" + vals.insanity + "' type='number' id='windowInsanity" + x + "'/></div>";
			if (golden)
				tooltipText += "<div class='windowAmtAutoGolden'><input value='" + vals.goldenNumber + "' type='number' id='windowWorld" + x + "'/></div>";
			if (golden)
				tooltipText += "<div class='windowTypeAutoGolden' onchange='updateWindowPreset(" + x + ")'><select value='" + vals.goldentype + "' id='windowGoldenType" + x + "'>" + goldenDropdown + "</select></div>"
			if (hdFarm)
				tooltipText += "<div class='windowHDType' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.hdType + "' id='windowHDType" + x + "'>" + hdTypeDropdown + "</select></div>"
			if (alchemy)
				tooltipText += "<div class='windowPotionType' onchange='updateWindowPreset(" + x + ")'><select value='" + vals.potionstype + "' id='windowPotionType" + x + "'>" + potionDropdown + "</select></div>"
			if (alchemy)
				tooltipText += "<div class='windowPotionNumber'><input value='" + vals.potionsnumber + "' type='number' id='windowPotionNumber" + x + "'/></div>";
			if (hypothermia)
				tooltipText += "<div class='windowBonfire'><input value='" + vals.bonfires + "' type='number' id='windowBonfire" + x + "'/></div>";
			if (boneShrine)
				tooltipText += "<div class='windowBoneAmount'><input value='" + vals.boneamount + "' type='number' id='windowBoneAmount" + x + "'/></div>";
			if (boneShrine)
				tooltipText += "<div class='windowBoneBelow'><input value='" + vals.bonebelow + "' type='number' id='windowBoneBelow" + x + "'/></div>";
			if (voidMap)
				tooltipText += "<div class='windowVoidHDRatio'><input value='" + vals.hdRatio + "' type='number' id='windowHDRatio" + x + "'/></div>";
			if (voidMap)
				tooltipText += "<div class='windowVoidHDRatio'><input value='" + vals.voidHDRatio + "' type='number' id='windowVoidHDRatio" + x + "'/></div>";
			if (!raiding && !smithyFarm && !golden)
				tooltipText += "<div class='windowJobRatio" + varPrefix + "\'><input value='" + vals.jobratio + "' type='value' id='windowJobRatio" + x + "'/></div>";
			if (mapFarm || tributeFarm || worshipperFarm || raiding || smithyFarm)
				tooltipText += "<div class='windowRepeatEvery" + varPrefix + "\'><input value='" + vals.repeatevery + "' type='number' id='windowRepeatEvery" + x + "'/></div>";
			if (tributeFarm)
				tooltipText += "<div class='windowBuildings' style='text-align: center;'>" + buildNiceCheckbox("windowBuildings" + x, null, vals.buildings) + "</div>";
			if (boneShrine)
				tooltipText += "<div class='windowBoneGather'><select value='" + vals.gather + "' id='windowBoneGather" + x + "'>" + gatherDropdown + "</select></div>"
			if (raiding && !bionic) tooltipText += "<div class='windowRaidingDropdown' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.raidingDropdown + "' id='windowRaidingDropdown" + x + "'>" + raidingDropdown + "</select></div>"
			if (mapFarm || alchemy || mapBonus || insanity)
				tooltipText += "<div class='windowSpecial" + varPrefix + "\'  onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.special + "' id='windowSpecial" + x + "'>" + specialsDropdown + "</select></div>"
			if (mapFarm || alchemy || mapBonus || insanity)
				tooltipText += "<div class='windowGather'>\<div style='text-align: center; font-size: 0.6vw;'>Gather</div>\<onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'>\<select value='" + vals.gather + "' id='windowGather" + x + "'>" + gatherDropdown + "</select>\</div>"
			if (mapFarm || tributeFarm || boneShrine)
				tooltipText += "<div class='windowAtlantrimp' style='text-align: center;'>" + buildNiceCheckbox("windowAtlantrimp" + x, null, vals.atlantrimp) + "</div>";
			if (smithyFarm)
				tooltipText += "<div class='windowMeltingPoint' style='text-align: center;'>" + buildNiceCheckbox("windowMeltingPoint" + x, null, vals.meltingPoint) + "</div>";
			if (insanity)
				tooltipText += "<div class='windowBuildings' style='text-align: center;'>" + buildNiceCheckbox("windowBuildings" + x, null, vals.destack) + "</div>";
			if (raiding)
				tooltipText += "<div class='windowPrestigeGoal" + varPrefix + "\' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.prestigeGoal + "' id='windowPrestigeGoal" + x + "'>" + prestigeGoalDropdown + "</select></div>"
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding)
				tooltipText += "<div class='windowRunType" + varPrefix + "\' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.runType + "' id='windowRunType" + x + "'>" + runTypeDropdown + "</select></div>"


			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding)
				tooltipText += "<div class='windowChallenge" + varPrefix + "\'>\<div style='text-align: center; font-size: 0.6vw;'>Challenge</div>\<select value='" + vals.challenge + "' id='windowChallenge" + x + "'>" + challengeDropdown + "</select>\</div>"
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding)
				tooltipText += "<div class='windowChallenge3" + varPrefix + "\'>\<div style='text-align: center; font-size: 0.6vw;'>Challenge" + (universe + 1) + "</div>\<select value='" + vals.challenge3 + "' id='windowChallenge3" + x + "'>" + challenge3Dropdown + "</select>\</div>"
			if (voidMap)
				tooltipText += "<div class='windowPortalAfter' style='text-align: center;'>" + buildNiceCheckbox("windowPortalAfter" + x, null, vals.portalAfter) + "</div>";

			tooltipText += "</div>"
		}

		tooltipText += "<div id='windowAddRowBtn' style='display: " + ((current.length < maxSettings) ? "inline-block" : "none") + "' class='btn btn-success btn-md' onclick='addRow(\"" + varPrefix + "\",\"" + titleText + "\")'>+ Add Row</div>"
		tooltipText += "</div></div><div style='display: none' id='mazHelpContainer'>" + mazHelp + "</div>";
		costText = "<div class='maxCenter'><span class='btn btn-success btn-md' id='confirmTooltipBtn' onclick='settingsWindowSave(\"" + titleText + "\",\"" + settingName + "\")'>Save and Close</span><span class='btn btn-danger btn-md' onclick='cancelTooltip(true)'>Cancel</span><span class='btn btn-primary btn-md' id='confirmTooltipBtn' onclick='settingsWindowSave(\"" + titleText + "\",\"" + settingName + "\", true)'>Save</span><span class='btn btn-info btn-md' onclick='windowToggleHelp(\"" + windowSize + "\")'>Help</span></div>"

		//Changing window size depending on setting being opened.
		if (document.getElementById('tooltipDiv').classList[0] !== windowSize) {
			swapClass(document.getElementById('tooltipDiv').classList[0], windowSize, elem);
		}
		game.global.lockTooltip = true;
		elem.style.top = "10%";
		elem.style.left = "1%";
		elem.style.height = 'auto';
		elem.style.maxHeight = window.innerHeight * .85 + 'px';
		if (document.getElementById('windowContainer') !== null && document.getElementById('windowContainer').style.display === 'block' && document.querySelectorAll('#windowContainer .active').length > 10) elem.style.overflowY = 'scroll';
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
	extraFunction = "";
	html = "<span title='" + title + "' id='" + id + "' " + html + onchange + " onclick='swapNiceCheckbox(this); updateWindowPreset(\"" + index + "\",\"" + varPrefix + "\");" + extraFunction + "'></span>";
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
		var checked = (checkboxes[x].dataset.checked == 'true');
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
	var quagmire = titleText.includes('Quagmire');
	var insanity = titleText.includes('Insanity Farm');
	var alchemy = titleText.includes('Alchemy Farm');
	var hypothermia = titleText.includes('Hypothermia Farm');
	var boneShrine = titleText.includes('Bone Shrine');
	var golden = titleText.includes('Golden');
	var tributeFarm = titleText.includes('Tribute Farm');
	var smithyFarm = titleText.includes('Smithy Farm');
	var worshipperFarm = titleText.includes('Worshipper Farm');

	var defaultSetting = {
	}

	if (!golden) {
		defaultSetting.active = readNiceCheckbox(document.getElementById('windowActiveDefault'));
		defaultSetting.cell = parseInt(document.getElementById('windowCellDefault').value, 10);
		if (mapBonus) defaultSetting.repeat = parseInt(document.getElementById('windowRepeatDefault').value, 10);
		if (mapFarm) defaultSetting.repeat = parseFloat(document.getElementById('windowRepeatDefault').value, 10);
		if (worshipperFarm) defaultSetting.shipSkipEnabled = readNiceCheckbox(document.getElementById('windowSkipShipEnabled'));
		if (worshipperFarm) defaultSetting.shipskip = parseInt(document.getElementById('windowRepeatDefault').value, 10);
		if (mapFarm || alchemy || mapBonus || titleText.includes('Insanity')) defaultSetting.special = document.getElementById('windowSpecialDefault').value;
		if (boneShrine) defaultSetting.bonebelow = parseInt(document.getElementById('windowBoneBelowDefault').value, 10);
		if (worshipperFarm) defaultSetting.worshipper = parseInt(document.getElementById('windowWorshipperDefault').value, 10);
		if (!raiding && !smithyFarm) defaultSetting.jobratio = document.getElementById('windowJobRatioDefault').value;
		if (boneShrine) defaultSetting.gather = document.getElementById('windowBoneGatherDefault').value;
		if (alchemy) defaultSetting.voidPurchase = readNiceCheckbox(document.getElementById('windowVoidPurchase'));
		if (voidMap) defaultSetting.maxTenacity = readNiceCheckbox(document.getElementById('windowMaxTenacity'));
		if (voidMap && game.permaBoneBonuses.boosts.owned > 0) defaultSetting.boneCharge = readNiceCheckbox(document.getElementById('windowBoneCharge'));
		if (hypothermia) defaultSetting.frozencastle = document.getElementById('windowFrozenCastleDefault').value.split(',');
		if (hypothermia) defaultSetting.autostorage = readNiceCheckbox(document.getElementById('windowStorageDefault'));
		if (hypothermia) defaultSetting.packrat = readNiceCheckbox(document.getElementById('windowPackratDefault'));
		if (raiding && !bionic) defaultSetting.recycle = readNiceCheckbox(document.getElementById('windowRecycleDefault'));
		if (raiding && !bionic) defaultSetting.incrementMaps = readNiceCheckbox(document.getElementById('windowIncrementMapsDefault'));
		if (tributeFarm || smithyFarm || mapFarm) defaultSetting.mapType = document.getElementById('windowMapTypeDropdownDefault').value;
		/* if (mapBonus) defaultSetting.healthBonus = parseInt(document.getElementById('healthBonus').value, 10);
		if (mapBonus) defaultSetting.healthHDRatio = parseFloat(document.getElementById('healthHDRatio').value, 10); */
		if (hdFarm) defaultSetting.mapCap = parseFloat(document.getElementById('mapCap').value, 10);

		if (defaultSetting.cell < 1) defaultSetting.cell = 1;
		if (defaultSetting.cell > 100) defaultSetting.cell = 100;
		/* if (defaultSetting.healthBonus > 10) defaultSetting.healthBonus = 10;
		if (defaultSetting.healthBonus < 0) defaultSetting.healthBonus = 0; */

		if (defaultSetting.repeat < 0) defaultSetting.repeat = 0;

		setPageSetting(varPrefix + 'DefaultSettings', defaultSetting, currSettingUniverse);
	}

	for (var x = 0; x < maxSettings; x++) {

		var thisSetting = {
		};

		var world = document.getElementById('windowWorld' + x);
		if (golden) world = document.getElementById('windowWorld' + x);
		if (!world || world.value == "-1") {
			continue;
		};

		thisSetting.active = readNiceCheckbox(document.getElementById('windowActive' + x));
		if (!golden) thisSetting.priority = parseInt(document.getElementById('windowPriority' + x).value, 10);
		if (!golden) thisSetting.world = parseInt(document.getElementById('windowWorld' + x).value, 10);
		if (!golden) thisSetting.cell = parseInt(document.getElementById('windowCell' + x).value, 10);
		if (!quagmire && !boneShrine && !raiding && !voidMap && !golden) thisSetting.level = parseInt(document.getElementById('windowLevel' + x).value, 10);
		if (smithyFarm || mapBonus) thisSetting.repeat = parseInt(document.getElementById('windowRepeat' + x).value, 10);
		if (hdFarm) thisSetting.hdBase = parseFloat(document.getElementById('windowRepeat' + x).value, 10);
		if (hdFarm) thisSetting.hdMult = parseFloat(document.getElementById('windowHDMult' + x).value, 10);

		if (mapFarm || tributeFarm || worshipperFarm || raiding || smithyFarm) thisSetting.repeatevery = parseInt(document.getElementById('windowRepeatEvery' + x).value, 10);
		if (mapFarm || tributeFarm || worshipperFarm || hdFarm || raiding || mapBonus || smithyFarm) thisSetting.endzone = parseInt(document.getElementById('windowEndZone' + x).value, 10);
		if (raiding) thisSetting.raidingzone = parseInt(document.getElementById('windowRaidingZone' + x).value, 10);
		if (mapFarm || alchemy || mapBonus || insanity) thisSetting.special = document.getElementById('windowSpecial' + x).value;
		if (mapFarm || alchemy || mapBonus || insanity) {
			if (thisSetting.special == 'hc' || thisSetting.special == 'lc')
				thisSetting.gather = document.getElementById('windowGather' + x).value;
			else
				thisSetting.gather = null;
		}
		if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || hdFarm) thisSetting.autoLevel = readNiceCheckbox(document.getElementById('windowAutoLevel' + x));
		if (tributeFarm || smithyFarm || mapFarm) thisSetting.mapType = document.getElementById('windowMapTypeDropdown' + x).value;
		if (mapFarm && thisSetting.mapType === 'Map Count') thisSetting.repeat = parseFloat(document.getElementById('windowRepeat' + x).value, 10);
		if (mapFarm && thisSetting.mapType !== 'Map Count') thisSetting.repeat = document.getElementById('windowRepeat' + x).value;
		if (tributeFarm) thisSetting.tributes = parseInt(document.getElementById('windowTributes' + x).value, 10);
		if (tributeFarm) thisSetting.mets = parseInt(document.getElementById('windowMets' + x).value, 10);
		if (quagmire) thisSetting.bogs = parseInt(document.getElementById('windowBogs' + x).value, 10);
		if (insanity) thisSetting.insanity = parseInt(document.getElementById('windowInsanity' + x).value, 10);
		if (golden) thisSetting.golden = document.getElementById('windowGoldenType' + x).value;
		if (hdFarm) thisSetting.hdType = document.getElementById('windowHDType' + x).value;
		if (golden) thisSetting.golden += parseInt(document.getElementById('windowWorld' + x).value, 10);
		if (alchemy) thisSetting.potion = document.getElementById('windowPotionType' + x).value;
		if (alchemy) thisSetting.potion += parseInt(document.getElementById('windowPotionNumber' + x).value, 10);
		if (hypothermia) thisSetting.bonfire = parseInt(document.getElementById('windowBonfire' + x).value, 10);
		if (boneShrine) thisSetting.boneamount = parseInt(document.getElementById('windowBoneAmount' + x).value, 10);
		if (boneShrine) thisSetting.bonebelow = parseInt(document.getElementById('windowBoneBelow' + x).value, 10);
		if (worshipperFarm) thisSetting.worshipper = parseInt(document.getElementById('windowWorshipper' + x).value, 10);
		if (voidMap) thisSetting.maxvoidzone = parseInt(document.getElementById('windowMaxVoidZone' + x).value, 10);
		if (voidMap) thisSetting.hdRatio = parseInt(document.getElementById('windowHDRatio' + x).value, 10);
		if (voidMap) thisSetting.voidHDRatio = parseInt(document.getElementById('windowVoidHDRatio' + x).value, 10);
		if (tributeFarm) thisSetting.buildings = readNiceCheckbox(document.getElementById('windowBuildings' + x));
		if (mapFarm || tributeFarm || boneShrine) thisSetting.atlantrimp = readNiceCheckbox(document.getElementById('windowAtlantrimp' + x));
		if (smithyFarm) thisSetting.meltingPoint = readNiceCheckbox(document.getElementById('windowMeltingPoint' + x));
		if (voidMap) thisSetting.portalAfter = readNiceCheckbox(document.getElementById('windowPortalAfter' + x));
		if (!raiding && !smithyFarm && !golden) thisSetting.jobratio = document.getElementById('windowJobRatio' + x).value;
		if (boneShrine) thisSetting.gather = document.getElementById('windowBoneGather' + x).value;
		if (raiding) thisSetting.prestigeGoal = document.getElementById('windowPrestigeGoal' + x).value;
		if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding) thisSetting.runType = document.getElementById('windowRunType' + x).value;
		if (raiding && !bionic) thisSetting.raidingDropdown = document.getElementById('windowRaidingDropdown' + x).value;
		if (insanity) thisSetting.destack = readNiceCheckbox(document.getElementById('windowBuildings' + x));

		if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding) {
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
		if (!golden && (thisSetting.world + thisSetting.level < 6)) {
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
		if (insanity && thisSetting.level === 0) {
			error += " Preset " + (x + 1) + " can\'t have a map level of 0 as you won\'t gain any Insanity stacks running this map.<br>";
			errorMessage = true;
		}
		if (insanity && thisSetting.level < 0 && thisSetting.destack === false) {
			error += " Preset " + (x + 1) + " can\'t have a map level below world level as you will lose Insanity stacks running this map. To change this toggle the 'Destack' option.<br>";
			errorMessage = true;
		}
		if (insanity && thisSetting.level >= 0 && thisSetting.destack === true) {
			error += " Preset " + (x + 1) + " can\'t have a map level at or above world level as you won't be able to lose Insanity stacks running this map. To change this toggle the 'Destack' option.<br>";
			errorMessage = true;
		}
		if (insanity && thisSetting.insanity < 0) {
			error += " Preset " + (x + 1) + " can\'t have a insanity value below 0.<br>";
			errorMessage = true;
		}
		if (errorMessage === true)
			continue;
		if (thisSetting.level > 10) thisSetting.level = 10;
		if (thisSetting.endzone < thisSetting.world) thisSetting.endzone = thisSetting.world;
		if (thisSetting.cell < 1) thisSetting.cell = 1;
		if (thisSetting.cell > 100) thisSetting.cell = 100;
		if (thisSetting.worshipper > game.jobs.Worshipper.max) worshipper = game.jobs.Worshipper.max;
		if (thisSetting.voidHDRatio < 0) thisSetting.voidHDRatio = 0;
		if (thisSetting.hdRatio < 0) thisSetting.hdRatio = 0;
		if (thisSetting.maxvoidzone < thisSetting.world) thisSetting.maxvoidzone = thisSetting.world;

		if (thisSetting.repeat < 0 && thisSetting.repeat !== -1) thisSetting.repeat = 0;
		if (raiding && !bionic && (thisSetting.raidingzone - thisSetting.world > 10)) thisSetting.raidingzone = thisSetting.world + 10;

		setting.push(thisSetting);
	}
	if (!golden)
		setting.sort(function (a, b) { if (a.priority == b.priority) return (a.world == b.world) ? ((a.cell > b.cell) ? 1 : -1) : ((a.world > b.world) ? 1 : -1); return (a.priority > b.priority) ? 1 : -1 });

	if (error) {
		var elem = document.getElementById('windowError');
		if (elem) elem.innerHTML = error;
		return;
	}

	if (mapBonus) {
		var value = currSettingUniverse === 2 ? 'valueU2' : 'value'
		autoTrimpSettings['mapBonusZone'][value] = [];
		for (var x = 0; x < setting.length; x++) {
			autoTrimpSettings['mapBonusZone'][value][x] = setting[x].world
		}
	}

	setPageSetting(varPrefix + 'Settings', setting, currSettingUniverse);

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
		if (!getPageSetting(varPrefix + 'DefaultSettings', currSettingUniverse).active)
			debug(titleText + " has been saved but is disabled. To enable it tick the 'Active' box in the top left of the window.")
	}
	document.getElementById('tooltipDiv').style.overflowY = '';
}

function mazPopulateHelpWindow(titleText, trimple) {
	//Setting up the Help onclick setting.
	var mazHelp = "Welcome to '" + titleText + "' settings! This is a powerful automation tool that allows you to set when maps should be automatically run, and allows for a high amount of customization. Here's a quick overview of what everything does:"


	var mapFarm = titleText.includes('Map Farm');
	var mapBonus = titleText.includes('Map Bonus');
	var voidMap = titleText.includes('Void Map');
	var hdFarm = titleText.includes('HD Farm');
	var raiding = titleText.includes('Raiding');
	var bionic = titleText.includes('Bionic');
	var quagmire = titleText.includes('Quagmire');
	var insanity = titleText.includes('Insanity Farm');
	var alchemy = titleText.includes('Alchemy Farm');
	var hypothermia = titleText.includes('Hypothermia Farm');
	var boneShrine = titleText.includes('Bone Shrine');
	var golden = titleText.includes('Golden');

	var radonSetting = currSettingUniverse === 2;

	var tributeFarm = titleText.includes('Tribute Farm');
	var smithyFarm = titleText.includes('Smithy Farm');
	var worshipperFarm = titleText.includes('Worshipper Farm');

	//Map Bonus Information to detail how it functions since it's unclear compared to every other setting
	if (mapBonus) mazHelp += "<br><br><b>Map Bonus works by using the last line that's greater or equal to your current world zone and then using those settings for every zone that follows on from it.</b>"
	if (voidMap) mazHelp += "<br><br>Void Map works by using 'Min Zone' as the lower bound zone to run voids on and 'Max Zone' as the upper bound. If your HD Ratio OR Void HD Ratio value (can be seen in status tooltip) is greater than the set value then it'll run voids on current zone otherwise will run them on your setting in 'Max Zone'."

	//Default Value settings
	if (!golden) {
		mazHelp += "<br><br>The default values section are values which will automatically be input when a new row has been added. There's a few exception to this such as:<br></br><ul>"
		mazHelp += "<li><b>Active</b> - A toggle to temporarily disable/enable the entire setting.</li>"
		mazHelp += "<li><b>Priority</b> - If there are two or more MaZ lines set to trigger at the same cell on the same Zone, the line with the lowest priority will run first. This also determines sort order of lines in the UI.</li>"
		if (worshipperFarm) mazHelp += "<li><b>Enabled Skip</b> - A toggle to enable the skip value setting.</li>";
		if (worshipperFarm) mazHelp += "<li><b>Skip Value</b> - How many worshippers a map must provide for you to run your Worshipper Farming.</li>";
		if (raiding && !bionic) mazHelp += "<li><b>Recycle</b> - A toggle to recycle maps after raiding has finished.</li>"
		if (raiding && !bionic) mazHelp += "<li><b>Increment Maps</b> - A toggle to swap between just running the 1 target zone map and gradually running different maps from lowest map you can obtain a prestige to the highest which can help if you're not strong enough to raid your target zone immediately.</li>"
		if (raiding) mazHelp += "<li><b>Recycle</b> - A toggle to recycle maps after BW raiding has finished.</li>"
		/* if (mapBonus) mazHelp += "<li><b>Health Bonus</b> - The amount of map stacks to farm when your HD Ratio is below that of the <b>Health HDRatio</b> field. Default is 10.</li>"
		if (mapBonus) mazHelp += "<li><b>Health HD Ratio</b> - Decides when to start getting the map stack bonus value in the <b>Health Bonus</b> field. 10 is default, this means it\'d go for it when your HDRatio is above 10.</li>" */
		if (alchemy) mazHelp += "<li><b>Void Purchase</b> - Will purchase as many void and strength potions as you can currently afford when you go into a void map. Would recommend only disabling this setting when going for the Alchemy achievement.</li>"
		if (hypothermia) mazHelp += "<li><b>Frozen Castle</b> - The zone,cell combination that you'd like Frozen Castle to be run at. The input style is '200,99' and if you don't input it properly it'll default to zone 200 cell 99.</li>"
		if (hypothermia) mazHelp += "<li><b>AutoStorage</b> - Disables AutoStorage until the first Bonfire farm zone that you reach during the challenge.</li>"
		if (hypothermia) mazHelp += "<li><b>Packrat</b> - Will purchase as many levels of packrat as possible once the Hypothermia challenge ends with leftover radon and additionally when portaling it reset the packrat level to 3 so that you don't accidentally trigger a 5th bonfire at the start of the run.</li>"
		if (voidMap) {
			mazHelp += "<li><b>Max Map Bonus</b> - Will assume you have 10 map bonus stacks"
			if (radonSetting && !game.portal.Tenacity.radLocked) mazHelp += " and max tenacity"
			mazHelp += " when void maps HD Ratio calcs are being set.</li>"
		}
		if (voidMap && game.permaBoneBonuses.boosts.owned > 0) mazHelp += "<li><b>Bone Charge</b> - The first time a line starts running Void Maps in each portal it will use a single Bone Charge.</li>"
	}

	//Row Settings
	mazHelp += "</ul></br> The settings for each row that is added:<ul>"

	//All Settings
	mazHelp += "<li><span style='padding-left: 0.3%' class='mazDelete'><span class='icomoon icon-cross'></span></span> - Remove this MaZ line completely</li>"
	//Active
	mazHelp += "<li><b>Active</b> - A toggle to temporarily disable/enable this line.</li>"
	//Zone
	if (!voidMap && !golden) mazHelp += "<li><b>Zone</b> - The Zone that this line should run. Must be between 6 and 1000.</li>"
	//Cell
	if (!golden) mazHelp += "<li><b>Cell</b> - The cell number between 1 and 100 where this line should trigger. 1 is the first cell of the Zone, 100 is the final cell. <b>DOES NOT TAKE OVERKILL INTO ACCOUNT.</b></li>"
	//AutoLevel
	if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || hdFarm)
		mazHelp += "<li><b>Auto Level</b> - Will automatically identify the best map level for your farming needs by looking at highest affordable map level and then calculating if you can one shot enemies with Titimp buff. " + (radonSetting ? "Highly recommended to use 'Auto Equality: Advanced' with this setting as it'll speed up map runs by a significant amount." : "") + "</li>";
	//Map Level
	if ((mapFarm || tributeFarm || smithyFarm || worshipperFarm || hdFarm || insanity || alchemy || hypothermia))
		mazHelp += "<li><b>Map Level</b> - The map level you'd like this line to run. Can input a positive or negative number for this so input could be '-5', '0', or '3'. " + ((radonSetting && !(insanity || alchemy || hypothermia)) ? "Will override inputs above -1 during the Wither challenge." : "") + "</li>";
	//Map Level for Map Bonus!
	if (mapBonus)
		mazHelp += "<li><b>Map Level</b> - The map level you'd like this line to run. Can only input a value for a map level you'd be able to gain map stacks from.</li>"

	if (!raiding && !smithyFarm && !hdFarm && !golden) mazHelp += "<li><b>Job Ratio</b> - The job ratio you want to use for this line. Input will look like '1,1,1,1' (Farmers, Lumberjacks, Miners, Scientists). If you don't want Farmers, Miners or Scientists you can input '0,1' for this setting.</li>"
	if (mapFarm || mapBonus || insanity || alchemy)
		mazHelp += "<li><b>Special</b> - The type of cache you'd like to run during this map. Will override metal cache inputs with wooden caches during the Transmute challenge.</li>";



	//Setting specific inputs
	//Row Settings
	mazHelp += "</ul></br><b>These inputs are specific to this setting and can be quite important for how you try to set this up:</b><ul><br>"

	if (voidMap) {
		//Min Run Zone
		mazHelp += "<li><b>Min Zone</b> - The lower bound zone to run voids maps on.</li>"
		//Max Run Zone
		mazHelp += "<li><b>max Zone</b> - The upper bound zone to run voids maps on.</li>"
		//HD Ratio to run at
		mazHelp += "<li><b>HD Ratio</b> - If your HD Ratio value (can be seen in status tooltip) is greater than this value then it'll run voids on current zone otherwise will run them on your setting in 'Max Zone'.</li>"
		//Void HD Ratio to run at
		mazHelp += "<li><b>Void HD Ratio</b> - If your Void HD Ratio value (can be seen in status tooltip) is greater than this value then it'll run voids on current zone otherwise will run them on your setting in 'Max Zone'.</li>"
		//Portal After
		mazHelp += "<li><b>Portal After</b> - Will run AutoPortal immediately after this line has run. Won't do anything if AutoPortal is disabled!</b></li>";
	}

	if (mapFarm) {
		mazHelp += "<li><b>Farm Type</b> Map Count - Will run maps until it has reached the specified repeat counter.\
		Portal Time - Uses DD:HH:MM:SS format and will run maps until the portal time surpasses the time set in repeat counter.\
		Daily Reset - Uses DD:HH:MM:SS format and will run maps until the daily reset time is below the time set in repeat counter.</li>";

		mazHelp += "<li><b>Map Repeat</b> - How many maps you'd like to run during this line. If set to -1 it will repeat an Infinite amount of times and you'll have to manually stop farming, would only recommend this if you're confident you'll be back to manually take over the run.</li>";
		//Trimple Map Farm
		mazHelp += "<li><b>Run " + trimple + "</b> - Will run " + trimple + " during this line. Whilst farming the specified amount of maps for this line it will stop AT purchasing equips until " + trimple + " has been run so that there is no wasted resources." + "</li>";
	}

	if (mapBonus) {
		mazHelp += "<li><b>Map Stacks</b> - How many stacks AT should obtain when running this line.</li>";
	}

	if (raiding) {
		//Raiding Zone
		mazHelp += "<li><b>Raiding Zone</b> - The zone you'd like to raid when this line is run. If \"Repeat Every X\" is set, it will also raise the Raiding zone by X every time. " + (!bionic ? "If your 'Zone' input is 231 then the highest zone you can input is 241." : "") + "</li>";
		if (!bionic) mazHelp += "<li><b>Frag Type</b> - Frag: General all purpose setting. Will set sliders to max and reduce when necessary to afford the maps you're trying to purchase.<br>\
	Frag Min: Used for absolute minimum frag costs. Will set everything but the map size to minimum and gradually reduce that if necessary to purchase maps.<br>\
	Frag Max: This option will make sure that the map has perfect sliders and uses the prestegious special if available.</li>";
	}

	if (hdFarm) {
		mazHelp += "<li><b>HD Base</b> - What H:D you'd like to reach.</li>";
		mazHelp += "<li><b>HD Mult</b> - Starting from the zone above the lines initial zone, this setting will multiply the H:D you have set in HD Base. So if your initial zone was 100, HD Base was 10, HD Mult was 1.2, at z101 your H:D target will be 12, then at z102 it will be 14.4 and so on. This way you can account for the zones getting stronger and you will not waste Map Farming for a really low H:D.'</li>";

		mazHelp += "<li><b>HD Type</b> - The type of HD you'd like to target. If 'Map Level' has been selected it will farm until auto level reaches that level.</li>";
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
		mazHelp += "<li><b>Farm Type</b> - The way in which Tribute Farming will operate. Either by using absolute values for what you'd like to farm e.g. 2700 Tributes and 37 Meteorologists or by having AT identify how many of each you can farm in X maps and then using that count to identify the amount based off expected mapping gains.</li>"
		//Tributes
		mazHelp += "<li><b>Tributes</b> - The amount of Tributes that should be farmed up to on this zone. If the value is greater than your Tribute Cap setting then it'll adjust it to the Tribute input whilst doing this farm.</li>"
		//Meteorologists
		mazHelp += "<li><b>Meteorologist</b> - The amount of Meteorologist that should be farmed up to on this zone.</li>"
		//Buy Buildings
		mazHelp += "<li><b>Buy Buildings</b> - If you'd like to buy buildings during this farming line to reduce the amount of maps it takes to farm your specified Tribute or Meteorologist inputs. When unselected it will automatically disable vanilla AutoStructure if it's enabled to remove the possibility of resources being spent there too.</li>";
		//Trimple Tribute Farm
		mazHelp += "<li><b>Run " + trimple + "</b> - Will run " + trimple + " during this line. Autoamtically calculates when it would be more efficient to run " + trimple + " or continue farming Savory Cache maps to reach your target in the fastest time possible.</b></li>";
	}

	if (smithyFarm) {
		//Smithy Count
		mazHelp += "<li><b>Smithies</b> - Smithy count you'd like to reach during this line. If you currently own 18 and want to reach 21 you'd enter 21 into this field.</li>";
		//Farm Type
		mazHelp += "<li><b>Farm Type</b> - The way in which Smithy Farming will operate. Either by using absolute values for what you'd like to farm e.g. 27 Smithies or by having AT identify how many you can farm in X maps and then using that count to identify the amount based off expected mapping gains.</li>"
		//Runs MP after the line
		mazHelp += "<li><b>Run MP</b> - Will run Melting Point after this line has been run.</b></li>";
	}

	if (worshipperFarm) {
		//Worshipper Count
		mazHelp += "<li><b>Ship</b> - How many worshippers you'd like to farm up to during this line. Max input is 50 and it'll default to that value if you input anything higher.</li>";
	}

	if (quagmire) {
		//Black Bogs
		mazHelp += "<li><b>Bogs</b> - How many Black Bog maps you'd like to run during this line.</li>";
	}
	//Insanity
	if (insanity) {
		//Insanity Stacks
		mazHelp += "<li><b>Insanity</b> - How many Insanity stack you'd like to farm up to during this line.</li>";
		//Destack toggle setting
		mazHelp += "<li><b>Destack</b> - Toggle to allow you to run maps that are lower than world level during Insanity. When using this setting Insanity Farm will assume you're destacking and it will aim to reduce your max Insanity to the value in the Insanity field.</li>";
	}

	if (alchemy) {
		//Potion Type
		mazHelp += "<li><b>Potion Type</b> - The type of potion you want to farm during this line.</li>";
		//Potion Number
		mazHelp += "<li><b>Potion Number</b> - How many of the potion specified in 'Potion Type' you'd like to farm for.</li>";
	}

	if (hypothermia)
		mazHelp += "<li><b>Bonfires</b> - How many Bonfires should be farmed on this zone. Uses max bonfires built rather than a specific amount to farm for so if you have already built 14 so far during your run and want another 8 then you'd input 22.</li>";

	//Repeat Every
	if (mapFarm || tributeFarm || worshipperFarm || smithyFarm)
		mazHelp += "<li><b>Repeat Every</b> - Line can be repeated every Zone, or set to a custom number depending on need.</li>";
	//End Zone
	if (mapFarm || tributeFarm || worshipperFarm || hdFarm || raiding || mapBonus || smithyFarm)
		mazHelp += "<li><b>End Zone</b> - Only matters if you're planning on having this MaZ line repeat. If so, the line will stop repeating at this Zone. Must be between 6 and 1000.</li>";
	//Run Type
	if (boneShrine || voidMap || mapFarm || tributeFarm || worshipperFarm || hdFarm || raiding || mapBonus || smithyFarm)
		mazHelp += "<li><b>Run Type</b> - What type of run you'd like this line to be run.</li>";

	if (golden) {
		//Amount of golden upgrades to get
		mazHelp += "<li><b>Run Type</b> - The amount of golden upgrades you'd like to get during this line.</li>";
		//Golden Type
		mazHelp += "<li><b>Golden Type</b> - The type of Golden upgrade that you'd like to get during this line.</li>";
	}
	return mazHelp;

}

function windowToggleHelp(windowSize) {
	var mazContainer = document.getElementById('windowContainer');
	var helpContainer = document.getElementById('mazHelpContainer');
	var parentWindow = document.getElementById("tooltipDiv");
	//Changing window size depending on setting being opened.
	if (document.getElementById('tooltipDiv').classList[0] === 'tooltipExtraGigantic') swapClass(document.getElementById('tooltipDiv').classList[0], windowSize, parentWindow);
	else swapClass(document.getElementById('tooltipDiv').classList[0], 'tooltipExtraGigantic', parentWindow);
	if (!mazContainer || !helpContainer) return;
	if (mazContainer.style.display == 'block') {
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
	parentWindow.style.height = 'auto';
	parentWindow.style.maxHeight = window.innerHeight * .85 + 'px';
}

function saveATAutoJobsConfig() {
	var error = "";
	var errorMessage = false;

	setPageSetting('jobSettingsArray', {});
	var setting = {};
	var checkboxes = document.getElementsByClassName('autoCheckbox');
	var quantboxes = document.getElementsByClassName('jobConfigQuantity');
	var ratios = ["Farmer", "Lumberjack", "Miner"];
	for (var x = 0; x < checkboxes.length; x++) {
		var name = checkboxes[x].id.split('autoJobCheckbox')[1];
		var checked = checkboxes[x].dataset.checked == 'true';
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

		if (ratios.indexOf(name) != -1) {
			setting[name].ratio = parseFloat(quantboxes[x].value);
			//Error checking
			if (setting[name].ratio < 0) {
				error += "Your ratio for " + name + " can't be negative.<br>";
				errorMessage = true;
			}
			continue;
		}
		jobquant = document.getElementById('autoJobQuant' + name).value;
		setting[name].percent = parseFloat(jobquant);
	}
	var portalElem = document.getElementById('autoJobSelfGather');
	if (portalElem) {
		if (portalElem.value) setting.portalOption = portalElem.value;
	}

	if (errorMessage) {
		var elem = document.getElementById('autoJobsError');
		if (elem) elem.innerHTML = error;
		return;
	}

	setPageSetting('jobSettingsArray', setting);

	//Adding in jobs that are locked so that there won't be any issues later on
	if (game.global.universe === 1) {
		//Magmamancer
		if (game.global.highestLevelCleared < 229) {
			autoTrimpSettings.jobSettingsArray.value.Magmamancer = {};
			autoTrimpSettings.jobSettingsArray.value.Magmamancer.enabled = true;
			autoTrimpSettings.jobSettingsArray.value.Magmamancer.percent = 100;
		}
	}
	if (game.global.universe === 2) {
		//Meteorologist
		if (game.global.highestRadonLevelCleared < 29) {
			autoTrimpSettings.jobSettingsArray.valueU2.Meteorologist = {};
			autoTrimpSettings.jobSettingsArray.valueU2.Meteorologist.enabled = true;
			autoTrimpSettings.jobSettingsArray.valueU2.Meteorologist.percent = 100;
		}
		//Worshipper
		if (game.global.highestRadonLevelCleared < 49) {
			autoTrimpSettings.jobSettingsArray.valueU2.Worshipper = {};
			autoTrimpSettings.jobSettingsArray.valueU2.Worshipper.enabled = true;
			autoTrimpSettings.jobSettingsArray.valueU2.Worshipper.percent = 20;
		}
	}

	cancelTooltip();
	saveSettings();
}

function saveATAutoStructureConfig() {
	setPageSetting('buildingSettingsArray', {});
	var setting = {};
	var checkboxes = document.getElementsByClassName('autoCheckbox');
	var percentboxes = document.getElementsByClassName('structConfigPercent');
	var quantboxes = document.getElementsByClassName('structConfigQuantity');
	for (var x = 0; x < checkboxes.length; x++) {
		var name = checkboxes[x].id.split('structConfig')[1];
		var checked = (checkboxes[x].dataset.checked == 'true');
		//if (!checked && !setting[name]) continue;
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

		var perc = parseInt(percentboxes[x].value, 10);
		if (perc > 100) perc = 100;
		perc = (isNumberBad(perc)) ? 0 : perc;
		setting[name].percent = perc;

		var max = parseInt(quantboxes[x].value, 10);
		if (max > 10000) max = 10000;
		max = (isNumberBad(max)) ? 0 : max;
		setting[name].buyMax = max;
		if (name === 'Nursery') {
			var fromZ = parseInt(document.getElementById('nurseryFromZ').value, 10);
			if (fromZ > 999) fromZ = 999;
			fromZ = (isNumberBad(fromZ)) ? 999 : fromZ;
			setting[name].fromZ = fromZ;
		}
	}

	var gatherElem = document.getElementById('autoJobSelfGather');
	if (gatherElem) {
		if (gatherElem.value) setting.portalOption = gatherElem.value;
	}

	setPageSetting('buildingSettingsArray', setting);

	//Adding in buildings that are locked so that there won't be any issues later on
	if (game.global.universe === 2 && game.global.highestRadonLevelCleared < 129) {
		autoTrimpSettings.buildingSettingsArray.valueU2.Laboratory = {};
		autoTrimpSettings.buildingSettingsArray.valueU2.Laboratory.enabled = true;
		autoTrimpSettings.buildingSettingsArray.valueU2.Laboratory.percent = 100;
		autoTrimpSettings.buildingSettingsArray.valueU2.Laboratory.buyMax = 0;
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
		var checked = (checkboxes[x].dataset.checked == 'true');
		//if (!checked && !setting[name]) continue;
		if (!setting[name]) setting[name] = {};
		setting[name].enabled = checked;

		if (name.includes('MP_Smithy')) {
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
		if (name.includes('The_Block') && zone < 11) {
			error += " The Block can\'t be run below zone 11.<br>";
			errorMessage = true;
		}
		//Error checking
		if (name.includes('The_Wall') && zone < 15) {
			error += " The Wall can\'t be run below zone 15.<br>";
			errorMessage = true;
		}
		if (name.includes('Dimension_of_Anger') && zone < 21) {
			error += " Dimension of Anger can\'t be run below zone 21.<br>";
			errorMessage = true;
		}
		if (name.includes('Prismatic_Palace') && zone < 21) {
			error += " Prismatic Palace can\'t be run below zone 21.<br>";
			errorMessage = true;
		}
		if ((name.includes('Atlantrimp') || name.includes('Trimple_of_Doom')) && (zone < 33 || (zone === 33 && cell < 50))) {
			error += " " + name + " can\'t be run below zone 33 cell 50.<br>";
			errorMessage = true;
		}
		if (name.includes('Melting_Point') && (zone < 50 || (zone === 50 && cell < 56))) {
			error += " Melting Point can\'t be run below zone 50 cell 56.<br>";
			errorMessage = true;
		}
		if (name.includes('The_Prison') && zone < 80) {
			error += " The Prison can\'t be run below zone 80.<br>";
			errorMessage = true;
		}
		if (name.includes('Imploding_Star') && zone < 170) {
			error += " Imploding Star can\'t be run below zone 170.<br>";
			errorMessage = true;
		}
		if (name.includes('Frozen_Castle') && zone < 175) {
			error += " Frozen Castle can\'t be run below zone 175.<br>";
			errorMessage = true;
		}

		y++;
	}

	if (errorMessage) {
		var elem = document.getElementById('autoJobsError');
		if (elem) elem.innerHTML = error;
		return;
	}

	setPageSetting('uniqueMapSettingsArray', setting, currSettingUniverse);;
	cancelTooltip();
	saveSettings();
}

function saveATDailyAutoPortalConfig() {
	var setting = getPageSetting('dailyPortalSettingsArray', currSettingUniverse);
	var checkboxes = document.getElementsByClassName('autoCheckbox');
	var percentboxes = document.getElementsByClassName('structConfigPercent');

	for (var x = 0; x < checkboxes.length; x++) {
		var name = checkboxes[x].id.split('structConfig')[1];
		var checked = (checkboxes[x].dataset.checked == 'true');
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
		var checked = (checkboxes[x].dataset.checked == 'true');
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
	if (varPrefix === 'HDFarm') settingName = settingName.charAt(0) + settingName.charAt(1).toLowerCase() + settingName.slice(2);

	for (var x = 0; x < 30; x++) {
		var elem = document.getElementById('windowWorld' + x);
		if (!elem) continue;

		var value = currSettingUniverse === 2 ? 'valueU2' : 'value'

		if (elem.value == -1) {
			var parent = document.getElementById('windowRow' + x);
			if (parent) {
				parent.style.display = 'block';
				if (!titleText.includes('Golden')) elem.value = game.global.world < 6 ? 6 : game.global.world;

				if (currSettingUniverse === 1) {
					//Changing rows to use the colour of the Nature type that the world input will be run on.
					var natureStyle = ['unset', 'rgba(50, 150, 50, 0.75)', 'rgba(60, 75, 130, 0.75)', 'rgba(50, 50, 200, 0.75)'];
					var natureList = ['None', 'Poison', 'Wind', 'Ice'];
					var index = natureList.indexOf(getZoneEmpowerment(elem.value));
					elem.parentNode.style.background = natureStyle[index];
				}

				if (document.getElementById('windowSpecial' + x) !== null)
					document.getElementById('windowSpecial' + x).value = autoTrimpSettings[settingName + 'DefaultSettings'][value].special
				if ((!titleText.includes('Smithy') && !titleText.includes('Worshipper Farm') && !titleText.includes('HD Farm')) && document.getElementById('windowRepeat' + x) !== null)
					document.getElementById('windowRepeat' + x).value = autoTrimpSettings[settingName + 'DefaultSettings'][value].repeat
				if ((titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Worshipper Farm') || titleText.includes('Raiding') || titleText.includes('Smithy Farm')) && document.getElementById('windowRepeatEvery' + x) !== null)
					document.getElementById('windowRepeatEvery' + x).value = 0;
				if ((titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Worshipper Farm') || titleText.includes('HD Farm') || titleText.includes('Raiding') || titleText.includes('Map Bonus') || titleText.includes('Smithy Farm')) && document.getElementById('windowEndZone' + x) !== null)
					document.getElementById('windowEndZone' + x).value = 999;
				if (titleText.includes('Void Map') && document.getElementById('windowMaxVoidZone' + x) !== null)
					document.getElementById('windowMaxVoidZone' + x).value = game.global.world < 6 ? 6 : game.global.world;
				if (document.getElementById('windowRaidingZone' + x) !== null)
					document.getElementById('windowRaidingZone' + x).value = elem.value
				if (document.getElementById('windowMapTypeDropdown' + x) !== null)
					document.getElementById('windowMapTypeDropdown' + x).value = autoTrimpSettings[settingName + 'DefaultSettings'][value].mapType || 'world';
				if (document.getElementById('windowBoneBelow' + x) !== null)
					document.getElementById('windowBoneBelow' + x).value = autoTrimpSettings[settingName + 'DefaultSettings'][value].bonebelow
				if (document.getElementById('windowWorshipper' + x) !== null)
					document.getElementById('windowWorshipper' + x).value = autoTrimpSettings[settingName + 'DefaultSettings'][value].worshipper
				if (document.getElementById('windowBoneGather' + x) !== null)
					document.getElementById('windowBoneGather' + x).value = autoTrimpSettings[settingName + 'DefaultSettings'][value].gather
				if (document.getElementById('windowBuildings' + x) !== null)
					document.getElementById('windowBuildings' + x).value = true;
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
				if (document.getElementById('windowJobRatio' + x) !== null && typeof (getPageSetting(settingName + 'DefaultSettings', currSettingUniverse).jobratio) !== 'undefined')
					document.getElementById('windowJobRatio' + x).value = autoTrimpSettings[settingName + 'DefaultSettings'][value].jobratio
				if (titleText.includes('Map Bonus') && document.getElementById('windowLevel' + x) !== null)
					document.getElementById('windowLevel' + x).value = 0;
				updateWindowPreset(x, varPrefix);
				swapClass('disabled', 'active', parent);
			}
		}

		if (titleText.includes('Golden')) {
			var elemCell = document.getElementById('windowWorld' + x);
			if (!elemCell) continue;
			if (elemCell.value == -1) {
				var parent2 = document.getElementById('windowRow' + x);
				if (parent2) {
					parent2.style.display = 'block';
					elemCell.value = 0
					updateWindowPreset(x, varPrefix);
					break;
				}
			}
		}

		var elemCell = document.getElementById('windowCell' + x);
		if (!elemCell) continue;
		if (elemCell.value == -1) {
			var parent2 = document.getElementById('windowRow' + x);
			if (parent2) {
				parent2.style.display = 'block';
				if (typeof (getPageSetting(settingName + 'DefaultSettings', currSettingUniverse).cell) !== 'undefined')
					elemCell.value = autoTrimpSettings[settingName + 'DefaultSettings'][value].cell
				updateWindowPreset(x, varPrefix);
				break;
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
		if (elem && elem.value == "-1") {
			btnElem.style.display = 'inline-block';
			return;
		}
		var elemCell = document.getElementById('windowCell' + y);
		if (elemCell && elem.value == "-1") {
			btnElem.style.display = 'inline-block';
			return;
		}
	}
	btnElem.style.display = 'none';
}

function removeRow(index, titleText) {
	var elem = document.getElementById('windowRow' + index);
	if (!elem) return;
	document.getElementById('windowWorld' + index).value = -1;
	if (!titleText.includes('Golden')) document.getElementById('windowCell' + index).value = -1;
	if (!titleText.includes('Quag') && !titleText.includes('Bone') && !titleText.includes('Raiding') && !titleText.includes('Void') && !titleText.includes('Golden')) document.getElementById('windowLevel' + index).value = 0;
	if (titleText.includes('Map Farm') || titleText.includes('Alch') || titleText.includes('Insanity') || titleText.includes('Map Bonus')) document.getElementById('windowSpecial' + index).value = 0;
	if (titleText.includes('Map Farm') || titleText.includes('Alch') || titleText.includes('Map Bonus') || titleText.includes('Insanity')) document.getElementById('windowGather' + index).value = 0;
	if (titleText.includes('Map Farm') || titleText.includes('Smithy') || titleText.includes('Map Bonus') || titleText.includes('HD Farm')) document.getElementById('windowRepeat' + index).value = 0;
	if (titleText.includes('HD Farm')) document.getElementById('windowHDMult' + index).value = 0;
	if (titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Worshipper Farm') || titleText.includes('Raiding') || titleText.includes('Smithy Farm')) document.getElementById('windowRepeatEvery' + index).value = 0;
	if (titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Worshipper Farm') || titleText.includes('HD Farm') || titleText.includes('Raiding') || titleText.includes('Map Bonus') || titleText.includes('Smithy Farm')) document.getElementById('windowEndZone' + index).value = 0;
	if (titleText.includes('Tribute Farm')) document.getElementById('windowTributes' + index).value = 0;
	if (titleText.includes('Tribute Farm')) document.getElementById('windowMets' + index).value = 0;
	if (titleText.includes('Quag')) document.getElementById('windowBogs' + index).value = 0;
	if (titleText.includes('Insanity')) document.getElementById('windowInsanity' + index).value = 0;
	if (titleText.includes('Auto Golden')) document.getElementById('windowWorld' + index).value = -1;
	if (titleText.includes('HD Farm')) document.getElementById('windowHDType' + index).value = 'world';
	if (titleText.includes('Auto Golden')) document.getElementById('windowGoldenType' + index).value = 'h';
	if (titleText.includes('Hypo')) document.getElementById('windowBonfire' + index).value = 0;
	if (titleText.includes('Bone')) document.getElementById('windowBoneAmount' + index).value = 0;
	if (titleText.includes('Bone')) document.getElementById('windowBoneBelow' + index).value = 0;
	if (titleText.includes('Worshipper Farm')) document.getElementById('windowWorshipper' + index).value = 0;
	if (titleText.includes('Void')) document.getElementById('windowHDRatio' + index).value = 0;
	if (titleText.includes('Void')) document.getElementById('windowVoidHDRatio' + index).value = 0;
	if (titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Bone Shrine')) {
		var checkBox = document.getElementById('windowAtlantrimp' + index);
		swapClass("icon-", "icon-checkbox-unchecked", checkBox);
		checkBox.setAttribute('data-checked', false);
	}
	if (titleText.includes('Smithy Farm')) {
		var checkBox = document.getElementById('windowMeltingPoint' + index);
		swapClass("icon-", "icon-checkbox-unchecked", checkBox);
		checkBox.setAttribute('data-checked', false);
	}
	if (titleText.includes('Void Map')) {
		var checkBox = document.getElementById('windowPortalAfter' + index);
		swapClass("icon-", "icon-checkbox-unchecked", checkBox);
		checkBox.setAttribute('data-checked', false);
	}
	if (titleText.includes('Tribute Farm')) {
		var checkBox = document.getElementById('windowBuildings' + index);
		swapClass("icon-", "icon-checkbox-checked", checkBox);
		checkBox.setAttribute('data-checked', true);
	}
	if (titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Smithy Farm') || titleText.includes('Map Bonus') || titleText.includes('Worshipper Farm') || titleText.includes('Insanity Farm') || titleText.includes('Alchemy Farm') || titleText.includes('Hypothermia Farm') || titleText.includes('HD Farm')) {
		var checkBox = document.getElementById('windowAutoLevel' + index);
		swapClass("icon-", "icon-checkbox-checked", checkBox);
		checkBox.setAttribute('data-checked', false);
	}
	if (!titleText.includes('Raiding') && !titleText.includes('Smithy') && !titleText.includes('Golden')) document.getElementById('windowJobRatio' + index).value = 0;
	if (titleText.includes('Raiding')) document.getElementById('windowPrestigeGoal' + index).value = 'All';
	if (titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Smithy Farm') || titleText.includes('Map Bonus') || titleText.includes('Worshipper Farm') || titleText.includes('Bone Shrine') || titleText.includes('Void Map') || titleText.includes('HD Farm') || titleText.includes('Raiding')) document.getElementById('windowRunType' + index).value = 'All';
	if (titleText.includes('Raiding') && !titleText.includes('Bionic')) document.getElementById('windowRaidingDropdown' + index).value = 0;
	if (titleText.includes('Tribute Farm') || titleText.includes('Smithy Farm')) document.getElementById('windowMapTypeDropdown' + index).value = 'Absolute';
	if (titleText.includes('Map Farm')) document.getElementById('windowMapTypeDropdown' + index).value = 'Map Count';
	if (titleText.includes('Bone')) document.getElementById('windowBoneGather' + index).value = 'Metal';

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
	var varPrefix = !varPrefix ? '' : varPrefix;
	var row = document.getElementById('windowRow' + index);

	if (varPrefix.includes('MapFarm') || varPrefix.includes('TributeFarm') || varPrefix.includes('SmithyFarm') || varPrefix.includes('MapBonus') || varPrefix.includes('WorshipperFarm') || varPrefix.includes('BoneShrine') || varPrefix.includes('VoidMap') || varPrefix.includes('HDFarm') || varPrefix.includes('Raiding')) {
		if (varPrefix !== '') {
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

	if (varPrefix.includes('MapFarm') || varPrefix.includes('TributeFarm') || varPrefix.includes('SmithyFarm') || varPrefix.includes('MapBonus') || varPrefix.includes('Worshipper') || varPrefix.includes('Insanity') || varPrefix.includes('Alch') || varPrefix.includes('Hypo')) {
		var autoLevel = document.getElementById('windowAutoLevel' + index).dataset.checked === 'true' ? 'windowLevelOff' : 'windowLevelOn';
		swapClass('windowLevel', autoLevel, row);
		document.getElementById('windowLevel' + index).disabled = document.getElementById('windowAutoLevel' + index).dataset.checked === 'true' ? true : false;
	}

	if (varPrefix.includes('MapFarm') || varPrefix.includes('Alch') || varPrefix.includes('MapBonus') || varPrefix.includes('Insanity')) {
		var special = document.getElementById('windowSpecial' + index).value;

		newClass = (special === 'hc' || special === 'lc') ? 'windowGatherOn' : 'windowGatherOff';
		swapClass('windowGather', newClass, row);
	}

	if (varPrefix.includes('HDFarm')) {
		var special = document.getElementById('windowHDType' + index).value;

		newClass = (special === 'maplevel') ? 'windowMapLevelOff' : 'windowMapLevelOn';
		swapClass('windowMapLevel', newClass, row);
		if (special === 'maplevel') {
			document.getElementById('windowRepeat' + index).parentNode.children[0].innerHTML = 'Map Level'
		} else {
			document.getElementById('windowRepeat' + index).parentNode.children[0].innerHTML = ''
		}
	}

	if (currSettingUniverse === 2 && varPrefix.includes('BoneShrine')) {
		var runType = document.getElementById('windowRunType' + index).value;
	}
	if (currSettingUniverse === 1) {
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
	//var returnText = ''
	var returnText = "";
	for (var item in daily) {
		if (item === 'seed') continue;
		returnText += dailyMods[item].description(daily[item].strength) + "<br>";
	}
	return returnText
}

function displayDropdowns(universe, runType, MAZ, varPrefix) {

	if (!universe) universe = game.global.universe;
	if (!MAZ) MAZ = '';
	var dropdown;
	var highestZone = universe === 1 ? game.global.highestLevelCleared + 1 : game.global.highestRadonLevelCleared + 1;

	if (runType === 'Gather') {
		dropdown += "<option value='food'" + ((MAZ == 'food') ? " selected='selected'" : "") + ">Food</option >\
		<option value='wood'" + ((MAZ == 'wood') ? " selected = 'selected'" : "") + " > Wood</option >\
		<option value='metal'" + ((MAZ == 'metal') ? " selected = 'selected'" : "") + " > Metal</option >\
		<option value='science'" + ((MAZ == 'science') ? " selected = 'selected'" : "") + " > Science</option > "
	}

	if (runType === 'hdType') {
		dropdown += "<option value='world'" + ((MAZ == 'world') ? " selected='selected'" : "") + ">World</option >\
		<option value='map'" + ((MAZ == 'map') ? " selected = 'selected'" : "") + " >Map</option >\
		<option value='void'" + ((MAZ == 'void') ? " selected = 'selected'" : "") + " >Void</option >\
		<option value='maplevel'" + ((MAZ == 'maplevel') ? " selected = 'selected'" : "") + " >Map Level</option >"
	}
	if (runType === 'mapType') {
		if (varPrefix !== 'MapFarm')
			dropdown += "<option value='Absolute'" + ((MAZ == 'Absolute') ? " selected='selected'" : "") + ">Absolute</option>"
		dropdown += "<option value='Map Count'" + ((MAZ == 'Map Count') ? " selected='selected'" : "") + ">Map Count</option>"
		if (varPrefix === 'MapFarm')
			dropdown += "<option value='Portal Time'" + ((MAZ === 'Portal Time') ? " selected='selected'" : "") + ">Portal Time</option>"
		if (varPrefix === 'MapFarm')
			dropdown += "<option value='Daily Reset'" + ((MAZ == 'Daily Reset') ? " selected='selected'" : "") + ">Daily Reset</option>"
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
			if (highestZone >= 85) dropdown += "<option value='Quest'" + ((MAZ == 'Quest') ? " selected='selected'" : "") + ">Quest</option>";
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
			if (highestZone >= 200) dropdown += "<option value='Desolation'" + ((MAZ == 'Desolation') ? " selected='selected'" : "") + ">Desolation</option>";
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