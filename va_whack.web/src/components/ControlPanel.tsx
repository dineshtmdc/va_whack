/** @format */

import { useState } from 'react';
import { Settings, X } from 'lucide-react';

interface ControlPanelProps {
	config: {
		mouseSize: number;
		holeSize: number;
		holeGap: number;
		mouseCount: number;
		spawnInterval: number;
		holeColor: string;
		bgColor: string;
	};
	onChange: (updates: Partial<ControlPanelProps['config']>) => void;
}

export const ControlPanel = ({ config, onChange }: ControlPanelProps) => {
	const [open, setOpen] = useState(false);

	const handleChange = (key: keyof ControlPanelProps['config'], value: string | number) => {
		let parsedValue: number | string = typeof value === 'string' && /^\d+$/.test(value) ? parseInt(value) : value;

		// Enforce mouseSize ≤ holeSize
		if (key === 'mouseSize' && typeof parsedValue === 'number') {
			parsedValue = Math.min(parsedValue, config.holeSize);
		}

		onChange({ [key]: parsedValue });
	};

	return (
		<div className='absolute top-0 left-1/2 -translate-x-1/2 z-50'>
			<button onClick={() => setOpen((o) => !o)} className='bg-white p-2 rounded shadow hover:bg-gray-100' aria-label='Toggle Control Panel'>
				{open ? <X className='w-5 h-5' /> : <Settings className='w-5 h-5' />}
			</button>

			{open && (
				<div className='mt-2 bg-white rounded-lg shadow-lg p-4 w-64 space-y-3'>
					<h3 className='text-lg font-semibold text-center'>Game Settings</h3>

					<div>
						<label className='block text-sm font-medium text-gray-700'>🐭 Mouse Size (px)</label>
						<input type='number' min={0} max={config.holeSize} value={config.mouseSize} onChange={(e) => handleChange('mouseSize', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm' />
						<p className='text-xs text-gray-500 mt-1'>Max: {config.holeSize}px</p>
					</div>

					{[
						{ label: '🕳️ Hole Size (px)', key: 'holeSize' },
						{ label: 'Gap Between Holes (px)', key: 'holeGap' },
						{ label: 'Mice on Board', key: 'mouseCount' },
						{ label: 'Spawn Interval (ms)', key: 'spawnInterval' },
					].map(({ label, key }) => (
						<div key={key}>
							<label className='block text-sm font-medium text-gray-700'>{label}</label>
							<input type='number' min={0} value={config[key as keyof typeof config]} onChange={(e) => handleChange(key as any, e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm' />
						</div>
					))}

					<div>
						<label className='block text-sm font-medium text-gray-700'>Hole Color</label>
						<input type='color' value={config.holeColor} onChange={(e) => handleChange('holeColor', e.target.value)} className='w-full mt-1' />
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700'>Background Color</label>
						<input type='color' value={config.bgColor} onChange={(e) => handleChange('bgColor', e.target.value)} className='w-full mt-1' />
					</div>
				</div>
			)}
		</div>
	);
};
