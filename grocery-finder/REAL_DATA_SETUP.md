# Real Data Setup Guide

This guide will help you integrate real grocery store data into your GroceryFinder app.

## 🎯 What You'll Get

With real API integrations, your app will show:
- **Real store locations** from actual grocery chains
- **Current prices** from store databases
- **Accurate inventory** information
- **Real-time data** updates

## 🚀 Quick Start

### 1. Set Up Environment Variables

Create a `.env` file in your project root:

```bash
# Copy the template
cp .env.example .env

# Edit with your API keys
nano .env
```

### 2. Essential APIs to Start With

#### Google Places API (Required for Locations)
```bash
# Get free API key
# 1. Go to https://console.cloud.google.com/
# 2. Create new project or select existing
# 3. Enable Places API and Geocoding API
# 4. Create credentials (API key)
# 5. Add to .env file:
REACT_APP_GOOGLE_PLACES_API_KEY=your_api_key_here
```

#### Walmart API (Recommended)
```bash
# Apply for access
# 1. Go to https://developer.walmart.com/
# 2. Sign up for developer account
# 3. Apply for API access
# 4. Get API key after approval
# 5. Add to .env file:
REACT_APP_WALMART_API_KEY=your_walmart_api_key_here
```

## 📊 Available APIs

### Free APIs (No Cost)
- **Google Places API**: $200/month free credit
- **OpenStreetMap Nominatim**: Completely free
- **Zip Code API**: Free tier available

### Paid APIs (Require Application)
- **Walmart API**: Varies by usage
- **Target API**: Varies by usage  
- **Kroger API**: Varies by usage
- **Safeway API**: Varies by usage
- **Albertsons API**: Varies by usage
- **Whole Foods API**: Varies by usage
- **Trader Joe's API**: Varies by usage
- **Publix API**: Varies by usage
- **HEB API**: Varies by usage
- **Meijer API**: Varies by usage

## 🔧 API Setup Instructions

### Google Places API (Essential)

**Cost**: Free tier with $200/month credit

**Setup**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Places API
   - Geocoding API
   - Maps JavaScript API
4. Create credentials (API key)
5. Set restrictions (recommended):
   - HTTP referrers: `localhost:3000/*`
   - API restrictions: Places API, Geocoding API
6. Add to `.env`:
   ```
   REACT_APP_GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

**What it provides**:
- Convert zip codes to real coordinates
- Find actual grocery stores near location
- Get store names, addresses, phone numbers

### Walmart API

**Cost**: Varies by usage tier

**Setup**:
1. Go to [Walmart Developer Portal](https://developer.walmart.com/)
2. Sign up for developer account
3. Apply for API access (may take 1-2 weeks)
4. Get API key after approval
5. Add to `.env`:
   ```
   REACT_APP_WALMART_API_KEY=your_walmart_api_key_here
   ```

**What it provides**:
- Real Walmart store locations
- Current product prices
- Inventory availability
- Store hours and contact info

### Target API

**Cost**: Varies by usage tier

**Setup**:
1. Go to [Target Developer Portal](https://developers.target.com/)
2. Sign up for developer account
3. Apply for API access
4. Get API key after approval
5. Add to `.env`:
   ```
   REACT_APP_TARGET_API_KEY=your_target_api_key_here
   ```

**What it provides**:
- Real Target store locations
- Current product prices
- Product availability
- Store information

### Kroger API

**Cost**: Varies by usage tier

**Setup**:
1. Go to [Kroger Developer Portal](https://developer.kroger.com/)
2. Sign up for developer account
3. Apply for API access
4. Get API key after approval
5. Add to `.env`:
   ```
   REACT_APP_KROGER_API_KEY=your_kroger_api_key_here
   ```

**What it provides**:
- Real Kroger store locations
- Current product prices
- Inventory levels
- Store details

## 🛠️ Implementation Steps

### Step 1: Enable Real APIs

Edit `src/services/groceryService.ts` and uncomment the real API calls:

```typescript
// In RealLocationService.getLocationFromGooglePlaces()
const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${apiConfig.googlePlaces.apiKey}`);
```

### Step 2: Add API Configuration

Import the API config:

```typescript
import { loadAPIConfig } from '../config/apiConfig';

const apiConfig = loadAPIConfig();
```

### Step 3: Test Real Data

1. Start the app: `npm start`
2. Enter a zip code (e.g., 10001 for NYC)
3. Search for an item
4. Verify real store locations appear

## 🔍 Testing Real Data

### Test Locations
```bash
# Test with these zip codes:
10001  # New York, NY
90210  # Beverly Hills, CA
33101  # Miami, FL
60601  # Chicago, IL
75001  # Dallas, TX
```

### Expected Results
- Real store names (Walmart, Target, etc.)
- Actual addresses
- Real phone numbers
- Current prices (if API available)

## 💰 Cost Estimation

### Monthly Costs (Typical Usage)
- **Google Places API**: $0-50 (free tier covers most usage)
- **Walmart API**: $100-500 (depending on calls)
- **Target API**: $100-500 (depending on calls)
- **Kroger API**: $100-500 (depending on calls)

### Free Alternative
If you want to start without costs:
1. Use only Google Places API (free tier)
2. Use realistic price simulation
3. Add paid APIs later as needed

## 🚨 Important Notes

### Rate Limits
- Google Places: 1000 requests/day free
- Walmart: Varies by plan
- Target: Varies by plan
- Kroger: Varies by plan

### API Keys Security
- Never commit API keys to git
- Use environment variables
- Set up API key restrictions
- Monitor usage regularly

### Fallback Strategy
The app includes fallback mechanisms:
1. Try real API first
2. Fall back to realistic simulation
3. Always provide results

## 🆘 Troubleshooting

### Common Issues

**"API key not found"**
- Check `.env` file exists
- Verify environment variable names
- Restart development server

**"No stores found"**
- Check API key is valid
- Verify API is enabled
- Check rate limits

**"Prices not updating"**
- Verify store API keys
- Check API documentation
- Test API endpoints directly

### Getting Help

1. Check API provider documentation
2. Verify your API keys are active
3. Test API endpoints with Postman
4. Check browser console for errors

## 📈 Next Steps

1. **Start with Google Places API** (free)
2. **Add one store API** (Walmart recommended)
3. **Test thoroughly** with real zip codes
4. **Monitor costs** and usage
5. **Add more APIs** as needed

## 🎉 Success!

Once configured, your app will show:
- ✅ Real grocery store locations
- ✅ Actual store names and addresses
- ✅ Current prices (if API available)
- ✅ Real-time data updates
- ✅ Professional-grade accuracy

Your GroceryFinder app will now provide real value to users with accurate, current information! 