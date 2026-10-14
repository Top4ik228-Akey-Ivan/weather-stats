
import { GlassCard } from '@/components/GlassCard'
import { Screen } from '@/components/Screen'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// Skeleton из shadcn по умолчанию серый, на стекле нужен белый с прозрачностью
const Bone = ({ className }: { className?: string }) => (
  <Skeleton className={cn('bg-white/20', className)} />
)

// Повторяет заголовок GlassCard (подпись с разделителем), чтобы высоты совпадали
const BoneTitle = ({ width = 'w-28' }: { width?: string }) => (
  <div className="mb-3 flex h-4 items-center border-b border-white/15 pb-2">
    <Bone className={cn('h-3', width)} />
  </div>
)

export default function Loading() {
  return (
    <Screen>
      <span className="sr-only">Загрузка прогноза…</span>

      {/* Ссылка «Поиск» */}
      <Bone className="h-5 w-16" />

      {/* Шапка: город, регион, температура, описание, макс/мин */}
      <div className="flex flex-col items-center py-8">
        <Bone className="h-9 w-40" />
        <Bone className="mt-1 h-5 w-52" />
        <Bone className="mt-3 h-24 w-40" />
        <Bone className="mt-3 h-7 w-32" />
        <Bone className="mt-1 h-6 w-48" />
      </div>

      <div className="space-y-3">
        {/* Почасовой прогноз: график и лента */}
        <GlassCard>
          <BoneTitle width="w-32" />
          <Bone className="h-40 w-full" />
          <div className="mt-3 flex gap-4 overflow-hidden border-t border-white/15 pt-3">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex w-12 shrink-0 flex-col items-center gap-1.5">
                <Bone className="h-4 w-9" />
                <Bone className="size-6 rounded-full" />
                <Bone className="h-3 w-6" />
                <Bone className="h-6 w-8" />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Прогноз по дням */}
        <GlassCard>
          <BoneTitle width="w-28" />
          <div className="divide-y divide-white/15">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <Bone className="h-5 w-16" />
                <Bone className="h-9 w-10" />
                <Bone className="h-5 w-9" />
                <Bone className="h-1.5 flex-1" />
                <Bone className="h-5 w-9" />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Шесть плиток и рассвет с закатом */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <GlassCard key={i}>
              <BoneTitle width="w-20" />
              <Bone className="h-9 w-16" />
              <Bone className="mt-1.5 h-4 w-20" />
            </GlassCard>
          ))}

          <GlassCard className="col-span-2">
            <BoneTitle width="w-36" />
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Bone className="h-4 w-12" />
                <Bone className="h-8 w-16" />
              </div>
              <Bone className="h-10 w-24" />
              <div className="flex flex-col items-end space-y-1.5">
                <Bone className="h-4 w-12" />
                <Bone className="h-8 w-16" />
              </div>
            </div>
            <Bone className="mt-4 h-1.5 w-full" />
          </GlassCard>
        </div>
      </div>
    </Screen>
  )
}