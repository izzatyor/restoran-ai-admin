'use client'

import { useState } from 'react'
import type { Page } from '@/lib/restaurant-data'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import { StaffPage } from './pages/staff-page'
import { OrdersPage } from './pages/orders-page'
import { OverviewPage } from './pages/overview-page'
import { MenuPage } from './pages/menu-page'
import { TablesPage } from './pages/tables-page'
import { PlaceholderPage } from './pages/placeholder-page'

const pageMeta: Record<Page, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Good evening, Elena',
    subtitle: 'Here is what is happening at Ember & Oak tonight.',
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
  const [page, setPage] = useState<Page>('dashboard')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  function navigate(next: Page) {
    setPage(next)
    setMobileNavOpen(false)
  }

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar
        active={page}
        onNavigate={navigate}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={pageMeta[page].title}
          subtitle={pageMeta[page].subtitle}
          onOpenNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 px-4 pb-10 pt-2 sm:px-6 lg:px-8">
          {page === 'dashboard' && <OverviewPage />}
          {page === 'menu' && <MenuPage />}
          {page === 'tables' && <TablesPage />}
          {page === 'staff' && <StaffPage />}
          {page === 'orders' && <OrdersPage />}
          {page === 'settings' && (
            <PlaceholderPage
              title="Settings are on the way"
              description="Opening hours, tax rates, printers and POS integrations."
            />
          )}
        </main>
      </div>
    </div>
  )
}
