import { getCurrentTimeForCity } from './lib/time.ts';
import { searchCities } from './lib/cities.ts';
import { 
  getThemePreference, setThemePreference, 
  getTimeFormatPreference, setTimeFormatPreference 
} from './lib/storage.ts';
import { CSS_CLASSES, FORMAT_LABELS } from './lib/constants.ts';
import { renderClock, showClockSection } from './ui/clock.ts';
import { 
  renderSuggestions, updateActiveSuggestionUI, 
  clearSearchUI, toggleSearchDropdownUI 
} from './ui/search.ts';
import { initInteractions, initLoader, animateLogo } from './ui/interactions.ts';
import { showToast } from './ui/toast.ts';

// Element References
const inputEl = document.getElementById('city-input') as HTMLInputElement;
const suggestionsEl = document.getElementById('suggestions') as HTMLDivElement;
const clockSection = document.getElementById('clock-view') as HTMLElement;
const cityNameEl = document.getElementById('city-name') as HTMLElement;
const timeDisplayEl = document.getElementById('time-display') as HTMLElement;
const dateDisplayEl = document.getElementById('date-display') as HTMLElement;
const clearBtnEl = document.getElementById('clear-search') as HTMLButtonElement;
const searchContainer = document.querySelector('.search-container') as HTMLElement;
const ghostType = document.getElementById('ghost-type') as HTMLElement;
const loader = document.getElementById('loader') as HTMLElement;
const logo = document.querySelector('.logo') as HTMLElement;
const themeToggle = document.getElementById('theme-toggle-input') as HTMLInputElement;
const formatToggle = document.getElementById('format-toggle') as HTMLButtonElement;
const formatLabel = document.getElementById('format-label') as HTMLElement;

// Application State
let currentInterval: number | null = null;
let currentCity: any = null;
let cityTimezones: any = null;
let isModuleLoading = false;
let is24Hour = getTimeFormatPreference();
let isLightMode = getThemePreference();
let selectedSuggestionIndex = -1;
let currentSuggestions: any[] = [];

// === CORE WIRING ===

function updateClockTick() {
  if (!currentCity) return;
  try {
    const timeData = getCurrentTimeForCity(currentCity, is24Hour);
    renderClock(timeDisplayEl, dateDisplayEl, cityNameEl, timeData, currentCity);
  } catch (e) {
    console.error("Timezone error:", e);
    // CRITICAL FAILURE STATE: The clock crashed rendering. Show error toast.
    showToast("Failed to calculate time for this city.", "error");
    if (currentInterval) window.clearInterval(currentInterval);
  }
}

function selectCity(city: any) {
  currentCity = city;
  clearSearchUI(inputEl, clearBtnEl, suggestionsEl);
  inputEl.blur(); 
  
  if (currentInterval) {
    window.clearInterval(currentInterval);
  }
  
  showClockSection(clockSection);
  updateClockTick();
  currentInterval = window.setInterval(updateClockTick, 1000);
}

// === EVENT LISTENERS ===

// Lazy load the city data when the user focuses on the input
inputEl.addEventListener('focus', async () => {
  if (!cityTimezones && !isModuleLoading) {
    isModuleLoading = true;
    try {
      // Dynamic import to keep initial bundle size tiny (FCP optimization)
      const module = await import('city-timezones');
      cityTimezones = module.default || module;
    } catch (e) {
      console.error("Failed to load timezone data", e);
      // CRITICAL FAILURE STATE: Database failed to load (network error). Show error toast.
      showToast("Network error: Could not load city database.", "error");
      isModuleLoading = false;
    }
  }
});

inputEl.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement;
  const val = target.value.trim();
  
  if (val.length < 2) {
    toggleSearchDropdownUI(suggestionsEl, clearBtnEl, inputEl, val.length > 0, false);
    return;
  }
  
  const cities = searchCities(val, cityTimezones);
  currentSuggestions = cities;
  selectedSuggestionIndex = -1;
  
  toggleSearchDropdownUI(suggestionsEl, clearBtnEl, inputEl, true, true);
  
  renderSuggestions(
    suggestionsEl, 
    cities, 
    selectCity,
    (index) => {
      selectedSuggestionIndex = index;
      updateActiveSuggestionUI(suggestionsEl, inputEl, index);
    }
  );
});

inputEl.addEventListener('keydown', (e) => {
  if (suggestionsEl.classList.contains(CSS_CLASSES.HIDDEN)) return;
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (selectedSuggestionIndex < currentSuggestions.length - 1) {
      selectedSuggestionIndex++;
      updateActiveSuggestionUI(suggestionsEl, inputEl, selectedSuggestionIndex);
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (selectedSuggestionIndex > 0) {
      selectedSuggestionIndex--;
      updateActiveSuggestionUI(suggestionsEl, inputEl, selectedSuggestionIndex);
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < currentSuggestions.length) {
      selectCity(currentSuggestions[selectedSuggestionIndex]);
    } else if (currentSuggestions.length > 0) {
      selectCity(currentSuggestions[0]);
    }
  } else if (e.key === 'Escape') {
    toggleSearchDropdownUI(suggestionsEl, clearBtnEl, inputEl, inputEl.value.length > 0, false);
  }
});

clearBtnEl.addEventListener('click', () => {
  clearSearchUI(inputEl, clearBtnEl, suggestionsEl);
});

// Close suggestions on outside click or touch
const closeSuggestions = (e: Event) => {
  if (!inputEl.contains(e.target as Node) && !suggestionsEl.contains(e.target as Node)) {
    toggleSearchDropdownUI(suggestionsEl, clearBtnEl, inputEl, inputEl.value.length > 0, false);
  }
};
document.addEventListener('click', closeSuggestions);
document.addEventListener('touchstart', closeSuggestions, { passive: true });

// Initialize Theme and Format UI
if (isLightMode) {
  document.body.classList.add(CSS_CLASSES.LIGHT_MODE);
  if (themeToggle) themeToggle.checked = true;
}
if (formatLabel) {
  formatLabel.textContent = is24Hour ? FORMAT_LABELS.H24 : FORMAT_LABELS.H12;
}

themeToggle?.addEventListener('change', () => {
  isLightMode = themeToggle.checked;
  setThemePreference(isLightMode);
  document.body.classList.toggle(CSS_CLASSES.LIGHT_MODE, isLightMode);
});

formatToggle?.addEventListener('click', () => {
  is24Hour = !is24Hour;
  setTimeFormatPreference(is24Hour);
  if (formatLabel) formatLabel.textContent = is24Hour ? FORMAT_LABELS.H24 : FORMAT_LABELS.H12;
  updateClockTick();
});

// === ON LOAD ===
window.addEventListener('DOMContentLoaded', () => {
  initLoader(loader);
  animateLogo(logo);
  initInteractions(ghostType, searchContainer);
});
