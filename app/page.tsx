import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { AuthGate } from '@/components/auth/auth-gate'

export default function Page() {
  return (
    <AuthGate>
      <DashboardShell />
    </AuthGate>
  )
}
