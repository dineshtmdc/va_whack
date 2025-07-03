/** @format */

import { useEffect, useState, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { IAuthContext, IUserDetails } from '../shared';
import { AuthContext } from './AuthContext';

interface DecodedToken {
	exp: number; // Unix timestamp (seconds)
}

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

	// Automatically logout when token expires
	useEffect(() => {
		if (!token) return;

		try {
			const decoded = jwtDecode<DecodedToken>(token);
			const now = Date.now() / 1000;
			const timeLeft = decoded.exp - now;

			if (timeLeft <= 0) {
				logout();
			} else {
				const timeout = setTimeout(() => {
					logout();
				}, timeLeft * 1000); // Convert to milliseconds

				return () => clearTimeout(timeout);
			}
		} catch (error) {
			console.error('Invalid token:', error);
			logout();
		}
	}, [token]);

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
