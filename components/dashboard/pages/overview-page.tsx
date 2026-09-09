'use client'

import { useCallback, useEffect, useState } from 'react'
import { Armchair, Clock, DollarSign, Receipt } from 'lucide-react'
import { StatCard } from '../stat-card'
import { supabase } from '@/lib/supabase-client'
import { useStaff } from '@/lib/staff-context'
import { cn } from '@/lib/utils'

const currency = new Intl.NumberFormat('uz-UZ', {
  maximumFractionDigits: 0,
})

const ACTIVE_ORDER_STATUSES = [
  'yangi',
  'qabul_qilindi',
  'tayyorlanmoqda',
  'tayyor',
]
const PENDING_STATUSES = ['yangi', 'qabul_qilindi', 'tayyorlanmoqda']

type RecentOrder = {
  id: string
  tableNumber: number | null
  itemCount: number
  total: number
  status: string
  createdAt: string
}

const statusStyles: Record<string, string> = {
  yangi: 'bg-muted text-muted-foreground',
  qabul_qilindi: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  tayyorlanmoqda: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  tayyor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  yetkazildi: 'bg-emerald-700/15 text-emerald-700 dark:text-emerald-500',
  bekor_qilindi: 'bg-destructive/15 text-destructive',
}

const statusLabel: Record<string, string> = {
  yangi: 'Yangi',
  qabul_qilindi: 'Qabul qilindi',
  tayyorlanmoqda: 'Tayyorlanmoqda',
  tayyor: 'Tayyor',
  yetkazildi: 'Yetkazildi',
  bekor_qilindi: 'Bekor qilindi',
}

export function OverviewPage() {
  const staff = useStaff()
  const [loading, setLoading] = useState(true)
  const [ordersToday, setOrdersToday] = useState(0)
  const [revenueToday, setRevenueToday] = useState(0)
  const [activeTables, setActiveTables] = useState(0)
  const [totalTables, setTotalTables] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])

  const loadData = useCallback(async () => {
    if (!staff) return

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const [todayOrdersRes, tablesRes, activeOrdersRes, pendingRes, recentRes] =
      await Promise.all([
        supabase
          .from('orders')
          .select('total_amount, status')
          .eq('restaurant_id', staff.restaurantId)
          .gte('created_at', startOfDay.toISOString())
          .neq('status', 'bekor_qilindi'),
        supabase
          .from('tables')
          .select('id', { count: 'exact', head: true })
          .eq('restaurant_id', staff.restaurantId),
        supabase
          .from('orders')
          .select('table_id')
          .eq('restaurant_id', staff.restaurantId)
          .in('status', ACTIVE_ORDER_STATUSES),
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('restaurant_id', staff.restaurantId)
          .in('status', PENDING_STATUSES),
        supabase
          .from('orders')
          .select(
            'id, status, total_amount, created_at, tables(table_number), order_items(quantity)',
          )
          .eq('restaurant_id', staff.restaurantId)
          .order('created_at', { ascending: false })
          .limit(6),
      ])

    setOrdersToday(todayOrdersRes.data?.length ?? 0)
    setRevenueToday(
      (todayOrdersRes.data ?? []).reduce(
        (sum, o) => sum + Number(o.total_amount),
        0,
      ),
    )
    setTotalTables(tablesRes.count ?? 0)
    setActiveTables(
      new Set((activeOrdersRes.data ?? []).map((o) => o.table_id)).size,
    )
    setPendingOrders(pendingRes.count ?? 0)

    type Row = NonNullable<typeof recentRes.data>[number]
    setRecentOrders(
      (recentRes.data ?? []).map((o: Row) => ({
        id: o.id,
        tableNumber:
          (o.tables as unknown as { table_number: number } | null)
            ?.table_number ?? null,
        itemCount: (
          (o.order_items as unknown as { quantity: number }[]) ?? []
        ).reduce((sum, i) => sum + i.quantity, 0),
        total: Number(o.total_amount),
        status: o.status,
        createdAt: o.created_at,
      })),
    )

    setLoading(false)
  }, [staff])

  useEffect(() => {
    if (!staff) return
    loadData()

    const channel = supabase
      .channel(`overview-live-${staff.restaurantId}`)
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

  if (!staff || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
      </div>
    )
  }

  const occupancy =
    totalTables > 0 ? Math.round((activeTables / totalTables) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-label="Today's key metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Bugungi buyurtmalar"
          value={ordersToday.toString()}
          icon={Receipt}
          hint="bugun"
        />
        <StatCard
          label="Daromad"
          value={`${currency.format(revenueToday)} so'm`}
          icon={DollarSign}
          hint="bugun"
          emphasis
        />
        <StatCard
          label="Faol stollar"
          value={`${activeTables} / ${totalTables}`}
          icon={Armchair}
          hint={`${occupancy}% band`}
        />
        <StatCard
          label="Kutilayotgan buyurtmalar"
          value={pendingOrders.toString()}
          icon={Clock}
          hint="hozir"
        />
      </section>

      <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
        <div className="border-b px-5 py-3">
          <p className="text-sm font-semibold">So&apos;nggi buyurtmalar</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="px-5 py-3 font-medium">Buyurtma</th>
              <th className="px-5 py-3 font-medium">Stol</th>
              <th className="px-5 py-3 font-medium">Taomlar</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Summa</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
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
                    {statusLabel[order.status] ?? order.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-medium">
                  {order.total.toLocaleString()} so&apos;m
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {recentOrders.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="font-semibold">Hali buyurtma yo&apos;q</p>
          </div>
        )}
      </div>
    </div>
  )
}
