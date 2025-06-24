/** @format */

import { useEffect, useState } from 'react';
import type { IUserDetails } from '../shared';
import { Login, GameSelector } from '.';

export const App = () => {
	const [player, setPlayer] = useState<IUserDetails | null>(null);

	useEffect(() => {
		if (player) {
			const enterFullscreen = async () => {
				try {
					const el = document.documentElement;
					if (el.requestFullscreen) {
						await el.requestFullscreen();
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
					} else if ((el as any).webkitRequestFullscreen) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						await (el as any).webkitRequestFullscreen();
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
					} else if ((el as any).msRequestFullscreen) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						await (el as any).msRequestFullscreen();
					}
				} catch (err) {
					console.error('Failed to enter fullscreen:', err);
				}
			};

			enterFullscreen();
		}
	}, [player]);

	if (!player) {
		return <Login onLoginSuccess={(user) => setPlayer(user)} />;
	}

	return <GameSelector user={player} />;
};
