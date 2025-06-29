/** @format */

import { useEffect, useRef, useState } from 'react';
import hammerCursor from '../../assets/hammer.jpg';
import { useEnagementGameSessionStore, type IAppearanceEvent, type IMole, type IUserDetails, type IEnagementGameConfig, GameService, type IEnagementScoreSummary } from '../../shared';
import { Mole, EnagementGameStatistics } from '..';
import { FakeMole } from './FakeMole';
import { Home, RotateCcw, BarChart } from 'lucide-react';

interface IProps {
	config: IEnagementGameConfig;
	user: IUserDetails;
	onExit: () => void;
}

export const EngagementGameBoard = ({ config, onExit, user }: IProps) => {
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
	const nextEventIdRef = useRef(1);
	const { startSession, addEvents, updateEventById, endSession, resetCurrentSession } = useEnagementGameSessionStore();
	const [isHoveringControls, setIsHoveringControls] = useState(false);
	const [isHoveringHud, setIsHoveringHud] = useState(false);
	const [score, setScore] = useState<IEnagementScoreSummary | null>(null);
	const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
	const [scoreCalculated, setScoreCalculated] = useState(false);

	useEffect(() => {
		startSession(user.email, config);
	}, [user, config, startSession]);

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

	useEffect(() => {
		const handleMouseMove = () => {
			window.removeEventListener('mousemove', handleMouseMove); // only trigger once
		};

		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove);
	}, []);

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
		if (gameOver || rows === 0 || cols === 0) return;

		const interval = setInterval(() => {
			if (!userClickedThisCycle && prevMouseIds.length > 0) {
				setMissCount((prev) => prev + prevMouseIds.length);
			}
			spawnMice();
		}, config.spawnInterval);

		return () => clearInterval(interval);
	}, [rows, cols, config.spawnInterval, gameOver, userClickedThisCycle, prevMouseIds]);

	useEffect(() => {
		if (timeLeft <= 0) {
			setGameOver(true);
			setMice([]);
			setPrevMouseIds([]);
			endSession();
			return;
		}

		const timer = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [timeLeft]);

	const handleCalculateScore = async () => {
		const session = useEnagementGameSessionStore.getState().currentSession;

		if (!session) {
			console.warn('No current session to submit.');
			return;
		}

		const result = await GameService.submitEnagementGame(session);

		if (result) {
			setScore(result);
			setScoreDialogOpen(true);
			setScoreCalculated(true);
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
		startSession(user.email, config);
	};

	const formatTime = (sec: number) => {
		const minutes = Math.floor(sec / 60);
		const seconds = sec % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};

	return (
		<div
			className='relative w-full h-screen flex items-center justify-center pt-16 pb-4 px-4'
			style={{
				backgroundColor: config.bgColor,
				cursor: `url(${hammerCursor}) 16 16, auto`,
			}}
			onClick={() => {
				if (!gameOver && !userClickedThisCycle) {
					setMissCount((prev) => prev + 1);
					setUserClickedThisCycle(true);
					spawnMice();
				}
			}}>
			{/* Top-right Controls */}
			<div className={`absolute top-4 right-16 z-20 flex gap-2 transition-opacity duration-300 ${isHoveringControls ? 'opacity-100' : 'opacity-0'}`} onMouseEnter={() => setIsHoveringControls(true)} onMouseLeave={() => setIsHoveringControls(false)}>
				<button onClick={onExit} title='Back to Selector' className='bg-white p-2 rounded-full shadow hover:bg-gray-100'>
					<Home className='w-5 h-5' />
				</button>
				<button onClick={resetGame} title='Restart Game' className='bg-white p-2 rounded-full shadow hover:bg-gray-100'>
					<RotateCcw className='w-5 h-5' />
				</button>
				<button onClick={() => setShowStatsDialog(true)} title='View Stats' className='bg-white p-2 rounded-full shadow hover:bg-gray-100'>
					<BarChart className='w-5 h-5' />
				</button>
			</div>

			{/* HUD */}
			<div className={`absolute top-4 left-4 z-20 text-white text-lg flex items-center space-x-6 transition-opacity duration-300 ${isHoveringHud ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-auto'}`} onMouseEnter={() => setIsHoveringHud(true)} onMouseLeave={() => setIsHoveringHud(false)}>
				<p>Time Left: {formatTime(timeLeft)}</p>
				<p>Hits: {hitCount}</p>
				<p>Misses: {missCount}</p>
				{gameOver && <p className='text-red-400 font-bold'>Game Over</p>}
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

			{/* Stats Dialog */}
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
							<button onClick={() => setScoreDialogOpen(false)} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
