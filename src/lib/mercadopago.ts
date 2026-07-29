import { MercadoPagoConfig, Preference, Payment, PaymentRefund } from "mercadopago";

export function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  }
  return new MercadoPagoConfig({ accessToken });
}

export function getPreferenceApi() {
  return new Preference(getMercadoPagoClient());
}

export function getPaymentApi() {
  return new Payment(getMercadoPagoClient());
}

export function getRefundApi() {
  return new PaymentRefund(getMercadoPagoClient());
}

export const MP_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || "";
