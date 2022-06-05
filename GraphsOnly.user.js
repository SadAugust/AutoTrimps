// ==UserScript==
// @name         AT-SA-GraphsOnly
// @namespace    https://github.com/SadAugust/AutoTrimps_Local
// @version      3.0.0-SA
// @updateURL    https://github.com/SadAugust/AutoTrimps_Local/GraphsOnly.user.js
// @description  Graphs Module (only) from AutoTrimps
// @author       zininzinin, spindrjr, belaith, ishakaru, genBTC, Zek
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @grant        none
// ==/UserScript==
var script = document.createElement('script');
script.id = 'AutoTrimps-Graphs';
script.src = 'https://SadAugust.github.io/AutoTrimps_Local/GraphsOnly.js';
script.setAttribute('crossorigin', "anonymous");
document.head.appendChild(script);
