import React from 'react';
import { MapPin, Phone, Clock, Star, TrendingDown, Sparkles, Award, Navigation } from 'lucide-react';
import { SearchResult, StoreItem } from '../types';

interface PriceComparisonProps {
  searchResult: SearchResult;
  onStoreSelect?: (storeItem: StoreItem) => void;
}

export const PriceComparison: React.FC<PriceComparisonProps> = ({
  searchResult,
  onStoreSelect
}) => {
  const { item, stores, averagePrice, priceRange } = searchResult;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getPriceColor = (price: number) => {
    if (price === priceRange.min) return 'text-green-600 font-semibold';
    if (price <= averagePrice) return 'text-gray-900';
    return 'text-gray-500';
  };

  const getStoreIcon = (chain: string) => {
    const chainLower = chain.toLowerCase();
    if (chainLower.includes('walmart')) return '🛒';
    if (chainLower.includes('heb')) return '🛒';
    if (chainLower.includes('whole foods')) return '🥬';
    if (chainLower.includes('target')) return '🎯';
    if (chainLower.includes('trader joe')) return '🛒';
    return '🏪';
  };

  return (
    <div className="space-y-6">
      {/* Item Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-6">
        <div className="flex items-start space-x-6">
          <div className="relative">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-2xl shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            )}
            {stores.length > 0 && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                {stores.length} stores
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              {item.name}
            </h2>
            <div className="flex items-center space-x-3 mb-4">
              {item.brand && (
                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {item.brand}
                </span>
              )}
              <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                {item.category}
              </span>
              {item.size && (
                <span className="text-gray-600 text-sm font-medium">{item.size}</span>
              )}
            </div>
            
            {/* Price Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="text-gray-600 text-sm font-medium mb-1">Best Price</div>
                <div className="text-3xl font-bold text-green-600">
                  {formatPrice(priceRange.min)}
                </div>
              </div>
              <div className="text-center bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                <div className="text-gray-600 text-sm font-medium mb-1">Average</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatPrice(averagePrice)}
                </div>
              </div>
              <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <div className="text-gray-600 text-sm font-medium mb-1">Price Range</div>
                <div className="text-lg font-bold text-purple-600">
                  {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Listings */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <Award className="h-6 w-6 text-orange-500" />
          <span>Available at {stores.length} stores</span>
        </h3>
        
        {stores
          .sort((a, b) => a.priceInfo.price - b.priceInfo.price)
          .map((storeItem, index) => {
            const { store, priceInfo } = storeItem;
            const isBestPrice = priceInfo.price === priceRange.min;
            const hasSale = priceInfo.salePrice !== undefined;
            
            return (
              <div
                key={store.id}
                className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                  isBestPrice 
                    ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50' 
                    : 'border-orange-100 hover:border-orange-200'
                }`}
                onClick={() => onStoreSelect?.(storeItem)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 flex-1">
                      {/* Store Info */}
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{getStoreIcon(store.chain)}</div>
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{store.name}</div>
                          <div className="text-sm text-gray-600 font-medium">{store.chain}</div>
                        </div>
                      </div>

                      {/* Store Details */}
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                          <MapPin className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">{store.distance?.toFixed(1)} mi</span>
                        </div>
                        {store.phone && (
                          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                            <Phone className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{store.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price Info */}
                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-3 mb-2">
                        {hasSale && (
                          <div className="flex items-center space-x-1 bg-red-100 text-red-700 px-3 py-1 rounded-full">
                            <TrendingDown className="h-4 w-4" />
                            <span className="text-sm font-bold">SALE</span>
                          </div>
                        )}
                        {isBestPrice && (
                          <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                            <Star className="h-4 w-4" />
                            <span className="text-sm font-bold">BEST PRICE</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-3">
                        {hasSale ? (
                          <div>
                            <span className="text-xl line-through text-gray-400">
                              {formatPrice(priceInfo.price)}
                            </span>
                            <div className="text-3xl font-bold text-red-600">
                              {formatPrice(priceInfo.salePrice!)}
                            </div>
                          </div>
                        ) : (
                          <div className={`text-3xl font-bold ${getPriceColor(priceInfo.price)}`}>
                            {formatPrice(priceInfo.price)}
                          </div>
                        )}
                        
                        {priceInfo.unit && (
                          <div className="text-sm text-gray-500 font-medium">
                            per {priceInfo.unit}
                          </div>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="mb-3">
                        {priceInfo.inStock ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                            ✓ In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800">
                            ✗ Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <button className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center space-x-2">
                        <Navigation className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>

                  {/* Store Address and Hours */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">{store.address}, {store.city}, {store.state} {store.zipCode}</span>
                      </div>
                      {store.hours && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{store.hours}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}; 