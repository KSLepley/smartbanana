import React, { useState } from 'react';
import { MapPin, Filter, X } from 'lucide-react';
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
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Location & Filters</h3>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Zip Code Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zip Code
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={filters.zipCode}
              onChange={(e) => handleZipCodeChange(e.target.value)}
              placeholder="Enter zip code"
              className="input-field pl-10"
              maxLength={5}
            />
          </div>
        </div>

        {/* Search Radius */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Radius: {filters.radius} miles
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={filters.radius}
            onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 mile</span>
            <span>50 miles</span>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Price
              </label>
              <input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => handleMaxPriceChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="No limit"
                className="input-field"
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="inStockOnly"
                checked={filters.inStockOnly}
                onChange={(e) => handleInStockOnlyChange(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="inStockOnly" className="ml-2 block text-sm text-gray-900">
                Show only items in stock
              </label>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <X className="h-4 w-4" />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 