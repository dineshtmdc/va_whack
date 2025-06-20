/** @format */

import { useState } from 'react';
import type { IUserDetails } from '../shared';
import { Login } from './Login';
import { Transition } from '@headlessui/react';
import { GameBoard } from './GameBoard';
import { ControlPanel } from '.';

const enterFullScreen = () => {
	const elem = document.documentElement;
	if (elem.requestFullscreen) {
		elem.requestFullscreen().catch((err) => {
			console.warn('Fullscreen failed', err);
		});
	}
};

export const App = () => {
	const [player, setPlayer] = useState<IUserDetails | null>(null);
	const [config, setConfig] = useState({
		mouseSize: 32,
		holeSize: 64,
		holeGap: 4,
		mouseCount: 1,
		spawnInterval: 2000,
		holeColor: '#2d2d2d',
		bgColor: '#15803d',
	});
	return (
		<main className='relative min-h-screen w-full overflow-hidden'>
			{/* STACK BOTH UIs ABSOLUTELY */}
			<Transition show={!player} as='div' className='absolute inset-0 flex items-center justify-center' enter='transition-opacity duration-500' enterFrom='opacity-0' enterTo='opacity-100' leave='transition-opacity duration-0' leaveFrom='opacity-100' leaveTo='opacity-0'>
				<div className=' min-h-screen w-full overflow-hidden bg-[radial-gradient(circle,_#2d2d2d_5%,_transparent_6%)] bg-[length:50px_50px] bg-green-600'>
					<Login
						onStart={(user) => {
							setPlayer(user);
							enterFullScreen(); // ← triggers fullscreen mode
						}}
					/>
				</div>
			</Transition>

			<Transition show={!!player} as='div' className='absolute inset-0 flex items-center justify-center' enter='transition-opacity duration-500' enterFrom='opacity-0' enterTo='opacity-100' leave=''>
				<ControlPanel config={config} onChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))} />

				<GameBoard {...config} />
			</Transition>
		</main>
	);
};
