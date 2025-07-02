/** @format */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login, GameSelector, FullscreenHandler } from '.';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { useAuth } from '../auth/useAuth';
import { EngagementRoute, VAFastRoute, VAScaleRoute, ProfileRoute } from '../routes';
import { Toaster } from 'react-hot-toast';

export const App = () => {
	const { user } = useAuth();

	return (
		<BrowserRouter>
			<FullscreenHandler />

			{/* Global toast handler */}
			<Toaster position='top-left' reverseOrder={false} />

			<Routes>
				{/* Login page */}
				<Route path='/login' element={user ? <Navigate to='/game-selector' replace /> : <Login />} />

				{/* Game selector and nested routes */}
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

				{/* Profile route */}
				<Route
					path='/profile'
					element={
						<ProtectedRoute>
							<ProfileRoute user={user!} />
						</ProtectedRoute>
					}
				/>

				{/* Fallback redirect */}
				<Route path='*' element={<Navigate to={user ? '/game-selector' : '/login'} replace />} />
			</Routes>
		</BrowserRouter>
	);
};
