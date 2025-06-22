/** @format */

import { useEffect, useRef, useState } from 'react';
import hammerCursor from '../assets/hammer.jpg';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useVAGameSessionStore, type IUserDetails, type IVAGameConfig } from '../shared';
import { GameSessionInfo } from '.';

interface VisualAcuityentGameBoardProps {
	config: IVAGameConfig;
	user: IUserDetails;
	onExit: () => void;
}

export const VisualAcuityentGameBoard = ({ config, user, onExit }: VisualAcuityentGameBoardProps) => {
	const [timeLeft, setTimeLeft] = useState(30);
	const [gameOver, setGameOver] = useState(false);
	const [showSummaryDialog, setShowSummaryDialog] = useState(false);
	const [showStatsDialog, setShowStatsDialog] = useState(false);
	const [gridOffset, setGridOffset] = useState(0);
	const [rows, setRows] = useState(0);
	const [cols, setCols] = useState(0);

	const requestRef = useRef<number | null>(null);
	const { startSession, endSession, resetCurrentSession } = useVAGameSessionStore();

	const circleSize = config.holeSize;
	const gap = config.holeGap;
	const cellSize = circleSize + gap;

	const direction = config.moveDirection || 'left-to-right';
	const speed = config.moveSpeed || 100;

	// Initialize grid size
	useEffect(() => {
		const updateSize = () => {
			const usableWidth = window.innerWidth;
			const usableHeight = window.innerHeight - 96;
			setCols(Math.ceil(usableWidth / cellSize) + 1); // +1 for smooth loop
			setRows(Math.floor(usableHeight / cellSize));
		};

		updateSize();
		window.addEventListener('resize', updateSize);
		return () => window.removeEventListener('resize', updateSize);
	}, [cellSize]);

	// Start game session
	useEffect(() => {
		startSession(user, config);
	}, [user, config, startSession]);

	// Countdown timer
	useEffect(() => {
		if (timeLeft <= 0) {
			setGameOver(true);
			endSession();
			setShowSummaryDialog(true);
			return;
		}

		const timer = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [endSession, timeLeft]);

	// Animate horizontal scrolling
	useEffect(() => {
		let lastTime: number | null = null;

		const animate = (time: number) => {
			if (!lastTime) lastTime = time;
			const elapsed = (time - lastTime) / 1000;
			lastTime = time;

			setGridOffset((prevOffset) => {
				const delta = speed * elapsed;
				const directionMultiplier = direction === 'left-to-right' ? 1 : -1;
				let next = prevOffset + directionMultiplier * delta;

				// loop when offset exceeds one full column width
				if (Math.abs(next) >= cellSize) {
					next = 0;
				}
				return next;
			});

			requestRef.current = requestAnimationFrame(animate);
		};

		requestRef.current = requestAnimationFrame(animate);
		return () => {
			if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
		};
	}, [direction, speed, cellSize]);

	const resetGame = () => {
		resetCurrentSession();
		setTimeLeft(30);
		setGameOver(false);
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
			className='relative w-full h-screen flex items-center justify-center pt-16 pb-4 px-4 overflow-hidden'
			style={{
				backgroundColor: config.bgColor,
				cursor: `url(${hammerCursor}) 16 16, auto`,
			}}>
			{/* HUD */}
			<div className='absolute top-4 left-4 z-20 text-white text-lg flex items-center space-x-6'>
				<p>Time Left: {formatTime(timeLeft)}</p>
				{gameOver && <p className='text-red-400 font-bold'>Game Over</p>}
			</div>

			{/* Animated Grid */}
			<div
				className='absolute z-10'
				style={{
					display: 'grid',
					gridTemplateColumns: `repeat(${cols}, ${circleSize}px)`,
					gridTemplateRows: `repeat(${rows}, ${circleSize}px)`,
					gap: `${gap}px`,
					transform: `translateX(${gridOffset}px)`,
					transition: 'transform 0s linear',
				}}>
				{Array.from({ length: rows * cols }).map((_, i) => (
					<div
						key={i}
						style={{
							width: circleSize,
							height: circleSize,
							backgroundColor: config.outerColor,
							borderRadius: '9999px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}>
						<div
							style={{
								width: circleSize * config.ratio,
								height: circleSize * config.ratio,
								backgroundColor: config.innerColor,
								borderRadius: '9999px',
							}}
						/>
					</div>
				))}
			</div>

			{/* Summary Dialog */}
			<Dialog open={showSummaryDialog} onClose={() => {}} className='relative z-50'>
				<div className='fixed inset-0 bg-black/40' aria-hidden='true' />
				<div className='fixed inset-0 flex items-center justify-center p-4'>
					<DialogPanel className='mx-auto max-w-sm rounded-xl bg-white p-6 space-y-4 shadow-xl'>
						<DialogTitle className='text-lg font-bold text-gray-800'>Game Over</DialogTitle>
						<div className='flex flex-col gap-3 pt-4'>
							<button onClick={resetGame} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium'>
								Restart Game
							</button>
							<button onClick={() => setShowStatsDialog(true)} className='px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium'>
								View Game Stats
							</button>
							<button onClick={onExit} className='px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium'>
								Back to Game Selector
							</button>
						</div>
					</DialogPanel>
				</div>
			</Dialog>

			{/* Stats Dialog */}
			<GameSessionInfo isOpen={showStatsDialog} onClose={() => setShowStatsDialog(false)} />
		</div>
	);
};
