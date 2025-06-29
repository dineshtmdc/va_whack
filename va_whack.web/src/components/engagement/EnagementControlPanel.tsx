/** @format */

import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import type { IEnagementGameConfig } from '../../shared';

interface EnagementControlPanelProps {
	config: IEnagementGameConfig;
	onChange: (updates: Partial<IEnagementGameConfig>) => void;
}

export const EnagementControlPanel = ({ config, onChange }: EnagementControlPanelProps) => {
	const [open, setOpen] = useState(false);
	const [isHoveringSettings, setIsHoveringSettings] = useState(false);

	const handleChange = (key: keyof IEnagementGameConfig, value: string | number) => {
		let parsedValue: number | string = typeof value === 'string' && /^\d+$/.test(value) ? parseInt(value) : value;

		if (key === 'mouseSize' && typeof parsedValue === 'number') {
			parsedValue = Math.min(parsedValue, config.holeSize);
		}

		onChange({ [key]: parsedValue });
	};

	return (
		<>
			<div className='absolute top-0 right-0 w-16 h-16 z-40' onMouseEnter={() => setIsHoveringSettings(true)} onMouseLeave={() => setIsHoveringSettings(false)}>
				<div className={`absolute top-4 right-4 transition-opacity duration-300 ${isHoveringSettings ? 'opacity-100' : 'opacity-0'}`}>
					<button onClick={() => setOpen((o) => !o)} className='bg-white p-2 rounded shadow hover:bg-gray-100' aria-label='Toggle Control Panel'>
						{open ? <X className='w-5 h-5' /> : <Settings className='w-5 h-5' />}
					</button>
				</div>
			</div>

			{open && (
				<div className='absolute top-16 right-4 z-50 w-72 max-h-[80vh] overflow-y-auto shadow-xl rounded-xl bg-white p-4 space-y-3'>
					<h3 className='text-lg font-semibold text-center'>Game Settings</h3>

					{/* Mouse Size Slider */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>🐭 Mouse Size ({config.mouseSize}px)</label>
						<input type='range' min={0} max={config.holeSize} step={1} value={config.mouseSize} onChange={(e) => handleChange('mouseSize', e.target.value)} className='w-full mt-1' />
					</div>

					{/* Sliders for holeSize, holeGap, mouseCount, spawnInterval */}
					{[
						{ key: 'holeSize', label: '🕳️ Hole Size', min: 32, max: 128, step: 1 },
						{ key: 'holeGap', label: 'Gap Between Holes', min: 0, max: 32, step: 1 },
						{ key: 'mouseCount', label: 'Mice on Board', min: 1, max: 10, step: 1 },
						{ key: 'spawnInterval', label: 'Spawn Interval (ms)', min: 250, max: 5000, step: 50 },
					].map(({ key, label, min, max, step }) => (
						<div key={key}>
							<label className='block text-sm font-medium text-gray-700'>
								{label} ({config[key as keyof IEnagementGameConfig]})
							</label>
							<input type='range' min={min} max={max} step={step} value={config[key as keyof IEnagementGameConfig] as number} onChange={(e) => handleChange(key as keyof IEnagementGameConfig, e.target.value)} className='w-full mt-1' />
						</div>
					))}

					{/* Hole Color Picker */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Hole Color</label>
						<input type='color' value={config.holeColor} onChange={(e) => handleChange('holeColor', e.target.value)} className='w-full mt-1' />
					</div>

					{/* Background Color Picker */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>Background Color</label>
						<input type='color' value={config.bgColor} onChange={(e) => handleChange('bgColor', e.target.value)} className='w-full mt-1' />
					</div>
				</div>
			)}
		</>
	);
};
