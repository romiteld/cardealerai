import React, { useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { RefreshCw, Check, X, Zap } from 'react-feather';
import EnhanceControls from './EnhanceControls';
import styles from './BatchEnhancer.module.css';

interface BatchEnhancerProps {
  images: Array<{
    publicId: string;
    url: string;
    width: number;
    height: number;
  }>;
  onComplete: (enhancedImages: Array<{ publicId: string; url: string }>) => void;
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

export default function BatchEnhancer({
  images,
  onComplete,
  onClose,
}: BatchEnhancerProps) {
  const [settings, setSettings] = useState<EnhanceSettings>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [enhancedImages, setEnhancedImages] = useState<Array<{ publicId: string; url: string }>>([]);

  // Apply enhancements to all images
  const applyBatchEnhancements = async () => {
    try {
      setIsProcessing(true);
      const enhanced = [];
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        setProgress(Math.round((i / images.length) * 100));
        
        const response = await fetch('/api/enhance-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: image.url,
            settings,
          }),
        });

        if (!response.ok) throw new Error(`Failed to enhance image ${image.publicId}`);

        const data = await response.json();
        enhanced.push({ publicId: image.publicId, url: data.url });
      }

      setEnhancedImages(enhanced);
      setProgress(100);
      toast.success('All images enhanced successfully');
      onComplete(enhanced);
    } catch (error) {
      console.error('Error in batch enhancement:', error);
      toast.error('Failed to enhance some images');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle settings change
  const handleSettingsChange = (newSettings: EnhanceSettings) => {
    setSettings(newSettings);
  };

  // Handle preset selection
  const handlePresetSelect = (preset: string) => {
    setSettings({ ...settings, preset });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Batch Enhancement</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close batch enhancer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Image Grid */}
            <div className="flex-1 p-6 border-r overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={image.publicId} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={enhancedImages[index]?.url || image.url}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {isProcessing && index === Math.floor((progress / 100) * images.length) && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="w-96 overflow-y-auto">
              <div className="p-6">
                <EnhanceControls
                  settings={settings}
                  onSettingsChange={handleSettingsChange}
                  onPresetSelect={handlePresetSelect}
                  onAutoEnhance={() => {}}
                  isProcessing={isProcessing}
                />

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="mt-6">
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        data-progress={progress}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      Processing {Math.floor((progress / 100) * images.length)} of {images.length} images
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={applyBatchEnhancements}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    <Zap className="w-5 h-5" />
                    {isProcessing ? 'Processing...' : 'Enhance All Images'}
                  </button>
                  {enhancedImages.length > 0 && (
                    <button
                      onClick={() => onComplete(enhancedImages)}
                      className="w-full py-3 px-4 bg-green-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-600"
                    >
                      <Check className="w-5 h-5" />
                      Save All Changes
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 