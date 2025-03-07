"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase/client'

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
  const supabase = createClientComponentClient()
  
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    try {
      console.log('Attempting to sign in with email:', email)
      
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Sign in error:', error)
        throw new Error(error.message)
      }
      
      console.log('Sign in successful, session:', data.session)
      
      // Save auth data to localStorage
      if (data.session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        }))
        
        // Also save a flag that indicates we're authenticated
        localStorage.setItem('auth_status', 'authenticated')
      }
      
      // Get the redirect path or default to dashboard
      const redirectPath = searchParams.get('redirect') || '/dashboard'
      console.log('Redirecting to:', redirectPath)
      
      // Hard redirect instead of using router.push for a complete page refresh
      window.location.href = redirectPath
    } catch (error: any) {
      console.error('Sign in exception:', error)
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
      
      <div className="text-center text-sm">
        Don't have an account?{' '}
        <Link 
          href="/sign-up" 
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign up
        </Link>
      </div>
    </div>
  )
} 