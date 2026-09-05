'use client'

import { Bell, Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from './theme-toggle'

type TopBarProps = {
  title: string
  subtitle: string
  onOpenNav: () => void
}

export function TopBar({ title, subtitle, onOpenNav }: TopBarProps) {
  return (
    <header className="flex flex-col gap-4 px-4 pt-4 pb-4 sm:px-6 lg:px-8 lg:pt-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={onOpenNav}
            aria-label="Open navigation"
          >
            <Menu />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
              {title}
            </h1>
            <p className="hidden text-sm text-muted-foreground sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search orders, dishes…"
              aria-label="Search"
              className="w-64 rounded-xl bg-card pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label="Notifications"
            className="relative rounded-xl"
          >
            <Bell />
            <span
              aria-hidden
              className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background"
            />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
