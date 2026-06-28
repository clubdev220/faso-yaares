import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoSVGProps {
  className?: string
}

export function LogoSVG({ className }: LogoSVGProps) {
  return (
    <Image
      src="/icons/logo.png"
      alt="Yaaré"
      width={200}
      height={60}
      className={cn('w-auto object-contain', className)}
      priority
    />
  )
}

export function Logomark({ className }: { className?: string }) {
  return <LogoSVG className={className} />
}
