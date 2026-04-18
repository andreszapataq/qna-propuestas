import type { PaymentTermsKey } from "./types";

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export const fmt = (n: number): string => "$ " + n.toLocaleString("es-CO");

export const todayStr = (): string => {
  const d = new Date();
  return `Cali, ${d.getDate()} de ${MONTHS_ES[d.getMonth()]} de ${d.getFullYear()}`;
};

const PAYMENT_LABELS: Record<PaymentTermsKey, string> = {
  "30": "pago a 30 días del valor de la Orden",
  "60": "pago a 60 días del valor de la Orden",
  "90": "pago a 90 días del valor de la Orden",
  contado: "pago de contado",
};

export const ptLabel = (k: PaymentTermsKey): string =>
  PAYMENT_LABELS[k] ?? PAYMENT_LABELS["30"];

export const cleanFileName = (s: string): string =>
  (s || "")
    .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s]/g, "")
    .replace(/\s+/g, "_");

export const discountedPrice = (price: number, discount: number): number =>
  Math.round(price * (1 - discount / 100));
