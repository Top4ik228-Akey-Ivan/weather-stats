import { DEFAULT_GRADIENT } from '@/lib/weather/theme'

export function Screen({
  gradient = DEFAULT_GRADIENT,
  children,
}: {
  gradient?: string
  children: React.ReactNode
}) {
  return (
    <div className="relative isolate min-h-dvh text-white">
      <div aria-hidden className="fixed inset-0 -z-10" style={{ background: gradient }} />
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">{children}</div>
    </div>
  )
}