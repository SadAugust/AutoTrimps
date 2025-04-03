# AutoTrimps Script Installation (Steam)

## Step 1:

Click <a href="https://github.com/SadAugust/AutoTrimps/blob/main/userFiles/mods.js">this link</a>, then right click "Raw", hit "Save link as", and save the mods.js file somewhere to your computer where you can find it, like your desktop.  
![Download mods.js](https://i.imgur.com/opuO6yd.png)

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

When console has been setup you can load the script by pasting the code below into the console window which can be accessed by pressing the F12 key.

You will have to do this everytime you refresh the game!

```js
function loadScript(id, src) {
	const script = document.createElement('script');
	script.id = id;
	script.src = `${src}`;
	script.setAttribute('crossorigin', 'anonymous');
	document.head.appendChild(script);
}

offlineTimeSpeed = game.global.timeWarpLimit;
game.global.timeWarpLimit = 0;
loadScript('AutoTrimps-SadAugust', 'https://SadAugust.github.io/AutoTrimps/AutoTrimps2.js');
```

# Donate

If you'd like to donate to AutoTrimps development, you can do so with <a href="https://www.buymeacoffee.com/augustAutoTrimps">Buy me a coffee.</a>
