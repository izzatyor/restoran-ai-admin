import Image from 'next/image'
import { Pencil, Trash2 } from 'lucide-react'
import type { MenuItem } from '@/lib/restaurant-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
})

type MenuItemCardProps = {
  item: MenuItem
  onEdit: (item: MenuItem) => void
  onDelete: (id: string) => void
}

export function MenuItemCard({ item, onEdit, onDelete }: MenuItemCardProps) {
  return (
    <Card className="group overflow-hidden rounded-2xl p-0 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge
          variant="secondary"
          className="absolute left-3 top-3 rounded-md bg-card/90 text-card-foreground backdrop-blur"
        >
          {item.category}
        </Badge>
      </div>
      <CardContent className="flex flex-col gap-1 px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-tight text-balance">
            {item.name}
          </h3>
          <p className="shrink-0 text-base font-bold tabular-nums text-primary">
            {currency.format(item.price)}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </CardContent>
      <CardFooter className="flex gap-2 px-4 pb-4 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 rounded-lg"
          onClick={() => onEdit(item)}
        >
          <Pencil data-icon="inline-start" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-lg text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(item.id)}
          aria-label={`Delete ${item.name}`}
        >
          <Trash2 />
        </Button>
      </CardFooter>
    </Card>
  )
}
