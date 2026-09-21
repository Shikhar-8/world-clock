/**
 * Creates and animates a toast notification on the screen.
 * Automatically dismisses after the specified duration.
 * 
 * @param message The text message to display
 * @param type The visual style ('error' or 'info')
 * @param durationMs How long the toast stays on screen (default 4000ms)
 */
export function showToast(message: string, type: 'error' | 'info' = 'error', durationMs: number = 4000): void {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const baseToastClasses = 'bg-surface-primary text-text-primary px-[24px] py-[12px] rounded-[100px] font-base text-[0.875rem] font-medium tracking-wide shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-border-primary flex items-center gap-[10px] will-change-[transform,opacity]';
  const errorToastClasses = 'border-error/30 shadow-[0_8px_24px_theme(--color-error/8%),0_0_0_1px_theme(--color-error/10%)]';
  
  toast.className = `toast ${baseToastClasses} ${type === 'error' ? errorToastClasses : ''}`;

  const iconSvg = type === 'error' 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

  const iconColorClass = type === 'error' ? 'text-error' : '';

  toast.innerHTML = `
    <span class="flex items-center justify-center ${iconColorClass}">${iconSvg}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!isReducedMotion && typeof toast.animate === 'function') {
    // Spring physics animation in
    const animIn = toast.animate([
      { transform: 'translateY(-100px) scale(0.9)', opacity: 0 },
      { transform: 'translateY(0) scale(1)', opacity: 1 }
    ], {
      duration: 600,
      easing: 'linear(0, 0.416 12.5%, 0.741 24.3%, 0.954 36.3%, 1.056 46.5%, 1.085 53.6%, 1.083 61.1%, 1.045 70%, 1.012 79.5%, 0.996 90.7%, 1)',
      fill: 'forwards'
    });

    // Animate out after duration
    setTimeout(() => {
      const animOut = toast.animate([
        { transform: 'translateY(0) scale(1)', opacity: 1 },
        { transform: 'translateY(-20px) scale(0.95)', opacity: 0 }
      ], {
        duration: 300,
        easing: 'ease-in',
        fill: 'forwards'
      });
      animOut.onfinish = () => toast.remove();
    }, durationMs);

  } else {
    // Fallback for reduced motion or no WAAPI support
    setTimeout(() => {
      toast.remove();
    }, durationMs);
  }
}
