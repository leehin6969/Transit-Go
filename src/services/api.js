// api.js

const BASE_URL = 'https://data.etabus.gov.hk/v1/transport/kmb';

export async function fetchAllStops() {
    try {
        const response = await fetch(`${BASE_URL}/stop`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching all stops:', error);
        throw error;
    }
}

export async function fetchNearbyStops(stopId) {
    try {
        const response = await fetch(`${BASE_URL}/stop-eta/${stopId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching nearby stops:', error);
        throw error;
    }
}

export async function fetchRouteInfo(route, direction = 'outbound', serviceType = 1) {
    try {
        const response = await fetch(`${BASE_URL}/route/${route}/${direction}/${serviceType}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching route info:', error);
        throw error;
    }
}

export async function fetchRouteETA(route, serviceType = 1) {
    try {
        const response = await fetch(`${BASE_URL}/route-eta/${route}/${serviceType}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching route ETA:', error);
        throw error;
    }
}

export async function fetchRouteStops(route, direction = 'outbound', serviceType = 1) {
    try {
        const response = await fetch(`${BASE_URL}/route-stop/${route}/${direction}/${serviceType}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching route stops:', error);
        throw error;
    }
}