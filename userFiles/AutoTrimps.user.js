// ==UserScript==
// @name		AutoTrimps-kawyua
// @version		1.0-SadAugust - kawyua 3.15.2024
// @namespace	https://kawyua.github.io/AutoTrimps
// @description	Automate all the trimps!
// @author		zininzinin, spindrjr, Ishkaru, genBTC, Zeker0, SadAugust
// @match		*trimps.github.io*
// @match		*kongregate.com/games/GreenSatellite/trimps
// @match		*trimpstest58.netlify.app/*
// @connect		*kawyua.github.io/AutoTrimps*
// @connect		*trimps.github.io*
// @connect		self
// @grant		GM_xmlhttpRequest
// ==/UserScript==

function injectScript(id, src) {
	const script = document.createElement('script');
	script.id = id;
	script.src = src;
	script.setAttribute('crossorigin', 'anonymous');
	document.head.appendChild(script);
}

//This can be edited to point to your own Github Repository URL.
injectScript('AutoTrimps-SadAugust', 'https://kawyua.github.io/AutoTrimps/AutoTrimps2.js');
