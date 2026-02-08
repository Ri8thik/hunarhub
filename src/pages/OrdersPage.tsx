import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar } from '@/components/Avatar';
import { cn } from '@/utils/cn';
import { type OrderStatus } from '@/types';

type FilterTab = 'all' | OrderStatus;

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'requested', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'in_progress', label: 'Active' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Done' },
];

export function OrdersPage() {
  const navigate = useNavigate();
  const { orders, userRole, currentUserId } = useApp();
  const [filter, setFilter] = useState<FilterTab>('all');

  const myOrders = orders.filter(o =>
    userRole === 'customer' ? o.customerId === currentUserId : o.artistId === currentUserId
  );
  const filtered = filter === 'all' ? myOrders : myOrders.filter(o => o.status === filter);

  return (
    <div className="h-full flex flex-col bg-stone-50">
      <div className="bg-white px-5 pt-3 pb-2 shadow-sm shrink-0 z-40">
        <h1 className="text-lg font-bold text-stone-800 mb-2">
          {userRole === 'customer' ? 'My Orders' : 'Order Requests'}
        </h1>
        <div className="flex gap-1.5 overflow-x-auto -mx-5 px-5 scrollbar-hide pb-1">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={cn('px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0',
                filter === tab.key ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-500')}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 native-scroll px-5 pt-3 pb-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl">📋</span>
            <h3 className="text-base font-semibold text-stone-700 mt-3">No orders yet</h3>
            <p className="text-xs text-stone-400 mt-1">
              {userRole === 'customer' ? 'Browse artists and submit your first request!' : 'Orders from customers will appear here.'}
            </p>
            {userRole === 'customer' && (
              <button onClick={() => navigate('/explore')}
                className="mt-3 px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-medium">
                Explore Artists
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map(order => (
              <button key={order.id} onClick={() => navigate(`/order/${order.id}`)}
                className="w-full bg-white rounded-2xl p-3.5 shadow-sm active:scale-[0.98] transition-transform text-left">
                <div className="flex items-start gap-3">
                  <Avatar name={userRole === 'customer' ? order.artistName : order.customerName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-stone-800 text-sm truncate">{order.title}</h3>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {userRole === 'customer' ? order.artistName : order.customerName}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1.5 line-clamp-2">{order.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-semibold text-amber-700">₹{order.budget.toLocaleString('en-IN')}</span>
                      <span className="text-[9px] text-stone-300">•</span>
                      <span className="text-[11px] text-stone-400">{order.category}</span>
                      <span className="text-[9px] text-stone-300">•</span>
                      <span className="text-[11px] text-stone-400">Due: {order.deadline}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
