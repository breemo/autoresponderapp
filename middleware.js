import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function middleware(req) {
  const token = req.cookies.get('sb-access-token')
  if (!token) return NextResponse.redirect(new URL('/login', req.url))

  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  // تحقق بسيط من نوع المستخدم
  const { data } = await supabase.from('clients').select('role').eq('email', user.email).single()

  if (req.nextUrl.pathname.startsWith('/admin') && data?.role !== 'admin') {
    return NextResponse.redirect(new URL('/client', req.url))
  }

  if (req.nextUrl.pathname.startsWith('/client') && data?.role !== 'client') {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/client/:path*']
}
