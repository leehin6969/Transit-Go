// hooks/useEtaUpdates.js
import { useEffect, useRef, useState } from 'react';
import { fetchNearbyStops, fetchRouteETA } from '../services/api';

const ETA_UPDATE_INTERVAL = 15000; // 15 seconds for more responsive updates

export const useEtaUpdates = (mode, routeNumber, stopId) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [etaData, setEtaData] = useState(null);
    const updateTimer = useRef(null);

    const updateEta = async () => {
        if (!routeNumber && !stopId) return;
        
        setIsUpdating(true);
        try {
            let newData;
            if (mode === 'route' && routeNumber) {
                newData = await fetchRouteETA(routeNumber, 1);
            } else if (mode === 'nearby' && stopId) {
                newData = await fetchNearbyStops(stopId);
            }
            if (newData) {
                setEtaData(newData);
            }
        } catch (error) {
            console.error('Error updating ETA:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        updateEta(); // Initial update
        
        // Set up regular updates
        updateTimer.current = setInterval(updateEta, ETA_UPDATE_INTERVAL);

        return () => {
            if (updateTimer.current) {
                clearInterval(updateTimer.current);
            }
        };
    }, [mode, routeNumber, stopId]);

    return { etaData, isUpdating };
};