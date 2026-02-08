import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Calendar, IndianRupee, FileText } from 'lucide-react';
import { artists, categories } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/Avatar';

export function RequestPage() {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { addOrder, currentUserId, currentUserName } = useApp();
  const artist = artists.find(a => a.id === artistId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!artist) {
    return <div className="h-full flex items-center justify-center"><p className="text-stone-500">Artist not found</p></div>;
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
      <div className="h-full bg-stone-50 flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce-in">
          <span className="text-3xl">🎉</span>
        </div>
        <h1 className="text-xl font-bold text-stone-800 text-center">Request Submitted!</h1>
        <p className="text-stone-500 text-xs text-center mt-1.5 max-w-[260px]">
          Sent to {artist.name}. They will respond soon!
        </p>
        <div className="mt-6 space-y-2.5 w-full max-w-[260px]">
          <button onClick={() => navigate('/orders')}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold text-sm">
            View My Orders
          </button>
          <button onClick={() => navigate('/')}
            className="w-full py-3 bg-stone-100 text-stone-700 rounded-xl font-semibold text-sm">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-stone-50">
      <div className="bg-white px-5 pt-3 pb-3 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center">
            <ArrowLeft size={18} className="text-stone-600" />
          </button>
          <h1 className="text-base font-bold text-stone-800">Request Custom Art</h1>
        </div>
      </div>

      <div className="flex-1 native-scroll px-5 py-3">
        <div className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3 mb-3">
          <Avatar name={artist.name} size="md" />
          <div>
            <h3 className="font-semibold text-stone-800 text-sm">{artist.name}</h3>
            <p className="text-[10px] text-stone-500">{artist.skills.join(' • ')}</p>
            <p className="text-[10px] text-amber-600 font-medium">₹{artist.priceRange.min} - ₹{artist.priceRange.max}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pb-4">
          <div>
            <label className="text-xs font-semibold text-stone-700 mb-1 block">
              <FileText size={12} className="inline mr-1" /> Title *
            </label>
            <input type="text" placeholder="e.g., Family Portrait" value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 mb-1 block">Category *</label>
            <div className="flex gap-1.5 flex-wrap">
              {categories.slice(0, 6).map(cat => (
                <button key={cat.id} type="button" onClick={() => setCategory(cat.name)}
                  className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium ${category === cat.name ? 'bg-amber-600 text-white' : 'bg-white border border-stone-200 text-stone-600'}`}>
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 mb-1 block">Description *</label>
            <textarea placeholder="Describe what you want..." value={description} onChange={e => setDescription(e.target.value)} required rows={3}
              className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 mb-1 block">
              <Upload size={12} className="inline mr-1" /> Reference Images
            </label>
            <button type="button" className="w-full py-6 border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center gap-1 text-stone-400">
              <Upload size={20} />
              <span className="text-xs font-medium">Tap to upload</span>
              <span className="text-[10px]">JPG, PNG up to 10MB</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-semibold text-stone-700 mb-1 block">
                <IndianRupee size={12} className="inline mr-0.5" /> Budget *
              </label>
              <input type="number" placeholder="5000" value={budget} onChange={e => setBudget(e.target.value)} required
                className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 mb-1 block">
                <Calendar size={12} className="inline mr-0.5" /> Deadline *
              </label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required
                className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 leading-relaxed">
            💡 <strong>Tip:</strong> Be detailed — style, size, colors, special elements.
          </div>

          <button type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-amber-200 active:scale-[0.97] transition-transform">
            Submit Request 🎨
          </button>
        </form>
      </div>
    </div>
  );
}
