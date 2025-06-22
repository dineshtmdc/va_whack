/** @format */

import { useState } from 'react';
import type { IUserDetails } from '../shared';

interface LoginProps {
	onLoginSuccess: (user: IUserDetails) => void;
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
	const [playerType, setPlayerType] = useState<'new' | 'existing'>('new');
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [ageGroup, setAgeGroup] = useState('');
	const [pin, setPin] = useState('');
	const [pinRequested, setPinRequested] = useState(false);
	const [loading, setLoading] = useState(false);

	const requestPin = async () => {
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			alert('Please enter a valid email.');
			return;
		}
		if (playerType === 'new' && !name) {
			alert('Please enter your name.');
			return;
		}
		if (playerType === 'new' && !ageGroup) {
			alert('Please select an age group.');
			return;
		}
		setLoading(true);
		try {
			await new Promise((r) => setTimeout(r, 1000));
			setPinRequested(true);
			alert('PIN sent to your email!');
		} catch (err) {
			alert('Failed to send PIN. Please try again.' + err);
		}
		setLoading(false);
	};

	const handleLogin = () => {
		if (!email || !/^\d{4}$/.test(pin)) {
			alert('Please enter a valid email and 4-digit PIN.');
			return;
		}

		const user: IUserDetails = {
			name: playerType === 'new' ? name : '',
			email,
			ageGroup: playerType === 'new' ? ageGroup : null,
			pin,
			isNew: playerType === 'new',
		};

		onLoginSuccess(user);
	};

	return (
		<div className='min-h-screen w-full flex items-center justify-center bg-[radial-gradient(circle,_#2d2d2d_5%,_transparent_6%)] bg-[length:50px_50px] bg-green-600 p-4'>
			<div className='bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-6'>
				<h1 className='text-2xl font-bold text-center text-gray-700'>Login</h1>

				<div className='flex justify-center gap-6'>
					<label className='flex items-center gap-2'>
						<input type='radio' name='playerType' value='new' checked={playerType === 'new'} onChange={() => setPlayerType('new')} />
						<span>New Player</span>
					</label>
					<label className='flex items-center gap-2'>
						<input type='radio' name='playerType' value='existing' checked={playerType === 'existing'} onChange={() => setPlayerType('existing')} />
						<span>Existing Player</span>
					</label>
				</div>

				{playerType === 'new' && (
					<>
						<div>
							<label>Name</label>
							<input value={name} onChange={(e) => setName(e.target.value)} className='w-full border rounded px-2 py-1' />
						</div>
						<div>
							<label>Age Group</label>
							<select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className='w-full border rounded px-2 py-1'>
								<option value='' disabled>
									Select age
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

				<div>
					<label>Email</label>
					<input type='email' value={email} onChange={(e) => setEmail(e.target.value)} className='w-full border rounded px-2 py-1' />
				</div>

				<div>
					<button onClick={requestPin} className='w-full bg-gray-700 text-white py-2 rounded mt-2'>
						{loading ? 'Sending PIN...' : 'Send PIN'}
					</button>
				</div>

				{pinRequested && (
					<div>
						<label>PIN</label>
						<input type='password' inputMode='numeric' maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} className='w-full border rounded px-2 py-1 tracking-widest' />
					</div>
				)}

				<button onClick={handleLogin} disabled={!pinRequested} className='w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50'>
					Continue to Game Selection
				</button>
			</div>
		</div>
	);
};
