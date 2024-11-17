import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Component imports
import Header, { LanguageProvider } from './components/Header';
import NearbyStopItem from './components/NearbyStopItem';
import RouteHeader from './components/RouteHeader';
import SearchBar from './components/SearchBar';
import StopItem from './components/StopItem';
import TrafficInformation from './components/TrafficInformation';
import SettingsPage from './components/SettingsPage';

// Utility imports
import useLocation from './hooks/useLocation';
import {
    fetchAllStops,
    fetchNearbyStops as fetchNearbyStopsAPI,
    fetchRouteETA,
    fetchRouteInfo,
    fetchRouteStops
} from './services/api';
import { calculateDistance } from './utils/distance';
import { getRouteDirectionInfo } from './utils/routeServiceCheck';

function AppContent() {
    // States
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
    const [transitioning, setTransitioning] = useState(false);
    const [allRoutes, setAllRoutes] = useState([]);
    const [modalContent, setModalContent] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    const [showMenu, setShowMenu] = useState(false);
    const [menuHeight] = useState(new Animated.Value(0));

    // Refs
    const listRef = useRef(null);

    const handleSettingsPress = () => {
        setShowSettings(true);
    };

    // Modal handlers
    const showModal = (content) => {
        setModalContent(content);
    };

    const hideModal = () => {
        setModalContent(null);
    };

    const toggleMenu = () => {
        setShowMenu(!showMenu);
        Animated.timing(menuHeight, {
            toValue: !showMenu ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    // Hooks
    const { location, loading: locationLoading, errorMsg, refreshLocation } = useLocation();

    const scrollToStop = useCallback((index) => {
        if (!listRef.current || !transitioning) return;

        try {
            // First try to scroll immediately
            listRef.current.scrollToIndex({
                index,
                animated: true,
                viewPosition: 0.3,
                viewOffset: 20
            });
        } catch (error) {
            // If immediate scroll fails, try with a delay
            console.warn('Initial scroll failed, retrying with delay');
            setTimeout(() => {
                if (listRef.current && transitioning) {
                    listRef.current.scrollToIndex({
                        index,
                        animated: true,
                        viewPosition: 0.3,
                        viewOffset: 20
                    });
                }
            }, 100);
        } finally {
            // Reset transitioning state after a delay
            setTimeout(() => {
                setTransitioning(false);
            }, 500);
        }
    }, [transitioning]);

    // Effects
    useEffect(() => {
        if (searchMode === 'nearby' && location) {
            fetchNearbyStops(location.coords);
        }
    }, [searchMode, location]);

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

    useEffect(() => {
        if (transitioning && selectedStopId && stops.length > 0) {
            const stopIndex = stops.findIndex(stop => stop.stop === selectedStopId);
            if (stopIndex !== -1) {
                // Add a small delay to ensure the FlatList is ready
                setTimeout(() => {
                    scrollToStop(stopIndex);
                }, 100);
            } else {
                setTransitioning(false);
            }
        }
    }, [stops, selectedStopId, transitioning, scrollToStop]);

    // Handler functions
    const handleStopPress = useCallback((stopId) => {
        setSelectedStopId(stopId === selectedStopId ? null : stopId);
    }, [selectedStopId]);

    const handleRoutePress = async (route, stop) => {
        try {
            setLoading(true);
            setTransitioning(true);
            setBusRoute(route.route);
            setSearchMode('route');

            const correctDirection = await determineRouteDirection(route.route, route.dest_en);
            setRouteDirection(correctDirection);

            await searchBus(route.route, correctDirection);

            requestAnimationFrame(() => {
                setSelectedStopId(stop.stop);
            });

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

                    routesData[stop.stop] = Object.entries(routeETAs).map(([route, etas]) => ({
                        route: route,
                        eta: etas[0]?.eta,
                        dest_en: etas[0]?.dest_en,
                        dest_tc: etas[0]?.dest_tc,
                        dest_sc: etas[0]?.dest_sc
                    }));
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

            const directionInfo = await getRouteDirectionInfo(routeToSearch);

            if (!directionInfo.outboundInfo && !directionInfo.inboundInfo) {
                Alert.alert('Error', 'Bus route not found');
                setLoading(false);
                return;
            }

            let direction = forcedDirection || directionInfo.validDirections[0];
            let routeInfo = direction === 'outbound' ? directionInfo.outboundInfo : directionInfo.inboundInfo;

            setRouteDetails({
                outbound: directionInfo.outboundInfo,
                inbound: directionInfo.inboundInfo
            });

            setRouteDirection(direction);
            setRouteInfo(routeInfo);

            const routeStopsData = await fetchRouteStops(routeToSearch, direction, 1);
            const etaData = await fetchRouteETA(routeToSearch, 1);

            if (routeStopsData && etaData) {
                const etaMap = {};
                etaData.forEach(eta => {
                    if (eta.dir === (direction === 'outbound' ? 'O' : 'I')) {
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
            console.error('Error in searchBus:', error);
            Alert.alert('Error', 'Failed to fetch bus information');
        } finally {
            setLoading(false);
        }
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

    const toggleDirection = async () => {
        if (routeInfo?.dest_en?.includes('CIRCULAR')) return;

        try {
            setLoading(true);
            setSelectedStopId(null);
            const newDirection = routeDirection === 'outbound' ? 'inbound' : 'outbound';
            const newRouteInfo = routeDetails[newDirection];

            if (!newRouteInfo) {
                throw new Error('Route information not found for direction');
            }

            setRouteDirection(newDirection);
            setRouteInfo(newRouteInfo);

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
                    name_en: stopsMap[stop.stop]?.name_en,
                    name_tc: stopsMap[stop.stop]?.name_tc,
                    name_sc: stopsMap[stop.stop]?.name_sc,
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
        setSelectedStopId(null);
        setSearchMode(mode);
        if (mode === 'nearby' && location) {
            fetchNearbyStops(location.coords);
        }
    };

    const refreshNearbyStops = async () => {
        try {
            const freshLocation = await refreshLocation();
            if (freshLocation) {
                await fetchNearbyStops(freshLocation.coords);
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
            Alert.alert('Error', 'Failed to refresh nearby stops');
        }
    };

    const renderStopItem = useCallback(({ item }) => (
        <StopItem
            item={item}
            isSelected={item.stop === selectedStopId}
            onPress={handleStopPress}
            showModal={showModal}
            hideModal={hideModal}
            onRoutePress={handleRoutePress}
        />
    ), [selectedStopId, handleStopPress, showModal, hideModal, handleRoutePress]);

    const getItemLayout = useCallback((data, index) => ({
        length: 100, // Approximate height of each item
        offset: 190 * index,
        index,
    }), []);

    const handleScrollToIndexFailed = useCallback((info) => {
        const wait = new Promise(resolve => setTimeout(resolve, 500));
        wait.then(() => {
            if (listRef.current && !transitioning) {
                listRef.current.scrollToIndex({
                    index: info.index,
                    animated: true,
                    viewPosition: 0.5
                });
            }
        });
    }, [transitioning]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <Header
                searchMode={searchMode}
                onSearchModeChange={toggleSearchMode}
                showMenu={showMenu}
                onMenuPress={toggleMenu}
                onSettingsPress={() => setShowSettings(true)}
            />

            {!showSettings && (
                <>
                    <Animated.View
                        style={[
                            styles.searchTypeContainer,
                            {
                                maxHeight: menuHeight.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 100]
                                }),
                                opacity: menuHeight,
                                overflow: 'hidden'
                            }
                        ]}
                    >
                        <TouchableOpacity
                            style={[
                                styles.searchTypeButton,
                                searchMode === 'route' && styles.searchTypeButtonActive,
                            ]}
                            onPress={() => {
                                toggleSearchMode('route');
                                setShowMenu(false);
                            }}
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
                            onPress={() => {
                                toggleSearchMode('nearby');
                                setShowMenu(false);
                            }}
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

                        <TouchableOpacity
                            style={[
                                styles.searchTypeButton,
                                searchMode === 'traffic' && styles.searchTypeButtonActive,
                            ]}
                            onPress={() => {
                                toggleSearchMode('traffic');
                                setShowMenu(false);
                            }}
                        >
                            <MaterialIcons
                                name="traffic"
                                size={24}
                                color={searchMode === 'traffic' ? '#0066cc' : '#666666'}
                            />
                            <Text
                                style={[
                                    styles.searchTypeText,
                                    searchMode === 'traffic' && styles.searchTypeTextActive,
                                ]}
                            >
                                Traffic Info
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

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
                                            disabled={loading}
                                        />
                                    )}
                                    <FlatList
                                        ref={listRef}
                                        data={stops}
                                        renderItem={renderStopItem}
                                        keyExtractor={(item) => item.seq.toString()}
                                        contentContainerStyle={styles.listContainer}
                                        getItemLayout={getItemLayout}
                                        onScrollToIndexFailed={handleScrollToIndexFailed}
                                    />
                                </>
                            )}
                        </>
                    ) : searchMode === 'nearby' ? (
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
                                            disabled={loading}
                                        >
                                            <MaterialIcons
                                                name="refresh"
                                                size={24}
                                                color={loading ? '#cccccc' : '#0066cc'}
                                            />
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
                    ) : searchMode === 'traffic' ? (
                        <TrafficInformation />
                    ) : null}
                </>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <View style={[
                    StyleSheet.absoluteFill,
                    styles.settingsModal
                ]}>
                    <SettingsPage onClose={() => setShowSettings(false)} />
                </View>
            )}

            {/* Modal Container */}
            {modalContent && (
                <View style={[
                    StyleSheet.absoluteFill,
                    {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: '#f5f5f5',
                        zIndex: 1000,
                    }
                ]}>
                    {modalContent}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loader: {
        marginTop: 24,
    },
    listContainer: {
        padding: 16,
        paddingTop: 8,
    },
    nearbyContainer: {
        flex: 1,
    },
    nearbyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 8,
    },
    nearbyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
    },
    refreshButton: {
        padding: 8,
    },
    errorText: {
        color: '#ff3b30',
        textAlign: 'center',
        margin: 16,
    },
    searchTypeContainer: {
        flexDirection: 'row',
        padding: 8,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        justifyContent: 'space-around',
    },
    searchTypeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        gap: 8,
    },
    searchTypeButtonActive: {
        backgroundColor: '#f0f7ff',
    },
    searchTypeText: {
        fontSize: 16,
        color: '#666666',
    },
    searchTypeTextActive: {
        color: '#0066cc',
        fontWeight: '500',
    },
});