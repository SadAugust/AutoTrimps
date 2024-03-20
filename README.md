# AutoTrimps - kawyua Fork

# Current Version - Ongoing Development!

- kawyua Fork of sadAugust AT. Created for testing more optional feature in AT using sadAugust, AUZorn192/GenBTC as base. Currently up-to-date with patch 5.9.2.

Currently nothing much should be different, so listing all changes here:
The conditions are upon reaching 10 map stacks, >10 sec breed time, below hitsurvived threshold(default 1.25), but above hitsTopush(default 0.6) threshold. Upon satisfying this, upon running a HD map, or hitsSurvived map, trimps will push to the world and die after doing a farm map. Once the next set of trimps are ready and the currently fighting trimps in world die, starts farming a map again with the new set of trimps. This way, breed time is running while farming a map. This is for pushing harder through zones, particularly for anticipation and early game farming.
//explanation in comments in code. see video below of it in action
https://i.imgur.com/wfl5kC1.mp4

# AT Script Installation

## Browser

Step 1: Install TamperMonkey

https://www.tampermonkey.net/

Step 2:

Mods are still pointing to sadAugust AT
Click this link: https://github.com/kawyua/AutoTrimps/raw/main/userFiles/AutoTrimps.user.js

If clicking the link does not work, copy the contents of user.js into a new script inside tampermonkey.

If you are unsure how to do that, copy this:

```js
function injectScript(id, src) {
	var script = document.createElement('script');
	script.id = id;
	script.src = src;
	script.setAttribute('crossorigin', 'anonymous');
	document.head.appendChild(script);
}

injectScript('AutoTrimps-SadAugust', 'https://kawyua.github.io/AutoTrimps/AutoTrimps2.js');
```

Press F12 inside the game, this opens the console, and paste the text into it and hit enter, this will load the script. You will have to do this everytime you refresh the game though so I recommend getting tampermonkey to do it for you!

Step 3:

Configure settings. Will NOT work as intended with default settings.

## Steam

Step 1:
Go to this link to open the mods.js file: <a href="https://github.com/SadAugust/AutoTrimps/raw/main/userFiles/mods.js">mods.js</a>  
Then, right click the Raw button, hit Save link as, and save the mods.js file somewhere to your computer where you can find it, like desktop.  
![Download mods.js](https://i.imgur.com/opuO6yd.png)

Step 2:

In your Steam Library (where you see all your games in the Steam app), right click on Trimps, go to Manage, then Browse local files.  
A folder where Trimps is installed inside Steam should open.  
![Go to Trimps directory](https://imgur.com/cr35LK2.png)

Inside this folder, navigate to the mods folder (you should be in Steam\steamapps\common\Trimps\mods), and place the mods.js file there, like so:  
![Insert mods.js](https://imgur.com/muW6cUh.png)

Advanced users: If you have other mods installed then just copy the text in AT's mods.js and place it somewhere in your existing mods.js file.

Step 3:

Configure your settings. AT will not work properly if they are not configured!

# Heirloom Calculator, Farm Calculator & Surky/Perky only Script Installation

## Browser

Step 1: Install TamperMonkey

https://www.tampermonkey.net/

Step 2:

Click the relevant link below

<a href="https://github.com/SadAugust/AutoTrimps/raw/main/userFiles/farmCalc.user.js">Heirloom Calculator</a>

<a href="https://github.com/SadAugust/AutoTrimps/raw/main/userFiles/heirloomCalc.user.js">Farm Calculator (zfarm)</a>

<a href="https://github.com/SadAugust/AutoTrimps/raw/main/userFiles/autoPerks.user.js">Auto Perks (Perky+Surky)</a>

If clicking the link does not work, copy the contents of the file into a new script inside tampermonkey.

Step 3:

Enjoy your ingame version of the option you selected!

## Steam

Step 1:

Download the file below (click the link and when on that page right click the button that says "Raw" and Save Link As...), and save it as mods.js.

<a href="https://github.com/SadAugust/AutoTrimps/blob/main/userFiles/farmCalc.user.js">Heirloom Calculator</a>

<a href="https://github.com/SadAugust/AutoTrimps/blob/main/userFiles/heirloomCalc.user.js">Farm Calculator (zfarm)</a>

<a href="https://github.com/SadAugust/AutoTrimps/blob/main/userFiles/autoPerks.user.js">Auto Perks (Perky+Surky)</a>

Click on one of the mods selected below, then right click the Raw button, hit Save Link As, and save the file somewhere to your computer where you can find it, like desktop.  
![Download mods.js](https://i.imgur.com/opuO6yd.png)

Step 2:

Rename the file to mods.js (right click the file, rename).

Step 3:

In your Steam Library (where you see all your games in the Steam app), right click on Trimps, go to Manage, then Browse local files. A folder where Trimps is installed inside Steam should open.  
![Go to Trimps directory](https://imgur.com/cr35LK2.png)

Inside this folder, navigate to the mods folder (you should be in Steam\steamapps\common\Trimps\mods), and place the mods.js file that we renamed earlier there, like so:  
![Insert mods.js](https://imgur.com/muW6cUh.png)

Advanced users: If you have other mods installed then just copy the text in AT's mods.js and place it somewhere in your existing mods.js file.

Step 4:

Restart the game, or if the game is already running, hit F5 to refresh.

- Note for Farm Calculator (zfarm)

This works in both universes and shows you the optimal stance/equality level to use for the map shown. The information for it can be found at the bottom of the Trimps breeding/trapping section as can be seen in the image below. ![Farm Calc Position](https://i.imgur.com/siZH8Dh.png)
