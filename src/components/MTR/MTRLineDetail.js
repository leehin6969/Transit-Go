import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MTRService from '../../services/mtrService';
import MTRStationItem from './MTRStationItem';
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
    };

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                const stationData = await MTRService.getLineStations(line.code);
                setStations(stationData);
                await fetchArrivals();
            } catch (err) {
                setError('Failed to load station information');
                console.error('Error loading station data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [line.code]);

    // Set up periodic refresh
    useEffect(() => {
        const interval = setInterval(fetchArrivals, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [stations, direction]);

    const handleDirectionToggle = () => {
        setDirection(prev => prev === 'UP' ? 'DOWN' : 'UP');
        fetchArrivals();
    };

    const handleStationPress = (stationCode) => {
        setSelectedStation(stationCode === selectedStation ? null : stationCode);
    };

    const renderStationItem = useCallback(({ item }) => (
        <MTRStationItem
            station={item}
            lineColor={line.color}
            arrivals={arrivals[item.Station_Code]}
            isSelected={item.Station_Code === selectedStation}
            onPress={handleStationPress}
            direction={direction}
        />
    ), [selectedStation, arrivals, direction, line.color]);

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={styles.loadingText}>Loading station information...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <MaterialIcons name="error-outline" size={48} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
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

            <View style={styles.directionToggle}>
                <TouchableOpacity
                    style={[
                        styles.directionButton,
                        direction === 'UP' && styles.directionButtonActive,
                        { borderColor: line.color }
                    ]}
                    onPress={() => setDirection('UP')}
                >
                    <Text style={[
                        styles.directionText,
                        direction === 'UP' && styles.directionTextActive,
                        { color: direction === 'UP' ? line.color : '#666666' }
                    ]}>
                        UP
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.directionButton,
                        direction === 'DOWN' && styles.directionButtonActive,
                        { borderColor: line.color }
                    ]}
                    onPress={() => setDirection('DOWN')}
                >
                    <Text style={[
                        styles.directionText,
                        direction === 'DOWN' && styles.directionTextActive,
                        { color: direction === 'DOWN' ? line.color : '#666666' }
                    ]}>
                        DOWN
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={stations}
                renderItem={renderStationItem}
                keyExtractor={item => item.Station_Code}
                contentContainerStyle={styles.listContainer}
                refreshing={refreshing}
                onRefresh={fetchArrivals}
            />
        </View>
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
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
    },
    directionToggle: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
    },
    directionButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    directionButtonActive: {
        backgroundColor: '#f0f7ff',
    },
    directionText: {
        fontSize: 16,
        fontWeight: '500',
    },
    directionTextActive: {
        fontWeight: '600',
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
    },
});

export default MTRLineDetail;