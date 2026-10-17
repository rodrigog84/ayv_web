export const WHATSAPP_NUMBER = "56965586116";
export const WHATSAPP_DISPLAY = "+56 9 6558 6116";
export const INSTAGRAM_URL = "https://www.instagram.com/ayvoutlet";

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function productInterestMessage(productName: string, productUrl?: string): string {
  const base = `Hola, me interesa el producto "${productName}" de A & V Outlet.`;
  if (productUrl) {
    return `${base} Link: ${productUrl}`;
  }
  return `${base} ¿Me pueden dar más información?`;
}

export function generalWhatsAppMessage(): string {
  return "Hola, me gustaría consultar por productos de A & V Outlet.";
}
