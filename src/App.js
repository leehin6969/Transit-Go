// App.js
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
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
    const [searchMode, setSearchMode] = useState('route');
    const [nearbyRoutes, setNearbyRoutes] = useState({});
    const [stopsMap, setStopsMap] = useState({});
    const [selectedStopId, setSelectedStopId] = useState(null);
    const listRef = useRef(null);

    const { location, loading: locationLoading, errorMsg, refreshLocation } = useLocation();

    const [allRoutes, setAllRoutes] = useState([]);

    useEffect(() => {
        if (searchMode === 'nearby' && location) {
            fetchNearbyStops(location.coords);
        }
    }, [searchMode, location]);

    useEffect(() => {
        if (selectedStopId && stops.length > 0) {
            setTimeout(scrollToStop, 100);
        }
    }, [stops, selectedStopId]);

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const response = await fetch('https://data.etabus.gov.hk/v1/transport/kmb/route/');
                const data = await response.json();
                if (data.data) {
                    setAllRoutes(data.data);
                }
            } catch (error) {
                console.error('Error fetching routes:', error);
            }
        };

        fetchRoutes();
    }, []);

    const isCircularRoute = (routeInfo) => {
        if (!routeInfo) return false;
        return routeInfo.dest_en?.includes('CIRCULAR') ||
            routeInfo.dest_tc?.includes('循環') ||
            routeInfo.dest_sc?.includes('循环') ||
            (routeInfo.orig_en === routeInfo.dest_en &&
                routeInfo.orig_tc === routeInfo.dest_tc &&
                routeInfo.orig_sc === routeInfo.dest_sc);
    };

    const determineRouteDirection = async (routeNumber, destination) => {
        try {
            const [outboundInfo, inboundInfo] = await Promise.all([
                fetchRouteInfo(routeNumber, 'outbound', 1),
                fetchRouteInfo(routeNumber, 'inbound', 1)
            ]);

            if (outboundInfo && outboundInfo.dest_en === destination) {
                return 'outbound';
            } else if (inboundInfo && inboundInfo.dest_en === destination) {
                return 'inbound';
            }

            return 'outbound';
        } catch (error) {
            console.error('Error determining route direction:', error);
            return 'outbound';
        }
    };

    const scrollToStop = () => {
        if (selectedStopId && stops.length > 0 && listRef.current) {
            const stopIndex = stops.findIndex(stop => stop.stop === selectedStopId);
            if (stopIndex !== -1) {
                // First scroll to an approximate position
                listRef.current.scrollToOffset({
                    offset: stopIndex * 150, // Approximate height of each item
                    animated: false
                });

                // Then try to scroll to the exact position
                setTimeout(() => {
                    listRef.current.scrollToIndex({
                        index: stopIndex,
                        animated: true,
                        viewPosition: 0.3, // Position item 30% from the top
                        viewOffset: 20
                    });

                    // Reset selection after a delay
                    setTimeout(() => setSelectedStopId(null), 2000);
                }, 100);
            }
        }
    };

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

    const handleRoutePress = async (route, stop) => {
        try {
            setLoading(true);
            setBusRoute(route.route);
            setSearchMode('route');
            setSelectedStopId(stop.stop);

            const correctDirection = await determineRouteDirection(route.route, route.dest_en);
            setRouteDirection(correctDirection);

            await searchBus(route.route, correctDirection);
        } catch (error) {
            console.error('Error in handleRoutePress:', error);
            Alert.alert('Error', 'Failed to load route information');
        } finally {
            setLoading(false);
        }
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

    const searchBus = async (routeNumber, forcedDirection) => {
        const routeToSearch = routeNumber || busRoute;
        if (!routeToSearch) {
            Alert.alert('Error', 'Please enter a bus route number');
            return;
        }

        setLoading(true);
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

            // First try outbound
            let routeInfo = await fetchRouteInfo(routeToSearch, 'outbound', 1);
            let direction = 'outbound';

            // If outbound fails and it's not circular, try inbound
            if (!routeInfo && !isCircularRoute(routeInfo)) {
                routeInfo = await fetchRouteInfo(routeToSearch, 'inbound', 1);
                direction = 'inbound';
            }

            if (!routeInfo) {
                Alert.alert('Error', 'Bus route not found');
                setLoading(false);
                return;
            }

            // For circular routes, we only need outbound
            const isCircular = isCircularRoute(routeInfo);
            let inboundRoute = null;
            if (!isCircular) {
                inboundRoute = await fetchRouteInfo(routeToSearch, 'inbound', 1);
            }

            setRouteDetails({
                outbound: direction === 'outbound' ? routeInfo : null,
                inbound: direction === 'inbound' ? routeInfo : inboundRoute
            });

            const effectiveDirection = forcedDirection || direction;
            setRouteDirection(effectiveDirection);
            setRouteInfo(routeInfo);

            const routeStopsData = await fetchRouteStops(routeToSearch, effectiveDirection, 1);
            const etaData = await fetchRouteETA(routeToSearch, 1);

            if (routeStopsData && etaData) {
                const etaMap = {};
                etaData.forEach(eta => {
                    if (eta.dir === (effectiveDirection === 'outbound' ? 'O' : 'I')) {
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
                    dest_en: routeInfo.dest_en,
                    dest_tc: routeInfo.dest_tc,
                    dest_sc: routeInfo.dest_sc,
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
        if (isCircularRoute(routeInfo)) return;

        try {
            setLoading(true);
            const newDirection = routeDirection === 'outbound' ? 'inbound' : 'outbound';
            const newRouteInfo = routeDetails[newDirection];

            if (!newRouteInfo) {
                throw new Error('Route information not found for direction');
            }

            setRouteDirection(newDirection);
            setRouteInfo(newRouteInfo);

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

    const refreshNearbyStops = async () => {
        try {
            // Get fresh location first
            const freshLocation = await refreshLocation();

            // If we got a new location, fetch nearby stops
            if (freshLocation) {
                await fetchNearbyStops(freshLocation.coords);
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
            Alert.alert('Error', 'Failed to refresh nearby stops');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <Header
                searchMode={searchMode}
                onSearchModeChange={toggleSearchMode}
            />

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
                        allRoutes={allRoutes}
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
                                ref={listRef}
                                data={stops}
                                renderItem={({ item }) => (
                                    <StopItem
                                        item={item}
                                        isSelected={item.stop === selectedStopId}
                                    />
                                )}
                                keyExtractor={(item) => item.seq.toString()}
                                contentContainerStyle={styles.listContainer}
                                getItemLayout={(data, index) => ({
                                    length: 150, // Fixed height for each item
                                    offset: 150 * index,
                                    index,
                                })}
                                initialNumToRender={20} // Render more items initially
                                maxToRenderPerBatch={20} // Render more items per batch
                                windowSize={21} // Increase window size (10 screens above, 10 below, 1 current)
                                onScrollToIndexFailed={(info) => {
                                    console.warn('Failed to scroll to index', info);
                                    const wait = new Promise(resolve => setTimeout(resolve, 100));
                                    wait.then(() => {
                                        // Scroll to offset first
                                        listRef.current?.scrollToOffset({
                                            offset: info.index * 150,
                                            animated: false,
                                        });
                                        // Then try to scroll to the item
                                        setTimeout(() => {
                                            listRef.current?.scrollToIndex({
                                                index: info.index,
                                                animated: true,
                                                viewPosition: 0.3,
                                                viewOffset: 20
                                            });
                                        }, 100);
                                    });
                                }}
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
                                        onRoutePress={handleRoutePress}
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