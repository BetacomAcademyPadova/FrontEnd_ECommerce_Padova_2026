export interface PaymentIntentReq {
  idOrdine: number;
  salvaMetodo: boolean;
}

export interface PaymentIntentDTO {
  clientSecret: string;
  idPagamento: number;
}

export interface MetodoPagamentoDTO {
  idMetodo: number;
  tipo: string;
  dettagli: string;
}