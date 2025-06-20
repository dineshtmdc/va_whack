/** @format */

import { useEffect, useState } from 'react';
import hammerCursor from '../assets/hammer.jpg';

interface Mouse {
	id: number;
	row: number;
	col: number;
}

interface GameBoardProps {
	mouseSize: number;
	holeSize: number;
	holeGap: number;
	mouseCount: number;
	spawnInterval: number;
	holeColor: string;
	bgColor: string;
}

export const GameBoard = ({ mouseSize, holeSize, holeGap, mouseCount, spawnInterval, holeColor, bgColor }: GameBoardProps) => {
	const [mice, setMice] = useState<Mouse[]>([]);
	const [rows, setRows] = useState(0);
	const [cols, setCols] = useState(0);

	// Calculate grid based on window size
	useEffect(() => {
		const updateGridSize = () => {
			const usableWidth = window.innerWidth - 32; // px-4
			const usableHeight = window.innerHeight - 96; // pt-16 + pb-4

			const maxCols = Math.floor(usableWidth / (holeSize + holeGap));
			const maxRows = Math.floor(usableHeight / (holeSize + holeGap));

			setCols(maxCols);
			setRows(maxRows);
		};

		updateGridSize();
		window.addEventListener('resize', updateGridSize);
		return () => window.removeEventListener('resize', updateGridSize);
	}, [holeSize, holeGap]);

	// Spawn mice at random spots
	useEffect(() => {
		const interval = setInterval(() => {
			const newMice: Mouse[] = Array.from({ length: mouseCount }).map((_, i) => ({
				id: i,
				row: Math.floor(Math.random() * rows),
				col: Math.floor(Math.random() * cols),
			}));
			setMice(newMice);
		}, spawnInterval);

		return () => clearInterval(interval);
	}, [rows, cols, spawnInterval, mouseCount]);

	return (
		<div
			className='w-full h-screen flex items-center justify-center pt-16 pb-4 px-4'
			style={{
				backgroundColor: bgColor,
				cursor: `url(${hammerCursor}) 16 16, auto`,
			}}>
			<div
				className='grid'
				style={{
					gridTemplateColumns: `repeat(${cols}, ${holeSize}px)`,
					gridTemplateRows: `repeat(${rows}, ${holeSize}px)`,
					gap: `${holeGap}px`,
				}}>
				{Array.from({ length: rows * cols }).map((_, index) => {
					const row = Math.floor(index / cols);
					const col = index % cols;
					const mouseHere = mice.find((m) => m.row === row && m.col === col);

					return (
						<div
							key={index}
							style={{
								width: holeSize,
								height: holeSize,
								backgroundColor: holeColor,
							}}
							className='rounded-full flex items-center justify-center'>
							{mouseHere && (
								<span style={{ fontSize: `${mouseSize}px` }} className='animate-bounce'>
									🐭
								</span>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};
