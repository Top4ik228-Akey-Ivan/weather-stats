import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  title?: string
  icon?: LucideIcon
  className?: string
  children: React.ReactNode
}

export function GlassCard({ title, icon: Icon, className, children }: Props) {
  return (
    <section
      className={cn(
        'rounded-3xl border border-white/15 bg-white/15 p-4 shadow-lg shadow-black/5 backdrop-blur-xl',
        className,
      )}
    >
      {title && (
        <h2 className="mb-3 flex items-center gap-1.5 border-b border-white/15 pb-2 text-xs font-medium uppercase tracking-wider text-white/60">
          {Icon && <Icon className="size-3.5" />}
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}