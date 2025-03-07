import { Metadata } from 'next'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'
import { Icons } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import { Database } from '@/lib/supabase'

type SocialStat = {
  status: string;
  count: number;
}

export const metadata: Metadata = {
  title: 'Dashboard | CarDealerAI',
  description: 'CarDealerAI dashboard for managing vehicle listings and social media.',
}

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return null // This should never happen because of our middleware
  }

  const userId = session.user.id
  const dealershipId = session.user.user_metadata?.dealership_id as string

  // Fetch user's vehicles count
  const { count: vehiclesCount } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('dealership_id', dealershipId)
  
  // Fetch recent images
  const { data: recentImages } = await supabase
    .from('vehicle_images')
    .select('*, vehicles!inner(*)')
    .eq('vehicles.dealership_id', dealershipId)
    .order('created_at', { ascending: false })
    .limit(4)
  
  // Since we can't use group in the type-safe way, we'll count posts by status
  const publishedPostsQuery = await supabase
    .from('social_posts')
    .select('*', { count: 'exact' })
    .eq('dealership_id', dealershipId)
    .eq('status', 'published')
  
  const scheduledPostsQuery = await supabase
    .from('social_posts')
    .select('*', { count: 'exact' })
    .eq('dealership_id', dealershipId)
    .eq('status', 'scheduled')
  
  const allPostsQuery = await supabase
    .from('social_posts')
    .select('*', { count: 'exact' })
    .eq('dealership_id', dealershipId)
  
  const publishedPosts = publishedPostsQuery.count || 0
  const scheduledPosts = scheduledPostsQuery.count || 0
  const totalPosts = allPostsQuery.count || 0
  
  const subscriptionTier = session.user.user_metadata?.subscription_tier as string
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/dashboard/vehicles/new">
            <Icons.plusCircle className="mr-2 h-4 w-4" />
            Add New Vehicle
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Vehicle Stats Card */}
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <Icons.car className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Vehicles</h3>
          </div>
          <p className="mt-4 text-3xl font-bold">{vehiclesCount || 0}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Total active listings</p>
          <Link
            href="/dashboard/vehicles"
            className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View all
            <Icons.arrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {/* Image Stats Card */}
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <Icons.camera className="h-5 w-5 text-green-500" />
            <h3 className="font-medium">Images</h3>
          </div>
          <p className="mt-4 text-3xl font-bold">{recentImages?.length || 0}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Recent uploads</p>
          <Link
            href="/dashboard/gallery"
            className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View gallery
            <Icons.arrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {/* Social Media Card */}
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <Icons.facebook className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium">Social Media</h3>
          </div>
          <p className="mt-4 text-3xl font-bold">{totalPosts}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {publishedPosts} published, {scheduledPosts} scheduled
          </p>
          <Link
            href="/dashboard/social"
            className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Manage posts
            <Icons.arrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {/* Subscription Card */}
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <Icons.coins className="h-5 w-5 text-yellow-500" />
            <h3 className="font-medium">Subscription</h3>
          </div>
          <p className="mt-4 text-xl font-bold capitalize">
            {subscriptionTier || 'Free Trial'}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {subscriptionTier === 'pro'
              ? 'Up to 100 listings'
              : subscriptionTier === 'growth'
              ? 'Up to 500 listings'
              : subscriptionTier === 'enterprise'
              ? 'Unlimited listings'
              : 'Limited features'}
          </p>
          <Link
            href="/dashboard/subscription"
            className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Manage plan
            <Icons.arrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-800">
        <h2 className="text-xl font-semibold">Recent Images</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {recentImages?.length ? (
            recentImages.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-lg border">
                <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={image.url}
                    alt={`Vehicle image for ${image.vehicles?.make} ${image.vehicles?.model}`}
                    className="h-full w-full object-cover transition-transform hover:scale-110"
                  />
                </div>
                <div className="p-2">
                  <p className="truncate text-sm font-medium">
                    {image.vehicles?.make} {image.vehicles?.model}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {image.is_enhanced ? 'Enhanced' : 'Original'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <Icons.camera className="h-10 w-10 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium">No images yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Upload images to your vehicles to see them here.
              </p>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/dashboard/gallery">Go to Gallery</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 