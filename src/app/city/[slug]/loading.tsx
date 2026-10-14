import { GlassCard } from '@/components/GlassCard'
import { Screen } from '@/components/Screen'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// Skeleton из shadcn по умолчанию серый, на стекле нужен белый с прозрачностью
const Bone = ({ className }: { className?: string }) => (
  <Skeleton className={cn('bg-white/20', className)} />
)

export default function Loading() {
  return (
    <Screen>
      <span className="sr-only">Загрузка прогноза…</span>
      <Bone className="h-5 w-16" />

      <div className="flex flex-col items-center gap-3 py-8">
        <Bone className="h-8 w-40" />
        <Bone className="h-4 w-52" />
        <Bone className="h-20 w-36" />
        <Bone className="h-5 w-32" />
      </div>

      <div className="space-y-3">
        <GlassCard className="space-y-4">
          {Array.from({ length: 7 }, (_, i) => (
            <Bone key={i} className="h-6 w-full" />
          ))}
        </GlassCard>

        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <GlassCard key={i} className="space-y-3">
              <Bone className="h-3 w-20" />
              <Bone className="h-8 w-16" />
            </GlassCard>
          ))}

          {/* Рассвет и закат */}
          <GlassCard className="col-span-2 space-y-4">
            <Bone className="h-3 w-32" />
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Bone className="h-3 w-12" />
                <Bone className="h-7 w-16" />
              </div>
              <Bone className="h-9 w-24" />
              <div className="flex flex-col items-end space-y-2">
                <Bone className="h-3 w-12" />
                <Bone className="h-7 w-16" />
              </div>
            </div>
            <Bone className="h-1.5 w-full" />
          </GlassCard>
        </div>
      </div>
    </Screen>
  )
}