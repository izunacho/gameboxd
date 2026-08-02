/** Is the app running as an installed PWA rather than a browser tab? */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari predates the standard display-mode check
    (navigator as any).standalone === true
  );
}
