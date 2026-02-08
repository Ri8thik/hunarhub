import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar } from '@/components/Avatar';
import { cn } from '@/utils/cn';
import { type OrderStatus } from '@/types';

type FilterTab = 'all' | OrderStatus;

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All Orders' },
  { key: 'requested', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' },
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
    <div className="p-4 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-xl lg:text-2xl font-bold text-stone-800 mb-4">
        {userRole === 'customer' ? 'My Orders' : 'Order Requests'}
      </h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-4">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all',
              filter === tab.key ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-stone-500 border border-stone-200 hover:border-amber-300'
            )}>
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
          <span className="text-5xl">📋</span>
          <h3 className="text-lg font-semibold text-stone-700 mt-4">No orders yet</h3>
          <p className="text-sm text-stone-400 mt-1">
            {userRole === 'customer' ? 'Browse artists and submit your first request!' : 'Orders from customers will appear here.'}
          </p>
          {userRole === 'customer' && (
            <button onClick={() => navigate('/explore')}
              className="mt-4 px-6 py-3 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
              Explore Artists
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(order => (
            <button key={order.id} onClick={() => navigate(`/order/${order.id}`)}
              className="bg-white rounded-2xl p-5 shadow-sm hover-lift border border-stone-100 text-left">
              <div className="flex items-start gap-3">
                <Avatar name={userRole === 'customer' ? order.artistName : order.customerName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-stone-800 truncate">{order.title}</h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {userRole === 'customer' ? `Artist: ${order.artistName}` : `Customer: ${order.customerName}`}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-stone-400 mt-2 line-clamp-2">{order.description}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-sm font-semibold text-amber-700">₹{order.budget.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-stone-300">•</span>
                    <span className="text-xs text-stone-500">{order.category}</span>
                    <span className="text-xs text-stone-300">•</span>
                    <span className="text-xs text-stone-500">Due: {order.deadline}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
