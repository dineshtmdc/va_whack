/** @format */

// stores/gameSessionStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { IAppearanceEvent, IVAGameConfig, IVAGameSession, IUserDetails } from '..';

interface VAGameSessionState {
	currentSession: IVAGameSession | null;
	sessionHistory: IVAGameSession[];
	startSession: (user: IUserDetails, config: IVAGameConfig) => void;
	addEvents: (newEvents: IAppearanceEvent[]) => void;
	updateEventById: (id: number, update: Partial<IAppearanceEvent>) => void;
	endSession: () => void;
	resetCurrentSession: () => void;
	clearAllSessions: () => void;
}

export const useVAGameSessionStore = create<VAGameSessionState>()(
	devtools(
		immer(
			persist(
				(set) => ({
					currentSession: null,
					sessionHistory: [],

					startSession: (user: IUserDetails, config: IVAGameConfig) =>
						set(() => ({
							currentSession: {
								gameId: uuidv4(),
								user,
								config,
								events: [],
								startTime: Date.now(),
							},
						})),

					addEvents: (newEvents: IAppearanceEvent[]) =>
						set((state: VAGameSessionState) => {
							if (state.currentSession) {
								state.currentSession.events.push(...newEvents);
							}
						}),

					updateEventById: (id: number, update: Partial<IAppearanceEvent>) =>
						set((state: VAGameSessionState) => {
							if (state.currentSession) {
								const index = state.currentSession.events.findIndex((e) => e.id === id);
								if (index !== -1) {
									Object.assign(state.currentSession.events[index], update);
								}
							}
						}),

					endSession: () =>
						set((state: VAGameSessionState) => {
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
				{ name: 'va-game-session-store' }
			)
		),
		{ name: 'zustand-game-session' }
	)
);
