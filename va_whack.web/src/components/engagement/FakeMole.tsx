/** @format */

import React, { useMemo } from 'react';
import hammerCursor from '../../assets/images/hammer_cursor.png';

interface FakeMoleProps {
	id: number;
	size: number;
	onClick: (e: React.MouseEvent) => void;
}

const FAKE_MOLE_EMOJIS = ['🐰', '🐸', '🦊', '🐱', '🐶', '🐵'];

export const FakeMole = ({ size, onClick }: FakeMoleProps) => {
	// Pick a random emoji once per render
	const randomSymbol = useMemo(() => {
		const index = Math.floor(Math.random() * FAKE_MOLE_EMOJIS.length);
		return FAKE_MOLE_EMOJIS[index];
	}, []);

	return (
		<span style={{ fontSize: `${size}px`, cursor: `url(${hammerCursor}) 24 24, auto` }} className='animate-bounce cursor-pointer' onClick={onClick}>
			{randomSymbol}
		</span>
	);
};
