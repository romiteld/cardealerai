'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function CloudinaryTestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [envCheck, setEnvCheck] = useState<any>(null);

  const checkEnvironment = async () => {
    setLoading(true);
    setError(null);
    setEnvCheck(null);
    
    try {
      const response = await fetch('/api/cloudinary/test', {
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check environment');
      }
      
      setEnvCheck(data);
      
      if (data.isConfigured) {
        toast.success('Cloudinary environment variables are correctly configured');
      } else {
        toast.error('Cloudinary configuration is incomplete');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCloudinary = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/cloudinary/test', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Test failed');
      }
      
      setTestResult(data);
      toast.success('Cloudinary test completed successfully');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Cloudinary Integration Test</h1>
      
      <div className="space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          <p className="mb-4">Check if all required Cloudinary environment variables are properly configured.</p>
          
          <Button onClick={checkEnvironment} disabled={loading}>
            {loading ? 'Checking...' : 'Check Environment'}
          </Button>
          
          {envCheck && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="font-medium mb-2">Environment Status:</h3>
              <ul className="space-y-1">
                {Object.entries(envCheck.variables || {}).map(([key, value]: [string, any]) => (
                  <li key={key} className="flex items-center">
                    <span className={value ? 'text-green-600' : 'text-red-600'}>
                      {value ? '✓' : '✗'}
                    </span>
                    <span className="ml-2">{key}</span>
                  </li>
                ))}
              </ul>
              
              <p className="mt-4 font-medium">
                Status: {' '}
                <span className={envCheck.isConfigured ? 'text-green-600' : 'text-red-600'}>
                  {envCheck.isConfigured ? 'Configured' : 'Not Configured'}
                </span>
              </p>
              
              {envCheck.message && (
                <p className="mt-2 text-gray-700">{envCheck.message}</p>
              )}
            </div>
          )}
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Cloudinary API Test</h2>
          <p className="mb-4">Test the Cloudinary API by creating a simple transformation.</p>
          
          <Button onClick={testCloudinary} disabled={loading}>
            {loading ? 'Testing...' : 'Run Test'}
          </Button>
          
          {testResult && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Test Result:</h3>
              
              {testResult.success ? (
                <div className="text-green-600 mb-2">Test completed successfully!</div>
              ) : (
                <div className="text-red-600 mb-2">Test failed.</div>
              )}
              
              {testResult.imageUrl && (
                <div className="mt-4">
                  <p className="mb-2">Transformed Image:</p>
                  <Image 
                    src={testResult.imageUrl}
                    alt="Test Image" 
                    width={300}
                    height={200}
                    className="rounded-md border"
                  />
                </div>
              )}
              
              {testResult.details && (
                <pre className="mt-4 p-4 bg-gray-100 rounded-md overflow-x-auto text-sm">
                  {JSON.stringify(testResult.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </Card>
      </div>
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <h3 className="font-medium mb-1">Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
} 