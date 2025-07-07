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
			console.error(`Error submitting Enagement Game:`, error);
			return undefined;
		}
	},

	/**
	 * Submit Current Enagement Game
	 */
	async getPlayerGameHistory(): Promise<IGameHistory | undefined> {
		try {
			const url = `/api/get-game-history`;
			const response = await apiClient.get(url);
			return response.data as IGameHistory;
		} catch (error) {
			console.error(`Error submitting Game History:`, error);
			return undefined;
		}
	},

	/**
	 * Downloads AI report as a text file.
	 */
	async downloadReport(masterSessionId: string): Promise<void> {
		try {
			const response = await apiClient.get(`/api/download_report`, {
				params: { master_session_id: masterSessionId },
				responseType: 'blob', // still correct for PDF
			});

			const blob = new Blob([response.data], { type: 'application/pdf' }); // changed to PDF
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');

			// Extract filename from Content-Disposition header if available
			const contentDisposition = response.headers['content-disposition'];
			const filenameMatch = contentDisposition?.match(/filename="?(.+?)"?$/);
			const filename = filenameMatch ? filenameMatch[1] : 'vision_report.pdf'; // updated default

			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error downloading AI report:', error);
		}
	},

	/**
	 * Sends AI report via email.
	 */
	async sendAIReportEmail(masterSessionId: string): Promise<void> {
		try {
			const response = await apiClient.get('/api/email_report', {
				params: { master_session_id: masterSessionId },
			});
			console.log(response.data?.message || 'Email sent successfully');
		} catch (error) {
			console.error('Failed to send AI report email:', error);
			throw error;
		}
	},
};
