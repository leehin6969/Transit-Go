import { TRAFFIC_API_ENDPOINT } from '@env';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useLanguage } from './Header';
const API_ENDPOINT = TRAFFIC_API_ENDPOINT;

const TrafficInformation = () => {
    const [incidents, setIncidents] = useState([]);
    const [groupedIncidents, setGroupedIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nextToken, setNextToken] = useState(null);
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    const { language } = useLanguage();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);

    const parseDynamoDBItem = (item) => {
        if (Array.isArray(item)) {
            return item.map(parseDynamoDBItem);
        } else if (item && typeof item === 'object') {
            const keys = Object.keys(item);
            if (keys.length === 1 && ['S', 'N', 'M', 'L', 'NULL', 'BOOL'].includes(keys[0])) {
                const key = keys[0];
                const value = item[key];
                switch (key) {
                    case 'S': return value;
                    case 'N': return Number(value);
                    case 'BOOL': return Boolean(value);
                    case 'NULL': return null;
                    case 'L': return value.map(parseDynamoDBItem);
                    case 'M':
                        const map = {};
                        for (const k in value) {
                            map[k] = parseDynamoDBItem(value[k]);
                        }
                        return map;
                    default: return value;
                }
            } else {
                const obj = {};
                for (const k in item) {
                    obj[k] = parseDynamoDBItem(item[k]);
                }
                return obj;
            }
        }
        return item;
    };

    const getStatusColor = useCallback((status) => {
        if (!status) return styles.statusNew;
        const statusText = status[language === 'en' ? 'en' : 'cn'];
        if (statusText === 'NEW' || statusText === '最新情況') return styles.statusNew;
        if (statusText === 'UPDATED' || statusText === '更新情況') return styles.statusUpdated;
        if (statusText === 'CLOSED' || statusText === '完結') return styles.statusClosed;
        return styles.statusNew;
    }, [language]);

    const groupAndSortIncidents = useCallback((incidentsList) => {
        // Group incidents by incidentNumber
        const groups = incidentsList.reduce((acc, incident) => {
            const groupKey = incident.incidentNumber;
            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }
            acc[groupKey].push(incident);
            return acc;
        }, {});

        // Sort incidents within each group by date (newest first)
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) =>
                new Date(b.announcementDate) - new Date(a.announcementDate)
            );
        });

        // Convert to array and sort groups by their latest update
        return Object.entries(groups)
            .map(([incidentNumber, incidents]) => ({
                incidentNumber,
                incidents,
                latestDate: new Date(incidents[0].announcementDate)
            }))
            .sort((a, b) => b.latestDate - a.latestDate);
    }, []);

    const fetchIncidents = useCallback(async (refresh = false) => {
        try {
            setLoading(true);
            setError(null);

            const queryParams = new URLSearchParams({
                limit: '20',
                ...(refresh ? {} : nextToken ? { nextToken } : {})
            });

            const response = await fetch(`${API_ENDPOINT}?${queryParams}`);
            const responseData = await response.json();

            if (!response.ok || responseData.error) {
                throw new Error(responseData.details || responseData.error || 'Failed to fetch traffic updates');
            }

            const data = typeof responseData.body === 'string' ? JSON.parse(responseData.body) : responseData;

            const processedIncidents = (data.items || []).map(item => {
                const parsedItem = parseDynamoDBItem(item);
                return {
                    ...parsedItem,
                    uniqueId: parsedItem.id?.toString() || `${parsedItem.incidentNumber}-${parsedItem.announcementDate}`
                };
            });

            const newIncidents = refresh ? processedIncidents : [...incidents, ...processedIncidents];
            const uniqueIncidents = Array.from(
                new Map(newIncidents.map(item => [item.uniqueId, item])).values()
            );

            setIncidents(uniqueIncidents);
            setGroupedIncidents(groupAndSortIncidents(uniqueIncidents));
            setNextToken(data.nextToken);
        } catch (error) {
            console.error('Error fetching incidents:', error);
            setError(error.message || 'Failed to load traffic updates. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [nextToken, incidents, groupAndSortIncidents]);

    useEffect(() => {
        fetchIncidents(true);
        const interval = setInterval(() => fetchIncidents(true), 300000);
        return () => clearInterval(interval);
    }, [language]);

    const toggleGroupExpansion = (incidentNumber) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(incidentNumber)) {
                newSet.delete(incidentNumber);
            } else {
                newSet.add(incidentNumber);
            }
            return newSet;
        });
    };

    const renderIncidentCard = useCallback((incident, isLatest = false) => {
        const lang = language === 'en' ? 'en' : 'cn';

        const getContent = (field) => {
            if (!incident[field]) return '';
            return incident[field][lang] || '';
        };

        const getNestedContent = (field, subfield) => {
            if (!incident[field] || !incident[field][subfield]) return '';
            return incident[field][subfield][lang] || '';
        };

        return (
            <View style={[
                styles.incidentCard,
                !isLatest && styles.historicalCard
            ]}>
                <View style={styles.header}>
                    <View style={styles.headerMain}>
                        {isLatest && (
                            <Text style={styles.incidentNumber}>
                                {incident.incidentNumber}
                            </Text>
                        )}
                        <View style={[
                            styles.statusContainer,
                            getStatusColor(incident.status)
                        ]}>
                            <Text style={styles.statusText}>
                                {getContent('status')}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.date}>
                        {new Date(incident.announcementDate).toLocaleString(
                            language === 'en' ? 'en-HK' : 'zh-HK',
                            { timeZone: 'Asia/Hong_Kong' }
                        )}
                    </Text>
                </View>

                <Text style={styles.heading}>{getContent('heading')}</Text>

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
            </View>
        );
    }, [language, getStatusColor]);

    const renderIncidentGroup = useCallback(({ item }) => {
        const isExpanded = expandedGroups.has(item.incidentNumber);
        const hasMultipleIncidents = item.incidents.length > 1;

        return (
            <View style={styles.groupContainer}>
                <TouchableOpacity
                    style={styles.latestIncidentContainer}
                    onPress={() => hasMultipleIncidents && toggleGroupExpansion(item.incidentNumber)}
                    activeOpacity={hasMultipleIncidents ? 0.7 : 1}
                >
                    {renderIncidentCard(item.incidents[0], true)}
                    {hasMultipleIncidents && (
                        <View style={styles.expandButton}>
                            <MaterialIcons
                                name={isExpanded ? 'expand-less' : 'expand-more'}
                                size={24}
                                color="#666666"
                            />
                            <Text style={styles.updateCount}>
                                {language === 'en'
                                    ? `${item.incidents.length - 1} previous updates`
                                    : `${item.incidents.length - 1} 個更新`
                                }
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {isExpanded && item.incidents.slice(1).map((incident, index) => (
                    <View key={incident.uniqueId} style={styles.historicalIncidentContainer}>
                        {renderIncidentCard(incident, false)}
                    </View>
                ))}
            </View>
        );
    }, [expandedGroups, renderIncidentCard, language]);

    const showDatePicker = () => {
        setDatePickerVisible(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisible(false);
    };

    const handleConfirm = (date) => {
        setSelectedDate(date);
        hideDatePicker();
    };

    const clearDateFilter = () => {
        setSelectedDate(new Date());
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const filteredGroups = groupedIncidents.filter(group => {
        const groupDate = new Date(group.latestDate);
        return (
            groupDate.getFullYear() === selectedDate.getFullYear() &&
            groupDate.getMonth() === selectedDate.getMonth() &&
            groupDate.getDate() === selectedDate.getDate()
        );
    });

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
                    onPress={() => fetchIncidents(true)}
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
                <TouchableOpacity
                    onPress={showDatePicker}
                    style={styles.datePickerButton}
                >
                    <Text style={styles.filterText}>
                        {selectedDate.toLocaleDateString(
                            language === 'en' ? 'en-HK' : 'zh-HK',
                            { timeZone: 'Asia/Hong_Kong' }
                        )}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.clearFilterButton,
                        isToday(selectedDate) && styles.clearFilterButtonDisabled
                    ]}
                    onPress={clearDateFilter}
                    disabled={isToday(selectedDate)}
                >
                    <Text style={[
                        styles.clearFilterButtonText,
                        isToday(selectedDate) && styles.clearFilterButtonTextDisabled
                    ]}>
                        {language === 'en' ? 'Today' : '今天'}
                    </Text>
                </TouchableOpacity>
            </View>

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                maximumDate={new Date()}
                date={selectedDate}
                display="inline"
                themeVariant="light"
                confirmTextIOS={language === 'en' ? 'Confirm' : '確認'}
                cancelTextIOS={language === 'en' ? 'Cancel' : '取消'}
            />

            <FlatList
                data={filteredGroups}
                renderItem={renderIncidentGroup}
                keyExtractor={item => item.incidentNumber}
                contentContainerStyle={[
                    styles.listContainer,
                    filteredGroups.length === 0 && styles.emptyListContainer
                ]}
                onEndReached={() => nextToken && !loading && fetchIncidents()}
                onEndReachedThreshold={0.5}
                refreshing={loading}
                onRefresh={() => fetchIncidents(true)}
                ListEmptyComponent={() => (
                    <View style={styles.emptyStateContainer}>
                        <Text style={styles.emptyStateText}>
                            {language === 'en'
                                ? 'No traffic incidents reported for this date'
                                : '該日期沒有交通事故報告'}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContainer: {
        padding: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    datePickerButton: {
        flex: 1,
        backgroundColor: '#f0f7ff',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    filterText: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '500',
    },
    clearFilterButton: {
        marginLeft: 12,
        backgroundColor: '#0066cc',
        padding: 12,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    clearFilterButtonDisabled: {
        backgroundColor: '#e0e0e0',
    },
    clearFilterButtonText: {
        color: '#ffffff',
        fontWeight: '500',
        fontSize: 14,
    },
    clearFilterButtonTextDisabled: {
        color: '#999999',
    },
    groupContainer: {
        marginBottom: 16,
    },
    latestIncidentContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    historicalIncidentContainer: {
        marginTop: 1,
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    incidentCard: {
        padding: 16,
    },
    historicalCard: {
        backgroundColor: '#fafafa',
        borderLeftWidth: 4,
        borderLeftColor: '#e0e0e0',
    },
    header: {
        marginBottom: 12,
    },
    headerMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    incidentNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
        flex: 1,
    },
    statusContainer: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        minWidth: 80,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusNew: {
        backgroundColor: '#e3f2fd',
    },
    statusUpdated: {
        backgroundColor: '#fff3e0',
    },
    statusClosed: {
        backgroundColor: '#f5f5f5',
    },
    date: {
        fontSize: 12,
        color: '#999999',
    },
    heading: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
    },
    detail: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 12,
        lineHeight: 20,
    },
    location: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
    },
    district: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
    },
    direction: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
    },
    landmark: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    content: {
        fontSize: 14,
        color: '#333333',
        marginTop: 8,
        lineHeight: 20,
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    updateCount: {
        fontSize: 14,
        color: '#666666',
        marginLeft: 4,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    loadingText: {
        marginTop: 12,
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
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#ffffff',
        fontWeight: '500',
        fontSize: 14,
    },
    emptyListContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default TrafficInformation;