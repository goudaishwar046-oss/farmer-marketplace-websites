'use client'

import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Language } from '@/lib/translations'
import { LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

export function Navigation() {
  const router = useRouter()
  const { user, userType, signOut } = useAuth()
  const { language, setLanguage, translate } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const navLinks =
    userType === 'farmer'
      ? [
          { href: '/farmer/dashboard', label: 'nav.myProducts' },
          { href: '/farmer/orders', label: 'nav.orders' },
          { href: '/farmer/profile', label: 'nav.profile' },
        ]
      : [
          { href: '/consumer', label: 'nav.marketplace' },
          { href: '/consumer/map', label: 'map.title' },
          { href: '/consumer/orders', label: 'nav.orders' },
          { href: '/consumer/profile', label: 'nav.profile' },
        ]

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3">
            {/* Simple farm symbol SVG */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <circle cx="12" cy="12" r="11" fill="url(#g1)" opacity="0.08" />
              <path d="M6 14C6 10 9 7 12 7C15 7 18 10 18 14" stroke="url(#g1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 7V4" stroke="url(#g1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-bold text-xl text-gradient-to-r from-green-600 to-emerald-500">FarmBridge</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {user && (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-700 hover:text-green-600 transition"
                  >
                    {translate(link.label)}
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-4">
            <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
                <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
                <SelectItem value="ta">தமிழ்</SelectItem>
                <SelectItem value="te">తెలుగు</SelectItem>
              </SelectContent>
            </Select>

            {user ? (
              <>
                {/* Quick actions tailored to user type */}
                <div className="hidden sm:flex items-center gap-2">
                  {userType === 'farmer' && (
                    <>
                      <Link href="/farmer/product/new" className="text-sm text-gray-700 hover:text-green-600">Add Product</Link>
                      <Link href="/farmer/orders" className="text-sm text-gray-700 hover:text-green-600">Orders</Link>
                    </>
                  )}
                  {userType === 'consumer' && (
                    <>
                      <Link href="/consumer" className="text-sm text-gray-700 hover:text-green-600">Marketplace</Link>
                      <Link href="/consumer/orders" className="text-sm text-gray-700 hover:text-green-600">My Orders</Link>
                    </>
                  )}
                  {userType === 'delivery' && (
                    <>
                      <Link href="/delivery-boy" className="text-sm text-gray-700 hover:text-green-600">Deliveries</Link>
                      <Link href="/delivery-boy" className="text-sm text-gray-700 hover:text-green-600">Profile</Link>
                    </>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  {translate('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth" className="inline-block">
                  <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-500 text-white">Login</Button>
                </Link>
                <Link href="/auth?signup=1" className="inline-block">
                  <Button size="sm" variant="outline">Register</Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && user && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                {translate(link.label)}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
