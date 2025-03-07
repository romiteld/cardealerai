'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { ChevronLeft, ChevronRight, ZoomIn, Download, Share } from 'lucide-react';

interface ListingGalleryProps {
  images: Array<{
    url: string;
    publicId: string;
    width?: number;
    height?: number;
  }>;
  title?: string;
  listingId?: string;
}

export default function ListingGallery({ images, title, listingId }: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // If no images, show a placeholder
  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }
  
  const currentImage = images[activeIndex];
  
  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };
  
  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  const downloadImage = async () => {
    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'vehicle'}-image-${activeIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };
  
  const shareImage = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title || 'Vehicle Image',
          text: 'Check out this vehicle',
          url: currentImage.url,
        });
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(currentImage.url);
        alert('Image URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative w-full overflow-hidden rounded-lg bg-gray-100">
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative w-full h-[400px] cursor-zoom-in group">
              <Image
                src={currentImage.url}
                alt={`${title || 'Vehicle'} - Image ${activeIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 640px, 1000px"
                priority={activeIndex === 0}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur-sm">
                  <ZoomIn className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] p-0 overflow-hidden">
            <div className="relative w-full h-[80vh]">
              <Image
                src={currentImage.url}
                alt={`${title || 'Vehicle'} - Image ${activeIndex + 1}`}
                fill
                className="object-contain"
                sizes="90vw"
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm"
                onClick={goToNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Navigation arrows for main view */}
        {images.length > 1 && (
          <>
            <Button
              size="icon"
              variant="secondary"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm z-10"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm z-10"
              onClick={goToNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
        
        {/* Action buttons */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur-sm" onClick={downloadImage}>
            <Download className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur-sm" onClick={shareImage}>
            <Share className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Image counter */}
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
          {activeIndex + 1} / {images.length}
        </div>
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {images.map((image, index) => (
            <button
              key={image.publicId}
              className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all ${
                index === activeIndex ? 'border-blue-500 scale-105' : 'border-transparent'
              }`}
              onClick={() => setActiveIndex(index)}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 