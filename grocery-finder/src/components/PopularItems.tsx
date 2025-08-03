import React, { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, Star } from 'lucide-react';
import { GroceryItem } from '../types';
import { GroceryService } from '../services/groceryService';

interface PopularItemsProps {
  onItemSelect: (item: GroceryItem) => void;
}

export const PopularItems: React.FC<PopularItemsProps> = ({ onItemSelect }) => {
  const [popularItems, setPopularItems] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPopularItems = async () => {
      try {
        const items = await GroceryService.getPopularItems();
        setPopularItems(items);
      } catch (error) {
        console.error('Error loading popular items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPopularItems();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="h-6 w-6 text-orange-500" />
          <h3 className="text-xl font-bold text-gray-900">Popular Items</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-200 rounded-xl h-16 w-16"></div>
                <div className="flex-1 space-y-2">
                  <div className="bg-gray-200 rounded h-4 w-3/4"></div>
                  <div className="bg-gray-200 rounded h-3 w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="relative">
          <TrendingUp className="h-6 w-6 text-orange-500" />
          <Star className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Popular Items</h3>
      </div>
      
      <div className="space-y-4">
        {popularItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onItemSelect(item)}
            className="w-full group text-left hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-orange-200"
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-110">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                )}
                {index < 3 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    #{index + 1}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors duration-200 truncate">
                  {item.name}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  {item.brand && (
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      {item.brand}
                    </span>
                  )}
                  <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    {item.category}
                  </span>
                </div>
                {item.size && (
                  <div className="text-xs text-gray-500 mt-1 font-medium">
                    {item.size}
                  </div>
                )}
              </div>
              <div className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-orange-200">
        <p className="text-xs text-gray-500 text-center">
          Based on recent searches and popular items in your area
        </p>
      </div>
    </div>
  );
}; 