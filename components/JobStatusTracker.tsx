'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Job {
  publicId: string;
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface JobStatusTrackerProps {
  jobs: Job[];
  onJobComplete: (publicId: string, jobId: string, urls: string[]) => void;
  onJobFailed: (publicId: string, jobId: string, errorMessage: string) => void;
  pollingInterval?: number; // in milliseconds
  maxPolls?: number;
}

// Individual job tracker component
function SingleJobTracker({
  jobId,
  publicId,
  initialStatus,
  onComplete,
  onFailed,
  pollingInterval = 5000,
  maxPolls = 12
}: {
  jobId: string;
  publicId: string;
  initialStatus: 'pending' | 'processing' | 'completed' | 'failed';
  onComplete: (publicId: string, jobId: string, urls: string[]) => void;
  onFailed: (publicId: string, jobId: string, errorMessage: string) => void;
  pollingInterval?: number;
  maxPolls?: number;
}) {
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [isPolling, setIsPolling] = useState(initialStatus !== 'completed' && initialStatus !== 'failed');

  // Fetch job status
  const checkJobStatus = async () => {
    if (status === 'completed' || status === 'failed') {
      return; // Already in final state
    }
    
    try {
      const response = await fetch(`/api/cloudinary/generative-fill?jobId=${jobId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch job status');
      }
      
      const data = await response.json();
      
      // Update status based on response
      if (data.status === 'completed') {
        setStatus('completed');
        setIsPolling(false);
        
        if (data.urls && data.urls.length > 0) {
          onComplete(publicId, jobId, data.urls);
        } else {
          // If completed but no URLs, treat as failure
          const errorMsg = 'No result URLs received from processing';
          setStatus('failed');
          setError(errorMsg);
          onFailed(publicId, jobId, errorMsg);
        }
      } else if (data.status === 'failed') {
        setStatus('failed');
        const errorMsg = data.error || 'Processing failed';
        setError(errorMsg);
        setIsPolling(false);
        onFailed(publicId, jobId, errorMsg);
      } else {
        setStatus('processing');
      }
    } catch (error) {
      console.error('Error checking job status:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      
      // Continue polling even on error, in case it's a temporary issue
      if (pollCount >= maxPolls) {
        setIsPolling(false);
        setStatus('failed');
        onFailed(publicId, jobId, 'Failed to get processing status after multiple attempts');
      }
    }
  };

  // Set up polling
  useEffect(() => {
    if (!isPolling) return;
    
    // Check immediately on mount
    checkJobStatus();
    
    // Set up interval for polling
    const intervalId = setInterval(() => {
      setPollCount(prev => {
        const newCount = prev + 1;
        
        // Stop polling if we've reached the maximum
        if (newCount >= maxPolls) {
          setIsPolling(false);
          if (status !== 'completed') {
            setStatus('failed');
            setError('Processing timed out');
            onFailed(publicId, jobId, 'Processing timed out');
          }
        }
        
        return newCount;
      });
      
      checkJobStatus();
    }, pollingInterval);
    
    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [isPolling, jobId, maxPolls, pollingInterval, status, publicId]);

  // Render status indicator
  return (
    <div className="flex items-center space-x-2 text-sm py-1">
      {status === 'pending' && (
        <>
          <RefreshCw size={16} className="text-gray-500 animate-spin" />
          <span className="text-gray-500">Job {jobId.slice(-8)}: Waiting to start...</span>
        </>
      )}
      
      {status === 'processing' && (
        <>
          <RefreshCw size={16} className="text-blue-500 animate-spin" />
          <span className="text-blue-500">
            Job {jobId.slice(-8)}: Processing... {pollCount}/{maxPolls}
          </span>
        </>
      )}
      
      {status === 'completed' && (
        <>
          <CheckCircle size={16} className="text-green-500" />
          <span className="text-green-500">Job {jobId.slice(-8)}: Complete</span>
        </>
      )}
      
      {status === 'failed' && (
        <>
          <XCircle size={16} className="text-red-500" />
          <span className="text-red-500">
            Job {jobId.slice(-8)}: {error || 'Failed'}
          </span>
        </>
      )}
    </div>
  );
}

// Main component to track multiple jobs
export default function JobStatusTracker({
  jobs,
  onJobComplete,
  onJobFailed,
  pollingInterval = 5000,
  maxPolls = 24
}: JobStatusTrackerProps) {
  // Count jobs by status
  const completedCount = jobs.filter(job => job.status === 'completed').length;
  const failedCount = jobs.filter(job => job.status === 'failed').length;
  const totalCount = jobs.length;
  const inProgressCount = totalCount - completedCount - failedCount;
  
  return (
    <div className="bg-gray-50 border rounded-md p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Background Processing Jobs</h3>
        <div className="text-sm">
          <span className={`${completedCount > 0 ? 'text-green-600' : 'text-gray-500'} mr-3`}>
            {completedCount} completed
          </span>
          <span className={`${failedCount > 0 ? 'text-red-600' : 'text-gray-500'} mr-3`}>
            {failedCount} failed
          </span>
          <span className={`${inProgressCount > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
            {inProgressCount} in progress
          </span>
        </div>
      </div>
      
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {jobs.map(job => (
          <SingleJobTracker
            key={job.jobId}
            jobId={job.jobId}
            publicId={job.publicId}
            initialStatus={job.status}
            onComplete={onJobComplete}
            onFailed={onJobFailed}
            pollingInterval={pollingInterval}
            maxPolls={maxPolls}
          />
        ))}
      </div>
    </div>
  );
} 