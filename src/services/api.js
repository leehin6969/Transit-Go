// api.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const BASE_URL = 'https://data.etabus.gov.hk/v1/transport/kmb';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Cache configuration
const CACHE_DURATION = {
    STOPS: 24 * 60 * 60 * 1000,    // 24 hours for stops data
    ROUTES: 24 * 60 * 60 * 1000,   // 24 hours for route data
    ETA: 10 * 1000,                // 10 seconds for ETA data
};

// Cache storage
const cache = {
    stops: { data: null, timestamp: 0 },
    routes: { data: {}, timestamp: {} },
    eta: { data: {}, timestamp: {} }
};

// Cache keys for AsyncStorage
const CACHE_KEYS = {
    STOPS: '@kmb_stops',
    ROUTES: '@kmb_routes',
    ETA: '@kmb_eta'
};

// Helper function to delay between retries
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Check if there's an active network connection
const checkNetworkConnection = async () => {
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
        throw new Error('No internet connection');
    }
};

const validateResponse = (response, endpoint) => {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Invalid response type from ${endpoint}. Expected JSON but got ${contentType}`);
    }
};

// Enhanced fetch function with retries and error handling
const fetchWithRetry = async (endpoint, options = {}, retries = MAX_RETRIES) => {
    try {
        await checkNetworkConnection();

        const url = `${BASE_URL}${endpoint}`;
        console.log(`Fetching ${url}`); // Debug log

        const response = await fetch(url, {
            ...options,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        // Validate response type before parsing
        validateResponse(response, endpoint);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // For debugging, log the raw response
        const responseText = await response.text();
        console.log(`Raw response from ${endpoint}:`, responseText.substring(0, 200)); // Log first 200 chars

        // Parse the response text as JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error(`JSON Parse error for ${endpoint}:`, parseError);
            console.error('Response text:', responseText.substring(0, 200));
            throw new Error(`Invalid JSON response from ${endpoint}`);
        }

        return data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);

        if (retries > 0) {
            const nextRetryDelay = RETRY_DELAY * (MAX_RETRIES - retries + 1);
            console.log(`Retrying ${endpoint} in ${nextRetryDelay}ms, ${retries} attempts remaining`);
            await delay(nextRetryDelay);
            return fetchWithRetry(endpoint, options, retries - 1);
        }

        throw error;
    }
};

// Cache management functions
const loadCacheFromStorage = async () => {
    try {
        const [stopsCache, routesCache, etaCache] = await Promise.all([
            AsyncStorage.getItem(CACHE_KEYS.STOPS),
            AsyncStorage.getItem(CACHE_KEYS.ROUTES),
            AsyncStorage.getItem(CACHE_KEYS.ETA)
        ]);

        if (stopsCache) cache.stops = JSON.parse(stopsCache);
        if (routesCache) cache.routes = JSON.parse(routesCache);
        if (etaCache) cache.eta = JSON.parse(etaCache);
    } catch (error) {
        console.error('Error loading cache:', error);
    }
};

const saveCacheToStorage = async () => {
    try {
        await Promise.all([
            AsyncStorage.setItem(CACHE_KEYS.STOPS, JSON.stringify(cache.stops)),
            AsyncStorage.setItem(CACHE_KEYS.ROUTES, JSON.stringify(cache.routes)),
            AsyncStorage.setItem(CACHE_KEYS.ETA, JSON.stringify(cache.eta))
        ]);
    } catch (error) {
        console.error('Error saving cache:', error);
    }
};

// Helper function to check if cache is valid
const isCacheValid = (timestamp, duration) => {
    return timestamp && (Date.now() - timestamp) < duration;
};

/**
 * Fetches all bus stops with enhanced error handling and caching
 */
export async function fetchAllStops() {
    try {
        // Check memory cache first
        if (cache.stops.data && isCacheValid(cache.stops.timestamp, CACHE_DURATION.STOPS)) {
            return cache.stops.data;
        }

        const data = await fetchWithRetry('/stop');

        if (!data || !data.data || !Array.isArray(data.data)) {
            throw new Error('Invalid stop data format');
        }

        // Update cache
        cache.stops = {
            data: data.data,
            timestamp: Date.now()
        };

        // Save to persistent storage
        await saveCacheToStorage();

        return data.data;
    } catch (error) {
        console.error('API Error (stops):', error);
        
        // Return cached data if available, even if expired
        if (cache.stops.data) {
            console.log('Using expired cache data for stops');
            return cache.stops.data;
        }
        
        throw new Error(`Failed to fetch stop data: ${error.message}`);
    }
}

/**
 * Fetches route information with caching
 */
export async function fetchRouteInfo(route, direction = 'outbound', serviceType = 1) {
    try {
        const cacheKey = `${route}-${direction}-${serviceType}`;

        // Check cache
        if (cache.routes.data[cacheKey] &&
            isCacheValid(cache.routes.timestamp[cacheKey], CACHE_DURATION.ROUTES)) {
            return cache.routes.data[cacheKey];
        }

        const data = await fetchWithRetry(`/route/${route}/${direction}/${serviceType}`);

        // Update cache
        cache.routes.data[cacheKey] = data.data;
        cache.routes.timestamp[cacheKey] = Date.now();

        await saveCacheToStorage();

        return data.data;
    } catch (error) {
        console.error('API Error (route-info):', error);
        
        // Return cached data if available
        if (cache.routes.data[`${route}-${direction}-${serviceType}`]) {
            return cache.routes.data[`${route}-${direction}-${serviceType}`];
        }
        
        throw error;
    }
}

/**
 * Fetches route ETA information
 */
export async function fetchRouteETA(route, serviceType = 1) {
    try {
        const cacheKey = `${route}-${serviceType}`;

        // Check cache, but with shorter duration for ETAs
        if (cache.eta.data[cacheKey] &&
            isCacheValid(cache.eta.timestamp[cacheKey], CACHE_DURATION.ETA)) {
            return cache.eta.data[cacheKey];
        }

        const data = await fetchWithRetry(`/route-eta/${route}/${serviceType}`);

        // Update cache
        cache.eta.data[cacheKey] = data.data;
        cache.eta.timestamp[cacheKey] = Date.now();

        return data.data;
    } catch (error) {
        console.error('API Error (route-eta):', error);
        throw error;
    }
}

/**
 * Fetches stop information for a specific route
 */
export async function fetchRouteStops(route, direction = 'outbound', serviceType = 1) {
    try {
        const cacheKey = `${route}-${direction}-${serviceType}-stops`;

        // Check cache first
        if (cache.routes.data[cacheKey] &&
            isCacheValid(cache.routes.timestamp[cacheKey], CACHE_DURATION.ROUTES)) {
            return cache.routes.data[cacheKey];
        }

        // Add parameter validation
        if (!route || typeof route !== 'string') {
            throw new Error('Invalid route parameter');
        }

        if (!['outbound', 'inbound'].includes(direction)) {
            throw new Error('Invalid direction parameter');
        }

        if (typeof serviceType !== 'number' || serviceType < 1) {
            throw new Error('Invalid service type parameter');
        }

        const endpoint = `/route-stop/${route}/${direction}/${serviceType}`;
        console.log(`Fetching route stops for: ${endpoint}`);

        const data = await fetchWithRetry(endpoint);

        // Validate the response data structure
        if (!data || !data.data || !Array.isArray(data.data)) {
            throw new Error('Invalid response data structure');
        }

        // Update cache
        cache.routes.data[cacheKey] = data.data;
        cache.routes.timestamp[cacheKey] = Date.now();

        await saveCacheToStorage();

        return data.data;
    } catch (error) {
        console.error('Error in fetchRouteStops:', error);
        
        // Return cached data if available
        if (cache.routes.data[`${route}-${direction}-${serviceType}-stops`]) {
            console.log('Using cached route stops data');
            return cache.routes.data[`${route}-${direction}-${serviceType}-stops`];
        }
        
        // If no cache and error persists, throw a user-friendly error
        throw new Error(`Unable to fetch route stops: ${error.message}`);
    }
}

/**
 * Fetches ETA information for nearby stops
 */
export async function fetchNearbyStops(stopId) {
    try {
        // For single stop ETAs, we'll use a shorter cache duration
        if (cache.eta.data[stopId] &&
            isCacheValid(cache.eta.timestamp[stopId], CACHE_DURATION.ETA)) {
            return cache.eta.data[stopId];
        }

        const data = await fetchWithRetry(`/stop-eta/${stopId}`);

        if (!data || !data.data) {
            throw new Error('Invalid ETA data format');
        }

        // Update cache
        cache.eta.data[stopId] = data.data;
        cache.eta.timestamp[stopId] = Date.now();

        return data.data;
    } catch (error) {
        console.error('API Error (stop-eta):', error);
        
        // Return cached data if available, even if expired
        if (cache.eta.data[stopId]) {
            console.log('Using expired cache data for stop ETA');
            return cache.eta.data[stopId];
        }
        
        throw error;
    }
}

/**
 * Fetches all route stops with enhanced error handling
 */
export async function fetchAllRouteStops() {
    const endpoint = '/route-stop';
    const cacheKey = 'all-route-stops';

    try {
        // Check cache first
        if (cache.routes.data[cacheKey] &&
            isCacheValid(cache.routes.timestamp[cacheKey], CACHE_DURATION.ROUTES)) {
            return cache.routes.data[cacheKey];
        }

        console.log('Fetching all route stops');
        const data = await fetchWithRetry(endpoint);
        
        if (!data || !data.data || !Array.isArray(data.data)) {
            throw new Error('Invalid response data structure');
        }

        // Update cache
        cache.routes.data[cacheKey] = data.data;
        cache.routes.timestamp[cacheKey] = Date.now();
        await saveCacheToStorage();

        return data.data;
    } catch (error) {
        console.error('Error fetching all route stops:', error);
        
        // Return cached data if available
        if (cache.routes.data[cacheKey]) {
            console.log('Using cached all route stops data');
            return cache.routes.data[cacheKey];
        }
        
        throw new Error(`Failed to fetch route stops: ${error.message}`);
    }
}

/**
 * Optimized batch fetching of ETAs for multiple stops
 */
export async function batchFetchStopETAs(stopIds) {
    try {
        // Filter out stops that have valid cached data
        const stopsToFetch = stopIds.filter(stopId => {
            const cachedData = cache.eta.data[stopId];
            const cachedTimestamp = cache.eta.timestamp[stopId];
            return !cachedData || !isCacheValid(cachedTimestamp, CACHE_DURATION.ETA);
        });

        // Fetch new data in parallel
        const promises = stopsToFetch.map(stopId =>
            fetchWithRetry(`/stop-eta/${stopId}`)
                .then(data => ({ stopId, data: data.data }))
                .catch(() => ({ stopId, data: [] }))
        );

        const results = await Promise.all(promises);

        // Update cache with new results
        results.forEach(({ stopId, data }) => {
            cache.eta.data[stopId] = data;
            cache.eta.timestamp[stopId] = Date.now();
        });

        // Return combined results from cache
        return stopIds.reduce((acc, stopId) => {
            acc[stopId] = cache.eta.data[stopId] || [];
            return acc;
        }, {});
    } catch (error) {
        console.error('API Error (batch-eta):', error);
        throw error;
    }
}

/**
 * Clears expired cache entries
 */
export function clearExpiredCache() {
    const now = Date.now();

    // Clear stops cache if expired
    if (!isCacheValid(cache.stops.timestamp, CACHE_DURATION.STOPS)) {
        cache.stops = { data: null, timestamp: 0 };
    }

    // Clear expired route cache entries
    Object.keys(cache.routes.timestamp).forEach(key => {
        if (!isCacheValid(cache.routes.timestamp[key], CACHE_DURATION.ROUTES)) {
            delete cache.routes.data[key];
            delete cache.routes.timestamp[key];
        }
    });

    // Clear expired ETA cache entries
    Object.keys(cache.eta.timestamp).forEach(key => {
        if (!isCacheValid(cache.eta.timestamp[key], CACHE_DURATION.ETA)) {
            delete cache.eta.data[key];
            delete cache.eta.timestamp[key];
        }
    });

    // Save cleaned cache to storage
    saveCacheToStorage();
}

// Initialize cache from storage
loadCacheFromStorage();

// Run cache cleanup periodically
setInterval(clearExpiredCache, CACHE_DURATION.ETA);