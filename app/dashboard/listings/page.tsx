import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '../../../lib/formatters';

async function getListings() {
  try {
    // In production, use the absolute URL with the deployed domain
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/listings?status=all`, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error('Failed to fetch listings');
    }
    
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}

export default async function ListingsPage() {
  try {
    const listings = await getListings();
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Vehicle Listings</h1>
          <Link href="/dashboard/listings/new">
            <Button className="bg-blue-500 hover:bg-blue-600">
              <span className="mr-2">+</span> Add New Listing
            </Button>
          </Link>
        </div>
        
        {listings.length === 0 ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">No Listings Found</h2>
            <p className="text-gray-500 mb-6">
              You haven't created any vehicle listings yet. Get started by adding your first listing.
            </p>
            <Link href="/dashboard/listings/new">
              <Button className="bg-blue-500 hover:bg-blue-600">Create First Listing</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing: any) => (
              <Card key={listing.id} className="overflow-hidden flex flex-col">
                <div className="relative h-48">
                  {listing.images && listing.images.length > 0 ? (
                    <Image
                      src={listing.images[0].url}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      listing.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {listing.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 flex-grow">
                  <h2 className="text-lg font-semibold mb-1 truncate">{listing.title}</h2>
                  <div className="text-sm text-gray-500 mb-2">
                    {listing.year} • {listing.mileage.toLocaleString()} miles
                  </div>
                  <div className="text-xl font-bold text-blue-600 mb-4">
                    {formatCurrency(listing.price)}
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/listings/${listing.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    <Link href={`/dashboard/listings/${listing.id}/edit`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error rendering listings page:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-red-500">There was an error loading the listings. Please try again later.</p>
      </div>
    );
  }
} 