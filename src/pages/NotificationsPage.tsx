import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, MessageSquare, Star, CreditCard, Loader2 } from 'lucide-react';
import { getNotifications } from '@/services/firestoreService';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';

interface NotificationItem {
  id: string;
  type: 'order' | 'message' | 'review' | 'payment';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

const iconMap = {
  order: { Icon: ShoppingBag, bg: 'bg-blue-100', color: 'text-blue-600' },
  message: { Icon: MessageSquare, bg: 'bg-green-100', color: 'text-green-600' },
  review: { Icon: Star, bg: 'bg-amber-100', color: 'text-amber-600' },
  payment: { Icon: CreditCard, bg: 'bg-purple-100', color: 'text-purple-600' },
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { currentUserId } = useApp();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      try {
        const data = await getNotifications(currentUserId);
        const mapped: NotificationItem[] = data.map((d) => {
          const raw = d as unknown as Record<string, unknown>;
          return {
            id: (raw.id as string) || '',
            type: (raw.type as NotificationItem['type']) || 'order',
            title: (raw.title as string) || '',
            body: (raw.body as string) || (raw.message as string) || '',
            timestamp: (raw.timestamp as string) || (raw.createdAt as string) || '',
            read: (raw.read as boolean) || false,
          };
        });
        setNotifications(mapped);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, [currentUserId]);

  return (
    <div className="p-4 lg:p-8  mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-xl font-bold text-stone-800 flex-1">Notifications</h1>
        {notifications.length > 0 && (
          <button className="text-sm text-amber-600 font-semibold hover:underline">Mark all as read</button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-amber-600" />
          <span className="ml-3 text-stone-500">Loading notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
          <span className="text-5xl">🔔</span>
          <h3 className="text-lg font-semibold text-stone-700 mt-4">No notifications yet</h3>
          <p className="text-sm text-stone-400 mt-1">You'll see order updates, messages, and reviews here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden divide-y divide-stone-100">
          {notifications.map(notif => {
            const typeKey = notif.type in iconMap ? notif.type : 'order';
            const { Icon, bg, color } = iconMap[typeKey];
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
      )}
    </div>
  );
}
