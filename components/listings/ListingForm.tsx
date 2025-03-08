'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BatchUploader from '../BatchUploader';
import BackgroundProcessor from '../BackgroundProcessor';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from 'react-hot-toast';

interface ListingFormProps {
  initialData?: any;
  mode: 'create' | 'edit';
}

export default function ListingForm({ initialData, mode }: ListingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [listingId, setListingId] = useState<string | null>(initialData?.id || null);
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; publicId: string }>>(
    initialData?.images || []
  );
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    make: initialData?.make || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    mileage: initialData?.mileage || 0,
    price: initialData?.price || 0,
    condition: initialData?.condition || 'Used',
    vin: initialData?.vin || '',
    exteriorColor: initialData?.exteriorColor || '',
    interiorColor: initialData?.interiorColor || '',
    fuelType: initialData?.fuelType || '',
    transmission: initialData?.transmission || '',
    drivetrain: initialData?.drivetrain || '',
    features: initialData?.features || [],
    status: initialData?.status || 'draft',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formHasChanges, setFormHasChanges] = useState(false);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.make) newErrors.make = 'Make is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Please enter a valid year';
    }
    if (formData.mileage < 0) newErrors.mileage = 'Mileage cannot be negative';
    if (formData.price < 0) newErrors.price = 'Price cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleUploadComplete = (results: any[]) => {
    console.log('Upload complete:', results);
    
    try {
      localStorage.removeItem(`listing_images_${listingId || 'new'}`);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
    
    setUploadedImages(results);
    
    setFormData(prev => ({
      ...prev,
      images: results
    }));
    
    if (results.length > 0) {
      setFormHasChanges(true);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f: string) => f !== feature)
        : [...prev.features, feature]
    }));
  };
  
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value === '' ? '' : Number(value)
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleImageDataChange = (newImageData: Array<{ url: string; publicId: string }>) => {
    console.log('Image data changed:', newImageData);
    
    setFormHasChanges(true);
    
    setUploadedImages(newImageData);
    
    setFormData(prev => ({
      ...prev,
      images: newImageData
    }));
    
    try {
      localStorage.setItem(`listing_images_${listingId || 'new'}`, JSON.stringify(newImageData));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
    
    if (mode === 'edit' && listingId) {
      saveImageChanges(listingId, newImageData);
    }
  };
  
  useEffect(() => {
    try {
      const savedImages = localStorage.getItem(`listing_images_${listingId || 'new'}`);
      if (savedImages) {
        const parsedImages = JSON.parse(savedImages);
        if (parsedImages.length > 0 && 
            (uploadedImages.length === 0 || 
             JSON.stringify(parsedImages) !== JSON.stringify(uploadedImages))) {
          console.log('Restoring saved images from localStorage:', parsedImages);
          setUploadedImages(parsedImages);
          setFormData(prev => ({
            ...prev,
            images: parsedImages
          }));
        }
      }
    } catch (error) {
      console.error('Error restoring images from localStorage:', error);
    }
  }, [listingId]);
  
  const saveImageChanges = async (id: string, imageData: Array<{ url: string; publicId: string }>) => {
    try {
      const response = await fetch(`/api/listings/${id}/images`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: imageData
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to update images on server');
      } else {
        console.log('Images updated successfully on server');
      }
    } catch (error) {
      console.error('Error saving image changes:', error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      if (mode === 'create') {
        // Create new listing
        const response = await fetch('/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            images: uploadedImages.map(img => ({
              url: img.url,
              publicId: img.publicId
            }))
          })
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create listing');
        }
        
        const data = await response.json();
        setListingId(data.id);
        setSuccess('Listing created successfully!');
        setStep(3);
      } else {
        // Update existing listing
        const response = await fetch(`/api/listings/${listingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            images: uploadedImages.map(img => ({
              url: img.url,
              publicId: img.publicId
            }))
          })
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update listing');
        }
        
        setSuccess('Listing updated successfully!');
        
        // If we're editing and already have images, move to step 3
        if (uploadedImages.length > 0) {
          setStep(3);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the listing');
    } finally {
      setSaving(false);
    }
  };
  
  const handlePublish = async () => {
    if (!listingId) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to publish listing');
      }
      
      setSuccess('Listing published successfully!');
      router.push(`/dashboard/listings/${listingId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to publish listing');
    } finally {
      setSaving(false);
    }
  };
  
  // Generate AI content for the listing
  const generateContent = async () => {
    if (!listingId) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/listings/${listingId}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          generateDescription: true,
          generateFeatures: true,
          tone: 'professional'
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate content');
      }
      
      const data = await response.json();
      
      // Update the form with the generated content
      setFormData(prev => ({
        ...prev,
        description: data.content.description || prev.description,
        features: data.content.highlightedFeatures || prev.features
      }));
      
      setSuccess('Content generated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setSaving(false);
    }
  };
  
  const saveCurrentState = () => {
    if (formHasChanges) {
      console.log('Saving current form state');
      try {
        localStorage.setItem(`listing_form_${listingId || 'new'}`, JSON.stringify(formData));
        localStorage.setItem(`listing_images_${listingId || 'new'}`, JSON.stringify(uploadedImages));
      } catch (error) {
        console.error('Failed to save form to localStorage:', error);
      }
      
      setFormHasChanges(false);
    }
  };
  
  const changeStep = (newStep: number) => {
    saveCurrentState();
    
    if (newStep > step) {
      if (step === 1 && newStep === 2) {
        if (uploadedImages.length === 0) {
          toast.error('Please upload at least one image before proceeding');
          return;
        }
      }
      
      if (step === 2 && newStep === 3) {
        if (!listingId) {
          toast.error('Please complete the details form before proceeding to enhancement');
          return;
        }
      }
    }
    
    setStep(newStep);
  };
  
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{mode === 'create' ? 'Add New Vehicle' : `Edit Vehicle: ${formData.title}`}</h1>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>
      
      {/* Enhanced stepper with clickable steps */}
      <div className="mb-8">
        <div className="relative flex justify-between items-center mb-4">
          {/* Step line */}
          <div className="absolute left-0 right-0 h-1 bg-gray-200 top-1/2 transform -translate-y-1/2"></div>
          
          {/* Step 1: Upload */}
          <button 
            onClick={() => changeStep(1)}
            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
              step === 1 ? 'bg-blue-500 text-white' : (
                step > 1 ? 'bg-blue-300 text-white' : 'bg-gray-200 text-gray-500'
              )
            }`}
            type="button"
          >
            1
          </button>
          
          {/* Step 2: Details */}
          <button 
            onClick={() => {
              // Only allow proceeding to step 2 if there are images
              if (uploadedImages.length > 0) {
                changeStep(2);
              } else {
                toast.error('Please upload at least one image before proceeding');
              }
            }}
            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
              step === 2 ? 'bg-blue-500 text-white' : (
                step > 2 ? 'bg-blue-300 text-white' : 'bg-gray-200 text-gray-500'
              )
            }`}
            type="button"
          >
            2
          </button>
          
          {/* Step 3: Enhance */}
          <button 
            onClick={() => {
              // Only allow proceeding to step 3 if we have a listing ID
              if (listingId) {
                changeStep(3);
              } else {
                toast.error('Please complete step 2 before proceeding to enhancement');
              }
            }}
            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
              step === 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}
            type="button"
          >
            3
          </button>
        </div>
        
        {/* Step labels */}
        <div className="flex justify-between text-sm">
          <span className={step === 1 ? 'font-bold text-blue-500' : ''}>Upload</span>
          <span className={step === 2 ? 'font-bold text-blue-500' : ''}>Details</span>
          <span className={step === 3 ? 'font-bold text-blue-500' : ''}>Enhance</span>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      {/* Step 1: Upload Images */}
      {step === 1 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Vehicle Images</h2>
          <p className="text-gray-600 mb-4">
            Upload multiple vehicle images at once. These will be processed in batch for efficiency.
          </p>
          <BatchUploader 
            initialImages={initialData?.images || []}
            onUploadComplete={handleUploadComplete} 
          />
        </Card>
      )}
      
      {/* Step 2: Vehicle Details */}
      {step === 2 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Vehicle Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Basic Information</h3>
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Listing Title*
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={errors.title ? 'border-red-500' : ''}
                    aria-invalid={!!errors.title}
                    aria-describedby={errors.title ? "title-error" : undefined}
                  />
                  {errors.title && (
                    <p id="title-error" className="mt-1 text-sm text-red-500">
                      {errors.title}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="make" className="block text-sm font-medium mb-1">
                      Make*
                    </label>
                    <Input
                      id="make"
                      name="make"
                      value={formData.make}
                      onChange={handleInputChange}
                      className={errors.make ? 'border-red-500' : ''}
                      aria-invalid={!!errors.make}
                      aria-describedby={errors.make ? "make-error" : undefined}
                    />
                    {errors.make && (
                      <p id="make-error" className="mt-1 text-sm text-red-500">
                        {errors.make}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="model" className="block text-sm font-medium mb-1">
                      Model*
                    </label>
                    <Input
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      className={errors.model ? 'border-red-500' : ''}
                      aria-invalid={!!errors.model}
                      aria-describedby={errors.model ? "model-error" : undefined}
                    />
                    {errors.model && (
                      <p id="model-error" className="mt-1 text-sm text-red-500">
                        {errors.model}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium mb-1">
                      Year*
                    </label>
                    <Input
                      type="number"
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleNumberInput}
                      className={errors.year ? 'border-red-500' : ''}
                      aria-invalid={!!errors.year}
                      aria-describedby={errors.year ? "year-error" : undefined}
                    />
                    {errors.year && (
                      <p id="year-error" className="mt-1 text-sm text-red-500">
                        {errors.year}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="mileage" className="block text-sm font-medium mb-1">
                      Mileage*
                    </label>
                    <Input
                      type="number"
                      id="mileage"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleNumberInput}
                      className={errors.mileage ? 'border-red-500' : ''}
                      aria-invalid={!!errors.mileage}
                      aria-describedby={errors.mileage ? "mileage-error" : undefined}
                    />
                    {errors.mileage && (
                      <p id="mileage-error" className="mt-1 text-sm text-red-500">
                        {errors.mileage}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium mb-1">
                      Price*
                    </label>
                    <Input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleNumberInput}
                      className={errors.price ? 'border-red-500' : ''}
                      aria-invalid={!!errors.price}
                      aria-describedby={errors.price ? "price-error" : undefined}
                    />
                    {errors.price && (
                      <p id="price-error" className="mt-1 text-sm text-red-500">
                        {errors.price}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="vin" className="block text-sm font-medium mb-1">
                    VIN
                  </label>
                  <Input
                    id="vin"
                    name="vin"
                    value={formData.vin}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium mb-1">
                    Condition
                  </label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, condition: value }));
                    }}
                  >
                    <SelectTrigger id="condition">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Used">Used</SelectItem>
                      <SelectItem value="Certified Pre-Owned">Certified Pre-Owned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Additional Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="exteriorColor" className="block text-sm font-medium mb-1">
                      Exterior Color
                    </label>
                    <Input
                      id="exteriorColor"
                      name="exteriorColor"
                      value={formData.exteriorColor}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="interiorColor" className="block text-sm font-medium mb-1">
                      Interior Color
                    </label>
                    <Input
                      id="interiorColor"
                      name="interiorColor"
                      value={formData.interiorColor}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fuelType" className="block text-sm font-medium mb-1">
                      Fuel Type
                    </label>
                    <Select
                      value={formData.fuelType}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, fuelType: value }));
                      }}
                    >
                      <SelectTrigger id="fuelType">
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gasoline">Gasoline</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="Plug-in Hybrid">Plug-in Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label htmlFor="transmission" className="block text-sm font-medium mb-1">
                      Transmission
                    </label>
                    <Select
                      value={formData.transmission}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, transmission: value }));
                      }}
                    >
                      <SelectTrigger id="transmission">
                        <SelectValue placeholder="Select transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Automatic">Automatic</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="CVT">CVT</SelectItem>
                        <SelectItem value="Dual-Clutch">Dual-Clutch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="drivetrain" className="block text-sm font-medium mb-1">
                    Drivetrain
                  </label>
                  <Select
                    value={formData.drivetrain}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, drivetrain: value }));
                    }}
                  >
                    <SelectTrigger id="drivetrain">
                      <SelectValue placeholder="Select drivetrain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FWD">Front-Wheel Drive (FWD)</SelectItem>
                      <SelectItem value="RWD">Rear-Wheel Drive (RWD)</SelectItem>
                      <SelectItem value="AWD">All-Wheel Drive (AWD)</SelectItem>
                      <SelectItem value="4WD">Four-Wheel Drive (4WD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
                
                {/* AI Content Generation Button */}
                {listingId && (
                  <div className="mt-2">
                    <Button 
                      type="button"
                      onClick={generateContent}
                      variant="outline"
                      className="w-full"
                      disabled={saving}
                    >
                      {saving ? 'Generating...' : 'Generate AI Description & Features'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Features */}
            <div className="pt-4 border-t">
              <h3 className="font-medium text-lg mb-2">Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  'Navigation System', 'Bluetooth', 'Backup Camera', 'Leather Seats',
                  'Sunroof/Moonroof', 'Heated Seats', 'Third-Row Seating', 'Remote Start',
                  'Apple CarPlay', 'Android Auto', 'Blind Spot Monitor', 'Keyless Entry',
                  'Lane Departure Warning', 'Adaptive Cruise Control', 'Power Liftgate', 'WiFi Hotspot'
                ].map(feature => (
                  <label key={feature} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="rounded"
                    />
                    <span>{feature}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t flex justify-end space-x-4">
              <Button
                type="button"
                onClick={() => changeStep(1)}
                variant="outline"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Continue to Image Enhancement'}
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      {/* Step 3: Image Enhancement */}
      {step === 3 && listingId && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Enhance Vehicle Images</h2>
          <p className="text-gray-600 mb-4">
            Process your images with AI to create professional backgrounds.
            Select the best option for each image.
          </p>
          
          <BackgroundProcessor
            listingId={listingId}
            imageData={uploadedImages}
            onImageDataChange={handleImageDataChange}
          />
          
          <div className="mt-6 pt-4 border-t flex justify-between">
            <Button
              onClick={() => changeStep(2)}
              variant="outline"
            >
              Back to Details
            </Button>
            
            <Button
              onClick={handlePublish}
              disabled={saving}
              className="bg-green-500 hover:bg-green-600"
            >
              {saving ? 'Publishing...' : 'Publish Listing'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
} 