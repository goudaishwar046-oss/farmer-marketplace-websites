'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { AuthForm } from '@/components/AuthForm'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/Navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import Loading from './loading'

export default function AuthPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [authType, setAuthType] = useState<'login' | 'signup'>('login')
  const [userType, setUserType] = useState<'farmer' | 'consumer' | 'delivery'>('consumer')

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard-redirect')
    }
  }, [user, loading, router])

  if (!loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <Suspense fallback={<Loading />}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Auth Form */}
            <div>
              <AuthForm type={authType} userType={userType} />

              <div className="mt-6 text-center">
                {authType === 'login' ? (
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <button
                      onClick={() => setAuthType('signup')}
                      className="text-green-600 font-semibold hover:underline"
                    >
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <button
                      onClick={() => setAuthType('login')}
                      className="text-green-600 font-semibold hover:underline"
                    >
                      Log In
                    </button>
                  </p>
                )}
              </div>
            </div>

            {/* User Type Selection */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Choose Your Role</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setUserType('consumer')}
                    className={`w-full p-4 rounded-lg border-2 transition ${
                      userType === 'consumer'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold mb-2">🛒 I'm a Consumer</h3>
                    <p className="text-sm text-gray-600">
                      Browse and buy fresh produce from local farmers
                    </p>
                  </button>

                  <button
                    onClick={() => setUserType('farmer')}
                    className={`w-full p-4 rounded-lg border-2 transition ${
                      userType === 'farmer'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold mb-2">🌾 I'm a Farmer</h3>
                    <p className="text-sm text-gray-600">
                      Sell your products directly to consumers
                    </p>
                  </button>

                  <button
                    onClick={() => setUserType('delivery')}
                    className={`w-full p-4 rounded-lg border-2 transition ${
                      userType === 'delivery'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold mb-2">🚚 I'm a Delivery Rider</h3>
                    <p className="text-sm text-gray-600">Accept and deliver orders</p>
                  </button>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Why Choose FarmBridge?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Secure authentication with location verification</li>
                  <li>✓ Multi-language support (5 languages)</li>
                  <li>✓ Automatic product expiry management</li>
                  <li>✓ Offline payment tracking</li>
                  <li>✓ Location-based farmer discovery</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  )
}
