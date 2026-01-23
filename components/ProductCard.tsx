'use client'

import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Product, Farmer } from '@/lib/supabase'
import { MapPin, Star, AlertCircle } from 'lucide-react'

interface ProductCardProps {
  product: Product & { farmer?: Farmer }
  onAddToCart?: (product: Product) => void
  onViewDetails?: (product: Product) => void
}

export function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  const { translate } = useLanguage()
  const [quantity, setQuantity] = useState(1)

  const expiryDate = new Date(product.expiration_date)
  const today = new Date()
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const isExpired = daysUntilExpiry < 0
  const isExpiringSoon = daysUntilExpiry <= 3 && daysUntilExpiry > 0

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {product.image_url && (
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        )}
        {isExpired && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">{translate('product.expired')}</Badge>
          </div>
        )}
        {isExpiringSoon && (
          <Badge className="absolute top-2 right-2 bg-orange-500">
            {translate('product.expiryWarning')}
          </Badge>
        )}
      </div>

      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <CardDescription>{product.category}</CardDescription>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">₹{product.price}</p>
            <p className="text-sm text-gray-600">{product.quantity_available} {product.unit}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {product.farmer && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="font-medium">{product.farmer.business_name}</span>
            {product.farmer.rating > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{product.farmer.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

        <div className="pt-2 space-y-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onViewDetails?.(product)}
              disabled={isExpired}
            >
              {translate('market.viewDetails')}
            </Button>
            {onAddToCart && (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onAddToCart(product)}
                disabled={isExpired}
              >
                {translate('market.addToCart')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
