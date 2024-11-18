// src/services/mtrService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import JSON files
import localLinesAndStations from '../data/mtr/mtr_lines_and_stations.json';
import localAirportFares from '../data/mtr/airport_express_fares.json';
import localLinesFares from '../data/mtr/mtr_lines_fares.json';

const MTR_API_BASE = 'https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php';

const CACHE_KEYS = {
    LINES_STATIONS: '@mtr_lines_stations',
    AIRPORT_FARES: '@mtr_airport_fares',
    LINES_FARES: '@mtr_lines_fares',
    LAST_UPDATE: '@mtr_last_update'
};

export const MTR_LINES = {
    AEL: {
        code: 'AEL',
        color: '#00888A',
        name_en: 'Airport Express',
        name_tc: '機場快綫',
        name_sc: '机场快线'
    },
    TCL: {
        code: 'TCL',
        color: '#923011',
        name_en: 'Tung Chung Line',
        name_tc: '東涌綫',
        name_sc: '东涌线'
    },
    TML: {
        code: 'TML',
        color: '#ED1D24',
        name_en: 'Tuen Ma Line',
        name_tc: '屯馬綫',
        name_sc: '屯马线'
    },
    TKL: {
        code: 'TKL',
        color: '#BAC429',
        name_en: 'Tseung Kwan O Line',
        name_tc: '將軍澳綫',
        name_sc: '将军澳线'
    },
    EAL: {
        code: 'EAL',
        color: '#F173AC',
        name_en: 'East Rail Line',
        name_tc: '東鐵綫',
        name_sc: '东铁线'
    },
    SIL: {
        code: 'SIL',
        color: '#00AB4E',
        name_en: 'South Island Line',
        name_tc: '南港島綫',
        name_sc: '南港岛线'
    },
    TWL: {
        code: 'TWL',
        color: '#7D499D',
        name_en: 'Tsuen Wan Line',
        name_tc: '荃灣綫',
        name_sc: '荃湾线'
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

        // Load local data first
        await this.loadLocalData();

        // Try to load cached data if it's newer
        await this.loadCachedData();

        // Check if we need to update from cache
        const lastUpdate = await AsyncStorage.getItem(CACHE_KEYS.LAST_UPDATE);
        const shouldUpdate = !lastUpdate ||
            (Date.now() - parseInt(lastUpdate)) > (30 * 24 * 60 * 60 * 1000); // 30 days

        if (shouldUpdate) {
            await this.updateCache();
        }

        this.initialized = true;
    }

    async loadLocalData() {
        try {
            this.linesAndStations = localLinesAndStations.stations;
            this.airportFares = localAirportFares.fares;
            this.linesFares = localLinesFares.fares;
        } catch (error) {
            console.error('Error loading local MTR data:', error);
        }
    }

    async loadCachedData() {
        try {
            const [linesStations, airportFares, linesFares, lastUpdate] = await Promise.all([
                AsyncStorage.getItem(CACHE_KEYS.LINES_STATIONS),
                AsyncStorage.getItem(CACHE_KEYS.AIRPORT_FARES),
                AsyncStorage.getItem(CACHE_KEYS.LINES_FARES),
                AsyncStorage.getItem(CACHE_KEYS.LAST_UPDATE)
            ]);

            if (lastUpdate) {
                const parsedData = {
                    linesStations: linesStations ? JSON.parse(linesStations) : null,
                    airportFares: airportFares ? JSON.parse(airportFares) : null,
                    linesFares: linesFares ? JSON.parse(linesFares) : null
                };

                // Update with cached data if available
                if (parsedData.linesStations) this.linesAndStations = parsedData.linesStations;
                if (parsedData.airportFares) this.airportFares = parsedData.airportFares;
                if (parsedData.linesFares) this.linesFares = parsedData.linesFares;
            }
        } catch (error) {
            console.error('Error loading cached MTR data:', error);
        }
    }

    async updateCache() {
        try {
            // Save current data to cache
            await Promise.all([
                AsyncStorage.setItem(CACHE_KEYS.LINES_STATIONS, JSON.stringify(this.linesAndStations)),
                AsyncStorage.setItem(CACHE_KEYS.AIRPORT_FARES, JSON.stringify(this.airportFares)),
                AsyncStorage.setItem(CACHE_KEYS.LINES_FARES, JSON.stringify(this.linesFares)),
                AsyncStorage.setItem(CACHE_KEYS.LAST_UPDATE, Date.now().toString())
            ]);
        } catch (error) {
            console.error('Error updating MTR cache:', error);
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

        return this.linesAndStations
            .filter(station => station.Line_Code === lineCode)
            .sort((a, b) => parseInt(a.Sequence) - parseInt(b.Sequence));
    }

    getLineFares(fromStation, toStation) {
        if (!this.linesFares || !this.airportFares) return null;

        // Check if it's an Airport Express journey
        if (fromStation.startsWith('AEL') || toStation.startsWith('AEL')) {
            return this.airportFares.find(
                fare => fare.ST_FROM_ID === fromStation && fare.ST_TO_ID === toStation
            );
        }

        // Regular MTR journey
        return this.linesFares.find(
            fare => fare.SRC_STATION_ID === fromStation && fare.DEST_STATION_ID === toStation
        );
    }

    getLineInfo(lineCode) {
        return MTR_LINES[lineCode] || null;
    }

    getAllLines() {
        return Object.values(MTR_LINES);
    }

    determineLineStatus(response) {
        if (!response) return 'unknown';
        if (response.status === 0) return 'suspended';
        if (response.isdelay === 'Y') return 'delayed';
        return 'normal';
    }

    async getLineStatus(lineCode) {
        try {
            const stations = this.getLineStations(lineCode);
            if (!stations.length) return 'unknown';

            const firstStation = stations[0];
            const response = await this.getNextTrains(lineCode, firstStation.Station_Code);
            return this.determineLineStatus(response);
        } catch (error) {
            console.error(`Error getting line status for ${lineCode}:`, error);
            return 'unknown';
        }
    }

    async getAllLineStatuses() {
        const statuses = {};
        const lines = this.getAllLines();

        await Promise.all(
            lines.map(async (line) => {
                statuses[line.code] = await this.getLineStatus(line.code);
            })
        );

        return statuses;
    }

    formatFare(fare) {
        if (!fare) return null;
        return {
            adult: parseFloat(fare.OCT_ADT_FARE || fare.SINGLE_ADT_FARE),
            child: parseFloat(fare.OCT_CHD_FARE || fare.OCT_CON_CHILD_FARE),
            elderly: parseFloat(fare.OCT_CON_ELDERLY_FARE),
            student: parseFloat(fare.OCT_STD_FARE),
        };
    }

    getStationInfo(stationId) {
        return this.linesAndStations?.find(station => station.Station_Id === stationId) || null;
    }
}

export default new MTRService();