// src/hooks/useMTRStatus.js
import { useState, useEffect } from 'react';
import MTRService from '../services/mtrService';

export const useMTRStatus = (lineCode, station) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        let intervalId;

        const fetchStatus = async () => {
            try {
                setLoading(true);
                const data = await MTRService.getNextTrains(lineCode, station);

                if (isMounted) {
                    setStatus(data);
                    setError(null);
                }
            } catch (error) {
                if (isMounted) {
                    setError(error.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchStatus();
        intervalId = setInterval(fetchStatus, 30000); // Refresh every 30 seconds

        return () => {
            isMounted = false;
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [lineCode, station]);

    return { status, loading, error };
};

export const useAllMTRLines = () => {
    const [lines, setLines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        let intervalId;

        const fetchLines = async () => {
            try {
                setLoading(true);
                const statuses = await MTRService.getAllLineStatuses();

                if (isMounted) {
                    const linesData = MTRService.getAllLines().map(line => ({
                        ...line,
                        status: statuses[line.code] || 'unknown'
                    }));
                    setLines(linesData);
                    setError(null);
                }
            } catch (error) {
                if (isMounted) {
                    setError(error.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchLines();
        intervalId = setInterval(fetchLines, 30000); // Refresh every 30 seconds

        return () => {
            isMounted = false;
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, []);

    const refetch = () => {
        setLoading(true);
    };

    return { lines, loading, error, refetch };
};