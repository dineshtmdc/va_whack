/** @format */

import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import type { IVAScaleGameConfig } from '../shared';

interface IProps {
	config: IVAScaleGameConfig;
	onChange: (updates: Partial<IVAScaleGameConfig>) => void;
}

export const VAScalingControlPanel = ({ config, onChange }: IProps) => {
	const [open, setOpen] = useState(false);

	const handleChange = (key: keyof IVAScaleGameConfig, value: string | number | boolean) => {
		const parsed = typeof value === 'string' && /^\d+(\.\d+)?$/.test(value) ? parseFloat(value) : value;
		onChange({ [key]: parsed });
	};

	return (
		<>
			{/* Gear Icon - top right */}

			<div className='absolute top-4 right-4 z-50'>
				<button onClick={() => setOpen((o) => !o)} className='bg-white p-2 rounded-full shadow hover:bg-gray-100' aria-label='Toggle Control Panel'>
					{open ? <X className='w-5 h-5' /> : <Settings className='w-5 h-5' />}
				</button>
			</div>

			{/* Floating panel from right */}
			{open && (
				<div className='absolute top-16 right-4 z-50 w-72 max-h-[80vh] overflow-y-auto shadow-xl rounded-xl bg-white p-4 space-y-3'>
					<h3 className='text-lg font-semibold text-center'>Scale Game Settings</h3>

					{/* Viewing Distance Dropdown */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Viewing Distance (cm)</label>
						<select value={config.viewingDistanceCm} onChange={(e) => handleChange('viewingDistanceCm', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm'>
							<option value={100}>100 cm</option>
							<option value={150}>150 cm</option>
							<option value={200}>200 cm</option>
						</select>
					</div>

					{/* Hole Size */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>🕳️ Default Hole Size (mm)</label>
						<input type='number' min={10} value={config.holeSize} onChange={(e) => handleChange('holeSize', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm' />
					</div>

					{/* Min Size */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>🕳️ Min Size (mm)</label>
						<input type='number' min={5} value={config.minHoleSize} onChange={(e) => handleChange('minHoleSize', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm' />
					</div>

					{/* Max Size */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>🕳️ Max Size (mm)</label>
						<input type='number' max={100} value={config.maxHoleSize} onChange={(e) => handleChange('maxHoleSize', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm' />
					</div>

					{/* Hole Gap */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Gap Between Holes (mm)</label>
						<input type='number' min={0} value={config.holeGap} onChange={(e) => handleChange('holeGap', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm' />
					</div>

					{/* Ratio */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Inner Circle Ratio</label>
						<input type='range' min={0.1} max={0.9} step={0.05} value={config.ratio} onChange={(e) => handleChange('ratio', parseFloat(e.target.value))} className='w-full mt-1' />
						<p className='text-xs text-gray-500 mt-1 text-center'>{Math.round(config.ratio * 100)}% of outer circle</p>
					</div>

					{/* Vertical Padding */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Vertical Padding (%)</label>
						<input type='number' min={0} max={50} value={config.verticalPadding} onChange={(e) => handleChange('verticalPadding', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm' />
					</div>

					{/* Horizontal Padding */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Horizontal Padding (%)</label>
						<input type='number' min={0} max={50} value={config.horizontalPadding} onChange={(e) => handleChange('horizontalPadding', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm' />
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
				</div>
			)}
		</>
	);
};
