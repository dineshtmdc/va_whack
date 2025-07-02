/** @format */

import React from 'react';
import hammerCursor from '../../assets/images/hammer_cursor.png';
interface MoleProps {
	id: number;
	size: number;
	onClick: (e: React.MouseEvent) => void;
}

export const Mole = ({ size, onClick }: MoleProps) => {
	return (
		<span style={{ fontSize: `${size}px`, cursor: `url(${hammerCursor}) 24 24, auto` }} className='animate-bounce cursor-pointer' onClick={onClick}>
			🐭
		</span>
	);
};
