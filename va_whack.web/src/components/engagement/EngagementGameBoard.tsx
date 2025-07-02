/** @format */

import { useEffect, useRef, useState } from 'react';
import hammerCursor from '../../assets/images/hammer_cursor.png';
import { useEnagementGameSessionStore, type IAppearanceEvent, type IMole, type IUserDetails, type IEnagementGameConfig, GameService, type IEnagementScoreSummary } from '../../shared';
import { Mole, EnagementGameStatistics, EnagementControlPanel } from '..';
import { FakeMole } from './FakeMole';
import { Home, RotateCcw, BarChart, Settings, X, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import hitSoundSrc from '../../assets/sounds/hit_sound.mp3';
import missSoundSrc from '../../assets/sounds/miss_sound.mp3';

interface IProps {
	user: IUserDetails;
	onExit: () => void;
}

export const EngagementGameBoard = ({ onExit, user }: IProps) => {
	const [gameStarted, setGameStarted] = useState(false);
	const [selectedLevel, setSelectedLevel] = useState('Easy');
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
	const { startSession, addEvents, updateEventById, endSession, resetCurrentSession } = useEnagementGameSessionStore();

	const hitSoundRef = useRef<HTMLAudioElement | null>(null);
	const missSoundRef = useRef<HTMLAudioElement | null>(null);

	const [config, setConfig] = useState<IEnagementGameConfig>({
		mouseSize: 32,
		holeSize: 64,
		holeGap: 4,
		mouseCount: 1,
		spawnInterval: 1500,
		holeColor: '#666666',
		bgColor: '#f0f0f0',
	});

	const GAME_LEVELS: Record<string, { config: IEnagementGameConfig; duration: number }> = {
		Easy: {
			config: {
				mouseSize: 128,
				holeSize: 128,
				holeGap: 16,
				mouseCount: 1,
				spawnInterval: 2000,
				holeColor: '#666666',
				bgColor: '#f0f0f0',
			},
			duration: 30,
		},
		Medium: {
			config: {
				mouseSize: 96,
				holeSize: 96,
				holeGap: 8,
				mouseCount: 2,
				spawnInterval: 1500,
				holeColor: '#666666',
				bgColor: '#f0f0f0',
			},
			duration: 45,
		},
		Hard: {
			config: {
				mouseSize: 32,
				holeSize: 32,
				holeGap: 4,
				mouseCount: 5,
				spawnInterval: 500,
				holeColor: '#666666',
				bgColor: '#f0f0f0',
			},
			duration: 60,
		},
	};

	const getQuadrant = (row: number, col: number): 'Q1' | 'Q2' | 'Q3' | 'Q4' => {
		const midRow = Math.floor(rows / 2);
		const midCol = Math.floor(cols / 2);
		if (row < midRow && col >= midCol) return 'Q1';
		if (row < midRow && col < midCol) return 'Q2';
		if (row >= midRow && col < midCol) return 'Q3';
		return 'Q4';
	};

	const spawnMice = () => {
		const now = Date.now();
		const newMice: IMole[] = Array.from({ length: config.mouseCount }).map((_, i) => {
			const row = Math.floor(Math.random() * rows);
			const col = Math.floor(Math.random() * cols);
			const isFake = Math.random() < 0.2;
			return {
				id: nextEventIdRef.current + i,
				row,
				col,
				mole_type: isFake ? 'fake-mole' : 'mole',
			};
		});
		setMice(newMice);
		setPrevMouseIds(newMice.map((m) => m.id));
		setUserClickedThisCycle(false);
		const newEvents: IAppearanceEvent[] = newMice.map((m) => ({
			id: m.id,
			targetType: m.mole_type,
			mouseSize: config.mouseSize,
			row: m.row,
			col: m.col,
			quadrant: getQuadrant(m.row, m.col),
			appearTime: now,
			clicked: false,
		}));
		addEvents(newEvents);
		nextEventIdRef.current += config.mouseCount;
	};

	useEffect(() => {
		hitSoundRef.current = new Audio(hitSoundSrc);
		missSoundRef.current = new Audio(missSoundSrc);
	}, []);

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

	const handleStartGame = () => {
		if (scoreCalculated && !scoreDialogAcknowledged) return;

		const levelData = GAME_LEVELS[selectedLevel];
		setConfig(levelData.config);
		setTimeLeft(levelData.duration);
		startSession(user.email, levelData.config);
		setGameStarted(true);
		setScore(null);
		setScoreDialogOpen(false);
		setScoreDialogAcknowledged(false);
	};

	useEffect(() => {
		if (!gameStarted || gameOver || rows === 0 || cols === 0) return;
		const interval = setInterval(() => {
			if (!userClickedThisCycle && prevMouseIds.length > 0) {
				setMissCount((prev) => prev + prevMouseIds.length);
			}
			spawnMice();
		}, config.spawnInterval);
		return () => clearInterval(interval);
	}, [gameStarted, rows, cols, config.spawnInterval, gameOver, userClickedThisCycle, prevMouseIds]);

	useEffect(() => {
		if (!gameStarted) return;
		if (timeLeft <= 0) {
			setGameOver(true);
			setGameStarted(false);
			setMice([]);
			setPrevMouseIds([]);
			endSession();
			toast.error('Game Over', { duration: 5000 });
			return;
		}
		const timer = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);
		return () => clearInterval(timer);
	}, [gameStarted, timeLeft]);

	const handleCalculateScore = async () => {
		const session = useEnagementGameSessionStore.getState().currentSession;
		if (!session) return;
		const result = await GameService.submitEnagementGame(session);
		if (result) {
			setScore(result);
			setScoreDialogOpen(true);
			setScoreCalculated(true);
			setScoreDialogAcknowledged(false);
		}
	};

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

	const formatTime = (sec: number) => {
		const minutes = Math.floor(sec / 60);
		const seconds = sec % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};

	if (!gameStarted && (!gameOver || (scoreCalculated && scoreDialogAcknowledged))) {
		return (
			<div className='w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100'>
				<h1 className='text-2xl font-bold mb-6'>Engagement Game</h1>
				<div className='mb-4'>
					<label className='mr-2 font-medium'>Select Difficulty:</label>
					<select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className='px-3 py-2 border rounded-md shadow-sm focus:outline-none'>
						{Object.keys(GAME_LEVELS).map((level) => (
							<option key={level} value={level}>
								{level}
							</option>
						))}
					</select>
				</div>
				<button onClick={handleStartGame} disabled={scoreCalculated && !scoreDialogAcknowledged} className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed'>
					Start Game
				</button>
			</div>
		);
	}

	return (
		<div
			className='relative w-full h-screen flex items-center justify-center pt-16 pb-4 px-4'
			style={{
				backgroundColor: config.bgColor,
			}}
			onClick={() => {
				if (!gameOver && !userClickedThisCycle) {
					setMissCount((prev) => prev + 1);
					setUserClickedThisCycle(true);
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
			<div className={`absolute top-4 left-4 z-20 text-black text-lg flex items-center space-x-6 ${gameOver || isHoveringHud ? 'opacity-100' : 'opacity-0'}`} onMouseEnter={() => setIsHoveringHud(true)} onMouseLeave={() => setIsHoveringHud(false)}>
				<p>Time Left: {formatTime(timeLeft)}</p>
				<p>Hits: {hitCount}</p>
				<p>Misses: {missCount}</p>
			</div>

			{gameOver && !scoreCalculated && (
				<div className='absolute top-10 left-1/2 transform -translate-x-1/2 z-30'>
					<button onClick={handleCalculateScore} className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded shadow'>
						Calculate Score
					</button>
				</div>
			)}

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
											if (gameOver) return;
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
											spawnMice();
										}}
									/>
								) : (
									<FakeMole
										id={mouseHere.id}
										size={config.mouseSize}
										onClick={(e) => {
											if (gameOver) return;
											e.stopPropagation();
											missSoundRef.current?.play();
											setUserClickedThisCycle(true);
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
										}}
									/>
								))}
						</div>
					);
				})}
			</div>

			<EnagementGameStatistics isOpen={showStatsDialog} onClose={() => setShowStatsDialog(false)} />

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
		</div>
	);
};
