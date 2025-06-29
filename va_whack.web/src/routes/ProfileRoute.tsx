/** @format */

import { Profile } from '../components';
import { useNavigate } from 'react-router-dom';
import type { IUserDetails } from '../shared';

export const ProfileRoute = ({ user }: { user: IUserDetails }) => {
	const navigate = useNavigate();

	return (
		<>
			<Profile user={user} onExit={() => navigate('/game-selector')} />
		</>
	);
};
