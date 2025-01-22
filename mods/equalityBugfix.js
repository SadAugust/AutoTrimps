function fight(makeUp) {
	fightLoops++;
	const currentMapObj = game.global.mapsActive ? getCurrentMapObject() : undefined;
	let cellNum;
	let cell;
	let cellElem;
	let isVoid = false;
	game.global.passive = false;

	if (game.global.mapsActive) {
		cellNum = game.global.lastClearedMapCell + 1;
		cell = game.global.mapGridArray[cellNum];
		cellElem = document.getElementById('mapCell' + cellNum);
		if (currentMapObj.location === 'Void') isVoid = true;
	} else {
		cellNum = game.global.lastClearedCell + 1;
		cell = game.global.gridArray[cellNum];
		cellElem = document.getElementById('cell' + cellNum);
	}

	if (game.global.soldierHealth <= 0) {
		if (isVoid) game.global.voidDeaths++;
		game.stats.trimpsKilled.value += game.resources.trimps.soldiers;
		game.stats.battlesLost.value++;
		if (challengeActive('Daily')) {
			if (typeof game.global.dailyChallenge.bloodthirst !== 'undefined') {
				game.global.dailyChallenge.bloodthirst.stacks++;
				const maxStacks = dailyModifiers.bloodthirst.getMaxStacks(game.global.dailyChallenge.bloodthirst.strength);
				if (game.global.dailyChallenge.bloodthirst.stacks > maxStacks) {
					game.global.dailyChallenge.bloodthirst.stacks = maxStacks;
				} else if (game.global.dailyChallenge.bloodthirst.stacks % dailyModifiers.bloodthirst.getFreq(game.global.dailyChallenge.bloodthirst.strength) === 0) {
					cell.health = cell.maxHealth;
				}
				updateDailyStacks('bloodthirst');
			}

			if (!game.global.passive && typeof game.global.dailyChallenge.empower !== 'undefined') {
				if (!game.global.mapsActive) {
					game.global.dailyChallenge.empower.stacks += dailyModifiers.empower.stacksToAdd(game.global.dailyChallenge.empower.strength);
					const maxStack = dailyModifiers.empower.getMaxStacks(game.global.dailyChallenge.empower.strength);
					if (game.global.dailyChallenge.empower.stacks >= maxStack) game.global.dailyChallenge.empower.stacks = maxStack;
				}
				updateDailyStacks('empower');
			}
		}

		let s = game.resources.trimps.soldiers > 1 ? 's ' : ' ';
		const randomText = game.trimpDeathTexts[Math.floor(Math.random() * game.trimpDeathTexts.length)];
		let msgText = `${prettify(game.resources.trimps.soldiers)} Trimp${s} just ${randomText}.`;
		if (usingScreenReader) msgText = `Cell ${cellNum}: ${msgText}`;
		message(msgText, 'Combat', null, null, 'trimp');
		if (game.global.spireActive && !game.global.mapsActive) deadInSpire();
		game.global.fighting = false;
		game.resources.trimps.soldiers = 0;

		if (challengeActive('Nom')) {
			cell.nomStacks = cell.nomStacks ? cell.nomStacks + 1 : 1;
			if (cell.nomStacks > 100) cell.nomStacks = 100;
			updateNomStacks(cell.nomStacks);
			if (cell.health > 0) cell.health += cell.maxHealth * 0.05;
			else cell.health = 0;
			if (cell.health > cell.maxHealth) cell.health = cell.maxHealth;
			updateBadBar(cell);
		}

		return;
	}

	if (cell.health <= 0 || !isFinite(cell.health)) {
		game.stats.battlesWon.value++;

		if (!game.global.mapsActive) {
			game.global.voidSeed++;
			game.global.scrySeed++;
		}

		if ((game.global.formation === 4 || game.global.formation === 5) && !game.global.mapsActive && !game.global.waitToScry) tryScry();
		if (game.jobs.Worshipper.owned > 0 && !game.global.mapsActive) tryWorship();
		if (challengeActive('Nom') && cell.nomStacks === 100) giveSingleAchieve('Great Host');
		if (challengeActive('Obliterated')) giveSingleAchieve('Obliterate');
		if (challengeActive('Eradicated')) giveSingleAchieve('Eradicate');
		if (game.global.usingShriek) disableShriek();
		if (game.global.universe === 2) u2Mutations.types.Rage.clearStacks();

		// Death message.
		const randomText = game.badGuyDeathTexts[Math.floor(Math.random() * game.badGuyDeathTexts.length)];
		let displayName = cell.name;
		if (typeof game.badGuys[cell.name].displayName !== 'undefined') displayName = game.badGuys[cell.name].displayName;
		let firstChar = displayName.charAt(0);
		const vowels = new Set(['A', 'E', 'I', 'O', 'U']);
		let aAn = vowels.has(firstChar) ? ' an ' : ' a ';
		let killedText = `You ${randomText}${aAn}${displayName}${challengeActive('Coordinate') ? ' group' : ''}!`;
		if (usingScreenReader) killedText = `Cell ${cellNum}: ${killedText}`;
		if (!game.global.spireActive || cellNum !== 99 || game.global.mapsActive) message(killedText, 'Combat', null, null, 'enemy');
		try {
			if (typeof kongregate !== 'undefined' && !game.global.mapsActive) kongregate.stats.submit('HighestLevel', game.global.world * 100 + cell.level);
		} catch (err) {
			console.debug(err);
		}
		if (usingRealTimeOffline) offlineProgress.lastEnemyKilled = offlineProgress.ticksProcessed;

		// Challenge shenanigans.
		if (challengeActive('Lead') && cell.name !== 'Liquimp') manageLeadStacks(!game.global.mapsActive);
		if ((challengeActive('Balance') || challengeActive('Unbalance')) && game.global.world >= 6) {
			const chal = challengeActive('Balance') ? game.challenges.Balance : game.challenges.Unbalance;
			if (game.global.mapsActive) chal.removeStack();
			else chal.addStack();
			updateBalanceStacks();
		}
		if (challengeActive('Smithless') && cell.ubersmith && !cell.failedUber) {
			game.challenges.Smithless.addStacks(3);
		}
		if (challengeActive('Daily')) {
			if (typeof game.global.dailyChallenge.karma !== 'undefined') {
				game.global.dailyChallenge.karma.stacks++;
				const maxStack = dailyModifiers.karma.getMaxStacks(game.global.dailyChallenge.karma.strength);
				if (game.global.dailyChallenge.karma.stacks >= maxStack) game.global.dailyChallenge.karma.stacks = maxStack;
				updateDailyStacks('karma');
			}
			if (typeof game.global.dailyChallenge.toxic !== 'undefined') {
				game.global.dailyChallenge.toxic.stacks++;
				const maxStack = dailyModifiers.toxic.getMaxStacks(game.global.dailyChallenge.toxic.strength);
				if (game.global.dailyChallenge.toxic.stacks >= maxStack) game.global.dailyChallenge.toxic.stacks = maxStack;
				updateDailyStacks('toxic');
			}
			if (typeof game.global.dailyChallenge.rampage !== 'undefined') {
				game.global.dailyChallenge.rampage.stacks++;
				const maxStack = dailyModifiers.rampage.getMaxStacks(game.global.dailyChallenge.rampage.strength);
				if (game.global.dailyChallenge.rampage.stacks >= maxStack) game.global.dailyChallenge.rampage.stacks = maxStack;
				updateDailyStacks('rampage');
			}
			if (typeof game.global.dailyChallenge.bloodthirst !== 'undefined') {
				game.global.dailyChallenge.bloodthirst.stacks = 0;
				updateDailyStacks('bloodthirst');
			}
		}
		if (challengeActive('Wither')) {
			game.challenges.Wither.addStacks();
		}
		// All inclusive challenge shenanigans.
		if (game.global.challengeActive && game.challenges[game.global.challengeActive].onEnemyKilled) game.challenges[game.global.challengeActive].onEnemyKilled();
		if (game.global.mapsActive && game.global.challengeActive && game.challenges[game.global.challengeActive].onMapEnemyKilled) game.challenges[game.global.challengeActive].onMapEnemyKilled(currentMapObj.level);
		// Html stuff.
		if (cell.overkilled && game.options.menu.overkillColor.enabled) {
			if (game.options.menu.overkillColor.enabled === 2) {
				const prevCellElem = document.getElementById((game.global.mapsActive ? 'mapCell' : 'cell') + (cellNum - 1));
				if (prevCellElem) swapClass('cellColor', 'cellColorOverkill', prevCellElem);
			}
			swapClass('cellColor', 'cellColorOverkill', cellElem);
		} else {
			swapClass('cellColor', 'cellColorBeaten', cellElem);
		}

		if (game.global.mapsActive) game.global.lastClearedMapCell = cellNum;
		else game.global.lastClearedCell = cellNum;

		game.global.fighting = false;
		document.getElementById('badGuyCol').style.visibility = 'hidden';
		// Loot!
		if (cell.empowerment) {
			rewardToken(cell.empowerment);
		}
		let unlock;
		if (game.global.mapsActive) {
			unlock = game.mapUnlocks[cell.special];
		} else {
			checkVoidMap();
			unlock = game.worldUnlocks[cell.special];
		}
		let noMessage = false;
		if (typeof unlock !== 'undefined' && typeof unlock.fire !== 'undefined') {
			unlock.fire(cell.level);
			if (game.global.mapsActive) {
				if (typeof game.mapUnlocks[cell.special].last !== 'undefined') {
					game.mapUnlocks[cell.special].last += 5;
					if (typeof game.upgrades[cell.special].prestige && getSLevel() >= 4 && !challengeActive('Mapology') && Math.ceil(game.mapUnlocks[cell.special].last / 5) % 2 === 1) {
						unlock.fire(cell.level);
						game.mapUnlocks[cell.special].last += 5;
						message(unlock.message.replace('a book', 'two books'), 'Unlocks', null, null, 'repeated', cell.text);
						noMessage = true;
					}
				}
				if (typeof game.mapUnlocks[cell.special].canRunOnce !== 'undefined') game.mapUnlocks[cell.special].canRunOnce = false;
				if (unlock.filterUpgrade) refreshMaps();
			}
		} else if (cell.special !== '') {
			unlockEquipment(cell.special);
		}
		if (cell.mutation && typeof mutations[cell.mutation].reward !== 'undefined') mutations[cell.mutation].reward(cell.corrupted);
		let doNextVoid = false;
		if (typeof unlock !== 'undefined' && typeof unlock.message !== 'undefined' && !noMessage) message(unlock.message, 'Unlocks', null, null, unlock.world > 0 ? 'unique' : 'repeated', cell.text);
		if (typeof game.badGuys[cell.name].loot !== 'undefined') game.badGuys[cell.name].loot(cell.level);
		if (!game.global.mapsActive && game.global.spireActive && checkIfSpireWorld()) {
			giveSpireReward(cell.level);
		}
		if (cell.u2Mutation && cell.u2Mutation.length) u2Mutations.rewardMutation(cell);
		// Post loot.
		resetEmpowerStacks();

		// Map and World split here for non-loot stuff, anything for both goes above.
		// Map only.
		if (game.global.mapsActive && cellNum === game.global.mapGridArray.length - 1) {
			// ayy you beat a map.
			if (usingRealTimeOffline && offlineProgress.countThisMap) {
				offlineProgress.mapsAllowed--;
				offlineProgress.countThisMap = false;
			}
			game.stats.mapsCleared.value++;
			checkAchieve('totalMaps');
			alchObj.mapCleared(currentMapObj);
			let shouldRepeat = game.global.repeatMap;
			let nextBw = false;
			let mazBw = -1;
			game.global.mapRunCounter++;
			if (game.options.menu.repeatUntil.enabled === 0 && game.global.mapCounterGoal > 0) toggleSetting('repeatUntil', null, false, true);
			if (game.global.challengeActive && game.challenges[game.global.challengeActive].clearedMap) game.challenges[game.global.challengeActive].clearedMap(currentMapObj.level);
			let mapBonusEarned = 0;
			if (currentMapObj.level >= game.global.world - getPerkLevel('Siphonology') && game.global.mapBonus < 10) mapBonusEarned = 1;
			game.global.mapBonus += mapBonusEarned;
			if (challengeActive('Quest') && game.challenges.Quest.questId === 2) {
				game.challenges.Quest.questProgress += mapBonusEarned;
				game.challenges.Quest.checkQuest();
			}
			const mapBonusReached = game.global.mapBonus === 10;
			const allItemsEarned = addSpecials(true, true, currentMapObj) === 0;

			if (currentMapObj.name.search('Bionic Wonderland') > -1 && allItemsEarned && game.options.menu.climbBw.enabled === 1 && game.global.repeatMap) {
				if (game.global.mazBw > 0 && game.global.mazBw <= currentMapObj.level) {
					nextBw = false;
				} else {
					nextBw = getNextBwId();
					mazBw = game.global.mazBw;
				}
			}

			if (game.options.menu.repeatUntil.enabled === 0 && game.global.mapCounterGoal > 0 && game.global.mapRunCounter >= game.global.mapCounterGoal) shouldRepeat = false;
			else if (game.options.menu.repeatUntil.enabled === 1 && mapBonusReached) shouldRepeat = false;
			else if (game.options.menu.repeatUntil.enabled === 2 && allItemsEarned) shouldRepeat = false;
			else if (game.options.menu.repeatUntil.enabled === 3 && allItemsEarned && (mapBonusReached || mapBonusEarned === 0)) shouldRepeat = false;

			if (currentMapObj.bonus && mapSpecialModifierConfig[currentMapObj.bonus].onCompletion) {
				mapSpecialModifierConfig[currentMapObj.bonus].onCompletion();
			}

			let skip = false;
			if (isVoid) {
				if (currentMapObj.stacked > 0) {
					let timeout = 750;
					if (currentMapObj.stacked > 3) timeout = 300;
					if (currentMapObj.stacked > 6) timeout = 100;
					if (usingRealTimeOffline || !game.options.menu.voidPopups.enabled) timeout = 10;
					rewardingTimeoutHeirlooms = true;

					for (let x = 0; x < currentMapObj.stacked; x++) {
						setTimeout(
							(function (z) {
								return function () {
									if (rewardingTimeoutHeirlooms) createHeirloom(z);
								};
							})(game.global.world),
							timeout * (x + 1)
						);
					}

					game.badGuys.Cthulimp.loot(99, true, currentMapObj.stacked);
				}
				currentMapObj.noRecycle = false;
				recycleMap(-1, true, true);
				if (game.options.menu.repeatVoids.enabled === 1) {
					if (game.global.totalVoidMaps > 0) doNextVoid = getNextVoidId();
				}
				skip = true;
			}
			if (!game.global.runningChallengeSquared && game.global.challengeActive && game.challenges[game.global.challengeActive].completeAfterMap) {
				const challenge = game.challenges[game.global.challengeActive];
				if (currentMapObj.name === challenge.completeAfterMap && typeof challenge.onComplete !== 'undefined') {
					challenge.onComplete();
				}
			}
			if (challengeActive('Insanity')) {
				game.challenges.Insanity.completeMap(currentMapObj.level);
			}
			if (currentMapObj.location !== 'Frozen' && !nextBw && shouldRepeat && !game.global.switchToMaps && !skip && (!challengeActive('Mapology') || game.challenges.Mapology.credits >= 1)) {
				if (game.global.mapBonus > 0) {
					let innerText = game.global.mapBonus;
					if (game.talents.mapBattery.purchased && game.global.mapBonus === 10) innerText = "<span class='mapBonus10'>" + innerText + '</span>';
					const mapBtnElem = document.getElementById('mapsBtnText');
					const mapBtnText = `Maps (${innerText})`;
					if (mapBtnElem.innerHTML !== mapBtnText && !usingRealTimeOffline) mapBtnElem.innerHTML = mapBtnText;
				}
				game.global.lastClearedMapCell = -1;
				buildMapGrid(game.global.currentMapId);
				drawGrid(true);
				if (challengeActive('Mapology')) {
					game.challenges.Mapology.credits--;
					if (game.challenges.Mapology.credits <= 0) game.challenges.Mapology.credits = 0;
					updateMapCredits();
					messageMapCredits();
				}
				battle(true);
				return;
			} else {
				if (game.global.switchToMaps) {
					game.global.soldierHealth = 0;
					game.resources.trimps.soldiers = 0;
					updateGoodBar();
				}

				game.global.preMapsActive = game.options.menu.exitTo.enabled && !nextBw ? false : true;
				game.global.mapsActive = false;
				game.global.lastClearedMapCell = -1;
				game.global.currentMapId = '';
				game.global.mapGridArray = [];
				game.global.fighting = false;
				game.global.switchToMaps = false;
				game.global.mapExtraBonus = '';
				mapsSwitch(true);

				if (nextBw) {
					game.global.lookingAtMap = nextBw;
					runMap();
					game.global.mazBw = mazBw;
				} else if (doNextVoid) {
					game.global.lookingAtMap = doNextVoid;
					runMap();
				} else if (isVoid && game.global.preMapsActive && game.global.totalVoidMaps > 0) {
					toggleVoidMaps();
				} else if (currentMapObj.location === 'Frozen') {
					document.getElementById('mapsHere').removeChild(document.getElementById(currentMapObj.id));
					game.global.mapsOwnedArray.splice(getMapIndex(currentMapObj.id), 1);
					game.global.lookingAtMap = '';
					mapsSwitch(true);
				} else {
					checkMapAtZoneWorld(true);
				}

				return;
			}
		}
		if (!game.global.mapsActive && cellNum === 99) {
			// World only.
			nextWorld();
		}
		let startMaZ = false;
		if (!game.global.mapsActive) startMaZ = checkMapAtZoneWorld(true);
		if (!startMaZ && game.global.soldierHealth > 0) battle(true);
		return;
	}

	const empowerment = getEmpowerment();
	const empowermentUber = getUberEmpowerment();

	let cellAttack = calculateDamage(cell.attack, false, false, false, cell);
	const badAttackElem = document.getElementById('badGuyAttack');
	const badAttackText = calculateDamage(cell.attack, true, false, false, cell);
	if (badAttackElem.innerHTML != badAttackText && !usingRealTimeOffline) badAttackElem.innerHTML = badAttackText;
	let badCrit = false;

	if (challengeActive('Crushed')) {
		if (checkCrushedCrit()) {
			cellAttack *= 5;
			badCrit = true;
			if (game.global.world > 5) game.challenges.Crushed.critsTaken++;
		}
	}

	if (challengeActive('Duel')) {
		const critChance = game.challenges.Duel.trimpStacks;
		const roll = Math.floor(Math.random() * 100);
		if (roll < critChance) {
			cellAttack *= 10;
			badCrit = true;
		}
	}

	if (game.global.voidBuff === 'getCrit' || cell.corrupted === 'corruptCrit' || cell.corrupted === 'healthyCrit') {
		if (Math.floor(Math.random() * 4) === 0) {
			cellAttack *= cell.corrupted === 'healthyCrit' ? 7 : 5;
			badCrit = true;
		}
	}

	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.crits !== 'undefined') {
			if (Math.floor(Math.random() * 4) === 0) {
				cellAttack *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength);
				badCrit = true;
			}
		}
	}

	let attackAndBlock = cellAttack - game.global.soldierCurrentBlock;
	let pierce = 0;

	if (game.global.brokenPlanet && !game.global.mapsActive) {
		pierce = getPierceAmt();
		const atkPierce = pierce * cellAttack;
		if (attackAndBlock < atkPierce) attackAndBlock = atkPierce;
	}

	if (attackAndBlock < 0) attackAndBlock = 0;
	if (getPerkLevel('Frenzy') > 0) game.portal.Frenzy.beforeAttack();

	let trimpAttack = calculateDamage(game.global.soldierCurrentAttack, false, true);
	const goodAttackElem = document.getElementById('goodGuyAttack');
	const goodAttackText = calculateDamage(game.global.soldierCurrentAttack, true, true);
	if (goodAttackElem.innerHTML != goodAttackText && !usingRealTimeOffline) goodAttackElem.innerHTML = goodAttackText;

	updateTitimp();
	let critTier = 0;
	let critChance = getPlayerCritChance();
	let doubleCritChance = getPlayerDoubleCritChance();

	if (critChance > 0) {
		critTier = Math.floor(critChance);
		critChance = critChance % 1;
		if (Math.random() < critChance) {
			critTier++;
		}

		if (doubleCritChance > 0 && Math.random() < doubleCritChance) {
			critTier++;
		}

		if (critTier > 0) {
			trimpAttack *= getPlayerCritDamageMult();
			if (critTier > 1) trimpAttack *= getMegaCritDamageMult(critTier);
		}
	}

	if (critChance < 0) {
		if (Math.random() < Math.abs(critChance)) {
			critTier = -1;
			trimpAttack *= 0.2;
		}
	}

	let attacked = false;
	let wasAttacked = false;
	let badDodge = false;

	if (cell.corrupted === 'corruptDodge') {
		if (Math.random() < 0.3) badDodge = true;
	}

	if (challengeActive('Daily') && typeof game.global.dailyChallenge.slippery !== 'undefined') {
		const slipStr = game.global.dailyChallenge.slippery.strength;
		if ((slipStr > 15 && game.global.world % 2 === 0) || (slipStr <= 15 && game.global.world % 2 === 1)) {
			if (Math.random() < dailyModifiers.slippery.getMult(slipStr)) badDodge = true;
		}
	}

	let overkill = 0;
	let plaguebringer = 0;
	let impOverkill = 0;
	const trimpsWereFull = game.global.soldierHealth === game.global.soldierHealthMax;
	const enemyWasFull = cell.health === cell.maxHealth;
	const getPlayerModifier = getPlaguebringerModifier();

	const thisKillsTheTrimp = function () {
		impOverkill -= game.global.soldierHealth;
		game.global.soldierHealth = 0;
		if (challengeActive('Mayhem')) {
			game.challenges.Mayhem.poison = 0;
			game.challenges.Mayhem.drawStacks();
		}
		if (challengeActive('Storm') && !game.global.mapsActive) {
			game.challenges.Storm.alpha = 0;
		}
	};

	const thisKillsTheBadGuy = function () {
		cell.health = 0;
	};

	// Angelic heal.
	const spireNo = Math.floor((game.global.world - (game.global.universe === 2 ? 200 : 100)) / 100);
	const spireClearedU1 = spireNo <= game.global.spiresCompleted;
	const spireClearedU2 = spireNo <= game.global.u2SpireCellsBest / 1000;
	const spireAngelic = game.universe === 2 ? spireClearedU2 : spireClearedU1; // Angelic works in U2 Spires. Unsure if intentional but Angelic tooltip says it should be disabled. Use this in the if statement below to fix.
	if (game.talents.angelic.purchased && !challengeActive('Berserk') && (!game.global.spireActive || game.global.mapsActive || Math.floor((game.global.world - 100) / 100) <= game.global.spiresCompleted)) {
		game.global.soldierHealth += game.global.soldierHealth / 2;
		if (game.global.soldierHealth > game.global.soldierHealthMax) game.global.soldierHealth = game.global.soldierHealthMax;
	}

	if (challengeActive('Wither')) {
		if (game.challenges.Wither.healImmunity <= 0 && !enemyWasFull) {
			const heal = Math.floor(cell.maxHealth / 4);
			cell.health += heal;
			if (cell.health >= cell.maxHealth) {
				game.global.soldierHealth = 0;
				game.challenges.Wither.witherTrimps();
				cell.health = cell.maxHealth;
			}
		}
	}

	if (game.global.world >= getObsidianStart() && !game.global.mapsActive) {
		game.global.soldierHealth = 0;
	}

	let forceSlow = false;
	let checkFast = challengeActive('Glass') || challengeActive('Slow') || ((((game.badGuys[cell.name].fast || cell.mutation === 'Corruption') && !challengeActive('Nom')) || game.global.voidBuff === 'doubleAttack') && !challengeActive('Coordinate'));
	if (game.global.soldierHealth <= 0) checkFast = false;
	if (checkFast && challengeActive('Exterminate') && game.challenges.Exterminate.experienced) checkFast = false;

	if (challengeActive('Duel')) {
		if (game.challenges.Duel.enemyStacks < 10) checkFast = true;
		else if (game.challenges.Duel.trimpStacks < 10 && !game.global.runningChallengeSquared) forceSlow = true;
	}
	if (challengeActive('Smithless') && cell.ubersmith && !cell.failedUber) checkFast = true;
	if (cell.u2Mutation && cell.u2Mutation.length) checkFast = true;

	if (trimpAttack > 0 && checkFast && !forceSlow) {
		// Fighting a fast enemy, Trimps attack last.
		reduceSoldierHealth(attackAndBlock, true);
		wasAttacked = true;
		if (game.global.soldierHealth > 0) {
			if (!badDodge) {
				if (empowerment === 'Poison') {
					cell.health -= game.empowerments.Poison.getDamage();
					stackPoison(trimpAttack);
				}

				if (trimpAttack >= cell.health) {
					overkill = trimpAttack - cell.health;
					if (cell.name === 'Improbability' && enemyWasFull) giveSingleAchieve('One-Hit Wonder');
					if (enemyWasFull && challengeActive('Unlucky') && game.global.mapsActive && currentMapObj.name === 'Dimension of Rage') {
						if (!game.challenges.Unlucky.lastHitLucky) giveSingleAchieve("Don't Need Luck");
					}
					if (!game.global.mapsActive && enemyWasFull && challengeActive('Quest') && game.challenges.Quest.questId === 3) game.challenges.Quest.questProgress++;
				} else if (getPlayerModifier > 0) {
					plaguebringer = trimpAttack * getPlayerModifier;
				}

				if (challengeActive('Glass') && trimpAttack < cell.health) game.challenges.Glass.notOneShot();
				cell.health -= trimpAttack;
				attacked = true;

				if ((game.global.voidBuff === 'doubleAttack' || cell.corrupted === 'corruptDbl' || cell.corrupted === 'healthyDbl') && cell.health > 0) {
					reduceSoldierHealth(cell.corrupted === 'healthyDbl' ? attackAndBlock * 1.5 : attackAndBlock, true);
					if (game.global.soldierHealth < 0) thisKillsTheTrimp();
				}
			}
		} else {
			thisKillsTheTrimp();
		}

		if (cell.health < 1 && game.global.formation === 5 && empowerment === 'Wind' && empowermentUber === 'Wind' && game.empowerments.Wind.currentDebuffPower < game.empowerments.Wind.stackMax()) {
			cell.health = 1;
		}

		if (cell.health <= 0) {
			thisKillsTheBadGuy();
		}
	} else {
		if (game.global.soldierHealth > 0) {
			// Fighting a slow enemy, Trimps attack first.
			if (!badDodge) {
				if (empowerment === 'Poison') {
					cell.health -= game.empowerments.Poison.getDamage();
					stackPoison(trimpAttack);
				}
				if (trimpAttack >= cell.health) {
					overkill = trimpAttack - cell.health;
					if (cell.name === 'Improbability' && enemyWasFull) giveSingleAchieve('One-Hit Wonder');
					if (enemyWasFull && challengeActive('Unlucky') && game.global.mapsActive && currentMapObj.name === 'Dimension of Rage') {
						if (!game.challenges.Unlucky.lastHitLucky) giveSingleAchieve("Don't Need Luck");
					}
					if (!game.global.mapsActive && enemyWasFull && challengeActive('Quest') && game.challenges.Quest.questId === 3) game.challenges.Quest.questProgress++;
				} else if (getPlayerModifier > 0) {
					plaguebringer = trimpAttack * getPlayerModifier;
				}
				cell.health -= trimpAttack;
				attacked = true;
			}

			if (cell.health < 1 && game.global.formation === 5 && empowerment === 'Wind' && empowermentUber === 'Wind' && game.empowerments.Wind.currentDebuffPower < game.empowerments.Wind.stackMax()) {
				cell.health = 1;
			}

			if (cell.health > 0) {
				reduceSoldierHealth(attackAndBlock, true);
				wasAttacked = true;
			} else {
				thisKillsTheBadGuy();
			}

			if (game.global.soldierHealth < 0) thisKillsTheTrimp();
		}
	}

	// After attack stuff.
	if (wasAttacked && !game.global.mapsActive && cellNum === 99 && game.global.challengeActive && game.challenges[game.global.challengeActive].onBossAttack) game.challenges[game.global.challengeActive].onBossAttack();

	if (challengeActive('Mayhem') && attacked) {
		game.global.soldierHealth -= game.challenges.Mayhem.poison;
		if (game.global.soldierHealth < 0) thisKillsTheTrimp();
	}

	if (game.global.soldierHealth > 0 && getHeirloomBonus('Shield', 'gammaBurst') > 0) {
		let burst = game.heirlooms.Shield.gammaBurst;
		burst.stacks++;
		let triggerStacks = autoBattle.oneTimers.Burstier.owned ? 4 : 5;
		if (Fluffy.isRewardActive('scruffBurst')) triggerStacks--;
		if (burst.stacks >= triggerStacks) {
			burst.stacks = triggerStacks;
			if (cell.health > 0) {
				let burstDamage = calcHeirloomBonus('Shield', 'gammaBurst', trimpAttack);
				if (challengeActive('Storm') && game.challenges.Storm.mutations > 0) burstDamage *= game.challenges.Storm.getGammaMult();
				cell.health -= burstDamage;
				burst.stacks = 0;
				if (cell.health > 0 && getPlayerModifier > 0) {
					plaguebringer += burstDamage * getPlayerModifier;
				}

				if (game.global.formation === 5 && empowerment === 'Wind' && empowermentUber === 'Wind' && cell.health < 1) {
					cell.health = 1;
				} else if (cell.health <= 0) {
					overkill = Math.abs(cell.health);
					thisKillsTheBadGuy();
				}

				if (empowerment === 'Poison') stackPoison(burstDamage);
			}
		}
		updateGammaStacks();
	}

	if (game.global.formation === 5 && empowerment === 'Wind' && empowermentUber === 'Wind') {
		overkill = 0;
		if (plaguebringer === 0) plaguebringer = 1;
	}

	if (cell.health / cell.maxHealth < 0.5 && empowerment === 'Ice' && empowermentUber === 'Ice' && game.empowerments.Ice.currentDebuffPower > 20) {
		cell.health = 0;
		thisKillsTheBadGuy();
		overkill = 'shatter';
	}

	if (challengeActive('Daily')) {
		if (typeof game.global.dailyChallenge.mirrored !== 'undefined' && attacked && game.global.soldierHealth > 0) {
			reduceSoldierHealth(dailyModifiers.mirrored.reflectDamage(game.global.dailyChallenge.mirrored.strength, Math.min(cell.maxHealth, trimpAttack)));
			if (game.global.soldierHealth <= 0) thisKillsTheTrimp();
		}
		if (typeof game.global.dailyChallenge.plague !== 'undefined') {
			if (attacked) {
				game.global.soldierHealth -= game.global.soldierHealthMax * dailyModifiers.plague.getMult(game.global.dailyChallenge.plague.strength, game.global.dailyChallenge.plague.stacks);
				if (game.global.soldierHealth < 0) thisKillsTheTrimp();
			}
			if (wasAttacked) {
				game.global.dailyChallenge.plague.stacks++;
				updateDailyStacks('plague');
			}
		}
		if (typeof game.global.dailyChallenge.bogged !== 'undefined') {
			if (attacked) {
				game.global.soldierHealth -= game.global.soldierHealthMax * dailyModifiers.bogged.getMult(game.global.dailyChallenge.bogged.strength);
				if (game.global.soldierHealth < 0) thisKillsTheTrimp();
			}
		}
		if (typeof game.global.dailyChallenge.weakness !== 'undefined') {
			if (wasAttacked) {
				game.global.dailyChallenge.weakness.stacks++;
				if (game.global.dailyChallenge.weakness.stacks >= 9) game.global.dailyChallenge.weakness.stacks = 9;
				updateDailyStacks('weakness');
			}
		}
	}

	if (game.global.universe === 1) {
		if ((challengeActive('Electricity') || challengeActive('Mapocalypse')) && attacked) {
			game.global.soldierHealth -= game.global.soldierHealthMax * (game.challenges.Electricity.stacks * 0.1);
			if (game.global.soldierHealth < 0) thisKillsTheTrimp();
			if (challengeActive('Electricity')) {
				game.challenges.Electricity.attacksInARow++;
				if (game.challenges.Electricity.attacksInARow >= 20) giveSingleAchieve('Grounded');
			}
		}

		if ((challengeActive('Electricity') || challengeActive('Mapocalypse')) && wasAttacked) {
			game.challenges.Electricity.stacks++;
			updateElectricityStacks();
		}

		if (challengeActive('Domination')) {
			let dominating = false;
			if (game.global.mapsActive && currentMapObj.size === cellNum + 1) dominating = true;
			else if (!game.global.mapsActive && cellNum === 99) dominating = true;

			if (cell.health > 0 && dominating) {
				if (cell.health / cell.maxHealth < 0.95) cell.health += cell.maxHealth * 0.05;
				if (cell.health > cell.maxHealth) cell.health = cell.maxHealth;
			}
		}

		if (challengeActive('Toxicity') && attacked) {
			let tox = game.challenges.Toxicity;
			tox.stacks++;
			if (tox.stacks > tox.maxStacks) tox.stacks = tox.maxStacks;
			if (tox.stacks > tox.highestStacks) tox.highestStacks = tox.stacks;
			updateToxicityStacks();
		}

		if (!game.global.mapsActive && challengeActive('Life') && attacked) {
			let life = game.challenges.Life;
			const oldStacks = life.stacks;
			if (cell.mutation === 'Living') life.stacks -= 5;
			else life.stacks++;
			if (life.stacks > life.maxStacks) life.stacks = life.maxStacks;
			if (life.stacks < 0) life.stacks = 0;
			if (life.stacks !== oldStacks) {
				game.global.soldierHealthMax = (game.global.soldierHealthMax / (1 + oldStacks / 10)) * (1 + life.stacks / 10);
				game.global.soldierHealth = (game.global.soldierHealth / (1 + oldStacks / 10)) * (1 + life.stacks / 10);
				if (game.global.soldierHealthMax < game.global.soldierHealth) {
					game.global.soldierHealth = game.global.soldierHealthMax;
				}
				if (game.global.soldierHealth < 0) thisKillsTheTrimp();
				updateAllBattleNumbers();
			}
			updateLivingStacks();
		}

		if ((challengeActive('Nom') || challengeActive('Toxicity')) && attacked) {
			game.global.soldierHealth -= game.global.soldierHealthMax * 0.05;
			if (game.global.soldierHealth < 0) thisKillsTheTrimp();
		}

		if (challengeActive('Lead') && attacked && cell.health > 0) {
			game.global.soldierHealth -= game.global.soldierHealthMax * Math.min(game.challenges.Lead.stacks, 200) * 0.0003;
			if (game.global.soldierHealth < 0) thisKillsTheTrimp();
		}

		if (empowerment === 'Ice' && attacked) {
			let addStacks = 1;
			if (empowermentUber === 'Ice') addStacks *= 2;
			if (Fluffy.isRewardActive('plaguebrought')) addStacks *= 2;
			game.empowerments.Ice.currentDebuffPower += addStacks;
			handleIceDebuff();
		}

		if (empowerment === 'Wind' && attacked) {
			let addStacks = 1;
			if (empowermentUber === 'Wind') addStacks *= 2;
			if (Fluffy.isRewardActive('plaguebrought')) addStacks *= 2;
			game.empowerments.Wind.currentDebuffPower += addStacks;
			if (game.empowerments.Wind.currentDebuffPower > game.empowerments.Wind.stackMax()) game.empowerments.Wind.currentDebuffPower = game.empowerments.Wind.stackMax();
			handleWindDebuff();
		}
	}

	if (game.global.universe === 2) {
		if (getPerkLevel('Frenzy') > 0 && attacked && game.global.soldierHealth > 0) {
			game.portal.Frenzy.trimpAttacked();
		}

		if (challengeActive('Duel')) {
			const challenge = game.challenges.Duel;
			let trimpPoints = 0;
			let enemyPoints = 0;
			if (badCrit) enemyPoints++;
			if (critTier > 0) trimpPoints++;
			if (game.global.soldierHealth <= 0) {
				if (trimpsWereFull) enemyPoints += 5;
				else enemyPoints += 2;
			}
			if (cell.health <= 0) {
				if (enemyWasFull) trimpPoints += 5;
				else trimpPoints += 2;
			}
			challenge.enemyStacks += enemyPoints - trimpPoints;
			challenge.trimpStacks += trimpPoints - enemyPoints;
			if (challenge.enemyStacks > 100) {
				challenge.enemyStacks = 100;
				challenge.trimpStacks = 0;
			}
			if (challenge.trimpStacks > 100) {
				challenge.trimpStacks = 100;
				challenge.enemyStacks = 0;
			}
			challenge.drawStacks();
		}

		if (challengeActive('Storm') && !game.global.mapsActive) {
			if (game.global.soldierHealth > 0) {
				game.challenges.Storm.alpha++;
				game.global.soldierHealth -= game.global.soldierHealthMax * (game.challenges.Storm.alpha * game.challenges.Storm.alphaLoss);
				if (game.global.soldierHealth < 0) thisKillsTheTrimp();
			}
			if (cell.health > 0) {
				game.challenges.Storm.enemyAttacked(cell);
			}
			game.challenges.Storm.drawStacks();
		}

		if (challengeActive('Berserk') && attacked) {
			game.challenges.Berserk.attacked();
		}

		if (challengeActive('Glass') && attacked && game.global.soldierHealth > 0) {
			game.challenges.Glass.checkReflect(cell, trimpAttack);
			if (game.global.soldierHealth <= 0) thisKillsTheTrimp();
		}

		if (challengeActive('Smithless') && cell.ubersmith) {
			game.challenges.Smithless.attackedUber();
		}

		if (challengeActive('Desolation')) {
			if (wasAttacked && !game.global.mapsActive) {
				game.challenges.Desolation.addChilledStacks(1);
				game.challenges.Desolation.drawStacks();
			}
			if (attacked && game.global.mapsActive) {
				game.challenges.Desolation.mapAttacked(currentMapObj.level);
			}
		}

		if (game.global.universe === 2 && attacked && cell.u2Mutation && cell.u2Mutation.length) {
			if (u2Mutations.types.Nova.hasNova(cell)) u2Mutations.types.Nova.attacked();
			if (u2Mutations.types.Rage.hasRage(cell)) u2Mutations.types.Rage.attacked();
			if (game.global.spireActive && u2Mutations.types.Spire1.hasMut(cell)) u2Mutations.types.Spire1.attacked(cell);
		}
	}

	if ((game.global.voidBuff === 'bleed' || cell.corrupted === 'corruptBleed' || cell.corrupted === 'healthyBleed') && wasAttacked) {
		const bleedMod = cell.corrupted === 'healthyBleed' ? 0.3 : 0.2;
		game.global.soldierHealth -= game.global.soldierHealth * bleedMod;
		if (game.global.soldierHealth < 1) thisKillsTheTrimp();
	}

	const critSpanElem = document.getElementById('critSpan');
	const critSpanText = getCritText(critTier);
	if (critSpanElem.innerHTML !== critSpanText && !usingRealTimeOffline) critSpan.innerHTML = critSpanText;

	if (critTier >= 3) redCritCounter++;
	else redCritCounter = 0;

	if (redCritCounter >= 10) giveSingleAchieve('Critical Luck');

	let badCritText;

	if (badDodge) badCritText = 'Dodge!';
	else if (badCrit && wasAttacked) badCritText = 'Crit!';
	else badCritText = '';

	const badCritElem = document.getElementById('badCrit');
	if (badCritElem.innerHTML !== badCritText && !usingRealTimeOffline) badCritElem.innerHTML = badCritText;
	if (cell.health <= 0) game.global.battleCounter = 800;

	if (!game.global.mapsActive && getPerkLevel('Hunger')) {
		game.portal.Hunger.storedDamage += overkill;
	}

	if (overkill) {
		const nextCell = game.global.mapsActive ? game.global.mapGridArray[cellNum + 1] : game.global.gridArray[cellNum + 1];
		if (nextCell && nextCell.health !== 'compressed') {
			nextCell.health = overkill;
			nextCell.OKcount = 1;
		}
	} else if (plaguebringer > 0) {
		const nextCell = game.global.mapsActive ? game.global.mapGridArray[cellNum + 1] : game.global.gridArray[cellNum + 1];
		if (nextCell) {
			if (!nextCell.plaguebringer) nextCell.plaguebringer = plaguebringer;
			else nextCell.plaguebringer += plaguebringer;
			if (!nextCell.plagueHits) nextCell.plagueHits = getPlayerModifier;
			else nextCell.plagueHits += getPlayerModifier;
		}
	}

	if (challengeActive('Devastation') && impOverkill) {
		game.challenges.Devastation.lastOverkill = impOverkill;
	}

	if (challengeActive('Revenge') && impOverkill) {
		game.challenges.Revenge.lastOverkill = impOverkill;
	}

	if (cell.health <= 0 && typeof game.global.dailyChallenge.explosive !== 'undefined') {
		if (game.global.dailyChallenge.explosive.strength <= 15 || game.global.soldierHealthMax > game.global.soldierCurrentBlock) {
			const explodeDamage = cellAttack * dailyModifiers.explosive.getMult(game.global.dailyChallenge.explosive.strength);
			let explodeAndBlock = explodeDamage - game.global.soldierCurrentBlock;
			if (explodeAndBlock < 0) explodeAndBlock = 0;
			if (pierce > 0) {
				const explodePierce = pierce * explodeDamage;
				if (explodeAndBlock < explodePierce) explodeAndBlock = explodePierce;
			}
			reduceSoldierHealth(explodeAndBlock);
			if (game.global.soldierHealth <= 0) thisKillsTheTrimp();
		}
	}

	if (game.global.universe === 2) {
		if (cell.health <= 0 && challengeActive('Storm')) {
			game.challenges.Storm.enemyDied();
		}
		if (cell.health <= 0 && challengeActive('Berserk')) {
			game.challenges.Berserk.enemyDied();
		}
		if (game.global.soldierHealth <= 0 && challengeActive('Berserk')) {
			game.challenges.Berserk.trimpDied();
		}
		if (game.global.soldierHealth <= 0 && challengeActive('Exterminate')) {
			game.challenges.Exterminate.trimpDied();
		}
		if (getPerkLevel('Frenzy') && game.global.soldierHealth <= 0) {
			game.portal.Frenzy.trimpDied();
		}
	}

	if (cell.health > 0) {
		game.global.fightAttackCount++;
	} else {
		game.global.fightAttackCount = 0;
	}

	if (game.global.soldierHealth > 0) {
		game.global.armyAttackCount++;
	} else if (game.portal.Equality.getSetting('scalingActive') && game.global.armyAttackCount <= game.portal.Equality.getSetting('scalingSetting')) {
		game.portal.Equality.scalingCount++;
		manageEqualityStacks();
	}

	if (game.global.fightAttackCount > 0 && game.portal.Equality.getSetting('scalingActive') && game.portal.Equality.getSetting('scalingReverse') && game.global.fightAttackCount % game.portal.Equality.getSetting('reversingSetting') === 0 && game.global.armyAttackCount > game.portal.Equality.getSetting('scalingSetting') && cell.health > 0) {
		game.portal.Equality.scalingCount--;
		manageEqualityStacks();
	}

	if (makeUp) return;
	updateGoodBar();
	updateBadBar(cell);
}
