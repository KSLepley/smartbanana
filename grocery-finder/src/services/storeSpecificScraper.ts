import { Store, GroceryItem } from '../types';
import WebScraperService from './webScraperService';

// Store-specific scraping configuration
interface StoreLocationConfig {
  storeChain: string;
  locationUrl: string;
  locationSelector: string;
  priceSelectors: {
    regular: string;
    sale?: string;
    unit?: string;
  };
  stockSelectors: {
    inStock: string;
    outOfStock?: string;
  };
  requiresLocation: boolean;
  locationMethod: 'zipcode' | 'storeId' | 'coordinates';
  sessionRequired: boolean;
}

// Location-based scraping result
interface LocationScrapingResult {
  success: boolean;
  price?: number;
  salePrice?: number;
  unitPrice?: number;
  inStock: boolean;
  location: string;
  lastUpdated: string;
  source: string;
  error?: string;
}

class StoreSpecificScraper {
  private static instance: StoreSpecificScraper;
  private webScraper: WebScraperService;
  private storeConfigs: Map<string, StoreLocationConfig>;

  private constructor() {
    this.webScraper = WebScraperService.getInstance();
    this.storeConfigs = new Map();
    this.initializeStoreConfigs();
  }

  static getInstance(): StoreSpecificScraper {
    if (!StoreSpecificScraper.instance) {
      StoreSpecificScraper.instance = new StoreSpecificScraper();
    }
    return StoreSpecificScraper.instance;
  }

  // Initialize store-specific configurations
  private initializeStoreConfigs(): void {
    // Walmart - Location-based pricing
    this.storeConfigs.set('Walmart', {
      storeChain: 'Walmart',
      locationUrl: 'https://www.walmart.com/store/{storeId}',
      locationSelector: '.store-info',
      priceSelectors: {
        regular: '[data-price-type="finalPrice"] .price-characteristic',
        sale: '[data-price-type="finalPrice"] .price-characteristic',
        unit: '[data-price-type="unitPrice"] .price-characteristic'
      },
      stockSelectors: {
        inStock: '[data-testid="fulfillment-shipping"]',
        outOfStock: '[data-testid="fulfillment-unavailable"]'
      },
      requiresLocation: true,
      locationMethod: 'storeId',
      sessionRequired: true
    });

    // Target - Location-based pricing
    this.storeConfigs.set('Target', {
      storeChain: 'Target',
      locationUrl: 'https://www.target.com/store-locator/find-stores/{zipcode}',
      locationSelector: '.store-location',
      priceSelectors: {
        regular: '[data-test="product-price"]',
        sale: '[data-test="product-price-sale"]',
        unit: '[data-test="product-price-unit"]'
      },
      stockSelectors: {
        inStock: '[data-test="shipItButton"]',
        outOfStock: '[data-test="outOfStockButton"]'
      },
      requiresLocation: true,
      locationMethod: 'zipcode',
      sessionRequired: false
    });

    // Kroger - Location-based pricing
    this.storeConfigs.set('Kroger', {
      storeChain: 'Kroger',
      locationUrl: 'https://www.kroger.com/store/{storeId}',
      locationSelector: '.store-details',
      priceSelectors: {
        regular: '.price-value',
        sale: '.price-sale',
        unit: '.price-unit'
      },
      stockSelectors: {
        inStock: '.product-availability',
        outOfStock: '.product-unavailable'
      },
      requiresLocation: true,
      locationMethod: 'storeId',
      sessionRequired: true
    });

    // Safeway - Location-based pricing
    this.storeConfigs.set('Safeway', {
      storeChain: 'Safeway',
      locationUrl: 'https://www.safeway.com/store/{storeId}',
      locationSelector: '.store-info',
      priceSelectors: {
        regular: '.product-price',
        sale: '.product-price-sale',
        unit: '.product-price-unit'
      },
      stockSelectors: {
        inStock: '.product-availability',
        outOfStock: '.product-unavailable'
      },
      requiresLocation: true,
      locationMethod: 'storeId',
      sessionRequired: true
    });

    // Whole Foods - Location-based pricing
    this.storeConfigs.set('Whole Foods', {
      storeChain: 'Whole Foods',
      locationUrl: 'https://www.wholefoodsmarket.com/stores/{storeId}',
      locationSelector: '.store-details',
      priceSelectors: {
        regular: '.product-price',
        sale: '.product-price-sale',
        unit: '.product-price-unit'
      },
      stockSelectors: {
        inStock: '.product-availability',
        outOfStock: '.product-unavailable'
      },
      requiresLocation: true,
      locationMethod: 'storeId',
      sessionRequired: false
    });

    // Publix - Location-based pricing
    this.storeConfigs.set('Publix', {
      storeChain: 'Publix',
      locationUrl: 'https://www.publix.com/store/{storeId}',
      locationSelector: '.store-info',
      priceSelectors: {
        regular: '.product-price',
        sale: '.product-price-sale',
        unit: '.product-price-unit'
      },
      stockSelectors: {
        inStock: '.product-availability',
        outOfStock: '.product-unavailable'
      },
      requiresLocation: true,
      locationMethod: 'storeId',
      sessionRequired: true
    });

    // HEB - Location-based pricing
    this.storeConfigs.set('HEB', {
      storeChain: 'HEB',
      locationUrl: 'https://www.heb.com/store/{storeId}',
      locationSelector: '.store-details',
      priceSelectors: {
        regular: '.product-price',
        sale: '.product-price-sale',
        unit: '.product-price-unit'
      },
      stockSelectors: {
        inStock: '.product-availability',
        outOfStock: '.product-unavailable'
      },
      requiresLocation: true,
      locationMethod: 'storeId',
      sessionRequired: true
    });
  }

  // Get location-based price for a specific store
  async getLocationBasedPrice(store: Store, item: GroceryItem): Promise<LocationScrapingResult> {
    const config = this.storeConfigs.get(store.chain);
    if (!config) {
      return {
        success: false,
        inStock: false,
        location: store.address,
        lastUpdated: new Date().toISOString(),
        source: store.chain,
        error: 'Store configuration not found'
      };
    }

    try {
      // Build location-specific URL
      const locationUrl = this.buildLocationUrl(config, store);
      
      // Get location-specific price
      const result = await this.scrapeLocationBasedPrice(config, locationUrl, item, store);
      
      return {
        ...result,
        location: store.address,
        source: store.chain
      };
    } catch (error) {
      console.error(`Error scraping location-based price for ${store.chain}:`, error);
      return {
        success: false,
        inStock: false,
        location: store.address,
        lastUpdated: new Date().toISOString(),
        source: store.chain,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Build location-specific URL
  private buildLocationUrl(config: StoreLocationConfig, store: Store): string {
    let url = config.locationUrl;
    
    switch (config.locationMethod) {
      case 'storeId':
        url = url.replace('{storeId}', store.id);
        break;
      case 'zipcode':
        url = url.replace('{zipcode}', store.zipCode);
        break;
      case 'coordinates':
        url = url.replace('{lat}', store.latitude.toString());
        url = url.replace('{lng}', store.longitude.toString());
        break;
    }
    
    return url;
  }

  // Scrape location-based price
  private async scrapeLocationBasedPrice(
    config: StoreLocationConfig, 
    url: string, 
    item: GroceryItem, 
    store: Store
  ): Promise<LocationScrapingResult> {
    
    // For now, we'll simulate location-based scraping
    // In a real implementation, this would:
    // 1. Navigate to the store's location page
    // 2. Set the store location
    // 3. Search for the specific item
    // 4. Extract location-specific pricing
    
    console.log(`Would scrape location-based price from ${url} for ${item.name} at ${store.name}`);
    
    // Simulate location-based price variation
    const basePrice = this.getBasePriceForItem(item);
    const locationMultiplier = this.getLocationMultiplier(store.state);
    const price = Math.round((basePrice * locationMultiplier) * 100) / 100;
    
    // Simulate sale price (20% chance)
    const salePrice = Math.random() > 0.8 ? Math.round((price * 0.8) * 100) / 100 : undefined;
    
    // Simulate unit price
    const unitPrice = item.unit ? Math.round((price / this.getUnitDivisor(item.unit)) * 100) / 100 : undefined;
    
    return {
      success: true,
      price,
      salePrice,
      unitPrice,
      inStock: Math.random() > 0.1, // 90% chance of being in stock
      location: store.address,
      lastUpdated: new Date().toISOString(),
      source: config.storeChain
    };
  }

  // Get base price for item
  private getBasePriceForItem(item: GroceryItem): number {
    const basePrices: { [key: string]: number } = {
      'milk-organic-valley-whole': 6.99,
      'milk-horizon-2percent': 4.49,
      'milk-fairlife-ultra-filtered': 5.99,
      'eggs-egglands-best-large': 4.99,
      'eggs-vital-farms-pasture-raised': 7.99,
      'bread-wonder-classic': 3.49,
      'bread-sara-lee-wheat': 3.99,
      'bread-arnold-oatnut': 4.49,
      'bread-pepperidge-farm-sourdough': 4.99,
      'bagels-thomas-plain': 3.99,
      'cheese-tillamook-cheddar': 4.99,
      'yogurt-chobani-greek-vanilla': 1.49,
      'chicken-perdue-breast-boneless': 8.99,
      'chicken-tyson-tenders': 12.99,
      'beef-ground-80-20': 6.99,
      'bacon-oscar-mayer-thick-cut': 7.99,
      'salmon-wild-alaskan': 14.99,
      'bananas-chiquita-organic': 1.99,
      'apples-gala-organic': 4.99,
      'tomatoes-roma': 2.99,
      'lettuce-romaine-hearts': 3.99,
      'avocados-hass-organic': 5.99,
      'pasta-barilla-spaghetti': 2.49,
      'rice-mahatma-long-grain': 8.99,
      'cereal-cheerios-original': 4.99,
      'cereal-frosted-flakes': 4.49,
      'peanut-butter-jif-creamy': 3.99,
      'chips-lays-classic': 4.99,
      'soda-coca-cola-classic': 6.99,
      'water-aquafina-bottles': 4.99
    };

    return basePrices[item.id] || 3.99;
  }

  // Get location multiplier based on state
  private getLocationMultiplier(state: string): number {
    const stateMultipliers: { [key: string]: number } = {
      // High cost of living states
      'CA': 1.25, 'NY': 1.20, 'MA': 1.18, 'CT': 1.15, 'NJ': 1.15,
      'WA': 1.12, 'OR': 1.10, 'CO': 1.08, 'VT': 1.05, 'MD': 1.05,
      
      // Medium cost of living states
      'IL': 1.02, 'PA': 1.00, 'VA': 1.00, 'NC': 0.98, 'GA': 0.95,
      'FL': 0.95, 'TX': 0.92, 'OH': 0.90, 'MI': 0.90, 'WI': 0.88,
      
      // Lower cost of living states
      'TN': 0.85, 'KY': 0.85, 'IN': 0.85, 'MO': 0.85, 'AR': 0.82,
      'LA': 0.82, 'MS': 0.80, 'AL': 0.80, 'SC': 0.82, 'WV': 0.80,
      
      // Default for other states
      'default': 0.95
    };

    return stateMultipliers[state] || stateMultipliers['default'];
  }

  // Get unit divisor for unit price calculation
  private getUnitDivisor(unit: string): number {
    const unitDivisors: { [key: string]: number } = {
      'lb': 1,
      'oz': 16,
      'g': 453.592,
      'kg': 0.453592,
      'fl oz': 128,
      'gallon': 1,
      'half-gallon': 0.5,
      'quart': 0.25,
      'pint': 0.125,
      'cup': 0.0625,
      'count': 1,
      'pack': 1,
      'box': 1,
      'bag': 1,
      'jar': 1,
      'bottle': 1,
      'dozen': 12
    };

    return unitDivisors[unit] || 1;
  }

  // Get prices from multiple stores with location-based pricing
  async getLocationBasedPricesFromMultipleStores(
    stores: Store[], 
    item: GroceryItem
  ): Promise<Map<string, LocationScrapingResult>> {
    const results = new Map<string, LocationScrapingResult>();
    
    // Process stores sequentially to respect rate limits
    for (const store of stores) {
      try {
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const result = await this.getLocationBasedPrice(store, item);
        results.set(store.id, result);
      } catch (error) {
        console.error(`Error scraping location-based price for ${store.chain}:`, error);
        results.set(store.id, {
          success: false,
          inStock: false,
          location: store.address,
          lastUpdated: new Date().toISOString(),
          source: store.chain,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  // Get store location information
  async getStoreLocationInfo(store: Store): Promise<{
    storeId: string;
    locationUrl: string;
    available: boolean;
  }> {
    const config = this.storeConfigs.get(store.chain);
    if (!config) {
      return {
        storeId: store.id,
        locationUrl: '',
        available: false
      };
    }

    const locationUrl = this.buildLocationUrl(config, store);
    
    return {
      storeId: store.id,
      locationUrl,
      available: config.requiresLocation
    };
  }

  // Check if store supports location-based pricing
  supportsLocationBasedPricing(storeChain: string): boolean {
    const config = this.storeConfigs.get(storeChain);
    return config?.requiresLocation || false;
  }

  // Get supported store chains
  getSupportedStoreChains(): string[] {
    return Array.from(this.storeConfigs.keys());
  }

  // Update store configuration
  updateStoreConfig(storeChain: string, config: Partial<StoreLocationConfig>): void {
    const existingConfig = this.storeConfigs.get(storeChain);
    if (existingConfig) {
      this.storeConfigs.set(storeChain, { ...existingConfig, ...config });
    }
  }

  // Add new store configuration
  addStoreConfig(config: StoreLocationConfig): void {
    this.storeConfigs.set(config.storeChain, config);
  }

  // Get scraping statistics
  getScrapingStats(): { [key: string]: { requests: number; lastRequest: number } } {
    return this.webScraper.getScrapingStats();
  }
}

export default StoreSpecificScraper; 