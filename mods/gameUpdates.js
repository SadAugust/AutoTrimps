function startSpire(confirmed) {
	const spireNum = checkIfSpireWorld(true);

	if (!confirmed) {
		game.global.spireDeaths = 0;
		game.global.spireActive = true;

		if (game.global.universe === 2) {
			game.global.spireLevel = Math.floor(game.global.u2SpireCellsBest / 100) + 1;
			if (game.global.spireLevel > 10) game.global.spireLevel = 10;
			if (game.portal.Equality.settings.spire.scalingActive) game.portal.Equality.scalingCount = game.portal.Equality.settings.spire.disabledStackCount;
			if (game.portal.Equality.scalingCount === -1) game.portal.Equality.scalingCount = game.portal.Equality.radLevel;
			manageEqualityStacks();
		}

		setNonMapBox();
		const spireSetting = game.options.menu.mapsOnSpire.enabled;
		if (spireSetting && !checkMapAtZoneWorld()) {
			let highestSpire;
			if (game.global.universe === 1) {
				highestSpire = Math.floor((getHighestLevelCleared() - 99) / 100);
			} else {
				highestSpire = Math.min(1, Math.floor((getHighestLevelCleared() - 225) / 75));
			}

			if (spireSetting === 1 || (spireSetting === 2 && spireNum >= highestSpire - 1) || (spireSetting === 3 && spireNum >= highestSpire)) {
				game.global.fighting = false;
				mapsSwitch();
			} else {
				handleExitSpireBtn();
			}
		} else {
			handleExitSpireBtn();
		}

		if (spireNum === 1) {
			cancelTooltip();
			var uSpire = game.global.universe == 2 ? "Stuffy's Spire" : 'The Spire';
			tooltip(uSpire, null, 'update');
		}
		return;
	}
	cancelTooltip();
}
