# Standalone Mod Script Installation (Steam)

## Step 1:

Click one of the links below, then right click "Raw", hit "Save link as", and save the file as "mods.js" somewhere to your computer where you can find it, like your desktop.

You can run multiple mods at once, you just need to add the "loadScript" line at the bottom of each mod files link below to your mods.js file.
![Download mods.js](https://i.imgur.com/opuO6yd.png)

<a href="https://github.com/SadAugust/AutoTrimps/blob/main/userFiles/farmCalc.user.js">Farm Calculator</a> (zFarm)

<a href="https://github.com/SadAugust/AutoTrimps/blob/main/userFiles/autoPerks.user.js">Auto Perks</a> (Perky and Surky)

<a href="https://github.com/SadAugust/AutoTrimps/blob/main/userFiles/heirloomCalc.user.js">Heirloom Calculator</a>

<a href="https://github.com/SadAugust/AutoTrimps/blob/main/userFiles/spireTD.user.js">SpireTD Import</a> (U1 z200+)

<a href="https://github.com/SadAugust/AutoTrimps/blob/main/userFiles/mutatorPreset.user.js">Mutator Presets</a> (U2 z201+)

## Step 2:

In your Steam Library, right click on Trimps, go to Manage, then Browse local files to open the folder where Trimps is installed.  
![Go to Trimps directory](https://imgur.com/cr35LK2.png)

Inside this folder, navigate to the mods folder (you should be in Steam\steamapps\common\Trimps\mods), and place the mods.js file you downloaded there, like so:  
![Insert mods.js](https://imgur.com/muW6cUh.png)

## Step 3:

Load or refresh your game window and the script should automatically load.

If the script doesn't load, then ensure that the file extension of the mods file is <b>.js</b>

## Alternative way to load

If you would rather load the script without using the mods.js file then you will need to setup console which can be done so by following <a href="https://discord.com/channels/371177798305447938/974400240138485810/979151143714320515">these steps</a> from the official Trimps discord.

When console has been setup you can load the script by pasting the code below into the console window which can be accessed by pressing the F12 key. You will need to delete "loadScript" lines for the mods you don't wish to load.

You will have to do this everytime you refresh the game!

```js
function loadScript(id, src) {
	const script = document.createElement('script');
	script.id = id;
	script.src = `${src}`;
	script.setAttribute('crossorigin', 'anonymous');
	document.head.appendChild(script);
}

loadScript('AutoTrimps-SadAugust-FarmCalc', 'https://sadaugust.github.io/AutoTrimps/mods/farmCalc.js');
loadScript('AutoTrimps-SadAugust-AutoPerks', 'https://sadaugust.github.io/AutoTrimps/mods/perky.js');
loadScript('AutoTrimps-SadAugust-HeirloomCalc', 'https://sadaugust.github.io/AutoTrimps/mods/heirloomCalc.js');
loadScript('AutoTrimps-SadAugust-spireTD-Import', 'https://sadaugust.github.io/AutoTrimps/mods/spireTD.js');
loadScript('AutoTrimps-SadAugust-MutatorPreset', 'https://sadaugust.github.io/AutoTrimps/mods/mutatorPreset.js');
```

# Donate

If you'd like to donate to AutoTrimps development, you can do so with <a href="https://www.buymeacoffee.com/augustAutoTrimps">Buy me a coffee.</a>
