// src/components/MTR/MTRPage.js
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
    SafeAreaView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Component imports
import MTRService from '../../services/mtrService';
import MTRLineCard from './MTRLineCard';
import MTRLineDetail from './MTRLineDetail';
import { useLanguage } from '../Header';

const MTRPage = () => {
    // States
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
                            statuses[line.code] = {
                                type: 'alert',
                                message: status?.message || 'Service Alert'
                            };
                        } else if (status.isdelay === 'Y') {
                            statuses[line.code] = {
                                type: 'delayed',
                                message: 'Delayed Service'
                            };
                        } else {
                            statuses[line.code] = {
                                type: 'normal',
                                message: 'Normal Service'
                            };
                        }
                    }
                } catch (err) {
                    console.error(`Error fetching status for line ${line.code}:`, err);
                    statuses[line.code] = {
                        type: 'unknown',
                        message: 'Status Unavailable'
                    };
                }
            }
            setLineStatuses(statuses);
        } catch (err) {
            const errorMessage = 'Failed to load MTR information. Please try again later.';
            setError(errorMessage);
            Alert.alert('Error', errorMessage);
            console.error('Error loading MTR data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadMTRData();
    }, []);

    // Periodic refresh of line statuses
    useEffect(() => {
        if (lines.length === 0) return;

        const intervalId = setInterval(() => {
            // Only update statuses if we're on the main page
            if (!selectedLine) {
                loadMTRData();
            }
        }, 30000); // Every 30 seconds

        return () => clearInterval(intervalId);
    }, [lines, selectedLine]);

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
                    <Text style={styles.loadingText}>
                        {getLocalizedText({
                            en: 'Loading MTR information...',
                            tc: '正在載入港鐵資訊...',
                            sc: '正在载入港铁资讯...'
                        })}
                    </Text>
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
                        <Text style={styles.retryButtonText}>
                            {getLocalizedText({
                                en: 'Retry',
                                tc: '重試',
                                sc: '重试'
                            })}
                        </Text>
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
                        <Text style={styles.emptyText}>
                            {getLocalizedText({
                                en: 'No MTR lines available',
                                tc: '沒有可用的港鐵路線',
                                sc: '没有可用的港铁路线'
                            })}
                        </Text>
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