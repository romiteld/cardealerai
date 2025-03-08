'use client';

import React from 'react';
import { Metadata } from 'next';
import ListingForm from '@/components/listings/ListingForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewListingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/listings">
          <Button variant="outline" size="sm">
            ← Back to Listings
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Create New Listing</h1>
      </div>
      
      <ListingForm mode="create" />
    </div>
  );
} 