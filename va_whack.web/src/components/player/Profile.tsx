/** ==============================================================================
# FILE: va_whack.web\src\components\player\Profile.tsx
# ==============================================================================
 */
/** @format */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVAScaleGameSessionStore, useEnagementGameSessionStore, type IUserDetails, type IScaleGameSession, type IEnagementGameSession } from '../../shared';
import { ArrowLeft, Timer, BarChart3, Home } from 'lucide-react';

interface IProps {
	user: IUserDetails;
	onExit: () => void;
}

export const Profile = ({ user, onExit }: IProps) => {
	const navigate = useNavigate();

	const currentScaleSession = useVAScaleGameSessionStore((s) => s.currentSession);
	const scaleHistory = useVAScaleGameSessionStore((s) => s.sessionHistory);

	const currentEngagementSession = useEnagementGameSessionStore((s) => s.currentSession);
	const engagementHistory = useEnagementGameSessionStore((s) => s.sessionHistory);

	const [scaleSessionsFromDb] = useState<IScaleGameSession[]>([]); //setScaleSessionsFromDb
	const [engagementSessionsFromDb] = useState<IEnagementGameSession[]>([]); //setEngagementSessionsFromDb

	const allScaleSessions: IScaleGameSession[] = [...(currentScaleSession ? [currentScaleSession] : []), ...scaleHistory, ...scaleSessionsFromDb];
	const allEngagementSessions: IEnagementGameSession[] = [...(currentEngagementSession ? [currentEngagementSession] : []), ...engagementHistory, ...engagementSessionsFromDb];

	const [expandedScale, setExpandedScale] = useState<Record<string, boolean>>({});
	const [expandedEngagement, setExpandedEngagement] = useState<Record<string, boolean>>({});

	// TODO
	// Call database and load data
	//useEffect
	// results = GameService.getPlayerGameHistory(user.email)
	//setScaleSessionsFromDb(results.scaleGames)

	return (
		<div className='relative min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6'>
			<button onClick={onExit} className='absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:bg-gray-100' aria-label='Go Home'>
				<Home className='w-6 h-6 text-gray-700' />
			</button>

			<button onClick={() => navigate(-1)} className='mb-6 p-2 bg-white rounded-full shadow hover:bg-gray-100' aria-label='Back'>
				<ArrowLeft className='w-6 h-6 text-gray-700' />
			</button>

			<h1 className='text-3xl font-bold text-center mb-2 text-gray-800'>Game History</h1>
			<p className='text-center text-gray-600 mb-8'>Player: {user.name || user.email}</p>

			<section className='mb-12'>
				<h2 className='text-xl font-semibold text-orange-700 flex items-center gap-2 mb-3'>
					<BarChart3 className='w-5 h-5' /> VA Scale Mode Sessions
				</h2>
				{allScaleSessions.length === 0 ? (
					<p className='text-gray-500 italic'>No sessions available.</p>
				) : (
					allScaleSessions.map((session, i) => {
						const isExpanded = expandedScale[session.gameId] || false;
						return (
							<div key={session.gameId} className='bg-white shadow rounded p-4 mb-4'>
								<button onClick={() => setExpandedScale((prev) => ({ ...prev, [session.gameId]: !prev[session.gameId] }))} className='w-full text-left font-bold text-lg text-gray-800 flex justify-between items-center'>
									<span>Session #{i + 1}</span>
									<span className='text-sm text-blue-600'>{isExpanded ? 'Hide Details ▲' : 'Show Details ▼'}</span>
								</button>

								{isExpanded && (
									<>
										<div className='text-sm text-gray-700 mt-2 mb-2'>
											<p>
												<b>Hole Size:</b> {session.config.holeSize} mm
											</p>
											<p>
												<b>Ratio:</b> {session.config.ratio}
											</p>
											<p>
												<b>Distance:</b> {session.config.viewingDistanceCm} cm
											</p>
										</div>
										<p className='text-sm text-gray-500 mb-2'>
											Start: {new Date(session.startTime).toLocaleString()}
											<br />
											End: {session.endTime ? new Date(session.endTime).toLocaleString() : 'In progress'}
										</p>
										<table className='w-full text-sm border'>
											<thead>
												<tr className='bg-gray-100'>
													<th className='border p-1'>#</th>
													<th className='border p-1'>Outer</th>
													<th className='border p-1'>Inner</th>
													<th className='border p-1'>Ratio</th>
													<th className='border p-1'>logMAR</th>
													<th className='border p-1'>Response</th>
													<th className='border p-1'>Time</th>
												</tr>
											</thead>
											<tbody>
												{session.logEntries.map((entry, j) => (
													<tr key={j}>
														<td className='border p-1'>{j + 1}</td>
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
									</>
								)}
							</div>
						);
					})
				)}
			</section>

			<section>
				<h2 className='text-xl font-semibold text-green-700 flex items-center gap-2 mb-3'>
					<Timer className='w-5 h-5' /> Engagement Mode Sessions
				</h2>
				{allEngagementSessions.length === 0 ? (
					<p className='text-gray-500 italic'>No sessions available.</p>
				) : (
					allEngagementSessions.map((session, i) => {
						const isExpanded = expandedEngagement[session.gameId] || false;
						return (
							<div key={session.gameId} className='bg-white shadow rounded p-4 mb-4'>
								<button onClick={() => setExpandedEngagement((prev) => ({ ...prev, [session.gameId]: !prev[session.gameId] }))} className='w-full text-left font-bold text-lg text-gray-800 flex justify-between items-center'>
									<span>Session #{i + 1}</span>
									<span className='text-sm text-blue-600'>{isExpanded ? 'Hide Details ▲' : 'Show Details ▼'}</span>
								</button>

								{isExpanded && (
									<>
										<div className='text-sm text-gray-700 mt-2 mb-2'>
											<p>
												<b>Mouse Count:</b> {session.config.mouseCount}
											</p>
											<p>
												<b>Hole Size:</b> {session.config.holeSize}px
											</p>
											<p>
												<b>Interval:</b> {session.config.spawnInterval} ms
											</p>
										</div>
										<p className='text-sm text-gray-500 mb-2'>
											Start: {new Date(session.startTime).toLocaleString()}
											<br />
											End: {session.endTime ? new Date(session.endTime).toLocaleString() : 'In progress'}
										</p>
										<table className='w-full text-sm border'>
											<thead>
												<tr className='bg-gray-100'>
													<th className='border p-1'>#</th>
													<th className='border p-1'>Type</th>
													<th className='border p-1'>Row/Col</th>
													<th className='border p-1'>Clicked</th>
													<th className='border p-1'>Hit</th>
													<th className='border p-1'>Time</th>
												</tr>
											</thead>
											<tbody>
												{session.events.map((event, j) => (
													<tr key={j}>
														<td className='border p-1'>{j + 1}</td>
														<td className='border p-1'>{event.targetType}</td>
														<td className='border p-1'>
															{event.row},{event.col}
														</td>
														<td className='border p-1'>{event.clicked ? 'Yes' : 'No'}</td>
														<td className='border p-1'>{event.wasHit ? 'Yes' : 'No'}</td>
														<td className='border p-1'>{new Date(event.appearTime).toLocaleTimeString()}</td>
													</tr>
												))}
											</tbody>
										</table>
									</>
								)}
							</div>
						);
					})
				)}
			</section>
		</div>
	);
};
