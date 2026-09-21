import type { TimeData } from '../lib/time.ts';

/**
 * Updates the DOM elements with the calculated time data.
 * @param timeDisplayEl The container for the time digits
 * @param dateDisplayEl The container for the formatted date
 * @param cityNameEl The container for the city name and timezone
 * @param data The calculated TimeData object
 * @param city The original city object to display its name
 */
export function renderClock(
  timeDisplayEl: HTMLElement, 
  dateDisplayEl: HTMLElement, 
  cityNameEl: HTMLElement, 
  data: TimeData, 
  city: any
): void {
  timeDisplayEl.innerHTML = `${data.hour}<span class="text-text-dim font-bold [-webkit-text-fill-color:var(--color-text-dim)]">:</span>${data.minute}<span class="text-text-dim font-bold [-webkit-text-fill-color:var(--color-text-dim)]">:</span>${data.second} <span class="text-time-meta font-semibold text-text-dim tracking-none [-webkit-text-fill-color:var(--color-text-dim)]">${data.dayPeriod}</span>`;
  dateDisplayEl.innerHTML = `${data.dateStr}${data.dayIndicator}`.trim();
  cityNameEl.innerHTML = `${city.city}, ${city.country} &bull; ${data.timeZoneName}`;
}

/**
 * Removes the hidden class and triggers the entry animation for the clock section.
 * @param clockSection The main wrapper element for the clock view
 */
export function showClockSection(clockSection: HTMLElement): void {
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
}
