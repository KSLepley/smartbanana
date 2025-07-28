import { Store, GroceryItem, PriceInfo, SearchFilters, SearchResult, StoreItem } from '../types';

// Mock data for demonstration
const mockStores: Store[] = [
  {
    id: '1',
    name: 'Walmart Supercenter',
    chain: 'Walmart',
    address: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    latitude: 30.2672,
    longitude: -97.7431,
    phone: '(512) 555-0100',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: '2',
    name: 'HEB Central Market',
    chain: 'HEB',
    address: '456 Oak Ave',
    city: 'Austin',
    state: 'TX',
    zipCode: '78702',
    latitude: 30.2672,
    longitude: -97.7431,
    phone: '(512) 555-0200',
    hours: '7:00 AM - 10:00 PM'
  },
  {
    id: '3',
    name: 'Whole Foods Market',
    chain: 'Whole Foods',
    address: '789 Lamar Blvd',
    city: 'Austin',
    state: 'TX',
    zipCode: '78703',
    latitude: 30.2672,
    longitude: -97.7431,
    phone: '(512) 555-0300',
    hours: '7:00 AM - 9:00 PM'
  },
  {
    id: '4',
    name: 'Target',
    chain: 'Target',
    address: '321 Congress Ave',
    city: 'Austin',
    state: 'TX',
    zipCode: '78704',
    latitude: 30.2672,
    longitude: -97.7431,
    phone: '(512) 555-0400',
    hours: '8:00 AM - 10:00 PM'
  },
  {
    id: '5',
    name: 'Trader Joe\'s',
    chain: 'Trader Joe\'s',
    address: '654 Guadalupe St',
    city: 'Austin',
    state: 'TX',
    zipCode: '78705',
    latitude: 30.2672,
    longitude: -97.7431,
    phone: '(512) 555-0500',
    hours: '8:00 AM - 9:00 PM'
  }
];

const mockItems: GroceryItem[] = [
  {
    id: '1',
    name: 'Bananas',
    brand: 'Chiquita',
    category: 'Produce',
    size: '1 lb',
    unit: 'lb',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200'
  },
  {
    id: '2',
    name: 'Milk',
    brand: 'Organic Valley',
    category: 'Dairy',
    size: '1 gallon',
    unit: 'gallon',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200'
  },
  {
    id: '3',
    name: 'Bread',
    brand: 'Sara Lee',
    category: 'Bakery',
    size: '20 oz',
    unit: 'loaf',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200'
  },
  {
    id: '4',
    name: 'Chicken Breast',
    brand: 'Perdue',
    category: 'Meat',
    size: '1 lb',
    unit: 'lb',
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200'
  },
  {
    id: '5',
    name: 'Eggs',
    brand: 'Eggland\'s Best',
    category: 'Dairy',
    size: '12 count',
    unit: 'dozen',
    imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200'
  }
];

// Generate mock price data
const generateMockPrices = (): PriceInfo[] => {
  const prices: PriceInfo[] = [];
  
  mockStores.forEach(store => {
    mockItems.forEach(item => {
      const basePrice = Math.random() * 5 + 1; // Random price between $1-$6
      const saleChance = Math.random();
      
      prices.push({
        id: `${store.id}-${item.id}`,
        storeId: store.id,
        itemId: item.id,
        price: basePrice,
        unitPrice: basePrice,
        unit: item.unit,
        salePrice: saleChance > 0.7 ? basePrice * 0.8 : undefined,
        saleEndDate: saleChance > 0.7 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        inStock: Math.random() > 0.1, // 90% chance of being in stock
        lastUpdated: new Date().toISOString()
      });
    });
  });
  
  return prices;
};

const mockPrices = generateMockPrices();

export class GroceryService {
  // Search for items by name
  static async searchItems(query: string): Promise<GroceryItem[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const lowercaseQuery = query.toLowerCase();
    return mockItems.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.brand?.toLowerCase().includes(lowercaseQuery) ||
      item.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get stores within radius of zipcode
  static async getStoresNearZipcode(zipCode: string, radius: number): Promise<Store[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // For demo purposes, return all stores if zipcode is in Austin area
    if (zipCode.startsWith('787')) {
      return mockStores.map(store => ({
        ...store,
        distance: Math.random() * radius // Random distance within radius
      }));
    }
    
    return [];
  }

  // Get prices for an item across stores
  static async getItemPrices(itemId: string, filters: SearchFilters): Promise<SearchResult | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const item = mockItems.find(i => i.id === itemId);
    if (!item) return null;

    const stores = await this.getStoresNearZipcode(filters.zipCode, filters.radius);
    const itemPrices = mockPrices.filter(p => p.itemId === itemId && stores.some(s => s.id === p.storeId));
    
    if (itemPrices.length === 0) return null;

    const storeItems: StoreItem[] = itemPrices.map(price => {
      const store = stores.find(s => s.id === price.storeId)!;
      return { store, item, priceInfo: price };
    });

    // Filter by max price if specified
    const filteredStoreItems = filters.maxPrice 
      ? storeItems.filter(si => si.priceInfo.price <= filters.maxPrice!)
      : storeItems;

    // Filter by stock if specified
    const finalStoreItems = filters.inStockOnly
      ? filteredStoreItems.filter(si => si.priceInfo.inStock)
      : filteredStoreItems;

    const prices = finalStoreItems.map(si => si.priceInfo.price);
    const bestPrice = finalStoreItems.reduce((best, current) => 
      current.priceInfo.price < best.priceInfo.price ? current : best
    ).priceInfo;

    return {
      item,
      stores: finalStoreItems,
      bestPrice,
      averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      }
    };
  }

  // Get popular items (for demo purposes)
  static async getPopularItems(): Promise<GroceryItem[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockItems.slice(0, 5);
  }

  // Get categories
  static async getCategories(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...new Set(mockItems.map(item => item.category))];
  }
} 