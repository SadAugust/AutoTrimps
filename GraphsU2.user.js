// ==UserScript==
// @name         AT-Zek-GraphsU1
// @namespace    https://github.com/SadAugust/AutoTrimps
// @version      3.0.0-Zek
// @updateURL    https://github.com/SadAugust/AutoTrimps/GraphsU2.user.js
// @description  Graphs Module (only for U1) from AutoTrimps
// @author       zininzinin, spindrjr, belaith, ishakaru, genBTC, Zek
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @grant        none
// ==/UserScript==
var script = document.createElement('script');
script.id = 'AutoTrimps-GraphsU1';
script.src = 'https://SadAugust.github.io/AutoTrimps/GraphsU2.js';
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
