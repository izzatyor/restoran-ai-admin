'use client'

import { useEffect, useState } from 'react'
import { Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase-client'
import { useStaff } from '@/lib/staff-context'

type LiveStaffMember = {
  id: string
  name: string
  jobTitle: string
  status: 'on-shift' | 'off-shift' | 'on-break'
  shift: string | null
  phone: string | null
}

type Filter = 'All' | string

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
  const staff = useStaff()
  const [members, setMembers] = useState<LiveStaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('All')

  useEffect(() => {
    if (!staff) return
    loadData()
  }, [staff])

  async function loadData() {
    if (!staff) return
    setLoading(true)

    const { data } = await supabase
      .from('staff_users')
      .select('id, full_name, job_title, status, shift, phone')
      .eq('restaurant_id', staff.restaurantId)
      .eq('is_active', true)

    const mapped: LiveStaffMember[] = (data ?? []).map((m) => ({
      id: m.id,
      name: m.full_name,
      jobTitle: m.job_title ?? 'Staff',
      status: (m.status as LiveStaffMember['status']) ?? 'off-shift',
      shift: m.shift,
      phone: m.phone,
    }))

    setMembers(mapped)
    setLoading(false)
  }

  const jobTitles = Array.from(new Set(members.map((m) => m.jobTitle)))
  const filters: Filter[] = ['All', ...jobTitles]

  const visible =
    filter === 'All' ? members : members.filter((m) => m.jobTitle === filter)

  if (!staff || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Filter by job title"
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
                ? members.length
                : members.filter((m) => m.jobTitle === f).length}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16 text-center">
          <p className="font-semibold">No staff found</p>
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
                      {member.jobTitle}
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
                  {member.shift && <p>Shift: {member.shift}</p>}
                  {member.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="size-3.5" aria-hidden />
                      {member.phone}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
