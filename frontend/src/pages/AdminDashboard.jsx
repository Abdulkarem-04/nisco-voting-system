import React, { useState, useEffect } from 'react';
import { BarChart3, Users, RefreshCw, Trophy } from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState({ tally: [], totalTurnout: 0 });
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    setLoading(true);
    try {
      // We use the secret key we defined in the backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin-results?secret=nisco2026`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Group the tally by position
  const groupedTally = data.tally.reduce((acc, item) => {
    if (!acc[item.position]) acc[item.position] = [];
    acc[item.position].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center">
            <BarChart3 className="mr-3 text-nisco-green w-10 h-10" /> 
            NISCO ADMIN MONITOR
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mt-1">Live Election Tally Dashboard</p>
        </div>
        <button 
          onClick={fetchResults}
          className="flex items-center bg-nisco-green hover:bg-nisco-dark px-6 py-3 rounded-xl font-bold transition-all"
        >
          <RefreshCw className={`mr-2 w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700">
          <div className="flex items-center text-gray-400 mb-2">
            <Users className="w-5 h-5 mr-2" /> <span className="font-bold uppercase text-xs tracking-widest">Total Voter Turnout</span>
          </div>
          <div className="text-6xl font-black text-white">{data.totalTurnout}</div>
          <p className="text-gray-500 mt-2 text-sm italic">Number of unique students who have cast a ballot.</p>
        </div>
        <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 flex flex-col justify-center">
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-4">Election Integrity Status</p>
            <div className="flex items-center space-x-3 text-green-400">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-black text-xl">System Online & Secure</span>
            </div>
        </div>
      </div>

      {/* Results Sections */}
      <div className="max-w-6xl mx-auto space-y-12">
        {Object.entries(groupedTally).map(([position, candidates]) => (
          <div key={position}>
            <h2 className="text-2xl font-black mb-6 border-l-4 border-nisco-green pl-4 uppercase tracking-tight">{position}</h2>
            <div className="grid grid-cols-1 gap-4">
              {candidates.map((cand, index) => {
                // Calculate percentage for the progress bar
                const totalVotesInPos = candidates.reduce((sum, c) => sum + parseInt(c.vote_count), 0);
                const percentage = totalVotesInPos > 0 ? (parseInt(cand.vote_count) / totalVotesInPos) * 100 : 0;

                return (
                  <div key={cand.id} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex items-center">
                    <div className="w-12 h-12 flex items-center justify-center font-black text-2xl text-gray-600 mr-6">
                        {index === 0 && parseInt(cand.vote_count) > 0 ? <Trophy className="text-yellow-500 w-8 h-8" /> : `#${index + 1}`}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h3 className="text-xl font-bold">{cand.display_name}</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{cand.region_info} Region</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-nisco-green">{cand.vote_count}</span>
                                <span className="text-gray-500 ml-2 font-bold text-sm">Votes</span>
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
                            <div 
                                className="bg-nisco-green h-full transition-all duration-1000" 
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-20 text-center text-gray-600 text-xs font-bold uppercase tracking-[0.2em]">
        Internal Use Only - Authorized Personnel Only
      </div>
    </div>
  );
};

export default AdminDashboard;