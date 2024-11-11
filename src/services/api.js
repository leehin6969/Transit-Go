// api.js

const BASE_URL = 'https://data.etabus.gov.hk/v1/transport/kmb';

// Cache configuration
const CACHE_DURATION = {
    STOPS: 24 * 60 * 60 * 1000, // 24 hours for stops data
    ROUTES: 24 * 60 * 60 * 1000, // 24 hours for route data
    ETA: 10 * 1000, // 10 seconds for ETA data
};

// Cache storage
const cache = {
    stops: { data: null, timestamp: 0 },
    routes: { data: {}, timestamp: {} },
    eta: { data: {}, timestamp: {} }
};

// Helper function to check if cache is valid
const isCacheValid = (timestamp, duration) => {
    return timestamp && (Date.now() - timestamp) < duration;
};

// Helper function to handle API errors
const handleApiError = (error, endpoint) => {
    console.error(`API Error (${endpoint}):`, error);
    throw new Error(`Failed to fetch data from ${endpoint}`);
};

/**
 * Fetches all bus stops with caching
 */
export async function fetchAllStops() {
    try {
        // Check cache first
        if (cache.stops.data && isCacheValid(cache.stops.timestamp, CACHE_DURATION.STOPS)) {
            return cache.stops.data;
        }

        const response = await fetch(`${BASE_URL}/stop`);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        // Update cache
        cache.stops = {
            data: data.data,
            timestamp: Date.now()
        };

        return data.data;
    } catch (error) {
        handleApiError(error, 'stops');
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
            fetch(`${BASE_URL}/stop-eta/${stopId}`)
                .then(response => response.json())
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
        handleApiError(error, 'batch-eta');
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

        const response = await fetch(
            `${BASE_URL}/route/${route}/${direction}/${serviceType}`
        );
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        // Update cache
        cache.routes.data[cacheKey] = data.data;
        cache.routes.timestamp[cacheKey] = Date.now();

        return data.data;
    } catch (error) {
        handleApiError(error, 'route-info');
    }
}

/**
 * Fetches route ETA information
 */
export async function fetchRouteETA(route, serviceType = 1) {
    try {
        const cacheKey = `${route}-${serviceType}`;

        // Check cache
        if (cache.eta.data[cacheKey] &&
            isCacheValid(cache.eta.timestamp[cacheKey], CACHE_DURATION.ETA)) {
            return cache.eta.data[cacheKey];
        }

        const response = await fetch(
            `${BASE_URL}/route-eta/${route}/${serviceType}`
        );
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        // Update cache
        cache.eta.data[cacheKey] = data.data;
        cache.eta.timestamp[cacheKey] = Date.now();

        return data.data;
    } catch (error) {
        handleApiError(error, 'route-eta');
    }
}

/**
 * Fetches stop information for a specific route
 */
export async function fetchRouteStops(route, direction = 'outbound', serviceType = 1) {
    try {
        const cacheKey = `${route}-${direction}-${serviceType}-stops`;

        // Check cache
        if (cache.routes.data[cacheKey] &&
            isCacheValid(cache.routes.timestamp[cacheKey], CACHE_DURATION.ROUTES)) {
            return cache.routes.data[cacheKey];
        }

        const response = await fetch(
            `${BASE_URL}/route-stop/${route}/${direction}/${serviceType}`
        );
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        // Update cache
        cache.routes.data[cacheKey] = data.data;
        cache.routes.timestamp[cacheKey] = Date.now();

        return data.data;
    } catch (error) {
        handleApiError(error, 'route-stops');
    }
}

/**
 * Fetches ETA information for a specific stop
 */
export async function fetchNearbyStops(stopId) {
    try {
        // For single stop ETAs, we'll use a shorter cache duration
        if (cache.eta.data[stopId] &&
            isCacheValid(cache.eta.timestamp[stopId], CACHE_DURATION.ETA)) {
            return cache.eta.data[stopId];
        }

        const response = await fetch(`${BASE_URL}/stop-eta/${stopId}`);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        // Update cache
        cache.eta.data[stopId] = data.data;
        cache.eta.timestamp[stopId] = Date.now();

        return data.data;
    } catch (error) {
        handleApiError(error, 'stop-eta');
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
}

// Optional: Run cache cleanup periodically
setInterval(clearExpiredCache, CACHE_DURATION.ETA);