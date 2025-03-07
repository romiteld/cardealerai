import { Metadata } from 'next'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { Icons } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import { Database } from '@/lib/supabase'
import DashboardContent from './components/dashboard-content'

type SocialStat = {
  status: string;
  count: number;
}

export const metadata: Metadata = {
  title: 'Dashboard | CarDealerAI',
  description: 'CarDealerAI dashboard for managing vehicle listings and social media.',
}

export default function DashboardPage() {
  return (
    <DashboardContent>
      <div className="grid gap-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Welcome to CarDealerAI</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your inventory, create content, and grow your dealership with AI.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Recent Activity</h3>
            <div className="mt-2 text-gray-600 dark:text-gray-400">
              <p>No recent activity</p>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Quick Actions</h3>
            <div className="mt-2 grid gap-2">
              <a href="/dashboard/vehicles/add" className="text-blue-600 hover:underline">
                + Add Vehicle
              </a>
              <a href="/dashboard/content" className="text-blue-600 hover:underline">
                Generate Content
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardContent>
  )
} 