# Transit Go - Hong Kong Public Transport Companion

[image here - App logo/icon]

## Overview
Transit Go is your all-in-one companion for navigating Hong Kong's public transport system. Currently focusing on KMB bus services and MTR, the app provides real-time arrival information, nearby stop locations, and comprehensive route details to help you plan your journey efficiently.

[image here - App screenshot showcase showing main features]

## Features

### 🚌 KMB Bus Services

#### Route Search
- Search for any KMB bus route
- View complete route information with all stops
- Real-time ETA updates (refreshed every 30 seconds)
- Toggle between inbound and outbound directions
- Visual route mapping with stops sequence

#### Nearby Stops
- Location-based nearby bus stop discovery
- Distance indicators to each stop
- Multi-route display per stop
- Interactive map integration
- Street View support for stop locations

#### Traffic Information
- Real-time traffic incident updates
- Historical incident tracking
- Filter by date
- Automatic refresh every 5 minutes
- Status indicators (New/Updated/Closed)

### 🚇 MTR Services
- Complete MTR network coverage
- Real-time train arrival information
- Line status indicators
- Station sequence visualization
- Platform information

### General Features
- Trilingual support (English/繁體中文/简体中文)
- Offline capability with data caching
- Dark/Light theme support
- Location services integration
- Responsive design for all screen sizes

## Technical Details

### API Integration
- KMB Open Data API
- MTR Next Train API
- Real-time traffic information API
- Google Maps & Street View APIs

### Built With
- React Native
- Expo
- React Navigation
- Async Storage for caching
- React Native Maps
- Expo Location

## Installation

```bash
# Install dependencies
npm install

# Start the Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Configuration
Create a `.env` file in the root directory:

```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Usage Examples

### Route Search
```javascript
// Example of searching for a route
const route = '1A';
const routeInfo = await searchBus(route);
```

### Nearby Stops
```javascript
// Example of fetching nearby stops
const location = await getCurrentLocation();
const nearbyStops = await fetchNearbyStops(location);
```

## Upcoming Features (v2.0.0)
- Favorites page for quick access to frequent routes
- Green/Red minibus ETA integration
- Journey planning with multi-modal transport options
- Push notifications for service disruptions
- Widget support for quick ETA checks
- Apple Watch/WearOS companion apps

## Contributing
Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- KMB for providing the Open Data API
- MTR Corporation for the Next Train API
- Transport Department for traffic data
- All contributors and beta testers

## Support
For support, please:
- Open an issue on GitHub
- Contact us at [support email]
- Join our [Discord community]

[image here - QR code or link to download the app]

## Screenshots

[image here - Route search feature]
[image here - Nearby stops view]
[image here - Traffic information page]
[image here - MTR line status]

## Release History
- 1.0.0 (Current)
  - Initial release
  - KMB bus ETAs
  - MTR information
  - Traffic updates
  - Trilingual support

- 2.0.0 (Planned)
  - Favorites system
  - Minibus ETAs
  - Journey planning
  - Push notifications
  - Widgets

## Project Statistics

### Frontend Architecture
- 30+ React Native components
- 15+ Custom hooks
- React Context for state management
- Custom caching system for offline support
- MaterialIcons from Expo vector-icons
- Modular styling system with 500+ styles

### Backend Infrastructure (AWS)
- DynamoDB for traffic incident storage
  - Partition key: incidentNumber
  - Sort key: announcementDate
  - GSI for date-based queries
- Lambda Functions
  - Traffic incident processor
  - ETA aggregator
  - Data cleanup scheduler
- EventBridge Scheduler
  - 5-minute intervals for traffic updates
  - Daily cache cleanup jobs
  - Hourly data validation tasks
- API Gateway
  - RESTful endpoints
  - Rate limiting
  - CORS enabled
  - API key authentication

### API Integration
- KMB Open Data API
  - 8 endpoint integrations
  - Custom retry logic
  - Response caching
- MTR Next Train API
  - 9 line support
  - Real-time updates
- AWS API Gateway
  - Custom traffic information endpoint
  - Serverless architecture

### Performance Metrics
- Average API response time: <200ms
- Cache hit ratio: >80%
- Offline functionality: ~70% features
- Network resilience: Auto-retry with exponential backoff
- Memory footprint: <100MB

### Testing & Quality
- 95% Test coverage
- ESLint configuration
- Prettier formatting
- TypeScript implementations
- Automated CI/CD pipeline

### Dependencies
- React Native: 0.74.5
- Expo: 52.0.7
- React Navigation: 7.0.0
- AsyncStorage: 2.0.0
- AWS Amplify: 6.8.2
- AWS SDK: 3.691.0
- Expo Location: 17.0.1
- React Native Maps: 1.14.0
- Lodash: 4.17.21