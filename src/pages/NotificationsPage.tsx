import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, MessageSquare, Star, CreditCard } from 'lucide-react';
import { cn } from '@/utils/cn';

const notifications = [
  { id: '1', type: 'order' as const, title: 'New Order Request', body: 'Amit Kumar wants a Family Portrait Painting', timestamp: '2 min ago', read: false },
  { id: '2', type: 'message' as const, title: 'New Message', body: 'Priya Sharma sent you a message about your sketch order', timestamp: '15 min ago', read: false },
  { id: '3', type: 'payment' as const, title: 'Payment Received', body: '₹1,500 received for Pet Dog Sketch order', timestamp: '1 hour ago', read: false },
  { id: '4', type: 'review' as const, title: 'New Review', body: 'Sneha Gupta left a 5-star review on your portrait', timestamp: '3 hours ago', read: true },
  { id: '5', type: 'order' as const, title: 'Order Completed', body: 'Mandala painting order has been marked complete', timestamp: 'Yesterday', read: true },
  { id: '6', type: 'message' as const, title: 'New Message', body: 'Karthik Nair shared a progress update on your sculpture', timestamp: 'Yesterday', read: true },
  { id: '7', type: 'payment' as const, title: 'Payout Processed', body: '₹15,000 has been sent to your bank account', timestamp: '2 days ago', read: true },
];

const iconMap = {
  order: { Icon: ShoppingBag, bg: 'bg-blue-100', color: 'text-blue-600' },
  message: { Icon: MessageSquare, bg: 'bg-green-100', color: 'text-green-600' },
  review: { Icon: Star, bg: 'bg-amber-100', color: 'text-amber-600' },
  payment: { Icon: CreditCard, bg: 'bg-purple-100', color: 'text-purple-600' },
};

export function NotificationsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-xl font-bold text-stone-800 flex-1">Notifications</h1>
        <button className="text-sm text-amber-600 font-semibold hover:underline">Mark all as read</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden divide-y divide-stone-100">
        {notifications.map(notif => {
          const { Icon, bg, color } = iconMap[notif.type];
          return (
            <div key={notif.id}
              className={cn('flex items-start gap-4 px-5 py-4 hover:bg-stone-50 transition-colors cursor-pointer', !notif.read && 'bg-amber-50/50')}>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bg)}>
                <Icon size={18} className={color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={cn('text-sm', !notif.read ? 'font-bold text-stone-800' : 'font-medium text-stone-700')}>{notif.title}</h3>
                  {!notif.read && <div className="w-2 h-2 bg-amber-600 rounded-full shrink-0" />}
                </div>
                <p className="text-sm text-stone-500 mt-0.5">{notif.body}</p>
                <p className="text-xs text-stone-400 mt-1">{notif.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
