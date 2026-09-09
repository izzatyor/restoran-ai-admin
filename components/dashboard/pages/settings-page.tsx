'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useStaff } from '@/lib/staff-context'
import { Button } from '@/components/ui/button'

export function SettingsPage() {
  const staff = useStaff()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [workHours, setWorkHours] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (staff) loadRestaurant()
  }, [staff])

  async function loadRestaurant() {
    if (!staff) return
    const { data } = await supabase
      .from('restaurants')
      .select('name, address, work_hours, logo_url')
      .eq('id', staff.restaurantId)
      .single()

    if (data) {
      setName(data.name ?? '')
      setAddress(data.address ?? '')
      setWorkHours(data.work_hours ?? '')
      setLogoUrl(data.logo_url ?? '')
    }
    setLoading(false)
  }

  async function handleSave() {
    if (!staff) return
    setSaving(true)
    setSaved(false)

    await supabase
      .from('restaurants')
      .update({ name, address, work_hours: workHours, logo_url: logoUrl })
      .eq('id', staff.restaurantId)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!staff || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg rounded-2xl bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Restoran profili</h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Restoran nomi</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Manzil</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Toshkent, Chilonzor tumani..."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Ish vaqti</label>
          <input
            value={workHours}
            onChange={(e) => setWorkHours(e.target.value)}
            className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="09:00 - 23:00"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Logo (rasm havolasi)</label>
          <input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="https://..."
          />
        </div>

        <div className="mt-2 flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving} className="rounded-xl">
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
          {saved && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              Saqlandi!
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
