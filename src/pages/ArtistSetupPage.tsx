import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette, MapPin, IndianRupee, FileText, Plus, X, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';
import { isFirebaseConfigured } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

const availableSkills = [
  'Sketch', 'Portrait', 'Painting', 'Oil Painting', 'Watercolor',
  'Digital Art', 'Caricature', 'Mandala', 'Calligraphy',
  'Home Decor', 'Handmade Crafts', 'Sculpture', 'Pottery',
  'Embroidery', 'Mehndi Art', 'Rangoli', 'Wall Art',
  'Gift Items', 'Jewelry Making', 'Woodwork'
];

export function ArtistSetupPage() {
  const navigate = useNavigate();
  const { currentUserId, currentUserName, currentUserEmail, switchRole, refreshArtists } = useApp();

  const [displayName, setDisplayName] = useState(currentUserName || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [startingPrice, setStartingPrice] = useState('');
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const addPortfolioUrl = () => {
    setPortfolioUrls(prev => [...prev, '']);
  };

  const updatePortfolioUrl = (index: number, value: string) => {
    setPortfolioUrls(prev => prev.map((url, i) => i === index ? value : url));
  };

  const removePortfolioUrl = (index: number) => {
    setPortfolioUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!displayName.trim()) { setError('Please enter your display name'); return; }
    if (!bio.trim()) { setError('Please write a short bio about yourself'); return; }
    if (!location.trim()) { setError('Please enter your city/location'); return; }
    if (selectedSkills.length === 0) { setError('Please select at least one skill'); return; }
    if (!startingPrice || Number(startingPrice) <= 0) { setError('Please enter a valid starting price'); return; }

    setLoading(true);

    try {
      const portfolioImages = portfolioUrls.filter(url => url.trim() !== '');

      const artistProfile = {
        id: currentUserId,
        userId: currentUserId,
        name: displayName.trim(),
        email: currentUserEmail || '',
        bio: bio.trim(),
        location: location.trim(),
        skills: selectedSkills,
        priceRange: { min: Number(startingPrice), max: Number(startingPrice) * 3 },
        rating: 0,
        reviewCount: 0,
        completedOrders: 0,
        earnings: 0,
        portfolio: portfolioImages.length > 0 ? portfolioImages : [
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
        ],
        verified: false,
        available: true,
        joinedDate: new Date().toISOString().split('T')[0],
        responseTime: '< 24 hours',
        deliveryTime: '3-7 days',
        createdAt: new Date().toISOString(),
      };

      if (isFirebaseConfigured()) {
        // Save to Firestore artists collection
        await setDoc(doc(db!, 'artists', currentUserId), artistProfile);

        // Also update user document with isArtist flag
        await setDoc(doc(db!, 'users', currentUserId), {
          isArtist: true,
          artistProfileId: currentUserId,
        }, { merge: true });
      }

      // Switch role to artist
      switchRole('artist');

      // Refresh artists list
      await refreshArtists();

      setSuccess(true);

      // Navigate to profile after 2 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (err) {
      console.error('Error creating artist profile:', err);
      setError('Failed to create artist profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="text-center animate-scale-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Welcome, Artist! 🎨</h2>
          <p className="text-stone-500 mb-2">Your artist profile has been created successfully!</p>
          <p className="text-sm text-stone-400">Other customers can now find you and send custom art requests.</p>
          <div className="mt-6 flex items-center justify-center gap-2 text-amber-600">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Redirecting to your profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors">
          <ArrowLeft size={20} className="text-stone-600" />
        </button>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-stone-800">Become an Artist</h1>
          <p className="text-sm text-stone-400">Create your artist profile to start receiving orders</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-800 mb-1">What happens next?</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>✅ Your profile will be listed for customers to discover</li>
              <li>✅ Customers can send you custom art requests</li>
              <li>✅ You can accept/reject orders and chat with customers</li>
              <li>✅ You can switch between Customer & Artist mode anytime</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
            <span>❌</span> {error}
          </div>
        )}

        {/* Display Name */}
        <div>
          <label className="text-sm font-semibold text-stone-700 mb-2 block">
            <Palette size={16} className="inline mr-1.5 text-amber-600" />
            Display Name *
          </label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="How customers will see your name"
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="text-sm font-semibold text-stone-700 mb-2 block">
            <FileText size={16} className="inline mr-1.5 text-amber-600" />
            About You *
          </label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell customers about your art journey, experience, and what makes your work special..."
            rows={4}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
          <p className="text-xs text-stone-400 mt-1">{bio.length}/500 characters</p>
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-semibold text-stone-700 mb-2 block">
            <MapPin size={16} className="inline mr-1.5 text-amber-600" />
            City / Location *
          </label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Mumbai, Delhi, Jaipur"
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="text-sm font-semibold text-stone-700 mb-2 block">
            🎯 Your Skills * <span className="text-xs font-normal text-stone-400">(select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSkills.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={cn(
                  'px-3 py-2 rounded-xl text-xs font-medium border transition-all',
                  selectedSkills.includes(skill)
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300 hover:text-amber-700'
                )}
              >
                {selectedSkills.includes(skill) && '✓ '}{skill}
              </button>
            ))}
          </div>
          {selectedSkills.length > 0 && (
            <p className="text-xs text-amber-600 mt-2 font-medium">
              {selectedSkills.length} skill{selectedSkills.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Starting Price */}
        <div>
          <label className="text-sm font-semibold text-stone-700 mb-2 block">
            <IndianRupee size={16} className="inline mr-1.5 text-amber-600" />
            Starting Price (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-semibold">₹</span>
            <input
              type="number"
              value={startingPrice}
              onChange={e => setStartingPrice(e.target.value)}
              placeholder="500"
              min="100"
              className="w-full px-4 py-3 pl-10 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <p className="text-xs text-stone-400 mt-1">This is the minimum price for your work. You can set specific prices per order.</p>
        </div>

        {/* Portfolio Links */}
        <div>
          <label className="text-sm font-semibold text-stone-700 mb-2 block">
            🖼️ Portfolio Images <span className="text-xs font-normal text-stone-400">(paste image URLs)</span>
          </label>
          <div className="space-y-2">
            {portfolioUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={e => updatePortfolioUrl(index, e.target.value)}
                  placeholder="https://example.com/your-art-image.jpg"
                  className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {portfolioUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePortfolioUrl(index)}
                    className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors self-center"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addPortfolioUrl}
            className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 font-semibold hover:text-amber-700"
          >
            <Plus size={14} /> Add another image
          </button>
          <p className="text-xs text-stone-400 mt-1">
            Tip: Upload your art images to Imgur or Google Drive and paste the direct link here
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-stone-200">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-200/60 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Creating your profile...</>
            ) : (
              <><Palette size={18} /> Create Artist Profile & Go Live 🚀</>
            )}
          </button>
          <p className="text-xs text-stone-400 text-center mt-3">
            You can edit your profile later from the Profile page
          </p>
        </div>
      </form>
    </div>
  );
}
