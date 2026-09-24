import { cn } from '@/lib/utils'

interface SellerAvatarProps {
  url?: string | null
  name?: string | null
  className?: string
  textClassName?: string
}

export function SellerAvatar({ url, name, className, textClassName }: SellerAvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden',
        className
      )}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name || 'Vendeur'} className="w-full h-full object-cover" />
      ) : (
        <span className={cn('font-bold text-primary', textClassName)}>
          {name?.trim()?.[0]?.toUpperCase() || 'V'}
        </span>
      )}
    </div>
  )
}
