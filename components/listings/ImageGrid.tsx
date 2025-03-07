'use client';

import React, { useState } from 'react';
import ImagePreview from './ImagePreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { ListFilter, LayoutGrid, ImageOff } from 'lucide-react';

interface ImageGridProps {
  images: Array<{
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    alternativeUrls?: string[];
    title?: string;
  }>;
  onSelect?: (image: { url: string; publicId: string }) => void;
  onDelete?: (publicId: string) => void;
  selectedIds?: string[];
  title?: string;
}

type FilterOption = 'all' | 'enhanced' | 'original';
type ViewMode = 'grid' | 'masonry';

export default function ImageGrid({ 
  images, 
  onSelect, 
  onDelete,
  selectedIds = [],
  title
}: ImageGridProps) {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <ImageOff className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No images available</p>
      </div>
    );
  }
  
  // Filter images based on the selected filter
  const filteredImages = images.filter(image => {
    if (filter === 'all') return true;
    if (filter === 'enhanced') return image.alternativeUrls && image.alternativeUrls.length > 0;
    if (filter === 'original') return !image.alternativeUrls || image.alternativeUrls.length === 0;
    return true;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{title || 'Images'} ({images.length})</h3>
        
        <div className="flex space-x-2">
          {/* Filter options */}
          <Tabs defaultValue="all" value={filter} onValueChange={(v) => setFilter(v as FilterOption)}>
            <TabsList className="grid grid-cols-3 w-[300px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
              <TabsTrigger value="original">Original</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* View mode toggle */}
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'masonry' : 'grid')}
            title={viewMode === 'grid' ? 'Switch to masonry view' : 'Switch to grid view'}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Images grid */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
          : 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4'
      }>
        {filteredImages.map((image) => (
          <div key={image.publicId} className={viewMode === 'masonry' ? 'mb-4 break-inside-avoid' : ''}>
            <ImagePreview
              image={image}
              alternativeUrls={image.alternativeUrls}
              title={image.title || title}
              onSelect={onSelect ? () => onSelect(image) : undefined}
              onDelete={onDelete ? () => onDelete(image.publicId) : undefined}
              selected={selectedIds.includes(image.publicId)}
            />
          </div>
        ))}
      </div>
      
      {filteredImages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-lg border border-gray-200">
          <ListFilter className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500">No images match the selected filter</p>
          <Button 
            variant="link" 
            onClick={() => setFilter('all')}
            className="mt-2"
          >
            Clear filter
          </Button>
        </div>
      )}
    </div>
  );
} 