import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export default function useLocation() {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setLoading(false);
                return;
            }

            try {
                let loc = await Location.getCurrentPositionAsync({});
                setLocation(loc);
            } catch (error) {
                setErrorMsg('Error getting location');
                console.error(error);
                Alert.alert('Error', 'Failed to retrieve location.');
            }
            setLoading(false);
        })();
    }, []);

    return { location, loading, errorMsg };
}