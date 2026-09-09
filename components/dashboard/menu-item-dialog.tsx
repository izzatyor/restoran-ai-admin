'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import {
  type MenuCategory,
  type MenuItem,
  menuCategories,
} from '@/lib/restaurant-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase-client'

type MenuItemDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: MenuItem | null
  onSave: (item: MenuItem) => void
}

export function MenuItemDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: MenuItemDialogProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<MenuCategory>('Mains')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setName(item?.name ?? '')
    setPrice(item ? String(item.price) : '')
    setCategory(item?.category ?? 'Mains')
    setDescription(item?.description ?? '')
    setImage(item?.image ?? '')
  }, [open, item])

  const isEditing = item !== null
  const canSave = name.trim().length > 0 && Number(price) > 0

  async function handleFileSelect(file: File) {
    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

    const { error } = await supabase.storage
      .from('menu-images')
      .upload(fileName, file)

    if (!error) {
      const { data } = supabase.storage
        .from('menu-images')
        .getPublicUrl(fileName)
      setImage(data.publicUrl)
    }
    setUploading(false)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSave) return
    onSave({
      id: item?.id ?? `m${Date.now()}`,
      name: name.trim(),
      price: Number(price),
      category,
      description: description.trim(),
      image: image || '/menu/smash-burger.png',
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit item' : 'Add menu item'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the dish details. Changes go live immediately.'
                : 'Add a new dish or drink to the menu.'}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel>Rasm</FieldLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
              />
              <div className="flex items-center gap-3">
                <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt=""
                      className="size-full object-cover"
                    />
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload data-icon="inline-start" />
                  {uploading ? 'Yuklanmoqda...' : 'Rasm tanlash'}
                </Button>
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="item-name">Name</FieldLabel>
              <Input
                id="item-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wood-fired Margherita"
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="item-price">Price (USD)</FieldLabel>
                <Input
                  id="item-price"
                  type="number"
                  min="0"
                  step="0.5"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="item-category">Category</FieldLabel>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value as MenuCategory)}
                >
                  <SelectTrigger id="item-category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {menuCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="item-description">Description</FieldLabel>
              <Input
                id="item-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short note about ingredients"
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave || uploading}>
              {isEditing ? 'Save changes' : 'Add item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
