// ==UserScript==
// @name         AT-Zek-GraphsOnly
// @namespace    https://github.com/Zorn192/AutoTrimps
// @version      2.6.1-Zek
// @updateURL    https://github.com/Zorn192/AutoTrimps/GraphsOnly.user.js
// @description  Graphs Module (only) from AutoTrimps
// @author       zininzinin, spindrjr, belaith, ishakaru, genBTC, Zek
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @grant        none
// ==/UserScript==
var script = document.createElement('script');
script.id = 'AutoTrimps-Graphs';
script.src = 'https://Zorn192.github.io/AutoTrimps/GraphsOnly.js';
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
