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

	const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});

	const handleDownloadReport = (masterId: string) => {
		const group = groupedByMasterSession[masterId];
		console.log('Download report for:', masterId, group);
	};

	const handleEmailReport = (masterId: string) => {
		const group = groupedByMasterSession[masterId];
		console.log('Email report for:', masterId, group);
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
							<div className='flex justify-between items-center mb-4'>
								<h2 className='text-xl font-bold text-indigo-700'>
									{t.profileSession} #{idx + 1}
								</h2>
								<div className='space-x-2'>
									{isExpanded && (
										<>
											<button className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded' onClick={() => handleDownloadReport(masterId)}>
												{t.profileDownload}
											</button>
											<button className='bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded' onClick={() => handleEmailReport(masterId)}>
												{t.profileEmail}
											</button>
										</>
									)}
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

											<table className='w-full text-sm mt-4 border'>
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
										</div>
									)}

									{group.engagement.length > 0 && (
										<div>
											<h3 className='text-lg font-semibold text-green-600 flex items-center gap-2'>
												<Timer className='w-5 h-5' /> {t.profileEngagementTitle}
											</h3>
											{/* Engagement rendering remains the same (continue localizing if needed) */}
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
