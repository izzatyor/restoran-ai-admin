'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  type MenuCategory,
  type MenuItem,
  menuCategories,
} from '@/lib/restaurant-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MenuItemCard } from '../menu-item-card'
import { MenuItemDialog } from '../menu-item-dialog'
import { supabase } from '@/lib/supabase-client'
import { useStaff } from '@/lib/staff-context'

type Filter = 'All' | MenuCategory

type DbCategory = { id: string; name: string }

export function MenuPage() {
  const staff = useStaff()
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<DbCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('All')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<MenuItem | null>(null)

  useEffect(() => {
    if (staff) loadData()
  }, [staff])

  async function loadData() {
    if (!staff) return
    setLoading(true)

    const { data: cats } = await supabase
      .from('menu_categories')
      .select('id, name')
      .eq('restaurant_id', staff.restaurantId)

    const { data: dbItems } = await supabase
      .from('menu_items')
      .select('id, name, description, price, image_url, category_id')
      .eq('restaurant_id', staff.restaurantId)

    const catList = cats ?? []
    setCategories(catList)
    const catNameById = Object.fromEntries(catList.map((c) => [c.id, c.name]))

    const mapped: MenuItem[] = (dbItems ?? []).map((i) => ({
      id: i.id,
      name: i.name,
      price: Number(i.price),
      category: (catNameById[i.category_id ?? ''] ??
        'Mains') as MenuCategory,
      image: i.image_url ?? '/menu/placeholder.png',
      description: i.description ?? '',
    }))

    setItems(mapped)
    setLoading(false)
  }

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

  async function save(item: MenuItem) {
    if (!staff) return

    let categoryId = categories.find((c) => c.name === item.category)?.id

    if (!categoryId) {
      const { data: newCat } = await supabase
        .from('menu_categories')
        .insert({ restaurant_id: staff.restaurantId, name: item.category })
        .select('id, name')
        .single()
      if (newCat) {
        categoryId = newCat.id
        setCategories((prev) => [...prev, newCat])
      }
    }

    const isExisting = items.some((i) => i.id === item.id)

    if (isExisting) {
      await supabase
        .from('menu_items')
        .update({
          name: item.name,
          description: item.description,
          price: item.price,
          category_id: categoryId,
        })
        .eq('id', item.id)
    } else {
      await supabase.from('menu_items').insert({
        restaurant_id: staff.restaurantId,
        name: item.name,
        description: item.description,
        price: item.price,
        category_id: categoryId,
        image_url: item.image,
      })
    }

    await loadData()
  }

  async function remove(id: string) {
    await supabase.from('menu_items').delete().eq('id', id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const filters: Filter[] = ['All', ...menuCategories]

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
