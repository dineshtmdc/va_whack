/** @format */

import { useState } from 'react';
import type { IUserDetails } from '../shared/interfaces/player_data.interface';
import {
  registerPlayer,
  verifyPlayerPin,
  requestLoginPin,
  getAuthToken,
} from '../shared/services/apiService';

interface LoginProps {
  onLoginSuccess: (user: IUserDetails, token: string) => void;
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const [playerType, setPlayerType] = useState<'new' | 'existing'>('new');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [pin, setPin] = useState('');
  const [pinRequested, setPinRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handles the "Send PIN" button click
  const handleRequestPin = async () => {
    setErrorMessage('');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email.');
      return;
    }

    setLoading(true);
    try {
      if (playerType === 'new') {
        // --- New Player Registration ---
        if (!name || !ageGroup) {
          setErrorMessage('Please fill in all fields for a new player.');
          setLoading(false);
          return;
        }
        await registerPlayer(name, email, ageGroup);
        alert('Registration successful! A verification PIN has been sent to your email.');
      } else {
        // --- Existing Player Login ---
        await requestLoginPin(email);
        alert('A login PIN has been sent to your email.');
      }
      setPinRequested(true);
    } catch (err: any) {
      const apiError = err.response?.data?.detail || 'An unknown error occurred.';
      setErrorMessage(`Failed to send PIN: ${apiError}`);
      alert(`Failed to send PIN: ${apiError}`);
    } finally {
      setLoading(false);
    }
  };

  // Handles the final "Continue to Game" button click
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
            // --- Verify New Player to get Token ---
            const tokenResponse = await verifyPlayerPin(email, pin);
            token = tokenResponse.data.access_token;
        } else {
            // --- Existing Player Login ---
            const tokenResponse = await getAuthToken(email, pin);
            token = tokenResponse.data.access_token;
            // For existing players, you might want to fetch their details
            // For now, we'll just use the email
            finalName = 'Existing Player'; 
            finalAgeGroup = '';
        }
        
        // On success, pass the user details and the token to the parent component
        onLoginSuccess(
            { name: finalName, email, ageGroup: finalAgeGroup, isNew: playerType === 'new' },
            token
        );

    } catch (err: any) {
        const apiError = err.response?.data?.detail || 'An unknown error occurred.';
        setErrorMessage(`Authentication failed: ${apiError}`);
        alert(`Authentication failed: ${apiError}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-[radial-gradient(circle,_#2d2d2d_5%,_transparent_6%)] bg-[length:50px_50px] bg-green-600 p-4'>
      <div className='bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-6'>
        <h1 className='text-3xl font-bold text-center text-gray-800'>Welcome</h1>

        <div className='flex justify-center gap-6 border-b pb-4'>
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
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{errorMessage}</span>
            </div>
        )}

        {playerType === 'new' && (
          <>
            <div className='space-y-1'>
              <label className='text-sm font-medium text-gray-600'>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className='w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-blue-500' />
            </div>
            <div className='space-y-1'>
              <label className='text-sm font-medium text-gray-600'>Age Group</label>
              <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className='w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-blue-500'>
                <option value='' disabled>Select age...</option>
                {['5-10', '10-15', '15-20', '20-25', '25-30', '30-40', '40-60', '60+'].map((age) => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className='space-y-1'>
          <label className='text-sm font-medium text-gray-600'>Email</label>
          <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} className='w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-blue-500' />
        </div>

        {!pinRequested && (
          <div>
            <button onClick={handleRequestPin} disabled={loading} className='w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'>
              {loading ? 'Sending...' : 'Request PIN'}
            </button>
          </div>
        )}

        {pinRequested && (
            <>
                <div className='space-y-1'>
                    <label className='text-sm font-medium text-gray-600'>6-Digit PIN</label>
                    <input 
                        type='text' 
                        inputMode='numeric' 
                        maxLength={6} 
                        value={pin} 
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                        className='w-full border-gray-300 rounded-md shadow-sm px-3 py-2 tracking-widest text-center font-mono text-lg focus:border-blue-500 focus:ring-blue-500' 
                    />
                </div>
                 <button onClick={handleAuthentication} disabled={loading || pin.length !== 6} className='w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50'>
                    {playerType === 'new' ? 'Verify & Continue' : 'Login & Continue'}
                </button>
            </>
        )}
      </div>
    </div>
  );
};
