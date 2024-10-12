function updateBadBar(cell) {
	const showPercentage = typeof atSettings === 'undefined' || getPageSetting('displayPercentHealth');
	const badGuyHealth = document.getElementById('badGuyHealth');
	const enemyHealth = prettify(cell.health);

	if (!showPercentage) {
		if (badGuyHealth.innerHTML !== enemyHealth) badGuyHealth.innerHTML = enemyHealth;
	}

	if (badGuyHealth.innerHTML !== enemyHealth) badGuyHealth.innerHTML = enemyHealth;
	if (!game.options.menu.progressBars.enabled) return;
	const barElem = document.getElementById('badGuyBar');
	const percent = (cell.health / cell.maxHealth) * 100;
	const percentDispaly = `${percent.toFixed(2).replace(/\.?0+$/, '')}%`;
	barElem.style.width = percentDispaly;

	if (showPercentage) {
		if (badGuyHealth.innerHTML !== percentDispaly) badGuyHealth.innerHTML = percentDispaly;
	}

	swapClass('percentColor', getBarColorClass(percent), barElem);
}

function updateGoodBar() {
	const showPercentage = typeof atSettings === 'undefined' || getPageSetting('displayPercentHealth');
	const goodGuyHealth = document.getElementById('goodGuyHealth');

	if (!showPercentage) {
		const healthDisplay = prettify(game.global.soldierHealth);
		if (goodGuyHealth.innerHTML !== healthDisplay) goodGuyHealth.innerHTML = healthDisplay;
	}

	let shieldDisplay = '';

	if (!game.options.menu.progressBars.enabled) return;
	const barElem = document.getElementById('goodGuyBar');
	if (game.global.universe == 2) {
		const maxLayers = Fluffy.isRewardActive('shieldlayer');
		const layers = maxLayers - game.global.shieldLayersUsed;
		const esElem = document.getElementById('energyShield');
		const layerElem = document.getElementById('energyShieldLayer');
		const layer2Elem = document.getElementById('energyShieldLayer2');
		const shieldPercentage = (Math.max(game.global.soldierEnergyShield, 0) / game.global.soldierEnergyShieldMax) * 100;
		shieldDisplay = ` (${shieldPercentage.toFixed(2).replace(/\.?0+$/, '')}%)`;

		if (game.global.soldierEnergyShieldMax <= 0 || game.global.soldierHealth <= 0 || game.global.soldierEnergyShield <= 0) {
			esElem.style.width = '0%';
			layerElem.style.width = '0%';
			layer2Elem.style.width = '0%';
		} else {
			esElem.style.width = '100%';

			if (layers > 1) {
				layerElem.style.width = '100%';
				layer2Elem.style.width = shieldPercentage + '%';
			} else if (layers > 0) {
				layerElem.style.width = shieldPercentage + '%';
				layer2Elem.style.width = '0%';
			} else {
				esElem.style.width = shieldPercentage + '%';
				layerElem.style.width = '0%';
				layer2Elem.style.width = '0%';
			}
		}
	}

	const percent = (game.global.soldierHealth / game.global.soldierHealthMax) * 100;

	if (showPercentage) {
		const healthDisplay = `${percent.toFixed(2).replace(/\.?0+$/, '')}%`;
		if (goodGuyHealth.innerHTML !== `${healthDisplay}${shieldDisplay}`) goodGuyHealth.innerHTML = `${healthDisplay}${shieldDisplay}`;
	}

	barElem.style.width = percent + '%';
	swapClass('percentColor', getBarColorClass(percent), barElem);
}

if (typeof atSettings === 'undefined') {
	if (document.getElementById('goodGuyHealthMax').parentNode.childNodes[2].data === '/') {
		document.getElementById('goodGuyHealth').style.display = 'block';
		document.getElementById('goodGuyHealthMax').parentNode.removeChild(document.getElementById('goodGuyHealthMax').parentNode.childNodes[2]);
		document.getElementById('goodGuyHealthMax').style.visibility = 'hidden';
	}

	if (document.getElementById('badGuyHealthMax').parentNode.childNodes[2].data === '/') {
		document.getElementById('badGuyHealth').style.display = 'block';
		document.getElementById('badGuyHealthMax').parentNode.removeChild(document.getElementById('badGuyHealthMax').parentNode.childNodes[2]);
		document.getElementById('badGuyHealthMax').style.visibility = 'hidden';
	}
}
