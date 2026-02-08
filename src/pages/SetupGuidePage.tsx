import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone, CheckCircle2, Star, Zap, Shield, Copy, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';

export function SetupGuidePage() {
  const navigate = useNavigate();
  const [activeMethod, setActiveMethod] = useState<1 | 2 | 3>(1);
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-stone-50">
      <div className="bg-white px-5 pt-4 pb-3 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
            <ArrowLeft size={20} className="text-stone-600" />
          </button>
          <h1 className="text-lg font-bold text-stone-800">📱 Install on Phone</h1>
        </div>
      </div>

      <div className="flex-1 native-scroll px-5 py-4 space-y-4">
        {/* Hero */}
        <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-5 text-white">
          <h2 className="text-lg font-bold">Get HunarHub as a Mobile App</h2>
          <p className="text-amber-100 text-sm mt-1">No Android Studio needed! Follow these simple steps.</p>
          <div className="flex items-center gap-1.5 mt-3 text-amber-200 text-xs">
            <Shield size={14} />
            <span>100% Free • Works on low-end laptops too</span>
          </div>
        </div>

        {/* Method tabs */}
        <div className="flex gap-2">
          {[
            { key: 1 as const, label: '⚡ PWA', time: '30 sec' },
            { key: 2 as const, label: '📦 APK', time: '5 min' },
            { key: 3 as const, label: '🔧 More', time: '5 min' },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => setActiveMethod(m.key)}
              className={cn(
                'flex-1 py-3 rounded-xl text-xs font-semibold text-center',
                activeMethod === m.key ? 'bg-amber-600 text-white shadow-lg shadow-amber-200' : 'bg-white text-stone-600 border border-stone-200'
              )}
            >
              <div>{m.label}</div>
              <div className={cn('text-[9px] mt-0.5', activeMethod === m.key ? 'text-amber-200' : 'text-stone-400')}>{m.time}</div>
            </button>
          ))}
        </div>

        {/* =================== METHOD 1: PWA =================== */}
        {activeMethod === 1 && (
          <div className="space-y-3 animate-fade-in-up">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="text-green-600" />
                <h3 className="font-bold text-green-800 text-sm">Fastest! Works Instantly</h3>
              </div>
              <p className="text-xs text-green-700">Install directly from your phone browser. Opens full-screen like a native app!</p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-stone-800 text-sm mb-3 flex items-center gap-2">
                <span className="text-lg">🤖</span> Android (Chrome)
              </h3>
              {[
                'Open this app URL in Chrome on your phone',
                'Tap the ⋮ (3-dot menu) at top-right corner',
                'Tap "Add to Home Screen" or "Install App"',
                'Tap "Install" on the popup dialog',
                'HunarHub icon appears on your home screen! 🎉',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5 mb-3 last:mb-0">
                  <div className="w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                  <p className="text-xs text-stone-700 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-stone-800 text-sm mb-3 flex items-center gap-2">
                <span className="text-lg">🍎</span> iPhone (Safari)
              </h3>
              {[
                'Open this app URL in Safari browser',
                'Tap the Share button (□↑) at bottom center',
                'Scroll down, tap "Add to Home Screen"',
                'Tap "Add" at the top-right corner',
                'Opens full-screen without browser bars! 🎉',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5 mb-3 last:mb-0">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                  <p className="text-xs text-stone-700 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>✨ You get:</strong> Home screen icon, full-screen mode (no browser bars), works offline, fast loading. Feels exactly like a native app!
              </p>
            </div>
          </div>
        )}

        {/* =================== METHOD 2: APK via PWABuilder =================== */}
        {activeMethod === 2 && (
          <div className="space-y-3 animate-fade-in-up">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star size={18} className="text-blue-600" />
                <h3 className="font-bold text-blue-800 text-sm">Get a Real APK File!</h3>
              </div>
              <p className="text-xs text-blue-700">Uses Microsoft's free online tool. Only needs a browser on your laptop!</p>
            </div>

            {/* Step A: Host first */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-stone-800 text-sm mb-1">Step A: Host Your App Online (FREE)</h3>
              <p className="text-[11px] text-stone-500 mb-3">Your app needs a URL first. Easiest way — Netlify:</p>
              
              {[
                { text: 'Download your project files from here', highlight: false },
                { text: 'Open terminal/command prompt in the folder', highlight: false },
                { text: 'Run these commands:', highlight: true, code: 'npm install\nnpm run build' },
                { text: 'Go to app.netlify.com/drop in browser', highlight: true, link: 'https://app.netlify.com/drop' },
                { text: 'Drag & drop the "dist" folder onto the page', highlight: true },
                { text: 'You get a URL like: https://your-app.netlify.app', highlight: false },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5 mb-3 last:mb-0">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">A{i + 1}</div>
                  <div className="flex-1">
                    <p className={cn('text-xs leading-relaxed', step.highlight ? 'text-stone-800 font-medium' : 'text-stone-600')}>{step.text}</p>
                    {step.code && (
                      <div className="mt-1.5 bg-stone-900 rounded-lg p-2.5 flex items-start justify-between">
                        <pre className="text-[11px] text-green-400 font-mono whitespace-pre">{step.code}</pre>
                        <button onClick={() => copyText(step.code!, `a${i}`)} className="text-stone-500 shrink-0 ml-2">
                          {copiedStep === `a${i}` ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    )}
                    {step.link && (
                      <a href={step.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 text-blue-600 text-[11px] font-medium">
                        Open Netlify <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Step B: Convert to APK */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-stone-800 text-sm mb-1">Step B: Convert to APK</h3>
              <p className="text-[11px] text-stone-500 mb-3">Now use PWABuilder to generate an APK:</p>
              
              {[
                { text: 'Go to pwabuilder.com', link: 'https://www.pwabuilder.com' },
                { text: 'Paste your Netlify URL → Click "Start"' },
                { text: 'Wait 30 seconds for analysis' },
                { text: 'Click "Package for stores"' },
                { text: 'Select "Android" → Click "Generate"' },
                { text: 'Download the ZIP file' },
                { text: 'Extract ZIP → Find the APK file inside' },
                { text: 'Send APK to phone (WhatsApp/email/USB cable)' },
                { text: 'Open APK on phone → Install → Done! 🎉' },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5 mb-2.5 last:mb-0">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">B{i + 1}</div>
                  <div className="flex-1">
                    <p className="text-xs text-stone-700 leading-relaxed">{step.text}</p>
                    {'link' in step && step.link && (
                      <a href={step.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-0.5 text-blue-600 text-[11px] font-medium">
                        Open PWABuilder <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>📌 Important:</strong> When installing APK, your phone may say "Unknown source". Go to Settings → Security → Allow "Install from unknown sources" → Then install.
              </p>
            </div>
          </div>
        )}

        {/* =================== METHOD 3: More Options =================== */}
        {activeMethod === 3 && (
          <div className="space-y-3 animate-fade-in-up">
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone size={18} className="text-purple-600" />
                <h3 className="font-bold text-purple-800 text-sm">More APK Builders (No Android Studio!)</h3>
              </div>
              <p className="text-xs text-purple-700">All these work in your browser. Just paste your app URL!</p>
            </div>

            {[
              {
                name: 'AppsGeyser.com',
                desc: 'Paste URL → Customize → Download APK. 100% free.',
                url: 'https://appsgeyser.com',
                icon: '🔧',
                color: 'bg-green-100',
              },
              {
                name: 'WebIntoApp.com',
                desc: 'Convert any website to Android app in 2 minutes.',
                url: 'https://webintoapp.com',
                icon: '📲',
                color: 'bg-blue-100',
              },
              {
                name: 'GoNative.io',
                desc: 'Professional quality wrapper. Has free tier.',
                url: 'https://gonative.io',
                icon: '🌐',
                color: 'bg-orange-100',
              },
              {
                name: 'Median.co (was GoNative)',
                desc: 'Premium native wrapper with push notifications.',
                url: 'https://median.co',
                icon: '⚡',
                color: 'bg-purple-100',
              },
            ].map((tool, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0', tool.color)}>
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-stone-800 text-sm">{tool.name}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">{tool.desc}</p>
                    <a href={tool.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 text-amber-600 text-xs font-semibold">
                      Open Website <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-stone-900 rounded-2xl p-4">
              <h3 className="font-bold text-white text-sm mb-2">💻 For Developers: CLI Method</h3>
              <p className="text-xs text-stone-400 mb-2">If you have Node.js installed, use Bubblewrap (Google's tool):</p>
              <div className="bg-stone-800 rounded-lg p-2.5">
                <pre className="text-[10px] text-green-400 font-mono whitespace-pre-wrap">npm i -g @nicolo-ribaudo/pwa-to-apk{'\n'}pwa-to-apk https://your-app.netlify.app</pre>
              </div>
              <p className="text-[10px] text-stone-500 mt-2">Needs: Node.js + Java JDK (free, ~200MB total)</p>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-stone-800 text-sm mb-3">📊 Which Method Should You Choose?</h3>
          <div className="space-y-2">
            {[
              { method: '⚡ PWA Install', difficulty: 'Very Easy', time: '30 sec', needs: 'Phone only', best: 'Quick testing', recommended: true },
              { method: '📦 PWABuilder APK', difficulty: 'Easy', time: '10 min', needs: 'Laptop + browser', best: 'Share with others', recommended: true },
              { method: '🔧 AppsGeyser APK', difficulty: 'Easy', time: '5 min', needs: 'Laptop + browser', best: 'Fastest APK', recommended: false },
              { method: '🏗️ Android Studio', difficulty: 'Hard', time: '2+ hours', needs: '8GB RAM laptop', best: 'Play Store', recommended: false },
            ].map((row, i) => (
              <div key={i} className={cn('rounded-xl p-3 border', row.recommended ? 'bg-green-50 border-green-200' : 'bg-stone-50 border-stone-200')}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-stone-800 text-xs">{row.method}</span>
                  {row.recommended && <span className="text-[8px] bg-green-600 text-white px-1.5 py-0.5 rounded-full font-bold">RECOMMENDED</span>}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1.5">
                  <span className="text-[10px] text-stone-500">⏱ {row.time}</span>
                  <span className="text-[10px] text-stone-500">🎯 {row.best}</span>
                  <span className="text-[10px] text-stone-500">📊 {row.difficulty}</span>
                  <span className="text-[10px] text-stone-500">💻 {row.needs}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final recommendation */}
        <div className="bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 rounded-2xl p-4">
          <h3 className="font-bold text-amber-900 text-sm mb-2">🏆 Our Recommendation</h3>
          <div className="space-y-2 text-xs text-amber-800">
            <p><strong>Right now:</strong> Use Method 1 (PWA Install) to test immediately</p>
            <p><strong>To share APK:</strong> Host on Netlify → Use PWABuilder → Share APK file</p>
            <p><strong>For Play Store:</strong> Same APK from PWABuilder works for Google Play!</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 py-3">
          <CheckCircle2 size={14} className="text-green-600" />
          <span className="text-xs text-stone-500">No Android Studio needed for any method!</span>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}
