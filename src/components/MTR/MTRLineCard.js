import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../Header';

const MTRLineCard = ({ line, onPress, status }) => {
    const { language, getLocalizedText } = useLanguage();

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'normal':
                return '#22c55e';
            case 'delayed':
                return '#f59e0b';
            case 'suspended':
                return '#dc2626';
            default:
                return '#22c55e';
        }
    };

    return (
        <TouchableOpacity
            style={[styles.card, { borderColor: line.color }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={[styles.lineIndicator, { backgroundColor: line.color }]} />
                    <Text style={styles.lineName}>
                        {getLocalizedText({
                            en: line.name_en,
                            tc: line.name_tc,
                            sc: line.name_tc // Using tc for sc as requested
                        })}
                    </Text>
                </View>

                <View style={styles.statusContainer}>
                    <View style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(status) }
                    ]} />
                    <Text style={styles.statusText}>
                        {status || 'Normal Service'}
                    </Text>
                    <MaterialIcons name="chevron-right" size={24} color="#666666" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    lineIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 12,
    },
    lineName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        flex: 1,
        fontSize: 14,
        color: '#666666',
    },
});

export default MTRLineCard;