"use client"

import { useTheme } from 'next-themes'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Icons } from '@/components/shared/icons'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderProps {
  user: any
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const { theme } = useTheme()
  
  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // Sign out handler
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }
  
  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 dark:bg-slate-900 md:px-6">
      <div className="flex md:hidden">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Icons.menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>
      
      <div className="flex flex-1 items-center justify-end space-x-4">
        <ModeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage
                  src={user?.avatar_url || ''}
                  alt={user?.first_name || 'User'}
                />
                <AvatarFallback>
                  {getInitials(`${user?.first_name || ''} ${user?.last_name || ''}`)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="font-medium">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <Icons.logout className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
} 