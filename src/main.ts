// Element References
const inputEl = document.getElementById('city-input') as HTMLInputElement;
const suggestionsEl = document.getElementById('suggestions') as HTMLDivElement;
const clockSection = document.getElementById('clock-view') as HTMLElement;
const cityNameEl = document.getElementById('city-name') as HTMLElement;
const timeDisplayEl = document.getElementById('time-display') as HTMLElement;
const dateDisplayEl = document.getElementById('date-display') as HTMLElement;
const clearBtnEl = document.getElementById('clear-search') as HTMLButtonElement;

let currentInterval: number | null = null;
let currentCity: any = null;
let cityTimezones: any = null;
let isModuleLoading = false;
let is24Hour = localStorage.getItem('timeFormat') === '24h';
let isLightMode = localStorage.getItem('theme') === 'light';
let selectedSuggestionIndex = -1;
let currentSuggestions: any[] = [];

const offsetCache = new Map<string, string>();
function getUtcOffset(timezone: string) {
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

// Search function
function findCities(query: string) {
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

function updateTime() {
  if (!currentCity) return;
  
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: currentCity.timezone,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: !is24Hour,
      timeZoneName: 'short'
    }).formatToParts(new Date());

    let hour = '', minute = '', second = '', dayPeriod = '', timeZoneName = '';
    for (const part of parts) {
      if (part.type === 'hour') hour = part.value;
      if (part.type === 'minute') minute = part.value;
      if (part.type === 'second') second = part.value;
      if (part.type === 'dayPeriod') dayPeriod = part.value;
      if (part.type === 'timeZoneName') timeZoneName = part.value;
    }

    const now = new Date();
    
    // Date Difference Logic
    const localDateStr = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric', month: '2-digit', day: '2-digit' // uses local timezone by default
    }).format(now);
    
    const cityDateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: currentCity.timezone,
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
      timeZone: currentCity.timezone,
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    }).format(now);

    timeDisplayEl.innerHTML = `${hour}<span class="accent">:</span>${minute}<span class="accent">:</span>${second} <span class="time-meta">${dayPeriod}</span>`;
    dateDisplayEl.innerHTML = `${dateStr}${dayIndicator}`.trim();
    cityNameEl.innerHTML = `${currentCity.city}, ${currentCity.country} &bull; ${timeZoneName}`;
  } catch (e) {
    console.error("Timezone error:", e);
  }
}

function selectCity(city: any) {
  currentCity = city;
  suggestionsEl.classList.add('hidden');
  inputEl.value = ''; 
  clearBtnEl.classList.add('hidden');
  inputEl.blur(); 
  
  if (currentInterval) {
    window.clearInterval(currentInterval);
  }
  
  clockSection.classList.remove('hidden');
  
  // Force reset and trigger dramatic spring animation
  const oldAnims = clockSection.getAnimations();
  oldAnims.forEach(anim => anim.cancel());

  clockSection.animate([
    { opacity: 0, transform: 'translateY(30px) scale(0.95)' },
    { opacity: 1, transform: 'translateY(0) scale(1)' }
  ], {
    duration: 800,
    easing: 'linear(0, 0.416 12.5%, 0.741 24.3%, 0.954 36.3%, 1.056 46.5%, 1.085 53.6%, 1.083 61.1%, 1.045 70%, 1.012 79.5%, 0.996 90.7%, 1)'
  });

  updateTime();
  currentInterval = window.setInterval(updateTime, 1000);
}

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
    }
  }
});

// Event Listeners
inputEl.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement;
  const val = target.value.trim();
  
  if (val.length > 0) {
    clearBtnEl.classList.remove('hidden');
  } else {
    clearBtnEl.classList.add('hidden');
  }
  
  if (val.length < 2) {
    suggestionsEl.classList.add('hidden');
    return;
  }
  
  const cities = findCities(val);
  
  if (cities.length === 0) {
    suggestionsEl.innerHTML = '<div class="no-results" role="option">City or UTC offset not found.</div>';
    suggestionsEl.classList.remove('hidden');
    inputEl.setAttribute('aria-expanded', 'true');
    currentSuggestions = [];
    return;
  }
  
  suggestionsEl.innerHTML = '';
  currentSuggestions = cities;
  selectedSuggestionIndex = -1;
  inputEl.setAttribute('aria-expanded', 'true');
  cities.forEach((city: any, index: number) => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    
    const prov = city.province ? `${city.province}, ` : '';
    item.textContent = `${city.city}, ${prov}${city.country}`;
    
    item.setAttribute('role', 'option');
    item.id = `suggestion-${index}`;
    
    // Tactile/Magnetic interaction on desktop
    item.addEventListener('mouseenter', () => {
      updateActiveSuggestion(index);
    });
    item.addEventListener('mouseleave', () => {
      if (selectedSuggestionIndex === index) {
        item.classList.remove('active');
        selectedSuggestionIndex = -1;
      }
    });
    item.addEventListener('mousedown', () => {
       item.style.transform = 'scale(0.95)';
    });
    
    item.addEventListener('click', () => {
      selectCity(city);
    });
    
    suggestionsEl.appendChild(item);
  });
  
  suggestionsEl.classList.remove('hidden');
});

function updateActiveSuggestion(index: number) {
  const items = suggestionsEl.querySelectorAll('.suggestion-item');
  items.forEach(el => el.classList.remove('active'));
  
  if (index >= 0 && index < items.length) {
    const activeItem = items[index] as HTMLElement;
    activeItem.classList.add('active');
    inputEl.setAttribute('aria-activedescendant', activeItem.id);
    // Scroll into view if needed
    const containerHeight = suggestionsEl.clientHeight;
    const itemTop = activeItem.offsetTop;
    const itemHeight = activeItem.offsetHeight;
    if (itemTop < suggestionsEl.scrollTop) {
      suggestionsEl.scrollTop = itemTop;
    } else if (itemTop + itemHeight > suggestionsEl.scrollTop + containerHeight) {
      suggestionsEl.scrollTop = itemTop + itemHeight - containerHeight;
    }
    selectedSuggestionIndex = index;
  } else {
    inputEl.removeAttribute('aria-activedescendant');
    selectedSuggestionIndex = -1;
  }
}

inputEl.addEventListener('keydown', (e) => {
  if (suggestionsEl.classList.contains('hidden')) return;
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (selectedSuggestionIndex < currentSuggestions.length - 1) {
      updateActiveSuggestion(selectedSuggestionIndex + 1);
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (selectedSuggestionIndex > 0) {
      updateActiveSuggestion(selectedSuggestionIndex - 1);
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < currentSuggestions.length) {
      selectCity(currentSuggestions[selectedSuggestionIndex]);
    } else if (currentSuggestions.length > 0) {
      selectCity(currentSuggestions[0]);
    }
  } else if (e.key === 'Escape') {
    suggestionsEl.classList.add('hidden');
    inputEl.setAttribute('aria-expanded', 'false');
  }
});

clearBtnEl.addEventListener('click', () => {
  inputEl.value = '';
  clearBtnEl.classList.add('hidden');
  suggestionsEl.classList.add('hidden');
  inputEl.setAttribute('aria-expanded', 'false');
  inputEl.focus();
});

// Hardware capability checks for motion
const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

const searchContainer = document.querySelector('.search-container') as HTMLElement;
const ghostType = document.getElementById('ghost-type') as HTMLElement;

if (!isReducedMotion && hasFinePointer) {
  // Global parallax for background ghost type
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30; // Max 15px shift
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    if (ghostType) {
      ghostType.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }
  });

  // Magnetic effect on search container
  searchContainer.addEventListener('mousemove', (e) => {
    const rect = searchContainer.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Subtle magnetic pull
    searchContainer.style.transform = `translate(${x * 0.03}px, ${y * 0.03}px)`;
  });

  searchContainer.addEventListener('mouseleave', () => {
    searchContainer.style.transform = 'translate(0, 0)';
  });
}

// Close suggestions on outside click or touch
const closeSuggestions = (e: Event) => {
  if (!inputEl.contains(e.target as Node) && !suggestionsEl.contains(e.target as Node)) {
    suggestionsEl.classList.add('hidden');
    inputEl.setAttribute('aria-expanded', 'false');
  }
};

document.addEventListener('click', closeSuggestions);
document.addEventListener('touchstart', closeSuggestions, { passive: true });

// Initial load animation for the header
window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  
  // Fade out branded loader
  if (loader) {
    setTimeout(() => {
      loader.animate([
        { opacity: 1 },
        { opacity: 0 }
      ], { duration: 300, easing: 'ease-out' }).onfinish = () => {
        loader.classList.add('loaded');
        loader.style.display = 'none';
      };
    }, 150);
  }

  const logo = document.querySelector('.logo');
  if (logo && !isReducedMotion) {
    logo.animate([
      { opacity: 0, transform: 'translateY(-10px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration: 500,
      delay: 300,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'both'
    });
  }

  // Initialize Theme and Format UI
  const themeToggle = document.getElementById('theme-toggle-input') as HTMLInputElement;
  const formatToggle = document.getElementById('format-toggle');

  if (isLightMode) {
    document.body.classList.add('light-mode');
    if (themeToggle) themeToggle.checked = true;
  }
  
  const formatLabel = document.getElementById('format-label');
  
  if (formatLabel) {
    formatLabel.textContent = is24Hour ? '24H' : '12H';
  }

  themeToggle?.addEventListener('change', () => {
    isLightMode = themeToggle.checked;
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
    document.body.classList.toggle('light-mode', isLightMode);
  });

  formatToggle?.addEventListener('click', () => {
    is24Hour = !is24Hour;
    localStorage.setItem('timeFormat', is24Hour ? '24h' : '12h');
    if (formatLabel) formatLabel.textContent = is24Hour ? '24H' : '12H';
    updateTime();
  });
});
