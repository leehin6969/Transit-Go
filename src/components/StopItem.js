import { MaterialIcons } from '@expo/vector-icons';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions, Animated } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useEtaUpdates } from '../hooks/useEtaUpdates';
import useLocation from '../hooks/useLocation';
import { ETAHeartbeat } from '../styles/ETAHeartbeat';
import { calculateDistance } from '../utils/distance';
import { formatEta, getEtaColor } from '../utils/etaFormatting';
import { useLanguage } from './Header';
import StopRoutes from './StopRoutes';
import StreetViewButton from './StreetViewButton';

const StopItem = ({
    item,
    isSelected,
    onPress,
    showModal,
    hideModal,
    onRoutePress = () => { },
    isAffected = false,
    affectedReason = null
}) => {
    const { getLocalizedText, language } = useLanguage();
    const { etaData, isUpdating } = useEtaUpdates('route', item.route, item.stop);
    const { width: screenWidth } = useWindowDimensions();
    const [showMap, setShowMap] = useState(false);
    const [stopDetails, setStopDetails] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [distanceToStop, setDistanceToStop] = useState(null);
    const mapRef = useRef(null);
    const { location } = useLocation();
    const [mapHeight] = useState(new Animated.Value(0));

    const stopLocation = useMemo(() => {
        if (!stopDetails?.lat || !stopDetails?.long) return null;
        return {
            latitude: parseFloat(stopDetails.lat),
            longitude: parseFloat(stopDetails.long),
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
        };
    }, [stopDetails]);

    useEffect(() => {
        if (location?.coords && stopDetails?.lat && stopDetails?.long) {
            const distance = calculateDistance(
                location.coords.latitude,
                location.coords.longitude,
                parseFloat(stopDetails.lat),
                parseFloat(stopDetails.long)
            );
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
        if (!stopDetails && !isLoadingLocation) {
            fetchStopDetails();
        }
    }, [stopDetails, isLoadingLocation, fetchStopDetails]);

    useEffect(() => {
        if (!isSelected) {
            setShowMap(false);
            Animated.timing(mapHeight, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false
            }).start();
        }
    }, [isSelected]);

    const handleMapPress = () => {
        setShowMap(!showMap);
        Animated.timing(mapHeight, {
            toValue: showMap ? 0 : 200,
            duration: 300,
            useNativeDriver: false
        }).start();
    };

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
    }, [item.eta, isUpdating, language]);

    const renderMap = () => {
        if (!stopLocation) return null;

        return (
            <View style={styles.mapWrapper}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={stopLocation}
                    scrollEnabled={true}
                    zoomEnabled={true}
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
                            <MaterialIcons
                                name="directions-bus"
                                size={24}
                                color={isAffected ? '#dc2626' : '#0066cc'}
                            />
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

    const renderAffectedBadge = () => {
        if (!isAffected) return null;

        return (
            <View style={styles.affectedBadge}>
                <MaterialIcons name="warning" size={16} color="#dc2626" />
                <Text style={styles.affectedText}>
                    {language === 'en' ? 'Service Affected' : '服務受阻'}
                </Text>
            </View>
        );
    };

    const containerStyle = useMemo(() => [
        styles.container,
        isAffected && styles.affectedContainer,
        isSelected && styles.selectedContainer,
    ], [isAffected, isSelected]);

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity
                style={containerStyle}
                onPress={() => onPress(item.stop)}
                activeOpacity={0.7}
            >
                <View style={styles.contentWrapper}>
                    {renderAffectedBadge()}
                    <View style={styles.mainContent}>
                        <View style={styles.stopHeader}>
                            <View style={styles.stopInfo}>
                                <View style={styles.stopSequenceContainer}>
                                    <Text style={styles.stopSequence}>
                                        Stop {item.seq}
                                    </Text>
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

                        {isAffected && affectedReason && (
                            <View style={styles.affectedReasonContainer}>
                                <Text style={styles.affectedReason}>
                                    {getLocalizedText(affectedReason)}
                                </Text>
                            </View>
                        )}

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

                <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
                    {showMap && (
                        isLoadingLocation ? (
                            <View style={styles.loadingContainer}>
                                <MaterialIcons name="hourglass-empty" size={24} color="#0066cc" />
                                <Text style={styles.loadingText}>Loading map...</Text>
                            </View>
                        ) : (
                            renderMap()
                        )
                    )}
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 8,
    },
    container: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    affectedContainer: {
        backgroundColor: '#fef2f2',
        borderColor: '#dc2626',
    },
    selectedContainer: {
        backgroundColor: '#f0f7ff',
        borderColor: '#0066cc',
    },
    contentWrapper: {
        padding: 16,
    },
    mainContent: {
        flex: 1,
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
    affectedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fee2e2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 8,
        gap: 4,
    },
    affectedText: {
        color: '#dc2626',
        fontSize: 12,
        fontWeight: '500',
    },
    affectedReasonContainer: {
        backgroundColor: '#fff1f2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    affectedReason: {
        color: '#dc2626',
        fontSize: 14,
        fontStyle: 'italic',
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
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        marginTop: 12,
        paddingTop: 12,
        gap: 8,
    },
    actionButton: {
        flex: 1,
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
    mapContainer: {
        overflow: 'hidden',
    },
    mapWrapper: {
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
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
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f7ff',
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
        prevProps.location === nextProps.location &&
        prevProps.isAffected === nextProps.isAffected &&
        prevProps.affectedReason === nextProps.affectedReason;
});