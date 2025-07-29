import RealTimePriceService from './realTimePriceService';
import { PriceInfo, Store, GroceryItem } from '../types';

// Price monitoring configuration
interface MonitoringConfig {
  updateInterval: number; // milliseconds
  alertThreshold: number; // percentage change to trigger alert
  maxHistoryDays: number;
  enableNotifications: boolean;
}

// Price trend analysis
interface PriceTrend {
  direction: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
  trendStrength: 'strong' | 'moderate' | 'weak';
  confidence: number; // 0-1
}

// Price prediction
interface PricePrediction {
  predictedPrice: number;
  confidence: number;
  timeframe: '1day' | '1week' | '1month';
  factors: string[];
}

// Best time to buy analysis
interface BestTimeToBuy {
  recommended: boolean;
  reasoning: string;
  expectedSavings: number;
  confidence: number;
}

class PriceMonitoringService {
  private static instance: PriceMonitoringService;
  private realTimeService: RealTimePriceService;
  private config: MonitoringConfig;
  private activeMonitors = new Map<string, NodeJS.Timeout>();
  private priceTrends = new Map<string, PriceTrend>();
  private predictions = new Map<string, PricePrediction>();

  private constructor() {
    this.realTimeService = RealTimePriceService.getInstance();
    this.config = {
      updateInterval: 5 * 60 * 1000, // 5 minutes
      alertThreshold: 5, // 5% change
      maxHistoryDays: 30,
      enableNotifications: true
    };
  }

  static getInstance(): PriceMonitoringService {
    if (!PriceMonitoringService.instance) {
      PriceMonitoringService.instance = new PriceMonitoringService();
    }
    return PriceMonitoringService.instance;
  }

  // Start monitoring prices for specific items
  startMonitoring(itemId: string, stores: Store[]): void {
    const monitorKey = `${itemId}-${stores.map(s => s.id).join(',')}`;
    
    if (this.activeMonitors.has(monitorKey)) {
      return; // Already monitoring
    }

    const interval = setInterval(async () => {
      await this.updatePriceAnalysis(itemId, stores);
    }, this.config.updateInterval);

    this.activeMonitors.set(monitorKey, interval);
    
    // Initial analysis
    this.updatePriceAnalysis(itemId, stores);
  }

  // Stop monitoring prices for specific items
  stopMonitoring(itemId: string, stores: Store[]): void {
    const monitorKey = `${itemId}-${stores.map(s => s.id).join(',')}`;
    const interval = this.activeMonitors.get(monitorKey);
    
    if (interval) {
      clearInterval(interval);
      this.activeMonitors.delete(monitorKey);
    }
  }

  // Update price analysis for items
  private async updatePriceAnalysis(itemId: string, stores: Store[]): Promise<void> {
    try {
      // Get current prices
      const currentPrices = await this.realTimeService.getRealTimePrices([itemId], stores);
      const prices = currentPrices.get(itemId) || [];

      if (prices.length === 0) return;

      // Analyze price trends for each store
      for (const store of stores) {
        const storePrice = prices.find(p => p.storeId === store.id);
        if (storePrice) {
          await this.analyzePriceTrend(itemId, store.id, storePrice);
          await this.generatePricePrediction(itemId, store.id);
          await this.analyzeBestTimeToBuy(itemId, store.id);
        }
      }

      // Check for significant price changes
      this.checkPriceAlerts(itemId, stores, prices);

    } catch (error) {
      console.error('Error updating price analysis:', error);
    }
  }

  // Analyze price trend for an item at a store
  private async analyzePriceTrend(itemId: string, storeId: string, currentPrice: PriceInfo): Promise<void> {
    const history = this.realTimeService.getPriceHistory(itemId, storeId);
    
    if (history.length < 2) return;

    // Get recent prices (last 7 days)
    const recentHistory = history.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return entryDate > weekAgo;
    });

    if (recentHistory.length < 2) return;

    // Calculate price changes
    const prices = recentHistory.map(entry => entry.salePrice || entry.price);
    const currentPriceValue = currentPrice.salePrice || currentPrice.price;
    
    const oldestPrice = prices[0];
    const newestPrice = currentPriceValue;
    const percentageChange = ((newestPrice - oldestPrice) / oldestPrice) * 100;

    // Determine trend direction and strength
    let direction: 'increasing' | 'decreasing' | 'stable';
    let trendStrength: 'strong' | 'moderate' | 'weak';

    if (Math.abs(percentageChange) < 2) {
      direction = 'stable';
      trendStrength = 'weak';
    } else if (percentageChange > 0) {
      direction = 'increasing';
      trendStrength = Math.abs(percentageChange) > 10 ? 'strong' : 'moderate';
    } else {
      direction = 'decreasing';
      trendStrength = Math.abs(percentageChange) > 10 ? 'strong' : 'moderate';
    }

    // Calculate confidence based on data consistency
    const priceVariance = this.calculateVariance(prices);
    const confidence = Math.max(0, 1 - (priceVariance / Math.pow(oldestPrice, 2)));

    const trend: PriceTrend = {
      direction,
      percentageChange,
      trendStrength,
      confidence
    };

    this.priceTrends.set(`${storeId}-${itemId}`, trend);
  }

  // Generate price prediction
  private async generatePricePrediction(itemId: string, storeId: string): Promise<void> {
    const history = this.realTimeService.getPriceHistory(itemId, storeId);
    
    if (history.length < 7) return; // Need at least a week of data

    const prices = history.map(entry => entry.salePrice || entry.price);
    const timestamps = history.map(entry => new Date(entry.timestamp).getTime());

    // Simple linear regression for prediction
    const prediction = this.linearRegressionPrediction(prices, timestamps);
    
    // Calculate confidence based on historical accuracy
    const confidence = this.calculatePredictionConfidence(prices, timestamps);

    const pricePrediction: PricePrediction = {
      predictedPrice: Math.max(0, prediction), // Ensure non-negative
      confidence,
      timeframe: '1week',
      factors: this.identifyPriceFactors(itemId, storeId)
    };

    this.predictions.set(`${storeId}-${itemId}`, pricePrediction);
  }

  // Analyze best time to buy
  private async analyzeBestTimeToBuy(itemId: string, storeId: string): Promise<BestTimeToBuy> {
    const history = this.realTimeService.getPriceHistory(itemId, storeId);
    const stats = this.realTimeService.getPriceStats(itemId, storeId);
    
    if (history.length < 7) {
      return {
        recommended: false,
        reasoning: 'Insufficient price history',
        expectedSavings: 0,
        confidence: 0
      };
    }

    const currentPrice = history[history.length - 1]?.salePrice || history[history.length - 1]?.price || 0;
    const averagePrice = stats.averagePrice;
    const lowestPrice = stats.lowestPrice;

    // Calculate potential savings
    const savingsVsAverage = averagePrice - currentPrice;
    const savingsVsLowest = currentPrice - lowestPrice;

    // Determine if it's a good time to buy
    const priceVsAverage = (currentPrice / averagePrice) * 100;
    const priceVsLowest = (currentPrice / lowestPrice) * 100;

    let recommended = false;
    let reasoning = '';
    let expectedSavings = 0;
    let confidence = 0;

    if (priceVsAverage < 95) { // Current price is 5% below average
      recommended = true;
      reasoning = `Current price is ${(100 - priceVsAverage).toFixed(1)}% below average`;
      expectedSavings = savingsVsAverage;
      confidence = 0.8;
    } else if (priceVsLowest < 110) { // Current price is within 10% of lowest
      recommended = true;
      reasoning = `Current price is close to historical low`;
      expectedSavings = savingsVsAverage * 0.5;
      confidence = 0.6;
    } else {
      recommended = false;
      reasoning = `Current price is above average, consider waiting`;
      expectedSavings = 0;
      confidence = 0.7;
    }

    return {
      recommended,
      reasoning,
      expectedSavings,
      confidence
    };
  }

  // Check for price alerts
  private checkPriceAlerts(itemId: string, stores: Store[], currentPrices: PriceInfo[]): void {
    for (const store of stores) {
      const currentPrice = currentPrices.find(p => p.storeId === store.id);
      if (!currentPrice) continue;

      const history = this.realTimeService.getPriceHistory(itemId, store.id);
      if (history.length < 2) continue;

      const previousPrice = history[history.length - 2]?.salePrice || history[history.length - 2]?.price;
      const currentPriceValue = currentPrice.salePrice || currentPrice.price;

      if (previousPrice && currentPriceValue) {
        const percentageChange = Math.abs((currentPriceValue - previousPrice) / previousPrice) * 100;

        if (percentageChange >= this.config.alertThreshold) {
          this.triggerPriceChangeAlert(itemId, store, currentPrice, previousPrice, percentageChange);
        }
      }
    }
  }

  // Trigger price change alert
  private triggerPriceChangeAlert(
    itemId: string, 
    store: Store, 
    currentPrice: PriceInfo, 
    previousPrice: number, 
    percentageChange: number
  ): void {
    const direction = currentPrice.price > previousPrice ? 'increased' : 'decreased';
    const message = `Price ${direction} by ${percentageChange.toFixed(1)}% at ${store.name}`;

    if (this.config.enableNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Price Change Alert', {
        body: message,
        icon: '/favicon.ico'
      });
    }

    console.log(`Price alert: ${message}`);
  }

  // Get price trend for an item at a store
  getPriceTrend(itemId: string, storeId: string): PriceTrend | null {
    return this.priceTrends.get(`${storeId}-${itemId}`) || null;
  }

  // Get price prediction for an item at a store
  getPricePrediction(itemId: string, storeId: string): PricePrediction | null {
    return this.predictions.get(`${storeId}-${itemId}`) || null;
  }

  // Get best time to buy analysis
  async getBestTimeToBuy(itemId: string, storeId: string): Promise<BestTimeToBuy> {
    return await this.analyzeBestTimeToBuy(itemId, storeId);
  }

  // Get price volatility score
  getPriceVolatility(itemId: string, storeId: string): number {
    const stats = this.realTimeService.getPriceStats(itemId, storeId);
    const averagePrice = stats.averagePrice;
    
    if (averagePrice === 0) return 0;
    
    // Normalize volatility to a 0-100 scale
    return Math.min(100, (stats.priceVolatility / averagePrice) * 100);
  }

  // Get price stability score
  getPriceStability(itemId: string, storeId: string): number {
    const volatility = this.getPriceVolatility(itemId, storeId);
    return Math.max(0, 100 - volatility);
  }

  // Utility methods
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private linearRegressionPrediction(prices: number[], timestamps: number[]): number {
    const n = prices.length;
    const sumX = timestamps.reduce((sum, val) => sum + val, 0);
    const sumY = prices.reduce((sum, val) => sum + val, 0);
    const sumXY = timestamps.reduce((sum, x, i) => sum + x * prices[i], 0);
    const sumXX = timestamps.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict price for 1 week from now
    const futureTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
    return slope * futureTime + intercept;
  }

  private calculatePredictionConfidence(prices: number[], timestamps: number[]): number {
    // Simple confidence calculation based on price stability
    const volatility = this.calculateVariance(prices);
    const averagePrice = prices.reduce((sum, val) => sum + val, 0) / prices.length;
    
    if (averagePrice === 0) return 0;
    
    // Higher volatility = lower confidence
    const normalizedVolatility = Math.min(1, volatility / Math.pow(averagePrice, 2));
    return Math.max(0, 1 - normalizedVolatility);
  }

  private identifyPriceFactors(itemId: string, storeId: string): string[] {
    const factors: string[] = [];
    const history = this.realTimeService.getPriceHistory(itemId, storeId);
    
    if (history.length === 0) return factors;

    // Check for seasonal patterns
    const hasSeasonalPattern = this.detectSeasonalPattern(history);
    if (hasSeasonalPattern) {
      factors.push('Seasonal pricing');
    }

    // Check for sale frequency
    const saleFrequency = history.filter(entry => entry.salePrice).length / history.length;
    if (saleFrequency > 0.3) {
      factors.push('Frequent sales');
    }

    // Check for price volatility
    const volatility = this.getPriceVolatility(itemId, storeId);
    if (volatility > 20) {
      factors.push('High price volatility');
    }

    return factors;
  }

  private detectSeasonalPattern(history: any[]): boolean {
    // Simple seasonal pattern detection
    // This could be enhanced with more sophisticated analysis
    const monthlyPrices = new Map<number, number[]>();
    
    history.forEach(entry => {
      const month = new Date(entry.timestamp).getMonth();
      const price = entry.salePrice || entry.price;
      
      if (!monthlyPrices.has(month)) {
        monthlyPrices.set(month, []);
      }
      monthlyPrices.get(month)!.push(price);
    });

    // Check if there's significant variation between months
    const monthlyAverages = Array.from(monthlyPrices.entries()).map(([month, prices]) => ({
      month,
      average: prices.reduce((sum, price) => sum + price, 0) / prices.length
    }));

    if (monthlyAverages.length < 3) return false;

    const overallAverage = monthlyAverages.reduce((sum, entry) => sum + entry.average, 0) / monthlyAverages.length;
    const maxDeviation = Math.max(...monthlyAverages.map(entry => Math.abs(entry.average - overallAverage)));

    return (maxDeviation / overallAverage) > 0.1; // 10% variation threshold
  }

  // Update configuration
  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  // Cleanup
  destroy(): void {
    // Clear all active monitors
    for (const interval of this.activeMonitors.values()) {
      clearInterval(interval);
    }
    this.activeMonitors.clear();
    
    // Clear cached data
    this.priceTrends.clear();
    this.predictions.clear();
  }
}

export default PriceMonitoringService; 