function tdStringCode2() {
	const trapIndexs = ['', 'Fire', 'Frost', 'Poison', 'Lightning', 'Strength', 'Condenser', 'Knowledge'];
	const inputString = document.getElementById('importBox').value.replace(/\s/g, '');
	let s = new String(inputString);
	let index = s.indexOf('+', 0);
	s = s.slice(0, index);
	let length = s.length;

	let saveLayout = [];
	for (let i = 0; i < length; i++) {
		saveLayout.push(trapIndexs[s.charAt(i)]);
	}
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

var oldPlayerSpireDrawInfo = playerSpire.drawInfo;
playerSpire.drawInfo = function (arguments) {
	let ret = oldPlayerSpireDrawInfo.apply(this, arguments);
	let elem = document.getElementById('spireTrapsWindow');
	if (!elem) return arguments;
	let importBtn = `<div onclick="_displaySpireImport()" class="spireControlBox">Import</div>`;
	elem.innerHTML = importBtn + elem.innerHTML;
	return arguments;
};

function _displaySpireImport() {
	const tooltipText = `Import your Spire string! These are typically acquired through the <a href="http://swaqvalley.com/td_calc" target="_blank">Spire TD Calc website</a><br/><br/><textarea id='importBox' style='width: 100%' rows='5'></textarea>`;
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
