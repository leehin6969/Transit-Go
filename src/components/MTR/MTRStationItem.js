import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../Header';
import { ETAHeartbeat } from '../../styles/ETAHeartbeat';

const MTRStationItem = ({
    station,
    lineColor,
    arrivals = [],
    isSelected,
    onPress,
    direction
}) => {
    const { getLocalizedText } = useLanguage();

    const renderArrival = (arrival) => {
        if (!arrival || !arrival.time) {
            return null;
        }

        const mins = Math.floor((new Date(arrival.time) - new Date()) / 60000);

        // Don't show if train has departed
        if (mins < -1) return null;

        return (
            <ETAHeartbeat key={arrival.seq} isUpdating={false}>
                <View style={styles.arrivalInfo}>
                    <Text style={styles.platformText}>
                        Platform {arrival.plat}
                    </Text>
                    <Text style={styles.timeText}>
                        {mins <= 0 ? 'Arriving' : `${mins} mins`}
                    </Text>
                    {arrival.dest && (
                        <Text style={styles.destinationText}>
                            → {getLocalizedText({
                                en: arrival.dest,
                                tc: arrival.dest_tc || arrival.dest,
                                sc: arrival.dest_tc || arrival.dest // Using tc for sc as requested
                            })}
                        </Text>
                    )}
                </View>
            </ETAHeartbeat>
        );
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                isSelected && styles.selectedContainer,
                { borderLeftColor: lineColor }
            ]}
            onPress={() => onPress(station.Station_Code)}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.stationInfo}>
                    <Text style={styles.stationName}>
                        {getLocalizedText({
                            en: station.English_Name,
                            tc: station.Chinese_Name,
                            sc: station.Chinese_Name // Using tc for sc as requested
                        })}
                    </Text>
                </View>
            </View>

            <View style={styles.arrivalsContainer}>
                {arrivals.length > 0 ? (
                    arrivals.map(renderArrival)
                ) : (
                    <Text style={styles.noTrainsText}>
                        No upcoming trains
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    selectedContainer: {
        backgroundColor: '#f0f7ff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    stationInfo: {
        flex: 1,
    },
    stationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
    },
    arrivalsContainer: {
        gap: 8,
    },
    arrivalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#f8f9fa',
        padding: 8,
        borderRadius: 8,
    },
    platformText: {
        fontSize: 14,
        color: '#666666',
        minWidth: 80,
    },
    timeText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0066cc',
        minWidth: 70,
    },
    destinationText: {
        fontSize: 14,
        color: '#666666',
        flex: 1,
    },
    noTrainsText: {
        fontSize: 14,
        color: '#999999',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 8,
    },
});

export default memo(MTRStationItem);