'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import { useStaff } from '@/lib/staff-context'
import { cn } from '@/lib/utils'

type CallRequest = {
  id: string
  tableNumber: number
  reason: string | null
  createdAt: string
}

export function CallWaiterAlerts() {
  const staff = useStaff()
  const [calls, setCalls] = useState<CallRequest[]>([])
  const [open, setOpen] = useState(false)

  const loadCalls = useCallback(async () => {
    if (!staff) return

    const { data } = await supabase
      .from('call_waiter_requests')
      .select('id, reason, created_at, tables(table_number)')
      .eq('restaurant_id', staff.restaurantId)
      .eq('status', 'kutilmoqda')
      .order('created_at', { ascending: true })

    type Row = NonNullable<typeof data>[number]

    setCalls(
      (data ?? []).map((c: Row) => ({
        id: c.id,
        tableNumber:
          (c.tables as unknown as { table_number: number } | null)
            ?.table_number ?? 0,
        reason: c.reason,
        createdAt: c.created_at,
      })),
    )
  }, [staff])

  useEffect(() => {
    if (!staff) return
    loadCalls()

    const channel = supabase
      .channel(`call-alerts-${staff.restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_waiter_requests',
          filter: `restaurant_id=eq.${staff.restaurantId}`,
        },
        loadCalls,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [staff, loadCalls])

  async function resolve(id: string) {
    await supabase
      .from('call_waiter_requests')
      .update({ status: 'javob_berildi', resolved_at: new Date().toISOString() })
      .eq('id', id)
  }

  if (!staff) return null

  return (
    <div className="fixed right-4 top-4 z-40">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-11 items-center justify-center rounded-full bg-card shadow-md"
        aria-label="Chaqiruvlar"
      >
        <Bell className="size-5" />
        {calls.length > 0 && (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-xs font-semibold text-destructive-foreground">
            {calls.length}
          </span>
        )}
      </button>

      {open && (
        <div className="mt-2 w-72 rounded-2xl bg-card p-3 shadow-lg">
          <p className="mb-2 px-1 text-sm font-semibold">Chaqiruvlar</p>
          {calls.length === 0 ? (
            <p className="px-1 py-4 text-center text-sm text-muted-foreground">
              Hozircha chaqiruv yo&apos;q
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {calls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-muted p-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Stol {call.tableNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {call.reason ?? 'Yordam kerak'}
                    </p>
                  </div>
                  <button
                    onClick={() => resolve(call.id)}
                    className={cn(
                      'shrink-0 rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background',
                    )}
                  >
                    Bajarildi
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
