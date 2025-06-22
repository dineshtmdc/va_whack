/** @format */

import React from 'react';

interface FakeMoleProps {
	id: number;
	size: number;
	onClick: (e: React.MouseEvent) => void;
}

export const FakeMole = ({ size, onClick }: FakeMoleProps) => {
	return (
		<span style={{ fontSize: `${size}px` }} className='animate-bounce cursor-pointer' onClick={onClick}>
			🐰
		</span>
	);
};
