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
    { id: 1, title: 'Family Portrait', amount: 8000, type: 'credit' as const, date: 'Nov 15' },
    { id: 2, title: 'Pet Sketch', amount: 1500, type: 'credit' as const, date: 'Nov 10' },
    { id: 3, title: 'Platform Fee', amount: -475, type: 'debit' as const, date: 'Nov 10' },
    { id: 4, title: 'Bank Payout', amount: -15000, type: 'debit' as const, date: 'Nov 05' },
    { id: 5, title: 'Abstract Painting', amount: 5000, type: 'credit' as const, date: 'Oct 28' },
    { id: 6, title: 'Platform Fee', amount: -250, type: 'debit' as const, date: 'Oct 28' },
  ];

  return (
    <div className="h-full native-scroll bg-stone-50">
      <div className="bg-gradient-to-br from-amber-700 via-amber-600 to-orange-600 px-5 pt-3 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Earnings</h1>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-3">
          <p className="text-amber-200 text-xs">Total Earnings</p>
          <p className="text-2xl font-bold text-white mt-0.5">₹{totalEarnings.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <TrendingUp size={12} className="text-green-300" />
            <span className="text-green-300 text-[10px] font-medium">+12.5% from last month</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { value: `₹${(thisMonth / 1000).toFixed(0)}k`, label: 'This Month' },
            { value: `₹${(pendingPayout / 1000).toFixed(0)}k`, label: 'Pending' },
            { value: completedOrders.length, label: 'Orders' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-2 text-center">
              <p className="text-base font-bold text-white">{s.value}</p>
              <p className="text-[9px] text-amber-200">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4">
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <button className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-2.5">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center"><Wallet size={18} className="text-green-600" /></div>
            <div className="text-left"><p className="text-xs font-semibold text-stone-800">Withdraw</p><p className="text-[9px] text-stone-400">To bank</p></div>
          </button>
          <button className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center"><CreditCard size={18} className="text-blue-600" /></div>
            <div className="text-left"><p className="text-xs font-semibold text-stone-800">UPI Setup</p><p className="text-[9px] text-stone-400">Link UPI</p></div>
          </button>
        </div>

        <h2 className="text-base font-bold text-stone-800 mb-2">Transactions</h2>
        <div className="space-y-2 pb-4">
          {transactions.map(txn => (
            <div key={txn.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                {txn.type === 'credit' ? <ArrowDownRight size={16} className="text-green-600" /> : <ArrowUpRight size={16} className="text-red-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-stone-800 truncate">{txn.title}</h4>
                <p className="text-[10px] text-stone-400">{txn.date}</p>
              </div>
              <span className={`text-xs font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                {txn.type === 'credit' ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
