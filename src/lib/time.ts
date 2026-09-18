export interface TimeData {
  hour: string;
  minute: string;
  second: string;
  dayPeriod: string;
  timeZoneName: string;
  dateStr: string;
  dayIndicator: string;
}

const offsetCache = new Map<string, string>();

/**
 * Calculates the standard UTC offset string for a given timezone (e.g., "UTC+9").
 * Caches results to optimize performance on repeated lookups.
 * FAILURE STATE: If the timezone string is invalid or Intl fails to parse it, 
 * returns an empty string ('') so the UI gracefully degrades without crashing.
 * 
 * @param timezone The IANA timezone string (e.g. "Asia/Tokyo")
 * @returns A formatted UTC offset string
 */
export function getUtcOffset(timezone: string): string {
  if (offsetCache.has(timezone)) return offsetCache.get(timezone)!;
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset'
    }).formatToParts(new Date());
    const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value || '';
    const normalized = offsetPart.replace('GMT', 'UTC').toLowerCase();
    offsetCache.set(timezone, normalized);
    return normalized;
  } catch(e) {
    return '';
  }
}

/**
 * Calculates all necessary time, date, and relative day string values for a given city.
 * @param city The selected city object containing its timezone
 * @param is24Hour True if the time should be formatted as 24-hour, false for 12-hour
 * @param now Optional date override, defaults to current time
 * @returns A TimeData object containing pre-formatted strings ready for UI injection
 */
export function getCurrentTimeForCity(city: any, is24Hour: boolean, now: Date = new Date()): TimeData {
  if (!city || !city.timezone) {
    throw new Error("Invalid city or timezone");
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: city.timezone,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: !is24Hour,
    timeZoneName: 'short'
  }).formatToParts(now);

  let hour = '', minute = '', second = '', dayPeriod = '', timeZoneName = '';
  for (const part of parts) {
    if (part.type === 'hour') hour = part.value;
    if (part.type === 'minute') minute = part.value;
    if (part.type === 'second') second = part.value;
    if (part.type === 'dayPeriod') dayPeriod = part.value;
    if (part.type === 'timeZoneName') timeZoneName = part.value;
  }

  // Date Difference Logic
  const localDateStr = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric', month: '2-digit', day: '2-digit' // uses local timezone by default
  }).format(now);
  
  const cityDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: city.timezone,
      year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(now);

  const localDate = new Date(localDateStr);
  const cityDate = new Date(cityDateStr);
  
  const diffTime = cityDate.getTime() - localDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  let dayIndicator = '';
  if (diffDays === 1) dayIndicator = '<span class="day-indicator accent"> (TOMORROW)</span>';
  else if (diffDays === -1) dayIndicator = '<span class="day-indicator accent"> (YESTERDAY)</span>';
  else if (diffDays !== 0) dayIndicator = `<span class="day-indicator accent"> (${diffDays > 0 ? '+' : ''}${diffDays} DAYS)</span>`;

  const dateStr = new Intl.DateTimeFormat('en-US', {
    timeZone: city.timezone,
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }).format(now);

  return {
    hour,
    minute,
    second,
    dayPeriod,
    timeZoneName,
    dateStr,
    dayIndicator
  };
}
