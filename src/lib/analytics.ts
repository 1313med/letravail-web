type GtagEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params?: GtagEventParams) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params);
}

export function trackApplyClick(jobSlug: string, company: string) {
  trackEvent("apply_click", { job_slug: jobSlug, company });
}

export function trackJobView(jobSlug: string) {
  trackEvent("job_view", { job_slug: jobSlug });
}
