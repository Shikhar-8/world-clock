import { getUtcOffset } from './time.ts';

/**
 * Searches the provided city database for a matching query string.
 * Matches against city name, country name, province name, or UTC offset.
 * Returns the top 5 unique results, sorted by descending population.
 * 
 * @param query The user's search string
 * @param cityTimezones The fully loaded city-timezones module data
 * @returns An array of up to 5 matching city objects
 */
export function searchCities(query: string, cityTimezones: any): any[] {
  if (!cityTimezones || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  const allCities = cityTimezones.cityMapping;
  const isOffsetSearch = lowerQuery.startsWith('utc') || lowerQuery.startsWith('gmt') || lowerQuery.startsWith('+') || lowerQuery.startsWith('-');
  
  let normalizedQuery = lowerQuery.replace('gmt', 'utc');
  if (normalizedQuery.startsWith('+') || normalizedQuery.startsWith('-')) {
    normalizedQuery = 'utc' + normalizedQuery; // fallback to match utc+9
  }
  
  const results = allCities.filter((city: any) => {
    if (city.city?.toLowerCase().includes(lowerQuery)) return true;
    if (city.country?.toLowerCase().includes(lowerQuery)) return true;
    if (city.province?.toLowerCase().includes(lowerQuery)) return true;
    
    if (isOffsetSearch && city.timezone) {
      const offset = getUtcOffset(city.timezone);
      if (offset.includes(normalizedQuery)) return true;
    }
    return false;
  });
  
  // Sort by population (descending) to show major cities first
  results.sort((a: any, b: any) => (b.pop || 0) - (a.pop || 0));
  
  // Return top 5 unique results
  const unique = [];
  const seen = new Set();
  
  for (const city of results) {
    const key = `${city.city}, ${city.country}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(city);
    }
    if (unique.length >= 5) break;
  }
  
  return unique;
}
