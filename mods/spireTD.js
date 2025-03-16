function verifyLayout(layout) {
	for (const trap of layout) {
		if (playerSpireTraps[trap].locked) {
			tooltip('confirm', null, 'update', 'Illegal trap layout. Try using <a href="http://swaqvalley.com/td_calc/" target="_blank">swaqs spire build calculator</a> instead.', 'cancelTooltip()', `Invalid Import`, 'Confirm');
			return false;
		}
	}
	return true;
}

function tdStringCode(inputString) {
	const trapIndexs = ['', 'Fire', 'Frost', 'Poison', 'Lightning', 'Strength', 'Condenser', 'Knowledge'];
	let s = new String(inputString.replace(/\s/g, ''));
	const index = s.indexOf('+', 0);
	s = s.slice(0, index);
	const length = s.length;

	const saveLayout = [];
	for (let i = 0; i < length; i++) {
		saveLayout.push(trapIndexs[s.charAt(i)]);
	}
	if (!verifyLayout(saveLayout)) return false;

	playerSpire['savedLayout' + -1] = saveLayout;
	if (playerSpire.runestones + playerSpire.getCurrentLayoutPrice() < playerSpire.getSavedLayoutPrice(-1)) return false;

	playerSpire.resetTraps();
	for (let x = 0; x < saveLayout.length; x++) {
		if (!saveLayout[x]) continue;
		playerSpire.buildTrap(x, saveLayout[x]);
	}
}

playerSpire.updateRsPs = function () {
	const elem = document.getElementById('playerSpireInfoTop');
	if (elem && elem.firstChild) {
		const runeStonesPS = this.getRsPs();
		elem.firstChild.innerHTML = `
	<span onmouseover='playerSpire.infoTooltip("Runestones", event)' onmouseout='tooltip("hide")'>
		Runestones: <span id='playerSpireRunestones'>${prettify(this.runestones)}</span><br/>
		Rs/s: <span id='RsPs'>${prettify(runeStonesPS)} Rs/hr ${prettify(runeStonesPS * 3600)}</span>
	</span>`;
	}
};

function _getClipboardText(ev) {
	return ev.clipboardData.getData('text/plain').replace(/\s/g, '');
}

if (typeof oldPlayerSpireDrawInfo !== 'function') {
	var oldPlayerSpireDrawInfo = playerSpire.drawInfo;
	playerSpire.drawInfo = function (arguments) {
		oldPlayerSpireDrawInfo.apply(this, arguments);
		const elem = document.getElementById('spireTrapsWindow');
		const tooltipText = `Click to paste and import your Spire string! These are typically acquired through the Spire TD Calc website`;
		if (!elem) return arguments;
		const importBtn = `<input style="width:19%;border:2px solid #dadada;padding:0.5vw;display:inline-block;margin:0.5%;text-align:center;" placeholder="Import" onpaste="tdStringCode(_getClipboardText(event));" title="${tooltipText}">`;

		elem.innerHTML = importBtn + elem.innerHTML;
		return arguments;
	};
}

function _displaySpireImport() {
	const tooltipText = `Click onto and paste to import your Spire string! These are typically acquired through the <a href="http://swaqvalley.com/td_calc" target="_blank">Spire TD Calc website</a><br/><br/><textarea id='importBox' style='width: 100%' rows='5'></textarea>`;
	const costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); tdStringCode2();'>Import</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";

	const ondisplay = function () {
		_verticalCenterTooltip();
		document.getElementById('importBox').focus();
	};

	cancelTooltip();
	const tooltipDiv = document.getElementById('tooltipDiv');
	swapClass('tooltipExtra', 'tooltipExtraNone', tooltipDiv);
	tooltipDiv.style.left = '33.75%';
	tooltipDiv.style.top = '25%';

	game.global.lockTooltip = true;
	document.getElementById('tipText').className = '';
	document.getElementById('tipText').innerHTML = tooltipText;
	document.getElementById('tipTitle').innerHTML = 'Import Spire Settings';
	document.getElementById('tipCost').innerHTML = costText;
	tooltipDiv.style.display = 'block';
	if (typeof ondisplay === 'function') ondisplay();
}

/* If using standalone version then inform user it has loaded. */
if (typeof autoTrimpSettings === 'undefined' || (typeof autoTrimpSettings !== 'undefined' && typeof autoTrimpSettings.ATversion !== 'undefined' && !autoTrimpSettings.ATversion.includes('SadAugust'))) {
	console.log('The SpireTD Import mod has finished loading.');
	message('The SpireTD Import mod has finished loading.', 'Loot');
}
