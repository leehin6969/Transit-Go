import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MTRService from '../../services/mtrService';
import { useLanguage } from '../Header';
import MTRRouteHeader from './MTRRouteHeader';
import MTRStationItem from './MTRStationItem';

const MTRLineDetail = ({ line, onBack }) => {
    const { getLocalizedText } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stations, setStations] = useState([]);
    const [direction, setDirection] = useState('UP');
    const [arrivals, setArrivals] = useState({});
    const [selectedStation, setSelectedStation] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const updateInterval = useRef(null);
    const isUpdating = useRef(false);
    const mounted = useRef(true);

    // Fetch arrivals for stations
    const fetchArrivals = useCallback(async () => {
        if (isUpdating.current || !mounted.current) return;
        isUpdating.current = true;
        
        const newArrivals = {};
        try {
            for (const station of stations) {
                if (!mounted.current) break;
                
                try {
                    const data = await MTRService.getNextTrains(line.code, station.Station_Code);
                    if (data?.data?.[`${line.code}-${station.Station_Code}`]) {
                        newArrivals[station.Station_Code] = direction === 'UP'
                            ? data.data[`${line.code}-${station.Station_Code}`].UP || []
                            : data.data[`${line.code}-${station.Station_Code}`].DOWN || [];
                    }
                } catch (err) {
                    console.error(`Error fetching arrivals for station ${station.Station_Code}:`, err);
                }
            }
            if (mounted.current) {
                setArrivals(newArrivals);
                setRefreshing(false);
            }
        } catch (error) {
            console.error('Error fetching arrivals:', error);
        } finally {
            isUpdating.current = false;
        }
    }, [line.code, stations, direction]);

    // Load stations data
    const loadStations = useCallback(async (dir) => {
        try {
            const stationData = await MTRService.getLineStations(
                line.code, 
                dir === 'UP' ? 'UT' : 'DT'
            );

            if (!stationData || stationData.length === 0) {
                throw new Error('No stations found for this line');
            }

            if (mounted.current) {
                setStations(stationData);
            }
        } catch (err) {
            console.error('Error loading station data:', err);
            if (mounted.current) {
                setError('Failed to load station information');
                setStations([]);
            }
        }
    }, [line.code]);

    // Initial load
    useEffect(() => {
        mounted.current = true;
        const initializeData = async () => {
            setLoading(true);
            await loadStations(direction);
            setLoading(false);
        };

        initializeData();

        return () => {
            mounted.current = false;
            if (updateInterval.current) {
                clearInterval(updateInterval.current);
            }
        };
    }, []);

    // Set up arrivals polling
    useEffect(() => {
        if (stations.length > 0 && mounted.current) {
            fetchArrivals();
            
            updateInterval.current = setInterval(() => {
                if (mounted.current && !isUpdating.current) {
                    fetchArrivals();
                }
            }, 30000);

            return () => {
                if (updateInterval.current) {
                    clearInterval(updateInterval.current);
                }
            };
        }
    }, [stations, fetchArrivals]);

    // Handle direction toggle
    const handleDirectionToggle = useCallback(async () => {
        if (isUpdating.current) return;
        
        const newDirection = direction === 'UP' ? 'DOWN' : 'UP';
        setDirection(newDirection);
        setLoading(true);
        setArrivals({});
        
        await loadStations(newDirection);
        setLoading(false);
    }, [direction, loadStations]);

    const handleStationPress = useCallback((stationCode) => {
        setSelectedStation(prev => prev === stationCode ? null : stationCode);
    }, []);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchArrivals();
    }, [fetchArrivals]);

    const renderStationItem = useCallback(({ item }) => (
        <MTRStationItem
            station={item}
            lineColor={line.color}
            arrivals={arrivals[item.Station_Code] || []}
            isSelected={item.Station_Code === selectedStation}
            onPress={handleStationPress}
            direction={direction}
        />
    ), [selectedStation, arrivals, direction, line.color]);

    const getTerminalStations = useCallback(() => {
        if (!stations.length) return { origin: null, destination: null };

        return {
            origin: stations[0],
            destination: stations[stations.length - 1]
        };
    }, [stations]);
    
    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBack}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#666666" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>
                            {getLocalizedText({
                                en: line.name_en,
                                tc: line.name_tc,
                                sc: line.name_tc
                            })}
                        </Text>
                    </View>
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#0066cc" />
                    <Text style={styles.loadingText}>Loading station information...</Text>
                </View>
            </SafeAreaView>
        );
    }
    
    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBack}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#666666" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>
                            {getLocalizedText({
                                en: line.name_en,
                                tc: line.name_tc,
                                sc: line.name_tc
                            })}
                        </Text>
                    </View>
                </View>
                <View style={styles.centerContainer}>
                    <MaterialIcons name="error-outline" size={48} color="#dc2626" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => loadData(direction)}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#666666" />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        {getLocalizedText({
                            en: line.name_en,
                            tc: line.name_tc,
                            sc: line.name_tc
                        })}
                    </Text>
                </View>
            </View>

            <View style={styles.routeHeaderContainer}>
                <MTRRouteHeader
                    line={line}
                    direction={direction}
                    origin={stations[0]}
                    destination={stations[stations.length - 1]}
                    onToggle={handleDirectionToggle}
                    disabled={loading || isUpdating.current}
                />
            </View>

            {loading && !refreshing && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0066cc" />
                </View>
            )}

            <FlatList
                data={stations}
                renderItem={renderStationItem}
                keyExtractor={item => `${item.Station_Code}-${direction}`}
                contentContainerStyle={[
                    styles.listContainer,
                    stations.length === 0 && styles.emptyListContainer
                ]}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons 
                                name="info-outline" 
                                size={24} 
                                color="#666666" 
                            />
                            <Text style={styles.emptyText}>
                                No stations available
                            </Text>
                        </View>
                    )
                }
            />
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
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
    },
    routeHeaderContainer: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    listContainer: {
        padding: 16,
    },
    emptyListContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666666',
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#dc2626',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: '#0066cc',
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
        marginTop: 8,
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
});

export default MTRLineDetail;