import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, MessageSquare, Star, CreditCard } from 'lucide-react';
import { cn } from '@/utils/cn';

const notifications = [
  { id: '1', type: 'order' as const, title: 'New Order Request', body: 'Amit Kumar wants a Family Portrait Painting', timestamp: '2 min ago', read: false },
  { id: '2', type: 'message' as const, title: 'New Message', body: 'Priya Sharma sent you a message', timestamp: '15 min ago', read: false },
  { id: '3', type: 'payment' as const, title: 'Payment Received', body: '₹1,500 received for Pet Dog Sketch', timestamp: '1 hour ago', read: false },
  { id: '4', type: 'review' as const, title: 'New Review', body: 'Sneha Gupta left a 5-star review', timestamp: '3 hours ago', read: true },
  { id: '5', type: 'order' as const, title: 'Order Completed', body: 'Mandala painting marked complete', timestamp: 'Yesterday', read: true },
  { id: '6', type: 'message' as const, title: 'New Message', body: 'Karthik Nair shared an update', timestamp: 'Yesterday', read: true },
  { id: '7', type: 'payment' as const, title: 'Payout Processed', body: '₹15,000 sent to your bank', timestamp: '2 days ago', read: true },
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
    <div className="h-full flex flex-col bg-stone-50">
      <div className="bg-white px-5 pt-3 pb-3 shadow-sm shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center">
            <ArrowLeft size={18} className="text-stone-600" />
          </button>
          <h1 className="text-base font-bold text-stone-800">Notifications</h1>
          <button className="ml-auto text-[11px] text-amber-600 font-semibold">Mark all read</button>
        </div>
      </div>

      <div className="flex-1 native-scroll px-5">
        {notifications.map(notif => {
          const { Icon, bg, color } = iconMap[notif.type];
          return (
            <div key={notif.id}
              className={cn('flex items-start gap-3 py-3 border-b border-stone-100 last:border-0', !notif.read && 'bg-amber-50/50 -mx-5 px-5 rounded-lg')}>
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', bg)}>
                <Icon size={16} className={color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className={cn('text-xs', !notif.read ? 'font-bold text-stone-800' : 'font-medium text-stone-700')}>{notif.title}</h3>
                  {!notif.read && <div className="w-1.5 h-1.5 bg-amber-600 rounded-full shrink-0" />}
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">{notif.body}</p>
                <p className="text-[9px] text-stone-400 mt-0.5">{notif.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
