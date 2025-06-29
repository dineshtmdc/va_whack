/** @format */

// stores/gameSessionStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

import type { IAppearanceEvent, IEnagementGameConfig, IEnagementGameSession, IEnagementScoreSummary } from '..';

interface EnagementGameSessionState {
	currentSession: IEnagementGameSession | null;
	sessionHistory: IEnagementGameSession[];
	startSession: (email: string, config: IEnagementGameConfig) => void;
	addEvents: (newEvents: IAppearanceEvent[]) => void;
	updateEventById: (id: number, update: Partial<IAppearanceEvent>) => void;
	setScores: (scores: IEnagementScoreSummary) => void;
	endSession: () => void;
	resetCurrentSession: () => void;
	clearAllSessions: () => void;
}

export const useEnagementGameSessionStore = create<EnagementGameSessionState>()(
	devtools(
		immer(
			persist(
				(set) => ({
					currentSession: null,
					sessionHistory: [],

					startSession: (email, config) =>
						set(() => ({
							currentSession: {
								gameId: uuidv4(),
								email,
								config,
								events: [],
								startTime: Date.now(),
								scores: {
									totalTrials: 0,
									totalMoleTrials: 0,
									totalRabbitTrials: 0,
								},
							},
						})),

					addEvents: (newEvents) =>
						set((state) => {
							if (state.currentSession) {
								state.currentSession.events.push(...newEvents);
							}
						}),

					updateEventById: (id, update) =>
						set((state) => {
							if (state.currentSession) {
								const index = state.currentSession.events.findIndex((e) => e.id === id);
								if (index !== -1) {
									Object.assign(state.currentSession.events[index], update);
								}
							}
						}),

					setScores: (scores) =>
						set((state) => {
							if (state.currentSession) {
								state.currentSession.scores = scores;
							}
						}),

					endSession: () =>
						set((state) => {
							if (state.currentSession) {
								state.currentSession.endTime = Date.now();
								state.sessionHistory.push({ ...state.currentSession });
								state.currentSession = null;
							}
						}),

					resetCurrentSession: () =>
						set(() => ({
							currentSession: null,
						})),

					clearAllSessions: () =>
						set(() => ({
							currentSession: null,
							sessionHistory: [],
						})),
				}),
				{ name: 'engagement-game-session-store' }
			)
		),
		{ name: 'zustand-game-session' }
	)
);
