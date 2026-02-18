'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/Navigation'
import { TrendingUp, Plus, Package, ShoppingCart, AlertCircle, MapPin } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  quantity: number
  unit: string
  expiry_date: string
  is_expired: boolean
}

interface Order {
  id: string
  consumer_id: string
  quantity: number
  total_price: number
  order_status: string
  created_at: string
}

export default function FarmerDashboard() {
  const router = useRouter()
  const { user, userType, loading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [farmProfile, setFarmProfile] = useState<any>(null)
  const [stats, setStats] = useState({ totalProducts: 0, activeOrders: 0, revenue: 0 })
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && (!user || userType !== 'farmer')) {
      router.push('/auth')
    }
  }, [user, userType, loading, router])

  useEffect(() => {
    if (user) {
      fetchFarmData()
    }
  }, [user])

  const fetchFarmData = async () => {
    try {
      // Get farm profile
      const { data: farmer } = await supabase
        .from('farmers')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      setFarmProfile(farmer)

      // Get products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('farmer_id', farmer?.id)
        .order('created_at', { ascending: false })

      setProducts(productsData || [])

      // Get orders for this farmer
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('farmer_id', farmer?.id)
        .order('created_at', { ascending: false })

      setOrders(ordersData || [])

      // Calculate stats
      const activeOrders = (ordersData || []).filter(
        (o) => o.order_status === 'pending' || o.order_status === 'confirmed'
      ).length
      const revenue = (ordersData || []).reduce((sum, o) => sum + o.total_price, 0)

      setStats({
        totalProducts: (productsData || []).length,
        activeOrders,
        revenue,
      })
    } finally {
      setLoadingData(false)
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-600 to-green-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">🌾 Farmer Dashboard</h1>
          <p className="text-green-100">Manage your farm, products, and orders</p>
          {farmProfile && (
            <p className="text-green-100 mt-2">📍 {farmProfile.business_name} • {farmProfile.city}, {farmProfile.state}</p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-green-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="text-4xl font-bold text-green-600">{stats.totalProducts}</div>
                <Package className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="text-4xl font-bold text-blue-600">{stats.activeOrders}</div>
                <ShoppingCart className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="text-4xl font-bold text-amber-600">₹{stats.revenue.toFixed(0)}</div>
                <TrendingUp className="w-8 h-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/farmer/product/new">
            <Card className="hover:shadow-lg cursor-pointer transition hover:bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Product
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">List a new product for sale</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/farmer/orders">
            <Card className="hover:shadow-lg cursor-pointer transition hover:bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  My Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">View and manage orders</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/farmer/profile">
            <Card className="hover:shadow-lg cursor-pointer transition hover:bg-amber-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Farm Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Update farm details & location</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Products Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">📦 Your Products ({products.length})</h2>
            <Link href="/farmer/product/new">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className={`${
                    product.is_expired ? 'border-red-300 bg-red-50' : 'border-l-4 border-l-green-500'
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                        <div className="flex gap-6 mt-2 text-sm text-gray-600">
                          <span>💰 ₹{product.price} per {product.unit}</span>
                          <span>📦 {product.quantity} units available</span>
                          <span>📅 Expires: {new Date(product.expiry_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {product.is_expired ? (
                          <div className="flex items-center gap-1 text-red-600 font-bold">
                            <AlertCircle className="w-4 h-4" />
                            EXPIRED
                          </div>
                        ) : (
                          <div className="text-green-600 font-bold">✓ Active</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-50">
              <CardContent className="pt-6 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No products listed yet</p>
                <Link href="/farmer/product/new">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Add Your First Product
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Orders */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📋 Recent Orders ({orders.length})</h2>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <Card key={order.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg">Order #{order.id.slice(-6)}</p>
                        <p className="text-sm text-gray-600">
                          {order.quantity} units • ₹{order.total_price}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            order.order_status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : order.order_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-50">
              <CardContent className="pt-6 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
