import { PriceInfo, Store, GroceryItem } from '../types';
import { loadAPIConfig, APIConfig } from '../config/apiConfig';

// Price cache with TTL (Time To Live)
interface CachedPrice {
  priceInfo: PriceInfo;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Price history entry
interface PriceHistoryEntry {
  price: number;
  salePrice?: number;
  timestamp: string;
  storeId: string;
  itemId: string;
}

// Price alert configuration
interface PriceAlert {
  id: string;
  userId: string;
  itemId: string;
  storeId: string;
  targetPrice: number;
  isActive: boolean;
  createdAt: string;
}

// Real-time price update event
interface PriceUpdateEvent {
  type: 'price_update' | 'stock_update' | 'sale_start' | 'sale_end';
  storeId: string;
  itemId: string;
  priceInfo: PriceInfo;
  timestamp: string;
}

class RealTimePriceService {
  private static instance: RealTimePriceService;
  private priceCache = new Map<string, CachedPrice>();
  private priceHistory = new Map<string, PriceHistoryEntry[]>();
  private priceAlerts = new Map<string, PriceAlert[]>();
  private updateCallbacks = new Map<string, ((event: PriceUpdateEvent) => void)[]>();
  private apiConfig: APIConfig;
  private updateInterval: NodeJS.Timeout | null = null;
  private websocket: WebSocket | null = null;

  private constructor() {
    this.apiConfig = loadAPIConfig();
    this.initializePriceUpdates();
  }

  static getInstance(): RealTimePriceService {
    if (!RealTimePriceService.instance) {
      RealTimePriceService.instance = new RealTimePriceService();
    }
    return RealTimePriceService.instance;
  }

  // Initialize real-time price updates
  private initializePriceUpdates(): void {
    // Start periodic price updates (every 5 minutes)
    this.updateInterval = setInterval(() => {
      this.updateAllPrices();
    }, 5 * 60 * 1000);

    // Initialize WebSocket connection for live updates
    this.initializeWebSocket();
  }

  // Initialize WebSocket for real-time updates
  private initializeWebSocket(): void {
    try {
      // Connect to a WebSocket server for live price updates
      // This would be your backend WebSocket server
      this.websocket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8080/prices');
      
      this.websocket.onopen = () => {
        console.log('WebSocket connected for real-time price updates');
      };

      this.websocket.onmessage = (event) => {
        try {
          const priceUpdate: PriceUpdateEvent = JSON.parse(event.data);
          this.handlePriceUpdate(priceUpdate);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.websocket.onclose = () => {
        console.log('WebSocket disconnected, attempting to reconnect...');
        setTimeout(() => this.initializeWebSocket(), 5000);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  // Handle incoming price updates
  private handlePriceUpdate(event: PriceUpdateEvent): void {
    const cacheKey = `${event.storeId}-${event.itemId}`;
    
    // Update cache
    this.priceCache.set(cacheKey, {
      priceInfo: event.priceInfo,
      timestamp: Date.now(),
      ttl: 30 * 60 * 1000 // 30 minutes TTL
    });

    // Add to price history
    this.addToPriceHistory(event.itemId, event.storeId, event.priceInfo);

    // Check price alerts
    this.checkPriceAlerts(event);

    // Notify subscribers
    this.notifySubscribers(event);
  }

  // Get real-time prices for items
  async getRealTimePrices(itemIds: string[], stores: Store[]): Promise<Map<string, PriceInfo[]>> {
    const results = new Map<string, PriceInfo[]>();

    for (const itemId of itemIds) {
      const prices: PriceInfo[] = [];
      
      for (const store of stores) {
        const price = await this.getRealTimePrice(itemId, store);
        if (price) {
          prices.push(price);
        }
      }
      
      results.set(itemId, prices);
    }

    return results;
  }

  // Get real-time price for a specific item at a store
  async getRealTimePrice(itemId: string, store: Store): Promise<PriceInfo | null> {
    const cacheKey = `${store.id}-${itemId}`;
    const cached = this.priceCache.get(cacheKey);

    // Check if we have a valid cached price
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.priceInfo;
    }

    // Fetch fresh price from store API
    const freshPrice = await this.fetchPriceFromStoreAPI(itemId, store);
    
    if (freshPrice) {
      // Cache the fresh price
      this.priceCache.set(cacheKey, {
        priceInfo: freshPrice,
        timestamp: Date.now(),
        ttl: 30 * 60 * 1000 // 30 minutes TTL
      });

      // Add to price history
      this.addToPriceHistory(itemId, store.id, freshPrice);

      return freshPrice;
    }

    // Return cached price even if expired, or null
    return cached?.priceInfo || null;
  }

  // Fetch price from actual store API
  private async fetchPriceFromStoreAPI(itemId: string, store: Store): Promise<PriceInfo | null> {
    const chain = store.chain.toLowerCase();
    
    try {
      switch (chain) {
        case 'walmart':
          return await this.fetchWalmartPrice(itemId, store);
        case 'target':
          return await this.fetchTargetPrice(itemId, store);
        case 'kroger':
          return await this.fetchKrogerPrice(itemId, store);
        case 'safeway':
          return await this.fetchSafewayPrice(itemId, store);
        case 'albertsons':
          return await this.fetchAlbertsonsPrice(itemId, store);
        case 'whole foods':
          return await this.fetchWholeFoodsPrice(itemId, store);
        case 'trader joe\'s':
          return await this.fetchTraderJoesPrice(itemId, store);
        case 'publix':
          return await this.fetchPublixPrice(itemId, store);
        case 'heb':
          return await this.fetchHEBPrice(itemId, store);
        case 'meijer':
          return await this.fetchMeijerPrice(itemId, store);
        default:
          return await this.fetchGenericStorePrice(itemId, store);
      }
    } catch (error) {
      console.error(`Failed to fetch price from ${store.chain}:`, error);
      return null;
    }
  }

  // Walmart API integration
  private async fetchWalmartPrice(itemId: string, store: Store): Promise<PriceInfo | null> {
    if (!this.apiConfig.walmart.enabled) return null;

    try {
      const response = await fetch(
        `${this.apiConfig.walmart.baseUrl}/items/${itemId}?storeId=${store.id}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiConfig.walmart.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          id: `${store.id}-${itemId}`,
          storeId: store.id,
          itemId: itemId,
          price: data.price || 0,
          unitPrice: data.unitPrice,
          unit: data.unit,
          salePrice: data.salePrice,
          saleEndDate: data.saleEndDate,
          inStock: data.inStock || false,
          lastUpdated: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Walmart API error:', error);
    }

    return null;
  }

  // Target API integration
  private async fetchTargetPrice(itemId: string, store: Store): Promise<PriceInfo | null> {
    if (!this.apiConfig.target.enabled) return null;

    try {
      const response = await fetch(
        `${this.apiConfig.target.baseUrl}/plp/search?tcin=${itemId}&store_id=${store.id}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiConfig.target.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const product = data.products?.[0];
        
        if (product) {
          return {
            id: `${store.id}-${itemId}`,
            storeId: store.id,
            itemId: itemId,
            price: product.price?.current_retail || 0,
            unitPrice: product.price?.unit_price,
            unit: product.price?.unit,
            salePrice: product.price?.current_retail !== product.price?.current_retail ? product.price?.current_retail : undefined,
            saleEndDate: product.price?.sale_end_date,
            inStock: product.available_to_promise_quantity > 0,
            lastUpdated: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.error('Target API error:', error);
    }

    return null;
  }

  // Kroger API integration
  private async fetchKrogerPrice(itemId: string, store: Store): Promise<PriceInfo | null> {
    if (!this.apiConfig.kroger.enabled) return null;

    try {
      const response = await fetch(
        `${this.apiConfig.kroger.baseUrl}/products/${itemId}?storeId=${store.id}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiConfig.kroger.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          id: `${store.id}-${itemId}`,
          storeId: store.id,
          itemId: itemId,
          price: data.price || 0,
          unitPrice: data.unitPrice,
          unit: data.unit,
          salePrice: data.salePrice,
          saleEndDate: data.saleEndDate,
          inStock: data.inStock || false,
          lastUpdated: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Kroger API error:', error);
    }

    return null;
  }

  // Generic store price fetching (fallback)
  private async fetchGenericStorePrice(itemId: string, store: Store): Promise<PriceInfo | null> {
    // This would be a generic implementation for stores without specific APIs
    // For now, return null to trigger fallback to simulated prices
    return null;
  }

  // Add other store-specific API methods...
  private async fetchSafewayPrice(itemId: string, store: Store): Promise<PriceInfo | null> {
    // Implementation for Safeway API
    return null;
  }

  private async fetchAlbertsonsPrice(itemId: string, store: Store): Promise<PriceInfo | null> {
    // Implementation for Albertsons API
    return null;
  }

  private async fetchWholeFoodsPrice(itemId: string, store: Store): Promise<PriceInfo | null> {
    // Implementation for Whole Foods API
    return null;
  }

  private async fetchTraderJoesPrice(itemId: string, store: Store): Promise<PriceInfo | null> {
    // Implementation for Trader Joe's API
    return null;
  }

  private async fetchPublixPrice(itemId: string, store: Store): Promise<PriceInfo | null> {
    // Implementation for Publix API
    return null;
  }

  private async fetchHEBPrice(itemId: string, store: Store): Promise<PriceInfo | null> {
    // Implementation for HEB API
    return null;
  }

  private async fetchMeijerPrice(itemId: string, store: Store): Promise<PriceInfo | null> {
    // Implementation for Meijer API
    return null;
  }

  // Update all prices in cache
  private async updateAllPrices(): Promise<void> {
    const cacheKeys = Array.from(this.priceCache.keys());
    
    for (const cacheKey of cacheKeys) {
      const [storeId, itemId] = cacheKey.split('-');
      const cached = this.priceCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp > cached.ttl) {
        // Fetch fresh price
        const freshPrice = await this.fetchPriceFromStoreAPI(itemId, { id: storeId } as Store);
        
        if (freshPrice) {
          this.priceCache.set(cacheKey, {
            priceInfo: freshPrice,
            timestamp: Date.now(),
            ttl: 30 * 60 * 1000
          });

          // Add to price history
          this.addToPriceHistory(itemId, storeId, freshPrice);

          // Check price alerts
          this.checkPriceAlerts({
            type: 'price_update',
            storeId,
            itemId,
            priceInfo: freshPrice,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }

  // Add price to history
  private addToPriceHistory(itemId: string, storeId: string, priceInfo: PriceInfo): void {
    const historyKey = `${storeId}-${itemId}`;
    const history = this.priceHistory.get(historyKey) || [];
    
    const entry: PriceHistoryEntry = {
      price: priceInfo.price,
      salePrice: priceInfo.salePrice,
      timestamp: priceInfo.lastUpdated,
      storeId,
      itemId
    };

    history.push(entry);
    
    // Keep only last 30 days of history
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const filteredHistory = history.filter(entry => 
      new Date(entry.timestamp) > thirtyDaysAgo
    );

    this.priceHistory.set(historyKey, filteredHistory);
  }

  // Get price history for an item at a store
  getPriceHistory(itemId: string, storeId: string): PriceHistoryEntry[] {
    const historyKey = `${storeId}-${itemId}`;
    return this.priceHistory.get(historyKey) || [];
  }

  // Subscribe to price updates
  subscribeToPriceUpdates(itemId: string, storeId: string, callback: (event: PriceUpdateEvent) => void): () => void {
    const key = `${storeId}-${itemId}`;
    const callbacks = this.updateCallbacks.get(key) || [];
    callbacks.push(callback);
    this.updateCallbacks.set(key, callbacks);

    // Return unsubscribe function
    return () => {
      const callbacks = this.updateCallbacks.get(key) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        this.updateCallbacks.set(key, callbacks);
      }
    };
  }

  // Notify subscribers of price updates
  private notifySubscribers(event: PriceUpdateEvent): void {
    const key = `${event.storeId}-${event.itemId}`;
    const callbacks = this.updateCallbacks.get(key) || [];
    
    callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in price update callback:', error);
      }
    });
  }

  // Price alert functionality
  addPriceAlert(alert: PriceAlert): void {
    const alerts = this.priceAlerts.get(alert.itemId) || [];
    alerts.push(alert);
    this.priceAlerts.set(alert.itemId, alerts);
  }

  removePriceAlert(alertId: string): void {
    for (const [itemId, alerts] of this.priceAlerts.entries()) {
      const index = alerts.findIndex(alert => alert.id === alertId);
      if (index > -1) {
        alerts.splice(index, 1);
        this.priceAlerts.set(itemId, alerts);
        break;
      }
    }
  }

  // Check price alerts
  private checkPriceAlerts(event: PriceUpdateEvent): void {
    const alerts = this.priceAlerts.get(event.itemId) || [];
    
    alerts.forEach(alert => {
      if (alert.isActive && alert.storeId === event.storeId) {
        const currentPrice = event.priceInfo.salePrice || event.priceInfo.price;
        
        if (currentPrice <= alert.targetPrice) {
          this.triggerPriceAlert(alert, event.priceInfo);
        }
      }
    });
  }

  // Trigger price alert
  private triggerPriceAlert(alert: PriceAlert, priceInfo: PriceInfo): void {
    // Send notification to user
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Price Alert!', {
        body: `The price of your item has dropped to $${priceInfo.price}!`,
        icon: '/favicon.ico'
      });
    }

    // You could also send to your backend for push notifications
    console.log(`Price alert triggered: ${alert.id}`);
  }

  // Get price statistics
  getPriceStats(itemId: string, storeId: string): {
    averagePrice: number;
    lowestPrice: number;
    highestPrice: number;
    priceVolatility: number;
  } {
    const history = this.getPriceHistory(itemId, storeId);
    
    if (history.length === 0) {
      return {
        averagePrice: 0,
        lowestPrice: 0,
        highestPrice: 0,
        priceVolatility: 0
      };
    }

    const prices = history.map(entry => entry.salePrice || entry.price);
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    
    // Calculate price volatility (standard deviation)
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - averagePrice, 2), 0) / prices.length;
    const priceVolatility = Math.sqrt(variance);

    return {
      averagePrice,
      lowestPrice,
      highestPrice,
      priceVolatility
    };
  }

  // Cleanup
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    if (this.websocket) {
      this.websocket.close();
    }
    
    this.priceCache.clear();
    this.priceHistory.clear();
    this.priceAlerts.clear();
    this.updateCallbacks.clear();
  }
}

export default RealTimePriceService; 