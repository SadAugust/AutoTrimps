// --------- Backend and helpers --------- 
var enableGraphsDebug = false;
function graphsDebug(message) {
	if (enableGraphsDebug)
		console.debug(...arguments);
}


function safeLocalStorage(name, data) {
	try {
		if (name === "portalDataCurrent") {
			// save at most every 450ms. Stringify is too expensive to run at max speed in timewarp, but still save every zone in liq otherwise
			if ((new Date() - lastSave) / 450 < 1) return
			else lastSave = new Date();
		}
		if (typeof data != "string") data = JSON.stringify(data);
		localStorage.setItem(name, data);
	} catch (e) {
		if (e.code == 22 || e.code == 1014) { // 
			// Storage full, delete oldest portal from history, and try again
			graphsDebug(`Deleting ${Object.keys(portalSaveData)[0]}, out of storage`)
			delete portalSaveData[Object.keys(portalSaveData)[0]];
			savePortalData(true);
			safeLocalStorage(name, data)
			console.debug("AT Graphs Error: LocalStorage is full. Automatically deleting a graph to clear up space.", e.code, e);
		}
	}
}

// Save Portal Data to history, or current only
function savePortalData(saveAll = true) {
	var currentPortal = getportalID();
	if (saveAll) {
		safeLocalStorage("portalDataHistory", LZString.compressToBase64(JSON.stringify(portalSaveData)))
	}
	else {
		var portalObj = {}
		portalObj[currentPortal] = portalSaveData[currentPortal];
		safeLocalStorage("portalDataCurrent", portalObj)
	}
}

// Save settings, with or without updating a key
function saveSetting(key, value) {
	if (key !== null && value !== null) GRAPHSETTINGS[key] = value;
	safeLocalStorage("GRAPHSETTINGS", GRAPHSETTINGS);
}

// returns _d _h _m _s or _._s
function formatDuration(timeSince) {
	var timeObj = {
		d: Math.floor(timeSince / 86400),
		h: Math.floor(timeSince / 3600) % 24,
		m: Math.floor(timeSince / 60) % 60,
		s: Math.floor(timeSince % 60),
	}
	var milliseconds = Math.floor(timeSince % 1 * 10)
	var timeString = "";
	var unitsUsed = 0
	for (const [unit, value] of Object.entries(timeObj)) {
		if (value === 0 && timeString === "") continue;
		unitsUsed++;
		if (value) timeString += value.toString() + unit + " ";
	}
	if (unitsUsed <= 1) {
		timeString = [timeObj.s.toString().padStart(1, "0"), milliseconds.toString(), "s"].join(".");
	}
	return timeString
}

function loadGraphData() {
	var loadedData = LZString.decompressFromBase64(localStorage.getItem("portalDataHistory"));
	var currentPortal = JSON.parse(localStorage.getItem("portalDataCurrent"));
	if (loadedData != "") {
		var loadedData = JSON.parse(loadedData);
		if (currentPortal) { loadedData[Object.keys(currentPortal)[0]] = Object.values(currentPortal)[0] }
		console.log("Graphs: Found portalSaveData")
		// remake object structure
		for (const [portalID, portalData] of Object.entries(loadedData)) {
			portalSaveData[portalID] = new Portal();
			for (const [k, v] of Object.entries(portalData)) {
				portalSaveData[portalID][k] = v;
			}
		}
	}
	var loadedSettings = JSON.parse(localStorage.getItem("GRAPHSETTINGS"));
	if (loadedSettings !== null) {
		for (const [k, v] of Object.entries(loadedSettings)) {
			GRAPHSETTINGS[k] = v;
		}
	}
	// initialize save space for the toggles
	if (GRAPHSETTINGS.toggles == null) GRAPHSETTINGS.toggles = {};
	for (const graph of graphList) {
		if (graph.toggles) {
			if (GRAPHSETTINGS.toggles[graph.id] === undefined) { GRAPHSETTINGS.toggles[graph.id] = {} }
			graph.toggles.forEach((toggle) => {
				if (GRAPHSETTINGS.toggles[graph.id][toggle] === undefined) { GRAPHSETTINGS.toggles[graph.id][toggle] = false }
			})
		}
	}
	GRAPHSETTINGS.open = false;
	MODULES.graphs = {}
	MODULES.graphs.useDarkAlways = false
}

function clearData(keepN, clrall = false) {
	// TODO it is awkward as fuck that this works on portal number, when IDs are universe + portal number.  
	// Fixing that would remove a lot of ugliness here and in deleteSpecific.
	var changed = false;
	var currentPortalNumber = getTotalPortals();
	if (clrall) { // delete all but current
		for (const [portalID, portalData] of Object.entries(portalSaveData)) {
			if (portalData.totalPortals != currentPortalNumber) {
				delete portalSaveData[portalID];
				graphsDebug(`Deleting ${portalID}, clearall ${clrall}`)
				changed = true;
			}
		}
	}
	else { // keep keepN portals, delete the rest
		var portals = Object.keys(portalSaveData);
		if (keepN < portals.length) graphsDebug(`Existing Portals (${Object.keys(portalSaveData).length}): ${Object.keys(portalSaveData)}`)
		while (keepN < portals.length) {
			var current = portals.shift();
			graphsDebug(`Deleting ${current}, keepn ${keepN}`)
			delete portalSaveData[current];
			changed = true;
		}
	}
	if (changed) {
		graphsDebug("Saving Portal Data after deletions")
		savePortalData(true)
		showHideUnusedGraphs();
	}
}

function deleteSpecific() {
	var portalNum = Number(document.getElementById("deleteSpecificTextBox").value);
	if (parseInt(portalNum) < 0) { clearData(Math.abs(portalNum)); } // keep X portals, delete the rest
	else {
		for (const [portalID, portalData] of Object.entries(portalSaveData)) {
			if (portalData.totalPortals === portalNum) {
				delete portalSaveData[portalID];
				graphsDebug(`Deleting ${portalID}, deleteSpecific`)
			}
		}
	}
	savePortalData(true)
	showHideUnusedGraphs();
}

// Custom Function Helpers
// diff between x and x-1, or x and initial
function diff(dataVar, initial) {
	return function (portal, i) {
		var e1 = portal.perZoneData[dataVar][i];
		var e2 = initial ? initial : portal.perZoneData[dataVar][i - 1];
		if (e1 === null || e2 === null) return null;
		return e1 - e2
	}
}

const formatters = {
	datetime: function () {
		var ser = this.series;
		return '<span style="color:' + ser.color + '" >●</span> ' + ser.name + ": <b>" + formatDuration(this.y / 1000) + "</b><br>";
	},
	defaultPoint: function () {
		var ser = this.series; // 'this' being the highcharts object that uses formatter()
		return '<span style="color:' + ser.color + '" >●</span> ' + ser.name + ": <b>" + prettify(this.y) + "</b><br>";
	},
	defaultAxis: function () {
		// These are Trimps format functions for durations(modified) and numbers, respectively
		if (this.dateTimeLabelFormat) return formatDuration(this.value / 1000)
		else return prettify(this.value);
	}
}

function last(arr) {
	return arr[arr.length - 1]
}

// --------- User Interface --------- 

// Create all of the UI elements and load in scripts needed
// TODO reduce screaming
function createUI() {
	var head = document.getElementsByTagName("head")[0]

	var chartscript = document.createElement("script");
	chartscript.type = "text/javascript";
	chartscript.src = "https://code.highcharts.com/highcharts.js";
	head.appendChild(chartscript);

	var graphsButton = document.createElement("TD");
	graphsButton.appendChild(document.createTextNode("Graphs"))
	graphsButton.setAttribute("class", "btn btn-default")
	graphsButton.setAttribute("onclick", "escapeATWindows(false); drawGraph(); swapGraphUniverse();");

	var settingbarRow = document.getElementById("settingsTable").firstElementChild.firstElementChild;
	settingbarRow.insertBefore(graphsButton, settingbarRow.childNodes[10])

	document.getElementById("settingsRow").innerHTML += `
    <div id="graphParent" style="display: none; height: 600px; overflow: auto; position: relative;">
      <div id="graph" style="margin-bottom: 10px;margin-top: 5px; height: 530px;"></div>
      <div id="graphFooter" style="height: 50px;font-size: 1em;">
        <div id="graphFooterLine1" style="display: -webkit-flex;flex: 0.75;flex-direction: row; height:30px;"></div>
        <div id="graphFooterLine2"></div>
      </div>
    </div>
    `;

	function createSelector(id, sourceList, textMod = "", onchangeMod = "") {
		var selector = document.createElement("select");
		selector.id = id;
		selector.setAttribute("style", "");
		selector.setAttribute("onchange", "saveSetting(this.id, this.value); drawGraph();" + onchangeMod);
		for (var item of sourceList) {
			var opt = document.createElement("option");
			opt.value = item;
			opt.text = textMod + item;
			selector.appendChild(opt);
		}
		//selector.value = GRAPHSETTINGS[selector.id]
		return selector;
	}

	// Create Universe and Graph selectors
	var universeFooter = document.getElementById("graphFooterLine1");
	[
		["universeSelection", [1, 2], "Universe ", " swapGraphUniverse();"],
		["u1graphSelection", graphList.filter((g) => g.universe == 1 || !g.universe).map((g) => g.selectorText)],
		["u2graphSelection", graphList.filter((g) => g.universe == 2 || !g.universe).map((g) => g.selectorText)]
	].forEach((opts) => universeFooter.appendChild(createSelector(...opts)))

	universeFooter.innerHTML += `
    <div><button onclick="drawGraph()" style="margin-left:0.5em;">Refresh</button></div>
    <div style="flex:0 100 5%;"></div>
    <div><input type="checkbox" id="clrChkbox" onclick="toggleClearButton();"></div>
    <div style="margin-left: 0.5vw;">
      <button id="clrAllDataBtn" onclick="clearData(null,true); drawGraph();" class="btn" disabled="" style="flex:auto; padding: 2px 6px;border: 1px solid white;">
        Clear All Previous Data</button></div>
    <div style="flex:0 100 5%;"></div>
    <div style="flex:0 2 3.5vw;"><input style="width:100%;min-width: 40px;" id="deleteSpecificTextBox"></div>
    <div style="flex:auto; margin-left: 0.5vw;"><button onclick="deleteSpecific(); drawGraph();">Delete Specific Portal</button></div>
    <div style="float:right; margin-right: 0.5vw;"><button onclick="toggleSpecificGraphs()">Invert Selection</button></div>
    <div style="float:right; margin-right: 1vw;"><button onclick="toggleAllGraphs()">All Off/On</button></div>`

	// AAAAAAAAAAAAAAAAAAAAAAAAAAAA (Setting the inner HTML of the parent element resets the value of these? what the fuck)
	// default to Current Universe + Clear Time if no user data exists
	document.querySelector("#universeSelection").value = GRAPHSETTINGS.universeSelection || "Universe " + getGameData.universe();
	document.querySelector("#u1graphSelection").value = GRAPHSETTINGS.u1graphSelection || "Clear Time";
	document.querySelector("#u2graphSelection").value = GRAPHSETTINGS.u2graphSelection || "Clear Time";

	var tipsText = "You can zoom by dragging a box around an area. You can turn portals off by clicking them on the legend. Quickly view the last portal by clicking it off, then Invert Selection. Or by clicking All Off, then clicking the portal on. To delete a portal, Type its portal number in the box and press Delete Specific. Using negative numbers in the Delete Specific box will KEEP that many portals (starting counting backwards from the current one), ie: if you have Portals 1000-1015, typing -10 will keep 1005-1015."
	document.getElementById("graphFooterLine2").innerHTML += `
    <span style="float: left;" onmouseover='tooltip("Tips", "customText", event, "${tipsText}")' onmouseout='tooltip("hide")'>Tips: Hover for usage tips.</span>
    <span style="float: left; margin-left: 2vw"><input type="checkbox" id="liveCheckbox" onclick="saveSetting('live', this.checked);"> Live Updates</span>
    <span style="float: left; margin-left: 2vw">Displayed Portals: <input style="width:40px;" id="portalCountTextBox" onchange="saveSetting('portalsDisplayed', this.value); updateGraph();"></span>
    <span style="float: left; margin-left: 2vw">Saved Portals: <input style="width:40px;" id="portalsSavedTextBox" onchange="saveSetting('maxGraphs', this.value); clearData(this.value); updateGraph();"></span>
    <input onclick="toggleDarkGraphs()" style="height: 20px; float: right; margin-right: 0.5vw;" type="checkbox" id="blackCB">
    <span style="float: right; margin-right: 0.5vw;">Black Graphs:</span>
    `;

	// Add a header with negative float hanging down on the top of the graph, for toggle buttons
	var toggleDiv = document.createElement("div");
	toggleDiv.id = "toggleDiv";
	toggleDiv.setAttribute("style", "position: absolute; top: 1rem; left: 3rem; z-index: 1;")
	toggleDiv.innerText = ""
	document.querySelector("#graphParent").appendChild(toggleDiv);


	// Adjust UI elements for Trimps Theme changes
	MODULES.graphs.themeChanged = function () {
		if (game && game.options.menu.darkTheme.enabled != lastTheme) {
			function f(h) {
				h.style.color = 2 == game.options.menu.darkTheme.enabled ? "" : "black";
			}
			function g(h) {
				if ("graphSelection" == h.id) return void (2 != game.options.menu.darkTheme.enabled && (h.style.color = "black"));
			}
			toggleDarkGraphs();
			var c = document.getElementsByTagName("input");
			var d = document.getElementsByTagName("select");
			var e = document.getElementById("graphFooterLine1").children;
			for (var h of c) f(h);
			for (var h of d) f(h);
			for (var h of e) f(h);
			for (var h of e) g(h);
		}
		game && (lastTheme = game.options.menu.darkTheme.enabled);
	}

	document.querySelector("#blackCB").checked = GRAPHSETTINGS.darkTheme;
	document.querySelector("#portalCountTextBox").value = GRAPHSETTINGS.portalsDisplayed;
	document.querySelector("#portalsSavedTextBox").value = GRAPHSETTINGS.maxGraphs;
	document.querySelector("#liveCheckbox").checked = GRAPHSETTINGS.live;
	MODULES.graphs.themeChanged();

}

// Show/hide the universe-specific graph selectors
function swapGraphUniverse() {
	var universe = GRAPHSETTINGS.universeSelection;
	var active = `u${universe}`
	var inactive = `u${universe == 1 ? 2 : 1}`
	document.getElementById(`${active}graphSelection`).style.display = '';
	document.getElementById(`${inactive}graphSelection`).style.display = 'none';
}

function toggleClearButton() {
	document.getElementById("clrAllDataBtn").disabled = !document.getElementById("clrChkbox").checked;
}

function toggleDarkGraphs() {
	if (game) {
		var darkcss = document.getElementById("dark-graph.css")
		var dark = document.getElementById("blackCB").checked;
		saveSetting("darkTheme", dark)
		if (!darkcss && dark) {
			var b = document.createElement("link");
			b.rel = "stylesheet";
			b.type = "text/css";
			b.id = "dark-graph.css";
			b.href = basepath + "dark-graph.css";
			document.head.appendChild(b);
			graphsDebug("Adding dark-graph.css file", "graphs");
		}
		else if (darkcss && !dark) {
			document.head.removeChild(darkcss)
			graphsDebug("Removing dark-graph.css file", "graphs")
		}
	}
}

// Toggle AT windows with UI, or force close with Esc
function escapeATWindows(escPressed = true) {
	var a = document.getElementById("tooltipDiv");
	if (a.style.display != "none") return void cancelTooltip(); // old code, uncertain what it's for or why it's here.
	for (elemId of ["autoSettings", "autoTrimpsTabBarMenu", "graphParent"]) {
		var elem = document.getElementById(elemId);
		if (!elem) continue;
		if (elemId === "graphParent") { // toggle Graphs window
			var open = elem.style.display === "block";
			if (escPressed) open = true; // override to always close
			elem.style.display = open ? "none" : "block";
			GRAPHSETTINGS.open = !open;
			trimpStatsDisplayed = !open; // HACKS disable hotkeys without touching Trimps settings
		}
		else { elem.style.display = "none"; } // close other windows
	}
}

// Listen for Esc key presses, somehow.  This is ancient eldritch mess, but it works?  
document.addEventListener(
	"keydown",
	function (a) {
		1 != game.options.menu.hotkeys.enabled || game.global.preMapsActive || game.global.lockTooltip
			|| ctrlPressed || heirloomsShown || 27 != a.keyCode || escapeATWindows();
	},
	true
);

// --------- Graph handling ---------

function Graph(dataVar, universe, selectorText, additionalParams = {}) {
	// graphTitle, customFunction, useAccumulator, xTitle, yTitle, formatter, xminFloor, yminFloor, yType
	this.dataVar = dataVar
	this.universe = universe; // false, 1, 2
	this.selectorText = selectorText ? selectorText : dataVar;
	this.id = selectorText.replace(/ /g, "_")
	this.graphTitle = this.selectorText;
	this.graphType = "line"
	this.customFunction;
	this.useAccumulator;
	this.xTitle = "Zone";
	this.yTitle = this.selectorText;
	this.formatter = formatters.defaultPoint;
	this.xminFloor = 1;
	this.yminFloor;
	this.yType = "Linear";
	this.graphData = [];
	this.typeCheck = "number"
	this.conditional = () => { return true };
	for (const [key, value] of Object.entries(additionalParams)) {
		this[key] = value;
	}
	this.baseGraphTitle = this.graphTitle;

	// create an object to pass to Highcharts.Chart
	this.createHighChartsObj = function () {
		return {
			chart: {
				renderTo: "graph",
				zoomType: "xy",
				animation: false,
				resetZoomButton: {
					position: {
						align: "right",
						verticalAlign: "top",
						x: -20,
						y: 15,
					},
					relativeTo: "chart",
				},
			},
			colors: ["#e60049", "#0bb4ff", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4", "#b3d4ff", "#00bfa0"],
			title: {
				text: this.graphTitle,
				x: -20,
			},
			plotOptions: {
				series: {
					lineWidth: 1,
					animation: false,
					marker: {
						enabled: false,
					},
				},
			},
			xAxis: {
				floor: this.xminFloor,
				title: {
					text: this.xTitle,
				},
			},
			yAxis: {
				floor: this.yminFloor,
				title: {
					text: this.yTitle,
				},
				plotLines: [
					{
						value: 0,
						width: 1,
						color: "#808080",
					},
				],
				type: this.yType,
				labels: {
					formatter: formatters.defaultAxis
				},
				endOnTick: false,
				maxPadding: .05,
			},
			tooltip: {
				pointFormatter: this.formatter,
			},
			legend: {
				layout: "vertical",
				align: "right",
				verticalAlign: "middle",
				borderWidth: 0,
			},
			series: this.graphData,
			additionalParams: {},
		}
	}
	// Main Graphing function
	this.updateGraph = function () {
		var HighchartsObj;
		if (this.graphType == "line") HighchartsObj = this.lineGraph();
		if (this.graphType == "column") HighchartsObj = this.columnGraph();
		saveSelectedGraphs();
		chart1 = new Highcharts.Chart(HighchartsObj);
		applyRememberedSelections();
	}
	// prepares data series for Highcharts, and optionally transforms it with toggled options, customFunction and useAccumulator
	this.lineGraph = function () {
		var highChartsObj = this.createHighChartsObj() // make default object, to be customized as needed
		var item = this.dataVar;
		this.graphData = [];
		this.useAccumulator = false; // HACKS ( only one set of graphs uses an accumulator and it's on a toggle )
		var maxS3 = Math.max(...Object.values(portalSaveData).map((portal) => portal.s3).filter((s3) => s3));
		var activeToggles = [];
		if (this.toggles) {
			// Modify the chart area based on the toggles active
			activeToggles = Object.keys(toggledGraphs).filter(toggle => GRAPHSETTINGS.toggles[this.id][toggle])
			activeToggles.forEach(toggle => toggledGraphs[toggle].graphMods(this, highChartsObj)); // 
		}
		// parse data per portal
		var portalCount = 0;
		for (const portal of Object.values(portalSaveData).reverse()) {
			if (!(item in portal.perZoneData)) continue; // ignore blank
			if (portal.universe != GRAPHSETTINGS.universeSelection) continue; // ignore inactive universe
			var cleanData = [];
			// parse the requested datavar
			for (const index in portal.perZoneData[item]) {
				var x = portal.perZoneData[item][index];
				var time = portal.perZoneData.currentTime[index];
				if (typeof this.customFunction === "function") {
					x = this.customFunction(portal, index);
					if (x < 0) x = null;
				}
				// TOGGLES
				if (activeToggles.includes("perZone")) {  // must always be first 
					[x, time] = toggledGraphs.perZone.customFunction(portal, item, index, x);
				}
				for (toggle of activeToggles.filter(x => x != "perZone")) {
					try { x = toggledGraphs[toggle].customFunction(portal, item, index, x, time, maxS3); }
					catch (e) {
						x = 0;
						graphsDebug(`Error graphing data on: ${item} ${toggle}, ${e.message}`)
					}
				}
				if (this.useAccumulator) { x += last(cleanData) !== undefined ? last(cleanData)[1] : 0; }
				if (this.typeCheck && typeof x != this.typeCheck) x = null;
				cleanData.push([Number(index), x]) // highcharts expects number, number, not str, number
			}
			if (activeToggles.includes("perZone") && ["fluffy", "scruffy"].includes(item)) {
				cleanData.splice(cleanData.length - 1); // current zone is too erratic to include due to weird order of granting fluffy exp 
			}
			this.graphData.push({
				name: `Portal ${portal.totalPortals}: ${portal.challenge}`,
				data: cleanData,
			})
			portalCount++;
			if (portalCount >= GRAPHSETTINGS.portalsDisplayed) break;
		}
		this.graphData = this.graphData.reverse();
		highChartsObj.series = this.graphData;
		return highChartsObj;
	}
	// prepares multi-column data series from per-portal data.
	this.columnGraph = function () {
		var highChartsObj = this.createHighChartsObj() // make default object, to be customized as needed
		highChartsObj.xAxis.title.text = "Portal"
		highChartsObj.plotOptions.series = { groupPadding: .2, pointPadding: 0, animation: false, borderColor: "black" }
		// set up axes for each column so they scale independently
		var activeColumns = this.columns.filter(column => !(column.universe && column.universe != GRAPHSETTINGS.universeSelection));
		if (GRAPHSETTINGS.toggles[this.id].perHr) { // disable time when comparing things over time.  x/x is not interesting data.
			toggledGraphs.perHr.graphMods(false, highChartsObj)
			activeColumns = activeColumns.filter(column => column.dataVar !== "currentTime")
		}
		// all of the yaxes showing is just visual noise, all invisible hurts me, but I have no good alternatives
		var axes = activeColumns.map(column => { return { visible: false, endOnTick: false } });

		this.graphData = [];
		var yAxis = 0;
		for (const column of activeColumns) {
			var cleanData = []
			var currUniPortals = Object.values(portalSaveData).filter(portal => portal.universe == GRAPHSETTINGS.universeSelection);
			for (const portal of Object.values(currUniPortals).slice(Math.max(Object.values(currUniPortals).length - GRAPHSETTINGS.portalsDisplayed, 0))) {
				//if (portal.universe != GRAPHSETTINGS.universeSelection) continue;
				var data = undefined;
				if (portal[column.dataVar]) { data = portal[column.dataVar]; }
				if (portal.perZoneData[column.dataVar]) {
					var max = last(portal.perZoneData[column.dataVar]);
					if (!max) max = Math.max(...portal.perZoneData[column.dataVar].filter(Number.isFinite))
					data = max;
				}
				if (column.customFunction) { data = column.customFunction(portal, data); }
				if (GRAPHSETTINGS.toggles[this.id].perHr) { // HACKS a headache for future me if other toggles are wanted here.
					data = data / (last(portal.perZoneData.currentTime) / 3600000);
				}
				cleanData.push([portal.totalPortals, data])
			}
			var series = {
				name: column.title,
				data: cleanData,
				type: "column",
				yAxis: yAxis,
				color: column.color,
			}
			if (column.dataVar === "currentTime") { // HACKS override formatter for time vars
				series["tooltip"] = { "pointFormatter": formatters.datetime }
			}
			this.graphData.push(series);
			yAxis += 1;
		}
		// reduce padding between portals as portals increase
		highChartsObj.plotOptions.series["groupPadding"] = .5 / this.graphData[0].data.length ** .6;
		if (this.graphData[0].data.length > 15) {
			highChartsObj.plotOptions.series["borderWidth"] = 0.1;
		}

		highChartsObj.yAxis = axes;
		highChartsObj.series = this.graphData;
		return highChartsObj;
	}
}

function lookupGraph(selectorText) {
	for (const graph of graphList) {
		if (graph.selectorText === selectorText) return graph;
	}
}

// Draws the graph currently selected by the user
function drawGraph() {
	// TOGGLES
	function makeCheckbox(graph, toggle) {
		// create checkbox element labeled with the toggle
		var container = document.createElement("span")
		var checkbox = document.createElement("input");
		var label = document.createElement("span");

		container.style.padding = "0rem .5rem";

		checkbox.type = "checkbox";
		checkbox.id = toggle;
		// initialize the checkbox to saved value
		checkbox.checked = GRAPHSETTINGS.toggles[graph][toggle];
		// create a godawful inline function to set saved value on change, apply exclusions, and update the graph
		var funcString = "";
		if (toggledGraphs[toggle] && toggledGraphs[toggle].exclude) {
			toggledGraphs[toggle].exclude.forEach(exTog => funcString += `GRAPHSETTINGS.toggles.${graph}.${exTog} = false; `)
		}
		funcString += `GRAPHSETTINGS.toggles.${graph}.${toggle} = this.checked; drawGraph();`
		checkbox.setAttribute("onclick", funcString);

		label.innerText = toggle;
		label.style.color = "#757575";

		container.appendChild(checkbox)
		container.appendChild(label)
		return container;
	}
	pushData(); // update current zone data on request
	updateGraph();
	var universe = GRAPHSETTINGS.universeSelection;
	var selectedGraph = document.getElementById(`u${universe}graphSelection`);
	if (selectedGraph.value) {
		// draw the graph
		var graph = lookupGraph(selectedGraph.value);
		// create toggle elements
		toggleDiv = document.querySelector("#toggleDiv")
		toggleDiv.innerHTML = "";
		if (graph.toggles) {
			for (const toggle of graph.toggles) {
				toggleDiv.appendChild(makeCheckbox(graph.id, toggle))
			}
		}
	}
	showHideUnusedGraphs();
}

function updateGraph() {
	var universe = GRAPHSETTINGS.universeSelection;
	var selectedGraph = document.getElementById(`u${universe}graphSelection`);
	if (selectedGraph.value) {
		// draw the graph
		var graph = lookupGraph(selectedGraph.value);
		graph.updateGraph();
	}
}

// Hide graphs that have no collected data
function showHideUnusedGraphs() {
	var activeUniverses = [];
	for (const graph of graphList) {
		if (graph.graphType != "line") continue; // ignore column graphs (pure laziness, the only two always exist anyways)
		const universes = graph.universe ? [graph.universe] : [1, 2]
		for (const universe of universes) {
			var style = "none"
			for (portal of Object.values(portalSaveData)) {
				if (portal.perZoneData[graph.dataVar] && portal.universe === universe  // has collected data, in the right universe
					&& new Set(portal.perZoneData[graph.dataVar].filter(x => x)).size > 1) { // and there is nonzero, variable data
					style = ""
					if (!activeUniverses.includes(universe)) activeUniverses.push(universe);
					break;
				}
			}
			// hide unused graphs
			document.querySelector(`#u${universe}graphSelection [value="${graph.selectorText}"]`).style.display = style;
		}
	}
	// hide universe selector if graphs are only in one universe
	var universeSel = document.querySelector(`#universeSelection`);
	if (activeUniverses.length === 1) {
		universeSel.style.display = "none";
		GRAPHSETTINGS.universeSelection = activeUniverses[0];
		swapGraphUniverse()
	}
	else {
		universeSel.style.display = "";
	}
}

// Graph Selection 

function saveSelectedGraphs() {
	if (!chart1) return;
	for (var i = 0; i < chart1.series.length; i++) {
		GRAPHSETTINGS.rememberSelected[i] = chart1.series[i].visible;
	}
	saveSetting();
}
function applyRememberedSelections() {
	if (chart1.series.length !== GRAPHSETTINGS.rememberSelected.length) {
		GRAPHSETTINGS.rememberSelected = [] // if the graphlist changes, order is no longer guaranteed
	}
	for (var i = 0; i < chart1.series.length; i++) {
		if (GRAPHSETTINGS.rememberSelected[i] === false) { chart1.series[i].hide(); }
	}
}
function toggleSpecificGraphs() {
	for (const chart of chart1.series) {
		chart.visible ? chart.hide() : chart.show();
	}
}
// toggle all graphs to the opposite of the average visible/hidden state
function toggleAllGraphs() {
	var visCount = 0;
	chart1.series.forEach(chart => visCount += chart.visible)
	for (const chart of chart1.series) {
		visCount > chart1.series.length / 2 ? chart.hide() : chart.show();
	}
}

// --------- Portal and Game data handling ---------

// Stores and updates data for an individual portal
function Portal() {
	this.universe = getGameData.universe();
	this.totalPortals = getTotalPortals();
	this.challenge = getGameData.challengeActive() === 'Daily'
		? getCurrentChallengePane().split('.')[0].substr(13).slice(0, 16) // names dailies by their start date, only moderately cursed
		: getGameData.challengeActive();
	this.initialNullifium = game.global.nullifium;
	this.totalNullifium = getGameData.nullifium();
	this.totalVoidMaps = getGameData.totalVoids();
	this.cinf = getGameData.cinf();
	if (this.universe === 1) {
		this.totalHelium = game.global.totalHeliumEarned;
		this.initialFluffy = getGameData.fluffy() - game.stats.bestFluffyExp.value; // adjust for mid-run graph start
		this.initialDE = getGameData.essence();
	}
	if (this.universe === 2) {
		this.totalRadon = game.global.totalRadonEarned;
		this.initialScruffy = getGameData.scruffy() - game.stats.bestFluffyExp2.value; // adjust for mid-run graph start
		this.initialMutes = getGameData.mutatedSeeds();
		this.s3 = getGameData.s3();
	}
	// create an object to collect only the relevant data per zone, without fromEntries because old JS
	this.perZoneData = {};
	var perZoneItems = graphList.filter((graph) =>
		(graph.universe == this.universe || !graph.universe) // only save data relevant to the current universe
		&& graph.conditional() && graph.dataVar) // and for relevant challenges, with datavars 
		.map((graph) => graph.dataVar)
		.concat(["currentTime", "mapCount", "timeOnMap"]); // always graph time vars
	perZoneItems.forEach((name) => this.perZoneData[name] = []);

	// update per zone data and special totals
	this.update = function (fromMap) { // check source of the update
		const world = getGameData.world();
		this.totalNullifium = game.global.nullifium - this.initialNullifium + getGameData.nullifium();
		this.totalVoidMaps = getGameData.totalVoids();
		for (const [name, data] of Object.entries(this.perZoneData)) {
			if (world + 1 < data.length) { // FENCEPOSTING (zones are 1 indexed)
				data.splice(world + 1) // trim 'future' zones on reload
			}
			if (name === "timeOnMap") {
				var timeOnMap = getGameData.timeOnMap();
				if (fromMap) { data[world] = data[world] + timeOnMap || timeOnMap; } // additive per map within a zone
				continue;
			}
			if (name === "mapCount") {
				if (fromMap && game.global.mapsActive) { data[world] = data[world] + 1 || 1; } // start at 1 because the hook in is before the map is started/finished
				continue;
			}
			if (name === "c23increase") {
				data[world] = Math.max(getGameData[name](), data[world] || 0);
				continue;
			}
			data[world] = getGameData[name]();
		}
	}
}

function getportalID() { return `u${getGameData.universe()} p${getTotalPortals()}` }

function pushData(fromMap) {
	//debug("Starting Zone " + getGameData.world(), "graphs");
	const portalID = getportalID();
	if (!portalSaveData[portalID] || getGameData.world() === 1) { // reset portal data if restarting a portal
		savePortalData(true) // save old portal to history
		portalSaveData[portalID] = new Portal();
		clearData(GRAPHSETTINGS.maxGraphs); // clear out old portals
	}
	portalSaveData[portalID].update(fromMap);
	savePortalData(false) // save current portal
	if (GRAPHSETTINGS.live && GRAPHSETTINGS.open) {
		updateGraph();
	}
}

const getGameData = {
	currentTime: () => { return getGameTime() - game.global.portalTime }, // portalTime changes on pause, 'when a portal started' is not a static concept
	timeOnMap: () => {
		// TODO this time is wrong if the player sits in map chamber.  Then again, they might want that time included in 'map' time.
		var annoyingRemainder = 0;
		if (game.global.mapStarted < game.global.zoneStarted) {
			annoyingRemainder = getGameTime() - game.global.mapStarted;
		}
		return getGameTime() - game.global.mapStarted - annoyingRemainder;
	},
	world: () => { return game.global.world },
	challengeActive: () => { return game.global.challengeActive },
	voids: () => { return game.global.totalVoidMaps },
	totalVoids: () => { return game.stats.totalVoidMaps.value },
	nullifium: () => { return recycleAllExtraHeirlooms(true) },
	coord: () => { return game.upgrades.Coordination.allowed - game.upgrades.Coordination.done },
	overkill: () => {
		// overly complex check for Liq, overly fragile check for overkill cells. please rewrite this at some point.
		if (game.options.menu.overkillColor.enabled == 0) toggleSetting("overkillColor");
		if (game.options.menu.liquification.enabled && game.talents.liquification.purchased && !game.global.mapsActive && game.global.gridArray && game.global.gridArray[0] && game.global.gridArray[0].name == "Liquimp")
			return 100;
		else return document.getElementById("grid").getElementsByClassName("cellColorOverkill").length;
	},
	zoneTime: () => { return Math.round((getGameTime() - game.global.zoneStarted) * 100) / 100 }, // rounded to x.xs, not used
	mapbonus: () => { return game.global.mapBonus },
	empower: () => { return game.global.challengeActive == "Daily" && typeof game.global.dailyChallenge.empower !== "undefined" ? game.global.dailyChallenge.empower.stacks : 0 },
	lastWarp: () => { return game.global.lastWarp },
	essence: () => { return game.global.spentEssence + game.global.essence },
	heliumOwned: () => { return game.resources.helium.owned },
	//magmite: () => { return game.global.magmite },
	//magmamancers: () => { return game.jobs.Magmamancer.owned },
	fluffy: () => {
		// cap exp at maximum for an evo, because Trimps doesn't do it and it causes horrible horrible bugs
		var maxExp = Math.floor((1000 * Math.pow(5, Fluffy.getCurrentPrestige())) * ((Math.pow(4, 10) - 1) / (4 - 1)))
		var exp = Math.min(game.global.fluffyExp, maxExp);
		//sum of all previous evo costs + current exp, because Trimps doesn't store this
		for (var evo = 0; evo < Fluffy.getCurrentPrestige(); evo++) {
			exp += Math.floor((1000 * Math.pow(5, evo)) * ((Math.pow(4, 10) - 1) / (4 - 1)));;
		}
		return exp
	},
	//nursery: () => { return game.buildings.Nursery.purchased },
	amals: () => { return game.jobs.Amalgamator.owned },
	wonders: () => { return game.challenges.Experience.wonders },
	scruffy: () => { return game.global.fluffyExp2 },
	smithies: () => { return game.buildings.Smithy.owned },
	radonOwned: () => { return game.resources.radon.owned },
	worshippers: () => { return game.jobs.Worshipper.owned },
	bonfires: () => { return game.challenges.Hypothermia.bonfires },
	embers: () => { return game.challenges.Hypothermia.embers },
	cruffys: () => { return game.challenges.Nurture.level },
	universe: () => { return game.global.universe },
	s3: () => { return game.global.lastRadonPortal },
	u1hze: () => { return game.global.highestLevelCleared },
	u2hze: () => { return game.global.highestRadonLevelCleared },
	c23increase: () => {
		if (game.global.challengeActive !== "" && game.global.runningChallengeSquared) {
			// (mostly) Trimps code
			var challenge = game.global.challengeActive;
			var challengeList = game.challenges[challenge].multiChallenge || [challenge];
			var totalDif = 0;
			for (var x = 0; x < challengeList.length; x++) {
				var challengeName = challengeList[x];
				challenge = game.challenges[challengeName];
				var dif = getIndividualSquaredReward(challengeName, game.global.world) - getIndividualSquaredReward(challengeName);
				totalDif += dif;
			}
			return Math.max(0, totalDif);
		}
		else { return 0; }
	},
	cinf: () => { return countChallengeSquaredReward(false, false, true) },
	mutatedSeeds: () => { return game.global.mutatedSeedsSpent + game.global.mutatedSeeds }
}

// --------- Data structures ---------

// Create all the Graph objects
// Graph(dataVar, universe, selectorText, additionalParams)
// additionalParams include graphTitle, conditional, customFunction, useAccumulator, toggles, xTitle, yTitle, formatter

// To add a new graph, add it to graphList with the desired options,
// If using a new dataVar, add that to getGameData
// To make a new toggle, add the required logic to toggledGraphs

const graphList = [
	new Graph("currentTime", false, "Clear Time", {
		yType: "datetime",
		formatter: formatters.datetime,
		toggles: ["perZone", "mapTime", "mapCount"],
		// , "mapPct" TODO having issues with accumulators on this one, more trouble than it's worth given nobody asked for it
	}),
	// U1 Graphs
	new Graph("heliumOwned", 1, "Helium", {
		toggles: ["perHr", "perZone", "lifetime"]
	}),
	new Graph("fluffy", 1, "Fluffy Exp", {
		conditional: () => { return getGameData.u1hze() >= 299 && getGameData.fluffy() < 4266662510275000 }, // pre unlock, post E10L10
		customFunction: (portal, i) => { return diff("fluffy", portal.initialFluffy)(portal, i) },
		toggles: ["perHr", "perZone",]
	}),
	new Graph("essence", 1, "Dark Essence", {
		conditional: () => { return getGameData.essence() < 5.826e+39 },
		customFunction: (portal, i) => { return diff("essence", portal.initialDE)(portal, i) },
		toggles: ["perHr", "perZone",],
		xminFloor: 181,
	}),
	new Graph("lastWarp", 1, "Warpstations", {
		graphTitle: "Warpstations built on previous Giga",
		conditional: () => { return getGameData.u1hze() >= 59 && ((game.global.totalHeliumEarned - game.global.heliumLeftover) < 10 ** 10) }, // Warp unlock, less than 10B He allocated
		xminFloor: 60,
	}),
	new Graph("amals", 1, "Amalgamators"),
	new Graph("wonders", 1, "Wonders", {
		conditional: () => { return getGameData.challengeActive() === "Experience" },
		xminFloor: 300,
	}),

	// U2 Graphs
	new Graph("radonOwned", 2, "Radon", {
		toggles: ["perHr", "perZone", "lifetime", "s3normalized"]
	}),
	new Graph("scruffy", 2, "Scruffy Exp", {
		customFunction: (portal, i) => { return diff("scruffy", portal.initialScruffy)(portal, i) },
		toggles: ["perHr", "perZone",]
	}),
	new Graph("mutatedSeeds", 2, "Mutated Seeds", {
		conditional: () => { return getGameData.u2hze() >= 200 },
		customFunction: (portal, i) => { return diff("mutatedSeeds", portal.initialMutes)(portal, i) },
		toggles: ["perHr", "perZone"],
		xminFloor: 200,
	}),
	new Graph("worshippers", 2, "Worshippers", {
		conditional: () => { return getGameData.u2hze() >= 49 },
		xminFloor: 50,
	}),
	new Graph("smithies", 2, "Smithies"),
	new Graph("bonfires", 2, "Bonfires", {
		graphTitle: "Active Bonfires",
		conditional: () => { return getGameData.challengeActive() === "Hypothermia" }
	}),
	new Graph("embers", 2, "Embers", {
		conditional: () => { return getGameData.challengeActive() === "Hypothermia" }
	}),
	new Graph("cruffys", 2, "Cruffys", {
		conditional: () => { return getGameData.challengeActive() === "Nurture" }
	}),

	// Generic Graphs
	new Graph("c23increase", false, "C2 Bonus", {
		conditional: () => { return game.global.runningChallengeSquared },
		toggles: ["perHr", "perZone", "lifetime"]
	}),
	new Graph("voids", false, "Void Map History", {
		graphTitle: "Void Map History (voids finished during the same level acquired are not counted/tracked)",
		yTitle: "Number of Void Maps",
	}),
	new Graph("coord", false, "Coordinations", {
		graphTitle: "Unbought Coordinations",
	}),
	new Graph("overkill", false, "Overkill Cells", {
		// Overkill unlock zones (roughly)
		conditional: () => {
			return ((getGameData.universe() == 1 && getGameData.u1hze() >= 169)
				|| (getGameData.universe() == 2 && getGameData.u2hze() >= 200))
		}
	}),
	new Graph("mapbonus", false, "Map Bonus"),
	new Graph("empower", false, "Empower", {
		conditional: () => { return getGameData.challengeActive() === "Daily" && typeof game.global.dailyChallenge.empower !== "undefined" }
	}),
	new Graph(false, false, "Portal Stats", {
		graphTitle: "Portal Stats",
		graphType: "column",
		toggles: ["perHr"],
		columns: [
			{ dataVar: "totalVoidMaps", title: "Voids", color: "#4d0e8c" },
			{ dataVar: "totalNullifium", title: "Nu", color: "#8a008a" },
			{ dataVar: "heliumOwned", universe: 1, title: "Helium", color: "#5bc0de" },
			{ dataVar: "radonOwned", universe: 2, title: "Radon", color: "#5bc0de" },
			{ dataVar: "fluffy", universe: 1, title: "Pet Exp", color: "green", customFunction: (portal, x) => { return x - portal.initialFluffy } },
			{ dataVar: "scruffy", universe: 2, title: "Pet Exp", color: "green", customFunction: (portal, x) => { return x - portal.initialScruffy } },
			{ dataVar: "c23increase", title: "C2 Bonus", color: "#003b99" },
			{ dataVar: "world", title: "Zone Reached", color: "#a16e08", customFunction: (portal, x) => { return portal.perZoneData.mapbonus.length - 1 } },
			{ dataVar: "currentTime", title: "Run Time", type: "datetime", color: "#928DAD" }, // TODO some vars should be on shared axes... woo
			//{ dataVar: "timeOnMap", title: "Mapping Time", type: "datetime", customFunction: () => { } }, // TODO should be sum not max
		],
	}),
]

// rules for toggle based graphs
const toggledGraphs = {
	mapCount: {
		exclude: ["mapTime", "mapPct"],
		graphMods: (graph, highChartsObj) => {
			highChartsObj.tooltip = { pointFormatter: formatters.defaultPoint };
			highChartsObj.yAxis.type = "Linear";
			highChartsObj.title.text = "Maps Run"
			highChartsObj.yAxis.title.text = "Maps Run"
			graph.useAccumulator = true;
		},
		customFunction: (portal, item, index, x) => {
			x = portal.perZoneData.mapCount[index] || 0;
			return x
		}
	},
	mapTime: {
		exclude: ["mapCount", "mapPct"],
		graphMods: (graph, highChartsObj) => {
			highChartsObj.title.text = "Time in Maps";
			graph.useAccumulator = true;
		},
		customFunction: (portal, item, index, x) => {
			x = portal.perZoneData.timeOnMap[index] || 0;
			return x;
		}
	},
	mapPct: { // not used
		exclude: ["mapCount", "mapTime"],
		graphMods: (graph, highChartsObj) => {
			highChartsObj.tooltip = { pointFormatter: formatters.defaultPoint };
			highChartsObj.yAxis.type = "Linear"
			highChartsObj.title.text = "% of Clear time spent Mapping"
			highChartsObj.yAxis.title.text = "% Clear Time"
			graph.useAccumulator = true;
		},
		customFunction: (portal, item, index, x) => {
			x = portal.perZoneData.timeOnMap[index] / x || 0;
			return x;
		}
	},
	perZone: {
		graphMods: (graph, highChartsObj) => {
			highChartsObj.title.text += " each Zone"
			graph.useAccumulator = false // HACKS this might be incredibly stupid, find out later when you use this option for a different case!
		},
		customFunction: (portal, item, index, x) => {
			// TODO getting moderately ridiculous here on the 'not 0 but falsy' check
			// check for missing data, or start of data
			if (portal.perZoneData[item][index - 1] !== undefined && portal.perZoneData[item][index - 1] !== null
				&& portal.perZoneData[item][index] !== undefined && portal.perZoneData[item][index] !== null) {
				var x = portal.perZoneData[item][index] - portal.perZoneData[item][index - 1]
				x = Math.max(0, x) // there should be no values that are negative, outside weird data edge cases that we don't want to display
				var time = portal.perZoneData.currentTime[index] - portal.perZoneData.currentTime[index - 1]
			}
			else {
				x = 0
				time = 0
			}
			return [x, time];
		}
	},
	perHr: {
		graphMods: (graph, highChartsObj) => {
			highChartsObj.title.text += " / Hour"
		},
		customFunction: (portal, item, index, x, time) => {
			if (x) { x = x / (time / 3600000) }
			return x;
		}
	},
	lifetime: {
		graphMods: (graph, highChartsObj) => {
			highChartsObj.title.text += " % of Lifetime Total";
			highChartsObj.yAxis.title.text += " % of lifetime"
		},
		customFunction: (portal, item, index, x) => {
			var initial;
			if (item === "heliumOwned") { initial = portal.totalHelium; }
			if (item === "radonOwned") { initial = portal.totalRadon; }
			if (item === "c23increase") { initial = portal.cinf; }
			if (!initial) {
				graphsDebug("Attempted to calc lifetime percent of an unknown type:" + item);
				return 0;
			}
			if (item === "c23increase") {
				var totalBonus = (1 + (initial[1] / 100)) * initial[0]; // calc initial cinf            
				var c2 = initial[0];
				var c3 = initial[1];
				portal.universe == 1 ? c2 += x : c3 += x;
				var newBonus = (1 + (c3 / 100)) * c2; // calc final cinf
				x = ((newBonus - totalBonus) / (totalBonus ? totalBonus : 1));
			}
			else { x = x / (initial ? initial : 1) }
			return x;
		}
	},
	s3normalized: {
		graphMods: (graph, highChartsObj) => {
			var maxS3 = Math.max(...Object.values(portalSaveData).map((portal) => portal.s3).filter((s3) => s3));
			highChartsObj.title.text += `, Normalized to z${maxS3} S3`
		},
		customFunction: (portal, item, index, x, time, maxS3) => {
			x = x / 1.03 ** portal.s3 * 1.03 ** maxS3
			return x;
		}
	},
}


// --------- Runtime ---------

var chart1;
if (!MODULES) MODULES = {}; // don't overwrite if AT has already created this
var lastSave = new Date();
var GRAPHSETTINGS = {
	universeSelection: 1,
	u1graphSelection: null,
	u2graphSelection: null,
	rememberSelected: [],
	toggles: {},
	darkTheme: true,
	maxGraphs: 60, // Highcharts gets a bit angry rendering more graphs, 30 is the maximum you can fit on the legend before it splits into pages.
	portalsDisplayed: 30
}
var portalSaveData = {}

if (localStorage["allSaveData"]) delete localStorage["allSaveData"]; // remove old AT graph data

// load and initialize the UI
loadGraphData();
createUI()
showHideUnusedGraphs()
var lastTheme = -1;


// --------- Trimps Wrappers ---------

//On Zone transition
var originalnextWorld = nextWorld;
nextWorld = function () {
	try {
		if (game.options.menu.pauseGame.enabled) return;
		if (null === portalSaveData) portalSaveData = {};
		if (getGameData.world()) { pushData(); }
	}
	catch (e) { graphsDebug("Gather info failed: " + e) }
	originalnextWorld(...arguments);
}

//On Portal
var originalactivatePortal = activatePortal;
activatePortal = function () {
	try { pushData(); }
	catch (e) { graphsDebug("Gather info failed: " + e) }
	originalactivatePortal(...arguments)
}

//On Map start
// This unfortunately loses the last map, since we grab map time at the creation of the map
var originalbuildMapGrid = buildMapGrid;
buildMapGrid = function () {
	try { pushData(true); }
	catch (e) { graphsDebug("Gather info failed: " + e) }
	originalbuildMapGrid(...arguments)
}

//On leaving maps for world
// this captures the last map when you switch away from maps
var originalmapsSwitch = mapsSwitch;
mapsSwitch = function () {
	originalmapsSwitch(...arguments)
	try { if (!game.global.mapsActive) pushData(true); }
	catch (e) { graphsDebug("Gather info failed: " + e) }
}

// On finishing challenges (for c2s)
var originalabandonChallenge = abandonChallenge;
abandonChallenge = function () {
	try {
		pushData(true);
	}
	catch (e) { graphsDebug("Gather info failed: " + e) }
	originalabandonChallenge(...arguments)
}