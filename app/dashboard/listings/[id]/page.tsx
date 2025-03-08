'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function ViewListingPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listings/${params.id}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Listing not found');
          }
          throw new Error('Failed to fetch listing');
        }
        
        const data = await res.json();
        setListing(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        console.error('Error fetching listing:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) {
      fetchListing();
    }
  }, [params.id]);
  
  const handlePublish = async () => {
    if (!listing || publishing) return;
    
    setPublishing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await fetch(`/api/listings/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to publish listing');
      }
      
      const updatedListing = await res.json();
      setListing(updatedListing);
      setSuccess('Listing published successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to publish listing');
    } finally {
      setPublishing(false);
    }
  };
  
  const handleDelete = async () => {
    if (!listing || !window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/listings/${params.id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete listing');
      }
      
      router.push('/dashboard/listings');
    } catch (err: any) {
      setError(err.message || 'Failed to delete listing');
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/listings">
            <Button variant="outline" size="sm">
              ← Back to Listings
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            {error || 'Listing not found'}
          </h2>
          <p className="text-red-600 mb-4">
            We couldn't find the listing you're looking for.
          </p>
          <Link href="/dashboard/listings">
            <Button>Return to Listings</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with actions */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/listings">
            <Button variant="outline" size="sm">
              ← Back to Listings
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <span className={`px-2 py-1 text-xs font-semibold rounded ${
            listing.status === 'published' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-amber-100 text-amber-800'
          }`}>
            {listing.status === 'published' ? 'Published' : 'Draft'}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/dashboard/listings/${params.id}/edit`}>
            <Button variant="outline">Edit Listing</Button>
          </Link>
          
          {listing.status !== 'published' && (
            <Button 
              onClick={handlePublish}
              disabled={publishing}
              className="bg-green-500 hover:bg-green-600"
            >
              {publishing ? 'Publishing...' : 'Publish Listing'}
            </Button>
          )}
          
          <Button 
            variant="destructive" 
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>
      
      {/* Success message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
          {success}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}
      
      {/* Listing content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - Images and description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Images</h2>
            
            {listing.images && listing.images.length > 0 ? (
              <div>
                {/* Main image */}
                <div className="relative aspect-video mb-4 rounded-md overflow-hidden">
                  <Image
                    src={listing.images[0].url}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Thumbnails */}
                {listing.images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {listing.images.map((image: any, index: number) => (
                      <div 
                        key={index}
                        className="relative aspect-square rounded-md overflow-hidden"
                      >
                        <Image
                          src={image.url}
                          alt={`${listing.title} image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-md p-8 text-center">
                <p className="text-gray-500">No images available</p>
              </div>
            )}
          </Card>
          
          {/* Description */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {listing.description || 'No description provided.'}
            </p>
          </Card>
          
          {/* Features */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Features</h2>
            
            {listing.features && listing.features.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {listing.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No features listed</p>
            )}
          </Card>
        </div>
        
        {/* Sidebar - Vehicle details */}
        <div>
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Vehicle Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold text-lg text-blue-600">
                  {formatCurrency(listing.price)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Make</p>
                  <p className="font-medium">{listing.make || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Model</p>
                  <p className="font-medium">{listing.model || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Year</p>
                  <p className="font-medium">{listing.year || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Mileage</p>
                  <p className="font-medium">
                    {listing.mileage ? `${listing.mileage.toLocaleString()} miles` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Condition</p>
                  <p className="font-medium">{listing.condition || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">VIN</p>
                  <p className="font-medium">{listing.vin || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Exterior Color</p>
                  <p className="font-medium">{listing.exteriorColor || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Interior Color</p>
                  <p className="font-medium">{listing.interiorColor || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Fuel Type</p>
                  <p className="font-medium">{listing.fuelType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Transmission</p>
                  <p className="font-medium">{listing.transmission || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Drivetrain</p>
                  <p className="font-medium">{listing.drivetrain || 'N/A'}</p>
                </div>
              </div>
              
              <div className="border-t pt-2">
                <p className="text-gray-600">Created</p>
                <p className="font-medium">
                  {listing.createdAt ? formatDate(listing.createdAt) : 'N/A'}
                </p>
              </div>
              
              {listing.updatedAt && (
                <div>
                  <p className="text-gray-600">Last Updated</p>
                  <p className="font-medium">
                    {formatDate(listing.updatedAt)}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 