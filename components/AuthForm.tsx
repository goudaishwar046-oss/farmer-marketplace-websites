'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface AuthFormProps {
  type: 'login' | 'signup'
  userType: 'farmer' | 'consumer' | 'delivery'
}

export function AuthForm({ type, userType }: AuthFormProps) {
  const router = useRouter()
  const { signUp, signIn } = useAuth()
  const { translate } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    farmName: '',
    address: '',
    city: '',
    state: '',
  })

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          setError('Unable to get location. Please enable location services.')
        }
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (type === 'signup') {
        if (userType === 'farmer') {
          if (!location) {
            setError('Please allow location access to continue')
            setLoading(false)
            return
          }

          await signUp(formData.email, formData.password, 'farmer', {
            farmName: formData.farmName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            latitude: location.lat,
            longitude: location.lng,
          })
        } else {
          // For consumer and delivery roles we just create an auth user.
          await signUp(formData.email, formData.password, userType, {
            phone: formData.phone,
          })
        }
        
        // After signup, wait a moment for auth state to update
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        await signIn(formData.email, formData.password)
        // After signin, wait a moment for auth state to update
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Redirect - will be determined by the page component reading auth context
      router.push('/dashboard-redirect')
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred'
      
      // Better error messages
      if (errorMsg.includes('already exist') || errorMsg.includes('duplicate') || errorMsg.includes('unique')) {
        setError('This email is already registered. Please login instead.')
      } else if (errorMsg.includes('Invalid login credentials')) {
        setError('Email or password is incorrect. Please try again.')
      } else {
        setError(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {type === 'login'
            ? userType === 'farmer'
              ? translate('auth.loginFarmer')
              : userType === 'delivery'
              ? 'Delivery Login'
              : translate('auth.loginConsumer')
            : translate('auth.signup')}
        </CardTitle>
        <CardDescription>
          {type === 'login' ? 'Enter your credentials' : 'Create a new account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder={translate('auth.email')}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            type="password"
            placeholder={translate('auth.password')}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          {type === 'signup' && (
            <>
              <Input
                type="tel"
                placeholder={translate('auth.phone')}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />

              {userType === 'farmer' && (
                <>
                  <Input
                    placeholder={translate('auth.farmName')}
                    value={formData.farmName}
                    onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                    required
                  />

                  <Input
                    placeholder={translate('auth.address')}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />

                  <Input
                    placeholder={translate('auth.city')}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />

                  <Input
                    placeholder={translate('auth.state')}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />

                  <Button
                    type="button"
                    onClick={requestLocation}
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    {location
                      ? `✓ ${translate('auth.allowLocation')}`
                      : translate('auth.allowLocation')}
                  </Button>
                </>
              )}
            </>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {type === 'login' ? 'Login' : translate('auth.signup')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
