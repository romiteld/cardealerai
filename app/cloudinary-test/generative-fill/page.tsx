'use client';

import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function GenerativeFillTestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [publicId, setPublicId] = useState('');
  const [prompt, setPrompt] = useState('luxury car dealership showroom');
  const [removeBackground, setRemoveBackground] = useState(true);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  
  // First let's check if environment variables are set
  const checkEnvironment = async () => {
    setLoading(true);
    setError(null);
    setResponseData(null);
    
    try {
      const response = await fetch('/api/env-check');
      const data = await response.json();
      
      setResponseData({
        type: 'environment',
        data
      });
      
      if (data.environment.CLOUDINARY_CLOUD_NAME && 
          data.environment.CLOUDINARY_API_KEY && 
          data.environment.CLOUDINARY_API_SECRET) {
        toast.success('All required Cloudinary environment variables are set');
      } else {
        const missing = Object.entries(data.environment)
          .filter(([key, value]) => key.startsWith('CLOUDINARY_') && !value)
          .map(([key]) => key);
        
        toast.error(`Missing environment variables: ${missing.join(', ')}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check environment');
      toast.error('Error checking environment');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to test generative fill
  const testGenerativeFill = async () => {
    if (!publicId) {
      toast.error('Please enter a Cloudinary Public ID');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResponseData(null);
    setResultImageUrl(null);
    
    try {
      const response = await fetch('/api/cloudinary/generative-fill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicId,
          prompt: prompt || undefined,
          removeBackground
        }),
      });
      
      const data = await response.json();
      setResponseData({
        type: 'generativeFill',
        data
      });
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Unknown error from Cloudinary API');
      }
      
      if (data.status === 'completed' && data.urls && data.urls.length > 0) {
        setResultImageUrl(data.urls[0]);
        toast.success('Image processed successfully!');
      } else if (data.status === 'processing') {
        toast.success('Image is being processed asynchronously. Check back later.');
      } else {
        toast.error('No preview images were generated');
      }
    } catch (err: any) {
      setError(err.message || 'Error processing image');
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Cloudinary Generative Fill Test</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          <p className="mb-4 text-gray-600">
            Check if Cloudinary environment variables are properly configured.
          </p>
          
          <Button 
            onClick={checkEnvironment} 
            disabled={loading}
            className="w-full"
          >
            {loading && responseData?.type === 'environment' ? 'Checking...' : 'Check Environment'}
          </Button>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Generative Fill Test</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Cloudinary Public ID
              </label>
              <Input 
                value={publicId}
                onChange={(e) => setPublicId(e.target.value)}
                placeholder="e.g., sample"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a public ID of an image already uploaded to your Cloudinary account
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Background Prompt
              </label>
              <Textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., luxury car dealership showroom"
                rows={2}
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="removeBackground"
                checked={removeBackground}
                onChange={(e) => setRemoveBackground(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="removeBackground" className="text-sm">
                Remove Background
              </label>
            </div>
            
            <Button 
              onClick={testGenerativeFill} 
              disabled={loading || !publicId}
              className="w-full"
            >
              {loading && responseData?.type === 'generativeFill' ? 'Processing...' : 'Test Generative Fill'}
            </Button>
          </div>
        </Card>
      </div>
      
      {error && (
        <Card className="p-6 mt-6 border-red-200 bg-red-50">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
        </Card>
      )}
      
      {responseData && (
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">
            {responseData.type === 'environment' ? 'Environment Check Result' : 'API Response'}
          </h2>
          
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
            {JSON.stringify(responseData.data, null, 2)}
          </pre>
        </Card>
      )}
      
      {resultImageUrl && (
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Generated Image</h2>
          
          <div className="relative h-[400px] w-full rounded-md overflow-hidden">
            <Image
              src={resultImageUrl}
              alt="Generated result"
              fill
              style={{ objectFit: 'contain' }}
              className="rounded-md"
            />
          </div>
        </Card>
      )}
    </div>
  );
} 