// ============================================================
// 🛠️ UTILITY HELPER FUNCTIONS
// ============================================================

// Color generation for avatars
const avatarColors = [
  'bg-amber-600', 'bg-rose-600', 'bg-emerald-600', 'bg-blue-600',
  'bg-purple-600', 'bg-orange-600', 'bg-teal-600', 'bg-indigo-600',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Portfolio placeholder colors
const portfolioColors = [
  'from-amber-300 to-orange-400',
  'from-rose-300 to-pink-400',
  'from-emerald-300 to-teal-400',
  'from-blue-300 to-indigo-400',
  'from-purple-300 to-violet-400',
  'from-yellow-300 to-amber-400',
  'from-cyan-300 to-blue-400',
  'from-stone-300 to-gray-400',
];

export function getPortfolioColor(index: number): string {
  return portfolioColors[index % portfolioColors.length];
}
