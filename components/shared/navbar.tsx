'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Home, 
  Image, 
  Share2, 
  PenTool, 
  Palette, 
  Grid, 
  CreditCard,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { createBrowserClient } from '@supabase/ssr'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

interface NavItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const publicNavItems: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
]

const authNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/image-enhancement', label: 'Image Enhancement', icon: Image },
  { href: '/social-media', label: 'Social Media', icon: Share2 },
  { href: '/content-assistant', label: 'Content Assistant', icon: PenTool },
  { href: '/branding', label: 'Branding', icon: Palette },
  { href: '/gallery', label: 'Gallery', icon: Grid },
  { href: '/subscription', label: 'Subscription', icon: CreditCard },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Check for active session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const getInitials = (name: string = '') => {
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U'
  }

  const navItems = user ? authNavItems : publicNavItems

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">CarDealerAI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-purple-800 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  {item.icon && <item.icon className={`mr-2 h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />}
                  {item.label}
                </Link>
              )
            })}
            {user && (
              <div className="flex items-center ml-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full p-0 h-8 w-8 overflow-hidden">
                      <Avatar>
                        <AvatarImage 
                          src={user.user_metadata?.avatar_url || ''} 
                          alt={user.user_metadata?.name || 'User'} 
                        />
                        <AvatarFallback className="bg-purple-600">
                          {getInitials(user.user_metadata?.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="mt-1 w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            {!user && !loading && (
              <div className="flex items-center ml-4 space-x-2">
                <Button variant="ghost" className="text-gray-300" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button 
              variant="ghost" 
              className="text-gray-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-purple-800 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon && <item.icon className={`mr-2 h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />}
                  {item.label}
                </Link>
              )
            })}
            {user && (
              <div className="px-3 py-2">
                <Button variant="default" className="w-full justify-start text-left bg-red-600 hover:bg-red-700" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            )}
            {!user && !loading && (
              <div className="flex flex-col gap-2 px-3 py-2">
                <Button variant="outline" className="w-full justify-center" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button className="w-full justify-center bg-purple-600 hover:bg-purple-700" asChild>
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
} 