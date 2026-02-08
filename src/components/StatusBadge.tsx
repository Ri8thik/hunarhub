import { type OrderStatus } from '@/types';
import { cn } from '@/utils/cn';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  requested: { label: 'Requested', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  accepted: { label: 'Accepted', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  delivered: { label: 'Delivered', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      config.className
    )}>
      {config.label}
    </span>
  );
}
