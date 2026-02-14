import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Loader2, Database } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getArtistEarnings, getArtistTransactions, getAllEarnings, getAllTransactions } from '@/services/firestoreService';
import type { EarningsData, TransactionData } from '@/services/firestoreService';

export function EarningsPage() {
  const navigate = useNavigate();
  const { currentUserId } = useApp();

  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function fetchEarnings() {
      setLoading(true);
      try {
        // Step 1: Try to get earnings for the logged-in user
        if (currentUserId) {
          const myEarnings = await getArtistEarnings(currentUserId);
          const myTransactions = await getArtistTransactions(currentUserId);

          if (myEarnings) {
            setEarnings(myEarnings);
            setTransactions(myTransactions);
            setIsDemo(false);
            setLoading(false);
            return;
          }
        }

        // Step 2: If no personal earnings, load all earnings (demo mode)
        const allEarnings = await getAllEarnings();
        const allTransactions = await getAllTransactions();

        if (allEarnings.length > 0) {
          // Show the first artist's earnings as demo
          setEarnings(allEarnings[0]);
          setTransactions(allTransactions.filter(t => t.artistId === allEarnings[0].artistId));
          setIsDemo(true);
        } else {
          // No data at all — show empty
          setEarnings(null);
          setTransactions([]);
          setIsDemo(false);
        }
      } catch (error) {
        console.error('Error fetching earnings:', error);
        setEarnings(null);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEarnings();
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">Loading earnings from database...</p>
        </div>
      </div>
    );
  }

  if (!earnings) {
    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto animate-fade-in">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-4 transition-colors lg:hidden">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex flex-col items-center justify-center py-20">
          <Database size={48} className="text-stone-300 mb-4" />
          <h2 className="text-lg font-bold text-stone-700 mb-2">No Earnings Data Found</h2>
          <p className="text-stone-500 text-sm text-center max-w-md mb-4">
            Earnings data is not available yet. Please go to Profile and click "Seed Database" to populate sample data.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors"
          >
            Go to Profile → Seed Database
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-4 transition-colors lg:hidden">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-stone-800">Earnings</h1>
        {isDemo && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
            Sample Data (Demo)
          </span>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-5 text-white">
          <p className="text-amber-200 text-sm">Total Earnings</p>
          <p className="text-3xl font-bold mt-1">₹{earnings.totalEarnings.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp size={14} className="text-green-300" />
            <span className="text-green-300 text-xs font-medium">+12.5% from last month</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <p className="text-stone-500 text-sm">This Month</p>
          <p className="text-2xl font-bold text-stone-800 mt-1">₹{earnings.thisMonth.toLocaleString('en-IN')}</p>
          <p className="text-xs text-stone-400 mt-1">{earnings.completedOrders} orders completed</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <p className="text-stone-500 text-sm">Pending Payout</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">₹{earnings.pendingPayout.toLocaleString('en-IN')}</p>
          <p className="text-xs text-stone-400 mt-1">Will be paid in 2 days</p>
        </div>
      </div>

      {/* Platform Fee */}
      <div className="bg-stone-50 rounded-xl p-4 mb-6 border border-stone-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-700">Platform Fee (5%)</p>
            <p className="text-xs text-stone-400">Total commission paid to HunarHub</p>
          </div>
          <p className="text-lg font-bold text-stone-600">₹{earnings.platformFee.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button className="bg-white rounded-xl p-4 shadow-sm border border-stone-100 flex items-center gap-3 hover-lift">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><Wallet size={18} className="text-green-600" /></div>
          <div className="text-left"><p className="text-sm font-semibold text-stone-800">Withdraw</p><p className="text-[10px] text-stone-400">To bank</p></div>
        </button>
        <button className="bg-white rounded-xl p-4 shadow-sm border border-stone-100 flex items-center gap-3 hover-lift">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><CreditCard size={18} className="text-blue-600" /></div>
          <div className="text-left"><p className="text-sm font-semibold text-stone-800">UPI Setup</p><p className="text-[10px] text-stone-400">Link UPI ID</p></div>
        </button>
      </div>

      {/* Transactions */}
      <h2 className="text-lg font-bold text-stone-800 mb-3">Transaction History</h2>

      {transactions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
          <p className="text-stone-400 text-sm">No transactions found in database.</p>
          <p className="text-stone-400 text-xs mt-1">Seed the database to see sample transactions.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="divide-y divide-stone-100">
            {transactions.map((txn, index) => (
              <div key={index} className="flex items-center gap-4 px-5 py-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {txn.type === 'credit' ? <ArrowDownRight size={18} className="text-green-600" /> : <ArrowUpRight size={18} className="text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-stone-800">{txn.title}</h4>
                  <p className="text-xs text-stone-400">{txn.date}</p>
                  {txn.description && <p className="text-xs text-stone-300 mt-0.5">{txn.description}</p>}
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                    {txn.type === 'credit' ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                  </span>
                  {txn.status && (
                    <p className={`text-[10px] mt-0.5 ${txn.status === 'completed' ? 'text-green-500' : txn.status === 'pending' ? 'text-yellow-500' : 'text-blue-500'}`}>
                      {txn.status}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
