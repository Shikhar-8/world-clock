/**
 * Renders the list of city suggestions into the dropdown DOM.
 * @param suggestionsEl The container for the dropdown items
 * @param cities The array of city objects to render
 * @param onSelect Callback when a city is selected via click
 * @param onHover Callback when a city is hovered to update active state
 */
export function renderSuggestions(
  suggestionsEl: HTMLElement, 
  cities: any[], 
  onSelect: (city: any) => void,
  onHover: (index: number) => void
): void {
  suggestionsEl.innerHTML = '';
  
  if (cities.length === 0) {
    suggestionsEl.innerHTML = '<div class="no-results" role="option">City or UTC offset not found.</div>';
    return;
  }
  
  cities.forEach((city: any, index: number) => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    
    const prov = city.province ? `${city.province}, ` : '';
    item.textContent = `${city.city}, ${prov}${city.country}`;
    
    item.setAttribute('role', 'option');
    item.id = `suggestion-${index}`;
    
    // Tactile/Magnetic interaction on desktop
    item.addEventListener('mouseenter', () => onHover(index));
    item.addEventListener('mouseleave', () => onHover(-1));
    item.addEventListener('mousedown', () => {
       item.style.transform = 'scale(0.95)';
    });
    
    item.addEventListener('click', () => onSelect(city));
    
    suggestionsEl.appendChild(item);
  });
}

/**
 * Updates the visual active state of the suggestion list and handles scrolling.
 * @param suggestionsEl The container for the dropdown items
 * @param inputEl The search input element to update aria-activedescendant
 * @param activeIndex The currently active index (or -1 to clear)
 */
export function updateActiveSuggestionUI(
  suggestionsEl: HTMLElement, 
  inputEl: HTMLInputElement, 
  activeIndex: number
): void {
  const items = suggestionsEl.querySelectorAll('.suggestion-item');
  items.forEach(el => el.classList.remove('active'));
  
  if (activeIndex >= 0 && activeIndex < items.length) {
    const activeItem = items[activeIndex] as HTMLElement;
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
  } else {
    inputEl.removeAttribute('aria-activedescendant');
  }
}

/**
 * Resets the search input and hides the dropdown and clear button.
 * @param inputEl The search input element
 * @param clearBtnEl The clear button element
 * @param suggestionsEl The suggestions dropdown container
 */
export function clearSearchUI(
  inputEl: HTMLInputElement, 
  clearBtnEl: HTMLElement, 
  suggestionsEl: HTMLElement
): void {
  inputEl.value = '';
  clearBtnEl.classList.add('hidden');
  suggestionsEl.classList.add('hidden');
  inputEl.setAttribute('aria-expanded', 'false');
  inputEl.focus();
}

/**
 * Toggles the visibility of the suggestions dropdown and clear button.
 * @param suggestionsEl The suggestions dropdown container
 * @param clearBtnEl The clear button element
 * @param inputEl The search input element
 * @param hasQuery True if the input has text
 * @param hasSuggestions True if there are suggestions to show
 */
export function toggleSearchDropdownUI(
  suggestionsEl: HTMLElement,
  clearBtnEl: HTMLElement,
  inputEl: HTMLInputElement,
  hasQuery: boolean,
  hasSuggestions: boolean
): void {
  if (hasQuery) {
    clearBtnEl.classList.remove('hidden');
  } else {
    clearBtnEl.classList.add('hidden');
  }
  
  if (hasSuggestions) {
    suggestionsEl.classList.remove('hidden');
    inputEl.setAttribute('aria-expanded', 'true');
  } else {
    suggestionsEl.classList.add('hidden');
    inputEl.setAttribute('aria-expanded', 'false');
  }
}
