'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase-client'
import { useStaff } from '@/lib/staff-context'

type DbOrderStatus =
  | 'yangi'
  | 'qabul_qilindi'
  | 'tayyorlanmoqda'
  | 'tayyor'
  | 'yetkazildi'
  | 'bekor_qilindi'

type LiveOrder = {
  id: string
  tableNumber: number | null
  itemCount: number
  total: number
  status: DbOrderStatus
  createdAt: string
}

type Filter = 'All' | DbOrderStatus

const statusStyles: Record<DbOrderStatus, string> = {
  yangi: 'bg-muted text-muted-foreground',
  qabul_qilindi: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  tayyorlanmoqda: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  tayyor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  yetkazildi: 'bg-emerald-700/15 text-emerald-700 dark:text-emerald-500',
  bekor_qilindi: 'bg-destructive/15 text-destructive',
}

const statusLabel: Record<DbOrderStatus, string> = {
  yangi: 'New',
  qabul_qilindi: 'Accepted',
  tayyorlanmoqda: 'Preparing',
  tayyor: 'Ready',
  yetkazildi: 'Served',
  bekor_qilindi: 'Cancelled',
}

function formatPlacedAt(createdAt: string) {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  const mins = Math.max(0, Math.floor(diffMs / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minutes ago`
  const hours = Math.floor(mins / 60)
  return `${hours} hours ago`
}

export function OrdersPage() {
  const staff = useStaff()
  const [orders, setOrders] = useState<LiveOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('All')

  const loadData = useCallback(async () => {
    if (!staff) return

    const { data } = await supabase
      .from('orders')
      .select(
        'id, status, total_amount, created_at, tables(table_number), order_items(quantity)',
      )
      .eq('restaurant_id', staff.restaurantId)
      .order('created_at', { ascending: false })

    type Row = NonNullable<typeof data>[number]

    const mapped: LiveOrder[] = (data ?? []).map((o: Row) => ({
      id: o.id,
      tableNumber:
        (o.tables as unknown as { table_number: number } | null)
          ?.table_number ?? null,
      itemCount: (
        (o.order_items as unknown as { quantity: number }[]) ?? []
      ).reduce((sum, i) => sum + i.quantity, 0),
      total: Number(o.total_amount),
      status: o.status as DbOrderStatus,
      createdAt: o.created_at,
    }))

    setOrders(mapped)
    setLoading(false)
  }, [staff])

  useEffect(() => {
    if (!staff) return
    loadData()

    const channel = supabase
      .channel(`orders-live-${staff.restaurantId}`)
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
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [staff, loadData])

  const statuses: DbOrderStatus[] = [
    'yangi',
    'qabul_qilindi',
    'tayyorlanmoqda',
    'tayyor',
    'yetkazildi',
    'bekor_qilindi',
  ]
  const filters: Filter[] = ['All', ...statuses]

  const visible =
    filter === 'All' ? orders : orders.filter((o) => o.status === filter)

  if (!staff || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Filter by status"
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
            {f === 'All' ? 'All' : statusLabel[f as DbOrderStatus]}
            <span className="ml-1.5 text-xs opacity-60 tabular-nums">
              {f === 'All'
                ? orders.length
                : orders.filter((o) => o.status === f).length}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Table</th>
              <th className="px-5 py-3 font-medium">Items</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Placed</th>
              <th className="px-5 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((order) => (
              <tr key={order.id} className="border-b last:border-0">
                <td className="px-5 py-3 font-mono text-xs">
                  {order.id.slice(0, 8)}
                </td>
                <td className="px-5 py-3">
                  {order.tableNumber ? `T${order.tableNumber}` : '-'}
                </td>
                <td className="px-5 py-3">{order.itemCount}</td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-medium',
                      statusStyles[order.status],
                    )}
                  >
                    {statusLabel[order.status]}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {formatPlacedAt(order.createdAt)}
                </td>
                <td className="px-5 py-3 text-right font-medium">
                  {order.total.toLocaleString()} so&apos;m
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visible.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="font-semibold">No orders with this status</p>
          </div>
        )}
      </div>
    </div>
  )
}
