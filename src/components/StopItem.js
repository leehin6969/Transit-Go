import { MaterialIcons } from '@expo/vector-icons';
import React, { memo, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useEtaUpdates } from '../hooks/useEtaUpdates';
import { ETAHeartbeat } from '../styles/ETAHeartbeat';
import { formatEta, getEtaColor } from '../utils/etaFormatting';
import { useLanguage } from './Header';

const StopItem = ({ item, isSelected, onLayout, onPress }) => {
    const { getLocalizedText } = useLanguage();
    const { etaData, isUpdating } = useEtaUpdates('route', item.route, item.stop);
    const { width: screenWidth } = useWindowDimensions();

    // Dynamic styles based on screen width
    const dynamicStyles = StyleSheet.create({
        stopItem: {
            paddingHorizontal: screenWidth * 0.04,
            paddingVertical: screenWidth * 0.03,
        },
        etaContainer: {
            maxWidth: screenWidth * 0.9,
        }
    });

    const renderEtaList = useCallback(() => {
        if (!item.eta || item.eta.length === 0) {
            return <Text style={styles.noEta}>No upcoming buses</Text>;
        }

        // Process and filter ETAs
        const validEtas = item.eta
            .map(eta => ({
                ...eta,
                formattedEta: formatEta(eta.eta)
            }))
            .filter(eta => {
                if (!eta.formattedEta) return false;
                if (eta.formattedEta.minutes < 0) {
                    const departedSeconds = Math.abs(eta.formattedEta.minutes * 60);
                    return departedSeconds <= 30;
                }
                return true;
            })
            .sort((a, b) => {
                if (!a.formattedEta || !b.formattedEta) return 0;
                return a.formattedEta.minutes - b.formattedEta.minutes;
            })
            .slice(0, 3);

        if (validEtas.length === 0) {
            return <Text style={styles.noEta}>No upcoming buses</Text>;
        }

        return validEtas.map((eta, index) => {
            const { formattedEta } = eta;
            const showDeparted = formattedEta.minutes < 0;

            return (
                <ETAHeartbeat 
                    key={`${item.stop}-${index}-${eta.eta}`} 
                    isUpdating={isUpdating}
                >
                    <View style={styles.etaItem}>
                        <Text style={[
                            styles.etaTime,
                            { color: getEtaColor(formattedEta.minutes) }
                        ]}>
                            {formattedEta.text}
                        </Text>
                        {(eta.rmk_en || showDeparted) && (
                            <Text style={[
                                styles.etaRemark,
                                showDeparted && styles.etaRemarkDeparted
                            ]}>
                                {showDeparted ? 'Departed' : getLocalizedText({
                                    en: eta.rmk_en,
                                    tc: eta.rmk_tc,
                                    sc: eta.rmk_sc
                                })}
                            </Text>
                        )}
                    </View>
                </ETAHeartbeat>
            );
        });
    }, [item.eta, isUpdating, getLocalizedText]);

    return (
        <TouchableOpacity
            style={[
                styles.stopItem,
                dynamicStyles.stopItem,
                isSelected && styles.selectedStopItem
            ]}
            onLayout={onLayout}
            onPress={() => onPress(item.stop)}
            activeOpacity={0.7}
        >
            <View style={styles.stopHeader}>
                <View style={styles.stopInfo}>
                    <Text style={styles.stopName} numberOfLines={2}>
                        {getLocalizedText({
                            en: item.name_en,
                            tc: item.name_tc,
                            sc: item.name_sc
                        })}
                    </Text>
                    <Text style={styles.stopSequence}>Stop {item.seq}</Text>
                </View>
                <Text style={styles.destination} numberOfLines={2}>
                    {getLocalizedText({
                        en: item.dest_en,
                        tc: item.dest_tc,
                        sc: item.dest_sc
                    })}
                </Text>
            </View>
            
            <View style={styles.etaContainer}>
                {renderEtaList()}
            </View>

            {isSelected && (
                <View style={styles.expandedContent}>
                    <View style={styles.expandedHeader}>
                        <MaterialIcons name="location-on" size={16} color="#0066cc" />
                        <Text style={styles.expandedTitle}>Stop Information</Text>
                    </View>
                    <Text style={styles.expandedText}>
                        Stop ID: {item.stop}
                    </Text>
                    {/* You can add more details here as needed */}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    stopItem: {
        borderRadius: 8,
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: 'transparent'
    },
    selectedStopItem: {
        backgroundColor: '#f0f7ff',
        borderColor: '#0066cc',
    },
    stopHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    stopInfo: {
        flex: 1,
        marginRight: 8,
    },
    stopName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    stopSequence: {
        fontSize: 12,
        color: '#666666',
    },
    destination: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'right',
        flex: 0.4,
    },
    etaContainer: {
        gap: 4,
    },
    etaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 2,
    },
    etaTime: {
        fontSize: 14,
        fontWeight: '500',
    },
    etaRemark: {
        fontSize: 12,
        color: '#666666',
        fontStyle: 'italic',
    },
    etaRemarkDeparted: {
        color: '#999999',
    },
    noEta: {
        color: '#999999',
        fontStyle: 'italic',
        fontSize: 14,
    },
    expandedContent: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    expandedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 4,
    },
    expandedTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0066cc',
    },
    expandedText: {
        fontSize: 14,
        color: '#666666',
        marginLeft: 20,
    }
});

export default memo(StopItem, (prevProps, nextProps) => {
    return prevProps.isSelected === nextProps.isSelected &&
           prevProps.item.eta === nextProps.item.eta;
});