// components/StreetViewButton.js
import { MaterialIcons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity } from 'react-native';

const StreetViewButton = ({ 
    latitude, 
    longitude, 
    style,
    buttonText = 'Street View',
    iconSize = 20,
    iconColor = '#FFFFFF',
    onPress: customOnPress,
    disabled = false,
}) => {
    // Memoize the URL construction to prevent unnecessary recalculations
    const streetViewUrl = useMemo(() => {
        if (!latitude || !longitude) return null;
        return `https://google.com/maps/@${latitude},${longitude},3a,75y,90h,90t/data=!3m6!1e1!3m4!1s!2e0!7i16384!8i8192`;
    }, [latitude, longitude]);

    const handlePress = async () => {
        if (customOnPress) {
            customOnPress(streetViewUrl);
            return;
        }

        if (!streetViewUrl) {
            Alert.alert('Error', 'Invalid location coordinates');
            return;
        }

        try {
            const canOpen = await Linking.canOpenURL(streetViewUrl);
            if (!canOpen) {
                throw new Error('Cannot open URL');
            }
            await Linking.openURL(streetViewUrl);
        } catch (err) {
            console.error('Error opening Street View:', err);
            Alert.alert(
                'Error',
                'Unable to open Google Street View. Please make sure you have Google Maps installed.',
                [{ text: 'OK' }]
            );
        }
    };

    // Don't render if coordinates are invalid
    if (!latitude || !longitude) {
        return null;
    }

    return (
        <TouchableOpacity
            style={[styles.button, style, disabled && styles.buttonDisabled]}
            onPress={handlePress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <MaterialIcons 
                name="streetview" 
                size={iconSize} 
                color={iconColor} 
            />
            <Text style={[styles.text, { color: iconColor }]}>
                {buttonText}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0066cc',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    text: {
        marginLeft: 6,
        fontWeight: '500',
        fontSize: 14,
    },
});

StreetViewButton.propTypes = {
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    style: PropTypes.object,
    buttonText: PropTypes.string,
    iconSize: PropTypes.number,
    iconColor: PropTypes.string,
    onPress: PropTypes.func,
    disabled: PropTypes.bool,
};

export default StreetViewButton;