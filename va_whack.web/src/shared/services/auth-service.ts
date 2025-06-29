/** @format */

import apiClient from '../utils/api-client.util';

export const AuthService = {
	// --- Player Registration Flow ---
	registerPlayer: async (name: string, email: string, age_group: string) => {
		const response = await apiClient.post('/players/register', { name, email, age_group });
		return response;
	},

	verifyPlayerPin: async (email: string, pin: string) => {
		const response = await apiClient.post('/players/verify', { email, pin });
		return response;
	},

	// --- Existing Player Login Flow ---
	requestLoginPin: async (email: string) => {
		const response = await apiClient.post('/auth/request-pin', { email });
		return response;
	},

	getAuthToken: async (email: string, pin: string) => {
		const response = await apiClient.post('/auth/token', { email, pin });
		return response;
	},
};
