// utils/etaFormatting.js

export const getEtaColor = (minutesFromNow) => {
    if (minutesFromNow === null || minutesFromNow === undefined) return '#666666'; // Gray for no ETA
    if (minutesFromNow === 0) return '#22c55e';    // Green for arriving
    if (minutesFromNow < 0) return '#999999';      // Light gray for departed
    return '#0066cc';                              // Blue for future arrivals
  };
  
  export const formatEta = (etaString) => {
    if (!etaString) return null;
    
    try {
      const etaDate = new Date(etaString);
      if (isNaN(etaDate.getTime())) return null; // Invalid date
  
      const currentDate = new Date();
      const minutesFromNow = Math.floor((etaDate - currentDate) / (1000 * 60));
      
      // Different cases for ETA display
      if (minutesFromNow < -5) {
        return null; // More than 5 minutes past
      } else if (minutesFromNow < 0) {
        return { text: 'Departed', minutes: minutesFromNow };
      } else if (minutesFromNow === 0) {
        return { text: 'Arriving', minutes: 0 };
      } else {
        return { text: `${minutesFromNow} mins`, minutes: minutesFromNow };
      }
    } catch (error) {
      console.error('Error formatting ETA:', error);
      return null;
    }
  };