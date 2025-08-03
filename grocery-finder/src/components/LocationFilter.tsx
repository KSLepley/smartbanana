import React, { useState } from 'react';
import { MapPin, X, Settings, Target, DollarSign } from 'lucide-react';
import { SearchFilters } from '../types';

interface LocationFilterProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export const LocationFilter: React.FC<LocationFilterProps> = ({
  filters,
  onFiltersChange
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleZipCodeChange = (zipCode: string) => {
    onFiltersChange({ ...filters, zipCode });
  };

  const handleRadiusChange = (radius: number) => {
    onFiltersChange({ ...filters, radius });
  };

  const handleMaxPriceChange = (maxPrice: number | undefined) => {
    onFiltersChange({ ...filters, maxPrice });
  };

  const handleInStockOnlyChange = (inStockOnly: boolean) => {
    onFiltersChange({ ...filters, inStockOnly });
  };

  const clearFilters = () => {
    onFiltersChange({
      zipCode: filters.zipCode,
      radius: 10,
      maxPrice: undefined,
      inStockOnly: false
    });
  };

  const hasActiveFilters = filters.maxPrice !== undefined || filters.inStockOnly;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <Target className="h-6 w-6 text-orange-500" />
          <span>Location & Filters</span>
        </h3>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            showAdvancedFilters 
              ? 'bg-orange-100 text-orange-700' 
              : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Zip Code Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span>Zip Code</span>
            </div>
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.zipCode}
              onChange={(e) => handleZipCodeChange(e.target.value)}
              placeholder="Enter zip code"
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-orange-200 rounded-xl shadow-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all placeholder-gray-400"
              maxLength={5}
            />
          </div>
        </div>

        {/* Search Radius */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span>Search Radius</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{filters.radius} miles</span>
            </div>
          </label>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="50"
              value={filters.radius}
              onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${(filters.radius - 1) / 49 * 100}%, #fef3c7 ${(filters.radius - 1) / 49 * 100}%, #fef3c7 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span className="font-medium">1 mile</span>
              <span className="font-medium">50 miles</span>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t border-orange-200 pt-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span>Maximum Price</span>
                </div>
              </label>
              <input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => handleMaxPriceChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="No limit"
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-green-200 rounded-xl shadow-sm focus:border-green-400 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all placeholder-gray-400"
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="inStockOnly"
                checked={filters.inStockOnly}
                onChange={(e) => handleInStockOnlyChange(e.target.checked)}
                className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-orange-300 rounded-lg"
              />
              <label htmlFor="inStockOnly" className="block text-sm font-medium text-gray-900">
                Show only items in stock
              </label>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-red-600 transition-colors w-full justify-center py-2 bg-red-50 hover:bg-red-100 rounded-xl"
              >
                <X className="h-4 w-4" />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        )}

        {/* Quick Radius Presets */}
        <div className="border-t border-orange-200 pt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Quick Radius</label>
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 25].map((radius) => (
              <button
                key={radius}
                onClick={() => handleRadiusChange(radius)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  filters.radius === radius
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700'
                }`}
              >
                {radius} mi
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 