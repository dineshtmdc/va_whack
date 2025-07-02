/** @format */

import React from 'react';
import hammerCursor from '../../assets/images/hammer_cursor.png';
interface FakeMoleProps {
	id: number;
	size: number;
	onClick: (e: React.MouseEvent) => void;
}

export const FakeMole = ({ size, onClick }: FakeMoleProps) => {
	return (
		<span style={{ fontSize: `${size}px`, cursor: `url(${hammerCursor}) 24 24, auto` }} className='animate-bounce cursor-pointer' onClick={onClick}>
			🐰
		</span>
	);
};
