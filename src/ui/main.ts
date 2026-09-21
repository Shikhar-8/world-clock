import { getCurrentTimeForCity } from '../lib/time.ts';
import { searchCities } from '../lib/cities.ts';
import { 
  getThemePreference, setThemePreference, 
  getTimeFormatPreference, setTimeFormatPreference 
} from '../lib/storage.ts';
import { CSS_CLASSES, FORMAT_LABELS } from '../lib/constants.ts';
import { renderClock, showClockSection } from './clock.ts';
import { 
  renderSuggestions, updateActiveSuggestionUI, 
  clearSearchUI, toggleSearchDropdownUI 
} from './search.ts';
import { initInteractions, initLoader, animateLogo } from './interactions.ts';
import { showToast } from './toast.ts';

// Element References (initialized in bootstrap)
let inputEl: HTMLInputElement;
let suggestionsEl: HTMLDivElement;
let clockSection: HTMLElement;
let cityNameEl: HTMLElement;
let timeDisplayEl: HTMLElement;
let dateDisplayEl: HTMLElement;
let clearBtnEl: HTMLButtonElement;
let searchContainer: HTMLElement;
let ghostType: HTMLElement;
let loader: HTMLElement;
let logo: HTMLElement;
let themeToggle: HTMLInputElement;
let formatToggle: HTMLButtonElement;
let formatLabel: HTMLElement;

// Application State
let currentInterval: number | null = null;
let currentCity: any = null;
let cityTimezones: any = null;
let isModuleLoading = false;
let is24Hour: boolean;
let isLightMode: boolean;
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

export function bootstrap() {
  is24Hour = getTimeFormatPreference();
  isLightMode = getThemePreference();
  
  inputEl = document.getElementById('city-input') as HTMLInputElement;
  suggestionsEl = document.getElementById('suggestions') as HTMLDivElement;
  clockSection = document.getElementById('clock-section') as HTMLElement; // Note: updated from 'clock-view' to 'clock-section' to match new ID
  cityNameEl = document.getElementById('city-name') as HTMLElement;
  timeDisplayEl = document.getElementById('time-display') as HTMLElement;
  dateDisplayEl = document.getElementById('date-display') as HTMLElement;
  clearBtnEl = document.getElementById('clear-search') as HTMLButtonElement;
  searchContainer = document.querySelector('.search-container') as HTMLElement;
  ghostType = document.getElementById('ghost-type') as HTMLElement;
  loader = document.getElementById('loader') as HTMLElement;
  logo = document.querySelector('.logo') as HTMLElement;
  themeToggle = document.getElementById('theme-toggle-input') as HTMLInputElement;
  formatToggle = document.getElementById('format-toggle') as HTMLButtonElement;
  formatLabel = document.getElementById('format-label') as HTMLElement;

  // === EVENT LISTENERS ===

  // Lazy load the city data when the user focuses on the input
  inputEl?.addEventListener('focus', async () => {
    if (!cityTimezones && !isModuleLoading) {
      isModuleLoading = true;
      const originalPlaceholder = inputEl.placeholder;
      inputEl.placeholder = "Loading database...";
      try {
        const module = await import('city-timezones');
        cityTimezones = module.default || module;
        if (inputEl.value.trim().length >= 2) {
          inputEl.dispatchEvent(new Event('input'));
        }
      } catch (e) {
        console.error("Failed to load timezone data", e);
        showToast("Network error: Could not load city database.", "error");
      } finally {
        isModuleLoading = false;
        inputEl.placeholder = originalPlaceholder;
      }
    }
  });

  inputEl?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    const val = target.value.trim();
    
    if (val.length < 2) {
      toggleSearchDropdownUI(suggestionsEl, clearBtnEl, inputEl, val.length > 0, false);
      return;
    }
    
    if (isModuleLoading && !cityTimezones) {
      toggleSearchDropdownUI(suggestionsEl, clearBtnEl, inputEl, true, true);
      suggestionsEl.innerHTML = '<div class="py-suggestion-py px-suggestion-px text-text-dim text-no-results uppercase tracking-wide" role="option">Loading city database...</div>';
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

  inputEl?.addEventListener('keydown', (e) => {
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

  clearBtnEl?.addEventListener('click', () => {
    clearSearchUI(inputEl, clearBtnEl, suggestionsEl);
  });

  const closeSuggestions = (e: Event) => {
    if (!inputEl?.contains(e.target as Node) && !suggestionsEl?.contains(e.target as Node)) {
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

  initLoader(loader);
  animateLogo(logo);
  initInteractions(ghostType, searchContainer);
}
