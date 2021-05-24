// ==UserScript==
// @name         AT-Zek-GraphsOnly
// @namespace    https://SadAugust.github.io/AutoTrimps_Local
// @version      2.6.1-Zek
// @updateURL    https://SadAugust.github.io/AutoTrimps_Local/GraphsOnly.user.js
// @description  Graphs Module (only) from AutoTrimps
// @author       zininzinin, spindrjr, belaith, ishakaru, genBTC, Zek
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @grant        none
// ==/UserScript==
var script = document.createElement('script');
script.id = 'AutoTrimps-Graphs';
script.src = 'https://SadAugust.github.io/AutoTrimps_Local/GraphsOnly.js';
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
