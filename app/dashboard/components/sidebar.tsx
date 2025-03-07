"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/shared/icons'

interface SidebarProps {
  user: any;
  onToggle?: (collapsed: boolean) => void;
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
    name: 'Market Research',
    href: '/dashboard/market-research',
    icon: Icons.chart,
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
    name: 'Subscription',
    href: '/dashboard/subscription',
    icon: Icons.coins,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Icons.settings,
  },
]

export function Sidebar({ user, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Load collapsed state from localStorage on component mount
  useEffect(() => {
    const storedState = localStorage.getItem('sidebarCollapsed')
    if (storedState) {
      setIsCollapsed(storedState === 'true')
    }
  }, [])
  
  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
    
    // Notify parent component if onToggle prop is provided
    if (onToggle) {
      onToggle(newState)
    }
  }
  
  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64", 
        "md:flex"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/" className={cn("flex items-center gap-2 font-semibold", isCollapsed && "justify-center")}>
          <Icons.car className="h-6 w-6" />
          {!isCollapsed && <span>CarDealerAI</span>}
        </Link>
        <button 
          onClick={toggleSidebar}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Icons.panelRight className="h-5 w-5" /> : <Icons.panelLeft className="h-5 w-5" />}
        </button>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className={cn("space-y-1", isCollapsed ? "px-1" : "px-2")}>
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
                            (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-md py-2 text-sm font-medium',
                  isCollapsed ? "justify-center px-2" : "px-3",
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-500'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5',
                    !isCollapsed && 'mr-3',
                    isActive
                      ? 'text-blue-600 dark:text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                  )}
                />
                {!isCollapsed && item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      {!isCollapsed && (
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
      )}
      {isCollapsed && (
        <div className="border-t p-2 flex justify-center">
          <Link 
            href="/dashboard/subscription" 
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            title="Subscription"
          >
            <Icons.coins className="h-5 w-5" />
          </Link>
        </div>
      )}
    </aside>
  )
} 