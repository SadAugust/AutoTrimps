(function (M) {
	M['fightinfo'] = {
		changeCellColor: false,
		allExoticIcons: true,
		allPowerfulIcons: true,
		lastProcessedWorld: null,
		lastProcessedMap: null,
		imp: {
			skel: { icon: '"glyphicon glyphicon-italic"', shadow: '0px 0px 10px #ffffff', color: '#ffffff' },
			exotic: { icon: '"glyphicon glyphicon-sunglasses"', shadow: '0px 0px 10px #fb753f', color: '#ff0000' },
			powerful: { icon: '"glyphicon glyphicon-fire"', shadow: '0px 0px 10px #ff0c55', color: '#ff0c55' },
			fast: { icon: '"glyphicon glyphicon-forward"', shadow: '0px 0px 10px #ffffff', color: '#666666' },
			poison: { icon: '"glyphicon glyphicon-flask"', shadow: '0px 0px 10px #ffffff', color: '#00ff00' },
			wind: { icon: '"icomoon icon-air"', shadow: '0px 0px 10px #ffffff', color: '#99ffff' },
			ice: { icon: '"glyphicon glyphicon-certificate"', shadow: '0px 0px 10px #ffffff', color: '#00ffff' }
		},
		powerful: {
			blimp: { name: 'Blimp', icon: '"glyphicon glyphicon-plane"' },
			cthulimp: { name: 'Cthulimp', icon: '"icomoon icon-archive"' },
			improbability: { name: 'Improbability', icon: '"glyphicon glyphicon-question-sign"' },
			omnipotrimp: { name: 'Omnipotrimp', icon: '"glyphicon glyphicon-fire"' },
			mutimp: { name: 'Mutimp', icon: '"glyphicon glyphicon-menu-up"' },
			hulking_mutimp: { name: 'Hulking_Mutimp', icon: '" glyphicon glyphicon-chevron-up"' }
		},
		exotics: {
			chronoimp: { name: 'Chronoimp', icon: '"glyphicon glyphicon-hourglass"' },
			feyimp: { name: 'Feyimp', icon: '"icomoon icon-diamond"' },
			flutimp: { name: 'Flutimp', icon: '"glyphicon glyphicon-globe"' },
			goblimp: { name: 'Goblimp', icon: '"icomoon icon-evil"' },
			jestimp: { name: 'Jestimp', icon: '"icomoon icon-mask"' },
			magnimp: { name: 'Magnimp', icon: '"glyphicon glyphicon-magnet"' },
			tauntimp: { name: 'Tauntimp', icon: '"glyphicon glyphicon-tent"' },
			titimp: { name: 'Titimp', icon: '"icomoon icon-hammer"' },
			venimp: { name: 'Venimp', icon: '"glyphicon glyphicon-baby-formula"' },
			whipimp: { name: 'Whipimp', icon: '"icomoon icon-area-graph"' }
		},
		exoticImps: ['Chronoimp', 'Feyimp', 'Flutimp', 'Goblimp', 'Jestimp', 'Magnimp', 'Tauntimp', 'Titimp', 'Venimp', 'Whipimp', 'Randimp'],
		fastImps: ['Snimp', 'Kittimp', 'Gorillimp', 'Squimp', 'Shrimp', 'Chickimp', 'Frimp', 'Slagimp', 'Lavimp', 'Kangarimp', 'Entimp', 'Fusimp', 'Carbimp', 'Ubersmith', 'Shadimp', 'Voidsnimp', 'Prismimp', 'Sweltimp', 'Indianimp', 'Improbability', 'Neutrimp', 'Cthulimp', 'Omnipotrimp', 'Mutimp', 'Hulking_Mutimp', 'Liquimp', 'Poseidimp', 'Darknimp', 'Horrimp', 'Arachnimp', 'Beetlimp', 'Mantimp', 'Butterflimp', 'Frosnimp']
	};

	function updateCell($cell, cell, pallet, customIcon, overrideSpecial, overrideCoords) {
		/* Cell Color */
		$cell.style.color = M.fightinfo.changeCellColor ? pallet.color : $cell.style.color;
		$cell.style.textShadow = pallet.shadow;

		/* Glyph Icon */
		const icon = customIcon || pallet.icon;
		const replaceable = ['fruit', 'Metal', 'gems', 'freeMetals', 'groundLumber', 'Wood', 'Map', 'Any'];
		if (overrideCoords) replaceable.push('Coordination');

		/* Icon Overriding */
		if (!cell.special.length || (overrideSpecial && replaceable.includes(cell.special))) {
			return `<span class=${icon}></span>`;
		}

		return $cell.innerHTML;
	}

	function updateCellContent($cell, cell) {
		const cellName = cell.name.toLowerCase();
		let innerHTML = $cell.innerHTML;

		if (cellName.includes('skele')) {
			innerHTML = updateCell($cell, cell, M.fightinfo.imp.skel);
		} else if (cellName in M['fightinfo'].exotics) {
			const icon = M.fightinfo.allExoticIcons ? M.fightinfo.exotics[cellName].icon : undefined;
			innerHTML = updateCell($cell, cell, M.fightinfo.imp.exotic, icon, true);
		} else if (cellName in M['fightinfo'].powerful) {
			const icon = M.fightinfo.allPowerfulIcons ? M.fightinfo.powerful[cellName].icon : undefined;
			innerHTML = updateCell($cell, cell, M.fightinfo.imp.powerful, icon, M.fightinfo.allPowerfulIcons, true);
		} else if ((M['fightinfo'].fastImps.includes(cell.name) && (!cell.corrupted || !cell.corrupted.startsWith('corrupt'))) || (cell.u2Mutation !== undefined && Object.keys(cell.u2Mutation).length !== 0)) {
			innerHTML = updateCell($cell, cell, M.fightinfo.imp.fast);
		} else if (cellName.includes('poison')) {
			innerHTML = updateCell($cell, cell, M.fightinfo.imp.poison);
		} else if (cellName.includes('wind')) {
			innerHTML = updateCell($cell, cell, M.fightinfo.imp.wind);
		} else if (cellName.includes('ice')) {
			innerHTML = updateCell($cell, cell, M.fightinfo.imp.ice);
		}

		return innerHTML;
	}

	function updateCellTitle($cell, cell) {
		$cell.title = cell.name;

		if (cell.corrupted && cell.corrupted.startsWith('corrupt')) {
			$cell.title += ` - ${mutationEffects[cell.corrupted].title}`;
		}

		if (cell.u2Mutation !== undefined) {
			cell.u2Mutation.forEach((mut) => {
				$cell.title += ` - ${u2Mutations.getName([mut])}`;
				$cell.classList.add(mut);
			});
		}

		return $cell;
	}

	function processCells(cellArray, updates) {
		const cells = game.global.mapsActive ? game.global.mapGridArray : game.global.gridArray;
		cellArray.forEach(($cell, i) => {
			let cell = cells[i];
			const innerHTML = updateCellContent($cell, cell);
			cell = updateCellTitle($cell, cell);
			updates.push({ $cell, innerHTML });
		});

		return updates;
	}

	function createFragment(updates, $rows) {
		let currentRow;
		let rowIndex = 0;
		const fragment = document.createDocumentFragment();
		const columns = $rows[0].childNodes.length;

		updates.forEach(({ $cell, innerHTML }, index) => {
			if (index % columns === 0) {
				currentRow = $rows[rowIndex];
				currentRow.innerHTML = '';
				fragment.appendChild(currentRow);
				rowIndex++;
			}

			const newCell = $cell.cloneNode(true);
			newCell.innerHTML = innerHTML;
			currentRow.appendChild(newCell);
		});

		return fragment;
	}

	function reverseFragment(fragment) {
		const rows = Array.from(fragment.children).reverse();
		const reversedFragment = document.createDocumentFragment();
		rows.forEach((row) => reversedFragment.appendChild(row));
		return reversedFragment;
	}

	function Update() {
		if (game.global.preMapsActive) return;

		if (game.global.mapsActive) {
			if (M['fightinfo'].lastProcessedMap === game.global.mapStarted) return;
			M['fightinfo'].lastProcessedMap = game.global.mapStarted;
		} else {
			if (M['fightinfo'].lastProcessedWorld === game.global.world) return;
			M['fightinfo'].lastProcessedWorld = game.global.world;
		}

		const gridElement = game.global.mapsActive ? document.getElementById('mapGrid') : document.getElementById('grid');
		const $rows = Array.prototype.slice.call(gridElement).reverse();
		const cellArray = $rows.reduce((acc, row) => acc.concat(Array.prototype.slice.call(row.children)), []);

		const updates = processCells(cellArray, []);
		const fragment = createFragment(updates, $rows);
		const reversedFragment = reverseFragment(fragment);

		gridElement.innerHTML = '';
		gridElement.appendChild(reversedFragment);
	}

	M['fightinfo'].Update = Update;
})(MODULES);
