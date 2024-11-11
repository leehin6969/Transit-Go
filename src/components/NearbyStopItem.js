// NearbyStopItem.js
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // Fixed import
import { useEtaUpdates } from '../hooks/useEtaUpdates';
import useLocation from '../hooks/useLocation';
import { ETAHeartbeat } from '../styles/ETAHeartbeat';
import { styles } from '../styles/styles';
import { formatDistance } from '../utils/distance';
import { formatEta, getEtaColor } from '../utils/etaFormatting';
import { useLanguage } from './Header';

export default function NearbyStopItem({ item, routes = [], onRoutePress }) {
    const { getLocalizedText } = useLanguage();
    const { etaData, isUpdating } = useEtaUpdates('nearby', null, item.stop);
    const { location } = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [mapHeight] = useState(new Animated.Value(0));

    const toggleExpand = () => {
        const toValue = isExpanded ? 0 : 200;
        setIsExpanded(!isExpanded);

        Animated.timing(mapHeight, {
            toValue,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const renderRouteEta = (route) => {
        const formattedEta = formatEta(route.eta);
        if (!formattedEta) {
            return <Text style={[styles.nearbyRouteEta, { color: '#666666' }]}>No ETA</Text>;
        }

        return (
            <ETAHeartbeat isUpdating={isUpdating}>
                <Text style={[
                    styles.nearbyRouteEta,
                    { color: getEtaColor(formattedEta.minutes) }
                ]}>
                    {formattedEta.text}
                </Text>
            </ETAHeartbeat>
        );
    };

    const updatedRoutes = routes?.map(route => {
        const latestEta = etaData?.find(eta =>
            eta.route === route.route &&
            eta.dir === (route.bound === 'O' ? 'outbound' : 'inbound')
        );
        return latestEta ? { ...route, eta: latestEta.eta } : route;
    }) || [];

    const renderMap = () => {
        if (!isExpanded || !item.lat || !item.long) return null;

        const stopLocation = {
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.long),
        };

        const userLocation = location?.coords ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        } : null;

        // Calculate region to show both markers
        const region = {
            latitude: stopLocation.latitude,
            longitude: stopLocation.longitude,
            latitudeDelta: 0.0001,  // Adjusted zoom level
            longitudeDelta: 0.0001, // Adjusted zoom level
        };

        if (userLocation) {
            const latDiff = Math.abs(stopLocation.latitude - userLocation.latitude);
            const lonDiff = Math.abs(stopLocation.longitude - userLocation.longitude);

            if (latDiff > region.latitudeDelta || lonDiff > region.longitudeDelta) {
                // If user is outside the initial zoom area, adjust the region to fit both locations
                region.latitude = (stopLocation.latitude + userLocation.latitude) / 2;
                region.longitude = (stopLocation.longitude + userLocation.longitude) / 2;
                region.latitudeDelta = Math.max(latDiff * 2.5, 0.000050);
                region.longitudeDelta = Math.max(lonDiff * 2.5, 0.00050);
            }
        }

        return (
            <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
                <MapView
                    style={styles.map}
                    initialRegion={region}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                >
                    <Marker
                        coordinate={stopLocation}
                        title={getLocalizedText(item)}
                        description="Bus Stop"
                    >
                        <View style={styles.busStopMarker}>
                            <MaterialIcons name="directions-bus" size={24} color="#0066cc" />
                        </View>
                    </Marker>
                </MapView>
            </Animated.View>
        );
    };

    return (
        <View style={styles.nearbyStopItem}>
            <TouchableOpacity
                style={styles.nearbyStopContent}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <View style={styles.nearbyStopHeader}>
                    <Text style={styles.nearbyStopName}>
                        {getLocalizedText(item)}
                    </Text>
                    <Text style={styles.nearbyStopDistance}>
                        {formatDistance(item.distance)}
                    </Text>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.routesScroll}
                    onTouchStart={e => e.stopPropagation()}
                >
                    {updatedRoutes && updatedRoutes.length > 0 ? (
                        updatedRoutes.map((route, index) => (
                            <TouchableOpacity
                                key={`${route.route}-${index}`}
                                style={styles.nearbyRouteItem}
                                onPress={() => onRoutePress(route, item)}
                                activeOpacity={0.7}
                            >
                                <View>
                                    <Text style={styles.nearbyRouteNumber}>{route.route}</Text>
                                    <Text style={styles.nearbyRouteDestination} numberOfLines={1}>
                                        → {getLocalizedText({
                                            en: route.dest_en || 'N/A',
                                            tc: route.dest_tc || 'N/A',
                                            sc: route.dest_sc || 'N/A'
                                        })}
                                    </Text>
                                    {renderRouteEta(route)}
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.noRoutes}>No routes available</Text>
                    )}
                </ScrollView>
            </TouchableOpacity>

            {renderMap()}

            <TouchableOpacity
                style={[
                    styles.expandButton,
                    isExpanded && styles.expandButtonActive
                ]}
                onPress={toggleExpand}
            >
                <MaterialIcons
                    name={isExpanded ? "expand-less" : "expand-more"}
                    size={24}
                    color="#666666"
                />
            </TouchableOpacity>
        </View>
    );
}