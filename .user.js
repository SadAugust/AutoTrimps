// ==UserScript==
// @name         AutoTrimps-SadAugust_Local
// @version      1.0-SadAugust
// @namespace    https://SadAugust.github.io/AutoTrimps_Local
// @updateURL    https://SadAugust.github.io/AutoTrimps_Local/.user.js
// @description  Automate all the trimps!
// @author       zininzinin, spindrjr, Ishkaru, genBTC, Zeker0, SadAugust
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @include      *trimpstest55.netlify.app/*
// @connect      *SadAugust.github.io/AutoTrimps_Local*
// @connect      *trimps.github.io*
// @connect      self
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var script = document.createElement('script');
script.id = 'AutoTrimps-SadAugust_Local';
//This can be edited to point to your own Github Repository URL.
script.src = 'https://SadAugust.github.io/AutoTrimps_Local/AutoTrimps2.js';
//script.setAttribute('crossorigin',"use-credentials");
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);