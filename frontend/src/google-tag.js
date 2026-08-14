const GOOGLE_TAG_SCRIPT_URL = "https://www.googletagmanager.com/gtag/js";

export function initializeGoogleTag(id) {
  const tagId = typeof id === "string" ? id.trim() : "";
  if (
    !tagId ||
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    return false;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", tagId);

  const script = document.createElement("script");
  script.async = true;
  script.src = `${GOOGLE_TAG_SCRIPT_URL}?id=${encodeURIComponent(tagId)}`;
  document.head.appendChild(script);
  return true;
}

export function trackGenerateLead() {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "generate_lead");
  }
}
