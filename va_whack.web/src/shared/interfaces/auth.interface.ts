/** @format */

import type { IUserDetails } from '..';

export interface IUser {
	id: string;
	name: string;
	email: string;
}

export interface IAuthContext {
	user: IUserDetails | null;
	token: string | null;
	login: (user: IUserDetails, token: string) => void;
	logout: () => void;
}

export interface IRequestPinPayload {
	email: string;
}

export interface IVerifyPinPayload {
	email: string;
	pin: string;
}
