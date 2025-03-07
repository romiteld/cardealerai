import React from 'react';
import Image from 'next/image';
import { Zap, Loader } from 'react-feather';

interface PreviewUrl {
  name: string;
  url: string;
}

interface EnhancementSuggestionsProps {
  suggestions: string;
  previewUrls: PreviewUrl[];
  isLoading: boolean;
  onApply: (preset: string) => void;
}

export default function EnhancementSuggestions({
  suggestions,
  previewUrls,
  isLoading,
  onApply,
}: EnhancementSuggestionsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">AI Suggestions</h3>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600">Analyzing image and generating suggestions...</p>
        </div>
      )}

      {/* Suggestions */}
      {!isLoading && suggestions && (
        <div className="prose prose-sm max-w-none">
          <div className="bg-gray-50 rounded-lg p-4">
            {suggestions.split('\n').map((line, index) => (
              <p key={index} className="mb-2">{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Preview Grid */}
      {!isLoading && previewUrls.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Suggested Enhancements
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {previewUrls.map((preview) => (
              <button
                key={preview.name}
                onClick={() => onApply(preview.name.toLowerCase())}
                className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Image
                  src={preview.url}
                  alt={preview.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-3">
                  <p className="text-white text-sm font-medium">{preview.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 