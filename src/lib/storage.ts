/**
 * Retrieves the user's theme preference from local storage.
 * @returns True if the user prefers light mode, false otherwise
 */
export function getThemePreference(): boolean {
  return localStorage.getItem('theme') === 'light';
}

/**
 * Persists the user's theme preference to local storage.
 * @param isLight True to save light mode, false for dark mode
 */
export function setThemePreference(isLight: boolean): void {
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

/**
 * Retrieves the user's time format preference (12H vs 24H).
 * @returns True if the user prefers 24-hour time, false for 12-hour
 */
export function getTimeFormatPreference(): boolean {
  return localStorage.getItem('timeFormat') === '24h';
}

/**
 * Persists the user's time format preference.
 * @param is24Hour True for 24-hour format, false for 12-hour
 */
export function setTimeFormatPreference(is24Hour: boolean): void {
  localStorage.setItem('timeFormat', is24Hour ? '24h' : '12h');
}
