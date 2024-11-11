// components/StopItem.js
import React from 'react';
import { Text, View } from 'react-native';
import { useEtaUpdates } from '../hooks/useEtaUpdates';
import { ETAHeartbeat } from '../styles/ETAHeartbeat';
import { styles } from '../styles/styles';
import { formatEta, getEtaColor } from '../utils/etaFormatting';
import { useLanguage } from './Header';

export default function StopItem({ item, isSelected }) {
    const { getLocalizedText } = useLanguage();
    const { etaData, isUpdating } = useEtaUpdates('route', item.route, item.stop);

    const renderEtaList = () => {
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
                // Only include ETAs that are either:
                // 1. Not departed (minutes >= 0)
                // 2. Recently departed (within last 30 seconds) to show "Departed" briefly
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
            .slice(0, 3); // Keep only the next 3 upcoming buses

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
    };

    return (
        <View style={[
            styles.stopItem,
            isSelected && styles.selectedStopItem
        ]}>
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
                {renderEtaList()}
            </View>
        </View>
    );
}