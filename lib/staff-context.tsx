'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase-client'

type StaffInfo = {
  restaurantId: string
  restaurantName: string
  fullName: string
  role: string
} | null

const StaffContext = createContext<StaffInfo>(null)

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaff] = useState<StaffInfo>(null)

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) return

      const { data, error } = await supabase
        .from('staff_users')
        .select('full_name, role, restaurant_id, restaurants(name)')
        .eq('auth_user_id', userId)
        .single()

      if (error || !data) return

      setStaff({
        restaurantId: data.restaurant_id as string,
        restaurantName: (data.restaurants as unknown as { name: string })
          ?.name ?? '',
        fullName: data.full_name as string,
        role: data.role as string,
      })
    }
    load()
  }, [])

  return (
    <StaffContext.Provider value={staff}>{children}</StaffContext.Provider>
  )
}

export function useStaff() {
  return useContext(StaffContext)
}
