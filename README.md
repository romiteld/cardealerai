# CarDealerAI

A comprehensive web application for automotive dealerships to streamline vehicle listing creation, enhance photos with AI, generate compelling content, and manage social media marketing.

## Features

- **Vehicle Listing Management**: Create, edit, delete, and publish vehicle listings with detailed information
- **AI-Powered Image Enhancement**: Process vehicle images with background removal/replacement and other AI enhancements
- **Batch Image Processing**: Upload and process multiple images simultaneously for efficiency
- **Image Previews & Comparison**: Advanced image preview with side-by-side comparison of original and enhanced images
- **Social Media Integration**: Post listings to various platforms (X, Facebook, Instagram) with scheduling capabilities
- **Content Generation**: AI-powered description and feature generation

## Technology Stack

- **Frontend**: Next.js with Tailwind CSS
- **Image Processing**: Cloudinary AI
- **UI Components**: Radix UI + shadcn/ui
- **Authentication**: Clerk Auth

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or pnpm
- Cloudinary account
- Clerk account (for authentication)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
   CLERK_SECRET_KEY=your_key
   
   # Cloudinary Configuration
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Key Components

### BatchUploader

The BatchUploader component allows users to efficiently upload multiple vehicle images simultaneously. It provides:
- Drag-and-drop functionality
- File validation (type, size)
- Progress tracking
- Existing image management

### BackgroundProcessor

The BackgroundProcessor component handles AI-powered image enhancements:
- Background removal/replacement
- Batch processing of multiple images
- Preview selection with multiple options per image
- Custom background prompts for generative backgrounds

### CloudinaryImageEditor

The CloudinaryImageEditor provides fine-grained control over image adjustments:
- Brightness, contrast, saturation adjustments
- Special effects (art filters, vignette, etc.)
- Background generation with AI prompts
- Direct editing of individual images

### SocialMediaManager

The SocialMediaManager enables seamless social media publishing:
- Multi-platform posting (X/Twitter, Facebook, Instagram)
- Immediate or scheduled posts
- Custom messaging
- Bulk listing selection for batch posting
- Post status tracking

### ListingGallery

The ListingGallery provides an interactive presentation layer for vehicle images:
- Fullscreen image preview
- Image carousel navigation
- Thumbnail navigation
- Download and sharing options

### ImagePreview

The ImagePreview component offers detailed image viewing capabilities:
- Side-by-side comparison of original and enhanced images
- Image rotation
- Quick selection for batch operations
- Visual indicators for selected images

### ImageGrid

The ImageGrid enables efficient management of multiple images:
- Filtering options for original/enhanced images
- Grid and masonry layout options
- Batch selection for processing
- Visual feedback for selected items

## API Endpoints

### Image Processing

- `POST /api/enhance-image` - Upload and enhance a single image
- `POST /api/enhance-batch` - Process multiple images in batch
- `POST /api/generate-background` - Generate AI backgrounds for vehicle images

### Listings

- `GET /api/listings` - Get all listings with filtering options
- `POST /api/listings` - Create a new listing
- `GET /api/listings/[id]` - Get a specific listing
- `PUT /api/listings/[id]` - Update a listing
- `DELETE /api/listings/[id]` - Delete a listing
- `GET /api/listings/[id]/images` - Get images for a listing
- `PUT /api/listings/[id]/images` - Update images for a listing

### Social Media

- `GET /api/social/platforms` - Get connected social media platforms
- `POST /api/social/platforms` - Connect a new social platform
- `POST /api/social/publish` - Publish a listing to social media
- `GET /api/social/schedule` - Get scheduled social media posts
- `DELETE /api/social/schedule` - Cancel a scheduled post

## Pages

- **/gallery** - Visual gallery for exploring and managing vehicle images
- **/dashboard/listings** - Manage vehicle listings
- **/dashboard/social** - Social media management dashboard

## License

This project is licensed under the MIT License - see the LICENSE file for details. 