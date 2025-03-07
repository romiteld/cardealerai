'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Icons } from '../shared/icons';

interface SocialMediaManagerProps {
  listingId?: string;
  listingTitle?: string;
  mode?: 'single' | 'multiple'; // single for one listing, multiple for bulk scheduling
}

export default function SocialMediaManager({ 
  listingId, 
  listingTitle, 
  mode = 'single' 
}: SocialMediaManagerProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [postMode, setPostMode] = useState('immediate');
  const [scheduledTime, setScheduledTime] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postResult, setPostResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  
  // Fetch connected platforms
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await fetch('/api/social/platforms');
        
        if (!response.ok) {
          throw new Error('Failed to fetch connected platforms');
        }
        
        const data = await response.json();
        setConnectedPlatforms(data);
        
        // Pre-select the first platform if available
        if (data.length > 0) {
          setSelectedPlatforms([data[0].id]);
        }
      } catch (error: any) {
        console.error('Error fetching platforms:', error);
        setError('Failed to load connected platforms');
      }
    };
    
    fetchPlatforms();
  }, []);
  
  // Fetch listings for multi-listing mode
  useEffect(() => {
    if (mode === 'multiple') {
      const fetchListings = async () => {
        try {
          const response = await fetch('/api/listings?status=published');
          
          if (!response.ok) {
            throw new Error('Failed to fetch listings');
          }
          
          const data = await response.json();
          setListings(data.data || []);
        } catch (error: any) {
          console.error('Error fetching listings:', error);
          setError('Failed to load listings');
        }
      };
      
      fetchListings();
    }
  }, [mode]);
  
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };
  
  const toggleListing = (listingId: string) => {
    setSelectedListings(prev => 
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };
  
  const handlePost = async () => {
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform');
      return;
    }
    
    if (postMode === 'scheduled' && !scheduledTime) {
      setError('Please select a scheduled time');
      return;
    }
    
    if (mode === 'multiple' && selectedListings.length === 0) {
      setError('Please select at least one listing');
      return;
    }
    
    setIsPosting(true);
    setError(null);
    
    try {
      if (mode === 'single') {
        // Single listing post
        if (!listingId) {
          throw new Error('No listing selected');
        }
        
        const results = await Promise.all(
          selectedPlatforms.map(async (platform) => {
            const response = await fetch(`/api/social/publish`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                listingId,
                platform,
                immediate: postMode === 'immediate',
                scheduledTime: postMode === 'scheduled' ? scheduledTime : null,
                customMessage: customMessage || undefined
              })
            });
            
            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || `Failed to post to ${platform}`);
            }
            
            return await response.json();
          })
        );
        
        setPostResult({
          type: 'single',
          listingId,
          results
        });
      } else {
        // Multiple listings post
        const results = await Promise.all(
          selectedListings.map(async (listingId) => {
            const listingResults = await Promise.all(
              selectedPlatforms.map(async (platform) => {
                const response = await fetch(`/api/social/publish`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    listingId,
                    platform,
                    immediate: postMode === 'immediate',
                    scheduledTime: postMode === 'scheduled' ? scheduledTime : null,
                    customMessage: customMessage || undefined
                  })
                });
                
                if (!response.ok) {
                  const data = await response.json();
                  throw new Error(data.error || `Failed to post listing ${listingId} to ${platform}`);
                }
                
                return await response.json();
              })
            );
            
            return {
              listingId,
              platforms: listingResults
            };
          })
        );
        
        setPostResult({
          type: 'multiple',
          results
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to post to social media');
    } finally {
      setIsPosting(false);
    }
  };
  
  const getPlatformIcon = (platformId: string) => {
    switch (platformId) {
      case 'x':
        return <Icons.twitter className="h-5 w-5" />;
      case 'facebook':
        return <Icons.facebook className="h-5 w-5" />;
      case 'instagram':
        return <Icons.instagram className="h-5 w-5" />;
      default:
        return null;
    }
  };
  
  const getPlatformName = (platformId: string) => {
    switch (platformId) {
      case 'x': return 'X (Twitter)';
      case 'facebook': return 'Facebook';
      case 'instagram': return 'Instagram';
      default: return platformId;
    }
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        {mode === 'single' 
          ? 'Share Listing to Social Media' 
          : 'Bulk Social Media Posting'
        }
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {postResult ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 text-green-700 rounded">
            <div className="font-medium">Success!</div>
            <div>
              {postMode === 'immediate' 
                ? 'Your post has been shared to the selected platforms.'
                : 'Your post has been scheduled for the selected platforms.'}
            </div>
          </div>
          
          <div className="space-y-2">
            {postResult.type === 'single' ? (
              // Single listing results
              postResult.results.map((result: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="text-green-500">✓</div>
                  <div className="flex items-center">
                    {getPlatformIcon(result.platform)}
                    <span className="ml-2">
                      {getPlatformName(result.platform)}
                    </span>
                  </div>
                  <div className="text-gray-500 text-sm">
                    {result.postId ? `Post ID: ${result.postId.substring(0, 8)}...` : 
                     result.scheduledTime ? `Scheduled for ${new Date(result.scheduledTime).toLocaleString()}` : ''}
                  </div>
                </div>
              ))
            ) : (
              // Multiple listings results
              postResult.results.map((listingResult: any, index: number) => {
                const listing = listings.find(l => l.id === listingResult.listingId);
                return (
                  <div key={index} className="mb-2">
                    <div className="font-medium">{listing?.title || `Listing ${listingResult.listingId.substring(0, 8)}`}</div>
                    <div className="ml-4 space-y-1">
                      {listingResult.platforms.map((platformResult: any, platformIndex: number) => (
                        <div key={platformIndex} className="flex items-center space-x-2">
                          <div className="text-green-500">✓</div>
                          <div className="flex items-center">
                            {getPlatformIcon(platformResult.platform)}
                            <span className="ml-2">
                              {getPlatformName(platformResult.platform)}
                            </span>
                          </div>
                          <div className="text-gray-500 text-sm">
                            {platformResult.postId ? `Post ID: ${platformResult.postId.substring(0, 8)}...` : 
                             platformResult.scheduledTime ? `Scheduled for ${new Date(platformResult.scheduledTime).toLocaleString()}` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <Button
            onClick={() => setPostResult(null)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Share Again
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Platform Selection */}
          <div>
            <h3 className="font-medium mb-2">Select Platforms</h3>
            
            {connectedPlatforms.length === 0 ? (
              <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
                <p>No social media platforms connected.</p>
                <a href="/settings" className="underline">
                  Connect your accounts in settings
                </a>
              </div>
            ) : (
              <div className="flex space-x-4">
                {connectedPlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`flex items-center space-x-2 p-3 rounded-lg border ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {getPlatformIcon(platform.id)}
                    <span>{getPlatformName(platform.id)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Listing Selection (Multiple Mode) */}
          {mode === 'multiple' && (
            <div>
              <h3 className="font-medium mb-2">Select Listings</h3>
              
              {listings.length === 0 ? (
                <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
                  <p>No published listings available for sharing.</p>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto border rounded-md divide-y">
                  {listings.map((listing) => (
                    <div 
                      key={listing.id} 
                      className={`p-3 flex items-center ${
                        selectedListings.includes(listing.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`listing-${listing.id}`}
                        checked={selectedListings.includes(listing.id)}
                        onChange={() => toggleListing(listing.id)}
                        className="mr-3"
                      />
                      <label 
                        htmlFor={`listing-${listing.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{listing.title}</div>
                        <div className="text-sm text-gray-500">
                          {listing.year} {listing.make} {listing.model} - ${listing.price?.toLocaleString()}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Post Timing */}
          <div>
            <h3 className="font-medium mb-2">Post Timing</h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="postMode"
                  value="immediate"
                  checked={postMode === 'immediate'}
                  onChange={() => setPostMode('immediate')}
                  className="mr-2"
                />
                <span>Post immediately</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="postMode"
                  value="scheduled"
                  checked={postMode === 'scheduled'}
                  onChange={() => setPostMode('scheduled')}
                  className="mr-2"
                />
                <span>Schedule for later</span>
              </label>
            </div>
            
            {postMode === 'scheduled' && (
              <div className="mt-2">
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
          </div>
          
          {/* Custom Message */}
          <div>
            <h3 className="font-medium mb-2">Message (Optional)</h3>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={mode === 'single' 
                ? `Default message: "Check out our newest listing: ${listingTitle}"`
                : "Enter a custom message for all selected listings"
              }
              rows={3}
              className="w-full rounded-md"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave blank to use the default message format.
            </p>
          </div>
          
          {/* Post Button */}
          <Button
            onClick={handlePost}
            disabled={isPosting || selectedPlatforms.length === 0 || (mode === 'multiple' && selectedListings.length === 0)}
            className={
              isPosting || selectedPlatforms.length === 0 || (mode === 'multiple' && selectedListings.length === 0)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
          >
            {isPosting ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              mode === 'single'
                ? 'Share to Selected Platforms' 
                : 'Post to Selected Platforms'
            )}
          </Button>
        </div>
      )}
    </Card>
  );
} 