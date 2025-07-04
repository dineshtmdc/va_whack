/** @format */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import hammerCursor from '../../assets/images/hammer_cursor.png';
import { useEnagementGameSessionStore, type IAppearanceEvent, type IMole, type IUserDetails, type IEnagementGameConfig, GameService, type IEnagementScoreSummary } from '../../shared';
import { Mole, EnagementGameStatistics, EnagementControlPanel } from '..';
import { FakeMole } from './FakeMole';
import { Home, RotateCcw, BarChart, Settings, X, ChevronLeft, ChevronRight } from 'lucide-react';

import hitSoundSrc from '../../assets/sounds/hit_sound.mp3';
import missSoundSrc from '../../assets/sounds/miss_sound.mp3';
import { useGameMasterSessionStore } from '../../shared/zustand/game_master_store';
import { useIsMobile } from '../hooks/useIsMobile';

interface IProps {
	user: IUserDetails;
	onExit: () => void;
}
const MOBILE_GAME_LEVELS: Record<string, { config: IEnagementGameConfig; duration: number }> = {
	'Very Easy': {
		config: { mouseSize: 100, holeSize: 100, holeGap: 10, fakeCount: 0, spawnInterval: 2500, holeColor: '#666666', bgColor: '#f8f8f8' },
		duration: 20,
	},
	Easy: {
		config: { mouseSize: 80, holeSize: 80, holeGap: 8, fakeCount: 1, spawnInterval: 2000, holeColor: '#666666', bgColor: '#f8f8f8' },
		duration: 20,
	},
	Medium: {
		config: { mouseSize: 64, holeSize: 64, holeGap: 6, fakeCount: 2, spawnInterval: 1500, holeColor: '#666666', bgColor: '#f8f8f8' },
		duration: 20,
	},
	Hard: {
		config: { mouseSize: 48, holeSize: 48, holeGap: 4, fakeCount: 5, spawnInterval: 1000, holeColor: '#666666', bgColor: '#f8f8f8' },
		duration: 20,
	},
	'Very Hard': {
		config: { mouseSize: 36, holeSize: 36, holeGap: 2, fakeCount: 8, spawnInterval: 700, holeColor: '#666666', bgColor: '#f8f8f8' },
		duration: 20,
	},
};
const DESKTOP_GAME_LEVELS: Record<string, { config: IEnagementGameConfig; duration: number }> = {
	'Very Easy': {
		config: { mouseSize: 160, holeSize: 160, holeGap: 20, fakeCount: 0, spawnInterval: 2500, holeColor: '#666666', bgColor: '#f0f0f0' },
		duration: 20,
	},
	Easy: {
		config: { mouseSize: 128, holeSize: 128, holeGap: 16, fakeCount: 1, spawnInterval: 2000, holeColor: '#666666', bgColor: '#f0f0f0' },
		duration: 20,
	},
	Medium: {
		config: { mouseSize: 96, holeSize: 96, holeGap: 8, fakeCount: 2, spawnInterval: 1500, holeColor: '#666666', bgColor: '#f0f0f0' },
		duration: 20,
	},
	Hard: {
		config: { mouseSize: 64, holeSize: 64, holeGap: 4, fakeCount: 5, spawnInterval: 1000, holeColor: '#666666', bgColor: '#f0f0f0' },
		duration: 20,
	},
	'Very Hard': {
		config: { mouseSize: 48, holeSize: 48, holeGap: 2, fakeCount: 8, spawnInterval: 700, holeColor: '#666666', bgColor: '#f0f0f0' },
		duration: 20,
	},
};

const getQuadrant = (rows: number, cols: number, row: number, col: number): 'Q1' | 'Q2' | 'Q3' | 'Q4' => {
	const midRow = Math.floor(rows / 2);
	const midCol = Math.floor(cols / 2);
	if (row < midRow && col >= midCol) return 'Q1';
	if (row < midRow && col < midCol) return 'Q2';
	if (row >= midRow && col < midCol) return 'Q3';
	return 'Q4';
};

const formatTime = (sec: number) => {
	const minutes = Math.floor(sec / 60);
	const seconds = sec % 60;
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const EngagementGameBoard = ({ onExit, user }: IProps) => {
	const isMobile = useIsMobile();
	const [gameStarted, setGameStarted] = useState(false);
	const [mice, setMice] = useState<IMole[]>([]);
	const [prevMouseIds, setPrevMouseIds] = useState<number[]>([]);
	const [rows, setRows] = useState(0);
	const [cols, setCols] = useState(0);
	const [timeLeft, setTimeLeft] = useState(30);
	const [hitCount, setHitCount] = useState(0);
	const [missCount, setMissCount] = useState(0);
	const [gameOver, setGameOver] = useState(false);
	const [userClickedThisCycle, setUserClickedThisCycle] = useState(false);
	const [showStatsDialog, setShowStatsDialog] = useState(false);
	const [showControlPanel, setShowControlPanel] = useState(false);
	const [isHoveringControls, setIsHoveringControls] = useState(false);
	const [isHoveringHud, setIsHoveringHud] = useState(false);
	const [score, setScore] = useState<IEnagementScoreSummary | null>(null);
	const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
	const [scoreCalculated, setScoreCalculated] = useState(false);
	const [scoreDialogAcknowledged, setScoreDialogAcknowledged] = useState(false);
	const [isControlsExpanded, setIsControlsExpanded] = useState(false);
	const nextEventIdRef = useRef(1);
	const { startSession, addEvents, updateEventById, endSession, resetCurrentSession, getLastSession } = useEnagementGameSessionStore();
	const LEVEL_SEQUENCE = useMemo(() => ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'], []);
	const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [allLevelsComplete, setAllLevelsComplete] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [comboCount, setComboCount] = useState(0);
	const [showComboMessage, setShowComboMessage] = useState(false);
	const [showCountdown, setShowCountdown] = useState(false);
	const [countdownNumber, setCountdownNumber] = useState<number | null>(null);
	const hitSoundRef = useRef<HTMLAudioElement | null>(null);
	const missSoundRef = useRef<HTMLAudioElement | null>(null);
	console.log(comboCount);

	const [config, setConfig] = useState<IEnagementGameConfig>(
		// Always provide a fallback value (doesn't matter if temporarily wrong)
		DESKTOP_GAME_LEVELS['Very Easy'].config
	);

	const spawnMice = useCallback(() => {
		const now = Date.now();
		const occupied = new Set<string>();
		const newMice: IMole[] = [];

		// 1. First: generate the main mole (real or fake, based on 20% chance)
		let row = 0,
			col = 0,
			key = '';
		do {
			row = Math.floor(Math.random() * rows);
			col = Math.floor(Math.random() * cols);
			key = `${row},${col}`;
		} while (occupied.has(key));
		occupied.add(key);

		const isMainFake = Math.random() < 0.2;

		newMice.push({
			id: nextEventIdRef.current,
			row,
			col,
			mole_type: isMainFake ? 'fake-mole' : 'mole',
		});

		// 2. Generate N fake moles (always fake)
		for (let i = 1; i <= config.fakeCount; i++) {
			let fakeRow = 0,
				fakeCol = 0,
				fakeKey = '';
			do {
				fakeRow = Math.floor(Math.random() * rows);
				fakeCol = Math.floor(Math.random() * cols);
				fakeKey = `${fakeRow},${fakeCol}`;
			} while (occupied.has(fakeKey));
			occupied.add(fakeKey);

			newMice.push({
				id: nextEventIdRef.current + i,
				row: fakeRow,
				col: fakeCol,
				mole_type: 'fake-mole',
			});
		}

		// Finalize
		setMice(newMice);
		setPrevMouseIds(newMice.map((m) => m.id));
		setUserClickedThisCycle(false);

		const newEvents: IAppearanceEvent[] = newMice.map((m) => ({
			id: m.id,
			targetType: m.mole_type,
			mouseSize: config.mouseSize,
			row: m.row,
			col: m.col,
			quadrant: getQuadrant(rows, cols, m.row, m.col),
			appearTime: now,
			clicked: false,
		}));

		addEvents(newEvents);
		nextEventIdRef.current += newMice.length;
	}, [addEvents, cols, config.fakeCount, config.mouseSize, rows]);

	// useEffect 1
	useEffect(() => {
		hitSoundRef.current = new Audio(hitSoundSrc);
		missSoundRef.current = new Audio(missSoundSrc);

		hitSoundRef.current.load();
		missSoundRef.current.load();

		hitSoundRef.current.volume = 1.0;
		missSoundRef.current.volume = 1.0;
	}, []);

	// useEffect 2
	useEffect(() => {
		const updateGridSize = () => {
			const usableWidth = window.innerWidth - 32;
			const usableHeight = window.innerHeight - 96;
			setCols(Math.floor(usableWidth / (config.holeSize + config.holeGap)));
			setRows(Math.floor(usableHeight / (config.holeSize + config.holeGap)));
		};

		updateGridSize();
		window.addEventListener('resize', updateGridSize);
		return () => window.removeEventListener('resize', updateGridSize);
	}, [config.holeSize, config.holeGap]);

	// useEffect 3
	useEffect(() => {
		if (!gameStarted || gameOver || rows === 0 || cols === 0 || showComboMessage || isSubmitting || showCountdown) return;

		const interval = setInterval(() => {
			if (!userClickedThisCycle && prevMouseIds.length > 0) {
				const missedRealMoles = prevMouseIds.filter((id) => {
					const event = useEnagementGameSessionStore.getState().currentSession?.events.find((e) => e.id === id);
					return event?.targetType === 'mole' && !event.clicked;
				});
				if (missedRealMoles.length > 0) {
					setMissCount((prev) => prev + missedRealMoles.length);
					setComboCount(0); // Break combo if real missed
				}
			}
			spawnMice();
		}, config.spawnInterval);

		return () => clearInterval(interval);
	}, [gameStarted, rows, cols, config.spawnInterval, gameOver, userClickedThisCycle, prevMouseIds, showComboMessage, isSubmitting, showCountdown, spawnMice]);

	// useEffect 4
	useEffect(() => {
		const lastSession = getLastSession();
		if (!gameStarted || isSubmitting || !lastSession) return;

		if (timeLeft <= 0) {
			setGameOver(true);
			setGameStarted(false);
			setMice([]);
			setPrevMouseIds([]);
			endSession();

			setIsSubmitting(true);
			GameService.submitEnagementGame(lastSession).then((result) => {
				if (result) {
					setScore(result);
					setScoreDialogOpen(true);
					setScoreCalculated(true);
					setScoreDialogAcknowledged(false);
				}
				setIsSubmitting(false);

				setTimeout(() => {
					if (currentLevelIndex + 1 >= LEVEL_SEQUENCE.length) {
						setAllLevelsComplete(true);
						useGameMasterSessionStore.getState().markEngagementComplete();
					} else {
						setCurrentLevelIndex((prev) => prev + 1);
					}
				}, 1000);
			});
		}

		const timer = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [timeLeft, gameStarted, isSubmitting, endSession, currentLevelIndex, LEVEL_SEQUENCE.length, getLastSession]);

	const spawnMiceWithSize = useCallback(
		(customRows: number, customCols: number, fakeCount: number) => {
			const now = Date.now();
			const occupied = new Set<string>();
			const newMice: IMole[] = [];

			let row = 0,
				col = 0,
				key = '';
			do {
				row = Math.floor(Math.random() * customRows);
				col = Math.floor(Math.random() * customCols);
				key = `${row},${col}`;
			} while (occupied.has(key));
			occupied.add(key);

			const isMainFake = Math.random() < 0.2;

			newMice.push({
				id: nextEventIdRef.current,
				row,
				col,
				mole_type: isMainFake ? 'fake-mole' : 'mole',
			});

			for (let i = 1; i <= fakeCount; i++) {
				let fakeRow = 0,
					fakeCol = 0,
					fakeKey = '';
				do {
					fakeRow = Math.floor(Math.random() * customRows);
					fakeCol = Math.floor(Math.random() * customCols);
					fakeKey = `${fakeRow},${fakeCol}`;
				} while (occupied.has(fakeKey));
				occupied.add(fakeKey);

				newMice.push({
					id: nextEventIdRef.current + i,
					row: fakeRow,
					col: fakeCol,
					mole_type: 'fake-mole',
				});
			}

			setMice(newMice);
			setPrevMouseIds(newMice.map((m) => m.id));
			setUserClickedThisCycle(false);

			const newEvents: IAppearanceEvent[] = newMice.map((m) => ({
				id: m.id,
				targetType: m.mole_type,
				mouseSize: config.mouseSize,
				row: m.row,
				col: m.col,
				quadrant: getQuadrant(customRows, customCols, m.row, m.col),
				appearTime: now,
				clicked: false,
			}));

			addEvents(newEvents);
			nextEventIdRef.current += newMice.length;
		},
		[addEvents, config.mouseSize]
	);

	// function 1
	const handleStartGame = useCallback(
		(levelName: string) => {
			if (scoreCalculated && !scoreDialogAcknowledged) return;

			const levelData = (isMobile ? MOBILE_GAME_LEVELS : DESKTOP_GAME_LEVELS)[levelName];
			setConfig(levelData.config);

			const usableWidth = window.innerWidth - 32;
			const usableHeight = window.innerHeight - 96;

			const newCols = Math.floor(usableWidth / (levelData.config.holeSize + levelData.config.holeGap));
			const newRows = Math.floor(usableHeight / (levelData.config.holeSize + levelData.config.holeGap));

			setCols(newCols);
			setRows(newRows);
			setTimeLeft(levelData.duration);
			setHitCount(0);
			setMissCount(0);
			setGameOver(false);
			setScore(null);
			setScoreDialogOpen(false);
			setScoreDialogAcknowledged(false);
			setScoreCalculated(false);
			setComboCount(0);
			setUserClickedThisCycle(false);
			setMice([]);
			setPrevMouseIds([]);
			resetCurrentSession();
			const masterSessionId = useGameMasterSessionStore.getState().currentSession.sessionId;
			startSession(user.email, levelData.config, masterSessionId);
			setGameStarted(true);

			setTimeout(() => {
				spawnMiceWithSize(newRows, newCols, levelData.config.fakeCount);
			}, 100);
		},
		[isMobile]
	);

	// useEffect 5 - Show 5,4,3,2,1 countdown with level name
	useEffect(() => {
		if (currentLevelIndex >= LEVEL_SEQUENCE.length) return;

		const nextLevel = LEVEL_SEQUENCE[currentLevelIndex];
		setCountdownNumber(5);
		setShowCountdown(true);

		let count = 5;
		const interval = setInterval(() => {
			count -= 1;
			if (count <= 0) {
				clearInterval(interval);
				setShowCountdown(false);
				setCountdownNumber(null);
				handleStartGame(nextLevel); // 👈 CAUSES DOUBLE START
			} else {
				setCountdownNumber(count);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [LEVEL_SEQUENCE, currentLevelIndex, handleStartGame]);

	// function 2
	const resetGame = () => {
		resetCurrentSession();
		setMice([]);
		setPrevMouseIds([]);
		setTimeLeft(30);
		setHitCount(0);
		setMissCount(0);
		setGameOver(false);
		setUserClickedThisCycle(false);
		setScoreCalculated(false);
		setScoreDialogAcknowledged(false);
		setGameStarted(false);
	};

	if (isMobile === null) {
		// Still determining device type
		return <div className='w-full h-screen flex items-center justify-center bg-white text-gray-600 text-lg'>Loading...</div>;
	}

	return (
		<div
			className='relative w-full h-screen flex items-center justify-center pt-16 pb-4 px-4'
			style={{
				backgroundColor: config.bgColor,
			}}
			onClick={() => {
				if (!gameOver && !userClickedThisCycle && !showComboMessage) {
					setMissCount((prev) => prev + 1);
					setUserClickedThisCycle(true);
					setComboCount(0); // Reset combo
					spawnMice();
				}
			}}>
			{/* Controls */}
			<div className='absolute top-4 right-4 z-20 flex items-center space-x-2'>
				<button onClick={() => setIsControlsExpanded((prev) => !prev)} className='bg-white p-2 rounded-full shadow hover:bg-gray-100'>
					{isControlsExpanded ? <ChevronRight className='w-5 h-5' /> : <ChevronLeft className='w-5 h-5' />}
				</button>
				{isControlsExpanded && (
					<div className={`flex gap-2 ${isHoveringControls ? 'opacity-100' : 'opacity-80'}`} onMouseEnter={() => setIsHoveringControls(true)} onMouseLeave={() => setIsHoveringControls(false)}>
						<button onClick={onExit} className='bg-white p-2 rounded-full shadow hover:bg-gray-100' title='Back to Selector'>
							<Home className='w-5 h-5' />
						</button>
						<button onClick={resetGame} className='bg-white p-2 rounded-full shadow hover:bg-gray-100' title='Restart Game'>
							<RotateCcw className='w-5 h-5' />
						</button>
						<button onClick={() => setShowStatsDialog(true)} className='bg-white p-2 rounded-full shadow hover:bg-gray-100' title='View Stats'>
							<BarChart className='w-5 h-5' />
						</button>
						<button onClick={() => setShowControlPanel((prev) => !prev)} className='bg-white p-2 rounded-full shadow hover:bg-gray-100' title='Toggle Settings'>
							{showControlPanel ? <X className='w-5 h-5' /> : <Settings className='w-5 h-5' />}
						</button>
					</div>
				)}
			</div>

			{showControlPanel && <EnagementControlPanel config={config} onChange={(u) => setConfig((p) => ({ ...p, ...u }))} />}

			{/* HUD */}
			<div className={`absolute z-20 text-black text-lg flex items-center space-x-6 ${gameOver || isHoveringHud ? 'opacity-100' : 'opacity-0'} left-4 top-12 sm:top-4`} onMouseEnter={() => setIsHoveringHud(true)} onMouseLeave={() => setIsHoveringHud(false)}>
				<p>Time Left: {formatTime(timeLeft)}</p>
				<p>Hits: {hitCount}</p>
				<p>Misses: {missCount}</p>
			</div>

			{/* Grid */}
			<div
				className='grid z-10'
				style={{
					gridTemplateColumns: `repeat(${cols}, ${config.holeSize}px)`,
					gridTemplateRows: `repeat(${rows}, ${config.holeSize}px)`,
					gap: `${config.holeGap}px`,
					cursor: `url(${hammerCursor}) 24 24, auto`,
				}}>
				{Array.from({ length: rows * cols }).map((_, index) => {
					const row = Math.floor(index / cols);
					const col = index % cols;
					const mouseHere = mice.find((m) => m.row === row && m.col === col);
					return (
						<div
							key={index}
							style={{
								width: config.holeSize,
								height: config.holeSize,
								backgroundColor: config.holeColor,
							}}
							className='rounded-full flex items-center justify-center'>
							{mouseHere &&
								(mouseHere.mole_type === 'mole' ? (
									<Mole
										id={mouseHere.id}
										size={config.mouseSize}
										onClick={(e) => {
											if (gameOver || showComboMessage) return;

											e.stopPropagation();
											hitSoundRef.current?.play();
											setHitCount((prev) => prev + 1);
											setUserClickedThisCycle(true);
											setMice((prev) => prev.filter((m) => m.id !== mouseHere.id));
											setPrevMouseIds((prev) => prev.filter((id) => id !== mouseHere.id));
											updateEventById(mouseHere.id, {
												clicked: true,
												clickTime: Date.now(),
												clickX: e.clientX,
												clickY: e.clientY,
												wasHit: true,
											});

											// Combo logic
											setComboCount((prev) => {
												const newCount = prev + 1;
												if (newCount === 5) {
													setShowComboMessage(true);
													setTimeout(() => {
														setShowComboMessage(false);
														setComboCount(0); //  reset combo after celebration
													}, 5000);
												}
												return newCount;
											});

											spawnMice();
										}}
									/>
								) : (
									<FakeMole
										id={mouseHere.id}
										size={config.mouseSize}
										onClick={(e) => {
											e.stopPropagation();
											missSoundRef.current?.play();
											if (gameOver || showComboMessage) return;
											setUserClickedThisCycle(true);
											setComboCount(0); // Reset combo
											setMice((prev) => prev.filter((m) => m.id !== mouseHere.id));
											setPrevMouseIds((prev) => prev.filter((id) => id !== mouseHere.id));
											updateEventById(mouseHere.id, {
												clicked: true,
												clickTime: Date.now(),
												clickX: e.clientX,
												clickY: e.clientY,
												wasDistractorClicked: true,
											});
											spawnMice();
											if (gameOver || showComboMessage) return;
										}}
									/>
								))}
						</div>
					);
				})}
			</div>

			<EnagementGameStatistics isOpen={showStatsDialog} onClose={() => setShowStatsDialog(false)} />

			{showCountdown && countdownNumber !== null && (
				<div className='absolute inset-0 flex flex-col items-center justify-center z-50 bg-white/80'>
					<h2 className='text-4xl font-bold text-gray-700 mb-4'>Level: {LEVEL_SEQUENCE[currentLevelIndex]}</h2>
					<h1 className='text-8xl font-bold text-blue-600 animate-pulse'>{countdownNumber}</h1>
				</div>
			)}

			{isSubmitting && (
				<div className='absolute inset-0 flex items-center justify-center z-50 bg-white/80'>
					<h2 className='text-2xl font-semibold text-gray-800 animate-pulse'>Submitting game data...</h2>
				</div>
			)}

			{scoreDialogOpen && score && (
				<div className='fixed inset-0 bg-black/40 z-50 flex items-center justify-center'>
					<div className='bg-white p-6 rounded-lg shadow-lg w-[360px] max-h-[90vh] overflow-y-auto'>
						<h2 className='text-lg font-semibold mb-4 text-center'>Score Summary</h2>
						<ul className='text-sm space-y-1'>
							{Object.entries(score).map(([key, value]) => (
								<li key={key}>
									<strong>{key}:</strong> {typeof value === 'number' ? value.toFixed(2) : value}
								</li>
							))}
						</ul>
						<div className='mt-4 flex justify-center'>
							<button
								onClick={() => {
									setScoreDialogOpen(false);
									setScoreDialogAcknowledged(true);
								}}
								className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
			{showComboMessage && (
				<div className='absolute inset-0 z-40 bg-green-400/80 pointer-events-none overflow-hidden'>
					{/* 🔥 Define the icon set */}
					{(() => {
						const comboIcons = ['🔥', '💥', '⚡', '✨', '🌟', '🎯', '💫'];

						return Array.from({ length: 30 }).map((_, i) => {
							const top = Math.random() * 100;
							const left = Math.random() * 100;
							const delay = Math.random() * 2;
							const icon = comboIcons[Math.floor(Math.random() * comboIcons.length)];

							return (
								<span
									key={i}
									className='absolute text-4xl animate-glow'
									style={{
										top: `${top}%`,
										left: `${left}%`,
										animationDelay: `${delay}s`,
									}}>
									{icon}
								</span>
							);
						});
					})()}

					{/* 🎯 Centered Combo Message */}
					<div className='absolute inset-0 flex items-center justify-center'>
						<div className='text-7xl font-bold text-orange-600 animate-pulse drop-shadow-lg'>🔥 Combo Streak! 5 Hits in a Row! 🔥</div>
					</div>
				</div>
			)}
			{allLevelsComplete && (
				<div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center'>
					<div className='bg-white rounded-lg shadow-lg p-6 max-w-sm text-center'>
						<h2 className='text-2xl font-bold mb-4 text-green-700'>🎉 All Levels Complete!</h2>
						<p className='text-gray-700 mb-4'>
							Congrats, you finished all 5 levels. Go to <strong>Profile</strong> to view your report.
						</p>
						<button className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700' onClick={() => onExit()}>
							Close
						</button>
					</div>
				</div>
			)}
		</div>
	);
};
