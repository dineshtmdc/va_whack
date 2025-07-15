/** @format */

// src/components/DataConsentModal.tsx

import { useUIStore } from '../shared/zustand/ui_store';
import { labels } from '../shared';
import { Globe } from 'lucide-react';

export const DataConsentModal = () => {
	const dataConsentGiven = useUIStore((s) => s.dataConsentGiven);
	const setDataConsentGiven = useUIStore((s) => s.setDataConsentGiven);
	const lang = useUIStore((s) => s.lang);
	const toggleLang = useUIStore((s) => s.toggleLang);
	const t = labels[lang].dataConsent;

	if (dataConsentGiven) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
			<div className='bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative'>
				{/* Language Toggle (Optional inside modal) */}
				<button onClick={toggleLang} className='absolute top-3 right-3 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded inline-flex items-center gap-1'>
					<Globe className='w-4 h-4' />
					{lang === 'en' ? 'Māori' : 'English'}
				</button>
				<h2 className='text-lg font-semibold mb-4'>{t.title}</h2>

				<p className='text-sm mb-4'>{t.intro}</p>

				<p className='text-sm font-medium mb-2'>{t.principlesIntro}</p>
				<ul className='text-sm list-disc list-inside mb-4 space-y-1'>
					<li>
						<strong>Pūkenga & Whakapapa</strong>: {t.principles.pukenga}
					</li>
					<li>
						<strong>Pono & Tika</strong>: {t.principles.pono}
					</li>
					<li>
						<strong>Wānanga & Kaitiaki</strong>: {t.principles.wananga}
					</li>
					<li>
						<strong>Wairua & Mauri</strong>: {t.principles.wairua}
					</li>
					<li>
						<strong>Tapu & Noa</strong>: {t.principles.tapu}
					</li>
				</ul>

				<p className='text-sm mb-4'>{t.acknowledgement}</p>

				<div className='text-right'>
					<button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium' onClick={() => setDataConsentGiven(true)}>
						{t.accept}
					</button>
				</div>
			</div>
		</div>
	);
};
