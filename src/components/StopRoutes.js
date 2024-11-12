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
import { useLanguage } from './Header';

const BASE_URL = 'https://data.etabus.gov.hk/v1/transport/kmb';
const HEADER_HEIGHT = 56; // Standard header height
const SCREEN_HEIGHT = Dimensions.get('window').height;

const StopRoutes = ({ stopId, stopName, onBack }) => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getLocalizedText } = useLanguage();

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${BASE_URL}/route-stop`);
                const data = await response.json();
                
                if (data.data) {
                    const stopRoutes = data.data
                        .filter(route => route.stop === stopId)
                        .map(route => ({
                            route: route.route,
                            seq: route.seq,
                            bound: route.bound,
                            service_type: route.service_type
                        }));

                    const routesWithDetails = await Promise.all(
                        stopRoutes.map(async (route) => {
                            const direction = route.bound === 'O' ? 'outbound' : 'inbound';
                            const routeResponse = await fetch(
                                `${BASE_URL}/route/${route.route}/${direction}/${route.service_type}`
                            );
                            const routeData = await routeResponse.json();
                            
                            return {
                                ...route,
                                dest_en: routeData.data?.dest_en,
                                dest_tc: routeData.data?.dest_tc,
                                dest_sc: routeData.data?.dest_sc,
                                orig_en: routeData.data?.orig_en,
                                orig_tc: routeData.data?.orig_tc,
                                orig_sc: routeData.data?.orig_sc
                            };
                        })
                    );

                    const sortedRoutes = routesWithDetails.sort((a, b) => {
                        const [aNum, aStr] = a.route.match(/(\d+)([A-Za-z]*)/).slice(1);
                        const [bNum, bStr] = b.route.match(/(\d+)([A-Za-z]*)/).slice(1);
                        const numCompare = parseInt(aNum) - parseInt(bNum);
                        return numCompare !== 0 ? numCompare : aStr.localeCompare(bStr);
                    });

                    setRoutes(sortedRoutes);
                }
            } catch (err) {
                console.error('Error fetching routes:', err);
                setError('Failed to load routes');
            } finally {
                setLoading(false);
            }
        };

        fetchRoutes();
    }, [stopId]);

    const getDirectionText = (bound) => {
        if (bound === 'O') {
            return {
                en: 'Outbound',
                tc: '往郊區',
                sc: '往郊区'
            };
        }
        return {
            en: 'Inbound',
            tc: '往市區',
            sc: '往市区'
        };
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={styles.loadingText}>Loading routes...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                    onPress={() => window.location.reload()}
                    style={styles.retryButton}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
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
                    <Text style={styles.subtitle}>{routes.length} routes available</Text>
                </View>
            </View>

            {/* Routes List */}
            <ScrollView 
                style={styles.routesList}
                contentContainerStyle={styles.routesListContent}
                showsVerticalScrollIndicator={false}
            >
                {routes.map((route, index) => (
                    <View 
                        key={`${route.route}-${route.bound}-${index}`}
                        style={styles.routeItem}
                    >
                        <View style={styles.routeMainInfo}>
                            <Text style={styles.routeNumber}>{route.route}</Text>
                            <View style={styles.directionBadge}>
                                <Text style={styles.directionText}>
                                    {getLocalizedText(getDirectionText(route.bound))}
                                </Text>
                            </View>
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
                            <Text style={styles.stopSequence}>Stop {route.seq}</Text>
                        </View>
                    </View>
                ))}

                {routes.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="info-outline" size={48} color="#999999" />
                        <Text style={styles.emptyText}>No routes available at this stop</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: SCREEN_HEIGHT - HEADER_HEIGHT,
        backgroundColor: '#f5f5f5',
        marginTop: HEADER_HEIGHT,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        marginTop: HEADER_HEIGHT,
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
        paddingBottom: 32, // Add extra padding at bottom
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
        marginRight: 12,
    },
    directionBadge: {
        backgroundColor: '#e8f2ff',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    directionText: {
        fontSize: 14,
        color: '#0066cc',
        fontWeight: '500',
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
    loadingText: {
        marginTop: 8,
        color: '#666666',
        fontSize: 16,
    },
    errorText: {
        color: '#dc2626',
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