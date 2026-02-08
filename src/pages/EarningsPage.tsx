import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, CreditCard } from 'lucide-react';
import { artists } from '@/data/mockData';
import { useApp } from '@/context/AppContext';

export function EarningsPage() {
  const navigate = useNavigate();
  const { currentUserId, orders } = useApp();
  const artist = artists.find(a => a.id === currentUserId);
  const myOrders = orders.filter(o => o.artistId === currentUserId);
  const completedOrders = myOrders.filter(o => o.status === 'completed');
  const totalEarnings = artist?.earnings || 0;
  const thisMonth = Math.round(totalEarnings * 0.3);
  const pendingPayout = Math.round(totalEarnings * 0.1);

  const transactions = [
    { id: 1, title: 'Family Portrait', amount: 8000, type: 'credit' as const, date: 'Nov 15, 2024' },
    { id: 2, title: 'Pet Sketch', amount: 1500, type: 'credit' as const, date: 'Nov 10, 2024' },
    { id: 3, title: 'Platform Fee', amount: -475, type: 'debit' as const, date: 'Nov 10, 2024' },
    { id: 4, title: 'Bank Payout', amount: -15000, type: 'debit' as const, date: 'Nov 05, 2024' },
    { id: 5, title: 'Abstract Painting', amount: 5000, type: 'credit' as const, date: 'Oct 28, 2024' },
    { id: 6, title: 'Platform Fee', amount: -250, type: 'debit' as const, date: 'Oct 28, 2024' },
    { id: 7, title: 'Wedding Card Design', amount: 3500, type: 'credit' as const, date: 'Oct 20, 2024' },
    { id: 8, title: 'Bank Payout', amount: -12000, type: 'debit' as const, date: 'Oct 15, 2024' },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-4 transition-colors lg:hidden">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      <h1 className="text-xl lg:text-2xl font-bold text-stone-800 mb-6">Earnings</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-5 text-white">
          <p className="text-amber-200 text-sm">Total Earnings</p>
          <p className="text-3xl font-bold mt-1">₹{totalEarnings.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp size={14} className="text-green-300" />
            <span className="text-green-300 text-xs font-medium">+12.5% from last month</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <p className="text-stone-500 text-sm">This Month</p>
          <p className="text-2xl font-bold text-stone-800 mt-1">₹{thisMonth.toLocaleString('en-IN')}</p>
          <p className="text-xs text-stone-400 mt-1">{completedOrders.length} orders completed</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <p className="text-stone-500 text-sm">Pending Payout</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">₹{pendingPayout.toLocaleString('en-IN')}</p>
          <p className="text-xs text-stone-400 mt-1">Will be paid in 2 days</p>
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
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="divide-y divide-stone-100">
          {transactions.map(txn => (
            <div key={txn.id} className="flex items-center gap-4 px-5 py-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                {txn.type === 'credit' ? <ArrowDownRight size={18} className="text-green-600" /> : <ArrowUpRight size={18} className="text-red-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-stone-800">{txn.title}</h4>
                <p className="text-xs text-stone-400">{txn.date}</p>
              </div>
              <span className={`text-sm font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                {txn.type === 'credit' ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
