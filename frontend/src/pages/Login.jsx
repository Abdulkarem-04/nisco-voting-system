import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/verify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('voterToken', credentialResponse.credential);
        localStorage.setItem('voterEmail', data.email);
        
        if (data.hasVoted) {
          navigate('/voted');
        } else {
          navigate('/welcome');
        }
      } else {
        setError(data.error || 'Verification failed. Please try again.');
      }
    } catch (err) {
      setError('A network error occurred. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        
        <div className="bg-nisco-green p-6 text-center relative">
          <div className="flex justify-center items-center space-x-4 mb-4">
            {/* Real AIU Logo */}
            <div className="bg-white p-2 rounded-full shadow-md w-16 h-16 flex items-center justify-center overflow-hidden">
              <img src="/images/aiu-logo.png" alt="AIU Logo" className="w-full h-full object-contain" />
            </div>
            {/* Real NISCO Logo */}
            <div className="bg-white p-2 rounded-full shadow-md w-16 h-16 flex items-center justify-center overflow-hidden">
              <img src="/images/nisco-logo.png" alt="NISCO Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">NISCO AIU</h1>
          <p className="text-nisco-light mt-1 text-sm">2026 Executive Board Election</p>
        </div>

        <div className="p-8 flex flex-col items-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">Student Voter Portal</h2>
          <p className="text-gray-500 text-center text-sm mb-6">
            Sign in with your official <span className="font-semibold text-gray-700">@student.aiu.edu.my</span> email.
          </p>

          {error && (
            <div className="w-full bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nisco-green"></div>
              <p className="text-sm text-gray-500 mt-2">Verifying eligibility...</p>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Sign-In failed.')} shape="rectangular" theme="outline" text="continue_with" size="large" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;