'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ListingForm from '@/components/listings/ListingForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" disabled>
            ← Back
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
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
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/listings/${params.id}`}>
          <Button variant="outline" size="sm">
            ← Back to Listing
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Listing</h1>
      </div>
      
      <ListingForm 
        initialData={listing} 
        mode="edit" 
      />
    </div>
  );
} 