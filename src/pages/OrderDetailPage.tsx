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
    return <div className="flex items-center justify-center h-64"><p className="text-stone-500">Order not found</p></div>;
  }

  const currentStep = statusOrder.indexOf(order.status);

  const getNextAction = () => {
    if (userRole === 'artist') {
      if (order.status === 'requested') return { label: 'Accept Request', action: () => updateOrderStatus(order.id, 'accepted') };
      if (order.status === 'accepted') return { label: 'Start Working', action: () => updateOrderStatus(order.id, 'in_progress') };
      if (order.status === 'in_progress') return { label: 'Mark as Delivered', action: () => updateOrderStatus(order.id, 'delivered') };
    }
    if (userRole === 'customer') {
      if (order.status === 'delivered') return { label: 'Confirm & Complete', action: () => { updateOrderStatus(order.id, 'completed'); setShowReview(true); } };
    }
    return null;
  };

  const nextAction = getNextAction();

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-stone-800 truncate">{order.title}</h1>
          <p className="text-xs text-stone-400">Order #{order.id}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress Tracker */}
          {order.status !== 'rejected' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <h3 className="font-semibold text-stone-800 mb-4">Order Progress</h3>
              <div className="flex items-center justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-stone-200" />
                <div className="absolute top-4 left-0 h-0.5 bg-amber-600 transition-all" style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }} />
                {statusSteps.map((step, i) => {
                  const isCompleted = i <= currentStep;
                  const isCurrent = i === currentStep;
                  const Icon = step.icon;
                  return (
                    <div key={step.status} className="relative flex flex-col items-center z-10">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                        isCompleted ? 'bg-amber-600 text-white shadow-md' : 'bg-stone-200 text-stone-400'
                      )}>
                        <Icon size={14} />
                      </div>
                      <span className={cn(
                        'text-[10px] mt-2 font-medium text-center whitespace-nowrap',
                        isCurrent ? 'text-amber-700' : isCompleted ? 'text-stone-700' : 'text-stone-400'
                      )}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {order.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <XCircle size={40} className="text-red-400 mx-auto" />
              <p className="text-lg font-semibold text-red-700 mt-3">Order Rejected</p>
              <p className="text-sm text-red-500 mt-1">The artist has declined this request</p>
            </div>
          )}

          {/* Order Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <h3 className="font-semibold text-stone-800 mb-3">Order Details</h3>
            <p className="text-sm text-stone-600 leading-relaxed mb-4">{order.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: IndianRupee, label: 'Budget', value: `₹${order.budget.toLocaleString('en-IN')}`, highlight: true },
                { icon: Calendar, label: 'Deadline', value: order.deadline, highlight: false },
                { icon: Clock, label: 'Created', value: order.createdAt, highlight: false },
              ].map((item) => (
                <div key={item.label} className="bg-stone-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                    <item.icon size={14} />
                    <span className="text-xs">{item.label}</span>
                  </div>
                  <span className={cn('text-sm font-semibold', item.highlight ? 'text-amber-700' : 'text-stone-700')}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Section */}
          {showReview && !reviewSubmitted && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 animate-fade-in-up">
              <h3 className="font-semibold text-stone-800 mb-3">⭐ Leave a Review</h3>
              <div className="flex justify-center mb-3">
                <StarRating rating={reviewRating} size={28} showValue={false} interactive onChange={setReviewRating} />
              </div>
              <textarea placeholder="Share your experience..." value={reviewText} onChange={e => setReviewText(e.target.value)} rows={3}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
              <button onClick={() => setReviewSubmitted(true)}
                className="w-full mt-3 py-3 bg-amber-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
                Submit Review
              </button>
            </div>
          )}

          {reviewSubmitted && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <span className="text-3xl">🌟</span>
              <p className="text-lg font-semibold text-green-700 mt-2">Thank you for your review!</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
            <p className="text-xs text-stone-400 mb-2">{userRole === 'customer' ? 'Artist' : 'Customer'}</p>
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={userRole === 'customer' ? order.artistName : order.customerName} size="lg" />
              <div>
                <h3 className="font-semibold text-stone-800">{userRole === 'customer' ? order.artistName : order.customerName}</h3>
                <p className="text-xs text-stone-400">{order.category}</p>
              </div>
            </div>
            <button onClick={() => navigate('/chat')}
              className="w-full py-2.5 border-2 border-amber-600 text-amber-600 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-amber-50 transition-colors">
              <MessageSquare size={16} /> Send Message
            </button>
          </div>

          {/* Payment Info */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
            <h3 className="font-semibold text-stone-800 mb-3">💳 Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-sm text-stone-500">Amount</span><span className="text-sm text-stone-700">₹{order.budget.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-sm text-stone-500">Platform Fee (5%)</span><span className="text-sm text-stone-700">₹{Math.round(order.budget * 0.05).toLocaleString('en-IN')}</span></div>
              <div className="border-t border-amber-200 pt-2">
                <div className="flex justify-between"><span className="text-sm font-bold text-stone-800">Total</span><span className="text-sm font-bold text-amber-700">₹{Math.round(order.budget * 1.05).toLocaleString('en-IN')}</span></div>
              </div>
            </div>
            <p className="text-xs text-amber-700 mt-3">🔒 Escrow protected — Payment held until delivery</p>
          </div>

          {/* Actions */}
          {order.status !== 'rejected' && order.status !== 'completed' && (
            <div className="space-y-2">
              {nextAction && (
                <button onClick={nextAction.action}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  {nextAction.label}
                </button>
              )}
              {userRole === 'artist' && order.status === 'requested' && (
                <button onClick={() => updateOrderStatus(order.id, 'rejected')}
                  className="w-full py-3 border-2 border-red-300 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors">
                  Reject Request
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
