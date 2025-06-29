/** @format */

import axios from 'axios';

// Create a reusable Axios instance
const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL,
	headers: { 'Content-Type': 'application/json' },
});

// Add an Axios request interceptor to inject the JWT token automatically
apiClient.interceptors.request.use(
	(config) => {
		//get token from local storage
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

export default apiClient;
