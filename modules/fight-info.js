(function (M) {
	M['fightinfo'] = {
		$worldGrid: document.getElementById('grid'),
		$mapGrid: document.getElementById('mapGrid'),
		changeCellColor: false,
		allExoticIcons: true,
		allPowerfulIcons: true,
		lastProcessedWorld: null,
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
		// Cell Color
		$cell.style.color = M.fightinfo.changeCellColor ? pallet.color : $cell.style.color;
		$cell.style.textShadow = pallet.shadow;

		// Glyph Icon
		const icon = customIcon || pallet.icon;
		const replaceable = ['fruit', 'Metal', 'gems', 'freeMetals', 'groundLumber', 'Wood', 'Map', 'Any'];
		if (overrideCoords) replaceable.push('Coordination');

		// Icon Overriding
		if (!cell.special.length || (overrideSpecial && replaceable.includes(cell.special))) {
			$cell.innerHTML = `<span class=${icon}></span>`;
		}
	}

	function Update() {
		const cells = game.global.mapsActive ? game.global.mapGridArray : game.global.gridArray;
		const rowSource = game.global.mapsActive ? M['fightinfo'].$mapGrid.children : M['fightinfo'].$worldGrid.children;
		const $rows = Array.prototype.slice.call(rowSource).reverse();

		if (!game.global.mapsActive) {
			if (M['fightinfo'].lastProcessedWorld === game.global.world || game.global.preMapsActive) return;
			M['fightinfo'].lastProcessedWorld = game.global.world;
		}

		const cellArray = $rows.reduce((acc, row) => acc.concat(Array.prototype.slice.call(row.children)), []);

		cellArray.forEach(($cell, i) => {
			const cell = cells[i];
			const cellName = cell.name.toLowerCase();

			if (cellName.includes('skele')) {
				updateCell($cell, cell, M.fightinfo.imp.skel);
			} else if (cellName in M['fightinfo'].exotics) {
				const icon = M.fightinfo.allExoticIcons ? M.fightinfo.exotics[cellName].icon : undefined;
				updateCell($cell, cell, M.fightinfo.imp.exotic, icon, true);
			} else if (cellName in M['fightinfo'].powerful) {
				const icon = M.fightinfo.allPowerfulIcons ? M.fightinfo.powerful[cellName].icon : undefined;
				updateCell($cell, cell, M.fightinfo.imp.powerful, icon, M.fightinfo.allPowerfulIcons, true);
			} else if ((M['fightinfo'].fastImps.includes(cell.name) && (!cell.corrupted || !cell.corrupted.startsWith('corrupt'))) || (cell.u2Mutation !== undefined && Object.keys(cell.u2Mutation).length !== 0)) {
				updateCell($cell, cell, M.fightinfo.imp.fast);
			} else if (cellName.includes('poison')) {
				updateCell($cell, cell, M.fightinfo.imp.poison);
			} else if (cellName.includes('wind')) {
				updateCell($cell, cell, M.fightinfo.imp.wind);
			} else if (cellName.includes('ice')) {
				updateCell($cell, cell, M.fightinfo.imp.ice);
			}

			$cell.title = cell.name;
			if (cell.corrupted && cell.corrupted.startsWith('corrupt')) $cell.title += ' - ' + mutationEffects[cell.corrupted].title;

			if (cell.u2Mutation !== undefined) {
				cell.u2Mutation.forEach((mut) => {
					$cell.title += ' - ' + u2Mutations.getName([mut]);
					$cell.classList.add(mut);
				});
			}
		});
	}

	M['fightinfo'].Update = Update;
})(MODULES);
