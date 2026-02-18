'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { Navigation } from '@/components/Navigation'
import { supabase } from '@/lib/supabase'
import type { Farmer } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Loader2, MapPin, Star, Phone } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function MapPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { translate } = useLanguage()

  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [sortedFarmers, setSortedFarmers] = useState<(Farmer & { distance: number })[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?type=consumer')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      })
    }

    fetchFarmers()
  }, [])

  const fetchFarmers = async () => {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('verified', true)
        .order('rating', { ascending: false })

      if (error) {
        console.error('Supabase farmers error:', error)
        setFarmers([])
        return
      }

      setFarmers(data || [])
    } catch (error) {
      console.error('Error fetching farmers:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  useEffect(() => {
    if (userLocation) {
      const farmersWithDistance = farmers.map((farmer) => ({
        ...farmer,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          farmer.latitude,
          farmer.longitude
        ),
      }))

      farmersWithDistance.sort((a, b) => a.distance - b.distance)
      setSortedFarmers(farmersWithDistance)
    }
  }, [farmers, userLocation])

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2">{translate('map.title')}</h1>
        <p className="text-gray-600 mb-8">
          {userLocation ? translate('map.nearbyFarmers') : 'Enable location to see nearby farmers'}
        </p>

        {/* Map Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center mb-4">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                Interactive map would display here
                <br />
                (Requires additional map library integration)
              </p>
            </div>
          </div>

          {userLocation && (
            <p className="text-sm text-green-600">
              Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Farmers List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">{translate('market.nearby')}</h2>

          {sortedFarmers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedFarmers.map((farmer) => (
                <Card key={farmer.id} className="hover:shadow-lg transition">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle>{farmer.business_name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {farmer.distance.toFixed(1)} {translate('map.kilometer')}
                        </CardDescription>
                      </div>
                      {farmer.rating > 0 && (
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-sm">{farmer.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">{farmer.address}</p>
                      <p className="text-sm text-gray-600">
                        {farmer.city}, {farmer.state}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-green-600" />
                      <span>{farmer.phone}</span>
                    </div>

                    {farmer.total_reviews > 0 && (
                      <p className="text-sm text-gray-600">
                        {farmer.total_reviews} {translate('farmer.reviews')}
                      </p>
                    )}

                    <Link href={`/consumer?farmer=${farmer.id}`}>
                      <Button className="w-full gap-2">
                        <MapPin className="w-4 h-4" />
                        {translate('market.viewDetails')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">{translate('common.noData')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
