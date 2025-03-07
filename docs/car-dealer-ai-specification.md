# CarDealerAI - Complete Application Specification

## 1. Project Overview

CarDealerAI is a comprehensive web application designed for automotive dealerships to streamline vehicle listing creation, enhance photos with AI, generate compelling content, and manage social media marketing. The platform leverages advanced AI technologies for image processing and content generation, with robust batch operations for efficiency.

### 1.1 Core Functionality

- **Vehicle Listing Management**: Create, edit, delete, and publish vehicle listings with detailed information
- **AI-Powered Image Enhancement**: Process vehicle images with background removal/replacement and other AI enhancements
- **Batch Image Processing**: Upload and process multiple images simultaneously for efficiency
- **Social Media Integration**: Post listings to various platforms (X, Facebook, Instagram)
- **Content Generation**: AI-powered description and feature generation
- **Payment Processing**: Tiered subscription model (Pro, Growth, Enterprise) with Stripe integration
- **Competitive Price Research**: Market price analysis using Fire Crawl API

### 1.2 Technology Stack

- **Frontend**: Next.js with Tailwind CSS
- **Backend**: Next.js API routes, Vercel serverless functions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with RBAC
- **Image Processing**: Cloudinary AI
- **Content Generation**: OpenAI GPT-4 Vision Turbo
- **Payment Processing**: Stripe
- **Web Scraping**: Fire Crawl API
- **Deployment**: Vercel

### 1.3 Subscription Tiers

#### Pro (Single Dealership)
- Up to 100 vehicle listings
- Basic AI image enhancement
- Single social media platform
- 5 users maximum
- Email support

#### Growth (Single Dealership)
- Up to 500 vehicle listings
- Advanced AI image enhancements
- All social media platforms
- 20 users maximum
- Email and chat support
- Analytics dashboard

#### Enterprise (Multiple Dealerships)
- Unlimited vehicle listings
- All AI features
- All social media platforms
- Unlimited users
- Premium support with dedicated account manager
- Advanced analytics and reporting
- White-label solution
- Custom integrations

## 2. Complete Project Structure

```
CarDealerAI/
├── app/                      # Next.js app directory for routes
│   ├── (auth)/               # Authentication routes (grouped)
│   │   ├── login/            # Login page
│   │   │   └── page.tsx
│   │   ├── register/         # Registration page
│   │   │   └── page.tsx
│   │   ├── forgot-password/  # Password reset
│   │   │   └── page.tsx
│   │   └── layout.tsx        # Auth layout with branding
│   │
│   ├── (dashboard)/          # Dashboard routes (grouped)
│   │   ├── dashboard/        # Main dashboard
│   │   │   └── page.tsx
│   │   ├── listings/         # Listings management
│   │   │   ├── page.tsx      # All listings
│   │   │   ├── new/          # Create new listing
│   │   │   │   └── page.tsx
│   │   │   └── [id]/         # Single listing route
│   │   │       ├── page.tsx  # View listing
│   │   │       └── edit/     # Edit listing
│   │   │           └── page.tsx
│   │   ├── gallery/          # Image gallery
│   │   │   └── page.tsx
│   │   ├── social/           # Social media management
│   │   │   └── page.tsx
│   │   ├── analytics/        # Analytics dashboard
│   │   │   └── page.tsx
│   │   ├── settings/         # User/account settings
│   │   │   └── page.tsx
│   │   ├── billing/          # Subscription management
│   │   │   └── page.tsx
│   │   └── layout.tsx        # Dashboard layout with sidebar/nav
│   │
│   ├── (admin)/              # Admin routes (grouped)
│   │   ├── admin/            # Admin dashboard
│   │   │   └── page.tsx
│   │   ├── users/            # User management
│   │   │   └── page.tsx
│   │   ├── dealerships/      # Dealership management (Enterprise)
│   │   │   └── page.tsx
│   │   ├── subscriptions/    # Subscription management
│   │   │   └── page.tsx
│   │   ├── integrations/     # Third-party integrations
│   │   │   └── page.tsx
│   │   └── layout.tsx        # Admin layout
│   │
│   ├── api/                  # API routes
│   │   ├── auth/             # Auth endpoints
│   │   │   ├── register/     # User registration
│   │   │   │   └── route.ts
│   │   │   └── callback/     # OAuth callbacks
│   │   │       └── route.ts
│   │   │
│   │   ├── listings/         # Listing management
│   │   │   ├── route.ts      # GET: Fetch all, POST: Create
│   │   │   └── [id]/         # Single listing operations
│   │   │       ├── route.ts  # GET, PUT, DELETE operations
│   │   │       ├── images/   # Image operations
│   │   │       │   └── route.ts
│   │   │       ├── background-process/ # Background processing
│   │   │       │   └── route.ts
│   │   │       ├── content/  # Content generation
│   │   │       │   └── route.ts
│   │   │       └── publish/  # Social media publishing
│   │   │           └── route.ts
│   │   │
│   │   ├── gallery/          # Image gallery API
│   │   │   ├── route.ts      # GET: Fetch all, POST: Upload
│   │   │   └── [id]/         # Single image operations
│   │   │       └── route.ts  # GET, PUT, DELETE
│   │   │
│   │   ├── social/           # Social media API
│   │   │   ├── platforms/    # Connected platforms
│   │   │   │   └── route.ts
│   │   │   ├── schedule/     # Schedule posts
│   │   │   │   └── route.ts
│   │   │   └── analytics/    # Social engagement metrics
│   │   │       └── route.ts
│   │   │
│   │   ├── user/             # User API
│   │   │   ├── profile/      # User profile
│   │   │   │   └── route.ts
│   │   │   └── export-data/  # GDPR data export
│   │   │       └── route.ts
│   │   │
│   │   ├── admin/            # Admin API
│   │   │   ├── users/        # User management
│   │   │   │   └── route.ts
│   │   │   ├── dealerships/  # Dealership management
│   │   │   │   └── route.ts
│   │   │   └── analytics/    # Analytics data
│   │   │       └── route.ts
│   │   │
│   │   ├── stripe/           # Payment processing
│   │   │   ├── webhooks/     # Stripe webhooks
│   │   │   │   └── route.ts
│   │   │   ├── create-checkout/ # Create checkout session
│   │   │   │   └── route.ts
│   │   │   └── billing-portal/ # Customer portal
│   │   │       └── route.ts
│   │   │
│   │   ├── firecrawl/        # Market research
│   │   │   └── search/       # Price research
│   │   │       └── route.ts
│   │   │
│   │   └── cron/             # Scheduled tasks
│   │       ├── publish-posts/ # Publish scheduled posts
│   │       │   └── route.ts
│   │       └── cleanup/      # Database maintenance
│   │           └── route.ts
│   │
│   ├── public/               # Public route (for non-logged-in users)
│   │   ├── listings/[id]/    # Public listing view
│   │   │   └── page.tsx
│   │   └── layout.tsx        # Public layout
│   │
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── error.tsx             # Global error component
│   └── not-found.tsx         # 404 page
│
├── components/               # React components
│   ├── layouts/              # Layout components
│   │   ├── Sidebar.tsx       # Dashboard sidebar
│   │   ├── Header.tsx        # App header
│   │   ├── Footer.tsx        # App footer
│   │   └── AdminHeader.tsx   # Admin header
│   │
│   ├── listings/             # Listing components
│   │   ├── ListingForm.tsx   # Form for creating/editing
│   │   ├── ListingCard.tsx   # Card for list view
│   │   ├── ListingDetail.tsx # Detailed view
│   │   ├── ListingGallery.tsx # Image gallery
│   │   └── BatchUploader.tsx # Batch image uploader
│   │
│   ├── image-processing/     # Image processing components
│   │   ├── CloudinaryImageEditor.tsx # Main image editor
│   │   ├── BackgroundProcessor.tsx   # Background processing
│   │   ├── ImageOverlay.tsx   # Add text/logo overlays
│   │   └── AICropSuggestions.tsx     # AI crop suggestions
│   │
│   ├── social/               # Social media components
│   │   ├── SocialMediaManager.tsx    # Social account manager
│   │   ├── PostScheduler.tsx # Schedule posts
│   │   ├── PlatformConnect.tsx # Connect platforms
│   │   └── PostAnalytics.tsx # Post performance
│   │
│   ├── pricing/              # Pricing components
│   │   ├── PriceResearch.tsx # Market price research
│   │   ├── PricingTiers.tsx  # Subscription tiers
│   │   └── MarketValue.tsx   # Market value estimator
│   │
│   ├── admin/                # Admin components
│   │   ├── UserManagement.tsx # User management
│   │   ├── DealershipManagement.tsx # Dealership management
│   │   ├── SubscriptionManagement.tsx # Manage subscriptions
│   │   └── AnalyticsDashboard.tsx # Admin analytics
│   │
│   ├── analytics/            # Analytics components
│   │   ├── ListingStats.tsx  # Listing statistics
│   │   ├── ImageStats.tsx    # Image processing stats
│   │   ├── SocialStats.tsx   # Social media stats
│   │   └── UsageMetrics.tsx  # Platform usage metrics
│   │
│   ├── ui/                   # UI components
│   │   ├── Button.tsx        # Custom button
│   │   ├── Input.tsx         # Form input
│   │   ├── Modal.tsx         # Modal dialog
│   │   ├── Tabs.tsx          # Tab navigation
│   │   ├── Dropdown.tsx      # Dropdown menu
│   │   ├── Card.tsx          # Card container
│   │   ├── Alert.tsx         # Alert/notification
│   │   └── ProgressBar.tsx   # Progress indicator
│   │
│   └── common/               # Common components
│       ├── LoadingSpinner.tsx # Loading indicator
│       ├── ErrorBoundary.tsx # Error handler
│       ├── EmptyState.tsx    # Empty state placeholder
│       └── Pagination.tsx    # Pagination control
│
├── lib/                      # Utility libraries
│   ├── supabase.ts           # Supabase client
│   ├── cloudinary.ts         # Cloudinary utilities
│   ├── openai.ts             # OpenAI utilities
│   ├── stripe.ts             # Stripe utilities
│   ├── firecrawl.ts          # Fire Crawl utilities
│   ├── auth.ts               # Authentication utilities
│   ├── analytics.ts          # Analytics utilities
│   ├── formatters.ts         # Data formatters
│   └── validators.ts         # Input validation
│
├── hooks/                    # Custom React hooks
│   ├── useAuth.ts            # Authentication hook
│   ├── useListings.ts        # Listings data hook
│   ├── useGallery.ts         # Gallery data hook
│   ├── useSocialMedia.ts     # Social media hook
│   └── useSubscription.ts    # Subscription hook
│
├── types/                    # TypeScript type definitions
│   ├── listings.ts           # Listing types
│   ├── users.ts              # User types
│   ├── images.ts             # Image types
│   ├── social.ts             # Social media types
│   └── subscription.ts       # Subscription types
│
├── styles/                   # Global styles
│   └── globals.css           # Tailwind imports and global CSS
│
├── public/                   # Static assets
│   ├── images/               # Static images
│   │   ├── logo.svg          # App logo
│   │   └── hero.jpg          # Homepage hero
│   ├── icons/                # Icon assets
│   │   └── favicon.ico       # Favicon
│   └── fonts/                # Custom fonts
│
├── middleware.ts             # Next.js middleware for auth and routing
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## 3. Detailed Component Specifications

### 3.1 Listing Management

#### 3.1.1 ListingForm Component

```typescript
// components/listings/ListingForm.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BatchUploader from './BatchUploader';
import BackgroundProcessor from '../image-processing/BackgroundProcessor';
import PriceResearch from '../pricing/PriceResearch';

interface ListingFormProps {
  initialData?: any;
  mode: 'create' | 'edit';
}

export default function ListingForm({ initialData, mode }: ListingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [listingId, setListingId] = useState<string | null>(initialData?.id || null);
  const [uploadedImages, setUploadedImages] = useState<any[]>(initialData?.images || []);
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
    setUploadedImages(results);
    setStep(2);
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
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
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
            images: uploadedImages.map(img => img.publicId)
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
            images: uploadedImages.map(img => img.publicId)
          })
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update listing');
        }
        
        setSuccess('Listing updated successfully!');
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
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {mode === 'create' ? 'Create New Listing' : 'Edit Listing'}
        </h1>
        
        {/* Step progress bar */}
        <div className="mt-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <div className={`h-1 w-24 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <div className={`h-1 w-24 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              3
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <div className="w-10 text-center">Upload</div>
            <div className="w-10 text-center">Details</div>
            <div className="w-10 text-center">Enhance</div>
          </div>
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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upload Vehicle Images</h2>
          <p className="text-gray-600 mb-4">
            Upload multiple vehicle images at once. These will be processed in batch for efficiency.
          </p>
          <BatchUploader 
            initialImages={initialData?.images || []}
            onUploadComplete={handleUploadComplete} 
          />
        </div>
      )}
      
      {/* Step 2: Vehicle Details */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
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
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
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
                    <input
                      type="text"
                      id="make"
                      name="make"
                      value={formData.make}
                      onChange={handleInputChange}
                      className={`w-full rounded-md ${errors.make ? 'border-red-500' : 'border-gray-300'}`}
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
                    <input
                      type="text"
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      className={`w-full rounded-md ${errors.model ? 'border-red-500' : 'border-gray-300'}`}
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
                    <input
                      type="number"
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className={`w-full rounded-md ${errors.year ? 'border-red-500' : 'border-gray-300'}`}
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
                    <input
                      type="number"
                      id="mileage"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleInputChange}
                      className={`w-full rounded-md ${errors.mileage ? 'border-red-500' : 'border-gray-300'}`}
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
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`w-full rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
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
                  <input
                    type="text"
                    id="vin"
                    name="vin"
                    value={formData.vin}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300"
                  />
                </div>
                
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium mb-1">
                    Condition
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300"
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                  </select>
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
                    <input
                      type="text"
                      id="exteriorColor"
                      name="exteriorColor"
                      value={formData.exteriorColor}
                      onChange={handleInputChange}
                      className="w-full rounded-md border-gray-300"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="interiorColor" className="block text-sm font-medium mb-1">
                      Interior Color
                    </label>
                    <input
                      type="text"
                      id="interiorColor"
                      name="interiorColor"
                      value={formData.interiorColor}
                      onChange={handleInputChange}
                      className="w-full rounded-md border-gray-300"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fuelType" className="block text-sm font-medium mb-1">
                      Fuel Type
                    </label>
                    <select
                      id="fuelType"
                     name="fuelType"
                     value={formData.fuelType}
                     onChange={handleInputChange}
                     className="w-full rounded-md border-gray-300"
                   >
                     <option value="">Select Fuel Type</option>
                     <option value="Gasoline">Gasoline</option>
                     <option value="Diesel">Diesel</option>
                     <option value="Electric">Electric</option>
                     <option value="Hybrid">Hybrid</option>
                     <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                   </select>
                 </div>
                 
                 <div>
                   <label htmlFor="transmission" className="block text-sm font-medium mb-1">
                     Transmission
                   </label>
                   <select
                     id="transmission"
                     name="transmission"
                     value={formData.transmission}
                     onChange={handleInputChange}
                     className="w-full rounded-md border-gray-300"
                   >
                     <option value="">Select Transmission</option>
                     <option value="Automatic">Automatic</option>
                     <option value="Manual">Manual</option>
                     <option value="CVT">CVT</option>
                     <option value="Dual-Clutch">Dual-Clutch</option>
                   </select>
                 </div>
               </div>
               
               <div>
                 <label htmlFor="drivetrain" className="block text-sm font-medium mb-1">
                   Drivetrain
                 </label>
                 <select
                   id="drivetrain"
                   name="drivetrain"
                   value={formData.drivetrain}
                   onChange={handleInputChange}
                   className="w-full rounded-md border-gray-300"
                 >
                   <option value="">Select Drivetrain</option>
                   <option value="FWD">Front-Wheel Drive (FWD)</option>
                   <option value="RWD">Rear-Wheel Drive (RWD)</option>
                   <option value="AWD">All-Wheel Drive (AWD)</option>
                   <option value="4WD">Four-Wheel Drive (4WD)</option>
                 </select>
               </div>
               
               <div>
                 <label htmlFor="description" className="block text-sm font-medium mb-1">
                   Description
                 </label>
                 <textarea
                   id="description"
                   name="description"
                   value={formData.description}
                   onChange={handleInputChange}
                   rows={4}
                   className="w-full rounded-md border-gray-300"
                 />
               </div>
               
               {/* Price Research Tool */}
               <div className="mt-6">
                 <h4 className="font-medium">Market Price Research</h4>
                 <p className="text-sm text-gray-500 mb-2">
                   See what similar vehicles are selling for in your area.
                 </p>
                 <PriceResearch
                   make={formData.make}
                   model={formData.model}
                   year={formData.year}
                   onPriceSelect={(price) => {
                     setFormData(prev => ({ ...prev, price }));
                   }}
                 />
               </div>
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
             <button
               type="button"
               onClick={() => setStep(1)}
               className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
             >
               Back
             </button>
             <button
               type="submit"
               disabled={saving}
               className={`px-4 py-2 rounded-md ${
                 saving
                   ? 'bg-gray-400 cursor-not-allowed'
                   : 'bg-blue-500 hover:bg-blue-600 text-white'
               }`}
             >
               {saving ? 'Saving...' : 'Continue to Image Enhancement'}
             </button>
           </div>
         </form>
       </div>
     )}
     
     {/* Step 3: Image Enhancement */}
     {step === 3 && listingId && (
       <div className="bg-white p-6 rounded-lg shadow-md">
         <h2 className="text-xl font-semibold mb-4">Enhance Vehicle Images</h2>
         <p className="text-gray-600 mb-4">
           Process your images with AI to create professional backgrounds.
           Select the best option for each image.
         </p>
         
         <BackgroundProcessor
           listingId={listingId}
           imageData={uploadedImages}
         />
         
         <div className="mt-6 pt-4 border-t flex justify-between">
           <button
             onClick={() => setStep(2)}
             className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
           >
             Back to Details
           </button>
           
           <button
             onClick={handlePublish}
             disabled={saving}
             className={`px-4 py-2 rounded-md ${
               saving
                 ? 'bg-gray-400 cursor-not-allowed'
                 : 'bg-green-500 hover:bg-green-600 text-white'
             }`}
           >
             {saving ? 'Publishing...' : 'Publish Listing'}
           </button>
         </div>
       </div>
     )}
   </div>
 );
}

3.1.2 BatchUploader Component

// components/listings/BatchUploader.tsx
'use client';
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface BatchUploaderProps {
  initialImages?: any[];
  onUploadComplete: (results: any[]) => void;
}

export default function BatchUploader({ initialImages = [], onUploadComplete }: BatchUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate file size and type
    const validFiles = acceptedFiles.filter(file => {
      // Max size: 10MB
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds the 10MB size limit`);
        return false;
      }
      
      // Valid types: jpeg, jpg, png, webp
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(`File "${file.name}" has an unsupported format`);
        return false;
      }
      
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles]);
    setError(null);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    }
  });
  
  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select files to upload');
      return;
    }
    
    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
        
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || `Failed to upload ${file.name}`);
        }
        
        const data = await response.json();
        
        // Update progress
        setProgress(Math.round(((index + 1) / files.length) * 100));
        
        return {
          originalName: file.name,
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height
        };
      });
      
      const results = await Promise.all(uploadPromises);
      
      // Combine with existing images if any
      const allImages = [...existingImages, ...results];
      
      onUploadComplete(allImages);
      setFiles([]);
      setExistingImages(allImages);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };
  
  const removeExistingImage = (index: number) => {
    const newImages = [...existingImages];
    newImages.splice(index, 1);
    setExistingImages(newImages);
    onUploadComplete(newImages);
  };
  
  return (
    <div className="space-y-4">
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Existing Images ({existingImages.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {existingImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Existing image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove image ${index + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-8 rounded-md text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="text-4xl text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="text-gray-600">
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag & drop vehicle images here, or click to select files</p>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Supported formats: JPEG, PNG, WebP (max 10MB)
          </p>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Selected files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Selected Files ({files.length})</h3>
          <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
            {files.map((file, index) => (
              <div key={index} className="flex justify-between items-center p-2">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 flex-shrink-0">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="truncate max-w-xs">{file.name}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                  aria-label={`Remove ${file.name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          {/* Upload progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
            </div>
          )}
          
          {/* Upload button */}
          {!uploading && (
            <button
              onClick={handleUpload}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Upload Files
            </button>
          )}
        </div>
      )}
    </div>
  );
}

3.2 Image Processing Components
3.2.1 BackgroundProcessor Component

// components/image-processing/BackgroundProcessor.tsx
'use client';
import React, { useState } from 'react';

interface BackgroundProcessorProps {
  listingId: string;
  imageData: Array<{ url: string; publicId: string }>;
}

export default function BackgroundProcessor({ listingId, imageData }: BackgroundProcessorProps) {
  const [batchPreviews, setBatchPreviews] = useState<{ [key: string]: string[] }>({});
  const [selectedPreviews, setSelectedPreviews] = useState<{ [key: string]: string }>({});
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [backgroundMode, setBackgroundMode] = useState<'remove' | 'replace'>('replace');
  const [backgroundPrompt, setBackgroundPrompt] = useState('dealership showroom');
  
  const processBatchBackground = async () => {
    if (imageData.length === 0) {
      setError('No images to process');
      return;
    }
    
    setProcessing(true);
    setProcessingProgress(0);
    setError(null);
    setSuccess(null);
    
    try {
      // Process each image one by one to show progress
      const results = [];
      for (let i = 0; i < imageData.length; i++) {
        const { publicId } = imageData[i];
        
        const response = await fetch(`/api/listings/${listingId}/background-process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageIds: [publicId],
            mode: backgroundMode,
            prompt: backgroundPrompt
          }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Failed to process image ${i + 1}`);
        }
        
        const { batchResults } = await response.json();
        
        if (batchResults[0].success === false) {
          throw new Error(batchResults[0].error || `Failed to process image ${i + 1}`);
        }
        
        results.push({ 
          original: publicId, 
          previews: batchResults[0].previews 
        });
        
        // Update progress
        setProcessingProgress(((i + 1) / imageData.length) * 100);
      }
      
      // Organize results by original image ID
      const newPreviews = results.reduce((acc, curr) => ({ 
        ...acc, 
        [curr.original]: curr.previews 
      }), {});
      
      setBatchPreviews(newPreviews);
      
      // Pre-select first preview for each image
      const initialSelections = results.reduce((acc, curr) => ({
        ...acc,
        [curr.original]: curr.previews[0]
      }), {});
      
      setSelectedPreviews(initialSelections);
      setSuccess('All images processed successfully. Select your preferred version for each image.');
    } catch (err: any) {
      setError(err.message || 'Failed to process images');
    } finally {
      setProcessing(false);
    }
  };
  
  const saveBatchSelection = async () => {
    if (Object.keys(selectedPreviews).length === 0) {
      setError('No images have been processed yet');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Extract final selected preview URLs
      const finalUrls = Object.keys(selectedPreviews).map(publicId => selectedPreviews[publicId]);
      
      // Ensure all images have a selection
      if (finalUrls.length !== imageData.length) {
        throw new Error('Please select a preview for each image');
      }
      
      // Save the selected images
      const response = await fetch(`/api/listings/${listingId}/images`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedImageUrls: finalUrls }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save selected images');
      }
      
      setSuccess('Selected images saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save selections');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Background Options */}
      <div className="p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium mb-3">Background Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Background Mode
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="backgroundMode"
                  value="remove"
                  checked={backgroundMode === 'remove'}
                  onChange={() => setBackgroundMode('remove')}
                  className="mr-2"
                />
                <span>Remove Background</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="backgroundMode"
                  value="replace"
                  checked={backgroundMode === 'replace'}
                  onChange={() => setBackgroundMode('replace')}
                  className="mr-2"
                />
                <span>Replace Background</span>
              </label>
            </div>
          </div>
          
          {backgroundMode === 'replace' && (
            <div>
              <label htmlFor="backgroundPrompt" className="block text-sm font-medium mb-1">
                Background Description
              </label>
              <input
                type="text"
                id="backgroundPrompt"
                value={backgroundPrompt}
                onChange={(e) => setBackgroundPrompt(e.target.value)}
                placeholder="Describe the background you want"
                className="w-full rounded-md border-gray-300"
              />
              <p className="mt-1 text-xs text-gray-500">
                Examples: "dealership showroom", "outdoor sunny day", "urban street scene"
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Messages */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      {/* Process Button */}
      {!processing && Object.keys(batchPreviews).length === 0 && (
        <button 
          onClick={processBatchBackground} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          aria-label="Process images with AI background"
        >
          Process Images ({imageData.length})
        </button>
      )}
      
      {/* Processing Progress */}
      {processing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing images...</span>
            <span>{processingProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${processingProgress}%` }}
              role="progressbar"
              aria-valuenow={processingProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
        </div>
      )}
      
      {/* Preview Selection */}
      {Object.keys(batchPreviews).length > 0 && (
        <div className="space-y-6">
          <h3 className="font-medium text-lg">Select Background Options</h3>
          
          {imageData.map((image, index) => {
            const publicId = image.publicId;
            const previews = batchPreviews[publicId] || [];
            
            return (
              <div key={publicId} className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Image {index + 1}</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {previews.map((preview, idx) => (
                    <div 
                      key={idx}
                      className={`cursor-pointer rounded-md overflow-hidden border-2 ${
                        selectedPreviews[publicId] === preview 
                          ? 'border-blue-500' 
                          : 'border-transparent'
                      }`}
                      onClick={() => setSelectedPreviews({ 
                        ...selectedPreviews, 
                        [publicId]: preview 
                      })}
                    >
                      <img
                        src={preview}
                        alt={`Preview option ${idx + 1} for image ${index + 1}`}
                        className="w-full h-40 object-cover"
                      />
                      <div className="bg-gray-100 p-2 text-center">
                        Option {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          <button
            onClick={saveBatchSelection}
            disabled={saving}
            className={`w-full py-2 px-4 rounded-md ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            aria-label="Save selected image versions"
          >
            {saving ? 'Saving...' : 'Save Selected Versions'}
          </button>
        </div>
      )}
    </div>
  );
}

3.3 Social Media Components
3.3.1 SocialMediaManager Component

// components/social/SocialMediaManager.tsx
'use client';
import React, { useState, useEffect } from 'react';

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
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch connected platforms');
        }
        
        setConnectedPlatforms(data);
        
        // Pre-select the first platform if available
        if (data.length > 0) {
          setSelectedPlatforms([data[0].id]);
        }
      } catch (error: any) {
        console.error('Error fetching platforms:', error);
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
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch listings');
          }
          
          setListings(data);
        } catch (error: any) {
          console.error('Error fetching listings:', error);
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
           const response = await fetch(`/api/listings/${listingId}/publish`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
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
               const response = await fetch(`/api/listings/${listingId}/publish`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
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
       return (
         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
           <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
         </svg>
       );
     case 'facebook':
       return (
         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
           <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
         </svg>
       );
     case 'instagram':
       return (
         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
           <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
         </svg>
       );
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
   <div className="bg-white rounded-lg shadow-md p-6">
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
                   <div className="font-medium">{listing?.title || `Listing ${listingResult.listingId}`}</div>
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
         
         <button
           onClick={() => setPostResult(null)}
           className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
         >
           Share Again
         </button>
       </div>
     ) : (
       <div className="space-y-6">
         {/* Platform Selection */}
         <div>
           <h3 className="font-medium mb-2">Select Platforms</h3>
           
           {connectedPlatforms.length === 0 ? (
             <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
               <p>No social media platforms connected.</p>
               <a href="/dashboard/settings" className="underline">
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
                         {listing.year} {listing.make} {listing.model} - ${listing.price.toLocaleString()}
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
           <textarea
             value={customMessage}
             onChange={(e) => setCustomMessage(e.target.value)}
             placeholder={mode === 'single' 
               ? `Default message: "Check out our newest listing: ${listingTitle}"`
               : "Enter a custom message for all selected listings"
             }
             rows={3}
             className="block w-full rounded-md border-gray-300 shadow-sm"
           />
           <p className="mt-1 text-xs text-gray-500">
             Leave blank to use the default message format.
           </p>
         </div>
         
         {/* Post Button */}
         <button
           onClick={handlePost}
           disabled={isPosting || selectedPlatforms.length === 0 || (mode === 'multiple' && selectedListings.length === 0)}
           className={`flex items-center justify-center w-full py-2 px-4 rounded-md ${
             isPosting || selectedPlatforms.length === 0 || (mode === 'multiple' && selectedListings.length === 0)
               ? 'bg-gray-400 cursor-not-allowed'
               : 'bg-blue-500 hover:bg-blue-600 text-white'
           }`}
         >
           {isPosting ? (
             <>
               <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Posting...
             </>
           ) : (
             mode === 'single'
               ? 'Share to Selected Platforms' 
               : 'Post to Selected Platforms'
           )}
         </button>
       </div>
     )}
   </div>
 );
}

3.4 Subscription and Billing Components
3.4.1 PricingTiers Component

// components/pricing/PricingTiers.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PricingTiersProps {
  currentTier?: string;
  onSelectTier?: (tier: string) => void;
  mode?: 'page' | 'component';
}

export default function PricingTiers({ 
  currentTier, 
  onSelectTier,
  mode = 'component'
}: PricingTiersProps) {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedTier, setSelectedTier] = useState(currentTier || '');
  
  const tiers = [
    {
      id: 'pro',
      name: 'Pro',
      description: 'Perfect for single dealerships just getting started.',
      priceMonthly: 99,
      priceAnnual: 990,
      features: [
        'Up to 100 vehicle listings',
        'Basic AI image enhancement',
        'Single social media platform',
        '5 users maximum',
        'Email support'
      ],
      limitations: [
        'No advanced AI features',
        'Limited analytics',
        'No white-label options'
      ]
    },
    {
      id: 'growth',
      name: 'Growth',
      description: 'For dealerships ready to scale their online presence.',
      priceMonthly: 249,
      priceAnnual: 2490,
      features: [
        'Up to 500 vehicle listings',
        'Advanced AI image enhancements',
        'All social media platforms',
        '20 users maximum',
        'Email and chat support',
        'Analytics dashboard',
        'Bulk processing'
      ],
      limitations: [
        'Limited to single dealership',
        'No custom integrations'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Full-featured solution for dealer groups and franchises.',
      priceMonthly: 599,
      priceAnnual: 5990,
      features: [
        'Unlimited vehicle listings',
        'All AI features',
        'All social media platforms',
        'Unlimited users',
        'Premium support with dedicated account manager',
        'Advanced analytics and reporting',
        'White-label solution',
        'Custom integrations',
        'Multiple dealership management'
      ],
      limitations: []
    }
  ];
  
  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId);
    
    if (onSelectTier) {
      onSelectTier(tierId);
    }
    
    if (mode === 'page') {
      // Navigate to checkout with selected tier
      router.push(`/dashboard/billing/checkout?plan=${tierId}&cycle=${billingCycle}`);
    }
  };
  
  const getPrice = (tier: any) => {
    return billingCycle === 'monthly' ? tier.priceMonthly : tier.priceAnnual;
  };
  
  const getSavings = (tier: any) => {
    return tier.priceMonthly * 12 - tier.priceAnnual;
  };
  
  return (
    <div className="space-y-8">
      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-full flex items-center">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-full ${
              billingCycle === 'monthly'
                ? 'bg-white shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-full ${
              billingCycle === 'annual'
                ? 'bg-white shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Annual
            <span className="ml-1 text-xs text-green-500">
              (Save 17%)
            </span>
          </button>
        </div>
      </div>
      
      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <div 
            key={tier.id}
            className={`relative rounded-lg border ${
              tier.popular
                ? 'border-blue-500 shadow-md'
                : 'border-gray-200'
            }`}
          >
            {tier.popular && (
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3">
                <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-bold">{tier.name}</h3>
              <p className="mt-1 text-gray-500">{tier.description}</p>
              
              <div className="mt-4">
                <span className="text-3xl font-bold">${getPrice(tier)}</span>
                <span className="text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              
              {billingCycle === 'annual' && (
                <div className="mt-1 text-sm text-green-500">
                  Save ${getSavings(tier)} per year
                </div>
              )}
              
              <button
                onClick={() => handleSelectTier(tier.id)}
                className={`mt-6 w-full py-2 px-4 rounded-md ${
                  selectedTier === tier.id
                    ? 'bg-blue-600 text-white'
                    : tier.popular
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'border border-blue-500 text-blue-500 hover:bg-blue-50'
                }`}
              >
                {selectedTier === tier.id 
                  ? 'Selected' 
                  : currentTier === tier.id
                    ? 'Current Plan'
                    : 'Select Plan'
                }
              </button>
            </div>
            
            <div className="px-6 pt-2 pb-6">
              <h4 className="font-medium mb-2">Features:</h4>
              <ul className="space-y-2">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg 
                      className="h-5 w-5 text-green-500 mt-0.5 mr-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {tier.limitations.length > 0 && (
                <>
                  <h4 className="font-medium mt-4 mb-2">Limitations:</h4>
                  <ul className="space-y-2">
                    {tier.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start">
                        <svg 
                          className="h-5 w-5 text-gray-400 mt-0.5 mr-2" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M6 18L18 6M6 6l12 12" 
                          />
                        </svg>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {mode === 'page' && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
          <h3 className="text-xl font-semibold">Need a custom solution?</h3>
          <p className="mt-2 text-gray-600">
            Contact our sales team for a personalized quote tailored to your specific requirements.
          </p>
          <a 
            href="mailto:sales@cardealderai.com" 
            className="mt-4 inline-block px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700"
          >
            Contact Sales
          </a>
        </div>
      )}
    </div>
  );
}
4. API Endpoints Implementation
4.1 Listings API
4.1.1 GET and POST /api/listings

// app/api/listings/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const userId = request.headers.get('x-user-id');
    
    // Validate parameters
    if (limit > 100) {
      return NextResponse.json(
        { error: 'Maximum limit is 100 records' },
        { status: 400 }
      );
    }
    
    // Build query
    let query = supabase
      .from('listings')
      .select('*')
      .order(sort, { ascending: order === 'asc' })
      .limit(limit)
      .offset(offset);
    
    // Add filters if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    if (userId) {
      // Check if user is admin to determine if they should see all listings
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      // If not admin, only show their own listings
      if (!userProfile || userProfile.role !== 'Admin') {
        query = query.eq('created_by', userId);
      }
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to fetch listings' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      data,
      count,
      limit,
      offset
    });
  } catch (error: any) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'make', 'model', 'year'];
   for (const field of requiredFields) {
     if (!body[field]) {
       return NextResponse.json(
         { error: `${field} is required` },
         { status: 400 }
       );
     }
   }
   
   // Check user subscription tier limits
   const { data: subscription } = await supabase
     .from('subscriptions')
     .select('tier')
     .eq('user_id', userId)
     .single();
   
   // Count existing listings for this user
   const { count: listingCount } = await supabase
     .from('listings')
     .select('id', { count: 'exact' })
     .eq('created_by', userId);
   
   // Check if user is at their limit
   if (subscription?.tier === 'pro' && listingCount >= 100) {
     return NextResponse.json(
       { error: 'You have reached the maximum number of listings for your Pro plan. Please upgrade to continue.' },
       { status: 403 }
     );
   } else if (subscription?.tier === 'growth' && listingCount >= 500) {
     return NextResponse.json(
       { error: 'You have reached the maximum number of listings for your Growth plan. Please upgrade to continue.' },
       { status: 403 }
     );
   }
   
   // Create listing
   const { data, error } = await supabase
     .from('listings')
     .insert({
       ...body,
       created_by: userId,
       status: body.status || 'draft'
     })
     .select()
     .single();
   
   if (error) {
     return NextResponse.json(
       { error: error.message || 'Failed to create listing' },
       { status: 500 }
     );
   }
   
   // Log the creation
   await supabase.from('audit_logs').insert({
     user_id: userId,
     action: 'create_listing',
     details: { listing_id: data.id }
   });
   
   return NextResponse.json(data);
 } catch (error: any) {
   console.error('Error creating listing:', error);
   return NextResponse.json(
     { error: error.message || 'An unexpected error occurred' },
     { status: 500 }
   );
 }
}

4.1.2 Background Processing API

// app/api/listings/[id]/background-process/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processBatchBackground } from '@/lib/cloudinary';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { imageIds, mode = 'replace', prompt = 'dealership showroom' } = await request.json();
    
    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: 'Image IDs are required and must be an array' },
        { status: 400 }
      );
    }
    
    // Check if user has permission to edit this listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('created_by')
      .eq('id', params.id)
      .single();
    
    if (listingError) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Check user permissions
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    const isAdmin = userProfile?.role === 'Admin';
    const isOwner = listing.created_by === userId;
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }
    
    // Check user subscription for feature availability
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .single();
    
    // For Pro tier, limit background options
    if (subscription?.tier === 'pro' && mode === 'replace') {
      return NextResponse.json(
        { error: 'Background replacement is only available on Growth and Enterprise plans. Please upgrade to access this feature.' },
        { status: 403 }
      );
    }
    
    // Process the images
    const batchResults = await processBatchBackground(imageIds, mode, prompt);
    
    // Log the operation
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'process_image_backgrounds',
      details: { 
        listing_id: params.id,
        image_count: imageIds.length,
        successful: batchResults.successCount,
        failed: batchResults.failCount
      }
    });
    
    return NextResponse.json({ batchResults });
  } catch (error: any) {
    console.error('Error processing image backgrounds:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process image backgrounds' },
      { status: 500 }
    );
  }
}

4.2 Social Media API
4.2.1 Social Media Platforms API

// app/api/social/platforms/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user's connected social platforms
    const { data, error } = await supabase
      .from('social_connections')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to fetch social platforms' },
        { status: 500 }
      );
    }
    
    // Get user's subscription tier for feature availability
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .single();
    
    // Format response
    const platforms = data.map(platform => ({
      id: platform.platform_id,
      name: getPlatformName(platform.platform_id),
      connected: true,
      tokenExpires: platform.token_expires,
      username: platform.username
    }));
    
    // For Pro tier, only allow one platform
    if (subscription?.tier === 'pro' && platforms.length > 1) {
      return NextResponse.json([platforms[0]]);
    }
    
    // Add placeholder for platforms not connected
    const allPlatformIds = ['x', 'facebook', 'instagram'];
    const connectedIds = platforms.map(p => p.id);
    
    for (const platformId of allPlatformIds) {
      if (!connectedIds.includes(platformId)) {
        platforms.push({
          id: platformId,
          name: getPlatformName(platformId),
          connected: false
        });
      }
    }
    
    return NextResponse.json(platforms);
  } catch (error: any) {
    console.error('Error fetching social platforms:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { platformId, accessToken, refreshToken, tokenExpires, username } = await request.json();
    
    if (!platformId || !accessToken) {
      return NextResponse.json(
        { error: 'Platform ID and access token are required' },
        { status: 400 }
      );
    }
    
    // Check user's subscription tier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .single();
    
    // For Pro tier, check if user already has a platform connected
    if (subscription?.tier === 'pro') {
      const { count } = await supabase
        .from('social_connections')
        .select('platform_id', { count: 'exact' })
        .eq('user_id', userId);
      
      if (count && count > 0) {
        return NextResponse.json(
          { error: 'Pro tier is limited to one social media platform. Please upgrade to connect multiple platforms.' },
          { status: 403 }
        );
      }
    }
    
    // Check if platform is already connected
    const { data: existingConnection } = await supabase
      .from('social_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('platform_id', platformId)
      .single();
    
    let result;
    
    if (existingConnection) {
      // Update existing connection
      result = await supabase
        .from('social_connections')
        .update({
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires: tokenExpires,
          username,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConnection.id)
        .select()
        .single();
    } else {
      // Create new connection
      result = await supabase
        .from('social_connections')
        .insert({
          user_id: userId,
          platform_id: platformId,
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires: tokenExpires,
          username
        })
        .select()
        .single();
    }
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error.message || 'Failed to connect platform' },
        { status: 500 }
      );
    }
    
    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: existingConnection ? 'update_social_connection' : 'create_social_connection',
      details: { platform_id: platformId }
    });
    
    return NextResponse.json({
      success: true,
      message: `Successfully ${existingConnection ? 'updated' : 'connected'} ${getPlatformName(platformId)}`
    });
  } catch (error: any) {
    console.error('Error connecting social platform:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Helper function to get platform name
function getPlatformName(platformId: string) {
  switch (platformId) {
    case 'x': return 'X (Twitter)';
    case 'facebook': return 'Facebook';
    case 'instagram': return 'Instagram';
    default: return platformId;
  }
}

4.3 Subscription and Billing
4.3.1 Stripe Checkout API
// app/api/stripe/create-checkout/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { plan, cycle } = await request.json();
    
    // Validate plan and cycle
    if (!plan || !['pro', 'growth', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }
    
    if (!cycle || !['monthly', 'annual'].includes(cycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle' },
        { status: 400 }
      );
    }
    
    // Get user details
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('email, name')
      .eq('id', userId)
      .single();
    
    if (userError) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user already has a subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id, status')
      .eq('user_id', userId)
      .single();
    
    // Get pricing based on plan and cycle
    const prices = {
      pro: {
        monthly: 'price_pro_monthly', // Replace with actual Stripe price IDs
        annual: 'price_pro_annual'
      },
      growth: {
        monthly: 'price_growth_monthly',
        annual: 'price_growth_annual'
      },
      enterprise: {
        monthly: 'price_enterprise_monthly',
        annual: 'price_enterprise_annual'
      }
    };
    
    const priceId = prices[plan as keyof typeof prices][cycle as keyof typeof prices[keyof typeof prices]];
    
    let stripeCustomerId = existingSubscription?.stripe_customer_id;
    
    // Create Stripe customer if needed
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId
        }
      });
      
      stripeCustomerId = customer.id;
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/cancel`,
      metadata: {
        userId,
        plan,
        cycle
      }
    });
    
    // Update or create subscription record
    if (existingSubscription) {
      await supabase
        .from('subscriptions')
        .update({
          stripe_checkout_id: session.id,
          plan,
          billing_cycle: cycle,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          stripe_customer_id: stripeCustomerId,
          stripe_checkout_id: session.id,
          plan,
          billing_cycle: cycle,
          status: 'pending'
        });
    }
    
    // Log the checkout creation
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'create_checkout_session',
      details: { plan, billing_cycle: cycle }
    });
    
    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

4.4 Analytics API
// app/api/admin/analytics/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function GET(request: Request) {
  try {
    // Check if user has admin role
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (!userProfile || userProfile.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Get basic stats
    const [
      listingsResult,
      imagesResult,
      postsResult,
      usersResult,
      subscriptionsResult
    ] = await Promise.all([
      // Total listings count
      supabase.from('listings').select('id', { count: 'exact' }),
      
      // Total images count (sum array lengths)
      supabase.from('listings').select('images'),
      
      // Total social media posts
      supabase.from('audit_logs')
        .select('id', { count: 'exact' })
        .eq('action', 'social_media_post'),
      
      // Total users
      supabase.from('user_profiles')
        .select('id', { count: 'exact' }),
        
      // Subscription distribution
      supabase.from('subscriptions')
        .select('plan, count', { count: 'exact' })
        .not('status', 'eq', 'canceled')
        .group('plan')
    ]);
    
    // Calculate total images across all listings
    const imageCount = imagesResult.data?.reduce((sum, listing) => {
      return sum + (Array.isArray(listing.images) ? listing.images.length : 0);
    }, 0) || 0;
    
    // Format subscription data
    const subscriptionsByTier = {
      pro: 0,
      growth: 0,
      enterprise: 0
    };
    
    subscriptionsResult.data?.forEach(row => {
      if (row.plan in subscriptionsByTier) {
        subscriptionsByTier[row.plan as keyof typeof subscriptionsByTier] = row.count;
      }
    });
    
    // Get listings by month for chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const { data: listingsByMonth } = await supabase
      .from('listings')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString());
    
    // Process listings by month for chart
    const monthlyData = {};
    listingsByMonth?.forEach(listing => {
      const date = new Date(listing.created_at);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthYear in monthlyData) {
        monthlyData[monthYear]++;
      } else {
        monthlyData[monthYear] = 1;
      }
    });
    
    // Format monthly data for chart
    const chartData = Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    return NextResponse.json({
      listingCount: listingsResult.count || 0,
      imageCount,
      socialPostCount: postsResult.count || 0,
      userCount: usersResult.count || 0,
      subscriptions: subscriptionsByTier,
      listingsByMonth: chartData,
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

5. Database Schema
5.1 PostgreSQL Tables
-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'User',
  dealership_id UUID,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dealerships (for multi-dealership support)
CREATE TABLE dealerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Listings
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER,
  price NUMERIC,
  condition TEXT DEFAULT 'Used',
  vin TEXT,
  exterior_color TEXT,
  interior_color TEXT,
  fuel_type TEXT,
  transmission TEXT,
  drivetrain TEXT,
  features JSONB,
  images TEXT[],
  thumbnail TEXT,
  status TEXT DEFAULT 'draft',
  dealership_id UUID REFERENCES dealerships(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Media Connections
CREATE TABLE social_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  platform_id TEXT NOT NULL,
  username TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform_id)
);

-- Scheduled Social Media Posts
CREATE TABLE scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id),
  platform_id TEXT NOT NULL,
  content TEXT,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Image Gallery
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  dealership_id UUID REFERENCES dealerships(id),
  original_url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  enhanced_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  dealership_id UUID REFERENCES dealerships(id),
  plan TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_checkout_id TEXT,
  status TEXT DEFAULT 'pending',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Price Research Cache
CREATE TABLE price_research_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

5.2 Indexes

-- Indexes for Listings
CREATE INDEX listings_created_by_idx ON listings(created_by);
CREATE INDEX listings_dealership_id_idx ON listings(dealership_id);
CREATE INDEX listings_status_idx ON listings(status);
CREATE INDEX listings_make_model_idx ON listings(make, model);
CREATE INDEX listings_created_at_idx ON listings(created_at);

-- Indexes for Social Media
CREATE INDEX social_connections_user_id_idx ON social_connections(user_id);
CREATE INDEX scheduled_posts_listing_id_idx ON scheduled_posts(listing_id);
CREATE INDEX scheduled_posts_scheduled_time_idx ON scheduled_posts(scheduled_time);

-- Indexes for User Profiles
CREATE INDEX user_profiles_dealership_id_idx ON user_profiles(dealership_id);
CREATE INDEX user_profiles_role_idx ON user_profiles(role);

-- Indexes for Audit Logs
CREATE INDEX audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX audit_logs_action_idx ON audit_logs(action);
CREATE INDEX audit_logs_timestamp_idx ON audit_logs(timestamp);

-- Indexes for Subscriptions
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX subscriptions_dealership_id_idx ON subscriptions(dealership_id);
CREATE INDEX subscriptions_status_idx ON subscriptions(status);

6. Authentication and Authorization
6.1 Middleware for Route Protection
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get URL information
  const url = req.nextUrl.clone();
  const path = url.pathname;
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/public/listings'
  ];
  
  // Check if path is public or starts with a public prefix
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  // Handle authentication
  if (!session) {
    // If not authenticated and trying to access protected route
    if (!isPublicRoute) {
      url.pathname = '/login';
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }
    
    // Allow access to public routes
    return res;
  }
  
  // User is authenticated at this point
  
  // Add user ID to request headers for API routes
  if (path.startsWith('/api/')) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', session.user.id);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  // Handle admin routes
  if (path.startsWith('/admin')) {
    // Check if user has admin role
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (!userProfile || userProfile.role !== 'Admin') {
      // Redirect non-admin users to unauthorized page
      url.pathname = '/unauthorized';
      return NextResponse.redirect(url);
    }
  }
  
  // Check subscription status for protected features
  if (path.includes('/dashboard/') && !path.includes('/dashboard/billing')) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', session.user.id)
      .single();
    
    // If no active subscription, redirect to billing page
    if (!subscription || subscription.status === 'canceled' || subscription.status === 'unpaid') {
      if (!path.includes('/dashboard/billing')) {
        url.pathname = '/dashboard/billing';
        return NextResponse.redirect(url);
      }
    }
  }
  
  // If user is authenticated and on the login page, redirect to dashboard
  if (path === '/login' || path === '/register') {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. robots.txt)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico)$).*)',
  ],
};

7. Deployment Configuration
7.1 Vercel Configuration

// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/cron/(.*)",
      "headers": {
        "Authorization": "Bearer @cron-secret"
      }
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_KEY": "@supabase-service-key",
    "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME": "@cloudinary-cloud-name",
    "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET": "@cloudinary-upload-preset",
    "CLOUDINARY_API_KEY": "@cloudinary-api-key",
   "CLOUDINARY_API_SECRET": "@cloudinary-api-secret",
   "OPENAI_API_KEY": "@openai-api-key",
   "STRIPE_SECRET_KEY": "@stripe-secret-key",
   "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "@stripe-publishable-key",
   "STRIPE_WEBHOOK_SECRET": "@stripe-webhook-secret",
   "FIRECRAWL_API_KEY": "@firecrawl-api-key",
   "TWITTER_ACCESS_TOKEN": "@twitter-access-token",
   "FACEBOOK_ACCESS_TOKEN": "@facebook-access-token",
   "CRON_SECRET": "@cron-secret",
   "NEXT_PUBLIC_APP_URL": "@app-url"
 }
}
7.2 Next.js Configuration
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'res.cloudinary.com',
      'images.unsplash.com'
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: true,
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/listings',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

8.2 Implementation Strategy for Tier Restrictions

Database-level Checks: Use database queries to enforce limits (e.g., maximum listings)
API-level Restrictions: Check subscription tier in API handlers before allowing certain operations
UI Feature Gating: Disable or hide features based on subscription tier
Middleware Validation: For critical routes, use middleware to verify tier access

9. Security Measures
9.1 Data Protection

Sensitive Data Handling:

Store tokens and sensitive data encrypted
Use HTTP-only cookies for authentication tokens
Implement proper CORS policy


Input Validation:

Validate all user inputs at the API level
Implement rate limiting for public endpoints
Use parameterized queries to prevent SQL injection


GDPR Compliance:

Provide data export functionality
Implement data retention policies
Allow users to delete their account and associated data



9.2 Authentication Security

Password Security:

Enforce strong password requirements
Implement proper password reset flow
Use Supabase Auth's secure password storage


Session Management:

Set appropriate token expiration times
Implement proper session invalidation
Provide account activity logs


Role-Based Access Control:

Define clear roles and permissions
Validate permissions at middleware level
Log and alert on suspicious access attempts



10. API Documentation
10.1 Base URL
Copyhttps://api.cardealderai.com
10.2 Authentication
All API endpoints require authentication unless specifically marked as public.
Authentication is handled via Supabase Auth, using a JWT token in the Authorization header:
CopyAuthorization: Bearer <token>
10.3 Endpoints Reference
Listings API
EndpointMethodDescriptionAuthentication Required/api/listingsGETList all listings with filtersYes/api/listingsPOSTCreate a new listingYes/api/listings/:idGETGet a single listingYes (for draft listings)/api/listings/:idPUTUpdate a listingYes/api/listings/:idDELETEDelete a listingYes
Image Processing API
EndpointMethodDescriptionAuthentication Required/api/listings/:id/background-processPOSTProcess image backgroundsYes/api/listings/:id/imagesPUTUpdate listing imagesYes/api/galleryGETGet gallery imagesYes/api/galleryPOSTUpload images to galleryYes
Social Media API
EndpointMethodDescriptionAuthentication Required/api/social/platformsGETGet connected platformsYes/api/social/platformsPOSTConnect social platformYes/api/listings/:id/publishPOSTPublish listing to socialYes/api/social/scheduleGETGet scheduled postsYes
User and Subscription API
EndpointMethodDescriptionAuthentication Required/api/user/profileGETGet user profileYes/api/user/profilePUTUpdate user profileYes/api/user/export-dataGETExport user data (GDPR)Yes/api/stripe/create-checkoutPOSTCreate Stripe checkoutYes/api/stripe/billing-portalGETAccess Stripe billing portalYes
Admin API
EndpointMethodDescriptionAuthentication Required/api/admin/analyticsGETGet analytics dataYes (Admin only)/api/admin/usersGETList all usersYes (Admin only)/api/admin/dealershipsGETList all dealershipsYes (Admin only)/api/admin/subscriptionsGETList all subscriptionsYes (Admin only)
11. Mobile Responsiveness
The application is built with a mobile-first approach using Tailwind CSS. Key responsive design considerations include:
11.1 Breakpoints

Small (sm): 640px - Mobile devices
Medium (md): 768px - Tablets
Large (lg): 1024px - Laptops
Extra Large (xl): 1280px - Desktops
2XL (2xl): 1536px - Large screens

11.2 Mobile-Specific UI Adjustments

Navigation: Collapse to hamburger menu on mobile
Image Grids: Reduce columns (1-2 on mobile, 3-4 on desktop)
Forms: Full-width inputs on mobile
Tables: Horizontal scroll or stacked view for complex tables
Buttons: Larger touch targets (min 44px height)
Spacing: Adjusted padding for smaller screens

12. Testing Strategy
12.1 Unit Testing

Component Testing:

Test key UI components with React Testing Library
Test form validation logic
Test state management


API Testing:

Test API endpoint handlers
Test database interactions
Test error handling



12.2 Integration Testing

User Flows:

Test listing creation, editing, and deletion
Test image upload and processing
Test social media posting workflow


Authentication:

Test registration, login, and password reset
Test role-based access control
Test subscription tier restrictions



12.3 End-to-End Testing

Critical Paths:

Complete listing publication flow
Subscription purchase and management
Social media integration


Cross-browser Testing:

Test on major browsers (Chrome, Firefox, Safari, Edge)
Test on both mobile and desktop devices
