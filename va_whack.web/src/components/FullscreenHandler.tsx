/** @format */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from 'react';
import { useAuth } from '../auth/useAuth';

export const FullscreenHandler = () => {
	const { user } = useAuth();

	useEffect(() => {
		if (user) {
			const el = document.documentElement;
			// Try various vendor-prefixed fullscreen methods
			const enterFullscreen = async () => {
				try {
					if (el.requestFullscreen) {
						await el.requestFullscreen();
					} else if ((el as any).webkitRequestFullscreen) {
						await (el as any).webkitRequestFullscreen();
					} else if ((el as any).msRequestFullscreen) {
						await (el as any).msRequestFullscreen();
					}
				} catch (err) {
					console.error('Failed to enter fullscreen:', err);
				}
			};
			enterFullscreen();
		}
	}, [user]);

	return null;
};
