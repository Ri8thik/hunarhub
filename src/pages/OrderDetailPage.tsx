import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Calendar, IndianRupee, Clock, CheckCircle2, XCircle, Truck, Package } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/StatusBadge';
import { StarRating } from '@/components/StarRating';
import { Avatar } from '@/components/Avatar';
import { cn } from '@/utils/cn';
import { type OrderStatus } from '@/types';

const statusSteps: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: 'requested', label: 'Requested', icon: Clock },
  { status: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { status: 'in_progress', label: 'In Progress', icon: Package },
  { status: 'delivered', label: 'Delivered', icon: Truck },
  { status: 'completed', label: 'Completed', icon: CheckCircle2 },
];

const statusOrder: OrderStatus[] = ['requested', 'accepted', 'in_progress', 'delivered', 'completed'];

export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, userRole, updateOrderStatus } = useApp();
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const order = orders.find(o => o.id === id);
  if (!order) {
    return <div className="h-full flex items-center justify-center bg-stone-50"><p className="text-stone-500">Order not found</p></div>;
  }

  const currentStep = statusOrder.indexOf(order.status);

  const getNextAction = () => {
    if (userRole === 'artist') {
      if (order.status === 'requested') return { label: 'Accept Request', action: () => updateOrderStatus(order.id, 'accepted') };
      if (order.status === 'accepted') return { label: 'Start Working', action: () => updateOrderStatus(order.id, 'in_progress') };
      if (order.status === 'in_progress') return { label: 'Mark Delivered', action: () => updateOrderStatus(order.id, 'delivered') };
    }
    if (userRole === 'customer') {
      if (order.status === 'delivered') return { label: 'Mark Complete', action: () => { updateOrderStatus(order.id, 'completed'); setShowReview(true); } };
    }
    return null;
  };

  const nextAction = getNextAction();

  return (
    <div className="h-full flex flex-col bg-stone-50">
      <div className="bg-white px-5 pt-3 pb-3 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center">
            <ArrowLeft size={18} className="text-stone-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-stone-800 truncate">{order.title}</h1>
            <p className="text-[10px] text-stone-400">#{order.id}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="flex-1 native-scroll px-5 py-3 space-y-3">
        {order.status !== 'rejected' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-stone-800 text-xs mb-3">Order Progress</h3>
            {statusSteps.map((step, i) => {
              const isCompleted = i <= currentStep;
              const isCurrent = i === currentStep;
              const Icon = step.icon;
              return (
                <div key={step.status} className="flex items-start gap-2.5 mb-4 last:mb-0">
                  <div className="relative flex flex-col items-center">
                    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center z-10', isCompleted ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-400')}>
                      <Icon size={14} />
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className={cn('absolute top-7 w-0.5 h-4', i < currentStep ? 'bg-amber-600' : 'bg-stone-200')} />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p className={cn('text-xs font-medium', isCurrent ? 'text-amber-700' : isCompleted ? 'text-stone-700' : 'text-stone-400')}>
                      {step.label}
                    </p>
                    {isCurrent && <p className="text-[10px] text-stone-400">Current</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {order.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <XCircle size={32} className="text-red-400 mx-auto" />
            <p className="text-sm font-semibold text-red-700 mt-2">Order Rejected</p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
          <Avatar name={userRole === 'customer' ? order.artistName : order.customerName} size="md" />
          <div className="flex-1">
            <p className="text-[10px] text-stone-400">{userRole === 'customer' ? 'Artist' : 'Customer'}</p>
            <h3 className="font-semibold text-stone-800 text-sm">{userRole === 'customer' ? order.artistName : order.customerName}</h3>
          </div>
          <button onClick={() => navigate('/chat')} className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
            <MessageSquare size={16} className="text-amber-700" />
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-stone-800 text-xs mb-2">Details</h3>
          <p className="text-xs text-stone-600 leading-relaxed mb-3">{order.description}</p>
          <div className="space-y-2">
            {[
              { icon: IndianRupee, label: 'Budget', value: `₹${order.budget.toLocaleString('en-IN')}`, highlight: true },
              { icon: Calendar, label: 'Deadline', value: order.deadline },
              { icon: Clock, label: 'Created', value: order.createdAt },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-stone-500">
                  <item.icon size={13} />
                  <span className="text-xs">{item.label}</span>
                </div>
                <span className={cn('text-xs font-medium', item.highlight ? 'text-amber-700 font-semibold' : 'text-stone-700')}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
          <h3 className="font-semibold text-stone-800 text-xs mb-2">💳 Payment</h3>
          <div className="space-y-1.5">
            <div className="flex justify-between"><span className="text-xs text-stone-500">Amount</span><span className="text-xs text-stone-700">₹{order.budget.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-xs text-stone-500">Fee (5%)</span><span className="text-xs text-stone-700">₹{Math.round(order.budget * 0.05).toLocaleString('en-IN')}</span></div>
            <div className="border-t border-amber-200 pt-1.5">
              <div className="flex justify-between"><span className="text-xs font-semibold text-stone-800">Total</span><span className="text-xs font-bold text-amber-700">₹{Math.round(order.budget * 1.05).toLocaleString('en-IN')}</span></div>
            </div>
          </div>
          <p className="text-[10px] text-amber-700 mt-2">🔒 Escrow protected</p>
        </div>

        {showReview && !reviewSubmitted && (
          <div className="bg-white rounded-2xl p-4 shadow-sm animate-fade-in-up">
            <h3 className="font-semibold text-stone-800 text-xs mb-2">⭐ Leave a Review</h3>
            <div className="flex justify-center mb-2">
              <StarRating rating={reviewRating} size={24} showValue={false} interactive onChange={setReviewRating} />
            </div>
            <textarea placeholder="Share your experience..." value={reviewText} onChange={e => setReviewText(e.target.value)} rows={3}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
            <button onClick={() => setReviewSubmitted(true)}
              className="w-full mt-2 py-3 bg-amber-600 text-white rounded-xl font-semibold text-sm">
              Submit Review
            </button>
          </div>
        )}

        {reviewSubmitted && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <span className="text-2xl">🌟</span>
            <p className="text-sm font-semibold text-green-700 mt-1">Thank you for your review!</p>
          </div>
        )}
      </div>

      {order.status !== 'rejected' && order.status !== 'completed' && (
        <div className="bg-white border-t border-stone-200 p-3 flex gap-2 shrink-0">
          {userRole === 'artist' && order.status === 'requested' && (
            <button onClick={() => updateOrderStatus(order.id, 'rejected')}
              className="px-4 py-2.5 border-2 border-red-300 text-red-600 rounded-xl font-semibold text-sm">
              Reject
            </button>
          )}
          {nextAction && (
            <button onClick={nextAction.action}
              className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-amber-200 active:scale-[0.97] transition-transform">
              {nextAction.label}
            </button>
          )}
          <button onClick={() => navigate('/chat')}
            className="w-11 h-11 border-2 border-amber-600 rounded-xl flex items-center justify-center text-amber-600">
            <MessageSquare size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
