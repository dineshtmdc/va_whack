/** @format */

// /src/components/hooks/useIsMobile.ts
import { useEffect, useState } from 'react';

export const useIsMobile = (breakpoint = 768) => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= breakpoint);
		};

		handleResize(); // set on mount
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [breakpoint]);

	return isMobile;
};
