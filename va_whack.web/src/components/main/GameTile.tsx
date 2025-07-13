/** @format */

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUIStore } from '../../shared/zustand/ui_store';
import { labels } from '../../shared';
import { BookOpen, Book } from 'lucide-react';
import clsx from 'clsx';

type TranslationStringKeys = {
	[K in keyof (typeof labels)['en']]: (typeof labels)['en'][K] extends string ? K : never;
}[keyof (typeof labels)['en']];

interface GameTileProps {
	titleKey: TranslationStringKeys;
	descriptionKey: TranslationStringKeys;
	icon: ReactNode;
	color: string;
	to?: string;
	disabled?: boolean;
	instruction?: string;
}

export const GameTile = ({ titleKey, descriptionKey, icon, color, to, disabled = false, instruction }: GameTileProps) => {
	const lang = useUIStore((s) => s.lang);
	const t = labels[lang];
	const [showInstructions, setShowInstructions] = useState(false);

	const baseClasses = 'aspect-square w-full p-4 rounded-xl shadow-lg relative text-center transition-transform';
	const activeClasses = `${color} text-white hover:scale-105`;
	const disabledClasses = 'bg-gray-300 text-gray-500 opacity-60 cursor-not-allowed';

	const frontSide = (
		<div className='absolute inset-0 flex flex-col items-center justify-between p-4 backface-hidden'>
			<div className='text-4xl mb-3'>{icon}</div>
			<div className='text-3xl font-semibold'>{t[titleKey]}</div>
			<div className='text-2xl opacity-90 mt-1'>{t[descriptionKey]}</div>
			<button
				className='absolute top-3 right-3 text-white hover:scale-110 transition-transform group'
				onClick={(e) => {
					e.preventDefault();
					setShowInstructions(true);
				}}
				aria-label='Show instructions'>
				<Book className='w-6 h-6' />
				<span className='absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none'>Instructions</span>
			</button>
		</div>
	);

	const backSide = (
		<div className='absolute inset-0 bg-white text-black p-4 rounded-xl transform rotate-y-180 backface-hidden z-10'>
			<h3 className='font-semibold mb-2 text-lg'>Instructions</h3>
			<ul className='text-sm text-left list-disc pl-5 space-y-1 max-h-52 overflow-y-auto pr-2'>
				{instruction?.split('\n').map((line, idx) => (
					<li key={idx}>{line.trim()}</li>
				))}
			</ul>
			<button
				className='absolute top-3 right-3 text-black hover:scale-110 transition-transform group'
				onClick={(e) => {
					e.preventDefault();
					setShowInstructions(false);
				}}
				aria-label='Hide instructions'>
				<BookOpen className='w-6 h-6' />
				<span className='absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none'>Hide</span>
			</button>
		</div>
	);

	const content = (
		<div
			className={clsx('relative w-full h-full preserve-3d transition-transform duration-700 ease-in-out', { 'rotate-y-180': showInstructions })}
			style={{
				transformStyle: 'preserve-3d',
				perspective: '1000px',
			}}>
			{frontSide}
			{backSide}
		</div>
	);

	const wrapperClass = `${baseClasses} ${disabled || !to ? disabledClasses : activeClasses}`;

	if (disabled || !to) {
		return <div className={wrapperClass}>{content}</div>;
	}

	return (
		<Link to={to} className={wrapperClass}>
			{content}
		</Link>
	);
};
