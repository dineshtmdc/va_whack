/** @format */

import { useState } from 'react';
import type { IUserDetails } from '../shared';

const ageGroups = ['5-10', '10-15', '15-20', '20-25', '25-30', '30-40', '40-60', '60+'];

interface LandingPageProps {
	onStart: (user: IUserDetails) => void;
}

export const Login = ({ onStart }: LandingPageProps) => {
	const [playerType, setPlayerType] = useState<'new' | 'existing'>('new');
	const [name, setName] = useState('');
	const [ageGroup, setAgeGroup] = useState('');
	const [pin, setPin] = useState('');

	const handleStart = () => {
		if (!name || !/^\d{4}$/.test(pin)) {
			alert('Please enter your name and a valid 4-digit PIN.');
			return;
		}

		if (playerType === 'new' && !ageGroup) {
			alert('Please select an age group for new player.');
			return;
		}

		onStart({
			name,
			ageGroup: playerType === 'new' ? ageGroup : null,
			pin,
			isNew: playerType === 'new',
		});
	};

	return (
		<div className='min-h-screen flex items-center justify-center p-4'>
			<div className='bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-6'>
				<h1 className='text-2xl font-bold text-center text-gray-700'>Enter Game</h1>

				{/* Radio buttons */}
				<div className='flex justify-center gap-6'>
					<label className='flex items-center gap-2'>
						<input type='radio' name='playerType' value='new' checked={playerType === 'new'} onChange={() => setPlayerType('new')} className='accent-blue-600' />
						<span className='text-sm text-gray-700'>New Player</span>
					</label>
					<label className='flex items-center gap-2'>
						<input type='radio' name='playerType' value='existing' checked={playerType === 'existing'} onChange={() => setPlayerType('existing')} className='accent-blue-600' />
						<span className='text-sm text-gray-700'>Existing Player</span>
					</label>
				</div>

				{/* Name input */}
				<div>
					<label className='block text-sm font-medium text-gray-700'>Player Name</label>
					<input type='text' className='w-full mt-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400' value={name} onChange={(e) => setName(e.target.value)} placeholder='Enter your name' />
				</div>

				{/* Age group dropdown */}
				{playerType === 'new' && (
					<div>
						<label className='block text-sm font-medium text-gray-700'>Age Group</label>
						<select className='w-full mt-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400' value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
							<option value='' disabled>
								Select an age group
							</option>
							{ageGroups.map((group) => (
								<option key={group} value={group}>
									{group}
								</option>
							))}
						</select>
					</div>
				)}

				{/* PIN input */}
				<div>
					<label className='block text-sm font-medium text-gray-700'>4-Digit PIN</label>
					<input type='password' inputMode='numeric' maxLength={4} className='w-full mt-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 tracking-widest' value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder='••••' />
				</div>

				{/* Button */}
				<button onClick={handleStart} className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition'>
					Enter Game
				</button>
			</div>
		</div>
	);
};
