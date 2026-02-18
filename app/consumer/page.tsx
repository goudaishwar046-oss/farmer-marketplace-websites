'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/Navigation'
import { MapPin, Phone, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Farmer {
  id: string
  business_name: string
  phone: string
  address: string
  city: string
  state: string
  latitude: number
  longitude: number
  rating: number
  total_reviews: number
  verified: boolean
}

export default function ConsumerPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [nearestFarmers, setNearestFarmers] = useState<Farmer[]>([])
  const [deliveryOption, setDeliveryOption] = useState<'self' | 'delivery' | 'direct'>('delivery')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loadingFarmers, setLoadingFarmers] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => console.log('Location access denied')
      )
    }

    // Fetch all farmers
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
        console.error('Error fetching farmers:', error)
        return
      }

      setFarmers(data || [])

      // Find nearest farmers if location available
      if (location) {
        const sorted = (data || []).sort((a, b) => {
          const distA = calculateDistance(location.lat, location.lng, a.latitude, a.longitude)
          const distB = calculateDistance(location.lat, location.lng, b.latitude, b.longitude)
          return distA - distB
        })
        setNearestFarmers(sorted.slice(0, 5))
      }
    } finally {
      setLoadingFarmers(false)
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Fresh From Farms, Straight to You!</h1>
          <p className="text-green-100 text-xl mb-6">Buy directly from local farmers with 3 delivery options</p>

          {/* Delivery Options */}
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">How Do You Want to Buy?</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => setDeliveryOption('direct')}
                className={`p-4 rounded-lg transition ${
                  deliveryOption === 'direct'
                    ? 'bg-white text-green-600'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                <div className="text-3xl mb-2">👤</div>
                <div className="font-semibold">Direct Meet</div>
                <div className="text-sm opacity-90">Meet farmer & buy in person</div>
              </button>

              <button
                onClick={() => setDeliveryOption('self')}
                className={`p-4 rounded-lg transition ${
                  deliveryOption === 'self'
                    ? 'bg-white text-green-600'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                <div className="text-3xl mb-2">🏠</div>
                <div className="font-semibold">Pickup at Farm</div>
                <div className="text-sm opacity-90">Order online, collect later</div>
              </button>

              <button
                onClick={() => setDeliveryOption('delivery')}
                className={`p-4 rounded-lg transition ${
                  deliveryOption === 'delivery'
                    ? 'bg-white text-green-600'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                <div className="text-3xl mb-2">🚚</div>
                <div className="font-semibold">Home Delivery</div>
                <div className="text-sm opacity-90">We deliver to your door</div>
              </button>
            </div>
          </div>

          {/* Location Info */}
          {location && (
            <div className="flex items-center text-green-100">
              <MapPin className="w-5 h-5 mr-2" />
              <span>📍 Your location detected - showing nearest farmers first</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Nearest Farmers */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">🌍 Nearest Farmers To You</h2>
            <span className="ml-auto text-lg font-semibold text-green-600">({nearestFarmers.length} found)</span>
          </div>

          {loadingFarmers ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading nearby farmers...</p>
            </div>
          ) : nearestFarmers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearestFarmers.map((farmer) => (
                <FarmerCard key={farmer.id} farmer={farmer} deliveryOption={deliveryOption} />
              ))}
            </div>
          ) : (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <p className="text-yellow-800">📍 Enable location to see nearest farmers</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* All Farmers */}
        <div>
          <div className="flex items-center mb-6">
            <Star className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">⭐ Top Rated Farmers</h2>
            <span className="ml-auto text-lg font-semibold text-green-600">({farmers.length})</span>
          </div>

          {farmers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farmers.map((farmer) => (
                <FarmerCard key={farmer.id} farmer={farmer} deliveryOption={deliveryOption} />
              ))}
            </div>
          ) : (
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <p className="text-gray-600">No farmers available yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          <Link href="/consumer/orders">
            <Card className="hover:shadow-lg cursor-pointer transition hover:bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg">📦 My Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Track your orders & delivery status</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/consumer/map">
            <Card className="hover:shadow-lg cursor-pointer transition hover:bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg">🗺️ Farmer Map</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">See all farms on interactive map</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/consumer/profile">
            <Card className="hover:shadow-lg cursor-pointer transition hover:bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg">👤 My Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Manage addresses & preferences</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}

function FarmerCard({
  farmer,
  deliveryOption,
}: {
  farmer: Farmer
  deliveryOption: 'self' | 'delivery' | 'direct'
}) {
  // Array of farm/agricultural images
  const farmImages = [
    'https://images.unsplash.com/photo-1500382017468-7049bae30402?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1488459716781-8f52f7f3bef0?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1464226184837-280ecc440399?w=400&h=250&fit=crop',
  ]

  // Use farmer hash to consistently select image
  const imageIndex = farmer.id.charCodeAt(0) % farmImages.length
  const farmImage = farmImages[imageIndex]

  return (
    <Card className="hover:shadow-xl transition overflow-hidden border-l-4 border-l-green-500">
      <div className="w-full h-40 overflow-hidden bg-gray-200">
        <img
          src={farmImage}
          alt={farmer.business_name}
          className="w-full h-full object-cover hover:scale-105 transition duration-300"
        />
      </div>

      <CardHeader className="bg-green-50 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{farmer.business_name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">📍 {farmer.city}, {farmer.state}</p>
          </div>
          {farmer.verified && <span className="text-green-600 text-2xl">✅</span>}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Rating */}
        <div className="flex items-center mb-4 bg-yellow-50 p-2 rounded">
          <Star className="w-5 h-5 text-yellow-500 mr-2" />
          <span className="font-bold">{farmer.rating.toFixed(1)}/5</span>
          <span className="text-gray-600 ml-2">({farmer.total_reviews})</span>
        </div>

        {/* Contact */}
        <div className="flex items-center text-gray-700 mb-3">
          <Phone className="w-4 h-4 mr-2 text-green-600" />
          <span className="text-sm font-mono">{farmer.phone}</span>
        </div>

        {/* Address */}
        <div className="flex items-start text-gray-700 mb-4">
          <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0 text-green-600" />
          <span className="text-sm">{farmer.address}</span>
        </div>

        {/* Action Button */}
        <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2">
          {deliveryOption === 'direct' && '📍 View Location & Contact'}
          {deliveryOption === 'self' && '📦 Order for Pickup'}
          {deliveryOption === 'delivery' && '🚚 Order with Delivery'}
        </Button>
      </CardContent>
    </Card>
  )
}
