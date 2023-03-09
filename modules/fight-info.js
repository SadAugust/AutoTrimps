; (function (M) {
	M["fightinfo"] = {};
	M["fightinfo"].$worldGrid = document.getElementById('grid');
	M["fightinfo"].$mapGrid = document.getElementById('mapGrid');

	//This changes the colour of the cell. It's usually bad, because it overrides trimps and looks bad against corruption, among other reasons
	M["fightinfo"].changeCellColor = false;

	//This option reverts to AT's old way of giving an unique icon for each of the exotic/powerful imps
	M["fightinfo"].allExoticIcons = true;
	M["fightinfo"].allPowerfulIcons = true;

	M["fightinfo"].imp = {
		skel: { icon: '"glyphicon glyphicon-italic"', shadow: "0px 0px 10px #ffffff", color: '#ffffff' },
		exotic: { icon: '"glyphicon glyphicon-sunglasses"', shadow: "0px 0px 10px #fb753f", color: '#ff0000' },
		powerful: { icon: '"glyphicon glyphicon-fire"', shadow: "0px 0px 10px #ff0c55", color: '#ff0c55' },
		fast: { icon: '"glyphicon glyphicon-forward"', shadow: "0px 0px 10px #ffffff", color: '#666666' },
		poison: { icon: '"glyphicon glyphicon-flask"', shadow: "0px 0px 10px #ffffff", color: '#00ff00' },
		wind: { icon: '"icomoon icon-air"', shadow: "0px 0px 10px #ffffff", color: '#99ffff' },
		ice: { icon: '"glyphicon glyphicon-certificate"', shadow: "0px 0px 10px #ffffff", color: '#00ffff' }
	};

	//Powerful imps
	M["fightinfo"].powerful = {
		blimp: { name: "Blimp", icon: '"glyphicon glyphicon-plane"' },
		cthulimp: { name: "Cthulimp", icon: '"icomoon icon-archive"' },
		improbability: { name: "Improbability", icon: '"glyphicon glyphicon-question-sign"' },
		omnipotrimp: { name: "Omnipotrimp", icon: '"glyphicon glyphicon-fire"' },
		mutimp: { name: "Mutimp", icon: '"glyphicon glyphicon-menu-up"' },
		hulking_mutimp: { name: "Hulking_Mutimp", icon: '" glyphicon glyphicon-chevron-up"' }
	};

	//Exotic imps
	M["fightinfo"].exotics = {
		chronoimp: { name: "Chronoimp", icon: '"glyphicon glyphicon-hourglass"' },
		feyimp: { name: "Feyimp", icon: '"icomoon icon-diamond"' },
		flutimp: { name: "Flutimp", icon: '"glyphicon glyphicon-globe"' },
		goblimp: { name: "Goblimp", icon: '"icomoon icon-evil"' },
		jestimp: { name: "Jestimp", icon: '"icomoon icon-mask"' },
		magnimp: { name: "Magnimp", icon: '"glyphicon glyphicon-magnet"' },
		tauntimp: { name: "Tauntimp", icon: '"glyphicon glyphicon-tent"' },
		titimp: { name: "Titimp", icon: '"icomoon icon-hammer"' },
		venimp: { name: "Venimp", icon: '"glyphicon glyphicon-baby-formula"' },
		whipimp: { name: "Whipimp", icon: '"icomoon icon-area-graph"' },
	};

	//Fast imps
	M["fightinfo"].fast = [
		"Snimp",
		"Kittimp",
		"Gorillimp",
		"Squimp",
		"Shrimp",
		"Chickimp",
		"Frimp",
		"Slagimp",
		"Lavimp",
		"Kangarimp",
		"Entimp",
		"Fusimp",
		"Carbimp",
		"Ubersmith",
		"Shadimp",
		"Voidsnimp",
		"Prismimp",
		"Sweltimp",
		"Indianimp",
		"Improbability",
		"Neutrimp",
		"Cthulimp",
		"Omnipotrimp",
		"Mutimp",
		"Hulking_Mutimp",
		"Liquimp",
		"Poseidimp",
		"Darknimp",
		"Horrimp",
		"Arachnimp",
		"Beetlimp",
		"Mantimp",
		"Butterflimp",
		"Frosnimp"
	];

	//Last processed
	M["fightinfo"].lastProcessedWorld = null;
	M["fightinfo"].lastProcessedMap = null;

	function updateCell($cell, cell, pallet, customIcon, overrideSpecial, overrideCoords) {
		//Cell Color
		if (M.fightinfo.changeCellColor) $cell.style.color = pallet.color;
		$cell.style.textShadow = pallet.shadow;

		//Glyph Icon
		var icon = (customIcon) ? customIcon : pallet.icon
		var replaceable = ["fruit", "Metal", "gems", "freeMetals", "groundLumber", "Wood", "Map", "Any"]
		if (overrideCoords) replaceable.push("Coordination");

		//Icon Overriding
		if (cell.special.length == 0 || overrideSpecial && replaceable.includes(cell.special))
			$cell.innerHTML = "<span class=" + icon + "></span>";
	}

	function Update() {
		//Check if we should update world or map info
		var $cells = [];
		var cells = (game.global.mapsActive) ? game.global.mapGridArray : game.global.gridArray;
		var rowSource = (game.global.mapsActive) ? M["fightinfo"].$mapGrid.children : M["fightinfo"].$worldGrid.children;
		var $rows = Array.prototype.slice.call(rowSource).reverse();

		//Check if current the world is already info-ed
		if (!game.global.mapsActive && M["fightinfo"].lastProcessedWorld == game.global.world)
			return;

		//Set this world as info-ed
		else if (!game.global.mapsActive) M["fightinfo"].lastProcessedWorld = game.global.world;

		//Loop through DOM rows and concat each row's cell-element into $cells
		$rows.forEach(function (row) {
			$cells = $cells.concat(Array.prototype.slice.call(row.children));
		});

		//Process all cells
		for (var i = 0; i < $cells.length; i++) {
			//Init
			var $cell = $cells[i];
			var cell = cells[i];

			//Skeletimp
			if (cell.name.toLowerCase().indexOf('skele') > -1) {
				updateCell($cell, cell, M.fightinfo.imp.skel);
			}

			//Exotic cell
			else if (cell.name.toLowerCase() in M["fightinfo"].exotics) {
				var icon = M.fightinfo.allExoticIcons ? M.fightinfo.exotics[cell.name.toLowerCase()].icon : undefined;
				updateCell($cell, cell, M.fightinfo.imp.exotic, icon, true);
			}

			//Powerful Imp
			else if (cell.name.toLowerCase() in M["fightinfo"].powerful) {
				var icon = M.fightinfo.allPowerfulIcons ? M.fightinfo.powerful[cell.name.toLowerCase()].icon : undefined;
				updateCell($cell, cell, M.fightinfo.imp.powerful, icon, M.fightinfo.allPowerfulIcons, true);
			}

			//Fast Imp
			else if ((M["fightinfo"].fast.indexOf(cell.name) > -1 && (!cell.corrupted || !cell.corrupted.startsWith("corrupt"))) || (cell.u2Mutation !== undefined && Object.keys(cell.u2Mutation).length !== 0)) {
				updateCell($cell, cell, M.fightinfo.imp.fast);
			}

			//This shit doesn't work and I don't know why (What is the cell.title??? is it the name of the nature? Imps are labelled Toxic/Gusty/Frozen but that didn't work either)
			else if (cell.name.toLowerCase().indexOf('poison') > -1) {
				updateCell($cell, cell, M.fightinfo.imp.poison);
			}

			//Wind Token
			else if (cell.name.toLowerCase().indexOf('wind') > -1) {
				updateCell($cell, cell, M.fightinfo.imp.wind);
			}

			//Ice Token
			else if (cell.name.toLowerCase().indexOf('ice') > -1) {
				updateCell($cell, cell, M.fightinfo.imp.ice);
			}

			//Cell Titles
			$cell.title = cell.name;
			if (cell.corrupted && cell.corrupted.startsWith("corrupt"))
				$cell.title += " - " + mutationEffects[cell.corrupted].title;

			if (cell.u2Mutation !== undefined) {
				cell.u2Mutation.forEach(mut => {
					$cell.title += " - " + u2Mutations.getName([mut]);
					$cell.classList.add(mut);
				});
			}
		}
	}

	M["fightinfo"].Update = Update;
})(MODULES);