/** @format */

export interface IUserDetails {
	name: string;
	email: string;
	ageGroup: string | null;
	pin?: string;
	isNew: boolean;
}
