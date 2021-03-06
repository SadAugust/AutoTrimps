var animated = (game.options.menu.showHeirloomAnimations.enabled) ? "animated " : "";
var hrlmProtBtn1=document.createElement('DIV');hrlmProtBtn1.setAttribute('class','noselect heirloomBtnActive heirBtn'),hrlmProtBtn1.setAttribute('onclick','protectHeirloom(this, true)'),hrlmProtBtn1.innerHTML='Protect/Unprotect',hrlmProtBtn1.id='protectHeirloomBTN1';var hrlmProtBtn2=document.createElement('DIV');hrlmProtBtn2.setAttribute('class','noselect heirloomBtnActive heirBtn'),hrlmProtBtn2.setAttribute('onclick','protectHeirloom(this, true)'),hrlmProtBtn2.innerHTML='Protect/Unprotect',hrlmProtBtn2.id='protectHeirloomBTN2';var hrlmProtBtn3=document.createElement('DIV');hrlmProtBtn3.setAttribute('class','noselect heirloomBtnActive heirBtn'),hrlmProtBtn3.setAttribute('onclick','protectHeirloom(this, true)'),hrlmProtBtn3.innerHTML='Protect/Unprotect',hrlmProtBtn3.id='protectHeirloomBTN3',document.getElementById('equippedHeirloomsBtnGroup').appendChild(hrlmProtBtn1),document.getElementById('carriedHeirloomsBtnGroup').appendChild(hrlmProtBtn2),document.getElementById('extraHeirloomsBtnGroup').appendChild(hrlmProtBtn3);
function protectHeirloom(a,b){var c=game.global.selectedHeirloom,d=c[1],e=game.global[d];if(-1!=c[0])var e=e[c[0]];b&&(e.protected=!e.protected),a||(d.includes("Equipped")?a=document.getElementById("protectHeirloomBTN1"):"heirloomsCarried"==d?a=document.getElementById("protectHeirloomBTN2"):"heirloomsExtra"==d&&(a=document.getElementById("protectHeirloomBTN3"))),a&&(a.innerHTML=e.protected?"UnProtect":"Protect")}
function newSelectHeirloom(a,b,c){selectHeirloom(a,b,c),protectHeirloom()}
function highdmgshield(){for(loom of game.global.heirloomsCarried)if(loom.name==getPageSetting('highdmg'))return loom;}
function lowdmgshield(){for(loom of game.global.heirloomsCarried)if(loom.name==getPageSetting('lowdmg'))return loom;}
function dhighdmgshield(){for(loom of game.global.heirloomsCarried)if(loom.name==getPageSetting('dhighdmg'))return loom;}
function dlowdmgshield(){for(loom of game.global.heirloomsCarried)if(loom.name==getPageSetting('dlowdmg'))return loom;}

function getHeirloomEff(name, type) {
  if (type == "staff") {
    if (getPageSetting('slot1modst') == name) return 5;
    else if (getPageSetting('slot2modst') == name) return 5;
    else if (getPageSetting('slot3modst') == name) return 5;
    else if (getPageSetting('slot4modst') == name) return 5;
    else if (getPageSetting('slot5modst') == name) return 5;
    else if (getPageSetting('slot6modst') == name) return 5;
	else return 0;
  }
  else if (type == "shield") {
    if (getPageSetting('slot1modsh') == name) return 5;
    else if (getPageSetting('slot2modsh') == name) return 5;
    else if (getPageSetting('slot3modsh') == name) return 5;
    else if (getPageSetting('slot4modsh') == name) return 5;
    else if (getPageSetting('slot5modsh') == name) return 5;
    else if (getPageSetting('slot6modsh') == name) return 5;
	else return 0;
  }
  else if (type == "core") {
    if (getPageSetting('slot1modcr') == name) return 5;
    else if (getPageSetting('slot2modcr') == name) return 5;
    else if (getPageSetting('slot3modcr') == name) return 5;
    else if (getPageSetting('slot4modcr') == name) return 5;
	else return 0;
  }
}

function evaluateHeirloomMods2(loom, location) {

  var index = loom;
  var eff = 0;
  var name;
  var type;
  var rarity;
  var raretokeep = getPageSetting('raretokeep');
	if (raretokeep == 'Any' || raretokeep == 'Common') raretokeep = 0;
	else if (raretokeep == 'Uncommon') raretokeep = 1;
	else if (raretokeep == 'Rare') raretokeep = 2;
	else if (raretokeep == 'Epic') raretokeep = 3;
	else if (raretokeep == 'Legendary') raretokeep = 4;
	else if (raretokeep == 'Magnificent') raretokeep = 5;
	else if (raretokeep == 'Ethereal') raretokeep = 6;
	else if (raretokeep == 'Magmatic') raretokeep = 7;
	else if (raretokeep == 'Plagued') raretokeep = 8;
	else if (raretokeep == 'Radiating') raretokeep = 9;
        else if (raretokeep == 'Hazardous') raretokeep = 10;

  if (location.includes('Equipped'))
    loom = game.global[location];
  else
    loom = game.global[location][loom];

  for (var m in loom.mods) {
    name = loom.mods[m][0];
    type = loom.type;
    rarity = loom.rarity;
    if (type == "Shield") {
      eff += getHeirloomEff(name, "shield");
    }
    if (type == "Staff") {
      eff += getHeirloomEff(name, "staff");
    }
    if (type == "Core") {
      eff += getHeirloomEff(name, "core");
    }
    if (name == "empty" && type == "Shield") {
        eff *= 4;
    }
    if (name == "empty" && type == "Staff") {
        eff *= 4;
    }
    if (name == "empty" && type == "Core") {
        eff *= 4;
    }
    if (rarity >= raretokeep) {
       eff *= 100;
    }
    else if (rarity < raretokeep) {
       eff /= 100;
    }
  }
  return eff;
}

var worth3 = {'Shield': [], 'Staff': [], 'Core': []};
function worthOfHeirlooms3(){
    worth3 = {'Shield': [], 'Staff': [], 'Core': []};
    for (var index in game.global.heirloomsExtra) {
        var theLoom = game.global.heirloomsExtra[index];
        var data = {'location': 'heirloomsExtra', 'index': index, 'rarity': theLoom.rarity, 'eff': evaluateHeirloomMods2(index, 'heirloomsExtra')};
        worth3[theLoom.type].push(data);
    }
    var valuesort = function(a, b){return b.eff - a.eff;};
    worth3['Shield'].sort(valuesort);
    worth3['Staff'].sort(valuesort);
    worth3['Core'].sort(valuesort);
}

function autoheirlooms3() {

    if(!heirloomsShown && game.global.heirloomsExtra.length > 0){
        var originalLength = game.global.heirloomsCarried.length;
        for(var index=0; index < originalLength; index++) {
            selectHeirloom(0, 'heirloomsCarried');
            stopCarryHeirloom();
        }

	//CARRY
        var originalLength = game.global.heirloomsExtra.length;
        for(var index=0; index < originalLength; index++) {
            var theLoom = game.global.heirloomsExtra[index];
            if ((theLoom.protected) && (game.global.heirloomsCarried.length < getMaxCarriedHeirlooms())){
                selectHeirloom(index, 'heirloomsExtra');
                carryHeirloom();
                index--; originalLength--;
            }
        }

	//SHIELD
	if (getPageSetting('typetokeep') == 1) {
       		 while ((game.global.heirloomsCarried.length < getMaxCarriedHeirlooms()) && game.global.heirloomsExtra.length > 0){
                        worthOfHeirlooms3();
                        if (worth3["Shield"].length > 0){
                            var carryshield = worth3["Shield"].shift();
                            selectHeirloom(carryshield.index, 'heirloomsExtra');
                            carryHeirloom();
                        }
			else break;
                }
	}

	//STAFF
	else if (getPageSetting('typetokeep') == 2) {
       		 while ((game.global.heirloomsCarried.length < getMaxCarriedHeirlooms()) && game.global.heirloomsExtra.length > 0){
                        worthOfHeirlooms3();
                        if (worth3["Staff"].length > 0){
                            var carrystaff = worth3["Staff"].shift();
                            selectHeirloom(carrystaff.index, 'heirloomsExtra');
                            carryHeirloom();
                        }
			else break;
                }
	}

	//CORE
	else if (getPageSetting('typetokeep') == 3) {
       		 while ((game.global.heirloomsCarried.length < getMaxCarriedHeirlooms()) && game.global.heirloomsExtra.length > 0){
                        worthOfHeirlooms3();
                        if (worth3["Core"].length > 0){
                            var carrycore = worth3["Core"].shift();
                            selectHeirloom(carrycore.index, 'heirloomsExtra');
                            carryHeirloom();
                        }
			else break;
                }
	}

	//ALL
	else if (getPageSetting('typetokeep') == 4) {
       		 while ((game.global.heirloomsCarried.length < getMaxCarriedHeirlooms()) && game.global.heirloomsExtra.length > 0){
            		worthOfHeirlooms3();
            		if (worth3["Shield"].length > 0){
                	    var carryshield = worth3["Shield"].shift();
                	    selectHeirloom(carryshield.index, 'heirloomsExtra');
                            carryHeirloom();
              		}
                        worthOfHeirlooms3();
                        if (worth3["Staff"].length > 0){
                            var carrystaff = worth3["Staff"].shift();
                            selectHeirloom(carrystaff.index, 'heirloomsExtra');
                            carryHeirloom();
                        }
                        worthOfHeirlooms3();
                        if (worth3["Core"].length > 0){
                            var carrycore = worth3["Core"].shift();
                            selectHeirloom(carrycore.index, 'heirloomsExtra');
                            carryHeirloom();
                        }
                }
	}
    }
}

//Loom Swapping

function lowHeirloom() {
	if (lowdmgshield() != undefined && game.global.ShieldEquipped.name != getPageSetting('lowdmg')) {
        selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
        equipHeirloom();
	}
}
function dlowHeirloom() {
	if (dlowdmgshield() != undefined && game.global.ShieldEquipped.name != getPageSetting('dlowdmg')) {
        selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
        equipHeirloom();
	}
}
function highHeirloom() {
	if (highdmgshield() != undefined && game.global.ShieldEquipped.name != getPageSetting('highdmg')) {
        selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
        equipHeirloom();
	}
}
function dhighHeirloom() {
	if (dhighdmgshield() != undefined && game.global.ShieldEquipped.name != getPageSetting('dhighdmg')) {
        selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
        equipHeirloom();
	}
}


function generateHeirloomIcon(heirloom, location, number){
    if (typeof heirloom.name === 'undefined') return "<span class='icomoon icon-sad3'></span>";
    var icon = getHeirloomIcon(heirloom);
    var animated = (game.options.menu.showHeirloomAnimations.enabled) ? "animated " : "";
    var html = '<span class="heirloomThing ' + animated + 'heirloomRare' + heirloom.rarity;
    if (location == "Equipped") html += ' equipped';
    var locText = "";
    if (location == "Equipped") locText += '-1,\'' + heirloom.type + 'Equipped\'';
    else locText += number + ', \'heirlooms' + location + '\'';
    html += '" onmouseover="tooltip(\'Heirloom\', null, event, null, ' + locText + ')" onmouseout="tooltip(\'hide\')" onclick="newSelectHeirloom(';
    html += locText + ', this)"> <span class="' + icon + '"></span></span>';
    return html;
}

//Radon
function Rhshmayhem(){for(loom of game.global.heirloomsCarried)if(loom.name==getPageSetting('Rhsmayhem'))return loom;}
function Rhslowvmdc(){for(loom of game.global.heirloomsCarried)if(loom.name==getPageSetting('Rhslowvmdc'))return loom;}
function Rhsnovmdc(){for(loom of game.global.heirloomsCarried)if(loom.name==getPageSetting('Rhsnovmdc'))return loom;}
function Rhsworldstaff(){for(loom of game.global.heirloomsCarried)if(loom.name==getPageSetting('Rhsworldstaff'))return loom;}
function Rhsmapstaff(){for(loom of game.global.heirloomsCarried)if(loom.name==getPageSetting('Rhsmapstaff'))return loom;}
function Rhstributestaff(){for(loom of game.global.heirloomsCarried)if(loom.name==getPageSetting('Rhstributestaff'))return loom;}
function RPandemoniumstaff(){for(loom of game.global.heirloomsCarried)if(loom.name==getPageSetting('RPandemoniumAEStaff'))return loom;}

function Rhshmayhemequip() {
	if (Rhshmayhem() != "undefined" && game.global.ShieldEquipped.name != getPageSetting('Rhsmayhem')) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
		equipHeirloom();
	}
}
function Rhslowvmdcequip() {
	if (Rhslowvmdc() != "undefined" && game.global.ShieldEquipped.name != getPageSetting('Rhslowvmdc')) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
		equipHeirloom();
	}
}
function Rhsnovmdcequip() {
	if (Rhsnovmdc() != "undefined" && game.global.ShieldEquipped.name != getPageSetting('Rhsnovmdc')) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
		equipHeirloom();
	}
}
function Rhsworldstaffequip() {
	if (Rhsworldstaff() != "undefined" && game.global.StaffEquipped.name != getPageSetting('Rhsworldstaff')) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
		equipHeirloom();
	}
}
function Rhsmapstaffequip() {
	if (Rhsmapstaff() != "undefined" && game.global.StaffEquipped.name != getPageSetting('Rhsmapstaff')) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
		equipHeirloom();
	}
}

function Rhstributestaffequip() {
	if (Rhstributestaff() != "undefined" && game.global.StaffEquipped.name != getPageSetting('Rhstributestaff')) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
		equipHeirloom();
	}
}

function RPandemoniumStaffEquip() {
	if (RPandemoniumstaff() != "undefined" && game.global.StaffEquipped.name != getPageSetting('RPandemoniumAEStaff')) {
		selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
		equipHeirloom();
	}
}

function Rheirloomswap() {
	
    //Swapping Shields
	if (getPageSetting('Rhsshield')) {
		if ((game.global.runningChallengeSquared || game.global.challengeActive == "Mayhem" || game.global.challengeActive == "Pandemonium") && getPageSetting('Rhsmayhem') != "undefined") {
			Rhshmayhemequip();
		} else if (getPageSetting('Rhshzone') > 0) {
			if (getPageSetting('Rhslowvmdc') !== "undefined" && game.global.world < getPageSetting('Rhshzone')) {
				Rhslowvmdcequip();
			}
			else if (getPageSetting('Rhsnovmdc') !== "undefined" && game.global.world >= getPageSetting('Rhshzone')) {
				Rhsnovmdcequip();
			}
		}
	}
    
  //Swapping Staffs
	if (game.global.challengeActive == "Pandemonium" && getPageSetting('RPandemoniumAutoEquip') > 1 && getPageSetting('RPandemoniumAEStaff') != "undefined" && getPageSetting('RPandemoniumAEZone') > 0 && game.global.world >= getPageSetting('RPandemoniumAEZone') && game.global.lastClearedCell > 59) {
    RPandemoniumStaffEquip();
	}
	else if (getPageSetting('Rhsstaff')) {
		if (getPageSetting('Rhsworldstaff') != "undefined" && !game.global.mapsActive) {
			Rhsworldstaffequip();
		} else if (getPageSetting('Rhsmapstaff') != "undefined" && game.global.mapsActive) {
			if (getCurrentMapObject().bonus == undefined && getPageSetting('Rhsmapstaff') != "undefined")  {
				Rhsmapstaffequip();
			} else if (getCurrentMapObject().bonus.includes("sc") && Rshouldtributefarm && getPageSetting('Rhstributestaff') != "undefined") {
				Rhstributestaffequip();
			} else if (getPageSetting('Rhsmapstaff') != "undefined") {
				Rhsmapstaffequip();
			}
		}
	}
}
