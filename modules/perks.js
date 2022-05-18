var AutoPerks = {};
MODULES["perks"] = {};
MODULES["perks"].showDetails = true;

var head = document.getElementsByTagName('head')[0];
var queuescript = document.createElement('script');
queuescript.type = 'text/javascript';
queuescript.src = 'https://SadAugust.github.io/AutoTrimps_Local/FastPriorityQueue.js';
head.appendChild(queuescript);
if (game.global.universe == 1) {
//[looting,toughness,power,motivation,pheromones,artisanistry,carpentry,resilience,coordinated,resourceful,overkill,cunning,curious,classy]
var preset_space = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var preset_Zek059 = [7, 0.6, 3, 0.8, 0.3, 3, 25, 0.6, 0, 0, 0, 0, 0, 0];
var preset_Zek100 = [9.8, 1.8, 3.2, 2.6, 0.7, 2.9, 25, 1.8, 0, 0, 0, 0, 0, 0];
var preset_Zek180 = [13, 1.3, 4, 2.6, 0.7, 2.9, 25, 1.3, 37, 0.05, 1, 0, 0, 0];
var preset_Zek229 = [11.2, 0.58, 2.37, 1.464, 0.3, 2.02, 12.2, 0.58, 39, 0.22, 2.2, 0, 0, 0];
var preset_Zek299 = [16.8, 3, 1.9, 1.1, 1.2, 1, 17.1, 3, 105, 0.06, 0.8, 0, 0];
var preset_Zek399 = [135, 6.1, 18.5, 6.5, 2.5, 6, 17, 6.1, 28, 0.08, 1, 0, 0];
var preset_Zek449 = [245, 5.85, 29, 1.95, 2.8, 6, 6.1, 5.85, 18, 0.05, 1, 57, 0, 0];
var preset_Zek450 = [450, 0.9, 48, 3.35, 1, 2.8, 7.8, 1.95, 10, 0.03, 1, 120, 175, 0];
var preset_Zek500 = [600, 2.4, 60, 2, 1, 2.5, 8, 2.4, 8, 0.02, 1, 145, 180, 130];
var preset_Zek550 = [700, 2.8, 70, 1.4, 1, 2.2, 7.5, 2.8, 8, 0.003, 1, 50, 80, 45];
var presetList = [preset_Zek059,preset_Zek100,preset_Zek180,preset_Zek229,preset_Zek299,preset_Zek399,preset_Zek449,preset_Zek450,preset_Zek500,preset_Zek550,preset_space];
var presetListHtml = "\
<option id='preset_Zek059'>Zeker0 (z1-59)</option>\
<option id='preset_Zek100'>Zeker0 (z60-100)</option>\
<option id='preset_Zek180'>Zeker0 (z101-180)</option>\
<option id='preset_Zek229'>Zeker0 (z181-229)</option>\
<option id='preset_Zek299'>Zeker0 (z230-299)</option>\
<option id='preset_Zek399'>Zeker0 (z300-399)</option>\
<option id='preset_Zek449'>Zeker0 (z400-449)</option>\
<option id='preset_Zek450'>Zeker0 (z450-500)</option>\
<option id='preset_Zek500'>Zeker0 (z501-549)</option>\
<option id='preset_Zek500'>Zeker0 (z550+)</option>\
<option id='preset_space'>--------------</option>\
<option id='customPreset'>CUSTOM ratio</option></select>";
AutoPerks.createInput = function(perkname,div) {
    var perk1input = document.createElement("Input");
    perk1input.id = perkname + 'Ratio';
    var oldstyle = 'text-align: center; width: calc(100vw/36); font-size: 1.0vw; ';
    if(game.options.menu.darkTheme.enabled != 2) perk1input.setAttribute("style", oldstyle + " color: black;");
    else perk1input.setAttribute('style', oldstyle);
    perk1input.setAttribute('class', 'perkRatios');
    perk1input.setAttribute('onchange', 'AutoPerks.switchToCustomRatios()');
    var perk1label = document.createElement("Label");
    perk1label.id = perkname + 'Label';
    perk1label.innerHTML = perkname;
    perk1label.setAttribute('style', 'margin-right: 0.7vw; width: calc(100vw/18); color: white; font-size: 0.9vw; font-weight: lighter; margin-left: 0.3vw; ');
    div.appendChild(perk1input);
    div.appendChild(perk1label);
}
AutoPerks.GUI = {};
AutoPerks.removeGUI = function() {
    Object.keys(AutoPerks.GUI).forEach(function(key) {
      var $elem = AutoPerks.GUI[key];
      if (!$elem) {
          console.log("error in: "+key);
          return;
      }
      if ($elem.parentNode) {
        $elem.parentNode.removeChild($elem);
        delete $elem;
      }
    });
}
AutoPerks.displayGUI = function() {
    let apGUI = AutoPerks.GUI;
    var $buttonbar = document.getElementById("portalBtnContainer");
    apGUI.$allocatorBtn1 = document.createElement("DIV");
    apGUI.$allocatorBtn1.id = 'allocatorBtn1';
    apGUI.$allocatorBtn1.setAttribute('class', 'btn inPortalBtn settingsBtn settingBtntrue');
    apGUI.$allocatorBtn1.setAttribute('onclick', 'AutoPerks.clickAllocate()');
    apGUI.$allocatorBtn1.textContent = 'Allocate Perks';
    $buttonbar.appendChild(apGUI.$allocatorBtn1);
    $buttonbar.setAttribute('style', 'margin-bottom: 0.8vw;');
    apGUI.$customRatios = document.createElement("DIV");
    apGUI.$customRatios.id = 'customRatios';
    //Line 1 of the UI
    apGUI.$ratiosLine1 = document.createElement("DIV");
    apGUI.$ratiosLine1.setAttribute('style', 'display: inline-block; text-align: left; width: 100%');
    var listratiosLine1 = ["Overkill","Resourceful","Coordinated","Resilience","Carpentry","Pheromones","Motivation"];
    for (var i in listratiosLine1)
        AutoPerks.createInput(listratiosLine1[i],apGUI.$ratiosLine1);
    apGUI.$customRatios.appendChild(apGUI.$ratiosLine1);
    //Line 2 of the UI
    apGUI.$ratiosLine2 = document.createElement("DIV");
    apGUI.$ratiosLine2.setAttribute('style', 'display: inline-block; text-align: left; width: 100%');
    var listratiosLine2 = ["Power","Looting","Artisanistry","Cunning","Curious","Classy"];
    for (var i in listratiosLine2)
        AutoPerks.createInput(listratiosLine2[i],apGUI.$ratiosLine2);
    //Create dump perk dropdown
    apGUI.$dumpperklabel = document.createElement("Label");
    apGUI.$dumpperklabel.id = 'DumpPerk Label';
    apGUI.$dumpperklabel.innerHTML = "Dump Perk:";
    apGUI.$dumpperklabel.setAttribute('style', 'margin-right: 1vw; color: white; font-size: 0.9vw;');
    apGUI.$dumpperk = document.createElement("select");
    apGUI.$dumpperk.id = 'dumpPerk';
    apGUI.$dumpperk.setAttribute('onchange', 'AutoPerks.saveDumpPerk()');
    var oldstyle = 'text-align: center; width: 8vw; font-size: 0.8vw; font-weight: lighter; ';
    if(game.options.menu.darkTheme.enabled != 2) apGUI.$dumpperk.setAttribute("style", oldstyle + " color: black;");
    else apGUI.$dumpperk.setAttribute('style', oldstyle);
    //Add the dump perk dropdown to UI Line 2
    apGUI.$ratiosLine2.appendChild(apGUI.$dumpperklabel);
    apGUI.$ratiosLine2.appendChild(apGUI.$dumpperk);
    apGUI.$ratioPresetLabel = document.createElement("Label");
    apGUI.$ratioPresetLabel.id = 'Ratio Preset Label';
    apGUI.$ratioPresetLabel.innerHTML = "Ratio Preset:";
    apGUI.$ratioPresetLabel.setAttribute('style', 'margin-right: 0.5vw; color: white; font-size: 0.9vw;');
    apGUI.$ratioPreset = document.createElement("select");
    apGUI.$ratioPreset.id = 'ratioPreset';
    apGUI.$ratioPreset.setAttribute('onchange', 'AutoPerks.setDefaultRatios()');
    oldstyle = 'text-align: center; width: 8vw; font-size: 0.8vw; font-weight: lighter; ';
    if(game.options.menu.darkTheme.enabled != 2) apGUI.$ratioPreset.setAttribute("style", oldstyle + " color: black;");
    else apGUI.$ratioPreset.setAttribute('style', oldstyle);
    apGUI.$ratioPreset.innerHTML = presetListHtml;
    var loadLastPreset = localStorage.getItem('AutoperkSelectedRatioPresetID');
    var setID;
    if (loadLastPreset != null) { 
       if (loadLastPreset == 15 && !localStorage.getItem('AutoperkSelectedRatioPresetName'))
            loadLastPreset = 11;
        if (localStorage.getItem('AutoperkSelectedRatioPresetName')=="customPreset")
            loadLastPreset = 11;
        setID = loadLastPreset;
    }
    else 
        setID = 0;
    apGUI.$ratioPreset.selectedIndex = setID;
    apGUI.$ratiosLine1.appendChild(apGUI.$ratioPresetLabel);
    apGUI.$ratiosLine1.appendChild(apGUI.$ratioPreset);
    apGUI.$customRatios.appendChild(apGUI.$ratiosLine2);
    var $portalWrapper = document.getElementById("portalWrapper")
    $portalWrapper.appendChild(apGUI.$customRatios);
    AutoPerks.initializePerks();
    AutoPerks.populateDumpPerkList();
}

AutoPerks.populateDumpPerkList = function() {
    var $dumpDropdown = document.getElementById('dumpPerk');
    if ($dumpDropdown == null) return;
    var html = "";
    var dumpperks = AutoPerks.getVariablePerks();
    for(var i in dumpperks)
        html += "<option id='"+dumpperks[i].name+"Dump'>"+AutoPerks.capitaliseFirstLetter(dumpperks[i].name)+"</option>"
    html += "<option id='none'>None</option></select>";
    $dumpDropdown.innerHTML = html;
    var loadLastDump = localStorage.getItem('AutoperkSelectedDumpPresetID');
    if (loadLastDump != null)
        $dumpDropdown.selectedIndex = loadLastDump;
    else
        $dumpDropdown.selectedIndex = $dumpDropdown.length - 2;
}

AutoPerks.saveDumpPerk = function() {
    var $dump = document.getElementById("dumpPerk");
    safeSetItems('AutoperkSelectedDumpPresetID', $dump.selectedIndex);
    safeSetItems('AutoperkSelectedDumpPresetName', $dump.value);
}

AutoPerks.saveCustomRatios = function() {
    if (document.getElementById("ratioPreset").selectedIndex == document.getElementById("ratioPreset").length-1) {
        var $perkRatioBoxes = document.getElementsByClassName('perkRatios');
        var customRatios = [];
        for(var i = 0; i < $perkRatioBoxes.length; i++) {
            customRatios.push({'id':$perkRatioBoxes[i].id,'value':parseFloat($perkRatioBoxes[i].value)});
        }
        safeSetItems('AutoPerksCustomRatios', JSON.stringify(customRatios) );
    }
}

AutoPerks.switchToCustomRatios = function() {
    var $rp = document.getElementById("ratioPreset");
    if ($rp.selectedIndex != $rp.length-1)
        ($rp.selectedIndex = $rp.length-1);
}

AutoPerks.setDefaultRatios = function() {
    var $perkRatioBoxes = document.getElementsByClassName("perkRatios");
    var $rp = document.getElementById("ratioPreset");
    if (!$rp || !$perkRatioBoxes || !$rp.selectedOptions[0]) return;
    var ratioSet = $rp.selectedIndex;
    var currentPerk;
    for(var i = 0; i < $perkRatioBoxes.length; i++) {
        currentPerk = AutoPerks.getPerkByName($perkRatioBoxes[i].id.substring(0, $perkRatioBoxes[i].id.length - 5)); // Remove "ratio" from the id to obtain the perk name
        $perkRatioBoxes[i].value = currentPerk.value[ratioSet];
    }
    if (ratioSet == $rp.length-1) {
        var tmp = JSON.parse(localStorage.getItem('AutoPerksCustomRatios'));
        if (tmp !== null)
            AutoPerks.GUI.$customRatios = tmp;
        else {
            for(var i = 0; i < $perkRatioBoxes.length; i++)
                $perkRatioBoxes[i].value = 1;
            return;
        }
        for(var i = 0; i < $perkRatioBoxes.length; i++) {
            if (AutoPerks.GUI.$customRatios[i].id != $perkRatioBoxes[i].id) continue;
            currentPerk = AutoPerks.getPerkByName($perkRatioBoxes[i].id.substring(0, $perkRatioBoxes[i].id.length - 5)); // Remove "ratio" from the id to obtain the perk name
            $perkRatioBoxes[i].value = AutoPerks.GUI.$customRatios[i].value;
        }
    }
    safeSetItems('AutoperkSelectedRatioPresetID', ratioSet);
    safeSetItems('AutoperkSelectedRatioPresetName', $rp.selectedOptions[0].id);
}

AutoPerks.updatePerkRatios = function() {
    var $perkRatioBoxes = document.getElementsByClassName('perkRatios');
    var currentPerk;
    for(var i = 0; i < $perkRatioBoxes.length; i++) {
        currentPerk = AutoPerks.getPerkByName($perkRatioBoxes[i].id.substring(0, $perkRatioBoxes[i].id.length - 5)); // Remove "ratio" from the id to obtain the perk name
        currentPerk.updatedValue = parseFloat($perkRatioBoxes[i].value);
    }
    AutoPerks.getPerkByName("toughness").updatedValue = AutoPerks.getPerkByName("resilience").updatedValue / 2;
    // Manually update tier II perks
    var tierIIPerks = AutoPerks.getTierIIPerks();
    for(var i in tierIIPerks)
        tierIIPerks[i].updatedValue = tierIIPerks[i].parent.updatedValue / tierIIPerks[i].relativeIncrease;
}

AutoPerks.initialise = function() {
    AutoPerks.saveCustomRatios();
    AutoPerks.initializePerks();
    AutoPerks.updatePerkRatios();
}

AutoPerks.clickAllocate = function() {
    AutoPerks.initialise();

    var helium = AutoPerks.getHelium();

    var preSpentHe = 0;
    var fixedPerks = AutoPerks.getFixedPerks();
    for (var i in fixedPerks) {
        fixedPerks[i].level = game.portal[AutoPerks.capitaliseFirstLetter(fixedPerks[i].name)].level;
        var price = AutoPerks.calculateTotalPrice(fixedPerks[i], fixedPerks[i].level);
        fixedPerks[i].spent += price;
        preSpentHe += price;
    }
    if (preSpentHe)
        debug("AutoPerks: Your existing fixed-perks reserve Helium: " + prettify(preSpentHe), "perks");

    var remainingHelium = 0;
    if (!Number.isSafeInteger(helium)) {
        remainingHelium = (helium - preSpentHe) * 0.999;
    }
    else {
        remainingHelium = helium - preSpentHe;
    }
    if (Number.isNaN(remainingHelium))
        debug("AutoPerks: Major Error: Reading your Helium amount. " + remainingHelium, "perks");    

    var result;
    if (getPageSetting('fastallocate')==true)
        result = AutoPerks.spendHelium2(remainingHelium);
    else
        result = AutoPerks.spendHelium(remainingHelium);
    if (result == false) {
        debug("AutoPerks: Major Error: Make sure all ratios are set properly.","perks");
        return;
    }
    var perks = AutoPerks.getOwnedPerks();
    AutoPerks.applyCalculations(perks,remainingHelium);
    debug("AutoPerks: Auto-Allocate Finished.","perks");
}

AutoPerks.getHelium = function() {
    var respecMax = (game.global.viewingUpgrades) ? game.global.heliumLeftover : game.global.heliumLeftover + game.resources.helium.owned;
    for (var item in game.portal){
        if (game.portal[item].locked) continue;
        var portUpgrade = game.portal[item];
        if (typeof portUpgrade.level === 'undefined') continue;
        respecMax += portUpgrade.heliumSpent;
    }
    return respecMax;
}

AutoPerks.calculatePrice = function(perk, level) {
    if(perk.fluffy) return Math.ceil(perk.base * Math.pow(10,level));
    else if(perk.type == 'exponential') return Math.ceil(level/2 + perk.base * Math.pow(perk.exprate, level));
    else if(perk.type == 'linear') return Math.ceil(perk.base + perk.increase * level);
}
AutoPerks.calculateTotalPrice = function(perk, finalLevel) {
    if(perk.type == 'linear' && !perk.fluffy)
        return AutoPerks.calculateTIIprice(perk, finalLevel);
    var totalPrice = 0;
    for(var i = 0; i < finalLevel; i++) {
        totalPrice += AutoPerks.calculatePrice(perk, i);
    }
    return totalPrice;
}
AutoPerks.calculateTIIprice = function(perk, finalLevel) {
    return Math.ceil((((finalLevel - 1) * finalLevel) / 2 * perk.increase) + (perk.base * finalLevel));
}
AutoPerks.calculateIncrease = function(perk, level) {
    var increase = 0;
    var value;

    if(perk.updatedValue != -1) value = perk.updatedValue;
    else value = perk.value;

    if(perk.compounding) increase = perk.baseIncrease;
    else increase = (1 + (level + 1) * perk.baseIncrease) / ( 1 + level * perk.baseIncrease) - 1;
    return increase / perk.baseIncrease * value;
}

AutoPerks.spendHelium = function(helium) {
    debug("Beginning AutoPerks1 calculate how to spend " + prettify(helium) + " Helium... This could take a while...","perks");
    if(helium < 0) {
        debug("AutoPerks: Major Error - Not enough helium to buy fixed perks.","perks");
        return false;
    }
    if (Number.isNaN(helium)) {
        debug("AutoPerks: Major Error - Helium is Not a Number!","perks");
        return false;
    }
    
    var perks = AutoPerks.getVariablePerks();

    var effQueue = new FastPriorityQueue(function(a,b) { return a.efficiency > b.efficiency } ) // Queue that keeps most efficient purchase at the top

    var mostEff, price, inc;
    for(var i in perks) {
        price = AutoPerks.calculatePrice(perks[i], 0);
        inc = AutoPerks.calculateIncrease(perks[i], 0);
        perks[i].efficiency = inc/price;
        if(perks[i].efficiency < 0) {
            debug("Perk ratios must be positive values.","perks");
            return false;
        }
        if(perks[i].efficiency != 0)
            effQueue.add(perks[i]);        
    }
    if (effQueue.size < 1) {
        debug("All Perk Ratios were 0, or some other error.","perks");
        return false;
    }

    var i=0;
    function iterateQueue() {
        mostEff = effQueue.poll();
        price = AutoPerks.calculatePrice(mostEff, mostEff.level); // Price of *next* purchase.
        inc = AutoPerks.calculateIncrease(mostEff, mostEff.level);
        mostEff.efficiency = inc / price;
        i++;
    }
    for (iterateQueue() ; price <= helium ; iterateQueue() ) {
        if(mostEff.level < mostEff.max) {
            helium -= price;
            mostEff.level++;
            mostEff.spent += price;
            price = AutoPerks.calculatePrice(mostEff, mostEff.level);
            inc = AutoPerks.calculateIncrease(mostEff, mostEff.level);
            mostEff.efficiency = inc / price;
            effQueue.add(mostEff);
        }
    }
    debug("AutoPerks1: Pass One Complete. Loops ran: " + i, "perks");

    var $selector = document.getElementById('dumpPerk');
    if ($selector != null && $selector.value != "None") {
        var heb4dump = helium;
        var index = $selector.selectedIndex;
        var dumpPerk = AutoPerks.getPerkByName($selector[index].innerHTML);
        if(dumpPerk.level < dumpPerk.max) {
            for(price = AutoPerks.calculatePrice(dumpPerk, dumpPerk.level); price < helium && dumpPerk.level < dumpPerk.max; price = AutoPerks.calculatePrice(dumpPerk, dumpPerk.level)) {
                helium -= price;
                dumpPerk.spent += price;
                dumpPerk.level++;
            }
        }
        var dumpresults = heb4dump - helium;
        debug("AutoPerks1: Dump Perk " + AutoPerks.capitaliseFirstLetter(dumpPerk.name) + " level post-dump: "+ dumpPerk.level + " Helium Dumped: " + prettify(dumpresults) + " He.", "perks");        
    }
    
    var heB4round2 = helium;
    while (effQueue.size > 1) {
        mostEff = effQueue.poll();
        if (mostEff.level >= mostEff.max) continue;
        price = AutoPerks.calculatePrice(mostEff, mostEff.level);
        if (price >= helium) continue;        
        helium -= price;
        mostEff.level++;
        mostEff.spent += price;
        inc = AutoPerks.calculateIncrease(mostEff, mostEff.level);
        price = AutoPerks.calculatePrice(mostEff, mostEff.level);
        mostEff.efficiency = inc/price;
        effQueue.add(mostEff);
    }
    var r2results = heB4round2 - helium;
    debug("AutoPerks1: Pass two complete. Round 2 cleanup spend of : " + prettify(r2results),"perks");
}

AutoPerks.spendHelium2 = function(helium) {
    debug("Beginning AutoPerks2 calculate how to spend " + prettify(helium) + " Helium... This could take a while...","perks");
    if(helium < 0) {
        debug("AutoPerks: Major Error - Not enough helium to buy fixed perks.","perks");
        return false;
    }
    if (Number.isNaN(helium)) {
        debug("AutoPerks: Major Error - Helium is Not a Number!","perks");
        return false;
    }

    var perks = AutoPerks.getVariablePerks();

    var effQueue = new FastPriorityQueue(function(a,b) { return a.efficiency > b.efficiency } ) // Queue that keeps most efficient purchase at the top
    for(var i in perks) {
        var price = AutoPerks.calculatePrice(perks[i], 0);
        var inc = AutoPerks.calculateIncrease(perks[i], 0);
        perks[i].efficiency = inc/price;
        if(perks[i].efficiency < 0) {
            debug("Perk ratios must be positive values.","perks");
            return false;
        }
        if(perks[i].efficiency != 0)
            effQueue.add(perks[i]);
    }
    if (effQueue.size < 1) {
        debug("All Perk Ratios were 0, or some other error.","perks");
        return false;
    }

    var mostEff, price, inc;
    var packPrice,packLevel;
    var i=0;
    function iterateQueue() {
        mostEff = effQueue.poll();
        price = AutoPerks.calculatePrice(mostEff, mostEff.level);
        inc = AutoPerks.calculateIncrease(mostEff, mostEff.level);
        mostEff.efficiency = inc / price;
        i++;
    }
    for (iterateQueue() ; price <= helium ; iterateQueue() ) {
        if(mostEff.level < mostEff.max) {
            var t2 = mostEff.name.endsWith("_II");
            if (t2) {
                packLevel = mostEff.increase * 10;
                packPrice = AutoPerks.calculateTotalPrice(mostEff, mostEff.level + packLevel) - mostEff.spent;
            }
            if (t2 && packPrice <= helium) {
                helium -= packPrice;
                mostEff.level+= packLevel;
                mostEff.spent += packPrice;
            }  else  {
                helium -= price;
                mostEff.level++;
                mostEff.spent += price;            
            }
            price = AutoPerks.calculatePrice(mostEff, mostEff.level);
            inc = AutoPerks.calculateIncrease(mostEff, mostEff.level);
            mostEff.efficiency = inc / price;
            effQueue.add(mostEff);
        }
    }
    debug("AutoPerks2: Pass One Complete. Loops ran: " + i, "perks");

    var $selector = document.getElementById('dumpPerk');
    if ($selector != null && $selector.value != "None") {
        var heb4dump = helium;
        var index = $selector.selectedIndex;
        var dumpPerk = AutoPerks.getPerkByName($selector[index].innerHTML);
        if(dumpPerk.level < dumpPerk.max) {
            for(price = AutoPerks.calculatePrice(dumpPerk, dumpPerk.level); price < helium && dumpPerk.level < dumpPerk.max; price = AutoPerks.calculatePrice(dumpPerk, dumpPerk.level)) {
                helium -= price;
                dumpPerk.spent += price;
                dumpPerk.level++;
            }
        }
        var dumpresults = heb4dump - helium;
        debug("AutoPerks2: Dump Perk " + AutoPerks.capitaliseFirstLetter(dumpPerk.name) + " level post-dump: "+ dumpPerk.level + " Helium Dumped: " + prettify(dumpresults) + " He.", "perks");        
    }
    
    var heB4round2 = helium;
    while (effQueue.size > 1) {
        mostEff = effQueue.poll();
        if (mostEff.level >= mostEff.max) continue;
        price = AutoPerks.calculatePrice(mostEff, mostEff.level);
        if (price >= helium) continue;
        helium -= price;
        mostEff.level++;
        mostEff.spent += price;
        inc = AutoPerks.calculateIncrease(mostEff, mostEff.level);
        price = AutoPerks.calculatePrice(mostEff, mostEff.level);
        mostEff.efficiency = inc/price;
        effQueue.add(mostEff);
    }
    var r2results = heB4round2 - helium;
    debug("AutoPerks2: Pass Two Complete. Cleanup Spent Any Leftover Helium: " + prettify(r2results) + " He.","perks");
}



AutoPerks.applyCalculationsRespec = function(perks,remainingHelium){
    if (game.global.canRespecPerks) {
        respecPerks();
    }
    if (game.global.respecActive) {
        clearPerks();
        var preBuyAmt = game.global.buyAmt;

        for(var i in perks) {
            var capitalized = AutoPerks.capitaliseFirstLetter(perks[i].name);
            game.global.buyAmt = perks[i].level;
			if (getPortalUpgradePrice(capitalized) <= remainingHelium || perks[i].fixed) {
                if (MODULES["perks"].showDetails)
                    debug("AutoPerks-Respec Buying: " + capitalized + " " + perks[i].level, "perks");
                buyPortalUpgrade(capitalized);
            } else
                if (MODULES["perks"].showDetails)
                    debug("AutoPerks-Respec Error Couldn't Afford Asked Perk: " + capitalized + " " + perks[i].level, "perks");
        }
        game.global.buyAmt = preBuyAmt;
        numTab(1,true);
        cancelTooltip();
    }
    else {
        debug("A Respec would be required and is not available. You used it already, try again next portal.","perks");
        AutoPerks.GUI.$allocatorBtn1.setAttribute('class', 'btn inPortalBtn settingsBtn settingBtnfalse');
        tooltip("Automatic Perk Allocation Error", "customText", event, "A Respec would be required and is NOT available. You used it already, try again next portal. Press <b>esc</b> to close this tooltip." );
    }
}

AutoPerks.applyCalculations = function(perks,remainingHelium){

    var preBuyAmt = game.global.buyAmt;
    var needsRespec = false;
    for(var i in perks) {
        var capitalized = AutoPerks.capitaliseFirstLetter(perks[i].name);
        game.global.buyAmt = perks[i].level - game.portal[capitalized].level - game.portal[capitalized].levelTemp;
        if (game.global.buyAmt < 0) {
            needsRespec = true;
            if (MODULES["perks"].showDetails)
                debug("AutoPerks RESPEC Required for: " + capitalized + " " + game.global.buyAmt, "perks");
            //break;
        }
        else if (game.global.buyAmt > 0) {
            if (MODULES["perks"].showDetails)
                debug("AutoPerks-NoRespec Adding: " + capitalized + " " + game.global.buyAmt, "perks");
            buyPortalUpgrade(capitalized);
        }
    }

    game.global.buyAmt = preBuyAmt;
    numTab(1,true);
    cancelTooltip();
    if (needsRespec){
        debug("AutoPerks - A Respec is required. Trying respec...", "perks");
        var whichscreen = game.global.viewingUpgrades;
        cancelPortal();
        if (whichscreen)
            viewPortalUpgrades();
        else
            portalClicked();
        AutoPerks.applyCalculationsRespec(perks,remainingHelium);
        //
        if (MODULES["perks"].showDetails) {
            var exportPerks = {};
            for (var item in game.portal){
                el = game.portal[item];
                if (el.locked || el.level <= 0) continue;
                exportPerks[item] = el.level + el.levelTemp;
            }
            console.log(exportPerks);
        }
    }
}

AutoPerks.lowercaseFirst = function(str) {
    return str.substr(0, 1).toLowerCase() + str.substr(1);
}
AutoPerks.capitaliseFirstLetter = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
AutoPerks.getPercent = function(spentHelium, totalHelium) {
    var frac = spentHelium / totalHelium;
    frac = (frac* 100).toPrecision(2);
    return frac + "%";
}

AutoPerks.FixedPerk = function(name, base, level, max, fluffy) {
    this.id = -1;
    this.name = name;
    this.base = base;
    this.type = "exponential";
    this.exprate = 1.3;
    this.fixed = true;
    this.level = level || 0;
    this.spent = 0;
    this.max = max || Number.MAX_VALUE;
    if (fluffy == "fluffy") {
       this.fluffy = true; 
       this.type = "linear";
       this.increase = 10;
   }
}

AutoPerks.VariablePerk = function(name, base, compounding, value, baseIncrease, max, level) {
    this.id = -1;
    this.name = name;
    this.base = base;
    this.type  = "exponential";
    this.exprate = 1.3;
    this.fixed = false;
    this.compounding = compounding;
    this.updatedValue = -1;
    this.baseIncrease = baseIncrease;
    this.efficiency = -1;
    this.max = max || Number.MAX_VALUE;
    this.level = level || 0;
    this.spent = 0;
    function getRatiosFromPresets() {
        var valueArray = [];
        for (var i=0; i<presetList.length; i++) {
            valueArray.push(presetList[i][value]);
        }
        return valueArray;
    }
    this.value = getRatiosFromPresets();
}

AutoPerks.ArithmeticPerk = function(name, base, increase, baseIncrease, parent, max, level) {
    this.id = -1;
    this.name = name;
    this.base = base;
    this.increase = increase;
    this.type = "linear";
    this.fixed = false;
    this.compounding = false;
    this.baseIncrease = baseIncrease;
    this.parent = parent;
    this.relativeIncrease = parent.baseIncrease / baseIncrease;
    this.value = parent.value.map(function(me) { return me * this.relativeIncrease; });
    this.updatedValue = -1;
    this.efficiency = -1;
    this.max = max || Number.MAX_VALUE;
    this.level = level || 0;
    this.spent = 0;
}

AutoPerks.initializePerks = function () {
    //fixed
    var siphonology = new AutoPerks.FixedPerk("siphonology", 100000, 3, 3);
    var anticipation = new AutoPerks.FixedPerk("anticipation", 1000, 10, 10);
    var meditation = new AutoPerks.FixedPerk("meditation", 75, 7, 7);
    var relentlessness = new AutoPerks.FixedPerk("relentlessness", 75, 10, 10);
    var range = new AutoPerks.FixedPerk("range", 1, 10, 10);
    var agility = new AutoPerks.FixedPerk("agility", 4, 20, 20);
    var bait = new AutoPerks.FixedPerk("bait", 4, 30);
    var trumps = new AutoPerks.FixedPerk("trumps", 3, 30);
    var packrat = new AutoPerks.FixedPerk("packrat", 3, 30);
    //variable
    var looting = new AutoPerks.VariablePerk("looting", 1, false,             0, 0.05);
    var toughness = new AutoPerks.VariablePerk("toughness", 1, false,         1, 0.05);
    var power = new AutoPerks.VariablePerk("power", 1, false,                 2, 0.05);
    var motivation = new AutoPerks.VariablePerk("motivation", 2, false,       3, 0.05);
    var pheromones = new AutoPerks.VariablePerk("pheromones", 3, false,       4, 0.1);
    var artisanistry = new AutoPerks.VariablePerk("artisanistry", 15, true,   5, 0.1);
    var carpentry = new AutoPerks.VariablePerk("carpentry", 25, true,         6, 0.1);
    var resilience = new AutoPerks.VariablePerk("resilience", 100, true,      7, 0.1);
    var coordinated = new AutoPerks.VariablePerk("coordinated", 150000, true, 8, 0.1);
    var resourceful = new AutoPerks.VariablePerk("resourceful", 50000, true,  9, 0.05);
    var overkill = new AutoPerks.VariablePerk("overkill", 1000000, true,      10, 0.005, 30);
    //fluffy
    var capable = new AutoPerks.FixedPerk("capable", 100000000, 0, 10, "fluffy");
    var cunning = new AutoPerks.VariablePerk("cunning", 100000000000, false,      11, 0.05);
    var curious = new AutoPerks.VariablePerk("curious", 100000000000000, false,   12, 0.05);
    var classy = new AutoPerks.VariablePerk("classy", 100000000000000000, false,   13, 0.05, 75);
    //tier2
    var toughness_II = new AutoPerks.ArithmeticPerk("toughness_II", 20000, 500, 0.01, toughness);
    var power_II = new AutoPerks.ArithmeticPerk("power_II", 20000, 500, 0.01, power);
    var motivation_II = new AutoPerks.ArithmeticPerk("motivation_II", 50000, 1000, 0.01, motivation);
    var carpentry_II = new AutoPerks.ArithmeticPerk("carpentry_II", 100000, 10000, 0.0025, carpentry);
    var looting_II = new AutoPerks.ArithmeticPerk("looting_II", 100000, 10000, 0.0025, looting);

    AutoPerks.perkHolder = [siphonology, anticipation, meditation, relentlessness, range, agility, bait, trumps, packrat, looting, toughness, power, motivation, pheromones, artisanistry, carpentry, resilience, coordinated, resourceful, overkill, capable, cunning, curious, classy, toughness_II, power_II, motivation_II, carpentry_II, looting_II];
    for(var i in AutoPerks.perkHolder) {
        AutoPerks.perkHolder[i].level = 0;
        AutoPerks.perkHolder[i].spent = 0;
        AutoPerks.perkHolder[i].updatedValue = AutoPerks.perkHolder[i].value;
    }
    AutoPerks.setPerksByName();
    AutoPerks.setDefaultRatios();      
}

AutoPerks.getFixedPerks = function() {
    return AutoPerks.getSomePerks(true);
}
AutoPerks.getVariablePerks = function() {
    return AutoPerks.getSomePerks(null,true);
}
AutoPerks.getTierIIPerks = function() {
    return AutoPerks.getSomePerks(null,null,true);
}
AutoPerks.getAllPerks = function() {
    return AutoPerks.getSomePerks(null,null,null,true);
}
AutoPerks.getSomePerks = function(fixed,variable,tier2,allperks) {
    var perks = [];
    for(var i in AutoPerks.perkHolder) {
        var name = AutoPerks.capitaliseFirstLetter(AutoPerks.perkHolder[i].name);
        var perk = game.portal[name];
        if(perk.locked || (typeof perk.level === 'undefined')) continue;
        if ((fixed && AutoPerks.perkHolder[i].fixed) ||
           (variable && !AutoPerks.perkHolder[i].fixed) ||
           (tier2 && AutoPerks.perkHolder[i].type == "linear" && !AutoPerks.perkHolder[i].fluffy) ||
           (allperks))
        {   perks.push(AutoPerks.perkHolder[i]);    }
    }
    return perks;
}

AutoPerks.perksByName = {};
AutoPerks.getPerkByName = function(name) {
    return AutoPerks.perksByName[AutoPerks.lowercaseFirst(name)];
}
AutoPerks.setPerksByName = function() {
    for(var i in AutoPerks.perkHolder)
        AutoPerks.perksByName[AutoPerks.perkHolder[i].name] = AutoPerks.perkHolder[i];
}

AutoPerks.getOwnedPerks = function() {
    var perks = [];
    for (var name in game.portal){
        perk = game.portal[name];
        if(perk.locked || (typeof perk.level === 'undefined')) continue;
        perks.push(AutoPerks.getPerkByName(name));
    }
    return perks;
}
AutoPerks.displayGUI();
}
