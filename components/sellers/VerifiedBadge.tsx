import { BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerifiedBadgeProps {
  variant?: 'inline' | 'pill'
  label?: string
  className?: string
}

export function VerifiedBadge({ variant = 'pill', label = 'Vérifié', className }: VerifiedBadgeProps) {
  if (variant === 'inline') {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs font-medium text-primary', className)}>
        <BadgeCheck className="w-3.5 h-3.5 flex-shrink-0" />
        {label}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary',
        className
      )}
    >
      <BadgeCheck className="w-3.5 h-3.5 flex-shrink-0" />
      {label}
    </span>
  )
}
