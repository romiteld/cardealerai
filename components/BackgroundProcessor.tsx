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
      setError('No images to process');
      toast.error('No images to process');
      return;
    }
    
    setProcessing(true);
    setProcessingProgress(0);
    setError(null);
    setSuccess(null);
    setProcessingJobs([]);
    
    try {
      // Process each image one by one to show progress
      const results: ProcessingResult[] = [];
      for (let i = 0; i < imageData.length; i++) {
        const { publicId } = imageData[i];
        
        // Generate optimized seed automatically for this image
        const optimizedSeed = getOptimizedSeed(publicId, backgroundPrompt);
        
        console.log(`Processing image ${i+1}/${imageData.length}: ${publicId}`);
        toast.loading(`Processing image ${i+1}/${imageData.length}`);
        
        try {
          // Use our generative background replacement API endpoint
          console.log(`Sending request for image ${publicId} with prompt: ${backgroundPrompt || 'none'}`);
          
          // Add timeout and better error handling for fetch
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          let data;
          let usedMockApi = false;
          
          try {
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
            
            clearTimeout(timeoutId);
            
            // Check if response exists and is valid
            if (!response) {
              throw new Error('No response received from server');
            }
            
            // Parse the response JSON only once and store it
            data = await response.json();
            console.log('Generative background replacement API response received:', data);
            
            if (!response.ok) {
              console.error('API error:', data);
              
              // Provide more details about the error
              const errorMsg = data.error || data.message || data.details?.message || `Failed to process image ${i + 1}`;
              console.error('Error details:', JSON.stringify(data, null, 2));
              
              // Check if this is a Cloudinary configuration issue
              if (data.details?.cloudinary_config) {
                const config = data.details.cloudinary_config;
                console.error('Cloudinary configuration status:', config);
                
                if (!config.cloud_name_set || !config.api_key_set || !config.api_secret_set) {
                  console.error('Missing Cloudinary configuration. Please check your environment variables.');
                }
              }
              
              // If the real API failed, try the mock API as fallback
              throw new Error(errorMsg);
            }
          } catch (cloudinaryError) {
            console.log("Real Cloudinary API failed, trying mock API as fallback...", cloudinaryError);
            clearTimeout(timeoutId);
            
            try {
              // Attempt to use the mock API instead
              const mockResponse = await fetch('/api/cloudinary/mock-fill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  publicId,
                  prompt: backgroundPrompt,
                  seed: optimizedSeed
                })
              });
              
              if (!mockResponse.ok) {
                throw new Error('Mock API also failed');
              }
              
              data = await mockResponse.json();
              usedMockApi = true;
              console.log('Mock API response received:', data);
              
              // Show toast indicating we're using mock data
              toast.success(`Using simulated images for image ${i+1}`);
            } catch (mockError: any) {
              // Both APIs failed, re-throw the original error
              console.error('Both real and mock APIs failed:', mockError);
              throw cloudinaryError;
            }
          }
          
          // Handle completed or processing status
          if (data.status === 'completed' && data.urls && data.urls.length > 0) {
            // Results available immediately
            results.push({ 
              original: publicId, 
              previews: data.urls,
              transformation: data.transformation
            });
            
            if (usedMockApi) {
              console.log(`Using mock images for ${publicId}`);
            }
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
            results.push({ 
              original: publicId, 
              previews: [],
              jobId: data.jobId,
              isAsync: true,
              transformation: data.transformation
            });
          } else {
            throw new Error('No preview images were generated or job status not recognized');
          }
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
      const successfulResults = results.filter(result => 
        (!result.error && result.previews.length > 0) || result.isAsync
      );
      
      if (successfulResults.length === 0) {
        setError('No images were successfully processed. Please try again.');
        toast.error('Processing failed for all images');
        setProcessing(false);
        return;
      }
      
      // Organize results by original image ID for immediate results
      const newPreviews = results.reduce((acc, curr) => {
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
      const hasAsyncResults = results.some(result => result.isAsync);
      
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
        >
          {processing ? 'Processing...' : 'Process All Images'}
        </Button>
        
        <Button
          onClick={saveBatchSelection}
          disabled={saving || Object.keys(selectedPreviews).length === 0}
          className="bg-green-600 hover:bg-green-700"
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
            
            if (previews.length === 0) return null;
            
            return (
              <Card key={publicId} className="p-4">
                <h4 className="font-medium mb-2">Image {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1 text-sm font-medium">Original</p>
                    <div className="relative h-64 w-full bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={img.url}
                        alt={`Original image ${index + 1}`}
                        fill
                        style={{ objectFit: 'contain' }}
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
                          alt={`New background image ${index + 1}`}
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          Processing...
                        </div>
                      )}
                    </div>
                    {previews.length > 1 && (
                      <div className="flex mt-2 space-x-2 overflow-x-auto p-1">
                        {previews.map((previewUrl, previewIndex) => (
                          <button
                            key={previewIndex}
                            onClick={() => setSelectedPreviews(prev => ({
                              ...prev,
                              [publicId]: previewUrl
                            }))}
                            className={`relative h-16 w-16 rounded overflow-hidden border-2 ${
                              selectedPreviews[publicId] === previewUrl 
                                ? 'border-blue-500' 
                                : 'border-transparent'
                            }`}
                          >
                            <Image
                              src={previewUrl}
                              alt={`Preview option ${previewIndex + 1}`}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 