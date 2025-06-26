/** @format */

import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { IAuthContext, IUserDetails } from '../shared';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<IUserDetails | null>(() => {
		try {
			const saved = localStorage.getItem('user');
			return saved ? (JSON.parse(saved) as IUserDetails) : null;
		} catch {
			return null;
		}
	});

	const [token, setToken] = useState<string | null>(() => {
		try {
			return localStorage.getItem('token') || null;
		} catch {
			return null;
		}
	});

	const login = (user: IUserDetails, token: string) => {
		localStorage.setItem('user', JSON.stringify(user));
		localStorage.setItem('token', token);
		setUser(user);
		setToken(token);
	};

	const logout = () => {
		localStorage.removeItem('user');
		localStorage.removeItem('token');
		setUser(null);
		setToken(null);
	};

	const value: IAuthContext = {
		user,
		token,
		login,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
