/** @format */

import React from 'react';

interface MoleProps {
	id: number;
	size: number;
	onClick: (e: React.MouseEvent) => void;
}

export const Mole = ({ size, onClick }: MoleProps) => {
	return (
		<span style={{ fontSize: `${size}px` }} className='animate-bounce cursor-pointer' onClick={onClick}>
			🐭
		</span>
	);
};
