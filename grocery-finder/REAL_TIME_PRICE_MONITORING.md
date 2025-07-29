# Real-Time Grocery Price Monitoring System

## Overview

This document describes the real-time price monitoring system implemented for the grocery finder application. The system provides live price tracking, intelligent alerts, price predictions, and comprehensive analytics to help users make informed purchasing decisions.

## Features

### 🚀 Core Features

1. **Real-Time Price Tracking**
   - Live price updates every 5 minutes
   - WebSocket support for instant notifications
   - Price caching with automatic refresh
   - Multi-store price comparison

2. **Intelligent Price Monitoring**
   - Price trend analysis (increasing/decreasing/stable)
   - AI-powered price predictions
   - Best time to buy recommendations
   - Price volatility and stability scoring

3. **Smart Alerts & Notifications**
   - Custom price alerts
   - Percentage change notifications
   - Browser notifications support
   - Email alert integration (ready for backend)

4. **Comprehensive Analytics**
   - Price history tracking (30 days)
   - Price volatility analysis
   - Seasonal pattern detection
   - Store-specific price statistics

### 📊 Analytics & Insights

- **Price Trends**: Direction, strength, and confidence scoring
- **Predictions**: 1-week price forecasts with confidence levels
- **Best Time to Buy**: Recommendations based on historical data
- **Price Volatility**: Risk assessment for price fluctuations
- **Price Stability**: Reliability scoring for consistent pricing

## Architecture

### Services

#### 1. RealTimePriceService (`src/services/realTimePriceService.ts`)
- **Purpose**: Core service for real-time price management
- **Features**:
  - Price caching with TTL (Time To Live)
  - WebSocket integration for live updates
  - Multi-API fallback system
  - Price history management
  - Alert system integration

#### 2. PriceMonitoringService (`src/services/priceMonitoringService.ts`)
- **Purpose**: Advanced price analysis and monitoring
- **Features**:
  - Price trend analysis
  - Predictive analytics
  - Best time to buy calculations
  - Volatility and stability scoring
  - Seasonal pattern detection

#### 3. Enhanced GroceryService (`src/services/groceryService.ts`)
- **Purpose**: Main service with real-time integration
- **Features**:
  - Real-time price fetching
  - Monitoring start/stop controls
  - Price history access
  - Alert management
  - Configuration management

### Components

#### 1. RealTimePriceMonitor (`src/components/RealTimePriceMonitor.tsx`)
- **Purpose**: Main monitoring interface
- **Features**:
  - Live price display
  - Trend indicators
  - Price predictions
  - Alert management
  - Historical charts

#### 2. PriceMonitoringDemo (`src/components/PriceMonitoringDemo.tsx`)
- **Purpose**: Demo and showcase interface
- **Features**:
  - Interactive item selection
  - Location-based store discovery
  - Feature showcase
  - Step-by-step guide

## API Integration

### Supported Store APIs

The system is designed to integrate with real grocery store APIs:

1. **Walmart API**
   - Product search and pricing
   - Store location services
   - Real-time inventory

2. **Target API**
   - RedSky integration
   - Price comparison
   - Store-specific data

3. **Kroger API**
   - Product catalog
   - Store locations
   - Price updates

4. **Other Major Chains**
   - Safeway, Albertsons, Whole Foods
   - Trader Joe's, Publix, HEB, Meijer

### API Configuration

```typescript
// Environment variables for API keys
REACT_APP_GOOGLE_PLACES_API_KEY=your_key_here
REACT_APP_WALMART_API_KEY=your_key_here
REACT_APP_TARGET_API_KEY=your_key_here
REACT_APP_KROGER_API_KEY=your_key_here
// ... additional store APIs
```

## Usage Examples

### Basic Price Monitoring

```typescript
import { GroceryService } from './services/groceryService';

// Start monitoring prices for an item
const stores = await GroceryService.getStoresNearZipcode('90210', 10);
GroceryService.startPriceMonitoring('milk-organic-valley-whole', stores);

// Subscribe to real-time updates
const unsubscribe = GroceryService.subscribeToPriceUpdates(
  'milk-organic-valley-whole',
  'store-123',
  (event) => {
    console.log('Price updated:', event.priceInfo);
  }
);
```

### Price Analysis

```typescript
// Get price trend analysis
const trend = GroceryService.getPriceTrend('item-id', 'store-id');
console.log('Price trend:', trend.direction, trend.percentageChange);

// Get price prediction
const prediction = GroceryService.getPricePrediction('item-id', 'store-id');
console.log('Predicted price:', prediction.predictedPrice);

// Get best time to buy
const bestTime = await GroceryService.getBestTimeToBuy('item-id', 'store-id');
console.log('Recommended:', bestTime.recommended);
```

### Setting Up Alerts

```typescript
// Add price alert
const alert = {
  id: 'alert-123',
  userId: 'user-456',
  itemId: 'milk-organic-valley-whole',
  storeId: 'store-123',
  targetPrice: 5.99,
  isActive: true,
  createdAt: new Date().toISOString()
};

GroceryService.addPriceAlert(alert);
```

## Configuration

### Monitoring Settings

```typescript
// Update monitoring configuration
GroceryService.updateMonitoringConfig({
  updateInterval: 5 * 60 * 1000, // 5 minutes
  alertThreshold: 5, // 5% change
  maxHistoryDays: 30,
  enableNotifications: true
});
```

### Price Cache Settings

- **TTL**: 30 minutes for price data
- **History**: 30 days of price history
- **Update Frequency**: 5 minutes for active monitoring
- **Alert Threshold**: 5% price change (configurable)

## Data Models

### PriceInfo
```typescript
interface PriceInfo {
  id: string;
  storeId: string;
  itemId: string;
  price: number;
  unitPrice?: number;
  unit?: string;
  salePrice?: number;
  saleEndDate?: string;
  inStock: boolean;
  lastUpdated: string;
}
```

### PriceTrend
```typescript
interface PriceTrend {
  direction: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
  trendStrength: 'strong' | 'moderate' | 'weak';
  confidence: number;
}
```

### PricePrediction
```typescript
interface PricePrediction {
  predictedPrice: number;
  confidence: number;
  timeframe: '1day' | '1week' | '1month';
  factors: string[];
}
```

## Performance Considerations

### Caching Strategy
- **Price Cache**: 30-minute TTL with automatic refresh
- **Store Cache**: Location-based caching with 1-hour TTL
- **History Cache**: In-memory storage with 30-day retention

### Update Frequency
- **Active Monitoring**: 5-minute intervals
- **Background Updates**: 30-minute intervals
- **Real-time Events**: WebSocket-based instant updates

### Memory Management
- **Price History**: Limited to 30 days per item/store
- **Active Monitors**: Automatic cleanup on component unmount
- **Cache Size**: Configurable limits with LRU eviction

## Security & Privacy

### Data Protection
- **API Keys**: Environment variable storage
- **User Data**: Local storage only (no backend required)
- **Price Data**: Encrypted in transit (when using real APIs)

### Rate Limiting
- **API Calls**: Configurable rate limits per store
- **Update Frequency**: Minimum 5-minute intervals
- **Fallback Strategy**: Graceful degradation to simulated data

## Future Enhancements

### Planned Features
1. **Machine Learning Integration**
   - Advanced price prediction models
   - Seasonal pattern recognition
   - Demand forecasting

2. **Social Features**
   - Price sharing between users
   - Community price reports
   - Deal alerts from other users

3. **Advanced Analytics**
   - Price correlation analysis
   - Store loyalty program integration
   - Budget tracking and recommendations

4. **Mobile App Integration**
   - Push notifications
   - Barcode scanning
   - Location-based alerts

### Backend Integration
1. **Database Storage**
   - Persistent price history
   - User preferences
   - Alert management

2. **Real-time Infrastructure**
   - WebSocket server
   - Message queuing
   - Scalable monitoring

3. **API Aggregation**
   - Centralized store API management
   - Rate limiting and caching
   - Data normalization

## Troubleshooting

### Common Issues

1. **No Real-time Updates**
   - Check WebSocket connection
   - Verify API keys are configured
   - Ensure monitoring is started

2. **Missing Price Data**
   - Check store API availability
   - Verify item IDs are correct
   - Review fallback to simulated data

3. **Alert Notifications**
   - Check browser notification permissions
   - Verify alert configuration
   - Review notification settings

### Debug Mode

Enable debug logging by setting:
```typescript
localStorage.setItem('debug', 'true');
```

This will show detailed logs for:
- API calls and responses
- Price update events
- Cache operations
- Alert triggers

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure API keys in `.env` file
4. Start development server: `npm start`

### Testing
- Unit tests: `npm test`
- Integration tests: `npm run test:integration`
- E2E tests: `npm run test:e2e`

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues:
1. Check the troubleshooting section
2. Review the API documentation
3. Open an issue on GitHub
4. Contact the development team 