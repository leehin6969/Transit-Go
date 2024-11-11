// hooks/useLocation.js
import * as Location from 'expo-location';
import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';

export default function useLocation() {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    const getCurrentLocation = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);

        try {
            // Check permissions first
            let { status } = await Location.getForegroundPermissionsAsync();

            // If not granted, request permissions
            if (status !== 'granted') {
                status = (await Location.requestForegroundPermissionsAsync()).status;
            }

            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setLoading(false);
                return null;
            }

            // Get current position
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced
            });

            setLocation(loc);
            return loc;
        } catch (error) {
            console.error('Error getting location:', error);
            setErrorMsg('Error getting location');
            Alert.alert('Error', 'Failed to retrieve location.');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial location fetch
    useEffect(() => {
        getCurrentLocation();
    }, []);

    return {
        location,
        loading,
        errorMsg,
        refreshLocation: getCurrentLocation
    };
}