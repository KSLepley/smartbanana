import React, { useState } from 'react';
import { Banana, MapPin, DollarSign, TrendingUp, Sparkles, Search, Star } from 'lucide-react';
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
  const [showAlternatives, setShowAlternatives] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    zipCode: '',
    radius: 10,
    maxPrice: undefined,
    inStockOnly: false
  });

  const handleItemSelect = async (item: GroceryItem) => {
    if (!filters.zipCode.trim()) {
      setError('Please enter a zip code to search for prices.');
      return;
    }
    
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
    alert(`Selected ${storeItem.store.name} - ${storeItem.item.name} for $${storeItem.priceInfo.price.toFixed(2)}`);
  };

  const clearSearch = () => {
    setSelectedItem(null);
    setSearchResult(null);
    setError(null);
    setShowAlternatives(false);
  };

  const getPriceSavings = () => {
    if (!searchResult) return 0;
    const maxPrice = Math.max(...searchResult.stores.map(s => s.priceInfo.price));
    const minPrice = Math.min(...searchResult.stores.map(s => s.priceInfo.price));
    return maxPrice - minPrice;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-orange-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Banana className="h-8 w-8 text-yellow-500" />
                  <Sparkles className="h-4 w-4 text-orange-500 absolute -top-1 -right-1" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    Smart Banana
                  </h1>
                  <p className="text-xs text-gray-500 -mt-1">Your grocery price companion</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-orange-50 px-3 py-1 rounded-full">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span className="font-medium">{filters.zipCode || 'Enter zip code'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="font-medium">{filters.radius} mi radius</span>
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
            {/* Hero Search Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">
                  Find the Best Grocery Deals
                </h2>
                <p className="text-gray-600 text-lg">
                  Compare prices across local stores and discover cheaper alternatives
                </p>
              </div>
              
              <SearchBar 
                onItemSelect={handleItemSelect}
                placeholder="Search for groceries, brands, or categories..."
              />
              
              {selectedItem && (
                <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                      <Banana className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Selected:</span>
                      <p className="font-semibold text-gray-900">{selectedItem.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={clearSearch}
                    className="text-sm text-gray-500 hover:text-gray-700 bg-white px-3 py-1 rounded-full hover:shadow-md transition-all"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Results Section */}
            {isLoading && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto mb-6"></div>
                <p className="text-gray-600 text-lg">Searching for the best prices...</p>
                <p className="text-gray-500 text-sm mt-2">Checking stores in your area</p>
              </div>
            )}

            {error && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-red-100 p-8">
                <div className="text-center">
                  <div className="text-red-500 mb-4">
                    <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <button
                    onClick={clearSearch}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    Try a Different Search
                  </button>
                </div>
              </div>
            )}

            {searchResult && !isLoading && !error && (
              <div className="space-y-6">
                {/* Price Summary Card */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">${searchResult.bestPrice.price.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Best Price</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">${searchResult.averagePrice.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Average Price</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">${getPriceSavings().toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Potential Savings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{searchResult.stores.length}</div>
                      <div className="text-sm text-gray-600">Stores Found</div>
                    </div>
                  </div>
                </div>

                {/* Price Comparison */}
                <PriceComparison 
                  searchResult={searchResult}
                  onStoreSelect={handleStoreSelect}
                />

                {/* Alternatives Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-orange-500" />
                      <span>Smart Alternatives</span>
                    </h3>
                    <button
                      onClick={() => setShowAlternatives(!showAlternatives)}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      {showAlternatives ? 'Hide' : 'Show'} Alternatives
                    </button>
                  </div>
                  
                  {showAlternatives && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-green-700">Cheaper Alternative</span>
                        </div>
                        <p className="text-sm text-gray-600">Generic brand could save you ${(searchResult.averagePrice * 0.3).toFixed(2)}</p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-blue-700">Price Trend</span>
                        </div>
                        <p className="text-sm text-gray-600">Prices typically drop on Tuesdays</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Welcome State */}
            {!selectedItem && !isLoading && !error && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-12 text-center">
                <div className="max-w-2xl mx-auto">
                  <div className="relative mb-8">
                    <Banana className="h-20 w-20 text-yellow-500 mx-auto" />
                    <Sparkles className="h-6 w-6 text-orange-500 absolute top-0 right-1/3 animate-pulse" />
                    <Sparkles className="h-4 w-4 text-yellow-400 absolute bottom-2 left-1/3 animate-pulse delay-1000" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Save on Groceries?
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg">
                    Search for any grocery item to see prices from stores near you. 
                    We'll help you find the best deals and suggest alternatives!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center group">
                      <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Search className="h-8 w-8 text-white" />
                      </div>
                      <div className="font-semibold text-gray-900">Search</div>
                      <div className="text-gray-500 text-sm">Find items</div>
                    </div>
                    <div className="text-center group">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <DollarSign className="h-8 w-8 text-white" />
                      </div>
                      <div className="font-semibold text-gray-900">Compare</div>
                      <div className="text-gray-500 text-sm">See prices</div>
                    </div>
                    <div className="text-center group">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <div className="font-semibold text-gray-900">Save</div>
                      <div className="text-gray-500 text-sm">Best deals</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-orange-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Banana className="h-6 w-6 text-yellow-500" />
              <span className="text-lg font-semibold text-gray-900">Smart Banana</span>
            </div>
            <p className="text-gray-600 mb-2">Your intelligent grocery price companion</p>
            <p className="text-gray-500 text-sm">
              Demo app - Prices and store data are simulated for demonstration purposes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
