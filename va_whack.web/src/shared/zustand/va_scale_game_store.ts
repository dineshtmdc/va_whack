/** @format */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

import type { IVAScaleGameConfig, IScaleLogEntry, IScaleGameSession, IScaleGameScore } from '..';

interface VAScaleGameSessionState {
	currentSession: IScaleGameSession | null;
	sessionHistory: IScaleGameSession[];
	startSession: (email: string, config: IVAScaleGameConfig) => void;
	addLogEntry: (entry: IScaleLogEntry) => void;
	updateLogEntry: (index: number, update: Partial<IScaleLogEntry>) => void;
	setScore: (score: IScaleGameScore) => void;
	endSession: () => void;
	resetCurrentSession: () => void;
	clearAllSessions: () => void;
}

export const useVAScaleGameSessionStore = create<VAScaleGameSessionState>()(
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
								startTime: Date.now(),
								endTime: undefined,
								logEntries: [],
								score: {
									bestVA: NaN,
									n: 0,
									b: 0,
									finalVA: NaN,
								},
							},
						})),

					addLogEntry: (entry) =>
						set((state) => {
							if (state.currentSession) {
								state.currentSession.logEntries.push(entry);
							}
						}),

					updateLogEntry: (index, update) =>
						set((state) => {
							if (state.currentSession && index >= 0 && index < state.currentSession.logEntries.length) {
								Object.assign(state.currentSession.logEntries[index], update);
							}
						}),

					setScore: (score) =>
						set((state) => {
							if (state.currentSession) {
								state.currentSession.score = score;
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
				{ name: 'va-scale-game-session-store' }
			)
		),
		{ name: 'zustand-scale-session' }
	)
);
