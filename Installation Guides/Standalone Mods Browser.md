# Standalone Mod Script Installation (Browser)

## Step 1:

Install the Tampermonkey extension for your web browser which can be found here: https://www.tampermonkey.net/

## Step 2:

Click one of the links below to bring up a Tampermonkey script installation page where you only need to press the Install button to finish installing the script.

<a href="https://github.com/SadAugust/AutoTrimps/raw/main/userFiles/farmCalc.user.js">Farm Calculator</a> (zFarm)

<a href="https://github.com/SadAugust/AutoTrimps/raw/main/userFiles/autoPerks.user.js">Auto Perks</a> (Perky and Surky)

<a href="https://github.com/SadAugust/AutoTrimps/raw/main/userFiles/heirloomCalc.user.js">Heirloom Calculator</a>

<a href="https://github.com/SadAugust/AutoTrimps/raw/main/userFiles/spireTD.user.js">SpireTD Import</a> (U1 z200+)

<a href="https://github.com/SadAugust/AutoTrimps/raw/main/userFiles/mutatorPreset.user.js">Mutator Presets</a> (U2 z201+)

If clicking the link doesn't bring up the install page, find the desired mods ".user.js" file <a href="https://github.com/SadAugust/AutoTrimps/blob/main/userFiles">here</a> and paste the contents of it into a new Tampermonkey script.

## Step 3:

Load or refresh your game window and the script should automatically load.

## Alternative way to load

If you would rather load the script without using extension then you can do so by copying the code below into your browsers console window and deleting the lines for mods that you don't wish to load.
The console window can be accessed by pressing the F12 key.

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
