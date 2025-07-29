import { PriceInfo, Store, GroceryItem } from '../types';

// Web scraping configuration
interface ScrapingConfig {
  userAgent: string;
  timeout: number;
  retryAttempts: number;
  delayBetweenRequests: number;
  useProxy: boolean;
  proxyList: string[];
  respectRobotsTxt: boolean;
}

// Scraping result
interface ScrapingResult {
  success: boolean;
  price?: number;
  salePrice?: number;
  inStock?: boolean;
  lastUpdated: string;
  source: string;
  error?: string;
}

// Store website configuration
interface StoreWebsiteConfig {
  name: string;
  baseUrl: string;
  searchUrl: string;
  selectors: {
    price: string;
    salePrice?: string;
    inStock: string;
    productName: string;
    productImage?: string;
  };
  searchMethod: 'GET' | 'POST';
  searchParams: Record<string, string>;
  headers?: Record<string, string>;
  requiresJavaScript: boolean;
  rateLimit: number; // requests per minute
}

class WebScraperService {
  private static instance: WebScraperService;
  private config: ScrapingConfig;
  private storeConfigs: Map<string, StoreWebsiteConfig>;
  private requestCounts: Map<string, number[]>;
  private lastRequestTimes: Map<string, number>;

  private constructor() {
    this.config = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      timeout: 10000,
      retryAttempts: 3,
      delayBetweenRequests: 2000,
      useProxy: false,
      proxyList: [],
      respectRobotsTxt: true
    };

    this.storeConfigs = new Map();
    this.requestCounts = new Map();
    this.lastRequestTimes = new Map();
    
    this.initializeStoreConfigs();
  }

  static getInstance(): WebScraperService {
    if (!WebScraperService.instance) {
      WebScraperService.instance = new WebScraperService();
    }
    return WebScraperService.instance;
  }

  // Initialize store website configurations
  private initializeStoreConfigs(): void {
    // Walmart
    this.storeConfigs.set('Walmart', {
      name: 'Walmart',
      baseUrl: 'https://www.walmart.com',
      searchUrl: 'https://www.walmart.com/search',
      selectors: {
        price: '[data-price-type="finalPrice"] .price-characteristic',
        salePrice: '[data-price-type="finalPrice"] .price-characteristic',
        inStock: '[data-testid="fulfillment-shipping"]',
        productName: '[data-testid="product-title"]'
      },
      searchMethod: 'GET',
      searchParams: {
        q: '{query}'
      },
      requiresJavaScript: true,
      rateLimit: 30
    });

    // Target
    this.storeConfigs.set('Target', {
      name: 'Target',
      baseUrl: 'https://www.target.com',
      searchUrl: 'https://www.target.com/s',
      selectors: {
        price: '[data-test="product-price"]',
        salePrice: '[data-test="product-price-sale"]',
        inStock: '[data-test="shipItButton"]',
        productName: '[data-test="product-title"]'
      },
      searchMethod: 'GET',
      searchParams: {
        searchTerm: '{query}'
      },
      requiresJavaScript: true,
      rateLimit: 30
    });

    // Kroger
    this.storeConfigs.set('Kroger', {
      name: 'Kroger',
      baseUrl: 'https://www.kroger.com',
      searchUrl: 'https://www.kroger.com/search',
      selectors: {
        price: '.price-value',
        salePrice: '.price-sale',
        inStock: '.product-availability',
        productName: '.product-name'
      },
      searchMethod: 'GET',
      searchParams: {
        query: '{query}'
      },
      requiresJavaScript: true,
      rateLimit: 20
    });

    // Safeway
    this.storeConfigs.set('Safeway', {
      name: 'Safeway',
      baseUrl: 'https://www.safeway.com',
      searchUrl: 'https://www.safeway.com/shop/search-results.html',
      selectors: {
        price: '.product-price',
        salePrice: '.product-price-sale',
        inStock: '.product-availability',
        productName: '.product-name'
      },
      searchMethod: 'GET',
      searchParams: {
        searchType: 'default',
        'search-bar': '{query}'
      },
      requiresJavaScript: true,
      rateLimit: 25
    });

    // Whole Foods
    this.storeConfigs.set('Whole Foods', {
      name: 'Whole Foods',
      baseUrl: 'https://www.wholefoodsmarket.com',
      searchUrl: 'https://www.wholefoodsmarket.com/search',
      selectors: {
        price: '.product-price',
        salePrice: '.product-price-sale',
        inStock: '.product-availability',
        productName: '.product-name'
      },
      searchMethod: 'GET',
      searchParams: {
        q: '{query}'
      },
      requiresJavaScript: true,
      rateLimit: 20
    });

    // Trader Joe's
    this.storeConfigs.set('Trader Joe\'s', {
      name: 'Trader Joe\'s',
      baseUrl: 'https://www.traderjoes.com',
      searchUrl: 'https://www.traderjoes.com/search',
      selectors: {
        price: '.product-price',
        salePrice: '.product-price-sale',
        inStock: '.product-availability',
        productName: '.product-name'
      },
      searchMethod: 'GET',
      searchParams: {
        q: '{query}'
      },
      requiresJavaScript: true,
      rateLimit: 15
    });

    // Publix
    this.storeConfigs.set('Publix', {
      name: 'Publix',
      baseUrl: 'https://www.publix.com',
      searchUrl: 'https://www.publix.com/shop/search',
      selectors: {
        price: '.product-price',
        salePrice: '.product-price-sale',
        inStock: '.product-availability',
        productName: '.product-name'
      },
      searchMethod: 'GET',
      searchParams: {
        searchTerm: '{query}'
      },
      requiresJavaScript: true,
      rateLimit: 20
    });

    // HEB
    this.storeConfigs.set('HEB', {
      name: 'HEB',
      baseUrl: 'https://www.heb.com',
      searchUrl: 'https://www.heb.com/search',
      selectors: {
        price: '.product-price',
        salePrice: '.product-price-sale',
        inStock: '.product-availability',
        productName: '.product-name'
      },
      searchMethod: 'GET',
      searchParams: {
        q: '{query}'
      },
      requiresJavaScript: true,
      rateLimit: 25
    });

    // Meijer
    this.storeConfigs.set('Meijer', {
      name: 'Meijer',
      baseUrl: 'https://www.meijer.com',
      searchUrl: 'https://www.meijer.com/shopping/search.html',
      selectors: {
        price: '.product-price',
        salePrice: '.product-price-sale',
        inStock: '.product-availability',
        productName: '.product-name'
      },
      searchMethod: 'GET',
      searchParams: {
        search: '{query}'
      },
      requiresJavaScript: true,
      rateLimit: 20
    });
  }

  // Get price from store website
  async getPriceFromStoreWebsite(store: Store, item: GroceryItem): Promise<ScrapingResult> {
    const storeConfig = this.storeConfigs.get(store.chain);
    if (!storeConfig) {
      return {
        success: false,
        lastUpdated: new Date().toISOString(),
        source: store.chain,
        error: 'Store configuration not found'
      };
    }

    // Check rate limiting
    if (!this.checkRateLimit(store.chain)) {
      return {
        success: false,
        lastUpdated: new Date().toISOString(),
        source: store.chain,
        error: 'Rate limit exceeded'
      };
    }

    try {
      // Build search query
      const searchQuery = this.buildSearchQuery(item);
      const searchUrl = this.buildSearchUrl(storeConfig, searchQuery);

      // Scrape the website
      const result = await this.scrapeWebsite(storeConfig, searchUrl, item);
      
      // Update rate limiting
      this.updateRateLimit(store.chain);
      
      return result;
    } catch (error) {
      console.error(`Error scraping ${store.chain}:`, error);
      return {
        success: false,
        lastUpdated: new Date().toISOString(),
        source: store.chain,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Build search query from item
  private buildSearchQuery(item: GroceryItem): string {
    const parts = [item.name];
    if (item.brand) parts.unshift(item.brand);
    return parts.join(' ').trim();
  }

  // Build search URL
  private buildSearchUrl(config: StoreWebsiteConfig, query: string): string {
    let url = config.searchUrl;
    
    if (config.searchMethod === 'GET') {
      const params = new URLSearchParams();
      Object.entries(config.searchParams).forEach(([key, value]) => {
        params.append(key, value.replace('{query}', encodeURIComponent(query)));
      });
      url += '?' + params.toString();
    }
    
    return url;
  }

  // Scrape website content
  private async scrapeWebsite(config: StoreWebsiteConfig, url: string, item: GroceryItem): Promise<ScrapingResult> {
    if (config.requiresJavaScript) {
      return await this.scrapeWithJavaScript(config, url, item);
    } else {
      return await this.scrapeWithFetch(config, url, item);
    }
  }

  // Scrape with fetch (for static content)
  private async scrapeWithFetch(config: StoreWebsiteConfig, url: string, item: GroceryItem): Promise<ScrapingResult> {
    try {
      const response = await fetch(url, {
        method: config.searchMethod,
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          ...config.headers
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      return this.parseHTML(html, config, item);
    } catch (error) {
      throw new Error(`Fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Scrape with JavaScript (for dynamic content)
  private async scrapeWithJavaScript(config: StoreWebsiteConfig, url: string, item: GroceryItem): Promise<ScrapingResult> {
    // This would use Puppeteer or similar in a Node.js environment
    // For now, we'll simulate the result
    console.log(`Would scrape ${url} with JavaScript for ${item.name}`);
    
    // Simulate JavaScript scraping result
    return {
      success: true,
      price: this.generateSimulatedPrice(item),
      salePrice: Math.random() > 0.8 ? this.generateSimulatedPrice(item) * 0.8 : undefined,
      inStock: Math.random() > 0.1,
      lastUpdated: new Date().toISOString(),
      source: config.name
    };
  }

  // Parse HTML content
  private parseHTML(html: string, config: StoreWebsiteConfig, item: GroceryItem): ScrapingResult {
    try {
      // Create a DOM parser (this would work in a Node.js environment with jsdom)
      // For now, we'll use regex-based parsing as a fallback
      const price = this.extractPriceWithRegex(html, config.selectors.price);
      const salePrice = config.selectors.salePrice ? 
        this.extractPriceWithRegex(html, config.selectors.salePrice) : undefined;
      const inStock = this.extractInStockWithRegex(html, config.selectors.inStock);

      return {
        success: true,
        price,
        salePrice,
        inStock,
        lastUpdated: new Date().toISOString(),
        source: config.name
      };
    } catch (error) {
      return {
        success: false,
        lastUpdated: new Date().toISOString(),
        source: config.name,
        error: 'Failed to parse HTML'
      };
    }
  }

  // Extract price using regex
  private extractPriceWithRegex(html: string, selector: string): number | undefined {
    // Convert CSS selector to regex pattern
    const patterns = [
      /\$(\d+\.?\d*)/g, // $12.99
      /(\d+\.?\d*)\s*USD/g, // 12.99 USD
      /price["\s]*:["\s]*(\d+\.?\d*)/gi, // "price": 12.99
      /data-price["\s]*=["\s]*["']?(\d+\.?\d*)/gi // data-price="12.99"
    ];

    for (const pattern of patterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const price = parseFloat(matches[0].replace(/[^\d.]/g, ''));
        if (!isNaN(price) && price > 0) {
          return price;
        }
      }
    }

    return undefined;
  }

  // Extract in-stock status using regex
  private extractInStockWithRegex(html: string, selector: string): boolean {
    const inStockPatterns = [
      /in\s*stock/gi,
      /available/gi,
      /add\s*to\s*cart/gi,
      /buy\s*now/gi
    ];

    const outOfStockPatterns = [
      /out\s*of\s*stock/gi,
      /unavailable/gi,
      /sold\s*out/gi,
      /temporarily\s*unavailable/gi
    ];

    const htmlLower = html.toLowerCase();

    // Check for out of stock indicators first
    for (const pattern of outOfStockPatterns) {
      if (pattern.test(htmlLower)) {
        return false;
      }
    }

    // Check for in stock indicators
    for (const pattern of inStockPatterns) {
      if (pattern.test(htmlLower)) {
        return true;
      }
    }

    // Default to true if no clear indicators
    return true;
  }

  // Generate simulated price for testing
  private generateSimulatedPrice(item: GroceryItem): number {
    const basePrices: { [key: string]: number } = {
      'milk-organic-valley-whole': 6.99,
      'eggs-egglands-best-large': 4.99,
      'bread-wonder-classic': 3.49,
      'bananas-chiquita-organic': 1.99,
      'chicken-perdue-breast-boneless': 8.99,
      'cheese-tillamook-cheddar': 4.99,
      'cereal-cheerios-original': 4.99,
      'peanut-butter-jif-creamy': 3.99
    };

    const basePrice = basePrices[item.id] || 3.99;
    const variation = (Math.random() - 0.5) * 0.2; // ±10%
    return Math.round((basePrice * (1 + variation)) * 100) / 100;
  }

  // Rate limiting methods
  private checkRateLimit(storeChain: string): boolean {
    const now = Date.now();
    const requests = this.requestCounts.get(storeChain) || [];
    const config = this.storeConfigs.get(storeChain);
    
    if (!config) return false;

    // Remove requests older than 1 minute
    const recentRequests = requests.filter(time => now - time < 60000);
    
    return recentRequests.length < config.rateLimit;
  }

  private updateRateLimit(storeChain: string): void {
    const now = Date.now();
    const requests = this.requestCounts.get(storeChain) || [];
    requests.push(now);
    this.requestCounts.set(storeChain, requests);
    this.lastRequestTimes.set(storeChain, now);
  }

  // Get prices from multiple stores
  async getPricesFromMultipleStores(stores: Store[], item: GroceryItem): Promise<Map<string, ScrapingResult>> {
    const results = new Map<string, ScrapingResult>();
    
    // Process stores sequentially to respect rate limits
    for (const store of stores) {
      try {
        // Add delay between requests
        if (this.lastRequestTimes.has(store.chain)) {
          const timeSinceLastRequest = Date.now() - this.lastRequestTimes.get(store.chain)!;
          if (timeSinceLastRequest < this.config.delayBetweenRequests) {
            await new Promise(resolve => 
              setTimeout(resolve, this.config.delayBetweenRequests - timeSinceLastRequest)
            );
          }
        }

        const result = await this.getPriceFromStoreWebsite(store, item);
        results.set(store.id, result);
      } catch (error) {
        console.error(`Error scraping ${store.chain}:`, error);
        results.set(store.id, {
          success: false,
          lastUpdated: new Date().toISOString(),
          source: store.chain,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  // Update configuration
  updateConfig(newConfig: Partial<ScrapingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): ScrapingConfig {
    return { ...this.config };
  }

  // Add proxy support
  addProxy(proxyUrl: string): void {
    this.config.proxyList.push(proxyUrl);
  }

  // Enable/disable proxy usage
  setProxyUsage(enabled: boolean): void {
    this.config.useProxy = enabled;
  }

  // Get scraping statistics
  getScrapingStats(): { [key: string]: { requests: number; lastRequest: number } } {
    const stats: { [key: string]: { requests: number; lastRequest: number } } = {};
    
    for (const [storeChain, requests] of this.requestCounts.entries()) {
      stats[storeChain] = {
        requests: requests.length,
        lastRequest: this.lastRequestTimes.get(storeChain) || 0
      };
    }
    
    return stats;
  }

  // Clear scraping statistics
  clearStats(): void {
    this.requestCounts.clear();
    this.lastRequestTimes.clear();
  }
}

export default WebScraperService; 