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
			whipimp: { name: 'Whipimp', icon: '"icomoon icon-area-graph"' }
		},
		exoticImps: ['Chronoimp', 'Feyimp', 'Flutimp', 'Goblimp', 'Jestimp', 'Magnimp', 'Tauntimp', 'Titimp', 'Venimp', 'Whipimp', 'Randimp'],
		fastImps: ['Snimp', 'Kittimp', 'Gorillimp', 'Squimp', 'Shrimp', 'Chickimp', 'Frimp', 'Slagimp', 'Lavimp', 'Kangarimp', 'Entimp', 'Fusimp', 'Carbimp', 'Ubersmith', 'Shadimp', 'Voidsnimp', 'Prismimp', 'Sweltimp', 'Indianimp', 'Improbability', 'Neutrimp', 'Cthulimp', 'Omnipotrimp', 'Mutimp', 'Hulking_Mutimp', 'Liquimp', 'Poseidimp', 'Darknimp', 'Horrimp', 'Arachnimp', 'Beetlimp', 'Mantimp', 'Butterflimp', 'Frosnimp']
	};

	function updateCell($cell, cell, special, specialIcon, isFast) {

		if ($cell.children.length >= 1 && $cell.children[0].children.length >= 3){
			// We already updated this field
			return;
		}

		// Cell Color
		if (special) {
			$cell.style.color = special.color;
			$cell.style.textShadow = special.shadow;
		}
		
		const emptyField = '<span title="Empty" class="glyphicon glyphicon-heart-empty" style="visibility: hidden;"></span>';

		let innerCell = $cell.innerHTML;
		if (innerCell.trim() == "&nbsp;") {
			innerCell = emptyField;
		}

		if (isFast) {
			const fastIcon = M['fightinfo'].imp.fast;
			innerCell += `<span title="Fast" class=${fastIcon.icon} style="text-shadow: ${fastIcon.shadow};color: ${fastIcon.color};"></span>`
		}else {
			innerCell += emptyField;
		}
		//text-shadow: -2px 0 black, 0 2px black, 2px 0 black, 0 -2px black;

		if (specialIcon) {
			innerCell = `<span title="${specialIcon.name}" class=${specialIcon.icon} style="text-shadow: ${special.shadow};color: ${special.color};"></span>` + innerCell;
		} else {
			innerCell = emptyField + innerCell;
		}

		$cell.innerHTML = `<span style="display: grid;grid-auto-flow: column;grid-auto-columns: 1fr;">${innerCell}</span>`;
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

			const isFast = M['fightinfo'].fastImps.includes(cell.name);

			let special = null;
			let specialIcon = null;

			if (cellName.includes('skele')) {
				special = M.fightinfo.imp.skel;
			} else if (cellName in M['fightinfo'].exotics) {
				special = M.fightinfo.imp.exotic;
				specialIcon = M.fightinfo.allExoticIcons ? M.fightinfo.exotics[cellName] : null
			} else if (cellName in M['fightinfo'].powerful) {
				special = M.fightinfo.imp.powerful;
				specialIcon = M.fightinfo.allPowerfulIcons ? M.fightinfo.powerful[cellName] : null;
			} else if (cellName.includes('poison')) {
				special = M.fightinfo.imp.poison;
			} else if (cellName.includes('wind')) {
				special = M.fightinfo.imp.wind;
			} else if (cellName.includes('ice')) {
				special = M.fightinfo.imp.ice;
			}

			if (special && !specialIcon) {
				specialIcon = {icon: special.icon, name: special.name};
			}
 
			updateCell($cell, cell, special, specialIcon, isFast);

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
