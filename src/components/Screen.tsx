import { SkyEffects } from '@/components/sky/skyEffects'
import { DEFAULT_GRADIENT, getSkyKind } from '@/lib/weather/theme'

type Props = {
  gradient?: string
  sky?: { code: number; isDay: boolean } // если не передать, фон остаётся без эффектов
  children: React.ReactNode
}

export function Screen({ gradient = DEFAULT_GRADIENT, sky, children }: Props) {
  return (
    <div className="relative isolate min-h-dvh text-white">
      <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden" style={{ background: gradient }}>
        {sky && <SkyEffects kind={getSkyKind(sky.code)} isDay={sky.isDay} />}
      </div>
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">{children}</div>
    </div>
  )
}