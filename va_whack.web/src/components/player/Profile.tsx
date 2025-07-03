/** @format */

import { useState, useMemo } from 'react';
import { useVAScaleGameSessionStore, useEnagementGameSessionStore, type IUserDetails, type IScaleGameSession, type IEnagementGameSession, labels } from '../../shared';

import { Timer, BarChart3, Home, ChevronDown, ChevronUp, Globe } from 'lucide-react';

import { useUIStore } from '../../shared/zustand/ui_store';

interface IProps {
	user: IUserDetails;
	onExit: () => void;
}

export const Profile = ({ user, onExit }: IProps) => {
	const lang = useUIStore((s) => s.lang);
	const toggleLang = useUIStore((s) => s.toggleLang);
	const t = labels[lang];

	const currentScaleSession = useVAScaleGameSessionStore((s) => s.currentSession);
	const scaleHistory = useVAScaleGameSessionStore((s) => s.sessionHistory);

	const currentEngagementSession = useEnagementGameSessionStore((s) => s.currentSession);
	const engagementHistory = useEnagementGameSessionStore((s) => s.sessionHistory);

	const [scaleSessionsFromDb] = useState<IScaleGameSession[]>([]);
	const [engagementSessionsFromDb] = useState<IEnagementGameSession[]>([]);

	const allScaleSessions: IScaleGameSession[] = [...(currentScaleSession ? [currentScaleSession] : []), ...scaleHistory, ...scaleSessionsFromDb];
	const allEngagementSessions: IEnagementGameSession[] = [...(currentEngagementSession ? [currentEngagementSession] : []), ...engagementHistory, ...engagementSessionsFromDb];

	const groupedByMasterSession = useMemo(() => {
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
	}, [allScaleSessions, allEngagementSessions]);

	const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>(() => {
		const initialState: Record<string, boolean> = {};
		for (const masterId in groupedByMasterSession) {
			initialState[masterId] = true; // default expanded
		}
		return initialState;
	});

	const handleDownloadAIAnalysis = (masterId: string) => {
		const group = groupedByMasterSession[masterId];
		console.log('Download AI Report:', masterId, group);
		alert('Under Developing');
	};

	const handleDownloadGameData = (masterId: string) => {
		const group = groupedByMasterSession[masterId];
		console.log('Download Game Data:', masterId, group);
		alert('Under Developing');
	};

	const handleEmailReport = (masterId: string) => {
		const group = groupedByMasterSession[masterId];
		console.log('Email report for:', masterId, group);
		alert('Under Developing');
	};

	return (
		<div className='relative min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6'>
			{/* Top-left: Language + Back stacked */}
			<div className='absolute top-4 left-4 flex flex-col gap-2 z-10'>
				<button onClick={toggleLang} className='p-2 bg-white rounded shadow hover:bg-gray-100 flex items-center gap-2'>
					<Globe className='w-4 h-4' />
					{t.langToggle}
				</button>
			</div>

			{/* Top-right: Exit/Home button stays as-is */}
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
								{/* Title + Expand/Collapse */}
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

								{/* Download buttons */}
								{isExpanded && (
									<div className='mt-2 flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2'>
										<button className='bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm sm:text-base sm:w-auto w-full' onClick={() => handleDownloadAIAnalysis(masterId)}>
											{t.profileDownloadAI}
										</button>

										<button className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm sm:text-base sm:w-auto w-full' onClick={() => handleDownloadGameData(masterId)}>
											{t.profileDownloadGame}
										</button>

										<button className='bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm sm:text-base sm:w-auto w-full' onClick={() => handleEmailReport(masterId)}>
											{t.profileEmail}
										</button>
									</div>
								)}
							</div>

							{isExpanded && (
								<>
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
												<b>{t.profileConfig}:</b> HoleSize = {group.scale.config.holeSize} mm, Ratio = {group.scale.config.ratio}, Gap = {group.scale.config.holeGap}
												px, Distance = {group.scale.config.viewingDistanceCm} cm
											</p>
											<p className='mt-2 text-sm text-gray-700'>
												<b>{t.profileScore}:</b> bestVA = {group.scale.score.bestVA}, finalVA = {group.scale.score.finalVA}, b = {group.scale.score.b}, n = {group.scale.score.n}
											</p>
											<div className='overflow-x-auto mt-4'>
												<table className='min-w-[600px] text-sm border'>
													<thead>
														<tr className='bg-gray-100'>
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
											</div>{' '}
										</div>
									)}

									{group.engagement.length > 0 && (
										<div>
											<h3 className='text-lg font-semibold text-green-600 flex items-center gap-2'>
												<Timer className='w-5 h-5' /> {t.profileEngagementTitle}
											</h3>
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

													<p className='text-sm text-gray-700 mt-1'>
														<b>Scores:</b>
														<br />
														SS1 = {s.scores.SS1_detectionSpeed ?? '-'}, SS2 = {s.scores.SS2_detectionAccuracy ?? '-'}, SS3 = {s.scores.SS3_spatialUniformity ?? '-'}, SS4 = {s.scores.SS4_sensitivityThreshold ?? '-'}
														<br />
														SS5 = {s.scores.SS5_falsePositiveRate ?? '-'}, SS6 = {s.scores.SS6_missRate ?? '-'}, SS7 = {s.scores.SS7_clickValidity ?? '-'}
														<br />
														SS8 = {s.scores.SS8_trialConsistency ?? '-'}, SS9 = {s.scores.SS9_maxHitStreak ?? '-'}, SS10 = {s.scores.SS10_coordinationProxy ?? '-'}
														<br />
														SS11 = {s.scores.SS11_targetDiscrimination ?? '-'}, VAfinal = {s.scores.VAfinal ?? '-'}
													</p>

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
