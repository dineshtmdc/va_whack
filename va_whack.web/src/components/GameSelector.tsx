/** @format */

import { useState } from 'react';
import type { IUserDetails, IEnagementGameConfig, IVAGameConfig } from '../shared';
import { EnagementControlPanel, VisualAcuityControlPanel, EngagementGameBoard, VisualAcuityentGameBoard, GameTile } from '.';
import { Eye, MousePointerClick } from 'lucide-react'; // Lucide icons

export const GameSelector = ({ user }: { user: IUserDetails }) => {
	const [mode, setMode] = useState<'Engagement' | 'Visual Acuity' | null>(null);

	const [engementConfig, setEngagementConfig] = useState<IEnagementGameConfig>({
		mouseSize: 32,
		holeSize: 64,
		holeGap: 4,
		mouseCount: 1,
		spawnInterval: 2000,
		holeColor: '#2d2d2d',
		bgColor: '#15803d',
	});

	const [vaConfig, setVAConfig] = useState<IVAGameConfig>({
		holeSize: 64,
		holeGap: 4,
		innerColor: '#ffffff',
		outerColor: '#666666',
		bgColor: '#7f7f7f',
		ratio: 0.5,
	});

	if (mode === 'Engagement') {
		return (
			<>
				<EnagementControlPanel config={engementConfig} onChange={(u) => setEngagementConfig((p) => ({ ...p, ...u }))} />
				<EngagementGameBoard config={engementConfig} user={user} />
			</>
		);
	}

	if (mode === 'Visual Acuity') {
		return (
			<>
				<VisualAcuityControlPanel config={vaConfig} onChange={(u) => setVAConfig((p) => ({ ...p, ...u }))} />
				<VisualAcuityentGameBoard config={vaConfig} user={user} onExit={() => setMode(null)} />
			</>
		);
	}

	return (
		<div className='min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-100 to-blue-100 space-y-6'>
			<h1 className='text-2xl font-bold text-gray-800'>Welcome {user.name || user.email}</h1>
			<p className='text-sm text-gray-500'>Choose your game mode to begin:</p>

			<div className='grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl'>
				<GameTile title='Engagement Mode' description='Track attention using fast-paced stimuli.' icon={<MousePointerClick className='w-8 h-8' />} color='bg-green-500 hover:bg-green-600' onClick={() => setMode('Engagement')} />

				<GameTile title='Visual Acuity Mode' description='Estimate vision clarity with reflexive targets.' icon={<Eye className='w-8 h-8' />} color='bg-blue-500 hover:bg-blue-600' onClick={() => setMode('Visual Acuity')} />
			</div>
		</div>
	);
};
