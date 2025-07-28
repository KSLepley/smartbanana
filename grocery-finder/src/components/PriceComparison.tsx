import React from 'react';
import { MapPin, Phone, Clock, Star, TrendingDown } from 'lucide-react';
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
      <div className="card">
        <div className="flex items-start space-x-4">
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
            <div className="text-gray-600 mt-1">
              {item.brand && <span className="font-medium">{item.brand}</span>}
              {item.brand && item.category && <span> • </span>}
              <span>{item.category}</span>
              {item.size && <span> • {item.size}</span>}
            </div>
            
            {/* Price Summary */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-gray-500">Best Price</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(priceRange.min)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Average</div>
                <div className="text-xl font-semibold text-gray-900">
                  {formatPrice(averagePrice)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Price Range</div>
                <div className="text-lg font-medium text-gray-900">
                  {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Listings */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Available at {stores.length} stores
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
                className={`card cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isBestPrice ? 'ring-2 ring-green-500 bg-green-50' : ''
                }`}
                onClick={() => onStoreSelect?.(storeItem)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Store Info */}
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getStoreIcon(store.chain)}</div>
                      <div>
                        <div className="font-semibold text-gray-900">{store.name}</div>
                        <div className="text-sm text-gray-600">{store.chain}</div>
                      </div>
                    </div>

                    {/* Store Details */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{store.distance?.toFixed(1)} mi</span>
                      </div>
                      {store.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{store.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price Info */}
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {hasSale && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <TrendingDown className="h-4 w-4" />
                          <span className="text-sm">SALE</span>
                        </div>
                      )}
                      {isBestPrice && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Star className="h-4 w-4" />
                          <span className="text-sm font-medium">BEST</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-1">
                      {hasSale ? (
                        <div>
                          <span className="text-lg line-through text-gray-400">
                            {formatPrice(priceInfo.price)}
                          </span>
                          <div className="text-xl font-bold text-red-600">
                            {formatPrice(priceInfo.salePrice!)}
                          </div>
                        </div>
                      ) : (
                        <div className={`text-2xl font-bold ${getPriceColor(priceInfo.price)}`}>
                          {formatPrice(priceInfo.price)}
                        </div>
                      )}
                      
                      {priceInfo.unit && (
                        <div className="text-sm text-gray-500">
                          per {priceInfo.unit}
                        </div>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="mt-2">
                      {priceInfo.inStock ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Store Address and Hours */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{store.address}, {store.city}, {store.state} {store.zipCode}</span>
                    </div>
                    {store.hours && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{store.hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}; 