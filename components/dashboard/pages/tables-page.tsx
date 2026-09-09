'use client'

import { useCallback, useEffect, useState } from 'react'
import { Copy, Plus, Trash2 } from 'lucide-react'
import type { DiningTable, TableStatus } from '@/lib/restaurant-data'
import { cn } from '@/lib/utils'
import { TableCard, tableStatusMeta } from '../table-card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase-client'
import { useStaff } from '@/lib/staff-context'

const ACTIVE_ORDER_STATUSES = [
  'yangi',
  'qabul_qilindi',
  'tayyorlanmoqda',
  'tayyor',
]

function formatSince(createdAt: string) {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  const mins = Math.max(0, Math.floor(diffMs / 60000))
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  const rem = mins % 60
  return rem === 0 ? `${hours}h` : `${hours}h ${rem}m`
}

export function TablesPage() {
  const staff = useStaff()
  const [tables, setTables] = useState<DiningTable[]>([])
  const [tokenById, setTokenById] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!staff) return

    const { data: dbTables } = await supabase
      .from('tables')
      .select('id, table_number, seats, qr_token')
      .eq('restaurant_id', staff.restaurantId)
      .order('table_number')

    const { data: activeOrders } = await supabase
      .from('orders')
      .select('id, table_id, created_at, guest_count, server_name, status')
      .eq('restaurant_id', staff.restaurantId)
      .in('status', ACTIVE_ORDER_STATUSES)

    const { data: pendingCalls } = await supabase
      .from('call_waiter_requests')
      .select('table_id')
      .eq('restaurant_id', staff.restaurantId)
      .eq('status', 'kutilmoqda')

    const attentionTableIds = new Set(
      (pendingCalls ?? []).map((c) => c.table_id),
    )

    type ActiveOrder = NonNullable<typeof activeOrders>[number]
    const orderByTable = new Map<string, ActiveOrder>()
    for (const o of activeOrders ?? []) {
      const existing = orderByTable.get(o.table_id)
      if (
        !existing ||
        new Date(o.created_at) < new Date(existing.created_at)
      ) {
        orderByTable.set(o.table_id, o)
      }
    }

    const mapped: DiningTable[] = (dbTables ?? []).map((t) => {
      const order = orderByTable.get(t.id)
      const status: TableStatus = attentionTableIds.has(t.id)
        ? 'attention'
        : order
          ? 'occupied'
          : 'empty'

      return {
        id: t.id,
        number: t.table_number,
        seats: t.seats ?? 4,
        status,
        guests: order?.guest_count ?? undefined,
        since: order ? formatSince(order.created_at) : undefined,
        server: order?.server_name ?? undefined,
      }
    })

    setTables(mapped)
    setTokenById(
      Object.fromEntries((dbTables ?? []).map((t) => [t.id, t.qr_token])),
    )
    setLoading(false)
  }, [staff])

  async function addTable() {
    if (!staff) return
    setAdding(true)
    const nextNumber = tables.length
      ? Math.max(...tables.map((t) => t.number)) + 1
      : 1

    await supabase.from('tables').insert({
      restaurant_id: staff.restaurantId,
      table_number: nextNumber,
    })

    setAdding(false)
    await loadData()
  }

  async function removeTable(id: string) {
    await supabase.from('tables').delete().eq('id', id)
    await loadData()
  }

  function copyLink(id: string) {
    const token = tokenById[id]
    if (!token) return
    const url = `${window.location.origin}/t/${token}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  useEffect(() => {
    if (!staff) return
    loadData()

    const channel = supabase
      .channel(`tables-live-${staff.restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${staff.restaurantId}`,
        },
        loadData,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_waiter_requests',
          filter: `restaurant_id=eq.${staff.restaurantId}`,
        },
        loadData,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [staff, loadData])

  if (!staff || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
      </div>
    )
  }

  const counts = tables.reduce<Record<TableStatus, number>>(
    (acc, t) => {
      acc[t.status] += 1
      return acc
    },
    { empty: 0, occupied: 0, attention: 0 },
  )

  const legend: TableStatus[] = ['empty', 'occupied', 'attention']

  return (
    <div className="flex flex-col gap-6">
      {staff.role === 'admin' && (
        <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Stollarni boshqarish</p>
            <Button
              onClick={addTable}
              disabled={adding}
              size="sm"
              className="rounded-xl"
            >
              <Plus data-icon="inline-start" />
              {adding ? 'Qo\'shilmoqda...' : 'Stol qo\'shish'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tables.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 rounded-xl bg-muted px-3 py-1.5 text-sm"
              >
                <span className="font-medium">Stol {t.number}</span>
                <button
                  onClick={() => copyLink(t.id)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  aria-label="Havolani nusxalash"
                >
                  <Copy className="size-3.5" />
                  {copiedId === t.id ? 'Nusxalandi!' : 'Havola'}
                </button>
                <button
                  onClick={() => removeTable(t.id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="O'chirish"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ul
        aria-label="Table status summary"
        className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
      >
        {legend.map((status) => (
          <li key={status} className="flex items-center gap-2">
            <span
              className={cn(
                'size-2.5 rounded-full',
                tableStatusMeta[status].dot,
              )}
              aria-hidden
            />
            <span className="text-muted-foreground">
              {tableStatusMeta[status].label}
            </span>
            <span className="font-semibold tabular-nums">
              {counts[status]}
            </span>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {tables.map((table) => (
          <TableCard key={table.id} table={table} />
        ))}
      </div>
    </div>
  )
}
