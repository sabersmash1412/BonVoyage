"use client"

import { Suspense } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/lib/auth-actions"
// Google sign-in temporarily removed
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function LoginFormContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get('redirectedFrom') || '/plan'
  const error = searchParams.get('error')

  const router = useRouter()

  useEffect(() => {
    // After OAuth redirect, Supabase may include tokens in the URL fragment.
    // Initialize the browser client and check for a session; if present, forward user.
    if (typeof window === 'undefined') return
    const init = async () => {
      try {
        const supabase = createClient()
        if (!supabase) return
        // Try immediate session fetch
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.replace(redirectedFrom)
          return
        }

        // Subscribe to auth state changes in case the client processes the URL fragment
        const { data } = supabase.auth.onAuthStateChange((event: any, session: any) => {
          if (session) {
            router.replace(redirectedFrom)
          }
        })

        // cleanup
        return () => {
          try { (data as any)?.subscription?.unsubscribe?.() } catch {}
        }
      } catch (err) {
        // ignore
      }
    }
    init()
  }, [redirectedFrom, router])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          {error && (
            <div className="text-red-500 text-sm">
              {decodeURIComponent(error)}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form action={login}>
            <input type="hidden" name="redirectTo" value={redirectedFrom} />
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex gap-6 items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function LoginForm(props: React.ComponentPropsWithoutRef<"div">) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginFormContent {...props} />
    </Suspense>
  )
}