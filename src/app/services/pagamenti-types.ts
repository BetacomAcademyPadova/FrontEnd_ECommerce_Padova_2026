export interface PaymentIntentReq {
  idOrdine: number;
}

export interface PaymentIntentDTO {
  clientSecret: string;
  idPagamento: number;
}

export interface StripeConfigDTO {
  publishableKey: string;
}