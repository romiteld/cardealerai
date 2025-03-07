"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/shared/icons'

interface SidebarProps {
  user: any
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Icons.home,
  },
  {
    name: 'Vehicles',
    href: '/dashboard/vehicles',
    icon: Icons.car,
  },
  {
    name: 'Image Gallery',
    href: '/dashboard/gallery',
    icon: Icons.camera,
  },
  {
    name: 'Social Media',
    href: '/dashboard/social',
    icon: Icons.facebook,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: Icons.chart,
  },
  {
    name: 'Team',
    href: '/dashboard/team',
    icon: Icons.users,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Icons.settings,
  },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-white dark:bg-slate-900 md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Icons.car className="h-6 w-6" />
          <span>CarDealerAI</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
                            (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-500'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5',
                    isActive
                      ? 'text-blue-600 dark:text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
          Subscription
        </p>
        <p className="text-sm font-medium">
          {user?.subscription_tier ? (
            <span className="flex items-center">
              <Icons.check className="mr-1 h-4 w-4 text-green-500" />
              {user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)}
            </span>
          ) : (
            <Link 
              href="/dashboard/subscription" 
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Upgrade plan
            </Link>
          )}
        </p>
      </div>
    </aside>
  )
} 