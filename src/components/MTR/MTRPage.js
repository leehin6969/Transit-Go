// components/MTR/MTRPage.js
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Component imports
import MTRService from '../../services/mtrService';
import { useLanguage } from '../Header';
import MTRLineCard from './MTRLineCard';
import MTRLineDetail from './MTRLineDetail';

const MTRPage = () => {
    const [selectedLine, setSelectedLine] = useState(null);
    const [lines, setLines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [lineStatuses, setLineStatuses] = useState({});

    const { getLocalizedText } = useLanguage();

    const loadMTRData = async () => {
        try {
            setError(null);
            await MTRService.initialize();
            const allLines = MTRService.getAllLines();
            setLines(allLines);

            // Initialize line statuses
            const statuses = {};
            for (const line of allLines) {
                try {
                    const stations = MTRService.getLineStations(line.code);
                    if (stations && stations.length > 0) {
                        const firstStation = stations[0];
                        const status = await MTRService.getNextTrains(
                            line.code,
                            firstStation.Station_Code
                        );

                        // Determine line status
                        if (!status || status.status === 0) {
                            statuses[line.code] = 'alert';
                        } else if (status.isdelay === 'Y') {
                            statuses[line.code] = 'delayed';
                        } else {
                            statuses[line.code] = 'normal';
                        }
                    }
                } catch (err) {
                    console.error(`Error fetching status for line ${line.code}:`, err);
                    statuses[line.code] = 'unknown';
                }
            }
            setLineStatuses(statuses);
        } catch (err) {
            console.error('Error loading MTR data:', err);
            setError('Failed to load MTR information. Please try again later.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadMTRData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMTRData();
    };

    const handleLinePress = (line) => {
        setSelectedLine(line);
    };

    if (selectedLine) {
        return (
            <MTRLineDetail
                line={selectedLine}
                onBack={() => setSelectedLine(null)}
            />
        );
    }

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#0066cc" />
                    <Text style={styles.loadingText}>Loading MTR information...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <MaterialIcons name="error-outline" size={48} color="#dc2626" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={loadMTRData}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={lines}
                renderItem={({ item }) => (
                    <MTRLineCard
                        line={item}
                        status={lineStatuses[item.code]}
                        onPress={() => handleLinePress(item)}
                    />
                )}
                keyExtractor={(item) => item.code}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#0066cc']}
                        tintColor="#0066cc"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="info-outline" size={48} color="#999999" />
                        <Text style={styles.emptyText}>No MTR lines available</Text>
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
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
        marginTop: 16,
        fontSize: 16,
        color: '#999999',
        textAlign: 'center',
    }
});

export default MTRPage;