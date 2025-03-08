function automationMenuSettingsInit() {
	const settingsRow = document.getElementById('settingsRow');
	const settingsHere = document.getElementById('settingsHere');
	const settingsTable = document.getElementById('settingsTable');

	if (settingsHere && settingsTable) {
		settingsRow.insertBefore(settingsHere, settingsTable);
	}

	const autoSettings = document.createElement('DIV');
	autoSettings.id = 'autoSettings';
	autoSettings.style.display = 'none';
	autoSettings.style.maxHeight = '92.5vh';
	autoSettings.style.overflow = 'auto';
	autoSettings.classList.add('niceScroll');
	settingsRow.insertBefore(autoSettings, settingsRow.childNodes[1]);
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
		['Spire', 'Spire - Settings for Spires. HD Ratio and Hits Survived calculations for the Spire will be based off your Exit After Cell if set.'],
		['Magma', 'Dimensional Generator & Magmite Settings'],
		['Nature', 'Nature Settings'],
		['Fluffy', 'Fluffy Evolution Settings'],
		['Spire Assault', `Spire Assault - Settings to automate clearing Spire Assault levels and farming equipment levels.`],
		['Time Warp', 'Time Warp (offline time) Settings'],
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

	for (const tab of tabs) {
		tab.style.display = 'none';
	}

	for (const link of links) {
		link.classList.remove('active');
	}
}

function _maximizeAllTabs() {
	const tabs = document.getElementsByClassName('tabcontent');
	const links = document.getElementsByClassName('tablinks');

	for (const tab of tabs) {
		if (tab.id.toLowerCase() === 'test' || tab.id.toLowerCase() === 'beta') continue;
		tab.style.display = 'block';
	}

	for (const link of links) {
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
			function () { return (['Auto Gather: Off', 'Auto Gather: On', 'Auto Gather: Mining Only', 'Auto Gather: No Science']) },
			function () {
				let description = "<p>Lets the script control what you gather and build.</p>";
				description += "<p><b>Auto Gather: Off</b><br>Disables this setting.</p>";
				description += "<p><b>Auto Gather: On</b><br>Automatically switch your gathering between resources and the building queue depending on what the script deems necessary.</p>";
				description += "<p><b>Auto Gather: Mining Only</b><br>Sets gather to <b>Mining</b> unless buildings are in the queue then it will prioritise building them.<br>Only use this if you are past the early stages of the game and have <b>Foremany</b> unlocked.</p>";
				description += "<p><b>Auto Gather: No Science</b><br>Works the same as <b>Auto Gather: On</b> but stops <b>Science</b> from being gathered.</p>";
				description += "<p><b>Recommended:</b> Auto Gather: On</p>";
				return description;
			}, 'multitoggle', 1, null, 'Core', [1, 2]);

		createSetting('upgradeType',
			function () { return (['Buy Upgrades: Off', 'Buy Upgrades: On', 'Buy Upgrades: No Coords']) },
			function () {
				let description = `<p>Lets the script control what upgrades are purchased.<br>Equipment upgrades (prestiges) are controlled by settings in the <b>Equipment</b> tab</p>`;
				description += "<p><b>Buy Upgrades: Off</b><br>Disables this setting.</p>";
				description += "<p><b>Buy Upgrades: On</b><br>Purchases upgrades depending on what the script deems necessary. Certain upgrades such as speedbooks can take priority and delay other upgrades from being purchased.</p>";
				description += "<p><b>Buy Upgrades: No Coords</b><br>Works the same as <b>Buy Upgrades: On</b> but stops <b>Coordination</b> upgrades from being purchased.</p>";
				description += "<p><b>Recommended:</b> Buy Upgrades: On</p>";

				if (atConfig.settingUniverse === 1) {
					description += "<p>When running the <b>Scientist</b> challenge the following upgrades will be purchased: ";
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
				let description = "<p>Automatically builds and traps for Trimps when needed.</p>";
				description += "<p>The <b>Auto Gather</b> setting must <b>not</b> be set to <b>Off</b> for this to work.</p>";
				description += "<p><b>Recommended:</b> On whilst highest zone is below 30.</p>";
				return description;

			}, 'boolean', true, null, 'Core', [1, 2]);

		createSetting('downloadSaves',
			function () { return ('Download Saves') },
			function () { return ('Will automatically download a copy of your save when you portal.') },
			'boolean', false, null, 'Core', [1, 2]);

		createSetting('autoGoldenSettings',
			function () { return ('Golden Upgrade Settings') },
			function () {
				let description = "<p>Here you can select the golden upgrades you would like to purchase during your runs.</p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				return description;
			}, 'mazArray', [], 'importExportTooltip("mapSettings", "Auto Golden")', 'Core', [1, 2],
			function () { return (getAchievementStrengthLevel() > 0) });

		createSetting('portalRespec',
			function () { 
				let portalOptions = ['Portal: Refresh Respec Off', 'Portal: Refresh Respec On'];
				if (game.permaBoneBonuses.voidMaps.owned >= 5) portalOptions.push('Portal: Void Map Liquification');
				return portalOptions;
			},
			function () {
				let description = "<p>When Auto Portaling this will use liquification to obtain a free respec before starting your next run.<p>";
				description += "<p><b>Portal: Refresh Respec Off</b><br>Disables this setting.</p>";
				description += "<p><b>Portal: Refresh Respec On</b><br>When your free respec in a run has been used this will delay portaling into your Auto Portal challenge, instead making use of liquification to reach the portal unlock and portaling into your normal run from there.</p>";

				if (game.permaBoneBonuses.voidMaps.owned >= 5) {
					description += "<p><b>Portal: Void Map Liquification</b><br>Works the same as <b>Portal: Refresh Respec On</b> but in addition to portaling for a respec, it will repeatedly portal until your bone void map counter is 1 drop away from a guaranteed extra void map.";
					description += "<br>If you have not reached the void map counter target by either zone 99 or the end of your liquification zones then it will portal and repeat this process until you have.</p>";
				}
				
				description += "<p><b>Recommended:</b> Portal: Refresh Respec On </p>";
				if (atConfig.settingUniverse > 1) {
					description +="<p><i>This will swap to universe 1 and put you back in the universe you originally portaled from.</i></p>";
				}
				return description;
			}, 'multitoggle', false, null, 'Core', [1, 2],
			function () { return (checkLiqZoneCount(1) >= 20) });
		
		createSetting('pauseScript',
			function () { return ('Pause AutoTrimps') },
			function () {
				let description = "<p>Pauses the AutoTrimps script.</p>";
				description += "<p><b>Graphs will continue tracking data while paused.</b></p>";
				return description;
			}, 'boolean', null, null, 'Core', [0]);

		let $pauseScript = document.getElementById('pauseScript');
		$pauseScript.parentNode.style.setProperty('position', 'fixed');
		$pauseScript.parentNode.style.setProperty('right', '1vw');
		$pauseScript.parentNode.style.setProperty('margin-left', '0');

		createSetting('autoHeirlooms',
			function () { return ('Auto Allocate Heirlooms') },
			function () {
				let description = "<p>Uses the <b>Heirloom</b> calculator to identify optimal nullifium distribution for your equipped and carried heirlooms when portaling.</p>";
				description += "<p>There are inputs you can alter in the <b>Heirlooms</b> window to adjust how it distributes nullifium.</p>";
				description += "<p>Will <b>only</b> allocate nullifium on heirlooms that you have bought an upgrade or swapped modifiers on.</p>";
				description += "<p><b>Recommended:</b> On</p>";
			return description;
			}, 'boolean', false, null, 'Core', [1, 2],
			function () { return (game.global.totalPortals > 0) });

		createSetting('autoPerks',
			function () { return ('Auto Allocate Perks') },
			function () {
				const calcName = atConfig.settingUniverse === 2 ? "Surky" : "Perky";
				let description = "<p>Uses the <b>" + calcName + "</b> calculator to identify optimal perk distribution when Auto Portaling.</p>";
				description += "<p>There are inputs you can alter in the <b>Portal</b> or <b>View Perks</b> windows to adjust how it distributes perks.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [1, 2]);

		createSetting('presetSwap',
			function () { return ('Perk Preset Swapping') },
			function () {
				const calcName = atConfig.settingUniverse === 2 ? 'Surky' : 'Perky';
				const fillerPreset = atConfig.settingUniverse === 2 ? 'Easy Radon Challenge' : 'most appropriate zone progression';
				const dailyPreset = atConfig.settingUniverse === 2 ? 'Difficult Radon Challenge' : 'most appropriate zone progression';
				const c2Preset = atConfig.settingUniverse === 2 ? 'Push/C3/Mayhem' : 'Other c²';

				const universeChallenges = [];
				if (atConfig.settingUniverse === 1){
					const hze = game.stats.highestLevel.valueTotal();
					universeChallenges.push('Metal');
					if (hze >= 60) universeChallenges.push('Trimp');
					if (hze >= 120) universeChallenges.push('Coordinate');
					if (hze >= 600) universeChallenges.push('Experience');
				}
				if (atConfig.settingUniverse === 2) {
					const hze = game.stats.highestRadLevel.valueTotal();
					universeChallenges.push('Downsize');
					if (hze >= 45) universeChallenges.push('Duel');
					if (hze >= 115) universeChallenges.push('Berserk');
					if (hze >= 155) universeChallenges.push('Alchemy');
					if (hze >= 200) universeChallenges.push('Smithless');
				}

				let description = `<p>Will automatically swap <b>${calcName}</b> presets when Auto Portaling into runs.</p>`;
				description += `<p>Fillers (${_getPrimaryResourceInfo().name.toLowerCase()} challenges) will load the <b>${fillerPreset}</b> preset.</p>`;
				description += `<p>Daily challenges will load the <b>${dailyPreset}</b> preset.</p>`;
				description += `${_getSpecialChallengeDescription(true, false)} will load the <b>${c2Preset}</b> preset.</p>`;
				description += `Challenges that have a dedicated preset (<b>${universeChallenges.join(', ')}</b>) will load their preset when starting that challenge.</p>`;
				description += `<p><b>Recommended:</b> On</p>`;
				return description;
			}, 'boolean', false, null, 'Core', [1, 2],
			function () { return (getPageSetting('autoPerks', atConfig.settingUniverse)) });

		createSetting('presetCombatRespec',
			function () {
				const trimple = atConfig.settingUniverse === 1 ? "Trimple" : "Atlantrimp";
				return ([`${trimple} Respec: Off`, `${trimple} Respec: Popup`, `${trimple} Respec: Force`])
			},
			function () {
				const calcName = atConfig.settingUniverse === 2 ? "Surky" : "Perky";
				const trimple = atConfig.settingUniverse === 1 ? "<b>Trimple Of Doom</b>" : "<b>Atlantrimp</b>";
				const trimpleShortened = atConfig.settingUniverse === 1 ? "Trimple" : "Atlantrimp";

				let respecName = !trimpStats.isC3 ? "Radon " : "" + "Combat Respec";
				if (atConfig.settingUniverse === 1) respecName = 'Spire';

				let description = '';
				if (atConfig.settingUniverse === 1) {
					description += "<p>Will only run during the highest Spire you have reached and will respec into the Perky <b>Spire</b> preset to maximise your combat stats during it.</p>";
				}
				if (atConfig.settingUniverse === 2) {
					description += `<p>Will respec into the <b>${respecName}</b> preset when running ${_getSpecialChallengeDescription()} <b>OR</b> you have more golden battle than golden radon upgrades. Otherwise it will assume it's a radon run and respec into the <b>Radon Combat Respec</b> preset.</p>`;
				}

				description += `<p><b>${trimpleShortened} Respec: Off</b><br>Disables this setting.</p>`;
				description += `<p><b>${trimpleShortened} Respec: Popup</b><br>Will display a popup after completing ${trimple} asking whether you would like to respec into the preset listed above.</p>`;
				description += `<p><b>${trimpleShortened} Respec: Force</b><br>4 seconds after completing ${trimple} the script will respec you into the <b>${calcName}</b> preset listed above to maximise combat stats. This has a popup that allows you to disable the respec.</p>`;
				description += `<p>I'd recommend only using this with both the <b>Auto Allocate Perks</b> and <b>Void Map Liquification</b> settings enabled. Without these you will go into your next run in a suboptimal perk setup.</p>`;
				
				if (atConfig.settingUniverse === 1) {
					description += `<p>Has an additional setting (<b>Spire Respec Cell</b>) which has a <b>5</b> second delay after toggling this setting before it will function.</p>`;
				}
				
				description += `<p><b>Recommended:</b> ${trimpleShortened} Respec: Off</p>`;
				return description;
			},
			'multitoggle', [0], null, 'Core', [1, 2],
			function () { return (game.stats.highestLevel.valueTotal() >= 170 || atConfig.settingUniverse === 2) });

		createSetting('presetCombatRespecCell',
			function () { return ('Spire Respec Cell') },
			function () {
				const trimple = atConfig.settingUniverse === 1 ? "<b>Trimple Of Doom</b>" : "<b>Atlantrimp</b>";
				const trimpleShortened = atConfig.settingUniverse === 1 ? "Trimple" : "Atlantrimp";
				let description = "<p>An override for the " + trimple + " requirement for the <b>" + trimpleShortened + " Respec</b> setting. Will either give you a popup or automatically respec depending on your <b>" + trimpleShortened + " Respec</b> setting when you reach this cell and don't have any mapping to do on it.</p>";
				description += "<p>Will only function on your <b>highest Spire reached.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this way to Spire respec.</p>";
				description += "<p><b>Recommended:</b> cell after your farming has finished.</p>";
				return description;
			}, 'value', -1, null, 'Core', [1],
			function () { return (getPageSetting('presetCombatRespec', atConfig.settingUniverse) > 0 && game.stats.highestLevel.valueTotal() >= 170) });

		createSetting('presetSwapMutators',
			function () { return ('Preset Swap Mutators') },
			function () {
				let mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));
				if (!mutatorObj || !mutatorObj.titles) mutatorObj = _mutatorDefaultObj()
				const titles = mutatorObj.titles;

				let description = "<p>Will automatically load the preset that corresponds to your run type when portaling.</p>";
				description += `<p>Preset 1${titles[0] !== 'Preset 1' ? " (" + titles[0] + ")" : ''} will be loaded when portaling into <b>Filler</b> (${_getPrimaryResourceInfo().name.toLowerCase()}) challenges.</p>`;
				description += `<p>Preset 2${titles[1] !== 'Preset 2' ? " (" + titles[1] + ")" : ''} will be loaded when portaling into <b>Daily</b> challenges.</p>`;
				description += `<p>Preset 3${titles[2] !== 'Preset 3' ? " (" + titles[2] + ")" : ''} will be loaded when portaling into <b>${_getSpecialChallengeDescription()}</b>.</p>`;
				description += `<p>Preset 4${titles[3] !== 'Preset 4' ? " (" + titles[3] + ")" : ''} will be loaded when portaling into <b>Wither</b> if the <b>W: Mutator Preset</b> setting is enabled.</p>`;
				description += `<p>Preset 5${titles[4] !== 'Preset 5' ? " (" + titles[4] + ")" : ''} will be loaded when portaling into <b>Desolation</b> if the <b>D: Mutator Preset</b> setting is enabled.</p>`;
				description += `<p>Preset 6${titles[5] && titles[5] !== 'Preset 6' ? " (" + titles[5] + ")" : ''} will be loaded when portaling into <b>Daily</b> challenges that have the <b>Plagued</b> modifier if the <b>D: Plagued Mutator Preset</b> setting is enabled.</p>`;
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 201) });

		createSetting('universeSetting',
			function () {
				let portalOptions = ['Universe Settings: 1'];
				if (Fluffy.checkU2Allowed()) portalOptions.push('Universe Settings: 2');
				return portalOptions;
			},
			function () { return ('Switch between settings for universes you have unlocked.') },
			'multitoggle', 0, null, 'Core', [0]);

		let $universeSetting = document.getElementById('universeSetting');
		$universeSetting.parentNode.style.setProperty('position', 'fixed');
		$universeSetting.parentNode.style.setProperty('right', '1vw');
		$universeSetting.parentNode.style.setProperty('margin-left', '0');

		createSetting('autoPortal',
			function () { return ('Auto Portal') },
			function () {
				const resourceName = _getPrimaryResourceInfo().name;
				const c2abv = _getChallenge2Info();
				const c2setting = atConfig.settingUniverse === 2 ? "Challenge 3" : "Challenge 2";

				const specialChall = `Max completion challenges ${atConfig.settingUniverse === 1 && 
					game.stats.highestLevel.valueTotal() >= 600 ? '(and Experience)' : ''} can be run with this but they will ignore the ${c2abv} portal settings and use the <b>Portal Zone</b> input for when to finish the run and portal.`;
				const u2recommendation = `Custom with a specified endzone to make use of Scruffy's level 3 ability`;
				const u1recommendation = `${resourceName} Challenges until you reach zone 230 then ${resourceName} Per Hour`;

				let description = `<p>Will automatically portal into different challenges depending on the way you setup the Auto Portal related settings.</p>`;
				description += `<p>Additional settings appear when any of the inputs are selected.</p>`;
				description += `<p><b>Off</b><br>Disables this setting.</p>`;
				description += `<p><b>${resourceName} Per Hour</b><br>Portals into new runs when your ${resourceName.toLowerCase()} per hour goes below your current runs best ${resourceName.toLowerCase()} per hour.</p>`;
				description += `<p>There is a <b>Buffer</b> setting, which lowers the check from best ${resourceName.toLowerCase()} per hour to (best - buffer setting) ${resourceName.toLowerCase()} per hour.</p>`;
				description += `<p><b>${resourceName} Challenges</b><br>When a challenge has been selected it will automatically portal into it when you don't have a challenge active.</p>`;
				description += `<p><b>Custom</b>/<b>One Off Challenges</b><br>Will portal into the challenge selected in the <b>Challenge</b> setting at the zone specified in the <b>Portal Zone</b> setting.</p>`;
				if (game.stats.highestLevel.valueTotal() >= 65) {
					description += `<p><b>${c2setting}</b><br>Will portal into the challenge selected in the <b>${c2abv}</b> setting. If <b>${c2abv} Runner</b> is enabled it will use <b>${c2abv} Runner Portal</b> for your portal zone otherwise will use the zone specified in the <b>Finish ${c2abv}</b> setting in the ${c2abv} settings tab.</p>`
				}
				description += `<p>${specialChall}</p>`;
				description += `<p><b>Recommended:</b> ${(atConfig.settingUniverse === 2 ? u2recommendation : u1recommendation)}</p>`;
				return description;
			}, 'dropdown', 'Off', function () { return autoPortalChallenges('autoPortal') }, 'Core', [1, 2]);

		createSetting('heliumChallenge',
			function () { return ('Challenge') },
			function () {
				let description = "<p>Automatically portal into this challenge when no challenge is active and you are using the <b>" + _getPrimaryResourceInfo().name + " Challenges</b> Auto Portal setting.</p>";
				description += "<p><b>" + _getPrimaryResourceInfo().name + " challenges</b> will appear here when they've been unlocked in the game.</p>";
				description += "<p>If this setting is set to <b>None</b> the script won't Auto Portal at all.</b></p>";
				description += "<p><b>Recommended:</b> Last challenge available</p>";
				return description;
			}, 'dropdown', 'None', function () { return autoPortalChallenges('helium') }, 'Core', [1, 2],
			function () {
				const resourceName = _getPrimaryResourceInfo().name;
				const namesToCheck = [`${resourceName} Challenges`];
				return (
					namesToCheck.indexOf(getPageSetting('autoPortal', atConfig.settingUniverse)) !== -1);
			});
		
		createSetting('heliumHourChallenge',
			function () { return ('Challenge') },
			function () {
				let description = "<p>Automatically portal into this challenge when using the <b>" + _getPrimaryResourceInfo().name + " Per Hour</b> or <b>Custom</b> Auto Portal settings.</p>";
				description += "<p>" + _getPrimaryResourceInfo().name + " challenges will appear here when they've been unlocked in the game.</p>";
				description += "<p><b>Recommended:</b> Last challenge available</p>";
				return description;
			}, 'dropdown', 'None', function () { return autoPortalChallenges('heHr') }, 'Core', [1, 2],
			function () {
				const namesToCheck = ['Helium Per Hour', 'Radon Per Hour', 'Custom'];
				return (
					namesToCheck.indexOf(getPageSetting('autoPortal', atConfig.settingUniverse)) !== -1);
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
					namesToCheck.indexOf(getPageSetting('autoPortal', atConfig.settingUniverse)) !== -1);
			});

		createSetting('heliumC2Challenge',
			function () { return (_getChallenge2Info()) },
			function () {
				const specialChall = `Max completion challenges ${atConfig.settingUniverse === 1 && 
				game.stats.highestLevel.valueTotal() >= 600 ? '(and Experience)' : ''} can be run with this but they will ignore the " + _getChallenge2Info() + " portal settings and use the <b>Portal Zone</b> input for when to finish the run and portal.`;
				let description = "<p>Automatically portal into this C" + _getChallenge2Info()[1] + " when using the <b>Challenge " + _getChallenge2Info()[1] + "</b> Auto Portal setting.</p>";
				description += "<p>C" + _getChallenge2Info()[1] + " challenges will appear here when they've been unlocked in the game.</p>";
				description += "<p>When running a " + _getChallenge2Info() + ", <b>" + _getChallenge2Info() + " Runner Portal</b> will be used for your portal zone if <b>" + _getChallenge2Info() + " Runner</b> is enabled otherwise it will use the <b>Finish " + _getChallenge2Info() + "</b> setting. These can be found in the <b>" + _getChallenge2Info() + "</b> settings tab.</p>"
				description += "<p>" + specialChall + "</p>";
				return description;
			}, 'dropdown', 'None', function () { return autoPortalChallenges('c2') }, 'Core', [1, 2],
			function () {
				const namesToCheck = ['Helium Per Hour', 'Radon Per Hour', 'Custom'];
				return (
					getPageSetting('autoPortal', atConfig.settingUniverse) === 'Challenge 2' || getPageSetting('autoPortal', atConfig.settingUniverse) === 'Challenge 3' || (namesToCheck.indexOf(getPageSetting('autoPortal', atConfig.settingUniverse)) !== -1 && getPageSetting('heliumHourChallenge', atConfig.settingUniverse).includes('Challenge')))
			});
			
		createSetting('autoPortalZone',
			function () { return ('Portal Zone') },
			function () {
				let description = "<p>Will automatically portal once this zone is reached when using the <b>Custom OR One Off Challenges</b> Auto Portal settings.</p>";
				description += "<p>If this is set above your highest zone reached then it will allow you to pick not yet unlocked challenges up to this zone.</p>";
				description += "<p><b>Recommended:</b> The zone you would like your run to end</p>";
				return description;
			}, 'value', 999, null, 'Core', [1, 2],
			function () {
				const namesToCheck = ['Challenge 2', 'Challenge 3', 'Custom', 'One Off Challenges'];
				return (
					namesToCheck.indexOf(getPageSetting('autoPortal', atConfig.settingUniverse)) !== -1);
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
					getPageSetting('autoPortal', atConfig.settingUniverse).includes('Hour'))
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
				return (getPageSetting('autoPortal', atConfig.settingUniverse).includes('Hour'))
			});

		createSetting('heliumHrPortal',
			function () {
				let hze =game.stats.highestLevel.valueTotal();
				let portalOptions =['Portal: Immediately', 'Portal: After Voids'];
				if (atConfig.settingUniverse === 1 && hze >= 230) portalOptions.push('Portal: After Poison Voids');
				return portalOptions;
			},
			function () {
				let description = "<p>How you would like to portal when below your " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour threshold.</p>";
				description += "<p><b>Portal: Immediately</b><br>Will auto portal straight away.</p>";
				description += "<p><b>Portal: After Voids</b><br>Will run any remaining void maps then proceed to portal.</p>";
				if (atConfig.settingUniverse === 1 ) {
					if (game.stats.highestLevel.valueTotal() >= 230) description += "<p><b>Portal: After Poison Voids</b><br>Will continue your run until you reach the next poison zone and run void maps there.</p>";
					description += "<p>When farming for, or running Void Maps due to this setting it will buy as many nurseries as you can afford based upon your spending percentage in the scripts Auto Structure settings.</p>";
				}
				description += "<p><b>Recommended:</b> Portal: After Voids</p>";
				return description;
			}, 'multitoggle', 0, null, 'Core', [1, 2],
			function () {
				return (getPageSetting('autoPortal', atConfig.settingUniverse).includes('Hour'))
			});

		createSetting('heliumHrExitSpire',
			function () { return ('Exit Spires for Voids') },
			function () {
				let description = "<p>Will automatically exit Spires to run your voids earlier when the <b>" + _getPrimaryResourceInfo().name + " Per Hour</b> Auto Portal setting is wanting to portal.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [1, 2],
			function () { return (getPageSetting('autoPortal', atConfig.settingUniverse).includes('Hour') && (atConfig.settingUniverse === 1 ? game.stats.highestLevel.valueTotal() >= 170 : game.stats.highestRadLevel.valueTotal() >= 270)) });

		createSetting('autoPortalTimeout',
			function () { return ('Auto Portal Timeout') },
			function () {
				let description = "<p>When enabled this will add a 5 second delay to <b>Auto Portal</b> being run when you change any <b>Auto Portal</b> related settings.</p>";
				return description;
			}, 'boolean', false, null, 'Core', [1, 2]);

		createSetting('autoPortalUniverseSwap',
			function () { return ('Swap To Next Universe') },
			function () {
				let description = "<p>Will automatically swap to the next available universe when auto portaling.</p>";
				description += "<p>You <b>must</b> have Auto Portal setup in both the current <b>and</b> following universe or Auto Portal will contiunue to portal into your current universe.</p>";
				description += "<p><b>If enabled in all available universes it will portal into Universe 1</b>.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Core', [1, 2],
			function () { return (Fluffy.checkU2Allowed()) });

		createSetting('autoPortalForce',
			function () { return ('Force Auto Portal') },
			function () {
				let description = "<p>Will force activate Auto Portal when pressed.</p>";
				description += "<p>There's a confirmation window to ensure accidental presses don't ruin your run!</p>";
				return description;
			}, 'infoclick', false,  'cancelTooltip(); importExportTooltip("forceAutoPortal");', 'Core', [0],
			function () { return (game.global.totalPortals > 0) });

		let $autoPortalForce = document.getElementById('autoPortalForce');
		$autoPortalForce.parentNode.style.setProperty('position', 'fixed');
		$autoPortalForce.parentNode.style.setProperty('right', '1vw');
		$autoPortalForce.parentNode.style.setProperty('margin-left', '0');

		createSetting('autoEggs',
			function () { return ('Auto Eggs') },
			function () {
				let description = "<p>Clicks easter eggs when they are active in the world.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Core', [0],
			function () { return (!game.worldUnlocks.easterEgg.locked) });

		let $eggSettings = document.getElementById('autoEggs');
		$eggSettings.parentNode.style.setProperty('float', 'right');
		$eggSettings.parentNode.style.setProperty('margin-right', '15.3vw');
		$eggSettings.parentNode.style.setProperty('margin-left', '0');
	}
	
	const displayJobs = true;
	if (displayJobs) {
		createSetting('jobType',
			function () { return (["AT Auto Jobs: Off", 'AT Auto Jobs: On', 'AT Auto Jobs: Manual']) },
			function () {
				let description = "<p>Click the left side of the button to toggle between the AutoJobs settings. Each of them will adjust the 3 primary resource jobs but you'll have to manually set the rest by clicking the cogwheel on the right side of this button.</p>";
				description += "<p><b>AT Auto Jobs: Off</b><br>Will disable the script from purchasing any jobs.</p>";
				description += "<p><b>AT Auto Jobs: On</b><br>Automatically adjusts the 3 primary resource job worker ratios based on current game progress. For more detailed information on the ratios that this uses and when it switches, check out the Help section by clicking on the cogwheel and looking at the Auto Ratios portion of text.</p>";
				description += "<p><b>AT Auto Jobs: Manual</b><br>Buys jobs for your trimps according to the ratios set in the cogwheel popup.</p>";
				description += "<p>Automatically swaps the games default hiring setting <b>Not Firing For Jobs</b> to <b>Firing For Jobs</b>.</p>";
				description += "<p>Map setting job ratios always override both <b>AT Auto Jobs: On</b> & <b>AT Auto Jobs: Manual</b> when Auto Maps is enabled.</p>";
				description += "<p><br><i>Set to <b>AT Auto Jobs: Off</b> by holding <b>control</b> and clicking.</i></p>";
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

		createSetting('geneAssistSettings',
			function () { return ('Gene Assist Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like the script to hire Geneticists.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Gene Assist")', 'Beta', [1, 2]);

		createSetting('geneAssistPercent',
			function () { return ('GA: Gene Assist %') },
			function () {
				let description = "<p>Gene Assist will only hire geneticists if they cost less than this value.</p>";
				description += "<p>If this setting is 1 it will only buy geneticists if they cost less than 1% of your food.</p>";
				description += "<p>Setting this to <b>0 or below</b> will disable all of the <b>Gene Assist</b> settings.</p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', 1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistTimer',
			function () { return ('GA: Timer') },
			function () {
				let description = "<p>This is the default time your gene assist settings will use.</p>";
				description += "<p>Setting this to <b>0 or below</b> will disable all of the <b>Gene Assist</b> settings.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistTimerHard',
			function () { return ('GA: Hard Chall Timer') },
			function () {
				let description = "<p>Gene Assist will use the value set here when running challenges that are considered hard (Nom, Toxicity, Lead). </p>";
				description += "<p>Set to <b>0 or below</b> will disable this setting.</p>";
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
				description += "<p>Set to <b>0 or below</b> will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> 6</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistTimerElectricity',
			function () { return ('GA: Electricity Timer') },
			function () {
				let description = "<p>Gene Assist will use the value set here when running the Electricity challenge. </p>";
				description += "<p>Set to <b>0 or below</b> will disable this setting.</p>";
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
				description += "<p>Set to <b>0 or below</b> will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistZoneBefore',
			function () { return ('GA: Before Z') },
			function () {
				let description = "<p>Gene Assist will use the value set in <b>GA: Before Z Timer</b> when below this zone.</p>";
				description += "<p>Set to <b>0 or below</b> will disable this setting.</p>";
				description += "<p><b>Recommended:</b> The zone where you stop 1 shotting in a new portal</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistTimerBefore',
			function () { return ('GA: Before Z Timer') },
			function () {
				let description = "<p>Gene Assist will use the value set here when below the zone in <b>GA: Before Z Timer</b>.</p>";
				description += "<p>Set to <b>0 or below</b> will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistZoneAfter',
			function () { return ('GA: After Z') },
			function () {
				let description = "<p>Gene Assist will use the value set in <b>GA: After Z Timer</b> when after this zone.</p>";
				description += "<p>Set to <b>0 or below</b> will disable this setting.</p>";
				description += "<p><b>Recommended:</b> The zone where you stop 1 shotting after using your <b>GA: Timer</b> setting in a new portal</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistTimerAfter',
			function () { return ('GA: After Z Timer') },
			function () {
				let description = "<p>Gene Assist will use the value set here when below the zone in <b>GA: After Z Timer</b>.</p>";
				description += "<p>Set to <b>0 or below</b> will disable this setting.</p>";
				description += "<p><b>Recommended:</b> Your <b>Anticipation</b> perk timer</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistTimerDaily',
			function () { return ('GA: Daily Timer') },
			function () {
				let description = "<p>Gene Assist will use the value set here when running dailies. </p>";
				description += "<p>Set to <b>0 or below</b> will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistTimerDailyHard',
			function () { return ('GA: Daily Timer Hard') },
			function () {
				let description = "<p>Gene Assist will use the value set here when running dailies that are considered hard (Plagued, Bogged). </p>";
				description += "<p>Set to <b>0 or below</b> will disable this setting.</p>";
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
				description += "<p>Set to <b>0 or below</b> will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> Your <b>Anticipation</b> perk timer</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistTimerC2',
			function () { return ('GA: ' + _getChallenge2Info() + ' Timer') },
			function () {
				let description = "<p>Gene Assist will use the value set here when running " + _getChallenge2Info() + "s.</p>";
				description += "<p>Set to <b>0 or below</b> will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> Use regular Gene Assist settings instead of this</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });

		createSetting('geneAssistTimerSpireC2',
			function () { return ('GA: ' + _getChallenge2Info() + ' Spire Timer') },
			function () {
				let description = "<p>Gene Assist will use the value set here when inside of active Spires in " + _getChallenge2Info() + "s.</p>";
				description += "<p>Set to <b>0 or below</b> will disable this setting.</p>";
				description += "<p>Overwrites <b>GA: Timer</b>, <b>GA: Before Z</b> and <b>GA: After Z</b> settings.</p>";
				description += "<p><b>Recommended:</b> Your <b>Anticipation</b> perk timer</p>";
				return description;
			}, 'value', -1, null, 'Jobs', [1],
			function () { return (autoTrimpSettings.geneAssist.enabled) });
	}

	const displayBuildings = true;
	if (displayBuildings) {
		createSetting('buildingsType',
			function () { return ('Auto Structure') },
			function () {
				let description = "Click the left side of the button to toggle this on or off.</p>";
				description += "<p>Click the cog icon on the right side of this button to tell your Foremen what you want and when you want it.</p>";
				description += "For more detailed information for this setting check out its Help section.</p>";
				return description;
			}, 'boolean', 'true', null, 'Buildings', [1, 2],
			function () { return (false) });

		createSetting('buildingSettingsArray',
			function () { return ('Building Settings') },
			function () { return ('Click to adjust <b>Auto Structure</b> settings.') },
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
			}, 'importExportTooltip("AutoStructure")', 'Buildings', [1, 2],
			function () { return false });

		createSetting('warpstation',
			function () { return ('Warpstations') },
			function () {
				let description = "<p>Enable this to allow Warpstation purchasing.</p>";
				description += "<p><b>Will only function with AT Auto Structure enabled.</b></p>";
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
				let description = "<p>The amount of Warpstations to purchase before your first Gigastation.</p>";
				description += "<p><b>You must have the scripts upgrade setting enabled for Gigastations to be purchased!</b></p>";
				description += "<p><b>Recommended:</b> 20</p>";
				return description;
			}, 'value', 20, null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled) });

		createSetting('deltaGigastation',
			function () { return ('Delta Gigastation') },
			function () {
				let description = "<p>How many extra Warpstations to buy for each Gigastation.</p>";
				description += "<p>Supports decimal values. For example 2.5 will buy +2/+3/+2/+3...</p>";
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			}, 'value', 2, null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled) }
		);

		createSetting('autoGigas',
			function () { return ('Auto Gigastations') },
			function () {
				let description = "<p>If enabled, the script will only buy your first Gigastation if:<br>";
				description += "a) You have purchased at least 2 Warpstations &<br>";
				description += "b) Can't afford more Coords (or are in a Spire) & <br>";
				description += "c) (only if <b>Custom Delta Factor</b> is above 20) Lacking health or damage & <br>";
				description += "d) (only if <b>Custom Delta Factor</b> is above 20) Has run at least 1 map stack.</p>";
				description += "<p>Then, it'll calculate your ideal <b>First & Delta Gigastation</b> values and set them based on your <b>Custom Target Zone</b>, <b>Custom Delta Factor</b>, and your current runs portal zone.</p>";
				description += "<p>Once your first Gigastation of a run has been purchased your Gigastation settings won't be adjusted again until your next run.</p>";
				description += "<p><b>You must have the scripts upgrades setting enabled for this setting to run!</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', 'true', null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled) });

		createSetting('autoGigaTargetZone',
			function () { return ('Custom Target Zone') },
			function () {
				let description = "<p>The zone you would like to target when Auto Gigastations calculates your <b>First & Delta Gigastation</b> values.</p>";
				description += "<p>Values below 60 will be discarded.</p>";
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
				description += "<p><b>Recommended:</b> 1-2 for very quick runs. 5-10 for regular runs where you slow down at the end. 20-100+ for very pushy runs</p>";
				return description;
			}, 'value', -1, null, 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled && autoTrimpSettings.autoGigas.enabled) });

		createSetting('autoGigaForceUpdate',
			function () { return ('Update Auto Gigastations') },
			function () {
				let description = "<p>Run Auto Gigastations and update your <b>First Gigastation</b> and <b>Delta Gigastation</b> settings without needing to portal.</p>";
				description += "<p>Will only run if you have <b>two or more</b> Warpstations.</p>";
				return description;
			}, 'action', null, 'firstGiga()', 'Buildings', [1],
			function () { return (autoTrimpSettings.warpstation.enabled && autoTrimpSettings.autoGigas.enabled) });
			
		createSetting('advancedNurseries',
			function () { return ('Advanced Nurseries') },
			function () {
				let description = "<p>Will only buy nurseries if you need more health and you have already <b>Hits Survived</b> farmed on your current zone <b>OR</b> have equal to or more map bonus stacks than the <b>Map Bonus Health</b> setting.</p>"
				description += "<p>The amount of nurseries that this setting can purchase doesn't have a cap so if necessary it will purchase all available nurseries.</p>"
				description += "<p>Requires nurseries to be enabled in the <b>AT Auto Structure</b> setting.</p>"
				description += "<p>When enabled, this setting will only buy nurseries if at or past the <b>From Z</b> input. It allows setting the <b>Up To</b> input to 0 without buying as many nurseries as possible, but it doesn't stop <b>AT Auto Structure</b> from also purchasing nurseries.</p>"
				description += "<p><b>Recommended:</b> On. Nurseries enabled and set to <b>Up To: 0</b> and <b>From: 230</b></p>";
				return description;
			}, 'boolean', true, null, 'Buildings', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 230) });

		createSetting('advancedNurseriesMapCap',
			function () { return ('AN: Hits Survived Maps') },
			function () {
				let description = "<p>The amount of <b>Hits Survived</b> maps to complete before starting to buy nurseries.</p>"
				description += "<p>If your <b>Hits Survived</b> map cap value is lower than this settings input it will use that value instead.</p>";
				description += "<p>This setting is useful to ensure you don't farm for an excessive amount of time to reach your <b>Hits Survived</b> target.</p>";
				description += "<p><b>Recommended:</b> 3</p>";
				return description;
			}, 'value', -1, null, 'Buildings', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 230 && autoTrimpSettings.advancedNurseries.enabled) });		
		
			createSetting('advancedNurseriesAmount',
			function () { return ('AN: Amount') },
			function () {
				let description = "<p>The amount of Nurseries that the script will attempt to purchase everytime you need additional health from <b>Advanced Nurseries</b>.</p>"
				description += "<p><b>Recommended:</b> 2</p>";
				return description;
			}, 'value', 2, null, 'Buildings', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 230 && autoTrimpSettings.advancedNurseries.enabled) });

		createSetting('advancedNurseriesIce',
			function () { return (['AN: Buy In Ice', "AN: Disable In Ice", 'AN: Disable In Ice (Spire)']) },
			function () {
				let description = "<p>How you would like Nursery purchasing to be handled during Ice empowerment zones.</p>";
				description += "<p><b>AN: Buy In Ice</b><br>Will purchase Nurseries regardless of if you're in an Ice empowerment zone.</p>";
				description += "<p><b>AN: Disable In Ice</b><br>Will stop <b>Advanced Nurseries</b> from purchasing nurseries during Ice empowerment zones.</p>";
				description += "<p><b>AN: Disable In Ice (Spire)</b><br>Works the same as <b>AN: Disable In Ice</b> except this setting will still purchase nurseries when inside of Spires.</p>";
				description += "<p><b>Recommended:</b> AN: Buy In Ice</p>";
				return description;
			}, 'multitoggle', 0, null, 'Buildings', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 236 && autoTrimpSettings.advancedNurseries.enabled) });
	}

	const displayEquipment = true;
	if (displayEquipment) {
		createSetting('equipOn',
			function () { return ('Auto Equip') },
			function () {
				let description = "<p>Master switch for whether the script will purchase equipment levels or prestiges.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Equipment', [1, 2]);

		createSetting('equipCutOffHD',
			function () { return ('AE: HD Cut-off') },
			function () {
				let description = "<p>If your HD (enemyHealth/trimpDamage) ratio is above this value it will override your <b>AE: Percent</b> input when looking at " + (atConfig.settingUniverse !== 2 ? "weapon" : "equipment") + " purchases and set your spending percentage to 100% of resources available.</p>";
				description += "<p>Goal with this setting is to have it purchase equipment when you slow down in world.<br></p>";
				description += "<p>Your HD ratio can be seen in either the <b>Auto Maps Status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting and only override your <b>AE: Percent</b> input when running <b>HD Farm</b>.</p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', 1, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', atConfig.settingUniverse)) });

		createSetting('equipCutOffHS',
			function () { return ('AE: HS Cut-off') },
			function () {
				let description = "<p>If your Hits Survived (trimpHealth/enemyDamage) ratio is below this value it will override your <b>AE: Percent</b> input when looking at armor purchases and set your spending percentage to 100% of resources available.</p>";
				description += "<p>Goal with this setting is to have it purchase equipment when you slow down in world.<br></p>";
				description += "<p>Your Hits Survived ratio can be seen in either the <b>Auto Maps Status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting and only override your <b>AE: Percent</b> input when <b>Hits Survived</b> farming.</p>";
				description += "<p><b>Recommended:</b> 2.5</p>";
				return description;
			}, 'value', 2.5, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', atConfig.settingUniverse)) });

		createSetting('equipCapAttack',
			function () { return ('AE: Weapon Cap') },
			function () {
				let description = "<p>The value you want weapon equipment to stop being purchased at.</p>";
				description += "<p>Equipment levels are capped at <b>9</b> when a prestige is available for that equip to ensure the script doesn't unnecessarily spend resources on them when prestiges would be more efficient.</p>";
				description += `<p>If your <b>HD Ratio</b> is above your <b>AE: HD Cut-off</b> setting this cap is ignored and you will purchase as many attack equips as it takes to reach your target.</p>`;
				description += "<p><b>Recommended:</b> 20</p>";
				return description;
			}, 'value', 20, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', atConfig.settingUniverse)) });

		createSetting('equipCapHealth',
			function () { return ('AE: Armour Cap') },
			function () {
				let description = "<p>The value you want armor equipment to stop being purchased at.</p>";
				description += "<p>Equipment levels are capped at <b>9</b> when a prestige is available for that equip to ensure the script doesn't unnecessarily spend resources on them when prestiges would be more efficient.</p>";
				description += `<p>When your Hits Survived is below your <b>AE: HS Cut-off</b> setting <b>OR</b> when <b>Hits Survived</b> farming this cap is ignored and you will purchase as many health equips as it takes to reach your target.</p>`;
				if (atConfig.settingUniverse ===2) description += `<p>If your <b>HD Ratio</b> is above your <b>AE: HD Cut-off</b> setting this cap is ignored and the script will purchase as many health equips as it takes to reach your target.</p>`;
				description += "<p><b>Recommended:</b> 20</p>";
				return description;
			}, 'value', 20, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', atConfig.settingUniverse)) });

		createSetting('equipZone',
			function () { return ('AE: Zone') },
			function () {
				let description = "<p>What zone to stop caring about what percentage of resources you're spending and buy as many prestiges and equipment as possible.</p>";
				description += "<p>Can input multiple zones such as <b>200,231,251</b>, doing this will spend all your resources purchasing equipment and prestiges on each zone input.</p>";
				description += "<p>You are able to enter a zone range, this can be done by using a decimal point between number ranges e.g. <b>23.120</b> which will cause the zone check to set your purchasing percentage to 100% between zones 23 and 120. <b>This can be used in conjunction with other zones too, just seperate inputs with commas!</b></p>";
				description += "<p>If inside one of these zones it will override your <b>AE: Percent</b> input and set your spending percentage to 100% of resources available. It will also set your health and attack equipment caps to Infinity.</p>"
				description += "<p><b>Recommended:</b> 999</p>";
				return description;
			}, 'multiValue', [-1], null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', atConfig.settingUniverse)) });

		createSetting('equipPercent',
			function () { return ('AE: Percent') },
			function () {
				let description = "<p>What percent of resources you'd like to spend on equipment.</p>";
				description += "<p>If set to <b>0 or below</b> then your equip spending percentage will be set to 100%.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 10, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', atConfig.settingUniverse)) });

		createSetting('equip2',
			function () { return ('AE: 2') },
			function () {
				let description = "<p>This will make the script always purchase a second level of weapons and armor regardless of efficiency.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', atConfig.settingUniverse)) });

		createSetting('equipPrestige',
			function () { 
				const trimpleShortened = atConfig.settingUniverse === 1 ? "Trimple" : "Atlantrimp";
				return [`AE: Prestige: Maybe`, `AE: Prestige: On`, `AE: Prestige: ${trimpleShortened}`, `AE: Prestige: Always`];
			},
			function () {
				const trimple = atConfig.settingUniverse === 1 ? "<b>Trimple Of Doom</b>" : "<b>Atlantrimp</b>";
				const trimpleShortened = atConfig.settingUniverse === 1 ? "Trimple" : "Atlantrimp";
				let description = `<p>Will control how equipment levels and prestiges are purchased.</p>`;
				description += `<p>Equipment levels are capped at <b>9</b> when a prestige is available for that equip to ensure the script doesn't unnecessarily spend resources on them when prestiges would be more efficient.</p>`;
				description += `<p><b>AE: Prestige: Maybe</b><br>Will only purchase prestiges for equipment when you have 6 or more levels in it.</p>`;
				description += `<p><b>AE: Prestige: On</b><br>Will only purchase prestiges when they are more efficient than leveling the piece of equipment further.</p>`;
				description += `<p><b>AE: Prestige: ${trimpleShortened}</b><br>Overrides the need for levels in your current equips before a prestige will be purchased. Will purchase equipment levels again when you have run ${trimple}.`;
				description += `<br>If <b>${trimple}</b> has been run it will buy any prestiges that cost less than what you have input in the <b>AE: Prestige Pct</b> setting then spend your remaining resources on equipment levels.</p>`;
				description += `<p><b>AE: Prestige: Always</b><br>Always buys weapons and armor prestiges regardless of efficiency when they're available.</p>`;
				description += `<p><b>Recommended:</b> AE: Prestige: ${trimpleShortened}</p>`;
				return description;
			}, 'multitoggle', 2, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', atConfig.settingUniverse)) });

		createSetting('equipPrestigePct',
			function () { return ('AE: Prestige Pct') },
			function () {
				const trimple = atConfig.settingUniverse === 1 ? "<b>Trimple Of Doom</b>" : "<b>Atlantrimp</b>";
				const trimpleShortened = atConfig.settingUniverse === 1 ? "Trimple" : "Atlantrimp";
				let description = `Once you have run <b>${trimple}</b> prestiges will only be purchased if they cost less than this percentage of your metal or wood.</p>`;
				description += `This is only active when <b>AE: Prestige: ${trimpleShortened}</b> is selected.</p>`;

				description += "<p><b>Recommended:</b> 6</p>";
				return description;
			}, 'value', 6, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', atConfig.settingUniverse) && getPageSetting('equipPrestige', atConfig.settingUniverse) === 2) });

		createSetting('equipNoShields',
			function () { return ('AE: No Shields') },
			function () {
				let description = "<p>Will stop the purchase of Shield equipment levels and prestiges.</p>";
				description += "<p><b>This is only ever useful in very niche scenarios.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Equipment', [1, 2],
			function () { return (getPageSetting('equipOn', atConfig.settingUniverse)) });

		createSetting('equipPortal',
			function () { return ('AE: Portal') },
			function () {
				let description = "<p>Will ensure Auto Equip is enabled after portaling.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Equipment', [1, 2]);

		createSetting('equipShieldBlock',
			function () { return ('Buy Shieldblock') },
			function () {
				let description = "<p>Will allow the purchase of the <b>Shieldblock</b> upgrade through the <b>Buy Upgrades</b> setting.</p>";
				description += "<p><b>When this setting is enabled it will cause the script to automatically run <b>The Block</b> unique map when it gets unlocked.</b></p>";
				description += "<p><b>Recommended:</b> On until you can reach zone 40</p>";
				return description;
			}, 'boolean', 55 > game.stats.highestLevel.valueTotal(), null, 'Equipment', [1]);
	}
	
	const displayCombat = true;
	if (displayCombat) {
		createSetting('autoFight',
			function () { return (['Better Auto Fight: Off', 'Better Auto Fight: On', 'Better Auto Fight: Vanilla']) },
			function () {
				let description = "<p>Controls how combat is handled by the script.</p>";
				description += "<p><b>Better Auto Fight: Off</b><br>Disables this setting.</p>";
				description += "<p><b>Better Auto Fight: On</b><br>Sends a new army to fight if the current army is dead and your trimps have fully bred.</p>";
				description += "<p><b>Better Auto Fight: Vanilla</b><br>Will make sure the games AutoFight setting is enabled at all times and ensures you start fighting on portal until you get the Bloodlust upgrade.</p>";
				description += "<p><b>Recommended:</b> Better Auto Fight: On</p>";
				return description;
			}, 'multitoggle', 1, null, 'Combat', [1, 2]);

		createSetting('autoAbandon',
			function () { return (['Auto Abandon: Never', 'Auto Abandon: Always', 'Auto Abandon: Smart']) },
			function () {
				let description = "<p>Controls whether to force abandon trimps for mapping.</p>";
				description += "<p><b>Auto Abandon: Never</b><br>Never abandons trimps.</p>";
				description += "<p><b>Auto Abandon: Always</b><br>Always abandons trimps.</p>";
				description += "<p><b>Auto Abandon: Smart</b><br>Abandons trimps when the next group of trimps is ready, or when (0 + overkill) cells away from cell 100.</p>";
				description += "<p><b>Recommended:</b> Auto Abandon: Smart</p>";
				return description;
			}, 'multitoggle', 2, null, 'Combat', [1, 2]);

		createSetting('ignoreCrits',
			function () { return (['Ignore Crits: None', 'Ignore Crits: Void Strength', 'Ignore Crits: All']) },
			function () {
				const universeSetting = atConfig.settingUniverse === 1 ? 'Stance' : 'Equality'
				let description = `<p>Enabling this setting will cause <b>Hits Survived</b> and <b>Auto ${universeSetting}</b> to ignore enemy crits.</p>`;
				description += "<p><b>Ignore Crits: None</b><br>Disables this setting.</p>";
				description += "<p><b>Ignore Crits: Void Strength</b><br>Will ignore the crit chance buff from enemies in Heinous void maps.</p>";
				description += "<p><b>Ignore Crits: All</b><br>Will ignore crits from enemies in challenges, daily modifiers or void maps.</p>";
				description += "<p><b>Recommended:</b> Ignore Crits: Void Strength</p>";
				return description;
			}, 'multitoggle', 1, null, 'Combat', [1, 2],
			function () { return (game.global.totalPortals > 0) });

		createSetting('autoRoboTrimp',
			function () { return ('Auto Robotrimp') },
			function () {
				let description = "<p>Use the Robotrimp ability starting at this level, and every 5 levels thereafter.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> 60</p>";
				return description;
			}, 'value', 60, null, 'Combat', [1],
			function () { return (game.global.roboTrimpLevel > 0) });

		createSetting('forceAbandon',
			function () { return ('Trimpicide') },
			function () {
				let description = "<p>If a new army is available to send and anticipation stacks aren't maxed this will suicide your current army and send a new one.</p>";
				description += "<p><b>Will not suicide armies in Spires.</b></p>";
				description += "<p>This setting will abandon your army regardless of what your <b>Auto Abandon</b> setting is set to.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [1],
			function () { return (!game.portal.Anticipation.locked) });

		createSetting('floorCritCalc',
			function () { return ('Calc: Never Crit') },
			function () {
				let description = "<p>When doing trimp damage calculations this will floor your crit chance to make the script assume you will never crit.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1, 2]);
			
			createSetting('45stacks',
			function () { return ('Calc: Anticipation Stacks') },
			function () {
				let description = "<p>Will force any damage calculations to assume you have max anticipation stacks.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [1],
			function () { return (!game.portal.Anticipation.locked) });

		createSetting('addPoison',
			function () { return ('Calc: Poison Debuff') },
			function () {
				let description = "<p>Adds poison stack damage to any trimp damage calculations.</p>";
				description += "<p>May improve your poison zone speed.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 236) });

		createSetting('fullIce',
			function () { return ('Calc: Ice Debuff') },
			function () {
				let description = "<p>Always calculates your ice to be a consistent level instead of going by the enemy debuff. Primary use is to ensure your HD (enemyHealth:trimpDamage) ratios aren't all over the place.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 236) });

		createSetting('gammaBurstCalc',
			function () { return ('Calc: Gamma Burst') },
			function () {
				let description = "<p>Factors Gamma Burst damage into your HD (enemyHealth:trimpDamage) Ratio.</p>";
				description += "<p>Be warned, the script will assume that you have a gamma burst ready to trigger for every attack if enabled so your HD Ratio might be 1 but you'd need to multiply that value by your gamma burst proc count to get the actual value.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [1, 2],
			function () { return (game.stats.highestRadLevel.valueTotal() > 10) });

		createSetting('frenzyCalc',
			function () { return ('Calc: Frenzy Uptime') },
			function () {
				let description = "<p>Adds the Frenzy perk to trimp damage calculations.</p>";
				description += "<p>Be warned, the script will not farm as much with this on as it assumes 100% frenzy uptime.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Combat', [2],
			function () { return (!game.portal.Frenzy.radLocked && !autoBattle.oneTimers.Mass_Hysteria.owned) });
		
		createSetting('autoStance',
			function () { return (['Auto Stance: Off', 'Auto Stance: On', 'Auto Stance: Dominance']) },
			function () {
				let description = "<p>Enabling this setting will allow the script to swap stances to stop you having to do it manually.</p>";
				description += "<p><b>Auto Stance: Off</b><br>Disables this setting.</p>";
				description += "<p><b>Auto Stance: On</b><br>Automatically swap stances to avoid death. Prioritises damage when you have enough health to survive.</p>";
				description += "<p><b>Auto Stance: Dominance</b><br>Keeps you in Dominance stance regardless of your armies health.</p>";
				description += "<p><b>Recommended:</b> Auto Stance</p>";
				return description;
			}, 'multitoggle', 1, null, 'Combat', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 60) });
		
		createSetting('autoLevelScryer',
			function () { return ('Auto Level Scryer') },
			function () {
				let description = "<p>Allows the Auto Level system to use Scryer and Wind stances.</p>";
				description += "<p>If Scryer stance has been unlocked then when the most optimal stance to use during a map is Scryer this will override all other stance settings when mapping with <b>Auto Maps</b> enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 180) });

		createSetting('scryerVoidMaps',
			function () { return ('Auto Stance: Void Scryer') },
			function () {
				let description = "<p>Will override any stance settings and set your stance to Scryer during Void Maps if you have the <b>Scryhard II</b> talent.</p>";
				description += "<p>If you have <b>Wind Enlightenment</b> activated and aren't in a Wind empowerment zone then it will use Wind stance instead.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				description += `<p><i>When running a <b>Daily</b>, the <b>D: Auto Stance: Void Scryer</b> setting will be used instead of this one.</i></p>`;
				return description;
			}, 'boolean', true, null, 'Combat', [1],
			function () { return (masteryPurchased('scry2')) });
		
		createSetting('scryerVoidMapsDaily',
			function () { return ('Daily: Auto Stance: Void Scryer') },
			function () {
				let description = "<p>Will override any stance settings and set your stance to Scryer during Void Maps if you have the <b>Scryhard II</b> talent.</p>";
				description += "<p>This version of the setting will be used when running a <b>Daily</b> challenge. Outside of that, the <b>Auto Stance: Void Scryer</b> setting will be used.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1],
			function () { return (masteryPurchased('scry2')) });

		createSetting('autoStanceScryer',
			function () { return ('Enable Scryer Stance') },
			function () {
				let description = "<p>Master switch for whether the script will use Scryer stance.</p>";
				description += "<p>Overrides your <b>Auto Stance</b> setting when scryer conditions are met.</p>";
				description += "<p>The normal <b>Auto Stance</b> setting will still use Scryer stance when it can survive and kill the enemy in one hit.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 180) });

		createSetting('scryerMinZone',
			function () { return ('Min Zone') },
			function () {
				let description = "<p>Minimum zone (inclusive of the zone set) to start using scryer stance in.</p>";
				description += "<p>This needs to be on <b>AND</b> valid for the <b>MAYBE</b> option on all other Scryer settings to do anything.</p>";
				description += "<p>Use 9999 to disable all Non-Overkill, Non-Force, scryer usage.</p>";
				description += "<p><b>Recommended:</b> 60 or 181</p>";
				return description;
			}, 'value', 60, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', atConfig.settingUniverse)) });

		createSetting('scryerMaxZone',
			function () { return ('Max Zone') },
			function () {
				let description = "<p>Maximum zone (not inclusive of the zone set) to stop using scryer stance in.</p>";
				description += "<p>Turning this on with a positive number stops <b>MAYBE</b> use of all other Scryer settings.</p>";
				description += "<p>Use 9999 to disable all Non-Overkill, Non-Force, scryer usage.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> 9999</p>";
				return description;
			}, 'value', 999, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', atConfig.settingUniverse)) });

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
			}, 'multitoggle', 1, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', atConfig.settingUniverse)) });
		
		createSetting('scryerDieZone',
			function () { return ('Die To Use Scryer') },
			function () {
				let description = "<p>Enabling this will switch you back to scryer stance even when doing so would kill you.</p>";
				description += "<p>This has potential to happen in scenarios such as when skipping corrupted enemies switches you into regular X/H stance through Auto Stance, you've killed the corrupted and reached a non-corrupted enemy that you wish to use scryer stance on, but you havent bred yet and you are too low on health to just switch back to scryer stance.</p>";
				description += "<p>So use this if you'd rather die, wait to breed, then use scryer stance for the full non-corrupted enemy, to maximize dark essence gain.</p>";
				description += "<p>Use this input to set the minimum zone that scryer activates in. You can use decimal values to specify what cell this setting starts from.</p>";
				description += "<p><b>Set to -1 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', atConfig.settingUniverse)) });
			
		createSetting('scryerMaxHits',
			function () { return ('Max Hits') },
			function () {
				let description = "<p>Maximum hits that it would take for you to kill an enemy from full health. The script will use this for settings set to <b>Maybe</b> inputs.</p>";
				description += "<p>This has a chance to stop you from smoothly transitioning to Scryer stance and missing out on bonuses when settings are set to their <b>Never<b> inputs.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> 100</p>";
				return description;
			}, 'value', -1, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', atConfig.settingUniverse)) });

		createSetting('scryerEssenceOnly',
			function () { return ('Remaining Essence Only') },
			function () {
				let description = "<p>Will disable Scryer stance whilst in the world if there are no remaining enemies that hold dark essence.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', atConfig.settingUniverse)) });

		createSetting('scryerMaps',
			function () { return (['Scry Maps: Never', 'Scry Maps: Force', 'Scry Maps: Maybe']) },
			function () {
				const useType = "maps";
				let description = `<p><b>Scry Maps: Never</b><br>Will force the script to never use scryer stance in ${useType}.</p>`;
				description += `<p><b>Scry Maps: Force</b><br>Will force the script to always use scryer stance in ${useType}.</p>`;
				description += `<p><b>Scry Maps: Maybe</b><br>Will maybe run scryer stance in ${useType} depending on how difficult the map is.</p>`;
				description += `<p>This setting won't impact the use of Scryer stance when running <b>Void Map</b> or <b>Bionic Wonderland</b> maps.</p>`;
				description += `<p>When <b>Auto Level Scryer</b> is enabled it will take priority over this setting for if Scryer stance should be used.</p>`;
				description += `<p><b>Recommended:</b> Scry Maps: Maybe</p>`;
				return description;
			}, 'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', atConfig.settingUniverse)) });

		createSetting('scryerSpire',
			function () { return (['Scry Spire: Never', 'Scry Spire: Force', 'Scry Spire: Maybe']) },
			function () {
				const useType = "active Spires";
				let description = `<p><b>Scry Spire: Never</b><br>Will force the script to never use scryer stance in ${useType}.</p>`;
				description += `<p><b>Scry Spire: Force</b><br>Will force the script to always use scryer stance in ${useType}.</p>`;
				description += `<p><b>Scry Spire: Maybe</b><br>Will maybe run scryer stance in ${useType} depending on how difficult the Spire is.</p>`;
				description += `<p><b>Recommended:</b> Scry Spire: Maybe</p>`;
				return description;
			}, 'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', atConfig.settingUniverse)) });

		createSetting('scryerWorld',
			function () { return (['Scry World: Never', 'Scry World: Force', 'Scry World: Maybe']) },
			function () {
				const useType = "when fighting non-corrupted enemies";
				let description = `<p><b>Scry World: Never</b><br>Will force the script to never use scryer stance ${useType}.</p>`;
				description += `<p><b>Scry World: Force</b><br>Will force the script to always use scryer stance ${useType}.</p>`;
				description += `<p><b>Scry World: Maybe</b><br>Will maybe run scryer stance ${useType} depending on how difficult the enemy is.</p>`;
				description += `<p><b>Recommended:</b> Scry World: Maybe</p>`;
				return description;
			}, 'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', atConfig.settingUniverse)) });

		createSetting('scryerCorrupted',
			function () { return (['Scry Corrupted: Never', 'Scry Corrupted: Force', 'Scry Corrupted: Maybe']) },
			function () {
				const useType = "when fighting corrupted enemies";
				let description = `<p><b>Scry Corrupted: Never</b><br>Will force the script to never use scryer stance ${useType}.</p>`;
				description += `<p><b>Scry Corrupted: Force</b><br>Will force the script to always use scryer stance ${useType}.</p>`;
				description += `<p><b>Scry Corrupted: Maybe</b><br>Will maybe run scryer stance ${useType} depending on how difficult the enemy is.</p>`;
				description += `<p><b>Recommended:</b> Scry Corrupted: Maybe</p>`;
				return description;
			}, 'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', atConfig.settingUniverse)) });

		createSetting('scryerHealthy',
			function () { return (['Scry Healthy: Never', 'Scry Healthy: Force', 'Scry Healthy: Maybe']) },
			function () {
				const useType = "when fighting healthy enemies";
				let description = `<p><b>Scry Healthy: Never</b><br>Will force the script to never use scryer stance ${useType}.</p>`;
				description += `<p><b>Scry Healthy: Force</b><br>Will force the script to always use scryer stance ${useType}.</p>`;
				description += `<p><b>Scry Healthy: Maybe</b><br>Will maybe run scryer stance ${useType} depending on how difficult the enemy is.</p>`;
				description += `<p><b>Recommended:</b> Scry Healthy: Maybe</p>`;
				return description;
			}, 'multitoggle', 2, null, 'Combat', [1],
			function () { return (getPageSetting('autoStanceScryer', atConfig.settingUniverse && game.global.spiresCompleted >= 2)) });

		createSetting('autoStanceWind',
			function () { return ('Wind Stacking') },
			function () {
				let description = "<p>Enabling this will give you settings to allow you to wind stack in your runs.</p>";
				description += "<p>Will use your regular <b>Auto Stance</b> setting when outside of zones you're wind stacking in.</p>";
				description += "<p>The script evaluates the use of wind stance based on these settings. It examines the cells from the current one up to the maximum overkill range in scryer stance. If none of these cells contain enemies that drop helium, the script switches to scryer stance instead to kill them faster.</p>";
				description += `<p><i>When running a <b>Daily</b>, the <b>Daily Wind Stacking</b> version of this setting will be used instead of this one.</i></p>`;
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1],
			function () { return (game.empowerments.Wind.getLevel() >= 50) });

		createSetting('windStackingZone',  
			function () { return ('Wind Stack Zone') },
			function () {
				let description = "<p>Enables wind stacking in zones above and inclusive of the zone set.</p>";
				description += "<p><b>Recommended:</b> 100 zones below portal zone</p>";
				description += `<p><i>When running a <b>Daily</b>, the <b>Daily: Wind Stack Zone</b> version of this setting will be used instead of this one.</i></p>`;
				return description;
			}, 'value', 999, null, 'Combat', [1],
			function () { return (autoTrimpSettings.autoStanceWind.enabled) });

		createSetting('windStackingRatio',
			function () { return ('Wind Stack H:D') },
			function () {
				let description = "<p>If your HD ratio is above this setting it will not use wind stance.</p>";
				description += "<p>If set to <b>0 or below</b> it will always use wind stance when past your wind stacking zone input.</p>";
				description += "<p><b>Recommended:</b> 1000</p>";
				description += `<p><i>When running a <b>Daily</b>, the <b>Daily: Wind Stack H:D</b> version of this setting will be used instead of this one.</i></p>`;
				return description;
			}, 'value', -1, null, 'Combat', [1],
			function () { return (autoTrimpSettings.autoStanceWind.enabled) });

		createSetting('windStackingLiq',
			function () { return ('Wind Stack Liquification') },
			function () {
				let description = "<p>Will wind stack during liquification regardless of your <b>Wind Stack H:D</b> or <b>Windstack Zone</b> inputs.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				description += `<p><i>When running a <b>Daily</b>, the <b>Daily: Wind Stack Liquification</b> version of this setting will be used instead of this one.</i></p>`;
				return description;
			}, 'boolean', false, null, 'Combat', [1],
			function () { return (autoTrimpSettings.autoStanceWind.enabled) });

		createSetting('autoStanceWindDaily',
			function () { return ('Daily: Wind Stacking') },
			function () {
				let description = "<p>Enabling this will give you settings to allow you to wind stack in your Daily challenge runs.</p>";
				description += "<p>Will use your regular <b>Auto Stance</b> setting when outside of zones you're wind stacking in.</p>";
				description += "<p>The script evaluates the use of wind stance based on these settings. It examines the cells from the current one up to the maximum overkill range in scryer stance. If none of these cells contain enemies that drop helium, the script switches to scryer stance instead to kill them faster.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1],
			function () { return (game.empowerments.Wind.getLevel() >= 50) });

		createSetting('windStackingZoneDaily',
			function () { return ('Daily: Wind Stack Zone') },
			function () {
				let description = "<p>Enables wind stacking in zones above and inclusive of the zone set.</p>";
				description += "<p><b>Recommended:</b> 100 zones below portal zone</p>";
				return description;
			}, 'value', -1, null, 'Combat', [1],
			function () { return (autoTrimpSettings.autoStanceWindDaily.enabled) });

		createSetting('windStackingRatioDaily',
			function () { return ('Daily: Wind Stack H:D') },
			function () {
				let description = "<p>If your HD ratio is above this setting it will not use wind stance.</p>";
				description += "<p>If set to <b>0 or below</b> it will always use wind stance when at or above your wind stack zone input.</p>";
				description += "<p><b>Recommended:</b> 1000</p>";
				return description;
			}, 'value', -1, null, 'Combat', [1],
			function () { return (autoTrimpSettings.autoStanceWindDaily.enabled) });

		createSetting('windStackingLiqDaily',
			function () { return ('Daily: Wind Stack Liquification') },
			function () {
				let description = "<p>Will wind stack during liquification regardless of your <b>D: Wind Stack H:D</b> or <b>D: Wind Stack Zone</b> inputs.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Combat', [1],
			function () { return (autoTrimpSettings.autoStanceWindDaily.enabled) });

		createSetting('equalityManagement',
			function () { return (['Auto Equality: Off', 'Auto Equality: Basic', 'Auto Equality: Advanced']) },
			function () {
				let description = "<p>Controls how the script handles interactions with the Equality perk.</p>";
				description += "<p><b>Auto Equality: Off</b><br>Disables this setting.</p>";
				description += "<p><b>Auto Equality: Basic</b><br>Disables scaling and sets equality to 0 on slow enemies, otherwise scaling is enabled.<br>When using this you must setup the <b>scaling</b> and <b>reversing</b> settings in the equality menu.</p>";
				description += "<p><b>Auto Equality: Advanced</b><br>Will disable equality scaling and use the equality stack slider to set your equality to the ideal amount to kill the current enemy in the least amount of hits necessary.</p>";
				description += "<p><b>Recommended:</b> Auto Equality: Advanced</p>";
				return description;
			}, 'multitoggle', 2, null, 'Combat', [2]);
	}
	
	const displayMaps = true;
	if (displayMaps) {
		createSetting('autoMaps',
			function () { return (["Auto Maps: Off", "Auto Maps: On", "Auto Maps: No Unique"]) },
			function (noUnique) {
				let description = "<p>Master switch for whether the script will do any mapping. You will have to setup the mapping you would like to do, settings for that can be found in this tab.</p>";
				description += "<p><b>Auto Maps: Off</b><br>Disables mapping.</p>";
				description += "<p><b>Auto Maps: On</b><br>Enables mapping and will run all types of maps.</p>";
				if (!noUnique) description += "<p><b>Auto Maps: No Unique</b><br>Works the same as <b>Auto Maps: On</b> but won't run any unique maps such as <b>" + (atConfig.settingUniverse === 1 ? "The Block" : "Big Wall") + "</b> or <b>Dimension of " + (atConfig.settingUniverse === 1 ? "Anger" : "Rage") + "</b>.</p>";
				description += "<p>If enabled, this setting will automatically adjust the games <b>Repeat</b> and <b>Exit to</b> settings.</p>";
				description += "<p><b>Recommended:</b> Auto Maps: On</p>";
				return description;
			}, 'multitoggle', 1, null, 'Maps', [1, 2]);

		createSetting('autoMapsPortal',
			function () { return ('Auto Maps Portal') },
			function () {
				let description = "<p>Will ensure Auto Maps is enabled after portaling.</p>";
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
				let description = "<p>When trying to map this will cause the script to only create perfect maps.</p>";
				description += "<p><b>This may greatly decrease the map level that the script believes is efficient.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Maps', [1, 2],
			function () { return (trimpStats.perfectMaps) });

		createSetting('autoMapsReroll',
			function () { return ('Auto Maps Reroll') },
			function () {
				let description = "<p>Will reroll your map if you're at the optimal farming level (assuming Infinity fragments) and the best map you can currently purchase is guaranteed to be better than your current map.</p>";
				description += "<p>This setting will increase the amount of simulations that Auto Level runs so only enable this if you don't have any performance issues.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Maps', [1, 2]);

		createSetting('recycleExplorer',
			function () { return ('Recycle Pre-Explorers') },
			function () {
				let description = "<p>Will allow the script to abandon and recycle maps before Explorers have been unlocked.</p>";
				description += "<p><b>This may cause issues with fragments in the early game or on select challenges.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Maps', [1, 2]);

		createSetting('mapBonusPrestige',
			function () { return ('Map Bonus Level Prestiges') },
			function () {
				let description = "<p>When using the <b>Map Bonus Min Level</b> setting, if there are any prestige upgrades available between your map level and minimum map bonus level, this will the reduce level that it looks for to the last one with prestiges.</p>";
				description += "<p>This setting is ignored when obtaining map bonus stacks through the <b>Map Bonus</b> setting.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Maps', [1, 2],
			function () { return (trimpStats.plusLevels || (game.global.universe === 1 && !game.portal.Siphonology.locked)) });

		createSetting('hitsSurvived',
			function () { return ('Hits Survived') },
			function () {
				let description = "<p>Will farm until you can survive this amount of attacks.</p>";
				description += "<p>Uses the <b>Map Cap</b> and <b>Job Ratio</b> inputs that have been set in the top row of the <b>HD Farm</b> setting. If they haven't been setup then it will default to a job ratio of <b>1/1/2</b> and a map cap of <b>100</b>.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>Your current Hits Survived value can be seen in either the <b>Auto Maps Status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</p>";
				description += "<p><b>Recommended:</b> 1.5</p>";
				return description;
			}, 'value', 1.25, null, 'Maps', [1, 2]);

		createSetting('mapBonusHealth',
			function () { return ('Map Bonus Health') },
			function () {
				let description = "<p>Map Bonus stacks will be obtained to this amount when your current <b>Hits Survived</b> is below the value set in the <b>Hits Survived</b> setting.</p>";
				if (atConfig.settingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 230) description += "<p>This is a very important setting to be used with <b>Advanced Nurseries</b> once you reach magma zones. If you are running out of nurseries too soon, increase this value.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 10, null, 'Maps', [1, 2]);

		createSetting('hitsSurvivedReset',
			function () { return (['Hits Survived Reset: Off', 'Hits Survived Reset: S', 'Hits Survived Reset: On']) },
			function () {
				let description = "<p>Setting to allow <b>Hits Survived</b> setting(s) to refarm if below 80% of the targetted value.</p>";
				description += "<p><b>Hits Survived Reset: Off</b><br>Disables this setting.</p>";
				description += "<p><b>Hits Survived Reset: S</b><br>Allows the standalone version of <b>Hits Survived</b> to reset and farm again when you're below 80% of the targetted value.</p>";
				description += "<p><b>Hits Survived Reset: On</b><br>Will make both the standalone version of <b>Hits Survived</b> and any <b>Hits Survived</b> lines in the <b>HD Farm</b> setting reset and farm again when you're below 80% of the targetted value.</p>";
				description += "<p>Having this setting enabled will allow you to farm multiple times if enemies damage increase or your army gets weaker through challenge buffs or debuffs.</p>";
				description += "<p>Enabling this setting makes the Map Cap input in the <b>HD Farm</b> setting irrelevant as it will continually restart your <b>Hits Survived</b> farm.</p>";
				description += "<p><b>Recommended:</b> Hits Survived Reset: S</p>";
				return description;
			}, 'multitoggle', 1, null, 'Maps', [1, 2]);

		createSetting('mapBonusRatio',
			function () { return ('Map Bonus Ratio') },
			function () {
				let description = "<p>Map Bonus stacks will be obtained when above this World HD Ratio value.</p>";
				description += "<p>Will use the <b>Special</b> and <b>Job Ratio</b> inputs that have been set in the top row of the <b>Map Bonus</b> setting. If they haven't been setup then it will default to a job ratio of <b>0/1/3</b> and the best <b>Metal</b> cache available.</p>";
				description += "<p>Your current HD Ratio value can be seen in either the <b>Auto Maps Status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> 4</p>";
				return description;
			}, 'value', -1, null, 'Maps', [1, 2]);

		createSetting('mapBonusStacks',
			function () { return ('Map Bonus Stacks') },
			function () {
				let description = "<p>Map Bonus stacks will be obtained to this value when your current <b>World HD Ratio</b> is above the value set in the <b>Map Bonus Ratio</b> setting.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 10, null, 'Maps', [1, 2]);

		createSetting('mapBonusMinLevel',
			function () { return ('Map Bonus Min Level') },
			function () {
				let description = "<p>When using the <b>Map Bonus Health</b>, <b>Map Bonus Stacks</b> and <b>Map Bonus</b> settings this will allow you to decide not to maps for map bonus stacks when the optimal map level is this many or more levels below your minimum map bonus level.</p>";
				description += "<p>This is disabled when set to 0 or below <b>OR</b> you have no unbought prestiges and have prestiges available in the minimum map bonus level.</p>";
				description += "<p><b>Recommended:</b> 2 (when highest zone reached is below 100) otherwise <b>0</b></p>";
				return description;
			}, 'value', 0, null, 'Maps', [1, 2]);
			
		createSetting('mapBonusLevelType',
			function () { return ('HS/HD Map Bonus Type') },
			function () {
				let description = "<p>Will swap the auto level type that both Hits Survived and HD Ratio use for map bonus maps from loot maps to speed maps.</p>";
				description += "<p>This will cause it to target maps where you have the fastest kill speed rather than loot gains for if you're just trying to get map bonus stacks quickly.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Maps', [1, 2]);

		createSetting('prestigeClimb',
			function () { return ('Prestige Climb') },
			function () {
				let description = "<p>Acquire prestiges through the selected item (inclusive) as soon as they are available in maps.</p>";
				description += "<p>Automatically swaps the games default setting from <b>Tier First</b> to <b>Equip First</b>.</p>";
				description += "<p><b>Auto Maps must be enabled for this to run.</b></p>";
				description += "<p><b>Before Explorers have been unlocked when this setting runs it will automatically set all map sliders except size to the minimum they can be and the biome used to Random.</b></p>";
				description += "<p>This is important for speed climbing through world zones. If you find the script getting stuck somewhere, particularly where you should easily be able to kill stuff, setting this to an option lower down in the list will help ensure you are more powerful at all times, but will spend more time acquiring the prestiges in maps.</p>";
				description += "<p><b>Recommended:</b> Dagadder</p>";
				return description;
			}, 'dropdown', 'Off', 
			function () {
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
			function () { return ('HS & HD Farm Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like <b>HD Ratio</b> or <b>Hits Survived</b> farming to be run.</p>";
				description += "<p>Your current HD Ratio and Hits Survived values can be seen in either the <b>Auto Maps Status tooltip</b> or the AutoTrimp settings <b>Help</b> tab.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false, jobratio: '-1', mapCap: 100 }], 'importExportTooltip("mapSettings", "HD Farm")', 'Maps', [1, 2]);

		createSetting('voidMapSettings',
			function () { return ('Void Map Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like <b>Void Maps</b> to be run.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false, hitsSurvived: 1 }], 'importExportTooltip("mapSettings", "Void Map")', 'Maps', [1, 2],
			function () { return (game.global.totalPortals > 0) });

		createSetting('boneShrineSettings',
			function () { return ('Bone Shrine Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like <b>Bone Shrine</b> charges to be used.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Bone Shrine")', 'Maps', [1, 2],
			function () { return (game.permaBoneBonuses.boosts.owned > 0) });

		createSetting('worshipperFarmSettings',
			function () { return ('Worshipper Farm Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like <b>Worshippers</b> to be farmed.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Worshipper Farm")', 'Maps', [2],
			function () { return game.stats.highestRadLevel.valueTotal() >= 50 });

		createSetting('uniqueMapSettingsArray',
			function () { return ('Unique Map Settings') },
			function () {
				let description = "<p>Here you can select when you would like <b>Unique Maps</b> to be run.</p>";
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
			}, 'importExportTooltip("uniqueMaps")', 'Maps', [1, 2]);

		createSetting('uniqueMapUnlocks',
			function () { return ('Unique Map Unlocks') },
			function () {
				const portalMap = atConfig.settingUniverse === 1 ? "Dimension of Anger" : "Dimension of Rage";
				let description = "<p>Will force run unique maps that have unlocks if you're a zone above the level they are unlocked.</p>";
				description += "<p>This setting takes <b>Unique Map Health Check</b> into account if enabled and won't run unique maps unless you have enough health to survive them.</p>";
				description += `<p>If you have this disabled then you will need to either setup <b>${portalMap}</b> in <b>Unique Map Settings</b> or manually run it to unlock the ability to portal.</p>`;
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Maps', [1, 2]);

		createSetting('uniqueMapEnoughHealth',
			function () { return ('Unique Map Health Check') },
			function () {
				let description = "<p>Will disable any unique maps that you don't have enough health to survive in from being run.</p>";
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
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Raiding")', 'Maps', [1, 2]);

		createSetting('bionicRaidingSettings',
			function () { return ('Bionic Raiding Settings') },
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
			function () { return `${atConfig.settingUniverse === 2 ? 'Unbalance' : 'Balance'}` },
			function () {
				let description = `<p>Enable this if you want to automate destacking when running the <b>${atConfig.settingUniverse === 2 ? 'Unbalance' : 'Balance'}</b> challenge.</p>`;
				if (game.global.highestRadonLevelCleared > 1) description += `<p>If you have a gamma burst charged this will delay destacking until it has been used.</p>`;
				description += `<p><b>Recommended:</b> On</p>`;
				return description;
			}, 'boolean', false, null, 'Challenges', [1, 2],
			function () { return (atConfig.settingUniverse === 2 ? game.stats.highestRadLevel.valueTotal() >= 35 : game.stats.highestLevel.valueTotal() >= 40) });

		createSetting('balanceDestack',
			function () { return `${atConfig.settingUniverse === 2 ? 'U' : 'B'}: HD Ratio` },
			function () {
				let description = `<p>What HD ratio cut-off to use for deciding when to destack.</p>`;
				description += `<p>Only destacks once above the stack amount set in the <b>${atConfig.settingUniverse === 2 ? 'U' : 'B'}: Stacks</b> setting.</p>`;
				description += `<p>If set to <b>0 or below</b> it will disable this setting.</p>`;
				description += `<p><b>Recommended:</b> 5</p>`;
				return description;
			}, 'value', 5, null, 'Challenges', [1, 2],
			function () { return (getPageSetting('balance', atConfig.settingUniverse) && autoTrimpSettings.balance.require()) });

		createSetting('balanceZone',
			function () { return `${atConfig.settingUniverse === 2 ? 'U' : 'B'}: Zone` },
			function () {
				let description = `<p>The zone you would like to start destacking your Unbalance stacks from.</p>`;
				description += `<p>If set to <b>0 or below</b> it will never destack.</p>`;
				return description;
			}, 'value', 6, null, 'Challenges', [1, 2],
			function () { return (getPageSetting('balance', atConfig.settingUniverse) && autoTrimpSettings.balance.require()) });

		createSetting('balanceStacks',
			function () { return `${atConfig.settingUniverse === 2 ? 'U' : 'B'}: Stacks` },
			function () {
				let description = `<p>The amount of Unbalance stacks you have to reach before clearing them.</p>`;
				description += `<p>Once it starts destacking it will destack until you have no Unbalance stacks remaining.</p>`;
				description += `<p>If set to <b>0 or below</b> it will never destack.</p>`;
				description += `<p><b>Recommended:</b> 20</p>`;
				return description;
			},'value', 20, null, 'Challenges', [1, 2],
			function () { return (getPageSetting('balance', atConfig.settingUniverse) && autoTrimpSettings.balance.require()) });

		createSetting('balanceImprobDestack',
			function () { return `${atConfig.settingUniverse === 2 ? 'U' : 'B'}: Improbability Destack` },
			function () {
				let description = `<p>Will always fully destack when at cell 100 once you reach your destacking zone.</p>`;
				description += `<p><b>Recommended:</b> On</p>`;
				return description;
			}, 'boolean', false, null, 'Challenges', [1, 2],
			function () { return (getPageSetting('balance', atConfig.settingUniverse) && autoTrimpSettings.balance.require()) });

		createSetting('buble',
			function () { return ('Bublé') },
			function () {
				let description = "<p>This is a dummy setting to explain how the script works during Bublé.</p>";
				description += "<p>Disables map bonus farming when using auto level unless your optimal map level is 0 or higher as it can't guarantee survival before then.</p>";
				description += "<p>Will automatically adjust equality and suicide armies that are one hit away from death to try and ensure you don't fail the challenge. It cannot do this during void maps so you need to overfarm health and damage to accomodate for this.</p>";
				description += "<p>Requires the <b>Auto Equality</b> setting in the Combat tab to be set to <b>Auto Equality: Advanced</b> or the script won't try to keep your armies alive.</p>";
				return description;
			}, 'boolean', false, null, 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 40) });

		createSetting('decay',
			function () { return `${atConfig.settingUniverse === 2 ? 'Melt' : 'Decay'}` },
			function () {
				let description = `<p>Enable this if you want to use automation features when running the <b>${atConfig.settingUniverse === 2 ? 'Melt' : 'Decay'}</b> challenge.</p>`;
				description += `<p><b>Recommended:</b> On</p>`;
				return description;
			}, 'boolean', false, null, 'Challenges', [1, 2],
			function () { return (atConfig.settingUniverse === 2 ? game.stats.highestRadLevel.valueTotal() >= 50 : game.stats.highestLevel.valueTotal() >= 55) });

		createSetting('decayStacksToPush',
			function () { return `${atConfig.settingUniverse === 2 ? 'M' : 'D'}: Stacks to Push` },
			function () {
				const challengeName = atConfig.settingUniverse === 2 ? 'Melt' : 'Decay';
				const maxStacks = challengeName === 'Melt' ? 500 : 999;
			
				let description = `<p>Will ignore maps and push to end the zone when you are at or above this amount of stacks.</p>`;
				description += `<p>Both Prestige Climb and Void Maps will override this setting and still run.</p>`;
				description += `<p>Set to <b>0 or below</b> to disable this setting.</p>`;
				description += `<p>Inputs above the max stack value (<b>${maxStacks}</b>) are treated as max stack inputs.</p>`;
				description += `<p><b>Recommended:</b> 150</p>`;
				return description;
			}, 'value', -1, null, 'Challenges', [1, 2],
			function () { return (getPageSetting('decay', atConfig.settingUniverse) && autoTrimpSettings.decay.require()) });

		createSetting('decayStacksToAbandon',
			function () { return `${atConfig.settingUniverse === 2 ? 'M' : 'D'}: Stacks to Abandon` },
			function () {
				const challengeName = atConfig.settingUniverse === 2 ? 'Melt' : 'Decay';
				const maxStacks = challengeName === 'Melt' ? 500 : 999;
			
				let description = `<p>Will abandon the challenge when you are at or above this amount of stacks.</p>`;
				description += `<p>Set to <b>0 or below</b> to disable this setting.</p>`;
				description += `<p>Inputs above the max stack value (<b>${maxStacks}</b>) are treated as max stack inputs.</p>`;
				description += `<p><b>Recommended:</b> 400</p>`;
				return description;
			}, 'value', -1, null, 'Challenges', [1, 2],
			function () { return (getPageSetting('decay', atConfig.settingUniverse) && autoTrimpSettings.decay.require()) });

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
				let description = "<p>Here you can select how and when you would like to farm a specific amount of Toxicity stacks for increased " + _getPrimaryResourceInfo().name.toLowerCase() + " and resources gain during the <b>Toxicity</b> challenge..</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				description += "<p><b>Recommended:</b> Setup to farm 1500 stacks on the last zone of the challenge.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Toxicity")', 'Challenges', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 165) });

		createSetting('archaeology',
			function () { return ('Archaeology') },
			function () {
				let description = "<p>Enable this if you want to use automation features when running the <b>Archaeology</b> challenge.</p>";
				description += "<p>When enabled, <b>AT Auto Jobs</b> will fire all workers to speed up breeding when not fighting.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 90) });
			
		createSetting('archaeologyBreedShield',
			function () { return ('A: Breed Shield') },
			function () {
				let description = "<p>Shield to use during <b>Archaeology</b> when your army is dead and breeding.</p>";
				description += "<p>This will override all other heirloom swapping features when active!</p>";
				description += "<p>Should ideally be a shield with the <b>Breed Speed</b> modifier.</p>";
				description += "<p>Mapping decisions will be disabled when in world or the map chamber and using this heirloom so make sure it has a different name from your other heirloom settings!</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Challenges', [2],
			function () { return (getPageSetting('archaeology', atConfig.settingUniverse) && autoTrimpSettings.archaeology.require()) });
			
		createSetting('archaeologyString1',
			function () { return ('A: String 1') },
			function () {
				let description = "<p>First string to use in <b>Archaeology</b>. Follows the same format as the game i.e: 10a,10e </p>";
				return description;
			}, 'multiTextValue', ['undefined'], null, 'Challenges', [2],
			function () { return (getPageSetting('archaeology', atConfig.settingUniverse) && autoTrimpSettings.archaeology.require()) });

		createSetting('archaeologyString2',
			function () { return ('A: String 2') },
			function () {
				let description = "<p>Second string to use in <b>Archaeology</b>. Follows the same format as the game, put the zone you want to start using this string at the start of the input. I.e: 84,10a,10e </p>";
				return description;
			}, 'multiTextValue', ['undefined'], null, 'Challenges', [2],
			function () { return (getPageSetting('archaeology', atConfig.settingUniverse) && autoTrimpSettings.archaeology.require()) });

		createSetting('archaeologyString3',
			function () { return ('A: String 3') },
			function () {
				let description = "<p>Third string to use in <b>Archaeology</b>. Follows the same format as the game, put the zone you want to start using this string at the start of the input. I.e: 94,10a,10e </p>";
				return description;
			}, 'multiTextValue', ['undefined'], null, 'Challenges', [2],
			function () { return (getPageSetting('archaeology', atConfig.settingUniverse) && autoTrimpSettings.archaeology.require()) });

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
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Challenges', [2],
			function () { return (getPageSetting('exterminate', atConfig.settingUniverse) && autoTrimpSettings.exterminate.require()) });

		createSetting('quagmireSettings',
			function () { return ('Quagmire Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like Black Bog farming to be done during the <b>Quagmire</b> challenge.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Quagmire")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 70) });

		createSetting('archaeologySettings',
			function () { return ('Archaeology Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like farm for specific relic strings during the <b>Archaeology</b> challenge.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Archaeology")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 90) });
			
		createSetting('insanitySettings',
			function () { return ('Insanity Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like Insanity stack farming to be done during the <b>Insanity</b> challenge.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Insanity")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 110) });

		createSetting('alchemySettings',
			function () { return ('Alchemy Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like potion and brew farming to be done during the <b>Alchemy</b> challenge.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Alchemy")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 155) });

		createSetting('hypothermiaSettings',
			function () { return ('Hypothermia Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like bonfire farming to be done during the <b>Hypothermia</b> challenge.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Hypothermia")', 'Challenges', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 175) });
	}

	const displayC2 = true;
	if (displayC2) {
		createSetting('c2Finish',
			function () { return `Finish ${_getChallenge2Info()}` },
			function () {

				let description = `<p>Abandons ${_getChallenge2Info()}s when this zone is reached.</p>`;
				description += `<p>If <b>${_getChallenge2Info()} Runner</b> is enabled then this setting is disabled.</p>`;
				description += `<p>Set to <b>0 or below</b> to disable this setting.</p>`;
				description += `<p>Will not abandon max completion challenges${atConfig.settingUniverse === 1 && 
				game.stats.highestLevel.valueTotal() >= 600 ? ' or Experience' : ''}.</p>`;
				description += `<p>Recommended: Zones ending with 0 for most ${_getChallenge2Info()} runs.</p>`;
				return description;
			}, 'value', -1, null, 'C2', [1, 2]);

		createSetting('c2Table',
			function () { return `${_getChallenge2Info()} Table` },
			function () {
				let description = `<p>Display your challenge run stats in a colour coded table.</p>`;
				description += `<p><b>Green</b><br>Challenges that are green are normally not worth updating.</p>`;
				description += `<p><b>Yellow</b><br>You should consider updating yellow challenges.</p>`;
				description += `<p><b>Red</b><br>Updating red challenges is typically worthwhile.</p>`;
				description += `<p><b>Blue</b><br>This challenge hasn't been run yet and should be done as soon as possible.</p>`;
				description += `<p>The <b>${_getChallenge2Info()} Runner</b> heading indicates which challenges will be run when using the <b>${_getChallenge2Info()} Runner: Percent</b> setting.</p>`;
				description += `<p>The <b>Auto Portal</b> heading indicates which challenges will be started when Auto Portaling. They run in order of difficulty.</p>`;
				return description;
			}, 'infoclick', null, 'importExportTooltip("c2table")', 'C2', [0]);

		createSetting('c2SharpTrimps',
			function () { return `${_getChallenge2Info()} Sharp Trimps` },
			function () {
				let description = `<p>Buys the Sharp Trimps bonus for <b>25 bones</b> during ${_getSpecialChallengeDescription()}.</p>`;
				description += `<p><b>Recommended:</b> Off</p>`;
				return description;
			}, 'boolean', false, null, 'C2', [1, 2]);

		createSetting('c2GoldenMaps',
			function () { return `${_getChallenge2Info()} Golden Maps` },
			function () {
				let description = `<p>Buys the Golden Maps bonus for <b>20 bones</b> during ${_getSpecialChallengeDescription()}.</p>`;
				description += `<p><b>Recommended:</b> Off</p>`;
				return description;
			}, 'boolean', false, null, 'C2', [1, 2]);

		createSetting('c2Filler',
			function () { return (`Run ${_getChallenge2Info()}'s as Fillers`) },
			function () {
				const presetName = atConfig.settingUniverse === 2 ? "Easy Radon Challenge" : "the most appropriate zone progression";
				let description = `<p>Adjusts how the <b>Golden Upgrade</b> and <b>Perk Preset Swapping</b> settings work when running ${_getChallenge2Info()}'s.</p>`;
				description += `<p><b>Golden Upgrade</b><br>Will stop <b>${_getChallenge2Info()}</b> run types from being used and instead only allow <b>All</b> or <b>Filler</b> run types.</p>`;
				description += `<p><b>Perk Preset Swapping</b><br>Selects the ${presetName} preset when auto portaling into ${_getChallenge2Info()} challenges.<br>This will <b>not</b> override it for challenges that have a dedicated preset and those challenges will still load the appropriate preset for the challenge so update them accordingly.</p>`;
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1, 2]);

		createSetting('c2DisableFinished',
			function () { return 'Hide Finished Challenges' },
			function () {
				let description = `<p>Hides challenges that have a maximum completion count when they've been finished.</p>`;
				description += `<p>If you're running one of the challenges then its settings will appear for the duration of that run.</p>`;
				return description;
			}, 'boolean', true, null, 'C2', [1, 2],
			function () { return (( atConfig.settingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 460) || (atConfig.settingUniverse === 2 && game.stats.highestRadLevel.valueTotal() >= 100)) });

		createSetting('c2RunnerStart',
			function () { return `${_getChallenge2Info()} Runner` },
			function () {
				let description = `<p>Enable this if you want to use ${_getChallenge2Info()} running features to automatically start running ${_getChallenge2Info()}'s when portaling in an effort to maintain your ${_getChallenge2Info()} score</p>`;
				description += `<p>When enabled the <b>Finish ${_getChallenge2Info()}</b> setting will be disabled.</p>`;
				description += `<p><b>Recommended:</b> On</p>`;
				return description;
			}, 'boolean', false, null, 'C2', [1, 2]);

		createSetting('c2RunnerMode',
			function () { return [`${_getChallenge2Info()} Runner: Percent`, `${_getChallenge2Info()} Runner: Set Values`] },
			function () {
				const c2Name = _getChallenge2Info();
				let description = `<p>Toggles between the two modes that ${c2Name} Runner can use for selecting which challenge to start.</p>`;
				description += `<p><b>${c2Name} Runner: Percent</b><br>Will run ${c2Name}s when they are below a set percentage of your HZE.</b><br>For a list of challenges that this will run see the ${c2Name} Table.</p>`;
				description += `<p><b>${c2Name} Runner Set Values</b><br>Uses the <b>${c2Name} Runner Settings</b> popup settings and runs enabled challenges when they are below the designated end zone.</p>`;
				description += `<p>If using <b>${c2Name} Runner Set Values</b> then the challenge will only be finished if the challenge is enabled and a zone above 0 has been set.</p>`;
				description += `<p><b>Recommended:</b> ${c2Name} Runner: Percent</p>`;
				return description;
			}, 'multitoggle', 0, null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', atConfig.settingUniverse)) });

		createSetting('c2RunnerSettings',
			function () { return (`${_getChallenge2Info()} Runner Settings`) },
			function () {
				let description = `<p>Here you can enable the challenges you would like ${_getChallenge2Info()} Runner to complete and the zone you'd like the respective challenge to finish at.</p>`;
				description += `<p><b>Click to adjust settings.</b></p>`;
				return description;
			}, 'mazArray', {}, 'importExportTooltip("c2Runner")', 'C2', [1, 2],
			function () {
				return (getPageSetting('c2RunnerStart', atConfig.settingUniverse) && getPageSetting('c2RunnerMode', atConfig.settingUniverse) === 1)
			});

		createSetting('c2RunnerPortal',
			function () { return (_getChallenge2Info() + ' Runner: End Zone') },
			function () {
				let description = `<p>Automatically abandon ${_getChallenge2Info()}s when this zone is reached.</p>`;
				description += `<p>Set to <b>0 or below</b> to disable this setting.</p>`;
				description += `<p>Disabling this setting stops ${_getChallenge2Info()} Runner from starting challenges.</p>`;
				description += `<p>${_getChallenge2Info()} Runner won't run challenges that are already at or below this value.</p>`;
				description += `<p><b>Recommended:</b> Desired challenge end goal</p>`;
				return description;
			}, 'value', -1, null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', atConfig.settingUniverse) && getPageSetting('c2RunnerMode', atConfig.settingUniverse) === 0) });

		createSetting('c2RunnerPercent',
			function () { return (`${_getChallenge2Info()} Runner: %`) },
			function () {
				let description = `<p>The percent threshold you want ${_getChallenge2Info()}s to be over.</p>`;
				description += `<p>Will only run ${_getChallenge2Info()}s with a HZE% below this setting's value.</p>`;
				description += `<p>Set to <b>0 or below</b> to disable this setting.</p>`;
				description += `<p>If this setting is disabled it will also stop ${_getChallenge2Info()} Runner from starting any challenges.</p>`;
				description += `<p><b>Recommended:</b> 85</p>`;
				return description;
			}, 'value', 0, null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', atConfig.settingUniverse) && getPageSetting('c2RunnerMode', atConfig.settingUniverse) === 0) });

		createSetting('c2RunnerEndMode',
			function () {
				const hze = game.stats.highestLevel.valueTotal();
				const portalOptions = [`${_getChallenge2Info()} Runner: End Challenge`, `${_getChallenge2Info()} Runner: Portal`, `${_getChallenge2Info()} Runner: Portal After Voids`];
				if (atConfig.settingUniverse === 1 && hze >= 230) portalOptions.push(`${_getChallenge2Info()} Portal After Poison Voids`);
				return portalOptions;
			},
			function () {
				let description = `<p>This setting will decide the action that <b>${_getChallenge2Info()} Runner</b> does when it finishes your current challenge.</p>`;
				description += `<p><b>${_getChallenge2Info()} Runner: End Challenge</b><br> Will end the challenge and continue your run on as normal.</p>`;
				description += `<p><b>${_getChallenge2Info()} Runner: Portal</b><br> Will automatically portal once you reach your ${_getChallenge2Info()} end zone.</p>`;
				description += `<p><b>${_getChallenge2Info()} Runner: Portal After Voids</b><br> Once you reach your ${_getChallenge2Info()} end zone this will abandon your challenge, then run voids maps and portal afterwards.</p>`;
				description += `<p><b>Recommended:</b> ${_getChallenge2Info()} Runner: Portal</p>`;
				return description;
			}, 'multitoggle', 1, null, 'C2', [1, 2],
			function () { return (getPageSetting('c2RunnerStart', atConfig.settingUniverse)) });

		createSetting('c2Fused',
			function () { return ([`Fused ${_getChallenge2Info()}s: Off`, `Fused ${_getChallenge2Info()}s: Below %`, `Fused ${_getChallenge2Info()}s: Any %`]) },
			function () {
				const c2Name = _getChallenge2Info();
				let description = `<p>Will allow ${c2Name} Runner to do fused versions of ${c2Name}'s rather than normal versions to reduce time spent running ${c2Name}s.</p>`;
				description += `<p><b>Fused ${c2Name}'s: Off</b><br>Stops ${c2Name} Runner from starting any Fused ${c2Name} runs.</p>`;
				description += `<p><b>Fused ${c2Name}'s: Below %</b><br>Will run ${c2Name}s when both challenges are below your <b>${c2Name} Runner: % value</b>.</p>`;
				description += `<p><b>Fused ${c2Name}'s: Any %</b><br>Will run ${c2Name}s when either challenge is below your <b>${c2Name} Runner: % value.</b></p>`;
				description += `<p><b>Recommended:</b> Fused ${_getChallenge2Info()}s: Any %</p>`;
				return description;
			}, 'multitoggle', 0, null, 'C2', [1],
			function () { return (getPageSetting('c2RunnerStart', atConfig.settingUniverse) && getPageSetting('c2RunnerMode', atConfig.settingUniverse) === 0) });

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
				let description = "<p>Enable this to have the script suicide when running <b>Duel</b> by setting equality to 0 when fighting fast enemies with no gamma burst charges to obtain the health buff from being below 20 points.</p>";
				description += "<p>Will only work if the <b>Auto Equality</b> setting is set to <b>Auto Equality: Advanced</b>."
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (getPageSetting('duel', atConfig.settingUniverse) && autoTrimpSettings.duel.require()) });

		createSetting('duelShield',
			function () { return ('D: Shield') },
			function () {
				let description = "<p>The name of the shield you would like to equip while running <b>Duel</b>.</p>";
				description += "<p>This will override all other heirloom swapping features and only use this shield during <b>Duel</b>!</p>"
				description += "<p>Should ideally be a shield without the <b>Crit Chance</b> modifier.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'C2', [2],
			function () { return (getPageSetting('duel', atConfig.settingUniverse) && autoTrimpSettings.duel.require()) });

		createSetting('trapper',
			function () { return (atConfig.settingUniverse === 2 ? 'Trappapalooza' : 'Trapper') },
			function () {
				let description = `<p>Enable this if you want to use automation features when running the <b>${atConfig.settingUniverse === 2 ? 'Trappapalooza' : 'Trapper'}</b> challenge.</p>`;
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1, 2],
			function () { return (atConfig.settingUniverse === 2 ? game.stats.highestRadLevel.valueTotal() >= 60 : game.stats.highestLevel.valueTotal() >= 70) });

		createSetting('trapperCoordStyle',
			function () { return (['T: Coords Owned', 'T: Army Size']) },
			function () {
				let description = "<p>The style you would like purchasing Coordinations to use.</p>";
				description += "<p><b>T: Coords Owned</b><br>Will stop purchasing coordination levels from a certain zone.</p>";
				description += "<p><b>T: Army Size</b><br>Will stop purchasing coordination levels after reaching a certain army size.</p>";
				description += "<p><b>Recommended:</b> T: Coords Owned</p>";
				return description;
			}, 'multitoggle', 0, null, 'C2', [1, 2],
			function () { return (getPageSetting('trapper', atConfig.settingUniverse) && autoTrimpSettings.trapper.require()) });

		createSetting('trapperCoords',
			function () { return ('T: Coords') },
			function () {
				let description = "<p>The zone you would like to stop buying additional <b>Coordination</b> from.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and not have a cap on <b>Coordination</b> purchases.</p>";
				description += "<p>If set to <b>0 or below</b> and not running the " + _getChallenge2Info() + " version of the challenge it will override this and set it to " + (atConfig.settingUniverse === 2 ? '50' : '33') + ".</p>";
				return description;
			}, 'value', -1, null, 'C2', [1, 2],
			function () { return (getPageSetting('trapper', atConfig.settingUniverse) && autoTrimpSettings.trapper.require() && getPageSetting('trapperCoordStyle', atConfig.settingUniverse) === 0) });

		createSetting('trapperArmySize',
			function () { return ('T: Army Size') },
			function () {
				let description = "<p>The army size you would like to stop buying additional <b>Coordination</b> from.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and not have a cap on <b>Coordination</b> purchases. This will cause it to use your current army size plus one coord purchase for trapping calculations.</p>";
				return description;
			}, 'value', -1, null, 'C2', [1, 2],
			function () { return (getPageSetting('trapper', atConfig.settingUniverse) && autoTrimpSettings.trapper.require() && getPageSetting('trapperCoordStyle', atConfig.settingUniverse) === 1) });

		createSetting('trapperTrap',
			function () { return ('T: Disable Trapping') },
			function () {
				let description = "<p>If enabled then trapping (both ingame and through the script) will be disabled when you have the coordination amount input in <b>T: Coords</b> and " + (atConfig.settingUniverse === 2 ? "are currently fighting with that army OR" : "") + " your population is greater than the required amount for that coordination value.</p>";
				description += "<p>To work <b>T: Coords</b> must have an input above 0!</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1, 2],
			function () { return (getPageSetting('trapper', atConfig.settingUniverse) && autoTrimpSettings.trapper.require()) });

		createSetting('trapperArmyPct',
			function () { return ('T: Army Percent') },
			function () {
				let description = "<p>The percentage of owned trimps that you would like to send out when you need a new army.</p>";
				description += "<p>If set to <b>0 or below</b> it will assume this is set to 100% and always send armies if possible.</p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', -1, null, 'C2', [1, 2],
			function () { return (getPageSetting('trapper', atConfig.settingUniverse) && autoTrimpSettings.trapper.require()) });

		createSetting('trapperRespec',
			function () { return ('T: Carp Respec') },
			function () {
				let description = `<p>If enabled, then when Auto Portaling into the <b>${(atConfig.settingUniverse === 2 ? 'Trappapalooza' : 'Trapper')}</b> challenge this will use the ${(atConfig.settingUniverse === 2 ? 'Trappa Carp' :'Trapper² (initial)')} preset then immediately respec into the  ${(atConfig.settingUniverse === 2 ? 'Trappa³' : 'Trapper² (respec)')} preset.</p>`;
				description += "<p>To work, the <b>Auto Allocate Perks</b> setting in the Core tab must be enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1, 2],
			function () { return (getPageSetting('trapper', atConfig.settingUniverse) && autoTrimpSettings.trapper.require()) });
			
		createSetting('trapperShield',
			function () { return ('T: Shield') },
			function () {
				let description = "<p>The name of the shield you would like to equip while running <b>" + (atConfig.settingUniverse === 2 ? 'Trappapalooza' : 'Trapper') + "</b>.</p>";
				description += "<p>This will override all other heirloom swapping features and only use this shield during <b>" + (atConfig.settingUniverse === 2 ? 'Trappapalooza' : 'Trapper') + "</b>!</p>"
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'C2', [1, 2],
			function () { return (getPageSetting('trapper', atConfig.settingUniverse) && autoTrimpSettings.trapper.require()) });

		createSetting('trapperWorldStaff',
			function () { return ('T: World Staff') },
			function () {
				let description = "<p>Staff to use during <b>" + (atConfig.settingUniverse === 2 ? 'Trappapalooza' : 'Trapper') + "</b> when you're not mapping.</p>";
				description += "<p>This will override all other heirloom swapping features when active!</p>";
				description += "<p>Should ideally be a staff with high primary resource modifiers.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'C2', [1, 2],
			function () { return (getPageSetting('trapper', atConfig.settingUniverse) && autoTrimpSettings.trapper.require()) });

		createSetting('mapology',
			function () { return ('Mapology') },
			function () {
				let description = "<p>Enable this if you want to use automation features when running the <b>Mapology</b> challenge.</p>";
				description += "<p>When enabled the <b>PC: Force Prestige Z</b> setting is disabled and any raiding (including Bionic Raiding) settings will climb until the prestige selected in the <b>M: Prestige</b> setting has been obtained.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1],
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
			function () { return (getPageSetting('mapology', atConfig.settingUniverse) && autoTrimpSettings.mapology.require()) });

		createSetting('mapologyMapOverrides',
			function () { return ('Mapology Map Overrides') },
			function () {
				let description = "<p>Enabling this will disable all farming with the exception of Prestige Climb, Prestige Raiding, BW Raiding & Void Maps.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'C2', [1],
			function () { return (getPageSetting('mapology', atConfig.settingUniverse) && autoTrimpSettings.mapology.require()) });

		createSetting('lead',
			function () { return ('Lead') },
			function () {
				let description = "<p>Enabling this will disable mapping when on an even zone or below cell 90 to ensure the enemies Momentum buff is as weak as possible.</p>";
				description += "<p>If you are in a Spire or the final zone of a nature band then it will map on that zone even if it is an even zone.</p>";
				description += "<p>Be careful with how you setup your mapping when this is enabled as it will skip mapping lines that are set to run on even zones!</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1],
			function () { return (game.stats.highestLevel.valueTotal() >= 180) });

		createSetting('frigid',
			function () { return ('Frigid') },
			function () {
				let description = "<p>When you have warmth stacks this will disable all forms of mapping except for Void Maps from being run.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1],
			function () { return (((!getPageSetting('c2DisableFinished', atConfig.settingUniverse) || game.global.frigidCompletions < 15) && game.stats.highestLevel.valueTotal() >= 460) || challengeActive('Frigid')) });

		createSetting('frigidSwapZone',
			function () { return ('F: Heirloom Swap Zone') },
			function () {
				let description = "<p>The zone you'd like to swap to your afterpush shield during Frigid.</p>";
				description += "<p>This overrides the " + _getChallenge2Info() + " heirloom swap setting input when set above <b>0</b>.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'C2', [1],
			function () { return (getPageSetting('frigid', atConfig.settingUniverse) && autoTrimpSettings.frigid.require()) });

		createSetting('frigidAutoPortal',
			function () { return ([`F: Portal On Finish: Off`, `F: Portal On Finish: On`, `F: Portal On Finish: After Voids`]) },
			function () {
				let description = "<p>Will allow you to force Auto Portal to run when the Frigd challenge is finished.</p>";
				description += `<p><b>M: Portal On Finish: Off</b><br>Disables this setting entirely.</p>`;
				description += `<p><b>M: Portal On Finish: On</b><br>Auto Portal upon finishing the challenge.</p>`;
				description += `<p><b>M: Portal On Finish: After Voids</b><br>When you finish the challenge, this will run void maps then Auto Portal.</p>`;
				return description;
			}, 'multitoggle', 0, null, 'C2', [1],
			function () { return (getPageSetting('frigid', atConfig.settingUniverse) && autoTrimpSettings.frigid.require()) });

		createSetting('experience',
			function () { return ('Experience') },
			function () {
				let description = "<p>Enable this if you want to use automation features when running the <b>Experience</b> challenge.</p>";
				description += "<p>This setting is dependant on using <b>Bionic Raiding</b> in conjunction with it if you the Bionic Wonderland level you finish with to be higher than 605.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [1],
			function () { return ((game.stats.highestLevel.valueTotal() >= 600) || challengeActive('Experience')) });

		createSetting('experienceStartZone',
			function () { return ('E: Start Zone') },
			function () {
				let description = "<p>The zone you would like to start mapping for Wonders at.</p>";
				description += "<p>If set below 300 it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 500 to start and lower over time</p>";
				return description;
			}, 'value', -1, null, 'C2', [1],
			function () { return (getPageSetting('experience', atConfig.settingUniverse) && autoTrimpSettings.experience.require()) });

		createSetting('experienceStaff',
			function () { return ('E: Wonder Staff') },
			function () {
				let description = "<p>The staff you would like to use whilst farming for Wonders.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated pet xp staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'C2', [1],
			function () { return (getPageSetting('experience', atConfig.settingUniverse) && autoTrimpSettings.experience.require()) });

		createSetting('experienceEndZone',
			function () { return ('E: End Zone') },
			function () {
				let description = "<p>Will run the Bionic Wonderland map level specified in <b>E: End BW</b> at this zone.</p>";
				description += "<p>If set below 601 it will automatically set this to 601 so set it above that if necessary.</p>";
				description += "<p><b>Recommended:</b> 605 to start and increase over time</p>";
				return description;
			}, 'value', -1, null, 'C2', [1],
			function () { return (getPageSetting('experience', atConfig.settingUniverse) && autoTrimpSettings.experience.require()) });

		createSetting('experienceEndBW',
			function () { return ('E: End BW') },
			function () {
				let description = "<p>Will finish the challenge with this Bionic Wonderland level once reaching the end zone specified in <b>E: End Zone</b>.</p>";
				description += "<p><b>If the specified BW is not available, it will run the one closest to the setting.</b></p>";
				description += "<p>When active and above zone 600 this will disable <b>BW Raiding Settings</b> until the <b>Experience</b> challenge has been completed.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting and use Bionic Raiding settings instead to end the challenge.</p>";
				description += "<p><b>Recommended:</b> 605 to start and increase over time</p>";
				return description;
			}, 'value', -1, null, 'C2', [1],
			function () { return (getPageSetting('experience', atConfig.settingUniverse) && autoTrimpSettings.experience.require()) });

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
				let description = "<p>Enable this to force farming until you are guaranteed to not Wither on your current world enemy.</p>";
				description += "<p>When at cell 100 it will identify the damage required for reaching the speedbook on the next zone and if you don't have enough damage it will farm until you do.</p>";
				description += "<p>This setting will usually overfarm as it assumes a minimum damage roll with no crits.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (getPageSetting('wither', atConfig.settingUniverse) && autoTrimpSettings.wither.require()) });

		createSetting('witherMapLevel',
			function () { return (['W: Map Level: Negative', 'W: Map Level: Map Bonus', 'W: Map Level: Positive']) },
			function () {
				let description = "<p>This allows map settings to use positive map levels during Wither when using Auto Level. In most situations this is detrimental as enemies will gain more stacks of Horror so use at your own risk.</p>";
				description += `<p><b>W: Map Level: Negative</b><br>Stops the script from using positive map levels outside of the <b>Map Bonus</b> setting during Wither.</p>`;
				description += `<p><b>W: Map Level: Map Bonus</b><br>Allows the <b>Hits Survived & HD Farm</b>, <b>Hits Survived</b> and the <b>Map Bonus Stacks</b> settings to run positive map levels until you have max map bonus stacks.</p>`;
				description += `<p><b>W: Map Level: Positive</b><br>Lets all map settings use positive maps.</p>`;
				description += "<p><b>Recommended:</b> W: Map Level: Negative</p>";
				return description;
			}, 'multitoggle', 0, null, 'C2', [2],
			function () { return (getPageSetting('wither', atConfig.settingUniverse) && autoTrimpSettings.wither.require()) });

		createSetting('witherZones',
			function () { return ('W: Wither Zone(s)') },
			function () {
				let description = "<p>Input the zone(s) you would like to Wither on and the script won't farm damage on this and at the end of the previous zone.</p>";
				description += "<p>You can input multiple zones but they need to be seperated by commas.</p>";
				description += "<p>There is a chance you might not Wither on the zones input if you are too powerful.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				return description;
			}, 'multiValue', [-1], null, 'C2', [2],
			function () { return (getPageSetting('wither', atConfig.settingUniverse) && autoTrimpSettings.wither.require()) });

		createSetting('witherDisableMapping',
			function () { return ('W: Disable Withered Mapping') },
			function () {
				let description = "<p>Enabling this setting will disable mapping when you have the <b>Wither Immunity</b> buff.</p>";
				description += "<p>If you have <b>Auto Maps</b> enabled and you are running a map when your trimps wither then it will exit that map and return to the world.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (getPageSetting('wither', atConfig.settingUniverse) && autoTrimpSettings.wither.require()) });

		createSetting('witherShield',
			function () { return ('W: Shield') },
			function () {
				let description = "<p>The name of the shield you would like to equip while running <b>Wither</b>.</p>";
				description += "<p>This will override all other heirloom swapping features and only use this shield during <b>Wither</b>!</p>"
				description += "<p>Should ideally be a shield without the <b>Plaguebringer</b> modifier.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'C2', [2],
			function () { return (getPageSetting('wither', atConfig.settingUniverse) && autoTrimpSettings.wither.require()) });

		createSetting('witherMutatorPreset',
			function () { return ('W: Mutator Preset') },
			function () {
				let mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));
				if (!mutatorObj || !mutatorObj.titles) mutatorObj = _mutatorDefaultObj()

				let description = `<p>When both <b>Preset Swap Mutators</b> and this setting are enabled it will load load Preset 4${mutatorObj['Preset 4'].name !== 'Preset 4' ? " (" + mutatorObj['Preset 4'].name + ")" : ''} when portaling into <b>Wither</b>.</p>`;
				description += "<p>Due to Overkill being disabled in this challenge it's wise to go for minimal overkill mutations during it.</p>"
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (getPageSetting('wither', atConfig.settingUniverse) && autoTrimpSettings.wither.require()) });

		createSetting('quest',
			function () { return ('Quest') },
			function () {
				let description = "<p>Enable this if you want automate running quests when running the <b>Quest</b> challenge.</p>";
				description += "<p>Will only function properly with <b>Auto Maps</b> enabled.</p>";
				description += "<p>Prestige Raiding is disabled when shield break quests are active to try and ensure you don't die.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 85) });

		createSetting('questMapCap',
			function () { return ('Q: Map Cap') },
			function () {
				let description = "<p>The maximum amount of maps you'd like to run to do a resource or one shot enemies quest.</p>";
				description += "<p><b>Will potentially skip completing quests if this value is too low!</b></p>";
				description += "<p>During one shot quests it will farm until either you reach the map cap or have enough damage for the quest.</p>";
				description += "<p><b>Recommended:</b> 100</p>";
				return description;
			}, 'value', 100, null, 'C2', [2],
			function () { return (getPageSetting('quest', atConfig.settingUniverse) && autoTrimpSettings.quest.require()) });

		createSetting('questSmithyZone',
			function () { return ('Q: Smithy Zone') },
			function () {
				let description = "<p>Will calculate the smithies required for quests based on this settings input and purchase spare ones if possible.</p>";
				description += "<p><b>Will assume zone 85 when running the regular version of Quest.</b></p>";
				description += "<p><b>Will disable the Smithy Farm setting whilst your world zone is below this value.</b></p>";
				description += "<p>This setting requires <b>AT Auto Structure</b> to be enabled to work.</p>";
				description += "<p><b>Recommended:</b> Your desired end zone for Quest</p>";
				return description;
			}, 'value', 999, null, 'C2', [2],
			function () { return (getPageSetting('quest', atConfig.settingUniverse) && autoTrimpSettings.quest.require()) });

		createSetting('questSmithyMaps',
			function () { return ('Q: Smithy Maps') },
			function () {
				let description = "<p>The maximum amount of maps you'd like to run to do a Smithy quest.</p>";
				description += "<p><b>Will potentially skip Smithy quests if this value is too low!</b></p>";
				description += "<p>This setting requires <b>AT Auto Structure</b> to be enabled to work.</p>";
				description += "<p><b>Recommended:</b> 100</p>";
				return description;
			}, 'value', 100, null, 'C2', [2],
			function () { return (getPageSetting('quest', atConfig.settingUniverse) && autoTrimpSettings.quest.require()) });

		createSetting('questSmithySpire',
			function () { return ('Q: Spire Smithys') },
			function () {
				let description = "<p>The amount of Smithies you'd like to buy up to when inside of a Spire.</p>";
				description += "<p>This setting requires <b>AT Auto Structure</b> to be enabled to work.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 20</p>";
				return description;
			}, 'value', -1, null, 'C2', [0],
			function () { return (getPageSetting('quest', atConfig.settingUniverse) && autoTrimpSettings.quest.require() && game.stats.highestRadLevel.valueTotal() >= 270) });

		createSetting('mayhem',
			function () { return ('Mayhem') },
			function () {
				let description = "<p>Enable this if you want to automate destacking and other features when running the <b>Mayhem</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () {
				return (((!getPageSetting('c2DisableFinished', atConfig.settingUniverse) || game.global.mayhemCompletions < 25) && game.stats.highestRadLevel.valueTotal() >= 100) || challengeActive('Mayhem'))
			});

		createSetting('mayhemDestack',
			function () { return ('M: HD Ratio') },
			function () {
				let description = "<p>What HD ratio cut-off to use when farming for the Improbability. If this setting is 100, the script will destack until you can kill the Improbability in 100 average hits or there are no Mayhem stacks remaining to clear.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', atConfig.settingUniverse) && autoTrimpSettings.mayhem.require()) });

		createSetting('mayhemZone',
			function () { return ('M: Zone') },
			function () {
				let description = "<p>The zone you'd like to start destacking from, can be used in conjunction with <b>M: HD Ratio</b> but when you're at or above this zone it will clear stacks until 0 are remaining regardless of the value set in <b>M: HD Ratio</b>.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', atConfig.settingUniverse) && autoTrimpSettings.mayhem.require()) });

		createSetting('mayhemMapIncrease',
			function () { return ('M: Map Increase') },
			function () {
				let description = "<p>Increases the minimum map level of Mayhem farming by this value.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and assume a map increase of 0.</p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', atConfig.settingUniverse) && autoTrimpSettings.mayhem.require()) });

		createSetting('mayhemMP',
			function () { return ('M: Melting Point') },
			function () {
				let description = "<p>The amount of smithies you'd like to run Melting Point at during Mayhem.</p>";
				description += "<p>This overrides the Smithy unique map settings input when set above <b>0</b>.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', atConfig.settingUniverse) && autoTrimpSettings.mayhem.require()) });

		createSetting('mayhemSwapZone',
			function () { return ('M: Heirloom Swap Zone') },
			function () {
				let description = "<p>The zone you'd like to swap to your afterpush shield on Mayhem.</p>";
				description += "<p>This overrides the " + _getChallenge2Info() + " heirloom swap setting input when set above <b>0</b>.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', atConfig.settingUniverse) && autoTrimpSettings.mayhem.require()) });

		createSetting('mayhemAutoPortal',
			function () { return ([`M: Portal On Finish: Off`, `M: Portal On Finish: On`, `M: Portal On Finish: After Voids`]) },
			function () {
				let description = "<p>Will allow you to force Auto Portal to run when the Mayhem challenge is finished.</p>";
				description += `<p><b>M: Portal On Finish: Off</b><br>Disables this setting entirely.</p>`;
				description += `<p><b>M: Portal On Finish: On</b><br>Auto Portal upon finishing the challenge.</p>`;
				description += `<p><b>M: Portal On Finish: After Voids</b><br>When you finish the challenge, this will run void maps then Auto Portal.</p>`;
				return description;
			}, 'multitoggle', 0, null, 'C2', [2],
			function () { return (getPageSetting('mayhem', atConfig.settingUniverse) && autoTrimpSettings.mayhem.require()) });

		createSetting('storm',
			function () { return ('Storm') },
			function () {
				let description = "<p>Enable this if you want to automate destacking when running the <b>Storm</b> challenge.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
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
			function () { return (getPageSetting('storm', atConfig.settingUniverse) && autoTrimpSettings.storm.require()) });

		createSetting('stormStacks',
			function () { return ('S: Stacks') },
			function () {
				let description = "<p>Minimal amount of stacks to reach before starting destacking</p>";
				description += "<p>Once it starts destacking it will destack until you have no Cloudy stacks remaining.</p>";
				description += "<p>If set to <b>0 or below</b> it will never destack.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('storm', atConfig.settingUniverse) && autoTrimpSettings.storm.require()) });

		createSetting('berserk',
			function () { return ('Berserk') },
			function () {
				let description = "<p>Enable this if you want the script to perform additional actions during the <b>Berserk</b> challenge.</p>";
				description += "<p>If enabled it will only allows mapping settings with a Berserk challenge line to be run.</p>";
				description += "<p>If your army dies then it will go into a level 6 map and farm until you have max Frenzied stacks to ensure you're always the strongest you can be. It <b>will</b> abandon maps that are in the middle of being run to go obtain these stacks!</p>";
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
			function () { return (getPageSetting('berserk', atConfig.settingUniverse) && autoTrimpSettings.berserk.require()) });

		createSetting('pandemonium',
			function () { return ('Pandemonium') },
			function () {
				let description = "<p>Enable this if you want to automate destacking and other features when running the <b>Pandemonium</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";;
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (((!getPageSetting('c2DisableFinished', atConfig.settingUniverse) || game.global.pandCompletions < 25) && game.stats.highestRadLevel.valueTotal() >= 150) || challengeActive('Pandemonium')) });

		createSetting('pandemoniumDestack',
			function () { return ('P: HD Ratio') },
			function () {
				let description = "<p>What HD ratio cut-off to use when farming for the Improbability. If this setting is 100, the script will destack until you can kill the Improbability in 100 average hits or there are no Pandemonium stacks remaining to clear.</p>";
				description += "<p>Destacking will use Fast Attack maps when you don't have <b>Hyperspeed 2</b> for your current zone otherwise it will use Large Metal Cache maps.</p>"
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', 10, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', atConfig.settingUniverse) && autoTrimpSettings.pandemonium.require()) });

		createSetting('pandemoniumZone',
			function () { return ('P: Destack Zone') },
			function () {
				let description = "<p>The zone you'd like to start destacking from, can be used in conjunction with <b>P: HD Ratio</b> but when you're at or above this zone it will clear stacks until 0 are remaining regardless of the value set in <b>P: HD Ratio</b>.</p>";
				description += "<p>Destacking will use Fast Attack maps when you don't have <b>Hyperspeed 2</b> for your current zone otherwise it will use Large Metal Cache maps.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', atConfig.settingUniverse) && autoTrimpSettings.pandemonium.require()) });

		createSetting('pandemoniumAE',
			function () { return (['P Auto Equip: Off', 'P Auto Equip: On', 'P Auto Equip: Large Metal Cache', 'P Auto Equip: Huge Cache']) },
			function () {
				let description = "<p>This setting provides some equipment farming possibilites to help speed your runs up.</p>";
				description += "<p><b>Will override equipment purchasing settings when enabled.</b></p>";
				description += "<p>When farming it calculates the equips you'll be able to prestige and farms levels in the other items first then prestiges and upgrades them one at a time to ensure minimal power loss.</p>";
				description += "<p><b>P: Auto Equip: Off</b><br>Disables this setting.</p>";
				description += "<p><b>P: Auto Equip: On</b><br>Will automatically purchase equipment during Pandemonium regardless of efficiency.</p>";
				description += "<p><b>P: Auto Equip: Large Metal Cache</b><br>Provides settings to run maps if the cost of equipment levels is less than a single large metal cache. Overrides worker settings to ensure that you farm as much metal as possible.</p>";
				description += "<p><b>P: Auto Equip: Huge Cache</b><br>Works the same as <b>P Auto Equip: Large Metal Cache</b> but switches to <b>Huge Cache</b> maps for extra resources when a <b>Large Metal Cache</b> can no longer guarantee any equipment levels. Automatically switches between caches depending on the cost of equipment to ensure a fast farming speed.</p>";
				description += "<p>When using either of the cache farming options it will only farm when above cell 91 and below zone 150.</p>";
				description += "<p><b>Recommended:</b> P Auto Equip: Large Metal Cache</p>";
				return description;
			}, 'multitoggle', 0, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', atConfig.settingUniverse) && autoTrimpSettings.pandemonium.require()) });

		createSetting('pandemoniumAEZone',
			function () { return ('P AE: Zone') },
			function () {
				let description = "<p>The zone you would like to start equipment farming from.</p>";
				description += "<p>Will only farm for equipment levels when above cell 91 and below zone 150.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting and always farm if equips are attainable through farming.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', atConfig.settingUniverse) && autoTrimpSettings.pandemonium.require() && getPageSetting('pandemoniumAE', atConfig.settingUniverse) > 1) });

		createSetting('pandemoniumAERatio',
			function () { return ('P AE: HD Ratio') },
			function () {
				let description = "<p>Only farm for equipment when your <b>World HD Ratio</b> is above this value.</p>";
				description += "<p>Will only farm for equipment levels when above cell 91 and below zone 150.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting and always farm if equips are attainable through farming.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', atConfig.settingUniverse) && autoTrimpSettings.pandemonium.require() && getPageSetting('pandemoniumAE', atConfig.settingUniverse) > 1) });

		createSetting('pandemoniumStaff',
			function () { return ('P: Staff') },
			function () {
				let description = "<p>The name of the staff you would like to equip while Pandemonium does equipment farming.</p>";
				description += "<p><b>Should ideally be a full metal efficiency staff.</b></p>";
				return description;
			}, 'textValue', 'undefined', null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', atConfig.settingUniverse) && autoTrimpSettings.pandemonium.require() && getPageSetting('pandemoniumAE', atConfig.settingUniverse) > 1) });

		createSetting('pandemoniumMP',
			function () { return ('P: Melting Point') },
			function () {
				let description = "<p>The amount of smithies you'd like to run Melting Point at during Pandemonium.</p>";
				description += "<p>This overrides the Smithy unique map settings input when set above <b>0</b>.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', atConfig.settingUniverse) && autoTrimpSettings.pandemonium.require()) });

		createSetting('pandemoniumSwapZone',
			function () { return ('P: Heirloom Swap Zone') },
			function () {
				let description = "<p>The zone you'd like to swap to your afterpush shield on Pandemonium.</p>";
				description += "<p>This overrides the " + _getChallenge2Info() + " heirloom swap setting input when set above <b>0</b>.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', atConfig.settingUniverse) && autoTrimpSettings.pandemonium.require()) });

		createSetting('pandemoniumAutoPortal',
			function () { return ([`P: Portal On Finish: Off`, `P: Portal On Finish: On`, `P: Portal On Finish: After Voids`]) },
			function () {
				let description = "<p>Will allow you to force Auto Portal to run when the Pandemonium challenge is finished.</p>";
				description += `<p><b>M: Portal On Finish: Off</b><br>Disables this setting entirely.</p>`;
				description += `<p><b>M: Portal On Finish: On</b><br>Auto Portal upon finishing the challenge.</p>`;
				description += `<p><b>M: Portal On Finish: After Voids</b><br>When you finish the challenge, this will run void maps then Auto Portal.</p>`;
				return description;
			}, 'multitoggle', 0, null, 'C2', [2],
			function () { return (getPageSetting('pandemonium', atConfig.settingUniverse) && autoTrimpSettings.pandemonium.require()) });

		createSetting('glass',
			function () { return ('Glass') },
			function () {
				let description = "<p>Enable this if you want settings automate destacking and farming when running the <b>Glass</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 175) });

		createSetting('glassFarm',
			function () { return ('G: Farm') },
			function () {
				let description = "<p>Enable this to automate damage farming when you don't have enough damage to clear Glass stacks in a world level map.</p>";
				description += "<p>When at cell 100 of a zone it will identify the damage required to kill enemies in a world level map on the next zone and farms if you can't.</p>";
				description += "<p>This setting will usually overfarm as it assumes a minimum damage roll with no crits.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'C2', [2],
			function () { return (getPageSetting('glass', atConfig.settingUniverse) && autoTrimpSettings.glass.require()) });

		createSetting('glassStacks',
			function () { return ('G: Stacks') },
			function () {
				let description = "<p>Minimal amount of stacks to reach before starting destacking</p>";
				description += "<p>Once it starts destacking it will destack until you have no Glass stacks remaining.</p>";
				description += "<p><b>Recommended:</b> 10</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('glass', atConfig.settingUniverse) && autoTrimpSettings.glass.require()) });

		createSetting('desolation',
			function () { return ('Desolation') },
			function () {
				let description = "<p>Enable this if you want to automate destacking and other features when running the <b>Desolation</b> challenge.</p>";
				description += "<p>Once this starts destacking it will destack until you have no chilled stacks remaining.</p>";
				description += "<p>If enabled then this will <b>always</b> reduce your chilled stacks to 0 before doing any other form of mapping.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (((!getPageSetting('c2DisableFinished', atConfig.settingUniverse) || game.global.desoCompletions < 25) && game.stats.highestRadLevel.valueTotal() >= 200) || challengeActive('Desolation')) });

		createSetting('desolationDestack',
			function () { return ('D: HD Ratio') },
			function () {
				let description = "<p>At what HD ratio destacking should be considered.</p>";
				description += "<p>Must be used in conjunction with <b>D: Stacks</b>.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 0.0001</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', atConfig.settingUniverse) && autoTrimpSettings.desolation.require()) });

		createSetting('desolationZone',
			function () { return ('D: Zone') },
			function () {
				let description = "<p>From which zone destacking should be considered.</p>";
				description += "<p>Must be used in conjunction with <b>D: Stacks</b>.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', atConfig.settingUniverse) && autoTrimpSettings.desolation.require()) });

		createSetting('desolationStacks',
			function () { return ('D: Stacks') },
			function () {
				let description = "<p>Minimal amount of stacks to reach before starting destacking</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and automatically destack at 300 stacks.</p>";
				description += "<p>Once it starts destacking it will destack until you have no Chilled stacks remaining.</p>";
				description += "<p><b>Recommended:</b> 300</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', atConfig.settingUniverse) && autoTrimpSettings.desolation.require()) });

		createSetting('desolationOnlyDestackZone',
			function () { return ('D: Only Destack Z') },
			function () {
				let description = "<p>From which zone only destacking should be considered. This will stop it caring about farming for metal to improve equipment levels.</p>";
				description += "<p>Purchases the highest level of map that you can afford and survive to reduce chilled stacks faster.</p>";
				description += "<p>Disables perfect maps and sets sliders to minimum for all options to reduce fragment spending.</p>";
				description += "<p>If using <b>Auto Equality: Advanced</b> will set your equality level to the max it can be whilst destacking."
				description += "<p><b>Recommended:</b> 20 below Desolation end zone or when you stop clearing your destacking maps.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', atConfig.settingUniverse) && autoTrimpSettings.desolation.require()) });

		createSetting('desolationSpecial',
			function () { return ('D: Hyperspeed 2 LMC') },
			function () {
				let description = "<p>If enabled this will use the Large Metal Cache special rather than not using a special modifier when destacking on zones that you have the <b>Hyperspeed 2</b> talent active.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'C2', [2],
			function () { return (getPageSetting('desolation', atConfig.settingUniverse) && autoTrimpSettings.desolation.require()) });

		createSetting('desolationMP',
			function () { return ('D: Melting Point') },
			function () {
				let description = "<p>The amount of smithies you'd like to run Melting Point at during Desolation.</p>";
				description += "<p>This overrides the Smithy unique map settings input when set above <b>0</b>.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', atConfig.settingUniverse) && autoTrimpSettings.desolation.require()) });

		createSetting('desolationStaff',
			function () { return ('D: World Staff') },
			function () {
				let description = "<p>The name of the staff you would like to equip while not mapping during Desolation.</p>";
				description += "<p><b>Should ideally be a full efficiency and fragment drop staff.</b></p>";
				return description;
			}, 'textValue', 'undefined', null, 'C2', [2],
			function () { return (getPageSetting('desolation', atConfig.settingUniverse) && autoTrimpSettings.desolation.require()) });

		createSetting('desolationSwapZone',
			function () { return ('D: Heirloom Swap Zone') },
			function () {
				let description = "<p>The zone you'd like to swap to your afterpush shield on Desolation.</p>";
				description += "<p>This overrides the " + _getChallenge2Info() + " heirloom swap setting input when set above <b>0</b>.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('desolation', atConfig.settingUniverse) && autoTrimpSettings.desolation.require()) });

		createSetting('desolationAutoPortal',
			function () { return ([`D: Portal On Finish: Off`, `D: Portal On Finish: On`, `D: Portal On Finish: After Voids`]) },
			function () {
				let description = "<p>Will allow you to force Auto Portal to run when the Desolation challenge is finished.</p>";
				description += `<p><b>M: Portal On Finish: Off</b><br>Disables this setting entirely.</p>`;
				description += `<p><b>M: Portal On Finish: On</b><br>Auto Portal upon finishing the challenge.</p>`;
				description += `<p><b>M: Portal On Finish: After Voids</b><br>When you finish the challenge, this will run void maps then Auto Portal.</p>`;
				return description;
			}, 'multitoggle', 0, null, 'C2', [2],
			function () { return (getPageSetting('desolation', atConfig.settingUniverse) && autoTrimpSettings.desolation.require()) });

		createSetting('desolationMutatorPreset',
			function () { return ('D: Mutator Preset') },
			function () {
				let mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));
				if (!mutatorObj || !mutatorObj.titles) mutatorObj = _mutatorDefaultObj()

				let description = `<p>When both the <b>Preset Swap Mutators</b> and this setting are enabled then when portaling into <b>Desolation</b> it will load Preset 5${mutatorObj['Preset 5'].name !== 'Preset 5' ? " (" + mutatorObj['Preset 5'].name + ")" : ''}.</p>`;
				description += "<p>Due to liquification being important for the start of this challenge to reach Explorers faster it can be wise to go for full liquification mutations during it.</p>"
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (getPageSetting('desolation', atConfig.settingUniverse) && autoTrimpSettings.desolation.require()) });

		createSetting('desolationSettings',
			function () { return ('Desolation Settings') },
			function () {
				let description = "<p>Here you can select how and when you would like to prestige scum equipment whilst running <b>Desolation</b>.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p><b>This definitely shouldn't exist so be aware this is exploiting unintentional game mechanics.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Desolation Gear Scumming")', 'C2', [2],
			function () { return (getPageSetting('desolation', atConfig.settingUniverse) && autoTrimpSettings.desolation.require()) });

		createSetting('smithless',
			function () { return ('Smithless') },
			function () {
				let description = "<p>Enable this if you want to automate farming to obtain maximum Enhanced Armor stacks against Ubersmiths when running the <b>Smithless</b> challenge.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'C2', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 201) });

		createSetting('smithlessFarmTime',
			function () { return ('S: Max Farm Time') },
			function () {
				let description = "<p>The max amount of time in minutes you'd like to farm for stats.</p>";
				description += "<p>This will identify breakpoints that can be reached with max tenacity and map bonus to figure out how many stacks you are able to obtain from an Ubersmith and if any are attainable, it will farm until you have enough damage.</p>";
				description += "<p>Set to <b>0</b> to disable farming.</p>";
				description += "<p>Set to <b>-1 or below</b> to farm forever.</p>";
				return description;
			}, 'value', -1, null, 'C2', [2],
			function () { return (getPageSetting('smithless', atConfig.settingUniverse) && autoTrimpSettings.smithless.require()) });

		createSetting('smithlessMapBonus',
			function () { return ('S: Max Map Bonus') },
			function () {
				let description = "<p>Will get max map bonus stacks when fighting against an Ubersmith.</p>";
				description += "<p>It will still obtain map bonus stacks even if you disable or go past the time input in the <b>S: Max Farm Time</b> setting.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'C2', [2],
			function () { return (getPageSetting('smithless', atConfig.settingUniverse) && autoTrimpSettings.smithless.require()) });
	}
	
	const displayDaily = true
	if (displayDaily) {
		createSetting('heliumyPercent',
			function () {
				return ('Buy ' + (atConfig.settingUniverse === 2 ? "Radonculous" : "Heliumy") + ' %')
			},
			function () {
				let description = "<p>Buys the <b>" + (atConfig.settingUniverse === 2 ? "Radonculous" : "Heliumy") + "</b> bonus for <b>100 bones</b> when the daily bonus is above this value.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1.</p>";
				return description;
			}, 'value', -1, null, 'Daily', [1, 2]);

		createSetting('bloodthirstDestack',
			function () { return ('Bloodthirst Destack') },
			function () {
				let description = "<p>Will automatically run a level 6 map when you are one bloodthirst stack (death) away from the enemy fully healing and gaining additional attack.</p>";
				description += "<p><b>Won't function without Auto Maps enabled.</b></p>"
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Daily', [1, 2]);

		createSetting('bloodthirstMaxStacks',
			function () { return ('Bloodthirst Time To Kill Check') },
			function () {
				let description = "<p>When mapping on a daily with the <b>bloodthirst</b> modifier, this will make Auto Equality check if you can kill your current enemy in less hits (gamma bursts) than it takes for it to heal from bloodthirst stack accumulation.<br>";
				description += "If you won't kill the enemy fast enough then it suicides your trimps until the enemy has max Bloodthirst stacks.</p>";
				description += "<p>Will only work if the <b>Auto Equality</b> setting is set to <b>Auto Equality: Advanced</b>."
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Daily', [2]);

		createSetting('bloodthirstVoidMax',
			function () { return ('Void: Max Bloodthirst') },
			function () {
				let description = "<p>Makes your Void HD Ratio assume you have max bloodthirst stacks active if you're in a bloodthirst daily.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1, 2]);

		createSetting('empowerAutoEquality',
			function () { return ('AE: Empower') },
			function () {
				let description = "<p>When the empower mod is active it will automatically adjust the scripts calculations for enemy stats to factor in either explosive or crit modifiers if they're active on the current daily.</b></p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', true, null, 'Daily', [2],
			function () { return (getPageSetting('equalityManagement') === 2) });

		createSetting('dailyMutatorPreset',
			function () { return ('D: Plagued Mutator Preset') },
			function () {
				let mutatorObj = JSON.parse(localStorage.getItem('mutatorPresets'));
				if (!mutatorObj || !mutatorObj.titles) mutatorObj = _mutatorDefaultObj()

				let description = `<p>When both the <b>Preset Swap Mutators</b> and this setting are enabled then when portaling into <b>Daily</b> challenges that have the <b>Plagued</b> modifier it will load Preset 6${mutatorObj['Preset 6'] && mutatorObj['Preset 6'].name !== 'Preset 6' ? " (" + mutatorObj['Preset 6'].name + ")" : ''}.</p>`;
				description += "<p>Due to overkill (when it can reach z300) being important to clearing the Spire faster than the Plagued debuff kills you it can be beneficial to go for full overkill and liquification mutations during dailies with the Plagued modifier.</p>"
				return description;
			}, 'boolean', false, null, 'Daily', [2],
			function () { return (game.stats.highestRadLevel.valueTotal() >= 270) });
			
		createSetting('mapOddEvenIncrement',
			function () { return ('Odd/Even Increment') },
			function () {
				let description = "<p>Will automatically increment your farming settings world input by 1 if the current zone has a negative even or odd related buff. If the daily has both types of mods then it will try to identify which one is worse and skip farming on that zone type.</b></p>";
				description += "<p>Will only impact the following settings: Heirloom Swap Zone, Void Maps, Map Farm" + (atConfig.settingUniverse === 2 ? ", Tribute Farm, Worshipper Farm, Smithy Farm." : ".") + "</p>";
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

		createSetting('dailyPortalStart',
			function () { return ('Auto Start Daily') },
			function () {
				let description = "<p>When you portal with this on it will start a daily for you if there's any available. Will select the oldest daily available and run it.</p>";
				description += "<p><b>Recommended:</b> Only on when you want to run dailies</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1, 2]);

		createSetting('dailyPortal',
			function () { return [`Daily Portal: Off`, `Daily Portal: ${_getPrimaryResourceInfo().abv}/Hr`, `Daily Portal: Custom`, `Daily Portal: Abandon`] },
			function () {
				let description = `<p>Will automatically portal into different challenges depending on the way you setup the Daily Portal settings. The challenge that it portals into can be setup through the <b>Auto Portal</b> setting in the <b>Core</b> tab.</p>`;
				description += `<p>Additional settings appear when <b>Daily Portal: ${_getPrimaryResourceInfo().abv}/Hr</b> or <b>Daily Portal: Custom</b> are selected.</p>`;
				description += `<p><b>Daily Portal: Off</b><br>Disables this setting. Be warned it will never end your dailies unless you use the <b>Portal After</b> option in <b>Void Map Settings!</b></p>`;
				description += `<p><b>Daily Portal: ${_getPrimaryResourceInfo().abv}/Hr</b><br>Portals into new runs when your ${_getPrimaryResourceInfo().name.toLowerCase()} per hour goes below your current runs best ${_getPrimaryResourceInfo().name.toLowerCase()} per hour.</p>`;
				description += `<p>There is a <b>Buffer</b> setting, which lowers the check from best ${_getPrimaryResourceInfo().name.toLowerCase()} per hour to (best - buffer setting) ${_getPrimaryResourceInfo().name.toLowerCase()} per hour.</p>`;
				description += `<p><b>Daily Portal: Custom</b><br>Will portal into your Auto Portal challenge at the zone specified in the <b>Daily Portal Zone</b> setting.</p>`;
				description += `<p><b>Daily Portal: Abandon</b><br>Will finish your daily run at the zone specified in the <b>Daily Abandon Zone</b> setting. You will need to use the regular Auto Portal to portal when using this and the <b>Filler Run</b> setting will be disabled.</p>`;
				description += `<p><b>Recommended:</b> ${atConfig.settingUniverse === 2 ? "Daily Portal: Custom with a specified endzone to make use of Scruffy's level 3 ability" : `Daily Portal: ${_getPrimaryResourceInfo().abv}/Hr`}</p>`;
				return description;
			}, 'multitoggle', 0, null, 'Daily', [1, 2]);

		createSetting('dailyPortalZone',
			function () { return ('Daily Portal Zone') },
			function () {
				let description = "<p>Will automatically portal once this zone is reached when using the <b>Daily Portal: Custom</b> setting.</p>";
				description += "<p><b>Recommended:</b> The zone you would like your run to end</p>";
				return description;
			}, 'value', 999, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', atConfig.settingUniverse) === 2) });

		createSetting('dailyAbandonZone',
			function () { return ('Daily Abandon Zone') },
			function () {
				let description = "<p>Will automatically abandon your daily once this zone is reached when using the <b>Daily Portal: Abandon</b> Auto Portal setting.</p>";
				description += "<p>Setting this to <b>200</b> would abandon when you <b>reach</b> zone 200.</p>";
				description += "<p><b>Recommended:</b> The zone you would like your daily to end</p>";
				return description;
			}, 'value', 999, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', atConfig.settingUniverse) === 3) });

		createSetting('dailyDontPortalBefore',
			function () { return ("Daily: Don't Portal Before") },
			function () {
				let description = "<p>Will stop the script from automatically portaling before the specified zone when using the <b>Daily Portal: " + _getPrimaryResourceInfo().abv + "/Hr</b> Auto Portal setting.</p>";
				description += "<p>It is an additional check that prevents drops in " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour from triggering Auto Portal.</p>";
				description += "<p>The portal after checkbox in <b>Void Map Setting</b> will override this and allow portaling before the zone set here.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and allow portaling on any zone.</p>";
				description += "<p><b>Recommended:</b> The minimum zone you would like your run to reach</p>";
				return description;
			}, 'value', 999, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', atConfig.settingUniverse) === 1) });

		createSetting('dailyHeliumHrBuffer',
			function () { return ('Daily: ' + _getPrimaryResourceInfo().abv + '/Hr Buffer %') },
			function () {
				let description = "<p>When using the <b>Daily Portal: " + _getPrimaryResourceInfo().abv + "/Hr</b> Auto Portal setting, it will portal if your " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour drops by this settings % input lower than your best for current run.</p>";
				description += "<p>Allows portaling midzone if you exceed the set buffer amount by 5x. (ie a normal 2% buffer setting would now portal mid-zone if you fall below 10% buffer).</p>";
				description += "<p><b>Set to 0 to disable this setting.</b></p>";
				description += "<p><b>Recommended:</b> 4</p>";
				return description;
			}, 'value', 0, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', atConfig.settingUniverse) === 1) });

		createSetting('dailyHeliumHrPortal',
			function () {
				const hze = game.stats.highestLevel.valueTotal();
				const portalOptions = ['Portal: Immediately', 'Portal: After Voids'];
				if (atConfig.settingUniverse === 1 && hze >= 230) portalOptions.push('Portal: After Poison Voids');
				return portalOptions;
			},
			function () {
				let description = "<p>How you would like to portal when below your " + _getPrimaryResourceInfo().name.toLowerCase() + " per hour threshold.</p>";
				description += "<p><b>Portal: Immediately</b><br>Will auto portal straight away.</p>";
				description += "<p><b>Portal: After Voids</b><br>Will run any remaining void maps then proceed to portal.</p>";
				if (atConfig.settingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 230) description += "<p><b>Portal: After Poison Voids</b><br>Will continue your run until you reach the next poison zone and run void maps there.</p>";
				description += "<p><b>Recommended:</b> Portal: After Voids</p>";
				return description;
			}, 'multitoggle', 0, null, 'Daily', [1, 2],
			function () { return (getPageSetting('dailyPortal', atConfig.settingUniverse) === 1) });

		createSetting('dailyHeliumHrExitSpire',
			function () { return ('Exit Spires for Voids') },
			function () {
				let description = "<p>Will automatically exit Spires to run your voids earlier when the <b>" + _getPrimaryResourceInfo().name + " Per Hour</b> Auto Portal setting is wanting to portal.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1, 2],
			function () { return ((getPageSetting('dailyPortal', atConfig.settingUniverse) === 1 && game.stats.highestLevel.valueTotal() >= 170) || (getPageSetting('dailyPortal', atConfig.settingUniverse) === 2 && game.stats.highestLevel.valueTotal() >= 270)) });

		createSetting('dailyPortalFiller',
			function () { return ('Filler Run') },
			function () {
				let description = "<p>Will run a filler (non daily/" + _getChallenge2Info() + " run) challenge (selected through the <b>Auto Portal</b> settings in the <b>Core</b> tab) inbetween dailies.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1, 2],
			function () { return ([1, 2].includes(getPageSetting('dailyPortal', atConfig.settingUniverse))) });

		createSetting('dailyPortalPreviousUniverse',
			function () { return ('Daily Previous Universe') },
			function () {
				let description = "<p>Will start your dailies in the previous universe. Takes you back to this universe after it has finished running.</p>";
				description += "<p>Ensure you setup daily settings for the <b>previous universe</b> if using this setting.<br>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [2]);

		createSetting('dailyDontCap',
			function () { return ('Use When Capped') },
			function () {
				let description = "<p>Will cause the script to only start dailies when you have at least the amount of dailies input in the <b>UWC: Amount</b> setting available to run.</p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Daily', [1, 2]);

		createSetting('dailyDontCapAmt',
			function () { return ('UWC: Amount') },
			function () {
				let description = "<p>Will cause the script to only start dailies when you have at least this amount available to run.</p>";
				description += "<p><b>Recommended:</b> 7</p>";
				return description;
			}, 'value', 7, null, 'Daily', [1, 2],
			function () { return getPageSetting('dailyDontCap', atConfig.settingUniverse) });

		createSetting('dailySkip',
			function () { return ('Skip Daily') },
			function () {
				let description = "<p>Use this to make the script skip specific dailies when starting runs.</p>";
				description += "<p>Must be input with same format as the game uses which is <b>'YEAR-MONTH-DAY'</b>.</p>"
				description += "<p>An example of an input would be <b>'2023-04-22'</b>.</p>"
				description += "<p>Can have multiple inputs, seperate them by commas.</p>"
				return description;
			}, 'multiTextValue', [0], null, 'Daily', [1, 2]);

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
		createSetting('heirloomSwapping',
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
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse)) });

		createSetting('heirloomPostVoidSwap',
			function () { return ('Post Void Swap') },
			function () {
				let description = "<p>If you have completed any void maps on your run this will set your swap zone to 0 to maximise damage in your afterpush.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse)) });

		createSetting('heirloomVoidSwap',
			function () { return ('Void Plaguebringer Swap') },
			function () {
				let description = "<p>This setting handles swapping your shield to a <b>Plaguebringer</b> shield when inside of void maps and fighting slow enemies to maximise Plaguebringer damage on fast enemies.</p>";
				description += "<p>When 2 cells away from a fast enemy that comes after a slow enemy, this will equip your non-plaguebringer shield and then on the next cell it will equip your plaguebringer shield.</p>";
				description += "<p>Will only run if either your <b>Void</b> or <b>Initial</b> shields don't have <b>Plaguebringer</b> and your <b>Plaguebringer</b> or <b>Afterpush</b> shield has the <b>Plaguebringer</b> modifier on it.</p>";
				description += "<p><b>Disabled during double attack void maps.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse)) });

		createSetting('heirloomCompressedSwap',
			function () { return ('Compressed Plaguebringer Swap') },
			function () {
				let description = "<p>When 2 cells away from a compressed cell and past your heirloom swap zone, this will equip your non-plaguebringer shield so that the next enemy spawns with full health, then it equips your plaguebringer shield to maximise damage on the compressed enemy.</p>";
				description += "<p>Will only run if either your <b>Initial</b> or <b>Afterpush</b> shield doesn't have <b>Plaguebringer</b> and your <b>Plaguebringer</b> or <b>Afterpush</b> shield has the <b>Plaguebringer</b> modifier on it.</p>";
				description += "<p>Displays an additional setting when enabled to allow this setting to run if above a certain <b>World HD Ratio</b> value for if you have yet to reach your heirloom swap zone.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse) && game.stats.highestRadLevel.valueTotal() >= 203) });

		createSetting('heirloomPlaguebringer',
			function () { return ('Plaguebringer') },
			function () {
				let description = "<p>Shield to use when the script wants to maximise plaguebringer damage on the next enemy.</p>";
				description += "<p>A shield with the <b>Plaguebringer</b> modifier <b>must</b> be used or this shield will never get equipped.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> <b>Plaguebringer</b> heirloom</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse) && (getPageSetting('heirloomVoidSwap', atConfig.settingUniverse) || getPageSetting('heirloomCompressedSwap', atConfig.settingUniverse))) });
		
		createSetting('heirloomShield',
			function () { return ('Shields') },
			function () {
				let description = "<p>Switch for enabling Shield heirloom swapping.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p>Respects the <b>Auto Abandon</b> setting for if Shields should be swapped but ignores the cell check.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse)) });

		createSetting('heirloomInitial',
			function () { return ('Initial') },
			function () {
				let description = "<p>Shield to use before your designated swap zone.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> a shield with void map drop chance</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse)) });

		createSetting('heirloomAfterpush',
			function () { return ('Afterpush') },
			function () {
				let description = "<p>Shield to use after your designated swap zone.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> a shield without void map drop chance</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse)) });

		createSetting('heirloomC3',
			function () { return (_getChallenge2Info()) },
			function () {
				let description = "<p>Shield to use after your designated swap zone during " + _getSpecialChallengeDescription() + ".</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> a shield without void map drop chance</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse)) });

		createSetting('heirloomVoid',
			function () { return ('Void') },
			function () {
				let description = "<p>Shield to use inside of Void Maps.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> damage heirloom</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse)) });
			
		createSetting('heirloomBreed',
			function () { return ('Breed') },
			function () {
				let description = "<p>Shield to use when your army is dead and breeding.</p>";
				description += "<p>This will override all other heirloom swapping features when active!</p>";
				description += "<p>Should ideally be a shield with the <b>Breed Speed</b> modifier.</p>";
				description += "<p>Mapping decisions will be disabled (unless 0 + overkill cells away from c100) when in world or the map chamber and using this heirloom so make sure it has a different name from your other heirloom settings!</p>";
				if (atConfig.settingUniverse === 1) description += "<p>If you have any levels in the <b>Anticipation</b> perk then this setting will be ignored when deciding which shield to use.</p>";				
				description += "<p>If set then when the heirloom calculator evaluates modifiers for heirlooms with this name it will evaluate Breed Speed as better over everything else.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse)) });

		createSetting('heirloomSpire',
			function () { return ('Spire') },
			function () {
				let description = "<p>Shield to use during active Spires.</p>";
				description += "<p><b>Ignore Spires Until</b> settings will stop this swap from happening if the value is above your current world zone.</p>";
				description += "<p>The Map Swap setting will override this whilst in maps.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Damage+Health heirloom</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse) && ((atConfig.settingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 170) || (atConfig.settingUniverse === 2 && game.stats.highestRadLevel.valueTotal() >= 270))) });

		createSetting('heirloomWindStack',
			function () { return ('Wind Stacking') },
			function () {
				let description = "<p>Shield to use when Wind stance is being used.</p>";
				description += "<p>The Map Swap setting will override this whilst in maps.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Plaguebringer heirloom</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse) && game.empowerments.Wind.getLevel() >= 50) });

		createSetting('heirloomSwapZone',
			function () { return ('Swap Zone') },
			function () {
				let description = "<p>From which zone to swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield during filler (non daily/" + _getChallenge2Info() + " runs).</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>If set to <b>75</b> it will swap shields from <b>z75</b> onwards.</p>";
				return description;
			}, 'value', -1, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse)) });

		createSetting('heirloomSwapZoneDaily',
			function () { return ('Daily Swap Zone') },
			function () {
				let description = "<p>From which zone to swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield during daily runs.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>If set to <b>75</b> it will swap shields from <b>z75</b> onwards.</p>";
				return description;
			}, 'value', -1, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse)) });

		createSetting('heirloomSwapZoneC3',
			function () { return (_getChallenge2Info() + ' Swap Zone') },
			function () {
				let description = "<p>From which zone to swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield during " + _getChallenge2Info() + " runs.</p>";
				description += "<p>If the " + _getChallenge2Info() + " shield setting has been setup then it will use that instead of the <b>Afterpush</b> shield.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>If set to <b>75</b> it will swap shields from <b>z75</b> onwards.</p>";
				return description;
			}, 'value', -1, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse)) });

			createSetting('heirloomSwapZoneOneOff',
			function () { return ('One Off Swap Zone') },
			function () {
				let description = "<p>From which zone to swap from your <b>Initial</b> shield to your <b>Afterpush</b> shield during one off runs.</p>";
				description += "<p>If the " + _getChallenge2Info() + " shield setting has been setup then it will use that instead of the <b>Afterpush</b> shield.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p>If set to <b>75</b> it will swap shields from <b>z75</b> onwards.</p>";
				return description;
			}, 'value', -1, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse)) });

		createSetting('heirloomSwapHD',
			function () { return ('HD Ratio Swap') },
			function () {
				let description = "<p>Will swap from your <b>Initial</b> shield to your (<b>Compressed Heirloom</b> shield if set otherwise <b>Afterpush</b>) shield when your <b>World HD Ratio</b> is above this value.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse)) });

		createSetting('heirloomSwapHDCompressed',
			function () { return ('Compressed Swap HD') },
			function () {
				let description = "<p>Will swap from your <b>Initial</b> heirloom to your <b>Compressed Swap Shield</b> heirloom when the next cell is compressed and your <b>World HD Ratio</b> is above this value.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Heirloom', [2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomShield', atConfig.settingUniverse) && getPageSetting('heirloomCompressedSwap', atConfig.settingUniverse)) });

		createSetting('heirloomStaff',
			function () { return ('Staffs') },
			function () {
				let description = "<p>Switch for enabling Staff heirloom swapping.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse)) });

		createSetting('heirloomStaffWorld',
			function () { return ('World') },
			function () {
				let description = "<p>The staff to use when in world zones.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> High pet XP staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomStaff', atConfig.settingUniverse)) });

		createSetting('heirloomStaffMap',
			function () { return ('Map') },
			function () {
				let description = "<p>The staff to use when running maps.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p>Will be overridden by the cache heirloom settings if they've been setup.</p>";
				description += "<p><b>Recommended:</b> Resource efficiency heavy staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomStaff', atConfig.settingUniverse)) });

		createSetting('heirloomStaffVoid',
			function () { return ('Void') },
			function () {
				let description = "<p>The staff to use when running <b>Void</b> maps.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated metal efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomStaff', atConfig.settingUniverse)) });

		createSetting('heirloomStaffFragment',
			function () { return ('Fragment') },
			function () {
				let description = "<p>The staff to use when the script is farming for fragments to be able to afford maps.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated metal efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomStaff', atConfig.settingUniverse)) });

		createSetting('heirloomStaffFood',
			function () { return ('Savory Cache') },
			function () {
				let description = "<p>The staff to use when running <b>Savory Cache</b> maps.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated food efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomStaff', atConfig.settingUniverse)) });

		createSetting('heirloomStaffWood',
			function () { return ('Wooden Cache') },
			function () {
				let description = "<p>The staff to use when running <b>Wooden Cache</b> maps.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated wood efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomStaff', atConfig.settingUniverse)) });

		createSetting('heirloomStaffMetal',
			function () { return ('Metal Cache') },
			function () {
				let description = "<p>The staff to use when running <b>Metal Cache</b> maps.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated metal efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomStaff', atConfig.settingUniverse)) });

		createSetting('heirloomStaffScience',
			function () { return ('Research Cache') },
			function () {
				let description = "<p>The staff to use when running <b>Research Cache</b> maps.</p>";
				description += "<p>The name you input here must match the name of an heirloom in your heirloom inventory for this to swap heirlooms.</p>";
				description += "<p>Set to <b>undefined</b> to disable.</p>";
				description += "<p><b>Recommended:</b> Dedicated science efficiency staff</p>";
				return description;
			}, 'textValue', 'undefined', null, 'Heirloom', [2],
			function () { return (getPageSetting('heirloomSwapping', atConfig.settingUniverse) && getPageSetting('heirloomStaff', atConfig.settingUniverse)) });

		createSetting('heirloomAuto',
			function () { return ('Auto Heirlooms') },
			function () {
				let description = "<p>Master switch for whether the script will try to keep any of the heirlooms in your temporary section when portaling.</p>";
				description += "<p>This setting <b>will not recycle</b> any of your carried heirlooms, it only checks your temporary heirlooms section.</p>";
				description += "<p>When run, this will check the mods you've selected against each heirloom in your temporary section and if they have the correct mods they'll be moved to your carried section.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2]);

		createSetting('heirloomAutoTypeToKeep',
			function () {
				let heirloomOptions = ['Type To Keep: None', 'Type To Keep: Shields', 'Type To Keep: Staffs', 'Type To Keep: All'];
				if (atConfig.settingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 200) heirloomOptions.push('Type To Keep: Cores');
				return (heirloomOptions)
			},
			function () {
				let description = "<p>Controls the heirloom types that the script will try to keep.</p>";
				description += "<p><b>Type To Keep: Shields</b><br>Will check to see if any <b>Shield</b> heirlooms should be kept when portaling.</p>";
				description += "<p><b>Type To Keep: Staffs</b><br>Will check to see if any <b>Staff</b> heirlooms should be kept when portaling.</p>";
				description += "<p><b>Type To Keep: All</b><br>Will check to see if <b>ANY</b> heirlooms should be kept when portaling.</p>";
				if (atConfig.settingUniverse === 1 && game.stats.highestLevel.valueTotal() >= 200) description += "<p><b>Type To Keep: Cores</b><br>Will check to see if any <b>Core</b> heirlooms should be kept when portaling.</p>";
				description += "<p><b>Recommended:</b> The type of heirlooms you need</p>";
				return description;
			}, 'multitoggle', 0, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', atConfig.settingUniverse)) });

		createSetting('heirloomAutoRarityPlus',
			function () { return ('Rarity To Keep: Higher Tiers') },
			function () {
				let description = "<p>Overrides <b>Rarity to Keep</b> ignoring heirlooms of a higher tier and instead allows the script to look at if they'd be worth keeping.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', atConfig.settingUniverse)) });

		createSetting('heirloomAutoModTarget',
			function () { return ('Mod Target Count') },
			function () {
				let description = "<p>Allows you to make it so that auto heirlooms will keep heirlooms if they have <b>X</b> amount of the mods you have setup in the different heirloom type options.</p>";
				description += "<p>When using this I recommend not setting any of the mod inputs to <b>Any</b> as it can cause you to keep heirlooms with more suboptimal mods than you desire.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and have the script assume you want to only keep perfect heirlooms.</p>";
				description += "<p><b>Recommended:</b> 0</p>";
				return description;
			}, 'value', 0, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', atConfig.settingUniverse)) });

		createSetting('heirloomAutoCoreModTarget',
			function () { return ('Core Mod Target Count') },
			function () {
				let description = "<p>Allows you to make it so that auto heirlooms will keep Cores if they have <b>X</b> amount of the mods you have setup in the different heirloom type options.</p>";
				description += "<p>When using this I recommend not setting any of the mod inputs to <b>Any</b> as it can cause you to keep heirlooms with more suboptimal mods than you desire.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting and have the script assume you want to only keep perfect heirlooms.</p>";
				description += "<p><b>Recommended:</b> 0</p>";
				return description;
			}, 'value', 0, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', atConfig.settingUniverse)) });

		createSetting('heirloomAutoForceRun',
			function () { return ('Run Auto Heirlooms') },
			function () {
				let description = "<p>Run Auto Heirlooms and sort heirlooms without needing to portal.</p>";
				return description;
			}, 'action', null, 'cancelTooltip(); importExportTooltip("forceAutoHeirlooms");', 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', atConfig.settingUniverse)) });

		createSetting('heirloomAutoShield',
			function () { return ('Shields') },
			function () {
				let description = "<p>Enable to allow you to select the shield modifiers you would like to target.</p>";
				description += "<p>Auto Heirlooms won't keep any shields if this setting is disabled.</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', atConfig.settingUniverse)) });

		createSetting('heirloomAutoRareToKeepShield',
			function () { return ('Rarity to Keep') },
			function () {
				let description = "<p>When identifying which heirlooms to keep will look at this rarity of heirloom and ignore others.</p>";
				description += "<p>If you would like the script to consider heirlooms of a higher rarity then enable the <b>Rarity To Keep: Higher Tiers</b> setting.</p>";
				description += "<p>Will only display tiers that can currently be obtained based on your highest zone reached.</p>";
				description += "<p><b>Recommended:</b> Highest tier available</p>";
				return description;
			}, 'dropdown', 'Common', function () {
				let hze;
				let heirloomTiersAvailable;
				if (atConfig.settingUniverse === 2) {
					hze = game.stats.highestRadLevel.valueTotal();
					heirloomTiersAvailable = ['Plagued', 'Radiating'];
					if (hze >= 100) heirloomTiersAvailable.push('Hazardous');
					if (hze >= 200) heirloomTiersAvailable.push('Enigmatic');
					if (hze >= 300) heirloomTiersAvailable.push('Mutated');
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
			function () { return (getPageSetting('heirloomAuto', atConfig.settingUniverse) && getPageSetting('heirloomAutoShield', atConfig.settingUniverse)) });


		createSetting('heirloomAutoModsShield',
			function () { return ('Shield Modifiers') },
			function () {
				let description = "<p>When Auto Heirlooms runs it will keep Shield heirlooms that have the mods selected in this setting.</p>";
				description += "<p>Each heirloom rarity has its own mod selection so when using the <b>Rarity+</b> setting you will need to select mods for every tier available above the one selected in the <b>Rarity To Keep</b> setting.</p>";
				return description;
			}, 'mazDefaultArray', ({
				'Common': [],
				'Rare':  [],
			}), `importExportTooltip('autoHeirloomMods', undefined, 'Shield')`, 'Heirloom', [0],
			function () { return (getPageSetting('heirloomAuto', atConfig.settingUniverse) && getPageSetting('heirloomAutoShield', atConfig.settingUniverse)) });

		createSetting('heirloomAutoBlacklistShield',
			function () { return ('Blacklist Shield Modifiers') },
			function () {
				let description = "<p>When Auto Heirlooms runs it will ignore Shield heirlooms with the mods you select in this setting.</p>";
				description += "<p>Each heirloom rarity has its own mod selection so you will need to setup mods for each tier that you want mods to be blacklisted on.</p>";
				return description;
			}, 'mazDefaultArray', ({
				'Common': [],
				'Rare':  [],
			}), `importExportTooltip('autoHeirloomMods', undefined, 'Shield', true)`, 'Heirloom', [0],
			function () { return (getPageSetting('heirloomAuto', atConfig.settingUniverse) && getPageSetting('heirloomAutoShield', atConfig.settingUniverse)) });

		createSetting('heirloomAutoStaff',
			function () { return ('Staffs') },
			function () {
				let description = "<p>Enable to allow you to select the staff modifiers you would like to target.</p>";
				description += "<p>Auto Heirlooms won't keep any staffs if this setting is disabled.</p>";
				return description;
			}, 'boolean', false, null, 'Heirloom', [1, 2],
			function () { return (getPageSetting('heirloomAuto', atConfig.settingUniverse)) });

		createSetting('heirloomAutoRareToKeepStaff',
			function () { return ('Rarity to Keep') },
			function () {
				let description = "<p>When identifying which heirlooms to keep will look at this rarity of heirloom and ignore others.</p>";
				description += "<p>If you would like the script to consider heirlooms of a higher rarity then enable the <b>Rarity To Keep: Higher Tiers</b> setting.</p>";
				description += "<p>Will only display tiers that can currently be obtained based on your highest zone reached.</p>";
				description += "<p><b>Recommended:</b> Highest tier available</p>";
				return description;
			}, 'dropdown', 'Common', function () {
				let hze;
				let heirloomTiersAvailable;
				if (atConfig.settingUniverse === 2) {
					hze = game.stats.highestRadLevel.valueTotal();
					heirloomTiersAvailable = ['Plagued', 'Radiating'];
					if (hze >= 100) heirloomTiersAvailable.push('Hazardous');
					if (hze >= 200) heirloomTiersAvailable.push('Enigmatic');
					if (hze >= 300) heirloomTiersAvailable.push('Mutated');
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
			function () { return (getPageSetting('heirloomAuto', atConfig.settingUniverse) && getPageSetting('heirloomAutoStaff', atConfig.settingUniverse)) });

		createSetting('heirloomAutoModsStaff',
			function () { return ('Staff Modifiers') },
			function () {
				let description = "<p>When Auto Heirlooms runs it will keep Staff heirlooms that have the mods selected in this setting.</p>";
				description += "<p>Each heirloom rarity has its own mod selection so when using the <b>Rarity+</b> setting you will need to select mods for every tier available above the one selected in the <b>Rarity To Keep</b> setting.</p>";
				return description;
			}, 'mazDefaultArray', ({
				'Common': [],
				'Rare':  [],
			}), `importExportTooltip('autoHeirloomMods', undefined, 'Staff')`, 'Heirloom', [0],
			function () { return (getPageSetting('heirloomAuto', atConfig.settingUniverse) && getPageSetting('heirloomAutoStaff', atConfig.settingUniverse)) });

		createSetting('heirloomAutoBlacklistStaff',
			function () { return ('Blacklist Staff Modifiers') },
			function () {
				let description = "<p>When Auto Heirlooms runs it will ignore Staff heirlooms with the mods you select in this setting.</p>";
				description += "<p>Each heirloom rarity has its own mod selection so you will need to setup mods for each tier that you want mods to be blacklisted on.</p>";
				return description;
			}, 'mazDefaultArray', ({
				'Common': [],
				'Rare':  [],
			}), `importExportTooltip('autoHeirloomMods', undefined, 'Staff', true)`, 'Heirloom', [0],
			function () { return (getPageSetting('heirloomAuto', atConfig.settingUniverse) && getPageSetting('heirloomAutoStaff', atConfig.settingUniverse)) });

		createSetting('heirloomAutoCore',
			function () { return ('Cores') },
			function () {
				let description = "<p>Enable to allow you to select the core modifiers you would like to target.</p>";
				description += "<p>Auto Heirlooms won't keep any cores if this setting is disabled.</p>";
				return description
			}, 'boolean', false, null, 'Heirloom', [0],
			function () { return (getPageSetting('heirloomAuto', atConfig.settingUniverse) && game.global.spiresCompleted > 0) });

		createSetting('heirloomAutoRareToKeepCore',
			function () { return ('Rarity to Keep') },
			function () {
				let description = "<p>When identifying which heirlooms to keep will look at this rarity of heirloom and ignore others.</p>";
				description += "<p>If you would like the script to consider heirlooms of a higher rarity then enable the <b>Rarity To Keep: Higher Tiers</b> setting.</p>";
				description += "<p>Will only display tiers that can currently be obtained based on your highest zone reached.</p>";
				description += "<p><b>Recommended:</b> Highest tier available</p>";
				return description;
			}, 'dropdown', 'Common', function () {
				const hze = game.stats.highestLevel.valueTotal();
				let heirloomTiersAvailable = ['Common'];
				if (hze >= 300) heirloomTiersAvailable.push('Rare');
				if (hze >= 400) heirloomTiersAvailable.push('Epic');
				if (hze >= 500) heirloomTiersAvailable.push('Legendary');
				if (hze >= 600) heirloomTiersAvailable.push('Magnificent');
				if (hze >= 700) heirloomTiersAvailable.push('Ethereal');

				return heirloomTiersAvailable;
			}, 'Heirloom', [0],
			function () { return (getPageSetting('heirloomAuto', atConfig.settingUniverse) && getPageSetting('heirloomAutoCore', atConfig.settingUniverse) && game.global.spiresCompleted > 0) });

		createSetting('heirloomAutoModsCore',
			function () { return ('Core Modifiers') },
			function () {
				let description = "<p>When Auto Heirlooms runs it will keep Core heirlooms that have the mods selected in this setting.</p>";
				description += "<p>Each heirloom rarity has its own mod selection so when using the <b>Rarity+</b> setting you will need to select mods for every tier available above the one selected in the <b>Rarity To Keep</b> setting.</p>";
				return description;
			}, 'mazDefaultArray', ({
				'Basic': [],
			}), `importExportTooltip('autoHeirloomMods', undefined, 'Core')`, 'Heirloom', [0],
			function () { return (getPageSetting('heirloomAuto', atConfig.settingUniverse) && getPageSetting('heirloomAutoCore', atConfig.settingUniverse) && game.global.spiresCompleted > 0) });

		createSetting('heirloomAutoBlacklistCore',
			function () { return ('Blacklist Core Modifiers') },
			function () {
				let description = "<p>When Auto Heirlooms runs it will ignore Core heirlooms with the mods you select in this setting.</p>";
				description += "<p>Each heirloom rarity has its own mod selection so you will need to select mods for each tier that you want mods to be blacklisted on.</p>";
				return description;
			}, 'mazDefaultArray', ({
				'Basic': [],
			}), `importExportTooltip('autoHeirloomMods', undefined, 'Core', true)`, 'Heirloom', [0],
			function () { return (getPageSetting('heirloomAuto', atConfig.settingUniverse) && getPageSetting('heirloomAutoCore', atConfig.settingUniverse) && game.global.spiresCompleted > 0) });
	}
	
	const displaySpire = true;
	if (displaySpire) {
		createSetting('spireIgnoreUntil',
			function () { return ('Ignore Spires Until') },
			function () {
				const ignoreSpires = atConfig.settingUniverse === 1 ? 'Spires until Spire II at zone 300 then enter 2, Spire III at z400 would be 3 etc.' : 'Spire I at zone 300 then enter 1.';
				let description = "<p>Will disable all of the Spire features in this tab unless the Spire you're in is at or above this value.</p>";
				description += `<p><b>This works based off Spire number rather than zone. So if you want to ignore ${ignoreSpires}</b></p>`;
				description += "<p>Set to <b>0 or below</b> to disable this setting and make the script assume every Spire is an active Spire.</p>";
				description += "<p><b>Recommended:</b> Second to last Spire you reach on your runs.</p>";
				return description;
			}, 'value', -1, null, 'Spire', [1,2 ]);

		createSetting('spireExitCell',
			function () { return ('Exit After Cell') },
			function () {
				let description = "<p>Will exit out of active Spires upon clearing this cell.</p>";
				description += "<p>This setting works based off cell number so if you want it to exit at cell 1 then set it to <b>0</b>, or if you want to exit after row #4 then set to <b>40</b>.</p>";
				description += "<p>HD Ratio and Hits Survived calculations for the Spire will be based off this cell if set.</p>";
				description += "<p><b>This setting will only work in active Spires.</b></p>";
				description += "<p>Set to <b>below 0</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'Spire', [1,2]);

		createSetting('spireNurseries',
			function () { return ('Nurseries') },
			function () {
				let description = "<p>Set the number of <b>Nurseries</b> to build during Spires.</p>";
				description += "<p><b>Will override any <b>Nursery</b> settings that you have setup in the <b>AT Auto Structure</b> setting.</b></p>";
				description += "<p><b>This setting will only work in active Spires.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'Spire', [1]);
		
		createSetting('spireDominanceStance',
			function () { return ('Force Dominance Stance') },
			function () {
				let description = "<p>Enabling this setting will force the script to only use Domination stance when fighting world enemies inside Spires.</p>";
				description += "<p><b>This setting will only work in active Spires.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Spire', [1]);

		createSetting('spireMapBonus',
			function () { return ('Max Map Bonus') },
			function () {
				let description = "<p>Will force run Map Bonus to obtain max (10) map bonus stacks as the first mapping that you do in Spires.</p>";
				description += "<p><b>This setting will only work in active Spires.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Spire', [1, 2]);
			
		createSetting('spireHitsSurvived',
			function () { return ('Hits Survived') },
			function () {
				let description = "<p>Will farm until your <b>Hits Survived</b> ratio is at or above this value while in Spires.</p>";
				description += "<p>Will use the <b>Map Cap</b> and <b>Job Ratio</b> inputs that have been set in the top row of the <b>HD Farm</b> setting. If they haven't been setup then it will default to a job ratio of <b>1/1/2</b> and a map cap of <b>100</b>.</p>";
				description += "<p><b>This setting will only work in active Spires and will override the Hits Survived setting in the <b>Maps</b> tab so if this is disabled it won't farm for health at all during Spires.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				if (atConfig.settingUniverse === 1) description += "<p><b>Recommended:</b> 10</p>";
				else description += "<p><b>Recommended:</b> -1</p>";
				description += "<br><p><b>Your Hits Survived ratio can be seen in either the Auto Maps Status tooltip or the AutoTrimp settings Help tab.</b></p>";
				return description;
			}, 'value', -1, null, 'Spire', [1, 2]);
			
		createSetting('spireSkipMapping',
			function () { return ('Skip Spires') },
			function () {
				let description = "<p>Will disable all of the scripts mapping if you have max (10) map bonus stacks while in a Spire.</p>";
				description += "<p><b>This setting will only work in active Spires.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Spire', [1, 2]);

		createSetting('spireIgnoreUntilC2',
			function () { return (`${_getChallenge2Info()}: Ignore Spires Until`) },
			function () {
				const ignoreSpires = atConfig.settingUniverse === 1 ? 'Spires until Spire II at zone 300 then enter 2, Spire III at z400 would be 3 etc.' : 'Spire I at zone 300 then enter 1.';
				let description = "<p>Will disable all of the Spire features in this tab unless the Spire you're in is at or above this value.</p>";
				description += `<p><b>This works based off Spire number rather than zone. So if you want to ignore ${ignoreSpires}</b></p>`;
				description += `<p>Set to <b>0 or below</b> to disable this setting and make the script assume every Spire is an active Spire.</p>`;
				description += `<p><b>Recommended:</b> Second to last Spire you reach on your runs</p>`;
				return description;
			}, 'value', -1, null, 'Spire', [1, 2]);

		createSetting('spireExitCellC2',
			function () { return (`${_getChallenge2Info()}: Exit After Cell`) },
			function () {
				let description = `<p>Will exit out of active Spires upon clearing this cell.</p>`;
				description += "<p>This setting works based off cell number so if you want it to exit at cell 1 then set it to <b>0</b>, or if you want to exit after row #4 then set to <b>40</b>.</p>";
				description += `<p>HD Ratio and Hits Survived calculations for the Spire will be based off this cell if set.</p>`;
				description += "<p><b>This setting will only work in active Spires.</b></p>";
				description += `<p>Set to <b>below 0</b> to disable this setting.</p>`;
				description += `<p><b>Recommended:</b> -1</p>`;
				return description;
			}, 'value', -1, null, 'Spire', [1, 2]);

		createSetting('spireNurseriesC2',
			function () { return (`${_getChallenge2Info()}: Nurseries`) },
			function () {
				let description = `<p>Set the number of <b>Nurseries</b> to build during Spires.</p>`;
				description += "<p><b>Will override any <b>Nursery</b> settings that you have setup in the <b>AT Auto Structure</b> setting.</b></p>";
				description += "<p><b>This setting will only work in active Spires.</b></p>";
				description += `<p>Set to <b>0 or below</b> to disable this setting.</p>`;
				description += `<p><b>Recommended:</b> -1</p>`;
				return description;
			}, 'value', -1, null, 'Spire', [1]);

		createSetting('spireDominanceStanceC2',
			function () { return (`${_getChallenge2Info()}: Force Dominance Stance`) },
			function () {
				let description = "<p>Enabling this setting will force the script to only use Domination stance when fighting world enemies inside Spires.</p>";
				description += "<p><b>This setting will only work in active Spires.</b></p>";;
				description += `<p><b>Recommended:</b> Off</p>`;
				return description;
			}, 'boolean', false, null, 'Spire', [1]);
			
		createSetting('spireMapBonusC2',
			function () { return (`${_getChallenge2Info()}: Max Map Bonus`) },
			function () {
				let description = "<p>Will force run Map Bonus to obtain max (10) map bonus stacks as the first mapping that you do in Spires.</p>";
				description += "<p><b>This setting will only work in active Spires.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Spire', [1, 2]);
			
		createSetting('spireHitsSurvivedC2',
			function () { return (`${_getChallenge2Info()}: Hits Survived`) },
			function () {
				let description = "<p>Will farm until your <b>Hits Survived</b> ratio is at or above this value while in Spires.</p>";
				description += "<p>Will use the <b>Map Cap</b> and <b>Job Ratio</b> inputs that have been set in the top row of the <b>HD Farm</b> setting. If they haven't been setup then it will default to a job ratio of <b>1/1/2</b> and a map cap of <b>100</b>.</p>";
				description += "<p><b>This setting will only work in active Spires and will override the Hits Survived setting in the <b>Maps</b> tab so if this is disabled it won't farm for health at all during Spires.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				if (atConfig.settingUniverse === 1) description += "<p><b>Recommended:</b> 10</p>";
				else description += "<p><b>Recommended:</b> -1</p>";
				description += "<br><p><b>Your Hits Survived ratio can be seen in either the Auto Maps Status tooltip or the AutoTrimp settings Help tab.</b></p>";
				return description;
			}, 'value', -1, null, 'Spire', [1, 2]);
			
		createSetting('spireSkipMappingC2',
			function () { return (`${_getChallenge2Info()}: Skip Spires`) },
			function () {
				let description = "<p>Will disable all of the scripts mapping if you have max (10) map bonus stacks while in a Spire.</p>";
				description += "<p><b>This setting will only work in active Spires.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Spire', [1, 2]);
		
		createSetting('spireIgnoreUntilDaily',
			function () { return ('Daily: Ignore Spires Until') },
			function () {
				const ignoreSpires = atConfig.settingUniverse === 1 ? 'Spires until Spire II at zone 300 then enter 2, Spire III at z400 would be 3 etc.' : 'Spire I at zone 300 then enter 1.';
				let description = "<p>Will disable all of the Spire features in this tab unless the Spire you're in is at or above this value.</p>";
				description += `<p><b>This works based off Spire number rather than zone. So if you want to ignore ${ignoreSpires}</b></p>`;
				description += "<p>Set to <b>0 or below</b> to disable this setting and make the script assume every Spire is an active Spire.</p>";
				description += "<p><b>Recommended:</b> Second to last Spire you reach on your runs</p>";
				return description;
			}, 'value', -1, null, 'Spire', [1, 2]);

		createSetting('spireExitCellDaily',
			function () { return ('Daily: Exit After Cell') },
			function () {
				let description = "<p>Will exit out of active Spires upon clearing this cell.</p>";
				description += "<p>This setting works based off cell number so if you want it to exit at cell 1 then set it to <b>0</b>, or if you want to exit after row #4 then set to <b>40</b>.</p>";
				description += "<p>HD Ratio and Hits Survived calculations for the Spire will be based off this cell if set.</p>";
				description += "<p><b>This setting will only work in active Spires.</b></p>";
				description += "<p>Set to <b>below 0</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'Spire', [1, 2]);

		createSetting('spireNurseriesDaily',
			function () { return ('Daily: Nurseries') },
			function () {
				let description = "<p>Set the number of <b>Nurseries</b> to build during Spires.</p>";
				description += "<p><b>Will override any <b>Nursery</b> settings that you have setup in the <b>AT Auto Structure</b> setting.</b></p>";
				description += "<p><b>This setting will only work in active Spires.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				description += "<p><b>Recommended:</b> -1</p>";
				return description;
			}, 'value', -1, null, 'Spire', [1]);

		createSetting('spireDominanceStanceDaily',
			function () { return ('Daily: Force Dominance Stance') },
			function () {
				let description = "<p>Enabling this setting will force the script to only use Domination stance when fighting world enemies inside Spires.</p>";
				description += "<p><b>This setting will only work in active Spires.</b></p>";;
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Spire', [1]);
			
		createSetting('spireMapBonusDaily',
			function () { return ('Daily: Max Map Bonus') },
			function () {
				let description = "<p>Will force run Map Bonus to obtain max (10) map bonus stacks as the first mapping that you do in Spires.</p>";
				description += "<p><b>This setting will only work in active Spires.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Spire', [1, 2]);
			
		createSetting('spireHitsSurvivedDaily',
			function () { return ('Daily: Hits Survived') },
			function () {
				let description = "<p>Will farm until your <b>Hits Survived</b> ratio is at or above this value while in Spires.</p>";
				description += "<p>Will use the <b>Map Cap</b> and <b>Job Ratio</b> inputs that have been set in the top row of the <b>HD Farm</b> setting. If they haven't been setup then it will default to a job ratio of <b>1/1/2</b> and a map cap of <b>100</b>.</p>";
				description += "<p><b>This setting will only work in active Spires and will override the Hits Survived setting in the <b>Maps</b> tab so if this is disabled it won't farm for health at all during Spires.</b></p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				if (atConfig.settingUniverse === 1) description += "<p><b>Recommended:</b> 10</p>";
				else description += "<p><b>Recommended:</b> -1</p>";
				description += "<br><p><b>Your Hits Survived ratio can be seen in either the Auto Maps Status tooltip or the AutoTrimp settings Help tab.</b></p>";
				return description;
			}, 'value', -1, null, 'Spire', [1, 2]);
			
		createSetting('spireSkipMappingDaily',
			function () { return ('Daily: Skip Spires') },
			function () {
				let description = "<p>Will disable all of the scripts mapping if you have max (10) map bonus stacks while in a Spire.</p>";
				description += "<p><b>This setting will only work in active Spires.</b></p>";
				description += "<p><b>Recommended:</b> Off</p>";
				return description;
			}, 'boolean', false, null, 'Spire', [1, 2]);
	}
	
	const displayMagma = true;
	if (displayMagma) {
		createSetting('autoGen',
			function () { return ('Auto Generator') },
			function () {
				let description = "<p>Master switch for whether the script will do any dimensional generator mode switching.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Magma', [1]);

		createSetting('autoGenModeBefore',
			function () { return (['Start Gen Mode: Gain Mi', 'Start Gen Mode: Gain Fuel', 'Start Gen Mode: Hybrid']) },
			function () {
				let description = "<p>The mode you would like your dimensional generator to be on before your <b>Start Fuel Zone</b>.</p>";
				description += "<p><b>Start Gen Mode: Gain Mi</b><br>Will set the generator to collect Mi.</p>";
				description += "<p><b>Start Gen Mode: Gain Fuel</b><br>Will set the generator to collect fuel.</p>";
				description += "<p><b>Start Gen Mode: Hybrid</b><br>Pseudo-Hybrid. This will collect fuel until full, then goes into Mi mode.</p>";
				description += "<p><b>Recommended:</b> Start Gen Mode: Gain Mi</p>";
				return description;
			}, 'multitoggle', 1, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', atConfig.settingUniverse)) });

		createSetting('autoGenFuelStart',
			function () { return ('Start Fuel Zone') },
			function () {
				let description = "<p>Will automatically set the generator to gather <b>Fuel</b> when this zone is reached.</p>";
				description += "<p>Set to <b>0</b> to disable this setting.</p>";
				description += "<p>If set <b>below 0</b> it will assume you always want this active.</p>";
				description += "<p>If the <b>Overclocker</b> upgrade has been purchased at least once it will use Hybrid mode if unlocked otherwise it will use the scripts pseudo-hybrid solution.</p>";
				return description;
			}, 'value', 0, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', atConfig.settingUniverse)) });

		createSetting('autoGenFuelEnd',
			function () { return ('End Fuel Zone') },
			function () {
				let description = "<p>Will automatically set the generator to gather <b>Fuel</b> until this zone is reached.</p>";
				description += "<p>Set to <b>0</b> to disable this setting.</p>";
				description += "<p>If set <b>below 0</b> it will assume you always want this active.</p>";
				description += "<p>If the <b>Overclocker</b> upgrade has been purchased at least once it will use Hybrid mode if unlocked otherwise it will use the scripts pseudo-hybrid solution.</p>";
				return description;
			}, 'value', 0, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', atConfig.settingUniverse)) });

		createSetting('autoGenModeAfter',
			function () { return (['End Gen Mode: Gain Mi', 'End Gen Mode: Gain Fuel', 'End Gen Mode: Hybrid']) },
			function () {
				let description = "<p>The mode you would like your dimensional generator to be on after your <b>End Fuel Zone</b>.</p>";
				description += "<p><b>End Gen Mode: Gain Mi</b><br>Will set the generator to collect Mi.</p>";
				description += "<p><b>End Gen Mode: Gain Fuel</b><br>Will set the generator to collect fuel.</p>";
				description += "<p><b>End Gen Mode: Hybrid</b><br>Pseudo-Hybrid. This will collect fuel until full, then goes into Mi mode.</p>";
				description += "<p><b>Recommended:</b> End Gen Mode: Gain Mi</p>";
				return description;
			}, 'multitoggle', 1, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', atConfig.settingUniverse)) });

		createSetting('autoGenModeDaily',
			function () { return (['Daily Gen Mode: Normal', 'Daily Gen Mode: Fuel', 'Daily Gen Mode: Hybrid']) },
			function () {
				let description = "<p>The mode that the script will use for the entire daily run.</p>";
				description += "<p><b>Daily Normal</b><br>Disables this setting and uses the normal script auto generator settings.</p>";
				description += "<p><b>Daily Fuel</b><br>Will set the generator to collect fuel.</p>";
				description += "<p><b>Daily Hybrid</b><br>Pseudo-Hybrid. This will collect fuel until full, then goes into Mi mode.</p>";
				description += "<p><b>Recommended:</b> Daily Normal</p>";
				return description;
			}, 'multitoggle', 1, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', atConfig.settingUniverse)) });

		createSetting('autoGenModeC2',
			function () { return [`${_getChallenge2Info()} Gen Mode: Normal`, `${_getChallenge2Info()} Gen Mode: Fuel`, `${_getChallenge2Info()} Gen Mode: Hybrid`] },
			function () {
				let description = `<p>The mode that the script will use for ${_getSpecialChallengeDescription()}.</p>`;
				description += `<p><b>${_getChallenge2Info()} Normal</b><br>Disables this setting and uses the normal script auto generator settings.</p>`;
				description += `<p><b>${_getChallenge2Info()} Fuel</b><br>Will set the generator to collect fuel.</p>`;
				description += `<p><b>${_getChallenge2Info()} Hybrid</b><br>Pseudo-Hybrid. This will collect fuel until full, then goes into Mi mode.</p>`;
				description += `<p><b>Recommended:</b> ${_getChallenge2Info()} Fuel</p>`;
				return description;
			}, 'multitoggle', 1, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', atConfig.settingUniverse)) });

		createSetting('magmiteAutoFuel',
			function () { return ('Automate Fuel Zones') },
			function () {
				let description = "<p>Will change your Start and End Fuel Zone inputs immediately before portaling to ensure that they are accurate going into your next run.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', atConfig.settingUniverse)) });

		createSetting('magmiteFuelZones',
			function () { return ('Zones To Fuel') },
			function () {
				let description = "<p>When <b>Automate Fuel Zones</b> runs it will use this value for how many zones you should fuel for.</p>";
				return description;
			}, 'value', 20, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', atConfig.settingUniverse) && getPageSetting('magmiteAutoFuel', atConfig.settingUniverse)) });

		createSetting('magmiteMinimize',
			function () { return ('Minimize Fuel Zones') },
			function () {
				let description = "<p>Minimizes fueling zones required to get the maximum amalgamators possible. Fuels for 20 zones if you can't get an amalgamator.</p>";
				description += "<p>This will override your input for <b>Zones To Fuel</b> if enabled.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
				
			}, 'boolean', false, null, 'Magma', [1],
			function () { return (getPageSetting('autoGen', atConfig.settingUniverse) && getPageSetting('magmiteAutoFuel', atConfig.settingUniverse) && game.stats.amalgamators.valueTotal > 0) });

		createSetting('magmiteAutoFuelForceRun',
			function () { return ('Force Automate Fuel Zones') },
			function () {
				let description = "<p>Run <b>Automate Fuel Zones</b> and set your fueling zones without needing to portal.</p>";
				description += "<p>Uses your highest zone reached to determine the best fueling zones.</p>";
				return description;
			}, 'action', null, 'autoMagmiteSpender(true)', 'Magma', [1],
			function () { return (getPageSetting('autoGen', atConfig.settingUniverse) && getPageSetting('magmiteAutoFuel', atConfig.settingUniverse) && game.stats.amalgamators.valueTotal > 0) });

		createSetting('magmiteSpending',
			function () { return (['Spend Magmite: Off', 'Spend Magmite: Portal', 'Spend Magmite: On']) },
			function () {
				let description = "<p>Controls when the script will spend the Magmite that you obtain throughout your runs.</p>";
				description += "<p>If enabled the script will spend your magmite on the most efficient upgrade available.</p>";
				description += "<p><b>Spend Magmite: Off</b><br>Disables this setting.</p>";
				description += "<p><b>Spend Magmite: Portal</b><br>Auto spends any unspent Magmite immediately before portaling.</p>";
				description += "<p><b>Spend Magmite: On</b><br>Will spend Magmite that you acquire as soon as the most efficient upgrade is purchasable.</p>";
				description += "<p><b>Recommended:</b> Spend Magmite: Portal</p>";
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
			function () { return ('Transfer Nature Tokens') },
			function () {
				let description = "<p>Controls how nature token transfering is handled by the script.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
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
				description += "<p>Will only spend tokens if the action costs less than your current total plus the value in the <b>Token Threshold</b> setting.<br></p>";
				description += "<p><b>Off</b><br>Disables this setting.</p>";
				description += "<p><b>Empowerment</b><br>Will upgrade your Poison level.</p>";
				description += "<p><b>Transfer</b><br>Will purchase levels in your Poison transfer rate.</p>";
				description += "<p><b>Convert to X</b><br>Will convert your tokens to the specified nature type.</p>";
				return description;
			}, 'dropdown', 'Off', function () { return ['Off', 'Empowerment', 'Transfer', 'Convert to Wind', 'Convert to Ice', 'Convert to Both']; }, 'Nature', [1],
			function () { return (autoTrimpSettings.autoNature.enabled) });

		createSetting('autoWind',
			function () { return ('Wind') },
			function () {
				let description = "<p>Decides what to do with Wind tokens.</p>";
				description += "<p>Will only spend tokens if the action costs less than your current total plus the value in the <b>Token Threshold</b> setting.<br></p>";
				description += "<p><b>Off</b><br>Disables this setting.</p>";
				description += "<p><b>Empowerment</b><br>Will upgrade your Wind level.</p>";
				description += "<p><b>Transfer</b><br>Will purchase levels in your Wind transfer rate.</p>";
				description += "<p><b>Convert to X</b><br>Will convert your tokens to the specified nature type.</p>";
				return description;
			}, 'dropdown', 'Off', function () { return ['Off', 'Empowerment', 'Transfer', 'Convert to Poison', 'Convert to Ice', 'Convert to Both']; }, 'Nature', [1],
			function () { return (autoTrimpSettings.autoNature.enabled) });

		createSetting('autoIce',
			function () { return ('Ice') },
			function () {
				let description = "<p>Decides what to do with Ice tokens.</p>";
				description += "<p>Will only spend tokens if the action costs less than your current total plus the value in the <b>Token Threshold</b> setting.<br></p>";
				description += "<p><b>Off</b><br>Disables this setting.</p>";
				description += "<p><b>Empowerment</b><br>Will upgrade your Ice level.</p>";
				description += "<p><b>Transfer</b><br>Will purchase levels in your Ice transfer rate.</p>";
				description += "<p><b>Convert to X</b><br>Will convert your tokens to the specified nature type.</p>";
				return description;
			}, 'dropdown', 'Off', function () { return ['Off', 'Empowerment', 'Transfer', 'Convert to Poison', 'Convert to Wind', 'Convert to Both']; }, 'Nature', [1],
			function () { return (autoTrimpSettings.autoNature.enabled) });

		createSetting('autoEnlightenment',
			function () { return ('Enlightenment Automation') },
			function () {
				let description = "<p>Controls when the script will purchase nature enlightenments.</p>";
				description += "<p>Priority system for the purchases is <b>Poison > Wind > Ice</b>.</p>";
				description += "<p>Will only purchase an enlightenment when <b>Magma</b> is active.</p>";
				description += "<p>Enlightenment purchases ignore the <b>Token Threshold</b> setting value.</p>";
				description += "<p>Additional settings appear when enabled.</p>";
				return description;
			}, 'boolean', false, null, 'Nature', [1],
			function () { return (game.empowerments.Poison.getLevel() >= 50 || game.empowerments.Wind.getLevel() >= 50 || game.empowerments.Ice.getLevel() >= 50) });

		createSetting('poisonEnlight',
			function () { return ('E: Poison (Filler)') },
			function () {
				let description = "<p>Will activate Poison enlightenment when below this token threshold when running fillers (non daily/" + _getChallenge2Info() + " runs).</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoEnlightenment.enabled) });

		createSetting('windEnlight',
			function () { return ('E: Wind (Filler)') },
			function () {
				let description = "<p>Will activate Wind enlightenment when below this token threshold when running fillers (non daily/" + _getChallenge2Info() + " runs).</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoEnlightenment.enabled) });

		createSetting('iceEnlight',
			function () { return ('E: Ice (Filler)') },
			function () {
				let description = "<p>Will activate Ice enlightenment when below this token threshold when running fillers (non daily/" + _getChallenge2Info() + " runs).</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoEnlightenment.enabled) });

		createSetting('poisonEnlightDaily',
			function () { return ('E: Poison (Daily)') },
			function () {
				let description = "<p>Will activate Poison enlightenment when below this token threshold and running a daily.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoEnlightenment.enabled) });

		createSetting('windEnlightDaily',
			function () { return ('E: Wind (Daily)') },
			function () {
				let description = "<p>Will activate Wind enlightenment when below this token threshold and running a daily.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoEnlightenment.enabled) });

		createSetting('iceEnlightDaily',
			function () { return ('E: Ice (Daily)') },
			function () {
				let description = "<p>Will activate Ice enlightenment when below this token threshold and running a daily.</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoEnlightenment.enabled) });

		createSetting('poisonEnlightC2',
			function () { return (`E: Poison (${_getChallenge2Info()})`) },
			function () {
				let description = "<p>Will activate Poison enlightenment when below token threshold and doing " + _getSpecialChallengeDescription() + ".</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoEnlightenment.enabled) });

		createSetting('windEnlightC2',
			function () { return (`E: Wind (${_getChallenge2Info()})`) },
			function () {
				let description = "<p>Will activate Wind enlightenment when below this token threshold and doing " + _getSpecialChallengeDescription() + ".</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoEnlightenment.enabled) });

		createSetting('iceEnlightC2',
			function () { return (`E: Ice (${_getChallenge2Info()})`) },
			function () {
				let description = "<p>Will activate Ice enlightenment when below this token threshold and doing " + _getSpecialChallengeDescription() + ".</p>";
				description += "<p>Set to <b>0 or below</b> to disable this setting.</p>";
				return description;
			}, 'value', -1, null, 'Nature', [1],
			function () { return (autoTrimpSettings.autoEnlightenment.enabled) });
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
			function () { return (getPageSetting('fluffyEvolve', atConfig.settingUniverse)) });

		createSetting('fluffyMaxZone',
			function () { return ('Fluffy: Max Zone') },
			function () {
				let description = "<p>From which zone evolving should stop being considered.</p>";
				description += "<p>Must be used in conjunction with <b>Fluffy: Min Zone</b>.</p>";
				description += "<p><b>Recommended:</b> 999</p>";
				return description;
			}, 'value', -1, null, 'Fluffy', [1],
			function () { return (getPageSetting('fluffyEvolve', atConfig.settingUniverse)) });

		createSetting('fluffyBP',
			function () { return ('Fluffy: Bone Portals') },
			function () {
				let description = "<p>How many Bone Portals to use when the script evolves Fluffy.</p>";
				description += "<p>If set above 0 and you don't have enough bones to afford the necessary bone portals then the script won't evolve until you have enough bones.</p>";
				description += "<p>If set to <b>0 or below</b> it will disable this setting.</p>";
				description += "<p><b>Recommended:</b> 1</p>";
				return description;
			}, 'value', -1, null, 'Fluffy', [1],
			function () { return (getPageSetting('fluffyEvolve', atConfig.settingUniverse)) });

		createSetting('fluffyRespec',
			function () { return ('Fluffy: Respec on Evo') },
			function () {
				let description = "<p>Will respec your perks after evolving.</p>";
				description += "<p>Will only evolve Fluffy when a perk respec is available <b>OR</b> you have points in the Fluffy xp gain perks.</p>";
				description += "<p>This setting won't do anything if the <b>Auto Allocate Perks</b> setting is disabled. Uses your current preset and weights to respec to.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Fluffy', [1],
			function () { return (getPageSetting('fluffyEvolve', atConfig.settingUniverse)) });
	}

	const displaySpireAssault = true;
	if (displaySpireAssault) {

		createSetting('spireAssaultContracts',
			function () { return ('Auto Start Contracts') },
			function () {
				let description = "<p>When running Void Maps this will automatically start any contracts that can be completed by finishing the map.</p>";
				description += "<p>Purchase order is based on contract unlock order.</p>";
				return description;
			}, 'boolean', false, null, 'Spire Assault', [0]);

		createSetting('spireAssaultPresets',
			function () { return ('Item Presets') },
			function () {
				let description = "<p>Here you can select which items you would like each preset to equip, for use with the <b>Spire Assault Settings</b> setting.</p>";
				return description;
			}, 'mazDefaultArray', JSON.stringify({
				'Preset 1': {name: 'Preset 1', items: [], ringMods: []},
				'Preset 2': {name: 'Preset 2', items: [], ringMods: []},
				'Preset 3': {name: 'Preset 3', items: [], ringMods: []},
				'Preset 4': {name: 'Preset 4', items: [], ringMods: []},
				'Preset 5': {name: 'Preset 5', items: [], ringMods: []},
				'Hidden Items': {name: 'Hidden Items', items: [], ringMods: []},
				'selectedPreset': 'Preset 1',
				'titles': ['Preset 1', 'Preset 2', 'Preset 3', 'Preset 4', 'Preset 5', 'Hidden Items']
			}), 'importExportTooltip("spireAssault")', 'Spire Assault', [0]); 

		createSetting('spireAssaultSettings',
			function () { return ('Spire Assault Settings') },
			function () {
				let description = "<p>Here you can set goals for the script to achieve in the Spire Assault minigame.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [{ active: false }], 'importExportTooltip("mapSettings", "Spire Assault")', 'Spire Assault', [0]);


	}
	
	const displayTimewarp = true;
	if (displayTimewarp) {
		createSetting('timeWarpSpeed',
			function () { return ('Time Warp Support') },
			function () {
				let description = "<p>Will allow the script to run more frequently during time warp so instead of running once every 100ms it will run when the game runs its code.</p>";
				description += "<p>This will be a significant slow down when running time warp but should allow you to use the scripts features during it.</p>";
				return description;
			}, 'boolean', true, null, 'Time Warp', [0]);

		createSetting('timeWarpDisplay',
			function () { return ('Time Warp Display') },
			function () {
				let description = "<p>Will display the Trimps user interface during time warp.</p>";
				description += "<p>Updates the display every minute of game time.</p>";
				description += "<p>This will cause your time warp to take longer as it has to render additional frames.</p>";
				description += "<p>When first loading Time Warp you will have a tooltip to inform you of your Time Warp duration as you won't be able to see it ingame. Additionally adds your current Time Warp progress percentage to the start of the Auto Maps Status at the bottom of the battle container.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Time Warp', [0],
			function () { return (autoTrimpSettings.timeWarpSpeed.enabled) });

		createSetting('timeWarpFrequency',
			function () { return ('Time Warp Frequency') },
			function () {
				const universeSetting = atConfig.settingUniverse === 1 ? 'Stance' : 'Equality';
				let description = "<p>The frequency that the scripts code will run during time warp.</p>";
				description += "<p>If set to 20 it will run once every 20 times the games code runs. The lower you set this value the longer time warp will take.</p>";
				description += `<p>Auto Maps, Auto Fight, Auto Portal, and Auto ${universeSetting} will run every time the game runs its code regardless of this input.</p>`;
				description += "<p>Liquification zones override this and temporarily set it to 1.</p>";
				description += "<p><b>Recommended:</b> 20</p>";
				return description;
			}, 'value', 1, null, 'Time Warp', [0],
			function () { return (autoTrimpSettings.timeWarpSpeed.enabled) });

		createSetting('timeWarpSaving',
			function () { return ('Time Warp Saving') },
			function () {
				let description = "<p>Will cause the script to save your game during Time Warp so that you can maintain your time warp progress through refreshes.</p>";
				description += "<p>Automatically saves every 30 minutes of game time and maintains current time warp progress.</p>";
				description += "<p><b>Recommended:</b> On</p>";
				return description;
			}, 'boolean', false, null, 'Time Warp', [0],
			function () { return (autoTrimpSettings.timeWarpSpeed.enabled) });

		createSetting('timeWarpForceSave',
			function () { return ('Force Time Warp Save') },
			function () {
				let description = "<p>Will save your game in its current state and retain your remaining Time Warp time.</p>";
				return description;
			}, 'action', null, '_timeWarpSave()', 'Time Warp', [0],
			function () { return (autoTrimpSettings.timeWarpSpeed.enabled) });
	}
	
	const displayDisplay = true;
	if (displayDisplay) {
		createSetting('displayEnhancedGrid',
			function () { return ('Enhance Grids') },
			function () {
				let description = "<p>Apply slight visual enhancements to world and map grids to display exotic imps, skeletimps and other special imps.</p>";
				const enemyType = atConfig.settingUniverse === 1 ? 'Corrupt' : 'Mutated';
				description += `<p>${enemyType} enemies won't have a fast icon as those enemies are always fast.</p>`;
				return description;
			}, 'boolean', false, null, 'Display', [0]);

		createSetting('displayPercentHealth',
			function () { return ('Percent Health') },
			function () {
				let description = "<p>Modifies the trimp and enemy health bars to display health as a percentage instead of as a value.</p>";
				return description;
			}, 'boolean', false, null, 'Display', [0]);

		createSetting('displayAllSettings',
			function () { return ('Display All settings') },
			function () {
				let description = "<p>Will display all of the locked settings that have certain zone or other requirements to be displayed.</p>";
				return description;
			}, 'boolean', false, null, 'Display', [0]);

		createSetting('displayHideAutoButtons',
			function () { return ('Hide Buttons and Info') },
			function () {
				const resourcePerHour = atConfig.settingUniverse === 1 ? 'Helium' : 'Radon';
				let description = "<p>Will allow buttons or miscellaneous info from the game or script you'd prefer not to be visible.</p>";
				description += `<p>Auto Maps Status and ${resourcePerHour} Per Hour Status can also be hidden in this menu.</p>`;
				return description;
			}, 'mazDefaultArray', {
				fight: false, autoFight: false, structure:false, jobs: false, gold: false, upgrades: false, prestige: false, equip: false,
				ATstructure: false, ATjobs: false, ATequip: false, ATmaps: false, ATstatus: false, ATheHr: false,
			}, 'importExportTooltip("hideAutomation")', 'Display', [0]);
			
		createSetting('enableAFK',
			function () { return ('Go AFK Mode') },
			function () {
				let description = "<p>AFK Mode uses a Black Screen, and suspends all of the Trimps GUI visual update functions to improve performance by not doing unnecessary stuff. This feature is primarily just a CPU saving mode.</p>";
				description += "<p>You can also click the Zone # (World Info) area to active this.</p>";
				return description;
			}, 'action', null, 'atData["performance"].enableAFKMode()', 'Display', [1, 2]);

		createSetting('equipEfficientEquipDisplay',
			function () { return ('Highlight Efficient Equipment') },
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
				if (atConfig.settingUniverse === 1) description += "<p>This setting ignores <b>Warpstations</b> and <b>Gigastations</b> as they are handled seperately from the rest of the buildings.</p>";
				if (atConfig.settingUniverse === 2) description += "<p>When <b>Hubs</b> are unlocked this setting won't display the best building as the script will automatically purchase the cheapest housing building possible at that point.</p>";
				return description;
			}, 'boolean', false, null, 'Display', [1, 2]);

		createSetting('shieldGymMostEfficientDisplay',
			function () { return ('Highlight Shields v Gyms') },
			function () {
				let description = "<p>Will highlight the most efficient purchase between Shields and Gyms.</p>";
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
			function () { return (getPageSetting('sitInMaps', atConfig.settingUniverse)) });

		createSetting('sitInMaps_Cell',
			function () { return ('SIM: Cell') },
			function () {
				let description = "<p>The script will go to the map chamber and stop running any maps after this cell has been reached.</p>";
				return description;
			}, 'value', -1, null, 'Display', [1, 2],
			function () { return (getPageSetting('sitInMaps', atConfig.settingUniverse)) });

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

	document.getElementById('battleSideTitle').setAttribute('onclick', 'atData["performance"].enableAFKMode()');
	document.getElementById('battleSideTitle').setAttribute('onmouseover', "getZoneStats(event);this.style.cursor='pointer'");
	
	const displayImport = true;
	if (displayImport) {
		createSetting('importAutoTrimps',
			function () { return ('Import AutoTrimps') },
			function () {
				let description = "<p>Import an AutoTrimps settings file.</p>";
				return description;
			}, 'infoclick', null, 'importExportTooltip("importAutoTrimps")', 'Import Export', [0]);

		createSetting('exportAutoTrimps',
			function () { return ('Export AutoTrimps') },
			function () {
				let description = "<p>Export your AutoTrimps Settings as an output string text formatted in JSON.</p>";
				return description;
			}, 'infoclick', null, 'importExportTooltip("exportAutoTrimps")', 'Import Export', [0]);

		createSetting('downloadForDebug',
			function () { return ('Download Save For Debug') },
			function () {
				let description = "<p>Will download both your save (paused) and the scripts settings so that they can be debugged easier.</p>";
				return description;
			}, 'action', null, 'importExportTooltip("exportAutoTrimps", "downloadSave")', 'Import Export', [0]);

		createSetting('updateReload',
			function () { return ('Auto Refresh For Updates') },
			function () {
				let description = "<p>Will reload your Trimps window when an AutoTrimps update is available.</p>";
				description += "<p><b>Updates can sometimes have errors that would break the script so be aware this might not be wise to enable.</b></p>";
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
			'mazDefaultArray', JSON.stringify(_mutatorDefaultObj()), null, 'Import Export', [2],
			function () { return false });

		createSetting('profileSettings',
			function () { return ('Profile Settings') },
			function () {
				let description = "<p>Here you can save and load different AutoTrimps setting profiles.</p>";
				description += "<p><b>Click to adjust settings.</b></p>";
				description += "<p>If needed, the <b>Help</b> button at the bottom left of the popup window has information for all of the inputs.</p>";
				return description;
			}, 'mazArray', [], 'importExportTooltip("mapSettings", "Profile")', 'Import Export', [0]);

		createSetting('profileLastLoaded',
			function () { return (autoTrimpSettings.ATprofile ? `Loaded Profile: ${autoTrimpSettings.ATprofile}` : `Load a Profile To Use`) },
			function () {
				let description = "<p>Will save your current settings to the last preset you loaded through the <b>Profile Settings</b> window.</p>";
				return description;
			}, 'infoclick', null, 'atProfileSave()', 'Import Export', [0],
			function () { return autoTrimpSettings.ATprofile && autoTrimpSettings.ATprofile !== '' });
	}
	
	const displayHelp = true;
	if (displayHelp) {
		createSetting('helpIntroduction',
			function () { return ('Introduction Message') },
			function () {
				let description = "<p>Will display the introduction message that is shown when you first load the script.</p>";
				return description;
			}, 'action', null, 'cancelTooltip(); introMessage();', 'Help', [0]);

		createSetting('helpResourceHour',
			function () { return (_getPrimaryResourceInfo().name + ' Per Hour') },
			function () {
				let description = "<p>Will display the " + _getPrimaryResourceInfo().name + "/Hr tooltip message.</p>";
				description += "<p>This can also be accessed by mousing over the text beneath the Auto Maps Status when the <b>" + _getPrimaryResourceInfo().name + " Per Hour Status</b> option inside the <b>Hide Auto Buttons</b> setting in the <b>Display</b> tab is unchecked.</p>";
				return description;
			}, 'action', null, 'cancelTooltip(); makeResourceTooltip();', 'Help', [0]);

		createSetting('helpAutoPortal',
			function () { return ('Auto Portal Info') },
			function () {
				let description = "<p>Will display a description of what order Auto Portal will try to perform its actions.</p>";
				return description;
			}, 'action', null, 'cancelTooltip(); makeAutoPortalHelpTooltip(false);', 'Help', [0]);

		createSetting('helpShieldGym',
			function () { return ('Shield & Gym Issues') },
			function () {
				let description = "<p>Will display information regarding why Shields or Gyms aren't instantly being purchased.</p>";
				return description;
			}, 'action', null, 'cancelTooltip(); makeShieldGymHelpTooltip()', 'Help', [1]);

		createSetting('helpStatus',
			function () { return ('Auto Maps Status') },
			function () {
				let description = "<p>Will display the Auto Maps Status window.</p>";
				description += "<p>This can also be accessed by mousing over the text that tells you what Auto Maps is currently trying to do just beneath the Auto Maps button.</p>";
				return description;
			}, 'action', null, 'cancelTooltip(); makeAutomapStatusTooltip(false);', 'Help', [0]);

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
			}, 'action', null, 'cancelTooltip(); importExportTooltip("priorityOrder")', 'Help', [0]);
			
		createSetting('helpAutoLevel',
			function () { return ('Auto Level Table') },
			function () {
				let description = "<p>Will display a table of the calculators simulation results.</p>";
				return description;
			}, 'action',null, 'cancelTooltip(); importExportTooltip("display");', 'Help', [0]);
	
		createSetting('helpFragments',
			function () { return ('Fragment Decisions') },
			function () {
				let description = "<p>Will display the decision for map creation slider/setting adjustments.</p>";
				return description;
			}, 'action',null, 'cancelTooltip(); makeFragmentDecisionHelpTooltip(false);', 'Help', [0]);

		createSetting('helpDonate',
			function () { return ('Donate') },
			function () {
				let description = "<p>If you'd like to donate to AutoTrimps development, you can by clicking this button and following the buymeacoffee link.</p>";
				description += "<p>If you want to contribute but can't afford a donation, you can still give back by joining the community and sharing your feedback or helping others. Thank you either way, you're awesome!</p>";
				return description;
			}, 'action', null, 'importExportTooltip("donate")', 'Help', [0]);
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
			}, 'action', null, 'testEquipmentMetalSpent();', 'Test', [0]);

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
				description += "<p>Requires the auto equality setting in the <b>Combat</b> tab to be set to <b>Auto Equality: Advanced</b></p>";
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
	const selected = ['dropdown', 'dropdownMulti'];

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
		id: `${id}Parent`,
		style: 'display: inline-block; vertical-align: top; margin-left: 0.6vw; margin-bottom: 1vw; width: 13.50vw; min-height: 1.51vw;'
	};

	const btnName = name();

	const btnAttributes = {
		id: id,
		style: `position: relative; padding-left: 5px; font-size: 1vw; height: auto; min-height: 1.51vw;`,
		onmouseover: `tooltip("${btnName}", "customText", event, "${description()}")`,
		onmouseout: 'tooltip("hide")',
		innerHTML: btnName
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
		dropdownMulti: () => {
			btnAttributes.onmouseout = 'tooltip("hide")';
			btnAttributes.class = 'select2 select2-multi';
			parentAttributes.onmouseover = `tooltip("${name()}", "customText", event, "${description()}")`;
			parentAttributes.onmouseout = 'tooltip("hide")';
			parentAttributes.onchange = `settingChanged("${id}")`;
		},
		multitoggle: () => {
			btnAttributes.onmouseover = `tooltip("${name().join(' / ')}", "customText", event, "${description()}")`;
			btnAttributes.innerHTML = autoTrimpSettings[id].name()[autoTrimpSettings[id]['value']];
		},
		action: () => {
			btnAttributes.style += 'color: black; background-color: #6495ed;';
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
	const btn = _createElement(type.includes('dropdown') ? 'select' : 'DIV', btnAttributes);

	btn.id = id;
	btnParent.appendChild(btn);
	if (container) document.getElementById(container).appendChild(btnParent);
	else document.getElementById('autoSettings').appendChild(btnParent);

	if (id === 'dailyPortal') {
		const autoPortalSettings = _createElement('DIV', {
			id: 'autoPortalSettingsBtn',
			onclick: 'importExportTooltip("dailyAutoPortal")',
			class: 'settingsBtnLocalCogwheel',
			style: 'margin-left:-1px; line-height: normal; font-size: 1.1vw;'
		});
		const autoPortalSettingsButton = _createElement('SPAN', {
			class: 'glyphicon glyphicon-cog',
			style: 'transform: scale(0.7); justify-content: center; font-size: inherit; top: 0px;'
		});

		btnParent.appendChild(autoPortalSettings);
		autoPortalSettings.appendChild(autoPortalSettingsButton);
	}

	if (type === 'multitoggle') {
		btn.addEventListener('click', (event) => {
			if (event.ctrlKey || event.metaKey) {
				_resetMultiToggleSetting(id);
			} else {
				settingChanged(id);
			}
		});
	}
}

function _settingTimeout(settingName, milliseconds = MODULES.portal.timeout) {
	if (atConfig.timeouts[settingName]) {
		clearTimeout(atConfig.timeouts[settingName]);
	}
	atConfig.timeouts[settingName] = setTimeout(function () {
		atConfig.timeouts[settingName] = false;
	}, milliseconds);
}

function settingChanged(id, currUniverse) {
	const btn = autoTrimpSettings[id];
	const radonOn = currUniverse ? game.global.universe === 2 : autoTrimpSettings.universeSetting.value === 1;
	const valueSuffix = radonOn && btn.universe.indexOf(0) === -1 ? 'U2' : '';
	const updateUI = currUniverse || atConfig.settingUniverse === game.global.universe || btn.universe.includes(0);

	const booleanActions = {
		equipEfficientEquipDisplay: displayMostEfficientEquipment,
		shieldGymMostEfficientDisplay: displayShieldGymEfficiency,
		buildingMostEfficientDisplay: displayMostEfficientBuilding,
		equipOn: _setAutoEquipClasses,
		buildingsType: _setBuildingClasses,
		timeWarpDisplay: _setTimeWarpUI,
		displayEnhancedGrid: atData.fightInfo.Update,
		archaeology: archaeologyAutomator,
		autoEggs: easterEggClicked,
		displayPercentHealth: togglePercentHealth
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
		if (id === 'heirloomSwapping') updateHeirloomSwapElem();
		if (id === 'autoMapsReroll') hdStats.autoLevelMaxFragments = btn[enabled] && hdStats.autoLevelInitial ? stats(undefined, false) : undefined;
	}

	if (btn.type === 'multitoggle') {
		const element = document.getElementById(id);
		const value = `value${valueSuffix}`;
		if (id === 'magmiteSpending' && btn[value] > 0) _settingTimeout('magma');
		if (id === 'presetCombatRespec' && game.global.universe === 1) _settingTimeout('respec');

		if (id === 'dailyPortal' && btn[value] === 1 && challengeActive('Daily') && mapSettings.voidTrigger && mapSettings.voidTrigger.includes('Per Hour')) {
			MODULES.mapFunctions.afterVoids = false;
			MODULES.mapFunctions.afterPoisonVoids = false;
			mapSettings.portalAfterVoids = false;
			game.global.addonUser.mapFunctions.afterVoids = false;
		}

		btn[value]++;
		if (id === 'autoMaps' && currUniverse && btn[value] === 2) btn[value]++;
		if (btn[value] > btn.name().length - 1) btn[value] = 0;
		element.setAttribute('class', 'noselect settingsBtn settingBtn' + btn[value]);
		element.innerHTML = btn.name()[btn[value]];
		if (multitoggleActions[id] && updateUI) multitoggleActions[id]();
		if (id === 'dailyPortal') document.getElementById(btn.id).classList.add('toggleConfigBtn');

		const elemText = element.innerHTML.replace(/<span class="icomoon icon-infinity"><\/span>/g, '∞');
		if (elemText.length > 26) {
			const reduceBy = 1 - (elemText.length - 24) * 0.03;
			element.style.fontSize = `${reduceBy}vw`;
		} else {
			element.style.fontSize = '1vw';
		}
	}

	if (btn.type.includes('dropdown')) {
		const selected = `selected${valueSuffix}`;

		let result;
		if (btn.type === 'dropdown') {
			result = document.getElementById(id).value;
		} else {
			const select2Container = document.querySelector(`#${id}`).nextElementSibling;
			const selectedElements = select2Container.querySelectorAll('.select2-selection__choice');
			const selectedTitles = Array.from(selectedElements).map((element) => element.getAttribute('title'));
			result = selectedTitles;
			/* _setSelect2Dropdowns(); */
		}

		if (id === 'autoPortal' && btn[selected].includes('Per Hour') && !challengeActive('Daily') && mapSettings.voidTrigger && mapSettings.voidTrigger.includes('Per Hour')) {
			MODULES.mapFunctions.afterVoids = false;
			MODULES.mapFunctions.afterPoisonVoids = false;
			mapSettings.portalAfterVoids = false;
			game.global.addonUser.mapFunctions.afterVoids = false;
		}

		btn[selected] = result;
	}

	if (getPageSetting('autoPortalTimeout')) {
		const portalSettings = ['autoPortal', 'heliumChallenge', 'heliumHourChallenge', 'heliumOneOffChallenge', 'heliumC2Challenge', 'autoPortalZone', 'heliumDontPortalBefore', 'heliumHrBuffer', 'heliumHrPortal', 'heliumHrExitSpire', 'autoPortalUniverseSwap'];
		const challengePortalSettings = ['frigidAutoPortal', 'mayhemAutoPortal', 'pandemoniumAutoPortal', 'desolationAutoPortal'];
		const dailyPortalSettings = ['dailyPortalStart', 'dailyPortal', 'dailyPortalZone', 'dailyAbandonZone', 'dailyDontPortalBefore', 'dailyHeliumHrBuffer', 'dailyHeliumHrPortal', 'dailyHeliumHrExitSpire', 'dailyPortalFiller', 'dailyPortalPreviousUniverse', 'dailyDontCap', 'dailyDontCapAmt', 'dailySkip'];
		const c2PortalSettings = ['c2Finish', 'c2RunnerStart', 'c2RunnerMode', 'c2RunnerPortal', 'c2RunnerPercent', 'c2RunnerEndMode', 'c2Fused'];

		if (portalSettings.includes(id) || challengePortalSettings.includes(id) || dailyPortalSettings.includes(id) || c2PortalSettings.includes(id)) {
			_settingTimeout('autoPortal');
		}
	}

	const updateSettings = ['universeSetting'];
	if (id.includes('heirloomAutoRareToKeep')) updateSettings.push(id);

	saveSettings();
	updateAutoTrimpSettings(updateSettings.includes(id));
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
	const element = document.getElementById(id);
	element.innerHTML = `${setting.name()}: ${displayNum}`;

	const elemText = element.innerHTML.replace(/<span class="icomoon icon-infinity"><\/span>/g, '∞');
	if (elemText.length > 26) {
		const reduceBy = 1 - (elemText.length - 24) * 0.03;
		element.style.fontSize = `${reduceBy}vw`;
	} else {
		element.style.fontSize = '1vw';
	}

	if (id === 'presetCombatRespecCell') {
		MODULES.portal.disableAutoRespec = 0;
	}

	if (num > game.global.world && (id === 'dailyDontPortalBefore' || id === 'heliumHrDontPortalBefore')) {
		MODULES.mapFunctions.afterVoids = false;
		mapSettings.portalAfterVoids = false;
		game.global.addonUser.mapFunctions.afterVoids = false;
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
			displayText = textVal.length > 18 ? textVal.substring(0, 18) + '...' : textVal;
		}
		element.innerHTML = setting.name() + ': ' + displayText;

		const elemText = element.innerHTML.replace(/<span class="icomoon icon-infinity"><\/span>/g, '∞');
		if (elemText.length > 26) {
			const reduceBy = 1 - (elemText.length - 24) * 0.03;
			element.style.fontSize = `${reduceBy}vw`;
		} else {
			element.style.fontSize = '1vw';
		}
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
			if (element && ['block', 'grid'].includes(element.style.display)) {
				element.style.display = 'none';
				if (id === 'graphParent') trimpStatsDisplayed = false;
			}
		});

		toggleSettingsMenu();
		return;
	}

	const autoTrimpsTabBarMenu = document.getElementById('autoTrimpsTabBarMenu');
	const autoSettings = document.getElementById('autoSettings');

	if (usingRealTimeOffline && !getPageSetting('timeWarpDisplay')) {
		if (autoTrimpsTabBarMenu.parentNode.id === 'settingsRow') {
			document.getElementById('settingsRowTW').append(autoSettings, autoTrimpsTabBarMenu);
			autoTrimpsTabBarMenu.style.display = 'none';
			autoSettings.style.display = 'none';
		}
	} else {
		if (autoTrimpsTabBarMenu.parentNode.id === 'settingsRowTW') {
			document.getElementById('settingsRow').prepend(autoSettings, autoTrimpsTabBarMenu);
			autoTrimpsTabBarMenu.style.display = 'none';
			autoSettings.style.display = 'none';
		}
	}

	if (game.options.displayed) toggleSettingsMenu();
	items.forEach((item) => {
		const element = document.getElementById(item);
		if (element !== null) {
			if (['block', 'grid'].includes(element.style.display)) {
				element.style.display = 'none';
				if (item === 'graphParent') trimpStatsDisplayed = false;
			} else {
				if (item !== 'graphParent') element.style.display = 'block';
				if (item === 'autoSettings') updateAutoTrimpSettings(true);
			}
		}
	});
}

function updateAutoTrimpSettings(forceUpdate) {
	atConfig.settingUniverse = autoTrimpSettings.universeSetting.value + 1;

	for (const setting in autoTrimpSettings) {
		if (['ATversion', 'ATversionChangelog', 'versionChangelog', 'ATprofile'].includes(setting)) continue;

		const item = autoTrimpSettings[setting];
		const settingUniverse = item.universe;

		if (item === null || typeof item.id === 'undefined' || !Array.isArray(settingUniverse)) {
			if (atConfig.initialise.loaded) delete autoTrimpSettings[setting];
			continue;
		}

		const displaySetting = settingUniverse.includes(atConfig.settingUniverse) || settingUniverse.includes(0);
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

	if (setting && setting.type.includes('dropdown')) {
		let selected = 'selected';
		if (atConfig.settingUniverse === 2 && !setting.universe.includes(0)) selected += 'U2';
		element.value = setting[selected];
	}
}

function _setDisplayedSettings(item) {
	const elem = document.getElementById(item.id);
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
		for (const dropdown in listItems) {
			const option = document.createElement('option');
			option.value = listItems[dropdown];
			option.text = listItems[dropdown];
			if (Array.isArray(itemSelected) && itemSelected.includes(option.value)) {
				option.selected = true;
			}
			elem.appendChild(option);
		}

		if (item.type === 'dropdown') elem.value = itemSelected;
	};

	if (item.type === 'boolean') {
		handleBooleanType(item, elem);
	} else if (['value', 'valueNegative', 'multitoggle', 'multiValue', 'textValue', 'multiTextValue'].includes(item.type)) {
		handleValueType(item, elem);
	} else if (item.type.includes('dropdown')) {
		handleDropdownType(item, elem);
	} else {
		elem.innerHTML = item.name();
	}

	const elemText = elem.innerHTML.replace(/<span class="icomoon icon-infinity"><\/span>/g, '∞');
	if (item.type !== 'dropdown' && (elemText.length > 26 || ['spireDominanceStanceC2', 'windStackingRatioDaily'].includes(item.id))) {
		const reduceBy = 1 - (elemText.length - 24) * 0.03;
		elem.style.fontSize = `${reduceBy}vw`;
	} else {
		elem.style.fontSize = '1vw';
	}

	const setTooltip = (elem, name, description) => {
		if (item.type.includes('dropdown')) elem = elem.parentNode;
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
		const name = item.name();
		let description = item.description();
		if (item.id !== 'jobType' && name.length > 1) description += `<p><br><i>Set to<b> ${name[0]}</b> by holding <b>control</b> and clicking.</i></p>`;
		setTooltip(elem, name.join(' | '), description);
	} else {
		setTooltip(elem, item.name(), item.description());
		setOnClick(elem, item);
	}
}

function _setDisplayedTabs() {
	const displayAllSettings = getPageSetting('displayAllSettings');
	const radonOn = autoTrimpSettings.universeSetting.value === 1;
	const hze = radonOn ? game.stats.highestRadLevel.valueTotal() : game.stats.highestLevel.valueTotal();

	const tabList = {
		tabBeta: !gameUserCheck(),
		tabBuildings: !displayAllSettings && (radonOn || (!radonOn && hze < 60)),
		tabC2: !displayAllSettings && !radonOn && hze < 65,
		tabChallenges: !displayAllSettings && hze < (radonOn ? 35 : 40),
		tabDaily: !displayAllSettings && !radonOn && hze < 99,
		tabFluffy: radonOn || (!displayAllSettings && game.global.spiresCompleted < 2),
		tabJobs: radonOn || (!displayAllSettings && hze < 70),
		tabHeirloom: game.global.totalPortals === 0,
		tabMagma: radonOn || (!displayAllSettings && hze < 230),
		tabNature: radonOn || (!displayAllSettings && hze < 236),
		tabSpire: !displayAllSettings && hze < (radonOn ? 270 : 170),
		'tabSpire Assault': !displayAllSettings && game.stats.highestRadLevel.valueTotal() < 75,
		tabTest: !gameUserCheck()
	};

	for (const tab in tabList) {
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
		$('select.select2').each(function () {
			const multi = $(this).hasClass('select2-multi');
			$(this).select2({
				closeOnSelect: !multi,
				multiple: multi,
				templateSelection: function (dropdownSetting) {
					return _setSelect2DropdownsPrefix(dropdownSetting, multi);
				},
				escapeMarkup: function (m) {
					return m;
				},
				tokenSeparators: [','],
				maximumSelectionLength: multi ? 17 : undefined
			});
			if ($(this).hasClass('custom-style')) {
				let textElem = this.parentNode.children[1].children[0].children[0].children[0].children[0];

				const onPortalAutoStructure = textElem.innerHTML === 'Setting On Portal:' && this.parentNode.title !== 'AutoJobs';
				const onPortalAutoJobs = textElem.innerHTML === 'Setting On Portal:' && this.parentNode.title === 'AutoJobs';

				if (textElem.innerHTML === 'Setting On Portal:') {
					this.parentNode.children[1].style.marginLeft = '0.05em';
				}

				const elemWidth = onPortalAutoStructure ? 'calc((100% - 1.4em + 1px) / 5.1)' : onPortalAutoJobs ? 'calc((100% - 1.4em + 3px) / 5.4)' : '9vw';
				this.parentNode.children[1].style.minWidth = elemWidth;
				this.parentNode.children[1].style.maxWidth = elemWidth;
				textElem.parentNode.style.fontSize = '0.7vw';
			}
		});
	});
}

function _setSelect2DropdownsPrefix(dropdownSetting, multi) {
	const prefix = dropdownSetting._resultId.split('-');
	const setting = autoTrimpSettings[prefix[1]];
	const prefixName = prefix && setting ? `${setting.name()}: ` : `${prefix[1]}:`;
	const text = dropdownSetting.text;
	const fontColor = setting && setting.universe ? '#00A7E1' : '#888';

	if (multi) {
		const selectedItems = setting.selected;
		let itemsText;

		if (Array.isArray(selectedItems) && selectedItems.length > 0) {
			itemsText = selectedItems.join(', ');
		} else {
			itemsText = 'None';
		}

		return `<font color='${fontColor}'>${prefixName}</font> ${itemsText}`;
	}

	return `<font color='${fontColor}'>${prefixName}</font> <float='right'>${text}</float>`;
}

function _settingsToLineBreak() {
	const heirloom = getPageSetting('heirloomAuto', atConfig.settingUniverse) ? 'show' : 'hide';

	const breakAfterCore = ['pauseScript', 'universeSetting'];
	const breakAfterMaps = ['mapBonusPrestige', 'mapBonusLevelType', 'prestigeClimbPriority', 'uniqueMapEnoughHealth'];
	const breakAfterDaily = ['avoidEmpower', 'dailyHeliumHrPortal'];
	const breakAfterEquipment = ['equipPercent', 'equipNoShields'];
	const breakAfterCombat = ['forceAbandon', 'scryerVoidMapsDaily', 'frenzyCalc', 'scryerEssenceOnly', 'scryerHealthy', 'windStackingLiq', 'windStackingLiqDaily'];
	const breakAfterJobs = ['geneAssistTimerSpire', 'geneAssistTimerAfter', 'geneAssistTimerSpireDaily'];
	const breakAfterC2 = ['c2DisableFinished', 'c2Fused', 'duelShield', 'trapperWorldStaff', 'mapologyMapOverrides', 'lead', 'frigidAutoPortal', 'experienceEndBW', 'witherMutatorPreset', 'questSmithySpire', 'mayhemAutoPortal', 'stormStacks', 'berserkDisableMapping', 'pandemoniumAutoPortal', 'glassStacks', 'desolationSettings'];
	const breakAfterBuildings = ['deltaGigastation', 'autoGigaForceUpdate'];
	const breakAfterChallenges = ['balanceImprobDestack', 'buble', 'decayStacksToAbandon', 'lifeStacks', 'toxicitySettings', 'archaeologyString3', 'exterminateWorldStaff'];
	const breakAfterHeirlooms = ['heirloomPlaguebringer', 'heirloomWindStack', 'heirloomSwapHDCompressed', 'heirloomStaffFragment', 'heirloomStaffScience'];
	const breakAfterSpire = ['spireSkipMapping', 'spireSkipMappingC2'];
	const breakAfterMagma = ['autoGenModeC2', 'magmiteAutoFuelForceRun'];
	const breakAfterNature = ['autoIce', 'autoEnlightenment', 'iceEnlight', 'iceEnlightDaily'];
	const breakAfterDisplay = ['enableAFK', 'shieldGymMostEfficientDisplay'];
	const breakAfterImportExport = ['mutatorPresets'];
	const breakAfterHelp = ['helpShieldGym', 'helpFragments'];
	const breakAfterTest = ['testTotalEquipmentCost'];

	const breakAfterIDs = [...breakAfterCore, ...breakAfterMaps, ...breakAfterDaily, ...breakAfterEquipment, ...breakAfterCombat, ...breakAfterJobs, ...breakAfterC2, ...breakAfterBuildings, ...breakAfterChallenges, ...breakAfterHeirlooms, ...breakAfterSpire, ...breakAfterMagma, ...breakAfterNature, ...breakAfterDisplay, ...breakAfterImportExport, ...breakAfterHelp, ...breakAfterTest];

	const breakAfterHeirloomIDs = ['heirloomAutoForceRun', 'heirloomAutoBlacklistShield', 'heirloomAutoBlacklistStaff'];

	breakAfterIDs.forEach((id) => _setSettingLineBreaks(id, 'show'));
	breakAfterHeirloomIDs.forEach((id) => _setSettingLineBreaks(id, heirloom));

	if (getPageSetting('displayAllSettings') || (getPageSetting('autoPortal', atConfig.settingUniverse).includes('Hour') && (holidayObj.holiday === 'Eggy' || game.stats.highestLevel.valueTotal() >= 170 || getPageSetting('heliumHourChallenge', atConfig.settingUniverse).includes('Challenge'))) || Fluffy.checkU2Allowed()) {
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

	if (style === 'show' && !isBreak(elemSibling) && (elemSibling.style.display !== 'none' || id === 'pauseScript')) {
		elem.insertAdjacentHTML('afterend', '<br>');
	}

	if (style === 'hide' && isBreak(elemSibling)) {
		elemSibling.remove();
	}

	if (isBreak(elemSibling) && nextElemSibling.style.display === 'none' && id !== 'pauseScript') {
		elemSibling.remove();
	}
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
	for (const attr in attributes) {
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
		id: `auto${label}${timeWarp}Parent`,
		style: initialStyle,
		class: 'col-xs-3 lowPad'
	});

	const containerStyle = timeWarp ? 'position: relative; min-height: 1px; padding-left: 5px; font-size: 1.1vw; height: auto; border-color: #5D5D5D;' : 'display: block; font-size: 0.9vw; border-color: #5D5D5D;';
	const container = _createElement('DIV', {
		style: containerStyle,
		class: `toggleConfigBtn pointer noselect autoUpgradeBtn settingBtn${setting === 2 ? 3 : setting}`,
		onmouseover: `tooltip("Toggle Auto${label}", "customText", event, ${tooltipText})`,
		onmouseout: 'tooltip("hide")'
	});

	const settingName = settingInfo.type === 'multitoggle' ? autoTrimpSettings[id].name()[setting] : autoTrimpSettings[id].name();
	const elemText = settingName.startsWith('AT ') ? settingName : `AT ${settingName}`;
	const text = _createElement(
		'DIV',
		{
			id: `auto${label}Label${timeWarp}`,
			onClick: `settingChanged('${id}', true)`
		},
		[elemText]
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

	const newChanges = autoTrimpSettings.ATversionChangelog !== atConfig.initialise.version;
	const versionNumber = atConfig.initialise.version.split('SadAugust ')[1].replace(/[a-z]/gi, '');
	const changelog = _createElement(
		'TD',
		{
			id: 'atChangelog',
			class: 'btn' + (newChanges ? ' btn-changelogNew' : ' btn-primary'),
			onclick: "window.open(atConfig.initialise.basepath + 'updates.html', '_blank'); updateChangelogButton();"
		},
		['AT v' + versionNumber + (newChanges ? " | What's New" : '')]
	);

	const settingbarRow = document.getElementById('settingsTable').firstElementChild.firstElementChild;
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

	const settingbarRow = document.getElementById('settingsTable').firstElementChild.firstElementChild;
	settingbarRow.insertBefore(atSettings, settingbarRow.childNodes[10]);
}

function _createAutoMapsButton() {
	if (document.getElementById('autoMapBtn') !== null) return;

	const fightButtonCol = document.getElementById('battleBtnsColumn');

	const autoMapsContainer = _createElement(
		'DIV',
		{
			id: 'autoMapBtn',
			style: 'margin-top: 0.2vw; display: block; font-size: 1vw; height: 1.5em; text-align: center; border-radius: 4px',
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
		id: 'autoMapStatus',
		class: 'noselect',
		style: 'display: block; font-size: 1vw; text-align: center; background-color: rgba(0,0,0,0.3);',
		onmouseout: 'tooltip("hide")'
	});

	fightButtonCol.appendChild(autoMapsStatusContainer);
}

function _createResourcePerHourContainer() {
	if (document.getElementById('heHrStatus') !== null) return;

	const fightButtonCol = document.getElementById('battleBtnsColumn');

	const resourcePerHourContainer = _createElement('DIV', {
		id: 'heHrStatus',
		style: 'display: ' + (!getPageSetting('displayHideAutoButtons').ATheHr ? 'block' : 'none') + '; font-size: 1vw; text-align: center; margin-top: 2px; background-color: rgba(0,0,0,0.3);',
		onmouseout: 'tooltip("hide")'
	});

	fightButtonCol.appendChild(resourcePerHourContainer);
}

function _createAdditionalInfoTextbox() {
	if (document.getElementById('additionalInfo') !== null) return;

	const additionalInfoContainer = _createElement('DIV', {
		id: 'additionalInfoParent',
		class: 'workBtn pointer noSelect',
		style: 'display: block; font-size: 0.9vw; text-align: centre; solid black; transform:translateY(-1.5vh); max-width: 95%; margin: 0 auto',
		onClick: 'farmCalcSetMapSliders()',
		onmouseover: '',
		onmouseout: 'tooltip("hide")'
	});

	const additionalInfoText = _createElement('SPAN', { id: 'additionalInfo' });
	additionalInfoContainer.appendChild(additionalInfoText);

	const trimpsButtonCol = document.getElementById('trimps');
	trimpsButtonCol.appendChild(additionalInfoContainer);

	trimpsButtonCol.addEventListener('click', (event) => {
		if (event.ctrlKey || event.metaKey) {
			importExportTooltip('display');
		}
	});
}

function _createAutoJobsButton() {
	if (document.getElementById('autoJobsLabel') !== null) return;

	document.getElementById('fireBtn').parentElement.style.width = '11.2%';
	document.getElementById('fireBtn').parentElement.style.paddingRight = '7px';
	document.getElementById('jobsTitleSpan').parentElement.style.width = '10%';

	const jobButton = _createButton('jobType', 'Jobs', getPageSetting('jobType'), 'autoTrimpSettings.jobType.description()');
	jobButton.style = 'width: 28%;';
	jobButton.children[0].children[0].style = 'width: 87%;';
	jobButton.children[0].children[1].style = 'width: 13%;';
	const jobColumn = document.getElementById('jobsTitleDiv').children[0];
	jobColumn.insertBefore(jobButton, jobColumn.children[2]);

	jobButton.addEventListener('click', (event) => {
		if (event.ctrlKey || event.metaKey) {
			_resetMultiToggleSetting('jobType', game.global.universe);
			_setAutoJobsClasses();
		}
	});
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

	const atBtnContainer = _createElement('DIV', {
		id: 'AutoTrimpsFilterParent',
		class: 'btn-group',
		role: 'group',
		onmouseover: 'tooltip("Toggle AutoTrimps Messages", "customText", event, `This will control the visibility of AutoTrimps messages in the log window based on your settings.<br>Note: Only map-related messages will be displayed during Time Warp.`)',
		onmouseout: 'tooltip("hide")'
	});
	const btnDisplay = `btn-${getPageSetting('spamMessages').show ? 'success' : 'danger'}`;
	const atBtnText = _createElement(
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
		onclick: 'importExportTooltip("messageConfig")',
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

	const settingBarRow = document.createElement('DIV');
	settingBarRow.setAttribute('id', 'settingsRowTW');
	document.getElementById('offlineWrapper').children[0].insertAdjacentHTML('afterend', '<br>');
	const offlineWrapperParent = document.getElementById('offlineInnerWrapper').parentNode;
	offlineWrapperParent.replaceChild(settingBarRow, document.getElementById('offlineInnerWrapper').parentNode.children[1]);
}

function _createBtnRowTW() {
	const settingsRow = document.createElement('DIV');
	settingsRow.setAttribute('class', 'row');
	settingsRow.setAttribute('id', 'settingBtnTW');
	settingsRow.setAttribute('style', 'display: block');

	document.getElementById('offlineInnerWrapper').children[3].insertAdjacentHTML('afterend', '<br>');
	const offlineProgressParent = document.getElementById('offlineProgressWrapper').parentNode;
	offlineProgressParent.replaceChild(settingsRow, document.getElementById('offlineProgressWrapper').parentNode.children[4]);
}

function _createAutoJobsButtonTW() {
	if (document.getElementById('autoJobsLabelTW') !== null) return;

	const atJobInitial = _createButton('jobType', 'Jobs', getPageSetting('jobType'), 'autoTrimpSettings.jobType.description()', 'TW');
	atJobInitial.style = 'width: 29%';
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
		const elem = document.getElementById(elemId);
		if (elem !== null) {
			elem.parentNode.setAttribute('class', `toggleConfigBtn noselect pointer autoUpgradeBtn settingBtn${btnVal === 2 ? 3 : btnVal}`);
			if (elemId === 'jobType') {
				elem.parentNode.classList.remove('toggleConfigBtn');
				elem.innerHTML = btnName;
			}

			elem.textContent = btnName;
		}
	});
}

function _resetMultiToggleSetting(id, universe = atConfig.settingUniverse) {
	const elem = document.getElementById(id);

	if (elem !== null) {
		setPageSetting(id, 0, universe);
		elem.textContent = autoTrimpSettings[id].name()[0];
		elem.setAttribute('class', `toggleConfigBtn noselect settingsBtn settingBtn${0}`);
	}
}
