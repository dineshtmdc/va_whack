/** @format */

// src/shared/zustand/ui_store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Lang = 'en' | 'mi';

interface UIState {
	lang: Lang;
	dataConsentGiven: boolean;
	setLang: (lang: Lang) => void;
	toggleLang: () => void;
	setDataConsentGiven: (value: boolean) => void;
}

export const useUIStore = create<UIState>()(
	persist(
		(set) => ({
			lang: 'en',
			dataConsentGiven: false,
			setLang: (lang) => set({ lang }),
			toggleLang: () => set((s) => ({ lang: s.lang === 'en' ? 'mi' : 'en' })),
			setDataConsentGiven: (value) => set({ dataConsentGiven: value }),
		}),
		{
			name: 'ui-store',
			partialize: (state) => ({
				lang: state.lang,
				dataConsentGiven: state.dataConsentGiven,
			}),
		}
	)
);
