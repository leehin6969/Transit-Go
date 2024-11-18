// components/MTR/MTRLineDetail.js
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MTRService from '../../services/mtrService';
import MTRStationItem from './MTRStationItem';
import MTRRouteHeader from './MTRRouteHeader';
import { useLanguage } from '../Header';

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

    // Function to fetch arrivals for all stations
    const fetchArrivals = async () => {
        const newArrivals = {};
        for (const station of stations) {
            try {
                const data = await MTRService.getNextTrains(line.code, station.Station_Code);
                if (data.data && data.data[`${line.code}-${station.Station_Code}`]) {
                    newArrivals[station.Station_Code] = direction === 'UP'
                        ? data.data[`${line.code}-${station.Station_Code}`].UP || []
                        : data.data[`${line.code}-${station.Station_Code}`].DOWN || [];
                }
            } catch (err) {
                console.error(`Error fetching arrivals for station ${station.Station_Code}:`, err);
            }
        }
        setArrivals(newArrivals);
        setRefreshing(false);
    };

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch station data from MTR service
                const stationData = await MTRService.getLineStations(line.code);

                if (!stationData || stationData.length === 0) {
                    throw new Error('No stations found for this line');
                }

                setStations(stationData);
                await fetchArrivals();
            } catch (err) {
                console.error('Error loading station data:', err);
                setError('Failed to load station information');
            } finally {
                setLoading(false);
            }
        };

        loadData();

        return () => {
            if (updateInterval.current) {
                clearInterval(updateInterval.current);
            }
        };
    }, [line.code]);

    // Set up periodic updates
    useEffect(() => {
        if (stations.length > 0) {
            fetchArrivals();
            updateInterval.current = setInterval(fetchArrivals, 30000); // Update every 30 seconds

            return () => {
                if (updateInterval.current) {
                    clearInterval(updateInterval.current);
                }
            };
        }
    }, [stations, direction]);

    const handleDirectionToggle = useCallback(() => {
        setDirection(prev => prev === 'UP' ? 'DOWN' : 'UP');
    }, []);

    const handleStationPress = useCallback((stationCode) => {
        setSelectedStation(stationCode === selectedStation ? null : stationCode);
    }, [selectedStation]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchArrivals();
    }, []);

    const renderStationItem = useCallback(({ item, index }) => (
        <MTRStationItem
            station={item}
            lineColor={line.color}
            arrivals={arrivals[item.Station_Code]}
            isSelected={item.Station_Code === selectedStation}
            onPress={handleStationPress}
            direction={direction}
            isFirst={index === 0}
            isLast={index === stations.length - 1}
            showConnections={true}
        />
    ), [selectedStation, arrivals, direction, line.color, stations.length]);

    const getTerminalStations = useCallback(() => {
        if (!stations.length) return { origin: null, destination: null };

        if (direction === 'UP') {
            return {
                origin: stations[0],
                destination: stations[stations.length - 1]
            };
        } else {
            return {
                origin: stations[stations.length - 1],
                destination: stations[0]
            };
        }
    }, [stations, direction]);

    if (loading) {
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
                        onPress={() => setLoading(true)}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const terminals = getTerminalStations();

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

            <MTRRouteHeader
                line={line}
                direction={direction}
                origin={terminals.origin}
                destination={terminals.destination}
                onToggle={handleDirectionToggle}
                disabled={loading}
            />

            <FlatList
                data={stations}
                renderItem={renderStationItem}
                keyExtractor={item => item.Station_Code}
                contentContainerStyle={styles.listContainer}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No stations available</Text>
                    </View>
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
    listContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
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
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    }
});

export default MTRLineDetail;