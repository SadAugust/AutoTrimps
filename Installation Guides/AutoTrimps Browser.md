# AutoTrimps Script Installation (Browser)

## Step 1:

Install the Tampermonkey extension for your web browser which can be found here: https://www.tampermonkey.net/

## Step 2:

Click <a href="https://github.com/SadAugust/AutoTrimps/raw/main/userFiles/AutoTrimps.user.js">this link</a> and it should bring up a Tampermonkey script installation page where you only need to press the Install button to finish installing the script.

If clicking the link doesn't bring up the install page, copy the contents of <a href="https://github.com/SadAugust/AutoTrimps/blob/main/userFiles/AutoTrimps.user.js">this file</a> into a new Tampermonkey script.

## Step 3:

Load or refresh your game window and the script should automatically load.

## Alternative way to load

If you would rather load the script without using extension then you can do so by copying the code below into your browsers console window, this can be accessed by pressing the F12 key.

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
