/** @format */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login, GameSelector, FullscreenHandler } from '.';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { useAuth } from '../auth/useAuth';
import { EngagementRoute, VAFastRoute, VAScaleRoute, ProfileRoute } from '../routes';
import { Toaster } from 'react-hot-toast';
import { DataConsentModal } from './DataConsentModal';

export const App = () => {
	const { user } = useAuth();

	return (
		<BrowserRouter>
			<FullscreenHandler />
			<Toaster position='top-left' reverseOrder={false} />

			{/* Show modal only if consent not given */}
			<DataConsentModal />

			<Routes>
				<Route path='/login' element={user ? <Navigate to='/game-selector' replace /> : <Login />} />
				<Route
					path='/game-selector/*'
					element={
						<ProtectedRoute>
							<GameSelector user={user!} />
						</ProtectedRoute>
					}>
					<Route path='engagement' element={<EngagementRoute user={user!} />} />
					<Route path='va-fast' element={<VAFastRoute user={user!} />} />
					<Route path='va-scale' element={<VAScaleRoute user={user!} />} />
				</Route>
				<Route
					path='/profile'
					element={
						<ProtectedRoute>
							<ProfileRoute user={user!} />
						</ProtectedRoute>
					}
				/>
				<Route path='*' element={<Navigate to={user ? '/game-selector' : '/login'} replace />} />
			</Routes>
		</BrowserRouter>
	);
};
