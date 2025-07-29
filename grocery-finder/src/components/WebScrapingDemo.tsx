import React, { useState, useEffect } from 'react';
import { GroceryService } from '../services/groceryService';
import { GroceryItem, Store } from '../types';
import './WebScrapingDemo.css';

interface ScrapingResult {
  success: boolean;
  price?: number;
  salePrice?: number;
  inStock?: boolean;
  lastUpdated: string;
  source: string;
  error?: string;
}

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

const WebScrapingDemo: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<GroceryItem | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [popularItems, setPopularItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrapingLoading, setScrapingLoading] = useState(false);
  const [zipCode, setZipCode] = useState('90210');
  const [radius, setRadius] = useState(10);
  const [scrapingResults, setScrapingResults] = useState<Map<string, ScrapingResult>>(new Map());
  const [locationResults, setLocationResults] = useState<Map<string, LocationScrapingResult>>(new Map());
  const [scrapingStats, setScrapingStats] = useState<any>({});
  const [selectedScrapingMethod, setSelectedScrapingMethod] = useState<'basic' | 'location'>('basic');

  useEffect(() => {
    initializeDemo();
  }, []);

  const initializeDemo = async () => {
    try {
      setLoading(true);
      
      // Get popular items
      const items = await GroceryService.getPopularItems();
      setPopularItems(items);
      
      // Get stores for default location
      const storeList = await GroceryService.getStoresNearZipcode(zipCode, radius);
      setStores(storeList);
      
      // Get scraping statistics
      const stats = GroceryService.getWebScrapingStats();
      setScrapingStats(stats);
      
    } catch (error) {
      console.error('Error initializing demo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = async () => {
    try {
      setLoading(true);
      const storeList = await GroceryService.getStoresNearZipcode(zipCode, radius);
      setStores(storeList);
    } catch (error) {
      console.error('Error changing location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (item: GroceryItem) => {
    setSelectedItem(item);
    setScrapingResults(new Map());
    setLocationResults(new Map());
  };

  const handleBasicScraping = async () => {
    if (!selectedItem) return;

    try {
      setScrapingLoading(true);
      const results = await GroceryService.getPricesFromWebScraping(selectedItem.id, stores);
      setScrapingResults(results);
      
      // Update stats
      const stats = GroceryService.getWebScrapingStats();
      setScrapingStats(stats);
    } catch (error) {
      console.error('Error with basic scraping:', error);
    } finally {
      setScrapingLoading(false);
    }
  };

  const handleLocationScraping = async () => {
    if (!selectedItem) return;

    try {
      setScrapingLoading(true);
      const results = await GroceryService.getLocationBasedPricesFromWebScraping(selectedItem.id, stores);
      setLocationResults(results);
      
      // Update stats
      const stats = GroceryService.getWebScrapingStats();
      setScrapingStats(stats);
    } catch (error) {
      console.error('Error with location scraping:', error);
    } finally {
      setScrapingLoading(false);
    }
  };

  const getScrapingStatusColor = (success: boolean) => {
    return success ? '#10b981' : '#ef4444';
  };

  const formatPrice = (price?: number) => {
    return price ? `$${price.toFixed(2)}` : 'N/A';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="web-scraping-demo">
        <div className="demo-loading">
          <div className="loading-spinner"></div>
          <h2>Loading Web Scraping Demo...</h2>
          <p>Initializing store data and scraping configurations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="web-scraping-demo">
      {/* Header */}
      <div className="demo-header">
        <h1>🕷️ Web Scraping Price Monitor</h1>
        <p>Extract real-time prices from grocery store websites using advanced web scraping techniques</p>
      </div>

      {/* Controls */}
      <div className="demo-controls">
        <div className="control-group">
          <label>Location:</label>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="Enter ZIP code"
          />
          <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
            <option value={5}>5 miles</option>
            <option value={10}>10 miles</option>
            <option value={15}>15 miles</option>
            <option value={20}>20 miles</option>
          </select>
          <button onClick={handleLocationChange}>Update Location</button>
        </div>

        <div className="control-group">
          <label>Scraping Method:</label>
          <select 
            value={selectedScrapingMethod} 
            onChange={(e) => setSelectedScrapingMethod(e.target.value as 'basic' | 'location')}
          >
            <option value="basic">Basic Web Scraping</option>
            <option value="location">Location-Based Scraping</option>
          </select>
        </div>
      </div>

      {/* Item Selection */}
      <div className="item-selection">
        <h3>Select an Item to Scrape</h3>
        <div className="item-grid">
          {popularItems.map((item) => (
            <div
              key={item.id}
              className={`item-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
              onClick={() => handleItemSelect(item)}
            >
              <img src={item.imageUrl} alt={item.name} />
              <div className="item-info">
                <h4>{item.name}</h4>
                <p>{item.brand} • {item.size}</p>
                <span className="item-category">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scraping Results */}
      {selectedItem && (
        <div className="scraping-section">
          <div className="scraping-header">
            <h3>Scraping Results for {selectedItem.name}</h3>
            <div className="scraping-actions">
              {selectedScrapingMethod === 'basic' ? (
                <button 
                  onClick={handleBasicScraping} 
                  disabled={scrapingLoading}
                  className="scrape-button"
                >
                  {scrapingLoading ? '🔄 Scraping...' : '🕷️ Start Basic Scraping'}
                </button>
              ) : (
                <button 
                  onClick={handleLocationScraping} 
                  disabled={scrapingLoading}
                  className="scrape-button"
                >
                  {scrapingLoading ? '🔄 Scraping...' : '📍 Start Location Scraping'}
                </button>
              )}
            </div>
          </div>

          {/* Results Display */}
          <div className="results-container">
            {selectedScrapingMethod === 'basic' ? (
              <div className="results-grid">
                {Array.from(scrapingResults.entries()).map(([storeId, result]) => {
                  const store = stores.find(s => s.id === storeId);
                  return (
                    <div key={storeId} className="result-card">
                      <div className="result-header">
                        <h4>{store?.name || 'Unknown Store'}</h4>
                        <span 
                          className="status-indicator"
                          style={{ backgroundColor: getScrapingStatusColor(result.success) }}
                        >
                          {result.success ? '✅ Success' : '❌ Failed'}
                        </span>
                      </div>
                      
                      {result.success ? (
                        <div className="result-content">
                          <div className="price-info">
                            <span className="price">Price: {formatPrice(result.price)}</span>
                            {result.salePrice && (
                              <span className="sale-price">Sale: {formatPrice(result.salePrice)}</span>
                            )}
                          </div>
                          <div className="stock-info">
                            <span className={`stock-status ${result.inStock ? 'in-stock' : 'out-of-stock'}`}>
                              {result.inStock ? '🟢 In Stock' : '🔴 Out of Stock'}
                            </span>
                          </div>
                          <div className="meta-info">
                            <span>Source: {result.source}</span>
                            <span>Updated: {formatTimestamp(result.lastUpdated)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="error-info">
                          <span className="error-message">Error: {result.error}</span>
                          <span>Source: {result.source}</span>
                          <span>Updated: {formatTimestamp(result.lastUpdated)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="results-grid">
                {Array.from(locationResults.entries()).map(([storeId, result]) => {
                  const store = stores.find(s => s.id === storeId);
                  return (
                    <div key={storeId} className="result-card">
                      <div className="result-header">
                        <h4>{store?.name || 'Unknown Store'}</h4>
                        <span 
                          className="status-indicator"
                          style={{ backgroundColor: getScrapingStatusColor(result.success) }}
                        >
                          {result.success ? '✅ Success' : '❌ Failed'}
                        </span>
                      </div>
                      
                      {result.success ? (
                        <div className="result-content">
                          <div className="price-info">
                            <span className="price">Price: {formatPrice(result.price)}</span>
                            {result.salePrice && (
                              <span className="sale-price">Sale: {formatPrice(result.salePrice)}</span>
                            )}
                            {result.unitPrice && (
                              <span className="unit-price">Unit: {formatPrice(result.unitPrice)}</span>
                            )}
                          </div>
                          <div className="location-info">
                            <span className="location">📍 {result.location}</span>
                          </div>
                          <div className="stock-info">
                            <span className={`stock-status ${result.inStock ? 'in-stock' : 'out-of-stock'}`}>
                              {result.inStock ? '🟢 In Stock' : '🔴 Out of Stock'}
                            </span>
                          </div>
                          <div className="meta-info">
                            <span>Source: {result.source}</span>
                            <span>Updated: {formatTimestamp(result.lastUpdated)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="error-info">
                          <span className="error-message">Error: {result.error}</span>
                          <span>Location: {result.location}</span>
                          <span>Updated: {formatTimestamp(result.lastUpdated)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scraping Statistics */}
      <div className="scraping-stats">
        <h3>📊 Scraping Statistics</h3>
        <div className="stats-grid">
          {Object.entries(scrapingStats).map(([store, stats]: [string, any]) => (
            <div key={store} className="stat-card">
              <h4>{store}</h4>
              <div className="stat-details">
                <span>Requests: {stats.requests || 0}</span>
                <span>Last Request: {stats.lastRequest ? formatTimestamp(stats.lastRequest) : 'Never'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="features-section">
        <h3>🚀 Web Scraping Features</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>🕷️ Multi-Store Scraping</h4>
            <p>Extract prices from multiple grocery store websites simultaneously</p>
          </div>
          <div className="feature-card">
            <h4>📍 Location-Based Pricing</h4>
            <p>Get store-specific prices that vary by geographic location</p>
          </div>
          <div className="feature-card">
            <h4>⚡ Rate Limiting</h4>
            <p>Respect website rate limits to avoid being blocked</p>
          </div>
          <div className="feature-card">
            <h4>🔄 Retry Logic</h4>
            <p>Automatic retry with exponential backoff for failed requests</p>
          </div>
          <div className="feature-card">
            <h4>🛡️ Proxy Support</h4>
            <p>Rotate IP addresses to avoid detection and blocking</p>
          </div>
          <div className="feature-card">
            <h4>📈 Real-Time Monitoring</h4>
            <p>Track scraping success rates and performance metrics</p>
          </div>
        </div>
      </div>

      {/* Legal Notice */}
      <div className="legal-notice">
        <h3>⚠️ Important Legal Notice</h3>
        <p>
          Web scraping may be subject to legal restrictions. Always respect website terms of service, 
          robots.txt files, and use reasonable rate limits. This demo is for educational purposes only.
        </p>
      </div>
    </div>
  );
};

export default WebScrapingDemo; 