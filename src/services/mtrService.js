import Papa from 'papaparse';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MTR_API_BASE = 'https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php';
const CSV_ENDPOINTS = {
    LINES_STATIONS: 'https://opendata.mtr.com.hk/data/mtr_lines_and_stations.csv',
    AIRPORT_FARES: 'https://opendata.mtr.com.hk/data/airport_express_fares.csv',
    LINES_FARES: 'https://opendata.mtr.com.hk/data/mtr_lines_fares.csv'
};

const CACHE_KEYS = {
    LINES_STATIONS: '@mtr_lines_stations',
    AIRPORT_FARES: '@mtr_airport_fares',
    LINES_FARES: '@mtr_lines_fares',
    LAST_UPDATE: '@mtr_last_update'
};

// Line configurations with their colors and codes
export const MTR_LINES = {
    AEL: {
        code: 'AEL',
        color: '#00888A',
        name_en: 'Airport Express',
        name_tc: '機場快綫',
        name_sc: '机场快线'
    },
    EAL: {
        code: 'EAL',
        color: '#F173AC',
        name_en: 'East Rail Line',
        name_tc: '東鐵綫',
        name_sc: '东铁线'
    },
    ISL: {
        code: 'ISL',
        color: '#53B7E8',
        name_en: 'Island Line',
        name_tc: '港島綫',
        name_sc: '港岛线'
    },
    KTL: {
        code: 'KTL',
        color: '#007DC5',
        name_en: 'Kwun Tong Line',
        name_tc: '觀塘綫',
        name_sc: '观塘线'
    },
    SIL: {
        code: 'SIL',
        color: '#00AB4E',
        name_en: 'South Island Line',
        name_tc: '南港島綫',
        name_sc: '南港岛线'
    },
    TKL: {
        code: 'TKL',
        color: '#BAC429',
        name_en: 'Tseung Kwan O Line',
        name_tc: '將軍澳綫',
        name_sc: '将军澳线'
    },
    TWL: {
        code: 'TWL',
        color: '#7D499D',
        name_en: 'Tsuen Wan Line',
        name_tc: '荃灣綫',
        name_sc: '荃湾线'
    },
    TML: {
        code: 'TML',
        color: '#ED1D24',
        name_en: 'Tuen Ma Line',
        name_tc: '屯馬綫',
        name_sc: '屯马线'
    },
    TCL: {
        code: 'TCL',
        color: '#923011',
        name_en: 'Tung Chung Line',
        name_tc: '東涌綫',
        name_sc: '东涌线'
    }
};

class MTRService {
    constructor() {
        this.initialized = false;
        this.linesAndStations = null;
        this.airportFares = null;
        this.linesFares = null;
    }

    async initialize() {
        if (this.initialized) return;

        // Try to load cached data first
        await this.loadCachedData();

        // Check if we need to update from remote
        const lastUpdate = await AsyncStorage.getItem(CACHE_KEYS.LAST_UPDATE);
        const shouldUpdate = !lastUpdate ||
            (Date.now() - parseInt(lastUpdate)) > (30 * 24 * 60 * 60 * 1000); // 30 days

        if (shouldUpdate) {
            await this.updateFromRemote();
        }

        this.initialized = true;
    }

    async loadCachedData() {
        try {
            const [linesStations, airportFares, linesFares] = await Promise.all([
                AsyncStorage.getItem(CACHE_KEYS.LINES_STATIONS),
                AsyncStorage.getItem(CACHE_KEYS.AIRPORT_FARES),
                AsyncStorage.getItem(CACHE_KEYS.LINES_FARES)
            ]);

            if (linesStations) this.linesAndStations = JSON.parse(linesStations);
            if (airportFares) this.airportFares = JSON.parse(airportFares);
            if (linesFares) this.linesFares = JSON.parse(linesFares);
        } catch (error) {
            console.error('Error loading cached MTR data:', error);
        }
    }

    async updateFromRemote() {
        try {
            const [linesStations, airportFares, linesFares] = await Promise.all([
                this.fetchCSV(CSV_ENDPOINTS.LINES_STATIONS),
                this.fetchCSV(CSV_ENDPOINTS.AIRPORT_FARES),
                this.fetchCSV(CSV_ENDPOINTS.LINES_FARES)
            ]);

            this.linesAndStations = linesStations;
            this.airportFares = airportFares;
            this.linesFares = linesFares;

            // Cache the new data
            await Promise.all([
                AsyncStorage.setItem(CACHE_KEYS.LINES_STATIONS, JSON.stringify(linesStations)),
                AsyncStorage.setItem(CACHE_KEYS.AIRPORT_FARES, JSON.stringify(airportFares)),
                AsyncStorage.setItem(CACHE_KEYS.LINES_FARES, JSON.stringify(linesFares)),
                AsyncStorage.setItem(CACHE_KEYS.LAST_UPDATE, Date.now().toString())
            ]);
        } catch (error) {
            console.error('Error updating MTR data from remote:', error);
            throw error;
        }
    }

    async fetchCSV(url) {
        try {
            const response = await fetch(url);
            const text = await response.text();
            return new Promise((resolve, reject) => {
                Papa.parse(text, {
                    header: true,
                    complete: (results) => resolve(results.data),
                    error: (error) => reject(error)
                });
            });
        } catch (error) {
            console.error(`Error fetching CSV from ${url}:`, error);
            throw error;
        }
    }

    async getNextTrains(line, station) {
        try {
            const response = await fetch(
                `${MTR_API_BASE}?line=${line}&sta=${station}`
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching next trains:', error);
            throw error;
        }
    }

    getLineStations(lineCode) {
        if (!this.linesAndStations) return [];
        return this.linesAndStations.filter(
            station => station.Line_Code === lineCode
        ).sort((a, b) => a.Sequence - b.Sequence);
    }

    getLineFares(fromStation, toStation) {
        // Implementation depends on whether it's airport express or other lines
        // Will implement based on your needs
    }

    getLineInfo(lineCode) {
        return MTR_LINES[lineCode] || null;
    }

    getAllLines() {
        return Object.values(MTR_LINES);
    }
}

export default new MTRService();