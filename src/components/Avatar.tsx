import { getAvatarColor, getInitials } from '@/data/mockData';
import { cn } from '@/utils/cn';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <div className={cn(
      'rounded-full flex items-center justify-center text-white font-bold shrink-0',
      getAvatarColor(name),
      sizes[size],
      className
    )}>
      {getInitials(name)}
    </div>
  );
}
