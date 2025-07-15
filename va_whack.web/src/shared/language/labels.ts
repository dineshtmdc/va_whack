/** @format */

export type Lang = 'en' | 'mi';

export const labels = {
	en: {
		// Login & Game Selector Labels
		centerTitle: 'Vision Testing App with Gamification',
		centerSubtitle: 'Welcome',
		login: 'Login',
		newPlayer: 'New Player',
		existingPlayer: 'Existing Player',
		name: 'Name',
		ageGroup: 'Age Group',
		selectAge: 'Select age...',
		email: 'Email',
		requestPin: 'Request PIN',
		sending: 'Sending...',
		pinLabel: '6-Digit PIN',
		verifyContinue: 'Verify & Continue',
		loginContinue: 'Login & Continue',
		invalidEmail: 'Please enter a valid email.',
		fillFields: 'Please fill in all fields for a new player.',
		registrationSuccess: 'Registration successful! A verification PIN has been sent to your email.',
		loginPinSent: 'A login PIN has been sent to your email.',
		authFailed: 'Authentication failed:',
		fetchFailed: 'Failed to send PIN:',
		invalidPin: 'Please enter a valid email and 6-digit PIN.',
		langToggle: 'Māori',

		gameTitle: 'Vision Science - Visual Acuity Assessment',
		welcome: 'Welcome',
		chooseMode: 'Choose your assessment mode to begin.',
		sessionId: 'Session ID',
		profileAria: 'Go to profile',

		// GameTile keys
		engagementTitle: 'Engagement Mode',
		engagementDescription: 'Track attention using fast-paced stimuli.',
		scaleTitle: 'VA Scale Mode',
		scaleDescription: 'Scale center circle to determine visual threshold.',
		fastTitle: 'VA OKN-FAST Mode',
		fastDescription: 'Estimate vision clarity with reflexive targets.',

		// Profile
		profileTitle: 'Game History',
		profilePlayer: 'Player',
		profileNoSessions: 'No sessions recorded.',
		profileSession: 'Session',
		profileDownloadAI: 'Download Analysis Report',
		profileDownloadGame: 'Download Game Data',
		profileEmail: 'Email Analysis Report',
		profileVAScaleTitle: 'VA Scale Game',
		profileEngagementTitle: 'Engagement Game',
		profileStart: 'Start',
		profileEnd: 'End',
		profileInProgress: 'In progress',
		profileConfig: 'Config',
		profileScore: 'Score',
		profileOuter: 'Outer',
		profileInner: 'Inner',
		profileRatio: 'Ratio',
		profileLogMAR: 'logMAR',
		profileResponse: 'Response',
		profileTime: 'Time',
		profileType: 'Type',
		profileRowCol: 'Row/Col',
		profileClicked: 'Clicked',
		profileHit: 'Hit',
		profileYes: 'Yes',
		profileNo: 'No',

		logoutAria: 'Logout',

		canSee: 'I can see',
		cantSee: 'I cant see',
		giveUp: 'I give up',

		// Inside labels.en
		gameInstructions: {
			engagement: `This game has 5 levels of increasing difficulty.
		Your goal is to click on the targets (moles) as soon as they appear.
		Be careful — some targets are fake moles. Clicking a fake mole counts as a miss.
		Each hit improves your combo score. Missing a real mole or clicking a fake mole resets your combo.
		After 3 successful hits in a row, you’ll see a celebration animation.
		The game ends after all 5 levels are completed.
		Your accuracy, reaction time, and combo achievements are recorded.`,

			scale: `This test measures your visual acuity using a central circle that changes size.
		It begins with a large circle in the center.
		You’ll be asked if you can see the circle clearly ("I can see") or not ("I can't see").
		After each response, the circle scales up or down based on your answer.
		If you say "I can't see", the circle gets bigger. If "I can see", it gets smaller.
		Each level may repeat up to 5 times to confirm consistency.
		The test ends when your vision threshold is identified.`,

			fast: `This test uses reflexive visual tracking to estimate vision clarity.
		A target moves across the screen horizontally.
		Your task is to follow it with your eyes only — don’t move your head.
		The speed and clarity may change over time.
		No clicking is needed — just keep your gaze on the target.
		This helps measure involuntary eye tracking and reflex-based accuracy.`,
		},

		dataConsent: {
			title: 'Data Usage Notice',
			intro: 'This vision testing project collects only minimal personal information : your name, email, and age group and gameplay data. These are used for research and analysis. Your test results will never be made public.',
			acknowledgement: 'By continuing, you acknowledge that you understand how your data will be handled according to these principles.',
			accept: 'I Understand',

			principlesIntro: 'Our approach is guided by Ngā Tikanga Paihere — 5 key principles of responsible data use:',
			principles: {
				pukenga: 'We have the expertise and work in respectful relationships with communities whose data we collect.',
				pono: 'We are transparent and honest in how your data is used, protecting your trust in this research.',
				wananga: 'We follow strong data practices to care for your data throughout the project.',
				wairua: 'Every data activity we do is purposeful and respects the mana of those involved.',
				tapu: 'We carefully balance the benefits of research with the protection of your information.',
			},
		},
	},

	mi: {
		// Translations (Māori)
		centerTitle: 'Taupānga Whakamātau Kite me te Whakamahi Kēmu',
		centerSubtitle: 'Nau mai',
		login: 'Takiuru',
		newPlayer: 'Kaitākaro Hou',
		existingPlayer: 'Kaitākaro Ināianei',
		name: 'Ingoa',
		ageGroup: 'Rōpū Tau',
		selectAge: 'Kōwhiria te tau...',
		email: 'Īmēra',
		requestPin: 'Tonoa te PIN',
		sending: 'Kei te tuku...',
		pinLabel: 'PIN 6-mati',
		verifyContinue: 'Whakaū me te Haere Tonu',
		loginContinue: 'Takiuru me te Haere Tonu',
		invalidEmail: 'Tēnā, whakauruhia he īmēra tika.',
		fillFields: 'Whakaotia ngā pāraimata katoa mō te kaitākaro hou.',
		registrationSuccess: 'Kua angitū te rēhita! Kua tukuna te PIN ki tō īmēra.',
		loginPinSent: 'Kua tukuna he PIN takiuru ki tō īmēra.',
		authFailed: 'I rahua te takiuru:',
		fetchFailed: 'I rahua te tuku PIN:',
		invalidPin: 'Whakauruhia he īmēra tika me te PIN 6-mati.',
		langToggle: 'English',

		gameTitle: 'Pūtaiao Tirohanga - Aromātai Tirohanga Mata',
		welcome: 'Nau mai',
		chooseMode: 'Kōwhiria tō aratau aromātai hei tīmata.',
		sessionId: 'ID Wāhanga',
		profileAria: 'Haere ki te kōtaha',

		engagementTitle: 'Aratau Whaiwhakaaro',
		engagementDescription: 'Aroturuki i te aro i runga i ngā awenga tere.',
		scaleTitle: 'Aratau Ine Rahinga',
		scaleDescription: 'Ine i te porowhita pokapū hei kimi i te paepae tirohanga.',
		fastTitle: 'Aratau OKN-FAST',
		fastDescription: 'Aromātai i te mārama o te tirohanga mā ngā awenga o te karu.',

		profileTitle: 'Hītori Kēmu',
		profilePlayer: 'Kaitākaro',
		profileNoSessions: 'Kāore he wāhanga kua tuhia.',
		profileSession: 'Wāhanga',
		profileDownloadAI: 'Tikiake Pūrongo Tātari',
		profileDownloadGame: 'Tikiake Raraunga Kēmu',
		profileEmail: 'Tukua mā te Īmēra te Pūrongo Tātari',
		profileVAScaleTitle: 'Kēmu Ine Tirohanga',
		profileEngagementTitle: 'Kēmu Whaiwhakaaro',
		profileStart: 'Tīmata',
		profileEnd: 'Mutu',
		profileInProgress: 'Kei te haere tonu',
		profileConfig: 'Tautuhinga',
		profileScore: 'Kaute',
		profileOuter: 'Pae Waho',
		profileInner: 'Pae Roto',
		profileRatio: 'Ōwehenga',
		profileLogMAR: 'logMAR',
		profileResponse: 'Urupare',
		profileTime: 'Wā',
		profileType: 'Momo',
		profileRowCol: 'Rārangi/Ōpiha',
		profileClicked: 'Pāwhiri',
		profileHit: 'Pā atu',
		profileYes: 'Āe',
		profileNo: 'Kāo',

		logoutAria: 'Takiputa',

		canSee: 'Ka kite au', // I can see
		cantSee: 'Kāore au i te kite', // I can't see
		giveUp: 'Ka whakarerea e au', // I give up

		gameInstructions: {
			engagement: `He 5 ngā taumata o tēnei kēmu, ka piki haere te uaua i ia taumata.
		Ko tāu he pāwhiri i ngā ūnga (ngārara) ka puta i runga i te mata i te tere ka taea.
		Kia tūpato — kei reira ngā ngārara rūpahu. Mēnā ka pāwhiri koe i tētahi rūpahu, ka kautea hei hē.
		Ka piki ake tō piro kōmō mēnā ka patu angitu koe i te rārangi.
		Ka hē koe mēnā ka ngaro tētahi ngārara tūturu, ka pāwhiri rānei i tētahi rūpahu.
		Ina patua angitu ngā ngārara e toru i te rārangi, ka puta he whakaaturanga whakanui.
		Ka mutu te kēmu i muri i ngā taumata e 5.
		Ka rēhita tō tika, tō wa whakautu, me ngā angitu kōmō.`,

			scale: `Ka ine tēnei whakamātautau i tō mātakite mā tētahi porowhita kei te pokapū, ka panoni i tōna rahi.
		Ka tīmata ki tētahi porowhita nui kei waenganui.
		Ka ui koe mēnā ka kite koe i te porowhita ("Ka kite au") kāore rānei ("Kāore au i te kite").
		Ka panoni te rahi o te porowhita i muri i tō whakautu.
		Ki te mea kāore koe e kite, ka nui haere te porowhita. Ki te mea ka kite koe, ka iti haere.
		Ka ui anō koe mō taua rahi kotahi tae atu ki te 5 ngā wā hei whakau i te pūmau.
		Ka mutu te kēmu i te wā ka kitea te paepae mātakitaki.`,

			fast: `Ka whakamahi tēnei whakamātautau i te ūnga neke hei ine i te mārama o te tirohanga ā-whakautu.
		Ka neke te ūnga i te ahunga whakapae puta noa i te mata.
		Ko tāu he aru i te ūnga mā ō kanohi anake — kaua e nekeneke tō ūpoko.
		Ka panoni pea te tere me te āhua māmā o te ūnga i te wā e haere ana.
		Kāore koe e hiahia ki te pāwhiri — me ū noa ki te ūnga mā ngā kanohi.
		Ka āwhina tēnei ki te ine i te nekehanga ā-taiao o ngā karu me te tika o te mātakitaki.`,
		},
		dataConsent: {
			title: 'Pānui Whakamahi Raraunga',
			intro: 'Kei tēnei kaupapa whakamātau tirohanga e kohikohi ana i ngā mōhiohio whaiaro iti noa tō ingoa, īmēra me te rōpū tau  me ngā raraunga kēmu. Ka whakamahia ēnei mō te rangahau. Kāore ō hua whakamātau e whakaputaina ki te marea.',
			acknowledgement: 'Mā te haere tonu, e whakaae ana koe kua mārama koe ki te whakamahi o ō raraunga i raro i ēnei mātāpono.',
			accept: 'Kua Mārama Au',

			principlesIntro: 'E ārahina ana tā mātou whakatata e Ngā Tikanga Paihere  e 5 ngā mātāpono mō te whakamahi tika i te raraunga:',
			principles: {
				pukenga: 'He pūkenga tō mātou rōpū, ā, ka mahi ngātahi me ngā hapori e pā ana ki te raraunga.',
				pono: 'He mārama, he pono ā mātou mahi, kia ū te whakawhirinaki ki tēnei rangahau.',
				wananga: 'Ka tiaki mātou i ō raraunga mā te whai i ngā paerewa pai rawa atu.',
				wairua: 'He kaupapa whai tikanga ā mātou mahi raraunga, e whakanuia ana te mana o te tangata.',
				tapu: 'Ka taurite te painga o te rangahau me te tiaki i te haumarutanga o ngā raraunga.',
			},
		},
	},
} as const;

export type LabelKeys = keyof (typeof labels)['en'];
