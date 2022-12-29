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
		tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Auto Job Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'><p>The left side of this window is dedicated to jobs that are limited more by workspaces than resources. 1:1:1 will purchase all 3 of these ratio-based jobs evenly, and the ratio refers to the amount of workspaces you wish to dedicate to each job. You can use any number larger than 0.</p><p><b>Farmers Until:</b> Stops buying Farmers from this zone. The Tribute & Worshipper farm settings override this setting and hire farmers during them.</p><p><b>No Lumberjacks Post MP:</b> Stops buying Lumberjacks after Melting Point has been run. The Smithy Farm setting will override this setting.</p></div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";
		var percentJobs = ["Explorer"];
		if (game.global.universe == 1) percentJobs.push("Trainer");
		if (game.global.universe == 1 && game.global.highestLevelCleared >= 229) percentJobs.push("Magmamancer");
		if (game.global.universe == 2 && game.global.highestRadonLevelCleared > 29) percentJobs.push("Meteorologist");
		if (game.global.universe == 2 && game.global.highestRadonLevelCleared > 49) percentJobs.push("Worshipper");
		var ratioJobs = ["Farmer", "Lumberjack", "Miner"];
		var sciMax = 1;
		var settingGroup = game.global.universe === 1 ? autoTrimpSettings.hJobSettingsArray.value : autoTrimpSettings.rJobSettingsArray.value;
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
	if (event == "AutoStructure") {
		tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Auto Structure Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'><p>Here you can choose which structures will be automatically purchased when AutoStructure is toggled on. Check a box to enable the automatic purchasing of that structure, the 'Perc:' box specifies the cost-to-resource % that the structure should be purchased below, and set the 'Up To:' box to the maximum number of that structure you'd like purchased <b>(0&nbsp;for&nbsp;no&nbsp;limit)</b>. For example, setting the 'Perc:' box to 10 and the 'Up To:' box to 50 for 'House' will cause a House to be automatically purchased whenever the costs of the next house are less than 10% of your Food, Metal, and Wood, as long as you have less than 50 houses.</p><p><b>Safe Gateway:</b> Will stop purchasing Gateways when your owned fragments are lower than the cost of the amount of maps you input in the 'Maps' field times by what a Perfect +10 LMC map would cost up to the zone specified in 'Till Z:', if that values is 0 it'll assume you want them capped forever.</p></div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";

		var count = 0;
		var setting, checkbox;
		var settingGroup = game.global.universe === 1 ? autoTrimpSettings.hBuildingSettingsArray.value : autoTrimpSettings.rBuildingSettingsArray.value;
		for (var item in game.buildings) {
			var building = game.buildings[item];
			if (building.blockU2 && game.global.universe == 2) continue;
			if (building.blockU1 && game.global.universe == 1) continue;
			if (item === 'Warpstation') continue;
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
	if (event == "UniqueMaps" || event === "rUniqueMaps") {
		tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AT's Unique Map Settings! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'>\
		<p>Here you can choose which special maps you'd like to run throughout your runs. Each special map will have a Zone & Cell box to identify where you would like to run the map on the specified zone. If the map isn't run on your specified zone it will be run on any zone after the one you input.\
		</p><p>The MP Smithy settings will run the Melting Point map once you've reached the value of Smithies in this setting. Each run type has it's own setting and the daily shred setting will override the regular daily setting if either wood or metal shred is active.\
		</p></div><table id='autoPurchaseConfigTable' style='font-size: 1.1vw;'><tbody>";

		var count = 0;
		var setting, checkbox;
		//var settingGroup = false;
		var settingGroup = event === 'rUniqueMaps' ? autoTrimpSettings.rUniqueMapSettingsArray.value : autoTrimpSettings.hUniqueMapSettingsArray.value;

		var smithySettings = [];


		if (event === 'UniqueMaps') {
			var mapUnlocks = [
				'The_Block', 'The_Wall', 'Dimension_of_Anger'
			]
			if (game.global.highestLevelCleared > 32) mapUnlocks.push("Trimple_of_Doom");
			if (game.global.highestLevelCleared > 79) mapUnlocks.push("The_Prison");
			if (game.global.highestLevelCleared > 169) mapUnlocks.push("Imploding_Star");
		}

		if (event === 'rUniqueMaps') {
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
			if (game.global.highestRadonLevelCleared > 49) smithySettings.push("MP_Smithy_Daily_Shred");
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

		/* tooltipText += "<td><div class='row'>"
		tooltipText += "<div class='col-xs-6' style='width: 50%; padding-right: 5px'>" + "" + "&nbsp;&nbsp;<span>" + "Portal Zone:" + "</span></div>"
		tooltipText += "<div class='col-xs-6' style='width: 50%; text-align: right;'> <input class='dailyAutoPortalZone' 'id='portalZone ' type='number'  value='" + ((settingGroup && settingGroup.portalZone) ? settingGroup.portalZone : 0) + "'/></div></div></td>";

		tooltipText += "<td><div class='row'>"
		tooltipText += "<div class='col-xs-3' style='width: 40%; padding-right: 5px'>" + "" + "&nbsp;&nbsp;<span>" + "Portal Challenge:</span></div>"
		tooltipText += "<div class='col-xs-5' style='width: 60%; text-align: right'><select class ='dailyAutoPortalChallenge' id='autoDailyPortalChallenge'><option value='None'>None</option>"; */

		//Identifying which challenges the user can run
		/* var highestZone = game.global.highestRadonLevelCleared;
		var radonChallenges = [];
		if (getPageSetting('rDisplayAllSettings') || highestZone >= 39) radonChallenges.push("Bublé");
		if (getPageSetting('rDisplayAllSettings') || highestZone >= 54) radonChallenges.push("Melt");
		if (getPageSetting('rDisplayAllSettings') || highestZone >= 69) radonChallenges.push("Quagmire");
		if (getPageSetting('rDisplayAllSettings') || highestZone >= 89) radonChallenges.push("Archaeology");
		if (getPageSetting('rDisplayAllSettings') || highestZone >= 99) radonChallenges.push("Mayhem");
		if (getPageSetting('rDisplayAllSettings') || highestZone >= 109) radonChallenges.push("Insanity");
		if (getPageSetting('rDisplayAllSettings') || highestZone >= 134) radonChallenges.push("Nurture");
		if (getPageSetting('rDisplayAllSettings') || highestZone >= 149) radonChallenges.push("Pandemonium");
		if (getPageSetting('rDisplayAllSettings') || highestZone >= 154) radonChallenges.push("Alchemy");
		if (getPageSetting('rDisplayAllSettings') || highestZone >= 174) radonChallenges.push("Hypothermia");

		for (var x = 0; x < radonChallenges.length; x++) {
			tooltipText += "<option" + ((settingGroup.portalChallenge && settingGroup.portalChallenge == radonChallenges[x]) ? " selected='selected'" : "") + " value='" + radonChallenges[x] + "'>" + radonChallenges[x] + "</option>";
		}
		tooltipText += "</select></div></div></td></tr>";
		tooltipText += "</div></div>" */

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

	//Farming Settings
	if (event == 'MAZ') {

		let mapFarm = titleText.includes('Map Farm');
		let mapBonus = titleText.includes('Map Bonus');
		let voidMap = titleText.includes('Void Map');
		let hdFarm = titleText.includes('HD Farm');
		let raiding = titleText.includes('Raiding');
		let bionic = titleText.includes('Bionic');
		let quagmire = titleText.includes('Quagmire');
		let insanity = titleText.includes('Insanity Farm');
		let alchemy = titleText.includes('Alchemy Farm');
		let hypothermia = titleText.includes('Hypothermia Farm');
		let boneShrine = titleText.includes('Bone Shrine');
		let golden = titleText.includes('Golden');
		let tributeFarm = titleText.includes('Tribute Farm');
		let smithyFarm = titleText.includes('Smithy Farm');
		let worshipperFarm = titleText.includes('Worshipper Farm');

		var universe = varPrefix[0] === 'h' ? 1 : 2;
		var varPrefix_Adjusted = varPrefix.slice(1);
		var trimple = varPrefix[0] === 'h' ? 'Trimple' : 'Atlantrimp';
		var windowSize = 'tooltipWindow50';
		if (golden) windowSize = 'tooltipWindow20'
		if (quagmire) windowSize = 'tooltipWindow25'
		if (raiding) windowSize = 'tooltipWindow35'
		if (bionic) windowSize = 'tooltipWindow35'
		if (hypothermia) windowSize = 'tooltipWindow30'
		if (insanity) windowSize = 'tooltipWindow40'
		if (voidMap) windowSize = 'tooltipWindow50'
		if (worshipperFarm) windowSize = 'tooltipWindow50'
		if (smithyFarm) windowSize = 'tooltipWindow50'
		if (hdFarm) windowSize = 'tooltipWindow55'
		if (mapBonus) windowSize = 'tooltipWindow60'
		if (mapFarm) windowSize = 'tooltipWindow75'
		if (tributeFarm) windowSize = 'tooltipWindow80'

		var maxSettings = 30;

		//Setting up the Help onclick setting.
		var mazHelp = mazPopulateHelpWindow(titleText, varPrefix, trimple);

		tooltipText = "";
		//Setting up default values section
		if (!golden) {
			//Header
			tooltipText += "\
				<div id = 'windowContainer' style = 'display: block' > <div id='windowError'></div>\
				<div class='row windowRow'>Default Values</div>\
				<div class='row windowRow titles'>\
				<div class='windowActive" + varPrefix_Adjusted + "\'>Active</div>\
				<div class='windowCell" + varPrefix_Adjusted + "\'>Cell</div>"
			if (mapFarm) tooltipText += "<div class='windowRepeat'>Repeat<br />Count</div>"
			if (worshipperFarm) tooltipText += "<div class='windowWorshipper'>Skip<br />Value</div>"
			if (mapBonus) tooltipText += "<div class='windowRepeat'>Map<br />Stacks</div>"
			if (boneShrine) tooltipText += "<div class='windowBoneBelow'>Use below</div>"
			if (worshipperFarm) tooltipText += "<div class='windowWorshipper'>Ships</div>"
			if (!raiding && !smithyFarm && !hdFarm) tooltipText += "<div class='windowJobRatio" + varPrefix_Adjusted + "\'>Job<br />Ratio</div>"
			if (boneShrine) tooltipText += "<div class='windowBoneGather'>Gather</div>"
			if (mapFarm || alchemy || mapBonus || insanity) tooltipText += "<div class='windowSpecial" + varPrefix_Adjusted + "\'>Special</div>"
			if (tributeFarm || smithyFarm) tooltipText += "<div class='windowMapTypeDropdown" + varPrefix_Adjusted + "\'>Farm Type</div>"
			if (raiding && !bionic) tooltipText += "<div class='windowRecycle'>Recycle</div>"
			if (alchemy) tooltipText += "<div class='windowStorage'>Void<br>Purchase</div>"
			if (hypothermia) tooltipText += "<div class='windowFrozenCastle'>Frozen<br>Castle</div>"
			if (hypothermia) tooltipText += "<div class='windowStorage'>Auto<br>Storage</div>"
			if (hypothermia) tooltipText += "<div class='windowPackrat'>Packrat</div>"
			if (mapBonus) tooltipText += "<div class='windowJobRatio" + varPrefix_Adjusted + "\'>Health<br>Bonus</div>"
			if (mapBonus) tooltipText += "<div class='windowJobRatio" + varPrefix_Adjusted + "\'>Health<br>HD Ratio</div>"
			if (hdFarm) tooltipText += "<div class='windowCell" + varPrefix_Adjusted + "\'>Map<br>Cap</div>"
			if (varPrefix[0] === 'r' && (mapFarm || hdFarm)) tooltipText += "<div class='windowCell" + varPrefix_Adjusted + "\'>Shred<br>Map Cap</div>"

			tooltipText += "</div>";

			var defaultVals = {
				active: true,
				cell: 1,
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
				mapType: 'Absolute',
				healthBonus: 10,
				healthHDRatio: 10,
				recycle: false,
				voidPurchase: true,
				mapCap: 900,
				shredMapCap: 100
			}
			var style = "";

			//Reading info from each setting
			defaultVals.active = typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.active) === 'undefined' ? false : autoTrimpSettings[varPrefix + "DefaultSettings"].value.active ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.active : false;
			defaultVals.cell = typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.cell) === 'undefined' ? 1 : autoTrimpSettings[varPrefix + "DefaultSettings"].value.cell ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.cell : 81;
			if (boneShrine)
				defaultVals.bonebelow = autoTrimpSettings[varPrefix + "DefaultSettings"].value.bonebelow ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.bonebelow : 1;
			if (boneShrine)
				defaultVals.worshipper = autoTrimpSettings[varPrefix + "DefaultSettings"].value.worshipper ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.worshipper : 50;
			if (!raiding && !smithyFarm && !hdFarm)
				defaultVals.jobratio = typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.jobratio) === 'undefined' ? '1,1,1,1' : autoTrimpSettings[varPrefix + "DefaultSettings"].value.jobratio ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.jobratio : '1,1,1,1';
			if (mapFarm || alchemy || boneShrine || mapBonus)
				defaultVals.gather = autoTrimpSettings[varPrefix + "DefaultSettings"].value.gather ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.gather : '0';
			if (mapFarm || alchemy || mapBonus || insanity)
				defaultVals.special = autoTrimpSettings[varPrefix + "DefaultSettings"].value.special ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.special : '0';
			if (mapFarm || mapBonus) defaultVals.repeat = autoTrimpSettings[varPrefix + "DefaultSettings"].value.repeat ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.repeat : '0';
			if (worshipperFarm)
				defaultVals.shipskip = autoTrimpSettings[varPrefix + "DefaultSettings"].value.shipskip ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.shipskip : '10';
			if (alchemy)
				defaultVals.voidPurchase = typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.voidPurchase) === 'undefined' ? true : autoTrimpSettings[varPrefix + "DefaultSettings"].value.voidPurchase ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.voidPurchase : false;
			if (hypothermia)
				defaultVals.frozencastle = typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.frozencastle) === 'undefined' ? [200, 99] : autoTrimpSettings[varPrefix + "DefaultSettings"].value.frozencastle ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.frozencastle : [200, 99];
			if (hypothermia)
				defaultVals.autostorage = typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.autostorage) === 'undefined' ? false : autoTrimpSettings[varPrefix + "DefaultSettings"].value.autostorage ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.autostorage : false;
			if (hypothermia)
				defaultVals.packrat = typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.packrat) === 'undefined' ? false : autoTrimpSettings[varPrefix + "DefaultSettings"].value.packrat ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.packrat : false;
			if (tributeFarm || smithyFarm)
				defaultVals.mapType = typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.mapType) === 'undefined' ? 'Absolute' : autoTrimpSettings[varPrefix + "DefaultSettings"].value.mapType ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.mapType : 'Absolute';
			if (raiding && !bionic)
				defaultVals.recycle = typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.recycle) === 'undefined' ? false : autoTrimpSettings[varPrefix + "DefaultSettings"].value.recycle ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.recycle : false;
			if (mapBonus)
				defaultVals.healthBonus = autoTrimpSettings[varPrefix + "DefaultSettings"].value.healthBonus ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.healthBonus : 10;
			if (mapBonus)
				defaultVals.healthHDRatio = autoTrimpSettings[varPrefix + "DefaultSettings"].value.healthHDRatio ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.healthHDRatio : 10;
			if (hdFarm)
				defaultVals.mapCap = typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.mapCap) === 'undefined' ? 900 : autoTrimpSettings[varPrefix + "DefaultSettings"].value.mapCap ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.mapCap : 900;
			if (varPrefix[0] === 'r' && (mapFarm || hdFarm))
				defaultVals.shredMapCap = typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.shredMapCap) === 'undefined' ? 100 : autoTrimpSettings[varPrefix + "DefaultSettings"].value.shredMapCap ? autoTrimpSettings[varPrefix + "DefaultSettings"].value.shredMapCap : 100;

			var defaultGatherDropdown = "<option value='food'" + ((defaultVals.gather == 'food') ? " selected='selected'" : "") + ">Food</option>\<option value='wood'" + ((defaultVals.gather == 'wood') ? " selected='selected'" : "") + ">Wood</option>\<option value='metal'" + ((defaultVals.gather == 'metal') ? " selected='selected'" : "") + ">Metal</option>\<option value='science'" + ((defaultVals.gather == 'science') ? " selected='selected'" : "") + ">Science</option>"
			var defaultSpecialsDropdown = "<option value='0'" + ((defaultVals.special == '0') ? " selected='selected'" : "") + ">No Modifier</option>\<option value='fa'" + ((defaultVals.special == 'fa') ? " selected='selected'" : "") + ">Fast Attack</option>\<option value='lc'" + ((defaultVals.special == 'lc') ? " selected='selected'" : "") + ">Large Cache</option>\<option value='ssc'" + ((defaultVals.special == 'ssc') ? " selected='selected'" : "") + ">Small Savory Cache</option>\<option value='swc'" + ((defaultVals.special == 'swc') ? " selected='selected'" : "") + ">Small Wooden Cache</option>\<option value='smc'" + ((defaultVals.special == 'smc') ? " selected='selected'" : "") + ">Small Metal Cache</option>\<option value='src'" + ((defaultVals.special == 'src') ? " selected='selected'" : "") + ">Small Resource Cache</option>\<option value='p'" + ((defaultVals.special == 'p') ? " selected='selected'" : "") + ">Prestigious</option>\<option value='hc'" + ((defaultVals.special == 'hc') ? " selected='selected'" : "") + ">Huge Cache</option>\<option value='lsc'" + ((defaultVals.special == 'lsc') ? " selected='selected'" : "") + ">Large Savory Cache</option>\<option value='lwc'" + ((defaultVals.special == 'lwc') ? " selected='selected'" : "") + ">Large Wooden Cache</option>\<option value='lmc'" + ((defaultVals.special == 'lmc') ? " selected='selected'" : "") + ">Large Metal Cache</option>\<option value='lrc'" + ((defaultVals.special == 'lrc') ? " selected='selected'" : "") + ">Large Research Cache</option>"
			var defaultmapTypeDropdown = "<option value='Absolute'" + ((defaultVals.mapType == 'Absolute') ? " selected='selected'" : "") + ">Absolute</option>\<option value='Map Count'" + ((defaultVals.mapType === 'Map Count') ? " selected='selected'" : "") + ">Map Count</option>"
			tooltipText += "<div id='windowRow' class='row windowRow'>";
			tooltipText += "<div class='windowActive" + varPrefix_Adjusted + "\' style='text-align: center;'>" + buildNiceCheckbox("windowActiveDefault", null, defaultVals.active) + "</div>";
			tooltipText += "<div class='windowCell" + varPrefix_Adjusted + "\'><input value='" + defaultVals.cell + "' type='number' id='windowCellDefault'/></div>";
			if (mapFarm || mapBonus)
				tooltipText += "<div class='windowRepeat'><input value='" + defaultVals.repeat + "' type='number' id='windowRepeatDefault'/></div>";
			if (worshipperFarm)
				tooltipText += "<div class='windowWorshipper'><input value='" + defaultVals.shipskip + "' type='number' id='windowRepeatDefault'/></div>";
			if (boneShrine)
				tooltipText += "<div class='windowBoneBelow'><input value='" + defaultVals.bonebelow + "' type='number' id='windowBoneBelowDefault'/></div>";
			if (worshipperFarm)
				tooltipText += "<div class='windowWorshipper'><input value='" + defaultVals.worshipper + "' type='number' id='windowWorshipperDefault'/></div>";
			if (!raiding && !smithyFarm && !hdFarm)
				tooltipText += "<div class='windowJobRatio" + varPrefix_Adjusted + "\'><input value='" + defaultVals.jobratio + "' type='text' id='windowJobRatioDefault'/></div>";
			if (boneShrine)
				tooltipText += "<div class='windowBoneGather'><select value='" + defaultVals.gather + "' id='windowBoneGatherDefault'>" + defaultGatherDropdown + "</select></div>"
			if (mapFarm || alchemy || mapBonus || insanity)
				tooltipText += "<div class='windowSpecial" + varPrefix_Adjusted + "\'><select value='" + defaultVals.special + "' id='windowSpecialDefault'>" + defaultSpecialsDropdown + "</select></div>"
			if (hypothermia)
				tooltipText += "<div class='windowFrozenCastle'><input value='" + defaultVals.frozencastle + "' type='text' id='windowFrozenCastleDefault'/></div>";
			if (hypothermia)
				tooltipText += "<div class='windowStorage' style='text-align: center;'>" + buildNiceCheckbox("windowStorageDefault", null, defaultVals.autostorage) + "</div>";
			if (hypothermia)
				tooltipText += "<div class='windowPackrat' style='text-align: center;'>" + buildNiceCheckbox("windowPackratDefault", null, defaultVals.packrat) + "</div>";
			if (tributeFarm || smithyFarm)
				tooltipText += "<div class='windowMapTypeDropdown" + varPrefix_Adjusted + "\'><select value='" + defaultVals.mapType + "' id='windowMapTypeDropdownDefault'>" + defaultmapTypeDropdown + "</select></div>"
			if (mapBonus)
				tooltipText += "<div class='windowJobRatio" + varPrefix_Adjusted + "\'><input value='" + defaultVals.healthBonus + "' type='number' id='healthBonus'/></div>";
			if (mapBonus)
				tooltipText += "<div class='windowJobRatio" + varPrefix_Adjusted + "\'><input value='" + defaultVals.healthHDRatio + "' type='number' id='healthHDRatio'/></div>";
			if (raiding && !bionic)
				tooltipText += "<div class='windowRecycle' style='text-align: center;'>" + buildNiceCheckbox("windowRecycleDefault", null, defaultVals.recycle) + "</div>";
			if (alchemy)
				tooltipText += "<div class='windowStorage' style='text-align: center;'>" + buildNiceCheckbox("windowVoidPurchase", null, defaultVals.voidPurchase) + "</div>";
			if (hdFarm)
				tooltipText += "<div class='windowCell" + varPrefix_Adjusted + "\'><input value='" + defaultVals.mapCap + "' type='number' id='mapCap'/></div>";
			if (varPrefix[0] === 'r' && (mapFarm || hdFarm))
				tooltipText += "<div class='windowCell" + varPrefix_Adjusted + "\'><input value='" + defaultVals.shredMapCap + "' type='number' id='shredMapCap'/></div>";

			tooltipText += "</div>"

		}

		//Setting up rows for each setting
		tooltipText += "\
		<div id='windowContainer' style='display: block'><div id='windowError'></div>\
		<div class='row windowRow titles'>"
		if (!golden) tooltipText += "<div class='windowActive" + varPrefix_Adjusted + "\'>Active?</div>"
		if (golden) tooltipText += "<div class='windowActiveAutoGolden'>Active?</div>"
		if (!voidMap && !golden) tooltipText += "<div class='windowWorld" + varPrefix_Adjusted + "\'>Zone</div>"
		if (golden) tooltipText += "<div class='windowAmtAutoGolden'>Amount</div>"
		if (voidMap) tooltipText += "<div class='windowWorld" + varPrefix_Adjusted + "\'>Min Zone</div>"
		if (voidMap) tooltipText += "<div class='windowMaxVoidZone'>Max Zone</div>"
		if (raiding) tooltipText += "<div class='windowRaidingZone" + varPrefix_Adjusted + "\'>Raiding<br/>Zone</div>"
		if (!golden) tooltipText += "<div class='windowCell" + varPrefix_Adjusted + "\'>Cell</div>"
		if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || hdFarm) tooltipText += "<div class='windowAutoLevel" + varPrefix_Adjusted + "\'>Auto<br/>Level</div>"
		if (!quagmire && !boneShrine && !raiding && !voidMap && !golden) tooltipText += "<div class='windowLevel" + varPrefix_Adjusted + "\'>Map<br/>Level</div>"
		if (tributeFarm || smithyFarm) tooltipText += "<div class='windowMapTypeDropdown" + varPrefix_Adjusted + "\'>Farm Type</div>"
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
		if (mapFarm || tributeFarm || worshipperFarm || bionic) tooltipText += "<div class='windowRepeatEvery" + varPrefix_Adjusted + "\'>Repeat<br/>Every</div>"
		if (mapFarm || tributeFarm || worshipperFarm || hdFarm) tooltipText += "<div class='windowEndZone" + varPrefix_Adjusted + "\'>End<br/>Zone</div>"
		if (hdFarm) tooltipText += "<div class='windowHDType'>HD<br/>Type</div>"
		if (voidMap) tooltipText += "<div class='windowVoidHDRatio'>HD<br/>Ratio</div>"
		if (voidMap) tooltipText += "<div class='windowVoidHDRatio'>Void HD<br/>Ratio</div>"
		if (!raiding && !smithyFarm && !hdFarm && !golden) tooltipText += "<div class='windowJobRatio" + varPrefix_Adjusted + "\'>Job<br/>Ratio</div>"
		if (tributeFarm) tooltipText += "<div class='windowBuildings'>Buy<br/>Buildings</div>"
		if (boneShrine) tooltipText += "<div class='windowBoneGather'>Gather</div>"
		if (mapFarm || alchemy || mapBonus || insanity) tooltipText += "<div class='windowSpecial" + varPrefix_Adjusted + "\'>Special</div>"
		if (raiding && !bionic) tooltipText += "<div class='windowRaidingDropdown'>Frag Type</div>"
		if (mapFarm || tributeFarm || boneShrine) tooltipText += "<div class='windowAtlantrimp'>Run<br/>" + trimple + "</div>"
		if (smithyFarm) tooltipText += "<div class='windowMeltingPoint'>Run<br/>MP</div>"
		if (insanity) tooltipText += "<div class='windowBuildings'>Destack</div>"
		if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding) tooltipText += "<div class='windowRunType" + varPrefix_Adjusted + "\'>Run<br/>Type</div>"
		if (voidMap) tooltipText += "<div class='windowPortalAfter'>Portal<br/>After</div>"
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
				shredActive: 'All',
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
				vals.active = autoTrimpSettings[varPrefix + "Settings"].value[x].active;
				vals.world = autoTrimpSettings[varPrefix + "Settings"].value[x].world;
				if (voidMap)
					vals.maxvoidzone = autoTrimpSettings[varPrefix + "Settings"].value[x].maxvoidzone ? autoTrimpSettings[varPrefix + "Settings"].value[x].maxvoidzone : 1;
				if (raiding)
					vals.raidingzone = autoTrimpSettings[varPrefix + "Settings"].value[x].raidingzone ? autoTrimpSettings[varPrefix + "Settings"].value[x].raidingzone : 1;
				vals.cell = autoTrimpSettings[varPrefix + "Settings"].value[x].cell ? autoTrimpSettings[varPrefix + "Settings"].value[x].cell : 81;
				if (!quagmire && !boneShrine && !raiding && !voidMap)
					vals.level = autoTrimpSettings[varPrefix + "Settings"].value[x].level
				if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || hdFarm)
					vals.autoLevel = typeof (autoTrimpSettings[varPrefix + "Settings"].value[x].autoLevel) !== 'undefined' ? autoTrimpSettings[varPrefix + "Settings"].value[x].autoLevel : true;
				if (tributeFarm || smithyFarm)
					vals.mapType = autoTrimpSettings[varPrefix + "Settings"].value[x].mapType ? autoTrimpSettings[varPrefix + "Settings"].value[x].mapType : 'Absolute';
				if (mapFarm || smithyFarm || mapBonus)
					vals.repeat = autoTrimpSettings[varPrefix + "Settings"].value[x].repeat ? autoTrimpSettings[varPrefix + "Settings"].value[x].repeat : 1;
				if (mapFarm || tributeFarm || worshipperFarm || bionic)
					vals.repeatevery = autoTrimpSettings[varPrefix + "Settings"].value[x].repeatevery ? autoTrimpSettings[varPrefix + "Settings"].value[x].repeatevery : 0;
				if (mapFarm || tributeFarm || worshipperFarm || hdFarm)
					vals.endzone = autoTrimpSettings[varPrefix + "Settings"].value[x].endzone ? autoTrimpSettings[varPrefix + "Settings"].value[x].endzone : 999;
				if (tributeFarm)
					vals.tributes = autoTrimpSettings[varPrefix + "Settings"].value[x].tributes ? autoTrimpSettings[varPrefix + "Settings"].value[x].tributes : 0;
				if (tributeFarm)
					vals.mets = autoTrimpSettings[varPrefix + "Settings"].value[x].mets ? autoTrimpSettings[varPrefix + "Settings"].value[x].mets : 0;
				if (tributeFarm)
					vals.buildings = typeof (autoTrimpSettings[varPrefix + "Settings"].value[x].buildings) !== 'undefined' ? autoTrimpSettings[varPrefix + "Settings"].value[x].buildings : true;
				if (mapFarm || tributeFarm || boneShrine)
					vals.atlantrimp = typeof (autoTrimpSettings[varPrefix + "Settings"].value[x].atlantrimp) !== 'undefined' ? autoTrimpSettings[varPrefix + "Settings"].value[x].atlantrimp : false;
				if (smithyFarm)
					vals.meltingPoint = typeof (autoTrimpSettings[varPrefix + "Settings"].value[x].meltingPoint) !== 'undefined' ? autoTrimpSettings[varPrefix + "Settings"].value[x].meltingPoint : false;
				if (voidMap)
					vals.portalAfter = typeof (autoTrimpSettings[varPrefix + "Settings"].value[x].portalAfter) !== 'undefined' ? autoTrimpSettings[varPrefix + "Settings"].value[x].portalAfter : false;
				if (quagmire)
					vals.bogs = autoTrimpSettings[varPrefix + "Settings"].value[x].bogs ? autoTrimpSettings[varPrefix + "Settings"].value[x].bogs : 0;
				if (insanity)
					vals.insanity = autoTrimpSettings[varPrefix + "Settings"].value[x].insanity ? autoTrimpSettings[varPrefix + "Settings"].value[x].insanity : 0;
				if (golden)
					vals.goldenType = typeof (autoTrimpSettings[varPrefix + "Settings"].value[x].golden) !== 'undefined' ? autoTrimpSettings[varPrefix + "Settings"].value[x].golden[0] : 0;
				if (hdFarm)
					vals.hdType = typeof (autoTrimpSettings[varPrefix + "Settings"].value[x].hdType) !== 'undefined' ? autoTrimpSettings[varPrefix + "Settings"].value[x].hdType : 'world';
				if (golden)
					vals.goldenNumber = typeof (autoTrimpSettings[varPrefix + "Settings"].value[x].golden) !== 'undefined' ? autoTrimpSettings[varPrefix + "Settings"].value[x].golden.toString().replace(/[^\d,:-]/g, '') : 'v';
				if (alchemy)
					vals.potionstype = autoTrimpSettings[varPrefix + "Settings"].value[x].potion[0] ? autoTrimpSettings[varPrefix + "Settings"].value[x].potion[0] : 0;
				if (alchemy)
					vals.potionsnumber = autoTrimpSettings[varPrefix + "Settings"].value[x].potion.toString().replace(/[^\d,:-]/g, '') ? autoTrimpSettings[varPrefix + "Settings"].value[x].potion.toString().replace(/[^\d,:-]/g, '') : 0;
				if (hypothermia)
					vals.bonfires = autoTrimpSettings[varPrefix + "Settings"].value[x].bonfire ? autoTrimpSettings[varPrefix + "Settings"].value[x].bonfire : 0;
				if (mapFarm || alchemy || mapBonus || insanity)
					vals.special = autoTrimpSettings[varPrefix + "Settings"].value[x].special ? autoTrimpSettings[varPrefix + "Settings"].value[x].special : -1;
				if (boneShrine)
					vals.boneamount = autoTrimpSettings[varPrefix + "Settings"].value[x].boneamount ? autoTrimpSettings[varPrefix + "Settings"].value[x].boneamount : 0;
				if (boneShrine)
					vals.bonebelow = autoTrimpSettings[varPrefix + "Settings"].value[x].bonebelow ? autoTrimpSettings[varPrefix + "Settings"].value[x].bonebelow : 0;
				if (worshipperFarm)
					vals.worshipper = autoTrimpSettings[varPrefix + "Settings"].value[x].worshipper ? autoTrimpSettings[varPrefix + "Settings"].value[x].worshipper : 50;
				if (voidMap)
					vals.hdRatio = autoTrimpSettings[varPrefix + "Settings"].value[x].hdRatio ? autoTrimpSettings[varPrefix + "Settings"].value[x].hdRatio : 0;
				if (voidMap)
					vals.voidHDRatio = autoTrimpSettings[varPrefix + "Settings"].value[x].voidHDRatio ? autoTrimpSettings[varPrefix + "Settings"].value[x].voidHDRatio : 0;
				if (!raiding && !smithyFarm && !hdFarm)
					vals.jobratio = autoTrimpSettings[varPrefix + "Settings"].value[x].jobratio ? autoTrimpSettings[varPrefix + "Settings"].value[x].jobratio : '1,1,1,1';
				if (mapFarm || alchemy || boneShrine || mapBonus)
					vals.gather = autoTrimpSettings[varPrefix + "Settings"].value[x].gather ? autoTrimpSettings[varPrefix + "Settings"].value[x].gather : '0';
				if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding)
					vals.runType = autoTrimpSettings[varPrefix + "Settings"].value[x].runType ? autoTrimpSettings[varPrefix + "Settings"].value[x].runType : 'All';
				if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding)
					vals.challenge = autoTrimpSettings[varPrefix + "Settings"].value[x].challenge ? autoTrimpSettings[varPrefix + "Settings"].value[x].challenge : 'All';
				if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding)
					vals.challenge3 = autoTrimpSettings[varPrefix + "Settings"].value[x].challenge3 ? autoTrimpSettings[varPrefix + "Settings"].value[x].challenge3 : 'All';
				if (raiding && !bionic)
					vals.raidingDropdown = autoTrimpSettings[varPrefix + "Settings"].value[x].raidingDropdown ? autoTrimpSettings[varPrefix + "Settings"].value[x].raidingDropdown : 1;
				if (insanity)
					vals.destack = typeof (autoTrimpSettings[varPrefix + "Settings"].value[x].destack) !== 'undefined' ? autoTrimpSettings[varPrefix + "Settings"].value[x].destack : false;
				if (varPrefix[0] === 'r' && boneShrine)
					vals.shredActive = typeof (autoTrimpSettings[varPrefix + "Settings"].value[x].shredActive) !== 'undefined' ? autoTrimpSettings[varPrefix + "Settings"].value[x].shredActive : 'All';
				if (hdFarm)
					vals.hdBase = autoTrimpSettings[varPrefix + "Settings"].value[x].hdBase ? autoTrimpSettings[varPrefix + "Settings"].value[x].hdBase : 1;
				if (hdFarm)
					vals.hdMult = autoTrimpSettings[varPrefix + "Settings"].value[x].hdMult ? autoTrimpSettings[varPrefix + "Settings"].value[x].hdMult : 1;
			}

			else style = " style='display: none' ";

			var backgroundStyle = "";
			if (varPrefix[0] === 'h') {
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
			//RunType
			var runTypeDropdown = displayDropdowns(universe, 'runType', vals.runType);
			//RunType
			var goldenDropdown = displayDropdowns(universe, 'goldenType', vals.goldenType, varPrefix);
			//RunType
			var hdTypeDropdown = displayDropdowns(universe, 'hdType', vals.hdType, varPrefix);

			var potionDropdown = "<option value='h'" + ((vals.potionstype == 'h') ? " selected='selected'" : "") + ">Herby Brew</option>\<option value='g'" + ((vals.potionstype == 'g') ? " selected='selected'" : "") + ">Gaseous Brew</option>\<option value='f'" + ((vals.potionstype == 'f') ? " selected='selected'" : "") + ">Potion of Finding</option>\<option value='v'" + ((vals.potionstype == 'v') ? " selected='selected'" : "") + ">Potion of the Void</option>\<option value='s'" + ((vals.potionstype == 's') ? " selected='selected'" : "") + ">Potion of Strength</option>"
			var raidingDropdown = "<option value='0'" + ((vals.raidingDropdown == '0') ? " selected='selected'" : "") + ">Frag</option>\<option value='1'" + ((vals.raidingDropdown == '1') ? " selected='selected'" : "") + ">Frag Min</option>\<option value='2'" + ((vals.raidingDropdown == '2') ? " selected='selected'" : "") + ">Frag Max</option>"
			var mapTypeDropdown = "<option value='Absolute'" + ((vals.mapType == 'Absolute') ? " selected='selected'" : "") + ">Absolute</option>\<option value='Map Count'" + ((vals.mapType == 'Map Count') ? " selected='selected'" : "") + ">Map Count</option>\</option>"
			var shredDropdown = "<option value='All'" + ((vals.shredActive == 'All') ? " selected='selected'" : "") + ">All</option>\<option value='Shred'" + ((vals.shredActive == 'Shred') ? " selected='selected'" : "") + ">Shred</option>\<option value='No Shred'" + ((vals.shredActive == 'No Shred') ? " selected='selected'" : "") + ">No Shred</option>\</option>"

			var className = (vals.special == 'hc' || vals.special === 'lc') ? " windowGatherOn" : " windowGatherOff";
			className += (!vals.autoLevel) ? " windowLevelOn" : " windowLevelOff";
			if (varPrefix[0] === 'r' && boneShrine) className += (vals.runType === 'Daily' || vals.runType === 'All') ? " windowShredOn" : " windowShredOff";
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding)
				className += (vals.runType === 'C3') ?
					" windowChallenge3On" + varPrefix_Adjusted + "" : " windowChallenge3Off" + varPrefix_Adjusted + "";
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding)
				className += (vals.runType === 'Filler') ?
					" windowChallengeOn" + varPrefix_Adjusted + "" : " windowChallengeOff" + varPrefix_Adjusted + "";
			className += (x <= current.length - 1) ? " active" : "  disabled";
			tooltipText += "<div id='windowRow" + x + "' class='row windowRow " + className + "'" + style + ">";
			if (!golden) tooltipText += "<div class='windowDelete" + varPrefix_Adjusted + "\' onclick='removeRow(\"" + x + "\",\"" + titleText + "\", true)'><span class='icomoon icon-cross'></span></div>";
			if (!golden) tooltipText += "<div class='windowActive" + varPrefix_Adjusted + "\' style='text-align: center;'>" + buildNiceCheckbox("windowActive" + x, null, vals.active) + "</div>";

			if (golden) tooltipText += "<div class='windowDeleteAutoGolden' onclick='removeRow(\"" + x + "\",\"" + titleText + "\", true)'><span class='icomoon icon-cross'></span></div>";
			if (golden) tooltipText += "<div class='windowActiveAutoGolden' style='text-align: center;'>" + buildNiceCheckbox("windowActive" + x, null, vals.active) + "</div>";

			if (!golden)
				tooltipText += "<div class='windowWorld" + varPrefix_Adjusted + "\' style = " + backgroundStyle + "\' oninput='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><input value='" + vals.world + "' type='number' id='windowWorld" + x + "'/></div>";

			if (voidMap)
				tooltipText += "<div class='windowMaxVoidZone'><input value='" + vals.maxvoidzone + "' type='number' id='windowMaxVoidZone" + x + "'/></div>";
			if (raiding)
				tooltipText += "<div class='windowRaidingZone" + varPrefix_Adjusted + "\'><input value='" + vals.raidingzone + "' type='number' id='windowRaidingZone" + x + "'/></div>";
			if (!golden)
				tooltipText += "<div class='windowCell" + varPrefix_Adjusted + "\'><input value='" + vals.cell + "' type='number' id='windowCell" + x + "'/></div>";
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || hdFarm)
				tooltipText += "<div class='windowAutoLevel" + varPrefix_Adjusted + "\' style='text-align: center; padding-left: 5px;'>" + buildNiceCheckboxAutoLevel("windowAutoLevel" + x, null, vals.autoLevel, x, varPrefix) + "</div>";
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || insanity || alchemy || hypothermia || hdFarm)
				tooltipText += "<div class='windowLevel" + varPrefix_Adjusted + "\'><input value='" + vals.level + "' type='number' id='windowLevel" + x + "'/></div>";
			if (tributeFarm || smithyFarm)
				tooltipText += "<div class='windowMapTypeDropdown" + varPrefix_Adjusted + "\' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.mapType + "' id='windowMapTypeDropdown" + x + "'>" + mapTypeDropdown + "</select></div>"
			if (worshipperFarm)
				tooltipText += "<div class='windowWorshipper'><input value='" + vals.worshipper + "' type='number' id='windowWorshipper" + x + "'/></div>";
			if (mapFarm)
				tooltipText += "<div class='windowRepeat'><input value='" + vals.repeat + "' type='number' id='windowRepeat" + x + "'/></div>";
			if (mapBonus)
				tooltipText += "<div class='windowMapStacks'><input value='" + vals.repeat + "' type='number' id='windowRepeat" + x + "'/></div>";
			if (smithyFarm)
				tooltipText += "<div class='windowSmithies'><input value='" + vals.repeat + "' type='number' id='windowRepeat" + x + "'/></div>";
			if (hdFarm)
				tooltipText += "<div class='windowHDBase'><input value='" + vals.hdBase + "' type='number' id='windowRepeat" + x + "'/></div>";
			if (hdFarm)
				tooltipText += "<div class='windowHDMult'><input value='" + vals.hdMult + "' type='number' id='windowHDMult" + x + "'/></div>";
			if (tributeFarm)
				tooltipText += "<div class='windowTributes'><input value='" + vals.tributes + "' type='number' id='windowTributes" + x + "'/></div>";
			if (tributeFarm) tooltipText += "<div class='windowMets'><input value='" + vals.mets + "' type='number' id='windowMets" + x + "'/></div>";
			if (mapFarm || tributeFarm || worshipperFarm || bionic)
				tooltipText += "<div class='windowRepeatEvery" + varPrefix_Adjusted + "\'><input value='" + vals.repeatevery + "' type='number' id='windowRepeatEvery" + x + "'/></div>";
			if (mapFarm || tributeFarm || worshipperFarm || hdFarm)
				tooltipText += "<div class='windowEndZone" + varPrefix_Adjusted + "\'><input value='" + vals.endzone + "' type='number' id='windowEndZone" + x + "'/></div>";
			if (quagmire)
				tooltipText += "<div class='windowBogs'><input value='" + vals.bogs + "' type='number' id='windowBogs" + x + "'/></div>";
			if (insanity)
				tooltipText += "<div class='windowInsanity'><input value='" + vals.insanity + "' type='number' id='windowInsanity" + x + "'/></div>";
			if (golden)
				tooltipText += "<div class='windowAmtAutoGolden'><input value='" + vals.goldenNumber + "' type='number' id='windowWorld" + x + "'/></div>";
			if (golden)
				tooltipText += "<div class='windowTypeAutoGolden' onchange='updateWindowPreset(" + x + ")'><select value='" + vals.goldentype + "' id='windowGoldenType" + x + "'>" + goldenDropdown + "</select></div>"
			if (hdFarm)
				tooltipText += "<div class='windowHDType' onchange='updateWindowPreset(" + x + ")'><select value='" + vals.hdType + "' id='windowHDType" + x + "'>" + hdTypeDropdown + "</select></div>"
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
			if (!raiding && !smithyFarm && !hdFarm && !golden)
				tooltipText += "<div class='windowJobRatio" + varPrefix_Adjusted + "\'><input value='" + vals.jobratio + "' type='value' id='windowJobRatio" + x + "'/></div>";
			if (tributeFarm)
				tooltipText += "<div class='windowBuildings' style='text-align: center;'>" + buildNiceCheckbox("windowBuildings" + x, null, vals.buildings) + "</div>";
			if (boneShrine)
				tooltipText += "<div class='windowBoneGather'><select value='" + vals.gather + "' id='windowBoneGather" + x + "'>" + gatherDropdown + "</select></div>"
			if (raiding && !bionic) tooltipText += "<div class='windowRaidingDropdown' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.raidingDropdown + "' id='windowRaidingDropdown" + x + "'>" + raidingDropdown + "</select></div>"
			if (mapFarm || alchemy || mapBonus || insanity)
				tooltipText += "<div class='windowSpecial" + varPrefix_Adjusted + "\'  onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.special + "' id='windowSpecial" + x + "'>" + specialsDropdown + "</select></div>"
			if (mapFarm || alchemy || mapBonus || insanity)
				tooltipText += "<div class='windowGather'>\<div style='text-align: center; font-size: 0.6vw;'>Gather</div>\<onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'>\<select value='" + vals.gather + "' id='windowGather" + x + "'>" + gatherDropdown + "</select>\</div>"
			if (mapFarm || tributeFarm || boneShrine)
				tooltipText += "<div class='windowAtlantrimp' style='text-align: center;'>" + buildNiceCheckbox("windowAtlantrimp" + x, null, vals.atlantrimp) + "</div>";
			if (smithyFarm)
				tooltipText += "<div class='windowMeltingPoint' style='text-align: center;'>" + buildNiceCheckbox("windowMeltingPoint" + x, null, vals.meltingPoint) + "</div>";
			if (insanity)
				tooltipText += "<div class='windowBuildings' style='text-align: center;'>" + buildNiceCheckbox("windowBuildings" + x, null, vals.destack) + "</div>";
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding)
				tooltipText += "<div class='windowRunType" + varPrefix_Adjusted + "\' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.runType + "' id='windowRunType" + x + "'>" + runTypeDropdown + "</select></div>"


			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding)
				tooltipText += "<div class='windowChallenge" + varPrefix_Adjusted + "\'>\<div style='text-align: center; font-size: 0.6vw;'>Challenge</div>\<select value='" + vals.challenge + "' id='windowChallenge" + x + "'>" + challengeDropdown + "</select>\</div>"
			if (mapFarm || tributeFarm || smithyFarm || mapBonus || worshipperFarm || boneShrine || voidMap || hdFarm || raiding)
				tooltipText += "<div class='windowChallenge3" + varPrefix_Adjusted + "\'>\<div style='text-align: center; font-size: 0.6vw;'>Challenge" + (universe + 1) + "</div>\<select value='" + vals.challenge3 + "' id='windowChallenge3" + x + "'>" + challenge3Dropdown + "</select>\</div>"
			if (varPrefix[0] === 'r' && boneShrine)
				tooltipText += "<div class='windowShred'>\<div style='text-align: center; font-size: 0.6vw;'>Shred</div>\<select value='" + vals.shredActive + "' id='windowShred" + x + "'>" + shredDropdown + "</select>\</div>"
			if (voidMap)
				tooltipText += "<div class='windowPortalAfter' style='text-align: center;'>" + buildNiceCheckbox("windowPortalAfter" + x, null, vals.portalAfter) + "</div>";

			tooltipText += "</div>"
		}

		tooltipText += "<div id='windowAddRowBtn' style='display: " + ((current.length < maxSettings) ? "inline-block" : "none") + "' class='btn btn-success btn-md' onclick='addRow(\"" + varPrefix + "\",\"" + titleText + "\")'>+ Add Row</div>"
		tooltipText += "</div></div><div style='display: none' id='mazHelpContainer'>" + mazHelp + "</div>";
		costText = "<div class='maxCenter'><span class='btn btn-success btn-md' id='confirmTooltipBtn' onclick='settingsWindowSave(\"" + titleText + "\",\"" + varPrefix + "\")'>Save and Close</span><span class='btn btn-danger btn-md' onclick='cancelTooltip(true)'>Cancel</span><span class='btn btn-primary btn-md' id='confirmTooltipBtn' onclick='settingsWindowSave(\"" + titleText + "\",\"" + varPrefix + "\", true)'>Save</span><span class='btn btn-info btn-md' onclick='windowToggleHelp(\"" + windowSize + "\")'>Help</span></div>"

		//Changing window size depending on setting being opened.
		if (document.getElementById('tooltipDiv').classList[0] !== windowSize) {
			swapClass(document.getElementById('tooltipDiv').classList[0], windowSize, elem);
		}
		game.global.lockTooltip = true;
		elem.style.top = "10%";
		elem.style.left = "1%";
		elem.style.height = 'auto';
		elem.style.maxHeight = window.innerHeight * .85 + 'px';
		if (document.getElementById('windowContainer') !== null && document.getElementById('windowContainer').style.display === 'block' && document.querySelectorAll('#windowContainer .active').length > 12) elem.style.overflowY = 'scroll';
	}

	titleText = (titleText) ? titleText : titleText;

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

function settingsWindowSave(titleText, varPrefix, reopen) {

	var setting = [];
	var error = "";
	var errorMessage = false;
	var maxSettings = 30;
	if (!titleText.includes('Auto Golden')) {
		var defaultActive = readNiceCheckbox(document.getElementById('windowActiveDefault'));
		var defaultCell = parseInt(document.getElementById('windowCellDefault').value, 10);
		if (titleText.includes('Map Farm') || titleText.includes('Map Bonus')) var defaultRepeat = parseInt(document.getElementById('windowRepeatDefault').value, 10);
		if (titleText.includes('Worshipper Farm')) var defaultShipSkip = parseInt(document.getElementById('windowRepeatDefault').value, 10);
		if (titleText.includes('Map Farm') || titleText.includes('Alch') || titleText.includes('Map Bonus') || titleText.includes('Insanity')) var defaultSpecial = document.getElementById('windowSpecialDefault').value;
		if (titleText.includes('Bone')) var defaultBonebelow = parseInt(document.getElementById('windowBoneBelowDefault').value, 10);
		if (titleText.includes('Worshipper Farm')) var defaultWorshipper = parseInt(document.getElementById('windowWorshipperDefault').value, 10);
		if (!titleText.includes('Raiding') && !titleText.includes('Smithy') && !titleText.includes('HD Farm')) var defaultJobratio = document.getElementById('windowJobRatioDefault').value;
		if (titleText.includes('Bone')) var defaultBonegather = document.getElementById('windowBoneGatherDefault').value;
		if (titleText.includes('Alchemy Farm')) var defaultVoidPurchase = readNiceCheckbox(document.getElementById('windowVoidPurchase'));
		if (titleText.includes('Hypo')) var defaultFrozenCastle = document.getElementById('windowFrozenCastleDefault').value.split(',');
		if (titleText.includes('Hypo')) var defaultAutoStorage = readNiceCheckbox(document.getElementById('windowStorageDefault'));
		if (titleText.includes('Hypo')) var defaultPackrat = readNiceCheckbox(document.getElementById('windowPackratDefault'));
		if (titleText.includes('Raiding') && !titleText.includes('Bionic')) var defaultRecycle = readNiceCheckbox(document.getElementById('windowRecycleDefault'));
		if (titleText.includes('Tribute Farm') || titleText.includes('Smithy Farm')) var mapType = document.getElementById('windowMapTypeDropdownDefault').value;
		if (titleText.includes('Map Bonus')) var healthBonus = parseInt(document.getElementById('healthBonus').value, 10);
		if (titleText.includes('Map Bonus')) var healthHDRatio = parseFloat(document.getElementById('healthHDRatio').value, 10);
		if (titleText.includes('HD Farm')) var mapCap = parseFloat(document.getElementById('mapCap').value, 10);
		if (varPrefix[0] === 'r' && (titleText.includes('Map Farm') || titleText.includes('HD Farm'))) var shredMapCap = parseFloat(document.getElementById('shredMapCap').value, 10);

		if (defaultCell < 1) defaultCell = 1;
		if (defaultCell > 100) defaultCell = 100;
		if (healthBonus > 10) healthBonus = 10;
		if (healthBonus < 0) healthBonus = 0;

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
			voidPurchase: defaultVoidPurchase,
			frozencastle: defaultFrozenCastle,
			healthBonus: healthBonus,
			healthHDRatio: healthHDRatio,
			mapCap: mapCap,
			shredMapCap: shredMapCap
		};
		autoTrimpSettings[varPrefix + "DefaultSettings"].value = thisDefaultSetting;
	}

	for (var x = 0; x < maxSettings; x++) {
		var world = document.getElementById('windowWorld' + x);
		if (titleText.includes('Auto Golden')) world = document.getElementById('windowWorld' + x);
		if (!world || world.value == "-1") {
			continue;
		};

		active = readNiceCheckbox(document.getElementById('windowActive' + x));
		if (!titleText.includes('Auto Golden')) var world = parseInt(document.getElementById('windowWorld' + x).value, 10);
		if (!titleText.includes('Auto Golden')) var cell = parseInt(document.getElementById('windowCell' + x).value, 10);
		if (!titleText.includes('Quag') && !titleText.includes('Bone') && !titleText.includes('Raiding') && !titleText.includes('Void') && !titleText.includes('Auto Golden')) var level = parseInt(document.getElementById('windowLevel' + x).value, 10);
		if (titleText.includes('Map Farm') || titleText.includes('Smithy') || titleText.includes('Map Bonus')) var repeat = parseInt(document.getElementById('windowRepeat' + x).value, 10);
		if (titleText.includes('HD Farm')) var hdBase = parseFloat(document.getElementById('windowRepeat' + x).value, 10);
		if (titleText.includes('HD Farm')) var hdMult = parseFloat(document.getElementById('windowHDMult' + x).value, 10);

		if (titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Worshipper Farm') || titleText.includes('Bionic')) var repeatevery = parseInt(document.getElementById('windowRepeatEvery' + x).value, 10);
		if (titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Worshipper Farm') || titleText.includes('HD Farm')) var endzone = parseInt(document.getElementById('windowEndZone' + x).value, 10);
		if (titleText.includes('Raiding')) var raidingzone = parseInt(document.getElementById('windowRaidingZone' + x).value, 10);
		if (titleText.includes('Map Farm') || titleText.includes('Alch') || titleText.includes('Map Bonus') || titleText.includes('Insanity')) var special = document.getElementById('windowSpecial' + x).value;
		if (titleText.includes('Map Farm') || titleText.includes('Alch') || titleText.includes('Map Bonus') || titleText.includes('Insanity')) {
			if (special == 'hc' || special == 'lc')
				var gather = document.getElementById('windowGather' + x).value;
			else
				var gather = null;
		}
		if (titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Smithy Farm') || titleText.includes('Map Bonus') || titleText.includes('Worshipper Farm') || titleText.includes('Insanity Farm') || titleText.includes('Alchemy Farm') || titleText.includes('Hypothermia Farm') || titleText.includes('HD Farm')) var autoLevel = readNiceCheckbox(document.getElementById('windowAutoLevel' + x));
		if (titleText.includes('Tribute') || titleText.includes('Smithy Farm')) var mapType = document.getElementById('windowMapTypeDropdown' + x).value;
		if (titleText.includes('Tribute')) var tributes = parseInt(document.getElementById('windowTributes' + x).value, 10);
		if (titleText.includes('Tribute')) var mets = parseInt(document.getElementById('windowMets' + x).value, 10);
		if (titleText.includes('Quag')) var bogs = parseInt(document.getElementById('windowBogs' + x).value, 10);
		if (titleText.includes('Insanity')) var insanity = parseInt(document.getElementById('windowInsanity' + x).value, 10);
		if (titleText.includes('Auto Golden')) var golden = document.getElementById('windowGoldenType' + x).value;
		if (titleText.includes('HD Farm')) var hdType = document.getElementById('windowHDType' + x).value;
		if (titleText.includes('Auto Golden')) golden += parseInt(document.getElementById('windowWorld' + x).value, 10);
		if (titleText.includes('Alch')) var potion = document.getElementById('windowPotionType' + x).value;
		if (titleText.includes('Alch')) potion += parseInt(document.getElementById('windowPotionNumber' + x).value, 10);
		if (titleText.includes('Hypo')) var bonfire = parseInt(document.getElementById('windowBonfire' + x).value, 10);
		if (titleText.includes('Bone')) var boneamount = parseInt(document.getElementById('windowBoneAmount' + x).value, 10);
		if (titleText.includes('Bone')) var bonebelow = parseInt(document.getElementById('windowBoneBelow' + x).value, 10);
		if (titleText.includes('Worshipper Farm')) var worshipper = parseInt(document.getElementById('windowWorshipper' + x).value, 10);
		if (titleText.includes('Void')) var maxvoidzone = parseInt(document.getElementById('windowMaxVoidZone' + x).value, 10);
		if (titleText.includes('Void')) var hdRatio = parseInt(document.getElementById('windowHDRatio' + x).value, 10);
		if (titleText.includes('Void')) var voidHDRatio = parseInt(document.getElementById('windowVoidHDRatio' + x).value, 10);
		if (titleText.includes('Tribute')) var buildings = readNiceCheckbox(document.getElementById('windowBuildings' + x));
		if (titleText.includes('Map Farm') || titleText.includes('Tribute') || titleText.includes('Bone Shrine')) var atlantrimp = readNiceCheckbox(document.getElementById('windowAtlantrimp' + x));
		if (titleText.includes('Smithy Farm')) var meltingPoint = readNiceCheckbox(document.getElementById('windowMeltingPoint' + x));
		if (titleText.includes('Void Map')) var portalAfter = readNiceCheckbox(document.getElementById('windowPortalAfter' + x));
		if (!titleText.includes('Raiding') && !titleText.includes('Smithy') && !titleText.includes('HD Farm') && !titleText.includes('Golden')) var jobratio = document.getElementById('windowJobRatio' + x).value;
		if (titleText.includes('Bone')) var gather = document.getElementById('windowBoneGather' + x).value;
		if (titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Smithy Farm') || titleText.includes('Map Bonus') || titleText.includes('Worshipper Farm') || titleText.includes('Bone Shrine') || titleText.includes('Void Map') || titleText.includes('HD Farm') || titleText.includes('Raiding')) var runType = document.getElementById('windowRunType' + x).value;
		if (titleText.includes('Raiding') && !titleText.includes('Bionic')) var raidingDropdown = document.getElementById('windowRaidingDropdown' + x).value;
		if (titleText.includes('Insanity')) var destack = readNiceCheckbox(document.getElementById('windowBuildings' + x));

		if (titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Smithy Farm') || titleText.includes('Map Bonus') || titleText.includes('Worshipper Farm') || titleText.includes('Bone Shrine') || titleText.includes('Void Map') || titleText.includes('HD Farm') || titleText.includes('Raiding')) {
			var challenge = runType === 'Filler' ? document.getElementById('windowChallenge' + x).value : null;
			var challenge3 = runType === 'C3' ? document.getElementById('windowChallenge3' + x).value : null;
		}
		if (varPrefix[0] === 'r' && titleText.includes('Bone Shrine')) {
			if (runType == 'Daily' || runType == 'All')
				var shredActive = document.getElementById('windowShred' + x).value;
			else
				var shredActive = false;
		}

		if (!titleText.includes('Auto Golden') && (isNaN(world) || world < 6)) {
			error += " Preset " + (x + 1) + " needs a value for Start Zone that's greater than 5.<br>";
			errorMessage = true;
		}
		else if (!titleText.includes('Auto Golden') && world > 1000) {
			error += " Preset " + (x + 1) + " needs a value for Start Zone that's less than 1000.<br>";
			errorMessage = true;
		}
		if (!titleText.includes('Auto Golden') && (world + level < 6)) {
			error += " Preset " + (x + 1) + " can\'t have a zone and map combination below zone 6.<br>";
			errorMessage = true;
		}
		if (titleText.includes('Raiding') && world >= raidingzone) {
			error += " Preset " + (x + 1) + " can\'t have a map level below world level as you won\'t be able to get prestiges there.<br>";
			errorMessage = true;
		}
		if (titleText.includes('Map Bonus') && (level < (game.global.universe === 1 ? 0 - game.portal.Siphonology.level : 0))) {
			error += " Preset " + (x + 1) + " can\'t have a map level below " + ((game.global.universe === 1 && game.portal.Siphonology.level > 0) ? (0 - game.portal.Siphonology.level) : "world level") + " as you won\'t be able to get any map stacks.<br>";
			errorMessage = true;
		}
		if (titleText.includes('Map Bonus') && repeat < 1) {
			error += " Preset " + (x + 1) + " can\'t have a map bonus value lower than 1 as you won\'t be able to get any map stacks.<br>";
			errorMessage = true;
		}
		if (titleText.includes('Map Farm') && repeat < 1) {
			error += " Preset " + (x + 1) + " can\'t have a repeat value lower than 1 as you won\'t run any maps when this line runs.<br>";
			errorMessage = true;
		}
		if (titleText.includes('Insanity') && level === 0) {
			error += " Preset " + (x + 1) + " can\'t have a map level of 0 as you won\'t gain any Insanity stacks running this map.<br>";
			errorMessage = true;
		}
		if (titleText.includes('Insanity') && level < 0 && destack === false) {
			error += " Preset " + (x + 1) + " can\'t have a map level below world level as you will lose Insanity stacks running this map. To change this toggle the 'Destack' option.<br>";
			errorMessage = true;
		}
		if (titleText.includes('Insanity') && level >= 0 && destack === true) {
			error += " Preset " + (x + 1) + " can\'t have a map level at or above world level as you won't be able to lose Insanity stacks running this map. To change this toggle the 'Destack' option.<br>";
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
		if (voidHDRatio < 0) voidHDRatio = 0;
		if (hdRatio < 0) hdRatio = 0;
		if (maxvoidzone < world) maxvoidzone = world;

		if (repeat < 0) repeat = 0;
		if (titleText.includes('Raiding') && !titleText.includes('Bionic') && (raidingzone - world > 10)) raidingzone = world + 10;

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
			golden: golden,
			bonfire: bonfire,
			boneamount: boneamount,
			bonebelow: bonebelow,
			worshipper: worshipper,
			maxvoidzone: maxvoidzone,
			hdRatio: hdRatio,
			voidHDRatio: voidHDRatio,
			runType: runType,
			portalAfter: portalAfter,
			challenge: challenge,
			challenge3: challenge3,
			raidingDropdown: raidingDropdown,
			buildings: buildings,
			jobratio: jobratio,
			atlantrimp: atlantrimp,
			meltingPoint: meltingPoint,
			raidingzone: raidingzone,
			mapType: mapType,
			autoLevel: autoLevel,
			endzone: endzone,
			repeatevery: repeatevery,
			destack: destack,
			shredActive: shredActive,
			hdBase: hdBase,
			hdMult: hdMult,
			hdType: hdType,
			done: (currSetting && currSetting.done) ? currSetting.done : false
		};
		setting.push(thisSetting);
	}
	if (!titleText.includes('Golden')) setting.sort(function (a, b) { if (a.world == b.world) return (a.cell > b.cell) ? 1 : -1; return (a.world > b.world) ? 1 : -1 });

	if (error) {
		var elem = document.getElementById('windowError');
		if (elem) elem.innerHTML = error;
		return;
	}
	//Reset variables that are about to get used.
	autoTrimpSettings[varPrefix + "Settings"].value = [];
	if (!titleText.includes('Golden')) autoTrimpSettings[varPrefix + "Zone"].value = [];

	for (var x = 0; x < setting.length; x++) {
		autoTrimpSettings[varPrefix + "Settings"].value[x] = setting[x];
		if (!titleText.includes('Golden')) autoTrimpSettings[varPrefix + "Zone"].value[x] = setting[x].world
	}

	var elem = document.getElementById("tooltipDiv");
	swapClass(document.getElementById('tooltipDiv').classList[0], "tooltipExtraNone", elem);
	cancelTooltip(true);
	if (reopen) MAZLookalike(titleText, varPrefix, 'MAZ');

	saveSettings();
	if (!titleText.includes('Auto Golden')) {
		if (!autoTrimpSettings[varPrefix + "DefaultSettings"].value.active)
			debug(titleText + " has been saved but is disabled. To enable it tick the 'Active' box in the top left of the window.")
	}
	document.getElementById('tooltipDiv').style.overflowY = '';
}

function mazPopulateHelpWindow(titleText, varPrefix, trimple) {
	//Setting up the Help onclick setting.
	var mazHelp = "Welcome to '" + titleText + "' settings! This is a powerful automation tool that allows you to set when maps should be automatically run, and allows for a high amount of customization. Here's a quick overview of what everything does:"


	let mapFarm = titleText.includes('Map Farm');
	let mapBonus = titleText.includes('Map Bonus');
	let voidMap = titleText.includes('Void Map');
	let hdFarm = titleText.includes('HD Farm');
	let raiding = titleText.includes('Raiding');
	let bionic = titleText.includes('Bionic');
	let quagmire = titleText.includes('Quagmire');
	let insanity = titleText.includes('Insanity Farm');
	let alchemy = titleText.includes('Alchemy Farm');
	let hypothermia = titleText.includes('Hypothermia Farm');
	let boneShrine = titleText.includes('Bone Shrine');
	let golden = titleText.includes('Golden');

	let radonSetting = varPrefix[0] === 'r'

	let tributeFarm = titleText.includes('Tribute Farm');
	let smithyFarm = titleText.includes('Smithy Farm');
	let worshipperFarm = titleText.includes('Worshipper Farm');

	//Map Bonus Information to detail how it functions since it's unclear compared to every other setting
	if (mapBonus) mazHelp += "<br><br><b>Map Bonus works by using the last line that's greater or equal to your current world zone and then using those settings for every zone that follows on from it.</b>"
	if (voidMap) mazHelp += "<br><br>Void Map works by using 'Min Zone' as the lower bound zone to run voids on and 'Max Zone' as the upper bound. If your HD Ratio OR Void HD Ratio value (can be seen in status tooltip) is greater than the set value then it'll run voids on current zone otherwise will run them on your setting in 'Max Zone'."

	//Default Value settings
	if (!golden) {
		mazHelp += "<br><br>The default values section are values which will automatically be input when a new row has been added. There's a few exception to this such as:<br></br><ul>"
		mazHelp += "<li><b>Active</b> - A toggle to temporarily disable/enable the entire setting.</li>"
		if (worshipperFarm) mazHelp += "<li><b>Skip Value</b> - How many worshippers a map must provide for you to run your Worshipper Farming.</li>";
		if (raiding && !bionic) mazHelp += "<li><b>Recycle</b> - A toggle to recycle maps after raiding has finished.</li>"
		if (raiding) mazHelp += "<li><b>Recycle</b> - A toggle to recycle maps after BW raiding has finished.</li>"
		if (mapBonus) mazHelp += "<li><b>Health Bonus</b> - The amount of map stacks to farm when your HD Ratio is below that of the <b>Health HDRatio</b> field. Default is 10.</li>"
		if (mapBonus) mazHelp += "<li><b>Health HD Ratio</b> - Decides when to start getting the map stack bonus value in the <b>Health Bonus</b> field. 10 is default, this means it\'d go for it when your HDRatio is above 10.</li>"
		if (alchemy) mazHelp += "<li><b>Void Purchase</b> - Will purchase as many void and strength potions as you can currently afford when you go into a void map. Would recommend only disabling this setting when going for the Alchemy achievement.</li>"
		if (hypothermia) mazHelp += "<li><b>Frozen Castle</b> - The zone,cell combination that you'd like Frozen Castle to be run at. The input style is '200,99' and if you don't input it properly it'll default to zone 200 cell 99.</li>"
		if (hypothermia) mazHelp += "<li><b>AutoStorage</b> - Disables AutoStorage until the first Bonfire farm zone that you reach during the challenge.</li>"
		if (hypothermia) mazHelp += "<li><b>Packrat</b> - Will purchase as many levels of packrat as possible once the Hypothermia challenge ends with leftover radon and additionally when portaling it reset the packrat level to 3 so that you don't accidentally trigger a 5th bonfire at the start of the run.</li>"
		if (radonSetting && hdFarm) mazHelp += "<li><b>Shred Map Cap</b> - Will cap the amount of maps being run to this value when in a metal shred daily.</li>"
		if (radonSetting && mapFarm) mazHelp += "<li><b>Shred Map Cap</b> - Will cap the amount of maps being run to this value when in a shred daily that matches your cache option.</li>"
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
		mazHelp += "<li><b>Special</b> - The type of cache you'd like to run during this map. Will override metal cache inputs with savory caches during the Transmute challenge.</li>";



	//Setting specific inputs
	//Row Settings
	mazHelp += "</ul></br><b>These inputs are specific to this setting and can be quite important for how you try to set this up:</b><ul><br>"

	//Void Map
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

	//Map Farm
	if (mapFarm) {
		mazHelp += "<li><b>Map Repeat</b> - How many maps you'd like to run during this line.</li>";
		//Trimple Map Farm
		mazHelp += "<li><b>Run " + trimple + "</b> - Will run " + trimple + " during this line. Whilst farming the specified amount of maps for this line it will stop AT purchasing equips until " + trimple + " has been run so that there is no wasted resources. " + ((radonSetting) ? "<b>Won't run on shred dailies that would be impacted by your farming choices.</b>" : "") + "</li>";
	}
	//Map Bonus
	if (mapBonus) {
		mazHelp += "<li><b>Map Stacks</b> - How many stacks AT should obtain when running this line.</li>";
	}

	//Raiding & Bionic Raiding
	if (raiding) {
		//Raiding Zone
		mazHelp += "<li><b>Raiding Zone</b> - The zone you'd like to raid when this line is run. " + (!bionic ? "If your 'Zone' input is 231 then the highest zone you can input is 241." : "") + "</li>";
		if (!bionic) mazHelp += "<li><b>Frag Type</b> - Frag: Farm for fragments to afford the maps you want to create. <br>\
	Frag Min: Used for absolute minimum frag costs (which includes no Prestige special, perfect sliders, random map and the difficulty and size options, however it will try to afford those options first!) and prioritises buying the most maps for a smoother sequential raid. \
	<br>Frag Max: This option will make sure that the map has perfect sliders and uses the prestegious special.</li>";
	}

	//HD Farm
	if (hdFarm) {
		//HD Base
		mazHelp += "<li><b>HD Base</b> - What H:D you'd like to reach.</li>";
		//HD Mult
		mazHelp += "<li><b>HD Mult</b> - Starting from the zone above the lines initial zone, this setting will multiply the H:D you have set in HD Base. So if your initial zone was 100, HD Base was 10, HD Mult was 1.2, at z101 your H:D target will be 12, then at z102 it will be 14.4 and so on. This way you can account for the zones getting stronger and you will not waste Map Farming for a really low H:D.'</li>";
	}

	//Bone Shrine
	if (boneShrine) {
		//To use
		mazHelp += "<li><b>To use</b> - How many bone charges to use on this line.</li>";
		//Use Below
		mazHelp += "<li><b>Use below</b> - This value will stop bone charges being spent when you're at or below this value.</li>";
		//Trimple Bone Shrine
		mazHelp += "<li><b>Run " + trimple + "</b> - Will run " + trimple + " during this line. After using the bone shrine charges specified for this line it will stop AT purchasing equips until " + trimple + " has been run so that there is no wasted resources. <b>Will run " + trimple + " and use the charges after cell 95. Will pause " + trimple + " if necessary in a shred daily to ensure you don't waste resources.</b></li>";
		//Gather setting
		mazHelp += "<li><b>Gather</b> - Which resource you'd like to gather when popping a Bone Shrine charge to make use of Turkimp resource bonus.</li>";
		//Shred Dailies
		if (radonSetting) mazHelp += "<li><b>Shred</b> - This dropdown will only appear when the Run Type dropdown has All or Daily selected. Will allow you to decide if you'd like that line to be run on dailies with or without the shred that matches your gather type or on both.</li>";
	}

	//TRIBUTE FARM
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
		mazHelp += "<li><b>Run " + trimple + "</b> - Will run " + trimple + " during this line. Autoamtically calculates when it would be more efficient to run " + trimple + " or continue farming Savory Cache maps to reach your target in the fastest time possible. <b>Won't run on food shred dailies.</b></li>";
	}

	//Smithy
	if (smithyFarm) {
		//Smithy Count
		mazHelp += "<li><b>Smithies</b> - Smithy count you'd like to reach during this line. If you currently own 18 and want to reach 21 you'd enter 21 into this field.</li>";
		//Farm Type
		mazHelp += "<li><b>Farm Type</b> - The way in which Smithy Farming will operate. Either by using absolute values for what you'd like to farm e.g. 27 Smithies or by having AT identify how many you can farm in X maps and then using that count to identify the amount based off expected mapping gains.</li>"
		//Runs MP after the line
		mazHelp += "<li><b>Run MP</b> - Will run Melting Point after this line has been run.</b></li>";
	}

	//Worshipper

	if (worshipperFarm) {
		//Worshipper Count
		mazHelp += "<li><b>Ship</b> - How many worshippers you'd like to farm up to during this line. Max input is 50 and it'll default to that value if you input anything higher.</li>";
	}

	//Quagmire
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
	//Alchemy
	if (alchemy) {
		//Potion Type
		mazHelp += "<li><b>Potion Type</b> - The type of potion you want to farm during this line.</li>";
		//Potion Number
		mazHelp += "<li><b>Potion Number</b> - How many of the potion specified in 'Potion Type' you'd like to farm for.</li>";
	}
	//Hypothermia
	if (hypothermia)
		mazHelp += "<li><b>Bonfires</b> - How many Bonfires should be farmed on this zone. Uses max bonfires built rather than a specific amount to farm for so if you have already built 14 so far during your run and want another 8 then you'd input 22.</li>";

	//Repeat Every
	if (mapFarm || tributeFarm || worshipperFarm)
		mazHelp += "<li><b>Repeat Every</b> - Line can be repeated every Zone, or set to a custom number depending on need.</li>";
	//End Zone
	if (mapFarm || tributeFarm || worshipperFarm || hdFarm)
		mazHelp += "<li><b>End Zone</b> - Only matters if you're planning on having this MaZ line repeat. If so, the line will stop repeating at this Zone. Must be between 6 and 1000.</li>";
	//Run Type
	if (boneShrine || voidMap || hdFarm)
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

	var ATsetting = game.global.universe === 1 ? autoTrimpSettings.hJobSettingsArray : autoTrimpSettings.rJobSettingsArray;
	ATsetting.value = {};
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

	ATsetting.value = setting;

	//Adding in jobs that are locked so that there won't be any issues later on
	if (game.global.universe === 1) {
		//Magmamancer
		if (game.global.highestLevelCleared < 229) {
			autoTrimpSettings.hJobSettingsArray.value.Magmamancer = {};
			autoTrimpSettings.hJobSettingsArray.value.Magmamancer.enabled = true;
			autoTrimpSettings.hJobSettingsArray.value.Magmamancer.percent = 100;
		}
	}
	if (game.global.universe === 2) {
		//Meteorologist
		if (game.global.highestRadonLevelCleared < 29) {
			autoTrimpSettings.rJobSettingsArray.value.Meteorologist = {};
			autoTrimpSettings.rJobSettingsArray.value.Meteorologist.enabled = true;
			autoTrimpSettings.rJobSettingsArray.value.Meteorologist.percent = 100;
		}
		//Worshipper
		if (game.global.highestRadonLevelCleared < 49) {
			autoTrimpSettings.rJobSettingsArray.value.Worshipper = {};
			autoTrimpSettings.rJobSettingsArray.value.Worshipper.enabled = true;
			autoTrimpSettings.rJobSettingsArray.value.Worshipper.percent = 20;
		}
	}

	cancelTooltip();
	saveSettings();
}

function saveATAutoStructureConfig() {
	var ATsetting = game.global.universe === 1 ? autoTrimpSettings.hBuildingSettingsArray : autoTrimpSettings.rBuildingSettingsArray;
	ATsetting.value = {};
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

	ATsetting.value = setting;

	//Adding in buildings that are locked so that there won't be any issues later on
	if (game.global.universe === 2 && game.global.highestRadonLevelCleared < 129) {
		autoTrimpSettings.rBuildingSettingsArray.value.Laboratory = {};
		autoTrimpSettings.rBuildingSettingsArray.value.Laboratory.enabled = true;
		autoTrimpSettings.rBuildingSettingsArray.value.Laboratory.percent = 100;
		autoTrimpSettings.rBuildingSettingsArray.value.Laboratory.buyMax = 0;
	}

	cancelTooltip();
	saveSettings();
}

function saveATUniqueMapsConfig(setting) {

	var error = "";
	var errorMessage = false;
	var ATsetting = setting === 'rUniqueMaps' ? autoTrimpSettings.rUniqueMapSettingsArray.value : autoTrimpSettings.hUniqueMapSettingsArray.value;
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
		if (name.includes('Melting_Point') && (zone < 55 || (zone === 55 && cell < 56))) {
			error += " Melting Point can\'t be run below zone 55 cell 56.<br>";
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

	ATsetting = setting;
	cancelTooltip();
	saveSettings();
}

function saveATDailyAutoPortalConfig() {
	var setting = autoTrimpSettings.rDailyPortalSettingsArray.value;
	var checkboxes = document.getElementsByClassName('autoCheckbox');
	var percentboxes = document.getElementsByClassName('structConfigPercent');
	/* var portalZoneBox = document.getElementsByClassName('dailyAutoPortalZone')[0];

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
	} */

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
				if (!titleText.includes('Golden')) elem.value = game.global.world < 6 ? 6 : game.global.world;

				if (varPrefix[0] === 'h') {
					//Changing rows to use the colour of the Nature type that the world input will be run on.
					var natureStyle = ['unset', 'rgba(50, 150, 50, 0.75)', 'rgba(60, 75, 130, 0.75)', 'rgba(50, 50, 200, 0.75)'];
					var natureList = ['None', 'Poison', 'Wind', 'Ice'];
					var index = natureList.indexOf(getZoneEmpowerment(elem.value));
					elem.parentNode.style.background = natureStyle[index];
				}

				if (document.getElementById('windowSpecial' + x) !== null)
					document.getElementById('windowSpecial' + x).value = autoTrimpSettings[varPrefix + 'DefaultSettings'].value.special
				if ((!titleText.includes('Smithy') && !titleText.includes('Worshipper Farm') && !titleText.includes('HD Farm')) && document.getElementById('windowRepeat' + x) !== null)
					document.getElementById('windowRepeat' + x).value = autoTrimpSettings[varPrefix + 'DefaultSettings'].value.repeat
				if ((titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Worshipper Farm') || titleText.includes('Bionic')) && document.getElementById('windowRepeatEvery' + x) !== null)
					document.getElementById('windowRepeatEvery' + x).value = 0;
				if ((titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Worshipper Farm') || titleText.includes('HD Farm')) && document.getElementById('windowEndZone' + x) !== null)
					document.getElementById('windowEndZone' + x).value = game.global.world < 6 ? 6 : game.global.world;
				if (titleText.includes('Void Map') && document.getElementById('windowMaxVoidZone' + x) !== null)
					document.getElementById('windowMaxVoidZone' + x).value = game.global.world < 6 ? 6 : game.global.world;
				if (document.getElementById('windowRaidingZone' + x) !== null)
					document.getElementById('windowRaidingZone' + x).value = elem.value
				if (document.getElementById('windowMapTypeDropdown' + x) !== null)
					document.getElementById('windowMapTypeDropdown' + x).value = autoTrimpSettings[varPrefix + 'DefaultSettings'].value.mapType
				if (document.getElementById('windowBoneBelow' + x) !== null)
					document.getElementById('windowBoneBelow' + x).value = autoTrimpSettings[varPrefix + 'DefaultSettings'].value.bonebelow
				if (document.getElementById('windowWorshipper' + x) !== null)
					document.getElementById('windowWorshipper' + x).value = autoTrimpSettings[varPrefix + 'DefaultSettings'].value.worshipper
				if (document.getElementById('windowBoneGather' + x) !== null)
					document.getElementById('windowBoneGather' + x).value = autoTrimpSettings[varPrefix + 'DefaultSettings'].value.gather
				if (document.getElementById('windowBuildings' + x) !== null)
					document.getElementById('windowBuildings' + x).value = true;
				if (document.getElementById('windowShred' + x) !== null)
					document.getElementById('windowShred' + x).value = 'All';
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
				if (document.getElementById('windowJobRatio' + x) !== null && typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.jobratio) !== 'undefined')
					document.getElementById('windowJobRatio' + x).value = autoTrimpSettings[varPrefix + 'DefaultSettings'].value.jobratio
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
				if (typeof (autoTrimpSettings[varPrefix + "DefaultSettings"].value.cell) !== 'undefined')
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
	if (titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Worshipper Farm') || titleText.includes('Bionic')) document.getElementById('windowRepeatEvery' + index).value = 0;
	if (titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Worshipper Farm') || titleText.includes('HD Farm')) document.getElementById('windowEndZone' + index).value = 0;
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
	if (!titleText.includes('Raiding') && !titleText.includes('Smithy') && !titleText.includes('HD Farm') && !titleText.includes('Golden')) document.getElementById('windowJobRatio' + index).value = 0;
	if (titleText.includes('Map Farm') || titleText.includes('Tribute Farm') || titleText.includes('Smithy Farm') || titleText.includes('Map Bonus') || titleText.includes('Worshipper Farm') || titleText.includes('Bone Shrine') || titleText.includes('Void Map') || titleText.includes('HD Farm') || titleText.includes('Raiding')) document.getElementById('windowRunType' + index).value = 0;
	if (titleText.includes('Raiding') && !titleText.includes('Bionic')) document.getElementById('windowRaidingDropdown' + index).value = 0;
	if (titleText.includes('Tribute Farm') || titleText.includes('Smithy Farm')) document.getElementById('windowMapTypeDropdown' + index).value = 'Absolute';
	if (!titleText.includes('Helium') && titleText.includes('Bone')) document.getElementById('windowShred' + index).value = 'All';
	if (titleText.includes('Bone')) document.getElementById('windowBoneGather' + index).value = 'Metal';

	elem.style.display = 'none';
	var btnElem = document.getElementById('windowAddRowBtn');
	btnElem.style.display = 'inline-block';
	swapClass('active', 'disabled', elem);
}

function updateWindowPreset(index, varPrefix) {
	var varPrefix = !varPrefix ? '' : varPrefix;
	var varPrefix_Adjusted = varPrefix.slice(1);
	var row = document.getElementById('windowRow' + index);

	if (varPrefix.includes('MapFarm') || varPrefix.includes('TributeFarm') || varPrefix.includes('SmithyFarm') || varPrefix.includes('MapBonus') || varPrefix.includes('WorshipperFarm') || varPrefix.includes('BoneShrine') || varPrefix.includes('VoidMap') || varPrefix.includes('HDFarm') || varPrefix.includes('Raiding')) {
		if (varPrefix !== '') {
			var runType = document.getElementById('windowRunType' + index).value;

			if ((runType !== 'Filler' && row.classList.contains('windowChallengeOn' + varPrefix_Adjusted)) ||
				(runType === 'Filler' && row.classList.contains('windowChallengeOff' + varPrefix_Adjusted))) {
				newClass = runType === 'Filler' ? "windowChallengeOn" + varPrefix_Adjusted + "" : "windowChallengeOff" + varPrefix_Adjusted + "";
				newClass2 = runType !== 'Filler' ? "windowChallengeOn" + varPrefix_Adjusted + "" : "windowChallengeOff" + varPrefix_Adjusted + "";
				swapClass(newClass2, newClass, row);
			}

			if ((runType !== 'C3' && row.classList.contains('windowChallenge3On' + varPrefix_Adjusted)) ||
				(runType === 'C3' && row.classList.contains('windowChallenge3Off' + varPrefix_Adjusted))) {
				newClass = runType === 'C3' ? "windowChallenge3On" + varPrefix_Adjusted + "" : "windowChallenge3Off" + varPrefix_Adjusted + "";
				newClass2 = runType !== 'C3' ? "windowChallenge3On" + varPrefix_Adjusted + "" : "windowChallenge3Off" + varPrefix_Adjusted + "";
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

	if (varPrefix[0] === 'r' && varPrefix.includes('BoneShrine')) {
		var runType = document.getElementById('windowRunType' + index).value;

		newClass = runType === 'Daily' || runType === 'All' ? 'windowShredOn' : 'windowShredOff';
		swapClass('windowShred', newClass, row);
	}
	if (varPrefix[0] === 'h') {
		//Changing rows to use the colour of the Nature type that the world input will be run on.
		var world = document.getElementById('windowWorld' + index);
		var natureStyle = ['unset', 'rgba(50, 150, 50, 0.75)', 'rgba(60, 75, 130, 0.75)', 'rgba(50, 50, 200, 0.75)'];
		var natureList = ['None', 'Poison', 'Wind', 'Ice'];
		var index = natureList.indexOf(getZoneEmpowerment(world.value));
		world.parentNode.style.background = natureStyle[index];
	}

}
