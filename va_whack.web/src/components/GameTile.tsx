/** @format */

import type { ReactNode } from 'react';

interface GameTileProps {
	title: string;
	description: string;
	icon: ReactNode;
	color: string; // Tailwind color class (e.g. 'bg-green-500')
	onClick: () => void;
}

export const GameTile = ({ title, description, icon, color, onClick }: GameTileProps) => {
	return (
		<button onClick={onClick} className={`aspect-square w-full p-4 rounded-xl shadow-lg text-white flex flex-col items-center justify-center text-center transition hover:scale-105 ${color}`}>
			<div className='text-4xl mb-3'>{icon}</div>
			<div className='text-3xl font-semibold'>{title}</div>
			<div className='text-2xl opacity-90 mt-1'>{description}</div>
		</button>
	);
};
