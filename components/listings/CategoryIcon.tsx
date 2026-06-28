import {
  Apple,
  Bed,
  Briefcase,
  Car,
  Flower2,
  Footprints,
  Gamepad2,
  Headphones,
  Home,
  Key,
  Monitor,
  MoreHorizontal,
  Package,
  Paintbrush,
  Palette,
  Scissors,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Tablet,
  Tag,
  TreePine,
  Trophy,
  Watch,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS: Record<string, LucideIcon> = {
  apple: Apple,
  basket: ShoppingBasket,
  bed: Bed,
  briefcase: Briefcase,
  car: Car,
  'flower-2': Flower2,
  footprints: Footprints,
  'gamepad-2': Gamepad2,
  headphones: Headphones,
  home: Home,
  key: Key,
  monitor: Monitor,
  'more-horizontal': MoreHorizontal,
  package: Package,
  paintbrush: Paintbrush,
  palette: Palette,
  scissors: Scissors,
  shirt: Shirt,
  smartphone: Smartphone,
  sofa: Sofa,
  tablet: Tablet,
  tag: Tag,
  'tree-pine': TreePine,
  trophy: Trophy,
  watch: Watch,
}

interface CategoryIconProps {
  icon: string | null | undefined
  label: string
  className?: string
}

export function CategoryIcon({ icon, label, className }: CategoryIconProps) {
  const normalizedIcon = icon?.trim().toLowerCase()
  const Icon = normalizedIcon ? ICONS[normalizedIcon] : Package

  if (Icon) {
    return <Icon aria-hidden="true" className={cn('h-5 w-5', className)} />
  }

  if (icon && /[^\w-]/.test(icon)) {
    return (
      <span role="img" aria-label={label} className={cn('leading-none', className)}>
        {icon}
      </span>
    )
  }

  return <Package aria-hidden="true" className={cn('h-5 w-5', className)} />
}
