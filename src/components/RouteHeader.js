// RouteHeader.js
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/styles';
import { useLanguage } from './Header';

export default function RouteHeader({ 
    routeInfo,
    routeDetails,
    routeDirection, 
    onToggle,
    isCircular,
    disabled 
}) {
    const { getLocalizedText } = useLanguage();
    const currentRouteInfo = routeDetails[routeDirection];

    // Special handling for circular routes
    const renderRouteDescription = () => {
        if (isCircular) {
            return (
                <View style={styles.routeDirectionContainer}>
                    <Text style={styles.routeTerminal}>
                        {getLocalizedText({
                            en: currentRouteInfo?.orig_en,
                            tc: currentRouteInfo?.orig_tc,
                            sc: currentRouteInfo?.orig_sc
                        })}
                    </Text>
                    <MaterialIcons 
                        name="loop" 
                        size={20} 
                        color="#666666" 
                        style={styles.directionArrow}
                    />
                    <Text style={styles.routeTerminal}>
                        CIRCULAR
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.routeDirectionContainer}>
                <Text style={styles.routeTerminal}>
                    {getLocalizedText({
                        en: currentRouteInfo?.orig_en,
                        tc: currentRouteInfo?.orig_tc,
                        sc: currentRouteInfo?.orig_sc
                    })}
                </Text>
                <MaterialIcons 
                    name="arrow-forward" 
                    size={20} 
                    color="#666666" 
                    style={styles.directionArrow}
                />
                <Text style={styles.routeTerminal}>
                    {getLocalizedText({
                        en: currentRouteInfo?.dest_en,
                        tc: currentRouteInfo?.dest_tc,
                        sc: currentRouteInfo?.dest_sc
                    })}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.routeHeader}>
            <View style={styles.routeContent}>
                <Text style={styles.routeNumber}>{routeInfo.route}</Text>
                {renderRouteDescription()}
                {!isCircular && (
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
                )}
            </View>
        </View>
    );
}