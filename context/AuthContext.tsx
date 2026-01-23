'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  userType: 'farmer' | 'consumer' | null
  loading: boolean
  signUp: (email: string, password: string, userType: string, userData: any) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<'farmer' | 'consumer' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        if (session?.user) {
          const { data: farmer } = await supabase
            .from('farmers')
            .select('id')
            .eq('user_id', session.user.id)
            .single()

          setUserType(farmer ? 'farmer' : 'consumer')
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
        const { data: farmer } = await supabase
          .from('farmers')
          .select('id')
          .eq('user_id', session.user.id)
          .single()

        setUserType(farmer ? 'farmer' : 'consumer')
      } else {
        setUserType(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, userType: string, userData: any) => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) throw signUpError

    if (data.user && userType === 'farmer') {
      const { error: farmerError } = await supabase.from('farmers').insert([
        {
          user_id: data.user.id,
          business_name: userData.farmName,
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          state: userData.state,
          latitude: userData.latitude,
          longitude: userData.longitude,
          verified: false,
          rating: 0,
          total_reviews: 0,
        },
      ])

      if (farmerError) throw farmerError
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
