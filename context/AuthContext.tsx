'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  userType: 'farmer' | 'consumer' | 'delivery' | null
  loading: boolean
  signUp: (email: string, password: string, userType: string, userData: any) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<'farmer' | 'consumer' | 'delivery' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        if (session?.user) {
          // Check what type of profile the user has
          const { data: farmer } = await supabase
            .from('farmers')
            .select('id')
            .eq('user_id', session.user.id)
            .single()

          if (farmer) {
            setUserType('farmer')
          } else {
            // Check if delivery
            const { data: delivery } = await supabase
              .from('delivery_boys')
              .select('id')
              .eq('user_id', session.user.id)
              .single()

            if (delivery) {
              setUserType('delivery')
            } else {
              // Default to consumer
              setUserType('consumer')
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        // Check what type of profile the user has
        const { data: farmer } = await supabase
          .from('farmers')
          .select('id')
          .eq('user_id', session.user.id)
          .single()

        if (farmer) {
          setUserType('farmer')
        } else {
          const { data: delivery } = await supabase
            .from('delivery_boys')
            .select('id')
            .eq('user_id', session.user.id)
            .single()

          if (delivery) {
            setUserType('delivery')
          } else {
            setUserType('consumer')
          }
        }
      } else {
        setUserType(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, userType: string, userData: any) => {
    let data: any = null
    try {
      // Try available signup methods (some SDK versions differ)
      let res: any

      if (supabase?.auth && typeof supabase.auth.signUp === 'function') {
        res = await supabase.auth.signUp({ email, password })
      } else if (supabase?.auth && typeof (supabase.auth as any).signUpWithPassword === 'function') {
        res = await (supabase.auth as any).signUpWithPassword({ email, password })
      } else {
        throw new Error('Supabase auth signUp method not found on client')
      }

      // Normalize response: newer SDKs return { data: { user } } or { user }
      data = res?.data ?? res

      if (res?.error) {
        console.error('Supabase signUp error detail:', res.error)
        throw res.error
      }
    } catch (err: any) {
      console.error('SignUp failed:', err)

      const errorMsg = String(err?.message || err).toLowerCase()

      // Check for duplicate email/already exists
      if (errorMsg.includes('already exist') || errorMsg.includes('duplicate') || errorMsg.includes('user already registered')) {
        throw new Error('This email is already registered. Please login instead.')
      }

      // If network / CORS issue (e.g., 'Failed to fetch'), try server-side signup endpoint
      if (err && (err.message === 'Failed to fetch' || String(err).includes('Failed to fetch'))) {
        try {
          const resp = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, userType, userData }),
          })

          // Make sure the response is JSON (server error pages return HTML)
          const contentType = resp.headers.get('content-type') || ''
          if (!resp.ok) {
            // Try to parse JSON error, otherwise throw status text
            if (contentType.includes('application/json')) {
              const jsonErr = await resp.json()
              throw new Error(jsonErr?.error || JSON.stringify(jsonErr))
            }
            throw new Error(`Signup fallback failed: ${resp.status} ${resp.statusText}`)
          }

          if (!contentType.includes('application/json')) {
            throw new Error('Signup fallback returned non-JSON response')
          }

          const json = await resp.json()
          if (json.error) throw new Error(json.error)

          data = json.data ?? json
        } catch (serverErr: any) {
          console.error('Server-side signup fallback failed:', serverErr)
          throw new Error(serverErr?.message || String(serverErr))
        }
      } else {
        throw new Error(err?.message || String(err))
      }
    }

    // Persist a row in the `users` table so application-level profiles exist
    if (data.user) {
      const { error: userError } = await supabase.from('users').insert([
        {
          id: data.user.id,
          email,
          user_type: userType,
          full_name: userData.fullName || '',
          phone: userData.phone || null,
        },
      ])

      if (userError) {
        console.error('User insert error:', userError)
        throw new Error('Failed to create user profile. ' + userError.message)
      }

      if (userType === 'farmer') {
        const { error: farmerError } = await supabase.from('farmers').insert([
          {
            user_id: data.user.id,
            business_name: userData.farmName,
            description: userData.description || null,
            phone: userData.phone || null,
            address: userData.address || null,
            city: userData.city || null,
            state: userData.state || null,
            latitude: userData.latitude || 0,
            longitude: userData.longitude || 0,
            rating: 0,
            total_reviews: 0,
            verified: false,
          },
        ])

        if (farmerError) {
          console.error('Farmer insert error:', farmerError)
          throw new Error('Failed to create farmer profile. ' + farmerError.message)
        }
      }

      if (userType === 'delivery') {
        const { error: deliveryError } = await supabase.from('delivery_boys').insert([
          {
            user_id: data.user.id,
            phone: userData.phone || null,
            vehicle_type: userData.vehicleType || null,
            is_available: true,
          },
        ])

        if (deliveryError) {
          console.error('Delivery insert error:', deliveryError)
          throw new Error('Failed to create delivery profile. ' + deliveryError.message)
        }
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, userType, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
