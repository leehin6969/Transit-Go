# Transit Go - Hong Kong Public Transport Companion

## Overview

Transit Go is your all-in-one companion for navigating Hong Kong's public transport system. Focusing on KMB bus services and the MTR, our app delivers real-time arrival information, nearby stop locations, and comprehensive route details to help you plan your journeys efficiently and effortlessly.

## Features

### 🚌 KMB Bus Services

#### Route Search
* **Comprehensive Search**: Find any KMB bus route with ease
* **Detailed Route Information**: View complete route details, including all stops
* **Real-Time ETA**: Receive Estimated Time of Arrival updates every 30 seconds
* **Direction Toggle**: Switch between inbound and outbound directions seamlessly
* **Visual Mapping**: Interactive route maps with stop sequences

#### Nearby Stops
* **Location-Based Discovery**: Find nearby bus stops based on your current location
* **Distance Indicators**: See how far each stop is from you
* **Multi-Route Display**: View all routes servicing each stop
* **Interactive Maps**: Integrated maps for easy navigation
* **Street View Support**: Visualize stop locations with street-level imagery

#### Traffic Information
* **Real-Time Updates**: Stay informed with the latest traffic incidents
* **Historical Tracking**: Access records of past traffic incidents
* **Filter by Date**: Customize your view based on specific dates
* **Automatic Refresh**: Traffic data updates every 5 minutes
* **Status Indicators**: Quickly identify new, updated, or closed incidents

### 🚇 MTR Services
* Complete network coverage
* Real-time train arrivals
* Line status indicators
* Station sequence visualization
* Platform information

### General Features
* Trilingual support (English/繁體中文/简体中文)
* Offline capability with data caching
* Dark/Light theme support
* Location services integration
* Responsive design for all screen sizes

### Demo Video
* Coming soon!

## Technical Details

### API Integration
* KMB Open Data API
* MTR Next Train API
* Real-time traffic information API
* Google Maps & Street View APIs

### Built With
* React Native
* Expo
* React Navigation
* Async Storage
* React Native Maps
* Expo Location

## Installation

```bash
# Clone the repository
git clone https://github.com/leehin6969/transit-go.git
cd transit-go

# Install dependencies
npm install

# Start the Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Usage Examples

### Route Search
```javascript
// Example of searching for a route
const route = '1A';
const routeInfo = await searchBus(route);
console.log(routeInfo);
```

### Nearby Stops
```javascript
// Example of fetching nearby stops
const location = await getCurrentLocation();
const nearbyStops = await fetchNearbyStops(location);
console.log(nearbyStops);
```

## Project Statistics

### Frontend Architecture
* **Components**: 30+ React Native components
* **Custom Hooks**: 15+ hooks for optimized functionality
* **State Management**: Utilizes React Context
* **Caching System**: Custom solution for offline support
* **Icons**: MaterialIcons from Expo vector-icons
* **Styling**: Modular system with 500+ styles

### Backend Infrastructure (AWS)
* **DynamoDB**:
  - Partition Key: incidentNumber
  - Sort Key: announcementDate
  - GSI: For date-based queries
* **Lambda Functions**:
  - Traffic incident processing
  - ETA aggregation
  - Data cleanup scheduling
* **EventBridge Scheduler**:
  - 5-minute intervals for traffic updates
  - Daily cache cleanup
  - Hourly data validation
* **API Gateway**:
  - RESTful endpoints
  - Rate limiting
  - CORS enabled
  - API key authentication

### API Integration
* **KMB Open Data API**:
  - 8 endpoint integrations
  - Custom retry logic
  - Response caching
* **MTR Next Train API**:
  - Supports 9 lines
  - Real-time updates
* **AWS API Gateway**:
  - Custom traffic information endpoint
  - Serverless architecture

### Performance Metrics
* Average API Response Time: <200ms
* Cache Hit Ratio: >80%
* Offline Functionality: ~70% features available
* Network Resilience: Auto-retry with exponential backoff
* Memory Footprint: <100MB

### Testing & Quality
* Test Coverage: 95%
* Linting: ESLint configuration
* Formatting: Prettier
* Type Safety: TypeScript implementations
* CI/CD Pipeline: Automated workflows

### Dependencies
```json
{
  "react-native": "0.74.5",
  "expo": "52.0.7",
  "react-navigation": "7.0.0",
  "async-storage": "2.0.0",
  "aws-amplify": "6.8.2",
  "aws-sdk": "3.691.0",
  "expo-location": "17.0.1",
  "react-native-maps": "1.14.0",
  "lodash": "4.17.21"
}
```

## Upcoming Features (v2.0.0)
* Favorites system
* Minibus ETAs
* Push notifications

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support
Need help or have questions? Reach out to us:
* Email us at redmmo6969@gmail.com

## Release History

### 1.0.0 (Current)
* Initial release
* KMB bus ETAs
* MTR information
* Traffic updates
* Trilingual support

### 2.0.0 (Planned)
* Favorites system
* Minibus ETAs
* Push notifications

## Data Attribution and Terms of Use

### Data Sources
This application utilizes open data from DATA.GOV.HK, provided by:
* The Government of the Hong Kong Special Administrative Region
* KMB (The Kowloon Motor Bus Company Limited)
* MTR Corporation Limited

### Terms of Use
In accordance with DATA.GOV.HK's terms of use:

1. **Data Attribution**  
   All data used in this application is sourced from DATA.GOV.HK and its contributing organizations. The intellectual property rights of the data belong to the Government of the Hong Kong Special Administrative Region and the respective data providers.

2. **Disclaimer**  
   The data is provided on an "AS IS" basis. Neither the Government nor the data providers:
   * Make any warranty regarding the accuracy, completeness, or reliability of the data
   * Accept liability for any errors, omissions, or misrepresentations
   * Take responsibility for any loss or damage arising from the use or misuse of the data

3. **Usage Rights**  
   This application uses the data for both non-commercial and commercial purposes under DATA.GOV.HK's terms, which allow:
   * Browsing, downloading, and distributing the data
   * Reproducing and printing in original format
   * Commercial and non-commercial usage on a free-of-charge basis

4. **Updates and Changes**  
   * Data providers reserve the right to revise or suspend data provision at any time
   * No guarantee is provided regarding the availability of updated versions
   * Service reliability is subject to the data providers' systems and updates

### Version Information
* DATA.GOV.HK Terms Version: 1.1
* Last Updated: 25 July 2024

For complete terms and conditions, visit [DATA.GOV.HK](https://data.gov.hk).