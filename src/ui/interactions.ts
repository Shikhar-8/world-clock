/**
 * Initializes the global parallax effect for the background ghost type
 * and the magnetic hover effect for the search container.
 * 
 * WHY: We use a magnetic hover effect to give the search bar a tactile, premium feel 
 * that responds physically to the cursor. However, we explicitly gate this behind 
 * `hasFinePointer` (to avoid attaching heavy mousemove listeners on touch devices 
 * where they are useless) and `!isReducedMotion` (to respect OS accessibility 
 * preferences for users with vestibular disorders).
 * 
 * @param ghostTypeEl The background ghost typography element
 * @param searchContainerEl The search input container element
 */
export function initInteractions(ghostTypeEl: HTMLElement | null, searchContainerEl: HTMLElement | null): void {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (!isReducedMotion && hasFinePointer) {
    if (ghostTypeEl) {
      document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 30; // Max 15px shift
        const y = (e.clientY / window.innerHeight - 0.5) * 30;
        ghostTypeEl.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      });
    }

    if (searchContainerEl) {
      searchContainerEl.addEventListener('mousemove', (e) => {
        const rect = searchContainerEl.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        searchContainerEl.style.transform = `translate(${x * 0.03}px, ${y * 0.03}px)`;
      });

      searchContainerEl.addEventListener('mouseleave', () => {
        searchContainerEl.style.transform = 'translate(0, 0)';
      });
    }
  }
}

/**
 * Initializes the branded initial loader fade out sequence.
 * @param loaderEl The full-screen loader element
 */
export function initLoader(loaderEl: HTMLElement | null): void {
  if (!loaderEl) return;
  
  setTimeout(() => {
    loaderEl.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], { duration: 300, easing: 'ease-out' }).onfinish = () => {
      loaderEl.classList.add('loaded');
      loaderEl.style.display = 'none';
    };
  }, 150);
}

/**
 * Animates the logo entry sequence.
 * @param logoEl The logo element
 */
export function animateLogo(logoEl: HTMLElement | null): void {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (logoEl && !isReducedMotion) {
    logoEl.animate([
      { opacity: 0, transform: 'translateY(-10px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration: 500,
      delay: 300,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'both'
    });
  }
}
