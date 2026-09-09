import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // 1. So'rov yuborayotgan odamni tasdiqlash
  const { data: callerData, error: callerError } =
    await supabaseAdmin.auth.getUser(token)

  if (callerError || !callerData.user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  // 2. So'rov yuborayotgan odam admin ekanini va qaysi restoranga
  //    tegishli ekanini tekshirish
  const { data: callerStaff, error: staffError } = await supabaseAdmin
    .from('staff_users')
    .select('restaurant_id, role')
    .eq('auth_user_id', callerData.user.id)
    .single()

  if (staffError || !callerStaff || callerStaff.role !== 'admin') {
    return NextResponse.json(
      { error: 'Only admins can invite staff' },
      { status: 403 },
    )
  }

  // 3. Kelgan ma'lumotlarni o'qish
  const body = await request.json()
  const { email, fullName, role, jobTitle } = body as {
    email: string
    fullName: string
    role: 'admin' | 'kassir' | 'ofitsiant' | 'oshxona'
    jobTitle: string
  }

  if (!email || !fullName || !role) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 },
    )
  }

  // 4. Yangi login yaratish va taklif emailini yuborish
  const { data: newUser, error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email)

  if (inviteError || !newUser.user) {
    return NextResponse.json(
      { error: inviteError?.message ?? 'Could not create user' },
      { status: 400 },
    )
  }

  // 5. Yangi xodimni shu restoranga bog'lash
  const { error: linkError } = await supabaseAdmin.from('staff_users').insert({
    auth_user_id: newUser.user.id,
    restaurant_id: callerStaff.restaurant_id,
    full_name: fullName,
    role,
    job_title: jobTitle || null,
    status: 'off-shift',
  })

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
