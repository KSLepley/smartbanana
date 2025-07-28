# GroceryFinder 🛒

A modern web application that helps users find the best grocery prices in their local area. Think of it as "Kayak for groceries" - compare prices across multiple grocery store chains to save money on your shopping.

## Features

### 🔍 Smart Search
- **Autocomplete Search**: Search for grocery items with real-time suggestions
- **Popular Items**: Quick access to commonly searched items
- **Category Filtering**: Browse items by category (Produce, Dairy, Meat, etc.)

### 📍 Location-Based Results
- **Zip Code Search**: Enter your zip code to find nearby stores
- **Customizable Radius**: Adjust search radius from 1-50 miles
- **Store Information**: View store addresses, phone numbers, and hours

### 💰 Price Comparison
- **Multi-Store Comparison**: See prices for the same item across different stores
- **Best Price Highlighting**: Automatically identifies the lowest price
- **Sale Detection**: Highlights items on sale with original and sale prices
- **Stock Status**: Shows whether items are in stock at each location
- **Price Range Analysis**: Displays min, max, and average prices

### 🎯 Advanced Filters
- **Maximum Price Filter**: Set a price limit for your search
- **In-Stock Only**: Filter to show only available items
- **Store Chain Preferences**: Compare specific grocery chains

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS for modern, responsive design
- **Icons**: Lucide React for beautiful, consistent icons
- **State Management**: React Hooks for local state
- **Mock Data**: Simulated grocery store and price data

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd grocery-finder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the application

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Demo Data

The application currently uses simulated data for demonstration purposes:

### Supported Store Chains
- Walmart Supercenter
- HEB Central Market
- Whole Foods Market
- Target
- Trader Joe's

### Sample Items
- Bananas (Produce)
- Milk (Dairy)
- Bread (Bakery)
- Chicken Breast (Meat)
- Eggs (Dairy)

### Demo Zip Codes
The app works best with Austin, TX zip codes (78701-78705) for the demo data.

## Project Structure

```
src/
├── components/          # React components
│   ├── SearchBar.tsx    # Search functionality with autocomplete
│   ├── LocationFilter.tsx # Location and filter controls
│   ├── PriceComparison.tsx # Price comparison display
│   └── PopularItems.tsx # Popular items grid
├── services/            # Business logic and API calls
│   └── groceryService.ts # Mock grocery data service
├── types/               # TypeScript type definitions
│   └── index.ts         # Interface definitions
├── App.tsx              # Main application component
└── index.tsx            # Application entry point
```

## Future Enhancements

### Real Data Integration
- **Grocery Store APIs**: Integrate with real grocery store APIs
- **Price Scraping**: Web scraping for price data
- **User Reviews**: Store and product reviews
- **Price History**: Track price changes over time

### Advanced Features
- **Shopping Lists**: Create and manage shopping lists
- **Price Alerts**: Get notified when prices drop
- **Store Loyalty Programs**: Integrate with store rewards
- **Nutritional Information**: Display nutritional data
- **Recipe Integration**: Suggest ingredients for recipes

### Mobile & Accessibility
- **Mobile App**: React Native or PWA
- **Voice Search**: Voice-activated search
- **Accessibility**: WCAG compliance improvements
- **Offline Support**: Service worker for offline functionality

### Social Features
- **User Accounts**: Personal shopping history
- **Community Reviews**: User-generated store reviews
- **Price Sharing**: Share deals with friends
- **Shopping Groups**: Group shopping coordination

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Unsplash** for beautiful food photography
- **Lucide** for the excellent icon library
- **Tailwind CSS** for the utility-first CSS framework
- **Create React App** for the development setup

---

**Note**: This is a demonstration application. The grocery store data and prices are simulated for educational and demonstration purposes. In a production environment, you would integrate with real grocery store APIs or implement web scraping to get actual price data.
