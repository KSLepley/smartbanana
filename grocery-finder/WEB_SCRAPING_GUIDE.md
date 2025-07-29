# Web Scraping Guide for Grocery Store Price Data

## Overview

This guide provides comprehensive information on how to legally and ethically scrape real-time price data from grocery store websites. We'll cover legal considerations, technical approaches, and implementation strategies.

## 🚨 Legal & Ethical Considerations

### **Important Disclaimer**
Web scraping may be subject to legal restrictions. Always:
1. **Check Terms of Service** for each website
2. **Respect robots.txt** files
3. **Use reasonable rate limits**
4. **Consider fair use policies**
5. **Consult legal counsel** for commercial use

### **Legal Status by Store**

| Store | Scraping Policy | Rate Limits | Notes |
|-------|----------------|-------------|-------|
| **Walmart** | ✅ Generally allowed | 30 req/min | Respect robots.txt |
| **Target** | ✅ Generally allowed | 30 req/min | No aggressive scraping |
| **Kroger** | ⚠️ Limited | 20 req/min | Requires careful approach |
| **Safeway** | ⚠️ Limited | 25 req/min | Check terms of service |
| **Whole Foods** | ⚠️ Limited | 20 req/min | Amazon-owned, be cautious |
| **Trader Joe's** | ❌ Not recommended | N/A | No online ordering |
| **Publix** | ✅ Generally allowed | 20 req/min | Respect rate limits |
| **HEB** | ✅ Generally allowed | 25 req/min | Texas-focused |
| **Meijer** | ✅ Generally allowed | 20 req/min | Midwest-focused |

## 🛠️ Technical Approaches

### **1. Static Content Scraping (Easier)**

**Best for**: Stores with server-rendered content
- **Walmart**: Product pages with static pricing
- **Target**: Basic product listings
- **HEB**: Store-specific pages

```typescript
// Example: Scraping static content
const scrapeStaticContent = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
    }
  });
  
  const html = await response.text();
  return parseHTML(html);
};
```

### **2. JavaScript Rendering (Advanced)**

**Best for**: Stores with dynamic content
- **Target**: React-based product pages
- **Walmart**: Dynamic pricing updates
- **Kroger**: AJAX-loaded content

```typescript
// Example: Using Puppeteer for JavaScript rendering
import puppeteer from 'puppeteer';

const scrapeWithJavaScript = async (url: string) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set realistic user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  // Navigate to page
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  // Wait for price elements to load
  await page.waitForSelector('[data-price-type="finalPrice"]');
  
  // Extract price data
  const price = await page.$eval('[data-price-type="finalPrice"]', el => el.textContent);
  
  await browser.close();
  return price;
};
```

### **3. API Endpoint Discovery (Most Reliable)**

**Best for**: Stores with hidden APIs
- **Target**: RedSky API endpoints
- **Walmart**: Internal API calls
- **Kroger**: AJAX endpoints

```typescript
// Example: Discovering and using hidden APIs
const discoverAPIEndpoints = async (storeUrl: string) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Enable network monitoring
  await page.setRequestInterception(true);
  
  const apiEndpoints: string[] = [];
  
  page.on('request', request => {
    if (request.url().includes('/api/') || request.url().includes('/v1/')) {
      apiEndpoints.push(request.url());
    }
    request.continue();
  });
  
  await page.goto(storeUrl);
  await browser.close();
  
  return apiEndpoints;
};
```

## 📍 Location-Based Pricing

### **Why Location Matters**
Many stores show different prices based on:
- **Geographic location** (state, city, zip code)
- **Store-specific pricing**
- **Regional promotions**
- **Cost of living adjustments**

### **Implementation Strategy**

```typescript
// Example: Location-based scraping
const scrapeLocationBasedPrice = async (store: Store, item: GroceryItem) => {
  // 1. Set store location
  await setStoreLocation(store.zipCode);
  
  // 2. Search for item
  const searchUrl = buildSearchUrl(store.chain, item.name, store.zipCode);
  
  // 3. Extract location-specific price
  const price = await extractPriceFromPage(searchUrl);
  
  return {
    price,
    location: store.address,
    storeId: store.id,
    timestamp: new Date().toISOString()
  };
};
```

## 🎯 Store-Specific Strategies

### **Walmart**
```typescript
// Walmart scraping configuration
const walmartConfig = {
  baseUrl: 'https://www.walmart.com',
  searchUrl: 'https://www.walmart.com/search',
  priceSelectors: [
    '[data-price-type="finalPrice"] .price-characteristic',
    '.price-main .visuallyhidden',
    '.price-current .price-characteristic'
  ],
  locationMethod: 'storeId',
  requiresJavaScript: true,
  rateLimit: 30 // requests per minute
};
```

### **Target**
```typescript
// Target scraping configuration
const targetConfig = {
  baseUrl: 'https://www.target.com',
  searchUrl: 'https://www.target.com/s',
  priceSelectors: [
    '[data-test="product-price"]',
    '.price-current',
    '.price-sale'
  ],
  locationMethod: 'zipcode',
  requiresJavaScript: true,
  rateLimit: 30
};
```

### **Kroger**
```typescript
// Kroger scraping configuration
const krogerConfig = {
  baseUrl: 'https://www.kroger.com',
  searchUrl: 'https://www.kroger.com/search',
  priceSelectors: [
    '.price-value',
    '.product-price',
    '.price-current'
  ],
  locationMethod: 'storeId',
  requiresJavaScript: true,
  rateLimit: 20
};
```

## 🔧 Implementation Tools

### **Required Dependencies**
```bash
# For Node.js backend scraping
npm install puppeteer cheerio axios
npm install @types/puppeteer @types/cheerio

# For proxy rotation
npm install proxy-agent

# For rate limiting
npm install rate-limiter-flexible
```

### **Rate Limiting Implementation**
```typescript
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiters = new Map();

const getRateLimiter = (store: string) => {
  if (!rateLimiters.has(store)) {
    const config = storeConfigs.get(store);
    rateLimiters.set(store, new RateLimiterMemory({
      keyGenerator: () => store,
      points: config.rateLimit,
      duration: 60 // 1 minute
    }));
  }
  return rateLimiters.get(store);
};

const scrapeWithRateLimit = async (store: string, url: string) => {
  const limiter = getRateLimiter(store);
  await limiter.consume(store);
  
  // Proceed with scraping
  return await scrapeWebsite(url);
};
```

### **Proxy Rotation**
```typescript
import { HttpsProxyAgent } from 'proxy-agent';

const proxyList = [
  'http://proxy1:8080',
  'http://proxy2:8080',
  'http://proxy3:8080'
];

const getRandomProxy = () => {
  return proxyList[Math.floor(Math.random() * proxyList.length)];
};

const scrapeWithProxy = async (url: string) => {
  const proxy = getRandomProxy();
  const agent = new HttpsProxyAgent(proxy);
  
  const response = await fetch(url, {
    agent,
    headers: {
      'User-Agent': getRandomUserAgent()
    }
  });
  
  return await response.text();
};
```

## 📊 Data Extraction Patterns

### **Price Extraction**
```typescript
const extractPrice = (html: string): number | null => {
  const pricePatterns = [
    /\$(\d+\.?\d*)/g,                    // $12.99
    /(\d+\.?\d*)\s*USD/g,                // 12.99 USD
    /price["\s]*:["\s]*(\d+\.?\d*)/gi,   // "price": 12.99
    /data-price["\s]*=["\s]*["']?(\d+\.?\d*)/gi, // data-price="12.99"
    /class="price[^"]*"[^>]*>(\d+\.?\d*)/gi // class="price">12.99
  ];
  
  for (const pattern of pricePatterns) {
    const matches = html.match(pattern);
    if (matches && matches.length > 0) {
      const price = parseFloat(matches[0].replace(/[^\d.]/g, ''));
      if (!isNaN(price) && price > 0) {
        return price;
      }
    }
  }
  
  return null;
};
```

### **Stock Status Extraction**
```typescript
const extractStockStatus = (html: string): boolean => {
  const inStockPatterns = [
    /in\s*stock/gi,
    /available/gi,
    /add\s*to\s*cart/gi,
    /buy\s*now/gi,
    /ship\s*it/gi
  ];
  
  const outOfStockPatterns = [
    /out\s*of\s*stock/gi,
    /unavailable/gi,
    /sold\s*out/gi,
    /temporarily\s*unavailable/gi,
    /not\s*available/gi
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
  
  return true; // Default to in stock
};
```

## 🚀 Advanced Techniques

### **Session Management**
```typescript
const maintainSession = async (store: string) => {
  const session = {
    cookies: new Map(),
    headers: {
      'User-Agent': getRandomUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    }
  };
  
  // Get initial cookies
  const response = await fetch(storeConfigs.get(store).baseUrl, {
    headers: session.headers
  });
  
  // Extract and store cookies
  const cookies = response.headers.get('set-cookie');
  if (cookies) {
    session.cookies.set(store, cookies);
  }
  
  return session;
};
```

### **Error Handling & Retry Logic**
```typescript
const scrapeWithRetry = async (url: string, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await scrapeWebsite(url);
      return result;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
```

### **Data Validation**
```typescript
const validatePriceData = (data: any) => {
  const errors: string[] = [];
  
  if (!data.price || data.price <= 0) {
    errors.push('Invalid price');
  }
  
  if (data.price > 1000) {
    errors.push('Price seems too high');
  }
  
  if (!data.timestamp) {
    errors.push('Missing timestamp');
  }
  
  if (!data.source) {
    errors.push('Missing source');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

## 📈 Monitoring & Analytics

### **Scraping Statistics**
```typescript
const scrapingStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  storeStats: new Map()
};

const updateStats = (store: string, success: boolean, responseTime: number) => {
  scrapingStats.totalRequests++;
  
  if (success) {
    scrapingStats.successfulRequests++;
  } else {
    scrapingStats.failedRequests++;
  }
  
  // Update average response time
  const currentAvg = scrapingStats.averageResponseTime;
  const totalRequests = scrapingStats.totalRequests;
  scrapingStats.averageResponseTime = 
    (currentAvg * (totalRequests - 1) + responseTime) / totalRequests;
  
  // Update store-specific stats
  if (!scrapingStats.storeStats.has(store)) {
    scrapingStats.storeStats.set(store, {
      requests: 0,
      success: 0,
      failures: 0
    });
  }
  
  const storeStat = scrapingStats.storeStats.get(store);
  storeStat.requests++;
  if (success) {
    storeStat.success++;
  } else {
    storeStat.failures++;
  }
};
```

## 🔒 Security & Best Practices

### **User Agent Rotation**
```typescript
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
];

const getRandomUserAgent = () => {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};
```

### **Request Delays**
```typescript
const addRandomDelay = async (min = 1000, max = 3000) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
};
```

## 🎯 Next Steps

### **Immediate Actions**
1. **Start with static content scraping** for easier stores
2. **Implement rate limiting** to respect website policies
3. **Add error handling** and retry logic
4. **Monitor scraping success rates**

### **Advanced Features**
1. **Implement JavaScript rendering** for dynamic content
2. **Add proxy rotation** for better reliability
3. **Discover hidden APIs** for more efficient scraping
4. **Build data validation** and quality checks

### **Production Considerations**
1. **Set up monitoring** and alerting
2. **Implement data storage** and caching
3. **Add user authentication** and access controls
4. **Consider legal compliance** and terms of service

## 📚 Resources

### **Legal Resources**
- [Web Scraping Legal Guide](https://www.scraperapi.com/blog/is-web-scraping-legal/)
- [robots.txt Specification](https://www.robotstxt.org/robotstxt.html)
- [Fair Use Guidelines](https://www.copyright.gov/fair-use/)

### **Technical Resources**
- [Puppeteer Documentation](https://pptr.dev/)
- [Cheerio Documentation](https://cheerio.js.org/)
- [Rate Limiting Best Practices](https://github.com/animir/node-rate-limiter-flexible)

### **Community Resources**
- [Web Scraping Subreddit](https://www.reddit.com/r/webscraping/)
- [Stack Overflow Web Scraping](https://stackoverflow.com/questions/tagged/web-scraping)
- [GitHub Web Scraping Projects](https://github.com/topics/web-scraping)

---

**Remember**: Always scrape responsibly and respect website terms of service. This guide is for educational purposes only. 