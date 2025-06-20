/** @format */

// stores/gameSessionStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { IAppearanceEvent, IGameConfig, IGameSession, IUserDetails } from '..';

interface GameSessionState {
	currentSession: IGameSession | null;
	sessionHistory: IGameSession[];
	startSession: (user: IUserDetails, config: IGameConfig) => void;
	addEvents: (newEvents: IAppearanceEvent[]) => void;
	updateEventById: (id: number, update: Partial<IAppearanceEvent>) => void;
	endSession: () => void;
	resetCurrentSession: () => void;
	clearAllSessions: () => void;
}

export const useGameSessionStore = create<GameSessionState>()(
	devtools(
		immer(
			persist(
				(set) => ({
					currentSession: null,
					sessionHistory: [],

					startSession: (user: IUserDetails, config: IGameConfig) =>
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
						set((state: GameSessionState) => {
							if (state.currentSession) {
								state.currentSession.events.push(...newEvents);
							}
						}),

					updateEventById: (id: number, update: Partial<IAppearanceEvent>) =>
						set((state: GameSessionState) => {
							if (state.currentSession) {
								const index = state.currentSession.events.findIndex((e) => e.id === id);
								if (index !== -1) {
									Object.assign(state.currentSession.events[index], update);
								}
							}
						}),

					endSession: () =>
						set((state: GameSessionState) => {
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
				{ name: 'game-session-store' }
			)
		),
		{ name: 'zustand-game-session' }
	)
);
