export interface PaymentIntentReq {
  idOrdine: number;
}

export interface PaymentIntentDTO {
  clientSecret: string;
  idPagamento: number;
  customerSessionClientSecret: string;
}

export interface StripeConfigDTO {
  publishableKey: string;
}