import axios from 'axios';

// The base URL for your locally running FastAPI back-end.
// This should be moved to an environment variable in a real application.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Player Registration Flow ---

export const registerPlayer = (name: string, email: string, age_group: string) => {
  return apiClient.post('/players/register', { name, email, age_group });
};

export const verifyPlayerPin = (email: string, pin: string) => {
  return apiClient.post('/players/verify', { email, pin });
};

// --- Existing Player Login Flow ---

export const requestLoginPin = (email: string) => {
  return apiClient.post('/auth/request-pin', { email });
};

export const getAuthToken = (email: string, pin: string) => {
  return apiClient.post('/auth/token', { email, pin });
};