/** @format */

import type { IVAScaleGameConfig } from '../../shared';

interface IProps {
	config: IVAScaleGameConfig;
	onChange: (updates: Partial<IVAScaleGameConfig>) => void;
}

export const VAScaleControlPanel = ({ config, onChange }: IProps) => {
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
		<div className='absolute top-20 right-4 z-50 w-72 max-h-[80vh] overflow-y-auto shadow-xl rounded-xl bg-white p-4 space-y-3'>
			<h3 className='text-lg font-semibold text-center'>Scale Game Settings</h3>

			{/* Viewing Distance */}
			<div>
				<label className='block text-sm font-medium text-gray-700'>Viewing Distance (cm)</label>
				<select value={config.viewingDistanceCm} onChange={(e) => handleChange('viewingDistanceCm', e.target.value)} className='w-full mt-1 px-2 py-1 border rounded text-sm'>
					{[20, 30, 50, 100, 150, 200, 250, 300, 350].map((val) => (
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
	);
};
