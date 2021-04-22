function prestigeChanging2(){var a=document.getElementById('Prestige').selectedIndex;if(!(2>=a)){var b=getPageSetting('DynamicPrestige2'),c=10<a?a-10:0,d=0;for(i=1;i<=a;i++){var e=game.mapUnlocks[autoTrimpSettings.Prestige.list[i]].last;if(e<=b-5){var g=Math.floor((b-e)/5);4<=game.global.sLevel&&(g=Math.ceil(g/2)),d+=g}}'Lead'==game.global.challengeActive&&(d*=2);var h=0;return 0==d?void(autoTrimpSettings.Prestige.selected=document.getElementById('Prestige').value):void(h=Math.ceil(d/a),game.global.world>b-h&&(game.global.mapBonus<a?!0==game.global.slowDone?autoTrimpSettings.Prestige.selected='GambesOP':autoTrimpSettings.Prestige.selected='Bestplate':game.global.mapBonus>a&&(autoTrimpSettings.Prestige.selected='Dagadder')),(game.global.world<=b-h||10==game.global.mapBonus)&&(autoTrimpSettings.Prestige.selected='Dagadder'))}}
function RprestigeChanging2(){
    var maxPrestigeIndex = document.getElementById('RPrestige').selectedIndex;
    if (maxPrestigeIndex <= 2)
        return;
    var lastzone = getPageSetting("RDynamicPrestige2");
    var extra = maxPrestigeIndex > 10 ? maxPrestigeIndex - 10 : 0;
    var neededPrestige = 0;
    for (i = 1; i <= maxPrestigeIndex ; i++){
        var lastp = game.mapUnlocks[autoTrimpSettings.RPrestige.list[i]].last;
        if (lastp <= lastzone - 5){
            var rem = lastzone - lastp;
            var addto = Math.floor(rem/5);
            if (game.global.sLevel >= 4)
                addto = Math.ceil(addto/2);
            neededPrestige += addto;
        }
    }
    var zonesToFarm = 0;
    if (neededPrestige == 0){
        autoTrimpSettings.RPrestige.selected = document.getElementById('RPrestige').value;
        return;
    }
    zonesToFarm = Math.ceil(neededPrestige/maxPrestigeIndex);
    if(game.global.world > (lastzone-zonesToFarm)){
        if (game.global.mapBonus < maxPrestigeIndex) {
            if(game.global.slowDone == true)
                autoTrimpSettings.RPrestige.selected = "GambesOP";
            else
                autoTrimpSettings.RPrestige.selected = "Bestplate";
        }
        else if (game.global.mapBonus > maxPrestigeIndex)
             autoTrimpSettings.RPrestige.selected = "Dagadder";
    }
    if (game.global.world <= lastzone-zonesToFarm || game.global.mapBonus == 10)
        autoTrimpSettings.RPrestige.selected = "Dagadder";
}
