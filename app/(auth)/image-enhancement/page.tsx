'use client'

import { CloudinaryImageEditor } from '../../../components/CloudinaryImageEditor';
import { toast } from 'sonner';

export default function ImageEnhancement() {
  const handleSave = (imageData: { url: string; public_id: string }) => {
    toast.success('Image saved to gallery', {
      description: 'Your edited image has been saved to your gallery.',
      duration: 3000,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Image Enhancement</h1>
        <p className="text-gray-500">
          Upload a car image and enhance it with our professional editing tools.
          Save your edited images to your gallery.
        </p>
      </div>
      <div className="mt-8">
        <CloudinaryImageEditor 
          className="w-full" 
          onSave={handleSave}
        />
      </div>
    </div>
  );
} 