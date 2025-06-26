/** @format */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IUserDetails, IVAMovingGameConfig } from '../shared';
import { VAMovingControlPanel, VisualAcuityentMovingGameBoard } from '../components';

export const VAFastRoute = ({ user }: { user: IUserDetails }) => {
	const navigate = useNavigate();

	const [config, setConfig] = useState<IVAMovingGameConfig>({
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

	return (
		<>
			<VAMovingControlPanel config={config} onChange={(u) => setConfig((p) => ({ ...p, ...u }))} />
			<VisualAcuityentMovingGameBoard config={config} user={user} onExit={() => navigate('/game-selector')} />
		</>
	);
};
