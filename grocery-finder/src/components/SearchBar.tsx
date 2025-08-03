import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { GroceryItem } from '../types';
import { GroceryService } from '../services/groceryService';

interface SearchBarProps {
  onItemSelect: (item: GroceryItem) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onItemSelect, 
  placeholder = "Search for groceries..." 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchItems = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await GroceryService.searchItems(query);
        setResults(searchResults);
        setShowDropdown(searchResults.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchItems, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleItemSelect = (item: GroceryItem) => {
    onItemSelect(item);
    setQuery(item.name);
    setShowDropdown(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto" ref={searchRef}>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 h-5 w-5">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-12 py-4 text-lg bg-white/80 backdrop-blur-sm border-2 border-orange-200 rounded-2xl shadow-lg focus:border-orange-400 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all duration-200 placeholder-gray-400"
          onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-md border border-orange-200 rounded-2xl shadow-2xl max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-500 mx-auto mb-3"></div>
              <p className="text-gray-600 font-medium">Searching for items...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleItemSelect(item)}
                  className="w-full p-4 text-left hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 border-b border-orange-100 last:border-b-0 flex items-center space-x-4 transition-all duration-200 group"
                >
                  <div className="relative">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.brand && (
                        <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs mr-2">
                          {item.brand}
                        </span>
                      )}
                      <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs mr-2">
                        {item.category}
                      </span>
                      {item.size && (
                        <span className="text-gray-600">{item.size}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="text-gray-400 mb-3">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-600 font-medium">No items found</p>
              <p className="text-gray-500 text-sm mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 