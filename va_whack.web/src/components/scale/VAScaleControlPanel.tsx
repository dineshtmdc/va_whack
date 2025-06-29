/** @format */

import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import type { IVAScaleGameConfig } from '../../shared';

interface IProps {
	config: IVAScaleGameConfig;
	onChange: (updates: Partial<IVAScaleGameConfig>) => void;
}

export const VAScaleControlPanel = ({ config, onChange }: IProps) => {
	const [open, setOpen] = useState(false);
	const [isHoveringIcon, setIsHoveringIcon] = useState(false);

	const computeSizeFromLogMAR = (logmar: number, viewingDistanceCm: number): number => {
		const distanceMm = viewingDistanceCm * 10;
		const angleDeg = (5 * Math.pow(10, logmar)) / 60;
		const angleRad = (angleDeg * Math.PI) / 180;
		return 2 * distanceMm * Math.tan(angleRad / 2);
	};

	const handleChange = (key: keyof IVAScaleGameConfig, value: string | number | boolean) => {
		const parsed = typeof value === 'string' && /^\d+(\.\d+)?$/.test(value) ? parseFloat(value) : value;

		onChange({ [key]: parsed });

		// Auto-adjust padding and hole sizes when distance changes
		if (key === 'viewingDistanceCm') {
			const newDistance = typeof parsed === 'number' ? parsed : parseFloat(parsed as string);
			const autoMaxSize = computeSizeFromLogMAR(1.0, newDistance); // logMAR +1.0

			// Calculate padding proportionally: base = 20% at 150 cm
			const basePadding = 20;
			const computedPadding = Math.max(5, Math.min(25, Math.round(basePadding * (150 / newDistance))));

			onChange({
				maxHoleSize: autoMaxSize,
				minHoleSize: autoMaxSize / 3,
				verticalPadding: computedPadding,
				horizontalPadding: computedPadding,
			});
		}
	};

	return (
		<>
			{/* Gear Icon */}
			<div className='absolute top-0 right-0 w-16 h-16 z-40' onMouseEnter={() => setIsHoveringIcon(true)} onMouseLeave={() => setIsHoveringIcon(false)}>
				<div className={`absolute top-4 right-4 transition-opacity duration-300 ${isHoveringIcon ? 'opacity-100' : 'opacity-0'}`}>
					<button onClick={() => setOpen((o) => !o)} className='bg-white p-2 rounded-full shadow hover:bg-gray-100' aria-label='Toggle Control Panel'>
						{open ? <X className='w-5 h-5' /> : <Settings className='w-5 h-5' />}
					</button>
				</div>
			</div>

			{/* Control Panel */}
			{open && (
				<div className='absolute top-16 right-4 z-50 w-72 max-h-[80vh] overflow-y-auto shadow-xl rounded-xl bg-white p-4 space-y-3'>
					<h3 className='text-lg font-semibold text-center'>Scale Game Settings</h3>

					{/* Viewing Distance */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Viewing Distance (cm)</label>
						<select value={config.viewingDistanceCm} onChange={(e) => handleChange('viewingDistanceCm', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm'>
							{[50, 100, 150, 200, 250, 300, 350].map((val) => (
								<option key={val} value={val}>
									{val} cm
								</option>
							))}
						</select>
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

					{/* Outer Circle Color */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Outer Circle Color</label>
						<input type='color' value={config.outerColor} onChange={(e) => handleChange('outerColor', e.target.value)} className='w-full mt-1' />
					</div>

					{/* Inner Circle Color */}
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
