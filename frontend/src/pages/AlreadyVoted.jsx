import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogOut } from 'lucide-react';

const AlreadyVoted = () => {
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    // Try to find the receipt saved on this specific device
    const savedReceipt = localStorage.getItem('voterReceipt');
    if (savedReceipt) {
      setReceipt(JSON.parse(savedReceipt));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('voterToken');
    localStorage.removeItem('voterEmail');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-gray-800">
        <Lock className="w-16 h-16 text-gray-800 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Locked</h2>
        <p className="text-gray-600 mb-6">Our records show that you have already cast your ballot for this election.</p>
        
        {receipt ? (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left border border-gray-200">
            <h3 className="font-bold text-gray-700 border-b pb-2 mb-3 text-center text-sm">Your Voting Receipt (Saved Locally)</h3>
            {Object.entries(receipt).map(([position, choice]) => (
              <div key={position} className="mb-2">
                <span className="text-xs text-gray-500 uppercase font-bold block">{position}</span>
                <span className="text-sm text-gray-800 font-medium">{choice}</span>
              </div>
            ))}
            <p className="text-[10px] text-gray-400 mt-3 text-center italic">This receipt is only visible on this device.</p>
          </div>
        ) : (
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 text-sm">
            Your vote is securely stored in our anonymous database. Because of our strict anonymity rules, we cannot fetch your choices from the server.
          </div>
        )}

        <button onClick={handleLogout} className="w-full flex justify-center items-center bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition">
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default AlreadyVoted;