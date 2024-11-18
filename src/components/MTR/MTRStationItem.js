// components/MTR/MTRStationItem.js
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MTRService from '../../services/mtrService';
import { ETAHeartbeat } from '../../styles/ETAHeartbeat';
import { useLanguage } from '../Header';

const MTRStationItem = ({
    station,
    lineColor,
    arrivals = [],
    isSelected,
    onPress,
    direction,
    isEndStation = false
}) => {
    const { getLocalizedText, language } = useLanguage();

    const getStationName = (stationCode) => {
        if (!stationCode) return '';

        // Get all stations from service
        const allStations = MTRService.getAllStationsMap();
        const stationInfo = allStations[stationCode];
        
        if (stationInfo) {
            return getLocalizedText({
                en: stationInfo.English_Name,
                tc: stationInfo.Chinese_Name,
                sc: stationInfo.Chinese_Name
            });
        }

        // Fallback to code if station not found
        return stationCode;
    };

    const renderArrival = (arrival) => {
        if (!arrival || !arrival.time) return null;

        const mins = Math.floor((new Date(arrival.time) - new Date()) / 60000);
        if (mins < -1) return null;

        return (
            <ETAHeartbeat key={arrival.seq} isUpdating={false}>
                <View style={styles.arrivalInfo}>
                    <Text style={styles.platformText}>
                        {language === 'en' ? 
                            `Platform ${arrival.plat}` : 
                            `${arrival.plat}號月台`}
                    </Text>
                    <Text style={styles.timeText}>
                        {mins <= 0 ? 
                            (language === 'en' ? 'Arriving' : '即將到達') : 
                            language === 'en' ? 
                                `${mins} mins` : 
                                `${mins}分鐘`
                        }
                    </Text>
                    {arrival.dest && (
                        <Text style={styles.destinationText}>
                            → {getStationName(arrival.dest)}
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
                    <Text style={styles.sequenceNumber}>
                        {language === 'en' ? 
                            `Station ${station.Sequence}` : 
                            `第${station.Sequence}站`
                        }
                    </Text>
                    <Text style={styles.stationName}>
                        {getLocalizedText({
                            en: station.English_Name,
                            tc: station.Chinese_Name,
                            sc: station.Chinese_Name
                        })}
                    </Text>
                </View>
            </View>

            <View style={styles.arrivalsContainer}>
                {arrivals.length > 0 ? (
                    arrivals.map(renderArrival)
                ) : (
                    <View style={styles.endStationNotice}>
                        <Text style={styles.endStationText}>
                            {language === 'en' ? 
                                'End Station' : 
                                language === 'tc' ? 
                                    '終點站' : 
                                    '终点站'
                            }
                        </Text>
                    </View>
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
    sequenceNumber: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 4,
        fontWeight: '500',
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
        padding: 12,
        borderRadius: 8,
    },
    platformText: {
        fontSize: 14,
        color: '#666666',
        minWidth: 90,
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
    endStationNotice: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    endStationText: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    }
});

export default memo(MTRStationItem);