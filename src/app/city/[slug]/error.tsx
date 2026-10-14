'use client'

import { useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CloudOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Screen } from '@/components/Screen'
import { GlassCard } from '@/components/GlassCard'

export default function CityError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    console.error(error)
  }, [error])

  const retry = () =>
    startTransition(() => {
      router.refresh() // заново выполнить серверный компонент, то есть повторить запрос
      reset() // сбросить границу ошибки и перерисовать страницу
    })

  return (
    <Screen>
      <GlassCard className="mt-20 text-center">
        <CloudOff className="mx-auto size-10 text-white/80" />
        <h1 className="mt-3 text-xl font-medium">Не удалось загрузить погоду</h1>
        <p className="mt-1 text-sm text-white/70">
          Сервис погоды не отвечает. Проверьте соединение и попробуйте ещё раз.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button
            onClick={retry}
            disabled={pending}
            className="rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            {pending ? 'Загружаем…' : 'Повторить'}
          </Button>
          <Link href="/" className="text-sm text-white/70 hover:text-white">
            К поиску
          </Link>
        </div>
      </GlassCard>
    </Screen>
  )
}