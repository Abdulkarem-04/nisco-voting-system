import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, Users, Clock, ArrowRight, AlertCircle } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isVotingEnabled, setIsVotingEnabled] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/election-data`);
        const data = await response.json();
        setIsVotingEnabled(data.isVotingEnabled);
      } catch (error) {
        console.error("Error checking election status:", error);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Checking status...</div>;

  // If polls are closed, show the error here too
  if (!isVotingEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-red-500">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Polls are Closed</h2>
          <p className="text-gray-500 mt-4 mb-8">You cannot access the ballot at this time.</p>
          <button onClick={() => navigate('/')} className="text-nisco-green font-bold">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-nisco-green p-6 text-white text-center">
            <h1 className="text-2xl font-bold uppercase tracking-tight">Official Voting Portal</h1>
            <p className="text-nisco-light mt-2 font-medium">Please read these guidelines carefully</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-start">
              <div className="bg-blue-50 p-3 rounded-2xl mr-4"><UserCheck className="text-blue-600 w-6 h-6" /></div>
              <div>
                <h3 className="font-bold text-gray-800">One Student, One Vote</h3>
                <p className="text-gray-500 text-sm">Upon submission, your account will be securely locked to prevent duplicate voting.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-green-50 p-3 rounded-2xl mr-4"><ShieldCheck className="text-green-600 w-6 h-6" /></div>
              <div>
                <h3 className="font-bold text-gray-800">100% Anonymous & Secure</h3>
                <p className="text-gray-500 text-sm">Your personal data is permanently separated from your vote. No one can see who you voted for.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-purple-50 p-3 rounded-2xl mr-4"><Users className="text-purple-600 w-6 h-6" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Joint Presidential Ticket</h3>
                <p className="text-gray-500 text-sm">The President and VP run on a single ticket. You cast one vote for the team.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-orange-50 p-3 rounded-2xl mr-4"><Clock className="text-orange-600 w-6 h-6" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Review Before Submission</h3>
                <p className="text-gray-500 text-sm">Double-check your choices. Once submitted, your ballot is final and permanent.</p>
              </div>
            </div>
            <button onClick={() => navigate('/ballot')} className="w-full mt-4 bg-nisco-green text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-nisco-dark transition-all transform active:scale-95">
              I Understand, Proceed to Ballot <ArrowRight className="inline ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;