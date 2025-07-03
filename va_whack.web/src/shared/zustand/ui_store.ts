/** @format */

// src/shared/zustand/ui_store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Lang = 'en' | 'mi';

interface UIState {
	lang: Lang;
	setLang: (lang: Lang) => void;
	toggleLang: () => void;
}

export const useUIStore = create<UIState>()(
	persist(
		(set) => ({
			lang: 'en',
			setLang: (lang) => set({ lang }),
			toggleLang: () => set((s) => ({ lang: s.lang === 'en' ? 'mi' : 'en' })),
		}),
		{
			name: 'ui-store', // unique name for localStorage
			partialize: (state) => ({ lang: state.lang }), // only persist lang
		}
	)
);
