'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import JobStatusTracker from './JobStatusTracker';

interface BackgroundProcessorProps {
  listingId: string;
  imageData: Array<{ url: string; publicId: string }>;
  onImageDataChange?: (newImageData: Array<{ url: string; publicId: string }>) => void;
}

// Add interfaces for the results
interface ProcessingResult {
  original: string;
  previews: string[];
  error?: string;
  jobId?: string;
  isAsync?: boolean;
  transformation?: string;
}

interface ProcessingJob {
  publicId: string;
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// Background preview hook using the correct Cloudinary syntax for Generative Background Replacement
function useBackgroundPreview(publicId: string, prompt: string | null) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (!publicId) return;
    
    try {
      // Use direct URL construction with the correct syntax for Generative Background Replacement
      const cloudName = 'dtqezpvul'; // Your cloud name
      
      // Build the transformation string
      let transformationStr = 'e_gen_background_replace';
      
      // Add prompt if specified
      if (prompt) {
        transformationStr += `:prompt_${encodeURIComponent(prompt)}`;
      }
      
      // Generate the URL
      const url = `https://res.cloudinary.com/${cloudName}/image/upload/${transformationStr}/${publicId}`;
      
      setPreviewUrl(url);
    } catch (error) {
      console.error('Error generating preview URL:', error);
      setPreviewUrl(null);
    }
  }, [publicId, prompt]);
  
  return previewUrl;
}

// Processing indicator component
function ProcessingIndicator({ publicId, prompt }: { publicId: string, prompt: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white p-4 z-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
      <div className="text-center">
        <p className="font-medium">Replacing Background</p>
        <p className="text-sm opacity-80 mt-1">Using AI to add "{prompt}" background</p>
        <p className="text-xs mt-3 opacity-60">This may take 15-30 seconds</p>
      </div>
    </div>
  );
}

export default function BackgroundProcessor({ listingId, imageData, onImageDataChange }: BackgroundProcessorProps) {
  const [batchPreviews, setBatchPreviews] = useState<{ [key: string]: string[] }>({});
  const [selectedPreviews, setSelectedPreviews] = useState<{ [key: string]: string }>({});
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [backgroundPrompt, setBackgroundPrompt] = useState<string>('luxury car showroom');
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [processingResults, setProcessingResults] = useState<Record<string, ProcessingResult>>({});
  const [selectedVersions, setSelectedVersions] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);
  const [isShowing, setIsShowing] = useState(true);
  
  // Add state for processing status
  const [processingStatus, setProcessingStatus] = useState<string>('');
  
  // Add a new state for tracking active background operations
  const [activeOperations, setActiveOperations] = useState<Record<string, boolean>>({});
  
  // Background options for the dropdown - curated for best results
  const backgroundOptions = [
    { value: 'luxury car showroom with marble floors', label: 'Luxury Showroom' },
    { value: 'modern car dealership with large windows', label: 'Modern Dealership' },
    { value: 'premium car showcase with accent lighting', label: 'Premium Showcase' },
    { value: 'elegant automotive gallery with spotlights', label: 'Elegant Gallery' },
    { value: 'professional studio with neutral background', label: 'Professional Studio' },
    { value: 'high-end car studio with dramatic lighting', label: 'Dramatic Studio' },
    { value: 'automotive exhibition with polished floor', label: 'Exhibition Hall' },
    { value: 'exclusive car salon with ambient lighting', label: 'Exclusive Salon' }
  ];
  
  // Generate an optimized seed based on the prompt and image
  // This will be done automatically behind the scenes
  const getOptimizedSeed = (publicId: string, prompt: string): number => {
    // Create a seed that's consistent for the same image+prompt combination
    // This ensures consistent results if the user processes the same image multiple times
    const combinedString = `${publicId}:${prompt}`;
    let hash = 0;
    for (let i = 0; i < combinedString.length; i++) {
      const char = combinedString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Ensure positive number between 1-1000
    return Math.abs(hash % 1000) + 1;
  };
  
  // Handler for when an async job completes
  const handleJobComplete = (publicId: string, jobId: string, urls: string[]) => {
    console.log(`Job ${jobId} for image ${publicId} completed with ${urls.length} previews`);
    
    // Update the processing jobs array
    setProcessingJobs(prevJobs => 
      prevJobs.map(job => 
        job.jobId === jobId ? { ...job, status: 'completed' } : job
      )
    );
    
    // Update the previews
    setBatchPreviews(prev => ({
      ...prev,
      [publicId]: urls
    }));
    
    // Pre-select the first preview
    if (urls.length > 0) {
      setSelectedPreviews(prev => ({
        ...prev,
        [publicId]: urls[0]
      }));
    }
    
    // Check if all jobs are complete
    const updatedJobs = processingJobs.map(job => 
      job.jobId === jobId ? { ...job, status: 'completed' } : job
    );
    
    const allComplete = updatedJobs.every(job => job.status === 'completed' || job.status === 'failed');
    
    if (allComplete) {
      setProcessing(false);
      setSuccess('All images processed. Select your preferred version for each image.');
    }
  };
  
  // Handler for job failure
  const handleJobFailed = (publicId: string, jobId: string, errorMessage: string) => {
    console.error(`Job ${jobId} for image ${publicId} failed: ${errorMessage}`);
    
    // Update the processing jobs array
    setProcessingJobs(prevJobs => 
      prevJobs.map(job => 
        job.jobId === jobId ? { ...job, status: 'failed' } : job
      )
    );
    
    toast.error(`Processing failed for image: ${errorMessage}`);
    
    // Check if all jobs are complete
    const updatedJobs = processingJobs.map(job => 
      job.jobId === jobId ? { ...job, status: 'failed' } : job
    );
    
    const allComplete = updatedJobs.every(job => job.status === 'completed' || job.status === 'failed');
    
    if (allComplete) {
      setProcessing(false);
      setSuccess('Processing complete. Some images may have failed.');
    }
  };
  
  const processBatchBackground = async () => {
    if (imageData.length === 0) {
      toast.error('No images to process');
      return;
    }
    
    setProcessing(true);
    setProcessingJobs([]);
    
    try {
      // Process each image
      for (let i = 0; i < imageData.length; i++) {
        const { publicId } = imageData[i];
        
        // Set this image as being actively processed
        setActiveOperations(prev => ({
          ...prev,
          [publicId]: true
        }));
        
        console.log(`Processing image ${i+1}/${imageData.length}: ${publicId}`);
        toast.loading(`Processing image ${i+1}/${imageData.length}`, {
          id: `processing-${publicId}`
        });
        
        try {
          // Generate optimized seed automatically for this image
          const optimizedSeed = getOptimizedSeed(publicId, backgroundPrompt);
          
          // Add timeout and better error handling for fetch
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
          
          let data: any; // Properly type the data variable
          let usedMockApi = false;
          let retryCount = 0;
          const maxRetries = 3;
          
          // Using a retry loop for better resilience
          while (retryCount <= maxRetries) {
            try {
              setProcessingStatus(`Processing image ${i+1}/${imageData.length}${retryCount > 0 ? ` (Retry ${retryCount}/${maxRetries})` : ''}`);
              
              // Update toast notification with processing status
              toast.loading(`Processing image ${i+1}/${imageData.length}${retryCount > 0 ? ` (Retry ${retryCount}/${maxRetries})` : ''}`, {
                id: `processing-${publicId}`
              });
              
              // Call the API with the correct parameters for Generative Background Replacement
              // Use the automatically generated optimized seed
              const response = await fetch('/api/cloudinary/generative-fill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  publicId,
                  prompt: backgroundPrompt,
                  seed: optimizedSeed // Use the optimized seed
                }),
                signal: controller.signal
              });
              
              // Success! Break out of retry loop
              clearTimeout(timeoutId);
              
              // Check if response exists and is valid
              if (!response) {
                throw new Error('No response received from server');
              }
              
              // Parse the response JSON
              data = await response.json();
              console.log('Generative background replacement API response received:', data);
              
              if (!response.ok) {
                throw new Error(`API error: ${data.error || 'Unknown error'}`);
              }
              
              // Successfully got response, break retry loop
              break;
            } catch (error) {
              // Only retry on network errors or timeouts, not on API errors
              const isNetworkError = error instanceof Error && 
                (error.name === 'AbortError' || error.message.includes('network') || error.message.includes('fetch'));
              
              retryCount++;
              
              if (retryCount > maxRetries || !isNetworkError) {
                // We've exhausted all retries, inform the user and fail gracefully
                console.error("Cloudinary generative background replace failed after multiple attempts");
                toast.error(`Failed to process image ${i+1} after multiple attempts. Please try again later.`, {
                  id: `processing-${publicId}`,
                  duration: 5000
                });
                
                // Not a network error or we've exhausted retries
                throw error;
              }
              
              // Wait before retrying (with exponential backoff)
              const backoffTime = 2000 * Math.pow(2, retryCount - 1);
              console.log(`Retrying in ${backoffTime}ms... (${retryCount}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, backoffTime));
            }
          }
          
          // Handle completed or processing status
          if (data.status === 'completed' && data.urls && data.urls.length > 0) {
            // Results available immediately
            const result: ProcessingResult = { 
              original: publicId, 
              previews: data.urls,
              transformation: data.transformation
            };
            
            if (usedMockApi) {
              console.log(`Using mock images for ${publicId}`);
            }
            
            // Update the processing results
            setProcessingResults(prev => ({
              ...prev,
              [publicId]: result
            }));
            
            // Update the previews
            setBatchPreviews(prev => ({
              ...prev,
              [publicId]: data.urls
            }));
            
            // Auto-select first preview
            setSelectedPreviews(prev => ({
              ...prev,
              [publicId]: data.urls[0]
            }));
          } else if (data.status === 'processing') {
            // For async processing, we need to poll or wait for webhook
            console.log(`Job ${data.jobId} is being processed asynchronously`);
            toast.success(`Image ${i+1} is being processed. Results will be available soon.`);
            
            // Add to processing jobs to track status
            setProcessingJobs(prev => [
              ...prev, 
              { publicId, jobId: data.jobId, status: 'processing' }
            ]);
            
            // Add a placeholder result with async flag
            const asyncResult: ProcessingResult = { 
              original: publicId, 
              previews: [],
              jobId: data.jobId,
              isAsync: true,
              transformation: data.transformation
            };
            
            // Update the processing results
            setProcessingResults(prev => ({
              ...prev,
              [publicId]: asyncResult
            }));
            
            // Auto-select first preview
            setSelectedPreviews(prev => ({
              ...prev,
              [publicId]: asyncResult.previews[0]
            }));
          } else {
            throw new Error('No preview images were generated or job status not recognized');
          }
        } catch (processingError: any) {
          console.error(`Error processing image ${i+1}:`, processingError);
          toast.error(`Failed to process image ${i+1}: ${processingError.message}`);
          
          // Add placeholder for failed image
          const failedResult: ProcessingResult = { 
            original: publicId, 
            error: processingError.message,
            previews: [] // Empty previews for failed image
          };
          
          // Update the processing results
          setProcessingResults(prev => ({
            ...prev,
            [publicId]: failedResult
          }));
          
          // Auto-select first preview
          setSelectedPreviews(prev => ({
            ...prev,
            [publicId]: failedResult.previews[0]
          }));
        } finally {
          // After each image is done processing, mark it as no longer active
          setActiveOperations(prev => ({
            ...prev,
            [publicId]: false
          }));
        }
        
        // Update progress
        setProcessingProgress(((i + 1) / imageData.length) * 100);
        toast.dismiss();
      }
      
      // Check if we have any successful results
      const successfulResults = Object.values(processingResults).filter(result => 
        (!result.error && result.previews.length > 0) || result.isAsync
      );
      
      if (successfulResults.length === 0) {
        setError('No images were successfully processed. Please try again.');
        toast.error('Processing failed for all images');
        setProcessing(false);
        return;
      }
      
      // Organize results by original image ID for immediate results
      const newPreviews = successfulResults.reduce((acc, curr) => {
        // Only include successful results with previews in batchPreviews
        if (curr.previews && curr.previews.length > 0 && !curr.isAsync) {
          acc[curr.original] = curr.previews;
          
          // Auto-select first preview
          setSelectedPreviews(prev => ({
            ...prev,
            [curr.original]: curr.previews[0]
          }));
        }
        return acc;
      }, {} as { [key: string]: string[] });
      
      // Update the batch previews
      setBatchPreviews(prev => ({
        ...prev,
        ...newPreviews
      }));
      
      // Check if all results are immediate or some are async
      const hasAsyncResults = Object.values(processingResults).some(result => result.isAsync);
      
      if (!hasAsyncResults) {
        setProcessing(false);
        setSuccess('All images processed successfully. Select your preferred version for each image.');
      } else {
        setSuccess('Some images are still being processed. You can select completed images while waiting.');
      }
    } catch (error: any) {
      console.error('Error processing images:', error);
      toast.error(`Error: ${error.message}`);
      setError(`Failed to process images: ${error.message}`);
      setProcessing(false);
    }
  };
  
  const saveBatchSelection = async () => {
    if (Object.keys(selectedPreviews).length === 0) {
      toast.error('No images selected');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      // Create a mapping of publicId to selected URL
      const updatedImageData = imageData.map(img => {
        const publicId = img.publicId;
        const selectedUrl = selectedPreviews[publicId];
        
        // If this image has a selected preview, update its URL
        if (selectedUrl) {
          return {
            ...img,
            url: selectedUrl,
            // Mark that this image has been processed
            processed: true
          };
        }
        
        // Otherwise keep the original
        return img;
      });
      
      // Call the parent component's update function
      if (onImageDataChange) {
        onImageDataChange(updatedImageData);
        toast.success('Selected versions saved successfully');
        setSuccess('Background replacements saved successfully.');
        
        // Clear the state after saving
        setBatchPreviews({});
        setSelectedPreviews({});
      } else {
        throw new Error('Unable to save changes: update function not provided');
      }
    } catch (error: any) {
      console.error('Error saving selection:', error);
      setError(`Failed to save selection: ${error.message}`);
      toast.error(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">Professional Background</h2>
      <p className="mb-4 text-gray-600">
        Transform your car photos with AI-generated professional backgrounds that make your 
        listings stand out. Our system automatically applies the highest quality settings.
      </p>
      
      <div className="mb-6">
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Choose a background style
          </label>
          <Select
            disabled={processing}
            value={backgroundPrompt}
            onValueChange={setBackgroundPrompt}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select background style" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Professional Backgrounds</SelectLabel>
                {backgroundOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <Textarea
          placeholder="Or describe your custom background in detail..."
          value={backgroundPrompt}
          onChange={(e) => setBackgroundPrompt(e.target.value)}
          disabled={processing}
          className="h-20 mb-2"
        />
        <p className="text-xs text-gray-500 mt-1">
          For best results, be specific about lighting, materials, and style in your descriptions.
        </p>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={processBatchBackground}
          disabled={processing || imageData.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
          title="Process All Images"
        >
          {processing ? 'Processing...' : 'Process All Images'}
        </Button>
        
        <Button
          onClick={saveBatchSelection}
          disabled={saving || Object.keys(selectedPreviews).length === 0}
          className="bg-green-600 hover:bg-green-700"
          title="Save Selected Versions"
        >
          {saving ? 'Saving...' : 'Save Selected Versions'}
        </Button>
      </div>
      
      {processing && (
        <div className="mb-4">
          <Progress value={processingProgress} className="h-2 mb-2" />
          <p className="text-sm text-center">
            Processing images... {Math.round(processingProgress)}% complete
          </p>
        </div>
      )}
      
      {error && (
        <div className="p-4 mb-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 mb-4 bg-green-100 border border-green-300 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      {processingJobs.length > 0 && (
        <JobStatusTracker 
          jobs={processingJobs} 
          onJobComplete={handleJobComplete}
          onJobFailed={handleJobFailed}
        />
      )}
      
      {Object.keys(batchPreviews).length > 0 && (
        <div className="space-y-8 mt-6">
          <h3 className="text-lg font-semibold mb-2">Image Previews</h3>
          <p className="mb-4 text-sm text-gray-500">
            Select your preferred version for each image to save it
          </p>
          
          {imageData.map((img, index) => {
            const publicId = img.publicId;
            const previews = batchPreviews[publicId] || [];
            const result = processingResults[publicId];
            const isProcessing = activeOperations[publicId];
            
            if (previews.length === 0) return null;
            
            return (
              <div className="relative" key={publicId}>
                {isProcessing && <ProcessingIndicator publicId={publicId} prompt={backgroundPrompt} />}
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Image {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="mb-1 text-sm font-medium">Original</p>
                      <div className="relative h-64 w-full bg-gray-100 rounded-md overflow-hidden">
                        <Image
                          src={img.url}
                          alt={`Original car image ${index + 1}`}
                          className="rounded-md w-full h-auto max-h-[200px] object-contain"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <p className="mb-1 text-sm font-medium">
                        Professional Background
                        {selectedPreviews[publicId] && (
                          <span className="text-green-600 ml-2">✓ Selected</span>
                        )}
                      </p>
                      <div className="relative h-64 w-full bg-gray-100 rounded-md overflow-hidden">
                        {previews.length > 0 ? (
                          <Image
                            src={selectedPreviews[publicId] || previews[0]}
                            alt={`Generated preview ${previews.length > 0 ? previews[0] : ''} for image ${index + 1}`}
                            className="rounded-md w-full h-auto max-h-[200px] object-contain"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            Processing...
                          </div>
                        )}
                      </div>
                      {previews.length > 1 && (
                        <div className="flex mt-2 space-x-2 overflow-x-auto p-1">
                          {previews.map((preview, previewIndex) => (
                            <button
                              key={previewIndex}
                              onClick={() => setSelectedPreviews(prev => ({
                                ...prev,
                                [publicId]: preview
                              }))}
                              className={`relative h-16 w-16 rounded overflow-hidden border-2 ${
                                selectedPreviews[publicId] === preview 
                                  ? 'border-blue-500' 
                                  : 'border-transparent'
                              }`}
                              title={`Select preview ${previewIndex + 1}`}
                            >
                              <Image
                                src={preview}
                                alt={`Thumbnail preview ${index + 1}`}
                                className="w-full h-auto object-contain"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 