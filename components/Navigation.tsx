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
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-bold text-xl text-green-600">
            FarmBridge
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
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                {translate('nav.logout')}
              </Button>
            ) : (
              <Button onClick={() => router.push('/auth')} size="sm">
                Login
              </Button>
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
