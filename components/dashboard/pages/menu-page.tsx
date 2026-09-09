'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Upload } from 'lucide-react'
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
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  async function ensureCategoryId(name: string, current: DbCategory[]) {
    const existing = current.find(
      (c) => c.name.toLowerCase() === name.toLowerCase(),
    )
    if (existing) return { id: existing.id, list: current }

    const { data: newCat } = await supabase
      .from('menu_categories')
      .insert({ restaurant_id: staff!.restaurantId, name })
      .select('id, name')
      .single()

    if (!newCat) return { id: null, list: current }
    return { id: newCat.id, list: [...current, newCat] }
  }

  async function save(item: MenuItem) {
    if (!staff) return

    const { id: categoryId, list } = await ensureCategoryId(
      item.category,
      categories,
    )
    setCategories(list)

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

  function parseCsv(text: string): string[][] {
    return text
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .map((line) => line.split(',').map((cell) => cell.trim()))
  }

  async function handleCsvUpload(file: File) {
    if (!staff) return
    setImporting(true)
    setImportMessage(null)

    const text = await file.text()
    const rows = parseCsv(text)

    const [header, ...dataRows] = rows
    const nameIdx = header.findIndex((h) => h.toLowerCase() === 'name')
    const categoryIdx = header.findIndex(
      (h) => h.toLowerCase() === 'category',
    )
    const priceIdx = header.findIndex((h) => h.toLowerCase() === 'price')
    const descIdx = header.findIndex(
      (h) => h.toLowerCase() === 'description',
    )

    if (nameIdx === -1 || categoryIdx === -1 || priceIdx === -1) {
      setImportMessage(
        "Xato: CSV faylida 'name', 'category', 'price' ustunlari bo'lishi shart.",
      )
      setImporting(false)
      return
    }

    let currentCategories = categories
    let successCount = 0

    for (const row of dataRows) {
      const name = row[nameIdx]?.trim()
      const categoryName = row[categoryIdx]?.trim()
      const price = Number(row[priceIdx])
      const description = descIdx !== -1 ? row[descIdx]?.trim() : ''

      if (!name || !categoryName || Number.isNaN(price)) continue

      const { id: categoryId, list } = await ensureCategoryId(
        categoryName,
        currentCategories,
      )
      currentCategories = list

      await supabase.from('menu_items').insert({
        restaurant_id: staff.restaurantId,
        name,
        category_id: categoryId,
        price,
        description: description || null,
      })

      successCount += 1
    }

    setCategories(currentCategories)
    setImportMessage(`${successCount} ta taom muvaffaqiyatli qo'shildi.`)
    setImporting(false)
    await loadData()
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
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleCsvUpload(file)
              e.target.value = ''
            }}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="rounded-xl"
          >
            <Upload data-icon="inline-start" />
            {importing ? 'Yuklanmoqda...' : 'CSV import'}
          </Button>
          <Button onClick={openAdd} className="rounded-xl">
            <Plus data-icon="inline-start" />
            Add item
          </Button>
        </div>
      </div>

      {importMessage && (
        <p className="rounded-xl bg-muted px-4 py-2.5 text-sm">
          {importMessage}
        </p>
      )}

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
