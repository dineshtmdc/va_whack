/** @format */

import { useState, useMemo, useEffect } from 'react';
import { GameService, type IUserDetails, type IScaleGameSession, type IEnagementGameSession, labels } from '../../shared';

import { Timer, BarChart3, Home, ChevronDown, ChevronUp, Globe, Info } from 'lucide-react';

import { useUIStore } from '../../shared/zustand/ui_store';
import toast from 'react-hot-toast';
import { VAScaleChart } from '..';

interface IProps {
	user: IUserDetails;
	onExit: () => void;
}

const SCORE_INFO: Record<string, string> = {
	SS1: 'Detection Speed (SS₁): Measures how quickly the user responds to a stimulus. Faster is better.',
	SS2: 'Detection Accuracy (SS₂): Represents the precision of clicks relative to the target center.',
	SS3: 'Spatial Uniformity (SS₃): Evaluates the consistency of detection speed across all screen regions.',
	SS4: 'Sensitivity Threshold (SS₄): Indicates the smallest stimulus size reliably detected (based on logMAR).',
	SS5: 'False Positive Rate (SS₅): Percentage of clicks made on fake (non-target) moles. Lower is better.',
	SS6: 'Miss Rate (SS₆): Percentage of real targets that were missed (not clicked). Lower is better.',
	SS7: 'Click Validity (SS₇): Proportion of clicks that were valid (on real targets). Higher is better.',
	SS8: 'Trial Consistency (SS₈): Measures variability in reaction times. Lower variability indicates more consistent performance.',
	SS9: 'Max Hit Streak (SS₉): Longest consecutive streak of correct hits. Reflects focus and engagement.',
	SS10: 'Coordination Proxy (SS₁₀): Blended metric reflecting both speed and accuracy of responses.',
	SS11: 'Target Discrimination (SS₁₁): Measures ability to correctly respond to targets while ignoring distractors.',
	VAfinal: 'VA Final: Weighted composite score (0–100) derived from all 11 sub-scores (SS₁–SS₁₁), reflecting overall visual acuity, coordination, and task performance.',
	total_trials: 'Total Trials: Total number of stimuli (targets and distractors) presented in the session.',
	total_mole_trials: 'Total Mole Trials: Number of real (target) moles presented.',
	total_fake_trials: 'Total Fake Trials: Number of fake (distractor) rabbits presented.',
	grade: 'Vision Quality: Qualitative score (Excellent to Poor) based on VA Final average across all levels.',
};

const getOverallVisionQuality = (scores: (number | undefined)[]): string => {
	const validScores = scores.filter((v): v is number => typeof v === 'number');
	if (validScores.length === 0) return '—';

	const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length;

	if (avg >= 90) return 'Excellent';
	if (avg >= 75) return 'Good';
	if (avg >= 60) return 'Average';
	if (avg >= 40) return 'Below Average';
	return 'Poor';
};

export const Profile = ({ user, onExit }: IProps) => {
	const lang = useUIStore((s) => s.lang);
	const toggleLang = useUIStore((s) => s.toggleLang);
	const t = labels[lang];

	const [scaleSessionsFromDb, setScaleSessionsFromDb] = useState<IScaleGameSession[]>([]);
	const [engagementSessionsFromDb, setEngagementSessionsFromDb] = useState<IEnagementGameSession[]>([]);
	const [activeScoreKeyMap, setActiveScoreKeyMap] = useState<Record<string, string | null>>({});
	const [loadingMasterIdForDownload, setLoadingMasterIdForDownload] = useState<string | null>(null);
	const [loadingMasterIdForEmail, setLoadingMasterIdForEmail] = useState<string | null>(null);

	useEffect(() => {
		const fetchGameHistory = async () => {
			try {
				const history = await GameService.getPlayerGameHistory();
				if (history) {
					setScaleSessionsFromDb(history.scaleGames || []);
					setEngagementSessionsFromDb(history.engagementGames || []);
				}
			} catch (error) {
				console.error('Error fetching game history:', error);
			}
		};
		fetchGameHistory();
	}, []);

	const groupedByMasterSession = useMemo(() => {
		const allScaleSessions: IScaleGameSession[] = [...scaleSessionsFromDb];
		const allEngagementSessions: IEnagementGameSession[] = [...engagementSessionsFromDb];
		const allSessions = [...allScaleSessions, ...allEngagementSessions];

		const grouped: Record<string, { scale?: IScaleGameSession; engagement: IEnagementGameSession[] }> = {};

		for (const session of allSessions) {
			const masterId = 'masterSessionId' in session ? session.masterSessionId : '';
			if (!masterId) continue;
			if (!grouped[masterId]) grouped[masterId] = { engagement: [] };

			if ('logEntries' in session) {
				grouped[masterId].scale = session;
			} else {
				grouped[masterId].engagement.push(session);
			}
		}
		return grouped;
	}, [scaleSessionsFromDb, engagementSessionsFromDb]);

	const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});

	useEffect(() => {
		const initialState: Record<string, boolean> = {};
		for (const masterId in groupedByMasterSession) {
			initialState[masterId] = true;
		}
		setExpandedSessions(initialState);
	}, [groupedByMasterSession]);

	const handleDownloadAIAnalysis = async (masterId: string) => {
		setLoadingMasterIdForDownload(masterId);
		try {
			await GameService.downloadReport(masterId);
			toast.success('AI report downloaded successfully.');
		} catch (error) {
			console.error('Download failed:', error);
			toast.error('Failed to download AI report.');
		} finally {
			setLoadingMasterIdForDownload(null);
		}
	};

	const handleEmailReport = async (masterId: string) => {
		setLoadingMasterIdForEmail(masterId);
		try {
			await GameService.sendAIReportEmail(masterId);
			toast.success('AI report emailed successfully.');
		} catch (error) {
			console.error('Email send failed:', error);
			toast.error('Failed to send AI report email.');
		} finally {
			setLoadingMasterIdForEmail(null);
		}
	};

	return (
		<div className='relative min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6'>
			{/* Top-left: Language toggle */}
			<div className='absolute top-4 left-4 flex flex-col gap-2 z-10'>
				<button onClick={toggleLang} className='p-2 bg-white rounded shadow hover:bg-gray-100 flex items-center gap-2'>
					<Globe className='w-4 h-4' />
					{t.langToggle}
				</button>
			</div>

			{/* Top-right: Exit button */}
			<button onClick={onExit} className='absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:bg-gray-100'>
				<Home className='w-6 h-6 text-gray-700' />
			</button>

			<h1 className='text-3xl font-bold text-center mb-2 text-gray-800'>{t.profileTitle}</h1>
			<p className='text-center text-gray-600 mb-8'>
				{t.profilePlayer}: {user.name || user.email}
			</p>

			{Object.entries(groupedByMasterSession).length === 0 ? (
				<p className='text-center text-gray-500 italic'>{t.profileNoSessions}</p>
			) : (
				Object.entries(groupedByMasterSession).map(([masterId, group], idx) => {
					const isExpanded = expandedSessions[masterId] ?? true;

					return (
						<div key={masterId} className='bg-white shadow-lg rounded-lg p-6 mb-10'>
							<div className='mb-4'>
								{/* Header */}
								<div className='flex items-center justify-between'>
									<h2 className='text-xl font-bold text-indigo-700'>
										{t.profileSession} #{idx + 1}
									</h2>
									<button
										className='p-1 rounded hover:bg-gray-200 transition'
										onClick={() =>
											setExpandedSessions((prev) => ({
												...prev,
												[masterId]: !prev[masterId],
											}))
										}
										aria-label={isExpanded ? 'Collapse' : 'Expand'}>
										{isExpanded ? <ChevronUp className='w-5 h-5 text-gray-700' /> : <ChevronDown className='w-5 h-5 text-gray-700' />}
									</button>
								</div>

								{/* Action buttons */}
								{isExpanded && (
									<div className='mt-2 flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2'>
										<button className='relative bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm sm:text-base sm:w-auto w-full disabled:opacity-50 disabled:cursor-wait' onClick={() => handleDownloadAIAnalysis(masterId)} disabled={loadingMasterIdForDownload === masterId}>
											{loadingMasterIdForDownload === masterId ? (
												<span className='flex items-center gap-2'>
													<span className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></span>
													Downloading...
												</span>
											) : (
												t.profileDownloadAI
											)}
										</button>

										<button className='relative bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm sm:text-base sm:w-auto w-full disabled:opacity-50 disabled:cursor-wait' onClick={() => handleEmailReport(masterId)} disabled={loadingMasterIdForEmail === masterId}>
											{loadingMasterIdForEmail === masterId ? (
												<span className='flex items-center gap-2'>
													<span className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></span>
													Sending...
												</span>
											) : (
												t.profileEmail
											)}
										</button>
									</div>
								)}
							</div>

							{isExpanded && (
								<>
									{/* VA Scale Game */}
									{group.scale && (
										<div className='mb-8'>
											<h3 className='text-lg font-semibold text-orange-600 flex items-center gap-2'>
												<BarChart3 className='w-5 h-5' /> {t.profileVAScaleTitle}
											</h3>
											<p className='text-sm text-gray-500'>
												{t.profileStart}: {new Date(group.scale.startTime).toLocaleString()}
												<br />
												{t.profileEnd}: {group.scale.endTime ? new Date(group.scale.endTime).toLocaleString() : t.profileInProgress}
											</p>
											<p className='mt-2 text-sm text-gray-700'>
												<b>{t.profileConfig}:</b> HoleSize = {group.scale.config.holeSize} mm, Ratio = {group.scale.config.ratio}, Gap = {group.scale.config.holeGap}px, Distance = {group.scale.config.viewingDistanceCm} cm
											</p>
											<p className='mt-2 text-sm text-gray-700'>
												<b>{t.profileScore}:</b> bestVA = {group.scale.score.bestVA}, finalVA = {group.scale.score.finalVA}, b = {group.scale.score.b}, n = {group.scale.score.n}
											</p>

											<div className='mt-4 flex flex-col lg:flex-row gap-4'>
												{/* Table section (left) */}
												<div className='flex-1 overflow-auto border rounded'>
													<table className='min-w-[600px] text-sm w-full'>
														<thead className='bg-gray-100'>
															<tr>
																<th className='border p-1'>#</th>
																<th className='border p-1'>{t.profileOuter}</th>
																<th className='border p-1'>{t.profileInner}</th>
																<th className='border p-1'>{t.profileRatio}</th>
																<th className='border p-1'>{t.profileLogMAR}</th>
																<th className='border p-1'>{t.profileResponse}</th>
																<th className='border p-1'>{t.profileTime}</th>
															</tr>
														</thead>
														<tbody>
															{group.scale.logEntries.map((entry, i) => (
																<tr key={i}>
																	<td className='border p-1'>{i + 1}</td>
																	<td className='border p-1'>{entry.outerDiameter.toFixed(1)}</td>
																	<td className='border p-1'>{entry.innerDiameter.toFixed(1)}</td>
																	<td className='border p-1'>{entry.ratio}</td>
																	<td className='border p-1'>{entry.logmar}</td>
																	<td className='border p-1'>{entry.userResponse || '-'}</td>
																	<td className='border p-1'>{new Date(entry.timestamp).toLocaleTimeString()}</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>

												{/* Chart section (right) */}
												<div className='w-full lg:w-[600px] h-[500px]'>
													<VAScaleChart logEntries={group.scale.logEntries} bestVA={group.scale.score.bestVA} finalVA={group.scale.score.finalVA} disableDraggable={true} />
												</div>
											</div>
										</div>
									)}

									{/* Engagement Game */}
									{group.engagement.length > 0 && (
										<div>
											<h3 className='text-lg font-semibold text-green-600 flex items-center gap-2'>
												<Timer className='w-5 h-5' /> {t.profileEngagementTitle}
											</h3>
											{/* Overall Vision Quality */}
											<div className='mt-4 text-sm text-gray-700'>
												<b>Overall Vision Quality (All Levels):</b>{' '}
												<span
													className={(() => {
														const avg =
															group.engagement
																.map((s) => s.scores?.VAfinal)
																.filter((v): v is number => typeof v === 'number')
																.reduce((a, b) => a + b, 0) / (group.engagement.filter((s) => typeof s.scores?.VAfinal === 'number').length || 1);

														if (avg >= 90) return 'text-green-700 font-semibold';
														if (avg >= 75) return 'text-emerald-600 font-semibold';
														if (avg >= 60) return 'text-yellow-600 font-semibold';
														if (avg >= 40) return 'text-orange-600 font-semibold';
														return 'text-red-600 font-semibold';
													})()}>
													{getOverallVisionQuality(group.engagement.map((s) => s.scores?.VAfinal))}
												</span>
											</div>
											{group.engagement.map((s, i) => (
												<div key={s.gameId} className='border border-gray-300 rounded-md p-3 mt-4'>
													<p className='text-sm text-gray-500'>
														<span className='text-amber-900'>
															<b>Level {i + 1}</b>
														</span>{' '}
														— Start: {new Date(s.startTime).toLocaleString()} | End: {s.endTime ? new Date(s.endTime).toLocaleString() : 'In progress'}
													</p>
													<p className='text-sm text-gray-700 mt-1'>
														<b>Config:</b> HoleSize = {s.config.holeSize}px, Gap = {s.config.holeGap}px, FakeCount = {s.config.fakeCount}, Interval = {s.config.spawnInterval}ms
													</p>
													<div className='text-sm text-gray-700 mt-2'>
														<b>Scores:</b>
														<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 mt-1'>
															{[
																{ key: 'SS1', label: 'Detection Speed (SS₁)', value: s.scores.SS1_detectionSpeed },
																{ key: 'SS2', label: 'Detection Accuracy (SS₂)', value: s.scores.SS2_detectionAccuracy },
																{ key: 'SS3', label: 'Spatial Uniformity (SS₃)', value: s.scores.SS3_spatialUniformity },
																{ key: 'SS4', label: 'Sensitivity Threshold (SS₄)', value: s.scores.SS4_sensitivityThreshold },
																{ key: 'SS5', label: 'False Positive Rate (SS₅)', value: s.scores.SS5_falsePositiveRate },
																{ key: 'SS6', label: 'Miss Rate (SS₆)', value: s.scores.SS6_missRate },
																{ key: 'SS7', label: 'Click Validity (SS₇)', value: s.scores.SS7_clickValidity },
																{ key: 'SS8', label: 'Trial Consistency (SS₈)', value: s.scores.SS8_trialConsistency },
																{ key: 'SS9', label: 'Max Hit Streak (SS₉)', value: s.scores.SS9_maxHitStreak },
																{ key: 'SS10', label: 'Coordination Proxy (SS₁₀)', value: s.scores.SS10_coordinationProxy },
																{ key: 'SS11', label: 'Target Discrimination (SS₁₁)', value: s.scores.SS11_targetDiscrimination },
																{ key: 'VAfinal', label: 'VA Final Score', value: s.scores.VAfinal },
															].map(({ key, label, value }) => (
																<div key={key} className='flex items-start gap-1'>
																	<button onClick={() => setActiveScoreKeyMap((prev) => ({ ...prev, [s.gameId]: key }))} aria-label={`Explain ${label}`} className='mt-[2px] text-blue-600 hover:text-blue-800'>
																		<Info className='w-4 h-4' />
																	</button>
																	<div>
																		<b>{label}:</b> {value != null ? value.toFixed(2) : '—'}
																	</div>
																</div>
															))}
														</div>
													</div>

													{/* Trial Stats & Grade Summary */}
													<div className='mt-4 border-t pt-3 text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2'>
														{[
															{ key: 'total_trials', label: 'Total Trials', value: s.scores.totalTrials },
															{ key: 'total_mole_trials', label: 'Total Mole Trials', value: s.scores.totalMoleTrials },
															{ key: 'total_fake_trials', label: 'Total Fake Trials', value: s.scores.totalFakeTrials },
															{
																key: 'grade',
																label: 'Vision Quality',
																value: (() => {
																	const score = s.scores.VAfinal ?? 0;
																	if (score >= 90) return 'Excellent';
																	if (score >= 75) return 'Good';
																	if (score >= 60) return 'Average';
																	if (score >= 40) return 'Below Average';
																	return 'Poor';
																})(),
																color: (() => {
																	const score = s.scores.VAfinal ?? 0;
																	if (score >= 90) return 'text-green-700';
																	if (score >= 75) return 'text-emerald-600';
																	if (score >= 60) return 'text-yellow-600';
																	if (score >= 40) return 'text-orange-600';
																	return 'text-red-600';
																})(),
															},
														].map(({ key, label, value, color }) => (
															<div key={key} className='flex items-start gap-1'>
																<button onClick={() => setActiveScoreKeyMap((prev) => ({ ...prev, [s.gameId]: key }))} aria-label={`Explain ${label}`} className='mt-[2px] text-blue-600 hover:text-blue-800'>
																	<Info className='w-4 h-4' />
																</button>
																<div>
																	<b>{label}:</b> <span className={color ?? ''}>{value != null ? value : '—'}</span>
																</div>
															</div>
														))}
													</div>

													{activeScoreKeyMap[s.gameId] && (
														<div className='mt-4 p-3 border border-blue-300 rounded bg-blue-50'>
															<div className='flex justify-between items-center mb-1'>
																<b className='text-blue-800'>Explanation</b>
																<button onClick={() => setActiveScoreKeyMap((prev) => ({ ...prev, [s.gameId]: null }))} className='text-sm text-blue-600 hover:underline'>
																	Close
																</button>
															</div>
															<p className='text-blue-700 text-sm'>{SCORE_INFO[activeScoreKeyMap[s.gameId] ?? '']}</p>
														</div>
													)}

													<div className='mt-3 max-h-[300px] overflow-y-auto border rounded'>
														<table className='w-full text-sm'>
															<thead className='sticky top-0 bg-gray-100'>
																<tr>
																	<th className='border p-1'>#</th>
																	<th className='border p-1'>Type</th>
																	<th className='border p-1'>Row/Col</th>
																	<th className='border p-1'>Clicked</th>
																	<th className='border p-1'>Hit</th>
																	<th className='border p-1'>Time</th>
																</tr>
															</thead>
															<tbody>
																{s.events.map((e, j) => (
																	<tr key={j}>
																		<td className='border p-1'>{j + 1}</td>
																		<td className='border p-1'>{e.targetType}</td>
																		<td className='border p-1'>
																			{e.row},{e.col}
																		</td>
																		<td className='border p-1'>{e.clicked ? 'Yes' : 'No'}</td>
																		<td className='border p-1'>{e.wasHit ? 'Yes' : 'No'}</td>
																		<td className='border p-1'>{new Date(e.appearTime).toLocaleTimeString()}</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												</div>
											))}
										</div>
									)}
								</>
							)}
						</div>
					);
				})
			)}
		</div>
	);
};
