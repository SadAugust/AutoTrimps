(function (M) {
	M['fightInfo'] = {
		$worldGrid: document.getElementById('grid'),
		$mapGrid: document.getElementById('mapGrid'),
		changeCellColor: false,
		allExoticIcons: true,
		allPowerfulIcons: true,
		lastProcessedWorld: null,
		lastProcessedMap: null,
		imp: {
			skel: { name: 'Skeletimp', icon: '"glyphicon glyphicon-italic"', shadow: '0px 0px 10px #ffffff', color: '#ffffff' },
			exotic: { icon: '"glyphicon glyphicon-sunglasses"', shadow: '0px 0px 10px #fb753f', color: '#ff0000' },
			powerful: { icon: '"glyphicon glyphicon-fire"', shadow: '0px 0px 10px #ff0c55', color: '#ff0c55' },
			fast: { icon: '"glyphicon glyphicon-forward"', shadow: '0px 0px 10px #ffffff', color: '#000000' },
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
			whipimp: { name: 'Whipimp', icon: '"icomoon icon-area-graph"' },
			turkimp: { name: 'Turkimp', icon: '"icomoon icon-spoon-knife"' }
		},
		exoticImps: ['Chronoimp', 'Feyimp', 'Flutimp', 'Goblimp', 'Jestimp', 'Magnimp', 'Tauntimp', 'Titimp', 'Venimp', 'Whipimp', 'Randimp'],
		fastImps: ['Snimp', 'Kittimp', 'Gorillimp', 'Squimp', 'Shrimp', 'Chickimp', 'Frimp', 'Slagimp', 'Lavimp', 'Kangarimp', 'Entimp', 'Fusimp', 'Carbimp', 'Ubersmith', 'Shadimp', 'Voidsnimp', 'Prismimp', 'Sweltimp', 'Indianimp', 'Improbability', 'Neutrimp', 'Cthulimp', 'Omnipotrimp', 'Mutimp', 'Hulking_Mutimp', 'Liquimp', 'Poseidimp', 'Darknimp', 'Horrimp', 'Arachnimp', 'Beetlimp', 'Mantimp', 'Butterflimp', 'Frosnimp']
	};

	function updateCell($cell, cell, pallet, customIcon, overrideSpecial, overrideCoords) {
		/* Cell Color */
		$cell.style.color = M.fightInfo.changeCellColor ? pallet.color : $cell.style.color;
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

	function updateCell($cell, special, specialIcon, isFast, cellStyle) {
		let innerCell = $cell.innerHTML;
		let parent = $cell;
		const { fontSize, width, paddingTop, paddingBottom } = cellStyle;

		if ($cell.children.length >= 1) {
			parent = $cell.children[0];
			if (parent.children.length >= 3) return innerCell;
		}

		if (special) {
			$cell.style.color = $cell.style.color;
			/* $cell.style.textShadow = special.shadow; */
		}

		const emptyField = '<span title="Empty" class="glyphicon glyphicon-heart-empty" style="visibility: hidden;"></span>';

		if (innerCell.trim() === '&nbsp;') {
			innerCell = emptyField;
		}

		let fastIconHtml = '';
		if (isFast) {
			const fastIcon = M['fightInfo'].imp.fast;
			fastIconHtml = `<span title="Fast" class=${fastIcon.icon} style="text-shadow: ${fastIcon.shadow};color: ${fastIcon.color};"></span>`;
		} else {
			fastIconHtml = emptyField;
		}

		let specialIconHtml = '';
		if (specialIcon) {
			specialIconHtml = `<span title="${specialIcon.name}" class=${specialIcon.icon} style="text-shadow: ${special.shadow};color: ${$cell.style.color};"></span>`;
		} else {
			specialIconHtml = emptyField;
		}

		innerCell = `
			<div style="display: flex; align-items: center; justify-content: center; style="width:${width};padding-top:${paddingTop};padding-bottom:${paddingBottom};">
				<div style="font-size: ${fontSize}; width: 40px; text-align: center; padding-right: 5px;">${specialIconHtml}</div>
				<div>${innerCell}</div>
				<div style="font-size: ${fontSize}; width: 40px; text-align: center; padding-left: 5px;">${fastIconHtml}</div>
			</div>
		`;

		return innerCell;
	}

	function updateCellContent($cell, cell, cellStyle) {
		const cellName = cell.name.toLowerCase();
		let special = null;
		let specialIcon = null;

		let isFast = M['fightInfo'].fastImps.includes(cell.name);
		if (cell.corrupted && cell.corrupted.startsWith('corrupt')) isFast = false;
		if (cell.u2Mutation && Object.keys(cell.u2Mutation).length !== 0) isFast = false;

		if (cellName.includes('skele')) {
			special = M.fightInfo.imp.skel;
			specialIcon = M.fightInfo.imp.skel;
		} else if (cellName.includes('turkimp') && !game.talents.turkimp2.purchased) {
			special = M.fightInfo.imp.exotic;
			specialIcon = M.fightInfo.exotics[cellName];
		} else if (cellName in M['fightInfo'].exotics) {
			special = M.fightInfo.imp.exotic;
			specialIcon = M.fightInfo.allExoticIcons ? M.fightInfo.exotics[cellName] : null;
		} else if (cellName in M['fightInfo'].powerful) {
			special = M.fightInfo.imp.powerful;
			specialIcon = M.fightInfo.allPowerfulIcons ? M.fightInfo.powerful[cellName] : null;
		} else if (cellName.includes('poison')) {
			special = M.fightInfo.imp.poison;
		} else if (cellName.includes('wind')) {
			special = M.fightInfo.imp.wind;
		} else if (cellName.includes('ice')) {
			special = M.fightInfo.imp.ice;
		}

		return updateCell($cell, special, specialIcon, isFast, cellStyle);
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
		const mapSize = cells.length + 1;
		let columns = 10;
		if (game.global.mapsActive) {
			if (mapSize === 150) {
				columns = 15;
			} else {
				columns = Math.floor(Math.sqrt(mapSize));
			}
		}

		const cellStyle = {
			fontSize: `${columns / 14 + 0.5}vh`,
			width: `${100 / columns}%`,
			paddingTop: `${100 / columns / 19}vh`,
			paddingBottom: `${100 / columns / 19}vh`
		};

		cellArray.forEach(($cell, i) => {
			let cell = cells[i];
			const innerHTML = updateCellContent($cell, cell, cellStyle);
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
		if (!(game.global.gridArray && game.global.gridArray[0])) return;

		if (game.global.mapsActive) {
			if (M['fightInfo'].lastProcessedMap === game.global.mapStarted) return;
			M['fightInfo'].lastProcessedMap = game.global.mapStarted;
		} else {
			if (M['fightInfo'].lastProcessedWorld === game.global.world) return;
			M['fightInfo'].lastProcessedWorld = game.global.world;
		}

		const gridElement = game.global.mapsActive ? document.getElementById('mapGrid') : document.getElementById('grid');
		const rowSource = game.global.mapsActive ? M['fightInfo'].$mapGrid.children : M['fightInfo'].$worldGrid.children;
		const $rows = Array.prototype.slice.call(rowSource).reverse();
		const cellArray = $rows.reduce((acc, row) => acc.concat(Array.prototype.slice.call(row.children)), []);

		const updates = processCells(cellArray, []);
		const fragment = createFragment(updates, $rows);
		const reversedFragment = reverseFragment(fragment);

		gridElement.innerHTML = '';
		gridElement.appendChild(reversedFragment);
	}

	M['fightInfo'].Update = Update;
})(atData);
