/** @format */

import { useState } from 'react';
import type { IUserDetails, IEnagementGameConfig, IVAMovingGameConfig, IVAScaleGameConfig } from '../shared';
import { EnagementControlPanel, VAMovingControlPanel, EngagementGameBoard, VisualAcuityentMovingGameBoard, VisualAcuityScaleGameBoard, VAScalingControlPanel, GameTile } from '.';
import { Eye, MousePointerClick, ZoomIn } from 'lucide-react';

export const GameSelector = ({ user }: { user: IUserDetails }) => {
	const [mode, setMode] = useState<'Engagement' | 'VA OKN-FAST' | 'VA Scaling' | null>(null);

	const [engementConfig, setEngagementConfig] = useState<IEnagementGameConfig>({
		mouseSize: 32,
		holeSize: 64,
		holeGap: 4,
		mouseCount: 1,
		spawnInterval: 2000,
		holeColor: '#2d2d2d',
		bgColor: '#15803d',
	});

	const [vaConfig, setVAConfig] = useState<IVAMovingGameConfig>({
		moveSpeed: 3,
		moveDirection: 'left-to-right',
		viewingDistanceCm: 100,
		logMar: 1.0,
		ratio: 0.5,
		brightness: 1,
		centralIntensity: 1,
		surroundIntensity: 0.4,
		spacingDeg: 2,
		innerColor: '#ffffff',
		outerColor: '#666666',
		bgColor: '#7f7f7f',
	});

	const [vaScaleConfig, setVaScaleConfig] = useState<IVAScaleGameConfig>({
		holeSize: 30,
		minHoleSize: 1,
		maxHoleSize: 30,
		holeGap: 4,
		ratio: 0.5,
		innerColor: '#ffffff',
		outerColor: '#666666',
		bgColor: '#f0f0f0',
		horizontalPadding: 50,
		verticalPadding: 30,
		viewingDistanceCm: 150,
	});

	if (mode === 'Engagement') {
		return (
			<>
				<EnagementControlPanel config={engementConfig} onChange={(u) => setEngagementConfig((p) => ({ ...p, ...u }))} />
				<EngagementGameBoard config={engementConfig} user={user} />
			</>
		);
	}

	if (mode === 'VA OKN-FAST') {
		return (
			<>
				<VAMovingControlPanel config={vaConfig} onChange={(u) => setVAConfig((p) => ({ ...p, ...u }))} />
				<VisualAcuityentMovingGameBoard config={vaConfig} user={user} onExit={() => setMode(null)} />
			</>
		);
	}

	if (mode === 'VA Scaling') {
		return (
			<>
				<VAScalingControlPanel config={vaScaleConfig} onChange={(u) => setVaScaleConfig((p) => ({ ...p, ...u }))} />
				<VisualAcuityScaleGameBoard config={vaScaleConfig} user={user} onExit={() => setMode(null)} />
			</>
		);
	}

	return (
		<div className='min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-100 to-blue-100 space-y-6'>
			<h1 className='text-4xl font-bold text-gray-900'>Vision Science - Visual Acuity Assessment</h1>
			<h2 className='text-2xl font-semibold text-gray-800'>Welcome {user.name || user.email}</h2>
			<p className='text-lg text-gray-600'>Choose your assessment mode to begin.</p>

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl'>
				<GameTile
					title='Engagement Mode'
					description='Track attention using fast-paced stimuli.'
					icon={<MousePointerClick className='w-8 h-8' />}
					color='bg-green-500 hover:bg-green-600'
					onClick={() => {
						setMode('Engagement');
					}}
				/>

				<GameTile
					title='VA OKN-FAST Mode'
					description='Estimate vision clarity with reflexive targets.'
					icon={<Eye className='w-8 h-8' />}
					color='bg-blue-500 hover:bg-blue-600'
					onClick={() => {
						setMode('VA OKN-FAST');
					}}
				/>

				<GameTile
					title='VA Scale Mode'
					description='Scale center circle to determine visual threshold.'
					icon={<ZoomIn className='w-8 h-8' />}
					color='bg-orange-500 hover:bg-orange-600'
					onClick={() => {
						setMode('VA Scaling');
					}}
				/>
			</div>
		</div>
	);
};
