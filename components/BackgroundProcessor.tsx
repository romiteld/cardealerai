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
import { toast } from 'react-hot-toast';

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
      toast.error('No images to process');
      return;
    }
    
    setProcessing(true);
    setProcessingProgress(0);
    setError(null);
    setSuccess(null);
    
    try {
      // Process each image one by one to show progress
      const results = [];
      for (let i = 0; i < imageData.length; i++) {
        const { publicId } = imageData[i];
        
        console.log(`Processing image ${i+1}/${imageData.length}: ${publicId}`);
        toast.loading(`Processing image ${i+1}/${imageData.length}`);
        
        try {
          // Use our API endpoint for background processing
          const response = await fetch(`/api/listings/${listingId}/background-process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              imageIds: [publicId],
              mode: backgroundMode,
              prompt: backgroundPrompt
            }),
          });
          
          if (!response.ok) {
            const data = await response.json();
            console.error('API error:', data);
            throw new Error(data.error || `Failed to process image ${i + 1}`);
          }
          
          const data = await response.json();
          console.log('API response:', data);
          
          if (!data.batchResults || data.batchResults.length === 0) {
            console.error('No batch results returned');
            throw new Error('No preview images were generated');
          }
          
          const { batchResults } = data;
          
          if (batchResults[0].success === false) {
            console.error('Batch processing failed:', batchResults[0].error);
            // Instead of throwing an error, add a failed result and continue
            toast.error(`Image ${i+1} processing failed: ${batchResults[0].error}`);
            
            // Add a placeholder failed result so we know which image failed
            results.push({ 
              original: publicId, 
              error: batchResults[0].error,
              previews: [] // Empty previews for failed image
            });
            
            // Continue to the next image instead of stopping
            continue;
          }
          
          if (!batchResults[0].previews || batchResults[0].previews.length === 0) {
            console.error('No previews returned');
            toast.error(`No preview images were generated for image ${i+1}`);
            
            // Add a placeholder failed result
            results.push({ 
              original: publicId, 
              error: 'No preview images were generated',
              previews: [] // Empty previews for failed image
            });
            
            // Continue to the next image
            continue;
          }
          
          // Add successful result
          results.push({ 
            original: publicId, 
            previews: batchResults[0].previews 
          });
          
        } catch (processingError: any) {
          console.error(`Error processing image ${i+1}:`, processingError);
          toast.error(`Failed to process image ${i+1}: ${processingError.message}`);
          
          // Add placeholder for failed image
          results.push({ 
            original: publicId, 
            error: processingError.message,
            previews: [] // Empty previews for failed image
          });
          
          // Continue with next image
          continue;
        }
        
        // Update progress
        setProcessingProgress(((i + 1) / imageData.length) * 100);
        toast.dismiss();
      }
      
      // Check if we have any successful results
      const successfulResults = results.filter(result => !result.error && result.previews.length > 0);
      
      if (successfulResults.length === 0) {
        setError('No images were successfully processed. Please try again.');
        toast.error('Processing failed for all images');
        return;
      }
      
      // Organize results by original image ID
      const newPreviews = results.reduce((acc, curr) => {
        // Only include successful results in previews
        if (curr.previews && curr.previews.length > 0) {
          return { ...acc, [curr.original]: curr.previews };
        }
        return acc;
      }, {});
      
      setBatchPreviews(newPreviews);
      
      // Pre-select first preview for each image that has previews
      const initialSelections = results.reduce((acc, curr) => {
        if (curr.previews && curr.previews.length > 0) {
          return { ...acc, [curr.original]: curr.previews[0] };
        }
        return acc;
      }, {});
      
      setSelectedPreviews(initialSelections);
      
      // Show success message with count of successful/failed images
      const failedCount = results.length - successfulResults.length;
      if (failedCount > 0) {
        setSuccess(`${successfulResults.length} images processed successfully, ${failedCount} failed. Select your preferred version for each successful image.`);
        toast.success(`${successfulResults.length} images processed, ${failedCount} failed`);
      } else {
        setSuccess('All images processed successfully. Select your preferred version for each image.');
        toast.success('All images processed successfully');
      }
    } catch (err: any) {
      console.error('Image processing error:', err);
      setError(err.message || 'Failed to process images');
      toast.error(err.message || 'Failed to process images');
    } finally {
      setProcessing(false);
      toast.dismiss();
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
      
      // Count how many images were processed successfully vs. those that failed
      const totalProcessed = Object.keys(selectedPreviews).length;
      const totalImages = imageData.length;
      
      // Show warning if not all images were processed
      if (totalProcessed < totalImages) {
        console.warn(`Only ${totalProcessed} of ${totalImages} images were processed successfully.`);
      }
      
      // Save the selected images in batches if there are many
      const batchSize = 10;
      let allSaved = true;
      
      // If we have a lot of images, show a saving indicator
      if (finalSelections.length > batchSize) {
        toast.loading(`Saving ${finalSelections.length} images in batches...`);
      }
      
      // Process in batches if there are many images
      if (finalSelections.length > batchSize) {
        const batches = [];
        for (let i = 0; i < finalSelections.length; i += batchSize) {
          batches.push(finalSelections.slice(i, i + batchSize));
        }
        
        // Save each batch
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          try {
            // Update progress indicator
            setSuccess(`Saving batch ${i+1}/${batches.length} (${batch.length} images)...`);
            
            const response = await fetch(`/api/listings/${listingId}/images`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ selectedImages: batch }),
            });
            
            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || `Failed to save batch ${i+1}`);
            }
            
            // Small delay between batches to avoid overwhelming the server
            if (i < batches.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          } catch (err) {
            console.error(`Error saving batch ${i+1}:`, err);
            allSaved = false;
            // Continue with next batch instead of failing completely
          }
        }
        
        toast.dismiss();
        
        if (allSaved) {
          setSuccess(`All ${finalSelections.length} images were saved successfully!`);
          toast.success(`All ${finalSelections.length} images saved`);
        } else {
          setSuccess(`Some images may not have been saved. Please verify your changes.`);
          toast.error('Not all images were saved successfully');
        }
      } else {
        // For smaller sets, save all at once
        const response = await fetch(`/api/listings/${listingId}/images`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectedImages: finalSelections }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to save selected images');
        }
        
        setSuccess(`${finalSelections.length} images saved successfully!`);
        toast.success(`${finalSelections.length} images saved`);
      }
    } catch (err: any) {
      console.error('Failed to save selections:', err);
      setError(err.message || 'Failed to save selections');
      toast.error(err.message || 'Failed to save selections');
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
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Images: {imageData.length}</span>
            <Button 
              onClick={processBatchBackground} 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              aria-label="Process images with AI background"
              disabled={imageData.length === 0}
            >
              Process Images ({imageData.length})
            </Button>
          </div>
          {imageData.length > 5 && (
            <p className="text-sm text-amber-600">
              Processing {imageData.length} images may take some time. You can process in smaller batches if needed.
            </p>
          )}
        </div>
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
          
          {/* Quick Selection Controls */}
          {imageData.length > 3 && (
            <div className="p-3 bg-gray-50 rounded-md mb-4">
              <h4 className="font-medium mb-2">Bulk Actions</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => {
                    // Select first preview for all images
                    const firstOptions = Object.keys(batchPreviews).reduce((acc, key) => {
                      if (batchPreviews[key]?.length > 0) {
                        acc[key] = batchPreviews[key][0];
                      }
                      return acc;
                    }, {} as Record<string, string>);
                    setSelectedPreviews(firstOptions);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Select All First Options
                </Button>
                <Button 
                  onClick={() => {
                    // Select second preview for all images if available
                    const secondOptions = Object.keys(batchPreviews).reduce((acc, key) => {
                      if (batchPreviews[key]?.length > 1) {
                        acc[key] = batchPreviews[key][1];
                      } else if (batchPreviews[key]?.length > 0) {
                        acc[key] = batchPreviews[key][0];
                      }
                      return acc;
                    }, {} as Record<string, string>);
                    setSelectedPreviews(secondOptions);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Select All Second Options
                </Button>
              </div>
            </div>
          )}
          
          {/* Image Grid - Use virtualization for large image sets */}
          <div className="space-y-8">
            {imageData.map((image, index) => {
              const publicId = image.publicId;
              const previews = batchPreviews[publicId] || [];
              
              return (
                <Card key={publicId} className="p-4">
                  <h4 className="font-medium mb-2">Image {index + 1}</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Original image */}
                    <div>
                      <p className="text-sm mb-1">Original</p>
                      <Image 
                        src={image.url}
                        alt={`Original image ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full object-cover rounded-md border-2 border-transparent"
                      />
                    </div>
                    
                    {/* Preview options */}
                    {previews.map((preview, idx) => (
                      <div 
                        key={idx}
                        className={`border-2 rounded-md cursor-pointer ${
                          selectedPreviews[publicId] === preview 
                            ? 'border-blue-500 shadow-md' 
                            : 'border-transparent hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPreviews({
                          ...selectedPreviews,
                          [publicId]: preview
                        })}
                      >
                        <p className="text-sm mb-1">Option {idx + 1}</p>
                        <Image 
                          src={preview}
                          alt={`Preview option ${idx + 1} for image ${index + 1}`}
                          width={300}
                          height={200}
                          className="w-full object-cover rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
          
          {/* Save Button - Fixed at bottom for easy access with many images */}
          <div className="sticky bottom-4 bg-white p-4 border rounded-md shadow-md z-10">
            <div className="flex justify-between items-center">
              <span>{Object.keys(selectedPreviews).length} of {imageData.length} images have selections</span>
              <Button 
                onClick={saveBatchSelection} 
                disabled={saving || Object.keys(selectedPreviews).length === 0}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {saving ? 'Saving...' : 'Save Selected Options'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 