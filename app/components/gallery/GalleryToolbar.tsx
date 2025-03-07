import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUp, ArrowDown, Grid, List } from 'react-feather';

interface GalleryToolbarProps {
  onSearch: (query: string) => void;
  onFilter: (tags: string[]) => void;
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  availableTags: string[];
}

export default function GalleryToolbar({
  onSearch,
  onFilter,
  onSort,
  availableTags,
}: GalleryToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, onSearch]);

  useEffect(() => {
    onFilter(selectedTags);
  }, [selectedTags, onFilter]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSort = (field: string) => {
    const newDirection = field === sortField && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortDirection(newDirection);
    onSort(field, newDirection);
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search images..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5" />
            <span>Filter</span>
            {selectedTags.length > 0 && (
              <span className="bg-blue-500 text-white px-2 rounded-full text-sm">
                {selectedTags.length}
              </span>
            )}
          </button>

          {/* Sort Options */}
          <div className="flex gap-2">
            <button
              onClick={() => handleSort('created_at')}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 ${
                sortField === 'created_at' ? 'bg-gray-100' : ''
              }`}
            >
              {sortDirection === 'desc' ? (
                <ArrowDown className="w-5 h-5" />
              ) : (
                <ArrowUp className="w-5 h-5" />
              )}
              <span>Date</span>
            </button>
            <button
              onClick={() => handleSort('name')}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 ${
                sortField === 'name' ? 'bg-gray-100' : ''
              }`}
            >
              {sortDirection === 'desc' ? (
                <ArrowDown className="w-5 h-5" />
              ) : (
                <ArrowUp className="w-5 h-5" />
              )}
              <span>Name</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="mt-4 p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Filter by Tags</h3>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 