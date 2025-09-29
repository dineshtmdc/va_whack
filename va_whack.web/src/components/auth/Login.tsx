/** @format */

import { useState, useMemo } from 'react';

import { useAuth } from '../../auth/useAuth';

import { MousePointerClick, Rabbit, Eye, Circle, Mouse, Rat, EyeClosed, EyeOff, Brain, LoaderCircle, Globe } from 'lucide-react';

import { AuthService, labels, useUIStore } from '../../shared';

import toast from 'react-hot-toast';
 
export const Login = () => {

    const { login } = useAuth();
 
    const [playerType, setPlayerType] = useState<'new' | 'existing'>('new');

    const [name, setName] = useState('');

    const [email, setEmail] = useState('');

    const [ageGroup, setAgeGroup] = useState('');

    const [pin, setPin] = useState('');

    const [pinRequested, setPinRequested] = useState(false);

    const [loading, setLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');
 
    const lang = useUIStore((s) => s.lang);

    const toggleLang = useUIStore((s) => s.toggleLang);

    const t = labels[lang];
 
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 
    const handleRequestPin = async () => {

        setErrorMessage('');

        if (!email || !validateEmail(email)) {

            setErrorMessage(t.invalidEmail);

            return;

        }

        if (playerType === 'new' && (!name || !ageGroup)) {

            setErrorMessage(t.fillFields);

            return;

        }

        setLoading(true);

        try {

            if (playerType === 'new') {

                await AuthService.registerPlayer(name, email, ageGroup);

                toast.success(t.registrationSuccess, { duration: 5000 });

            } else {

                await AuthService.requestLoginPin(email);

                toast.success(t.loginPinSent, { duration: 5000 });

            }

            setPinRequested(true);

        } catch (err: any) {

            const apiError = err.response?.data?.detail || 'An unknown error occurred.';

            setErrorMessage(`${t.fetchFailed} ${apiError}`);

        } finally {

            setLoading(false);

        }

    };
 
    const handleAuthentication = async () => {

        setErrorMessage('');
 
        if (!email || !/^\d{6}$/.test(pin)) {

            setErrorMessage(t.invalidPin);

            return;

        }
 
        setLoading(true);

        try {

            let token = '';

            let finalName = '';

            let finalAgeGroup: string | null = null;
 
            if (playerType === 'new') {

                const response = await AuthService.verifyPlayerPin(email, pin);

                token = response.data.access_token;

                finalName = response.data.name;

                finalAgeGroup = response.data.ageGroup;

            } else {

                const response = await AuthService.getAuthToken(email, pin);

                token = response.data.access_token;

                finalName = response.data.name;

                finalAgeGroup = response.data.ageGroup;

            }
 
            login(

                {

                    name: finalName,

                    email,

                    ageGroup: finalAgeGroup,

                    isNew: playerType === 'new',

                },

                token

            );

        } catch (err: any) {

            const apiError = err?.response?.data?.detail || 'An unknown error occurred.';

            setErrorMessage(`${t.authFailed} ${apiError}`);

        } finally {

            setLoading(false);

        }

    };
 
    const icons = useMemo(() => {

        return Array(100)

            .fill([MousePointerClick, Mouse, Rabbit, Rat, Eye, Circle, EyeClosed, EyeOff, Brain, LoaderCircle])

            .flat()

            .sort(() => Math.random() - 0.5);

    }, []);
 
    return (
<div className='relative min-h-screen w-full flex flex-col items-center justify-center bg-gray-100'>

            {/* Background icons */}
<div className='absolute inset-0 z-0 pointer-events-none overflow-hidden'>
<div className='w-full h-full flex flex-wrap justify-center items-center gap-10 text-gray-400 opacity-40'>

                    {icons.map((Icon, i) => (
<Icon key={i} className='w-8 h-8' />

                    ))}
</div>
</div>
 
            {/* Language toggle */}
<button onClick={toggleLang} className='absolute top-4 left-4 z-10 p-2 bg-white rounded shadow hover:bg-gray-100 flex items-center gap-2'>
<Globe className='w-4 h-4' />

                {t.langToggle}
</button>
 
            <h1 className='text-4xl font-extrabold text-blue-800 mb-2 text-center z-10'>{t.centerTitle}</h1>
<h2 className='text-xl font-semibold text-green-600 mb-6 z-10'>{t.centerSubtitle}</h2>
 
            <div className='bg-white shadow-xl rounded-xl border border-gray-200 p-8 w-full max-w-xl space-y-6 z-10'>
<h3 className='text-2xl font-bold text-center text-gray-800 mb-2'>{t.login}</h3>
 
                <div className='flex justify-center gap-6 border-b border-gray-300 pb-4'>
<label className='flex items-center gap-2 cursor-pointer'>
<input type='radio' name='playerType' value='new' checked={playerType === 'new'} onChange={() => setPlayerType('new')} />
<span className='font-medium text-gray-700'>{t.newPlayer}</span>
</label>
<label className='flex items-center gap-2 cursor-pointer'>
<input type='radio' name='playerType' value='existing' checked={playerType === 'existing'} onChange={() => setPlayerType('existing')} />
<span className='font-medium text-gray-700'>{t.existingPlayer}</span>
</label>
</div>
 
                {errorMessage && (
<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md'>
<span className='block sm:inline'>{errorMessage}</span>
</div>

                )}
 
                <div className='space-y-4 border border-gray-200 rounded-md p-4'>

                    {playerType === 'new' && (
<>
<div className='space-y-1'>
<label className='text-sm font-medium text-gray-600'>{t.name}</label>
<input value={name} onChange={(e) => setName(e.target.value)} className='w-full border border-gray-300 rounded-md px-3 py-2' />
</div>
<div className='space-y-1'>
<label className='text-sm font-medium text-gray-600'>{t.ageGroup}</label>
<select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className='w-full border border-gray-300 rounded-md px-3 py-2'>
<option value='' disabled>

                                        {t.selectAge}
</option>

                                    {['5-10', '10-15', '15-20', '20-25', '25-30', '30-40', '40-60', '60+'].map((age) => (
<option key={age} value={age}>

                                            {age}
</option>

                                    ))}
</select>
</div>
</>

                    )}
 
                    <div className='space-y-1'>
<label className='text-sm font-medium text-gray-600'>{t.email}</label>
<input type='email' value={email} onChange={(e) => setEmail(e.target.value)} className='w-full border border-gray-300 rounded-md px-3 py-2' />
</div>
 
                    {!pinRequested ? (
<button onClick={handleRequestPin} disabled={loading} className='w-full bg-blue-600 text-white py-2 rounded-md font-semibold'>

                            {loading ? t.sending : t.requestPin}
</button>

                    ) : (
<>
<div className='space-y-1'>
<label className='text-sm font-medium text-gray-600'>{t.pinLabel}</label>
<input type='text' inputMode='numeric' maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} className='w-full border border-gray-300 rounded-md px-3 py-2 text-center font-mono' />
</div>
<button onClick={handleAuthentication} disabled={loading || pin.length !== 6} className='w-full bg-green-600 text-white py-2 rounded-md font-semibold'>

                                {playerType === 'new' ? t.verifyContinue : t.loginContinue}
</button>
</>

                    )}
</div>
</div>
 
            {/* Watch Intro button */}
<div className="absolute bottom-16 w-full flex justify-center z-10">
<button

                    className="bg-purple-600 text-white px-6 py-2 rounded-md font-semibold shadow-md hover:bg-purple-700 transition"

                    onClick={() => {

                        window.open('https://youtu.be/SIWtH6WDPoQ', '_blank');

                    }}
>

                    Watch Intro
</button>
</div>
 
            {/* Version Info */}
<div className='absolute bottom-4 right-6 text-sm font-semibold text-white bg-blue-700 px-3 py-1 rounded-full shadow-md z-10'>

                V:3.0.1
</div>
</div>

    );

};

 