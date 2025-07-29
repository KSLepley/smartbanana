import React, { useState, useEffect, useCallback } from 'react';
import { GroceryService } from '../services/groceryService';
import { Store, GroceryItem, PriceInfo } from '../types';
import './RealTimePriceMonitor.css';

interface RealTimePriceMonitorProps {
  itemId: string;
  stores: Store[];
  item: GroceryItem;
}

interface PriceUpdateEvent {
  type: string;
  storeId: string;
  itemId: string;
  priceInfo: PriceInfo;
  timestamp: string;
}

const RealTimePriceMonitor: React.FC<RealTimePriceMonitorProps> = ({ itemId, stores, item }) => {
  const [currentPrices, setCurrentPrices] = useState<Map<string, PriceInfo>>(new Map());
  const [priceHistory, setPriceHistory] = useState<Map<string, any[]>>(new Map());
  const [priceTrends, setPriceTrends] = useState<Map<string, any>>(new Map());
  const [predictions, setPredictions] = useState<Map<string, any>>(new Map());
  const [bestTimeToBuy, setBestTimeToBuy] = useState<Map<string, any>>(new Map());
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [alertPrice, setAlertPrice] = useState<number>(0);

  // Initialize price monitoring
  useEffect(() => {
    initializePriceMonitoring();
    return () => {
      if (isMonitoring) {
        GroceryService.stopPriceMonitoring(itemId, stores);
      }
    };
  }, [itemId, stores]);

  const initializePriceMonitoring = useCallback(async () => {
    try {
      // Get initial prices
      const initialPrices = await GroceryService.getItemPrices(itemId, {
        zipCode: '90210', // Default zip code
        radius: 10,
        inStockOnly: false
      });

      if (initialPrices) {
        const priceMap = new Map();
        initialPrices.stores.forEach(storeItem => {
          priceMap.set(storeItem.store.id, storeItem.priceInfo);
        });
        setCurrentPrices(priceMap);
      }

      // Load price history for each store
      const historyMap = new Map();
      const trendsMap = new Map();
      const predictionsMap = new Map();
      const bestTimeMap = new Map();

      for (const store of stores) {
        const history = GroceryService.getPriceHistory(itemId, store.id);
        historyMap.set(store.id, history);

        const trend = GroceryService.getPriceTrend(itemId, store.id);
        if (trend) {
          trendsMap.set(store.id, trend);
        }

        const prediction = GroceryService.getPricePrediction(itemId, store.id);
        if (prediction) {
          predictionsMap.set(store.id, prediction);
        }

        const bestTime = await GroceryService.getBestTimeToBuy(itemId, store.id);
        bestTimeMap.set(store.id, bestTime);
      }

      setPriceHistory(historyMap);
      setPriceTrends(trendsMap);
      setPredictions(predictionsMap);
      setBestTimeToBuy(bestTimeMap);

    } catch (error) {
      console.error('Error initializing price monitoring:', error);
    }
  }, [itemId, stores]);

  // Start/stop monitoring
  const toggleMonitoring = useCallback(() => {
    if (isMonitoring) {
      GroceryService.stopPriceMonitoring(itemId, stores);
      setIsMonitoring(false);
    } else {
      GroceryService.startPriceMonitoring(itemId, stores);
      setIsMonitoring(true);
    }
  }, [isMonitoring, itemId, stores]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!isMonitoring) return;

    const unsubscribeCallbacks: (() => void)[] = [];

    stores.forEach(store => {
      const unsubscribe = GroceryService.subscribeToPriceUpdates(
        itemId,
        store.id,
        (event: PriceUpdateEvent) => {
          handlePriceUpdate(event);
        }
      );
      unsubscribeCallbacks.push(unsubscribe);
    });

    return () => {
      unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
    };
  }, [isMonitoring, itemId, stores]);

  const handlePriceUpdate = useCallback((event: PriceUpdateEvent) => {
    setCurrentPrices(prev => {
      const newMap = new Map(prev);
      newMap.set(event.storeId, event.priceInfo);
      return newMap;
    });

    // Update price history
    setPriceHistory(prev => {
      const newMap = new Map(prev);
      const history = newMap.get(event.storeId) || [];
      const newHistory = [...history, {
        price: event.priceInfo.price,
        salePrice: event.priceInfo.salePrice,
        timestamp: event.timestamp,
        storeId: event.storeId,
        itemId: event.itemId
      }];
      newMap.set(event.storeId, newHistory);
      return newMap;
    });

    // Add alert for significant price changes
    if (event.type === 'price_update') {
      const currentPrice = event.priceInfo.salePrice || event.priceInfo.price;
      const storeHistory = priceHistory.get(event.storeId);
      const previousPrice = storeHistory && storeHistory.length > 1 ? storeHistory[storeHistory.length - 2]?.price : undefined;
      
      if (previousPrice && Math.abs((currentPrice - previousPrice) / previousPrice) > 0.05) {
        const store = stores.find(s => s.id === event.storeId);
        const alert = {
          id: Date.now().toString(),
          message: `Price ${currentPrice > previousPrice ? 'increased' : 'decreased'} by ${Math.abs(((currentPrice - previousPrice) / previousPrice) * 100).toFixed(1)}% at ${store?.name}`,
          timestamp: new Date().toISOString(),
          type: 'price_change'
        };
        setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
      }
    }
  }, [priceHistory, stores]);

  // Add price alert
  const addPriceAlert = useCallback(() => {
    if (!selectedStore || alertPrice <= 0) return;

    const alert = {
      id: Date.now().toString(),
      userId: 'user123', // In a real app, this would be the actual user ID
      itemId,
      storeId: selectedStore,
      targetPrice: alertPrice,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    GroceryService.addPriceAlert(alert);
    setAlertPrice(0);
    setSelectedStore('');
  }, [selectedStore, alertPrice, itemId]);

  // Remove price alert
  const removeAlert = useCallback((alertId: string) => {
    GroceryService.removePriceAlert(alertId);
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Get price volatility color
  const getVolatilityColor = (volatility: number): string => {
    if (volatility < 20) return '#4CAF50'; // Green - stable
    if (volatility < 40) return '#FF9800'; // Orange - moderate
    return '#F44336'; // Red - volatile
  };

  // Get trend color
  const getTrendColor = (trend: any): string => {
    if (!trend) return '#666';
    switch (trend.direction) {
      case 'increasing': return '#F44336'; // Red
      case 'decreasing': return '#4CAF50'; // Green
      default: return '#FF9800'; // Orange
    }
  };

  return (
    <div className="real-time-price-monitor">
      <div className="monitor-header">
        <h2>Real-Time Price Monitor</h2>
        <div className="monitor-controls">
          <button 
            className={`monitor-toggle ${isMonitoring ? 'active' : ''}`}
            onClick={toggleMonitoring}
          >
            {isMonitoring ? '🟢 Monitoring' : '🔴 Start Monitoring'}
          </button>
        </div>
      </div>

      <div className="item-info">
        <img src={item.imageUrl} alt={item.name} className="item-image" />
        <div className="item-details">
          <h3>{item.name}</h3>
          <p>{item.brand} • {item.size} • {item.category}</p>
        </div>
      </div>

      <div className="price-grid">
        {stores.map(store => {
          const priceInfo = currentPrices.get(store.id);
          const history = priceHistory.get(store.id) || [];
          const trend = priceTrends.get(store.id);
          const prediction = predictions.get(store.id);
          const bestTime = bestTimeToBuy.get(store.id);
          const volatility = GroceryService.getPriceVolatility(itemId, store.id);
          const stability = GroceryService.getPriceStability(itemId, store.id);

          return (
            <div key={store.id} className="store-price-card">
              <div className="store-header">
                <h4>{store.name}</h4>
                <span className="store-distance">{store.distance?.toFixed(1)} mi</span>
              </div>

              <div className="price-display">
                {priceInfo ? (
                  <>
                    <div className="current-price">
                      <span className="price-amount">${priceInfo.price.toFixed(2)}</span>
                      {priceInfo.salePrice && (
                        <span className="sale-price">${priceInfo.salePrice.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="price-status">
                      <span className={`stock-status ${priceInfo.inStock ? 'in-stock' : 'out-of-stock'}`}>
                        {priceInfo.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <span className="last-updated">
                        Updated: {new Date(priceInfo.lastUpdated).toLocaleTimeString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="loading-price">Loading price...</div>
                )}
              </div>

              {trend && (
                <div className="price-trend">
                  <div className="trend-indicator" style={{ color: getTrendColor(trend) }}>
                    {trend.direction === 'increasing' && '↗️'}
                    {trend.direction === 'decreasing' && '↘️'}
                    {trend.direction === 'stable' && '→'}
                    {trend.percentageChange.toFixed(1)}% ({trend.trendStrength})
                  </div>
                </div>
              )}

              {prediction && (
                <div className="price-prediction">
                  <div className="prediction-label">1 Week Prediction:</div>
                  <div className="prediction-price">${prediction.predictedPrice.toFixed(2)}</div>
                  <div className="prediction-confidence">
                    Confidence: {(prediction.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              )}

              {bestTime && (
                <div className={`best-time-to-buy ${bestTime.recommended ? 'recommended' : 'not-recommended'}`}>
                  <div className="recommendation">
                    {bestTime.recommended ? '🟢 Good Time to Buy' : '🔴 Wait'}
                  </div>
                  <div className="reasoning">{bestTime.reasoning}</div>
                  {bestTime.expectedSavings > 0 && (
                    <div className="expected-savings">
                      Save: ${bestTime.expectedSavings.toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              <div className="price-metrics">
                <div className="metric">
                  <span className="metric-label">Volatility:</span>
                  <span 
                    className="metric-value"
                    style={{ color: getVolatilityColor(volatility) }}
                  >
                    {volatility.toFixed(1)}%
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Stability:</span>
                  <span className="metric-value">{stability.toFixed(1)}%</span>
                </div>
              </div>

              {history.length > 0 && (
                <div className="price-history">
                  <div className="history-label">Price History (7 days)</div>
                  <div className="history-chart">
                    {history.slice(-7).map((entry, index) => (
                      <div 
                        key={index}
                        className="history-bar"
                        style={{
                          height: `${(entry.salePrice || entry.price) / Math.max(...history.map(h => h.salePrice || h.price)) * 50}px`,
                          backgroundColor: entry.salePrice ? '#FF9800' : '#2196F3'
                        }}
                        title={`$${(entry.salePrice || entry.price).toFixed(2)} - ${new Date(entry.timestamp).toLocaleDateString()}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="price-alerts">
        <h3>Price Alerts</h3>
        <div className="alert-setup">
          <select 
            value={selectedStore} 
            onChange={(e) => setSelectedStore(e.target.value)}
            className="store-select"
          >
            <option value="">Select Store</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Target Price"
            value={alertPrice || ''}
            onChange={(e) => setAlertPrice(parseFloat(e.target.value) || 0)}
            className="price-input"
            step="0.01"
            min="0"
          />
          <button onClick={addPriceAlert} className="add-alert-btn">
            Add Alert
          </button>
        </div>

        <div className="alerts-list">
          {alerts.map(alert => (
            <div key={alert.id} className="alert-item">
              <span className="alert-message">{alert.message}</span>
              <span className="alert-time">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
              <button 
                onClick={() => removeAlert(alert.id)}
                className="remove-alert-btn"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RealTimePriceMonitor; 