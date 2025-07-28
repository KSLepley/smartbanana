import React, { useState } from 'react';
import { ShoppingCart, MapPin, DollarSign } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { LocationFilter } from './components/LocationFilter';
import { PriceComparison } from './components/PriceComparison';
import { PopularItems } from './components/PopularItems';
import { GroceryItem, SearchFilters, SearchResult, StoreItem } from './types';
import { GroceryService } from './services/groceryService';

function App() {
  const [selectedItem, setSelectedItem] = useState<GroceryItem | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<SearchFilters>({
    zipCode: '78701',
    radius: 10,
    maxPrice: undefined,
    inStockOnly: false
  });

  const handleItemSelect = async (item: GroceryItem) => {
    setSelectedItem(item);
    setError(null);
    setIsLoading(true);

    try {
      const result = await GroceryService.getItemPrices(item.id, filters);
      if (result) {
        setSearchResult(result);
      } else {
        setError('No prices found for this item in your area.');
      }
    } catch (err) {
      setError('Failed to load price information. Please try again.');
      console.error('Error fetching prices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = async (newFilters: SearchFilters) => {
    setFilters(newFilters);
    
    // Re-fetch prices if an item is selected
    if (selectedItem) {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await GroceryService.getItemPrices(selectedItem.id, newFilters);
        if (result) {
          setSearchResult(result);
        } else {
          setError('No prices found for this item in your area.');
        }
      } catch (err) {
        setError('Failed to load price information. Please try again.');
        console.error('Error fetching prices:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStoreSelect = (storeItem: StoreItem) => {
    // In a real app, this could open directions, store website, etc.
    alert(`Selected ${storeItem.store.name} - ${storeItem.item.name} for $${storeItem.priceInfo.price.toFixed(2)}`);
  };

  const clearSearch = () => {
    setSelectedItem(null);
    setSearchResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-8 w-8 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900">GroceryFinder</h1>
              </div>
              <span className="text-sm text-gray-500">Find the best prices near you</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{filters.zipCode}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>{filters.radius} mi radius</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <LocationFilter 
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
            
            <PopularItems onItemSelect={handleItemSelect} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Section */}
            <div className="card">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Find the Best Grocery Prices
                </h2>
                <p className="text-gray-600">
                  Search for items and compare prices across local stores
                </p>
              </div>
              
              <SearchBar 
                onItemSelect={handleItemSelect}
                placeholder="Search for groceries, brands, or categories..."
              />
              
              {selectedItem && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Selected:</span>
                    <span className="font-medium text-gray-900">{selectedItem.name}</span>
                  </div>
                  <button
                    onClick={clearSearch}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Results Section */}
            {isLoading && (
              <div className="card text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching for prices...</p>
              </div>
            )}

            {error && (
              <div className="card">
                <div className="text-center py-8">
                  <div className="text-red-500 mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                  <p className="text-gray-600">{error}</p>
                  <button
                    onClick={clearSearch}
                    className="mt-4 btn-primary"
                  >
                    Try a Different Search
                  </button>
                </div>
              </div>
            )}

            {searchResult && !isLoading && !error && (
              <PriceComparison 
                searchResult={searchResult}
                onStoreSelect={handleStoreSelect}
              />
            )}

            {/* Welcome State */}
            {!selectedItem && !isLoading && !error && (
              <div className="card text-center py-12">
                <div className="max-w-md mx-auto">
                  <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to Save on Groceries?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Search for any grocery item above to see prices from stores near you. 
                    We'll help you find the best deals!
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl mb-1">🔍</div>
                      <div className="font-medium text-gray-900">Search</div>
                      <div className="text-gray-500">Find items</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">💰</div>
                      <div className="font-medium text-gray-900">Compare</div>
                      <div className="text-gray-500">See prices</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🏪</div>
                      <div className="font-medium text-gray-900">Save</div>
                      <div className="text-gray-500">Best deals</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>GroceryFinder - Find the best grocery prices in your area</p>
            <p className="mt-2">
              Demo app - Prices and store data are simulated for demonstration purposes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
