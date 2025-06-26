/** @format */

import { useContext } from 'react';

import type { IAuthContext } from '../shared';
import { AuthContext } from './AuthContext';

export const useAuth = (): IAuthContext => {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuth must be used within AuthProvider');
	return context;
};
