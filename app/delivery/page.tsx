"use client"

import React from 'react'
import { Navigation } from '@/components/Navigation'

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-4">Delivery Dashboard</h1>
        <p className="text-gray-600">Welcome — this is a placeholder delivery rider dashboard.</p>
      </div>
    </div>
  )
}
