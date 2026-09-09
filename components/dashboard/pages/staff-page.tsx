'use client'

import { useEffect, useState } from 'react'
import { Phone, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase-client'
import { useStaff } from '@/lib/staff-context'
import { Button } from '@/components/ui/button'

type LiveStaffMember = {
  id: string
  name: string
  jobTitle: string
  status: 'on-shift' | 'off-shift' | 'on-break'
  shift: string | null
  phone: string | null
}

type Filter = 'All' | string

const roleOptions = [
  { value: 'admin', label: 'Admin (full access)' },
  { value: 'kassir', label: 'Cashier' },
  { value: 'ofitsiant', label: 'Waiter' },
  { value: 'oshxona', label: 'Kitchen' },
]

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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteJobTitle, setInviteJobTitle] = useState('')
  const [inviteRole, setInviteRole] = useState('ofitsiant')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

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

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    setInviteError(null)

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    const res = await fetch('/api/invite-staff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: inviteEmail,
        fullName: inviteName,
        role: inviteRole,
        jobTitle: inviteJobTitle,
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      setInviteError(result.error ?? 'Something went wrong')
      setInviting(false)
      return
    }

    setInviting(false)
    setDialogOpen(false)
    setInviteEmail('')
    setInviteName('')
    setInviteJobTitle('')
    setInviteRole('ofitsiant')
    await loadData()
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
      <Button onClick={() => setDialogOpen(true)} className="rounded-xl">
        <Plus data-icon="inline-start" />
        Invite staff
      </Button>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-semibold">Invite staff member</p>
              <button
                onClick={() => setDialogOpen(false)}
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="staff@example.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Full name</label>
                <input
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Job title</label>
                <input
                  value={inviteJobTitle}
                  onChange={(e) => setInviteJobTitle(e.target.value)}
                  className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="e.g. Waiter, Chef"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Access role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {inviteError && (
                <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {inviteError}
                </p>
              )}

              <Button type="submit" disabled={inviting} className="mt-2 rounded-xl">
                {inviting ? 'Sending invite...' : 'Send invite'}
              </Button>
            </form>
          </div>
        </div>
      )}

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
