import React, { useState, useEffect } from 'react';
import { GroceryService } from '../services/groceryService';
import { GroceryItem, Store } from '../types';
import RealTimePriceMonitor from './RealTimePriceMonitor';
import './PriceMonitoringDemo.css';

const PriceMonitoringDemo: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<GroceryItem | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [popularItems, setPopularItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [zipCode, setZipCode] = useState('90210');
  const [radius, setRadius] = useState(10);

  useEffect(() => {
    initializeDemo();
  }, []);

  const initializeDemo = async () => {
    try {
      setLoading(true);
      
      // Load popular items
      const items = await GroceryService.getPopularItems();
      setPopularItems(items);
      
      // Load stores near the default zip code
      const nearbyStores = await GroceryService.getStoresNearZipcode(zipCode, radius);
      setStores(nearbyStores);
      
      // Set first item as default
      if (items.length > 0) {
        setSelectedItem(items[0]);
      }
      
    } catch (error) {
      console.error('Error initializing demo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = async () => {
    try {
      setLoading(true);
      const nearbyStores = await GroceryService.getStoresNearZipcode(zipCode, radius);
      setStores(nearbyStores);
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (item: GroceryItem) => {
    setSelectedItem(item);
  };

  if (loading) {
    return (
      <div className="demo-loading">
        <div className="loading-spinner"></div>
        <p>Loading real-time price monitoring demo...</p>
      </div>
    );
  }

  return (
    <div className="price-monitoring-demo">
      <div className="demo-header">
        <h1>🛒 Real-Time Grocery Price Monitor</h1>
        <p>Track live prices, get alerts, and find the best deals in real-time</p>
      </div>

      <div className="demo-controls">
        <div className="location-controls">
          <div className="control-group">
            <label htmlFor="zipCode">Zip Code:</label>
            <input
              id="zipCode"
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter zip code"
              maxLength={5}
            />
          </div>
          <div className="control-group">
            <label htmlFor="radius">Radius (miles):</label>
            <select
              id="radius"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
            >
              <option value={5}>5 miles</option>
              <option value={10}>10 miles</option>
              <option value={15}>15 miles</option>
              <option value={25}>25 miles</option>
            </select>
          </div>
          <button onClick={handleLocationChange} className="update-location-btn">
            Update Location
          </button>
        </div>

        <div className="store-count">
          <span>📍 {stores.length} stores found nearby</span>
        </div>
      </div>

      <div className="demo-content">
        <div className="item-selection">
          <h2>Select an Item to Monitor</h2>
          <div className="popular-items-grid">
            {popularItems.map((item) => (
              <div
                key={item.id}
                className={`item-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
                onClick={() => handleItemSelect(item)}
              >
                <img src={item.imageUrl} alt={item.name} className="item-thumbnail" />
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>{item.brand}</p>
                  <span className="item-category">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedItem && stores.length > 0 && (
          <div className="monitor-section">
            <RealTimePriceMonitor
              itemId={selectedItem.id}
              stores={stores}
              item={selectedItem}
            />
          </div>
        )}

        {selectedItem && stores.length === 0 && (
          <div className="no-stores-message">
            <h3>No stores found in your area</h3>
            <p>Try adjusting your zip code or radius to find nearby grocery stores.</p>
          </div>
        )}
      </div>

      <div className="demo-features">
        <h2>✨ Real-Time Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Live Price Tracking</h3>
            <p>Monitor prices in real-time across multiple stores with automatic updates every 5 minutes.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Price Trends & Predictions</h3>
            <p>Analyze price trends and get AI-powered predictions for future price movements.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛎️</div>
            <h3>Smart Price Alerts</h3>
            <p>Set custom price alerts and get notified when prices drop to your target level.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Best Time to Buy</h3>
            <p>Get recommendations on when to buy based on historical price data and current trends.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Real-Time Notifications</h3>
            <p>Receive instant browser notifications for price changes and stock updates.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Price Analytics</h3>
            <p>View price volatility, stability scores, and historical price charts for informed decisions.</p>
          </div>
        </div>
      </div>

      <div className="demo-info">
        <h2>ℹ️ How It Works</h2>
        <div className="info-content">
          <div className="info-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Select Your Location</h3>
              <p>Enter your zip code and set the search radius to find nearby grocery stores.</p>
            </div>
          </div>
          <div className="info-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Choose Items to Monitor</h3>
              <p>Select from popular grocery items or search for specific products you want to track.</p>
            </div>
          </div>
          <div className="info-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Start Real-Time Monitoring</h3>
              <p>Click "Start Monitoring" to begin tracking live prices across all nearby stores.</p>
            </div>
          </div>
          <div className="info-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Get Smart Insights</h3>
              <p>View price trends, predictions, and recommendations to make informed purchasing decisions.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-footer">
        <p>
          <strong>Note:</strong> This demo uses simulated data. In a production environment, 
          this would connect to real grocery store APIs for live price data.
        </p>
        <p>
          <strong>Supported Stores:</strong> Walmart, Target, Kroger, Safeway, Albertsons, 
          Whole Foods, Trader Joe's, Publix, HEB, Meijer, and more.
        </p>
      </div>
    </div>
  );
};

export default PriceMonitoringDemo; 