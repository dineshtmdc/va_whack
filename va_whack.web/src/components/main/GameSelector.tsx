/** @format */

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUIStore } from '../../shared/zustand/ui_store';

import { labels, type IUserDetails } from '../../shared';

import { GameTile } from './GameTile';
import { Eye, MousePointerClick, ZoomIn, User, Globe, LogOut } from 'lucide-react';
import { useGameMasterSessionStore } from '../../shared/zustand/game_master_store';
import { useAuth } from '../../auth/useAuth';

interface IProps {
	user: IUserDetails;
}

export const GameSelector = ({ user }: IProps) => {
	const location = useLocation();
	const navigate = useNavigate();
	const lang = useUIStore((s) => s.lang);
	const toggleLang = useUIStore((s) => s.toggleLang);
	const t = labels[lang];

	const { engagementCompleted, vaScaleCompleted, sessionId } = useGameMasterSessionStore((s) => s.currentSession);
	const { logout } = useAuth();

	if (location.pathname !== '/game-selector') {
		return <Outlet />;
	}

	return (
		<div className='relative min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-100 to-blue-100 space-y-4'>
			{/* Top buttons */}
			<button onClick={toggleLang} className='absolute top-4 left-4 p-2 bg-white rounded shadow hover:bg-gray-100 flex items-center gap-2'>
				<Globe className='w-4 h-4' />
				{t.langToggle}
			</button>

			<button onClick={() => navigate('/profile')} className='absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:bg-gray-100' aria-label={t.profileAria}>
				<User className='w-6 h-6 text-gray-700' />
			</button>

			<button onClick={logout} className='absolute top-4 right-20 p-2 bg-white rounded-full shadow hover:bg-gray-100' aria-label={t.logoutAria || 'Logout'}>
				<LogOut className='w-6 h-6 text-red-600' />
			</button>

			{/* Push content down on mobile */}
			<div className='mt-20 sm:mt-0 flex flex-col items-center space-y-4 text-center'>
				<h1 className='text-4xl font-bold text-gray-900'>{t.centerTitle}</h1>
				<h2 className='text-2xl font-semibold text-gray-800'>
					{t.welcome} {user.name || user.email}
				</h2>
				<h2 className='text-xl text-gray-500'>
					{t.sessionId}: {sessionId}
				</h2>
				<h2 className='text-xl text-gray-600'>{t.chooseMode}</h2>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl'>
				<GameTile titleKey='engagementTitle' descriptionKey='engagementDescription' icon={<MousePointerClick className='w-8 h-8' />} color={engagementCompleted ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} to={engagementCompleted ? undefined : 'engagement'} disabled={engagementCompleted} instruction={t.gameInstructions.engagement} />

				<GameTile titleKey='scaleTitle' descriptionKey='scaleDescription' icon={<ZoomIn className='w-8 h-8' />} color={vaScaleCompleted ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'} to={vaScaleCompleted ? undefined : 'va-scale'} disabled={vaScaleCompleted} instruction={t.gameInstructions.scale} />

				<GameTile titleKey='fastTitle' descriptionKey='fastDescription' icon={<Eye className='w-8 h-8' />} color='bg-blue-500 hover:bg-blue-600' to='va-fast' instruction={t.gameInstructions.fast} />
			</div>
		</div>
	);
};
