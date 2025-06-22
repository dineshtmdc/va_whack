/** @format */

import { useState } from 'react';
import type { IUserDetails } from '../shared';
import { Login, GameSelector } from '.';

export const App = () => {
	const [player, setPlayer] = useState<IUserDetails | null>(null);

	if (!player) {
		return <Login onLoginSuccess={(user) => setPlayer(user)} />;
	}

	return <GameSelector user={player} />;
};
