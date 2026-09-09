'use client'
import { useState } from 'react'
import type { Page } from '@/lib/restaurant-data'
import { useStaff } from '@/lib/staff-context'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import { OverviewPage } from './pages/overview-page'
import { MenuPage } from './pages/menu-page'
import { TablesPage } from './pages/tables-page'
import { StaffPage } from './pages/staff-page'
import { OrdersPage } from './pages/orders-page'
import { SettingsPage } from './pages/settings-page'
import { CallWaiterAlerts } from './call-waiter-alerts'

const staticPageMeta: Record<Page, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Xush kelibsiz',
    subtitle: 'Bugungi holat qanday?',
  },
  menu: {
    title: 'Menu',
    subtitle: 'Manage dishes, prices and categories.',
  },
  tables: {
    title: 'Floor plan',
    subtitle: 'Live status of every table on the floor.',
  },
  staff: {
    title: 'Staff',
    subtitle: 'Shifts, roles and availability.',
  },
  orders: {
    title: 'Orders',
    subtitle: 'Every ticket from kitchen to checkout.',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Restaurant profile, hours and integrations.',
  },
}
export function DashboardShell() {
  const staff = useStaff()
  const [page, setPage] = useState<Page>('dashboard')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  function navigate(next: Page) {
    setPage(next)
    setMobileNavOpen(false)
  }

  const pageMeta =
    page === 'dashboard' && staff
      ? {
          title: `Xush kelibsiz, ${staff.fullName.split(' ')[0]}`,
          subtitle: `${staff.restaurantName} boshqaruv paneli`,
        }
      : staticPageMeta[page]

  return (
    <div className="flex min-h-svh bg-background">
      <CallWaiterAlerts />
      <Sidebar
        active={page}
        onNavigate={navigate}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={pageMeta.title}
          subtitle={pageMeta.subtitle}
          onOpenNav={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 px-4 pb-10 pt-2 sm:px-6 lg:px-8">
          {page === 'dashboard' && <OverviewPage />}
          {page === 'menu' && <MenuPage />}
          {page === 'tables' && <TablesPage />}
          {page === 'staff' && <StaffPage />}
          {page === 'orders' && <OrdersPage />}
          {page === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  )
}
