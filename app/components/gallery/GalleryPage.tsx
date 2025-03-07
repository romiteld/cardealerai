import React, { useState, useEffect } from 'react';
import GalleryGrid from './GalleryGrid';
import GalleryToolbar from './GalleryToolbar';
import { toast } from 'react-hot-toast';

interface GalleryImage {
  publicId: string;
  url: string;
  width: number;
  height: number;
  tags?: string[];
  created_at?: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch images and tags
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const [imagesRes, tagsRes] = await Promise.all([
          fetch('/api/gallery'),
          fetch('/api/gallery/tags?prefix='),
        ]);

        if (!imagesRes.ok || !tagsRes.ok) {
          throw new Error('Failed to fetch gallery data');
        }

        const imagesData = await imagesRes.json();
        const tagsData = await tagsRes.json();

        setImages(imagesData.images);
        setFilteredImages(imagesData.images);
        setAvailableTags(tagsData.tags);
      } catch (error) {
        console.error('Error fetching gallery:', error);
        toast.error('Failed to load gallery');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    const filtered = images.filter((image) =>
      image.publicId.toLowerCase().includes(query.toLowerCase()) ||
      image.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredImages(filtered);
  };

  // Handle tag filtering
  const handleFilter = (selectedTags: string[]) => {
    if (selectedTags.length === 0) {
      setFilteredImages(images);
      return;
    }

    const filtered = images.filter((image) =>
      selectedTags.every((tag) => image.tags?.includes(tag))
    );
    setFilteredImages(filtered);
  };

  // Handle sorting
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    const sorted = [...filteredImages].sort((a, b) => {
      let comparison = 0;
      if (field === 'created_at') {
        comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      } else if (field === 'name') {
        comparison = a.publicId.localeCompare(b.publicId);
      }
      return direction === 'asc' ? comparison : -comparison;
    });
    setFilteredImages(sorted);
  };

  // Handle image deletion
  const handleDelete = async (publicId: string) => {
    try {
      const response = await fetch('/api/gallery/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', publicId }),
      });

      if (!response.ok) throw new Error('Failed to delete image');

      setImages((prev) => prev.filter((img) => img.publicId !== publicId));
      setFilteredImages((prev) => prev.filter((img) => img.publicId !== publicId));
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  // Handle image renaming
  const handleRename = async (publicId: string, newName: string) => {
    try {
      const response = await fetch('/api/gallery/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rename',
          publicId,
          newPublicId: newName,
        }),
      });

      if (!response.ok) throw new Error('Failed to rename image');

      const { newPublicId, url } = await response.json();

      setImages((prev) =>
        prev.map((img) =>
          img.publicId === publicId
            ? { ...img, publicId: newPublicId, url }
            : img
        )
      );
      setFilteredImages((prev) =>
        prev.map((img) =>
          img.publicId === publicId
            ? { ...img, publicId: newPublicId, url }
            : img
        )
      );
      toast.success('Image renamed successfully');
    } catch (error) {
      console.error('Error renaming image:', error);
      toast.error('Failed to rename image');
    }
  };

  // Handle tag updates
  const handleTagsUpdate = async (publicId: string, tags: string[]) => {
    try {
      const response = await fetch('/api/gallery/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'replace',
          publicIds: [publicId],
          tags,
        }),
      });

      if (!response.ok) throw new Error('Failed to update tags');

      setImages((prev) =>
        prev.map((img) =>
          img.publicId === publicId
            ? { ...img, tags }
            : img
        )
      );
      setFilteredImages((prev) =>
        prev.map((img) =>
          img.publicId === publicId
            ? { ...img, tags }
            : img
        )
      );

      // Update available tags
      const newTags = new Set([...availableTags, ...tags]);
      setAvailableTags(Array.from(newTags));

      toast.success('Tags updated successfully');
    } catch (error) {
      console.error('Error updating tags:', error);
      toast.error('Failed to update tags');
    }
  };

  // Handle image sharing
  const handleShare = (publicId: string) => {
    const imageUrl = images.find((img) => img.publicId === publicId)?.url;
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl);
      toast.success('Image URL copied to clipboard');
    }
  };

  // Handle image download
  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = url.split('/').pop() || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GalleryToolbar
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
        availableTags={availableTags}
      />
      <GalleryGrid
        images={filteredImages}
        onDelete={handleDelete}
        onRename={handleRename}
        onTagsUpdate={handleTagsUpdate}
        onShare={handleShare}
        onDownload={handleDownload}
      />
    </div>
  );
} 