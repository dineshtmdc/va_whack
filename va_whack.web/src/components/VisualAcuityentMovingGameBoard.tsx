/** @format */

import { useEffect, useRef, useState } from 'react';
import { useVAGameSessionStore, type IUserDetails, type IVAMovingGameConfig } from '../shared';
import { GameSessionInfo } from '.';
import { BarChart, RotateCcw, Home } from 'lucide-react';

interface IProps {
	config: IVAMovingGameConfig;
	user: IUserDetails;
	onExit: () => void;
}

// Convert degrees to pixels based on distance and PPI
const degreesToPixels = (degrees: number, distanceCm: number, ppi: number): number => {
	const inchesPerCm = 1 / 2.54;
	const radians = (degrees * Math.PI) / 180;
	const cmLength = 2 * distanceCm * Math.tan(radians / 2);
	return cmLength * inchesPerCm * ppi;
};

const degreesPerSecondToPixelsPerSecond = (degPerSec: number, distanceCm: number, ppi: number) => degreesToPixels(degPerSec, distanceCm, ppi);

// Detect screen PPI
const detectScreenPPI = (): number => {
	const div = document.createElement('div');
	div.style.width = '1in';
	div.style.position = 'absolute';
	div.style.top = '-100%';
	document.body.appendChild(div);
	const cssPPI = div.offsetWidth;
	document.body.removeChild(div);
	return cssPPI * window.devicePixelRatio;
};

// Apply intensity to HEX color by darkening
const applyIntensityToHex = (hex: string, intensity: number = 1): string => {
	const cleanHex = hex.replace('#', '');
	const bigint = parseInt(cleanHex, 16);
	let r = (bigint >> 16) & 255;
	let g = (bigint >> 8) & 255;
	let b = bigint & 255;

	const scale = Math.max(0, Math.min(1, intensity));
	r = Math.round(r * scale);
	g = Math.round(g * scale);
	b = Math.round(b * scale);

	return `rgb(${r}, ${g}, ${b})`;
};

// Convert intensity to grayscale
const grayscaleFromIntensity = (intensity: number = 1): string => {
	const clamped = Math.max(0, Math.min(1, intensity));
	const v = Math.round(255 * clamped);
	return `rgb(${v}, ${v}, ${v})`;
};

export const VisualAcuityentMovingGameBoard = ({ config, user, onExit }: IProps) => {
	const [gridOffset, setGridOffset] = useState(0);
	const [rows, setRows] = useState(0);
	const [cols, setCols] = useState(0);
	const [ppi, setPPI] = useState<number>(96);
	const [showStatsDialog, setShowStatsDialog] = useState(false);

	const requestRef = useRef<number | null>(null);
	const { startSession, resetCurrentSession } = useVAGameSessionStore();

	useEffect(() => {
		setPPI(detectScreenPPI());
	}, []);

	const viewDist = config.viewingDistanceCm ?? 200;
	const holeSizePx = degreesToPixels(config.logMar, viewDist, ppi);
	const spacingPx = degreesToPixels(config.spacingDeg ?? 1, viewDist, ppi);
	const cellSize = holeSizePx + spacingPx;
	const direction = config.moveDirection ?? 'left-to-right';
	const pixelSpeed = degreesPerSecondToPixelsPerSecond(config.moveSpeed ?? 5, viewDist, ppi);

	const MARGIN_TOP = -108;
	const MARGIN_BOTTOM = 0;

	useEffect(() => {
		const updateSize = () => {
			const usableWidth = window.innerWidth;
			const usableHeight = window.innerHeight - MARGIN_TOP - MARGIN_BOTTOM;
			setCols(Math.ceil(usableWidth / cellSize) + 1);
			setRows(Math.floor(usableHeight / cellSize));
		};
		updateSize();
		window.addEventListener('resize', updateSize);
		return () => window.removeEventListener('resize', updateSize);
	}, [MARGIN_TOP, cellSize]);

	useEffect(() => {
		startSession(user, config);
	}, [user, config, startSession]);

	useEffect(() => {
		let lastTime: number | null = null;
		const animate = (time: number) => {
			if (!lastTime) lastTime = time;
			const elapsed = (time - lastTime) / 1000;
			lastTime = time;
			setGridOffset((prevOffset) => {
				const delta = pixelSpeed * elapsed;
				const dirMult = direction === 'left-to-right' ? 1 : -1;
				let next = prevOffset + dirMult * delta;
				if (Math.abs(next) >= cellSize) next = 0;
				return next;
			});
			requestRef.current = requestAnimationFrame(animate);
		};
		requestRef.current = requestAnimationFrame(animate);
		return () => {
			if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
		};
	}, [direction, pixelSpeed, cellSize]);

	const resetGame = () => {
		resetCurrentSession();
		startSession(user, config);
	};

	// Clamp all intensity values
	const surroundIntensity = Math.max(0, Math.min(1, config.surroundIntensity ?? 1));
	const centralIntensity = Math.max(0, Math.min(1, config.centralIntensity ?? 1));
	const bgBrightness = Math.max(0.05, config.brightness ?? 1); // prevent full black

	// Compute final colors
	const outerColor = grayscaleFromIntensity(surroundIntensity); // <- White when 1
	const innerColor = applyIntensityToHex(config.innerColor, centralIntensity);
	const bgColor = applyIntensityToHex(config.bgColor, bgBrightness);

	return (
		<div
			className='relative w-full h-screen flex items-center justify-center pt-16 pb-4 px-4 overflow-hidden'
			style={{
				backgroundColor: bgColor,
			}}>
			{/* Top Buttons */}
			<div className='absolute top-4 right-16 z-20 flex gap-2'>
				<button onClick={onExit} title='Back to Selector' className='bg-white text-black p-2 rounded-full shadow hover:bg-gray-200'>
					<Home className='w-5 h-5' />
				</button>
				<button onClick={resetGame} title='Restart' className='bg-white text-black p-2 rounded-full shadow hover:bg-gray-200'>
					<RotateCcw className='w-5 h-5' />
				</button>
				<button onClick={() => setShowStatsDialog(true)} title='View Stats' className='bg-white text-black p-2 rounded-full shadow hover:bg-gray-200'>
					<BarChart className='w-5 h-5' />
				</button>
			</div>

			{/* Debug Info */}
			{/* <div className='absolute top-4 left-4 z-20 bg-white text-black text-xs px-2 py-1 rounded shadow'>
				PPI: {ppi.toFixed(2)} | Cell: {cellSize.toFixed(1)}px | Rows: {rows}
			</div> */}

			{/* Grid */}
			<div
				className='absolute z-10'
				style={{
					display: 'grid',
					gridTemplateColumns: `repeat(${cols}, ${holeSizePx}px)`,
					gridTemplateRows: `repeat(${rows}, ${holeSizePx}px)`,
					gap: `${spacingPx}px`,
					transform: `translateX(${gridOffset}px)`,
					transition: 'transform 0s linear',
					marginTop: '48px',
				}}>
				{Array.from({ length: rows * cols }).map((_, i) => (
					<div
						key={i}
						style={{
							width: holeSizePx,
							height: holeSizePx,
							backgroundColor: outerColor,
							borderRadius: '9999px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}>
						<div
							style={{
								width: holeSizePx * config.ratio,
								height: holeSizePx * config.ratio,
								backgroundColor: innerColor,
								borderRadius: '9999px',
							}}
						/>
					</div>
				))}
			</div>

			{/* Stats Modal */}
			<GameSessionInfo isOpen={showStatsDialog} onClose={() => setShowStatsDialog(false)} />
		</div>
	);
};
