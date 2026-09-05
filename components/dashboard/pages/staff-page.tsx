'use client'

import { useState } from 'react'
import { Phone } from 'lucide-react'
import {
  type StaffRole,
  staffMembers,
} from '@/lib/restaurant-data'
import { cn } from '@/lib/utils'

type Filter = 'All' | StaffRole

const statusStyles: Record<string, string> = {
  'on-shift': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'on-break': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'off-shift': 'bg-muted text-muted-foreground',
}

const statusLabel: Record<string, string> = {
  'on-shift': 'On shift',
  'on-break': 'On break',
  'off-shift': 'Off shift',
}

export function StaffPage() {
  const [filter, setFilter] = useState<Filter>('All')

  const roles: StaffRole[] = ['Manager', 'Server', 'Chef', 'Host', 'Bartender']
  const filters: Filter[] = ['All', ...roles]

  const visible =
    filter === 'All'
      ? staffMembers
      : staffMembers.filter((m) => m.role === filter)

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Filter by role"
        className="flex flex-wrap gap-1.5"
      >
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
              filter === f
                ? 'bg-foreground text-background'
                : 'bg-card text-muted-foreground shadow-sm hover:text-foreground',
            )}
          >
            {f}
            <span className="ml-1.5 text-xs opacity-60 tabular-nums">
              {f === 'All'
                ? staffMembers.length
                : staffMembers.filter((m) => m.role === f).length}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16 text-center">
          <p className="font-semibold">No staff in this role</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((member) => {
            const initials = member.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
            return (
              <div
                key={member.id}
                className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                </div>

                <span
                  className={cn(
                    'w-fit rounded-full px-2.5 py-1 text-xs font-medium',
                    statusStyles[member.status],
                  )}
                >
                  {statusLabel[member.status]}
                </span>

                <div className="flex flex-col gap-1 border-t pt-3 text-sm text-muted-foreground">
                  <p>Shift: {member.shift}</p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="size-3.5" aria-hidden />
                    {member.phone}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
