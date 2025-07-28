export interface Store {
  id: string;
  name: string;
  chain: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  distance?: number; // Distance from user's location
  phone?: string;
  hours?: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  brand?: string;
  category: string;
  size?: string;
  unit?: string;
  imageUrl?: string;
  barcode?: string;
}

export interface PriceInfo {
  id: string;
  storeId: string;
  itemId: string;
  price: number;
  unitPrice?: number; // Price per unit (e.g., per ounce)
  unit?: string;
  salePrice?: number;
  saleEndDate?: string;
  inStock: boolean;
  lastUpdated: string;
}

export interface StoreItem {
  store: Store;
  item: GroceryItem;
  priceInfo: PriceInfo;
}

export interface SearchFilters {
  zipCode: string;
  radius: number; // in miles
  category?: string;
  maxPrice?: number;
  inStockOnly?: boolean;
}

export interface SearchResult {
  item: GroceryItem;
  stores: StoreItem[];
  bestPrice: PriceInfo;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  zipCode: string;
} 