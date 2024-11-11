// StopItem.js
import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../styles/styles';
import { useLanguage } from './Header';

export default function StopItem({ item }) {
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
        <View style={styles.stopItem}>
            <View style={styles.stopHeader}>
                <View style={styles.stopInfo}>
                    <Text style={styles.stopName}>
                        {getLocalizedText({
                            en: item.name_en,
                            tc: item.name_tc,
                            sc: item.name_sc
                        })}
                    </Text>
                    <Text style={styles.stopSequence}>Stop {item.seq}</Text>
                </View>
                <Text style={styles.destination}>
                    {getLocalizedText({
                        en: item.dest_en,
                        tc: item.dest_tc,
                        sc: item.dest_sc
                    })}
                </Text>
            </View>
            <View style={styles.etaContainer}>
                {item.eta && item.eta.length > 0 ? (
                    item.eta.map((eta, index) => (
                        <View key={`${item.stop}-${index}`} style={styles.etaItem}>
                            <Text style={styles.etaTime}>
                                {formatEta(eta.eta)}
                            </Text>
                            {eta.rmk_en && (
                                <Text style={styles.etaRemark}>
                                    {getLocalizedText({
                                        en: eta.rmk_en,
                                        tc: eta.rmk_tc,
                                        sc: eta.rmk_sc
                                    })}
                                </Text>
                            )}
                        </View>
                    ))
                ) : (
                    <Text style={styles.noEta}>No upcoming buses</Text>
                )}
            </View>
        </View>
    );
}