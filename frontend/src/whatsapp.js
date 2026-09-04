const WHATSAPP_PHONE_PATTERN = /^[0-9]{7,15}$/;

export function buildWhatsAppHref(phone, message) {
  if (!WHATSAPP_PHONE_PATTERN.test(phone)) {
    return "";
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
