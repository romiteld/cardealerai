'use client'

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { CldImage } from 'next-cloudinary';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

    return transforms.join('/');
  };

  const resetImage = () => {
    setSettings({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      sharpen: 0,
      effect: 'none'
    });
  };

  const saveToGallery = async () => {
    if (!image) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/save-to-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: image,
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
                        <SelectValue placeholder="Select effect" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="art_audrey">Vintage</SelectItem>
                        <SelectItem value="art_zorro">High Contrast B&W</SelectItem>
                        <SelectItem value="cartoonify">Cartoon</SelectItem>
                        <SelectItem value="vignette">Vignette</SelectItem>
                        <SelectItem value="oil_paint">Oil Paint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={resetImage}>
                      Reset
                    </Button>
                    <Button 
                      onClick={saveToGallery} 
                      disabled={loading || !image || image === savedVersion}
                      variant="secondary"
                    >
                      {savedVersion === image ? 'Saved' : 'Save to Gallery'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                {image && (
                  <CldImage
                    src={image}
                    alt="Edited car"
                    width={800}
                    height={450}
                    className="object-contain"
                    transformations={getTransformations()}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
} 