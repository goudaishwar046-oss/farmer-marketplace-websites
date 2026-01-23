'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { Navigation } from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Loader2, MapPin, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react'

export default function FarmerOrdersPage() {
  const router = useRouter()
  const { user, userType, loading: authLoading } = useAuth()
  const { translate } = useLanguage()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [farmerId, setFarmerId] = useState<string | null>(null)

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
      const { data: farmer, error: farmerError } = await supabase
        .from('farmers')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (farmerError) throw farmerError

      setFarmerId(farmer.id)

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('farmer_id', farmer.id)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      setOrders(ordersData || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o)))
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">{translate('nav.orders')}</h1>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                      <CardDescription>
                        {new Date(order.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-600">{translate('order.deliveryAddress')}</span>
                      </div>
                      <p className="font-medium">{order.delivery_address}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-600">{translate('order.totalPrice')}</span>
                      </div>
                      <p className="font-medium text-lg text-green-600">₹{order.total_price}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-600">Qty: {order.quantity}</span>
                      </div>
                      <p className="font-medium">
                        {order.payment_method === 'cash_on_delivery'
                          ? 'Cash on Delivery'
                          : order.payment_method}
                      </p>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mb-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        <strong>Notes:</strong> {order.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        className="gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirm Order
                      </Button>
                    )}

                    {order.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Completed
                      </Button>
                    )}

                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">{translate('common.noData')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
