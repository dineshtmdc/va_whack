/** @format */

import { Dialog, DialogTitle } from '@headlessui/react';
import { useState } from 'react';
import { useVAScaleGameSessionStore } from '../../shared';

interface IProps {
	isOpen: boolean;
	onClose: () => void;
}

export const VAScaleGameStatistics = ({ isOpen, onClose }: IProps) => {
	const { sessionHistory } = useVAScaleGameSessionStore();
	const [selectedTab, setSelectedTab] = useState(0);
	const sessions = sessionHistory;
	const current = sessions[selectedTab];

	return (
		<Dialog open={isOpen} onClose={onClose} className='relative z-50'>
			{/* Background overlay */}
			<div className='fixed inset-0 bg-black/50' aria-hidden='true' />

			{/* Dialog content */}
			<div className='fixed inset-0 flex flex-col bg-white p-6 overflow-hidden'>
				<DialogTitle className='text-xl font-bold text-gray-800 mb-4'>Scale Game Sessions</DialogTitle>

				{/* Tabs */}
				<div className='flex gap-2 mb-4 overflow-x-auto'>
					{sessions.map((session, index) => (
						<button key={session.gameId} onClick={() => setSelectedTab(index)} className={`px-4 py-1 rounded ${selectedTab === index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
							Game {index + 1}
						</button>
					))}
				</div>

				{/* Stats Summary */}
				{current && (
					<div className='mb-2 text-sm px-1'>
						<p>
							<strong>Best VA:</strong> {current.score.bestVA.toFixed(2)} | <strong>Final VA:</strong> {current.score.finalVA.toFixed(2)} | <strong>Entries:</strong> {current.score.n} | <strong>“I can see”:</strong> {current.score.b}
						</p>
					</div>
				)}

				{/* Table container */}
				<div className='flex-1 overflow-auto border rounded'>
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
							{current?.logEntries.map((entry, idx) => (
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
