'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Image from 'next/image';

interface BackgroundProcessorProps {
  listingId: string;
  imageData: Array<{ url: string; publicId: string }>;
}

export default function BackgroundProcessor({ listingId, imageData }: BackgroundProcessorProps) {
  const [batchPreviews, setBatchPreviews] = useState<{ [key: string]: string[] }>({});
  const [selectedPreviews, setSelectedPreviews] = useState<{ [key: string]: string }>({});
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [backgroundMode, setBackgroundMode] = useState<'remove' | 'replace'>('replace');
  const [backgroundPrompt, setBackgroundPrompt] = useState('dealership showroom');
  
  const processBatchBackground = async () => {
    if (imageData.length === 0) {
      setError('No images to process');
      return;
    }
    
    setProcessing(true);
    setProcessingProgress(0);
    setError(null);
    setSuccess(null);
    
    try {
      // Process all images at once using the batch API
      const response = await fetch(`/api/enhance-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageIds: imageData.map(img => img.publicId),
          mode: backgroundMode,
          prompt: backgroundPrompt
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process images');
      }
      
      const data = await response.json();
      
      if (!data.batchResults || data.batchResults.length === 0) {
        throw new Error('No results returned from batch processing');
      }
      
      // Organize results by original image ID
      const previews: { [key: string]: string[] } = {};
      
      data.batchResults.forEach((result: any) => {
        if (result.success && result.previews && result.previews.length > 0) {
          previews[result.originalId] = result.previews;
        }
      });
      
      setBatchPreviews(previews);
      
      // Pre-select first preview for each image
      const initialSelections: { [key: string]: string } = {};
      
      Object.keys(previews).forEach(publicId => {
        if (previews[publicId] && previews[publicId].length > 0) {
          initialSelections[publicId] = previews[publicId][0];
        }
      });
      
      setSelectedPreviews(initialSelections);
      setSuccess('All images processed successfully. Select your preferred version for each image.');
      
      // Set progress to 100%
      setProcessingProgress(100);
    } catch (err: any) {
      setError(err.message || 'Failed to process images');
    } finally {
      setProcessing(false);
    }
  };
  
  const saveBatchSelection = async () => {
    if (Object.keys(selectedPreviews).length === 0) {
      setError('No images have been processed yet');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Extract final selected preview URLs
      const finalSelections = Object.keys(selectedPreviews).map(publicId => ({
        originalId: publicId,
        enhancedUrl: selectedPreviews[publicId]
      }));
      
      // Ensure all images have a selection
      if (finalSelections.length !== imageData.length) {
        throw new Error('Please select a preview for each image');
      }
      
      // Save the selected images
      const response = await fetch(`/api/listings/${listingId}/images`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedImages: finalSelections }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save selected images');
      }
      
      setSuccess('Selected images saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save selections');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Background Options */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">Background Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Background Mode
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="backgroundMode"
                  value="remove"
                  checked={backgroundMode === 'remove'}
                  onChange={() => setBackgroundMode('remove')}
                  className="mr-2"
                />
                <span>Remove Background</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="backgroundMode"
                  value="replace"
                  checked={backgroundMode === 'replace'}
                  onChange={() => setBackgroundMode('replace')}
                  className="mr-2"
                />
                <span>Replace Background</span>
              </label>
            </div>
          </div>
          
          {backgroundMode === 'replace' && (
            <div>
              <label htmlFor="backgroundPrompt" className="block text-sm font-medium mb-1">
                Background Description
              </label>
              <Textarea
                id="backgroundPrompt"
                value={backgroundPrompt}
                onChange={(e) => setBackgroundPrompt(e.target.value)}
                placeholder="Describe the background you want"
                className="w-full rounded-md"
                rows={2}
              />
              <p className="mt-1 text-xs text-gray-500">
                Examples: "dealership showroom", "outdoor sunny day", "urban street scene"
              </p>
            </div>
          )}
        </div>
      </Card>
      
      {/* Status Messages */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      {/* Process Button */}
      {!processing && Object.keys(batchPreviews).length === 0 && (
        <Button 
          onClick={processBatchBackground} 
          className="bg-blue-500 hover:bg-blue-600 text-white"
          aria-label="Process images with AI background"
        >
          Process Images ({imageData.length})
        </Button>
      )}
      
      {/* Processing Progress */}
      {processing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing images...</span>
            <span>{processingProgress.toFixed(0)}%</span>
          </div>
          <Progress value={processingProgress} className="w-full h-2" />
        </div>
      )}
      
      {/* Preview Selection */}
      {Object.keys(batchPreviews).length > 0 && (
        <div className="space-y-6">
          <h3 className="font-medium text-lg">Select Background Options</h3>
          
          {imageData.map((image, index) => {
            const publicId = image.publicId;
            const previews = batchPreviews[publicId] || [];
            
            return (
              <Card key={publicId} className="p-4">
                <h4 className="font-medium mb-2">Image {index + 1}</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {previews.map((preview, idx) => (
                    <div 
                      key={idx}
                      className={`cursor-pointer rounded-md overflow-hidden border-2 ${
                        selectedPreviews[publicId] === preview 
                          ? 'border-blue-500' 
                          : 'border-transparent'
                      }`}
                      onClick={() => setSelectedPreviews({ 
                        ...selectedPreviews, 
                        [publicId]: preview 
                      })}
                    >
                      <Image
                        src={preview}
                        alt={`Preview option ${idx + 1} for image ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-40 object-cover"
                      />
                      <div className="bg-gray-100 p-2 text-center">
                        Option {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
          
          <Button
            onClick={saveBatchSelection}
            disabled={saving}
            className={`w-full py-2 px-4 ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            aria-label="Save selected image versions"
          >
            {saving ? 'Saving...' : 'Save Selected Versions'}
          </Button>
        </div>
      )}
    </div>
  );
} 