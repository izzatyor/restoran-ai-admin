import { diningTables, type TableStatus } from '@/lib/restaurant-data'
import { cn } from '@/lib/utils'
import { TableCard, tableStatusMeta } from '../table-card'

export function TablesPage() {
  const counts = diningTables.reduce<Record<TableStatus, number>>(
    (acc, t) => {
      acc[t.status] += 1
      return acc
    },
    { empty: 0, occupied: 0, attention: 0 },
  )

  const legend: TableStatus[] = ['empty', 'occupied', 'attention']

  return (
    <div className="flex flex-col gap-6">
      <ul
        aria-label="Table status summary"
        className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
      >
        {legend.map((status) => (
          <li key={status} className="flex items-center gap-2">
            <span
              className={cn('size-2.5 rounded-full', tableStatusMeta[status].dot)}
              aria-hidden
            />
            <span className="text-muted-foreground">
              {tableStatusMeta[status].label}
            </span>
            <span className="font-semibold tabular-nums">{counts[status]}</span>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {diningTables.map((table) => (
          <TableCard key={table.id} table={table} />
        ))}
      </div>
    </div>
  )
}
