// NearbyStopItem.js
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useEtaUpdates } from '../hooks/useEtaUpdates';
import useLocation from '../hooks/useLocation';
import { ETAHeartbeat } from '../styles/ETAHeartbeat';
import { styles } from '../styles/styles';
import { formatDistance } from '../utils/distance';
import { formatEta, getEtaColor } from '../utils/etaFormatting';
import { useLanguage } from './Header';
import StreetViewButton from './StreetViewButton';

export default function NearbyStopItem({ item, routes = [], onRoutePress }) {
    const { getLocalizedText } = useLanguage();
    const { etaData, isUpdating } = useEtaUpdates('nearby', null, item.stop);
    const { location } = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [mapHeight] = useState(new Animated.Value(0));
    const mapRef = useRef(null);

    const stopLocation = useMemo(() => ({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.long),
    }), [item.lat, item.long]);

    const userLocation = useMemo(() => {
        if (location?.coords?.latitude != null && location?.coords?.longitude != null) {
            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
        }
        return null;
    }, [location]);

    // Effect to fit the map to coordinates when the map is expanded and locations are available
    useEffect(() => {
        if (isExpanded && mapRef.current && stopLocation) {
            const coordinates = [stopLocation];

            // Include user location if available
            if (userLocation) {
                coordinates.push(userLocation);
            }

            // Use fitToCoordinates to adjust the map's viewport
            mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
    }, [isExpanded, stopLocation, userLocation]);

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
                <Text
                    style={[
                        styles.nearbyRouteEta,
                        { color: getEtaColor(formattedEta.minutes) },
                    ]}
                >
                    {formattedEta.text}
                </Text>
            </ETAHeartbeat>
        );
    };

    const updatedRoutes =
        routes?.map((route) => {
            const latestEta = etaData?.find(
                (eta) =>
                    eta.route === route.route &&
                    eta.dir === (route.bound === 'O' ? 'outbound' : 'inbound')
            );
            return latestEta ? { ...route, eta: latestEta.eta } : route;
        }) || [];

    const renderMap = () => {
        if (!isExpanded || !item.lat || !item.long) return null;

        return (
            <View>
                <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        showsUserLocation={true}
                        showsMyLocationButton={true}
                        onMapReady={() => {
                            if (stopLocation && mapRef.current) {
                                const coordinates = [stopLocation];
                                if (userLocation) {
                                    coordinates.push(userLocation);
                                }
                                mapRef.current.fitToCoordinates(coordinates, {
                                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                                    animated: true,
                                });
                            }
                        }}
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

                    <StreetViewButton
                        latitude={stopLocation.latitude}
                        longitude={stopLocation.longitude}
                        style={styles.streetViewButtonPosition}
                    />
                </Animated.View>
            </View>
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
                    <Text style={styles.nearbyStopName}>{getLocalizedText(item)}</Text>
                    <Text style={styles.nearbyStopDistance}>{formatDistance(item.distance)}</Text>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.routesScroll}
                    onTouchStart={(e) => e.stopPropagation()}
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
                                    <Text
                                        style={styles.nearbyRouteDestination}
                                        numberOfLines={1}
                                    >
                                        →{' '}
                                        {getLocalizedText({
                                            en: route.dest_en || 'N/A',
                                            tc: route.dest_tc || 'N/A',
                                            sc: route.dest_sc || 'N/A',
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
                style={[styles.expandButton, isExpanded && styles.expandButtonActive]}
                onPress={toggleExpand}
            >
                <MaterialIcons
                    name={isExpanded ? 'expand-less' : 'expand-more'}
                    size={24}
                    color="#666666"
                />
            </TouchableOpacity>
        </View>
    );
}


