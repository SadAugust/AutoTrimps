// ===UserScript===
// @name		AutoTrimps-SadAugust
// @version		1.0-SadAugust
// @namespace	https://SadAugust.github.io/AutoTrimps
// @description	Automate all the trimps!
// @author		zininzinin, spindrjr, Ishkaru, genBTC, Zeker0, SadAugust, erplsf
// @match		*trimps.github.io*
// @match		*kongregate.com/games/GreenSatellite/trimps
// @match		*trimpstest58.netlify.app/*
// @connect		*SadAugust.github.io/AutoTrimps*
// @connect		*trimps.github.io*
// @connect		self
// @grant		GM_xmlhttpRequest
// ===/UserScript===

var script = document.createElement('script');
script.id = 'AutoTrimps-SadAugust';
//This can be edited to point to your own Github Repository URL.
script.src = 'https://sadaugust.github.io/AutoTrimps/AutoTrimps2.js';
//script.setAttribute('crossorigin',"use-credentials");
script.setAttribute('crossorigin', "anonymous");
document.head.appendChild(script);