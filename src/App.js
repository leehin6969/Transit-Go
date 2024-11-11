// App.js
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import Header, { LanguageProvider } from './components/Header';
import NearbyStopItem from './components/NearbyStopItem';
import RouteHeader from './components/RouteHeader';
import SearchBar from './components/SearchBar';
import StopItem from './components/StopItem';

import useLocation from './hooks/useLocation';
import {
    fetchAllStops,
    fetchNearbyStops as fetchNearbyStopsAPI,
    fetchRouteETA,
    fetchRouteInfo,
    fetchRouteStops
} from './services/api';
import { styles } from './styles/styles';
import { calculateDistance } from './utils/distance';

function AppContent() {
    const [busRoute, setBusRoute] = useState('');
    const [loading, setLoading] = useState(false);
    const [stops, setStops] = useState([]);
    const [routeInfo, setRouteInfo] = useState(null);
    const [routeDetails, setRouteDetails] = useState({ inbound: null, outbound: null });
    const [routeDirection, setRouteDirection] = useState('outbound');
    const [nearbyStops, setNearbyStops] = useState([]);
    const [searchMode, setSearchMode] = useState('route'); // 'route' or 'nearby'
    const [nearbyRoutes, setNearbyRoutes] = useState({});
    const [stopsMap, setStopsMap] = useState({});

    const { location, loading: locationLoading, errorMsg } = useLocation();

    useEffect(() => {
        if (searchMode === 'nearby' && location) {
            fetchNearbyStops(location.coords);
        }
    }, [searchMode, location]);

    const createStopsMap = async () => {
        try {
            const allStopsData = await fetchAllStops();
            const newStopsMap = allStopsData.reduce((acc, stop) => {
                acc[stop.stop] = {
                    name_en: stop.name_en,
                    name_tc: stop.name_tc,
                    name_sc: stop.name_sc
                };
                return acc;
            }, {});
            setStopsMap(newStopsMap);
            return newStopsMap;
        } catch (error) {
            console.error('Error creating stops map:', error);
            throw error;
        }
    };

    const isCircularRoute = (routeInfo) => {
        return routeInfo?.dest_en?.includes('CIRCULAR') || 
               (routeInfo?.orig_en === routeInfo?.dest_en);
    };

    const fetchNearbyStops = async (coords) => {
        try {
            setLoading(true);
            const allStops = await fetchAllStops();
            
            const nearby = allStops
                .map(stop => ({
                    ...stop,
                    distance: calculateDistance(
                        coords.latitude,
                        coords.longitude,
                        parseFloat(stop.lat),
                        parseFloat(stop.long)
                    ),
                }))
                .filter(stop => stop.distance <= 1)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 10);

            setNearbyStops(nearby);

            const routesData = {};
            for (const stop of nearby) {
                const stopEtaData = await fetchNearbyStopsAPI(stop.stop);
                if (stopEtaData && Array.isArray(stopEtaData)) {
                    const routeETAs = stopEtaData.reduce((acc, eta) => {
                        if (eta.route && eta.eta) {
                            if (!acc[eta.route]) {
                                acc[eta.route] = [];
                            }
                            acc[eta.route].push({
                                eta: eta.eta,
                                route: eta.route,
                                dest_tc: eta.dest_tc,
                                dest_sc: eta.dest_sc,
                                dest_en: eta.dest_en
                            });
                        }
                        return acc;
                    }, {});

                    const routesArray = Object.entries(routeETAs).map(([route, etas]) => ({
                        route: route,
                        eta: etas[0]?.eta,
                        dest_en: etas[0]?.dest_en,
                        dest_tc: etas[0]?.dest_tc,
                        dest_sc: etas[0]?.dest_sc
                    }));

                    routesData[stop.stop] = routesArray;
                }
            }
            
            setNearbyRoutes(routesData);
        } catch (error) {
            console.error('Error fetching nearby stops:', error);
            Alert.alert('Error', 'Failed to fetch nearby stops');
        } finally {
            setLoading(false);
        }
    };

    const searchBus = async () => {
        if (!busRoute) {
            Alert.alert('Error', 'Please enter a bus route number');
            return;
        }

        setLoading(true);
        try {
            // Always fetch fresh stops data for complete mapping
            const allStopsData = await fetchAllStops();
            const newStopsMap = allStopsData.reduce((acc, stop) => {
                acc[stop.stop] = {
                    name_en: stop.name_en,
                    name_tc: stop.name_tc,
                    name_sc: stop.name_sc
                };
                return acc;
            }, {});
            setStopsMap(newStopsMap);

            const [outboundRoute, inboundRoute] = await Promise.all([
                fetchRouteInfo(busRoute, 'outbound', 1),
                fetchRouteInfo(busRoute, 'inbound', 1)
            ]);

            if (!outboundRoute && !inboundRoute) {
                Alert.alert('Error', 'Bus route not found');
                setLoading(false);
                return;
            }

            // Store both directions' data
            setRouteDetails({
                outbound: outboundRoute,
                inbound: inboundRoute
            });

            // Set initial route info
            const currentRouteInfo = routeDirection === 'outbound' ? outboundRoute : inboundRoute;
            setRouteInfo(currentRouteInfo);

            const routeStopsData = await fetchRouteStops(busRoute, routeDirection, 1);
            const etaData = await fetchRouteETA(busRoute, 1);
            
            if (routeStopsData && etaData) {
                const etaMap = {};
                etaData.forEach(eta => {
                    if (eta.dir === (routeDirection === 'outbound' ? 'O' : 'I')) {
                        const key = eta.seq.toString();
                        if (!etaMap[key]) {
                            etaMap[key] = [];
                        }
                        if (eta.eta) {
                            etaMap[key].push({
                                eta: eta.eta,
                                rmk_en: eta.rmk_en,
                                rmk_tc: eta.rmk_tc,
                                rmk_sc: eta.rmk_sc,
                                eta_seq: eta.eta_seq
                            });
                        }
                    }
                });

                const processedStops = routeStopsData.map(stop => ({
                    seq: stop.seq,
                    stop: stop.stop,
                    name_en: newStopsMap[stop.stop]?.name_en,
                    name_tc: newStopsMap[stop.stop]?.name_tc,
                    name_sc: newStopsMap[stop.stop]?.name_sc,
                    dest_en: currentRouteInfo.dest_en,
                    dest_tc: currentRouteInfo.dest_tc,
                    dest_sc: currentRouteInfo.dest_sc,
                    eta: etaMap[stop.seq.toString()] || []
                }));

                setStops(processedStops);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch bus information');
            console.error(error);
        }
        setLoading(false);
    };

    const toggleDirection = async () => {
        try {
            setLoading(true);
            
            const newDirection = routeDirection === 'outbound' ? 'inbound' : 'outbound';
            
            const newRouteInfo = routeDetails[newDirection];
            if (!newRouteInfo) {
                throw new Error('Route information not found for direction');
            }

            setRouteDirection(newDirection);
            setRouteInfo(newRouteInfo);
                
            // Make sure we have the stops map
            let currentStopsMap = stopsMap;
            if (Object.keys(currentStopsMap).length === 0) {
                const allStopsData = await fetchAllStops();
                currentStopsMap = allStopsData.reduce((acc, stop) => {
                    acc[stop.stop] = {
                        name_en: stop.name_en,
                        name_tc: stop.name_tc,
                        name_sc: stop.name_sc
                    };
                    return acc;
                }, {});
                setStopsMap(currentStopsMap);
            }
            
            const routeStopsData = await fetchRouteStops(busRoute, newDirection, 1);
            const etaData = await fetchRouteETA(busRoute, 1);
            
            if (routeStopsData && etaData) {
                const etaMap = {};
                etaData.forEach(eta => {
                    if (eta.dir === (newDirection === 'outbound' ? 'O' : 'I')) {
                        const key = eta.seq.toString();
                        if (!etaMap[key]) {
                            etaMap[key] = [];
                        }
                        if (eta.eta) {
                            etaMap[key].push({
                                eta: eta.eta,
                                rmk_en: eta.rmk_en,
                                rmk_tc: eta.rmk_tc,
                                rmk_sc: eta.rmk_sc,
                                eta_seq: eta.eta_seq
                            });
                        }
                    }
                });

                const processedStops = routeStopsData.map(stop => ({
                    seq: stop.seq,
                    stop: stop.stop,
                    name_en: currentStopsMap[stop.stop]?.name_en,
                    name_tc: currentStopsMap[stop.stop]?.name_tc,
                    name_sc: currentStopsMap[stop.stop]?.name_sc,
                    dest_en: newRouteInfo.dest_en,
                    dest_tc: newRouteInfo.dest_tc,
                    dest_sc: newRouteInfo.dest_sc,
                    eta: etaMap[stop.seq.toString()] || []
                }));

                setStops(processedStops);
            }
        } catch (error) {
            console.error('Error updating direction:', error);
            Alert.alert('Error', 'Failed to update route direction');

            setRouteDirection(routeDirection);
            setRouteInfo(routeDetails[routeDirection]);
        } finally {
            setLoading(false);
        }
    };

    const toggleSearchMode = (mode) => {
        setSearchMode(mode);
        if (mode === 'nearby' && location) {
            fetchNearbyStops(location.coords);
        }
    };

    const refreshNearbyStops = () => {
        if (location) {
            fetchNearbyStops(location.coords);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <Header />

            <View style={styles.searchTypeContainer}>
                <TouchableOpacity
                    style={[
                        styles.searchTypeButton,
                        searchMode === 'route' && styles.searchTypeButtonActive,
                    ]}
                    onPress={() => toggleSearchMode('route')}
                >
                    <MaterialIcons
                        name="directions-bus"
                        size={24}
                        color={searchMode === 'route' ? '#0066cc' : '#666666'}
                    />
                    <Text
                        style={[
                            styles.searchTypeText,
                            searchMode === 'route' && styles.searchTypeTextActive,
                        ]}
                    >
                        Route Search
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.searchTypeButton,
                        searchMode === 'nearby' && styles.searchTypeButtonActive,
                    ]}
                    onPress={() => toggleSearchMode('nearby')}
                >
                    <MaterialIcons
                        name="near-me"
                        size={24}
                        color={searchMode === 'nearby' ? '#0066cc' : '#666666'}
                    />
                    <Text
                        style={[
                            styles.searchTypeText,
                            searchMode === 'nearby' && styles.searchTypeTextActive,
                        ]}
                    >
                        Near Me
                    </Text>
                </TouchableOpacity>
            </View>

            {searchMode === 'route' ? (
                <>
                    <SearchBar
                        busRoute={busRoute}
                        setBusRoute={setBusRoute}
                        onSearch={searchBus}
                        loading={loading}
                    />

                    {loading ? (
                        <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
                    ) : (
                        <>
                            {routeInfo && (
                                <RouteHeader
                                    routeInfo={routeInfo}
                                    routeDetails={routeDetails}
                                    routeDirection={routeDirection}
                                    onToggle={toggleDirection}
                                    isCircular={isCircularRoute(routeInfo)}
                                    disabled={loading || (!routeDetails.inbound && !isCircularRoute(routeInfo))}
                                />
                            )}
                            <FlatList
                                data={stops}
                                renderItem={({ item }) => <StopItem item={item} />}
                                keyExtractor={(item) => item.seq.toString()}
                                contentContainerStyle={styles.listContainer}
                            />
                        </>
                    )}
                </>
            ) : (
                <View style={styles.nearbyContainer}>
                    {locationLoading || loading ? (
                        <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
                    ) : errorMsg ? (
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    ) : (
                        <>
                            <View style={styles.nearbyHeader}>
                                <Text style={styles.nearbyTitle}>Nearby Bus Stops</Text>
                                <TouchableOpacity 
                                    style={styles.refreshButton} 
                                    onPress={refreshNearbyStops}
                                >
                                    <MaterialIcons name="refresh" size={24} color="#0066cc" />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={nearbyStops}
                                renderItem={({ item }) => (
                                    <NearbyStopItem 
                                        item={item} 
                                        routes={nearbyRoutes[item.stop]} 
                                    />
                                )}
                                keyExtractor={(item) => item.stop}
                                contentContainerStyle={styles.listContainer}
                            />
                        </>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}

// Main App component with Language Provider wrapper
export default function App() {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
}
