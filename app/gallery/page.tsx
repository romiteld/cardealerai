'use client';

import React, { useState, useEffect } from 'react';
import ImageGrid from '@/components/listings/ImageGrid';
import ListingGallery from '@/components/listings/ListingGallery';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

// Sample data for demonstration
const SAMPLE_IMAGES = [
  {
    url: 'https://res.cloudinary.com/dtqezpvul/image/upload/v1707246137/car-images/honda-civic.jpg',
    publicId: 'car-images/honda-civic',
    title: 'Honda Civic',
    alternativeUrls: [
      'https://res.cloudinary.com/dtqezpvul/image/upload/e_bgremoval/v1707246137/car-images/honda-civic.jpg',
      'https://res.cloudinary.com/dtqezpvul/image/upload/e_bgremoval,b_white/v1707246137/car-images/honda-civic.jpg',
    ]
  },
  {
    url: 'https://res.cloudinary.com/dtqezpvul/image/upload/v1707246137/car-images/toyota-camry.jpg',
    publicId: 'car-images/toyota-camry',
    title: 'Toyota Camry',
    alternativeUrls: [
      'https://res.cloudinary.com/dtqezpvul/image/upload/e_bgremoval/v1707246137/car-images/toyota-camry.jpg',
    ]
  },
  {
    url: 'https://res.cloudinary.com/dtqezpvul/image/upload/v1707246137/car-images/ford-f150.jpg',
    publicId: 'car-images/ford-f150',
    title: 'Ford F-150',
  },
  {
    url: 'https://res.cloudinary.com/dtqezpvul/image/upload/v1707246137/car-images/chevrolet-corvette.jpg',
    publicId: 'car-images/chevrolet-corvette',
    title: 'Chevrolet Corvette',
    alternativeUrls: [
      'https://res.cloudinary.com/dtqezpvul/image/upload/e_bgremoval/v1707246137/car-images/chevrolet-corvette.jpg',
      'https://res.cloudinary.com/dtqezpvul/image/upload/e_bgremoval,b_linear_gradient:blue:black/v1707246137/car-images/chevrolet-corvette.jpg',
    ]
  },
];

export default function GalleryPage() {
  const [images, setImages] = useState(SAMPLE_IMAGES);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('grid');
  
  const handleImageSelect = (image: { url: string; publicId: string }) => {
    setSelectedImageIds(prev => {
      if (prev.includes(image.publicId)) {
        return prev.filter(id => id !== image.publicId);
      } else {
        return [...prev, image.publicId];
      }
    });
  };
  
  const handleImageDelete = (publicId: string) => {
    setImages(prev => prev.filter(image => image.publicId !== publicId));
    setSelectedImageIds(prev => prev.filter(id => id !== publicId));
  };
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vehicle Gallery</h1>
        <div className="flex space-x-2">
          <Button variant="outline">Upload Images</Button>
          <Button 
            variant="default"
            disabled={selectedImageIds.length === 0}
          >
            Process Selected ({selectedImageIds.length})
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="grid" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="gallery">Gallery View</TabsTrigger>
          </TabsList>
          
          <div className="text-sm text-gray-500">
            {selectedImageIds.length === 0 ? (
              'Select images to process'
            ) : (
              `${selectedImageIds.length} of ${images.length} selected`
            )}
          </div>
        </div>
        
        <TabsContent value="grid" className="mt-0">
          <Card className="p-6">
            <ImageGrid 
              images={images}
              onSelect={handleImageSelect}
              onDelete={handleImageDelete}
              selectedIds={selectedImageIds}
              title="Vehicle Images"
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="gallery" className="mt-0">
          <Card className="p-6">
            <ListingGallery 
              images={images}
              title="Vehicle Gallery"
            />
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Selected Images Section */}
      {selectedImageIds.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Selected Images</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images
              .filter(image => selectedImageIds.includes(image.publicId))
              .map(image => (
                <div key={image.publicId}>
                  <img 
                    src={image.url} 
                    alt={image.title || 'Selected image'} 
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <p className="mt-1 text-sm text-center truncate">{image.title}</p>
                </div>
              ))
            }
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setSelectedImageIds([])}
            >
              Clear Selection
            </Button>
            <Button variant="default">
              Enhance Selected
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 