/** @format */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IUserDetails, IVAScaleGameConfig } from '../shared';
import { VAScalingControlPanel, VisualAcuityScaleGameBoard } from '../components';

export const VAScaleRoute = ({ user }: { user: IUserDetails }) => {
	const navigate = useNavigate();

	const [config, setConfig] = useState<IVAScaleGameConfig>({
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

	return (
		<>
			<VAScalingControlPanel config={config} onChange={(u) => setConfig((p) => ({ ...p, ...u }))} />
			<VisualAcuityScaleGameBoard config={config} user={user} onExit={() => navigate('/game-selector')} />
		</>
	);
};
