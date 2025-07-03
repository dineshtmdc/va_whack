/** @format */

// stores/gameMasterSessionStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

interface IGameMasterSession {
	sessionId: string;
	engagementCompleted: boolean;
	vaScaleCompleted: boolean;
	startTime: number;
	endTime?: number;
}

interface GameMasterSessionState {
	currentSession: IGameMasterSession;
	history: IGameMasterSession[];
	markEngagementComplete: () => void;
	markVAScaleComplete: () => void;
	resetSession: () => void;
}

export const useGameMasterSessionStore = create<GameMasterSessionState>()(
	persist(
		(set, get) => ({
			currentSession: {
				sessionId: uuidv4(),
				engagementCompleted: false,
				vaScaleCompleted: false,
				startTime: Date.now(),
			},
			history: [],
			markEngagementComplete: () => {
				const { currentSession } = get();
				const updated = { ...currentSession, engagementCompleted: true };
				checkAndEnd(updated);
			},
			markVAScaleComplete: () => {
				const { currentSession } = get();
				const updated = { ...currentSession, vaScaleCompleted: true };
				checkAndEnd(updated);
			},
			resetSession: () => {
				const { currentSession, history } = get();
				if (!currentSession.endTime) {
					history.push({ ...currentSession, endTime: Date.now() });
				}
				set({
					currentSession: {
						sessionId: uuidv4(),
						engagementCompleted: false,
						vaScaleCompleted: false,
						startTime: Date.now(),
					},
					history,
				});
			},
		}),
		{ name: 'game-master-session' }
	)
);

function checkAndEnd(updatedSession: IGameMasterSession) {
	if (updatedSession.engagementCompleted && updatedSession.vaScaleCompleted) {
		useGameMasterSessionStore.getState().resetSession();
	} else {
		useGameMasterSessionStore.setState({ currentSession: updatedSession });
	}
}
