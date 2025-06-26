/** @format */

import { useState } from 'react';
import { getAuthToken, registerPlayer, requestLoginPin, verifyPlayerPin } from '../shared';
import { useAuth } from '../auth/useAuth';

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

	const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

	const handleRequestPin = async () => {
		setErrorMessage('');

		if (!email || !validateEmail(email)) {
			setErrorMessage('Please enter a valid email.');
			return;
		}

		setLoading(true);
		try {
			if (playerType === 'new') {
				if (!name || !ageGroup) {
					setErrorMessage('Please fill in all fields for a new player.');
					return;
				}
				await registerPlayer(name, email, ageGroup);
				alert('Registration successful! A verification PIN has been sent to your email.');
			} else {
				await requestLoginPin(email);
				alert('A login PIN has been sent to your email.');
			}
			setPinRequested(true);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			const apiError = err.response?.data?.detail || 'An unknown error occurred.';
			setErrorMessage(`Failed to send PIN: ${apiError}`);
		} finally {
			setLoading(false);
		}
	};

	const handleAuthentication = async () => {
		setErrorMessage('');

		if (!email || !/^\d{6}$/.test(pin)) {
			setErrorMessage('Please enter a valid email and 6-digit PIN.');
			return;
		}

		setLoading(true);
		try {
			let token = '';
			let finalName = name;
			let finalAgeGroup = ageGroup;

			if (playerType === 'new') {
				const response = await verifyPlayerPin(email, pin);
				token = response.data.access_token;
			} else {
				const response = await getAuthToken(email, pin);
				token = response.data.access_token;
				finalName = 'Existing Player';
				finalAgeGroup = '';
			}

			login({ name: finalName, email, ageGroup: finalAgeGroup, isNew: playerType === 'new' }, token);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			const apiError = err.response?.data?.detail || 'An unknown error occurred.';
			setErrorMessage(`Authentication failed: ${apiError}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen w-full flex items-center justify-center bg-[radial-gradient(circle,_#2d2d2d_5%,_transparent_6%)] bg-[length:50px_50px] bg-green-600 p-4'>
			<div className='bg-white shadow-xl rounded-xl border border-gray-200 p-8 w-full max-w-md space-y-6'>
				<h1 className='text-3xl font-bold text-center text-gray-800'>Welcome</h1>

				<div className='flex justify-center gap-6 border-b border-gray-300 pb-4'>
					<label className='flex items-center gap-2 cursor-pointer'>
						<input type='radio' name='playerType' value='new' checked={playerType === 'new'} onChange={() => setPlayerType('new')} className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300' />
						<span className='font-medium text-gray-700'>New Player</span>
					</label>
					<label className='flex items-center gap-2 cursor-pointer'>
						<input type='radio' name='playerType' value='existing' checked={playerType === 'existing'} onChange={() => setPlayerType('existing')} className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300' />
						<span className='font-medium text-gray-700'>Existing Player</span>
					</label>
				</div>

				{errorMessage && (
					<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md' role='alert'>
						<span className='block sm:inline'>{errorMessage}</span>
					</div>
				)}

				<div className='space-y-4 border border-gray-200 rounded-md p-4'>
					{playerType === 'new' && (
						<>
							<div className='space-y-1'>
								<label className='text-sm font-medium text-gray-600'>Name</label>
								<input value={name} onChange={(e) => setName(e.target.value)} className='w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none' />
							</div>
							<div className='space-y-1'>
								<label className='text-sm font-medium text-gray-600'>Age Group</label>
								<select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className='w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none'>
									<option value='' disabled>
										Select age...
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
						<label className='text-sm font-medium text-gray-600'>Email</label>
						<input type='email' value={email} onChange={(e) => setEmail(e.target.value)} className='w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none' />
					</div>

					{!pinRequested ? (
						<button onClick={handleRequestPin} disabled={loading} className='w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'>
							{loading ? 'Sending...' : 'Request PIN'}
						</button>
					) : (
						<>
							<div className='space-y-1'>
								<label className='text-sm font-medium text-gray-600'>6-Digit PIN</label>
								<input type='text' inputMode='numeric' maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} className='w-full border border-gray-300 rounded-md px-3 py-2 tracking-widest text-center font-mono text-lg focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none' />
							</div>
							<button onClick={handleAuthentication} disabled={loading || pin.length !== 6} className='w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50'>
								{playerType === 'new' ? 'Verify & Continue' : 'Login & Continue'}
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
};
