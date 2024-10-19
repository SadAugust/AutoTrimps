function testChallenges() {
	const challenges = {
		1: ['Size', 'Slow', 'Watch', 'Discipline', 'Balance', 'Meditate', 'Metal', 'Lead', 'Nom', 'Toxicity', 'Electricity', 'Coordinate', 'Trimp', 'Obliterated', 'Eradicated', 'Mapology', 'Trapper'],
		2: ['Unlucky', 'Unbalance', 'Quest', 'Storm', 'Downsize', 'Transmute', 'Duel', 'Wither', 'Glass', 'Smithless', 'Trappapalooza', 'Berserk']
	};

	const challengeAdjustements = {
		1: {
			balance: () => {
				game.challenges.Balance.balanceStacks = 200;
			},
			toxicity: () => {
				game.challenges.Toxicity.stacks = 200;
			},
			electricity: () => {
				game.challenges.Electricity.stacks = 200;
			},
			mapology: () => {
				game.challenges.Mapology.credits = 50;
			}
		},
		2: {
			unbalance: () => {
				game.challenges.Unbalance.balanceStacks = 200;
			},
			quest: () => {
				game.challenges.Quest.getNextQuest();
			},
			wither: () => {
				game.challenges.Wither.trimpStacks = 10000;
				game.challenges.Wither.enemyStacks = 10000;
			},
			storm: () => {
				game.challenges.Storm.beta = 100;
			},
			glass: () => {
				game.challenges.Glass.shards = 200;
				game.challenges.Glass.crystals = 4;
			},
			smithless: () => {
				game.global.world = 174;
				game.global.lastClearedCell = 99;
				nextWorld();
				startFight();
			}
		}
	};

	const testChallenge = (challenge) => {
		console.log(`${challenge}`);
		game.global.challengeActive = challenge;

		let challengeName = challenge.toLowerCase();
		const challengeSettings = challengeAdjustements[game.global.universe][challengeName];
		if (challengeSettings) challengeSettings();

		console.log(stats());

		if (['balance', 'unbalance', 'storm'].includes(challengeName)) challengeName = 'mapDestacking';
		if (typeof window[challengeName] === 'function') {
			console.log(window[challengeName]());
		}
	};

	testProfile();
	game.heirlooms.Shield.gammaBurst.stacks = 0;
	game.global.universe = 1;
	challenges[1].forEach((challenge) => {
		testChallenge(challenge);
	});

	game.global.universe = 2;
	challenges[2].forEach((challenge) => {
		testChallenge(challenge);
	});
}
