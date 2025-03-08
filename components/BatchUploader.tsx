'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { toast } from 'react-hot-toast';

interface BatchUploaderProps {
  initialImages?: any[];
  onUploadComplete: (results: any[]) => void;
  folder?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export default function BatchUploader({
  initialImages = [],
  onUploadComplete,
  folder = 'car-images',
  maxFiles = 20,
  maxSize = 10
}: BatchUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    
    const totalFiles = files.length + newFiles.length + existingImages.length;
    
    if (totalFiles > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed. You tried to add ${totalFiles} files.`);
      return;
    }
    
    // Check for file size
    const oversizedFiles = newFiles.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed the ${maxSize}MB size limit and were rejected.`);
      
      // Filter out oversized files
      const validFiles = newFiles.filter(file => file.size <= maxSize * 1024 * 1024);
      setFiles(prev => [...prev, ...validFiles]);
      return;
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
  }, [files.length, existingImages.length, maxFiles, maxSize]);
  
  // Fix the refs and drag active state
  const dropzoneRef = React.useRef(null);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxFiles,
    maxSize: maxSize * 1024 * 1024 // Convert MB to bytes
  });
  
  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select files to upload');
      return;
    }
    
    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Use our API endpoint for Cloudinary uploads
        const uploadEndpoint = '/api/cloudinary/upload';
        
        // Add console logs for debugging
        console.log(`Uploading file: ${file.name} to ${uploadEndpoint}`);
        
        try {
          const response = await fetch(uploadEndpoint, {
            method: 'POST',
            body: formData
          });
          
          // Check for non-JSON responses
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error(`Server responded with non-JSON data. Status: ${response.status}`);
          }
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to upload ${file.name}`);
          }
          
          const data = await response.json();
          console.log('Upload successful:', data);
          
          // Update progress
          setProgress(Math.round(((index + 1) / files.length) * 100));
          
          return {
            originalName: file.name,
            url: data.secure_url || data.url,
            publicId: data.public_id,
            width: data.width,
            height: data.height
          };
        } catch (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError);
          throw uploadError;
        }
      });
      
      const results = await Promise.all(uploadPromises);
      
      // Combine with existing images if any
      const allImages = [...existingImages, ...results];
      
      onUploadComplete(allImages);
      setFiles([]);
      setExistingImages(allImages);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };
  
  const removeExistingImage = (index: number) => {
    try {
      // Create a deep copy of the existing images array
      const updatedImages = JSON.parse(JSON.stringify(existingImages));
      
      // Get the image being removed (for logging)
      const removedImage = updatedImages[index];
      console.log('Removing image:', removedImage);
      
      // Remove the image at the specified index
      updatedImages.splice(index, 1);
      
      // Update the local state first to ensure immediate UI feedback
      setExistingImages(updatedImages);
      console.log('Updated images array after removal:', updatedImages);
      
      // Notify the parent component about the change after a small delay
      // This ensures the DOM has updated before any potential re-renders from parent
      setTimeout(() => {
        try {
          onUploadComplete(updatedImages);
          toast.success(`Image ${index + 1} deleted successfully`);
        } catch (error) {
          console.error('Error in callback after image deletion:', error);
          toast.error('Error updating parent component after deletion');
        }
      }, 50);
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };
  
  // Update the handleDeleteImage function to completely prevent any form submission or navigation
  const handleDeleteImage = (index: number, event?: React.MouseEvent) => {
    // Prevent all default behaviors that might cause navigation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Use a custom confirmation dialog if available
    if (confirm(`Are you sure you want to delete image ${index + 1}?`)) {
      // Wrap in setTimeout to ensure event handling is complete before deletion logic runs
      setTimeout(() => {
        removeExistingImage(index);
      }, 10);
    }
  };
  
  // Fix the useEffect to use a different approach to access dropzone internals
  useEffect(() => {
    // If existingImages changes (like after a deletion), reset the internal files state
    setFiles([]);
    // We can't directly access dropzone methods - instead reset files state
    // and clear any UI indicators
  }, [existingImages.length]);

  // Update the handleSubmit function to fix any file handling issues
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Don't proceed if already uploading or no files
    if (uploading || files.length === 0) return;
    
    handleUpload();
  };

  // Similarly, update the resetUploader function
  const resetUploader = () => {
    setFiles([]);
    setProgress(0);
    setError(null);
    setUploading(false);
    
    // Just reset the files - we can't directly access dropzone methods
    // in a type-safe way
  };
  
  return (
    <div className="space-y-4">
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Existing Images ({existingImages.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {existingImages.map((image, index) => (
              <div key={index} className="relative group">
                <Image
                  src={image.url}
                  alt={`Existing image ${index + 1}`}
                  width={200}
                  height={150}
                  className="w-full h-24 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={(event) => handleDeleteImage(index, event)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-opacity"
                  aria-label={`Remove image ${index + 1}`}
                >
                  ×
                </button>
                
                {/* Add a delete button below the image for more visibility */}
                <button
                  type="button"
                  onClick={(event) => handleDeleteImage(index, event)}
                  className="w-full mt-1 py-1 bg-red-100 text-red-700 text-xs rounded flex items-center justify-center hover:bg-red-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-8 rounded-md text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        ref={dropzoneRef}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="text-4xl text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="text-gray-600">
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag & drop vehicle images here, or click to select files</p>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Supported formats: JPEG, PNG, WebP (max {maxSize}MB)
          </p>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Selected files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Selected Files ({files.length})</h3>
          <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
            {files.map((file, index) => (
              <div key={index} className="flex justify-between items-center p-2">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 flex-shrink-0">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="truncate max-w-xs">{file.name}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                  aria-label={`Remove ${file.name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          {/* Upload progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full h-2" />
            </div>
          )}
          
          {/* Upload button */}
          {!uploading && (
            <Button 
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Upload Files
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 