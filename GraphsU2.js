var basepath = 'https://SadAugust.github.io/AutoTrimps_Local/';
var allSaveData2 = [];
var graph2Data2 = [];
var tmpGraphData2 = JSON.parse(localStorage.getItem('allSaveData2'));
if (tmpGraphData2 !== null) {
    console.log('Graphs: Found allSaveData2 (portal runs data). Yay!');
    allSaveData2 = tmpGraphData2;
}
function safeSetItems2(name,data) {
    try {
        localStorage.setItem(name, data);
    } catch(e) {
      if (e.code == 22) {
        // Storage full, maybe notify user or do some clean-up
        debug22("Error: LocalStorage is full, or error. Attempt to delete some portals from your graph2 or restart browser.");
      }
    }
}
var enableDebug22 = false;
function debug22(message, type, lootIcon) {
    var output = true;
    if (output) {
        if (enableDebug22)
            console.log(0 + ' ' + message);
    }
}
var MODULES2 = {};
MODULES2["graph2s2"] = {};
MODULES2["graph2s2"].useDarkAlways = false;    //set this to True to use Dark Graphs always.

//Import the Chart Libraries
var head2 = document.getElementsByTagName('head')[0];
var chartscript2 = document.createElement('script');
chartscript2.type = 'text/javascript';
chartscript2.src = 'https://code.highcharts.com/highcharts.js';
head2.appendChild(chartscript2);

//Create the graph2 button and div
var newItem2 = document.createElement("TD2");
newItem2.appendChild(document.createTextNode("Graphs U2"));
newItem2.setAttribute("class", "btn btn-default");
newItem2.setAttribute("onclick", "autoToggleGraph2(); drawGraph2();");
var settingbarRow2 = document.getElementById("settingsTable").firstElementChild.firstElementChild;
settingbarRow2.insertBefore(newItem2, settingbarRow2.childNodes[10]);
document.getElementById("settingsRow").innerHTML += '<div id="graph2Parent2" style="display: none; height: 600px; overflow: auto;"><div id="graph2" style="margin-bottom: 10px;margin-top: 5px; height: 530px;"></div>';
document.getElementById("graph2Parent2").innerHTML += '<div id="graph2Footer2" style="height: 50px;font-size: 1em;"><div id="graph2Footer2Line1" style="display: -webkit-flex;flex: 0.75;flex-direction: row; height:30px;"></div><div id="graph2Footer2Line2"></div></div>';
//Create the buttons in the graph2 Footer:
var $graph2Footer2 = document.getElementById('graph2Footer2Line1');
//$graph2Footer2.innerHTML += '\
//Create the dropdown for what graph2 to show    (these correspond to head2ings in setGraph() and have to match)
var graph2List = ['Radon - Rn/Hr','Radon - Total','RnHr % / LifetimeRn','Rn % / LifetimeRn','Radon - Rn/Hr Instant','Clear Time','Cumulative Clear Time','Run Time','Map Bonus','Void Maps','Void Map History','Loot Sources','Coordinations','Nullifium Gained','OverkillCells','Scruffy XP','Scruffy XP PerHour'];
var $graph2Sel = document.createElement("select2");
$graph2Sel.id = 'graph2Selection';
$graph2Sel.setAttribute("style", "");
//$graph2Sel.setAttribute("onmouseover", 'tooltip(\"Graph\", \"customText\", event, \"What graph2 would you like to display?\")');
//$graph2Sel.setAttribute("onmouseout", 'tooltip("hide")');
$graph2Sel.setAttribute("onchange", "drawGraph2()");
for (var item in graph2List) {
    var $opt = document.createElement("option");
    $opt.value = graph2List[item];
    $opt.text = graph2List[item];
    $graph2Sel.appendChild($opt);
}
$graph2Footer2.appendChild($graph2Sel);
//just write it in HTML instead of a million lines of DOM javascript.
$graph2Footer2.innerHTML += '\
<div><button onclick="drawGraph2(true,false)" style="margin-left:0.5em; width:2em;">↑</button></div>\
<div><button onclick="drawGraph2(false,true)" style="margin-left:0.5em; width:2em;">↓</button></div>\
<div><button onclick="drawGraph2()" style="margin-left:0.5em;">Refresh</button></div>\
<div style="flex:0 100 5%;"></div>\
<div><input type="checkbox" id="clrChkbox" onclick="toggleClearButton();"></div>\
<div style="margin-left: 0.5vw;"><button id="clrAllDataBtn" onclick="clearData(null,true); drawGraph2();" class="btn" disabled="" style="flex:auto; padding: 2px 6px;border: 1px solid white;">Clear All Previous Data</button></div>\
<div style="flex:0 100 5%;"></div>\
<div style="flex:0 2 3.5vw;"><input style="width:100%;min-width: 40px;" id="deleteSpecificTextBox"></div>\
<div style="flex:auto; margin-left: 0.5vw;"><button onclick="deleteSpecific(); drawGraph2();">Delete Specific Portal</button></div>\
<div style="flex:0 100 5%;"></div>\
<div style="flex:auto;"><button  onclick="GraphsImportExportTooltip(\'ExportGraphs\', null, \'update\')" onmouseover=\'tooltip(\"Tips\", \"customText\", event, \"Export Graph Database will make a backup of all the graph2 data to a text string.<b>DISCLAIMER:</b> Takes quite a long time to generate.\")\' onmouseout=\'tooltip(\"hide\")\'>Export your Graph Database</button></div>\
<div style="float:right; margin-right: 0.5vw;"><button onclick="addGraphNoteLabel()">Add Note/Label</button></div>\
<div style="float:right; margin-right: 0.5vw;"><button onclick="toggleSpecificGraphs()">Invert Selection</button></div>\
<div style="float:right; margin-right: 1vw;"><button onclick="toggleAllGraphs()">All Off/On</button></div>';
//TODO: make the overall hover tooltip better and seperate individual help into each button tooltip.
document.getElementById("graph2Footer2Line2").innerHTML += '\
<span style="float: left;" onmouseover=\'tooltip(\"Tips\", \"customText\", event, \"You can zoom by dragging a box around an area. You can turn portals off by clicking them on the legend. Quickly view the last portal by clicking it off, then Invert Selection. Or by clicking All Off, then clicking the portal on. To delete a portal, Type its portal number in the box and press Delete Specific. Using negative numbers in the Delete Specific box will KEEP that many portals (starting counting backwards from the current one), ie: if you have Portals 1000-1015, typing -10 will keep 1005-1015. There is a browser data storage limitation of 10MB, so do not exceed 20 portals-worth of data.\")\' onmouseout=\'tooltip(\"hide\")\'>Tips: Hover for usage tips.</span>\
<input style="height: 20px; float: right; margin-right: 0.5vw;" type="checkbox" id="rememberCB">\
<span style="float: right; margin-right: 0.5vw;">Try to Remember Which Portals are Selected when switching between Graphs:</span>\
<input onclick="toggleDarkGraphs()" style="height: 20px; float: right; margin-right: 0.5vw;" type="checkbox" id="blackCB">\
<span style="float: right; margin-right: 0.5vw;">Black Graphs:</span>';

function toggleClearButton2(){document.getElementById('clrAllDataBtn').disabled=!document.getElementById('clrChkbox').checked}
function addDarkGraphs2(){var a=document.getElementById("dark-graph.css");if(!a){var b=document.createElement("link");b.rel="stylesheet",b.type="text/css",b.id="dark-graph.css",b.href=basepath+"dark-graph.css",document.head2.appendChild(b),debug22("Adding dark-graph.css file","graph2s")}}
function removeDarkGraphs2(){var a=document.getElementById("dark-graph.css");a&&(document.head2.removeChild(a),debug22("Removing dark-graph.css file","graph2s"))}
function toggleDarkGraphs2(){if(game){var c=document.getElementById("dark-graph.css"),d=document.getElementById("blackCB").checked;!c&&(0==game.options.menu.darkTheme.enabled||2==game.options.menu.darkTheme.enabled)||MODULES2.graph2s2.useDarkAlways||d?addDarkGraphs2():c&&(1==game.options.menu.darkTheme.enabled||3==game.options.menu.darkTheme.enabled||!d)&&removeDarkGraphs2()}}var lastTheme=-1;MODULES2.graph2s2.themeChanged=function(){if(game&&game.options.menu.darkTheme.enabled!=lastTheme){function f(h){h.style.color=2==game.options.menu.darkTheme.enabled?"":"black"}function g(h){if("graph2Selection"==h.id)return void(2!=game.options.menu.darkTheme.enabled&&(h.style.color="black"))}toggleDarkGraphs2(),debug22("Theme change - AutoTrimps styles updating...");var c=document.getElementsByTagName("input"),d=document.getElementsByTagName("select2"),e=document.getElementById("graph2Footer2Line1").children;for(let h of c)f(h);for(let h of d)f(h);for(let h of e)f(h);for(let h of e)g(h)}game&&(lastTheme=game.options.menu.darkTheme.enabled)},MODULES2.graph2s2.themeChanged();
function GraphsImportExportTooltip2(a){if(!game.global.lockTooltip){var d=document.getElementById("tooltipDiv");swapClass("tooltipExtra","tooltipExtraNone",d);var f,e=null,g="";"ExportGraphs"==a&&(f="This is your GRAPH DATABASE save string. There are many like it but this one is yours. Save this save somewhere safe so you can save time next time. <br/><br/><textarea id='exportArea' style='width: 100%' rows='5'>"+JSON.stringify(allSaveData2)+"</textarea>",g="<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip()'>Got it</div>",document.queryCommandSupported("copy")?(g+="<div id='clipBoardBtn' class='btn btn-success'>Copy to Clipboard</div>",e=function(){document.getElementById("exportArea").select2(),document.getElementById("clipBoardBtn").addEventListener("click",function(){document.getElementById("exportArea").select2();try{document.execCommand("copy")}catch(i){document.getElementById("clipBoardBtn").innerHTML="Error, not copied"}})}):e=function(){document.getElementById("exportArea").select2()},g+="</div>"),"ImportGraphs"==a&&(f="Replaces your GRAPH DATABASE with this save string! It'll be fine, I promise.<br/><br/><textarea id='importBox' style='width: 100%' rows='5'></textarea>",g="<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); loadGraphs2();'>Import</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>",e=function(){document.getElementById("importBox").focus()}),"AppendGraphs"==a&&(f="Appends to your GRAPH DATABASE with this save string (combines them)! It'll be fine, I hope.<br/><br/><textarea id='importBox' style='width: 100%' rows='5'></textarea>",g="<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); appendGraphs2();'>Import</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>",e=function(){document.getElementById("importBox").focus()}),game.global.lockTooltip=!0,d.style.left="33.75%",d.style.top="25%",document.getElementById("tipTitle").innerHTML=a,document.getElementById("tipText").innerHTML=f,document.getElementById("tipCost").innerHTML=g,d.style.display="block",null!=e&&e()}}
function loadGraphs2(){var a=document.getElementById("importBox").value.replace(/(\r\n|\n|\r|\s)/gm,""),b=JSON.parse(a);null==b||(allSaveData2=b,drawGraph2())}
function appendGraphs2(){drawGraph2()}
var rememberSelectedVisible2=[];
function saveSelectedGraphs2(){rememberSelectedVisible2=[];for(var b,a=0;a<chart12.series.length;a++)b=chart12.series[a],rememberSelectedVisible2[a]=b.visible}
function applyRememberedSelections2(){for(var b,a=0;a<chart12.series.length;a++)b=chart12.series[a],!1==rememberSelectedVisible2[a]&&b.hide()}
function toggleSpecificGraphs2(){for(var b,a=0;a<chart12.series.length;a++)b=chart12.series[a],b.visible?b.hide():b.show()}
function toggleAllGraphs2(){for(var c,a=0,b=0;b<chart12.series.length;b++)c=chart12.series[b],c.visible&&a++;for(var c,b=0;b<chart12.series.length;b++)c=chart12.series[b],a>chart12.series.length/2?c.hide():c.show()}
function clearData2(a,b){if(a||(a=0),!b)for(;allSaveData2[0].totalPortals<game.global.totalRadPortals-a;)allSaveData2.shift();else for(;allSaveData2[0].totalPortals!=game.global.totalRadPortals;)allSaveData2.shift()}
function deleteSpecific2(){var a=document.getElementById("deleteSpecificTextBox").value;if(""!=a)if(0>parseInt(a))clearData2(Math.abs(a));else for(var b=allSaveData2.length-1;0<=b;b--)allSaveData2[b].totalPortals==a&&allSaveData2.splice(b,1)}
function autoToggleGraph2(){game.options.displayed&&toggleSettingsMenu();var a=document.getElementById('autoSettings');a&&'block'===a.style.display&&(a.style.display='none');var a=document.getElementById('autoTrimpsTabBarMenu');a&&'block'===a.style.display&&(a.style.display='none');var b=document.getElementById('graph2Parent2');'block'===b.style.display?b.style.display='none':(b.style.display='block',setGraph2())}
function escapeATWindows2(){var a=document.getElementById('tooltipDiv');if('none'!=a.style.display)return void cancelTooltip();game.options.displayed&&toggleSettingsMenu();var b=document.getElementById('autoSettings');'block'===b.style.display&&(b.style.display='none');var b=document.getElementById('autoTrimpsTabBarMenu');'block'===b.style.display&&(b.style.display='none');var c=document.getElementById('graph2Parent2');'block'===c.style.display&&(c.style.display='none')}document.addEventListener('keydown',function(a){1!=game.options.menu.hotkeys.enabled||game.global.preMapsActive||game.global.lockTooltip||ctrlPressed||heirloomsShown||27!=a.keyCode||escapeATWindows2()},!0);

function pushData2() {
    debug22('Starting Zone ' + game.global.world, "graph2s");
    var RgetPercent = (game.stats.heliumHour.value() / (game.global.totalRadonEarned - (game.global.radonLeftover + game.resources.radon.owned)))*100;
    var Rlifetime = (game.resources.radon.owned / (game.global.totalRadonEarned-game.resources.radon.owned))*100;

    allSaveData2.push({
        totalPortals: game.global.totalRadPortals,
        currentTime: new Date().getTime(),
        portalTime: game.global.portalTime,
        world: game.global.world,
        challenge: game.global.challengeActive,
        voids: game.global.totalVoidMaps,
        heirlooms: {"value": game.stats.totalHeirlooms.value, "valueTotal":game.stats.totalHeirlooms.valueTotal},
        nullifium: recycleAllExtraHeirlooms(true),
        coord: game.upgrades.Coordination.done,
        overkill: GraphsVars2.OVKcellsInWorld,
        zonetime: GraphsVars2.ZoneStartTime,
        mapbonus: GraphsVars2.MapBonus,
        scruffy: game.global.fluffyExp2,
        radonOwned: game.resources.radon.owned,
        rnhr: RgetPercent.toFixed(4),
        rnlife: Rlifetime.toFixed(4)
    });
    clearData2(10);
    safeSetItems2('allSaveData2', JSON.stringify(allSaveData2));
}

var graph2Anal2=[];
function trackHourlyGraphAnalytics2(){graph2Anal2.push({currentTime:new Date().getTime(),totalPortals:game.global.totalRadPortals,radonOwned:game.resources.radon.owned,highzone:game.global.highestRadonLevelCleared,bones:game.global.b}),safeSetItems2('graph2Anal2',JSON.stringify(graph2Anal2))}
trackHourlyGraphAnalytics2();
setInterval(trackHourlyGraphAnalytics2, 3600000);
function initializeData2(){null===allSaveData2&&(allSaveData2=[]),0===allSaveData2.length&&pushData2()}
var GraphsVars2={};
function InitGraphsVars2(){GraphsVars2.currentPortal=0,GraphsVars2.OVKcellsInWorld=0,GraphsVars2.lastOVKcellsInWorld=0,GraphsVars2.currentworld=0,GraphsVars2.lastrunworld=0,GraphsVars2.aWholeNewWorld=!1,GraphsVars2.lastZoneStartTime=0,GraphsVars2.ZoneStartTime=0,GraphsVars2.MapBonus=0,GraphsVars2.aWholeNewPortal=0,GraphsVars2.currentPortal=0}
InitGraphsVars2();

function gatherInfo2() {
    if (game.options.menu.pauseGame.enabled) return;
    initializeData2();
    GraphsVars2.aWholeNewPortal = GraphsVars2.currentPortal != game.global.totalRadPortals;
    if (GraphsVars2.aWholeNewPortal) {
        GraphsVars2.currentPortal = game.global.totalRadPortals;
        filteredLoot2 = {
            'produced': {
                metal: 0,
                wood: 0,
                food: 0,
                gems: 0,
                fragments: 0
            },
            'looted': {
                metal: 0,
                wood: 0,
                food: 0,
                gems: 0,
                fragments: 0
            }
        };
    }
    GraphsVars2.aWholeNewWorld = GraphsVars2.currentworld != game.global.world;
    if (GraphsVars2.aWholeNewWorld) {
        GraphsVars2.currentworld = game.global.world;
        if (allSaveData2.length > 0 && allSaveData2[allSaveData2.length - 1].world != game.global.world) {
            pushData2();
        }
        GraphsVars2.OVKcellsInWorld = 0;
        GraphsVars2.ZoneStartTime = 0;
        GraphsVars2.MapBonus = 0;
    }
    if (game.options.menu.overkillColor.enabled == 0) toggleSetting('overkillColor');
    if (game.options.menu.liquification.enabled && game.talents.liquification.purchased && !game.global.mapsActive && game.global.gridArray && game.global.gridArray[0] && game.global.gridArray[0].name == "Liquimp")
        GraphsVars2.OVKcellsInWorld = 100;
    else
        GraphsVars2.OVKcellsInWorld = document.getElementById("grid").getElementsByClassName("cellColorOverkill").length;
    GraphsVars2.ZoneStartTime = new Date().getTime() - game.global.zoneStarted;
    GraphsVars2.MapBonus = game.global.mapBonus;
}

var dataBase2 = {};
var databaseIndexEntry2 = {
    Index: 0,
    Portal: 0,
    Challenge: 0,
    World: 0
};
var databaseDirtyEntry2 = {
    State: false,
    Reason: "",
    Index: -1
};
var portalExistsArray2 = [];
var portalRunArray2 = [];
var portalRunIndex2 = 0;

function chkdsk2(){rebuildDataIndex2(),checkIndexConsistency2(),checkWorldSequentiality2(),!0==databaseDirtyEntry2.State}
function rebuildDataIndex2(){for(var a=0;a<allSaveData2.length-1;a++)dataBase2[a]={Index:a,Portal:allSaveData2[a].totalPortals,Challenge:allSaveData2[a].challenge,World:allSaveData2[a].world},portalRunArray2.push({Index:a,Portal:allSaveData2[a].totalPortals,Challenge:allSaveData2[a].challenge}),"undefined"==typeof portalExistsArray2[allSaveData2[a].totalPortals]?portalExistsArray2[allSaveData2[a].totalPortals]={Exists:!0,Row:portalRunIndex2,Index:a,Challenge:allSaveData2[a].challenge}:(databaseDirtyFlag2.State=!0,databaseDirtyFlag2.Reason="oreoportal",databaseDirtyFlag2.Index=a,row=portalExistsArray2[allSaveData2[a].totalPortals].Row),portalRunIndex2++}
function checkIndexConsistency2(){for(var a=0;a<dataBase2.length-1;a++)if(dataBase2[a].Index!=a){databaseDirtyFlag2=[!0,'index',a];break}}
function checkWorldSequentiality2(){for(var a,b,c,d=1;d<dataBase2.length-1;d++){if(lastworldEntry=dataBase2[d-1],currentworldEntry=dataBase2[d],nextworldEntry=dataBase2[d+1],a=lastworldEntry.World,b=currentworldEntry.World,c=nextworldEntry.World,a>b&&1!=b){databaseDirtyFlag2.State=!0,databaseDirtyFlag2.Reason='descending',databaseDirtyFlag2.Index=d;break}if(a>b&&1==b&&a==c){databaseDirtyFlag2.State=!0,databaseDirtyFlag2.Reason='badportal',databaseDirtyFlag2.Index=d;break}}}
function drawGraph2(a,b){var c=document.getElementById('graph2Selection');a?(c.select2edIndex--,0>c.select2edIndex&&(c.select2edIndex=0)):b&&c.select2edIndex!=c.options.length-1&&c.select2edIndex++,setgraph2Data2(c.value)}

function setgraph2Data2(graph2) {
    var title, xTitle, yTitle, yType, valueSuffix, series, formatter, xminFloor = 1,
        yminFloor = null;
    var precision = 0;
    var oldData = JSON.stringify(graph2Data2);
    valueSuffix = '';

    switch (graph2) {

        case 'Void Maps':
            var currentPortal = -1;
            var totalVoids = 0;
            var theChallenge = '';
            graph2Data2 = [];
            for (var i in allSaveData2) {
                if (allSaveData2[i].totalPortals != currentPortal) {
                    if (currentPortal == -1) {
                        theChallenge = allSaveData2[i].challenge;
                        currentPortal = allSaveData2[i].totalPortals;
                        graph2Data2.push({
                            name: 'Void Maps',
                            data: [],
                            type: 'column'
                        });
                        continue;
                    }
                    graph2Data2[0].data.push([allSaveData2[i - 1].totalPortals, totalVoids]);
                    theChallenge = allSaveData2[i].challenge;
                    totalVoids = 0;
                    currentPortal = allSaveData2[i].totalPortals;
                }
                if (allSaveData2[i].voids > totalVoids) {
                    totalVoids = allSaveData2[i].voids;
                }
            }
            title = 'Void Maps (completed)';
            xTitle = 'Portal';
            yTitle = 'Number of Void Maps';
            yType = 'Linear';
            break;

        case 'Nullifium Gained':
            var currentPortal = -1;
            var totalNull = 0;
            var theChallenge = '';
            graph2Data2 = [];
            var averagenulli = 0;
            var sumnulli = 0;
            var count = 0;
            for (var i in allSaveData2) {
                if (allSaveData2[i].totalPortals != currentPortal) {
                    if (currentPortal == -1) {
                        theChallenge = allSaveData2[i].challenge;
                        currentPortal = allSaveData2[i].totalPortals;
                        graph2Data2.push({
                            name: 'Nullifium Gained',
                            data: [],
                            type: 'column'
                        });
                        continue;
                    }
                    graph2Data2[0].data.push([allSaveData2[i - 1].totalPortals, totalNull]);
                    count++;
                    sumnulli += totalNull;
                    theChallenge = allSaveData2[i].challenge;
                    totalNull = 0;
                    currentPortal = allSaveData2[i].totalPortals;

                }
                if (allSaveData2[i].nullifium > totalNull) {
                    totalNull = allSaveData2[i].nullifium;
                }
            }
            averagenulli = sumnulli / count;
            title = 'Nullifium Gained Per Portal';
            if (averagenulli)
                title = "Average " + title + " = " + averagenulli;
            xTitle = 'Portal';
            yTitle = 'Nullifium Gained';
            yType = 'Linear';
            break;

        case 'Loot Sources':
            graph2Data2 = [];
            graph2Data2[0] = {
                name: 'Metal',
                data: lootData2.metal
            };
            graph2Data2[1] = {
                name: 'Wood',
                data: lootData2.wood
            };
            graph2Data2[2] = {
                name: 'Food',
                data: lootData2.food
            };
            graph2Data2[3] = {
                name: 'Gems',
                data: lootData2.gems
            };
            graph2Data2[4] = {
                name: 'Fragments',
                data: lootData2.fragments
            };
            title = 'Current Loot Sources (of all resources gained) - for the last 15 minutes';
            xTitle = 'Time (every 15 seconds)';
            yTitle = 'Ratio of looted to gathered';
            valueSuffix = '%';
            formatter = function() {
                return Highcharts.numberFormat(this.y, 3);
            };
            break;

        case 'Clear Time #2':
            graph2Data2 = allPurposeGraph2('cleartime2', true, null,
                function specialCalc(e1, e2) {
                    return Math.round(e1.zonetime / 1000);
                });
            title = '(#2) Time to Clear Zone';
            xTitle = 'Zone';
            yTitle = 'Clear Time';
            yType = 'Linear';
            valueSuffix = ' Seconds';
            break;
        case 'Clear Time':
            graph2Data2 = allPurposeGraph2('cleartime1', true, null,
                function specialCalc(e1, e2) {
                    return Math.round(((e1.currentTime - e2.currentTime) - (e1.portalTime - e2.portalTime)) / 1000);
                });
            title = 'Time to clear zone';
            xTitle = 'Zone';
            yTitle = 'Clear Time';
            yType = 'Linear';
            valueSuffix = ' Seconds';
            yminFloor = 0;
            break;
        case 'Cumulative Clear Time #2':
            graph2Data2 = allPurposeGraph2('cumucleartime2', true, null,
                function specialCalc(e1, e2) {
                    return Math.round(e1.zonetime);
                }, true);
            title = '(#2) Cumulative Time (at END of zone#)';
            xTitle = 'Zone';
            yTitle = 'Cumulative Clear Time';
            yType = 'datetime';
            formatter = function() {
                var ser = this.series;
                return '<span style="color:' + ser.color + '" >●</span> ' +
                    ser.name + ': <b>' +
                    Highcharts.dateFormat('%H:%M:%S', this.y) + '</b><br>';

            };
            yminFloor = 0;
            break;
        case 'Cumulative Clear Time':
            graph2Data2 = allPurposeGraph2('cumucleartime1', true, null,
                function specialCalc(e1, e2) {
                    return Math.round((e1.currentTime - e2.currentTime) - (e1.portalTime - e2.portalTime));
                }, true);
            title = 'Cumulative Time (at END of zone#)';
            xTitle = 'Zone';
            yTitle = 'Cumulative Clear Time';
            yType = 'datetime';
            formatter = function() {
                var ser = this.series;
                return '<span style="color:' + ser.color + '" >●</span> ' +
                    ser.name + ': <b>' +
                    Highcharts.dateFormat('%H:%M:%S', this.y) + '</b><br>';

            };
            yminFloor = 0;
            break;

        case 'Run Time':
            var currentPortal = -1;
            var theChallenge = '';
            graph2Data2 = [];
            for (var i in allSaveData2) {
                if (allSaveData2[i].totalPortals != currentPortal) {
                    if (currentPortal == -1) {
                        theChallenge = allSaveData2[i].challenge;
                        currentPortal = allSaveData2[i].totalPortals;
                        graph2Data2.push({
                            name: 'Run Time',
                            data: [],
                            type: 'column'
                        });
                        continue;
                    }
                    var theOne = allSaveData2[i - 1];
                    var runTime = theOne.currentTime - theOne.portalTime;
                    graph2Data2[0].data.push([theOne.totalPortals, runTime]);
                    theChallenge = allSaveData2[i].challenge;
                    currentPortal = allSaveData2[i].totalPortals;
                }
            }
            title = 'Total Run Time';
            xTitle = 'Portal';
            yTitle = 'Time';
            yType = 'datetime';
            formatter = function() {
                var ser = this.series;
                return '<span style="color:' + ser.color + '" >●</span> ' +
                    ser.name + ': <b>' +
                    Highcharts.dateFormat('%H:%M:%S', this.y) + '</b><br>';
             };
            break;

        case 'Radon - Rn/Hr':
            graph2Data2 = allPurposeGraph2('radonhr', true, null,
                function specialCalc(e1, e2) {
                    return Math.floor(e1.radonOwned / ((e1.currentTime - e1.portalTime) / 3600000));
                });
            title = 'Radon/Hour (Cumulative)';
            xTitle = 'Zone';
            yTitle = 'Radon/Hour';
            yType = 'Linear';
            yminFloor = 0;
            precision = 2;
            break;
        case 'Radon - Total':
            graph2Data2 = allPurposeGraph2('radonOwned', true, null,
                function specialCalc(e1, e2) {
                    return Math.floor(e1.radonOwned);
                });
            title = 'Radon (Lifetime Total)';
            xTitle = 'Zone';
            yTitle = 'Radon';
            yType = 'Linear';
            break;
        case 'RnHr % / LifetimeHe':
            graph2Data2 = allPurposeGraph2('rnhr', true, "string");
            title = 'Rn/Hr % of LifetimeHe';
            xTitle = 'Zone';
            yTitle = 'Rn/Hr % of LifetimeHe';
            yType = 'Linear';
            precision = 4;
            break;
        case 'Rn % / LifetimeHe':
            graph2Data2 = allPurposeGraph2('rnlife', true, "string");
            title = 'Rn % of LifetimeRn';
            xTitle = 'Zone';
            yTitle = 'Rn % of LifetimeRn';
            yType = 'Linear';
            precision = 4;
            break;
        case 'Radon - Rn/Hr Instant':
            var currentPortal = -1;
            var currentZone = -1;
            graph2Data2 = [];
            var nowhehr=0;var lasthehr=0;
            var dailyMultGraph = (countDailyWeight() === 0 ? 1 : 1 + getDailyHeliumValue(countDailyWeight()) / 100)
            for (var i in allSaveData2) {
                if (allSaveData2[i].totalPortals != currentPortal) {
                    graph2Data2.push({
                        name: 'Portal ' + allSaveData2[i].totalPortals + ': ' + allSaveData2[i].challenge,
                        data: []
                    });
                    currentPortal = allSaveData2[i].totalPortals;
                    if(allSaveData2[i].world == 1 && currentZone != -1 )
                        graph2Data2[graph2Data2.length -1].data.push(0);

                    if(currentZone == -1 || allSaveData2[i].world != 1) {
                        var loop = allSaveData2[i].world;
                        while (loop > 0) {
                            graph2Data2[graph2Data2.length -1].data.push(0);
                            loop--;
                        }
                    }
                    nowhehr = 0; lasthehr = 0;
                }
                if(currentZone < allSaveData2[i].world && currentZone != -1) {
                    nowhehr = Math.floor((allSaveData2[i].radonOwned - allSaveData2[i-1].radonOwned)*dailyMultGraph / ((allSaveData2[i].currentTime - allSaveData2[i-1].currentTime) / 3600000));
                    graph2Data2[graph2Data2.length - 1].data.push(nowhehr);
                }
                currentZone = allSaveData2[i].world;
            }
            title = 'Radon/Hour Instantaneous - between current and last zone.';
            xTitle = 'Zone';
            yTitle = 'Radon/Hour per each zone';
            yType = 'Linear';
            yminFloor=null;
            break;
        case 'Void Map History':
            graph2Data2 = allPurposeGraph2('voids', true, "number");
            title = 'Void Map History (voids finished during the same level acquired (with RunNewVoids) are not counted/tracked)';
            xTitle = 'Zone';
            yTitle = 'Number of Void Maps';
            yType = 'Linear';
            break;
        case 'Map Bonus':
            graph2Data2 = allPurposeGraph2('mapbonus', true, "number");
            title = 'Map Bonus History';
            xTitle = 'Zone';
            yTitle = 'Map Bonus Stacks';
            yType = 'Linear';
            break;
        case 'Coordinations':
            graph2Data2 = allPurposeGraph2('coord', true, "number");
            title = 'Coordination History';
            xTitle = 'Zone';
            yTitle = 'Coordination';
            yType = 'Linear';
            break;
        case 'Scruffy XP':
            graph2Data2 = allPurposeGraph2('scruffy', true, "number");
            title = 'Scruffy XP (Lifetime Total)';
            xTitle = 'Zone';
            yTitle = 'Scruffy XP';
            yType = 'Linear';
            xminFloor = 0;
            break;
        case 'Scruffy XP PerHour':
            var currentPortal = -1;
            var currentZone = -1;
            var startScruffy = 0;
            graph2Data2 = [];
            for (var i in allSaveData2) {
                if (allSaveData2[i].totalPortals != currentPortal) {
                    graph2Data2.push({
                        name: 'Portal ' + allSaveData2[i].totalPortals + ': ' + allSaveData2[i].challenge,
                        data: []
                    });
                    currentPortal = allSaveData2[i].totalPortals;
                    currentZone = 0;
                    startScruffy = allSaveData2[i].scruffy;
                }
                    if (currentZone != allSaveData2[i].world - 1 && i > 0) {
                        var loop = allSaveData2[i].world - 1 - currentZone;
                        while (loop > 0) {
                            graph2Data2[graph2Data2.length - 1].data.push(allSaveData2[i-1][item]*1);
                            loop--;
                        }
                    }
                if (currentZone != 0) {
                    graph2Data2[graph2Data2.length - 1].data.push(Math.floor((allSaveData2[i].scruffy - startScruffy) / ((allSaveData2[i].currentTime - allSaveData2[i].portalTime) / 3600000)));
                }
                currentZone = allSaveData2[i].world;
            }
            title = 'Scruffy XP/Hour (Cumulative)';
            xTitle = 'Zone';
            yTitle = 'Scruffy XP/Hour';
            yType = 'Linear';
            xminFloor = 1;
            break;
        case 'OverkillCells':
            var currentPortal = -1;
            graph2Data2 = [];
            for (var i in allSaveData2) {
                if (allSaveData2[i].totalPortals != currentPortal) {
                    graph2Data2.push({
                        name: 'Portal ' + allSaveData2[i].totalPortals + ': ' + allSaveData2[i].challenge,
                        data: []
                    });
                    currentPortal = allSaveData2[i].totalPortals;
                    if (allSaveData2[i].world == 1 && currentZone != -1)
                        graph2Data2[graph2Data2.length - 1].data.push(0);

                    if (currentZone == -1 || allSaveData2[i].world != 1) {
                        var loop = allSaveData2[i].world;
                        while (loop > 0) {
                            graph2Data2[graph2Data2.length - 1].data.push(0);
                            loop--;
                        }
                    }
                }
                if (currentZone < allSaveData2[i].world && currentZone != -1) {
                    var num = allSaveData2[i].overkill;
                    if (num)
                        graph2Data2[graph2Data2.length - 1].data.push(num);
                }
                currentZone = allSaveData2[i].world;
            }
            title = 'Overkilled Cells';
            xTitle = 'Zone';
            yTitle = 'Overkilled Cells';
            yType = 'Linear';
            break;
}

    function allPurposeGraph2(item, extraChecks, typeCheck, funcToRun, useAccumulator) {
        var currentPortal = -1;
        var currentZone = 0;
        var accumulator = 0;
        graph2Data2 = [];
        for (var i in allSaveData2) {
            if (typeCheck && typeof allSaveData2[i][item] != typeCheck)
                continue;
            if (allSaveData2[i].totalPortals != currentPortal) {
                graph2Data2.push({
                    name: 'Portal ' + allSaveData2[i].totalPortals + ': ' + allSaveData2[i].challenge,
                    data: []
                });
                currentPortal = allSaveData2[i].totalPortals;
                currentZone = 0;
                if (funcToRun) {
                    accumulator = 0;
                    graph2Data2[graph2Data2.length - 1].data.push(0);
                }
                continue;
            }
            if (extraChecks) {
                if (currentZone != allSaveData2[i].world - 1) {
                    var loop = allSaveData2[i].world - 1 - currentZone;
                    while (loop > 0) {
                        graph2Data2[graph2Data2.length - 1].data.push(allSaveData2[i - 1][item] * 1);
                        loop--;
                    }
                }
            }
            if (funcToRun && !useAccumulator && currentZone != 0) {
                var num = funcToRun(allSaveData2[i], allSaveData2[i - 1]);
                if (num < 0) num = 1;
                graph2Data2[graph2Data2.length - 1].data.push(num);
            } else if (funcToRun && useAccumulator && currentZone != 0) {
                accumulator += funcToRun(allSaveData2[i], allSaveData2[i - 1]);
                if (accumulator < 0) accumulator = 1;
                graph2Data2[graph2Data2.length - 1].data.push(accumulator);
            } else {
                if (allSaveData2[i][item] >= 0)
                    graph2Data2[graph2Data2.length - 1].data.push(allSaveData2[i][item] * 1);
                else if (extraChecks)
                    graph2Data2[graph2Data2.length - 1].data.push(-1);
            }
            currentZone = allSaveData2[i].world;
        }
        return graph2Data2;
    }
    formatter = formatter || function() {
        var ser = this.series;
        return '<span style="color:' + ser.color + '" >●</span> ' +
            ser.name + ': <b>' +
            prettify(this.y) + valueSuffix + '</b><br>';
    };
    var additionalParams = {};
    if (oldData != JSON.stringify(graph2Data2)) {
        saveSelectedGraphs2();
        setGraph2(title, xTitle, yTitle, valueSuffix, formatter, graph2Data2, yType, xminFloor, yminFloor, additionalParams);
    }
    if (graph2 == 'Loot Sources') {
        chart12.xAxis[0].tickInterval = 1;
        chart12.xAxis[0].minorTickInterval = 1;
    }
    if (document.getElementById('rememberCB').checked) {
        applyRememberedSelections2();
    }
}

var chart12;

function setGraph2(title, xTitle, yTitle, valueSuffix, formatter, series, yType, xminFloor, yminFloor, additionalParams) {
    chart12 = new Highcharts.Chart({
        chart: {
            renderTo: 'graph2',
            zoomType: 'xy',
            resetZoomButton: {
                position: {
                    align: 'right',
                    verticalAlign: 'top',
                    x: -20,
                    y: 15
                },
                relativeTo: 'chart'
            }
        },
        title: {
            text: title,
            x: -20
        },
        plotOptions: {
            series: {
                lineWidth: 1,
                animation: false,
                marker: {
                    enabled: false
                }
            }
        },
        xAxis: {
            floor: xminFloor,
            title: {
                text: xTitle
            },
        },
        yAxis: {
            floor: yminFloor,
            title: {
                text: yTitle
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }],
            type: yType,
            dateTimeLabelFormats: {
            second: '%H:%M:%S',
            minute: '%H:%M:%S',
            hour: '%H:%M:%S',
            day: '%H:%M:%S',
            week: '%H:%M:%S',
            month: '%H:%M:%S',
            year: '%H:%M:%S'
        }
        },
        tooltip: {
            pointFormatter: formatter,
            valueSuffix: valueSuffix
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: series,
        additionalParams
    });
}

function setColor2(tmp) {
    for (var i in tmp) {
        tmp[i].color = (i == tmp.length - 1) ? '#FF0000' :
            '#90C3D4';
    }
    return tmp;
}

var filteredLoot2 = {
    'produced': {
        metal: 0,
        wood: 0,
        food: 0,
        gems: 0,
        fragments: 0
    },
    'looted': {
        metal: 0,
        wood: 0,
        food: 0,
        gems: 0,
        fragments: 0
    }
};
var lootData2 = {
    metal: [],
    wood: [],
    food: [],
    gems: [],
    fragments: []
};

function filterLoot2(loot, amount, jest, fromGather) {
    if (loot != 'wood' && loot != 'metal' && loot != 'food' && loot != 'gems' && loot != 'fragments') return;
    if (jest) {
        filteredLoot2.produced[loot] += amount;
        filteredLoot2.looted[loot] -= amount;
    } else if (fromGather) filteredLoot2.produced[loot] += amount;
    else filteredLoot2.looted[loot] += amount;
}

function getLootData2() {
    var loots = ['metal', 'wood', 'food', 'gems', 'fragments'];
    for (var r in loots) {
        var name = loots[r];
        if (filteredLoot2.produced[name])
            lootData2[name].push(filteredLoot2.looted[name] / filteredLoot2.produced[name]);
        if (lootData2[name].length > 60) lootData2[name].shift();
    }
}

setInterval(getLootData2, 15000);

(function() {
    var resAmts;

    function storeResAmts2() {
        resAmts = {};
        for (let item in lootData2) {
            resAmts[item] = game.resources[item].owned;
        }
    }

    const oldJestimpLoot = game.badGuys.Jestimp.loot;
    game.badGuys.Jestimp.loot =
        function() {
            storeResAmts2();
            var toReturn = oldJestimpLoot.apply(this, arguments);
            for (let item in resAmts) {
                var gained = game.resources[item].owned - resAmts[item];
                if (gained > 0) {
                    filterLoot2(item, gained, true);
                }
            }
            return toReturn;
        };

    const oldChronoimpLoot = game.badGuys.Chronoimp.loot;
    game.badGuys.Chronoimp.loot =
        function() {
            storeResAmts2();
            var toReturn = oldChronoimpLoot.apply(this, arguments);
            for (let item in resAmts) {
                var gained = game.resources[item].owned - resAmts[item];
                if (gained > 0) {
                    filterLoot2(item, gained, true);
                }
            }
            return toReturn;
        };

    const oldFunction = window.addResCheckMax;
    window.addResCheckMax = (a, b, c, d, e, f) => filterLoot(a, b, null, d, f) || oldFunction(a, b, c, d, e, f);
})();

function lookUpZoneData2(a,b){null==b&&(b=game.global.totalRadPortals);for(var c=allSaveData2.length-1;0<=c;c--)if(allSaveData2[c].totalPortals==b&&allSaveData2[c].world==a)return allSaveData2[c]}

setInterval(gatherInfo2, 100);
