/** @format */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useUIStore } from '../../shared/zustand/ui_store';
import { labels } from '../../shared';

interface GameTileProps {
	titleKey: keyof typeof labels.en;
	descriptionKey: keyof typeof labels.en;
	icon: ReactNode;
	color: string;
	to?: string;
	disabled?: boolean;
}

export const GameTile = ({ titleKey, descriptionKey, icon, color, to, disabled = false }: GameTileProps) => {
	const lang = useUIStore((s) => s.lang);
	const t = labels[lang];

	const baseClasses = 'aspect-square w-full p-4 rounded-xl shadow-lg flex flex-col items-center justify-center text-center transition';
	const activeClasses = `${color} text-white hover:scale-105`;
	const disabledClasses = 'bg-gray-300 text-gray-500 opacity-60 cursor-not-allowed';

	const content = (
		<>
			<div className='text-4xl mb-3'>{icon}</div>
			<div className='text-3xl font-semibold'>{t[titleKey]}</div>
			<div className='text-2xl opacity-90 mt-1'>{t[descriptionKey]}</div>
		</>
	);

	if (disabled || !to) {
		return <div className={`${baseClasses} ${disabledClasses}`}>{content}</div>;
	}

	return (
		<Link to={to} className={`${baseClasses} ${activeClasses}`}>
			{content}
		</Link>
	);
};
