import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

const protectedRoutes = ['/plan', '/itinerary', '/community']
const publicRoutes = ['/login', '/signup', '/forgot-password']

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // Refresh session
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()
  
  if (error) {
    console.error("Session error:", error.message)
  }

  // Handle protected routes
  if (!session && protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Prevent authenticated users from accessing auth pages
  if (session && publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/plan', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}