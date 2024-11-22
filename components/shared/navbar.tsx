'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Image, 
  Share2, 
  PenTool, 
  Palette, 
  Grid, 
  CreditCard,
  Menu,
  X
} from 'lucide-react'
import { UserButton, useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { Button } from '../ui/button'

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
  const { user } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = user ? authNavItems : publicNavItems

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center">
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                CarDealerAI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4 mr-2" />}
                  {item.label}
                </Link>
              )
            })}
            {user ? (
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {Icon && <Icon className="h-4 w-4 mr-2" />}
                  {item.label}
                </Link>
              )
            })}
            {!user && (
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Button asChild variant="ghost">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
} 