'use client'

import {
  Armchair,
  ChefHat,
  ClipboardList,
  Flame,
  LayoutDashboard,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Page } from '@/lib/restaurant-data'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'menu', label: 'Menu', icon: ChefHat },
  { id: 'tables', label: 'Tables', icon: Armchair },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'settings', label: 'Settings', icon: Settings },
]

type SidebarProps = {
  active: Page
  onNavigate: (page: Page) => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({
  active,
  onNavigate,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onMobileClose}
        className={cn(
          'fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-out',
          'lg:sticky lg:top-0 lg:h-svh lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Flame className="size-5" aria-hidden />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight">Ember &amp; Oak</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMobileClose}
            aria-label="Close navigation"
          >
            <X />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'absolute left-0 h-5 w-1 rounded-r-full bg-primary transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <Icon
                  className={cn(
                    'size-5 shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground',
                  )}
                  aria-hidden
                />
                {label}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar className="size-9">
              <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                EM
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">Elena Marsh</p>
              <p className="truncate text-xs text-muted-foreground">General manager</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
