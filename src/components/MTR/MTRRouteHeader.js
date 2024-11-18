// src/components/MTR/MTRRouteHeader.js
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../Header';

const MTRRouteHeader = ({
    line,
    direction,
    origin,
    destination,
    onToggle,
    disabled
}) => {
    const { getLocalizedText } = useLanguage();

    if (!origin || !destination) return null;

    return (
        <View style={styles.routeHeader}>
            <View style={styles.routeContent}>
                <View style={[styles.lineIndicator, { backgroundColor: line.color }]} />
                <View style={styles.routeDirectionContainer}>
                    <Text style={styles.routeTerminal} numberOfLines={1}>
                        {getLocalizedText({
                            en: origin.English_Name,
                            tc: origin.Chinese_Name,
                            sc: origin.Chinese_Name
                        })}
                    </Text>
                    <MaterialIcons
                        name="arrow-forward"
                        size={20}
                        color="#666666"
                        style={styles.directionArrow}
                    />
                    <Text style={styles.routeTerminal} numberOfLines={1}>
                        {getLocalizedText({
                            en: destination.English_Name,
                            tc: destination.Chinese_Name,
                            sc: destination.Chinese_Name
                        })}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.toggleIcon,
                        disabled && styles.toggleIconDisabled
                    ]}
                    onPress={onToggle}
                    disabled={disabled}
                >
                    <MaterialIcons
                        name="swap-horiz"
                        size={24}
                        color="#0066cc"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    routeHeader: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    routeContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lineIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 12,
    },
    routeDirectionContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    routeTerminal: {
        fontSize: 14,
        color: '#333333',
        flex: 1,
    },
    directionArrow: {
        marginHorizontal: 8,
    },
    toggleIcon: {
        backgroundColor: '#f0f7ff',
        padding: 8,
        borderRadius: 8,
        marginLeft: 8,
    },
    toggleIconDisabled: {
        opacity: 0.5,
    }
});

export default MTRRouteHeader;