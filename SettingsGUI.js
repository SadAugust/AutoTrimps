function automationMenuSettingsInit() {
	const settingsRow = document.getElementById('settingsRow');
	const autoSettings = document.createElement('DIV');
	autoSettings.id = 'autoSettings';
	autoSettings.style.display = 'none';
	autoSettings.style.maxHeight = '92.5vh';
	autoSettings.style.overflow = 'auto';
	autoSettings.classList.add('niceScroll');
	settingsRow.appendChild(autoSettings);
}

function initialiseAllTabs() {
	const addTabsDiv = document.createElement('div');
	const addtabsUL = document.createElement('ul');
	addtabsUL.id = 'autoTrimpsTabBarMenu';
	addtabsUL.className = 'tab';
	addtabsUL.style.display = 'none';
	const settingsRow = document.getElementById('settingsRow');
	settingsRow.insertBefore(addtabsUL, settingsRow.childNodes[2]);

	const tabs = [
		['Core', 'Core - Main Controls for the script'],
		['Jobs', 'Geneticassist Settings'],
		['Buildings', 'Building Settings'],
		['Equipment', 'Equipment Settings'],
		['Combat', 'Combat & Stance Settings'],
		['Maps', 'Maps - Auto Maps Settings'],
		['Challenges', 'Challenges - Settings for Specific Challenges'],
		['C2', 'C2 - Settings for C2s'],
		['Daily', 'Dailies - Settings for Dailies'],
		['Heirloom', 'Heirloom Settings'],
		['Golden', 'Golden Upgrade Settings'],
		['Spire', 'Spire - Settings for Spires'],
		['Magma', 'Dimensional Generator & Magmite Settings'],
		['Nature', 'Nature Settings'],
		['Fluffy', 'Fluffy Evolution Settings'],
		['Time Warp', 'Time Warp Settings'],
		['Display', 'Display & Spam Settings'],
		['Import Export', 'Import & Export Settings'],
		['Help', 'Helpful information (hopefully)'],
		['Test', 'Basic testing functions - Should never be seen by users'],
		['Beta', "Beta features - Should never be seen by users as they aren't user ready"]
	];

	tabs.forEach(([tabName, tabDescription]) => _createTab(tabName, tabDescription, addTabsDiv, addtabsUL));

	_createControlTab('x', 'autoToggle', 'Exit', addtabsUL);
	_createControlTab('+', '_maximizeAllTabs', 'Maximize all tabs', addtabsUL);
	_createControlTab('-', '_minimizeAllTabs', 'Minimize all tabs', addtabsUL);

	document.getElementById('autoSettings').appendChild(addTabsDiv);
	document.getElementById('Core').style.display = 'block';
	document.getElementsByClassName('tablinks')[0].className += ' active';
}

function _createTab(tabName, tabDescription, addTabsDiv, addtabsUL) {
	const tabItem = document.createElement('li');
	const tabLink = document.createElement('a');
	tabLink.className = 'tablinks';
	tabLink.setAttribute('onclick', `_toggleTab(event, '${tabName}')`);
	tabLink.href = '#';
	tabLink.appendChild(document.createTextNode(tabName));
	tabItem.id = 'tab' + tabName;
	tabItem.appendChild(tabLink);
	addtabsUL.appendChild(tabItem);

	const tabContent = document.createElement('div');
	tabContent.className = 'tabcontent';
	tabContent.id = tabName;
	const contentDiv = document.createElement('div');
	contentDiv.style.margin = '0.25vw 1vw';
	const contentHeader = document.createElement('h4');
	contentHeader.style.fontSize = '1.2vw';
	contentHeader.appendChild(document.createTextNode(tabDescription));
	contentDiv.appendChild(contentHeader);
	tabContent.appendChild(contentDiv);
	addTabsDiv.appendChild(tabContent);
}

function _createControlTab(icon, action, tooltipText, addtabsUL) {
	const controlItem = document.createElement('li');
	const controlLink = document.createElement('a');
	controlLink.className = `tablinks ${action}`;
	controlLink.setAttribute('onclick', `${action}();`);
	controlLink.appendChild(document.createTextNode(icon));
	controlItem.appendChild(controlLink);
	controlItem.style.float = 'right';
	controlItem.setAttribute('onmouseover', `tooltip("${tooltipText}", "customText", event, "${tooltipText} all of the settings tabs.")`);
	controlItem.setAttribute('onmouseout', 'tooltip("hide")');
	addtabsUL.appendChild(controlItem);
}

function _toggleTab(event, tabName) {
	const target = event.currentTarget;
	const tab = document.getElementById(tabName);

	if (target.classList.contains('active')) {
		tab.style.display = 'none';
		target.classList.remove('active');
	} else {
		tab.style.display = 'block';
		target.classList.add('active');
	}
}

function _minimizeAllTabs() {
	const tabs = document.getElementsByClassName('tabcontent');
	const links = document.getElementsByClassName('tablinks');

	for (let tab of tabs) {
		tab.style.display = 'none';
	}

	for (let link of links) {
		link.classList.remove('active');
	}
}

function _maximizeAllTabs() {
	const tabs = document.getElementsByClassName('tabcontent');
	const links = document.getElementsByClassName('tablinks');

	for (let tab of tabs) {
		if (tab.id.toLowerCase() === 'test' || tab.id.toLowerCase() === 'beta') continue;
		tab.style.display = 'block';
	}

	for (let link of links) {
		if (link.id.toLowerCase() === 'test' || link.id.toLowerCase() === 'beta') continue;
		link.style.display = 'block';
		if (!link.classList.contains('active')) {
			link.classList.add('active');
		}
	}
}

// prettier-ignore
function initialiseAllSettings() {
	const displayCore = true;
	if (displayCore) {
		createSetting('gatherType',
			function () { return (['Manual Gather', 'Auto Gather', 'Mining Only', 'Science Research Off']) },
			function () {
				let description = "<p>Controls what you gather/build.</p>";
				description += "<p><b>Manual Gather</b><br>Disables this setting.</p>";
				description += "<p><b>Auto Gather</b><br>Automatically switch your gathering between different resources and the building queue depending on what it deems necessary.</p>";
				description += "<p><b>Mining Only</b><br>Sets gather to Mining.<br>If buildings are in the queue then they will override this.<br>Only use this if you are past the early stages of the game and have Foremany unlocked.</p>";
				description += "<p><b>Science Research Off</b><br>Works the same as <b>Auto Gather</b> but stops Science from being gathered.</p>";
				description += "<p><b>Recommended:</b> Auto Gather</p>";
				return description;
			}, 'multitoggle', 1, null, 'Core', [1, 2]);
		createSetting('upgradeType',
			function () { return (['Manual Upgrades', 'Buy All Upgrades', 'Upgrades No Coords']) },
			function () {
				let description = "<p>Controls what you upgrade.</p>";
				description += "<p><b>Manual Upgrades</b><br>Disables this setting.</p>";
				description += "<p><b>Buy All Upgrades</b><br>Automatically purchases non-equipment upgrades. Equipment upgrades are controlled by settings in the <b>Equipment</b> tab.</p>";
				description += "<p><b>Upgrades no Coords</b><br>Works the same as <b>Buy All Upgrades</b> but stops Coordination upgrades from being purchased.</p>";
				description += "<p><b>Recommended:</b> Buy All Upgrades</p>";

				if (currSettingUniverse === 1) {
					description += "<p>Will purchase the following upgrades when on your next <b>Scientist</b> challenge run: ";
					if (game.global.sLevel === 0) description += "Battle, Miners, Coordination x9, Megamace, Bestplate.</p>";
					if (game.global.sLevel === 1) description += "Battle, Miners, Coordination x8, Bestplate.</p>";
					if (game.global.sLevel === 2) description += "Battle, Miners, Coordination x3, Speedminer.</p>";
					if (game.global.sLevel === 3) description += "Battle, Miners.</p>";
					if (game.global.sLevel >= 4) description += "Battle, Miners, Coordination x3, Speedminer, Egg.</p>";
				}
				return description;
			}, 'multitoggle', 1, null, 'Core', [1, 2]);
		createSetting('trapTrimps',
			function () { return ('Trap Trimps') },
			function () {
				let description = "<p>Automatically builds traps and traps trimps when needed.</p>";
				description += "<p>The upgrades setting must be set to <b>Buy All Upgrades</b> for this to work.</p>";
				description += "<p><b>Recommended:</b> On whilst highest zone is below 30</p>";
				return description;
			}, 'boolean', true, null, 'Core', [1, 2]);
		createSetting('downloadSaves',
			function () { return ('Download Saves') },
			function () { return ('Will automatically download saves when the script portals.') },
			'boolean', false, null, 'Core', [1, 2]);
		createSetting('portalVoidIncrement',
			function () { return ('Void Map Liquification') },
			function () {
				let description = "<p>Delays portaling into your Auto Portal challenge and instead " + (currSettingUniverse === 2 ? "switches to universe 1 and" : "") + " portals until your bone void map counter is 1 drop away from a guaranteed extra void map.</p>";
				description += "<p>If you have not reached the void map counter target by either zone 99 or the end of your liquification zone count then it will portal and repeat this process until you have.</p>";
				description += "<p>Additionally if you finish your run without a perk respec available this setting will portal to obtain a respec.</p>";
				description += "<p><b>Recommended:</b> " + (currSettingUniverse !== 1 ? "On" : "Off") + "</p>";
				return description;
			}, 'boolean', false, null, 'Core', [1, 2],
			function () { return (game.permaBoneBonuses.voidMaps.owned >= 5 && checkLiqZoneCount(1) >= 20) });

		createSetting('autoHeirlooms',
			function () { return ('Auto Allocate Heirlooms') },
			function () { 
				let description = "<p>Uses a modified version of the <b>Heirloom</b> calculator to identify the most optimal heirloom modifier distribution when auto portaling.</p>";
				description += "<p>There are inputs you can adjust in the <b>Heirloom</b> window to allow you to adjust how it distributes nullifium.</p>";
				description += "<p>If you want more advanced settings import your save into the <b>Heirloom</b> calculator.</p>";
				description += "<p>Will <b>only</b> allocate nullifium on heirlooms that you have bought an upgrade or swapped modifiers on.</p>";
				description += "<p><b>Recommended:</b> On</p>";
			return description;
			}, 'boolean', false, null, 'Core', [1, 2]);

		createSetting('autoPerks',
			function () { return ('Auto Allocate Perks') },
			function () {
				const calcName = currSettingUniverse === 2 ? "Surky" : "Perky";
				let description = "<p>Uses a modified version of <b>" + calcName + "</b> to identify the most optimal perk distribution when auto portaling.</p>";
				description += "<p>There are inputs you can adjust in the <b>Portal</b> window to allow you to adjust how it distributes perks.</p>";
				description += "<p>If you want more advanced settings import your save into <b>" + calcName + "</b>.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [1, 2]);

		createSetting('presetSwap',
			function () { return ('Preset Swapping') },
			function () {
				const calcName = currSettingUniverse === 2 ? "Surky" : "Perky";
				const fillerPreset = currSettingUniverse === 2 ? "Easy Radon Challenge" : "the most appropriate zone progression preset";
				const dailyPreset = currSettingUniverse === 2 ? "Difficult Radon Challenge" : "the most appropriate zone progression preset";
				const c2Preset = currSettingUniverse === 2 ? "Push/C3/Mayhem" : "Other c²";
				const universeChallenges = currSettingUniverse === 2 ? "Downsize, Duel, Berserk, Alchemy, Smithless" : "Metal, Trimp, Coord, Experience";

				let description = "<p>Will automatically swap <b>" + calcName + "</b> presets when portaling into runs.</p>";
				description += "<p>Fillers (non daily/" + _getChallenge2Info() + " runs) will load <b>" + fillerPreset + ".</b></p>";
				description += "<p>Dailies will load <b>" + dailyPreset + "</b>.</p>";
				description += _getSpecialChallengeDescription() + " runs will load <b>" + c2Preset + "</b>.</p>";

				description += "Challenges that have a dedicated preset (<b>" + universeChallenges + "</b>) will be loaded when starting that challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [1, 2],
			function () { return (getPageSetting('autoPerks', currSettingUniverse)) });

		createSetting('presetCombatRespec',
			function () {
				const trimple = currSettingUniverse === 1 ? "Trimple" : "Atlantrimp";
				return ([trimple + ' Respec Off', trimple + ' Respec Popup', trimple + ' Respec Force'])
			},
			function () {
				const calcName = currSettingUniverse === 2 ? "Surky" : "Perky";
				const trimple = currSettingUniverse === 1 ? "<b>Trimple Of Doom</b>" : "<b>Atlantrimp</b>";
				const trimpleShortened = currSettingUniverse === 1 ? "Trimple" : "Atlantrimp";

				let respecName = !trimpStats.isC3 ? "Radon " : "" + "Combat Respec";
				if (currSettingUniverse === 1) respecName = 'Spire';

				let description = '';
				if (currSettingUniverse === 1) {
					description += "<p>Will only run during the highest Spire you have reached and will respec into the Perky <b>Spire</b> preset to maximise your combat stats during it.</p>";
				}
				if (currSettingUniverse === 2) {
					description += "<p>Will respec into the <b>Combat Respec</b> preset when running " + _getSpecialChallengeDescription() + " <b>OR</b> you have more golden battle than golden radon upgrades. Otherwise it will assume it's a radon run and respec into the <b>Radon Combat Respec</b> preset.</p>";
				}

				description += "<p><b>" + trimpleShortened + " Respec Off</b><br>Disables this setting.</p>";
				description += "<p><b>" + trimpleShortened + " Respec Popup</b><br>Will display a popup after completing " + trimple + " asking whether you would like to respec into the preset listed above.</p>";
				description += "<p><b>" + trimpleShortened + " Respec Force</b><br>4 seconds after completing " + trimple + " the script will respec you into the <b>" + calcName + "</b> preset listed above to maximise combat stats. Has a popup that allows you to disable the respec.</p>";
				description += "<p>I'd recommend only using this with both the <b>Auto Allocate Perks</b> and <b>Void Map Liquification</b> settings enabled. Without these you will go into your next run in a suboptimal perk setup.</p>";

				if (currSettingUniverse === 1) description += "<p>Has an additional setting (<b>Spire Respec Cell</b>) which has a <b>5</b> second delay after toggling this setting before it will function.</p>";

				description += "<p><b>Recommended:</b> " + trimpleShortened + " Respec Off</p>";
				return description
			},
			'multitoggle', [0], null, 'Core', [1, 2],
			function () { return (game.stats.highestLevel.valueTotal() >= 170 || currSettingUniverse === 2) });

		createSetting('presetCombatRespecCell',
			function () { return ('Spire Respec Cell') },
			function () {
				const trimple = currSettingUniverse === 1 ? "<b>Trimple Of Doom</b>" : "<b>Atlantrimp</b>";
				const trimpleShortened = currSettingUniverse === 1 ? "Trimple" : "Atlantrimp";
				let description = "<p>An override for the " + trimple + " requirement for the <b>" + trimpleShortened + " Respec</b> setting. Will either give you a popup or automatically respec depending on your <b>" + trimpleShortened + " Respec</b> setting when you reach this cell and don't have any mapping to do on it.</p>";
				description += "<p>Will only function on your <b>highest Spire reached.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this way to Spire respec.</p>";
				description += "<p><b>Recommended:</b> cell after your farming has finished.</p>";
				return description;
			}, 'value', -1, null, 'Core', [1],
			function () { return (getPageSetting('presetCombatRespec', currSettingUniverse) > 0 && game.stats.highestLevel.valueTotal() >= 170) });
		createSetting('presetSwapMutators',
			function () { return ('Preset Swap Mutators') },
			function () {
				let description = "<p>Will automatically load the preset that corresponds to your run type after auto portaling.</p>";
				description += "<p>For info on which preset is loaded and when, mouseover the presets in the games <b>Mutators</b> window.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 201) });

		createSetting('universeSetting',
			function () {
				let portalOptions = ['Helium Settings'];
				if (Fluffy.checkU2Allowed()) portalOptions.push('Radon Settings');
				return portalOptions;
			},
			function () { return ('Switch between settings for universes you have unlocked.') },
			'multitoggle', 0, null, 'Core', [0]);
		let $universeSetting = document.getElementById('universeSetting');
		$universeSetting.parentNode.style.setProperty('float', 'right');
		$universeSetting.parentNode.style.setProperty('margin-right', '1.1vw');
		$universeSetting.parentNode.style.setProperty('margin-left', '0');

		createSetting('autoPortal',
			function () { return ('Auto Portal') },
			function () {
				const c2setting = currSettingUniverse === 2 ? "Challenge 3" : "Challenge 2";
				const specialChall = "Special challenges (" + (currSettingUniverse === 2 ? "Mayhem, Pandemonium, Desolation" : "Frigid, Experience") + ") can be run with this but they will ignore the " + _getChallenge2Info() + " portal settings and use the <b>Portal Zone</b> input for when to finish the run and portal.";
				let description = "<p>Will automatically portal into different challenges depending on the way you setup the Auto Portal related settings.</p>";
				description += "<p><b>" + _getPrimaryResourceInfo().name + " Challenges will appear here when they've been unlocked in the game.</b></p>";
				description += "<p>Additional settings appear when <b>" + _getPrimaryResourceInfo().name + " Per Hour</b>, <b>Custom</b> or <b>One Off Challenges</b> are selected.</p>";
				description += "<p><b>Off</b><br>Disables this setting.</p>";
				description += "<p><b>" + _getPrimaryResourceInfo().name + " Per Hour</b><br>Portals into new runs when your " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour goes below your current runs best " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour.</p>";
				description += "<p>There is a <b>Buffer</b> setting, which lowers the check from best " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour to (best - buffer setting) " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour.</p>";
				description += "<p><b>Specific Challenges</b><br>If a specific challenge has been selected it will automatically portal into it when you don't have a challenge active.</p>";
				description += "<p><b>Custom</b>/<b>One Off Challenges</b><br>Will portal into the challenge selected in the <b>Challenge</b> setting at the zone specified in the <b>Portal Zone</b> setting.</p>";
				if (game.stats.highestLevel.valueTotal() >= 65) description += "<p><b>" + c2setting + "</b><br>Will portal into the challenge selected in the <b>" + _getChallenge2Info() + "</b> setting. If not inside of a " + _getChallenge2Info() + " then it will use the zone specified in the <b>Portal Zone</b> setting. When inside of " + _getChallenge2Info() + "s it will use <b>" + _getChallenge2Info() + " Runner Portal</b> for your portal zone. If <b>" + _getChallenge2Info() + " Runner</b> is enabled otherwise will use the zone specified in the <b>Finish " + _getChallenge2Info() + "</b> setting in the " + _getChallenge2Info() + " settings tab.</p>"
				description += "<p>" + specialChall + "</p>";
				description += "<p><b>Recommended:</b> " + (currSettingUniverse === 2 ? "Custom with a specified endzone to make use of Scruffy's level 3 ability" : "Specific challenges until you reach zone 230 then " + _getPrimaryResourceInfo().name + " Per Hour") + "</p>";
				return description;
			}, 'dropdown', 'Off', function () { return autoPortalChallenges('autoPortal') }, 'Core', [1, 2]);

		createSetting('heliumHourChallenge',
			function () { return ('Challenge') },
			function () {
				let description = "<p>Automatically portal into this challenge when using the <b>" + _getPrimaryResourceInfo().name + " Per Hour</b> or <b>Custom</b> Auto Portal settings.</p>";
				description += "<p><b>" + _getPrimaryResourceInfo().name + " challenges will appear here when they've been unlocked in the game.</b></p>";
				description += "<p><b>Recommended:</b> Last challenge available</p>";
				return description;
			}, 'dropdown', 'None', function () { return autoPortalChallenges('heHr') }, 'Core', [1, 2],
			function () {
				const namesToCheck = ['Helium Per Hour', 'Radon Per Hour', 'Custom'];
				return (
					namesToCheck.indexOf(getPageSetting('autoPortal', currSettingUniverse)) !== -1);
			});

		createSetting('heliumOneOffChallenge',
			function () { return ('Challenge') },
			function () {
				let description = "<p>Automatically portal into this challenge when using the <b>One Off Challenges</b> Auto Portal setting.</p>";
				description += "<p><b>Challenges that are only worthwhile running once for perks/special unlocks will appear here when they've been unlocked in the game.</b></p>";
				description += "<p><b>Recommended:</b> Last challenge available</p>";
				return description;
			}, 'dropdown', 'None', function () { return autoPortalChallenges('oneOff') }, 'Core', [1, 2],
			function () {
				const namesToCheck = ['One Off Challenges'];
				return (
					namesToCheck.indexOf(getPageSetting('autoPortal', currSettingUniverse)) !== -1);
			});
		createSetting('heliumC2Challenge',
			function () { return (_getChallenge2Info()) },
			function () {
				const specialChall = "Special challenges (" + (currSettingUniverse === 2 ? "Mayhem, Pandemonium, Desolation" : "Frigid, Experience") + ") can be run with this but they will ignore the " + _getChallenge2Info() + " settings and use the <b>Portal Zone</b> input for when to finish the run and portal.";
				let description = "<p>Automatically portal into this C" + _getChallenge2Info()[1] + " when using the <b>Challenge " + _getChallenge2Info()[1] + "</b> Auto Portal setting.</p>";
				description += "<p>C" + _getChallenge2Info()[1] + " challenges will appear here when they've been unlocked in the game.</p>";
				description += "<p>When running a " + _getChallenge2Info() + ", <b>" + _getChallenge2Info() + " Runner Portal</b> will be used for your portal zone if <b>" + _getChallenge2Info() + " Runner</b> is enabled otherwise it will use the <b>Finish " + _getChallenge2Info() + "</b> setting. These can be found in the <b>" + _getChallenge2Info() + "</b> settings tab.</p>"
				description += "<p>" + specialChall + "</p>";
				return description;
			}, 'dropdown', 'None', function () { return autoPortalChallenges('c2') }, 'Core', [1, 2],
			function () {
				const namesToCheck = ['Helium Per Hour', 'Radon Per Hour', 'Custom'];
				return (
					getPageSetting('autoPortal', currSettingUniverse) === 'Challenge 2' || getPageSetting('autoPortal', currSettingUniverse) === 'Challenge 3' || (namesToCheck.indexOf(getPageSetting('autoPortal', currSettingUniverse)) !== -1 && getPageSetting('heliumHourChallenge', currSettingUniverse).includes('Challenge')))
			});
		createSetting('autoPortalZone',
			function () { return ('Portal Zone') },
			function () {
				let description = "<p>Will automatically portal once this zone is reached when using the <b>Custom OR One Off Challenges</b> Auto Portal settings.</p>";
				description += "<p>Setting this to <b>200</b> would portal when you reach <b>zone 200</b>.</p>";
				description += "<p>If this is set above your highest zone reached then it will allow you to pick not yet unlocked challenges up to this zone.</p>";
				description += "<p><b>Recommended:</b> The zone you would like your run to end</p>";
				return description;
			}, 'value', 999, null, 'Core', [1, 2],
			function () {
				const namesToCheck = ['Challenge 2', 'Challenge 3', 'Custom', 'One Off Challenges'];
				return (
					namesToCheck.indexOf(getPageSetting('autoPortal', currSettingUniverse)) !== -1);
			});

		createSetting('heliumHrDontPortalBefore',
			function () { return ("Don't Portal Before") },
			function () {
				let description = "<p>Will stop the script from automatically portaling before the specified zone when using the <b>" + _getPrimaryResourceInfo().name + " Per Hour</b> Auto Portal setting.</p>";
				description += "<p>This is an additional check that prevents drops in " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour from triggering Auto Portal.</p>";
				description += "<p>If this is set above your highest zone reached then it will allow you to pick not yet unlocked challenges up to this zone.</p>";
				description += "<p>The portal after checkbox in <b>Void Map Setting</b> will override this and allow portaling before the zone set here.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and assume any zone is okay to portal on.</p>";
				description += "<p><b>Recommended:</b> The minimum zone you would like your run to reach</p>";
				return description;
			}, 'value', -1, null, 'Core', [1, 2],
			function () {
				return (
					getPageSetting('autoPortal', currSettingUniverse).includes('Hour'))
			});
		createSetting('heliumHrBuffer',
			function () { return (_getPrimaryResourceInfo().abv + '/Hr Buffer %') },
			function () {
				let description = "<p>When using the <b>" + _getPrimaryResourceInfo().name + " Per Hour</b> Auto Portal setting, it will portal if your " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour drops by this settings % input lower than your best for current run.</p>";
				description += "<p>Allows portaling midzone if you exceed the set buffer amount by 5x. For example a normal 2% buffer setting would now portal mid-zone if you fall below 10% buffer.</p>";
				description += "<p><b>Set to 0 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> 4</p>";
				return description;
			}, 'value', 0, null, 'Core', [1, 2],
			function () {
				return (getPageSetting('autoPortal', currSettingUniverse).includes('Hour'))
			});
		createSetting('heliumHrPortal',
			function () {
				let hze =game.stats.highestLevel.valueTotal();
				let portalOptions =['Auto Portal Immediately', 'Portal After Voids'];
				if (currSettingUniverse === 1 && hze >= 230) portalOptions.push('Portal After Poison Voids');
				return portalOptions;
			},
			function () {
				let description = "<p>How you would like to portal when below your " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour threshold.</p>";
				description += "<p><b>Auto Portal Immediately</b><br>Will auto portal straight away.</p>";
				description += "<p><b>Portal After Voids</b><br>Will run any remaining void maps then proceed to portal.</p>";
				if (currSettingUniverse === 1 ) {
					if (game.stats.highestLevel.valueTotal() >= 230) description += "<p><b>Portal After Poison Voids</b><br>Will continue your run until you reach the next poison zone and run void maps there.</p>";
					description += "<p>When farming for, or running Void Maps due to this setting it will buy as many nurseries as you can afford based upon your spending percentage in the AT AutoStructure settings.</p>";
				}
				description += "<p><b>Recommended:</b> Portal After Voids</p>";
				return description;
			}, 'multitoggle', 0, null, 'Core', [1, 2],
			function () {
				return (getPageSetting('autoPortal', currSettingUniverse).includes('Hour'))
			});

		createSetting('heliumHrExitSpire',
			function () { return ('Exit Spires for Voids') },
			function () {
				let description = "<p>Will automatically exit Spires to run your voids earlier when the <b>" + _getPrimaryResourceInfo().name + " Per Hour</b> Auto Portal setting is wanting to portal.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [1],
			function () { return (getPageSetting('autoPortal', currSettingUniverse).includes('Hour') && game.stats.highestLevel.valueTotal() >= 170) });

		createSetting('autoPortalUniverseSwap',
			function () { return ('Swap To Next Universe') },
			function () {
				let description = "<p>Will automatically swap to the next available universe when auto portaling.</p>";
				description += "<p><b>You <b>must</b> have Auto Portal setup in both the current <b>and</b> following universe or Auto Portal will contiunue to portal into your current universe.</p>";
				description += "<p><b>If enabled in all available universes it will portal into universe 1.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Core', [1, 2],
			function () { return (Fluffy.checkU2Allowed()) });

		createSetting('pauseScript',
			function () { return ('Pause AutoTrimps') },
			function () {
				let description = "<p>Pauses the AutoTrimps script.</p>";
				description += "<p><b>Graphs will continue tracking data while paused.</b></p>";
				return description;
			}, 'boolean', null, null, 'Core', [0]);
		let $pauseScript = document.getElementById('pauseScript');
		$pauseScript.parentNode.style.setProperty('float', 'right');
		$pauseScript.parentNode.style.setProperty('margin-right', '1.2vw');
		$pauseScript.parentNode.style.setProperty('margin-left', '0');

		createSetting('autoEggs',
			function () { return ('Auto Eggs') },
			function () {
				let description = "<p>Clicks easter eggs when they are active in the world.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'Core', [0],
			function () { return (!game.worldUnlocks.easterEgg.locked) });
			let $eggSettings = document.getElementById('autoEggs');
		$eggSettings.parentNode.style.setProperty('float', 'right');
		$eggSettings.parentNode.style.setProperty('margin-right', '1vw');
		$eggSettings.parentNode.style.setProperty('margin-left', '0');
	}
	
	const displayJobs = true;
	if (displayJobs) {
		createSetting('jobType',
			function () { return (["Don't Buy Jobs", 'Auto Ratios', 'Manual Ratios']) },
			function () {
				let description = "<p>Click the left side of the button to toggle between the AutoJobs settings. Each of them will adjust the 3 primary resource jobs but you'll have to manually set the rest by clicking the cogwheel on the right side of this button.</p>";
				description += "<p><b>Don't Buy Jobs</b><br>Will disable the script from purchasing any jobs.</p>";
				description += "<p><b>Auto Ratios</b><br>Automatically adjusts the 3 primary resource job worker ratios based on current game progress. For more detailed information on this check out the Help section for this setting by clicking on the cogwheel.</p>";
				description += "<p><b>Manual Ratios</b><br>Buys jobs for your trimps according to the ratios set in the cogwheel popup.</p>";
				description += "<p>Automatically swaps the games default hiring setting <b>Not Firing For Jobs</b> to <b>Firing For Jobs</b>.</p>";
				description += "<p>Map setting job ratios always override both <b>Auto Ratios</b> & <b>Manual Ratios</b> when AutoMaps is enabled.</p>";
				return description;
			}, 'multitoggle', 1, null, 'Jobs', [1, 2],
			function () { return (false) });
		createSetting('jobSettingsArray',
			function () { return ('Job Settings') },
			function () { return ('Click to adjust settings.') },
			'mazDefaultArray', {
			Farmer: { enabled: true, ratio: 1 },
			Lumberjack: { enabled: true, ratio: 1 },
			Miner: { enabled: true, ratio: 1 },
			Explorer: { enabled: true, percent: 10 },
			Trainer: { enabled: true, percent: 25 },
			Magmamancer: { enabled: true, percent: 100 },
			Meteorologist: { enabled: true, percent: 100 },
			Worshipper: { enabled: true, percent: 5 },
			FarmersUntil: { enabled: false, zone: 999 },
			NoLumberjacks: { enabled: false }
		}, null, 'Jobs', [1, 2],
			function () { return false });
			
		createSetting('geneAssist',
			function () { return ('Gene Assist') },
			function () {
				let description = "<p>Master switch for whether the script will do any form of Geneticist purchasing.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p><b>Will disable the ingame Geneticistassist setting.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Jobs', [1]);
		createSetting('geneAssistPercent',
			function () { return ('GA: Gene Assist %') },
			function () {
				let description = "<p>Gene Assist will only hire geneticists if they cost less than this value.</p>";
				description += "<p>If this setting is 1 it will only buy geneticists if they cost less than 1% of your food.</p>";
				description += "<p>Setting this to 0 or -1 will disable all of the <b>Gene Assist</b> settings.</p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', 1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
		createSetting('geneAssistTimer',
			function () { return ('GA: Timer') },
			function () {
				let description = "<p>This is the default time your gene assist settings will use.</p>";
				description += "<p>Setting this to 0 or -1 will disable all of the <b>Gene Assist</b> settings.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistTimerHard',
			function () { return ('GA: Hard Chall Timer') },
			function () {
				let description = "<p>Gene Assist will use the value set here when running challenges that are considered hard (Nom, Toxicity, Lead). </p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>This setting is disabled if you have the <b>Angelic</b> mastery.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> 8</p>";
				return description;
			}, 'value', 8, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistTimerBleedVoids',
			function () { return ('GA: Bleed Voids') },
			function () {
				let description = "<p>Gene Assist will use the value set here when you don't have a Void Hits Survived value of Infinity and you're running bleed void maps. </p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> 6</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistTimerElectricity',
			function () { return ('GA: Electricity Timer') },
			function () {
				let description = "<p>Gene Assist will use the value set here when running the Electricity challenge. </p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>This also overwrites your breed timer in the <b>Mapocalypse</b> challenge.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> 2.5</p>";
				return description;
			}, 'value', 2.5, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistTimerSpire',
			function () { return ('GA: Spire Timer') },
			function () {
				let description = "<p>Gene Assist will use the value set here when inside of active Spires.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistZoneBefore',
			function () { return ('GA: Before Z') },
			function () {
				let description = "<p>Gene Assist will use the value set in <b>GA: Before Z Timer</b> when below this zone.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p><b>Recommended:</b> The zone where you stop 1 shotting in a new portal</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
		createSetting('geneAssistTimerBefore',
			function () { return ('GA: Before Z Timer') },
			function () {
				let description = "<p>Gene Assist will use the value set here when below the zone in <b>GA: Before Z Timer</b>.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
		createSetting('geneAssistZoneAfter',
			function () { return ('GA: After Z') },
			function () {
				let description = "<p>Gene Assist will use the value set in <b>GA: After Z Timer</b> when after this zone.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p><b>Recommended:</b> The zone where you stop 1 shotting after using your <b>GA: Timer</b> setting in a new portal</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
		createSetting('geneAssistTimerAfter',
			function () { return ('GA: After Z Timer') },
			function () {
				let description = "<p>Gene Assist will use the value set here when below the zone in <b>GA: After Z Timer</b>.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p><b>Recommended:</b> Your <b>Anticipation</b> perk timer</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistTimerDaily',
			function () { return ('GA: Daily Timer') },
			function () {
				let description = "<p>Gene Assist will use the value set here when running dailies. </p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
		createSetting('geneAssistTimerDailyHard',
			function () { return ('GA: Daily Timer Hard') },
			function () {
				let description = "<p>Gene Assist will use the value set here when running dailies that are considered hard (Plagued, Bogged). </p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>This setting won't do anything on Bogged dailies if you have the <b>Angelic</b> mastery.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
		createSetting('geneAssistTimerSpireDaily',
			function () { return ('GA: Daily Spire Timer') },
			function () {
				let description = "<p>Gene Assist will use the value set here when inside of active Spires in dailies.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> Your <b>Anticipation</b> perk timer</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistTimerC2',
			function () { return ('GA: ' + _getChallenge2Info() + ' Timer') },
			function () {
				let description = "<p>Gene Assist will use the value set here when running " + _getChallenge2Info() + "s.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> Use regular Gene Assist settings instead of this</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
		createSetting('geneAssistTimerSpireC2',
			function () { return ('GA: ' + _getChallenge2Info() + ' Spire Timer') },
			function () {
				let description = "<p>Gene Assist will use the value set here when inside of active Spires in " + _getChallenge2Info() + "s.</p>";
				description += "<p>Setting this to 0 or -1 will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> Your <b>Anticipation</b> perk timer</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
	}

	const displayBuildings = true;
	if (displayBuildings) {
		createSetting('buildingsType',
			function () { return ('AT AutoStructure') },
			function () {
				let description = "Click the left side of the button to toggle this on or off.</p>";
				description += "<p>Click the cog icon on the right side of this button to tell your Foremen what you want and when you want it.</p>";
				description += "For more detailed information for this setting check out its Help section.</p>";
				return description;
			}, 'boolean', 'true', null, 'Buildings', [1, 2],
			function () { return (false) });
		createSetting('buildingSettingsArray',
			function () { return ('Building Settings') },
			function () { return ('Click to adjust settings.') },
			'mazDefaultArray', {
			Hut: { enabled: true, percent: 80, buyMax: 200 },
			House: { enabled: true, percent: 80, buyMax: 200 },
			Mansion: { enabled: true, percent: 80, buyMax: 200 },
			Hotel: { enabled: true, percent: 80, buyMax: 200 },
			Wormhole: { enabled: false, percent: 1, buyMax: 1 },
			Resort: { enabled: true, percent: 100, buyMax: 200 },
			Gateway: { enabled: true, percent: 10, buyMax: 200 },
			Collector: { enabled: true, percent: 100, buyMax: 200 },
			Gym: { enabled: true, percent: 75, buyMax: 0 },
			Tribute: { enabled: true, percent: 20, buyMax: 0 },
			Nursery: { enabled: true, percent: 100, buyMax: 0, fromZ: 0 },
			Smithy: { enabled: true, percent: 100, buyMax: 0 },
			Laboratory: { enabled: true, percent: 100, buyMax: 0 },
			SafeGateway: { enabled: false, mapCount: 1, zone: 0, mapLevel: 0 }
		}, null, 'Buildings', [1, 2],
			function () { return false });

		createSetting('warpstation',
			function () { return ('Warpstations') },
			function () {
				let description = "<p>Enable this to allow Warpstation purchasing.</p>";
				description += "<p><b>Will only function properly with AT AutoStructure enabled.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Buildings', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 60) });
		createSetting('warpstationPct',
			function () { return ('Warpstation Percent') },
			function () {
				let description = "<p>What percentage of resources to spend on Warpstations.</p>";
				description += "<p><b>The script will still purchase Gigastations at 100% resources.</b></p>";
				description += "<p><b>Recommended:</b> 25</p>";
				return description;
			}, 'value', 25, null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled) });
		createSetting('firstGigastation',
			function () { return ('First Gigastation') },
			function () {
				let description = "<p>The amount of warpstations to purchase before your first gigastation.</p>";
				description += "<p><b>Recommended:</b> 20</p>";
				return description;
			}, 'value', 20, null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled) });
		createSetting('deltaGigastation',
			function () { return ('Delta Gigastation') },
			function () {
				let description = "<p>How many extra warpstations to buy for each gigastation.</p>";
				description += "<pSupports decimal values. For example 2.5 will buy +2/+3/+2/+3...</p>";
				description += "<p>Once your first gigastation of a run has been purchased this setting won't be evaluated again until your next run.</p>";
				description += "<p><b>You must have buy upgrades enabled!</b></p>";
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			}, 'value', 2, null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled) }
		);
		createSetting('autoGigas',
			function () { return ('Auto Gigas') },
			function () {
				let description = "<p>If enabled, the script will buy its first Gigastation if: <br>A) Has more than 2 Warps & <br>B) Can\'t afford more Coords & <br>C) (Only if Custom Delta Factor > 20) Lacking Health or Damage & <br>D) (Only if Custom Delta Factor > 20) Has run at least 1 map stack.</p>";
				description += "<p>Then, it'll calculate the delta based on your Custom Delta Factor and your Auto Portal/VM zone (whichever is higher), or Daily Auto Portal/VM zone, or " + _getChallenge2Info() + " zone, or Custom AutoGiga Zone.</p>";
				description += "<p>Once your first gigastation of a run has been purchased this setting won't be evaluated again until your next run.</p>";
				description += "<p><b>You must have the upgrades setting enabled for this setting to run!</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', 'true', null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled) });
		createSetting('autoGigaTargetZone',
			function () { return ('Custom Target Zone') },
			function () {
				let description = "<p>The zone to be used as a the target zone when calculating the Auto Gigas delta.</p>";
				description += "<pValues below 60 will be discarded.</p>";
				description += "<p>Once your first gigastation of a run has been purchased this setting won't be evaluated again until your next run.</p>";
				description += "<p><b>Recommended:</b> Current challenge end zone</p>";
				return description;
			}, 'value', -1, null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled && autoTrimpSettings.autoGigas.enabled) });
		createSetting('autoGigaDeltaFactor',
			function () { return ('Custom Delta Factor') },
			function () {
				let description = "<p>This setting is used to calculate a better Delta. Think of this setting as how long your target zone takes to complete divided by the zone you bought your first giga in.</p>";
				description += "<p>Basically, a higher number means a higher delta.</p>";
				description += "<p>Values below 1 will default to 10.</p>";
				description += "<p>Once your first gigastation of a run has been purchased this setting won't be evaluated again until your next run.</p>";
				description += "<p><b>Recommended:</b> 1-2 for very quick runs. 5-10 for regular runs where you slow down at the end. 20-100+ for very pushy runs</p>";
				return description;
			}, 'value', -1, null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled && autoTrimpSettings.autoGigas.enabled) });

		createSetting('advancedNurseries',
			function () { return ('Advanced Nurseries') },
			function () {
				let description = "<p>Will only buy nurseries if you need more health and you have more map stacks than the <b>Map Bonus Health</b> setting, which becomes a very important setting.</p>"
				description += "<p>Requires Nurseries to be setup in the AT AutoStructure setting and will only buy Nurseries if past the 'From' input. Overrides the 'Up To' input and allows you to set 0 without it buying as many as possible.</p>"
				description += "<p><b>Recommended:</b> On. Nurseries set to <b>Up To: 0</b> and <b>From: 230</b></p>";
				return description;
			},
			'boolean', true, null, 'Buildings', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 230) });
		createSetting('advancedNurseriesMapCap',
			function () { return ('AN: Hits Survived Maps') },
			function () {
				let description = "<p>The amount of Hits Survived maps you want to start buying nurseries from.</p>"
				description += "<p>If your Hits Survived setting is set to run less maps than this then it will use that value instead.</p>";
				description += "<p><b>Recommended:</b> 3</p>";
				return description;
			},
			'value', -1, null, 'Buildings', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 230 && autoTrimpSettings.advancedNurseries.enabled) });		
		createSetting('advancedNurseriesAmount',
			function () { return ('AN: Amount') },
			function () {
				let description = "<p>The amount of Nurseries that the script will attempt to purchase everytime you need additional health from Advanced Nurseries.</p>"
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			},
			'value', 2, null, 'Buildings', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 230 && autoTrimpSettings.advancedNurseries.enabled) });
		createSetting('advancedNurseriesIce',
			function () { return (['AN: Buy In Ice', "AN: Disable In Ice", 'AN: Disable In Ice (Spire)']) },
			function () {
				let description = "<p>How you would like Nursery purchasing to be handled during Ice empowerment zones.</p>";
				description += "<p><b>AN: Buy In Ice</b><br>Will purchase Nurseries regardless of if you're in an Ice empowerment zone.</p>";
				description += "<p><b>AN: Disable In Ice</b><br>Will stop <b>Advanced Nurseries</b> from purchasing any nurseries during <b>Ice</b> empowerment zones.</p>";
				description += "<p><b>AN: Disable Ice (Spire)</b><br>Works the same as <b>AN: Disable In Ice</b> except this setting will still purchase nurseries when inside of a Spire</p>";
				description += "<p><b>Recommended:</b> AN: Buy In Ice</p>";
				return description;
			},
			'multitoggle', 0, null, 'Buildings', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 236 && autoTrimpSettings.advancedNurseries.enabled) });
	}

	const displayEquipment = true;
	if (displayEquipment) {
		createSetting('equipOn',
			function () { return ('Auto Equip') },
			function () {
				let description = "<p>Master switch for whether the script will do any form of equipment purchasing.</p>";
				description += "<p>There's settings in here to identify when to purchase gear and if it should purchase prestiges.<br></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Equipment', [1, 2]);
		createSetting('equipCutOffHD',
			function () { return ('AE: HD Cut-off') },
			function () {
				let description = "<p>If your H:D (enemyHealth/trimpDamage) ratio is above this value it will override your <b>AE: Percent</b> input when looking at " + (currSettingUniverse !== 2 ? "weapon purchases " : "") + "and set your spending percentage to 100% of resources available.</p>";
				description += "<p>Goal with this setting is to have it purchase gear whenever you slow down in world.<br></p>";
				description += "<p>Your HD ratio can be seen in either the <b>Auto Maps status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', 1, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipCutOffHS',
			function () { return ('AE: HS Cut-off') },
			function () {
				let description = "<p>If your Hits Survived (trimpHealth/enemyDamage) ratio is below this value it will override your <b>AE: Percent</b> input when looking at armor purchases and set your spending percentage to 100% of resources available.</p>";
				description += "<p>Goal with this setting is to have it purchase gear whenever you slow down in world.<br></p>";
				description += "<p>Your Hits Survived ratio can be seen in either the <b>Auto Maps status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</p>";
				description += "<p><b>Recommended:</b> 2.5</p>";
				return description;
			}, 'value', 2.5, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipCapAttack',
			function () { return ('AE: Weapon Cap') },
			function () {
				let description = "<p>The value you want weapon equipment to stop being purchased at.</p>";
				description += "<p>Equipment levels are capped at <b>9</b> when a prestige is available for that equip to ensure the script doesn't unnecessarily spend resources on them when prestiges would be more efficient.</p>";
				description += "<p><b>Recommended:</b> 20 during earlygame and gradually raise it to 250 as needed.</p>";
				return description;
			}, 'value', 20, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipCapHealth',
			function () { return ('AE: Armour Cap') },
			function () {
				let description = "<p>The value you want armor equipment to stop being purchased at.</p>";
				description += "<p>Equipment levels are capped at <b>9</b> when a prestige is available for that equip to ensure the script doesn't unnecessarily spend resources on them when prestiges would be more efficient.</p>";
				description += "<p><b>Recommended:</b> 20 during earlygame and gradually raise it to 250 as needed.</p>";
				return description;
			}, 'value', 20, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipZone',
			function () { return ('AE: Zone') },
			function () {
				let description = "<p>What zone to stop caring about what percentage of resources you're spending and buy as many prestiges and equipment as possible.</p>";
				description += "<p>Can input multiple zones such as <b>200,231,251</b>, doing this will spend all your resources purchasing gear and prestiges on each zone input.</p>";
				description += "<p>You are able to enter a zone range, this can be done by using a decimal point between number ranges e.g. <b>23.120</b> which will cause the zone check to set your purchasing percentage to 100% between zones 23 and 120. <b>This can be used in conjunction with other zones too, just seperate inputs with commas!</b></p>";
				description += "<p>If inside one of these zones it will override your <b>AE: Percent</b> input and set your spending percentage to 100% of resources available.</p>"
				description += "<p><b>Recommended:</b> 999</p>";
				return description;
			}, 'multiValue', [-1], null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipPercent',
			function () { return ('AE: Percent') },
			function () {
				let description = "<p>What percent of resources you'd like to spend on equipment.</p>";
				description += "<p>If set to <b>0 or below</b> it will overide this and set the equip spending percent to 100%.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 10, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equip2',
			function () { return ('AE: 2') },
			function () {
				let description = "<p>This will make the script always purchase a second level of weapons and armor regardless of efficiency.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });
		createSetting('equipPrestige',
			function () { return (['AE: Prestige Off', 'AE: Maybe Prestige', 'AE: Prestige', 'AE: Always Prestige']) },
			function () {
				const trimple = currSettingUniverse === 1 ? "<b>Trimple Of Doom</b>" : "<b>Atlantrimp</b>";
				let description = "<p>Will control how equipment levels & prestiges are purchased.</p>";
				description += "<p>Equipment levels are capped at <b>9</b> when a prestige is available for that equip to ensure the script doesn't unnecessarily spend resources on them when prestiges would be more efficient.</p>";

				description += "<p><b>AE: Prestige Off</b><br>Will only purchase prestiges for equipment when you have 6 or more levels in it.</p>";

				description += "<p><b>AE: Maybe Prestige</b><br>Will only purchase prestiges when they are more efficient than leveling the piece of equipment further.</p>";

				description += "<p><b>AE: Prestige</b><br>Overrides the need for levels in your current equips before a prestige will be purchased. Will purchase gear levels again when you have run " + trimple + ".";

				description += "<br>If <b>" + trimple + "</b> has been run it will buy any prestiges that cost less than what you have input in the <b>AE: Prestige Pct</b> setting then spend your remaining resources on equipment levels.</p>";

				description += "<p><b>AE: Always Prestige</b><br>Always buys prestiges of weapons and armor regardless of efficiency. Will override the <b>AE: Zone</b> setting for an equip if it has a prestige available.</p>";

				description += "<p><b>Recommended:</b> AE: Prestige</p>";
				return description;
			}, 'multitoggle', 2, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });

		createSetting('equipPrestigePct',
			function () { return ('AE: Prestige Pct') },
			function () {
				const trimple = currSettingUniverse === 1 ? "<b>Trimple Of Doom</b>" : "<b>Atlantrimp</b>";
				let description = "<p>What percent of resources you'd like to spend on equipment before prestiges will be priorities over them.</p>";
				description += "Only impacts prestige purchasing when <b>AE: Prestige</b> is selected and " + trimple + " has been run.</p>";

				description += "<p><b>Recommended:</b> 6</p>";
				return description;
			}, 'value', 6, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse) && getPageSetting('equipPrestige', currSettingUniverse) === 2) });

		createSetting('equipNoShields',
			function () { return ('AE: No Shields') },
			function () {
				let description = "<p>Will stop the purchase of Shield equipment levels & prestiges.</p>";
				description += "<p><b>This is only ever useful in very niche scenarios.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', currSettingUniverse)) });

		createSetting('equipPortal',
			function () { return ('AE: Portal') },
			function () {
				let description = "<p>Will ensure Auto Equip is enabled after portalling.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Equipment', [1, 2]);
		createSetting('equipShieldBlock',
			function () { return ('Buy Shield Block') },
			function () {
				let description = "<p>Will allow the purchase of the shield block upgrade.</p>";
				description += "<p><b>When this setting is enabled it will cause the script to automatically run <b>The Block</b> unique map when it gets unlocked.</b></p>";
				description += "<p><b>Recommended:</b> On until you can reach zone 40</p>";
				return description;
			}, 'boolean', 55 > game.stats.highestLevel.valueTotal(), null, 'Equipment', [1]);
	}
	
	const displayCombat = true;
	if (displayCombat) {
		createSetting('autoFight',
			function () { return (['Better Auto Fight Off', 'Better Auto Fight', 'Vanilla Auto Fight']) },
			function () {
				let description = "<p>Controls how combat is handled by the script.</p>";
				description += "<p><b>Better Auto Fight Off</b><br>Disables this setting.</p>";
				description += "<p><b>Better Auto Fight</b><br>Sends a new army to fight if your current army is dead, new squad ready, new squad breed timer target exceeded, and if breeding takes under 0.5 seconds.</p>";
				description += "<p><b>Vanilla Auto Fight</b><br>Will make sure the games AutoFight setting is enabled at all times and ensures you start fighting on portal until you get the Bloodlust upgrade.</p>";
				description += "<p><b>Recommended:</b> Better Auto Fight</p>";
				return description;
			}, 'multitoggle', 1, null, 'Combat', [1, 2]);
		createSetting('autoAbandon',
			function () { return (['Never Abandon', 'Always Abandon', 'Smart Abandon']) },
			function () {
				let description = "<p>Controls whether to force abandon trimps for mapping.</p>";
				description += "<p><b>Never Abandon</b><br>Never abandon trimps.</p>";
				description += "<p><b>Always Abandon</b><br>Always abandon trimps.</p>";
				description += "<p><b>Smart Abandon</b><br>Abandon trimps when the next group of trimps is ready, or when (0 + overkill) cells away from cell 100.</p>";
				description += "<p><b>Recommended:</b> Smart Abandon</p>";
				return description;
			}, 'multitoggle', 2, null, 'Combat', [1, 2]);
		createSetting('floorCritCalc',
			function () { return ('Never Crit Calc') },
			function () {
				let description = "<p>When doing trimp damage calculations this will floor your crit chance to make the script assume you will never crit.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1, 2]);
		createSetting('ignoreCrits',
			function () { return (['Safety First', 'Ignore Void Strength', 'Ignore All Crits']) },
			function () {
				let description = "<p>Enabling this setting will force any enemy damage calculations to ignore enemy crits.</p>";
				description += "<p><b>Safety First</b><br>Disables this setting.</p>";
				description += "<p><b>Ignore Void Strength</b><br>Will ignore crits from enemies in Void maps.</p>";
				description += "<p><b>Ignore All Crits</b><br>Will ignore crits from enemies in challenges, daily mods or void maps.</p>";
				description += "<p><b>Recommended:</b> Ignore Void Strength</p>";
				return description;
			}, 'multitoggle', 0, null, 'Combat', [1, 2],
			function () { return (game.global.totalPortals > 0) });
		createSetting('AutoStance',
			function () { return (['Auto Stance Off', 'Auto Stance', 'D Stance']) },
			function () {
				let description = "<p>Enabling this setting will allow the script to swap stances to stop you having to do it manually.</p>";
				description += "<p><b>Auto Stance Off</b><br>Disables this setting.</p>";
				description += "<p><b>Auto Stance</b><br>Automatically swap stances to avoid death. Prioritises damage when you have enough health to survive.</p>";
				description += "<p><b>D stance</b><br>Keeps you in D stance regardless of your armies health.</p>";
				description += "<p><b>Recommended:</b> Auto Stance</p>";
				return description;
			}, 'multitoggle', 1, null, 'Combat', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 60) });
		createSetting('forceAbandon',
			function () { return ('Trimpicide') },
			function () {
				let description = "<p>If a new army is available to send and anticipation stacks aren't maxed this will suicide your current army and send a new one.</p>";
				description += "<p><b>Will not abandon in Spires.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [1],
			function () { return (!game.portal.Anticipation.locked) });
		createSetting('autoRoboTrimp',
			function () { return ('Auto Robotrimp') },
			function () {
				let description = "<p>Use the Robotrimp ability starting at this level, and every 5 levels thereafter.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> 60</p>";
				return description;
			}, 'value', 60, null, 'Combat', [1],
			function () { return (game.global.roboTrimpLevel > 0) });
		createSetting('addPoison',
			function () { return ('Poison Calc') },
			function () {
				let description = "<p>Adds poison stack damage to any trimp damage calculations.</p>";
				description += "<p>May improve your poison zone speed.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 236) });
		createSetting('fullIce',
			function () { return ('Ice Calc') },
			function () {
				let description = "<p>Always calculates your ice to be a consistent level instead of going by the enemy debuff. Primary use is to ensure your H:D (enemyHealth:trimpDamage) ratios aren't all over the place.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 236) });
		createSetting('45stacks',
			function () { return ('Antistack Calc') },
			function () {
				let description = "<p>Will force any damage calculations to assume you have max anticipation stacks.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [1],
			function () { return (!game.portal.Anticipation.locked) });
		createSetting('AutoDStanceSpire',
			function () { return ('D Stance in Spires') },
			function () {
				let description = "<p>Enabling this setting will force the script to only use Domination stance during Spires and not inside maps.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });


		/* Rename this */
		createSetting('scryvoidmaps',
			function () { return ('VM Scryer') },
			function () {
				let description = "<p>Will override any stance settings and set your stance to Scryer during Void Maps if you have the <b>Scryhard II</b> talent.</p>";
				description += "<p><b>If you have <b>Wind Enlightenment</b> activated and aren't in a Wind empowerment zone then it will use Wind stance instead.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [1],
			function () { return (game.talents.scry2.purchased) });

		createSetting('equalityManagement',
			function () { return (['Auto Equality Off', 'Auto Equality: Basic', 'Auto Equality: Advanced']) },
			function () {
				let description = "<p>Controls how the script handles interactions with the Equality perk.</p>";
				description += "<p><b>Auto Equality Off</b><br>Disables this setting.</p>";
				description += "<p><b>Auto Equality: Basic</b><br>Sets equality to 0 on slow enemies, and autoscaling on for fast enemies.<br><b>If using this you must setup the scaling & reversing settings in the equality menu!</b></p>";
				description += "<p><b>Auto Equality: Advanced</b><br>Will disable equality scaling and use the equality stack slider to set your equality to the ideal amount to kill the current enemy in the least amount of hits necessary.</p>";
				description += "<p><b>Recommended:</b> Auto Equality: Advanced</p>";
				return description;
			}, 'multitoggle', 2, null, 'Combat', [2]);
		createSetting('gammaBurstCalc',
			function () { return ('Gamma Burst Calc') },
			function () {
				let description = "<p>Factors Gamma Burst damage into your H:D (enemyHealth:trimpDamage) Ratio.</p>";
				description += "<p>Be warned, the script will assume that you have a gamma burst ready to trigger for every attack if enabled so your H:D Ratio might be 1 but you'd need to multiply that value by your gamma burst proc count to get the actual value.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [1, 2],
			function () { return (game.stats.highestRadLevel.valueTotal() > 10) });
		createSetting('frenzyCalc',
			function () { return ('Frenzy Calc') },
			function () {
				let description = "<p>Adds the Frenzy perk to trimp damage calculations.</p>";
				description += "<p>Be warned, the script will not farm as much with this on as it assumes 100% frenzy uptime.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [2],
			function () { return (!game.portal.Frenzy.radLocked && !autoBattle.oneTimers.Mass_Hysteria.owned) });

		createSetting('autoStanceScryer',
			function () { return ('Enable Scryer Stance') },
			function () {
				let description = "<p>Master switch for whether the script will use scryer stance.</p>";
				description += "<p>Overrides your <b>Auto Stance</b> setting when scryer conditions are met.</p>";
				description += "<p>Leave regular Auto Stance setting on while this is active.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'Combat', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 180) });
		createSetting('scryerOverkill',
			function () { return ('Use When Overkill') },
			function () {
				let description = "<p>Overrides everything!";
				description += "<p>Switches to scryer stance when we can guaranteed overkill, giving us double loot with no speed penalty (minimum one overkill, if you have more than 1, it has the potential to lose speed)";
				description += "<p>This being on, and being able to overkill in scryer stance will override ALL other settings except the Spire setting when set to <b>Never</b>.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			},
			'boolean', false, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });
		createSetting('scryerMinZone',
			function () { return ('Min Zone') },
			function () {
				let description = "<p>Minimum zone (inclusive of the zone set) to start using scryer stance in.</p>";
				description += "<p>This needs to be on <b>AND</b> valid for the <b>MAYBE</b> option on all other Scryer settings to do anything if the <b>Use When Overkill</b> setting is disabled.</p>";
				description += "<p><b>Use When Overkill</b> ignores this input and will use scryer stance regardless of what this is set to if you can overkill the cell(s).</p>";
				description += "<p>Use 9999 to disable all Non-Overkill, Non-Force, scryer usage.</p>";
				description += "<p><b>Recommended:</b> 60 or 181</p>";
				return description;
			},
			'value', 60, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });
		createSetting('scryerMaxZone',
			function () { return ('Max Zone') },
			function () {
				let description = "<p>Maximum zone (not inclusive of the zone set) to stop using scryer stance in.</p>";
				description += "<p>Turning this on with a positive number stops <b>MAYBE</b> use of all other Scryer settings.</p>";
				description += "<p><b>Use When Overkill</b> ignores this input and will use scryer stance regardless of what this is set to if you can overkill the cell(s).</p>";
				description += "<p>Use 9999 to disable all Non-Overkill, Non-Force, scryer usage.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> 9999</p>";
				return description;
			},
			'value', 999, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });
		createSetting('scryerMinMaxWorld',
			function () { return (['Min & Max: Everywhere', 'Min & Max: World', 'Min & Max: Corrupted Only', 'Min & Max: Healthy Only']) },
			function () {
				let description = "<p>Further restricts scrying usage based on the current world zone.</p>";
				description += "<p><b>Everywhere</b><br>Places set as MAYBE are affected by Min & Max Range.</p>";
				description += "<p><b>World</b><br>Only world zones are affected by Min & Max zone settings.</p>";
				description += "<p><b>Corrupted Only</b><br>Only Corrupted and Healthy enemies in the World are affected.</p>";
				description += "<p><b>Healthy Only</b><br>Only Healthy enemies in the World are affected.</p>";
				description += "<p><b>Recommended:</b> World</p>";
				return description;
			},
			'multitoggle', 1, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });
		createSetting('scryerMaxHits',
			function () { return ('Max Hits') },
			function () {
				let description = "<p>Maximum hits that the script will use for settings set to <b>Maybe</b> inputs.</p>";
				description += "<p>This has a chance to stop you from smoothly transitioning to Scryer stance and missing out on bonuses when settings are set to their <b>Never<b> inputs.</p>";
				description += "<p>If set above 10 this will switch back to Scryer stance when you can kill the enemy in 3 or less hits.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> 100</p>";
				return description;
			},
			'value', -1, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });
		createSetting('scryerEssenceOnly',
			function () { return ('Remaining Essence Only') },
			function () {
				let description = "<p>Will disable Scryer stance whilst in the world if there are no remaining enemies that hold dark essence.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });

		createSetting('scryerMaps',
			function () { return (['Maps: Never', 'Maps: Force', 'Maps: Maybe']) },
			function () {
				const useType = "maps";
				let description = "<p><b>Never</b><br>Will force the script to never use scryer stance in " + useType + ".</p>";
				description += "<p><b>Force</b><br>Will force the script to always use scryer stance in " + useType + ".</p>";
				description += "<p><b>Maybe</b><br>Will maybe run scryer stance in " + useType + " depending on how difficult the map is.</p>";
				description += "<p>The <b>Void Map</b>, <b>Plus Level</b>, and <b>Bionic Wonderland</b> settings all override this.</p>";
				description += "<p><b>Recommended:</b> Maps: Maybe</p>";
				return description;
			},
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });
		createSetting('scryerVoidMaps',
			function () { return (['Void Maps: Never', 'Void Maps: Force', 'Void Maps: Maybe']) },
			function () {
				const useType = "void maps";
				let description = "<p><b>Never</b><br>Will force the script to never use scryer stance in " + useType + ".</p>";
				description += "<p><b>Force</b><br>Will force the script to always use scryer stance in " + useType + ".</p>";
				description += "<p><b>Maybe</b><br>Will maybe run scryer stance in " + useType + " depending on how difficult the void map is.</p>";
				description += "<p><b>Recommended:</b> Void Maps: Maybe</p>";
				return description;
			},
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });
		createSetting('scryerPlusMaps',
			function () { return (['Plus Maps: Never', 'Plus Maps: Force', 'Plus Maps: Maybe']) },
			function () {
				const useType = "plus level maps";
				let description = "<p><b>Never</b><br>Will force the script to never use scryer stance in " + useType + ".</p>";
				description += "<p><b>Force</b><br>Will force the script to always use scryer stance in " + useType + ".</p>";
				description += "<p><b>Maybe</b><br>Will maybe run scryer stance in " + useType + " depending on how difficult the map is.</p>";
				description += "<p><b>Recommended:</b> Plus Maps: Maybe</p>";
				return description;
			},
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });
		createSetting('scryerBW',
			function () { return (['BW: Never', 'BW: Force', 'BW: Maybe']) },
			function () {
				const useType = "Bionic Wonderland maps";
				let description = "<p><b>Never</b><br>Will force the script to never use scryer stance in " + useType + ".</p>";
				description += "<p><b>Force</b><br>Will force the script to always use scryer stance in " + useType + ".</p>";
				description += "<p><b>Maybe</b><br>Will maybe run scryer stance in " + useType + " depending on how difficult the map is.</p>";
				description += "<p><b>Recommended:</b> BW: Maybe</p>";
				return description;
			},
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });
		createSetting('scryerSpire',
			function () { return (['Spire: Never', 'Spire: Force', 'Spire: Maybe']) },
			function () {
				const useType = "active Spires";
				let description = "<p><b>Never</b><br>Will force the script to never use scryer stance in " + useType + ".</p>";
				description += "<p><b>Force</b><br>Will force the script to always use scryer stance in " + useType + ".</p>";
				description += "<p><b>Maybe</b><br>Will maybe run scryer stance in " + useType + " depending on how difficult the Spire is.</p>";
				description += "<p><b>Recommended:</b> Spire: Maybe</p>";
				return description;
			},
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });
		createSetting('scryerSkipBoss',
			function () { return (['Boss: Never', 'Boss: Maybe']) },
			function () {
				const useType = "when at cell 100 in the world";
				let description = "<p><b>Never</b><br>Will force the script to never use scryer stance " + useType + ".</p>";
				description += "<p><b>Maybe</b><br>Will maybe run scryer stance " + useType + " depending on how difficult the enemy is.</p>";
				description += "<p><b>Recommended:</b> Boss: Never</p>";
				return description;
			},
			'multitoggle', 0, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });
		createSetting('scryerCorrupted',
			function () { return (['Corrupted: Never', 'Corrupted: Force', 'Corrupted: Maybe']) },
			function () {
				const useType = "when fighting corrupted enemies";
				let description = "<p><b>Never</b><br>Will force the script to never use scryer stance " + useType + ".</p>";
				description += "<p><b>Force</b><br>Will force the script to always use scryer stance " + useType + ".</p>";
				description += "<p><b>Maybe</b><br>Will maybe run scryer stance " + useType + " depending on how difficult the enemy is.</p>";
				description += "<p>Magma maps and Corrupted Void Maps are currently classified as corrupted</b> and selecting <b>Never</b> here will override maps and Void Maps use of scryer stance.</p>";
				description += "<p><b>Recommended:</b> Maps: Maybe</p>";
				return description;
			},
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });
		createSetting('scryerHealthy',
			function () { return (['Healthy: Never', 'Healthy: Force', 'Healthy: Maybe']) },
			function () {
				const useType = "when fighting healthy enemies";
				let description = "<p><b>Never</b><br>Will force the script to never use scryer stance " + useType + ".</p>";
				description += "<p><b>Force</b><br>Will force the script to always use scryer stance " + useType + ".</p>";
				description += "<p><b>Maybe</b><br>Will maybe run scryer stance " + useType + " depending on how difficult the enemy is.</p>";
				description += "<p><b>Recommended:</b> Healthy: Maybe</p>";
				return description;
			},
			'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });
		createSetting('scryerPoison',
			function () { return ('Scry in Poison') },
			function () {
				const useType = "in poison zones";
				let description = "<p>Override for what to do within Poison empowerment zones.</p>";
				description += "<p><b>0 = Never</b><br>Will force the script to never use scryer stance " + useType + ".</p>";
				description += "<p><b>-1 = Maybe</b><br>Will maybe run scryer stance " + useType + " depending on how difficult the enemy is to kill.</p>";
				description += "<p><b>Above 0</b><br>Will force the script to always use scryer stance " + useType + ".</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			},
			'value', -1, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });
		createSetting('scryerWind',
			function () { return ('Scry in Wind') },
			function () {
				const useType = "in wind zones";
				let description = "<p>Override for what to do within Wind empowerment zones.</p>";
				description += "<p><b>0 = Never</b><br>Will force the script to never use scryer stance " + useType + ".</p>";
				description += "<p><b>-1 = Maybe</b><br>Will maybe run scryer stance " + useType + " depending on how difficult the enemy is to kill.</p>";
				description += "<p><b>Above 0</b><br>Will force the script to always use scryer stance " + useType + ".</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			},
			'value', -1, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });
		createSetting('scryerIce',
			function () { return ('Scry in Ice') },
			function () {
				const useType = "in ice zones";
				let description = "<p>Override for what to do within Ice empowerment zones.</p>";
				description += "<p><b>0 = Never</b><br>Will force the script to never use scryer stance " + useType + ".</p>";
				description += "<p><b>-1 = Maybe</b><br>Will maybe run scryer stance " + useType + " depending on how difficult the enemy is to kill.</p>";
				description += "<p><b>Above 0</b><br>Will force the script to always use scryer stance " + useType + ".</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			},
			'value', -1, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });
		createSetting('scryerDieZone',
			function () { return ('Die To Use S') },
			function () {
				let description = "<p>Enabling this will switch you back to scryer stance even when doing so would kill you.</p>";
				description += "<p>This has potential to happen in scenarios such as when skipping corrupted enemies switches you into regular X/H stance through Auto Stance, you've killed the corrupted and reached a non-corrupted enemy that you wish to use scryer stance on, but you havent bred yet and you are too low on health to just switch back to scryer stance.</p>";
				description += "<p>So use this if you'd rather die, wait to breed, then use scryer stance for the full non-corrupted enemy, to maximize dark essence gain.</p>";
				description += "<p>Use this input to set the minimum zone that scryer activates in. You can use decimal values to specify what cell this setting starts from.</p>";
				description += "<p><b>Set to -1 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			},
			'value', -1, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', currSettingUniverse)) });

		createSetting('AutoStanceWind',
			function () { return ('Wind Stacking') },
			function () {
				let description = "<p>Enabling this will give you settings to allow you to wind stack in your runs.</p>";
				description += "<p>Will use your regular <b>Auto Stance</b> setting when outside of zones you're wind stacking in.</p>";
				description += "<p>The script evaluates the use of wind stance based on these settings. It examines the cells from the current one up to the maximum overkill range in scryer stance. If none of these cells contain enemies that drop helium, the script switches to scryer stance instead</p>";
				description += "<p>If running a daily challenge then you will need to setup the windstacking settings in the <b>Daily</b> tab.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'Combat', [1],
			function () { return (game.empowerments.Wind.retainLevel >= 50) });
		createSetting('WindStackingZone',
			function () { return ('Wind Stack Min Zone') },
			function () {
				let description = "<p>Enables wind stacking in zones above and inclusive of the zone set.</p>";
				description += "<p><b>Recommended:</b> 100 zones below portal zone</p>";
				return description;
			},
			'value', 999, null, 'Combat', [1],
			function () {
				return (autoTrimpSettings.AutoStanceWind.enabled)
			});
		createSetting('WindStackingRatio',
			function () { return ('Wind Stack H:D') },
			function () {
				let description = "<p>If your H:D ratio is above this setting it will not use wind stance.</p>";
				description += "<p>If set to <b>0 or below</b> it will always use wind stance when past your wind stacking zone input.</p>";
				description += "<p><b>Recommended:</b> 1000</p>";
				return description;
			},
			'value', -1, null, 'Combat', [1],
			function () { return (autoTrimpSettings.AutoStanceWind.enabled) });
		createSetting('WindStackingLiq',
			function () { return ('Wind Stack Liquification') },
			function () {
				let description = "<p>Will wind stack during liquification regardless of your <b>Wind Stack H:D</b> or <b>Windstack Zone</b> inputs.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			},
			'boolean', false, null, 'Combat', [1],
			function () { return (autoTrimpSettings.AutoStanceWind.enabled) });
	}
	
	const displayMaps = true;
	if (displayMaps) {
		createSetting('autoMaps',
			function () { return (["Auto Maps Off", "Auto Maps On", "Auto Maps No Unique"]) },
			function (noUnique) {
				let description = "<p>Master switch for whether the script will do any form of mapping.</p>";
				description += "<p><b>The mapping that is done is decided by how you setup any mapping related settings.</b><br></p>";
				description += "<p><b>Auto Maps Off</b><br>Disables this setting.</p>";
				description += "<p><b>Auto Maps On</b><br>Enables mapping and will run all types of maps.</p>";
				if (!noUnique) description += "<p><b>Auto Maps No Unique</b><br>The same as <b>Auto Maps On</b> but won't run unique maps such as <b>" + (currSettingUniverse === 1 ? "The Block" : "Big Wall") + "</b> or <b>Dimension of " + (currSettingUniverse === 1 ? "Anger" : "Rage") + "</b>.</p>";
				description += "<p>Automatically adjusts the games repeat and exit to settings to ensure that you don't waste time in maps or time having to breed another army.</p>";
				description += "<p><b>Recommended:</b> Auto Maps On</p>";
				return description;
			},
			'multitoggle', 1, null, 'Maps', [1, 2]);
		createSetting('autoMapsPortal',
			function () { return ('Auto Maps Portal') },
			function () {
				let description = "<p>Will ensure Auto Maps is enabled after portalling.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Maps', [1, 2]);
		createSetting('autoMapsPriority',
			function () { return ('Auto Maps Priority') },
			function () {
				let description = "<p>Allow mapping settings to use priority numbers to determine run order rather than going by the default Auto Maps mapping order.</p>";
				description += "<p>If multiple settings have the same priority then it will run them in the order that can be seen in the <b>Auto Maps Priority</b> popup that's found in the <b>Help</b> tab.</p>";
				description += "<p>Setting names in the <b>Auto Maps Priority</b> popup that are marked in bold will always be run <b>first</b> and settings that are marked in both bold and italics will always be run <b>last</b> regardless of your priority inputs.</p>";
				description += "<p><b>Not recommended for inexperienced players.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Maps', [1, 2]);
		createSetting('onlyPerfectMaps',
			function () { return ('Perfect Maps') },
			function () {
				let description = "<p>When trying to map this will cause the script to create only perfect maps.</p>";
				description += "<p><b>Be warned this may greatly decrease the map level that the script believes is efficient.</b></p>";
				description += "<p><b>Recommended:</b> Off unless at end game</p>";
				return description;
			}, 'boolean', false, null, 'Maps', [1, 2],
			function () { return (trimpStats.perfectMaps) });

		createSetting('recycleExplorer',
			function () { return ('Recycle Pre-Explorers') },
			function () {
				let description = "<p>Will allow the script to abandon and recycle maps before Explorers have been unlocked.</p>";
				description += "<p><b>Be warned this may cause issues with fragments in the early game or on select challenges.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Maps', [1, 2]);

		createSetting('autoLevelScryer',
			function () { return ('Auto Level Scryer') },
			function () {
				let description = "<p>Allows the Auto Level system to use Scryer and Wind stances.</p>";
				description += "<p>If Scryer stance has been unlocked then when the most optimal stance to use during a map is Scryer this will override all other stance settings when running a map and <b>Auto Maps</b> is enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Maps', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 180) });

		createSetting('hitsSurvived',
			function () { return ('Hits Survived') },
			function () {
				let description = "<p>Will farm until you can survive this amount of attacks.</p>";
				description += "<p>Uses the <b>Map Cap</b> and <b>Job Ratio</b> inputs that have been set in the top row of the <b>HD Farm</b> setting. If they haven't been setup then it will default to a job ratio of <b>1/1/2</b> and a map cap of <b>100</b>.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>If you have farmed and your Hits Survived value drops below 80% of this setting then it will farm again.</p>";
				description += "<p>Your Hits Survived can be seen in either the <b>Auto Maps status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</p>";
				description += "<p><b>Recommended:</b> 1.5</p>";
				if (currSettingUniverse === 2) description += "<p>Don't set this above 1 when using <b>Auto Equality: Advanced</b> as it can cause you to eternally farm.</p>";
				return description;
			}, 'value', 1.25, null, 'Maps', [1, 2]);

		createSetting('mapBonusHealth',
			function () { return ('Map Bonus Health') },
			function () {
				let description = "<p>Map Bonus stacks will be obtained to this amount when your current <b>Hits Survived</b> is below the threshold set in the <b>Hits Survived</b> setting.</p>";
				if (currSettingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 230) description += "<p>This is a very important setting to be used with <b>Advanced Nurseries</b> once you reach magma zones. Basically, if you are running out of nurseries too soon, increase this value, otherwise lower it.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 10, null, 'Maps', [1, 2]);
		createSetting('hitsSurvivedReset',
			function () { return ('Hits Survived Reset') },
			function () {
				let description = "<p>When <b>Hits Survived</b> farming this will restart farming when you reach your <b>Map Cap</b> value if you're below 80% of the targetted value in the <b>Hits Survived</b> setting.</p>";
				description += "<p>Will allow you to farm multiple times if enemies scale or your army gets weaker so can be beneficial in certain challenges.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Maps', [1, 2]);

		createSetting('mapBonusRatio',
			function () { return ('Map Bonus Ratio') },
			function () {
				let description = "<p>Map Bonus stacks will be obtained when above this World HD Ratio value.</p>";
				description += "<p>Will use the <b>Special</b> and <b>Job Ratio</b> inputs that have been set in the top row of the <b>Map Bonus</b> setting. If they haven't been setup then it will default to a job ratio of <b>0/1/3</b> and the best <b>Metal</b> cache available.</p>";
				description += "<p>Your HD Ratio can be seen in either the <b>Auto Maps status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> 4</p>";
				return description;
			}, 'value', -1, null, 'Maps', [1, 2]);

		createSetting('mapBonusStacks',
			function () { return ('Map Bonus Stacks') },
			function () {
				let description = "<p>Map Bonus stacks will be obtained to this amount when your current <b>World HD Ratio</b> is above the threshold set in the <b>Map Bonus Ratio</b> setting.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 10, null, 'Maps', [1, 2]);

		createSetting('mapBonusMinLevel',
			function () { return ('Map Bonus Min Level') },
			function () {
				let description = "<p>When using the <b>Map Bonus Health</b>, <b>Map Bonus Stacks</b> and <b>Map Bonus</b> settings this will allow you to decide not to maps for map bonus stacks when the optimal map level is this many or more levels below your minimum map bonus level.</p>";
				description += "<p>This is disabled when set to 0 or below OR you have no unbought prestiges and have prestiges available in the minimum map bonus level.</p>";
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			}, 'value', 2, null, 'Maps', [1, 2]);
			
		createSetting('mapBonusLevelType',
			function () { return ('HS/HD Map Bonus Type') },
			function () {
				let description = "<p>Will swap the auto level type that both Hits Survived & HD Ratio use for map bonus maps from loot maps to speed maps.</p>";
				return description;
			}, 'boolean', false, null, 'Maps', [1, 2]);

		/* Does this work as intended? Must query Ray for info */
		/* createSetting('mapBonusPrestige',
			function () { return ('Map Bonus Level Prestiges') },
			function () {
				let description = "<p>When using the <b>Map Bonus Min Level</b> setting, if there are any prestige upgrades available between your map level and minimum map bonus level, this will the reduce level that it looks for to the last one with prestiges.</p>";
				description += "<p>This setting is ignored when obtaining map bonus stacks through the <b>Map Bonus</b> setting.</p>";
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			}, 'boolean', false, null, 'Maps', [1, 2]); */

		createSetting('prestigeClimb',
			function () { return ('Prestige Climb') },
			function () {
				let description = "<p>Acquire prestiges through the selected item (inclusive) as soon as they are available in maps.</p>";
				description += "<p>Automatically swaps the games default setting from <b>Tier First</b> to <b>Equip First</b>.</p>";
				description += "<p><b>Auto Maps must be enabled for this to run.</b></p>";
				description += "<p><b>Before Explorers have been unlocked when this setting runs it will automatically set all map sliders except size to the minimum they can be and set the biome used to Random.</b></p>";
				description += "<p>This is important for speed climbing through world zones. If you find the script getting stuck somewhere, particularly where you should easily be able to kill stuff, setting this to an option lower down in the list will help ensure you are more powerful at all times, but will spend more time acquiring the prestiges in maps.</p>";
				description += "<p><b>Recommended:</b> Dagadder</p>";
				return description;
			},
			'dropdown', 'Off', function () {
				let equips = ['Off', 'Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate'];
				if (game.global.slowDone) {
					equips.push('Harmbalest', 'GambesOP');
				}
				return equips;
			}, 'Maps', [1, 2]);
		createSetting('prestigeClimbZone',
			function () { return ('PC: Force Prestige Z') },
			function () {
				let description = "<p>On and after this zone is reached, always try to prestige for everything immediately regardless of your <b>Prestige Climb</b> input unless it is set to <b>Off</b>.</p>";
				description += "<p>The <b>Prestige Skip</b> setting has the potential to disable this if it's enabled.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> The zone you start heavily slowing down</p>";
				return description;
			}, 'value', -1, null, 'Maps', [1, 2]);
		createSetting('prestigeClimbSkip',
			function () { return ('PC: Prestige Skip') },
			function () {
				let description = "<p>Will stop <b>Prestige Climb</b> from running if you have 2 or more unbought metal prestiges in your upgrades window.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Maps', [1, 2]);

		createSetting('prestigeClimbPriority',
			function () { return ('PC: Priority') },
			function () {
				let description = "<p>The priority value you would like to use when running Prestige Climb.</p>";
				description += "This only impacts the mapping order when the <b>Auto Maps Priority</b> setting in the Maps tab is enabled.</p>";

				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', 1, null, 'Maps', [1, 2]);

		createSetting('hdFarmSettings',
			function () { return ('HD Farm Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like <b>H:D Ratio</b> or <b>Hits Survived</b> farming to be run.</p>";
				description += "<p>Your H:D Ratio and Hits Survived values can be seen in either the <b>Auto Maps status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false, jobratio: '-1', mapCap: 100 }], 'importExportTooltip("mapSettings", "HD Farm")', 'Maps', [1, 2]);

		createSetting('voidMapSettings',
			function () { return ('Void Map Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like Void Maps to be run.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false, hitsSurvived: 1 }], 'importExportTooltip("mapSettings", "Void Map")', 'Maps', [1, 2],
			function () { return (game.global.totalPortals > 0) });

		createSetting('boneShrineSettings',
			function () { return ('Bone Shrine Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like Bone Shrine charges to be used.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Bone Shrine")', 'Maps', [1, 2],
			function () { return (game.permaBoneBonuses.boosts.owned > 0) });

		createSetting('worshipperFarmSettings',
			function () { return ('Worshipper Farm Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like Worshippers to be farmed.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Worshipper Farm")', 'Maps', [2],
			function () { return game.stats.highestRadLevel.valueTotal() >= 50 });

		createSetting('uniqueMapSettingsArray',
			function () { return ('Unique Map Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like Unique Maps to be run.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', {
			"The Wall": { enabled: false, zone: 100, cell: 0 },
			"The Block": { enabled: false, zone: 100, cell: 0 },
			"Dimension of Anger": { enabled: false, zone: 100, cell: 0 },
			"Trimple Of Doom": { enabled: false, zone: 100, cell: 0 },
			"The Prison": { enabled: false, zone: 100, cell: 0 },
			"Imploding Star": { enabled: false, zone: 100, cell: 0 },

			"Big Wall": { enabled: false, zone: 100, cell: 0 },
			"Dimension of Rage": { enabled: false, zone: 100, cell: 0 },
			"Prismatic Palace": { enabled: false, zone: 100, cell: 0 },
			"Atlantrimp": { enabled: false, zone: 100, cell: 0 },
			"Melting Point": { enabled: false, zone: 100, cell: 0 },
			"Frozen Castle": { enabled: false, zone: 100, cell: 0 },

			"MP Smithy": { enabled: false, value: 100 },
			"MP Smithy Daily": { enabled: false, value: 100 },
			"MP Smithy C3": { enabled: false, value: 100 },
			"MP Smithy One Off": { enabled: false, value: 100 },
		}, 'importExportTooltip("UniqueMaps")', 'Maps', [1, 2]);

		createSetting('uniqueMapEnoughHealth',
			function () { return ('Unique Map Health Check') },
			function () {
				let description = "<p>Will disable Unique Maps from being run if you don't have enough health to survive the minimum attack of the highest attacking cell in that map.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Maps', [1, 2]);
			
		createSetting('mapBonusSettings',
			function () { return ('Map Bonus Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like map bonus stacks to be obtained.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false, jobratio: '-1', special: '0', }], 'importExportTooltip("mapSettings", "Map Bonus")', 'Maps', [1, 2]);

		createSetting('mapFarmSettings',
			function () { return ('Map Farm Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like to farm a specific amount of maps.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Map Farm")', 'Maps', [1, 2]);

		createSetting('raidingSettings',
			function () { return ('Raiding Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like to raid maps for prestiges.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Raiding")', 'Maps', [1, 2],
			function () { return (currSettingUniverse === 2 ? game.stats.highestRadLevel.valueTotal() >= 50 : game.stats.highestLevel.valueTotal() >= 210) });

		createSetting('bionicRaidingSettings',
			function () { return ('BW Raiding Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like to raid Bionic Wonderland maps for prestiges.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Bionic Raiding")', 'Maps', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 125) });

		createSetting('tributeFarmSettings',
			function () { return ('Tribute Farm Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like Tributes & Meteorologists to be farmed.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Tribute Farm")', 'Maps', [2]);

		createSetting('smithyFarmSettings',
			function () { return ('Smithy Farm Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like Smithies to be farmed.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Smithy Farm")', 'Maps', [2]);
	}
	
	const displayChallenges = true;
	if (displayChallenges) {
		createSetting('balance',
			function () { return (currSettingUniverse === 2 ? 'Unbalance' : 'Balance') },
			function () {
				let description = "<p>Enable this if you want to automate destacking when running the <b>" + (currSettingUniverse === 2 ? 'Unbalance' : 'Balance') + "</b> challenge.</p>";
				if (game.global.highestRadonLevelCleared > 1) description += "<p>If you have a gamma burst charged this will delay destacking until it has been used.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Challenges', [1, 2],
			function () { return (currSettingUniverse === 2 ? game.stats.highestRadLevel.valueTotal() >= 35 : game.stats.highestLevel.valueTotal() >= 40) });

		createSetting('balanceDestack',
		function () { return ((currSettingUniverse === 2 ? 'U' : 'B') + ': HD Ratio') },
		function () {
			let description = "<p>What HD ratio cut-off to use for deciding when to destack.</p>";
			description += "<p>Only destacks once above the stack amount set in the <b>" + (currSettingUniverse === 2 ? 'U' : 'B') + ': Stacks' + "</b> setting.</p>";
			description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
			description += "<p><b>Recommended:</b> 5</p>";
			return description;
		}, 'value', 5, null, 'Challenges', [1, 2],
		function () { return (getPageSetting('balance', currSettingUniverse) && autoTrimpSettings.balance.require()) });
		createSetting('balanceZone',
			function () { return ((currSettingUniverse === 2 ? 'U' : 'B') + ': Zone') },
			function () {
				let description = "<p>The zone you would like to start destacking your Unbalance stacks from.</p>";
				description += "<p>If set to <b>0 or below</b> it will never destack.</p>";
				return description;
			}, 'value', 6, null, 'Challenges', [1, 2],
			function () { return (getPageSetting('balance', currSettingUniverse) && autoTrimpSettings.balance.require()) });
		createSetting('balanceStacks',
			function () { return ((currSettingUniverse === 2 ? 'U' : 'B') + ': Stacks') },
			function () {
				let description = "<p>The amount of Unbalance stacks you have to reach before clearing them.</p>";
				description += "<p>Once it starts destacking it will destack until you have no Unbalance stacks remaining.</p>";
				description += "<p>If set to <b>0 or below</b> it will never destack.</p>";
				description += "<p><b>Recommended:</b> 20</p>";
				return description;
			}, 'value', 20, null, 'Challenges', [1, 2],
			function () { return (getPageSetting('balance', currSettingUniverse) && autoTrimpSettings.balance.require()) });
		createSetting('balanceImprobDestack',
			function () { return ((currSettingUniverse === 2 ? 'U' : 'B') + ': Improbability Destack') },
			function () {
				let description = "<p>Will always fully destack when at cell 100 once you reach your destacking zone.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Challenges', [1, 2],
			function () { return (getPageSetting('balance', currSettingUniverse) && autoTrimpSettings.balance.require()) });

		createSetting('buble',
			function () { return ('Bublé') },
			function () {
				let description = "<p>This is a dummy setting to explain how the script works during Bublé.</p>";
				description += "<p>Will disable map bonus farming when using auto level unless your optimal map level is 0 or higher as it can't guarantee survival before then.</p>";
				description += "<p>Will automatically adjust equality and suicide armies that are one hit away from death to try and ensure you don't fail the challenge It cannot do this during void maps so you will need to overfarm health/damage to accomodate for this.</p>";
				description += "<p>Requires the <b>Auto Equality</b> setting in the Combat tab to be set to <b>Auto Equality: Advanced</b> or the script won't try to keep your armies alive.</p>";
				return description;
			}, 'boolean', false, null, 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 40) });

		createSetting('decay',
			function () { return (currSettingUniverse === 2 ? 'Melt' : 'Decay') },
			function () {
				let description = "<p>Enable this if you want to use automation features when running the <b>" + (currSettingUniverse === 2 ? 'Melt' : 'Decay') + "</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Challenges', [1, 2],
			function () { return (currSettingUniverse === 2 ? game.stats.highestRadLevel.valueTotal() >= 50 : game.stats.highestLevel.valueTotal() >= 55) });
		createSetting('decayStacksToPush',
			function () { return ((currSettingUniverse === 2 ? 'M' : 'D') + ': Stacks to Push') },
			function () {
				const challengeName = currSettingUniverse === 2 ? 'Melt' : 'Decay';
				const maxStacks = challengeName === 'Melt' ? 500 : 999;

				let description = "<p>Will ignore maps and push to end the zone when you are at or above this amount of stacks.</p>";
				description += "<p>Both Prestige Climb and Void Maps will override this setting and still run.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>Inputs above the max stack value (<b>" + (maxStacks) + "</b>) are treated as max stack inputs.</p>";
				description += "<p><b>Recommended:</b> 150</p>";
				return description;
			}, 'value', -1, null, 'Challenges', [1, 2],
			function () { return (getPageSetting('decay', currSettingUniverse) && autoTrimpSettings.decay.require()) });
		createSetting('decayStacksToAbandon',
			function () { return ((currSettingUniverse === 2 ? 'M' : 'D') + ': Stacks to Abandon') },
			function () {
				const challengeName = currSettingUniverse === 2 ? 'Melt' : 'Decay';
				const maxStacks = challengeName === 'Melt' ? 500 : 999;
				
				let description = "<p>Will abandon the challenge when you are at or above this amount of stacks.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>Inputs above the max stack value (<b>" + (maxStacks) + "</b>) are treated as max stack inputs.</p>";
				description += "<p><b>Recommended:</b> 400</p>";
				return description;
			}, 'value', -1, null, 'Challenges', [1, 2],
			function () { return (getPageSetting('decay', currSettingUniverse) && autoTrimpSettings.decay.require()) });

		createSetting('life',
			function () { return ('Life') },
			function () {
				let description = "<p>Enable this if you want to use automation features when running the <b>Life</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Challenges', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 110) });
		createSetting('lifeZone',
			function () { return ('L: Zone') },
			function () {
				let description = "<p>Will take you to the map chamber when the current enemy is Living and when you are at or above this zone.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Must be used in conjunction with L: Stacks</b></p>";
				description += "<p><b>Recommended:</b> 100</p>";
				return description;
			}, 'value', -1, null, 'Challenges', [1],
			function () { return (autoTrimpSettings.life.enabled) });
		createSetting('lifeStacks',
			function () { return ('L: Stacks') },
			function () {
				let description = "<p>Will take you to the map chamber when the current enemy is Living and when you are at or below this stack count.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Must be used in conjunction with L: Zone</b></p>";
				description += "<p><b>Recommended:</b> 100</p>";
				return description;
			}, 'value', -1, null, 'Challenges', [1],
			function () { return (autoTrimpSettings.life.enabled) });

		createSetting('toxicitySettings',
			function () { return ('Toxicity Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like to farm a specific amount of Toxicity stacks for increased " + _getPrimaryResourceInfo().name.toLowerCase() + " and resources gain.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Toxicity")', 'Challenges', [1]);

		createSetting('archaeology',
			function () { return ('Archaeology') },
			function () {
				let description = "<p>Enable this if you want to use automation features when running the <b>Archaeology</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 90) });
			
		createSetting('archaeologyBreedShield',
			function () { return ('A: Breed Shield') },
			function () {
				let description = "<p>Shield to use during <b>Archaeology</b> when your army is dead and breeding.</p>";
				description += "<p>This will override all other heirloom swapping features when active!</p>";
				description += "<p>Should ideally be a shield with the <b>Breedspeed</b> modifier.</p>";
				description += "<p>Mapping decisions will be disabled when in world or the map chamber and using this heirloom so make sure it has a different name from your other heirloom settings!</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Challenges', [2],
			function () { return (getPageSetting('archaeology', currSettingUniverse) && autoTrimpSettings.archaeology.require()) });
			
		createSetting('archaeologyString1',
			function () { return ('A: String 1') },
			function () {
				let description = "<p>First string to use in <b>Archaeology</b>. Follows the same format as the game i.e: 10a,10e </p>";
				return description;
			}, 'multiTextValue', ['undefined'], null, 'Challenges', [2],
			function () { return (getPageSetting('archaeology', currSettingUniverse) && autoTrimpSettings.archaeology.require()) });

		createSetting('archaeologyString2',
			function () { return ('A: String 2') },
			function () {
				let description = "<p>Second string to use in <b>Archaeology</b>. Follows the same format as the game, put the zone you want to start using this string at the start of the input. I.e: 84,10a,10e </p>";
				return description;
			}, 'multiTextValue', ['undefined'], null, 'Challenges', [2],
			function () { return (getPageSetting('archaeology', currSettingUniverse) && autoTrimpSettings.archaeology.require()) });

		createSetting('archaeologyString3',
			function () { return ('A: String 3') },
			function () {
				let description = "<p>Third string to use in <b>Archaeology</b>. Follows the same format as the game, put the zone you want to start using this string at the start of the input. I.e: 94,10a,10e </p>";
				return description;
			}, 'multiTextValue', ['undefined'], null, 'Challenges', [2],
			function () { return (getPageSetting('archaeology', currSettingUniverse) && autoTrimpSettings.archaeology.require()) });

		createSetting('exterminate',
			function () { return ('Exterminate') },
			function () {
				let description = "<p>Enable this if you want to use automation features when running the <b>Exterminate</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 120) });
			
		createSetting('exterminateWorldStaff',
			function () { return ('E: World Staff') },
			function () {
				let description = "<p>Staff to use during <b>Exterminate</b> when you're not mapping.</p>";
				description += "<p>This will override all other heirloom swapping features when active!</p>";
				description += "<p>Should ideally be a staff with high primary resource modifiers.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Challenges', [2],
			function () { return (getPageSetting('exterminate', currSettingUniverse) && autoTrimpSettings.exterminate.require()) });

		createSetting('quagmireSettings',
			function () { return ('Quagmire Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like Black Bog farming to be done during <b>Quagmire</b>.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Quagmire")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 70) });

		createSetting('archaeologySettings',
			function () { return ('Archaeology Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like farm for specific relic strings during <b>Archaeology</b>.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Archaeology")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 90) });
			
		createSetting('insanitySettings',
			function () { return ('Insanity Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like Insanity stack farming to be done during Insanity.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Insanity")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 110) });

		createSetting('alchemySettings',
			function () { return ('Alchemy Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like potion farming to be done during Alchemy.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Alchemy")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 155) });

		createSetting('hypothermiaSettings',
			function () { return ('Hypothermia Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like bonfire farming to be done during Hypothermia.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			},
			'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Hypothermia")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 175) });
	}

	const displayC2 = true;
	if (displayC2) {
		createSetting('c2Finish',
			function () { return ("Finish " + _getChallenge2Info()) },
			function () {
				let description = "<p>Abandons " + _getChallenge2Info() + "s when this zone is reached but won't portal.</p>";
				description += "<p>If <b>" + _getChallenge2Info() + " Runner</b> is enabled then this setting is disabled. </p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>Will not abandon special challenges like Frigid or Experience.</p>";
				description += "<p>Recommended: Zones ending with 0 for most " + _getChallenge2Info() + " runs.</p>";
				return description;
			}, 'value', -1, null, 'C2', [1, 2]);

		createSetting('c2Table',
			function () { return (_getChallenge2Info() + ' Table') },
			function () {
				let description = "<p>Display your challenge runs in a convenient table which is colour coded.</p>";
				description += "<p><b>Green</b><br>Challenges that are green are normally not worth updating.</p>";
				description += "<p><b>Yellow</b><br>You should consider updating yellow challenges.</p>";
				description += "<p><b>Red</b><br>Updating red challenges is typically worthwhile.</p>";
				description += "<p><b>Blue</b><br>This challenge hasn't been run yet and should be done as soon as possible.</p>";
				return description;
			}, 'infoclick', null, 'importExportTooltip("c2table")', 'C2', [0]);

		createSetting('c2SharpTrimps',
			function () { return (_getChallenge2Info() + ' Sharp Trimps') },
			function () {
				let description = "<p>Buys the Sharp Trimps bonus for <b>25 bones</b> during " + _getSpecialChallengeDescription() + " runs.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1, 2]);

		createSetting('c2GoldenMaps',
			function () { return (_getChallenge2Info() + ' Golden Maps') },
			function () {
				let description = "<p>Buys the Golden Maps bonus for <b>20 bones</b> during " + _getSpecialChallengeDescription() + " runs.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1, 2]);

		createSetting('c2disableFinished',
			function () { return ('Hide Finished Challenges') },
			function () {
				let description = "<p>Hides challenges that have a maximum completion count when they've been finished.</p>";
				description += "<p><b>If you're running one of the challenges the settings will appear for the duration of that run.</b></p>";
				return description;
			}, 'boolean', true, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 100) });

		createSetting('c2RunnerStart',
			function () { return (_getChallenge2Info() + ' Runner') },
			function () {
				let description = "<p>Enable this if you want to use " + _getChallenge2Info() + " running features.</p>";
				description += "<p>Allows the script to automatically start running " + _getChallenge2Info() + "'s when portaling in an effort to maintain your " + _getChallenge2Info() + " score</p>";
				description += "<p>If enabled will disable the <b>Finish " + _getChallenge2Info() + "</b> setting.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'C2', [1, 2]);

		createSetting('c2RunnerMode',
			function () { return ([_getChallenge2Info() + ' Runner %', _getChallenge2Info() + ' Runner Set Values']) },
			function () {
				const c2Name = _getChallenge2Info();
				let description = "<p>Toggles between the two modes that " + c2Name + " Runner can use for selecting which " + c2Name + " to start.</p>";
				description += "<p><b>" + c2Name + " Runner %</b><br>Will run " + c2Name + "s when they are below a set percentage of your HZE.</b><br>For a list of challenges that this will run see " + c2Name + " Table.</p>";
				description += "<p><b>" + c2Name + " Runner Set Values</b><br>\
				Uses the <b>" + c2Name + " Runner Settings</b> popup and will run enabled " + c2Name + "s when they are below the designated end zone.</p>";
				description += "<p>If using <b>" + c2Name + " Runner Set Values</b> then the " + c2Name + " will only be be finished if the challenge is enabled and a zone above 0 has been set.</p>";
				description += "<p>I recommend only using <b>" + c2Name + " Runner Set Values</b> if you're actively going to update the inputs as you progress.</p>";
				description += "<p><b>Recommended:</b> " + c2Name + " Runner %</p>";
				return description;
			}, 'multitoggle', 0, null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse)) });

		createSetting('c2RunnerSettings',
			function () { return (_getChallenge2Info() + ' Runner Settings') },
			function () {
				let description = "<p>Here you can enable the challenges you would like " + _getChallenge2Info() + " Runner to complete and the zone you'd like the respective challenge to finish at. It will start them on the next auto portal if necessary.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				return description;
			},
			'mazArray', {}, 'importExportTooltip("c2Runner")', 'C2', [1, 2],
			function () {
				return (getPageSetting('c2RunnerStart', currSettingUniverse) && getPageSetting('c2RunnerMode', currSettingUniverse) === 1)
			});

		createSetting('c2RunnerPortal',
			function () { return (_getChallenge2Info() + ' Runner End Zone') },
			function () {
				let description = "<p>Automatically abandon " + _getChallenge2Info() + "s when this zone is reached.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>If this setting is disabled it will also stop " + _getChallenge2Info() + " Runner from starting any challenges.</p>";
				description += "<p><b>Recommended:</b> Desired challenge end goal</p>";
				return description;
			}, 'value', -1, null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse) && getPageSetting('c2RunnerMode', currSettingUniverse) === 0) });

		createSetting('c2RunnerPercent',
			function () { return (_getChallenge2Info() + ' Runner %') },
			function () {
				let description = "<p>The percent threshhold you want " + _getChallenge2Info() + "s to be over.</p>";
				description += "<p>Will only run " + _getChallenge2Info() + "s with a HZE% below this settings value.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>If this setting is disabled it will also stop " + _getChallenge2Info() + " Runner from starting any challenges.</p>";
				description += "<p><b>Recommended:</b> 85</p>";
				return description;
			}, 'value', 0, null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse) && getPageSetting('c2RunnerMode', currSettingUniverse) === 0) });

		createSetting('c2RunnerEndMode',
			function () { return ([_getChallenge2Info() + ' Runner End Challenge', _getChallenge2Info() + ' Runner Portal']) },
			function () {
				let description = "<p>If set to <b>" + _getChallenge2Info() + " Runner Portal</b> this will automatically portal once you reach your " + _getChallenge2Info() + " end zone otherwise it will  end the challenge and continue your run on as normal.</p>";
				description += "<p><b>Recommended:</b> " + _getChallenge2Info() + " Runner Portal</p>";
				return description;
			}, 'multitoggle', 1, null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse)) });

		createSetting('c2Fused',
			function () { return (['Fused ' + _getChallenge2Info() + 's', 'Fused ' + _getChallenge2Info() + 's Below %', 'Fused ' + _getChallenge2Info() + 's Any %']) },
			function () {
				const c2Name = _getChallenge2Info();
				let description = "<p>Will allow " + c2Name + " Runner to do fused versions of " + c2Name + "'s rather than normal versions to reduce time spent running " + c2Name + "s.</p>";
				description += "<p><b>Fused " + c2Name + "'s Below %</b><br>Will run " + c2Name + "s when both challenges are below your <b>" + c2Name + " Runner % value</b>.</p>";
				description += "<p><b>Fused " + c2Name + "'s Any %</b><br>Will run " + c2Name + "s when either challenge is  below your <b>" + c2Name + " Runner % value.</b></p>";
				description += "<p><b>Recommended:</b> Fused " + _getChallenge2Info() + "s Any %</p>";
				return description;
			}, 'multitoggle', 0, null, 'C2', [1],
			function () { return (getPageSetting('c2RunnerStart', currSettingUniverse) && getPageSetting('c2RunnerMode', currSettingUniverse) === 0) });

		createSetting('c2IgnoreSpiresUntil',
			function () { return (_getChallenge2Info() + ' Ignore Spires Until') },
			function () {
				let description = "<p>Will disable all of the Spire features unless you're in a Spire at or above this value.</p>";
				description += "<p><b>This works based off Spire number rather than zone. So if you want to ignore Spires until Spire II at z300 then enter 2, Spire III at z400 would be 3 etc.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and make the script assume every Spire is an active Spire.</p>";
				description += "<p><b>Recommended:</b> Second to last Spire you reach on your runs</p>";
				return description;
			}, 'value', -1, null, 'C2', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });

		createSetting('c2ExitSpireCell',
			function () { return (_getChallenge2Info() + ' Exit Spire After Cell') },
			function () {
				let description = "<p>Will exit out of active Spires upon clearing this cell.</p>";
				description += "<p><b>Works based off cell number so if you want it to exit after Row #4 then set to 40.</b></p>";
				description += "<p>Any health or damage calculations for the Spire will be based off this cell if set.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'C2', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });

		createSetting('c2PreSpireNurseries',
			function () { return (_getChallenge2Info() + ' Nurseries pre-Spire') },
			function () {
				let description = "<p>Set the number of <b>Nurseries</b> to build during active Spires.</p>";
				description += "<p><b>Will override any <b>Nursery</b> settings that you have setup in the <b>AT AutoStructure</b> setting.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'C2', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });

		createSetting('c2AutoDStanceSpire',
			function () { return (_getChallenge2Info() + ' Stance in Spires') },
			function () {
				let description = "<p>Enabling this setting will force the script to only use Domination stance during Spires and not inside maps.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });

		createSetting('duel',
			function () { return ('Duel') },
			function () {
				let description = "<p>Enable this if you want to use automation features when running the <b>Duel</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 45) });
		createSetting('duelHealth',
			function () { return ('D: Force x10 Health') },
			function () {
				let description = "<p>Enable this to have the script suicide when running <b>Duel</b> by setting equality to 0 when you don't have the 10x health buff.</p>";
				description += "<p>Will only work if the <b>Auto Equality</b> setting is set to <b>Auto Equality: Advanced</b>."
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (getPageSetting('duel', currSettingUniverse) && autoTrimpSettings.duel.require()) });
		createSetting('duelShield',
			function () { return ('D: Shield') },
			function () {
				let description = "<p>The name of the shield you would like to equip while running <b>Duel</b>.</p>";
				description += "<p>This will override all other heirloom swapping features and only use this shield during <b>Duel</b>!</p>"
				description += "<p>Should ideally be a shield without the <b>Crit Chance</b> modifier.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'C2', [2],
			function () { return (getPageSetting('duel', currSettingUniverse) && autoTrimpSettings.duel.require()) });

		createSetting('trapper',
			function () { return (currSettingUniverse === 2 ? 'Trappapalooza' : 'Trapper') },
			function () {
				let description = "<p>Enable this if you want to use coordination witholding features when running the <b>" + (currSettingUniverse === 2 ? 'Trappapalooza' : 'Trapper') + "</b> challenge.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1, 2],
			function () { return (currSettingUniverse === 2 ? game.stats.highestRadLevel.valueTotal() >= 60 : game.stats.highestLevel.valueTotal() >= 70) });

		createSetting('trapperCoordStyle',
			function () { return (['T: Coords Owned', 'T: Army Size']) },
			function () {
				let description = "<p>The style you would like purchasing Coordinations to use.</p>";
				description += "<p><b>T: Coords Owned</b><br>Will stop purchasing coordination levels from a certain zone.</p>";
				description += "<p><b>T: Army Size</b><br>Will stop purchasing coordination levels after reaching a certain army size.</p>";
				description += "<p><b>Recommended:</b> T: Coords Owned</p>";
				return description;
			}, 'multitoggle', 0, null, 'C2', [1, 2],
			function () { return (getPageSetting('trapper', currSettingUniverse) && autoTrimpSettings.trapper.require()) });

		createSetting('trapperCoords',
			function () { return ('T: Coords') },
			function () {
				let description = "<p>The zone you would like to stop buying additional <b>Coordination</b> from.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and not have a cap on <b>Coordination</b> purchases.</p>";
				description += "<p>If set to <b>0 or below</b> and not running the " + _getChallenge2Info() + " version of the challenge it will override this and set it to " + (currSettingUniverse === 2 ? '50' : '33') + ".</p>";
				return description;
			}, 'value', -1, null, 'C2', [1, 2],
			function () { return (getPageSetting('trapper', currSettingUniverse) && autoTrimpSettings.trapper.require() && getPageSetting('trapperCoordStyle', currSettingUniverse) === 0) });

		createSetting('trapperArmySize',
			function () { return ('T: Army Size') },
			function () {
				let description = "<p>The army size you would like to stop buying additional <b>Coordination</b> from.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and not have a cap on <b>Coordination</b> purchases.</p>";
				return description;
			}, 'value', -1, null, 'C2', [1, 2],
			function () { return (getPageSetting('trapper', currSettingUniverse) && autoTrimpSettings.trapper.require() && getPageSetting('trapperCoordStyle', currSettingUniverse) === 1) });

		createSetting('trapperTrap',
			function () { return ('T: Disable Trapping') },
			function () {
				let description = "<p>If enabled then trapping (both ingame and through the script) will be disabled when you have the coordination amount input in <b>T: Coords</b> and " + (currSettingUniverse === 2 ? "are currently fighting with that army OR" : "") + " your population is greater than the required amount for that coordination value.</p>";
				description += "<p>To work <b>T: Coords</b> must have an input above 0!</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1, 2],
			function () { return (getPageSetting('trapper', currSettingUniverse) && autoTrimpSettings.trapper.require()) });

		createSetting('trapperArmyPct',
			function () { return ('T: Army Percent') },
			function () {
				let description = "<p>The percentage of owned trimps that you would like to send out when you need a new army.</p>";
				description += "<p>If set to <b>0 or below</b> it will assume this is set to 100% and always send armies if possible.</p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', -1, null, 'C2', [1, 2],
			function () { return (getPageSetting('trapper', currSettingUniverse) && autoTrimpSettings.trapper.require()) });

		createSetting('trapperShield',
			function () { return ('T: Shield') },
			function () {
				let description = "<p>The name of the shield you would like to equip while running <b>" + (currSettingUniverse === 2 ? 'Trappapalooza' : 'Trapper') + "</b>.</p>";
				description += "<p>This will override all other heirloom swapping features and only use this shield during <b>" + (currSettingUniverse === 2 ? 'Trappapalooza' : 'Trapper') + "</b>!</p>"
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'C2', [1, 2],
			function () { return (getPageSetting('trapper', currSettingUniverse) && autoTrimpSettings.trapper.require()) });

		createSetting('trapperWorldStaff',
			function () { return ('T: World Staff') },
			function () {
				let description = "<p>Staff to use during <b>" + (currSettingUniverse === 2 ? 'Trappapalooza' : 'Trapper') + "</b> when you're not mapping.</p>";
				description += "<p>This will override all other heirloom swapping features when active!</p>";
				description += "<p>Should ideally be a staff with high primary resource modifiers.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'C2', [1,2],
			function () { return (getPageSetting('trapper', currSettingUniverse) && autoTrimpSettings.trapper.require()) });

		createSetting('mapology',
			function () { return ('Mapology') },
			function () {
				let description = "<p>Enable this if you want to use automation features when running the <b>Mapology</b> challenge.</p>";
				description += "<p>When enabled any raiding (and BW raiding) settings will climb until the prestige selected in the <b>M: Prestige</b> setting has been obtained rather than going for the settings targetted prestige.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'C2', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 150) });

		createSetting('mapologyPrestige',
			function () { return ('M: Prestige') },
			function () {
				let description = "<p>When running any prestige farming settings this will override the targetted prestige with the prestige selected here.</p>";
				description += "<p><b>Recommended:</b> Axeidic for <b>push</b> runs or Bootboost for <b>speed</b> runs</p>";
				return description;
			}, 'dropdown', 'Bootboost', function () {
				let equips = ['Off', 'Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate'];
				if (game.global.slowDone) {
					equips.push('Harmbalest', 'GambesOP');
				}
				return equips;
			}, 'C2', [1],
			function () { return (getPageSetting('mapology', currSettingUniverse) && autoTrimpSettings.mapology.require()) });

		createSetting('mapologyMapOverrides',
			function () { return ('Mapology Map Overrides') },
			function () {
				let description = "<p>Enabling this will disable all farming with the exception of Prestige Climb, Prestige Raiding, BW Raiding & Void Maps.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', true, null, 'C2', [1],
			function () { return (getPageSetting('mapology', currSettingUniverse) && autoTrimpSettings.mapology.require()) });

		createSetting('lead',
			function () { return ('Lead') },
			function () {
				let description = "<p>Enabling this will disable mapping on even zones and will only map when you're at or past cell 90 on odd zones to ensure the enemies Momentum buff is providing as small a benefit as possible.</p>";
				description += "<p>If you are in a Spire or the final zone of a nature band then it will map on that zone even if it is an even zone.</p>";
				description += "<p>Be careful with how you setup your mapping when this is enabled as it will skip mapping lines that are set to run on odd zones!</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			},
			'boolean', false, null, 'C2', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 180) });

		createSetting('frigid',
			function () { return ('Frigid') },
			function () {
				let description = "<p>When you have warmth stacks this will disable all forms of mapping except for Void Maps from being run.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 460) });

		createSetting('frigidSwapZone',
			function () { return ('F: Heirloom Swap Zone') },
			function () {
				let description = "<p>The zone you'd like to swap to your afterpush shield during Frigid.</p>";
				description += "<p>This overrides the " + _getChallenge2Info() + " heirloom swap setting input when set above <b>0</b>.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'C2', [1],
			function () { return (getPageSetting('frigid', currSettingUniverse) && autoTrimpSettings.frigid.require()) });

		createSetting('experience',
			function () { return ('Experience') },
			function () {
				let description = "<p>Enable this if you want to automate wonder farming on the <b>Experience</b> challenge.</p>";
				description += "<p>This setting is dependant on using <b>Bionic Raiding</b> in conjunction with it if you the Bionic Wonderland level you finish with to be higher than 605.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 600) });
		createSetting('experienceStartZone',
			function () { return ('E: Start Zone') },
			function () {
				let description = "<p>The zone you would like to start mapping for wonders at.</p>";
				description += "<p>If set below 300 it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 500 to start and lower over time</p>";
				return description;
			},
			'value', -1, null, 'C2', [1],
			function () { return (autoTrimpSettings.experience.enabled) });
		createSetting('experienceStaff',
			function () { return ('E: Wonder Staff') },
			function () {
				let description = "<p>The staff you would like to use whilst farming for Wonders.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated pet xp staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'C2', [1],
			function () { return (autoTrimpSettings.experience.enabled) });
		createSetting('experienceEndZone',
			function () { return ('E: End Zone') },
			function () {
				let description = "<p>Will run the Bionic Wonderland map level specified in <b>E: End BW</b> at this zone.</p>";
				description += "<p>If set below 601 it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 605 to start and increase over time</p>";
				return description;
			}, 'value', -1, null, 'C2', [1],
			function () { return (autoTrimpSettings.experience.enabled) });
		createSetting('experienceEndBW',
			function () { return ('E: End BW') },
			function () {
				let description = "<p>Will finish the challenge with this Bionic Wonderland level once reaching the end zone specified in <b>E: End Zone</b>.</p>";
				description += "<p><b>If the specified BW is not available, it will run the one closest to the setting.</b></p>";
				description += "<p><b>Recommended:</b> 605 to start and increase over time</p>";
				return description;
			}, 'value', -1, null, 'C2', [1],
			function () { return (autoTrimpSettings.experience.enabled) });

		createSetting('wither',
			function () { return ('Wither') },
			function () {
				let description = "<p>Enable this if you want to automate farming on the <b>Wither</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 70) });
		createSetting('witherFarm',
			function () { return ('W: Farm') },
			function () {
				let description = "<p>Enable this to force farming until you can 4 shot your current world cell on Wither.</p>";
				description += "<p>When at cell 100 it will identify the damage required for reaching the speedbook on the next zone and if you don't have enough damage it will farm until you do.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (getPageSetting('wither', currSettingUniverse) && autoTrimpSettings.wither.require()) });
		createSetting('witherZones',
			function () { return ('W: Wither Zone(s)') },
			function () {
				let description = "<p>Input the zones you would like to Wither on and the script won't farm damage on this and at the end of the previous zone.</p>";
				description += "<p>You can input multiple zones but they need to be seperated by commas.</p>";
				description += "<p>There is a chance you might not Wither on the zones input if you are too powerful.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				return description;
			}, 'multiValue', [-1], null, 'C2', [2],
			function () { return (getPageSetting('wither', currSettingUniverse) && autoTrimpSettings.wither.require()) });
		createSetting('witherShield',
			function () { return ('W: Shield') },
			function () {
				let description = "<p>The name of the shield you would like to equip while running <b>Wither</b>.</p>";
				description += "<p>This will override all other heirloom swapping features and only use this shield during <b>Wither</b>!</p>"
				description += "<p>Should ideally be a shield without the <b>Plaguebringer</b> modifier.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'C2', [2],
			function () { return (getPageSetting('wither', currSettingUniverse) && autoTrimpSettings.wither.require()) });
		/* createSetting('witherMutatorPreset',
			function () { return ('W: Muatator Preset') },
			function () {
				let description = "<p>Will display an additional mutator preset when enabled.</p>";
				description += "<p>This will override <b>Preset Swap Mutators</b> selecting other mutator presets when in the <b>Wither</b> challenge!</p>"
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (getPageSetting('wither', currSettingUniverse) && autoTrimpSettings.wither.require()) }); */

		createSetting('quest',
			function () { return ('Quest') },
			function () {
				let description = "<p>Enable this if you want automate running quests when running the <b>Quest</b> challenge.</p>";
				description += "<p>Will only function properly with <b>AutoMaps</b> enabled.</p>";
				description += "<p>Prestige Raiding is disabled when shield break quests are active to try and ensure you don't die.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 85) });
		createSetting('questMapCap',
			function () { return ('Q: Map Cap') },
			function () {
				let description = "<p>The maximum amount of maps you'd like to run to do a resource or one shot quests.</p>";
				description += "<p><b>Will potentially skip quests if this value is too low!</b></p>";
				description += "<p>During one shot quests it will farm until either you reach the map cap or have enough damage for the quest</p>";
				description += "<p><b>Recommended:</b> 100</p>";
				return description;
			}, 'value', 100, null, 'C2', [2],
			function () { return (getPageSetting('quest', currSettingUniverse) && autoTrimpSettings.quest.require()) });
		createSetting('questSmithyZone',
			function () { return ('Q: Smithy Zone') },
			function () {
				let description = "<p>Will calculate the smithies required for quests based on this settings input and purchase spare ones if possible.</p>";
				description += "<p><b>Will assume zone 85 when running the regular version of Quest.</b></p>";
				description += "<p><b>Will disable the Smithy Farm setting whilst your world zone is below this value.</b></p>";
				description += "<p>This setting requires <b>AT AutoStructure</b> to be enabled to work.</p>";
				description += "<p><b>Recommended:</b> Your desired end zone for Quest</p>";
				return description;
			}, 'value', 999, null, 'C2', [2],
			function () { return (getPageSetting('quest', currSettingUniverse) && autoTrimpSettings.quest.require()) });
		createSetting('questSmithyMaps',
			function () { return ('Q: Smithy Maps') },
			function () {
				let description = "<p>The maximum amount of maps you'd like to run to do a Smithy quest.</p>";
				description += "<p><b>Will potentially skip Smithy quests if this value is too low!</b></p>";
				description += "<p>This setting requires <b>AT AutoStructure</b> to be enabled to work.</p>";
				description += "<p><b>Recommended:</b> 100</p>";
				return description;
			}, 'value', 100, null, 'C2', [2],
			function () { return (getPageSetting('quest', currSettingUniverse) && autoTrimpSettings.quest.require()) });

		createSetting('mayhem',
			function () { return ('Mayhem') },
			function () {
				let description = "<p>Enable this if you want to automate destacking and other features when running the <b>Mayhem</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () {
				return (((!getPageSetting('c2disableFinished') || game.global.mayhemCompletions < 25) && game.stats.highestRadLevel.valueTotal() >= 100) || challengeActive('Mayhem'))
			});
		createSetting('mayhemDestack',
			function () { return ('M: HD Ratio') },
			function () {
				let description = "<p>What HD ratio cut-off to use when farming for the Improbability. If this setting is 100, the script will destack until you can kill the Improbability in 100 average hits or there are no Mayhem stacks remaining to clear.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse) && autoTrimpSettings.mayhem.require()) });
		createSetting('mayhemZone',
			function () { return ('M: Zone') },
			function () {
				let description = "<p>The zone you'd like to start destacking from, can be used in conjunction with <b>M: HD Ratio</b> but when you're at or above this zone it will clear stacks until 0 are remaining regardless of the value set in <b>M: HD Ratio</b>.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse) && autoTrimpSettings.mayhem.require()) });
		createSetting('mayhemMapIncrease',
			function () { return ('M: Map Increase') },
			function () {
				let description = "<p>Increases the minimum map level of Mayhem farming by this value.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and assume a map increase of 0.</p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse) && autoTrimpSettings.mayhem.require()) });
		createSetting('mayhemMP',
			function () { return ('M: Melting Point') },
			function () {
				let description = "<p>The amount of smithies you'd like to run Melting Point at during Mayhem.</p>";
				description += "<p>This overrides the Smithy unique map settings input when set above <b>0</b>.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse) && autoTrimpSettings.mayhem.require()) });
		createSetting('mayhemSwapZone',
			function () { return ('M: Heirloom Swap Zone') },
			function () {
				let description = "<p>The zone you'd like to swap to your afterpush shield on Mayhem.</p>";
				description += "<p>This overrides the " + _getChallenge2Info() + " heirloom swap setting input when set above <b>0</b>.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', currSettingUniverse) && autoTrimpSettings.mayhem.require()) });

		createSetting('storm',
			function () { return ('Storm') },
			function () {
				let description = "<p>Enable this if you want to automate destacking when running the <b>Storm</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 105) });
		createSetting('stormZone',
			function () { return ('S: Zone') },
			function () {
				let description = "<p>From which zone destacking should be considered.</p>";
				description += "<p>Must be used in conjunction with <b>S: Stacks</b></p>";
				description += "<p>If set to <b>0 or below</b> it will never destack.</p>";
				description += "<p><b>Recommended:</b> 6</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('storm', currSettingUniverse) && autoTrimpSettings.storm.require()) });
		createSetting('stormStacks',
			function () { return ('S: Stacks') },
			function () {
				let description = "<p>Minimal amount of stacks to reach before starting destacking</p>";
				description += "<p>Once it starts destacking it will destack until you have no Cloudy stacks remaining.</p>";
				description += "<p>If set to <b>0 or below</b> it will never destack.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			},
			'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('storm', currSettingUniverse) && autoTrimpSettings.storm.require()) });

		createSetting('berserk',
			function () { return ('Berserk') },
			function () {
				let description = "<p>Enable this if you want the script to perform additional actions during the <b>Berserk</b> challenge.</p>";
				description += "<p>If enabled it will only allows mapping settings with a Berserk challenge line to be run.</p>";
				description += "<p>If your army dies then it will go into a level 6 map and farm until you have max Frenzied stacks to ensure you're always the strongest you can be. It <b>will</b> also abandon maps that are in the middle of being run to go obtain these stacks!</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 115) });
		createSetting('berserkDisableMapping',
			function () { return ('B: Disable Mapping') },
			function () {
				let description = "<p>Enabling this setting will disable mapping until your army dies so that you can extend your lives as long as possible.</p>";
				description += "<p>When using this make sure you setup appropriate mapping lines to farm enough should you die. I highly recommend repeat every 1 zone lines for HD Farm, Tribute Farm and Smithy Farm.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'C2', [2],
			function () { return (getPageSetting('berserk', currSettingUniverse) && autoTrimpSettings.berserk.require()) });

		createSetting('pandemonium',
			function () { return ('Pandemonium') },
			function () {
				let description = "<p>Enable this if you want to automate destacking and other features when running the <b>Pandemonium</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";;
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (((!getPageSetting('c2disableFinished') || game.global.pandCompletions < 25) && game.stats.highestRadLevel.valueTotal() >= 150) || challengeActive('Pandemonium')) });

		createSetting('pandemoniumDestack',
			function () { return ('P: HD Ratio') },
			function () {
				let description = "<p>What HD ratio cut-off to use when farming for the Improbability. If this setting is 100, the script will destack until you can kill the Improbability in 100 average hits or there are no Pandemonium stacks remaining to clear.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 10, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require()) });

		createSetting('pandemoniumZone',
			function () { return ('P: Destack Zone') },
			function () {
				let description = "<p>The zone you'd like to start destacking from, can be used in conjunction with <b>P: HD Ratio</b> but when you're at or above this zone it will clear stacks until 0 are remaining regardless of the value set in <b>P: HD Ratio</b>.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require()) });

		createSetting('pandemoniumAE',
			function () { return (['P: Auto Equip Off', 'P: Auto Equip', 'P AE: LMC', 'P AE: Huge Cache']) },
			function () {
				let description = "<p>This setting provides some equipment farming possibilites to help speedup runs.</p>";
				description += "<p><b>Will override equipment purchasing settings when enabled.</b></p>";
				description += "<p>When farming it calculates the equips you'll be able to prestige and farms levels in the other items first then prestiges and upgrades them one at a time to ensure minimal power loss.</p>";
				description += "<p><b>P: Auto Equip Off</b><br>Disables this setting.</p>";
				description += "<p><b>P: Auto Equip</b><br>Will automatically purchase equipment during Pandemonium regardless of efficiency.</p>";
				description += "<p><b>P AE: LMC</b><br>Provides settings to run maps if the cost of equipment levels is less than a single large metal cache. Overrides worker settings to ensure that you farm as much metal as possible.</p>";
				description += "<p><b>P AE: Huge Cache</b><br>Uses the same settings as <b>P: AE LMC</b> but changes to if an equip will cost less than a single huge cache that procs metal. Will automatically switch caches between LMC and HC depending on the cost of equipment to ensure a fast farming speed</p>";

				description += "<p><b>Recommended:</b> P AE: LMC</p>";
				return description;
			}, 'multitoggle', 0, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require()) });

		createSetting('pandemoniumAEZone',
			function () { return ('P AE: Zone') },
			function () {
				let description = "<p>The zone you would like to start equipment farming from.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require() && getPageSetting('pandemoniumAE', currSettingUniverse) > 1) });

		createSetting('pandemoniumAERatio',
			function () { return ('P AE: HD Ratio') },
			function () {
				let description = "<p>Only farm for equipment when your <b>World HD Ratio</b> is above this value.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting and always farm if equips are available to farm.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require() && getPageSetting('pandemoniumAE', currSettingUniverse) > 1) });

		createSetting('pandemoniumStaff',
			function () { return ('P: Staff') },
			function () {
				let description = "<p>The name of the staff you would like to equip while Pandemonium does equipment farming.</p>";
				description += "<p><b>Should ideally be a full metal efficiency staff.</b></p>";
				return description;
			}, 'textValue', 'undefined', null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require() && getPageSetting('pandemoniumAE', currSettingUniverse) > 1) });

		createSetting('pandemoniumMP',
			function () { return ('P: Melting Point') },
			function () {
				let description = "<p>The amount of smithies you'd like to run Melting Point at during Pandemonium.</p>";
				description += "<p>This overrides the Smithy unique map settings input when set above <b>0</b>.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require()) });
		createSetting('pandemoniumSwapZone',
			function () { return ('P: Heirloom Swap Zone') },
			function () {
				let description = "<p>The zone you'd like to swap to your afterpush shield on Pandemonium.</p>";
				description += "<p>This overrides the " + _getChallenge2Info() + " heirloom swap setting input when set above <b>0</b>.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', currSettingUniverse) && autoTrimpSettings.pandemonium.require()) });

		createSetting('glass',
			function () { return ('Glass') },
			function () {
				let description = "<p>Enable this if you want to automate destacking and farming when running the <b>Glass</b> challenge.</p>";
				description += "<p>Will farm for damage if you can't clear stacks in a world level or above map.</p>";
				description += "<p>When at c100 of a zone it checks if you can clear world level maps on the next zone and if you can't it will farm damage until you are able to.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 175) });
		createSetting('glassStacks',
			function () { return ('G: Stacks') },
			function () {
				let description = "<p>Minimal amount of stacks to reach before starting destacking</p>";
				description += "<p>Once it starts destacking it will destack until you have no Glass stacks remaining.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('glass', currSettingUniverse) && autoTrimpSettings.glass.require()) });

		createSetting('desolation',
			function () { return ('Desolation') },
			function () {
				let description = "<p>Enable this if you want to automate destacking and other features when running the <b>Desolation</b> challenge.</p>";
				description += "<p>Once this starts destacking it will destack until you have no chilled stacks remaining.</p>";
				description += "<p>If enabled then this will <b>always</b> reduce your chilled stacks to 0 before doing any other form of mapping.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (((!getPageSetting('c2disableFinished') || game.global.desoCompletions < 25) && game.stats.highestRadLevel.valueTotal() >= 200) || challengeActive('Desolation')) });
		createSetting('desolationDestack',
			function () { return ('D: HD Ratio') },
			function () {
				let description = "<p>At what HD ratio destacking should be considered.</p>";
				description += "<p>Must be used in conjunction with <b>D: Stacks</b>.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 0.0001</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });
		createSetting('desolationZone',
			function () { return ('D: Zone') },
			function () {
				let description = "<p>From which zone destacking should be considered.</p>";
				description += "<p>Must be used in conjunction with <b>D: Stacks</b>.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });
		createSetting('desolationStacks',
			function () { return ('D: Stacks') },
			function () {
				let description = "<p>Minimal amount of stacks to reach before starting destacking</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and automatically destack at 300 stacks.</p>";
				description += "<p>Once it starts destacking it will destack until you have no Chilled stacks remaining.</p>";
				description += "<p><b>Recommended:</b> 300</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });
		createSetting('desolationOnlyDestackZone',
			function () { return ('D: Only Destack Z') },
			function () {
				let description = "<p>From which zone only destacking should be considered. This will stop it caring about farming for metal to improve gear.</p>";
				description += "<p>Purchases the highest level of map that you can afford and survive to reduce chilled stacks faster.</p>";
				description += "<p>Disables perfect maps and sets sliders to minimum for all options to reduce fragment spending.</p>";
				description += "<p>If using <b>Auto Equality: Advanced</b> will set your equality level to the max it can be whilst destacking."
				description += "<p><b>Recommended:</b> 20 below Desolation end zone or when you stop clearing your destacking maps.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });
		createSetting('desolationSpecial',
			function () { return ('D: Hyperspeed 2 LMC') },
			function () {
				let description = "<p>If enabled this will use the Large Metal Cache special rather than not using a special modifier when destacking on zones that you have the hyperspeed 2 talent active.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });
		createSetting('desolationMP',
			function () { return ('D: Melting Point') },
			function () {
				let description = "<p>The amount of smithies you'd like to run Melting Point at during Desolation.</p>";
				description += "<p>This overrides the Smithy unique map settings input when set above <b>0</b>.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });
		createSetting('desolationSwapZone',
			function () { return ('D: Heirloom Swap') },
			function () {
				let description = "<p>The zone you'd like to swap to your afterpush shield on Desolation.</p>";
				description += "<p>This overrides the " + _getChallenge2Info() + " heirloom swap setting input when set above <b>0</b>.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });

		createSetting('desolationSettings',
			function () { return ('Desolation Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like to prestige scum gear whilst running <b>Desolation</b>.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>This definitely shouldn't exist so be aware this is exploiting unintentional game mechanics.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Desolation Gear Scumming")', 'C2', [2],
			function () { return (getPageSetting('desolation', currSettingUniverse) && autoTrimpSettings.desolation.require()) });

		createSetting('smithless',
			function () { return ('Smithless') },
			function () {
				let description = "<p>Enable this if you want to automate farming to obtain maximum Enhanced Armor stacks against Ubersmiths when running the <b>Smithless</b> challenge.</p>";
				description += "<p>It will identify breakpoints that can be reached with max tenacity & max map bonus to figure out how many stacks you are able to obtain from an Ubersmith and farm till it reachs that point if it's attainable.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 201) });
		createSetting('smithlessFarmTime',
			function () { return ('S: Max Farm Time') },
			function () {
				let description = "<p>The max amount of time in minutes you'd like to farm for stats.</p>";
				description += "<p>Set to <b>0</b> to disable farming and set to <b>-1 or below</b> to farm forever.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('smithless', currSettingUniverse) && autoTrimpSettings.smithless.require()) });
		createSetting('smithlessMapBonus',
			function () { return ('S: Max Map Bonus') },
			function () {
				let description = "<p>Will get max map bonus stacks when fighting against an Ubersmith.</p>";
				description += "<p>It will still obtain map bonus stacks even if you disable or it goes past the time input in the farm time setting.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'C2', [2],
			function () { return (getPageSetting('smithless', currSettingUniverse) && autoTrimpSettings.smithless.require()) });
	}
	
	const displayDaily = true
	if (displayDaily) {
		createSetting('heliumyPercent',
			function () {
				return ('Buy ' + (currSettingUniverse === 2 ? "Radonculous" : "Heliumy") + ' %')
			},
			function () {
				let description = "<p>Buys the " + (currSettingUniverse === 2 ? "Radonculous" : "Heliumy") + " bonus for <b>100 bones</b> when the daily bonus is above this value.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> Anything above 475.</p>";
				return description;
			}, 'value', -1, null, 'Daily', [1, 2]);

		createSetting('bloodthirstDestack',
			function () { return ('Bloodthirst Destack') },
			function () {
				let description = "<p>Will automatically run a level 6 map when you are one bloodthirst stack (death) away from the enemy healing and gaining additional attack.</p>";
				description += "<p><b>Won't function without Auto Maps enabled.</b></p>"
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Daily', [1, 2]);
		createSetting('bloodthirstMaxStacks',
			function () { return ('Bloodthirst TTK Check') },
			function () {
				let description = "<p>When mapping on a daily with the bloodthirst modifier this will cause Auto Equality to check if you can kill your current enemy in less hits than it will heal from bloodthirst stack accumulation and if it doesn't it will suicide your trimps until it has max stacks.</p>";
				description += "<p>Requires your auto equality setting to be set to <b>Auto Equality: Advanced</b> to work.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Daily', [2]);
		createSetting('bloodthirstVoidMax',
			function () { return ('Void: Max Bloodthirst') },
			function () {
				let description = "<p>Will make your Void HD Ratio assume you have max bloodthirst stacks active if you're in a bloodthirst daily.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1, 2]);
		createSetting('empowerAutoEquality',
			function () { return ('AE: Empower') },
			function () {
				let description = "<p>When the empower mod is active it will automatically adjust calculations for enemy stats to factor in either explosive or crit modifiers if they're active on the current daily.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Daily', [2],
			function () { return (getPageSetting('equalityManagement') === 2) });
		createSetting('mapOddEvenIncrement',
			function () { return ('Odd/Even Increment') },
			function () {
				let description = "<p>Will automatically increment your farming settings world input by 1 if the current zone has a negative even or odd related buff. If the daily has both types of mods it will try to identify which one is worse and skip farming on that zone type.</b></p>";
				description += "<p>Will only impact the following settings: Heirloom swap zone, Void Maps, Map Farm" + (currSettingUniverse === 2 ? ", Tribute Farm, Worshipper Farm, Smithy Farm." : ".") + "</p>";
				description += "<p>Prints a message in your message log everytime you start a zone with negative mods telling you it will skip the farming settings mentioned above.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1, 2]);
		createSetting('avoidEmpower',
			function () { return ('Avoid Empower') },
			function () {
				let description = "<p>Tries to avoid Empower stacks during empower dailies by suiciding your trimps when the enemies next hit will kill them.</p>";
				description += "<p>Doesn't factor in damage taken from the Explosive daily modifier.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Daily', [1]);
		createSetting('dscryvoidmaps',
			function () { return ('D: VM Scryer') },
			function () {
				let description = "<p>Will override any stance settings and set your stance to Scryer during Void Maps if you have the <b>Scryhard II</b> talent.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1]);

			/* Rename this */
		createSetting('dIgnoreSpiresUntil',
			function () { return ('D: Ignore Spires Until') },
			function () {
				let description = "<p>Will disable all of the Spire features unless you're in a Spire at or above this value.</p>";
				description += "<p><b>This works based off Spire number rather than zone. So if you want to ignore Spires until Spire II at z300 then enter 2, Spire III at z400 would be 3 etc.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and make the script assume every Spire is an active Spire.</p>";
				description += "<p><b>Recommended:</b> Second to last Spire you reach on your runs</p>";
				return description;
			}, 'value', -1, null, 'Daily', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });
		createSetting('dExitSpireCell',
			function () { return ('D: Exit Spire After Cell') },
			function () {
				let description = "<p>Will exit out of active Spires upon clearing this cell.</p>";
				description += "<p><b>Works based off cell number so if you want it to exit after Row #4 then set to 40.</b></p>";
				description += "<p>Any health or damage calculations for the Spire will be based off this cell if set.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'Daily', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });
		createSetting('dPreSpireNurseries',
			function () { return ('D: Nurseries pre-Spire') },
			function () {
				let description = "<p>Set the number of <b>Nurseries</b> to build during active Spires.</p>";
				description += "<p><b>Will override any <b>Nursery</b> settings that you have setup in the <b>AT AutoStructure</b> setting.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'Daily', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });
		createSetting('dAutoDStanceSpire',
			function () { return ('D Stance in Spires') },
			function () {
				let description = "<p>Enabling this setting will force the script to only use Domination stance during Spires and not inside maps.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 170) });

		createSetting('dAutoStanceWind',
			function () { return ('D: Wind Stacking') },
			function () {
				let description = "<p>Enabling this will give you settings to allow you to wind stack in your runs.</p>";
				description += "<p>Will use your regular <b>Auto Stance</b> setting when outside of zones you're wind stacking in.</p>";
				description += "<p>The script evaluates the use of wind stance based on these settings. It examines the cells from the current one up to the maximum overkill range in scryer stance. If none of these cells contain enemies that drop helium, the script switches to scryer stance instead</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1],
			function () { return (game.empowerments.Wind.retainLevel >= 50) });
		createSetting('dWindStackingZone',
			function () { return ('D: Wind Stack Zone') },
			function () {
				let description = "<p>Enables wind stacking in zones above and inclusive of the zone set.</p>";
				description += "<p><b>Recommended:</b> 100 zones below portal zone</p>";
				return description;
			}, 'value', -1, null, 'Daily', [1],
			function () { return (autoTrimpSettings.dAutoStanceWind.enabled) });
		createSetting('dWindStackingRatio',
			function () { return ('D: Wind Stack H:D') },
			function () {
				let description = "<p>If your H:D ratio is above this setting it will not use wind stance.</p>";
				description += "<p>If set to <b>0 or below</b> it will always use wind stance when at or above your wind stack zone input.</p>";
				description += "<p><b>Recommended:</b> 1000</p>";
				return description;
			}, 'value', -1, null, 'Daily', [1],
			function () { return (autoTrimpSettings.dAutoStanceWind.enabled) });
		createSetting('dWindStackingLiq',
			function () { return ('Wind Stack Liquification') },
			function () {
				let description = "<p>Will wind stack during liquification regardless of your <b>Daily Wind Stack H:D</b> or <b>Daily Wind Stack Zone</b> inputs.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1],
			function () { return (autoTrimpSettings.dAutoStanceWind.enabled) });

		createSetting('dailyPortalStart',
			function () { return ('Auto Start Daily') },
			function () {
				let description = "<p>When you portal with this on it will start a daily for you if there's any available. Will select the oldest daily available and run it.</p>";
				description += "<p><b>Recommended:</b> Only on when you want to run dailies</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1, 2]);
		createSetting('dailyPortal',
			function () { return (['Daily Portal: Off', 'Daily Portal: ' + _getPrimaryResourceInfo().abv + '/Hr', 'Daily Portal: Custom']) },
			function () {
				let description = "<p>Will automatically portal into different challenges depending on the way you setup the Daily Auto Portal related settings. The challenge that it portals into can be setup through the <b>Auto Portal</b> settings in the <b>Core</b> tab.</p>";
				description += "<p>Additional settings appear when <b>Daily Portal: " + _getPrimaryResourceInfo().abv + "/Hr</b> or <b>Daily Portal: Custom</b> are selected.</p>";
				description += "<p><b>Daily Portal Off</b><br>Disables this setting. Be warned it will never end your dailies unless you use the Portal After option in Void Map settings!</p>";

				description += "<p><b>Daily Portal: " + _getPrimaryResourceInfo().abv + "/Hr</b><br>Portals into new runs when your " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour goes below your current runs best " + _getPrimaryResourceInfo().abv.toLowerCase() + "/hr.</p>";
				description += "<p>There is a <b>Buffer</b> setting, which lowers the check from best " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour to (best - buffer setting) " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour.</p>";
				description += "<p><b>Daily Portal: Custom</b><br>Will portal into your Auto Portal challenge at the zone specified in the <b>Daily Portal Zone</b> setting.</p>";
				description += "<p><b>Recommended:</b> " + (currSettingUniverse === 2 ? "Daily Portal: Custom with a specified endzone to make use of the Scruffy level 3 ability" : ("Daily Portal: " + _getPrimaryResourceInfo().abv + "/Hr")) + "</p>";
				return description;
			}, 'multitoggle', 0, null, 'Daily', [1, 2]);

		createSetting('dailyPortalZone',
			function () { return ('Daily Portal Zone') },
			function () {
				let description = "<p>Will automatically portal once this zone is reached when using the <b>Daily Portal: Custom</b> Auto Portal setting.</p>";
				description += "<p>Setting this to <b>200</b> would portal when you reach <b>zone 200</b>.</p>";
				description += "<p><b>Recommended:</b> The zone you would like your run to end</p>";
				return description;
			}, 'value', 999, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) >= 2) });

		createSetting('dailyDontPortalBefore',
			function () { return ("D: Don't Portal Before") },
			function () {
				let description = "<p>Will stop the script from automatically portaling before the specified zone when using the <b>Daily Portal: " + _getPrimaryResourceInfo().abv + "/Hr</b> Auto Portal setting.</p>";
				description += "<p>It is an additional check that prevents drops in " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour from triggering Auto Portal.</p>";
				description += "<p>The portal after checkbox in <b>Void Map Setting</b> will override this and allow portaling before the zone set here.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and assume any zone is okay to portal on.</p>";
				description += "<p><b>Recommended:</b> The minimum zone you would like your run to reach</p>";
				return description;
			}, 'value', 999, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) === 1) });

		createSetting('dailyHeliumHrBuffer',
			function () { return ('D: ' + _getPrimaryResourceInfo().abv + '/Hr Buffer %') },
			function () {
				let description = "<p>When using the <b>Daily Portal: " + _getPrimaryResourceInfo().abv + "/Hr</b> Auto Portal setting, it will portal if your " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour drops by this settings % input lower than your best for current run.</p>";
				description += "<p>Allows portaling midzone if you exceed the set buffer amount by 5x. (ie a normal 2% buffer setting would now portal mid-zone if you fall below 10% buffer).</p>";
				description += "<p><b>Set to 0 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> 4</p>";
				return description;
			}, 'value', 0, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) === 1) });

		createSetting('dailyHeliumHrPortal',
			function () {
				let hze =game.stats.highestLevel.valueTotal();
				let portalOptions =['Auto Portal Immediately', 'Portal After Voids'];
				if (currSettingUniverse === 1 && hze >= 230) portalOptions.push('Portal After Poison Voids');
				return portalOptions;
			},
			function () {
				let description = "<p>How you would like to portal when below your " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour threshold.</p>";
				description += "<p><b>Auto Portal Immediately</b><br>Will auto portal straight away.</p>";
				description += "<p><b>Portal After Voids</b><br>Will run any remaining void maps then proceed to portal.</p>";
				if (currSettingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 230) description += "<p><b>Portal After Poison Voids</b><br>Will continue your run until you reach the next poison zone and run void maps there.</p>";
				description += "<p><b>Recommended:</b> Portal After Voids</p>";
				return description;
			}, 'multitoggle', 0, null, 'Daily', [1, 2],
			function () {
				return (getPageSetting('dailyPortal', currSettingUniverse) === 1)
			});

		createSetting('dailyHeliumHrExitSpire',
			function () { return ('Exit Spires for Voids') },
			function () {
				let description = "<p>Will automatically exit Spires to run your voids earlier when the <b>" + _getPrimaryResourceInfo().name + " Per Hour</b> Auto Portal setting is wanting to portal.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) === 1 && game.stats.highestLevel.valueTotal() >= 170) });

		createSetting('dailyPortalFiller',
			function () { return ('Filler Run') },
			function () {
				let description = "<p>Will run a filler (non daily/" + _getChallenge2Info() + " run) challenge (selected through the <b>Auto Portal</b> settings in the <b>Core</b> tab) inbetween dailies.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			},
			'boolean', false, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', currSettingUniverse) > 0) });

		createSetting('dailyPortalPreviousUniverse',
			function () { return ('Daily Previous Universe') },
			function () {
				let description = "<p>Will start your dailies in the previous universe. Takes you back to this universe after it has finished running.</p>";
				description += "<p>Ensure you setup daily settings for the <b>previous universe</b>.<br>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			},
			'boolean', false, null, 'Daily', [2]);

		createSetting('dailyDontCap',
			function () { return ('Use When Capped') },
			function () {
				let description = "<p>Will cause the script to only start dailies when you have at least the amount of dailies input in the <b>UWC: Amount</b> setting available to run.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			},
			'boolean', false, null, 'Daily', [1, 2]);

		createSetting('dailyDontCapAmt',
			function () { return ('UWC: Amount') },
			function () {
				let description = "<p>Will cause the script to only start dailies when you have at least this amount available to run.</p>";
				description += "<p><b>Recommended:</b> 7</p>";
				return description;
			},
			'value', 7, null, 'Daily', [1, 2],
			function () { return getPageSetting('dailyDontCap', currSettingUniverse) });

		createSetting('dailySkip',
			function () { return ('Skip Daily') },
			function () {
				let description = "<p>Use this to make the script skip specific dailies when starting runs.</p>";
				description += "<p>Must be input with same format as the game uses which is <b>'YEAR-MONTH-DAY'</b>.</p>"
				description += "<p>An example of an input would be <b>'2023-04-22'</b>.</p>"
				description += "<p>Can have multiple inputs, seperate them by commas.</p>"
				return description;
			},
			'multiTextValue', [0], null, 'Daily', [1, 2]);

		createSetting('dailyPortalSettingsArray',
			function () { return ('Daily Portal Settings') },
			function () { return ('Click to adjust settings.') },
			'mazDefaultArray', {
			Reflect: { enabled: false, zone: 0 },
			Empower: { enabled: false, zone: 0 },
			Mutimp: { enabled: false, zone: 0 },
			Bloodthirst: { enabled: false, zone: 0 },
			Famine: { enabled: false, zone: 0 },
			Large: { enabled: false, zone: 0 },
			Weakness: { enabled: false, zone: 0 },
			Empowered_Void: { enabled: false, zone: 0 },
			Heirlost: { enabled: false, zone: 0 },
		}, null, 'Daily', [1, 2],
			function () { return (false) });
	}
	
	const displayHeirlooms = true;
	if (displayHeirlooms) {
		createSetting('heirloom',
			function () { return ('Heirloom Swapping') },
			function () {
				let description = "<p>Master switch for whether the script will do any form of heirloom swapping.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2]);

		createSetting('heirloomMapSwap',
			function () { return ('Map Swap') },
			function () {
				let description = "<p>If below your assigned swap zone this will automatically swap from your <b>Initial</b> shield to your <b>Afterpush</b> (or <b>" + _getChallenge2Info() + "</b> depending on your run) shield when inside of maps.</p>";
				description += "<p><b>Void shield settings will override this.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomPostVoidSwap',
			function () { return ('Post Void Swap') },
			function () {
				let description = "<p>If you have completed any void maps on your run this will set your swap zone to 0 to maximise damage in your afterpush.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomVoidSwap',
			function () { return ('Void PB Swap') },
			function () {
				let description = "<p>When inside Void Maps and your current enemy is slow with your next enemy being fast this will automatically swap to your <b>Void PB</b> shield so that you can maximise PlagueBringer damage going into the next enemy.</p>";
				description += "<p><b>Won't do anything during double attack voids.</b></p>";
				description += "<p>Will only work if your <b>Void</b> Shield doesn't have <b>PlagueBringer</b> and your <b>Void PB</b> shield has <b>PlagueBringer</b>.</p>";
				description += "<p><b>Recommended:</b> Off unless you know what you're doing</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomCompressedSwap',
			function () { return ('Compressed Swap') },
			function () {
				let description = "<p>When the cell after next is compressed and you are past your heirloom swap zone this will equip your <b>Initial</b> shield so that the next enemy spawns with max health to maximise plaguebringer damage on it.</p>";
				description += "<p>Will ensure you start the compressed cell at the lowest health it can be from plaguebringer which reduces initial rage stack if the enemy has it and the clear time.</p>";
				description += "<p>Will only work if your <b>Initial</b> Shield doesn't have <b>PlagueBringer</b> and your <b>Afterpush</b> shield has <b>PlagueBringer</b>.</p>";
				description += "<p>Displays an additional setting when enabled where you can force swap to your <b>Afterpush</b> shield when above X <b>World HD Ratio</b> and the next cell is compressed.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse) && game.stats.highestRadLevel.valueTotal() >= 203) });

		createSetting('heirloomShield',
			function () { return ('Shields') },
			function () {
				let description = "<p>Switch for enabling Shield heirloom swapping.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p>Respects the <b>Auto Abandon</b> setting for if Shields should be swapped but ignores the cell check.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse)) });

		createSetting('heirloomInitial',
			function () { return ('Initial') },
			function () {
				let description = "<p>Shield to use before your designated swap zone.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> a shield with void map drop chance</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomAfterpush',
			function () { return ('Afterpush') },
			function () {
				let description = "<p>Shield to use after your designated swap zone.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> a shield without void map drop chance</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomC3',
			function () { return (_getChallenge2Info()) },
			function () {
				let description = "<p>Shield to use after your designated swap zone during " + _getSpecialChallengeDescription() + " runs.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> a shield without void map drop chance</p>";
				return description;
			},
			'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });
			
		createSetting('heirloomBreed',
			function () { return ('Breed') },
			function () {
				let description = "<p>Shield to use when your army is dead and breeding.</p>";
				description += "<p>This will override all other heirloom swapping features when active!</p>";
				description += "<p>Should ideally be a shield with the <b>Breedspeed</b> modifier.</p>";
				description += "<p>Mapping decisions will be disabled when in world or the map chamber and using this heirloom so make sure it has a different name from your other heirloom settings!</p>";
				if (currSettingUniverse === 1) description += "<p>If you have any levels in the <b>Anticipation</b> perk then this setting will be ignored when deciding which shield to use.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomVoid',
			function () { return ('Void') },
			function () {
				let description = "<p>Shield to use inside of Void Maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> damage heirloom</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomVoidPlaguebringer',
			function () { return ('Void PB') },
			function () {
				let description = "<p>Shield to use inside of Void Maps when fighting a slow enemy and the next enemy is fast.</p>";
				description += "<p><b>Ignore Spires Until</b> settings will stop this swap from happening if the value is above your current world zone.</p>";
				description += "<p>A shield with <b>Plaguebringer MUST</b> be used.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> <b>Plaguebringer</b> heirloom</p>";
				return description;
			},
			'textValue', 'undefined', null, 'Heirloom', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse) && getPageSetting('heirloomVoidSwap', currSettingUniverse)) });

			createSetting('heirloomSpire',
				function () { return ('Spire') },
				function () {
					let description = "<p>Shield to use during active Spires.</p>";
					description += "<p><b>Ignore Spires Until</b> settings will stop this swap from happening if the value is above your current world zone.</p>";
					description += "<p>The Map Swap setting will override this whilst in maps.</p>";
					description += "<p>Set to <b>undefined</b> to disable.</p>";
					description += "<p><b>Recommended:</b> Damage+Health heirloom</p>";
					return description;
				}, 'textValue', 'undefined', null, 'Heirloom', [1],
				function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse) && game.stats.highestLevel.valueTotal() >= 170) });

			createSetting('heirloomWindStack',
				function () { return ('Wind Stacking') },
				function () {
					let description = "<p>Shield to use when Wind stance is being used.</p>";
					description += "<p>The Map Swap setting will override this whilst in maps.</p>";
					description += "<p>Set to <b>undefined</b> to disable.</p>";
					description += "<p><b>Recommended:</b> Plaguebringer heirloom</p>";
					return description;
				}, 'textValue', 'undefined', null, 'Heirloom', [1],
				function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse) && game.empowerments.Wind.retainLevel >= 50) });

		createSetting('heirloomSwapZone',
			function () { return ('Swap Zone') },
			function () {
				let description = "<p>From which zone to swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield during filler (non daily/" + _getChallenge2Info() + " runs).</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>If set to <b>75</b> it will swap shields from <b>z75</b> onwards.</p>";
				return description;
			}, 'value', -1, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomSwapZoneDaily',
			function () { return ('Daily Swap Zone') },
			function () {
				let description = "<p>From which zone to swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield during daily runs.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>If set to <b>75</b> it will swap shields from <b>z75</b> onwards.</p>";
				return description;
			},
			'value', -1, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomSwapZoneC3',
			function () { return (_getChallenge2Info() + ' Swap Zone') },
			function () {
				let description = "<p>From which zone to swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield during " + _getChallenge2Info() + " runs.</p>";
				description += "<p>If the " + _getChallenge2Info() + " shield setting has been setup then it will use that instead of the <b>Afterpush</b> shield.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>If set to <b>75</b> it will swap shields from <b>z75</b> onwards.</p>";
				return description;
			}, 'value', -1, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

			createSetting('heirloomSwapZoneOneOff',
			function () { return ('One Off Swap Zone') },
			function () {
				let description = "<p>From which zone to swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield during one off runs.</p>";
				description += "<p>If the " + _getChallenge2Info() + " shield setting has been setup then it will use that instead of the <b>Afterpush</b> shield.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>If set to <b>75</b> it will swap shields from <b>z75</b> onwards.</p>";
				return description;
			}, 'value', -1, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomSwapHD',
			function () { return ('HD Ratio Swap') },
			function () {
				let description = "<p>Will swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield when your <b>World HD Ratio</b> is above this value.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse)) });

		createSetting('heirloomSwapHDCompressed',
			function () { return ('Comp Swap HD') },
			function () {
				let description = "<p>Will swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield when the next cell is compressed and your <b>World HD Ratio</b> is above this value.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Heirloom', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomShield', currSettingUniverse) && getPageSetting('heirloomCompressedSwap', currSettingUniverse)) });

		createSetting('heirloomStaff',
			function () { return ('Staffs') },
			function () {
				let description = "<p>Switch for enabling Staff heirloom swapping.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse)) });

		createSetting('heirloomStaffWorld',
			function () { return ('World') },
			function () {
				let description = "<p>The staff to use when in world zones.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> High pet XP staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffMap',
			function () { return ('Map') },
			function () {
				let description = "<p>The staff to use when running maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p>Will be overridden by the cache heirloom settings if they've been setup.</p>";
				description += "<p><b>Recommended:</b> Resource efficiency heavy staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffVoid',
			function () { return ('Void') },
			function () {
				let description = "<p>The staff to use when running <b>Void</b> maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated metal efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffFragment',
			function () { return ('Fragment') },
			function () {
				let description = "<p>The staff to use when the script is farming for fragments to be able to afford maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated metal efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffFood',
			function () { return ('Savory Cache') },
			function () {
				let description = "<p>The staff to use when running <b>Savory Cache</b> maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p>If set then when the heirloom calculator evaluates modifiers for heirlooms with this name it will evaluate Farmer Efficiency instead of Miner Efficiency.</p>";
				description += "<p><b>Recommended:</b> Dedicated food efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffWood',
			function () { return ('Wooden Cache') },
			function () {
				let description = "<p>The staff to use when running <b>Wooden Cache</b> maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p>If set then when the heirloom calculator evaluates modifiers for heirlooms with this name it will evaluate Lumberjack Efficiency instead of Miner Efficiency.</p>";
				description += "<p><b>Recommended:</b> Dedicated wood efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffMetal',
			function () { return ('Metal Cache') },
			function () {
				let description = "<p>The staff to use when running <b>Metal Cache</b> maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated metal efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomStaffScience',
			function () { return ('Research Cache') },
			function () {
				let description = "<p>The staff to use when running <b>Research Cache</b> maps.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p>If set then when the heirloom calculator evaluates modifiers for heirlooms with this name it will evaluate Science Efficiency instead of Miner Efficiency.</p>";
				description += "<p><b>Recommended:</b> Dedicated science efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [2],
			function () { return (getPageSetting('heirloom', currSettingUniverse) && getPageSetting('heirloomStaff', currSettingUniverse)) });

		createSetting('heirloomAuto',
			function () { return ('Auto Heirlooms') },
			function () {
				let description = "<p>Master switch for whether the script will try to keep any of the heirlooms in your temporary section when portaling.</p>";
				description += "<p>This setting <b>won't recycle</b> any of your carried heirlooms, it only checks your temporary section.</p>";
				description += "<p>When run it will check the mods you want the heirloom to have and checks if the heirlooms in your temporary section for the type(s) you have selected to keep have all of the selected mods and if any do they will be stashed otherwise will be recycled.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2]);

		createSetting('heirloomAutoTypeToKeep',
			function () {
				let heirloomOptions = ['None', 'Shields', 'Staffs', 'All'];
				if (currSettingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 200) heirloomOptions.push('Cores');
				return (heirloomOptions)
			},
			function () {
				let description = "<p>Controls the heirloom types that the script will try to keep.</p>";
				description += "<p><b>Shields</b><br>Will check to see if any <b>Shield</b> heirlooms should be kept when portaling.</p>";
				description += "<p><b>Staffs</b><br>Will check to see if any <b>Staff</b> heirlooms should be kept when portaling.</p>";
				description += "<p><b>All</b><br>Will check to see if <b>ANY</b> heirlooms should be kept when portaling.</p>";
				if (currSettingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 200) description += "<p><b>Cores</b><br>Will check to see if any <b>Core</b> heirlooms should be kept when portaling.</p>";
				description += "<p><b>Recommended:</b> The type of heirlooms you need</p>";
				return description;
			},
			'multitoggle', 0, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		createSetting('heirloomAutoRarityPlus',
			function () { return ('Rarity+') },
			function () {
				let description = "<p>Overrides <b>Rarity to Keep</b> recycling heirlooms of a higher quality and instead allows the script to look at if they'd be worth keeping.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		createSetting('heirloomAutoModTarget',
			function () { return ('Mod Target Count') },
			function () {
				let description = "<p>Allows you to make it so that auto heirlooms will keep heirlooms if they have <b>X</b> amount of the mods you have setup in the different heirloom type options.</p>";
				description += "<p>When using this I recommend not setting any of the mod inputs to <b>Any</b> as it can cause you to keep heirlooms with more suboptimal mods than you desire.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and have the script assume you want to only keep perfect heirlooms.</p>";
				description += "<p><b>Recommended:</b> 0</p>";
				return description;
			}, 'value', 0, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		createSetting('heirloomAutoShield',
			function () { return ('Shields') },
			function () {
				let description = "<p>Enable to allow you to select the shield modifiers you would like to target.</p>";
				description += "<p>Auto Heirlooms won't keep any shields if this setting is disabled.</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		createSetting('heirloomAutoRareToKeepShield',
			function () { return ('Rarity to Keep') },
			function () {
				let description = "<p>When identifying which heirlooms to keep will look at this rarity of heirloom and recycle others.</p>";
				description += "<p>Will only display tiers that can currently be obtained based on your highest zone reached.</p>";
				description += "<p>Only display the mods available for your selected heirloom tier.</p>";
				description += "<p><b>Recommended:</b> Highest tier available</p>";
				return description;
			}, 'dropdown', 'None', function () {
				let hze;
				let heirloomTiersAvailable;
				if (currSettingUniverse === 2) {
					hze = game.stats.highestRadLevel.valueTotal();
					heirloomTiersAvailable = ['Plagued', 'Radiating'];
					if (hze >= 100) heirloomTiersAvailable.push('Hazardous');
					if (hze >= 200) heirloomTiersAvailable.push('Enigmatic');
				}
				else {
					hze = game.stats.highestLevel.valueTotal();
					heirloomTiersAvailable = ['Common', 'Rare'];
					if (hze >= 60) heirloomTiersAvailable.push('Epic');
					if (hze >= 100) heirloomTiersAvailable.push('Legendary');
					if (hze >= 125) heirloomTiersAvailable.push('Magnificent');
					if (hze >= 146) heirloomTiersAvailable.push('Ethereal');
					if (hze >= 230) heirloomTiersAvailable.push('Magmatic');
					if (hze >= 500) heirloomTiersAvailable.push('Plagued');
				}
				return heirloomTiersAvailable;
			}, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse)) });

		createSetting('heirloomAutoShieldBlacklist',
			function () { return ('Blacklist') },
			function () {
				let description = "<p>Will automatically recycle Shield heirlooms with the mods you input into this setting.</p>";
				description += "<p>Mod names must be entered exactly the same as they appear in the mod dropdown settings.</p>";
				description += "<p>You can input multiple modifier names but they need to be seperated by commas.</p>";
				return description;
			}, 'multiTextValue', 'None', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse)) });

		createSetting('heirloomAutoShieldMod1',
			function () { return ('Mod 1') },
			function () {
				let description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Shield'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 0)
			});

		createSetting('heirloomAutoShieldMod2',
			function () { return ('Mod 2') },
			function () {
				let description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Shield'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 1)
			});

		createSetting('heirloomAutoShieldMod3',
			function () { return ('Mod 3') },
			function () {
				let description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Shield'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 2)
			});

		createSetting('heirloomAutoShieldMod4',
			function () { return ('Mod 4') },
			function () {
				let description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Shield'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 5)
			});

		createSetting('heirloomAutoShieldMod5',
			function () { return ('Mod 5') },
			function () {
				let description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Shield'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 7)
			});

		createSetting('heirloomAutoShieldMod6',
			function () { return ('Mod 6') },
			function () {
				let description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Shield'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 9)
			});

		createSetting('heirloomAutoShieldMod7',
			function () { return ('Mod 7') },
			function () {
				let description = "<p>Keeps Shields with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Shield'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoShield', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepShield', currSettingUniverse)) >= 11)
			});

		createSetting('heirloomAutoStaff',
			function () { return ('Staffs') },
			function () {
				let description = "<p>Enable to allow you to select the staff modifiers you would like to target.</p>";
				description += "<p>Auto Heirlooms won't keep any staffs if this setting is disabled.</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		createSetting('heirloomAutoRareToKeepStaff',
			function () { return ('Rarity to Keep') },
			function () {
				let description = "<p>When identifying which heirlooms to keep will look at this rarity of heirloom and recycle others.</p>";
				description += "<p>Will only display tiers that can currently be obtained based on your highest zone reached.</p>";
				description += "<p>Only display the mods available for your selected heirloom tier.</p>";
				description += "<p><b>Recommended:</b> Highest tier available</p>";
				return description;
			}, 'dropdown', 'None', function () {
				let hze;
				let heirloomTiersAvailable;
				if (currSettingUniverse === 2) {
					hze = game.stats.highestRadLevel.valueTotal();
					heirloomTiersAvailable = ['Plagued', 'Radiating'];
					if (hze >= 100) heirloomTiersAvailable.push('Hazardous');
					if (hze >= 200) heirloomTiersAvailable.push('Enigmatic');
				}
				else {
					hze = game.stats.highestLevel.valueTotal();
					heirloomTiersAvailable = ['Common', 'Rare'];
					if (hze >= 60) heirloomTiersAvailable.push('Epic');
					if (hze >= 100) heirloomTiersAvailable.push('Legendary');
					if (hze >= 125) heirloomTiersAvailable.push('Magnificent');
					if (hze >= 146) heirloomTiersAvailable.push('Ethereal');
					if (hze >= 230) heirloomTiersAvailable.push('Magmatic');
					if (hze >= 500) heirloomTiersAvailable.push('Plagued');
				}
				return heirloomTiersAvailable;
			}, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse)) });

		createSetting('heirloomAutoStaffBlacklist',
			function () { return ('Blacklist') },
			function () {
				let description = "<p>Will automatically recycle Staff heirlooms with the mods you input into this setting.</p>";
				description += "<p>Mod names must be entered exactly the same as they appear in the mod dropdown settings.</p>";
				description += "<p>You can input multiple modifier names but they need to be seperated by commas.</p>";
				return description;
			}, 'multiTextValue', 'None', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse)) });

		createSetting('heirloomAutoStaffMod1',
			function () { return ('Mod 1') },
			function () {
				let description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Staff'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 0)
			});

		createSetting('heirloomAutoStaffMod2',
			function () { return ('Mod 2') },
			function () {
				let description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Staff'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 1)
			});

		createSetting('heirloomAutoStaffMod3',
			function () { return ('Mod 3') },
			function () {
				let description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Staff'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 2)
			});

		createSetting('heirloomAutoStaffMod4',
			function () { return ('Mod 4') },
			function () {
				let description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Staff'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 5)
			});

		createSetting('heirloomAutoStaffMod5',
			function () { return ('Mod 5') },
			function () {
				let description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Staff'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 7)
			});

		createSetting('heirloomAutoStaffMod6',
			function () { return ('Mod 6') },
			function () {
				let description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Staff'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 9)
			});

		createSetting('heirloomAutoStaffMod7',
			function () { return ('Mod 7') },
			function () {
				let description = "<p>Keeps Staffs with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Staff'); }, 'Heirloom', [1, 2],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal', 'Magmatic', 'Plagued', 'Radiating', 'Hazardous', 'Enigmatic'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoStaff', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepStaff', currSettingUniverse)) >= 11)
			});

		createSetting('heirloomAutoCore',
			function () { return ('Cores') },
			function () {
				let description = "<p>Enable to allow you to select the core modifiers you would like to target.</p>";
				description += "<p>Auto Heirlooms won't keep any cores if this setting is disabled.</p>";
				return description
			}, 'boolean', false, null, 'Heirloom', [0],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse)) });

		createSetting('heirloomAutoRareToKeepCore',
			function () { return ('Rarity to Keep') },
			function () {
				let description = "<p>When identifying which heirlooms to keep will look at this rarity of heirloom, recycles all others.</p>";
				description += "<p>Will only display tiers that can currently be obtained based on your highest zone reached.</p>";
				description += "<p><b>Recommended:</b> Highest tier available</p>";
				return description;
			}, 'dropdown', 'None', function () {
				let hze =game.stats.highestLevel.valueTotal();
				let heirloomTiersAvailable = ['Common'];

				if (hze >= 200) heirloomTiersAvailable.push('Uncommon');
				if (hze >= 300) heirloomTiersAvailable.push('Rare');
				if (hze >= 400) heirloomTiersAvailable.push('Epic');
				if (hze >= 500) heirloomTiersAvailable.push('Legendary');
				if (hze >= 600) heirloomTiersAvailable.push('Magnificent');
				if (hze >= 700) heirloomTiersAvailable.push('Ethereal');

				return heirloomTiersAvailable;
			}, 'Heirloom', [0],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse) && game.global.spiresCompleted > 0) });

		createSetting('heirloomAutoCoreBlacklist',
			function () { return ('Blacklist') },
			function () {
				let description = "<p>Will automatically recycle Core heirlooms with the mods you input into this setting.</p>";
				description += "<p>Mod names must be entered exactly the same as they appear in the mod dropdown settings.</p>";
				description += "<p>You can input multiple modifier names but they need to be seperated by commas.</p>";
				return description;
			}, 'multiTextValue', 'None', null, 'Heirloom', [0],
			function () { return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse) && game.global.spiresCompleted > 0) });

		createSetting('heirloomAutoCoreMod1',
			function () { return ('Mod 1') },
			function () {
				let description = "<p>Keeps Cores with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Core'); }, 'Heirloom', [0],
			function () {
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse)) && game.global.spiresCompleted > 0});
		createSetting('heirloomAutoCoreMod2',
			function () { return ('Mod 2') },
			function () {
				let description = "<p>Keeps Cores with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Core'); }, 'Heirloom', [0],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepCore', currSettingUniverse)) >= 1)});
		createSetting('heirloomAutoCoreMod3',
			function () { return ('Mod 3') },
			function () {
				let description = "<p>Keeps Cores with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Core'); }, 'Heirloom', [0],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepCore', currSettingUniverse)) >= 2)});
		createSetting('heirloomAutoCoreMod4',
			function () { return ('Mod 4') },
			function () {
				let description = "<p>Keeps Cores with selected mod.</p>";
				description += "<p>Only mods available for the heirloom type selected in <b>Rarity to Keep</b> will be shown.</p>";
				return description;
			}, 'dropdown', 'Any', function () { return _autoHeirloomMods('Core'); }, 'Heirloom', [0],
			function () {
				const heirloomType = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Magnificent', 'Ethereal'];
				return (getPageSetting('heirloomAuto', currSettingUniverse) && getPageSetting('heirloomAutoCore', currSettingUniverse) && heirloomType.indexOf(getPageSetting('heirloomAutoRareToKeepCore', currSettingUniverse)) >= 5)});
	}
	
	const displayGolden = true;
	if (displayGolden) {
		createSetting('autoGoldenSettings',
			function () { return ('Auto Gold Settings') },
			function () {
				let description = "<p>Here you can select the golden upgrades you would like to have purchased during your runs.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [], 'importExportTooltip("mapSettings", "Auto Golden")', 'Golden', [1, 2]);
	}
	
	const displaySpire = true;
	if (displaySpire) {
		createSetting('IgnoreSpiresUntil',
			function () { return ('Ignore Spires Until') },
			function () {
				let description = "<p>Will disable all of the Spire features unless you're in a Spire at or above this value.</p>";
				description += "<p><b>This works based off Spire number rather than zone. So if you want to ignore Spires until Spire II at z300 then enter 2, Spire III at z400 would be 3 etc.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and make the script assume every Spire is an active Spire.</p>";
				description += "<p><b>Recommended:</b> Second to last Spire you reach on your runs.</p>";
				return description;
			}, 'value', -1, null, 'Spire', [1]);
		createSetting('maxMapStacksForSpire',
			function () { return ('Max Map Bonus for Spire') },
			function () {
				let description = "<p>Will get max map bonus stacks when inside of active Spires.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Spire', [1]);
		createSetting('ExitSpireCell',
			function () { return ('Exit Spire After Cell') },
			function () {
				let description = "<p>Will exit out of active Spires upon clearing this cell.</p>";
				description += "<p><b>Works based off cell number so if you want it to exit after Row #4 then set to 40.</b></p>";
				description += "<p>Any health or damage calculations for the Spire will be based off this cell if set.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'Spire', [1]);
		createSetting('PreSpireNurseries',
			function () { return ('Nurseries pre-Spire') },
			function () {
				let description = "<p>Set the number of <b>Nurseries</b> to build during active Spires.</p>";
				description += "<p><b>Will override any <b>Nursery</b> settings that you have setup in the <b>AT AutoStructure</b> setting.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'Spire', [1]);
		createSetting('hitsSurvivedSpire',
			function () { return ('Hits Survived') },
			function () {
				let description = "<p>Will farm until you can survive this amount of attacks while in active Spires.</p>";
				description += "<p><b>Your Hits Survived can be seen in either the Auto Maps status tooltip or the AutoTrimp settings Help tab.</b></p>";
				description += "<p>Will use the <b>Map Cap</b> and <b>Job Ratio</b> inputs that have been set in the top row of the <b>HD Farm</b> setting. If they haven't been setup then it will default to a job ratio of <b>1/1/2</b> and a map cap of <b>100</b>.</p>";
				description += "<p><b>Will override the Hits Survived setting in the <b>Maps</b> tab so if this is disabled it won't farm for health at all during active Spires.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				if (currSettingUniverse === 1) description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 10, null, 'Spire', [1]);
		createSetting('skipSpires',
			function () { return ('Skip Spires') },
			function () {
				let description = "<p>Will disable any form of mapping after your trimps have max map bonus stacks inside active Spires.</p>";
				if (currSettingUniverse === 1) description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Spire', [1]);
	}
	
	const displayMagma = true;
	if (displayMagma) {
		createSetting('autoGen',
			function () { return ('Auto Generator') },
			function () {
				let description = "<p>Master switch for whether the script will do any form of dimensional generator mode switching.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Magma', [1]);
		createSetting('autoGenModeBefore',
			function () { return (['Gain Mi', 'Gain Fuel', 'Hybrid']) },
			function () {
				let description = "<p>The mode you would like your dimensional generator to be on before your <b>Start Fuel Z</b> zone.</p>";
				description += "<p><b>Gain Mi</b><br>Will set the generator to collect Mi.</p>";
				description += "<p><b>Gain Fuel</b><br>Will set the generator to collect fuel.</p>";
				description += "<p><b>Hybrid</b><br>Pseudo-Hybrid. This will collect fuel until full, then goes into Mi mode.</p>";
				description += "<p><b>Recommended:</b> Gain Mi</p>";
				return description;
			}, 'multitoggle', 1, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', currSettingUniverse)) });
		createSetting('autoGenFuelStart',
			function () { return ('Start Fuel Z') },
			function () {
				let description = "<p>Will automatically set the generator to gather <b>Fuel</b> when this zone is reached.</p>";
				description += "<p>Set to <b>0</b> to disable this setting.</p>";
				description += "<p>If set <b>below 0</b> it will assume you always want this active.</p>";
				description += "<p>If the <b>Overclocker</b> upgrade has been purchased at least once it will use Hybrid mode if unlocked otherwise it will use the scripts pseudo-hybrid solution.</p>";
				description += "<p><b>Recommended:</b> Use Gatorcalc website to find ideal zone</p>";
				return description;
			}, 'value', 0, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', currSettingUniverse)) });
		createSetting('autoGenFuelEnd',
			function () { return ('End Fuel Z') },
			function () {
				let description = "<p>Will automatically set the generator to gather <b>Fuel</b> until this zone is reached.</p>";
				description += "<p>Set to <b>0</b> to disable this setting.</p>";
				description += "<p>If set <b>below 0</b> it will assume you always want this active.</p>";
				description += "<p>If the <b>Overclocker</b> upgrade has been purchased at least once it will use Hybrid mode if unlocked otherwise it will use the scripts pseudo-hybrid solution.</p>";
				description += "<p><b>Recommended:</b> Use Gatorcalc website to find ideal zone</p>";
				return description;
			}, 'value', 0, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', currSettingUniverse)) });
		createSetting('autoGenModeAfter',
			function () { return (['Gain Mi', 'Gain Fuel', 'Hybrid']) },
			function () {
				let description = "<p>The mode you would like your dimensional generator to be on after your <b>End Fuel Z</b> zone.</p>";
				description += "<p><b>Gain Mi</b><br>Will set the generator to collect Mi.</p>";
				description += "<p><b>Gain Fuel</b><br>Will set the generator to collect fuel.</p>";
				description += "<p><b>Hybrid</b><br>Pseudo-Hybrid. This will collect fuel until full, then goes into Mi mode.</p>";
				description += "<p><b>Recommended:</b> Gain Mi</p>";
				return description;
			}, 'multitoggle', 1, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', currSettingUniverse)) });
		createSetting('autoGenModeDaily',
			function () { return (['Daily: Normal', 'Daily: Fuel', 'Daily: Hybrid']) },
			function () {
				let description = "<p>The mode that the script will use for the entire daily run.</p>";
				description += "<p><b>Daily Normal</b><br>Disables this setting and uses the normal script auto generator settings.</p>";
				description += "<p><b>Daily Fuel</b><br>Will set the generator to collect fuel.</p>";
				description += "<p><b>Daily Hybrid</b><br>Pseudo-Hybrid. This will collect fuel until full, then goes into Mi mode.</p>";
				description += "<p><b>Recommended:</b> Daily Normal</p>";
				return description;
			}, 'multitoggle', 1, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', currSettingUniverse)) });
		createSetting('autoGenModeC2',
			function () { return (['' + _getChallenge2Info() + ': Normal', '' + _getChallenge2Info() + ': Fuel', '' + _getChallenge2Info() + ': Hybrid']) },
			function () {
				let description = "<p>The mode that the script will use for the entire " + _getSpecialChallengeDescription() + " runs.</p>";
				description += "<p><b>" + _getChallenge2Info() + " Normal</b><br>Disables this setting and uses the normal script auto generator settings.</p>";
				description += "<p><b>" + _getChallenge2Info() + " Fuel</b><br>Will set the generator to collect fuel.</p>";
				description += "<p><b>" + _getChallenge2Info() + " Hybrid</b><br>Pseudo-Hybrid. This will collect fuel until full, then goes into Mi mode.</p>";
				description += "<p><b>Recommended:</b> " + _getChallenge2Info() + " Fuel</p>";
				return description;
			}, 'multitoggle', 1, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', currSettingUniverse)) });

		createSetting('magmiteAutoFuel',
			function () { return ('Automate Fuel Zones') },
			function () {
				let description = "<p>Will change your zones immediately before auto portaling to ensure that they are accurate going into your next run.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', currSettingUniverse)) });
		createSetting('magmiteFuelZones',
			function () { return ('Zones To Fuel') },
			function () {
				let description = "<p>When Automate Fuel Zones runs it will use this value for how many zones you should fuel for.</p>";
				description += "<p>To disable this setting you must disable the <b>Automate Fuel Zones</b> setting.</p>";
				return description;
			}, 'value', 20, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', currSettingUniverse) && getPageSetting('magmiteAutoFuel', currSettingUniverse)) });
		createSetting('magmiteMinimize',
			function () { return ('Minimize Fuel Zones') },
			function () {
				let description = "<p>Minimizes fueling zones required to get the maximum amalgamators possible. Fuels for 20 zones if you can't get an amalgamator.</p>";
				description += "<p>This will override your input for <b>Zones To Fuel</b> if enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', currSettingUniverse) && getPageSetting('magmiteAutoFuel', currSettingUniverse) && game.stats.amalgamators.valueTotal > 0) });

		createSetting('magmiteSpending',
			function () { return (['Spend Magmite Off', 'Spend Magmite On Portal', 'Spend Magmite Always']) },
			function () {
				let description = "<p>Controls when the script will spend the Magmite that you obtain throughout your runs.</p>";
				description += "<p>If enabled the script will spend your magmite on the most efficient upgrade available using the Gatorcalc websites algorithm.</p>";
				description += "<p><b>Spend Magmite Off</b><br>Disables this setting.</p>";
				description += "<p><b>Spend Magmite On Portal</b><br>Auto spends any unspent Magmite immediately before portaling.</p>";
				description += "<p><b>Spend Magmite Always</b><br>Will spend Magmite that you acquire as soon as the most efficient upgrade is purchasable.</p>";
				description += "<p><b>Recommended:</b> Spend Magmite On Portal</p>";
				return description;
			}, 'multitoggle', 0, null, 'Magma', [1]);
		createSetting('magmiteUpgradeRuns',
			function () { return ('Runs for Upgrades') },
			function () {
				let description = "<p>The maximum number of runs to be spent on the most efficient upgrade.</p>";
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			}, 'value', 2, null, 'Magma', [1]);	
		createSetting('magmiteOneTimerRuns',
			function () { return ('Runs for One and Dones') },
			function () {
				let description = "<p>If purchasable in this amount of runs then the algorithm will prioritize one-time upgrades over regular upgrades.</p>";
				description += "<p><b>Will only purchase <b>Hybridization</b> when <b>Storage</b> has been purchased.</p>";
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			}, 'value', 2, null, 'Magma', [1]);		
	}
	
	const displayNature = true;
	if (displayNature) {
		createSetting('autoNature',
			function () { return ('Spend Nature Tokens') },
			function () {
				let description = "<p>Controls how Nature tokens are handled by the script.</p>";
				description += "<p>Additional settings appear when enabled for token transfer & automatically spending tokens on enlightenments.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Nature', [1]);
		createSetting('autoNatureThreshold',
			function () { return ('Token Threshold') },
			function () {
				let description = "<p>If tokens would go below this value it will disable token expenditure.</p>";
				description += "<p>Set to <b>0 or below</b> to completely disable token expenditure.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoNature.enabled) });
		createSetting('autoPoison',
			function () { return ('Poison') },
			function () {
				let description = "<p>Decides what to do with Poison tokens.</p>";
				description += "<p>Will only spend tokens if the action costs less than your current total + the value in <b>Token Threshold</b><br></p>";
				description += "<p><b>Off</b><br>Disables this setting.</p>";
				description += "<p><b>Empowerment</b><br>Will upgrade your Poison level.</p>";
				description += "<p><b>Transfer</b><br>Will purchase levels in your Poison transfer rate.</p>";
				description += "<p><b>Convert to X</b> Will convert your tokens to the specified nature type.</p>";
				return description;
			}, 'dropdown', 'Off', function () { return ['Off', 'Empowerment', 'Transfer', 'Convert to Wind', 'Convert to Ice', 'Convert to Both']; }, 'Nature', [1],
			function () { return (autoTrimpSettings.autoNature.enabled) });
		createSetting('autoWind',
			function () { return ('Wind') },
			function () {
				let description = "<p>Decides what to do with Wind tokens.</p>";
				description += "<p>Will only spend tokens if the action costs less than your current total + the value in <b>Token Threshold</b><br></p>";
				description += "<p><b>Off</b><br>Disables this setting.</p>";
				description += "<p><b>Empowerment</b><br>Will upgrade your Wind level.</p>";
				description += "<p><b>Transfer</b><br>Will purchase levels in your Wind transfer rate.</p>";
				description += "<p><b>Convert to X</b> Will convert your tokens to the specified nature type.</p>";
				return description;
			}, 'dropdown', 'Off', function () { return ['Off', 'Empowerment', 'Transfer', 'Convert to Poison', 'Convert to Ice', 'Convert to Both']; }, 'Nature', [1],
			function () { return (autoTrimpSettings.autoNature.enabled) });
		createSetting('autoIce',
			function () { return ('Ice') },
			function () {
				let description = "<p>Decides what to do with Ice tokens.</p>";
				description += "<p>Will only spend tokens if the action costs less than your current total + the value in <b>Token Threshold</b><br></p>";
				description += "<p><b>Off</b><br>Disables this setting.</p>";
				description += "<p><b>Empowerment</b><br>Will upgrade your Ice level.</p>";
				description += "<p><b>Transfer</b><br>Will purchase levels in your Ice transfer rate.</p>";
				description += "<p><b>Convert to X</b> Will convert your tokens to the specified nature type.</p>";
				return description;
			}, 'dropdown', 'Off', function () { return ['Off', 'Empowerment', 'Transfer', 'Convert to Poison', 'Convert to Wind', 'Convert to Both']; }, 'Nature', [1],
			function () { return (autoTrimpSettings.autoNature.enabled) });

		createSetting('autoenlight',
			function () { return ('Enlight: Auto') },
			function () {
				let description = "<p>Controls when the script will purchase nature enlightenments.</p>";
				description += "<p>Priority system for the purchases is <b>Poison > Wind > Ice</b>.</p>";
				description += "<p>Will only purchase an enlightenment when <b>Magma</b> is active.</p>";
				description += "<p>Englightenment purchases ignore the <b>Token Threshold</b> setting value.</p>";
				return description;
			},
			'boolean', false, null, 'Nature', [1]);
		createSetting('poisonEnlight',
			function () { return ('E: F: Poison') },
			function () {
				let description = "<p>Will activate Poison enlightenment when below this token threshold when running fillers (non daily/" + _getChallenge2Info() + " runs).</p>";
				description += "<p><b>Set to 0 or -1 to completely disable this setting.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('windEnlight',
			function () { return ('E: F: Wind') },
			function () {
				let description = "<p>Will activate Wind enlightenment when below this token threshold when running fillers (non daily/" + _getChallenge2Info() + " runs).</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('iceEnlight',
			function () { return ('E: F: Ice') },
			function () {
				let description = "<p>Will activate Ice enlightenment when below this token threshold when running fillers (non daily/" + _getChallenge2Info() + " runs).</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('poisonEnlightDaily',
			function () { return ('E: D: Poison') },
			function () {
				let description = "<p>Will activate Poison enlightenment when below this token threshold when running dailies.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('windEnlightDaily',
			function () { return ('E: D: Wind') },
			function () {
				let description = "<p>Will activate Wind enlightenment when below this token threshold when running dailies.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('iceEnlightDaily',
			function () { return ('E: D: Ice') },
			function () {
				let description = "<p>Will activate Ice enlightenment when below this token threshold when running dailies.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('poisonEnlightC2',
			function () { return ('E: C: Poison') },
			function () {
				let description = "<p>Will activate Poison enlightenment when below token threshold when doing " + _getSpecialChallengeDescription() + " runs.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			},
			'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('windEnlightC2',
			function () { return ('E: C: Wind') },
			function () {
				let description = "<p>Will activate Wind enlightenment when below this token threshold when doing " + _getSpecialChallengeDescription() + " runs.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
		createSetting('iceEnlightC2',
			function () { return ('E: C: Ice') },
			function () {
				let description = "<p>Will activate Ice enlightenment when below this token threshold when doing " + _getSpecialChallengeDescription() + " runs.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoenlight.enabled) });
	}
	
	const displayFluffy = true;
	if (displayFluffy) {
		createSetting('fluffyEvolve',
			function () { return ('Evolve Fluffy') },
			function () {
				let description = "<p>Controls whether or not the script will automatically evolve Fluffy if you are at level 10.</p>";
				description += "<p>Will only evolve when inside a liquification zone or when (0 + overkill) cells away from cell 100.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Fluffy', [1]);

		createSetting('fluffyMinZone',
			function () { return ('Fluffy: Min Zone') },
			function () {
				let description = "<p>From which zone evolving should be considered.</p>";
				description += "<p>Must be used in conjunction with <b>Fluffy: Max Zone</b>.</p>";
				description += "<p><b>Recommended:</b> 0</p>";
				return description;
			}, 'value', -1, null, 'Fluffy', [1],
			function () { return (getPageSetting('fluffyEvolve', currSettingUniverse)) });

		createSetting('fluffyMaxZone',
			function () { return ('Fluffy: Max Zone') },
			function () {
				let description = "<p>From which zone evolving should stop being considered.</p>";
				description += "<p>Must be used in conjunction with <b>Fluffy: Min Zone</b>.</p>";
				description += "<p><b>Recommended:</b> 999</p>";
				return description;
			}, 'value', -1, null, 'Fluffy', [1],
			function () { return (getPageSetting('fluffyEvolve', currSettingUniverse)) });

		createSetting('fluffyBP',
			function () { return ('Fluffy: Bone Portals') },
			function () {
				let description = "<p>How many Bone Portals to use when the script evolves Fluffy.</p>";
				description += "<p>If set above 0 and you don't have enough bones to afford the necessary bone portals then the script won't evolve until you have enough bones.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', -1, null, 'Fluffy', [1],
			function () { return (getPageSetting('fluffyEvolve', currSettingUniverse)) });

		createSetting('fluffyRespec',
			function () { return ('Fluffy: Respec on Evo') },
			function () {
				let description = "<p>Will respec your perks after evolving.</p>";
				description += "<p>Will only evolve Fluffy when a perk respec is available OR you have points in the Fluffy xp gain perks.</p>";
				description += "<p>This setting won't do anything if the <b>Auto Allocate Perks</b> setting is disabled. Uses your current preset and weights to respec to.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Fluffy', [1]);
	}
	
	const displayTimewarp = true;
	if (displayTimewarp) {
		createSetting('timeWarpSpeed',
			function () { return ('Time Warp Support') },
			function () {
				let description = "<p>Will allow the script to run more frequently during time warp so instead of running once every 100ms it will run based off of when the game runs its code.</p>";
				description += "<p>When enabled auto maps, auto fight, auto portal, auto stance, and auto equality will be run every time the game runs its code.</p>";
				description += "<p>This will be a significant slow down when running time warp but should allow you to use the script during it.</p>";
				return description;
			}, 'boolean', true, null, 'Time Warp', [0]);

		createSetting('timeWarpFrequency',
			function () { return ('Time Warp Frequency') },
			function () {
				let description = "<p>How often the scripts code will run during time warp.</p>";
				description += "<p>If set to 20 it will run once every 20 times the games code runs.</p>";
				description += "<p>The lower you set this value the longer time warp will take.</p>";
				description += "<p>Liquification zones override this and temporarily set it to 1 during them.</p>";
				description += "<p><b>Recommended:</b> 20</p>";
				return description;
			}, 'value', 1, null, 'Time Warp', [0],
			function () { return (autoTrimpSettings.timeWarpSpeed.enabled) });

		createSetting('timeWarpSaving',
			function () { return ('Time Warp Saving') },
			function () {
				let description = "<p>Will cause the script to save your game during Time Warp so that you don't lose any time if you refresh.</p>";
				description += "<p>Will automatically save every 30 minutes of game time.</p>";
				return description;
			}, 'boolean', false, null, 'Time Warp', [0],
			function () { return (autoTrimpSettings.timeWarpSpeed.enabled) });

		createSetting('timeWarpDisplay',
			function () { return ('Time Warp Display') },
			function () {
				let description = "<p>Will display the Trimps user interface during time warp.</p>";
				description += "<p>Updates the display every 600 ingame ticks so every minute of ingame time.</p>";
				description += "<p>This will cause your time warp to take longer as it has to render additional frames.</p>";
				description += "<p>When first loading Time Warp you will have a tooltip to inform you of your Time Warp duration as you won't be able to see it ingame. Additionally adds your current Time Warp progress percentage to the start of the Auto Maps status at the bottom of the battle container.</p>";
				description += "<p><b>Recommended:</b> Enabled</p>";
				return description;
			}, 'boolean', false, null, 'Time Warp', [0],
			function () { return (autoTrimpSettings.timeWarpSpeed.enabled) });
	}
	
	const displayDisplay = true;
	if (displayDisplay) {
		createSetting('displayEnhancedGrid',
			function () { return ('Enhance Grids') },
			function () {
				let description = "<p>Apply slight visual enhancements to world and map grids that highlights with drop shadow all the exotic, powerful, skeletimps and other special imps.</p>";
				const enemyType = currSettingUniverse === 1 ? 'Corrupt' : 'Mutated';
				description = `<p>${enemyType} enemies won't have a fast icon as those enemies are always fast.</p>`;
				return description;
			}, 'boolean', false, null, 'Display', [0]);
		/* createSetting('displayHeHr',
			function () { return (_getPrimaryResourceInfo().name + ' Per Hour Status') },
			function () {
				let description = "<p>Enables the display of your " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour.</p>";
				return description;
			}, 'boolean', false, null, 'Display', [0]); */

		createSetting('displayAllSettings',
			function () { return ('Display All settings') },
			function () {
				let description = "<p>Will display all of the locked settings that have highest zone or other requirements to be displayed.</p>";
				return description;
			}, 'boolean', false, null, 'Display', [0]);

		createSetting('displayHideAutoButtons',
			function () { return ('Hide Auto Buttons') },
			function () {
				let description = "<p>Will allow you to select which of the games automation buttons you'd prefer not to be visible.</p>";
				return description;
			}, 'mazDefaultArray', {
				fight: false, autoFight: false, structure:false, jobs: false, gold: false, upgrades: false, prestige: false, equip: false,
				ATstructure: false, ATjobs: false, ATequip: false, ATmaps: false, ATstatus: false, ATheHr: false,
		}, 'importExportTooltip("hideAutomation")', 'Display', [0]);
			
		createSetting('EnableAFK',
			function () { return ('Go AFK Mode') },
			function () {
				let description = "<p>AFK Mode uses a Black Screen, and suspends ALL the Trimps GUI visual update functions (updateLabels) to improve performance by not doing unnecessary stuff. This feature is primarily just a CPU saving mode.</p>";
				description += "<p>The blue color means this is not a settable setting, just a button.</p>";
				description += "<p>You can also click the Zone # (World Info) area to go AFK now.</p>";
				return description;
			}, 'action', null, 'MODULES["performance"].EnableAFKMode()', 'Display', [1, 2]);

		createSetting('equipEfficientEquipDisplay',
			function () { return ('AE: Highlight Equips') },
			function () {
				let description = "<p>Will highlight the most efficient equipment or prestige to buy.</p>";
				description += "<p><b>This setting will disable the default game setting.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Display', [1, 2]);
		createSetting('buildingMostEfficientDisplay',
			function () { return ('Highlight Efficient Buildings') },
			function () {
				let description = "<p>Will highlight the most efficient building to buy.</p>";
				if (currSettingUniverse === 2) description += "<p>When <b>Hubs</b> are unlocked this setting won't display the best building as the script will automatically purchase the cheapest housing building possible at that point.</p>";
				return description;
			}, 'boolean', false, null, 'Display', [1, 2]);
		createSetting('shieldGymMostEfficientDisplay',
			function () { return ('Highlight Shields v Gyms') },
			function () {
				let description = "<p>Will the most efficient purchase between Shields and Gyms.</p>";
				return description;
			}, 'boolean', false, null, 'Display', [1]);

		createSetting('sitInMaps',
			function () { return ('Sit In maps') },
			function () {
				let description = "<p>Will force your trimps to go sit in the map chamber when enabled.</p>";
				description += "<p><b>The <b>Sit In Zone</b> setting must be setup for this to work.</b></p>"
				description += "<p><b>Recommended:</b> Disabled</p>";
				return description;
			}, 'boolean', false, null, 'Display', [1, 2]);
		createSetting('sitInMaps_Zone',
			function () { return ('SIM: Zone') },
			function () {
				let description = "<p>The script will go to the map chamber and stop running any maps at this zone.</p>";
				return description;
			}, 'value', -1, null, 'Display', [1, 2],
			function () { return (getPageSetting('sitInMaps', currSettingUniverse)) });
		createSetting('sitInMaps_Cell',
			function () { return ('SIM: Cell') },
			function () {
				let description = "<p>The script will go to the map chamber and stop running any maps after this cell has been reached.</p>";
				return description;
			}, 'value', -1, null, 'Display', [1, 2],
			function () { return (getPageSetting('sitInMaps', currSettingUniverse)) });

		createSetting('spamMessages',
			function () { return ('Spam Message Settings') },
			function () { return ('Click to adjust settings.') },
			'mazDefaultArray', {
			general: false,
			upgrades: false,
			fragment: false,
			equipment: false,
			maps: false,
			map_Details: true,
			map_Destacking: false,
			map_Skip: false,
			other: false,
			buildings: false,
			jobs: false,
			zone: true,
			exotic: false,
			gather: false,
			stance: false,
			run_Stats: false,
			nature: false,
		}, null, 'Display', [0],
			function () { return false });
	}

	document.getElementById('battleSideTitle').setAttribute('onclick', 'MODULES["performance"].EnableAFKMode()');
	document.getElementById('battleSideTitle').setAttribute('onmouseover', "getZoneStats(event);this.style.cursor='pointer'");
	
	const displayImport = true;
	if (displayImport) {
		createSetting('importAutoTrimps',
			function () { return ('Import AutoTrimps') },
			function () {
				let description = "<p>Import a AutoTrimps settings file.</p>";
				return description;
			}, 'infoclick', null, 'importExportTooltip("importAutoTrimps")', 'Import Export', [0]);

		createSetting('exportAutoTrimps',
			function () { return ('Export AutoTrimps') },
			function () {
				let description = "<p>Export your AutoTrimps Settings as a output string text formatted in JSON.</p>";
				return description;
			}, 'infoclick', null, 'importExportTooltip("exportAutoTrimps")', 'Import Export', [0]);

		createSetting('downloadForDebug',
			function () { return ('Download For Debug') },
			function () {
				let description = "<p>Will download both your save and the scripts settings so that they can be debugged easier.</p>";
				return description;
			}, 'action', null, 'importExportTooltip("exportAutoTrimps", "downloadSave")', 'Import Export', [0]);

		createSetting('updateReload',
			function () { return ('Reload For Updates') },
			function () {
				let description = "<p>Will reload your Trimps window when an AutoTrimps update is available.</p>";
				description += "<p><b>Updates have the potential to have errors that would break the script so be aware this might not be wise to enable.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Import Export', [0]);

		createSetting('defaultAutoTrimps',
			function () { return ('Reset To Default') },
			function () {
				let description = "<p>Reset everything to the way it was when you first installed the script.</p>";
				return description;
			}, 'infoclick', null, 'importExportTooltip("resetDefaultSettingsProfiles")', 'Import Export', [0]);


		createSetting('disableAutoTrimpsSettings',
			function () { return ('Disable All Settings') },
			function () {
				let description = "<p>Overrides your settings and disables all available features.</p>";
				return description;
			}, 'infoclick', null, 'importExportTooltip("disableSettingsProfiles")', 'Import Export', [0]);

		createSetting('autoAllocatePresets',
			function () { return ('Auto Allocate Presets') },
			function () { return ('Click to adjust settings.') },
			'mazDefaultArray', JSON.stringify({
				'': '',
			}), null, 'Import Export', [1, 2],
			function () { return false });

		createSetting('autoHeirloomStorage',
			function () { return ('Auto Heirlooms') },
			function () { return ('Click to adjust settings.') },
			'mazDefaultArray', JSON.stringify({
				'': '',
			}), null, 'Import Export', [1, 2],
			function () { return false });

		createSetting('mutatorPresets',
			function () { return ('Mutator Presets') },
			function () { return ('Click to adjust settings.') },
			'mazDefaultArray', JSON.stringify({
				preset1: {},
				preset2: {},
				preset3: {},
			}), null, 'Import Export', [2],
			function () { return false });
	}
	
	const displayHelp = true;
	if (displayHelp) {
		createSetting('helpIntroduction',
			function () { return ('Introduction Message') },
			function () {
				let description = "<p>Will display the introduction message that is shown when you first load the script.</p>";
				return description;
			}, 'action', null, 'cancelTooltip(); introMessage();', 'Help', [0]);
		createSetting('helpStatus',
			function () { return ('Auto Maps Status') },
			function () {
				let description = "<p>Will display the Auto Maps status window.</p>";
				description += "<p>This can also be accessed by mousing over the text that tells you what Auto Maps is currently trying to do just beneath the Auto Maps button.</p>";
				return description;
			}, 'action', null, 'cancelTooltip(); makeAutomapStatusTooltip(false);', 'Help', [0]);
		createSetting('helpResourceHour',
			function () { return (_getPrimaryResourceInfo().name + ' Per Hour') },
			function () {
				let description = "<p>Will display the " + _getPrimaryResourceInfo().name + "/Hr tooltip message.</p>";
				description += "<p>This can also be accessed by mousing over the text beneath the Auto Maps status when the <b>" + _getPrimaryResourceInfo().abv + "/hr status</b> setting in the <b>Display</b> tab is enabled.</p>";
				return description;
			}, 'action', null, 'cancelTooltip(); makeResourceTooltip();', 'Help', [0]);
		createSetting('helpAutoPortal',
			function () { return ('Auto Portal Info') },
			function () {
				let description = "<p>Will display a description of what order Auto Portal will try to perform its actions.</p>";
				return description;
			}, 'action', null, 'cancelTooltip(); makeAutoPortalHelpTooltip(false);', 'Help', [0]);
		createSetting('helpAutoMapsPriority',
			function () { return ('Auto Maps Priority') },
			function () {
				let description = "<p>Will display the order that Auto Maps will run each setting.</p>";
				return description;
			}, 'action', null, 'cancelTooltip(); makeFarmingDecisionHelpTooltip(false);', 'Help', [0]);
		createSetting('helpPriorityOrder',
			function () { return ('Priority Order') },
			function () {
				let description = "<p>Will display the order that your current settings run if you have the <b>Auto Maps Priority</b> setting enabled.</p>";
				return description;
			}, 'action', null, 'importExportTooltip("priorityOrder")', 'Help', [0]);
		/* createSetting('helpFragments',
			function () { return ('Fragment Decisions') },
			function () {
				let description = "<p>Will display the decision for map creation slider/setting adjustments.</p>";
				return description;
			}, 'action',null, 'cancelTooltip(); makeFragmentDecisionHelpTooltip(false);', 'Help', [0]); */
	}
	
	const displayTesting = true; /* Hidden Features for testing purposes! Please never seek these out! */
	if (displayTesting) {
		createSetting('gameUser',
			function () { return ('User') },
			function () {
				let description = "<p>Not gonna be seen by anybody.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Test', [0],
			function () { return (false) });

		createSetting('testSpeed20',
			function () { return ('Game Speed 12x') },
			function () {
				let description = "<p>Increases the game run speed. Runs both the entire script & main trimps loop on every tick.</p>";
				description += "<p><b>There's no way to clear this without refreshing your page.</b></p>";
				description += "<p><b>Speed increase is variable depending on your machine.</b></p>";
				return description;
			}, 'action', null, 'testSpeedX(0.00001);', 'Test', [0]);

		createSetting('testSetChallenge',
			function () { return ('Custom Challenge') },
			function () {
				let description = "<p>Will set the challenge that Trimps is running to your input.</p>";
				return description;
			}, 'action', null, 'importExportTooltip("setCustomChallenge");', 'Test', [0]);

		createSetting('testSetC2',
			function () { return ('Toggle ' + _getChallenge2Info()) },
			function () {
				let description = "<p>Will toggle on the setting for if you\'re running a " + _getChallenge2Info() + ".</p>";
				return description;
			}, 'action', null, 'testRunningC2();', 'Test', [0]);

		createSetting('testBoneCharges',
			function () { return ('Max Bone Charges') },
			function () {
				let description = "<p>Sets your bone charge counter to 10.</p>";
				return description;
			}, 'action', null, 'game.permaBoneBonuses.boosts.charges=10; game.permaBoneBonuses.boosts.updateBtn();', 'Test', [0]);

		createSetting('testMetalOneDay',
			function () { return ('1 Day Of Metal') },
			function () {
				let description = "<p>Will tell you how much metal you'd gain from 1 day of metal farming.</p>";
				description += "<p>If in a map if will use your map level otherwise it'll assume world level maps.</p>";
				description += "<p>Assumes killing at max speed and factors overkill into the calculations.</p>";
				return description;
			}, 'action', null, 'testMetalIncome();', 'Test', [0]);

		createSetting('testTimeWarp',
			function () { return ('Time Warp') },
			function () {
				let description = "<p>Allows you to input how many hours of Time Warp you would like to do.</p>";
				description += "<p>If you input a value higher than 24 it will increase the max time you can time warp for to the value you have input.</p>";
				return description;
			}, 'action', null, 'importExportTooltip("timeWarp");', 'Test', [0]);

		createSetting('testTotalEquipmentCost',
			function () { return ('Total Equipment Cost') },
			function () {
				let description = "<p>Will calculate the total metal cost of your equipment.</p>";
				description += "<p>Outputs in total prestige cost, total equip cost & total overall.</p>";
				description += "<p>Assumes killing at max speed and factors overkill into the calculations.</p>";
				return description;
			},
			'action', null, 'testEquipmentMetalSpent();', 'Test', [0]);

		createSetting('testLastWorldCell',
			function () { return ('Last World Cell') },
			function () {
				let description = "<p>Sets your current cell to the last world cell in the world.</p>";
				description += "<p>Will also set the last enemy cells health to 0.</p>";
				return description;
			}, 'action', null, 'testWorldCell();', 'Test', [0]);

		createSetting('testLastMapCell',
			function () { return ('Last Map Cell') },
			function () {
				let description = "<p>Sets your current cell to the last world cell in maps.</p>";
				description += "<p>Will also set the last enemy cells health to 0.</p>";
				return description;
			}, 'action', null, 'testMapCell();', 'Test', [0]);

		createSetting('testMaxMapBonus',
			function () { return ('Max Map Bonus') },
			function () {
				let description = "<p>Sets your map bonus stacks to 10.</p>";
				return description;
			}, 'action', null, 'testMaxMapBonus();', 'Test', [0]);
		createSetting('testMaxTenacity',
			function () { return ('Max Tenacity Mult') },
			function () {
				let description = "<p>Sets your current cell to the last world cell in maps.</p>";
				description += "<p>Will also set the last enemy cells health to 0.</p>";
				return description;
			}, 'action', null, 'testMaxTenacity();', 'Test', [0]);

		createSetting('testStatMult',
			function () { return ('1e100x Stats') },
			function () {
				let description = "<p>Multiplies soldier health & damage by 1e100.</p>";
				description += "<p>Doesn't have any protecion to ensure you stay below infinity health.</p>";
				return description;
			}, 'action', null, 'testTrimpStats();', 'Test', [0]);
	}
	
	const displayBeta = true;
	if (displayBeta) {
		createSetting('testMapScumming',
			function () { return ('Slow Map Scum') },
			function () {
				let description = "<p>Will remake maps until you have 9+ slow enemies on odd cells.</p>";
				description += "<p>Will only work if you\'re in maps and on cell 1.</p>";
				description += "<p><b>Due to the map remaking process your game will hang for roughly 60s while this finds an ideal map.</b></p>";
				return description;
			}, 'action', null, 'slowScum(9);', 'Beta', [0]);
		createSetting('testMapScummingValue',
			function () { return ('Slow Map Value') },
			function () {
				let description = "<p>Will reroll for slow cells on maps when your <b>Map HD Ratio</b> is at or below this value.</p>";
				description += "<p>If running <b>Desolation</b> will roll for <b>9</b> slow enemies, otherwise will go for <b>10</b>.</p>";
				description += "<p><b>Due to the map remaking process your game will hang for a while till this finds an ideal map.</b></p>";
				return description;
			}, 'value', 1e10, null, 'Beta', [0]);

		createSetting('debugEqualityStats',
			function () { return ('Debug Equality Stats') },
			function () {
				let description = "<p>Will display details of trimp/enemy stats when you gamma burst.</p>";
				description += "<p>Requires your auto equality setting to be set to <b>Auto Equality: Advanced</b></p>";
				return description;
			}, 'boolean', false, null, 'Beta', [2],
			function () { return (false) });
	}
}

function createSetting(id, name, description, type, defaultValue, list, container, universe, require) {
	const loaded = autoTrimpSettings[id];
	const u1Setting = universe.includes(0) || universe.includes(1);
	const u2Setting = universe.includes(2);

	autoTrimpSettings[id] = {
		id,
		name,
		description,
		type,
		universe,
		require: require || undefined,
		list: list || undefined
	};

	function getSettingValue(loaded, property, defaultValue) {
		return loaded && loaded[property] !== undefined ? loaded[property] : defaultValue;
	}

	const enabled = ['boolean'];
	const valueTypes = ['value', 'valueNegative', 'multiValue', 'textValue', 'multiTextValue', 'multitoggle', 'mazArray', 'mazDefaultArray'];
	const selected = ['dropdown'];

	if (valueTypes.includes(type)) {
		if (u1Setting) autoTrimpSettings[id].value = getSettingValue(loaded, 'value', defaultValue);
		if (u2Setting) autoTrimpSettings[id].valueU2 = getSettingValue(loaded, 'valueU2', defaultValue);
	} else if (enabled.includes(type)) {
		if (u1Setting) autoTrimpSettings[id].enabled = getSettingValue(loaded, 'enabled', defaultValue) || false;
		if (u2Setting) autoTrimpSettings[id].enabledU2 = getSettingValue(loaded, 'enabledU2', defaultValue) || false;
	} else if (selected.includes(type)) {
		if (u1Setting) autoTrimpSettings[id].selected = getSettingValue(loaded, 'selected', defaultValue);
		if (u2Setting) autoTrimpSettings[id].selectedU2 = getSettingValue(loaded, 'selectedU2', defaultValue);
	}

	const parentAttributes = {
		style: 'display: inline-block; vertical-align: top; margin-left: 0.6vw; margin-bottom: 1vw; width: 13.50vw;',
		id: id + 'Parent'
	};

	const btnAttributes = {
		innerHTML: name(),
		style: `position: relative; min-height: 1px; padding-left: 5px; font-size: 1vw; height: auto;`,
		onmouseover: `tooltip("${name()}", "customText", event, "${description()}")`,
		onmouseout: 'tooltip("hide")',
		id: id
	};

	const settingActions = {
		boolean: () => {
			btnAttributes.onclick = `settingChanged("${id}")`;
		},
		value: () => {
			btnAttributes.class = 'noselect settingsBtn btn-info';
			btnAttributes.onclick = `autoSetValueToolTip("${id}", "${name()}", "${type === 'multiValue'}", "${type === 'valueNegative'}")`;
		},
		textValue: () => {
			btnAttributes.class = 'noselect settingsBtn btn-info';
			btnAttributes.onclick = `autoSetTextToolTip("${id}", "${name()}", ${type === 'multiTextValue'})`;
		},
		dropdown: () => {
			btnAttributes.onmouseout = 'tooltip("hide")';
			btnAttributes.class = 'select2';
			parentAttributes.onmouseover = `tooltip("${name()}", "customText", event, "${description()}")`;
			parentAttributes.onmouseout = 'tooltip("hide")';
			parentAttributes.onchange = `settingChanged("${id}")`;
		},
		multitoggle: () => {
			btnAttributes.onclick = `settingChanged("${id}")`;
			btnAttributes.onmouseover = `tooltip("${name().join(' / ')}", "customText", event, "${description()}")`;
			btnAttributes.innerHTML = autoTrimpSettings[id].name()[autoTrimpSettings[id]['value']];
		},
		action: () => {
			btnAttributes.style = 'color: black; background-color: #6495ed; font-size: 1vw;';
			btnAttributes.class = 'noselect settingsBtn settingBtn3';
			btnAttributes.onclick = list;
		}
	};

	settingActions['mazArray'] = settingActions['action'];
	settingActions['infoclick'] = settingActions['action'];
	settingActions['mazDefaultArray'] = settingActions['action'];
	settingActions['multiTextValue'] = settingActions['textValue'];
	settingActions['valueNegative'] = settingActions['value'];
	settingActions['multiValue'] = settingActions['value'];

	if (settingActions[type]) {
		settingActions[type]();
	}

	if (id === 'dailyPortal') {
		parentAttributes.class = 'toggleConfigBtnLocal';
		parentAttributes.style += 'max-height: 3vh; border-bottom: 1px solid black !important;';
	}

	const btnParent = _createElement('DIV', parentAttributes);
	const btn = _createElement(type === 'dropdown' ? 'select' : 'DIV', btnAttributes);

	btn.id = id;
	btnParent.appendChild(btn);
	if (container) document.getElementById(container).appendChild(btnParent);
	else document.getElementById('autoSettings').appendChild(btnParent);

	if (id === 'dailyPortal') {
		const autoPortalSettings = _createElement('DIV', {
			id: 'autoPortalSettingsBtn',
			onclick: 'importExportTooltip("DailyAutoPortal")',
			class: 'settingsBtnLocalCogwheel',
			style: 'margin-left:-1px;'
		});
		const autoPortalSettingsButton = _createElement('SPAN', { class: 'glyphicon glyphicon-cog' });
		btnParent.appendChild(autoPortalSettings);
		autoPortalSettings.appendChild(autoPortalSettingsButton);
	}
}

function _settingTimeout(milliseconds = MODULES.portal.timeout) {
	settingChangedTimeout = true;
	setTimeout(function () {
		settingChangedTimeout = false;
	}, milliseconds);
}

function settingChanged(id, currUniverse) {
	const btn = autoTrimpSettings[id];
	const radonOn = currUniverse ? game.global.universe === 2 : autoTrimpSettings.universeSetting.value === 1;
	const valueSuffix = radonOn && btn.universe.indexOf(0) === -1 ? 'U2' : '';
	const updateUI = currUniverse || currSettingUniverse === game.global.universe || btn.universe.includes(0);

	const booleanActions = {
		equipEfficientEquipDisplay: displayMostEfficientEquipment,
		shieldGymMostEfficientDisplay: displayShieldGymEfficiency,
		buildingMostEfficientDisplay: displayMostEfficientBuilding,
		equipOn: _setAutoEquipClasses,
		buildingsType: _setBuildingClasses,
		timeWarpDisplay: _setTimeWarpUI,
		displayEnhancedGrid: MODULES.fightinfo.Update,
		archaeology: archaeologyAutomator,
		autoEggs: easterEggClicked
	};

	const multitoggleActions = {
		autoMaps: _setAutoMapsClasses,
		jobType: _setAutoJobsClasses
	};

	if (btn.type === 'boolean') {
		const enabled = `enabled${valueSuffix}`;
		btn[enabled] = !btn[enabled];
		document.getElementById(id).setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + btn[enabled]);
		if (booleanActions[id] && updateUI) booleanActions[id]();
	}

	if (btn.type === 'multitoggle') {
		const value = `value${valueSuffix}`;
		if ((id === 'magmiteSpending' && btn[value] > 0) || (game.global.universe === 1 && id === 'presetCombatRespec')) _settingTimeout();
		btn[value]++;
		if (id === 'autoMaps' && currUniverse && btn[value] === 2) btn[value]++;
		if (btn[value] > btn.name().length - 1) btn[value] = 0;
		document.getElementById(id).setAttribute('class', 'noselect settingsBtn settingBtn' + btn[value]);
		document.getElementById(id).innerHTML = btn.name()[btn[value]];
		if (multitoggleActions[id] && updateUI) multitoggleActions[id]();
		if (id === 'dailyPortal') document.getElementById(btn.id).classList.add('toggleConfigBtn');
	}

	if (btn.type === 'dropdown') {
		const selected = `selected${valueSuffix}`;
		btn[selected] = document.getElementById(id).value;
	}

	saveSettings();
	updateAutoTrimpSettings(id === 'universeSetting');
}

function onKeyPressSetting(event, id, multi, negative) {
	const isEnterKey = event.which === 13 || event.keyCode === 13;
	if (isEnterKey) {
		negative !== undefined && multi !== undefined ? autoSetValue(id, multi, negative) : autoSetText(id, multi);
	}
}

function autoSetValue(id, multiValue, negative) {
	const setting = autoTrimpSettings[id];
	const valueSuffix = autoTrimpSettings.universeSetting.value === 1 && setting.universe.indexOf(0) === -1 ? 'U2' : '';
	const numBox = document.getElementById('customNumberBox');
	if (!numBox) return;

	unlockTooltip();
	tooltip('hide');

	const num = multiValue ? numBox.value.split(',').map(parseNum) : parseNum(numBox.value);
	if (Array.isArray(num) ? num.some(isNaN) : isNaN(num)) {
		return tooltip('confirm', null, 'update', `Error with input ("${numBox.value}"), please try again`, null, `<b>${setting.name()} Setting Input Error!</b>`);
	}

	setting[`value${valueSuffix}`] = num;
	const displayNum = Array.isArray(num) ? `${num[0]}+` : num > -1 || negative ? prettify(num) : "<span class='icomoon icon-infinity'></span>";
	document.getElementById(id).innerHTML = `${setting.name()}: ${displayNum}`;

	if (id === 'presetCombatRespecCell') {
		MODULES.portal.disableAutoRespec = 0;
	}

	if (num > game.global.world && (id === 'dailyDontPortalBefore' || id === 'heliumHrDontPortalBefore')) {
		MODULES.mapFunctions.afterVoids = false;
		mapSettings.portalAfterVoids = false;
	}

	saveSettings();
}

function parseNum(num) {
	return num.includes('e') ? parseExponential(num) : parseSuffix(num);
}

function parseExponential(num) {
	const [base, exponent] = num.split('e');
	return Math.floor(parseFloat(base) * 10 ** parseInt(exponent));
}

function parseSuffix(num) {
	const suffices = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Od', 'Nd', 'V', 'Uv', 'Dv', 'Tv', 'Qav', 'Qiv', 'Sxv', 'Spv', 'Ov', 'Nv', 'Tt'];
	const letters = num.replace(/[^a-z]/gi, '');
	const base = suffices.findIndex((suffix) => suffix.toLowerCase() === letters.toLowerCase()) + 1;

	return base ? Math.round(parseFloat(num.split(letters)[0]) * 1000 ** base) : parseFloat(num);
}

function autoSetValueToolTip(id, text, multi, negative) {
	const valueSuffix = autoTrimpSettings.universeSetting.value === 1 && autoTrimpSettings[id].universe.indexOf(0) === -1 ? 'U2' : '';
	const tooltipDiv = document.getElementById('tooltipDiv');
	const tooltipText = `Type a number below. You can use shorthand such as 2e5, 1sx, or 200k. ${negative ? 'Accepts negative numbers as validated inputs.' : 'Put -1 for Infinite.'}<br/><br/><input id="customNumberBox" style="width: 100%" onkeypress="onKeyPressSetting(event, '${id}', ${multi}, ${negative})" value="${autoTrimpSettings[id]['value' + valueSuffix]}"></input>`;
	const costText = `<div class="maxCenter"><div class="btn btn-info" onclick="autoSetValue('${id}', ${multi}, ${negative})">Apply</div><div class="btn btn-info" onclick="cancelTooltip()">Cancel</div></div>`;
	game.global.lockTooltip = true;
	tooltipDiv.style.left = '32.5%';
	tooltipDiv.style.top = '25%';
	document.getElementById('tipTitle').textContent = `${text}: Value Input`;
	document.getElementById('tipText').innerHTML = tooltipText;
	document.getElementById('tipCost').innerHTML = costText;
	tooltipDiv.style.display = 'block';
	const customNumberBox = document.getElementById('customNumberBox');
	try {
		customNumberBox.setSelectionRange(0, box.value.length);
	} catch (e) {
		customNumberBox.select();
	}
	customNumberBox.focus();
}

function autoSetText(id, multiValue) {
	const setting = autoTrimpSettings[id];
	const valueSuffix = autoTrimpSettings.universeSetting.value === 1 && setting.universe.indexOf(0) === -1 ? 'U2' : '';
	const textBox = document.getElementById('customTextBox');
	if (!textBox) return;

	unlockTooltip();
	tooltip('hide');
	const textVal = multiValue ? textBox.value.replace(/, /g, ',').split(',') : textBox.value;
	setting[`value${valueSuffix}`] = textVal;

	const element = document.getElementById(id);
	if (textVal !== undefined && element) {
		let displayText = '';
		if (Array.isArray(textVal)) {
			displayText = textVal.length === 1 && textVal[0] === -1 ? "<span class='icomoon icon-infinity'></span>" : textVal[0] + '+';
		} else {
			displayText = textVal.length > 18 ? textVal.substring(0, 21) + '...' : textVal;
		}
		element.innerHTML = setting.name() + ': ' + displayText;
	}

	if (id.includes('archaeology')) archaeologyAutomator();
	saveSettings();
}

function autoSetTextToolTip(id, text, multiValue) {
	const setting = autoTrimpSettings[id];
	const valueSuffix = autoTrimpSettings.universeSetting.value === 1 && setting.universe.indexOf(0) === -1 ? 'U2' : '';
	const tooltipDiv = document.getElementById('tooltipDiv');

	const tooltipText = `Type your input below<br/><br/><input id="customTextBox" style="width: 100%" onkeypress="onKeyPressSetting(event, '${id}', ${multiValue})" value="${setting['value' + valueSuffix]}"></input>`;
	const costText = `<div class="maxCenter"><div class="btn btn-info" onclick="autoSetText('${id}', ${multiValue})">Apply</div><div class="btn btn-info" onclick="cancelTooltip()">Cancel</div></div>`;

	game.global.lockTooltip = true;
	tooltipDiv.style.left = '32.5%';
	tooltipDiv.style.top = '25%';
	document.getElementById('tipTitle').textContent = `${text}: Value Input`;
	document.getElementById('tipText').innerHTML = tooltipText;
	document.getElementById('tipCost').innerHTML = costText;
	tooltipDiv.style.display = 'block';

	const textBox = document.getElementById('customTextBox');
	try {
		textBox.setSelectionRange(0, textBox.value.length);
	} catch (e) {
		textBox.select();
	}
	textBox.focus();
}

function autoToggle(what) {
	const items = ['graphParent', 'autoTrimpsTabBarMenu', 'autoSettings'];

	if (what === 'trimpSettings') {
		items.forEach((id) => {
			const element = document.getElementById(id);
			if (element && element.style.display === 'block') {
				element.style.display = 'none';
			}
		});

		toggleSettingsMenu();
		return;
	}

	const autoTrimpsTabBarMenu = document.getElementById('autoTrimpsTabBarMenu');
	const autoSettings = document.getElementById('autoSettings');

	if (usingRealTimeOffline && !getPageSetting('timeWarpDisplay')) {
		if (autoTrimpsTabBarMenu.parentNode.id === 'settingsRow') {
			document.getElementById('settingsRowTW').append(autoTrimpsTabBarMenu, autoSettings);
			autoTrimpsTabBarMenu.style.display = 'none';
			autoSettings.style.display = 'none';
		}
	} else {
		if (autoTrimpsTabBarMenu.parentNode.id === 'settingsRowTW') {
			document.getElementById('settingsRow').append(autoTrimpsTabBarMenu, autoSettings);
			autoTrimpsTabBarMenu.style.display = 'none';
			autoSettings.style.display = 'none';
		}
	}

	if (game.options.displayed) toggleSettingsMenu();
	items.forEach((item) => {
		const element = document.getElementById(item);
		if (element !== null) {
			if (element.style.display === 'block') {
				element.style.display = 'none';
			} else {
				if (item !== 'graphParent') element.style.display = 'block';
				if (item === 'autoSettings') updateAutoTrimpSettings(true);
			}
		}
	});
}

function updateAutoTrimpSettings(forceUpdate) {
	const isGraphModuleDefined = typeof MODULES.graphs !== 'undefined';
	const isLastThemeDefined = typeof lastTheme !== 'undefined';
	const hasThemeChanged = isLastThemeDefined && game.options.menu.darkTheme.enabled !== lastTheme;

	if (isGraphModuleDefined && hasThemeChanged) {
		MODULES['graphs'].themeChanged();
		lastTheme = game.options.menu.darkTheme.enabled;
	}
	currSettingUniverse = autoTrimpSettings.universeSetting.value + 1;

	for (let setting in autoTrimpSettings) {
		if (['ATversion', 'ATversionChangelog'].includes(setting)) continue;

		const item = autoTrimpSettings[setting];
		const settingUniverse = item.universe;

		if (item === null || typeof item.id === 'undefined' || !Array.isArray(settingUniverse)) {
			if (atSettings.initialise.loaded) delete autoTrimpSettings[setting];
			continue;
		}

		const displaySetting = settingUniverse.includes(currSettingUniverse) || settingUniverse.includes(0);
		_toggleElem(setting, displaySetting);
		if (!displaySetting) continue;

		if (forceUpdate) if (!_setDisplayedSettings(item)) continue;
	}

	if (forceUpdate) _setDisplayedTabs();
	_settingsToLineBreak();
}

function _toggleElem(elementId, isVisible) {
	const element = document.getElementById(elementId);
	if (!element) return;

	const setting = autoTrimpSettings[elementId];
	if (isVisible && setting.require && !getPageSetting('displayAllSettings') && !setting.require()) isVisible = false;

	const displayState = isVisible ? '' : 'none';
	const parentDisplayState = isVisible ? 'inline-block' : 'none';
	element.style.display = displayState;

	if (element.parentNode) {
		element.parentNode.style.display = parentDisplayState;
	}

	if (setting && setting.type === 'dropdown') {
		let selected = 'selected';
		if (currSettingUniverse === 2 && !setting.universe.includes(0)) selected += 'U2';
		element.value = setting[selected];
	}
}

function _setDisplayedSettings(item) {
	let elem = document.getElementById(item.id);
	if (!elem) return false;

	const settingUniverse = item.universe;
	const radonSetting = autoTrimpSettings.universeSetting.value === 1 && settingUniverse.indexOf(0) === -1 ? 'U2' : '';

	const handleBooleanType = (item, elem) => {
		const itemEnabled = item['enabled' + radonSetting];
		elem.setAttribute('class', `toggleConfigBtnLocal noselect settingsBtn settingBtn${itemEnabled}`);
		elem.innerHTML = item.name();
	};

	const handleValueType = (item, elem) => {
		const itemValue = item['value' + radonSetting];
		if (item.type === 'multitoggle') {
			elem.innerHTML = item.name()[itemValue];
			elem.setAttribute('class', `toggleConfigBtnLocal noselect settingsBtn settingBtn${itemValue}`);
		} else if (item.type === 'textValue' && itemValue && itemValue.substring) {
			elem.innerHTML = `${item.name()}: ${itemValue.substring(0, 21)}${itemValue.length > 18 ? '...' : ''}`;
		} else if (item.type === 'multiValue' || item.type === 'multiTextValue') {
			handleMultiValue(item, elem, itemValue);
		} else if (itemValue > -1 || item.type === 'valueNegative') {
			elem.innerHTML = `${item.name()}: ${prettify(itemValue)}`;
		} else {
			elem.innerHTML = `${item.name()}: <span class='icomoon icon-infinity'></span>`;
		}
	};

	const handleMultiValue = (item, elem, itemValue) => {
		if (Array.isArray(itemValue) && itemValue.length === 1 && itemValue[0] === -1) {
			elem.innerHTML = `${item.name()}: <span class='icomoon icon-infinity'></span>`;
		} else if (Array.isArray(itemValue)) {
			elem.innerHTML = `${item.name()}: ${itemValue[0]}+`;
		} else {
			elem.innerHTML = `${item.name()}: ${itemValue}`;
		}
	};

	const handleDropdownType = (item, elem) => {
		const itemSelected = item['selected' + radonSetting];
		elem.innerHTML = '';
		const listItems = item.list();
		for (let dropdown in listItems) {
			let option = document.createElement('option');
			option.value = listItems[dropdown];
			option.text = listItems[dropdown];
			elem.appendChild(option);
		}
		elem.value = itemSelected;
	};

	if (item.type === 'boolean') {
		handleBooleanType(item, elem);
	} else if (['value', 'valueNegative', 'multitoggle', 'multiValue', 'textValue', 'multiTextValue'].includes(item.type)) {
		handleValueType(item, elem);
	} else if (item.type === 'dropdown') {
		handleDropdownType(item, elem);
	} else {
		elem.innerHTML = item.name();
	}

	const setTooltip = (elem, name, description) => {
		if (item.type === 'dropdown') elem = elem.parentNode;
		elem.setAttribute('onmouseover', `tooltip("${name}", "customText", event, "${description}")`);
	};

	const setOnClick = (elem, item) => {
		if (item.type === 'value' || item.type === 'multiValue' || item.type === 'valueNegative') {
			elem.setAttribute('onclick', `autoSetValueToolTip("${item.id}", "${item.name()}", "${item.type === 'multiValue'}", "${item.type === 'valueNegative'}")`);
		}
		if (item.type === 'textValue') {
			elem.setAttribute('onclick', `autoSetTextToolTip("${item.id}", "${item.name()}", ${item.type === 'multiTextValue'})`);
		}
	};

	if (item.type === 'multitoggle') {
		setTooltip(elem, item.name().join(' / '), item.description());
	} else {
		setTooltip(elem, item.name(), item.description());
		setOnClick(elem, item);
	}
}

function _setDisplayedTabs() {
	const hze = game.stats.highestLevel.valueTotal();
	const highestRadonZone = game.stats.highestRadLevel.valueTotal();
	const displayAllSettings = getPageSetting('displayAllSettings');
	const radonOn = autoTrimpSettings.universeSetting.value === 1;

	const tabList = {
		tabBeta: !gameUserCheck(),
		tabBuildings: !displayAllSettings && (radonOn || (!radonOn && hze < 60)),
		tabC2: !displayAllSettings && !radonOn && hze < 65,
		tabChallenges: !displayAllSettings && ((radonOn && highestRadonZone < 35) || (!radonOn && hze < 40)),
		tabDaily: !displayAllSettings && !radonOn && hze < 99,
		tabFluffy: radonOn || (!displayAllSettings && game.global.spiresCompleted < 2),
		tabJobs: radonOn || (!displayAllSettings && hze < 70),
		tabHeirloom: game.global.totalPortals === 0,
		tabGolden: getAchievementStrengthLevel() === 0,
		tabMagma: radonOn || (!displayAllSettings && hze < 230),
		tabNature: radonOn || (!displayAllSettings && hze < 236),
		tabSpire: radonOn || (!displayAllSettings && hze < 190),
		tabTest: !gameUserCheck()
	};

	for (let tab in tabList) {
		const tabElem = document.getElementById(tab);
		const hideTab = tabList[tab];
		if (tabElem !== null) {
			if (tab === 'tabC2') {
				document.getElementById('C2').children[0].children[0].innerHTML = _getChallenge2Info() + ' - Settings for ' + _getSpecialChallengeDescription();
				document.getElementById('tabC2').children[0].innerHTML = _getChallenge2Info();
			}
			tabElem.style.display = hideTab ? 'none' : '';
			const tabDisplay = document.getElementById(tab.substring(3));
			if (hideTab && tabDisplay.style.display === 'block') tabDisplay.style.display = 'none';
			else if (!hideTab && tabElem.children[0].classList.contains('active')) tabDisplay.style.display = 'block';
		}
	}

	_setSelect2Dropdowns();
}

function _setSelect2Dropdowns() {
	$(document).ready(function () {
		$('.select2').select2({
			templateSelection: _setSelect2DropdownsPrefix,
			escapeMarkup: function (m) {
				return m;
			}
		});
	});
}

function _setSelect2DropdownsPrefix(dropdownSetting) {
	const prefix = dropdownSetting._resultId.split('-');
	const prefixName = prefix ? `${autoTrimpSettings[prefix[1]].name()}: ` : '';
	const text = dropdownSetting.text;

	return `<font color='#00A7E1'>${prefixName}</font> <float='right'>${text}</float>`;
}

function _settingsToLineBreak() {
	const heirloom = getPageSetting('heirloomAuto', currSettingUniverse) ? 'show' : 'hide';

	const breakAfterCore = ['portalVoidIncrement', 'universeSetting'];
	const breakAfterMaps = ['autoLevelScryer', 'scryvoidmaps', 'prestigeClimbPriority', 'uniqueMapEnoughHealth'];
	const breakAfterDaily = ['dscryvoidmaps', 'dAutoDStanceSpire', 'dWindStackingLiq', 'dailyHeliumHrPortal'];
	const breakAfterEquipment = ['equipPercent', 'equipNoShields'];
	const breakAfterCombat = ['frenzyCalc', 'scryerEssenceOnly', 'scryerDieZone'];
	const breakAfterJobs = ['geneAssistTimerSpire', 'geneAssistTimerAfter', 'geneAssistTimerSpireDaily'];
	const breakAfterC2 = ['c2disableFinished', 'c2Fused', 'c2AutoDStanceSpire', 'duelShield', 'trapperWorldStaff', 'mapologyPrestige', 'lead', 'frigidSwapZone', 'experienceEndBW', 'witherShield', 'questSmithyMaps', 'mayhemSwapZone', 'stormStacks', 'berserkDisableMapping', 'pandemoniumSwapZone', 'glassStacks', 'desolationSettings'];
	const breakAfterBuildings = ['autoGigaDeltaFactor'];
	const breakAfterChallenges = ['balanceImprobDestack', 'buble', 'decayStacksToAbandon', 'lifeStacks', 'toxicitySettings', 'archaeologyString3', 'exterminateWorldStaff'];
	const breakAfterHeirlooms = ['heirloomCompressedSwap', 'heirloomWindStack', 'heirloomSwapHDCompressed', 'heirloomStaffFragment', 'heirloomStaffScience'];
	const breakAfterMagma = ['autoGenModeC2', 'magmiteMinimize'];
	const breakAfterNature = ['autoIce', 'autoenlight', 'iceEnlight', 'iceEnlightDaily'];
	const breakAfterDisplay = ['EnableAFK', 'shieldGymMostEfficientDisplay'];
	const breakAfterTest = ['testTotalEquipmentCost'];

	const breakAfterIDs = [...breakAfterCore, ...breakAfterMaps, ...breakAfterDaily, ...breakAfterEquipment, ...breakAfterCombat, ...breakAfterJobs, ...breakAfterC2, ...breakAfterBuildings, ...breakAfterChallenges, ...breakAfterHeirlooms, ...breakAfterMagma, ...breakAfterNature, ...breakAfterDisplay, ...breakAfterTest];

	const breakAfterHeirloomIDs = ['heirloomAutoModTarget', 'heirloomAutoShieldMod7', 'heirloomAutoStaffMod7'];

	breakAfterIDs.forEach((id) => _setSettingLineBreaks(id, 'show'));
	breakAfterHeirloomIDs.forEach((id) => _setSettingLineBreaks(id, heirloom));

	if (getPageSetting('displayAllSettings') || (getPageSetting('autoPortal', currSettingUniverse).includes('Hour') && (holidayObj.holiday === 'Eggy' || game.stats.highestLevel.valueTotal() >= 170 || getPageSetting('heliumHourChallenge', currSettingUniverse).includes('Challenge'))) || Fluffy.checkU2Allowed()) {
		_setSettingLineBreaks('heliumHrDontPortalBefore', 'show');
	} else {
		_setSettingLineBreaks('heliumHrDontPortalBefore', 'hide');
	}
}

function _setSettingLineBreaks(id, style = 'show') {
	function isBreak(elem) {
		return elem && elem.nodeName === 'BR';
	}

	const elem = document.getElementById(id).parentNode;
	const elemSibling = elem.nextElementSibling;
	const nextElemSibling = elemSibling.nextElementSibling;

	if (style === 'show' && !isBreak(elemSibling) && elemSibling.style.display !== 'none') elem.insertAdjacentHTML('afterend', '<br>');
	if (style === 'hide' && isBreak(elemSibling)) elemSibling.remove();
	if (isBreak(elemSibling) && nextElemSibling.style.display === 'none') elemSibling.remove();
}

function settingUniverse(id) {
	const setting = getPageSetting(id, game.global.universe);
	if (id === 'autoMaps' && setting === 2) return 1;
	return setting;
}

function _setFightButtons(setting = getPageSetting('displayHideAutoButtons')) {
	const fightBtn = document.getElementById('fightBtn');
	const fightStyle = !setting.fight ? 'block' : 'none';
	if (game.upgrades.Battle.done && fightBtn.style.display !== fightStyle) fightBtn.style.display = fightStyle;

	const pauseFight = document.getElementById('pauseFight');
	const pauseStyle = !setting.autoFight ? 'block' : 'none';
	if (pauseFight.style.display !== pauseStyle) pauseFight.style.display = pauseStyle;
	if (game.upgrades.Bloodlust.done && pauseFight.style.display !== pauseStyle) pauseFight.style.display = pauseStyle;
}

function _setAttributes(element, attributes) {
	for (let attr in attributes) {
		element.setAttribute(attr, attributes[attr]);
	}
}

function _appendChildren(element, children) {
	(children || []).forEach((child) => {
		if (typeof child === 'string') {
			child = document.createTextNode(child);
		}
		element.appendChild(child);
	});
}

function _createElement(type, attributes, children) {
	const element = document.createElement(type);
	_setAttributes(element, attributes);
	_appendChildren(element, children);
	return element;
}

function _createButton(id, label, setting, tooltipText, timeWarp = '') {
	const settingInfo = autoTrimpSettings[id];
	const initialStyle = timeWarp ? 'display: inline-block; vertical-align: top; margin-left: 0.5vw; margin-top: 0.25vw; margin-bottom: 1vw; width: 16.382vw; border-color: #5D5D5D;' : '';
	const initial = _createElement('DIV', {
		style: initialStyle,
		class: 'col-xs-3 lowPad',
		id: `auto${label}${timeWarp}Parent`
	});
	const containerStyle = timeWarp ? 'position: relative; min-height: 1px; padding-left: 5px; font-size: 1.1vw; height: auto; border-color: #5D5D5D;' : 'display: block; font-size: 0.9vw; border-color: #5D5D5D;';
	const container = _createElement('DIV', {
		style: containerStyle,
		class: 'toggleConfigBtn pointer noselect settingsBtn settingBtn' + (setting === 2 ? 3 : setting),
		onmouseover: `tooltip("Toggle Auto${label}", "customText", event, ${tooltipText})`,
		onmouseout: 'tooltip("hide")'
	});
	const text = _createElement(
		'DIV',
		{
			id: `auto${label}Label${timeWarp}`,
			onClick: `settingChanged('${id}', true)`
		},
		[settingInfo.type === 'multitoggle' ? autoTrimpSettings[id].name()[setting] : autoTrimpSettings[id].name()]
	);
	const settings = _createElement('DIV', { onclick: `importExportTooltip("Auto${label}")` });
	const settingsButton = _createElement('SPAN', { class: 'glyphicon glyphicon-cog' });

	container.appendChild(text);
	if (label !== 'Equip') {
		container.appendChild(settings);
		settings.appendChild(settingsButton);
	}
	initial.appendChild(container);

	return initial;
}

function _setupATButtons() {
	_createAutoTrimpsButton();
	_createAutoMapsButton();
	_createStatusTextbox();
	_createResourcePerHourContainer();
	_createMessagesButton();
	_createAdditionalInfoTextbox();
	_updateSettingButtons();
	_createChangelogButton();

	document.getElementById('portalTimer').setAttribute('style', 'cursor: default; min-width: 8.5vw');

	Array.from(document.getElementsByClassName('fightBtn')).forEach((btn) => {
		btn.style.padding = '0.01vw 0.01vw';
	});

	_createAutoJobsButton();
	_createAutoStructureButton();
	_createAutoEquipButton();

	hideAutomationButtons();

	/* 
	Setup buttons for Time Warp UI
	 */

	_createSettingsRowTW();
	_createBtnRowTW();
	_createStatusTextboxTW();
	_createAutoMapsButtonTW();
	_createAutoJobsButtonTW();
	_createAutoTrimpsButtonTW();
	_createAutoStructureButtonTW();
}

function _updateSettingButtons() {
	Array.from(document.getElementsByClassName('btn btn-default'))
		.filter((button) => button.getAttribute('onclick') === 'toggleSettingsMenu()')
		.forEach((button) => button.setAttribute('onclick', 'autoToggle("trimpSettings")'));
}

function _createChangelogButton() {
	if (document.getElementById('atChangelog') !== null) return;

	const newChanges = autoTrimpSettings.ATversionChangelog !== atSettings.initialise.version;
	const changelog = _createElement(
		'TD',
		{
			id: 'atChangelog',
			class: 'btn' + (newChanges ? ' btn-changelogNew' : ' btn-primary'),
			onclick: "window.open(atSettings.initialise.basepath + 'updates.html', '_blank'); updateChangelogButton();"
		},
		['AT ' + atSettings.initialise.version.split('SadAugust ')[1] + (newChanges ? " | What's New" : '')]
	);

	let settingbarRow = document.getElementById('settingsTable').firstElementChild.firstElementChild;
	settingbarRow.insertBefore(changelog, settingbarRow.childNodes[settingbarRow.childNodes.length - 4]);
}

function _createAutoTrimpsButton() {
	if (document.getElementById('atSettingsBtn') !== null) return;

	const atSettings = _createElement(
		'TD',
		{
			id: 'atSettingsBtn',
			class: 'btn btn-default',
			onclick: 'autoToggle();'
		},
		['AutoTrimps']
	);

	let settingbarRow = document.getElementById('settingsTable').firstElementChild.firstElementChild;
	settingbarRow.insertBefore(atSettings, settingbarRow.childNodes[10]);
}

function _createAutoMapsButton() {
	if (document.getElementById('autoMapBtn') !== null) return;

	const fightButtonCol = document.getElementById('battleBtnsColumn');

	const autoMapsContainer = _createElement(
		'DIV',
		{
			style: 'margin-top: 0.2vw; display: block; font-size: 1vw; height: 1.5em; text-align: center; border-radius: 4px',
			id: 'autoMapBtn',
			class: 'noselect settingsBtn settingBtn' + settingUniverse('autoMaps'),
			onClick: "settingChanged('autoMaps', true);",
			onmouseover: 'tooltip("Toggle Auto Maps", "customText", event, autoTrimpSettings.autoMaps.description(true))',
			onmouseout: 'tooltip("hide")'
		},
		['Auto Maps']
	);

	fightButtonCol.appendChild(autoMapsContainer);
}

function _createAutoMapsButtonTW() {
	if (document.getElementById('autoMapBtnTW') !== null) return;

	const autoMapsContainer = _createElement(
		'DIV',
		{
			id: 'autoMapBtnTW',
			class: 'btn btn-lg offlineExtraBtn settingsBtn settingBtn' + settingUniverse('autoMaps'),
			onClick: "settingChanged('autoMaps', true);",
			onmouseover: 'tooltip("Toggle Auto Maps", "customText", event, autoTrimpSettings.autoMaps.description(true))',
			onmouseout: 'tooltip("hide")'
		},
		['Auto Maps']
	);
	document.getElementById('offlineExtraBtnsContainer').children[2].insertAdjacentHTML('afterend', '<br>');
	const offlineExtraBtnsContainer = document.getElementById('offlineFightBtn').parentNode;
	offlineExtraBtnsContainer.replaceChild(autoMapsContainer, document.getElementById('offlineFightBtn').parentNode.children[3]);
}

function _createStatusTextbox() {
	if (document.getElementById('autoMapStatus') !== null) return;

	const fightButtonCol = document.getElementById('battleBtnsColumn');

	const autoMapsStatusContainer = _createElement('DIV', {
		class: 'noselect',
		style: 'display: block; font-size: 1vw; text-align: center; background-color: rgba(0,0,0,0.3);',
		onmouseout: 'tooltip("hide")',
		id: 'autoMapStatus'
	});

	fightButtonCol.appendChild(autoMapsStatusContainer);
}

function _createResourcePerHourContainer() {
	if (document.getElementById('heHrStatus') !== null) return;

	const fightButtonCol = document.getElementById('battleBtnsColumn');

	const resourcePerHourContainer = _createElement('DIV', {
		style: 'display: ' + (getPageSetting('displayHideAutoButtons').ATheHr ? 'block' : 'none') + '; font-size: 1vw; text-align: center; margin-top: 2px; background-color: rgba(0,0,0,0.3);',
		onmouseout: 'tooltip("hide")',
		id: 'heHrStatus'
	});

	fightButtonCol.appendChild(resourcePerHourContainer);
}

function _createAdditionalInfoTextbox() {
	if (document.getElementById('additionalInfo') !== null) return;

	const additionalInfoContainer = _createElement('DIV', {
		style: 'display: block; font-size: 0.9vw; text-align: centre; background-color: rgba(0, 0, 0, 0.3);',
		onmouseover: '',
		onmouseout: 'tooltip("hide")'
	});

	const additionalInfoText = _createElement('SPAN', { id: 'additionalInfo' });
	additionalInfoContainer.appendChild(additionalInfoText);

	const trimpsButtonCol = document.getElementById('trimps');
	trimpsButtonCol.appendChild(additionalInfoContainer);
}

function _createAutoJobsButton() {
	if (document.getElementById('autoJobsLabel') !== null) return;

	document.getElementById('fireBtn').parentElement.style.width = '14.2%';
	document.getElementById('fireBtn').parentElement.style.paddingRight = '2px';
	document.getElementById('jobsTitleSpan').parentElement.style.width = '10%';
	const jobButton = _createButton('jobType', 'Jobs', getPageSetting('jobType'), 'autoTrimpSettings.jobType.description()');
	const jobColumn = document.getElementById('jobsTitleDiv').children[0];
	jobColumn.insertBefore(jobButton, jobColumn.children[2]);
}

function _createAutoStructureButton() {
	if (document.getElementById('autoStructureLabel') !== null) return;

	const structureButton = _createButton('buildingsType', 'Structure', settingUniverse('buildingsType'), 'autoTrimpSettings.buildingsType.description()');
	const structureColumn = document.getElementById('buildingsTitleDiv').children[0];
	structureColumn.replaceChild(structureButton, structureColumn.children[1]);
}

function _createAutoEquipButton() {
	if (document.getElementById('autoEquipLabel') !== null) return;

	const equipButton = _createButton('equipOn', 'Equip', settingUniverse('equipOn'), '"Toggle the Auto Equip setting."');
	const equipColumn = document.getElementById('equipmentTitleDiv').children[0];
	equipColumn.replaceChild(equipButton, equipColumn.children[2]);
}

function _createMessagesButton() {
	if (document.getElementById('AutoTrimpsFilter') !== null) return;

	let atBtnContainer = _createElement('DIV', {
		class: 'btn-group',
		role: 'group',
		onmouseover: 'tooltip("Toggle AutoTrimps Messages", "customText", event, `This will control the visibility of AutoTrimps messages in the log window based on your settings.<br>Note: Only map-related messages will be displayed during Time Warp.`)',
		onmouseout: 'tooltip("hide")'
	});
	const btnDisplay = `btn-${getPageSetting('spamMessages').show ? 'success' : 'danger'}`;
	let atBtnText = _createElement(
		'button',
		{
			id: 'AutoTrimpsFilter',
			type: 'button',
			onClick: 'filterMessage_AT()',
			class: `btn ${btnDisplay} logFlt`
		},
		['AT Messages']
	);

	atBtnContainer.appendChild(atBtnText);
	document.getElementById('logBtnGroup').appendChild(atBtnContainer);

	const atBtnSettings = _createElement('button', {
		id: 'logConfigBtn',
		type: 'button',
		onclick: 'importExportTooltip("MessageConfig")',
		class: 'btn btn-default logFlt'
	});

	const atBtnSettingsButton = _createElement('SPAN', { class: 'glyphicon glyphicon-cog' });
	atBtnSettings.appendChild(atBtnSettingsButton);

	const tab = _createElement(
		'DIV',
		{
			id: 'logConfigHolder',
			class: 'btn-group',
			role: 'group'
		},
		[atBtnSettings]
	);

	document.getElementById('logBtnGroup').appendChild(tab);
}

function _setTimeWarpUI() {
	if (!usingRealTimeOffline) return;

	const displaySetting = !getPageSetting('timeWarpDisplay') ? 'block' : 'none';
	document.getElementById('offlineWrapper').style.display = displaySetting;
	document.getElementById('innerWrapper').style.display = displaySetting === 'block' ? 'none' : 'block';
}

function _createSettingsRowTW() {
	if (document.getElementById('settingsRowTW') !== null) return;

	let settingBarRow = document.createElement('DIV');
	settingBarRow.setAttribute('id', 'settingsRowTW');
	document.getElementById('offlineWrapper').children[0].insertAdjacentHTML('afterend', '<br>');
	let offlineWrapperParent = document.getElementById('offlineInnerWrapper').parentNode;
	offlineWrapperParent.replaceChild(settingBarRow, document.getElementById('offlineInnerWrapper').parentNode.children[1]);
}

function _createBtnRowTW() {
	const settingsRow = document.createElement('DIV');
	settingsRow.setAttribute('class', 'row');
	settingsRow.setAttribute('id', 'settingBtnTW');
	settingsRow.setAttribute('style', 'display: block');

	document.getElementById('offlineInnerWrapper').children[3].insertAdjacentHTML('afterend', '<br>');
	let offlineProgressParent = document.getElementById('offlineProgressWrapper').parentNode;
	offlineProgressParent.replaceChild(settingsRow, document.getElementById('offlineProgressWrapper').parentNode.children[4]);
}

function _createAutoJobsButtonTW() {
	if (document.getElementById('autoJobsLabelTW') !== null) return;

	const atJobInitial = _createButton('jobType', 'Jobs', getPageSetting('jobType'), 'autoTrimpSettings.jobType.description()', 'TW');
	$('#settingBtnTW').append(atJobInitial);
}

function _createAutoStructureButtonTW() {
	if (document.getElementById('autoStructureTWParent') !== null) return;

	const atStructureInitial = _createButton('buildingsType', 'Structure', getPageSetting('buildingsType'), 'autoTrimpSettings.buildingsType.description()', 'TW');
	$('#settingBtnTW').append(atStructureInitial);
}

function _createAutoMapsStatusContainer(id) {
	return _createElement('DIV', {
		id: id,
		class: 'noselect',
		style: 'display: block; font-size: 1.25vw; text-align: center; background-color: rgba(0,0,0,0.3); position: absolute; bottom: 1vw; left: 10%; right: 10%',
		onmouseout: 'tooltip("hide")'
	});
}

function _createStatusTextboxTW() {
	const whereToPlace = ['offlineZoneBtns', 'offlineMapBtns'];
	const ids = ['autoMapStatusMapsTW', 'autoMapStatusTW'];

	whereToPlace.forEach((place, index) => {
		if (document.getElementById(ids[index]) !== null) return;

		const autoMapsStatusContainer = _createAutoMapsStatusContainer(ids[index]);
		const autoMapsStatusSection = document.getElementById(place);
		const element = autoMapsStatusSection.children[1];
		element.insertAdjacentHTML('afterend', '<br>');
		element.parentNode.replaceChild(autoMapsStatusContainer, element.nextSibling);
	});
}

function _createAutoTrimpsButtonTW() {
	if (document.getElementById('atSettingsBtnTW') !== null) return;

	const atSettings = _createElement(
		'DIV',
		{
			id: 'atSettingsBtnTW',
			style: 'display: inline-block; vertical-align: top; margin-left: 0.5vw; margin-top: 0.25vw; margin-bottom: 1vw; width: 16.382vw; border-color: #5D5D5D; height:auto; font-size: 1.1vw;',
			class: 'toggleConfigBtn noselect settingsBtn settingBtn4',
			onclick: 'autoToggle();',
			onmouseover: 'tooltip("AutoTrimp Settings", "customText", event, "Click to open the AutoTrimps Settings menu.")',
			onmouseout: 'tooltip("hide")'
		},
		['AutoTrimps Settings']
	);
	$('#settingBtnTW').append(atSettings);
}

function _setAutoMapsClasses() {
	let autoMaps = getPageSetting('autoMaps');
	document.getElementById('autoMaps').setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoMaps);
	if (autoMaps === 2) autoMaps = 1;
	document.getElementById('autoMapBtn').setAttribute('class', 'noselect settingsBtn settingBtn' + autoMaps);
	document.getElementById('autoMapBtnTW').setAttribute('class', 'btn btn-lg offlineExtraBtn settingsBtn settingBtn' + autoMaps);
}

function _setBuildingClasses() {
	const autoStructure = getPageSetting('buildingsType');
	document.getElementById('buildingsType').setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoStructure);
	document.getElementById('autoStructureLabel').parentNode.setAttribute('class', 'toggleConfigBtn pointer noselect autoUpgradeBtn settingBtn' + autoStructure);
	document.getElementById('autoStructureLabelTW').parentNode.setAttribute('class', 'toggleConfigBtn pointer noselect settingsBtn settingBtn' + autoStructure);
}

function _setAutoEquipClasses() {
	const autoEquip = getPageSetting('equipOn');
	document.getElementById('equipOn').setAttribute('class', 'toggleConfigBtn noselect settingsBtn settingBtn' + autoEquip);
	document.getElementById('autoEquipLabel').parentNode.setAttribute('class', 'pointer noselect autoUpgradeBtn settingBtn' + autoEquip);
}

function _setAutoJobsClasses() {
	const btnVal = getPageSetting('jobType');
	const btnName = autoTrimpSettings['jobType'].name()[btnVal];
	['jobType', 'autoJobsLabel', 'autoJobsLabelTW'].forEach(function (elemId) {
		let elem = document.getElementById(elemId);
		if (elem !== null) {
			elem.parentNode.setAttribute('class', `toggleConfigBtn noselect pointer settingBtn${btnVal === 2 ? 3 : btnVal}`);
			if (elemId === 'jobType') {
				elem.parentNode.classList.remove('toggleConfigBtn');
				elem.innerHTML = btnName;
			}
			elem.textContent = btnName;
		}
	});
}
