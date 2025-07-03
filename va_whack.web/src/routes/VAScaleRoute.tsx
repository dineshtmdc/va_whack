/** @format */

import { useNavigate } from 'react-router-dom';
import type { IUserDetails } from '../shared';
import { VAScaleGameBoard } from '../components';

export const VAScaleRoute = ({ user }: { user: IUserDetails }) => {
	const navigate = useNavigate();

	return (
		<>
			<VAScaleGameBoard user={user} onExit={() => navigate('/game-selector')} />
		</>
	);
};
