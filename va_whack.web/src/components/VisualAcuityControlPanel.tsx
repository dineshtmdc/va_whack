/** @format */

import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import type { IVAGameConfig } from '../shared';

interface VisualAcuityControlPanelProps {
	config: IVAGameConfig;
	onChange: (updates: Partial<IVAGameConfig>) => void;
}

export const VisualAcuityControlPanel = ({ config, onChange }: VisualAcuityControlPanelProps) => {
	const [open, setOpen] = useState(false);

	const handleChange = (key: keyof IVAGameConfig, value: string | number) => {
		const parsedValue: number | string = typeof value === 'string' && /^\d+$/.test(value) ? parseInt(value) : value;
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

					{/* Hole Size */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>🕳️ Hole Size (px)</label>
						<input type='number' min={10} value={config.holeSize} onChange={(e) => handleChange('holeSize', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm' />
					</div>

					{/* Hole Gap */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Gap Between Holes (px)</label>
						<input type='number' min={0} value={config.holeGap} onChange={(e) => handleChange('holeGap', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm' />
					</div>

					{/* Outer Color */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Outer Circle Color</label>
						<input type='color' value={config.outerColor} onChange={(e) => handleChange('outerColor', e.target.value)} className='w-full mt-1' />
					</div>

					{/* Inner Color */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Inner Circle Color</label>
						<input type='color' value={config.innerColor} onChange={(e) => handleChange('innerColor', e.target.value)} className='w-full mt-1' />
					</div>

					{/* Background Color */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Background Color</label>
						<input type='color' value={config.bgColor} onChange={(e) => handleChange('bgColor', e.target.value)} className='w-full mt-1' />
					</div>
					{/* Ratio */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Inner Circle Ratio</label>
						<input type='range' min={0.1} max={0.9} step={0.05} value={config.ratio} onChange={(e) => handleChange('ratio', parseFloat(e.target.value))} className='w-full mt-1' />
						<p className='text-xs text-gray-500 mt-1 text-center'>{Math.round(config.ratio * 100)}% of outer circle</p>
					</div>
					{/* Movement Direction */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Movement Direction</label>
						<select value={config.moveDirection || 'left-to-right'} onChange={(e) => handleChange('moveDirection', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm'>
							<option value='left-to-right'>Left to Right</option>
							<option value='right-to-left'>Right to Left</option>
						</select>
					</div>

					{/* Movement Speed */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Movement Speed (px/s)</label>
						<input type='number' min={10} max={500} step={10} value={config.moveSpeed || 100} onChange={(e) => handleChange('moveSpeed', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm' />
					</div>
				</div>
			)}
		</div>
	);
};
