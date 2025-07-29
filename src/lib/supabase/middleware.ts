// Supabase middleware for handling authentication

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { config } from '../config'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Skip Supabase middleware if not configured (development mode)
  if (!config.supabase.url || !config.supabase.anonKey) {
    console.warn('Supabase not configured, skipping authentication middleware')
    return supabaseResponse
  }

  const supabase = createServerClient(config.supabase.url, config.supabase.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            ...options,
            httpOnly: false, // Allow client-side access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
          })
        )
      },
    },
  })

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // Debug logging for middleware
  const allCookies = request.cookies.getAll()
  const authCookie = allCookies.find(c => c.name === 'sb-hvwoeasnoeecgqseuigd-auth-token')

  console.log('🔍 [MIDDLEWARE] Request:', {
    path: request.nextUrl.pathname,
    hasUser: !!user,
    userId: user?.id,
    userError: userError?.message,
    cookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
    authCookieValue: authCookie ? authCookie.value.substring(0, 50) + '...' : 'not found'
  })

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile'] // Removed /funcionario to match /admin pattern
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Admin-only routes
  const adminRoutes = ['/admin']
  const isAdminRoute = adminRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Funcionario-only routes
  const funcionarioRoutes = ['/funcionario', '/funcionarios']
  const isFuncionarioRoute = funcionarioRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !user) {
    console.log('🚫 [MIDDLEWARE] Redirecting to login:', {
      path: request.nextUrl.pathname,
      reason: 'No user found for protected route'
    })
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Check admin permissions for admin routes
  if (isAdminRoute && user) {
    // Get user role from database
    const { data: userProfile } = await supabase
      .from('users')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (!userProfile || userProfile.rol !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  // Check funcionario permissions for funcionario routes
  if (isFuncionarioRoute && user) {
    // Get user role from database
    const { data: userProfile } = await supabase
      .from('users')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (!userProfile || userProfile.rol !== 'funcionario') {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ['/auth/login', '/auth/register', '/auth/reset-password']
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isAuthRoute && user) {
    // Get user role from database for role-based redirect
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('❌ Middleware: Error fetching user profile:', profileError)
      // Fallback to dashboard if profile fetch fails
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    const url = request.nextUrl.clone()

    // Role-based redirect
    if (userProfile?.rol === 'admin') {
      url.pathname = '/admin'
    } else if (userProfile?.rol === 'funcionario') {
      url.pathname = '/funcionarios' // Funcionario dashboard
    } else {
      url.pathname = '/dashboard'
    }

    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
