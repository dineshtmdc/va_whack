/**
 * ==============================================================================
 * # FILE: va_whack.web\src\shared\services\games-service.ts
 * # ==============================================================================
 *
 * @format
 */

/** @format */

import type { IEnagementGameSession, IEnagementScoreSummary, IGameHistory, IScaleGameScore, IScaleGameSession } from '..';
import apiClient from '../utils/api-client.util';

export const GameService = {
	/**
	 * Submit Current VA Scale Game
	 */
	async submitVAScaleGame(data: IScaleGameSession): Promise<IScaleGameScore | undefined> {
		try {
			const url = `/api/va-scale-game/submit`;
			const response = await apiClient.post(url, data);
			return response.data as IScaleGameScore;
		} catch (error) {
			console.error(`Error submitting VA Scale Game:`, error);
			return undefined;
		}
	},

	/**
	 * Submit Current Enagement Game
	 */
	async submitEnagementGame(data: IEnagementGameSession): Promise<IEnagementScoreSummary | undefined> {
		try {
			const url = `/api/engagement-game/submit`;
			const response = await apiClient.post(url, data);
			return response.data as IEnagementScoreSummary;
		} catch (error) {
			console.error(`Error submitting VA Scale Game:`, error);
			return undefined;
		}
	},

	/**
	 * Submit Current Enagement Game
	 */
	async getPlayerGameHistory(email: string): Promise<IGameHistory | undefined> {
		try {
			const url = `/api/get-game-history`;
			const response = await apiClient.post(url, email);
			return response.data as IGameHistory;
		} catch (error) {
			console.error(`Error submitting VA Scale Game:`, error);
			return undefined;
		}
	},
};
