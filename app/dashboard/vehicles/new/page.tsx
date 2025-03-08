"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import ListingForm from '@/components/listings/ListingForm'

export default function NewVehiclePage() {
  const router = useRouter()
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Create New Vehicle</h1>
        <Link href="/dashboard/vehicles">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      {/* Use the ListingForm component which includes image upload functionality */}
      <ListingForm 
        mode="create" 
      />
    </div>
  )
} 