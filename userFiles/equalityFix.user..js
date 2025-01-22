// ==UserScript==
// @name		AutoTrimps-SadAugust_gameUpdatesTest
// @version		1.0-SadAugust
// @namespace	https://SadAugust.github.io/AutoTrimps
// @description	Fix minor game bugs & significantly speedup Time Warp!
// @author		SadAugust, NooNoo, Quia
// @match		*://trimpstest510.netlify.app/*
// @connect		*://SadAugust.github.io/AutoTrimps/*
// @connect		*://trimps.github.io/*
// @connect		self
// @grant		GM_xmlhttpRequest
// ==/UserScript==

function loadScript(id, src) {
	const script = document.createElement('script');
	script.id = id;
	script.src = src;
	script.setAttribute('crossorigin', 'anonymous');
	document.head.appendChild(script);
}

//This can be edited to point to your own Github Repository URL.
loadScript('AutoTrimps-SadAugust-equalityFixTest', 'https://sadaugust.github.io/AutoTrimps/mods/equalityBugfix.js');
