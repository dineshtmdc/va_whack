/** @format */

import { Outlet, useLocation } from 'react-router-dom';
import type { IUserDetails } from '../shared';
import { GameTile } from './GameTile';
import { Eye, MousePointerClick, ZoomIn } from 'lucide-react';

export const GameSelector = ({ user }: { user: IUserDetails }) => {
	const location = useLocation();

	// If the route is a sub-route, render the nested game via <Outlet />
	if (location.pathname !== '/game-selector') {
		return <Outlet />;
	}

	return (
		<div className='min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-100 to-blue-100 space-y-6'>
			<h1 className='text-4xl font-bold text-gray-900'>Vision Science - Visual Acuity Assessment</h1>
			<h2 className='text-2xl font-semibold text-gray-800'>Welcome {user.name || user.email}</h2>
			<p className='text-lg text-gray-600'>Choose your assessment mode to begin.</p>

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl'>
				<GameTile title='Engagement Mode' description='Track attention using fast-paced stimuli.' icon={<MousePointerClick className='w-8 h-8' />} color='bg-green-500 hover:bg-green-600' to='engagement' />
				<GameTile title='VA Scale Mode' description='Scale center circle to determine visual threshold.' icon={<ZoomIn className='w-8 h-8' />} color='bg-orange-500 hover:bg-orange-600' to='va-scale' />
				<GameTile title='VA OKN-FAST Mode' description='Estimate vision clarity with reflexive targets.' icon={<Eye className='w-8 h-8' />} color='bg-blue-500 hover:bg-blue-600' to='va-fast' />
			</div>
		</div>
	);
};
