'use client'

import React from "react"

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Loader2, Upload } from 'lucide-react'

export default function NewProductPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { translate } = useLanguage()

  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Vegetables',
    quantity: '',
    unit: 'kg',
    expiryDate: '',
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Get farmer ID
      const { data: farmer, error: farmerError } = await supabase
        .from('farmers')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (farmerError) throw farmerError

      let imageUrl = null

      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`
        const { error: uploadError, data } = await supabase.storage
          .from('product_images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('product_images').getPublicUrl(fileName)

        imageUrl = publicUrl
      }

      const { error: insertError } = await supabase.from('products').insert([
        {
          farmer_id: farmer.id,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          quantity_available: parseInt(formData.quantity),
          unit: formData.unit,
          expiration_date: formData.expiryDate,
          image_url: imageUrl,
        },
      ])

      if (insertError) throw insertError

      router.push('/farmer/dashboard')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{translate('product.upload')}</CardTitle>
            <CardDescription>Add a new product to your inventory</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {translate('product.selectImage')}
                </label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-green-600 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-input"
                  />
                  <label htmlFor="image-input" className="cursor-pointer block">
                    {imagePreview ? (
                      <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-48 h-48 object-cover mx-auto rounded" />
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-gray-600">Click to upload product image</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Product Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder={translate('product.name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <Input
                  type="number"
                  placeholder={translate('product.price')}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <Input
                placeholder={translate('product.description')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder={translate('product.category')}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />

                <Input
                  placeholder={translate('product.quantity')}
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder={translate('product.unit')}
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />

                <Input
                  type="date"
                  placeholder={translate('product.expiryDate')}
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {translate('product.upload')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
