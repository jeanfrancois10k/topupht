import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // Protect Admin routes
  if (url.pathname.startsWith('/admin')) {
    const hasAuthCookie = request.cookies.getAll().some(c => c.name.includes('auth-token') || c.name.includes('sb-'));
    
    if (!user && !hasAuthCookie) {
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', user.id)
        .single()

      const isUserAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || profile?.email?.startsWith('admin@') || user.email?.startsWith('admin@');

      if (profile && !isUserAdmin) {
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }
  }

  // Protect Seller routes
  if (url.pathname.startsWith('/seller')) {
    if (!user) {
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
  }

  // Protect user authenticated routes
  const protectedUserRoutes = ['/dashboard', '/wallet', '/orders', '/profile', '/marketplace/sell', '/marketplace/accounts/submit'];
  const isProtected = protectedUserRoutes.some(route => url.pathname === route || url.pathname.startsWith(route + '/'));
  if (isProtected && !user) {
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}


export const config = {
  matcher: [
    '/admin/:path*',
    '/seller/:path*',
    '/dashboard',
    '/wallet/:path*',
    '/orders/:path*',
    '/profile/:path*',
    '/marketplace/sell',
    '/marketplace/accounts/submit',
  ],
}
