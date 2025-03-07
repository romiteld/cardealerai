import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import SignUpForm from './components/sign-up-form'
import { createServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Sign Up | CarDealerAI',
  description: 'Create a new CarDealerAI account for your dealership.',
}

export default async function SignUpPage() {
  // Check if user is already authenticated
  const supabase = await createServerClient()
  const { data } = await supabase.auth.getSession()
  
  // If already authenticated, redirect to dashboard
  if (data?.session) {
    redirect('/dashboard')
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-slate-800">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Sign up to get started with CarDealerAI
          </p>
        </div>
        
        <SignUpForm />
        
        <div className="mt-4 text-center text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 