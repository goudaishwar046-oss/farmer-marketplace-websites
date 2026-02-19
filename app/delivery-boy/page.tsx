'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/Navigation'
import { MapPin, Check, X, TrendingUp, Package, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Order {
  id: string
  farmer_id: string
  consumer_id: string
  quantity: number
  total_price: number
  order_status: string
  delivery_address: string
  created_at: string
  farmer?: {
    business_name: string
    latitude: number
    longitude: number
    address: string
    city: string
    state: string
  }
}

interface Farmer {
  id: string
  business_name: string
  latitude: number
  longitude: number
  address: string
  city: string
  state: string
}

export default function DeliveryDashboard() {
  const router = useRouter()
  const { user, userType, loading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [deliveryProfile, setDeliveryProfile] = useState<any>(null)
  const [stats, setStats] = useState({ completed: 0, pending: 0, earnings: 0 })
  const [loadingData, setLoadingData] = useState(true)
  const [acceptingOrder, setAcceptingOrder] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!user || userType !== 'delivery')) {
      router.push('/auth')
    }
  }, [user, userType, loading, router])

  useEffect(() => {
    if (user) {
      fetchDeliveryData()
    }
  }, [user])

  const fetchDeliveryData = async () => {
    try {
      // Get delivery boy profile
      const { data: delivery } = await supabase
        .from('delivery_boys')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      setDeliveryProfile(delivery)

      // Get all orders that need delivery (status: pending or confirmed)
      const { data: ordersData } = await supabase
        .from('orders')
        .select(
          `
          id,
          farmer_id,
          consumer_id,
          quantity,
          total_price,
          order_status,
          delivery_address,
          created_at,
          farmer:farmer_id (
            business_name,
            latitude,
            longitude,
            address,
            city,
            state
          )
        `
        )
        .in('order_status', ['pending', 'confirmed'])
        .order('created_at', { ascending: false })

      setOrders(ordersData || [])

      // Get all farmer locations
      const { data: farmersData } = await supabase
        .from('farmers')
        .select('id, business_name, latitude, longitude, address, city, state')

      setFarmers(farmersData || [])

      // Calculate stats - orders assigned to this delivery boy
      const { data: assignedOrders } = await supabase
        .from('orders')
        .select('order_status, total_price')
        .eq('delivery_boy_id', delivery?.id)

      const completed = (assignedOrders || []).filter((o) => o.order_status === 'completed').length
      const pending = (assignedOrders || []).filter((o) => o.order_status === 'pending').length
      const earnings = (assignedOrders || [])
        .filter((o) => o.order_status === 'completed')
        .reduce((sum, o) => sum + (o.total_price * 0.1), 0) // 10% commission

      setStats({ completed, pending, earnings })
    } finally {
      setLoadingData(false)
    }
  }

  const handleAcceptOrder = async (orderId: string) => {
    setAcceptingOrder(orderId)
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          delivery_boy_id: deliveryProfile?.id,
          order_status: 'confirmed',
        })
        .eq('id', orderId)

      if (error) throw error

      // Refresh data
      setOrders(orders.filter((o) => o.id !== orderId))
      alert('Order accepted! You can now proceed with delivery.')
    } catch (error) {
      console.error('Error accepting order:', error)
      alert('Failed to accept order')
    } finally {
      setAcceptingOrder(null)
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">🚚 Delivery Dashboard</h1>
          <p className="text-blue-100">Find nearby farmers and manage deliveries</p>
          {deliveryProfile && (
            <p className="text-blue-100 mt-2">
              📍 {deliveryProfile.city}, {deliveryProfile.state}
            </p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-green-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Completed Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="text-4xl font-bold text-green-600">{stats.completed}</div>
                <Check className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="text-4xl font-bold text-orange-600">{stats.pending}</div>
                <Package className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="text-4xl font-bold text-purple-600">₹{stats.earnings.toFixed(0)}</div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nearby Farmers */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📍 Nearby Farmers ({farmers.length})</h2>

          {farmers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farmers.map((farmer) => {
                const farmImages = [
                  'https://images.unsplash.com/photo-1500382017468-7049bae30402?w=400&h=250&fit=crop',
                  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=250&fit=crop',
                  'https://images.unsplash.com/photo-1488459716781-8f52f7f3bef0?w=400&h=250&fit=crop',
                  'https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=400&h=250&fit=crop',
                ]
                const imageIndex = farmer.id.charCodeAt(0) % farmImages.length
                return (
                  <Card key={farmer.id} className="border-l-4 border-l-green-500 hover:shadow-lg transition overflow-hidden">
                    <div className="relative w-full h-40 overflow-hidden">
                      <Image
                        src={farmImages[imageIndex]}
                        alt={farmer.business_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{farmer.business_name}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                          <div>
                            <p>{farmer.address}</p>
                            <p className="text-xs">
                              {farmer.city}, {farmer.state}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          📌 Lat: {farmer.latitude?.toFixed(4)}, Lng: {farmer.longitude?.toFixed(4)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="bg-gray-50">
              <CardContent className="pt-6 text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No farmers available in your area yet</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Available Deliveries */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📦 Available Deliveries ({orders.length})</h2>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">Order #{order.id.slice(-6)}</h3>

                        {/* Farmer Location */}
                        <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                          <p className="text-sm font-semibold text-green-900 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            From Farmer: {order.farmer?.business_name}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            📍 {order.farmer?.address}, {order.farmer?.city}, {order.farmer?.state}
                          </p>
                        </div>

                        {/* Delivery Location */}
                        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Deliver To: Customer
                          </p>
                          <p className="text-xs text-gray-600 mt-1">📍 {order.delivery_address}</p>
                        </div>

                        {/* Order Details */}
                        <div className="mt-3 flex gap-4 text-sm">
                          <span className="text-gray-600">
                            📦 <strong>{order.quantity}</strong> units
                          </span>
                          <span className="text-purple-600 font-semibold">
                            💰 ₹{order.total_price}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          📅 {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>

                      <Button
                        onClick={() => handleAcceptOrder(order.id)}
                        disabled={acceptingOrder === order.id}
                        className="bg-blue-600 hover:bg-blue-700 gap-2"
                      >
                        {acceptingOrder === order.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Accept Delivery
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-50">
              <CardContent className="pt-6 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending deliveries at this moment</p>
                <p className="text-gray-500 text-sm mt-2">Check back later for new orders</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
