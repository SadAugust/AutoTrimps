function injectScript(id, src) {
    var script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.setAttribute('crossorigin', 'anonymous');
    document.head.appendChild(script);
}

//This can be edited to point to your own Github Repository URL.
injectScript('AutoTrimps-SadAugust', 'https://SadAugust.github.io/AutoTrimps/AutoTrimps2.js');
