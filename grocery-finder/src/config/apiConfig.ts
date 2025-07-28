// API Configuration for Real Grocery Store Data
// This file contains configuration for integrating with real grocery store APIs

export interface APIConfig {
  googlePlaces: {
    apiKey: string;
    enabled: boolean;
  };
  walmart: {
    apiKey: string;
    enabled: boolean;
    baseUrl: string;
  };
  target: {
    apiKey: string;
    enabled: boolean;
    baseUrl: string;
  };
  kroger: {
    apiKey: string;
    enabled: boolean;
    baseUrl: string;
  };
  safeway: {
    apiKey: string;
    enabled: boolean;
    baseUrl: string;
  };
  albertsons: {
    apiKey: string;
    enabled: boolean;
    baseUrl: string;
  };
  wholeFoods: {
    apiKey: string;
    enabled: boolean;
    baseUrl: string;
  };
  traderJoes: {
    apiKey: string;
    enabled: boolean;
    baseUrl: string;
  };
  publix: {
    apiKey: string;
    enabled: boolean;
    baseUrl: string;
  };
  heb: {
    apiKey: string;
    enabled: boolean;
    baseUrl: string;
  };
  meijer: {
    apiKey: string;
    enabled: boolean;
    baseUrl: string;
  };
}

// Default configuration (all disabled for safety)
export const defaultAPIConfig: APIConfig = {
  googlePlaces: {
    apiKey: '',
    enabled: false
  },
  walmart: {
    apiKey: '',
    enabled: false,
    baseUrl: 'https://www.walmart.com/api/v3'
  },
  target: {
    apiKey: '',
    enabled: false,
    baseUrl: 'https://redsky.target.com/v3'
  },
  kroger: {
    apiKey: '',
    enabled: false,
    baseUrl: 'https://www.kroger.com/api/v1'
  },
  safeway: {
    apiKey: '',
    enabled: false,
    baseUrl: 'https://www.safeway.com/api/v1'
  },
  albertsons: {
    apiKey: '',
    enabled: false,
    baseUrl: 'https://www.albertsons.com/api/v1'
  },
  wholeFoods: {
    apiKey: '',
    enabled: false,
    baseUrl: 'https://www.wholefoodsmarket.com/api/v1'
  },
  traderJoes: {
    apiKey: '',
    enabled: false,
    baseUrl: 'https://www.traderjoes.com/api/v1'
  },
  publix: {
    apiKey: '',
    enabled: false,
    baseUrl: 'https://www.publix.com/api/v1'
  },
  heb: {
    apiKey: '',
    enabled: false,
    baseUrl: 'https://www.heb.com/api/v1'
  },
  meijer: {
    apiKey: '',
    enabled: false,
    baseUrl: 'https://www.meijer.com/api/v1'
  }
};

// Load configuration from environment variables
export function loadAPIConfig(): APIConfig {
  return {
    googlePlaces: {
      apiKey: process.env.REACT_APP_GOOGLE_PLACES_API_KEY || '',
      enabled: !!process.env.REACT_APP_GOOGLE_PLACES_API_KEY
    },
    walmart: {
      apiKey: process.env.REACT_APP_WALMART_API_KEY || '',
      enabled: !!process.env.REACT_APP_WALMART_API_KEY,
      baseUrl: process.env.REACT_APP_WALMART_BASE_URL || defaultAPIConfig.walmart.baseUrl
    },
    target: {
      apiKey: process.env.REACT_APP_TARGET_API_KEY || '',
      enabled: !!process.env.REACT_APP_TARGET_API_KEY,
      baseUrl: process.env.REACT_APP_TARGET_BASE_URL || defaultAPIConfig.target.baseUrl
    },
    kroger: {
      apiKey: process.env.REACT_APP_KROGER_API_KEY || '',
      enabled: !!process.env.REACT_APP_KROGER_API_KEY,
      baseUrl: process.env.REACT_APP_KROGER_BASE_URL || defaultAPIConfig.kroger.baseUrl
    },
    safeway: {
      apiKey: process.env.REACT_APP_SAFEWAY_API_KEY || '',
      enabled: !!process.env.REACT_APP_SAFEWAY_API_KEY,
      baseUrl: process.env.REACT_APP_SAFEWAY_BASE_URL || defaultAPIConfig.safeway.baseUrl
    },
    albertsons: {
      apiKey: process.env.REACT_APP_ALBERTSONS_API_KEY || '',
      enabled: !!process.env.REACT_APP_ALBERTSONS_API_KEY,
      baseUrl: process.env.REACT_APP_ALBERTSONS_BASE_URL || defaultAPIConfig.albertsons.baseUrl
    },
    wholeFoods: {
      apiKey: process.env.REACT_APP_WHOLE_FOODS_API_KEY || '',
      enabled: !!process.env.REACT_APP_WHOLE_FOODS_API_KEY,
      baseUrl: process.env.REACT_APP_WHOLE_FOODS_BASE_URL || defaultAPIConfig.wholeFoods.baseUrl
    },
    traderJoes: {
      apiKey: process.env.REACT_APP_TRADER_JOES_API_KEY || '',
      enabled: !!process.env.REACT_APP_TRADER_JOES_API_KEY,
      baseUrl: process.env.REACT_APP_TRADER_JOES_BASE_URL || defaultAPIConfig.traderJoes.baseUrl
    },
    publix: {
      apiKey: process.env.REACT_APP_PUBLIX_API_KEY || '',
      enabled: !!process.env.REACT_APP_PUBLIX_API_KEY,
      baseUrl: process.env.REACT_APP_PUBLIX_BASE_URL || defaultAPIConfig.publix.baseUrl
    },
    heb: {
      apiKey: process.env.REACT_APP_HEB_API_KEY || '',
      enabled: !!process.env.REACT_APP_HEB_API_KEY,
      baseUrl: process.env.REACT_APP_HEB_BASE_URL || defaultAPIConfig.heb.baseUrl
    },
    meijer: {
      apiKey: process.env.REACT_APP_MEIJER_API_KEY || '',
      enabled: !!process.env.REACT_APP_MEIJER_API_KEY,
      baseUrl: process.env.REACT_APP_MEIJER_BASE_URL || defaultAPIConfig.meijer.baseUrl
    }
  };
}

// API Documentation and Setup Instructions
export const API_SETUP_INSTRUCTIONS = {
  googlePlaces: {
    name: 'Google Places API',
    description: 'For real store locations and geocoding',
    setup: [
      '1. Go to Google Cloud Console',
      '2. Enable Places API and Geocoding API',
      '3. Create API key with appropriate restrictions',
      '4. Set REACT_APP_GOOGLE_PLACES_API_KEY in .env file'
    ],
    cost: 'Free tier: $200/month credit, then pay-per-use',
    endpoints: [
      'Geocoding: Convert zip codes to coordinates',
      'Places Nearby: Find grocery stores near location'
    ]
  },
  walmart: {
    name: 'Walmart API',
    description: 'For Walmart store locations and prices',
    setup: [
      '1. Apply for Walmart API access at developer.walmart.com',
      '2. Get API key after approval',
      '3. Set REACT_APP_WALMART_API_KEY in .env file'
    ],
    cost: 'Varies by usage tier',
    endpoints: [
      'Store Locator: Find nearby Walmart stores',
      'Product Search: Get product information and prices'
    ]
  },
  target: {
    name: 'Target API',
    description: 'For Target store locations and prices',
    setup: [
      '1. Apply for Target API access at developers.target.com',
      '2. Get API key after approval',
      '3. Set REACT_APP_TARGET_API_KEY in .env file'
    ],
    cost: 'Varies by usage tier',
    endpoints: [
      'Store Locator: Find nearby Target stores',
      'Product Catalog: Get product information and prices'
    ]
  },
  kroger: {
    name: 'Kroger API',
    description: 'For Kroger store locations and prices',
    setup: [
      '1. Apply for Kroger API access at developer.kroger.com',
      '2. Get API key after approval',
      '3. Set REACT_APP_KROGER_API_KEY in .env file'
    ],
    cost: 'Varies by usage tier',
    endpoints: [
      'Store Locator: Find nearby Kroger stores',
      'Product Search: Get product information and prices'
    ]
  }
};

// Environment variables template for .env file
export const ENV_TEMPLATE = `
# Google Places API (for real locations)
REACT_APP_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# Walmart API
REACT_APP_WALMART_API_KEY=your_walmart_api_key_here
REACT_APP_WALMART_BASE_URL=https://www.walmart.com/api/v3

# Target API
REACT_APP_TARGET_API_KEY=your_target_api_key_here
REACT_APP_TARGET_BASE_URL=https://redsky.target.com/v3

# Kroger API
REACT_APP_KROGER_API_KEY=your_kroger_api_key_here
REACT_APP_KROGER_BASE_URL=https://www.kroger.com/api/v1

# Safeway API
REACT_APP_SAFEWAY_API_KEY=your_safeway_api_key_here
REACT_APP_SAFEWAY_BASE_URL=https://www.safeway.com/api/v1

# Albertsons API
REACT_APP_ALBERTSONS_API_KEY=your_albertsons_api_key_here
REACT_APP_ALBERTSONS_BASE_URL=https://www.albertsons.com/api/v1

# Whole Foods API
REACT_APP_WHOLE_FOODS_API_KEY=your_whole_foods_api_key_here
REACT_APP_WHOLE_FOODS_BASE_URL=https://www.wholefoodsmarket.com/api/v1

# Trader Joe's API
REACT_APP_TRADER_JOES_API_KEY=your_trader_joes_api_key_here
REACT_APP_TRADER_JOES_BASE_URL=https://www.traderjoes.com/api/v1

# Publix API
REACT_APP_PUBLIX_API_KEY=your_publix_api_key_here
REACT_APP_PUBLIX_BASE_URL=https://www.publix.com/api/v1

# HEB API
REACT_APP_HEB_API_KEY=your_heb_api_key_here
REACT_APP_HEB_BASE_URL=https://www.heb.com/api/v1

# Meijer API
REACT_APP_MEIJER_API_KEY=your_meijer_api_key_here
REACT_APP_MEIJER_BASE_URL=https://www.meijer.com/api/v1
`; 