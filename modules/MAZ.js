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
	var tip2 = false;
		
	var ondisplay = null; // if non-null, called after the tooltip is displayed
	var maxSettings = 30;
	var windowHelp = "Welcome to Map at Zone (also referred to as window)! This is a powerful automation tool that allows you to set when maps should be automatically run, and allows for a high amount of customization. Here's a quick overview of titleText everything does:<ul><li><span style='padding-left: 0.3%' class='windowDelete'><span class='icomoon icon-cross'></span></span> - Remove this window line completely</li><li><b>Active</b> - A toggle to temporarily disable/enable the entire window line.</li><li><b>Start Zone</b> - The first Zone that this window line should run. Must be between 10 and 1000.</li><li><b>End Zone</b> - Only matters if you're planning on having this window line repeat. If so, the line will stop repeating at this Zone. Must be between 10 and 1000.</li><li><b>Exit At Cell</b> - The cell number between 1 and 100 where this window line should trigger. 1 is the first cell of the Zone, 100 is the final cell. This line will trigger before starting combat against that cell.</li><li><b>Priority</b> - If there are two or more window lines set to trigger at the same cell on the same Zone, the line with the lowest priority will run first. This also determines sort order of lines in the UI.</li><li><b>Run Map</b> - Uncheck this box if you want Map at Zone to just put you into the Map Chamber without running a map. This will stall your run at a specified point until manual intervention.</li><li><b>Use Preset</b> - Select one of your Advanced Maps presets here, to determine titleText type of map should be created by this window line. You can also choose to run Void Maps or some specific Unique Maps from this dropdown depending on game progress.</li><li><b>Map Repeat</b> - This will toggle your Map Repeat setting On, Off, or leave it as is every time this window line triggers. Set to Repeat On if you want the map to run more than once.</li>";
	windowHelp += "<li><b>Set Repeat Until</b> - This changes your 'Repeat to' setting to the selected choice, allowing you to customize how many times the map should be repeated. If 'Run Bionic' is selected as your Preset, you can select the option 'Climb BW to Level' in this dropdown which will automatically climb Bionic Wonderlands until the set level of map has been cleared of items, then will exit the map.</li><li><b>Exit To</b> - Ensure you're Exiting to World if you want the game to continue progressing after the maps have been completed, or set Exit to Maps if you want the game to wait for manual intervention after completing its map.</li><li><b>Zone Repeat</b> - Set how often this preset should repeat between the Start Zone and End Zone. Preset can be repeated every Zone, or set to a custom number depending on need. Note that when using Zone Repeat with 'Climb BW to Level' that your 'Climb To' setting will be increased by the amount of Zones in between Start Zone and the Zone where this line actually triggers. For example, starting a window line at Z140 to climb BW to Z165 with repeat every 30 Zones will run through BW 165 on Z140, then at Z170 will run through BW 195.</li></ul>"
	tooltipText = "\
	<div id='windowContainer' style='display: block'><div id='windowError'></div>\
	<div class='row windowRow titles'>\
	<div class='windowCheckbox' style='width: 0%'></div>\
	<div class='windowWorld'>Zone</div>\
	<div class='windowCell'>Cell</div>"
	if (!titleText.includes('Quagmire Farm')) tooltipText += "<div class='windowLevel'>Map Level</div>"
	if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowTributes'>Tributes</div>"
	if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowMets'>Mets</div>"
	if (titleText.includes('Time Farm')) tooltipText += "<div class='windowRepeat'>Repeat Count</div>"
	if (titleText.includes('Quagmire Farm')) tooltipText += "<div class='windowBogs'>Bogs</div>"
	if (titleText.includes('Insanity Farm')) tooltipText += "<div class='windowInsanity'>Insanity</div>"
	if (titleText.includes('Alchemy Farm')) tooltipText += "<div class='windowPotionType'>Potion Type</div>"
	if (titleText.includes('Alchemy Farm')) tooltipText += "<div class='windowPotionNumber'>Potion Number</div>"
	if (titleText.includes('Hypothermia Farm')) tooltipText += "<div class='windowBonfire'>Bonfires</div>"
	if (titleText.includes('Time Farm') || titleText.includes('Alchemy')) tooltipText += "<div class='windowSpecial'>Special</div>"
	tooltipText += "</div>";

	var current = autoTrimpSettings[varPrefix+"Zone"].value;
	
	for (var x = 0; x < maxSettings; x++){
		var vals = {
			check: true,
			world: -1,
			cell: 81,
			level: -1,
			special: 0,
			repeat: 1,
			gather: 0,
			tributes: 0,
			mets: 0,
			bogs: 0,
			insanity: 0,
			potionstype: 0,
			potionsnumber: 0,
			bonfires: 5
		}
		var style = "";
		if (current.length - 1 >= x){
			vals.world = autoTrimpSettings[varPrefix+"Zone"].value[x]
			vals.cell = autoTrimpSettings[varPrefix+"Cell"].value[x] ? autoTrimpSettings[varPrefix+"Cell"].value[x] : 81;
			if (!titleText.includes('Quagmire Farm')) vals.level = autoTrimpSettings[varPrefix+"MapLevel"].value[x]
			if (titleText.includes('Time Farm')) vals.repeat = autoTrimpSettings[varPrefix+"Repeat"].value[x] ? autoTrimpSettings[varPrefix+"Repeat"].value[x] : 1;
			if (titleText.includes('Tribute Farm')) vals.tributes = autoTrimpSettings[varPrefix+"Tributes"].value[x] ? autoTrimpSettings[varPrefix+"Tributes"].value[x] : 0;
			if (titleText.includes('Tribute Farm')) vals.mets = autoTrimpSettings[varPrefix+"Mets"].value[x] ? autoTrimpSettings[varPrefix+"Mets"].value[x] : 0;
			if (titleText.includes('Quagmire Farm')) vals.bogs = autoTrimpSettings[varPrefix+"Bog"].value[x] ? autoTrimpSettings[varPrefix+"Bog"].value[x] : 0;
			if (titleText.includes('Insanity Farm')) vals.insanity = autoTrimpSettings[varPrefix+"Insanity"].value[x] ? autoTrimpSettings[varPrefix+"Insanity"].value[x] : 0;
			if (titleText.includes('Alchemy Farm')) vals.potionstype = autoTrimpSettings[varPrefix+"Potion"].value[x][0] ? autoTrimpSettings[varPrefix+"Potion"].value[x][0] : 0;
			if (titleText.includes('Alchemy Farm')) vals.potionsnumber = autoTrimpSettings[varPrefix+"Potion"].value[x].toString().replace(/[^\d,:-]/g, '') ? autoTrimpSettings[varPrefix+"Potion"].value[x].toString().replace(/[^\d,:-]/g, '') : 0;
			if (titleText.includes('Hypothermia Farm')) vals.bonfires = autoTrimpSettings[varPrefix+"Bonfire"].value[x] ? autoTrimpSettings[varPrefix+"Bonfire"].value[x] : 0;
			if (titleText.includes('Time Farm') || titleText.includes('Alchemy')) vals.special = autoTrimpSettings[varPrefix+"Special"].value[x] ? autoTrimpSettings[varPrefix+"Special"].value[x] : 0;
		}

		else style = " style='display: none' ";
		var gatherDropdown = "<option value='0'" + ((vals.gather == '0') ? " selected='selected'" : "") + ">food</option><option value='food'" + ((vals.gather == 'food') ? " selected='selected'" : "") + ">wood</option><option value='wood'" + ((vals.gather == 'wood') ? " selected='selected'" : "") + ">metal</option><option value='metal'" + ((vals.gather == 'metal') ? " selected='selected'" : "")+ ">science</option>"
		var className = (vals.preset == 3) ? "windowBwMainOn" : "windowBwMainOff";
		var specialsDropdown = "<option value='fa'" + ((vals.special == 'fa') ? " selected='selected'" : "") + ">Fast Attack</option>\<option value='lc'" + ((vals.special == 'lc') ? " selected='selected'" : "") + ">Large Cache</option>\<option value='ssc'" + ((vals.special == 'ssc') ? " selected='selected'" : "") + ">Small Savory Cache</option>\<option value='swc'" + ((vals.special == 'swc') ? " selected='selected'" : "") + ">Small Wooden Cache</option>\<option value='smc'" + ((vals.special == 'smc') ? " selected='selected'" : "") + ">Small Metal Cache</option>\<option value='src'" + ((vals.special == 'src') ? " selected='selected'" : "") + ">Small Resource Cache</option>\<option value='p'" + ((vals.special == 'p') ? " selected='selected'" : "") + ">Prestigious</option>\<option value='hc'" + ((vals.special == 'hc') ? " selected='selected'" : "") + ">Huge Cache</option>\<option value='lsc'" + ((vals.special == 'lsc') ? " selected='selected'" : "") + ">Large Savory Cache</option>\<option value='lwc'" + ((vals.special == 'lwc') ? " selected='selected'" : "")+ ">Large Wooden Cache</option>\<option value='lmc'" + ((vals.special == 'lmc') ? " selected='selected'" : "")+ ">Large Metal Cache</option>"
		var potionDropdown = "<option value='h'" + ((vals.special == 'h') ? " selected='selected'" : "") + ">Herby Brew</option>\<option value='g'" + ((vals.potionstype == 'g') ? " selected='selected'" : "") + ">Gaseous Brew</option>\<option value='f'" + ((vals.potionstype == 'f') ? " selected='selected'" : "") + ">Potion of Finding</option>\<option value='v'" + ((vals.potionstype == 'v') ? " selected='selected'" : "") + ">Potion of the Void</option>\<option value='s'" + ((vals.potionstype == 's') ? " selected='selected'" : "") + ">Potion of Strength</option>"
		tooltipText += "<div id='windowRow" + x + "' class='row windowRow " + className + "'" + style + ">";
		tooltipText += "<div class='windowDelete' onclick='removeRow(" + x + ")'><span class='icomoon icon-cross'></span></div>";
		tooltipText += "<div class='windowWorld'><input value='" + vals.world + "' type='number' id='windowWorld" + x + "'/></div>";
		tooltipText += "<div class='windowCell'><input value='" + vals.cell + "' type='number' id='windowCell" + x + "'/></div>";
		if (!titleText.includes('Quagmire Farm')) tooltipText += "<div class='windowLevel'><input value='" + vals.level + "' type='number' id='windowLevel" + x + "'/></div>";
		if (titleText.includes('Time Farm')) tooltipText += "<div class='windowRepeat'><input value='" + vals.repeat + "' type='number' id='windowRepeat" + x + "'/></div>";
		if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowTributes'><input value='" + vals.tributes + "' type='number' id='windowTributes" + x + "'/></div>";
		if (titleText.includes('Tribute Farm')) tooltipText += "<div class='windowMets'><input value='" + vals.mets + "' type='number' id='windowMets" + x + "'/></div>";
		if (titleText.includes('Quagmire Farm')) tooltipText += "<div class='windowBogs'><input value='" + vals.bogs + "' type='number' id='windowBogs" + x + "'/></div>";
		if (titleText.includes('Insanity Farm')) tooltipText += "<div class='windowInsanity'><input value='" + vals.insanity + "' type='number' id='windowInsanity" + x + "'/></div>";
		if (titleText.includes('Alchemy')) tooltipText += "<div class='windowPotionType' onchange='updateWindowPreset(" + x + ")'><select value='" + vals.potionstype + "' id='windowPotionType" + x + "'>" + potionDropdown + "</select></div>"
		if (titleText.includes('Alchemy Farm')) tooltipText += "<div class='windowPotionNumber'><input value='" + vals.potionsnumber + "' type='text' id='windowPotionNumber" + x + "'/></div>";
		if (titleText.includes('Hypothermia Farm')) tooltipText += "<div class='windowBonfire'><input value='" + vals.bonfires + "' type='number' id='windowBonfire" + x + "'/></div>";
		if (titleText.includes('Time Farm') || titleText.includes('Alchemy')) tooltipText += "<div class='windowSpecial' onchange='updateWindowPreset(" + x + ")'><select value='" + vals.special + "' id='windowSpecial" + x + "'>" + specialsDropdown + "</select></div>"
		tooltipText += "</div>"
	}
	tooltipText += "<div id='windowAddRowBtn' style='display: " + ((current.length < maxSettings) ? "inline-block" : "none") + "' class='btn btn-success btn-md' onclick='addRow()'>+ Add Row</div>"
	tooltipText += "</div><div style='display: none' id='windowHelpContainer'>" + windowHelp + "</div>";
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
	lastTooltipTitle = titleText;
	
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
	loop1: 
	for (var x = 0; x < maxSettings; x++){
		var world = document.getElementById('windowWorld' + x);
		if (!world || world.value == "-1") {
			continue;
		};
		
		world = parseInt(document.getElementById('windowWorld' + x).value, 10);
		var cell = parseInt(document.getElementById('windowCell' + x).value, 10);
		if (!titleText.includes('Quag')) var level = parseInt(document.getElementById('windowLevel' + x).value, 10);
		if (titleText.includes('Time Farm')) var repeat = parseInt(document.getElementById('windowRepeat' + x).value, 10);
		if (titleText.includes('Time Farm') || titleText.includes('Alch')) var special = document.getElementById('windowSpecial' + x).value;
		if (titleText.includes('Tribute')) var tributes = parseInt(document.getElementById('windowTributes' + x).value, 10);
		if (titleText.includes('Tribute')) var mets = parseInt(document.getElementById('windowMets' + x).value, 10);
		if (titleText.includes('Quag')) var bogs = parseInt(document.getElementById('windowBogs' + x).value, 10);
		if (titleText.includes('Insanity')) var insanity = parseInt(document.getElementById('windowInsanity' + x).value, 10);
		if (titleText.includes('Alch')) var potiontype = document.getElementById('windowPotionType' + x).value;
		if (titleText.includes('Alch')) var potionnumber = parseInt(document.getElementById('windowPotionNumber' + x).value, 10);
		if (titleText.includes('Hypo')) var bonfire = parseInt(document.getElementById('windowBonfire' + x).value, 10);
		if (isNaN(world) || world < 6){
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
			tributes: tributes,
			mets: mets,
			bogs: bogs,
			insanity: insanity,
			potiontype: potiontype,
			potionnumber: potionnumber,
			bonfire: bonfire
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
	autoTrimpSettings[varPrefix+"Zone"].value = [];
	autoTrimpSettings[varPrefix+"Cell"].value  = [];
	if (!titleText.includes('Quag')) autoTrimpSettings[varPrefix+"MapLevel"].value = [];
	if (titleText.includes('Time Farm')) autoTrimpSettings[varPrefix+"Repeat"].value  = [];
	if (titleText.includes('Time Farm') || varPrefix.includes('Alch')) autoTrimpSettings[varPrefix+"Special"].value = [];
	if (titleText.includes('Tribute Farm')) autoTrimpSettings[varPrefix+"Tributes"].value = [];
	if (titleText.includes('Tribute Farm')) autoTrimpSettings[varPrefix+"Mets"].value = [];
	if (titleText.includes('Quag')) autoTrimpSettings[varPrefix+"Bog"].value = [];
	if (titleText.includes('Insanity')) autoTrimpSettings[varPrefix+"Insanity"].value = [];
	if (titleText.includes('Alch')) autoTrimpSettings[varPrefix+"Potion"].value = [];
	if (titleText.includes('Hypo')) autoTrimpSettings[varPrefix+"Bonfire"].value = [];

	for (var x = 0; x < setting.length; x++) {
			autoTrimpSettings[varPrefix+"Zone"].value[x] = setting[x].world
			autoTrimpSettings[varPrefix+"Cell"].value[x] = setting[x].cell
			if (!titleText.includes('Quag')) autoTrimpSettings[varPrefix+"MapLevel"].value[x] = setting[x].level
			if (titleText.includes('Time Farm')) autoTrimpSettings[varPrefix+"Repeat"].value[x] = setting[x].repeat
			if (titleText.includes('Time Farm') || titleText.includes('Alch')) autoTrimpSettings[varPrefix+"Special"].value[x] = setting[x].special
			if (titleText.includes('Tribute')) autoTrimpSettings[varPrefix+"Tributes"].value[x] = setting[x].tributes
			if (titleText.includes('Tribute')) autoTrimpSettings[varPrefix+"Mets"].value[x] = setting[x].mets
			if (titleText.includes('Quag')) autoTrimpSettings[varPrefix+"Bog"].value[x] = setting[x].bogs
			if (titleText.includes('Insanity')) autoTrimpSettings[varPrefix+"Insanity"].value[x] = setting[x].insanity
			if (titleText.includes('Alch')) autoTrimpSettings[varPrefix+"Potion"].value[x] = [setting[x].potiontype + setting[x].potionnumber].join()
			if (titleText.includes('Hypo')) autoTrimpSettings[varPrefix+"Bonfire"].value[x] = setting[x].bonfire
	}
	
	cancelTooltip(true);
	if (reopen) MAZLookalike(titleText, varPrefix);
	
	saveSettings();
	document.getElementById('tooltipDiv').style.overflowY = '';
}

function addRow(){
	for (var x = 0; x < 30; x++){
		var elem = document.getElementById('windowWorld' + x);
		if (!elem) continue;
		if (elem.value == -1) {
			var parent = document.getElementById('windowRow' + x);
			if (parent){
				parent.style.display = 'block';
				elem.value = game.global.world + 1 < 6 ? 6 : game.global.world + 1;
				updateWindowPreset(x);
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
	}
	btnElem.style.display = 'none'; 
}

function removeRow(index){
	var elem = document.getElementById('windowRow' + index);
	if (!elem) return;
	//document.getElementById('windowWorld' + index).value = -1;
	//document.getElementById('windowPreset' + index).value = 0;
	//document.getElementById('windowRepeat' + index).value = 0;
	//document.getElementById('windowRepeatUntil' + index).value = 0;
	elem.style.display = 'none';
	var btnElem = document.getElementById('windowAddRowBtn');
	btnElem.style.display = 'inline-block';
}

function updateWindowPreset(index){
	var special = document.getElementById('windowSpecial' + index);
	var potiontype = document.getElementById('windowPotionType' + index);
}