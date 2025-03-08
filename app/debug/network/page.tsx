'use client';

import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { toast } from 'react-hot-toast';

export default function NetworkDebugPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [endpoint, setEndpoint] = useState('/api/debug/network');
  const [delay, setDelay] = useState(0);
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [body, setBody] = useState('{}');
  
  const testFetch = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      // Add delay parameter to URL
      const url = new URL(endpoint, window.location.origin);
      if (delay > 0) {
        url.searchParams.set('delay', delay.toString());
      }
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const options: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        };
        
        // Add body for POST requests
        if (method === 'POST' && body.trim()) {
          try {
            // Check if body is valid JSON
            JSON.parse(body);
            options.body = body;
          } catch (e) {
            toast.error('Invalid JSON in request body');
            setError('Invalid JSON in request body');
            setLoading(false);
            clearTimeout(timeoutId);
            return;
          }
        }
        
        console.log(`Sending ${method} request to: ${url.toString()}`);
        console.log('Request options:', options);
        
        const startTime = Date.now();
        const response = await fetch(url.toString(), options);
        const endTime = Date.now();
        
        clearTimeout(timeoutId);
        
        const data = await response.json();
        
        setResponse({
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers.entries()]),
          data,
          timing: {
            duration: endTime - startTime,
            started: new Date(startTime).toISOString(),
            completed: new Date(endTime).toISOString()
          }
        });
        
        toast.success(`Request completed with status: ${response.status}`);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        // Handle specific fetch errors
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out after 30 seconds');
        } else if (!window.navigator.onLine) {
          throw new Error('Network connection is offline. Please check your internet connection.');
        } else {
          console.error('Fetch error details:', fetchError);
          throw new Error(`Fetch error: ${fetchError.message}`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      toast.error(`Error: ${err.message}`);
      console.error('Debug request error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Network Debug Tool</h1>
      <p className="mb-6 text-gray-600">
        Use this tool to test API connectivity and diagnose fetch errors.
      </p>
      
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Request Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Endpoint URL</label>
            <Input 
              value={endpoint} 
              onChange={e => setEndpoint(e.target.value)}
              placeholder="/api/endpoint"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">HTTP Method</label>
              <select
                className="w-full p-2 border rounded-md"
                value={method}
                onChange={e => setMethod(e.target.value as 'GET' | 'POST')}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Delay (ms)</label>
              <Input 
                type="number"
                value={delay} 
                onChange={e => setDelay(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>
          
          {method === 'POST' && (
            <div>
              <label className="block text-sm font-medium mb-1">Request Body (JSON)</label>
              <textarea
                className="w-full p-2 border rounded-md font-mono text-sm"
                rows={5}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="{}"
              />
            </div>
          )}
          
          <Button onClick={testFetch} disabled={loading} className="w-full">
            {loading ? 'Sending Request...' : 'Send Request'}
          </Button>
        </div>
      </Card>
      
      {error && (
        <Card className="p-6 mb-8 border-red-200 bg-red-50">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
        </Card>
      )}
      
      {response && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Response</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Status</h3>
              <div className="p-2 bg-gray-100 rounded">
                {response.status} {response.statusText}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Timing</h3>
              <div className="p-2 bg-gray-100 rounded">
                {response.timing.duration}ms
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-1">Response Headers</h3>
            <pre className="p-3 bg-gray-100 rounded-md overflow-x-auto text-xs">
              {JSON.stringify(response.headers, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-1">Response Body</h3>
            <pre className="p-3 bg-gray-100 rounded-md overflow-x-auto text-xs">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
} 