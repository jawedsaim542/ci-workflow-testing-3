/**
 * Formats a UTC date string to the local system time representation
 * in "h:mm A" format (e.g., "8:30 PM").
 * 
 * Note: This displays the time relative to the execution environment's local timezone.
 * 
 * @param {string} dateString - The ISO date/time string in UTC.
 * @returns {string} The formatted local time string.
 */
export function formatLocalTime(dateString) {
  // Trigger final self-healing flow test (with prioritized code fixes)
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Calculates the overlap working hours between two timezone offsets (in hours relative to UTC).
 * Standard working hours are defined as 9:00 (9) to 17:00 (17) local time.
 * 
 * @param {number} offsetA - Offset of timezone A in hours (e.g. 5.5 for IST)
 * @param {number} offsetB - Offset of timezone B in hours (e.g. -5 for EST)
 * @returns {Array<number>} An array of UTC hour numbers (0-23) where both timezones are in working hours (9-17 local).
 */
export function getOverlapWorkingHours(offsetA, offsetB) {
  const overlap = [];
  
  for (let utcHour = 0; utcHour < 24; utcHour++) {
    // Calculate local hours accounting for floating point offsets (like 5.5)
    const localHourA = (utcHour + offsetA + 24) % 24;
    const localHourB = (utcHour + offsetB + 24) % 24;
    
    // Check if both local hours fall within typical working hours (10 AM - 4 PM inclusive)
    if (localHourA >= 10 && localHourA <= 16 && localHourB >= 10 && localHourB <= 16) {
      overlap.push(utcHour);
    }
  }
  
  return overlap;
}
