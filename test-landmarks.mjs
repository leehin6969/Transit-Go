// Note: Using .mjs extension for ES modules
import fetch from 'node-fetch';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const KMB_API_BASE = 'https://data.etabus.gov.hk/v1/transport/kmb';
const PROXIMITY_RADIUS = 500; // meters

async function geocodeAddress(address) {
    if (!GOOGLE_MAPS_API_KEY) {
        throw new Error('GOOGLE_MAPS_API_KEY not set in environment variables');
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address + ', Hong Kong')
        }&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results?.[0]?.geometry?.location) {
        throw new Error('Could not geocode address');
    }

    return {
        latitude: data.results[0].geometry.location.lat,
        longitude: data.results[0].geometry.location.lng
    };
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

async function getAllStops() {
    try {
        const response = await fetch(`${KMB_API_BASE}/stop`);
        const data = await response.json();
        if (!data.data) throw new Error('No stop data received');
        return data.data;
    } catch (error) {
        throw new Error(`Failed to fetch stops: ${error.message}`);
    }
}

async function getRoutesForStop(stopId) {
    try {
        const response = await fetch(`${KMB_API_BASE}/stop-eta/${stopId}`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.warn(`Warning: Failed to fetch routes for stop ${stopId}:`, error.message);
        return [];
    }
}

async function testLandmarkProximity(address) {
    try {
        console.log(`\nTesting proximity for address: ${address}`);

        const coordinates = await geocodeAddress(address);
        console.log('Coordinates:', coordinates);

        const stops = await getAllStops();
        const nearbyStops = stops.filter(stop => {
            const distance = calculateDistance(
                coordinates.latitude,
                coordinates.longitude,
                parseFloat(stop.lat),
                parseFloat(stop.long)
            );
            stop.distance = distance; // Add distance for sorting
            return distance <= PROXIMITY_RADIUS;
        }).sort((a, b) => a.distance - b.distance);

        console.log(`\nFound ${nearbyStops.length} stops within ${PROXIMITY_RADIUS}m`);

        const affectedRoutes = new Set();
        console.log('\nAnalyzing nearby stops:');

        for (const stop of nearbyStops) {
            console.log(`\nStop: ${stop.name_en}`);
            console.log(`Distance: ${Math.round(stop.distance)}m`);

            const routes = await getRoutesForStop(stop.stop);
            const uniqueRoutes = new Set(routes.map(r => r.route));

            if (uniqueRoutes.size > 0) {
                console.log('Routes:', Array.from(uniqueRoutes).join(', '));
            } else {
                console.log('No active routes at this time');
            }

            uniqueRoutes.forEach(r => affectedRoutes.add(r));
        }

        console.log('\n=== Summary ===');
        console.log(`Total affected stops: ${nearbyStops.length}`);
        console.log(`Total affected routes: ${affectedRoutes.size}`);
        if (affectedRoutes.size > 0) {
            console.log(`Routes: ${Array.from(affectedRoutes).sort().join(', ')}`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Interactive prompt
const readline = createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Enter an address to test: ', async (address) => {
    await testLandmarkProximity(address);
    readline.close();
});