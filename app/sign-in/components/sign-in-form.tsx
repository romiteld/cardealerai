"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/shared/icons'
import Link from 'next/link'

export default function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Get the redirect path or default to dashboard
      const redirectPath = searchParams.get('redirect') || '/dashboard'
      router.push(redirectPath)
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="grid gap-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
          </div>
          
          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </div>
      </form>
      
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <span className="relative bg-white px-2 text-xs text-gray-500 dark:bg-slate-800 dark:text-gray-400">
          Or continue with
        </span>
      </div>
      
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={async () => {
          setIsLoading(true)
          try {
            const { data, error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${window.location.origin}/api/auth/callback`,
              },
            })
            
            if (error) {
              throw new Error(error.message)
            }
          } catch (error: any) {
            setError(error.message)
            setIsLoading(false)
          }
        }}
      >
        <Icons.google className="mr-2 h-4 w-4" />
        Google
      </Button>
    </div>
  )
} 