import { STORAGE_KEYS, THEME_VALUES, FORMAT_VALUES } from './constants.ts';

/**
 * Retrieves the user's theme preference from local storage.
 * @returns True if the user prefers light mode, false otherwise
 */
export function getThemePreference(): boolean {
  return localStorage.getItem(STORAGE_KEYS.THEME) === THEME_VALUES.LIGHT;
}

/**
 * Persists the user's theme preference to local storage.
 * @param isLight True to save light mode, false for dark mode
 */
export function setThemePreference(isLight: boolean): void {
  localStorage.setItem(STORAGE_KEYS.THEME, isLight ? THEME_VALUES.LIGHT : THEME_VALUES.DARK);
}

/**
 * Retrieves the user's time format preference (12H vs 24H).
 * @returns True if the user prefers 24-hour time, false for 12-hour
 */
export function getTimeFormatPreference(): boolean {
  return localStorage.getItem(STORAGE_KEYS.TIME_FORMAT) === FORMAT_VALUES.H24;
}

/**
 * Persists the user's time format preference.
 * @param is24Hour True for 24-hour format, false for 12-hour
 */
export function setTimeFormatPreference(is24Hour: boolean): void {
  localStorage.setItem(STORAGE_KEYS.TIME_FORMAT, is24Hour ? FORMAT_VALUES.H24 : FORMAT_VALUES.H12);
}
