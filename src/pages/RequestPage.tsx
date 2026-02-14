import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Calendar, IndianRupee, FileText, Loader2 } from 'lucide-react';
import { getArtistById } from '@/services/firestoreService';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/Avatar';
import { type Artist } from '@/types';

export function RequestPage() {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { addOrder, currentUserId, currentUserName, categories } = useApp();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchArtist() {
      if (!artistId) return;
      setLoading(true);
      try {
        const data = await getArtistById(artistId);
        setArtist(data);
      } catch (error) {
        console.error('Error fetching artist:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchArtist();
  }, [artistId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-amber-600" />
      </div>
    );
  }

  if (!artist) {
    return <div className="flex items-center justify-center h-64"><p className="text-stone-500">Artist not found</p></div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOrder({
      id: `o${Date.now()}`, customerId: currentUserId, customerName: currentUserName,
      artistId: artist.id, artistName: artist.name, title, description,
      referenceImages: [], budget: Number(budget), deadline,
      status: 'requested', createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0], category,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
            <span className="text-4xl">🎉</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-800">Request Submitted!</h1>
          <p className="text-stone-500 mt-2 max-w-sm mx-auto">
            Your custom art request has been sent to {artist.name}. They will respond soon!
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <button onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
              View My Orders
            </button>
            <button onClick={() => navigate('/')}
              className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-semibold text-sm hover:bg-stone-200 transition-colors">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-4 transition-colors">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      <h1 className="text-xl lg:text-2xl font-bold text-stone-800 mb-6">Request Custom Art</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Artist Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 sticky top-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={artist.name} size="lg" />
              <div>
                <h3 className="font-semibold text-stone-800">{artist.name}</h3>
                <p className="text-xs text-stone-500">{artist.location}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Skills</span>
                <span className="text-stone-700 font-medium">{artist.skills.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Price range</span>
                <span className="text-amber-700 font-semibold">₹{artist.priceRange.min} - ₹{artist.priceRange.max}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Rating</span>
                <span className="text-stone-700 font-medium">⭐ {artist.rating} ({artist.reviewCount})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Response</span>
                <span className="text-stone-700 font-medium">{artist.responseTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 space-y-5">
              <div>
                <label className="text-sm font-semibold text-stone-700 mb-2 block flex items-center gap-1">
                  <FileText size={14} /> Title *
                </label>
                <input type="text" placeholder="e.g., Family Portrait, Wedding Invitation..." value={title} onChange={e => setTitle(e.target.value)} required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400" />
              </div>

              <div>
                <label className="text-sm font-semibold text-stone-700 mb-2 block">Category *</label>
                <div className="flex gap-2 flex-wrap">
                  {categories.slice(0, 8).map(cat => (
                    <button key={cat.id} type="button" onClick={() => setCategory(cat.name)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${category === cat.name ? 'bg-amber-600 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-stone-700 mb-2 block">Description *</label>
                <textarea placeholder="Describe what you want in detail — style, size, colors, special elements..." value={description} onChange={e => setDescription(e.target.value)} required rows={4}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400 resize-none" />
              </div>

              <div>
                <label className="text-sm font-semibold text-stone-700 mb-2 block flex items-center gap-1">
                  <Upload size={14} /> Reference Images (optional)
                </label>
                <button type="button" className="w-full py-8 border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center gap-2 text-stone-400 hover:border-amber-400 hover:text-amber-600 transition-colors">
                  <Upload size={24} />
                  <span className="text-sm font-medium">Click to upload reference images</span>
                  <span className="text-xs">JPG, PNG up to 10MB each</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-stone-700 mb-2 block flex items-center gap-1">
                    <IndianRupee size={14} /> Budget (₹) *
                  </label>
                  <input type="number" placeholder="5000" value={budget} onChange={e => setBudget(e.target.value)} required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-stone-700 mb-2 block flex items-center gap-1">
                    <Calendar size={14} /> Deadline *
                  </label>
                  <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400" />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              💡 <strong>Tip:</strong> The more details you provide, the better the artist can understand your vision. Include preferred style, dimensions, color preferences, and any special elements you want.
            </div>

            <button type="submit"
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-200/60 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              🎨 Submit Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
