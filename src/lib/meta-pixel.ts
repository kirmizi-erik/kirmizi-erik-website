declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackMetaEvent(event: string, params?: Record<string, unknown>) {
  window.fbq?.("track", event, params);
}

export function trackMetaLead(params?: Record<string, unknown>) {
  trackMetaEvent("Lead", params);
}
