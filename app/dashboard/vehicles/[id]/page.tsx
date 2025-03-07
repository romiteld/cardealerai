import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Trash2, Share } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

interface VehicleParams {
  params: {
    id: string
  }
}

export default async function VehicleDetailsPage({ params }: VehicleParams) {
  const vehicleId = params.id
  
  // In a real app, we would fetch the vehicle data from the API
  // For now, we'll try to fetch from the mock API
  let vehicle
  try {
    const response = await fetch(`/api/listings/${vehicleId}`, { cache: 'no-store' })
    if (!response.ok) {
      if (response.status === 404) {
        notFound()
      }
      throw new Error('Failed to fetch vehicle details')
    }
    vehicle = await response.json()
  } catch (error) {
    console.error(`Error fetching vehicle ${vehicleId}:`, error)
    // For demo purposes, we'll create a mock vehicle if the API call fails
    vehicle = {
      id: vehicleId,
      title: '2023 Honda Civic Touring',
      make: 'Honda',
      model: 'Civic',
      year: 2023,
      trim: 'Touring',
      price: 32000,
      mileage: 5000,
      color: 'Crystal Black Pearl',
      fuelType: 'Gasoline',
      transmission: 'CVT',
      bodyType: 'Sedan',
      vin: 'ABC123456789DEF',
      status: 'published',
      description: 'This Honda Civic Touring is in excellent condition. Features include leather seats, navigation, adaptive cruise control, and more.',
      images: [
        {
          url: 'https://res.cloudinary.com/dtqezpvul/image/upload/v1707246137/car-images/honda-civic.jpg',
          publicId: 'car-images/honda-civic'
        }
      ],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
  
  // Get dealer information
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const { data: dealer } = await supabase.from('dealerships').select('*').eq('owner_id', session?.user?.id).single()

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/dashboard/vehicles" className="mr-4">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{vehicle.title}</h1>
            <p className="text-muted-foreground mt-1">
              {vehicle.status === 'published' ? 'Published' : 'Draft'} • Added on {new Date(vehicle.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Share className="h-4 w-4" />
            <span>Share</span>
          </Button>
          <Link href={`/dashboard/vehicles/${vehicleId}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          </Link>
          <Button variant="destructive" size="sm" className="flex items-center gap-1">
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-hidden">
            <div className="relative aspect-[16/9] w-full bg-gray-100 dark:bg-slate-800">
              {vehicle.images && vehicle.images[0] ? (
                <img 
                  src={vehicle.images[0].url} 
                  alt={vehicle.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  No image available
                </div>
              )}
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Details</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Make</h3>
                  <p className="mt-1 text-sm font-medium">{vehicle.make}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Model</h3>
                  <p className="mt-1 text-sm font-medium">{vehicle.model}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Year</h3>
                  <p className="mt-1 text-sm font-medium">{vehicle.year}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Trim</h3>
                  <p className="mt-1 text-sm font-medium">{vehicle.trim || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Price</h3>
                  <p className="mt-1 text-sm font-medium">${vehicle.price?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Mileage</h3>
                  <p className="mt-1 text-sm font-medium">{vehicle.mileage?.toLocaleString() || 'N/A'} mi</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Color</h3>
                  <p className="mt-1 text-sm font-medium">{vehicle.color || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Body Type</h3>
                  <p className="mt-1 text-sm font-medium">{vehicle.bodyType || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fuel Type</h3>
                  <p className="mt-1 text-sm font-medium">{vehicle.fuelType || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Transmission</h3>
                  <p className="mt-1 text-sm font-medium">{vehicle.transmission || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">VIN</h3>
                  <p className="mt-1 text-sm font-medium">{vehicle.vin || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock #</h3>
                  <p className="mt-1 text-sm font-medium">{vehicle.stockNumber || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h3>
                <p className="text-sm leading-relaxed">
                  {vehicle.description || 'No description available.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Add more sections here (e.g., features, gallery, etc.) */}
        </div>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Dealer Information</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h3>
                <p className="mt-1 font-medium">{dealer?.name || 'Your Dealership'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</h3>
                <p className="mt-1 font-medium">{dealer?.phone || '(555) 123-4567'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                <p className="mt-1 font-medium">{dealer?.email || 'contact@yourdealership.com'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</h3>
                <p className="mt-1 text-sm">
                  {dealer?.address || '123 Main St, Anytown, USA 12345'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Listing Activity</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Views</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Inquiries</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Social Shares</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Last Updated</span>
                <span className="font-medium">{new Date(vehicle.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="flex flex-col space-y-2">
              <Button className="w-full justify-start">
                <Share className="h-4 w-4 mr-2" />
                Share on Social Media
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Generate Content
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Enhance Images
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 