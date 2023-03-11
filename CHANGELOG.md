## Changes made from Zek's fork

**General** 

Removed all the old u1 settings

Fixed spacing between lines in AT settings

Buildings tab has been removed. Instead it has been worked into an AutoStructure setting on the Trimps buildings tab. Inside you'll have percentage of resource to spend and cap options for each building. 

Jobs tab has been removed. Instead it has been worked into an AutoJobs setting on the Trimps jobs tab. Inside you'll have percentage of resource to spend and cap options for each job.
	
	Now has a 'Farmers Until' setting which will fire Farmers after a specified zone when not running one of AT's farming settings.
	
	Now has a 'No Lumberjacks Post MP' setting which will fire Lumberjacks after Melting Point has been run when not running one of AT's farming settings.

Info for void map tracker, recommended map level for autoLevel displayed in trimps column.

Settings won't display for challenges until they've been unlocked in your save. Messages will be put in the chat tab when you've unlocked a different setting.

The status setting will now actually display relevant information for the farming that AT is currently doing.

**Core**

Preset swapping - Will swap between preset 1 when running fillers and preset 2 when doing dailies, preset 3 when doing C3s

Download saves - Downloads saves when AutoPortal runs.

AutoPortal Zone has been changed to zone reached rather than cleared zone so will need to be -1 from what you setup on other branches.

AutoPortal - Now has an option for portaling into specific C3s.

**Gear**

AE: Zone - Allows for mutliple inputs, 

AE: Highlighted Equips - Same logic as the basic games but if AutoEquip wants to buy a prestige it'll highlight the prestige upgrade.

AE: No Shields - Will stop AT from buying shield upgrades/prestiges. Useful for late game where your shield is a very low percentage of your total health so you can get buildings and smithies instead.

AE: Portal - Will turn on AutoEquip when you portal.

AE: Prestige - Various settings for when to prestige equips, read tooltip for more info.

**Gear**

Implemented a highlighting system that goes over prestiges too instead of just equips

AE: Zone is an array and allows for multiple inputs, will start buying forever from the last item in the array onwards

AE: Prestige & AE: Highest Prestige are new

**Maps**

All of the map settings have been condensed into various buttons.

Farming Setting priorities are

	Vanilla MAZ > Quest > Pandemonium Destacking > Smithy Farm > Map Farm > Tribute Farm > Worshipper Farm > Map Destacking (Unbalance, Storm, Bloodthirst) > Prestige Raiding > Mayhem > Insanity > Pandemonium Jestimp Farm > Pandemonium Farm > Alchemy > Hypothermia > HD Farm > Void Maps > Quagmire > Map Bonus > Smithless

Unique Map Settings
	
	Has got the settings for all Unique Maps you'd want to run in it. Can set zones & cells for them to be run on.
	
	MP Smithy settings for fillers, dailies & c3s are in here.

Farming Settings 

	All settings have a 'Active' button in the top section which will either completely enable or disable the setting.

	All settings have a 'Active' button for each row which will either have AT check for if the line should be run or not.

	All settings have a 'Run Type' option which allows you to run them on different types of runs.
	
	All settings that run maps have an AutoLevel button which will have AT automatically identify the best type of map you can run, best used in conjunction with 'Auto Equality Advanced' setting in the combat tab to save time.

HD Farm Settings

	Farming HD settings into this button and now allows you to dynamically update your input with a HD Mult setting.
	
	Has an end zone setting to allow you to run it until a set zone.

Worshipper Farm Settings

	Has skip value which can be seen in more detail in the 'Help' tab.
	
	Has repeat every X and run until Y settings to save you from having unnecessary lines.

Bone Shrine Settings

	Dedicated tab for what zone to use X amount of Bone Charges on. Has Gather settings which will make it automatically switch to that Gather setting when run and will equip the right heirloom for the setting if it has been defined in the heirlooms tab.

Void Map Settings

	Void Map Settings have been reworked to allow you to use a range of zones where the void zone is dependant on both your HD & Void HD Ratios that you input, whenever one of the 2 values has been reached it'll run voids so the need for split tabbing voids is removed.

Map Bonus Settings

	'Max MapBonus Health' settings have been put into the top section of this setting.
	Map Bonus works by using the last line that's greater or equal to your current world zone and then using those settings for every zone that follows on from it.
	
	Lets you have multiple inputs for amount of map stacks you desire for more potential optimisation. 

Map Farm Settings

	This is a conversion of Zek's 'Time Farm' setting, will run based off a map count setting which will allow you to run X maps on a zone rather than doing it based off time on a zone.
	
	Has repeat every X and run until Y settings to save you from having unnecessary lines.
	
	Has a 'Run Atlantrimp' button which will run Atlantrimp after the line has been finished, stops AutoEquip from buying Equipment when this line is being run so that you can do large metal farms.

Tribute Farm Settings

	Has options for farming Meteorologists on each line.
	
	Has repeat every X and run until Y settings to save you from having unnecessary lines.
	
	Has a setting for Farm Type. The options are either absolute values where it'll farm to X or Map Count where it'll identify how many tributes/mets it can farm in the amount of maps you specified.
	
	Has a 'Buy Buildings' button which will enable or disable AT purchasing buildings while the line is being run.
	
	Has a 'Run Atlantrimp' button which will run Atlantrimp when you've got half the food necessary to finish the line.

Smithy Farm Settings

	Has a setting for Farm Type. The options are either absolute values where it'll farm to X or Map Count where it'll identify how many tributes/mets it can farm in the amount of maps you specified.
	
	Has a 'Run MP' button which will run Melting Point when you've finished the line.

Raiding Settings

	All raiding settings from the Raiding tab have been consolidated into this setting.

**Daily**

Added a bloodthirst destack setting which will remove Bloodthirst stacks when you're 1 away from the enemy healing to full.

DP: Custom now has a cogwheel for additional settings, these settings will allow you to reduce your daily portal zone by a certain value when a daily has a specific modifier.

Added option for filler runs so if you need to run 6 dailies it'd do a daily then a hypo then a daily then a hypo etc

**C3**

Option to buy max buildings till x zone so it'll spend 100% resources on buildings till that point. 

Option for buying bone upgrades 

Unbalance destacking options

Trappa max coords option

Quest now has a button to toggle it on and off and has logic for purchasing excess smithies

Storm destacking options

Smithless farming setting (isn't fully implemented, only goes for 3/3)

Trappa stop buying coords at input

**Challenges**

Insanity Farm Settings

	Added setting for destacking where it'll allow you to reduce your Insanity

Alchemy Farm Settings

	Gasesous Brew potions will only purchase when you can afford all the potions you are farming for to stop you unnecessarily making enemies harder than they need to be.

	Void Purchase toggle which will purchase as many PoS & PotV potions when running Void Maps.

Hypo Farm Settings

	Hypo Frozen Castle setting is in the top bar, input needs to be (zone,cell).

	Auto Storage setting in the top bar

	Packrat setting in the top bar which will set Packrat to 3 when portaling into Hypo and then buy as many Packrat levels as possible when you finish the challenge.

**Combat**

Auto Equality now has a third toggle option for Auto Equality which will cause AT to identify the best equality to use for the enemy you're against.
	
	Currently doesn't work for Wither or Glass

Added Gamma Burst calc setting to factor it into HD Ratio

Added Mutation calc setting to factor it into HD Ratio

**Heirlooms**

Added a 'Map Swap' option where it equips your afterpush shield during maps so you can get plaguebringer while doing any farming

Added 'Void PB Swap' which will swap to your initial staff when the next enemy is fast to start the fast enemy with as little health as possible. Will only work with Auto Equality. 

Added settings for Daily & C3 swap zones.

Added options for each cache staff that will equip when you're in a map with that cache

**Display**

Added setting 'Map Count Output' which will output relevant information (time taken, amount of maps run, map level) when you finish any farming setting.