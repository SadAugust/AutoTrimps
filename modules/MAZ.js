function MAZLookalike(titleText, varPrefix, isItIn, event){

	
	cancelTooltip();
	var titleText = !titleText ? 'undefined' : titleText;
	var varPrefix = !varPrefix ? 'undefined' : varPrefix;
	
	if (titleText == 'undefined' || varPrefix == 'undefined')
		return;

	
	checkAlert(titleText, isItIn);
	if (game.global.lockTooltip && event != 'update') return;
	if (game.global.lockTooltip && isItIn && event == 'update') return;
	
	var elem = document.getElementById("tooltipDiv");
	swapClass("tooltipExtra", "tooltipExtraNone", elem);
	document.getElementById('tipText').className = "";
	
	var tooltipText;
	var costText = "";
	var titleText;
		
	var ondisplay = null; // if non-null, called after the tooltip is displayed
	var maxSettings = 30;
	
	//Setting up default values section
	tooltipText = "\
	<div id='windowContainer' style='display: block'><div id='windowError'></div>\
	<div class='row windowRow titles'>Default Values</div>\
	<div class='row windowRow titles'>\
	<div class='windowCell'>Cell</div>"
	if (titleText.includes('Time Farm')) tooltipText += "<div class='windowRepeat'>Repeat<br/>Count</div>"
	if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneBelow'>Use below</div>"
	if (titleText.includes('Ship Farm')) tooltipText += "<div class='windowWorshipper'>Ships</div>"
	if (!titleText.includes('Prestige Raiding')) tooltipText += "<div class='windowJobRatio'>Job Ratio</div>"
	if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneGather'>Gather</div>"
	if (titleText.includes('Time Farm') || titleText.includes('Alchemy')) tooltipText += "<div class='windowSpecial'>Special</div>"
	tooltipText += "</div>";

	var defaultVals = {
		cell: -1,
		special: -1,
		repeat: 1,
		gather: 0,
		bonebelow: 0,
		jobratio: '1,1,1,1',
		worshipper: 50
	}
	var style = "";
	
	defaultVals.cell = autoTrimpSettings[varPrefix+"DefaultSettings"].value.cell ? autoTrimpSettings[varPrefix+"DefaultSettings"].value.cell : 81;
	if (titleText.includes('Time Farm') || titleText.includes('Alchemy')) defaultVals.special = autoTrimpSettings[varPrefix+"DefaultSettings"].value.special ? autoTrimpSettings[varPrefix+"DefaultSettings"].value.special : '0';
	if (titleText.includes('Bone Shrine')) defaultVals.bonebelow = autoTrimpSettings[varPrefix+"DefaultSettings"].value.bonebelow ? autoTrimpSettings[varPrefix+"DefaultSettings"].value.bonebelow : 1;
	if (titleText.includes('Bone Shrine')) defaultVals.worshipper = autoTrimpSettings[varPrefix+"DefaultSettings"].value.worshipper ? autoTrimpSettings[varPrefix+"DefaultSettings"].value.worshipper : 50;
	if (!titleText.includes('Prestige Raiding')) defaultVals.jobratio = autoTrimpSettings[varPrefix+"DefaultSettings"].value.jobratio ? autoTrimpSettings[varPrefix+"DefaultSettings"].value.jobratio : '1,1,1,1';
	if (titleText.includes('Time Farm') || titleText.includes('Alchemy') || titleText.includes('Bone Shrine')) defaultVals.gather = autoTrimpSettings[varPrefix+"DefaultSettings"].value.gather ? autoTrimpSettings[varPrefix+"DefaultSettings"].value.gather : '0';

	else style = " style='display: none' ";
	var defaultGatherDropdown = "<option value='food'" + ((defaultVals.gather == 'food') ? " selected='selected'" : "") + ">Food</option>\<option value='wood'" + ((defaultVals.gather == 'wood') ? " selected='selected'" : "") + ">Wood</option>\<option value='metal'" + ((defaultVals.gather == 'metal') ? " selected='selected'" : "") + ">Metal</option>\<option value='science'" + ((defaultVals.gather == 'science') ? " selected='selected'" : "")+ ">Science</option>"
	var defaultSpecialsDropdown = "<option value='0'" + ((defaultVals.special == '0') ? " selected='selected'" : "") + ">None</option>\<option value='fa'" + ((defaultVals.special == 'fa') ? " selected='selected'" : "") + ">Fast Attack</option>\<option value='lc'" + ((defaultVals.special == 'lc') ? " selected='selected'" : "") + ">Large Cache</option>\<option value='ssc'" + ((defaultVals.special == 'ssc') ? " selected='selected'" : "") + ">Small Savory Cache</option>\<option value='swc'" + ((defaultVals.special == 'swc') ? " selected='selected'" : "") + ">Small Wooden Cache</option>\<option value='smc'" + ((defaultVals.special == 'smc') ? " selected='selected'" : "") + ">Small Metal Cache</option>\<option value='src'" + ((defaultVals.special == 'src') ? " selected='selected'" : "") + ">Small Resource Cache</option>\<option value='p'" + ((defaultVals.special == 'p') ? " selected='selected'" : "") + ">Prestigious</option>\<option value='hc'" + ((defaultVals.special == 'hc') ? " selected='selected'" : "") + ">Huge Cache</option>\<option value='lsc'" + ((defaultVals.special == 'lsc') ? " selected='selected'" : "") + ">Large Savory Cache</option>\<option value='lwc'" + ((defaultVals.special == 'lwc') ? " selected='selected'" : "")+ ">Large Wooden Cache</option>\<option value='lmc'" + ((defaultVals.special == 'lmc') ? " selected='selected'" : "")+ ">Large Metal Cache</option>\<option value='lrc'" + ((defaultVals.special == 'lrc') ? " selected='selected'" : "")+ ">Large Research Cache</option>"
	var potionDropdown = "<option value='h'" + ((defaultVals.potionstype == 'h') ? " selected='selected'" : "") + ">Herby Brew</option>\<option value='g'" + ((defaultVals.potionstype == 'g') ? " selected='selected'" : "") + ">Gaseous Brew</option>\<option value='f'" + ((defaultVals.potionstype == 'f') ? " selected='selected'" : "") + ">Potion of Finding</option>\<option value='v'" + ((defaultVals.potionstype == 'v') ? " selected='selected'" : "") + ">Potion of the Void</option>\<option value='s'" + ((defaultVals.potionstype == 's') ? " selected='selected'" : "") + ">Potion of Strength</option>"
	tooltipText += "<div id='windowRow' class='row windowRow'>";
	tooltipText += "<div class='windowCell'><input value='" + defaultVals.cell + "' type='number' id='windowCellDefault'/></div>";
	if (titleText.includes('Time Farm')) tooltipText += "<div class='windowRepeat'><input value='" + defaultVals.repeat + "' type='number' id='windowRepeatDefault'/></div>";
	if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneBelow'><input value='" + defaultVals.bonebelow + "' type='number' id='windowBoneBelowDefault'/></div>";
	if (titleText.includes('Ship Farm')) tooltipText += "<div class='windowWorshipper'><input value='" + defaultVals.worshipper + "' type='number' id='windowWorshipperDefault'/></div>";
	if (!titleText.includes('Prestige Raiding')) tooltipText += "<div class='windowJobRatio'><input value='" + defaultVals.jobratio + "' type='text' id='windowJobRatioDefault'/></div>";
	if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneGather'><select value='" + defaultVals.gather + "' id='windowBoneGatherDefault'>" + defaultGatherDropdown + "</select></div>"
	if (titleText.includes('Time Farm') || titleText.includes('Alchemy')) tooltipText += "<div class='windowSpecial'><select value='" + defaultVals.special + "' id='windowSpecialDefault'>" + defaultSpecialsDropdown + "</select></div>"
	tooltipText += "</div>"

	//Setting up rows for each setting
	tooltipText += "\
	<div id='windowContainer' style='display: block'><div id='windowError'></div>\
	<div class='row windowRow titles'>\
	<div class='windowWorld'>Zone</div>\
	<div class='windowCell'>Cell</div>"
	if (!titleText.includes('Quagmire Farm') && !titleText.includes('Bone Shrine')) tooltipText += "<div class='windowLevel'>Map<br/>Level</div>"
	if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowTributes'>Tributes</div>"
	if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowMets'>Mets</div>"
	if (titleText.includes('Time Farm')) tooltipText += "<div class='windowRepeat'>Repeat<br/>Count</div>"
	if (titleText.includes('Quagmire Farm')) tooltipText += "<div class='windowBogs'>Bogs</div>"
	if (titleText.includes('Insanity Farm')) tooltipText += "<div class='windowInsanity'>Insanity</div>"
	if (titleText.includes('Alchemy Farm')) tooltipText += "<div class='windowPotionType'>Potion Type</div>"
	if (titleText.includes('Alchemy Farm')) tooltipText += "<div class='windowPotionNumber'>Potion Number</div>"
	if (titleText.includes('Hypothermia Farm')) tooltipText += "<div class='windowBonfire'>Bonfires</div>"
	if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneAmount'>To use</div>"
	if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneBelow'>Use below</div>"
	if (titleText.includes('Ship Farm')) tooltipText += "<div class='windowWorshipper'>Ships</div>"
	if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowBuildings'>Buy Buildings</div>"
	if (!titleText.includes('Prestige Raiding')) tooltipText += "<div class='windowJobRatio'>Job Ratio</div>"
	if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneGather'>Gather</div>"
	if (titleText.includes('Time Farm') || titleText.includes('Alchemy')) tooltipText += "<div class='windowSpecial'>Special</div>"
	if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneDropdown'>Use in</div>"
	tooltipText += "</div>";

	var current = autoTrimpSettings[varPrefix+"Settings"].value;
	
	for (var x = 0; x < maxSettings; x++){
		var vals = {
			check: true,
			world: -1,
			cell: -1,
			level: -1,
			special: -1,
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
			bonedropdown: 10,
			jobratio: '1,1,1,1',
			worshipper: 50,
			buildings: true
		}
		var style = "";
		if (current.length - 1 >= x){
			vals.world = autoTrimpSettings[varPrefix+"Settings"].value[x].world
			vals.cell = autoTrimpSettings[varPrefix+"Settings"].value[x].cell ? autoTrimpSettings[varPrefix+"Settings"].value[x].cell : 81;
			if (!titleText.includes('Quagmire Farm') && !titleText.includes('Bone Shrine')) vals.level = autoTrimpSettings[varPrefix+"Settings"].value[x].level
			if (titleText.includes('Time Farm')) vals.repeat = autoTrimpSettings[varPrefix+"Settings"].value[x].repeat ? autoTrimpSettings[varPrefix+"Settings"].value[x].repeat : 1;
			if (titleText.includes('Tribute Farm')) vals.tributes = autoTrimpSettings[varPrefix+"Settings"].value[x].tributes ? autoTrimpSettings[varPrefix+"Settings"].value[x].tributes : 0;
			if (titleText.includes('Tribute Farm')) vals.mets = autoTrimpSettings[varPrefix+"Settings"].value[x].mets ? autoTrimpSettings[varPrefix+"Settings"].value[x].mets : 0;
			if (titleText.includes('Tribute Farm')) vals.buildings = typeof(autoTrimpSettings[varPrefix+"Settings"].value[x].buildings) !== 'undefined' ? autoTrimpSettings[varPrefix+"Settings"].value[x].buildings : true;
			if (titleText.includes('Quagmire Farm')) vals.bogs = autoTrimpSettings[varPrefix+"Settings"].value[x].bogs ? autoTrimpSettings[varPrefix+"Settings"].value[x].bogs : 0;
			if (titleText.includes('Insanity Farm')) vals.insanity = autoTrimpSettings[varPrefix+"Settings"].value[x].insanity ? autoTrimpSettings[varPrefix+"Settings"].value[x].insanity : 0;
			if (titleText.includes('Alchemy Farm')) vals.potionstype = autoTrimpSettings[varPrefix+"Settings"].value[x].potion[0] ? autoTrimpSettings[varPrefix+"Settings"].value[x].potion[0] : 0;
			if (titleText.includes('Alchemy Farm')) vals.potionsnumber = autoTrimpSettings[varPrefix+"Settings"].value[x].potion.toString().replace(/[^\d,:-]/g, '') ? autoTrimpSettings[varPrefix+"Settings"].value[x].potion.toString().replace(/[^\d,:-]/g, '') : 0;
			if (titleText.includes('Hypothermia Farm')) vals.bonfires = autoTrimpSettings[varPrefix+"Settings"].value[x].bonfire ? autoTrimpSettings[varPrefix+"Settings"].value[x].bonfire : 0;
			if (titleText.includes('Time Farm') || titleText.includes('Alchemy')) vals.special = autoTrimpSettings[varPrefix+"Settings"].value[x].special ? autoTrimpSettings[varPrefix+"Settings"].value[x].special : -1;
			if (titleText.includes('Bone Shrine')) vals.boneamount = autoTrimpSettings[varPrefix+"Settings"].value[x].boneamount ? autoTrimpSettings[varPrefix+"Settings"].value[x].boneamount : 0;
			if (titleText.includes('Bone Shrine')) vals.bonebelow = autoTrimpSettings[varPrefix+"Settings"].value[x].bonebelow ? autoTrimpSettings[varPrefix+"Settings"].value[x].bonebelow : 0;
			if (titleText.includes('Ship Farm')) vals.worshipper = autoTrimpSettings[varPrefix+"Settings"].value[x].worshipper ? autoTrimpSettings[varPrefix+"Settings"].value[x].worshipper : 50;
			if (!titleText.includes('Prestige Raiding')) vals.jobratio = autoTrimpSettings[varPrefix+"Settings"].value[x].jobratio ? autoTrimpSettings[varPrefix+"Settings"].value[x].jobratio : '1,1,1,1';
			if (titleText.includes('Time Farm') || titleText.includes('Alchemy') || titleText.includes('Bone Shrine')) vals.gather = autoTrimpSettings[varPrefix+"Settings"].value[x].gather ? autoTrimpSettings[varPrefix+"Settings"].value[x].gather : '0';
			if (titleText.includes('Bone Shrine')) vals.bonedropdown = autoTrimpSettings[varPrefix+"Settings"].value[x].boneruntype ? autoTrimpSettings[varPrefix+"Settings"].value[x].boneruntype : 1;
		}

		else style = " style='display: none' ";
		var gatherDropdown = "<option value='food'" + ((vals.gather == 'food') ? " selected='selected'" : "") + ">Food</option>\<option value='wood'" + ((vals.gather == 'wood') ? " selected='selected'" : "") + ">Wood</option>\<option value='metal'" + ((vals.gather == 'metal') ? " selected='selected'" : "") + ">Metal</option>\<option value='science'" + ((vals.gather == 'science') ? " selected='selected'" : "")+ ">Science</option>"
		var specialsDropdown = "<option value='0'" + ((vals.special == '0') ? " selected='selected'" : "") + ">None</option>\<option value='fa'" + ((vals.special == 'fa') ? " selected='selected'" : "") + ">Fast Attack</option>\<option value='lc'" + ((vals.special == 'lc') ? " selected='selected'" : "") + ">Large Cache</option>\<option value='ssc'" + ((vals.special == 'ssc') ? " selected='selected'" : "") + ">Small Savory Cache</option>\<option value='swc'" + ((vals.special == 'swc') ? " selected='selected'" : "") + ">Small Wooden Cache</option>\<option value='smc'" + ((vals.special == 'smc') ? " selected='selected'" : "") + ">Small Metal Cache</option>\<option value='src'" + ((vals.special == 'src') ? " selected='selected'" : "") + ">Small Resource Cache</option>\<option value='p'" + ((vals.special == 'p') ? " selected='selected'" : "") + ">Prestigious</option>\<option value='hc'" + ((vals.special == 'hc') ? " selected='selected'" : "") + ">Huge Cache</option>\<option value='lsc'" + ((vals.special == 'lsc') ? " selected='selected'" : "") + ">Large Savory Cache</option>\<option value='lwc'" + ((vals.special == 'lwc') ? " selected='selected'" : "")+ ">Large Wooden Cache</option>\<option value='lmc'" + ((vals.special == 'lmc') ? " selected='selected'" : "")+ ">Large Metal Cache</option>\<option value='lrc'" + ((vals.special == 'lrc') ? " selected='selected'" : "")+ ">Large Research Cache</option>"
		var potionDropdown = "<option value='h'" + ((vals.potionstype == 'h') ? " selected='selected'" : "") + ">Herby Brew</option>\<option value='g'" + ((vals.potionstype == 'g') ? " selected='selected'" : "") + ">Gaseous Brew</option>\<option value='f'" + ((vals.potionstype == 'f') ? " selected='selected'" : "") + ">Potion of Finding</option>\<option value='v'" + ((vals.potionstype == 'v') ? " selected='selected'" : "") + ">Potion of the Void</option>\<option value='s'" + ((vals.potionstype == 's') ? " selected='selected'" : "") + ">Potion of Strength</option>"
		var boneDropdown = "<option value='none'" + ((vals.bonedropdown == 'none') ? " selected='selected'" : "") + ">None</option>\<option value='Fillers'" + ((vals.bonedropdown == 'Fillers') ? " selected='selected'" : "") + ">Fillers</option>\<option value='Daily'" + ((vals.bonedropdown == 'Daily') ? " selected='selected'" : "") + ">Daily</option>\<option value='C3'" + ((vals.bonedropdown == 'C3') ? " selected='selected'" : "") + ">C3</option>\<option value='All'" + ((vals.bonedropdown == 'All') ? " selected='selected'" : "") + ">All</option>"
		var className = (vals.special === 'hc' || vals.special === 'lc') ? " windowBwMainOn" : " windowBwMainOff";
		className += (vals.special == 'hc' || vals.special === 'lc') ? " windowGatherOn" : " windowGatherOff";
		tooltipText += "<div id='windowRow" + x + "' class='row windowRow " + className + "'" + style + ">";
		tooltipText += "<div class='windowDelete' onclick='removeRow(\"" + x + "\",\"" + titleText + "\", true)'><span class='icomoon icon-cross'></span></div>";
		tooltipText += "<div class='windowWorld'><input value='" + vals.world + "' type='number' id='windowWorld" + x + "'/></div>";
		tooltipText += "<div class='windowCell'><input value='" + vals.cell + "' type='number' id='windowCell" + x + "'/></div>";
		if (!titleText.includes('Quagmire Farm') && !titleText.includes('Bone Shrine')) tooltipText += "<div class='windowLevel'><input value='" + vals.level + "' type='number' id='windowLevel" + x + "'/></div>";
		if (titleText.includes('Time Farm')) tooltipText += "<div class='windowRepeat'><input value='" + vals.repeat + "' type='number' id='windowRepeat" + x + "'/></div>";
		if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowTributes'><input value='" + vals.tributes + "' type='number' id='windowTributes" + x + "'/></div>";
		if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowMets'><input value='" + vals.mets + "' type='number' id='windowMets" + x + "'/></div>";
		if (titleText.includes('Quagmire Farm')) tooltipText += "<div class='windowBogs'><input value='" + vals.bogs + "' type='number' id='windowBogs" + x + "'/></div>";
		if (titleText.includes('Insanity Farm')) tooltipText += "<div class='windowInsanity'><input value='" + vals.insanity + "' type='number' id='windowInsanity" + x + "'/></div>";
		if (titleText.includes('Alchemy')) tooltipText += "<div class='windowPotionType' onchange='updateWindowPreset(" + x + ")'><select value='" + vals.potionstype + "' id='windowPotionType" + x + "'>" + potionDropdown + "</select></div>"
		if (titleText.includes('Alchemy Farm')) tooltipText += "<div class='windowPotionNumber'><input value='" + vals.potionsnumber + "' type='text' id='windowPotionNumber" + x + "'/></div>";
		if (titleText.includes('Hypothermia Farm')) tooltipText += "<div class='windowBonfire'><input value='" + vals.bonfires + "' type='number' id='windowBonfire" + x + "'/></div>";
		if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneAmount'><input value='" + vals.boneamount + "' type='number' id='windowBoneAmount" + x + "'/></div>";
		if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneBelow'><input value='" + vals.bonebelow + "' type='number' id='windowBoneBelow" + x + "'/></div>";
		if (titleText.includes('Ship Farm')) tooltipText += "<div class='windowWorshipper'><input value='" + vals.worshipper + "' type='number' id='windowWorshipper" + x + "'/></div>";
		if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowBuildings' style='text-align: center;'>" + buildNiceCheckbox("windowBuildings" + x, null, vals.buildings) + "</div>";
		if (!titleText.includes('Prestige Raiding')) tooltipText += "<div class='windowJobRatio'><input value='" + vals.jobratio + "' type='value' id='windowJobRatio" + x + "'/></div>";
		if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneGather' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.gather + "' id='windowBoneGather" + x + "'>" + gatherDropdown + "</select></div>"
		if (titleText.includes('Bone Shrine')) tooltipText += "<div class='windowBoneDropdown' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.bonedropdown + "' id='windowBoneDropdown" + x + "'>" + boneDropdown + "</select></div>"
		if (titleText.includes('Time Farm') || titleText.includes('Alchemy')) tooltipText += "<div class='windowSpecial' onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'><select value='" + vals.special + "' id='windowSpecial" + x + "'>" + specialsDropdown + "</select></div>"
		if (titleText.includes('Time Farm') || titleText.includes('Alchemy')) tooltipText += "<div class='windowGather'>\<div style='text-align: center;'>Gather</div>\<onchange='updateWindowPreset(\"" + x + "\",\"" + varPrefix + "\")'>\<select value='" + vals.gather + "' id='windowGather" + x + "'>" + gatherDropdown + "</select>\</div>"
		tooltipText += "</div>"
	}
	tooltipText += "<div id='windowAddRowBtn' style='display: " + ((current.length < maxSettings) ? "inline-block" : "none") + "' class='btn btn-success btn-md' onclick='addRow(\"" + varPrefix + "\")'>+ Add Row</div>"
	costText = "<div class='maxCenter'><span class='btn btn-success btn-md' id='confirmTooltipBtn' onclick='settingsWindowSave(\"" + titleText + "\",\"" + varPrefix + "\")'>Save and Close</span><span class='btn btn-danger btn-md' onclick='cancelTooltip(true)'>Cancel</span><span class='btn btn-primary btn-md' id='confirmTooltipBtn' onclick='settingsWindowSave(\"" + titleText + "\",\"" + varPrefix + "\", true)'>Save</span></div>"
	
	game.global.lockTooltip = true;
	elem.style.display = 'block'
	elem.style.top = "10%";
	elem.style.left = "10%";
	elem.style.height = 'auto';
	elem.style.maxHeight = window.innerHeight*.85+'px';
	elem.style.overflowY = 'scroll';
	swapClass('tooltipExtra', 'tooltipExtraLg', elem);

	titleText = (titleText) ? titleText : titleText;
	
	document.getElementById("tipTitle").innerHTML = titleText;
	document.getElementById("tipText").innerHTML = tooltipText;
	document.getElementById("tipCost").innerHTML = costText;
	elem.style.display = "block";
	if (ondisplay !== null)
		ondisplay();
}

function settingsWindowSave(titleText, varPrefix, reopen){

	var setting = [];
	var error = "";
	var maxSettings = 30;
	
	var defaultCell = parseInt(document.getElementById('windowCellDefault').value, 10);
	if (titleText.includes('Time Farm')) var defaultRepeat = parseInt(document.getElementById('windowRepeatDefault').value, 10);
	if (titleText.includes('Time Farm') || titleText.includes('Alch')) var defaultSpecial = document.getElementById('windowSpecialDefault').value;
	if (titleText.includes('Bone')) var defaultBonebelow = parseInt(document.getElementById('windowBoneBelowDefault').value, 10);
	if (titleText.includes('Ship Farm')) var defaultWorshipper = parseInt(document.getElementById('windowWorshipperDefault').value, 10);
	if (!titleText.includes('Prestige Raiding')) var defaultJobratio = document.getElementById('windowJobRatioDefault').value;
	if (titleText.includes('Bone')) var defaultBonegather = document.getElementById('windowBoneGatherDefault').value;

	if (defaultCell < 1) defaultCell = 1;
	if (defaultCell > 100) defaultCell = 100;

	if (defaultRepeat < 0) defaultRepeat = 0;
	
	var thisDefaultSetting = {
		cell: defaultCell,
		repeat: defaultRepeat,
		special: defaultSpecial,
		bonebelow: defaultBonebelow,
		worshipper: defaultWorshipper,
		gather: defaultBonegather,
		jobratio: defaultJobratio
	};
	autoTrimpSettings[varPrefix+"DefaultSettings"].value = thisDefaultSetting;
	

	for (var x = 0; x < maxSettings; x++){
		var world = document.getElementById('windowWorld' + x);
		if (!world || world.value == "-1") {
			continue;
		};
		
		world = parseInt(document.getElementById('windowWorld' + x).value, 10);
		var cell = parseInt(document.getElementById('windowCell' + x).value, 10);
		if (!titleText.includes('Quag') && !titleText.includes('Bone')) var level = parseInt(document.getElementById('windowLevel' + x).value, 10);
		if (titleText.includes('Time Farm')) var repeat = parseInt(document.getElementById('windowRepeat' + x).value, 10);
		if (titleText.includes('Time Farm') || titleText.includes('Alch')) var special = document.getElementById('windowSpecial' + x).value;
		if (titleText.includes('Time Farm') || titleText.includes('Alch')) {
			if (special == 'hc' || special == 'lc')
				var gather = document.getElementById('windowGather' + x).value;
			else 
				var gather = null;
		}
		if (titleText.includes('Tribute')) var tributes = parseInt(document.getElementById('windowTributes' + x).value, 10);
		if (titleText.includes('Tribute')) var mets = parseInt(document.getElementById('windowMets' + x).value, 10);
		if (titleText.includes('Quag')) var bogs = parseInt(document.getElementById('windowBogs' + x).value, 10);
		if (titleText.includes('Insanity')) var insanity = parseInt(document.getElementById('windowInsanity' + x).value, 10);
		if (titleText.includes('Alch')) var potion = document.getElementById('windowPotionType' + x).value;
		if (titleText.includes('Alch')) potion += parseInt(document.getElementById('windowPotionNumber' + x).value, 10);
		if (titleText.includes('Hypo')) var bonfire = parseInt(document.getElementById('windowBonfire' + x).value, 10);
		if (titleText.includes('Bone')) var boneamount = parseInt(document.getElementById('windowBoneAmount' + x).value, 10);
		if (titleText.includes('Bone')) var bonebelow = parseInt(document.getElementById('windowBoneBelow' + x).value, 10);
		if (titleText.includes('Ship Farm')) var worshipper = parseInt(document.getElementById('windowWorshipper' + x).value, 10);
		if (titleText.includes('Tribute')) var buildings = readNiceCheckbox(document.getElementById('windowBuildings' + x));
		if (!titleText.includes('Prestige Raiding')) var jobratio = document.getElementById('windowJobRatio' + x).value;
		if (titleText.includes('Bone')) var gather = document.getElementById('windowBoneGather' + x).value;
		if (titleText.includes('Bone')) var boneruntype = document.getElementById('windowBoneDropdown' + x).value;

		if (isNaN(world) || world < 6) {
			error += " Preset " + (x + 1) + " needs a value for Start Zone that's greater than 5.";
			continue;
		}
		else if (world > 1000) {
			error += " Preset " + (x + 1) + " needs a value for Start Zone that's less than 1000.";
			continue;
		}
		if (world+level < 6){
			error += " Preset " + (x + 1) + " can\'t have a zone and map combination below zone 6.";
			continue;
		}
		if (level > 10) level = 10; 
		if (cell < 1) cell = 1;
		if (cell > 100) cell = 100;

		if (repeat < 0) repeat = 0;
		
		var thisSetting = {
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
			boneruntype: boneruntype,
			buildings: buildings,
			jobratio: jobratio
		};
		setting.push(thisSetting);
	}
	setting.sort(function(a, b){if (a.world == b.world) return (a.cell > b.cell) ? 1 : -1; return (a.world > b.world) ? 1 : -1});
					
	if (error){
		var elem = document.getElementById('windowError');
		if (elem) elem.innerHTML = error;
		return;
	}
	//Reset variables that are about to get used.
	autoTrimpSettings[varPrefix+"Settings"].value = [];
	autoTrimpSettings[varPrefix+"Zone"].value = [];
	if (titleText.includes('Bone')) autoTrimpSettings[varPrefix+"RunType"].value = [];
	
	for (var x = 0; x < setting.length; x++) {
		autoTrimpSettings[varPrefix+"Settings"].value[x] = setting[x];
		autoTrimpSettings[varPrefix+"Zone"].value[x] = setting[x].world
		if (titleText.includes('Bone')) autoTrimpSettings[varPrefix+"RunType"].value[x] = setting[x].boneruntype;
	}
	
	cancelTooltip(true);
	if (reopen) MAZLookalike(titleText, varPrefix);
	
	saveSettings();
	document.getElementById('tooltipDiv').style.overflowY = '';
}

function addRow(varPrefix){
	for (var x = 0; x < 30; x++){
		var elem = document.getElementById('windowWorld' + x);
		if (!elem) continue;
		if (elem.value == -1) {
			var parent = document.getElementById('windowRow' + x);
			if (parent){
				parent.style.display = 'block';
				elem.value = game.global.world + 1 < 6 ? 6 : game.global.world + 1;

				if (document.getElementById('windowSpecial' + x) !== null)
					document.getElementById('windowSpecial' + x).value = autoTrimpSettings[varPrefix+'DefaultSettings'].value.special
				if (document.getElementById('windowRepeat' + x) !== null)
					document.getElementById('windowRepeat' + x).value = autoTrimpSettings[varPrefix+'DefaultSettings'].value.repeat
				if (document.getElementById('windowBoneBelow' + x) !== null)
					document.getElementById('windowBoneBelow' + x).value = autoTrimpSettings[varPrefix+'DefaultSettings'].value.bonebelow
				if (document.getElementById('windowWorshipper' + x) !== null)
					document.getElementById('windowWorshipper' + x).value = autoTrimpSettings[varPrefix+'DefaultSettings'].value.worshipper
				if (document.getElementById('windowBoneGather' + x) !== null)
					document.getElementById('windowBoneGather' + x).value = autoTrimpSettings[varPrefix+'DefaultSettings'].value.gather
				if (document.getElementById('windowBuildings' + x) !== null)
					document.getElementById('windowBuildings' + x).value = true;
				if (document.getElementById('windowJobRatio' + x) !== null)
					document.getElementById('windowJobRatio' + x).value = autoTrimpSettings[varPrefix+'DefaultSettings'].value.jobratio
				updateWindowPreset(x, varPrefix);
			}
		}

		var elemCell = document.getElementById('windowCell' + x);
		if (!elemCell) continue;
		if (elemCell.value == -1) {
			var parent2 = document.getElementById('windowRow' + x);
			if (parent2){
				parent2.style.display = 'block';
				elemCell.value = autoTrimpSettings[varPrefix + 'DefaultSettings'].value.cell
				updateWindowPreset(x, varPrefix);
					break;
			}
		}
	}
	var btnElem = document.getElementById('windowAddRowBtn');
	for (var y = 0; y < 30; y++){
		var elem = document.getElementById('windowWorld' + y);
		if (elem && elem.value == "-1"){			
			btnElem.style.display = 'inline-block';
			return;
		}
		var elemCell = document.getElementById('windowCell' + y);
		if (elemCell && elem.value == "-1"){			
			btnElem.style.display = 'inline-block';
			return;
		}
	}
	btnElem.style.display = 'none'; 
}

function removeRow(index, titleText){
	var elem = document.getElementById('windowRow' + index);
	if (!elem) return;
	document.getElementById('windowWorld' + index).value = -1;
	document.getElementById('windowCell' + index).value = -1;
	if (!titleText.includes('Quag') && !titleText.includes('Bone')) document.getElementById('windowLevel' + index).value = 0;
	if (titleText.includes('Time Farm') || titleText.includes('Alch')) document.getElementById('windowSpecial' + index).value = 0;
	if (titleText.includes('Time Farm') || titleText.includes('Alch')) document.getElementById('windowGather' + index).value = 0;
	if (titleText.includes('Time Farm')) document.getElementById('windowRepeat' + index).value = 0;
	if (titleText.includes('Tribute Farm')) document.getElementById('windowTributes' + index).value = 0;
	if (titleText.includes('Tribute Farm')) document.getElementById('windowMets' + index).value = 0;
	if (titleText.includes('Quag')) document.getElementById('windowBogs' + index).value = 0;
	if (titleText.includes('Insanity')) document.getElementById('windowInsanity' + index).value = 0;
	if (titleText.includes('Hypo')) document.getElementById('windowBonfire' + index).value = 0;
	if (titleText.includes('Bone')) document.getElementById('windowBoneAmount' + index).value = 0;
	if (titleText.includes('Bone')) document.getElementById('windowBoneBelow' + index).value = 0;
	if (titleText.includes('Ship Farm')) document.getElementById('windowWorshipper' + index).value = 0;
	//if (titleText.includes('Tribute Farm')) document.getElementById('windowBuildings' + index).data-checked = false;
	var checkBox = document.getElementById('windowBuildings' + index);
	swapClass("icon-", "icon-checkbox-checked", checkBox);
	checkBox.setAttribute('data-checked', true);
	if (!titleText.includes('Prestige Raiding')) document.getElementById('windowJobRatio' + index).value = 0;
	if (titleText.includes('Bone')) document.getElementById('windowBoneDropdown' + index).value = 0;
	if (titleText.includes('Bone')) document.getElementById('windowBoneGather' + index).value = 0;

	elem.style.display = 'none';
	var btnElem = document.getElementById('windowAddRowBtn');
	btnElem.style.display = 'inline-block';
}

function updateWindowPreset(index, varPrefix){
	var varPrefix = !varPrefix ? '' : varPrefix
	if (varPrefix.includes('TimeFarm') || varPrefix.includes('Alch')) {
		var special = document.getElementById('windowSpecial' + index).value;

		var newClass = (special === 'hc' || special === 'lc') ? "windowBwMainOn" : "windowBwMainOff";
		var row = document.getElementById('windowRow' + index);
		swapClass('windowBwMain', newClass, row);
		
		newClass = (special === 'hc' || special === 'lc') ? 'windowGatherOn' : 'windowGatherOff';
		swapClass('windowGather', newClass, row);
	}
}

