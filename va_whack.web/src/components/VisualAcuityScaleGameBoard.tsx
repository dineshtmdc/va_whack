/** @format */

import { useEffect, useRef, useState } from 'react';
import { FileText, X, Home, RotateCcw } from 'lucide-react';
import type { IVAScaleGameConfig, IUserDetails, IScaleLogEntry, ResponseOption, Phase, ScaleMethod } from '../shared';
import { VAScaleLogPanel } from '.';

interface IProps {
	config: IVAScaleGameConfig;
	user: IUserDetails;
	onExit: () => void;
}

export const VisualAcuityScaleGameBoard = ({ config, onExit }: IProps) => {
	const mmToPx = (mm: number) => mm * 3.78;
	const toOdd = (n: number) => (n <= 1 ? 1 : n % 2 === 0 ? n - 1 : n);
	const getScaledMm = (mm: number) => mm * (config.viewingDistanceCm / 150);

	const calculateLogMAR = (diameterMm: number, distanceCm: number) => {
		const distanceMm = distanceCm * 10;
		const angleArcMin = (diameterMm / distanceMm) * (180 / Math.PI) * 60;
		return Math.log10(angleArcMin / 5);
	};

	const [centerDiameter, setCenterDiameter] = useState(config.holeSize);
	const [rows, setRows] = useState(1);
	const [cols, setCols] = useState(1);
	const [logEntries, setLogEntries] = useState<IScaleLogEntry[]>([]);
	const [logPanelOpen, setLogPanelOpen] = useState(false);
	const [allowResponse, setAllowResponse] = useState(true);
	const [initialResponseGiven, setInitialResponseGiven] = useState(false);
	const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);

	const [phase, setPhase] = useState<Phase>('quickSearch');
	const [trialResponses, setTrialResponses] = useState<ResponseOption[]>([]);
	const [bestlineFound, setBestlineFound] = useState(false);

	const prevDiameterRef = useRef(centerDiameter);

	const getCellSizePx = () => mmToPx(getScaledMm(config.holeSize + config.holeGap));

	const updateGridSize = () => {
		const cellSize = getCellSizePx();
		const usableWidth = window.innerWidth * (1 - config.horizontalPadding / 100);
		const usableHeight = window.innerHeight * (1 - config.verticalPadding / 100);
		setCols(toOdd(Math.floor(usableWidth / cellSize)));
		setRows(toOdd(Math.floor(usableHeight / cellSize)));
	};

	useEffect(updateGridSize, [config.holeSize, config.holeGap, config.verticalPadding, config.horizontalPadding, config.viewingDistanceCm]);

	useEffect(() => {
		window.addEventListener('resize', updateGridSize);
		return () => window.removeEventListener('resize', updateGridSize);
	}, []);

	useEffect(() => {
		setCenterDiameter(config.holeSize);
		setLogEntries([]);
		setAllowResponse(true);
		setInitialResponseGiven(false);
		setGameOverMessage(null);
		setPhase('quickSearch');
		setTrialResponses([]);
		setBestlineFound(false);
		prevDiameterRef.current = config.holeSize;
		updateGridSize();
	}, [config]);

	const autoScale = (scaleMethod: ScaleMethod) => {
		const delta = scaleMethod === 'increase' ? 1 : -1;
		const next = Math.min(Math.max(centerDiameter + delta, config.minHoleSize), config.maxHoleSize);
		if (next !== centerDiameter) setCenterDiameter(next);
		setTrialResponses([]);
	};

	const handleResponse = (response: ResponseOption) => {
		const prevDiameter = prevDiameterRef.current;
		let scaleMethod: ScaleMethod = 'same';
		if (centerDiameter > prevDiameter) scaleMethod = 'increase';
		else if (centerDiameter < prevDiameter) scaleMethod = 'decrease';

		const logmar = calculateLogMAR(centerDiameter, config.viewingDistanceCm);

		const entry: IScaleLogEntry = {
			timestamp: Date.now(),
			outerDiameter: centerDiameter,
			innerDiameter: centerDiameter * config.ratio,
			ratio: config.ratio,
			scaleMethod,
			logmar,
			userResponse: response,
		};

		prevDiameterRef.current = centerDiameter;

		setLogEntries((prev) => [...prev, entry]);
		setAllowResponse(true);
		if (!initialResponseGiven) setInitialResponseGiven(true);

		const updated: ResponseOption[] = [...trialResponses, response];
		setTrialResponses(updated);

		if (centerDiameter <= 1) {
			setGameOverMessage('Assessment Over: Minimum visible size (1 mm) reached.');
			return;
		}

		if (phase === 'quickSearch') {
			if (response === "I can't see") {
				if (centerDiameter === config.maxHoleSize) {
					setGameOverMessage('Assessment Over: User cannot see even at maximum size.');
				} else {
					setPhase('bestline');
					autoScale('increase');
				}
			} else {
				autoScale('decrease');
			}
		} else if (phase === 'bestline') {
			const updated = [...trialResponses, response];
			setTrialResponses(updated);

			const cantSee = updated.filter((r) => r === "I can't see").length;
			const canSee = updated.filter((r) => r === 'I can see').length;

			// Early jump if 2 mistakes before confirming baseline
			if (cantSee >= 2 && canSee < 3) {
				autoScale('increase'); // Jump one level up
				setTrialResponses([]); // Start over
				return;
			}

			// Confirmed bestline if 3 correct
			if (canSee >= 3 && !bestlineFound) {
				setBestlineFound(true);
			}

			// Once baseline confirmed, wait until 5 total to move on
			if (bestlineFound && updated.length >= 5) {
				setPhase('counting');
				autoScale('decrease');
				setTrialResponses([]);
				return;
			}

			// Otherwise, continue collecting trials
			setAllowResponse(true);
		} else if (phase === 'counting') {
			const updated = [...trialResponses, response];
			setTrialResponses(updated);

			if (updated.length < 5) {
				setAllowResponse(true);
				return;
			}

			const cantSee = updated.filter((r) => r === "I can't see").length;

			if (cantSee === 5 || centerDiameter <= 1 || centerDiameter === config.minHoleSize) {
				setGameOverMessage('Assessment Over: Minimum visible size (1 mm) reached.');
			} else {
				autoScale('decrease');
				setTrialResponses([]); // Reset for next 5-trial set
			}
		}
	};

	const centerRow = Math.floor(rows / 2);
	const centerCol = Math.floor(cols / 2);

	const scaledHoleSize = getScaledMm(config.holeSize);
	const scaledGap = getScaledMm(config.holeGap);
	const cellSizePx = mmToPx(scaledHoleSize + scaledGap);

	const centerOuterMm = getScaledMm(centerDiameter);
	const centerInnerMm = centerOuterMm * config.ratio;
	const baseOuterMm = scaledHoleSize;
	const baseInnerMm = baseOuterMm * config.ratio;

	return (
		<div className='w-full h-screen relative'>
			<div className='fixed top-4 left-4 z-50'>
				<button title='Toggle Scale Log' onClick={() => setLogPanelOpen((v) => !v)} className='bg-white p-2 rounded-full shadow hover:bg-gray-100'>
					{logPanelOpen ? <X className='w-5 h-5' /> : <FileText className='w-5 h-5' />}
				</button>
			</div>

			<div className='absolute top-4 right-16 z-20 flex gap-2'>
				{/* Home Button */}
				<button onClick={onExit} className='bg-white p-2 rounded-full shadow hover:bg-gray-100' title='Exit to Home'>
					<Home className='w-5 h-5' />
				</button>

				{/* Reset Button */}
				<button
					onClick={() => {
						setCenterDiameter(config.holeSize);
						setLogEntries([]);
						setAllowResponse(true);
						setInitialResponseGiven(false);
						setGameOverMessage(null);
						setPhase('quickSearch');
						setTrialResponses([]);
						setBestlineFound(false);
						prevDiameterRef.current = config.holeSize;
						updateGridSize();
					}}
					className='bg-white p-2 rounded-full shadow hover:bg-gray-100'
					title='Reset Game'>
					<RotateCcw className='w-5 h-5' />
				</button>
			</div>

			{logPanelOpen && <VAScaleLogPanel logEntries={logEntries} />}

			<div className='w-full h-full flex flex-col items-center justify-center' style={{ backgroundColor: config.bgColor, paddingLeft: logPanelOpen ? '320px' : '0' }}>
				<div
					className='grid'
					style={{
						gridTemplateColumns: `repeat(${cols}, ${cellSizePx}px)`,
						gridTemplateRows: `repeat(${rows}, ${cellSizePx}px)`,
						gap: `${mmToPx(scaledGap)}px`,
					}}>
					{Array.from({ length: rows * cols }).map((_, i) => {
						const row = Math.floor(i / cols);
						const col = i % cols;
						const isCenter = row === centerRow && col === centerCol;
						const outerMm = isCenter ? centerOuterMm : baseOuterMm;
						const innerMm = isCenter ? centerInnerMm : baseInnerMm;

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

				{!gameOverMessage && (
					<div className='absolute bottom-4 flex items-center gap-4'>
						<button disabled={!allowResponse} onClick={() => handleResponse('I can see')} className='px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded shadow disabled:opacity-50 disabled:cursor-not-allowed'>
							I can see{(phase === 'bestline' || phase === 'counting') && ` (${trialResponses.length + 1}/5)`}
						</button>

						<button disabled={!allowResponse} onClick={() => handleResponse("I can't see")} className='px-6 py-3 bg-red-600 text-white text-lg font-semibold rounded shadow disabled:opacity-50 disabled:cursor-not-allowed'>
							I can’t see{(phase === 'bestline' || phase === 'counting') && ` (${trialResponses.length + 1}/5)`}
						</button>
						{bestlineFound && !gameOverMessage && (
							<button onClick={() => setGameOverMessage('Assessment ended by user.')} className='px-6 py-3 bg-gray-500 text-white text-lg font-semibold rounded shadow hover:bg-gray-600'>
								I Give Up
							</button>
						)}
					</div>
				)}
				{gameOverMessage && <div className='absolute bottom-20 text-sm font-semibold text-center text-red-600 px-4'>{gameOverMessage}</div>}
			</div>
		</div>
	);
};
