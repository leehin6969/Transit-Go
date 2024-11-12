// utils/routeServiceCheck.js
const BASE_URL = 'https://data.etabus.gov.hk/v1/transport/kmb';

/**
 * Checks if a route has bi-directional service by checking both directions
 * @param {string} routeNumber The route number to check
 * @returns {Promise<boolean>} True if the route has service in both directions
 */
const checkBiDirectionalService = async (routeNumber) => {
  try {
    // Try to fetch both directions
    const [outboundResponse, inboundResponse] = await Promise.all([
      fetch(`${BASE_URL}/route-stop/${routeNumber}/outbound/1`),
      fetch(`${BASE_URL}/route-stop/${routeNumber}/inbound/1`)
    ]);

    // Get the data from both responses
    const [outboundData, inboundData] = await Promise.all([
      outboundResponse.json(),
      inboundResponse.json()
    ]);

    // Check if both directions have stops
    const hasOutboundStops = outboundData.data && outboundData.data.length > 0;
    const hasInboundStops = inboundData.data && inboundData.data.length > 0;

    return hasOutboundStops && hasInboundStops;
  } catch (error) {
    console.error('Error checking route directions:', error);
    return false;
  }
};

/**
 * Determines if a route is circular based on its info
 * @param {Object} routeInfo The route information object
 * @returns {boolean} True if the route is circular
 */
const isCircularRoute = (routeInfo) => {
  if (!routeInfo) return false;
  return routeInfo.dest_en?.includes('CIRCULAR') ||
    routeInfo.dest_tc?.includes('循環') ||
    routeInfo.dest_sc?.includes('循环') ||
    (routeInfo.orig_en === routeInfo.dest_en &&
      routeInfo.orig_tc === routeInfo.dest_tc &&
      routeInfo.orig_sc === routeInfo.dest_sc);
};

/**
 * Gets complete route direction information
 * @param {string} routeNumber The route number to check
 * @returns {Promise<{isBidirectional: boolean, isCircular: boolean, validDirections: string[]}>}
 */
const getRouteDirectionInfo = async (routeNumber) => {
  try {
    // First get route info for both directions
    const [outboundInfo, inboundInfo] = await Promise.all([
      fetch(`${BASE_URL}/route/${routeNumber}/outbound/1`)
        .then(res => res.json()),
      fetch(`${BASE_URL}/route/${routeNumber}/inbound/1`)
        .then(res => res.json())
    ]);

    const outboundRoute = outboundInfo.data;
    const inboundRoute = inboundInfo.data;

    // First check if it's a circular route
    if (outboundRoute && isCircularRoute(outboundRoute)) {
      return {
        isBidirectional: false,
        isCircular: true,
        validDirections: ['outbound'],
        outboundInfo: outboundRoute,
        inboundInfo: null
      };
    }

    // Then check for bidirectional service
    const isBidirectional = await checkBiDirectionalService(routeNumber);

    // Determine valid directions
    const validDirections = [];
    if (outboundRoute) validDirections.push('outbound');
    if (inboundRoute && isBidirectional) validDirections.push('inbound');

    return {
      isBidirectional,
      isCircular: false,
      validDirections,
      outboundInfo: outboundRoute,
      inboundInfo: inboundRoute
    };
  } catch (error) {
    console.error('Error getting route direction info:', error);
    return {
      isBidirectional: false,
      isCircular: false,
      validDirections: ['outbound'],
      outboundInfo: null,
      inboundInfo: null
    };
  }
};

export {
    checkBiDirectionalService, getRouteDirectionInfo,
    isCircularRoute
};
