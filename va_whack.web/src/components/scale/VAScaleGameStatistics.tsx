/** @format */

import { Dialog, DialogTitle } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useVAScaleGameSessionStore } from '../../shared';

interface IProps {
	isOpen: boolean;
	onClose: () => void;
}

export const VAScaleGameStatistics = ({ isOpen, onClose }: IProps) => {
	const { sessionHistory } = useVAScaleGameSessionStore();
	const sessions = sessionHistory ?? [];

	const [selectedTab, setSelectedTab] = useState(0);

	// Keep selectedTab within bounds if sessions are updated
	useEffect(() => {
		if (selectedTab >= sessions.length) {
			setSelectedTab(Math.max(0, sessions.length - 1));
		}
	}, [sessions.length, selectedTab]);

	const current = sessions.length > 0 && selectedTab >= 0 && selectedTab < sessions.length ? sessions[selectedTab] : null;
	const logEntries = current?.logEntries ?? [];

	return (
		<Dialog open={isOpen} onClose={onClose} className='relative z-50'>
			{/* Background overlay */}
			<div className='fixed inset-0 bg-black/50' aria-hidden='true' />

			{/* Dialog content */}
			<div className='fixed inset-0 flex flex-col bg-white p-6 overflow-hidden min-h-screen'>
				<DialogTitle className='text-xl font-bold text-gray-800 mb-4'>Scale Game Sessions</DialogTitle>

				{sessions.length === 0 ? (
					<p className='text-gray-500'>No session history available.</p>
				) : (
					<>
						{/* Tabs */}
						<div className='flex gap-2 mb-4 overflow-x-auto'>
							{sessions.map((session, index) => (
								<button key={session.gameId} onClick={() => setSelectedTab(index)} className={`px-4 py-1 rounded ${selectedTab === index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
									Game {index + 1}
								</button>
							))}
						</div>

						{/* Stats Summary */}
						{current?.score && (
							<div className='mb-2 text-sm px-1'>
								<p>
									<strong>Best VA:</strong> {current.score.bestVA != null ? current.score.bestVA.toFixed(2) : 'N/A'} | <strong>Final VA:</strong> {current.score.finalVA != null ? current.score.finalVA.toFixed(2) : 'N/A'} | <strong>Entries:</strong> {current.score.n} | <strong>“I can see”:</strong> {current.score.b}
								</p>
							</div>
						)}

						{/* Table container */}
						{logEntries.length > 0 ? (
							<div className='overflow-auto border rounded max-h-[60vh]'>
								<table className='min-w-full text-sm border-separate border-spacing-0 text-center'>
									<thead className='sticky top-0 bg-gray-100 text-gray-700 shadow-sm'>
										<tr>
											<th className='border px-3 py-2'>#</th>
											<th className='border px-3 py-2'>logMAR</th>
											<th className='border px-3 py-2'>Visible</th>
											<th className='border px-3 py-2'>Outer (mm)</th>
											<th className='border px-3 py-2'>Inner (mm)</th>
											<th className='border px-3 py-2'>Ratio</th>
											<th className='border px-3 py-2'>Method</th>
										</tr>
									</thead>
									<tbody>
										{logEntries.map((entry, idx) => (
											<tr key={entry.timestamp} className='hover:bg-gray-50'>
												<td className='border px-3 py-1'>{idx + 1}</td>
												<td className='border px-3 py-1'>{entry.logmar.toFixed(2)}</td>
												<td className='border px-3 py-1'>{entry.userResponse === 'I can see' ? 'Yes' : 'No'}</td>
												<td className='border px-3 py-1'>{entry.outerDiameter.toFixed(1)}</td>
												<td className='border px-3 py-1'>{entry.innerDiameter.toFixed(1)}</td>
												<td className='border px-3 py-1'>{entry.ratio.toFixed(2)}</td>
												<td className='border px-3 py-1'>{entry.scaleMethod}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<p className='text-gray-500 p-4'>No log entries for this session.</p>
						)}
					</>
				)}

				{/* Footer */}
				<div className='mt-4 text-right'>
					<button onClick={onClose} className='px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800'>
						Close
					</button>
				</div>
			</div>
		</Dialog>
	);
};
