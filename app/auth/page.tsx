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
    <div
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=800&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="min-h-screen bg-black bg-opacity-50">
        <Navigation />

        <Suspense fallback={<Loading />}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Auth Form */}
              <div className="bg-white bg-opacity-95 p-8 rounded-xl shadow-xl">
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
                <h2 className="text-3xl font-bold mb-4 text-white">Choose Your Role</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setUserType('consumer')}
                    className={`w-full rounded-lg border-2 transition overflow-hidden ${
                      userType === 'consumer'
                        ? 'border-green-400 shadow-lg shadow-green-400'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1488459716781-8f52f7f3bef0?w=400&h=200&fit=crop"
                        alt="Consumer"
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                      <div className="absolute inset-0 flex flex-col justify-center px-4">
                        <h3 className="font-semibold mb-1 text-white text-lg">🛒 I'm a Consumer</h3>
                        <p className="text-sm text-gray-200">
                          Browse and buy fresh produce
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setUserType('farmer')}
                    className={`w-full rounded-lg border-2 transition overflow-hidden ${
                      userType === 'farmer'
                        ? 'border-green-400 shadow-lg shadow-green-400'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=400&h=200&fit=crop"
                        alt="Farmer"
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                      <div className="absolute inset-0 flex flex-col justify-center px-4">
                        <h3 className="font-semibold mb-1 text-white text-lg">🌾 I'm a Farmer</h3>
                        <p className="text-sm text-gray-200">
                          Sell your products directly
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setUserType('delivery')}
                    className={`w-full rounded-lg border-2 transition overflow-hidden ${
                      userType === 'delivery'
                        ? 'border-green-400 shadow-lg shadow-green-400'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1633117064589-cf94d64b2f01?w=400&h=200&fit=crop"
                        alt="Delivery"
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                      <div className="absolute inset-0 flex flex-col justify-center px-4">
                        <h3 className="font-semibold mb-1 text-white text-lg">🚚 I'm a Delivery Rider</h3>
                        <p className="text-sm text-gray-200">Accept and deliver orders</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-400 rounded-lg p-6 text-white shadow-xl">
                <h3 className="font-semibold text-white mb-3 text-lg">✨ Why Choose FarmBridge?</h3>
                <ul className="text-sm text-blue-100 space-y-2">
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
    </div>
  )
}
