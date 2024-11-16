// StopRoutes.js

import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { fetchAllRouteStops, fetchRouteInfo } from '../services/api';
import { useLanguage } from './Header';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const HEADER_HEIGHT = 56;

const StopRoutes = ({ stopId, stopName, onBack, onRoutePress }) => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retrying, setRetrying] = useState(false);
    const { getLocalizedText } = useLanguage();

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            setError(null);

            const routeStopsData = await fetchAllRouteStops();

            if (!routeStopsData) {
                throw new Error('No route data received');
            }

            // Filter routes for this stop
            const stopRoutes = routeStopsData
                .filter(route => route.stop === stopId)
                .map(route => ({
                    route: route.route,
                    seq: route.seq,
                    bound: route.bound,
                    service_type: route.service_type || 1
                }));

            // Fetch details for each route
            const routePromises = stopRoutes.map(route => {
                const direction = route.bound === 'O' ? 'outbound' : 'inbound';
                return fetchRouteInfo(route.route, direction, route.service_type)
                    .then(data => ({
                        ...route,
                        dest_en: data?.dest_en,
                        dest_tc: data?.dest_tc,
                        dest_sc: data?.dest_sc,
                        orig_en: data?.orig_en,
                        orig_tc: data?.orig_tc,
                        orig_sc: data?.orig_sc
                    }))
                    .catch(() => route); // Keep original route info if fetch fails
            });

            const routesWithDetails = await Promise.all(routePromises);

            // Sort routes using the same pattern as in SearchBar.js
            const sortedRoutes = routesWithDetails
                .filter(route => route.dest_en) // Filter valid routes
                .sort((a, b) => {
                    const [aNum = '', aStr = ''] = a.route.match(/(\d+|[A-Za-z]+)/g) || [];
                    const [bNum = '', bStr = ''] = b.route.match(/(\d+|[A-Za-z]+)/g) || [];
                    const numCompare = parseInt(aNum) - parseInt(bNum);
                    return numCompare !== 0 ? numCompare : aStr.localeCompare(bStr);
                });

            setRoutes(sortedRoutes);
        } catch (error) {
            console.error('Error in fetchRoutes:', error);
            setError('Failed to load routes');
        } finally {
            setLoading(false);
            setRetrying(false);
        }
    };

    const handleRetry = () => {
        setRetrying(true);
        fetchRoutes();
    };

    useEffect(() => {
        fetchRoutes();
    }, [stopId]);


    const handleRoutePress = (route) => {
        if (!onRoutePress) return;

        const stopInfo = {
            stop: stopId,
            name_en: stopName,
            name_tc: stopName,
            name_sc: stopName
        };

        const routeInfo = {
            route: route.route,
            dest_en: route.dest_en,
            dest_tc: route.dest_tc,
            dest_sc: route.dest_sc,
            bound: route.bound,
            service_type: route.service_type
        };

        onRoutePress(routeInfo, stopInfo);
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={styles.loadingText}>
                    {retrying ? 'Retrying...' : 'Loading routes...'}
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <MaterialIcons name="error-outline" size={48} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={handleRetry}
                    disabled={retrying}
                >
                    <Text style={styles.retryButtonText}>
                        {retrying ? 'Retrying...' : 'Retry'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={onBack}
                        style={styles.backButton}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#666666" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>{stopName}</Text>
                        <Text style={styles.subtitle}>
                            {routes.length} {routes.length === 1 ? 'route' : 'routes'} available
                        </Text>
                    </View>
                </View>

                {/* Routes List */}
                <ScrollView
                    style={styles.routesList}
                    contentContainerStyle={styles.routesListContent}
                    showsVerticalScrollIndicator={false}
                >
                    {routes.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="info-outline" size={48} color="#999999" />
                            <Text style={styles.emptyText}>No routes available at this stop</Text>
                        </View>
                    ) : (
                        routes.map((route, index) => (
                            <TouchableOpacity
                                key={`${route.route}-${route.bound}-${index}`}
                                style={styles.routeItem}
                                onPress={() => handleRoutePress(route)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.routeMainInfo}>
                                    <Text style={styles.routeNumber}>{route.route}</Text>
                                </View>

                                <View style={styles.routeDetails}>
                                    <View style={styles.routeTerminals}>
                                        <Text style={styles.terminalText} numberOfLines={1}>
                                            {getLocalizedText({
                                                en: route.orig_en,
                                                tc: route.orig_tc,
                                                sc: route.orig_sc
                                            })}
                                        </Text>
                                        <MaterialIcons
                                            name="arrow-forward"
                                            size={16}
                                            color="#666666"
                                            style={styles.arrowIcon}
                                        />
                                        <Text style={styles.terminalText} numberOfLines={1}>
                                            {getLocalizedText({
                                                en: route.dest_en,
                                                tc: route.dest_tc,
                                                sc: route.dest_sc
                                            })}
                                        </Text>
                                    </View>
                                    <Text style={styles.stopSequence}>
                                        Stop {route.seq}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        marginTop: HEADER_HEIGHT,
    },
    contentContainer: {
        flex: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: 8,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
        borderRadius: 20,
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
    routesList: {
        flex: 1,
    },
    routesListContent: {
        padding: 16,
        paddingBottom: 32,
    },
    routeItem: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    routeMainInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    routeNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0066cc',
    },
    routeDetails: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    routeTerminals: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    terminalText: {
        flex: 1,
        fontSize: 14,
        color: '#333333',
    },
    arrowIcon: {
        marginHorizontal: 8,
    },
    stopSequence: {
        fontSize: 12,
        color: '#666666',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    loadingText: {
        marginTop: 8,
        color: '#666666',
        fontSize: 16,
    },
    errorText: {
        color: '#dc2626',
        textAlign: 'center',
        marginBottom: 16,
        fontSize: 16,
    },
    retryButton: {
        backgroundColor: '#0066cc',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#ffffff',
        fontWeight: '500',
        fontSize: 16,
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#999999',
        fontSize: 16,
        marginTop: 16,
        textAlign: 'center',
    },
});

export default StopRoutes;