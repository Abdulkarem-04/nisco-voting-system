import React, { useState, useEffect } from 'react';
import { Trophy, Award, Info, GraduationCap, Vote } from 'lucide-react';

const PublicResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/public-results`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // Group by position
  const groupedResults = results.reduce((acc, item) => {
    if (!acc[item.position]) acc[item.position] = [];
    acc[item.position].push(item);
    return acc;
  }, {});

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Final Results...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-nisco-green text-white py-12 px-4 text-center shadow-lg">
        <div className="flex justify-center items-center space-x-4 mb-6">
            <img src="/images/aiu-logo.png" alt="AIU" className="w-16 h-16 object-contain bg-white p-1 rounded-full" />
            <img src="/images/nisco-logo.png" alt="NISCO" className="w-16 h-16 object-contain bg-white p-1 rounded-full" />
        </div>
        <h1 className="text-4xl font-black tracking-tight uppercase">Election 2026: Final Results</h1>
        <p className="mt-2 text-nisco-light font-medium">Nigerian Students Community (NISCO) @ AIU</p>
      </div>

      <div className="max-w-4xl mx-auto p-4 -mt-8">
        {/* Verification Alert */}
        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl mb-10 flex items-start">
            <Info className="w-6 h-6 mr-4 flex-shrink-0 mt-1" />
            <p className="text-sm font-medium leading-relaxed">
                Notice: These figures represent the raw electronic vote count. 
                The NISCO Election Committee is currently performing the final 
                verification for Regional Balance (North/South) and Gender Parity 
                as mandated by the Constitution.
            </p>
        </div>

        {Object.entries(groupedResults).map(([position, candidates]) => (
          <div key={position} className="mb-12">
            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center">
                <div className="w-2 h-8 bg-nisco-green rounded-full mr-3"></div>
                {position}
            </h2>
            
            <div className="space-y-4">
              {candidates.map((cand, index) => (
                <div 
                  key={cand.display_name} 
                  className={`bg-white p-6 rounded-2xl shadow-sm border-2 flex items-center justify-between transition-all ${index === 0 ? 'border-yellow-400 bg-yellow-50/30' : 'border-gray-100'}`}
                >
                  <div className="flex items-center">
                    <div className="relative mr-6">
                        <img 
                            src={`/images/${cand.image_filename}`} 
                            className={`w-20 h-20 rounded-2xl object-cover border-4 ${index === 0 ? 'border-yellow-400' : 'border-white'}`} 
                            onError={(e) => e.target.src='https://via.placeholder.com/150'}
                        />
                        {index === 0 && (
                            <div className="absolute -top-3 -left-3 bg-yellow-400 text-white p-1.5 rounded-full shadow-lg">
                                <Trophy className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className={`text-xl font-black ${index === 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                            {cand.display_name}
                        </h3>
                        {index === 0 && <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">Leading Candidate</span>}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-3xl font-black text-nisco-green">{cand.vote_count}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Votes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                Certified by the NISCO 2026 Election Committee
            </p>
        </div>
      </div>
    </div>
  );
};

export default PublicResults;