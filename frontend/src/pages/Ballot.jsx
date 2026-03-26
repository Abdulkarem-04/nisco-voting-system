import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, ArrowLeft, 
  User, LogOut, ChevronRight, Info 
} from 'lucide-react';

const Ballot = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [electionData, setElectionData] = useState({ isVotingEnabled: false, candidates: [] });
  const [selections, setSelections] = useState({}); 
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchElectionData = async () => {
      const token = localStorage.getItem('voterToken');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/election-data`);
        const data = await response.json();
        setElectionData(data);

        const initialSelections = {};
        const positions = [...new Set(data.candidates.map(c => c.position))];
        positions.forEach(pos => initialSelections[pos] = null);
        setSelections(initialSelections);

      } catch (error) {
        console.error("Failed to fetch election data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchElectionData();
  }, [navigate]);

  const groupedCandidates = electionData.candidates.reduce((acc, candidate) => {
    if (!acc[candidate.position]) acc[candidate.position] = [];
    acc[candidate.position].push(candidate);
    return acc;
  }, {});

  const handleSelect = (position, value) => {
    setSelections(prev => ({ ...prev, [position]: value }));
  };

  const isBallotComplete = Object.values(selections).every(val => val !== null);

  const handleSubmitVote = async () => {
    setSubmitting(true);
    const token = localStorage.getItem('voterToken');
    const selectedCandidateIds = Object.values(selections).filter(val => val !== 'skip');

    const localReceipt = {};
    Object.entries(selections).forEach(([pos, val]) => {
        if (val === 'skip') {
            localReceipt[pos] = 'Skipped (Abstained)';
        } else {
            const c = electionData.candidates.find(cand => cand.id === val);
            localReceipt[pos] = c ? c.display_name : 'Unknown';
        }
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submit-vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: token, selectedCandidateIds }),
      });

      if (response.ok) {
        localStorage.setItem('voterReceipt', JSON.stringify(localReceipt));
        setTimeout(() => { navigate('/voted'); }, 2000);
      } else {
        const data = await response.json();
        setSubmitMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setSubmitMessage({ type: 'error', text: 'A network error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

// KILL SWITCH CHECK: If voting is disabled in the database
  if (!electionData.isVotingEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-red-500">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Polls are Closed</h2>
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">
            The NISCO election is currently not accepting ballots. Please contact the Election Committee for the official schedule.
          </p>
          <button 
            onClick={() => { localStorage.clear(); navigate('/'); }} 
            className="w-full bg-gray-800 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (showReview) {
    return (
      <div className="min-h-screen bg-gray-50 pb-32">
        <div className="bg-nisco-green text-white p-4 shadow-md sticky top-0 z-20 flex items-center">
          <button onClick={() => setShowReview(false)} className="mr-3 p-2 bg-white/20 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Review Selections</h1>
        </div>
        <div className="max-w-2xl mx-auto p-4 mt-4">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 rounded-r-lg flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-900 font-medium">Confirm your choices. Submissions are permanent and anonymous.</p>
          </div>
          <div className="space-y-4">
            {Object.entries(groupedCandidates).map(([position, candidates]) => {
              const selectedVal = selections[position];
              const selectedCandidate = candidates.find(c => c.id === selectedVal);
              return (
                <div key={position} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{position}</p>
                    <p className={`text-lg font-bold mt-1 ${selectedVal === 'skip' ? 'text-gray-400 italic' : 'text-nisco-dark'}`}>
                      {selectedVal === 'skip' ? 'Skipped' : selectedCandidate?.display_name}
                    </p>
                  </div>
                  {selectedVal !== 'skip' && (
                     <img src={`/images/${selectedCandidate.image_filename}`} className="w-12 h-12 rounded-full object-cover bg-gray-100" onError={(e) => e.target.src='https://via.placeholder.com/150'} />
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={handleSubmitVote} disabled={submitting} className="w-full bg-nisco-green text-white py-5 rounded-2xl font-black text-xl shadow-xl mt-8">
            {submitting ? 'Processing...' : 'Finalize & Submit Vote'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
            {/* REAL LOGOS IN BALLOT HEADER */}
            <img src="/images/aiu-logo.png" alt="AIU" className="w-8 h-8 object-contain bg-white rounded-md border border-gray-100" />
            <img src="/images/nisco-logo.png" alt="NISCO" className="w-8 h-8 object-contain bg-white rounded-md border border-gray-100" />
            <div className="ml-2">
                <h1 className="text-sm font-black text-gray-800 leading-tight">NISCO 2026</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Official Ballot</p>
            </div>
        </div>
        <button onClick={() => { localStorage.removeItem('voterToken'); localStorage.removeItem('voterEmail'); navigate('/'); }} className="text-gray-400 hover:text-red-500 transition-colors">
            <LogOut className="w-6 h-6" />
        </button>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {Object.entries(groupedCandidates).map(([position, candidates]) => (
          <section key={position} className="mt-8 first:mt-4">
            <div className="flex items-center mb-4">
                <div className="h-8 w-1.5 bg-nisco-green rounded-full mr-3"></div>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">{position}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {candidates.map(candidate => (
                <div 
                  key={candidate.id} 
                  onClick={() => handleSelect(position, candidate.id)}
                  className={`relative bg-white rounded-2xl p-5 border-2 transition-all cursor-pointer shadow-sm flex flex-col items-center text-center ${selections[position] === candidate.id ? 'border-nisco-green bg-nisco-light ring-4 ring-nisco-green/10' : 'border-white hover:border-gray-200'}`}
                >
                  <img src={`/images/${candidate.image_filename}`} className="w-32 h-32 rounded-3xl object-cover mb-4 shadow-md bg-gray-100 border-4 border-white" onError={(e) => e.target.src='https://via.placeholder.com/300?text=No+Photo'} />
                  {selections[position] === candidate.id && <div className="absolute top-4 right-4 bg-nisco-green text-white p-1 rounded-full"><CheckCircle2 className="w-5 h-5" /></div>}
                  <h3 className="text-lg font-black text-gray-800 leading-tight">{candidate.display_name}</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1 mb-3 uppercase tracking-widest">{candidate.region_info} Region</p>
                  <div className="mt-auto pt-3 border-t border-gray-100 w-full">
                    <p className="text-sm italic text-gray-500">"{candidate.slogan}"</p>
                  </div>
                </div>
              ))}
            </div>
            <div onClick={() => handleSelect(position, 'skip')} className={`mt-4 p-4 rounded-xl border-2 flex items-center cursor-pointer transition-all ${selections[position] === 'skip' ? 'bg-gray-800 border-gray-800 text-white' : 'bg-white border-dashed border-gray-300 text-gray-400'}`}>
                <User className="w-5 h-5 mr-4" />
                <p className="text-sm font-bold uppercase tracking-widest flex-1">Abstain from {position}</p>
                {selections[position] === 'skip' && <CheckCircle2 className="w-5 h-5" />}
            </div>
          </section>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-5 z-30 shadow-2xl">
        <div className="max-w-4xl mx-auto flex justify-end">
            <button onClick={() => setShowReview(true)} disabled={!isBallotComplete} className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-lg text-white ${isBallotComplete ? 'bg-nisco-green' : 'bg-gray-300 cursor-not-allowed'}`}>
                Preview Ballot <ChevronRight className="inline ml-2 w-6 h-6" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Ballot;