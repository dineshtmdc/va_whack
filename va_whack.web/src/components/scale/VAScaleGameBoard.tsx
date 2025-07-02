/** @format */

import { useEffect, useRef, useState } from 'react';
import { FileText, X, Home, RotateCcw } from 'lucide-react';
import { type IVAScaleGameConfig, type IUserDetails, type IScaleLogEntry, type IScaleGameScore, type ResponseOption, type Phase, type ScaleMethod, useVAScaleGameSessionStore, GameService } from '../../shared';
import { VAScaleChart, VAScaleGameStatistics } from '..';

interface IProps {
	config: IVAScaleGameConfig;
	user: IUserDetails;
	onExit: () => void;
}

export const VAScaleGameBoard = ({ config, user, onExit }: IProps) => {
	const mmToPx = (mm: number) => mm * 3.78;
	const toOdd = (n: number) => (n <= 1 ? 1 : n % 2 === 0 ? n - 1 : n);

	const logmarToMm = (logmar: number, distanceCm: number): number => {
		const distanceMm = distanceCm * 10;
		const angleDeg = (5 * Math.pow(10, logmar)) / 60;
		const angleRad = (angleDeg * Math.PI) / 180;
		return 2 * distanceMm * Math.tan(angleRad / 2);
	};

	const calculateLogMAR = (diameterMm: number, distanceCm: number) => {
		const distanceMm = distanceCm * 10;
		const angleArcMin = (diameterMm / distanceMm) * (180 / Math.PI) * 60;
		return Math.log10(angleArcMin / 5);
	};

	const [currentLogmar, setCurrentLogmar] = useState(1.0);
	const [rows, setRows] = useState(1);
	const [cols, setCols] = useState(1);
	const [logEntries, setLogEntries] = useState<IScaleLogEntry[]>([]);
	const [logPanelOpen, setLogPanelOpen] = useState(false);
	const [allowResponse, setAllowResponse] = useState(true);
	const [initialResponseGiven, setInitialResponseGiven] = useState(false);
	const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);
	const [scoreCalculated, setScoreCalculated] = useState(false);
	const [phase, setPhase] = useState<Phase>('quickSearch');
	const [trialResponses, setTrialResponses] = useState<ResponseOption[]>([]);
	const [bestlineFound, setBestlineFound] = useState(false);
	const [showChart, setShowChart] = useState(false);
	const [isHoveringControlsRight, setHoveringControlsRight] = useState(false);
	const [isHoveringControlsLeft, setHoveringControlsLeft] = useState(false);
	const [calculatedScore, setCalculatedScore] = useState<IScaleGameScore | null>(null);
	const [showScoreDialog, setShowScoreDialog] = useState(false);
	const prevLogmarRef = useRef(currentLogmar);

	const { startSession, endSession, addLogEntry, setScore, getLastSession } = useVAScaleGameSessionStore();

	useEffect(() => {
		startSession(user.email, config);
	}, [user, config, startSession]);

	useEffect(() => {
		if (gameOverMessage) {
			endSession();
		}
	}, [gameOverMessage, endSession]);

	const getCellSizePx = () => mmToPx(logmarToMm(1.0, config.viewingDistanceCm) + config.holeGap);

	const updateGridSize = () => {
		const cellSize = getCellSizePx();
		const usableWidth = window.innerWidth * (1 - config.horizontalPadding / 100);
		const usableHeight = window.innerHeight * (1 - config.verticalPadding / 100);
		setCols(toOdd(Math.floor(usableWidth / cellSize)));
		setRows(toOdd(Math.floor(usableHeight / cellSize)));
	};

	useEffect(updateGridSize, [currentLogmar, config.holeGap, config.verticalPadding, config.horizontalPadding, config.viewingDistanceCm]);

	useEffect(() => {
		window.addEventListener('resize', updateGridSize);
		return () => window.removeEventListener('resize', updateGridSize);
	}, []);

	useEffect(() => {
		setCurrentLogmar(1.0);
		setLogEntries([]);
		setAllowResponse(true);
		setInitialResponseGiven(false);
		setGameOverMessage(null);
		setScoreCalculated(false);
		setPhase('quickSearch');
		setTrialResponses([]);
		setBestlineFound(false);
		prevLogmarRef.current = 1.0;
		updateGridSize();
	}, [config]);

	const autoScale = (method: ScaleMethod) => {
		let next = currentLogmar;

		if (method === 'increase') {
			next = Math.min(1.0, currentLogmar + 0.1);
		} else if (method === 'decrease') {
			if (currentLogmar <= -0.3) {
				setGameOverMessage('Assessment Over: Minimum logMAR reached.');
				return;
			}
			next = Math.max(-0.3, currentLogmar - 0.1);
		}

		setCurrentLogmar(parseFloat(next.toFixed(1)));
		setTrialResponses([]);
	};

	const handleResponse = (response: ResponseOption) => {
		const currentDiameter = logmarToMm(currentLogmar, config.viewingDistanceCm);
		const scaleMethod: ScaleMethod = currentLogmar > prevLogmarRef.current ? 'increase' : currentLogmar < prevLogmarRef.current ? 'decrease' : 'same';
		const logmarValue = calculateLogMAR(currentDiameter, config.viewingDistanceCm);

		const entry: IScaleLogEntry = {
			timestamp: Date.now(),
			outerDiameter: currentDiameter,
			innerDiameter: currentDiameter * config.ratio,
			ratio: config.ratio,
			scaleMethod,
			logmar: logmarValue,
			userResponse: response,
		};

		prevLogmarRef.current = currentLogmar;

		addLogEntry(entry);
		setLogEntries((prev) => [...prev, entry]);
		setAllowResponse(true);
		if (!initialResponseGiven) setInitialResponseGiven(true);

		const updated = [...trialResponses, response];
		setTrialResponses(updated);

		if (currentDiameter <= 1) {
			setGameOverMessage('Assessment Over: Minimum visible size (1 mm) reached.');
			return;
		}

		if (phase === 'quickSearch') {
			if (response === "I can't see") {
				if (currentLogmar === 1.0) {
					setGameOverMessage('Assessment Over: User cannot see even at maximum size.');
				} else {
					setPhase('bestline');
					autoScale('increase');
				}
			} else {
				autoScale('decrease');
			}
		} else if (phase === 'bestline') {
			const cantSee = updated.filter((r) => r === "I can't see").length;
			const canSee = updated.filter((r) => r === 'I can see').length;

			if (cantSee >= 2 && canSee < 3) {
				autoScale('increase');
				setTrialResponses([]);
				return;
			}

			if (canSee >= 3 && !bestlineFound) {
				setBestlineFound(true);
			}

			if (bestlineFound && updated.length >= 5) {
				setPhase('counting');
				autoScale('decrease');
				setTrialResponses([]);
				return;
			}
		} else if (phase === 'counting') {
			if (updated.length >= 5) {
				const cantSee = updated.filter((r) => r === "I can't see").length;
				if (cantSee === 5 || currentLogmar <= -0.3) {
					setGameOverMessage('Assessment Over: Minimum logMAR reached.');
				} else {
					autoScale('decrease');
					setTrialResponses([]);
				}
			}
		}
	};

	const handleCalculateScore = async () => {
		const session = getLastSession();

		if (!session) {
			console.warn('No active session to submit.');
			return;
		}

		const score = await GameService.submitVAScaleGame(session);

		if (score) {
			setScore(score); // Zustand store update
			setCalculatedScore(score); // Local state update
			setScoreCalculated(true);
			setShowScoreDialog(true); // Open dialog
		} else {
			console.error('Failed to calculate or submit score.');
		}
	};

	const centerRow = Math.floor(rows / 2);
	const centerCol = Math.floor(cols / 2);
	const currentDiameter = logmarToMm(currentLogmar, config.viewingDistanceCm);
	const baseDiameter = logmarToMm(1.0, config.viewingDistanceCm);

	return (
		<div className='w-full h-screen relative'>
			{gameOverMessage && !scoreCalculated && (
				<div className='absolute top-4 left-1/2 transform -translate-x-1/2 z-30'>
					<button onClick={handleCalculateScore} className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded shadow'>
						Calculate Score
					</button>
				</div>
			)}

			<div className={`fixed top-3 left-4 z-40 flex gap-2 ${isHoveringControlsLeft ? 'opacity-100' : 'opacity-0'}`} onMouseEnter={() => setHoveringControlsLeft(true)} onMouseLeave={() => setHoveringControlsLeft(false)}>
				<button title='Toggle Scale Log' onClick={() => setLogPanelOpen((v) => !v)} className='bg-white p-2 rounded-full shadow hover:bg-gray-100'>
					{logPanelOpen ? <X className='w-5 h-5' /> : <FileText className='w-5 h-5' />}
				</button>
				<button title='Toggle Chart' onClick={() => setShowChart((v) => !v)} className='bg-white p-2 rounded-full shadow hover:bg-gray-100'>
					📈
				</button>
			</div>

			{/* Right Controls */}
			<div className={`absolute top-4 right-16 z-20 flex gap-2 transition-opacity duration-300 ${isHoveringControlsRight ? 'opacity-100' : 'opacity-0'}`} onMouseEnter={() => setHoveringControlsRight(true)} onMouseLeave={() => setHoveringControlsRight(false)}>
				<button onClick={onExit} className='bg-white p-2 rounded-full shadow hover:bg-gray-100' title='Exit to Home'>
					<Home className='w-5 h-5' />
				</button>
				<button
					onClick={() => {
						endSession();
						setCurrentLogmar(1.0);
						setLogEntries([]);
						setAllowResponse(true);
						setInitialResponseGiven(false);
						setGameOverMessage(null);
						setScoreCalculated(false);
						setPhase('quickSearch');
						setTrialResponses([]);
						setBestlineFound(false);
						prevLogmarRef.current = 1.0;
						updateGridSize();
					}}
					className='bg-white p-2 rounded-full shadow hover:bg-gray-100'
					title='Reset Game'>
					<RotateCcw className='w-5 h-5' />
				</button>
			</div>

			{logPanelOpen && <VAScaleGameStatistics isOpen={logPanelOpen} onClose={() => setLogPanelOpen(false)} />}
			{showChart && (
				<div className='fixed left-0 w-full bg-white shadow-lg z-40'>
					<VAScaleChart logEntries={logEntries} bestVA={0.5} finalVA={0.4} onClose={() => setShowChart(false)} />
				</div>
			)}

			{/* Grid & Buttons */}
			<div className='w-full h-full flex flex-col items-center justify-center' style={{ backgroundColor: config.bgColor, paddingLeft: logPanelOpen ? '320px' : '0' }}>
				<div
					className='grid'
					style={{
						gridTemplateColumns: `repeat(${cols}, ${getCellSizePx()}px)`,
						gridTemplateRows: `repeat(${rows}, ${getCellSizePx()}px)`,
						gap: `${mmToPx(config.holeGap)}px`,
					}}>
					{Array.from({ length: rows * cols }).map((_, i) => {
						const row = Math.floor(i / cols);
						const col = i % cols;
						const isCenter = row === centerRow && col === centerCol;

						const outer = isCenter ? currentDiameter : baseDiameter;
						const inner = outer * config.ratio;

						return (
							<div key={i} className='flex items-center justify-center' style={{ width: getCellSizePx(), height: getCellSizePx() }}>
								<div className='rounded-full flex items-center justify-center' style={{ width: mmToPx(outer), height: mmToPx(outer), backgroundColor: config.outerColor }}>
									<div className='rounded-full' style={{ width: mmToPx(inner), height: mmToPx(inner), backgroundColor: config.innerColor }} />
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
				{showScoreDialog && calculatedScore && (
					<div className='fixed inset-0 bg-black/40 z-50 flex items-center justify-center'>
						<div className='bg-white p-6 rounded-lg shadow-lg w-[300px]'>
							<h2 className='text-lg font-semibold mb-4 text-center'>Score Summary</h2>
							<ul className='text-sm space-y-1'>
								<li>
									<strong>VAfinal = VAbest-line– 0.02n + 0.02b</strong>
								</li>
								<li>
									<strong>Best VA:</strong> {calculatedScore.bestVA.toFixed(2)}
								</li>
								<li>
									<strong>Final VA:</strong> {calculatedScore.finalVA.toFixed(2)}
								</li>
								<li>
									<strong>n = No of correct identifications below the best-line:</strong> {calculatedScore.n}
								</li>
								<li>
									<strong>b = No of errors on best-line:</strong> {calculatedScore.b}
								</li>
							</ul>
							<div className='mt-4 flex justify-center'>
								<button onClick={() => setShowScoreDialog(false)} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
									Close
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
