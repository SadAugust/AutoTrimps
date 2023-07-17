function callBetterAutoFight() {
	if (getPageSetting('autoFight') === 0) return;
	else if (getPageSetting('autoFight') === 1) betterAutoFight();
	else if (getPageSetting('autoFight') === 2) betterAutoFight3();
}

function betterAutoFight() {
	if (game.global.autoBattle && !game.global.pauseFight)
		pauseFight();
	if (game.global.gridArray.length === 0 || game.global.preMapsActive || !game.upgrades.Battle.done || MODULES.maps.livingActive) return;
	var breeding = (game.resources.trimps.owned - game.resources.trimps.employed);

	var lowLevelFight = game.resources.trimps.maxSoldiers < breeding * 0.5 && breeding > game.resources.trimps.realMax() * 0.3 && game.global.world <= 5;

	if (!game.global.fighting) {
		if (newArmyRdy() || game.global.soldierHealth > 0 || lowLevelFight || challengeActive('Watch')) {
			fightManual();
		}
	}
}

function betterAutoFight3() {
	if (game.global.autoBattle && game.global.pauseFight && !game.global.spireActive)
		pauseFight();
	if (game.global.gridArray.length === 0 || game.global.preMapsActive || !game.upgrades.Battle.done || game.global.fighting || game.global.spireActive || MODULES.maps.livingActive)
		return;
	if (game.global.world === 1 && !game.global.fighting) {
		fightManual();
	}
}



//Suicides trimps if we don't have max anticipation stacks and sending a new army would give us max stacks.
//Doesn't do this inside of void maps OR spires.
function trimpcide() {
	if (game.portal.Anticipation.level === 0) return;
	if (!game.global.fighting) return;
	if (!getPageSetting('ForceAbandon')) return;
	const mapsActive = game.global.mapsActive;
	if (!mapsActive && game.global.spireActive) return;

	var antistacklimit = (game.talents.patience.purchased) ? 45 : 30;
	if (game.global.antiStacks >= antistacklimit) return;
	//Calculates Anticipation stacks based on time since last breed.
	var baseCheck = ((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) >= antistacklimit;

	if (baseCheck) {
		forceAbandonTrimps();
	}
}

//Abandons trimps to get max anticipation stacks.
function forceAbandonTrimps() {
	if (!getPageSetting('ForceAbandon')) return;
	if (!getPageSetting('autoMaps')) return;
	if (!game.global.mapsUnlocked) return;
	if (game.global.preMapsActive) return;
	//Exit and restart the map. If we are in the world, enter the world again.
	if (game.global.mapsActive) {
		mapsClicked(true);
		runMap();
	}
	else {
		mapsClicked(true);
		mapsClicked(true);
	}
	debug("Abandoning Trimps to resend army with max Anticipation stacks.", "other");
}

//Check if we would die from the next enemy attack
function armydeath() {
	if (game.global.mapsActive) return !1;
	var cell = game.global.lastClearedCell + 1,
		enemyAttack = game.global.gridArray[cell].attack * dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks),
		ourHealth = game.global.soldierHealth;
	"Ice" === getEmpowerment() && (enemyAttack *= game.empowerments.Ice.getCombatModifier());
	var block = game.global.soldierCurrentBlock;
	return (
		3 === game.global.formation ? (block /= 4) : "0" !== game.global.formation && (block *= 2),
		block > game.global.gridArray[cell].attack ? (enemyAttack *= getPierceAmt()) : (enemyAttack -= block * (1 - getPierceAmt())),
		challengeActive('Daily') && void 0 !== game.global.dailyChallenge.crits && (enemyAttack *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength)),
		void 0 !== game.global.dailyChallenge.bogged && (ourHealth -= game.global.soldierHealthMax * dailyModifiers.bogged.getMult(game.global.dailyChallenge.bogged.strength)),
		void 0 !== game.global.dailyChallenge.plague && (ourHealth -= game.global.soldierHealthMax * dailyModifiers.plague.getMult(game.global.dailyChallenge.plague.strength, game.global.dailyChallenge.plague.stacks)),
		challengeActive('Electricity') && (ourHealth -= game.global.soldierHealth -= game.global.soldierHealthMax * (0.1 * game.challenges.Electricity.stacks)),
		"corruptCrit" === game.global.gridArray[cell].corrupted
			? (enemyAttack *= 5)
			: "healthyCrit" === game.global.gridArray[cell].corrupted
				? (enemyAttack *= 7)
				: "corruptBleed" === game.global.gridArray[cell].corrupted
					? (ourHealth *= 0.8)
					: "healthyBleed" === game.global.gridArray[cell].corrupted && (ourHealth *= 0.7),
		(ourHealth -= enemyAttack) <= 1e3
	);
}

//Suicides army to avoid empower stacks if the next enemy attack would kill us.
function avoidEmpower() {
	if (!(typeof game.global.dailyChallenge.bogged === 'undefined' && typeof game.global.dailyChallenge.plague === 'undefined')) return;
	if (!armydeath()) return;
	if (game.global.universe !== 1) return;

	mapsClicked(true);
	mapsClicked(true);
	debug("Abandoning Trimps to avoid Empower stacks.", "other");
	return;

}