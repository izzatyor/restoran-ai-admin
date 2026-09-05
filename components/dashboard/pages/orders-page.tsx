'use client'

import { useState } from 'react'
import { type OrderStatus, recentOrders } from '@/lib/restaurant-data'
import { cn } from '@/lib/utils'

type Filter = 'All' | OrderStatus

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  preparing: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  served: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  paid: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
}

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  served: 'Served',
  paid: 'Paid',
}

export function OrdersPage() {
  const [filter, setFilter] = useState<Filter>('All')

  const statuses: OrderStatus[] = ['pending', 'preparing', 'served', 'paid']
  const filters: Filter[] = ['All', ...statuses]

  const visible =
    filter === 'All'
      ? recentOrders
      : recentOrders.filter((o) => o.status === filter)

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
              'rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
              filter === f
                ? 'bg-foreground text-background'
                : 'bg-card text-muted-foreground shadow-sm hover:text-foreground',
            )}
          >
            {f}
            <span className="ml-1.5 text-xs opacity-60 tabular-nums">
              {f === 'All'
                ? recentOrders.length
                : recentOrders.filter((o) => o.status === f).length}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
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
                <td className="px-5 py-3 font-medium">{order.id}</td>
                <td className="px-5 py-3">{order.customer}</td>
                <td className="px-5 py-3">T{order.table}</td>
                <td className="px-5 py-3">{order.items}</td>
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
                  {order.placedAt}
                </td>
                <td className="px-5 py-3 text-right font-medium">
                  ${order.total.toFixed(2)}
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
