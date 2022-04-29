//yes
var allSaveData = [],
    graphData = [],
    tmpGraphData = JSON.parse(localStorage.getItem("allSaveData"));
null !== tmpGraphData && (console.log("Graphs: Found allSaveData (portal runs data). Yay!"), (allSaveData = tmpGraphData)), (MODULES.graphs = {}), (MODULES.graphs.useDarkAlways = !1);
var head = document.getElementsByTagName("head")[0],
    chartscript = document.createElement("script");
(chartscript.type = "text/javascript"), (chartscript.src = "https://SadAugust.github.io/AutoTrimps_Local/highcharts.js"), head.appendChild(chartscript);
var newItem = document.createElement("TD");
newItem.appendChild(document.createTextNode("Graphs")), newItem.setAttribute("class", "btn btn-default"), newItem.setAttribute("onclick", "autoToggleGraph(); drawGraph(undefined, undefined, true);");
var settingbarRow = document.getElementById("settingsTable").firstElementChild.firstElementChild;
settingbarRow.insertBefore(newItem, settingbarRow.childNodes[10]),
    (document.getElementById("settingsRow").innerHTML += '<div id="graphParent" style="display: none; height: 600px; overflow: auto;"><div id="graph" style="margin-bottom: 10px;margin-top: 5px; height: 530px;"></div>'),
    (document.getElementById("graphParent").innerHTML +=
        '<div id="graphFooter" style="height: 50px;font-size: 1em;"><div id="graphFooterLine1" style="display: -webkit-flex;flex: 0.75;flex-direction: row; height:30px;"></div><div id="graphFooterLine2"></div></div>');
var $universeFooter = document.getElementById("graphFooterLine1"),
    universeList = [
        "Universe 1",
        "Universe 2",
    ],
    $universeSel = document.createElement("select");
for (var item in (($universeSel.id = "universeSelection"), $universeSel.setAttribute("style", ""), $universeSel.setAttribute("onchange", "drawGraph()"), universeList)) {
    var $opt = document.createElement("option");
    ($opt.value = universeList[item]), ($opt.text = universeList[item]), $universeSel.appendChild($opt);
}
var $u1Graph = document.getElementById("graphFooterLine1"),
    u1graphList = [
        "Helium - He/Hr",
        "Helium - Total",
        "HeHr % / LifetimeHe",
        "He % / LifetimeHe",
        "Clear Time",
        "Cumulative Clear Time",
        "Map Bonus",
        "Void Maps",
        "Void Map History",
        "Coordinations",
        "Nullifium Gained",
        "OverkillCells",
        "Fluffy XP",
        "Fluffy XP PerHour",
        "Amalgamators",
    ],
    $u1graphSel = document.createElement("select");
for (var item in (($u1graphSel.id = "u1graphSelection"), $u1graphSel.setAttribute("style", ""), $u1graphSel.setAttribute("onchange", "drawGraph()"), u1graphList)) {
    var $opt = document.createElement("option");
    ($opt.value = u1graphList[item]), ($opt.text = u1graphList[item]), $u1graphSel.appendChild($opt);
} 
var $u2Graph = document.getElementById("graphFooterLine1"),
    u2graphList = [
        "Radon - Rn/Hr",
        "Radon - Total",
        "RnHr % / LifetimeRn",
        "Rn % / LifetimeRn",
        "Clear Time",
        "Cumulative Clear Time",
        "Map Bonus",
        "Void Maps",
        "Void Map History",
        "Coordinations",
        "OverkillCells",
        "Scruffy XP",
        "Scruffy XP PerHour",
    ],
    $u2graphSel = document.createElement("select");
for (var item in (($u2graphSel.id = "u2graphSelection"), $u2graphSel.setAttribute("style", ""), $u2graphSel.setAttribute("onchange", "drawGraph()"), u2graphList)) {
    var $opt = document.createElement("option");
    ($opt.value = u2graphList[item]), ($opt.text = u2graphList[item]), $u2graphSel.appendChild($opt);
}
$universeFooter.appendChild($universeSel),
$universeFooter.appendChild($u1graphSel),
$universeFooter.appendChild($u2graphSel),
($universeFooter.innerHTML +=
    '<div><button onclick="drawGraph(true,false)" style="margin-left:0.5em; width:2em;">\u2191</button></div><div><button onclick="drawGraph(false,true)" style="margin-left:0.5em; width:2em;">\u2193</button></div><div><button onclick="drawGraph()" style="margin-left:0.5em;">Refresh</button></div><div style="flex:0 100 5%;"></div><div><input type="checkbox" id="clrChkbox" onclick="toggleClearButton();"></div><div style="margin-left: 0.5vw;"><button id="clrAllDataBtn" onclick="clearData(null,true); drawGraph();" class="btn" disabled="" style="flex:auto; padding: 2px 6px;border: 1px solid white;">Clear All Previous Data</button></div><div style="flex:0 100 5%;"></div><div style="flex:0 2 3.5vw;"><input style="width:100%;min-width: 40px;" id="deleteSpecificTextBox"></div><div style="flex:auto; margin-left: 0.5vw;"><button onclick="deleteSpecific(); drawGraph();">Delete Specific Portal</button></div><div style="flex:0 100 5%;"></div><div style="flex:auto;"><button  onclick="GraphsImportExportTooltip(\'ExportGraphs\', null, \'update\')" onmouseover=\'tooltip("Tips", "customText", event, "Export Graph Database will make a backup of all the graph data to a text string.<b>DISCLAIMER:</b> Takes quite a long time to generate.")\' onmouseout=\'tooltip("hide")\'>Export your Graph Database</button></div><div style="float:right; margin-right: 0.5vw;"><button onclick="addGraphNoteLabel()">Add Note/Label</button></div><div style="float:right; margin-right: 0.5vw;"><button onclick="toggleSpecificGraphs()">Invert Selection</button></div><div style="float:right; margin-right: 1vw;"><button onclick="toggleAllGraphs()">All Off/On</button></div>'),
(document.getElementById("graphFooterLine2").innerHTML +=
    '<span style="float: left;" onmouseover=\'tooltip("Tips", "customText", event, "You can zoom by dragging a box around an area. You can turn portals off by clicking them on the legend. Quickly view the last portal by clicking it off, then Invert Selection. Or by clicking All Off, then clicking the portal on. To delete a portal, Type its portal number in the box and press Delete Specific. Using negative numbers in the Delete Specific box will KEEP that many portals (starting counting backwards from the current one), ie: if you have Portals 1000-1015, typing -10 will keep 1005-1015. There is a browser data storage limitation of 10MB, so do not exceed 20 portals-worth of data.")\' onmouseout=\'tooltip("hide")\'>Tips: Hover for usage tips.</span><input style="height: 20px; float: right; margin-right: 0.5vw;" type="checkbox" id="rememberCB"><span style="float: right; margin-right: 0.5vw;">Try to Remember Which Portals are Selected when switching between Graphs:</span><input onclick="toggleDarkGraphs()" style="height: 20px; float: right; margin-right: 0.5vw;" type="checkbox" id="blackCB"><span style="float: right; margin-right: 0.5vw;">Black Graphs:</span>');
function toggleClearButton() {
    document.getElementById("clrAllDataBtn").disabled = !document.getElementById("clrChkbox").checked;
}
function addDarkGraphs() {
    var a = document.getElementById("dark-graph.css");
    if (!a) {
        var b = document.createElement("link");
        (b.rel = "stylesheet"), (b.type = "text/css"), (b.id = "dark-graph.css"), (b.href = basepath + "dark-graph.css"), document.head.appendChild(b), debug("Adding dark-graph.css file", "graphs");
    }
}
function removeDarkGraphs() {
    var a = document.getElementById("dark-graph.css");
    a && (document.head.removeChild(a), debug("Removing dark-graph.css file", "graphs"));
}
function toggleDarkGraphs() {
    if (game) {
        var c = document.getElementById("dark-graph.css"),
            d = document.getElementById("blackCB").checked;
        (!c && (0 == game.options.menu.darkTheme.enabled || 2 == game.options.menu.darkTheme.enabled)) || MODULES.graphs.useDarkAlways || d
            ? addDarkGraphs()
            : c && (1 == game.options.menu.darkTheme.enabled || 3 == game.options.menu.darkTheme.enabled || !d) && removeDarkGraphs();
    }
}
var lastTheme = -1;
(MODULES.graphs.themeChanged = function () {
    if (game && game.options.menu.darkTheme.enabled != lastTheme) {
        function f(h) {
            h.style.color = 2 == game.options.menu.darkTheme.enabled ? "" : "black";
        }
        function g(h) {
            if ("graphSelection" == h.id) return void (2 != game.options.menu.darkTheme.enabled && (h.style.color = "black"));
        }
        toggleDarkGraphs();
        var c = document.getElementsByTagName("input"),
            d = document.getElementsByTagName("select"),
            e = document.getElementById("graphFooterLine1").children;
        for (let h of c) f(h);
        for (let h of d) f(h);
        for (let h of e) f(h);
        for (let h of e) g(h);
    }
    game && (lastTheme = game.options.menu.darkTheme.enabled);
}),
    MODULES.graphs.themeChanged();
function GraphsImportExportTooltip(a) {
    if (!game.global.lockTooltip) {
        var d = document.getElementById("tooltipDiv");
        swapClass("tooltipExtra", "tooltipExtraNone", d);
        var f,
            e = null,
            g = "";
        "ExportGraphs" == a &&
            ((f =
                "This is your GRAPH DATABASE save string. There are many like it but this one is yours. Save this save somewhere safe so you can save time next time. <br/><br/><textarea id='exportArea' style='width: 100%' rows='5'>" +
                JSON.stringify(allSaveData) +
                "</textarea>"),
            (g = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip()'>Got it</div>"),
            document.queryCommandSupported("copy")
                ? ((g += "<div id='clipBoardBtn' class='btn btn-success'>Copy to Clipboard</div>"),
                  (e = function () {
                      document.getElementById("exportArea").select(),
                          document.getElementById("clipBoardBtn").addEventListener("click", function () {
                              document.getElementById("exportArea").select();
                              try {
                                  document.execCommand("copy");
                              } catch (i) {
                                  document.getElementById("clipBoardBtn").innerHTML = "Error, not copied";
                              }
                          });
                  }))
                : (e = function () {
                      document.getElementById("exportArea").select();
                  }),
            (g += "</div>")),
            "ImportGraphs" == a &&
                ((f = "Replaces your GRAPH DATABASE with this save string! It'll be fine, I promise.<br/><br/><textarea id='importBox' style='width: 100%' rows='5'></textarea>"),
                (g = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); loadGraphs();'>Import</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>"),
                (e = function () {
                    document.getElementById("importBox").focus();
                })),
            "AppendGraphs" == a &&
                ((f = "Appends to your GRAPH DATABASE with this save string (combines them)! It'll be fine, I hope.<br/><br/><textarea id='importBox' style='width: 100%' rows='5'></textarea>"),
                (g = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); appendGraphs();'>Import</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>"),
                (e = function () {
                    document.getElementById("importBox").focus();
                })),
            (game.global.lockTooltip = !0),
            (d.style.left = "33.75%"),
            (d.style.top = "25%"),
            (document.getElementById("tipTitle").innerHTML = a),
            (document.getElementById("tipText").innerHTML = f),
            (document.getElementById("tipCost").innerHTML = g),
            (d.style.display = "block"),
            null != e && e();
    }
}
function loadGraphs() {
    var a = document.getElementById("importBox").value.replace(/(\r\n|\n|\r|\s)/gm, ""),
        b = JSON.parse(a);
    null == b || ((allSaveData = b), drawGraph());
}
function appendGraphs() {
    drawGraph();
}
var rememberSelectedVisible = [];
function saveSelectedGraphs() {
    rememberSelectedVisible = [];
    for (var b, a = 0; a < chart1.series.length; a++) (b = chart1.series[a]), (rememberSelectedVisible[a] = b.visible);
}
function applyRememberedSelections() {
    for (var b, a = 0; a < chart1.series.length; a++) (b = chart1.series[a]), !1 == rememberSelectedVisible[a] && b.hide();
}
function toggleSpecificGraphs() {
    for (var b, a = 0; a < chart1.series.length; a++) (b = chart1.series[a]), b.visible ? b.hide() : b.show();
}
function toggleAllGraphs() {
    for (var c, a = 0, b = 0; b < chart1.series.length; b++) (c = chart1.series[b]), c.visible && a++;
    for (var c, b = 0; b < chart1.series.length; b++) (c = chart1.series[b]), a > chart1.series.length / 2 ? c.hide() : c.show();
}
/*function clearData(portal,clrall) {
    if(!portal)
        portal = 0;
    if (!clrall) {
        while(allSaveData[0].totalPortals < getTotalPortals(true) - portal) {
            allSaveData.shift();
        }
    } else {
        while(allSaveData[0].totalPortals != game.global.totalPortals) {
            allSaveData.shift();
        }
    }
}*/
function clearData(portal, clrall = false) {
    if (clrall) {
        var currentPortalNumber = getTotalPortals(true);
        while (allSaveData[0].totalPortals != currentPortalNumber) {
            allSaveData.shift();
        }
    } else {
        var keepSaveDataIndex = allSaveData.length - 1;
        for (var i = 0; i <= portal; i++) {
            keepSaveDataIndex -= allSaveData[keepSaveDataIndex].world;
            if (keepSaveDataIndex <= 0) {
                return;
            }
        }

        allSaveData.splice(0, keepSaveDataIndex + 1);
    }
}
function deleteSpecific() {
    var a = document.getElementById("deleteSpecificTextBox").value;
    if ("" != a)
        if (0 > parseInt(a)) clearData(Math.abs(a));
        else for (var b = allSaveData.length - 1; 0 <= b; b--) allSaveData[b].totalPortals == a && allSaveData.splice(b, 1);
}
function autoToggleGraph() {
    game.options.displayed && toggleSettingsMenu();
    var a = document.getElementById("autoSettings");
    a && "block" === a.style.display && (a.style.display = "none");
    var a = document.getElementById("autoTrimpsTabBarMenu");
    a && "block" === a.style.display && (a.style.display = "none");
    var b = document.getElementById("graphParent");
    "block" === b.style.display ? (b.style.display = "none") : ((b.style.display = "block"), setGraph());
}
function escapeATWindows() {
    var a = document.getElementById("tooltipDiv");
    if ("none" != a.style.display) return void cancelTooltip();
    game.options.displayed && toggleSettingsMenu();
    var b = document.getElementById("autoSettings");
    "block" === b.style.display && (b.style.display = "none");
    var b = document.getElementById("autoTrimpsTabBarMenu");
    "block" === b.style.display && (b.style.display = "none");
    var c = document.getElementById("graphParent");
    "block" === c.style.display && (c.style.display = "none");
}
document.addEventListener(
    "keydown",
    function (a) {
        1 != game.options.menu.hotkeys.enabled || game.global.preMapsActive || game.global.lockTooltip || ctrlPressed || heirloomsShown || 27 != a.keyCode || escapeATWindows();
    },
    !0
);
function getTotalDarkEssenceCount() {
    return game.global.spentEssence + game.global.essence;
}

function pushData() {
    debug("Starting Zone " + game.global.world, "graphs");
    var getPercent = (game.stats.heliumHour.value() / (game.global.totalHeliumEarned - (game.global.heliumLeftover + game.resources.helium.owned))) * 100;
    var lifetime = (game.resources.helium.owned / (game.global.totalHeliumEarned - game.resources.helium.owned)) * 100;
    var RgetPercent = (game.stats.heliumHour.value() / (game.global.totalRadonEarned - (game.global.radonLeftover + game.resources.radon.owned))) * 100;
    var Rlifetime = (game.resources.radon.owned / (game.global.totalRadonEarned - game.resources.radon.owned)) * 100;

    allSaveData.push({
        totalPortals: getTotalPortals(true),
        currentTime: new Date().getTime(),
        portalTime: game.global.portalTime,
        world: game.global.world,
        challenge: game.global.challengeActive,
        voids: game.global.totalVoidMaps,
        heirlooms: { value: game.stats.totalHeirlooms.value, valueTotal: game.stats.totalHeirlooms.valueTotal },
        nullifium: recycleAllExtraHeirlooms(true),
        coord: game.upgrades.Coordination.done,
        lastwarp: game.global.lastWarp,
        essence: getTotalDarkEssenceCount(),
        heliumOwned: game.resources.helium.owned,
        hehr: getPercent.toFixed(4),
        helife: lifetime.toFixed(4),
        overkill: GraphsVars.OVKcellsInWorld,
        zonetime: GraphsVars.ZoneStartTime,
        mapbonus: GraphsVars.MapBonus,
        magmite: game.global.magmite,
        magmamancers: game.jobs.Magmamancer.owned,
        fluffy: game.global.fluffyExp,
        scruffy: game.global.fluffyExp2,
        nursery: game.buildings.Nursery.purchased,
        amals: game.jobs.Amalgamator.owned,
        radonOwned: game.resources.radon.owned,
        rnhr: RgetPercent.toFixed(4),
        rnlife: Rlifetime.toFixed(4),
        universe: game.global.universe,
        universeSelection: document.getElementById('universeSelection').options[document.getElementById('universeSelection').options.selectedIndex].value,
        u1graphSelection: document.getElementById('u1graphSelection').options[document.getElementById('u1graphSelection').options.selectedIndex].value,
        u2graphSelection: document.getElementById('u2graphSelection').options[document.getElementById('u2graphSelection').options.selectedIndex].value,
    });
    clearData(10);
    safeSetItems("allSaveData", JSON.stringify(allSaveData));
}

var graphAnal = [];
function trackHourlyGraphAnalytics() {
    graphAnal.push({
        currentTime: new Date().getTime(),
        totalPortals: getTotalPortals(true),
        heliumOwned: game.resources.helium.owned,
        radonOwned: game.resources.radon.owned,
        highzone: game.global.highestLevelCleared,
        bones: game.global.b,
    }),
        safeSetItems("graphAnal", JSON.stringify(graphAnal));
}
trackHourlyGraphAnalytics();
setInterval(trackHourlyGraphAnalytics, 3600000);
function initializeData() {
    null === allSaveData && (allSaveData = []), 0 === allSaveData.length && pushData();
}
var GraphsVars = {};
function InitGraphsVars() {
    (GraphsVars.currentPortal = 0),
    (GraphsVars.OVKcellsInWorld = 0),
    (GraphsVars.lastOVKcellsInWorld = 0),
    (GraphsVars.currentworld = 0),
    (GraphsVars.lastrunworld = 0),
    (GraphsVars.aWholeNewWorld = !1),
    (GraphsVars.lastZoneStartTime = 0),
    (GraphsVars.ZoneStartTime = 0),
    (GraphsVars.MapBonus = 0),
    (GraphsVars.aWholeNewPortal = 0),
    (GraphsVars.currentPortal = 0)
    if (allSaveData.length > 0) {
    if (allSaveData[allSaveData.length-1].universeSelection !== undefined)
        document.getElementById('universeSelection').value = allSaveData[allSaveData.length-1].universeSelection
    if (allSaveData[allSaveData.length-1].u1graphSelection !== undefined)
        document.getElementById('u1graphSelection').value = allSaveData[allSaveData.length-1].u1graphSelection
    if (allSaveData[allSaveData.length-1].u2graphSelection !== undefined)
        document.getElementById('u2graphSelection').value = allSaveData[allSaveData.length-1].u2graphSelection
    }      
};
InitGraphsVars();

function gatherInfo() {
    if (game.options.menu.pauseGame.enabled) return;
    initializeData();
    GraphsVars.aWholeNewPortal = GraphsVars.currentPortal != getTotalPortals(true);
    if (GraphsVars.aWholeNewPortal) {
        GraphsVars.currentPortal = getTotalPortals(true);
        filteredLoot = {
            produced: {
                metal: 0,
                wood: 0,
                food: 0,
                gems: 0,
                fragments: 0,
            },
            looted: {
                metal: 0,
                wood: 0,
                food: 0,
                gems: 0,
                fragments: 0,
            },
        };
    }
    GraphsVars.aWholeNewWorld = GraphsVars.currentworld != game.global.world;
    if (GraphsVars.aWholeNewWorld) {
        GraphsVars.currentworld = game.global.world;
        if (allSaveData.length > 0 && allSaveData[allSaveData.length - 1].world != game.global.world) {
            pushData();
        }
        GraphsVars.OVKcellsInWorld = 0;
        GraphsVars.ZoneStartTime = 0;
        GraphsVars.MapBonus = 0;
    }
    if (game.options.menu.overkillColor.enabled == 0) toggleSetting("overkillColor");
    if (game.options.menu.liquification.enabled && game.talents.liquification.purchased && !game.global.mapsActive && game.global.gridArray && game.global.gridArray[0] && game.global.gridArray[0].name == "Liquimp")
        GraphsVars.OVKcellsInWorld = 100;
    else GraphsVars.OVKcellsInWorld = document.getElementById("grid").getElementsByClassName("cellColorOverkill").length;
    GraphsVars.ZoneStartTime = new Date().getTime() - game.global.zoneStarted;
    GraphsVars.MapBonus = game.global.mapBonus;
}

var dataBase = {};
var databaseIndexEntry = {
    Index: 0,
    Portal: 0,
    Challenge: 0,
    World: 0,
};
var databaseDirtyEntry = {
    State: false,
    Reason: "",
    Index: -1,
};
var portalExistsArray = [];
var portalRunArray = [];
var portalRunIndex = 0;

function chkdsk() {
    rebuildDataIndex(), checkIndexConsistency(), checkWorldSequentiality(), !0 == databaseDirtyEntry.State;
}
function rebuildDataIndex() {
    for (var a = 0; a < allSaveData.length - 1; a++)
        (dataBase[a] = { Index: a, Portal: allSaveData[a].totalPortals, Challenge: allSaveData[a].challenge, World: allSaveData[a].world }),
            portalRunArray.push({ Index: a, Portal: allSaveData[a].totalPortals, Challenge: allSaveData[a].challenge }),
            "undefined" == typeof portalExistsArray[allSaveData[a].totalPortals]
                ? (portalExistsArray[allSaveData[a].totalPortals] = { Exists: !0, Row: portalRunIndex, Index: a, Challenge: allSaveData[a].challenge })
                : ((databaseDirtyFlag.State = !0), (databaseDirtyFlag.Reason = "oreoportal"), (databaseDirtyFlag.Index = a), (row = portalExistsArray[allSaveData[a].totalPortals].Row)),
            portalRunIndex++;
}
function checkIndexConsistency() {
    for (var a = 0; a < dataBase.length - 1; a++)
        if (dataBase[a].Index != a) {
            databaseDirtyFlag = [!0, "index", a];
            break;
        }
}
function checkWorldSequentiality() {
    for (var a, b, c, d = 1; d < dataBase.length - 1; d++) {
        if (((lastworldEntry = dataBase[d - 1]), (currentworldEntry = dataBase[d]), (nextworldEntry = dataBase[d + 1]), (a = lastworldEntry.World), (b = currentworldEntry.World), (c = nextworldEntry.World), a > b && 1 != b)) {
            (databaseDirtyFlag.State = !0), (databaseDirtyFlag.Reason = "descending"), (databaseDirtyFlag.Index = d);
            break;
        }
        if (a > b && 1 == b && a == c) {
            (databaseDirtyFlag.State = !0), (databaseDirtyFlag.Reason = "badportal"), (databaseDirtyFlag.Index = d);
            break;
        }
    }
}
function drawGraph(a, b, refresh) {
    var universe = document.getElementById('universeSelection').options[document.getElementById('universeSelection').options.selectedIndex].value;
    if (universe == 'Universe 1') {
        document.getElementById('u1graphSelection').style.display = ''
        document.getElementById('u2graphSelection').style.display = 'none'
    }
    if (universe == 'Universe 2') {
        document.getElementById('u1graphSelection').style.display = 'none'
        document.getElementById('u2graphSelection').style.display = ''
    }
    var c = universe == 'Universe 1' ? document.getElementById("u1graphSelection") : universe == 'Universe 2' ? document.getElementById("u2graphSelection") : "Universe 1";
    if (a === undefined && b === undefined && c.value !== undefined && refresh !== undefined) {
        setGraphData('Refresh');
        setGraphData(c.value);
    }
    a ? (c.selectedIndex--, 0 > c.selectedIndex && (c.selectedIndex = 0)) : b && c.selectedIndex != c.options.length - 1 && c.selectedIndex++, setGraphData(c.value);
}

function setGraphData(graph) {
    var title,
        xTitle,
        yTitle,
        yType,
        valueSuffix,
        series,
        formatter,
        xminFloor = 1,
        yminFloor = null;
    var precision = 0;
    var oldData = JSON.stringify(graphData);
    valueSuffix = "";

    switch (graph) {
        case "Refresh":
            graphData = [];
            
            title = "Refresh";
            xTitle = "Refresh";
            yTitle = "Refresh";
            yType = "Linear";
            break;
        case "Void Maps":
            var currentPortal = -1;
            var totalVoids = 0;
            var theChallenge = "";
            graphData = [];
            for (var i in allSaveData) {
                if (allSaveData[i].totalPortals != currentPortal) {
                    if (currentPortal == -1) {
                        theChallenge = allSaveData[i].challenge;
                        currentPortal = allSaveData[i].totalPortals;
                        graphData.push({
                            name: "Void Maps",
                            data: [],
                            type: "column",
                        });
                        continue;
                    }
                    graphData[0].data.push([allSaveData[i - 1].totalPortals, totalVoids]);
                    theChallenge = allSaveData[i].challenge;
                    totalVoids = 0;
                    currentPortal = allSaveData[i].totalPortals;
                }
                if (allSaveData[i].voids > totalVoids) {
                    totalVoids = allSaveData[i].voids;
                }
            }
            title = "Void Maps (completed)";
            xTitle = "Portal";
            yTitle = "Number of Void Maps";
            yType = "Linear";
            break;

        case "Nullifium Gained":
            var currentPortal = -1;
            var totalNull = 0;
            var theChallenge = "";
            graphData = [];
            var averagenulli = 0;
            var sumnulli = 0;
            var count = 0;
            for (var i in allSaveData) {
                if (allSaveData[i].totalPortals != currentPortal) {
                    if (currentPortal == -1) {
                        theChallenge = allSaveData[i].challenge;
                        currentPortal = allSaveData[i].totalPortals;
                        graphData.push({
                            name: "Nullifium Gained",
                            data: [],
                            type: "column",
                        });
                        continue;
                    }
                    graphData[0].data.push([allSaveData[i - 1].totalPortals, totalNull]);
                    count++;
                    sumnulli += totalNull;
                    theChallenge = allSaveData[i].challenge;
                    totalNull = 0;
                    currentPortal = allSaveData[i].totalPortals;
                }
                if (allSaveData[i].nullifium > totalNull) {
                    totalNull = allSaveData[i].nullifium;
                }
            }
            averagenulli = sumnulli / count;
            title = "Nullifium Gained Per Portal";
            if (averagenulli) title = "Average " + title + " = " + averagenulli;
            xTitle = "Portal";
            yTitle = "Nullifium Gained";
            yType = "Linear";
            break;

        case "Loot Sources":
            graphData = [];
            graphData[0] = {
                name: "Metal",
                data: lootData.metal,
            };
            graphData[1] = {
                name: "Wood",
                data: lootData.wood,
            };
            graphData[2] = {
                name: "Food",
                data: lootData.food,
            };
            graphData[3] = {
                name: "Gems",
                data: lootData.gems,
            };
            graphData[4] = {
                name: "Fragments",
                data: lootData.fragments,
            };
            title = "Current Loot Sources (of all resources gained) - for the last 15 minutes";
            xTitle = "Time (every 15 seconds)";
            yTitle = "Ratio of looted to gathered";
            valueSuffix = "%";
            formatter = function () {
                return Highcharts.numberFormat(this.y, 3);
            };
            break;

        case "Clear Time #2":
            graphData = allPurposeGraph("cleartime2", true, null, function specialCalc(e1, e2) {
                return Math.round(e1.zonetime / 1000);
            });
            title = "(#2) Time to Clear Zone";
            xTitle = "Zone";
            yTitle = "Clear Time";
            yType = "Linear";
            valueSuffix = " Seconds";
            break;
        case "Clear Time":
            graphData = allPurposeGraph("cleartime1", true, null, function specialCalc(e1, e2) {
                return Math.round((e1.currentTime - e2.currentTime - (e1.portalTime - e2.portalTime)) / 1000);
            });
            title = "Time to clear zone";
            xTitle = "Zone";
            yTitle = "Clear Time";
            yType = "Linear";
            valueSuffix = " Seconds";
            yminFloor = 0;
            break;
        case "Cumulative Clear Time #2":
            graphData = allPurposeGraph(
                "cumucleartime2",
                true,
                null,
                function specialCalc(e1, e2) {
                    return Math.round(e1.zonetime);
                },
                true
            );
            title = "(#2) Cumulative Time (at END of zone#)";
            xTitle = "Zone";
            yTitle = "Cumulative Clear Time";
            yType = "datetime";
            formatter = function () {
                var ser = this.series;
                return '<span style="color:' + ser.color + '" >●</span> ' + ser.name + ": <b>" + Highcharts.dateFormat("%H:%M:%S", this.y) + "</b><br>";
            };
            yminFloor = 0;
            break;
        case "Cumulative Clear Time":
            graphData = allPurposeGraph(
                "cumucleartime1",
                true,
                null,
                function specialCalc(e1, e2) {
                    return Math.round(e1.currentTime - e2.currentTime - (e1.portalTime - e2.portalTime));
                },
                true
            );
            title = "Cumulative Time (at END of zone#)";
            xTitle = "Zone";
            yTitle = "Cumulative Clear Time";
            yType = "datetime";
            formatter = function () {
                var ser = this.series;
                return '<span style="color:' + ser.color + '" >●</span> ' + ser.name + ": <b>" + Highcharts.dateFormat("%H:%M:%S", this.y) + "</b><br>";
            };
            yminFloor = 0;
            break;

        case "Helium - He/Hr":
            graphData = allPurposeGraph("heliumhr", true, null, function specialCalc(e1, e2) {
                return Math.floor(e1.heliumOwned / ((e1.currentTime - e1.portalTime) / 3600000));
            });
            title = "Helium/Hour (Cumulative)";
            xTitle = "Zone";
            yTitle = "Helium/Hour";
            yType = "Linear";
            yminFloor = 0;
            precision = 2;
            break;
        case "Helium - Total":
            graphData = allPurposeGraph("heliumOwned", true, null, function specialCalc(e1, e2) {
                return Math.floor(e1.heliumOwned);
            });
            title = "Helium (Lifetime Total)";
            xTitle = "Zone";
            yTitle = "Helium";
            yType = "Linear";
            break;
        case "HeHr % / LifetimeHe":
            graphData = allPurposeGraph("hehr", true, "string");
            title = "He/Hr % of LifetimeHe";
            xTitle = "Zone";
            yTitle = "He/Hr % of LifetimeHe";
            yType = "Linear";
            precision = 4;
            break;
        case "He % / LifetimeHe":
            graphData = allPurposeGraph("helife", true, "string");
            title = "He % of LifetimeHe";
            xTitle = "Zone";
            yTitle = "He % of LifetimeHe";
            yType = "Linear";
            precision = 4;
            break;
        case "Radon - Rn/Hr":
            graphData = allPurposeGraph("radonhr", true, null, function specialCalc(e1, e2) {
                return Math.floor(e1.radonOwned / ((e1.currentTime - e1.portalTime) / 3600000));
            });
            title = "Radon/Hour (Cumulative)";
            xTitle = "Zone";
            yTitle = "Radon/Hour";
            yType = "Linear";
            yminFloor = 0;
            precision = 2;
            break;
        case "Radon - Total":
            graphData = allPurposeGraph("radonOwned", true, null, function specialCalc(e1, e2) {
                return Math.floor(e1.radonOwned);
            });
            title = "Radon (Lifetime Total)";
            xTitle = "Zone";
            yTitle = "Radon";
            yType = "Linear";
            break;
        case "RnHr % / LifetimeHe":
            graphData = allPurposeGraph("rnhr", true, "string");
            title = "Rn/Hr % of LifetimeHe";
            xTitle = "Zone";
            yTitle = "Rn/Hr % of LifetimeHe";
            yType = "Linear";
            precision = 4;
            break;
        case "Rn % / LifetimeHe":
            graphData = allPurposeGraph("rnlife", true, "string");
            title = "Rn % of LifetimeRn";
            xTitle = "Zone";
            yTitle = "Rn % of LifetimeRn";
            yType = "Linear";
            precision = 4;
            break;
        case "Void Map History":
            graphData = allPurposeGraph("voids", true, "number");
            title = "Void Map History (voids finished during the same level acquired (with RunNewVoids) are not counted/tracked)";
            xTitle = "Zone";
            yTitle = "Number of Void Maps";
            yType = "Linear";
            break;
        case "Map Bonus":
            graphData = allPurposeGraph("mapbonus", true, "number");
            title = "Map Bonus History";
            xTitle = "Zone";
            yTitle = "Map Bonus Stacks";
            yType = "Linear";
            break;
        case "Coordinations":
            graphData = allPurposeGraph("coord", true, "number");
            title = "Coordination History";
            xTitle = "Zone";
            yTitle = "Coordination";
            yType = "Linear";
            break;
        case "Amalgamators":
            graphData = allPurposeGraph("amals", true, "number");
            title = "Amalgamators";
            xTitle = "Zone";
            yTitle = "Amalgamators";
            yType = "Linear";
            break;
        case "Fluffy XP":
            graphData = allPurposeGraph("fluffy", true, "number");
            title = "Fluffy XP (Lifetime Total)";
            xTitle = "Zone (starts at 300)";
            yTitle = "Fluffy XP";
            yType = "Linear";
            xminFloor = 300;
            break;
        case "Fluffy XP PerHour":
            var currentPortal = -1;
            var currentZone = -1;
            var startFluffy = 0;
            graphData = [];
            for (var i in allSaveData) {
                if (allSaveData[i].totalPortals != currentPortal) {
                    graphData.push({
                        name: "Portal " + allSaveData[i].totalPortals + ": " + allSaveData[i].challenge,
                        data: [],
                    });
                    currentPortal = allSaveData[i].totalPortals;
                    currentZone = 0;
                    startFluffy = allSaveData[i].fluffy;
                }
                if (currentZone != allSaveData[i].world - 1 && i > 0) {
                    var loop = allSaveData[i].world - 1 - currentZone;
                    while (loop > 0) {
                        graphData[graphData.length - 1].data.push(allSaveData[i - 1][item] * 1);
                        loop--;
                    }
                }
                if (currentZone != 0) {
                    graphData[graphData.length - 1].data.push(Math.floor((allSaveData[i].fluffy - startFluffy) / ((allSaveData[i].currentTime - allSaveData[i].portalTime) / 3600000)));
                }
                currentZone = allSaveData[i].world;
            }
            title = "Fluffy XP/Hour (Cumulative)";
            xTitle = "Zone";
            yTitle = "Fluffy XP/Hour";
            yType = "Linear";
            xminFloor = 1;
            break;
        case "Scruffy XP":
            graphData = allPurposeGraph("scruffy", true, "number");
            title = "Scruffy XP (Lifetime Total)";
            xTitle = "Zone";
            yTitle = "Scruffy XP";
            yType = "Linear";
            xminFloor = 0;
            break;
        case "Scruffy XP PerHour":
            var currentPortal = -1;
            var currentZone = -1;
            var startScruffy = 0;
            graphData = [];
            for (var i in allSaveData) {
                if (allSaveData[i].totalPortals != currentPortal) {
                    graphData.push({
                        name: "Portal " + allSaveData[i].totalPortals + ": " + allSaveData[i].challenge,
                        data: [],
                    });
                    currentPortal = allSaveData[i].totalPortals;
                    currentZone = 0;
                    startScruffy = allSaveData[i].scruffy;
                }
                if (currentZone != allSaveData[i].world - 1 && i > 0) {
                    var loop = allSaveData[i].world - 1 - currentZone;
                    while (loop > 0) {
                        graphData[graphData.length - 1].data.push(allSaveData[i - 1][item] * 1);
                        loop--;
                    }
                }
                if (currentZone != 0) {
                    graphData[graphData.length - 1].data.push(Math.floor((allSaveData[i].scruffy - startScruffy) / ((allSaveData[i].currentTime - allSaveData[i].portalTime) / 3600000)));
                }
                currentZone = allSaveData[i].world;
            }
            title = "Scruffy XP/Hour (Cumulative)";
            xTitle = "Zone";
            yTitle = "Scruffy XP/Hour";
            yType = "Linear";
            xminFloor = 1;
            break;
        case "OverkillCells":
            var currentPortal = -1;
            graphData = [];
            for (var i in allSaveData) {
                if (allSaveData[i].totalPortals != currentPortal) {
                    graphData.push({
                        name: "Portal " + allSaveData[i].totalPortals + ": " + allSaveData[i].challenge,
                        data: [],
                    });
                    currentPortal = allSaveData[i].totalPortals;
                    if (allSaveData[i].world == 1 && currentZone != -1) graphData[graphData.length - 1].data.push(0);

                    if (currentZone == -1 || allSaveData[i].world != 1) {
                        var loop = allSaveData[i].world;
                        while (loop > 0) {
                            graphData[graphData.length - 1].data.push(0);
                            loop--;
                        }
                    }
                }
                if (currentZone < allSaveData[i].world && currentZone != -1) {
                    var num = allSaveData[i].overkill;
                    if (num) graphData[graphData.length - 1].data.push(num);
                }
                currentZone = allSaveData[i].world;
            }
            title = "Overkilled Cells";
            xTitle = "Zone";
            yTitle = "Overkilled Cells";
            yType = "Linear";
            break;
    }

    function allPurposeGraph(item, extraChecks, typeCheck, funcToRun, useAccumulator) {
        var currentPortal = -1;
        var currentZone = 0;
        var accumulator = 0;
        graphData = [];
        for (var i in allSaveData) {
            if (typeCheck && typeof allSaveData[i][item] != typeCheck) continue;
            if (allSaveData[i].universe !== undefined) { 
                if (allSaveData[i].universe != document.getElementById('universeSelection').options[document.getElementById('universeSelection').options.selectedIndex].value.charAt(9)) {
                    for (var k in graphData) {
                        if (graphData[k].universe !== undefined && graphData[k].universe != document.getElementById('universeSelection').options[document.getElementById('universeSelection').options.selectedIndex].value.charAt(9)) {
                            graphData[k].pop({
                            name: "Portal " + allSaveData[i].totalPortals + ": " + allSaveData[i].challenge,
                            data: [],
                        });
                        }
                    }
                    continue;
                }
            }
            if (allSaveData[i].totalPortals != currentPortal) {
                graphData.push({
                    name: "Portal " + allSaveData[i].totalPortals + ": " + allSaveData[i].challenge,
                    data: [],
                    universe: allSaveData[i].universe,
                });
                currentPortal = allSaveData[i].totalPortals;
                currentZone = 0;
                if (funcToRun) {
                    accumulator = 0;
                    graphData[graphData.length - 1].data.push(0);
                }
                continue;
            }
            if (extraChecks) {
                if (currentZone != allSaveData[i].world - 1) {
                    var loop = allSaveData[i].world - 1 - currentZone;
                    while (loop > 0) {
                        graphData[graphData.length - 1].data.push(allSaveData[i - 1][item] * 1);
                        loop--;
                    }
                }
            }
            if (funcToRun && !useAccumulator && currentZone != 0) {
                var num = funcToRun(allSaveData[i], allSaveData[i - 1]);
                if (num < 0) num = 1;
                graphData[graphData.length - 1].data.push(num);
            } else if (funcToRun && useAccumulator && currentZone != 0) {
                accumulator += funcToRun(allSaveData[i], allSaveData[i - 1]);
                if (accumulator < 0) accumulator = 1;
                graphData[graphData.length - 1].data.push(accumulator);
            } else {
                if (allSaveData[i][item] >= 0) graphData[graphData.length - 1].data.push(allSaveData[i][item] * 1);
                else if (extraChecks) graphData[graphData.length - 1].data.push(-1);
            }
            currentZone = allSaveData[i].world;
        }
        return graphData;
    }
    formatter =
        formatter ||
        function () {
            var ser = this.series;
            return '<span style="color:' + ser.color + '" >●</span> ' + ser.name + ": <b>" + prettify(this.y) + valueSuffix + "</b><br>";
        };
    var additionalParams = {};
    if (oldData != JSON.stringify(graphData)) {
        saveSelectedGraphs();
        setGraph(title, xTitle, yTitle, valueSuffix, formatter, graphData, yType, xminFloor, yminFloor, additionalParams);
    }
    if (graph == "Loot Sources") {
        chart1.xAxis[0].tickInterval = 1;
        chart1.xAxis[0].minorTickInterval = 1;
    }
    if (document.getElementById("rememberCB").checked) {
        applyRememberedSelections();
    }
}

var chart1;

function setGraph(title, xTitle, yTitle, valueSuffix, formatter, series, yType, xminFloor, yminFloor, additionalParams) {
    chart1 = new Highcharts.Chart({
        chart: {
            renderTo: "graph",
            zoomType: "xy",
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
        title: {
            text: title,
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
            floor: xminFloor,
            title: {
                text: xTitle,
            },
        },
        yAxis: {
            floor: yminFloor,
            title: {
                text: yTitle,
            },
            plotLines: [
                {
                    value: 0,
                    width: 1,
                    color: "#808080",
                },
            ],
            type: yType,
            dateTimeLabelFormats: {
                second: "%H:%M:%S",
                minute: "%H:%M:%S",
                hour: "%H:%M:%S",
                day: "%H:%M:%S",
                week: "%H:%M:%S",
                month: "%H:%M:%S",
                year: "%H:%M:%S",
            },
        },
        tooltip: {
            pointFormatter: formatter,
            valueSuffix: valueSuffix,
        },
        legend: {
            layout: "vertical",
            align: "right",
            verticalAlign: "middle",
            borderWidth: 0,
        },
        series: series,
        additionalParams,
    });
}

function setColor(tmp) {
    for (var i in tmp) {
        tmp[i].color = i == tmp.length - 1 ? "#FF0000" : "#90C3D4";
    }
    return tmp;
}

var filteredLoot = {
    produced: {
        metal: 0,
        wood: 0,
        food: 0,
        gems: 0,
        fragments: 0,
    },
    looted: {
        metal: 0,
        wood: 0,
        food: 0,
        gems: 0,
        fragments: 0,
    },
};
var lootData = {
    metal: [],
    wood: [],
    food: [],
    gems: [],
    fragments: [],
};

function filterLoot(loot, amount, jest, fromGather) {
    if (loot != "wood" && loot != "metal" && loot != "food" && loot != "gems" && loot != "fragments") return;
    if (jest) {
        filteredLoot.produced[loot] += amount;
        filteredLoot.looted[loot] -= amount;
    } else if (fromGather) filteredLoot.produced[loot] += amount;
    else filteredLoot.looted[loot] += amount;
}

function getLootData() {
    var loots = ["metal", "wood", "food", "gems", "fragments"];
    for (var r in loots) {
        var name = loots[r];
        if (filteredLoot.produced[name]) lootData[name].push(filteredLoot.looted[name] / filteredLoot.produced[name]);
        if (lootData[name].length > 60) lootData[name].shift();
    }
}

setInterval(getLootData, 15000);

(function () {
    var resAmts;

    function storeResAmts() {
        resAmts = {};
        for (let item in lootData) {
            resAmts[item] = game.resources[item].owned;
        }
    }

    const oldJestimpLoot = game.badGuys.Jestimp.loot;
    game.badGuys.Jestimp.loot = function () {
        storeResAmts();
        var toReturn = oldJestimpLoot.apply(this, arguments);
        for (let item in resAmts) {
            var gained = game.resources[item].owned - resAmts[item];
            if (gained > 0) {
                filterLoot(item, gained, true);
            }
        }
        return toReturn;
    };

    const oldChronoimpLoot = game.badGuys.Chronoimp.loot;
    game.badGuys.Chronoimp.loot = function () {
        storeResAmts();
        var toReturn = oldChronoimpLoot.apply(this, arguments);
        for (let item in resAmts) {
            var gained = game.resources[item].owned - resAmts[item];
            if (gained > 0) {
                filterLoot(item, gained, true);
            }
        }
        return toReturn;
    };

    const oldFunction = window.addResCheckMax;
    window.addResCheckMax = (a, b, c, d, e, f) => filterLoot(a, b, null, d, f) || oldFunction(a, b, c, d, e, f);
})();

function lookUpZoneData(a, b) {
    null == b && (b = getTotalPortals(true));
    for (var c = allSaveData.length - 1; 0 <= c; c--) if (allSaveData[c].totalPortals == b && allSaveData[c].world == a) return allSaveData[c];
}

setInterval(gatherInfo, 100);
