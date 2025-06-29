/** @format */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IUserDetails, IEnagementGameConfig } from '../shared';
import { EnagementControlPanel, EngagementGameBoard } from '../components';

export const EngagementRoute = ({ user }: { user: IUserDetails }) => {
	const navigate = useNavigate();

	const [config, setConfig] = useState<IEnagementGameConfig>({
		mouseSize: 32,
		holeSize: 64,
		holeGap: 4,
		mouseCount: 1,
		spawnInterval: 1500,
		holeColor: '#666666',
		bgColor: '#f0f0f0',
	});

	return (
		<>
			<EnagementControlPanel config={config} onChange={(u) => setConfig((p) => ({ ...p, ...u }))} />
			<EngagementGameBoard config={config} user={user} onExit={() => navigate('/game-selector')} />
		</>
	);
};
