'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { Navigation } from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import type { Farmer } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, MapPin, Phone, Star } from 'lucide-react'

export default function FarmerProfilePage() {
  const router = useRouter()
  const { user, userType, loading: authLoading, signOut } = useAuth()
  const { translate } = useLanguage()

  const [farmer, setFarmer] = useState<Farmer | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [signOutLoading, setSignOutLoading] = useState(false)

  const [formData, setFormData] = useState({
    businessName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  })

  useEffect(() => {
    if (!authLoading && (userType !== 'farmer' || !user)) {
      router.push('/auth?type=farmer')
    }
  }, [user, userType, authLoading, router])

  useEffect(() => {
    if (user && userType === 'farmer') {
      fetchFarmerData()
    }
  }, [user, userType])

  const fetchFarmerData = async () => {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error) throw error

      setFarmer(data)
      setFormData({
        businessName: data.business_name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
      })
    } catch (error) {
      console.error('Error fetching farmer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('farmers')
        .update({
          business_name: formData.businessName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
        })
        .eq('id', farmer?.id)

      if (error) throw error

      setEditing(false)
      fetchFarmerData()
    } catch (error) {
      console.error('Error updating farmer data:', error)
    }
  }

  const handleSignOut = async () => {
    setSignOutLoading(true)
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setSignOutLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">{translate('nav.profile')}</h1>

        {farmer && (
          <div className="space-y-6">
            {/* Business Info Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{translate('farmer.businessName')}</CardTitle>
                    <CardDescription>Your farm/business information</CardDescription>
                  </div>
                  {!editing && (
                    <Button size="sm" onClick={() => setEditing(true)}>
                      {translate('common.edit')}
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {editing ? (
                  <>
                    <Input
                      placeholder={translate('auth.farmName')}
                      value={formData.businessName}
                      onChange={(e) =>
                        setFormData({ ...formData, businessName: e.target.value })
                      }
                    />
                    <Input
                      placeholder={translate('auth.phone')}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <Input
                      placeholder={translate('auth.address')}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    <Input
                      placeholder={translate('auth.city')}
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                    <Input
                      placeholder={translate('auth.state')}
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />

                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={handleSave}>
                        {translate('common.save')}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => {
                          setEditing(false)
                          fetchFarmerData()
                        }}
                      >
                        {translate('common.cancel')}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">{translate('farmer.businessName')}</p>
                        <p className="font-medium">{farmer.business_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{farmer.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium">
                          {farmer.address}, {farmer.city}, {farmer.state}
                        </p>
                      </div>
                    </div>

                    {farmer.rating > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <div>
                          <p className="text-sm text-gray-600">Rating</p>
                          <p className="font-medium">
                            {farmer.rating.toFixed(1)} ({farmer.total_reviews} reviews)
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSignOut}
                  variant="destructive"
                  className="w-full"
                  disabled={signOutLoading}
                >
                  {signOutLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {translate('nav.logout')}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
