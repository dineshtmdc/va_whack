/** @format */

import { useState } from 'react';
import type { IScaleLogEntry } from '../shared';
import { Maximize2 } from 'lucide-react';

interface Props {
	logEntries: IScaleLogEntry[];
}

export const VAScaleLogPanel = ({ logEntries }: Props) => {
	const [fullscreen, setFullscreen] = useState(false);

	return (
		<div className={`fixed top-0 left-0 h-full ${fullscreen ? 'w-full' : 'w-96'} bg-white shadow-lg z-40 overflow-y-auto border-r border-gray-200 mt-14`}>
			{/* Header */}
			<div className='relative flex items-center justify-between px-4 py-3 border-b bg-gray-50'>
				<h3 className='text-lg font-semibold text-center w-full'>Scale Log</h3>
				<div className='absolute right-4'>
					<button className='text-gray-600 hover:text-black' onClick={() => setFullscreen((f) => !f)} title='Toggle Fullscreen'>
						<Maximize2 className='w-5 h-5' />
					</button>
				</div>
			</div>

			{/* Content */}
			<div className='p-1 mt-1 max-h-[calc(100vh-6rem)] overflow-y-auto'>
				{!logEntries || logEntries.length === 0 ? (
					<div className='text-center text-sm text-gray-500 py-10 border rounded'>No log entries available.</div>
				) : (
					<div className='overflow-x-auto rounded-lg border border-gray-300'>
						<table className='min-w-full text-xs text-center text-gray-700'>
							<thead className='bg-gray-100 border-b text-gray-600 uppercase tracking-wider'>
								<tr>
									<th className='px-3 py-2'>#</th>
									<th className='px-3 py-2'>Outer (mm)</th>
									<th className='px-3 py-2'>Inner (mm)</th>
									<th className='px-3 py-2'>Ratio</th>
									<th className='px-3 py-2'>Circle Size</th>
									<th className='px-3 py-2'>Extiamted VA (logMAR)</th>
									<th className='px-3 py-2'>Visible</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{logEntries.map((entry, idx) => (
									<tr key={entry.timestamp} className='hover:bg-gray-50'>
										<td className='px-3 py-2'>{idx + 1}</td>
										<td className='px-3 py-2'>{entry.outerDiameter.toFixed(1)}</td>
										<td className='px-3 py-2'>{entry.innerDiameter.toFixed(1)}</td>
										<td className='px-3 py-2'>{entry.ratio.toFixed(2)}</td>
										<td className='px-3 py-2'>{entry.scaleMethod}</td>
										<td className='px-3 py-2'>{entry.logmar.toFixed(2)}</td>
										<td className='px-3 py-2'>{entry.userResponse === 'I can see' ? 'Yes' : entry.userResponse === "I can't see" ? 'No' : '-'}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
};
