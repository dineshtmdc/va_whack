/** @format */

import { Dialog, DialogTitle } from '@headlessui/react';
import { useState } from 'react';
import { useEnagementGameSessionStore } from '../shared'; // Adjust path if needed

interface GameSessionInfoProps {
	isOpen: boolean;
	onClose: () => void;
}

const formatTimeWithMs = (timestamp: number) => {
	const date = new Date(timestamp);
	const time = date.toTimeString().split(' ')[0]; // HH:MM:SS
	const ms = date.getMilliseconds().toString().padStart(3, '0');
	return `${time}.${ms}`; // HH:MM:SS.sss
};

export const GameSessionInfo = ({ isOpen, onClose }: GameSessionInfoProps) => {
	const [selectedTab, setSelectedTab] = useState(0);
	const sessionHistory = useEnagementGameSessionStore((state) => state.sessionHistory);

	return (
		<Dialog open={isOpen} onClose={onClose} className='relative z-50'>
			{/* Fullscreen background */}
			<div className='fixed inset-0 bg-black/50' aria-hidden='true' />

			{/* Fullscreen panel */}
			<div className='fixed inset-0 flex flex-col bg-white p-6 overflow-hidden'>
				<DialogTitle className='text-xl font-bold text-gray-800 mb-4'>Session History</DialogTitle>

				{/* Tabs */}
				<div className='flex gap-2 mb-4 overflow-x-auto'>
					{sessionHistory.map((session, index) => (
						<button key={session.gameId} onClick={() => setSelectedTab(index)} className={`px-4 py-1 rounded ${selectedTab === index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
							Game {index + 1}
						</button>
					))}
				</div>

				{/* Scrollable Table Container */}
				<div className='flex-1 overflow-auto border rounded'>
					<table className='min-w-full text-sm border-separate border-spacing-0'>
						<thead className='sticky top-0 bg-gray-100 text-gray-700 shadow-sm'>
							<tr>
								<th className='border px-3 py-2'>ID</th>
								<th className='border px-3 py-2'>Type</th>
								<th className='border px-3 py-2'>Size (px)</th>
								<th className='border px-3 py-2'>Row</th>
								<th className='border px-3 py-2'>Col</th>
								<th className='border px-3 py-2'>Quadrant</th>
								<th className='border px-3 py-2'>Appear Time</th>
								<th className='border px-3 py-2'>Clicked</th>
								<th className='border px-3 py-2'>Click Time</th>
								<th className='border px-3 py-2'>Click X</th>
								<th className='border px-3 py-2'>Click Y</th>
								<th className='border px-3 py-2'>Hit</th>
								<th className='border px-3 py-2'>Distractor Clicked</th>
							</tr>
						</thead>

						<tbody>
							{sessionHistory[selectedTab]?.events.map((event) => (
								<tr key={event.id}>
									<td className='border px-3 py-1 text-center'>{event.id}</td>
									<td className='border px-3 py-1 text-center'>{event.targetType}</td>
									<td className='border px-3 py-1 text-center'>{event.mouseSize}</td>
									<td className='border px-3 py-1 text-center'>{event.row}</td>
									<td className='border px-3 py-1 text-center'>{event.col}</td>
									<td className='border px-3 py-1 text-center'>{event.quadrant}</td>
									<td className='border px-3 py-1 text-center' title={event.appearTime.toString()}>
										{formatTimeWithMs(event.appearTime)}
									</td>
									<td className='border px-3 py-1 text-center'>{event.clicked ? 'Yes' : 'No'}</td>
									<td className='border px-3 py-1 text-center' title={event.clickTime?.toString() ?? ''}>
										{event.clickTime ? formatTimeWithMs(event.clickTime) : '-'}
									</td>
									<td className='border px-3 py-1 text-center'>{event.clickX ?? '-'}</td>
									<td className='border px-3 py-1 text-center'>{event.clickY ?? '-'}</td>
									<td className='border px-3 py-1 text-center'>{event.wasHit ? 'Yes' : 'No'}</td>
									<td className='border px-3 py-1 text-center'>{event.wasDistractorClicked ? 'Yes' : 'No'}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Footer button */}
				<div className='mt-4 text-right'>
					<button onClick={onClose} className='px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800'>
						Close
					</button>
				</div>
			</div>
		</Dialog>
	);
};
