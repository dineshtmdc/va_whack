/** @format */
import React, { useState } from 'react';
import hammerCursor from '../../assets/images/hammer_cursor.png';

interface MoleProps {
	id: number;
	size: number;
	onClick: (e: React.MouseEvent) => void;
}

export const Mole = ({ size, onClick }: MoleProps) => {
	const [spinning, setSpinning] = useState(false);

	const handleClick = (e: React.MouseEvent) => {
		setSpinning(true);
		setTimeout(() => setSpinning(false), 300); // let spin animation finish
		onClick(e);
	};

	return (
		<span style={{ fontSize: `${size}px`, cursor: `url(${hammerCursor}) 24 24, auto` }} className={`cursor-pointer inline-block transition-transform ${spinning ? 'animate-spin' : 'animate-bounce'}`} onClick={handleClick}>
			🐭
		</span>
	);
};
