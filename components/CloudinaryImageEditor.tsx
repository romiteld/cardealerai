'use client'

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { CldImage } from 'next-cloudinary';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ImageEditorProps {
  className?: string;
  onSave?: (imageData: { url: string; public_id: string }) => void;
}

interface EditSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sharpen: number;
  effect: string;
}

export function CloudinaryImageEditor({ className, onSave }: ImageEditorProps) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<EditSettings>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    sharpen: 0,
    effect: 'none'
  });
  const [savedVersion, setSavedVersion] = useState<string | null>(null);
  const [backgroundPrompt, setBackgroundPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [alternativeUrls, setAlternativeUrls] = useState<{[key: string]: string} | null>(null);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [generatingBackground, setGeneratingBackground] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [imageError, setImageError] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await fetch('/api/enhance-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.error) {
        console.error('Error uploading image:', data.error);
        return;
      }
      
      const publicId = data.public_id || data.url.split('/upload/')[1].split('.')[0];
      setImage(publicId);
      setLoading(false);
      // Reset generated image if we upload a new one
      setGeneratedImage(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  });

  // Convert the settings to Cloudinary transformation parameters
  const getTransformations = () => {
    // Build transformation string array for CldImage
    const transforms = [];
    
    if (settings.brightness !== 0) {
      transforms.push(`b_${settings.brightness}`);
    }
    if (settings.contrast !== 0) {
      transforms.push(`co_${settings.contrast}`);
    }
    if (settings.saturation !== 0) {
      transforms.push(`sa_${settings.saturation}`);
    }
    if (settings.blur > 0) {
      transforms.push(`e_blur:${settings.blur}`);
    }
    if (settings.sharpen > 0) {
      transforms.push(`e_sharpen:${settings.sharpen}`);
    }
    if (settings.effect && settings.effect !== 'none') {
      switch (settings.effect) {
        case 'art_audrey':
          transforms.push('e_grayscale');
          transforms.push('b_30');
          transforms.push('co_50');
          break;
        case 'art_zorro':
          transforms.push('e_grayscale');
          transforms.push('co_50');
          break;
        case 'cartoonify':
          transforms.push('e_cartoonify');
          break;
        case 'vignette':
          transforms.push('e_vignette:30');
          break;
        case 'oil_paint':
          transforms.push('e_art:oil_paint');
          break;
      }
    }

    return transforms.length > 0 ? transforms.join('/') : '';
  };

  const resetImage = () => {
    // Reset all settings to default
    setSettings({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      sharpen: 0,
      effect: 'none',
    });
    // Also reset generated image
    setGeneratedImage(null);
    setGeneratedImageUrl(null);
    setBackgroundPrompt('');
  };

  const saveToGallery = async () => {
    if (!image && !generatedImage) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/save-to-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: generatedImage || image,
          url: generatedImageUrl || undefined,
          settings,
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error('Error saving to gallery:', data.error);
        return;
      }

      setSavedVersion(data.public_id);
      if (onSave) {
        onSave({
          url: data.url,
          public_id: data.public_id,
        });
      }
    } catch (error) {
      console.error('Error saving to gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateBackground = async () => {
    if (!image) {
      console.error('No image selected');
      return;
    }

    try {
      setGeneratingBackground(true);
      setImageError(false);
      
      const mode = backgroundPrompt.trim() === '' ? 'remove' : 'replace';
      const promptToUse = backgroundPrompt.trim() === '' ? 'transparent background' : backgroundPrompt;
      
      const response = await fetch('/api/generate-background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicId: image,
          prompt: promptToUse,
          mode
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate background');
      }

      const data = await response.json();
      
      if (!data.success || !data.enhanced_url) {
        throw new Error('Background generation failed');
      }

      // Set the main enhanced image
      setGeneratedImage(data.enhanced_url);
      setGeneratedImageUrl(data.enhanced_url);
      
      // Store all alternatives for comparison
      if (data.alternative_urls) {
        setAlternativeUrls(data.alternative_urls);
        
        // Reset the current URL index
        setCurrentUrlIndex(0);
      }
      
      // Force update to refresh the image
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error('Error generating background:', error);
      setImageError(true);
    } finally {
      setGeneratingBackground(false);
    }
  };

  // Function to try alternative URLs when the main one fails
  const tryNextUrl = useCallback(() => {
    if (!alternativeUrls) return;
    
    const urlKeys = ['backgroundRemoval', 'gradient'];
    const nextIndex = currentUrlIndex + 1;
    
    if (nextIndex < urlKeys.length) {
      const urlKey = urlKeys[nextIndex];
      const nextUrl = alternativeUrls[urlKey];
      
      if (nextUrl) {
        console.log(`Trying alternative URL (${urlKey}):`, nextUrl);
        setGeneratedImageUrl(nextUrl);
        setCurrentUrlIndex(nextIndex);
        setForceUpdate(Date.now());
        setImageError(false);
      } else {
        setImageError(true);
      }
    } else {
      setImageError(true);
    }
  }, [alternativeUrls, currentUrlIndex]);

  return (
    <div className={className}>
      <Card className="w-full">
        {!image ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isDragActive ? 'Drop the image here' : 'Drag & drop an image here, or click to select'}
              </p>
              <p className="text-xs text-gray-500">Supports JPG, PNG and WebP</p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <div className="space-y-4">
                  {/* Basic Editing Controls */}
                  <h3 className="text-lg font-medium">Basic Adjustments</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Brightness</label>
                    <Slider
                      value={[settings.brightness]}
                      onValueChange={([value]) => setSettings({ ...settings, brightness: value })}
                      min={-100}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contrast</label>
                    <Slider
                      value={[settings.contrast]}
                      onValueChange={([value]) => setSettings({ ...settings, contrast: value })}
                      min={-100}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Saturation</label>
                    <Slider
                      value={[settings.saturation]}
                      onValueChange={([value]) => setSettings({ ...settings, saturation: value })}
                      min={-100}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Blur</label>
                    <Slider
                      value={[settings.blur]}
                      onValueChange={([value]) => setSettings({ ...settings, blur: value })}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sharpen</label>
                    <Slider
                      value={[settings.sharpen]}
                      onValueChange={([value]) => setSettings({ ...settings, sharpen: value })}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Effect</label>
                    <Select
                      value={settings.effect}
                      onValueChange={(value) => setSettings({ ...settings, effect: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an effect" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="art_audrey">Black & White</SelectItem>
                        <SelectItem value="art_zorro">High Contrast B&W</SelectItem>
                        <SelectItem value="cartoonify">Cartoon</SelectItem>
                        <SelectItem value="vignette">Vignette</SelectItem>
                        <SelectItem value="oil_paint">Oil Paint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Generative AI Background Section */}
                  <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium mb-4">AI Background Generation</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Background Description
                        </label>
                        <Textarea 
                          placeholder="Describe the background you want (e.g., 'luxury car showroom with soft lighting')"
                          value={backgroundPrompt}
                          onChange={(e) => setBackgroundPrompt(e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                      <Button 
                        onClick={generateBackground} 
                        disabled={!image || !backgroundPrompt || generatingBackground}
                        className="w-full"
                      >
                        {generatingBackground ? 'Generating...' : 'Generate Background'}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        The AI will analyze your image, remove the background, and place it on a new generated background based on your description.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={resetImage} variant="outline">Reset</Button>
                    <Button onClick={saveToGallery} disabled={loading} className="flex-1">
                      {loading ? 'Saving...' : 'Save to Gallery'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">
                  {generatedImage ? 'New Background Generated' : 'Preview'}
                </h3>
                
                {/* Original Image */}
                {!generatedImage && image && (
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    <CldImage
                      width={800}
                      height={450}
                      src={image}
                      alt="Preview"
                      sizes="(min-width: 1024px) 40vw, 90vw"
                      className="object-contain"
                      transformations={getTransformations()}
                    />
                  </div>
                )}

                {/* Generated Image with New Background */}
                {generatedImage && (
                  <div className="rounded-lg overflow-hidden">
                    {generatingBackground ? (
                      <div className="bg-gray-100 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-gray-600">Generating background...</p>
                        </div>
                      </div>
                    ) : imageError ? (
                      <div className="bg-red-50 h-64 flex items-center justify-center">
                        <div className="text-center p-6">
                          <p className="text-red-500 font-medium mb-2">Failed to generate background</p>
                          {alternativeUrls && currentUrlIndex < Object.keys(alternativeUrls).length - 1 ? (
                            <>
                              <p className="text-gray-600 text-sm mb-2">Trying alternative approach...</p>
                              <button 
                                onClick={tryNextUrl}
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              >
                                Try Alternative Style
                              </button>
                            </>
                          ) : (
                            <>
                              <p className="text-gray-600 text-sm">Please try again with a different description</p>
                              <button 
                                onClick={() => generateBackground()}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              >
                                Retry
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ) : generatedImageUrl ? (
                      <div className="relative">
                        {/* Direct img tag with error handling for fallbacks */}
                        <img
                          key={`gen-bg-${forceUpdate}`}
                          src={generatedImageUrl}
                          alt="AI-generated background"
                          className="w-full h-auto object-contain"
                          style={{ maxHeight: '400px' }}
                          onError={(e) => {
                            console.error('Image failed to load:', e);
                            console.log('Failed URL:', (e.target as HTMLImageElement).src);
                            
                            // Try to use an alternative URL if available
                            if (alternativeUrls && currentUrlIndex < Object.keys(alternativeUrls).length - 1) {
                              tryNextUrl();
                            } else {
                              setImageError(true);
                            }
                          }}
                        />
                        <p className="text-sm text-center mt-2 text-gray-500">
                          Background generated with AI based on your prompt
                        </p>
                      </div>
                    ) : (
                      <CldImage
                        width={800}
                        height={450}
                        src={generatedImage}
                        alt="AI-generated background"
                        sizes="(min-width: 1024px) 40vw, 90vw"
                        className="object-contain"
                      />
                    )}
                  </div>
                )}

                {/* Show original image for comparison when we have a generated version */}
                {generatedImage && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-md font-medium mb-2">Original Image</h4>
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                      <CldImage
                        width={800}
                        height={450}
                        src={image!}
                        alt="Original"
                        sizes="(min-width: 1024px) 40vw, 90vw"
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
} 