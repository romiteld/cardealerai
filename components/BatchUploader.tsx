'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';

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
    // Validate file size and type
    const validFiles = acceptedFiles.filter(file => {
      // Check max size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File "${file.name}" exceeds the ${maxSize}MB size limit`);
        return false;
      }
      
      // Check valid types
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(`File "${file.name}" has an unsupported format`);
        return false;
      }
      
      return true;
    });
    
    // Check if adding these files would exceed the maxFiles limit
    if (files.length + validFiles.length + existingImages.length > maxFiles) {
      setError(`You can upload a maximum of ${maxFiles} images. You're attempting to add ${validFiles.length} more images to the existing ${files.length + existingImages.length}.`);
      return;
    }
    
    setFiles(prev => [...prev, ...validFiles]);
    setError(null);
  }, [files.length, existingImages.length, maxFiles, maxSize]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles
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
    const newImages = [...existingImages];
    newImages.splice(index, 1);
    setExistingImages(newImages);
    onUploadComplete(newImages);
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
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove image ${index + 1}`}
                >
                  ×
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
              onClick={handleUpload}
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