# 🍌 Smart Banana - Grocery Price Comparison MVP

An intelligent grocery price comparison platform that helps you find the best deals across local stores. Think Expedia for groceries!

## ✨ Features

### Core MVP Features
- **🔍 Smart Search**: Search for groceries, brands, or categories with intelligent autocomplete
- **💰 Price Comparison**: Compare prices across multiple local stores in real-time
- **📍 Location-Based**: Find stores within your specified radius
- **🏆 Best Price Highlighting**: Automatically highlights the best deals
- **📊 Price Analytics**: View price ranges, averages, and potential savings
- **🎯 Smart Alternatives**: Get suggestions for cheaper alternatives and price trends
- **📱 Responsive Design**: Beautiful, modern UI that works on all devices

### Advanced Features (Coming Soon)
- **🤖 AI-Powered Recommendations**: Ingredient analysis and alternative suggestions
- **📈 Price History**: Track price changes over time
- **🔔 Price Alerts**: Get notified when prices drop
- **🛒 Shopping Lists**: Save and compare multiple items
- **📱 Mobile App**: Native mobile experience

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

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
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

Smart Banana features a modern, gradient-rich design with:
- **Color Palette**: Warm oranges and yellows inspired by the banana theme
- **Typography**: Inter font family for clean, readable text
- **Glass Morphism**: Subtle transparency and blur effects
- **Micro-interactions**: Smooth animations and hover effects
- **Responsive Layout**: Optimized for desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Build Tool**: Create React App

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── SearchBar.tsx   # Smart search with autocomplete
│   ├── PriceComparison.tsx # Price comparison display
│   ├── LocationFilter.tsx  # Location and filter controls
│   └── PopularItems.tsx    # Popular items sidebar
├── services/           # Business logic and API calls
│   └── groceryService.ts   # Main service for data
├── types/              # TypeScript type definitions
│   └── index.ts        # Core types
└── App.tsx             # Main application component
```

## 🎯 MVP Roadmap

### Phase 1: Core Features ✅
- [x] Search functionality
- [x] Price comparison
- [x] Location filtering
- [x] Responsive design
- [x] Modern UI/UX

### Phase 2: Enhanced Features 🚧
- [ ] Real store data integration
- [ ] Price history tracking
- [ ] User accounts
- [ ] Shopping lists
- [ ] Price alerts

### Phase 3: AI Features 🔮
- [ ] AI-powered recommendations
- [ ] Ingredient analysis
- [ ] Smart alternatives
- [ ] Price prediction
- [ ] Personalized deals

## 🤝 Contributing

This is an MVP version. For contributions:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🍌 About Smart Banana

Smart Banana is designed to be the ultimate grocery shopping companion, helping users save money by finding the best prices and discovering cheaper alternatives. The platform combines real-time price data with intelligent recommendations to make grocery shopping smarter and more efficient.

---

**Note**: This MVP uses simulated data for demonstration purposes. Real store integration will be added in future phases.
