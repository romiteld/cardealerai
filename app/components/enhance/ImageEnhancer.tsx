import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { RefreshCw, Download, Check, Eye } from 'react-feather';
import EnhanceControls from './EnhanceControls';
import ComparisonSlider from './ComparisonSlider';
import EnhancementSuggestions from './EnhancementSuggestions';

interface ImageEnhancerProps {
  image: {
    publicId: string;
    url: string;
    width: number;
    height: number;
  };
  onComplete: (enhancedUrl: string) => void;
  onClose: () => void;
}

interface EnhanceSettings {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  sharpness?: number;
  vibrance?: number;
  preset?: string;
}

interface PreviewUrl {
  name: string;
  url: string;
}

export default function ImageEnhancer({ image, onComplete, onClose }: ImageEnhancerProps) {
  const [settings, setSettings] = useState<EnhanceSettings>({});
  const [previewUrl, setPreviewUrl] = useState<string>(image.url);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [suggestions, setSuggestions] = useState<string>('');
  const [previewUrls, setPreviewUrls] = useState<PreviewUrl[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{
    publicId: string;
    url: string;
    width: number;
    height: number;
  } | null>(null);

  // Use uploaded image if available, otherwise use provided image
  const currentImage = uploadedImage || image;

  useEffect(() => {
    if (currentImage) {
      setPreviewUrl(currentImage.url);
      loadSuggestions();
    }
  }, [currentImage]);

  // Load AI suggestions when component mounts
  const loadSuggestions = async () => {
    if (!currentImage?.url) return;

    try {
      setIsLoadingSuggestions(true);
      const response = await fetch('/api/enhance-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: currentImage.url }),
      });

      if (!response.ok) throw new Error('Failed to load suggestions');

      const data = await response.json();
      setSuggestions(data.suggestions);
      setPreviewUrls(data.previewUrls || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast.error('Failed to load enhancement suggestions');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('file', file);

      console.log('Starting file upload...');
      const response = await fetch('/api/enhance-image', {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (!response.ok) {
        const errorMessage = data.error || data.details || 'Failed to upload image';
        console.error('Upload error:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.secure_url) {
        console.error('Invalid response data:', data);
        throw new Error('Invalid response from server');
      }

      const uploadedImageData = {
        publicId: data.public_id,
        url: data.secure_url,
        width: data.width || 800,
        height: data.height || 600
      };

      console.log('Setting uploaded image data:', uploadedImageData);
      setUploadedImage(uploadedImageData);
      setPreviewUrl(data.secure_url);
      toast.success('Image uploaded successfully');

      // Reset any previous settings
      setSettings({});
      
      // Load suggestions for the new image
      await loadSuggestions();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply enhancements and get preview
  const applyEnhancements = async (newSettings: EnhanceSettings) => {
    if (!currentImage?.url) {
      toast.error('Please upload an image first');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await fetch('/api/enhance-image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: currentImage.url,
          settings: {
            brightness: Number(newSettings.brightness) || 0,
            contrast: Number(newSettings.contrast) || 0,
            saturation: Number(newSettings.saturation) || 0,
            sharpness: Number(newSettings.sharpness) || 0,
            vibrance: Number(newSettings.vibrance) || 0,
            preset: newSettings.preset || null
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to enhance image');
      }

      const data = await response.json();
      setPreviewUrl(data.url);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error enhancing image:', error);
      toast.error('Failed to enhance image');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle preset selection
  const handlePresetSelect = async (preset: string) => {
    const newSettings = { ...settings, preset };
    await applyEnhancements(newSettings);
  };

  // Handle manual adjustments
  const handleSettingsChange = async (newSettings: EnhanceSettings) => {
    // Convert all values to positive numbers for the API
    const sanitizedSettings = {
      ...newSettings,
      brightness: Math.abs(Number(newSettings.brightness ?? 0)) * (newSettings.brightness ?? 0 < 0 ? -1 : 1),
      contrast: Math.abs(Number(newSettings.contrast ?? 0)) * (newSettings.contrast ?? 0 < 0 ? -1 : 1),
      saturation: Math.abs(Number(newSettings.saturation ?? 0)) * (newSettings.saturation ?? 0 < 0 ? -1 : 1),
      sharpness: Math.abs(Number(newSettings.sharpness)) || 0,
      vibrance: Math.abs(Number(newSettings.vibrance)) || 0
    };
    
    await applyEnhancements(sanitizedSettings);
  };

  // Handle auto enhancement
  const handleAutoEnhance = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch('/api/enhance-image/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: image.publicId }),
      });

      if (!response.ok) throw new Error('Failed to auto-enhance image');

      const data = await response.json();
      setPreviewUrl(data.url);
      setSettings({ preset: 'auto' });
      toast.success('Auto enhancement applied');
    } catch (error) {
      console.error('Error auto-enhancing:', error);
      toast.error('Failed to auto-enhance image');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle save
  const handleSave = () => {
    if (onComplete) {
      onComplete(previewUrl);
    }
  };

  // Handle download
  const handleDownload = async () => {
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `enhanced_${image.publicId.split('/').pop()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Error downloading:', error);
      toast.error('Failed to download image');
    }
  };

  // Handle applying a suggested preset
  const handleApplySuggestion = async (preset: string) => {
    const newSettings = { ...settings, preset };
    await applyEnhancements(newSettings);
  };

  // Calculate dimensions while maintaining aspect ratio
  const maxWidth = 800;
  const maxHeight = 600;
  const aspectRatio = currentImage.width / currentImage.height;
  
  let displayWidth = currentImage.width;
  let displayHeight = currentImage.height;
  
  if (displayWidth > maxWidth) {
    displayWidth = maxWidth;
    displayHeight = maxWidth / aspectRatio;
  }
  
  if (displayHeight > maxHeight) {
    displayHeight = maxHeight;
    displayWidth = maxHeight * aspectRatio;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4">
        <div className="flex h-full">
          {/* Left Panel: Image Preview */}
          <div className="flex-1 p-6 border-r relative">
            {!currentImage ? (
              <div className="flex items-center justify-center h-full">
                <label className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  Upload Image
                </label>
              </div>
            ) : comparisonMode ? (
              <ComparisonSlider
                beforeImage={currentImage.url}
                afterImage={previewUrl}
                width={Math.round(displayWidth)}
                height={Math.round(displayHeight)}
              />
            ) : (
              <div className="relative aspect-video">
                <Image
                  src={showOriginal ? currentImage.url : previewUrl}
                  alt="Image preview"
                  width={Math.round(displayWidth)}
                  height={Math.round(displayHeight)}
                  className="object-contain"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
            )}
            
            {currentImage && (
              <div className="absolute top-4 right-4 space-x-2">
                {!comparisonMode && (
                  <button
                    onMouseDown={() => setShowOriginal(true)}
                    onMouseUp={() => setShowOriginal(false)}
                    onMouseLeave={() => setShowOriginal(false)}
                    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                  >
                    Show Original
                  </button>
                )}
                <button
                  onClick={() => setComparisonMode(!comparisonMode)}
                  className={`px-4 py-2 rounded flex items-center gap-2 ${
                    comparisonMode
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  {comparisonMode ? 'Exit Comparison' : 'Compare'}
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Controls */}
          <div className="w-96 overflow-y-auto">
            <div className="p-6 space-y-6">
              {currentImage ? (
                <>
                  {/* AI Suggestions */}
                  <EnhancementSuggestions
                    suggestions={suggestions}
                    previewUrls={previewUrls}
                    isLoading={isLoadingSuggestions}
                    onApply={handleApplySuggestion}
                  />

                  {/* Manual Controls */}
                  <EnhanceControls
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                    onPresetSelect={handlePresetSelect}
                    onAutoEnhance={handleAutoEnhance}
                    isProcessing={isProcessing}
                  />

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleSave}
                      disabled={isProcessing}
                      className="w-full py-3 px-4 bg-green-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-600 disabled:bg-gray-400"
                    >
                      <Check className="w-5 h-5" />
                      Save Changes
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={isProcessing}
                      className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-700 disabled:bg-gray-400"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500">
                  Upload an image to start enhancing
                </div>
              )}
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 