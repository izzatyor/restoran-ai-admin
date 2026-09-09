import { createClient } from '@supabase/supabase-js'

// DIQQAT: bu fayl faqat server (API route) ichida ishlatiladi.
// Hech qachon 'use client' komponentida import qilmang.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
