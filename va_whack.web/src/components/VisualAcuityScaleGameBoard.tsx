/** @format */

import { useEffect, useState } from 'react';
import { FileText, X, Grid3x3, ArrowDown, ArrowUp } from 'lucide-react';
import type { IVAScaleGameConfig, IUserDetails } from '../shared';
import { VAScaleLogPanel } from '.';

interface IProps {
	config: IVAScaleGameConfig;
	user: IUserDetails;
	onExit: () => void;
}

interface ScaleLogEntry {
	timestamp: number;
	outerDiameter: number;
	innerDiameter: number;
	ratio: number;
	scaleDirection: 'Up' | 'Down';
	logmar: number;
	userResponse?: 'I can see' | 'I can’t see';
}

export const VisualAcuityScaleGameBoard = ({ config, onExit }: IProps) => {
	const mmToPx = (mm: number) => mm * 3.78;
	const toOdd = (n: number) => (n <= 1 ? 1 : n % 2 === 0 ? n - 1 : n);
	const calculateLogMAR = (diameterMm: number, distanceCm: number) => {
		const distanceMm = distanceCm * 10;
		const angleArcMin = (diameterMm / distanceMm) * (180 / Math.PI) * 60;
		return Math.log10(angleArcMin / 5);
	};

	const [centerDiameter, setCenterDiameter] = useState(config.maxHoleSize);
	const [rows, setRows] = useState(1);
	const [cols, setCols] = useState(1);
	const [logEntries, setLogEntries] = useState<ScaleLogEntry[]>([]);
	const [pendingScale, setPendingScale] = useState<ScaleLogEntry | null>(null);
	const [logPanelOpen, setLogPanelOpen] = useState(false);
	const [allowScaleDown, setAllowScaleDown] = useState(false);
	const [allowScaleUp, setAllowScaleUp] = useState(false);
	const [allowResponse, setAllowResponse] = useState(true);
	const [initialResponseGiven, setInitialResponseGiven] = useState(false);
	const [responseGiven, setResponseGiven] = useState(false);
	const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);
	// const [lastResponse, setLastResponse] = useState<'I can see' | 'I can’t see' | null>(null);

	const verticalPaddingPercent = config.verticalPadding;
	const horizontalPaddingPercent = config.horizontalPadding;
	const cellSizePx = mmToPx(config.maxHoleSize + config.holeGap);

	const updateGridSize = () => {
		const usableWidth = window.innerWidth * (1 - horizontalPaddingPercent / 100);
		const usableHeight = window.innerHeight * (1 - verticalPaddingPercent / 100);
		setCols(toOdd(Math.floor(usableWidth / cellSizePx)));
		setRows(toOdd(Math.floor(usableHeight / cellSizePx)));
	};

	useEffect(updateGridSize, [config.maxHoleSize, config.holeGap, verticalPaddingPercent, horizontalPaddingPercent, cellSizePx]);
	useEffect(() => {
		window.addEventListener('resize', updateGridSize);
		return () => window.removeEventListener('resize', updateGridSize);
	}, []);

	useEffect(() => {
		setCenterDiameter(config.maxHoleSize);
		setPendingScale(null);
		setLogEntries([]);
		setAllowScaleDown(false);
		setAllowScaleUp(false);
		setAllowResponse(true);
		setInitialResponseGiven(false);
		setResponseGiven(false);
		setGameOverMessage(null);
		// setLastResponse(null);
	}, [config]);

	const handleScale = (direction: 'Up' | 'Down') => {
		if (!responseGiven) return;

		const delta = direction === 'Up' ? 1 : -1;
		const next = Math.min(Math.max(centerDiameter + delta, config.minHoleSize), config.maxHoleSize);
		if (next === centerDiameter) return;

		const entry: ScaleLogEntry = {
			timestamp: Date.now(),
			outerDiameter: next,
			innerDiameter: next * config.ratio,
			ratio: config.ratio,
			scaleDirection: direction,
			logmar: calculateLogMAR(next, config.viewingDistanceCm),
		};

		setCenterDiameter(next);
		setPendingScale(entry);
		setResponseGiven(false);
		setAllowResponse(true);

		// Disable scale buttons until user responds
		setAllowScaleDown(false);
		setAllowScaleUp(false);
	};

	const handleResponse = (response: 'I can see' | 'I can’t see') => {
		const entry = pendingScale ?? {
			timestamp: Date.now(),
			outerDiameter: centerDiameter,
			innerDiameter: centerDiameter * config.ratio,
			ratio: config.ratio,
			scaleDirection: 'Down',
			logmar: calculateLogMAR(centerDiameter, config.viewingDistanceCm),
		};

		setLogEntries((prev) => [...prev, { ...entry, userResponse: response }]);
		setPendingScale(null);
		setResponseGiven(true);
		setAllowResponse(false);
		// setLastResponse(response);

		if (!initialResponseGiven) {
			setInitialResponseGiven(true);
		}

		if (response === 'I can’t see') {
			if (centerDiameter === config.maxHoleSize) {
				setGameOverMessage('Assessment Over: User cannot see at maximum size.');
				setAllowScaleDown(false);
				setAllowScaleUp(false);
			} else {
				setAllowScaleDown(false);
				setAllowScaleUp(true);
			}
		}

		if (response === 'I can see') {
			if (centerDiameter === config.minHoleSize) {
				setGameOverMessage('Assessment Over: User can see at minimum size.');
				setAllowScaleDown(false);
				setAllowScaleUp(false);
			} else {
				setAllowScaleDown(true);
				setAllowScaleUp(false);
			}
		}
	};

	const centerRow = Math.floor(rows / 2);
	const centerCol = Math.floor(cols / 2);

	return (
		<div className='w-full h-screen relative'>
			{/* Log Toggle Button */}
			<div className='fixed top-4 left-4 z-50'>
				<button title='Toggle Scale Log' onClick={() => setLogPanelOpen((v) => !v)} className='bg-white p-2 rounded-full shadow hover:bg-gray-100'>
					{logPanelOpen ? <X className='w-5 h-5' /> : <FileText className='w-5 h-5' />}
				</button>
			</div>

			{/* Log Panel */}
			{logPanelOpen && <VAScaleLogPanel logEntries={logEntries} />}

			{/* Main Display */}
			<div className='w-full h-full flex flex-col items-center justify-center' style={{ backgroundColor: config.bgColor, paddingLeft: logPanelOpen ? '320px' : '0' }}>
				<div
					className='grid'
					style={{
						gridTemplateColumns: `repeat(${cols}, ${cellSizePx}px)`,
						gridTemplateRows: `repeat(${rows}, ${cellSizePx}px)`,
						gap: `${mmToPx(config.holeGap)}px`,
					}}>
					{Array.from({ length: rows * cols }).map((_, i) => {
						const row = Math.floor(i / cols);
						const col = i % cols;
						const isCenter = row === centerRow && col === centerCol;
						const outerMm = isCenter ? centerDiameter : config.holeSize;
						const innerMm = outerMm * config.ratio;

						return (
							<div key={i} className='flex items-center justify-center' style={{ width: cellSizePx, height: cellSizePx }}>
								<div
									className='rounded-full flex items-center justify-center'
									style={{
										width: mmToPx(outerMm),
										height: mmToPx(outerMm),
										backgroundColor: config.outerColor,
									}}>
									<div
										className='rounded-full'
										style={{
											width: mmToPx(innerMm),
											height: mmToPx(innerMm),
											backgroundColor: config.innerColor,
										}}
									/>
								</div>
							</div>
						);
					})}
				</div>

				{/* Controls */}
				<div className='absolute bottom-4 flex items-center gap-4'>
					<div className='flex gap-2'>
						<button disabled={!allowScaleDown} onClick={() => handleScale('Down')} className='flex items-center gap-1 p-2 rounded bg-white shadow border hover:bg-gray-200 disabled:opacity-50'>
							<ArrowDown size={16} />
							<span className='text-sm'>Decrease</span>
						</button>
						<button disabled={!allowScaleUp} onClick={() => handleScale('Up')} className='flex items-center gap-1 p-2 rounded bg-white shadow border hover:bg-gray-200 disabled:opacity-50'>
							<ArrowUp size={16} />
							<span className='text-sm'>Increase</span>
						</button>
					</div>

					{!gameOverMessage && (
						<div className='flex gap-2'>
							<button disabled={!allowResponse} onClick={() => handleResponse('I can see')} className='p-2 bg-green-300 rounded shadow disabled:opacity-50'>
								I can see
							</button>
							<button disabled={!allowResponse} onClick={() => handleResponse('I can’t see')} className='p-2 bg-red-300 rounded shadow disabled:opacity-50'>
								I can’t see
							</button>
						</div>
					)}

					{/* Exit - Always visible */}
					<button onClick={onExit} className='p-2 rounded bg-white shadow border hover:bg-gray-100 ml-2'>
						<Grid3x3 size={16} />
					</button>
				</div>

				{/* Game Over */}
				{gameOverMessage && <div className='absolute bottom-20 text-sm font-semibold text-center text-red-600 px-4'>{gameOverMessage}</div>}
			</div>
		</div>
	);
};
