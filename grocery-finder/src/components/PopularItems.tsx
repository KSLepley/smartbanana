import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
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
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Popular Items</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-20 mb-2"></div>
              <div className="bg-gray-200 rounded h-4 mb-1"></div>
              <div className="bg-gray-200 rounded h-3 w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Popular Items</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {popularItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemSelect(item)}
            className="group text-left hover:bg-gray-50 rounded-lg p-3 transition-colors duration-200"
          >
            {item.imageUrl && (
              <div className="relative mb-3">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-20 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            )}
            <div className="font-medium text-gray-900 text-sm group-hover:text-primary-600 transition-colors duration-200">
              {item.name}
            </div>
            <div className="text-xs text-gray-500">
              {item.brand && `${item.brand} • `}
              {item.size}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}; 