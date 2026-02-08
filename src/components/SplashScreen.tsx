import { Palette } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-amber-700 via-amber-800 to-orange-900 flex flex-col items-center justify-center relative overflow-hidden safe-top safe-bottom">
      {/* Background decorations */}
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 bg-amber-600/20 rounded-full" />
      <div className="absolute bottom-[-100px] left-[-60px] w-72 h-72 bg-orange-600/20 rounded-full" />
      <div className="absolute top-[30%] left-[-40px] w-32 h-32 bg-amber-500/10 rounded-full" />
      <div className="absolute bottom-[25%] right-[-30px] w-40 h-40 bg-orange-500/10 rounded-full" />

      <div className="animate-fade-in-up flex flex-col items-center relative z-10">
        <div className="w-28 h-28 rounded-[32px] bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-2xl mb-6 animate-bounce-in">
          <Palette className="text-white" size={56} />
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">HunarHub</h1>
        <p className="text-amber-200/80 mt-2 text-sm tracking-widest uppercase">Custom Art Marketplace</p>

        <div className="mt-12 flex gap-2.5">
          <div className="w-2.5 h-2.5 bg-white/60 rounded-full animate-pulse-soft" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 bg-white/60 rounded-full animate-pulse-soft" style={{ animationDelay: '300ms' }} />
          <div className="w-2.5 h-2.5 bg-white/60 rounded-full animate-pulse-soft" style={{ animationDelay: '600ms' }} />
        </div>
      </div>

      <div className="absolute bottom-8 flex flex-col items-center">
        <p className="text-amber-300/50 text-xs tracking-wider">Made with ❤️ in India</p>
      </div>
    </div>
  );
}
