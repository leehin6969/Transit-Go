import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { styles } from '../styles/styles';
import { formatDistance } from '../utils/distance';
import { useLanguage } from './Header';

export default function NearbyStopItem({ item, routes }) {
    const { getLocalizedText } = useLanguage();

    const formatEta = (etaString) => {
        if (!etaString) return 'No ETA';
        const etaDate = new Date(etaString);
        const minutesFromNow = Math.floor((etaDate - new Date()) / (1000 * 60));
        
        if (minutesFromNow < 0) return 'Departed';
        if (minutesFromNow === 0) return 'Arriving';
        return `${minutesFromNow} mins`;
    };

    return (
        <View style={styles.nearbyStopItem}>
            <View style={styles.nearbyStopHeader}>
                <Text style={styles.nearbyStopName}>
                    {getLocalizedText(item)}
                </Text>
                <Text style={styles.nearbyStopDistance}>
                    {formatDistance(item.distance)}
                </Text>
            </View>

            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.routesScroll}
            >
                {routes && routes.length > 0 ? (
                    routes.map((route, index) => (
                        <View key={`${route.route}-${index}`} style={styles.nearbyRouteItem}>
                            <Text style={styles.nearbyRouteNumber}>{route.route}</Text>
                            <Text style={styles.nearbyRouteDestination} numberOfLines={1}>
                                → {getLocalizedText({
                                    en: route.dest_en,
                                    tc: route.dest_tc,
                                    sc: route.dest_sc
                                })}
                            </Text>
                            <Text style={styles.nearbyRouteEta}>
                                {formatEta(route.eta)}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noRoutes}>No routes available</Text>
                )}
            </ScrollView>
        </View>
    );
}