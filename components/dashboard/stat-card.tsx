import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

type StatCardProps = {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
  delta?: number
  emphasis?: boolean
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  delta,
  emphasis,
}: StatCardProps) {
  const positive = delta !== undefined && delta >= 0

  return (
    <Card
      className={cn(
        'rounded-2xl shadow-sm transition-shadow hover:shadow-md',
        emphasis && 'bg-primary text-primary-foreground border-transparent',
      )}
    >
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              'text-sm font-medium',
              emphasis ? 'text-primary-foreground/80' : 'text-muted-foreground',
            )}
          >
            {label}
          </p>
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-xl',
              emphasis ? 'bg-primary-foreground/15' : 'bg-accent text-accent-foreground',
            )}
          >
            <Icon className="size-4" aria-hidden />
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
          <div className="flex items-center gap-1.5 text-xs">
            {delta !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-semibold',
                  emphasis
                    ? 'text-primary-foreground'
                    : positive
                      ? 'text-success'
                      : 'text-destructive',
                )}
              >
                {positive ? (
                  <ArrowUpRight className="size-3.5" aria-hidden />
                ) : (
                  <ArrowDownRight className="size-3.5" aria-hidden />
                )}
                {Math.abs(delta)}%
              </span>
            )}
            {hint && (
              <span
                className={cn(
                  emphasis ? 'text-primary-foreground/75' : 'text-muted-foreground',
                )}
              >
                {hint}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
