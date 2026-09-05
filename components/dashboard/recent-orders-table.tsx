import { ArrowRight } from 'lucide-react'
import type { Order, OrderStatus } from '@/lib/restaurant-data'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const statusStyles: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-warning/15 text-warning-foreground dark:text-warning border-transparent',
  },
  preparing: {
    label: 'Preparing',
    className: 'bg-primary/15 text-accent-foreground dark:text-primary border-transparent',
  },
  served: {
    label: 'Served',
    className: 'bg-success/15 text-success border-transparent',
  },
  paid: {
    label: 'Paid',
    className: 'bg-muted text-muted-foreground border-transparent',
  },
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function RecentOrdersTable({ orders }: { orders: Order[] }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>Recent orders</CardTitle>
        <CardDescription>Latest tickets from the floor</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            View all
            <ArrowRight data-icon="inline-end" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 sm:pl-2">Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Table</TableHead>
                <TableHead className="hidden md:table-cell">Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Placed</TableHead>
                <TableHead className="pr-6 text-right sm:pr-2">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const status = statusStyles[order.status]
                return (
                  <TableRow key={order.id}>
                    <TableCell className="pl-6 font-mono text-xs text-muted-foreground sm:pl-2">
                      {order.id}
                    </TableCell>
                    <TableCell className="font-medium">{order.customer}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      T{order.table}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {order.items}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('rounded-md font-medium', status.className)}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {order.placedAt}
                    </TableCell>
                    <TableCell className="pr-6 text-right font-semibold tabular-nums sm:pr-2">
                      {currency.format(order.total)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
