export const STORAGE_KEYS = {
  THEME: 'theme',
  TIME_FORMAT: 'timeFormat',
} as const;

export const THEME_VALUES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export const FORMAT_VALUES = {
  H12: '12h',
  H24: '24h',
} as const;

export const FORMAT_LABELS = {
  H12: '12H',
  H24: '24H',
} as const;

export const CSS_CLASSES = {
  LIGHT_MODE: 'light-mode',
  HIDDEN: 'hidden',
  ACTIVE: 'active',
} as const;

export const FORMAT_LOCALES = {
  EN_US: 'en-US',
  EN_CA: 'en-CA', // Used for iso-like YYYY-MM-DD parsing
} as const;
