/** @format */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface GameTileProps {
	title: string;
	description: string;
	icon: ReactNode;
	color: string; // Tailwind color class
	to: string; // destination path
}

export const GameTile = ({ title, description, icon, color, to }: GameTileProps) => {
	return (
		<Link to={to} className={`aspect-square w-full p-4 rounded-xl shadow-lg text-white flex flex-col items-center justify-center text-center transition hover:scale-105 ${color}`}>
			<div className='text-4xl mb-3'>{icon}</div>
			<div className='text-3xl font-semibold'>{title}</div>
			<div className='text-2xl opacity-90 mt-1'>{description}</div>
		</Link>
	);
};
