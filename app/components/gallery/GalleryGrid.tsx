import React, { useState } from 'react';
import Image from 'next/image';
import { Tag, X, Edit2, Share2, Download } from 'react-feather';

interface GalleryImage {
  publicId: string;
  url: string;
  width: number;
  height: number;
  tags?: string[];
}

interface GalleryGridProps {
  images: GalleryImage[];
  onDelete: (publicId: string) => Promise<void>;
  onRename: (publicId: string, newName: string) => Promise<void>;
  onTagsUpdate: (publicId: string, tags: string[]) => Promise<void>;
  onShare: (publicId: string) => void;
  onDownload: (url: string) => void;
}

export default function GalleryGrid({
  images,
  onDelete,
  onRename,
  onTagsUpdate,
  onShare,
  onDownload,
}: GalleryGridProps) {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTags, setEditingTags] = useState<string[]>([]);
  const [isTagging, setIsTagging] = useState(false);

  const handleImageSelect = (publicId: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(publicId)) {
      newSelected.delete(publicId);
    } else {
      newSelected.add(publicId);
    }
    setSelectedImages(newSelected);
  };

  const handleTagsEdit = (publicId: string, currentTags: string[] = []) => {
    setEditingId(publicId);
    setEditingTags(currentTags);
    setIsTagging(true);
  };

  const handleTagsSave = async () => {
    if (editingId) {
      await onTagsUpdate(editingId, editingTags);
      setIsTagging(false);
      setEditingId(null);
      setEditingTags([]);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Batch Actions */}
      {selectedImages.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <span>{selectedImages.size} images selected</span>
            <div className="space-x-4">
              <button
                onClick={() => setSelectedImages(new Set())}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear Selection
              </button>
              {/* Add batch actions here */}
            </div>
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.publicId}
            className={`relative group rounded-lg overflow-hidden border-2 ${
              selectedImages.has(image.publicId)
                ? 'border-blue-500'
                : 'border-transparent'
            }`}
          >
            {/* Image */}
            <div className="aspect-w-16 aspect-h-9">
              <Image
                src={image.url}
                alt={image.publicId}
                width={image.width}
                height={image.height}
                className="object-cover cursor-pointer"
                onClick={() => handleImageSelect(image.publicId)}
              />
            </div>

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
              <button
                onClick={() => onDelete(image.publicId)}
                className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                title="Delete"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setEditingId(image.publicId)}
                className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
                title="Rename"
              >
                <Edit2 className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => handleTagsEdit(image.publicId, image.tags)}
                className="p-2 bg-green-500 rounded-full hover:bg-green-600 transition-colors"
                title="Edit Tags"
              >
                <Tag className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => onShare(image.publicId)}
                className="p-2 bg-purple-500 rounded-full hover:bg-purple-600 transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => onDownload(image.url)}
                className="p-2 bg-gray-500 rounded-full hover:bg-gray-600 transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Tags Display */}
            {image.tags && image.tags.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50">
                <div className="flex flex-wrap gap-1">
                  {image.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-200 rounded-full text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tag Editing Modal */}
      {isTagging && editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Tags</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Add tags (comma separated)"
                className="w-full p-2 border rounded"
                value={editingTags.join(', ')}
                onChange={(e) => setEditingTags(e.target.value.split(',').map((t) => t.trim()))}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsTagging(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTagsSave}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save Tags
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 