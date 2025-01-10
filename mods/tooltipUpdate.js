function tooltip(what, isItIn, event, textString, attachFunction, numCheck, renameBtn, noHide, hideCancel, ignoreShift) {
	/* now 20% less menacing. Work in progress. */
	if (!game.options.menu.bigPopups.enabled) {
		const improbabilityCondition = what === 'The Improbability';
		const corruptionCondition = what === 'Corruption' && getHighestLevelCleared() >= 199;
		const spireCondition = what === 'The Spire' && getHighestLevelCleared() >= 219;
		const magmaCondition = what === 'The Magma' && getHighestLevelCleared() >= 249;
		const mutatedZonesCondition = what === 'The Mutated Zones' && game.global.highestRadonLevelCleared >= 220;
		if (improbabilityCondition || corruptionCondition || spireCondition || magmaCondition || mutatedZonesCondition) {
			return;
		}
	}

	checkAlert(what, isItIn);
	if (game.global.lockTooltip && event !== 'update') return;
	if (game.global.lockTooltip && isItIn && event === 'update') return;
	let elem = document.getElementById('tooltipDiv');
	swapClass('tooltipExtra', 'tooltipExtraNone', elem);
	document.getElementById('tipText').className = '';
	openTooltip = null;

	if (what === 'hide') {
		elem.style.display = 'none';
		tooltipUpdateFunction = '';
		onShift = null;
		return;
	}

	const shiftTooltip = event !== 'lock' && (event !== 'update' || isItIn) && !game.options.menu.tooltips.enabled && !shiftPressed && !['Well Fed', 'Perk Preset', 'Activate Portal'].includes(what) && !ignoreShift;
	const noUpdateScreenRead = !['update', 'screenRead'].includes(event);
	if (shiftTooltip || noUpdateScreenRead) {
		const whatU = what,
			isItInU = isItIn,
			eventU = event,
			textStringU = textString,
			attachFunctionU = attachFunction,
			numCheckU = numCheck,
			renameBtnU = renameBtn,
			noHideU = noHide;

		const newFunction = function () {
			tooltip(whatU, isItInU, eventU, textStringU, attachFunctionU, numCheckU, renameBtnU, noHideU);
		};

		if (noUpdateScreenRead) tooltipUpdateFunction = newFunction;
		if (shiftTooltip) {
			onShift = newFunction;
			return;
		}
	}

	let tooltipText;
	let costText = '';
	let ondisplay = null; /* if non-null, called after the tooltip is displayed */
	let toTip;
	let titleText;
	let tip2 = false;
	let noExtraCheck = false;

	if (isItIn !== null && !['maps', 'customText', 'dailyStack', 'advMaps', 'Mutator'].includes(isItIn)) {
		toTip = game[isItIn];
		toTip = toTip[what];

		if (typeof toTip === 'undefined') {
			console.log(what);
		} else {
			tooltipText = toTip.tooltip;
			if (typeof tooltipText === 'function') tooltipText = tooltipText();

			if (typeof toTip.cost !== 'undefined') costText = addTooltipPricing(toTip, what, isItIn);
			else if (what === 'Hub') costText = 'Purchase a Hut, House, Mansion, Hotel, Resort, or Gateway';
		}
	}

	const tooltipObj = { what, isItIn, event, textString, attachFunction, numCheck, renameBtn, noHide, hideCancel, ignoreShift, tooltipText, costText, ondisplay, toTip, titleText, tip2, noExtraCheck };

	const whatFunctions = tooltipWhatFunctionsObj(tooltipObj);
	if (whatFunctions[what]) {
		if (typeof whatFunctions[what] === 'function') {
			const result = whatFunctions[what](tooltipObj, elem);
			if (!result) return;

			Object.assign(tooltipObj, result[0]);
			elem = result[1];
		}
	}

	const isItInFunctions = tooltipIsItInFunctionsObj(tooltipObj);
	if (isItInFunctions[tooltipObj.isItIn]) {
		if (typeof isItInFunctions[tooltipObj.isItIn] === 'function') {
			const result = isItInFunctions[tooltipObj.isItIn](tooltipObj, elem);
			if (!result) return;

			Object.assign(tooltipObj, result[0]);
			elem = result[1];
		}
	}

	if (!tooltipObj.noExtraCheck) Object.assign(tooltipObj, tooltipNoExtraCheck(tooltipObj));

	tooltipObj.titleText = tooltipObj.titleText ? tooltipObj.titleText : tooltipObj.what;
	lastTooltipTitle = tooltipObj.titleText;
	const tipNum = tooltipObj.tip2 ? '2' : '';

	if (usingScreenReader) {
		const screenReaderTooltip = document.getElementById(`screenReaderTooltip`);

		if (tooltipObj.event === 'screenRead') {
			document.getElementById('tipTitle' + tipNum).innerHTML = '';
			document.getElementById('tipText' + tipNum).innerHTML = '';
			document.getElementById('tipCost' + tipNum).innerHTML = '';

			let readText = `<p>${tooltipObj.titleText}: `;
			if (tooltipObj.costText) readText += `Costs ${tooltipObj.costText}`;
			readText += `</p><p>${tooltipObj.tooltipText}</p>`;

			if (screenReaderTooltip.innerHTML !== readText) screenReaderTooltip.innerHTML = readText;
			game.global.lockTooltip = false;
			return;
		} else {
			if (game.global.lockTooltip) {
				const readText = 'Confirmation Popup is active. Press S to view the popup.';
				if (screenReaderTooltip.innerHTML !== readText) screenReaderTooltip.innerHTML = readText;
			} else {
				if (screenReaderTooltip.innerHTML !== '') screenReaderTooltip.innerHTML = '';
			}

			game.global.lockTooltip = false;
		}
	}

	const tipTitle = document.getElementById(`tipTitle${tipNum}`);
	if (tipTitle.innerHTML !== tooltipObj.titleText) tipTitle.innerHTML = tooltipObj.titleText;
	const tipText = document.getElementById(`tipText${tipNum}`);
	if (tipText.innerHTML !== tooltipObj.tooltipText) tipText.innerHTML = tooltipObj.tooltipText;
	const tipCost = document.getElementById(`tipCost${tipNum}`);
	if (tipCost.innerHTML !== tooltipObj.costText) tipCost.innerHTML = tooltipObj.costText;

	elem.style.display = 'block';
	if (typeof tooltipObj.ondisplay === 'function') tooltipObj.ondisplay();
	if (tooltipObj.event !== 'update') positionTooltip(elem, tooltipObj.event, tooltipObj.renameBtn);
}

function tooltipWhatFunctionsObj(tooltipObj) {
	return {
		'Confirm Purchase': tooltipConfirmPurchase,
		'Trimps Info': tooltipTrimpsInfo,
		'NW Trimps Info': tooltipNWTrimpsInfo,
		Fluffy: tooltipFluffy,
		'Scryer Formation': tooltipScryerFormation,
		'First Amalgamator': tooltipFirstAmalgamator,
		'Empowerments of Nature': tooltipEmpowerments,
		'Helium Per Hour': tooltipHeliumPerHour,
		'Finish Daily': tooltipFinishDaily,
		'Switch Daily': tooltipSwitchDaily,
		Decay: tooltipDecay,
		Heirloom: tooltipHeirloom,
		'Bone Shrine': tooltipBoneShrine,
		Respec: tooltipRespec,
		'Respec Mutators': tooltipRespecMutators,
		'Well Fed': tooltipWellFed,
		Geneticistassist: tooltipGeneticistassist,
		Welcome: tooltipWelcome,
		'Trustworthy Trimps': tooltipTrustworthyTrimps,
		'Unequip Heirloom': tooltipUnequipHeirloom,
		'Configure AutoStructure': tooltipConfigureAutoStructure,
		AutoStructure: tooltipAutoStructure,
		'Configure AutoEquip': tooltipConfigureAutoEquip,
		AutoEquip: tooltipAutoEquip,
		'Configure Generator State': tooltipConfigureGeneratorState,
		'Rename SA Preset': tooltipRenameSAPreset,
		'Configure AutoJobs': tooltipConfigureAutoJobs,
		'Archaeology Automator': !tooltipObj.isItIn ? tooltipArchaeologyAutomator : null,
		AutoJobs: tooltipAutoJobs,
		AutoGold: tooltipAutoGold,
		Unliving: tooltipUnliving,
		'AutoGolden Unlocked': tooltipAutoGoldenUnlocked,
		Poisoned: tooltipPoisoned,
		Chilled: tooltipChilled,
		Breezy: tooltipBreezy,
		'Perk Preset': tooltipPerkPreset,
		'Rename Preset': tooltipRenamePreset,
		UnlockedChallenge2: tooltipUnlockedChallenge2,
		UnlockedChallenge3: tooltipUnlockedChallenge3,
		Eggs: tooltipEggs /* this function is never called */,
		Portal: tooltipPortal,
		'Repeat Map': tooltipRepeatMap,
		Challenge2: tooltipChallenge2,
		'Geneticistassist Settings': tooltipGeneticistassistSettings,
		'Configure Maps': tooltipConfigureMaps,
		'Set Map At Zone': tooltipSetMapAtZone,
		'Change Heirloom Icon': tooltipChangeHeirloomIcon,
		'Change Portal Color': tooltipChangePortalColor,
		'Message Config': tooltipMessageConfig,
		Hotkeys: tooltipHotkeys,
		Mastery: tooltipMastery,
		'Mastery Info': tooltipMasteryInfo,
		'The Improbability': tooltipTheImprobability,
		Corruption: tooltipCorruption,
		'A Whole New World': tooltipAWholeNewWorld,
		'Change Universe': tooltipChangeUniverse,
		'The Spire': tooltipTheSpire,
		"Stuffy's Spire": tooltipStuffysSpire,
		'The Magma': tooltipTheMagma,
		'The Mutated Zones': tooltipTheMutatedZones,
		'Exit Spire': tooltipExitSpire,
		'Confirm Respec Masteries': tooltipConfirmRespecMasteries,
		'Respec Masteries': tooltipRespecMasteries,
		'The Geneticistassist': tooltipTheGeneticistassist,
		MagnetoShriek: tooltipMagnetoShriek,
		Reset: tooltipReset,
		Fight: tooltipFight,
		AutoFight: tooltipAutoFight,
		'New Achievements': tooltipNewAchievements,
		'Upgrade Generator': tooltipUpgradeGenerator,
		Queue: tooltipQueue,
		Toxic: tooltipObj.isItIn !== 'dailyStack' ? tooltipToxic : null,
		Momentum: tooltipMomentum,
		Custom: tooltipCustom,
		Max: tooltipMax,
		Export: tooltipExport,
		'Lost Time': tooltipLostTime,
		'Export Perks': tooltipExportPerks,
		Import: tooltipImport,
		'Import Perks': tooltipImportPerks,
		AutoPrestige: tooltipAutoPrestige,
		AutoUpgrade: tooltipAutoUpgrade,
		'Recycle All': tooltipRecycleAll,
		'PlayFab Login': tooltipPlayFabLogin,
		'PlayFab Conflict': tooltipPlayFabConflict,
		DominationDominating: tooltipDominationDominating,
		DominationWeak: tooltipDominationWeak,
		'Fire Trimps': tooltipFireTrimps,
		Maps: tooltipMaps,
		Error: tooltipError,
		'Scale Equality Scaling': tooltipScaleEqualitySettings,
		'Equality Scaling': tooltipEqualityScaling,
		confirm: tooltipConfirm
	};
}

function tooltipIsItInFunctionsObj(tooltipObj) {
	return {
		advMaps: tooltipAdvMaps,
		dailyStack: tooltipDailyStack,
		goldenUpgrades: tooltipGoldenUpgrades,
		talents: tooltipTalents,
		Mutator: tooltipMutator,
		portal: tooltipPortalPerkInfo /* renamed, it's a duplicate */,
		jobs: tooltipJobs,
		buildings: tooltipBuildings,
		equipment: tooltipEquipment,
		upgrades: tooltipUpgrades,
		maps: tooltipMapsHelp /* renamed, it's a duplicate. also not sure it's even used?? */,
		customText: tooltipCustomText
	};
}

function tooltipConfirmPurchase(tooltipObj, elem) {
	if (tooltipObj.attachFunction === 'purchaseImport()' && !boneTemp.selectedImport) return;
	if (game.options.menu.boneAlerts.enabled === 0 && tooltipObj.numCheck) {
		eval(tooltipObj.attachFunction);
		return;
	}

	let btnText = 'Make Purchase';
	if (tooltipObj.numCheck && game.global.b < tooltipObj.numCheck) {
		if (typeof kongregate === 'undefined') return;
		tooltipObj.tooltipText = "You can't afford this bonus. Would you like to visit the shop?";
		tooltipObj.attachFunction = 'showPurchaseBones()';
		btnText = 'Visit Shop';
	} else {
		tooltipObj.tooltipText = tooltipObj.textString;
	}

	tooltipObj.costText += '<div class="maxCenter"><div id="confirmTooltipBtn" class="btn btn-info" onclick="' + tooltipObj.attachFunction + '; cancelTooltip()">' + btnText + '</div><div class="btn btn-info" onclick="cancelTooltip()">Cancel</div></div>';
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipTrimpsInfo(tooltipObj, elem) {
	const kongMode = document.getElementById('boneBtn') !== null;

	let text = '<div class="trimpsInfoPopup">Need help, found a bug or just want to talk about Trimps? Check out the <a href="https://www.reddit.com/r/trimps" target="_blank">/r/Trimps SubReddit</a>';
	if (kongMode) text += ' or the <a href="https://www.kongregate.com/forums/11405-trimps" target="_blank">Kongregate Forums</a>.<br/><br/>';
	else text += ' or come hang out in the new <a href="https://discord.gg/kSpNHte" target="_blank">Trimps Official Discord</a>!<br/><br/>';
	text += ' If you want to read about or discuss the finer details of Trimps mechanics, check out the <a href="https://trimps.wikia.com/wiki/Trimps_Wiki" target="_blank">community-created Trimps Wiki!</a><br/><br/>';
	if (kongMode) text += ' If you need to contact the developer for any reason, <a target="_blank" href="https://www.kongregate.com/accounts/Greensatellite/private_messages?focus=true">send a private message to GreenSatellite</a> on Kongregate.';
	else text += ' If you need to contact the developer for any reason, <a href="https://www.reddit.com/message/compose/?to=Greensatellite" target="_blank">click here to send a message on Reddit</a> or find Greensatellite in the Trimps Discord.<hr/><br/>';
	if (!kongMode)
		text +=
			"If you would like to make a donation to help support the development of Trimps, you can now do so with PayPal! If you want to contribute but can't afford a donation, you can still give back by joining the community and sharing your feedback or helping others. Thank you either way, you're awesome! <form id='donateForm' style='text-align: center' action='https://www.paypal.com/cgi-bin/webscr' method='post' target='_blank'><input type='hidden' name='cmd' value='_s-xclick'><input type='hidden' name='hosted_button_id' value='MGFEJS3VVJG6U'><input type='image' src='https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif' border='0' name='submit' alt='PayPal - The safer, easier way to pay online!'><img alt='' border='0' src='https://www.paypalobjects.com/en_US/i/scr/pixel.gif' width='1' height='1'></form>";
	text += '</div>';

	tooltipObj.tooltipText = text;
	tooltipObj.costText = '<div class="btn btn-info" onclick="cancelTooltip()">Close</div>';
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	tooltipObj.noExtraCheck = true;

	return [tooltipObj, elem];
}

function tooltipNWTrimpsInfo(tooltipObj, elem) {
	tooltipObj.what = 'Trimps Info';
	let text = '<div class="trimpsInfoPopup">Need help, found a bug or just want to talk about Trimps? Check out the <a class="nwWebLink" onclick="nwWebLink(\'https://www.reddit.com/r/trimps\')">/r/Trimps SubReddit</a>';
	text += ' or come hang out in the <a class="nwWebLink" onclick="nwWebLink(\'https://discord.gg/Trimps\')">Trimps Official Discord</a>!<br/><br/>';
	text += ' If you want to read about or discuss the finer details of Trimps mechanics, check out the <a class="nwWebLink" onclick="nwWebLink(\'https://trimps.wikia.com/wiki/Trimps_Wiki\')">community-created Trimps Wiki!</a><br/><br/>';
	text += ' If you need to contact the developer for any reason, <a class="nwWebLink" onclick="nwWebLink(\'https://www.reddit.com/message/compose/?to=Greensatellite\')">click here to send a message on Reddit</a> or find Greensatellite#7771 in the Trimps Discord.';
	text += '</div>';
	tooltipObj.tooltipText = text;
	tooltipObj.costText = '<div class="btn btn-info" onclick="cancelTooltip()">Close</div>';
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	tooltipObj.noExtraCheck = true;

	return [tooltipObj, elem];
}

function tooltipFluffy(tooltipObj, elem) {
	if (tooltipObj.event === 'update') {
		/* clicked */
		game.global.lockTooltip = true;
		elem.style.top = '25%';
		elem.style.left = '25%';
		swapClass('tooltipExtra', 'tooltipExtraLg', elem);
		const fluffyTip = Fluffy.tooltip(true);
		tooltipObj.tooltipText = "<div id='fluffyTooltipTopContainer'>" + fluffyTip[0] + '</div>';
		tooltipObj.tooltipText += "<div id='fluffyLevelBreakdownContainer' class='niceScroll'>" + fluffyTip[1] + '</div>';
		tooltipObj.costText = '<div class="btn btn-danger btn-lg" onclick="cancelTooltip()">Close</div>';
		if (game.challenges.Nurture.boostsActive()) {
			tooltipObj.costText += "<span id='toggleCruffyTipBtn' class='btn btn-lg btn-primary' onclick='Fluffy.toggleCruffys()'>Show ";
			tooltipObj.costText += Fluffy.cruffysTipActive() ? 'Scruffy' : 'Cruffys';
			tooltipObj.costText += ' Info</span>';
		}
		tooltipObj.costText += "<span onclick='Fluffy.pat()' id='fluffyPatBtn' style='display: " + (Fluffy.cruffysTipActive() ? 'none' : 'inline-block') + "' class='btn btn-lg btn-warning'>Pat</span>";
		if (game.global.universe === 2 && game.global.u2SpireCells > 0) {
			tooltipObj.costText += "<span onclick='scruffySpireStory()' class='btn btn-lg btn-info'>Ask About Stuffy's Spire</span>";
		}

		openTooltip = 'Fluffy';
		setTimeout(Fluffy.refreshTooltip, 1000);
		tooltipObj.ondisplay = function () {
			verticalCenterTooltip(false, true);
		};
	} else {
		/* mouseover */
		tooltipObj.tooltipText = Fluffy.tooltip();
		tooltipObj.costText = 'Click for more detailed info';
	}

	if (Fluffy.cruffysTipActive()) tooltipObj.what = "<b>IT'S CRUFFYS</b>";
	else tooltipObj.what = Fluffy.getName();

	return [tooltipObj, elem];
}

function tooltipScryerFormation(tooltipObj, elem) {
	tooltipObj.tooltipText = '<p>Trimps lose half of their attack, health and block but gain 2x resources from loot (not including Helium) and have a chance to find Dark Essence above Z180 in the world. This formation must be active for the entire fight to receive any bonus from enemies, and must be active for the entire map to earn a bonus from a Cache.</p>';
	tooltipObj.tooltipText += getExtraScryerText(4);
	tooltipObj.tooltipText += '<br/>(Hotkeys: S or 5)';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipFirstAmalgamator(tooltipObj, elem) {
	tooltipObj.tooltipText = "<p><b>You found your first Amalgamator! You can view this tooltip again and track how many Amalgamators you currently have under 'Jobs'.</b></p>";
	tooltipObj.tooltipText += game.jobs.Amalgamator.tooltip;
	tooltipObj.costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Thanks for the help, tooltip, but you can go now.</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	tooltipObj.noExtraCheck = true;
	tooltipObj.ondisplay = function () {
		verticalCenterTooltip();
	};

	return [tooltipObj, elem];
}

function tooltipEmpowerments(tooltipObj, elem) {
	const active = getEmpowerment();
	if (!active) return;
	const emp = game.empowerments[active];
	if (typeof emp.description === 'undefined') return;

	const lvlsLeft = 5 - ((game.global.world - 1) % 5) + (game.global.world - 1) + 1;
	tooltipObj.tooltipText = '<p>The ' + active + ' Empowerment is currently active!</p><p>' + emp.description() + '</p><p>This Empowerment will end on Z' + lvlsLeft;
	if (!challengeActive('Eradicated')) {
		tooltipObj.tooltipText += ", at which point you'll be able to fight a " + getEmpowerment(null, true) + ' enemy to earn';
		const tokCount = rewardToken(emp, true, lvlsLeft);
		tooltipObj.tooltipText += ' ' + prettify(tokCount) + ' Token' + needAnS(tokCount) + ' of ' + active + '.</p>';
	} else {
		tooltipObj.tooltipText += '.</p>';
	}

	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipHeliumPerHour(tooltipObj, elem) {
	const name = heliumOrRadon();
	tooltipObj.what = name + ' Per Hour';
	tooltipObj.tooltipText = 'The displayed value for ' + name + ' Per Hour is simply a calculation of how much ' + name + " you've earned so far this run, divided by the amount of hours you've spent so far on this run.<br/><br/>This value is <b>not</b> production like the other resources. " + name + ' is always earned from killing strong Bad Guys and never produced automatically.';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipFinishDaily(tooltipObj, elem) {
	const reward = game.challenges.Daily.getCurrentReward();
	tooltipObj.tooltipText = 'Clicking <b>Finish</b> below will end your daily challenge and you will be unable to attempt it again. You will earn <b>' + prettify(reward) + ' extra ' + heliumOrRadon() + '!</b>';
	tooltipObj.costText = '<div class="maxCenter"><div id="confirmTooltipBtn" class="btn btn-info" onclick="abandonChallenge(); cancelTooltip()">Finish</div><div class="btn btn-danger" onclick="cancelTooltip()">Cancel</div></div>';
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipSwitchDaily(tooltipObj, elem) {
	const daysUntilReset = Math.floor(7 + tooltipObj.textString);
	const addAnS = daysUntilReset === 1 ? '' : 's';
	tooltipObj.tooltipText = 'Click to view ' + (tooltipObj.textString === 0 ? 'today' : dayOfWeek(getDailyTimeString(tooltipObj.textString, false, true))) + 's challenge, which resets in less than ' + daysUntilReset + ' day' + addAnS + '.';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipDecay(tooltipObj, elem) {
	let challenge = game.challenges.Decay;

	if (challengeActive('Melt')) {
		challenge = game.challenges.Melt;
		tooltipObj.what = 'Melt';
	}

	const decayedAmt = ((1 - Math.pow(challenge.decayValue, challenge.stacks)) * 100).toFixed(2);
	tooltipObj.tooltipText = 'Things are quickly becoming tougher. Gathering, looting, and Trimp attack are reduced by ' + decayedAmt + '%.';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipHeirloom(tooltipObj, elem) {
	//tooltipObj.attachFunction === location, tooltipObj.numCheck === index
	tooltipUpdateFunction = '';
	tooltipObj.tooltipText = displaySelectedHeirloom(false, 0, true, tooltipObj.numCheck, tooltipObj.attachFunction);
	tooltipObj.costText = '';
	tooltipObj.renameBtn = tooltipObj.what;
	tooltipObj.what = '';
	if (getSelectedHeirloom(tooltipObj.numCheck, tooltipObj.attachFunction).rarity === 8) {
		tooltipObj.ondisplay = function () {
			document.getElementById('tooltipHeirloomIcon').style.animationDelay = '-' + ((new Date().getTime() / 1000) % 30).toFixed(1) + 's';
		};
	}
	swapClass('tooltipExtra', 'tooltipExtraHeirloom', elem);
	tooltipObj.noExtraCheck = true;

	return [tooltipObj, elem];
}

function tooltipBoneShrine(tooltipObj, elem) {
	tooltipObj.tooltipText = game.permaBoneBonuses.boosts.btnTooltip();
	tooltipObj.costText = '';
	tooltipUpdateFunction = '';

	return [tooltipObj, elem];
}

function tooltipRespec(tooltipObj, elem) {
	tooltipObj.tooltipText = 'You can respec your perks once per portal. Clicking cancel after clicking this button will not consume your respec.';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipRespecMutators(tooltipObj, elem) {
	tooltipObj.tooltipText = 'You can only respec your Mutators when you are activating your Portal. Make sure your Mutator setup will work for your entire run!';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipWellFed(tooltipObj, elem) {
	let tBonus = 50;
	if (game.talents.turkimp2.purchased) tBonus = 100;
	tooltipObj.tooltipText = 'That Turkimp was delicious, and you have leftovers. If you set yourself to gather Food, Wood, or Metal while this buff is active, you can share with your workers to increase their gather speed by ' + tBonus + '%';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipGeneticistassist(tooltipObj, elem) {
	tooltipObj.tooltipText = "I'm your Geneticistassist! I'll hire and fire Geneticists until your total breed time is as close as possible to the target time you choose. I will fire a Farmer, Lumberjack, or Miner at random if there aren't enough workspaces, I will never spend more than 1% of your food on a Geneticist, and you can customize my target time options in Settings <b>or by holding Ctrl and clicking me</b>. I have uploaded myself to your portal and will never leave you.";
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipWelcome(tooltipObj, elem) {
	tooltipObj.tooltipText = "Welcome to Trimps! This game saves using Local Storage in your browser. Clearing your cookies or browser settings will cause your save to disappear! Please make sure you regularly back up your save file by either using the 'Export' button in the bar below or the 'Online Saving' option under 'Settings'.<br/><br/><b>Chrome and Firefox are currently the only fully supported browsers.</b><br/><br/>";

	if (document.getElementById('boneBtn') !== null) {
		tooltipObj.tooltipText +=
			"<b style='color: red'>Notice: Did you expect to see your save here?</b><br/>If this is your first time playing since November 13th 2017, check <a target='_blank' href='http://trimps.github.io'>http://trimps.github.io</a> (make sure you go to http, not https), and see if it's there. For more information, see <a target='_blank' href='http://www.kongregate.com/forums/11406-general-discussion/topics/941201-if-your-save-is-missing-after-november-13th-click-here?page=1#posts-11719541'>This Forum Thread</a>.<br/><br/>";
	}

	tooltipObj.tooltipText += '<b>Would you like to enable online saving before you start?</b>';
	game.global.lockTooltip = true;
	tooltipObj.costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip(); toggleSetting(\"usePlayFab\");'>Enable Online Saving</div><div class='btn btn-danger' onclick='cancelTooltip()'>Don't Enable</div></div>";
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipTrustworthyTrimps(tooltipObj, elem) {
	if (usingScreenReader) {
		setTimeout(function () {
			document.getElementById('screenReaderTooltip').innerHTML = tooltipObj.textString;
		}, 2000);

		return;
	}

	tooltipObj.tooltipText = tooltipObj.textString;
	game.global.lockTooltip = true;
	tooltipObj.costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Sweet, thanks.</div></div>";
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipUnequipHeirloom(tooltipObj, elem) {
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	tooltipObj.costText = "<div class='maxCenter'>";
	tooltipObj.tooltipText = '<p>You have no more room to carry another Heirloom, ';
	if (game.global.maxCarriedHeirlooms > game.heirlooms.values.length) {
		tooltipObj.tooltipText += "and you've already purchased the maximum amount of slots.</p><p>Would you like to leave this Heirloom equipped ";
	} else if (game.global.nullifium < getNextCarriedCost()) {
		tooltipObj.tooltipText += "and don't have enough Nullifium to purchase another Carried slot.</p><p>Would you like to leave this Heirloom equipped ";
	} else {
		tooltipObj.tooltipText += 'but you do have enough Nullifium to purchase another Carried slot!</p><p>Would you like to purchase another Carried slot, leave this Heirloom equipped, ';
		tooltipObj.costText += "<div class='btn btn-success' onclick='cancelTooltip(); addCarried(true); unequipHeirloom();'>Buy a Slot (" + getNextCarriedCost() + ' Nu)</div>';
	}
	tooltipObj.tooltipText += 'or put it in Temporary Storage? <b>If you use your Portal while this Heirloom is in Temporary Storage, it will be recycled!</b></p>';
	tooltipObj.costText += "<div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Leave it equipped</div><div class='btn btn-danger' onclick='cancelTooltip(); unequipHeirloom(null, \"heirloomsExtra\");'>Place in Temporary</div></div>";

	return [tooltipObj, elem];
}

function tooltipConfigureAutoStructure(tooltipObj, elem) {
	tooltipObj.tooltipText =
		"<p>Here you can choose which structures will be automatically purchased when AutoStructure is toggled on. Check a box to enable the automatic purchasing of that structure, set the dropdown to specify the cost-to-resource % that the structure should be purchased below, and set the 'Up To:' box to the maximum number of that structure you'd like purchased <b>(0&nbsp;for&nbsp;no&nbsp;limit)</b>. For example, setting the dropdown to 10% and the 'Up To:' box to 50 for 'House' will cause a House to be automatically purchased whenever the costs of the next house are less than 10% of your Food, Metal, and Wood, as long as you have less than 50 houses. 'W' for Gigastation is the required minimum amount of Warpstations before a Gigastation is purchased.</p><table id='autoPurchaseConfigTable'><tbody><tr>";
	var count = 0;
	var setting, selectedPerc, checkbox, options;
	var settingGroup = getAutoStructureSetting();
	for (var item in game.buildings) {
		var building = game.buildings[item];
		if (building.blockU2 && game.global.universe === 2) continue;
		if (building.blockU1 && game.global.universe === 1) continue;
		if (item === 'Laboratory' && !challengeActive('Nurture')) continue;
		if (!building.AP) continue;
		if (count !== 0 && count % 2 === 0) tooltipObj.tooltipText += '</tr><tr>';
		setting = settingGroup[item];
		selectedPerc = setting ? setting.value : 0.1;
		checkbox = buildNiceCheckbox('structConfig' + item, 'autoCheckbox', setting && setting.enabled);
		options =
			"<option value='0.1'" +
			(selectedPerc === 0.1 ? ' selected' : '') +
			">0.1%</option><option value='1'" +
			(selectedPerc === 1 ? ' selected' : '') +
			">1%</option><option value='5'" +
			(selectedPerc === 5 ? ' selected' : '') +
			">5%</option><option value='10'" +
			(selectedPerc === 10 ? ' selected' : '') +
			">10%</option><option value='25'" +
			(selectedPerc === 25 ? ' selected' : '') +
			">25%</option><option value='50'" +
			(selectedPerc === 50 ? ' selected' : '') +
			">50%</option><option value='99'" +
			(selectedPerc === 99 ? ' selected' : '') +
			'>99%</option>';
		var id = 'structSelect' + item;
		tooltipObj.tooltipText +=
			"<td><div class='row'><div class='col-xs-5' style='padding-right: 5px'>" +
			checkbox +
			'&nbsp;&nbsp;<span>' +
			item +
			"</span></div><div style='text-align: center; padding-left: 0px;' class='col-xs-2'><select class='structSelect' id='" +
			id +
			"'>" +
			options +
			"</select></div><div class='col-xs-5 lowPad' style='text-align: right'>Up To: <input class='structConfigQuantity' id='structQuant" +
			item +
			"' type='number'  value='" +
			(setting && setting.buyMax ? setting.buyMax : 0) +
			"'/></div></div></td>";
		count++;
	}
	tooltipObj.tooltipText += '</tr><tr>';
	if (game.global.universe === 1) {
		tooltipObj.tooltipText += '<tr>';
		/* stupid gigas making this all spaghetti */
		setting = settingGroup.Gigastation;
		selectedPerc = setting ? setting.value : 0.1;
		checkbox = buildNiceCheckbox('structConfigGigastation', 'autoCheckbox', setting && setting.enabled);
		options =
			"<option value='0.1'" +
			(selectedPerc === 0.1 ? ' selected' : '') +
			">0.1%</option><option value='1'" +
			(selectedPerc === 1 ? ' selected' : '') +
			">1%</option><option value='5'" +
			(selectedPerc === 5 ? ' selected' : '') +
			">5%</option><option value='10'" +
			(selectedPerc === 10 ? ' selected' : '') +
			">10%</option><option value='25'" +
			(selectedPerc === 25 ? ' selected' : '') +
			">25%</option><option value='50'" +
			(selectedPerc === 50 ? ' selected' : '') +
			">50%</option><option value='99'" +
			(selectedPerc === 99 ? ' selected' : '') +
			'>99%</option>';
		tooltipObj.tooltipText +=
			"<td><div class='row'><div class='col-xs-5' style='padding-right: 5px'>" +
			checkbox +
			"&nbsp;&nbsp;<span>Gigastation</span></div><div style='text-align: center; padding-left: 0px;' class='col-xs-2'><select class='structSelect' id='structSelectGigastation'>" +
			options +
			"</select></div><div class='col-xs-5 lowPad' style='text-align: right'>At W: <input class='structConfigQuantity' id='structQuantGigastation' type='number'  value='" +
			(setting && setting.buyMax ? setting.buyMax : 0) +
			"'/></div></div></td>";
		if (getHighestLevelCleared() >= 229) {
			var nurserySetting = typeof settingGroup.NurseryZones !== 'undefined' ? settingGroup.NurseryZones : 1;
			tooltipObj.tooltipText += "<td><div class='row'><div class='col-xs-12' style='text-align: right; padding-right: 5px;'>Don't buy Nurseries Until Z: <input style='width: 20.8%; margin-right: 4%;' class='structConfigQuantity' id='structZoneNursery' type='number' value='" + nurserySetting + "'></div></div></td>";
		}
		tooltipObj.tooltipText += '</tr>';
	}
	options = "<option value='0'>Apply Percent to All</option><option value='0.1'>0.1%</option><option value='1'>1%</option><option value='5'>5%</option><option value='10'>10%</option><option value='25'>25%</option><option value='50'>50%</option><option value='99'>99%</option>";
	tooltipObj.tooltipText += "<tr style='text-align: center'>";
	tooltipObj.tooltipText += "<td><span data-nexton='true' onclick='toggleAllAutoStructures(this)' class='btn colorPrimary btn-md toggleAllBtn'>Toggle All Structures On</span></td>";
	tooltipObj.tooltipText += "<td><select class='toggleAllBtn' id='autoStructureAllPctSelect' onchange='setAllAutoStructurePercent(this)'>" + options + '</select></td>';

	tooltipObj.tooltipText += '</tr></tbody></table>';
	tooltipObj.costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info btn-lg' onclick='saveAutoStructureConfig()'>Apply</div><div class='btn-lg btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
	game.global.lockTooltip = true;
	tooltipObj.ondisplay = function () {
		verticalCenterTooltip(false, true);
	};

	return [tooltipObj, elem];
}

function tooltipAutoStructure(tooltipObj, elem) {
	tooltipObj.tooltipText = '<p>Your mastery of this world has enabled your Foremen to handle fairly complicated orders regarding which buildings should be built. Click the cog icon on the right side of this button to tell your Foremen tooltipObj.what you want and when you want it, then click the left side of the button to tell them to start or stop.</p>';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipConfigureAutoEquip(tooltipObj, elem) {
	tooltipObj.tooltipText =
		"<p>Welcome to AutoEquip! <span id='autoTooltipHelpBtn' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'><p>Here you can choose which equipment will be automatically purchased when AutoEquip is toggled on. Check a box to enable the automatic purchasing of that equipment type, set the dropdown to specify the cost-to-resource % that the equipment should be purchased below, and set the 'Up To:' box to the maximum number of that equipment you'd like purchased (0 for no limit).</p><p>For example, setting the dropdown to 10% and the 'Up To:' box to 50 for 'Shield' will cause a Shield to be automatically purchased whenever the cost of the next Shield is less than 10% of your Wood, as long as you have less than 50 Shields.</p></div>";
	tooltipObj.tooltipText += "<table id='autoPurchaseConfigTable'><tbody><tr>";
	var count = 0;
	var setting, selectedPerc, checkbox, options, type;
	var settingGroup = getAutoEquipSetting();
	for (var item in game.equipment) {
		var equipment = game.equipment[item];
		if (count !== 0 && count % 2 === 0) tooltipObj.tooltipText += '</tr><tr>';
		setting = settingGroup[item];
		selectedPerc = setting ? setting.value : 0.1;
		type = equipment.health ? 'Armor' : 'Wep';
		checkbox = buildNiceCheckbox('equipConfig' + item, 'autoCheckbox checkbox' + type, setting && setting.enabled);
		options =
			"<option value='0.1'" +
			(selectedPerc === 0.1 ? ' selected' : '') +
			">0.1%</option><option value='1'" +
			(selectedPerc === 1 ? ' selected' : '') +
			">1%</option><option value='5'" +
			(selectedPerc === 5 ? ' selected' : '') +
			">5%</option><option value='10'" +
			(selectedPerc === 10 ? ' selected' : '') +
			">10%</option><option value='25'" +
			(selectedPerc === 25 ? ' selected' : '') +
			">25%</option><option value='50'" +
			(selectedPerc === 50 ? ' selected' : '') +
			">50%</option><option value='99'" +
			(selectedPerc === 99 ? ' selected' : '') +
			'>99%</option>';
		tooltipObj.tooltipText +=
			"<td><div class='row'><div class='col-xs-6' style='padding-right: 5px'>" +
			checkbox +
			'&nbsp;&nbsp;<span>' +
			item +
			"</span></div><div style='text-align: center; padding-left: 0px;' class='col-xs-2'><select class='equipSelect" +
			type +
			"' id='equipSelect" +
			item +
			"'>" +
			options +
			"</select></div><div class='col-xs-4 lowPad' style='text-align: right'>Up To: <input class='equipConfigQuantity' id='equipQuant" +
			item +
			"' type='number'  value='" +
			(setting && setting.buyMax ? setting.buyMax : 0) +
			"'/></div></div></td>";
		count++;
	}
	tooltipObj.tooltipText += '</tr><tr><td></td></tr></tbody></table>';

	options = "<option value='0'>Apply Percent to All</option><option value='0.1'>0.1%</option><option value='1'>1%</option><option value='5'>5%</option><option value='10'>10%</option><option value='25'>25%</option><option value='50'>50%</option><option value='99'>99%</option>";
	tooltipObj.tooltipText += "<table id='autoEquipMiscTable'><tbody><tr>";
	tooltipObj.tooltipText += "<td><span data-nexton='true' onclick='uncheckAutoEquip(\"Armor\", this)' class='toggleAllBtn btn colorPrimary btn-md'>Toggle All Armor On</span></td>";
	tooltipObj.tooltipText += "<td><select class='toggleAllBtn' onchange='setAllAutoEquipPercent(\"Armor\", this)'>" + options + '</select></td>';
	var highestTierOn = settingGroup.highestTier === true;
	tooltipObj.tooltipText += "<td><span data-on='" + highestTierOn + "' onclick='toggleAutoEquipHighestTier(this)' id='highestTierOnlyBtn' class='toggleAllBtn btn color" + (highestTierOn ? 'Success' : 'Danger') + " btn-md'>Only Buy From Highest Tier" + (highestTierOn ? ' On' : ' Off') + '</span></td>';
	tooltipObj.tooltipText += "<td><span data-nexton='true' onclick='uncheckAutoEquip(\"Wep\", this)' class='toggleAllBtn btn colorPrimary btn-md'>Toggle All Weapons On</span></td>";
	tooltipObj.tooltipText += "<td><select class='toggleAllBtn' onchange='setAllAutoEquipPercent(\"Wep\", this)'>" + options + '</select></td>';
	tooltipObj.tooltipText += '</tr></tbody></table>';

	tooltipObj.costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-lg btn-info' onclick='saveAutoEquipConfig()'>Apply</div><div class='btn btn-lg btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '25%';
	elem.style.top = '25%';
	tooltipObj.ondisplay = function () {
		verticalCenterTooltip(false, true);
	};

	return [tooltipObj, elem];
}

function tooltipAutoEquip(tooltipObj, elem) {
	tooltipObj.tooltipText = '<p>The Auspicious Presence has blessed your Trimps with the ability to automatically upgrade their own equipment! Click the cog icon on the right side of this button to tell your Trimps tooltipObj.what they should upgrade and when to do it, then click the left side of the button to tell them to start or stop.</p>';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipConfigureGeneratorState(tooltipObj, elem) {
	geneMenuOpen = true;
	elem = document.getElementById('tooltipDiv2');
	tooltipObj.tip2 = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	tooltipObj.tooltipText = "<div style='padding: 1.5vw;'><div style='color: red; font-size: 1.1em; text-align: center;' id='genStateConfigError'></div>";
	tooltipObj.tooltipText += "<div id='genStateConfigTooltip'>" + getGenStateConfigTooltip() + '</div>';
	tooltipObj.costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn-lg btn btn-info' onclick='saveGenStateConfig()'>Apply</div><div class='btn btn-lg btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";

	return [tooltipObj, elem];
}

function tooltipRenameSAPreset(tooltipObj, elem) {
	tooltipObj.what += ' ' + tooltipObj.textString;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	tooltipObj.tooltipText = autoBattle.renamePresetTooltip(tooltipObj.textString);
	tooltipObj.costText = "<div class='maxCenter'><div id='confirmTooltipBtn' onclick='autoBattle.savePresetName(" + tooltipObj.textString + ")' class='btn-lg btn autoItemEquipped'>Save</div><div class='btn btn-lg autoItemHide' onclick='autoBattle.popup(false,false,false,true);'>Cancel</div>";

	return [tooltipObj, elem];
}

function tooltipConfigureAutoJobs(tooltipObj, elem) {
	tooltipObj.tooltipText =
		"<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AutoJobs! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'><p>The left side of this window is dedicated to jobs that are limited more by workspaces than resources. 1:1:1:1 will purchase all 4 of these ratio-based jobs evenly, and the ratio refers to the amount of workspaces you wish to dedicate to each job. You can use any number larger than 0. Ratio-based jobs will be purchased once at the end of every Zone AND once every 30 seconds, but not more often than once every 2 seconds.</p><p>The right side of this window is dedicated to jobs limited more by resources than workspaces. Set the dropdown to the percentage of resources that you'd like to be spent on each job, and add a max amount if you wish (0 for unlimited). Percentage-based jobs are purchased once every 2 seconds.</p></div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";
	var percentJobs = ['Explorer'];
	if (game.global.universe === 1) {
		if (game.global.highestLevelCleared >= 229) percentJobs.push('Magmamancer');
		percentJobs.push('Trainer');
	}
	if (game.global.universe === 2 && game.global.highestRadonLevelCleared > 29) percentJobs.push('Meteorologist');
	if (game.global.universe === 2 && game.global.highestRadonLevelCleared > 49) percentJobs.push('Worshipper');
	var ratioJobs = ['Farmer', 'Lumberjack', 'Miner', 'Scientist'];
	var count = 0;
	var sciMax = 1;
	var settingGroup = getAutoJobsSetting();
	for (var x = 0; x < ratioJobs.length; x++) {
		tooltipObj.tooltipText += '<tr>';
		var item = ratioJobs[x];
		var setting = settingGroup[item];
		var selectedPerc = setting ? setting.value : 0.1;
		var max;
		var checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', setting && setting.enabled);
		tooltipObj.tooltipText += "<td style='width: 40%'><div class='row'><div class='col-xs-6' style='padding-right: 5px'>" + checkbox + '&nbsp;&nbsp;<span>' + item + "</span></div><div class='col-xs-6 lowPad' style='text-align: right'>Ratio: <input class='jobConfigQuantity' id='autoJobQuant" + item + "' type='number'  value='" + (setting && setting.ratio ? setting.ratio : 1) + "'/></div></div>";
		if (ratioJobs[x] === 'Scientist') {
			max = setting && setting.buyMax ? setting.buyMax : 0;
			if (max > 1e4) max = max.toExponential().replace('+', '');
			sciMax = max;
			if (percentJobs.length < 4) tooltipObj.tooltipText += "</td><td style='width: 60%'><div class='row' style='width: 50%; border: 0; text-align: left;'><span style='padding-left: 0.4vw'>&nbsp;</span>Up To: <input class='jobConfigQuantity' id='autoJobQuant" + item + "' value='" + prettify(max) + "'/></div></td>";
		} else tooltipObj.tooltipText += '</td>';
		if (percentJobs.length > x) {
			item = percentJobs[x];
			setting = settingGroup[item];
			selectedPerc = setting ? setting.value : 0.1;
			max = setting && setting.buyMax ? setting.buyMax : 0;
			if (max > 1e4) max = max.toExponential().replace('+', '');
			checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', setting && setting.enabled);
			var options =
				"<option value='0.1'" +
				(selectedPerc === 0.001 ? ' selected' : '') +
				">0.1%</option><option value='1'" +
				(selectedPerc === 0.01 ? ' selected' : '') +
				">1%</option><option value='5'" +
				(selectedPerc === 0.05 ? ' selected' : '') +
				">5%</option><option value='10'" +
				(selectedPerc === 0.1 ? ' selected' : '') +
				">10%</option><option value='25'" +
				(selectedPerc === 0.25 ? ' selected' : '') +
				">25%</option><option value='50'" +
				(selectedPerc === 0.5 ? ' selected' : '') +
				">50%</option><option value='99'" +
				(selectedPerc === 0.99 ? ' selected' : '') +
				'>99%</option>';
			tooltipObj.tooltipText +=
				"<td style='width: 60%'><div class='row'><div class='col-xs-5' style='padding-right: 5px'>" + checkbox + '&nbsp;&nbsp;<span>' + item + "</span></div><div style='text-align: center; padding-left: 0px;' class='col-xs-2'><select  id='autoJobSelect" + item + "'>" + options + "</select></div><div class='col-xs-5 lowPad' style='text-align: right'>Up To: <input class='jobConfigQuantity' id='autoJobQuant" + item + "'  value='" + prettify(max) + "'/></div></div></td></tr>";
		}
	}
	if (percentJobs.length >= 4) tooltipObj.tooltipText += "<tr><td style='width: 40%'><div class='row'><div class='col-xs-6' style='padding-right: 5px'>&nbsp;</div><div class='col-xs-6 lowPad' style='text-align: right'>Up To: <input class='jobConfigQuantity' id='autoJobQuantScientist2' value='" + prettify(sciMax) + "'></div></div></td><td style='width: 60%'>&nbsp;</td></tr>";
	tooltipObj.tooltipText += "<tr><td style='width: 40%'><div class='col-xs-7' style='padding-right: 5px'>Gather on Portal:</div><div class='col-xs-5 lowPad' style='text-align: right'><select style='width: 100%' id='autoJobSelfGather'><option value='0'>Nothing</option>";
	const values = ['Food', 'Wood', 'Metal', 'Science'];
	for (let x = 0; x < values.length; x++) {
		tooltipObj.tooltipText += '<option' + (settingGroup.portalGather && settingGroup.portalGather === values[x].toLowerCase() ? " selected='selected'" : '') + " value='" + values[x].toLowerCase() + "'>" + values[x] + '</option>';
	}
	tooltipObj.tooltipText += '</select></div></td></tr>';
	tooltipObj.tooltipText += '</tbody></table>';
	tooltipObj.costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn-lg btn btn-info' onclick='saveAutoJobsConfig()'>Apply</div><div class='btn btn-lg btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	tooltipObj.ondisplay = function () {
		verticalCenterTooltip(true);
	};

	return [tooltipObj, elem];
}

function tooltipArchaeologyAutomator(tooltipObj, elem) {
	tooltipObj.tooltipText = game.challenges.Archaeology.automatorTooltip();
	tooltipObj.costText =
		"<div class='maxCenter'><div id='confirmTooltipBtn' class='btn-lg btn btn-info' onclick='game.challenges.Archaeology.saveAutomator()'>Apply</div><div class='btn btn-lg btn-danger' onclick='cancelTooltip()'>Cancel</div><div class='btn btn-lg btn-" +
		(game.challenges.Archaeology.pauseAuto ? 'primary' : 'warning') +
		'\' onclick=\'game.challenges.Archaeology.pauseAuto = !game.challenges.Archaeology.pauseAuto; this.className = "btn btn-lg btn-" + ((game.challenges.Archaeology.pauseAuto) ? "primary" : "warning"); this.innerHTML = ((game.challenges.Archaeology.pauseAuto) ? "Unpause Automator" : "Pause Automator");\'>' +
		(game.challenges.Archaeology.pauseAuto ? 'Unpause' : 'Pause') +
		' Automator</div></div>';
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	tooltipObj.ondisplay = function () {
		verticalCenterTooltip(true);
	};

	return [tooltipObj, elem];
}

function tooltipAutoJobs(tooltipObj, elem) {
	tooltipObj.tooltipText = '<p>Your continued mastery of this world has enabled you to set rules for automatic job allocation. Click the cog icon on the right side of this button to tell your Human Resourceimps tooltipObj.what you want and when you want it, then click the left side of the button to tell them to start or stop.</p>';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipAutoGold(tooltipObj, elem) {
	const heName = heliumOrRadon();
	const voidHeName = game.global.universe === 2 ? 'Voidon' : 'Voidlium';
	tooltipObj.tooltipText =
		"<p>Thanks to your brilliant Scientists, you can designate Golden Upgrades to be purchased automatically! Toggle between: </p><p><b>AutoGold Off</b> when you're not feeling particularly trusting.</p><p><b>AutoGold " +
		heName +
		' (' +
		game.goldenUpgrades.Helium.purchasedAt.length +
		'/' +
		Math.round(game.goldenUpgrades.Helium.currentBonus * 100) +
		"%)</b> when you're looking to boost your Perk game. 4/5 Trimps agree that this will increase your overall " +
		heliumOrRadon() +
		' earned, though none of the 5 really understood the question.</p><p><b>AutoGold Battle (' +
		game.goldenUpgrades.Battle.purchasedAt.length +
		'/' +
		Math.round(game.goldenUpgrades.Battle.currentBonus * 100) +
		'%)</b> if your Trimps have a tendency to slack off when you turn your back.</p>';
	tooltipObj.tooltipText += '<p><b>AutoGold Void (' + game.goldenUpgrades.Void.purchasedAt.length + '/' + Math.round(game.goldenUpgrades.Void.currentBonus * 100) + '%)</b> which comes in 2 different flavors';

	if (getTotalPortals() === 0) {
		tooltipObj.tooltipText += ", but you can't find Void Maps until you've found the Portal Device at least once, so you can't use them.</p>";
	} else {
		tooltipObj.tooltipText += ':<br/><b>' + voidHeName + '</b> - Will entrust your Scientists with purchasing as many Golden Voids as possible (to reach 72%) before switching to Golden ' + heName + ', or...<br/><b>Voidtle</b> - Where your Scientists will again attempt to buy as many Golden Voids as possible (to reach 72%), but will instead switch to Golden Battle afterwards.</p>';
	}

	if (game.global.canGuString) {
		tooltipObj.tooltipText += '<p><b>Custom AutoGold</b> - For the advanced Trimp commander/archaeologist who wants even more control. <b>Ctrl Click to customize your string</b></p>';
		tooltipObj.tooltipText += "<p>Please allow 4 seconds for Trimp retraining after clicking this button before any Golden Upgrades are automatically purchased, and don't forget to frequently thank your scientists! Seriously, they get moody.</p>";
	}
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipUnliving(tooltipObj, elem) {
	const stacks = game.challenges.Life.stacks;
	const mult = game.challenges.Life.getHealthMult(true);
	if (stacks > 130) tooltipObj.tooltipText = "Your Trimps are looking quite dead, which is very healthy in this dimension. You're doing a great job!";
	else if (stacks > 75) tooltipObj.tooltipText = "Your Trimps are starting to look more lively and slow down, but at least they're still fairly pale.";
	else if (stacks > 30) tooltipObj.tooltipText = 'The Bad Guys in this dimension seem to be way more dead than your Trimps!';
	else tooltipObj.tooltipText = 'Your Trimps look perfectly normal and healthy now, which is not tooltipObj.what you want in this dimension.';

	tooltipObj.tooltipText += ' <b>Trimp attack and health increased by ' + mult + '.</b>';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipAutoGoldenUnlocked(tooltipObj, elem) {
	tooltipObj.tooltipText =
		"<p>Your Trimps have extracted and processed many Golden Upgrades by now, and though you're still nervous to leave things completely to them, you figure they can probably handle doing this on their own as well. You find the nearest Trimp and ask if he could handle buying Golden Upgrades on his own, as long as you told him which ones to buy. You can tell by the puddle of drool rapidly gaining mass at his feet that this is going to take either magic or a lot of hard work.</p><p>You can't find any magic anywhere, so you decide to found Trimp University, a school dedicated to teaching Trimps how to extract the might of Golden Upgrades without any assistance. Weeks go by while you and your Trimps work tirelessly to set up the University, choosing only the finest building materials and hiring only the most renowned Foremen to draw the plans. Just as you're finishing up, a Scientist stops by, sees tooltipObj.what you're doing, and offers to just handle the Golden Upgrades instead. Probably should have just asked one of them first.</p><p><b>You have unlocked AutoGolden!</b></p>";
	tooltipObj.costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip()'>Close</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipPoisoned(tooltipObj, elem) {
	tooltipObj.tooltipText = 'This enemy is harmed by the Empowerment of Poison, and is taking ' + prettify(game.empowerments.Poison.getDamage()) + ' extra damage per turn.';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipChilled(tooltipObj, elem) {
	tooltipObj.tooltipText = 'This enemy has been chilled by the Empowerment of Ice, is taking ' + prettify(game.empowerments.Ice.getDamageModifier() * 100) + '% more damage, and is dealing ' + prettify((1 - game.empowerments.Ice.getCombatModifier()) * 100) + '% less damage with each normal attack.' + game.empowerments.Ice.overkillDesc();
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipBreezy(tooltipObj, elem) {
	const heliumText = !game.global.mapsActive ? 'increasing all Helium gained by ' + prettify(game.empowerments.Wind.getCombatModifier(true) * 100) + '% and all other' : 'increasing all non-Helium ';
	tooltipObj.tooltipText = 'There is a rather large amount of Wind swelling around this enemy, ' + heliumText + ' resources by ' + prettify(game.empowerments.Wind.getCombatModifier() * 100) + '%.';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipPerkPreset(tooltipObj, elem) {
	if (tooltipObj.textString === 'Save') {
		tooltipObj.what = 'Save Perk Preset';
		tooltipObj.tooltipText = 'Click to save your current perk loadout to the selected preset';
	} else if (tooltipObj.textString === 'Rename') {
		tooltipObj.what = 'Rename Perk Preset';
		tooltipObj.tooltipText = 'Click to set a name for your currently selected perk preset';
	} else if (tooltipObj.textString === 'Load') {
		tooltipObj.what = 'Load Perk Preset';
		tooltipObj.tooltipText = 'Click to load your currently selected perk preset.';
		if (!game.global.respecActive) tooltipObj.tooltipText += " <p class='red'>You must have your Respec active to load a preset!</p>";
	} else if (tooltipObj.textString === 'Import') {
		tooltipObj.what = 'Import Perk Preset';
		tooltipObj.tooltipText = 'Click to import a perk setup from a text string';
	} else if (tooltipObj.textString === 'Export') {
		tooltipObj.what = 'Export Perk Setup';
		tooltipObj.tooltipText = 'Click to export a copy of your current perk setup to share with friends, or to save and import later!';
	} else if (tooltipObj.textString > 0 && tooltipObj.textString <= 3) {
		const presetGroup = portalUniverse === 2 ? game.global.perkPresetU2 : game.global.perkPresetU1;
		const preset = presetGroup['perkPreset' + tooltipObj.textString];
		if (typeof preset === 'undefined') return;
		tooltipObj.what = preset.Name ? 'Preset: ' + preset.Name : 'Preset ' + tooltipObj.textString;
		if (isObjectEmpty(preset)) {
			tooltipObj.tooltipText = "<span class='red'>This Preset slot is empty!</span> Select this slot and then click 'Save' to save your current Perk configuration to this slot. You'll be able to load this configuration back whenever you want, as long as you have your Respec active.";
		} else {
			tooltipObj.tooltipText = "<p style='font-weight: bold'>This Preset holds:</p>";
			let count = 0;
			for (let item in preset) {
				if (item === 'Name') continue;
				tooltipObj.tooltipText += count > 0 ? ', ' : '';
				tooltipObj.tooltipText += '<b>' + item.replace('_', '&nbsp;') + ':</b>&nbsp;' + preset[item];
				count++;
			}
		}
	}

	return [tooltipObj, elem];
}

function tooltipRenamePreset(tooltipObj, elem) {
	tooltipObj.what = 'Rename Preset ' + selectedPreset;
	const presetGroup = portalUniverse === 2 ? game.global.perkPresetU2 : game.global.perkPresetU1;
	tooltipObj.tooltipText = 'Type a name below for your Perk Preset! This name will show up on the Preset bar and make it easy to identify which Preset is which.';
	if (tooltipObj.textString) tooltipObj.tooltipText += ' <b>Max of 1,000 for most perks</b>';
	const preset = presetGroup['perkPreset' + selectedPreset];
	const oldName = preset && preset.Name ? preset.Name : '';
	tooltipObj.tooltipText += "<br/><br/><input id='renamePresetBox' maxlength='25' style='width: 50%' value='" + oldName + "' />";
	tooltipObj.costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='renamePerkPreset()'>Apply</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	tooltipObj.ondisplay = function () {
		const box = document.getElementById('renamePresetBox');
		// Chrome chokes on setSelectionRange on a number box; fall back to select()
		try {
			box.setSelectionRange(0, box.value.length);
		} catch (e) {
			box.select();
		}
		box.focus();
	};
	tooltipObj.noExtraCheck = true;

	return [tooltipObj, elem];
}

function tooltipUnlockedChallenge2(tooltipObj, elem) {
	tooltipObj.what = 'Unlocked Challenge<sup>2</sup>';
	tooltipObj.tooltipText = "You hear some strange noises behind you and turn around to see three excited scientists. They inform you that they've figured out a way to modify The Portal to take you to a new type of challenging dimension, a system they proudly call 'Challenge<sup>2</sup>'. You will be able to activate and check out their new technology by clicking the 'Challenge<sup>2</sup>' button next time you go to use The Portal.";
	game.global.lockTooltip = true;
	tooltipObj.costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Thanks, Scientists</div></div>";
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipUnlockedChallenge3(tooltipObj, elem) {
	tooltipObj.what = 'Unlocked Challenge<sup>3</sup>';
	tooltipObj.tooltipText = "You hear some strange noises behind you and turn around to see nine excited scientists. They inform you that they've figured out a way to modify The Portal to take you to a new type of challenging dimension, a system they proudly call 'Challenge<sup>3</sup>'. It seems as if the difference between Challenge<sup>2</sup> and Challenge<sup>3</sup> allows them to combine multiplicatively into your Challenge<sup><span class='icomoon icon-infinity'></span></sup> bonus.";
	game.global.lockTooltip = true;
	tooltipObj.costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Thanks, Scientists</div></div>";
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipEggs(tooltipObj, elem) {
	tooltipObj.tooltipText = '<span class="eggMessage">It seems as if some sort of animal has placed a bunch of brightly colored eggs in the world. If you happen to see one, you can click on it to send a Trimp to pick it up! According to your scientists, they have a rare chance to contain some neat stuff, but they will not last forever...</span>';
	game.global.lockTooltip = true;
	tooltipObj.costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>I'll keep an eye out.</div></div>";
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipPortal(tooltipObj, elem) {
	tooltipObj.tooltipText = 'The portal device you found shines ' + (game.global.universe === 1 ? 'green' : 'blue') + ' in the lab. Such a familiar shade... (Hotkey: T)';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipRepeatMap(tooltipObj, elem) {
	tooltipObj.tooltipText = 'Allow the Trimps to find their way back to square 1 once they finish without your help. They grow up so fast. <br/><br/>If you are <b>not</b> repeating, your current group of Trimps will not be abandoned after the map ends. (Hotkey: R)';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipChallenge2(tooltipObj, elem) {
	const sup = portalUniverse === 1 || game.global.highestRadonLevelCleared < 49 ? '2' : '3';
	tooltipObj.what = 'Challenge<sup>' + sup + '</sup>';
	tooltipObj.tooltipText = '';
	let rewardEach = squaredConfig.rewardEach;
	let rewardGrowth = squaredConfig.rewardGrowth;
	const uniArray = countChallengeSquaredReward(false, false, true);

	if (game.talents.mesmer.purchased) {
		rewardEach *= 3;
		rewardGrowth *= 3;
	}

	if (portalUniverse === 2 && game.global.highestRadonLevelCleared < 49) {
		tooltipObj.tooltipText = "<p><b style='color: #003b99'>Reach Zone 50 in Universe 2 to unlock Challenge<sup>3</sup>, which combine multiplicatively with your Challenge<sup>2</sup>. Just imagine the possibilities!</b></p>";
	} else {
		if (!tooltipObj.textString) tooltipObj.tooltipText = '<p>Click to toggle a challenge mode for your challenges!</p>';
		tooltipObj.tooltipText +=
			'<p>In Challenge<sup>' +
			sup +
			'</sup> mode, you can re-run some challenges in order to earn a permanent attack, health, and ' +
			heliumOrRadon() +
			' bonus for your Trimps. MOST Challenge<sup>' +
			sup +
			'</sup>s will grant <b>' +
			rewardEach +
			'% ' +
			(sup === 2 ? 'attack and health and ' + prettify(rewardEach / 10) + '% increased ' + heliumOrRadon() : 'Challenge<sup>' + sup + '</sup> bonus') +
			' for every ' +
			squaredConfig.rewardFreq +
			' Zones reached. Every ' +
			squaredConfig.thresh +
			' Zones, ' +
			(sup === 2 ? 'the attack and health bonus will increase by an additional ' + rewardGrowth + '%, and the ' + heliumOrRadon() + ' bonus will increase by ' + prettify(rewardGrowth / 10) + '%' : 'this bonus will increase by an additional ' + rewardGrowth + '%') +
			'</b>. This bonus is additive with all available Challenge<sup>' +
			sup +
			'</sup>s, and your highest Zone reached for each challenge is saved and used.</p><p><b>No Challenge<sup>' +
			sup +
			"</sup>s end at any specific Zone</b>, they can only be completed by using your portal or abandoning through the 'View Perks' menu. However, <b>no " +
			heliumOrRadon() +
			' can drop, and no bonus ' +
			heliumOrRadon() +
			' will be earned during or after the run</b>. Void Maps will still drop heirlooms, and all other currency can still be earned.</p>';
	}

	if (game.global.highestRadonLevelCleared >= 49) {
		tooltipObj.tooltipText +=
			"<p><b>Challenge<sup>2</sup> stacks multiplicatively with Challenge<sup>3</sup>, creating one big, beautiful Challenge<sup><span class='icomoon icon-infinity'></span></sup> modifier</b>. You have a " +
			prettify(uniArray[0]) +
			'% bonus from Challenge<sup>2</sup> in Universe 1, and a ' +
			prettify(uniArray[1]) +
			"% bonus from Challenge<sup>3</sup> in Universe 2. This brings your total Challenge<sup><span class='icomoon icon-infinity'></span></sup> bonus to <b>" +
			prettify(game.global.totalSquaredReward) +
			'</b>, granting ' +
			prettify(game.global.totalSquaredReward) +
			'% extra attack and health, and ' +
			prettify(game.global.totalSquaredReward / 10) +
			'% extra ' +
			heliumOrRadon() +
			'.';
	} else {
		tooltipObj.tooltipText += '<p>You are currently gaining ' + prettify(game.global.totalSquaredReward) + '% extra attack and health, and are gaining ' + prettify(game.global.totalSquaredReward / 10) + '% extra ' + heliumOrRadon() + ' thanks to your Challenge<sup>' + sup + '</sup> bonus.</p>';
	}

	if (game.talents.headstart.purchased) {
		tooltipObj.tooltipText += '<p><b>Note that your Headstart mastery will be disabled during Challenge<sup>' + sup + '</sup> runs.</b></p>';
	}

	if (portalUniverse === 1 && uniArray[0] >= 35000) {
		const color = uniArray[0] >= 50000 ? " style='color: red;'" : '';
		const extra = uniArray[0] >= 60000 ? " You've reached this bonus and are officially done with Challenge<sup>2</sup>! Congratulations!" : '';
		tooltipObj.tooltipText += '<p><b' + color + '>Note that Challenge<sup>2</sup> Bonus is capped at ' + prettify(60000) + '%.' + extra + '</b></p>';
	}
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipGeneticistassistSettings(tooltipObj, elem) {
	if (tooltipObj.isItIn === null) {
		geneMenuOpen = true;
		elem = document.getElementById('tooltipDiv2');
		tooltipObj.tip2 = true;
		const steps = game.global.GeneticistassistSteps;
		tooltipObj.tooltipText =
			"<div id='GATargetError'></div><div>Customize the target thresholds for your Geneticistassist! Use a number between 0.5 and 5000 seconds for all 3 boxes. Each box corresponds to a Geneticistassist toggle threshold.</div><div style='width: 100%'><input class='GACustomInput' id='target1' value='" +
			steps[1] +
			"'/><input class='GACustomInput' id='target2' value='" +
			steps[2] +
			"'/><input class='GACustomInput' id='target3' value='" +
			steps[3] +
			"'/><hr class='noBotMarg'/><div class='maxCenter'>" +
			getSettingHtml(game.options.menu.gaFire, 'gaFire') +
			getSettingHtml(game.options.menu.geneSend, 'geneSend') +
			"</div><hr class='noTopMarg'/><div id='GADisableCheck'>" +
			buildNiceCheckbox('disableOnUnlockCheck', null, game.options.menu.GeneticistassistTarget.disableOnUnlock) +
			'&nbsp;Start disabled when unlocked each run</div></div>';
		tooltipObj.costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='customizeGATargets();'>Confirm</div> <div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
		elem.style.left = '33.75%';
		elem.style.top = '25%';
	}

	return [tooltipObj, elem];
}

function tooltipConfigureMaps(tooltipObj, elem) {
	if (tooltipObj.isItIn === null) {
		geneMenuOpen = true;
		elem = document.getElementById('tooltipDiv2');
		tooltipObj.tip2 = true;
		tooltipObj.tooltipText = "<div id='GATargetError'></div><div>Customize your settings for running maps!</div>";
		tooltipObj.tooltipText += "<hr class='noBotMarg'/><div class='maxCenter'>";
		let settingCount = 0;
		if (game.global.totalPortals >= 1) {
			tooltipObj.tooltipText += getSettingHtml(game.options.menu.mapLoot, 'mapLoot', null, 'CM');
			settingCount++;
		}
		if (game.global.totalPortals >= 1) {
			tooltipObj.tooltipText += getSettingHtml(game.options.menu.repeatVoids, 'repeatVoids', null, 'CM');
			settingCount++;
		}
		if (settingCount % 2 === 0) tooltipObj.tooltipText += '<br/><br/>';
		tooltipObj.tooltipText += '<div class="optionContainer"><div class="noselect settingsBtn ' + (game.global.repeatMap ? 'settingBtn1' : 'settingBtn0') + '" id="repeatBtn2" onmouseover="tooltip(\'Repeat Map\', null, tooltipObj.event)" onmouseout="tooltip(\'hide\')" onclick="repeatClicked()">' + (game.global.repeatMap ? 'Repeat On' : 'Repeat Off') + '</div></div>';
		settingCount++;
		if (settingCount % 2 === 0) tooltipObj.tooltipText += '<br/><br/>';
		tooltipObj.tooltipText += getSettingHtml(game.options.menu.repeatUntil, 'repeatUntil', null, 'CM');
		settingCount++;
		if (settingCount % 2 === 0) tooltipObj.tooltipText += '<br/><br/>';
		tooltipObj.tooltipText += getSettingHtml(game.options.menu.exitTo, 'exitTo', null, 'CM');
		settingCount++;
		if (game.options.menu.mapsOnSpire.lockUnless() && game.global.universe === 1) {
			if (settingCount % 2 === 0) tooltipObj.tooltipText += '<br/><br/>';
			tooltipObj.tooltipText += getSettingHtml(game.options.menu.mapsOnSpire, 'mapsOnSpire', null, 'CM');
			settingCount++;
		}
		if (game.global.canMapAtZone) {
			if (settingCount % 2 === 0) tooltipObj.tooltipText += '<br/><br/>';
			tooltipObj.tooltipText += getSettingHtml(game.options.menu.mapAtZone, 'mapAtZone', null, 'CM');
			settingCount++;
		}
		if (game.global.highestLevelCleared >= 124) {
			if (settingCount % 2 === 0) tooltipObj.tooltipText += '<br/><br/>';
			tooltipObj.tooltipText += getSettingHtml(game.options.menu.climbBw, 'climbBw', null, 'CM');
			settingCount++;
		}
		if (settingCount % 2 === 0) tooltipObj.tooltipText += '<br/><br/>';

		tooltipObj.tooltipText += getSettingHtml(game.options.menu.extraMapBtns, 'extraMapBtns', null, 'CM');
		settingCount++;
		tooltipObj.tooltipText += '</div>';
		tooltipObj.costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip();'>Close</div></div>";
		elem.style.left = '33.75%';
		elem.style.top = '25%';
	}

	return [tooltipObj, elem];
}

function tooltipSetMapAtZone(tooltipObj, elem) {
	const maxSettings = game.options.menu.mapAtZone.getMaxSettings();
	let mazHelp =
		"Welcome to Map at Zone (also referred to as MaZ)! This is a powerful automation tool that allows you to set when maps should be automatically run, and allows for a high amount of customization. Here's a quick overview of tooltipObj.what everything does:<ul><li><span style='padding-left: 0.3%' class='mazDelete'><span class='icomoon icon-cross'></span></span> - Remove this MaZ line completely</li><li><b>Active</b> - A toggle to temporarily disable/enable the entire MaZ line.</li><li><b>Start Zone</b> - The first Zone that this MaZ line should run. Must be between 10 and 1000.</li><li><b>End Zone</b> - Only matters if you're planning on having this MaZ line repeat. If so, the line will stop repeating at this Zone. Must be between 10 and 1000.</li><li><b>Exit At Cell</b> - The cell number between 1 and 100 where this MaZ line should trigger. 1 is the first cell of the Zone, 100 is the final cell. This line will trigger before starting combat against that cell.</li><li><b>Priority</b> - If there are two or more MaZ lines set to trigger at the same cell on the same Zone, the line with the lowest priority will run first. This also determines sort order of lines in the UI.</li><li><b>Run Map</b> - Uncheck this box if you want Map at Zone to just put you into the Map Chamber without running a map. This will stall your run at a specified point until manual intervention.</li><li><b>Use Preset</b> - Select one of your Advanced Maps presets here, to determine tooltipObj.what type of map should be created by this MaZ line. You can also choose to run Void Maps or some specific Unique Maps from this dropdown depending on game progress.</li><li><b>Map Repeat</b> - This will toggle your Map Repeat setting On, Off, or leave it as is every time this MaZ line triggers. Set to Repeat On if you want the map to run more than once.</li>";
	mazHelp +=
		"<li><b>Set Repeat Until</b> - This changes your 'Repeat to' setting to the selected choice, allowing you to customize how many times the map should be repeated. If 'Run Bionic' is selected as your Preset, you can select the option 'Climb BW to Level' in this dropdown which will automatically climb Bionic Wonderlands until the set level of map has been cleared of items, then will exit the map.</li><li><b>Exit To</b> - Ensure you're Exiting to World if you want the game to continue progressing after the maps have been completed, or set Exit to Maps if you want the game to wait for manual intervention after completing its map.</li><li><b>Zone Repeat</b> - Set how often this preset should repeat between the Start Zone and End Zone. Preset can be repeated every Zone, or set to a custom number depending on need. Note that when using Zone Repeat with 'Climb BW to Level' that your 'Climb To' setting will be increased by the amount of Zones in between Start Zone and the Zone where this line actually triggers. For example, starting a MaZ line at Z140 to climb BW to Z165 with repeat every 30 Zones will run through BW 165 on Z140, then at Z170 will run through BW 195.</li></ul>";
	tooltipObj.tooltipText =
		"<div id='mazContainer' style='display: block'><div id='mazError'></div><div class='row mazRow titles'><div class='mazCheckbox' style='width: 6%'>Active?</div><div class='mazWorld'>Start<br/>Zone</div><div class='mazThrough'>End<br/>Zone</div><div class='mazCell'>Exit At<br/>Cell</div><div class='mazPrio'>Priority</div><div class='mazCheckbox'>Run Map?</div><div class='mazPreset'>Use<br/>Preset</div><div class='mazRepeat'>Map<br/>Repeat</div><div class='mazRepeatUntil'>Set<br/>Repeat Until</div><div class='mazExit'>Exit To</div><div class='mazTimes'>Zone<br/>Repeat</div></div>";
	const current = game.options.menu.mapAtZone.getSetZone();
	for (let x = 0; x < maxSettings; x++) {
		const vals = {
			world: -1,
			cell: 1,
			check: true,
			preset: 0,
			repeat: 0,
			until: 0,
			exit: 0,
			bwWorld: 125,
			times: -1,
			on: true,
			through: 999,
			rx: 10,
			prio: x + 1,
			tx: 10
		};
		let style = '';
		if (current.length - 1 >= x) {
			vals.world = current[x].world;
			vals.check = current[x].check;
			vals.preset = current[x].preset;
			vals.repeat = current[x].repeat;
			vals.until = current[x].until;
			vals.exit = current[x].exit;
			vals.bwWorld = current[x].bwWorld;
			vals.times = current[x].times ? current[x].times : -1;
			vals.cell = current[x].cell ? current[x].cell : 1;
			vals.on = current[x].on === false ? false : true;
			vals.through = current[x].through ? current[x].through : 999;
			vals.rx = current[x].rx ? current[x].rx : 10;
			vals.tx = current[x].tx ? current[x].tx : 10;
		} else style = " style='display: none' ";
		let presetDropdown =
			"<option value='0'" +
			(vals.preset === 0 ? " selected='selected'" : '') +
			'>' +
			getPresetDescription(1) +
			"</option><option value='1'" +
			(vals.preset === 1 ? " selected='selected'" : '') +
			'>' +
			getPresetDescription(2) +
			"</option><option value='2'" +
			(vals.preset === 2 ? " selected='selected'" : '') +
			'>' +
			getPresetDescription(3) +
			"</option><option value='6'" +
			(vals.preset === 6 ? " selected='selected'" : '') +
			'>' +
			getPresetDescription(4) +
			"</option><option value='7'" +
			(vals.preset === 7 ? " selected='selected'" : '') +
			'>' +
			getPresetDescription(5) +
			"</option><option value='3'" +
			(vals.preset === 3 ? " selected='selected'" : '') +
			">Run Bionic</option><option value='4'" +
			(vals.preset === 4 ? " selected='selected'" : '') +
			'>Run Void</option>';

		if (game.global.universe === 2) {
			if (game.global.highestRadonLevelCleared >= 32 && game.global.stringVersion !== '5.9.2') presetDropdown += "<option value='10'" + (vals.preset === 10 ? " selected='selected'" : '') + '>Atlantrimp</option>';
			if (game.global.highestRadonLevelCleared >= 49) presetDropdown += "<option value='8'" + (vals.preset === 8 ? " selected='selected'" : '') + '>Melting Point</option>';
			if (game.global.highestRadonLevelCleared >= 69) presetDropdown += "<option value='5'" + (vals.preset === 5 ? " selected='selected'" : '') + '>Black Bog</option>';
			if (game.global.highestRadonLevelCleared >= 174) presetDropdown += "<option value='9'" + (vals.preset === 9 ? " selected='selected'" : '') + '>Frozen Castle</option>';
		}

		const repeatDropdown = "<option value='0'" + (vals.repeat === 0 ? " selected='selected'" : '') + ">No Change</option><option value='1'" + (vals.repeat === 1 ? " selected='selected'" : '') + ">On</option><option value='2'" + (vals.repeat === 2 ? " selected='selected'" : '') + '>Off</option>';
		const repeatUntilDropdown =
			"<option value='0'" +
			(vals.until === 0 ? " selected='selected'" : '') +
			">Don't Change</option><option value='1'" +
			(vals.until === 1 ? " selected='selected'" : '') +
			">Repeat Forever</option><option value='2'" +
			(vals.until === 2 ? " selected='selected'" : '') +
			">Repeat to 10</option><option value='3'" +
			(vals.until === 3 ? " selected='selected'" : '') +
			">Repeat for Items</option><option value='4'" +
			(vals.until === 4 ? " selected='selected'" : '') +
			">Repeat for Any</option><option class='mazBwClimbOption' value='5'" +
			(vals.until === 5 ? " selected='selected'" : '') +
			">Climb BW to Level</option><option value='6'" +
			(vals.until === 6 ? " selected='selected'" : '') +
			">Repeat 25 Times</option><option value='7'" +
			(vals.until === 7 ? " selected='selected'" : '') +
			">Repeat 50 Times</option><option value='8'" +
			(vals.until === 8 ? " selected='selected'" : '') +
			">Repeat 100 Times</option><option value='9'" +
			(vals.until === 9 ? " selected='selected'" : '') +
			'>Repeat X Times</option>';

		const exitDropdown = "<option value='0'" + (vals.exit === 0 ? " selected='selected'" : '') + ">No Change</option><option value='1'" + (vals.exit === 1 ? " selected='selected'" : '') + ">Maps</option><option value='2'" + (vals.exit === 2 ? " selected='selected'" : '') + '>World</option>';
		const timesDropdown =
			"<option value='-1'" +
			(vals.times === -1 ? " selected='selected'" : '') +
			">Just This Zone</option><option value='1'" +
			(vals.times === 1 ? " selected='selected'" : '') +
			">Every Zone</option><option value='2'" +
			(vals.times === 2 ? " selected='selected'" : '') +
			">Every Other Zone</option><option value='3'" +
			(vals.times === 3 ? " selected='selected'" : '') +
			">Every 3 Zones</option><option value='5'" +
			(vals.times === 5 ? " selected='selected'" : '') +
			">Every 5 Zones</option><option value='10'" +
			(vals.times === 10 ? " selected='selected'" : '') +
			">Every 10 Zones</option><option value='30'" +
			(vals.times === 30 ? " selected='selected'" : '') +
			">Every 30 Zones</option><option value='-2'" +
			(vals.times === -2 ? " selected='selected'" : '') +
			'>Every X Zones</option>';

		let className = vals.preset === 3 ? 'mazBwMainOn' : 'mazBwMainOff';
		className += vals.preset === 3 && vals.until === 5 ? ' mazBwZoneOn' : ' mazBwZoneOff';
		className += vals.until === 9 ? ' mazRxOn' : ' mazRxOff';
		className += vals.times === -2 ? ' mazTxOn' : ' mazTxOff';

		tooltipObj.tooltipText += "<div id='mazRow" + x + "' class='row mazRow " + className + "'" + style + '>';
		tooltipObj.tooltipText += "<div class='mazDelete' onclick='game.options.menu.mapAtZone.removeRow(" + x + ")'><span class='icomoon icon-cross'></span></div>";
		tooltipObj.tooltipText += "<div class='mazCheckbox' style='text-align: center;'>" + buildNiceCheckbox('mazEnableSetting' + x, null, vals.on) + '</div>';
		tooltipObj.tooltipText += "<div class='mazWorld'><input value='" + vals.world + "' type='number' id='mazWorld" + x + "'/></div>";
		tooltipObj.tooltipText += "<div class='mazThrough'><input value='" + vals.through + "' type='number' id='mazThrough" + x + "'/></div>";
		tooltipObj.tooltipText += "<div class='mazCell'><input value='" + vals.cell + "' type='number' id='mazCell" + x + "'/></div>";
		tooltipObj.tooltipText += "<div class='mazPrio'><input value='" + vals.prio + "' type='number' id='mazPrio" + x + "'/></div>";
		tooltipObj.tooltipText += "<div class='mazCheckbox' style='text-align: center;'>" + buildNiceCheckbox('mazCheckbox' + x, null, vals.check) + '</div>';
		tooltipObj.tooltipText += "<div class='mazPreset' onchange='updateMazPreset(" + x + ")'><select value='" + vals.preset + "' id='mazPreset" + x + "'>" + presetDropdown + '</select></div>';
		tooltipObj.tooltipText += "<div class='mazRepeat'><select value='" + vals.repeat + "' id='mazRepeat" + x + "'>" + repeatDropdown + '</select></div>';
		tooltipObj.tooltipText += "<div class='mazRepeatUntil' onchange='updateMazPreset(" + x + ")'><select value='" + vals.until + "' id='mazRepeatUntil" + x + "'>" + repeatUntilDropdown + '</select></div>';
		tooltipObj.tooltipText += "<div class='mazRx'><div style='text-align: center;'>X&nbsp;Times</div><input value='" + vals.rx + "' type='number' id='mazRx" + x + "'/></div>";
		tooltipObj.tooltipText += "<div class='mazBwWorld'><div style='text-align: center; margin-left: -0.5vw;'>Climb&nbsp;To</div><input value='" + vals.bwWorld + "' type='number' id='mazBwWorld" + x + "'/></div>";
		tooltipObj.tooltipText += "<div class='mazExit'><select value='" + vals.exit + "' id='mazExit" + x + "'>" + exitDropdown + '</select></div>';
		tooltipObj.tooltipText += "<div class='mazTimes select' onchange='updateMazPreset(" + x + ")'><select value='" + vals.times + "' id='mazTimes" + x + "'>" + timesDropdown + '</select></div>';
		tooltipObj.tooltipText += "<div class='mazTx'><div style='text-align: center;'>X&nbsp;Zones</div><input value='" + vals.tx + "' type='number' id='mazTx" + x + "'/></div>";
		tooltipObj.tooltipText += '</div>';
	}

	tooltipObj.tooltipText += "<div id='mazAddRowBtn' style='display: " + (current.length < maxSettings ? 'inline-block' : 'none') + "' class='btn btn-success btn-md' onclick='game.options.menu.mapAtZone.addRow()'>+ Add Row</div>";
	const currentPreset = (game.global.universe === 1 && game.options.menu.mapAtZone.U1Mode === 'a') || (game.global.universe === 2 && game.options.menu.mapAtZone.U2Mode === 'a') ? 'a' : 'b';
	tooltipObj.tooltipText += "<div id='mazSwapPresetBtn' style='display: " + (game.talents.maz.purchased ? 'inline-block' : 'none') + "' class='btn btn-" + (currentPreset === 'a' ? 'info' : 'danger') + " btn-md' onclick='game.options.menu.mapAtZone.swapPreset()'>Swap to Preset " + (currentPreset === 'a' ? 'B' : 'A') + '</div>';
	tooltipObj.tooltipText += "</div><div style='display: none' id='mazHelpContainer'>" + mazHelp + '</div>';
	tooltipObj.costText = "<div class='maxCenter'><span class='btn btn-success btn-md' id='confirmTooltipBtn' onclick='game.options.menu.mapAtZone.save()'>Save and Close (Z/Enter)</span><span class='btn btn-danger btn-md' onclick='cancelTooltip(true)'>Cancel (Esc)</span><span class='btn btn-primary btn-md' id='confirmTooltipBtn' onclick='game.options.menu.mapAtZone.save(true)'>Save</span><span class='btn btn-info btn-md' onclick='game.options.menu.mapAtZone.toggleHelp()'>Help</span></div>";
	game.global.lockTooltip = true;
	elem.style.top = '25%';
	elem.style.left = '10%';
	swapClass('tooltipExtra', 'tooltipExtraGigantic', elem);

	return [tooltipObj, elem];
}

function tooltipChangeHeirloomIcon(tooltipObj, elem) {
	tooltipObj.tooltipText = "<div style='width: 100%; height: 100%; background-color: black; text-align: center;'>";
	const heirloom = getSelectedHeirloom();
	let icons = [];

	if (heirloom.type === 'Shield') {
		icons = ['*shield3', '*shield', '*shield2', '*heart3', '*star2', '*road2', '*fast-forward', '*trophy3', '*eraser'];
	}
	if (heirloom.rarity === 12) icons.push('*qrcode2');

	if (heirloom.type === 'Staff') {
		icons = ['grain', 'apple', 'tree-deciduous', '*cubes', '*diamond', '*lab-flask', '*key', '*hour-glass', '*flag', '*feather', '*edit'];
	}
	if (heirloom.rarity === 12) icons.push('*i-cursor');

	if (heirloom.type === 'Core') {
		icons = ['adjust', '*compass', '*cog', '*battery', '*adjust', '*cloud', '*yingyang'];
	}

	for (let x = 0; x < icons.length; x++) {
		tooltipObj.tooltipText += "<div class='heirloomChangeIcon heirloomRare" + heirloom.rarity + "' onclick='saveHeirloomIcon(\"" + icons[x] + '")\'>' + convertIconNameToSpan(icons[x]) + '</div>';
	}

	tooltipObj.tooltipText += '</div>';
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	tooltipObj.costText = "<div class='maxCenter'><span class='btn btn-success btn-md' id='confirmTooltipBtn' onclick='cancelTooltip(true)'>Close</span></div>";

	return [tooltipObj, elem];
}

function tooltipChangePortalColor(tooltipObj, elem) {
	const tiers = 6;
	tooltipObj.tooltipText = "<div style='width: 100%; height: 100%; background-color: black; text-align: center;'>";

	for (let x = 1; x < tiers + 1; x++) {
		const selected = game.global.portalColor === x || (game.global.portalColor === 0 && x === 6) ? ' selected' : '';
		tooltipObj.tooltipText += "<div class='pointer portalPreview portalMk" + x + selected + "' onclick='savePortalColor(" + x + ")'>" + x + '</div>';
	}

	tooltipObj.tooltipText += '</div>';
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	tooltipObj.costText = "<div class='maxCenter'><span class='btn btn-success btn-md' id='confirmTooltipBtn' onclick='cancelTooltip(true)'>Close</span></div>";

	return [tooltipObj, elem];
}

function tooltipMessageConfig(tooltipObj, elem) {
	tooltipObj.tooltipText = "<div id='messageConfigMessage'>Here you can finely tune your message settings, to see only tooltipObj.what you want from each category. Mouse over the name of a filter for more info.</div>";
	const msgs = game.global.messages;
	const toCheck = ['Loot', 'Unlocks', 'Combat'];
	tooltipObj.tooltipText += "<div class='row'>";
	for (let x = 0; x < toCheck.length; x++) {
		const name = toCheck[x];
		tooltipObj.tooltipText += "<div class='col-xs-4'><span class='messageConfigTitle'>" + toCheck[x] + '</span><br/>';
		for (let item in msgs[name]) {
			if (item === 'essence' && game.global.highestLevelCleared < 179) continue;
			if (item === 'magma' && game.global.highestLevelCleared < 229) continue;
			if (item === 'cache' && game.global.highestLevelCleared < 59) continue;
			if (item === 'token' && game.global.highestLevelCleared < 235) continue;
			if (item === 'exp' && game.global.highestRadonLevelCleared < 49) continue;
			if (item === 'enabled') continue;

			let realName = item;
			if (item === 'helium' && game.global.universe === 2) realName = 'radon';
			if (item === 'voidMaps') {
				if (game.global.totalPortals < 1) continue;
				realName = 'Void Maps';
			}
			tooltipObj.tooltipText += "<span class='messageConfigContainer'><span class='messageCheckboxHolder'>" + buildNiceCheckbox(name + item, 'messageConfigCheckbox', msgs[name][item]) + '</span><span onmouseover=\'messageConfigHover("' + name + item + "\", tooltipObj.event)' onmouseout='tooltip(\"hide\")' class='messageNameHolder'> - " + realName.charAt(0).toUpperCase() + realName.substr(1) + '</span></span><br/>';
		}
		tooltipObj.tooltipText += '</div>';
	}

	tooltipObj.tooltipText += '</div>';
	tooltipObj.ondisplay = function () {
		verticalCenterTooltip();
	};
	game.global.lockTooltip = true;
	elem.style.top = '25%';
	elem.style.left = '25%';
	swapClass('tooltipExtra', 'tooltipExtraLg', elem);
	tooltipObj.costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip();configMessages();'>Confirm</div> <div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";

	return [tooltipObj, elem];
}

function tooltipHotkeys(tooltipObj, elem) {
	tooltipObj.tooltipText = "<table id='keybindsTable' class='table table-striped'><tbody>";
	tooltipObj.tooltipText += "<tr><td class='keybindsTitle' colspan='4'>General</td></tr>";
	tooltipObj.tooltipText += '<tr><td>K/k</td><td>Show Hot(K)eys menu</td><td>';
	if (game.global.totalPortals > 0 || game.global.portalActive) tooltipObj.tooltipText += 'T/t</td><td>Open Por(T)al Window';
	else tooltipObj.tooltipText += '</td><td>';
	tooltipObj.tooltipText += '</td></tr>';
	tooltipObj.tooltipText += '<tr><td>F5</td><td>Reload the game to the last saved point</td><td>';
	if (game.stats.totalHeirlooms.valueTotal > 0) tooltipObj.tooltipText += 'L/l</td><td>Open Heir(L)ooms Window';
	else tooltipObj.tooltipText += '</td><td>';
	tooltipObj.tooltipText += '</td></tr>';
	tooltipObj.tooltipText += '<tr><td>F11</td><td>Toggle Fullscreen</td><td>';
	if (game.stats.totalHeirlooms.valueTotal > 0) tooltipObj.tooltipText += 'C/c</td><td>Show Heirloom (C)hances on Heirlooms Window';
	else tooltipObj.tooltipText += '</td><td>';
	tooltipObj.tooltipText += '</td></tr>';
	tooltipObj.tooltipText += '<tr><td>Space</td><td>Pause (if enabled in settings)</td><td>';
	if (game.permaBoneBonuses.boosts.owned > 0) tooltipObj.tooltipText += 'O/o</td><td>W(O)rship Bone Shrine';
	else tooltipObj.tooltipText += '</td><td>';
	tooltipObj.tooltipText += '</td></tr>';
	tooltipObj.tooltipText += '<tr><td>F/f</td><td>(F)ight</td><td>';
	if (!game.portal.Equality.radLocked) tooltipObj.tooltipText += 'E/e</td><td>(E)quality';
	else tooltipObj.tooltipText += '</td><td>';
	tooltipObj.tooltipText += '</td></tr>';
	tooltipObj.tooltipText += '<tr><td>A/a</td><td>Toggle (A)utoFight</td><td>';
	if (game.global.highestRadonLevelCleared >= 74) tooltipObj.tooltipText += 'I/i</td><td>Sp(I)re Assault';
	else tooltipObj.tooltipText += '</td><td>';
	tooltipObj.tooltipText += '</td></tr>';
	tooltipObj.tooltipText += "<tr><td>Left/Right</td><td>Usable on windows with <span class='icomoon icon-arrow-left'></span> and <span class='icomoon icon-arrow-right'></span> icons</td><td></td><td></td></tr>";
	tooltipObj.tooltipText += '<tr><td>V</td><td>Open AD(V)ISOR</td><td></td><td></td></tr>';
	tooltipObj.tooltipText += '<tr><td>Esc</td><td>Close popups/menus. Open Settings if nothing else is open</td><td></td><td></td></tr>';
	if (game.global.highestLevelCleared >= 5) {
		tooltipObj.tooltipText += "<tr><td class='keybindsTitle' colspan='4'>Maps</td></tr>";
		tooltipObj.tooltipText += '<tr><td>M/m</td><td>Toggle (M)aps</td><td>R/r</td><td>Toggle Map (R)epeat</td></tr>';
		tooltipObj.tooltipText += '<tr><td>Up</td><td>Increase Map level</td><td>Down</td><td>Decrease Map level</td></tr>';
		tooltipObj.tooltipText += '<tr><td>C/c</td><td>(C)ontinue/Run Map</td><td>';
		if (game.global.canMapAtZone) tooltipObj.tooltipText += 'Z/z</td><td>Map at (Z)one';
		else tooltipObj.tooltipText += '</td><td>';
		tooltipObj.tooltipText += '</td></tr>';
	}
	if (game.global.highestLevelCleared >= 60) {
		tooltipObj.tooltipText += "<tr><td class='keybindsTitle' colspan='4'>Formations</td></tr>";
		tooltipObj.tooltipText += '<tr><td>X/x/1/Num1</td><td>No Formation</td><td>H/h/2/Num2</td><td>(H)eap</td></tr>';
		if (game.global.highestLevelCleared >= 70 || game.upgrades.Dominance.done > 0) {
			tooltipObj.tooltipText += '<tr><td>D/d/3/Num3</td><td>(D)ominance</td><td>';
			if (game.global.highestLevelCleared >= 80 || game.upgrades.Barrier.done > 0) tooltipObj.tooltipText += 'B/b/4/Num4</td><td>(B)arrier';
			else tooltipObj.tooltipText += '</td><td>';
			tooltipObj.tooltipText += '</td></tr>';
		}
		if (game.global.highestLevelCleared >= 179) {
			tooltipObj.tooltipText += '<tr><td>S/s/5/Num5</td><td>(S)cryer</td><td>';
			if (game.global.highestLevelCleared >= 239) tooltipObj.tooltipText += 'W/w/6/Num6</td><td>(W)ind';
			else tooltipObj.tooltipText += '</td><td>';
			tooltipObj.tooltipText += '</td></tr>';
		}
	}
	if (game.global.spiresCompleted > 0) {
		tooltipObj.tooltipText += "<tr><td class='keybindsTitle' colspan='4'>Personal Spire</td></tr>";
		tooltipObj.tooltipText += '<tr><td>P/p</td><td>Open S(P)ire</td><td>0/Num0</td><td>Sell a trap/tower</td></tr>';
		tooltipObj.tooltipText += "<tr><td>1-7/Num1-Num7</td><td colspan='3'>Buy a Trap/Tower</td></tr>";
	}
	tooltipObj.tooltipText += '</tbody></table>';
	tooltipObj.ondisplay = function () {
		verticalCenterTooltip();
	};
	game.global.lockTooltip = true;
	elem.style.top = '25%';
	elem.style.left = '17.5%';
	swapClass('tooltipExtra', 'tooltipExtraSuperLg', elem);
	tooltipObj.costText = "<div class='maxCenter'><div class='btn btn-danger' onclick='cancelTooltip()'>Close</div></div>";

	return [tooltipObj, elem];
}

function tooltipMastery(tooltipObj, elem) {
	if (game.global.tabForMastery) tooltipObj.tooltipText = '<p>Click to view your masteries.</p><p>You currently have <b>' + prettify(game.global.essence) + '</b> Dark Essence.</p>';
	else {
		tooltipObj.what = 'Mutators';
		tooltipObj.tooltipText = '<p>Click to view your Mutators.</p><p>You currently have <b>' + prettify(game.global.mutatedSeeds) + '</b> Mutated Seeds.</p>';
	}

	return [tooltipObj, elem];
}

function tooltipMasteryInfo(tooltipObj, elem) {
	tooltipObj.tooltipText = 'U' + game.global.universe + ' Masteries and Helpful Info:<br/><br/>';

	let highTalent = game.talents.blacksmith3.purchased ? 'blacksmith3' : game.talents.blacksmith2.purchased ? 'blacksmith2' : game.talents.blacksmith.purchased ? 'blacksmith' : 'none';

	if (highTalent === 'none') tooltipObj.tooltipText += '<b>Blacksmithery Not Purchased</b>';
	else tooltipObj.tooltipText += '<b>Blacksmithery</b><br/>' + game.talents[highTalent].description;
	tooltipObj.tooltipText += '<br/><br/>';

	highTalent = game.talents.hyperspeed2.purchased ? 'hyperspeed2' : game.talents.hyperspeed.purchased ? 'hyperspeed' : 'none';
	if (highTalent === 'none') tooltipObj.tooltipText += '<b>Hyperspeed Not Purchased</b>';
	else tooltipObj.tooltipText += '<b>Hyperspeed</b><br/>' + game.talents[highTalent].description;
	tooltipObj.tooltipText += '<br/><br/>';

	const liqCap = checkIfLiquidZone(true);
	if (!liqCap) tooltipObj.tooltipText += '<b>Liquification not owned in this Universe</b>';
	else tooltipObj.tooltipText += '<b>Liquification</b><br/>You can Liquify in this Universe through Z' + Math.floor((getHighestLevelCleared(false, true) + 1) * liqCap) + ' (' + Math.floor(liqCap * 100) + '% of your highest Zone reached).';
	tooltipObj.tooltipText += '<br/><br/>';

	if ((game.global.universe === 1 && game.portal.Overkill.level === 0) || (game.global.universe === 2 && !u2Mutations.tree.Overkill1.purchased)) {
		tooltipObj.tooltipText += '<b>Overkill not owned in this Universe</b>';
	} else {
		const okCells = getOverkillerCount(true) + 1;
		tooltipObj.tooltipText += '<b>Overkill</b><br/>You can Overkill ' + okCells + ' cell' + needAnS(okCells) + ' in this Universe';

		if (game.global.universe === 2) {
			const zmult = canU2Overkill(true);
			tooltipObj.tooltipText += ' through Z' + Math.floor((game.global.highestRadonLevelCleared + 1) * zmult) + ' (' + Math.floor(zmult * 100) + '% of your highest Zone reached).';
		} else {
			tooltipObj.tooltipText += '.';
		}
	}

	return [tooltipObj, elem];
}

function tooltipTheImprobability(tooltipObj, elem) {
	tooltipObj.tooltipText = "<span class='planetBreakMessage'>That shouldn't have happened. There should have been a Blimp there. Something is growing unstable.</span>";
	if (!game.global.autoUpgradesAvailable) tooltipObj.tooltipText += "<br/><br/><span class='planetBreakMessage'><b>Your Trimps seem to understand that they'll need to help out more, and you realize how to permanently use them to automate upgrades!<b></span><br/>";
	tooltipObj.costText =
		"<span class='planetBreakDescription'><span class='bad'>Trimp breed speed reduced by a factor of 10. 20% of enemy damage can now penetrate your block.</span><span class='good'> You have unlocked a new upgrade to learn a Formation. Helium harvested per Zone is increased by a factor of 5. Equipment cost is dramatically cheaper. Creating modified maps is now cheaper, and your scientists have found new ways to improve maps! You have access to the 'Trimp' challenge!<span></span>";
	if (challengeActive('Corrupted')) tooltipObj.costText += "<br/><br/><span class='corruptedBadGuyName'>Looks like the Corruption is starting early...</span>";
	tooltipObj.costText += "<hr/><div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>I'll be fine</div><div class='btn btn-danger' onclick='cancelTooltip(); message(\"Sorry\", \"Notices\")'>I'm Scared</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipCorruption(tooltipObj, elem) {
	if (challengeActive('Corrupted')) {
		tooltipObj.tooltipText = "<span class='planetBreakMessage'>Though you've seen the Corruption grow since the planet broke, you can now see a giant spire pumping out tons of the purple goo. Things seem to be absorbing it at a higher rate now.</span><br/>";
		tooltipObj.costText += "<span class='planetBreakDescription'><span class='bad'>Improbabilities and Void Maps are now more difficult.</span> <span class='good'>Improbabilities and Void Maps now drop 2x helium.</span></span>";
	} else {
		tooltipObj.tooltipText = game.talents.headstart.purchased ? 'Off in the distance, you can see a giant spire grow larger as you approach it.' : 'You can now see a giant spire only about 20 Zones ahead of you.';
		tooltipObj.tooltipText = "<span class='planetBreakMessage'>" + tooltipObj.tooltipText + " Menacing plumes of some sort of goopy gas boil out of the spire and appear to be tainting the land even further. It looks to you like the Zones are permanently damaged, poor planet. You know that if you want to reach the spire, you'll have to deal with the goo.</span><br/>";
		tooltipObj.costText = "<span class='planetBreakDescription'><span class='bad'>From now on as you press further through Zones, more and more corrupted cells of higher and higher difficulty will begin to spawn. Improbabilities and Void Maps are now more difficult.</span> <span class='good'>Improbabilities and Void Maps now drop 2x helium. Each corrupted cell will drop 15% of that Zone's helium reward.</span></span> ";
	}
	tooltipObj.costText += "<hr/><div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Bring it on</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipAWholeNewWorld(tooltipObj, elem) {
	tooltipObj.tooltipText =
		'<p>Fluffy has reached Evolution 8 Level 10! He levitates above the ground, then realizes he seems a bit like a showoff so he floats back down. He strikes a good balance between power and humility by just having his eyes glow a little bit; you have to admit it\'s a good look on him.</p><p>Anyways, Fluffy walks over to your Portal Device and gives it a good smack. He uses some nifty telepathic powers to inform you that you can now use your Portal Device to travel to a different Universe, one that he himself handpicked for its usefulness.</p><p>He continues to inform you that the Magma on this planet is beginning to harden, blocking later Spires behind impenetrable walls of Obsidian. If we want to have any hope of reaching them, we\'ll need a tremendous amount of energy from this new Universe!</p><p><b>You can now travel back and forth between Universe 1 - "The Helium Universe", and Universe 2 - "The Radon Universe". See the top left of your Portal for more information.</b></p>';
	tooltipObj.costText += "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Bring it on</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipChangeUniverse(tooltipObj, elem) {
	let nextUniverse, newResource, oldResource, oldPet, newPet;
	if (portalUniverse === 1) {
		nextUniverse = '2';
		newResource = 'Radon';
		oldResource = 'Helium';
		oldPet = 'Fluffy';
		newPet = 'Scruffy';
	} else {
		nextUniverse = '1';
		newResource = 'Helium';
		oldResource = 'Radon';
		oldPet = 'Scruffy';
		newPet = 'Fluffy';
	}

	tooltipObj.tooltipText = 'Click this button to have your next Portal bring you to Universe ' + nextUniverse + ' - The ' + newResource + ' Universe. ' + oldResource + ' Perks and ' + oldPet + " can't come with you, but " + oldPet + "'s good pal " + newPet + ' will be waiting for you.';
	if (game.global.totalSquaredReward < 15000 && portalUniverse === 1) tooltipObj.tooltipText += "<br/><br/><span style='color: red'>" + oldPet + ' suggests having at least 15,000% Challenge<sup>2</sup> reward bonus before heading to Universe 2, but he trusts you to make your own decisions!</span>';
	if (portalUniverse === 1 && game.global.totalRadonEarned === 0) tooltipObj.tooltipText += "<br/><br/><b>You will earn Radon instead of Helium in Universe 2. It's an entirely new Universe to explore!</b>";

	return [tooltipObj, elem];
}

function tooltipTheSpire(tooltipObj, elem) {
	tooltipObj.tooltipText =
		"<span class='planetBreakMessage'>The Spire looms menacingly above you, and you take in a deep breath of corruption. You take a look back at your Trimps to help gather some courage, and you push the door open. You slowly walk inside and are greeted by an incredibly loud, deep, human voice.<br/><br/><b>Do you know what you face? If you are defeated ten times in this place, you shall be removed from this space. If you succeed, then you shall see the light of knowledge that you seek.</b></span>";
	tooltipObj.tooltipText += "<br/><hr/><span class='planetBreakDescription'><span class='bad'>This Zone is considerably more difficult than the previous and next Zones. If 10 groups of Trimps die in combat while in the spire, the world will return to normal.</span> <span class='good'>Each cell gives more and more helium. Every 10th cell gives a larger reward, and increases all loot gained until your next portal by 2% (including helium).</span></span>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipStuffysSpire(tooltipObj, elem) {
	tooltipObj.tooltipText =
		"<span class='planetBreakMessage'>Stuffy's Spire looms menacingly above you, and you take in a deep breath of a new Mutation. You take a look back at your Trimps to help gather some courage, and you push the door open. You slowly walk inside and are greeted by an incredibly loud, deep, augmented Trimp voice.<br/><br/><b>Oh what a surprise! Scruffy the Betrayer and his little pet and their army of little pets are here on my doorstep. You may have numbers on your side, but I have Nature on mine. You will not take this Spire!</b></span>";
	tooltipObj.tooltipText +=
		"<br/><hr/><span class='planetBreakDescription'><span class='bad'>OK, you know the deal. It's a Spire, it's hard, and you have 10 lives. But there's a twist! Each 100 cells is only one Floor of this massive 1000 cell behemoth of a Spire, and you'll need to reach the top of Floor 10 to face Stuffy himself. Also Tenacity is locked to 60 minutes while in the Spire and attacking or killing any 'Natural' enemies will release toxic spores, producing similar effects as the Nova mutation for the rest of the Floor.</span>";
	tooltipObj.tooltipText += "<span class='good'> However each cell cleared in this Spire grants a compounding 0.5% bonus to Trimp Attack, Health, and Radon gain until the next Portal. Completing a whole Floor causes all bonuses earned from that Floor to be permanent, and will cause you to skip that Floor on all following Portals. You've also unlocked the ability to use a custom Equality Scaling preset on the Spire!</span></span>";

	tooltipObj.costText = "<div class='maxCenter'><div class='btn btn-info' onclick='startSpire(true)'>Stuffy Awaits</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipTheMagma(tooltipObj, elem) {
	tooltipObj.tooltipText =
		"<p>You stumble across a large locked chest, unlike anything you've ever seen. The lock looks rusty, you smack it with a rock, and it falls right off. Immediately the ground shakes and cracks beneath your feet, intense heat hits your face, and Magma boils up from the core.</p><p>Where one minute ago there was dirt, grass, and noxious fog, there are now rivers of molten rock (and noxious fog). You'd really like to try and repair the planet somehow, so you decide to keep pushing on. It's been working out well so far, there was some useful stuff in that chest!</p><hr/>";
	tooltipObj.tooltipText +=
		"<span class='planetBreakDescription'><span class='bad'>The heat is tough on your Trimps, causing each Zone to reduce their attack and health by 20% more than the last. 10% of your Nurseries will permanently close after each Zone to avoid Magma flows, and Corruption has seeped into both Void and regular Maps, further increasing their difficulty. </span><span class='good'> However, the chest contained plans and materials for the <b>Dimensional Generator</b> building, <b>" +
		prettify(tooltipObj.textString) +
		' Helium</b>, and <b>100 copies of Coordination</b>! In addition, all Zones are now worth <b>3x Helium</b>!<span></span>';
	tooltipObj.costText += "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>K</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipTheMutatedZones(tooltipObj, elem) {
	tooltipObj.tooltipText =
		"<p>Hello again! In case you don't remember me, I'm your ship's Automated Defensive Voice and Idea Synthesizing On-board Robot, also known as ADVISOR. I was relaxing in the ship when I noticed that you seemed to be approaching these Mutated Zones, and felt I should come give you a warning!<br/><br/>The Zones ahead are harder than you are used to and the patterns of the Mutations are constantly changing. However, if you manage to push through and clear them, you'll find all sorts of new rewards! If anyone can do it, it's you. I trust that Scruffy will give you a more detailed run-down of each Mutation type in the Story section of your message log.<hr/>";
	tooltipObj.tooltipText +=
		"<span class='planetBreakDescription'><span class='bad'>Mutations will now spawn with increasing frequency at Z201 and above. Mutations are extremely unstable, and using your Portal will cause them to move around to different Zones. </span><span class='good'> However, all Radon gains above Z201 are increased by <b>400x</b>, these Mutated enemies themselves drop Radon, and you'll find a brand new type of currency that you can use to Mutate your own Trimps (also note that this new currency is multiplied by your Daily Challenge Rn modifier)!<span></span>";
	tooltipObj.costText += "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Easy</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipExitSpire(tooltipObj, elem) {
	tooltipObj.tooltipText = 'This will exit the spire, and you will be unable to re-enter until your next portal. Are you sure?';
	tooltipObj.costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); endSpire()'>Exit Spire</div><div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipConfirmRespecMasteries(tooltipObj, elem) {
	if (!tooltipObj.textString) {
		tooltipObj.tooltipText = 'This will return all Dark Essence that was spent on Masteries at the cost of 20 bones. Are you sure?';
	} else {
		tooltipObj.tooltipText = 'This will return all Dark Essence that was spent on Masteries, and will use ' + (game.global.freeTalentRespecs > 1 ? 'one of ' : '') + 'your remaining ' + game.global.freeTalentRespecs + ' free Mastery Respec' + needAnS(game.global.freeTalentRespecs) + '.';
	}

	tooltipObj.costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); respecTalents(true)'>Respec</div><div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipRespecMasteries(tooltipObj, elem) {
	tooltipObj.tooltipText = '<p>Click to Respec, refunding all Dark Essence that was spent on Masteries.<p>';
	if (game.global.freeTalentRespecs > 0) {
		tooltipObj.tooltipText += '<p>Your first 3 Respecs are free, and you still have ' + game.global.freeTalentRespecs + ' left! When there are no more left, each respec will cost 20 Bones.';
	}
	tooltipObj.costText = game.global.freeTalentRespecs > 0 ? 'Free!' : (game.global.b >= 20 ? "<span class='green'>" : "<span class='red'>") + '20 Bones</span>';

	return [tooltipObj, elem];
}

function tooltipTheGeneticistassist(tooltipObj, elem) {
	tooltipObj.tooltipText = "Greetings, friend! I'm your new robotic pal <b>The Geneticistassist</b> and I am here to assist you with your Geneticists. I will hang out in your Jobs tab, and will appear every run after Geneticists are unlocked. You can customize me in Settings under 'General'!";
	tooltipObj.costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Thanks, Geneticistassist!</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipMagnetoShriek(tooltipObj, elem) {
	const shriekValue = ((1 - game.mapUnlocks.roboTrimp.getShriekValue()) * 100).toFixed(1);
	let bossName = game.global.gridArray[99].name;
	if (checkIfSpireWorld() && game.global.spireActive) {
		bossName = game.global.world === 200 ? 'Druopitee' : 'Echo of Druopitee';
	}

	let plural;
	switch (bossName) {
		case 'Improbability':
			plural = 'Improbabilities';
			break;
		case 'Echo of Druopitee':
			plural = 'Echoes of Druopitee';
			break;
		case 'Druopitee':
			plural = 'Druopitee';
			break;
		default:
			plural = bossName + 's';
			break;
	}

	tooltipObj.tooltipText = 'Your pet RoboTrimp seems to be gifted at distorting the magnetic field around certain Bad Guys, especially ' + plural + '. You can activate this ability once every 5 Zones in order to tell your RoboTrimp to reduce the attack damage of the next ' + bossName + ' by ' + shriekValue + '%. This must be reactivated each time it comes off cooldown.';
	tooltipObj.tooltipText += "<span id='roboTrimpTooltipActive' style='font-weight: bold'><br/><br/>";
	tooltipObj.tooltipText += game.global.useShriek ? 'MagnetoShriek is currently active and will fire on the next ' + bossName + '.' : 'MagnetoShriek is NOT active and will not fire.';
	tooltipObj.tooltipText += '</span>';
	tooltipObj.costText = '';
	/* elem.style.top = "55%"; */

	return [tooltipObj, elem];
}

function tooltipReset(tooltipObj, elem) {
	tooltipObj.tooltipText = "Are you sure you want to reset? This will really actually reset your game. You won't get anything cool. It will be gone. <b style='color: red'>This is not the soft-reset you're looking for. This will delete your save.</b>";
	tooltipObj.costText = "<div class='maxCenter'><div class='btn btn-danger' onclick='resetGame(false, true);unlockTooltip();tooltip(\"hide\")'>Delete Save</div> <div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipFight(tooltipObj, elem) {
	tooltipObj.tooltipText = "Send your poor Trimps to certain doom in the battlefield. You'll get cool stuff though, they'll understand. (Hotkey: F)";
	const currentSend = game.resources.trimps.getCurrentSend();
	tooltipObj.costText = currentSend > 1 ? 's' : '';
	tooltipObj.costText = prettify(currentSend) + ' Trimp' + tooltipObj.costText;

	return [tooltipObj, elem];
}

function tooltipAutoFight(tooltipObj, elem) {
	tooltipObj.tooltipText = 'Allow your Trimps to start fighting on their own whenever their town gets overcrowded. (Hotkey: A)';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipNewAchievements(tooltipObj, elem) {
	tooltipObj.tooltipText = 'The universe has taken an interest in your achievements, and has begun tracking them. You already have some completed thanks to your previous adventures, would you like to see them?';
	tooltipObj.costText = "<div class='maxCenter'><div class='btn btn-success' onclick='toggleAchievementWindow(); cancelTooltip()'>Check Achievements</div> <div class='btn btn-danger' onclick='cancelTooltip()'>No, That Sounds Dumb</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipUpgradeGenerator(tooltipObj, elem) {
	tooltipObj.tooltipText = getGeneratorUpgradeHtml();
	tooltipObj.costText = "<b style='color: red'>These upgrades persist through portal and cannot be refunded. Choose wisely! " + getMagmiteDecayAmt() + "% of your unspent Magmite will decay on portal.</b><br/><br/><div class='maxCenter'><span class='btn btn-info' onclick='cancelTooltip()'>Close</span></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	tooltipObj.ondisplay = function () {
		updateGeneratorUpgradeHtml();
		verticalCenterTooltip();
	};
	tooltipObj.titleText = "<div id='generatorUpgradeTitle'>Upgrade Generator</div><div id='magmiteOwned'></div>";

	return [tooltipObj, elem];
}

function tooltipQueue(tooltipObj, elem) {
	tooltipObj.tooltipText = 'This is a building in your queue, you\'ll need to click "Build" to build it. Clicking an item in the queue will cancel it for a full refund.';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipToxic(tooltipObj, elem) {
	tooltipObj.tooltipText = 'This Bad Guy is toxic. You will obtain ' + (game.challenges.Toxicity.lootMult * game.challenges.Toxicity.stacks).toFixed(1) + '% more resources! Oh, also, this Bad Guy has 5x attack, 2x health, your Trimps will lose 5% health each time they attack, and the toxic air is causing your Trimps to breed ' + (100 - Math.pow(game.challenges.Toxicity.stackMult, game.challenges.Toxicity.stacks) * 100).toFixed(2) + '% slower. These stacks will reset after clearing the Zone.';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipMomentum(tooltipObj, elem) {
	const stacks = game.challenges.Lead.stacks;
	tooltipObj.tooltipText = 'This Bad Guy has ' + prettify(stacks * 4) + '% more damage and health, pierces an additional ' + (stacks * 0.1).toFixed(1) + '% block, and each attack that does not kill it will cause your Trimps to lose ' + (stacks * 0.03).toFixed(2) + '% of their health.';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipCustom(tooltipObj, elem) {
	customUp = tooltipObj.textString ? 2 : 1;
	tooltipObj.tooltipText = 'Type a number below to purchase a specific amount. You can also use shorthand such as 2e5 and 200k to select that large number, or fractions such as 1/2 and 50% to select that fraction of your available workspaces.';
	if (tooltipObj.textString) tooltipObj.tooltipText += ' <b>Max of 1,000 for most perks</b>';
	tooltipObj.tooltipText += "<br/><br/><input id='customNumberBox' style='width: 50%' value='" + (!isNumberBad(game.global.lastCustomExact) ? prettify(game.global.lastCustomExact) : game.global.lastCustomExact) + "' />";
	tooltipObj.costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='numTab(5, " + tooltipObj.textString + ")'>Apply</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	tooltipObj.ondisplay = function () {
		var box = document.getElementById('customNumberBox');
		/* chrome chokes on setSelectionRange on a number box; fall back to select() */
		try {
			box.setSelectionRange(0, box.value.length);
		} catch (e) {
			box.select();
		}
		box.focus();
	};
	tooltipObj.noExtraCheck = true;

	return [tooltipObj, elem];
}

function tooltipMax(tooltipObj, elem) {
	const forPortal = tooltipObj.textString ? true : false;
	tooltipObj.tooltipText = "No reason to spend everything in one place! Here you can set the ratio of your resources to spend when using the 'Max' button. Setting this to 0.5 will spend no more than half of your resources per click, etc.";
	tooltipObj.costText = "<ul id='buyMaxUl'><li onclick='setMax(1, " + forPortal + ")'>Max</li><li onclick='setMax(0.5, " + forPortal + ")'>0.5</li><li onclick='setMax(0.33, " + forPortal + ")'>0.33</li><li onclick='setMax(0.25, " + forPortal + ")'>0.25</li><li onclick='setMax(0.1, " + forPortal + ")'>0.1</li></ul>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipExport(tooltipObj, elem) {
	const saveText = save(true);
	if (tooltipObj.textString) {
		tooltipObj.tooltipText = tooltipObj.textString + "<br/><br/><textarea id='exportArea' spellcheck='false' style='width: 100%' rows='5'>" + saveText + '</textarea>';
		tooltipObj.what = 'Thanks!';
	} else {
		tooltipObj.tooltipText = "This is your save string. There are many like it but this one is yours. Save this save somewhere safe so you can save time next time. <br/><br/><textarea spellcheck='false' id='exportArea' style='width: 100%' rows='5'>" + saveText + '</textarea>';
	}

	tooltipObj.costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip()'>Got it</div>";
	if (document.queryCommandSupported('copy')) {
		tooltipObj.costText += "<div id='clipBoardBtn' class='btn btn-success'>Copy to Clipboard</div>";
	}
	let saveName = 'Trimps Save P' + game.global.totalPortals;
	if (game.global.universe === 2 || game.global.totalRadPortals > 0) {
		saveName += ' ' + game.global.totalRadPortals + ' U' + game.global.universe;
	}
	saveName += ' Z' + game.global.world;
	tooltipObj.costText += "<a id='downloadLink' target='_blank' download='" + saveName + ".txt', href=";

	if (Blob !== null) {
		const blob = new Blob([saveText], { type: 'text/plain' });
		const uri = URL.createObjectURL(blob);
		tooltipObj.costText += uri;
	} else {
		tooltipObj.costText += 'data:text/plain,' + encodeURIComponent(saveText);
	}

	tooltipObj.costText += " ><div class='btn btn-danger' id='downloadBtn'>Download as File</div></a>";
	tooltipObj.costText += '</div>';
	tooltipObj.ondisplay = tooltips.handleCopyButton();
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipLostTime(tooltipObj, elem) {
	cancelTooltip();
	tooltipObj.tooltipText = offlineProgress.getHelpText();
	elem = document.getElementById('tooltipDiv2');
	tooltipObj.tip2 = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	tooltipObj.costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info btn-lg' onclick='cancelTooltip()'>Neat</div>";

	return [tooltipObj, elem];
}

function tooltipExportPerks(tooltipObj, elem) {
	tooltipObj.tooltipText = "It may not look like much, but all of your perks are in here! You can share this string with friends, or save it to your computer to import later!<br/><br/><textarea spellcheck='false' id='exportArea' style='width: 100%' rows='5'>" + exportPerks() + '</textarea>';
	tooltipObj.costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip()'>Got it</div>";
	if (document.queryCommandSupported('copy')) {
		tooltipObj.costText += "<div id='clipBoardBtn' class='btn btn-success'>Copy to Clipboard</div>";
	}
	tooltipObj.costText += '</div>';
	tooltipObj.ondisplay = tooltips.handleCopyButton();
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipImport(tooltipObj, elem) {
	tooltipObj.tooltipText = "Import your save string! It'll be fun, I promise.<br/><br/><textarea spellcheck='false' id='importBox' style='width: 100%' rows='5'></textarea>";
	tooltipObj.costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); load(true);'>Import</div>";
	if (playFabId !== -1) tooltipObj.costText += "<div class='btn btn-primary' onclick='loadFromPlayFab()'>Import From PlayFab</div>";
	tooltipObj.costText += "<div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	tooltipObj.ondisplay = function () {
		document.getElementById('importBox').focus();
	};

	return [tooltipObj, elem];
}

function tooltipImportPerks(tooltipObj, elem) {
	/* fixed a bug that stopped this from being usable in portal window during Hypo */
	if (!portalWindowOpen && challengeActive('Hypothermia')) {
		const portalStoryElem = document.getElementById('portalStory');
		if (portalStoryElem && game.global.viewingUpgrades) portalStoryElem.innerHTML = "<span style='color: red'>You cannot change your perks while on the Hypothermia Challenge!</span>";
		return;
	}

	tooltipObj.tooltipText = "Import your perks from a text string!<br/><br/><textarea spellcheck='false' id='perkImportBox' style='width: 100%' rows='5'></textarea>";
	tooltipObj.costText = "<p class='red'></p>";
	tooltipObj.costText += "<div id='confirmTooltipBtn' class='btn btn-info' onclick='this.previousSibling.innerText = importPerks()'>Import</div>";
	tooltipObj.costText += "<div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';
	tooltipObj.ondisplay = function () {
		document.getElementById('perkImportBox').focus();
	};

	return [tooltipObj, elem];
}

function tooltipAutoPrestige(tooltipObj, elem) {
	tooltipObj.tooltipText =
		'<p>Your scientists have come a long way since you first crashed here, and can now purchase prestige upgrades automatically for you with hardly any catastrophic mistakes. They understand the word "No" and the following three commands: </p><p><b>AutoPrestige All</b> will always purchase the cheapest prestige available first.</p><p><b>Weapons Only</b> as you may be able to guess, will only purchase Weapon prestiges.</p><p><b>Weapons First</b> will only purchase Weapon prestiges unless the cheapest Armor prestige is less than 5% of the cost of the cheapest Weapon. If there are no Weapon prestiges available, the cheapest Armor prestige will be purchased only if its cost is 5% or less of your total resources.</p>';

	return [tooltipObj, elem];
}

function tooltipAutoUpgrade(tooltipObj, elem) {
	tooltipObj.tooltipText = 'Your scientists can finally handle some upgrades on their own! Toggling this on will cause most upgrades to be purchased automatically. Does not include equipment prestiges or upgrades that would trigger a confirmation popup.';

	return [tooltipObj, elem];
}

function tooltipRecycleAll(tooltipObj, elem) {
	tooltipObj.tooltipText = 'Recycle all maps below the selected level.';

	return [tooltipObj, elem];
}

function tooltipPlayFabLogin(tooltipObj, elem) {
	if (typeof nw !== 'undefined') return;
	const tipHtml = getPlayFabLoginHTML();
	tooltipObj.tooltipText = tipHtml[0];
	tooltipObj.costText = tipHtml[1];
	game.global.lockTooltip = true;
	elem.style.top = '15%';
	elem.style.left = '25%';
	swapClass('tooltipExtra', 'tooltipExtraLg', elem);
	tooltipObj.noExtraCheck = true;

	return [tooltipObj, elem];
}

function tooltipPlayFabConflict(tooltipObj, elem) {
	tooltipObj.tooltipText =
		'It looks like your save stored at PlayFab is further along than the save on your computer.<br/><b>Your save on PlayFab has earned ' +
		prettify(tooltipObj.textString) +
		' total Helium, defeated Zone ' +
		tooltipObj.attachFunction +
		', and cleared ' +
		prettify(tooltipObj.numCheck) +
		' total Zones. The save on your computer only has ' +
		prettify(game.global.totalHeliumEarned) +
		' total Helium, has defeated Zone ' +
		game.global.highestLevelCleared +
		', and cleared ' +
		prettify(game.stats.zonesCleared.value + game.stats.zonesCleared.valueTotal) +
		' total Zones.</b><br/>Would you like to Download your save from PlayFab, Overwrite your online save with this one, or Cancel and do nothing?';
	tooltipObj.costText = "<span class='btn btn-primary' onclick='playFabFinishLogin(true)'>Download From PlayFab</span><span class='btn btn-warning' onclick='playFabFinishLogin(false)'>Overwrite PlayFab Save</span><span class='btn btn-danger' onclick='cancelPlayFab();'>Cancel</span>";
	game.global.lockTooltip = true;
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipDominationDominating(tooltipObj, elem) {
	tooltipObj.what = 'Domination: Dominating';
	tooltipObj.noExtraCheck = true;
	tooltipObj.tooltipText = 'This Bad Guy is Dominating! It has 2.5x attack, 7.5x health, and heals for 5% of its max health after each attack. However, it will also drop 3x Helium!';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipDominationWeak(tooltipObj, elem) {
	tooltipObj.what = 'Domination: Weak';
	tooltipObj.noExtraCheck = true;
	tooltipObj.tooltipText = 'This Bad Guy is having its power siphoned by an even worse Bad Guy! It deals 90% less damage and has 90% less health.';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipFireTrimps(tooltipObj, elem) {
	if (!game.global.firing) {
		tooltipObj.tooltipText = 'Activate firing mode, turning the job buttons red, and forcing them to fire trimps rather than hire them. The newly unemployed Trimps will start breeding instead of working, but you will not receive a refund on resources.';
	} else {
		tooltipObj.tooltipText = 'Disable firing mode';
	}

	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipMaps(tooltipObj, elem) {
	if (!game.global.preMapsActive) {
		tooltipObj.tooltipText = 'Travel to the Map Chamber. Maps are filled with goodies, and for each max level map you clear you will gain a 20% stacking damage bonus for that Zone (stacks up to 10 times). (Hotkey: M)';
	} else {
		tooltipObj.tooltipText = 'Go back to the World Map. (Hotkey: M)';
	}
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipError(tooltipObj, elem) {
	game.global.lockTooltip = true;
	const returnObj = tooltips.showError(tooltipObj.textString);
	tooltipObj.tooltipText = returnObj.tooltip;
	tooltipObj.costText = returnObj.tooltipObj.costText;
	tooltipObj.ondisplay = tooltips.handleCopyButton();
	elem.style.left = '33.75%';
	elem.style.top = '25%';

	return [tooltipObj, elem];
}

function tooltipScaleEqualitySettings(tooltipObj, elem) {
	let state = game.portal.Equality.getSetting('scalingActive', equalitySlidersTip) ? 'On' : 'Off';
	if (game.global.stringVersion === '5.9.2') state = game.portal.Equality.scalingActive ? 'On' : 'Off';

	if (tooltipObj.textString) {
		if (tooltipObj.textString) tooltipText = '<div style="font-size: 1.7vh"><div class="maxCenter"><div style="width: 50%; margin-left: 25%" role="button" class="noselect pointer portalThing thing perkColorOff changingOff equalityColor' + state + '" id="equalityScaling2" onclick="toggleEqualityScale(true)"><span class="thingName">Scale Equality</span><br><span class="thingOwned"><span id="equalityScalingState2">' + state + '</span></span></div></div><br/>';
	} else {
		tooltipObj.tooltipText = '';
	}

	tooltipObj.tooltipText += getEqualitySliders();
	if (tooltipObj.textString) tooltipObj.tooltipText += '</div>';
	game.global.lockTooltip = true;
	elem.style.left = '4.5%';
	elem.style.top = '1%';
	swapClass('tooltipExtra', 'tooltipExtraEquality', elem);

	let spireBtn = '';
	if (game.global.highestRadonLevelCleared >= 299 && game.global.stringVersion !== '5.9.2') {
		spireBtn = "<span id='spireEqualityToggle' onclick='toggleSpireEquality(" + tooltipObj.textString + ")' class='btn btn-primary'>" + (equalitySlidersTip == 'reg' ? 'Show Spire Settings' : 'Show Regular Settings') + '</span>';
		tooltipObj.what += equalitySlidersTip == 'reg' ? ' (Regular Settings)' : ' (Spire Settings)';
	}

	tooltipObj.costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Done</div>" + spireBtn + '</div>';
	tooltipObj.ondisplay = function () {
		verticalCenterTooltip();
	};

	return [tooltipObj, elem];
}

function tooltipEqualityScaling(tooltipObj, elem) {
	const activeLevels = game.portal.Equality.getActiveLevels();
	let scalingSetting = game.portal.Equality.getSetting('scalingSetting');
	if (game.global.stringVersion === '5.9.2') scalingSetting = game.portal.Equality.scalingSetting;

	tooltipObj.tooltipText = '<p>You can enable or disable Equality Scaling at any time.</p><p>With Equality Scaling On, each Portal starts with 0 levels of Equality active. If a group of Trimps dies after attacking <b>' + scalingSetting + '</b> or fewer time' + needAnS(scalingSetting) + ', one level of Equality will activate, up to your purchased level of Equality.';
	tooltipObj.tooltipText += '</p><p><b>You currently have ' + activeLevels + ' stack' + needAnS(activeLevels) + ' of Equality active.</b></p>';
	if (!tooltipObj.textString) tooltipObj.tooltipText += '<p><b>Ctrl Click this button to customize your Equality settings.</b></p>';
	else tooltipObj.tooltipText += '<p>(Hotkey: E)</p>';

	return [tooltipObj, elem];
}

function tooltipConfirm(tooltipObj, elem) {
	if (!tooltipObj.renameBtn) tooltipObj.renameBtn = 'Confirm';
	tooltipObj.what = tooltipObj.numCheck;
	tooltipObj.tooltipText = tooltipObj.textString;
	if (tooltipObj.attachFunction === null) tooltipObj.attachFunction = '';
	if (!tooltipObj.noHide) tooltipObj.attachFunction = tooltipObj.attachFunction + '; cancelTooltip()';
	tooltipObj.attachFunction = tooltipObj.attachFunction ? ' onclick="' + tooltipObj.attachFunction + '"' : '';
	if (tooltipObj.what !== 'Spire Assault') tooltipObj.costText = ' <div class="maxCenter" id="confirmTipCost"><div id="confirmTooltipBtn" class="btn btn-info"' + tooltipObj.attachFunction + '>' + tooltipObj.renameBtn + '</div>';
	if (!tooltipObj.hideCancel) tooltipObj.costText += '<div class="btn btn-danger" onclick="cancelTooltip()">Cancel</div>';
	tooltipObj.costText += '</div>';
	game.global.lockTooltip = true;
	if (tooltipObj.numCheck === 'Alchemy' || tooltipObj.numCheck === 'Spire Assault') {
		elem.style.top = '0%';
		elem.style.left = '5%';
		swapClass('tooltipExtra', 'tooltipExtraBiggest', elem);
	} else if (tooltipObj.numCheck === "Stuffy's Spire") {
		elem.style.top = '25%';
		elem.style.left = '25%';
		swapClass('tooltipExtra', 'tooltipExtraLg', elem);
	} else {
		if (tooltipObj.renameBtn === 'Fire') elem.style.top = '50%';
		else elem.style.top = '25%';
		elem.style.left = '33.75%';
	}

	return [tooltipObj, elem];
}

function tooltipAdvMaps(tooltipObj, elem) {
	const advTips = {
		Loot: 'This slider allows you to fine tune the map Loot modifier. Moving this slider from left to right will guarantee more loot from the map, but increase the cost.',
		Size: 'This slider allows you to fine tune the map Size modifier. Moving this slider from left to right will guarantee a smaller map, but increase the cost.',
		Difficulty: 'This slider allows you to fine tune the map Difficulty modifier. Moving this slider from left to right will guarantee an easier map, but increase the cost.',
		get Biome() {
			let text = "<p>If you're looking to farm something specific, you can select the biome here. Anything other than random will increase the cost of the map.</p><ul>";
			text += '<li><b>Mountain</b> - Contains a lot of Metal</li><li><b>Forest</b> - A great place to find some Wood</li><li><b>Sea</b> - Just filled with food to catch</li><li><b>Depths</b> - Ancient Gem mines</li>';
			if (game.global.decayDone) text += '<li><b>Gardens</b> - 25% extra loot and a random assortment of resources</li>';
			if (game.global.farmlandsUnlocked) text += '<li><b>Farmlands</b> - 100% extra loot in Universe 2, 50% extra Herbs. Mimics Mountains on Z6, Forest on Z7, Sea on Z8, Depths at Z9, Gardens at Z10. Continues on rotating every World Zone.';
			text += '</ul>';

			return text;
		},
		get Special_Modifier() {
			let text = '<p>Select a special modifier to add to your map from the drop-down below! You can only add one of these to each map. The following bonuses are currently available:</p><ul>';

			for (let item in mapSpecialModifierConfig) {
				const bonusItem = mapSpecialModifierConfig[item];
				const unlocksAt = game.global.universe === 2 ? bonusItem.unlocksAt2 : bonusItem.unlocksAt;
				if ((typeof unlocksAt === 'function' && !unlocksAt()) || unlocksAt === -1) {
					continue;
				} else if (getHighestLevelCleared() + 1 < unlocksAt) {
					text += '<li><b>Next modifier unlocks at Z' + unlocksAt + '</b></li>';
					break;
				}
				text += '<li><b>' + bonusItem.name + ' (' + bonusItem.abv + ')</b> - ' + bonusItem.description + '</li>';
			}

			return text;
		},
		Show_Hide_Map_Config: 'Click this to collapse/expand the map configuration options.',
		Save_Map_Settings: 'Click this to save your current map configuration settings to your currently selected preset. These settings will load by default every time you come in to the map chamber or select this preset.',
		Reset_Map_Settings: 'Click this to reset all settings to their default positions. This will not clear your saved setting, which will still be loaded next time you enter the map chamber.',
		Extra_Zones:
			'<p>Create a map up to 10 Zones higher than your current Zone number. This map will gain +10% loot per extra level (compounding), and can drop Prestige upgrades higher than you could get from a world level map.</p><p>A green background indicates that you could afford a map at this Extra Zone amount with your selected Special Modifier and Perfect Sliders. A gold background indicates that you could afford that map with your selected Special Modifier and some combination of non-perfect sliders.</p><p>You can only use this setting when creating a max level map.</p>',
		Perfect_Sliders: '<p>This option takes all of the RNG out of map generation! If sliders are maxxed and the box is checked, you have a 100% chance to get a perfect roll on Loot, Size, and Difficulty.</p><p>You can only choose this setting if the sliders for Loot, Size, and Difficulty are at the max.</p>',
		Map_Preset: 'You can save up to 5 different map configurations to switch between at will. The most recently selected setting will load each time you enter your map chamber.'
	};

	if (tooltipObj.what === 'Special Modifier' && game.global.highestLevelCleared >= 149) {
		swapClass('tooltipExtra', 'tooltipExtraLg', elem);
		tooltipObj.renameBtn = 'forceLeft';
	}

	tooltipObj.noExtraCheck = true;
	tooltipObj.tooltipText = advTips[tooltipObj.what.replace(/ /g, '_').replace(/\//g, '_')];

	return [tooltipObj, elem];
}

function tooltipDailyStack(tooltipObj, elem) {
	tooltipObj.tooltipText = dailyModifiers[tooltipObj.what].stackDesc(game.global.dailyChallenge[tooltipObj.what].strength, game.global.dailyChallenge[tooltipObj.what].stacks);
	tooltipObj.costText = '';
	tooltipObj.what = tooltipObj.what[0].toUpperCase() + tooltipObj.what.substr(1);

	return [tooltipObj, elem];
}

function tooltipGoldenUpgrades(tooltipObj, elem) {
	const upgrade = game.goldenUpgrades[tooltipObj.what];
	const timesPurchased = upgrade.purchasedAt.length;
	const s = timesPurchased === 1 ? '' : 's';
	const three = game.global.totalPortals >= 1 || (game.global.universe === 2 && game.global.totalRadPortals === 0) ? 'three' : 'two';

	tooltipObj.tooltipText += ' <b>You can only choose one of these ' + three + ' Golden Upgrades. Choose wisely...</b><br/><br/> Each time Golden Upgrades are unlocked, they will increase in strength. You are currently gaining ' + Math.round(upgrade.currentBonus * 100) + '% from purchasing this upgrade ' + timesPurchased + ' time' + s + ' since your last portal.';

	if (tooltipObj.what === 'Void' && parseFloat((game.goldenUpgrades.Void.currentBonus + game.goldenUpgrades.Void.nextAmt()).toFixed(2)) > 0.72) {
		tooltipObj.tooltipText += "<br/><br/><b class='red'>This upgrade would put you over 72% increased Void Map chance, which would destabilize the universe. You don't want to destabilize the universe, do you?</b>";
	} else if (tooltipObj.what === 'Void') {
		tooltipObj.tooltipText += "<br/><br/><b class='green'>Note: The absolute maximum value for Golden Void is +72%. Golden Void will no longer be able to be purchased if it would increase your bonus above 72%. Plan carefully!</b>";
	}

	if (tooltipObj.what === 'Helium' && game.global.runningChallengeSquared) {
		const cMode = game.global.universe === 1 ? 2 : 3;
		tooltipObj.tooltipText += "<br/><br/><b class='red'>You can't earn " + heliumOrRadon() + ' while running a Challenge<sup>' + cMode + '</sup>!</b>';
	}
	tooltipObj.costText = 'Free';
	if (getAvailableGoldenUpgrades() > 1) tooltipObj.costText += ' (' + getAvailableGoldenUpgrades() + ' remaining)';
	const numeral = usingScreenReader ? prettify(game.global.goldenUpgrades + 1) : romanNumeral(game.global.goldenUpgrades + 1);
	if (game.global.universe === 2 && tooltipObj.what === 'Helium') tooltipObj.what = 'Radon';
	tooltipObj.what = 'Golden ' + tooltipObj.what + ' (Tier ' + numeral + ')';

	return [tooltipObj, elem];
}

function tooltipTalents(tooltipObj, elem) {
	const talent = game.talents[tooltipObj.what];
	tooltipObj.tooltipText = talent.description;
	const nextTalCost = getNextTalentCost();
	const thisTierTalents = countPurchasedTalents(talent.tier);
	if (ctrlPressed) {
		const highestAffordable = getHighestPurchaseableRow();
		const highestIdeal = getHighestIdealRow();
		const isAffordable = highestAffordable >= talent.tier;
		const isIdeal = highestIdeal >= talent.tier;

		if (thisTierTalents === 6) {
			tooltipObj.costText = "<span class='green'>You have already purchased this tier!</span>";
		} else if (isIdeal) {
			tooltipObj.costText = "<span class='green'>You must buy this entire tier to be able to spend all of your Dark Essence.</span>";
		} else if (isAffordable) {
			tooltipObj.costText = "<span class='green'>You can afford to purchase this entire tier!</span> <span class='red'>However, purchasing this entire tier right now may limit which other Masteries you can reach.</span>";
		} else {
			tooltipObj.costText = "<span class='red'>You cannot afford to purchase this entire tier.</span>";
		}
	} else {
		if (talent.purchased) tooltipObj.costText = "<span style='color: green'>Purchased</span>";
		else {
			let requiresText = false;
			if (typeof talent.requires !== 'undefined') {
				let requires;
				if (Array.isArray(talent.requires)) requires = talent.requires;
				else requires = [talent.requires];
				const needed = [];
				for (let x = 0; x < requires.length; x++) {
					if (!game.talents[requires[x]].purchased) {
						needed.push(game.talents[requires[x]].name);
					}
				}
				if (needed.length) requiresText = formatListCommasAndStuff(needed);
			}
			if (getAllowedTalentTiers()[talent.tier - 1] < 1 && thisTierTalents < 6) {
				tooltipObj.costText = "<span style='color: red'>Locked";
				const lastTierTalents = countPurchasedTalents(talent.tier - 1);

				if (lastTierTalents <= 1) tooltipObj.costText += ' (Buy ' + (lastTierTalents === 0 ? '2 Masteries' : '1 more Mastery') + ' from Tier ' + (talent.tier - 1) + ' to unlock Tier ' + talent.tier;
				else tooltipObj.costText += ' (Buy 1 more Mastery from Tier ' + (talent.tier - 1) + ' to unlock the next from Tier ' + talent.tier;
				if (requiresText) tooltipObj.costText += '. This Mastery also requires ' + requiresText;
				tooltipObj.costText += ')</span>';
			} else if (requiresText) {
				tooltipObj.costText = "<span style='color: red'>Requires " + requiresText + '</span>';
			} else if (game.global.essence < nextTalCost && prettify(game.global.essence) !== prettify(nextTalCost)) {
				tooltipObj.costText = "<span style='color: red'>" + prettify(nextTalCost) + ' Dark Essence (Use Scrying Formation to earn more)</span>';
			} else {
				tooltipObj.costText = prettify(nextTalCost) + ' Dark Essence';
				if (canPurchaseRow(talent.tier)) {
					tooltipObj.costText += "<br/><b style='color: black; font-size: 0.8vw;'>You can afford to purchase this whole row! Hold Ctrl when clicking to buy this entire row and any uncompleted rows before it.</b>";
				}
			}
		}
	}
	tooltipObj.what = talent.name;
	tooltipObj.noExtraCheck = true;

	return [tooltipObj, elem];
}

function tooltipMutator(tooltipObj, elem) {
	const mutator = u2Mutations.tree[tooltipObj.what];
	tooltipObj.tooltipText = mutator.description;
	const nextPrice = u2Mutations.nextCost();
	let problem = false;

	if (game.global.mutatedSeeds < nextPrice && !mutator.purchased) {
		tooltipObj.costText = 'You need ' + prettify(nextPrice - game.global.mutatedSeeds) + ' more Seeds to afford this!';
		problem = true;
	}

	if (!u2Mutations.checkRequirements(tooltipObj.what, true)) {
		const missingRequire = [];

		for (let x = 0; x < mutator.require.length; x++) {
			const thisRequire = u2Mutations.tree[mutator.require[x]];
			const name = thisRequire.dn ? thisRequire.dn : mutator.require[x];
			if (!thisRequire.purchased) missingRequire.push(name);
		}

		if (missingRequire.length) {
			if (problem) tooltipObj.costText += '<br/>';
			const listText = mutator.singleRequire ? listWithAnd(missingRequire, '-or-') : listWithAnd(missingRequire);
			tooltipObj.costText += 'You must first purchase ' + listText + '!';
			problem = true;
		}
	}
	if (mutator.ring && mutator.ring > 0 && u2Mutations.purchaseCount < u2Mutations.rings[mutator.ring]) {
		if (problem) tooltipObj.costText += '<br/>';
		const need = u2Mutations.rings[mutator.ring] - u2Mutations.purchaseCount;
		tooltipObj.costText += 'Purchase ' + need + ' more Mutator' + needAnS(need) + ' to unlock this ring!';
	}
	if (tooltipObj.costText) tooltipObj.costText = "<span style='color: red'>" + tooltipObj.costText + '<span>';
	if (mutator.dn) tooltipObj.what = mutator.dn;
	tooltipObj.noExtraCheck = true;

	return [tooltipObj, elem];
}

function tooltipPortalPerkInfo(tooltipObj, elem) {
	const resAppend = game.global.kongBonusMode ? ' Bonus Point' : ' ' + heliumOrRadon(true, true);
	const perkItem = game.portal[tooltipObj.what];
	const price = getPortalUpgradePrice(tooltipObj.what);
	if (!perkItem.max || perkItem.max > getPerkLevel(tooltipObj.what, true) + perkItem.levelTemp) tooltipObj.costText = prettify(price) + resAppend + needAnS(price);
	else tooltipObj.costText = '';
	tooltipObj.tooltipText += '<br/><br/><b>You have spent ' + prettify(getSpentPerkResource(tooltipObj.what, true) + perkItem.heliumSpentTemp) + ' ' + heliumOrRadon(false, true) + ' on this Perk.</b>';
	if (game.global.buyAmt === 'Max') tooltipObj.what += ' X ' + prettify(getPerkBuyCount(tooltipObj.what));
	else if (game.global.buyAmt > 1) tooltipObj.what += ' X ' + prettify(game.global.buyAmt);
	tooltipObj.what = tooltipObj.what.replace('_', ' ');

	return [tooltipObj, elem];
}

function tooltipJobs(tooltipObj, elem) {
	let buyAmt = game.global.buyAmt;
	if (buyAmt === 'Max') buyAmt = calculateMaxAfford(game.jobs[tooltipObj.what], false, false, true);

	if (game.global.firing && tooltipObj.what !== 'Amalgamator') {
		const firstChar = tooltipObj.what.charAt(0);
		const aAn = firstChar === 'A' || firstChar === 'E' || firstChar === 'I' || firstChar === 'O' || firstChar === 'U' ? ' an ' : ' a ';
		tooltipObj.tooltipText = 'Fire ' + aAn + ' ' + tooltipObj.what + '. Refunds no resources, but frees up some workspace for your Trimps.';
		tooltipObj.costText = '';
	} else {
		const workspaces = game.workspaces;
		const ignoreWorkspaces = game.jobs[tooltipObj.what].allowAutoFire && game.options.menu.fireForJobs.enabled;
		if (workspaces < buyAmt && !ignoreWorkspaces) buyAmt = workspaces;
		tooltipObj.costText = getTooltipJobText(tooltipObj.what, buyAmt);
	}

	if (tooltipObj.what === 'Amalgamator') {
		tooltipObj.noExtraCheck = true;
		tooltipObj.costText = '';
	} else if (buyAmt > 1) {
		tooltipObj.what += ' X ' + prettify(buyAmt);
	}

	return [tooltipObj, elem];
}

function tooltipBuildings(tooltipObj, elem) {
	if (tooltipObj.what !== 'Hub') tooltipObj.costText = canAffordBuilding(tooltipObj.what, false, true);

	if (game.global.buyAmt !== 1) {
		if (game.buildings[tooltipObj.what].percent || tooltipObj.what === 'Antenna') {
			tooltipObj.tooltipText += ' <b>You can only purchase 1 ' + tooltipObj.what + ' at a time.</b>';
			tooltipObj.what += ' X 1';
		} else {
			tooltipObj.what += ' X ' + prettify(game.global.buyAmt === 'Max' ? calculateMaxAfford(game.buildings[tooltipObj.what], true) : game.global.buyAmt);
		}
	}

	return [tooltipObj, elem];
}

function tooltipEquipment(tooltipObj, elem) {
	tooltipObj.costText = canAffordBuilding(tooltipObj.what, false, true, true);
	const buyAmt = game.global.buyAmt === 'Max' ? calculateMaxAfford(game.equipment[tooltipObj.what], false, true) : game.global.buyAmt;
	const equip = game.equipment[tooltipObj.what];
	const resPerStat = getEquipResPerStat(tooltipObj.what, buyAmt);
	if (tooltipObj.what === 'Shield') {
		var blockPerShield = equip.blockCalculated + equip.blockCalculated * game.jobs.Trainer.owned * (game.jobs.Trainer.modifier / 100);
		if (equip.blockNow) tooltipObj.tooltipText += ' (' + prettify(blockPerShield) + ' after Trainers)';
		tooltipObj.tooltipText += '<br/><br/>' + prettify(resPerStat) + ' wood spent per point of ' + (equip.blockNow ? 'Block' : 'Health') + '.';
	} else {
		tooltipObj.tooltipText += '<br/><br/>' + prettify(resPerStat) + ' metal spent per point of ' + (equip.attack ? 'Attack' : 'Health') + '.';
		if (game.options.menu.equipHighlight.enabled > 0 && !game.equipment.Mace.locked) {
			tooltipObj.tooltipText += ' The most efficient Attack and Health equipment';
			if (game.options.menu.equipHighlight.enabled === 1 && equip.prestige >= 2) tooltipObj.tooltipText += ' of your highest Tier';
			tooltipObj.tooltipText += ' have blue backgrounds.';
			if (equip.prestige >= 2) tooltipObj.tooltipText += ' (Search Settings for Highlight Equipment to change behavior)';
		}
	}
	if (game.global.buyAmt !== 1) {
		tooltipObj.what += ' X ' + buyAmt;
	}

	return [tooltipObj, elem];
}

function tooltipUpgrades(tooltipObj, elem) {
	const mouseOverElem = lastMousePos[0] && lastMousePos[1] ? document.elementFromPoint(lastMousePos[0], lastMousePos[1]) : null;
	if (mouseOverElem && mouseOverElem.id === 'upgradesHere') {
		cancelTooltip();
		return;
	}
	if (typeof tooltipObj.tooltipText.split('@')[1] !== 'undefined') {
		const prestigeCost = 'Your next ' + game.upgrades[tooltipObj.what].prestiges + ' will grant ' + getNextPrestigeValue(tooltipObj.what) + '.';
		tooltipObj.tooltipText = tooltipObj.tooltipText.replace('@', prestigeCost);
	}

	if (typeof tooltipObj.tooltipText.split('$')[1] !== 'undefined') {
		const upgradeTextSplit = tooltipObj.tooltipText.split('$');
		let color = game.upgrades[tooltipObj.what].specialFilter();
		color = color ? 'green' : 'red';
		tooltipObj.tooltipText = upgradeTextSplit[0] + "<span style='color: " + color + "; font-weight: bold;'>" + upgradeTextSplit[1] + '</span>';
	}

	if (typeof tooltipObj.tooltipText.split('?')[1] !== 'undefined' && tooltipObj.what !== 'Dominance') {
		const percentNum = game.global.frugalDone ? '60' : '50';
		tooltipObj.tooltipText = tooltipObj.tooltipText.replace('?', percentNum);
	}

	if (tooltipObj.what === 'Coordination') {
		const coordReplace = getPerkLevel('Coordinated') ? (25 * Math.pow(game.portal.Coordinated.modifier, getPerkLevel('Coordinated'))).toFixed(3) : 25;
		tooltipObj.tooltipText = tooltipObj.tooltipText.replace('<coord>', coordReplace);
		if (!canAffordCoordinationTrimps()) {
			let currentSend = game.resources.trimps.getCurrentSend();
			if (challengeActive('Trappapalooza')) currentSend *= 0.25;
			else currentSend *= 3;
			const trimpCount = challengeActive('Trappapalooza') ? game.resources.trimps.owned - game.resources.trimps.employed : game.resources.trimps.realMax();
			const amtToGo = Math.floor(currentSend - trimpCount);
			const s = amtToGo === 1 ? '' : 's';
			if (challengeActive('Trappapalooza')) tooltipObj.tooltipText += ' <b>You need ' + prettify(currentSend) + ' unemployeed Trimps available.';
			else tooltipObj.tooltipText += ' <b>You need enough room for ' + prettify(currentSend) + ' max Trimps.';
			tooltipObj.tooltipText += ' You are short ' + prettify(Math.floor(amtToGo)) + ' Trimp' + s + '.</b>';
		}
	}

	if (typeof game.upgrades[tooltipObj.what].name !== 'undefined') tooltipObj.what = game.upgrades[tooltipObj.what].name;

	return [tooltipObj, elem];
}

function tooltipMapsHelp(tooltipObj, elem) {
	tooltipObj.tooltipText = 'This is a map. Click it to see its properties or to run it. Maps can be run as many times as you want.';
	tooltipObj.costText = '';

	return [tooltipObj, elem];
}

function tooltipCustomText(tooltipObj, elem) {
	tooltipObj.costText = tooltipObj.attachFunction ? tooltipObj.attachFunction : '';
	tooltipObj.tooltipText = tooltipObj.textString;
	tooltipObj.noExtraCheck = true;
	if (tooltipObj.event === 'lock') {
		if (tooltipObj.what === 'Spire Settings') {
			swapClass('tooltipExtra', 'tooltipExtraLg', elem);
			elem.style.left = '25%';
		} else {
			elem.style.left = '33.75%';
		}
		elem.style.top = '25%';
		game.global.lockTooltip = true;
		if (!tooltipObj.attachFunction) tooltipObj.costText = '<div class="btn btn-danger" onclick="cancelTooltip()">Close</div>';
		tooltipObj.event = 'update';
	}

	if (tooltipObj.numCheck === 'center') {
		tooltipObj.ondisplay = function () {
			verticalCenterTooltip();
		};
	}

	return [tooltipObj, elem];
}

function tooltipNoExtraCheck(tooltipObj) {
	const tooltipText = tooltipObj.tooltipText;
	const tipSplit = tooltipText.split('$');
	const toTip = tooltipObj.toTip;
	if (typeof tipSplit[1] !== 'undefined') {
		if (tipSplit[1] === 'incby') {
			let increase = toTip.increase.by;
			if (toTip.increase.what === 'trimps.max' && challengeActive('Downsize')) increase = 1;
			if (getPerkLevel('Carpentry') && toTip.increase.what === 'trimps.max') increase *= Math.pow(1.1, getPerkLevel('Carpentry'));
			if (getPerkLevel('Carpentry_II') && toTip.increase.what === 'trimps.max') increase *= 1 + game.portal.Carpentry_II.modifier * getPerkLevel('Carpentry_II');
			if (game.global.expandingTauntimp) increase *= game.badGuys.Tauntimp.expandingMult();
			increase *= alchObj.getPotionEffect('Elixir of Crafting');
			tooltipObj.tooltipText = tipSplit[0] + prettify(increase) + tipSplit[2];
			tooltipObj.tooltipText = tooltipObj.tooltipText.replace('{s}', needAnS(increase));
		} else if (tooltipObj.isItIn === 'jobs' && toTip.increase !== 'custom') {
			let newValue = toTip[tipSplit[1]];
			if (getPerkLevel('Motivation') > 0) newValue *= 1 + getPerkLevel('Motivation') * 0.05;
			if (getPerkLevel('Motivation_II') > 0) newValue *= 1 + getPerkLevel('Motivation_II') * game.portal.Motivation_II.modifier;
			if (challengeActive('Frigid')) newValue *= game.challenges.Frigid.getShatteredMult();
			if (game.permaBoneBonuses.multitasking.owned > 0 && game.resources.trimps.owned >= game.resources.trimps.realMax()) newValue *= 1 + game.permaBoneBonuses.multitasking.mult();
			if (challengeActive('Alchemy')) newValue *= alchObj.getPotionEffect('Potion of Finding');
			newValue *= alchObj.getPotionEffect('Elixir of Finding');
			if (game.global.pandCompletions) newValue *= game.challenges.Pandemonium.getTrimpMult();
			if (game.global.desoCompletions) newValue *= game.challenges.Desolation.getTrimpMult();
			if (!game.portal.Observation.radLocked && game.global.universe === 2 && game.portal.Observation.trinkets > 0) newValue *= game.portal.Observation.getMult();
			if (Fluffy.isRewardActive('gatherer')) newValue *= 2;
			tooltipObj.tooltipText = tipSplit[0] + prettify(newValue) + tipSplit[2];
		} else {
			tooltipObj.tooltipText = tipSplit[0] + prettify(toTip[tipSplit[1]]) + tipSplit[2];
		}
	}

	if (tooltipObj.isItIn === 'buildings' && tooltipObj.what.split(' ')[0] === 'Warpstation' && game.global.lastWarp) {
		tooltipObj.tooltipText += '<b> You had ' + game.global.lastWarp + ' Warpstations when you purchased your last Gigastation (' + game.upgrades.Gigastation.done + ').</b>';
	}

	if (typeof tooltipObj.tooltipText.split('~') !== 'undefined') {
		let percentIncrease = game.upgrades.Gymystic.done;
		let text = '.';
		if (percentIncrease > 0) {
			percentIncrease += 4;
			text = ' and increases the base block of all Gyms by ' + percentIncrease + '% (compounding).';
		}
		tooltipObj.tooltipText = tooltipObj.tooltipText.replace('~', text);
	}

	return tooltipObj;
}
