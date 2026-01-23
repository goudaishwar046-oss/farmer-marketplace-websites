'use client'

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
import { Loader2, Trash2, Edit2, Plus } from 'lucide-react'
import Link from 'next/link'

export default function FarmerDashboard() {
  const router = useRouter()
  const { user, userType, loading: authLoading } = useAuth()
  const { translate } = useLanguage()

  const [products, setProducts] = useState<Product[]>([])
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

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('farmer_id', farmer.id)
        .order('created_at', { ascending: false })

      if (productsError) throw productsError

      setProducts(productsData || [])
    } catch (error) {
      console.error('Error fetching farmer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase.from('products').delete().eq('id', productId)

      if (error) throw error

      setProducts(products.filter((p) => p.id !== productId))
    } catch (error) {
      console.error('Error deleting product:', error)
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{translate('nav.myProducts')}</h1>
          <Link href="/farmer/product/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {translate('product.upload')}
            </Button>
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const expiryDate = new Date(product.expiration_date)
              const today = new Date()
              const daysUntilExpiry = Math.ceil(
                (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              )
              const isExpired = daysUntilExpiry < 0

              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
                  {product.image_url && (
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}

                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle>{product.name}</CardTitle>
                        <CardDescription>{product.category}</CardDescription>
                      </div>
                      <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">{product.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">{translate('product.quantity')}</p>
                        <p className="font-semibold">
                          {product.quantity_available} {product.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">{translate('product.expiryDate')}</p>
                        <p className={`font-semibold ${isExpired ? 'text-red-600' : ''}`}>
                          {new Date(product.expiration_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Link href={`/farmer/product/${product.id}/edit`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full gap-2 bg-transparent">
                          <Edit2 className="w-4 h-4" />
                          {translate('common.edit')}
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 gap-2"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        {translate('common.delete')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">{translate('common.noData')}</p>
            <Link href="/farmer/product/new">
              <Button>{translate('product.upload')}</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
