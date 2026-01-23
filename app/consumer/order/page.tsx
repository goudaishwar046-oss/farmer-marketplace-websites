'use client'

import React from "react"
import { Suspense } from 'react'
import Loading from './loading'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function OrderPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { translate } = useLanguage()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [orderData, setOrderData] = useState({
    quantity: 1,
    deliveryAddress: '',
    paymentMethod: 'cash_on_delivery',
    notes: '',
  })

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const productId = searchParams.get('productId')
    if (productId) {
      fetchProduct(productId)
    }
  }, [])

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(
          `
          *,
          farmer:farmers(*)
        `
        )
        .eq('id', productId)
        .single()

      if (fetchError) throw fetchError

      setProduct(data)
    } catch (err) {
      console.error('Error fetching product:', err)
      setError('Product not found')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      if (!product || !user) {
        setError('Invalid request')
        return
      }

      const totalPrice = product.price * orderData.quantity

      const { error: orderError } = await supabase.from('orders').insert([
        {
          consumer_id: user.id,
          farmer_id: product.farmer_id,
          product_id: product.id,
          quantity: orderData.quantity,
          total_price: totalPrice,
          status: 'pending',
          delivery_address: orderData.deliveryAddress,
          payment_method: orderData.paymentMethod,
          notes: orderData.notes,
        },
      ])

      if (orderError) throw orderError

      router.push('/consumer/orders')
    } catch (err: any) {
      setError(err.message || 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Suspense fallback={<Loading />}>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        </Suspense>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-600">{translate('common.error')}</p>
        </div>
      </div>
    )
  }

  const totalPrice = product.price * orderData.quantity

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">{translate('order.place')}</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.farmer?.business_name}</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Product Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>{translate('product.price')}</span>
                      <span className="font-semibold">₹{product.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{translate('product.quantity')}</span>
                      <span>{product.quantity_available} {product.unit} {translate('common.available')}</span>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {translate('order.quantity')}
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max={product.quantity_available}
                      value={orderData.quantity}
                      onChange={(e) =>
                        setOrderData({ ...orderData, quantity: parseInt(e.target.value) || 1 })
                      }
                      required
                    />
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {translate('order.deliveryAddress')}
                    </label>
                    <Input
                      placeholder="Enter delivery address"
                      value={orderData.deliveryAddress}
                      onChange={(e) =>
                        setOrderData({ ...orderData, deliveryAddress: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {translate('order.paymentMethod')}
                    </label>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
                      ✓ {translate('order.paymentMethod')} - Cash payment at delivery
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {translate('order.notes')}
                    </label>
                    <Input
                      placeholder="Add any special instructions"
                      value={orderData.notes}
                      onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {translate('order.place')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{translate('order.place')}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {product.image_url && (
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded"
                  />
                )}

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>{product.name}</span>
                    <span>₹{product.price}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Quantity: {orderData.quantity} {product.unit}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{translate('order.totalPrice')}</span>
                    <span className="text-green-600">₹{totalPrice}</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    ({translate('order.paymentMethod')})
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
