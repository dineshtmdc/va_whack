/** @format */

import type { IScaleLogEntry } from '../shared';

interface Props {
	logEntries: IScaleLogEntry[];
}

export const VAScaleLogPanel = ({ logEntries }: Props) => {
	return (
		<div className='fixed top-0 left-0 h-full w-96 bg-white shadow-lg z-40 overflow-y-auto border-r border-gray-200'>
			{/* Header */}
			<div className='relative flex items-center px-4 py-3'>
				<h3 className='absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold'>Scale Log</h3>
			</div>

			{/* Content */}
			<div className='p-4 mt-4'>
				{!logEntries || logEntries.length === 0 ? (
					<div className='text-center text-sm text-gray-500 py-10 border rounded'>No log entries available.</div>
				) : (
					<table className='text-xs w-full border'>
						<thead>
							<tr className='bg-gray-100'>
								<th>#</th>
								<th>Outer</th>
								<th>Inner</th>
								<th>Ratio</th>
								<th>Dir</th>
								<th>logMAR</th>
								<th>Visible</th>
							</tr>
						</thead>
						<tbody>
							{logEntries.map((entry, idx) => (
								<tr key={entry.timestamp} className='text-center border-t'>
									<td>{idx + 1}</td>
									<td>{entry.outerDiameter.toFixed(1)}</td>
									<td>{entry.innerDiameter.toFixed(1)}</td>
									<td>{entry.ratio.toFixed(2)}</td>
									<td>{entry.scaleDirection}</td>
									<td>{entry.logmar.toFixed(2)}</td>
									<td>{entry.userResponse === 'I can see' ? 'Yes' : entry.userResponse === 'I can’t see' ? 'No' : '-'}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};
