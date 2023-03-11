# AutoTrimps - SadAugust Fork

## Current Version - Ongoing Development!
- SadAugust Fork. All changes made by SadAugust using GenBTC as base. Currently up-to-date as of 03/2022.

## AT Script Installation

- Browser

Step 1: Install TamperMonkey

https://www.tampermonkey.net/

Step 2: 

Click this link: https://github.com/SadAugust/AutoTrimps/blob/main/.user.js

If clicking the link does not work, copy the contents of user.js into a new script inside tampermonkey. 

If you are unsure how to do that, copy this:

```var script = document.createElement('script');
script.id = 'AutoTrimps-SadAugust';
script.src = 'https://SadAugust.github.io/AutoTrimps/AutoTrimps2.js';
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
```

Press F12 inside the game, this opens the console, and paste the text into it and hit enter, this will load the script. You will have to do this everytime you refresh the game though so I recommend getting tampermonkey to do it for you!

Step 3: 

Configure settings. Will NOT work as intended with default settings. 

- Steam

Step 1: 

Download <a href="https://github.com/SadAugust/AutoTrimps/blob/main/mods.js">mods.js</a> from this directory (right click raw and save link as...), or copy it and make your own mods.js in a text file.

Step 2: 

Navigate to Steam\steamapps\common\Trimps and place mods.js into the folder. If you have other mods installed then just copy the text in AT's mods.js and place it somewhere in the mods.js file.

Step 3: 

Configure your settings. AT will not work properly if they are not configured!

## Graphs only Script Installation

- Browser

Step 1: Install TamperMonkey

https://www.tampermonkey.net/

Step 2: 

Click this link: https://github.com/SadAugust/AutoTrimps/blob/main/GraphsOnly.user.js

If clicking the link does not work, copy the contents of GraphsOnly.user.js into a new script inside tampermonkey. 

If you are unsure how to do that, copy this:

```var script = document.createElement('script');
script.id = 'AutoTrimps-Graphs';
script.src = 'https://SadAugust.github.io/AutoTrimps/GraphsOnly.js';
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
```

Press F12 inside the game, this opens the console, and paste the text into it and hit enter, this will load the script. You will have to do this everytime you refresh the game though so I recommend getting tampermonkey to do it for you!

Step 3: 

Enjoy your Graphs!

- Steam

Step 1: 

Download <a href="https://github.com/SadAugust/AutoTrimps/blob/main/modsGraphOnly.js">modsGRAPH.js</a> from this directory (right click raw and save link as...), or copy it and make your own modsGRAPH.js in a text file.

Step 2: 

Rename the file to just mods.js (Right click the file, rename, then remove GRAPH). Sorry but I can't have 2 mods.js named the same so Graphs Only users have to deal with it :(

Step 3: 

Navigate to Steam\steamapps\common\Trimps and place mods.js into the folder. If you have other mods installed then just copy the text in AT's mods.js and place it somewhere in the mods.js file.

Step 4: 

Enjoy your Graphs!



## Equipment && Upgrade's colour explaination:

White - Upgrade is not available

Yellow - Upgrade is not affordable

Orange - Upgrade is affordable, but will lower stats

Red - Will buy next

## Troubleshooting

**Combat won't start** - Make sure you have enabled the Better Auto Fight/Vanilla setting in Combat & Stance Settings. If you're not on dark theme, you may see a tiny thin black bar in combat, click it to show this setting.

## Changes made from Zek's fork

**Core**

Preset swapping - Will swap between preset 1 when running fillers and preset 2 when doing dailies

Download saves - Downloads saves when autoportalling

**Buildings**

Implemented a % option for tributes and buildings cos it always spent 100% on them before

**Jobs**

No farmers from x zone

No lumberjacks after MP has been run 

Worshipper farming purchasing %, 

Bone shrine settings with a toggle for when to use them (optimal to use in afterpush rather than during a run)

**Gear**

Implemented a highlighting system that goes over prestiges too instead of just equips

AE: Zone is an array and allows for multiple inputs, will start buying forever from the last item in the array onwards

AE: Prestige & AE: Highest Prestige are new

**Maps**

Added map special setting. Will change the special used for mapstacking 

Void maps allows multiple inputs, new voids mod will only run extras once you're past the last input in the void level settings

Added setting for atlantrimp & mp & frozen castle. Input is (zone,cell) so 130,66

MAZ lookalike for time and tribute farming

Tribute farming has met options

Time farm has been changed to repeat x times rather than  time

Can select different specials for each time farm setting. If you select large cache or huge cache you get a gather option to let you specify the one you'd prefer for it

**Raiding**

Removed some settings and just let in the hardcore p raid thing. If you input that you wanna raid 245 from 241 it'll run each map at their gear level so will do a 242, then 243, then 244, then 2x 245 maps

PR Frag Max added that makes sure the maps are always perfect

**Daily**

Removed all the old u1 settings

Added AE Zones, smithy mp setting, specified daily only settings for time farm, tribute farm, praiding

Added option for filler runs so if you need to run 6 dailies it;d do a daily then a hypo then a daily then a hypo etc


**C3**

Added max map bonus from, mp smithy, option to buy max buildings till x zone so it'll spend 100% resources on buildings till that point. 

Option for buying bone upgrades 

Unbalance destacking options

Trappa stop buying coords at input

**Combat**

Auto equality, multitoggle option but the part I just coded is option 3, AE: Advanced which changes equality value depending on what you need to kill an enemy

**Heirlooms**

Added a map swap option where it equips your afterpush shield during maps so you can get plaguebringer

Added options for each cache staves that will equip when you're in a map with that cache