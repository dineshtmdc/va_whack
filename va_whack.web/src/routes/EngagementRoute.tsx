/** @format */

import { useNavigate } from 'react-router-dom';
import type { IUserDetails } from '../shared';
import { EngagementGameBoard } from '../components';

export const EngagementRoute = ({ user }: { user: IUserDetails }) => {
	const navigate = useNavigate();

	return (
		<>
			<EngagementGameBoard user={user} onExit={() => navigate('/game-selector')} />
		</>
	);
};
