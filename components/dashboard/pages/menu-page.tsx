'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  type MenuCategory,
  type MenuItem,
  menuCategories,
  menuItems as initialItems,
} from '@/lib/restaurant-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MenuItemCard } from '../menu-item-card'
import { MenuItemDialog } from '../menu-item-dialog'

type Filter = 'All' | MenuCategory

export function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>(initialItems)
  const [filter, setFilter] = useState<Filter>('All')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<MenuItem | null>(null)

  const visible =
    filter === 'All' ? items : items.filter((i) => i.category === filter)

  function openAdd() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(item: MenuItem) {
    setEditing(item)
    setDialogOpen(true)
  }

  function save(item: MenuItem) {
    setItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.map((i) => (i.id === item.id ? item : i))
        : [item, ...prev],
    )
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const filters: Filter[] = ['All', ...menuCategories]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Filter by category"
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
                  ? items.length
                  : items.filter((i) => i.category === f).length}
              </span>
            </button>
          ))}
        </div>
        <Button onClick={openAdd} className="rounded-xl">
          <Plus data-icon="inline-start" />
          Add item
        </Button>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16 text-center">
          <p className="font-semibold">No items in this category</p>
          <p className="text-sm text-muted-foreground">
            Add a dish to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={openEdit}
              onDelete={remove}
            />
          ))}
        </div>
      )}

      <MenuItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editing}
        onSave={save}
      />
    </div>
  )
}
