import { Armchair, Clock, DollarSign, Receipt } from 'lucide-react'
import { recentOrders, stats } from '@/lib/restaurant-data'
import { StatCard } from '../stat-card'
import { RecentOrdersTable } from '../recent-orders-table'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function OverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <section
        aria-label="Today's key metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Today's orders"
          value={stats.ordersToday.toString()}
          icon={Receipt}
          delta={stats.ordersDelta}
          hint="vs. yesterday"
        />
        <StatCard
          label="Revenue"
          value={currency.format(stats.revenue)}
          icon={DollarSign}
          delta={stats.revenueDelta}
          hint="vs. yesterday"
          emphasis
        />
        <StatCard
          label="Active tables"
          value={`${stats.activeTables} / ${stats.totalTables}`}
          icon={Armchair}
          hint={`${Math.round((stats.activeTables / stats.totalTables) * 100)}% occupancy`}
        />
        <StatCard
          label="Pending orders"
          value={stats.pendingOrders.toString()}
          icon={Clock}
          hint="Avg. wait 9 min"
        />
      </section>

      <RecentOrdersTable orders={recentOrders} />
    </div>
  )
}
