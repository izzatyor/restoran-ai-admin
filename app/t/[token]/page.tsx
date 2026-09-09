'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Minus, Bell, ShoppingCart, X } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import { cn } from '@/lib/utils'

type TableInfo = { id: string; restaurantId: string; tableNumber: number }
type Restaurant = { name: string }
type Category = { id: string; name: string }
type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  categoryId: string | null
}
type CartLine = { item: MenuItem; qty: number }

type ViewState =
  | { kind: 'loading' }
  | { kind: 'not-found' }
  | { kind: 'menu' }
  | { kind: 'order-placed'; orderId: string }

export default function TablePage() {
  const params = useParams<{ token: string }>()
  const token = params.token

  const [view, setView] = useState<ViewState>({ kind: 'loading' })
  const [table, setTable] = useState<TableInfo | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [cart, setCart] = useState<Record<string, number>>({})
  const [cartOpen, setCartOpen] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [waiterCalled, setWaiterCalled] = useState(false)

  useEffect(() => {
    loadTable()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function loadTable() {
    const { data: tableRow, error } = await supabase
      .from('tables')
      .select('id, restaurant_id, table_number')
      .eq('qr_token', token)
      .eq('is_active', true)
      .maybeSingle()

    if (error || !tableRow) {
      setView({ kind: 'not-found' })
      return
    }

    setTable({
      id: tableRow.id,
      restaurantId: tableRow.restaurant_id,
      tableNumber: tableRow.table_number,
    })

    const { data: restaurantRow } = await supabase
      .from('restaurants')
      .select('name')
      .eq('id', tableRow.restaurant_id)
      .maybeSingle()

    setRestaurant({ name: restaurantRow?.name ?? 'Restoran' })

    const { data: catRows } = await supabase
      .from('menu_categories')
      .select('id, name')
      .eq('restaurant_id', tableRow.restaurant_id)
      .order('sort_order')

    const { data: itemRows } = await supabase
      .from('menu_items')
      .select('id, name, description, price, image_url, category_id')
      .eq('restaurant_id', tableRow.restaurant_id)
      .eq('is_available', true)

    setCategories((catRows ?? []).map((c) => ({ id: c.id, name: c.name })))
    setItems(
      (itemRows ?? []).map((i) => ({
        id: i.id,
        name: i.name,
        description: i.description,
        price: Number(i.price),
        imageUrl: i.image_url,
        categoryId: i.category_id,
      })),
    )

    setView({ kind: 'menu' })
  }

  const cartLines: CartLine[] = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, qty]) => ({
        item: items.find((i) => i.id === itemId)!,
        qty,
      }))
      .filter((line) => line.item)
  }, [cart, items])

  const cartTotal = cartLines.reduce(
    (sum, line) => sum + line.item.price * line.qty,
    0,
  )
  const cartCount = cartLines.reduce((sum, line) => sum + line.qty, 0)

  function addToCart(itemId: string) {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] ?? 0) + 1 }))
  }

  function removeFromCart(itemId: string) {
    setCart((prev) => {
      const next = { ...prev }
      if (!next[itemId]) return prev
      next[itemId] = Math.max(0, next[itemId] - 1)
      return next
    })
  }

  async function placeOrder() {
    if (!table || cartLines.length === 0) return
    setPlacing(true)

    const { data: orderRow, error } = await supabase
      .from('orders')
      .insert({
        restaurant_id: table.restaurantId,
        table_id: table.id,
        total_amount: cartTotal,
      })
      .select('id')
      .single()

    if (error || !orderRow) {
      setPlacing(false)
      return
    }

    const orderItemsPayload = cartLines.map((line) => ({
      order_id: orderRow.id,
      menu_item_id: line.item.id,
      quantity: line.qty,
      price_at_order: line.item.price,
    }))

    await supabase.from('order_items').insert(orderItemsPayload)

    setCart({})
    setCartOpen(false)
    setPlacing(false)
    setView({ kind: 'order-placed', orderId: orderRow.id })
  }

  async function callWaiter() {
    if (!table) return
    await supabase.from('call_waiter_requests').insert({
      restaurant_id: table.restaurantId,
      table_id: table.id,
      reason: 'Yordam kerak',
    })
    setWaiterCalled(true)
    setTimeout(() => setWaiterCalled(false), 4000)
  }

  const visibleItems =
    activeCategory === 'all'
      ? items
      : items.filter((i) => i.categoryId === activeCategory)

  if (view.kind === 'loading') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
      </div>
    )
  }

  if (view.kind === 'not-found') {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-2 bg-background px-6 text-center">
        <p className="text-lg font-semibold">Stol topilmadi</p>
        <p className="text-sm text-muted-foreground">
          Iltimos, ofitsiantdan yordam so&apos;rang.
        </p>
      </div>
    )
  }

  if (view.kind === 'order-placed') {
    return (
      <OrderStatusScreen
        orderId={view.orderId}
        onNewOrder={() => setView({ kind: 'menu' })}
      />
    )
  }

  return (
    <div className="min-h-svh bg-background pb-24">
      <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <p className="text-lg font-semibold">{restaurant?.name}</p>
        <p className="text-sm text-muted-foreground">
          Stol {table?.tableNumber}
        </p>
      </header>

      <div className="flex gap-1.5 overflow-x-auto px-4 py-3">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium',
            activeCategory === 'all'
              ? 'bg-foreground text-background'
              : 'bg-card text-muted-foreground shadow-sm',
          )}
        >
          Hammasi
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium',
              activeCategory === c.id
                ? 'bg-foreground text-background'
                : 'bg-card text-muted-foreground shadow-sm',
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 px-4">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm"
          >
            <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="size-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{item.name}</p>
              {item.description && (
                <p className="truncate text-xs text-muted-foreground">
                  {item.description}
                </p>
              )}
              <p className="mt-1 text-sm font-medium">
                {item.price.toLocaleString()} so&apos;m
              </p>
            </div>
            <QuantityStepper
              qty={cart[item.id] ?? 0}
              onAdd={() => addToCart(item.id)}
              onRemove={() => removeFromCart(item.id)}
            />
          </div>
        ))}

        {visibleItems.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Bu kategoriyada taom yo&apos;q
          </p>
        )}
      </div>

      <button
        onClick={callWaiter}
        className="fixed bottom-24 right-4 z-20 flex size-12 items-center justify-center rounded-full bg-card shadow-lg"
        aria-label="Ofitsiant chaqirish"
      >
        <Bell className="size-5" />
      </button>

      {waiterCalled && (
        <div className="fixed bottom-40 right-4 z-20 rounded-xl bg-foreground px-3 py-2 text-xs font-medium text-background shadow-lg">
          Ofitsiant chaqirildi
        </div>
      )}

      {cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed inset-x-4 bottom-4 z-20 flex items-center justify-between rounded-2xl bg-foreground px-5 py-4 text-background shadow-lg"
        >
          <span className="flex items-center gap-2 font-medium">
            <ShoppingCart className="size-4" />
            {cartCount} ta mahsulot
          </span>
          <span className="font-semibold">
            {cartTotal.toLocaleString()} so&apos;m
          </span>
        </button>
      )}

      {cartOpen && (
        <CartSheet
          lines={cartLines}
          total={cartTotal}
          placing={placing}
          onClose={() => setCartOpen(false)}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onPlaceOrder={placeOrder}
        />
      )}
    </div>
  )
}

function QuantityStepper({
  qty,
  onAdd,
  onRemove,
}: {
  qty: number
  onAdd: () => void
  onRemove: () => void
}) {
  if (qty === 0) {
    return (
      <button
        onClick={onAdd}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background"
        aria-label="Qo'shish"
      >
        <Plus className="size-4" />
      </button>
    )
  }
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-full bg-muted px-1 py-1">
      <button
        onClick={onRemove}
        className="flex size-7 items-center justify-center rounded-full bg-background"
        aria-label="Ayirish"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-4 text-center text-sm font-semibold tabular-nums">
        {qty}
      </span>
      <button
        onClick={onAdd}
        className="flex size-7 items-center justify-center rounded-full bg-background"
        aria-label="Qo'shish"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}

function CartSheet({
  lines,
  total,
  placing,
  onClose,
  onAdd,
  onRemove,
  onPlaceOrder,
}: {
  lines: CartLine[]
  total: number
  placing: boolean
  onClose: () => void
  onAdd: (id: string) => void
  onRemove: (id: string) => void
  onPlaceOrder: () => void
}) {
  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-end bg-black/50">
      <div className="flex max-h-[80vh] flex-col rounded-t-3xl bg-background p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-lg font-semibold">Buyurtma</p>
          <button onClick={onClose} aria-label="Yopish">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {lines.map((line) => (
            <div
              key={line.item.id}
              className="flex items-center justify-between gap-3 border-b py-3 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{line.item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {line.item.price.toLocaleString()} so&apos;m
                </p>
              </div>
              <QuantityStepper
                qty={line.qty}
                onAdd={() => onAdd(line.item.id)}
                onRemove={() => onRemove(line.item.id)}
              />
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between border-t pt-3 text-lg font-semibold">
          <span>Jami</span>
          <span>{total.toLocaleString()} so&apos;m</span>
        </div>

        <button
          onClick={onPlaceOrder}
          disabled={placing}
          className="mt-4 rounded-2xl bg-foreground py-3.5 text-center font-semibold text-background disabled:opacity-60"
        >
          {placing ? 'Yuborilmoqda...' : 'Buyurtma berish'}
        </button>
      </div>
    </div>
  )
}

function OrderStatusScreen({
  orderId,
  onNewOrder,
}: {
  orderId: string
  onNewOrder: () => void
}) {
  const [status, setStatus] = useState<string>('yangi')

  useEffect(() => {
    let active = true

    async function poll() {
      const { data } = await supabase
        .rpc('get_order_status', { p_order_id: orderId })
        .maybeSingle()
      if (active && data) {
        setStatus(data.status)
      }
    }

    poll()
    const interval = setInterval(poll, 4000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [orderId])

  const statusLabel: Record<string, string> = {
    yangi: 'Buyurtmangiz qabul qilindi',
    qabul_qilindi: "Oshxona buyurtmangizni ko'rdi",
    tayyorlanmoqda: 'Taomingiz tayyorlanmoqda',
    tayyor: 'Taomingiz tayyor!',
    yetkazildi: 'Yoqimli ishtaha!',
    bekor_qilindi: 'Buyurtma bekor qilindi',
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-2xl font-semibold">
        {statusLabel[status] ?? 'Buyurtma qabul qilindi'}
      </p>
      <p className="text-sm text-muted-foreground">
        Buyurtma raqami: {orderId.slice(0, 8)}
      </p>
      <button
        onClick={onNewOrder}
        className="mt-4 rounded-full bg-card px-5 py-2.5 text-sm font-medium shadow-sm"
      >
        Yana buyurtma berish
      </button>
    </div>
  )
}
