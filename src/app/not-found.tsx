import Link from 'next/link'
import { SearchX } from 'lucide-react'
import { Screen } from '@/components/Screen'
import { GlassCard } from '@/components/GlassCard'


export default function NotFound() {
  return (
    <Screen>
      <GlassCard className="mt-20 text-center">
        <SearchX className="mx-auto size-10 text-white/80" />
        <h1 className="mt-3 text-xl font-medium">Страница не найдена</h1>
        <p className="mt-1 text-sm text-white/70">
          Возможно, в адресе ошибка. Попробуйте найти город заново.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex h-10 items-center rounded-full bg-white/20 px-5 text-sm hover:bg-white/30"
        >
          К поиску
        </Link>
      </GlassCard>
    </Screen>
  )
}