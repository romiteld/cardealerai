'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getVehicleListingById, type Vehicle } from '@/lib/actions/listings';
import ListingForm from '@/components/listings/ListingForm';

export default function EditVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        // Handle params.id safely, considering it might be a string or array
        const idParam = params?.id;
        if (!idParam) {
          throw new Error('Vehicle ID is required');
        }
        
        // Convert to string if it's an array or any other type
        const id = Array.isArray(idParam) ? idParam[0] : String(idParam);

        // Use our server action to fetch data
        const data = await getVehicleListingById(id);
        setVehicle(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load vehicle data');
        console.error('Error fetching vehicle:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [params]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Skeleton className="h-8 w-24 mr-4" />
          <Skeleton className="h-8 w-96" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Vehicle</h2>
          <p className="text-red-600">{error || 'Vehicle not found'}</p>
          <Link href="/dashboard/vehicles">
            <Button className="mt-4">Back to Vehicles</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Edit Vehicle: {vehicle.title}</h1>
        <Link href={`/dashboard/vehicles/${params.id}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      {/* Use the ListingForm component which includes image upload functionality */}
      <ListingForm 
        initialData={vehicle} 
        mode="edit" 
      />
    </div>
  );
} 