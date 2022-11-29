var ATversion = 'Zek v5.1.0',
	atscript = document.getElementById('AutoTrimps-script'),
	basepath = 'https://SadAugust.github.io/AutoTrimps_Local/', //Link to your own Github here if you forked!
	modulepath = 'modules/';
null !== atscript && (basepath = atscript.src.replace(/AutoTrimps2\.js$/, ''));

//var isSteam = false;

function ATscriptLoad(a, b) {
	null == b && debug('Wrong Syntax. Script could not be loaded. Try ATscriptLoad(modulepath, \'example.js\'); ');
	var c = document.createElement('script');
	null == a && (a = ''), c.src = basepath + a + b + '.js', c.id = b + '_MODULE', document.head.appendChild(c)
}

function ATscriptUnload(a) {
	var b = document.getElementById(a + "_MODULE");
	b && (document.head.removeChild(b), debug("Removing " + a + "_MODULE", "other"))
}

function initializeGraphs() {
	ATscriptLoad('', 'Graphs');
	debug('AutoTrimps - SadAugust Graphs Only Fork Loaded!', '*spinner3');
}

function safeSetItems(name, data) {
	try {
		localStorage.setItem(name, data);
	} catch (e) {
		if (e.code == 22) {
			// Storage full, maybe notify user or do some clean-up
			debug("Error: LocalStorage is full, or error. Attempt to delete some portals from your graph or restart browser.");
		}
	}
}

var enableDebug = false;
function debug(message, type, lootIcon) {
	var output = true;
	if (output) {
		if (enableDebug)
			console.debug(0 + ' ' + message);
	}
}

var MODULES = {}

var startupDelay = 1000;
setTimeout(initializeGraphs, startupDelay);
