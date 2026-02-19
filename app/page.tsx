import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/Navigation'
import { Leaf, MapPin, Users, Truck } from 'lucide-react'

export const metadata = {
  title: 'FarmBridge - Local Farmer Marketplace',
  description: 'Connect with local farmers and get fresh produce delivered to your doorstep',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Fresh Produce,{' '}
              <span className="text-green-600">Direct from Farmers</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              FarmBridge connects consumers with local farmers, ensuring fresh, authentic products
              at fair prices. Browse nearby farms, place orders, and support local agriculture.
            </p>

            <div className="flex gap-4 flex-wrap">
              <Link href="/auth">
                <Button size="lg" className="bg-white text-green-700">
                  Login
                </Button>
              </Link>
              <Link href="/auth?signup=1">
                <Button size="lg" variant="outline" className="border-green-600 text-green-600">
                  Register
                </Button>
              </Link>
            </div>
          </div>
          
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-gray-900 text-white py-12 my-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">500+</div>
              <p className="text-gray-300">Active Farmers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">10,000+</div>
              <p className="text-gray-300">Happy Consumers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
              <p className="text-gray-300">Fast Delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose FarmBridge?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            
            <h3 className="font-semibold mb-2">Fresh & Organic</h3>
            <p className="text-gray-600 text-sm">
              Get farm-fresh produce directly from local farmers
            </p>
          </div>

          <div className="text-center">
            
            <div className="flex justify-center mb-2">
              <MapPin className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Nearby Farmers</h3>
            <p className="text-gray-600 text-sm">
              Find and connect with farmers in your locality
            </p>
          </div>

          <div className="text-center">
            
            <div className="flex justify-center mb-2">
              <Users className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Fair Prices</h3>
            <p className="text-gray-600 text-sm">
              Support farmers with transparent and fair pricing
            </p>
          </div>

          <div className="text-center">
            
            <div className="flex justify-center mb-2">
              <Truck className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Easy Ordering</h3>
            <p className="text-gray-600 text-sm">
              Simple offline payment and local delivery
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="mb-8 text-green-50">
            Join thousands of consumers and farmers building a better local food system
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth?type=consumer">
              <Button size="lg" variant="secondary">
                Browse Products
              </Button>
            </Link>
            <Link href="/auth?type=farmer">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-green-700 bg-transparent">
                Start Selling
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">FarmBridge</h3>
              <p className="text-sm">
                Connecting communities with fresh, local produce
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Consumers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/consumer" className="hover:text-white">Browse Products</Link></li>
                <li><Link href="/consumer/map" className="hover:text-white">Find Farmers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Farmers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/farmer/dashboard" className="hover:text-white">My Products</Link></li>
                <li><Link href="/farmer/orders" className="hover:text-white">View Orders</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2024 FarmBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
