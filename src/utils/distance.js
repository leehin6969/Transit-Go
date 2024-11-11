const EARTH_RADIUS = 6371; // in kilometers

export function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(degreesToRadians(lat1)) *
        Math.cos(degreesToRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS * c;
}

export function formatTime(date) {
    if (!date) return 'No ETA';
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatDistance(distance) {
    if (distance < 1) {
        return `${(distance * 1000).toFixed(0)}m`;
    }
    return `${distance.toFixed(1)}km`;
}

