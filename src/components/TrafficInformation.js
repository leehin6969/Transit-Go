import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from './Header';

const API_ENDPOINT = "https://mjqx5en68h.execute-api.us-east-2.amazonaws.com/prod/incidents";

const TrafficInformation = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nextToken, setNextToken] = useState(null);
    const { language } = useLanguage();
    const [selectedDate, setSelectedDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Function to parse DynamoDB item
    const parseDynamoDBItem = (item) => {
        if (Array.isArray(item)) {
            return item.map(parseDynamoDBItem);
        } else if (item && typeof item === 'object') {
            const keys = Object.keys(item);
            if (keys.length === 1 && ['S', 'N', 'M', 'L', 'NULL', 'BOOL'].includes(keys[0])) {
                const key = keys[0];
                const value = item[key];
                switch (key) {
                    case 'S':
                        return value;
                    case 'N':
                        return Number(value);
                    case 'BOOL':
                        return Boolean(value);
                    case 'NULL':
                        return null;
                    case 'L':
                        return value.map(parseDynamoDBItem);
                    case 'M':
                        const map = {};
                        for (const k in value) {
                            map[k] = parseDynamoDBItem(value[k]);
                        }
                        return map;
                    default:
                        return value;
                }
            } else {
                const obj = {};
                for (const k in item) {
                    obj[k] = parseDynamoDBItem(item[k]);
                }
                return obj;
            }
        } else {
            return item;
        }
    };

    const getStatusColor = useCallback((status) => {
        if (!status) return styles.statusNew;
        const statusText = status[language === 'en' ? 'en' : 'cn'];
        if (statusText === 'NEW' || statusText === '最新情況') return styles.statusNew;
        if (statusText === 'UPDATED' || statusText === '更新情況') return styles.statusUpdated;
        if (statusText === 'CLOSED' || statusText === '完結') return styles.statusClosed;
        return styles.statusNew;
    }, [language]);

    const fetchIncidents = useCallback(async (refresh = false) => {
        try {
            setLoading(true);
            setError(null);

            const queryParams = new URLSearchParams({
                limit: '20',
                ...(refresh ? {} : nextToken ? { nextToken } : {})
            });

            //console.log('Fetching from:', `${API_ENDPOINT}?${queryParams}`);r

            const response = await fetch(`${API_ENDPOINT}?${queryParams}`);
            const responseData = await response.json();
            
            //console.log('Raw response:', responseData);

            if (!response.ok || responseData.error) {
                throw new Error(
                    responseData.details || 
                    responseData.error || 
                    'Failed to fetch traffic updates'
                );
            }

            const data = typeof responseData.body === 'string' 
                ? JSON.parse(responseData.body) 
                : responseData;

            //console.log('Processed data:', data);

            // Parse DynamoDB items
            const processedIncidents = (data.items || []).map(item => {
                const parsedItem = parseDynamoDBItem(item);
                return {
                    ...parsedItem,
                    uniqueId: parsedItem.id?.toString() || `${parsedItem.incidentNumber}-${parsedItem.announcementDate}`
                };
            });

            const newIncidents = refresh 
                ? processedIncidents
                : [...incidents, ...processedIncidents];

            // Remove duplicates based on id
            const uniqueIncidents = Array.from(
                new Map(newIncidents.map(item => [item.id, item])).values()
            );

            // Sort the incidents by announcementDate in descending order
            uniqueIncidents.sort((a, b) => new Date(b.announcementDate) - new Date(a.announcementDate));

            setIncidents(uniqueIncidents);
            setNextToken(data.nextToken);
            
        } catch (error) {
            console.error('Error fetching incidents:', error);
            setError(error.message || 'Failed to load traffic updates. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [nextToken, incidents]);

    useEffect(() => {
        fetchIncidents(true);
        const interval = setInterval(() => fetchIncidents(true), 300000);
        return () => clearInterval(interval);
    }, [language]);

    const renderIncident = useCallback(({ item }) => {
        const lang = language === 'en' ? 'en' : 'cn';
        
        const getContent = (field) => {
            if (!item[field]) return '';
            return item[field][lang] || '';
        };
        
        const getNestedContent = (field, subfield) => {
            if (!item[field] || !item[field][subfield]) return '';
            return item[field][subfield][lang] || '';
        };

        return (
            <View style={styles.incidentContainer}>
                <View style={styles.header}>
                    <Text style={styles.heading}>{getContent('heading')}</Text>
                    <View style={[styles.statusContainer, getStatusColor(item.status)]}>
                        <Text style={styles.statusText}>
                            {getContent('status')}
                        </Text>
                    </View>
                </View>

                {getContent('detail') && (
                    <Text style={styles.detail}>{getContent('detail')}</Text>
                )}

                {getContent('location') && (
                    <Text style={styles.location}>{getContent('location')}</Text>
                )}

                {getContent('district') && (
                    <Text style={styles.district}>{getContent('district')}</Text>
                )}

                {getContent('direction') && (
                    <Text style={styles.direction}>{getContent('direction')}</Text>
                )}

                {getNestedContent('landmarks', 'near') && (
                    <Text style={styles.landmark}>
                        {language === 'en' ? 'Near: ' : '附近: '}
                        {getNestedContent('landmarks', 'near')}
                    </Text>
                )}

                {getNestedContent('landmarks', 'between') && (
                    <Text style={styles.landmark}>
                        {language === 'en' ? 'Between: ' : '位於: '}
                        {getNestedContent('landmarks', 'between')}
                    </Text>
                )}

                {getContent('content') && (
                    <Text style={styles.content}>{getContent('content')}</Text>
                )}

                <Text style={styles.date}>
                    {new Date(item.announcementDate).toLocaleString(
                        language === 'en' ? 'en-HK' : 'zh-HK',
                        { timeZone: 'Asia/Hong_Kong' }
                    )}
                </Text>
            </View>
        );
    }, [language, getStatusColor]);

    const handleLoadMore = () => {
        if (nextToken && !loading) {
            fetchIncidents();
        }
    };

    const handleRefresh = () => {
        fetchIncidents(true);
    };

    const onDateChange = (event, date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
        }
    };

    const openDatePicker = () => {
        setShowDatePicker(true);
    };

    const clearDateFilter = () => {
        setSelectedDate(null);
    };

    // Compute filtered incidents
    const filteredIncidents = selectedDate
        ? incidents.filter(incident => {
            const incidentDate = new Date(incident.announcementDate);
            return incidentDate.toDateString() === selectedDate.toDateString();
        })
        : incidents;

    if (loading && incidents.length === 0) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={styles.loadingText}>
                    {language === 'en' ? 'Loading traffic updates...' : '正在載入交通消息...'}
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={handleRefresh}
                >
                    <Text style={styles.retryButtonText}>
                        {language === 'en' ? 'Retry' : '重試'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                <TouchableOpacity onPress={openDatePicker} style={styles.datePickerButton}>
                    <Text style={styles.filterText}>
                        {selectedDate
                            ? selectedDate.toLocaleDateString(language === 'en' ? 'en-HK' : 'zh-HK')
                            : (language === 'en' ? 'Select Date' : '選擇日期')}
                    </Text>
                </TouchableOpacity>
                {selectedDate && (
                    <TouchableOpacity style={styles.clearFilterButton} onPress={clearDateFilter}>
                        <Text style={styles.clearFilterButtonText}>
                            {language === 'en' ? 'Clear' : '清除'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}

            <FlatList
                data={filteredIncidents}
                renderItem={renderIncident}
                keyExtractor={item => item.uniqueId}
                contentContainerStyle={styles.listContainer}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshing={loading}
                onRefresh={handleRefresh}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContainer: {
        padding: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f2f2f2',
    },
    datePickerButton: {
        flex: 1,
        backgroundColor: '#e0e0e0',
        padding: 10,
        borderRadius: 4,
        alignItems: 'center',
    },
    filterText: {
        fontSize: 16,
        color: '#333',
    },
    clearFilterButton: {
        marginLeft: 8,
        backgroundColor: '#dc2626',
        padding: 10,
        borderRadius: 4,
    },
    clearFilterButtonText: {
        color: '#fff',
    },
    incidentContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    heading: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        flex: 1,
        marginRight: 8,
    },
    detail: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
    },
    statusContainer: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    statusNew: {
        backgroundColor: '#e3f2fd',
    },
    statusUpdated: {
        backgroundColor: '#fff3e0',
    },
    statusClosed: {
        backgroundColor: '#eeeeee',
    },
    location: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
    },
    district: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
    },
    direction: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
    },
    landmark: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
        fontStyle: 'italic',
    },
    content: {
        fontSize: 14,
        color: '#333333',
        marginVertical: 8,
        lineHeight: 20,
    },
    date: {
        fontSize: 12,
        color: '#999999',
        marginTop: 4,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    loadingText: {
        marginTop: 8,
        color: '#666666',
        fontSize: 14, 
    },
    errorText: {
        color: '#dc2626',
        textAlign: 'center',
        marginBottom: 16,
        fontSize: 14,
    },
    retryButton: {
        backgroundColor: '#0066cc',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
    },
    retryButtonText: {
        color: '#ffffff',
        fontWeight: '500',
    },
});

export default TrafficInformation;
