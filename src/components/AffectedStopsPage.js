// components/AffectedStopsPage.js
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from './Header';
import { fetchAllStops, fetchNearbyStops } from '../services/api';
import { calculateDistance } from '../utils/distance';

const PROXIMITY_RADIUS = 250; // meters
const BETWEEN_RADIUS = 750; // meters - larger radius for between points to cover the path

const AffectedStopsPage = ({ incident, onBack, geocodeLocation }) => {
    const { language, getLocalizedText } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [affectedStops, setAffectedStops] = useState([]);
    const [searchedLocation, setSearchedLocation] = useState('');

    const extractLandmarks = (incident) => {
        const lang = language === 'en' ? 'en' : 'cn';
        return {
            near: incident?.landmarks?.near?.[lang] || null,
            between: incident?.landmarks?.between?.[lang] || null
        };
    };

    const findStopsNearPoint = async (locationName, allStops, radius) => {
        try {
            const coords = await geocodeLocation(locationName);
            if (!coords) return [];

            return allStops.filter(stop => {
                const distance = calculateDistance(
                    coords.latitude,
                    coords.longitude,
                    parseFloat(stop.lat),
                    parseFloat(stop.long)
                );
                stop.distance = distance * 1000; // Convert to meters
                return distance * 1000 <= radius;
            });
        } catch (error) {
            console.error(`Error finding stops near ${locationName}:`, error);
            return [];
        }
    };

    const findStopsBetweenPoints = async (locationString, allStops) => {
        try {
            // Split the between string into individual locations
            const locations = locationString.split(/\s*(?:and|與|和)\s*/);
            if (locations.length !== 2) return [];

            // Get coordinates for both points
            const [point1Coords, point2Coords] = await Promise.all(
                locations.map(loc => geocodeLocation(loc))
            );

            if (!point1Coords || !point2Coords) return [];

            // Find stops that are within radius of the line between points
            return allStops.filter(stop => {
                const stopLat = parseFloat(stop.lat);
                const stopLong = parseFloat(stop.long);

                // Calculate distances from stop to each endpoint
                const distanceToPoint1 = calculateDistance(
                    point1Coords.latitude,
                    point1Coords.longitude,
                    stopLat,
                    stopLong
                ) * 1000; // Convert to meters

                const distanceToPoint2 = calculateDistance(
                    point2Coords.latitude,
                    point2Coords.longitude,
                    stopLat,
                    stopLong
                ) * 1000; // Convert to meters

                // Calculate total distance between endpoints
                const totalDistance = calculateDistance(
                    point1Coords.latitude,
                    point1Coords.longitude,
                    point2Coords.latitude,
                    point2Coords.longitude
                ) * 1000; // Convert to meters

                // If stop is close to either endpoint, include it
                if (distanceToPoint1 <= BETWEEN_RADIUS || distanceToPoint2 <= BETWEEN_RADIUS) {
                    stop.distance = Math.min(distanceToPoint1, distanceToPoint2);
                    return true;
                }

                // Check if stop is roughly between the points
                // Sum of distances to endpoints should be close to total distance
                const sumOfDistances = distanceToPoint1 + distanceToPoint2;
                const isRoughlyBetween = Math.abs(sumOfDistances - totalDistance) <= BETWEEN_RADIUS;

                if (isRoughlyBetween) {
                    stop.distance = Math.min(distanceToPoint1, distanceToPoint2);
                    return true;
                }

                return false;
            });
        } catch (error) {
            console.error('Error finding stops between points:', error);
            return [];
        }
    };

    const fetchStops = async () => {
        try {
            setLoading(true);
            setError(null);

            // Extract landmarks from incident
            const landmarks = extractLandmarks(incident);

            // If no landmarks, show error
            if (!landmarks.near && !landmarks.between) {
                setError(language === 'en' ?
                    'No landmark information available' :
                    '沒有地標資訊'
                );
                return;
            }

            const allStops = await fetchAllStops();
            let affectedStops = [];

            // Process "near" landmarks first
            if (landmarks.near) {
                setSearchedLocation(landmarks.near);
                const nearbyStops = await findStopsNearPoint(
                    landmarks.near,
                    allStops,
                    PROXIMITY_RADIUS
                );
                affectedStops = [...affectedStops, ...nearbyStops];
            }

            // Process "between" landmarks
            if (landmarks.between) {
                if (!searchedLocation) {
                    setSearchedLocation(landmarks.between);
                }
                const betweenStops = await findStopsBetweenPoints(
                    landmarks.between,
                    allStops
                );
                affectedStops = [...affectedStops, ...betweenStops];
            }

            // Remove duplicates and sort by distance
            const uniqueStops = Array.from(
                new Map(affectedStops.map(stop => [stop.stop, stop])).values()
            ).sort((a, b) => a.distance - b.distance);

            // Fetch routes for each stop
            const stopsWithRoutes = await Promise.all(
                uniqueStops.map(async (stop) => {
                    const etaData = await fetchNearbyStops(stop.stop);
                    const routes = etaData ? Array.from(new Set(etaData.map(eta => eta.route))) : [];
                    return {
                        ...stop,
                        routes
                    };
                })
            );

            setAffectedStops(stopsWithRoutes);

        } catch (error) {
            console.error('Error fetching affected stops:', error);
            setError(language === 'en' ?
                'Failed to fetch affected stops' :
                '無法獲取受影響巴士站'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStops();
    }, []);

    // Rest of the component remains the same...
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#666666" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.title}>
                        {language === 'en' ? 'Affected Bus Stops' : '受影響巴士站'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {language === 'en' ?
                            `Incident #${incident.incidentNumber}` :
                            `事故編號 #${incident.incidentNumber}`}
                    </Text>
                    {searchedLocation && (
                        <Text style={styles.locationText} numberOfLines={1}>
                            {searchedLocation}
                        </Text>
                    )}
                </View>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#dc2626" />
                    <Text style={styles.loadingText}>
                        {language === 'en' ?
                            'Loading affected stops...' :
                            '正在載入受影響巴士站...'}
                    </Text>
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <MaterialIcons name="error-outline" size={48} color="#dc2626" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={fetchStops}
                    >
                        <Text style={styles.retryButtonText}>
                            {language === 'en' ? 'Retry' : '重試'}
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                >
                    {affectedStops.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="info-outline" size={48} color="#999999" />
                            <Text style={styles.emptyText}>
                                {language === 'en' ?
                                    'No affected bus stops found nearby' :
                                    '附近沒有受影響的巴士站'}
                            </Text>
                        </View>
                    ) : (
                        affectedStops.map((stop) => (
                            <View key={stop.stop} style={styles.stopItem}>
                                <View style={styles.stopHeader}>
                                    <Text style={styles.stopName}>
                                        {getLocalizedText({
                                            en: stop.name_en,
                                            tc: stop.name_tc,
                                            sc: stop.name_sc
                                        })}
                                    </Text>
                                    <Text style={styles.distance}>
                                        {Math.round(stop.distance)}m
                                    </Text>
                                </View>

                                {stop.routes.length > 0 ? (
                                    <View style={styles.routesContainer}>
                                        {stop.routes.map((route) => (
                                            <View key={route} style={styles.routeTag}>
                                                <Text style={styles.routeText}>{route}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <Text style={styles.noRoutes}>
                                        {language === 'en' ?
                                            'No active routes' :
                                            '沒有服務中的路線'}
                                    </Text>
                                )}
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
        borderRadius: 8,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666666',
        marginTop: 2,
    },
    locationText: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
        fontStyle: 'italic',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    loadingText: {
        marginTop: 12,
        color: '#666666',
        fontSize: 16,
    },
    errorText: {
        marginTop: 12,
        color: '#dc2626',
        fontSize: 16,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: '#dc2626',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999999',
        textAlign: 'center',
    },
    stopItem: {
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#fee2e2',
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    stopHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    stopName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        flex: 1,
    },
    distance: {
        fontSize: 14,
        color: '#666666',
        backgroundColor: '#ffffff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    routesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    routeTag: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    routeText: {
        fontSize: 14,
        color: '#dc2626',
        fontWeight: '500',
    },
    noRoutes: {
        fontSize: 14,
        color: '#666666',
        fontStyle: 'italic',
    },
});

export default AffectedStopsPage;