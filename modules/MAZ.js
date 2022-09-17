function MAZLookalike(titleText, varPrefix, event) {
	cancelTooltip();
	var titleText = !titleText ? 'undefined' : titleText;
	var varPrefix = !varPrefix ? 'undefined' : varPrefix;

	if (titleText == 'undefined' || varPrefix == 'undefined')
		return;

	var elem = document.getElementById("tooltipDiv");
	swapClass("tooltipExtra", "tooltipExtraNone", elem);
	document.getElementById('tipText').className = "";

	var tooltipText;
	var costText = "";
	var titleText;

	var ondisplay = null; // if non-null, called after the tooltip is displayed

	//AutoJobs
	if (event == 'AutoJobs') {
		tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Auto Job Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'><p>The left side of this window is dedicated to jobs that are limited more by workspaces than resources. 1:1:1 will purchase all 3 of these ratio-based jobs evenly, and the ratio refers to the amount of workspaces you wish to dedicate to each job. You can use any number larger than 0.</p><p><b>Farmers Until:</b> Stops buying Farmers from this zone. The Tribute & Worshipper farm settings override this setting and hire farmers during them.</p><p><b>No Lumberjacks Post MP:</b> Stops buying Lumberjacks after Melting Point has been run. The Smithy Farm setting will override this setting.</p></div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";
		var percentJobs = ["Explorer"];
		if (game.global.universe == 2 && game.global.highestRadonLevelCleared > 29) percentJobs.push("Meteorologist");
		if (game.global.universe == 2 && game.global.highestRadonLevelCleared > 49) percentJobs.push("Worshipper");
		var ratioJobs = ["Farmer", "Lumberjack", "Miner"];
		var sciMax = 1;
		var settingGroup = autoTrimpSettings.rJobSettingsArray.value;
		for (var x = 0; x < ratioJobs.length; x++) {
			tooltipText += "<tr>";
			var item = ratioJobs[x];
			var setting = settingGroup[item];
			var max;
			var checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', (setting && setting.enabled));
			tooltipText += "<td style='width: 40%'><div class='row'><div class='col-xs-6' style='padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + item + "</span></div><div class='col-xs-6 lowPad' style='text-align: right'>Ratio: <input class='jobConfigQuantity' id='autoJobQuant" + item + "' type='number'  value='" + ((setting && setting.ratio) ? setting.ratio : 1) + "'/></div></div>"
			tooltipText += "</td>";
			if (percentJobs.length > x) {
				item = percentJobs[x];
				setting = settingGroup[item];
				max = ((setting && setting.buyMax) ? setting.buyMax : 0);
				if (max > 1e4) max = max.toExponential().replace('+', '');
				checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', (setting && setting.enabled));
				tooltipText += "<td style='width: 60%'><div class='row'><div class='col-xs-6' style='padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + item + "</span></div><div class='col-xs-6 lowPad' style='text-align: right'>Percent: <input class='jobConfigQuantity' id='autoJobQuant" + item + "' type='number'  value='" + ((setting && setting.percent) ? setting.percent : 100) + "'/></div></div>"
			}

			if (x == ratioJobs.length - 1) tooltipText += "<tr><td style='width: 40%'><div class='row'><div class='col-xs-6' style='padding-right: 5px'>" + buildNiceCheckbox('autoJobCheckboxFarmersUntil', 'autoCheckbox', (settingGroup.FarmersUntil.enabled)) + "&nbsp;&nbsp;<span>" + "Farmers Until</span></div><div class='col-xs-6 lowPad' style='text-align: right'>Zone: <input class='jobConfigQuantity' id='FarmersUntilZone' type='number'  value='" + ((settingGroup.FarmersUntil.zone) ? settingGroup.FarmersUntil.zone : 999) + "'/></div></div></td>";
			if (x == ratioJobs.length - 1) tooltipText += "<td style='width: 60%'><div class='row'><div class='col-xs-6' style='padding-right: 1px'>" + buildNiceCheckbox('autoJobCheckboxNoLumberjacks', 'autoCheckbox', (settingGroup.NoLumberjacks.enabled)) + "&nbsp;&nbsp;<span>" + "No Lumberjacks Post MP</span></div></td></tr>";
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
	if (event == "AutoStructure") {
		tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Auto Structure Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'><p>Here you can choose which structures will be automatically purchased when AutoStructure is toggled on. Check a box to enable the automatic purchasing of that structure, the 'Perc:' box specifies the cost-to-resource % that the structure should be purchased below, and set the 'Up To:' box to the maximum number of that structure you'd like purchased <b>(0&nbsp;for&nbsp;no&nbsp;limit)</b>. For example, setting the 'Perc:' box to 10 and the 'Up To:' box to 50 for 'House' will cause a House to be automatically purchased whenever the costs of the next house are less than 10% of your Food, Metal, and Wood, as long as you have less than 50 houses.</p><p><b>Safe Gateway:</b> Will stop purchasing Gateways when your owned fragments are lower than the cost of the amount of maps you input in the 'Maps' field times by what a Perfect +10 LMC map would cost up to the zone specified in 'Till Z:', if that values is 0 it'll assume you want them capped forever.</p></div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";

		var count = 0;
		var setting, checkbox;
		var settingGroup = autoTrimpSettings.rBuildingSettingsArray.value;
		for (var item in game.buildings) {
			var building = game.buildings[item];
			if (building.blockU2 && game.global.universe == 2) continue;
			if (building.blockU1 && game.global.universe == 1) continue;
			if (item == "Laboratory" && game.global.highestRadonLevelCleared < 129) continue;
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
		tooltipText += "<td><div class='row'><div class='col-xs-3' style='width: 34%; style='padding-right: 5px'>" + buildNiceCheckbox('structConfigSafeGateway', 'autoCheckbox', (typeof (settingGroup.SafeGateway) === 'undefined' ? false : settingGroup.SafeGateway.enabled)) + "&nbsp;&nbsp;<span>" + "Safe Gateway" + "</span></div>";
		tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>Maps: <input class='structConfigQuantity' id='structMapCountSafeGateway" + "' type='number'  value='" + ((settingGroup.SafeGateway && settingGroup.SafeGateway.mapCount) ? settingGroup.SafeGateway.mapCount : 0) + "'/></div>";
		tooltipText += "<div class='col-xs-5' style='width: 33%; padding-left: 5px; text-align: right'>Till Z: <input class='structConfigPercent' id='structMax" + item + "' type='number'  value='" + ((settingGroup.SafeGateway && settingGroup.SafeGateway.zone) ? settingGroup.SafeGateway.zone : 0) + "'/></div>";
		tooltipText += "</div></td>";
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

	//Daily Auto Portal
	if (event == "DailyAutoPortal") {
		tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Daily Auto Portal Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'><p>Here you can choose different portal zones depending on specific modifiers that the daily you're running has. For example if your Daily has a resource shred modifier and you have '-3' input in that box then it will set both your void map zone and daily portal zone to 3 zones lower than your settings. Will only ever use the lowest value that is listed so you can't do a combination of -6 for dailies that have both Shred and Reflect by doing a -3 in each box.\
		</p><p><b>Reflect:</b> % damage reflect damage modifier\
		</p><p><b>Shred:</b> % resource loss every 15s modifier\
		</p><p><b>Empower:</b> Empower modifier.\
		</p><p><b>Mutimp:</b> % chance to turn enemies into Mutimps.\
		</p><p><b>Bloodthirst:</b> Enemies gaining the bloodthirst buff on kills.\
		</p><p><b>Famine:</b> Gives % less resources.\
		</p><p><b>Large:</b> Gives % less housing.\
		</p><p><b>Weakness:</b> Gives % less attack when .\
		</p></div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";

		var count = 0;
		var setting, checkbox;
		var settingGroup = autoTrimpSettings.rDailyPortalSettingsArray.value;

		//Always Needed Settings

		tooltipText += "<td><div class='row'>"
		tooltipText += "<div class='col-xs-6' style='width: 50%; padding-right: 5px'>" + "" + "&nbsp;&nbsp;<span>" + "Portal Zone:" + "</span></div>"
		tooltipText += "<div class='col-xs-6' style='width: 50%; text-align: right;'> <input class='dailyAutoPortalZone' 'id='portalZone ' type='number'  value='" + ((settingGroup && settingGroup.portalZone) ? settingGroup.portalZone : 0) + "'/></div></div></td>";

		tooltipText += "<td><div class='row'>"
		tooltipText += "<div class='col-xs-3' style='width: 40%; padding-right: 5px'>" + "" + "&nbsp;&nbsp;<span>" + "Portal Challenge:</span></div>"
		tooltipText += "<div class='col-xs-5' style='width: 60%; text-align: right'><select class ='dailyAutoPortalChallenge' id='autoDailyPortalChallenge'><option value='None'>None</option>";
		var values = ['Bublé', 'Melt', 'Quagmire', 'Archaeology', 'Insanity', 'Nurture', 'Alchemy', 'Hypothermia'];
		for (var x = 0; x < values.length; x++) {
			tooltipText += "<option" + ((settingGroup.portalChallenge && settingGroup.portalChallenge == values[x]) ? " selected='selected'" : "") + " value='" + values[x] + "'>" + values[x] + "</option>";
		}
		tooltipText += "</select></div></div></td></tr>";
		tooltipText += "</div></div>"

		//Skip Lines to seperate
		tooltipText += "<td><div class='row'><div class='col-xs-3' style='width: 100%; padding-right: 5px'>" + "" + "&nbsp;&nbsp;<span>" + "<u>Modifier ± Zones</u>" + "</span></div></div>"
		tooltipText += "</td></tr><tr>";


		//Plus&Minus Portal&Void zone settings.
		for (var item in autoTrimpSettings.rDailyPortalSettingsArray.value) {
			var building = game.buildings[item];
			if (item === 'portalChallenge') continue;
			if (item === 'portalZone') continue;
			if (count != 0 && count % 2 == 0) tooltipText += "</tr><tr>";
			setting = settingGroup[item];
			checkbox = buildNiceCheckbox('structConfig' + item, 'autoCheckbox', (setting && setting.enabled));
			var itemName = item;
			if (itemName.includes('Shred')) {
				itemName = item.replace("Shred", "Shred (");
				itemName += (")");
			}
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

	//AutoMaps
	if (event == "AutoMaps") {
		/* tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Auto Map Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'><p>Here you can choose which structures will be automatically purchased when AutoStructure is toggled on. Check a box to enable the automatic purchasing of that structure, the 'Perc:' box specifies the cost-to-resource % that the structure should be purchased below, and set the 'Up To:' box to the maximum number of that structure you'd like purchased <b>(0&nbsp;for&nbsp;no&nbsp;limit)</b>. For example, setting the 'Perc:' box to 10 and the 'Up To:' box to 50 for 'House' will cause a House to be automatically purchased whenever the costs of the next house are less than 10% of your Food, Metal, and Wood, as long as you have less than 50 houses.</p><p><b>Safe Gateway cap:</b> Will stop purchasing Gateways when your owned fragments are lower than the cost of the amount of maps you input in the 'Maps' field times by what a Perfect +10 LMC map would cost.</p></div>";

		var count = 0;
		var setting, checkbox;
		var settingGroup = autoTrimpSettings.rBuildingSettingsArray.value;
		setting = settingGroup.House;
		checkbox = buildNiceCheckbox('structConfig' + 'House', 'autoCheckbox', (setting && setting.enabled));


		//Void Maps Line
		tooltipText += "<table id='autoStructureConfigTable' style='font-size: 1.1vw; width: 100%'><tbody>";
		//Biome
		tooltipText += "<td><td style='width: 25%'><div class='row'>"
		tooltipText += "<div class='col-xs-3'>Biome:</span></div>"
		tooltipText += "<div class='col-xs-9  style='text-align: right; padding-left: 5px; '><select style='width: 80%' id='autoJobSelfGather'><option value='0'>Random</option>";
		var values = ['Mountain', 'Forest', 'Sea', 'Depths', 'Plentiful', 'Farmlands'];
		for (var x = 0; x < values.length; x++) {
			tooltipText += "<option" + ((getAutoJobsSetting().portalGather && getAutoJobsSetting().portalGather == values[x].toLowerCase()) ? " selected='selected'" : "") + " value='" + values[x].toLowerCase() + "'>" + values[x] + "</option>";
		}
		tooltipText += "</select></div></td>"

		//MapSpecial
		tooltipText += "<td><td style='width: 25%; padding-left: -15px;'><div class='row'>"
		tooltipText += "<div class='col-xs-3' style='padding-right: 5px; padding-left: -15px;'>Special:</span></div>"
		tooltipText += "<div class='col-xs-9  style='padding-right: 5px; padding-left: -15px;; text-align: right'><select style='width: 80%' id='autoJobSelfGather'><option value='0'>None</option>";
		var values = ['fa', 'lc', 'ssc', 'swc', 'smc', 'src', 'p', 'hc', 'lsc', 'lwc', 'lmc', 'lrc'];
		for (var x = 0; x < values.length; x++) {
			tooltipText += "<option" + ((getAutoJobsSetting().portalGather && getAutoJobsSetting().portalGather == values[x].toLowerCase()) ? " selected='selected'" : "") + " value='" + values[x].toLowerCase() + "'>" + values[x] + "</option>";
		}
		tooltipText += "</select></div></td>"

		//Map Bonus
		tooltipText += "<td><div class='row'>"
		//Checkbox & name
		tooltipText += "<div class='col-xs-3' style='width: 34%; padding-left: 15px;; padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + 'Map Stacks' + "</span></div>"
		//Percent options
		tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>Zone: <input class='structConfigPercent' id='structPercent" + 'House' + "' type='number'  value='" + ((setting && setting.percent) ? setting.percent : 100) + "'/></div>";
		//Max options
		tooltipText += "<div class='col-xs-5' style='width: 33%; padding-left: 5px; text-align: right'>Limit: <input class='structConfigQuantity' id='structMax" + 'House' + "' type='number'  value='" + ((setting && setting.buyMax) ? setting.buyMax : 0) + "'/></div>";
		//Finish
		tooltipText += "</div></td>";


		tooltipText += "</tr><tr></tbody></ta


		tooltipText += "<table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";
		tooltipText += "<td><div class='row'>"
		//Checkbox & name
		tooltipText += "<div class='col-xs-3' style='width: 34%; padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + 'Frozen Castle' + "</span></div>"
		//Percent options
		tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>Zone: <input class='structConfigPercent' id='structPercent" + 'House' + "' type='number'  value='" + ((setting && setting.percent) ? setting.percent : 100) + "'/></div>";
		//Max options
		tooltipText += "<div class='col-xs-5' style='width: 33%; padding-left: 5px; text-align: right'>Cell: <input class='structConfigQuantity' id='structMax" + 'House' + "' type='number'  value='" + ((setting && setting.buyMax) ? setting.buyMax : 0) + "'/></div>";
		//Finish
		tooltipText += "</div></td>";
		tooltipText += "<td><div class='row'>"
		//Checkbox & name
		tooltipText += "<div class='col-xs-3' style='width: 34%; padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + 'Frozen Castle' + "</span></div>"
		//Percent options
		tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>Zone: <input class='structConfigPercent' id='structPercent" + 'House' + "' type='number'  value='" + ((setting && setting.percent) ? setting.percent : 100) + "'/></div>";
		//Max options
		tooltipText += "<div class='col-xs-5' style='width: 33%; padding-left: 5px; text-align: right'>Cell: <input class='structConfigQuantity' id='structMax" + 'House' + "' type='number'  value='" + ((setting && setting.buyMax) ? setting.buyMax : 0) + "'/></div>";
		//Finish
		tooltipText += "</div></td>";
		tooltipText += "</tr><tr>";



		tooltipText += "</tr><tr></tbody></table>";
		tooltipText += "<table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";
		//Atlantrimp
		tooltipText += "<td><div class='row'>"
		//Checkbox & name
		tooltipText += "<div class='col-xs-3' style='width: 34%; padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + 'Atlantrimp' + "</span></div>"
		//Percent options
		tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>Zone: <input class='structConfigPercent' id='structPercent" + 'House' + "' type='number'  value='" + ((setting && setting.percent) ? setting.percent : 100) + "'/></div>";
		//Max options
		tooltipText += "<div class='col-xs-5' style='width: 33%; padding-left: 5px; text-align: right'>Cell: <input class='structConfigQuantity' id='structMax" + 'House' + "' type='number'  value='" + ((setting && setting.buyMax) ? setting.buyMax : 0) + "'/></div>";
		//Finish
		tooltipText += "</div></td>";


		//Melting Point
		tooltipText += "<td><div class='row'>"
		//Checkbox & name
		tooltipText += "<div class='col-xs-3' style='width: 34%; padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + 'Melting Point' + "</span></div>"
		//Percent options
		tooltipText += "<div class='col-xs-5' style='width: 33%; text-align: right'>Zone: <input class='structConfigPercent' id='structPercent" + 'House' + "' type='number'  value='" + ((setting && setting.percent) ? setting.percent : 100) + "'/></div>";
		//Max options
		tooltipText += "<div class='col-xs-5' style='width: 33%; padding-left: 5px; text-align: right'>Cell: <input class='structConfigQuantity' id='structMax" + 'House' + "' type='number'  value='" + ((setting && setting.buyMax) ? setting.buyMax : 0) + "'/></div>";
		//Finish
		tooltipText += "</div></td>";

		tooltipText += "</tr><tr>";

		tooltipText += "</tr></tbody></table>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info btn-lg' onclick='saveATAutoStructureConfig()'>Apply</div><div class='btn-lg btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
		game.global.lockTooltip = true;
		ondisplay = function () {
			//swapClass('tooltipExtra', 'tooltipExtraGigantic', elem);
			verticalCenterTooltip(false, true);
		}; */
	}

	//Farming Settings
	if (event == 'MAZ') {
		var maxSettings = 30;

		//Setting up the Help onclick setting.
		var mazHelp = "Welcome to '" + titleText + "' settings! This is a powerful automation tool that allows you to set when maps should be automatically run, and allows for a high amount of customization. Here's a quick overview of what everything does:"

		//Map Bonus Information to detail how it functions since it's unclear compared to every other setting
		if (titleText.includes('Map Bonus')) mazHelp += "<br><br>Map Bonus works by using the last line that's greater or equal to your current world zone and then using those settings for every zone that follows on from it."


		//Default Value settings
		mazHelp += "<br><br>The default values section are values which will automatically be input when a new row has been added. There's a few exception to this such as:<br></br><ul>"
		mazHelp += "<li><b>Active</b> - A toggle to temporarily disable/enable the entire setting.</li>"
		if (titleText.includes('Worshipper Farm')) mazHelp += "<li><b>Skip Value</b> - How many worshippers a map must provide for you to run your Worshipper Farming.</li>";
		if (titleText.includes('Hypothermia')) mazHelp += "<li><b>Frozen Castle</b> - The zone,cell combination that you'd like Frozen Castle to be run at. The input style is '200,99' and if you don't input it properly it'll default to zone 200 cell 99.</li>"
		if (titleText.includes('Hypothermia')) mazHelp += "<li><b>AutoStorage</b> - Disables AutoStorage until the first Bonfire farm zone that you reach during the challenge.</li>"
		if (titleText.includes('Hypothermia')) mazHelp += "<li><b>Packrat</b> - Will purchase as many levels of packrat as possible once the Hypothermia challenge ends with leftover radon and additionally when portaling it reset the packrat level to 3 so that you don't accidentally trigger a 5th bonfire at the start of the run.</li>"
		if (titleText.includes('Raiding')) mazHelp += "<li><b>Recycle</b> - A toggle to recycle maps after raiding has finished.</li>"

		//Row Settings
		mazHelp += "</ul></br> The settings for each row that is added:<ul>"
		mazHelp += "<li><span style='padding-left: 0.3%' class='mazDelete'><span class='icomoon icon-cross'></span></span> - Remove this MaZ line completely</li>"
		mazHelp += "<li><b>Active</b> - A toggle to temporarily disable/enable this line.</li>"
		mazHelp += "<li><b>Zone</b> - The Zone that this line should run. Must be between 6 and 1000.</li>"
		if (titleText.includes('Raiding')) mazHelp += "<li><b>Raiding Zone</b> - The zone you'd like to raid when this line is run. If your 'Zone' input is 231 then the highest zone you can input is 241.</li>"
		mazHelp += "<li><b>Cell</b> - The cell number between 1 and 100 where this line should trigger. 1 is the first cell of the Zone, 100 is the final cell. This line will trigger before starting combat against that cell.</li>"
		if (titleText.includes('Worshipper Farm') || titleText.includes('Time Farm') || titleText.includes('Tribute Farm') || titleText.includes('Smithy Farm') || titleText.includes('Map Bonus')) mazHelp += "<li><b>Auto Level</b> - Will automatically identify the best map level for your farming needs by looking at highest affordable map level and then calculating if you can one shot enemies with Titimp buff. Highly recommended to use 'Auto Equality: Advanced' with this setting as it'll speed up map runs by a significant amount.</li>"
		if (!titleText.includes('Quagmire Farm') && !titleText.includes('Bone Shrine') && !titleText.includes('Raiding') && !titleText.includes('Map Bonus') && !titleText.includes('Void') && (titleText.includes('Worshipper Farm') || titleText.includes('Time Farm') || titleText.includes('Tribute Farm') || titleText.includes('Smithy Farm'))) mazHelp += "<li><b>Map Level</b> - The map level you'd like this line to run. Can input a positive or negative number for this so input could be '-5', '0', or '3'. Will override inputs above -1 during the Wither challenge.</li>"

		if (!titleText.includes('Quagmire Farm') && !titleText.includes('Bone Shrine') && !titleText.includes('Raiding') && !titleText.includes('Map Bonus') && !titleText.includes('Void') && !(titleText.includes('Worshipper Farm') || titleText.includes('Time Farm') || titleText.includes('Tribute Farm') || titleText.includes('Smithy Farm'))) mazHelp += "<li><b>Map Level</b> - The map level you'd like this line to run. Can input a positive or negative number for this so input could be '-5', '0', or '3'.</li>"

		if (titleText.includes('Map Bonus')) mazHelp += "<li><b>Map Level</b> - The map level you'd like this line to run. Can only input 0 or a positive so the input could be ', '0', or '3', or '10'.</li>"
		if (game.global.stringVersion >= '5.8.0' && titleText.includes('Tribute Farm')) mazHelp += "<li><b>Farm Type</b> - The way in which Tribute Farming will operate. Either by using absolute values for what you'd like to farm e.g. 2700 Tributes and 37 Meteorologists or by having AT identify how many of each you can farm in X maps and then using that count to identify the amount based off expected mapping gains.</li>"
		if (titleText.includes('Tribute Farm')) mazHelp += "<li><b>Tributes</b> - The amount of Tributes that should be farmed up to on this zone. If the value is greater than your Tribute Cap setting then it'll adjust it to the Tribute input whilst doing this farm.</li>"
		if (titleText.includes('Tribute Farm')) mazHelp += "<li><b>Meteorologist</b> - The amount of Meteorologist that should be farmed up to on this zone.</li>"
		if (titleText.includes('Time Farm')) mazHelp += "<li><b>Map Repeat</b> - How many maps you'd like to run during this line.</li>";
		if (titleText.includes('Map Bonus')) mazHelp += "<li><b>Map Stacks</b> - How many maps you'd like to run during this line.</li>";
		if (titleText.includes('Quagmire Farm')) mazHelp += "<li><b>Bogs</b> - How many Black Bog maps you'd like to run during this line.</li>";
		if (titleText.includes('Insanity Farm')) mazHelp += "<li><b>Insanity</b> - How many Insanity stack you'd like to farm up to during this line.</li>";
		if (titleText.includes('Alchemy Farm')) mazHelp += "<li><b>Potion Type</b> - The type of potion you want to farm during this line.</li>";
		if (titleText.includes('Alchemy Farm')) mazHelp += "<li><b>Potion Number</b> - How many of the potion specified in 'Potion Type' you'd like to farm for.</li>";
		if (titleText.includes('Hypothermia Farm')) mazHelp += "<li><b>Bonfires</b> - How many Bonfires should be farmed on this zone. Uses max bonfires built rather than a specific amount to farm for so if you have already built 14 so far during your run and want another 8 then you'd input 22.</li>";
		if (titleText.includes('Bone Shrine')) mazHelp += "<li><b>To use</b> - How many bone charges to use on this line.</li>";
		if (titleText.includes('Bone Shrine')) mazHelp += "<li><b>Use below</b> - This value will stop bone charges being spent when you're at or below this value.</li>";
		if (titleText.includes('Worshipper Farm')) mazHelp += "<li><b>Ship</b> - How many worshippers you'd like to farm up to during this line. Max input is 50 and it'll default to that value if you input anything higher.</li>";
		if (titleText.includes('Worshipper Farm')) mazHelp += "<li><b>Repeat Every</b> - Line can be repeated every Zone, or set to a custom number depending on need.</li>";
		if (titleText.includes('Worshipper Farm')) mazHelp += "<li><b>End Zone</b> - Only matters if you're planning on having this MaZ line repeat. If so, the line will stop repeating at this Zone. Must be between 6 and 1000.</li>";
		if (titleText.includes('Tribute Farm')) mazHelp += "<li><b>Buy Buildings</b> - If you'd like to buy buildings during this farming line to reduce the amount of maps it takes to farm your specified Tribute or Meteorologist inputs. When unselected it will automatically disable vanilla AutoStructure if it's enabled to remove the possibility of resources being spent there too.</li>";
		if (titleText.includes('Tribute Farm')) mazHelp += "<li><b>Run Atlantrimp</b> - Will run Atlantrimp during this line. Autoamtically calculates when it would be more efficient to run Atlantrimp or continue farming Savory Cache maps to reach your target in the fastest time possible. <b>Won't run on food shred dailies.</b></li>";
		if (titleText.includes('Bone Shrine')) mazHelp += "<li><b>Run Atlantrimp</b> - Will run Atlantrimp during this line. After using the bone shrine charges specified for this line it will stop AT purchasing equips until Atlantrimp has been run so that there is no wasted resources. <b>Won't run on shred dailies that would be impacted by your farming choices.</b></li>";
		if (titleText.includes('Time Farm')) mazHelp += "<li><b>Run Atlantrimp</b> - Will run Atlantrimp during this line. Whilst farming the specified amount of maps for this line it will stop AT purchasing equips until Atlantrimp has been run so that there is no wasted resources. <b>Won't run on shred dailies that would be impacted by your farming choices.</b></li>";
		if (titleText.includes('Smithy Farm')) mazHelp += "<li><b>Smithies</b> - Smithy count you'd like to reach during this line. If you currently own 18 and want to reach 21 you'd enter 21 into this field.</li>";
		if (!titleText.includes('Raiding') && !titleText.includes('Smithy')) mazHelp += "<li><b>Job Ratio</b> - The job ratio you want to use for this line. Input will look like '1,1,1,1' (Farmers, Lumberjacks, Miners, Scientists). If you don't want Farmers, Miners or Scientists you can input '0,1' for this setting.</li>"
		if (titleText.includes('Bone Shrine')) mazHelp += "<li><b>Gather</b> - Which resource you'd like to gather when popping a Bone Shrine charge to make use of Turkimp resource bonus.</li>";
		if (titleText.includes('Time Farm') || titleText.includes('Alchemy') || titleText.includes('Map Bonus') || titleText.includes('Insanity')) mazHelp += "<li><b>Special</b> - The type of cache you'd like to run during this map. Will override metal cache inputs with savory caches during the Transmute challenge.</li>";
		if (titleText.includes('Bone Shrine') || titleText.includes('Void Map')) mazHelp += "<li><b>Run Type</b> - What type of run you'd like this line to be run.</li>";
		if (titleText.includes('Raiding')) mazHelp += "<li><b>Frag Type</b> - Frag: Farm for fragments to afford the maps you want to create. <br>\
		Frag Min: Used for absolute minimum frag costs (which includes no Prestige special, perfect sliders, random map and the difficulty and size options, however it will try to afford those options first!) and prioritises buying the most maps for a smoother sequential raid. \
		<br>Frag Max: This option will make sure that the map has perfect sliders and uses the pretegious special.</li>";





		//Setting up default values section
		tooltipText = "\
		<div id='windowContainer' style='display: block'><div id='windowError'></div>\
		<div class='row windowRow'>Default Values</div>\
		<div class='row windowRow titles'>\
		<div class='windowActive'>Active</div>\
		<div class='windowCell'>Cell</div>"
		if (titleText.includes('Time Farm')) tooltipText += "<div class='windowRepeat'>Repeat<br/>Count</div>"
		if (titleText.includes('Worshipper Farm')) tooltipText += "<div class='windowRepeat'>Skip<br/>Value</div>"
		if (titleText.includes('Map Bonus')) tooltipText += "<div class='windowRepeat'>Map<br/>Stacks</div>"
		if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneBelow'>Use below</div>"
		if (titleText.includes('Worshipper Farm')) tooltipText += "<div class='windowWorshipper'>Ships</div>"
		if (!titleText.includes('Raiding') && !titleText.includes('Smithy')) tooltipText += "<div class='windowJobRatio'>Job Ratio</div>"
		if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneGather'>Gather</div>"
		if (titleText.includes('Time Farm') || titleText.includes('Alchemy') || titleText.includes('Map Bonus') || titleText.includes('Insanity')) tooltipText += "<div class='windowSpecial'>Special</div>"
		if (titleText.includes('Hypothermia')) tooltipText += "<div class='windowFrozenCastle'>Frozen Castle</div>"
		if (titleText.includes('Hypothermia')) tooltipText += "<div class='windowStorage'>AutoStorage</div>"
		if (titleText.includes('Hypothermia')) tooltipText += "<div class='windowPackrat'>Packrat</div>"
		if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowTributeFarmDropdown'>Farm Type</div>"
		if (titleText.includes('Raiding')) tooltipText += "<div class='windowRecycle'>Recycle</div>"
		tooltipText += "</div>";

		var defaultVals = {
			active: true,
			cell: -1,
			special: '0',
			repeat: 1,
			shipskip: 10,
			gather: 0,
			bonebelow: 0,
			jobratio: '1,1,1,1',
			worshipper: 50,
			autostorage: false,
			packrat: false,
			frozencastle: [200, 99],
			mapType: 'Absolute'
		}
		var style = "";

		defaultVals.active = typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.active) === 'undefined' ? false : autoTrimpSettings[varPrefix + "DefaultSettings"].value.active ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.active : false;
		defaultVals.cell = autoTrimpSettings[varPrefix + "DefaultSettings"].value.cell ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.cell : 81;
		if (titleText.includes('Bone Shrine')) defaultVals.bonebelow = autoTrimpSettings[varPrefix + "DefaultSettings"].value.bonebelow ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.bonebelow : 1;
		if (titleText.includes('Bone Shrine')) defaultVals.worshipper = autoTrimpSettings[varPrefix + "DefaultSettings"].value.worshipper ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.worshipper : 50;
		if (!titleText.includes('Raiding') && !titleText.includes('Smithy')) defaultVals.jobratio = autoTrimpSettings[varPrefix + "DefaultSettings"].value.jobratio ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.jobratio : '1,1,1,1';
		if (titleText.includes('Time Farm') || titleText.includes('Alchemy') || titleText.includes('Bone Shrine') || titleText.includes('Map Bonus')) defaultVals.gather = autoTrimpSettings[varPrefix + "DefaultSettings"].value.gather ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.gather : '0';
		if (titleText.includes('Time Farm') || titleText.includes('Alchemy') || titleText.includes('Map Bonus') || titleText.includes('Insanity')) defaultVals.special = autoTrimpSettings[varPrefix + "DefaultSettings"].value.special ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.special : '0';
		if (titleText.includes('Time Farm') || titleText.includes('Map Bonus')) defaultVals.repeat = autoTrimpSettings[varPrefix + "DefaultSettings"].value.repeat ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.repeat : '0';
		if (titleText.includes('Worshipper Farm')) defaultVals.shipskip = autoTrimpSettings[varPrefix + "DefaultSettings"].value.shipskip ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.shipskip : '10';
		if (titleText.includes('Hypo')) defaultVals.frozencastle = typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.frozencastle) === 'undefined' ? [200, 99] : autoTrimpSettings[varPrefix + "DefaultSettings"].value.frozencastle ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.frozencastle : [200, 99];
		if (titleText.includes('Hypo')) defaultVals.autostorage = typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.autostorage) === 'undefined' ? false : autoTrimpSettings[varPrefix + "DefaultSettings"].value.autostorage ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.autostorage : false;
		if (titleText.includes('Hypo')) defaultVals.packrat = typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.packrat) === 'undefined' ? false : autoTrimpSettings[varPrefix + "DefaultSettings"].value.packrat ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.packrat : false;
		if (titleText.includes('Tribute Farm')) defaultVals.mapType = typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.mapType) === 'undefined' ? 'Absolute' : autoTrimpSettings[varPrefix + "DefaultSettings"].value.mapType ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.mapType : 'Absolute';
		if (titleText.includes('Raiding')) defaultVals.recycle = typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.recycle) === 'undefined' ? false : autoTrimpSettings[varPrefix + "DefaultSettings"].value.recycle ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.recycle : false;
		else style = " style='display: none' ";
		var defaultGatherDropdown = "<option value='food'" + ((defaultVals.gather == 'food') ? " selected='selected'" : "") + ">Food</option>\<option value='wood'" + ((defaultVals.gather == 'wood') ? " selected='selected'" : "") + ">Wood</option>\<option value='metal'" + ((defaultVals.gather == 'metal') ? " selected='selected'" : "") + ">Metal</option>\<option value='science'" + ((defaultVals.gather == 'science') ? " selected='selected'" : "") + ">Science</option>"
		var defaultSpecialsDropdown = "<option value='0'" + ((defaultVals.special == '0') ? " selected='selected'" : "") + ">No Modifier</option>\<option value='fa'" + ((defaultVals.special == 'fa') ? " selected='selected'" : "") + ">Fast Attack</option>\<option value='lc'" + ((defaultVals.special == 'lc') ? " selected='selected'" : "") + ">Large Cache</option>\<option value='ssc'" + ((defaultVals.special == 'ssc') ? " selected='selected'" : "") + ">Small Savory Cache</option>\<option value='swc'" + ((defaultVals.special == 'swc') ? " selected='selected'" : "") + ">Small Wooden Cache</option>\<option value='smc'" + ((defaultVals.special == 'smc') ? " selected='selected'" : "") + ">Small Metal Cache</option>\<option value='src'" + ((defaultVals.special == 'src') ? " selected='selected'" : "") + ">Small Resource Cache</option>\<option value='p'" + ((defaultVals.special == 'p') ? " selected='selected'" : "") + ">Prestigious</option>\<option value='hc'" + ((defaultVals.special == 'hc') ? " selected='selected'" : "") + ">Huge Cache</option>\<option value='lsc'" + ((defaultVals.special == 'lsc') ? " selected='selected'" : "") + ">Large Savory Cache</option>\<option value='lwc'" + ((defaultVals.special == 'lwc') ? " selected='selected'" : "") + ">Large Wooden Cache</option>\<option value='lmc'" + ((defaultVals.special == 'lmc') ? " selected='selected'" : "") + ">Large Metal Cache</option>\<option value='lrc'" + ((defaultVals.special == 'lrc') ? " selected='selected'" : "") + ">Large Research Cache</option>"
		var defaultTributeFarmDropdown = "<option value='Absolute'" + ((defaultVals.mapType == 'Absolute') ? " selected='selected'" : "") + ">Absolute</option>\<option value='Map Count'" + ((defaultVals.mapType === 'Map Count') ? " selected='selected'" : "") + ">Map Count</option>"
		tooltipText += "<div id='windowRow' class='row windowRow'>";
		tooltipText += "<div class='windowActive' style='text-align: center;'>" + buildNiceCheckbox("windowActiveDefault", null, defaultVals.active) + "</div>";
		tooltipText += "<div class='windowCell'><input value='" + defaultVals.cell + "' type='number' id='windowCellDefault'/></div>";
		if (titleText.includes('Time Farm') || titleText.includes('Map Bonus')) tooltipText += "<div class='windowRepeat'><input value='" + defaultVals.repeat + "' type='number' id='windowRepeatDefault'/></div>";
		if (titleText.includes('Worshipper Farm')) tooltipText += "<div class='windowRepeat'><input value='" + defaultVals.shipskip + "' type='number' id='windowRepeatDefault'/></div>";
		if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneBelow'><input value='" + defaultVals.bonebelow + "' type='number' id='windowBoneBelowDefault'/></div>";
		if (titleText.includes('Worshipper Farm')) tooltipText += "<div class='windowWorshipper'><input value='" + defaultVals.worshipper + "' type='number' id='windowWorshipperDefault'/></div>";
		if (!titleText.includes('Raiding') && !titleText.includes('Smithy')) tooltipText += "<div class='windowJobRatio'><input value='" + defaultVals.jobratio + "' type='text' id='windowJobRatioDefault'/></div>";
		if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneGather'><select value='" + defaultVals.gather + "' id='windowBoneGatherDefault'>" + defaultGatherDropdown + "</select></div>"
		if (titleText.includes('Time Farm') || titleText.includes('Alchemy') || titleText.includes('Map Bonus') || titleText.includes('Insanity')) tooltipText += "<div class='windowSpecial'><select value='" + defaultVals.special + "' id='windowSpecialDefault'>" + defaultSpecialsDropdown + "</select></div>"
		if (titleText.includes('Hypo')) tooltipText += "<div class='windowFrozenCastle'><input value='" + defaultVals.frozencastle + "' type='text' id='windowFrozenCastleDefault'/></div>";
		if (titleText.includes('Hypo')) tooltipText += "<div class='windowStorage' style='text-align: center;'>" + buildNiceCheckbox("windowStorageDefault", null, defaultVals.autostorage) + "</div>";
		if (titleText.includes('Hypo')) tooltipText += "<div class='windowPackrat' style='text-align: center;'>" + buildNiceCheckbox("windowPackratDefault", null, defaultVals.packrat) + "</div>";
		if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowTributeFarmDropdown'><select value='" + defaultVals.mapType + "' id='windowTributeFarmDropdownDefault'>" + defaultTributeFarmDropdown + "</select></div>"
		if (titleText.includes('Raiding')) tooltipText += "<div class='windowRecycle' style='text-align: center;'>" + buildNiceCheckbox("windowRecycleDefault", null, defaultVals.recycle) + "</div>";
		tooltipText += "</div>"


		//Setting up rows for each setting
		tooltipText += "\
		<div id='windowContainer' style='display: block'><div id='windowError'></div>\
		<div class='row windowRow titles'>\
		<div class='windowActive'>Active?</div>\
		<div class='windowWorld'>Zone</div>"
		if (titleText.includes('Raiding')) tooltipText += "<div class='windowRaidingZone'>Raiding<br/>Zone</div>"
		tooltipText += "<div class='windowCell'>Cell</div>"
		if (titleText.includes('Time Farm') || titleText.includes('Tribute Farm') || titleText.includes('Smithy Farm') || titleText.includes('Map Bonus') || titleText.includes('Worshipper Farm')) tooltipText += "<div class='windowCheckbox'>Auto Level</div>"
		if (!titleText.includes('Quagmire Farm') && !titleText.includes('Bone Shrine') && !titleText.includes('Raiding') && !titleText.includes('Void')) tooltipText += "<div class='windowLevel'>Map<br/>Level</div>"
		if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowTributeFarmDropdown'>Farm Type</div>"
		if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowTributes'>Tributes</div>"
		if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowMets'>Mets</div>"
		if (titleText.includes('Time Farm')) tooltipText += "<div class='windowRepeat'>Repeat<br/>Count</div>"
		if (titleText.includes('Map Bonus')) tooltipText += "<div class='windowRepeat'>Map<br/>Stacks</div>"
		if (titleText.includes('Quagmire Farm')) tooltipText += "<div class='windowBogs'>Bogs</div>"
		if (titleText.includes('Insanity Farm')) tooltipText += "<div class='windowInsanity'>Insanity</div>"
		if (titleText.includes('Alchemy Farm')) tooltipText += "<div class='windowPotionType'>Potion Type</div>"
		if (titleText.includes('Alchemy Farm')) tooltipText += "<div class='windowPotionNumber'>Potion Number</div>"
		if (titleText.includes('Hypothermia Farm')) tooltipText += "<div class='windowBonfire'>Bonfires</div>"
		if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneAmount'>To use</div>"
		if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneBelow'>Use below</div>"
		if (titleText.includes('Worshipper Farm')) tooltipText += "<div class='windowWorshipper'>Ships</div>"
		if (titleText.includes('Smithy Farm')) tooltipText += "<div class='windowRepeat'>Smithies</div>"
		if (titleText.includes('Worshipper Farm')) tooltipText += "<div class='windowRepeat'>Repeat<br/>Every</div>"
		if (titleText.includes('Worshipper Farm')) tooltipText += "<div class='windowEndZone'>End<br/>Zone</div>"
		if (titleText.includes('Void')) tooltipText += "<div class='windowWorshipper'>Void<br/>Mod</div>"
		if (!titleText.includes('Raiding') && !titleText.includes('Smithy')) tooltipText += "<div class='windowJobRatio'>Job Ratio</div>"
		if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowBuildings'>Buy<br/>Buildings</div>"
		if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneGather'>Gather</div>"
		if (titleText.includes('Time Farm') || titleText.includes('Alchemy') || titleText.includes('Map Bonus') || titleText.includes('Insanity')) tooltipText += "<div class='windowSpecial'>Special</div>"
		if (titleText.includes('Bone Shrine') || titleText.includes('Void Map')) tooltipText += "<div class='windowRunType'>Run<br/>Type</div>"
		if (titleText.includes('Raiding')) tooltipText += "<div class='windowRaidingDropdown'>Frag Type</div>"
		if (titleText.includes('Time Farm') || titleText.includes('Tribute Farm') || titleText.includes('Bone Shrine')) tooltipText += "<div class='windowAtlantrimp'>Run<br/>Atlantrimp</div>"
		tooltipText += "</div>";

		var current = autoTrimpSettings[varPrefix + "Settings"].value;

		for (var x = 0; x < maxSettings; x++) {
			var vals = {
				active: true,
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
				runType: 10,
				raidingDropdown: 0,
				jobratio: '1,1,1,1',
				worshipper: 50,
				voidMod: 0,
				buildings: true,
				atlantrimp: false,
				raidingzone: 6,
				mapType: 'Absolute',
				autoLevel: true,
				endzone: -1
			}
			var style = "";
			if (current.length - 1 >= x) {
				vals.active = autoTrimpSettings[varPrefix + "Settings"].value[x].active;
				vals.world = autoTrimpSettings[varPrefix + "Settings"].value[x].world;
				if (titleText.includes('Raiding')) vals.raidingzone = autoTrimpSettings[varPrefix + "Settings"].value[x].raidingzone ? autoTrimpSettings[varPrefix + "Settings"].value[x].raidingzone : 1;
				vals.cell = autoTrimpSettings[varPrefix + "Settings"].value[x].cell ? autoTrimpSettings[varPrefix + "Settings"].value[x].cell : 81;
				if (!titleText.includes('Quagmire Farm') && !titleText.includes('Bone Shrine') && !titleText.includes('Raiding') && !titleText.includes('Void')) vals.level = autoTrimpSettings[varPrefix + "Settings"].value[x].level
				if (titleText.includes('Time Farm') || titleText.includes('Tribute Farm') || titleText.includes('Smithy Farm') || titleText.includes('Map Bonus') || titleText.includes('Worshipper Farm')) vals.autoLevel = typeof (autoTrimpSettings[varPrefix + "Settings"].value[x].autoLevel) !== 'undefined' ? autoTrimpSettings[varPrefix + "Settings"].value[x].autoLevel : true;
				if (titleText.includes('Tribute Farm')) vals.mapType = autoTrimpSettings[varPrefix + "Settings"].value[x].mapType ? autoTrimpSettings[varPrefix + "Settings"].value[x].mapType : 'Absolute';
				if (titleText.includes('Time Farm') || titleText.includes('Smithy') || titleText.includes('Map Bonus')) vals.repeat = autoTrimpSettings[varPrefix + "Settings"].value[x].repeat ? autoTrimpSettings[varPrefix + "Settings"].value[x].repeat : 1;
				if (titleText.includes('Worshipper Farm')) vals.repeat = autoTrimpSettings[varPrefix + "Settings"].value[x].repeat ? autoTrimpSettings[varPrefix + "Settings"].value[x].repeat : 0;
				if (titleText.includes('Worshipper Farm')) vals.endzone = autoTrimpSettings[varPrefix + "Settings"].value[x].endzone ? autoTrimpSettings[varPrefix + "Settings"].value[x].endzone : 1;
				if (titleText.includes('Tribute Farm')) vals.tributes = autoTrimpSettings[varPrefix + "Settings"].value[x].tributes ? autoTrimpSettings[varPrefix + "Settings"].value[x].tributes : 0;
				if (titleText.includes('Tribute Farm')) vals.mets = autoTrimpSettings[varPrefix + "Settings"].value[x].mets ? autoTrimpSettings[varPrefix + "Settings"].value[x].mets : 0;
				if (titleText.includes('Tribute Farm')) vals.buildings = typeof (autoTrimpSettings[varPrefix + "Settings"].value[x].buildings) !== 'undefined' ? autoTrimpSettings[varPrefix + "Settings"].value[x].buildings : true;
				if (titleText.includes('Time Farm') || titleText.includes('Tribute Farm') || titleText.includes('Bone Shrine')) vals.atlantrimp = typeof (autoTrimpSettings[varPrefix + "Settings"].value[x].atlantrimp) !== 'undefined' ? autoTrimpSettings[varPrefix + "Settings"].value[x].atlantrimp : false;
				if (titleText.includes('Quagmire Farm')) vals.bogs = autoTrimpSettings[varPrefix + "Settings"].value[x].bogs ? autoTrimpSettings[varPrefix + "Settings"].value[x].bogs : 0;
				if (titleText.includes('Insanity Farm')) vals.insanity = autoTrimpSettings[varPrefix + "Settings"].value[x].insanity ? autoTrimpSettings[varPrefix + "Settings"].value[x].insanity : 0;
				if (titleText.includes('Alchemy Farm')) vals.potionstype = autoTrimpSettings[varPrefix + "Settings"].value[x].potion[0] ? autoTrimpSettings[varPrefix + "Settings"].value[x].potion[0] : 0;
				if (titleText.includes('Alchemy Farm')) vals.potionsnumber = autoTrimpSettings[varPrefix + "Settings"].value[x].potion.toString().replace(/[^\d,:-]/g, '') ? autoTrimpSettings[varPrefix + "Settings"].value[x].potion.toString().replace(/[^\d,:-]/g, '') : 0;
				if (titleText.includes('Hypothermia Farm')) vals.bonfires = autoTrimpSettings[varPrefix + "Settings"].value[x].bonfire ? autoTrimpSettings[varPrefix + "Settings"].value[x].bonfire : 0;
				if (titleText.includes('Time Farm') || titleText.includes('Alchemy') || titleText.includes('Map Bonus') || titleText.includes('Insanity')) vals.special = autoTrimpSettings[varPrefix + "Settings"].value[x].special ? autoTrimpSettings[varPrefix + "Settings"].value[x].special : -1;
				if (titleText.includes('Bone Shrine')) vals.boneamount = autoTrimpSettings[varPrefix + "Settings"].value[x].boneamount ? autoTrimpSettings[varPrefix + "Settings"].value[x].boneamount : 0;
				if (titleText.includes('Bone Shrine')) vals.bonebelow = autoTrimpSettings[varPrefix + "Settings"].value[x].bonebelow ? autoTrimpSettings[varPrefix + "Settings"].value[x].bonebelow : 0;
				if (titleText.includes('Worshipper Farm')) vals.worshipper = autoTrimpSettings[varPrefix + "Settings"].value[x].worshipper ? autoTrimpSettings[varPrefix + "Settings"].value[x].worshipper : 50;
				if (titleText.includes('Void')) vals.voidMod = autoTrimpSettings[varPrefix + "Settings"].value[x].voidMod ? autoTrimpSettings[varPrefix + "Settings"].value[x].voidMod : 0;
				if (!titleText.includes('Raiding') && !titleText.includes('Smithy')) vals.jobratio = autoTrimpSettings[varPrefix + "Settings"].value[x].jobratio ? autoTrimpSettings[varPrefix + "Settings"].value[x].jobratio : '1,1,1,1';
				if (titleText.includes('Time Farm') || titleText.includes('Alchemy') || titleText.includes('Bone Shrine') || titleText.includes('Map Bonus')) vals.gather = autoTrimpSettings[varPrefix + "Settings"].value[x].gather ? autoTrimpSettings[varPrefix + "Settings"].value[x].gather : '0';
				if (titleText.includes('Bone Shrine') || titleText.includes('Void Map')) vals.runType = autoTrimpSettings[varPrefix + "Settings"].value[x].runType ? autoTrimpSettings[varPrefix + "Settings"].value[x].runType : 1;
				if (titleText.includes('Raiding')) vals.raidingDropdown = autoTrimpSettings[varPrefix + "Settings"].value[x].raidingDropdown ? autoTrimpSettings[varPrefix + "Settings"].value[x].raidingDropdown : 1;
			}

			else style = " style='display: none' ";
			var gatherDropdown = "<option value='food'" + ((vals.gather == 'food') ? " selected='selected'" : "") + ">Food</option>\<option value='wood'" + ((vals.gather == 'wood') ? " selected='selected'" : "") + ">Wood</option>\<option value='metal'" + ((vals.gather == 'metal') ? " selected='selected'" : "") + ">Metal</option>\<option value='science'" + ((vals.gather == 'science') ? " selected='selected'" : "") + ">Science</option>"

			//Specials dropdown with conditions for each unlock to only appear when the user can run them.
			var specialsDropdown = "<option value='0'" + ((vals.special == '0') ? " selected='selected'" : "") + ">No Modifier</option>"
			if (game.global.highestRadonLevelCleared >= 14) specialsDropdown += "<option value='fa'" + ((vals.special == 'fa') ? " selected='selected'" : "") + ">Fast Attack</option>\<option value='lc'" + ((vals.special == 'lc') ? " selected='selected'" : "") + ">Large Cache</option>"
			if (game.global.highestRadonLevelCleared >= 24) specialsDropdown += "<option value = 'ssc'" + ((vals.special == 'ssc') ? " selected = 'selected'" : "") + " > Small Savory Cache</option >\
			<option value='swc'" + ((vals.special == 'swc') ? " selected = 'selected'" : "") + " > Small Wooden Cache</option >\
			<option value='smc'" + ((vals.special == 'smc') ? " selected = 'selected'" : "") + " > Small Metal Cache</option > "
			if (game.global.ArchaeologyDone) specialsDropdown += "<option value='src'" + ((vals.special == 'src') ? " selected='selected'" : "") + ">Small Research Cache</option>"
			if (game.global.highestRadonLevelCleared >= 54) specialsDropdown += "<option value='p'" + ((vals.special == 'p') ? " selected='selected'" : "") + ">Prestigious</option>"
			if (game.global.highestRadonLevelCleared >= 64) specialsDropdown += "<option value='hc'" + ((vals.special == 'hc') ? " selected='selected'" : "") + ">Huge Cache</option>"
			if (game.global.highestRadonLevelCleared >= 84) specialsDropdown += "<option value='lsc'" + ((vals.special == 'lsc') ? " selected='selected'" : "") + ">Large Savory Cache</option>\
				<option value='lwc'" + ((vals.special == 'lwc') ? " selected='selected'" : "") + ">Large Wooden Cache</option>\
				<option value='lmc'" + ((vals.special == 'lmc') ? " selected='selected'" : "") + ">Large Metal Cache</option>"
			if (game.global.ArchaeologyDone) specialsDropdown += "<option value='lrc'" + ((vals.special == 'lrc') ? " selected='selected'" : "") + ">Large Research Cache</option>"

			var potionDropdown = "<option value='h'" + ((vals.potionstype == 'h') ? " selected='selected'" : "") + ">Herby Brew</option>\<option value='g'" + ((vals.potionstype == 'g') ? " selected='selected'" : "") + ">Gaseous Brew</option>\<option value='f'" + ((vals.potionstype == 'f') ? " selected='selected'" : "") + ">Potion of Finding</option>\<option value='v'" + ((vals.potionstype == 'v') ? " selected='selected'" : "") + ">Potion of the Void</option>\<option value='s'" + ((vals.potionstype == 's') ? " selected='selected'" : "") + ">Potion of Strength</option>"
			var runTypeDropdown = "<option value='none'" + ((vals.runType == 'none') ? " selected='selected'" : "") + ">None</option>\<option value='Fillers'" + ((vals.runType == 'Fillers') ? " selected='selected'" : "") + ">Fillers</option>\<option value='Daily'" + ((vals.runType == 'Daily') ? " selected='selected'" : "") + ">Daily</option>\<option value='C3'" + ((vals.runType == 'C3') ? " selected='selected'" : "") + ">C3</option>\<option value='All'" + ((vals.runType == 'All') ? " selected='selected'" : "") + ">All</option>"
			var raidingDropdown = "<option value='0'" + ((vals.raidingDropdown == '0') ? " selected='selected'" : "") + ">Frag</option>\<option value='1'" + ((vals.raidingDropdown == '1') ? " selected='selected'" : "") + ">Frag Min</option>\<option value='2'" + ((vals.raidingDropdown == '2') ? " selected='selected'" : "") + ">Frag Max</option>"
			var tributeFarmDropdown = "<option value='Absolute'" + ((vals.mapType == 'Absolute') ? " selected='selected'" : "") + ">Absolute</option>\<option value='Map Count'" + ((vals.mapType == 'Map Count') ? " selected='selected'" : "") + ">Map Count</option>\</option>"
			var className = (vals.special === 'hc' || vals.special === 'lc') ? " windowBwMainOn" : " windowBwMainOff";
			className += (vals.special == 'hc' || vals.special === 'lc') ? " windowGatherOn" : " windowGatherOff";
			className += (x <= current.length - 1) ? " active" : "  disabled";
			tooltipText += "<div id='windowRow" + x + "' class='row windowRow " + className + "'" + style + ">";
			tooltipText += "<div class='windowDelete' onclick='removeRow(\"" + x + "\",\"" + titleText + "\", true)'><span class='icomoon icon-cross'></span></div>";
			tooltipText += "<div class='windowActive' style='text-align: center;'>" + buildNiceCheckbox("windowActive" + x, null, vals.active) + "</div>";
			tooltipText += "<div class='windowWorld'><input value='" + vals.world + "' type='number' id='windowWorld" + x + "'/></div>";
			if (titleText.includes('Raiding')) tooltipText += "<div class='windowRaidingZone'><input value='" + vals.raidingzone + "' type='number' id='windowRaidingZone" + x + "'/></div>";
			tooltipText += "<div class='windowCell'><input value='" + vals.cell + "' type='number' id='windowCell" + x + "'/></div>";
			if (titleText.includes('Time Farm') || titleText.includes('Tribute Farm') || titleText.includes('Smithy Farm') || titleText.includes('Map Bonus') || titleText.includes('Worshipper Farm')) tooltipText += "<div class='windowAutoLevel' style='text-align: center;'>" + buildNiceCheckbox("windowAutoLevel" + x, null, vals.autoLevel) + "</div>";
			if (!titleText.includes('Quagmire Farm') && !titleText.includes('Bone Shrine') && !titleText.includes('Raiding') && !titleText.includes('Void')) tooltipText += "<div class='windowLevel'><input value='" + vals.level + "' type='number' id='windowLevel" + x + "'/></div>";
			if (titleText.includes('Worshipper Farm')) tooltipText += "<div class='windowWorshipper'><input value='" + vals.worshipper + "' type='number' id='windowWorshipper" + x + "'/></div>";
			if (titleText.includes('Time Farm') || titleText.includes('Smithy') || titleText.includes('Map Bonus') || titleText.includes('Worshipper Farm')) tooltipText += "<div class='windowRepeat'><input value='" + vals.repeat + "' type='number' id='windowRepeat" + x + "'/></div>";
			if (titleText.includes('Worshipper Farm')) tooltipText += "<div class='windowEndZone'><input value='" + vals.endzone + "' type='number' id='windowEndZone" + x + "'/></div>";
			if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowTributeFarmDropdown' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.mapType + "' id='windowTributeFarmDropdown" + x + "'>" + tributeFarmDropdown + "</select></div>"
			if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowTributes'><input value='" + vals.tributes + "' type='number' id='windowTributes" + x + "'/></div>";
			if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowMets'><input value='" + vals.mets + "' type='number' id='windowMets" + x + "'/></div>";
			if (titleText.includes('Quagmire Farm')) tooltipText += "<div class='windowBogs'><input value='" + vals.bogs + "' type='number' id='windowBogs" + x + "'/></div>";
			if (titleText.includes('Insanity Farm')) tooltipText += "<div class='windowInsanity'><input value='" + vals.insanity + "' type='number' id='windowInsanity" + x + "'/></div>";
			if (titleText.includes('Alchemy')) tooltipText += "<div class='windowPotionType' onchange='updateWindowPreset(" + x + ")'><select value='" + vals.potionstype + "' id='windowPotionType" + x + "'>" + potionDropdown + "</select></div>"
			if (titleText.includes('Alchemy Farm')) tooltipText += "<div class='windowPotionNumber'><input value='" + vals.potionsnumber + "' type='text' id='windowPotionNumber" + x + "'/></div>";
			if (titleText.includes('Hypothermia Farm')) tooltipText += "<div class='windowBonfire'><input value='" + vals.bonfires + "' type='number' id='windowBonfire" + x + "'/></div>";
			if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneAmount'><input value='" + vals.boneamount + "' type='number' id='windowBoneAmount" + x + "'/></div>";
			if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneBelow'><input value='" + vals.bonebelow + "' type='number' id='windowBoneBelow" + x + "'/></div>";
			if (titleText.includes('Void')) tooltipText += "<div class='windowWorshipper'><input value='" + vals.voidMod + "' type='number' id='windowVoidMod" + x + "'/></div>";
			if (!titleText.includes('Raiding') && !titleText.includes('Smithy')) tooltipText += "<div class='windowJobRatio'><input value='" + vals.jobratio + "' type='value' id='windowJobRatio" + x + "'/></div>";
			if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowBuildings' style='text-align: center;'>" + buildNiceCheckbox("windowBuildings" + x, null, vals.buildings) + "</div>";
			if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneGather' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.gather + "' id='windowBoneGather" + x + "'>" + gatherDropdown + "</select></div>"
			if (titleText.includes('Bone Shrine') || titleText.includes('Void Map')) tooltipText += "<div class='windowRunType' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.runType + "' id='windowRunType" + x + "'>" + runTypeDropdown + "</select></div>"
			if (titleText.includes('Raiding')) tooltipText += "<div class='windowRaidingDropdown' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.raidingDropdown + "' id='windowRaidingDropdown" + x + "'>" + raidingDropdown + "</select></div>"
			if (titleText.includes('Time Farm') || titleText.includes('Alchemy') || titleText.includes('Map Bonus') || titleText.includes('Insanity')) tooltipText += "<div class='windowSpecial' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.special + "' id='windowSpecial" + x + "'>" + specialsDropdown + "</select></div>"
			if (titleText.includes('Time Farm') || titleText.includes('Alchemy') || titleText.includes('Map Bonus') || titleText.includes('Insanity')) tooltipText += "<div class='windowGather'>\<div style='text-align: center;'>Gather</div>\<onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'>\<select value='" + vals.gather + "' id='windowGather" + x + "'>" + gatherDropdown + "</select>\</div>"
			if (titleText.includes('Time Farm') || titleText.includes('Tribute Farm') || titleText.includes('Bone Shrine')) tooltipText += "<div class='windowAtlantrimp' style='text-align: center;'>" + buildNiceCheckbox("windowAtlantrimp" + x, null, vals.atlantrimp) + "</div>";
			tooltipText += "</div>"
		}

		tooltipText += "<div id='windowAddRowBtn' style='display: " + ((current.length < maxSettings) ? "inline-block" : "none") + "' class='btn btn-success btn-md' onclick='addRow(\"" + varPrefix + "\",\"" + titleText + "\")'>+ Add Row</div>"
		tooltipText += "</div></div><div style='display: none' id='mazHelpContainer'>" + mazHelp + "</div>";
		costText = "<div class='maxCenter'><span class='btn btn-success btn-md' id='confirmTooltipBtn' onclick='settingsWindowSave(\"" + titleText + "\",\"" + varPrefix + "\")'>Save and Close</span><span class='btn btn-danger btn-md' onclick='cancelTooltip(true)'>Cancel</span><span class='btn btn-primary btn-md' id='confirmTooltipBtn' onclick='settingsWindowSave(\"" + titleText + "\",\"" + varPrefix + "\", true)'>Save</span><span class='btn btn-info btn-md' onclick='windowToggleHelp()'>Help</span></div>"

		swapClass('tooltipExtra', 'tooltipExtraLg', elem);
		game.global.lockTooltip = true;
		elem.style.top = "10%";
		elem.style.left = "1%";
		elem.style.height = 'auto';
		elem.style.maxHeight = window.innerHeight * .85 + 'px';
		if (event == 'MAZ' && document.getElementById('windowContainer') !== null && document.getElementById('windowContainer').style.display === 'block' && document.querySelectorAll('#windowContainer .active').length > 12) elem.style.overflowY = 'scroll';
	}

	titleText = (titleText) ? titleText : titleText;

	document.getElementById("tipTitle").innerHTML = titleText;
	document.getElementById("tipText").innerHTML = tooltipText;
	document.getElementById("tipCost").innerHTML = costText;
	elem.style.display = "block";
	if (ondisplay !== null)
		ondisplay();
}

function settingsWindowSave(titleText, varPrefix, reopen) {

	var setting = [];
	var error = "";
	var maxSettings = 30;

	var defaultActive = readNiceCheckbox(document.getElementById('windowActiveDefault'));
	var defaultCell = parseInt(document.getElementById('windowCellDefault').value, 10);
	if (titleText.includes('Time Farm') || titleText.includes('Map Bonus')) var defaultRepeat = parseInt(document.getElementById('windowRepeatDefault').value, 10);
	if (titleText.includes('Worshipper Farm')) var defaultShipSkip = parseInt(document.getElementById('windowRepeatDefault').value, 10);
	if (titleText.includes('Time Farm') || titleText.includes('Alch') || titleText.includes('Map Bonus') || titleText.includes('Insanity')) var defaultSpecial = document.getElementById('windowSpecialDefault').value;
	if (titleText.includes('Bone')) var defaultBonebelow = parseInt(document.getElementById('windowBoneBelowDefault').value, 10);
	if (titleText.includes('Worshipper Farm')) var defaultWorshipper = parseInt(document.getElementById('windowWorshipperDefault').value, 10);
	if (!titleText.includes('Raiding') && !titleText.includes('Smithy')) var defaultJobratio = document.getElementById('windowJobRatioDefault').value;
	if (titleText.includes('Bone')) var defaultBonegather = document.getElementById('windowBoneGatherDefault').value;
	if (titleText.includes('Hypo')) var defaultFrozenCastle = document.getElementById('windowFrozenCastleDefault').value.split(',');
	if (titleText.includes('Hypo')) var defaultAutoStorage = readNiceCheckbox(document.getElementById('windowStorageDefault'));
	if (titleText.includes('Hypo')) var defaultPackrat = readNiceCheckbox(document.getElementById('windowPackratDefault'));
	if (titleText.includes('Raiding')) var defaultRecycle = readNiceCheckbox(document.getElementById('windowRecycleDefault'));
	if (titleText.includes('Tribute Farm')) var mapType = document.getElementById('windowTributeFarmDropdownDefault').value;

	if (defaultCell < 1) defaultCell = 1;
	if (defaultCell > 100) defaultCell = 100;

	if (defaultRepeat < 0) defaultRepeat = 0;

	var thisDefaultSetting = {
		active: defaultActive,
		cell: defaultCell,
		repeat: defaultRepeat,
		special: defaultSpecial,
		bonebelow: defaultBonebelow,
		worshipper: defaultWorshipper,
		gather: defaultBonegather,
		jobratio: defaultJobratio,
		autostorage: defaultAutoStorage,
		packrat: defaultPackrat,
		recycle: defaultRecycle,
		mapType: mapType,
		shipskip: defaultShipSkip,
		frozencastle: defaultFrozenCastle
	};
	autoTrimpSettings[varPrefix + "DefaultSettings"].value = thisDefaultSetting;

	var errorMessage = false;

	for (var x = 0; x < maxSettings; x++) {
		var world = document.getElementById('windowWorld' + x);
		if (!world || world.value == "-1") {
			continue;
		};

		active = readNiceCheckbox(document.getElementById('windowActive' + x));
		world = parseInt(document.getElementById('windowWorld' + x).value, 10);
		var cell = parseInt(document.getElementById('windowCell' + x).value, 10);
		if (!titleText.includes('Quag') && !titleText.includes('Bone') && !titleText.includes('Raiding') && !titleText.includes('Void')) var level = parseInt(document.getElementById('windowLevel' + x).value, 10);
		if (titleText.includes('Time Farm') || titleText.includes('Smithy') || titleText.includes('Map Bonus') || titleText.includes('Worshipper Farm')) var repeat = parseInt(document.getElementById('windowRepeat' + x).value, 10);
		if (titleText.includes('Worshipper Farm')) var endzone = parseInt(document.getElementById('windowEndZone' + x).value, 10);
		if (titleText.includes('Raiding')) var raidingzone = parseInt(document.getElementById('windowRaidingZone' + x).value, 10);
		if (titleText.includes('Time Farm') || titleText.includes('Alch') || titleText.includes('Map Bonus') || titleText.includes('Insanity')) var special = document.getElementById('windowSpecial' + x).value;
		if (titleText.includes('Time Farm') || titleText.includes('Alch') || titleText.includes('Map Bonus') || titleText.includes('Insanity')) {
			if (special == 'hc' || special == 'lc')
				var gather = document.getElementById('windowGather' + x).value;
			else
				var gather = null;
		}

		if (titleText.includes('Time Farm') || titleText.includes('Tribute Farm') || titleText.includes('Smithy Farm') || titleText.includes('Map Bonus') || titleText.includes('Worshipper Farm')) var autoLevel = readNiceCheckbox(document.getElementById('windowAutoLevel' + x));
		if (titleText.includes('Tribute')) var mapType = document.getElementById('windowTributeFarmDropdown' + x).value;
		if (titleText.includes('Tribute')) var tributes = parseInt(document.getElementById('windowTributes' + x).value, 10);
		if (titleText.includes('Tribute')) var mets = parseInt(document.getElementById('windowMets' + x).value, 10);
		if (titleText.includes('Quag')) var bogs = parseInt(document.getElementById('windowBogs' + x).value, 10);
		if (titleText.includes('Insanity')) var insanity = parseInt(document.getElementById('windowInsanity' + x).value, 10);
		if (titleText.includes('Alch')) var potion = document.getElementById('windowPotionType' + x).value;
		if (titleText.includes('Alch')) potion += parseInt(document.getElementById('windowPotionNumber' + x).value, 10);
		if (titleText.includes('Hypo')) var bonfire = parseInt(document.getElementById('windowBonfire' + x).value, 10);
		if (titleText.includes('Bone')) var boneamount = parseInt(document.getElementById('windowBoneAmount' + x).value, 10);
		if (titleText.includes('Bone')) var bonebelow = parseInt(document.getElementById('windowBoneBelow' + x).value, 10);
		if (titleText.includes('Worshipper Farm')) var worshipper = parseInt(document.getElementById('windowWorshipper' + x).value, 10);
		if (titleText.includes('Void')) var voidMod = parseInt(document.getElementById('windowVoidMod' + x).value, 10);
		if (titleText.includes('Tribute')) var buildings = readNiceCheckbox(document.getElementById('windowBuildings' + x));
		if (titleText.includes('Time Farm') || titleText.includes('Tribute') || titleText.includes('Bone Shrine')) var atlantrimp = readNiceCheckbox(document.getElementById('windowAtlantrimp' + x));
		if (!titleText.includes('Raiding') && !titleText.includes('Smithy')) var jobratio = document.getElementById('windowJobRatio' + x).value;
		if (titleText.includes('Bone')) var gather = document.getElementById('windowBoneGather' + x).value;
		if (titleText.includes('Bone') || titleText.includes('Void Map')) var runType = document.getElementById('windowRunType' + x).value;
		if (titleText.includes('Raiding')) var raidingDropdown = document.getElementById('windowRaidingDropdown' + x).value;

		if (isNaN(world) || world < 6) {
			error += " Preset " + (x + 1) + " needs a value for Start Zone that's greater than 5.<br>";
			errorMessage = true;
		}
		else if (world > 1000) {
			error += " Preset " + (x + 1) + " needs a value for Start Zone that's less than 1000.<br>";
			errorMessage = true;
		}
		if (world + level < 6) {
			error += " Preset " + (x + 1) + " can\'t have a zone and map combination below zone 6.<br>";
			errorMessage = true;
		}
		if (titleText.includes('Raiding') && world >= raidingzone) {
			error += " Preset " + (x + 1) + " can\'t have a map level below world level as you won\'t be able to get prestiges there.<br>";
			errorMessage = true;
		}
		if (titleText.includes('Map Bonus') && level < 0) {
			error += " Preset " + (x + 1) + " can\'t have a map level below world level as you won\'t be able to get any map stacks.<br>";
			errorMessage = true;
		}
		if (titleText.includes('Map Bonus') && repeat < 1) {
			error += " Preset " + (x + 1) + " can\'t have a map bonus value lower than 1 as you won\'t be able to get any map stacks.<br>";
			errorMessage = true;
		}
		if (titleText.includes('Time Farm') && repeat < 1) {
			error += " Preset " + (x + 1) + " can\'t have a repeat value lower than 1 as you won\'t run any maps when this line runs.<br>";
			errorMessage = true;
		}
		if (titleText.includes('Insanity') && level === 0) {
			error += " Preset " + (x + 1) + " can\'t have a map level of 0 as you won\'t gain any Insanity stacks running this map.<br>";
			errorMessage = true;
		}
		if (titleText.includes('Insanity') && level < 0) {
			error += " Preset " + (x + 1) + " can\'t have a map level below world level as you will lose Insanity stacks running this map.<br>";
			errorMessage = true;
		}
		if (titleText.includes('Insanity') && insanity < 0) {
			error += " Preset " + (x + 1) + " can\'t have a insanity value below 0.<br>";
			errorMessage = true;
		}
		if (errorMessage === true)
			continue;
		if (level > 10) level = 10;
		if (endzone < world) endzone = world;
		if (cell < 1) cell = 1;
		if (cell > 100) cell = 100;
		if (worshipper > game.jobs.Worshipper.max) worshipper = game.jobs.Worshipper.max;
		if (voidMod < 0) voidMod = 0;

		if (repeat < 0) repeat = 0;
		if (raidingzone - world > 10) raidingzone = world + 10;

		currSetting = autoTrimpSettings[varPrefix + "Settings"].value
		if (currSetting) currSetting = currSetting[x];

		var thisSetting = {
			active: active,
			world: world,
			cell: cell,
			level: level,
			repeat: repeat,
			special: special,
			gather: gather,
			tributes: tributes,
			mets: mets,
			bogs: bogs,
			insanity: insanity,
			potion: potion,
			bonfire: bonfire,
			boneamount: boneamount,
			bonebelow: bonebelow,
			worshipper: worshipper,
			voidMod: voidMod,
			runType: runType,
			raidingDropdown: raidingDropdown,
			buildings: buildings,
			jobratio: jobratio,
			atlantrimp: atlantrimp,
			raidingzone: raidingzone,
			mapType: mapType,
			autoLevel: autoLevel,
			endzone: endzone,
			done: (currSetting && currSetting.done) ? currSetting.done : false
		};
		setting.push(thisSetting);
	}
	setting.sort(function (a, b) { if (a.world == b.world) return (a.cell > b.cell) ? 1 : -1; return (a.world > b.world) ? 1 : -1 });

	if (error) {
		var elem = document.getElementById('windowError');
		if (elem) elem.innerHTML = error;
		return;
	}
	//Reset variables that are about to get used.
	autoTrimpSettings[varPrefix + "Settings"].value = [];
	autoTrimpSettings[varPrefix + "Zone"].value = [];
	if (titleText.includes('Bone')) autoTrimpSettings[varPrefix + "RunType"].value = [];

	for (var x = 0; x < setting.length; x++) {
		autoTrimpSettings[varPrefix + "Settings"].value[x] = setting[x];
		autoTrimpSettings[varPrefix + "Zone"].value[x] = setting[x].world
		if (titleText.includes('Bone Shrine')) autoTrimpSettings[varPrefix + "RunType"].value[x] = setting[x].runType;
	}

	cancelTooltip(true);
	if (reopen) MAZLookalike(titleText, varPrefix, 'MAZ');

	saveSettings();
	document.getElementById('tooltipDiv').style.overflowY = '';
}

function saveATAutoJobsConfig() {
	autoTrimpSettings.rJobSettingsArray.value = {};
	var setting = {};
	var checkboxes = document.getElementsByClassName('autoCheckbox');
	var quantboxes = document.getElementsByClassName('jobConfigQuantity');
	var ratios = ["Farmer", "Lumberjack", "Miner"];
	for (var x = 0; x < checkboxes.length; x++) {
		var name = checkboxes[x].id.split('autoJobCheckbox')[1];
		var checked = checkboxes[x].dataset.checked == 'true';
		if (!setting[name]) setting[name] = {};
		setting[name].enabled = checked;
		if (name === 'NoLumberjacks')
			continue;
		if (name === 'FarmersUntil') {
			setting[name].zone = (quantboxes[x].value);
			continue;
		}
		if (ratios.indexOf(name) != -1) {
			setting[name].ratio = parseFloat(quantboxes[x].value);
			continue;
		}
		setting[name].percent = (document.getElementById('autoJobQuant' + name).value);
	}
	var gatherElem = document.getElementById('autoJobSelfGather');
	if (gatherElem) {
		if (gatherElem.value) setting.portalOption = gatherElem.value;
	}

	autoTrimpSettings.rJobSettingsArray.value = setting;
	cancelTooltip();
	saveSettings();
}

function windowToggleHelp() {
	var mazContainer = document.getElementById('windowContainer');
	var helpContainer = document.getElementById('mazHelpContainer');
	var parentWindow = document.getElementById("tooltipDiv");
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

function saveATAutoStructureConfig() {
	var setting = autoTrimpSettings.rBuildingSettingsArray.value;
	var checkboxes = document.getElementsByClassName('autoCheckbox');
	var percentboxes = document.getElementsByClassName('structConfigPercent');
	var quantboxes = document.getElementsByClassName('structConfigQuantity');
	for (var x = 0; x < checkboxes.length; x++) {
		var name = checkboxes[x].id.split('structConfig')[1];
		var checked = (checkboxes[x].dataset.checked == 'true');
		//if (!checked && !setting[name]) continue;
		if (!setting[name]) setting[name] = {};
		setting[name].enabled = checked;
		if (name === 'SafeGateway') {

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
	}

	var gatherElem = document.getElementById('autoJobSelfGather');
	if (gatherElem) {
		if (gatherElem.value) setting.portalOption = gatherElem.value;
	}

	autoTrimpSettings.rBuildingSettingsArray.value = setting;
	cancelTooltip();
	saveSettings();
}

function saveATDailyAutoPortalConfig() {
	var setting = autoTrimpSettings.rDailyPortalSettingsArray.value;
	var checkboxes = document.getElementsByClassName('autoCheckbox');
	var percentboxes = document.getElementsByClassName('structConfigPercent');
	var portalZoneBox = document.getElementsByClassName('dailyAutoPortalZone')[0];

	var portalZone = parseInt(portalZoneBox.value, 10);
	if (portalZone > 999) portalZone = 999;
	if (portalZone < 0) portalZone = 0;
	portalZone = (Number.isInteger(portalZone)) ? portalZone : 0;
	portalZone = (isNumberBad(portalZone)) ? 0 : portalZone;
	if (!setting.portalZone) setting.portalZone = {};
	setting.portalZone = portalZone;

	var challengeElem = document.getElementById('autoDailyPortalChallenge');
	if (challengeElem) {
		if (challengeElem.value) setting.portalChallenge = challengeElem.value;
		else delete setting.portalChallenge;
	}

	for (var x = 0; x < checkboxes.length; x++) {
		var name = checkboxes[x].id.split('structConfig')[1];
		var checked = (checkboxes[x].dataset.checked == 'true');
		//if (!checked && !setting[name]) continue;
		if (!setting[name]) setting[name] = {};
		setting[name].enabled = checked;

		var zone = parseInt(percentboxes[x].value, 10);
		if (zone > 100) zone = 100;
		zone = (Number.isInteger(zone)) ? zone : 0;
		setting[name].zone = zone;
	}

	autoTrimpSettings.rDailyPortalSettingsArray.value = setting;
	cancelTooltip();
	saveSettings();
}

function addRow(varPrefix, titleText) {
	for (var x = 0; x < 30; x++) {
		var elem = document.getElementById('windowWorld' + x);
		if (!elem) continue;
		if (elem.value == -1) {
			var parent = document.getElementById('windowRow' + x);
			if (parent) {
				parent.style.display = 'block';
				elem.value = game.global.world + 1 < 6 ? 6 : game.global.world + 1;

				if (document.getElementById('windowSpecial' + x) !== null)
					document.getElementById('windowSpecial' + x).value = autoTrimpSettings[varPrefix + 'DefaultSettings'].value.special
				if (!titleText.includes('Smithy') && !titleText.includes('Worshipper Farm') && document.getElementById('windowRepeat' + x) !== null)
					document.getElementById('windowRepeat' + x).value = autoTrimpSettings[varPrefix + 'DefaultSettings'].value.repeat
				if (titleText.includes('Worshipper Farm') && document.getElementById('windowRepeat' + x) !== null)
					document.getElementById('windowRepeat' + x).value = 0;
				if (document.getElementById('windowRaidingZone' + x) !== null)
					document.getElementById('windowRaidingZone' + x).value = autoTrimpSettings[varPrefix + 'DefaultSettings'].value.raidingzone
				if (document.getElementById('windowTributeFarmDropdown' + x) !== null)
					document.getElementById('windowTributeFarmDropdown' + x).value = autoTrimpSettings[varPrefix + 'DefaultSettings'].value.mapType
				if (document.getElementById('windowBoneBelow' + x) !== null)
					document.getElementById('windowBoneBelow' + x).value = autoTrimpSettings[varPrefix + 'DefaultSettings'].value.bonebelow
				if (document.getElementById('windowWorshipper' + x) !== null)
					document.getElementById('windowWorshipper' + x).value = autoTrimpSettings[varPrefix + 'DefaultSettings'].value.worshipper
				if (document.getElementById('windowBoneGather' + x) !== null)
					document.getElementById('windowBoneGather' + x).value = autoTrimpSettings[varPrefix + 'DefaultSettings'].value.gather
				if (document.getElementById('windowBuildings' + x) !== null)
					document.getElementById('windowBuildings' + x).value = true;
				if (document.getElementById('windowAtlantrimp' + x) !== null)
					document.getElementById('windowAtlantrimp' + x).value = false;
				if (document.getElementById('windowAutoLevel' + x) !== null)
					document.getElementById('windowAutoLevel' + x).value = true;
				if (document.getElementById('windowJobRatio' + x) !== null)
					document.getElementById('windowJobRatio' + x).value = autoTrimpSettings[varPrefix + 'DefaultSettings'].value.jobratio
				if (titleText.includes('Map Bonus') && document.getElementById('windowLevel' + x) !== null)
					document.getElementById('windowLevel' + x).value = 0;
				updateWindowPreset(x, varPrefix);
				swapClass('disabled', 'active', parent);
			}
		}

		var elemCell = document.getElementById('windowCell' + x);
		if (!elemCell) continue;
		if (elemCell.value == -1) {
			var parent2 = document.getElementById('windowRow' + x);
			if (parent2) {
				parent2.style.display = 'block';
				elemCell.value = autoTrimpSettings[varPrefix + 'DefaultSettings'].value.cell
				updateWindowPreset(x, varPrefix);
				break;
			}
		}
	}
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
} 2

function removeRow(index, titleText) {
	var elem = document.getElementById('windowRow' + index);
	if (!elem) return;
	document.getElementById('windowWorld' + index).value = -1;
	document.getElementById('windowCell' + index).value = -1;
	if (!titleText.includes('Quag') && !titleText.includes('Bone') && !titleText.includes('Raiding') && !titleText.includes('Void')) document.getElementById('windowLevel' + index).value = 0;
	if (titleText.includes('Time Farm') || titleText.includes('Alch') || titleText.includes('Insanity') || titleText.includes('Map Bonus')) document.getElementById('windowSpecial' + index).value = 0;
	if (titleText.includes('Time Farm') || titleText.includes('Alch') || titleText.includes('Map Bonus') || titleText.includes('Insanity')) document.getElementById('windowGather' + index).value = 0;
	if (titleText.includes('Time Farm') || titleText.includes('Smithy') || titleText.includes('Map Bonus') || titleText.includes('Worshipper Farm')) document.getElementById('windowRepeat' + index).value = 0;
	if (titleText.includes('Worshipper Farm')) document.getElementById('windowEndZone' + index).value = 0;
	if (titleText.includes('Tribute Farm')) document.getElementById('windowTributes' + index).value = 0;
	if (titleText.includes('Tribute Farm')) document.getElementById('windowMets' + index).value = 0;
	if (titleText.includes('Quag')) document.getElementById('windowBogs' + index).value = 0;
	if (titleText.includes('Insanity')) document.getElementById('windowInsanity' + index).value = 0;
	if (titleText.includes('Hypo')) document.getElementById('windowBonfire' + index).value = 0;
	if (titleText.includes('Bone')) document.getElementById('windowBoneAmount' + index).value = 0;
	if (titleText.includes('Bone')) document.getElementById('windowBoneBelow' + index).value = 0;
	if (titleText.includes('Worshipper Farm')) document.getElementById('windowWorshipper' + index).value = 0;
	if (titleText.includes('Void')) document.getElementById('windowVoidMod' + index).value = 0;
	if (titleText.includes('Time Farm') || titleText.includes('Tribute Farm') || titleText.includes('Bone Shrine')) {
		var checkBox = document.getElementById('windowAtlantrimp' + index);
		swapClass("icon-", "icon-checkbox-unchecked", checkBox);
		checkBox.setAttribute('data-checked', false);
	}
	if (titleText.includes('Tribute Farm')) {
		var checkBox = document.getElementById('windowBuildings' + index);
		swapClass("icon-", "icon-checkbox-checked", checkBox);
		checkBox.setAttribute('data-checked', true);
	}
	if (titleText.includes('Time Farm') || titleText.includes('Tribute Farm') || titleText.includes('Smithy Farm') || titleText.includes('Map Bonus') || titleText.includes('Worshipper Farm')) {
		var checkBox = document.getElementById('windowAutoLevel' + index);
		swapClass("icon-", "icon-checkbox-checked", checkBox);
		checkBox.setAttribute('data-checked', false);
	}
	if (!titleText.includes('Raiding') && !titleText.includes('Smithy')) document.getElementById('windowJobRatio' + index).value = 0;
	if (titleText.includes('Bone')) document.getElementById('windowRunType' + index).value = 0;
	if (titleText.includes('Raiding')) document.getElementById('windowRaidingDropdown' + index).value = 0;
	if (titleText.includes('Tribute Farm')) document.getElementById('windowTributeFarmDropdown' + index).value = 'Absolute';
	if (titleText.includes('Bone')) document.getElementById('windowBoneGather' + index).value = 0;

	elem.style.display = 'none';
	var btnElem = document.getElementById('windowAddRowBtn');
	btnElem.style.display = 'inline-block';
	swapClass('active', 'disabled', elem);
}

function updateWindowPreset(index, varPrefix) {
	var varPrefix = !varPrefix ? '' : varPrefix
	if (varPrefix.includes('TimeFarm') || varPrefix.includes('Alch') || varPrefix.includes('MapBonus') || varPrefix.includes('Insanity')) {
		var special = document.getElementById('windowSpecial' + index).value;

		var newClass = (special === 'hc' || special === 'lc') ? "windowBwMainOn" : "windowBwMainOff";
		var row = document.getElementById('windowRow' + index);
		swapClass('windowBwMain', newClass, row);

		newClass = (special === 'hc' || special === 'lc') ? 'windowGatherOn' : 'windowGatherOff';
		swapClass('windowGather', newClass, row);
	}
}

