import { AlertTriangle, Clock, Users } from 'lucide-react'
import type { DiningTable, TableStatus } from '@/lib/restaurant-data'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

export const tableStatusMeta: Record<
  TableStatus,
  { label: string; short: string; dot: string; ring: string; chip: string }
> = {
  empty: {
    label: 'Empty',
    short: 'Empty',
    dot: 'bg-success',
    ring: 'ring-success/30',
    chip: 'bg-success/12 text-success',
  },
  occupied: {
    label: 'Occupied',
    short: 'Occupied',
    dot: 'bg-primary',
    ring: 'ring-primary/35',
    chip: 'bg-primary/15 text-accent-foreground dark:text-primary',
  },
  attention: {
    label: 'Needs attention',
    short: 'Attention',
    dot: 'bg-destructive',
    ring: 'ring-destructive/35',
    chip: 'bg-destructive/12 text-destructive',
  },
}

export function TableCard({ table }: { table: DiningTable }) {
  const meta = tableStatusMeta[table.status]
  const isAttention = table.status === 'attention'

  return (
    <Card
      className={cn(
        'relative rounded-2xl shadow-sm transition-shadow hover:shadow-md',
        isAttention && 'border-destructive/40',
      )}
    >
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex size-12 items-center justify-center rounded-full bg-muted ring-4 text-lg font-bold tabular-nums',
              meta.ring,
            )}
            aria-hidden
          >
            {table.number}
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold',
              meta.chip,
            )}
          >
            <span className={cn('size-1.5 rounded-full', meta.dot)} aria-hidden />
            <span className="sr-only">{meta.label}</span>
            <span aria-hidden>{meta.short}</span>
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">Table {table.number}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" aria-hidden />
            {table.status === 'empty'
              ? `Seats ${table.seats}`
              : `${table.guests} of ${table.seats} seats`}
          </p>
        </div>

        {table.status !== 'empty' && (
          <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              {isAttention ? (
                <AlertTriangle className="size-3.5 text-destructive" aria-hidden />
              ) : (
                <Clock className="size-3.5" aria-hidden />
              )}
              {table.since}
            </span>
            <span className="font-medium text-foreground">{table.server}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
