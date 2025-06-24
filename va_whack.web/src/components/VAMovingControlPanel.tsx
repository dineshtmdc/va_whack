/** @format */

import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import type { IVAMovingGameConfig } from '../shared';

interface Props {
	config: IVAMovingGameConfig;
	onChange: (updates: Partial<IVAMovingGameConfig>) => void;
}

export const VAMovingControlPanel = ({ config, onChange }: Props) => {
	const [open, setOpen] = useState(false);

	const handleChange = (key: keyof IVAMovingGameConfig, value: string | number) => {
		const parsed = typeof value === 'string' && /^\d+(\.\d+)?$/.test(value) ? parseFloat(value) : value;
		onChange({ [key]: parsed });
	};

	return (
		<>
			{/* Gear Icon */}
			<div className='absolute top-4 right-4 z-50'>
				<button onClick={() => setOpen((o) => !o)} className='bg-white p-2 rounded shadow hover:bg-gray-100' aria-label='Toggle Control Panel'>
					{open ? <X className='w-5 h-5' /> : <Settings className='w-5 h-5' />}
				</button>
			</div>

			{/* Floating Panel with Scroll */}
			{open && (
				<div className='absolute top-16 right-4 z-50 w-72 max-h-[80vh] overflow-y-auto shadow-xl rounded-xl bg-white p-4 space-y-3'>
					<h3 className='text-lg font-semibold text-center'>Game Settings</h3>

					{/* Movement Speed */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Movement Speed (deg/s)</label>
						<input type='number' min={0} max={15} step={0.1} value={config.moveSpeed ?? 5} onChange={(e) => handleChange('moveSpeed', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm' />
					</div>

					{/* Movement Direction */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Movement Direction</label>
						<select value={config.moveDirection || 'left-to-right'} onChange={(e) => handleChange('moveDirection', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm'>
							<option value='left-to-right'>Left to Right</option>
							<option value='right-to-left'>Right to Left</option>
						</select>
					</div>

					{/* Viewing Distance */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Distance (cm)</label>
						<select value={config.viewingDistanceCm ?? 200} onChange={(e) => handleChange('viewingDistanceCm', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm'>
							<option value={100}>100</option>
							<option value={150}>150</option>
							<option value={200}>200</option>
						</select>
					</div>

					{/* LogMAR */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>LogMAR (0–2)</label>
						<input type='range' min={0} max={2} step={0.01} value={config.logMar} onChange={(e) => handleChange('logMar', e.target.value)} className='w-full' />
						<p className='text-xs text-center text-gray-500'>{config.logMar.toFixed(2)}</p>
					</div>

					{/* Ratio */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Inner:Outer Ratio</label>
						<select value={config.ratio} onChange={(e) => handleChange('ratio', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm'>
							<option value={1 / 1.5}>1 : 1.5</option>
							<option value={1 / 2}>1 : 2</option>
						</select>
					</div>

					{/* Brightness */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Brightness (0–1)</label>
						<input type='range' min={0} max={1} step={0.01} value={config.brightness ?? 1} onChange={(e) => handleChange('brightness', e.target.value)} className='w-full' />
						<p className='text-xs text-center text-gray-500'>{(config.brightness ?? 1).toFixed(2)}</p>
					</div>

					{/* Central Intensity */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Central Intensity (0–1)</label>
						<input type='range' min={0} max={1} step={0.01} value={config.centralIntensity} onChange={(e) => handleChange('centralIntensity', e.target.value)} className='w-full' />
						<p className='text-xs text-center text-gray-500'>{config.centralIntensity.toFixed(2)}</p>
					</div>

					{/* Surround Intensity */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Surround Intensity (0–1)</label>
						<input type='range' min={0} max={1} step={0.01} value={config.surroundIntensity} onChange={(e) => handleChange('surroundIntensity', e.target.value)} className='w-full' />
						<p className='text-xs text-center text-gray-500'>{config.surroundIntensity.toFixed(2)}</p>
					</div>

					{/* Spacing (degrees) */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Spacing (deg)</label>
						<input type='range' min={0} max={10} step={0.1} value={config.spacingDeg ?? 1} onChange={(e) => handleChange('spacingDeg', e.target.value)} className='w-full' />
						<p className='text-xs text-center text-gray-500'>{(config.spacingDeg ?? 1).toFixed(1)}</p>
					</div>

					{/* Outer Color */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Outer Color</label>
						<input type='color' value={config.outerColor} onChange={(e) => handleChange('outerColor', e.target.value)} className='w-full mt-1' />
					</div>

					{/* Inner Color */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Inner Color</label>
						<input type='color' value={config.innerColor} onChange={(e) => handleChange('innerColor', e.target.value)} className='w-full mt-1' />
					</div>

					{/* Background Color */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Background Color</label>
						<input type='color' value={config.bgColor} onChange={(e) => handleChange('bgColor', e.target.value)} className='w-full mt-1' />
					</div>
				</div>
			)}
		</>
	);
};
