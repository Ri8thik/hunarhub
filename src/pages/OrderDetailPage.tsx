import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Calendar, IndianRupee, Clock, CheckCircle2, XCircle, Truck, Package, Loader2, Send } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/StatusBadge';
import { StarRating } from '@/components/StarRating';
import { Avatar } from '@/components/Avatar';
import { cn } from '@/utils/cn';
import { type OrderStatus, type Order } from '@/types';
import { getOrderById, addReview, getArtistReviews, updateArtistRating } from '@/services/firestoreService';

/** Safely format any date value — handles Firestore Timestamps, Date objects, and strings */
function formatDate(value: unknown): string {
  if (!value) return '—';
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    return new Date((value as { seconds: number }).seconds * 1000)
      .toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  if (value instanceof Date) {
    return value.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return String(value);
}

/** Safely format currency */
function formatBudget(budget: unknown): string {
  const num = Number(budget);
  return isNaN(num) ? '—' : num.toLocaleString('en-IN');
}

const statusSteps: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: 'requested',   label: 'Requested',   icon: Clock },
  { status: 'accepted',    label: 'Accepted',    icon: CheckCircle2 },
  { status: 'in_progress', label: 'In Progress', icon: Package },
  { status: 'delivered',   label: 'Delivered',   icon: Truck },
  { status: 'completed',   label: 'Completed',   icon: CheckCircle2 },
];

const statusOrder: OrderStatus[] = ['requested', 'accepted', 'in_progress', 'delivered', 'completed'];

export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, userRole, updateOrderStatus, ordersLoading, currentUserId, currentUserName } = useApp();

  const [showReview, setShowReview]         = useState(false);
  const [reviewRating, setReviewRating]     = useState(5);
  const [reviewText, setReviewText]         = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError]       = useState('');

  // Fallback: fetch directly from Firestore if not yet in context
  const [fetchedOrder, setFetchedOrder]     = useState<Order | null>(null);
  const [fetching, setFetching]             = useState(false);
  const [fetchFailed, setFetchFailed]       = useState(false);

  const orderFromContext = orders.find(o => o.id === id);

  useEffect(() => {
    if (orderFromContext) return;   // already in context
    if (ordersLoading) return;      // wait for context to finish loading
    if (!id) return;

    setFetching(true);
    setFetchFailed(false);
    getOrderById(id)
      .then(data => { if (data) setFetchedOrder(data); else setFetchFailed(true); })
      .catch(() => setFetchFailed(true))
      .finally(() => setFetching(false));
  }, [id, orderFromContext, ordersLoading]);

  const order = orderFromContext ?? fetchedOrder;

  // ── Submit review: save to DB + recalculate artist rating ──
  const handleSubmitReview = async () => {
    if (!reviewText.trim()) { setReviewError('Please write a review comment.'); return; }
    if (!order || !currentUserId) return;

    setSubmittingReview(true);
    setReviewError('');
    try {
      // 1. Save the review document
      await addReview({
        artistId: order.artistId,
        customerId: currentUserId,
        customerName: currentUserName || 'Customer',
        rating: reviewRating,
        comment: reviewText.trim(),
        createdAt: new Date().toISOString().split('T')[0],
      });

      // 2. Fetch ALL reviews for this artist and recompute average rating
      const allReviews = await getArtistReviews(order.artistId);
      await updateArtistRating(order.artistId, allReviews);

      setReviewSubmitted(true);
    } catch (err: unknown) {
      console.error('Error submitting review:', err);
      const msg = err instanceof Error ? err.message : 'Failed to submit review. Please try again.';
      setReviewError(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (ordersLoading || fetching) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600 mx-auto mb-3" />
          <p className="text-stone-500 dark:text-gray-400 text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order || fetchFailed) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-950 gap-4">
        <span className="text-4xl">📋</span>
        <p className="text-stone-500 dark:text-gray-400 font-medium">Order not found</p>
        <button onClick={() => navigate('/orders')}
          className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors">
          Back to Orders
        </button>
      </div>
    );
  }

  const currentStep = statusOrder.indexOf(order.status);
  const budget = Number(order.budget) || 0;

  const getNextAction = () => {
    if (userRole === 'artist') {
      if (order.status === 'requested')   return { label: 'Accept Request',     action: () => updateOrderStatus(order.id, 'accepted') };
      if (order.status === 'accepted')    return { label: 'Start Working',      action: () => updateOrderStatus(order.id, 'in_progress') };
      if (order.status === 'in_progress') return { label: 'Mark as Delivered',  action: () => updateOrderStatus(order.id, 'delivered') };
    }
    if (userRole === 'customer') {
      if (order.status === 'delivered')   return { label: 'Confirm & Complete', action: () => { updateOrderStatus(order.id, 'completed'); setShowReview(true); } };
    }
    return null;
  };

  const nextAction = getNextAction();

  return (
    <div className="p-4 lg:p-8 mx-auto animate-fade-in bg-gray-50 dark:bg-gray-950 min-h-full">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-500 dark:text-gray-400 hover:text-stone-700 dark:hover:text-gray-200 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-stone-800 dark:text-gray-100 truncate">{order.title}</h1>
          <p className="text-xs text-stone-400 dark:text-gray-500">Order #{order.id}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Main Content ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Progress Tracker */}
          {order.status !== 'rejected' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-gray-700">
              <h3 className="font-semibold text-stone-800 dark:text-gray-100 mb-4">Order Progress</h3>
              <div className="flex items-center justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-stone-200 dark:bg-gray-700" />
                <div className="absolute top-4 left-0 h-0.5 bg-amber-600 transition-all"
                  style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }} />
                {statusSteps.map((step, i) => {
                  const isCompleted = i <= currentStep;
                  const isCurrent   = i === currentStep;
                  const Icon = step.icon;
                  return (
                    <div key={step.status} className="relative flex flex-col items-center z-10">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                        isCompleted ? 'bg-amber-600 text-white shadow-md' : 'bg-stone-200 dark:bg-gray-700 text-stone-400 dark:text-gray-500'
                      )}>
                        <Icon size={14} />
                      </div>
                      <span className={cn(
                        'text-[10px] mt-2 font-medium text-center whitespace-nowrap',
                        isCurrent ? 'text-amber-700 dark:text-amber-400' : isCompleted ? 'text-stone-700 dark:text-gray-300' : 'text-stone-400 dark:text-gray-600'
                      )}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rejected Banner */}
          {order.status === 'rejected' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
              <XCircle size={40} className="text-red-400 mx-auto" />
              <p className="text-lg font-semibold text-red-700 dark:text-red-400 mt-3">Order Rejected</p>
              <p className="text-sm text-red-500 dark:text-red-400 mt-1">The artist has declined this request</p>
            </div>
          )}

          {/* Order Details */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-gray-700">
            <h3 className="font-semibold text-stone-800 dark:text-gray-100 mb-3">Order Details</h3>
            <p className="text-sm text-stone-600 dark:text-gray-400 leading-relaxed mb-4">{order.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: IndianRupee, label: 'Budget',   value: `₹${formatBudget(order.budget)}`, highlight: true },
                { icon: Calendar,    label: 'Deadline', value: formatDate(order.deadline),        highlight: false },
                { icon: Clock,       label: 'Created',  value: formatDate(order.createdAt),       highlight: false },
              ].map((item) => (
                <div key={item.label} className="bg-stone-50 dark:bg-gray-800 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-stone-400 dark:text-gray-500 mb-1">
                    <item.icon size={14} />
                    <span className="text-xs">{item.label}</span>
                  </div>
                  <span className={cn('text-sm font-semibold',
                    item.highlight ? 'text-amber-700 dark:text-amber-400' : 'text-stone-700 dark:text-gray-200')}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reference Images */}
          {order.referenceImages && order.referenceImages.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-gray-700">
              <h3 className="font-semibold text-stone-800 dark:text-gray-100 mb-3">Reference Images</h3>
              <div className="grid grid-cols-3 gap-3">
                {order.referenceImages.map((img, i) => (
                  <img key={i} src={img} alt={`Reference ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-xl border border-stone-100 dark:border-gray-700" />
                ))}
              </div>
            </div>
          )}

          {/* ── Review Form ── */}
          {showReview && !reviewSubmitted && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-gray-700 animate-fade-in-up">
              <h3 className="font-semibold text-stone-800 dark:text-gray-100 mb-1">⭐ Rate Your Experience</h3>
              <p className="text-xs text-stone-400 dark:text-gray-500 mb-4">Your review helps others find great artists</p>

              {/* Star Rating */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-stone-600 dark:text-gray-400">Rating:</span>
                <StarRating rating={reviewRating} size={28} showValue={false} interactive onChange={setReviewRating} />
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {reviewRating === 1 ? 'Poor' : reviewRating === 2 ? 'Fair' : reviewRating === 3 ? 'Good' : reviewRating === 4 ? 'Very Good' : 'Excellent'}
                </span>
              </div>

              {/* Comment */}
              <textarea
                placeholder="Share your experience with this artist — what did they do well? How was the quality?"
                value={reviewText}
                onChange={e => { setReviewText(e.target.value); setReviewError(''); }}
                rows={4}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-gray-800 text-stone-800 dark:text-gray-100 dark:placeholder-gray-500 border border-stone-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />

              {/* Error */}
              {reviewError && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">{reviewError}</p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || !reviewText.trim()}
                className="w-full mt-3 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview
                  ? <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                  : <><Send size={16} /> Submit Review</>}
              </button>
            </div>
          )}

          {/* Review Success */}
          {reviewSubmitted && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center">
              <span className="text-3xl">🌟</span>
              <p className="text-lg font-semibold text-green-700 dark:text-green-400 mt-2">Thank you for your review!</p>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">

          {/* Contact Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-gray-700">
            <p className="text-xs text-stone-400 dark:text-gray-500 mb-2">{userRole === 'customer' ? 'Artist' : 'Customer'}</p>
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={userRole === 'customer' ? (order.artistName || 'Artist') : (order.customerName || 'Customer')} size="lg" />
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-gray-100">
                  {userRole === 'customer' ? (order.artistName || 'Artist') : (order.customerName || 'Customer')}
                </h3>
                <p className="text-xs text-stone-400 dark:text-gray-500">{order.category}</p>
              </div>
            </div>
            {/* <button onClick={() => navigate('/chat')}
              className="w-full py-2.5 border-2 border-amber-600 text-amber-600 dark:text-amber-400 dark:border-amber-500 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
              <MessageSquare size={16} /> Send Message
            </button> */}
          </div>

          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-5 border border-amber-100 dark:border-amber-800">
            <h3 className="font-semibold text-stone-800 dark:text-gray-100 mb-3">💳 Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-stone-500 dark:text-gray-400">Amount</span>
                <span className="text-sm text-stone-700 dark:text-gray-200">₹{formatBudget(order.budget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-stone-500 dark:text-gray-400">Platform Fee (5%)</span>
                <span className="text-sm text-stone-700 dark:text-gray-200">₹{Math.round(budget * 0.05).toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-amber-200 dark:border-amber-700 pt-2">
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-stone-800 dark:text-gray-100">Total</span>
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-400">₹{Math.round(budget * 1.05).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-3">🔒 Escrow protected — Payment held until delivery</p>
          </div>

          {/* Action Buttons */}
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
                  className="w-full py-3 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  Reject Request
                </button>
              )}
            </div>
          )}

          {/* Show review prompt if completed and not yet reviewed */}
          {order.status === 'completed' && userRole === 'customer' && !showReview && !reviewSubmitted && (
            <button
              onClick={() => setShowReview(true)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all">
              ⭐ Leave a Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
}