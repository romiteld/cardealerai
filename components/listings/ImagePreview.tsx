'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '../ui/dialog';
import { 
  Split, 
  ZoomIn, 
  RotateCw, 
  Download,
  Check,
  Trash2
} from 'lucide-react';

interface ImagePreviewProps {
  image: {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
  };
  alternativeUrls?: string[];
  title?: string;
  onSelect?: (url: string) => void;
  onDelete?: () => void;
  className?: string;
  selected?: boolean;
}

export default function ImagePreview({ 
  image, 
  alternativeUrls = [],
  title,
  onSelect,
  onDelete,
  className = '',
  selected = false
}: ImagePreviewProps) {
  const [isComparing, setIsComparing] = useState(false);
  const [compareIndex, setCompareIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  
  const hasAlternatives = alternativeUrls && alternativeUrls.length > 0;
  
  const handleCompare = () => {
    if (hasAlternatives) {
      setIsComparing(!isComparing);
      setCompareIndex(0);
    }
  };
  
  const handleNextComparison = () => {
    if (hasAlternatives) {
      setCompareIndex((prev) => (prev + 1) % (alternativeUrls.length + 1));
    }
  };
  
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };
  
  const getCurrentUrl = () => {
    if (isComparing && compareIndex > 0 && compareIndex <= alternativeUrls.length) {
      return alternativeUrls[compareIndex - 1];
    }
    return image.url;
  };
  
  const downloadImage = async () => {
    try {
      const response = await fetch(getCurrentUrl());
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'image'}-${image.publicId.split('/').pop() || 'download'}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };
  
  return (
    <Card className={`relative overflow-hidden group ${className}`}>
      <div className="relative aspect-video">
        <Image
          src={getCurrentUrl()}
          alt={title || 'Image preview'}
          fill
          className="object-cover transition-all"
          style={{ transform: `rotate(${rotation}deg)` }}
          sizes="(max-width: 768px) 100vw, 300px"
        />
        
        {/* Selected badge */}
        {selected && (
          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
            <Check className="h-4 w-4" />
          </div>
        )}
        
        {/* Comparison indicator */}
        {isComparing && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white rounded-full px-2 py-0.5 text-xs">
            {compareIndex === 0 ? 'Original' : `Version ${compareIndex}`}
          </div>
        )}
        
        {/* Actions overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="secondary" className="rounded-full mx-1">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[90vw] p-0">
              <div className="relative aspect-video w-full">
                <Image
                  src={getCurrentUrl()}
                  alt={title || 'Image preview'}
                  fill
                  className="object-contain"
                  style={{ transform: `rotate(${rotation}deg)` }}
                  sizes="90vw"
                />
              </div>
              <div className="p-4 flex justify-between items-center">
                <DialogTitle className="text-lg">{title || 'Image Preview'}</DialogTitle>
                <div className="flex space-x-2">
                  {hasAlternatives && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleNextComparison}
                      className="flex items-center space-x-1"
                    >
                      <Split className="h-4 w-4 mr-2" />
                      <span>Compare Versions</span>
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleRotate}
                  >
                    <RotateCw className="h-4 w-4 mr-2" />
                    <span>Rotate</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={downloadImage}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {hasAlternatives && (
            <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-full mx-1"
              onClick={handleCompare}
            >
              <Split className="h-4 w-4" />
            </Button>
          )}
          
          {onDelete && (
            <Button 
              size="icon" 
              variant="destructive" 
              className="rounded-full mx-1"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          {onSelect && (
            <Button 
              variant="default" 
              className="rounded-full mx-1"
              onClick={() => onSelect(getCurrentUrl())}
            >
              {selected ? 'Selected' : 'Select'}
            </Button>
          )}
        </div>
      </div>
      
      {/* Thumbnail navigation for comparisons */}
      {hasAlternatives && isComparing && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
          <div className="flex space-x-2 overflow-x-auto">
            <button
              className={`w-10 h-10 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                compareIndex === 0 ? 'border-blue-500' : 'border-transparent'
              }`}
              onClick={() => setCompareIndex(0)}
            >
              <div className="w-full h-full relative">
                <Image
                  src={image.url}
                  alt="Original"
                  fill
                  className="object-cover"
                />
              </div>
            </button>
            
            {alternativeUrls.map((url, idx) => (
              <button
                key={idx}
                className={`w-10 h-10 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                  compareIndex === idx + 1 ? 'border-blue-500' : 'border-transparent'
                }`}
                onClick={() => setCompareIndex(idx + 1)}
              >
                <div className="w-full h-full relative">
                  <Image
                    src={url}
                    alt={`Version ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
} 