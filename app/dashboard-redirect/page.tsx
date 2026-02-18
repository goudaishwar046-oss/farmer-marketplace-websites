'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'

export default function DashboardRedirectPage() {
  const router = useRouter()
  const { user, userType, loading } = useAuth()

  useEffect(() => {
    // Wait for auth context to load
    if (loading) return

    if (!user) {
      // Not logged in, go to auth
      router.push('/auth')
      return
    }

    // Redirect based on actual user type from database
    if (userType === 'farmer') {
      router.push('/farmer/dashboard')
    } else if (userType === 'delivery') {
      router.push('/delivery')
    } else {
      // default to consumer
      router.push('/consumer')
    }
  }, [user, userType, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Logging you in...</h2>
        <p className="text-gray-600 mt-2">Redirecting to your dashboard</p>
      </div>
    </div>
  )
}
