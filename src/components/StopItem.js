import { MaterialIcons } from '@expo/vector-icons';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useEtaUpdates } from '../hooks/useEtaUpdates';
import useLocation from '../hooks/useLocation';
import { ETAHeartbeat } from '../styles/ETAHeartbeat';
import { calculateDistance, formatDistance } from '../utils/distance';
import { formatEta, getEtaColor } from '../utils/etaFormatting';
import { useLanguage } from './Header';
import StopRoutes from './StopRoutes';
import StreetViewButton from './StreetViewButton';

const StopItem = ({ item, isSelected, onPress, showModal, hideModal, onRoutePress = () => { } }) => {
    const { getLocalizedText } = useLanguage();
    const { etaData, isUpdating } = useEtaUpdates('route', item.route, item.stop);
    const { width: screenWidth } = useWindowDimensions();
    const [showMap, setShowMap] = useState(false);
    const [stopDetails, setStopDetails] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [distanceToStop, setDistanceToStop] = useState(null);
    const mapRef = useRef(null);
    const { location } = useLocation();

    const stopLocation = useMemo(() => {
        if (!stopDetails?.lat || !stopDetails?.long) return null;
        return {
            latitude: parseFloat(stopDetails.lat),
            longitude: parseFloat(stopDetails.long),
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
        };
    }, [stopDetails]);

    // Calculate distance when location or stop details change
    useEffect(() => {
        if (location?.coords && stopDetails?.lat && stopDetails?.long) {
            const distance = calculateDistance(
                location.coords.latitude,
                location.coords.longitude,
                parseFloat(stopDetails.lat),
                parseFloat(stopDetails.long)
            );
            // Convert to meters and only set if less than 200m
            const distanceInMeters = distance * 1000;
            setDistanceToStop(distanceInMeters <= 200 ? distanceInMeters : null);
        }
    }, [location, stopDetails]);

    const fetchStopDetails = useCallback(async () => {
        if (!item.stop) return;

        setIsLoadingLocation(true);
        try {
            const response = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop/${item.stop}`);
            if (!response.ok) throw new Error('Failed to fetch stop details');
            const data = await response.json();
            if (data.data) {
                setStopDetails(data.data);
            }
        } catch (error) {
            console.error('Error fetching stop details:', error);
        } finally {
            setIsLoadingLocation(false);
        }
    }, [item.stop]);

    useEffect(() => {
        // Always fetch stop details for distance calculation
        if (!stopDetails && !isLoadingLocation) {
            fetchStopDetails();
        }
    }, [stopDetails, isLoadingLocation, fetchStopDetails]);

    useEffect(() => {
        if (!isSelected) {
            setShowMap(false);
        }
    }, [isSelected]);

    const handleMapPress = useCallback(() => {
        setShowMap(prev => !prev);
    }, []);

    const handleShowRoutes = () => {
        showModal(
            <StopRoutes
                stopId={item.stop}
                stopName={getLocalizedText({
                    en: item.name_en,
                    tc: item.name_tc,
                    sc: item.name_sc
                })}
                onBack={hideModal}
                onRoutePress={(route) => {
                    hideModal();
                    onRoutePress(route, item);
                }}
            />
        );
    };

    const renderEtaList = useCallback(() => {
        if (!item.eta || item.eta.length === 0) {
            return <Text style={styles.noEta}>No upcoming buses</Text>;
        }

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

    const renderMap = () => {
        if (!stopLocation) return null;

        return (
            <View style={styles.mapWrapper}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={stopLocation}
                >
                    <Marker
                        coordinate={{
                            latitude: stopLocation.latitude,
                            longitude: stopLocation.longitude
                        }}
                        title={getLocalizedText({
                            en: item.name_en,
                            tc: item.name_tc,
                            sc: item.name_sc
                        })}
                    >
                        <View style={styles.markerContainer}>
                            <MaterialIcons name="directions-bus" size={24} color="#0066cc" />
                        </View>
                    </Marker>
                </MapView>
                <StreetViewButton
                    latitude={stopLocation.latitude}
                    longitude={stopLocation.longitude}
                    style={styles.streetViewButton}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={[
                styles.stopItem,
                isSelected && styles.selectedStopItem,
                distanceToStop !== null && styles.nearbyStopItem
            ]}>
                <TouchableOpacity
                    onPress={() => onPress(item.stop)}
                    activeOpacity={0.7}
                >
                    <View style={styles.contentWrapper}>
                        <View style={styles.mainContent}>
                            <View style={styles.stopHeader}>
                                <View style={styles.stopInfo}>
                                    <View style={styles.stopSequenceContainer}>
                                        <Text style={styles.stopSequence}>Stop {item.seq}</Text>
                                        {distanceToStop !== null && (
                                            <View style={styles.distanceBadge}>
                                                <Text style={styles.distanceText}>
                                                    {Math.round(distanceToStop)}m
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.stopName} numberOfLines={2}>
                                        {getLocalizedText({
                                            en: item.name_en,
                                            tc: item.name_tc,
                                            sc: item.name_sc
                                        })}
                                    </Text>
                                </View>
                                {!isSelected && (
                                    <Text style={styles.destination} numberOfLines={2}>
                                        {getLocalizedText({
                                            en: item.dest_en,
                                            tc: item.dest_tc,
                                            sc: item.dest_sc
                                        })}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.etaContainer}>
                                {renderEtaList()}
                            </View>
                        </View>

                        {isSelected && (
                            <View style={styles.actionsContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        showMap && styles.actionButtonActive
                                    ]}
                                    onPress={handleMapPress}
                                >
                                    <MaterialIcons
                                        name={isLoadingLocation ? "hourglass-empty" : "map"}
                                        size={20}
                                        color="#0066cc"
                                    />
                                    <Text style={styles.actionButtonText}>
                                        {isLoadingLocation ? 'Loading' : 'Map'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={handleShowRoutes}
                                >
                                    <MaterialIcons name="list" size={20} color="#0066cc" />
                                    <Text style={styles.actionButtonText}>Routes</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                {showMap && (
                    <View style={styles.mapDivider} />
                )}

                {showMap && (
                    isLoadingLocation ? (
                        <View style={[styles.mapWrapper, styles.loadingContainer]}>
                            <MaterialIcons name="hourglass-empty" size={24} color="#0066cc" />
                            <Text style={styles.loadingText}>Loading map...</Text>
                        </View>
                    ) : (
                        renderMap()
                    )
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    stopItem: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedStopItem: {
        backgroundColor: '#f0f7ff',
        borderColor: '#0066cc',
    },
    nearbyStopItem: {
        backgroundColor: '#f0fdf4',
        borderColor: '#22c55e',
        borderWidth: 2,
    },
    contentWrapper: {
        flexDirection: 'row',
        padding: 16,
    },
    mapDivider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 16,
    },
    mainContent: {
        flex: 1,
        paddingRight: 8,
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
    stopSequenceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    stopSequence: {
        fontSize: 12,
        color: '#666666',
    },
    distanceBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#22c55e',
    },
    distanceText: {
        color: '#16a34a',
        fontSize: 12,
        fontWeight: '500',
    },
    stopName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
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
    actionsContainer: {
        width: 70,
        borderLeftWidth: 1,
        borderLeftColor: '#e0e0e0',
        paddingLeft: 8,
        gap: 8,
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f0f7ff',
    },
    actionButtonActive: {
        backgroundColor: '#e0e9f7',
    },
    actionButtonText: {
        fontSize: 12,
        color: '#0066cc',
        marginTop: 4,
    },
    mapWrapper: {
        height: 200,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 4,
        borderWidth: 2,
        borderColor: '#0066cc',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    streetViewButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f7ff',
        height: 200,
    },
    loadingText: {
        marginTop: 8,
        color: '#0066cc',
        fontSize: 14,
    }
});

export default memo(StopItem, (prevProps, nextProps) => {
    return prevProps.isSelected === nextProps.isSelected &&
        prevProps.item.eta === nextProps.item.eta &&
        prevProps.location === nextProps.location;
});