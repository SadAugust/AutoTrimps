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
				if (challengeActive('Berserk')) game.challenges.Berserk.trimpDied();
			} else {
				handleExitSpireBtn();
			}
		} else {
			handleExitSpireBtn();
		}

		if (spireNum === 1) {
			const uStart = game.global.universe === 2 ? 300 : 200;
			const showTooltip = getHighestLevelCleared() <= uStart + 19;

			if (game.options.menu.bigPopups.enabled || showTooltip) {
				cancelTooltip();
				const uSpire = game.global.universe === 2 ? "Stuffy's Spire" : 'The Spire';
				tooltip(uSpire, null, 'update');
			}
		}

		return;
	}

	cancelTooltip();
}

function autoTrap() {
	const buildingsPerSecond = bwRewardUnlocked('DecaBuild') ? 10 : bwRewardUnlocked('DoubleBuild') ? 2 : 1;
	const trapsCanAfford = Math.min(Math.floor(game.resources.food.owned / 10), Math.floor(game.resources.wood.owned / 10));
	const trapsToBuy = Math.min(trapsCanAfford, buildingsPerSecond);

	if (trapsToBuy > 0 && game.resources.food.owned >= 10 * trapsToBuy && game.resources.wood.owned >= 10 * trapsToBuy) {
		game.resources.food.owned -= 10 * trapsToBuy;
		game.resources.wood.owned -= 10 * trapsToBuy;
		game.buildings.Trap.purchased += trapsToBuy;

		const trapPurchase = game.global.buildingsQueue[0] && game.global.buildingsQueue[0].split('.');
		if (trapPurchase && trapPurchase[0] === `Trap` && Number(trapPurchase[1]) <= buildingsPerSecond) {
			setNewCraftItem();
			return;
		}
		startQueue('Trap', trapsToBuy);
	}
}
