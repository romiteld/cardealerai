import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { PlusIcon, ArrowDownUp, SearchIcon, FilterIcon } from 'lucide-react'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Vehicles - CarDealerAI',
  description: 'Manage your vehicle listings',
}

interface Vehicle {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  status: string
  images: {
    url: string
    publicId: string
  }[]
  createdAt: string
}

async function getVehicleListings() {
  try {
    const response = await fetch('/api/listings', {
      cache: 'no-store',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch vehicle listings')
    }
    
    const data = await response.json()
    return data.data as Vehicle[]
  } catch (error) {
    console.error('Error fetching vehicle listings:', error)
    return []
  }
}

export default async function VehiclesPage() {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const vehicles = await getVehicleListings()
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your vehicle listings
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vehicles/new">
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              <span>Add Vehicle</span>
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-hidden">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center border rounded-md px-3 py-2 w-72">
            <SearchIcon className="h-4 w-4 text-muted-foreground mr-2" />
            <input
              type="text"
              placeholder="Search vehicles..."
              className="flex-1 bg-transparent outline-none"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowDownUp className="h-4 w-4" />
              <span>Sort</span>
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60">
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Vehicle</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Price</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Mileage</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Added</th>
                <th className="py-3 px-4 text-right text-sm font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vehicles.length > 0 ? (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {vehicle.images?.[0]?.url ? (
                          <img
                            src={vehicle.images[0].url}
                            alt={vehicle.title}
                            className="h-10 w-16 object-cover rounded"
                          />
                        ) : (
                          <div className="h-10 w-16 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                            <span className="text-xs text-slate-500 dark:text-slate-400">No image</span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{vehicle.title}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {vehicle.make} {vehicle.model} {vehicle.year}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">${vehicle.price.toLocaleString()}</td>
                    <td className="py-3 px-4">{vehicle.mileage.toLocaleString()} mi</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vehicle.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500'
                      }`}>
                        {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(vehicle.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        <Link href={`/dashboard/vehicles/${vehicle.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center py-10">
                      <p className="mb-2 text-lg font-medium">No vehicles found</p>
                      <p className="mb-6 text-sm">Get started by adding your first vehicle listing</p>
                      <Link href="/dashboard/vehicles/new">
                        <Button>Add Vehicle</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {vehicles.length > 0 && (
          <div className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium">{vehicles.length}</span> vehicles
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 