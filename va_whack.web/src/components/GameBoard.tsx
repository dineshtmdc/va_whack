/** @format */

import { useEffect, useRef, useState } from 'react';
import hammerCursor from '../assets/hammer.jpg';
import { Dialog } from '@headlessui/react';
import { useGameSessionStore, type IAppearanceEvent, type IMole, type IUserDetails, type IGameConfig } from '../shared';
import { Mole, GameSessionInfo } from '.';
import { FakeMole } from './FakeMole';

interface Props {
	config: IGameConfig;
	user: IUserDetails;
}

export const GameBoard = ({ config, user }: Props) => {
	const [mice, setMice] = useState<IMole[]>([]);
	const [prevMouseIds, setPrevMouseIds] = useState<number[]>([]);
	const [rows, setRows] = useState(0);
	const [cols, setCols] = useState(0);
	const [timeLeft, setTimeLeft] = useState(30);
	const [hitCount, setHitCount] = useState(0);
	const [missCount, setMissCount] = useState(0);
	const [gameOver, setGameOver] = useState(false);
	const [userClickedThisCycle, setUserClickedThisCycle] = useState(false);
	const [showSummaryDialog, setShowSummaryDialog] = useState(false);
	const [showStatsDialog, setShowStatsDialog] = useState(false);
	const nextEventIdRef = useRef(1);
	const { startSession, addEvents, updateEventById, endSession, resetCurrentSession } = useGameSessionStore();

	useEffect(() => {
		startSession(user, config);
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
				mole_type: isFake ? 'fake-mole' : 'mole', // FIXED
			};
		});

		setMice(newMice);
		setPrevMouseIds(newMice.map((m) => m.id));
		setUserClickedThisCycle(false);

		const newEvents: IAppearanceEvent[] = newMice.map((m) => ({
			id: m.id,
			targetType: m.mole_type, // FIXED
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
			setShowSummaryDialog(true);
			return;
		}

		const timer = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [timeLeft]);

	const resetGame = () => {
		resetCurrentSession();
		setMice([]);
		setPrevMouseIds([]);
		setTimeLeft(30);
		setHitCount(0);
		setMissCount(0);
		setGameOver(false);
		setUserClickedThisCycle(false);
		setShowSummaryDialog(false);
		startSession(user, config);
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
			{/* HUD */}
			<div className='absolute top-4 left-4 z-20 text-white text-lg flex items-center space-x-6'>
				<p>Time Left: {formatTime(timeLeft)}</p>
				<p>Hits: {hitCount}</p>
				<p>Misses: {missCount}</p>
				{gameOver && <p className='text-red-400 font-bold'>Game Over</p>}
			</div>

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

			{/* Summary Dialog */}
			<Dialog open={showSummaryDialog} onClose={() => {}} className='relative z-50'>
				<div className='fixed inset-0 bg-black/40' aria-hidden='true' />
				<div className='fixed inset-0 flex items-center justify-center p-4'>
					<Dialog.Panel className='mx-auto max-w-sm rounded-xl bg-white p-6 space-y-4 shadow-xl'>
						<Dialog.Title className='text-lg font-bold text-gray-800'>Game Over</Dialog.Title>
						<p className='text-gray-700'>Hits: {hitCount}</p>
						<p className='text-gray-700'>Misses: {missCount}</p>
						<div className='flex flex-col gap-3 pt-4'>
							<button onClick={resetGame} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium'>
								Restart Game
							</button>
							<button onClick={() => setShowStatsDialog(true)} className='px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium'>
								View Game Stats
							</button>
						</div>
					</Dialog.Panel>
				</div>
			</Dialog>

			{/* Stats Dialog */}
			<GameSessionInfo isOpen={showStatsDialog} onClose={() => setShowStatsDialog(false)} />
		</div>
	);
};
